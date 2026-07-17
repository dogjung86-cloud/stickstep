// 중1 수학 Ⅲ. 좌표평면과 그래프: 단원 종합 평가 풀, 레슨 1 좌표와 순서쌍 (m1u3e001~m1u3e022). 2026-07 개보수: e020 삼각형 넓이(교과서 대조 신작).
// 유형 13(mcq+multi)/7(num)/2(word), diff 9/9/4. 좌표는 planeSpec 기반 MExamPlaneSpec 한 곳에서 그림과 문항을 함께 만든다.
import type { ExamItem } from "./types";
import { mExamPlaneFig, type MExamPlaneSpec } from "../../ui/examFiguresMath";

const L = "m1u3l1";
const minus = (value: number): string => String(value).replace("-", "−");
const coord = (x: number, y: number): string => `(${minus(x)}, ${minus(y)})`;
const pointOf = (spec: MExamPlaneSpec, label: string) => {
  const point = spec.points.find((candidate) => candidate.label === label);
  if (!point) throw new Error(`m1u3l1 plane point missing: ${label}`);
  return point;
};

const PLANE_001: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [
    { label: "A", x: -5, y: 4, color: "#2F9E44" },
    { label: "B", x: 3, y: -2, color: "#364FC7" },
    { label: "C", x: 0, y: 5, color: "#E8547E", labelDx: 12 },
  ],
};

const PLANE_002: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [
    { label: "D", x: -6, y: 0, color: "#E8547E", labelDx: 12, labelDy: -10 },
    { label: "E", x: 0, y: -4, color: "#364FC7", labelDx: 12 },
    { label: "F", x: 2, y: 3, color: "#2F9E44" },
  ],
};

const PLANE_010: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [
    { label: "G", x: -4, y: -1, color: "#364FC7", labelDy: 20 },
    { label: "H", x: 5, y: 2, color: "#E8547E" },
    { label: "J", x: 0, y: 6, color: "#2F9E44", labelDx: 12, labelDy: 18 },
  ],
};

const PLANE_013: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 2,
  points: [
    { label: "K", x: -2, y: 6, color: "#E8547E", labelDy: 18 },
    { label: "L", x: 4, y: -5, color: "#364FC7" },
    { label: "M", x: -6, y: 0, color: "#2F9E44", labelDx: 12, labelDy: -10 },
  ],
};

const PLANE_020: MExamPlaneSpec = {
  min: -7,
  max: 7,
  labelEvery: 1,
  points: [
    { label: "A", x: -2, y: 3, color: "#E8547E" },
    { label: "B", x: -2, y: -2, color: "#364FC7", labelDx: -13, labelDy: 18 },
    { label: "C", x: 4, y: -2, color: "#2F9E44", labelDx: 13, labelDy: 18 },
  ],
};

const B001 = pointOf(PLANE_001, "B");
const E002 = pointOf(PLANE_002, "E");
const G010 = pointOf(PLANE_010, "G");
const H010 = pointOf(PLANE_010, "H");
const J010 = pointOf(PLANE_010, "J");
const K013 = pointOf(PLANE_013, "K");
const A020 = pointOf(PLANE_020, "A");
const B020 = pointOf(PLANE_020, "B");
const C020 = pointOf(PLANE_020, "C");
const TRI_BASE = C020.x - B020.x;
const TRI_HEIGHT = A020.y - B020.y;
const TRI_AREA = (TRI_BASE * TRI_HEIGHT) / 2;

export const POOL_M1U3L1: ExamItem[] = [
  {
    id: "m1u3e001",
    lessonId: L,
    type: "mcq",
    prompt: "그림에서 점 <b>B</b>의 좌표는?",
    figure: mExamPlaneFig(PLANE_001),
    options: [
      coord(B001.x, B001.y),
      coord(B001.y, B001.x),
      coord(-B001.x, -B001.y),
      coord(B001.x, -B001.y),
      coord(B001.y, -B001.x),
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>점 B에서 가로 위치를 먼저 읽으면 원점에서 오른쪽으로 3칸이므로 <i class='mv'>x</i>좌표는 3이에요. 세로 위치는 아래로 2칸이므로 <i class='mv'>y</i>좌표는 −2예요. 따라서 B의 좌표는 <b>(3, −2)</b>예요.<span class='xh'>오답 하나씩 격파</span>'(−2, 3)'은 세로값을 먼저 쓰고 부호까지 바꾼 답, '(−3, 2)'는 두 부호를 모두 거꾸로 읽은 답이에요. '(3, 2)'는 아래쪽의 음수 부호를 빠뜨렸고, '(−2, −3)'은 좌표 순서를 바꾼 뒤 둘 다 음수로 적었어요. 좌표는 언제나 가로 <i class='mv'>x</i>, 세로 <i class='mv'>y</i> 순서로 읽어요.",
    core: "좌표는 가로 x부터, 세로 y를 둘째로 읽어요.",
  },
  {
    id: "m1u3e002",
    lessonId: L,
    type: "mcq",
    prompt: "그림에서 점 <b>E</b>의 좌표를 옳게 나타낸 것은?",
    figure: mExamPlaneFig(PLANE_002),
    options: [
      coord(E002.y, E002.x),
      coord(-E002.y, E002.x),
      coord(E002.x, E002.y),
      coord(E002.x, -E002.y),
      coord(E002.y, E002.y),
    ],
    answer: 2,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>점 E는 세로축인 <i class='mv'>y</i>축 위에 있어요. <i class='mv'>y</i>축 위의 점은 가로로 움직인 거리가 없으므로 <i class='mv'>x</i>좌표가 0이에요. E는 원점에서 아래로 4칸이므로 <i class='mv'>y</i>좌표는 −4, 좌표는 <b>(0, −4)</b>예요.<span class='xh'>오답 하나씩 격파</span>'(−4, 0)'과 '(4, 0)'은 E를 <i class='mv'>x</i>축 위의 점처럼 읽은 답이에요. '(0, 4)'는 아래쪽 점의 부호를 양수로 잘못 적었고, '(−4, −4)'는 축 위 점인데도 <i class='mv'>x</i>좌표를 0이 아닌 값으로 썼어요. 축 위에서는 어느 좌표가 0인지부터 확인해요.",
    core: "y축 위 점은 x좌표가 0이에요.",
  },
  {
    id: "m1u3e003",
    lessonId: L,
    type: "num",
    prompt: "점 P의 좌표가 <b>(−7, 3)</b>일 때, P의 <i class='mv'>x</i>좌표를 쓰세요.",
    answer: "-7",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>좌표 (−7, 3)에서 첫째 수가 <i class='mv'>x</i>좌표이고 둘째 수가 <i class='mv'>y</i>좌표예요. 따라서 P의 <i class='mv'>x</i>좌표는 <b>−7</b>이에요. −7은 원점에서 왼쪽으로 7만큼 떨어졌다는 뜻이고, 둘째 수 3은 위쪽 위치를 나타내요.<span class='xh'>헷갈림 격파</span>'3'을 쓰면 둘째 수를 첫째 수로 바꿔 읽은 거예요. '7'을 쓰면 첫째 수의 위치는 찾았지만 왼쪽을 나타내는 음수 부호를 놓친 것이고요. 순서쌍을 보면 먼저 첫째 수 전체를 부호까지 묶어서 읽고, 그다음 둘째 수로 넘어가요. 음수 정답은 입력할 때 -7로 넣으면 화면에는 −7로 보여요.",
    core: "첫째 수가 x좌표이며 부호까지 함께 읽어요.",
  },
  {
    id: "m1u3e004",
    lessonId: L,
    type: "num",
    prompt: "점 Q의 좌표가 <b>(5, −8)</b>일 때, Q의 <i class='mv'>y</i>좌표를 쓰세요.",
    answer: "-8",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>순서쌍 (5, −8)의 둘째 수가 <i class='mv'>y</i>좌표예요. 그러므로 Q의 <i class='mv'>y</i>좌표는 <b>−8</b>이에요. 첫째 수 5는 오른쪽으로 간 가로 위치, 둘째 수 −8은 아래로 간 세로 위치를 나타내요.<span class='xh'>헷갈림 격파</span>'5'는 <i class='mv'>x</i>좌표를 대신 쓴 값이에요. '8'은 둘째 수를 골랐지만 아래쪽을 뜻하는 음수 부호를 빠뜨린 값이고요. 좌표를 읽을 때는 괄호 속 두 수를 따로 떼어 보되, 각 수의 부호는 절대로 떼어 버리지 않아요. 입력 칸에는 -8을 넣고, 좌표 표기에서는 U+2212 기호인 −8로 읽으면 돼요.",
    core: "둘째 수가 y좌표이며 아래쪽은 음수예요.",
  },
  {
    id: "m1u3e005",
    lessonId: L,
    type: "mcq",
    prompt: "<i class='mv'>x</i>축 위의 점에 대한 설명으로 옳은 것은?",
    options: [
      "x좌표가 항상 0이다",
      "x좌표와 y좌표가 항상 같다",
      "두 좌표가 모두 양수이다",
      "y좌표가 항상 0이다",
      "두 좌표가 모두 0이다",
    ],
    answer: 3,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>축은 가로 방향의 좌표축이에요. 그 위의 점은 위나 아래로 움직인 거리가 없으므로 세로 위치인 <i class='mv'>y</i>좌표가 항상 <b>0</b>이에요. 예를 들어 (−6, 0)과 (4, 0)은 모두 <i class='mv'>x</i>축 위에 있어요.<span class='xh'>오답 하나씩 격파</span>'x좌표가 항상 0'은 <i class='mv'>y</i>축의 성질이에요. 두 좌표가 같을 필요도, 모두 양수일 필요도 없어요. '두 좌표가 모두 0'은 축 위의 모든 점이 아니라 원점 한 곳만 설명하죠. 가로축 위에서는 세로 이동이 없다는 장면을 떠올리면 <i class='mv'>y</i>=0을 바로 찾을 수 있어요.",
    core: "x축 위에서는 세로 이동이 없어서 y좌표가 0이에요.",
  },
  {
    id: "m1u3e006",
    lessonId: L,
    type: "word",
    prompt: "<i class='mv'>x</i>축과 <i class='mv'>y</i>축이 만나는 점의 이름을 고르세요.",
    answer: "원점",
    bank: ["원점", "좌표축", "순서쌍", "좌표평면", "x좌표", "y좌표", "첫째 수", "둘째 수"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>축과 <i class='mv'>y</i>축이 만나는 한 점을 <b>원점</b>이라고 해요. 원점은 가로로도 세로로도 움직이지 않은 자리이므로 좌표가 (0, 0)이고, 보통 알파벳 O로 표시해요.<span class='xh'>낱말 하나씩 격파</span>'좌표축'은 두 축을 함께 부르는 말이고, '좌표평면'은 두 축이 놓인 전체 평면이에요. '순서쌍'은 순서를 정해 두 수를 짝지은 표현이며, 'x좌표'와 'y좌표'는 점의 위치를 나타내는 두 성분이에요. '첫째 수'와 '둘째 수'는 순서쌍 안의 자리 설명일 뿐, 두 축의 교점 이름은 아니에요.",
    core: "두 좌표축의 교점은 원점 O, 좌표는 (0, 0)이에요.",
  },
  {
    id: "m1u3e007",
    lessonId: L,
    type: "mcq",
    prompt: "두 순서쌍 <b>(4, −1)</b>과 같은 순서쌍은?",
    options: [coord(-1, 4), coord(4, -1), coord(-4, 1), coord(1, -4), coord(4, 1)],
    answer: 1,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>두 순서쌍이 같으려면 첫째 수끼리 같고 둘째 수끼리도 같아야 해요. 기준은 첫째 수 4, 둘째 수 −1이므로 그대로 <b>(4, −1)</b>인 순서쌍만 같아요.<span class='xh'>오답 하나씩 격파</span>'(−1, 4)'는 두 수의 순서를 뒤집었어요. '(−4, 1)'은 두 부호를 모두 바꿨고, '(1, −4)'는 순서를 바꾸면서 수의 크기도 달라졌어요. '(4, 1)'은 첫째 수는 맞지만 둘째 수의 음수 부호를 빠뜨렸죠. 같은 두 수를 사용했다는 것만으로는 부족하고, 자리와 부호까지 모두 일치해야 같은 순서쌍이에요.",
    core: "순서쌍은 첫째·둘째 자리와 부호가 모두 같아야 해요.",
  },
  {
    id: "m1u3e008",
    lessonId: L,
    type: "num",
    prompt: "두 순서쌍 <b>(<i class='mv'>a</i>+2, −5)</b>와 <b>(9, −5)</b>가 서로 같을 때, <i class='mv'>a</i>의 값을 쓰세요.",
    answer: "7",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>같은 순서쌍은 같은 자리끼리 같아요. 둘째 수 −5는 이미 일치하므로 첫째 수만 비교하면 <i class='mv'>a</i>+2=9예요. 양쪽에서 2를 빼면 <i class='mv'>a</i>=<b>7</b>이에요. 검산하면 (7+2, −5)=(9, −5)로 두 자리가 모두 맞아요.<span class='xh'>헷갈림 격파</span>'9'를 그대로 답으로 쓰면 첫째 성분 전체와 <i class='mv'>a</i>를 구분하지 않은 거예요. '11'은 2를 빼지 않고 더한 값이고, '−7'은 계산 뒤 부호를 근거 없이 바꾼 값이에요. 순서쌍의 등식에서는 먼저 같은 자리끼리 작은 식을 세우고, 마지막에 원래 순서쌍으로 검산해요.",
    core: "같은 순서쌍은 같은 자리끼리 식을 세워요.",
  },
  {
    id: "m1u3e009",
    lessonId: L,
    type: "mcq",
    prompt: "점 T가 원점에서 <b>왼쪽으로 6칸, 위로 2칸</b>인 곳에 있을 때 T의 좌표는?",
    options: [coord(-6, 2), coord(6, 2), coord(-2, 6), coord(2, -6), coord(-6, -2)],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>왼쪽으로 6칸은 가로 위치가 음수이므로 <i class='mv'>x</i>좌표가 −6이에요. 위로 2칸은 세로 위치가 양수이므로 <i class='mv'>y</i>좌표가 2예요. 따라서 좌표는 <b>(−6, 2)</b>예요.<span class='xh'>오답 하나씩 격파</span>'(6, 2)'는 왼쪽을 오른쪽으로 바꿔 읽었어요. '(−2, 6)'은 이동 방향은 어느 정도 기억했지만 가로와 세로의 순서를 뒤집었고, '(2, −6)'은 순서와 부호를 함께 잘못 잡았어요. '(−6, −2)'는 위쪽 이동을 아래쪽 음수로 적은 답이에요. 가로 이동을 먼저, 세로 이동을 다음에 적는 습관을 지켜요.",
    core: "왼쪽은 x 음수, 위쪽은 y 양수예요.",
  },
  {
    id: "m1u3e010",
    lessonId: L,
    type: "multi",
    prompt: "그림의 점 G, H, J에 대한 설명으로 <b>옳은 것을 모두</b> 고르세요.",
    figure: mExamPlaneFig(PLANE_010),
    options: [
      `점 G의 좌표는 ${coord(G010.y, G010.x)}이다`,
      `점 H의 x좌표는 ${H010.x}이다`,
      `점 J의 y좌표는 ${J010.x}이다`,
      `점 J의 좌표는 ${coord(J010.x, J010.y)}이다`,
      `점 G의 y좌표는 ${Math.abs(G010.y)}이다`,
    ],
    answer: [1, 3],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그림에서 G는 왼쪽 4, 아래 1이므로 (−4, −1), H는 오른쪽 5, 위 2이므로 (5, 2), J는 <i class='mv'>y</i>축 위 6이므로 (0, 6)이에요. 따라서 'H의 x좌표는 5'와 'J의 좌표는 (0, 6)'이 옳아요.<span class='xh'>오답 하나씩 격파</span>'G는 (−1, −4)'는 좌표 순서를 뒤집었어요. 'J의 y좌표는 0'은 <i class='mv'>y</i>축 위 점에서 0이 되는 성분을 거꾸로 골랐고, 실제로 0인 것은 <i class='mv'>x</i>좌표예요. 'G의 y좌표는 1'은 아래쪽 점의 음수 부호를 놓쳤어요. 여러 점도 각각 가로, 세로 순서로 독립 확인해요.",
    core: "각 점마다 x부터 y까지 부호와 축을 따로 확인해요.",
  },
  {
    id: "m1u3e011",
    lessonId: L,
    type: "num",
    prompt: "점 U(<i class='mv'>k</i>, −6)가 <i class='mv'>y</i>축 위에 있을 때, <i class='mv'>k</i>의 값을 쓰세요.",
    answer: "0",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>y</i>축 위의 점은 가로 위치가 없어서 <i class='mv'>x</i>좌표가 0이에요. U(<i class='mv'>k</i>, −6)에서 첫째 성분 <i class='mv'>k</i>가 바로 <i class='mv'>x</i>좌표이므로 <i class='mv'>k</i>=<b>0</b>이에요. 그러면 U의 좌표는 (0, −6)이 되어 실제로 <i class='mv'>y</i>축 아래쪽에 놓여요.<span class='xh'>헷갈림 격파</span>'−6'은 둘째 성분인 <i class='mv'>y</i>좌표를 그대로 답한 값이에요. '6'은 그 부호까지 빠뜨린 값이고요. <i class='mv'>y</i>축이라는 이름 때문에 <i class='mv'>y</i>좌표가 0이라고 착각하기 쉽지만, 축을 따라 움직이는 세로값은 달라질 수 있고 축에서 벗어나는 가로값이 0이라는 점을 기억해요.",
    core: "y축 위 점의 첫째 성분, 곧 x좌표는 0이에요.",
  },
  {
    id: "m1u3e012",
    lessonId: L,
    type: "mcq",
    prompt: "원점 O의 좌표는?",
    options: [coord(1, 0), coord(0, 1), coord(-1, 0), coord(0, -1), coord(0, 0)],
    answer: 4,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>원점 O는 <i class='mv'>x</i>축과 <i class='mv'>y</i>축이 만나는 자리예요. 가로 이동도 0, 세로 이동도 0이므로 좌표는 <b>(0, 0)</b>이에요.<span class='xh'>오답 하나씩 격파</span>'(1, 0)'은 원점에서 오른쪽으로 1칸인 <i class='mv'>x</i>축 위 점이고, '(−1, 0)'은 왼쪽으로 1칸인 점이에요. '(0, 1)'은 원점 위쪽의 <i class='mv'>y</i>축 위 점, '(0, −1)'은 아래쪽의 점이죠. 좌표 하나만 0이면 어느 축 위일 뿐이고, 두 좌표가 모두 0이어야 두 축의 교점인 원점이에요. O라는 글자와 숫자 0도 구별해서 읽어요.",
    core: "원점은 가로·세로 이동이 모두 0인 (0, 0)이에요.",
  },
  {
    id: "m1u3e013",
    lessonId: L,
    type: "mcq",
    prompt: `그림에서 <i class='mv'>x</i>좌표가 <b>${minus(K013.x)}</b>이고 <i class='mv'>y</i>좌표가 <b>${minus(K013.y)}</b>인 점은?`,
    figure: mExamPlaneFig(PLANE_013),
    options: ["점 L", "점 M", "점 K", "원점 O", "그림에 없는 점"],
    answer: 2,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>먼저 가로 위치 −2를 따라 원점에서 왼쪽으로 2칸 가고, 거기서 세로 위치 6만큼 위로 올라가요. 그 자리에 붙은 이름은 <b>점 K</b>예요. 같은 spec에서 K의 좌표는 (−2, 6)으로 정해져 있어요.<span class='xh'>오답 하나씩 격파</span>점 L은 (4, −5)라 두 좌표가 모두 다르고, 점 M은 (−6, 0)이라 <i class='mv'>x</i>축 위에 있어요. 원점 O는 (0, 0)이므로 조건과 맞지 않아요. '그림에 없는 점'도 K가 정확히 조건을 만족하므로 틀려요. 좌표를 찾을 때는 가로선을 먼저 고르고 세로선과 만나는 점의 이름을 확인해요.",
    core: "x=−2 세로선과 y=6 가로선의 교점이 K예요.",
  },
  {
    id: "m1u3e014",
    lessonId: L,
    type: "num",
    prompt: "점 V(−3, <i class='mv'>b</i>)가 <i class='mv'>x</i>축 위에 있을 때, <i class='mv'>b</i>의 값을 쓰세요.",
    answer: "0",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>축 위에서는 위아래로 움직인 거리가 없으므로 <i class='mv'>y</i>좌표가 0이에요. V(−3, <i class='mv'>b</i>)의 둘째 성분 <i class='mv'>b</i>가 <i class='mv'>y</i>좌표이므로 <i class='mv'>b</i>=<b>0</b>이에요. 검산하면 V는 (−3, 0)으로 원점 왼쪽의 <i class='mv'>x</i>축 위에 놓여요.<span class='xh'>헷갈림 격파</span>'−3'은 첫째 성분인 <i class='mv'>x</i>좌표를 답한 값이에요. '3'은 그 수에서 부호까지 없앤 값이고요. <i class='mv'>x</i>축이라는 이름 때문에 첫째 수를 0으로 만들면 점이 <i class='mv'>y</i>축으로 옮겨 가요. 어느 방향으로 움직이지 않았는지를 생각하면 0이 될 성분을 바르게 정할 수 있어요.",
    core: "x축 위 점의 둘째 성분, 곧 y좌표는 0이에요.",
  },
  {
    id: "m1u3e015",
    lessonId: L,
    type: "mcq",
    prompt: "두 순서쌍 <b>(2<i class='mv'>a</i>−1, 3<i class='mv'>b</i>+2)</b>와 <b>(7, −4)</b>가 서로 같을 때, <i class='mv'>a</i>+<i class='mv'>b</i>의 값은?",
    options: ["4", "2", "6", "−2", "8"],
    answer: 1,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>같은 자리끼리 식을 세워요.<br>① 2<i class='mv'>a</i>−1=7이므로 2<i class='mv'>a</i>=8, <i class='mv'>a</i>=4<br>② 3<i class='mv'>b</i>+2=−4이므로 3<i class='mv'>b</i>=−6, <i class='mv'>b</i>=−2<br>③ <i class='mv'>a</i>+<i class='mv'>b</i>=4+(−2)=<b>2</b>예요.<span class='xh'>오답 하나씩 격파</span>'4'는 <i class='mv'>a</i>만 구하고 멈춘 값, '6'은 <i class='mv'>b</i>의 음수 부호를 양수로 바꿔 4+2로 계산한 값이에요. '−2'는 <i class='mv'>b</i>만 답했고, '8'은 첫째 식에서 2<i class='mv'>a</i>를 <i class='mv'>a</i>로 착각한 값이에요. 두 성분을 각각 푼 뒤 마지막 질문의 계산까지 마쳐요. 마지막에는 (7, −4)가 실제로 나오는지도 다시 대입해 확인해요.",
    core: "순서쌍의 두 자리를 각각 풀고 마지막 식에 대입해요.",
  },
  {
    id: "m1u3e016",
    lessonId: L,
    type: "word",
    prompt: "<i class='mv'>x</i>좌표가 0인 점들이 놓이는 좌표축의 이름을 고르세요.",
    answer: "y축",
    bank: ["y축", "x축", "좌표축", "x좌표", "y좌표", "순서쌍", "좌표평면", "첫째 수", "둘째 수"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>좌표가 0이라는 것은 원점에서 왼쪽이나 오른쪽으로 움직이지 않았다는 뜻이에요. 이런 점들은 세로 방향으로 이어진 <b><i class='mv'>y</i>축</b> 위에 놓여요.<span class='xh'>낱말 하나씩 격파</span>'x축' 위에서는 반대로 <i class='mv'>y</i>좌표가 0이에요. '좌표축'은 <i class='mv'>x</i>축과 <i class='mv'>y</i>축을 함께 부르는 넓은 이름이라 한 축을 묻는 답으로는 부족해요. 'x좌표'와 'y좌표'는 점의 두 성분, '순서쌍'은 두 수의 짝, '좌표평면'은 전체 평면이에요. '첫째 수'와 '둘째 수'도 자리 이름일 뿐 축의 이름이 아니에요.",
    core: "x좌표가 0인 점들은 y축 위에 놓여요.",
  },
  {
    id: "m1u3e017",
    lessonId: L,
    type: "num",
    prompt: "두 순서쌍 <b>(−4, 2<i class='mv'>c</i>−3)</b>과 <b>(−4, 9)</b>가 서로 같을 때, <i class='mv'>c</i>의 값을 쓰세요.",
    answer: "6",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>첫째 수 −4는 이미 같아요. 둘째 수끼리 같아야 하므로 2<i class='mv'>c</i>−3=9를 세워요. 양쪽에 3을 더하면 2<i class='mv'>c</i>=12, 2로 나누면 <i class='mv'>c</i>=<b>6</b>이에요. 검산하면 2×6−3=9라 두 순서쌍이 정확히 같아요.<span class='xh'>헷갈림 격파</span>'9'는 둘째 성분 전체를 <i class='mv'>c</i>로 착각한 값이에요. '3'은 9−3을 한 뒤 2로 나눈 값인데, −3을 없앨 때는 3을 더해야 해요. '12'는 2<i class='mv'>c</i>까지 구하고 나누지 않은 값이고요. 같은 자리 확인, 식 풀기, 원래 성분 검산의 세 단계를 지켜요.",
    core: "둘째 자리끼리 같다는 식 2c−3=9를 풀어요.",
  },
  {
    id: "m1u3e018",
    lessonId: L,
    type: "multi",
    prompt: "좌표와 좌표축에 대한 설명으로 <b>옳은 것을 모두</b> 고르세요.",
    options: [
      "점 (−2, 0)은 x축 위에 있다",
      "점 (0, 5)의 y좌표는 0이다",
      "점 (0, −7)은 y축 위에 있다",
      "원점의 좌표는 (0, 1)이다",
      "두 순서쌍이 같으면 같은 자리의 수가 각각 같다",
    ],
    answer: [0, 2, 4],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>(−2, 0)은 둘째 수가 0이라 <i class='mv'>x</i>축 위에 있고, (0, −7)은 첫째 수가 0이라 <i class='mv'>y</i>축 위에 있어요. 또 두 순서쌍이 같으면 첫째 수끼리, 둘째 수끼리 각각 같아야 해요. 이 세 설명이 옳아요.<span class='xh'>오답 하나씩 격파</span>'(0, 5)의 y좌표는 0'은 첫째 수와 둘째 수를 뒤바꾼 말이에요. 이 점의 <i class='mv'>y</i>좌표는 5이고 <i class='mv'>x</i>좌표가 0이에요. '원점은 (0, 1)'도 원점에서 위로 1칸 간 점을 가리키므로 틀려요. 원점은 두 성분이 모두 0인 (0, 0)이에요.",
    core: "둘째 수 0은 x축, 첫째 수 0은 y축, 둘 다 0은 원점이에요.",
  },
  {
    id: "m1u3e019",
    lessonId: L,
    type: "mcq",
    prompt: "로봇이 원점에서 <b>오른쪽으로 4칸, 아래로 7칸</b> 이동했어요. 도착점의 좌표는?",
    options: [coord(4, 7), coord(-4, -7), coord(-7, 4), coord(7, -4), coord(4, -7)],
    answer: 4,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>오른쪽 이동은 <i class='mv'>x</i>좌표의 양의 방향이므로 첫째 수가 4예요. 아래쪽 이동은 <i class='mv'>y</i>좌표의 음의 방향이므로 둘째 수가 −7이에요. 따라서 도착점은 <b>(4, −7)</b>이에요.<span class='xh'>오답 하나씩 격파</span>'(4, 7)'은 아래 이동의 부호를 빠뜨렸어요. '(−4, −7)'은 오른쪽을 왼쪽으로 바꿨고, '(−7, 4)'는 순서와 방향을 모두 섞었어요. '(7, −4)'는 두 이동량을 서로 바꿔 적은 값이에요. 이동 문장을 좌표로 바꿀 때는 가로 이동의 부호와 값을 먼저 쓰고, 세로 이동을 둘째에 써요.",
    core: "오른쪽은 +x, 아래쪽은 −y이므로 (4, −7)이에요.",
  },
  {
    id: "m1u3e020",
    lessonId: L,
    type: "num",
    prompt: "그림의 세 점 A, B, C를 꼭짓점으로 하는 삼각형 ABC의 넓이를 구하세요.",
    figure: mExamPlaneFig(PLANE_020),
    answer: String(TRI_AREA),
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>① 그림에서 세 점의 좌표를 읽으면 A(−2, 3), B(−2, −2), C(4, −2)예요.<br>② A와 B는 <i class='mv'>x</i>좌표가 같아 변 AB는 세로 선분이고 길이는 3−(−2)=5예요. B와 C는 <i class='mv'>y</i>좌표가 같아 변 BC는 가로 선분이고 길이는 4−(−2)=6이에요.<br>③ 두 변이 서로 수직이므로 넓이는 (밑변×높이)÷2=6×5÷2=<b>15</b>예요.<span class='xh'>헷갈림 격파</span>'30'은 2로 나누는 마지막 단계를 빠뜨린 값이고, '11'은 두 길이를 곱하지 않고 더한 값이에요. 길이를 셀 때 4−2=2, 3−2=1처럼 음수 부호를 버리면 변의 길이가 짧아져요. 0을 건너가는 변은 그림의 눈금 칸 수를 직접 세어 검산해요.",
    core: "축과 나란한 두 변의 길이를 좌표 차로 구해 넓이를 계산해요.",
  },
  {
    id: "m1u3e021",
    lessonId: L,
    type: "mcq",
    prompt: "점 W의 좌표를 (−5, 0)이라고 적어야 하는데 두 수의 순서를 바꾸어 적었어요. 잘못 적은 좌표와 그 점의 위치를 옳게 짝 지은 것은?",
    options: [
      "(0, −5), y축 위",
      "(0, 5), y축 위",
      "(−5, 0), y축 위",
      "(5, 0), x축 위",
      "(0, −5), x축 위",
    ],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>(−5, 0)의 두 수를 순서만 바꾸면 <b>(0, −5)</b>예요. 첫째 수가 0이므로 이 잘못 적은 점은 <b><i class='mv'>y</i>축 위</b>, 원점 아래쪽에 놓여요.<span class='xh'>오답 하나씩 격파</span>'(0, 5)'는 순서를 바꾸면서 −5의 부호까지 바꾼 답이에요. '(−5, 0)'은 원래 좌표를 그대로 두었고, 위치도 실제로는 <i class='mv'>x</i>축 위예요. '(5, 0)' 역시 순서 교환이 아니라 부호 변경이에요. '(0, −5), x축 위'는 좌표는 맞게 바꿨지만 축 판정을 뒤집었어요. 첫째 수가 0이면 <i class='mv'>y</i>축, 둘째 수가 0이면 <i class='mv'>x</i>축이에요.",
    core: "순서 교환 뒤 (0, −5)는 첫째 수가 0이라 y축 위예요.",
  },
  {
    id: "m1u3e022",
    lessonId: L,
    type: "mcq",
    prompt: "두 순서쌍 <b>(<i class='mv'>p</i>−2, 2<i class='mv'>q</i>+1)</b>과 <b>(−6, 11)</b>이 서로 같을 때, <i class='mv'>p</i>×<i class='mv'>q</i>의 값은?",
    options: ["20", "−30", "30", "−20", "10"],
    answer: 3,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>같은 자리끼리 비교해요.<br>① <i class='mv'>p</i>−2=−6이므로 <i class='mv'>p</i>=−4<br>② 2<i class='mv'>q</i>+1=11이므로 2<i class='mv'>q</i>=10, <i class='mv'>q</i>=5<br>③ <i class='mv'>p</i>×<i class='mv'>q</i>=(−4)×5=<b>−20</b>이에요.<span class='xh'>오답 하나씩 격파</span>'20'은 마지막 곱에서 음수와 양수의 부호를 양수로 잘못 정한 값이에요. '−30'과 '30'은 <i class='mv'>p</i>를 −6으로 그대로 쓰거나 <i class='mv'>q</i>를 5가 아닌 값으로 잡은 계산이고, '10'은 2<i class='mv'>q</i>=10에서 멈춰 마지막 질문까지 가지 않은 값이에요. 두 성분을 모두 검산한 뒤 곱의 부호를 확인해요. 답의 부호도 계산의 일부예요.",
    core: "p=−4, q=5이므로 p×q=−20이에요.",
  },
];
