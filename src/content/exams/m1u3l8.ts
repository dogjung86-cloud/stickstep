// 중1 수학 Ⅲ. 좌표평면과 그래프: 단원 종합 평가 풀, 레슨 8 반비례 그래프 (m1u3e156~m1u3e177).
// 유형 14(mcq+multi)/6(num)/2(word), diff 8/9/5. 곡선·점·문항 수치는 관계 그래프 spec에서 함께 가져온다.
import type { ExamItem } from "./types";
import { mExamRelationPlaneFig, type MExamRelationPlaneSpec } from "../../ui/examFiguresMath";

const L = "m1u3l8";
const minus = (value: number): string => String(value).replace("-", "−");
const coord = (x: number, y: number): string => `(${minus(x)}, ${minus(y)})`;
const variable = (name: string): string => `<i class='mv'>${name}</i>`;
const inverse = (a: number): string => `${variable("y")}=${minus(a)}/${variable("x")}`;

const A_156 = 14;
const PLANE_156: MExamRelationPlaneSpec = {
  min: -8,
  max: 8,
  labelEvery: 2,
  inverseCurves: [{ a: A_156, color: "#364FC7" }],
};

const POINT_160 = { label: "P", x: -4, y: 4, color: "#E8547E", labelDx: 12 };
const A_160 = POINT_160.x * POINT_160.y;
const PLANE_160: MExamRelationPlaneSpec = {
  min: -8,
  max: 8,
  labelEvery: 2,
  inverseCurves: [{ a: A_160, color: "#364FC7" }],
  points: [POINT_160],
};

const A_164 = 21;
const POINTS_164 = [
  { label: "A", x: 3, y: A_164 / 3, color: "#364FC7", labelDx: 10 },
  { label: "B", x: 7, y: A_164 / 7, color: "#E8547E", labelDx: 10 },
];
const PLANE_164: MExamRelationPlaneSpec = {
  min: -8,
  max: 8,
  labelEvery: 1,
  inverseCurves: [{ a: A_164, color: "#2F9E44" }],
  points: POINTS_164,
};

const CURVES_169 = {
  inverse: { label: "㉠", a: 16, color: "#364FC7" },
  line: { label: "㉡", a: 0.5, color: "#E8547E" },
};
const PLANE_169: MExamRelationPlaneSpec = {
  min: -8,
  max: 8,
  labelEvery: 2,
  inverseCurves: [CURVES_169.inverse],
  lines: [CURVES_169.line],
};

const POINT_173 = { label: "R", x: -8, y: -4, color: "#E8547E", labelDx: 12 };
const A_173 = POINT_173.x * POINT_173.y;
const TARGET_X_173 = 4;
const PLANE_173: MExamRelationPlaneSpec = {
  min: -8,
  max: 8,
  labelEvery: 2,
  inverseCurves: [{ a: A_173, color: "#364FC7" }],
  points: [POINT_173],
};

export const POOL_M1U3L8: ExamItem[] = [
  {
    id: "m1u3e156",
    lessonId: L,
    type: "mcq",
    prompt: `그림은 ${inverse(A_156)}의 그래프예요. 이 그래프에 대한 설명으로 옳은 것은?`,
    figure: mExamRelationPlaneFig(PLANE_156),
    options: [
      "제2사분면과 제4사분면에만 나타난다",
      "제1사분면과 제3사분면에 두 갈래로 나타난다",
      "원점을 지나 한 줄의 직선으로 이어진다",
      `${variable("x")}축과 ${variable("y")}축을 각각 한 번씩 만난다`,
      `${variable("x")}좌표와 ${variable("y")}좌표의 부호가 언제나 다르다`,
    ],
    answer: 1,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${inverse(A_156)}에서 두 좌표의 곱은 ${A_156}로 양수예요. 두 수의 부호가 같아야 곱이 양수이므로 그래프는 제1사분면과 제3사분면에 한 갈래씩 나타나요.<span class='xh'>오답 하나씩 격파</span>제2·제4사분면은 두 좌표의 부호가 다를 때예요. 반비례 그래프는 원점을 지나는 직선이 아니고, 두 좌표축과도 만나지 않아요. 따라서 축을 각각 만난다는 말도 틀려요. 좌표의 부호가 언제나 다르다는 설명 역시 곱이 양수라는 조건과 반대예요. 식의 분자 부호와 두 좌표의 곱부터 확인하면 두 갈래의 위치를 바로 판단할 수 있어요.`,
    core: "a가 양수인 반비례 그래프는 제1사분면과 제3사분면에 나타나요.",
  },
  {
    id: "m1u3e157",
    lessonId: L,
    type: "num",
    prompt: `${inverse(32)}의 그래프 위에서 ${variable("x")}=−4일 때, ${variable("y")}의 값을 쓰세요.`,
    answer: "-8",
    numKind: "int",
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${inverse(32)}에 ${variable("x")}=−4를 넣으면 ${variable("y")}=32÷(−4)=<b>−8</b>이에요. 따라서 그래프 위의 점은 (−4, −8)이고, 두 좌표의 곱도 (−4)×(−8)=32로 관계식과 맞아요.<span class='xh'>헷갈림 격파</span>'8'은 음수로 나눈 몫의 부호를 놓친 값이고, '−4'는 주어진 ${variable("x")}좌표를 그대로 옮긴 값이에요. '−128'은 나눗셈 대신 곱셈을 한 결과예요. 반비례식에서는 분자의 수를 ${variable("x")}값으로 나누고, 마지막에 ${variable("x")}${variable("y")}=32인지 곱으로 검산해요. 음수 부호까지 포함한 −8을 답으로 입력하면 돼요.`,
    core: "반비례식에 x값을 넣어 나눈 뒤 xy=a로 검산해요.",
  },
  {
    id: "m1u3e158",
    lessonId: L,
    type: "word",
    prompt: "반비례 그래프 전체를 이루는 매끄러운 곡선의 모양을 나타내는 말을 고르세요.",
    answer: "두 갈래",
    bank: ["두 갈래", "한 갈래", "세 갈래", "한 직선", "두 직선", "꺾은선", "반원", "선분", "점 하나"],
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${inverse(28)}처럼 ${variable("a")}가 0이 아닌 반비례 그래프는 좌표평면의 서로 마주 보는 두 구역에 나뉘어 나타나므로 <b>두 갈래</b>의 매끄러운 곡선이에요. 한쪽만 보고 그래프 전체라고 생각하면 안 돼요.<span class='xh'>낱말 하나씩 격파</span>'한 갈래'와 '점 하나'는 반대쪽 부분을 빠뜨린 표현이에요. '세 갈래'가 될 수도 없어요. '한 직선'과 '두 직선'은 곧은 선을 뜻하고, '꺾은선'은 여러 선분이 꺾여 이어진 모양이에요. '반원'은 원의 절반이고 '선분'은 두 끝점 사이의 곧은 부분이라 매끄럽게 휘어진 반비례 그래프 전체의 모양과 달라요.`,
    core: "반비례 그래프는 서로 떨어진 두 갈래의 매끄러운 곡선이에요.",
  },
  {
    id: "m1u3e159",
    lessonId: L,
    type: "mcq",
    prompt: `${inverse(-24)}의 그래프가 나타나는 사분면을 옳게 짝 지은 것은?`,
    options: [
      "제1사분면과 제2사분면",
      "제1사분면과 제3사분면",
      "제3사분면과 제4사분면",
      "제2사분면과 제4사분면",
      "네 사분면 모두",
    ],
    answer: 3,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${inverse(-24)}에서는 ${variable("x")}${variable("y")}=−24예요. 곱이 음수이려면 두 좌표의 부호가 서로 달라야 해요. ${variable("x")}&lt;0, ${variable("y")}&gt;0인 제2사분면과 ${variable("x")}&gt;0, ${variable("y")}&lt;0인 제4사분면에 그래프가 나타나요.<span class='xh'>오답 하나씩 격파</span>제1·2사분면이나 제3·4사분면의 조합은 서로 마주 보는 두 갈래가 아니에요. 제1·3사분면은 두 좌표의 부호가 같아 곱이 양수일 때이고, 네 사분면 모두에 나타나는 것도 아니에요. ${variable("a")}의 부호로 두 좌표의 부호가 같은지 다른지부터 정해요.`,
    core: "a가 음수이면 두 좌표의 부호가 달라 제2·제4사분면에 나타나요.",
  },
  {
    id: "m1u3e160",
    lessonId: L,
    type: "num",
    prompt: `그림의 곡선은 ${variable("y")}=${variable("a")}/${variable("x")}의 그래프이고 점 P${coord(POINT_160.x, POINT_160.y)}를 지나요. ${variable("a")}의 값을 쓰세요.`,
    figure: mExamRelationPlaneFig(PLANE_160),
    answer: String(A_160),
    numKind: "int",
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>점 P${coord(POINT_160.x, POINT_160.y)}가 ${variable("y")}=${variable("a")}/${variable("x")}의 그래프 위에 있으므로 ${variable("a")}=${variable("x")}${variable("y")}예요. 따라서 ${variable("a")}=(${minus(POINT_160.x)})×${minus(POINT_160.y)}=<b>${minus(A_160)}</b>이에요. 실제로 ${inverse(A_160)}에 ${variable("x")}=${minus(POINT_160.x)}를 넣으면 ${variable("y")}=${minus(POINT_160.y)}가 돼요.<span class='xh'>헷갈림 격파</span>'16'은 곱의 음수 부호를 빠뜨린 값이고, '0'은 두 좌표의 부호가 다르다는 사실을 반영하지 못한 값이에요. '−1'은 나눗셈으로 잘못 구한 값이에요. 한 점이 주어지면 두 좌표를 순서대로 확인하고 곱해 ${variable("a")}를 구한 뒤 다시 나누어 검산해요. 그래프가 제2·4사분면에 놓이는지도 마지막에 확인해요.`,
    core: "반비례 그래프 위 한 점의 두 좌표를 곱하면 a를 구할 수 있어요.",
  },
  {
    id: "m1u3e161",
    lessonId: L,
    type: "mcq",
    prompt: `반비례 관계 ${variable("y")}=${variable("a")}/${variable("x")}에서 ${variable("a")}가 0이 아닐 때, 그래프와 좌표축의 관계로 옳은 것은?`,
    options: [
      "두 좌표축에 가까워질 수 있지만 어느 축과도 만나지 않는다",
      `${variable("x")}축과는 만나고 ${variable("y")}축과는 만나지 않는다`,
      `${variable("y")}축과는 만나고 ${variable("x")}축과는 만나지 않는다`,
      "반드시 원점에서 두 좌표축과 만난다",
      "각 좌표축 위에 점이 두 개씩 있다",
    ],
    answer: 0,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>그래프가 ${variable("y")}축 위에 있으려면 ${variable("x")}=0이어야 하지만 0으로 나눌 수 없어요. 또 ${variable("x")}축 위에 있으려면 ${variable("y")}=0이어야 하는데 그러면 ${variable("x")}${variable("y")}=0이 되어 0이 아닌 ${variable("a")}와 맞지 않아요. 따라서 그래프는 두 축에 가까워질 수는 있어도 어느 축과도 만나지 않아요.<span class='xh'>오답 하나씩 격파</span>한 축만 만난다는 두 설명은 각각 나눗셈 또는 곱의 조건을 놓쳤어요. 원점에서는 ${variable("x")}=0이라 식을 사용할 수 없으므로 원점을 지난다는 말도 틀려요. 축마다 점이 두 개 있다는 설명 역시 축과 만나지 않는 성질에 어긋나요.`,
    core: "a가 0이 아닌 반비례 그래프는 x축과 y축 어느 쪽과도 만나지 않아요.",
  },
  {
    id: "m1u3e162",
    lessonId: L,
    type: "mcq",
    prompt: `${inverse(45)}의 그래프를 그린 설명 중 옳은 것은?`,
    options: [
      "제1사분면의 곡선 한 갈래만 그린다",
      "제3사분면의 곡선 한 갈래만 그린다",
      "제2사분면과 제4사분면에 한 갈래씩 그린다",
      "원점을 통과하도록 두 곡선을 이어 그린다",
      "제1사분면과 제3사분면에 서로 떨어진 한 갈래씩 그린다",
    ],
    answer: 4,
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${inverse(45)}에서 두 좌표의 곱은 45로 양수이므로 두 좌표의 부호가 같아요. 그래서 제1사분면과 제3사분면에 서로 떨어진 곡선을 한 갈래씩 그려야 해요. 두 갈래 모두 축에 가까워지지만 축과 만나지는 않아요.<span class='xh'>오답 하나씩 격파</span>제1사분면이나 제3사분면 중 한 갈래만 그리면 그래프의 절반을 빠뜨린 셈이에요. 제2·4사분면은 곱이 음수일 때의 위치예요. 원점을 통과하도록 곡선을 잇는 방법도 틀려요. 원점에서는 ${variable("x")}=0이라 식을 사용할 수 없고, 반비례 그래프는 한 줄로 이어지는 직선이 아니에요. 부호와 두 갈래를 함께 확인해요.`,
    core: "양수 a의 그래프는 제1·제3사분면의 두 갈래를 모두 그려야 해요.",
  },
  {
    id: "m1u3e163",
    lessonId: L,
    type: "num",
    prompt: `${inverse(16)}의 그래프에서 ${variable("x")}좌표가 음수인 점은 어느 사분면에 있나요? 사분면 번호만 쓰세요.`,
    answer: "3",
    numKind: "int",
    diff: 1,
    explain:
      `<span class='xh'>정답 풀이</span>${inverse(16)}에서 두 좌표의 곱은 양수 16이에요. ${variable("x")}좌표가 음수라면 곱을 양수로 만들기 위해 ${variable("y")}좌표도 음수여야 해요. 두 좌표가 모두 음수인 점은 <b>제3사분면</b>에 있으므로 번호 3을 써요.<span class='xh'>헷갈림 격파</span>제2사분면은 (−, +)라 곱이 음수이고, 제4사분면은 (+, −)라 ${variable("x")}좌표부터 조건과 달라요. 제1사분면은 두 좌표가 양수인 다른 갈래예요. 좌표축 위에서는 한 좌표가 0이 되어 곱 16을 만들 수 없어요. 분자의 부호와 주어진 한 좌표의 부호로 나머지 부호를 정한 뒤 사분면을 판정해요.`,
    core: "a>0이고 x<0이면 y<0이므로 제3사분면이에요.",
  },
  {
    id: "m1u3e164",
    lessonId: L,
    type: "mcq",
    prompt: `그림의 곡선은 ${inverse(A_164)}의 그래프이고 A, B는 곡선 위의 점이에요. A에서 B로 갈 때 좌표의 절댓값 변화를 옳게 말한 것은?`,
    figure: mExamRelationPlaneFig(PLANE_164),
    options: [
      `${variable("x")}좌표의 절댓값과 ${variable("y")}좌표의 절댓값이 모두 커진다`,
      `${variable("x")}좌표의 절댓값과 ${variable("y")}좌표의 절댓값이 모두 작아진다`,
      `${variable("x")}좌표의 절댓값은 커지고 ${variable("y")}좌표의 절댓값은 작아진다`,
      `${variable("x")}좌표의 절댓값은 작아지고 ${variable("y")}좌표의 절댓값은 커진다`,
      "두 좌표의 절댓값이 서로 같은 값으로 유지된다",
    ],
    answer: 2,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>그림의 점 A는 ${coord(POINTS_164[0].x, POINTS_164[0].y)}, 점 B는 ${coord(POINTS_164[1].x, POINTS_164[1].y)}예요. A에서 B로 가면 ${variable("x")}좌표의 절댓값은 3에서 7로 커지고 ${variable("y")}좌표의 절댓값은 7에서 3으로 작아져요. 곱 21을 유지하려면 한쪽이 커질 때 다른 쪽이 작아져야 해요.<span class='xh'>오답 하나씩 격파</span>둘 다 커지거나 둘 다 작아지면 두 좌표의 곱이 21로 유지되지 않아요. ${variable("x")}가 작아지고 ${variable("y")}가 커진다는 말은 이동 방향을 거꾸로 읽었어요. 두 절댓값이 늘 같다는 설명도 A와 B의 실제 좌표에 맞지 않아요. 두 점의 좌표를 각각 읽고 곱까지 확인해요.`,
    core: "반비례 그래프에서는 |x|가 커질 때 |y|가 작아져 곱의 크기를 유지해요.",
  },
  {
    id: "m1u3e165",
    lessonId: L,
    type: "multi",
    prompt: `${inverse(-35)}의 그래프 위에 있는 점을 <b>모두</b> 고르세요.`,
    options: [coord(-5, 7), coord(5, 7), coord(7, -5), coord(-7, -5), coord(-7, 5)],
    answer: [0, 2, 4],
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>${inverse(-35)}의 그래프 위 점은 두 좌표의 곱이 −35여야 해요. ${coord(-5, 7)}, ${coord(7, -5)}, ${coord(-7, 5)}는 각각 곱이 −35이므로 모두 골라요.<span class='xh'>선택지 격파</span>${coord(5, 7)}은 곱이 35이고, ${coord(-7, -5)}도 음수 두 수를 곱해 35가 되므로 그래프 위에 있지 않아요. 숫자 5와 7의 조합만 보고 고르면 부호를 놓치기 쉬워요. 이 식의 그래프는 제2·제4사분면에 있으므로 두 좌표의 부호가 달라야 한다는 조건과 곱의 정확한 값을 함께 확인해요.`,
    core: "그래프 위 점인지는 좌표의 부호와 곱 xy=a를 함께 확인해요.",
  },
  {
    id: "m1u3e166",
    lessonId: L,
    type: "num",
    prompt: `센서의 두 측정값 ${variable("x")}, ${variable("y")}가 반비례하고 한 측정점이 ${coord(8, -4)}예요. ${variable("x")}가 16이 되면 ${variable("y")}의 값을 쓰세요.`,
    answer: "-2",
    numKind: "int",
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>${variable("x")}가 8에서 16으로 2배가 되었으므로 반비례하는 ${variable("y")}는 −4의 절반인 <b>−2</b>가 돼요. 곱으로 확인하면 8×(−4)=−32이고 16×(−2)=−32로 일정해요.<span class='xh'>헷갈림 격파</span>'−8'은 ${variable("x")}가 2배일 때 ${variable("y")}도 2배로 만들어 정비례처럼 생각한 값이에요. '2'는 절반으로 줄이면서 음수 부호를 빠뜨렸고, '−32'는 일정한 곱을 ${variable("y")}값으로 옮긴 수예요. ${variable("x")}가 커졌다는 말만 보고 ${variable("y")}에 같은 수를 더하거나 빼지 말고 배수의 역수로 바꾸고 곱을 다시 검산해요.`,
    core: "x가 2배가 되므로 y는 −4의 절반인 −2가 돼요.",
  },
  {
    id: "m1u3e167",
    lessonId: L,
    type: "mcq",
    prompt: "점 (7, −3)을 지나는 반비례 그래프의 관계식은?",
    options: [inverse(21), inverse(-21), inverse(-28), `${variable("y")}=−21${variable("x")}`, inverse(32)],
    answer: 1,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>점 (7, −3)을 지나므로 ${variable("a")}=${variable("x")}${variable("y")}=7×(−3)=−21이에요. 따라서 관계식은 <b>${inverse(-21)}</b>이에요. ${variable("a")}가 음수라 제2사분면과 제4사분면에 나타난다는 조건에도 맞아요.<span class='xh'>오답 하나씩 격파</span>${inverse(21)}은 부호가 양수라 제1·3사분면에 나타나요. ${inverse(-28)}과 ${inverse(32)}는 점 (7, −3)의 좌표를 곱한 값과 분자가 달라요. ${variable("y")}=−21${variable("x")}는 나눗셈이 아니라 곱셈으로 나타낸 식이라 원점을 지나는 직선의 관계예요. 점의 곱과 그래프의 사분면을 두 번 확인하면 식을 하나로 정할 수 있어요.`,
    core: "한 점의 좌표를 곱해 a를 구하고 그 부호로 사분면을 검산해요.",
  },
  {
    id: "m1u3e168",
    lessonId: L,
    type: "word",
    prompt: "반비례 그래프가 만나지 않는 두 축을 한꺼번에 부르는 말을 고르세요.",
    answer: "좌표축",
    bank: ["좌표축", "원점", "사분면", "순서쌍", "좌표평면", "가로선", "세로선", "두 갈래", "격자점"],
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span><i class='mv'>x</i>축과 <i class='mv'>y</i>축을 한꺼번에 <b>좌표축</b>이라고 해요. ${variable("a")}가 0이 아닌 ${variable("y")}=${variable("a")}/${variable("x")}의 그래프는 두 좌표축에 가까워질 수 있지만 만나지는 않아요.<span class='xh'>낱말 하나씩 격파</span>'원점'은 두 축이 만나는 한 점이고, '사분면'은 좌표축이 나누는 네 구역이에요. '순서쌍'은 좌표를 나타내는 두 수, '좌표평면'은 좌표축이 놓인 평면 전체예요. '가로선'과 '세로선'은 방향만 말해 정확한 수학 이름이 아니고, '두 갈래'는 그래프의 모양이에요. '격자점'은 눈금선이 만나는 점이므로 두 축을 함께 부르는 말이 아니에요.`,
    core: "x축과 y축을 함께 좌표축이라고 하며 반비례 그래프는 좌표축과 만나지 않아요.",
  },
  {
    id: "m1u3e169",
    lessonId: L,
    type: "mcq",
    prompt: `그림의 ㉠, ㉡ 중 ${inverse(CURVES_169.inverse.a)}의 그래프를 찾고 그 까닭을 옳게 설명한 것은?`,
    figure: mExamRelationPlaneFig(PLANE_169),
    options: [
      "㉡, 원점을 지나는 직선이기 때문이다",
      "㉡, 제1사분면과 제3사분면을 지나기 때문이다",
      "㉠, 원점을 지나 한 줄로 이어지기 때문이다",
      "㉠, 서로 떨어진 두 갈래의 곡선이고 좌표축과 만나지 않기 때문이다",
      "㉠과 ㉡ 모두, 오른쪽 위와 왼쪽 아래에 부분이 있기 때문이다",
    ],
    answer: 3,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>㉠은 서로 떨어진 두 갈래의 매끄러운 곡선이고 두 좌표축과 만나지 않아요. 이는 ${inverse(CURVES_169.inverse.a)}의 그래프 모양과 같아요. ㉡은 원점을 지나 한 줄로 이어진 직선이므로 정비례 그래프예요.<span class='xh'>오답 하나씩 격파</span>㉡이 원점을 지나는 직선이라는 사실은 맞지만 그래서 반비례 그래프가 될 수는 없어요. 두 그림이 제1·3사분면에 보인다는 위치만으로 같은 종류라고 판단해서도 안 돼요. ㉠이 원점을 지나거나 한 줄로 이어진다는 설명은 그림과 반대예요. 두 그래프가 모두 조건을 만족한다는 말도 모양과 축 교차 여부를 무시했어요. 위치뿐 아니라 곡선의 갈래와 축과의 관계를 함께 봐요.`,
    core: "반비례의 두 갈래 곡선과 정비례의 원점을 지나는 직선을 구별해요.",
  },
  {
    id: "m1u3e170",
    lessonId: L,
    type: "num",
    prompt: `${inverse(-27)}의 그래프 위 점 ${coord(-9, 3)}에서 ${variable("x")}좌표를 −3으로 바꾸었을 때, 같은 그래프 위 점의 ${variable("y")}좌표를 쓰세요.`,
    answer: "9",
    numKind: "int",
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>${inverse(-27)}에서 ${variable("x")}${variable("y")}=−27이에요. ${variable("x")}=−3으로 바꾸면 (−3)${variable("y")}=−27이므로 ${variable("y")}=<b>9</b>예요. 새 점은 ${coord(-3, 9)}이고 두 좌표의 곱은 −27로 유지돼요.<span class='xh'>헷갈림 격파</span>'−9'는 음수 두 수를 나눌 때 몫의 부호를 잘못 정한 값이에요. '3'은 처음 점의 ${variable("y")}좌표를 그대로 둔 것이고, '−24'는 두 수의 차로 처리한 값이에요. ${variable("x")}좌표의 절댓값이 9에서 3으로 1/3배가 되었으므로 ${variable("y")}좌표의 절댓값은 3에서 9로 3배가 되는지도 끝까지 확인해요.`,
    core: "같은 곡선 위에서는 xy가 일정하므로 바뀐 x로 y를 다시 구해요.",
  },
  {
    id: "m1u3e171",
    lessonId: L,
    type: "mcq",
    prompt: `${inverse(14)}과 ${inverse(45)}에서 ${variable("x")}=5일 때 두 ${variable("y")}좌표의 절댓값을 비교한 것으로 옳은 것은?`,
    options: [
      `${inverse(45)}에서의 절댓값이 더 크다`,
      `${inverse(14)}에서의 절댓값이 더 크다`,
      "두 절댓값은 항상 같다",
      "둘 다 0이다",
      "두 관계 모두에서 값을 정할 수 없다",
    ],
    answer: 0,
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>${variable("x")}=5를 넣으면 ${inverse(14)}에서는 ${variable("y")}=14÷5=2.8, ${inverse(45)}에서는 ${variable("y")}=45÷5=9예요. 따라서 ${inverse(45)}에서의 ${variable("y")}좌표 절댓값 9가 더 커요. 같은 ${variable("x")}에서 분자의 절댓값이 큰 쪽이 축에서 더 멀리 놓여요.<span class='xh'>오답 하나씩 격파</span>${inverse(14)} 쪽이 더 크다는 말은 두 분자의 크기를 거꾸로 비교했어요. 두 값은 2.8과 9라 같지 않고, ${variable("x")}=5는 사용할 수 있는 값이므로 둘 다 0도 아니며 정할 수 없는 것도 아니에요. 직접 나누어 비교하면 그림의 겉모양에 기대지 않고 정확히 판단할 수 있어요.`,
    core: "같은 x에서는 |a|가 큰 반비례 그래프의 |y|가 더 커요.",
  },
  {
    id: "m1u3e172",
    lessonId: L,
    type: "multi",
    prompt: `반비례 그래프 ${variable("y")}=${variable("a")}/${variable("x")}에서 ${variable("a")}가 0이 아닐 때 항상 옳은 설명을 <b>모두</b> 고르세요.`,
    options: [
      "그래프는 두 좌표축과 만나지 않는다",
      `${variable("a")}&gt;0이면 제1사분면과 제3사분면에 나타난다`,
      "그래프는 언제나 원점을 지나는 직선이다",
      `${variable("a")}&lt;0이면 제2사분면과 제4사분면에 나타난다`,
      "그래프의 한 갈래만 그려도 전체 그래프가 된다",
    ],
    answer: [0, 1, 3],
    diff: 2,
    explain:
      `<span class='xh'>정답 풀이</span>${variable("a")}가 0이 아닌 반비례 그래프는 두 좌표축과 만나지 않아요. ${variable("a")}&gt;0이면 두 좌표의 부호가 같아 제1·3사분면에, ${variable("a")}&lt;0이면 부호가 달라 제2·4사분면에 나타나요. 따라서 이 세 설명을 모두 골라요.<span class='xh'>선택지 격파</span>원점을 지나는 직선이라는 설명은 정비례 그래프의 특징을 섞은 것이에요. 원점에서는 ${variable("x")}=0이라 반비례식을 사용할 수 없어요. 한 갈래만 그려도 전체라는 설명도 틀려요. 반비례 그래프는 서로 마주 보는 두 사분면에 한 갈래씩 있으므로 양쪽을 모두 보아야 해요. 축, 부호, 갈래 수를 각각 따로 확인하면 빠뜨리지 않아요.`,
    core: "반비례 그래프는 a의 부호에 맞는 두 사분면에 두 갈래로 나타나고 축과 만나지 않아요.",
  },
  {
    id: "m1u3e173",
    lessonId: L,
    type: "num",
    prompt: `그림의 곡선은 ${variable("y")}=${variable("a")}/${variable("x")}의 그래프이고 R${coord(POINT_173.x, POINT_173.y)}를 지나요. 같은 곡선에서 ${variable("x")}=4일 때 ${variable("y")}의 값을 쓰세요.`,
    figure: mExamRelationPlaneFig(PLANE_173),
    answer: String(A_173 / TARGET_X_173),
    numKind: "int",
    diff: 3,
    explain:
      `<span class='xh'>정답 풀이</span>먼저 R${coord(POINT_173.x, POINT_173.y)}에서 ${variable("a")}=${variable("x")}${variable("y")}=(${minus(POINT_173.x)})×(${minus(POINT_173.y)})=${A_173}를 구해요. 관계식은 ${inverse(A_173)}이고, ${variable("x")}=${TARGET_X_173}를 넣으면 ${variable("y")}=${A_173}÷${TARGET_X_173}=<b>${A_173 / TARGET_X_173}</b>이에요. 새 점은 ${coord(TARGET_X_173, A_173 / TARGET_X_173)}로 제1사분면의 다른 갈래에 있어요.<span class='xh'>헷갈림 격파</span>'−8'은 처음 점의 ${variable("x")}를 옮긴 값이고, '−4'는 처음 ${variable("y")}를 그대로 둔 값이에요. '−8'처럼 부호를 음수로 두면 양수인 ${variable("a")}와 맞지 않아요. 한 점으로 ${variable("a")}를 먼저 복원하고 목표 ${variable("x")}를 넣는 두 단계를 지켜요. 마지막에는 4×8=32인지 곱으로 다시 확인해요.`,
    core: "한 점으로 a를 복원한 뒤 다른 x값의 y를 구하면 반대쪽 갈래도 찾을 수 있어요.",
  },
  {
    id: "m1u3e174",
    lessonId: L,
    type: "mcq",
    prompt: `${variable("y")}=${variable("a")}/${variable("x")}의 그래프가 점 ${coord(-5, -6)}을 지날 때, 같은 그래프 위의 점은?`,
    options: [coord(5, -6), coord(-6, 5), coord(6, -5), coord(-5, 6), coord(5, 6)],
    answer: 4,
    diff: 3,
    explain:
      `<span class='xh'>정답 풀이</span>점 ${coord(-5, -6)}에서 ${variable("a")}=(−5)×(−6)=30이에요. 같은 그래프 위의 점은 두 좌표의 곱이 30이어야 하므로 ${coord(5, 6)}이 맞아요. 두 좌표가 모두 양수여서 제1사분면의 다른 갈래에 있다는 점도 확인할 수 있어요.<span class='xh'>오답 하나씩 격파</span>${coord(5, -6)}과 ${coord(6, -5)}은 곱이 −30이고, ${coord(-6, 5)}와 ${coord(-5, 6)}도 곱이 −30이에요. 숫자 5와 6만 같다고 같은 그래프가 되는 것은 아니며 부호까지 확인해야 해요. 원래 점의 두 부호를 함께 바꾸면 곱과 그래프가 유지돼요.`,
    core: "두 좌표의 부호를 함께 바꾸면 곱이 같아 반대쪽 갈래의 점이 돼요.",
  },
  {
    id: "m1u3e175",
    lessonId: L,
    type: "mcq",
    prompt: `${inverse(-20)} 위의 점 ${coord(4, -5)}에서 좌표의 부호를 바꾸어 만든 점에 대한 설명으로 옳은 것은?`,
    options: [
      `${coord(-4, -5)}도 같은 그래프 위에 있다`,
      `${coord(4, 5)}도 같은 그래프 위에 있다`,
      `${coord(-4, 5)}는 같은 그래프의 반대쪽 갈래에 있다`,
      "어느 좌표의 부호를 바꾸어도 항상 같은 그래프 위에 있다",
      "두 좌표의 부호를 함께 바꾸면 원점이 된다",
    ],
    answer: 2,
    diff: 3,
    explain:
      `<span class='xh'>정답 풀이</span>${coord(4, -5)}의 두 좌표를 모두 반대로 바꾸면 ${coord(-4, 5)}가 되고, 곱은 (−4)×5=−20으로 그대로예요. 따라서 이 점은 같은 그래프의 제2사분면 쪽 갈래에 있어요.<span class='xh'>오답 하나씩 격파</span>${coord(-4, -5)}는 곱이 20이고 ${coord(4, 5)}도 곱이 20이라 다른 관계를 나타내요. 어느 한 좌표의 부호만 바꾸면 곱의 부호가 달라져요. 두 좌표의 부호를 함께 바꾸어도 좌표의 크기는 그대로이므로 원점이 되지 않아요. 바뀐 좌표를 실제로 곱해 분자의 수와 비교해요.`,
    core: "두 좌표의 부호를 동시에 바꾸면 xy가 유지되어 반대쪽 갈래로 옮겨가요.",
  },
  {
    id: "m1u3e176",
    lessonId: L,
    type: "mcq",
    prompt: `학생이 ${inverse(45)}의 그래프를 보고 "오른쪽으로 계속 가면 곡선이 결국 ${variable("x")}축과 만난다"라고 말했어요. 가장 알맞은 반박은?`,
    options: [
      `점 ${coord(0, 45)}에서 ${variable("y")}축과 먼저 만난다`,
      `점 ${coord(45, 0)}에서 ${variable("x")}축과 만난다`,
      "두 좌표축과 각각 한 번씩 만난다",
      `${variable("x")}좌표의 절댓값이 커지면 ${variable("y")}좌표의 절댓값은 0에 가까워지지만 0이 되지는 않는다`,
      "원점을 지나면 두 좌표축과 동시에 만난다",
    ],
    answer: 3,
    diff: 3,
    explain:
      `<span class='xh'>정답 풀이</span>${inverse(45)}에서 ${variable("x")}좌표의 절댓값이 커지면 ${variable("y")}=45/${variable("x")}의 절댓값은 점점 작아져 0에 가까워져요. 그러나 어떤 사용할 수 있는 ${variable("x")}를 넣어도 ${variable("y")}=0이 되지는 않으므로 곡선은 ${variable("x")}축과 만나지 않아요.<span class='xh'>오답 하나씩 격파</span>${coord(45, 0)}은 곱이 0이라 45가 아니고, ${coord(0, 45)}는 ${variable("x")}=0을 식에 사용할 수 없어 그래프 위 점이 아니에요. 따라서 두 축과 한 번씩 만난다는 설명도 틀려요. 원점에서는 두 좌표의 곱이 0이며 분모도 0이 되므로 그래프가 지날 수 없어요. 가까워지는 것과 실제로 만나는 것을 구분해요.`,
    core: "반비례 곡선은 좌표축에 가까워져도 만나지 않아요.",
  },
  {
    id: "m1u3e177",
    lessonId: L,
    type: "mcq",
    prompt: `곡선 ㉠은 점 ${coord(7, 4)}를 지나고, 곡선 ㉡은 점 ${coord(-4, 8)}을 지나는 ${variable("y")}=${variable("a")}/${variable("x")} 꼴의 그래프예요. 옳은 설명은?`,
    options: [
      "㉠은 제1·제3사분면에, ㉡은 제2·제4사분면에 나타난다",
      "㉠과 ㉡은 모두 제1·제3사분면에 나타난다",
      "㉠과 ㉡은 모두 제2·제4사분면에 나타난다",
      "㉠은 좌표축과 만나지만 ㉡은 만나지 않는다",
      "㉡은 원점을 지나고 ㉠은 원점을 지나지 않는다",
    ],
    answer: 0,
    diff: 3,
    explain:
      `<span class='xh'>정답 풀이</span>㉠의 ${variable("a")}는 7×4=28로 양수이므로 제1·3사분면에 나타나요. ㉡의 ${variable("a")}는 (−4)×8=−32로 음수이므로 제2·4사분면에 나타나요. 한 점의 두 좌표를 곱하면 각 곡선의 위치를 모두 정할 수 있어요.<span class='xh'>오답 하나씩 격파</span>두 곡선이 같은 사분면 쌍에 나타난다는 설명들은 ${variable("a")}의 부호가 서로 다르다는 사실을 놓쳤어요. 반비례 그래프는 ${variable("a")}의 부호와 관계없이 좌표축과 만나지 않으므로 ㉠만 만난다는 말도 틀려요. ㉡만 원점을 지난다는 설명도 틀려요. 두 곡선 모두 ${variable("x")}=0을 사용할 수 없어 원점을 지나지 않아요.`,
    core: "각 곡선의 한 점에서 a의 부호를 구하면 나타나는 사분면 쌍을 비교할 수 있어요.",
  },
];
