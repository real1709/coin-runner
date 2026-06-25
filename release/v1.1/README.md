# IP Stage Runner Demo

회사 IP 캐릭터 기반 `남극탐험 스타일` 스테이지 러너 미니게임 데모입니다.

## 1) 실행
- `cd /Users/al02490068/Desktop/PROJECT/GAME`
- `npm run serve`
- 브라우저에서 `http://localhost:4173` 접속

서버 실행이 제한된 환경에서는 `/Users/al02490068/Desktop/PROJECT/GAME/index.html` 파일을 브라우저로 직접 열어도 데모가 동작합니다.
(`file://` 실행 호환을 위해 `src/main.bundle.js` 단일 스크립트를 기본 로더로 사용합니다.)

## 2) 핵심 스펙
- 버전: `v1.1`
- 진행 방식: 원근 기반 세로 무한 러너
- 레인: 5레인 좌우 이동
- 조작: 좌/우 이동(좌측 탭/우측 탭 또는 ←/→, A/D, 모바일 좌/우 버튼)
- 시작 연출: `3, 2, 1, GO!` 카운트다운 후 출발
- 속도 구조: 15초마다 단계 상승, 단계 상승 시 속도와 생존 게이지 감소 속도 증가
- 생존 구조: 생존 게이지가 지속 감소하며 코인 획득 시 일부 회복
- 루프: 플레이 -> 충돌/생존 게이지 소진 -> 결과 -> 즉시 재도전
- 캐릭터: 단일 펭귄 러너, 오른발/왼발 2프레임 애니메이션
- 적 패턴: 적 캐릭터가 플레이어 위치를 향해 투사체 발사
- 충돌 판정: 동전/장애물/적군/투사체 모두 실제 화면 충돌 박스 기준
- UI: 거리/단계 HUD, 생존 게이지, pause/play 버튼, 거리 순위 결과 화면
- 마케팅 기능: 공유 버튼
- 텔레메트리 이벤트:
  - `session_start`
  - `stage_start`
  - `hit_obstacle`
  - `stage_clear`
  - `run_end`
  - `retry_click`
  - `share_click`

## 3) 데이터 계약
- `CharacterManifest`: `src/config/characters.json`
- `StageConfig`: `src/config/stages.json`
- 계약 검증 코드: `src/contracts.js`

## 4) 검증
- 계약/구조 테스트: `npm test`
- 설정 검증: `npm run validate:config`

## 5) 배포 3종 세트
- 버전 태그: `v1.1`
- 웹 URL: `release/artifact-manifest.json`의 `webUrl`
- 변경로그: `CHANGELOG.md`
- 저장 스냅샷: `release/v1.1`

## 6) 계획 문서
- 1주 실행 일정: `docs/EXECUTION_SCHEDULE.md`
- 상용화(8~10주): `docs/COMMERCIALIZATION_ROADMAP.md`
- 테스트/KPI: `docs/TEST_PLAN.md`

## 7) 회사 IP 캐릭터 교체
- 파일: `src/main.bundle.js`
- 상단 `IP_THEME`에서 아래 슬롯을 교체:
  - `runner.frameImages`: 플레이어 러너 오른발/왼발 프레임
  - `holeEnemy.imageSrc`: 적 캐릭터
  - `projectile.imageSrc`: 투사체
  - `collectible.imageSrc`: 수집 오브젝트
- `imageSrc`에 로컬 이미지 경로를 넣으면 해당 이미지로 렌더링됩니다. 비워두면 색상+라벨 박스로 표시됩니다.
