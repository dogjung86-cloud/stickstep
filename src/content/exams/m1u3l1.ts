// 수학 중1 Ⅲ. 좌표평면과 그래프 v2 재출제 문항 풀 · L1 좌표: 위치를 수의 쌍으로(책 104~107쪽) 슬롯 1~22(22문항).
// 생성 파일: 수정은 qa/m1u3v2-*.ts(스테이징 정본)에서 한 뒤 node qa/build-m1u3v2-lessons.mjs 재실행.
// 규격 v2(정본 qa/m1u3-v2-blueprint.md · §3-0 우선): mcq 11/multi 2/num 9·word 0 · diff 9/9/4 ·
// 그림 12 · mfmt 미사용(slash 분수·withVars·U+2212) · 무그림은 화이트리스트 사유 태그 · em대시 금지.
import type { ExamItem } from "./types";
import { mExamPlaneFig, mExamNumLineFig, type MExamPlaneSpec } from "../../ui/examFiguresMath";

const withVars = (text: string): string =>
  text.replace(/[xyabck]/g, (variable) => `<i class='mv'>${variable}</i>`);
const coord = (x: number, y: number): string => `(${minus(x)}, ${minus(y)})`;
const PLANE_S1: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [
    { label: "P", x: 2, y: 5, color: "#2F9E44" },
    { label: "Q", x: -4, y: 3, color: "#364FC7" },
    { label: "R", x: 3, y: -3, color: "#E8547E" },
  ],
};
const PLANE_S9: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [
    { label: "G", x: -4, y: 2, color: "#364FC7" },
    { label: "H", x: 3, y: 2, color: "#2F9E44" },
    { label: "J", x: 0, y: -3, color: "#E8547E", labelDx: 13 },
  ],
};
const PLANE_S12: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [
    { label: "A", x: -2, y: 4, color: "#364FC7" },
    { label: "B", x: -2, y: -2, color: "#E8547E" },
    { label: "C", x: 3, y: -2, color: "#2F9E44" },
  ],
};
const PLANE_S2: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [
    { label: "P", x: -5, y: 2, color: "#364FC7" },
    { label: "Q", x: 1, y: 4, color: "#2F9E44" },
    { label: "R", x: 4, y: -1, color: "#E8547E" },
  ],
};
const PLANE_S3: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [
    { label: "A", x: 2, y: 3, color: "#2F9E44" },
    { label: "B", x: 0, y: -4, color: "#364FC7", labelDx: 13 },
    { label: "C", x: -3, y: 1, color: "#E8547E" },
    { label: "D", x: 4, y: 0, color: "#8A6EE0", labelDy: -10 },
    { label: "E", x: -2, y: -2, color: "#F08C2E" },
  ],
};
const PLANE_S6: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [
    { label: "도서관", x: -3, y: 2, color: "#364FC7" },
    { label: "문구점", x: 2, y: 4, color: "#2F9E44" },
    { label: "공원", x: 4, y: -2, color: "#F08C2E" },
    { label: "분식집", x: -1, y: -4, color: "#E8547E" },
    { label: "정류장", x: 0, y: 1, color: "#8A6EE0", labelDx: 24 },
  ],
};
const PLANE_S8: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [{ label: "A", x: -2, y: 1, color: "#364FC7" }],
};
const PLANE_S13: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [
    { label: "K", x: 4, y: -2, color: "#2F9E44" },
    { label: "L", x: -2, y: 4, color: "#364FC7" },
    { label: "M", x: -2, y: -4, color: "#E8547E" },
    { label: "N", x: 2, y: 4, color: "#8A6EE0" },
    { label: "S", x: -4, y: 2, color: "#F08C2E" },
  ],
};
const PLANE_S21: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [
    { label: "A", x: -3, y: 3, color: "#364FC7" },
    { label: "B", x: -3, y: -1, color: "#E8547E" },
    { label: "C", x: 2, y: -1, color: "#2F9E44" },
  ],
};
const PLANE_S22: MExamPlaneSpec = {
  min: -6,
  max: 6,
  labelEvery: 1,
  points: [
    { label: "C", x: 5, y: 1, color: "#2F9E44" },
    { label: "D", x: -3, y: 6, color: "#364FC7" },
    { label: "E", x: 2, y: -5, color: "#E8547E" },
  ],
};
const minus = (value: number | string): string => String(value).replace("-", "−");

export const POOL_M1U3L1: ExamItem[] = [
  {
    // [슬롯 1] 검산: Q는 원점에서 왼쪽 4칸(x=−4)·위 3칸(y=3) → (−4, 3). 레슨 coordReadFig
    //  B(−3, −4)와 이름·값·사분면 전부 분리(§3-0). 오답 = 순서 뒤집기·부호 반전 조합 4종.
    id: "m1u3e001",
    lessonId: "m1u3l1",
    type: "mcq",
    prompt: "그림에서 점 <b>Q</b>의 좌표는?",
    figure: mExamPlaneFig(PLANE_S1),
    options: [coord(-4, 3), coord(3, -4), coord(4, -3), coord(-3, 4), coord(4, 3)],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>점 Q에서 세로 점선을 내려 <i class='mv'>x</i>축과 만나는 수를 읽으면 −4, 가로 점선을 그어 <i class='mv'>y</i>축과 만나는 수를 읽으면 3이에요. 좌표는 언제나 가로 <i class='mv'>x</i>좌표를 먼저, 세로 <i class='mv'>y</i>좌표를 나중에 쓰므로 Q의 좌표는 <b>(−4, 3)</b>이에요.<span class='xh'>오답 하나씩 격파</span>'(3, −4)'는 두 수의 순서를 뒤집고 부호까지 그대로 옮긴 답이고, '(−3, 4)'는 두 좌표의 자리를 서로 바꾼 답이에요. '(4, −3)'은 두 부호를 모두 반대로 읽었고, '(4, 3)'은 왼쪽 방향의 음수 부호를 빠뜨렸어요. 점에서 두 축으로 점선을 내려 순서대로 읽는 습관이 함정을 전부 막아 줘요.",
    core: "좌표는 가로 x 먼저, 세로 y 나중 순서로 읽어요.",
  },
  {
    // [슬롯 2] 검산: P는 원점에서 왼쪽 5칸 = x좌표 −5 ✓ (y좌표 2는 답 아님). L1 num 값표의
    //  음수 자리(§3) · 파일 내 유일(−5). "좌표를 구하세요" 무단위 면제 문구.
    id: "m1u3e002",
    lessonId: "m1u3l1",
    type: "num",
    prompt: "그림에서 점 <b>P</b>의 <b>x좌표</b>를 구하세요.",
    figure: mExamPlaneFig(PLANE_S2),
    answer: "-5",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>점 P에서 세로로 점선을 내려 <i class='mv'>x</i>축과 만나는 눈금을 읽으면 −5예요. 가로 방향의 위치를 나타내는 수가 <i class='mv'>x</i>좌표이므로 답은 <b>−5</b>예요. P가 원점에서 왼쪽에 있으니 <i class='mv'>x</i>좌표가 음수인 것도 자연스럽죠.<span class='xh'>계산 함정 격파</span>세로 위치인 2를 답하면 <i class='mv'>y</i>좌표를 읽은 거예요. 괄호 표기 (−5, 2)에서 앞의 수가 <i class='mv'>x</i>좌표, 뒤의 수가 <i class='mv'>y</i>좌표라는 순서를 늘 확인해요. 또 왼쪽으로 5칸인데 부호를 빠뜨리고 5라고 쓰면 오른쪽에 있는 전혀 다른 점이 되니, 원점 기준 방향과 부호를 세트로 챙겨요.",
    core: "x좌표는 가로 방향, 왼쪽이면 음수예요.",
  },
  {
    // [슬롯 3] 검산: 다섯 점 중 x좌표가 0인 점 = B(0, −4)만 y축 위 ✓. D(4, 0)은 x축 위
    //  함정. 기호 보기 shuffle:false · 정답 B는 두 번째(① 금지 ✓).
    id: "m1u3e003",
    lessonId: "m1u3l1",
    type: "mcq",
    prompt: "그림의 다섯 점 중 <b>y축 위</b>의 점은?",
    figure: mExamPlaneFig(PLANE_S3),
    options: ["A", "B", "C", "D", "E"],
    answer: 1,
    shuffle: false,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>y축 위의 점은 가로로 움직인 거리가 없는 점, 즉 <i class='mv'>x</i>좌표가 0인 점이에요. 다섯 점의 좌표를 읽으면 A(2, 3), B(0, −4), C(−3, 1), D(4, 0), E(−2, −2)이고, <i class='mv'>x</i>좌표가 0인 점은 <b>B</b>뿐이에요.<span class='xh'>오답 하나씩 격파</span>가장 헷갈리는 건 D(4, 0)이에요. 좌표에 0이 있어서 축 위의 점은 맞지만, <i class='mv'>y</i>좌표가 0이라 y축이 아닌 x축 위에 있죠. 어느 좌표가 0인지에 따라 놓인 축이 달라져요. A, C, E는 두 좌표 모두 0이 아니라서 어느 축 위에도 있지 않아요. 'y축 위면 x좌표가 0'을 거꾸로 뒤집지 않도록 조심해요.",
    core: "y축 위의 점은 x좌표가 0, x축 위는 y좌표가 0!",
  },
  {
    // [슬롯 4] 검산: 두 순서쌍이 같으므로 같은 자리끼리 비교 · a+2=9 → a=7 ✓ (y자리 −5는
    //  이미 일치). 레슨 상등 앵커 (3−a, 4)=(5, 2b−6)과 구조·수치 분리.
    id: "m1u3e004",
    lessonId: "m1u3l1",
    type: "num",
    prompt: "두 순서쌍 " + withVars("(a+2, −5)") + "와 " + withVars("(9, −5)") + "가 서로 같을 때, " + withVars("a") + "의 값을 구하세요.",
    answer: "7",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>두 순서쌍이 서로 같다는 것은 같은 자리의 수가 각각 같다는 뜻이에요. 첫째 자리끼리 비교하면 <i class='mv'>a</i>+2=9이므로 <i class='mv'>a</i>=<b>7</b>이에요. 둘째 자리는 −5로 이미 같으니 조건이 저절로 맞죠. 검산으로 <i class='mv'>a</i>=7을 넣으면 (9, −5)=(9, −5)로 완전히 일치해요.<span class='xh'>계산 함정 격파</span><i class='mv'>a</i>+2=9에서 2를 빼는 대신 더해 버리면 11이라는 오답이 나와요. 이항할 때는 부호가 바뀐다는 기본을 지켜요. 또 첫째 자리와 둘째 자리를 엇갈려 비교해 <i class='mv'>a</i>+2=−5로 놓으면 완전히 다른 값이 되니, 순서쌍의 상등은 반드시 같은 자리끼리 짝지어요.",
    core: "순서쌍이 같으면 같은 자리끼리 등식을 세워요.",
  },
  {
    // [슬롯 5] 검산: B는 −1과 0 사이를 2등분한 잔눈금 위 = −1/2. A(2)는 정수점 미끼.
    //  비상05-1(−1/3 3등분) 계보의 2등분 교체. 값 미인쇄(nlFig 규약) · 보기 slash 표기.
    id: "m1u3e005",
    lessonId: "m1u3l1",
    type: "mcq",
    prompt: "수직선 위의 두 점 A, B 중 점 <b>B</b>의 좌표는?",
    figure: mExamNumLineFig({ min: -3, max: 3, points: [{ label: "A", value: 2 }, { label: "B", value: -0.5 }], subdiv: { lo: -1, den: 2 } }),
    options: ["−1/2", "1/2", "−1", "−2", "0"],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>점 B는 −1과 0 사이에 있어요. 그 사이에 작은 눈금이 하나 더 있어서 한 칸을 똑같이 둘로 나누고 있죠. B는 −1에서 0 쪽으로 반 칸 간 곳이므로 좌표는 <b>−1/2</b>이에요. 수직선 위의 점은 수 하나로 나타내고, 정수 눈금 사이에 있으면 분수나 소수로 읽어요.<span class='xh'>오답 하나씩 격파</span>'1/2'은 0의 오른쪽으로 잘못 읽어 부호를 놓친 답이에요. '−1'과 '−2'는 B가 정수 눈금 위에 있지 않은데 가까운 정수로 대충 읽은 답이고, '0'은 원점과 혼동한 답이에요. 점이 어느 두 정수 사이에 있는지, 그 사이가 몇 등분되어 있는지를 차례로 확인하면 정확히 읽을 수 있어요.",
    core: "정수 눈금 사이의 점은 등분을 세어 분수로 읽어요.",
  },
  {
    // [슬롯 6] 검산: 실좌표 = 도서관(−3, 2)·문구점(2, 4)·공원(4, −2)·분식집(−1, −4)·정류장(0, 1).
    //  보기 대조: 도서관 (−3, 2) 일치 ✓ / 문구점 (4, 2) 순서 바꿈 / 공원 (−2, 4) 순서+부호 /
    //  분식집 (−1, 4) 부호 누락 / 정류장 (1, 0) 순서 바꿈. 레슨 지도(mapPointsFig) 소품과 분리 신작.
    id: "m1u3e006",
    lessonId: "m1u3l1",
    type: "mcq",
    prompt: "동네 지도를 좌표평면에 옮겼어요. 위치를 <b>옳게</b> 나타낸 것은?",
    figure: mExamPlaneFig(PLANE_S6),
    options: ["도서관: (−3, 2)", "문구점: (4, 2)", "공원: (−2, 4)", "분식집: (−1, 4)", "정류장: (1, 0)"],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>각 장소의 좌표를 그림에서 하나씩 검산해요. 도서관은 원점에서 왼쪽 3칸, 위 2칸이므로 (−3, 2)가 맞아요. 나머지 보기는 전부 어딘가 어긋나 있어서 옳은 것은 <b>도서관</b>뿐이에요.<span class='xh'>오답 하나씩 격파</span>문구점의 실제 위치는 (2, 4)인데 보기는 두 수를 바꿔 (4, 2)로 적었어요. 공원은 (4, −2)인데 (−2, 4)는 순서와 부호가 함께 뒤집힌 표기죠. 분식집은 아래쪽 4칸이라 (−1, −4)인데 보기 (−1, 4)는 음수 부호를 놓쳤고, 정류장은 y축 위의 점 (0, 1)인데 (1, 0)은 x축 위로 옮겨 버린 표기예요. 지도 문제는 한 곳씩 점선을 그어 확인하는 것이 가장 확실해요.",
    core: "장소마다 가로 먼저 세로 나중, 하나씩 검산해요.",
  },
  {
    // [슬롯 7] 검산: 2a−1=7 → a=4 ✓ (둘째 자리 3은 일치). 슬롯 4와 값 분산(7 vs 4).
    id: "m1u3e007",
    lessonId: "m1u3l1",
    type: "num",
    prompt: "두 순서쌍 " + withVars("(2a−1, 3)") + "과 " + withVars("(7, 3)") + "이 서로 같을 때, " + withVars("a") + "의 값을 구하세요.",
    answer: "4",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>순서쌍이 서로 같으므로 첫째 자리끼리 비교하면 2<i class='mv'>a</i>−1=7이에요. 양변에 1을 더하면 2<i class='mv'>a</i>=8이고, 2로 나누면 <i class='mv'>a</i>=<b>4</b>예요. 둘째 자리는 둘 다 3이라 저절로 맞아요. 검산하면 2×4−1=7로 첫째 자리가 정확히 일치하죠.<span class='xh'>계산 함정 격파</span>2<i class='mv'>a</i>−1=7에서 −1을 넘길 때 부호를 잘못 다뤄 2<i class='mv'>a</i>=6으로 쓰면 <i class='mv'>a</i>=3이 돼요. 이항은 부호 반전이라는 것을 확인해요. 또 문자가 있는 자리와 3이 있는 자리를 엇갈려 2<i class='mv'>a</i>−1=3으로 세우면 <i class='mv'>a</i>=2가 나오죠. 등식은 반드시 같은 자리끼리, 계산은 한 단계씩 밟아요.",
    core: "같은 자리 등식 하나면 a가 결정돼요.",
  },
  {
    // [슬롯 8] 검산: A(−2, 1)에서 오른쪽 4칸 → x = −2+4 = 2, 아래 3칸 → y = 1−3 = −2
    //  → (2, −2) ✓. 그림엔 출발점 A만(도착점 미표시 = 유출 없음, 격자는 세기 보조).
    id: "m1u3e008",
    lessonId: "m1u3l1",
    type: "mcq",
    prompt: "그림의 점 A에서 <b>오른쪽으로 4칸, 아래로 3칸</b> 이동한 점의 좌표는?",
    figure: mExamPlaneFig(PLANE_S8),
    options: [coord(2, -2), coord(-6, 4), coord(2, 4), coord(-2, -2), coord(1, -2)],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>점 A의 좌표는 (−2, 1)이에요. 오른쪽으로 4칸 이동하면 <i class='mv'>x</i>좌표가 4만큼 커져 −2+4=2가 되고, 아래로 3칸 이동하면 <i class='mv'>y</i>좌표가 3만큼 작아져 1−3=−2가 돼요. 도착점은 <b>(2, −2)</b>예요.<span class='xh'>오답 하나씩 격파</span>'(−6, 4)'는 왼쪽·위로 반대로 이동한 답이고, '(2, 4)'는 아래 이동을 위로 착각해 1+3을 계산한 거예요. '(−2, −2)'는 가로 이동을 빠뜨린 채 세로만 움직였죠. '(1, −2)'가 답이 되려면 −2+4=1이어야 하는데 실제로는 2가 되니, 칸을 셀 때 출발 칸까지 포함해 세면 이렇게 한 칸 모자라게 돼요. 이동 문제는 '오른쪽·위는 더하기, 왼쪽·아래는 빼기'로 방향을 부호로 번역한 뒤 좌표별로 따로 계산해요.",
    core: "오른쪽·위는 +, 왼쪽·아래는 −로 좌표별 계산!",
  },
  {
    // [슬롯 9] 검산: G(−4, 2)·H(3, 2)·J(0, −3). ㄱ 참(둘 다 y=2), ㄴ 참(J의 x=0 = y축 위),
    //  ㄷ 참(H의 x=3), ㄹ 거짓(G는 (−4, 2) · (2, −4)는 자리 바꿈), ㅁ 거짓(J의 y=−3).
    //  사분면 어휘는 L2 선행이라 미사용(진도 오염 방지).
    id: "m1u3e009",
    lessonId: "m1u3l1",
    type: "multi",
    prompt: "그림의 세 점 G, H, J에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    figure: mExamPlaneFig(PLANE_S9),
    options: [
      "점 G와 점 H는 y좌표가 서로 같아요",
      "점 J는 y축 위의 점이에요",
      "점 H의 x좌표는 3이에요",
      "점 G의 좌표는 (2, −4)예요",
      "점 J의 y좌표는 0이에요",
    ],
    answer: [0, 1, 2],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>세 점의 좌표를 먼저 읽으면 G(−4, 2), H(3, 2), J(0, −3)이에요. G와 H는 둘 다 <i class='mv'>y</i>좌표가 2로 같아서 첫 번째 설명이 옳고, J는 <i class='mv'>x</i>좌표가 0이므로 y축 위의 점이 맞아요. H의 <i class='mv'>x</i>좌표가 3이라는 설명도 그대로 참이죠.<span class='xh'>틀린 설명 격파</span>'점 G의 좌표는 (2, −4)'는 G의 두 좌표를 자리만 바꿔 쓴 것이라 완전히 다른 점이 돼요. 순서쌍은 순서가 생명이에요. '점 J의 y좌표는 0'도 틀렸어요. J는 y축 위에 있어서 x좌표가 0인 것이지, y좌표는 −3이거든요. 축 위의 점은 어느 좌표가 0인지 헷갈리기 쉬우니 y축 위면 x가 0이라고 정확히 기억해요.",
    core: "y축 위의 점은 x좌표가 0이에요.",
  },
  {
    // [슬롯 10] 검산: y축 위 = x좌표 0 → 2a−6=0 → a=3 ✓ (y좌표 a+1=4는 0이 아니어도 됨 ·
    //  미래엔11 문자 조건 계보). 슬롯 14(x축 위 b=0)와 축 방향 분산.
    id: "m1u3e010",
    lessonId: "m1u3l1",
    type: "num",
    prompt: "점 " + withVars("A(2a−6, a+1)") + "이 <b>y축 위</b>의 점일 때, " + withVars("a") + "의 값을 구하세요.",
    answer: "3",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>y축 위의 점은 <i class='mv'>x</i>좌표가 0이에요. 그래서 2<i class='mv'>a</i>−6=0이라는 등식을 세우면 2<i class='mv'>a</i>=6, <i class='mv'>a</i>=<b>3</b>이에요. 이때 점의 좌표는 (0, 4)가 되어 정말 y축 위에 놓이는 것까지 검산할 수 있죠.<span class='xh'>계산 함정 격파</span>y축 위라는 말에 <i class='mv'>y</i>좌표를 0으로 놓고 <i class='mv'>a</i>+1=0을 풀면 <i class='mv'>a</i>=−1이라는 정반대 답이 나와요. y축 위의 점은 세로축에 붙어 있으니 가로 이동, 즉 <i class='mv'>x</i>좌표가 0이라는 뜻이에요. 축의 이름과 0이 되는 좌표가 서로 엇갈리는 게 이 유형의 핵심 함정이니, 'y축 위 = x가 0, x축 위 = y가 0'을 소리 내어 확인하고 시작해요.",
    core: "y축 위라면 x좌표 자리에 0을 놓고 풀어요.",
  },
  {
    // [슬롯 11] 검산: 참 = "원점 O의 좌표는 (0, 0)" ✓. 거짓 4 = x축 위 x좌표 0(엇갈림)·
    //  (2, 5)=(5, 2)(순서)·y축 위 y좌표 0(엇갈림)·순서 바꿔도 됨(정면 부정). 문장 보기 셔플 기본.
    id: "m1u3e011",
    lessonId: "m1u3l1",
    type: "mcq",
    prompt: "좌표와 좌표축에 대한 설명으로 <b>옳은</b> 것은?",
    options: [
      "원점 O의 좌표는 (0, 0)이에요",
      "x축 위의 점은 x좌표가 0이에요",
      "점 (2, 5)와 점 (5, 2)는 같은 점이에요",
      "y축 위의 점은 y좌표가 0이에요",
      "순서쌍은 두 수의 순서를 바꿔 써도 같은 점을 나타내요",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>원점 O는 x축과 y축이 만나는 점으로, 가로로도 세로로도 움직이지 않은 자리라 좌표가 <b>(0, 0)</b>이에요. 이것이 옳은 설명이에요.<span class='xh'>오답 하나씩 격파</span>'x축 위의 점은 x좌표가 0'과 'y축 위의 점은 y좌표가 0'은 둘 다 축 이름과 0이 되는 좌표를 엇갈리게 짝지은 함정이에요. x축 위의 점은 세로 이동이 없어 <i class='mv'>y</i>좌표가 0이고, y축 위의 점은 가로 이동이 없어 <i class='mv'>x</i>좌표가 0이죠. '(2, 5)와 (5, 2)는 같은 점'과 '순서를 바꿔 써도 된다'는 순서쌍의 생명인 순서를 무시한 설명이에요. 두 수가 같아도 순서가 다르면 완전히 다른 위치랍니다.",
    core: "원점은 (0, 0), 축 위의 0은 이름과 엇갈려요.",
  },
  {
    // [슬롯 12] 검산: A(−2, 4)·B(−2, −2)·C(3, −2). AB는 x=−2 세로 선분 길이 4−(−2)=6,
    //  BC는 y=−2 가로 선분 길이 3−(−2)=5, B에서 직각 → 넓이 = 5×6÷2 = 15 ✓.
    //  문두 좌표+그림 점(정보 이중 제시 관행). 무단위 넓이라 unitLabel 생략.
    id: "m1u3e012",
    lessonId: "m1u3l1",
    type: "num",
    prompt:
      "좌표평면 위의 세 점 " +
      withVars("A(−2, 4), B(−2, −2), C(3, −2)") +
      "를 꼭짓점으로 하는 삼각형 ABC의 넓이를 구하세요.",
    figure: mExamPlaneFig(PLANE_S12),
    answer: "15",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>변 AB는 두 점의 <i class='mv'>x</i>좌표가 −2로 같아서 세로 선분이고, 길이는 4−(−2)=6이에요. 변 BC는 두 점의 <i class='mv'>y</i>좌표가 −2로 같아서 가로 선분이고, 길이는 3−(−2)=5예요. 세로 변과 가로 변이 점 B에서 직각으로 만나므로 삼각형 ABC는 직각삼각형이고, 넓이는 5×6÷2=<b>15</b>예요.<span class='xh'>계산 함정 격파</span>변의 길이를 구할 때 4−2=2, 3−2=1처럼 부호를 무시하고 빼면 길이가 틀려져요. 음수 좌표가 섞이면 큰 수에서 작은 수를 빼서 거리를 구해야 해요. 또 5×6=30에서 멈추면 직사각형의 넓이가 되니, 삼각형은 반드시 2로 나누는 것까지 마무리해요.",
    core: "축과 나란한 두 변을 찾으면 밑변×높이÷2로 끝나요.",
  },
  {
    // [슬롯 13] 검산: x좌표 −2·y좌표 4인 점 = L(−2, 4) ✓. 함정 배치: K(4, −2) 순서 뒤집기·
    //  M(−2, −4) 부호·N(2, 4) x부호·S(−4, 2) 자리 바꿈. 기호 보기 고정 · 정답 두 번째(① 금지 ✓).
    id: "m1u3e013",
    lessonId: "m1u3l1",
    type: "mcq",
    prompt: "그림에서 <b>x좌표가 −2</b>이고 <b>y좌표가 4</b>인 점은?",
    figure: mExamPlaneFig(PLANE_S13),
    options: ["K", "L", "M", "N", "S"],
    answer: 1,
    shuffle: false,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>조건을 좌표로 쓰면 (−2, 4), 즉 원점에서 왼쪽 2칸·위 4칸인 자리예요. 그림에서 그 자리에 있는 점은 <b>L</b>이에요.<span class='xh'>오답 하나씩 격파</span>K(4, −2)는 두 수의 순서가 뒤집힌 자리라 오른쪽 아래에 있고, M(−2, −4)은 x좌표는 맞지만 y좌표의 부호가 반대라 아래쪽에 있어요. N(2, 4)은 y좌표만 맞고 x가 오른쪽이며, S(−4, 2)는 두 좌표의 자리가 서로 바뀐 위치예요. 조건이 좌표로 주어지면 머릿속에서 (−2, 4)라는 순서쌍부터 완성한 뒤, 왼쪽 2칸·위 4칸을 정확히 세어 그 자리의 점 하나만 고르면 돼요.",
    core: "조건을 순서쌍으로 완성한 뒤 자리를 세요.",
  },
  {
    // [슬롯 14] 검산: x축 위 = y좌표 0 → b=0 ✓ (x좌표 −3은 그대로). 슬롯 10과 축 방향 대칭.
    id: "m1u3e014",
    lessonId: "m1u3l1",
    type: "num",
    prompt: "점 " + withVars("V(−3, b)") + "가 <b>x축 위</b>의 점일 때, " + withVars("b") + "의 값을 구하세요.",
    answer: "0",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>x축 위의 점은 세로로 움직인 거리가 없어요. 그래서 <i class='mv'>y</i>좌표가 반드시 0이고, V의 <i class='mv'>y</i>좌표 자리인 <i class='mv'>b</i>=<b>0</b>이에요. 이때 V(−3, 0)은 x축에서 왼쪽으로 3칸 간 지점이 되죠.<span class='xh'>계산 함정 격파</span>x축이라는 이름에 이끌려 <i class='mv'>x</i>좌표 −3을 0으로 바꾸려 하면 문제 자체가 성립하지 않아요. 축 위의 점에서 0이 되는 것은 축 이름과 같은 쪽이 아니라 반대쪽 좌표예요. x축 위의 점은 (a, 0) 꼴, y축 위의 점은 (0, b) 꼴이라는 두 표준형을 외워 두면, 문자가 어느 자리에 있든 바로 등식을 세울 수 있어요.",
    core: "x축 위의 점은 (a, 0) 꼴, y좌표가 0이에요.",
  },
  {
    // [슬롯 15] 검산: 2a+1=7 → a=3, b−2=−5 → b=−3 → a+b=0 ✓. 오답 = a−b=6·b−a=−6·
    //  ab=−9·a=3(부품 착각). 수치 보기 셔플 기본.
    id: "m1u3e015",
    lessonId: "m1u3l1",
    type: "mcq",
    prompt: "두 순서쌍 " + withVars("(2a+1, b−2)") + "와 " + withVars("(7, −5)") + "가 서로 같을 때, " + withVars("a+b") + "의 값은?",
    options: ["0", "6", "−6", "−9", "3"],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>같은 자리끼리 등식을 세워요. 첫째 자리에서 2<i class='mv'>a</i>+1=7이므로 <i class='mv'>a</i>=3이고, 둘째 자리에서 <i class='mv'>b</i>−2=−5이므로 <i class='mv'>b</i>=−3이에요. 따라서 <i class='mv'>a</i>+<i class='mv'>b</i>=3+(−3)=<b>0</b>이에요.<span class='xh'>오답 하나씩 격파</span>'6'은 <i class='mv'>a</i>−<i class='mv'>b</i>를, '−6'은 <i class='mv'>b</i>−<i class='mv'>a</i>를 계산한 값이라 묻는 묶음을 잘못 본 거예요. '−9'는 두 값을 곱한 <i class='mv'>ab</i>이고, '3'은 <i class='mv'>a</i>만 구하고 멈춘 답이죠. <i class='mv'>b</i>−2=−5에서 −5+2를 −7로 계산하는 부호 실수도 잦으니, 음수 계산은 수직선을 떠올리며 한 번 더 확인해요. 두 문자를 각각 구한 뒤 마지막에 묻는 식을 다시 읽는 습관이 안전해요.",
    core: "a와 b를 각각 확정하고 마지막에 a+b를 계산해요.",
  },
  {
    // [슬롯 16] 검산: x좌표가 0인 점들의 모임 = y축 ✓. 사분면 어휘는 L2 선행이라 보기에서
    //  배제(진도 오염 방지 · §3). 문장 짧은 보기 셔플 기본.
    id: "m1u3e016",
    lessonId: "m1u3l1",
    type: "mcq",
    prompt: "<b>x좌표가 0</b>인 점들이 놓이는 곳은?",
    options: ["y축 위", "x축 위", "원점 한 곳뿐", "y축의 오른쪽", "x축의 위쪽"],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>좌표가 0이라는 것은 가로로 움직이지 않았다는 뜻이에요. 세로로는 어디든 갈 수 있으니 그런 점들은 (0, 1), (0, −3)처럼 전부 <b>y축 위</b>에 늘어서요. y축 자체가 x좌표 0인 점들의 모임인 셈이죠.<span class='xh'>오답 하나씩 격파</span>'x축 위'는 반대로 <i class='mv'>y</i>좌표가 0인 점들의 모임이라 이름에 속기 쉬운 함정이에요. '원점 한 곳뿐'은 (0, 0) 하나만 떠올린 답인데, x좌표가 0인 점은 y축을 따라 무수히 많아요. 'y축의 오른쪽'과 'x축의 위쪽'은 특정 구역을 가리키는 말이라 축 위라는 조건과 아예 달라요. 조건 하나로 점이 모이는 자리를 그려 보는 연습이 이런 문제의 지름길이에요.",
    core: "x좌표 0인 점을 다 모으면 y축이 돼요.",
  },
  {
    // [슬롯 17] 검산: 첫째 자리 −4는 일치, 둘째 자리 3c−2=13 → 3c=15 → c=5 ✓.
    id: "m1u3e017",
    lessonId: "m1u3l1",
    type: "num",
    prompt: "두 순서쌍 " + withVars("(−4, 3c−2)") + "와 " + withVars("(−4, 13)") + "이 서로 같을 때, " + withVars("c") + "의 값을 구하세요.",
    answer: "5",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>첫째 자리는 둘 다 −4로 이미 같아요. 남은 둘째 자리끼리 비교하면 3<i class='mv'>c</i>−2=13이에요. 양변에 2를 더하면 3<i class='mv'>c</i>=15이고, 3으로 나누면 <i class='mv'>c</i>=<b>5</b>예요. 검산으로 3×5−2=13이 둘째 자리와 정확히 맞아요.<span class='xh'>계산 함정 격파</span>이미 같은 첫째 자리 −4를 굳이 문자 식과 비교해 3<i class='mv'>c</i>−2=−4로 세우면 <i class='mv'>c</i>=−2/3처럼 이상한 값이 나와요. 문자가 들어 있는 자리가 어디인지 먼저 확인하고 그 자리끼리만 등식을 세워요. 또 −2를 이항하며 3<i class='mv'>c</i>=11로 쓰는 부호 실수를 하면 정수 답이 안 나오는데, 이 단원의 답이 이상한 분수가 되면 계산을 되짚어 보라는 신호로 받아들이면 좋아요.",
    core: "문자가 든 자리를 찾아 그 자리끼리 비교해요.",
  },
  {
    // [슬롯 18] 검산: ㄱ 참(순서 다르면 다른 순서쌍) · ㄴ 참(P(a, b)에서 a가 x좌표) ·
    //  ㅁ 참(y축 위 x좌표 0) · ㄷ 거짓(원점 (0, 0)) · ㄹ 거짓(x좌표 3인 점은 무수히 많음).
    //  answer [0, 1, 4].
    id: "m1u3e018",
    lessonId: "m1u3l1",
    type: "multi",
    prompt: "순서쌍과 좌표에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    options: [
      "(2, 4)와 (4, 2)는 서로 다른 순서쌍이에요",
      "점 P(a, b)에서 a는 x좌표예요",
      "원점의 좌표는 (1, 1)이에요",
      "x좌표가 3인 점은 (3, 0) 하나뿐이에요",
      "y축 위의 점은 x좌표가 0이에요",
    ],
    answer: [0, 1, 4],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>순서쌍은 순서가 생명이라 (2, 4)와 (4, 2)는 다른 순서쌍이 맞아요. 점의 좌표 표기 P(<i class='mv'>a</i>, <i class='mv'>b</i>)에서는 앞의 <i class='mv'>a</i>가 x좌표, 뒤의 <i class='mv'>b</i>가 y좌표이고, y축 위의 점은 가로 이동이 없어 x좌표가 0이라는 설명도 참이에요.<span class='xh'>틀린 설명 격파</span>원점은 두 축이 만나는 자리라 좌표가 (0, 0)이지 (1, 1)이 아니에요. 또 x좌표가 3인 점은 (3, 0)뿐 아니라 (3, 1), (3, −2)처럼 세로 위치만 다른 점이 무수히 많아요. 그런 점들을 다 모으면 x축에 수직인 한 줄이 되죠. '하나뿐'이라는 단정이 보이면 반례를 하나 떠올려 보는 습관이 판별 문제의 무기예요.",
    core: "순서가 곧 정보, 원점은 (0, 0)이에요.",
  },
  {
    // [슬롯 19] 검산: 실좌표 A(−3)·B(1/2)·C(2)·D(−1/2)·E(3). 보기 D(1/2)만 부호가 틀림
    //  (실제 −1/2) = 정답. B(1/2)와 보기 값이 같아 혼동 유도(B는 참). subdiv lo −1~hi 1
    //  2등분 잔눈금으로 B·D 위치 정의. 기호 보기 고정 · 정답 네 번째(① 금지 ✓).
    id: "m1u3e019",
    lessonId: "m1u3l1",
    type: "mcq",
    prompt: "수직선 위의 점의 좌표를 <b>잘못</b> 나타낸 것은?",
    figure: mExamNumLineFig({
      min: -3,
      max: 3,
      points: [
        { label: "A", value: -3 },
        { label: "B", value: 0.5 },
        { label: "C", value: 2 },
        { label: "D", value: -0.5 },
        { label: "E", value: 3 },
      ],
      subdiv: { lo: -1, hi: 1, den: 2 },
    }),
    options: ["A(−3)", "B(1/2)", "C(2)", "D(1/2)", "E(3)"],
    answer: 3,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>점 D는 −1과 0 사이를 둘로 나눈 잔눈금 위, 즉 0에서 왼쪽으로 반 칸 간 자리에 있어요. 그러므로 D의 좌표는 −1/2인데 보기에는 <b>D(1/2)</b>라고 부호 없이 적혀 있으니 이것이 잘못된 표기예요.<span class='xh'>오답 하나씩 격파</span>B는 0과 1 사이의 잔눈금 위라 1/2이 맞고, 보기 값이 D와 똑같이 1/2이라 더 헷갈리게 만든 장치예요. 같은 거리라도 원점의 왼쪽이면 음수, 오른쪽이면 양수라는 부호 구분이 두 점의 운명을 가르죠. A(−3), C(2), E(3)은 전부 정수 눈금 위의 정확한 표기예요. 수직선에서 분수 점을 읽을 때는 '어느 두 정수 사이인가'와 '원점의 어느 쪽인가'를 함께 확인해요.",
    core: "같은 반 칸이라도 원점 왼쪽이면 −1/2이에요.",
  },
  {
    // [슬롯 20] 검산: 오른쪽 2칸 → a+2=5 → a=3, 위로 k칸 → 1+k=7 → k=6 → a+k=9 ✓.
    id: "m1u3e020",
    lessonId: "m1u3l1",
    type: "num",
    prompt:
      "점 " + withVars("P(a, 1)") + "을 오른쪽으로 2칸, 위로 " + withVars("k") + "칸 이동했더니 점 " + withVars("(5, 7)") + "이 되었어요. " + withVars("a+k") + "의 값을 구하세요.",
    answer: "9",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>이동을 좌표 계산으로 번역해요. 오른쪽으로 2칸이면 <i class='mv'>x</i>좌표가 2 커지므로 <i class='mv'>a</i>+2=5에서 <i class='mv'>a</i>=3이에요. 위로 <i class='mv'>k</i>칸이면 <i class='mv'>y</i>좌표가 <i class='mv'>k</i> 커지므로 1+<i class='mv'>k</i>=7에서 <i class='mv'>k</i>=6이죠. 따라서 <i class='mv'>a</i>+<i class='mv'>k</i>=3+6=<b>9</b>예요.<span class='xh'>계산 함정 격파</span>이동 방향을 거꾸로 번역해 <i class='mv'>a</i>−2=5로 세우면 <i class='mv'>a</i>=7이 되어 어긋나요. 도착점에서 출발점을 빼면 이동량이 나온다는 관계(5−3=2, 7−1=6)로 검산하면 방향 실수를 바로 잡을 수 있어요. 또 <i class='mv'>a</i>와 <i class='mv'>k</i>를 구해 놓고 곱하거나 빼는 실수가 없도록, 마지막에 묻는 묶음이 합이라는 것을 다시 확인해요.",
    core: "이동은 좌표의 덧셈, 도착−출발로 검산해요.",
  },
  {
    // [슬롯 21] 검산: A(−3, 3)·B(−3, −1)·C(2, −1)에서 AB는 세로 변(x=−3), BC는 가로 변
    //  (y=−1). 직사각형이 되려면 D는 A와 같은 x는 아니고 · D = A+C−B = (−3+2−(−3), 3+(−1)−(−1))
    //  = (2, 3) ✓ (C 위 · A 오른쪽). 좌표쌍 보기 셔플 기본.
    id: "m1u3e021",
    lessonId: "m1u3l1",
    type: "mcq",
    prompt: "그림의 세 점 A, B, C와 함께 <b>직사각형 ABCD</b>를 만들 때, 점 <b>D</b>의 좌표는?",
    figure: mExamPlaneFig(PLANE_S21),
    options: [coord(2, 3), coord(3, 2), coord(2, -3), coord(-2, 3), coord(3, 3)],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>세 점을 읽으면 A(−3, 3), B(−3, −1), C(2, −1)이에요. 변 AB는 x좌표가 −3으로 같은 세로 변이고, 변 BC는 y좌표가 −1로 같은 가로 변이에요. 직사각형이 되려면 D는 C에서 곧게 올라가고 A에서 곧게 오른쪽으로 간 자리, 즉 C의 x좌표 2와 A의 y좌표 3을 가진 <b>(2, 3)</b>이어야 해요.<span class='xh'>오답 하나씩 격파</span>'(3, 2)'는 정답의 두 수를 뒤집은 것이고, '(2, −3)'은 y좌표의 부호를 놓친 자리예요. '(−2, 3)'은 x좌표 부호가 반대이고, '(3, 3)'은 C의 x좌표를 잘못 읽은 답이죠. 네 꼭짓점의 x좌표가 두 값(−3, 2)씩, y좌표도 두 값(3, −1)씩 짝을 이룬다는 직사각형의 성질로 검산하면 확실해요.",
    core: "마주 보는 꼭짓점끼리 x, y 값을 나눠 가져요.",
  },
  {
    // [슬롯 22] 검산: D(−3, 6)의 y좌표 = 6 ✓ (제2사분면 점 · 양수). 슬롯 2(−5)와 부호 분산.
    id: "m1u3e022",
    lessonId: "m1u3l1",
    type: "num",
    prompt: "그림에서 점 <b>D</b>의 <b>y좌표</b>를 구하세요.",
    figure: mExamPlaneFig(PLANE_S22),
    answer: "6",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>점 D에서 가로로 점선을 그어 <i class='mv'>y</i>축과 만나는 눈금을 읽으면 6이에요. 세로 방향의 위치를 나타내는 수가 <i class='mv'>y</i>좌표이므로 답은 <b>6</b>이에요. D는 왼쪽 위 구역에 있어서 x좌표는 음수(−3)이지만 y좌표는 양수인 점이죠.<span class='xh'>계산 함정 격파</span>가로 위치 −3을 답하면 x좌표를 읽은 거예요. 좌표를 이야기할 때는 언제나 (가로, 세로) 순서이고, 묻는 것이 그중 어느 쪽인지 문제를 다시 확인해요. 또 D가 왼쪽에 있다는 인상 때문에 y좌표까지 음수로 착각하기 쉬운데, 부호는 방향마다 따로 정해져요. 가로가 음수여도 세로는 위쪽이면 양수랍니다.",
    core: "y좌표는 세로 방향, 위쪽이면 양수예요.",
  },
];
