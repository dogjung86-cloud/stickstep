// 중1 수학 III. 좌표평면과 그래프: 단원 종합 평가 풀, 레슨 7 반비례(m1u3e134~m1u3e155). 2026-07 개보수: e147 물탱크 채우기(비상 계승)·e150 주스 소재 교체.
// 13(mcq+multi)/7(num)/2(word), diff 9/9/4. 관계표 4개만 사용해 L8의 그래프 범위와 겹치지 않는다.
import type { ExamItem } from "./types";
import { mExamTableFig } from "../../ui/examFiguresMath";

const L = "m1u3l7";
const shown = (value: number | string): string => String(value).replace("-", "−");
const withVars = (text: string): string =>
  text.replace(/[xya]/g, (variable) => `<i class='mv'>${variable}</i>`);

interface InverseTableSpec {
  title: string;
  xs: Array<number | string>;
  ys: Array<number | string>;
}

const inverseTable = (spec: InverseTableSpec): string =>
  mExamTableFig(
    ["변수", ...spec.xs.map((_, index) => `값 ${index + 1}`)],
    [
      ["x", ...spec.xs.map(shown)],
      ["y", ...spec.ys.map(shown)],
    ],
    { title: spec.title, colw: [20, ...spec.xs.map(() => 80 / spec.xs.length)] },
  );

const TOTAL_134 = 56;
const TABLE_135: InverseTableSpec = { title: "두 변수 x, y의 관계", xs: [1, 2, 4, 7], ys: [28, 14, 7, 4] };
const PAIR_136 = { x: 5, y: 9, a: 45 };
const TABLE_139: InverseTableSpec = { title: "y가 x에 반비례하는 관계", xs: [2, 4, 8, 16], ys: [40, 20, 10, "A"] };
const MISSING_139 = 80 / 16;
const TOTAL_142 = 96;
const FIG_144 = inverseTable({ title: "한 반비례 관계의 값", xs: [2, 5, 10, 20], ys: [30, 12, 6, 3] });
const NEGATIVE_TOTAL_145 = -56;
const GARDEN_AREA = 63;
const WORK_AMOUNT = 84;
const FILE_TOTAL = 45;
const TABLE_151: InverseTableSpec = { title: "두 변수 x, y의 관계", xs: [-14, -7, 3, 6], ys: [6, 12, -28, -14] };
const TABLE_151_A = -84;

export const POOL_M1U3L7: ExamItem[] = [
  {
    id: "m1u3e134",
    lessonId: L,
    type: "mcq",
    prompt: withVars(`y=${TOTAL_134}/x에서 x가 7에서 14로 변할 때 y가 감소한 양은?`),
    options: ["4", "8", "14", "28", "56"],
    answer: 0,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${withVars(`y=${TOTAL_134}/x`)}에서 ${withVars("x=7")}이면 ${withVars("y")}=8이고, ${withVars("x=14")}이면 ${withVars("y")}=4예요. 따라서 ${withVars("y")}가 감소한 양은 8−4=<b>4</b>예요. ${withVars("x")}가 2배가 되었으므로 ${withVars("y")}가 절반이 된다는 반비례의 성질로도 확인할 수 있어요.<span class='xh'>오답 하나씩 격파</span>'8'은 처음 ${withVars("y")}값, '14'는 나중 ${withVars("x")}값을 그대로 옮긴 수예요. '28'은 ${TOTAL_134}÷2를 계산한 중간값이고, '56'은 일정한 곱을 답한 값이에요. 처음값과 나중값을 모두 구한 뒤 차를 계산하고 두 좌표의 곱이 모두 ${TOTAL_134}인지 한 번 더 확인해요.`,
    core: "y는 8에서 4로 줄어 감소한 양은 4예요.",
  },
  {
    id: "m1u3e135",
    lessonId: L,
    type: "mcq",
    prompt: "표에서 <i class='mv'>x</i>의 값이 2배가 될 때 <i class='mv'>y</i>의 변화로 항상 옳은 것은?",
    figure: inverseTable(TABLE_135),
    options: [withVars("y도 2배가 된다"), withVars("y는 2만큼 줄어든다"), withVars("y는 절반이 된다"), withVars("y는 항상 28이다"), withVars("y는 0이 된다")],
    answer: 2,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>표에서 ${withVars("x")}가 1→2, 2→4로 2배가 될 때 ${withVars("y")}는 28→14, 14→7로 각각 절반이 돼요. 각 열의 곱도 28로 일정하므로 <b>${withVars("y는 절반이 된다")}</b>가 항상 옳아요.<span class='xh'>오답 하나씩 격파</span>'2배'는 정비례의 변화예요. '2만큼 줄어든다'는 28→14의 실제 감소량 14와도 맞지 않고 구간마다 차가 달라요. ${withVars("y")}는 28에 고정되지 않으며, 표의 양수 ${withVars("x")}에서는 0도 되지 않아요. 반비례에서는 같은 배수만큼 ${withVars("x")}가 커지면 ${withVars("y")}는 그 배수의 역수만큼 변하며, 곱도 일정해야 해요.`,
    core: "x가 2배가 될 때 y는 절반이 돼요.",
  },
  {
    id: "m1u3e136",
    lessonId: L,
    type: "num",
    prompt: withVars(`y가 x에 반비례하고 x=${PAIR_136.x}일 때 y=${PAIR_136.y}예요. y=a/x에서 a의 값을 구하세요.`),
    answer: String(PAIR_136.a),
    numKind: "int",
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>반비례식 ${withVars("y=a/x")}의 양변에 ${withVars("x")}를 곱하면 ${withVars("xy=a")}가 돼요. 따라서 주어진 한 쌍 ${withVars(`x=${PAIR_136.x}, y=${PAIR_136.y}`)}를 이용하면 ${withVars("a")}=${PAIR_136.x}×${PAIR_136.y}=<b>${PAIR_136.a}</b>예요. 관계식은 ${withVars(`y=${PAIR_136.a}/x`)}이고, ${withVars(`x=${PAIR_136.x}`)}를 다시 넣으면 ${PAIR_136.a}÷${PAIR_136.x}=${PAIR_136.y}로 처음 조건과 맞아요. <span class='xh'>계산 함정 격파</span>${PAIR_136.x}+${PAIR_136.y}=14처럼 두 값을 더하거나 ${PAIR_136.y}÷${PAIR_136.x}=1.8처럼 나누면 반비례의 일정한 수를 찾을 수 없어요. 정비례에서는 몫을 살피지만 반비례에서는 곱을 살핀다는 차이를 기억하고 단위와 곱의 부호까지 반드시 다시 되짚어요.`,
    core: "반비례의 일정한 수 a는 한 쌍의 값을 곱해 구해요.",
  },
  {
    id: "m1u3e137",
    lessonId: L,
    type: "word",
    prompt: "<i class='mv'>x</i>가 2배, 3배가 될 때 <i class='mv'>y</i>가 각각 1/2배, 1/3배가 되는 관계의 이름을 고르세요.",
    answer: "반비례",
    bank: ["반비례", "정비례", "비례상수", "관계식", "순서쌍", "좌표", "변수", "원점", "그래프"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>가 몇 배가 될 때 <i class='mv'>y</i>가 그 배수의 역수만큼 되는 관계를 <b>반비례</b>라고 해요. 이때 <i class='mv'>x</i>와 <i class='mv'>y</i>의 곱이 일정하여 <i class='mv'>y</i>=<i class='mv'>a</i>/<i class='mv'>x</i>로 나타낼 수 있어요. <span class='xh'>낱말 하나씩 격파</span>'정비례'는 <i class='mv'>x</i>가 몇 배일 때 <i class='mv'>y</i>도 같은 배수가 되는 관계예요. '비례상수'는 식 속 일정한 수 <i class='mv'>a</i>의 이름이고, '관계식'은 관계를 식으로 적은 표현이에요. '변수'는 값이 변하는 문자이고 '순서쌍·좌표·원점·그래프'는 관계의 이름이 아니에요. 배수는 반대로 변하고 곱은 그대로인지 함께 확인해요.",
    core: "x가 몇 배일 때 y가 그 배수의 역수만큼 되면 반비례예요.",
  },
  {
    id: "m1u3e138",
    lessonId: L,
    type: "mcq",
    prompt: "<i class='mv'>y</i>가 <i class='mv'>x</i>에 반비례해요. <i class='mv'>x</i>가 3에서 12로 변하면 <i class='mv'>y</i>는 처음 값의 몇 배가 되나요?",
    options: ["4배", "3배", "2배", "1/2배", "1/4배"],
    answer: 4,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>는 3에서 12로 4배가 되었어요. 반비례에서는 두 값의 곱이 일정해야 하므로 <i class='mv'>y</i>는 처음 값의 <b>1/4배</b>가 돼요. 처음 값을 <i class='mv'>y</i><sub>0</sub>라고 하면 3<i class='mv'>y</i><sub>0</sub>=12<i class='mv'>y</i>이므로 <i class='mv'>y</i>=<i class='mv'>y</i><sub>0</sub>/4로도 확인돼요.<span class='xh'>오답 하나씩 격파</span>'4배'는 정비례처럼 같은 배수로 바꾼 답이고, '3배'와 '2배'는 두 <i class='mv'>x</i>값의 차나 일부만 본 값이에요. '1/2배'는 12가 3의 2배라고 잘못 판단했어요. 먼저 몇 배인지 정확히 구하고 그 역수를 취한 뒤 곱의 일정성도 마지막까지 확인해요.",
    core: "x가 4배가 되므로 y는 1/4배가 돼요.",
  },
  {
    id: "m1u3e139",
    lessonId: L,
    type: "num",
    prompt: "표에서 <b>A</b>에 알맞은 수를 구하세요.",
    figure: inverseTable(TABLE_139),
    answer: String(MISSING_139),
    numKind: "int",
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${withVars("y가 x에 반비례")}하므로 각 열의 ${withVars("x×y")}는 일정해요. 첫 열에서 2×40=80이고 다른 열도 4×20=80, 8×10=80이에요. 마지막 열에서는 16×A=80이어야 하므로 A=80÷16=<b>${MISSING_139}</b>예요. <span class='xh'>계산 함정 격파</span>${withVars("x")}가 8에서 16으로 2배가 되었으니 ${withVars("y")}는 10의 절반인 ${MISSING_139}가 된다고 보아도 같아요. 20이라고 하면 ${withVars("y")}도 2배로 만든 것이고, 10은 변화시키지 않은 값이에요. 160은 16×10을 그대로 쓴 값, 64는 80−16을 한 값이라 일정한 곱을 만들지 못해요.`,
    core: "곱 80을 유지하도록 80을 16으로 나누면 A=5예요.",
  },
  {
    id: "m1u3e140",
    lessonId: L,
    type: "mcq",
    prompt: withVars("y=32/x에서 x의 값으로 사용할 수 없는 것은?"),
    options: ["−8", "0", "0.5", "4", "16"],
    answer: 1,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${withVars("y=32/x")}에서 ${withVars("x")}는 나누는 수예요. 0으로 나누는 계산은 할 수 없으므로 사용할 수 없는 값은 <b>0</b>이에요. 음수나 0이 아닌 소수는 나누는 수로 쓸 수 있어요. <span class='xh'>오답 하나씩 격파</span>'−8'을 넣으면 ${withVars("y=−4")}, '0.5'를 넣으면 ${withVars("y=64")}가 되어 모두 계산할 수 있어요. '4'와 '16'도 각각 ${withVars("y=8")}, ${withVars("y=2")}로 정해져요. 반비례라고 해서 ${withVars("x")}가 양의 정수여야 하는 것은 아니에요. 금지되는 까닭은 부호나 수의 종류가 아니라 분모가 0이 되는 단 한 경우이기 때문이에요.`,
    core: "반비례식의 x는 분모이므로 0이 될 수 없어요.",
  },
  {
    id: "m1u3e141",
    lessonId: L,
    type: "word",
    prompt: "반비례 관계에서 <i class='mv'>x</i>와 <i class='mv'>y</i>의 값이 바뀌어도 일정하게 유지되는 계산을 고르세요.",
    answer: "곱",
    bank: ["곱", "합", "차", "몫", "제곱", "평균", "좌표", "눈금", "순서"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>y</i>=<i class='mv'>a</i>/<i class='mv'>x</i>의 양변에 <i class='mv'>x</i>를 곱하면 <i class='mv'>x</i><i class='mv'>y</i>=<i class='mv'>a</i>가 돼요. 따라서 값이 바뀌어도 일정하게 유지되는 계산은 두 값의 <b>곱</b>이에요. <span class='xh'>낱말 하나씩 격파</span>'합'과 '차'가 일정한 관계는 반비례의 조건이 아니며, 단순히 한 값이 늘고 다른 값이 줄어드는 상황과 혼동하게 해요. '몫'이 일정하면 <i class='mv'>y</i>/<i class='mv'>x</i>가 같은 정비례를 떠올려야 해요. '제곱'과 '평균'도 반비례 판별법이 아니고, '좌표·눈금·순서'는 계산의 종류가 아니에요. 표에서는 열마다 곱을 직접 확인해요.",
    core: "반비례에서는 x×y가 일정한 수 a로 유지돼요.",
  },
  {
    id: "m1u3e142",
    lessonId: L,
    type: "num",
    prompt: `간식 ${TOTAL_142}개를 <b>8개 모둠</b>에 똑같이 나누어 줄 때, 한 모둠이 받는 간식 수를 구하세요.`,
    answer: String(TOTAL_142 / 8),
    numKind: "int",
    unitLabel: "개",
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>간식의 전체 개수 ${TOTAL_142}은 고정되어 있어요. 모둠 수를 ${withVars("x")}, 한 모둠의 간식 수를 ${withVars("y")}라고 하면 ${withVars(`xy=${TOTAL_142}`)}, 곧 ${withVars(`y=${TOTAL_142}/x`)}예요. 8개 모둠이면 ${withVars("y")}=${TOTAL_142}÷8=<b>${TOTAL_142 / 8}</b>개예요. <span class='xh'>계산 함정 격파</span>${TOTAL_142}+8처럼 더하면 전체를 똑같이 나누는 상황을 나타내지 못해요. 8÷${TOTAL_142}처럼 나누는 순서를 바꾸면 한 모둠의 개수가 아니라 전체에 대한 모둠 수의 비율이 돼요. 검산하면 8×${TOTAL_142 / 8}=${TOTAL_142}로 나누어 준 간식을 다시 모두 합쳤을 때 원래 전체와 정확히 같아요. 단위도 개로 맞아요.`,
    core: `고정된 ${TOTAL_142}개를 8모둠에 나누면 한 모둠에 ${TOTAL_142 / 8}개예요.`,
  },
  {
    id: "m1u3e143",
    lessonId: L,
    type: "mcq",
    prompt: "다음 중 <i class='mv'>y</i>가 <i class='mv'>x</i>에 반비례하는 관계식은?",
    options: [withVars("y=5x"), withVars("y=x/40"), withVars("y=40−x"), withVars("y=40/x"), withVars("y=x+40")],
    answer: 3,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>반비례 관계식은 ${withVars("y=a/x")} 꼴이고 ${withVars("a")}는 0이 아닌 일정한 수예요. 따라서 <b>${withVars("y=40/x")}</b>가 반비례를 나타내며 ${withVars("xy=40")}이 항상 성립해요. <span class='xh'>오답 하나씩 격파</span>'${withVars("y=5x")}'는 ${withVars("x")}에 5를 곱하는 정비례예요. '${withVars("y=x/40")}'도 모양에 나눗셈이 보이지만 실제로는 ${withVars("y=(1/40)x")}라 정비례예요. '${withVars("y=40−x")}'는 ${withVars("x")}가 늘면 ${withVars("y")}가 줄어도 곱이 일정하지 않고, '${withVars("y=x+40")}'은 일정한 수를 더한 관계예요. 분모에 ${withVars("x")}가 있는지와 곱이 일정한지를 함께 확인해요.`,
    core: "y=40/x는 xy=40이 일정하므로 반비례 관계식이에요.",
  },
  {
    id: "m1u3e144",
    lessonId: L,
    type: "multi",
    prompt: "표에 대한 설명으로 <b>옳은 것을 모두</b> 고르세요.",
    figure: FIG_144,
    options: [
      "각 열에서 xy=60이다",
      "y/x가 항상 6이다",
      "x가 10에서 20으로 2배가 될 때 y는 절반이 된다",
      "x=0을 넣어도 y를 정할 수 있다",
      "x=5일 때 y=12이다",
    ].map(withVars),
    answer: [0, 2, 4],
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>표의 곱은 2×30=5×12=10×6=20×3=60이므로 ${withVars("xy=60")}이 옳아요. ${withVars("x")}가 10에서 20으로 2배일 때 ${withVars("y")}는 6에서 3으로 절반이 되고, ${withVars("x=5")}일 때 ${withVars("y=12")}도 표와 맞아요.<span class='xh'>틀린 설명 격파</span>${withVars("y/x")}는 15, 2.4, 0.6, 0.15로 일정하지 않아요. 또 ${withVars("y=60/x")}에서 ${withVars("x=0")}은 분모를 0으로 만들므로 사용할 수 없어요. 한 열만 보지 말고 곱, 배수 변화, 0 사용 가능 여부를 각각 확인하고 선택한 세 문장을 표에 다시 대입해요.`,
    core: "표는 xy=60이고 x가 2배면 y는 절반이며 x=0은 쓸 수 없어요.",
  },
  {
    id: "m1u3e145",
    lessonId: L,
    type: "num",
    prompt: withVars(`y=${shown(NEGATIVE_TOTAL_145)}/x에서 y=8일 때 x의 값을 구하세요.`),
    answer: String(NEGATIVE_TOTAL_145 / 8),
    numKind: "int",
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>주어진 식은 ${withVars(`xy=${shown(NEGATIVE_TOTAL_145)}`)}와 같아요. ${withVars("y=8")}을 넣으면 8${withVars("x")}=${shown(NEGATIVE_TOTAL_145)}이므로 ${withVars("x")}=${shown(NEGATIVE_TOTAL_145)}÷8=<b>${shown(NEGATIVE_TOTAL_145 / 8)}</b>이에요. 원래 식에 넣어 ${shown(NEGATIVE_TOTAL_145)}÷(${shown(NEGATIVE_TOTAL_145 / 8)})=8이 되는지 검산할 수 있어요. <span class='xh'>부호 함정 격파</span>7은 두 음수가 나뉠 때의 결과와 혼동한 값이지만, 여기서는 음수 ${shown(NEGATIVE_TOTAL_145)}을 양수 8로 나누므로 답이 음수예요. −64와 −48은 ${shown(NEGATIVE_TOTAL_145)}에서 8을 더하거나 뺀 값이고, −448은 곱한 값이라 식을 만족하지 않아요. 입력할 때는 -7로 쓰고 곱의 부호를 다시 확인해요.`,
    core: "xy=−56에 y=8을 넣어 x=−7을 구해요.",
  },
  {
    id: "m1u3e146",
    lessonId: L,
    type: "mcq",
    prompt: `넓이가 ${GARDEN_AREA} m²로 일정한 직사각형 텃밭의 가로 길이를 <i class='mv'>x</i> m, 세로 길이를 <i class='mv'>y</i> m라고 할 때 관계식은?`,
    options: [withVars(`y=${GARDEN_AREA}/x`), withVars(`y=${GARDEN_AREA}x`), withVars(`y=x/${GARDEN_AREA}`), withVars(`y=${GARDEN_AREA}−x`), withVars(`y=x+${GARDEN_AREA}`)],
    answer: 0,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>직사각형의 넓이는 가로×세로이므로 ${withVars(`xy=${GARDEN_AREA}`)}예요. 양변을 ${withVars("x")}로 나누면 <b>${withVars(`y=${GARDEN_AREA}/x`)}</b>가 되고, 고정된 넓이를 두 변이 나누어 가지므로 반비례 관계예요. <span class='xh'>오답 하나씩 격파</span>'${withVars(`y=${GARDEN_AREA}x`)}'는 길이를 곱할수록 세로도 늘어 넓이가 일정하지 않아요. '${withVars(`y=x/${GARDEN_AREA}`)}'는 분자와 분모의 역할을 뒤집었고, '${withVars(`y=${GARDEN_AREA}−x`)}'는 두 길이의 합을 ${GARDEN_AREA}로 고정한 다른 관계예요. '${withVars(`y=x+${GARDEN_AREA}`)}'도 넓이 조건과 무관해요. 예를 들어 ${withVars("x=9")}이면 ${withVars("y=7")}로 곱이 ${GARDEN_AREA}인지 확인할 수 있어요.`,
    core: `고정 넓이 조건 xy=${GARDEN_AREA}에서 y=${GARDEN_AREA}/x를 얻어요.`,
  },
  {
    id: "m1u3e147",
    lessonId: L,
    type: "num",
    prompt: `빈 물탱크에 1분에 <b>6 L</b>씩 물을 넣으면 가득 채우는 데 <b>14분</b>이 걸려요. 1분에 넣는 물의 양을 ${withVars("x")} L, 가득 채우는 데 걸리는 시간을 ${withVars("y")}분이라 할 때, 1분에 12 L씩 넣으면 몇 분이 걸리는지 구하세요.`,
    answer: String(WORK_AMOUNT / 12),
    numKind: "int",
    unitLabel: "분",
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>물탱크에 들어가는 전체 물의 양은 6×14=${WORK_AMOUNT} L로 일정해요. 1분에 넣는 양과 걸리는 시간의 곱이 항상 전체 양이므로 ${withVars(`xy=${WORK_AMOUNT}`)}이고, ${withVars("x=12")}를 넣으면 ${withVars("y")}=${WORK_AMOUNT}÷12=<b>${WORK_AMOUNT / 12}</b>분이에요. <span class='xh'>계산 함정 격파</span>14−6=8이나 12+2처럼 더하고 빼는 계산은 전체 양이 일정하다는 구조를 쓰지 못해요. 1분에 넣는 양이 6에서 12로 2배가 되었으므로 시간은 14분의 절반인 7분이라는 배수 풀이와도 일치해요. 검산하면 12×${WORK_AMOUNT / 12}=${WORK_AMOUNT} L로 처음 계산한 물탱크의 전체 양과 정확히 같아요.`,
    core: `전체 양 ${WORK_AMOUNT} L가 일정하므로 xy=${WORK_AMOUNT}에서 y=7분이에요.`,
  },
  {
    id: "m1u3e148",
    lessonId: L,
    type: "mcq",
    prompt: withVars("y=20−x가 x가 커질수록 y가 작아져도 반비례가 아닌 까닭으로 가장 알맞은 것은?"),
    options: [
      "x와 y가 모두 자연수가 아니기 때문에",
      "x=0일 때 y=20이기 때문에",
      "x와 y의 곱이 일정하지 않기 때문에",
      "x와 y의 합이 일정하기 때문에만",
      "y가 x보다 항상 작기 때문에",
    ].map(withVars),
    answer: 2,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>반비례의 판정 기준은 단순한 감소가 아니라 ${withVars("x×y")}가 일정한지예요. ${withVars("x=1, y=19")}일 때 곱은 19이고 ${withVars("x=2, y=18")}일 때 곱은 36이므로 일정하지 않아요. 따라서 <b>${withVars("x와 y의 곱이 일정하지 않기 때문")}</b>이에요. <span class='xh'>오답 하나씩 격파</span>자연수인지 아닌지는 반비례 여부를 정하지 않아요. ${withVars("x=0")}을 넣었을 때 값이 나온다는 사실은 힌트가 될 수 있지만 핵심 판별은 곱이에요. 합이 20으로 일정하다는 설명은 맞는 관찰이지만 '때문에만'으로는 반비례의 기준을 직접 말하지 못해요. ${withVars("y")}가 언제나 ${withVars("x")}보다 작은 것도 아니므로 마지막 설명도 틀려요.`,
    core: "감소 여부가 아니라 x와 y의 곱이 일정한지로 반비례를 판별해요.",
  },
  {
    id: "m1u3e149",
    lessonId: L,
    type: "multi",
    prompt: withVars("y=32/x에 대한 설명으로 옳은 것을 모두 고르세요."),
    options: [
      withVars("x=4일 때 y=8이다"),
      withVars("x가 2배가 되면 y도 2배가 된다"),
      withVars("x=8일 때 y=4이다"),
      withVars("x=16일 때 y=2이다"),
      withVars("x와 y의 곱은 16이다"),
    ],
    answer: [0, 2, 3],
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>${withVars("x=4")}를 넣으면 ${withVars("y=32÷4=8")}, ${withVars("x=8")}을 넣으면 ${withVars("y=32÷8=4")}, ${withVars("x=16")}을 넣으면 ${withVars("y=32÷16=2")}예요. 따라서 세 값 대입 설명이 옳아요.<span class='xh'>틀린 설명 격파</span>반비례에서는 ${withVars("x")}가 2배가 되면 ${withVars("y")}는 2배가 아니라 절반이 돼요. 또 식을 ${withVars("xy=32")}로 고칠 수 있으므로 일정한 곱은 16이 아니라 32예요. 각 보기를 따로 판단하되 값 대입은 나눗셈으로 하고, 정답으로 고른 세 점의 좌표를 곱했을 때 모두 32가 되는지도 끝까지 빠짐없이 검산해요.`,
    core: "x가 4, 8, 16일 때 y는 각각 8, 4, 2예요.",
  },
  {
    id: "m1u3e150",
    lessonId: L,
    type: "mcq",
    prompt: `주스 ${FILE_TOTAL} L를 5개가 아니라 <b>15개</b>의 병에 똑같이 나누어 담으면 한 병에 담기는 양은?`,
    options: ["15 L", "45 L", "9 L", "1 L", "3 L"],
    answer: 4,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>주스의 전체 양 ${FILE_TOTAL} L는 그대로이고 이를 15개의 병에 똑같이 나누므로 한 병의 몫은 ${FILE_TOTAL}÷15=<b>3 L</b>예요. 5개일 때는 9 L였고 병의 수가 3배가 되자 한 병의 몫이 1/3배가 되어 반비례의 변화와도 맞아요.<span class='xh'>오답 하나씩 격파</span>'15 L'는 병의 수를 주스 양으로 옮긴 값이고, '45 L'는 전체량이라 한 병의 몫이 아니에요. '9 L'는 5개의 병에 나눌 때의 이전 몫을 그대로 썼어요. '1 L'는 병이 3배가 된 뒤 9를 다시 9로 나눈 값이에요. 마지막에 15×3=45로 전체량이 보존되는지 확인해요.`,
    core: "45 L를 15개의 병에 나누면 한 병에 3 L예요.",
  },
  {
    id: "m1u3e151",
    lessonId: L,
    type: "num",
    prompt: "표와 같은 반비례 관계에서 <i class='mv'>x</i>=12일 때 <i class='mv'>y</i>의 값을 구하세요.",
    figure: inverseTable(TABLE_151),
    answer: String(TABLE_151_A / 12),
    numKind: "int",
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>표에서 한 열을 골라 곱하면 (${shown(-14)})×6=${shown(TABLE_151_A)}예요. 다른 열도 (${shown(-7)})×12=${shown(TABLE_151_A)}, 3×(${shown(-28)})=${shown(TABLE_151_A)}로 같으므로 관계식은 ${withVars(`y=${shown(TABLE_151_A)}/x`)}예요. ${withVars("x=12")}를 넣으면 ${withVars("y")}=${shown(TABLE_151_A)}÷12=<b>${shown(TABLE_151_A / 12)}</b>이에요. <span class='xh'>부호 함정 격파</span>7이라고 하면 음수를 양수로 바꾼 값이에요. −72는 ${shown(TABLE_151_A)}와 12를 더한 값이고, −1008은 곱한 값이라 관계식의 나눗셈을 따르지 않았어요. 입력할 때는 -7로 쓰고, 12×(${shown(TABLE_151_A / 12)})=${shown(TABLE_151_A)}인지 검산해 부호와 곱을 모두 확인해요.`,
    core: "표의 일정한 곱 −84를 12로 나누면 y=−7이에요.",
  },
  {
    id: "m1u3e152",
    lessonId: L,
    type: "mcq",
    prompt: "<i class='mv'>y</i>가 <i class='mv'>x</i>에 반비례하고 <i class='mv'>x</i>=−4일 때 <i class='mv'>y</i>=7이에요. <i class='mv'>x</i>=14일 때 <i class='mv'>y</i>의 값은?",
    options: ["2", "−2", "−8", "8", "−49"],
    answer: 1,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>먼저 일정한 수를 구하면 <i class='mv'>a</i>=<i class='mv'>x</i><i class='mv'>y</i>=(−4)×7=−28이에요. 따라서 관계식은 <i class='mv'>y</i>=−28/<i class='mv'>x</i>이고, <i class='mv'>x</i>=14를 넣으면 <i class='mv'>y</i>=−28÷14=<b>−2</b>예요. <span class='xh'>오답 하나씩 격파</span>'2'는 마지막 나눗셈에서 음수 부호를 빠뜨렸어요. '−8'은 −4와 14의 변화만 보고 근거 없이 정한 값이고, '8'은 그 부호까지 바꾼 값이에요. '−49'는 처음의 <i class='mv'>y</i>=7과 새 <i class='mv'>x</i>=14를 잘못 곱한 결과예요. 처음 한 쌍으로 <i class='mv'>a</i>를 확정한 뒤 새 <i class='mv'>x</i>를 넣고, 14×(−2)=−28인지 검산해요.",
    core: "a=(−4)×7=−28이고 −28÷14=−2예요.",
  },
  {
    id: "m1u3e153",
    lessonId: L,
    type: "num",
    prompt: "같은 양의 작업을 24명이 하면 15일이 걸려요. 한 사람의 하루 작업량이 일정할 때 40명이 하면 며칠이 걸리는지 구하세요.",
    answer: "9",
    numKind: "int",
    unitLabel: "일",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>작업량이 같고 한 사람의 하루 작업량이 일정하므로 사람 수×걸린 날수가 일정해요. 전체 작업량을 사람-날로 나타내면 24×15=360이고, 40명이 할 때 걸리는 날수는 360÷40=<b>9일</b>이에요.<span class='xh'>계산 함정 격파</span>사람이 16명 늘었다고 15−16을 하거나, 사람 수 비 40÷24를 걸린 날수에 그대로 곱하면 작업량이 보존되지 않아요. 사람이 많아질수록 걸리는 날수는 줄어드는 반비례 관계예요. 40×9=360으로 처음의 24×15와 같은지 검산하면 답과 상황이 모두 맞아요. 사람마다 작업 능력이 같다는 조건도 함께 확인해요.",
    core: "24×15=360 사람-날을 40명으로 나누면 9일이에요.",
  },
  {
    id: "m1u3e154",
    lessonId: L,
    type: "mcq",
    prompt: "직사각형 화단 A와 B의 넓이는 각각 32 m², 56 m²이고 가로 길이는 모두 8 m예요. B의 세로 길이는 A의 세로 길이보다 몇 m 더 긴가요?",
    options: ["24", "11", "4", "3", "7"],
    answer: 3,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>넓이=가로×세로이므로 세로 길이는 넓이를 가로 길이로 나누어 구해요. A의 세로는 32÷8=4 m, B의 세로는 56÷8=7 m예요. 따라서 B가 A보다 7−4=<b>3 m</b> 더 길어요.<span class='xh'>오답 하나씩 격파</span>'24'는 두 넓이 56−32의 차를 그대로 길이로 옮겨 단위를 섞었어요. '11'은 두 세로 길이 7과 4를 더한 값이고, '4'와 '7'은 각각 한 화단의 세로 길이만 답한 값이에요. 두 화단에서 가로 길이가 같으므로 (56−32)÷8=3으로 한 번에 검산할 수도 있어요. 넓이와 길이의 단위를 끝까지 구분해요.",
    core: "두 세로 길이 4 m와 7 m의 차는 3 m예요.",
  },
  {
    id: "m1u3e155",
    lessonId: L,
    type: "mcq",
    prompt: "<i class='mv'>y</i>가 <i class='mv'>x</i>에 반비례하고 <i class='mv'>x</i>=<i class='mv'>p</i>일 때 <i class='mv'>y</i>=21이에요. <i class='mv'>x</i>=3<i class='mv'>p</i>일 때의 <i class='mv'>y</i>를 <i class='mv'>q</i>, <i class='mv'>x</i>=7<i class='mv'>p</i>일 때의 <i class='mv'>y</i>를 <i class='mv'>r</i>라 하면 <i class='mv'>q</i>+<i class='mv'>r</i>의 값은?",
    options: ["10", "24", "28", "31.5", "84"],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>반비례에서는 <i class='mv'>x</i>가 몇 배가 되면 <i class='mv'>y</i>는 그 배수로 나누어져요. <i class='mv'>x</i>=3<i class='mv'>p</i>일 때 <i class='mv'>q</i>=21÷3=7이고, <i class='mv'>x</i>=7<i class='mv'>p</i>일 때 <i class='mv'>r</i>=21÷7=3이에요. 따라서 <i class='mv'>q</i>+<i class='mv'>r</i>=7+3=<b>10</b>이에요. <span class='xh'>오답 하나씩 격파</span>'24'는 21과 3을 더한 값, '28'은 21과 7을 더한 값이에요. '31.5'는 21에 잘못 정한 배수를 적용했고, '84'는 21×(3+1)처럼 반비례를 곱셈 관계로 처리한 값이에요. <i class='mv'>p</i>의 실제 값을 몰라도 배수 변화만으로 두 값을 각각 구할 수 있어요.",
    core: "x가 3배, 7배이면 y는 각각 1/3배, 1/7배가 돼요.",
  },
];
