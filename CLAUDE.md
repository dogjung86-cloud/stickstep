# CLAUDE.md — 중학 학습 앱(과학·수학)의 헌법

이 문서는 모든 세션이 따라야 하는 규칙이다. 새 단원·인터랙션을 얹기 전에 반드시 읽는다.
목표: Brilliant처럼 개념 인터랙션과 퀴즈를 교차한 레슨, 토스 수준의 터치감, Duolingo식 지속 학습.
**수학 트랙 작업은 MATH_GUIDE.md(수학 헌법)를 함께 읽는다** — 과목 차원 요약은 아래 "수학 트랙" 섹션.

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
- 원 교과서(중1)의 **단원·소단원 순서와 내용을 지킨다**. 문제는 대단원 마무리를 참고하되,
  **교과서 문항의 임의 수치·선지 문구를 그대로 가져오지 않는다**(사용자 확정, 2026-07 전 단원 감사로 소급 적용).
  함정 구조·출제 의도만 계승하고 수치 세팅·문구는 자체 제작. 자연값·과학 사실(밀도 7.87, 달 중력 1/6,
  CPK 색 등)과 표준 도해(층상 구조 사분원 등)는 허용 — "교과서가 임의로 지어낸 숫자·문장"이 금지 대상.
  **설정·소재의 차용은 허용**(사용자 확정 2026-07-10): 교과서가 고른 상황 설정(나이 자료, 스포츠 득점,
  신발 치수 등)은 학생에게 친숙한 검증된 소재라 그대로 따라도 된다. 소재까지 피하려고 억지로 낯선
  설정을 만들면(수학 Ⅵ 도서관 청구기호 훅 사례) 오히려 이해를 해쳐 실격이다.
  그림 헬퍼 주석에 "마무리 N번" 같은 출처 자기 선언도 남기지 않는다.
- **용어 선경험 원칙(사용자 확정)**: concept·recap·퀴즈에 등장하는 모든 용어/개념은 그 앞의 훅·랩·조작에서
  "어떤 형태로든" 먼저 경험시킨다(예: traceLab에 '만남' 국면을 추가해 교점·교선을 정의 전에 체험).
  단, 랩 조작 자체가 용어를 전제하면 concept가 랩보다 먼저인 게 옳다(기존 "랩 앞 concept" 규칙과 동일).
- **교과서 출판사 이름을 UI 문구에 쓰지 않는다.** 교육과정 언급은 스플래시의 "최신 개정 교육과정 반영"
  단 한 곳(BRAND.note)뿐. 단원 밴드 메타는 학년·단원 불문 **"단원 정복률 N%"로 통일**(쪽수·과정 문구 금지).
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
                  hookChem(중2 I 훅 9종: rings·deadsea·cocoa·fishmouth·gallium·milkzoom·soysauce·syrup·perfume)·
                  earthCut3d(중2 II 3D 지구 컷어웨이 — 가로, 단면 CanvasTexture 반원 2장+레이캐스트 층 판정)·
                  streakLab(조흔·자성·염산·굳기)·coolingLab(냉각 속도×조성 2×2)·strataLab(퇴적 층리)·
                  foliationLab(상하 압력→엽리; 규암·대리암은 엽리 없음)·rockCycle(가로 순환 여행 — 사건 선택 전이+오답 교정)·
                  driftLab(PALEOMAP 크로스페이드+증거 오버레이)·plateMap(지진·화산 점+판 경계 토글)·
                  hookGeo(중2 II 훅 10종: eggearth·foolsgold·dolstatue·stripemount·bookcliff·pressrock·
                  cappadocia·gravestone·puzzlemap·quakenews)·
                  reflectLab·diffuseLab(중2 III L1 — 레이저 각도 드래그·난반사 돋보기)·
                  refractLab(스넬 n=1.33)·seeLab(광원→물체→눈 경로 조립+작살)·
                  mirrorImageLab(모눈 상 작도 — 상점=거울 대칭점·연장선 교점 정확)·
                  mirrorLens(가로 광학 벤치 4모드 — 거울/렌즈 공식으로 상 실시간)·
                  objectColorLab·colorMixLab(캔버스 lighter 진짜 가산혼합)·pixelLab(화소 돋보기+RGB 슬라이더)·
                  waveLab(이력 버퍼 파동 전파 + 제자리 탁구공)·soundLab(Web Audio + 오실로스코프)·
                  hookLight(중2 III 훅 8종 — hook.ts가 위임)·
                  elementLab·moleculeLab(중2 IV 원소/화합물·분자 조립+쪼개기)·
                  atomLab·ionLab(원자 조립소 스테퍼·이온 공방 전자 떼기붙이기)·
                  periodicLab(주기율표 1~20 탐험 DOM)·ionMoveLab(이온 이동 전기영동)·
                  hookAtom(중2 IV 훅 6종 — hook.ts가 위임))
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
             chemFigures(중2 I 퀴즈 SVG — 용해도 곡선·가열 곡선·산점도·증류탑 + chemMiniArt),
             geoFigures(중2 II 퀴즈 SVG — 층상구조 사분원·화성암 2×2·광물 흐름도·토양층·판 구조·
                        대륙 이동 4단계((나)→(라)→(가)→(다)) + geoMiniArt),
             lightKit(중2 III 공용 — drawBeam 발광 광선(글로우 3층+광자 점 흐름)·각도 호·각도기·법선·
                      레이저/거울/눈 소품·capturePointer 합성 이벤트 안전 캡처),
             lightFigures(중2 III 퀴즈 SVG + 파동 핫스팟 그림 + lightMiniArt),
             chemKit(중2 IV 공용 — 원자 공/원자핵(+N)/전자(−)/이온식 렌더 + ELEMS(CPK 색·상대 크기)·
                     결합 막대·formulaHtml. 입자 표현의 단일 진실 공급원 — 여기 관례를 반드시 따를 것),
             atomFigures(중2 IV 퀴즈 SVG + atomMiniArt — 'chem' 이름은 중2 I이 선점, IV는 atom 접두)
  content/   dsl(저작 팩토리), curriculum(단원 집계·잠금·학년 트랙·과목 차원), unit1 … unit7(중1),
             g2/unit1…unit4(중2 — I 물질의 특성·II 지권의 변화·III 빛과 파동·IV 물질의 구성),
             math/(수학 트랙 — curriculum·unit1(중1 Ⅰ 수와 연산)·mdsl 수학 팩토리. MATH_GUIDE.md 참조)
  screens/   splash, subject(과목 허브 — 과학·수학 활성·사회 준비 중·스틱맨 낙서 데코),
             onboarding, home(게임 지도 + 중1⇄중2 학년 세그), done,
             paywall(프리미엄 안내·구매), login(구글·카카오·네이버 소셜 스텁 — 출시 시 OAuth 연결)
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
   u6=gas, u7=space, g2u1=chem, g2u2=geo, g2u3=light, g2u4=atom) + `ui.css`에 `.unit-band.X`/`.gm-terrain.X`/`.gm-path-*.X`/`.gm-node.X` 변형 + tokens에 그라데이션.
   랩 안 킥커는 `concept({ kickerTone: "heat" })` 식으로. 새 색은 기존 단원과 겹치지 않게
   (u4 matter #7C6BFF 보라 ↔ u7 space #4A54E1 딥 인디고 ↔ g2u1 chem #E64980 지시약 로즈 ↔
   g2u3 light #C838A6 오키드 마젠타 ↔ g2u4 atom #7CB024 라임 그린처럼 뚜렷이 구분).
   주의: 'chem' 테마명은 중2 I(물질의 특성)이 선점 — 중2 IV(물질의 구성)는 'atom'을 쓴다.
   **테마명은 기존 유틸 클래스와도 충돌 검사**: 수학 Ⅵ이 'stat'을 썼다가 완료 화면 카드 `.stat`
   (ui.css, 흰 카드)에 `.gm-node.stat`이 걸려 지도 노드가 흰 카드로 감싸인 실사고 → 'data'로 교체.
   새 테마명 확정 전 `grep "\.<이름>\b" src/styles/*.css`로 선점 여부부터 확인한다.

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
- **중2 II 지권 에셋**: 암석·광물 표본과 증거 사진은 codex 실사풍 발주(`bash qa/order-geo.sh` →
  `node qa/process-geo.mjs`, public/geo/{rocks,minerals,evid} 512 webp — drift/figs 디렉터리는 비율 유지 960 모드).
  퀴즈에는 unit2.ts의 gimg/gpair/gitem/gquad(2×2 (가)~(라) 순서 문제)/glabeled(사진 위 한글 라벨 필 —
  '이미지 안 글자 금지' 발주 규칙과 라벨 표기를 양립시키는 표준) 헬퍼로 `<img>` 임베드.
  2차 발주(qa/order-geo2.sh → geo2_prompts.txt): 대륙 이동 4단계(geo/drift/stage-*.webp),
  평면 세계지도(geo/figs/worldmap.webp — quakenews 훅 SVG가 `<image href>`로 임베드, 마커는 지도 실좌표),
  판 구조 단면(geo/figs/plate-section.webp — unit2.ts plateSectionImg()가 L9 개념·문제 공용).
  대륙 지도는 PALEOMAP 11시대(public/geo/maps, C.R. Scotese — CREDITS.md; 추가분 파일명 ma###.webp,
  원본 90시대는 scratchpad의 earth-history 리포) — driftLab이 타임라인 스크럽+두 장 크로스페이드로 쓰고
  (5장은 이동이 뚝뚝 끊긴다는 피드백 → 11장 확장이 결론), plateMap이 현재 지도를 equirect 투영 배경으로 쓴다.
- **puzzlemap 대륙 퍼즐(훅)은 발주 사진이 아니라 SVG** — 드래그 스냅에 벡터 공유 경계가 필요해서다.
  남미·아프리카가 해안 곡선 E(DRIFT_EDGE/REV 쌍)를 공유하며, E는 3악장(A에서 살짝 서쪽→브라질 어깨
  돌출=기니만 홈→남서로 길게 B)으로 설계해야 두 대륙이 실제 지형으로 읽힌다. E만 바꾸면 둘 다 따라온다.
- **setPointerCapture는 항상 try/catch로 감싼다**(binSort·driftLab 선례): 합성 포인터 id에서 throw하면
  리스너 전체가 죽어 "드래그가 안 먹히는" 것처럼 보인다. 실기기에선 정상이라 자동 테스트에서만 드러난다.
- **가로 2D 랩**(rockCycle): rotateStage + plain canvas — 매 프레임 rot.size()로 캔버스를 맞추고
  논리 좌표(1000×480)를 스케일 매핑, 하단 HUD(rc-actions) 여백을 빼고 배치한다.
- **earthCut3d 절단면 수학**: SphereGeometry 정점은 x=-r·cosφ·sinθ, z=r·sinφ·sinθ.
  φ∈[0,270°] 표면이면 뜯긴 창은 -X-Z 사분면(이등분 (-0.707,0,-0.707)) — rotY(3π/4)가 정면,
  교과서 구도는 -0.55rad 덜 돌린다. 절단면은 -X 반원 CircleGeometry 2장(하나는 rotY -90°).

## 수학 트랙 — 과목 차원 · 수학 레슨 문법 (상세는 MATH_GUIDE.md)
- **중2 수학 Ⅰ(m2u1, 유리수의 표현과 식의 계산) 완성** — 10레슨(무료 3+프리미엄 7), 테마 `calc`
  (그레이프 #9C36B5). 중2 수학 신규 파일: content/math/g2/unit1.ts·ui/mathFigures2.ts(cyc 순환점
  표기·calcMiniArt)·steps/hookM2u1.ts+랩 9종(divLab·cycleLab·denomLab·shiftLab 기함·powMulLab·
  powDivLab·monoLab·polyAddLab·expandLab)·**styles/math2.css**(중2 수학 전용 시트, main.ts import).
  스틱맨 컷 폴더는 **math2**(public/math2/cuts, u1lN — 중1 math/cuts와 분리). mfmt가 `)^n`
  (괄호 뒤 지수)을 지원한다. QA: `PORT=<포트> node qa/e2e-m2u1.mjs`.
- **중2 수학 Ⅱ(m2u2, 부등식과 연립방정식) 완성** — 9레슨(무료 3+프리미엄 6), 테마 `ineq`(캐러멜
  브라운 #A9631B). 랩 8종(ineqTruthLab·flipLab 기함·ineqSolveLab·vsLab·pairLab·crossLab 기함·
  subSlotLab·elimLab)+hookM2u2 9장면, 그림·컷은 mathFigures2/math2 관행 계승(u2lN).
  **crossLab은 직선 금지·격자 점만**(일차함수는 중2 Ⅲ 선행), '연립부등식'은 고교 과정이라 금지.
  innerHTML 문자열의 `a<b`는 `&lt;` 이스케이프 필수(단 recap examples는 textContent라 raw <) —
  상세는 MATH_GUIDE.md 중2 Ⅱ 표. QA: `PORT=<포트> node qa/e2e-m2u2.mjs`(퀴즈 보기는 data-oi로 클릭).
- **과목 차원**: `store.viewSubject`("sci"|"math") + `curriculum.ts`의 `CURRICULA_OF`/`subjectOfUnit`.
  과목 전환 창구는 **과목 허브뿐**(subject.ts) — main.ts `pickSubject()`가 setViewSubject 후 `goHome()`으로
  홈을 재생성한다(nav.back은 이전 과목 홈을 보여주므로 금지). 이때 lastUnitId를 반드시 비운다.
  수학 단원 id는 `m1uN`/`m2uN`(레슨 `m1uNlM`) — 과학 `uN`·`g2uN`과 절대 충돌 금지.
- **수학 전용 코드는 신규 파일에 격리**(병합 충돌 0 설계): content/math/(curriculum·unit1~unit6·mdsl),
  ui/mathKit·mathFigures·**geoKit**(Ⅳ 기하 공용 — GEO 팔레트·각 호 angleArc·직각 표시·gsym 기호·
  capturePointer. 기하 그림·랩은 재구현 금지, 이걸 쓴다)·**solidKit**(Ⅴ 입체 공용 — boxRelLab 투영의
  승격판: prism/pyramid/frustum·PLATONIC 5종(면은 쌍대 좌표 직사용 금지, 면 중심 방향 법선으로 생성 —
  오일러 V−E+F=2 검산 필수)·solidSvg 겨냥도),
  steps/hookMath·hookMath2·hookMath3·hookMath4·hookMath5·hookMath6(독립 `mathHook` 타입 — 과학 hook.ts 디스패치 불변),
  steps/{sieveLab·powBuild·factorTree·vennFactor(gcd/lcm/coprime 3모드)·numline·numWalk·counterLab·
  patternLab·areaSplit·mathDrill}(Ⅰ) + {patternRule·substLab·exprAnatomy·likeTerms·eqTruth·balanceLab·
  solveLab}(Ⅱ) + {coordLab·quadLab·bottleLab·droneLab·linkLab·lineLab·shareLab·curveLab}(Ⅲ) +
  {traceLab·rayLab·angleLab·vertAngleLab·perpLab·lineRelLab·boxRelLab(기함 — rAF 없는 이벤트 구동
  SVG 3D 투영, 숨은 모서리는 면 법선 판정 점선)·anglePairLab·parallelLab(기함 — 평행 스냅+엇각
  180° 회전 연출)·compassLab·triBuildLab·congLab}(Ⅳ) +
  {diagLab·triSumLab·polySplitLab·walkLab·circleLab·sectorLab(ratio/calc 2모드)·solidLab·
  platonicLab(기함 — 꼭짓점 접기 360° 심판+정다면체 도감)·latheLab(기함 — 물레 스와이프 회전 잔상+
  단면 예측)·prismLab·coneLab·sphereLab}(Ⅴ — 입체 3D는 ui/solidKit 공용) +
  {meanPullLab(L1 소형 랩 — 수직선 변량 점+평균 마커: 평균 계산 탭→극단값 8→33 드래그→새 대표 선택.
  Ⅵ은 교과서 서사형이 원칙[사용자 확정 2026-07-09]: 개념 하나씩+자료 해석 중심, 기함 랩에 다 담기 금지)·
  modeLab(색 타워 + "평균 색깔 계산" 불가 체험 + 최빈값 명명 비트 + 대푯값 선발전 — meanPullLab과 함께
  L1 대푯값 통합 레슨[2026-07-10, Ⅵ은 6레슨] 안에 산다)·stemLab(농구부 시즌 득점 선반 꽂기·정렬 —
  소재는 교과서 설정 계승·수치 자체 제작)·freqLab(체급 접수처 — 이상~미만 경계 함정 50.0·구간 너비
  25/5/1kg 실험, 버튼 라벨은 자기설명형)·histoLab(막대 세우기+중앙점 잇기, 양 끝 도수 0 내려닫기 함정)·
  relFreqLab(도수 5vs4 → 비율 0.2vs0.4 역전 토글+세로축 눈금·막대 값 라벨, '상대도수' 명명은 랩 결론)}(Ⅵ 통계),
  screens/starGame(Ⅰ 보너스 게임), **styles/math.css**(ui.css를 건드리지 않는 수학 전용
  시트, main.ts에서 import). 공유 파일 수정은 store·curriculum·home·subject·main·registry·tokens.css·
  mapDecor의 최소 append뿐.
- **Ⅲ 좌표평면·그래프 관행**: 좌표평면 배경은 mathKit `planeSpec()`이 단일 진실 공급원(랩 4종과
  mathFigures 좌표 그림 공용, 축 화살표는 양의 끝에만·원점 O). 격자 조작은 최근접 격자점 스냅
  (판정은 pointerup에서), 발견 랩엔 반례 국면(저금통·남은 사탕)으로 "증가=정비례/감소=반비례" 오개념을
  랩 안에서 깬다. **'기울기'는 중2 용어라 금지**, "가파름/y축에 가까워진다"로. 상세는 MATH_GUIDE.md Ⅲ 표.
- **"신기한 응용" 랩은 본선이 아니라 보너스 게임으로**(별그리기 사례, 사용자 확정): 개념의 최단 경로가
  아닌 화려한 응용(한붓 별 = 서로소)은 본선에서 혼란을 부른다 → 서로소는 vennFactor coprime 모드
  (판별소: 8·9 → 9·25 합성수끼리 → 14·21 함정 — 같은 벤 문법 재사용)로 가르치고, 별그리기는
  screens/starGame.ts "별자리 한붓그리기"(UNIT_GAME m1u1, 단원 100% 정복 시 해제, 도감 9칸 =
  별 8종 + 6점의 비밀, 신기록 갱신분만 +5XP)로 승격. main.ts openGame이 unitId로 분기한다.
- **수학 레슨 공식**: 미리보기 퍼즐(mathHook) → 발견 랩 → 용어 정복(concept, 조작 뒤 명명 —
  킥커는 "수학 용어 정복하기"/"규칙 정리" 2종, 정의는 MATH_GUIDE '친절 정의 표준' 필수) →
  recap → 퀴즈(오개념 선택지) → **mathDrill 스피드 퀴즈**(피날레, '스프린트' 명칭 폐기). 과학과 달리 "작은 상호작용을
  촘촘히"가 정체 — 개념 카드 하나가 길어지면 실패. 용어는 랩 뒤에 붙인다(브릴리언트 리서치 결론).
  **단, 랩 조작 자체가 용어를 전제하면 concept가 랩보다 먼저다**(사용자 피드백으로 확정): 대입(substLab)·
  항/계수/차수(exprAnatomy)처럼 이름 없이는 조작 지시문 자체가 안 읽히는 랩이 해당 — Ⅱ L3·L4가 기준.
  "용어 없이 조작 가능한 발견 랩(체·트리·저울)"만 조작 뒤 명명이 맞다.
- **수학 트랙 텍스트에 em대시(—) 금지**(사용자 요구, 진짜 중요): 수학에선 −(마이너스)와 혼동된다.
  제목류(title·subtitle·name·label)는 콜론(:), 본문은 쉼표로. 과학 트랙은 해당 없음. 수식의 −는
  U+2212(mfmt가 자동 변환)만 쓴다. 신규 수학 콘텐츠 저작 시 — 문자를 아예 타이핑하지 말 것.
- **교과서 정석 절차는 그림으로 명문화**: mathFigures의 `alignedFactorFig("gcd"|"lcm")`(소인수분해
  세로 정렬 비교 — 지수 같으면 그대로·다르면 작은/큰 쪽)과 `ladderFig("factor"|"gcd")`(나눗셈 사다리)를
  concept figure 블록으로 임베드(Ⅰ L3·L4·L5가 기준). 랩(벤 다이어그램)은 '왜', 정석 그림은 '어떻게'.
- **지도 장식은 수학 기호 세트**(mapDecor.ts): Ⅰ=pmDeco(±)·fracDeco(½)·primeDeco(7)·opsDeco(×÷)·
  numlineDeco, Ⅱ=xDeco(x)·eqDeco(=)·scaleDeco(저울)·aDeco(a)·boxDeco(x 상자),
  Ⅴ=pentaDeco(오각형)·fanDeco(부채꼴)·diceDeco(주사위)·coneDeco(원뿔)·sphereDeco(구),
  Ⅵ=seesawDeco(시소)·stemshelfDeco(줄기 선반)·histoDeco(막대)·fpolyDeco(다각형 선)·ratioDeco(비율 원).
  새 수학 단원도 그 단원의 상징 기호로 별도 세트를 만든다(단원마다 달라야 함 — 사용자 요구).
- **수식·입력은 mathKit이 단일 진실 공급원**: `mfmt()` 마이크로 마크업("{a/b}" 분수(분자에 n(n-3)
  같은 괄호식 허용)·"^n" 지수·"(+3)"/"(-5)" 부호 수 — 부호만 색: --m-pos/--m-neg·π는 변수처럼 이탤릭), `makeAnswerPad()` 커스텀 넘패드
  (kind: int/frac/dec — **시스템 키보드 절대 금지**), 밝은 모눈 보드 `mboard()`(과학 다크 .stage의 수학판),
  목표 칩 `goalChips()`(pn-badge num). 분수 답은 값이 같으면 정답 + 기약 아니면 스낵 안내.
- **수학 랩은 rAF를 쓰지 않는다** — 전부 CSS 트랜지션/키프레임 + setTimeout 체인(타이머는 Set으로
  모아 cleanup에서 일괄 해제). QA 프리즈 환경에서도 완주 가능하고 배터리에도 유리. 셈돌 배치는
  left/top으로(transform은 born/poof 키프레임 몫 — 겹치면 순간이동, counterLab 헤더 주석 참조).
- **드릴 채점 규약**: recordQuiz는 스텝당 1회(플레이어 공통)라 mathDrill은 "첫 시도 정답률 ≥
  passRatio(기본 0.7)"를 1회로 기록. 오답 시 정답 공개 + why 한 줄 + (정수 덧뺄이면) `mstrip`
  수직선 미니 재생 — 텍스트만으로 끝내지 않는다.
- **QA**: `PORT=<포트> node qa/e2e-math.mjs`(Ⅰ 12레슨) · `qa/e2e-math2.mjs`(Ⅱ 9레슨) ·
  `qa/e2e-math3.mjs`(Ⅲ 9레슨 — 격자 탭·사분면 드래그·물병 예측·드론 스크럽·링크/곱 검사·a 스테퍼·
  곡선 자취 드래그 포함) · `qa/e2e-math4.mjs`(Ⅳ 13레슨 — 자유 드로잉·각 드래그·3D 상자 회전·평행
  스냅·작도 스테퍼·합동 매칭) · `qa/e2e-math5.mjs`(Ⅴ 14레슨 — 대각선 탭·각 조각 드래그·정다면체
  접기·물레 스와이프·전개도 펼치기·모래 예측, 드릴 종료 후는 CTA가 아니라 완료 화면 "홈으로" 버튼. **조작 후 위치가 변하는 핸들은 getBoundingClientRect로 실좌표를 잡아
  드래그한다** — 고정 좌표는 두 번째 시도부터 빗나간 실사고) · `qa/e2e-math6.mjs`(Ⅵ 6레슨 — 평균 계산
  탭/극단값 드래그/새 대표 선택·타워 카드·줄기 선반·체급 열·막대/중앙점 탭·비율 토글·dec 드릴은 넘패드 · 키) —
  훅 장면 버튼·랩 전 조작·넘패드 드릴 입력까지 실플레이.
  랩 애니 잠금에 탭이 먹힐 수 있으니 e2e는 "미완료 대상 재시도 루프"로 조작한다(고정 횟수 탭 금지).
  **e2e 실행 중 src 편집 금지** — HMR 풀리로드로 레슨 상태가 증발한다(사고 #12의 수학판 재발 사례).
  **대량 콘텐츠 수정 후 검증 방식(사용자 확정 2026-07-10)**: 전 단원 e2e 재실행은 시간이 과해 생략하고,
  tsc+build 통과 확인 후 수정 목록을 보고해 사용자가 직접 확인한다(e2e 스크립트 자체는 새 구조에 맞게
  갱신해 둘 것 — 다음 실행자가 쓴다).
- 수학 훅 12장면은 hookMath.ts 안(cicada·paperfold·lockcode·tilefloor·buslight·freezer·gpsdist·
  golfscore·daytemp·rewind·mentalmath·snsdebate). Ⅳ 훅 13장면은 hookMath4.ts(sparkler·laserline·
  clockhands·scissors·longjump·railroad·overpass·subwayexit·blinds·curtain·straws·bakery·thales).
  Ⅴ 훅 14장면은 hookMath5.ts(fivestar·aladder·honeycomb·robotvac·watermelon·cakecut·lanestart·
  diamond·dicegame·pottery·drinkcan·partyhat·balloonup·tombstone). Ⅵ 훅 7장면은 hookMath6.ts
  (lunchavg·penstock·marathon(마라톤 접수처 나이 명단 — 구 library 대체, 교과서 도입 소재 계승)·
  weightclass·camerahisto·likeratio·fakegraph — 전부 "조작 버튼 1개 → 장면 변화 → 예측" 단일 문법).
  공용 hookAsk.ask() 규칙(choices[0]=정답, good≠bad)은 과학과 동일하게 적용된다.

## 퀴즈 유형 (quiz 스텝 하나로)
- `mcq`(5지선다) · `ox`(O/X) · `multi`(보기 합답형, 복수정답) · 그림 퀴즈(`figure` 추가).
- 그 밖의 능동형: `order`(순서 배열), `binSort`(분류), `hotspot`(그림 지목/라벨).
- **mcq/multi 보기는 렌더 시 표시 순서만 셔플**된다(2026-07-10, hookAsk와 같은 문법 — 채점·해설은
  저작 인덱스 기준). "첫 번째=정답" 패턴 학습 방지 장치라, 정답을 첫 보기로 저작하는 관행은 그대로 둬도 된다.
  단 **라벨형 보기는 `shuffle: false`로 순서를 고정**한다: ㄱㄴㄷ 합답형("ㄱ, ㄴ")·그림 라벨 단독((가)(나)·①~⑤)·
  그림 라벨 조합("(가), (다)"·순서쌍 "차례대로 (가),(다)")·구간 번호("①에서는…")가 대상 — 관례 순서가
  깨져 보이면 실격. 이때 조합 보기는 관례 순서(단일→쌍→셋, ㄱ·가 먼저)로 저작하고 answer를 그 위치로 맞춘다
  (정답을 첫 칸에 끌어오지 말 것 — 첫 칸이 정답이던 라벨 조합은 순서를 유지한 채 정답만 2번째 칸으로 옮긴다).
  **예외(셔플 허용)**: 각 보기가 독립 완결 명제라 라벨 순서에 기대지 않는 경우 — 부등식 나열("(가) > (나) > (다)")·
  설명 완비형("(가) 얼음물 · 가만히")은 그림 라벨이 들어가도 그대로 셔플한다(오히려 위치 학습 방지에 부합).
  해설(explainGood/Bad)에서 보기 **위치**("세 번째 보기")를 지칭하면 셔플과 어긋난다 — 보기 내용을 인용해 지칭.
- **e2e는 dev 전용 `data-oi`(저작 인덱스) 속성으로 보기를 집는다**: quiz.ts가 `import.meta.env.DEV`에서만
  각 `.opt`에 부여 — 전 e2e 헬퍼가 `.opts .opt[data-oi="${i}"]` 셀렉터로 갱신됨(dev 서버 필수, 프로덕션 DOM엔 없음).
  e2e-u7·e2e-u5l1은 정답 텍스트 정규식 매칭이라 셔플 무관.

## 프리미엄 디자인 레이어 (tokens.css 하단 :root)
"옛날 자바스크립트" 룩을 걷어낸 격상 토큰. **컴포넌트는 이 토큰만 쓰고 색·그림자를 하드코딩하지 말 것.**
- **중립 램프** `--n0 … --n900` (13단). 면·경계·텍스트 위계를 여기서 뽑는다. `--app-bg`=--n50.
- **다층 그림자** `--sh-card/-raise/-cta/-sheet/-medallion/-inset` — ring + ambient + key, 쿨톤(`--sh-c`). 단일 레이어 금지.
- **근-동조 그라데이션** `--grad-blue/-green/-red/-unit/-bio/-card/-medallion/-medallion-bio/-gold/-sheen`.
- **유리** `--glass-*`. **모션** `--ease-out/--spring-soft/--spring-bounce`.
- 라이트 전용: `prefers-color-scheme: dark` 자동 반전은 의도적으로 넣지 않았다(디자인이 라이트 기준).

## 브랜드 · 스플래시
- 앱 이름은 **"스틱스텝"**(core/brand.ts) — 과목이 늘어날 예정이라 브랜드에 과목명을 붙이지 않는다.
  UI 문구·타이틀·워드마크 모두 BRAND에서만 참조. 태그라인 "손끝으로 배우는 중학 과학"은 유지
  (과목 추가 시 태그라인만 손본다).
- **첫 사용 플로우**: 스플래시 → 과목 허브(screens/subject.ts — 과학만 활성, 수학·사회 "준비 중") →
  학년·목표 온보딩 → 홈. 홈 앱바 왼쪽 grid 버튼으로 과목 허브 재진입, 오른쪽 user 버튼으로 로그인 화면.
- **로그인 정책(결정)**: 로그인을 강요하지 않는다 — 학습·구매 모두 무로그인 가능, 기록은 기기 저장.
  로그인 화면은 진입 장치만(소셜 3종 스텁, 출시 시 OAuth+동기화 백엔드 연결). 강한 프롬프트를 붙인다면
  "첫 레슨 완료 직후"가 최적 시점(가치 먼저, Duolingo 방식) — 단원 진입을 로그인으로 막지 말 것.
- **검토 모드(콘텐츠 검수용)**: 홈 앱바의 브랜드 워드마크 **7연타**로 토글 — 순차·프리미엄 잠금이 전부
  풀리고 브랜드가 로즈색으로 표시된다(store.reviewMode, 기기 저장). 켜져 있으면 **미완료 레슨도 자유
  모드**(player.ts freeNav — 앞으로 가기 화살표로 문제까지 전 스텝 검수 가능, 사용자 요청 반영).
  **출시 전 유지/제거 여부 결정 필요**(남기면 QA 편리하지만 발견 시 프리미엄 우회 구멍).
- 스플래시(screens/splash.ts) = **스틱맨 플립북 v2 "실컷 놀다가 → 공부하자!"**: `public/brand/loading/0..13.webp`
  놀이 14컷(먹기·티비·게임·컴퓨터·친구·공놀이·폰·만화책·낮잠·과자·노래방·자전거·강아지·아차!)을
  `FLIP_SEQ` 몽타주 순서로 125ms 간격 **1바퀴**(서사라 반복 금지, '아차! 시계' 컷이 항상 마지막) →
  `study.webp`(책상 앞 **상체 샷** — 머리띠 질끈, 띠에 한글 "공부하자!", 성별 중립 민머리+안경)로 탁 정착 →
  워드마크 페이드업. 프레임이 없으면 만화 아바타 5종으로 폴백, 그것도 없으면 정적 로고. 탭하면 건너뛰기.
  재발주: `bash qa/order-splash2-tower.sh`(0..6+study+증류탑) / `bash qa/order-splash2b.sh`(7..13+study 상체 수정) →
  `node qa/process-loading2.mjs`(512 webp 경량화, 프레임당 11~33KB). 이미지 속 글자는 study 머리띠 단 하나만 예외
  (잠자는 컷의 Zzz도 금지 — 코 방울로, 음표·하트는 허용).
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
  I=hookCiv.ts(colorcups·speaker·smokestack), II=hookBio.ts(cellzoom[스틱맨쌤 팔 확대→세포]·stain·bodycount·fingerprint[지문 스캐너=변이]·batbird·foodweb),
  중2I=hookChem.ts(9종)·중2II=hookGeo.ts(10종),
  중2III=hookLight.ts(mirrortown·coinmagic·darkroom·catmirror·spoon·pointillism·fishing·kalimba),
  중2IV=hookAtom.ts(zoomtwo·signs·peekatom·menusort·springwater·magnetpull).
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
- **구성 단계 도해(orgLevels 랩)는 bioFigures.ts의 orgArt(key)** — 손코딩 SVG를 codex 발주 일러스트로
  교체(public/bio2/levels/*.webp 10종: 근육세포·근육조직·심장·순환계·강아지 / 잎살세포·울타리조직·조직계·
  잎·나무). orgArt가 key→발주 webp `<img class="org-photo">` 우선 반환, 로드 실패 시 SVG 폴백. 순환계는
  '심장+온몸 혈관망', 조직계는 '잎 단면(울타리+해면+기공)'.
- **세포 구조도(L1 hotspot)도 발주 일러스트**(public/bio2/cells/{animal,plant}.webp) — figures.ts의
  animalCell/plantCell.svg가 발주 `<img>`를 반환하고, spots는 **이미지 기준 %**로 정렬(`.hs-art:has(img)`가
  패딩 0이라 이미지%=스테이지% 일치). 좌표는 반드시 스크린샷으로 눈으로 맞춘다(동물 3·식물 5부위 정렬 검증됨).
- **문제 그림도 codex 발주**(public/bio2/quiz/*.webp) — unit2.ts qimg() 헬퍼로 mcq/ox/multi의 figure에 임베드.
  발주 후보는 감사 워크플로우(레슨 병렬 진단→중복 제거→우선순위)로 뽑는다. `public/bio2/`는 다른 세션이
  재생성하는 `public/bio/`(5계 아이콘)와 분리 — 병렬 세션 충돌 방지.
- **발주 이미지 임베드에 `loading="lazy"` 금지** — 앱은 `.scroll` 컨테이너 안에서 스텝을 렌더하는데,
  lazy 관측 루트가 이 컨테이너와 안 맞아 이미지가 영영 안 뜬다(naturalWidth 0). fresh Image()는 되는데
  DOM img만 안 뜨면 이 문제. hotspot·orgArt·qimg 전부 lazy 없이 즉시 로드한다.
- **누끼(투명 배경) 발주** — 카드 위에 뜨는 사물 아트(구성단계 등)는 codex에 "FULLY TRANSPARENT
  background(PNG alpha)"로 발주하면 알파를 준다(초록 세포류는 codex가 흰 배경으로 흘리기도 해 재발주 필요).
  변환은 process-geo.mjs의 TRANSPARENT_DIRS(흰 배경 fill 생략, 알파 보존). 장면형(서식지·배경 있는 그림)은
  누끼 대상 아님. **codex image_gen은 tmp/ 작업 디렉터리를 만든다 → .gitignore에 tmp/**.
- **분류 단계처럼 한글 라벨이 본질인 도형은 codex가 아니라 SVG 도표**(bioFigures.classStagesFig — 이미지
  안 글자 못 넣는 codex 대신 계급 라벨을 직접 그림). 라벨 없는 codex 피라미드는 "저게 뭐야" 혼란을 부른다.
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
  u4 phaseNames(하얀 김), u5 gravityDrop(우주 정거장), u7 sunLab(흑점 역설), 중2III diffuseLab(하얀 종이)·
  refractLab(신기루)·mirrorImageLab(구급차 거울문자)·colorMixLab(물감 혼합)·waveLab(우주 폭발음)·
  soundLab(헬륨 목소리), 중2IV elementLab(수소도 쪼갤까)·moleculeLab(산소vs오존)·atomLab(전자는 왜 안 빨려드나)·
  periodicLab(수소는 왜 예외)·ionLab(나트륨 원자vs이온)·ionMoveLab(안 보이는 이온을 어떻게). 오개념 교정형 질문이 기준.
- **recap 카드의 `more`(자세히)는 문제집 수준이 표준** — 모든 카드에 존재해야 하며,
  `<b class='rm-h'>왜 그럴까요?</b>` 소제목 2~4개(rm-h 전용 CSS가 카드 액센트 색 다이아 불릿을 붙임)로
  ①원리(왜) → ②구체 예시 → ③시험 함정/오개념 교정 순서를 갖추고, 상식 꼬리는 기존 `<span class='fun'>` 유지.
  분량 400~800자·해요체. 훅/랩에서 이미 쓴 소재는 반복 말고 "그 장면 기억나요?"식으로 참조만.
  (중2 III·IV recap은 아직 이 표준 이전 분량 — 검수 때 함께 격상 후보.)
- **상호작용 랩 앞에는 개념이 먼저** — 용어(정의)가 필요한 랩이면 concept 스텝(term 블록)으로 판을 깔고
  들어간다(g2u2 L9 판→판의 경계→plateMap이 기준). 훅에서 바로 랩으로 점프해 용어 없이 조작만 시키지 말 것.
- **스틱맨 개념 컷 표준(사용자 확정 — 전 concept 스텝 필수)**: 모든 `concept` 스텝은 **첫 블록**에 발주
  스틱맨 만화 1컷을 둔다 — `{ k: "figure", svg: cut("<theme>", "<name>", "<alt>"), cap: "위트 있는 한 줄" }`.
  `cut(theme, name, alt)`는 dsl.ts의 단일 헬퍼(구 unit7 로컬 복제본 승격) — `public/<theme>/cuts/<name>.webp`를
  임베드하고 lazy 금지(스크롤 컨테이너에서 안 뜸). 폴더는 단원 테마별 분리로 병렬 세션 충돌을 막는다:
  bio2·chem·geo·light·atom·elec·math (중1 II=bio2, 중2 I=chem, II=geo, IV=atom, VII=elec,
  **수학 Ⅰ~Ⅲ=math** — 컷 이름은 uNlM, 발주 qa/order-mathcuts.sh + mathcut_prompts.txt, 30컷 소급 롤아웃 완료).
  컷 장면은 그 개념을 **일상 스틱맨 장면**으로 — 훅/랩에서 쓴 소재 재활용 금지, **새 각도**로 잡는다
  (분류=겹원에 생물 담기, 순물질/혼합물=한 종류 병 vs 뒤섞인 병, 화학식=손가락으로 원자 개수 세기,
  주기율표=빈 칸 도표에서 한 칸 짚기, 이온식=전자 알갱이 건네주기 — 숫자·기호는 손가락·개수차로 대신).
  발주는 `qa/cuts_prompts.txt`(스타일 블록 A = elec와 동일: 손그림·teal 원포인트·글자 절대 금지·4:3) +
  `qa/order-cuts.sh`(단원별 순차 배치 — 병렬 codex 금지). 변환 전 새 폴더를 process-geo.mjs ASPECT_DIRS에
  등록. 발주 후 Read 도구로 눈 검수(글자 없음·손가락 5개·과학 정확), 로드 검증은 `qa/check-cuts.mjs`
  (전 트랙 스캔 → naturalWidth>0). **중2 III(빛과 파동)은 concept 스텝이 0개**(훅→랩→recap 구조)라 컷 대상 아님.
- hotspot 스텝은 `spot.photo`(+photoCredit)로 부위별 실사 사진 카드를 설명 아래에 띄울 수 있다(태양 지도가 기준).

## 훅 예측 규칙 (steps/hookAsk.ts — 위반 금지)
- 훅의 예측 선택지는 **반드시 공용 `hookAsk.ask()`**로 만든다(장면 파일 안에 로컬 ask 복제 금지).
- 데이터 규약: **choices[0]이 항상 과학적으로 옳은 예측**(content에서 커스텀 choices를 넘길 때도 동일).
  화면 표시는 자동 셔플되므로 "첫 번째=정답" 노출 걱정은 없다.
- **good(정답)·bad(오답) 문구는 반드시 다르게** — 오답 문구는 고른 오개념을 짚고 옳은 방향을 알려 준다.
  무엇을 골라도 "완벽한 예측!"이라 칭찬하는 구현은 버그다(실제 있었던 사고).
- 정답이 없는 열린 예측(이후 실험으로 확인)만 `neutral: true` — 이때도 문구는 "예측 완료, 실험으로 확인!"
  톤이어야 하고 정답 칭찬("완벽해요/정확해요")을 쓰면 안 된다.
- 오답 선택 시 옳은 보기가 초록(`.hook-choice.reveal`)으로 함께 밝혀진다. 예측은 채점에 넣지 않는다.
- **질문은 선택지 위에 뜬다(2026-07-10)**: 장면들은 질문을 helper(카드 아래)에 쓰고 ask()를 부르는데,
  helper는 선택지보다 아래라 화면 밖에 깔린다(실사용 피드백 — 매미 훅 사례). ask()가 helper의 현재
  문구를 `.hook-q`로 선택지 위에 복제하고 helper를 "직감으로 골라 보세요" 안내로 교체한다 —
  전 훅(과학·수학) 공용 동작이니 장면 쪽에서 따로 처리하지 말 것.
- **맥락 규칙**: 소재의 이름·설정(갈륨 동전, 로르산 같은 재료명)은 반드시 **도입(title/lead/narrator/장면
  안내)에서 먼저 소개**한다 — 답변에서 처음 튀어나오면 결함(실제 있었던 갈륨 사고). 단, 개념적 정답
  (자전·확산·압력 원리)은 답변에서 처음 등장하는 게 정상 — 미리 말하면 예측이 무의미해진다.

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

## 중2 III 빛과 파동 — 광학·파동 랩 규칙
- **광학은 전부 "정확한 계산"으로 그린다** — 눈대중 좌표 금지. 반사=입사각 미러링, 굴절=스넬(n=1.33,
  물↔공기 경계 교차점은 이분법 22회), 평면거울 상=거울 대칭점(반사점은 상점—눈동자 직선과 거울의 교점 —
  반사 법칙과 완전 동치), 벤치=1/v+1/u=1/f(실물 쪽 양수, f는 화면 폭 비례 `focalOf`).
  이상광학에선 물체 끝의 모든 광선이 상점을 지나므로 장치 통과 후 광선은 "히트점→상점 직선"으로
  작도한다(허상은 반대 방향으로 진행 + 상점까지 점선 연장). 이게 작도법이자 구현이다.
- **벤치 UI에 '초점·실상·허상' 용어 금지** — 이 교과서는 상의 겉모습(바로/거꾸로·크고/작음)만 서술한다.
  IV의 '녹는점 용어 미도입'과 같은 결. 상태 필은 "바로 선 상 · 커요(314%) · 거울 뒤" 식으로.
- 광선은 lightKit.drawBeam만 사용(글로우 3층 + 흐르는 광자 점 = 진행 방향이 몸으로 읽힘). 레이저 초록,
  랜턴·평행광 웜화이트, 입사각 앰버 "255,196,90" / 반사·굴절각 시안 "126,214,255"로 통일.
- soundLab의 Web Audio는 사용자 제스처("소리 켜기")로만 시작, 게인 캡 0.2, cleanup에서 osc.stop+ctx.close.
  오디오 실패 기기에서도 무음 모드로 전 목표 달성 가능해야 한다(훅 kalimba의 ping도 try/catch).
- waveTank는 소스 이력 버퍼(90Hz 샘플·150px/s 전파)로 **임의의 손 입력이 그대로 파동**이 된다 —
  탁구공은 dispAt(x)만 읽어 세로로만 움직인다(매질 제자리 진동의 증명 장치).
- **포인터 캡처는 lightKit.capturePointer로** — 합성 PointerEvent(E2E)에서 setPointerCapture가 throw해
  핸들러가 중단되는 것을 막는다. 프레임 루프에서 목표 달성 시 setTimeout을 예약할 땐 반드시
  `!goals.has(id)` 가드를 함께 둘 것(매 프레임 중복 예약 → 예측 선택지가 여러 벌 붙던 실제 버그).
- QA: `PORT=<포트> node qa/e2e-g2u3.mjs`(8레슨 전 스텝 실플레이 — 훅·랩 목표·예측·작살·관찰소 4모드·벤치 4모드·퀴즈),
  `PORT=<포트> node qa/shot-g2u3.mjs`(주요 화면 18장 → qa/shots/). 5173이 점유되면 dev 서버가 5174로
  뜨니 PORT를 맞춘다. 진행도 시딩은 store.ts 실제 스키마(`lessons: {id:{done,acc,bestXp}}`, `totalXp`)로.
- **L5 거울·렌즈는 2랩 체제**: 일반 = `opticView`(세로 3D 관찰소 — space3d를 우주 밖에서 처음 재사용.
  촛불(물체)과 공식 기반 고스트 촛불(상)을 3D 배치, 상만 layers(2)에 올려 시선 카메라 인셋
  "눈에 보이는 모습"을 moonPhase3d 시저 문법으로 렌더. 카메라는 촛불·상 스팬을 매 프레임 계산해 추적) →
  심화 = `mirrorLens`(가로 상 작도 벤치, 물체는 촛불 — 뒤집힘이 불꽃 방향으로 즉시 읽힘).
  UI에 '초점·실상·허상' 금지 규칙은 두 랩 공통. 배율·방향·위치 문구는 상태 필 하나로 통일.
- **빠르게 움직이는 랩에는 labExplain 카드**(ui/labExplain.ts): 랩 아래에 정지 그림 + 용어 행으로
  개념을 붙잡아 준다(waveLab 파동 4요소 + waveExplainFig, soundLab 3요소 + soundMiniFig 비교쌍).
  waveTank는 전파 속도 슬라이더(60~260px/s, 이력 버퍼 6초)가 있어 속도↑ → 마루 간격(파장)↑을 관찰.
- **hotspot `pad0` 옵션**: SVG를 스테이지에 꽉 채워(패딩 0) 스팟 % = viewBox 좌표/치수 × 100이 정확히
  성립(waveHotspotFig가 기준 — 그림 기하 주석에 좌표를 남기고 스팟과 1:1 대응). 상단 근처 스팟(y<24%)의
  정답 태그는 `.hs-tag.below`로 점 아래에 떠 overflow 잘림을 피한다(showTag가 자동 판단).
- **광선 화살촉은 lightFigures.rayArrow()**: 반쪽 틱(l10 6류)은 잡선처럼 보여 금지 — V자 화살촉을
  광선 위 t 지점에 그린다(reflectAngleFig·refractPathFig 적용).

## 중2 IV 물질의 구성 — 화학 랩 규칙
- **입자 표현은 ui/chemKit이 유일한 진실 공급원** — 직접 색·크기를 하드코딩하지 말 것. 원소 색은
  CPK 관례(H 흰·O 빨강·C 짙은회색·N 파랑·Cl 초록·S 노랑·Na 보라·금속들), 상대 크기 대소 관계 준수
  (H가 가장 작고, 음이온 Cl⁻ > 원자 > 양이온 Na⁺). 원자핵은 붉은 구 + `+N`(양성자수) 라벨,
  전자는 파란 (−) 알갱이. drawAtomBall·drawNucleus·drawElectron·drawIonLabel·formulaHtml만 쓴다.
- **과학적 정확성(사용자 요구)**: 원자 종류는 양성자수가 정함(atomLab이 명시), 이온화는 전자 수만 변하고
  양성자수 불변(ionLab: 전하 = 양성자수 − 전자수 정확 계산), NaCl은 분자가 아니라 Na⁺/Cl⁻ 교대 격자로
  그린다(elementLab). 물 분자는 굽은형(104.5°), CO₂ 직선형, NH₃ 세 갈래 — GEOM 테이블(chemParticles).
  이 교과서는 전자껍질/옥텟을 도입 안 함 → 전자는 보기 좋게 두 원에 분산(껍질 이론으로 오해 말 것).
- moleculeLab은 목표 화학식의 종류별 개수가 정확히 맞아야 완성(초과 시 "빼기" 유도). split 모드는
  물 분자를 쪼개 "분자가 원자로 나뉘면 성질을 잃는다"를 체험(원자→물성 없음).
- ionMoveLab(전기영동): 양이온→(−)극·음이온→(+)극. 색 이온(Cu²⁺ 파랑·MnO₄⁻ 보라)만 보이고 짝 무색
  이온(SO₄²⁻·K⁺)은 토글로 표시. 이동 속도는 넉넉히(62px/s — 14px/s는 답답해서 올림), flip 목표는
  "극 바꾼 뒤 반대로 45px 이동"으로 감지(중앙 통과 순간만 잡으면 놓친다 — 실제 버그였음).
- 만화: u6l2와 같은 codex 파이프라인으로 **g2u3l6 뉴턴 프리즘 7컷 발주 완료**(7/7, `qa/g2u3l6_imagen_prompts.txt`,
  `qa/order-g2u3l6.sh`, 저장 `public/comics/g2u3l6/`). 손그림 스틱맨·글자 없음 스타일 유지, 분광→재합성 정확.
  중2IV는 만화 없이 훅 6종으로 도입(분석 결과).
- **표기법 학습은 "개념 → 연습 → 랩" 순서**(사용자 요구로 확립): L2 = 기호 규칙 concept →
  `pairMatch`(기호↔이름 짝 맞추기, 범용 스텝) → 화학식 concept(formulaAnatomyFig) → moleculeLab →
  해석 문제(CO₂ 구성·NH₃ 원자 수). L5 = moleculeLab → `formulaLab`(156쪽 '해 보기' — 분자 모형 보고
  화학식 토큰 입력, 순서/개수/종류별 오답 피드백) → 이온식 concept(ionNotationFig: 잃으면 +·얻으면 −·
  숫자 먼저·오른쪽 위) → 표기 연습 문제 → ionLab. 훅에서 바로 랩 점프 금지 원칙의 화학판.
- **L4 주기율표 = 만화 + 읽는 법 concept + 가로 랩**: 도입은 라부아지에→멘델레예프 7컷
  (`qa/order-g2u4l4.sh`, public/comics/g2u4l4/). **4·6컷은 원소 기호가 든 버전으로 재발주**
  (`qa/order-g2u4l4-sym.sh` — '이미지 안 글자 금지'의 의도적 예외: 1~2글자 원소 기호만 허용,
  프롬프트에 기호 철자 검수·재생성 지시. 20종 전부 정확히 나옴). 만화 뒤 concept(atomFigures.
  cellAnatomyFig — 원자 번호/원소 기호/원소 이름 해부도)로 읽는 법을 가르친 뒤 랩 진입.
  periodicLab v3는 rotateStage 안 **DOM 18열 × 7주기 그리드**(.ptx-*): 교과서 그림 IV-6 그대로
  **1~118번 전체**(란타넘족 57~71·악티늄족 89~103은 병합 칸 1개씩, 104번~ 상온 상태는 '추정' 표기),
  칸에 번호·기호·한글 이름, 탭 → 하단 정보 바에 간단 특징(주요 원소 ~50종은 전용 노트).
  칠하기 토글은 **순환식**(끄기 → 상온 상태[고체 파랑·액체 초록·기체 살구 — 액체는 Br·Hg 단 둘] →
  금속·비금속·준금속). 미션 = 1족 삼형제·18족 삼형제·2주기 번호순 완주. rotateStage는 DOM을
  그대로 회전하므로 캔버스 리매핑 없이 버튼 이벤트가 정상 동작한다.
- **발주 정확성이 위험한 요소는 라스터+벡터 하이브리드**(hookAtom peekatom이 기준): 배경 3단
  (연필심 매크로·흑연 원자·핵만 있는 원자 내부)은 발주 라스터(public/atom/hook, "NO electrons" 조건),
  전자 6개는 SVG animateMotion 오버레이 — 발주 품질과 과학적 정확성(개수·궤도)을 동시에 확보한다.
- **L6 이온의 이동 = 실험 설계 concept → 랩 → 실제 사진**: 랩 앞 concept가 실제 실험 설계(질산 칼륨
  적신 거름종이 = 이온의 길, 색깔 이온 = 눈에 보이는 발자국)를 발주 사진+라벨로 설명하고, 랩 아래
  labExplain 카드가 전류 전/후 실사 쌍(atom/quiz/ionmove.webp·ionmove-after.webp — after는 파란
  반점이 (−)극 쪽 혜성 꼬리)을 보여 준다. 시뮬레이션↔실물 대응이 원칙.
- **훅 장면 전자 궤도는 SMIL animateMotion**(hookAtom peekatom): 전자를 궤도 타원 path 위에서 돌려
  "궤도 이탈" 자체가 불가능하게. 탄소는 전자 6(내2·외4)·핵 알갱이 12(양성자6+중성자6) — 개수 정확히.
- QA: `PORT=<포트> node qa/e2e-g2u4.mjs`(6레슨 실플레이 — 스테퍼·세그·분자 조립·짝 맞추기·화학식 입력·
  가로 주기율표·전기영동 전부, 전 스텝 통과), `qa/shot-g2u4.mjs`(랩 화면 캡처). 진행도 시딩·포트 규칙은 중2III과 동일.
- **문제 그림 발주 임베드**: 거울 2종(public/light/quiz, 정사각 — unit3 lpair로 (가)(나) 라벨)과
  전기영동 장치(public/atom/quiz, 2:1 — unit4 alabeled로 (−)극·(+)극·용액 라벨 필). process-geo.mjs의
  SQUARE_DIRS/ASPECT_DIRS에 두 폴더 등록됨. 발주는 반드시 **순차 실행**(병렬 codex exec는 tmp/ 충돌로
  다른 배치 이미지가 뒤바뀐 실사고 — g2u3l6 3번 컷에 잎 단면이 저장됐었다. qa/order-g2u3l6-fix.sh로 복구).

## 중2 VII 전기와 자기 — 전기·자기 랩 규칙
- **회로 소품·전하 표현은 ui/elecKit이 단일 진실 공급원**: drawWire(전류 점 흐름 — 속도 ∝ 전류)·
  drawBattery·drawBulb(밝기 0~1)·drawSwitch·drawPlus·drawSpark. **전자(−)는 chemKit drawElectron을
  re-export** — IV 단원에서 배운 그 전자와 같은 표현(단원 연계가 학습 장치).
- **과학 규칙(위반 금지)**: 마찰·유도에서 이동하는 건 언제나 전자(원자핵·(+) 불변). 정전기 유도는
  가까운 쪽=다른 종류·먼 쪽=같은 종류, 어느 대전체든 결과는 인력. 전류 방향은 전자 이동의 반대
  ((+)→(−) 관례). 옴의 법칙은 그래프에서 유도(직선=비례 → 반비례 곡선 → I=V/R). 직렬=전류 같고
  전압 나눔, 병렬=전압 같고 전류 나눔. 코일 자기장 소단원은 관찰 먼저 — 랩 뒤 '쉽게 기억하는 법'
  concept로 **오른손 감싸쥐기**(발주 손 사진+라벨, 네 손가락=전류·엄지=N극)를 도입(1차 피드백으로 사용자 확정,
  '법칙' 명칭은 안 씀). 코일이 받는 힘 소단원에서 손바닥(네 손가락=자기장·엄지=전류·손바닥=힘) 도입. F=BIL·플레밍 금지.
- **레슨 공식 이행**: L1 훅(겨울 정전기 3사례) → frictionLab(현상: 끌림·밀림, 기본 도구=파란 빨대 —
  같은 털가죽으로 문지른 짝꿍이 먼저) → rubLab(원인: 전자 이동) — "현상 먼저, 원인은 그다음" 2랩 체인.
  L2 inductionLab 뒤 concept(끌려온 이유 5단계 — (+)핵 고정·전자만 이동 인과 사슬). L3 waterCircuit은
  가로 비유 랩(대응 5쌍 탭 매칭) — **두 회로는 위치까지 거울 대칭(+518)**: 펌프(92,240)↔전지(610,240 세로),
  밸브(244,96)↔스위치(762,96), 물레방아(395,205)↔전구(913,205). L4 ohmLab은 **2모드**: ① 전압 바꾸기(V-I 직선)
  ② 저항 바꾸기(3V 고정·길이 1·2·3배=10·20·30Ω → I-R 반비례 곡선, 바이올렛). L5는 랩(관찰) →
  concept(물길 비유 그림 + '숫자로 딱' 4V→2V+2V 수치 예시) 순서. L8 swingLab3d(자기장·전류·힘 makeLabel
  라벨 + 아래변 전류 알갱이 흐름) → concept(그네 정리 그림+손바닥 규칙) → concept(전동기).
- 니크롬선 수치 규약: 긴 선 R=20Ω·짧은 선 R=10Ω(=길이 2배·1배), 저항 모드 길이 3배=30Ω, 전압 0~6V
  (0.5V 스냅)·전류 축 0~600mA — 그래프 문제(viGraphFig: 4V·200mA → 20Ω, 2026-07 수치 감사로 교과서
  3V·300mA에서 교체)는 랩의 '긴 니크롬선 20Ω(3V→150mA)'과 같은 저항값을 공유한다.
- elecFigures: 퀴즈 SVG(마찰 전후·깡통 유도·V-I 그래프·병렬 회로·전동기 힘쌍) + 물길 비유 2종 +
  elecMiniArt. 단원 테마 elec(볼트 옐로 #EFB800) — 중1 force 앰버와는 학년 트랙이 달라 동시 노출 없음.
- **발주 에셋(public/elec/)**: hook(정사각 — wintershock calm/zap 쌍 6장, `.he-wframe` 크로스페이드) ·
  figs(회로 사진·오른손 grip·손바닥 palm·그네 장치 swing·전동기 motor — unit7.ts `elabeled()`로 한글 라벨
  필 오버레이) · cuts(**스틱맨 개념 컷** 6장 — concept 첫 블록에 `cut()` 헬퍼로 임베드. 사용자 확정 표준:
  개념 스텝마다 발주 스틱맨 컷 1장, VII이 기준 구현이고 **전 단원 롤아웃 완료** — 아래 "스틱맨 개념 컷 표준" 참조).
  발주 qa/order-elec.sh,
  변환은 process-geo.mjs(SQUARE/ASPECT_DIRS 등록됨). **발주 손 사진이 왼손으로 나오면 qa/flip-grip.mjs
  좌우 반전**(거울상=반대 손) — 라벨 x는 100−x로 미러. 오브젝트 "삽입"(틈 사이 끼움) 구도는 codex가
  잘 실패한다 — 가림(occlusion) 단서를 프롬프트에 명시하고 눈 검수로 재발주.
- **훅은 나레이터가 약속한 조작 순서와 구현이 일치해야 한다**(위반이 "안 먹혀요" 실사용 피드백의 원인):
  multitap = 하나씩 꽂아 확인 → 예측 → 뽑아 검증(초기 전부 .out+off-*), compasswire = 스위치 먼저(홱!) →
  "왜 움직였을까" 예측, brightpair = 전지 먼저 끼워 밝아짐 관찰 → "전류는?" 예측(2차 피드백 — VII 훅은
  전부 조작 먼저·예측 나중 패턴으로 통일됨). 예측 중에는 장면을 잠근다(helper 덮어쓰기 방지).
- **L8 전동기 = hotspot 인터랙션**(2차 피드백로 확정): 교과서 그림 VII-15 모작 발주(motor2.webp — 화살표·
  손 없이 구조만) + `motorArt()`가 자기장·전류 방향을 SVG 오버레이로 얹고, 코일 **왼쪽 변·오른쪽 변**
  스팟 탭 → 속컷 SVG(motor-left/right.svg — 전류·자기장·힘 3화살표) 카드. **hs-photo 카드는 170px
  고정·object-fit:cover** — 속컷 도해는 400×184(표시 비율)로 저작하고 y≈146 아래(캡션 필 영역)를 비운다.
- **그네 정리는 figTabs 3상태**(3차 피드백 — 교과서 그림 VII-13 그대로): `figTabs` 범용 스텝(steps/figTabs.ts,
  세그 탭 → 그림+설명 교체, 전 탭 열람 시 CTA — 교과서 "~할 때" 상태 비교 그림의 인터랙션판) +
  직립 말굽자석 발주 2상태(swingtab-a: 위 파랑 S·아래 빨강 N / swingtab-b: 색 스왑, 같은 구도 지시) 위에
  `swingTabArt()`가 코일 5턴·자기장·전류·힘을 벡터로 얹는다. '틈 사이 삽입' 구도는 codex가 4연속 실패 —
  자석만 발주 + SVG 오버레이가 확정 해법. 오버레이 좌표는 viewBox = 이미지 %(정사각 100×100, 4:3 100×75).
- **전류 화살표는 볼트 옐로(#FFD400)+진갈색(#6E3F16) 테두리** — 앰버는 구리 코일과 색이 겹쳐 구분 불가
  (3차 피드백). 발주 손 사진은 왼손이 나올 수 있다 — 물리 검산(F=IL×B로 손바닥 방향 확인) 후
  `qa/flip-img.mjs <경로>`로 좌우 반전(거울상=반대 손), 라벨 x는 100−x로 미러.
- swingLab3d 자기장 ArrowHelper는 극 반전 시 **방향과 함께 origin.y도 ±18 이동**(BOT_Y+18·poleDir) —
  고정 origin이면 반전 때 화살표가 위 극 블록 속으로 숨는다(실사용 피드백 버그).
- 교과서 도해 확인이 필요하면 **pymupdf(fitz)로 페이지를 렌더**해서 Read로 본다(`py -m pip install pymupdf`) —
  pdftoppm 없음, pypdf 이미지 추출은 벡터 도해를 못 꺼낸다(장식 래스터만 나옴).
- inductionLab 깡통은 **끝면(원판) 뷰** — 축이 화면 안쪽이라 좌우 이동=구름이고, 풀탭·림 점이
  rollPhase(=이동거리/반지름)로 회전. 옆모습(축이 좌우)은 축방향 미끄럼이라 물리적으로 구를 수 없는 구도.
- coilFieldLab 코일 권선은 x=−sin(t) 순서 — 진입 전선(오른쪽 위로)과 루프 흐름이 이어져 보인다
  (+sin은 반대로 보이던 실제 피드백 버그). elecCircuit 모드 세그는 무대 밖 아래(전구 가림), 토스트는
  `.toast.low`(base.css — 관찰 대상이 무대 위쪽일 때 하단 배치). drawBattery에 vert 옵션(세로 전지,
  라벨은 바로 서게 — waterCircuit 전지가 사용).

## 중2 VIII 별과 우주 — 천문 랩·실사 규칙
- **NASA/ESO 실사 파이프라인**: `node qa/fetch-nasa-star.mjs`(정본 직링크만 — **API 자동 검색 매칭 금지**,
  pleiades→WISE·apollo11→훈련 사진·jwst→행사장 사진 오배송 실사고) → `node qa/process-star.mjs`
  (최대 1400px webp, 원본 jpg 삭제). **photojournal.jpl.nasa.gov·nssdc는 HTML 챌린지 페이지를 반환**하므로
  금지 — images-assets.nasa.gov 미러가 확정 경로. 다운로드 후 매직 바이트(ffd8ff)와 눈 검수 필수,
  출처는 photos/CREDITS.md. 13종: 은하 2(top R.Hurt·pan ESO)·성운 3(오리온/말머리/M78)·성단 2(플레이아데스/M5)·
  명왕성·스푸트니크·아폴로11·허블(sts061-73-040)·ISS·JWST(GSFC e000162 골든 미러).
- **hotspot `spot.photo`는 상대 경로만**("photos/star/x.webp") — 렌더러가 base를 붙이므로 BASE를 미리
  붙이면 `//photos/…` 프로토콜 상대 URL이 되어 영영 로드 실패(naturalWidth 0 실사고).
- **space3d makeLabel·makeGlow의 size는 월드 단위** — VII 태양계는 수백 단위 좌표계(size 26 OK),
  소형 씬(수 단위 span)에선 0.5 안팎. 26을 넘기면 라벨 하나가 화면을 덮는 흐린 블롭이 된다(실사고).
- 랩 4종: parallaxLab(연주시차 **스테퍼** — 버튼마다 지구 이동·시선이 자라나는 단계 연출, 지구가
  실제로 반 바퀴 돌고 3월 자리에 유령 지구; 각도는 2·atan(orbR/세로거리) 기하 그대로 + "과장 모형" 명시),
  starLight3d(역제곱 3D — 단위 사각뿔 scale=d로 스크린 단면과 일치, 광자 240알 개수 불변 연출,
  **카메라 고정·회전/줌 입력 없음**(사용자 지시), dist는 hfov 검산), starColorLab(켈빈→RGB 흑체 근사
  Tanner Helland — 3,000~30,000 K 로그 슬라이더, 색 구간마다 실제 별 이름), balloonUniverse(풍선 우주 —
  은하 딱지 탭=시점 전환, 화살표 길이 ∝ 표면 거리 증가분=허블 법칙).
- 훅 7종(hookStar.ts): thumbjump(엄지 시차)·nightroad·brightlie(시리우스vs데네브)·gasflame·
  milkyband(은하수 pan 실사)·orionblur·movingstar(ISS) — 실사는 SVG `<image href>` 스코프 문법(hookSpace 계승).
- 만화: g2u8l7 허블 7컷(`qa/order-g2u8l7.sh`) — 컷5는 "화살표가 관측자를 향함(다가오는 것처럼 읽힘)"
  오개념 리스크로 재발주(관측자 왼쪽 고정 + 은하가 오른쪽으로 멀어지는 구도). 스틱맨 컷 6종은
  public/star/cuts(`qa/order-star-cuts.sh`, process-geo.mjs ASPECT_DIRS 등록).
- e2e(`PORT=<포트> node qa/e2e-g2u8.mjs`): **nav.go 연속 push 방식은 셀렉터를 전부 `.screen.active`로
  스코프**해야 한다(숨은 화면의 CTA를 잡던 실사고) + createLessonPlayer 두 번째 인자는
  `{ onExit, onComplete }` 객체. 프리뷰 하니스 rAF 프리즈(사고 17) 시 이 e2e가 픽셀 검증의 확정 경로.
- **galaxy3d(L5) = 가로 3D 우리은하 관측선**(2차 피드백로 hotspot 대체): 디스크는 milkyway-top 실사에
  **원형 알파 페이드 마스크**(캔버스 destination-in — 사각 텍스처 그대로면 검은 다이아 윤곽 실사고)를
  합성한 평면 + 입자 볼륨(원반 두께·벌지)이라 옆에서도 "납작+불룩"이 산다. 드래그 = polar/azim 궤도,
  탭 = 태양계·은하 중심(**중심 탭 → 은하수 파노라마 카드** — "안에서 중심 방향을 보면"의 위치 논리),
  지름 10만·중심~태양 3만 광년 라벨을 씬에 상시 표기. **가로 랩 leave()는 반드시 rot.dispose()까지** —
  onLeave 콜백은 오버레이를 제거하지 않아, 빠뜨리면 fixed 오버레이가 남아 이후 모든 터치를 가로챈다(실사고).
- **comic panels의 img는 상대 경로만**("comics/g2u8l7/0.png") — 렌더러가 BASE를 붙인다. spot.photo와
  같은 이중 접두 함정(만화가 전부 폴백 스틱맨으로 보인 실사고). concept term의 icon은 **core/icons.ts에
  있는 키만**(cloud는 이번에 추가) — 없는 키는 조용히 빈 아이콘이 된다.
- starLight3d 카메라는 +x쪽으로 비튼 dir(0.62,0.4,1) — 정측면이면 격자 "면"이 안 보여 몇 칸 덮는지
  안 읽힌다(2차 피드백). 훅 실사 `<image>`는 slice 기준 viewport가 클립 rect를 **완전히 덮게** 잡을 것
  (7px 모자라 흰 띠가 생겼던 milkyband 실사고). 밤 장면 스틱맨은 stargaze 문법(접촉 그림자+머리 fill+
  한 path 포즈) — 뻣뻣한 대칭 line 스틱맨 금지.

## 메타볼 렌더러 (대단원 IV에서 이식 완료)
- `sample/renderer-comparison.html`의 `FRAG` 셰이더 원본을 `renderers/meta.ts`로 **수치 그대로** 이식했다.
  rMul `1.04+0.20·sol-0.48·gas` · threshold 1.0 · soft `mix(.30,.09,sol)` · 조명 `(-0.5,-0.65,0.58)` ·
  specular `26+42·sol` · ice grain `vnoise(ps*7)`+glint`^14` · 볼 상한 48 · WebGL DPR 캡 1.75.
- 물리는 `engine/matterSim.ts`(sol=1-smooth(-2,3,T), gas=smooth(96,104,T)) — 렌더러는 parts만 읽는다.
- 조립은 `ui/matterStage.ts`: 물질 뷰(메타볼) ↔ **입자의 눈**(dot) 크로스페이드 토글, WebGL 실패·유실 시
  자동 입자 뷰 폴백, 그릇 벽은 2D 오버레이 캔버스, 스텝 이탈 시 `dispose()`가 컨텍스트를 반납한다.
- IV 단원 콘텐츠 주의: 이 교과서는 **녹는점·어는점·끓는점 용어를 도입하지 않는다** — "온도가 일정하게
  유지된다"로만 서술하고, 승화는 양방향(고↔기) 모두 같은 이름을 쓴다.

## 중2 과학 V 식물과 에너지 제작 관례
- `g2u5`는 6레슨이며 L1~L3 무료, L4~L6 프리미엄이다. 훅은 `hookPlant.ts`의 potmass·waterweed·
  windowplant·bedroomplant·germinating·fruitthinning 6종을 쓴다.
- 전용 랩 6종은 leafFactoryLab(`plantFactoryLab.ts`)·photoEvidenceLab(`plantEvidenceLab.ts`)·
  photoFactorLab(`plantFactorLab.ts`)·plantRespireLab/dayNightLab(`plantRespirationLab.ts`)·
  sugarJourneyLab(`sugarJourneyLab.ts`)이다.
- `ui/plantKit.ts`는 식물 색·에셋 경로·잎/엽록체/기공/물질 토큰의 단일 진실 공급원이고,
  `ui/plantFigures.ts`는 문제·recap용 과학 도해를 맡는다. `public/plant/{figs,cuts}`의 저용량 WebP와
  코드 벡터를 결합하되, 정확한 구조·화살표·글자는 벡터/HTML로 얹는다.
- 광합성 잎 실험은 먼저 암처리해 기존 녹말을 소모시키며, 아이오딘 반응은 포도당이 아니라 **녹말**을
  확인한다. 식물 호흡은 낮과 밤 모두 계속되고, 체관의 설탕은 필요한 기관을 향해 위·아래로 이동한다.
  온도는 높을수록 무조건 유리한 것이 아니라 알맞은 범위 뒤 광합성량이 감소한다.
- QA는 DEV 서버에서 `PORT=<포트> node qa/e2e-g2u5.mjs`로 6레슨의 훅·랩·문제를 실플레이한다.
