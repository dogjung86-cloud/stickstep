---
name: build-unit
description: 스틱스텝 새 단원·레슨 제작 플레이북. 새 대단원 구축, 레슨 추가, 훅/랩/recap/문제 저작, codex 이미지 발주, 콘텐츠 보강 작업을 시작하기 전에 반드시 로드. 기존 세션들이 확립한 품질 기준을 절차·검증 게이트·금지 목록으로 재현한다.
---

# 새 단원 제작 플레이북 — Fable 품질 재현 가이드

이 문서는 "무엇을"이 아니라 **"어떤 순서로, 무엇을 보고 베끼고, 어디서 멈춰 검증하는지"**를 정한다.
규칙의 원전은 CLAUDE.md다 — 충돌하면 CLAUDE.md가 이긴다. 이 문서는 그 규칙을 실행하는 절차다.

> 모델별 사용법: 상위 모델(Fable급)은 §7 검증 레시피와 §9 사고 박물관만은 반드시 읽는다
> (세션 간 기억이 없어 같은 함정을 다시 밟는다 — 실제 재발 사례 있음). 그 외 모델은 전체를
> 순서대로 따르고, 판단이 서지 않는 지점에서는 즉흥 대신 기준 구현 표의 파일을 연다.

## 0. 작동 원칙 (품질의 비밀은 재능이 아니라 절차다)

1. **복제와 창작의 경계를 지킨다.** 복제할 것은 **공학 문법**(랩 뼈대·렌더러 계약·cleanup·채점 플로우·
   CSS 토큰) — 아래 '기준 구현 표'의 파일을 열어 구조를 그대로 옮긴다. 재설계 금지.
   반대로 **교육 아이디어는 창작**한다 — 훅 소재와 기함급 랩의 상호작용은 이 단원 개념 전용이어야 하며,
   지난 단원 장치의 재탕(또 뉴스 속보, 또 크로스페이드)은 실격. 기준: 상태변화=메타볼, 위상=3D 명암,
   대륙이동=시대 스크럽처럼 **"개념 그 자체를 손으로 조작하는"** 장치를 찾는다. 질문은 하나 —
   "이 개념이 눈에 보이려면 학생이 무엇을 직접 움직여야 하는가?" (범용 스텝 binSort·order 등의 재사용은 자유.)
2. **한 번에 하나.** 랩 하나 완성 → 검증 → 다음. 여러 파일을 동시에 반쯤 만들지 않는다.
3. **게이트마다 증거.** 각 단계 끝에서 tsc·스크린샷·합성 조작 중 해당하는 것을 실제로 실행해 확인한다.
   "될 것 같다"로 다음 단계로 넘어가지 않는다.
4. **불확실하면 기준 파일을 다시 읽는다.** 기억으로 짐작하지 말 것.
5. **이 문서는 천장이 아니라 바닥선이다.** 체크리스트 전부 통과 = 최소 합격일 뿐. 최종 기준은
   §3의 '좋음' 예시 옆에 내 결과물을 놓고 비교했을 때 부끄럽지 않은가다.

## 1. 시작 전 필독 (순서대로)

1. `CLAUDE.md` 전체 — 특히 "인터랙션 원칙", "콘텐츠 규칙", "훅 예측 규칙", "표준 레슨 공식", 해당 단원 유형 섹션.
   **트랙·시험 헌법은 분권됨(2026-07-21)**: 과학 단원 = `SCI_GUIDE.md`, 수학 = `MATH_GUIDE.md`,
   사회 = `SOC_GUIDE.md`, 역사 = `HIS_GUIDE.md`, 단원 종합 평가 = `EXAM_GUIDE.md` — 해당 작업이면
   그 헌법 전체도 필독(CLAUDE.md의 요약 스텁만 보고 착수 금지).
2. `LESSON_GUIDE.md` — 레슨 공식 상세.
3. 만들 단원과 가장 비슷한 **완성 단원의 content 파일** 하나를 정독 (아래 표에서 선택).

### 기준 구현 표 — "이 파일을 열어 베낀다"

| 만들 것 | 베낄 파일 | 왜 이것인가 |
|---|---|---|
| 대단원 content 전체 | `src/content/g2/unit2.ts` | 최신 완성본. 사진 퀴즈 헬퍼(gimg/gpair/gitem/gquad/glabeled), 개념→랩 순서, 프리미엄 플래그까지 전부 있음 |
| 훅 장면 | `src/lessons/steps/hookGeo.ts` | hookAsk.ask() 사용법, 장면 SVG 파운드리 문법, 드래그/탭/홀드 상호작용 패턴 10종 |
| 세로 캔버스 랩 | `src/lessons/steps/buoyancyLab.ts` | 랩 뼈대의 원전: h1/sub → pn-badges 목표칩 → .stage → helper, collect() 3목표 → recordQuiz+enableCTA |
| 이미지 크로스페이드 랩 | `src/lessons/steps/driftLab.ts` | 타임라인 스크럽 + 관성 수렴 + smoothstep 블렌드 + 증거 오버레이 |
| 가로 2D 랩 | `src/lessons/steps/rockCycle.ts` | rotateStage + 논리 좌표 스케일 매핑 |
| 3D 랩 | `src/lessons/steps/earthCut3d.ts`, `moonPhase3d.ts` | space3d 동적 import, dispose, 카메라 계산, 인셋 뷰포트 |
| recap `more`(자세히) | `src/content/unit5.ts`의 "질량" 카드 | rm-h 소제목 구조의 모범 (원리→예시→시험 세트 암기) |
| 퀴즈 SVG 그림 | `src/ui/geoFigures.ts` | 파운드리 문법을 지키는 문제 그림 + 좌표 주석 습관 |
| 새 단원 테마 등록 | `screens/home.ts`의 UNIT_THEME + `ui.css`의 `.unit-band.geo` 계열 | 색 변형 4종 세트(밴드/지형/경로/노드) |

## 2. 제작 파이프라인 (7단계 · 각 단계에 완료 게이트)

### ① 교과서 분석
- PDF는 **pypdf로만** 추출한다(poppler는 한글 CMap 깨짐): `py -m pip install pypdf` 후 스크래치패드에 스크립트.
- 산출물: 소단원 구조, 핵심 개념·용어 목록, 교과서 그림 목록(→ 발주 후보), 쪽수 범위.
- **게이트**: 소단원 순서가 교과서와 일치하는 레슨 설계표(아래 형식) 완성.

| 레슨 id | 제목 | 훅 소재(일상 미스터리) | 핵심 랩 타입 | 문제 유형 믹스 | premium |
|---|---|---|---|---|---|

- 레슨 6~10개. 무료 3개 + 프리미엄 나머지가 기본. 훅 소재는 "학생이 실제로 본 적 있는 장면"이어야 한다
  (뉴스 속보, 삶은 달걀, 바위산 줄무늬 — 교실 실험 장비가 아니라 일상).

### ② 인프라 스켈레톤
- `content/g2/unitN.ts`(또는 unitN.ts) 뼈대 + `curriculum.ts` 등록 + 홈 테마색/UNIT_DECOR + dsl·registry에 새 스텝 **스텁** 등록.
- 새 단원 색은 기존 단원과 뚜렷이 구분(CLAUDE.md 색 목록 확인).
- **게이트**: `npx tsc --noEmit` 통과 + 홈 지도에 새 단원 밴드가 뜨는 스크린샷.

### ③ 이미지 1차 발주 (백그라운드로 먼저 던진다)
- 표본·증거·실사류는 제작 초반에 발주해 두면 랩 구현과 병렬로 진행된다. §5 파이프라인 참조.

### ④ 랩·훅 구현
- **기함급 랩(3D·가로·신기술) 1~2개는 메인 세션이 직접**, 나머지는 에이전트 위임(§6 분업 규칙).
- 랩 하나 완성할 때마다 §7 검증 레시피로 실제 조작 확인.
- **게이트(랩마다)**: 목표 칩 3개가 실제 조작으로 모두 켜지고 CTA가 열리는 것을 합성 이벤트로 확인.

### ⑤ 콘텐츠 저작
- 레슨 공식 고정: 훅(또는 comic) → [개념 concept: 용어가 필요하면 랩 **앞**에] → 랩 → recap → 문제 4~7개.
- 문제는 유형을 섞는다: mcq + ox/multi + (그림 문제 ≥ 1) + (binSort/order/hotspot 중 1). §3 품질 바 준수.
- **게이트**: §8 커밋 전 체크리스트의 콘텐츠 항목 전부 통과.

### ⑥ 전체 검증
- §7 레시피로 레슨 처음→끝 주행 + 스크린샷 4종(훅/랩 목표 완성/recap 자세히 펼침/그림 문제).

### ⑦ 마무리
- 이번 단원에서 생긴 **새 관행을 기록**(다음 세션의 자산) — 전 과목 공통이면 CLAUDE.md, 트랙·시험
  전용이면 해당 헌법(SCI/MATH/SOC/HIS/EXAM_GUIDE.md). 커밋 메시지는 기존 스타일(한 줄 제목 + 불릿).

## 3. 콘텐츠 품질 바 — 좋음/나쁨 실례

### 훅 (절대 규칙은 CLAUDE.md '훅 예측 규칙' — 아래는 감각)
- 리드 문구는 **미스터리 제기**여야 한다.
  - 좋음: "일본, 칠레, 인도네시아… 지진 속보에 등장하는 나라들이 묘하게 반복돼요."
  - 나쁨: "이번 시간에는 판의 경계에 대해 알아봅시다." (교사 말투, 미스터리 없음)
- choices[0]=정답 데이터 규약. 표시 셔플은 자동이니 배열 순서로 정답을 넣는다.
- good/bad 문구는 반드시 다르게. bad는 **고른 오개념을 짚고** 옳은 방향을 알려 준다.
  - 좋음(bad): "날씨도 우연도 아니에요 — 지진 소식이 온 곳들을 이어 보면 띠 모양이 나타나요. 그 띠가 판과 판이 만나는 경계랍니다."
  - 나쁨(bad): "아쉬워요! 정답은 ①이에요." (오개념 교정 없음 — 이 구현은 버그로 취급)
- 소재의 이름·설정(재료명 등)은 도입에서 먼저 소개. 개념적 정답(원리)은 답변에서 첫 등장이 정상.

### 오답 피드백(퀴즈 explainBad)
- 반드시 "왜 그 보기를 골랐을지"를 추정해 그 오개념을 교정한다. 정답 반복만 하면 실격.
  - 좋음: "방향이 반대예요 — 압력이 높아지면 끓는점도 높아져요. 그래서 압력솥 속 물은 100℃가 넘어도…"

### recap 카드
- text = 한두 문장 핵심. examples = 칩 2~3개. **more는 모든 카드 필수**, 규격:
  `<b class='rm-h'>왜 그럴까요?</b>원리 2~3문장 <b class='rm-h'>예를 들면</b>구체 예시(수치 포함) <b class='rm-h'>시험에서는/헷갈리지 마세요</b>오개념·함정 교정` + 끝에 `<span class='fun'><b>알고 있나요?</b>…</span>`.
- 분량 400~800자, 해요체, rm-h 소제목 2~4개. 훅/랩에서 쓴 소재는 반복 설명 말고 "그 장면 기억나요?"로 참조.
- 필요하면 `rimg("파일.webp", "alt")`를 문자열 뒤에 `+`로 붙여 심화 그림 임베드(dsl.ts 헬퍼).

### 학년별 언어 규칙 (기계적으로 검사할 것)
- 중1: '분자' 금지 → '입자'. unit4는 녹는점·어는점·끓는점 용어 금지("온도가 일정하게 유지"로만).
- 중1 힘: F=ma 금지. 기체: PV=k 금지. 태양계: 케플러 금지.
- 중2: 밀도·용해도·끓는점 등 정식 용어 OK. 몰·화학식은 금지.
- 전 학년 공통: 해요체, 이모지 금지, UI 문구에 '교과서'·출판사명 금지, 쪽수는 lesson.standard의 "책 NN~NN쪽"만.

## 4. 렌더러 공학 규칙 (요약 — 상세는 CLAUDE.md)

- 렌더러 계약: `(host, step, api) => cleanup?`. 마운트 직후 `api.setCTA("…", { enabled: false })`,
  목표 달성 시 `api.recordQuiz(true)` + `api.enableCTA(...)`. cleanup에서 루프·리스너·타이머 전부 해제.
- 캔버스: `createLoop` + 매 프레임 fitCanvas(DPR 캡 1.75). 화면 전환 시 stopAllLoops가 도니 루프는 스텝이 소유.
- **setPointerCapture는 무조건 try/catch**로 감싼다 (binSort·driftLab 선례 — 합성 이벤트에서 throw하면 드래그 전체가 죽은 것처럼 보인다).
- 3D는 space3d만, **반드시 `await import()`**. 매 프레임 `st.render()`, cleanup에서 `st.dispose()`.
  카메라 구도는 계산으로: `dist ≥ 필요한 반폭 / tan(hfov/2)` 검산. 눈대중 금지(태양이 프레임 밖으로 나간 사고 있음).
- 사진 임베드 SVG는 루트에 `fill="none"` 필수 — 없으면 위에 얹는 `<rect>`가 기본 검정 채움으로 사진을 덮는다.
- 손코딩 장면 SVG는 파운드리 재질 문법(3스톱 그라데이션 + 좌상단 키라이트 + 접촉 그림자 + 재질별 최암색 외곽선 1.4~1.6px). 균일한 검은 외곽선 = 실격. 스틱맨만 손그림 라인 유지.
- binSort 아이템에 사진을 쓰면 반드시 `gitem` 방식(56px 고정 + draggable=false + pointer-events:none) — 원본 크기 img는 칩을 키워 드래그를 죽인다.

## 5. codex 이미지 발주 파이프라인

1. `qa/<배치>_prompts.txt` 작성 — 맨 위 "공통 스타일" 블록 + `[i]` 항목별 영문 프롬프트.
   **이미지 안 글자·숫자 절대 금지**를 공통 블록과 실행 프롬프트 양쪽에 명시. 종횡비 명시(4:3/2:1/16:9/정사각).
2. `qa/order-<배치>.sh` 작성 — 기존 order-*.sh 복제. 핵심:
   `codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'` (workspace-write는 네트워크 차단됨),
   저장 경로 목록 지시, `"IMG i: SAVED <경로>"` + `"DONE n/N"` 보고 지시. Google 도구 금지 명시.
3. **백그라운드로 실행**하고 다른 작업 진행. 완료되면 Read 도구로 이미지를 **직접 눈으로 검수**
   (과학적 정확성 — 위상 배치, 대륙 모양 등은 여기서 잡는다). 불합격이면 프롬프트 고쳐 재발주.
4. `node qa/process-geo.mjs`로 webp 변환(원본 png 자동 삭제). 새 디렉터리는 스크립트의
   SQUARE_DIRS(정사각 512) 또는 ASPECT_DIRS(비율 유지 960)에 추가.
5. 콘텐츠에 임베드: 퀴즈는 gimg/gpair/gquad/glabeled, recap은 rimg. 라벨이 필요하면 이미지에 넣지 말고
   glabeled(한글 필 오버레이)로 얹는다.
- 발주로 만들 수 없는 것: 드래그 스냅용 벡터(공유 경계 필요 — puzzlemap처럼 SVG로 직접), 천체(실사 photos/ 사용).

## 6. 멀티에이전트 분업 (충돌 0의 규칙)

- **메인 세션만 만지는 파일**: `registry.ts`, `dsl.ts`, `ui.css`, `hook.ts`(디스패치), `content/*`, `curriculum.ts`, `home.ts`, `CLAUDE.md`.
- **에이전트에게 주는 것**: 자기 스텝 파일 1~2개만 (예: `streakLab.ts`). CSS가 필요하면 스니펫으로 보고시켜
  메인이 ui.css에 붙인다. 시작 전에 메인이 dsl/registry에 스텁을 등록해 트리가 항상 컴파일되게 한다.
- 콘텐츠 텍스트 보강(예: recap more 일괄)은 **파일 단위 소유**로 나눈다(파일당 에이전트 하나).
- 에이전트 프롬프트에 반드시: 담당 파일 목록 + "이 외 수정 금지", 수정 범위(필드 단위), 학년 언어 규칙,
  `npx tsc --noEmit` 통과 의무, 발견한 오류는 "고치지 말고 보고".
- 에이전트 완료 후 메인이 `git diff --stat`으로 소유권 위반 검사 + 보고된 오류를 직접 수정.
- 에이전트가 파일 저장 중일 때는 프리뷰 딥테스트 중지(HMR이 상태를 날린다).

## 7. 프리뷰 검증 레시피 (실전에서 확정된 코드)

레슨 마운트(자유 탐색 포함) — **편집 직후라면 반드시 `location.reload()` 먼저**
(HMR 이후 eval의 import와 앱 그래프의 모듈 인스턴스가 갈라져 isDone/freeNav가 어긋나는 함정):

```js
location.reload();                       // eval 1
(async () => {                            // eval 2
  await new Promise(r => setTimeout(r, 1600));
  const st = await import('/src/core/store.ts');
  if (!st.isDone('g2uNlM')) st.completeLesson('g2uNlM', 1, 0);   // freeNav 해금
  const { nav } = await import('/src/core/router.ts');
  const { createLessonPlayer } = await import('/src/lessons/player.ts');
  const { findLesson } = await import('/src/content/curriculum.ts');
  nav.go(createLessonPlayer(findLesson('g2uNlM').lesson, () => {}));
})()
```

- 스텝 이동: `document.querySelector('.screen.active .xbtn.fwd').click()` — **항상 `.screen.active`로 스코프**
  (nav 스택에 숨은 화면이 남아 무스코프 셀렉터는 엉뚱한 버튼을 잡는다). 클릭 간 420ms 이상 대기.
- 합성 드래그: `new PointerEvent('pointerdown', { bubbles:true, pointerId:N, clientX, clientY, isPrimary:true })`
  → move 여러 번 → up. **드롭 대상이 화면 밖이면 elementFromPoint가 실패**하니 먼저 `scrollIntoView({block:'center'})`.
- 검증 항목: 랩 목표 칩 3개 점등→CTA 개방, 훅 오답 선택 시 `.reveal`(정답 초록) 표시, recap 카드 탭→rm-h 렌더,
  그림 문제 이미지 `complete && naturalWidth > 0`.
- 증거 스크린샷 4종을 남긴다: 훅 장면 / 랩 목표 완성 / recap 자세히 펼침 / 그림 문제.

## 8. 커밋 전 체크리스트 (전부 체크해야 커밋)

- [ ] `npx tsc --noEmit` && `npm run build` 통과
- [ ] 훅 전수: choices[0]=정답, good≠bad, 소재명은 도입에서 소개, neutral 훅에 정답 칭찬 없음
- [ ] recap 전 카드에 more(rm-h 2~4개, 400~800자) + fun 유지
- [ ] 문제: 그림 문제 ≥1, 능동형(binSort/order/hotspot) ≥1, explainBad가 오개념 교정형
- [ ] mcq/multi 셔플 규칙: 라벨형 보기(ㄱㄴㄷ 조합·(가)(나)·①~⑤)는 `shuffle: false` + 관례 순서로 저작,
      해설이 보기 "위치"(N번째)를 지칭하지 않음 (표시 순서는 렌더 셔플 — CLAUDE.md '퀴즈 유형' 참조)
- [ ] 학년 언어 규칙 grep: 중1 파일에 `분자` 0건, unit4에 `녹는점|끓는점|어는점` 0건, UI 문구에 `교과서` 0건, 이모지 0건
- [ ] 이미지: 발주 원본 png 삭제·webp만 존재, 이미지 안 글자 없음, 외부 출처는 photos/CREDITS.md 기재
- [ ] 랩: cleanup 완비(루프·리스너), setPointerCapture try/catch, 3D는 dispose 확인
- [ ] §7 스크린샷 4종 확보
- [ ] 새 관행 기록(공통 = CLAUDE.md, 트랙·시험 전용 = 해당 GUIDE)
- [ ] 커밋 메시지: 한 줄 제목 + 상세 불릿 + `Co-Authored-By: Claude <model> <noreply@anthropic.com>`

## 9. 사고 박물관 — 실제 났던 사고. 반복하면 퇴행이다

1. **어떤 예측을 골라도 "완벽한 예측!"** — 훅에 로컬 ask를 복제하다 발생. → 반드시 공용 hookAsk.ask().
2. **갈륨이 답변에서 처음 등장** — 소재명은 도입에서 소개(맥락 규칙의 기원).
3. **사진 위 테두리 rect가 검정으로 채워져 사진을 덮음** — 루트 svg에 fill="none" 누락.
4. **3D 태양이 프레임 밖** — 카메라를 눈대중으로 잡음. → dist 공식으로 검산.
5. **TS1005 대참사** — 큰 content 파일에서 Edit 앵커가 레슨 클로저(`], }),`)를 삼킴. → 앵커 유일성 확인,
   깨지면 python 괄호 스택 스크립트로 미폐합 지점 진단.
6. **binSort 사진 칩 드래그 사망** — 원본 크기 img + 네이티브 드래그 하이잭. → gitem 56px 규격.
7. **setPointerCapture throw로 리스너 전멸** — 합성 포인터 id. → 전 렌더러 try/catch.
8. **optimizeDeps에 three 누락** — dev 첫 로드 때 풀리로드로 레슨 상태 소실.
9. **three 텍스처 캐시 공유** — dispose와 충돌. → 씬마다 새 Texture 로드.
10. **아날로그 시계 바늘 어긋남** — CSS 회전은 `transform-box: view-box` + px origin (fill-box 금지).
11. **지도 5장 크로스페이드가 뚝뚝 끊김** — 중간 시대를 촘촘히(11장)가 정답이었다. 보간 개수가 부드러움을 결정.
12. **에이전트 저장 → HMR → 프리뷰 테스트 상태 증발** — 에이전트 작업 중엔 딥테스트 금지.
13. **여러 세션이 같은 에셋(만화 png)과 렌더러를 동시 편집** — 병합 지옥. 대량 에셋 변환은 브랜치들이 합쳐진 뒤 단독으로.
14. **발주 이미지에 `loading="lazy"` → 영영 안 뜸** — 앱은 `.scroll` 컨테이너 안에서 렌더하는데 lazy 관측
    루트가 안 맞아 DOM img가 naturalWidth 0으로 멈춘다(fresh Image()는 로드됨). hotspot·orgArt·qimg 전부 lazy 제거.
15. **발주 그림 위 hotspot 좌표는 이미지%로** — `.hs-art:has(img)` 패딩 0으로 이미지%=스테이지% 일치시킨 뒤
    스크린샷으로 눈 정렬. spot() 헬퍼(옛 손코딩 아트용 패딩 보정)를 그대로 쓰면 어긋난다.
16. **process 변환 스크립트에 새 발주 폴더 등록 누락** — public/<newdir>가 SQUARE_DIRS/ASPECT_DIRS에 없으면
    png가 webp로 안 바뀌어 "발주했는데 이미지가 없다". 새 발주 배치마다 폴더 등록부터 확인.
17. **프리뷰 스크린샷 하니스가 세션 중 멈출 수 있다** — 스크린샷이 30s 타임아웃 나고 computed opacity/transform이
    base값에 얼어붙으면(스플래시조차 그러면) 렌더/캡처 파이프라인 프리즈다(내 코드 아님 — JS eval은 정상 동작,
    build 통과). 이땐 eval로 DOM 구조·클래스 토글·이미지 로드를 확인하고, 발주 이미지는 Read 도구로 직접 열어
    검수한다. 서버 재시작으로 안 풀리면 그 세션 픽셀 검증은 포기하고 코드 정확성(build+구조)으로 진행.
18. **codex 누끼(투명) — 초록/저채도 사물은 실패하기 쉽다** — codex가 흰/회색 배경으로 흘려 알파 없이 나온다.
    발주 프롬프트에 "FULLY TRANSPARENT background(PNG alpha)"를 강하게 넣고, 변환 후 알파 extrema로 검사해
    불투명이면 재발주. 초록 세포처럼 반복 실패하면 마젠타 크로마키 지시가 통하기도 한다.
