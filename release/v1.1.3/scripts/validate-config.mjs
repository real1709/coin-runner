import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateCharacterManifest,
  validateStageConfig
} from "../src/contracts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const charactersPath = path.join(root, "src/config/characters.json");
const stagesPath = path.join(root, "src/config/stages.json");

const characters = JSON.parse(await readFile(charactersPath, "utf8"));
const stages = JSON.parse(await readFile(stagesPath, "utf8"));

const invalidCharacters = characters.filter(
  (character) => !validateCharacterManifest(character)
);
const invalidStages = stages.filter((stage) => !validateStageConfig(stage));

if (invalidCharacters.length || invalidStages.length) {
  console.error("Config validation failed");
  if (invalidCharacters.length) {
    console.error("Invalid characters:", invalidCharacters);
  }
  if (invalidStages.length) {
    console.error("Invalid stages:", invalidStages);
  }
  process.exit(1);
}

console.log("Config validation passed");
