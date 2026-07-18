#!/usr/bin/env node

import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

function parseArgs(argv) {
  const value = (flag, fallback) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : fallback;
  };
  return {
    url: value("--url", "http://127.0.0.1:3000"),
    outputDir: path.resolve(
      value("--output-dir", "/tmp/tendergraph-chat-first-capture"),
    ),
    pdfPath: path.resolve(
      value(
        "--pdf",
        "fixtures/public-snapshots/cl-5802381-7547UCUK/evaluation-report.pdf",
      ),
    ),
    timeoutMs: Number(value("--timeout-ms", "180000")),
  };
}

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function sha256(filename) {
  return createHash("sha256")
    .update(await readFile(filename))
    .digest("hex");
}

async function screenshot(page, outputDir, name) {
  const filename = path.join(outputDir, `${name}.png`);
  await page.screenshot({ path: filename, fullPage: false });
  return filename;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await rm(options.outputDir, { recursive: true, force: true });
  await mkdir(options.outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: options.outputDir,
      size: { width: 1920, height: 1080 },
    },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(options.timeoutMs);
  const video = page.video();
  const startedAt = Date.now();
  const markers = {};

  const mark = (name) => {
    markers[name] = Date.now() - startedAt;
  };

  try {
    await page.goto(`${options.url}/?submission=public`, {
      waitUntil: "networkidle",
    });
    await page.locator(".send-button").waitFor();
    await sleep(1200);
    mark("publicReady");
    await screenshot(page, options.outputDir, "public-chat-first");

    await page.locator(".claim-row").nth(1).click();
    await sleep(900);
    mark("evidenceOpened");
    await screenshot(page, options.outputDir, "public-evidence");

    await page
      .locator("select[aria-label='Analysis runtime']")
      .selectOption("codex");
    mark("codexRunStarted");
    const codexResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/codex-run") &&
        response.request().method() === "POST",
    );
    await page.locator(".send-button").click();
    await page.waitForFunction(
      () =>
        document.querySelector(".send-button")?.hasAttribute("disabled") ??
        false,
    );
    const codexResponse = await codexResponsePromise;
    await codexResponse.finished();
    const codexResult = await codexResponse.json();
    await page.waitForFunction(
      () =>
        !document.querySelector(".send-button")?.hasAttribute("disabled") &&
        [...document.querySelectorAll(".message-byline")].some((node) =>
          node.textContent?.includes("GPT-5.6 via Codex"),
        ),
    );
    mark("codexRunCompleted");
    await sleep(900);
    await page.getByRole("tab", { name: "Trace" }).click();
    await page.locator(".trace-session code").waitFor();
    await sleep(900);
    mark("traceOpened");
    await screenshot(page, options.outputDir, "codex-trace");

    await page.locator(".attach-button input").setInputFiles(options.pdfPath);
    await sleep(700);
    mark("documentAttached");
    await page.getByRole("button", { name: "Extract evidence" }).click();
    await page.getByRole("button", { name: "Analyze impact" }).waitFor();
    await page.getByRole("tab", { name: "Evidence" }).click();
    await page.locator(".file-event").waitFor();
    await sleep(900);
    mark("documentExtracted");
    await screenshot(page, options.outputDir, "document-ingestion");

    mark("publicImpactStarted");
    const [publicImpactResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/impact-discovery") &&
          response.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Analyze verified update" }).click(),
    ]);
    await publicImpactResponse.finished();
    const publicImpact = await publicImpactResponse.json();
    await page.locator(".impact-message").waitFor();
    await page.getByRole("tab", { name: "Changes" }).click();
    await sleep(900);
    mark("publicImpactCompleted");
    await screenshot(page, options.outputDir, "public-impact");

    await page.goto(
      `${options.url}/?case=cl-correction-demo&submission=public`,
      { waitUntil: "networkidle" },
    );
    await page.locator(".send-button").waitFor();
    await sleep(1000);
    mark("correctionReady");
    await page.getByRole("tab", { name: "Changes" }).click();
    await sleep(700);
    await screenshot(page, options.outputDir, "correction-diff");

    mark("correctionImpactStarted");
    const [correctionImpactResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/impact-discovery") &&
          response.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Analyze verified update" }).click(),
    ]);
    await correctionImpactResponse.finished();
    const correctionImpact = await correctionImpactResponse.json();
    await page.locator(".impact-message").waitFor();
    await page.getByRole("tab", { name: "Changes" }).click();
    await sleep(1100);
    mark("correctionImpactCompleted");
    await screenshot(page, options.outputDir, "correction-impact");

    if (codexResult.trace?.compositionSurface !== "codex") {
      throw new Error("Composition did not complete through Codex");
    }
    if (!codexResult.trace?.codexSessionId) {
      throw new Error("Composition response has no Codex Session ID");
    }
    if (publicImpact.compositionSurface !== "codex") {
      throw new Error("Public impact discovery did not complete through Codex");
    }
    if (publicImpact.items?.length !== 1) {
      throw new Error(
        `Expected one public corroboration, received ${publicImpact.items?.length ?? 0}`,
      );
    }
    if (correctionImpact.compositionSurface !== "codex") {
      throw new Error(
        "Correction impact discovery did not complete through Codex",
      );
    }
    if (correctionImpact.items?.length !== 2) {
      throw new Error(
        `Expected two correction proposals, received ${correctionImpact.items?.length ?? 0}`,
      );
    }

    mark("captureCompleted");
    await page.close();
    await context.close();
    const recordedPath = await video.path();
    const finalVideo = path.join(options.outputDir, "chat-first-system.webm");
    await copyFile(recordedPath, finalVideo);

    const manifest = {
      contract: "tendergraph-chat-first-capture.v2",
      capturedAt: new Date().toISOString(),
      url: `${options.url}/?submission=public`,
      presentation: "public_anonymized",
      viewport: { width: 1920, height: 1080 },
      markers,
      composition: {
        model: codexResult.trace.model,
        codexSessionId: codexResult.trace.codexSessionId,
        traceId: codexResult.trace.traceId,
        gatesPassed: codexResult.trace.validationResults.filter(
          (gate) => gate.passed,
        ).length,
        gatesTotal: codexResult.trace.validationResults.length,
      },
      publicImpact: {
        codexSessionId: publicImpact.codexSessionId,
        gatesPassed: publicImpact.validationResults.filter(
          (gate) => gate.passed,
        ).length,
        gatesTotal: publicImpact.validationResults.length,
        proposals: publicImpact.items.length,
      },
      correctionImpact: {
        codexSessionId: correctionImpact.codexSessionId,
        gatesPassed: correctionImpact.validationResults.filter(
          (gate) => gate.passed,
        ).length,
        gatesTotal: correctionImpact.validationResults.length,
        proposals: correctionImpact.items.length,
        exactReferenceAgreement:
          correctionImpact.referenceAgreement?.exact ?? false,
      },
      video: {
        path: path.basename(finalVideo),
        sha256: await sha256(finalVideo),
      },
    };
    await writeFile(
      path.join(options.outputDir, "capture.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    console.log(
      JSON.stringify({
        event: "tendergraph.chat_first_capture.completed",
        outputDir: options.outputDir,
        durationMs: markers.captureCompleted,
        compositionSessionId: manifest.composition.codexSessionId,
        publicImpactSessionId: manifest.publicImpact.codexSessionId,
        correctionImpactSessionId: manifest.correctionImpact.codexSessionId,
      }),
    );
  } finally {
    if (!page.isClosed()) await page.close().catch(() => {});
    await context.close().catch(() => {});
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
