# Public Interfaces / Data Contracts

## CharacterManifest
- 위치: `src/config/characters.json`
- 필드:
  - `id`
  - `displayName`
  - `roleType`
  - `baseSpeed`
  - `jumpPower`
  - `skillId`
  - `cooldownSec`
  - `unlockCondition`

## StageConfig
- 위치: `src/config/stages.json`
- 필드:
  - `stageId`
  - `durationSec`
  - `obstacleSet[]`
  - `spawnPattern`
  - `difficultyTier`
  - `clearReward`

## TelemetryEvent
- 필수 이벤트:
  - `session_start`
  - `stage_start`
  - `hit_obstacle`
  - `stage_clear`
  - `run_end`
  - `retry_click`
  - `share_click`
- 공통 필드:
  - `userId`
  - `characterId`
  - `stageId`
  - `timestamp`
  - `appVersion`

## 배포 인터페이스
- 위치: `release/artifact-manifest.json`
- 관리 항목:
  - `versionTag`
  - `webUrl`
  - `changelog`
