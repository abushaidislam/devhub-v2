import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const packageJson = await readJson("package.json");
const releaseConfig = await readJson("release-please-config.json");
const manifest = await readJson(".release-please-manifest.json");
const rootConfig = releaseConfig.packages?.["."];

assert.match(packageJson.name, /^[a-z0-9][a-z0-9._-]*$/, "package name must be npm-safe");
assert.match(packageJson.version, /^\d+\.\d+\.\d+$/, "package version must be SemVer");
assert.equal(packageJson.private, true, "the application package must stay private");
assert.equal(packageJson.license, "MIT", "license metadata must remain explicit");
assert.ok(packageJson.description, "package description is required");
assert.ok(packageJson.homepage, "package homepage is required");
assert.ok(packageJson.repository?.url, "repository URL is required");
assert.ok(packageJson.bugs?.url, "issue tracker URL is required");
assert.equal(rootConfig?.["release-type"], "node", "root release must use the node strategy");
assert.equal(rootConfig?.["package-name"], packageJson.name, "release package name must match package.json");
assert.equal(manifest["."], packageJson.version, "release manifest and package.json versions must match");

console.log(`Release configuration is valid for ${packageJson.name}@${packageJson.version}.`);
