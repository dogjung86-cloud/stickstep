# CLAUDE.md — 중학 학습 앱(과학·수학)의 헌법

이 문서는 모든 세션이 따라야 하는 규칙이다. 새 단원·인터랙션을 얹기 전에 반드시 읽는다.
목표: Brilliant처럼 개념 인터랙션과 퀴즈를 교차한 레슨, 토스 수준의 터치감, Duolingo식 지속 학습.
**트랙·시험 헌법은 분권**(2026-07-21 — 이 파일이 비대해져 분리, 충돌하면 CLAUDE.md가 이긴다):
과학 단원 작업 = **SCI_GUIDE.md** · 수학 = **MATH_GUIDE.md** · 사회 = **SOC_GUIDE.md** ·
역사 = **HIS_GUIDE.md** · 단원 종합 평가(시험) = **EXAM_GUIDE.md**를 반드시 함께 읽는다.
본문의 해당 섹션은 최소 요약+포인터만 남았다 — 요약만 보고 트랙·시험 작업에 착수하면 실격.
새 관행 기록도 해당 헌법에(전 과목 공통 문법만 이 파일에).

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
- **모션 격상 4종(2026-07-12 사용자 확정 — 에밀 코왈스키 스킬 검토에서 채택, base.css)**:
  ① 피드백 시트 비대칭 — 열기 `.42s var(--spring)` / 닫기 `.22s var(--ease-out)`(닫힘은 응답이라 빠르게)
  ② 퀴즈 보기 48ms 계단 등장 — `optIn` 키프레임(backwards 필 필수, forwards는 프레스를 죽임) + quiz.ts가 `--oi` 주입
  ③ 슬라이더 러버밴딩 — `core/rubber.ts` 헬퍼가 경계 초과량→`--rb`(px) 주입, 릴리스 스냅백 `.28s var(--spring-soft)`.
    파일럿 heatParticles·matterTemp — 새 슬라이더 랩도 같은 3줄(over 계산·--rb 주입·endDrag 리셋)로 적용 권장
  ④ reduced-motion = "전부 끄기"가 아니라 이동 제거 + 200ms 페이드 유지(screen·sheet·scrim·snack·toast).
  ⑤(원복 기록) ctaPop 젤리 스쿼시&스트레치는 같은 날 시도 → **원복**: CTA는 스텝마다 발동하는 고빈도라
    실사용에서 멀미 유발(사용자 판정 — 에밀 빈도 규칙의 실증). 바운스 강화는 저빈도 축하 순간 외 금지.
- 햅틱(core/haptics.ts): 탭 8, 정답 `[12,60,16]`, 오답 24, 완료 `[12,80,12,80,20]`.
  **내비 탭 navTap 15 · 잠긴 지도 노드 deny 30**(2026-07-21 사용자 피드백 — 8ms는 실기기 모터
  체감 문턱 아래라 "진동 없음"으로 느껴짐. 탭바(gnav)·지도 발바닥·시험 노드만 사용, 그 외 탭 8 불변).
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
  탭하면 `screens/paywall.ts` 전면 페이월.
- **페이월 v3(2026-07-15, 사용자 목업 확정 — "결제 구조가 곧 신뢰")**: 히어로 = 깃발을 향해 왼쪽→오른쪽
  지그재그로 걷는 발자국 마크(홈 트레일 #bsfp 패스 재사용, 도장 스태거+깃발 팝 연출) + "한 번 결제로,
  모든 단원을 평생" + 신뢰 칩(평생 소장·자동결제 없음·이용 전 7일 환불) → 혜택 2+2 → 과목 다중 선택
  (**개수 제한 없음**, 최소 1 — 구 MAX_PLAN 3 폐기) → 영수증형 가격 카드 → 파랑 CTA(.btn.cta).
  **판매 카탈로그(SELLABLE_SUBJECTS)는 중1·중2 과학/수학 4종만** — 중1 사회·역사는 콘텐츠가 있어도
  일단 제외(2026-07-20 사용자 지시, 추후 재추가). 가격 카드 포함 문구는 "새로운 콘텐츠가 추가되어도
  모두 무료"(2026-07-20 — 구 "새 단원이 나오면 무료" 교체).
  색 역할: 파랑 = 행동/신뢰, 골드 = 브랜드 포인트. 전용 시트 styles/paywall.css(pwx- 네임스페이스 —
  .pwx-sub는 과목 버튼이 선점, 히어로 소개문은 .pwx-lead). **e2e 계약: .pw-title 텍스트에 "프리미엄"
  포함**(qa/e2e-exam-*.mjs 14종 — v3에선 아이브로 "스틱스텝 프리미엄"이 이 클래스를 진다).
  눈검수 샷: `PORT=<포트> node qa/shot-paywall-v3.mjs`.
- **가격(2026-07-15 확정)**: `core/purchase.ts` `priceOf(n)`이 단일 진실 공급원 — 1/2/3과목 =
  14,900/24,900/33,900원(PLAN_TIERS), **4과목째부터는 과목당 11,300원(= 33,900÷3) 고정** ×n
  (할인은 3과목에서 끝, 예: 4과목 45,200원). saveOf = 낱개(14,900×n) 대비 절약액.
- **환불 정책(2026-07-15 확정 — 전자상거래법 17조 검토)**: "결제 후 7일 이내, **이용을 시작하지 않은
  과목만** 전액 환불". 디지털콘텐츠는 제공 개시 시 청약철회 제한 가능(사전 고지 필요) + 가분적 콘텐츠는
  미개시분만 철회 가능 조항이 근거 — 과목 단위가 곧 가분 단위다. 무료 레슨이 '시험 사용 상품' 요건을
  채운다. **"7일 무조건 환불"로 되돌리지 말 것**(7일간 다 풀고 환불하는 악용 경로 — 사용자 우려로 폐기).
  결제 오픈 시 이용약관에 같은 문구를 명문화할 것.
- **미성년자 취소권(민법 5조 — 청약철회와 별개, 약관으로 배제 불가)**: 만 19세 미만이 법정대리인 동의
  없이 결제하면 본인·보호자가 취소 가능(추인 가능일로부터 최장 3년) — "이용 개시 후 환불 불가" 조항보다
  상위라 **미성년자 취소 요청은 이용 여부와 무관하게 환불 대응이 원칙**. 예외 = 동의 있음·용돈 범위
  (민법 6조)·사술(민법 17조 — 단순 성인 체크는 사술 아님, 판례 엄격). 페이월 화면 문구는 간결판
  "미성년자는 반드시 보호자의 동의를 얻어 결제해 주세요"(사용자 확정 2026-07-15 — 가격 표기도
  "VAT 포함 가격"). **전상법 13조 2항 의무 고지 원문("법정대리인이 동의하지 않으면 본인 또는
  법정대리인이 취소할 수 있다")은 결제 오픈 시 토스PG 결제 단계·이용약관에 반드시 명문화**(계약
  체결 시점 고지가 법 요건 — 마케팅 화면 간결판이 이를 대체하지 않는다). 결제 오픈 시
  **보호자 동의 체크+기록 단계**도 설계할 것(동의 입증이 유일한 실질 방어 — 타깃이 중학생이라 필수).
- **결제**: `core/purchase.ts`가 단일 창구(가격·카탈로그 포함). 현재 스텁 — **DEV에서만 즉시 해금**(QA용),
  프로덕션 웹은 "출시 후 결제" 안내. Capacitor 포장 시 이 파일만 IAP(cordova-plugin-purchase/RevenueCat)로
  교체하면 UI는 그대로 동작한다. 구매 성공 경로: 스토어 결제 → 영수증 검증 → `setPremium(true)`.
- **[백로그 — 부모님께 요청하기(2026-07-21 사용자 확정, 토스PG 결제 오픈과 세트)]**: 페이월 CTA 아래
  보조 버튼 → 시스템 공유(Web Share)/링크 복사 → **부모용 페이지**(아이 학습 리포트 요약 + 가격 +
  자동결제 없음·환불 문구 + 결제 버튼). 결제 결정자(부모)와 사용자(학생)의 간극을 잇는 핵심 전환
  장치이자 **보호자 동의 체크+기록 요건(위 미성년자 취소권 항목)의 증적 경로를 겸한다**.
  결제가 스텁인 동안은 착수 금지(요청 링크의 종착지가 없다).
- **중2 과학 콘텐츠 규칙·지권 에셋 발주·컷 표현 관례(setPointerCapture·가로 2D 랩·earthCut3d 수학
  포함)는 SCI_GUIDE.md로 분리**(2026-07-21) — 중2 과학 단원 작업 전 필독.
## 단원 종합 평가 (시험 시스템) — 정본은 EXAM_GUIDE.md
- **시험 풀 저작·수정·검수·시험 그림 작업 전 반드시 EXAM_GUIDE.md(시험 헌법)를 읽는다** —
  규격(u3 파일럿)+단원별 관행·사고 기록 전문이 그쪽으로 분리됐다(2026-07-21, 원문 그대로).
  아래는 전 세션 공통으로 알아야 할 최소 요약뿐이다.
- 구조: 풀은 content/exams/(types·index·<unit>·<unit>lN — **문항은 레슨 파일에 넣지 않는다**),
  화면 screens/exam.ts, 그림 ui/examFigures.ts(과학)·ui/examFiguresMath.ts(수학 — 과학 파일 추가 금지).
  새 단원 시험 = 풀 저작 → 조립 → index.ts 등록이 전부(지도 노드·라우팅·취약 드릴 자동).
- 규칙 핵심: 시험 노드는 항상 열림 · 시험 중 정오·해설 노출 금지(일괄 채점) · 단원당 1회 무료,
  재응시 프리미엄 · 신기록 갱신분만 XP · 유형 mcq/multi/num/word(단순 OX 없음) · 해설은 문제집
  최상급(오답 선지 격파 포함, 250자+).
- 저작 가드 핵심: 그림 aria 정답 유출 금지 · 문항 자기완결 · 레슨 문구/보기 verbatim 재사용 금지 ·
  shuffle:false 첫 보기 정답 금지 · word↔mcq 정의문 유출 스캔 · 시험지 내 교차 유출 스캔 ·
  검산 감사(재풀이) 필수. QA 3종 = check-exam-*.mjs + e2e-exam-*.mjs(47검증) + shot-exam-figs-*.mjs.

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
- **중2 수학 Ⅲ(m2u3, 일차함수) 완성** — 10레슨(무료 3+프리미엄 7), 테마 `func`(틸 그린 #0CA678).
  신규: content/math/g2/unit3.ts·steps/hookM2u3.ts(10장면)+랩 8종(funcLab·shiftGraphLab·
  interceptLab·slopeLab 기함·lineFamilyLab·lineBuildLab·lineRevealLab·meetLab — 직선 조작은
  원점 픽셀 기준 translateY+rotate 공용 문법)·mathFigures2에 lineFig(planeSpec 기반 Ⅲ 직선 그림
  공용: lines/dots/계단 세모/x=m 세로선)+미니아트 9종. '기울기'는 이 단원이 정식 도입(중1 Ⅲ 금지
  해금), lineRevealLab이 Ⅱ crossLab의 "점들이 한 줄로" 예고를 회수한다. 컷 u3lN은 2/10 확보
  (u3l1·u3l5 검수 완료) — 잔여 8컷은 다른 세션 codex 발주 종료 후 `bash qa/order-m2u3cuts-rest.sh`
  (병렬 codex 금지 규칙 준수로 보류). **codex 0.144+는 이미지를 공용 tmp/가 아니라 exec별
  `~/.codex/generated_images/<uuid>/`에 생성 후 복사**(구버전 tmp/ 충돌 사고의 원인 구조가 바뀜 —
  그래도 검증 전까지 동시 발주는 계속 금지). 상세는 MATH_GUIDE.md 중2 Ⅲ 표.
  QA: `PORT=<포트> node qa/e2e-m2u3.mjs`.
- **중2 수학 Ⅳ(m2u4, 삼각형과 사각형의 성질) 완성** — 10레슨(무료 3+프리미엄 7), 테마 `prove`
  (블루프린트 코발트 #1971C2 — "설계도 위의 증명" 서사, data 네이비와 계열 구분). 단원의 심장은
  **증명의 첫 도입**: isoFoldLab(기함)이 "접기 관찰 3종 → 무한 검증 불가 판정 → SAS 증명 조립(순환
  논법 함정 카드) → 모양이 바뀌어도 결론 유지 피날레"를 체험시킨다. 신규: content/math/g2/unit4.ts·
  steps/hookM2u4.ts(10장면)+랩 10종(isoFoldLab 기함·isoBuildLab·rhCongLab·circumLab 기함·
  inCircleLab·paraSpinLab 기함·paraCondLab·diagRigLab·quadFamilyLab·areaSlideLab)·mathFigures2에
  Ⅳ 그림 15종+proveMiniArt 15키. **SVG 그룹 회전·반전은 transform-box: view-box 명시**(접기
  scaleX(-1)·180° 회전 드래그 — 시계 바늘 사고의 SVG 그룹판 예방), 회전 드래그는 CSS(시계+)와
  수학 각(반시계+)의 부호 반전 주의. mathDrill에 **장문 자동 강등**(q 26자 초과 → .mdr-q.long 18px)
  공용 개선. 컷 u4lN 10장 발주·눈검수·webp 변환 완료(qa/order-m2u4cuts.sh, u4l10만 저울대 수평 1회 재발주).
  **실사용 피드백 10건 반영(2026-07-19)**: ① 랩·훅 SVG 안내 텍스트는 12px 이상(9~10px 실격 —
  rhCong·inCircle·areaSlide·fairspot 소급), 겹침 위험 라벨은 흰 할로(stroke #fff+paint-order:stroke —
  isoFold 포개짐·inCircle 이등분선·areaSlide 높이), 변 곁 길이 라벨은 변 방향 회전(가로쓰기 고정은
  비스듬한 변을 가로지름) ② 종이 띠 접기 그림은 계산 기하로만: 접는 각 th → 접힌 변 방향 2·th,
  겹침 삼각형 = 접는 선 양 끝 두 각이 th인 이등변(눈대중 호·직각삼각형 겹침은 실격 — foldstrip 훅·
  foldIsoFig·mExamFoldFig(-(180-fold) 시작각 버그, m1u4 공용) 3곳 재작도) ③ isoFoldLab 증명 조립은
  자동 진행 금지, 걸음 버튼 3개(도장→대응각→모양 시험)로 유저가 확인하며 전진 + 피날레는 도장
  배지를 먼저 걷어내고(삼각형을 가림) 꼭지각 52→32→84→52 setTimeout 보간 모프(하드 컷 3연타는
  "마지막 모양만 보임" 실사용 피드백 — 트윈은 chopstick 문법) ④ 훅 접이식 소품은
  "접힌 상태에서 시작해 펴진다"(phonestand 64°→38° 역방향 실사고) ⑤ rhaRhsFig·quadTreeFig·
  m2ExamFamilyFig는 라벨 배지·필 폭 계산·겹침 해소판이 정본. 눈검수 `qa/shot-m2u4-fixfeedback.mjs`.
  상세는 MATH_GUIDE.md 중2 Ⅳ 표. QA: `PORT=<포트> node qa/e2e-m2u4.mjs`.
- **중2 수학 Ⅴ(m2u5, 도형의 닮음과 피타고라스 정리) 완성** — 11레슨(무료 3+프리미엄 8), 테마 `sim`
  (마트료시카 라즈베리 #C2255C — 중2 수학 내 유일한 붉은 계열, 오답 red보다 깊은 자줏빛).
  신규: content/math/g2/unit5.ts·steps/hookM2u5.ts(11장면)+랩 11종(zoomLab·simHuntLab·scaleTileLab·
  shapeLockLab·peelLab·triSliceLab·midpointLab·lineDivLab·**centroidLab 기함**(감 드래그 좌절→중선→
  2:1)·**pythaLab 기함**(모눈 세기→4삼각형 옮겨 담기 증명→a·b 일반화)·rightCheckLab)·mathFigures2에
  Ⅴ 그림 23종+simMiniArt 22키. **√ 금지(중3)라 피타고라스 수치는 전부 자연수 트리플 풀**(3·4·5 계열),
  "제곱해서 N이 되는 양수는 □" 서술이 표준. pythaLab 퍼즐 이동은 바깥 g CSS translate+안쪽 g SVG
  rotate 합성(배치 전환에도 회전값 불변 = 순수 슬라이드) — SVG 퍼즐 이동의 공용 문법. 훅 traytrick만
  swapbtn이 아니라 `.tt5-spot` 3곳 탭(e2e 주의). 컷 u5lN 11장(qa/order-m2u5cuts.sh — 발주는 병렬
  codex 금지 확인 후). **실사용 피드백 4건 반영(2026-07-20)**: ① 중2 midpointLab 접두사는 `.mdp-`
  (초판 .mpl-이 중1 시트 math.css의 랩과 충돌 — absolute .mpl-read+::before "거리"를 물려받아 거리
  필이 무대 위에 떠 꼭짓점을 덮은 실사고. **새 랩 접두사는 math.css·math2.css 양쪽 grep 선점 검사
  의무** — 테마명 규칙의 클래스판) ② shapeLock 길이 카드는 "1:2"가 아니라 "2배"(원본 대비가 표기
  자체로 읽히게, 그림 마크 ×2 흰 할로, 비 1:2 다리는 CA 해금 대사에서) ③ pythaLab 퍼즐은 회전 0인
  i=0 삼각형에 a·b·c 변 라벨(스테퍼와 도형 연결) ④ rightCheckLab **양팔 저울 폐기** → 이름 붙은 값
  카드 2장+= / ≠ 비교 기호 패널(저울은 교과서 장치가 아닌 창작 은유 + 조작 없는 표시 전용이라 인지
  부담만 — "조작 없는 은유는 장식" 판정). m2u5 랩 SVG 텍스트 12px 미만 전량 소급(m2u4 규칙 확장),
  눈검수 `qa/shot-m2u5-fixfeedback.mjs`. 상세는 MATH_GUIDE.md 중2 Ⅴ 표.
  QA: `PORT=<포트> node qa/e2e-m2u5.mjs`.
- **중2 수학 Ⅵ(m2u6, 확률) 완성** — 9레슨(무료 3+프리미엄 6), 테마 `dice`(주사위 레드 #C92A2A —
  오답 레드 #F04452보다 어두운 크림슨. Ⅴ sim 라즈베리와 같은 지도에 인접하지만 핑크vs레드로
  구분된다고 사용자 확정(2026-07-10 통합 시) — 색 교정 시도 금지). 신규: content/math/g2/unit6.ts·steps/hookM2u6.ts(9장면)+
  랩 8종(caseLab·orLab·treeLab 기함·tossLab 기함·probBarLab·notLab·probAddLab·probMulLab —
  전부 탭/버튼 구동, 드래그 없음)·mathFigures2에 Ⅵ 그림 11종(pairGridFig 6×6 순서쌍 표는 pick
  콜백형)+probMiniArt 15키·icons에 dice·coin 추가. 어려운 단원 서사형(Ⅵ 통계 계승): 랩은 국면 3개
  한 통찰, 판정은 mq6-q 문법 재사용. **언어 가드: '여사건'·'시행'·'수형도' 금지**(원 교재 본문
  미도입 — "일어나지 않을 확률"·"실험이나 관찰"·"나뭇가지 그림"으로), 합은 "동시에 일어나지 않을
  때"·곱은 "서로 영향을 끼치지 않을 때"로 서술 통일. tossLab의 Math.random은 목표 판정을 던진
  횟수 기준으로 설계해 e2e 안전(값 무관). 컷 u6lN 9장(qa/order-m2u6cuts.sh). 상세는 MATH_GUIDE.md
  중2 Ⅵ 표. QA: `PORT=<포트> node qa/e2e-m2u6.mjs`.
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
  **styles/math.css**(ui.css를 건드리지 않는 수학 전용
  시트, main.ts에서 import). 공유 파일 수정은 store·curriculum·home·subject·main·registry·tokens.css·
  mapDecor의 최소 append뿐.
- **Ⅲ 좌표평면·그래프 관행**: 좌표평면 배경은 mathKit `planeSpec()`이 단일 진실 공급원(랩 4종과
  mathFigures 좌표 그림 공용, 축 화살표는 양의 끝에만·원점 O). 격자 조작은 최근접 격자점 스냅
  (판정은 pointerup에서), 발견 랩엔 반례 국면(저금통·남은 사탕)으로 "증가=정비례/감소=반비례" 오개념을
  랩 안에서 깬다. **'기울기'는 중2 용어라 금지**, "가파름/y축에 가까워진다"로. 상세는 MATH_GUIDE.md Ⅲ 표.
  시험 좌표쌍은 num으로 받지 않고, `mExamPlaneFig`·`mExamChangeGraphFig`·`mExamRelationPlaneFig`도
  점·축 범위·눈금·정답 판독값을 spec 한 곳에서 파생한다. 그림 QA는 축 라벨·좌표축 비접촉·두 갈래를 함께 검사한다.
- **"신기한 응용" 랩은 본선이 아니라 보너스 게임으로**(별그리기 사례, 사용자 확정): 개념의 최단 경로가
  아닌 화려한 응용(한붓 별 = 서로소)은 본선에서 혼란을 부른다 → 서로소는 vennFactor coprime 모드
  (판별소: 8·9 → 9·25 합성수끼리 → 14·21 함정 — 같은 벤 문법 재사용)로 가르친다. 별그리기는
  보너스 게임 "별자리 한붓그리기"(screens/starGame.ts)로 승격했다가 **2026-07-19 폐기**(사용자 확정 —
  starGame.ts 삭제, 도전 탭은 네온 한붓그리기가 한붓 문법을 담당). "응용은 본선 밖" 원칙 자체는 유효.
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
- **첫 사용 플로우**: 스플래시 → 과목 허브(screens/subject.ts, mode "onboard" — gnav 없음) →
  학년·목표 온보딩 → 홈. **과목 허브 재진입은 하단 과목 탭**(2026-07-20 — 구 앱바 과목 상자
  subj-box는 폐기, CSS·코드 제거됨). 우상단 프로필
  버튼은 제거(2026-07-16 프로필 진입 단일화) — 로그인·아바타 노출은 탭바 마이 아이콘(gnav)이 담당하고,
  로그인 화면 진입은 마이 > "계정 관리 · 로그인"이 유일 경로다.
- **로그인 정책(결정)**: 로그인을 강요하지 않는다 — 학습·구매 모두 무로그인 가능, 기록은 기기 저장.
  로그인 화면은 진입 장치만(소셜 3종 스텁, 출시 시 OAuth+동기화 백엔드 연결). 강한 프롬프트를 붙인다면
  "첫 레슨 완료 직후"가 최적 시점(가치 먼저, Duolingo 방식) — 단원 진입을 로그인으로 막지 말 것.
  **비로그인 로그인 화면 구성(2026-07-21 사용자 확정)**: 히어로 = brand/study.webp "공부하자!" 스틱맨
  (스플래시 정착 컷과 동일, **파란 원 프레임 없이 흰 배경 그대로**(.login-study 156px), multiply
  블렌드 + 로드 실패 시 파란 원 벡터 폴백) + 구글·카카오 버튼만 — 오답노트 카드 제거(본론은 로그인
  CTA, 프리미엄 결제 버튼 추가안은 "전환은 욕구 순간 터치포인트" 원칙으로 보류), 안내 문구는
  "로그인 없이 일부 단원을 학습할 수 있어요 … 프리미엄 회원은 과목별 모든 콘텐츠"
  (구 "모든 학습" 문구 폐기 — 무료/프리미엄 구분을 정직하게). 로그인된 계정 관리 화면은 불변.
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
- **과목 허브 카드 스틱맨 4종(2026-07-21)**: public/brand/subj/{sci,math,soc,his}.webp — 과목 소품 든
  상반신(플라스크·컴퍼스 원호·지구본·두루마리, 손그림+teal 원포인트·글자 금지). subject.ts subjArt()가
  발주본 우선 + stickAvatar 폴백(lazy 금지). 재발주 = bash qa/order-subj.sh → node qa/process-subj.mjs
  (프롬프트 qa/subj_prompts.txt). 카드 문구 확정본(2026-07-21 사용자 선택)은 subject.ts가 정본.
- **파비콘 = 발자국 마크(사용자 확정 2026-07-16)**: 블루 그라데이션 라운드 사각 + 흰 발자국 2개
  지그재그(홈 트레일 도장 #bsfp 실루엣) + 입체 옆면(#175BC4 — 지도 스텝 노드 문법) + 키라이트.
  재생성 `node qa/make-favicon.mjs` → public/favicon.ico(16·32·48 PNG-in-ICO)+brand/favicon-{크기}.png,
  index.html 링크(180 apple-touch는 풀블리드 — iOS가 자체 마스크). 각 크기 벡터 직접 렌더(축소 금지).
  스틱맨이 아니라 마크인 이유: 16px에서 라인아트는 뭉갬 — 시안 5라운드 비교로 확정(단순 마크 승).
- 앱 아이콘 원본 = `public/brand/icon.png`(512, 파란 라운드 사각 + **study.webp "공부하자!" 머리띠 스틱맨**
  흰 라인아트 — 앱 상징, 사용자 확정 2026-07-10)은 **Capacitor 포장·스토어 아이콘용으로 보존**(파비콘
  링크에선 해제). 재생성: `node qa/make-icon.mjs`(study.webp 크롭→흰 반전→선 두께 보정→블루 그라데이션
  합성. 책상 모서리 선은 크롭으로 제외할 것).
- 브랜드 이미지 재발주: `bash qa/order-brand-u1l3.sh`(프롬프트 qa/brand_imagen_prompts.txt),
  발주 원본은 1254px → `node qa/resize-brand.mjs`(512 png) + webp 변환으로 경량화(프레임당 ~20KB).

## 게임 정복 지도 (screens/home.ts + ui/serpentine.ts)
홈은 리스트가 아니라 **모험 트레일**이다.
- **지도 헤더 = "정복 지도"**(2026-07-21, 구 "레슨 지도" plain 텍스트): `.map-head` — 단원 테마색
  (--mh-ink=themeInk) 발자국 칩 + 타이틀, 단원 전환마다 칩 색이 테마를 따른다. `.sec-head`는
  시험 결과·문제 뽑기 화면이 공유하므로 홈 전용 클래스로 분리(전역 재스타일 금지).
- **홈 초기 단원 = 최근에 연 단원**(2026-07-21 사용자 확정): store.lastUnits("<과목>:<학년>"→unitId,
  기기 저장·동기화 제외) — main.ts openLesson/openExam(rememberUnit)이 기록. 부트·학년 전환의 sel
  우선순위 = 방금 학습한 단원 → 기억 → 첫 미완료 → 첫 단원. 단원 탭 구경만으로는 기록되지 않는다
  (레슨·시험을 실제로 연 순간이 "진행"의 기준).
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
- **랩 지시(helper)는 조작 요소 위(전 과목·전 단원 공통, 2026-07-10 롤아웃 완료)**: 배치 = 목표 칩 →
  helper(지시) → 보드/무대 → 조작부. "~해 보세요"가 보드 아래 깔리면 유저가 뭘 할지 모른다(수학 Ⅲ 실사용
  피드백 — 훅 "질문은 선택지 위에" 규칙의 랩판). 조작부(버튼·스테퍼·슬라이더)는 무대 아래 유지(연타하는
  손의 호가 무대를 가리므로). 새 박스·"미션" 태그 금지 — helper가 지시↔해설을 오가므로 기존 helper를 이동만.
  `.pn-badges + .helper`가 base.css의 왼쪽 3px 가이드 바를 받는다(중립 `--n400` 기본, 단원 톤은
  `--helper-bar` 변수로 덮기, min-height 예약 해제). **판정 질문·새 조작 버튼이 랩 중간에 등장하는 지점은
  `later(() => X.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80)` 보정**(Ⅲ 문법 — 훅은
  hookAsk.ask() 공용이 이미 처리). 예외: 훅 장면(scene→helper 순서 유지), pairMatch(연습 스텝 —
  helper가 즉답 리드아웃이라 보드 아래 유지), rotateStage 오버레이 내부(스크롤 개념 없음).
- 랩의 "교과서 밖 궁금증"은 `ui/curio.ts`의 curioCard(질문 헤드 탭 → 답 펼침, bulb + 앰버 톤)로 —
  content에서 `curio: { q, a }`를 넘기면 랩 렌더러가 랩 맨 아래(보드·조작부 뒤)에 붙인다. 현재: u3 전도(이불)·복사(산꼭대기),
  u4 phaseNames(하얀 김), u5 gravityDrop(우주 정거장), u7 sunLab(흑점 역설), 중2III diffuseLab(하얀 종이)·
  refractLab(신기루)·mirrorImageLab(구급차 거울문자)·colorMixLab(물감 혼합)·waveLab(우주 폭발음)·
  soundLab(헬륨 목소리), 중2IV elementLab(수소도 쪼갤까)·moleculeLab(산소vs오존)·atomLab(전자는 왜 안 빨려드나)·
  periodicLab(수소는 왜 예외)·ionLab(나트륨 원자vs이온)·ionMoveLab(안 보이는 이온을 어떻게). 오개념 교정형 질문이 기준.
- **recap 카드는 전 카드에 미니아트**(사용자 확정 2026-07-10) — 대표 카드만 아트·보조 카드는 색 점(rc-dot)이던
  관행 폐기. 전 트랙 롤아웃 완료(과학 중1·중2 + 수학 중1 Ⅰ~Ⅵ·중2 Ⅰ~Ⅲ, 404장 전수). 새 recap 저작 시
  카드마다 해당 단원 figures 파일의 미니아트 함수에 키를 만들어 `art:`를 채운다 — 문법은 파일별 관례 그대로
  (mathMiniArt 84×84 플랫 / geoMiniArt·solidMiniArt·statMiniArt 64×64 geoKit 프리미티브 재사용 /
  calcMiniArt 72×72 mi-* 그라데이션+접촉 그림자 / 과학 *Figures 64×64 플랫). rc-dot 폴백은 코드에 남아 있지만
  신규 콘텐츠에서 쓰면 실격. 글리프는 카드의 한 문장 핵심을 도상 하나로(텍스트 최소, 원호 스윕은 bbox로 검증).
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
  경로: `public/comics/<lesson>/<n>.webp`, 렌더러가 `import.meta.env.BASE_URL` 접두.
- 컷 전환은 rAF 아닌 reflow 기반(헤드리스에서도 항상 보이게). 스틱맨 캐릭터는 `stickman()`/`stickmanHead()`.

## 만화 컷 이미지 발주 (codex auth → ChatGPT 이미지 생성)
- **[백로그 — 만화 프레임 원비율 추종(2026-07-20 사용자 확정, 미착수)]**: 현재 comic 스텝 프레임은
  `.comic-art` aspect-ratio 1/1 + `.comic-img` cover라 4:3 발주분이 좌우 12.5%씩 잘린다. 실측(전
  171컷): 4:3=108장(역사 13편+사회 장영실+u1l3·u7l3) / 1:1=63장(과학 초기 9편), **폴더별 비율 균일**
  (한 만화 = 한 비율이라 컷 전환 높이 점프 없음). 확정 방향 = **프레임 고정 폐기, 이미지 원비율
  추종(로드 전 기본 예약 4:3)** — 4:3 무크롭 + 1:1 구작 재발주 0. 딸린 작업: 역사·사회 만화
  **panels[].bubbles의 x좌표 역변환 x_new = x_old×0.75+12.5**(y 불변 — 크롭 보정 공식의 역),
  cut() 개념 컷 말풍선은 무관(이미 원비율), 눈검수는 shot-his1/2/3/4-bubbles + shot-soc7-bubbles
  재실행. 완료 시 이 항목과 HIS_GUIDE.md의 "1:1 크롭 보정" 문구를 갱신할 것.
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
- **발주 후 반드시 `node qa/process-comics.mjs`로 webp 변환**(비율 유지 960·q0.9, 원본 png 삭제) —
  발주 원본(컷당 0.8~3MB)이 미변환으로 쌓여 comics만 98MB가 됐던 실사고의 재발 방지(2026-07 일괄 변환,
  97.5MB→4.8MB). 콘텐츠 `img` 경로는 `.webp`로 저작한다(avatar/는 스플래시 폴백 png 유지 — 변환 제외).

## 과학 트랙(단원별 랩 관례) — 정본은 SCI_GUIDE.md
- **과학 단원 콘텐츠·랩 작업 전 반드시 SCI_GUIDE.md(과학 헌법)를 읽는다** — 3D 우주(three.js)·
  메타볼 렌더러(IV)·중2 III(빛과 파동)·IV(물질의 구성)·V(식물)·VI(동물)·VII(전기와 자기)·
  VIII(별과 우주) 단원별 랩 규칙 + 중2 콘텐츠·지권 에셋 관례가 그쪽으로 분리됐다(2026-07-21,
  원문 그대로). 과학의 공통 문법(레슨 공식·훅·아트·만화·퀴즈)은 전 과목 표준이라 이 파일에 남는다.
- 배선 요약: 중1 u1~u7 + 중2 g2u1~g2u8 완성. 단원 공용 킷(thermo·matterStage·gasKit·space3d·
  chemKit·lightKit·elecKit·bodyKit·plantKit 등 — 위 아키텍처 트리)이 각 표현의 단일 진실 공급원 —
  입자·천체·광선·회로 표현은 반드시 해당 킷을 쓴다(재구현 금지).

## 사회 트랙 — 정본은 SOC_GUIDE.md
- **사회(soc) 트랙 작업 전 반드시 SOC_GUIDE.md(사회 헌법)를 읽는다** — Ⅰ~Ⅶ 제작 관례·대륙 공통
  문법·일반사회 문법·중립 가드 전문이 그쪽으로 분리됐다(2026-07-21, 원문 그대로). 최소 요약:
- 배선: SubjectId "soc", 단원 s1uN(레슨 s1uNlM), content/soc/, 테마 world(트래블 오렌지 #E8590C),
  styles/soc.css. 지리 Ⅰ~Ⅵ + 일반사회 Ⅶ 완성, 남은 백로그 = Ⅷ~Ⅻ(judgeKit def 추가 중심)·단원 평가.
- 문법 핵심: 세계지도·대륙은 실데이터만(Natural Earth+쾨펜 — 손그리기 금지), 대륙 단원 =
  ContinentDef 추가가 전부(regionPlaceLab 공통), 일반사회 = ui/judgeKit.ts 데이터 단일 진실
  공급원(judgeLab·dilemmaLab). 좌표는 전부 계산 배치(눈대중 0 — audit-*-geo.mjs 검산).

## 역사 트랙 — 정본은 HIS_GUIDE.md
- **역사(his) 트랙 작업 전 반드시 HIS_GUIDE.md(역사 헌법)를 읽는다** — Ⅰ~Ⅳ 제작 관례·만화 코믹
  표준·유물 실사 소스 구도·존중 가드 전문이 그쪽으로 분리됐다(2026-07-21, 원문 그대로). 최소 요약:
- 배선: SubjectId "his", 단원 h1uN(역사①)/h2uN(역사②), content/his/, 테마 his(청동 녹청 #0E7C8A),
  styles/his.css. Ⅰ~Ⅳ 완성(h1u1~h1u4).
- 문법 핵심: **만화(comic)가 척추**(말풍선 하이브리드 — 발주 컷에 글자 금지, 앱이 한글 풍선을 얹음),
  연표 timelineLab(TimelineDef)·세기 드릴(mathDrill 재사용), 지도류 그림은 실데이터(WORLD_LAND_PATH).
- 가드 핵심: 종교 존중(창시자·신앙 대상 그림 전면 금지)·정복·수탈 존중(CONQUEST RULE — 전투·유혈
  묘사 금지)·사관 문제 정오 부여 금지. 유물 실사 = 국박 공공누리 1유형·Met CC0·위키 CC0/PD만.

## 로그인·동기화 (Supabase — 2026-07 구축)
- **core/auth.ts**(OAuth·세션)와 **core/sync.ts**(진행도 병합·푸시)가 전부. **환경변수
  (VITE_SUPABASE_URL·VITE_SUPABASE_ANON_KEY, .env.local)가 없으면 전원 no-op** — dev·e2e·기존
  배포는 백엔드 없이 그대로 동작한다(스텁 모드: 로그인 버튼이 안내 스낵만). supabase-js는 three와
  같은 규칙으로 **동적 import**(vite optimizeDeps에 등록) — 로그인 안 한 기기는 번들을 아예 받지 않는다.
- 스키마·설정 절차: `supabase/schema.sql` + `SUPABASE_SETUP.md`(서울 리전, 구글·카카오 프로바이더).
  **네이버는 Supabase 미지원**이라 준비 중 스낵 유지. 서버 컬럼명은 `total_stick`(XP→'스틱' 개명 선반영).
- **병합 원칙 "학습은 잃지 않는다"**(sync.ts가 소유): lessons/exams/minigame은 항목별 max·OR,
  스틱(totalXp)은 큰 쪽, 스트릭은 lastStudyDay가 최근인 쪽(같은 날이면 큰 쪽). 로그인 직후
  pull→병합→push, 이후 save마다 2.5초 디바운스 push + pagehide 최선 노력 push.
  **reviewMode·viewGrade·viewSubject는 기기 설정이라 동기화 금지.**
- store.ts에는 `setOnStateSaved` 훅 + `applySyncedState`만 추가(의존 방향 sync→store 단방향).
  로그아웃해도 기기의 학습 기록은 지우지 않는다(무로그인 정책과 동일한 결).
  **로그아웃은 로컬 토큰 정리까지 보증**(2026-07-21 실사용 보고): supabase signOut은 서버 호출이
  실패하면 로컬 세션을 안 지우고 에러만 "반환"(throw 아님 — catch에 안 걸림) → 남은 토큰을 다음
  부팅·pickup()이 집어 들어 "로그아웃했는데 다시 로그인"이 된다. auth.ts signOut이 에러 시
  scope:"local" 재시도 + sessionStorageKey 직접 removeItem(최종 보증)으로 막는다.
- 리더보드·랭킹은 후속 기능: 채점이 전부 클라이언트라 **서버 검증 설계 전에는 붙이지 않는다**
  (검토 모드 7연타가 공식 우회로인 것도 함께 해결할 것).
- **닉네임(2026-07-16)**: store.nickname(기기 저장, 공백 정리+12자 컷, null=기본 이름) — 마이 탭 이름 옆
  연필 → 닉네임 시트(로그인 상태 이름 = 닉네임 → 소셜 이름 → 스틱스텝 친구 순). 서버는 profiles.nickname
  (progress가 아님 — **rowOf에 넣으면 400**, avatarCustom과 같은 함정): 저장 시 auth.ts pushNickname,
  로그인 직후엔 sync.ts fullSync가 기기 값 우선으로 밀고 기기에 없으면 서버 값 채택. 리더보드 표시명도 이 값.
  **닉네임은 계정 기능(2026-07-21 사용자 확정)**: 비로그인은 연필 숨김(.mypf-nick-edit.hidden) +
  표시 항상 "게스트 스틱"(저장 별명은 지우지 않고 로그인하면 복원 — 로그아웃하면 이름이 게스트로
  돌아가 로그인 여부가 이름만으로 구분). 기본 이름은 "게스트 스틱" 유지("스틱맨"은 남성 코딩이라 기각,
  사용자 확정). **닉네임 중복 금지는 보류** — 표시 전용이라 무해, 리더보드 설계 때 "표시명+태그" 방식으로 재논의.
- **회원탈퇴(2026-07-12)**: auth.ts `deleteAccount()` → schema.sql의 `delete_user` RPC(security definer —
  anon 키는 auth.users를 못 지워서. auth.users 삭제가 profiles·progress로 cascade). UI는 로그인 화면
  하단 밑줄 "회원탈퇴" → 그 자리 경고 카드 2단 확인(styles/policy.css). 성공 시 로컬 세션만
  signOut(scope: local)로 정리하고 onAuthChange 재렌더에 맡긴다. **기기 학습 기록은 지우지 않는다**
  (무로그인 정책과 같은 결 — 탈퇴 문구에도 명시). 기존 Supabase 프로젝트는 함수 블록만 재실행(SETUP.md).
- **개인정보처리방침(2026-07-12)**: 원본은 **public/privacy.html 단 하나** — 구글 OAuth 동의 화면·카카오
  심사에 제출하는 단독 URL(`/privacy.html`) 겸용. 앱 안에서는 screens/policy.ts가 이 파일의 #policy-body를
  fetch해 렌더(문서 두 벌 금지 — 내용 수정은 privacy.html만). 진입 2곳: 마이 탭 "더 보기" 행 + 로그인
  화면 동의 고지("로그인하면 …에 동의" + 만 14세 미만 보호자 동의 안내 — 방침 6조와 세트). 조항에
  만 14세 미만(로그인 없이 전 기능 = 미수집이 1차 방어)·국외 이전(Supabase·Vercel, 법 28조의8 1항 3호
  공개 방식)·최소 수집(프로필 사진 미저장) 포함. 스타일은 styles/policy.css(공유 시트 오염 금지).

## IA·홈 구조 (2026-07-12 개편 — 사용자 확정)
- **진입**: **스플래시 = 랜딩**(별도 랜딩 화면 없음 — 사용자 확정). 플립북 정착 후 하단 버튼 3개
  (프라이머리 **"한번 둘러보기"**(무로그인)/로그인/학부모·선생님 준비 중 스낵)가 워드마크 리듬으로 샥 나타난다
  (splash.ts, `.splash-foot.done` 스태거 fadeUp). 둘러보기 → 과목 선택 → 온보딩 → 홈. 스플래시는 비온보딩
  첫 실행에만 뜨고, 재방문·e2e 시딩(onboarded=true)은 홈 직행 — 기존 e2e 플로우 불변.
- **하단 탭바 5개**(ui/gnav.ts, main.ts goTab이 nav.reset으로 전환): 학습(기존 홈)·**과목(2026-07-20
  신설, 사용자 확정 — subject.ts 허브의 탭 화면화(tabscr·#sc-subjects·gnav 장착), 런처형: 과목을
  고르면 pickSubject가 학습 탭으로 점프. 구 홈 앱바 subj-box 진입은 폐기 — 발견성 문제)**·
  복습(review.ts)·도전(challenge.ts — 랭킹 준비 중·미니게임 준비 중+프리미엄 크라운)·마이(my.ts —
  아바타 픽커·닉네임 바꾸기·장화 레벨·스텝 요약·계정/프리미엄/과제함 진입).
  **과목·복습·도전·마이 탭 상단엔 뒤로가기(.tab-back → 학습 탭 복귀, 2026-07-20)**.
  프리미엄을 여섯 번째 탭으로 넣는 안은 **기각**(2026-07-21 사용자 확정 — 탭바는 목적지 내비, 전환은
  지도 크라운·복습 잠금·재응시·게임 게이트 등 욕구 순간의 기존 터치포인트 몫. 재제안 금지). **비로그인 유저가 마이
  탭을 열면 로그인 화면을 위에 얹는다**(2026-07-20 사용자 확정 — 닫으면 마이. auth 스텁 모드(env 없음
  — dev·e2e)는 생략이라 e2e 무영향. **세션 토큰 흔적(hasStoredSession)이 있으면 생략**, 2026-07-21 —
  부팅 복원이 끝나는 순간 비로그인 화면이 로그인된 모습으로 뒤바뀌는 경합 혼란 차단). **브라우저/안드로이드 하드웨어 뒤로가기 = 앱 내 뒤로가기**
  (2026-07-20): main.ts가 가드 히스토리 상태 1개(pushState)를 유지, popstate → appBack(스택 pop →
  비홈 탭이면 goTab home → 루트면 무장 해제 = 다음 back이 사이트 이탈). nav.setOnChange(router.ts
  onChange 훅)가 무장·반납을 소유 — Capacitor WebView back도 같은 경로.
- **복습 탭 콘텐츠는 전면 프리미엄(2026-07-15 사용자 확정)**: 오답노트·취약 단원 문제 뽑기·질문하기(AI 튜터)
  셋 다 잠금 시 골드 크라운 필 표시(review.ts `locked`), 게이트·페이월은 main.ts의
  openNotebook/openWeakDrill/openTutor가 소유(잠금 → 전용 문구 페이월 → 구매 시 바로 진입).
  **오답 "수집"(recordWrongNote)은 무료 사용자도 계속** — 구매 순간 과거 오답이 이미 쌓여 있게. 잠긴 건 열람·다시 풀기.
  e2e-notebook.mjs 시드는 premium: true로 게이트를 통과한다.
- **homeScreen 시그니처 변경**: onOpenGame 파라미터 제거, nav2.onTab 추가. UNIT_GAME·지도 게임 노드 삭제 —
  미니게임은 도전 탭 소속으로 이사(사용자 확정: 재단장 전까지 '준비 중'으로 닫힘). **재오픈 시 프리미엄
  콘텐츠**(2026-07-15 사용자 확정 — 카드에 크라운 병기, 열 때 main.ts 게이트 필수). **단열 디펜스는 폐기**
  (2026-07-17 사용자 확정 — screens/minigame.ts 삭제, ui.css 전용 스타일 제거. .mg-title/.mg-best만 잔존).
  **미니게임 재오픈 완료(2026-07-18)**: 도전 탭 게임 4종 = 스텝 러시(간판)·코스모 머지·네온
  한붓그리기·레이저 미로 — 상세 규칙은 아래 "미니게임" 섹션. 별자리 한붓그리기는 재연결했다가
  **폐기(2026-07-19 사용자 확정 — starGame.ts 삭제)**. **도전 탭 게임 섹션 헤더는 "쉬는 시간"**
  (2026-07-19 사용자 확정 — '미니게임' 라벨 폐기, 탭 부제 "게임으로 쉬어 가는 곳"과 세트), 카드
  설명은 스텝 러시 문형("…하는 ~게임/퍼즐" 한 줄)으로 통일.
- **장화 레벨**: core/level.ts BOOT_TIERS 14단계(노랑 0 → 초록 300 → 파랑 1,000 → 빨강 2,500 → 무지개 5,000 →
  별노랑 8,500 → 별초록 13,000 → 별파랑 19,000 → 별빨강 26,000 → 별무지개 35,000 → 은 46,000 → 금 60,000 →
  다이아 78,000 → 은하 100,000) × ui/boots.ts SVG 글리프. **'흙장화' 금지**(위화감 리스크 — 사용자 확정).
  기준은 **store.lifeXp(누적 획득 스텝)** — spendXp로 줄지 않고, 레슨·시험·보상 적립 지점이 전부 함께 올린다.
  구버전 저장분은 load()가 totalXp를 하한으로 마이그레이션. 동기화 컬럼 life_step(max 병합)·avatar_id(local 우선).
- **아바타**: 소셜 프로필 사진 금지(auth.ts가 avatar_url·picture를 아예 안 읽음 — 미성년 개인정보).
  ui/avatar.ts **PROFILE 섹션**이 프로필 아바타(마이 탭·탭바 마이 아이콘)의 단일 진실 공급원 — 우선순위
  프리셋 → 커스텀 → 래스터 avatarId(구버전 저장) → **게스트 스틱 벡터**(미선택 기본 = 프리셋 '기본'과
  같은 캐릭터, 2026-07-16 — "기본을 고르면 처음 모습으로"가 성립). store.avatarId = 배열 인덱스:
  0..4 기존 선생님 발주본(하위 호환 — 순서 변경·삭제 금지), 5..16 **학생 캐릭터 12종**(public/avatars/*.webp,
  상반신 버스트 — 성별·헤어·안경·주근깨·장신구·표정 다양화. 발주 qa/order-avatars.sh + avatar2_prompts.txt,
  변환 node qa/process-avatars.mjs). 캐릭터 추가는 USER_FILES에 append만 — 픽커·앱바 자동 확장.
  선생님 연출(comic·hook·recap의 stickAvatar/AvatarKind)은 프로필과 별개 체계로 불변.
- **과제 배너**: 학급(코드) 소속 + 과제가 있을 때만 홈 상단에 렌더할 예정(후속 교사 기능) — 개별 유저에겐 안 뜬다.

## 데스크톱 셸 (옵트인 · ≥1024px — 2026-07-20 방향 확정 B, **레일까지 완성**)
- **옵트인(사용자 확정 2026-07-20 — 자동 반응형 폐기)**: 켠 사람에게만 적용, 기본은 넓은 화면에서도
  폰 프레임. store.desktopMode(기기 설정 — reviewMode처럼 동기화 제외) → **html.dt 클래스**(main.ts
  부트 부착), desktop.css 전 규칙이 html.dt + ≥1024px **이중 게이트**. 토글 UI = 마이 탭 "넓은 화면
  레이아웃" 행(≥1024px 뷰포트에서만 노출 — 폰에선 효력 없는 죽은 토글이라 숨김). 새 데스크톱 규칙은
  반드시 html.dt 게이트 아래에 쓴다(위젯 레일 포함). **토글 창구는 마이 탭이 유일**(2026-07-21 사용자
  확정 — 학습 메인 배치·1회성 발견 안내 스낵 모두 기각, 재제안 금지).
- **방향 = B 대시보드 3칼럼**(사용자 확정): 좌측 사이드바 + 중앙 콘텐츠 칼럼 + 홈 우측 위젯 레일.
  1단계(집중 칼럼형)는 구현 완료 — **styles/desktop.css 단일 시트 + main.ts import 한 줄**이 전부
  (기기 프레임 해제, gnav → 좌측 사이드바 224px, 홈·탭 중앙 칼럼 660, 레슨·시험 풀스크린은 집중 모드
  칼럼 760 + .stepWrap 660). 콘텐츠 코드 무수정, 모바일(<1024px)·e2e(420px 뷰포트)·Capacitor 불변.
- **홈 우측 위젯 레일 완성(2026-07-20)**: 스트릭(7일 도트 — 스트릭 창 역산, 지어낸 기록 0)·보유
  스텝(장화 글리프)·오답노트 대기(단원 브레이크다운+openNotebook 게이트)·이어서 학습(현재 단원 첫
  미완료 레슨, renderMap이 단원 전환마다 갱신). **레일 DOM은 desktopMode일 때만 생성**(home.ts) —
  모바일·e2e는 DOM 부재로 계약 안전, 표시는 html.dt + ≥1280px(1024~1279는 숨김 = 시안 A 동작).
  상세·함정은 **design/desktop-shell.md** 정본, 시안 목업은 design/desktop-variants.html(#vB).
  남은 후보(낮음): 랩 스텝 한정 D식 투페인, 가로 랩 데스크톱 폭 개별 검수.
- 함정: .btn은 inline-block이라 auto 마진 중앙 정렬 불가(display:block 명시), 무대만 캡하면 아래
  컨트롤과 축이 어긋남(.stepWrap 통칼럼 캡이 정답).

## 미니게임 (도전 탭 "쉬는 시간" — 스텝 러시·코스모 머지·네온 한붓그리기·레이저 미로)
- **구조**: 게임 코드는 같은 리포 **동적 import**(iframe 기각 — three 규칙과 동일). 진입·프리미엄
  게이트는 main.ts `openStepRush`/`openCosmoMerge`/`openOneStroke`/`openLaserMaze`가 소유(잠금 →
  전용 문구 페이월 → 구매 시 재진입), challenge.ts 카드(#btn-cosmo·#btn-steprush·#btn-lasermaze·
  #btn-onestroke — **카드 순서 = 코스모→스텝러시→미로→한붓, 2026-07-20 사용자 확정**, 아이콘은 전
  카드 accent(회색이면 비활성으로 읽힘), 크라운+입장 스텝 필 병기)가 입장료를 걷고 콜백을 부른다.
  나가기 = goTab("challenge"). 섹션 헤더는 **"쉬는 시간" 강조판**(2026-07-20 — 파랑 배지 타이틀 +
  보유 스텝 잔고 + 입장 규칙 한 줄 .play-head/.play-note), 코스모·미로 카드 설명은 "~을 배우면서"
  학습 톤(2026-07-20 사용자 지시). 별자리 한붓그리기는 폐기(2026-07-19 — starGame.ts 삭제).
  채점은 store.minigame(Record<gameId, best> — sync 병합 max) 공용, **신기록 갱신분만 스텝**(파밍 방지) +
  데일리(오늘 첫 기록 갱신 2배, 갱신 없는 판은 미소진 — 스텝 러시 srx.daily·코스모 머지 cmx.daily).
- **게임 입장료(2026-07-20 사용자 확정 — spendXp 첫 실소비처)**: 게임을 열 때마다 보유 스텝(totalXp)에서
  `GAME_FEE`(challenge.ts, 20) 차감 — 학습으로 번 스텝이 쉬는 시간의 입장권. 잔고만 줄고 누적(lifeXp)·
  장화 레벨은 불변(spendXp 규약). **순서 = ① 페이월 게이트(비프리미엄 무과금 통과) ② 검토 모드 면제
  ③ 일일 상한 확인 ④ 차감+판수 기록**(순서 바꾸면 못 들어갈 유저 스텝을 훔침). 부족 시 스낵으로 학습
  유도, 세션 내 재도전·다시하기는 무료(요금·판수는 카드 탭 시점뿐). **일일 상한 = 하루 15판**(PLAY_CAP,
  전 게임 합산 — 2026-07-20 사용자 확정. 잔고 부자의 폭식 방지 + "쉬는 시간은 끝난다" 서사, 기기 저장
  game.dailyPlays·자정 리셋·검토 모드 면제). 헤더에 "오늘 N/15판" 카운터(.play-cnt — 소진 시 done 다크
  필 + 안내 문구 전환), 소진 탭은 "오늘 쉬는 시간은 끝났어요" 스낵.
  게임 UI 통화 표기는 **'스텝'으로 통일**(구 '스틱' 문구 소급). e2e 4종은 totalXp 100 시딩+차감 검산,
  스텝 부족·일일 상한 차단 경로는 e2e-steprush 말미가 검증.
- **스텝 러시(src/game/stepRush/)**: engine(순수 로직·mulberry32 시드 RNG — DEV는 sessionStorage
  srxSeed 고정, 해금 rnd는 해금 시에만 뽑아 난수열 순수 유지)·render(캔버스 격리 — Pixi 교체 여지)·
  index(화면 조립·입력·HUD·시트) + styles/game.css(srx- 네임스페이스). 공용 킷 src/game/gameKit.ts
  (Particles·Shake·Sfx·Bgm)는 다음 게임이 재사용한다. 메타 = 별 계단 피버(최고 50 해금)·방패(100)·
  모래시계(200) 점진 공개, "지난 나" 고스트, 고도 변신 GEAR_STAGES(80/300/800 — render가 단일 정본).
- **코스모 머지(src/game/cosmoMerge/, 2026-07-18 신작)**: 수박게임 문법의 천체 합체 낙하 퍼즐 —
  같은 천체끼리 닿으면 다음 티어. 11티어 = 먼지→소행성→명왕성→달→수성→화성→금성→지구→토성→목성→태양
  (**크기 순서는 실제 그대로**·반경은 게임 스케일, 드롭은 앞 5티어·합성 점수는 수박게임 삼각수 커브,
  명왕성<달이 교육 포인트). 물리는 **matter-js**(모듈 내 정적 import — 게임 청크에 실림, vite
  optimizeDeps 등록): 반발 0.14(잔반동 — 실기기 피드백, 크면 조준 배신·더미 출렁이라 상한 주의)·
  질량∝면적(균일 밀도)·고정 16.7ms 스텝 최대 4·합체 결과물 55%→6틱 성장(팝콘 튐 방지)·성장 중 합체
  유예·속도 캡 24. **탄성 손맛은 물리보다 착지 스쿼시&스트레치가 담당**(land 이벤트 id로 렌더러가
  180ms 눌림→복원, 월드 수직축·reduced-motion 제외). 게임오버 = 라인(y96) 위 체류, 유예 0.95s+지속 1.15s.
  **태양+태양 = 초신성**(보드 전체 소거+66점+우주먼지 비 — "별의 죽음이 새 먼지" 서사), 태양 탄생마다
  **내 은하**(localStorage cmx.galaxy — 우상단 나선, 기기 누적 메타)에 별 적립. 스프라이트 =
  sprites.ts 절차 페인터 11종(NASA 텍스처 눈대조 — 목성 벨트/대적점/회녹 극지·토성 고리/카시니
  간극/고리 그림자·명왕성 스푸트니크 하트·달 바다/티코 광조·화성 시르티스/림 극관, 반경 파라미터
  오프스크린 베이크 캐시라 반경 상수를 바꿔도 그림 자동 추종). 조작 = 끌어서 조준·놓으면 드롭(읽는
  규칙 0줄) + ←/→·스페이스 키. 첫 두 드롭 먼지 보장(온보딩), 티어 첫 합성마다 과학 사실 토스트,
  **무대 아래 체인 스트립** = 크기 순서 상시 노출 교육 레이어(오버레이 충돌 없음). 보상 = 신기록
  갱신분 ÷10 스틱(점수 인플레 보정, 최소 1) + 데일리 2배. 시드 = sessionStorage cmxSeed(드롭 순서만 —
  물리는 기기 간 완전 결정성 아님, 리더보드는 서버 검증 설계 후). **근접 합체 스윕(실기기 피드백)**:
  같은 티어가 표면 간격 ≤ max(3px, 합반경 6%)면 충돌 이벤트 없이도 합침 — 글로우 때문에 "붙어
  보이는" 쌍이 안 합쳐지던 문제. 자석 힘은 기각(정지 마찰을 못 이기면 무의미·이기면 더미가 미끄러짐).
  **연쇄 콤보 FX(실기기 피드백)**: 1.6s 창 안 연속 합체마다 콤보 단수 상승(index가 계산·연출 전용,
  점수 불변) — 파티클·링·셰이크 스케일 + "콤보 ×N" 계단 팝업 + 상승 아르페지오(Sfx.combo).
  **든 천체 안내(실기기 피드백)**: 이름 라벨은 렌더러가 천체 바로 위에 그려 조준을 따라다니고
  (벽 근처 클램프), 간단 개념 한 줄(.cmx-desc — TIERS.fact 재사용)은 점수 아래에 천체가 바뀔 때
  2.6s 표시. 다음 미리보기 갱신 키는 nextTier(held 키면 같은 티어 연속 드롭 때 스테일 — 실버그 수정).
  **금성↔목성 미니 구분(실기기 피드백 "목성 다음 지구야?")**: 실사 금성은 거의 민무늬라 금성 줄무늬를
  대폭 완화 + 페인터에 미니 분기(**문턱은 기기 픽셀 R<20** — 체인 아이콘이 rDisp 8~9×dpr 2=16~18px로
  베이크되니 14로 잡으면 안 탄다, 실사고): 금성 미니 = 완전 민무늬, 목성 미니 = 굵은 벨트 2줄+대적점.
  체인 아이콘은 버튼 — 탭하면 이름·fact 토스트(뭔지 궁금하면 즉석 확인).
  **우주 유리 통(실기기 피드백 "통이 구분·좁게")**: CMX_W 360→330(원본 상자의 타이트함), 렌더러가
  양옆 거터(max(18px, 5%))+바닥 리프트를 남기고 통을 객체로 그린다 — 유리 벽·받침 슬래브·벌어진
  입구 립(립 높이 = 게임오버 라인)·통 안 뒷유리 틴트, 통 밖 허공은 45% 어둡게(별 담긴 수조 연출).
  **오디오(일레븐랩스 발주 — qa/gen-cosmo-audio.mjs, `XI_KEY=<키>` 환경변수로만·키 리포 저장 금지)**:
  BGM 3곡은 8비트 치프튠 계열 유지(스텝 러시 정체성)·우주 퍼즐 무드, **존 = 판의 성장**(성운 시작 →
  행성 시대(maxTier≥6 금성) → 별의 시대(sunBorn≥1)) — gameKit.Bgm 크로스페이드 재사용. 이벤트 샘플
  4종(sunborn/nova/best/over — over는 Sfx.fall()의 샘플 슬롯에 매핑) + 합체 팝·콤보·드롭은 즉발 신스
  유지(게임 디자인). 루프 이음매·라우드니스 파이프라인은 스텝 러시와 동일. 에셋 public/game/cosmo/
  (~1.6MB, 게임 진입 후 지연 로드), 검수 페이지 public/qa-cosmo-audio.html.
  **함정: 실플레이로 게임오버 재현은 비결정적**(공 타워는 어떤 배치든 굴러 무너지고, 보드를 채워도
  초신성이 계속 구조 — 3회 실사고) → e2e는 DEV 정적 핀 `__cmx.spawn(t,x,y,still=true)`로 라인 판정을
  검증한다. QA: `PORT=<포트> node qa/e2e-cosmo.mjs`(50검증 — 실입력 첫 합체·근접 합체 2px·콤보
  dataset·개념 한 줄·체인 탭 토스트·오디오 에셋 서빙·소환 훅 화성·태양·초신성·게임오버·스틱·데일리·
  복귀 + 천체 도감 샷 cosmo-gallery.png 눈검수).
  DEV 훅 = data-cx-*(Phase/Score/Bodies/Held/Next/MaxTier/Nova/Sun/Danger/Combo) + __cmx(spawn·gallery).
- **가드레일 3원칙(사용자 확정 — 위반 금지)**: ① 조작은 끝까지 2버튼 ② 읽는 규칙 금지·밟으면 아는
  효과만 ③ 낙하 조건 = 방향 실수·스태미나 0 둘 고정(다양성은 보상 층에만). **기능 동결(2026-07-17)**:
  보스전·업적·꾸미기 상점·부활은 백로그 — 사용자가 먼저 꺼내기 전 재제안 금지. 스텝의 소비처는
  게임 입장료가 유일(2026-07-20 도입 — "소비처 없음이 정상"이던 구 규칙 폐기, 위 입장료 항목 참조).
- **[백로그 — 자랑하기 공유(2026-07-21 사용자 확정)]**: 신기록·단원 정복·시험 신기록 **순간의 시트**에
  공유 버튼(Web Share) — 자발적 초대는 자랑 순간에 일어난다. **상시 '친구 초대' 버튼·보상형 초대는
  보류**(함께 겨룰 리더보드가 없어 약하고 스텝 남용 리스크 — 리더보드·서버 검증과 세트로만, 자리는
  도전 탭 '랭킹 준비 중' 카드 후보). 사용자가 꺼내기 전 상시 초대 재제안 금지.
- **입력 하이브리드**: 실제 히트 존 = 화면 좌/우 절반 전체(host pointerdown, 헤더·오버 시트만 제외),
  버튼은 시각 앵커 + 키보드 접근성 경로(click e.detail===0만 — 이중 입력 방지). 존 탭의 버튼 프레스
  연출은 .pressed 클래스(:active 안 걸림).
- **배경 여정(render STOPS)**: 낮 도시(0)→노을(65)→밤(175)→구름바다(300)→오로라(520)→성층권(950)→
  우주(1900). 도시는 **지면 고정 스카이라인 스프라이트**(buildCity 1회 베이크 — 공중 슬래브 금지,
  타워는 발밑으로 가라앉아 자연 퇴장), 낮 구름은 도시보다 먼저(뒤) + 화면 위 58% 띠만.
  nightF=ramp(115,175)가 별 밝기·러너/고스트 잉크↔흰색을 보간하고, index의 .day 클래스(p<120)가
  HUD를 잉크색으로 전환한다(밝은 하늘 대비).
- **오디오(일레븐랩스 발주 — qa/gen-steprush-audio.mjs, `XI_KEY=<키>` 환경변수로만·키 리포 저장 금지)**:
  BGM 5곡은 **8비트 치프튠 계열 통일**(사용자 확정 — 장르 유지, 존별 무드만 차등), 존 문턱
  0/65/175/520/950 = 배경 여정과 동일. gameKit.Bgm이 2.4s 크로스페이드+다음 존 프리페치+게임오버
  duck(0.25×), Sfx는 이벤트 샘플 6종(fall/best/fever/save/freeze/gear) 우선 + 신스 폴백(스텝
  사다리음·골드는 신스 유지 = 게임 디자인). 루프 이음매는 ffmpeg로 꼬리 1.4s를 머리에 크로스페이드해
  굽는다. 재발주 = 해당 mp3 삭제 후 재실행(전체 --force). 에셋 public/game/steprush/(~2.5MB, 게임
  진입 후 지연 로드), 검수 페이지 public/qa-steprush-audio.html.
- **함정(실사고)**: ① `nav.go(팩토리())`는 인자 평가→stopAllLoops→mount 순서 — 팩토리 안에서
  loop.start()하면 즉사, setTimeout(0)으로 mount 뒤 시작(캔버스 resize도 함께) ② 프리뷰 하니스는
  rAF 프리즈(사고 17) — **게임 검증은 qa/e2e-steprush.mjs(실 Chromium)가 확정 경로** ③ 동시 세션
  HMR 리로드 면역 = `page.route("**/@vite/client", fulfill 스텁)`(updateStyle 살리고 웹소켓 제거 —
  abort는 dev CSS import가 통째로 죽어 금물) ④ e2e 시딩은 `addInitScript`(페이지 스크립트보다 먼저
  실행 — goto 후 evaluate+reload 방식은 앱 부팅 저장과 경합해 간헐 실패).
- QA: `PORT=<포트> node qa/e2e-steprush.mjs`(45검증 — 존 탭 코어 루프·낙하 2종·데일리 2배·별 피버·
  고스트 추월·방패 세이브·모래시계 프리즈·복귀). DEV 데이터 훅 = data-sr-*(Phase/Score/Next/Fever/
  ShieldOn/Frozen/Saved/Star/Passed).

## 오답노트 (2026-07 구축)
- **데이터**: store.wrongNotes(Record<key, WrongNote>) — 채점 순간의 **문항 스냅샷**(q·보기·정답·해설)이라
  콘텐츠가 바뀌어도 스스로 렌더된다. 키 = 레슨 `l:<lessonId>:<q해시>`(스텝에 id가 없어 프롬프트 djb2 해시) /
  시험 `e:<examId>:<문항id>`. 상한 200(극복→오래된 순 정리). 동기화는 progress.wrong_notes jsonb
  (병합: 최근 ts가 상태 대표, wrongCount는 max).
- **수집 훅은 두 곳뿐**: quiz.ts feedback()(레슨 — 그 외 능동형 스텝(order·binSort·hotspot)은 미수집)과
  exam.ts grade()(시험). **같은 문항을 다시 맞히면 자동 극복**(resolveWrongNote) — 레슨 재플레이·시험
  재응시가 곧 복습이 되는 구조.
- **열람은 프리미엄 전용(2026-07-15)**: 모든 진입(복습 탭·로그인 화면)이 main.ts `openNotebook()` 게이트를
  지난다(잠금 → 페이월). 수집은 무료 유지 — "IA·홈 구조"의 복습 탭 프리미엄 항목 참조.
- **UI**: 복습 탭·마이페이지의 .nb-entry 카드 → screens/notebook.ts. 다시 풀기: mcq/ox 탭 즉시
  채점·multi 선택+확인·num/word는 정답 열람+자기 확인. **그림 문항은 원본 콘텐츠에서 그림을 역추적해
  카드에 그대로 렌더**(2026-07-12 — 스냅샷엔 여전히 그림 없음): 시험은 examById(srcId)+키의 문항 id로
  풀에서, 레슨은 findLesson 후 같은 프롬프트의 quiz 스텝에서 찾는다(q-figure 문법 재사용, figureDark 지원).
  콘텐츠가 바뀌어 못 찾을 때만 "그림 문제" 칩+원문 복습 안내로 폴백. 맞히면 극복(초록·극복 섹션으로),
  틀리면 해설 공개+횟수 누적. 비로그인도 동작(기기 저장).
- **탐색은 필터형**(2026-07-15, 사용자 확정 — "목록을 다 쌓지 말고 고른 단원만"): **과목 세그 + 학년
  세그**(.nb-filters 한 행, .grade-seg 재사용 — 각각 둘 이상일 때만, 기본 = getViewSubject/getViewGrade.
  학년 세그는 2026-07-20 추가, 원문 소실 노트는 학년 무관 항상 포함) → **상태 탭 [다시 풀 문제 |
  해결한 문제]**(.seg 재사용) → **단원 칩**(전체 + 현재 탭·학년에 오답 있는 단원, 커리큘럼 순 — 단원이
  하나뿐이면 칩 행 생략. **칩은 가로 스크롤이 아니라 줄바꿈 나열** — 데스크톱에서 굴릴 수단이 없어
  "스크롤 안 됨"으로 읽히던 실사용 피드백, 2026-07-20)
  → 고른 단원의 카드만 렌더(레슨 순 정렬). 전체 보기에서만 카드 라벨에 단원명 병기.
  **"해결한 문제" 탭이 라이브러리** — 다시 풀어 맞힌 문제는 이 탭에서만 보인다(용어 '극복'은 UI에서 폐기,
  사용자 확정 "해결" — store 필드 overcome·resolveWrongNote 등 코드명은 유지). **레슨별 소구획은 두지
  않는다**(단원당 오답이 몇 개 수준이라 소음). 원문이 끊긴 노트(findLesson 실패)는 "지난 콘텐츠" 칩
  (과목은 lessonId 접두 m으로만 추정). 과목·탭 전환 시 단원 필터는 "전체"로 리셋.
- QA: `PORT=<포트> node qa/e2e-notebook.mjs` — 시험 오답 수집→목록(상태 탭·세그/칩 생략 규칙)→해결
  (라이브러리 탭 이동)→재오답→레슨 훅→빈 상태→필터형 탐색(과학+수학+소실 노트 시딩, 칩 필터·탭 전환)
  →학년 세그(중1+중2 시딩) 38검증. 정본 진입 = 복습 탭(gnav).

## 취약 단원 문제 뽑기 (2026-07-12 구축 — 복습 탭, 프리미엄)
- **구조**: screens/weakDrill.ts 한 파일(피커→드릴→결과 3국면, 시험 화면 문법 재사용). 문항은
  **단원 종합 평가 문제 은행(content/exams/)이 유일한 출처** — lessonId 태그·해설·그림이 완비된 풀이라
  examForUnit이 있는 단원만 피커에 뜨고, 새 시험 풀을 등록하면 자동으로 추가된다(별도 등록 없음 —
  drillUnits가 CURRICULA_OF 전 과목×학년을 스캔하므로 사회·역사도 풀만 등록하면 뜬다, 2026-07-20 확장).
- **피커**: **과목 세그 + 학년 세그**(.wd-filters — 문제 은행이 있는 과목·학년만, 기본 = 지금 학습
  중인 과목·학년. 2026-07-20 추가. **필터는 보기만 바꾼다** — 담은 소단원(sel)은 과목을 오가도 유지되고
  전부 함께 뽑힌다 = 과학+수학 혼합 문제지가 설계 의도. 요약 필(.wd-selsum "담은 소단원 N곳(과학 a ·
  수학 b)")이 이를 실시간 표기 — 각주만으론 안 보인다는 사용자 피드백. 세그 라벨의 숫자 배지는 요약
  필과 중복이라 제거(사용자 확정 2026-07-20), 세그 다중선택 안은 목록이 전 과목으로 쌓여 기각) →
  소단원(레슨) 다중 선택 — 단원을 넘나들며 담을 수 있다. 소단원·단원에 미극복 오답 수 배지
  (wrongNotes의 lessonId 집계, 극복분 제외), "오답 있는 소단원 자동 담기" 버튼, 문제 수 세그(5/10/15,
  풀 부족 시 CTA가 실제 뽑는 수로 캡). 추출은 drawExamItems 재사용(선택 소단원끼리 균형+진도 순 —
  합성 ExamDef에 필터한 풀을 넣으면 끝).
- **드릴은 시험과 달리 문제마다 즉시 채점 + 해설**(복습 도구라서): mcq/multi는 카드 ok/no/dim(레슨 퀴즈
  언어), num은 확인 후 패드 제거+내 답/정답 페어, word는 칩 ok/no/dim. **오답노트 키를 시험과 공유**
  (`e:<원본 examId>:<문항id>`) — 드릴에서 틀리면 수집, 맞히면 시험에서 틀렸던 같은 문항도 자동 극복.
  XP는 없다(파밍 방지) — 완주 시 touchStudyActivity()로 **학습일(스트릭)만 집계**. 결과 화면은 시험의
  소단원별 진단 문법 재사용(weak 태그·복습 버튼, 이름은 "학년 로마자 · 소단원 라벨").
- **프리미엄 게이트는 main.ts openWeakDrill이 소유**(isPremium()||isReviewMode() 아니면 전용 문구 페이월
  → 구매 시 바로 드릴 진입). review.ts 카드는 잠금이면 골드 크라운 필(.prep-pill.gold)만 표시.
- **운영 계정 프리미엄 겹층**: auth.ts PRIVILEGED_EMAILS(sciencegive@gmail.com·dogjung86@naver.com 카카오)
  로 로그인하면 결제 없이 프리미엄 전체 권한 — main.ts가 onAuthChange로 store.setPremiumOverride 주입.
  **state.premium과 분리된 런타임 플래그라 저장·동기화되지 않고 로그아웃하면 자동 해제**(isPremium()이
  둘을 OR — 레슨 잠금·시험 재응시·드릴이 전부 함께 풀린다).
- **저작 함정(실버그)**: makeAnswerPad의 onReady는 생성 직후 **동기 호출**된다 — 뒤에 선언한 const를
  직접 넘기면 TDZ로 넘패드가 통째로 안 뜬다. 콜백에는 `() => confirm()`처럼 지연 참조로 넘길 것.

## 질문하기 — AI 튜터 '스틱쌤' (2026-07-15 프로토타입 가동)
- **구조**: `core/tutor.ts`가 모델 호출의 단일 창구(purchase.ts 문법 — 이 파일만 갈아끼우면 공급자 교체),
  화면은 `screens/tutor.ts`(채팅 — 말풍선·시작 칩·SSE 스트리밍 타자 효과), 시트는 `styles/tutor.css`
  (qt- 네임스페이스). 진입 2곳: 복습 탭 카드(일반 질문) · 오답노트 카드 "스틱쌤에게 질문하기"
  (noteContext가 문항 스냅샷(q·보기·정답·해설)을 텍스트로 그라운딩 — 그림은 전달 불가를 명시).
  채점·XP·store 기록 없음(순수 채팅), 대화는 저장하지 않는다(화면 이탈 = 휘발).
- **활성 조건**: `.env.local`의 `VITE_GEMINI_API_KEY` — 없으면 전부 no-op(복습 탭 "준비 중" 카드,
  오답노트 버튼 미노출, auth.ts와 같은 스텁 문법). 현재 공급자 Google `gemini-3.5-flash`
  (v1beta streamGenerateContent, alt=sse). **프리미엄 전용(2026-07-15)** — main.ts `openTutor()`가
  게이트(잠금 → 페이월), 복습 탭 카드는 잠금 시 크라운/해금 시 "AI 베타" 필.
- **⚠️ 프로토타입 한계(출시 전 필수 교체)**: 브라우저에서 키로 직접 호출 → 빌드 번들에 키가 들어간다.
  **이 키를 Vercel 등 배포 환경변수에 절대 넣지 말 것**(로컬 dev 검증 전용). 정식 오픈 전에
  ① 서버 프록시(Supabase Edge Function)로 키 은닉 ② 공급자 약관 재검토(2026-07-15 조사: AI Studio
  API는 18세 미만 대상 앱 사용 금지 조항이 유·무료 공통 — 출시 경로는 Vertex AI 또는 미성년
  세이프가드 조건부 허용인 Claude API로 확정) ③ 미성년 세이프가드(연령 고지·이용 안내) 설계가 선행.
- **사진 질문(카메라·갤러리)**: 숨은 `input[type=file] accept="image/*"` 하나로 모바일 네이티브
  선택창이 촬영·갤러리를 함께 연다(capture 속성 없이 — iOS는 픽커가 HEIC→JPEG 자동 변환).
  화면이 캔버스로 최대 1280px JPEG(q0.82) 다운스케일 → base64 `inlineData`로 전송, 한 장 정책
  (트레이 미리보기 + x로 제거, 전송 후 자동 비움). 사진만 보내는 것도 허용(텍스트 파트 생략).
- **수익화(2026-07-15 방향 승인 — 미구현)**: 튜터는 평생 이용권에 무제한으로 묶지 않는다(종량 원가).
  기간제 패스(30일 5,900원 안, 하루 20질문, 자동결제 없음) + 질문팩(30개 2,900원 안) + 프리미엄
  보너스 쿼터. **상세 스펙·원가 실측·구현 TODO는 design/tutor-monetization.md**(세션 핸드오프 문서).
- **세이프가드(현재 구현)**: 시스템 프롬프트(해요체·이모지/마크다운 금지·**욕설/비속어 금지 + 학생
  욕설은 받아 주고 고운 말 유도**·**음담패설은 학생이 먼저 꺼내도 선 긋기**·**링크/URL/유튜브·영상·
  사이트 추천 금지(설명은 직접)**·과학/수학 범위 제한·개인정보 금지·유해 주제 거절·힌트 우선 교수법·
  되물음 마무리·사진 판독 지침) + `stripLinks()` 정규식이 URL을 표시 전 걷어내는 이중 장치 +
  화면 상단 상시 AI 고지. safetySettings는 성적/혐오 LOW 최강 차단, **harassment·dangerous는
  MEDIUM**(좌절 욕설 "짜증나"까지 LOW로 하드 차단하면 프롬프트의 따뜻한 응대가 못 나가고, 연소·전기
  같은 과학 소재가 오차단되는 실측 — 2026-07-15). 답변은 textContent로만 렌더(XSS 차단) —
  마크다운 렌더러를 붙이지 말 것(프롬프트가 순수 문장을 강제한다).

## 도전 탭 미니게임 — 네온 한붓그리기 (2026-07-18)
- **구조**: `src/game/oneStroke/` — gen.ts(순수 생성기·히어홀저 솔버·난이도 커브, DOM 없음)와
  index.ts(화면·포인터 입력·캔버스 렌더·보상). 진입은 challenge.ts 카드 → main.ts `openOneStroke`
  (프리미엄 게이트 + 동적 import — 스텝 러시 문법). 스타일은 styles/game.css `ost-` 네임스페이스.
- **오디오(일레븐랩스 발주 `qa/gen-onestroke-audio.mjs` — XI_KEY env로만, 2026-07-18)**: BGM 존 2개
  (수제 1~6판 bgm-neon-calm 84BPM 차분 / 절차 7판+ bgm-neon-deep 92BPM 심화 — 신스웨이브+레트로 게임 톤,
  30초 루프 이음매 크로스페이드) + 샘플 3종(sfx-clear→best 완성 팬페어·sfx-stuck→fall 네온 플리커
  다운·sfx-hint→hint 발견 차임, public/game/onestroke). 선 켜짐/되돌리기 틱은 신스 유지(지연 0 =
  게임 디자인, gameKit neon/neonUndo/neonHint). 완성 배너 동안 bgm.duck, 다음 판 setStage가 복귀.
  힌트 차임은 막힘 버즈와 겹치지 않게 자동 리셋(900ms) 시점에 운다.
- **불가능 퍼즐 0% 보장(이 게임의 핵심 계약)**: 생성이 "링 순환 + 사이클 합성"만 쓰므로 모든 정점이
  항상 짝수 차수 — 홀수판은 마지막에 현 1개를 더해 홀수점을 정확히 2개 만든다(오일러 조건을 구성으로
  강제). 그 위에 solvePath(히어홀저)로 이중 검증, 시도 전멸 시 수제 도형 폴백까지 3중 안전.
  `qa/e2e-onestroke.mjs`의 소크(1~140판 전수)가 해결 가능·품질 게이트·폴백 0을 기계 증명한다.
- **난이도 커브**: 1~6판 수제 튜토리얼 아크(삼각형→별→나비(일찍 닫기 함정)→집(홀수점 도입)→봉투→
  별+오각형, 간선 3·5·6·6·8·10), 7판+ 절차 생성 — 간선 9→20캡, 링 정점 6→10, 12판+ 내부 정점·4각
  사이클, 교차 예산 0→8, `s%4==2`는 짝수 순환 브리더. 스테이지 시드 고정 = 같은 판은 언제나 같은
  그림(재도전이 곧 연습, 기록 비교 공정).
- **생성기 함정(실사고)**: 품질 검증을 최종 일괄로 하면 고밀도 판(18판+)에서 시도가 전멸해 폴백만
  나온다 → 간선 추가 시점의 **증분 검사**(check/tryCycle — 중복·최소 길이·정점 근접 clearMin·교차
  예산·교차각 20°)로 해결. clearMin(105~115)은 스냅 반경(92)보다 항상 커야 한다 — 선을 따라 긋다가
  다른 점에 오스냅·오커밋되는 것을 기하로 차단하는 값이다.
- **입력 문법(1LINE류 관용)**: 정점 스냅 커밋 + 빠른 스트로크는 이동 선분 기준 순서 커밋(점을 스쳐도
  안 놓침), 직전 점 재진입 = 마지막 선 취소(커밋 직후 오발 방지 armedUndo — 1.5×스냅 이탈 후 무장),
  손 떼도 진행 유지(빛나는 끝점에서 재개), 막다른 길은 자동 리셋 + 실패 누적.
- **교육 장치(발견 우선)**: 홀수판 2회 실패 → 홀수점 금빛 펄스 + 코치 "선이 홀수 개 모인 점에서
  시작" — 첫 실패에는 힌트를 주지 않는다(스스로 시작점을 바꿔 보는 경험이 먼저).
- **보상**: 새 판 첫 클리어만 +3 스틱(store.minigame `onestroke` = 최고 판 수, 스타 게임 문법).
  재플레이는 "이미 깬 판이에요" — 보상·기록 불변. 판 이동은 HUD 스테퍼(이전 자유, 다음은 최고+1까지).
- QA: `PORT=<포트> node qa/e2e-onestroke.mjs`(47검증 — 소크·실그리기 클리어·이어 그리기·오시작
  토스트·되돌리기·막힘 2회→힌트·재플레이 무보상·나가기 복귀·페이월 게이트).
  눈검수 `PORT=<포트> node qa/shot-onestroke-late.mjs`(12·15·18판 절반 그린 샷).

## 도전 탭 미니게임 — 레이저 미로 (2026-07-18 v1 → 2026-07-19 v2 블록 배치 전환)
- **구조**: `src/game/laserMaze/` — gen.ts(대각 빔 트레이서·정답 역산 생성기, 순수)와 index.ts(화면·
  드래그/탭-탭 입력·렌더·보상). challenge.ts 카드(reflect 아이콘) → main.ts `openLaserMaze`(프리미엄
  게이트+동적 import). 스타일 game.css `lzm-`(v1 그대로 — 캔버스 안만 바뀌어 CSS 수정 0).
- **v2 전환 이유(2026-07-19 사용자 확정 — v1 탭 토글 폐기)**: 거울당 2상태 토글은 실시간 빔 피드백과
  결합하면 그리디 연타로 몇 초에 풀렸다(게임오버 부재가 아니라 **마찰 0**이 문제 — 한붓그리기는 막다른
  길이 마찰을 만든다). 회전 개념이 없는 정사각 블록을 "어느 칸에 놓을까"만으로 풀게 해 탐색 공간을
  칸 수로 키웠다(Play 스토어 lasermirror.juegosde 문법). **든 조각은 판에서 '들려' 빔이 그 칸을
  지나가고, 빔 갱신은 내려놓는 순간뿐** — 끌고 다니며 빔을 훑는 스크럽 풀이(연타의 드래그판)도 차단해
  "예측→배치→확인" 리듬을 지킨다.
- **기하(하프스텝 대각 격자 — v2의 심장)**: 빔은 45° 대각선, 웨이포인트는 칸 "변의 중점"만 지난다.
  배 좌표(ex,ey∈[0,2G], 합 홀수)에서 반 스텝 = +=(dx,dy), 다음 반 스텝이 건널 칸이 막혔으면 지금 서
  있는 변이 반사면(세로 변 = dx 반전·가로 변 = dy 반전). 이 격자류 대각선은 칸 꼭짓점을 절대 지나지
  않아 모서리 모호함이 구조적으로 없고, 반사점 = 언제나 블록 면 한가운데(45° 입사=반사가 법선 양쪽에
  성립 — 교과서 반사 도해 그대로). 광원·보석(통과형 링)도 같은 노드 격자에 산다. 반사 경로는 가역
  (FLIPX·FLIPY가 REV와 켤레) — 합성판을 보석에서 거꾸로 걷는 생성의 근거.
- **풀 수 없는 판 0% 보장(핵심 계약, v1 계승)**: 정답 블록 배치를 먼저 깔아 경로를 만들고(턴 후보 =
  자유 칸, 다른 빔이 건너는 칸 제외 — 빔은 서로 통과하니 놓기만 금지) 블록 '위치만' 흩는다. **흩기는
  모든 정답 칸을 피해서** — "틀린 조각을 제 정답 칸으로 옮기면 풀림"이 항상 성립(솔버·e2e 전제).
  정답 배치 실트레이스 검증 + 흩은 상태 미완성 검증 + 전멸 시 1블록 수제 폴백(손검산 완료).
  `qa/e2e-lasermaze.mjs` 소크(1~120판)가 기계 증명.
- **게임 규칙 = 물리**: 블록 면 반사(반사점마다 법선 점선+입사각=반사각 쌍둥이 호 상시 — reflectLab
  시각 언어), 유리 블록 = 반 통과·반 반사(v1 반거울 계승·5판 데뷔), 바위 = 흡수·고정(**자갈 실루엣** —
  사각 블록과 실루엣부터 달라 "못 옮기는 소재"가 즉시 읽힘, 눈검수로 확정), 빔끼리 통과(빛은 부딪히지
  않음), 보석은 도착색 비트합(R1·G2·B4)이 요구색과 **정확히** 같아야 점등(가산혼합이 곧 판정).
  부분 도착은 링 안 색점 피드백.
- **난이도 커브**: 격자 5→6(5판)→7(9판), 필요 상자 1→4(다색판은 빔당 2 캡), 여분 블록 = v1 함정
  거울의 배치판(4판 데뷔·모노 2·합성 1 — 안 옮겨도 되는 조각이 노이즈), 유리 5판+(13판+ 2개), 바위
  6판+(최대 4). **색 스케줄 v1 그대로**: 7판부터 한 판 걸러 2색 합성(노랑→자홍→청록, 광원 2),
  12·20·28…판 하양(광원 3), 10·14…판 두 갈래 모노. 총 움직이는 조각 ≤ 10(드래그 피로 캡 = 소크 상한).
  시드 고정 = 같은 판 같은 그림.
- **입력 이중 문법**: 드래그(집기→고스트+목적지 칸 하이라이트→놓기 — setPointerCapture는 try/catch)
  + 탭-탭(선택→목적지, regionPlaceLab 계보 — e2e·접근성 경로). 오배치는 스냅백(토스트 없음),
  실제 이동만 moves 집계(data-lzm-moves).
- **오디오(일레븐랩스 v1 자산 그대로)**: BGM 존 2(판 1~6 focus/판 7+ prism)·샘플 3종(clear/gem/reset),
  이동 커밋 틱은 신스(flip 재사용 — 지연 0 원칙). 완성 배너 동안 bgm.duck, 다음 판 setStage가 복귀.
- **보상**: 새 판 첫 클리어만 +3 스틱(store.minigame `lasermaze` = 최고 판 수). 재플레이 무보상,
  판 이동 스테퍼(다음은 최고+1까지) — 한붓그리기와 완전 동일 문법.
- QA: `PORT=<포트> node qa/e2e-lasermaze.mjs`(47검증 — 소크·탭-탭 클리어·실드래그 문법(집기→끌기→
  놓기)·이동 집계/리셋·재플레이 무보상·합성판/하양판 실플레이·페이월). 눈검수
  qa/shots/lasermaze-{boot,clear1,pair,white}.png. **주의: 다른 세션이 먼저 띄운 dev 서버는 이 게임
  모듈을 스테일 캐시로 서빙할 수 있다**(inspect에 구 필드가 나오면 그 증상 — 실사고) → e2e는 이
  세션이 새로 띄운 전용 포트에서 돌린다.
