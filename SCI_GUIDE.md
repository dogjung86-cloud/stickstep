# SCI_GUIDE.md — 과학 트랙의 헌법(단원별 랩·에셋 관례)

CLAUDE.md에서 분리(2026-07-21, 원문 그대로 — 요약·삭제 없음). CLAUDE.md의 규칙 위에 얹히는
과목별 규칙이며, 충돌하면 CLAUDE.md가 이긴다(MATH_GUIDE.md 문법). **과학 단원 콘텐츠·랩 작업 전
반드시 이 문서를 읽고, 새 단원 관행도 여기에 기록한다.** 과학은 창립 과목이라 공통 문법(표준 레슨
공식·훅 예측 규칙·아트 파이프라인·만화 발주·퀴즈 유형)은 앱 전체 표준으로 CLAUDE.md 본문에 남아
있다 — 여기엔 단원 전용 관례(중2 중심)만 담는다. 과학 단원 종합 평가는 EXAM_GUIDE.md도 함께 읽는다.

## 중2 과학 공통 — 콘텐츠 규칙·지권 에셋·컷 표현 관례(구 '중2 트랙' 섹션 후반부)
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
- **이미지 발주·임베드 완료(2026-07-20, codex)**: 스틱맨 개념 컷 6장(public/body/cuts g2u6l1~l6, concept
  첫 블록 cut("body", …)) + 해부 일러스트 6장(figs — 소화계·심장·콩팥단위·허파꽈리·호흡계·배설계) +
  2차분 8장(figs/v2 — 융털 흡수·혈관 비교·들숨/날숨·이중순환 베이스·콩팥단위 과정·맥박·기체 교환).
  발주안은 `qa/body-order-A-web.txt`/`-B-web.txt`, 실행은 `qa/order-body.sh`(codex exec 순차, **병렬 금지**).
  **하이브리드 방침 유지**: 발주 라스터 위에 한글 라벨·화살표는 unit6.ts/bodyFigures의 SVG 오버레이가 얹는다
  (경로도·모식도는 라벨이 본질이라 벡터 유지).

