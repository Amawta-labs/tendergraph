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
    url: value("--url", "http://localhost:3000"),
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

  const beat = (milliseconds = 1300) => sleep(milliseconds);

  async function scrollInspector(position) {
    await page.locator(".inspector-body").evaluate((element, nextPosition) => {
      const top =
        nextPosition === "bottom"
          ? element.scrollHeight
          : nextPosition === "middle"
            ? element.scrollHeight / 2
            : 0;
      element.scrollTo({ top, behavior: "smooth" });
    }, position);
    await beat(1700);
  }

  try {
    await page.goto(`${options.url}/?submission=public`, {
      waitUntil: "networkidle",
    });
    await page.locator(".send-button").waitFor();
    await beat(1200);
    mark("publicReady");
    mark("problemSceneStart");
    await screenshot(page, options.outputDir, "public-chat-first");

    await page.locator(".claim-row").nth(0).click();
    await beat();
    await page.getByRole("button", { name: "Next evidence" }).click();
    await beat();
    await page.locator(".claim-row").nth(1).click();
    await beat();
    mark("evidenceOpened");
    await page.locator(".claim-row").nth(2).click();
    await beat();
    await page.getByRole("tab", { name: "Changes" }).click();
    await beat();
    await page.getByRole("tab", { name: "Evidence" }).click();
    await beat();
    mark("problemSceneEnd");

    mark("evidenceSceneStart");
    await page.getByRole("button", { name: "Next evidence" }).click();
    await beat();
    await page.getByRole("button", { name: "Next evidence" }).click();
    await beat();
    await page.getByRole("button", { name: "Next evidence" }).click();
    await beat();
    await page.getByRole("button", { name: "Next evidence" }).click();
    await beat();
    await page.getByRole("button", { name: "Previous evidence" }).click();
    await beat();
    await page.getByRole("button", { name: "Previous evidence" }).click();
    await beat();
    await page.locator(".claim-row").nth(1).click();
    await beat();
    await screenshot(page, options.outputDir, "public-evidence");
    mark("evidenceSceneEnd");

    await page
      .locator("select[aria-label='Analysis runtime']")
      .selectOption("codex");
    await beat(700);
    mark("codexSceneStart");
    mark("codexRunStarted");
    const composer = page.getByRole("textbox", {
      name: "Ask about this tender",
    });
    if ((await composer.inputValue()).trim().length < 3) {
      throw new Error("The composer has no runnable procurement question");
    }
    const codexResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/codex-run") &&
        response.request().method() === "POST",
      { timeout: 60000 },
    );
    await composer.press("Enter");
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
    await beat(1300);
    await page.getByRole("tab", { name: "Trace" }).click();
    await page.locator(".trace-session code").waitFor();
    await beat(1300);
    mark("traceOpened");
    await screenshot(page, options.outputDir, "codex-trace");
    await scrollInspector("bottom");
    await scrollInspector("top");
    mark("codexSceneEnd");

    mark("ingestionSceneStart");
    await page.locator(".attach-button input").setInputFiles(options.pdfPath);
    await beat(1400);
    mark("documentAttached");
    await page.getByRole("button", { name: "Extract evidence" }).click();
    await page.getByRole("button", { name: "Analyze impact" }).waitFor();
    await page.getByRole("tab", { name: "Evidence" }).click();
    await page.locator(".file-event").waitFor();
    await beat(1200);
    mark("documentExtracted");
    await screenshot(page, options.outputDir, "document-ingestion");
    await page.getByRole("button", { name: "Next evidence" }).click();
    await beat();
    await page.getByRole("button", { name: "Next evidence" }).click();
    await beat();

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
    await beat(1300);
    mark("publicImpactCompleted");
    await screenshot(page, options.outputDir, "public-impact");
    await scrollInspector("bottom");
    await page.getByRole("button", { name: "Inspect evidence" }).first().click();
    await beat();
    await page.getByRole("tab", { name: "Changes" }).click();
    await beat();
    mark("ingestionSceneEnd");

    mark("correctionSceneStart");
    await page.goto(
      `${options.url}/?case=cl-correction-demo&submission=public`,
      { waitUntil: "networkidle" },
    );
    await page.locator(".send-button").waitFor();
    await beat(1200);
    mark("correctionReady");
    await page.getByRole("tab", { name: "Changes" }).click();
    await beat(1200);
    await screenshot(page, options.outputDir, "correction-diff");
    await scrollInspector("middle");
    await page.getByRole("button", { name: "Inspect evidence" }).first().click();
    await beat();
    await page.getByRole("tab", { name: "Changes" }).click();
    await beat();

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
    await beat(1300);
    mark("correctionImpactCompleted");
    await screenshot(page, options.outputDir, "correction-impact");
    mark("correctionSceneEnd");

    mark("graphSceneStart");
    await page.getByRole("button", { name: "Inspect evidence" }).first().click();
    await beat();
    await page.getByRole("button", { name: "Next evidence" }).click();
    await beat();
    await page.getByRole("tab", { name: "Changes" }).click();
    await beat();
    await scrollInspector("bottom");
    const inspectButtons = page.getByRole("button", { name: "Inspect evidence" });
    if ((await inspectButtons.count()) > 1) {
      await inspectButtons.nth(1).click();
      await beat();
      await page.getByRole("tab", { name: "Changes" }).click();
      await beat();
    }
    await scrollInspector("top");
    mark("graphSceneEnd");

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
      contract: "tendergraph-chat-first-capture.v3",
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
