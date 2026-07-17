# 중2 VI 「동물과 에너지」(g2u6) 제작 브리프 — codex 자율 작업 지시서

너(codex)는 이 앱의 새 대단원 **중2 VI 동물과 에너지**(id `g2u6`)를 처음부터 끝까지 제작한다.
이 문서 + `CLAUDE.md`(헌법) + `LESSON_GUIDE.md` + `.claude/skills/build-unit/SKILL.md`(플레이북)만 읽으면
필요한 규칙이 전부 있다. **충돌하면 CLAUDE.md가 이긴다.** 교과서 본문은 `qa/g2u6-textbook.txt`(21쪽 전문).

## 0. 절대 원칙 (위반 = 실격)
1. **레슨은 데이터**다. content/g2/unit6.ts에서 dsl 팩토리로 스텝 배열을 짠다.
   새 랩 6종의 렌더러는 lessons/steps/에 TS로 직접 구현한다(아래 계약 절 참조).
2. **완전 한글 해요체**, 이모지 금지(픽토그램은 SVG만), UI 문구에 '교과서'·출판사명 금지.
   쪽수는 `lesson.standard`의 "책 NN~NN쪽"에만.
3. **교과서의 임의 수치·선지 문구를 그대로 베끼지 않는다.** 함정 구조·출제 의도만 계승하고
   수치·상황·문구는 자체 제작. 단 **과학 사실·표준 용어·표준 도해(심장 4방·콩팥단위 구조 등)는 정확히** 지킨다.
4. **한 번에 하나.** 랩 하나 완성 → `npx tsc --noEmit` 통과 확인 → 다음. 여러 파일 반쯤 만들기 금지.
5. **손코딩 SVG는 파운드리 재질 문법**: 3스톱 그라데이션 면 + 좌상단 키라이트 + 접촉 그림자
   + 재질별 최암색 외곽선(1.4~1.6px). 균일 검은 외곽선 = 실격. 스틱맨 캐릭터만 손그림 라인 유지.
6. **이미지 발주는 하지 마라.** 이 단원은 codex 이미지 발주 없이 **전부 손코딩 SVG**로 만든다
   (인체 기관은 실사 사진이 부적절하고 저작 SVG 도해가 교육적으로 더 정확). 사진 임베드/발주 파이프라인 사용 금지.

## 1. 단원 구조 (교과서 소단원 순서 그대로 — 6레슨)
무료 L1~L3, 프리미엄 L4~L6(`premium: true`). 각 레슨 id는 `g2u6lN`, unitId `g2u6`.

| id | title | standard(쪽) | 훅 scene | 핵심 랩(신규 렌더러) | premium |
|----|-------|------|------|------|------|
| g2u6l1 | 영양소 | 책 202~205쪽 | breadonly | nutrientTestLab | — |
| g2u6l2 | 소화와 소화효소 | 책 206~211쪽 | chewrice | digestJourneyLab | — |
| g2u6l3 | 순환계 | 책 212~217쪽 | pulse | circulationLab | — |
| g2u6l4 | 호흡계와 호흡운동 | 책 220~225쪽 | deepbreath | breathModelLab | true |
| g2u6l5 | 배설계 | 책 226~229쪽 | peecolor | nephronLab | true |
| g2u6l6 | 세포호흡과 기관계의 통합 | 책 230~231쪽 | afterrun | bodyIntegrateLab | true |

각 레슨 공식(엄수): **hook → concept(스틱맨 컷 없이 손코딩 도해 figure로 시작) → 핵심 랩 →
recap(카드 2~4장, 전 카드 more 필수) → 문제 4~7개(유형 섞기)**.
※ concept 첫 블록의 "스틱맨 개념 컷"은 발주 이미지가 필요하므로 **이번 단원은 생략**하고,
   대신 그 자리에 손코딩 SVG 도해(figure 블록)를 둔다. 이는 중2 III(빛과 파동)이 concept를 훅→랩→recap로
   운영한 선례와 같은 결(발주 없는 단원 처리). LESSON_GUIDE의 "concept마다 컷" 표준은 발주가 있는 단원 기준.

## 2. 렌더러 계약 (이미 dsl.ts·hook.ts에 등록 완료 — 너는 구현만)
메인 세션이 **이미 스텁 등록을 마쳤다**:
- `dsl.ts`에 팩토리 6개 존재: `nutrientTestLab·digestJourneyLab·circulationLab·breathModelLab·nephronLab·bodyIntegrateLab`
  (시그니처: `(o: { title; lead?; cta?; curio? }) => Step`). 훅 scene 6개도 dsl·hook.ts 유니온에 등록됨.
- `hook.ts`가 `hookBody.ts`의 `renderBreadOnly·renderChewRice·renderPulse·renderDeepBreath·renderPeeColor·renderAfterRun`을
  import·디스패치하도록 이미 작성됨(파일이 없어 지금은 컴파일 에러 — **네가 hookBody.ts를 만들면 해소**).

**너가 만들 파일**:
1. `src/lessons/steps/hookBody.ts` — 훅 6장면. **hookPlant.ts를 구조 그대로 베껴라**(hookLife·mountScene·
   settleAction·options 헬퍼 포함). 각 renderer 시그니처는 hookPlant와 동일:
   `(scene, helper, step, finish, face) => cleanup`. 예측은 **반드시 공용 `ask()`**(hookAsk.ts) 사용.
   choices[0]=정답, good≠bad(오개념 교정). 조작(버튼 탭)으로 장면 변화를 먼저 보여준 뒤 ask() 호출.
   SVG는 240×170, 파운드리 문법. CSS는 `styles/body-hook.css` 새로 만들어 main.ts에 import 추가.
2. `src/lessons/steps/{nutrientTestLab,digestJourneyLab,circulationLab,breathModelLab,nephronLab,bodyIntegrateLab}.ts`
   — 6개 랩 렌더러. **buoyancyLab.ts를 뼈대로 베껴라**: `host.append(h1 → sub → pn-badges 목표칩 → helper → stage)`,
   목표 3개를 `collect()`로 모으면 `api.recordQuiz(true) + api.enableCTA(cta)`. 캔버스 랩은 `createLoop`+`fitCanvas`(DPR 1.75).
   **setPointerCapture는 try/catch 필수.** cleanup에서 loop.stop·리스너·타이머 전부 해제.
   canvas 랩 소품은 `ui/labProps.ts`(glassVessel·contactShadow·liquidFill 등)만 쓴다.
   랩 하단 helper는 조작요소 위에 배치(pn-badges → helper → stage 순서, buoyancyLab이 기준).
   랩이 DOM/SVG 기반이어도 좋다(호흡모형·순환·콩팥은 SVG 애니메이션이 더 자연스러움 — plantRespirationLab 등 참고).
3. `src/ui/bodyKit.ts` — 인체 단원 팔레트·물질 토큰의 단일 진실 공급원. tokens.css에 `--body-*` 변수를 정의하고
   bodyKit이 참조(색: 산소혈=선홍 #E23B4B, 정산소 부족혈=암적자 #7C3048, 산소 O₂=하늘 #4FB0E8,
   이산화탄소 CO₂=회보라 #8A7CA8, 영양소/포도당=앰버, 단백질=보라, 지방=버터옐로, 요소=올리브 등).
   재질 소품(혈관 튜브·기관 실루엣·판막) 헬퍼도 여기에.
4. `src/ui/bodyFigures.ts` — 퀴즈/개념용 SVG 도해 + `bodyMiniArt(kind)` recap 미니아트(64×64, 플랫).
   plantFigures.ts를 문법 참고. 필요한 도해: 소화계 구조(입~항문+부속), 영양소 검출 색표, 소화효소 흐름도
   (녹말→엿당→포도당 / 단백질→아미노산 / 지방→지방산+모노글리세라이드), 심장 4방+판막+대혈관,
   혈관 3종 벽 비교, 혈액 성분(혈장·적혈구·백혈구·혈소판), 이중순환 경로도, 호흡계 구조,
   호흡운동 들숨/날숨 대비, 허파꽈리 기체교환, 배설계 구조, 콩팥단위(토리·보먼주머니·세뇨관) 여과→재흡수→분비,
   세포호흡 통합 모식도(소화계·순환계·호흡계·배설계+조직세포). aria-label에 정답 수치/판정을 인쇄하지 말 것.

**등록은 이미 됐다**: registry.ts와 dsl.ts는 메인이 관리한다. 만약 네 랩 이름이 위와 다르면 안 된다(스텁과 일치해야 함).
registry.ts에 6개 랩 import·등록은 **네가 추가**해야 한다(파일 맨 위 import + R 객체). hookBody는 hook.ts가 이미 처리.

## 3. 인프라 (메인이 일부 완료, 나머지는 네가)
- `curriculum.ts`: 지금 `soon("g2u6", ...)`로 자리만 있음 → `import { G2_UNIT6 } from "./g2/unit6"` 추가하고
  CURRICULUM_G2 배열의 soon("g2u6"...) 항목을 `G2_UNIT6`로 교체.
- `screens/home.ts`: `UNIT_THEME`에 `g2u6: "body"` 추가. `UNIT_DECOR`에 g2u6 세트 추가
  (소품 5종 + sky 2종 — 아래 6절). `DECOR_SIZE`에 새 소품 크기 등록.
- `ui/mapDecor.ts`: g2u6 소품 SVG를 MAP_DECOR에 추가(아래 6절 키 이름).
- `styles/tokens.css`: `--subj-body`(대표색)·`-press`·`-tint` + `--grad-body`·`--grad-medallion-body` +
  `--body-*` 물질 팔레트. **테마명 `body`가 기존 CSS 클래스와 충돌 안 하는지 먼저 `grep "\.body\b" src/styles/*.css`
  로 확인**(현재 0건 — 안전). 대표색은 **심장 근육의 선홍/크림슨 #E23B4B 계열**(중1 힘 앰버·중2 chem 로즈와
  구분: chem은 핑크로즈 #E64980, body는 더 붉은 카민). press #C42A3C, tint #FDECEE.
- `styles/ui.css`: `.unit-band.body`·`.gm-terrain.body`·`.gm-node.body`(+ring·focus)·`.kicker.body` 4종 세트를
  atom/plant 블록을 복제해 추가. 랩·훅 전용 CSS는 `styles/body.css`·`styles/body-hook.css`로 분리해 main.ts에 import.
- `core/icons.ts`: 단원 아이콘은 `heart`(이미 존재) 사용.

## 4. 과학 정확성 체크포인트 (교과서 근거 — 틀리면 전체 무의미)
- **영양소 검출**: 아이오딘-아이오딘화칼륨→녹말=청람색 / 뷰렛→단백질=보라색 / 수단 III→지방=선홍색 /
  베네딕트+가열→당류(포도당·엿당)=황적색. 3대영양소=탄수화물·단백질·지방(에너지원). 바이타민·무기염류·물은
  에너지원 아님. 물은 몸 구성 성분 중 가장 많음.
- **소화효소 특이성**: 아밀레이스(침·이자액; 녹말→엿당), 펩신(위액; 단백질, 염산이 도움), 트립신(이자액; 단백질),
  라이페이스(이자액; 지방→지방산+모노글리세라이드). 쓸개즙=간에서 생성·쓸개 저장, **소화효소 없음**, 지방 소화를 도움.
  염산은 펩신을 돕고 세균을 죽임. 최종 분해: 녹말→포도당, 단백질→아미노산, 지방→지방산+모노글리세라이드.
- **흡수**: 작은창자 융털에서. 포도당·아미노산 등 수용성=모세혈관, 지방산·모노글리세라이드=암죽관(림프). 큰창자=물 흡수.
- **순환(사람 심장 2심방 2심실)**: 심방=혈액 받아들임(정맥 연결), 심실=내보냄(동맥 연결). 심실벽이 더 두꺼움.
  판막=혈액 역류 방지(심방-심실, 심실-동맥 사이 + 정맥). 혈관: 동맥(두껍고 탄력)·모세혈관(한 겹, 물질교환)·정맥(판막).
  **온몸순환: 좌심실→대동맥→온몸 모세혈관→대정맥→우심방**(산소·영양소 주고 CO₂·노폐물 받음).
  **허파순환: 우심실→폐동맥→허파 모세혈관→폐정맥→좌심방**(CO₂ 내보내고 산소 받음).
  함정: **폐동맥에는 산소 적은 피(정맥혈), 폐정맥에는 산소 많은 피(동맥혈)**. 혈액=혈장(액체, 물질운반)+혈구.
  적혈구(핵없음·가운데 오목·헤모글로빈·산소운반·최다), 백혈구(핵있음·최대·식균/보호), 혈소판(핵없음·최소·혈액응고).
- **호흡계**: 코→숨관→숨관가지→허파(허파꽈리 무수히 많아 표면적 넓음). **허파는 근육이 없어 스스로 못 움직임** —
  갈비뼈·가로막(횡격막)이 흉강 부피를 바꿈. **들숨: 갈비뼈 올라감+가로막 내려감→흉강 부피↑→압력↓→공기 들어옴.
  날숨: 갈비뼈 내려감+가로막 올라감→흉강 부피↓→압력↑→공기 나감.** (공기는 압력 높은 곳→낮은 곳으로.)
  호흡운동 모형: 병=흉강, 고무막=가로막, 빨대=기관, 작은 풍선=허파. 기체교환: 허파꽈리→모세혈관(산소), 모세혈관→허파꽈리(CO₂);
  조직세포에서는 모세혈관→조직세포(산소), 조직세포→모세혈관(CO₂). 기체는 분압 차로 확산.
- **배설**: 단백질 분해 시 생기는 암모니아(독성 강함)→간에서 요소(독성 약함)로 전환→콩팥에서 오줌으로.
  배설계=콩팥·오줌관·방광·요도. 콩팥=콩팥겉질·속질·깔때기. 오줌 생성 기본 단위=**콩팥단위(네프론)=토리+보먼주머니+세뇨관**.
  **여과**(토리→보먼주머니: 크기 작은 포도당·무기염류·요소·물 통과 / 혈구·단백질은 크기 커서 못 감) →
  **재흡수**(세뇨관→모세혈관: 포도당·아미노산 전부, 대부분의 물·무기염류) →
  **분비**(모세혈관→세뇨관: 미처 여과 안 된 노폐물). 오줌 경로: 콩팥→오줌관→방광→요도.
  함정: 정상 오줌엔 포도당·단백질 없음(포도당은 전부 재흡수, 단백질은 여과 안 됨). 당뇨=오줌에 포도당.
- **세포호흡**: 세포(주로 마이토콘드리아)에서 포도당+산소→물+이산화탄소+에너지. 에너지는 체온유지·성장·근육운동·정신활동에 씀.
  **통합**: 소화계(영양소 흡수)+호흡계(산소 흡입)→순환계가 조직세포로 운반→세포호흡→노폐물 중 CO₂는 순환계→호흡계(날숨),
  요소는 순환계→배설계(오줌). 네 기관계 협력.

## 5. 콘텐츠 품질 바
- **훅**: 리드는 미스터리 제기(교사 말투 금지). good/bad 다르게(bad는 오개념 콕 집어 교정). 소재명은 도입에서 소개.
  scene별 소재: breadonly(매일 빵만 먹는 편식), chewrice(밥을 오래 씹으면 단맛), pulse(맥박이 뛰는 곳),
  deepbreath(심호흡할 때 가슴이 부푸는데 폐 근육?), peecolor(물 많이 마시면 오줌이 맑아짐), afterrun(달리기 후 헥헥+땀).
- **오답 해설(explainBad)**: 왜 그 보기를 골랐을지 추정해 그 오개념 교정. 정답 반복 금지.
- **recap 카드**: text 한두 문장 + examples 칩 2~3개 + **more 필수**(400~800자, `<b class='rm-h'>왜 그럴까요?</b>`
  소제목 2~4개로 원리→예시→시험함정, 끝에 `<span class='fun'><b>알고 있나요?</b>…</span>`). 전 카드에 `art: bodyMiniArt(...)`.
- **문제(레슨당 4~7)**: 능동형(binSort/order/hotspot) ≥1 + 그림 문제(figure) ≥1 + mcq + ox/multi 섞기.
  라벨형 보기(ㄱㄴㄷ·(가)(나)·①~⑤)는 `shuffle:false` + 관례 순서. 해설이 보기 "위치" 지칭 금지(내용 인용).
- **용어 선경험**: concept·recap·퀴즈의 모든 용어는 앞의 훅·랩·조작에서 먼저 경험시킨다. 조작이 용어를 전제하면
  concept가 랩보다 먼저(소화효소·콩팥단위처럼 이름 없이 조작 지시가 안 읽히는 경우).

## 6. 지도 장식 세트 (mapDecor + home UNIT_DECOR/DECOR_SIZE)
서사: **소화 → 순환 → 호흡 → 배설 → 세포(에너지)**. 소품 키(SVG 신규 제작, 64×64 파운드리):
`stomachDeco`(위·소화), `heartDeco`(심장·순환), `lungDeco`(허파·호흡), `kidneyDeco`(콩팥·배설), `cellDeco`(세포/미토콘드리아·에너지).
sky: `["cloud", "sparkle"]`. UNIT_DECOR: `g2u6: { seq: ["stomachDeco","heartDeco","lungDeco","kidneyDeco","cellDeco"], sky: ["cloud","sparkle"] }`.

## 7. 검증 게이트 (각 단계 끝 필수)
- 매 파일 완성마다 `npx tsc --noEmit` 통과. 전체 완료 시 `npm run build`도 통과.
- 학년 언어 grep: unit6.ts에 '교과서' 0건, 이모지 0건, 출판사명 0건. (중2라 '분자'·정식 용어는 허용.)
- 훅 전수 점검: choices[0]=정답, good≠bad.
- recap 전 카드 more 존재(400~800자).
- **프리뷰 실플레이는 다른 세션 dev 서버와 충돌하니 하지 말고**, tsc+build 통과 + 코드 자기검토로 갈음한다.
  (메인 세션이 별도로 e2e를 돌린다.)

## 8. 작업 순서 (반드시 이 순서)
1. 교과서 `qa/g2u6-textbook.txt` 정독 → 6레슨 세부 개념·문제 감 잡기.
2. tokens.css/ui.css/home.ts/mapDecor.ts/curriculum.ts 인프라(§3·§6) — tsc 통과(unit6.ts 없어 에러나면
   빈 `export const G2_UNIT6: Unit = { id:"g2u6", roman:"VI", title:"동물과 에너지", subtitle:"...", color:"#E23B4B",
   icon:"heart", standard:"책 200~231쪽", lessons:[] };`로 시작).
3. bodyKit.ts + bodyFigures.ts.
4. hookBody.ts (+ body-hook.css) — tsc 통과(hook.ts 에러 해소됨).
5. 랩 6종 하나씩(+ body.css) — 각각 tsc 통과. registry.ts에 import·등록.
6. unit6.ts 6레슨 콘텐츠 작성 — hook→concept→lab→recap→문제.
7. 최종 `npx tsc --noEmit` + `npm run build` 통과.
8. 완료 보고: 만든 파일 목록 + tsc/build 결과 + 남은 우려. **한 일을 요약**해서 보고하라.

시작하라. 막히면 기억으로 짐작하지 말고 기준 파일(buoyancyLab.ts·hookPlant.ts·plantFigures.ts·unit5.ts)을 다시 열어라.
