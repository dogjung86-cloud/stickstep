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
- **UI 문구에 '교과서'라는 단어 자체도 쓰지 않는다** — 앱이 특정 교과서 기반임을 드러내지 않는다.
  ("교과서 탐구 그대로" 같은 리드 금지.) 쪽수 출처 표기는 `lesson.standard`의 "책 NN~NN쪽" 형식만 허용.
- 교과서에 정답이 인쇄돼 있지 않으므로, 정답 키는 과학적으로 정확하게 직접 확정한다.

## 아키텍처 — "레슨은 코드가 아니라 데이터"
```
src/
  core/      dom, icons, haptics, store(진행도·스트릭·XP), router(화면), anim(rAF 루프), brand
  lessons/   types(계약), player(레슨 화면 조립·구동), registry(type→렌더러)
  lessons/steps/  각 스텝 렌더러 (concept·quiz·table·order·binSort·hotspot·dataGraph·
                  historyCase·techCards·orgLevels·finchSim·microscope·dichotomKey·comic·
                  hook(스틱맨 도입)·recap(통일 정리)·
                  heatParticles·heatContact·conduction·convection·radiation·
                  diffusion·evaporation·matterTemp·matterShape·matterCompare·
                  phaseNames·sublimation·phaseVolume·heatCurve·
                  forceStudio·tugOfWar·gravityDrop·springLab·frictionPush·buoyancyLab·windSoccer·
                  hookForce(V 훅 6종: balloon·tugrope·bow·iceslip·bottle·rollstop — hook.ts가 위임)·
                  gasPressure·boyleSyringe·diverBubble·charlesSyringe·hotairRide·
                  hookGas(VI 훅 4종: polar·bubblewrap·foilballoon·pingpong)·
                  solarTour(VII 3D 가로 투어)·sunLab·skyDaily·zodiacRing·
                  moonPhase3d(3D 위상 + 지구뷰 인셋)·eclipse3d(3D 가로 정렬 + 지상 개기일식 뷰)·
                  hookSpace(VII 훅 5종: stargaze·planetsize·shadowclock·moonpic·sunglasses)·
                  densityLab·densityPool·solubilityLab·gasFizz·meltCurve·sepFunnel·recrystal·distillLab
                  (중2 I 물질의 특성 랩 8종 — buoyancyLab 문법 계승, 목표 칩 = pn-badges force3 + pn-badge chem)·
                  hookChem(중2 I 훅 9종: rings·deadsea·cocoa·fishmouth·gallium·milkzoom·soysauce·syrup·perfume))
  engine/    matterSim — IV 단원 순수 입자 물리(프로토타입 Sim 이식, 렌더링 없음, 수치 불변)
  renderers/ meta(WebGL 메타볼 — FRAG 원본 이식, 볼 상한 48, dispose 시 lose_context)·
             dot(발광점 — WebGL 폴백 겸 "입자의 눈" 뷰)·palette(온도→hue 212→370, uniform 3색)
  ui/        blocks(개념 블록), figures(세포도·생물 아이콘 SVG), canvas(DPR 헬퍼),
             thermo(열 단원 공용: 온도색 램프·발광 입자·불꽃·자유 입자), heatFigures(열 퀴즈 SVG),
             matterStage(IV 공용 무대 — 메타볼+입자 뷰 크로스페이드 토글·오버레이·토스트),
             matterFigures(IV 퀴즈 SVG + recap 미니아트),
             labProps(IV 랩 공용 소품 — 유리 용기·플라스크·전자저울·접촉 그림자·바람 스트릭.
                      캔버스에서도 파운드리 재질 문법을 지키는 헬퍼. 단색 스트로크 소품 금지),
             forceProps(V 공용: drawForceArrow 힘 화살표·drawSpring 3패스 코일·drawRope·drawCrate),
             stick(캔버스 스틱맨 — posePull/posePush/poseKick, 관절 좌표 반환),
             forceFigures(V 퀴즈 SVG + recap 미니아트),
             gasKit(VI 공용 — GasBox 자유 입자 물리 + 발광 입자·벽 충돌 플래시·충돌률 게이지),
             gasFigures(VI 퀴즈 SVG + recap 미니아트),
             space3d(VII 공용 three.js 킷 — 절차적 행성 텍스처·별배경·글로우·고리·궤도선.
                     **반드시 동적 import**로만 로드, dispose가 지오메트리·재질·텍스처+컨텍스트 반납),
             rotateStage(가로 모드 오버레이 — fixed 90° 회전 + mapPoint 포인터 리매핑 + 나가기),
             spaceFigures(VII 퀴즈 SVG + 태양 핫스팟 그림 + spaceMiniArt),
             chemFigures(중2 I 퀴즈 SVG — 용해도 곡선·가열 곡선·산점도·증류탑 + chemMiniArt)
  content/   dsl(저작 팩토리), curriculum(단원 집계·잠금·학년 트랙), unit1 … unit7(중1), g2/unit1 …(중2)
  screens/   splash, onboarding, home(게임 지도 + 중1⇄중2 학년 세그), done, paywall(프리미엄 안내·구매)
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
4. **단원 테마(색)** → `screens/home.ts`의 `UNIT_THEME`에 클래스 등록(u2=bio, u3=heat, u4=matter, u5=force,
   u6=gas, u7=space, g2u1=chem) + `ui.css`에 `.unit-band.X`/`.gm-terrain.X`/`.gm-path-*.X`/`.gm-node.X` 변형 + tokens에 그라데이션.
   랩 안 킥커는 `concept({ kickerTone: "heat" })` 식으로. 새 색은 기존 단원과 겹치지 않게
   (u4 matter #7C6BFF 보라 ↔ u7 space #4A54E1 딥 인디고 ↔ g2u1 chem #E64980 지시약 로즈처럼 뚜렷이 구분).

## 중2 트랙 · 프리미엄(수익화)
- **학년 트랙**: `curriculum.ts`의 `CURRICULA = { g1: CURRICULUM, g2: CURRICULUM_G2 }`.
  중2 단원 파일은 `content/g2/unitN.ts`, id는 `g2uN`(레슨 `g2uNlM`) — 중1 `uN`과 절대 충돌 금지.
  홈 상단 학년 세그(중1⇄중2)가 `store.viewGrade`로 전환·저장되고, 온보딩 학년(g2·g3→중2)에서 기본값을 유도.
  `findLesson`은 두 트랙을 모두 검색, 완료 후 홈 복귀는 `gradeOfUnit(unitId)`로 올바른 학년 지도로 돌아간다.
- **준비 중 단원**: 아직 안 만든 단원은 `comingSoon: true` + `lessons: []`(curriculum.ts의 `soon()` 헬퍼) —
  탭·밴드는 노출하되 지도 대신 `.coming-card` 안내를 그린다. 콘텐츠가 완성되면 실제 UNIT 모듈로 교체.
  중2 V·VI(식물·동물과 에너지)은 의도적으로 뒤 순번 제작(자리만 유지) — 우선순위: 1→2→3→4→7→8.
- **프리미엄 잠금**: 레슨에 `premium: true`(중2 I 기준 무료 3레슨 + 프리미엄 7레슨). `isPremiumLocked()` =
  premium && !store.premium. 지도에서 골드 크라운 메달리온(`.gm-node.prem`, 첫 노드에만 `gm-ribbon gold` 리본),
  탭하면 `screens/paywall.ts` 전면 페이월(혜택 3 + 평생 이용권 가격 카드 + 구매·복원).
- **결제**: `core/purchase.ts`가 단일 창구(가격 문자열 포함). 현재 스텁 — **DEV에서만 즉시 해금**(QA용),
  프로덕션 웹은 "출시 후 결제" 안내. Capacitor 포장 시 이 파일만 IAP(cordova-plugin-purchase/RevenueCat)로
  교체하면 UI는 그대로 동작한다. 구매 성공 경로: 스토어 결제 → 영수증 검증 → `setPremium(true)`.
- **중2 콘텐츠 규칙**: 중2 교과서는 녹는점·끓는점·용해도 등 용어를 정식 도입한다(중1 '입자' 제약과 별개).
  교과서 원본: `D:\brilliant\중학교 교과서\중2 단원별 - 텍스트 보존(OCR)\` PDF — poppler가 한글 CMap이 없어
  깨지므로 **pypdf로 텍스트 추출**(`py -m pip install pypdf`)이 확정 경로다.

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

## 브랜드 · 스플래시
- 앱 이름은 **"스틱스텝 사이언스"**(core/brand.ts) — UI 문구·타이틀·워드마크 모두 여기서만 참조.
- 스플래시(screens/splash.ts) = **스틱맨 플립북**: `public/brand/loading/0..6.webp`가 105ms 간격으로
  2바퀴 타다다닥 → `study.webp`(머리 질끈 공부 포즈)로 탁 정착(flipPop) → 워드마크 페이드업.
  프레임이 없으면 만화 아바타 5종으로 폴백, 그것도 없으면 정적 로고. 탭하면 건너뛰기.
- 앱 아이콘/파비콘 = `public/brand/icon.png`(512, 파란 라운드 사각 + 흰 스틱맨) — index.html에서 링크.
- 브랜드 이미지 재발주: `bash qa/order-brand-u1l3.sh`(프롬프트 qa/brand_imagen_prompts.txt),
  발주 원본은 1254px → `node qa/resize-brand.mjs`(512 png) + webp 변환으로 경량화(프레임당 ~20KB).

## 게임 정복 지도 (screens/home.ts + ui/serpentine.ts)
홈은 리스트가 아니라 **모험 트레일**이다.
- **장식은 단원의 이야기**(ui/mapDecor.ts + home.ts의 UNIT_DECOR): 트레일·메달리온 문법은 절대 바꾸지 않고
  소품 세트만 단원별로 — I 정글 원정(징검돌·야자수·깃발) · II 생물 사다리(ART_BIO 재사용: 세균→아메바→
  고사리→물고기→새) · III 열(모닥불·김 나는 잔·주전자·태양) · IV 고체→액체→기체(얼음→물방울→김) ·
  V 힘 4종(사과나무·용수철·상자·튜브) · VI 기체(풍선·공기방울·열기구) · VII 행성 순항(수성→금성→화성→
  목성→토성 순서) · 중2 I 실험대 순례(플라스크→층 병→결정→분별 깔때기→증류기).
  seq 순서 자체가 서사이니 함부로 섞지 말 것. 새 단원은 UNIT_DECOR에 세트 등록.
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
- **단원별 훅 장면 파일**: III·IV=hook.ts 내부, V=hookForce.ts, VI=hookGas.ts, VII=hookSpace.ts,
  I=hookCiv.ts(colorcups·speaker·smokestack), II=hookBio.ts(cellzoom·stain·bodycount·ladybugs·batbird·foodweb).
  recap 미니아트도 단원별: I=civFigures.ts, II=bioFigures.ts, III~=각 단원 figures. 새 훅은 scene 유니온을
  hook.ts·dsl.ts 양쪽에 등록하고, 상태 애니메이션 CSS는 ui.css의 해당 단원 훅 섹션에.
- **손코딩 장면 SVG(훅 등)도 파운드리 재질 문법을 따른다** — 균일한 검은 외곽선 금지. 공식:
  ① 근-동조 3스톱 그라데이션 면 ② 좌상단 키라이트(radial 하이라이트·스펙큘러 스트릭)
  ③ 바닥 접촉 그림자(`#2A3A5E` 타원, opacity .10~.12) ④ 외곽선은 재질별 최암색 1.4~1.6px.
  스틱맨 캐릭터만 의도적으로 손그림 라인 유지(만화·아바타와 같은 정체성). 기준 구현: hook.ts IV 장면 4종.
  캔버스 랩 소품도 동일 문법 — `ui/labProps.ts`(유리 용기·플라스크·저울·접촉 그림자·바람)만 쓴다.
  검수: `public/qa-u4art.html`(훅 장면 + 랩 자동 진행 마운트) + `node qa/shot-u4art.mjs`(dev 서버 필요).
  주의: 다크 무대(.stage)의 우하단은 '입자의 눈' 토글 자리 — 목표 칩·상태 필은 좌하단(`.hp-goals.left`)에.
- **생물 5계 아이콘(검색표·분류함)은 발주 일러스트**(public/bio/<key>.webp, codex gpt-image로 만든 밝은 교육
  일러스트 13종 — 대장균·아메바·짚신벌레·해캄·버섯·곰팡이·효모·소나무·고사리·진달래·붕어·꿀벌·박새).
  `figures.ts`의 organism()이 NAME_ICON→key→발주 webp(<img class="bio-ico">)를 우선 반환, 없으면 ART_BIO SVG 폴백.
  흰 배경 유지(투명 처리 시 밝은 깃털·뺨에 구멍) + CSS로 라운드 배경. 재발주: qa/order-bio-icons.sh →
  qa/process-bio.mjs(256 webp). 조잡한 픽토그램 SVG(박쥐=새 매핑 오류 포함)를 대체한 것.
- **구성 단계 도해(orgLevels 랩)는 bioFigures.ts의 orgArt(key)** — 단색 미니 SVG를 파운드리 문법
  (근-동조 radial 그라데이션 + 좌상단 하이라이트 + 접촉 그림자 + 최암색 외곽선)으로 격상. 순환계는
  '심장+온몸 혈관망'(무지개 부채꼴 금지), bodycount 훅 세포 격자·사람 실루엣도 같은 문법.
- **천체(태양·행성·달)는 SVG로 그리지 않는다 — 실사(public/photos/, NASA·NOIRLab PD/CC BY)를 쓴다.**
  훅·퀴즈 그림에는 SVG `<image href>` + `clipPath` 원형 크롭으로 임베드(기준: hookSpace planetsize·stargaze·
  moonpic, spaceFigures sunspotFig·sunAnatomyFig). 3D는 space3d의 텍스처 로더가 담당. 출처는 `photos/CREDITS.md`.
  함정: 사진 위에 얹는 테두리 `<rect>`는 루트 `<svg fill="none">`이 없으면 **기본 검정 채움**으로 사진을 덮는다.
  hotspot 스텝 spot 좌표(%)는 그림 좌표와 함께 맞출 것(sunAnatomyFig 주석 참고).
  시계(아날로그) 바늘 회전은 CSS `transform-box: view-box` + px `transform-origin`으로 — fill-box는 어긋난다.

## 표준 레슨 공식 — "도입 → 랩 → 정리 → 문제" (상세는 LESSON_GUIDE.md)
- 모든 레슨: ① 스틱맨 도입(`hook` 미세 상호작용 또는 `comic` 서사) → ② 핵심 랩(다크 무대,
  예측→실행→확인 우선) → ③ `recap` 통일 정리(스틱맨 + 개념 카드, 표·문단 나열 금지) → ④ 문제(형식 섞기).
- 플레이어는 이전 스텝으로 돌아갈 수 있고, 채점은 **스텝당 첫 시도만** 집계된다.
- **완료한 레슨 재입장 = 자유 모드**: 헤더에 앞으로 가기(›)가 생겨 CTA 게이트 없이 스텝을 오간다
  (player.ts의 `freeNav = isDone(lesson.id)`). 복습·부분 학습용 — 전 단원 공통.
- comic 스텝은 하단 CTA(다음 컷) + 헤더 쪽 **‹ 이전 컷** 필 버튼으로 양방향 이동(첫 컷에선 숨김).
- binSort는 **드래그 앤 드롭이 기본**(탭 폴백 유지). 3단원(열)이 이 공식의 기준 구현.
- 랩의 "교과서 밖 궁금증"은 `ui/curio.ts`의 curioCard(질문 헤드 탭 → 답 펼침, bulb + 앰버 톤)로 —
  content에서 `curio: { q, a }`를 넘기면 랩 렌더러가 helper 뒤에 붙인다. 현재: u3 전도(이불)·복사(산꼭대기),
  u4 phaseNames(하얀 김), u5 gravityDrop(우주 정거장), u7 sunLab(흑점 역설). 오개념 교정형 질문이 기준.
- hotspot 스텝은 `spot.photo`(+photoCredit)로 부위별 실사 사진 카드를 설명 아래에 띄울 수 있다(태양 지도가 기준).

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
- unit5(u5l3) = 사과에서 달까지(중력·무게·질량, 뉴턴 서사) 7컷 — 동일 파이프라인(7/7, ~70K 토큰).
- unit6(u6l2) = 보일의 J자 유리관(3m 유리관·수은·시행착오, 206쪽 과학자 이야기 기반) 7컷 —
  동일 파이프라인(7/7, ~78K 토큰). 프롬프트 `qa/u6l2_imagen_prompts.txt`, 저장 `public/comics/u6l2/`.
  VI 만화는 L2 하나만(분석 결과). 보일 역은 같은 스틱맨에 곱슬 가발.
- unit7(u7l3) = 고려사의 흑점 기록(236쪽 도입 소재 — 고려 천문 관리→흑점 정체→쌀알 무늬→
  개기일식의 대기→홍염·플레어→11년 주기 우주 날씨) 7컷. 프롬프트 `qa/u7l3_imagen_prompts.txt`,
  저장 `public/comics/u7l3/`. VII 만화는 L3 하나만(나머지 레슨은 3D 랩이 주인공이라 분석 결과 불필요).
  프롬프트 `qa/u5l3_imagen_prompts.txt`, 저장 `public/comics/u5l3/`. V 단원 만화는 L3 하나만(분석 결과).
  프롬프트 `qa/u3l3_imagen_prompts.txt`, 스펙 `qa/unit3_comic_spec.json`, 저장 `public/comics/u3l3/`.
- unit4 = 2편 발주(각 7/7 성공): u4l3 "물방울의 여행"(융해→기화→액화→응고→승화 순환),
  u4l6 "이글루와 사막 물주머니"(기화=흡수 vs 응고=방출 대비). 프롬프트 `qa/u4l3_imagen_prompts.txt`
  `qa/u4l6_imagen_prompts.txt`, 저장 `public/comics/u4l3/` `u4l6/`. 백그라운드 bash로 2편 연속 발주 검증됨.
- 스타일(검증됨): 손그림 스틱맨(흑선 + teal 강조 하나), **이미지 안 글자 금지**(자막은 앱 UI), 캐릭터 일관.
  gpt-image가 이 스타일을 잘 뽑음(글자 없고, AI-glossy 아님). 저장 경로 `public/comics/u1l1/0..6.png`.

## 3D 우주 랩 (대단원 VII — three.js)
- 위상·일식처럼 **빛의 명암과 3차원 정렬이 개념 그 자체**인 주제만 three.js를 쓴다(장식용 3D 금지).
  (황도 12궁 zodiacRing도 3D — 태양 점광이 지구 밤낮 반구를 실제로 갈라 "한밤=태양 반대쪽"이 조명으로 체험된다.)
- `ui/space3d.ts`가 유일한 three 접점: **절차적 캔버스 텍스처를 즉시 입히고, 실사 텍스처가 로드되면 교체**
  (`public/textures/` — Solar System Scope CC BY 4.0, `photos/CREDITS.md`에 전체 출처). 실사가 없거나 실패해도
  절차적 텍스처로 무대가 비지 않는다. 텍스처는 씬마다 새 Texture로 로드(캐시 공유 금지 — dispose와 충돌).
  별배경·`makeMilkyWay`(은하수 배경 구)·`makeLabel`(이름표 스프라이트)·글로우·고리(UV 반지름 재배치)·궤도선.
  스텝에서는 **반드시 `await import()`** (vite가 three를 별도 청크로 분리, gzip ~193KB — 초기 번들 무영향.
  `optimizeDeps.include: ["three"]` 필수, 없으면 dev 첫 로드 때 최적화 풀리로드가 나서 레슨 상태가 날아간다).
- 규율: DPR 캡 1.75 · rAF는 스텝의 `createLoop`가 소유 · **프레임마다 `st.render()` 호출**(빼먹으면 검은 무대) ·
  cleanup에서 `st.dispose()`(지오메트리·재질·텍스처 해제 + forceContextLoss). WebGL 실패 시 `null` → 텍스트 폴백 후 CTA 개방.
- **가로 모드** `ui/rotateStage.ts`: fixed 오버레이 안에 90° 회전 무대. 포인터는 `rot.mapPoint(e)`로
  리매핑(스테이지 x = clientY − top, y = right − clientX). solarTour·eclipse3d가 사용.
- **solarTour = 궤도형 태양계**(교과서 일렬 그림의 확장): 한 손가락 드래그 = 시점 회전(구면 궤도 카메라),
  두 손가락 핀치·휠·± 버튼 = 줌, 탭 = 천체 포커스 + 정보 카드(지구와 거리·크기·중력 스탯 칩 + 읽을거리).
  소행성대는 InstancedMesh 암석 띠 + 투명 토러스 히트 프록시. 미션 칩(안쪽 2곳·바깥 2곳·소행성대)은
  가로 HUD(.sp3-missions)와 세로 pn-badge를 함께 동기화한다.
- 조작 문법: 궤도 드래그는 평면(y=0) 레이캐스트 → atan2 각도. 작거나 움직이는 탭 대상(혜성)엔
  투명 히트 프록시 구를 붙인다. moonPhase3d는 태양 구체+빛 화살표가 프레임 안(fov 46, 카메라 계산으로 확보)
  + 우하단 시저 뷰포트 인셋("지구에서 본 달"), eclipse3d 지상 뷰는 phi 스냅 보정 + 달 스케일 1.6×로 개기일식 연출.
- **eclipse3d 궤도 기울기 장치**: "왜 매달 안 일어날까?" 토글 → 궤도를 z축으로 ~12° 기울임(실제 5°는 문구로).
  기울면 삭·망에서도 |y|>0.45로 정렬 판정이 빗나가고 미스 토스트가 뜬다 — 일식·월식 희소성의 체험 장치.
- **가로 3D 랩의 카메라 구도는 계산으로 확보한다**: 필요한 x-범위(태양~궤도 끝)를 정하고
  dist ≥ 반폭/tan(hfov/2)로 검산할 것. 눈대중으로 잡으면 태양이 프레임 밖으로 나간다(실제 있었던 버그).

## 메타볼 렌더러 (대단원 IV에서 이식 완료)
- `sample/renderer-comparison.html`의 `FRAG` 셰이더 원본을 `renderers/meta.ts`로 **수치 그대로** 이식했다.
  rMul `1.04+0.20·sol-0.48·gas` · threshold 1.0 · soft `mix(.30,.09,sol)` · 조명 `(-0.5,-0.65,0.58)` ·
  specular `26+42·sol` · ice grain `vnoise(ps*7)`+glint`^14` · 볼 상한 48 · WebGL DPR 캡 1.75.
- 물리는 `engine/matterSim.ts`(sol=1-smooth(-2,3,T), gas=smooth(96,104,T)) — 렌더러는 parts만 읽는다.
- 조립은 `ui/matterStage.ts`: 물질 뷰(메타볼) ↔ **입자의 눈**(dot) 크로스페이드 토글, WebGL 실패·유실 시
  자동 입자 뷰 폴백, 그릇 벽은 2D 오버레이 캔버스, 스텝 이탈 시 `dispose()`가 컨텍스트를 반납한다.
- IV 단원 콘텐츠 주의: 이 교과서는 **녹는점·어는점·끓는점 용어를 도입하지 않는다** — "온도가 일정하게
  유지된다"로만 서술하고, 승화는 양방향(고↔기) 모두 같은 이름을 쓴다.
