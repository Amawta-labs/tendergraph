import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const queryOutput = execFileSync("npm", ["query", "*", "--json"], {
  cwd: rootDir,
  encoding: "utf8",
});
const queriedPackages = JSON.parse(queryOutput);
const uniquePackages = new Map();

for (const packageRecord of queriedPackages) {
  if (!packageRecord.location) continue;
  const license = packageRecord.license ?? "UNKNOWN";
  const key = `${packageRecord.name}@${packageRecord.version}:${license}`;
  uniquePackages.set(key, {
    name: packageRecord.name,
    version: packageRecord.version,
    license,
  });
}

const packages = [...uniquePackages.values()].sort((left, right) =>
  `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`),
);
const unknown = packages.filter((packageRecord) => packageRecord.license === "UNKNOWN");
const lockfile = await readFile(path.join(rootDir, "package-lock.json"));
const inventory = {
  contract: "tendergraph-dependency-license-inventory.v1",
  source: "npm query * --json",
  packageLockSha256: createHash("sha256").update(lockfile).digest("hex"),
  packageCount: packages.length,
  unknownLicenseCount: unknown.length,
  packages,
};

const outputDir = path.join(rootDir, "artifacts", "compliance");
await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "dependency-licenses.json"),
  `${JSON.stringify(inventory, null, 2)}\n`,
);

console.log(
  JSON.stringify({
    packageCount: inventory.packageCount,
    unknownLicenseCount: inventory.unknownLicenseCount,
    output: "artifacts/compliance/dependency-licenses.json",
  }),
);
if (unknown.length) process.exitCode = 1;
