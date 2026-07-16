# g2u5 랩 재제작 — 세션 인계 문서 (2026-07-17 작성)

> **다음 세션(다른 계정 가능)이 이 파일만 읽으면 이어서 진행할 수 있게 쓴 인계장이다.**
> 지시서 본문은 **`qa/g2u5-rebuild-brief.md`**(codex에게 던질 문서). 이 파일은 **왜·어디까지·다음에 뭘**을 담는다.

## 1. 배경 — 무엇을 왜 하는가

사용자 판정: **codex가 만든 중2 V 식물과 에너지(g2u5)의 "레슨 부분이 마음에 안 든다."**
역할 분담이 정해졌다 — **Fable이 기획자(브리프 작성·검수), codex가 구현자.**
6단원(g2u6)이 `qa/g2u6-brief.md`로 그렇게 진행 중이라, 5단원도 같은 방식으로 간다.

## 2. 진단 결과 (Fable, 2026-07-17) — 이걸 모르면 또 똑같이 만든다

교과서(`중학교 교과서/과학_중2_미래엔_교과서(일반)/05_식물과_에너지_텍스트보존_압축.pdf`, 15쪽 전문
pypdf로 추출 — poppler는 한글 CMap 깨짐) 정독 + 기존 구현 전수 확인 결과:

- **콘텐츠 텍스트는 훌륭하다** — `content/g2/unit5.ts`(824줄)의 훅·concept·recap(`more` 400~800자 규격 준수)·
  문제·오답 해설은 품질 바를 이미 충족한다. **여기는 건드릴 필요 없다.**
- **문제는 랩이다. 6종 중 5종이 "버튼을 순서대로 누르면 애니메이션이 재생되는" 감상형.**
  추측이 아니라 `qa/e2e-g2u5.mjs`가 각 랩의 실제 조작을 그대로 인코딩하고 있어 확정된 사실:

| 레슨 | 랩 | 현재 조작(e2e 기준) | 판정 |
|---|---|---|---|
| L1 | leafFactoryLab | 물→이산화 탄소→빛→광합성 시작→녹말 저장 (버튼 5연타) | ✗ 감상형 |
| L2 | photoEvidenceLab | 센서 관찰→암처리→탈색→헹굼→아이오딘 (버튼 5연타) | ✗ 감상형 |
| **L3** | **photoFactorLab** | **슬라이더로 빛·CO₂·온도를 하나씩** | **✓ 유일하게 제대로 — 유지** |
| L4 | plantRespireLab | 포도당 넣기→산소 넣기→호흡 시작 (버튼 3연타) | ✗ 감상형 |
| L5 | dayNightLab | "강한 낮"/"빛 없는 밤" 사진 2장 토글 | ✗✗ 가장 얇음 |
| L6 | sugarJourneyLab | 잎에서 포도당→밤 설탕→어린잎→열매→뿌리 (버튼 5연타) | ✗ 감상형 |

플레이북 §0.1의 기준 질문("이 개념이 눈에 보이려면 학생이 **무엇을 직접 움직여야** 하는가")을 5종이 통과 못 한다.

- **부수 발견 — 인프라 결함(사고 박물관 #16 그대로 방치됨)**:
  `qa/process-geo.mjs`의 `ASPECT_DIRS`에 **`public/plant/*`가 등록돼 있지 않고**, `qa/order-plant.sh`도 **없다.**
  즉 지금은 plant 이미지를 발주해도 webp 변환이 안 된다. 브리프 §4가 이걸 먼저 고치라고 지시한다.

## 3. 산출물 (완료)

- **`qa/g2u5-rebuild-brief.md`** — codex용 지시서. 완성됨. 핵심 설계 결정 3가지:
  1. **손댈 범위를 랩 렌더러 5개 파일로 격리.** dsl 시그니처가 이미 `{title, lead?, cta?, curio?}`라
     content·dsl·registry·curriculum·home·tokens를 **안 건드려도 컴파일이 유지**된다.
     → **g2u6 codex가 건드리는 파일과 겹치는 게 0건**(병행 안전성 확보).
  2. **랩 5종을 조작형으로 재설계**(§2). 간판은 **L5 「24시간 기체 수지 다이얼」** —
     빛 세기를 연속으로 돌려 광합성/호흡 속도 막대와 **순 기체 화살표가 뒤집히는 경계**를 학생이 직접 찾는다
     (지금은 사진 2장 토글). L3는 잘 됐으니 유지.
  3. **이미지는 SVG 전용이 아니다**(사용자 명시 지시) — 판정 구조(기공·엽록체·그래프·화살표)는 벡터,
     실사(식물 전체·온실·저장 식품·낮밤 관찰실·스틱맨 컷)는 발주. **다만 대부분 이미 존재하니 재사용이 1순위**
     (목록은 `qa/g2u5-image-prompts.md`). 새로 필요할 때만 발주하고, 그 전에 process-geo 등록부터 고친다.

## 4. 현재 상태 — **발사 보류 중 (여기서 멈췄다)**

`codex exec`가 **2건** 실행 중이라 쏘지 않았다. CLAUDE.md의 **병렬 codex 금지** 때문:

- PID 43016 · PID 60788 — **둘 다 `qa/g2u6-brief.md`로 g2u6를 만드는 중복 프로세스.**
  같은 리포(`-C "D:/Brilliant Science/app"`)에 같은 지시서로 동시에 쓰고 있어 서로 덮어쓸 위험이 있다.
  **사용자에게 보고했고, 정리 여부는 사용자 결정 대기 중.**
- PID 6176은 Codex 데스크톱 앱 **상주 서버(app-server)** — 이건 영원히 떠 있는 정상 프로세스라 무시한다.

**발사를 미룬 진짜 이유는 파일 충돌이 아니라 `tsc` 게이트다.** g2u6 브리프가 명시하듯
*"hook.ts가 hookBody.ts를 import하도록 이미 작성됨(파일이 없어 지금은 컴파일 에러)"* —
즉 **작업 중인 리포는 tsc가 깨져 있다.** g2u5 브리프는 "랩 하나 완성 → `npx tsc --noEmit` 통과 → 다음"을
게이트로 요구하므로, 지금 쏘면 g2u5 codex가 **남이 낸 에러를 자기 잘못으로 오인해 남의 파일을 고치려 든다.**

## 5. 다음 세션이 할 일 (순서대로)

### ① 발사 가능한지 확인 (프로세스명 아닌 **CommandLine의 `exec`**로 판별)
```powershell
Get-CimInstance Win32_Process -Filter "Name like '%codex%'" |
  Where-Object { $_.CommandLine -like "* exec *" } |
  Select-Object ProcessId, CommandLine
```
결과가 **비어 있어야** 발사한다(상주 app-server는 `exec`가 없어 자동 제외된다 — 이름만 보면 무한 대기하는 실사고가 있었다).
추가로 `npx tsc --noEmit`이 **깨끗한지** 확인한다(g2u6 잔여 에러가 없어야 g2u5 게이트가 의미를 가진다).

### ② codex 발사 (g2u6 방식과 동일한 형식)
```bash
codex exec --skip-git-repo-check -s workspace-write -m gpt-5.6-sol -c model_reasoning_effort=xhigh \
  -C "D:/Brilliant Science/app" \
  "qa/g2u5-rebuild-brief.md 를 읽고 그 지시서대로 중2 V 식물과 에너지(g2u5)의 랩 5종을 재제작하라. 지시서의 작업 순서 6단계를 그대로 따르고, 랩 하나 끝낼 때마다 npx tsc --noEmit 로 검증하라. 손대도 되는 파일은 지시서 §1에 적힌 것뿐이다. 완료되면 바꾼 파일 목록, 각 랩의 3목표 조작 요약, tsc/build 결과를 보고하라."
```
- **샌드박스**: 코딩만이면 `-s workspace-write`로 충분(네트워크 불필요). **이미지 발주가 필요해지면 별도 실행**으로
  `-s danger-full-access`를 써야 한다(workspace-write는 outbound가 `ERR_NETWORK_ACCESS_DENIED`로 막힘).
  발주는 **순차만**(병렬 codex는 tmp/ 충돌 — 사고 #13).
- 백그라운드로 돌리고 완료 알림을 받는다.

### ③ 작업물 검수 (**사용자 요청: 이때 Fable로 모델 바꿔서 검수**)
- 사용자에게 **작업물 도착을 알린다**(사용자가 명시 요청한 사항).
- 검수 항목:
  - `npx tsc --noEmit` + `npm run build` 통과
  - **각 랩이 진짜 조작형인가** — 목표 칩 3개가 **연속 변수 조작**으로 켜지는가, 아니면 또 버튼 카운트인가(재발 여부가 핵심)
  - L5가 순 기체 화살표 뒤집힘·경계 찾기를 실제로 구현했는가, L3(photoFactorLab)를 망가뜨리지 않았는가
  - cleanup 완비(loop.stop·리스너·타이머), 포인터 캡처가 plantKit `safePointerCapture()`인가
  - 언어: '교과서' 0건, 이모지 0건, **L5에 '보상점' 0건**(중2 미도입 용어)
  - `qa/e2e-g2u5.mjs`의 헬퍼 5종이 새 조작에 맞게 갱신됐는가(L3 photoFactor 헬퍼는 그대로여야 함)
  - 발주했다면: png 삭제·webp만, 이미지 안 글자 없음, process-geo에 폴더 등록됨, `loading="lazy"` 0건
- e2e 실행은 **다른 세션 dev 서버와 충돌**하니 워크트리 격리 권장(CLAUDE.md의 m1u6/m2u3 선례).

## 6. 참고 파일

| 파일 | 용도 |
|---|---|
| `qa/g2u5-rebuild-brief.md` | **codex에게 던질 지시서(본체)** |
| `qa/g2u6-brief.md` | 브리프 포맷의 원본(6단원, 진행 중) |
| `qa/g2u5-blueprint.md` | g2u5 최초 설계도(구판 — 이번 진단의 대상) |
| `qa/g2u5-image-prompts.md` | 기존 plant 발주 에셋 목록·의도(재사용 1순위) |
| `qa/e2e-g2u5.mjs` | 현재 랩 조작의 **증거**이자, 재제작 후 갱신 대상 |
| `src/lessons/steps/buoyancyLab.ts` | 캔버스 조작형 랩의 **기준 구현**(재설계의 뼈대) |
| `src/ui/plantKit.ts` | 식물 소품 단일 진실 공급원(`safePointerCapture`·`drawChloroplast`·`drawStoma` 등 이미 있음) |
| `.claude/skills/build-unit/SKILL.md` | 제작 플레이북(§0 작동 원칙·§9 사고 박물관) |

## 7. 미결 사항 (사용자 결정 필요)

1. **g2u6 codex 중복 실행(PID 43016·60788) 정리 여부** — 의도한 것인지 확인 필요.
2. 발사 타이밍 — g2u6 종료 후 순차 실행이 원칙. "대기 후 자동 발사" 스크립트(`qa/wait-order-g2u4.sh` 선례)를
   쓸지, 수동으로 확인 후 쏠지.
