import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateCharacterManifest,
  validateStageConfig,
  validateTelemetryEventShape
} from "../src/contracts.js";
import { characterManifest, stageConfig } from "../src/config/data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

async function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  return JSON.parse(await readFile(fullPath, "utf8"));
}

test("CharacterManifest contracts are valid", async () => {
  const characters = await readJson("src/config/characters.json");
  assert.equal(characters.length, 3);
  assert.ok(characters.every(validateCharacterManifest));
});

test("StageConfig contracts are valid", async () => {
  const stages = await readJson("src/config/stages.json");
  assert.equal(stages.length, 3);
  assert.ok(stages.every(validateStageConfig));
});

test("TelemetryEvent contract fields exist", () => {
  const sampleEvent = {
    eventType: "session_start",
    userId: "anon_1234",
    characterId: "speedster_penguin",
    stageId: 1,
    timestamp: "2026-06-01T01:00:00.000Z",
    appVersion: "v1.1"
  };
  assert.ok(validateTelemetryEventShape(sampleEvent));
});

test("Runtime config module also satisfies contracts", () => {
  assert.equal(characterManifest.length, 3);
  assert.equal(stageConfig.length, 3);
  assert.ok(characterManifest.every(validateCharacterManifest));
  assert.ok(stageConfig.every(validateStageConfig));
});
