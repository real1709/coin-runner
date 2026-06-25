export const REQUIRED_CHARACTER_FIELDS = [
  "id",
  "displayName",
  "roleType",
  "baseSpeed",
  "jumpPower",
  "skillId",
  "cooldownSec",
  "unlockCondition"
];

export const REQUIRED_STAGE_FIELDS = [
  "stageId",
  "durationSec",
  "obstacleSet",
  "spawnPattern",
  "difficultyTier",
  "clearReward"
];

export const TELEMETRY_REQUIRED_FIELDS = [
  "eventType",
  "userId",
  "characterId",
  "stageId",
  "timestamp",
  "appVersion"
];

export function validateCharacterManifest(character) {
  return REQUIRED_CHARACTER_FIELDS.every((field) => field in character);
}

export function validateStageConfig(stage) {
  const hasTopLevel = REQUIRED_STAGE_FIELDS.every((field) => field in stage);
  const hasPattern =
    stage.spawnPattern &&
    typeof stage.spawnPattern.minGap === "number" &&
    typeof stage.spawnPattern.maxGap === "number" &&
    typeof stage.spawnPattern.weights === "object";

  return hasTopLevel && hasPattern;
}

export function validateTelemetryEventShape(event) {
  return TELEMETRY_REQUIRED_FIELDS.every((field) => field in event);
}
