// 중1 수학 Ⅲ. 좌표평면과 그래프: 단원 종합 평가 풀, 레슨 4 그래프 해석 (m1u3e067~m1u3e089). 2026-07 개보수: e072 상황→개형 ①~⑤(miniGraphRow), 물류소·측정 장치·%p 정리.
// 유형 13(mcq+multi)/7(num)/3(word), diff 9/9/5. 그림 문항의 값은 MExamChangeGraphSpec에서 파생한다.
import type { ExamItem } from "./types";
import { mExamChangeGraphFig, type MExamChangeGraphSpec } from "../../ui/examFiguresMath";
import { miniGraphRow } from "../../ui/mathFigures";

const L = "m1u3l4";
type GraphPoint = [number, number];

const graphPoint = (spec: MExamChangeGraphSpec, pointIndex: number, seriesIndex = 0): GraphPoint =>
  spec.series[seriesIndex].points[pointIndex];

const highestPoint = (spec: MExamChangeGraphSpec, seriesIndex = 0): GraphPoint =>
  spec.series[seriesIndex].points.reduce((best, point) => (point[1] > best[1] ? point : best));

const equalPoint = (spec: MExamChangeGraphSpec, first = 0, second = 1): GraphPoint => {
  const other = new Map(spec.series[second].points.map(([x, y]) => [x, y]));
  const found = spec.series[first].points.find(([x, y]) => other.get(x) === y);
  if (!found) throw new Error("두 계열이 만나는 표시점이 필요합니다.");
  return found;
};

const PARK_SHUTTLE: MExamChangeGraphSpec = {
  xMin: 0,
  xMax: 75,
  yMin: 0,
  yMax: 20,
  xTicks: [0, 10, 20, 35, 50, 65, 75],
  yTicks: [0, 4, 8, 12, 16, 20],
  xLabel: "출발 후 시간(분)",
  yLabel: "기점에서 거리(km)",
  series: [{ points: [[0, 0], [10, 8], [20, 8], [35, 20], [50, 20], [65, 4], [75, 0]] }],
};

const RESERVOIR: MExamChangeGraphSpec = {
  xMin: 0,
  xMax: 60,
  yMin: 30,
  yMax: 100,
  xTicks: [0, 15, 30, 45, 60],
  yTicks: [36, 60, 84, 96],
  xLabel: "방류 시작 후 시간(분)",
  yLabel: "저수량(만 m³)",
  series: [{ points: [[0, 96], [15, 84], [30, 84], [45, 60], [60, 36]] }],
};

const HIKING: MExamChangeGraphSpec = {
  xMin: 0,
  xMax: 80,
  yMin: 30,
  yMax: 120,
  xTicks: [0, 20, 35, 50, 65, 80],
  yTicks: [40, 70, 80, 110],
  xLabel: "출발 후 시간(분)",
  yLabel: "고도(m)",
  series: [{ points: [[0, 40], [20, 70], [35, 70], [50, 110], [65, 80], [80, 40]] }],
};

const DELIVERY: MExamChangeGraphSpec = {
  xMin: 0,
  xMax: 65,
  yMin: 0,
  yMax: 20,
  xTicks: [0, 12, 20, 35, 47, 65],
  yTicks: [0, 6, 12, 18],
  xLabel: "출발 후 시간(분)",
  yLabel: "마트에서 거리(km)",
  series: [{ points: [[0, 0], [12, 6], [20, 6], [35, 18], [47, 18], [65, 0]] }],
};

const BATTERIES: MExamChangeGraphSpec = {
  xMin: 0,
  xMax: 80,
  yMin: 10,
  yMax: 100,
  xTicks: [0, 20, 40, 60, 80],
  yTicks: [20, 40, 60, 80, 100],
  xLabel: "사용 시간(분)",
  yLabel: "남은 배터리(%)",
  series: [
    { label: "A", color: "#364FC7", points: [[0, 94], [20, 78], [40, 60], [60, 42], [80, 32]] },
    { label: "B", color: "#E8547E", points: [[0, 88], [20, 82], [40, 64], [60, 42], [80, 20]] },
  ],
};

const PRACTICE_ROOM: MExamChangeGraphSpec = {
  xMin: 13,
  xMax: 18,
  yMin: 0,
  yMax: 12,
  xTicks: [13, 14, 15, 16, 17, 18],
  yTicks: [0, 2, 4, 6, 8, 10, 12],
  xLabel: "시각(시)",
  yLabel: "연습실 인원(명)",
  series: [{ points: [[13, 4], [14, 10], [15, 10], [16, 6], [17, 12], [18, 8]] }],
};

const parkRead = graphPoint(PARK_SHUTTLE, 3);
const reservoirFlatStart = graphPoint(RESERVOIR, 1);
const reservoirFlatEnd = graphPoint(RESERVOIR, 2);
const hikingTop = highestPoint(HIKING);
const deliveryShortStop = [graphPoint(DELIVERY, 1), graphPoint(DELIVERY, 2)] as const;
const deliveryLongStop = [graphPoint(DELIVERY, 3), graphPoint(DELIVERY, 4)] as const;
const batteryMeet = equalPoint(BATTERIES);
const batteryAt20A = graphPoint(BATTERIES, 1, 0);
const batteryAt20B = graphPoint(BATTERIES, 1, 1);
const batteryAt40A = graphPoint(BATTERIES, 2, 0);
const batteryAt40B = graphPoint(BATTERIES, 2, 1);
const batteryAt80A = graphPoint(BATTERIES, 4, 0);
const batteryAt80B = graphPoint(BATTERIES, 4, 1);

export const POOL_M1U3L4: ExamItem[] = [
  {
    id: "m1u3e067",
    lessonId: L,
    type: "mcq",
    prompt: `공원 셔틀이 출발한 지 <b>${parkRead[0]}분</b> 뒤, 기점에서 떨어진 거리는?`,
    figure: mExamChangeGraphFig(PARK_SHUTTLE),
    options: [`${parkRead[1]} km`, `${parkRead[0]} km`, `${graphPoint(PARK_SHUTTLE, 1)[1]} km`, `${graphPoint(PARK_SHUTTLE, 5)[1]} km`, `${graphPoint(PARK_SHUTTLE, 6)[0]} km`],
    answer: 0,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>가로축에서 ${parkRead[0]}분을 찾고 그 점에서 그래프까지 올라간 뒤, 세로축의 값을 읽으면 <b>${parkRead[1]} km</b>예요. 시간과 거리를 순서대로 대응해야 해요.<span class='xh'>오답 하나씩 격파</span>'${parkRead[0]} km'는 가로축의 시간을 거리처럼 쓴 값이고, '${graphPoint(PARK_SHUTTLE, 1)[1]} km'는 ${graphPoint(PARK_SHUTTLE, 1)[0]}분일 때의 값이에요. '${graphPoint(PARK_SHUTTLE, 5)[1]} km'는 돌아오는 구간의 다른 점을 읽었고, '${graphPoint(PARK_SHUTTLE, 6)[0]} km'는 그래프 끝의 시간 ${graphPoint(PARK_SHUTTLE, 6)[0]}분을 거리로 바꾼 답이에요. 먼저 축의 뜻과 단위를 확인해요. 가로축에서 찾은 시각의 점을 세로축까지 나란히 옮겨 읽으면 다른 꺾이는 점과 섞이지 않아요.`,
    core: `${parkRead[0]}분에 대응하는 세로축의 값은 ${parkRead[1]} km예요.`,
  },
  {
    id: "m1u3e068",
    lessonId: L,
    type: "num",
    prompt: "공원 셔틀의 기점에서 거리를 기록했더니 출발 후 0분, 14분, 28분, 42분에 각각 0 km, 9 km, 9 km, 21 km였어요. 셔틀이 기점에서 <b>21 km</b> 떨어진 때는 출발 후 몇 분인지 쓰세요.",
    answer: "42",
    numKind: "int",
    unitLabel: "분",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>찾아야 하는 것은 거리 21 km에 대응하는 시간이에요. 기록을 시간과 거리의 짝으로 읽으면 (0분, 0 km), (14분, 9 km), (28분, 9 km), (42분, 21 km)이므로 답은 <b>42분</b>이에요.<span class='xh'>헷갈림 격파</span>'21'은 세로축의 거리값을 그대로 쓴 것이고, '28'은 거리 9 km가 끝나는 다른 시각이에요. 14분과 28분 사이에는 거리가 9 km로 같지만, 이것이 21 km에 도달한 시각은 아니에요. 질문이 '어느 때'인지 '얼마나 떨어졌는지'인지 먼저 구분하고, 원하는 값을 한 축에서 찾은 뒤 다른 축의 값을 읽어요.",
    core: "거리 21 km와 짝을 이루는 시간은 42분이에요.",
  },
  {
    id: "m1u3e069",
    lessonId: L,
    type: "word",
    prompt: "기점과 종점을 잇는 한 길을 따라 움직이는 공원 셔틀의 시간과 기점에서 거리를 나타낸 그래프에서 선이 일정 시간 동안 수평이에요. 셔틀의 움직임을 나타내는 알맞은 말을 고르세요.",
    answer: "정차",
    bank: ["정차", "출발", "도착", "증가", "감소", "왕복", "가속", "우회", "추월"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>가로축의 시간은 계속 흐르는데 세로축의 '기점에서 거리'가 변하지 않으면 셔틀의 위치가 그대로라는 뜻이에요. 따라서 이 구간은 셔틀이 잠시 멈춘 <b>정차</b>를 나타내요.<span class='xh'>낱말 하나씩 격파</span>'출발'과 '도착'은 한 순간의 사건이고, 수평인 시간 구간 전체를 설명하지 못해요. '증가'와 '감소'는 거리값이 위나 아래로 변할 때의 말이에요. '왕복'은 갔다가 돌아오는 전체 움직임, '가속'은 움직임이 빨라지는 상황이에요. '우회'와 '추월'은 이 두 축만으로 확인할 수 없어요. 축이 거리인지 남은 양인지에 따라 수평 구간의 이야기도 달라져요.",
    core: "시간이 흐르는 동안 거리값이 그대로이면 셔틀은 정차한 상태예요.",
  },
  {
    id: "m1u3e070",
    lessonId: L,
    type: "mcq",
    prompt: "저수지 방류 기록에서 <b>저수량이 변하지 않은 구간</b>은?",
    figure: mExamChangeGraphFig(RESERVOIR),
    options: [
      `${graphPoint(RESERVOIR, 0)[0]}분부터 ${reservoirFlatStart[0]}분까지`,
      `${reservoirFlatEnd[0]}분부터 ${graphPoint(RESERVOIR, 3)[0]}분까지`,
      `${reservoirFlatStart[0]}분부터 ${reservoirFlatEnd[0]}분까지`,
      `${graphPoint(RESERVOIR, 3)[0]}분부터 ${graphPoint(RESERVOIR, 4)[0]}분까지`,
      `${graphPoint(RESERVOIR, 0)[0]}분부터 ${reservoirFlatEnd[0]}분까지`,
    ],
    answer: 2,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>저수량이 변하지 않으려면 시간이 지나도 선의 높이가 같아야 해요. 그래프가 수평인 곳은 <b>${reservoirFlatStart[0]}분부터 ${reservoirFlatEnd[0]}분까지</b>이고, 이때 저수량은 ${reservoirFlatStart[1]}만 m³로 유지돼요.<span class='xh'>오답 하나씩 격파</span>'${graphPoint(RESERVOIR, 0)[0]}~${reservoirFlatStart[0]}분'에는 ${graphPoint(RESERVOIR, 0)[1]}에서 ${reservoirFlatStart[1]}로 줄어요. '${reservoirFlatEnd[0]}~${graphPoint(RESERVOIR, 3)[0]}분'과 '${graphPoint(RESERVOIR, 3)[0]}~${graphPoint(RESERVOIR, 4)[0]}분'에도 선이 내려가요. '${graphPoint(RESERVOIR, 0)[0]}~${reservoirFlatEnd[0]}분'은 감소 구간과 수평 구간을 함께 묶었어요. 꺾이는 점을 경계로 나누어 읽어요. 시작과 끝의 저수량이 같은지 확인하면 눈으로 본 수평 여부도 수치로 검산할 수 있어요.`,
    core: `수평인 ${reservoirFlatStart[0]}~${reservoirFlatEnd[0]}분 동안 저수량이 일정해요.`,
  },
  {
    id: "m1u3e071",
    lessonId: L,
    type: "num",
    prompt: "저수지의 저수량이 방류 시작 때 105만 m³, 20분 뒤 87만 m³였어요. 이 20분 동안 줄어든 저수량은 몇 만 m³인지 쓰세요.",
    answer: "18",
    numKind: "int",
    unitLabel: "만 m³",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>세로축이 저수량이므로 처음 값에서 나중 값을 빼면 줄어든 양을 구할 수 있어요. 105−87=<b>18</b>이므로 20분 동안 18만 m³가 줄었어요.<span class='xh'>헷갈림 격파</span>'87'은 20분 뒤에 남은 양이지 줄어든 양이 아니고, '105'는 시작할 때의 전체 양이에요. 105+87처럼 두 값을 더하면 변화량이 되지 않아요. 또 가로축의 20분과 세로축의 만 m³는 단위가 달라 서로 빼거나 더할 수 없어요. 그래프 해석에서는 먼저 세로축이 남은 양인지 사용한 양인지 확인한 다음, 같은 단위의 두 세로값을 비교해요.",
    core: "줄어든 양은 처음 저수량 105에서 나중 저수량 87을 뺀 18이에요.",
  },
  {
    id: "m1u3e072",
    lessonId: L,
    type: "mcq",
    prompt: "지호가 집에서 공원까지 <b>일정한 빠르기로 걷다가</b>, 공원 벤치에 앉아 <b>쉬면서</b> 기록을 마쳤어요. 시간에 따라 집에서 떨어진 거리를 나타낸 그래프로 알맞은 것은?",
    figure: miniGraphRow(["up", "upflat", "updown", "curvefast", "upflatup"], ["①", "②", "③", "④", "⑤"]),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 1,
    shuffle: false,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>이야기를 구간으로 나눠요. 일정한 빠르기로 걷는 동안 집에서 떨어진 거리는 곧은 선을 그리며 늘어나고, 벤치에 앉아 쉬는 동안에는 위치가 그대로라 거리 그래프가 수평이 돼요. 증가한 뒤 수평으로 끝나는 <b>②</b>가 알맞아요.<span class='xh'>오답 하나씩 격파</span>①은 쉬는 구간 없이 끝까지 걸은 모양이에요. ③은 거리가 다시 줄어들어 집으로 되돌아온 이야기가 되고, ④는 점점 가파르게 휘어져 일정한 빠르기라는 조건과 어긋나요. ⑤는 쉬었다가 다시 걷는 세 장면이라 벤치에서 기록을 마친 이야기와 달라요. 문장의 장면 수와 그래프의 구간 수를 먼저 맞춰 보면 헷갈리지 않아요.",
    core: "일정하게 걷기는 곧은 증가, 쉬기는 수평이라 증가 후 수평인 그래프예요.",
  },
  {
    id: "m1u3e073",
    lessonId: L,
    type: "multi",
    prompt: "변화 그래프를 해석하는 방법으로 <b>옳은 것을 모두</b> 고르세요.",
    options: [
      "가로축과 세로축이 나타내는 양과 단위를 먼저 확인한다",
      "표시된 두 점 사이의 값은 언제나 두 점의 한가운데 값으로 정한다",
      "시간이 흐르는데 선이 수평이면 세로축의 값은 변하지 않는다",
      "선이 더 가파르면 축의 단위와 관계없이 세로축의 실제 값이 항상 더 크다",
      "그래프가 끝난 뒤의 값은 다른 정보 없이 마음대로 이어서 정하지 않는다",
    ],
    answer: [0, 2, 4],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그래프는 두 축의 뜻과 단위를 확인한 뒤 읽어야 해요. 시간 그래프의 수평 구간에서는 세로값이 그대로이고, 표시된 범위가 끝난 뒤의 값은 추가 정보 없이 정할 수 없어요. 따라서 세 설명이 옳아요.<span class='xh'>오답 격파</span>두 점 사이가 곧은 선으로 이어졌다는 정보가 없다면 가운데 시각의 값을 두 세로값의 한가운데로 정할 수 없어요. 또 선의 가파른 정도는 변화의 빠르기를 비교하는 단서가 될 수 있지만, 축의 눈금 간격과 단위가 다르면 그림 모양만으로 실제 값의 크기를 비교할 수 없어요. 보이는 정보와 추측을 구분하는 것이 핵심이에요.",
    core: "축과 단위를 확인하고, 수평 구간은 일정으로 읽으며, 표시 범위 밖은 추측하지 않아요.",
  },
  {
    id: "m1u3e074",
    lessonId: L,
    type: "mcq",
    prompt: `등산객이 가장 높은 곳에 도착한 때는 출발 후 몇 분인가요?`,
    figure: mExamChangeGraphFig(HIKING),
    options: [`${graphPoint(HIKING, 1)[0]}분`, `${graphPoint(HIKING, 2)[0]}분`, `${graphPoint(HIKING, 4)[0]}분`, `${graphPoint(HIKING, 5)[0]}분`, `${hikingTop[0]}분`],
    answer: 4,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>가장 높은 곳은 세로축의 고도값이 가장 큰 꼭대기예요. 꼭대기 ${hikingTop[1]} m에 대응하는 가로축을 읽으면 출발 후 <b>${hikingTop[0]}분</b>이에요.<span class='xh'>오답 하나씩 격파</span>'${graphPoint(HIKING, 1)[0]}분'은 ${graphPoint(HIKING, 1)[1]} m에 처음 도착한 때이고, '${graphPoint(HIKING, 2)[0]}분'은 같은 높이에서 쉰 뒤 다시 오르기 시작한 때예요. '${graphPoint(HIKING, 4)[0]}분'은 정상에서 내려와 ${graphPoint(HIKING, 4)[1]} m가 된 때, '${graphPoint(HIKING, 5)[0]}분'은 출발 고도로 돌아온 때예요. 가장 큰 시간값이 아니라 가장 큰 세로값의 점을 먼저 찾고 그때의 시간을 읽어요. 꼭대기에서 아래로 내려가 가로축 눈금과 만나는지도 확인해요.`,
    core: `가장 큰 고도 ${hikingTop[1]} m의 점에 대응하는 시간은 ${hikingTop[0]}분이에요.`,
  },
  {
    id: "m1u3e075",
    lessonId: L,
    type: "num",
    prompt: "등산 기록에서 고도가 75 m로 일정한 구간이 출발 후 24분부터 39분까지였어요. 이 높이에 머문 시간은 몇 분인지 쓰세요.",
    answer: "15",
    numKind: "int",
    unitLabel: "분",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>머문 시간은 수평 구간이 끝난 시각에서 시작한 시각을 빼서 구해요. 39−24=<b>15</b>이므로 등산객은 75 m 높이에 15분 동안 머물렀어요.<span class='xh'>헷갈림 격파</span>'24'는 머물기 시작한 시각이고 '39'는 다시 움직이기 시작한 시각이므로 어느 것도 머문 시간 자체가 아니에요. 고도 75 m는 세로축의 위치라 시간과 계산하지 않아요. 또한 24분과 39분을 더하면 경과 시간이 아니라 두 시각의 합이 되어 상황에 맞지 않아요. '몇 시각인가'와 '얼마 동안인가'를 구분하고, 시간의 길이는 끝−시작으로 검산해요.",
    core: "수평 구간의 길이는 끝 시각 39에서 시작 시각 24를 뺀 15분이에요.",
  },
  {
    id: "m1u3e076",
    lessonId: L,
    type: "word",
    prompt: "시간이 흐를수록 저수지의 저수량을 나타내는 선이 아래로 내려가요. 저수량의 변화를 나타내는 말을 고르세요.",
    answer: "감소",
    bank: ["감소", "증가", "일정", "반복", "정차", "도착", "측정", "예측"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>가로축의 시간이 오른쪽으로 흐를 때 선이 아래로 내려간다는 것은 세로축의 저수량 값이 작아진다는 뜻이에요. 따라서 알맞은 말은 <b>감소</b>예요.<span class='xh'>낱말 하나씩 격파</span>'증가'는 선이 위로 올라가며 값이 커질 때이고, '일정'은 선이 수평일 때예요. '반복'은 같은 변화 모양이 일정한 시간 간격으로 되풀이되는 경우예요. '정차'와 '도착'은 이동 상황의 말이라 저수량 변화 자체를 나타내지 않아요. '측정'은 값을 재는 행동이고, '예측'은 아직 표시되지 않은 값을 짐작하는 일이에요. 선의 위아래 방향을 세로축 값의 커짐과 작아짐으로 번역해요.",
    core: "시간이 흐를수록 선이 내려가면 세로축의 값은 감소해요.",
  },
  {
    id: "m1u3e077",
    lessonId: L,
    type: "mcq",
    prompt: "공원 셔틀의 기점에서 거리가 10분마다 0 km, 5 km, 14 km, 18 km, 18 km, 10 km로 기록되었어요. 같은 10분 동안 거리값이 <b>가장 많이 변한 구간</b>은?",
    options: ["0~10분", "30~40분", "40~50분", "10~20분", "20~30분"],
    answer: 3,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>모든 구간이 10분으로 같으므로 이웃한 거리값의 차를 비교해요. 변화량의 크기는 차례로 5, 9, 4, 0, 8 km이고 가장 큰 9 km는 <b>10~20분</b> 구간이에요.<span class='xh'>오답 하나씩 격파</span>'0~10분'은 5 km, '20~30분'은 4 km만 변했어요. '30~40분'은 18 km가 그대로여서 변화가 0이고, '40~50분'은 18 km에서 10 km로 8 km 변해 두 번째로 커요. 값이 감소하더라도 변화의 빠르기를 비교할 때는 줄어든 크기까지 포함해 차의 크기를 살펴요. 시간 길이가 같은지도 먼저 확인해야 공정하게 비교할 수 있어요.",
    core: "같은 10분 구간의 거리 차는 5, 9, 4, 0, 8 km라 10~20분이 가장 커요.",
  },
  {
    id: "m1u3e078",
    lessonId: L,
    type: "mcq",
    prompt: "마트와 배달 장소를 잇는 한 길을 따라 움직인 배달 차가 마트에서 같은 거리를 유지한 두 구간 중, <b>더 오래 멈춘 구간의 정차 시간</b>은?",
    figure: mExamChangeGraphFig(DELIVERY),
    options: [
      `${deliveryShortStop[1][0] - deliveryShortStop[0][0]}분`,
      `${deliveryLongStop[1][0] - deliveryLongStop[0][0]}분`,
      `${deliveryLongStop[0][0] - deliveryShortStop[1][0]}분`,
      `${deliveryShortStop[0][0]}분`,
      `${deliveryLongStop[1][0]}분`,
    ],
    answer: 1,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>정차는 거리값이 같은 수평 구간이에요. 첫 정차는 ${deliveryShortStop[0][0]}~${deliveryShortStop[1][0]}분으로 ${deliveryShortStop[1][0] - deliveryShortStop[0][0]}분, 두 번째는 ${deliveryLongStop[0][0]}~${deliveryLongStop[1][0]}분으로 <b>${deliveryLongStop[1][0] - deliveryLongStop[0][0]}분</b>이에요. 따라서 두 번째가 더 길어요.<span class='xh'>오답 하나씩 격파</span>'${deliveryShortStop[1][0] - deliveryShortStop[0][0]}분'은 짧은 첫 정차 시간이에요. '${deliveryLongStop[0][0] - deliveryShortStop[1][0]}분'은 서로 다른 정차 구간 사이의 이동 시간을 뺀 값이에요. '${deliveryShortStop[0][0]}분'과 '${deliveryLongStop[1][0]}분'은 정차가 시작되거나 끝난 시각이지 머문 시간이 아니에요. 구간의 길이는 끝 시각에서 시작 시각을 빼요. 수평선의 가로 길이를 비교한 뒤 실제 눈금값으로 계산하면 모양만 보고 고르는 실수를 줄여요.`,
    core: `긴 수평 구간은 ${deliveryLongStop[0][0]}~${deliveryLongStop[1][0]}분이므로 정차 시간은 ${deliveryLongStop[1][0] - deliveryLongStop[0][0]}분이에요.`,
  },
  {
    id: "m1u3e079",
    lessonId: L,
    type: "num",
    prompt: "배달 차의 거리 그래프가 18분부터 26분까지, 44분부터 51분까지 수평이었어요. 두 번의 정차 시간을 합하면 몇 분인지 쓰세요.",
    answer: "15",
    numKind: "int",
    unitLabel: "분",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>첫 정차 시간은 26−18=8분이고, 두 번째 정차 시간은 51−44=7분이에요. 두 시간을 합하면 8+7=<b>15분</b>이에요.<span class='xh'>헷갈림 격파</span>'8'이나 '7'만 쓰면 두 정차 중 하나만 계산한 답이에요. 26−18과 44−51처럼 두 번째 구간의 뺄셈 순서를 뒤집으면 시간의 길이가 음수가 되어 상황에 맞지 않아요. 네 시각을 모두 더하는 것도 각 구간의 길이를 구하는 방법이 아니에요. 수평 구간마다 끝 시각−시작 시각을 따로 계산한 뒤, 질문이 두 번의 합을 요구하는지 더 긴 한 구간을 요구하는지 확인해요.",
    core: "두 수평 구간의 길이 8분과 7분을 더하면 15분이에요.",
  },
  {
    id: "m1u3e080",
    lessonId: L,
    type: "mcq",
    prompt: "가로축이 시간, 세로축이 저수량인 그래프가 처음 20분 동안 내려가고, 다음 10분 동안 수평이며, 그 뒤에는 앞보다 더 빠르게 내려갔어요. 알맞은 설명은?",
    options: [
      "방류하다가 10분 동안 멈춘 뒤, 앞보다 빠르게 방류했다",
      "물을 채우다가 10분 동안 멈춘 뒤, 더 빠르게 채웠다",
      "방류량이 처음부터 끝까지 늘 같은 상태였다",
      "20분 뒤 저수량이 0이 되어 다시 늘어났다",
      "10분 동안 시간이 흐르지 않아 그래프가 수평이었다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>세로축이 저수량이므로 선이 내려가면 물의 양이 줄어 방류 중인 상황이에요. 수평인 10분은 저수량이 유지되어 방류를 멈춘 때이고, 뒤에서 더 빠르게 내려가면 앞보다 빠르게 방류한 것으로 읽어요.<span class='xh'>오답 하나씩 격파</span>'물을 채웠다'면 저수량이 늘어 선이 올라가야 해요. '처음부터 끝까지 같은 상태'는 감소, 수평, 더 빠른 감소의 세 구간을 무시했어요. 저수량이 0이었다거나 다시 늘었다는 정보도 없어요. 수평 구간에서도 가로축의 시간은 계속 흐르고 세로값만 변하지 않아요. 문장을 구간별로 나눈 뒤 선의 방향과 대응해요.",
    core: "하강은 방류, 수평은 중지, 더 빠른 하강은 더 빠른 방류를 뜻해요.",
  },
  {
    id: "m1u3e081",
    lessonId: L,
    type: "num",
    prompt: "지우와 하나가 보드게임에서 얻은 점수가 0분에는 각각 0점과 12점, 10분에는 8점과 10점, 20분에는 16점과 8점, 30분에는 모두 24점이었어요. 표시된 시각 중 두 사람의 점수가 같은 때는 몇 분인지 쓰세요.",
    answer: "30",
    numKind: "int",
    unitLabel: "분",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>표시된 시각마다 두 점수를 한 쌍씩 비교해요. 0분에는 0점과 12점, 10분에는 8점과 10점, 20분에는 16점과 8점으로 다르고, 30분에는 두 점수가 모두 24점이에요. 따라서 답은 <b>30분</b>이에요.<span class='xh'>헷갈림 격파</span>'24'는 두 점수가 같을 때의 세로값이지 묻는 시간값이 아니에요. 10분에는 점수 차가 작지만 같은 것은 아니고, 20분에는 지우의 16점이 하나의 8점보다 커요. 주어진 표시 시각 사이에서 또 같아지는지는 알 수 없고, 이 문제는 표시된 시각 중에서만 찾으라고 했어요. 같은 세로값을 찾은 뒤 그 점의 가로축 시간을 답해요.",
    core: "두 값이 모두 24인 표시 시각은 30분이에요.",
  },
  {
    id: "m1u3e082",
    lessonId: L,
    type: "multi",
    prompt: "휴대 전화 A와 B의 남은 배터리 그래프에 대한 설명으로 <b>옳은 것을 모두</b> 고르세요.",
    figure: mExamChangeGraphFig(BATTERIES),
    options: [
      `${batteryMeet[0]}분에 두 휴대 전화의 배터리는 모두 ${batteryMeet[1]}%이다`,
      `${batteryAt40A[0]}분에는 A의 배터리가 B보다 많이 남아 있다`,
      `${batteryAt20A[0]}분에는 B의 배터리가 A보다 많이 남아 있다`,
      "두 휴대 전화의 배터리는 표시된 모든 구간에서 같은 양만큼 줄었다",
      `${batteryAt80A[0]}분에는 A의 배터리가 B보다 많이 남아 있다`,
    ],
    answer: [0, 2, 4],
    diff: 3,
    explain:
      `<span class='xh'>정답 풀이</span>${batteryMeet[0]}분에는 두 그래프가 ${batteryMeet[1]}%에서 만나고, ${batteryAt20A[0]}분에는 B가 ${batteryAt20B[1]}%로 A의 ${batteryAt20A[1]}%보다 많아요. ${batteryAt80A[0]}분에는 A ${batteryAt80A[1]}%, B ${batteryAt80B[1]}%라 A가 더 많아요.<span class='xh'>오답 격파</span>${batteryAt40A[0]}분에는 A가 ${batteryAt40A[1]}%, B가 ${batteryAt40B[1]}%이므로 B가 더 많아요. 또 두 휴대 전화는 구간마다 줄어든 양이 서로 같지 않아요. 두 그래프를 비교할 때는 같은 가로축 시각에서 두 세로값을 읽고, 만나는 점과 선의 앞뒤 관계를 따로 확인해요. 선의 색과 끝의 A, B 표시를 먼저 대응하면 서로 바꾸어 읽는 실수도 막을 수 있어요.`,
    core: `${batteryMeet[0]}분에 ${batteryMeet[1]}%로 같고, ${batteryAt20A[0]}분에는 B, ${batteryAt80A[0]}분에는 A가 더 많아요.`,
  },
  {
    id: "m1u3e083",
    lessonId: L,
    type: "mcq",
    prompt: "연습실 인원을 조사했더니 14시에는 6명, 16시에는 14명이었고 두 점 사이의 변화 모양은 표시하지 않았어요. 이 자료만으로 15시의 인원을 묻는다면 가장 알맞은 답은?",
    options: ["6명", "8명", "10명", "14명", "알 수 없다"],
    answer: 4,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>14시와 16시의 인원만 알고 두 시각 사이에 어떻게 변했는지는 표시되지 않았어요. 15시에 일정하게 늘었다는 조건도 없으므로 <b>알 수 없다</b>가 옳아요.<span class='xh'>오답 하나씩 격파</span>'6명'은 14시 값이 계속되었다고 근거 없이 정한 답이고, '14명'은 16시 값을 앞당겨 쓴 답이에요. '8명'은 임의로 2명만 늘었다고 본 값이고, '10명'은 두 값의 한가운데지만 변화가 곧은 선으로 이어진다는 정보가 없으면 확정할 수 없어요. 두 끝값을 안다고 해서 중간값이 자동으로 정해지는 것은 아니에요. 그래프에 실제 선이나 중간 조사값이 있어야 읽을 수 있어요.",
    core: "두 시각의 값만으로는 변화 모양이 표시되지 않은 중간 시각의 값을 정할 수 없어요.",
  },
  {
    id: "m1u3e084",
    lessonId: L,
    type: "num",
    prompt: "두 물탱크 A와 B에서 물을 빼기 시작한 지 60분 뒤 남은 물이 각각 38 L, 46 L였어요. 두 물탱크에 남은 물의 양의 차를 쓰세요.",
    answer: "8",
    numKind: "int",
    unitLabel: "L",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>같은 60분에서 두 세로값을 비교해 큰 값에서 작은 값을 빼요. 46−38=<b>8</b>이므로 남은 물의 양의 차는 8 L예요.<span class='xh'>헷갈림 격파</span>'46'과 '38'은 각각 한 물탱크에 남은 양이지 두 값의 차가 아니에요. 두 값을 더한 84도 차를 묻는 질문과 맞지 않아요. 38−46처럼 작은 값에서 큰 값을 빼면 −8이 되지만, 두 양이 얼마나 차이 나는지를 묻는 상황에서는 차의 크기를 양수로 나타내요. 또한 가로축의 60분을 물의 양과 더하거나 빼지 않아요. 두 그래프를 비교할 때는 반드시 같은 시각의 세로값끼리 비교해요.",
    core: "같은 시각에 남은 양 46과 38의 차는 8 L예요.",
  },
  {
    id: "m1u3e085",
    lessonId: L,
    type: "word",
    prompt: "배달 차의 거리 그래프가 90분에서 끝났고, 그 뒤의 경로나 규칙은 주어지지 않았어요. 100분일 때 마트에서 거리를 판단한 결과를 고르세요.",
    answer: "알 수 없다",
    bank: ["알 수 없다", "출발점이다", "계속 증가한다", "계속 감소한다", "변하지 않는다", "반드시 도착한다", "중간값이다", "가장 멀다"],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그래프에 표시된 기록은 90분까지이고, 이후의 움직임이나 반복 규칙이 없어요. 따라서 100분일 때 거리는 <b>알 수 없다</b>가 옳아요.<span class='xh'>낱말 하나씩 격파</span>'출발점이다'와 '반드시 도착한다'는 도착 정보가 있을 때만 정할 수 있어요. '계속 증가한다', '계속 감소한다', '변하지 않는다'는 마지막 선의 모양을 범위 밖까지 그대로 이었다는 근거 없는 판단이에요. '중간값이다'는 어느 두 값의 중간인지도 정해지지 않았고, '가장 멀다'도 100분의 값 자체를 모르므로 말할 수 없어요. 그래프는 표시된 범위 안의 자료만 확실하게 설명해요.",
    core: "표시 범위가 끝난 뒤의 값은 규칙이나 추가 자료가 없으면 알 수 없어요.",
  },
  {
    id: "m1u3e086",
    lessonId: L,
    type: "mcq",
    prompt: "등산객의 고도가 0분부터 10분마다 52 m, 67 m, 77 m, 77 m, 57 m로 기록되었어요. 40분 동안의 <b>전체 고도 변화</b>와 <b>기록된 최고 고도</b>를 옳게 짝 지은 것은?",
    options: ["5 m 감소, 77 m", "20 m 증가, 57 m", "5 m 증가, 77 m", "57 m 증가, 77 m", "25 m 증가, 67 m"],
    answer: 2,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>전체 변화는 마지막 고도에서 처음 고도를 빼서 57−52=<b>5 m 증가</b>예요. 다섯 기록값 중 가장 큰 값은 <b>77 m</b>이므로 두 정보를 옳게 짝 지은 답은 '5 m 증가, 77 m'예요.<span class='xh'>오답 하나씩 격파</span>'5 m 감소'는 빼는 순서나 증가 방향을 거꾸로 판단했어요. '20 m 증가, 57 m'는 마지막 한 구간의 감소 크기와 마지막 값을 섞었어요. '57 m 증가'는 마지막 고도를 변화량으로 오해했고, '25 m 증가, 67 m'는 중간의 오르내림을 잘못 합친 데다 최고값도 놓쳤어요. 전체 변화는 끝값과 처음값만 비교하고, 최고값은 모든 기록을 따로 살펴요.",
    core: "끝값 57에서 처음값 52를 빼면 5 m 증가이고, 최고 고도는 77 m예요.",
  },
  {
    id: "m1u3e087",
    lessonId: L,
    type: "mcq",
    prompt: "연습실 인원 그래프에서 <b>16시부터 18시까지</b>의 변화를 옳게 설명한 것은?",
    figure: mExamChangeGraphFig(PRACTICE_ROOM),
    options: ["계속 2명씩 증가한다", "6명에서 12명으로 증가한 뒤 8명으로 감소한다", "12명에서 6명으로 감소한 뒤 8명으로 증가한다", "세 시각의 인원이 모두 같다", "16시와 18시의 인원 차는 8명이다"],
    answer: 1,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>그래프에서 16시는 6명, 17시는 12명, 18시는 8명이에요. 따라서 <b>6명에서 12명으로 증가한 뒤 8명으로 감소한다</b>가 옳아요.<span class='xh'>오답 하나씩 격파</span>'계속 2명씩 증가'는 16~17시의 6명 증가와 17~18시의 4명 감소를 무시했어요. '12명에서 6명으로 감소'는 시각의 순서를 거꾸로 읽었어요. 세 값 6, 12, 8은 같지 않고, 16시와 18시의 차는 |8−6|=2명이므로 8명도 아니에요. 한 구간의 방향을 전체 구간에 그대로 적용하지 말고 각 표시점의 값을 시간 순서대로 비교해요.",
    core: "16시 6명, 17시 12명, 18시 8명이므로 증가한 뒤 감소해요.",
  },
  {
    id: "m1u3e088",
    lessonId: L,
    type: "num",
    prompt: "공원 셔틀의 기점에서 거리가 차례로 0 km, 9 km, 9 km, 24 km, 16 km, 16 km, 0 km였어요. 같은 길을 따라 이동했다고 할 때, 멈춘 구간을 제외하고 셔틀이 실제로 이동한 거리를 모두 합하면 몇 km인지 쓰세요.",
    answer: "48",
    numKind: "int",
    unitLabel: "km",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>기점에서 거리가 변한 만큼을 구간별로 더해요. 0→9는 9 km, 9→9는 0 km, 9→24는 15 km, 24→16은 8 km, 16→16은 0 km, 16→0은 16 km예요. 합은 9+15+8+16=<b>48 km</b>예요.<span class='xh'>헷갈림 격파</span>마지막 값 0 km는 기점에 돌아왔다는 뜻이지 이동 거리가 0이라는 뜻이 아니에요. 가장 먼 거리 24 km만 쓰면 왕복 과정이 빠지고, 24×2=48은 이 자료에서는 우연히 같지만 중간에 방향이 여러 번 바뀌는 자료에는 통하지 않아요. 각 이웃한 값의 차를 빠짐없이 더해 검산해요.",
    core: "구간별 거리 변화 9, 0, 15, 8, 0, 16 km를 합하면 48 km예요.",
  },
  {
    id: "m1u3e089",
    lessonId: L,
    type: "mcq",
    prompt: "휴대 전화 A와 B의 남은 배터리를 조사했더니 30분에 70%와 64%, 45분에 모두 51%, 60분에 32%와 44%였어요. 옳은 해석은?",
    options: [
      "30분에는 B가 A보다 많이 남았다",
      "45분에는 두 휴대 전화의 남은 배터리가 같다",
      "60분에는 A가 B보다 많이 남았다",
      "30분부터 60분까지 A의 배터리는 변하지 않았다",
      "표시된 세 시각에서 항상 A가 더 많이 남았다",
    ],
    answer: 1,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>45분에는 A와 B의 남은 배터리가 모두 51%이므로 두 값이 같아요. 따라서 해당 설명이 옳아요.<span class='xh'>오답 하나씩 격파</span>30분에는 A가 70%, B가 64%라 A가 더 많으므로 첫 설명은 두 휴대 전화를 바꿔 읽었어요. 60분에는 A가 32%, B가 44%라 B가 더 많아요. A는 30분의 70%에서 45분 51%, 60분 32%로 계속 줄었으므로 변하지 않았다는 말도 틀려요. 60분에는 B가 더 많으므로 '항상 A가 더 많다'도 성립하지 않아요. 여러 시각의 기록은 반드시 같은 시각끼리 두 값을 나란히 비교해요.",
    core: "45분에는 두 휴대 전화의 남은 배터리가 모두 51%로 같아요.",
  },
];
