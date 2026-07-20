#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

function option(name) {
  const index = process.argv.indexOf(name);
  if (index < 0 || !process.argv[index + 1]) {
    throw new Error(`Missing required option: ${name}`);
  }
  return process.argv[index + 1];
}

function timestamp(seconds) {
  const milliseconds = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  const wholeSeconds = Math.floor((milliseconds % 60_000) / 1000);
  const remainder = milliseconds % 1000;
  return [hours, minutes, wholeSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":")
    .concat(",", String(remainder).padStart(3, "0"));
}

function wrap(text, maximum = 52) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maximum && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  if (lines.length <= 2) return lines.join("\n");
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")].join(
    "\n",
  );
}

const script = JSON.parse(await readFile(option("--script"), "utf8"));
const durations = (await readFile(option("--durations"), "utf8"))
  .trim()
  .split(/\r?\n/)
  .map(Number);
const output = option("--output");

if (script.length !== durations.length) {
  throw new Error(
    `Narration scenes (${script.length}) do not match durations (${durations.length})`,
  );
}

let sceneStart = 0;
let cueIndex = 1;
const blocks = [];

for (let sceneIndex = 0; sceneIndex < script.length; sceneIndex += 1) {
  const scene = script[sceneIndex];
  const duration = durations[sceneIndex];
  const speechDuration = Math.max(0.5, duration - 0.55);
  const weights = scene.captions.map(
    (caption) => Math.max(1, caption.split(/\s+/).length),
  );
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let cueStart = sceneStart;

  scene.captions.forEach((caption, index) => {
    const isLast = index === scene.captions.length - 1;
    const proportionalDuration = (speechDuration * weights[index]) / totalWeight;
    const cueEnd = isLast
      ? sceneStart + speechDuration
      : cueStart + proportionalDuration;
    blocks.push(
      [
        cueIndex,
        `${timestamp(cueStart)} --> ${timestamp(cueEnd)}`,
        wrap(caption),
      ].join("\n"),
    );
    cueIndex += 1;
    cueStart = cueEnd;
  });

  sceneStart += duration;
}

await writeFile(output, `${blocks.join("\n\n")}\n`);
console.log(
  JSON.stringify({
    event: "tendergraph.video_subtitles.generated",
    cues: cueIndex - 1,
    durationSeconds: Number(sceneStart.toFixed(3)),
    output,
  }),
);
