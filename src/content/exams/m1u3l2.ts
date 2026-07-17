// 중1 수학 Ⅲ. 좌표평면과 그래프: 단원 종합 평가 풀, 레슨 2 사분면 (m1u3e023~m1u3e044). 2026-07 개보수: 장비 맥락(레이더·드론·비콘·관측소) 전량 무맥락화, e041 ab 곱 부호형 신작.
// 유형 14(mcq+multi)/6(num)/2(word), diff 9/9/4. 좌표평면은 MExamPlaneSpec 한 곳을 그림 데이터의 정본으로 사용한다.
import type { ExamItem } from "./types";
import { mExamPlaneFig, type MExamPlaneSpec } from "../../ui/examFiguresMath";

const L = "m1u3l2";
const quadrantOf = (x: number, y: number): 0 | 1 | 2 | 3 | 4 => {
  if (x === 0 || y === 0) return 0;
  if (x > 0 && y > 0) return 1;
  if (x < 0 && y > 0) return 2;
  if (x < 0 && y < 0) return 3;
  return 4;
};
const pointInQuadrant = (spec: MExamPlaneSpec, quadrant: 1 | 2 | 3 | 4) => {
  const point = spec.points.find((candidate) => quadrantOf(candidate.x, candidate.y) === quadrant);
  if (!point) throw new Error(`m1u3l2 quadrant point missing: ${quadrant}`);
  return point;
};
const pointOnAxis = (spec: MExamPlaneSpec, axis: "x" | "y") => {
  const point = spec.points.find((candidate) => (axis === "x" ? candidate.y === 0 : candidate.x === 0));
  if (!point) throw new Error(`m1u3l2 axis point missing: ${axis}`);
  return point;
};
const pointAt = (spec: MExamPlaneSpec, x: number, y: number) => {
  const point = spec.points.find((candidate) => candidate.x === x && candidate.y === y);
  if (!point) throw new Error(`m1u3l2 point missing: (${x}, ${y})`);
  return point;
};

const PLANE_023: MExamPlaneSpec = {
  min: -9,
  max: 9,
  labelEvery: 3,
  points: [
    { label: "A", x: -8, y: 4, color: "#E8547E" },
    { label: "B", x: 6, y: 5, color: "#2F9E44" },
    { label: "C", x: -8, y: -3, color: "#364FC7", labelDy: 18 },
    { label: "D", x: 4, y: -8, color: "#F08C2E" },
  ],
};

const PLANE_027: MExamPlaneSpec = {
  min: -9,
  max: 9,
  labelEvery: 3,
  points: [
    { label: "V", x: 0, y: 8, color: "#2F9E44", labelDx: 18 },
    { label: "W", x: -9, y: 0, color: "#E8547E", labelDx: 22, labelDy: -10 },
    { label: "X", x: 7, y: -5, color: "#364FC7" },
  ],
};

const PLANE_032: MExamPlaneSpec = {
  min: -9,
  max: 9,
  labelEvery: 3,
  points: [
    { label: "A", x: 8, y: 3, color: "#364FC7" },
    { label: "B", x: -5, y: 7, color: "#2F9E44" },
    { label: "C", x: -7, y: -6, color: "#E8547E", labelDy: 18 },
    { label: "D", x: 3, y: -9, color: "#F08C2E" },
  ],
};

const PLANE_037: MExamPlaneSpec = {
  min: -9,
  max: 9,
  labelEvery: 3,
  points: [
    { label: "E", x: -9, y: 5, color: "#E8547E", labelDx: 20 },
    { label: "F", x: 8, y: -4, color: "#364FC7" },
    { label: "G", x: 5, y: 8, color: "#2F9E44" },
    { label: "H", x: -6, y: -7, color: "#F08C2E", labelDy: 18 },
  ],
};

const PLANE_043: MExamPlaneSpec = {
  min: -9,
  max: 9,
  labelEvery: 3,
  points: [
    { label: "P", x: -8, y: 6, color: "#E8547E" },
    { label: "Q", x: 6, y: 8, color: "#2F9E44" },
    { label: "R", x: 8, y: -6, color: "#364FC7" },
    { label: "S", x: -6, y: -8, color: "#F08C2E", labelDy: 18 },
  ],
};

export const POOL_M1U3L2: ExamItem[] = [
  {
    id: "m1u3e023",
    lessonId: L,
    type: "mcq",
    prompt: "그림의 네 점 중 <b>제2사분면</b> 위에 있는 점은?",
    figure: mExamPlaneFig(PLANE_023),
    options: [
      `점 ${pointInQuadrant(PLANE_023, 2).label}`,
      `점 ${pointInQuadrant(PLANE_023, 4).label}`,
      `점 ${pointInQuadrant(PLANE_023, 1).label}`,
      "좌표축 위의 점",
      `점 ${pointInQuadrant(PLANE_023, 3).label}`,
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>제2사분면은 <i class='mv'>x</i>좌표가 음수이고 <i class='mv'>y</i>좌표가 양수인 왼쪽 위 구역이에요. 그림에서 왼쪽 위에 놓인 것은 <b>점 A</b>이므로 정답이에요.<span class='xh'>오답 하나씩 격파</span>'점 D'는 오른쪽 아래라 제4사분면, '점 B'는 오른쪽 위라 제1사분면이에요. '좌표축 위의 점'은 그림에 없을 뿐 아니라 축 위의 점은 어느 사분면에도 속하지 않아요. '점 C'는 왼쪽 아래라 제3사분면이에요. 점 이름보다 먼저 오른쪽과 왼쪽으로 <i class='mv'>x</i>의 부호를, 위와 아래로 <i class='mv'>y</i>의 부호를 정하면 안전해요.",
    core: "제2사분면은 왼쪽 위, 부호는 (−, +)예요.",
  },
  {
    id: "m1u3e024",
    lessonId: L,
    type: "num",
    prompt: "점 <b>(7, −8)</b>이 속한 사분면의 번호를 쓰세요.",
    answer: "4",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>첫째 수 7은 양수이므로 원점의 오른쪽, 둘째 수 −8은 음수이므로 원점의 아래쪽이에요. 오른쪽 아래 구역은 <b>제4사분면</b>이므로 번호 4를 써요.<span class='xh'>헷갈림 격파</span>두 수의 크기 7과 8을 비교해서 사분면을 정하는 것이 아니에요. 제1사분면은 두 좌표가 모두 양수일 때이고, 제2사분면은 <i class='mv'>x</i>만 음수, 제3사분면은 둘 다 음수일 때예요. 여기서는 (+, −)이므로 제4사분면이에요. 좌표에 0도 없어서 축 위의 점일 가능성도 없어요. 입력에는 사분면 이름 전체가 아니라 숫자 4만 쓰면 돼요.",
    core: "(+, −)인 오른쪽 아래 점은 제4사분면에 속해요.",
  },
  {
    id: "m1u3e025",
    lessonId: L,
    type: "mcq",
    prompt: "제3사분면 위의 점의 좌표 부호를 옳게 나타낸 것은?",
    options: ["(+, +)", "(−, +)", "(+, −)", "(0, −)", "(−, −)"],
    answer: 4,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>제3사분면은 원점의 왼쪽 아래 구역이에요. 왼쪽은 <i class='mv'>x</i>좌표가 음수이고 아래쪽은 <i class='mv'>y</i>좌표가 음수이므로 부호는 <b>(−, −)</b>예요.<span class='xh'>오답 하나씩 격파</span>'(+, +)'는 제1사분면, '(−, +)'는 제2사분면, '(+, −)'는 제4사분면을 나타내요. '(0, −)'는 첫째 성분이 0이므로 제3사분면 안쪽이 아니라 <i class='mv'>y</i>축 아래쪽의 점이에요. 사분면 번호를 외울 때는 제1사분면의 (+, +)에서 반시계 방향으로 돌며 부호가 바뀌는 모습을 떠올리면 돼요. 제3사분면은 두 방향이 모두 음수예요.",
    core: "제3사분면은 왼쪽 아래라 두 좌표가 모두 음수예요.",
  },
  {
    id: "m1u3e026",
    lessonId: L,
    type: "word",
    prompt: "제1사분면에서 시작하여 제2, 제3, 제4사분면으로 번호가 이어지는 회전 방향을 고르세요.",
    answer: "반시계 방향",
    bank: ["반시계 방향", "시계 방향", "오른쪽 방향", "왼쪽 방향", "위쪽 방향", "아래쪽 방향", "가로 방향", "세로 방향", "원점 방향"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>사분면은 오른쪽 위인 제1사분면에서 시작해 <b>반시계 방향</b>으로 제2, 제3, 제4사분면의 번호가 이어져요. 따라서 위쪽을 지나 왼쪽, 아래쪽, 오른쪽 아래로 돌아가는 순서예요.<span class='xh'>낱말 하나씩 격파</span>'시계 방향'으로 돌면 제1사분면 다음에 제4사분면이 먼저 나와요. '오른쪽 방향', '왼쪽 방향', '위쪽 방향', '아래쪽 방향'은 한쪽 이동만 나타내서 네 구역을 도는 방향이 아니에요. '가로 방향'과 '세로 방향'도 좌표축의 놓인 방향을 설명할 뿐 회전 순서를 말하지 않아요. '원점 방향'은 가운데로 향한다는 뜻이라 사분면 번호의 약속과 관계없어요.",
    core: "사분면 번호는 제1사분면에서 반시계 방향으로 커져요.",
  },
  {
    id: "m1u3e027",
    lessonId: L,
    type: "mcq",
    prompt: "그림의 세 점 중 <b><i class='mv'>x</i>축 위</b>에 있어 어느 사분면에도 속하지 않는 점은?",
    figure: mExamPlaneFig(PLANE_027),
    options: [
      `점 ${PLANE_027.points.find((point) => point.x !== 0 && point.y !== 0)!.label}`,
      `점 ${pointOnAxis(PLANE_027, "y").label}와 점 ${PLANE_027.points.find((point) => point.x !== 0 && point.y !== 0)!.label}`,
      `점 ${pointOnAxis(PLANE_027, "y").label}`,
      "세 점 모두",
      `점 ${pointOnAxis(PLANE_027, "x").label}`,
    ],
    answer: 4,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>축은 가로축이고, 그 위의 점은 <i class='mv'>y</i>좌표가 0이에요. 그림에서 가로축 위에 놓인 점은 <b>점 W</b>예요. 좌표축은 사분면을 나누는 경계이므로 W는 어느 사분면에도 속하지 않아요.<span class='xh'>오답 하나씩 격파</span>'점 X'는 오른쪽 아래의 제4사분면 안쪽에 있어요. '점 V와 점 X'는 축 위 점과 사분면 안쪽 점을 함께 묶었고, '점 V'는 세로축인 <i class='mv'>y</i>축 위에 있어요. '세 점 모두'도 X가 사분면 안쪽이므로 틀려요. 축 위라는 말과 축 가까이라는 말을 구별하고, 점이 선에 정확히 놓였는지 확인해요.",
    core: "x축 위의 점은 y좌표가 0이며 어느 사분면에도 속하지 않아요.",
  },
  {
    id: "m1u3e028",
    lessonId: L,
    type: "num",
    prompt: "점 P(−6, 9)의 <i class='mv'>x</i>좌표 부호만 바꾼 점이 속한 사분면의 번호를 쓰세요.",
    answer: "1",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>P의 부호는 (−, +)예요. 여기서 <i class='mv'>x</i>좌표의 음수 부호만 양수로 바꾸면 (+, +)가 돼요. 두 좌표가 모두 양수인 오른쪽 위 구역은 <b>제1사분면</b>이므로 1을 써요.<span class='xh'>헷갈림 격파</span><i class='mv'>y</i>좌표 9의 부호는 바꾸지 않아요. 두 좌표의 부호를 모두 바꾸면 (+, −)가 되어 제4사분면이므로 다른 결과가 나와요. 두 수의 순서를 바꾸는 문제도 아니어서 (9, −6)으로 만들면 안 돼요. '한 좌표의 부호만'이라는 조건에 밑줄을 긋고, 바뀐 부호쌍을 먼저 쓴 뒤 사분면 번호로 옮겨요.",
    core: "(−, +)에서 x의 부호만 바꾸면 (+, +), 제1사분면이에요.",
  },
  {
    id: "m1u3e029",
    lessonId: L,
    type: "mcq",
    prompt: "제1사분면부터 제4사분면까지 <i class='mv'>x</i>좌표와 <i class='mv'>y</i>좌표의 부호를 차례로 나타낸 것은?",
    options: [
      "(+, +) → (+, −) → (−, −) → (−, +)",
      "(+, +) → (−, +) → (−, −) → (+, −)",
      "(−, +) → (+, +) → (+, −) → (−, −)",
      "(+, −) → (−, −) → (−, +) → (+, +)",
      "(+, +) → (−, −) → (−, +) → (+, −)",
    ],
    answer: 1,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>제1사분면은 오른쪽 위라 (+, +), 제2사분면은 왼쪽 위라 (−, +), 제3사분면은 왼쪽 아래라 (−, −), 제4사분면은 오른쪽 아래라 (+, −)예요. 따라서 <b>(+, +) → (−, +) → (−, −) → (+, −)</b>가 옳아요.<span class='xh'>오답 하나씩 격파</span>첫 번째는 제2와 제4의 부호를 뒤바꾸었어요. 세 번째와 네 번째는 제1사분면의 부호부터 맞지 않아요. 마지막은 제2사분면을 (−, −)로 적어 제3사분면과 섞었어요. 사분면 번호만 외우기보다 각 구역에서 오른쪽·왼쪽이 <i class='mv'>x</i>의 부호, 위·아래가 <i class='mv'>y</i>의 부호를 정한다는 원리로 확인해요.",
    core: "제1~제4사분면의 부호는 (+,+), (−,+), (−,−), (+,−)예요.",
  },
  {
    id: "m1u3e030",
    lessonId: L,
    type: "mcq",
    prompt: "제2사분면의 점에서 두 좌표의 부호를 모두 바꾸면 새 점은 어느 사분면에 속하나요?",
    options: ["제1사분면", "제3사분면", "어느 사분면에도 속하지 않는다", "제4사분면", "제2사분면"],
    answer: 3,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>제2사분면 점의 부호는 (−, +)예요. 두 좌표의 부호를 모두 바꾸면 음수는 양수로, 양수는 음수로 바뀌어 <b>(+, −)</b>가 돼요. 이 부호는 오른쪽 아래인 <b>제4사분면</b>이에요.<span class='xh'>오답 하나씩 격파</span>'제1사분면'은 둘 다 양수일 때이고, '어느 사분면에도 속하지 않는다'는 0이 생길 때 가능한데 부호 변경만으로 0이 되지 않아요. '제3사분면'은 둘 다 음수, '제2사분면'은 부호를 바꾸지 않은 원래 구역이에요. 두 부호를 바꾸면 원점을 사이에 둔 맞은편 사분면으로 이동해요.",
    core: "제2사분면의 두 부호를 바꾸면 제4사분면으로 이동해요.",
  },
  {
    id: "m1u3e031",
    lessonId: L,
    type: "multi",
    prompt: "좌표축과 사분면에 대한 설명으로 <b>옳은 것을 모두</b> 고르세요.",
    options: [
      "원점은 제1사분면에 속한다",
      "제4사분면 점의 x좌표는 양수이다",
      "x축 위의 점은 제1사분면과 제4사분면에 함께 속한다",
      "제2사분면 점의 y좌표는 양수이다",
      "y축 위의 점은 제2사분면이나 제3사분면에 속한다",
    ],
    answer: [1, 3],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>제4사분면은 (+, −)이므로 <i class='mv'>x</i>좌표가 양수이고, 제2사분면은 (−, +)이므로 <i class='mv'>y</i>좌표가 양수예요. 따라서 이 두 설명이 옳아요.<span class='xh'>선지 격파</span>원점은 두 좌표축의 교점이라 어느 사분면에도 속하지 않아요. <i class='mv'>x</i>축 위의 점도 사분면의 경계 위에 있으므로 제1사분면과 제4사분면에 함께 속하지 않아요. <i class='mv'>y</i>축 위의 점 역시 제2사분면이나 제3사분면의 안쪽이 아니라 경계예요. 축 위 점을 양옆 사분면에 포함시키지 않는 것이 핵심이에요. 좌표에 0이 보이면 먼저 축 위인지 확인해요.",
    core: "사분면 안쪽과 좌표축 경계를 구별하고 부호 규칙을 적용해요.",
  },
  {
    id: "m1u3e032",
    lessonId: L,
    type: "mcq",
    prompt: "그림의 네 점 중 <b><i class='mv'>x</i>좌표는 양수, <i class='mv'>y</i>좌표는 음수</b>인 점은?",
    figure: mExamPlaneFig(PLANE_032),
    options: [
      `점 ${pointInQuadrant(PLANE_032, 4).label}`,
      `점 ${pointInQuadrant(PLANE_032, 3).label}`,
      `점 ${pointInQuadrant(PLANE_032, 2).label}`,
      "좌표축 위의 점",
      `점 ${pointInQuadrant(PLANE_032, 1).label}`,
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>좌표가 양수이면 원점 오른쪽, <i class='mv'>y</i>좌표가 음수이면 원점 아래쪽이에요. 그림에서 오른쪽 아래에 놓인 <b>점 D</b>가 조건을 만족해요.<span class='xh'>오답 하나씩 격파</span>'점 C'는 왼쪽 아래라 두 좌표가 모두 음수예요. '점 B'는 왼쪽 위라 (−, +), '점 A'는 오른쪽 위라 (+, +)예요. '좌표축 위의 점'은 그림에 없고, 축 위 점에는 한 좌표가 0이므로 양수와 음수라는 조건을 동시에 만족할 수 없어요. 부호를 먼저 방향으로 번역한 뒤 해당 구역의 점을 찾아요.",
    core: "x가 양수이고 y가 음수인 점은 오른쪽 아래에 있어요.",
  },
  {
    id: "m1u3e033",
    lessonId: L,
    type: "num",
    prompt: "점 Q(0, −9)가 속한 사분면의 번호를 쓰세요. 어느 사분면에도 속하지 않으면 <b>0</b>을 쓰세요.",
    answer: "0",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>Q의 첫째 수가 0이므로 Q는 세로축인 <i class='mv'>y</i>축 위에 있어요. 좌표축은 네 사분면을 나누는 경계이고 어느 사분면의 안쪽에도 포함되지 않으므로 답은 <b>0</b>이에요.<span class='xh'>헷갈림 격파</span>둘째 수가 음수라는 이유만으로 제3사분면이나 제4사분면을 고르면 안 돼요. 사분면 안쪽에 있으려면 두 좌표가 모두 0이 아니어야 해요. 첫째 수 0은 왼쪽도 오른쪽도 아니라는 뜻이고, Q는 아래쪽 <i class='mv'>y</i>축 위에 놓여요. 문제에서 '없으면 0'이라고 정했으므로 실제 사분면 번호 1부터 4가 아니라 0을 입력해요.",
    core: "좌표에 0이 있으면 축 위이므로 사분면 번호가 없어요.",
  },
  {
    id: "m1u3e034",
    lessonId: L,
    type: "mcq",
    prompt: "점 A가 제4사분면에 있을 때, A의 두 좌표의 순서를 바꾸어 만든 점 B는 어느 사분면에 있나요?",
    options: ["제4사분면", "제1사분면", "제2사분면", "어느 사분면에도 속하지 않는다", "제3사분면"],
    answer: 2,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>제4사분면의 점 A는 부호가 (+, −)예요. 두 좌표의 순서를 바꾸면 음수인 둘째 좌표가 새 <i class='mv'>x</i>좌표가 되고, 양수인 첫째 좌표가 새 <i class='mv'>y</i>좌표가 되어 (−, +)예요. 따라서 B는 <b>제2사분면</b>에 있어요.<span class='xh'>오답 하나씩 격파</span>'제4사분면'은 순서를 바꾸지 않은 결과이고, '제1사분면'은 부호를 모두 양수로 만든 경우예요. '어느 사분면에도 속하지 않는다'는 0이 있을 때인데 원래 A가 사분면 안쪽이므로 두 좌표 모두 0이 아니에요. '제3사분면'은 두 좌표가 모두 음수여야 해요. 순서 교환과 부호 변경을 구별해요.",
    core: "(+, −)의 순서를 바꾸면 (−, +)가 되어 제2사분면이에요.",
  },
  {
    id: "m1u3e035",
    lessonId: L,
    type: "word",
    prompt: "좌표축 위의 점과 원점이 사분면에 속하는지를 나타낸 말로 알맞은 것을 고르세요.",
    answer: "어느 사분면에도 속하지 않음",
    bank: [
      "어느 사분면에도 속하지 않음",
      "제1사분면에만 속함",
      "제2사분면에만 속함",
      "제3사분면에만 속함",
      "제4사분면에만 속함",
      "두 사분면에 함께 속함",
      "네 사분면에 모두 속함",
      "좌표에 따라 항상 달라짐",
    ],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>사분면은 두 좌표축이 나눈 네 구역의 안쪽을 뜻해요. 좌표축 위의 점과 두 축이 만나는 원점은 경계 위에 있으므로 <b>어느 사분면에도 속하지 않음</b>이 알맞아요.<span class='xh'>낱말 하나씩 격파</span>제1, 제2, 제3, 제4사분면 중 한 곳에만 속한다는 네 선택은 모두 축 위 점을 사분면 안쪽으로 잘못 포함한 말이에요. '두 사분면에 함께 속함'은 축 양쪽 구역을 동시에 포함한다고 착각한 표현이고, '네 사분면에 모두 속함'은 원점을 네 구역의 공통점으로 오해한 표현이에요. 좌표값이 달라도 축 위라는 조건이 같으면 언제나 무소속이므로 '항상 달라짐'도 틀려요.",
    core: "좌표축 위의 점과 원점은 모든 사분면의 경계라 무소속이에요.",
  },
  {
    id: "m1u3e036",
    lessonId: L,
    type: "num",
    prompt: "점 P(<i class='mv'>a</i>, <i class='mv'>b</i>)가 제3사분면에 있어요. 점 Q(−<i class='mv'>a</i>, <i class='mv'>b</i>)가 속한 사분면의 번호를 쓰세요.",
    answer: "4",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>P가 제3사분면에 있으므로 <i class='mv'>a</i>&lt;0, <i class='mv'>b</i>&lt;0이에요. Q의 첫째 좌표 −<i class='mv'>a</i>는 음수 <i class='mv'>a</i>의 반대이므로 양수이고, 둘째 좌표 <i class='mv'>b</i>는 그대로 음수예요. Q의 부호는 (+, −)이므로 <b>제4사분면</b>, 답은 4예요.<span class='xh'>헷갈림 격파</span>−<i class='mv'>a</i>를 언제나 음수라고 생각하면 안 돼요. 문자 앞의 음수 부호는 원래 값의 부호를 반대로 만들어요. <i class='mv'>b</i>의 부호는 바뀌지 않으며, 두 좌표 모두 0이 아니므로 축 위 점도 아니에요. 문자식은 먼저 원래 부호를 적고 하나씩 바꿔 판단해요. 마지막에는 (+, −)가 오른쪽 아래인지 다시 확인해요.",
    core: "<i class='mv'>a</i>&lt;0이면 −<i class='mv'>a</i>&gt;0이므로 Q는 (+, −), 제4사분면이에요.",
  },
  {
    id: "m1u3e037",
    lessonId: L,
    type: "mcq",
    prompt: "그림의 점 E의 <i class='mv'>x</i>좌표 부호만 바꾼 점을 새로 찍을 때, 새 점과 <b>같은 사분면</b>에 있는 점은?",
    figure: mExamPlaneFig(PLANE_037),
    options: [
      `점 ${pointInQuadrant(PLANE_037, 2).label}`,
      `점 ${pointInQuadrant(PLANE_037, 3).label}`,
      `점 ${pointInQuadrant(PLANE_037, 4).label}`,
      "좌표축 위의 점",
      `점 ${pointInQuadrant(PLANE_037, quadrantOf(-pointInQuadrant(PLANE_037, 2).x, pointInQuadrant(PLANE_037, 2).y) as 1).label}`,
    ],
    answer: 4,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>점 E는 왼쪽 위인 제2사분면에 있어 부호가 (−, +)예요. <i class='mv'>x</i>좌표 부호만 바꾸면 (+, +)가 되어 오른쪽 위인 제1사분면으로 이동해요. 그림에서 같은 제1사분면에 있는 것은 <b>점 G</b>예요.<span class='xh'>오답 하나씩 격파</span>'점 E'는 부호를 바꾸기 전 자리라 제2사분면이고, '점 H'는 왼쪽 아래인 제3사분면, '점 F'는 오른쪽 아래인 제4사분면에 있어요. '좌표축 위의 점'은 그림에 없고, 부호만 바꾼 좌표에는 0이 생기지 않아요. 좌표의 크기를 새로 계산하지 않아도 부호 변화만 추적하면 풀 수 있어요.",
    core: "제2사분면에서 x 부호만 바꾸면 제1사분면으로 이동해요.",
  },
  {
    id: "m1u3e038",
    lessonId: L,
    type: "multi",
    prompt: "점 P가 제1사분면에 있을 때, P의 좌표를 바꾸어 만든 점에 대한 설명으로 <b>옳은 것을 모두</b> 고르세요.",
    options: [
      "두 좌표의 부호를 모두 바꾸면 제3사분면이다",
      "x좌표의 부호만 바꾸면 제4사분면이다",
      "두 좌표의 순서만 바꾸면 제1사분면이다",
      "y좌표의 부호만 바꾸면 제2사분면이다",
      "한 좌표를 0으로 바꾸어도 제1사분면이다",
    ],
    answer: [0, 2],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>제1사분면의 부호는 (+, +)예요. 두 부호를 모두 바꾸면 (−, −)이므로 제3사분면이고, 두 양수 좌표의 순서만 바꾸면 여전히 (+, +)라 제1사분면이에요. 이 두 설명이 옳아요.<span class='xh'>선지 격파</span><i class='mv'>x</i>좌표 부호만 바꾸면 (−, +)인 제2사분면이지 제4사분면이 아니에요. <i class='mv'>y</i>좌표 부호만 바꾸면 (+, −)인 제4사분면이지 제2사분면이 아니고요. 한 좌표를 0으로 바꾸면 좌표축 위로 이동하여 어느 사분면에도 속하지 않아요. 부호 변경, 순서 교환, 0 만들기를 각각 구별해요.",
    core: "제1사분면의 (+, +)에 각 변화를 따로 적용해 판단해요.",
  },
  {
    id: "m1u3e039",
    lessonId: L,
    type: "mcq",
    prompt: "점 K(−7, −4)의 두 좌표의 부호를 모두 바꾼 점과 같은 사분면에 있는 점은?",
    options: ["점 L(−2, 8)", "점 M(9, 3)", "점 N(−5, −6)", "점 O(0, 7)", "점 R(4, −9)"],
    answer: 1,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>K는 두 좌표가 모두 음수인 제3사분면의 점이에요. 두 부호를 모두 바꾸면 두 좌표가 모두 양수가 되어 제1사분면으로 이동해요. 보기에서 <b>M(9, 3)</b>만 (+, +)이므로 같은 사분면에 있어요.<span class='xh'>오답 하나씩 격파</span>'L(−2, 8)'은 (−, +)인 제2사분면, 'N(−5, −6)'은 원래 K와 같은 제3사분면이에요. 'O(0, 7)'은 <i class='mv'>y</i>축 위라 어느 사분면에도 속하지 않고, 'R(4, −9)'는 (+, −)인 제4사분면이에요. 좌표의 크기보다 두 부호의 조합만 비교하면 빠르고 정확해요.",
    core: "두 음수 부호를 모두 바꾸면 (+, +), 제1사분면이에요.",
  },
  {
    id: "m1u3e040",
    lessonId: L,
    type: "num",
    prompt: "점 A가 제2사분면에 있어요. A의 <i class='mv'>y</i>좌표 부호만 바꾼 점이 속한 사분면의 번호를 쓰세요.",
    answer: "3",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>제2사분면 점의 부호는 (−, +)예요. <i class='mv'>y</i>좌표의 양수 부호만 음수로 바꾸면 <i class='mv'>x</i>좌표는 그대로 음수이고 새 부호쌍은 (−, −)가 돼요. 왼쪽 아래 구역은 <b>제3사분면</b>이므로 3을 써요.<span class='xh'>헷갈림 격파</span><i class='mv'>x</i>좌표까지 바꾸면 (+, −)인 제4사분면이 되어 조건과 달라요. 두 좌표의 순서를 바꾸는 것도 아니고, 부호 변경으로 0이 생기지도 않으므로 축 위의 점은 아니에요. 제2사분면에서 아래로 가로축을 건넌다고 생각하면 제3사분면으로 이동하는 모습도 확인할 수 있어요.",
    core: "제2사분면에서 y 부호만 바꾸면 제3사분면이에요.",
  },
  {
    id: "m1u3e041",
    lessonId: L,
    type: "mcq",
    prompt: "점 P(<i class='mv'>a</i>, <i class='mv'>b</i>)가 제4사분면 위의 점일 때, 점 Q(<i class='mv'>a</i><i class='mv'>b</i>, <i class='mv'>a</i>−<i class='mv'>b</i>)가 속한 사분면은?",
    options: ["제1사분면", "어느 사분면에도 속하지 않는다", "제3사분면", "제2사분면", "제4사분면"],
    answer: 3,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>① P가 제4사분면에 있으므로 <i class='mv'>a</i>&gt;0, <i class='mv'>b</i>&lt;0이에요.<br>② Q의 첫째 좌표 <i class='mv'>a</i><i class='mv'>b</i>는 양수와 음수의 곱이라 음수예요.<br>③ 둘째 좌표 <i class='mv'>a</i>−<i class='mv'>b</i>는 양수에서 음수를 빼는 계산이라 <i class='mv'>a</i>에 양수를 더한 셈이 되어 양수예요. 그러므로 Q의 부호는 (−, +)이고 <b>제2사분면</b>이에요. 예를 들어 <i class='mv'>a</i>=3, <i class='mv'>b</i>=−2이면 Q(−6, 5)로 확인돼요.<span class='xh'>오답 하나씩 격파</span>'제1사분면'은 곱 <i class='mv'>a</i><i class='mv'>b</i>를 양수로 잘못 정한 답이고, '제3사분면'은 음수를 빼는 계산을 값이 작아지는 쪽으로 오해한 답이에요. '제4사분면'은 P의 자리를 그대로 옮긴 것이고, 두 좌표가 0이 될 수 없으므로 무소속도 아니에요.",
    core: "a>0, b<0이면 ab<0, a−b>0이므로 Q는 제2사분면이에요.",
  },
  {
    id: "m1u3e042",
    lessonId: L,
    type: "num",
    prompt: "점 T(−5, <i class='mv'>c</i>)가 제3사분면에 있고, <i class='mv'>c</i>의 절댓값이 8일 때 <i class='mv'>c</i>의 값을 쓰세요.",
    answer: "-8",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>제3사분면의 점은 두 좌표가 모두 음수예요. T의 첫째 좌표 −5는 이미 음수이므로 둘째 좌표 <i class='mv'>c</i>도 음수여야 해요. 절댓값이 8인 수는 8과 −8인데, 이 가운데 음수는 <b>−8</b>이므로 <i class='mv'>c</i>=−8이에요.<span class='xh'>헷갈림 격파</span>절댓값만 보고 8을 고르면 T는 (−, +)가 되어 제2사분면으로 옮겨 가요. −5를 보고 <i class='mv'>c</i>의 크기도 5라고 정할 근거는 없고, 두 좌표를 곱하거나 더할 필요도 없어요. 사분면 조건으로 부호를 먼저 정하고 절댓값 조건으로 크기를 정하면 답이 하나로 결정돼요. 입력에는 -8을 써요.",
    core: "제3사분면 조건이 c의 음수 부호를, 절댓값이 크기 8을 정해요.",
  },
  {
    id: "m1u3e043",
    lessonId: L,
    type: "mcq",
    prompt: "그림의 점 P의 두 좌표의 부호를 모두 바꾼 점의 위치에 놓여 있는 점은?",
    figure: mExamPlaneFig(PLANE_043),
    options: [
      `점 ${pointAt(PLANE_043, -pointInQuadrant(PLANE_043, 2).x, -pointInQuadrant(PLANE_043, 2).y).label}`,
      `점 ${pointInQuadrant(PLANE_043, 2).label}`,
      `점 ${pointInQuadrant(PLANE_043, 3).label}`,
      `점 ${pointInQuadrant(PLANE_043, 1).label}`,
      "해당 위치에 점이 없다",
    ],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>점 P는 왼쪽 위인 제2사분면에 있어요. 두 좌표의 부호를 모두 바꾸면 원점을 사이에 둔 오른쪽 아래, 제4사분면의 맞은편 위치로 이동해요. 그림에서 그 위치에 정확히 놓인 것은 <b>점 R</b>이에요.<span class='xh'>오답 하나씩 격파</span>'점 P'는 부호를 바꾸기 전의 점이고, '점 S'는 왼쪽 아래에 있어 두 부호 변화 결과와 달라요. '점 Q'는 오른쪽 위라 <i class='mv'>x</i>좌표 부호만 바꾼 구역에 해당해요. '해당 위치에 점이 없다'도 R가 이동 결과와 정확히 겹치므로 틀려요. 두 부호를 바꾸면 좌표의 크기는 그대로이고 방향만 반대가 돼요.",
    core: "두 좌표의 부호를 모두 바꾸면 원점을 사이에 둔 맞은편 점으로 가요.",
  },
  {
    id: "m1u3e044",
    lessonId: L,
    type: "mcq",
    prompt: "점 A(<i class='mv'>a</i>, <i class='mv'>b</i>)와 B(<i class='mv'>b</i>, −<i class='mv'>a</i>)가 모두 제2사분면에 있을 때, <i class='mv'>a</i>와 <i class='mv'>b</i>의 부호로 가능한 것은?",
    options: [
      "<i class='mv'>a</i>&gt;0, <i class='mv'>b</i>&gt;0",
      "<i class='mv'>a</i>&gt;0, <i class='mv'>b</i>&lt;0",
      "조건을 만족하는 부호는 없다",
      "<i class='mv'>a</i>&lt;0, <i class='mv'>b</i>&gt;0",
      "<i class='mv'>a</i>&lt;0, <i class='mv'>b</i>&lt;0",
    ],
    answer: 2,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>A가 제2사분면이므로 <i class='mv'>a</i>&lt;0, <i class='mv'>b</i>&gt;0이에요. 이 조건을 B에 넣으면 첫째 좌표 <i class='mv'>b</i>는 양수이고 둘째 좌표 −<i class='mv'>a</i>도 양수라 B는 제1사분면이 돼요. 따라서 두 점이 모두 제2사분면이라는 조건을 만족하는 부호 조합은 <b>없어요</b>.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>a</i>&gt;0, <i class='mv'>b</i>&gt;0'이면 A가 제1사분면이고, '<i class='mv'>a</i>&gt;0, <i class='mv'>b</i>&lt;0'이면 A가 제4사분면이에요. '<i class='mv'>a</i>&lt;0, <i class='mv'>b</i>&gt;0'은 A만 제2사분면이며 B는 제1사분면이고, '<i class='mv'>a</i>&lt;0, <i class='mv'>b</i>&lt;0'이면 A부터 제3사분면이에요. 어느 선택도 두 점을 모두 제2사분면에 놓지 못해요. A에서 얻은 부호를 B에 대입해 두 조건을 차례로 검산해야 해요.",
    core: "A가 제2사분면이면 B는 제1사분면이므로 주어진 조건은 성립할 수 없어요.",
  },
];
