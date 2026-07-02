(function () {
  "use strict";

  const APP_VERSION = "v1.1.4";
  const TITLE_BGM_SRC = "./assets/runner_game_title.mp3";
  const TITLE_BGM_VOLUME = 0.62;
  const TITLE_BGM_AUTO_UNMUTE_MAX_RETRIES = 120;
  const START_CLICK_SFX_SRC = "./assets/ui_click_store.wav";
  const START_CLICK_SFX_VOLUME = 0.9;
  const COUNTDOWN_SFX_SRC = "./assets/count_number.wav";
  const COUNTDOWN_SFX_VOLUME = 0.4;
  const GO_COUNTDOWN_SFX_SRC = "./assets/count_go.wav";
  const GO_COUNTDOWN_SFX_VOLUME = 0.4;
  const INGAME_BGM_SRC = "./assets/run_ingame.mp3?v=20260630_1158";
  const INGAME_BGM_VOLUME = 0.58;
  const INGAME_BGM_START_DELAY_MS = 140;
  const RESULT_BGM_SRC = "./assets/runner_end.mp3?v=20260702_1318";
  const RESULT_BGM_VOLUME = 0.62;
  const MOBILE_PERF_MODE =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
  const SIDE_PROP_SLOT_COUNT = MOBILE_PERF_MODE ? 0 : 3;
  const MAX_ACTIVE_COLLECTIBLES = MOBILE_PERF_MODE ? 6 : 18;
  const MAX_ACTIVE_POISON_SHOTS = MOBILE_PERF_MODE ? 3 : 12;
  const HUD_UPDATE_INTERVAL_SEC = MOBILE_PERF_MODE ? 0.12 : 0.05;
  const SPRITE_RENDER_MAX_DIM = MOBILE_PERF_MODE ? 420 : 900;
  const OBSTACLE_RENDER_SMOOTHING = MOBILE_PERF_MODE ? 18 : 0;
  const COLLECTIBLE_RENDER_SMOOTHING = MOBILE_PERF_MODE ? 20 : 0;
  const MISSION_SCORE_TARGET = 1200;
  const MISSION_DISTANCE_TARGET = 900;
  const MISSION_COLLECTIBLE_TARGET = 7;
  const COLLECTIBLE_BASE_SCORE = 110;
  const BOOSTER_BASE_SCORE = 360;
  const POWERUP_SPAWN_MIN_SEC = 2.2;
  const POWERUP_SPAWN_MAX_SEC = 12.4;
  const POWERUP_COOLDOWN_AFTER_USE_SEC = 20;
  const POWERUP_RESPAWN_RANDOM_MIN_SEC = 1.8;
  const POWERUP_RESPAWN_RANDOM_MAX_SEC = 6.2;
  const BOOSTER_DURATION_SEC = 5.5;
  const BOOSTER_SPEED_MULTIPLIER = 1.62;
  const DISTANCE_UNITS_PER_METER = 42;
  const SPEEDUP_TIME_STEP_SEC = 15;
  const SPEEDUP_BONUS_PER_STEP = 42;
  const SPEEDUP_MAX_BONUS = 360;
  const OBSTACLE_APPROACH_MULTIPLIER = 1.3;
  const APPROACH_MULTIPLIER_PER_LEVEL = 0.06;
  const APPROACH_MULTIPLIER_MAX_BONUS = 0.42;
  const ENEMY_SPAWN_LEAD_PER_TIER = 0.08;
  const ENEMY_SPAWN_LEAD_MAX = 0.42;
  const HIGH_TIER_ENEMY_WEIGHT_BONUS = 0.1;
  const MOLE_START_SPEED_TIER = 2;
  const MOLE_START_SPAWN_RATIO = 0.25;
  const MOLE_RATIO_DROP_PER_TIER = 0.02;
  const MOLE_MIN_SPAWN_RATIO = 0.08;
  const MOLE_VISIBLE_MIN_RATIO = 0.22;
  const MOLE_VISIBLE_MAX_RATIO = 0.67;
  const SURVIVAL_MAX = 100;
  const SURVIVAL_DECAY_PER_SEC = 8.6;
  const SURVIVAL_DECAY_PER_LEVEL = 0.7;
  const SURVIVAL_GAIN_PER_COIN = 5.2;
  const SURVIVAL_GAIN_PER_SIDE_INPUT = 1.0;
  const SURVIVAL_SIDE_GAIN_COOLDOWN_SEC = 0.15;
  const LANE_COUNT = 5;
  const LANE_SIDE_PADDING = 44;
  const HORIZON_Y = 118;
  const DEPTH_HARD_CULL = 1.5;
  const WORLD_PALETTES = [
    {
      skyTop: "#75dcff",
      skyBottom: "#d9f3ff",
      sun: "rgba(255, 230, 147, 0.78)",
      leftCity: "#f087b1",
      rightCity: "#ffb278",
      track: "#b8d6e4",
      laneTopA: "#7f7f91",
      laneTopB: "#9b9db0",
      rail: "#f8e6de",
      wire: "#5e4c4d"
    },
    {
      skyTop: "#8fd4ff",
      skyBottom: "#ecf8ff",
      sun: "rgba(255, 236, 170, 0.74)",
      leftCity: "#ffa6a2",
      rightCity: "#f9c77f",
      track: "#bedce8",
      laneTopA: "#7b828d",
      laneTopB: "#a0a5b4",
      rail: "#f5e8e0",
      wire: "#655955"
    },
    {
      skyTop: "#78bfff",
      skyBottom: "#d7f0ff",
      sun: "rgba(255, 228, 128, 0.76)",
      leftCity: "#ad8dff",
      rightCity: "#ff9d8d",
      track: "#abcad9",
      laneTopA: "#6d6f86",
      laneTopB: "#9499b0",
      rail: "#f3e5da",
      wire: "#4d4a60"
    },
    {
      skyTop: "#6fb8ff",
      skyBottom: "#cff2ff",
      sun: "rgba(255, 241, 157, 0.78)",
      leftCity: "#95c66d",
      rightCity: "#ff9780",
      track: "#b6d4e1",
      laneTopA: "#717385",
      laneTopB: "#9ea3b1",
      rail: "#f7ece4",
      wire: "#52546a"
    }
  ];

  // Replace these slots with your actual company IP names and image paths.
  const IP_THEME = {
    runner: {
      name: "회사IP_러너",
      color: "#22384d",
      imageSrc: "./assets/runner_run_01.png",
      frameImages: [
        "./assets/runner_run_03.png",
        "./assets/runner_run_02.png",
        "./assets/runner_run_05.png",
        "./assets/runner_run_06.png",
        "./assets/runner_run_07.png",
        "./assets/runner_run_01.png",
        "./assets/runner_run_04.png"
      ],
      fps: 11
    },
    holeEnemy: {
      name: "회사IP_녹색적",
      color: "#7a3f57",
      imageSrc: "./assets/enemy_green.png"
    },
    collectible: {
      name: "회사IP_수집캐릭터",
      color: "#f0b245",
      imageSrc: ""
    },
    booster: {
      name: "회사IP_무한부스터",
      color: "#ff4772",
      imageSrc: "./assets/booster_rocket.png"
    },
    moleObstacle: {
      name: "회사IP_두더지",
      color: "#a96532",
      imageSrc: "./assets/mole_pop.png"
    },
    movingEnemy: {
      name: "회사IP_이동적",
      color: "#27c8bd",
      imageSrc: "./assets/moving_enemy.png"
    },
    iceCrackObstacle: {
      name: "회사IP_얼음균열",
      color: "#4f84ad",
      imageSrc: "./assets/ice_crack.png?v=20260701_1502"
    },
    iceWallObstacle: {
      name: "회사IP_얼음벽",
      color: "#52789a",
      imageSrc: "./assets/ice_wall.png?v=20260701_1502"
    },
    ingameBackground: {
      name: "회사IP_인게임배경",
      color: "#bfe8ff",
      imageSrc: "./assets/ingame_background.png"
    },
    sideTree: {
      name: "좌우_나무장식",
      color: "#7cbf8b",
      imageSrc: "./assets/side_tree.png"
    },
    sideSign: {
      name: "좌우_표지판장식",
      color: "#d6b37a",
      imageSrc: "./assets/side_sign.png"
    },
    sideIgloo: {
      name: "좌우_이글루장식",
      color: "#9ac8f8",
      imageSrc: "./assets/side_igloo.png"
    },
    projectile: {
      name: "회사IP_응가투사체",
      color: "#b8792f",
      imageSrc: "./assets/poop_left.png"
    }
  };

  const RUNNER_POSE_CYCLE = [
    { x: -2.2, y: 0.42, rotation: -0.052, scaleX: 1.035, scaleY: 0.982, shadowW: 1.2, shadowH: 1.12, shadowAlpha: 0.34, footSide: -1, stepDust: 0.95 },
    { x: -1.1, y: -0.26, rotation: -0.028, scaleX: 1.012, scaleY: 0.998, shadowW: 1.06, shadowH: 1.02, shadowAlpha: 0.29, footSide: -0.8, stepDust: 0.36 },
    { x: -0.26, y: -0.96, rotation: -0.006, scaleX: 0.992, scaleY: 1.018, shadowW: 0.88, shadowH: 0.86, shadowAlpha: 0.22, footSide: -0.25, stepDust: 0.08 },
    { x: 0.62, y: -0.38, rotation: 0.018, scaleX: 1.005, scaleY: 1.006, shadowW: 0.98, shadowH: 0.96, shadowAlpha: 0.27, footSide: 0.45, stepDust: 0.28 },
    { x: 2.15, y: 0.42, rotation: 0.052, scaleX: 1.035, scaleY: 0.982, shadowW: 1.2, shadowH: 1.12, shadowAlpha: 0.34, footSide: 1, stepDust: 0.95 },
    { x: 1.08, y: -0.26, rotation: 0.027, scaleX: 1.012, scaleY: 0.998, shadowW: 1.06, shadowH: 1.02, shadowAlpha: 0.29, footSide: 0.78, stepDust: 0.36 },
    { x: 0.18, y: -0.9, rotation: 0.005, scaleX: 0.992, scaleY: 1.018, shadowW: 0.88, shadowH: 0.86, shadowAlpha: 0.23, footSide: 0.18, stepDust: 0.08 }
  ];

  const REQUIRED_CHARACTER_FIELDS = [
    "id",
    "displayName",
    "roleType",
    "baseSpeed",
    "jumpPower",
    "skillId",
    "cooldownSec",
    "unlockCondition"
  ];

  const REQUIRED_STAGE_FIELDS = [
    "stageId",
    "durationSec",
    "obstacleSet",
    "spawnPattern",
    "difficultyTier",
    "clearReward"
  ];

  const TELEMETRY_REQUIRED_FIELDS = [
    "eventType",
    "userId",
    "characterId",
    "stageId",
    "timestamp",
    "appVersion"
  ];

  const characterManifest = [
    {
      id: "ip_runner_swift",
      displayName: "IP 러너-스위프트",
      roleType: "speed",
      baseSpeed: 305,
      jumpPower: 540,
      skillId: "rush_boost",
      cooldownSec: 14,
      unlockCondition: "default",
      quote: "IP 러너 출격! 구멍 적을 피해서 돌파!"
    },
    {
      id: "ip_runner_guard",
      displayName: "IP 러너-가드",
      roleType: "stable",
      baseSpeed: 278,
      jumpPower: 565,
      skillId: "safe_shield",
      cooldownSec: 16,
      unlockCondition: "default",
      quote: "안정적으로 달리고 수집을 챙기자!"
    },
    {
      id: "ip_runner_spark",
      displayName: "IP 러너-스파크",
      roleType: "skill",
      baseSpeed: 290,
      jumpPower: 550,
      skillId: "time_slow",
      cooldownSec: 15,
      unlockCondition: "campaign_share_1",
      quote: "스킬 타이밍으로 하이라이트를 만들자!"
    }
  ];

  const stageConfig = [
    {
      stageId: 1,
      durationSec: 24,
      obstacleSet: ["hole_enemy", "ice_crack", "ice_wall"],
      spawnPattern: {
        minGap: 1.0,
        maxGap: 1.8,
        weights: {
          hole_enemy: 0.4,
          ice_crack: 0.35,
          ice_wall: 0.25
        }
      },
      difficultyTier: "easy",
      clearReward: "브랜드 스티커 1"
    },
    {
      stageId: 2,
      durationSec: 25,
      obstacleSet: ["hole_enemy", "ice_wall", "slope_hole"],
      spawnPattern: {
        minGap: 0.85,
        maxGap: 1.5,
        weights: {
          hole_enemy: 0.45,
          ice_wall: 0.3,
          slope_hole: 0.25
        }
      },
      difficultyTier: "normal",
      clearReward: "프로모션 쿠폰 조각"
    },
    {
      stageId: 3,
      durationSec: 26,
      obstacleSet: ["hole_enemy_fast", "moving_crate", "slope_hole"],
      spawnPattern: {
        minGap: 0.72,
        maxGap: 1.2,
        weights: {
          hole_enemy_fast: 0.48,
          moving_crate: 0.34,
          slope_hole: 0.2
        }
      },
      difficultyTier: "hard",
      clearReward: "한정 캐릭터 배지"
    }
  ];

  function validateCharacterManifest(character) {
    return REQUIRED_CHARACTER_FIELDS.every(function (field) {
      return field in character;
    });
  }

  function validateStageConfig(stage) {
    const hasTopLevel = REQUIRED_STAGE_FIELDS.every(function (field) {
      return field in stage;
    });
    const hasPattern =
      stage.spawnPattern &&
      typeof stage.spawnPattern.minGap === "number" &&
      typeof stage.spawnPattern.maxGap === "number" &&
      typeof stage.spawnPattern.weights === "object";
    return hasTopLevel && hasPattern;
  }

  function validateTelemetryEventShape(event) {
    return TELEMETRY_REQUIRED_FIELDS.every(function (field) {
      return field in event;
    });
  }

  const STORAGE_KEY = "ip_runner_telemetry_v1";
  const LEADERBOARD_KEY = "ip_runner_distance_leaderboard_v1";
  const USER_KEY = "ip_runner_anonymous_id";
  const NICKNAME_KEY = "ip_runner_player_nickname_v1";
  const TAUNT_KEY = "ip_runner_player_taunt_v1";
  let memoryAnonymousId = null;
  let memoryNickname = "";
  let memoryTaunt = "";
  let memoryQueue = [];
  let memoryLeaderboard = [];

  function canUseStorage() {
    try {
      const probeKey = "__ip_runner_probe__";
      localStorage.setItem(probeKey, "1");
      localStorage.removeItem(probeKey);
      return true;
    } catch (_err) {
      return false;
    }
  }

  const storageEnabled = canUseStorage();

  function sanitizeNickname(raw) {
    return String(raw || "")
      .replace(/\s+/g, " ")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, 12);
  }

  function sanitizeTaunt(raw) {
    return String(raw || "")
      .replace(/\s+/g, " ")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, 20);
  }

  function readPlayerNickname() {
    if (storageEnabled) {
      try {
        return sanitizeNickname(localStorage.getItem(NICKNAME_KEY) || "");
      } catch (_err) {
        // Fall through to memory nickname.
      }
    }
    return sanitizeNickname(memoryNickname);
  }

  function persistPlayerNickname(raw) {
    const safeNickname = sanitizeNickname(raw);
    if (storageEnabled) {
      try {
        if (safeNickname) {
          localStorage.setItem(NICKNAME_KEY, safeNickname);
        } else {
          localStorage.removeItem(NICKNAME_KEY);
        }
      } catch (_err) {
        // Fall through to memory nickname.
      }
    }
    memoryNickname = safeNickname;
    return safeNickname;
  }

  function readPlayerTaunt() {
    if (storageEnabled) {
      try {
        return sanitizeTaunt(localStorage.getItem(TAUNT_KEY) || "");
      } catch (_err) {
        // Fall through to memory taunt.
      }
    }
    return sanitizeTaunt(memoryTaunt);
  }

  function persistPlayerTaunt(raw) {
    const safeTaunt = sanitizeTaunt(raw);
    if (storageEnabled) {
      try {
        if (safeTaunt) {
          localStorage.setItem(TAUNT_KEY, safeTaunt);
        } else {
          localStorage.removeItem(TAUNT_KEY);
        }
      } catch (_err) {
        // Fall through to memory taunt.
      }
    }
    memoryTaunt = safeTaunt;
    return safeTaunt;
  }

  function getOrCreateAnonymousId() {
    if (storageEnabled) {
      try {
        const existing = localStorage.getItem(USER_KEY);
        if (existing) {
          return existing;
        }
        const generated = "anon_" + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(USER_KEY, generated);
        return generated;
      } catch (_err) {
        // Fallback to memory-only mode.
      }
    }

    if (memoryAnonymousId) {
      return memoryAnonymousId;
    }
    memoryAnonymousId = "anon_" + Math.random().toString(36).slice(2, 10);
    return memoryAnonymousId;
  }

  function createTelemetryClient() {
    const anonymousId = getOrCreateAnonymousId();
    let queue = [];
    let sessionIndex = 0;

    if (storageEnabled) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        queue = saved ? JSON.parse(saved) : [];
      } catch (_err) {
        queue = [];
      }
    } else {
      queue = memoryQueue.slice();
    }

    function persist() {
      if (storageEnabled) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.slice(-300)));
          return;
        } catch (_err) {
          // Fall through to memory persistence.
        }
      }
      memoryQueue = queue.slice(-300);
    }

    function emit(type, payload) {
      sessionIndex += 1;
      const safePayload = payload || {};
      const event = Object.assign(
        {
          eventType: type,
          userId: anonymousId,
          characterId: safePayload.characterId || "unknown",
          stageId: safePayload.stageId || null,
          timestamp: new Date().toISOString(),
          appVersion: APP_VERSION,
          sessionEventIndex: sessionIndex
        },
        safePayload
      );
      queue.push(event);
      persist();
      return event;
    }

    return {
      emit: emit,
      readRecent: function (limit) {
        return queue.slice(-(limit || 30));
      }
    };
  }

  function normalizeLeaderboard(entries) {
    if (!Array.isArray(entries)) {
      return [];
    }
    return entries
      .map(function (entry) {
        return {
          id: String(entry.id || ""),
          nickname: sanitizeNickname(entry.nickname || ""),
          taunt: sanitizeTaunt(entry.taunt || ""),
          distance: Math.max(0, Number(entry.distance) || 0),
          level: Math.max(1, Number(entry.level) || 1),
          timestamp: Number(entry.timestamp) || 0
        };
      })
      .filter(function (entry) {
        return entry.id && entry.distance >= 0;
      })
      .sort(function (a, b) {
        return b.distance - a.distance || b.level - a.level || a.timestamp - b.timestamp;
      });
  }

  function readLeaderboard() {
    if (storageEnabled) {
      try {
        return normalizeLeaderboard(JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]"));
      } catch (_err) {
        return [];
      }
    }
    return normalizeLeaderboard(memoryLeaderboard);
  }

  function persistLeaderboard(entries) {
    const trimmed = normalizeLeaderboard(entries).slice(0, 20);
    if (storageEnabled) {
      try {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
        return trimmed;
      } catch (_err) {
        // Fall through to memory persistence.
      }
    }
    memoryLeaderboard = trimmed;
    return trimmed;
  }

  function saveLeaderboardEntry(distance, level) {
    const entry = {
      id: "run_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      nickname: playerNickname || "플레이어",
      taunt: playerTaunt || "",
      distance: Math.round(distance),
      level: Math.max(1, Math.round(level)),
      timestamp: Date.now()
    };
    const leaderboard = persistLeaderboard(readLeaderboard().concat(entry));
    return {
      entry: entry,
      leaderboard: leaderboard,
      rank:
        leaderboard.findIndex(function (item) {
          return item.id === entry.id;
        }) + 1
    };
  }

  function renderResultRanking(leaderboard, currentEntryId) {
    if (!resultRanking) {
      return;
    }
    resultRanking.innerHTML = "";
    resultRanking.scrollTop = 0;
    let currentRunElement = null;

    leaderboard.forEach(function (entry, index) {
      const rank = index + 1;
      const item = document.createElement("li");
      if (entry.id === currentEntryId) {
        item.classList.add("current-run");
        currentRunElement = item;
      }

      const rankText = document.createElement("span");
      rankText.className = "rank-position";
      rankText.textContent = rank + "위";

      const mainText = document.createElement("div");
      mainText.className = "rank-main";

      const nicknameText = document.createElement("span");
      nicknameText.className = "rank-name";
      nicknameText.textContent = entry.nickname || "플레이어";

      const distanceText = document.createElement("strong");
      distanceText.textContent = entry.distance.toLocaleString("ko-KR") + "m";
      mainText.append(nicknameText, distanceText);

      const tauntWrap = document.createElement("div");
      tauntWrap.className = "rank-taunt";

      const tauntText = document.createElement("span");
      tauntText.className = "rank-taunt-text";
      tauntText.textContent = entry.taunt || "기록 깨고 한마디 남겨!";

      const tauntAuthor = document.createElement("span");
      tauntAuthor.className = "rank-taunt-author";
      tauntAuthor.textContent = "- " + (entry.nickname || "플레이어");

      tauntWrap.append(tauntText, tauntAuthor);
      item.append(rankText, mainText, tauntWrap);
      resultRanking.append(item);
    });

    if (currentRunElement && resultRanking.scrollHeight > resultRanking.clientHeight) {
      const centerOffset =
        currentRunElement.offsetTop -
        resultRanking.clientHeight * 0.5 +
        currentRunElement.offsetHeight * 0.5;
      resultRanking.scrollTop = Math.max(0, centerOffset);
    }
  }

  const sceneStart = document.getElementById("scene-start");
  const sceneGame = document.getElementById("scene-game");
  const sceneResult = document.getElementById("scene-result");
  const characterList = document.getElementById("character-list");
  const startButton = document.getElementById("start-button");
  const retryButton = document.getElementById("retry-button");
  const shareButton = document.getElementById("share-button");
  const shareHint = document.getElementById("share-hint");
  const skillButton = document.getElementById("skill-button");
  const moveLeftButton = document.getElementById("move-left-btn");
  const moveRightButton = document.getElementById("move-right-btn");
  const pauseToggleButton = document.getElementById("pause-toggle-btn");
  const stageOverlay = document.getElementById("stage-overlay");
  const nicknameModal = document.getElementById("nickname-modal");
  const nicknameForm = document.getElementById("nickname-form");
  const nicknameInput = document.getElementById("nickname-input");
  const nicknameError = document.getElementById("nickname-error");
  const resultTauntInput = document.getElementById("result-taunt-input");
  const resultTauntSaveButton = document.getElementById("result-taunt-save-button");
  const resultTauntHint = document.getElementById("result-taunt-hint");
  const hudCharacter = document.getElementById("hud-character");
  const hudStage = document.getElementById("hud-stage");
  const hudTime = document.getElementById("hud-time");
  const hudScore = document.getElementById("hud-score");
  const hudToken = document.getElementById("hud-token");
  const hudMission = document.getElementById("hud-mission");
  const hudSkill = document.getElementById("hud-skill");
  const survivalFill = document.getElementById("survival-fill");
  const survivalValue = document.getElementById("survival-value");
  const resultTitle = document.getElementById("result-title");
  const resultStage = document.getElementById("result-stage");
  const resultRanking = document.getElementById("result-ranking");
  const versionLabel = document.getElementById("app-version");
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const spritePool = {};
  const spriteMeta = {};
  const spriteRenderPool = {};
  let titleBgm = null;
  let startClickSfx = null;
  let countdownSfx = null;
  let goCountdownSfx = null;
  let ingameBgm = null;
  let resultBgm = null;
  let titleBgmUnlockBound = false;
  let titleBgmUnmuteTimer = null;
  let ingameBgmStartTimer = null;

  if (versionLabel) {
    versionLabel.textContent = APP_VERSION;
  }

  const telemetry = createTelemetryClient();

  let characters = [];
  let stages = [];
  let selectedCharacterIndex = 0;
  let shareVariant = "A";
  let countdownTimers = [];
  let playerNickname = readPlayerNickname();
  let playerTaunt = readPlayerTaunt();
  let latestResultEntryId = "";

  const runtime = {
    running: false,
    paused: false,
    countdownActive: false,
    runEndedReason: "none",
    frameHandle: null,
    lastFrameTime: 0,
    stageIndex: 0,
    totalElapsed: 0,
    score: 0,
    distanceMeters: 0,
    speedTier: 0,
    speedKmh: 0,
    survivalGauge: SURVIVAL_MAX,
    sideRecoverCooldown: 0,
    missionDone: false,
    obstacles: [],
    collectibles: [],
    poisonShots: [],
    spawnIn: 1,
    spawnTimer: 0,
    collectibleSpawnIn: 1.4,
    collectibleSpawnTimer: 0,
    collectedTokens: 0,
    boosterTimer: 0,
    boostersCollected: 0,
    powerupCooldownUntil: 0,
    powerupSpawnedTiers: {},
    powerupSpawnAtByTier: {},
    moveLeftQueued: false,
    moveRightQueued: false,
    skillCooldown: 0,
    rushTimer: 0,
    shieldTimer: 0,
    slowTimer: 0,
    blinkTimer: 0,
    scrollSpeedNorm: 0.26,
    sideObjectFlow: 0,
    player: {
      x: 78,
      y: 0,
      width: 44,
      height: 70,
      baseHeight: 70,
      animTime: 0,
      lean: 0,
      bob: 0
    },
    hudRefreshClock: 0,
    frameToken: 0
  };

  const obstacleCatalog = {
    hole_enemy: { width: 70, height: 68, color: "#6a3950", lane: "hole_pop" },
    hole_enemy_fast: {
      width: 74,
      height: 72,
      color: "#76334c",
      lane: "hole_pop"
    },
    ice_crack: {
      width: 100,
      height: 40,
      color: "#4f84ad",
      lane: "ground",
      groundOffsetRatio: 0.15,
      laneWidthRatio: 0.9,
      sizeScale: 1,
      heightScale: 1.5
    },
    ice_wall: {
      width: 58,
      height: 58,
      color: "#52789a",
      lane: "ground",
      groundOffsetRatio: 0.12,
      laneWidthRatio: 0.8,
      sizeScale: 1.2,
      heightScale: 1
    },
    slope_hole: { width: 128, height: 156, color: "#a96532", lane: "mole_pop", laneSpan: 2 },
    storm_gate: { width: 52, height: 66, color: "#395f81", lane: "ground" },
    moving_crate: { width: 70, height: 86, color: "#27c8bd", lane: "moving" },
    laser_sign: { width: 72, height: 16, color: "#c73f3f", lane: "overhead" }
  };

  const collectibleConfig = {
    width: 28,
    height: 28
  };

  function primeSprite(assetConfig, key) {
    if (!assetConfig.imageSrc || spritePool[key]) {
      return;
    }
    const image = new Image();
    if (
      key === "projectile" ||
      key === "booster" ||
      key === "holeEnemy" ||
      key === "moleObstacle" ||
      key === "movingEnemy" ||
      key === "iceCrackObstacle" ||
      key === "iceWallObstacle" ||
      key === "sideTree" ||
      key === "sideSign" ||
      key === "sideIgloo" ||
      key.indexOf("runnerFrame") === 0
    ) {
      image.addEventListener("load", function () {
        spriteMeta[key] = detectForegroundRect(image);
        delete spriteRenderPool[key];
      });
    }
    image.src = assetConfig.imageSrc;
    spritePool[key] = image;
  }

  function primeRunnerFrameSprites() {
    const frameImages = IP_THEME.runner.frameImages || [];
    frameImages.forEach(function (imageSrc, index) {
      primeSprite({ imageSrc: imageSrc }, "runnerFrame" + index);
    });
  }

  function isBackgroundLikePixel(r, g, b, a) {
    if (a < 12) {
      return true;
    }
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const darkBg = luma < 48 && saturation < 0.22;
    const lightBg = luma > 170 && saturation < 0.16;
    return darkBg || lightBg;
  }

  function detectForegroundRect(image) {
    if (!(image && image.naturalWidth > 0 && image.naturalHeight > 0)) {
      return null;
    }

    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(image, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const visited = new Uint8Array(width * height);
    const queue = [];

    function enqueue(x, y) {
      if (x < 0 || y < 0 || x >= width || y >= height) {
        return;
      }
      const idx = y * width + x;
      if (visited[idx]) {
        return;
      }
      const p = idx * 4;
      if (
        !isBackgroundLikePixel(
          pixels[p],
          pixels[p + 1],
          pixels[p + 2],
          pixels[p + 3]
        )
      ) {
        return;
      }
      visited[idx] = 1;
      queue.push(idx);
    }

    for (let x = 0; x < width; x += 1) {
      enqueue(x, 0);
      enqueue(x, height - 1);
    }
    for (let y = 0; y < height; y += 1) {
      enqueue(0, y);
      enqueue(width - 1, y);
    }

    for (let i = 0; i < queue.length; i += 1) {
      const idx = queue[i];
      const x = idx % width;
      const y = Math.floor(idx / width);
      enqueue(x + 1, y);
      enqueue(x - 1, y);
      enqueue(x, y + 1);
      enqueue(x, y - 1);
    }

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const idx = y * width + x;
        const p = idx * 4;
        if (pixels[p + 3] < 12 || visited[idx]) {
          continue;
        }
        if (x < minX) {
          minX = x;
        }
        if (y < minY) {
          minY = y;
        }
        if (x > maxX) {
          maxX = x;
        }
        if (y > maxY) {
          maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return null;
    }

    return {
      sx: minX,
      sy: minY,
      sw: maxX - minX + 1,
      sh: maxY - minY + 1
    };
  }

  function drawIpSprite(key, x, y, width, height, fallbackColor, fallbackLabel) {
    const image = spritePool[key];
    if (image && image.complete && image.naturalWidth > 0) {
      ctx.drawImage(image, x, y, width, height);
      return;
    }

    ctx.fillStyle = fallbackColor;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(fallbackLabel, x + width / 2, y + height / 2 + 4);
  }

  function drawCroppedSprite(key, x, y, width, height) {
    const image = spritePool[key];
    if (!(image && image.complete && image.naturalWidth > 0)) {
      return false;
    }
    const source = getSpriteRenderSource(key, image);
    if (!source) {
      return false;
    }
    ctx.drawImage(source.image, source.sx, source.sy, source.sw, source.sh, x, y, width, height);
    return true;
  }

  function getSpriteRenderSource(key, image) {
    const cached = spriteRenderPool[key];
    if (cached) {
      return cached;
    }
    const crop = spriteMeta[key];
    if (!crop) {
      return {
        image: image,
        sx: 0,
        sy: 0,
        sw: image.naturalWidth,
        sh: image.naturalHeight
      };
    }

    const sx = crop.sx;
    const sy = crop.sy;
    const sw = crop.sw;
    const sh = crop.sh;

    if (Math.max(sw, sh) <= SPRITE_RENDER_MAX_DIM) {
      const direct = { image: image, sx: sx, sy: sy, sw: sw, sh: sh };
      spriteRenderPool[key] = direct;
      return direct;
    }

    const scale = SPRITE_RENDER_MAX_DIM / Math.max(sw, sh);
    const targetW = Math.max(1, Math.round(sw * scale));
    const targetH = Math.max(1, Math.round(sh * scale));
    const renderCanvas = document.createElement("canvas");
    renderCanvas.width = targetW;
    renderCanvas.height = targetH;
    const renderCtx = renderCanvas.getContext("2d");
    if (!renderCtx) {
      const fallback = { image: image, sx: sx, sy: sy, sw: sw, sh: sh };
      spriteRenderPool[key] = fallback;
      return fallback;
    }
    renderCtx.imageSmoothingEnabled = true;
    renderCtx.drawImage(image, sx, sy, sw, sh, 0, 0, targetW, targetH);
    const downscaled = {
      image: renderCanvas,
      sx: 0,
      sy: 0,
      sw: targetW,
      sh: targetH
    };
    spriteRenderPool[key] = downscaled;
    return downscaled;
  }

  function isSpriteReady(key) {
    const image = spritePool[key];
    return !!(image && image.complete && image.naturalWidth > 0);
  }

  function drawCoverSprite(key, x, y, width, height) {
    const image = spritePool[key];
    if (!isSpriteReady(key)) {
      return false;
    }
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = width / height;
    let sx = 0;
    let sy = 0;
    let sw = image.naturalWidth;
    let sh = image.naturalHeight;

    if (imageRatio > targetRatio) {
      sw = image.naturalHeight * targetRatio;
      sx = (image.naturalWidth - sw) * 0.5;
    } else if (imageRatio < targetRatio) {
      sh = image.naturalWidth / targetRatio;
      sy = (image.naturalHeight - sh) * 0.5;
    }

    ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
    return true;
  }

  function runnerFrameState(player) {
    const frameImages = IP_THEME.runner.frameImages || [];
    const frameCount = Math.max(1, frameImages.length || 1);
    const fps = Math.max(1, IP_THEME.runner.fps || 8);
    const rawFrame = player.animTime * fps;
    const frameIndex = Math.floor(rawFrame) % frameCount;
    return {
      frameIndex,
      nextFrameIndex: (frameIndex + 1) % frameCount,
      mix: rawFrame - Math.floor(rawFrame),
      frameCount
    };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function getRunnerPose(player) {
    const state = runnerFrameState(player);
    const fallback = {
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      shadowW: 1,
      shadowH: 1,
      shadowAlpha: 0.28,
      footSide: 0,
      stepDust: 0
    };
    const current = RUNNER_POSE_CYCLE[state.frameIndex % RUNNER_POSE_CYCLE.length] || fallback;
    const next = RUNNER_POSE_CYCLE[state.nextFrameIndex % RUNNER_POSE_CYCLE.length] || current;
    const ease = state.mix * state.mix * (3 - 2 * state.mix);
    return {
      frameIndex: state.frameIndex,
      x: lerp(current.x, next.x, ease),
      y: lerp(current.y, next.y, ease),
      rotation: lerp(current.rotation, next.rotation, ease),
      scaleX: lerp(current.scaleX, next.scaleX, ease),
      scaleY: lerp(current.scaleY, next.scaleY, ease),
      shadowW: lerp(current.shadowW, next.shadowW, ease),
      shadowH: lerp(current.shadowH, next.shadowH, ease),
      shadowAlpha: lerp(current.shadowAlpha, next.shadowAlpha, ease),
      footSide: lerp(current.footSide || 0, next.footSide || 0, ease),
      stepDust: lerp(current.stepDust || 0, next.stepDust || 0, ease)
    };
  }

  function drawRunnerAnimated(player, pose, drawX, drawY, drawWidth, drawHeight) {
    const frameImages = IP_THEME.runner.frameImages || [];
    if (frameImages.length > 0) {
      return drawCroppedSprite(
        "runnerFrame" + (pose ? pose.frameIndex : runnerFrameState(player).frameIndex),
        drawX,
        drawY,
        drawWidth,
        drawHeight
      );
    }

    const sheet = spritePool.runner;
    if (!(sheet && sheet.complete && sheet.naturalWidth > 0)) {
      return false;
    }

    const cols = Math.max(1, IP_THEME.runner.spriteCols || 1);
    const rows = Math.max(1, IP_THEME.runner.spriteRows || 1);
    const frameCount = Math.max(1, IP_THEME.runner.frameCount || cols * rows);
    const fps = Math.max(1, IP_THEME.runner.fps || 10);
    const frameWidth = Math.floor(sheet.naturalWidth / cols);
    const frameHeight = Math.floor(sheet.naturalHeight / rows);
    const frameIndex = Math.floor(player.animTime * fps) % frameCount;
    const srcCol = frameIndex % cols;
    const srcRow = Math.floor(frameIndex / cols);
    const sx = srcCol * frameWidth;
    const sy = srcRow * frameHeight;

    ctx.drawImage(
      sheet,
      sx,
      sy,
      frameWidth,
      frameHeight,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );
    return true;
  }

  function drawRunnerStepEffect(player, pose) {
    if (!pose || pose.stepDust <= 0.05) {
      return;
    }

    const footSide = pose.footSide < 0 ? -1 : 1;
    const centerX = player.x + player.width * 0.5 + footSide * player.width * 0.19;
    const baseY = player.y + player.height * 0.94;
    const dust = Math.min(1, pose.stepDust);

    ctx.save();
    ctx.globalAlpha = 0.16 * dust;
    ctx.fillStyle = "#f4fbff";
    ctx.beginPath();
    ctx.ellipse(
      centerX - footSide * 7,
      baseY + 3,
      9 + dust * 4,
      2.5 + dust * 1.5,
      -footSide * 0.18,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.globalAlpha = 0.1 * dust;
    ctx.fillStyle = "#c8e8f4";
    ctx.beginPath();
    ctx.ellipse(
      centerX - footSide * 13,
      baseY + 7,
      5 + dust * 3,
      1.6 + dust,
      -footSide * 0.12,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  function drawBoosterAura(player, pose) {
    if (!isBoosterActive()) {
      return;
    }

    const pulse = 0.5 + Math.sin(runtime.totalElapsed * 18) * 0.5;
    const centerX = player.x + player.width * 0.5 + (pose ? pose.x * 0.35 : 0);
    const centerY = player.y + player.height * 0.52;

    ctx.save();
    ctx.strokeStyle = "rgba(80, 235, 255, " + (0.34 + pulse * 0.18).toFixed(3) + ")";
    ctx.lineWidth = 2.2 + pulse * 1.2;
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY,
      player.width * (0.78 + pulse * 0.08),
      player.height * (0.58 + pulse * 0.05),
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 244, 137, 0.34)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i += 1) {
      const y = player.y + player.height * (0.38 + i * 0.18);
      ctx.beginPath();
      ctx.moveTo(centerX - player.width * (0.95 + i * 0.2), y + pulse * 3);
      ctx.lineTo(centerX - player.width * (0.35 + i * 0.08), y - 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  function ensureTitleBgm() {
    if (titleBgm) {
      return titleBgm;
    }
    const audio = new Audio(TITLE_BGM_SRC);
    audio.loop = true;
    audio.autoplay = true;
    audio.preload = "auto";
    audio.muted = false;
    audio.defaultMuted = false;
    audio.volume = TITLE_BGM_VOLUME;
    audio.setAttribute("playsinline", "true");
    titleBgm = audio;
    return titleBgm;
  }

  function ensureStartClickSfx() {
    if (startClickSfx) {
      return startClickSfx;
    }
    const audio = new Audio(START_CLICK_SFX_SRC);
    audio.preload = "auto";
    audio.volume = START_CLICK_SFX_VOLUME;
    audio.setAttribute("playsinline", "true");
    startClickSfx = audio;
    return startClickSfx;
  }

  function playStartClickSfx() {
    const audio = ensureStartClickSfx();
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch (_err) {
      // Ignore seeks before metadata is loaded.
    }
    audio.volume = START_CLICK_SFX_VOLUME;
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        // Ignore audio playback rejections.
      });
    }
  }

  function ensureCountdownSfx() {
    if (countdownSfx) {
      return countdownSfx;
    }
    const audio = new Audio(COUNTDOWN_SFX_SRC);
    audio.preload = "auto";
    audio.volume = COUNTDOWN_SFX_VOLUME;
    audio.setAttribute("playsinline", "true");
    countdownSfx = audio;
    return countdownSfx;
  }

  function playCountdownSfx() {
    const audio = ensureCountdownSfx();
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch (_err) {
      // Ignore seeks before metadata is loaded.
    }
    audio.volume = COUNTDOWN_SFX_VOLUME;
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        // Ignore audio playback rejections.
      });
    }
  }

  function ensureGoCountdownSfx() {
    if (goCountdownSfx) {
      return goCountdownSfx;
    }
    const audio = new Audio(GO_COUNTDOWN_SFX_SRC);
    audio.preload = "auto";
    audio.volume = GO_COUNTDOWN_SFX_VOLUME;
    audio.setAttribute("playsinline", "true");
    goCountdownSfx = audio;
    return goCountdownSfx;
  }

  function ensureIngameBgm() {
    if (ingameBgm) {
      return ingameBgm;
    }
    const audio = new Audio(INGAME_BGM_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = INGAME_BGM_VOLUME;
    audio.setAttribute("playsinline", "true");
    ingameBgm = audio;
    return ingameBgm;
  }

  function ensureResultBgm() {
    if (resultBgm) {
      return resultBgm;
    }
    const audio = new Audio(RESULT_BGM_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = RESULT_BGM_VOLUME;
    audio.setAttribute("playsinline", "true");
    resultBgm = audio;
    return resultBgm;
  }

  function playGoCountdownSfx() {
    const audio = ensureGoCountdownSfx();
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch (_err) {
      // Ignore seeks before metadata is loaded.
    }
    audio.volume = GO_COUNTDOWN_SFX_VOLUME;
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        // Ignore audio playback rejections.
      });
    }
  }

  function clearIngameBgmStartTimer() {
    if (ingameBgmStartTimer) {
      window.clearTimeout(ingameBgmStartTimer);
      ingameBgmStartTimer = null;
    }
  }

  function playIngameBgm(resetPosition) {
    clearIngameBgmStartTimer();
    const audio = ensureIngameBgm();
    if (resetPosition) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch (_err) {
        // Ignore seeks before metadata is loaded.
      }
    }
    audio.volume = INGAME_BGM_VOLUME;
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        // Ignore audio playback rejections.
      });
    }
  }

  function stopIngameBgm(resetPosition) {
    clearIngameBgmStartTimer();
    if (!ingameBgm) {
      return;
    }
    ingameBgm.pause();
    if (resetPosition) {
      try {
        ingameBgm.currentTime = 0;
      } catch (_err) {
        // Ignore seeks before metadata is loaded.
      }
    }
  }

  function playResultBgm(resetPosition) {
    const audio = ensureResultBgm();
    if (resetPosition) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch (_err) {
        // Ignore seeks before metadata is loaded.
      }
    }
    audio.volume = RESULT_BGM_VOLUME;
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        // Ignore audio playback rejections.
      });
    }
  }

  function stopResultBgm(resetPosition) {
    if (!resultBgm) {
      return;
    }
    resultBgm.pause();
    if (resetPosition) {
      try {
        resultBgm.currentTime = 0;
      } catch (_err) {
        // Ignore seeks before metadata is loaded.
      }
    }
  }

  function queueIngameBgmAfterGo() {
    clearIngameBgmStartTimer();
    ingameBgmStartTimer = window.setTimeout(function () {
      if (!runtime.running || runtime.countdownActive) {
        return;
      }
      playIngameBgm(false);
    }, INGAME_BGM_START_DELAY_MS);
  }

  function clearTitleBgmUnmuteTimer() {
    if (titleBgmUnmuteTimer) {
      window.clearTimeout(titleBgmUnmuteTimer);
      titleBgmUnmuteTimer = null;
    }
  }

  function queueTitleBgmAutoUnmute(retryCount) {
    clearTitleBgmUnmuteTimer();
    titleBgmUnmuteTimer = window.setTimeout(function () {
      const audio = ensureTitleBgm();
      const isStartSceneActive =
        sceneStart && sceneStart.classList.contains("scene-active");
      if (!isStartSceneActive) {
        return;
      }
      audio.muted = false;
      audio.volume = TITLE_BGM_VOLUME;
      if (!audio.paused) {
        return;
      }
      const audibleAttempt = audio.play();
      if (audibleAttempt && typeof audibleAttempt.catch === "function") {
        audibleAttempt.catch(function () {
          audio.muted = true;
          if (retryCount < TITLE_BGM_AUTO_UNMUTE_MAX_RETRIES) {
            queueTitleBgmAutoUnmute(retryCount + 1);
          } else {
            bindTitleBgmUnlock();
          }
        });
      }
    }, 280 + retryCount * 140);
  }

  function bindTitleBgmUnlock() {
    if (titleBgmUnlockBound) {
      return;
    }
    titleBgmUnlockBound = true;
    const unlock = function () {
      const audio = ensureTitleBgm();
      audio.muted = false;
      const playAttempt = audio.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(function () {
          // Ignore; next interaction can retry.
        });
      }
      clearTitleBgmUnmuteTimer();
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      titleBgmUnlockBound = false;
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
  }

  function playTitleBgm(resetPosition) {
    const audio = ensureTitleBgm();
    if (resetPosition) {
      try {
        audio.currentTime = 0;
      } catch (_err) {
        // Ignore seeks before metadata is loaded.
      }
    }
    audio.volume = TITLE_BGM_VOLUME;
    audio.muted = false;
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        // Fall back to muted autoplay, then keep trying to enable audible playback.
        audio.muted = true;
        const mutedAttempt = audio.play();
        if (mutedAttempt && typeof mutedAttempt.catch === "function") {
          mutedAttempt.catch(function () {
            bindTitleBgmUnlock();
          });
        }
      });
    }
    queueTitleBgmAutoUnmute(0);
  }

  function stopTitleBgm(resetPosition) {
    if (!titleBgm) {
      return;
    }
    clearTitleBgmUnmuteTimer();
    titleBgm.pause();
    if (resetPosition) {
      try {
        titleBgm.currentTime = 0;
      } catch (_err) {
        // Ignore seeks before metadata is loaded.
      }
    }
  }

  function switchScene(target) {
    sceneStart.classList.remove("scene-active");
    sceneGame.classList.remove("scene-active");
    sceneResult.classList.remove("scene-active");
    target.classList.add("scene-active");
    if (target === sceneStart) {
      stopIngameBgm(true);
      stopResultBgm(true);
      playTitleBgm(true);
    } else if (target === sceneGame) {
      stopTitleBgm(false);
      stopResultBgm(true);
    } else {
      stopTitleBgm(false);
      stopIngameBgm(true);
      playResultBgm(true);
    }
  }

  function cancelFrameLoop() {
    if (runtime.frameHandle !== null) {
      cancelAnimationFrame(runtime.frameHandle);
      runtime.frameHandle = null;
    }
  }

  function hideOverlay() {
    window.clearTimeout(showOverlay._timer);
    stageOverlay.classList.add("hidden");
    stageOverlay.classList.remove("overlay-top");
    stageOverlay.classList.remove("overlay-countdown");
  }

  function cancelCountdown(hideCurrentOverlay) {
    countdownTimers.forEach(function (timerId) {
      window.clearTimeout(timerId);
    });
    countdownTimers = [];
    runtime.countdownActive = false;
    if (hideCurrentOverlay) {
      hideOverlay();
    }
  }

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function weightedPick(weights, allowedTypes) {
    let total = 0;
    allowedTypes.forEach(function (key) {
      total += Number(weights[key] || 0);
    });
    let roll = Math.random() * total;
    for (let i = 0; i < allowedTypes.length; i += 1) {
      const key = allowedTypes[i];
      roll -= Number(weights[key] || 0);
      if (roll <= 0) {
        return key;
      }
    }
    return allowedTypes[0];
  }

  function emitTelemetry(type, payload) {
    const event = telemetry.emit(type, payload || {});
    if (!validateTelemetryEventShape(event)) {
      console.warn("Telemetry shape mismatch", event);
    }
  }

  function selectedCharacter() {
    return characters[selectedCharacterIndex];
  }

  function nearPlaneY() {
    return canvas.height - 92;
  }

  function playerBaseY() {
    return nearPlaneY() - 16;
  }

  function speedFeel() {
    return Math.min(
      1,
      0.12 + runtime.scrollSpeedNorm * 4.4 + Math.min(runtime.speedTier, 14) * 0.045
    );
  }

  function runnerTempo() {
    const tierBoost = Math.min(0.42, Math.max(0, runtime.speedTier) * 0.026);
    const speedBoost = Math.min(0.22, Math.max(0, runtime.scrollSpeedNorm - 0.24) * 1.2);
    return 0.92 + tierBoost + speedBoost;
  }

  function roadGeometry() {
    if (isSpriteReady("ingameBackground")) {
      const centerX = canvas.width * 0.5;
      const topHalfWidth = canvas.width * 0.059;
      return {
        topY: Math.round(canvas.height * 0.22),
        topLeft: centerX - topHalfWidth,
        topRight: centerX + topHalfWidth,
        bottomLeft: 0,
        bottomRight: canvas.width,
        bottomY: nearPlaneY() + 22
      };
    }
    return {
      topY: HORIZON_Y,
      topLeft: canvas.width * 0.5 - 34,
      topRight: canvas.width * 0.5 + 34,
      bottomLeft: 0,
      bottomRight: canvas.width,
      bottomY: nearPlaneY() + 22
    };
  }

  function roadHorizonY() {
    const geometry = roadGeometry();
    return Number.isFinite(geometry.topY) ? geometry.topY : HORIZON_Y;
  }

  function projectDepthY(depth) {
    const horizonY = roadHorizonY();
    const clampedDepth = Math.max(0, Math.min(1, depth));
    if (depth < 0) {
      // Keep freshly spawned objects on the road horizon instead of the sky.
      return horizonY;
    }
    return horizonY + (nearPlaneY() - horizonY) * Math.pow(clampedDepth, 1.36);
  }

  function roadEaseAtY(y) {
    const geometry = roadGeometry();
    return Math.max(
      0,
      Math.min(1, (y - geometry.topY) / (geometry.bottomY - geometry.topY))
    );
  }

  function roadBoundaryX(boundaryIndex, ease) {
    const geometry = roadGeometry();
    const topStep = (geometry.topRight - geometry.topLeft) / LANE_COUNT;
    const bottomStep = (geometry.bottomRight - geometry.bottomLeft) / LANE_COUNT;
    const safeIndex = Math.max(0, Math.min(LANE_COUNT, boundaryIndex));
    const topX = geometry.topLeft + topStep * safeIndex;
    const bottomX = geometry.bottomLeft + bottomStep * safeIndex;
    return topX + (bottomX - topX) * ease;
  }

  function laneBoundsAtY(laneIndex, y) {
    const safeLane = Math.max(0, Math.min(LANE_COUNT - 1, laneIndex));
    const ease = roadEaseAtY(y);
    const left = roadBoundaryX(safeLane, ease);
    const right = roadBoundaryX(safeLane + 1, ease);
    return {
      left,
      right,
      center: (left + right) * 0.5,
      width: right - left,
      ease
    };
  }

  function laneCenterAtDepth(laneIndex, depth) {
    const y = projectDepthY(depth);
    return laneBoundsAtY(laneIndex, y).center;
  }

  function laneCenterAtY(laneIndex, y) {
    return laneBoundsAtY(laneIndex, y).center;
  }

  function centeredDrawSize(sourceWidth, sourceHeight, scale, laneWidth, widthRatio) {
    const maxWidth = laneWidth * widthRatio;
    const drawWidth = Math.min(sourceWidth * scale, maxWidth);
    const safeScale = sourceWidth > 0 ? drawWidth / sourceWidth : scale;
    return {
      width: drawWidth,
      height: sourceHeight * safeScale,
      scale: safeScale
    };
  }

  function laneCenterAtEase(laneIndex, ease) {
    const left = roadBoundaryX(laneIndex, ease);
    const right = roadBoundaryX(laneIndex + 1, ease);
    return (left + right) * 0.5;
  }

  function laneCenterX(laneIndex) {
    return laneCenterAtY(laneIndex, playerBaseY());
  }

  function laneHorizonX(laneIndex) {
    return laneCenterAtEase(laneIndex, 0);
  }

  function projectLanePoint(laneIndex, depth, laneOffset) {
    const offset = laneOffset || 0;
    const clampedDepth = Math.max(0, Math.min(1, depth));
    const y = projectDepthY(depth);
    const bounds = laneBoundsAtY(laneIndex, y);
    const x = bounds.center + offset * bounds.width * 0.28;

    const scale = 0.33 + Math.pow(clampedDepth, 1.08) * 0.98;
    return { x, y, scale, laneWidth: bounds.width, roadEase: bounds.ease };
  }

  function isPastFinishLine(laneIndex, depth, laneOffset, bufferPx) {
    const point = projectLanePoint(laneIndex, depth, laneOffset);
    return point.y >= playerBaseY() + (bufferPx || 0);
  }

  function currentWorldPalette() {
    const elapsed = Number.isFinite(runtime.totalElapsed) ? runtime.totalElapsed : 0;
    const index = Math.floor(elapsed / 18) % WORLD_PALETTES.length;
    return WORLD_PALETTES[index] || WORLD_PALETTES[0];
  }

  function drawRoundedRect(x, y, width, height, radius, fill, stroke) {
    const r = Math.max(0, Math.min(radius, Math.min(width, height) * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function drawCoinGlyph(x, y, radius) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const angle = (-Math.PI / 2) + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? radius : radius * 0.45;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(250, 183, 9, 0.95)";
    ctx.fill();
    ctx.restore();
  }

  function describeCharacter(character) {
    const roleMap = {
      speed: "속도형",
      stable: "안정형",
      skill: "스킬형"
    };
    return (
      (roleMap[character.roleType] || "기본형") +
      " | 속도 " +
      Math.round(character.baseSpeed)
    );
  }

  function renderCharacterList() {
    if (!characterList) {
      return;
    }
    characterList.innerHTML = "";
    characters.forEach(function (character, index) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "character-card";
      if (index === selectedCharacterIndex) {
        card.classList.add("selected");
      }

      const title = document.createElement("div");
      title.className = "character-title";
      title.innerHTML =
        "<span>" +
        character.displayName +
        "</span><span>" +
        character.skillId +
        "</span>";

      const desc = document.createElement("div");
      desc.className = "character-desc";
      desc.textContent = describeCharacter(character);

      const unlock = document.createElement("div");
      unlock.className = "character-desc";
      unlock.textContent = "해금 조건: " + character.unlockCondition;

      card.append(title, desc, unlock);
      card.addEventListener("click", function () {
        selectedCharacterIndex = index;
        renderCharacterList();
      });
      characterList.append(card);
    });
  }

  function resetRunState() {
    runtime.running = true;
    runtime.paused = false;
    runtime.countdownActive = false;
    runtime.runEndedReason = "none";
    runtime.lastFrameTime = performance.now();
    runtime.stageIndex = 0;
    runtime.totalElapsed = 0;
    runtime.score = 0;
    runtime.distanceMeters = 0;
    runtime.speedTier = 0;
    runtime.speedKmh = 0;
    runtime.survivalGauge = SURVIVAL_MAX;
    runtime.sideRecoverCooldown = 0;
    runtime.missionDone = false;
    runtime.obstacles = [];
    runtime.collectibles = [];
    runtime.poisonShots = [];
    runtime.spawnTimer = 0;
    runtime.spawnIn = randomRange(
      stages[0].spawnPattern.minGap,
      stages[0].spawnPattern.maxGap
    );
    runtime.collectibleSpawnTimer = 0;
    runtime.collectibleSpawnIn = randomRange(0.58, 0.98);
    runtime.collectedTokens = 0;
    runtime.boosterTimer = 0;
    runtime.boostersCollected = 0;
    runtime.powerupCooldownUntil = 0;
    runtime.powerupSpawnedTiers = {};
    runtime.powerupSpawnAtByTier = {};
    runtime.moveLeftQueued = false;
    runtime.moveRightQueued = false;
    runtime.skillCooldown = 0;
    runtime.rushTimer = 0;
    runtime.shieldTimer = 0;
    runtime.slowTimer = 0;
    runtime.blinkTimer = 0;
    runtime.scrollSpeedNorm = 0.26;
    runtime.sideObjectFlow = 0;
    runtime.hudRefreshClock = HUD_UPDATE_INTERVAL_SEC;
    updatePauseToggleButton();

    const player = runtime.player;
    player.lane = Math.floor(LANE_COUNT / 2);
    player.targetX = laneCenterX(player.lane) - player.width / 2;
    player.x = player.targetX;
    player.y = playerBaseY() - player.height;
    player.height = player.baseHeight;
    player.animTime = 0;
    player.lean = 0;
    player.bob = 0;
  }

  function queueMoveLeft() {
    if (runtime.countdownActive) {
      return;
    }
    runtime.moveLeftQueued = true;
  }

  function queueMoveRight() {
    if (runtime.countdownActive) {
      return;
    }
    runtime.moveRightQueued = true;
  }

  function runSkill() {
    if (!runtime.running || runtime.countdownActive || runtime.skillCooldown > 0) {
      return;
    }
    const character = selectedCharacter();
    if (character.skillId === "rush_boost") {
      runtime.rushTimer = 2.6;
    } else if (character.skillId === "safe_shield") {
      runtime.shieldTimer = 3.0;
    } else {
      runtime.slowTimer = 3.0;
    }
    runtime.skillCooldown = character.cooldownSec;
  }

  function applyShareVariant() {
    shareVariant = Math.random() < 0.5 ? "A" : "B";
    shareHint.textContent = "공유 버튼 A/B 테스트: Variant " + shareVariant;
    const actions = document.querySelector(".actions");
    actions.classList.remove("variant-b");
    shareButton.classList.remove("variant-b");
    if (shareVariant === "B") {
      actions.classList.add("variant-b");
      shareButton.classList.add("variant-b");
    }
  }

  function showOverlay(text, durationMs, variant) {
    stageOverlay.textContent = text;
    stageOverlay.classList.toggle("overlay-top", variant === "top");
    stageOverlay.classList.toggle("overlay-countdown", variant === "countdown");
    stageOverlay.classList.remove("hidden");
    window.clearTimeout(showOverlay._timer);
    showOverlay._timer = window.setTimeout(function () {
      stageOverlay.classList.add("hidden");
      stageOverlay.classList.remove("overlay-top");
      stageOverlay.classList.remove("overlay-countdown");
    }, durationMs || 1500);
  }

  function updatePauseToggleButton() {
    if (!pauseToggleButton) {
      return;
    }
    const isPaused = runtime.running && runtime.paused;
    pauseToggleButton.textContent = isPaused ? "PLAY" : "PAUSE";
    pauseToggleButton.setAttribute("aria-label", isPaused ? "Play" : "Pause");
    pauseToggleButton.classList.toggle("is-paused", isPaused);
  }

  function togglePause() {
    if (!runtime.running || runtime.countdownActive) {
      return;
    }
    runtime.paused = !runtime.paused;
    runtime.lastFrameTime = performance.now();
    updatePauseToggleButton();
  }

  function setNicknameError(text) {
    if (!nicknameError) {
      return;
    }
    nicknameError.textContent = text || "";
  }

  function closeNicknameModal() {
    if (!nicknameModal) {
      return;
    }
    nicknameModal.classList.add("hidden");
    nicknameModal.setAttribute("aria-hidden", "true");
    setNicknameError("");
  }

  function openNicknameModal() {
    if (!nicknameModal) {
      return;
    }
    nicknameModal.classList.remove("hidden");
    nicknameModal.setAttribute("aria-hidden", "false");
    setNicknameError("");
    if (nicknameInput) {
      nicknameInput.value = playerNickname || "";
      window.requestAnimationFrame(function () {
        nicknameInput.focus();
        nicknameInput.select();
      });
    }
  }

  function submitNicknameAndStart() {
    const safeNickname = sanitizeNickname(nicknameInput ? nicknameInput.value : "");
    if (!safeNickname) {
      setNicknameError("닉네임을 1자 이상 입력해줘");
      if (nicknameInput) {
        nicknameInput.focus();
      }
      return;
    }
    playerNickname = persistPlayerNickname(safeNickname);
    closeNicknameModal();
    startRun();
  }

  function setResultTauntHint(text) {
    if (!resultTauntHint) {
      return;
    }
    resultTauntHint.textContent = text || "";
  }

  function syncResultTauntEditor() {
    if (resultTauntInput) {
      resultTauntInput.value = playerTaunt || "";
    }
    setResultTauntHint("저장하면 현재 기록에 반영돼");
  }

  function applyTauntToEntry(entryId, tauntText) {
    if (!entryId) {
      return;
    }
    const leaderboard = readLeaderboard();
    let changed = false;
    const updatedEntries = leaderboard.map(function (entry) {
      if (entry.id !== entryId) {
        return entry;
      }
      changed = true;
      return Object.assign({}, entry, { taunt: tauntText });
    });
    if (!changed) {
      return;
    }
    const persisted = persistLeaderboard(updatedEntries);
    renderResultRanking(persisted, entryId);
  }

  function submitResultTaunt() {
    const safeTaunt = sanitizeTaunt(resultTauntInput ? resultTauntInput.value : "");
    playerTaunt = persistPlayerTaunt(safeTaunt);
    if (latestResultEntryId) {
      applyTauntToEntry(latestResultEntryId, playerTaunt);
      setResultTauntHint("저장 완료");
    } else {
      setResultTauntHint("저장 완료");
    }
    playerTaunt = persistPlayerTaunt("");
    if (resultTauntInput) {
      resultTauntInput.value = "";
    }
  }

  function stageByIndex(index) {
    const safeIndex = Number.isFinite(index) ? index : 0;
    return stages[Math.max(0, Math.min(safeIndex, stages.length - 1))] || stages[0];
  }

  function currentStage() {
    const speedTier = Number.isFinite(runtime.speedTier) ? runtime.speedTier : 0;
    const difficultyIndex = Math.min(
      stages.length - 1,
      Math.floor(speedTier / 2)
    );
    runtime.stageIndex = difficultyIndex;
    return stageByIndex(difficultyIndex);
  }

  function speedTierFromElapsed(elapsedSec) {
    const safeElapsed = Number.isFinite(elapsedSec) ? elapsedSec : 0;
    return Math.floor(safeElapsed / SPEEDUP_TIME_STEP_SEC);
  }

  function currentSurvivalDecayPerSec() {
    const speedTier = Number.isFinite(runtime.speedTier) ? runtime.speedTier : 0;
    return SURVIVAL_DECAY_PER_SEC + speedTier * SURVIVAL_DECAY_PER_LEVEL;
  }

  function isBoosterActive() {
    return runtime.boosterTimer > 0;
  }

  function startPowerupCooldown() {
    runtime.powerupCooldownUntil = runtime.totalElapsed + POWERUP_COOLDOWN_AFTER_USE_SEC;
    runtime.powerupSpawnAtByTier = {};
  }

  function activateBooster(character) {
    runtime.boosterTimer = BOOSTER_DURATION_SEC;
    runtime.boostersCollected += 1;
    startPowerupCooldown();
    runtime.score += BOOSTER_BASE_SCORE;
    runtime.survivalGauge = Math.min(SURVIVAL_MAX, runtime.survivalGauge + 10);
    showOverlay("무한 부스터!!", 900, "top");
    emitTelemetry("collect_booster", {
      characterId: character.id,
      stageId: runtime.speedTier + 1,
      distance: Math.round(runtime.distanceMeters),
      boosterCount: runtime.boostersCollected,
      score: Math.round(runtime.score),
      survivalGauge: Math.round(runtime.survivalGauge)
    });
  }

  function currentApproachMultiplier() {
    const speedTier = Number.isFinite(runtime.speedTier) ? runtime.speedTier : 0;
    const levelBonus = Math.min(
      APPROACH_MULTIPLIER_MAX_BONUS,
      speedTier * APPROACH_MULTIPLIER_PER_LEVEL
    );
    return OBSTACLE_APPROACH_MULTIPLIER * (1 + levelBonus);
  }

  function currentCollectibleApproachMultiplier() {
    return (
      (1.12 + Math.min(0.22, runtime.speedTier * 0.012)) *
      (1 + Math.min(0.26, runtime.speedTier * 0.035))
    );
  }

  function isEnemyObstacle(base) {
    return base && base.lane === "hole_pop";
  }

  function currentEnemySpawnLead() {
    const speedTier = Number.isFinite(runtime.speedTier) ? runtime.speedTier : 0;
    return Math.min(
      ENEMY_SPAWN_LEAD_MAX,
      Math.max(0, speedTier - 1) * ENEMY_SPAWN_LEAD_PER_TIER
    );
  }

  function enemyAwareSpawnDepth(base) {
    if (!isEnemyObstacle(base)) {
      return randomRange(-0.14, 0.06);
    }
    const leadDepth = currentEnemySpawnLead();
    return randomRange(-0.14 - leadDepth, 0.06 - leadDepth * 0.75);
  }

  function currentMoleSpawnRatio() {
    const speedTier = Number.isFinite(runtime.speedTier) ? runtime.speedTier : 0;
    if (speedTier < MOLE_START_SPEED_TIER) {
      return 0;
    }
    return Math.max(
      MOLE_MIN_SPAWN_RATIO,
      MOLE_START_SPAWN_RATIO -
        (speedTier - MOLE_START_SPEED_TIER) * MOLE_RATIO_DROP_PER_TIER
    );
  }

  function randomMovingObstacleDirection(lane) {
    const candidates = [];
    if (lane > 0) {
      candidates.push(-1);
    }
    if (lane < LANE_COUNT - 1) {
      candidates.push(1);
    }
    if (!candidates.length) {
      return 0;
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function updateMovingObstacle(obstacle, dt) {
    if (!Number.isFinite(obstacle.visualLane)) {
      obstacle.visualLane = obstacle.lane;
    }
    obstacle.wobble += dt * 5.2;
    obstacle.laneOffset = 0;

    if (obstacle.depth > 0.16 && obstacle.depth < 0.95) {
      obstacle.moveCooldown -= dt;
      const nearTargetLane = Math.abs(obstacle.visualLane - obstacle.lane) < 0.06;
      if (obstacle.moveCooldown <= 0 && nearTargetLane) {
        const direction = randomMovingObstacleDirection(obstacle.lane);
        obstacle.lane = Math.max(0, Math.min(LANE_COUNT - 1, obstacle.lane + direction));
        obstacle.moveCooldown = randomRange(0.52, 0.92);
      }
    }

    const laneDrift = obstacle.lane - obstacle.visualLane;
    obstacle.visualLane += laneDrift * Math.min(1, dt * 7.2);
  }

  function currentObstacleWeights(stage) {
    const weights = Object.assign({}, stage.spawnPattern.weights);
    if (runtime.speedTier >= 4) {
      stage.obstacleSet.forEach(function (type) {
        if (isEnemyObstacle(obstacleCatalog[type])) {
          weights[type] = Number(weights[type] || 0) + HIGH_TIER_ENEMY_WEIGHT_BONUS;
        }
      });
    }
    if (stage.obstacleSet.indexOf("slope_hole") !== -1) {
      const moleRatio = currentMoleSpawnRatio();
      if (moleRatio > 0) {
        let otherWeightTotal = 0;
        stage.obstacleSet.forEach(function (type) {
          if (type !== "slope_hole") {
            otherWeightTotal += Number(weights[type] || 0);
          }
        });
        weights.slope_hole =
          otherWeightTotal > 0
            ? (otherWeightTotal * moleRatio) / (1 - moleRatio)
            : Number(weights.slope_hole || 0);
      }
    }
    return weights;
  }

  function spawnObstacle() {
    const stage = currentStage();
    const obstacleType = weightedPick(currentObstacleWeights(stage), stage.obstacleSet);
    const base = obstacleCatalog[obstacleType];
    const laneSpan = Math.max(1, Math.min(LANE_COUNT, Math.round(base.laneSpan || 1)));
    const maxStartLane = Math.max(0, LANE_COUNT - laneSpan);
    const lane = Math.floor(Math.random() * (maxStartLane + 1));
    const spawnDepth = enemyAwareSpawnDepth(base);
    runtime.obstacles.push({
      type: obstacleType,
      depth: spawnDepth,
      visualDepth: spawnDepth,
      lane: lane,
      laneSpan,
      laneOffset: 0,
      visualLane: lane,
      moveCooldown: base.lane === "moving" ? randomRange(0.28, 0.62) : 0,
      width: base.width,
      height: base.height,
      color: base.color,
      moveLane: base.lane,
      groundOffsetRatio: Number(base.groundOffsetRatio || 0),
      laneWidthRatio: Number(base.laneWidthRatio || 0),
      sizeScale: Number(base.sizeScale || 1),
      heightScale: Number(base.heightScale || 1),
      spitDone: false,
      passed: false,
      wobble: Math.random() * Math.PI * 2
    });
  }

  function collectibleLaneOrder() {
    const playerLane = runtime.player.lane;
    const sequence = [playerLane, playerLane - 1, playerLane + 1, playerLane - 2, playerLane + 2];
    const deduped = [];
    sequence.forEach(function (lane) {
      if (lane >= 0 && lane < LANE_COUNT && deduped.indexOf(lane) === -1) {
        deduped.push(lane);
      }
    });
    while (deduped.length < LANE_COUNT) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      if (deduped.indexOf(lane) === -1) {
        deduped.push(lane);
      }
    }
    return deduped;
  }

  function shouldSpawnPowerupItem() {
    if (isBoosterActive()) {
      return false;
    }
    if (runtime.totalElapsed < runtime.powerupCooldownUntil) {
      return false;
    }
    const tier = Number.isFinite(runtime.speedTier) ? runtime.speedTier : 0;
    const tierKey = String(tier);
    const elapsedInTier = runtime.totalElapsed - tier * SPEEDUP_TIME_STEP_SEC;
    if (!Number.isFinite(runtime.powerupSpawnAtByTier[tierKey])) {
      const maxSpawnAt = Math.min(POWERUP_SPAWN_MAX_SEC, SPEEDUP_TIME_STEP_SEC - 1.4);
      let minSpawnAt = POWERUP_SPAWN_MIN_SEC;
      if (runtime.powerupCooldownUntil > 0) {
        minSpawnAt = Math.max(
          minSpawnAt,
          elapsedInTier + randomRange(POWERUP_RESPAWN_RANDOM_MIN_SEC, POWERUP_RESPAWN_RANDOM_MAX_SEC)
        );
      }
      runtime.powerupSpawnAtByTier[tierKey] =
        minSpawnAt <= maxSpawnAt ? randomRange(minSpawnAt, maxSpawnAt) : Infinity;
    }
    return (
      !runtime.powerupSpawnedTiers[tierKey] &&
      elapsedInTier >= runtime.powerupSpawnAtByTier[tierKey]
    );
  }

  function spawnCollectible() {
    if (runtime.collectibles.length >= MAX_ACTIVE_COLLECTIBLES) {
      return;
    }
    const lanes = collectibleLaneOrder();
    const panicMode = runtime.survivalGauge < 34;
    if (shouldSpawnPowerupItem()) {
      const laneIndex = Math.random() < 0.68 ? 0 : Math.min(1, lanes.length - 1);
      const boosterDepth = randomRange(-0.24, 0.02);
      runtime.collectibles.push({
        kind: "booster",
        depth: boosterDepth,
        visualDepth: boosterDepth,
        lane: lanes[laneIndex],
        laneOffset: 0,
        width: collectibleConfig.width * 1.62,
        height: collectibleConfig.height * 1.5,
        wobble: Math.random() * Math.PI * 2,
        passed: false
      });
      runtime.powerupSpawnedTiers[String(runtime.speedTier)] = true;
      return;
    }

    let waveSize = Math.random() < 0.62 ? 2 : 1;
    if (Math.random() < 0.28 + Math.min(0.18, runtime.speedTier * 0.02)) {
      waveSize += 1;
    }
    if (panicMode && Math.random() < 0.76) {
      waveSize += 1;
    }
    const remainingSlots = Math.max(0, MAX_ACTIVE_COLLECTIBLES - runtime.collectibles.length);
    waveSize = Math.min(4, waveSize, remainingSlots);
    if (waveSize <= 0) {
      return;
    }
    waveSize = Math.max(1, waveSize);
    const baseDepth = randomRange(-0.24, 0.02);
    for (let i = 0; i < waveSize; i += 1) {
      const coinDepth = baseDepth - i * randomRange(0.035, 0.08);
      runtime.collectibles.push({
        depth: coinDepth,
        visualDepth: coinDepth,
        lane: lanes[i % lanes.length],
        laneOffset: 0,
        kind: "coin",
        width: collectibleConfig.width,
        height: collectibleConfig.height,
        wobble: Math.random() * Math.PI * 2,
        passed: false
      });
    }
  }

  function spawnPoisonShotsFromEnemy(obstacle, forwardRate) {
    if (runtime.poisonShots.length >= MAX_ACTIVE_POISON_SHOTS) {
      return;
    }
    const projected = projectLanePoint(obstacle.lane, obstacle.depth, obstacle.laneOffset);
    const enemyScale = projected.scale;
    const enemyHeight = obstacle.height * enemyScale;
    const mouthX = projected.x;
    const mouthY = projected.y - enemyHeight * 0.58;
    const speed = (190 + runtime.speedTier * 16) * (0.86 + forwardRate * 1.8);
    const targetX = runtime.player.x + runtime.player.width * 0.5;
    const targetY = runtime.player.y + runtime.player.height * 0.56;
    const deltaX = targetX - mouthX;
    const deltaY = targetY - mouthY;
    const vectorLength = Math.hypot(deltaX, deltaY) || 1;
    const directionX = deltaX / vectorLength;
    const directionY = deltaY / vectorLength;
    const vx = directionX * speed;
    const vy = directionY * speed;
    const radius = Math.max(4, 4.2 * enemyScale + 3.2);
    const offset = Math.max(6, enemyScale * 10);
    const spawnX = mouthX + directionX * offset;
    const spawnY = mouthY + directionY * (offset * 0.25);
    const angleDeg =
      (Math.atan2(Math.abs(directionY), Math.abs(directionX)) * 180) / Math.PI;

    runtime.poisonShots.push({
      x: spawnX,
      y: spawnY,
      vx,
      vy,
      radius,
      passed: false
    });

    emitTelemetry("poison_spit", {
      characterId: selectedCharacter().id,
      stageId: runtime.speedTier + 1,
      distance: Math.round(runtime.distanceMeters),
      sourceType: obstacle.type,
      direction: directionX < -0.05 ? "left" : directionX > 0.05 ? "right" : "center",
      angleDeg: Math.round(angleDeg)
    });
  }

  function getPlayerHitbox() {
    const player = runtime.player;
    const runPose = getRunnerPose(player);
    const visualWidth = player.width * runPose.scaleX;
    const visualHeight = player.height * runPose.scaleY;
    const visualX = player.x + runPose.x + (player.width - visualWidth) * 0.5;
    const visualY = player.y + player.height - visualHeight;
    return {
      left: visualX + visualWidth * 0.24,
      right: visualX + visualWidth * 0.76,
      top: visualY + visualHeight * 0.2,
      bottom: visualY + visualHeight * 0.94
    };
  }

  function rectsOverlap(a, b) {
    return (
      a.left < b.right &&
      a.right > b.left &&
      a.top < b.bottom &&
      a.bottom > b.top
    );
  }

  function circleRectOverlap(circle, rect) {
    const nearestX = Math.max(rect.left, Math.min(circle.x, rect.right));
    const nearestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
    const dx = circle.x - nearestX;
    const dy = circle.y - nearestY;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function moleRiseRatio(obstacle) {
    const rawRise = (obstacle.depth - 0.08) / 0.46;
    const clampedRise = clamp01(rawRise);
    return 1 - Math.pow(1 - clampedRise, 3);
  }

  function moleVisibleRatio(obstacle) {
    return (
      MOLE_VISIBLE_MIN_RATIO +
      moleRiseRatio(obstacle) * (MOLE_VISIBLE_MAX_RATIO - MOLE_VISIBLE_MIN_RATIO)
    );
  }

  function obstacleLaneSpan(obstacle) {
    const safeLane = Math.max(0, Math.min(LANE_COUNT - 1, obstacle.lane || 0));
    const requestedSpan = Math.max(1, Math.round(obstacle.laneSpan || 1));
    return Math.max(1, Math.min(LANE_COUNT - safeLane, requestedSpan));
  }

  function getObstacleDrawInfo(obstacle, useVisualDepth) {
    const useVisual = useVisualDepth !== false;
    if (useVisual && obstacle._drawInfoToken === runtime.frameToken && obstacle._drawInfoCache) {
      return obstacle._drawInfoCache;
    }
    const renderLane = Number.isFinite(obstacle.visualLane)
      ? obstacle.visualLane
      : obstacle.lane;
    const renderDepth =
      useVisual && Number.isFinite(obstacle.visualDepth) ? obstacle.visualDepth : obstacle.depth;
    const baseProjected = projectLanePoint(
      renderLane,
      renderDepth,
      obstacle.laneOffset
    );
    const laneSpan = obstacleLaneSpan(obstacle);
    const safeLane = Math.max(0, Math.min(LANE_COUNT - 1, obstacle.lane || 0));
    let projected = baseProjected;
    if (laneSpan > 1) {
      const left = roadBoundaryX(safeLane, baseProjected.roadEase);
      const right = roadBoundaryX(safeLane + laneSpan, baseProjected.roadEase);
      const spanWidth = right - left;
      projected = Object.assign({}, baseProjected, {
        x: (left + right) * 0.5 + (obstacle.laneOffset || 0) * spanWidth * 0.18,
        laneWidth: spanWidth,
        laneSpan
      });
    }
    const defaultLaneRatio =
      obstacle.moveLane === "mole_pop"
        ? 0.9
        : obstacle.moveLane === "hole_pop"
        ? 0.9
        : obstacle.moveLane === "moving"
        ? 0.88
        : 0.64;
    const laneWidthRatio = Number.isFinite(obstacle.laneWidthRatio) && obstacle.laneWidthRatio > 0
      ? Math.min(1.4, Math.max(0.2, obstacle.laneWidthRatio))
      : defaultLaneRatio;
    const sizeScale = Number.isFinite(obstacle.sizeScale) && obstacle.sizeScale > 0
      ? Math.min(2.5, Math.max(0.2, obstacle.sizeScale))
      : 1;
    const heightScale = Number.isFinite(obstacle.heightScale) && obstacle.heightScale > 0
      ? Math.min(3, Math.max(0.2, obstacle.heightScale))
      : 1;
    const size = centeredDrawSize(
      obstacle.width * sizeScale,
      obstacle.height * sizeScale * heightScale,
      projected.scale,
      projected.laneWidth,
      laneWidthRatio
    );
    const drawWidth = size.width;
    const drawHeight = size.height;
    const drawX = projected.x - drawWidth / 2;
    const groundOffsetRatio = Number(obstacle.groundOffsetRatio || 0);
    const drawY = projected.y - drawHeight + drawHeight * groundOffsetRatio;
    const info = { projected, drawX, drawY, drawWidth, drawHeight };
    if (useVisual) {
      obstacle._drawInfoToken = runtime.frameToken;
      obstacle._drawInfoCache = info;
    }
    return info;
  }

  function getObstacleHitbox(obstacle, useVisualDepth) {
    const info = getObstacleDrawInfo(obstacle, useVisualDepth);
    if (obstacle.moveLane === "hole_pop") {
      return {
        left: info.drawX + info.drawWidth * 0.16,
        right: info.drawX + info.drawWidth * 0.84,
        top: info.drawY + info.drawHeight * 0.08,
        bottom: info.drawY + info.drawHeight * 0.9
      };
    }
    if (obstacle.moveLane === "mole_pop") {
      const holeY = info.drawY + info.drawHeight * 0.92;
      const visibleRatio = moleVisibleRatio(obstacle);
      const visibleTop = holeY - info.drawHeight * visibleRatio;
      return {
        left: info.drawX + info.drawWidth * 0.1,
        right: info.drawX + info.drawWidth * 0.9,
        top: visibleTop + info.drawHeight * 0.08,
        bottom: holeY - info.drawHeight * 0.08
      };
    }
    if (obstacle.moveLane === "moving") {
      return {
        left: info.drawX + info.drawWidth * 0.16,
        right: info.drawX + info.drawWidth * 0.84,
        top: info.drawY + info.drawHeight * 0.08,
        bottom: info.drawY + info.drawHeight * 0.92
      };
    }
    return {
      left: info.drawX + info.drawWidth * 0.12,
      right: info.drawX + info.drawWidth * 0.88,
      top: info.drawY + info.drawHeight * 0.1,
      bottom: info.drawY + info.drawHeight * 0.9
    };
  }

  function getCollectibleDrawInfo(item, useVisualDepth) {
    const useVisual = useVisualDepth !== false;
    if (useVisual && item._drawInfoToken === runtime.frameToken && item._drawInfoCache) {
      return item._drawInfoCache;
    }
    const renderDepth =
      useVisual && Number.isFinite(item.visualDepth) ? item.visualDepth : item.depth;
    const projected = projectLanePoint(item.lane, renderDepth, item.laneOffset);
    const size = centeredDrawSize(
      item.width,
      item.height,
      projected.scale,
      projected.laneWidth,
      0.58
    );
    const drawWidth = size.width;
    const drawHeight = size.height;
    const drawX = projected.x - drawWidth / 2;
    const drawY = projected.y - drawHeight;
    const coinCenterX = drawX + drawWidth * 0.5;
    const coinCenterY = drawY + drawHeight * 0.52;
    const coinRadius = Math.min(
      Math.max(5, drawWidth * 0.42),
      projected.laneWidth * 0.22
    );
    const info = {
      projected,
      drawX,
      drawY,
      drawWidth,
      drawHeight,
      coinCenterX,
      coinCenterY,
      coinRadius
    };
    if (useVisual) {
      item._drawInfoToken = runtime.frameToken;
      item._drawInfoCache = info;
    }
    return info;
  }

  function getPoisonHitCircle(shot) {
    return {
      x: shot.x,
      y: shot.y,
      radius: Math.max(5, shot.radius * 1.2)
    };
  }

  function updatePlayer(dt) {
    const player = runtime.player;
    const feel = speedFeel();
    player.animTime += dt * runnerTempo();
    const prevLane = player.lane;

    if (runtime.moveLeftQueued) {
      runtime.moveLeftQueued = false;
      player.lane = Math.max(0, player.lane - 1);
    }

    if (runtime.moveRightQueued) {
      runtime.moveRightQueued = false;
      player.lane = Math.min(LANE_COUNT - 1, player.lane + 1);
    }

    if (player.lane !== prevLane && runtime.sideRecoverCooldown <= 0) {
      runtime.survivalGauge = Math.min(
        SURVIVAL_MAX,
        runtime.survivalGauge + SURVIVAL_GAIN_PER_SIDE_INPUT
      );
      runtime.sideRecoverCooldown = SURVIVAL_SIDE_GAIN_COOLDOWN_SEC;
    }

    player.targetX = laneCenterX(player.lane) - player.width / 2;
    const laneDrift = player.targetX - player.x;
    player.x += laneDrift * Math.min(1, dt * 13.5);
    player.lean += ((laneDrift / 26) - player.lean) * Math.min(1, dt * 9.5);
    const runPose = getRunnerPose(player);
    player.bob = runPose.y * (0.85 + feel * 0.28);
    player.y = playerBaseY() - player.height + player.bob;
    player.height = player.baseHeight;
  }

  function endRun(reason) {
    runtime.running = false;
    runtime.paused = false;
    runtime.runEndedReason = reason;
    cancelFrameLoop();
    updatePauseToggleButton();
    emitTelemetry("run_end", {
      characterId: selectedCharacter().id,
      stageId: runtime.speedTier + 1,
      reason: reason,
      score: Math.round(runtime.score),
      distance: Math.round(runtime.distanceMeters),
      speedKmh: Math.round(runtime.speedKmh),
      survivalGauge: Math.round(runtime.survivalGauge),
      missionDone: runtime.missionDone
    });
    const finalDistance = Math.round(runtime.distanceMeters);
    const finalLevel = runtime.speedTier + 1;
    const ranking = saveLeaderboardEntry(finalDistance, finalLevel);
    latestResultEntryId = ranking.entry.id;
    resultTitle.textContent = "GAME OVER";
    resultStage.textContent = String(finalDistance);
    renderResultRanking(ranking.leaderboard, ranking.entry.id);
    syncResultTauntEditor();
    switchScene(sceneResult);
    applyShareVariant();
  }

  function updateRun(dt) {
    const character = selectedCharacter();

    runtime.totalElapsed += dt;
    runtime.skillCooldown = Math.max(0, runtime.skillCooldown - dt);
    runtime.rushTimer = Math.max(0, runtime.rushTimer - dt);
    runtime.shieldTimer = Math.max(0, runtime.shieldTimer - dt);
    runtime.slowTimer = Math.max(0, runtime.slowTimer - dt);
    runtime.boosterTimer = Math.max(0, runtime.boosterTimer - dt);
    runtime.blinkTimer = Math.max(0, runtime.blinkTimer - dt);
    runtime.sideRecoverCooldown = Math.max(0, runtime.sideRecoverCooldown - dt);
    const survivalDecay = isBoosterActive() ? 0 : currentSurvivalDecayPerSec();
    runtime.survivalGauge = Math.max(
      0,
      runtime.survivalGauge - survivalDecay * dt
    );
    if (runtime.survivalGauge <= 0) {
      emitTelemetry("survival_empty", {
        characterId: character.id,
        stageId: runtime.speedTier + 1,
        distance: Math.round(runtime.distanceMeters),
        score: Math.round(runtime.score)
      });
      endRun("survival_empty");
      return;
    }
    updatePlayer(dt);

    const speedBonus = Math.min(
      SPEEDUP_MAX_BONUS,
      runtime.speedTier * SPEEDUP_BONUS_PER_STEP
    );
    const rushMultiplier = runtime.rushTimer > 0 ? 1.28 : 1;
    const slowMultiplier = runtime.slowTimer > 0 ? 0.68 : 1;
    const boosterMultiplier = isBoosterActive() ? BOOSTER_SPEED_MULTIPLIER : 1;
    const obstacleSpeed =
      (character.baseSpeed + speedBonus) * rushMultiplier * slowMultiplier * boosterMultiplier;
    const metersPerSec = obstacleSpeed / DISTANCE_UNITS_PER_METER;
    const forwardRate = (obstacleSpeed / 320) * 0.26;
    const collectibleApproachMultiplier = currentCollectibleApproachMultiplier();
    runtime.scrollSpeedNorm = forwardRate;
    runtime.speedKmh = metersPerSec * 3.6;
    runtime.distanceMeters += metersPerSec * dt;
    runtime.sideObjectFlow += forwardRate * collectibleApproachMultiplier * dt;
    runtime.hudRefreshClock += dt;

    const nextSpeedTier = speedTierFromElapsed(runtime.totalElapsed);
    if (nextSpeedTier > runtime.speedTier) {
      runtime.speedTier = nextSpeedTier;
      showOverlay("스피드 업!!", 950, "top");
      emitTelemetry("speed_up", {
        characterId: character.id,
        stageId: runtime.speedTier + 1,
        distance: Math.round(runtime.distanceMeters),
        speedKmh: Math.round(runtime.speedKmh)
      });
    } else {
      runtime.speedTier = nextSpeedTier;
    }

    const stage = currentStage();

    runtime.spawnTimer += dt;
    if (runtime.spawnTimer >= runtime.spawnIn) {
      runtime.spawnTimer = 0;
      runtime.spawnIn = randomRange(stage.spawnPattern.minGap, stage.spawnPattern.maxGap);
      spawnObstacle();
    }

    runtime.collectibleSpawnTimer += dt;
    if (runtime.collectibleSpawnTimer >= runtime.collectibleSpawnIn) {
      runtime.collectibleSpawnTimer = 0;
      const panicSpawnMultiplier = runtime.survivalGauge < 34 ? 0.78 : 1;
      runtime.collectibleSpawnIn =
        randomRange(
          Math.max(0.42, 0.72 - runtime.speedTier * 0.012),
          Math.max(0.66, 1.08 - runtime.speedTier * 0.018)
        ) * panicSpawnMultiplier;
      spawnCollectible();
    }

    runtime.obstacles.forEach(function (obstacle) {
      obstacle.depth += forwardRate * currentApproachMultiplier() * dt;
      if (MOBILE_PERF_MODE) {
        if (!Number.isFinite(obstacle.visualDepth)) {
          obstacle.visualDepth = obstacle.depth;
        }
        obstacle.visualDepth +=
          (obstacle.depth - obstacle.visualDepth) * Math.min(1, dt * OBSTACLE_RENDER_SMOOTHING);
      } else {
        obstacle.visualDepth = obstacle.depth;
      }
      if (obstacle.moveLane === "moving") {
        updateMovingObstacle(obstacle, dt);
      } else if (obstacle.moveLane === "hole_pop") {
        obstacle.wobble += dt * 5;
        obstacle.laneOffset = 0;
        if (!obstacle.spitDone && obstacle.depth > 0.44 && obstacle.depth < 0.92) {
          obstacle.spitDone = true;
          spawnPoisonShotsFromEnemy(obstacle, forwardRate);
        }
      } else {
        obstacle.laneOffset = 0;
      }
    });

    runtime.collectibles.forEach(function (item) {
      item.depth += forwardRate * collectibleApproachMultiplier * dt;
      if (MOBILE_PERF_MODE) {
        if (!Number.isFinite(item.visualDepth)) {
          item.visualDepth = item.depth;
        }
        item.visualDepth +=
          (item.depth - item.visualDepth) * Math.min(1, dt * COLLECTIBLE_RENDER_SMOOTHING);
      } else {
        item.visualDepth = item.depth;
      }
      item.wobble += dt * 5;
      item.laneOffset = 0;
    });

    runtime.poisonShots.forEach(function (shot) {
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      if (
        shot.x < -40 ||
        shot.x > canvas.width + 40 ||
        shot.y > canvas.height + 40 ||
        shot.y < HORIZON_Y - 50
      ) {
        shot.passed = true;
      }
    });

    const playerHitbox = getPlayerHitbox();
    const collectedItems = [];
    runtime.collectibles.forEach(function (item, index) {
      const collectibleInfo = getCollectibleDrawInfo(item, false);
      const collectibleCircle = {
        x: collectibleInfo.coinCenterX,
        y: collectibleInfo.coinCenterY,
        radius: collectibleInfo.coinRadius * 0.88
      };
      const kind = item.kind || "coin";
      if (circleRectOverlap(collectibleCircle, playerHitbox)) {
        collectedItems.push({
          index,
          kind
        });
      }
    });

    if (collectedItems.length > 0) {
      const sortedItems = collectedItems.slice().sort(function (a, b) {
        return b.index - a.index;
      });
      sortedItems.forEach(function (item) {
        runtime.collectibles.splice(item.index, 1);
      });

      const coinCount = collectedItems.filter(function (item) {
        return item.kind === "coin";
      }).length;
      const boosterCount = collectedItems.filter(function (item) {
        return item.kind === "booster";
      }).length;

      if (coinCount > 0) {
        runtime.collectedTokens += coinCount;
        runtime.score += COLLECTIBLE_BASE_SCORE * coinCount;
        runtime.survivalGauge = Math.min(
          SURVIVAL_MAX,
          runtime.survivalGauge + coinCount * SURVIVAL_GAIN_PER_COIN
        );
        emitTelemetry("collect_ip_token", {
          characterId: character.id,
          stageId: runtime.speedTier + 1,
          distance: Math.round(runtime.distanceMeters),
          collected: runtime.collectedTokens,
          score: Math.round(runtime.score),
          survivalGauge: Math.round(runtime.survivalGauge)
        });
      }

      for (let i = 0; i < boosterCount; i += 1) {
        activateBooster(character);
      }
    }

    runtime.score += dt * (10 + Math.min(runtime.speedTier, 14) * 1.8);

    const poisonHit = runtime.poisonShots.find(function (shot) {
      return circleRectOverlap(getPoisonHitCircle(shot), playerHitbox);
    });

    if (poisonHit) {
      if (isBoosterActive()) {
        poisonHit.passed = true;
        runtime.score += 70;
        emitTelemetry("booster_block_poison", {
          characterId: character.id,
          stageId: runtime.speedTier + 1,
          distance: Math.round(runtime.distanceMeters),
          score: Math.round(runtime.score)
        });
      } else {
        emitTelemetry("hit_poison", {
          characterId: character.id,
          stageId: runtime.speedTier + 1,
          distance: Math.round(runtime.distanceMeters),
          score: Math.round(runtime.score)
        });
        endRun("poison_hit");
        return;
      }
    }

    const hitObstacle = runtime.obstacles.find(function (obstacle) {
      return rectsOverlap(getObstacleHitbox(obstacle, false), playerHitbox);
    });

    if (hitObstacle && isBoosterActive()) {
      hitObstacle.passed = true;
      runtime.score += 140;
      emitTelemetry("booster_break_obstacle", {
        characterId: character.id,
        stageId: runtime.speedTier + 1,
        distance: Math.round(runtime.distanceMeters),
        obstacleType: hitObstacle.type,
        score: Math.round(runtime.score)
      });
    } else if (hitObstacle && runtime.shieldTimer <= 0 && runtime.blinkTimer <= 0) {
      emitTelemetry("hit_obstacle", {
        characterId: character.id,
        stageId: runtime.speedTier + 1,
        distance: Math.round(runtime.distanceMeters),
        obstacleType: hitObstacle.type,
        score: Math.round(runtime.score)
      });
      endRun("collision");
      return;
    }

    runtime.collectibles.forEach(function (item) {
      if (isPastFinishLine(item.lane, item.depth, item.laneOffset, 0)) {
        item.passed = true;
      }
    });

    runtime.obstacles.forEach(function (obstacle) {
      if (
        !obstacle.passed &&
        isPastFinishLine(obstacle.lane, obstacle.depth, obstacle.laneOffset, 0)
      ) {
        obstacle.passed = true;
        runtime.score += 35;
      }
    });

    runtime.obstacles = runtime.obstacles.filter(function (obstacle) {
      return !obstacle.passed && obstacle.depth < DEPTH_HARD_CULL;
    });
    runtime.collectibles = runtime.collectibles.filter(function (item) {
      return !item.passed && item.depth < DEPTH_HARD_CULL;
    });
    runtime.poisonShots = runtime.poisonShots.filter(function (shot) {
      return !shot.passed;
    });

    runtime.missionDone =
      runtime.score >= MISSION_SCORE_TARGET &&
      runtime.distanceMeters >= MISSION_DISTANCE_TARGET &&
      runtime.collectedTokens >= MISSION_COLLECTIBLE_TARGET;
  }

  function renderBackground() {
    if (drawCoverSprite("ingameBackground", 0, 0, canvas.width, canvas.height)) {
      return;
    }

    const palette = currentWorldPalette();
    const nearY = nearPlaneY();
    const feel = speedFeel();
    const skyShift = Math.sin(runtime.totalElapsed * 0.3) * 0.06;
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, palette.skyTop);
    grad.addColorStop(Math.max(0.35, 0.48 + skyShift), palette.skyBottom);
    grad.addColorStop(1, "#e9fbff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sunX = canvas.width * (0.5 + Math.sin(runtime.totalElapsed * 0.08) * 0.07);
    const sunY = HORIZON_Y + 18;
    const sunRadius = 96 + Math.sin(runtime.totalElapsed * 0.52) * 5;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, sunRadius);
    sunGrad.addColorStop(0, "rgba(255,255,232,0.95)");
    sunGrad.addColorStop(0.36, palette.sun);
    sunGrad.addColorStop(1, "rgba(255,255,220,0)");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    const hazeGrad = ctx.createLinearGradient(0, HORIZON_Y - 12, 0, nearY - 20);
    hazeGrad.addColorStop(0, "rgba(240, 248, 255, 0.5)");
    hazeGrad.addColorStop(1, "rgba(240, 248, 255, 0)");
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, HORIZON_Y - 12, canvas.width, nearY - HORIZON_Y + 24);

  }

  function renderGround() {
    if (isSpriteReady("ingameBackground")) {
      return;
    }

    const palette = currentWorldPalette();
    const nearY = nearPlaneY();

    const snowGrad = ctx.createLinearGradient(0, HORIZON_Y, 0, canvas.height);
    snowGrad.addColorStop(0, "rgba(219, 243, 250, 0.52)");
    snowGrad.addColorStop(0.52, "rgba(188, 224, 238, 0.58)");
    snowGrad.addColorStop(1, "rgba(139, 184, 207, 0.72)");
    ctx.fillStyle = snowGrad;
    ctx.fillRect(0, HORIZON_Y - 4, canvas.width, canvas.height - HORIZON_Y + 4);

    ctx.save();
    for (let i = 0; i < 18; i += 1) {
      const depth = (i + 0.25) / 18;
      const ease = Math.pow(depth, 1.18);
      const y = HORIZON_Y + ease * (nearY - HORIZON_Y + 80);
      [-1, 1].forEach(function (side, sideIndex) {
        const laneEdgeX = roadBoundaryX(side < 0 ? 0 : LANE_COUNT, ease);
        const outsideSpan = 46 + depth * 116;
        const centerX =
          laneEdgeX +
          side * (outsideSpan + propHash(i * 19 + sideIndex * 41) * (26 + depth * 56));
        const patchWidth = 44 + depth * 112 + propHash(i * 23 + sideIndex * 7) * 44;
        const patchHeight = 8 + depth * 24;
        ctx.fillStyle = i % 2 === 0 ? "rgba(236, 249, 252, 0.22)" : "rgba(94, 145, 172, 0.1)";
        ctx.beginPath();
        ctx.ellipse(centerX, y, patchWidth, patchHeight, -0.08 * side, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();

    const roadShadow = ctx.createLinearGradient(0, HORIZON_Y, 0, nearY + 26);
    roadShadow.addColorStop(0, "rgba(52, 68, 92, 0.06)");
    roadShadow.addColorStop(1, "rgba(32, 45, 66, 0.18)");
    ctx.fillStyle = roadShadow;
    ctx.beginPath();
    ctx.moveTo(roadBoundaryX(0, 0) - 5, HORIZON_Y);
    ctx.lineTo(roadBoundaryX(LANE_COUNT, 0) + 5, HORIZON_Y);
    ctx.lineTo(roadBoundaryX(LANE_COUNT, 1) + 10, nearY + 28);
    ctx.lineTo(roadBoundaryX(0, 1) - 10, nearY + 28);
    ctx.closePath();
    ctx.fill();

    for (let lane = 0; lane < LANE_COUNT; lane += 1) {
      const leftTop = roadBoundaryX(lane, 0);
      const rightTop = roadBoundaryX(lane + 1, 0);
      const leftBottom = roadBoundaryX(lane, 1);
      const rightBottom = roadBoundaryX(lane + 1, 1);
      const topColor = lane % 2 === 0 ? palette.laneTopA : palette.laneTopB;
      ctx.fillStyle = topColor;
      ctx.beginPath();
      ctx.moveTo(leftTop, HORIZON_Y);
      ctx.lineTo(rightTop, HORIZON_Y);
      ctx.lineTo(rightBottom, nearY + 22);
      ctx.lineTo(leftBottom, nearY + 22);
      ctx.closePath();
      ctx.fill();
    }

    ctx.save();
    ctx.strokeStyle = "rgba(220, 242, 250, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(roadBoundaryX(0, 0), HORIZON_Y);
    ctx.lineTo(roadBoundaryX(0, 1), nearY + 22);
    ctx.moveTo(roadBoundaryX(LANE_COUNT, 0), HORIZON_Y);
    ctx.lineTo(roadBoundaryX(LANE_COUNT, 1), nearY + 22);
    ctx.stroke();
    ctx.restore();
  }

  function renderPlayer() {
    const player = runtime.player;
    const runPose = getRunnerPose(player);
    const playerCenterX = player.x + player.width * 0.5;
    const shadowY = player.y + player.height * 0.96;
    const shadowW = (17 + runtime.scrollSpeedNorm * 28) * runPose.shadowW;
    const shadowH = (6 + runtime.scrollSpeedNorm * 8) * runPose.shadowH;
    ctx.fillStyle = "rgba(12, 20, 35, " + runPose.shadowAlpha.toFixed(3) + ")";
    ctx.beginPath();
    ctx.ellipse(playerCenterX + runPose.x * 0.45, shadowY, shadowW, shadowH, 0, 0, Math.PI * 2);
    ctx.fill();
    drawBoosterAura(player, runPose);
    drawRunnerStepEffect(player, runPose);

    const color =
      isBoosterActive()
        ? "#5eeeff"
        : runtime.shieldTimer > 0
          ? "#ffd364"
          : IP_THEME.runner.color;
    const drawWidth = player.width * runPose.scaleX;
    const drawHeight = player.height * runPose.scaleY;
    const drawX = player.x + runPose.x + (player.width - drawWidth) * 0.5;
    const drawY = player.y + player.height - drawHeight;
    const pivotX = drawX + drawWidth * 0.5;
    const pivotY = drawY + drawHeight * 0.82;
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(player.lean * 0.06 + runPose.rotation);
    ctx.translate(-pivotX, -pivotY);
    const rendered = drawRunnerAnimated(player, runPose, drawX, drawY, drawWidth, drawHeight);
    if (!rendered) {
      drawIpSprite(
        "runner",
        drawX,
        drawY,
        drawWidth,
        drawHeight,
        color,
        "RUN"
      );
    }
    ctx.restore();

    if (runtime.blinkTimer > 0 || runtime.shieldTimer > 0) {
      drawRoundedRect(
        player.x - 3,
        player.y - 3,
        player.width + 6,
        player.height + 6,
        10,
        "rgba(255, 219, 141, 0.12)",
        "rgba(255, 213, 128, 0.95)"
      );
    }
  }

  function renderMoleObstacle(obstacle, info) {
    const projected = info.projected;
    const drawWidth = info.drawWidth;
    const drawHeight = info.drawHeight;
    const drawX = info.drawX;
    const drawY = info.drawY;
    const holeY = drawY + drawHeight * 0.92;
    const visibleRatio = moleVisibleRatio(obstacle);
    const moleY = holeY - drawHeight * visibleRatio;
    const holeRadiusX = drawWidth * 0.52;
    const holeRadiusY = Math.max(4, drawHeight * 0.105);
    const snowLipY = holeY - holeRadiusY * 0.08;

    ctx.fillStyle = "rgba(18, 30, 46, 0.68)";
    ctx.beginPath();
    ctx.ellipse(projected.x, holeY, holeRadiusX, holeRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(156, 220, 255, 0.38)";
    ctx.lineWidth = Math.max(1, projected.scale * 1.5);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect(drawX - drawWidth * 0.3, drawY - drawHeight * 0.08, drawWidth * 1.6, holeY - drawY + drawHeight * 0.08);
    ctx.clip();
    const rendered = drawCroppedSprite(
      "moleObstacle",
      drawX,
      moleY,
      drawWidth,
      drawHeight
    );
    if (!rendered) {
      drawRoundedRect(
        drawX + drawWidth * 0.12,
        moleY,
        drawWidth * 0.76,
        drawHeight,
        Math.max(5, drawWidth * 0.18),
        IP_THEME.moleObstacle.color
      );
    }
    ctx.restore();

    ctx.fillStyle = "rgba(223, 245, 255, 0.88)";
    ctx.beginPath();
    ctx.ellipse(projected.x, snowLipY, holeRadiusX * 1.08, holeRadiusY * 0.72, 0, 0, Math.PI);
    ctx.fill();

    ctx.strokeStyle = "rgba(126, 188, 218, 0.34)";
    ctx.lineWidth = Math.max(1, projected.scale * 1.2);
    ctx.beginPath();
    ctx.ellipse(projected.x, snowLipY, holeRadiusX * 1.08, holeRadiusY * 0.72, 0, 0, Math.PI);
    ctx.stroke();
  }

  function renderMovingEnemyObstacle(obstacle, info) {
    const drawWidth = info.drawWidth;
    const drawHeight = info.drawHeight;
    const drawX = info.drawX;
    const drawY = info.drawY;
    const centerX = drawX + drawWidth * 0.5;
    const centerY = drawY + drawHeight * 0.55;
    const bob = Math.sin(obstacle.wobble * 1.5) * drawHeight * 0.025;
    const visualLane = Number.isFinite(obstacle.visualLane) ? obstacle.visualLane : obstacle.lane;
    const laneDrift = obstacle.lane - visualLane;
    const tilt = Math.max(-0.12, Math.min(0.12, laneDrift * -0.08));

    ctx.save();
    ctx.translate(centerX, centerY + bob);
    ctx.rotate(tilt);
    const rendered = drawCroppedSprite(
      "movingEnemy",
      -drawWidth * 0.5,
      -drawHeight * 0.55,
      drawWidth,
      drawHeight
    );
    if (!rendered) {
      drawRoundedRect(
        -drawWidth * 0.44,
        -drawHeight * 0.5,
        drawWidth * 0.88,
        drawHeight,
        Math.max(5, drawWidth * 0.2),
        IP_THEME.movingEnemy.color
      );
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "800 " + Math.max(9, drawWidth * 0.18).toFixed(1) + "px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("MOV", 0, 0);
    }
    ctx.restore();
  }

  function renderObstacles() {
    runtime.obstacles.forEach(function (obstacle) {
      const info = getObstacleDrawInfo(obstacle);
      const projected = info.projected;
      const drawWidth = info.drawWidth;
      const drawHeight = info.drawHeight;
      const drawX = info.drawX;
      const drawY = info.drawY;
      const shadowW = drawWidth * 0.54;
      const shadowH = Math.max(3, drawHeight * 0.12);

      ctx.fillStyle = "rgba(16, 16, 28, 0.24)";
      ctx.beginPath();
      ctx.ellipse(projected.x, drawY + drawHeight * 0.95, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();

      if (obstacle.moveLane === "hole_pop") {
        const holeCenterX = projected.x;
        ctx.fillStyle = "rgba(20, 33, 52, 0.62)";
        ctx.beginPath();
        ctx.ellipse(
          holeCenterX,
          drawY + drawHeight * 0.9,
          drawWidth * 0.46,
          Math.max(4, drawHeight * 0.1),
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.strokeStyle = "rgba(161, 221, 255, 0.38)";
        ctx.lineWidth = Math.max(1, projected.scale * 1.5);
        ctx.stroke();
        const enemyDrawX = drawX + drawWidth * 0.02;
        const enemyDrawY = drawY - drawHeight * 0.08;
        const enemyDrawWidth = drawWidth * 0.96;
        const enemyDrawHeight = drawHeight * 1.08;
        const renderedEnemy = drawCroppedSprite(
          "holeEnemy",
          enemyDrawX,
          enemyDrawY,
          enemyDrawWidth,
          enemyDrawHeight
        );
        if (!renderedEnemy) {
          drawIpSprite(
            "holeEnemy",
            enemyDrawX,
            enemyDrawY,
            enemyDrawWidth,
            enemyDrawHeight,
            IP_THEME.holeEnemy.color,
            "ENM"
          );
        }
        return;
      }

      if (obstacle.moveLane === "mole_pop") {
        renderMoleObstacle(obstacle, info);
        return;
      }

      if (obstacle.moveLane === "moving") {
        renderMovingEnemyObstacle(obstacle, info);
        return;
      }

      if (obstacle.type === "ice_crack" || obstacle.type === "ice_wall") {
        const spriteKey = obstacle.type === "ice_crack" ? "iceCrackObstacle" : "iceWallObstacle";
        if (drawCroppedSprite(spriteKey, drawX, drawY, drawWidth, drawHeight)) {
          return;
        }
      }

      const obstacleGrad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + drawHeight);
      obstacleGrad.addColorStop(0, "rgba(255,255,255,0.18)");
      obstacleGrad.addColorStop(1, obstacle.color);
      ctx.fillStyle = obstacleGrad;
      if (obstacle.moveLane === "overhead") {
        drawRoundedRect(
          drawX,
          drawY - drawHeight * 0.3,
          drawWidth,
          drawHeight,
          Math.max(3, drawWidth * 0.12),
          ctx.fillStyle
        );
      } else {
        drawRoundedRect(
          drawX,
          drawY,
          drawWidth,
          drawHeight,
          Math.max(3, drawWidth * 0.12),
          ctx.fillStyle
        );
      }
      if (obstacle.type === "laser_sign") {
        ctx.fillStyle = "rgba(255, 110, 110, 0.72)";
        drawRoundedRect(drawX, drawY - 4, drawWidth, Math.max(2, drawHeight * 0.08), 2, ctx.fillStyle);
      }
    });
  }

  function renderPoisonShots() {
    runtime.poisonShots.forEach(function (shot) {
      const mag = Math.hypot(shot.vx, shot.vy) || 1;
      const dirX = shot.vx / mag;
      const dirY = shot.vy / mag;
      const tail = 14 + shot.radius * 1.3;
      ctx.strokeStyle = "rgba(157, 255, 144, 0.62)";
      ctx.lineWidth = Math.max(2, shot.radius * 0.45);
      ctx.beginPath();
      ctx.moveTo(shot.x - dirX * tail, shot.y - dirY * tail);
      ctx.lineTo(shot.x, shot.y);
      ctx.stroke();

      const sprite = spritePool.projectile;
      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        const crop = spriteMeta.projectile;
        const sx = crop ? crop.sx : 0;
        const sy = crop ? crop.sy : 0;
        const sw = crop ? crop.sw : sprite.naturalWidth;
        const sh = crop ? crop.sh : sprite.naturalHeight;
        const scale = Math.max(16, shot.radius * 3.4);
        const ratio = sh / sw || 1;
        const drawWidth = scale;
        const drawHeight = scale * ratio;
        const angle = Math.atan2(shot.vy, shot.vx);
        ctx.save();
        ctx.translate(shot.x, shot.y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.drawImage(
          sprite,
          sx,
          sy,
          sw,
          sh,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        );
        ctx.restore();
        return;
      }

      ctx.fillStyle = IP_THEME.projectile.color;
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, Math.max(4, shot.radius), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawBoosterCollectible(item, info) {
    const x = info.coinCenterX;
    const y = info.coinCenterY;
    const r = info.coinRadius * 1.08;
    const pulse = 0.5 + Math.sin(item.wobble * 2.2) * 0.5;
    const spin = Math.sin(item.wobble * 1.5) * 0.12;

    const glow = ctx.createRadialGradient(x, y, 2, x, y, r * 2.2);
    glow.addColorStop(0, "rgba(113, 247, 255, 0.9)");
    glow.addColorStop(0.44, "rgba(56, 203, 255, 0.36)");
    glow.addColorStop(1, "rgba(56, 203, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * (1.72 + pulse * 0.16), 0, Math.PI * 2);
    ctx.fill();

    if (spritePool.booster && spritePool.booster.complete && spritePool.booster.naturalWidth > 0) {
      const imageWidth = info.drawWidth * (1.22 + pulse * 0.04);
      const imageHeight = info.drawHeight * (1.18 + pulse * 0.04);
      const bob = Math.sin(item.wobble * 1.8) * r * 0.08;
      drawCroppedSprite(
        "booster",
        x - imageWidth * 0.5,
        y - imageHeight * 0.56 + bob,
        imageWidth,
        imageHeight
      );
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);
    ctx.fillStyle = "#42ddff";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.86)";
    ctx.lineWidth = Math.max(1.4, r * 0.11);
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.04);
    ctx.lineTo(r * 0.95, 0);
    ctx.lineTo(0, r * 1.04);
    ctx.lineTo(-r * 0.95, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff38a";
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, -r * 0.72);
    ctx.lineTo(r * 0.32, -r * 0.12);
    ctx.lineTo(r * 0.04, -r * 0.08);
    ctx.lineTo(r * 0.2, r * 0.72);
    ctx.lineTo(-r * 0.38, r * 0.02);
    ctx.lineTo(-r * 0.08, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(9, 48, 78, 0.82)";
    ctx.font = "800 " + Math.max(8, r * 0.44).toFixed(1) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("B", 0, r * 0.06);
    ctx.restore();
  }

  function renderCollectibles() {
    runtime.collectibles.forEach(function (item) {
      const info = getCollectibleDrawInfo(item);
      const projected = info.projected;
      const drawWidth = info.drawWidth;
      const drawHeight = info.drawHeight;
      const drawX = info.drawX;
      const drawY = info.drawY;
      const coinCenterX = info.coinCenterX;
      const coinCenterY = info.coinCenterY;
      const coinRadius = info.coinRadius;
      const spin = Math.sin(item.wobble * 1.25);
      const coinImage = spritePool.collectible;

      if (item.kind === "booster") {
        drawBoosterCollectible(item, info);
        return;
      }

      if (coinImage && coinImage.complete && coinImage.naturalWidth > 0) {
        drawIpSprite(
          "collectible",
          drawX,
          drawY,
          drawWidth,
          drawHeight,
          IP_THEME.collectible.color,
          "COL"
        );
        return;
      }

      if (!MOBILE_PERF_MODE) {
        const glow = ctx.createRadialGradient(
          coinCenterX,
          coinCenterY,
          2,
          coinCenterX,
          coinCenterY,
          coinRadius * 1.55
        );
        glow.addColorStop(0, "rgba(255, 224, 107, 0.82)");
        glow.addColorStop(1, "rgba(255, 224, 107, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(coinCenterX, coinCenterY, coinRadius * 1.55, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#ffcc33";
      ctx.beginPath();
      ctx.ellipse(
        coinCenterX,
        coinCenterY,
        coinRadius * (0.82 + Math.abs(spin) * 0.24),
        coinRadius * 0.9,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.strokeStyle = "#ff9f00";
      ctx.lineWidth = Math.max(1.2, projected.scale * 1.15);
      ctx.beginPath();
      ctx.ellipse(
        coinCenterX,
        coinCenterY,
        coinRadius * (0.62 + Math.abs(spin) * 0.16),
        coinRadius * 0.68,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      drawCoinGlyph(coinCenterX, coinCenterY, coinRadius * 0.38);
    });
  }

  function propHash(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }

  function sidePropSpriteKey(type) {
    if (type === 0) {
      return "sideTree";
    }
    if (type === 1) {
      return "sideSign";
    }
    return "sideIgloo";
  }

  function sidePropBaseWidth(spriteKey) {
    return sidePropSize(spriteKey).width;
  }

  function sidePropSize(spriteKey) {
    const sizeScale = Math.max(0.9, Math.min(1.1, canvas.width / 390));
    if (spriteKey === "sideSign") {
      return {
        width: 58 * sizeScale,
        height: 43 * sizeScale
      };
    }
    if (spriteKey === "sideIgloo") {
      return {
        width: 54 * sizeScale,
        height: 40 * sizeScale
      };
    }
    return {
      width: 54 * sizeScale,
      height: 64 * sizeScale
    };
  }

  function sidePropLaneX(side, spriteKey, y) {
    const width = sidePropBaseWidth(spriteKey);
    const edgeGap = Math.max(8, canvas.width * 0.026);
    const ease = roadEaseAtY(y);
    const roadEdgeX = roadBoundaryX(side < 0 ? 0 : LANE_COUNT, ease);
    return roadEdgeX + side * (width * 0.5 + edgeGap);
  }

  function drawSideProp(prop) {
    const depth = prop.depth;
    const x = prop.x;
    const y = prop.y;
    const alpha = 0.82;
    const spriteKey = sidePropSpriteKey(prop.type);
    const hasSprite = isSpriteReady(spriteKey);
    const size = sidePropSize(spriteKey);
    const width = size.width;
    const height = size.height;

    ctx.save();
    ctx.globalAlpha = alpha;
    if (hasSprite) {
      const drawWidth = width;
      const drawHeight = height;
      if (x - drawWidth * 0.5 < 0 || x + drawWidth * 0.5 > canvas.width) {
        ctx.restore();
        return;
      }
      ctx.fillStyle = "rgba(8, 18, 30, 0.2)";
      ctx.beginPath();
      ctx.ellipse(
        x,
        y + drawHeight * 0.04,
        drawWidth * 0.45,
        Math.max(3, drawHeight * 0.09),
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      drawCroppedSprite(
        spriteKey,
        x - drawWidth * 0.5,
        y - drawHeight,
        drawWidth,
        drawHeight
      );
      ctx.restore();
      return;
    }

    ctx.fillStyle = "rgba(9, 22, 36, " + (0.14 + depth * 0.12) + ")";
    ctx.beginPath();
    ctx.ellipse(
      x,
      y + height * 0.06,
      width * 0.54,
      Math.max(3, height * 0.08),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (prop.type === 0) {
      const grad = ctx.createLinearGradient(x - width / 2, y - height, x + width / 2, y);
      grad.addColorStop(0, "#f2fbff");
      grad.addColorStop(0.58, "#b8d7e8");
      grad.addColorStop(1, "#6f91aa");
      drawRoundedRect(
        x - width / 2,
        y - height,
        width,
        height,
        Math.max(4, width * 0.18),
        grad,
        "rgba(255,255,255,0.22)"
      );
      ctx.fillStyle = "rgba(255,255,255,0.42)";
      drawRoundedRect(
        x - width * 0.34,
        y - height * 0.9,
        width * 0.18,
        height * 0.72,
        Math.max(2, width * 0.08),
        ctx.fillStyle
      );
    } else if (prop.type === 1) {
      const grad = ctx.createLinearGradient(x, y - height, x, y);
      grad.addColorStop(0, "#e8f6ff");
      grad.addColorStop(1, "#86a9bd");
      drawRoundedRect(
        x - width * 0.62,
        y - height * 0.72,
        width * 1.24,
        height * 0.72,
        Math.max(5, width * 0.2),
        grad,
        "rgba(255,255,255,0.18)"
      );
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      drawRoundedRect(
        x - width * 0.72,
        y - height * 0.82,
        width * 1.44,
        height * 0.22,
        Math.max(5, width * 0.18),
        ctx.fillStyle
      );
    } else {
      const topY = y - height;
      ctx.fillStyle = "#d8f4ff";
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x + width * 0.6, y - height * 0.1);
      ctx.lineTo(x - width * 0.48, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(85, 139, 170, 0.42)";
      ctx.beginPath();
      ctx.moveTo(x, topY + height * 0.18);
      ctx.lineTo(x + width * 0.36, y - height * 0.12);
      ctx.lineTo(x - width * 0.18, y - height * 0.04);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function renderSpeedFx() {
    if (MOBILE_PERF_MODE) {
      return;
    }
    const usingImageBackground = isSpriteReady("ingameBackground");
    const startY = roadHorizonY() + canvas.height * 0.11;
    const endY = canvas.height + 78;
    const travelRange = endY - startY;
    const flow = runtime.sideObjectFlow;
    const props = [];

    for (let i = 0; i < SIDE_PROP_SLOT_COUNT; i += 1) {
      const rawDepth = flow + i / SIDE_PROP_SLOT_COUNT;
      const cycleIndex = Math.floor(rawDepth);
      const seed = i * 17 + cycleIndex * 97;
      const baseDepth = rawDepth - cycleIndex;
      const depth = Math.max(0.02, baseDepth);
      const y = startY + depth * travelRange;
      const side = propHash(seed + 27) < 0.5 ? -1 : 1;
      const type = i % 3;
      const spriteKey = sidePropSpriteKey(type);
      props.push({
        depth,
        x: sidePropLaneX(side, spriteKey, y),
        y,
        side,
        type
      });
    }

    props.sort(function (a, b) {
      return a.depth - b.depth;
    });
    props.forEach(drawSideProp);

    const vignette = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.45,
      canvas.width * 0.22,
      canvas.width * 0.5,
      canvas.height * 0.45,
      canvas.height * 0.95
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, usingImageBackground ? "rgba(6, 17, 26, 0.045)" : "rgba(6, 17, 26, 0.08)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function renderHud() {
    if (runtime.hudRefreshClock < HUD_UPDATE_INTERVAL_SEC) {
      return;
    }
    runtime.hudRefreshClock = 0;
    currentStage();
    const missionLabel = runtime.missionDone
      ? "완료"
      : "점수 " +
        MISSION_SCORE_TARGET +
        "+ / 거리 " +
        MISSION_DISTANCE_TARGET +
        "m" +
        "+ / 수집 " +
        MISSION_COLLECTIBLE_TARGET +
        "+";

    hudCharacter.textContent = selectedCharacter().displayName;
    hudStage.textContent = String(Math.floor(runtime.distanceMeters));
    hudTime.textContent = String(runtime.speedTier + 1);
    hudScore.textContent = String(Math.round(runtime.score)).padStart(5, "0");
    hudToken.textContent = String(runtime.collectedTokens);
    hudMission.textContent = missionLabel;
    hudSkill.textContent =
      runtime.skillCooldown > 0 ? runtime.skillCooldown.toFixed(1) + "s" : "준비됨";

    const survivalRatio = Math.max(0, Math.min(1, runtime.survivalGauge / SURVIVAL_MAX));
    if (survivalFill) {
      survivalFill.style.width = (survivalRatio * 100).toFixed(1) + "%";
      if (isBoosterActive()) {
        survivalFill.style.background =
          "linear-gradient(90deg, #42ddff, #fff38a)";
      } else {
        const hue = 12 + survivalRatio * 102;
        survivalFill.style.background =
          "linear-gradient(90deg, hsl(" +
          hue +
          " 88% 56%), hsl(" +
          (hue + 18) +
          " 90% 60%))";
      }
    }
    if (survivalValue) {
      survivalValue.textContent = isBoosterActive()
        ? "BOOST " + Math.ceil(runtime.boosterTimer) + "s"
        : Math.round(survivalRatio * 100) + "%";
    }
  }

  function renderRunScene() {
    renderBackground();
    renderGround();
    renderSpeedFx();
    renderObstacles();
    renderPoisonShots();
    renderCollectibles();
    renderPlayer();
    renderHud();
  }

  function startCountdown() {
    cancelCountdown(false);
    runtime.countdownActive = true;
    runtime.lastFrameTime = performance.now();

    [
      { text: "3", delay: 0, duration: 820 },
      { text: "2", delay: 820, duration: 820 },
      { text: "1", delay: 1640, duration: 820 },
      { text: "GO!", delay: 2460, duration: 620 }
    ].forEach(function (step) {
      const timerId = window.setTimeout(function () {
        showOverlay(step.text, step.duration, "countdown");
        if (step.text === "3" || step.text === "2" || step.text === "1") {
          playCountdownSfx();
        }
        if (step.text === "GO!") {
          playGoCountdownSfx();
          runtime.countdownActive = false;
          runtime.lastFrameTime = performance.now();
          queueIngameBgmAfterGo();
        }
      }, step.delay);
      countdownTimers.push(timerId);
    });

    const cleanupTimer = window.setTimeout(function () {
      countdownTimers = [];
    }, 3120);
    countdownTimers.push(cleanupTimer);
  }

  function frame(now) {
    if (!runtime.running) {
      runtime.frameHandle = null;
      return;
    }
    const frameTime = Number.isFinite(now) ? now : performance.now();
    runtime.frameToken += 1;
    if (runtime.paused || runtime.countdownActive) {
      runtime.lastFrameTime = frameTime;
      renderRunScene();
      runtime.frameHandle = requestAnimationFrame(frame);
      return;
    }
    const lastFrameTime = Number.isFinite(runtime.lastFrameTime)
      ? runtime.lastFrameTime
      : frameTime;
    const dt = Math.min(0.05, Math.max(0, (frameTime - lastFrameTime) / 1000));
    runtime.lastFrameTime = frameTime;
    updateRun(dt);
    if (!runtime.running) {
      runtime.frameHandle = null;
      return;
    }
    renderRunScene();
    runtime.frameHandle = requestAnimationFrame(frame);
  }

  function startRun() {
    cancelFrameLoop();
    cancelCountdown(true);
    stopIngameBgm(true);
    resetRunState();
    switchScene(sceneGame);
    const character = selectedCharacter();
    emitTelemetry("session_start", {
      characterId: character.id,
      stageId: 1,
      gameMode: "endless",
      campaign: "ip_marketing_demo"
    });
    startCountdown();
    runtime.frameHandle = requestAnimationFrame(frame);
  }

  async function onShare() {
    const text =
      (playerNickname || "플레이어") +
      " | PENGUIN DASH 결과 | 거리 " +
      Math.round(runtime.distanceMeters) +
      "m | 단계 " +
      (runtime.speedTier + 1) +
      "단계";

    let success = false;
    try {
      if (navigator.share) {
        await navigator.share({ text: text });
        success = true;
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        success = true;
        alert("결과 문구를 복사했습니다.");
      }
    } catch (_err) {
      success = false;
    }

    emitTelemetry("share_click", {
      characterId: selectedCharacter().id,
      stageId: runtime.speedTier + 1,
      distance: Math.round(runtime.distanceMeters),
      variant: shareVariant,
      success: success
    });
  }

  function bindInput() {
    if (startButton) {
      startButton.addEventListener("click", function () {
        playStartClickSfx();
        openNicknameModal();
      });
    }
    if (nicknameForm) {
      nicknameForm.addEventListener("submit", function (event) {
        event.preventDefault();
        submitNicknameAndStart();
      });
    }
    if (nicknameInput) {
      nicknameInput.addEventListener("input", function () {
        setNicknameError("");
      });
    }
    if (sceneStart) {
      sceneStart.addEventListener("pointerdown", function (event) {
        if (!sceneStart.classList.contains("scene-active")) {
          return;
        }
        if (
          nicknameModal &&
          !nicknameModal.classList.contains("hidden") &&
          (!nicknameForm ||
            !(event.target && event.target.closest && event.target.closest("#nickname-form")))
        ) {
          return;
        }
        if (event.target && event.target.closest && event.target.closest("#start-button")) {
          return;
        }
        playTitleBgm(false);
      });
    }
    if (retryButton) {
      retryButton.addEventListener("click", function () {
        emitTelemetry("retry_click", {
          characterId: selectedCharacter().id,
          stageId: runtime.speedTier + 1,
          distance: Math.round(runtime.distanceMeters),
          reason: runtime.runEndedReason
        });
        startRun();
      });
    }
    if (shareButton) {
      shareButton.addEventListener("click", onShare);
    }
    if (resultTauntSaveButton) {
      resultTauntSaveButton.addEventListener("click", submitResultTaunt);
    }
    if (resultTauntInput) {
      resultTauntInput.addEventListener("input", function () {
        setResultTauntHint("저장 버튼을 누르면 반영돼");
      });
      resultTauntInput.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") {
          return;
        }
        event.preventDefault();
        submitResultTaunt();
      });
    }
    if (skillButton) {
      skillButton.addEventListener("click", runSkill);
    }
    if (pauseToggleButton) {
      pauseToggleButton.addEventListener("click", function (event) {
        event.preventDefault();
        togglePause();
      });
    }

    function bindMoveButton(button, moveFn) {
      if (!button) {
        return;
      }
      button.addEventListener("pointerdown", function (event) {
        event.preventDefault();
        if (!runtime.running || runtime.paused) {
          return;
        }
        moveFn();
      });
    }

    bindMoveButton(moveLeftButton, queueMoveLeft);
    bindMoveButton(moveRightButton, queueMoveRight);

    window.addEventListener("keydown", function (event) {
      if (!runtime.running) {
        return;
      }
      if (event.code === "KeyP") {
        event.preventDefault();
        if (!event.repeat) {
          togglePause();
        }
        return;
      }
      if (runtime.paused) {
        return;
      }
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        event.preventDefault();
        if (!event.repeat) {
          queueMoveLeft();
        }
      } else if (event.code === "ArrowRight" || event.code === "KeyD") {
        event.preventDefault();
        if (!event.repeat) {
          queueMoveRight();
        }
      } else if (event.code === "KeyE") {
        runSkill();
      }
    });

    canvas.addEventListener("pointerdown", function (event) {
      if (!runtime.running || runtime.paused) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      if (x < rect.width / 2) {
        queueMoveLeft();
      } else {
        queueMoveRight();
      }
    });
  }

  function init() {
    try {
      const loadedCharacters = JSON.parse(JSON.stringify(characterManifest));
      const loadedStages = JSON.parse(JSON.stringify(stageConfig));

      if (!loadedCharacters.every(validateCharacterManifest)) {
        throw new Error("CharacterManifest schema mismatch");
      }
      if (!loadedStages.every(validateStageConfig)) {
        throw new Error("StageConfig schema mismatch");
      }

      characters = loadedCharacters.slice(0, 1);
      selectedCharacterIndex = 0;
      stages = loadedStages;
      primeSprite(IP_THEME.runner, "runner");
      primeRunnerFrameSprites();
      primeSprite(IP_THEME.holeEnemy, "holeEnemy");
      primeSprite(IP_THEME.collectible, "collectible");
      primeSprite(IP_THEME.booster, "booster");
      primeSprite(IP_THEME.moleObstacle, "moleObstacle");
      primeSprite(IP_THEME.movingEnemy, "movingEnemy");
      primeSprite(IP_THEME.iceCrackObstacle, "iceCrackObstacle");
      primeSprite(IP_THEME.iceWallObstacle, "iceWallObstacle");
      primeSprite(IP_THEME.ingameBackground, "ingameBackground");
      primeSprite(IP_THEME.sideTree, "sideTree");
      primeSprite(IP_THEME.sideSign, "sideSign");
      primeSprite(IP_THEME.sideIgloo, "sideIgloo");
      primeSprite(IP_THEME.projectile, "projectile");
      ensureStartClickSfx();
      ensureCountdownSfx();
      ensureGoCountdownSfx();
      ensureIngameBgm();
      ensureResultBgm();
      syncResultTauntEditor();
      bindInput();
      document.addEventListener("visibilitychange", function () {
        if (
          document.visibilityState === "visible" &&
          sceneStart &&
          sceneStart.classList.contains("scene-active")
        ) {
          playTitleBgm(false);
        } else if (
          document.visibilityState === "visible" &&
          sceneGame &&
          sceneGame.classList.contains("scene-active") &&
          runtime.running &&
          !runtime.countdownActive
        ) {
          playIngameBgm(false);
        }
      });
      window.addEventListener("focus", function () {
        if (sceneStart && sceneStart.classList.contains("scene-active")) {
          playTitleBgm(false);
        }
      });
      window.addEventListener("pageshow", function () {
        if (sceneStart && sceneStart.classList.contains("scene-active")) {
          playTitleBgm(false);
        }
      });
      switchScene(sceneStart);
    } catch (error) {
      sceneStart.innerHTML =
        '<section class="panel"><h2>초기화 실패</h2><p>' +
        error.message +
        "</p></section>";
    }
  }

  init();
})();
