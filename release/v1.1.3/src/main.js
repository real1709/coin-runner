import {
  validateCharacterManifest,
  validateStageConfig,
  validateTelemetryEventShape
} from "./contracts.js";
import { characterManifest, stageConfig } from "./config/data.js";
import { createTelemetryClient } from "./telemetry.js";

const APP_VERSION = "v1.1.1";
const MISSION_SCORE_TARGET = 1200;
const MISSION_STAGE_TARGET = 2;

const sceneStart = document.getElementById("scene-start");
const sceneGame = document.getElementById("scene-game");
const sceneResult = document.getElementById("scene-result");

const characterList = document.getElementById("character-list");
const startButton = document.getElementById("start-button");
const retryButton = document.getElementById("retry-button");
const shareButton = document.getElementById("share-button");
const shareHint = document.getElementById("share-hint");
const skillButton = document.getElementById("skill-button");
const stageOverlay = document.getElementById("stage-overlay");

const hudCharacter = document.getElementById("hud-character");
const hudStage = document.getElementById("hud-stage");
const hudTime = document.getElementById("hud-time");
const hudScore = document.getElementById("hud-score");
const hudMission = document.getElementById("hud-mission");
const hudSkill = document.getElementById("hud-skill");

const resultTitle = document.getElementById("result-title");
const resultScore = document.getElementById("result-score");
const resultStage = document.getElementById("result-stage");
const resultMission = document.getElementById("result-mission");

const versionLabel = document.getElementById("app-version");
versionLabel.textContent = APP_VERSION;

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const telemetry = createTelemetryClient({ appVersion: APP_VERSION });

let characters = [];
let stages = [];
let selectedCharacterIndex = 0;
let shareVariant = "A";

const runtime = {
  running: false,
  runStartAt: 0,
  runEndedReason: "none",
  frameHandle: null,
  lastFrameTime: 0,
  stageIndex: 0,
  stageElapsed: 0,
  totalElapsed: 0,
  totalDuration: 0,
  score: 0,
  highestStage: 1,
  missionDone: false,
  obstacles: [],
  spawnIn: 1,
  spawnTimer: 0,
  jumpQueued: false,
  evadeQueued: false,
  skillCooldown: 0,
  rushTimer: 0,
  shieldTimer: 0,
  slowTimer: 0,
  blinkTimer: 0,
  player: {
    x: 78,
    y: 0,
    width: 44,
    height: 70,
    baseHeight: 70,
    crouchHeight: 42,
    vy: 0,
    onGround: true,
    crouchTimer: 0,
    evadeCooldown: 0
  }
};

const obstacleCatalog = {
  ice_crack: { width: 46, height: 24, color: "#4f84ad", lane: "ground" },
  small_block: { width: 40, height: 42, color: "#699ec5", lane: "ground" },
  cold_flag: { width: 54, height: 18, color: "#3a6f98", lane: "overhead" },
  ice_wall: { width: 48, height: 58, color: "#52789a", lane: "ground" },
  slope_hole: { width: 60, height: 28, color: "#466f90", lane: "ground" },
  drone_banner: { width: 64, height: 18, color: "#2f597f", lane: "overhead" },
  storm_gate: { width: 52, height: 66, color: "#395f81", lane: "ground" },
  moving_crate: { width: 44, height: 50, color: "#2f4c66", lane: "moving" },
  laser_sign: { width: 72, height: 16, color: "#c73f3f", lane: "overhead" }
};

function switchScene(target) {
  sceneStart.classList.remove("scene-active");
  sceneGame.classList.remove("scene-active");
  sceneResult.classList.remove("scene-active");
  target.classList.add("scene-active");
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function weightedPick(weights, allowedTypes) {
  let total = 0;
  for (const key of allowedTypes) {
    total += Number(weights[key] ?? 0);
  }

  let roll = Math.random() * total;
  for (const key of allowedTypes) {
    roll -= Number(weights[key] ?? 0);
    if (roll <= 0) {
      return key;
    }
  }
  return allowedTypes[0];
}

function emitTelemetry(type, payload = {}) {
  const event = telemetry.emit(type, payload);
  if (!validateTelemetryEventShape(event)) {
    console.warn("Telemetry shape mismatch", event);
  }
}

function describeCharacter(character) {
  const roleMap = {
    speed: "속도형",
    stable: "안정형",
    skill: "스킬형"
  };

  return `${roleMap[character.roleType] ?? "기본형"} | 속도 ${Math.round(character.baseSpeed)} / 점프 ${Math.round(character.jumpPower)}`;
}

function renderCharacterList() {
  characterList.innerHTML = "";

  characters.forEach((character, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "character-card";
    if (index === selectedCharacterIndex) {
      card.classList.add("selected");
    }

    const title = document.createElement("div");
    title.className = "character-title";
    title.innerHTML = `<span>${character.displayName}</span><span>${character.skillId}</span>`;

    const desc = document.createElement("div");
    desc.className = "character-desc";
    desc.textContent = describeCharacter(character);

    const unlock = document.createElement("div");
    unlock.className = "character-desc";
    unlock.textContent = `해금 조건: ${character.unlockCondition}`;

    card.append(title, desc, unlock);
    card.addEventListener("click", () => {
      selectedCharacterIndex = index;
      renderCharacterList();
    });

    characterList.append(card);
  });
}

function resetRunState() {
  runtime.running = true;
  runtime.runStartAt = performance.now();
  runtime.runEndedReason = "none";
  runtime.lastFrameTime = performance.now();
  runtime.stageIndex = 0;
  runtime.stageElapsed = 0;
  runtime.totalElapsed = 0;
  runtime.totalDuration = stages.reduce((acc, stage) => acc + stage.durationSec, 0);
  runtime.score = 0;
  runtime.highestStage = 1;
  runtime.missionDone = false;
  runtime.obstacles = [];
  runtime.spawnTimer = 0;
  runtime.spawnIn = randomRange(
    stages[0].spawnPattern.minGap,
    stages[0].spawnPattern.maxGap
  );
  runtime.jumpQueued = false;
  runtime.evadeQueued = false;
  runtime.skillCooldown = 0;
  runtime.rushTimer = 0;
  runtime.shieldTimer = 0;
  runtime.slowTimer = 0;
  runtime.blinkTimer = 0;

  const player = runtime.player;
  player.y = groundY() - player.baseHeight;
  player.height = player.baseHeight;
  player.vy = 0;
  player.onGround = true;
  player.crouchTimer = 0;
  player.evadeCooldown = 0;
}

function selectedCharacter() {
  return characters[selectedCharacterIndex];
}

function groundY() {
  return canvas.height - 84;
}

function queueJump() {
  runtime.jumpQueued = true;
}

function queueEvade() {
  runtime.evadeQueued = true;
}

function runSkill() {
  if (!runtime.running || runtime.skillCooldown > 0) {
    return;
  }

  const character = selectedCharacter();
  switch (character.skillId) {
    case "rush_boost":
      runtime.rushTimer = 2.6;
      break;
    case "safe_shield":
      runtime.shieldTimer = 3.0;
      break;
    case "time_slow":
      runtime.slowTimer = 3.0;
      break;
    default:
      runtime.rushTimer = 2.0;
      break;
  }

  runtime.skillCooldown = character.cooldownSec;
}

function applyShareVariant() {
  shareVariant = Math.random() < 0.5 ? "A" : "B";
  shareHint.textContent = `공유 버튼 A/B 테스트: Variant ${shareVariant}`;

  const actions = document.querySelector(".actions");
  actions.classList.remove("variant-b");
  shareButton.classList.remove("variant-b");
  if (shareVariant === "B") {
    actions.classList.add("variant-b");
    shareButton.classList.add("variant-b");
  }
}

function showOverlay(text, durationMs = 1500) {
  stageOverlay.textContent = text;
  stageOverlay.classList.remove("hidden");
  window.clearTimeout(showOverlay._timer);
  showOverlay._timer = window.setTimeout(() => {
    stageOverlay.classList.add("hidden");
  }, durationMs);
}

function stageByIndex(index) {
  return stages[Math.max(0, Math.min(index, stages.length - 1))];
}

function currentStage() {
  return stageByIndex(runtime.stageIndex);
}

function spawnObstacle() {
  const stage = currentStage();
  const obstacleType = weightedPick(
    stage.spawnPattern.weights,
    stage.obstacleSet
  );
  const base = obstacleCatalog[obstacleType];
  const baseY = groundY() - base.height;
  let y = baseY;

  if (base.lane === "overhead") {
    y = groundY() - 78;
  } else if (base.lane === "moving") {
    y = baseY - 14;
  }

  runtime.obstacles.push({
    type: obstacleType,
    x: canvas.width + randomRange(0, 60),
    y,
    width: base.width,
    height: base.height,
    color: base.color,
    lane: base.lane,
    passed: false,
    wobble: Math.random() * Math.PI * 2
  });
}

function updatePlayer(dt) {
  const player = runtime.player;

  if (player.evadeCooldown > 0) {
    player.evadeCooldown = Math.max(0, player.evadeCooldown - dt);
  }

  if (runtime.jumpQueued) {
    runtime.jumpQueued = false;
    if (player.onGround) {
      player.onGround = false;
      player.vy = -selectedCharacter().jumpPower;
      player.height = player.baseHeight;
      player.crouchTimer = 0;
    }
  }

  if (runtime.evadeQueued) {
    runtime.evadeQueued = false;
    if (player.onGround && player.evadeCooldown <= 0) {
      player.crouchTimer = 0.42;
      player.evadeCooldown = 0.62;
      runtime.blinkTimer = Math.max(runtime.blinkTimer, 0.24);
    }
  }

  if (!player.onGround) {
    player.vy += 1250 * dt;
    player.y += player.vy * dt;
    if (player.y >= groundY() - player.baseHeight) {
      player.y = groundY() - player.baseHeight;
      player.vy = 0;
      player.onGround = true;
    }
    return;
  }

  if (player.crouchTimer > 0) {
    player.crouchTimer = Math.max(0, player.crouchTimer - dt);
    player.height = player.crouchHeight;
  } else {
    player.height = player.baseHeight;
  }
  player.y = groundY() - player.height;
}

function playerRect() {
  const player = runtime.player;
  return {
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height
  };
}

function collide(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function endRun(reason) {
  runtime.running = false;
  runtime.runEndedReason = reason;
  if (runtime.frameHandle) {
    cancelAnimationFrame(runtime.frameHandle);
    runtime.frameHandle = null;
  }

  emitTelemetry("run_end", {
    characterId: selectedCharacter().id,
    stageId: runtime.highestStage,
    reason,
    score: Math.round(runtime.score),
    missionDone: runtime.missionDone
  });

  resultTitle.textContent = reason === "clear" ? "스테이지 완주 성공" : "런 종료";
  resultScore.textContent = String(Math.round(runtime.score));
  resultStage.textContent = String(runtime.highestStage);
  resultMission.textContent = runtime.missionDone ? "달성" : "미달성";
  switchScene(sceneResult);
  applyShareVariant();
}

function updateRun(dt) {
  const character = selectedCharacter();
  const stage = currentStage();

  runtime.totalElapsed += dt;
  runtime.stageElapsed += dt;
  runtime.skillCooldown = Math.max(0, runtime.skillCooldown - dt);
  runtime.rushTimer = Math.max(0, runtime.rushTimer - dt);
  runtime.shieldTimer = Math.max(0, runtime.shieldTimer - dt);
  runtime.slowTimer = Math.max(0, runtime.slowTimer - dt);
  runtime.blinkTimer = Math.max(0, runtime.blinkTimer - dt);

  updatePlayer(dt);

  runtime.spawnTimer += dt;
  if (runtime.spawnTimer >= runtime.spawnIn) {
    runtime.spawnTimer = 0;
    runtime.spawnIn = randomRange(stage.spawnPattern.minGap, stage.spawnPattern.maxGap);
    spawnObstacle();
  }

  const stageSpeedBonus = runtime.stageIndex * 22;
  const rushMultiplier = runtime.rushTimer > 0 ? 1.28 : 1;
  const slowMultiplier = runtime.slowTimer > 0 ? 0.68 : 1;
  const obstacleSpeed = (character.baseSpeed + stageSpeedBonus) * rushMultiplier * slowMultiplier;

  runtime.obstacles.forEach((obstacle) => {
    obstacle.x -= obstacleSpeed * dt;
    if (obstacle.lane === "moving") {
      obstacle.wobble += dt * 4;
      obstacle.y += Math.sin(obstacle.wobble) * 0.8;
    }

    if (!obstacle.passed && obstacle.x + obstacle.width < runtime.player.x) {
      obstacle.passed = true;
      runtime.score += 35;
    }
  });

  runtime.obstacles = runtime.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -4);
  runtime.score += dt * (10 + runtime.stageIndex * 4);

  const canTakeHit = runtime.shieldTimer <= 0 && runtime.blinkTimer <= 0;
  if (canTakeHit) {
    const pRect = playerRect();
    const hitObstacle = runtime.obstacles.find((obstacle) =>
      collide(pRect, {
        x: obstacle.x,
        y: obstacle.y,
        width: obstacle.width,
        height: obstacle.height
      })
    );

    if (hitObstacle) {
      emitTelemetry("hit_obstacle", {
        characterId: character.id,
        stageId: stage.stageId,
        obstacleType: hitObstacle.type,
        score: Math.round(runtime.score)
      });
      endRun("collision");
      return;
    }
  }

  runtime.highestStage = Math.max(runtime.highestStage, stage.stageId);
  runtime.missionDone =
    runtime.score >= MISSION_SCORE_TARGET && runtime.highestStage >= MISSION_STAGE_TARGET;

  if (runtime.stageElapsed >= stage.durationSec) {
    emitTelemetry("stage_clear", {
      characterId: character.id,
      stageId: stage.stageId,
      reward: stage.clearReward,
      score: Math.round(runtime.score)
    });

    showOverlay(`${character.quote}\nStage ${stage.stageId} Clear`, 1700);
    runtime.stageIndex += 1;
    runtime.stageElapsed = 0;
    runtime.obstacles = runtime.obstacles.filter((obstacle) => obstacle.x < runtime.player.x - 10);

    if (runtime.stageIndex >= stages.length) {
      endRun("clear");
      return;
    }

    const nextStage = currentStage();
    emitTelemetry("stage_start", {
      characterId: character.id,
      stageId: nextStage.stageId,
      difficultyTier: nextStage.difficultyTier
    });
  }
}

function renderBackground() {
  const gradients = [
    ["#98d6ff", "#ebf8ff"],
    ["#89c2f0", "#deefff"],
    ["#79abd4", "#d0e8fb"]
  ];
  const colors = gradients[Math.min(runtime.stageIndex, gradients.length - 1)];
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  for (let i = 0; i < 7; i += 1) {
    const x = (i * 95 - (runtime.totalElapsed * 35) % 95) - 50;
    const y = 80 + (i % 3) * 24;
    ctx.fillRect(x, y, 55, 10);
  }
}

function renderGround() {
  ctx.fillStyle = "#cfe8f7";
  ctx.fillRect(0, groundY(), canvas.width, canvas.height - groundY());
  ctx.fillStyle = "#8eb0c7";
  ctx.fillRect(0, groundY() + 8, canvas.width, 6);
}

function renderPlayer() {
  const player = runtime.player;
  ctx.fillStyle = runtime.shieldTimer > 0 ? "#ffd364" : "#243649";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(player.x + 8, player.y + 10, 8, 8);
  ctx.fillRect(player.x + 24, player.y + 10, 8, 8);

  if (runtime.blinkTimer > 0 || runtime.shieldTimer > 0) {
    ctx.strokeStyle = "rgba(255, 213, 128, 0.95)";
    ctx.lineWidth = 3;
    ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
  }
}

function renderObstacles() {
  runtime.obstacles.forEach((obstacle) => {
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    if (obstacle.type === "laser_sign") {
      ctx.fillStyle = "rgba(255, 110, 110, 0.72)";
      ctx.fillRect(obstacle.x, obstacle.y - 4, obstacle.width, 4);
    }
  });
}

function renderHud() {
  const stage = currentStage();
  const remain = Math.max(0, runtime.totalDuration - runtime.totalElapsed);
  const missionLabel = runtime.missionDone
    ? "완료"
    : `점수 ${MISSION_SCORE_TARGET}+ & Stage ${MISSION_STAGE_TARGET}`;

  hudCharacter.textContent = selectedCharacter().displayName;
  hudStage.textContent = String(stage.stageId);
  hudTime.textContent = String(Math.ceil(remain));
  hudScore.textContent = String(Math.round(runtime.score));
  hudMission.textContent = missionLabel;

  if (runtime.skillCooldown > 0) {
    hudSkill.textContent = `${runtime.skillCooldown.toFixed(1)}s`;
  } else {
    hudSkill.textContent = "준비됨";
  }
}

function frame(now) {
  if (!runtime.running) {
    return;
  }

  const dt = Math.min(0.05, (now - runtime.lastFrameTime) / 1000);
  runtime.lastFrameTime = now;

  updateRun(dt);
  renderBackground();
  renderGround();
  renderObstacles();
  renderPlayer();
  renderHud();

  runtime.frameHandle = requestAnimationFrame(frame);
}

function startRun() {
  resetRunState();
  switchScene(sceneGame);

  const character = selectedCharacter();
  emitTelemetry("session_start", {
    characterId: character.id,
    stageId: 1,
    campaign: "ip_marketing_demo"
  });
  emitTelemetry("stage_start", {
    characterId: character.id,
    stageId: 1,
    difficultyTier: "easy"
  });

  showOverlay(`${character.displayName} 출격!`, 1400);
  runtime.frameHandle = requestAnimationFrame(frame);
}

async function onShare() {
  const text = [
    `IP Stage Runner 데모 결과`,
    `점수 ${Math.round(runtime.score)}`,
    `도달 Stage ${runtime.highestStage}`,
    `Variant ${shareVariant}`
  ].join(" | ");

  let success = false;
  try {
    if (navigator.share) {
      await navigator.share({ text });
      success = true;
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      success = true;
      alert("결과 문구를 복사했습니다.");
    }
  } catch {
    success = false;
  }

  emitTelemetry("share_click", {
    characterId: selectedCharacter().id,
    stageId: runtime.highestStage,
    variant: shareVariant,
    success
  });
}

function bindInput() {
  startButton.addEventListener("click", startRun);
  retryButton.addEventListener("click", () => {
    emitTelemetry("retry_click", {
      characterId: selectedCharacter().id,
      stageId: runtime.highestStage,
      reason: runtime.runEndedReason
    });
    startRun();
  });
  shareButton.addEventListener("click", onShare);
  skillButton.addEventListener("click", runSkill);

  window.addEventListener("keydown", (event) => {
    if (!runtime.running) {
      return;
    }
    if (event.code === "Space") {
      event.preventDefault();
      queueJump();
    } else if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
      queueEvade();
    } else if (event.code === "KeyE") {
      runSkill();
    }
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (!runtime.running) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (x < rect.width / 2) {
      queueJump();
    } else {
      queueEvade();
    }
  });
}

async function init() {
  try {
    const loadedCharacters = JSON.parse(JSON.stringify(characterManifest));
    const loadedStages = JSON.parse(JSON.stringify(stageConfig));

    if (!loadedCharacters.every(validateCharacterManifest)) {
      throw new Error("CharacterManifest schema mismatch");
    }
    if (!loadedStages.every(validateStageConfig)) {
      throw new Error("StageConfig schema mismatch");
    }

    characters = loadedCharacters;
    stages = loadedStages;
    renderCharacterList();
    bindInput();
    switchScene(sceneStart);
  } catch (error) {
    sceneStart.innerHTML = `<section class="panel"><h2>초기화 실패</h2><p>${error.message}</p></section>`;
  }
}

init();
