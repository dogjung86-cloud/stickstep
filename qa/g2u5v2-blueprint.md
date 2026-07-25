# 중2 과학 Ⅴ 식물과 에너지 — 전면 재제작(v2) 설계서

교과서(중2, 168~197쪽) 정독 후 처음부터 다시 설계했다. 기존 g2u5 구현(unit5.ts·plant*.ts·plant.css·
public/plant)은 **손대지 않고 그대로 둔다** — v2는 전부 신규 파일이고, 커리큘럼 배선만 v2로 바꾼다.

## 0. 배선 원칙(충돌 0 설계)

| 구분 | 기존(유지) | v2(신규) |
|---|---|---|
| 콘텐츠 | `content/g2/unit5.ts` | `content/g2/unit5v2.ts` (`G2_UNIT5_V2`) |
| 랩 | `steps/plant*.ts`·`sugarJourneyLab.ts` | `steps/plant2/*.ts` (타입명 전부 신규) |
| 훅 | `steps/hookPlant.ts` | `steps/hookPlant2.ts` (scene 7종 신규) |
| 공용 킷 | `ui/plantKit.ts`·`ui/plantFigures.ts` | `ui/plantKit2.ts`·`ui/plantFigures2.ts` |
| 스타일 | `styles/plant.css`(`pl-`·`pt-`…) | `styles/plant2.css` — **접두사 `pgx-` 전용**(전 시트 grep 0 확인) |
| 에셋 | `public/plant/` | `public/plant2/{cuts,figs,items}` + `public/comics/g2u5l1/` |
| 단원 id | `g2u5` 그대로 · 테마 `plant` 그대로(UNIT_THEME·UNIT_DECOR 재사용) | 레슨 id `g2u5l1`~`g2u5l7` |

DOM id는 전부 `pgx-` 접두(기존 `#g2u5-day-scene` 류와 충돌 금지).

## 1. 교과서 대응표 (준거)

| 레슨 | 교과서 | 핵심 개념 |
|---|---|---|
| L1 광합성이라는 이름 | 170~173쪽 | 식물은 스스로 양분을 만든다 · 엽록체/엽록소 · 광합성 정의 |
| L2 재료와 산물 | 172~173쪽 | CO₂(기공)·물(뿌리→물관) → 포도당(+녹말)·산소(기공) |
| L3 눈으로 확인하기 | 174~175쪽(탐구 1·2) | 센서 실험(CO₂↓·O₂↑) · 아이오딘 검정(녹말=청람색, 암처리·탈색) |
| L4 실험을 설계해요 | 176~177쪽(탐구) | 변인 통제 — 다르게/같게 할 조건, 측정할 것 |
| L5 환경요인 3인방 | 178~179쪽 | 빛의 세기·CO₂ 농도(증가 후 일정) · 온도(일정 온도 뒤 급감) |
| L6 식물의 호흡 | 184~185쪽 | 호흡 = 양분 분해로 에너지 · 마이토콘드리아 · 낮/밤 기체 출입 · 광합성↔호흡 비교 |
| L7 양분의 여행 | 186~187쪽 | 포도당→녹말(엽록체) →밤에 설탕→체관 이동 → 이용(호흡·성장)·저장(부위별 형태) |

무료 L1~L3 / 프리미엄 L4~L7(중2 I 관행 = 무료 3).

**과학 정확성 가드(위반 금지)**
- 광합성 산물은 포도당 — 곧 **녹말**로 바뀌어 엽록체에 저장. 아이오딘 반응이 확인하는 것은 포도당이 아니라 **녹말**.
- 잎을 에탄올에 넣고 **물중탕**(직접 가열 금지 — 인화). 탈색은 엽록소가 색 변화를 가리기 때문.
- 검정 전 **암처리**로 원래 있던 녹말을 소모시킨다(안 하면 대조 실험이 성립하지 않음).
- 호흡은 **낮과 밤 모두** 항상 일어난다. 낮에는 광합성이 호흡보다 많아 겉보기로 CO₂ 흡수·O₂ 방출.
- 온도는 높을수록 좋은 것이 아니다 — 알맞은 온도를 넘으면 광합성량이 **빠르게 감소**.
- 광합성량이 무한히 늘지 않는 까닭 = 엽록체 수가 한정(교과서 말풍선).
- 체관의 설탕은 필요한 기관을 향해 **위·아래 양방향**으로 이동한다.
- 저장 부위·형태: 고구마=뿌리·녹말 / 감자=**줄기(덩이줄기)**·녹말 / 사탕수수=줄기·설탕 / 포도=열매·포도당 /
  콩=씨·단백질 / 깨=씨·지방 / 당근=뿌리 / 땅콩=씨·지방.
- 교과서 미도입 용어 금지: **보상점·엽육조직·기체교환량·광포화점**. '마이토콘드리아'는 교과서가 쓰므로 허용.

## 2. 레슨별 스텝 구성

각 레슨 공식 = **hook → (concept) → 랩 → concept → recap → 문제 3~5**. concept 첫 블록엔 스틱맨 컷(`cut("plant2", …)`).

- **L1** hook `sproutpot` → comic `g2u5l1` 7컷(반 헬몬트→프리스틀리→잉엔하우스) → concept(광합성·엽록체·엽록소)
  → lab `leafZoomLab` → recap → 퀴즈 4
- **L2** hook `stomapeek` → concept(재료와 길) → lab `photoBuildLab` → concept(포도당→녹말) → recap → 퀴즈 4
- **L3** hook `darkbox` → lab `gasSensorLab` → concept(아이오딘 검정 원리) → lab `iodineTestLab` → recap → 퀴즈 4
- **L4** hook `mixedtest` → concept(변인 통제) → lab `photoDesignLab` → recap → 퀴즈 4
- **L5** hook `greenhouse` → lab `photoCurveLab` → concept(요인이 겹칠 때·엽록체 한정) → recap → 퀴즈 5
- **L6** hook `mangrove` → concept(호흡) → lab `dayNightGasLab` → concept(광합성↔호흡 비교) → recap → 퀴즈 5
- **L7** hook `honeyflower` → concept(생성→이동) → lab `sugarFlowLab` → binSort(저장 부위·형태) → recap → 퀴즈 4

## 3. 랩 8종 사양 (전부 조작형 — 감상형 금지)

공통 규격(circulationLab 계승): `createLoop`+`fitCanvas`(DPR 1.75) · 논리좌표 `BASE_W=360` · 캔버스 클래스
`pgx-canvas`(touch-action:none) · 목표 칩 `.pn-badge.plant` · 3목표 달성 → `recordQuiz(true)`+`enableCTA()` ·
cleanup에서 loop·리스너·타이머 해제 · 포인터는 `safeCapture`(try/catch).

1. **leafZoomLab**(L1) — 배율 3단(잎→잎세포→엽록체) 스테퍼 + 드래그 팬. 목표 ①세포벽으로 나뉜 세포 보기
   ②엽록체 탭해 이름 얻기 ③빛 비추기 → 초록빛만 반사되는 연출(잎이 초록으로 보이는 까닭).
2. **photoBuildLab**(L2, 기함) — 잎 단면 무대. ①물방울을 뿌리→물관→잎으로 드래그 ②CO₂를 기공으로 드래그
   ③빛 스위치 ON → 엽록체에서 포도당 생성 ④산소를 기공 밖으로 드래그. 빛 없이 재료만 넣으면 정지(토스트).
3. **gasSensorLab**(L3, 확정 구현) — 투명 용기 1개(상추+센서 2) + 오른쪽 그래프 2장. 전등 ON → 10분을 20초로
   압축(빨리 감기 버튼 있음), CO₂ 900→420ppm·O₂ 20.9→21.6% 실시간 작도. 목표 ①전등 켜기 ②10분 관찰
   ③산소 그래프를 탭해 판독(교과서 탐구 1 그대로 — 대조 용기 안은 기각, 교과서 장치와 달라진다).
4. **iodineTestLab**(L3) — 5단계 절차 수행: 암처리(어둠상자 드래그)→잎 두 장 따기→에탄올 시험관을 뜨거운 물에
   담그기(드래그·직접 가열 선택 시 경고)→증류수 헹굼→아이오딘 떨어뜨리기. 빛 받은 잎만 청람색.
5. **photoDesignLab**(L4) — 계획서 조립 DOM. 다르게 할 조건 1개 + 같게 할 조건 3개 + 측정 항목 선택 → 실행.
   2개 이상 다르게 고르면 "어느 것 때문인지 알 수 없어요" 판정으로 되돌린다.
6. **photoCurveLab**(L5) — 요인 세그 3종 × 슬라이더. 잎의 기포 발생 속도로 광합성량을 보여 주고 그래프 자동 작도.
   온도는 알맞은 값을 넘으면 급감(잎이 시드는 연출). 세 곡선을 다 그리면 완료.
7. **dayNightGasLab**(L6) — 낮/밤 토글 + 광합성·호흡 막대. 겉으로 드나드는 CO₂·O₂ 화살표 방향을 유저가 정하고 판정.
   목표 ①낮 정답 ②밤 정답 ③밤에도 호흡 막대가 살아 있음을 탭해 확인.
8. **sugarFlowLab**(L7) — 식물 전신 무대. 낮(포도당→녹말) → 밤(녹말→설탕) → 설탕을 체관 따라 뿌리·열매·꽃으로
   드래그(위·아래 양방향) → 목적지별 쓰임 카드. 물관(파랑, 뿌리→잎)은 반대 방향으로 상시 흐른다.

## 4. 발주 이미지 (codex exec 순차 — 병렬 금지)

- 만화 7컷: `public/comics/g2u5l1/0~6.webp` (정사각 1:1 — comic 프레임이 1/1) · `qa/order-g2u5l1.sh`
- 스틱맨 개념 컷 9장: `public/plant2/cuts/*.webp` (4:3, 스타일 A, 강조색 leaf green)
- 교육 일러스트 9장: `public/plant2/figs/*.webp` (현미경 세포·기공·센서 장치·어둠상자·물중탕·아이오딘 결과·
  전등 거리·온실·맹그로브) — 글자 금지, 한글 라벨은 앱이 SVG로 얹는다.
- 저장 부위 8장: `public/plant2/items/*.webp` (정사각 — binSort 칩 사진)
- 변환: `node qa/process-comics.mjs`(만화) · `node qa/process-geo.mjs`(cuts·figs=ASPECT, items=SQUARE 등록 필요)

## 5. QA

- `npm run build`(tsc) 통과 · `PORT=<포트> node qa/e2e-g2u5v2.mjs`로 7레슨 전 스텝 실플레이
  (다른 세션이 dev 서버를 점유 중이면 전용 포트로 새로 띄운다 — HMR 스테일 캐시 사고 방지).
- 눈검수: 발주 컷 전수 Read(글자 없음·손가락 5개·과학 정확), 랩 스크린샷.
