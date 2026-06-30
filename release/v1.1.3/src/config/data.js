export const characterManifest = [
  {
    id: "speedster_penguin",
    displayName: "스피드 펭귄",
    roleType: "speed",
    baseSpeed: 305,
    jumpPower: 540,
    skillId: "rush_boost",
    cooldownSec: 14,
    unlockCondition: "default",
    quote: "바람을 가르며 마케팅 임무 개시!"
  },
  {
    id: "steady_seal",
    displayName: "스테디 물개",
    roleType: "stable",
    baseSpeed: 278,
    jumpPower: 565,
    skillId: "safe_shield",
    cooldownSec: 16,
    unlockCondition: "default",
    quote: "안정적인 완주가 최고의 설득이다!"
  },
  {
    id: "spark_fox",
    displayName: "스파크 폭스",
    roleType: "skill",
    baseSpeed: 290,
    jumpPower: 550,
    skillId: "time_slow",
    cooldownSec: 15,
    unlockCondition: "campaign_share_1",
    quote: "지금 이 순간의 주목도를 끌어올려!"
  }
];

export const stageConfig = [
  {
    stageId: 1,
    durationSec: 24,
    obstacleSet: ["ice_crack", "small_block", "cold_flag"],
    spawnPattern: {
      minGap: 1.0,
      maxGap: 1.8,
      weights: {
        ice_crack: 0.45,
        small_block: 0.35,
        cold_flag: 0.2
      }
    },
    difficultyTier: "easy",
    clearReward: "브랜드 스티커 1"
  },
  {
    stageId: 2,
    durationSec: 25,
    obstacleSet: ["ice_wall", "slope_hole", "drone_banner"],
    spawnPattern: {
      minGap: 0.85,
      maxGap: 1.5,
      weights: {
        ice_wall: 0.35,
        slope_hole: 0.4,
        drone_banner: 0.25
      }
    },
    difficultyTier: "normal",
    clearReward: "프로모션 쿠폰 조각"
  },
  {
    stageId: 3,
    durationSec: 26,
    obstacleSet: ["storm_gate", "moving_crate", "laser_sign"],
    spawnPattern: {
      minGap: 0.72,
      maxGap: 1.2,
      weights: {
        storm_gate: 0.3,
        moving_crate: 0.45,
        laser_sign: 0.25
      }
    },
    difficultyTier: "hard",
    clearReward: "한정 캐릭터 배지"
  }
];
