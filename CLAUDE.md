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
- **모션 격상 4종(2026-07-12 사용자 확정 — 에밀 코왈스키 스킬 검토에서 채택, base.css)**:
  ① 피드백 시트 비대칭 — 열기 `.42s var(--spring)` / 닫기 `.22s var(--ease-out)`(닫힘은 응답이라 빠르게)
  ② 퀴즈 보기 48ms 계단 등장 — `optIn` 키프레임(backwards 필 필수, forwards는 프레스를 죽임) + quiz.ts가 `--oi` 주입
  ③ 슬라이더 러버밴딩 — `core/rubber.ts` 헬퍼가 경계 초과량→`--rb`(px) 주입, 릴리스 스냅백 `.28s var(--spring-soft)`.
    파일럿 heatParticles·matterTemp — 새 슬라이더 랩도 같은 3줄(over 계산·--rb 주입·endDrag 리셋)로 적용 권장
  ④ reduced-motion = "전부 끄기"가 아니라 이동 제거 + 200ms 페이드 유지(screen·sheet·scrim·snack·toast).
  ⑤(원복 기록) ctaPop 젤리 스쿼시&스트레치는 같은 날 시도 → **원복**: CTA는 스텝마다 발동하는 고빈도라
    실사용에서 멀미 유발(사용자 판정 — 에밀 빈도 규칙의 실증). 바운스 강화는 저빈도 축하 순간 외 금지.
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
  탭하면 `screens/paywall.ts` 전면 페이월.
- **페이월 v3(2026-07-15, 사용자 목업 확정 — "결제 구조가 곧 신뢰")**: 히어로 = 깃발을 향해 왼쪽→오른쪽
  지그재그로 걷는 발자국 마크(홈 트레일 #bsfp 패스 재사용, 도장 스태거+깃발 팝 연출) + "한 번 결제로,
  모든 단원을 평생" + 신뢰 칩(평생 소장·자동결제 없음·이용 전 7일 환불) → 혜택 2+2 → 과목 다중 선택
  (**개수 제한 없음**, 최소 1 — 구 MAX_PLAN 3 폐기) → 영수증형 가격 카드 → 파랑 CTA(.btn.cta).
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

## 단원 종합 평가 (시험 시스템 — u3 열 파일럿)
- **구조**: 문항 풀은 `content/exams/`(types·index·u3·u3l1~l5 — 레슨당 20문항 = 총 100).
  화면은 `screens/exam.ts`(인트로→시험→일괄 채점→결과·전 문항 리뷰), 그림은 `ui/examFigures.ts`
  (파라미터형 그래프·SVG 표 — heatFigures 등 기존 단원 그림 재사용이 1순위). **문항은 레슨 파일에 넣지
  않는다** — 풀은 별도 파일이고, 문항의 lessonId 태그가 파트별 진단·"이 레슨 복습하기"의 근거다.
- **응시 규칙**: 지도 노드는 레슨 진행과 무관하게 **항상 열림**(레슨 뒤·보너스 게임 앞, `.gm-node.exam`
  잉크 메달리온). 응시마다 `drawExamItems`가 레슨 균형 랜덤 추출(풀 온전 시 레슨당 pick/n개, 시험지는
  진도 순 정렬). **시험 중 정오·해설 노출 금지**(explain·core는 리뷰 전용), 제출 후 한 번에 채점.
  단원당 1회 무료, 재응시는 프리미엄(store.exams: attempts·best·conquered — 이탈은 응시 미차감).
- **XP·인증**: 신기록 갱신분만 XP(스타 게임 문법 — 새 최고점 − 이전 최고점). 단원 정복률 100% 상태로
  제출하면 정복 인증 배지(conquered — 지도 노드 골드+리본). 시험 제출도 스트릭 학습일 집계(touchStudyDay 공용).
- **문항 유형**: mcq(5지 — ㄱㄴㄷ 합답형은 `bogi` 필드로 보기 상자)·multi·num(mathKit 넘패드 재사용,
  unitLabel 병기+문두 단위 명시)·word(워드뱅크 칩 8~10 — 시스템 키보드 금지). 단순 OX 없음.
  셔플 규칙은 레슨 퀴즈와 동일 + **shuffle:false 문항은 정답을 첫 보기에 두지 않는다**(고정 순서라
  그대로 노출 — 감사에서 잡힌 실사고).
- **해설 규격(문제집 최상급)**: `<span class='xh'>` 소제목으로 ①정답 풀이(계산은 한 줄씩 ①②③) ②오답
  선지 하나씩 격파(보기 위치 지칭 금지·내용 인용, ㄱㄴㄷ은 bogi 고정 라벨이라 지칭 허용) + core 한 줄
  요약(레슨 바로가기는 lessonId로 자동). 250~450자 해요체, "틀렸어요"로 끝내기 금지.
- **저작 함정(Opus 검산 감사로 확립)**: ① 그래프 그림의 aria-label에 정답 수치를 쓰지 않는다(값 읽기
  문항의 정답이 스크린리더로 노출). ② 문항은 자기완결 필수 — "앞 실험에서" 같은 이웃 문항 참조 금지
  (랜덤 추출이라 함께 나올 보장 없음, 그림도 각자 소유). ③ 레슨 퀴즈·훅·binSort의 문구/보기를 그대로
  재사용하지 않는다(함정 구조만 계승, 소재·각도는 교체). ④ 순서도 그림은 예/아니요 분기가 각자의 결론
  칸으로 갈라져야 한다(한 칸 수렴은 혼동).
- **QA**: `PORT=<포트> node qa/e2e-exam-u3.mjs` — 무료 응시→일괄 채점→파트 진단→리뷰 펼침→레슨
  바로가기→재응시 페이월→(정복+프리미엄) 인증 배지→신기록 XP→미갱신 0 XP까지 44개 검증. dev 전용
  데이터 속성(문항 호스트 data-qid/type/ans, 보기 data-oi, 칩 data-w)으로 정답/오답을 결정적으로 만들어
  점수·진단 수치를 그대로 대조한다. 검산 감사는 레슨 파일당 Opus 에이전트 병렬(정답 재풀이·그림 파라미터
  대조·언어 규칙, 보고만) 후 메인이 수정.
- **새 단원 시험 추가**: content/exams/<unit>lN.ts 풀 저작 → <unit>.ts 조립 → index.ts EXAMS 등록이
  전부(지도 노드·라우팅은 examForUnit으로 자동). 그림은 examFigures.ts에 단원 섹션을 나눠 추가.
- **u4(물질의 상태 변화) 100문항 — 6레슨 단원 확장으로 확립된 관행**: 레슨 수가 5가 아니어도
  drawExamItems가 자동 균형(6레슨이면 3×4+4×2), 인트로 "N 파트" 문구는 풀 lessonId 수로 동적 계산
  (exam.ts — 하드코딩 금지). 유형 구성은 u3 규격 75(mcq+multi)/12(num)/13(word) 유지, 분포는
  17·17·17·17·16·16. num 값 읽기용 그래프는 examCurveFig(수치 눈금 파라미터형) — **정답 수치는 반드시
  y·x 눈금선 위에 얹는다**(눈금 사이 값은 출제 금지). 저울류 그림 표시창은 빈 패널(숫자 각인 금지).
  **시험용 실사 사진 발주 표준**: public/exam/uN(process-geo.mjs SQUARE_DIRS 등록) + 풀 파일 로컬
  ximg/xpair 헬퍼(**loading=lazy 금지** — 사고 #14), 사진 문항은 발주 후 Read 눈검수를 통과한 파일명만
  참조. 신규 SVG는 qa/shot-exam-figs-u4.mjs 방식(한 페이지 렌더 스크린샷)으로 눈검수. 셔플 규칙 기계
  검사: shuffle:false && answer===0 조합은 커밋 전 스캔으로 잡는다(u4 저작 중 2건 적발 전례 — 독립 완결
  명제 보기면 shuffle:false를 제거하는 쪽이 원칙). u1·u2 시험 추가 시 이 관행 그대로.
  QA: `PORT=<포트> node qa/e2e-exam-u4.mjs`(47검증 — 사진 8장 로드·여섯 파트 문구·6레슨 진단 포함).
- **u5(힘의 작용) 100문항 — 7레슨 확장**: 분포 15·15·15·14·14·14·13, 규격은 u4 관행 그대로.
  **drawExamItems 잔여분 규칙 확립**: floor(pick/레슨수) 배분 후 잔여는 랜덤한 **서로 다른 레슨에
  1개씩**(전역 셔플 보충이던 구현은 7레슨에서 한 파트 5문항·다른 파트 2문항 편중 — u5 e2e가 적발,
  types.ts 수정으로 u3·u4에도 소급). 시험 수치는 레슨 수치 앵커(용수철 0.5N/cm·부력 20−14·3kg 29.4N)와
  반드시 다르게. 힘 단원 언어 가드: 관성·작용반작용·수직항력·등속·훅의 법칙 금지("일정한 빠르기로 곧게"
  서술), 등속 상태의 알짜힘 0은 정식 출제 범위(비상·천재 계승). 입자 모형 없는 단원이라 사진 비중↑(8장).
  QA: `PORT=<포트> node qa/e2e-exam-u5.mjs`(47검증 — 일곱 파트 문구·2×1+3×6 균형 추출 포함).
- **u6(기체의 성질) 120문항 — 첫 증량 풀(24×5)**: 100 고정이 아니라 레슨당 24로 증량해도
  drawExamItems·파트 문구·진단이 전부 자동(4×5 잔여 0). 유형 비율은 u3 규격 스케일(90 mcq+multi/14 num/16 word).
  그래프는 examFigures u6 섹션의 파라미터형(gasPvGraphFig 곱 k·gasTvGraphFig 절편 v0+기울기) —
  **샤를 수치 앵커는 0℃ 부피/273 ≈ 기울기인 자연값 세트로 검산**(55 mL+0.2/℃·82 mL+0.3/℃, 레슨 30.0+0.1과
  같은 방식). 모양 고르기 그림(gasTvChoicesFig)은 shuffle:false 첫 칸 금지 규칙 때문에 **정답을 ②에 배치하고
  ①을 원점 함정으로** — 라벨형 그림 신작 시 정답 위치를 그림 단계에서 설계한다. 기체 언어 가드:
  'PV' 기호·절대온도 금지("압력×부피" 한글 서술), '분자' 금지, 진공 포장·주사기 흡입은 보일 라벨 대신
  "속 기체↓ → 대기압이 민다"로 서술(입자 수 변화 상황과 법칙 혼동 방지). 그림 눈검수는
  `PORT=<포트> node qa/shot-exam-figs-u6.mjs`. QA: `PORT=<포트> node qa/e2e-exam-u6.mjs`(47검증 —
  다섯 파트 문구·4×5 균형 추출·사진 8장 로드 포함).
- **g2u1(물질의 특성) 150문항 — 첫 중2 트랙 시험(9레슨 증량 풀)**: 분포 17×6+16×3, 유형은 u3 규격
  스케일 113(mcq+multi)/18(num)/19(word), pick 20 → 2×7+3×2 균형(전부 자동). 그림은 chemFigures 재사용
  (solCurves3Fig·waterSaltBoilFig·crudeTowerFig — 레슨 퀴즈와 각도 교체 필수) + examFigures g2u1 섹션
  파라미터형 6종(chemSolCurveExamFig 곡선·chemMassVolExamFig 원점 직선·chemBoilCurvesFig·chemColumnFig
  층 기둥·chemFunnelABFig·chemDistillApparatusFig). 사진 10장(public/exam/g2u1 — 저울 표시창 빈 패널,
  달걀 가라앉음/뜸 xpair 쌍, 소줏고리·염전·사금 접시 등). 새로 확립된 관행: ① **프리미엄 레슨(L4+)의
  리뷰 "레슨 복습하기"는 페이월로 라우팅되는 게 정상** — 무료 응시 e2e는 오답을 무료 레슨 구간(시험지
  앞쪽)에 배치해 레슨 점프를 검증한다(playExam이 pattern 콜백 지원). ② e2e의 num 소수 정답은 넘패드
  소수점 키 라벨이 "·"(mathKit)라 "." → "·" 매핑 필수. ③ **공용 그림 킷의 aria-label도 시험 문항의
  정오 단서가 되면 안 된다**(crudeTowerFig "위로 갈수록 끓는점 낮은" 문구가 합답형 ㄴ의 정오를 유출 →
  중립 문구로 소급 수정). ④ 가열 곡선에서 '양이 많다' 단서는 기울기 완만 + 평평 구간 김을 세트로
  그린다(chemBoilCurvesFig plen 파라미터 — 같은 색 곡선의 교차는 구간 '중간'에서 X자로). 검산 감사는
  레슨 파일당 상위 모델 에이전트 9병렬(정답 재풀이·그림 대조·언어) — 심각 0·경미/제안만 수정으로 종결.
  기계 검사는 `node qa/check-exam-g2u1.mjs`(유형 구성·셔플 위반·해설 길이·word bank 검증 — 부등호
  "B < C"는 태그 아님에 주의). QA: `PORT=<포트> node qa/e2e-exam-g2u1.mjs`(47검증 — 아홉 파트 문구·
  2×7+3×2 균형·사진 10장·중2 지도 시딩 viewGrade g2), 그림 눈검수 `qa/shot-exam-figs-g2u1.mjs`.
- **g2u2(지권의 변화) 150문항 — 두 번째 중2 시험(9레슨, g2u1 규격 그대로)**: 분포 17×6+16×3,
  유형 113(mcq+multi)/18(num)/19(word). 그림은 geoFigures 재사용 6종(earthLayersFig·igneousGridFig·
  mineralFlowFig·soilLayersFig·plateSectionFig·driftStagesFig — 전부 레슨 문항과 각도 교체) +
  examFigures g2u2 섹션 5종(geoQuakeBeltFig 지진 점 띠 지도·geoRockFlowFig 파라미터 순서도·
  geoDriftRateFig 시간-거리 원점 직선·geoCoastFitFig 해안선 퍼즐·geoCycleQuizFig). 사진 10장
  (public/exam/g2u2 — 조흔 가루 2색·염산 거품·석영 결정·유문암·반려암·물고기 화석·양파 풍화·
  뿌리 쐐기·석회 동굴·토양 단면 절개지). 새로 확립된 관행: ① **recap용 다이어그램의 과정 라벨은
  그 과정명을 묻는 시험 문항에 정답을 인쇄한다** — rockCycleFig(라벨 "잘게 부서짐"·"녹음")를 그대로
  쓰면 유출이라, 라벨을 ㉠~㉤로 감춘 시험판 geoCycleQuizFig를 따로 만들었다(aria도 "과정 이름 대신
  동그라미 기호" 중립). ② **값 읽기 그래프의 dot 가이드 점선은 축까지 잇지 않는다** — 점선이 정답
  눈금을 바로 가리켜 읽기 과제가 무력화(검산 감사 적발, geoDriftRateFig는 점만 표시). ③ 수치 빈곤
  단원의 num 18 조달 전략: 깊이 산수(외핵 5100−2900=2200·내핵 6400−5100=1300·대륙/해양 지각 7배),
  판 이동 속도 계열(cm/년 곱셈·역산·양쪽 합산), 그래프 눈금 읽기(양방향 — 시간→거리·거리→시간),
  가짓수 셋(기준 2·결과 4·가족 3). 검산 감사는 상위 모델 9병렬(심각 2 = 순환 그림 유출·자체 검수와
  동일 건, 나머지 경미·제안 반영로 종결). 기계 검사 `node qa/check-exam-g2u2.mjs`,
  QA `PORT=<포트> node qa/e2e-exam-g2u2.mjs`(47검증), 그림 눈검수 `qa/shot-exam-figs-g2u2.mjs`.
- **g2u3(빛과 파동) 150문항 — 첫 8레슨 풀(19×6+18×2, 18은 L3·L4)**: 유형 113(mcq+multi)/18(num)/19(word),
  pick 20 → 2×4+3×4 균형(전부 자동). 그림은 lightFigures 재사용(coinCupFig ㄱㄴㄷ 각도 교체 +
  **레슨 미사용 킷 twoMirrorsFig·twoLensFig가 시험에서 데뷔** — 재사용 1순위 탐색은 미사용 헬퍼부터) +
  examFigures g2u3 섹션 파라미터형 10종(lightAngleExamFig 거울면/법선 기준·lightProtractorFig 반원
  각도기(법선 0° 눈금 — 장치의 눈금 기준을 aria·문두에 명시)·lightRefractUpFig 물→공기 ①~⑤(레슨
  공기→물과 **방향 교체**, 스넬 30°→42° 검산, 정답 ③ 설계)·lightSeePathFig ㉠㉡·lightMirrorGridFig
  모눈 3칸·lightPixelExamFig on 플래그·lightBalloonFig seen 배열·lightWaveGraphFig(거리축/시간축 겸용 —
  마루가 x=λ/4·5λ/4이므로 xStep·λ를 마루가 눈금선 위에 오게 세팅)·lightWave4Fig·lightPipesFig marks).
  사진 10장(public/exam/g2u3 — 잔잔/물결 호수 xpair 쌍(정반사↔난반사 전환), 실험 장치 실사풍(레이저
  유리 블록·소리굽쇠 물튀김·프리즘 분광), 유리구슬 속 풍경·국자 오목면 반사는 **"거꾸로" 방향을
  프롬프트에 명시하고 눈검수에서 그 조건을 판정**(u7 천체 3원칙 ②의 광학판)). 수치 앵커 회피:
  레슨 35°·42°·12cm·파장 2m·진폭 20cm·주기 0.5s·2Hz·50Hz ↔ 시험 25°·28°·40°·62°·65°·80°·3칸·파장 4m·
  진폭 15/25cm·주기 0.4s·0.25s→4Hz·5Hz→0.2s·40Hz→0.025s. 언어 가드: '초점·실상·허상' 금지(벤치 UI
  규칙의 시험판 — 뒤집힘은 "모인 빛이 교차"로), '분산·스펙트럼' 금지(프리즘은 "여러 색 빛으로 갈라짐").
  전신 거울 절반(160→80cm)은 recap fun 소재의 num 승격 사례. 검산 감사는 상위 모델 8병렬(심각 0 —
  경미·제안만 수정: 같은 풀 안 ㄱㄴㄷ 정답 조합 중복 완화, 레슨 OX와 동문인 표준 함정 문구 비틀기,
  해설 속 오답 격파 수치가 그림 격자와 어긋난 1건). 기계 검사 `node qa/check-exam-g2u3.mjs`,
  QA `PORT=<포트> node qa/e2e-exam-g2u3.mjs`(47검증 — 여덟 파트 문구·2×4+3×4 균형·사진 10장),
  그림 눈검수 `qa/shot-exam-figs-g2u3.mjs`.
- **g2u4(물질의 구성) 150문항 — 네 번째 중2 시험(첫 6레슨 풀, 25×6)**: 유형 113(mcq+multi)/18(num)/19(word),
  word 4문항 레슨은 L6, pick 20 → 3×4+4×2 균형(전부 자동). 그림은 atomFigures 재사용(atomModelFig 새 값
  7·2, fourModelFig 새 각도(분자 고르기) + **미사용 헬퍼 ionMoveFig 시험 데뷔**) + examFigures g2u4 섹션
  파라미터형 10종(atomMolsFig 분자 모형(H2~HCl 9키)·atomStructQuizFig ㉠㉡㉢·atomPeriodicExamFig
  단축형 뼈대+위치(기호판/A~E판)·atomCellQuizFig 칸 ㉠㉡㉢(cellAnatomyFig 유출 방지 시험판 —
  geoCycleQuizFig 계보)·atomFlowFig 4결론 순서도·atomElectrolysisFig((가)=(−)극·기체 2배)·
  atomIonMoveExamFig 번짐(색·방향·극 배치 파라미터)·atomPieFig(hide 숨김판)·atomCondFig·atomIonFormExamFig).
  사진 10장(public/exam/g2u4 — 전기영동 파란 얼룩은 "왼쪽으로만 번짐"을 프롬프트에 명시하고 눈검수에서
  그 조건을 판정, 물 전기 분해는 한쪽 기체가 두 배). 새로 확립된 관행: ① **시험지 내 교차 유출 스캔** —
  한 문항의 문두·보기가 같은 풀 다른 문항의 정답(num 답 18·7, 물질의 정체, 숨긴 ㉠값)을 인쇄하면 랜덤
  동시 추출에서 유출된다. num 정답 수치·word 정의문·"A는 B다" 선언을 이웃 문항과 대조해 저작·감사
  양쪽에서 훑는다(8건 적발·수정 — e81↔e95·e99↔e96·e17↔e12·PIE 공개판↔숨김판 등). ② **공용 그림 킷
  aria 전수 소급** — atomModelFig("+N·전자 N개")·fourModelFig("분자/원자/이온 배열")의 aria가 판독
  과제 자체를 낭독 → 중립 문구로 수정(crudeTowerFig 선례의 IV판). ③ 파라미터 숨김판(atomPieFig hide)은
  같은 데이터의 공개판 문항과 **조성 수치를 분리**한다. ④ 수치 빈곤 단원의 num 조달: 원자 개수 세기
  (생략된 1 함정)·이온 전자 수(양성자수±잃/얻)·족 18/주기 7/원소 118 자연값·원그래프 산수(100−합·몇 배)·
  목록 세기(원소/양이온 가짓수). ⑤ 병렬 codex 금지 하의 발주 대기열: qa/wait-order-g2u4.sh가 codex
  90초 연속 부재를 확인한 뒤 자동 발주(다른 세션 배치 사이 공백 오인 방지). **프로세스명이 아니라
  CommandLine의 " exec "로 판별할 것** — Codex 데스크톱 앱 상주 서버(app-server)는 codex.exe로 영원히
  떠 있어 이름만 보면 무한 대기한다(실사고). 검산 감사는 상위 모델
  6병렬(정답 오류 0·심각 = 사진 발주 대기뿐, 경미/제안 반영으로 종결). 기계 검사
  `node qa/check-exam-g2u4.mjs`, QA `PORT=<포트> node qa/e2e-exam-g2u4.mjs`(47검증 — 여섯 파트 문구·
  3×4+4×2 균형·사진 10장), 그림 눈검수 `qa/shot-exam-figs-g2u4.mjs`.
- **g2u7(전기와 자기) 150문항 — 첫 8레슨 과학 시험(19×6+18×2, 18은 L2·L7 관찰 소단원)**: 유형
  113(mcq+multi)/18(num)/19(word), word 3문항 레슨은 L1·L3·L7, pick 20 → 2×4+3×4 균형(전부 자동).
  그림은 elecFigures **미사용 예비 electronFlowFig 시험 데뷔**(전지-도선 갭 버그를 데뷔 전 shot 눈검수로
  적발·수정 — 미사용 헬퍼는 실렌더 이력이 없으니 데뷔 전 눈검수 필수) + examFigures g2u7 섹션 11종
  (elecRubExamFig 전하 이동·elecCanExamFig (−)막대 ㉠㉡판(레슨 (+)·(가)(나)와 부호·방향·라벨 교체)·
  elecScopeFig 검전기(자기완결 문두로 1문항만)·elecViExamFig 파라미터 V-I(dots는 점만 — 가이드 점선
  금지 g2u2 관행 계승)·elecViChoicesFig(정답 ②·①은 원점 미통과 함정)·elecTwoCircuitFig·elecPointsFig
  ㉠㉡㉢·elecFlowFig(예/아니요 각자 결론 칸 — A박스 관통 버그 눈검수 적발·수정)·elecLabelFig 명판·
  elecMotorExamFig·elecCoilCompassFig). **전동기 힘 문항은 사시도가 유일한 정답** — 자기장·전류·힘
  3벡터는 순수 평면 2D로 불가능(elecFigures motorFig의 힘↑↓ 표기는 코일 평면=화면 평면이라 부정확 —
  시험 미사용), 평행사변형 코일 사시도에 F=IL×B 외적 검산을 주석으로 남긴다. **전류 반전판(reverse)은
  전지 극까지 뒤집어 그린다**(화살표만 뒤집으면 극과 전류가 모순 — 눈검수 적발). 사진 12장
  (public/exam/g2u7 — 실험 장치 실사(니크롬선 회로·코일 나침반)는 "계기 표시창·다이얼 빈 패널, 숫자·눈금
  없음"을 프롬프트에 명시해 전 장 1발 합격, 물줄기 휨은 방향 조건 명시+눈검수 판정). 수치는 레슨 앵커
  (10/20/30Ω·3V→300/150/100mA·4V·200mA·1800W·5W·30W·4V→2V+2V) 전면 회피(15/5/60/24/25/35Ω·600W·
  40W×5초 등). word 유출 설계 원칙: **mcq 정의형과 word 같은 용어 금지**, 단원 중심어(전동기·전압)는
  완전 회피가 불가능하므로 **verbatim 구절만 끊는다**(감사 결론). 검산 감사는 상위 모델 8병렬
  (심각 1 = L6 '충전=화학' 5지가 레슨 퀴즈 보기 5개 직카피 + word와 기능 중복 → 에너지 효율 문항으로
  교체, 경미 = 레슨 binSort/curio 문구 잔존·num 목록끼리 4/5 판정 공유(e126↔e127 — 목록 항목을 전면
  분리)·판별 스킬 편중). **⭕ 판정 마커는 이모지라 시험 해설에선 ✓**(기존 시험 파일 관례 — 레슨 파일은
  ⭕ 잔존, 통일은 추후). 기계 검사 `node qa/check-exam-g2u7.mjs`, QA `PORT=<포트> node qa/e2e-exam-g2u7.mjs`
  (47검증 — 여덟 파트 문구·2×4+3×4 균형·사진 12장), 그림 눈검수 `qa/shot-exam-figs-g2u7.mjs`
  (+`qa/slice-shot.mjs`로 긴 샷 분할 확대 검수).
- **g2u8(별과 우주) 150문항 — 다섯 번째 중2 시험(8레슨, 19×6+18×2 — 18은 L4·L8)**: 유형
  113(mcq+multi)/18(num)/19(word), word 4문항 레슨은 L5·L6(용어 밀집), pick 20 → 2×4+3×4 자동.
  그림: photos/star 실사 15장 재사용(레슨과 질문 각도 전부 교체) + **신규 NASA 2장**(andromeda
  noao-m31·whirlpool heic0506a — fetch-nasa-star.mjs에 직링크 추가, 다운로드 후 눈검수·CREDITS 기재) +
  examFigures g2u8 섹션 8종(starParallax3Fig 시차 부채꼴·starShiftPairFig 6개월 2패널(정답이 그림
  간격 라벨과 같은 수치가 되지 않게 1.0″→0.4″ 세팅)·starBrightGridFig 1/4/9칸·starMagScatterFig
  색×등급 산점도·colorTempTrioFig·starGalaxyQuizFig ㉠㉡㉢ 기호판(galaxySideFig 라벨판은 위치 문항
  정답을 인쇄 — 시험 사용 금지, geoCycleQuizFig 계보)·starClusterMapFig(㉮㉯ 점 색 통일 — 색이 답의
  단서 금지)·starExpandArrowFig) + svgTable 등급 표 3벌(같은 표를 두 문항이 쓰면 한쪽이 shuffle:false
  answer=0이 되므로 **표를 벌수로 분리**). 사진 8장(exam/g2u8 — 풍선 팽창 전/후 xpair 쌍은 "같은
  풍선·같은 스티커 여섯, 간격만 벌어짐" 프롬프트로 1발 성공, 엄지 시차는 뒷모습 구도로 사람 허용).
  새로 확립된 관행: ① **word 정의문 ↔ mcq 문두·정답문 verbatim 전역 스캔을 저작 직후 메인이 1차로**
  훑고 감사가 2차(파일 간 포함) — 13건 선제 수정. 대표 사고형: word '제곱'이 같은 레슨 mcq·bogi·multi
  세 곳의 정답 보기에 그대로 인쇄된 허브형 유출(e38↔e28·e30·e33). ② **등급 수치 세트(2.5배·16배·
  100배)는 num이 선점** — 종합 multi에는 수치 없는 서술만 담는다(수치 관계 인쇄 = num 정답 유출,
  e52 재설계). ③ 수치 조합이 포화된 풀(L2: 2~6배·절반·1/25)은 보기 수치를 등록부처럼 관리해 남은
  조합(10배→1/100)만 종합형에 배정. ④ 시험 해설에 "다음 레슨" 같은 레슨 순서 참조 금지(랜덤 추출·
  복습 진입 모두 순서 무관). 검산 감사 상위 모델 8병렬(심각 1 = ①의 허브 유출, 경미 15 — 전부 수정
  반영, 정답 오류 0). 기계 검사 `node qa/check-exam-g2u8.mjs`, QA `PORT=<포트> node qa/e2e-exam-g2u8.mjs`
  (47검증 — 여덟 파트 문구·2×4+3×4 균형·발주 8장+NASA 2장 로드), 그림 눈검수 `qa/shot-exam-figs-g2u8.mjs`
  (+`qa/slice-shot.mjs` 분할 확대).
- **m1u6(수학 중1 Ⅵ 통계) 150문항 — 첫 수학 시험, 수학 시험 규격 1호(이후 수학 단원의 표준)**:
  ① **유형 비율은 수학 전용 60/30/10** = 90(mcq+multi)/45(num)/15(word) — 과학 75/12/13을 쓰지
  않는다(수학은 계산 단답이 자연스러운 문항이 많아 num 상향, 정의 용어가 적어 word 하향). 이 단원은
  150제(25×6)지만 **이후 수학 단원은 200제(레슨당 30내외)가 기준** — 풀 증량은 과학 u6 선례처럼
  시스템 수정 없이 가능. ② **난이도 태그 diff 신설**(types.ts 옵션 필드, 1 기초·2 표준·3 심화) —
  전 문항 태그, 분포 파일당 10/10/5(전체 40/40/20%). 추출 로직은 diff 미사용(레슨 균형 관행 유지,
  난이도 활용은 취약 드릴 후속 작업). 기존 과학 풀은 태그 없음(옵션이라 무영향). ③ **num은
  int/dec만으로 설계**(통계는 분수 답이 없어 numKind 확장 불필요 판정 — 분수가 필요한 단원이 오면
  그때 최소 확장). 상대도수 dec 답은 무단위라 unitLabel 생략 허용(check 스크립트가 int만 강제).
  ④ **그림은 ui/examFiguresMath.ts 분리 신설**(과학 examFigures.ts에 추가 금지 — 동시 세션 충돌
  방지, 이후 수학 시험 그림은 전부 여기): 파라미터형 5종(mExamStemFig 줄기와 잎·mExamTableFig
  도수/상대도수 표(A~E 빈칸 자동 강조·첫 행만 "N 이상 ~ M 미만" 전체 표기)·mExamRelPolyFig 두 집단
  상대도수 다각형(배열 합=1 검산 필수·정답 값은 라벨된 주눈금 위만)·mExamTornHistoFig 찢어진
  히스토그램(찢김 높이 42px 고정 — 실제 도수와 무관한 장식, freqs[tornIdx]에 실제 값 기입은 검산용)·
  mExamAxisPairFig 눈금 조작 쌍(편집 캡션 금지 — 판독 유출, showVals가 "같은 자료" 입증 장치)) +
  mathFigures 재사용(histoFig 새 파라미터 — **freqs 최대 ≤7로 설계**(yMax≤8이면 전 정수 눈금이
  라벨과 함께 그려져 "정답 수치는 눈금선 위" 충족), statDataFig·dotPlotFig — **dotPlot의 mean/median
  마커는 해석 문항 전용, 그 값을 계산하라는 문항엔 금지**). ⑤ 수학 언어 가드: MATH_GUIDE Ⅵ 금지어
  (산포도·분산·표준편차·계급값·경우의 수·확률) + '범위' 용어 미도입("가장 큰 값과 작은 값의 차"로
  서술), em대시 0(전 파일 기계 검사), 뺄셈은 U+2212, 변수는 `<i class="mv">`. ⑥ 교차 유출:
  기계 보조 스캔(수치+단위·word 용어·mcq 정답 문구 10자+)은 후보만 뽑고 수동 판정 — 단원 중심어
  (줄기·잎·도수·계급 등) 빈도 소음은 g2u7 원칙(verbatim 정의 구절만 끊기)대로 수용, 실질 1건
  (성질 합답형 bogi가 다른 mcq의 정답 명제를 문장째 인쇄)만 다른 참 명제로 교체. ⑦ 검산 감사
  Opus 6병렬(정답 재풀이 1순위): **150/150 재풀이 일치·정답 오류 0**, 심각 0, 경미 2(해설 속 파생
  계급이 레슨 드릴 앵커와 축자 일치 → 수치대 이동 / 같은 원리(눈금 확인)의 고치기·원인 문항 쌍은
  개념 수준 겹침 판정 → 수용). ⑧ QA: 기계 검사 `node qa/check-exam-m1u6.mjs`(수학 규격 쿼터·diff
  분포·em대시·Ⅵ 금지어 검사 포함), `PORT=<포트> node qa/e2e-exam-m1u6.mjs`(47검증 — 수학 지도 시딩
  viewSubject "math"+viewGrade "g1", 무료 레슨이 L1·L2뿐이라 무료 응시 오답은 앞 6문항(L1·L2 구간
  최소 3+3)에 배치해야 리뷰 점프가 페이월이 아닌 레슨으로 감), 그림 눈검수 `qa/shot-exam-figs-m1u6.mjs`
  (풀 파일에서 figure 문항 자동 수집 렌더 — 손으로 파라미터를 옮겨 적지 않는 자동화판, 분할 캡처는
  클립이 아니라 스크롤 방식). **e2e는 워크트리 격리로 실행**(detach worktree + node_modules 정션
  `cmd /c mklink /J` + vite 별도 포트 — 정리 시 정션을 rmdir로 먼저 제거한 뒤 worktree remove,
  아니면 원본 node_modules가 위험). 홈 수학 지도의 시험 노드·weakDrill 피커·findLesson/findUnit은
  등록(index.ts)만으로 전부 자동(수학 트랙 수정 0) — 인트로 단원 표기는 unit.roman "VI"가 그대로 뜬다. ① 기존 NASA 자산(public/photos/) 재사용이 1순위 —

  풀 파일 로컬 `pimg` 헬퍼(`photos/` 경로, ximg와 동형·lazy 금지). 레슨 hotspot이 쓴 사진이라도 문항
  각도가 새로우면 재사용 OK. ② 위상별 달·붉은 달·별 일주 궤적 같은 "정확한 모습이 채점 기준"인 실사는
  codex 발주 가능하되 **방향·모양을 프롬프트에 명시하고 눈검수에서 그 조건을 판정**(초승·상현 "오른쪽
  밝음" 성공 사례). ③ 시험 전용 다크 SVG는 examFigures u7 섹션(starSpinFig 파라미터 각도·planetOrderFig
  A~H·moonPhase8Fig ①~⑧·eclipseShadowFig 본영/반영) — spaceFigures 문법(밝은 반구=태양 쪽·반시계) 계승,
  다크 그림은 figureDark: true. num은 자연값 공식 계열(일주 15°/시간·연주 1°/일·주기 11년·위상 15/30일·
  궤도 기울기 5°)로 세팅만 자체 제작. 언어 가드: 케플러·남중·삭망월·백도 금지('천구'·'황도 12궁'은 레슨
  도입이라 허용). 일식은 태양 오른쪽(서쪽)부터·월식은 달 왼쪽(동쪽)부터 진행(천재 마무리 검증) — 진행
  방향 문항의 근거는 달의 서→동 공전. QA: `PORT=<포트> node qa/e2e-exam-u7.mjs`(47검증 — 여섯 파트
  문구·3×4+4×2 균형 추출·사진 8장 로드 포함).
- **m1u1(수학 중1 Ⅰ 수와 연산) 200문항 — 첫 200제 풀(17×8+16×4, 16문항은 L2·L5·L7·L9)**:
  ① **유형 비율 54/36/10** = 108(mcq+multi)/72(num)/20(word) — m1u6 60/30/10에서 num 상향(수와
  연산은 전 레슨이 자연수·정수 단답을 낳는 계산 단원). 레슨 쿼터가 17문항 = 9/6/2, 16문항 = 9/6/1로
  균일해져 기계 검사도 단순. ② **num 음수 정답 허용**(mathKit 넘패드 +/− 키, answer는 ASCII 하이픈
  "-3" — check가 int `-?\d+`·dec `-?\d+\.\d+` 강제). **무단위 순수 수 답은 unitLabel 생략이 기본**
  (m1u6의 int 단위 필수 규칙은 통계 전용 — 수와 연산은 개수·cm·℃류만 병기). ③ diff는 17문항 레슨
  7/7/3·16문항 레슨 6/6/4(전체 80/80/40 정확 일치). ④ **그림은 examFiguresMath m1u1 섹션 9종**
  (mExamCardsFig 수 카드(**6장이면 카드 42px — 50px는 뷰박스 300 오버플로 실사고**)·mExamSieveFig
  체 격자(소수 판정 내장)·mExamVennFig·mExamTreeFig(빈칸 ㉠ 점선 노드)·mExamLadderFig(나눗셈 검산
  내장 — **한쪽 몫이 첫 나눔수와 같으면 GCD가 중간 행에 인쇄되는 유출**: 76·114를 114·190으로 재설계,
  쌍 선정 시 부분곱≠몫 확인)·mExamPowChipsFig·mExamAreaSplitFig(넓이 값 미인쇄)·mExamPulseFig(정답은
  라벨 눈금 위)·mExamAbsArcsFig(비대칭 호)) + mathFigures 파라미터형 재사용(walkFig·stonesFig·
  numlinePointsFig — 레슨과 인자 교체). ⑤ 언어: Ⅰ 단원 **문자(x) 금지 → 미지수는 □·㉠**(check가
  mv 태그 검출), '교집합'은 레슨 정식 어휘라 허용(단독 '집합'만 lookbehind로 금지), mfmt는 ^□
  (비숫자 지수) 미지원 — 빈칸 지수는 서술 우회("2의 지수는?") 또는 수기 mx span. ⑥ 교차 유출 실질
  1건: e43 문두 "2²×23"이 e63(92와 69의 GCD)의 숨은 소수 연관을 인쇄 → e63을 106·159(→53)로 교체.
  판정 기준 확립: **단순 숫자 재등장(다른 문항 보기 후보·무관 문두의 같은 수)은 수용, 연관을
  "단정"하는 인쇄(분해식·정의문·그림 라벨)만 유출**(m1u6 ⑥의 수와 연산판). ⑦ 검산: codex exec
  (read-only) 레슨당 재풀이 12회 — **200/200 정답 재도출 일치·정답 오류 0**, 해설 결함 5(거짓 예시
  112×14, 서로소 예외 누락, 0 케이스 미포괄 2, 부호 뒤집힘 일반화)·word 복수 정답 1(e166 '유리수'
  칩: **word bank에 문장을 참으로 만드는 다른 칩 금지**)·mcq 중의성 1(e117 걷기 그림: 뺄셈식도
  성립 → 문두를 "덧셈식으로" 한정) 전부 수정. GPT와 갈린 1건(e191 "거듭제곱→괄호" 나열)은 Opus
  3심 — **앱 정본·한국 교과서 관례 나열이라 유지**+괄호 밑 보강 문장(판정 ii, 두 나열은 동치).
  ⑧ 분업 12병렬(브리프 = 프롬프트 전문+정본 파일+레슨별 앵커·소재 할당표, 요약 금지): **17문항급
  풀 저작은 64k 출력 한도 초과로 죽는다 → 파일 2회 분할 저장(Write 전반부+닫는 `];` → Edit 삽입)**
  이 재발 방지책. ⑨ exam.ts 파트 수사 배열에 '열한·열두' 추가(12레슨 인트로 "열두 파트"). 기계 검사
  `node qa/check-exam-m1u1.mjs`(쿼터·diff·금지어·em대시 + **num 정답 파일 내 중복 FAIL·파일 간 일치
  WARN 후보** + word 정답 중복·mcq 정답 문구 일치 후보), QA `PORT=<포트> node qa/e2e-exam-m1u1.mjs`
  (음수 num "+/−" 키 입력 경로·열두 파트 문구·1×4+2×8 균형), 그림 눈검수 `qa/shot-exam-figs-m1u1.mjs`.

- **m1u2(수학 중1 Ⅱ 문자와 식) 200문항 — 2026-07 개보수판(교과서 단원평가 대조 기반)**:
  9레슨 22×7+23×2, 유형 120/60/20, diff 전체 80/80/40. 대수 num은 음수 정수·유한소수 허용
  (저장값 ASCII 하이픈·노출 수식 U+2212), 무단위 값은 unitLabel 생략. ① **개보수 근거 = 출판사
  단원평가 대조**(비상 중단원 점검 2벌+미래엔 마무리+천재 대단원 점검, 48문항 분석): 교과서 계열은
  그림 문항 ~17%·분수 계수가 기초 문제부터 등장하는데 초판은 그림 2/200·분수 0이었다. 신작 29문항
  (분수 계수 계산·방정식 8, 자릿수 10a+b 2, 도형 그림 3, 두 방정식 같은 해, 해의 조건 매개변수,
  중괄호 전개 2, 값 비교형 3, 빈칸 식, 표 활용, 시간차 거속시, 예금, 문자 2개 표현)으로 교체하고
  그림을 16문항으로 확충. ② **diff는 레슨별 균일 쿼터를 폐기하고 내용 기준 재캘리브레이션**
  (MATH_GUIDE 규격 항목 참조) — 레슨별 확정값은 check 스크립트 specs가 정본. ③ **mfmt 분수 분자는
  하이픈만 지원(`+` 미지원)** — 분수꼴 저작은 뺄셈 분자로 설계한다((7x−5)/4는 되고 (3x+1)/2는
  그룹 기호로 렌더됨). ④ 그림은 examFiguresMath m1u2 섹션 6종 신작(mExamTileStagesFig 타일 단계·
  mExamBorderDotsFig 바둑돌 테두리·mExamLShapeFig ㄱ자 도형·mExamTriSidesFig 삼각형·
  mExamDistBandFig 거리 구간 띠·mExamEqStepsFig 등식 과정 상자) + 재사용 4종(mExamBalanceFig
  저울 — **상자 ≤4 제약이라 nx+c=w 꼴만 저울화 가능**, mExamTableFig 표, m2ExamRectXYFig 직사각형,
  mExamSquareChainFig 사슬). ⑤ `shot-exam-figs-m1u2.mjs`의 fullPage 캡처는 카드가 많으면 하단
  페인트가 얼어붙을 수 있다(사고 17 계보) — 백지로 나온 문항은 대상 id만 추려 부분 렌더로 재검수.
  QA는 `qa/check-exam-m1u2.mjs`(레슨별 diff specs 포함), `qa/e2e-exam-m1u2.mjs`,
  `qa/shot-exam-figs-m1u2.mjs`.
- **m1u4(수학 중1 Ⅳ 기본 도형·작도) 200문항 — 2026-07 개보수판(그림 12→56문항)**: 13레슨
  15×8+16×5. ① 개보수 근거 = 교과서 단원평가 대조(비상 Ⅳ 2벌+미래엔+천재 45문항 중 그림 82%):
  초판은 맞꼭지각·동위각·직육면체 ~40문항이 "A, B, C는 ↔AC 위에 왼쪽부터" 식 좌표 서술이었다 —
  기하 시험 문항은 그림 판독이 원칙, 서술 유지는 판별·세기·조건 나열형만. ② **기존 m4* 헬퍼 8종을
  전면 재사용**(m4TransversalExamFig에 parallel·pts 옵션, m4PerpDistanceFig otherB 옵션,
  mExamSolidFig labels 인자 추가 — 기존 호출 무영향 확장) + 신작 9종(mExamXAnglesFig 교차각·
  mExamAngleFanFig 평각 부챗살(perpAt 직각 마크)·mExamPointsLineFig 직선 위 점·mExamFoldFig
  **종이 접기(반사 계산으로 기하 정확 — 라벨 수치가 실제 각)**·mExamCubeNetFig 십자 전개도(격자
  꼭짓점 라벨, 접기 대응은 저작 시 손검산 의무)·mExamCutBoxFig 절단 입체·mExamSolidFig 겨냥도
  3종·mExamCopyAngleFig 각 옮기기·mExamTwinEquiFig 정삼각형 겹침 2모드). ③ 신작 11문항: 겨냥도
  세기 2(관념 문답 대체), 평각 분할·수직 각도 방정식 2, **전개도→꼬인 위치**(정육면체 한정 —
  초등 기지식이라 Ⅴ 선행 불요, 비상 도전 계승), 절단 입체 평행 모서리, 종이 접기 2, 작도 순서
  배열(ㄱㄴㄷ shuffle:false — **다른 유효 순서를 보기에서 빼야 복수 정답이 안 된다**, 천재 계승),
  정삼각형 겹침 SAS 2(㉮=60°·∠AFE=120° — 답·질문 각도 분리). ④ diff는 레슨 균일 쿼터 폐기
  (m1u2 계보) — 정본은 check 스크립트 diffQuota. ⑤ 같은 표준 그림(직육면체 ABCD-EFGH 등)의
  레슨 내 반복 사용은 의도적(교과서 관례) — check가 WARN으로 나열하지만 질문이 다르면 수용.
  ⑥ num 무단위 답("x의 값을 구하세요")은 unitLabel 생략 — check가 그 문구일 때만 면제.
  QA: `qa/check-exam-m1u4.mjs`(diffQuota 재캘리브레이션판), `qa/e2e-exam-m1u4.mjs`,
  `qa/shot-exam-figs-m1u4.mjs`(분할 3장 내장 — 하단 잘림 시 대상 id 부분 렌더로 재검수).
- **m1u3(수학 중1 Ⅲ 좌표평면과 그래프) 200문항 — 2026-07 개보수판(언어 감사+교과서 대조)**:
  9레슨 22×7+23×2(23은 L4·L9), 유형 120/60/20, diff 80/80/40 — 레슨 쿼터 준균일 유지(정독 결과
  태그 왜곡 미발견, 재배분 없음. e020 "단순 y좌표 읽기가 diff3"이던 인플레 1건은 문항 교체로 해소).
  ① **언어·맥락 전수 감사가 최우선 축**(m1u2 확정 결함 유형의 소급 — 이후 개보수의 표준 절차):
  제작자 조어("~식" 가짜 명사: 보정식·센서식·신호식·출력식·진단식·적재식류)와 실체 없는 장비 맥락
  (센서·드론·레이더·비콘·관측소·잠수함·컨베이어·측정 장치·냉각/급수 장치·물류소)을 전 문항에서
  검출·교체(21문항+그림 라벨 5spec). 판정 기준 두 가지 — ㉠ 중1이 일상에서 아는 사물·상황인가
  ㉡ 그 맥락이 수학 내용과 실제로 연결되는가(수식에 이름표만 붙인 장식은 실격). 교체 방향: 순수
  계산·판별 문항은 무맥락("다음 좌표평면에서/정비례 관계 y=ax에서")이 정답, 활용 문항만 교과서
  검증 소재(물통·물탱크·택배·주스·공책·택시·보드게임 점수·야구장 관람객·전동 킥보드). **단위도
  학생 어휘만**: Wh→%·L, ppm→명, %p 금지(절대량 차나 서술 비교로 우회), "사람·일" 금지(총량이
  드러나는 상황으로 재구성), "백 원 단위로 구하세요" 같은 억지 단위 조작 금지. 해설·core까지 함께
  교체(옛 소재 언급 잔존 시 실격). ② 교과서 대조(비상 Ⅲ 중단원 2벌+미래엔 마무리+천재 대단원,
  21문항 분석): 반복 확인 공백 5유형을 신작 8문항으로 보충 — 상황→그래프 개형 ①~⑤(e072, 3세트
  공통 최다 단골), 관계식→그래프 고르기(e129 정비례·e162 반비례, 천재07 계승 — 직선/곡선/원점 이탈/
  한 갈래 함정 혼합), 좌표 세 점 삼각형 넓이(e020, 축 나란 두 변), 정비례×반비례 교점(e175, 3세트
  공통), ab 곱 부호 사분면(e041, 비상 도전8+미래엔08), 반비례 정수 격자점 개수(e177, 미래엔09),
  반비례 물탱크 채우기(e147, 비상 기본4). "너무 어려운 문항" 우려는 기각 — 과다·선행 없음, 오히려
  교과서 도전급(교점·넓이) 공백이 실재. 보류: 반비례+직사각형 넓이(그림 상한)·속력-시간 그래프(1회
  등장). ③ 그림 44→48(check 상한 정확): 신작 헬퍼는 mExamRelChoicesFig 하나뿐(①~⑤ 미니 좌표평면
  카드 — **눈금이 없으므로 방향·원점 통과·갈래 수 같은 모양 특징만으로 정답이 유일**해야 하고
  기울어진 정도의 크기 비교를 근거로 쓰면 안 된다. 정답 ① 금지, e129는 ②·e162는 ⑤), 나머지는
  miniGraphRow(mathFigures 재사용 — 레슨과 kinds 조합·라벨·시나리오 전부 교체)·mExamPlaneFig·
  mExamRelationPlaneFig 재사용. ④ mcq 교체는 원본 answer 인덱스를 유지해 정답 위치 분포 보존
  (23/21/20/18/20). ⑤ 레슨 수치 앵커 회피는 원값뿐 아니라 **파생값 계열**까지: e194는 속력 10/5가
  레슨 8/4와 달라도 도출 쌍(15초·30초)이 레슨 드릴 120 km 케이스와 동치라 속력 세트를 재설계.
  QA: `node qa/check-exam-m1u3.mjs`, `PORT=<포트> node qa/e2e-exam-m1u3.mjs`,
  `PORT=<포트> node qa/shot-exam-figs-m1u3.mjs`(SHOT_DIR 지정 가능 — 분할 5장 내장, 하단 백지 시
  대상 id 부분 렌더로 재검수).
- **m1u5(수학 중1 Ⅴ 평면도형과 입체도형) 200문항 — 2026-07 개보수판(그림 3→44)**: 14레슨
  14×10+15×4(15는 L7·L11·L12·L13), 유형 120/60/20, diff 80/80/40 — 레슨 쿼터 유지(태그 왜곡
  미발견, 재배분 없음). ① 개보수 근거 = 교과서 대조(비상 Ⅴ 중단원 2벌+미래엔 06·07 2벌+천재
  대단원, 55문항 분석 — 교과서 도형 문항 ~70%가 그림인데 초판은 3/200, m1u4와 동일 진단):
  삼각형 내·외각의 "변 QR를 R 너머로" 좌표 서술 9문항을 그림 판독형으로, 다각형 각·원 부품·
  부채꼴 비례·회전체 프로필·입체 치수 계 34문항을 그림화(총 44). ② 신작 5문항: e030 오각형
  내각 그림 방정식(약한 "삼각형 수−대각선 수" 콤보 대체), e048 내각:외각=4:1 정다각형(미래엔
  13 계승), e090 정사각형+두 사분원 렌즈 색칠 72π−144(비상 도전11·미래엔 15·천재 04 — 3세트
  공통 확정 단골), e093 S=½rl 넓이(비상 기초4·미래엔 08 — 공백), e136 회전체→원래 도형 ①~⑤
  (천재 06 계승, shuffle:false·정답 ③). ③ 언어 감사(6호 기준 소급): 실격 2건(단면 스캐너·
  저장구)+분수 장치 톤다운. "전시-" 랩핑 과다(9곳)는 그림화 과정에서 실물·무맥락으로 다양화
  하되 실물 연결이 있는 소재(행성 모형 — 천재 09가 같은 소재 출제, 계기판·포스터 통·문진류)는
  유지 판정. ④ 신작 헬퍼 9종: m5TriAngleFig(밑각 2개로 실각 삼각형 자동 생성, 밑변 양쪽 연장
  외각 — **라벨 없는 ext는 연장선만 그려** 식별 문항의 정답 부위 강조 유출 방지)·m5PolyAngleFig
  (내각 목록 걷기 생성 — **마지막 두 변 길이는 닫힘 자동 역산**, 임의 변 길이로는 안 닫힌다)·
  m5CirclePartsFig(㉠ 표지 판독 — 뷰박스 226, 200이면 하단 호 라벨 클리핑 실사고)·
  m5CircleRatioFig·m5SectorXFig(각·반지름·호·넓이 라벨 선택형 — 역산 문항도 실제 각으로 렌더)·
  m5RotateFig·m5RotateChoicesFig(①~⑤ 카드)·m5SolidDimFig(원기둥/원뿔/구/반구/직육면체/원기둥
  속 구 2D 겨냥도 — 구하는 값은 "x cm" 라벨)·m5LensFig + 재사용 sectorCalcFig(파라미터형)·
  mExamSolidFig. ⑤ 평면 각 그림은 전부 **실제 각도로 렌더**(라벨 수치 = 그림 각, m1u4 접기
  계보) — 내각·외각 합을 저작 단계에서 손검산한 값만 spec에 넣는다. QA:
  `node qa/check-exam-m1u5.mjs`(--lesson=N 부분 검사), `PORT=<포트> node qa/e2e-exam-m1u5.mjs`,
  `PORT=<포트> node qa/shot-exam-figs-m1u5.mjs`(qa/shots/ 고정 저장 — 분할 4장).
- **m1u1·m1u6 검수(2026-07 — 클로드 저작 풀의 사후 감사)**: ① `check-exam-m1u6.mjs`가 CRLF
  작업 사본에서 0문항 파싱 → 17 FAIL로 **조용히 죽어 있던 것**을 발견·수정(readFileSync 직후
  `\r\n` 정규화 — autocrlf 체크아웃 뒤 검사기가 무증상 사망할 수 있으니 풀 검사 스크립트는
  정규화가 기본, m1u5 검사기 계보). ② 두 풀은 저작 시점에 3사 마무리 분석·앵커 회피가 헤더에
  내장된 채 만들어져 구조 결함 없음 — Ⅰ 5세트+Ⅵ 3세트 재대조로 확인(Ⅵ 공백 0, 노출면 조어 0).
  ③ m1u1 수정 3문항: e146 촬영 드론·수중 탐사 로봇 → 갈매기·물고기(6호 언어 기준 소급, 수치·답
  불변), e63·e79가 "숨은 큰 공통 소인수+두 수의 차 힌트"의 GCD/LCM 동형 스켈레톤 쌍둥이라
  각각 **세 수의 최대공약수(60·84·132→12)·세 수의 최소공배수(18·30·75→450)**로 교체(교과서
  세 수 유형 ×2 등장 공백 보충 — 세트는 l4 헤더의 교과서 회피 목록 42·126·140, 45·105와 충돌
  없게 신작). ④ 보류(1회 등장 퍼즐): 수 피라미드·삼각 마방진·연쇄분수 곱·10!의 지수·주사위
  역수·카드 3장 곱 최대. 검증: 두 check ALL PASS + 수정 3문항 스코프 tsc(전체 tsc는 다른
  세션의 진행 중 hook.ts 편집으로 대기).
- **m2u1(수학 중2 Ⅰ 유리수의 표현과 식의 계산) 200문항 — 첫 중2 수학 시험(20×10 균일)**:
  ① **유형 60/30/10 회귀** = 120(mcq+multi)/60(num)/20(word), 레슨당 12(mcq 9~10+multi 2~3)/6/2,
  diff 8/8/4. m1u1의 54/36/10을 따르지 않은 근거: L5~L10은 답이 "식"이라 넘패드(int/dec) 불가 문항이
  많고, num 30%는 지수·계수·차수·대입값 부품 규약으로 유지(조정 근거 기록 의무의 2호 사례).
  ② **그림은 examFiguresMath m2u1 섹션 7종 신작**(m2ExamDigitStripFig 자릿수 띠(자리 번호 포함,
  마디 강조 금지)·m2ExamJudgeFlowFig 판별 순서도(결론 ㉠㉡ 숨김, geoCycleQuizFig 계보)·
  m2ExamPowStripFig 곱 나열 칩(bot 주면 분수 꼴)·m2ExamRectSplitFig·m2ExamRectAreaFig(거꾸로 재기)·
  m2ExamBoxFig·m2ExamCylFig·m2ExamTrapFig — 문자 라벨은 font-style italic, 구할 값은 ㉠/?만) +
  mExamTableFig 재사용(마방진 용도로 헤더 생략·aria 옵션·㉠㉡ 강조 추가, 표 2벌 분리 관행 유지).
  ③ **mfmt 미지원 표기 3종의 수기 조립 표준**: 분모가 소인수 곱/지수 꼴인 분수는 mx-frac 구조 복제
  (fracDen·frac1 로컬 헬퍼, 분모에 <sup>), 빈칸 지수는 mx span, 순환소수 점은 cyc() 재사용 + 잘못된
  표기 함정 보기는 combining dot(U+0307) 직접 조합. ④ **검산 = codex exec 3병렬 묶음(read-only,
  레슨 3·3·4, `-o` 보고서는 리포 밖)**: 200/200 정답 재도출 일치·정답 오류 0, 실질 결함 16건 전부
  해설·중의성(대표: word bank에 정답의 상위 개념 칩 금지 — 단항식↔'다항식'·소인수↔'약수'가 문장을
  참으로 만듦 / "나올 수 있는 나머지" 문항은 실제 종류=이론 상한인 수(1/17)로 설계 — 1/13은 실제 6종
  ≠ 상한 12종 중의성). 검산 지시문에 mfmt·cyc 읽는 법을 포함해야 가짜 불일치가 없다(레슨당 Opus
  병렬 대비 고정비 절감, 전수 판정표(OK/불일치/의심+사유) 강제로 품질 유지). ⑤ **분업 사고 기록**:
  에이전트 3개(60/60/80) 중 2개가 세션 사용량 한도로 사망(1개는 64k 출력 한도) → 잔여 65문항 메인
  직접 저작. 64k 예방은 "응답당 도구 1개·호출당 문항 5개"(파일당 Write 1+Edit 3). 백틱 템플릿 해설은
  check 스크립트 explain 정규식이 ["`] 둘 다 받아야 한다. em대시는 메인 저작분에서도 재발(74건 일괄
  sed) — 저작 직후 파일 단위 grep이 정석. 기계 검사 `node qa/check-exam-m2u1.mjs`((?<!소)인수분해
  lookbehind 포함), QA `PORT=<포트> node qa/e2e-exam-m2u1.mjs`(47검증 — 열 파트 문구·2×10 균형·
  수학 지도 시딩 viewSubject "math"+viewGrade "g2"·무료 응시 오답은 L1~L3 구간 앞 6문항),
  그림 눈검수 `qa/shot-exam-figs-m2u1.mjs`(figure 문항 21개 자동 수집).
- **m2u2(수학 중2 Ⅱ 부등식과 연립방정식) 200문항 — 9레슨 200제(m1u2 배분 정확 계승: 22×7+23×2,
  23은 L8·L9 / 22문항 13/7/2×4+14/6/2×3 / diff 합 80/80/40)**: ① 유형 60/30/10 유지 —
  부등식의 해(x>3 꼴)·연립의 해(순서쌍)는 넘패드 불가라 num 60은 경계값·가장 큰/작은 자연수 해·
  자연수 해 개수·미지수 a·해 성분·x+y 합 부품으로 조달(numKind 확장 없이 충족, 조정 불필요 판정).
  ② **그림은 examFiguresMath m2u2 섹션 6종 신작**(m2ExamRangeBandFig 구간 띠·m2ExamTiltScaleFig
  기운 저울·m2ExamNumPtsFig 수직선 문자 점(미래엔 09 계보)·m2ExamGridPairFig 모눈 해 점(직선 금지
  관행의 시험판 — 파랑 ●/주황 ○, 점 목록은 전수 대입 검산 의무)·m2ExamElimFig 세로 가감(㉠ 가림)·
  m2ExamRectXYFig) + solLineFig(mathFigures2) 재사용(레슨 gt3·ge2 회피, lt/le/새 v). 레슨 Ⅱ 그림
  5종(eggRange·vsBar·gridSol·elimAlign·pheasant)은 **전부 고정형이라 시험 재사용 금지**(앵커 인쇄).
  ③ **격자 그림 문두는 "모눈 범위 안에 있는 해" 한정** — 격자 밖 자연수 해가 존재하면(x+2y=11의
  (9,1)) "해를 나타낸 것"이 부정확해진다(codex 지적 선제 반영). ④ **raw `<` 태그 함정의 기계 검사화**:
  부등호 든 plain 문자열의 `<b`·`<i`가 태그로 파싱되는 사고를 check가 소스 수준에서 잡되, 주석과
  mfmt("...") 리터럴을 제거한 뒤 스캔(오탐 방지). '직선' 금지어는 (?<!수)직선 lookbehind('수직선'이
  정식 어휘). ⑤ **저작 분업 성공 기록**: 에이전트 3병렬(레슨 3·3·3, 66~68문항씩) 전원 완주 —
  "응답당 도구 1개·호출당 5문항"(파일당 Write 1+Edit 4)이 m2u1 사망 사고의 재발을 막았다. em대시는
  이번에도 에이전트 저작분에서 2건 잔존(자체 검사 누락) — 메인의 파일 단위 grep이 이중 방어.
  ⑥ 검산 codex exec 3병렬(read-only, 레슨 3·3·3, -o 리포 밖): **200/200 정답 재도출 일치·정답 오류
  0**, 의심 12 전부 해설·문두 품질(오답 격파의 허구 경로 서술 8건이 최다 결함 유형 — **오답 발생
  원인을 지어내지 말고 "오답을 대입하면 어긋난다" 검증형으로 쓰는 게 안전**, e074 문두 조건 명시
  "추가 이용은 10분 단위"). ⑦ 기계 검사 `node qa/check-exam-m2u2.mjs`(esbuild 실로드 — 백틱 해설
  자연 처리, 22/23 배분표·문두 정확 중복 FAIL·동형 스켈레톤 WARN), QA `PORT=<포트> node
  qa/e2e-exam-m2u2.mjs`(47검증 — 아홉 파트 문구·2×7+3×2 균형), 눈검수 `qa/shot-exam-figs-m2u2.mjs`
  (figure 19문항 자동 수집).
- **m2u3(수학 중2 Ⅲ 일차함수) 200문항 — 10레슨 200제(m2u1 배분 정확 계승: 20×10 균일,
  mcq/multi 분할 10+2×8·9+3×2(l6·l9), diff 8/8/4×10)**: ① 유형 60/30/10 유지 — 좌표쌍·식(y=ax+b
  전체)은 넘패드 불가라 num 60은 기울기·절편(정수 설계)·함숫값 f(k)·평행이동량·교점 성분·미지수
  a·a+b 부품으로 조달(numKind 확장 불필요 판정 4연속), 분수 기울기는 mcq 보기(mfmt("{3/2}"))로
  우회. ② **그림은 lineFig(mathFigures2 planeSpec) 재사용이 1순위** + examFiguresMath m2u3 섹션
  신작 3종(m2ExamArrowMapFig 대응 화살표(한 원소 두 갈래=함수 아님)·m2ExamLineChoicesFig ①~⑤
  미니 그래프(부호 조건 모양 고르기, shuffle:false 세트·정답 ① 금지)·m2ExamSegPlaneFig 선분
  좌표평면(dots left 라벨 옵션 — 우측 끝 클리핑 방지)). **lineFig tri는 +run/±rise 수치를 항상
  인쇄** — 기울기·증가량을 묻는 문항엔 사용 금지. 그래프 읽기는 정답뿐 아니라 **풀이에 필요한 전
  판독값이 눈금 위**여야 한다(e155 두 양초 비교에서 한쪽 절편이 눈금 사이라 재설계된 실사고).
  ③ **저작 분업 사고 기록(4에이전트 60/60/40/40)**: 1개가 **유령 완주 2연속**(파일 없이 완료
  보고, 재개 지시에도 가짜 grep 출력) → 폐기하고 L7·L8 40문항 메인 직접 저작. 다른 1개는 완료
  알림 뒤 **수 분 지연 저장**(알림 시점 디스크에 파일 없음) — 에이전트 완주 판정은 보고문이
  아니라 **디스크 id 개수 grep**으로만. ④ 교차 유출 판정 기준 확립: 시험 중 노출면(문두·보기·
  bogi·그림)만 대상(해설·core는 리뷰 전용) — 실질 3건 수정(bogi 절편 단정 ↔ 같은 절편 식 구하기,
  문두 식 인쇄 ↔ 그 계수·절편 재구성 2건), 레슨 앵커식 재등장 보기 교체 8건. ⑤ 검산 codex exec
  3병렬(read-only, 레슨 3·3·4, -o 리포 밖): **200/200 정답 재도출 일치**, 불일치 1(e199 "한
  점에서 만나면 기울기 다름"이 x=m 세로선 반례로 부정확 → 문두를 '두 일차함수'로 한정)·의심 16
  전부 해설·core 품질(오답 격파 허구 경로 6건 최다 — 검증형 재서술, '모든 사분면 통과' 거짓 명제
  2건, core 판별 조건 과잉 일반화 2건) 수정. ⑥ **동시 세션 e2e 간섭 실사고**: 다른 세션이 풀
  파일을 편집할 때마다 vite HMR 풀 리로드로 e2e가 중도 사망("Execution context was destroyed")
  — 커밋 후 워크트리 격리(정션+전용 포트)에서 일발 47/47. 기계 검사 `node qa/check-exam-m2u3.mjs`
  (esbuild 실로드 — 20×10 배분표·mcq/multi 분할 명시·중2 Ⅲ 금지어(정의역·치역·공역·상수함수·
  이차함수·이차방정식·근의 공식·"x축의 방향")), QA `PORT=<포트> node qa/e2e-exam-m2u3.mjs`
  (47검증 — 열 파트 문구·2×10 균형), 눈검수 `qa/shot-exam-figs-m2u3.mjs`(figure 18문항 자동 수집).
- **m2u4(수학 중2 Ⅳ 삼각형과 사각형의 성질) 200문항 — 첫 기하 중2 시험(m2u3 배분 정확 계승: 20×10
  균일, mcq/multi 분할 10+2×8·9+3×2(l7·l9), diff 8/8/4×10)**: ① 유형 60/30/10 유지 — 기하 단원은
  각도(°)·길이(cm)·넓이(cm²) 자연수 답이 풍부해 num 60이 자연 조달(unitLabel 병기, 넓이는 위첨자
  cm², 조정 불필요 판정 5연속). 도형 명칭·합동 조건 이름 답은 mcq/word로. ② **기하 풀은 mfmt를 쓰지
  않는다**(m1u4·m1u5 관례 계승): ∠·△·선분 바는 geoKit `gsym()`, ≡·∥·⊥·▱·°·²는 유니코드 리터럴,
  각도 뺄셈의 −(U+2212)는 저작 시 직접 타이핑(mfmt 자동 변환이 없어 하이픈 사고 1건 — check가 잡음).
  ③ **그림은 examFiguresMath m2u4 섹션 파라미터형 13종 신작**(mathFigures2 Ⅳ 레슨 그림 15종은 수치
  고정형이라 시험 재사용 금지 판정): 전부 **실각 인자(apexDeg·B·C·angleB·th·phi·shape)로 좌표를
  계산**해 라벨-기하 일치를 구조적으로 보장 — m2ExamIsoFig(외각 ext·수선 foot)·m2ExamIsoChainFig
  (AB=AC=CD, ∠D=th/2)·m2ExamExtIsoFig(연장선 외각)·m2ExamRhPairsFig((가)~(라) 카드)·m2ExamTriCevFig
  (수선/이등분선/중선+세 글자 각 키 marks)·m2ExamCenterFig(외심/내심 — 항등식 ∠OBA=90−C·∠IBC=B/2로
  조건 각을 먼저 정하고 B·C 역산, feet 라벨 순서는 [AB발, BC발, CA발])·m2ExamCircumRightFig·
  m2ExamParaFig·m2ExamParaBisectFig(BE=AB 유도, ratio=BC/AB 일치 의무)·m2ExamQuadDiagFig(shape로
  atan 일치: rect h/w·rhom d2/d1, sq는 45° 필연값만)·m2ExamFamilyFig(관계도 ㉠㉡·노드 ㉮ 가림,
  variant diag — 레슨 quadTreeFig가 가린 칸과 다른 조합으로)·m2ExamQuadRowFig(ㄱ~ㅁ 미니 카드)·
  m2ExamEqAreaFig(twin/trap/para/bent 4모드). 같은 꼭짓점 호 2개는 g4marks가 좁은 각을 안쪽으로
  자동 스태거. 눈검수는 저작 "전" 샘플 갤러리(qa/shot-exam-figs-m2u4-sample.mjs — 반각 호가 반사각
  쪽으로 감기는 버그·라벨 충돌·오버플로 6건을 저작 전에 적발)와 저작 "후" 자동 수집 2단.
  ④ **word 복수 정답 사고 8건(이 단원 최다 결함 유형)**: 사각형 가족은 "빈칸을 참으로 만드는 칩"의
  방향이 **상위 분류**다(정사각형 답이면 마름모·직사각형·평행사변형·사다리꼴·다각형 칩 전부 위험,
  "~를 마름모라고 해요"에서 그 도형이 마름모이기도 하면 참) — 도형 이름 word의 bank는 비(非)사각형·
  비도형 칩으로 채운다. '교점'(외심·내심 답)·'수선'(수직이등분선 답)류 상위 일반어도 같은 함정.
  ⑤ 대각선 성질 문구는 교과서 3사 대조로 **"서로를 (수직)이등분한다"로 통일**("서로 다른 것을"
  표현 11곳 소급 — 비상·미래엔·천재·레슨 전부 "서로를"). ⑥ 외심·내심 각은 공식 문자열(2∠A·90°+½∠A)
  금지 — 해설은 이등변 세 조각·△IBC 내각 합 유도만(check가 "2∠"·"90°+½"·"½∠" FAIL). ⑦ 저작 분업
  기록: 에이전트 4개(60/60/40/40) 중 2개가 1시간 무출력(대형 설계 후 일괄 저작 시도 — 응답당 도구
  1개·호출당 5문항·"다음 5문항만 설계" 리듬을 프롬프트에 강제해 재기동) → 재기동 2개도 세션 사용량
  한도로 사망(l1·l2·l9 완주 후) → 잔여 l3·l10 40문항 메인 직접 저작(m2u1 계보). ⑧ 검산 codex exec
  3병렬(read-only, 레슨 3·3·4, -o 리포 밖): **정답 재도출 199/200**, 불일치 1(e056 "세 각이 같으면
  합동" 보기가 실제로는 ASA로 성립 — 여각 관계는 합동 전에 유도 가능해 복수 정답, 명백 거짓 보기로
  교체), 그림-라벨 항등식 위반 0(e048 카드 1건은 실각·인쇄 라벨 모순으로 사전 지적 — acute를 라벨과
  일치시켜 수정). 기계 검사 `node qa/check-exam-m2u4.mjs`(esbuild 실로드 — 20×10 배분표·중2 Ⅳ
  금지어(닮음·피타고라스·무게중심·중선·중점연결·등변사다리꼴·점대칭·삼각비·√·"역이 성립"류)·유도
  공식 문자열·figureDark 금지·num 전 문항 자연수 강제), QA `PORT=<포트> node qa/e2e-exam-m2u4.mjs`
  (47검증 — 열 파트 문구·2×10 균형, 워크트리 격리 일발 47/47), 눈검수 `qa/shot-exam-figs-m2u4.mjs`
  (figure 74문항 자동 수집 — 역대 최대 그림 비중 37%).
- **m2u5(수학 중2 Ⅴ 도형의 닮음과 피타고라스 정리) 200문항 — 첫 비균일 배분 200제(19×2+18×9,
  19는 L4·L10 두 기둥·word 1)**: ① 유형 60/30/10 유지 — 쿼터가 세트 3종(11/5/2×6·10/6/2×3·
  12/6/1×2), diff도 3종(7/7/4×8·8/8/2 L1·8/8/3×2)의 조합으로 합 120/60/20·80/80/40이 정확히
  떨어진다 — 배분 정본은 check specs(m1u2 계보). ② √ 금지 단원의 num 설계: 피타 수치는 트리플
  8종+자연수 배수 가족만, "제곱해서 N이 되는 양수는 □" 서술 표준. **트리플 슬롯 배정표**(브리프)로
  같은 트리플(배수 포함)의 파일 내 재등장을 저작 전에 차단 — 레슨이 8종 전 방향을 선점한 상태라
  배수 가족(21·28·35, 24·32·40, 15·36·39, 33·44·55…)과 미사용 방향((7,24)→25)으로 조달, 3·4·5
  원형은 비율 서술 소재만. 변 길이를 묻지 않는 모눈 넓이 과제(기울어진 정사각형 13 cm²)는 √
  미등장이라 규약 취지 부합 판정. ③ **그림은 examFiguresMath m2u5 섹션 17종 신작**(m2Exam 접두
  유지 — m5*는 중1 Ⅴ 선점) + m2ExamBoxFig 재사용: simQuadPair(내각 걷기 생성·닫힘 역산)·
  triPair(rot2·flip2 대응 난도)·triSplit(para/free/**swapped — s를 t·(AB/AC)²로 역산해
  ∠ADE=∠ACB가 실각**)·xCross(평행 ⟺ 비 동일 검증 — 다르면 마크 자동 생략)·rightAlt(높이
  √(bd·dc) 자동 직각)·paraLines·trapCut(**perp+shape right/iso로 피타 사다리꼴 HC 항등식 보장**)·
  midseg·midQuad·centroid(G=꼭짓점 평균·ef ⅔ 절단·g2 이중 무게중심·rightAt 빗변 중선)·
  pythaSquares(**정사각형 노멀은 제3꼭짓점 반대쪽 자동 판정** — 안쪽 뒤집힘 실사고)·rightTri(dual
  연쇄 AD²=a²+b²+d² 완전제곱 조합표)·gridRight(격자 안 판정식)·coneCut·solidPair(두 도형 합산 폭
  unit 제약 — 우측 잘림 실사고)·frame·sectorPair. 저작 전 샘플 갤러리 38렌더 눈검수로 겹침·잘림·
  뒤집힘 6건 사전 적발. ④ **word 유출 선제 수정 6건**(g2u8 ① 계보): mcq 정답 용어와 word 정답이
  같으면 word 쪽을 교체(AA→끼인각·평행사변형→중점연결정리 — e060 조건명 정답, e120 문두+정답
  보기와 충돌), 정의문 verbatim은 문장 프레임 교체(중심각 "모양을 정하는 각"·합동 "포갬"·무게중심
  "균형점"·빗변 괄호 정의 삭제). ⑤ 검산 codex exec 3병렬(read-only, 4·4·3, -o 리포 밖):
  **200/200 정답 재도출 일치·정답 오류 0**, 복수 정답 2(e038 보기의 미약분 동치 비 10:14 — 문두에
  "가장 간단한" 조건이 없으면 동치 비 보기는 전부 정답 / e081 순서 배열의 대안 유효 경로 — m1u4
  작도 계보), 해설 허구 경로·과잉 일반화·보기 불완결·figure 라벨 참조 13건 수정, 수용 1(e170).
  ⑥ 분업: 4에이전트(54/55/54/37) **전원 완주** — 긴 브리프는 첫 저장이 30분+ 지연될 수 있어
  "지금 즉시 첫 5문항만 Write" 넛지가 유효(2회 만에 전원 가동), 완주 판정은 디스크 grep(모니터
  20초 폴링). em대시는 이번엔 **메인의 헤더 주석 수정분**에서 5건 재발(일괄 치환 — 저작 직후
  grep은 에이전트·메인 모두의 의무). 기계 검사 `node qa/check-exam-m2u5.mjs`(비균일 specs 정본·
  중2 Ⅴ 금지어("역이 성립"류만 — 역수 오탐 방지·'좌표' 포함)·num 전 문항 자연수·CRLF 정규화),
  QA `PORT=<포트> node qa/e2e-exam-m2u5.mjs`(47검증 — 열한 파트 문구·1×2+2×9 균형·무료 오답 앞
  3문항 배치, dev 스모크 일발 47/47), 눈검수 `qa/shot-exam-figs-m2u5.mjs`(figure 70문항 자동
  수집 35%) + 저작 전 샘플 `qa/shot-exam-figs-m2u5-sample.mjs`.
- **m2u6(수학 중2 Ⅵ 확률) 200문항 — 시험 numKind frac 첫 도입(m2u2 배분 정확 계승: 22×7+23×2,
  23은 L8·L9 / 13(mcq 11+multi 2)/7/2×4(L1~L4)+14(12+2)/6/2×3(L5~L7)+13(11+2)/7/3×2,
  diff 9/9/4×7+8/9/6(L8)+9/8/6(L9))**: ① **frac 확장 = types.ts numKind 유니온 한 단어**가 사실상
  전부(m1u6 ③의 예고 이행) — mathKit이 이미 완비(AnswerKind frac·checkAnswer 값 동치·"↓ 분모"
  slash 키·value "a/b")고 exam.ts(kind 관통·checkAnswer)·weakDrill은 재사용이라 자동. **채점은 값
  동치 유지 확정**(3/6 입력도 정답 — 드릴 "값이 같으면 정답" 철학과 일관, 측정 대상은 확률이지
  약분이 아님). answer 저장은 기약 "a/b" ASCII+문두 "기약분수로"가 저작 표준(check가 gcd=1·문구
  기계 강제). num 배분: L1~L3 int(경우의 수 "가지")·L4~L8 frac·L9 dec("소수로"), 확률 0·1과 개수
  역산만 예외 int. e2e 넘패드는 "/"→"↓ 분모" 키 매핑, 고의 오답은 "9/9"(확률 답은 전부 1 미만).
  ② **두 주사위 합 조건 전면 소진 사태**: 레슨·훅·드릴이 합 3~7·9~12를 전부 선점(합 7은 recap
  최다 6/36 인쇄) — 시험은 합 2·8만 쓰고 차·곱·같은 눈·대소·"적어도 하나 6" 각도로 조달. 이렇게
  레슨이 표준 세팅을 소진한 단원은 회피표에 **남은 각도 목록**까지 브리프에 내장한다.
  ③ **그림**: mathFigures2 Ⅵ 재사용 4종 판정(pairGridFig는 pick=()=>false **빈 상태 전용** — 강조
  칸은 세기 유출(7호 ② 계보)·probLineFig 마커=값 위치 비례·restGridFig 라벨에 확률값 인쇄 금지·
  spinnerFig 균등 등분) + 재사용 금지 7종(diceEventFig "경우의 수 N"·branchFig 곱 결과 골드 박스·
  areaModelFig 겹침 칸수/전체(=정답) 인쇄·orGroups/converge/coinCases/flightTable 고정형) +
  examFiguresMath m2u6 섹션 신작 4종(m2ExamBranchFig 나뭇가지 시험판(곱 미인쇄·fold ㉠ 접기)·
  **m2ExamSpinnerFig 불균등 원판(중심각 실각 렌더, deg 합 360을 check가 기계 검증 — 계보 ⑦ "칸
  수가 아니라 넓이" 전용, 칸 이름은 채움색과 모순되는 색 이름 대신 모양(별·하트)으로)**·
  m2ExamAreaFig(곱 미인쇄 ㉠만)·m2ExamRoadsFig). 균등 spinnerFig의 "N칸" 배지는 그 수가 풀이의
  답이 되는 합산 문항엔 유출(e136 그림 삭제로 해소).
  ④ **세기/확률 쌍둥이 유출(이 단원 최다 결함 유형)**: 같은 사건을 경우의 수 파트(L1~L3)와 확률
  파트(L4~L8)가 나눠 가지면 한쪽 답이 다른 쪽 분자로 인쇄된다 — "적어도 하나 6"(11가지↔11/36)·
  "합 2 또는 8"(6가지↔1/6)·대소 비교(7/12 값까지 중복) 3쌍 적발·교체. 소재 분할표는 조건 유형이
  아니라 **사건 단위로 배타 배정**해야 한다. 파일 간 num 정답 값 중복 2건(7/16·7/30)도 수치 분산.
  ⑤ **word 20 배타 설계**: '확률'↔'상대도수' 상호 칩 금지를 check가 기계 강제(극한 서사로 문장이
  참이 됨), '계급값'은 중1 본문 미도입이라 오답 칩으로도 금지. "더한다↔곱한다" 배타 쌍은 같은
  bank 허용. word 빈칸 문장의 조사 결합도 검산("___(으)로"+"임의로" 조사 중복 실사고).
  ⑥ 검산 codex exec 3병렬(read-only, 레슨 3·3·3, -o는 D:\Brilliant Science\m2u6-verify\):
  **정답 재도출 200/200 일치·정답 오류 0**, 지적 = 문항 간 유출 2쌍(bogi 참 명제가 다른 문항
  정답을 인쇄 — e015ㄱ↔e012·e059ㄱ↔e006, ④와 별개 유형)·중의성 2(참가자/딱지 비중복 조건 누락·
  word 칩 "반드시"의 참 여지)·허구 오답 경로 다수(검증형 재서술 — 4호 ③ 재확인)·합곱 조건 생략
  일반화("서로 다른 장치니 곱한다" 류는 조건 본질("서로 영향을 끼치지 않을 때")로 교정) 전부 수정.
  ⑦ **분업 사고 기록**: 3에이전트(66/66/68) 전원 완주(5문항 리듬) 후 리테이크 중 2개가 세션
  사용량 한도로 사망 — 잔여 36건 해설 보강+multi 5지화 2건은 메인 직접(m2u1 계보). 리테이크
  사유 = **해설 250자 기준을 "태그 제거 순수 텍스트"로 명시하지 않아** 에이전트들이 마크업 포함
  길이로 계산(107건 미달), multi 보기 수를 브리프에 "4~5지"로 쓴 것도 사고 원인(시험 선택형은
  mcq·multi 모두 5지 고정). 기계 검사 `node qa/check-exam-m2u6.mjs`(esbuild 실로드 — 22/23
  배분표·중2 Ⅵ 금지어(여사건·시행·수형도·순열·조합·조건부·독립·기댓값·배반·표본·복원)·frac
  기약+문두+무단위·합곱 조건 이형 검출·m2ExamSpinnerFig deg 합 360·pairGridFig 빈 상태 강제),
  QA `PORT=<포트> node qa/e2e-exam-m2u6.mjs`(48검증 — 아홉 파트 문구·2×7+3×2 균형·frac 넘패드
  입력, 워크트리 격리 일발 48/48), 눈검수 `qa/shot-exam-figs-m2u6.mjs`(figure 25문항 자동 수집).

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
  codex 금지 확인 후). 상세는 MATH_GUIDE.md 중2 Ⅴ 표. QA: `PORT=<포트> node qa/e2e-m2u5.mjs`.
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
  screens/starGame(Ⅰ 보너스 게임), **styles/math.css**(ui.css를 건드리지 않는 수학 전용
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
  학년·목표 온보딩 → 홈. 홈 앱바 왼쪽 과목 상자(플라스크/π+▾)로 과목 허브 재진입. 우상단 프로필
  버튼은 제거(2026-07-16 프로필 진입 단일화) — 로그인·아바타 노출은 탭바 마이 아이콘(gnav)이 담당하고,
  로그인 화면 진입은 마이 > "계정 관리 · 로그인"이 유일 경로다.
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
- **comic panels의 img는 상대 경로만**("comics/g2u8l7/0.webp") — 렌더러가 BASE를 붙인다. spot.photo와
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

## 중2 과학 VI 동물과 에너지 제작 관례
- `g2u6`은 6레슨(L1 영양소·L2 소화·L3 순환·L4 호흡·L5 배설·L6 세포호흡/통합), L1~L3 무료·L4~L6 프리미엄.
  훅은 `hookBody.ts` 6종(breadonly·chewrice·pulse·deepbreath·peecolor·afterrun, `.body-action` 버튼→hookAsk).
  콘텐츠 `content/g2/unit6.ts`(752줄) + 공용 `ui/bodyKit.ts`(혈액·기체·영양소 색·`safePointerCapture`·`drawValve` 등) +
  `ui/bodyFigures.ts`(퀴즈·recap 도해). 테마 `body`(--subj-body #E23B4B), 지도 소품 stomach/heart/lung/kidney/cellDeco.
- **랩 6종은 전부 캔버스 드래그 조작형**(codex 1차본이 "버튼→CSS 클래스" 감상형 5종이라 재작성 — 플레이북 §0.1
  "개념을 손으로 조작" 기준). nutrientTestLab(시약병→시험관 드롭·가열), digestJourneyLab(영양소 토큰을 소화관
  DUCT 경로로 완주), circulationLab(적혈구를 두 순환 경로로 끌기+심장 탭), breathModelLab(고무막 SVG 드래그+버튼 3),
  nephronLab(알갱이를 여과→재흡수→분비 3단계로 끌기), bodyIntegrateLab(물질 토큰을 순환계 허브 경유 목적지로).
  규격은 circulationLab/nutrientTestLab 계승: `createLoop`+`fitCanvas`(DPR 1.75)·논리좌표 BASE_W=360·목표 3개
  `collect()`→`recordQuiz(true)`+`enableCTA()`·cleanup에서 loop·리스너·타이머 해제·`safePointerCapture` 필수.
- 과학 정확성: 여과막은 **혈구·단백질을 크기로 막고**(작은 물질만 통과), 포도당·아미노산은 **전부 재흡수**, 요소는
  분비/배설(정상 오줌에 포도당·단백질 없음). 소화효소 특이성(녹말=입·작은창자, 단백질=위·작은창자, 지방=작은창자).
  순환계가 모든 물질 운반(영양소=소화계·산소=호흡계→조직세포, 노폐물=조직세포→CO₂는 호흡계·요소는 배설계).
- **`.body-lab-canvas`에 `touch-action:none` 필수**(body.css) — 없으면 실기기에서 드래그가 페이지 스크롤로 샌다
  (기존 circulation·nutrientTest도 놓쳤던 공용 버그, 한 규칙으로 세 랩 동시 수정).
- **어두운 무대 위 상자·토큰 라벨 대비 규칙**(bodyIntegrateLab 교훈): 밝은 hi 스톱을 몸통에 쓰면 흰 글자가 묻힌다
  → 몸통은 `mid→lo`(진한 톤), hi는 얇은 상단 키라이트로만, 라벨은 흰 글자+어두운 그림자. **heart 계열은
  `heartHi`/`heartLo` 색키가 없으니 `organHi`/`organLo`로 매핑**(빠뜨리면 fallback 회색).
- **e2e는 `qa/e2e-g2u6.mjs`**(6레슨 실플레이): 캔버스 랩은 논리좌표(360)를 `rect.width/360`로 화면좌표 변환해
  canvas에 `PointerEvent`를 직접 dispatch(합성 포인터라 setPointerCapture가 흘려도 리스너가 canvas에 있어 동작),
  목표 칩 `.pn-badge.body.on` 수로 `expectGoals` 결정 판정. nephron은 여과→재흡수→분비 순서 강제로 슬롯 좌표 예측
  가능. **동시 세션 codex가 파일을 쓰면 HMR 풀리로드로 `window.__g2u6E2E`가 증발(사고 #12)·vite가 특정 모듈만
  스테일 캐시** → 검수 캡처는 **워크트리 격리(별도 포트 dev 서버)**로 돌리거나 codex exec 부재를 확인하고 실행.
- **이미지 발주(준비 완료·미실행)**: `qa/body_prompts.txt`(스틱맨 개념 컷 6장 public/body/cuts + 해부 교육
  일러스트 6장 public/body/figs — 둘 다 글자 금지) + `qa/order-body.sh`(codex exec 순차 3배치, **병렬 금지**).
  `process-geo.mjs` ASPECT_DIRS에 두 폴더 등록됨. **하이브리드 방침**: 해부 구조(소화계·심장·콩팥단위·허파꽈리)는
  발주 일러스트로, 경로도·화살표·모식도(이중순환·여과 방향·통합)는 라벨이 본질이라 SVG 유지.

## 사회 트랙 — 사회 Ⅰ(세계화 시대, 지리의 힘) 제작 관례 (2026-07-18 구축)
- **과목 배선**: SubjectId "soc"(과학 sci·수학 math와 병렬), 단원 id `s1uN`/`s2uN`(레슨 `s1uNlM`) —
  subjectOfUnit은 접두사 s로 판별. content/soc/(curriculum·unit1), 테마 `world`(트래블 오렌지 #E8590C),
  **styles/soc.css**(사회 전용 시트 — 훅 hs1-·기함 wpl-·connectLab cnl-·tableLinkLab tll-, latSunLab은 공용
  클래스만). 지도 데코 = 세계 여행 준비물 5종(globeDeco·passportDeco·planeDeco·compassRoseDeco·suitcaseDeco).
  과목 허브(subject.ts)는 3과목 활성, 홈 앱바 과목 상자 아이콘은 soc → globe.
- **상호작용 문법(사회 정체성)**: 자연법칙 시뮬레이션이 없으므로 **배치·판독·추론·분류**가 랩 문법이다
  (성취기준 동사 = 추론·파악·조사). 서사형+작은 판단 상호작용이 기본값(수학 Ⅵ 통계 노선의 사회판) —
  기함 worldPlaceLab(배치)·latSunLab(유일한 인과 랩)·connectLab(시대 비교)·tableLinkLab(규모 판독)이 기준.
- **세계지도는 실데이터만(대륙 손그리기 금지)**: `qa/gen-worldmap.mjs`가 Natural Earth 110m(unpkg
  world-atlas topojson 직다운·자체 디코드)+쾨펜 Kottek 2006 ASCII 0.5°(VU Wien zip)를 →
  `src/ui/worldMap.generated.ts`(육지 path·1° 기후 판정 격자 digits 문자열·climateAt/lonLatOf)와
  `public/soc/climate.webp`(기후 색 오버레이 — Chrome 캔버스로 셀 페인트)로 굽는다. 오버레이는 SVG에서
  **육지 path로 클립**해 해안선이 벡터로 떨어진다(래스터 경계 숨김). **날짜변경선을 넘는 링(유라시아
  본토 축치·남극·피지)은 경도 언랩 후 ±360° 복제**가 정답 — 버리면 대륙이 통째로 사라진다(실사고).
  기후 6분류 = 쾨펜 A~E→열대~한대 + 고산 규칙(|위도|≤25의 Cfb/Cwb/ET/EF + 티베트 상자의 ET/EF).
  출처는 photos/CREDITS.md(Natural Earth PD·Kottek 인용 조건).
- **worldPlaceLab(기함) 판정**: 좌표→기후는 데이터 그대로가 진실이되, **근접 스냅(snapDeg — 순록 6°·
  기타 3°)** 필수. 쾨펜 냉대선이 중앙 시베리아에서 북위 75°까지 올라와 툰드라 띠가 손가락보다 얇다
  (plateMap 판정 폭 관행의 기후판). 스냅 실패 시에만 기후별 오답 코미디 토스트(WRONG 표 — 오개념 교정형).
  바다 = 풍덩 스플래시. 데이터가 통념과 어긋나는 지점 메모: 마드리드 내륙 = BSk 건조, 서울 = Dwa 냉대
  (쾨펜 지도 관행 — 사회과부도와 일치, 남부 해안만 온대), 남극은 지도 크롭(y 14~414)으로 제외.
- **사회 훅 6종**은 hookSoc.ts(threecities·stilthouse·skyroute·avocado·maasai·ilovenyc) — 실지도가
  필요한 장면(skyroute)은 WORLD_LAND_PATH를 재사용한다. 스틱맨 개념 컷은 public/soc/cuts(u1lN 6장,
  qa/order-soccuts.sh·soccuts_prompts.txt — 스타일 블록 A 공용).
- **e2e**: `PORT=<포트> node qa/e2e-soc1.mjs`(43검증 — 홈 지도·훅 6장면 실조작·latSunLab 원호 드래그·
  기함 가로 배치(오답 코미디+스냅 포함)·connectLab 세 시대·tableLinkLab 접시 탭·recap 미니아트+more·
  컷 로드·전 퀴즈). 함정: SVG `<g>` 탭 대상은 `.click()`이 없다 — MouseEvent 디스패치로(사고 기록).
  figTabs의 `.seg`는 `.figtabs` 카드의 형제, pairMatch는 CTA 없이 완주 시트(onContinue)로 진행.
  눈검수 `PORT=<포트> node qa/shot-soc1.mjs`(홈·훅·기함 세로/가로·개념 컷·recap 펼침·그림 문제 7샷).
  프리뷰 하니스 rAF 프리즈 환경에서 캔버스 랩(latSunLab) 검증은 이 e2e(실 Chromium)가 확정 경로.
  **e2e의 합성 dispatchEvent는 히트테스트·오버레이 가림을 우회한다** — "클릭이 안 된다"류 실기기 리포트는
  `qa/probe-wpl.mjs`(회전+터치)·`qa/probe-wpl-native.mjs`(가로 마우스) 실입력 프로브로 재현한다.
  기함 무응답 방어 3종(실기기 리포트 후 보강): 토큰 없이 지도 콜드 탭 = 안내 토스트(첫 사용자의 최초
  조작이 무반응이면 고장으로 읽힘), pointercancel은 판정 없이 드래그 원복(유령 배치 방지),
  rotateStage 동적 import 실패 시 helper 안내(스테일 dev 캐시에서 버튼이 조용히 죽는 것 방지).
  **SVG 안에 svg 문자열 아트를 중첩할 땐 width/height를 명시** — 없으면 부모 뷰포트의 100%로 커져
  "지도만 한 순록" 실사고(정착 마커). HTML 임베드는 CSS가 크기를 잡아 무증상이라 더 위험하다.
- **사회 Ⅱ(아시아, s1u2) 완성 — 대륙 단원 공통 문법 확립(2026-07-18)**: 8레슨(무료 3+프리미엄 5,
  중단원 4×주제 2와 1:1). 이후 Ⅲ~Ⅵ(유럽·아프리카·아메리카·오세아니아)은 아래 문법을 그대로 재사용한다.
  - **대륙 데이터는 `ui/continentMap.ts`의 `ContinentDef`가 단일 진실 공급원**: 크롭 뷰박스(1000×500
    equirect 좌표)+지역 러프 폴리곤([lon,lat])+앵커+대표 도시(교과서 판서 표)+힌트 아이콘+trait(오답
    코미디 소재)+outsideMsg(대륙별 이웃 지리 분기). 새 대륙 = ContinentDef 하나 추가가 전부.
  - **기함 `regionPlaceLab`(파라미터형 지역 배치 랩)은 세로 인라인** — 대륙 하나는 세로에 넉넉해
    rotateStage 불필요(Ⅰ 세계지도와 다른 점). 판정 순서 = 목표 폴리곤 pip → 경계 3° 스냅 → 바다
    풍덩(climateAt 0) → 다른 지역이면 오답 코미디(동적 생성: 놓인 지역 정체+목표 방위) → outsideMsg.
    조작 2문법 계승(드래그=window 리스너+fixed 고스트 / 탭-탭=click detail 0 무장 → 지도 click 판정 —
    합성 el.click()이 detail 0이라 e2e도 이 경로). 지역 채움·경계·힌트는 전부 육지 클립(wpl 문법).
    특징 안경 = 기후 안경의 Ⅱ판(지역 앵커에 연한 색+특징 아이콘 힌트). 지역 라벨 스트로크 이중 텍스트,
    아이콘에 글자로 읽히는 형태 금지(유정탑 A자 실사고 → 드럼+방울로 교체).
  - **monsoonLab**: WORLD_LAND_PATH를 Path2D 크롭 스케일로 캔버스에 그린다(캔버스 랩에서도 실데이터
    대륙 원칙). 계절 토글 → 흐름장 반전(여름 수렴·겨울 발산)+파티클 색/태생 교체, 관찰 2.4s×2+판정
    2지선다로 목표 3. **pyramidLab**(소형 자료 해석 — Ⅵ 통계 서사형 원칙의 사회판): 데이터는 UN 근사를
    비상 34쪽 표 앵커 값과 정합시켜 내장, 판정은 그래프 위 존(유소년/청장년/노년·남/여) 탭만.
  - **문화경관 실사풍 발주 표준 신설**(qa/soc2_prompts.txt 스타일 블록 P): "generic archetype, NOT a
    specific famous landmark" + 글자·간판 금지 + 사람은 원경만. 종교 건축(모스크 돔+미너렛·고푸람·
    사원·성당) 고증 눈검수 통과, public/soc/asia(ASPECT_DIRS 등록). 확보 실사는 figTabs 4탭·퀴즈
    figure(aimg — lazy 금지 로컬 헬퍼)·concept figure·hotspot spot.photo·recap more 뒤 `+ aimg()`로 재사용.
  - **홈은 카드 캐러셀이라 선택 단원의 지도만 렌더** — e2e 노드 검증은 `.unit-tab` 전환 후 세야 한다
    (14개를 기대한 실수). UNIT_THEME·UNIT_DECOR에 단원 등록 필수(s1u2도 world 테마, 데코는 단원 서사
    세트 — 아시아는 설산→벼논→낙타→홍등→돛단배 "대륙 횡단" 순).
  - QA: `PORT=<포트> node qa/e2e-soc2.mjs`(53검증, `ONLY=s1u2l1,…` 부분 실행 지원) ·
    실입력 프로브 `qa/probe-rpl.mjs`(Playwright 실 마우스 — 드래그·탭-탭·안경·오답 토스트) ·
    눈검수 `qa/shot-soc2.mjs`(9샷). 종교 서술은 4종교 동등 비중+갈등은 교과서 범위(존재+공존 노력)만,
    퀴즈 오답 보기에 종교 희화화·우열 금지(전 문항 준수 확인).
  - **소급 수정(2026-07-18, 실사용 피드백)**: ① L2 지형 hotspot 스팟 6점이 눈대중이라 전부
    어긋남(히말라야 점이 중국 중원 위) → 검산 공식으로 교체 + 지형도만 `mapShell pad 12` 확장
    (뷰박스 "557 76 372 224" — 조산대 남단·카스피해 여백). 스팟 % 검산 규칙은 Ⅲ에서 확립한
    "(svg좌표−뷰박스 원점)/치수, 눈대중 금지" 그대로 — **L5 인구 점 지도 스팟 4점도 같은 병**이라
    함께 검산 교체(점 클러스터 위: 인도 북부·화북·자와·아라비아). ② u2l1 대륙 퍼즐 컷이 아프리카형
    덩어리로 나옴 → 아시아 실루엣 특징(가로로 넓게·인도 삼각 반도·아라비아 반도·동남 열도 호·
    "NOT Africa")을 프롬프트에 명시해 재발주(qa/order-soc2-fix.sh). **발주 컷의 대륙·지도 실루엣은
    모양 특징을 문장으로 명시**해야 한다 — "one big continent"류 두루뭉술 지시는 아무 대륙이나 나온다.
    ③ 기함도 **가로 모드 전환**(`ASIA.wide: true` — 세로 지도가 작다는 피드백. e2e-soc2·probe-rpl·
    shot-soc2를 가로 문법(mapPoint 역변환)으로 갱신 — 이제 세로 인라인 대륙은 없고, 경로는 세로형
    대륙(아프리카·아메리카) 후보용으로 유지). ④ monsoonLab 겨울 입자를 낙하 점 → **흐름 방향 바람
    줄무늬**로(모래빛 점이 비·눈으로 오독 — 유체 입자는 화살표와 같은 결로 누워야 바람으로 읽힌다).
    ⑤ 흰 헤더 패치 잘림 2건(달력 훅 월 표기·singaporeFig "공휴일 달력" — 라운드 폭만 가리고 글자는
    밴드 중앙에), 산업 지도 범례에 아이콘 삽입(빈 원만 있으면 "모양이 안 보인다")·legend 밴드까지
    바다 채움(mapShell), L8 두바이 사진을 해당 용어("자원 의존 낮추기") 뒤로 재배치(그림은 제 용어
    바로 뒤에 — 순서가 어긋나면 "왜 여기 있지"가 된다).
- **사회 Ⅲ(유럽, s1u3) 완성 — 대륙 공통 문법 첫 재사용 검증(2026-07-18)**: 7레슨(무료 3+프리미엄 4,
  미래엔 주제 6 + 지형·기후 분할). **ContinentDef(EUROPE) 추가만으로 regionPlaceLab이 그대로 동작** —
  오답 코미디(동적 방위)·바다 풍덩·outsideMsg 분기·스냅 전부 파라미터로 통했다. 단 결함 3건 소급 수정:
  ① 목표 칩 "다섯 지역"·완주 문구 "다섯 조각" 하드코딩 → `koCount()`(지역 수 동적) ② `${cont.name}는`
  조사 하드코딩 → `topicJosa()`(받침 은/는 계산 — "유럽은") ③ 지역명·도시 라벨 svg px 고정 →
  **라벨 스케일 `LS = crop.w/348`**(아시아 기준 — 유럽 244 크롭에서 라벨이 1.4배 커져 겹친 실사고) +
  `ContinentCity.labelDy`(밀집 도시 라벨을 도트 아래로 내리는 오프셋 — 스톡홀름·프라하) 신설.
  라벨 배치는 데이터 문제다: 앵커는 도시 라벨과 세로 10px(svg) 이상 떼고, 눈검수 샷으로 확정한다.
  Ⅳ~Ⅵ는 이제 데이터 추가가 정말 전부다.
  - **기함 가로 모드(`ContinentDef.wide`, 사용자 피드백 2026-07-18)**: 크롭 종횡비 2:1을 넘는 대륙
    (유럽 2.26:1 — 세로 인라인에선 지도가 납작)은 `wide: true`로 표시하면 regionPlaceLab이
    worldPlaceLab 문법(세로 미리보기 카드+진입 버튼 → rotateStage 가로 무대)으로 열린다 —
    판정·연출 함수는 두 모드 공용, 입력 배선(세로 window 리스너 ↔ 가로 stage+rt.mapPoint)과
    레이아웃만 갈린다. 재진입 시 배치 상태 복원(paintRegion), 고스트는 무대 안 absolute
    (`.rpl-ghost.in-stage` — 회전을 따라 글자가 바로 선다). 오세아니아도 wide 후보.
    e2e·probe는 e2e-soc1 worldPlace의 **mapPoint 역변환**(native면 그대로, 회전이면
    x=right−ly·y=top+lx) 문법을 쓴다. 세로 `.rpl-pill`은 흰 필이 밝은 지도에 묻히던 것을
    다크 네이비로 교정(밝은 배경 위 상태 필은 토스트와 같은 다크 계열이 정답).
  - **러시아·튀르키예 경계 판단**: 두 교과서 모두 러시아(모스크바)를 **동부 유럽에 명시** → 동부 폴리곤을
    우랄(60°E)까지 덮는다(Ⅱ의 "다섯 지역 밖" 러시아 관례와 반대 — 대륙마다 교과서 지도가 정본).
    우랄 너머·튀르키예/캅카스·북아프리카는 outsideMsg 분기. 크롭 (430,50,244,108) — 아이슬란드처럼
    떨어진 섬은 지역 폴리곤이 사이 바다를 덮어 흡수(동남아 섬 선례). 신규 폴리곤은 esbuild 실로드
    검산 스크립트(도시 in-poly·앵커 육지·겹침 0·크롭 포함)를 먼저 돌리고 랩에 태운다.
  - **westWindLab(신규 소형 랩)**: monsoonLab과 대구 — 계절 토글 대신 **"난류가 없다면?" 가상 실험
    토글**(모형 명시)이 심장. 편서풍 입자가 난류 채널 위에서 온기를 머금는 연출 + 캔버스 하단
    온도계 패널(서울 vs 런던 1월, OFF면 런던 모형값 하강). 관찰 목표는 rAF 경과 기반이라 프리뷰
    프리즈 환경에선 안 켜진다 — 검증은 e2e(실 Chromium)가 확정 경로(latSunLab 관례).
    **흐름 속도 위계(사용자 피드백)**: 바닷물(난류)은 바람보다 뚜렷이 느리게 — 화면 기준 난류
    ≈8px/s(채널 편도 30~50초) vs 편서풍 ≈26px/s의 약 1:3. 크롭이 좁아 화면 확대율이 큰 랩일수록
    같은 svg px/s가 빨라 보이니, 유체 연출 속도는 svg가 아니라 **화면 px/s로 검산**한다.
  - **도시 단원(03-02) 문법 확정 — 새 스텝 0**: concept(유형 5 term) → figTabs(유형별 실사 5탭) →
    binSort(도시 카드→유형 4통) 재사용으로 충분하다(자연법칙 없는 "유형 탐색·비교"의 표준).
    Ⅳ~Ⅵ 도시·인문 소단원은 이 3종 세트를 그대로 쓰면 된다. 지속가능 도시는 binSort(노력 4분류)
    + Ⅰ단원 쿠리치바 "그 도시 기억나요?" 참조.
  - **통합·분리(03-03) 중립 가드 구현**: 분리 요인은 교과서 요인(언어·문화 정체성+경제 격차)만
    사실 서술, figTabs 3지역(스코틀랜드·플랑드르·카탈루냐) 동등 비중, recap은 "어느 쪽이 옳은가가
    아니라 원인·영향"으로. **L7 훅은 깃발 대신 대표팀 유니폼 색**(북아일랜드 기 논쟁 회피 —
    민감 상징이 필요하면 논쟁 없는 대체물로 우회하는 게 관례).
  - 발주 표준 P 유지 확인(유럽은 랜드마크 유혹 최대 — 전부 "generic archetype" 프롬프트로 1발 합격,
    qa/soc3_prompts.txt·order-soc3.sh, public/soc/europe → process-geo ASPECT_DIRS 등록).
  - QA: `PORT=<포트> node qa/e2e-soc3.mjs`(ONLY= 부분 실행 지원) · 실입력 `qa/probe-rpl3.mjs`(유럽
    크롭판) · 눈검수 `qa/shot-soc3.mjs`(9샷).
  - **전면 감사(2026-07-19, Ⅱ 오류 클래스 4종 소급 점검 — 심각 0·경미 4 수정)**: 감사 문법 =
    ① 전 스텝 샷 `qa/audit-shots-soc3.mjs`(훅 상태별·기함 오답/완료·figTabs 전 탭·recap 카드별 more·
    그림 문제 전부, 173샷) ② 좌표·라벨 기계 검산 `qa/audit-soc3-geo.mjs`(도시 in-poly·앵커 육지·겹침 0·
    스팟%↔그림 소품 교차 + **라벨 상자 근접 추정**) ③ 교과서 대조는 텍스트(pymupdf 추출)만이 아니라
    **지도 페이지를 pymupdf 렌더로 눈대조**(기후 채색처럼 본문 문장에 없는 사실은 지도가 정본)
    ④ 발주 이미지 전수 임베드 대조(prompts.txt 발주 목록 ↔ 소스 grep — whitehouse·tram 2장 임베드 누락을
    이걸로 적발). 수정 4건: 남부 앵커 이베리아→그리스+바르셀로나·바르샤바 labelDy(도시 라벨끼리도
    위/아래 층을 나눈다 — 같은 높이 인접 라벨은 한 단어처럼 읽힘), euroClimateFig 한대 띠(스칸디나비아
    산줄기+북극해 연안) 추가·한대색 진하게(#7E8EB4 — 바다색과 혼동)·노르웨이 해안 서안 해양성 연장,
    해설 속 제작자 시점 문구("두 책의 공통 서술") 제거, 발주 2장 recap more 뒤 eimg 임베드.
    동시 세션 충돌 시 검증은 **워크트리 격리**(HEAD+감사 수정만 적용, node_modules 정션+전용 포트)가
    확정 경로 — 혼합 트리 dev 서버는 다른 세션 WIP에 라우터가 깨질 수 있다.
- **사회 Ⅳ(아프리카, s1u4) 완성 — 대륙 공통 문법 세 번째 사용·첫 세로 인라인(2026-07-19)**: 8레슨
  (무료 3+프리미엄 5, 중단원 3+3+2). AFRICA ContinentDef 추가만으로 기함 동작(랩 본체 소급 0).
  - **wide 판단은 실측으로**: 아프리카 크롭 1.01:1 — 두 모드 실표시 실측(390px 뷰포트) 세로 344px vs
    가로 268px로 세로 인라인 확정(납작 크롭일수록 가로가 유리했던 것 — 정사각형은 세로가 크다). 판단
    근거 수치를 ContinentDef 주석에 남긴다. 세로 인라인 `.rpl-pill`은 **우상단**(좌상단은 크롭 좌상단
    도시 도장(카사블랑카)을 덮는 눈검수 실사고 — 세로 대륙은 현재 아프리카뿐이라 소급 무해).
    마다가스카르는 다섯 지역 밖 outsideMsg 분기("본토 기준" 안내 — 러시아 관례의 Ⅳ판).
  - **rainBeltLab(신규 소형 인과 랩)**: monsoonLab·westWindLab 계보 — 계절 토글(1월↔7월)로 비 띠
    (적도 부근 비구름 띠 모형)가 남북 이동, climateAt 1° 실데이터 셀을 오프스크린 3장(기본/북사바나
    우기/남사바나 우기)에 베이크해 우기·건기 색 교대를 알파 블렌드로. 사바나 근사 = 열대(1) 셀 중
    |lat|>4.5°('모형' 캡션 명시), 판정 2지선다(msn 문법) + 세렝게티 누 떼 연출(훅 대이동 회수).
  - **실물 우선 원칙 확장(Ⅱ 종교 사진의 일반화)**: 실존 지형지물·유적·실물(피라미드·킬리만자로·
    빅토리아 폭포·나일·사하라·지구대·세렝게티·젠네 모스크·젬베·가면·나이로비·바오바브 등 14장)은
    발주하지 않고 위키미디어(qa/fetch-soc4-africa.mjs — CREDITS.md 기재), generic 문화경관 11장만
    발주(qa/soc4_prompts.txt — 인물 원경·존엄을 눈검수 항목으로). 문서 lead가 지도·우주뷰면 탈락하고
    대체 문서로 재시도(Sahara→Erg_Chebbi·Congo_Basin→Ituri_Rainforest·지구대→Hell's_Gate 실사고 3건).
    대륙 실루엣 컷은 모양 특징 명시(Ⅱ 관행)로 3컷 전부 1발 합격(마다가스카르까지 나옴).
  - **좌표 전수 검산의 표준 스크립트화**: qa/audit-soc4-geo.mjs(esbuild 실로드)가 지역 데이터(도시
    in-poly·앵커 육지·그리드 겹침 0·크롭 포함)+hotspot 스팟 %↔소품 lon/lat 교차 검산+지역명·도시
    라벨 겹침 추정+퀴즈 레터 지리·기후 정합(다르에스살람=열대 등)을 커밋 전 기계 검사 — 지도 소품·
    스팟·레터는 전부 lon/lat 계산 좌표만(눈대중 0건).
  - **프로브의 freeNav 시딩은 localStorage로**: dev 서버가 HMR을 거친 뒤엔 eval의 completeLesson이
    앱 그래프와 다른 store 인스턴스를 만져 freeNav가 안 열린다(플레이북 §7 함정의 프로브판) — 시드
    JSON의 lessons에 done을 직접 심는 게 확정 경로(probe-rpl4·shot-soc4 문법).
  - 인식 성찰(04-02 성취기준 명시)이 서사 축: 훅 3연타(퍼즐 크기→두 번째 대륙·OTT→놀리우드 편수
    2위·학급 사진→중위 연령 최저)로 고정관념을 소환해 뒤집고 L8 recap outro가 회수. 민감 가드 =
    빈곤·기아 이미지 대표화 금지·의식주는 "환경에 맞춘 지혜" 서술·오답 보기 희화화 금지.
  - QA: `PORT=<포트> node qa/e2e-soc4.mjs`(58검증, ONLY= 부분 실행) · 실입력 `qa/probe-rpl4.mjs`
    (세로 실 마우스 — 안경·드래그·오답·탭-탭·5/5) · 눈검수 `qa/shot-soc4.mjs`(12샷 — 샷별 합격
    기준을 스크립트 주석에 명시).
- **다음 배치 백로그**: Ⅴ~Ⅵ 대륙 지리(soon 등록됨 — continentMap ContinentDef 추가 방식), Ⅶ~Ⅻ 일반사회
  (사례 판단·시나리오 문법 별도 설계), 단원 종합 평가(과학 규격 계승 여부 결정), "세계 어디게?" 거리
  점수 게임(도전 탭 후보 — 탐정 문법은 본선이 아니라 응용).

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
- 리더보드·랭킹은 후속 기능: 채점이 전부 클라이언트라 **서버 검증 설계 전에는 붙이지 않는다**
  (검토 모드 7연타가 공식 우회로인 것도 함께 해결할 것).
- **닉네임(2026-07-16)**: store.nickname(기기 저장, 공백 정리+12자 컷, null=기본 이름) — 마이 탭 이름 옆
  연필 → 닉네임 시트(비우면 게스트 스틱/스틱스텝 친구/소셜 이름 순 폴백). 서버는 profiles.nickname
  (progress가 아님 — **rowOf에 넣으면 400**, avatarCustom과 같은 함정): 저장 시 auth.ts pushNickname,
  로그인 직후엔 sync.ts fullSync가 기기 값 우선으로 밀고 기기에 없으면 서버 값 채택. 리더보드 표시명도 이 값.
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
- **하단 탭바 4개**(ui/gnav.ts, main.ts goTab이 nav.reset으로 전환): 학습(기존 홈)·복습(review.ts)·
  도전(challenge.ts — 랭킹 준비 중·미니게임 준비 중+프리미엄 크라운)·마이(my.ts — 아바타 픽커·닉네임 바꾸기·장화 레벨·스텝 요약·계정/프리미엄/과제함 진입).
- **복습 탭 콘텐츠는 전면 프리미엄(2026-07-15 사용자 확정)**: 오답노트·취약 단원 문제 뽑기·질문하기(AI 튜터)
  셋 다 잠금 시 골드 크라운 필 표시(review.ts `locked`), 게이트·페이월은 main.ts의
  openNotebook/openWeakDrill/openTutor가 소유(잠금 → 전용 문구 페이월 → 구매 시 바로 진입).
  **오답 "수집"(recordWrongNote)은 무료 사용자도 계속** — 구매 순간 과거 오답이 이미 쌓여 있게. 잠긴 건 열람·다시 풀기.
  e2e-notebook.mjs 시드는 premium: true로 게이트를 통과한다.
- **homeScreen 시그니처 변경**: onOpenGame 파라미터 제거, nav2.onTab 추가. UNIT_GAME·지도 게임 노드 삭제 —
  미니게임은 도전 탭 소속으로 이사(사용자 확정: 재단장 전까지 '준비 중'으로 닫힘). **재오픈 시 프리미엄
  콘텐츠**(2026-07-15 사용자 확정 — 카드에 크라운 병기, 열 때 main.ts 게이트 필수). **단열 디펜스는 폐기**
  (2026-07-17 사용자 확정 — screens/minigame.ts 삭제, ui.css 전용 스타일 제거. .mg-title/.mg-best만 잔존).
  **미니게임 재오픈 완료(2026-07-18)**: 도전 탭 = 스텝 러시(간판 신작) + 별자리 한붓그리기(재연결) —
  상세 규칙은 아래 "미니게임" 섹션.
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

## 미니게임 (도전 탭 — 스텝 러시·코스모 머지·별자리 한붓그리기)
- **구조**: 게임 코드는 같은 리포 **동적 import**(iframe 기각 — three 규칙과 동일). 진입·프리미엄
  게이트는 main.ts `openStepRush`/`openCosmoMerge`/`openStarGame`이 소유(잠금 → 전용 문구 페이월 →
  구매 시 재진입), challenge.ts 카드(#btn-steprush·#btn-cosmo·#btn-stargame, 크라운 병기)는 콜백만
  부른다. 나가기 = goTab("challenge").
  채점은 store.minigame(Record<gameId, best> — sync 병합 max) 공용, **신기록 갱신분만 스틱**(파밍 방지) +
  데일리(오늘 첫 기록 갱신 2배, 갱신 없는 판은 미소진 — 스텝 러시 srx.daily·코스모 머지 cmx.daily).
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
  보스전·업적·꾸미기 상점·부활은 백로그 — 사용자가 먼저 꺼내기 전 재제안 금지. 스틱은 명예 점수
  (Duolingo XP 문법 — 소비처 없음이 정상, spendXp 호출처 0 유지).
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
- **탐색은 필터형**(2026-07-15, 사용자 확정 — "목록을 다 쌓지 말고 고른 단원만"): 과목 세그(.grade-seg
  재사용 — 오답이 있는 과목이 둘일 때만, 기본 = getViewSubject) → **상태 탭 [다시 풀 문제 | 해결한 문제]**
  (.seg 재사용) → **단원 칩**(전체 + 현재 탭에 오답 있는 단원, 커리큘럼 순 — 단원이 하나뿐이면 칩 행 생략)
  → 고른 단원의 카드만 렌더(레슨 순 정렬). 전체 보기에서만 카드 라벨에 단원명 병기.
  **"해결한 문제" 탭이 라이브러리** — 다시 풀어 맞힌 문제는 이 탭에서만 보인다(용어 '극복'은 UI에서 폐기,
  사용자 확정 "해결" — store 필드 overcome·resolveWrongNote 등 코드명은 유지). **레슨별 소구획은 두지
  않는다**(단원당 오답이 몇 개 수준이라 소음). 원문이 끊긴 노트(findLesson 실패)는 "지난 콘텐츠" 칩
  (과목은 lessonId 접두 m으로만 추정). 과목·탭 전환 시 단원 필터는 "전체"로 리셋.
- QA: `PORT=<포트> node qa/e2e-notebook.mjs` — 시험 오답 수집→목록(상태 탭·세그/칩 생략 규칙)→해결
  (라이브러리 탭 이동)→재오답→레슨 훅→빈 상태→필터형 탐색(과학+수학+소실 노트 시딩, 칩 필터·탭 전환)
  34검증. 정본 진입 = 복습 탭(gnav).

## 취약 단원 문제 뽑기 (2026-07-12 구축 — 복습 탭, 프리미엄)
- **구조**: screens/weakDrill.ts 한 파일(피커→드릴→결과 3국면, 시험 화면 문법 재사용). 문항은
  **단원 종합 평가 문제 은행(content/exams/)이 유일한 출처** — lessonId 태그·해설·그림이 완비된 풀이라
  examForUnit이 있는 과학 단원만 피커에 뜨고, 새 시험 풀을 등록하면 자동으로 추가된다(별도 등록 없음).
- **피커**: 소단원(레슨) 다중 선택 — 단원을 넘나들며 담을 수 있다. 소단원·단원에 미극복 오답 수 배지
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

## 도전 탭 미니게임 — 레이저 미로 (2026-07-18)
- **구조**: `src/game/laserMaze/` — gen.ts(격자 빔 트레이서·정답 역산 생성기, 순수)와 index.ts(화면·탭
  입력·렌더·보상). challenge.ts 카드(reflect 아이콘) → main.ts `openLaserMaze`(프리미엄 게이트+동적
  import). 스타일 game.css `lzm-`.
- **오디오(일레븐랩스 발주 `qa/gen-lasermaze-audio.mjs` — XI_KEY env로만, 2026-07-18)**: BGM 존 2개
  (판 1~6 bgm-laser-focus 88BPM 유리질 미니멀 / 판 7+ bgm-laser-prism 94BPM 프리즘 화사 — 30초 루프
  이음매 크로스페이드) + 샘플 3종(sfx-clear→best 완성 팬페어·sfx-gem→gem 보석 점등 유리 차임·
  sfx-reset→reset 되감기 휘릭, public/game/lasermaze). 거울 회전 틱(flip)은 고빈도라 신스 고정(지연 0 —
  스텝 사다리음 원칙). 완성 배너 동안 bgm.duck, 다음 판 setStage가 복귀. gameKit에 gemLit/resetWhoosh
  추가(샘플 우선·신스 폴백).
- **풀 수 없는 판 0% 보장(핵심 계약)**: 생성이 **정답 역산** — 정답 경로(광원→거울들→보석)를 먼저
  깔고 거울 '각도만' 섞는다(위치 불변 → 되돌리면 반드시 풀림). 조립된 정답 상태를 실제 트레이서로
  돌려 전 보석 점등 검증(빔 간섭 실수 차단) + 섞은 상태가 이미 풀려 있으면 재섞기 + 전멸 시 1거울
  수제 폴백. `qa/e2e-lasermaze.mjs` 소크(1~120판)가 기계 증명.
- **게임 규칙 = 물리**: 거울 2상태(/·\) 탭 토글, 입사각=반사각(격자 90° 꺾임), 반거울 = 반 통과·반
  반사, 빔끼리 통과(빛은 부딪히지 않음), 보석은 도착색 비트합(R1·G2·B4)이 요구색과 **정확히** 같아야
  점등(노랑 보석에 파랑까지 오면 하양이라 꺼짐 — 가산혼합이 곧 판정). 부분 도착은 보석 안 색점 피드백.
- **난이도 커브**: 격자 5→6(5판)→7(9판), 꺾임 1→5(모노, 다색판은 3 캡 — 거울 수 폭주 방지·소크 상한
  12), 반거울 데뷔 5판(모노판 1~2개·14판+ 두 갈래판 1개), 함정 거울 4판~(경로 밖·최대 3), 장애물
  6판~(최대 4). **색 스케줄**: 7판부터 한 판 걸러 2색 합성(노랑→자홍→청록 순환, 광원 2), 12·20·28…판
  = 삼원색 하양(광원 3), 10·14…판 두 갈래 모노. 시드 고정 = 같은 판 같은 그림.
- **교육 장치(중2 III 연결)**: 거울 접점마다 입사각=반사각 쌍둥이 호 상시 표시(reflectLab 시각 언어),
  합성판 코치 한 줄("빨강 빛과 초록 빛이 모이면 노랑빛" — colorMixLab), 실패 상태 없음(막힐 일이 없는
  샌드박스라 힌트 장치 불요 — 리셋 버튼만).
- **보상**: 새 판 첫 클리어만 +3 스틱(store.minigame `lasermaze` = 최고 판 수). 재플레이 무보상,
  판 이동 스테퍼(다음은 최고+1까지) — 한붓그리기와 완전 동일 문법.
- QA: `PORT=<포트> node qa/e2e-lasermaze.mjs`(43검증 — 소크·실회전 클리어·리셋(정답 각도 거울을
  틀어 검증 — 틀린 거울 탭은 판이 풀려버릴 수 있다)·재플레이 무보상·합성판/하양판 실플레이·페이월).
  e2e 스크린샷 눈검수: qa/shots/lasermaze-{boot,clear1,pair,white}.png.
