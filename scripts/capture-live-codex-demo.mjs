#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";

function parseArgs(argv) {
  const value = (flag, fallback) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : fallback;
  };
  return {
    host: value("--host", "127.0.0.1"),
    port: Number(value("--port", "2828")),
    url: value("--url", "http://localhost:3000"),
    outputDir: path.resolve(value("--output-dir", "/tmp/tendergraph-live-capture")),
    intervalMs: Number(value("--interval-ms", "250")),
    timeoutMs: Number(value("--timeout-ms", "140000")),
    settleMs: Number(value("--settle-ms", "1500")),
  };
}

class MarionetteClient {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.buffer = Buffer.alloc(0);
    this.nextId = 1;
    this.pending = new Map();
    this.hello = null;
  }

  async connect() {
    this.socket = net.createConnection({ host: this.host, port: this.port });
    this.socket.on("data", (chunk) => this.onData(chunk));
    this.socket.on("error", (error) => this.rejectAll(error));
    await new Promise((resolve, reject) => {
      this.socket.once("connect", resolve);
      this.socket.once("error", reject);
    });
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Marionette handshake timed out")),
        5000,
      );
      this.onHello = (hello) => {
        clearTimeout(timeout);
        this.hello = hello;
        resolve();
      };
    });
  }

  onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (true) {
      const separator = this.buffer.indexOf(58);
      if (separator < 0) return;
      const length = Number(this.buffer.subarray(0, separator).toString("ascii"));
      if (!Number.isInteger(length)) {
        this.rejectAll(new Error("Invalid Marionette frame length"));
        return;
      }
      const frameEnd = separator + 1 + length;
      if (this.buffer.length < frameEnd) return;
      const message = JSON.parse(
        this.buffer.subarray(separator + 1, frameEnd).toString("utf8"),
      );
      this.buffer = this.buffer.subarray(frameEnd);
      this.onMessage(message);
    }
  }

  onMessage(message) {
    if (!Array.isArray(message)) {
      this.onHello?.(message);
      this.onHello = null;
      return;
    }
    if (message[0] !== 1) return;
    const [, id, error, result] = message;
    const pending = this.pending.get(id);
    if (!pending) return;
    this.pending.delete(id);
    if (error) {
      pending.reject(new Error(`${error.error ?? "Marionette error"}: ${error.message ?? ""}`));
    } else {
      pending.resolve(result);
    }
  }

  rejectAll(error) {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
  }

  command(name, parameters = {}) {
    const id = this.nextId++;
    const message = JSON.stringify([0, id, name, parameters]);
    this.socket.write(`${Buffer.byteLength(message)}:${message}`);
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  close() {
    this.socket?.end();
  }
}

function resultValue(result) {
  return result && typeof result === "object" && "value" in result
    ? result.value
    : result;
}

async function execute(client, script) {
  return resultValue(
    await client.command("WebDriver:ExecuteScript", {
      script,
      args: [],
    }),
  );
}

async function capture(client, outputDir, frameIndex) {
  const result = await client.command("WebDriver:TakeScreenshot", {
    full: false,
    highlights: [],
  });
  const base64 = resultValue(result);
  if (typeof base64 !== "string") throw new Error("Screenshot returned no image");
  const filename = `frame-${String(frameIndex).padStart(5, "0")}.png`;
  await writeFile(path.join(outputDir, filename), Buffer.from(base64, "base64"));
  return filename;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await mkdir(options.outputDir, { recursive: true });
  const client = new MarionetteClient(options.host, options.port);
  await client.connect();
  let frameIndex = 0;
  const startedAt = Date.now();
  try {
    await client.command("WebDriver:NewSession", {
      capabilities: { alwaysMatch: { acceptInsecureCerts: true } },
    });
    await client.command("WebDriver:SetWindowRect", {
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
    });
    await client.command("WebDriver:Navigate", { url: options.url });
    await execute(
      client,
      "return new Promise(resolve => { if (document.readyState === 'complete') return resolve(true); addEventListener('load', () => resolve(true), { once: true }); });",
    );
    const hydrationDeadline = Date.now() + 20000;
    let hydrated = false;
    while (Date.now() < hydrationDeadline && !hydrated) {
      hydrated = await execute(client, `
        const button = document.querySelector('.run-button');
        return Boolean(
          button && Object.keys(button).some(key => key.startsWith('__reactProps'))
        );
      `);
      if (!hydrated) await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!hydrated) throw new Error("Workbench did not hydrate before capture");
    await new Promise((resolve) => setTimeout(resolve, options.settleMs));
    await capture(client, options.outputDir, frameIndex++);
    let sawRunningState = false;
    for (let attempt = 0; attempt < 3 && !sawRunningState; attempt += 1) {
      const clicked = await execute(client, `
        const button = document.querySelector('.run-button');
        if (!button) return false;
        button.click();
        return true;
      `);
      if (!clicked) throw new Error("Run audit button was not found");
      await new Promise((resolve) => setTimeout(resolve, 400));
      sawRunningState = await execute(
        client,
        "return Boolean(document.querySelector('.run-button')?.disabled);",
      );
    }
    if (!sawRunningState) {
      throw new Error("Run audit button did not enter the running state");
    }

    let completed = false;
    let finishedState = null;
    while (Date.now() - startedAt < options.timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, options.intervalMs));
      const state = await execute(client, `
        const button = document.querySelector('.run-button');
        const session = [...document.querySelectorAll('.trace-meta span')]
          .find(node => node.textContent.includes('Codex session'))?.textContent ?? '';
        return {
          disabled: Boolean(button?.disabled),
          label: button?.textContent?.trim() ?? '',
          session,
          warning: document.querySelector('[role="status"]')?.textContent?.trim() ?? '',
          error: document.querySelector('.error-banner')?.textContent?.trim() ?? ''
        };
      `);
      sawRunningState ||= state.disabled;
      await capture(client, options.outputDir, frameIndex++);
      if (!state.disabled && sawRunningState) {
        completed = true;
        if (state.error) throw new Error(`Workbench error: ${state.error}`);
        if (state.warning) throw new Error(`Codex fell back: ${state.warning}`);
        if (!state.session) throw new Error("Completed run has no Codex session ID");
        finishedState = state;
        break;
      }
    }
    if (!completed) throw new Error("Live Codex run did not complete before timeout");

    await execute(
      client,
      "document.getElementById('trace')?.scrollIntoView({ block: 'center' }); return true;",
    );
    for (let index = 0; index < 12; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, options.intervalMs));
      await capture(client, options.outputDir, frameIndex++);
    }
    await writeFile(
      path.join(options.outputDir, "capture.json"),
      JSON.stringify(
        {
          contract: "tendergraph-live-browser-capture.v1",
          url: options.url,
          frames: frameIndex,
          intervalMs: options.intervalMs,
          sawRunningState,
          completed,
          codexSession: finishedState?.session ?? null,
          elapsedMs: Date.now() - startedAt,
        },
        null,
        2,
      ),
    );
    console.log(
      JSON.stringify({
        event: "tendergraph.capture.completed",
        outputDir: options.outputDir,
        frames: frameIndex,
        sawRunningState,
        elapsedMs: Date.now() - startedAt,
      }),
    );
  } finally {
    try {
      await client.command("WebDriver:DeleteSession");
    } catch {
      // The browser may already be closing.
    }
    client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
