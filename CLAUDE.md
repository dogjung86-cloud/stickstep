# CLAUDE.md — 중학 과학 학습 앱의 헌법

이 문서는 모든 세션이 따라야 하는 규칙이다. 새 단원·인터랙션을 얹기 전에 반드시 읽는다.
목표: Brilliant처럼 개념 인터랙션과 퀴즈를 교차한 레슨, 토스 수준의 터치감, Duolingo식 지속 학습.

## 스택 · 실행
- Vite + TypeScript, **프레임워크 없이 바닐라**. Tailwind·컴포넌트 라이브러리 금지.
- 나중에 Capacitor로 앱 포장이 가능하도록 **웹 표준만** 사용.
- `npm run dev` (5173) · `npm run build` (tsc + vite) · `npm run preview`.

## 디자인 토큰 (src/styles/tokens.css 에서만 정의)
- 색은 전부 CSS 변수. 컴포넌트는 `var()`만 참조한다.
- 브랜드 **토스 블루 `#3182F6`**(press `#1B64DA`, tint `#EEF4FF`), 잉크 `#191F28`.
- 정답 `--green #04B45F`, 오답 `--red #F04452`. 생물 단원 액센트 `--subj-bio #12B886`.
- 무대(다크 캔버스) `--stage #0B1524`. 라운드 `--r-md 16 / --r-lg 20 / --r-xl 24`.
- 이징 `--ease cubic-bezier(.22,1,.36,1)`, 스프링 `--spring cubic-bezier(.34,1.35,.5,1)`.
- 폰트 Pretendard, 자간 `-.012em`.

## 인터랙션 원칙 (프로토타입에서 확정, 절대 바꾸지 말 것)
- 버튼 프레스 `scale(.965)`; CTA 해제 시 `ctaPop` 애니메이션 + 햅틱 `[10,40,14]`.
- 햅틱(core/haptics.ts): 탭 8, 정답 `[12,60,16]`, 오답 24, 완료 `[12,80,12,80,20]`.
- 퀴즈 플로우: **선택 → 확인하기 → 카드 채점(ok/no/dim) → 하단 시트 피드백 → 계속하기**.
- 오답 피드백은 실제 오개념을 짚어 준다(그냥 "틀렸어요" 금지).

## 콘텐츠 규칙
- 완전 한글 **해요체**. 이모지 금지 — 픽토그램은 `core/icons.ts`의 SVG만.
- 중1은 '분자'가 아니라 '입자'. 교과서 쪽수를 `lesson.standard`에 표기("책 NN~NN쪽").
- 원 교과서(중1)의 **단원·소단원 순서와 내용을 지킨다**. 문제는 대단원 마무리를 참고.
- **교과서 출판사 이름을 UI 문구에 쓰지 않는다.** 단원 배너는 "2022 개정 교육과정"으로만 표기.
- 교과서에 정답이 인쇄돼 있지 않으므로, 정답 키는 과학적으로 정확하게 직접 확정한다.

## 아키텍처 — "레슨은 코드가 아니라 데이터"
```
src/
  core/      dom, icons, haptics, store(진행도·스트릭·XP), router(화면), anim(rAF 루프), brand
  lessons/   types(계약), player(레슨 화면 조립·구동), registry(type→렌더러)
  lessons/steps/  각 스텝 렌더러 (concept·quiz·table·order·binSort·hotspot·dataGraph·
                  historyCase·techCards·orgLevels·finchSim·microscope·dichotomKey·comic·
                  hook(스틱맨 도입)·recap(통일 정리)·
                  heatParticles·heatContact·conduction·convection·radiation)
  ui/        blocks(개념 블록), figures(세포도·생물 아이콘 SVG), canvas(DPR 헬퍼),
             thermo(열 단원 공용: 온도색 램프·발광 입자·불꽃·자유 입자), heatFigures(열 퀴즈 SVG)
  content/   dsl(저작 팩토리), curriculum(단원 집계·잠금), unit1, unit2, unit3
  screens/   splash, onboarding, home(게임 지도), done
```
- **스텝 = `{ type, ...props }` 데이터.** `player`가 `registry`에서 `type`으로 렌더러를 찾아 그린다.
- 렌더러 시그니처: `(host, step, api) => cleanup?`. `api`로 CTA·시트·채점·다음을 조종.
- 화면 전환마다 `stopAllLoops()`로 캔버스 rAF를 정리(배터리·컨텍스트 누수 방지).

## 새 콘텐츠 추가하는 법
1. **레슨/문제만 추가** → `content/unitN.ts`에서 `dsl` 팩토리로 스텝 배열 작성. 코드 수정 불필요.
2. **새 인터랙션 타입 추가** → `lessons/steps/foo.ts`에 렌더러 작성 → `registry.ts`에 등록 →
   `content/dsl.ts`에 팩토리 추가. 다크 무대가 필요하면 `.stage`/`ui/canvas`를 재사용.
3. **새 단원 추가** → `content/unitN.ts` 만들고 `curriculum.ts`의 `CURRICULUM`에 넣는다.
   단원 내 레슨은 순차 잠금(직전 레슨 완료 시 해제).
4. **단원 테마(색)** → `screens/home.ts`의 `UNIT_THEME`에 클래스 등록(u2=bio, u3=heat) +
   `ui.css`에 `.unit-band.X`/`.gm-terrain.X`/`.gm-path-*.X`/`.gm-node.X` 변형 + tokens에 그라데이션.
   랩 안 킥커는 `concept({ kickerTone: "heat" })` 식으로.

## 퀴즈 유형 (quiz 스텝 하나로)
- `mcq`(5지선다) · `ox`(O/X) · `multi`(보기 합답형, 복수정답) · 그림 퀴즈(`figure` 추가).
- 그 밖의 능동형: `order`(순서 배열), `binSort`(분류), `hotspot`(그림 지목/라벨).

## 프리미엄 디자인 레이어 (tokens.css 하단 :root)
"옛날 자바스크립트" 룩을 걷어낸 격상 토큰. **컴포넌트는 이 토큰만 쓰고 색·그림자를 하드코딩하지 말 것.**
- **중립 램프** `--n0 … --n900` (13단). 면·경계·텍스트 위계를 여기서 뽑는다. `--app-bg`=--n50.
- **다층 그림자** `--sh-card/-raise/-cta/-sheet/-medallion/-inset` — ring + ambient + key, 쿨톤(`--sh-c`). 단일 레이어 금지.
- **근-동조 그라데이션** `--grad-blue/-green/-red/-unit/-bio/-card/-medallion/-medallion-bio/-gold/-sheen`.
- **유리** `--glass-*`. **모션** `--ease-out/--spring-soft/--spring-bounce`.
- 라이트 전용: `prefers-color-scheme: dark` 자동 반전은 의도적으로 넣지 않았다(디자인이 라이트 기준).

## 게임 정복 지도 (screens/home.ts + ui/serpentine.ts)
홈은 리스트가 아니라 **모험 트레일**이다.
- `serpentine(count, {width,gap,top,amp})` 가 노드 좌표와 부드러운 곡선 path(Catmull-Rom)를 만든다.
- **좌표계 규칙(중요)**: 노드/장식은 폭 대비 **%-left**로 배치하고, 경로 SVG는 `width:100%` + `vector-effect:non-scaling-stroke`.
  이러면 리사이즈·기기 회전 시 재렌더 없이 노드와 경로가 함께 스케일돼 어긋나지 않는다.
- 노드 = `.gm-med` 메달리온(--grad-medallion + --sh-medallion). 완료=체크+금별, 현재=크게+링+리본, 잠금=회색.
  잠금 노드엔 `aria-disabled` + 상태 `aria-label` 부여, 장식 SVG는 `aria-hidden`.
- 지형(`.gm-terrain`)은 CSS 그라데이션, 장식(나무·구름·바위)은 `figures.decor(key)` SVG.

## 아트 파이프라인 (프리미엄 SVG)
- 최종 아트는 `src/ui/art.generated.ts`(생성물, 손대지 말 것). `figures.ts`가 이를 앱 좌표계에 연결.
- 재생성: `qa/assets.json` 수정/교체 → `node qa/gen-art.mjs`. 검수 갤러리: `node qa/render.mjs && /qa/gallery.html` 스크린샷.
- 신규/대량 아트는 `premium-redesign-foundry` 워크플로로 생성(세포 좌표는 핫스팟 정렬 위해 유지).
- **세포도 소기관 좌표는 figures.ts의 spots와 반드시 일치**시킬 것(핵 150,92 / 미토 225,62·82,150 등).

## 표준 레슨 공식 — "도입 → 랩 → 정리 → 문제" (상세는 LESSON_GUIDE.md)
- 모든 레슨: ① 스틱맨 도입(`hook` 미세 상호작용 또는 `comic` 서사) → ② 핵심 랩(다크 무대,
  예측→실행→확인 우선) → ③ `recap` 통일 정리(스틱맨 + 개념 카드, 표·문단 나열 금지) → ④ 문제(형식 섞기).
- 플레이어는 이전 스텝으로 돌아갈 수 있고, 채점은 **스텝당 첫 시도만** 집계된다.
- binSort는 **드래그 앤 드롭이 기본**(탭 폴백 유지). 3단원(열)이 이 공식의 기준 구현.

## 개념 우선 + 스틱맨 만화 (steps/comic.ts)
- **원칙: 개념을 다 가르친 뒤 문제.** 개념 하나 → 바로 퀴즈 금지. (단원 I L1이 이 원칙의 기준.)
- `comic` 스텝 = 스틱맨 쌤이 과학사 이야기를 만화 컷으로 들려주며 개념을 가르침. 하단 CTA로 컷을 한 장씩
  넘기다가 마지막 컷에서 다음 단계로. 각 컷: stage 배지 + 제목 + 이미지 + 캡션(+ 용어 카드).
- **컷 이미지는 raster(Imagen 발주), SVG 아님.** 이미지 없거나 로드 실패 시 `figures.stickman()` SVG로 우아하게 폴백.
  경로: `public/comics/<lesson>/<n>.png`, 렌더러가 `import.meta.env.BASE_URL` 접두.
- 컷 전환은 rAF 아닌 reflow 기반(헤드리스에서도 항상 보이게). 스틱맨 캐릭터는 `stickman()`/`stickmanHead()`.

## 만화 컷 이미지 발주 (codex auth → ChatGPT 이미지 생성)
- **확정 방법**: `codex exec`로 codex의 **ChatGPT 내장 image_gen**을 씀(= codex/OpenAI 로그인 auth, **API 키 없음**).
  Google(ImageFX/Flow/Imagen/Gemini) 아님 — 그 경로는 네트워크·로그인 문제로 실패했음. 프롬프트에 "구글 금지" 명시할 것.
- 실행: `codex exec --skip-git-repo-check -s danger-full-access -C <dir> - <<PROMPT`.
  `-s workspace-write`면 outbound가 `ERR_NETWORK_ACCESS_DENIED`로 막힘 → `danger-full-access` 필요.
  한 번의 exec로 7컷을 다 생성 가능(~46K 토큰). 결과는 `IMG i: SAVED ...`, `DONE N/7`로 보고.
- 컷 설계(사례·서사·캡션·프롬프트)는 워크플로로 먼저 확정. unit1 = 제임스 린드 괴혈병 실험.
  프롬프트 `qa/u1l1_imagen_prompts.txt`, 스펙 `qa/unit1_comic_spec.json`.
- unit3(u3l3) = 캠핑장 열의 이동(전도·대류·복사) 7컷 — 같은 방식으로 재검증(7/7, ~68K 토큰).
  프롬프트 `qa/u3l3_imagen_prompts.txt`, 스펙 `qa/unit3_comic_spec.json`, 저장 `public/comics/u3l3/`.
- 스타일(검증됨): 손그림 스틱맨(흑선 + teal 강조 하나), **이미지 안 글자 금지**(자막은 앱 UI), 캐릭터 일관.
  gpt-image가 이 스타일을 잘 뽑음(글자 없고, AI-glossy 아님). 저장 경로 `public/comics/u1l1/0..6.png`.

## 렌더러 원본 레퍼런스 (계승용, 아직 미이식)
- `sample/renderer-comparison.html`의 `FRAG` 셰이더 = WebGL 메타볼 렌더러 원본.
  물질의 상태 변화(대단원 IV) 단원을 만들 때 `engine/`(순수 입자 물리) + `renderers/`로 이식한다.
