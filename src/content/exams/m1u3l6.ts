// 중1 수학 Ⅲ. 좌표평면과 그래프: 단원 종합 평가 풀, 레슨 6 정비례 그래프 (m1u3e112~m1u3e133).
// 유형 14(mcq+multi)/6(num)/2(word), diff 9/8/5. 관계 그래프는 spec 한 곳에서 직선·점·문항 수치를 함께 만든다.
import type { ExamItem } from "./types";
import { mExamRelationPlaneFig, type MExamRelationPlaneSpec } from "../../ui/examFiguresMath";

const L = "m1u3l6";
const minus = (value: number): string => String(value).replace("-", "−");
const coord = (x: number, y: number): string => `(${minus(x)}, ${minus(y)})`;
const variable = (name: string): string => `<i class='mv'>${name}</i>`;
const relation = (a: number, b = 0): string => {
  const coefficient = a === 1 ? "" : a === -1 ? "−" : minus(a);
  const tail = b === 0 ? "" : b > 0 ? `+${b}` : minus(b);
  return `${variable("y")}=${coefficient}${variable("x")}${tail}`;
};

const A_112 = 0.5;
const PLANE_112: MExamRelationPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  lines: [{ a: A_112, color: "#364FC7" }],
};

const A_115 = -1.5;
const POINT_115 = { label: "P", x: 4, y: A_115 * 4, color: "#364FC7", labelDx: 12 };
const PLANE_115: MExamRelationPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  lines: [{ a: A_115, color: "#364FC7" }],
  points: [POINT_115],
};

const LINES_119 = [
  { name: "㉠", a: 0.75, color: "#364FC7", point: { x: 4, y: 3 } },
  { name: "㉡", a: 2.5, color: "#E8547E", point: { x: 1, y: 2.5 } },
] as const;
const PLANE_119: MExamRelationPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  lines: LINES_119.map(({ a, color }) => ({ a, color })),
  points: LINES_119.map(({ name, color, point }) => ({ label: name, x: point.x, y: point.y, color, labelDx: 13 })),
};

const LINES_124 = [
  { name: "㉠", a: -2, b: 0, color: "#364FC7", point: { x: -2, y: 4 } },
  { name: "㉡", a: 1.5, b: 0, color: "#2F9E44", point: { x: 2, y: 3 } },
  { name: "㉢", a: 0.5, b: 2, color: "#E8547E", point: { x: -2, y: 1 } },
] as const;
const PLANE_124: MExamRelationPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  lines: LINES_124.map(({ a, b, color }) => ({ a, b, color })),
  points: LINES_124.map(({ name, color, point }) => ({ label: name, x: point.x, y: point.y, color, labelDx: 13 })),
};

const A_130 = 0.75;
const POINT_130 = { label: "Q", x: -8, y: A_130 * -8, color: "#364FC7", labelDx: 13 };
const PLANE_130: MExamRelationPlaneSpec = {
  min: -8,
  max: 8,
  labelEvery: 2,
  lines: [{ a: A_130, color: "#364FC7" }],
  points: [POINT_130],
};

export const POOL_M1U3L6: ExamItem[] = [
  {
    id: "m1u3e112",
    lessonId: L,
    type: "mcq",
    prompt: `그림의 직선에 대한 설명으로 옳은 것은?`,
    figure: mExamRelationPlaneFig(PLANE_112),
    options: [
      `원점을 지나며 ${variable("x")}가 커질수록 ${variable("y")}도 커진다`,
      `원점을 지나지 않으므로 정비례 그래프가 아니다`,
      `제2사분면과 제4사분면을 지난다`,
      `${variable("x")}=2일 때 ${variable("y")}=−1이다`,
      `직선 위 모든 점에서 ${variable("x")}좌표와 ${variable("y")}좌표가 같다`,
    ],
    answer: 0,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>이 직선은 원점을 지나고 오른쪽으로 갈수록 위로 향해요. 그림을 만든 관계식은 ${relation(A_112)}이므로 ${variable("x")}=2이면 ${variable("y")}=1이고, ${variable("x")}가 커지면 ${variable("y")}도 커져요.<span class='xh'>오답 하나씩 격파</span>'원점을 지나지 않는다'는 그림과 반대예요. 제2·제4사분면을 지난다는 설명은 두 좌표의 부호가 서로 반대일 때예요. ${variable("x")}=2에서 ${variable("y")}=−1이 아니라 1이고, 두 좌표가 항상 같은 것도 아니에요. 예를 들어 (2, 1)에서는 두 값이 달라요. 원점과 방향을 먼저 확인한 뒤 식으로 눈금을 검산하면 돼요.`,
    core: "비례상수가 양수인 정비례 그래프는 원점을 지나며 오른쪽 위로 향해요.",
  },
  {
    id: "m1u3e113",
    lessonId: L,
    type: "num",
    prompt: `${relation(-3.5)}의 그래프 위에 점 (${variable("x")}, ${variable("y")})가 있고 ${variable("x")}=−2일 때, ${variable("y")}의 값을 쓰세요.`,
    answer: "7",
    numKind: "int",
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>관계식 ${relation(-3.5)}에 ${variable("x")}=−2를 넣으면 ${variable("y")}=(−3.5)×(−2)=<b>7</b>이에요. 따라서 그래프 위의 점은 (−2, 7)이에요. 음수 두 수의 곱이 양수라는 점도 함께 확인해요.<span class='xh'>헷갈림 격파</span>'−7'은 곱의 부호를 하나의 음수처럼 처리한 값이고, '−5.5'는 두 수를 더한 값이에요. '−2'를 그대로 쓰면 ${variable("x")}좌표를 ${variable("y")}좌표로 바꿔 적은 셈이에요. 마지막에 7=(−3.5)×(−2)를 다시 대입하면 이 점이 식과 그래프를 모두 만족하는지 확인할 수 있어요. 좌표 순서도 확인해요.`,
    core: "그래프 위 점의 좌표는 관계식에 x값을 넣어 y값을 구해요.",
  },
  {
    id: "m1u3e114",
    lessonId: L,
    type: "word",
    prompt: `${relation(1.25)}의 그래프가 반드시 지나는 특별한 점의 이름을 고르세요.`,
    answer: "원점",
    bank: ["원점", "제1사분면", "제2사분면", "x축", "y축", "좌표평면", "순서쌍", "격자점", "교점"],
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${relation(1.25)}에서 ${variable("x")}=0을 넣으면 ${variable("y")}=0이므로 그래프는 반드시 (0, 0)을 지나요. 이 점의 이름은 <b>원점</b>이에요.<span class='xh'>낱말 하나씩 격파</span>'제1사분면'과 '제2사분면'은 한 점의 이름이 아니라 좌표평면의 구역이에요. 'x축'과 'y축'은 선 전체이고, '좌표평면'은 두 축이 놓인 평면이에요. '순서쌍'은 두 수의 표현, '격자점'은 눈금선이 만나는 여러 점을 넓게 부르는 말이에요. '교점'도 두 선이 만나는 점이라는 일반 이름이라 (0, 0)의 고유한 이름을 묻는 답으로는 부족해요.`,
    core: "y=ax는 x=0일 때 y=0이므로 그래프가 원점을 지나요.",
  },
  {
    id: "m1u3e115",
    lessonId: L,
    type: "num",
    prompt: `그림의 직선은 ${variable("y")}=${variable("a")}${variable("x")}의 그래프이고 점 P${coord(POINT_115.x, POINT_115.y)}를 지나요. ${variable("a")}의 값을 쓰세요.`,
    figure: mExamRelationPlaneFig(PLANE_115),
    answer: String(A_115),
    numKind: "dec",
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>점 P${coord(POINT_115.x, POINT_115.y)}가 ${variable("y")}=${variable("a")}${variable("x")} 위에 있으므로 ${minus(POINT_115.y)}=${variable("a")}×${POINT_115.x}예요. 양쪽을 ${POINT_115.x}로 나누면 ${variable("a")}=${minus(POINT_115.y)}÷${POINT_115.x}=<b>${minus(A_115)}</b>예요. 직선이 오른쪽 아래로 향하므로 ${variable("a")}가 음수라는 그림의 방향과도 맞아요.<span class='xh'>헷갈림 격파</span>'1.5'는 방향을 확인하지 않아 음수 부호를 빠뜨린 값이에요. '−10'처럼 두 좌표를 단순히 빼거나 '−2/3'처럼 ${variable("x")}÷${variable("y")}로 나눗셈 순서를 바꾼 값은 식을 만족하지 않아요. ${minus(A_115)}×${POINT_115.x}=${minus(POINT_115.y)}로 검산해요. 그림의 점과 계산값도 같은 자리인지 끝에 비교해요.`,
    core: "지나는 한 점을 y=ax에 넣어 a=y÷x로 구해요.",
  },
  {
    id: "m1u3e116",
    lessonId: L,
    type: "mcq",
    prompt: `다음 중 ${relation(-0.5)}의 그래프 위에 있는 점은?`,
    options: [coord(6, 3), coord(-4, -2), coord(-6, 3), coord(2, 4), coord(0, 2)],
    answer: 2,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${relation(-0.5)}에 ${variable("x")}=−6을 넣으면 ${variable("y")}=(−0.5)×(−6)=3이므로 <b>${coord(-6, 3)}</b>은 그래프 위의 점이에요.<span class='xh'>오답 하나씩 격파</span>${coord(6, 3)}에서는 계산값이 −3이라 부호가 달라요. ${coord(-4, -2)}에서는 계산값이 2인데 ${variable("y")}좌표를 −2로 적었어요. ${coord(2, 4)}에서는 계산값이 −1이라 크기와 부호가 모두 맞지 않아요. ${coord(0, 2)}도 ${variable("x")}=0이면 ${variable("y")}=0이어야 하므로 틀려요. 각 점은 둘째 좌표가 −0.5×첫째 좌표인지 확인해요. 좌표를 거꾸로 넣지 않도록 첫째 수부터 대입해요.`,
    core: "후보 점의 x좌표를 식에 넣은 값이 y좌표와 같은지 확인해요.",
  },
  {
    id: "m1u3e117",
    lessonId: L,
    type: "mcq",
    prompt: "정비례 그래프가 될 수 없는 것은?",
    options: [
      `원점과 ${coord(2, 3)}을 지나는 직선`,
      `${relation(-2.5)}의 그래프`,
      `원점과 ${coord(-4, 2)}를 지나는 직선`,
      `${relation(0.75)}의 그래프`,
      `${relation(1.5, 2)}의 그래프`,
    ],
    answer: 4,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>정비례 관계는 ${variable("y")}=${variable("a")}${variable("x")} 꼴이어서 그래프가 반드시 원점을 지나요. ${relation(1.5, 2)}는 ${variable("x")}=0일 때 ${variable("y")}=2이므로 원점을 지나지 않아 정비례 그래프가 될 수 없어요.<span class='xh'>오답 하나씩 격파</span>원점과 ${coord(2, 3)}을 잇는 직선은 ${relation(1.5)}, ${relation(-2.5)}는 그 자체로 정비례예요. 원점과 ${coord(-4, 2)}를 잇는 직선도 ${relation(-0.5)}로 나타낼 수 있어요. ${relation(0.75)}도 정비례식의 꼴이고 원점을 지나므로 옳은 예예요. 곧은 모양만 보지 말고 원점 통과를 확인해요.`,
    core: "곧은 선이라도 원점을 지나지 않으면 정비례 그래프가 아니에요.",
  },
  {
    id: "m1u3e118",
    lessonId: L,
    type: "multi",
    prompt: `${relation(-3)}의 그래프에 대한 설명으로 <b>옳은 것을 모두</b> 고르세요.`,
    options: [
      "원점을 지난다",
      "오른쪽으로 갈수록 위로 향한다",
      `점 ${coord(2, -6)}을 지난다`,
      `점 ${coord(-2, -6)}을 지난다`,
      "제2사분면과 제4사분면을 지난다",
    ],
    answer: [0, 2, 4],
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>${relation(-3)}은 ${variable("x")}=0일 때 ${variable("y")}=0이므로 원점을 지나요. ${variable("x")}=2이면 ${variable("y")}=−6이어서 ${coord(2, -6)}을 지나고, 두 좌표의 부호가 반대여서 제2사분면과 제4사분면을 지나요.<span class='xh'>선택지 격파</span>'오른쪽으로 갈수록 위로 향한다'는 비례상수가 양수인 경우예요. 여기서는 오른쪽으로 갈수록 아래로 향해요. ${coord(-2, -6)}은 ${variable("x")}=−2를 넣었을 때 필요한 ${variable("y")}=6과 부호가 반대라 그래프 위에 있지 않아요. 방향, 원점 통과, 점 대입을 각각 확인하고 선택한 세 보기를 다시 검산해요.`,
    core: "a가 음수이면 원점을 지나며 제2·제4사분면으로 뻗어요.",
  },
  {
    id: "m1u3e119",
    lessonId: L,
    type: "mcq",
    prompt: "그림의 두 정비례 그래프에 대한 설명으로 옳은 것은?",
    figure: mExamRelationPlaneFig(PLANE_119),
    options: [
      `㉠의 비례상수는 ${LINES_119[1].a}이다`,
      "㉡이 ㉠보다 y축에 더 가까운 모양이다",
      "㉠과 ㉡은 오른쪽 아래로 향한다",
      `㉡은 점 ${coord(LINES_119[0].point.x, LINES_119[0].point.y)}을 지난다`,
      "㉠은 원점을 지나지만 ㉡은 원점을 지나지 않는다",
    ],
    answer: 1,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>같은 ${variable("x")}의 변화에서 ${variable("y")}가 더 크게 변하는 직선이 ${variable("y")}축에 더 가까워 보여요. ㉠의 비례상수는 ${LINES_119[0].a}, ㉡은 ${LINES_119[1].a}이므로 절댓값이 더 큰 <b>㉡</b>이 더 ${variable("y")}축에 가까워요.<span class='xh'>오답 하나씩 격파</span>㉠의 비례상수를 ${LINES_119[1].a}로 쓴 설명은 두 직선을 바꿨어요. 두 값이 모두 양수라 직선은 오른쪽 위로 향해요. ${coord(LINES_119[0].point.x, LINES_119[0].point.y)}은 ㉠ 위의 표시점이고 ㉡ 위 점이 아니에요. 두 직선은 정비례 그래프이므로 모두 원점을 지나요. 표시점과 직선의 색을 짝지어 읽고 절댓값을 비교해요.`,
    core: "비례상수의 절댓값이 클수록 직선은 y축에 더 가까워 보여요.",
  },
  {
    id: "m1u3e120",
    lessonId: L,
    type: "num",
    prompt: `${relation(0.75)}의 그래프 위에서 ${variable("x")}좌표가 −6인 점과 10인 점의 <i class='mv'>y</i>좌표 차를 구하세요. (큰 값에서 작은 값을 빼세요.)`,
    answer: "12",
    numKind: "int",
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${relation(0.75)}에서 ${variable("x")}=−6이면 ${variable("y")}=0.75×(−6)=−4.5이고, ${variable("x")}=10이면 ${variable("y")}=0.75×10=7.5예요. 큰 값에서 작은 값을 빼면 7.5−(−4.5)=<b>12</b>예요.<span class='xh'>헷갈림 격파</span>두 ${variable("x")}좌표의 차 16을 그대로 답하면 세로값을 구하지 않은 것이에요. 3은 |7.5−4.5|처럼 음수 −4.5의 부호를 없애고 뺀 결과예요. 4.5와 7.5는 각각 한 점의 ${variable("y")}좌표일 뿐 두 값의 차가 아니에요. 두 점을 식으로 구한 뒤 마지막 뺄셈에서 음수를 괄호로 묶어요.`,
    core: "두 y좌표 −4.5와 7.5의 차는 12예요.",
  },
  {
    id: "m1u3e121",
    lessonId: L,
    type: "mcq",
    prompt: `점 ${coord(-2, 3)}을 지나는 정비례 그래프의 관계식은?`,
    options: [relation(1.5), relation(-0.5), relation(0.75), relation(-1.5), relation(2.5)],
    answer: 3,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>정비례식 ${variable("y")}=${variable("a")}${variable("x")}에 ${coord(-2, 3)}을 넣으면 3=${variable("a")}×(−2)예요. 따라서 ${variable("a")}=3÷(−2)=−1.5이고 관계식은 <b>${relation(-1.5)}</b>예요.<span class='xh'>오답 하나씩 격파</span>${relation(1.5)}는 부호를 빠뜨려 ${coord(-2, -3)}을 지나고, ${relation(-0.5)}는 ${variable("x")}=−2에서 ${variable("y")}=1이에요. ${relation(0.75)}는 ${variable("y")}=−1.5, ${relation(2.5)}는 ${variable("y")}=−5가 되어 주어진 점과 맞지 않아요. ${variable("y")}÷${variable("x")}의 순서와 음수 부호를 함께 지켜요. 정답 식에 ${variable("x")}=−2를 다시 넣어 ${variable("y")}=3이 되는지 끝까지 꼭 확인해요.`,
    core: "한 점을 지나는 정비례식은 a=y÷x로 정해요.",
  },
  {
    id: "m1u3e122",
    lessonId: L,
    type: "word",
    prompt: `정비례 그래프에서 ${variable("a")}가 양수일 때 직선이 원점에서 오른쪽으로 향하는 방향을 고르세요.`,
    answer: "오른쪽 위",
    bank: ["오른쪽 위", "오른쪽 아래", "왼쪽 위", "왼쪽 아래", "x축 방향", "y축 방향", "수평 방향", "수직 방향", "곡선 방향"],
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${variable("a")}가 양수이면 ${variable("x")}가 양수일 때 ${variable("y")}=${variable("a")}${variable("x")}도 양수예요. 따라서 원점에서 오른쪽으로 갈수록 위로 올라가는 <b>오른쪽 위</b> 방향이에요.<span class='xh'>낱말 하나씩 격파</span>'오른쪽 아래'는 ${variable("a")}가 음수일 때의 방향이에요. '왼쪽 위'와 '왼쪽 아래'는 문제에서 묻는 오른쪽 방향이 아니에요. 'x축 방향'과 '수평 방향'은 ${variable("y")}가 변하지 않는 모양, 'y축 방향'과 '수직 방향'은 하나의 ${variable("x")}값에 여러 ${variable("y")}값이 놓이는 모양이라 ${variable("y")}=${variable("a")}${variable("x")}의 직선과 달라요. '곡선 방향'도 정비례 그래프의 곧은 모양과 맞지 않아요.`,
    core: "a가 양수인 정비례 그래프는 원점에서 오른쪽 위로 향해요.",
  },
  {
    id: "m1u3e123",
    lessonId: L,
    type: "mcq",
    prompt: `${relation(1.25)}의 그래프를 그리려고 만든 표로 옳은 것은?`,
    options: [
      `${variable("x")}: −4, 0, 4 / ${variable("y")}: −5, 0, 5`,
      `${variable("x")}: −4, 0, 4 / ${variable("y")}: 5, 0, −5`,
      `${variable("x")}: −4, 0, 4 / ${variable("y")}: −3, 1, 5`,
      `${variable("x")}: −5, 0, 5 / ${variable("y")}: −4, 0, 4`,
      `${variable("x")}: −4, 0, 4 / ${variable("y")}: −5, 1, 5`,
    ],
    answer: 0,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>${relation(1.25)}에서 ${variable("x")}=−4, 0, 4를 차례로 넣으면 ${variable("y")}=−5, 0, 5예요. 그러므로 세 점 ${coord(-4, -5)}, ${coord(0, 0)}, ${coord(4, 5)}를 나타낸 표가 옳아요.<span class='xh'>오답 하나씩 격파</span>'5, 0, −5'는 ${variable("x")}와 ${variable("y")}의 부호가 반대인 관계예요. '−3, 1, 5'는 일정한 수를 더한 것처럼 원점 값이 1이라 틀려요. ${variable("x")}가 −5, 0, 5인 표의 ${variable("y")}값 −4, 0, 4는 ${variable("x")}와 ${variable("y")}를 뒤바꿨어요. 마지막 표도 ${variable("x")}=0에서 ${variable("y")}=1이라 원점을 지나지 않아요.`,
    core: "표의 각 x값에 비례상수를 곱해 y값을 만들고 원점 행도 확인해요.",
  },
  {
    id: "m1u3e124",
    lessonId: L,
    type: "multi",
    prompt: "그림의 직선 ㉠, ㉡, ㉢에 대한 설명으로 <b>옳은 것을 모두</b> 고르세요.",
    figure: mExamRelationPlaneFig(PLANE_124),
    options: [
      "㉠은 원점을 지난다",
      `㉡은 ${relation(LINES_124[1].a)}의 그래프이다`,
      "㉢은 정비례 그래프이다",
      "㉠은 오른쪽으로 갈수록 아래로 향한다",
      `㉢은 ${variable("x")}=0일 때 ${variable("y")}=0이다`,
    ],
    answer: [0, 1, 3],
    diff: 3,
    explain:
      `<span class='xh'>정답 풀이</span>그림에서 ㉠은 ${relation(LINES_124[0].a)}, ㉡은 ${relation(LINES_124[1].a)}의 직선이라 둘 다 원점을 지나는 정비례 그래프예요. ㉠의 비례상수는 음수이므로 오른쪽으로 갈수록 아래로 향해요.<span class='xh'>선택지 격파</span>㉢은 ${relation(LINES_124[2].a, LINES_124[2].b)}로 ${variable("x")}=0일 때 ${variable("y")}=${LINES_124[2].b}예요. 곧은 선이지만 원점을 지나지 않으므로 정비례 그래프가 아니고, '${variable("x")}=0일 때 ${variable("y")}=0'이라는 설명도 틀려요. 직선의 모양만 보지 말고 원점 통과와 방향을 각각 확인해야 해요. 세 표시점은 선을 구별하는 표지일 뿐 정답을 뜻하지 않아요.`,
    core: "여러 직선 중 정비례 그래프는 원점을 지나는 직선만 골라요.",
  },
  {
    id: "m1u3e125",
    lessonId: L,
    type: "num",
    prompt: `센서 보정값의 정비례 그래프가 점 ${coord(5, -2)}를 지나요. 이 그래프에서 ${variable("x")}=−10일 때, ${variable("y")}의 값을 쓰세요.`,
    answer: "4",
    numKind: "int",
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>먼저 점 ${coord(5, -2)}에서 비례상수를 구하면 ${variable("a")}=(−2)÷5=−0.4예요. 관계식 ${relation(-0.4)}에 ${variable("x")}=−10을 넣으면 ${variable("y")}=(−0.4)×(−10)=<b>4</b>예요.<span class='xh'>헷갈림 격파</span>'−4'는 음수 두 수의 곱을 음수로 잘못 정한 값이에요. '−0.4'는 첫 단계에서 구한 비례상수를 최종 답으로 썼고, '−10'은 주어진 ${variable("x")}값을 그대로 옮긴 값이에요. '25'는 −10을 −0.4로 나눈 값이라 곱셈 관계를 뒤집었어요. ${coord(5, -2)}와 ${coord(-10, 4)}를 각각 ${relation(-0.4)}에 대입해 같은 직선 위인지 검산해요.`,
    core: "한 점으로 a를 구한 뒤 관계식에 새 x값을 넣어 y값을 계산해요.",
  },
  {
    id: "m1u3e126",
    lessonId: L,
    type: "mcq",
    prompt: `두 그래프 ${relation(-2)}와 ${relation(-0.5)}에 대한 설명으로 옳은 것은?`,
    options: [
      "두 직선은 서로 다른 점에서 y축을 지난다",
      `${relation(-0.5)}가 ${variable("y")}축에 더 가까운 모양이다`,
      `${relation(-2)}가 ${variable("y")}축에 더 가까운 모양이다`,
      "두 직선 모두 오른쪽 위로 향한다",
      `${variable("x")}=2일 때 두 그래프의 ${variable("y")}값이 같다`,
    ],
    answer: 2,
    diff: 3,
    explain:
      `<span class='xh'>정답 풀이</span>두 비례상수의 절댓값을 비교하면 |−2|=2, |−0.5|=0.5예요. 같은 만큼 오른쪽으로 갈 때 ${relation(-2)}에서 ${variable("y")}가 더 크게 변하므로 이 직선이 <b>${variable("y")}축에 더 가까운 모양</b>이에요.<span class='xh'>오답 하나씩 격파</span>두 직선은 모두 원점에서 ${variable("y")}축을 만나요. ${relation(-0.5)}가 더 가깝다는 말은 절댓값 비교를 뒤집었어요. 둘 다 비례상수가 음수라 오른쪽 아래로 향해요. ${variable("x")}=2이면 ${variable("y")}값은 각각 −4와 −1이라 같지 않아요. 방향은 부호, 가파른 정도는 절댓값으로 나누어 판단해요.`,
    core: "a의 절댓값이 큰 직선이 같은 x변화에서 y가 더 크게 변해요.",
  },
  {
    id: "m1u3e127",
    lessonId: L,
    type: "mcq",
    prompt: `점 ${coord(5, -2.5)}가 놓인 정비례 그래프를 찾을 때 가장 알맞은 계산은?`,
    options: [
      `5÷(−2.5)=−2`,
      `5+(−2.5)=2.5`,
      `5−(−2.5)=7.5`,
      `(−2.5)×5=−12.5`,
      `(−2.5)÷5=−0.5`,
    ],
    answer: 4,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>정비례식 ${variable("y")}=${variable("a")}${variable("x")}에서 ${variable("a")}는 ${variable("y")}좌표를 ${variable("x")}좌표로 나눈 값이에요. 점 ${coord(5, -2.5)}에서는 ${variable("a")}=(−2.5)÷5=<b>−0.5</b>로 계산해요.<span class='xh'>오답 하나씩 격파</span>'5÷(−2.5)'는 ${variable("x")}÷${variable("y")}로 순서를 뒤집었어요. 두 좌표를 더하거나 빼는 계산은 정비례상수를 구하지 못해요. '(−2.5)×5'도 좌표를 곱한 값일 뿐 ${variable("y")}=${variable("a")}${variable("x")}에서 ${variable("a")}만 남기는 과정이 아니에요. 구한 −0.5를 식에 넣어 −0.5×5=−2.5로 검산해요. 계산의 분자는 언제나 ${variable("y")}좌표라는 점도 기억해요.`,
    core: "한 점으로 비례상수를 구할 때는 y좌표÷x좌표 순서예요.",
  },
  {
    id: "m1u3e128",
    lessonId: L,
    type: "num",
    prompt: `한 정비례 그래프가 점 ${coord(3, 7.5)}와 점 (${variable("k")}, −5)를 모두 지날 때, ${variable("k")}의 값을 쓰세요.`,
    answer: "-2",
    numKind: "int",
    diff: 3,
    explain:
      `<span class='xh'>정답 풀이</span>먼저 ${coord(3, 7.5)}에서 비례상수를 구하면 ${variable("a")}=7.5÷3=2.5예요. 따라서 관계식은 ${relation(2.5)}예요. 다른 점의 ${variable("y")}좌표가 −5이므로 −5=2.5${variable("k")}, ${variable("k")}=−5÷2.5=<b>−2</b>예요.<span class='xh'>헷갈림 격파</span>'2'는 비례상수가 양수일 때 두 좌표의 부호가 같아야 한다는 점을 놓친 값이에요. '−12.5'는 나누지 않고 곱한 값이고, '2.5'는 첫 단계에서 구한 비례상수를 최종 답으로 착각한 값이에요. 두 점을 각각 ${relation(2.5)}에 대입해 모두 성립하는지 확인해요.`,
    core: "첫 점으로 a를 구한 뒤 같은 식에 둘째 점을 넣어 미지수를 구해요.",
  },
  {
    id: "m1u3e129",
    lessonId: L,
    type: "mcq",
    prompt: `로봇의 가로 이동량을 ${variable("x")}, 세로 이동량을 ${variable("y")}라 할 때 ${relation(-2)}예요. ${variable("x")}=3을 넣어 구한 결과를 다시 ${variable("x")}칸에 적은 실수는?`,
    options: [
      `${variable("y")}=(−2)×3=−6`,
      `${variable("x")}=(−2)×3=−6`,
      `${variable("y")}=(−2)×(−3)=6`,
      `${variable("y")}=3÷(−2)=−1.5`,
      `${variable("x")}=3, ${variable("y")}=−6`,
    ],
    answer: 1,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>가로 이동량 3은 ${variable("x")}값이에요. 올바른 계산은 ${variable("y")}=(−2)×3=−6인데, <b>${variable("x")}=(−2)×3=−6</b>은 결과를 다시 ${variable("x")}칸에 적어 ${variable("x")}와 ${variable("y")}의 역할을 뒤집은 실수예요.<span class='xh'>오답 하나씩 격파</span>'${variable("y")}=(−2)×3'과 '${variable("x")}=3, ${variable("y")}=−6'은 올바른 계산이에요. '${variable("y")}=(−2)×(−3)'은 ${variable("x")}의 부호까지 바꾼 다른 실수이고, '${variable("y")}=3÷(−2)'는 주어진 ${variable("x")}를 비례상수로 나누는 실수예요. 식에서는 오른쪽에 ${variable("x")}를 넣고 왼쪽의 ${variable("y")}를 구해요. 문장 속 양의 역할도 먼저 표시해 두어요.`,
    core: "주어진 가로값은 x에 넣고 계산 결과를 y로 읽어요.",
  },
  {
    id: "m1u3e130",
    lessonId: L,
    type: "num",
    prompt: `그림은 ${relation(A_130)}의 그래프예요. 점 Q의 ${variable("x")}좌표가 ${minus(POINT_130.x)}일 때, Q의 ${variable("y")}좌표를 쓰세요.`,
    figure: mExamRelationPlaneFig(PLANE_130),
    answer: String(POINT_130.y),
    numKind: "int",
    diff: 3,
    explain:
      `<span class='xh'>정답 풀이</span>그림에서 점 Q는 직선 위 ${variable("x")}=${minus(POINT_130.x)}인 곳에 있어요. ${relation(A_130)}에 넣으면 ${variable("y")}=${A_130}×(${minus(POINT_130.x)})=<b>${minus(POINT_130.y)}</b>이에요. 그림의 Q도 ${variable("y")}축 눈금 ${minus(POINT_130.y)}와 같은 높이에 놓여 계산과 일치해요.<span class='xh'>헷갈림 격파</span>'${Math.abs(POINT_130.y)}'은 점이 아래쪽이라는 음수 부호를 빠뜨린 값이고, '${minus(POINT_130.x)}'은 주어진 ${variable("x")}좌표를 그대로 옮긴 값이에요. '${minus(A_130 * POINT_130.y)}'처럼 ${variable("y")}값에 다시 비례상수를 곱하면 좌표의 역할을 두 번 적용한 셈이에요. 식과 눈금을 함께 확인해요. 점의 위치도 아래쪽인 것이 보여요.`,
    core: "그림의 점도 관계식과 눈금에서 같은 y좌표가 나와야 해요.",
  },
  {
    id: "m1u3e131",
    lessonId: L,
    type: "mcq",
    prompt: "정비례 그래프를 그리는 방법으로 옳은 것은?",
    options: [
      "원점이 아닌 점 하나만 찍고 아무 곡선이나 그린다",
      "x좌표와 y좌표를 바꾼 점만 찍는다",
      "y축과 평행한 선을 긋는다",
      "원점과 관계식을 만족하는 다른 점을 찍어 곧게 잇는다",
      "모든 점의 y좌표를 1로 정한다",
    ],
    answer: 3,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>정비례 그래프는 원점을 지나는 직선이에요. 먼저 원점 (0, 0)을 찍고, 관계식에 편리한 ${variable("x")}값을 넣어 얻은 다른 점 하나를 찍은 뒤 두 점을 <b>곧게 이으면</b> 돼요.<span class='xh'>오답 하나씩 격파</span>원점이 아닌 점 하나만으로는 어느 방향의 직선인지 정할 수 없고, 곡선으로 그리는 것도 틀려요. 두 좌표를 바꾸면 원래 관계식을 만족하지 않을 수 있어요. ${variable("y")}축과 평행한 선은 하나의 ${variable("x")}값에 여러 점이 놓여 ${variable("y")}=${variable("a")}${variable("x")} 모양이 아니에요. 모든 ${variable("y")}좌표를 1로 잡은 선도 원점을 지나지 않아요.`,
    core: "원점과 식을 만족하는 다른 한 점을 찍어 직선으로 이어요.",
  },
  {
    id: "m1u3e132",
    lessonId: L,
    type: "mcq",
    prompt: `정비례 그래프가 점 ${coord(-4, -6)}을 지날 때, 같은 그래프 위에 있는 점은?`,
    options: [coord(2, 3), coord(-2, 3), coord(3, 2), coord(4.5, 3), coord(2, -3)],
    answer: 0,
    diff: 3,
    explain:
      `<span class='xh'>정답 풀이</span>점 ${coord(-4, -6)}에서 비례상수는 ${variable("a")}=(−6)÷(−4)=1.5이므로 관계식은 ${relation(1.5)}예요. 보기의 점을 대입하면 ${coord(2, 3)}만 3=1.5×2를 만족해요.<span class='xh'>오답 하나씩 격파</span>${coord(-2, 3)}과 ${coord(2, -3)}은 비례상수가 양수인데 두 좌표의 부호가 달라요. ${coord(3, 2)}는 좌표를 뒤집은 점으로 2≠1.5×3이에요. ${coord(4.5, 3)}은 4.5를 ${variable("x")}좌표로 잘못 옮겼고 1.5×4.5=6.75라 맞지 않아요. 한 점으로 식을 정한 뒤 모든 후보를 같은 식으로 검산해요.`,
    core: "관계식 y=1.5x를 만족하는 점은 (2, 3)이에요.",
  },
  {
    id: "m1u3e133",
    lessonId: L,
    type: "mcq",
    prompt: `다섯 직선 중 ${variable("y")}축에 가장 가까운 모양인 정비례 그래프의 관계식은?`,
    options: [relation(0.5), relation(-1.5), relation(2.5), relation(-2), relation(0.75)],
    answer: 2,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>직선이 ${variable("y")}축에 얼마나 가까운 모양인지는 비례상수의 부호가 아니라 절댓값의 크기로 비교해요. 0.5, 1.5, 2.5, 2, 0.75 중 가장 큰 값은 <b>2.5</b>이므로 ${relation(2.5)}의 그래프가 가장 ${variable("y")}축에 가까워요.<span class='xh'>오답 하나씩 격파</span>${relation(0.5)}와 ${relation(0.75)}는 절댓값이 작아 ${variable("x")}축 쪽에 더 가까워요. ${relation(-1.5)}와 ${relation(-2)}는 음수라 방향은 반대이지만 절댓값 1.5와 2가 2.5보다 작아요. 음수 부호는 방향을 정할 뿐, 가까운 정도 비교에서는 절댓값을 사용해요.`,
    core: "여러 정비례 직선의 모양은 a의 절댓값을 비교해 판단해요.",
  },
];
