// m1u3 v2 파일럿 40문항(교과서 준거 규격) · 정본 설계표 qa/m1u3-v2-blueprint.md의 🅟 슬롯.
// 격리 저작본: src 미수정, index.ts 미등록. 승인 후 슬롯 번호대로 m1u3lN.ts에 이식한다.
// 표기: v1 관행 계승 · mfmt 미사용(분수는 slash "y=48/x"·"3/5", 변수는 withVars <i class='mv'>),
// U+2212 직접 타이핑, num answer만 ASCII "-", em대시 금지(주석 포함 · 로).
// 그림: 재사용 5종(mExamPlaneFig·mExamRelationPlaneFig·mExamChangeGraphFig·mExamRelChoicesFig·
// miniGraphRow)+mExamTableFig, 신작 2종(nlFig 수직선·rdFig 반비례 직사각형)은 이 파일 로컬 ·
// 이식 승인 후 examFiguresMath.ts "m1u3 v2" 섹션으로 승격(m2u3 signLineFig 관행).
// 각 문항 주석 = [슬롯 n] 검산 노트.
import type { ExamItem } from "../src/content/exams/types";
import { planeSpec } from "../src/ui/mathKit";
import { miniGraphRow } from "../src/ui/mathFigures";
import {
  mExamChangeGraphFig,
  mExamPlaneFig,
  mExamRelChoicesFig,
  mExamRelationPlaneFig,
  mExamTableFig,
  type MExamPlaneSpec,
  type MExamRelationPlaneSpec,
} from "../src/ui/examFiguresMath";

const minus = (value: number | string): string => String(value).replace("-", "−");
const coord = (x: number, y: number): string => `(${minus(x)}, ${minus(y)})`;
const withVars = (text: string): string =>
  text.replace(/[xyab]/g, (variable) => `<i class='mv'>${variable}</i>`);

/* ── 신작 헬퍼(파일 로컬 · 이식 때 examFiguresMath "m1u3 v2" 섹션 승격) ──────────
 * rest-a~e가 import해 단일 정의를 유지한다(m2u3 signLineFig 관행 · export).
 * nlFig: 수직선 점 그림(비상05-1 계보). 정수 눈금 전부 라벨, 분수 좌표는 subdiv(단위 구간
 * 등분 잔눈금)로 위치를 정의한다. 점의 값은 인쇄하지 않는다(문두가 좌표를 물으므로 유출 금지). */
export const nlFig = (o: {
  min: number;
  max: number;
  points: Array<{ label: string; value: number }>;
  /** 잔눈금: lo~hi(기본 lo+1) 사이 단위 구간마다 den 등분(분수 좌표의 위치 정의) */
  subdiv?: { lo: number; hi?: number; den: number };
}): string => {
  const W = 320;
  const pad = 26;
  const y = 54;
  const px = (v: number): number => pad + ((v - o.min) / (o.max - o.min)) * (W - pad * 2);
  let out =
    `<line x1="${pad - 14}" y1="${y}" x2="${W - pad + 14}" y2="${y}" stroke="#334155" stroke-width="2"/>` +
    `<path d="M${W - pad + 14} ${y} l-7 -4 v8 z" fill="#334155"/>` +
    `<path d="M${pad - 14} ${y} l7 -4 v8 z" fill="#334155"/>`;
  for (let v = o.min; v <= o.max; v++) {
    out +=
      `<line x1="${px(v).toFixed(1)}" y1="${y - 6}" x2="${px(v).toFixed(1)}" y2="${y + 6}" stroke="#334155" stroke-width="1.6"/>` +
      `<text x="${px(v).toFixed(1)}" y="${y + 22}" text-anchor="middle" font-size="11" font-weight="700" fill="#64748B">${minus(v)}</text>`;
  }
  if (o.subdiv) {
    const hi = o.subdiv.hi ?? o.subdiv.lo + 1;
    for (let seg = o.subdiv.lo; seg < hi; seg++) {
      for (let i = 1; i < o.subdiv.den; i++) {
        const v = seg + i / o.subdiv.den;
        out += `<line x1="${px(v).toFixed(1)}" y1="${y - 4}" x2="${px(v).toFixed(1)}" y2="${y + 4}" stroke="#94A3B8" stroke-width="1.2"/>`;
      }
    }
  }
  for (const pt of o.points) {
    out +=
      `<circle cx="${px(pt.value).toFixed(1)}" cy="${y}" r="4.6" fill="#364FC7" stroke="#FFFFFF" stroke-width="1.4"/>` +
      `<text x="${px(pt.value).toFixed(1)}" y="${y - 13}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#334155">${pt.label}</text>`;
  }
  const names = o.points.map((pt) => pt.label).join(", ");
  return `<svg viewBox="0 0 ${W} 90" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="수직선 위에 표시된 점 ${names}">${out}</svg>`;
};

/* rdFig: 반비례 곡선+원점 대칭 직사각형(미래엔12·천재08 3사 신단골). 꼭짓점 B(−m, −a/m)·
 * D(m, a/m)가 곡선 위, A(−m, a/m)·C(m, −a/m). 넓이 = 4a(기하 검산: 가로 2m × 세로 2a/m).
 * m은 a의 약수만(꼭짓점 정수 격자 보장). a·넓이는 미인쇄(문두 몫), x축 ±m은 planeSpec 라벨이 담당. */
export const rdFig = (o: { a: number; m: number }): string => {
  const half = o.a / o.m;
  // min은 짝수 −10(labelEvery 2가 min 기점이라 홀수 min이면 홀수 라벨만 · 검산 V2가 적발한
  // planeSpec 홀짝 함정 · m2u3 ③ 교훈 재확인). ±m 세로변 위치가 짝수 라벨 위에 놓인다.
  const p = planeSpec({ min: -10, max: 10, size: 340, labelEvery: 2 });
  let out = p.grid;
  out += `<rect x="${p.px(-o.m).toFixed(1)}" y="${p.py(half).toFixed(1)}" width="${(p.px(o.m) - p.px(-o.m)).toFixed(1)}" height="${(p.py(-half) - p.py(half)).toFixed(1)}" fill="#EAF1FE" fill-opacity=".8" stroke="#8B99EE" stroke-width="1.4"/>`;
  for (const sign of [-1, 1] as const) {
    const closest = Math.max(o.a / 10, 0.6);
    let d = "";
    for (let i = 0; i <= 64; i++) {
      const absX = closest + (i / 64) * (10 - closest);
      const x = sign * absX;
      const yv = o.a / x;
      d += `${i === 0 ? "M" : "L"}${p.px(x).toFixed(1)} ${p.py(yv).toFixed(1)} `;
    }
    out += `<path d="${d}" stroke="#364FC7" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  }
  const corner = (x: number, yv: number, label: string, dx: number, dy: number): string =>
    `<circle cx="${p.px(x).toFixed(1)}" cy="${p.py(yv).toFixed(1)}" r="4.4" fill="#E8547E" stroke="#FFFFFF" stroke-width="1.4"/>` +
    `<text x="${(p.px(x) + dx).toFixed(1)}" y="${(p.py(yv) + dy).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="900" fill="#334155">${label}</text>`;
  out += corner(-o.m, half, "A", -12, -8) + corner(-o.m, -half, "B", -12, 16) + corner(o.m, -half, "C", 12, 16) + corner(o.m, half, "D", 12, -8);
  return `<svg viewBox="${p.vb}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="반비례 그래프와 네 꼭짓점 A, B, C, D인 직사각형">${out}</svg>`;
};

/* ── L1 좌표: 위치를 수의 쌍으로 ────────────────────────── */
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

export const POOL_M1U3V2_PILOT: ExamItem[] = [
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
    // [슬롯 5] 검산: B는 −1과 0 사이를 2등분한 잔눈금 위 = −1/2. A(2)는 정수점 미끼.
    //  비상05-1(−1/3 3등분) 계보의 2등분 교체. 값 미인쇄(nlFig 규약) · 보기 slash 표기.
    id: "m1u3e005",
    lessonId: "m1u3l1",
    type: "mcq",
    prompt: "수직선 위의 두 점 A, B 중 점 <b>B</b>의 좌표는?",
    figure: nlFig({ min: -3, max: 3, points: [{ label: "A", value: 2 }, { label: "B", value: -0.5 }], subdiv: { lo: -1, den: 2 } }),
    options: ["−1/2", "1/2", "−1", "−2", "0"],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>점 B는 −1과 0 사이에 있어요. 그 사이에 작은 눈금이 하나 더 있어서 한 칸을 똑같이 둘로 나누고 있죠. B는 −1에서 0 쪽으로 반 칸 간 곳이므로 좌표는 <b>−1/2</b>이에요. 수직선 위의 점은 수 하나로 나타내고, 정수 눈금 사이에 있으면 분수나 소수로 읽어요.<span class='xh'>오답 하나씩 격파</span>'1/2'은 0의 오른쪽으로 잘못 읽어 부호를 놓친 답이에요. '−1'과 '−2'는 B가 정수 눈금 위에 있지 않은데 가까운 정수로 대충 읽은 답이고, '0'은 원점과 혼동한 답이에요. 점이 어느 두 정수 사이에 있는지, 그 사이가 몇 등분되어 있는지를 차례로 확인하면 정확히 읽을 수 있어요.",
    core: "정수 눈금 사이의 점은 등분을 세어 분수로 읽어요.",
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

  /* ── L2 사분면: 부호의 네 구역 ────────────────────────── */
  {
    // [슬롯 23] 검산: V(0, 3) 축 위·W(3, 4) 제1·X(−5, 2) 제2 ✓·Y(−1, −6) 제3·Z(4, −3) 제4.
    //  기호 보기 shuffle:false · 정답 X는 세 번째(① 금지 ✓). 레슨 binSort 좌표들과 값 전부 분리.
    id: "m1u3e023",
    lessonId: "m1u3l2",
    type: "mcq",
    prompt: "그림의 다섯 점 중 <b>제2사분면</b> 위의 점은?",
    figure: mExamPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      points: [
        { label: "V", x: 0, y: 3, color: "#F08C2E", labelDx: 13 },
        { label: "W", x: 3, y: 4, color: "#2F9E44" },
        { label: "X", x: -5, y: 2, color: "#364FC7" },
        { label: "Y", x: -1, y: -6, color: "#E8547E" },
        { label: "Z", x: 4, y: -3, color: "#8A6EE0" },
      ],
    }),
    options: ["V", "W", "X", "Y", "Z"],
    answer: 2,
    shuffle: false,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>제2사분면은 왼쪽 위 구역, 즉 <i class='mv'>x</i>좌표가 음수이고 <i class='mv'>y</i>좌표가 양수인 (−, +) 구역이에요. 다섯 점의 좌표를 읽으면 V(0, 3), W(3, 4), X(−5, 2), Y(−1, −6), Z(4, −3)이고, 부호가 (−, +)인 점은 <b>X</b>뿐이에요.<span class='xh'>오답 하나씩 격파</span>W(3, 4)는 (+, +)라 제1사분면, Y(−1, −6)은 (−, −)라 제3사분면, Z(4, −3)은 (+, −)라 제4사분면이에요. V(0, 3)은 x좌표가 0이라 y축 위의 점이고, 축 위의 점은 어느 사분면에도 속하지 않아요. 좌표를 읽기 전에 부호 조합부터 확인하면 구역이 바로 보여요.",
    core: "제2사분면은 (−, +), 부호 조합이 곧 구역이에요.",
  },
  {
    // [슬롯 24] 검산: (7, −8)은 (+, −) → 제4사분면 → 4. 사분면 번호 num 규약(없으면 0 문두 명시).
    //  L2 사분면 번호 num은 0~4 각 1회 배정의 첫 자리(§2).
    id: "m1u3e024",
    lessonId: "m1u3l2",
    type: "num",
    prompt: "점 (7, −8)은 제몇 사분면 위의 점인지 번호를 쓰세요. (어느 사분면에도 속하지 않으면 0을 쓰세요.)",
    answer: "4",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>점 (7, −8)은 <i class='mv'>x</i>좌표 7이 양수, <i class='mv'>y</i>좌표 −8이 음수예요. 부호 조합이 (+, −)이므로 오른쪽 아래 구역인 <b>제4사분면</b> 위의 점이에요. 제1사분면 (+, +)에서 출발해 반시계 방향으로 돌며 (−, +), (−, −), (+, −) 순서로 부호가 바뀐다는 것만 기억하면 어떤 점이든 바로 판정할 수 있어요.<span class='xh'>계산 함정 격파</span>두 좌표의 순서를 바꿔 (−8, 7)로 읽으면 (−, +)가 되어 제2사분면이라고 잘못 답하게 돼요. 또 y좌표의 음수 부호를 놓치면 (+, +)로 보여 제1사분면이라 착각하기 쉬워요. 좌표에 0이 하나라도 있으면 축 위의 점이라 어느 사분면에도 속하지 않는다는 예외까지 챙기면 완벽해요.",
    core: "(+, −)는 오른쪽 아래, 제4사분면이에요.",
  },
  {
    // [슬롯 33] 검산: P(a, b) 제4사분면 → a>0, b<0. ab = 양×음 = 음. b−a = 음−양 = 음.
    //  (ab, b−a) = (−, −) → 제3사분면 ✓ (미래엔08 (ab, a−b)→제2의 방향 교체, §3-0).
    //  사분면 라벨 보기 shuffle:false · 정답 세 번째(① 금지 ✓).
    id: "m1u3e033",
    lessonId: "m1u3l2",
    type: "mcq",
    prompt:
      "점 " + withVars("P(a, b)") + "가 <b>제4사분면</b> 위의 점일 때, 점 " + withVars("(ab, b−a)") + "는 어느 사분면 위의 점일까요?",
    options: ["제1사분면", "제2사분면", "제3사분면", "제4사분면", "어느 사분면에도 속하지 않는다"],
    answer: 2,
    shuffle: false,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>제4사분면의 부호는 (+, −)이므로 <i class='mv'>a</i>&gt;0, <i class='mv'>b</i>&lt;0이라고 먼저 적어요. 새 점의 <i class='mv'>x</i>좌표 <i class='mv'>ab</i>는 양수와 음수의 곱이라 음수예요. <i class='mv'>y</i>좌표 <i class='mv'>b</i>−<i class='mv'>a</i>는 음수에서 양수를 빼는 것이라 더 작아져 역시 음수죠. 부호가 (−, −)이므로 <b>제3사분면</b>이에요.<span class='xh'>오답 하나씩 격파</span>곱 <i class='mv'>ab</i>를 양수로 보면 제4사분면으로, <i class='mv'>b</i>−<i class='mv'>a</i>를 양수로 보면 제2사분면으로 잘못 가요. 뺄셈의 부호는 '음수 − 양수 = 더 작은 음수'로 확정된다는 점이 핵심이에요. 문자 문제는 항상 조건을 부호로 번역해 놓고 시작해요.",
    core: "조건을 a>0, b<0으로 적고 부호만 계산해요.",
  },
  {
    // [슬롯 34] 검산: 부호를 모두 바꾸면 (−a, −3)이고 이것이 (−6, b)와 같다 → −a=−6에서
    //  a=6, b=−3. a×b = 6×(−3) = −18 ✓. 상등+부호 변환 복합(v1 e022 곱 묶음 계보).
    id: "m1u3e034",
    lessonId: "m1u3l2",
    type: "num",
    prompt:
      "점 " + withVars("A(a, 3)") + "의 x좌표와 y좌표의 <b>부호를 모두 바꾸었더니</b> 점 " + withVars("(−6, b)") + "가 되었어요. " + withVars("a×b") + "의 값을 구하세요.",
    answer: "-18",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>점 A(<i class='mv'>a</i>, 3)의 두 좌표의 부호를 모두 바꾸면 (−<i class='mv'>a</i>, −3)이 돼요. 이 점이 (−6, <i class='mv'>b</i>)와 같은 점이므로 같은 자리끼리 비교하면 −<i class='mv'>a</i>=−6에서 <i class='mv'>a</i>=6이고, <i class='mv'>b</i>=−3이에요. 따라서 <i class='mv'>a</i>×<i class='mv'>b</i>=6×(−3)=<b>−18</b>이에요.<span class='xh'>계산 함정 격파</span>−<i class='mv'>a</i>=−6에서 <i class='mv'>a</i>=−6이라고 쓰면 부호를 두 번 틀리는 셈이 돼요. 음수 기호가 이미 붙어 있으니 양변에서 부호를 지워 <i class='mv'>a</i>=6이죠. 또 <i class='mv'>b</i>를 원래 점의 y좌표 3과 혼동하면 곱이 18이 되어 부호가 틀려요. 바뀐 점의 y좌표가 <i class='mv'>b</i>라는 것을 문제에서 다시 확인해요.",
    core: "부호를 바꾼 점을 식으로 쓰고 자리끼리 비교해요.",
  },

  /* ── L3 그래프: 변화를 그림 한 장으로 ─────────────────── */
  {
    // [슬롯 45] 검산: 받다(증가)→잠그다(수평, 양 유지) 서사 = upflat. 배치 (가)up·(나)upflat
    //  정답·(다)upflatup(§3-0 · 정답 ① 금지 ✓). miniGraphRow에 감소 카드가 없어 증가 서사.
    id: "m1u3e045",
    lessonId: "m1u3l3",
    type: "mcq",
    prompt: "빈 물통에 물을 <b>일정하게 받다가</b> 수도꼭지를 <b>잠갔어요</b>. 물통에 담긴 물의 양을 시간에 따라 나타낸 그래프로 알맞은 것은?",
    figure: miniGraphRow(["up", "upflat", "upflatup"]),
    options: ["(가)", "(나)", "(다)"],
    answer: 1,
    shuffle: false,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>이야기를 구간으로 나눠요. 물을 일정하게 받는 동안은 담긴 물의 양이 일정하게 늘어나므로 오른쪽 위로 곧게 올라가는 직선이에요. 수도꼭지를 잠근 뒤에는 물을 더 받지 않지만 이미 담긴 물이 줄지도 않으니, 그래프는 그 높이 그대로 수평이 돼요. 증가한 뒤 수평이 되는 <b>(나)</b>가 정답이에요.<span class='xh'>오답 하나씩 격파</span>'(가)'는 끝까지 늘기만 하는 그래프라 잠근 뒤의 상황이 없어요. '(다)'는 수평 뒤에 다시 늘어나는 모양이라 수도꼭지를 다시 튼 이야기가 되죠. 수평 구간은 '없어진 것'이 아니라 '그대로 유지되는 것'이라는 점이 이 문제의 핵심이에요.",
    core: "잠그면 양이 그대로, 그래프는 수평이 돼요.",
  },
  {
    // [슬롯 47] 검산: 꺾은선 (0,0)(1,3)(2,6)(3,9)(4,9)(5,12) · x=3일 때 y=9, yTicks에 9 라벨 ✓.
    //  서사 = 받다(0~3)·멈춤(3~4)·다시 받다(4~5). 파일럿 num 값 9(§3-0 유일표).
    id: "m1u3e047",
    lessonId: "m1u3l3",
    type: "num",
    prompt: "컵에 물을 받을 때 물의 높이를 시간에 따라 나타낸 그래프예요. <b>3분</b>일 때 물의 높이는 몇 cm인지 구하세요.",
    figure: mExamChangeGraphFig({
      xMin: 0,
      xMax: 5,
      yMin: 0,
      yMax: 12,
      xTicks: [0, 1, 2, 3, 4, 5],
      yTicks: [0, 3, 6, 9, 12],
      xLabel: "시간(분)",
      yLabel: "높이(cm)",
      series: [{ points: [[0, 0], [1, 3], [2, 6], [3, 9], [4, 9], [5, 12]] }],
    }),
    answer: "9",
    numKind: "int",
    unitLabel: "cm",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>가로축에서 3분을 찾아 세로로 점선을 올리면 그래프의 꺾이는 점과 만나요. 그 점에서 가로로 점선을 그어 세로축을 읽으면 눈금 <b>9</b> 위에 정확히 놓여 있어요. 따라서 3분일 때 물의 높이는 9 cm예요.<span class='xh'>판독 함정 격파</span>3분 근처에서 그래프가 수평으로 꺾이기 때문에 4분의 높이(9 cm)와 헷갈릴 이유는 없지만, 눈금을 대충 읽어 6이나 12로 답하면 이웃 눈금을 잘못 짚은 거예요. 반드시 묻는 시각에서 세로로 올라가 만나는 점 하나를 찾고, 그 점의 세로 눈금을 읽는 두 단계를 지켜요. 축의 단위가 분과 cm라는 것도 답을 쓰기 전에 확인하는 습관을 들여요.",
    core: "가로축에서 올라가 만난 점의 세로 눈금을 읽어요.",
  },
  {
    // [슬롯 51] 검산: (0,10)(20,40)(40,40)(60,20)(80,0) · 20~40분 수평(정답 문장 참).
    //  오답: 80분 최다(실제 0명)·계속 증가(감소 구간 존재)·개장 직후 0명(실제 10명)·40분 이후 증가(감소).
    id: "m1u3e051",
    lessonId: "m1u3l3",
    type: "mcq",
    prompt: "어느 전시장에서 입장을 기다리는 사람 수를 개장 후 시간에 따라 나타낸 그래프예요. 옳은 설명은?",
    figure: mExamChangeGraphFig({
      xMin: 0,
      xMax: 80,
      yMin: 0,
      yMax: 40,
      xTicks: [0, 20, 40, 60, 80],
      yTicks: [0, 10, 20, 30, 40],
      xLabel: "시간(분)",
      yLabel: "사람 수(명)",
      series: [{ points: [[0, 10], [20, 40], [40, 40], [60, 20], [80, 0]] }],
    }),
    options: [
      "개장 20분 후부터 40분 후까지 기다리는 사람 수가 변하지 않았어요",
      "개장 80분 후에 기다리는 사람이 가장 많았어요",
      "기다리는 사람 수는 계속 늘어나기만 했어요",
      "개장하는 순간에는 기다리는 사람이 없었어요",
      "개장 40분 후부터 기다리는 사람 수가 늘어났어요",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그래프를 구간별로 읽어요. 0분에 10명으로 시작해 20분까지 40명으로 늘고, 20분부터 40분까지는 40명 그대로 수평이에요. 그 뒤 60분에 20명, 80분에 0명으로 줄어들죠. 따라서 '20분 후부터 40분 후까지 변하지 않았다'가 옳은 설명이에요.<span class='xh'>오답 하나씩 격파</span>80분 후는 0명이라 가장 많기는커녕 아무도 없는 순간이에요. '계속 늘어나기만 했다'는 40분 이후의 내리막을 놓친 설명이고, '개장하는 순간 0명'은 시작점이 10명인 것과 어긋나요. '40분 후부터 늘어났다'는 증가와 감소를 반대로 읽은 거예요. 수평 구간은 사람이 없는 게 아니라 수가 유지되는 구간이라는 것, 시작값과 끝값 확인이 판독의 기본이라는 것을 기억해요.",
    core: "구간별로 증가·수평·감소를 나눠 읽어요.",
  },
  {
    // [슬롯 54] 검산: 아래가 넓고 위가 좁은 2단 병 = 처음엔 천천히(완만)·나중엔 빨리(가파름),
    //  각 단은 폭 일정이라 직선 두 도막 = twoup. 배치 (가)up·(나)twoup 정답·(다)curvefast·
    //  (라)upflat(§3-0 · 레슨 3단 threeup과 각도 분리 · 정답 ① 금지 ✓).
    id: "m1u3e054",
    lessonId: "m1u3l3",
    type: "mcq",
    prompt: "<b>아래가 넓고 위가 좁은 2단 물병</b>에 1초에 같은 양씩 물을 넣을 때, 물의 높이를 시간에 따라 나타낸 그래프로 알맞은 것은?",
    figure: miniGraphRow(["up", "twoup", "curvefast", "upflat"], ["(가)", "(나)", "(다)", "(라)"]),
    options: ["(가)", "(나)", "(다)", "(라)"],
    answer: 1,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>병을 아래 단과 위 단으로 나눠 생각해요. 아래 단은 폭이 넓어서 같은 양을 부어도 수면이 천천히 올라가고, 폭이 일정하니 완만한 직선이에요. 물이 위 단에 닿으면 폭이 좁아져 수면이 빨리 올라가고, 역시 폭이 일정하니 이번엔 가파른 직선이죠. 완만한 직선에서 가파른 직선으로 한 번 꺾이는 <b>(나)</b>가 정답이에요.<span class='xh'>오답 하나씩 격파</span>'(가)'는 처음부터 끝까지 같은 빠르기라 폭이 하나인 병이에요. '(다)'는 점점 빨라지는 곡선이라 위로 갈수록 서서히 좁아지는 병의 그래프죠. 2단 병은 폭이 계단처럼 한 번에 바뀌므로 곡선이 아니라 꺾인 직선이 돼요. '(라)'는 중간에 수평이 되는데, 물을 계속 넣는 한 높이가 멈출 이유가 없어요.",
    core: "단마다 직선, 좁아지는 순간 더 가파르게 꺾여요.",
  },
  {
    // [슬롯 58] 검산: (0,6)(4,12)(8,24) · 0~4주 +6, 4~8주 +12 → 차 12−6=6 ✓ 전 점 눈금 위
    //  (yTicks 6 간격). 파일럿 num 값 6(§3-0 유일표 · s24의 4·s47의 9와 분산).
    id: "m1u3e058",
    lessonId: "m1u3l3",
    type: "num",
    prompt: "심은 대나무의 키를 나타낸 그래프예요. 심은 지 <b>4주까지 자란 키</b>와 <b>4주부터 8주까지 자란 키</b>의 차는 몇 cm인지 구하세요.",
    figure: mExamChangeGraphFig({
      xMin: 0,
      xMax: 8,
      yMin: 0,
      yMax: 24,
      xTicks: [0, 2, 4, 6, 8],
      yTicks: [0, 6, 12, 18, 24],
      xLabel: "시간(주)",
      yLabel: "키(cm)",
      series: [{ points: [[0, 6], [4, 12], [8, 24]] }],
    }),
    answer: "6",
    numKind: "int",
    unitLabel: "cm",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>그래프에서 세 지점을 읽으면 심을 때 6 cm, 4주에 12 cm, 8주에 24 cm예요. 4주까지 자란 키는 12−6=6 cm이고, 4주부터 8주까지 자란 키는 24−12=12 cm예요. 두 양의 차는 12−6=<b>6</b> cm이죠. 뒤 구간의 직선이 더 가파른 만큼 더 많이 자란 거예요.<span class='xh'>계산 함정 격파</span>4주의 키 12 cm와 8주의 키 24 cm를 그대로 빼서 12라고 답하면, '자란 키의 차'가 아니라 '두 시점의 키 차'를 구한 거예요. 이 문제는 각 구간에서 늘어난 양을 먼저 구한 뒤 그 둘을 비교해야 해요. 또 심을 때 이미 6 cm였다는 시작값을 0으로 착각하면 앞 구간이 12 cm 자란 것으로 보여 차가 0이 되니, 시작값 확인도 잊지 마세요.",
    core: "구간마다 늘어난 양을 먼저 구하고 비교해요.",
  },

  /* ── L4 그래프 해석: 선 하나에 담긴 이야기 ────────────── */
  {
    // [슬롯 70] 검산: (0,0)(10,2)(35,2)(45,0) · 수평 구간 10~35분 → 머문 시간 25분 ✓
    //  xTicks 5 간격이라 꺾임점 10·35 전부 라벨 위. 파일럿 num 값 25(s183의 20과 분산, §3-0).
    id: "m1u3e070",
    lessonId: "m1u3l4",
    type: "num",
    prompt: "지호가 집에서 2 km 떨어진 공원에 자전거를 타고 갔다가 돌아왔어요. 그래프에서 지호가 공원에 <b>머문 시간</b>은 몇 분인지 구하세요.",
    figure: mExamChangeGraphFig({
      xMin: 0,
      xMax: 45,
      yMin: 0,
      yMax: 2,
      xTicks: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45],
      yTicks: [0, 1, 2],
      xLabel: "시간(분)",
      yLabel: "거리(km)",
      series: [{ points: [[0, 0], [10, 2], [35, 2], [45, 0]] }],
    }),
    answer: "25",
    numKind: "int",
    unitLabel: "분",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>공원에 머무는 동안은 집에서 떨어진 거리가 2 km로 변하지 않으므로, 그래프에서 높이 2 km인 수평 구간을 찾아요. 수평 구간은 10분에 시작해 35분에 끝나요. 따라서 머문 시간은 35−10=<b>25</b>분이에요.<span class='xh'>판독 함정 격파</span>수평 구간의 끝 시각 35분을 그대로 답하면 '머문 시간'이 아니라 '출발한 시각'을 답한 거예요. 구간의 길이는 반드시 끝에서 시작을 빼서 구해요. 또 그래프 전체 시간 45분을 답하면 왕복까지 포함한 시간이 되죠. y축이 '집에서 떨어진 거리'라는 것을 먼저 확인하고, 거리가 유지되는 구간이 곧 머문 구간이라는 번역을 정확히 해요.",
    core: "머문 시간 = 수평 구간의 끝에서 시작을 뺀 길이예요.",
  },
  {
    // [슬롯 71] 검산: 속력 그래프 (0,4)(3,4)(5,8)(8,2) · 처음 3분은 속력 4로 수평 = 일정한
    //  속력으로 이동 중(정지 아님 · 비상05-4 함정 계보). 문장 보기라 셔플 기본.
    id: "m1u3e071",
    lessonId: "m1u3l4",
    type: "mcq",
    prompt: "달리기 연습을 하는 서준이의 <b>속력</b>을 시간에 따라 나타낸 그래프예요. <b>처음 3분 동안</b>의 서준이에 대한 설명으로 옳은 것은?",
    figure: mExamChangeGraphFig({
      xMin: 0,
      xMax: 8,
      yMin: 0,
      yMax: 8,
      xTicks: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      yTicks: [0, 2, 4, 6, 8],
      xLabel: "시간(분)",
      yLabel: "속력(m/초)",
      series: [{ points: [[0, 4], [3, 4], [5, 8], [8, 2]] }],
    }),
    options: [
      "일정한 속력으로 달렸어요",
      "멈춰 서 있었어요",
      "점점 빨라졌어요",
      "점점 느려졌어요",
      "속력이 0이었어요",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>이 그래프의 세로축은 위치나 거리가 아니라 <b>속력</b>이에요. 처음 3분 동안 그래프가 높이 4에서 수평이라는 것은 속력이 4 m/초로 변하지 않았다는 뜻, 곧 <b>일정한 속력으로 계속 달렸다</b>는 뜻이에요.<span class='xh'>오답 하나씩 격파</span>가장 큰 함정은 '멈춰 서 있었다'예요. 수평 구간을 정지로 읽는 건 거리 그래프의 습관인데, 속력 그래프에서 멈춤은 수평이 아니라 속력이 0인 지점, 즉 그래프가 가로축에 닿는 것으로 나타나요. 처음 3분의 높이는 0이 아닌 4이므로 '속력이 0'도 틀렸죠. '점점 빨라졌다'는 3분 이후의 오르막, '점점 느려졌다'는 5분 이후의 내리막 이야기예요. 축이 무엇을 나타내는지 확인하는 게 그래프 해석의 1단계라는 걸 보여 주는 문제예요.",
    core: "속력 그래프의 수평은 정지가 아니라 일정한 빠르기예요.",
  },
  {
    // [슬롯 72] 검산: 걷기(증가)→기다림(수평)→뛰기(더 가파른 증가) = upflatup(path의 구간별
    //  오름 폭 실측 1 → 0 → 1.4로 '뛰기가 더 가파름' 성립, §3-0). 배치 ①up·②upflatup 정답·③updown·
    //  ④upflat·⑤twoup(천재04 계보 · 정답 ① 금지 ✓).
    id: "m1u3e072",
    lessonId: "m1u3l4",
    type: "mcq",
    prompt: "현서는 집에서 학교까지 <b>일정한 빠르기로 걸어가다가</b>, 문구점 앞에서 친구를 <b>잠시 기다린 뒤</b>, 지각하지 않으려고 <b>더 빠르게 일정하게 뛰어서</b> 학교에 도착했어요. 집에서 떨어진 거리를 시간에 따라 나타낸 그래프로 알맞은 것은?",
    figure: miniGraphRow(["up", "upflatup", "updown", "upflat", "twoup"], ["①", "②", "③", "④", "⑤"]),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 1,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>이야기를 세 토막으로 나눠요. 걷는 동안은 거리가 일정하게 늘어나는 직선, 기다리는 동안은 거리가 그대로인 수평, 뛰는 동안은 다시 늘어나되 걷기보다 <b>더 가파른</b> 직선이에요. 증가, 수평, 더 가파른 증가가 차례로 이어진 <b>②</b>가 정답이에요.<span class='xh'>오답 하나씩 격파</span>'①'은 멈춘 구간이 없어서 기다림이 빠졌고, '④'는 수평으로 끝나 학교에 도착하는 마지막 구간이 없어요. '⑤'는 쉬지 않고 점점 빨라지기만 한 모양이죠. '③'은 올라갔다 내려오는 모양인데, 집에서 학교로 가는 동안 거리가 줄어들 일은 없으니 되돌아간 이야기가 돼요. 상황의 사건 하나하나를 그래프 구간과 짝지어 확인하면 함정이 걸러져요.",
    core: "사건 세 토막을 그래프 세 구간과 짝지어요.",
  },
  {
    // [슬롯 75] 검산: (0,0)(15,6)(30,6)(45,0). ㄱ 참(최고 6 km) · ㄴ 참(15~30분 수평 = 15분)
    //  · ㅁ 참(45분에 거리 0 복귀) · ㄷ 거짓(돌아오는 데 45−30=15분) · ㄹ 거짓(10분엔
    //  6×10/15=4 km). 참 3개 answer [0,1,4].
    id: "m1u3e075",
    lessonId: "m1u3l4",
    type: "multi",
    prompt: "하린이가 집에서 출발해 갔다가 돌아온 길을 나타낸 그래프예요. 옳은 설명을 <b>모두</b> 고르세요.",
    figure: mExamChangeGraphFig({
      xMin: 0,
      xMax: 45,
      yMin: 0,
      yMax: 6,
      xTicks: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45],
      yTicks: [0, 2, 4, 6],
      xLabel: "시간(분)",
      yLabel: "거리(km)",
      series: [{ points: [[0, 0], [15, 6], [30, 6], [45, 0]] }],
    }),
    options: [
      "집에서 6 km 떨어진 곳까지 갔어요",
      "같은 곳에 15분 동안 머물렀어요",
      "돌아오는 데 20분이 걸렸어요",
      "출발한 지 10분 후에는 집에서 5 km 떨어져 있었어요",
      "집을 나선 지 45분 만에 돌아왔어요",
    ],
    answer: [0, 1, 4],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그래프의 최고 높이가 6 km이므로 가장 멀리 간 거리는 6 km가 맞아요. 높이 6 km의 수평 구간은 15분부터 30분까지라 머문 시간은 15분이고, 45분에 그래프가 다시 0에 닿으므로 45분 만에 집에 돌아온 것도 맞죠.<span class='xh'>틀린 설명 격파</span>돌아오는 구간은 30분부터 45분까지라 걸린 시간은 15분이지 20분이 아니에요. 또 가는 길은 15분 동안 6 km를 일정하게 간 직선이므로 10분 후에는 6의 3분의 2인 4 km 지점이지 5 km가 아니죠. 그래프의 꺾이는 점을 기준으로 구간을 나누고, 구간 안의 값은 직선의 비율로 읽는 습관이 이런 세밀한 함정까지 걸러 줘요.",
    core: "꺾임점으로 구간을 나누면 이야기가 복원돼요.",
  },
  {
    // [슬롯 84] 검산: 엘리베이터 높이 (0,0)(1,15)(3,15)(4,30)(6,0) · 상승→정지(1~3분)→
    //  상승→하강 복귀. 최고 30 m·정지 1회. 문장 보기 셔플 기본.
    id: "m1u3e084",
    lessonId: "m1u3l4",
    type: "mcq",
    prompt: "어느 건물 엘리베이터의 <b>높이</b>를 시간에 따라 나타낸 그래프예요. 그래프를 옳게 읽은 것은?",
    figure: mExamChangeGraphFig({
      xMin: 0,
      xMax: 6,
      yMin: 0,
      yMax: 30,
      xTicks: [0, 1, 2, 3, 4, 5, 6],
      yTicks: [0, 15, 30],
      xLabel: "시간(분)",
      yLabel: "높이(m)",
      series: [{ points: [[0, 0], [1, 15], [3, 15], [4, 30], [6, 0]] }],
    }),
    options: [
      "올라가다 한 번 멈춘 뒤 더 올라갔고, 마지막에 처음 높이로 내려왔어요",
      "멈추지 않고 가장 높은 곳까지 올라갔어요",
      "내려갔다가 다시 올라왔어요",
      "움직이는 동안 두 번 멈췄어요",
      "가장 높이 올라간 높이는 15 m예요",
    ],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>구간별로 읽으면 0~1분 상승(0→15 m), 1~3분 수평(15 m에서 멈춤), 3~4분 상승(15→30 m), 4~6분 하강(30→0 m)이에요. '올라가다 한 번 멈추고, 더 올라간 뒤, 처음 높이로 내려왔다'가 이 네 토막을 정확히 담은 설명이에요.<span class='xh'>오답 하나씩 격파</span>1분부터 3분까지 수평 구간이 있으니 '멈추지 않고 올라갔다'는 틀렸고, 멈춤은 이 한 번뿐이라 '두 번 멈췄다'도 틀렸어요. 그래프는 상승으로 시작하므로 '내려갔다가 올라왔다'는 순서가 반대죠. 가장 높은 지점은 4분의 30 m이므로 15 m는 중간에 멈춘 높이일 뿐이에요. 수평의 위치(15 m)와 꼭대기(30 m)를 구분해 읽는 것이 열쇠예요.",
    core: "꺾임마다 한 문장씩, 네 구간이 네 문장이 돼요.",
  },

  /* ── L5 정비례: 2배는 2배를 부른다 ────────────────────── */
  {
    // [슬롯 90] 검산: y=x/6 = (1/6)x 꼴이라 정비례 ✓. y=4/x 반비례·y=6−x 뺄셈·y=0.5x+1
    //  상수항·xy=10 반비례 변형. 레슨 판별 세트(y=x/8·y=−4x·x+y=5·y=6/x·y=7−3x)와 식 전부 분리.
    //  (초판 오답 y=6/x·xy=6은 s099 오답 y=6/x와 레슨 내 같은 관계식 노출이라 4/x·10으로 교체 · full 게이트 WARN 반영.)
    id: "m1u3e090",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: "다음 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>정비례</b>하는 것은?",
    options: [withVars("y=x/6"), withVars("y=4/x"), withVars("y=6−x"), withVars("y=0.5x+1"), withVars("xy=10")],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>정비례는 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>(<i class='mv'>a</i>는 0이 아닌 수) 꼴이에요. <i class='mv'>y</i>=<i class='mv'>x</i>/6은 <i class='mv'>x</i>에 1/6을 곱한 것과 같아서 <i class='mv'>a</i>=1/6인 정비례가 맞아요. 나눗셈처럼 보여도 나누는 수가 일정하면 곱하기 꼴로 고칠 수 있죠.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>y</i>=4/<i class='mv'>x</i>'는 분모에 <i class='mv'>x</i>가 있어 반비례이고, '<i class='mv'>xy</i>=10'도 곱이 일정한 반비례의 다른 표기예요. 분자에 있는 <i class='mv'>x</i>와 분모에 있는 <i class='mv'>x</i>를 구분하는 게 판별의 핵심이에요. '<i class='mv'>y</i>=6−<i class='mv'>x</i>'는 빼는 관계라 <i class='mv'>x</i>가 2배여도 <i class='mv'>y</i>가 2배가 되지 않고, '<i class='mv'>y</i>=0.5<i class='mv'>x</i>+1'은 +1이 붙어 배율 고리가 끊어져요.",
    core: "y=x/6은 (1/6)배, 당당한 정비례예요.",
  },
  {
    // [슬롯 95] 검산: ㄱ 참(정의) · ㄴ 참(y/x=a 일정) · ㄷ 거짓(1씩이 아니라 a씩 커짐) ·
    //  ㄹ 거짓(x=0이면 y=0) · ㅁ 거짓(음수 a도 정비례). answer [0,1]. 레슨 진술 verbatim 회피.
    id: "m1u3e095",
    lessonId: "m1u3l5",
    type: "multi",
    prompt: "정비례 관계 " + withVars("y=ax") + "(" + withVars("a") + "는 0이 아닌 수)에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    options: [
      "x의 값이 2배가 되면 y의 값도 2배가 돼요",
      "y를 x로 나눈 값은 항상 a로 일정해요",
      "x의 값이 1씩 커지면 y의 값도 항상 1씩 커져요",
      "x=0일 때 y의 값은 1이에요",
      "a가 음수이면 정비례 관계가 아니에요",
    ],
    answer: [0, 1],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>정비례의 정의가 바로 '<i class='mv'>x</i>가 2배, 3배가 되면 <i class='mv'>y</i>도 같은 배율로 커진다'예요. 그리고 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>의 양변을 <i class='mv'>x</i>로 나누면 <i class='mv'>y</i>/<i class='mv'>x</i>=<i class='mv'>a</i>이므로 나눈 값이 항상 일정한 것도 맞아요. 이 두 가지가 정비례를 판별하는 두 얼굴이죠.<span class='xh'>틀린 설명 격파</span>'<i class='mv'>x</i>가 1씩 커지면 <i class='mv'>y</i>도 1씩'은 <i class='mv'>a</i>=1일 때만 맞는 말이에요. 일반적으로는 <i class='mv'>a</i>씩 커지죠. '<i class='mv'>x</i>=0일 때 <i class='mv'>y</i>=1'은 틀렸어요. 0에 무엇을 곱해도 0이라 정비례 그래프가 항상 원점을 지나는 이유가 여기 있어요. 마지막으로 <i class='mv'>a</i>가 음수여도 '−2배'라는 일정한 배율이 유지되므로 어엿한 정비례예요.",
    core: "정비례의 두 얼굴: 같은 배율, 일정한 y/x.",
  },
  {
    // [슬롯 99] 검산: 표 (2,3)(4,6)(6,9) → y/x = 3/2 일정 → y=(3/2)x ✓. 함정 y=x+1은
    //  첫 열 (2,3)만 만족하고 (4,6)에서 4+1=5≠6 탈락(§3-0 · 전 열 정합은 정답뿐).
    id: "m1u3e099",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: "표는 " + withVars("y") + "가 " + withVars("x") + "에 정비례하는 관계를 나타낸 거예요. " + withVars("x") + "와 " + withVars("y") + " 사이의 관계식은?",
    figure: mExamTableFig(["x", "2", "4", "6"], [["y", "3", "6", "9"]], { aria: "x와 y의 대응 관계를 나타낸 표" }),
    options: [withVars("y=(3/2)x"), withVars("y=(2/3)x"), withVars("y=3x"), withVars("y=x+1"), withVars("y=6/x")],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>정비례라 했으니 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>로 놓고 표의 한 쌍을 대입해요. <i class='mv'>x</i>=2일 때 <i class='mv'>y</i>=3이므로 3=2<i class='mv'>a</i>, <i class='mv'>a</i>=3/2예요. 관계식은 <b><i class='mv'>y</i>=(3/2)<i class='mv'>x</i></b>이고, 나머지 열로 검산하면 (3/2)×4=6, (3/2)×6=9로 전부 맞아요.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>y</i>=<i class='mv'>x</i>+1'은 첫 열 (2, 3)만 보면 그럴듯하지만 (4, 6)에서 4+1=5가 되어 어긋나요. 표 문제는 한 열이 아니라 모든 열로 확인해야 해요. '<i class='mv'>y</i>=(2/3)<i class='mv'>x</i>'는 분자·분모를 뒤집은 값이고, '<i class='mv'>y</i>=3<i class='mv'>x</i>'는 첫 열의 <i class='mv'>y</i>값 3을 그대로 배율로 착각한 거예요. '<i class='mv'>y</i>=6/<i class='mv'>x</i>'는 곱이 6·24·54로 제멋대로라 반비례도 아니죠.",
    core: "a는 한 쌍으로 구하고 모든 열로 검산해요.",
  },
  {
    // [슬롯 108] 검산: 10분에 500원 → 90분은 10분이 9번 → 500×9=4500원 ✓. 단위 환산
    //  (1시간 30분 = 90분) 함정. 레슨 소재(빙하·환율·축척)와 분리된 주차 요금 신작.
    id: "m1u3e108",
    lessonId: "m1u3l5",
    type: "num",
    prompt: "어느 주차장은 주차 시간 <b>10분마다 500원씩</b> 요금이 일정하게 늘어나요. <b>1시간 30분</b> 동안 주차했을 때 요금은 몇 원인지 구하세요.",
    answer: "4500",
    numKind: "int",
    unitLabel: "원",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>먼저 시간 단위를 통일해요. 1시간 30분은 60+30=90분이에요. 10분마다 500원씩이므로 90분 동안에는 10분짜리 묶음이 90÷10=9번 들어가고, 요금은 500×9=<b>4500</b>원이에요. 주차 시간을 <i class='mv'>x</i>분, 요금을 <i class='mv'>y</i>원이라 하면 <i class='mv'>y</i>=50<i class='mv'>x</i>인 정비례 관계로도 확인할 수 있어요. 50×90=4500으로 같은 답이 나오죠.<span class='xh'>계산 함정 격파</span>1시간 30분을 130분으로 바꾸면 6500원이라는 엉뚱한 답이 나와요. 시간의 단위 환산은 100이 아니라 60이 기준이에요. 또 '10분마다'를 '1분마다'로 잘못 읽으면 요금이 45000원으로 열 배가 되니, 기준 단위가 몇 분인지 문제에서 다시 확인하는 습관을 들여요.",
    core: "단위부터 통일하면 정비례 계산은 곱셈 한 번이에요.",
  },

  /* ── L6 정비례 그래프: 원점을 지나는 직선 ─────────────── */
  {
    // [슬롯 113] 검산: 직선이 격자점 P(1, 7)을 지남 → 7=a×1 → a=7 ✓ (§3-0에서 (1, 4)→(1, 7)
    //  재설계 · s24=4와 값 분산). min −8·max 8·labelEvery 1이라 1·7 전부 라벨 눈금 위.
    //  |a|=7 직선이 y축에 바짝 서는 모양 자체가 이 레슨의 성질(|a| 클수록 y축에 가까움).
    id: "m1u3e113",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계 " + withVars("y=ax") + "의 그래프가 그림과 같이 점 P를 지날 때, " + withVars("a") + "의 값을 구하세요.",
    figure: mExamRelationPlaneFig({
      min: -8,
      max: 8,
      size: 330,
      labelEvery: 1,
      lines: [{ a: 7, color: "#364FC7" }],
      points: [{ label: "P", x: 1, y: 7, color: "#364FC7", labelDx: 14, labelDy: 4 }],
    }),
    answer: "7",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>점 P의 좌표를 격자에서 읽으면 (1, 7)이에요. 정비례 관계 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>의 그래프 위의 점이므로 좌표를 식에 대입하면 7=<i class='mv'>a</i>×1, 즉 <i class='mv'>a</i>=<b>7</b>이에요. <i class='mv'>x</i>=1일 때의 <i class='mv'>y</i>값이 바로 <i class='mv'>a</i>라는 성질을 쓰면 대입 없이도 한눈에 읽을 수 있죠.<span class='xh'>판독 함정 격파</span>P의 두 좌표를 거꾸로 읽어 (7, 1)로 보면 <i class='mv'>a</i>=1/7이 되어 완전히 다른 답이 나와요. 가로가 1, 세로가 7이라는 순서를 지켜요. 또 이 직선이 y축에 바짝 붙어 가파르게 선 것은 |<i class='mv'>a</i>|가 큰 정비례 그래프의 특징이에요. 가파르다고 겁먹지 말고 격자점 하나만 정확히 찾으면 돼요.",
    core: "그래프 위 격자점 하나면 a가 바로 나와요.",
  },
  {
    // [슬롯 116] 검산: y=−3x는 원점을 지나는 오른쪽 아래 직선 → 카드 ②. 함정 ① 우상향
    //  직선·③ 1·3사분면 곡선·④ 원점 이탈 우상향·⑤ 2·4사분면 곡선. 근거는 방향·원점·직선
    //  여부만(기울어진 정도 비교 없음) · 라벨 보기 shuffle:false · 정답 ② (① 금지 ✓).
    id: "m1u3e116",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "정비례 관계 " + withVars("y=−3x") + "의 그래프로 알맞은 것은?",
    figure: mExamRelChoicesFig([
      { line: { a: 0.8 } },
      { line: { a: -0.8 } },
      { inv: 1 },
      { line: { a: 0.8, bPx: 18 } },
      { inv: -1 },
    ]),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 1,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>정비례 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>의 그래프는 언제나 원점을 지나는 직선이고, <i class='mv'>a</i>=−3처럼 <i class='mv'>a</i>가 음수이면 오른쪽 아래로 향하며 제2사분면과 제4사분면을 지나요. 두 조건을 모두 만족하는 카드는 <b>②</b>뿐이에요.<span class='xh'>오답 하나씩 격파</span>'①'은 원점을 지나지만 오른쪽 위로 향하니 <i class='mv'>a</i>가 양수인 그래프예요. '④'는 방향은 위쪽인 데다 원점을 지나지 않아 정비례 그래프 자체가 아니죠. '③'과 '⑤'는 한 쌍의 매끄러운 곡선이라 반비례 그래프예요. 식을 보고 직선인지 곡선인지, 원점을 지나는지, 어느 쪽으로 향하는지 세 가지만 차례로 확인하면 개형 문제는 틀릴 수 없어요.",
    core: "a가 음수인 정비례는 원점 지나 오른쪽 아래 직선!",
  },
  {
    // [슬롯 119] 검산: 직선 y=(1/3)x · ㄱ 참(원점) · ㄴ 참((3, 1) 통과: 1=(1/3)×3 ✓ 격자
    //  판독 가능) · ㄷ 참(a>0이라 증가) · ㄹ 거짓((1, 3)은 자리 바꿈 · (1/3)×1=1/3≠3) ·
    //  ㅁ 거짓(오른쪽 위로 향함). answer [0,1,2].
    id: "m1u3e119",
    lessonId: "m1u3l6",
    type: "multi",
    prompt: "그림과 같은 정비례 관계의 그래프에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    figure: mExamRelationPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      lines: [{ a: 1 / 3, color: "#364FC7" }],
    }),
    options: [
      "원점을 지나는 직선이에요",
      "점 (3, 1)을 지나요",
      "x의 값이 커지면 y의 값도 커져요",
      "점 (1, 3)을 지나요",
      "오른쪽 아래로 향해요",
    ],
    answer: [0, 1, 2],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그래프는 원점을 지나는 직선이므로 정비례 관계이고 첫 설명은 참이에요. 격자를 따라가면 가로 3칸, 세로 1칸 지점에서 직선이 격자점을 정확히 지나므로 (3, 1)을 지난다는 설명도 참이죠. 직선이 오른쪽 위로 향하니 <i class='mv'>x</i>가 커질 때 <i class='mv'>y</i>도 커진다는 설명까지 참이에요.<span class='xh'>틀린 설명 격파</span>'(1, 3)을 지난다'는 (3, 1)의 두 수를 바꾼 함정이에요. 가로 1칸 지점에서 직선의 높이는 3이 아니라 1/3이라 격자점을 지나지도 않죠. 좌표의 순서가 바뀌면 완전히 다른 점이라는 L1의 원칙이 그래프에서도 그대로 살아 있어요. '오른쪽 아래로 향한다'는 눈에 보이는 방향과 정반대이고, 그건 <i class='mv'>a</i>가 음수일 때의 모습이에요.",
    core: "직선이 지나는 격자점을 찾고 순서 함정을 걸러요.",
  },
  {
    // [슬롯 130] 검산: 조건 = 원점 통과 직선 + 오른쪽 아래 → 카드 ③. 함정 ② 곡선(방향은
    //  비슷해도 직선 아님)·④ 우하향이지만 원점 이탈·⑤ 원점 이탈 우상향·① 우상향.
    //  두 조건 동시 판정 복합 · 정답 ③ (① 금지 ✓).
    id: "m1u3e130",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "그래프가 <b>원점을 지나는 직선</b>이면서 <b>오른쪽 아래로 향하는</b> 것은?",
    figure: mExamRelChoicesFig([
      { line: { a: 0.9 } },
      { inv: -1 },
      { line: { a: -0.9 } },
      { line: { a: -0.9, bPx: -16 } },
      { line: { a: 0.9, bPx: 14 } },
    ]),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 2,
    shuffle: false,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>조건이 두 개예요. 원점을 지나는 직선이어야 하고, 동시에 오른쪽 아래로 향해야 하죠. '③'은 원점을 지나는 직선이면서 오른쪽 아래로 내려가므로 두 조건을 모두 만족해요. <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에서 <i class='mv'>a</i>&lt;0인 그래프의 모습 그대로예요.<span class='xh'>오답 하나씩 격파</span>'②'는 오른쪽 아래로 향하는 것처럼 보이지만 한 쌍의 곡선이라 반비례 그래프이고 원점도 지나지 않아요. '④'는 방향은 맞는데 직선이 원점을 비껴가서 정비례 그래프가 아니죠. '①'과 '⑤'는 둘 다 오른쪽 위로 향해서 방향 조건에서 탈락해요. 조건이 두 개인 문제는 하나만 확인하고 멈추지 말고, 카드마다 두 조건에 전부 체크 표시를 해 보는 게 안전해요.",
    core: "조건 둘 다 만족하는 카드만 살아남아요.",
  },
  {
    // [슬롯 131] 검산: 점 P(3, 5) 격자 판독 → x가 3에서 6으로 2배가 되면 y도 5에서 2배 →
    //  (6, 10), k=10 ✓ (§3-0 재설계 · a=5/3 분수 경유 없이 정비례 배율 성질로 푸는 경로).
    id: "m1u3e131",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계의 그래프가 그림과 같이 점 P를 지나요. 이 그래프가 점 " + withVars("(6, k)") + "를 지날 때, " + withVars("k") + "의 값을 구하세요.",
    figure: mExamRelationPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      lines: [{ a: 5 / 3, color: "#364FC7" }],
      points: [{ label: "P", x: 3, y: 5, color: "#364FC7", labelDx: 14, labelDy: -6 }],
    }),
    answer: "10",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>점 P의 좌표를 격자에서 읽으면 (3, 5)예요. 정비례 관계에서는 <i class='mv'>x</i>가 2배가 되면 <i class='mv'>y</i>도 2배가 돼요. <i class='mv'>x</i>가 3에서 6으로 2배가 되었으니 <i class='mv'>y</i>는 5의 2배인 <b>10</b>, 즉 <i class='mv'>k</i>=10이에요. 관계식으로 풀어도 같아요. 5=3<i class='mv'>a</i>에서 <i class='mv'>a</i>=5/3이고, <i class='mv'>y</i>=(5/3)×6=10이죠.<span class='xh'>계산 함정 격파</span>'<i class='mv'>x</i>가 3만큼 커졌으니 <i class='mv'>y</i>도 3만큼 커진다'고 보면 8이라는 오답이 나와요. 정비례는 '같은 양을 더하는' 관계가 아니라 '같은 배율로 곱하는' 관계예요. 또 P를 (5, 3)으로 거꾸로 읽으면 배율 경로가 전부 어긋나니, 판독 순서도 늘 조심해요.",
    core: "정비례는 더하기가 아니라 배율, 2배면 2배!",
  },

  /* ── L7 반비례: 곱이 일정한 관계 ──────────────────────── */
  {
    // [슬롯 134] 검산: y=9/x만 분모에 x가 있는 반비례 ✓. y=x/9는 (1/9)x 정비례 함정,
    //  y=9x 정비례·y=9−x 뺄셈·y=x+9 덧셈. 레슨 binSort 세트(200/x·x/5·60·−12/x)와 분리.
    id: "m1u3e134",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt: "다음 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>반비례</b>하는 것은?",
    options: [withVars("y=9/x"), withVars("y=x/9"), withVars("y=9x"), withVars("y=9−x"), withVars("y=x+9")],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>반비례는 <i class='mv'>y</i>=<i class='mv'>a</i>/<i class='mv'>x</i>(<i class='mv'>a</i>는 0이 아닌 수) 꼴, 즉 <b>분모에 <i class='mv'>x</i>가 있는</b> 관계예요. <i class='mv'>y</i>=9/<i class='mv'>x</i>는 <i class='mv'>a</i>=9인 반비례가 맞고, 두 변수의 곱 <i class='mv'>xy</i>가 항상 9로 일정하죠.<span class='xh'>오답 하나씩 격파</span>가장 위험한 함정은 '<i class='mv'>y</i>=<i class='mv'>x</i>/9'예요. 나눗셈이 보이지만 <i class='mv'>x</i>가 분자에 있어서 (1/9)×<i class='mv'>x</i>, 곧 정비례예요. <i class='mv'>x</i>가 분모에 있는지 분자에 있는지가 갈림길이에요. '<i class='mv'>y</i>=9<i class='mv'>x</i>'는 곱하는 정비례이고, '<i class='mv'>y</i>=9−<i class='mv'>x</i>'와 '<i class='mv'>y</i>=<i class='mv'>x</i>+9'는 빼거나 더하는 관계라 <i class='mv'>x</i>가 2배일 때 <i class='mv'>y</i>가 1/2배가 되지 않아요.",
    core: "x가 분모에 있어야 반비례, 분자면 정비례예요.",
  },
  {
    // [슬롯 141] 검산: 전체 720 L 고정 → xy=720, y=720/x. x=24이면 y=720÷24=30분 ✓
    //  (비상06-4 수영장 1800 L·레슨 수영장 2400 L과 수치·소재 분리 · 물탱크).
    id: "m1u3e141",
    lessonId: "m1u3l7",
    type: "num",
    prompt: "들이가 <b>720 L</b>인 빈 물탱크에 1분에 " + withVars("x") + " L씩 일정하게 물을 넣으면 가득 채우는 데 " + withVars("y") + "분이 걸려요. 1분에 <b>24 L</b>씩 넣을 때 걸리는 시간은 몇 분인지 구하세요.",
    answer: "30",
    numKind: "int",
    unitLabel: "분",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>1분에 넣는 양과 걸리는 시간을 곱하면 언제나 물탱크 전체의 들이가 돼요. 즉 <i class='mv'>xy</i>=720이고, 관계식은 <i class='mv'>y</i>=720/<i class='mv'>x</i>인 반비례예요. <i class='mv'>x</i>=24를 대입하면 <i class='mv'>y</i>=720÷24=<b>30</b>분이에요. 검산으로 24×30=720이 전체 들이와 맞는지 확인하면 완벽하죠.<span class='xh'>계산 함정 격파</span>720에서 24를 빼거나 더하는 계산은 '전체가 고정된 나눗셈 상황'을 담지 못해요. 반비례 활용의 첫걸음은 항상 '무엇이 고정되어 있나'를 찾는 거예요. 여기서는 물탱크의 들이 720 L가 그 고정된 전체예요. 1분에 넣는 양이 많아질수록 시간이 줄어드는 방향까지 확인하면, 답이 720보다 훨씬 작은 것도 자연스럽게 이해돼요.",
    core: "전체가 고정이면 곱이 일정, xy=720이 열쇠예요.",
  },
  {
    // [슬롯 147] 검산: a=xy=3×(−8)=−24 → y=−24/x → x=−2일 때 y=−24÷(−2)=12 ✓
    //  (레슨 드릴 (−2, 6)→−12·xy=−8과 값·세팅 분리).
    id: "m1u3e147",
    lessonId: "m1u3l7",
    type: "num",
    prompt: withVars("y") + "가 " + withVars("x") + "에 반비례하고 " + withVars("x=3") + "일 때 " + withVars("y=−8") + "이에요. " + withVars("x=−2") + "일 때 " + withVars("y") + "의 값을 구하세요.",
    answer: "12",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>반비례에서는 곱 <i class='mv'>xy</i>가 항상 일정하고 그 값이 <i class='mv'>a</i>예요. 주어진 한 쌍으로 <i class='mv'>a</i>=3×(−8)=−24를 확정하면 관계식은 <i class='mv'>y</i>=−24/<i class='mv'>x</i>예요. <i class='mv'>x</i>=−2를 대입하면 <i class='mv'>y</i>=−24÷(−2)=<b>12</b>예요. 음수를 음수로 나누면 양수가 되죠.<span class='xh'>계산 함정 격파</span>부호 실수가 두 군데에서 기다려요. 먼저 <i class='mv'>a</i>를 3×8=24로 계산하면 곱의 음수 부호를 잃고, 마지막 나눗셈에서 −24÷(−2)를 −12로 쓰면 부호 규칙을 놓친 거예요. '음수 곱 양수는 음수, 음수 나누기 음수는 양수'를 소리 내어 확인하며 두 단계를 밟아요. 검산은 (−2)×12=−24로 곱이 <i class='mv'>a</i> 그대로인지 보면 끝이에요.",
    core: "반비례의 a는 곱으로 확정, 부호는 두 번 검사해요.",
  },
  {
    // [슬롯 155] 검산: (가) x 1·3·5 / y 3·9·15는 y/x=3 일정(정비례) · (나) x 3·7·9 /
    //  y 21·9·7은 곱 63·63·63 일정(반비례 a=63) ✓ → 정답 "(나), a=63". 조합 보기 관례
    //  순서 고정 · 정답 두 번째(① 금지 ✓). xy=63은 레슨·다른 슬롯 미사용 값.
    id: "m1u3e155",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt: "두 표 (가), (나) 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>반비례</b>하는 것과 그때의 " + withVars("a") + "(" + withVars("y=a/x") + ")를 짝지은 것은?",
    figure:
      mExamTableFig(["x", "1", "3", "5"], [["y", "3", "9", "15"]], { title: "(가)", aria: "표 (가)의 x와 y의 대응" }) +
      mExamTableFig(["x", "3", "7", "9"], [["y", "21", "9", "7"]], { title: "(나)", aria: "표 (나)의 x와 y의 대응" }),
    options: ["(가), a=3", "(나), a=63", "(나), a=21", "(가), a=15", "(나), a=7"],
    answer: 1,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>반비례인지 확인하는 방법은 <b>곱 검사</b>예요. 표 (나)에서 <i class='mv'>x</i>×<i class='mv'>y</i>를 계산하면 3×21=63, 7×9=63, 9×7=63으로 전부 같아요. 곱이 63으로 일정하므로 (나)가 반비례이고, 그 일정한 곱이 바로 <i class='mv'>a</i>=<b>63</b>이에요.<span class='xh'>오답 하나씩 격파</span>표 (가)는 3÷1=9÷3=15÷5=3으로 나눈 값이 일정한 정비례라서 반비례로 고르면 검사 종류부터 틀린 거예요. '(나), <i class='mv'>a</i>=21'은 첫 열의 <i class='mv'>y</i>값을, '(나), <i class='mv'>a</i>=7'은 마지막 열의 <i class='mv'>y</i>값을 <i class='mv'>a</i>로 착각한 답이에요. 반비례의 <i class='mv'>a</i>는 표의 한 값이 아니라 두 값의 곱이라는 것, 잊지 마세요.",
    core: "반비례 판별은 곱 검사, 그 곱이 곧 a예요.",
  },

  /* ── L8 반비례 그래프: 한 쌍의 매끄러운 곡선 ──────────── */
  {
    // [슬롯 158] 검산: y=−5/x는 a<0이라 제2·4사분면 두 갈래 → 카드 ③. 함정 ① 1·3사분면
    //  곡선(부호 반전)·② 우하향 직선·④ 한 갈래(1사분면만)·⑤ 우상향 직선.
    //  천재07 계보(직선 2·곡선 3 구성) · 정답 ③ (① 금지 ✓).
    id: "m1u3e158",
    lessonId: "m1u3l8",
    type: "mcq",
    prompt: "반비례 관계 " + withVars("y=−5/x") + "의 그래프로 알맞은 것은?",
    figure: mExamRelChoicesFig([
      { inv: 1 },
      { line: { a: -0.8 } },
      { inv: -1 },
      { inv: 1, single: true },
      { line: { a: 0.8 } },
    ]),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 2,
    shuffle: false,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>반비례 그래프는 좌표축에 한없이 가까워지며 뻗는 <b>한 쌍의 매끄러운 곡선</b>이에요. <i class='mv'>a</i>=−5처럼 <i class='mv'>a</i>가 음수이면 <i class='mv'>x</i>와 <i class='mv'>y</i>의 부호가 항상 반대라 제2사분면과 제4사분면에 곡선이 놓여요. 두 조건을 만족하는 카드는 <b>③</b>이에요.<span class='xh'>오답 하나씩 격파</span>'①'은 곡선이지만 제1·3사분면에 있어서 <i class='mv'>a</i>가 양수인 그래프예요. 부호부터 확인하는 습관이 이 함정을 막아요. '②'와 '⑤'는 직선이라 정비례 그래프이고, 반비례가 직선으로 그려지는 일은 없어요. '④'는 곡선이 한 갈래뿐인데, 반비례 그래프는 음수 쪽 짝꿍 곡선까지 항상 한 쌍이라는 것을 기억해요.",
    core: "a<0인 반비례는 2·4사분면의 곡선 한 쌍이에요.",
  },
  {
    // [슬롯 161] 검산: 곡선 y=18/x. ㄱ 참(18÷3=6, 격자 판독 가능) · ㄴ 참(a>0 → 1·3사분면) ·
    //  ㄷ 거짓(반비례는 원점 안 지남) · ㄹ 거짓(축 비접촉) · ㅁ 거짓(x>0에서 x 커지면 y 작아짐).
    //  answer [0,1]. min −9·max 9·labelEvery 1이라 (3, 6) 전부 라벨 눈금 위(±6 격자는 곡선이
    //  x=3부터 시작해 짧은 호로 보이는 시각 지적 → ±9로 확장, 눈검수 반영).
    id: "m1u3e161",
    lessonId: "m1u3l8",
    type: "multi",
    prompt: "그림과 같은 반비례 관계의 그래프에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    figure: mExamRelationPlaneFig({
      min: -9,
      max: 9,
      size: 330,
      labelEvery: 1,
      inverseCurves: [{ a: 18, color: "#364FC7" }],
    }),
    options: [
      "점 (3, 6)을 지나요",
      "제1사분면과 제3사분면을 지나요",
      "원점을 지나요",
      "x축과 한 점에서 만나요",
      "x>0일 때 x의 값이 커지면 y의 값도 커져요",
    ],
    answer: [0, 1],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>격자를 따라가면 곡선이 가로 3칸, 세로 6칸인 격자점을 정확히 지나므로 (3, 6)을 지난다는 설명은 참이에요. 그리고 곡선 한 쌍이 오른쪽 위와 왼쪽 아래, 즉 제1사분면과 제3사분면에 놓여 있으니 두 번째 설명도 참이죠.<span class='xh'>틀린 설명 격파</span>반비례 그래프는 <i class='mv'>x</i>=0을 넣을 수 없어서 원점을 지나지 않아요. 원점 통과는 정비례 직선의 전매특허죠. 또 곡선은 좌표축에 한없이 가까워질 뿐 절대 닿지 않으므로 x축과 만난다는 설명도 틀렸어요. 마지막으로 <i class='mv'>x</i>&gt;0에서 <i class='mv'>x</i>가 커지면 곡선이 점점 내려가 <i class='mv'>y</i>는 작아져요. 곱을 일정하게 지키려면 한쪽이 커질 때 다른 쪽이 작아져야 하기 때문이에요.",
    core: "반비례 곡선은 원점도 축도 건드리지 않아요.",
  },
  {
    // [슬롯 163] 검산: xy=−21인 정수 쌍. 21의 약수 1·3·7·21 → (1,−21)(3,−7)(7,−3)(21,−1)과
    //  부호를 바꾼 (−1,21)(−3,7)(−7,3)(−21,1) = 총 8개 ✓ (미래엔09 y=−12/x·12개의 수치 신작).
    id: "m1u3e163",
    lessonId: "m1u3l8",
    type: "num",
    prompt: "반비례 관계 " + withVars("y=−21/x") + "의 그래프 위의 점 중 " + withVars("x") + "좌표와 " + withVars("y") + "좌표가 <b>모두 정수</b>인 점의 개수를 구하세요.",
    answer: "8",
    numKind: "int",
    unitLabel: "개",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그래프 위의 점은 모두 <i class='mv'>xy</i>=−21을 만족해요. 두 정수의 곱이 −21이 되려면 21의 약수를 이용하면 돼요. 21의 약수는 1, 3, 7, 21의 4개이므로 <i class='mv'>x</i>가 양수인 점은 (1, −21), (3, −7), (7, −3), (21, −1)의 4개예요. 부호를 맞바꾼 (−1, 21), (−3, 7), (−7, 3), (−21, 1)도 곱이 −21이라 4개가 더 있죠. 합해서 <b>8</b>개예요.<span class='xh'>계산 함정 격파</span>양수 쪽 4개만 세고 멈추면 절반을 놓쳐요. 곱이 음수이려면 두 좌표의 부호가 반대여야 하는데, 그 배치가 두 방향이라는 걸 꼭 챙겨요. 반대로 (−1, −21)처럼 둘 다 음수인 쌍을 세면 곱이 +21이 되어 그래프 위의 점이 아니에요. 약수 개수 × 2가 공식처럼 통하는 이유를 부호로 이해해 두면 안전해요.",
    core: "약수 쌍을 세고 부호 배치 두 방향을 곱해요.",
  },
  {
    // [슬롯 165] 검산: D(2, 8)이 곡선 위 → a=2×8=16. 직사각형 가로 2−(−2)=4·세로 8−(−8)=16
    //  → 넓이 4×16=64 ✓ (넓이=4a 구조 · §3-0 확정 (a=16, m=2)). x축 라벨 ±2는 planeSpec
    //  labelEvery 2가 담당 · 문두 넓이 64, 그림엔 a·넓이 미인쇄.
    id: "m1u3e165",
    lessonId: "m1u3l8",
    type: "num",
    prompt:
      "그림과 같이 반비례 관계 " + withVars("y=a/x") + "(" + withVars("a") + "&gt;0)의 그래프 위에 두 점 B, D가 있고, 직사각형 ABCD의 각 변은 " + withVars("x") + "축 또는 " + withVars("y") + "축에 평행해요. 직사각형 ABCD의 넓이가 <b>64</b>일 때, " + withVars("a") + "의 값을 구하세요.",
    figure: rdFig({ a: 16, m: 2 }),
    answer: "16",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그림에서 점 D의 <i class='mv'>x</i>좌표는 2, 점 B의 <i class='mv'>x</i>좌표는 −2예요. 두 점이 원점에 대해 마주 보므로 D를 (2, <i class='mv'>k</i>)라 하면 B는 (−2, −<i class='mv'>k</i>)예요. 직사각형의 가로는 4, 세로는 2<i class='mv'>k</i>이고 넓이가 64이므로 4×2<i class='mv'>k</i>=64에서 <i class='mv'>k</i>=8이에요. D(2, 8)이 그래프 위의 점이므로 <i class='mv'>a</i>=2×8=<b>16</b>이에요.<span class='xh'>계산 함정 격파</span>세로 길이를 <i class='mv'>k</i>로만 잡으면 넓이가 32가 되어 <i class='mv'>a</i>=32라는 오답이 나와요. B가 x축 아래로 똑같이 내려가 있어서 세로는 <i class='mv'>k</i>의 두 배라는 것을 그림에서 확인해요. 마지막에 <i class='mv'>a</i>를 곱 2×8이 아니라 8로 답하는 실수도 잦아요. <i class='mv'>a</i>는 좌표가 아니라 두 좌표의 곱이에요.",
    core: "대칭 직사각형의 세로는 2배, a는 곱으로 마무리!",
  },

  /* ── L9 정비례와 그래프의 활용 ────────────────────────── */
  {
    // [슬롯 181] 검산: 교점의 x좌표 5 → 곡선에서 y=50÷5=10 → P(5, 10) → 10=5a → a=2 ✓
    //  (비상06-8 계보 a=2/3 분수를 정수 재설계 · §2 · 초판 직선 y=3x가 s178 문두 y=3x와
    //  L9 내 관계식 중복 · 검산 V2 적발로 곡선 50·x=5·a=2 재설계). min −12·max 12·
    //  labelEvery 2 · x=5는 문두 인쇄라 판독 불요(168 판례), P의 y=10은 짝수 라벨 위.
    id: "m1u3e181",
    lessonId: "m1u3l9",
    type: "num",
    prompt: "정비례 관계 " + withVars("y=ax") + "의 그래프와 반비례 관계 " + withVars("y=50/x") + "의 그래프가 그림과 같이 점 P에서 만나요. 점 P의 " + withVars("x") + "좌표가 <b>5</b>일 때, " + withVars("a") + "의 값을 구하세요.",
    figure: mExamRelationPlaneFig({
      min: -12,
      max: 12,
      size: 330,
      labelEvery: 2,
      lines: [{ a: 2, color: "#E8547E" }],
      inverseCurves: [{ a: 50, color: "#364FC7" }],
      points: [{ label: "P", x: 5, y: 10, color: "#E8547E", labelDx: 14, labelDy: -6 }],
    }),
    answer: "2",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>점 P는 두 그래프가 함께 지나는 점이에요. 먼저 반비례 쪽에 <i class='mv'>x</i>=5를 넣으면 <i class='mv'>y</i>=50÷5=10이므로 P의 좌표는 (5, 10)이에요. 이 점이 정비례 그래프 위에도 있으므로 10=<i class='mv'>a</i>×5, 즉 <i class='mv'>a</i>=<b>2</b>예요.<span class='xh'>계산 함정 격파</span><i class='mv'>a</i>를 곱 5×10=50으로 계산하면 반비례의 <i class='mv'>a</i>를 구한 셈이 돼요. 정비례의 <i class='mv'>a</i>는 곱이 아니라 <i class='mv'>y</i>÷<i class='mv'>x</i>=10÷5라는 것, 두 관계식의 <i class='mv'>a</i> 구하는 법이 서로 반대라는 것을 구분해요. 또 P의 y좌표 10을 곧바로 <i class='mv'>a</i>로 착각하지 않도록, '교점은 두 식을 모두 만족한다'는 원리로 한 식씩 차례로 대입하는 순서를 지켜요.",
    core: "교점은 두 그래프의 공용 점, 한 식씩 대입해요.",
  },
  {
    // [슬롯 183] 검산: 형 150÷5=30초·동생 150÷3=50초 → 차 50−30=20초 ✓ (레슨 지진 P·S파
    //  구조(속력 두 정비례의 도착 차)를 달리기 소재로 교체 · §2 파생값 회피).
    //  그래프 (0,0)→(30,150)·(0,0)→(50,150) 전 꺾임점 라벨 눈금 위.
    id: "m1u3e183",
    lessonId: "m1u3l9",
    type: "num",
    prompt: "형과 동생이 동시에 출발해 <b>150 m</b> 달리기를 했어요. 형은 1초에 5 m, 동생은 1초에 3 m를 일정하게 달렸을 때, 형이 도착한 뒤 <b>몇 초 후</b>에 동생이 도착하는지 구하세요.",
    figure: mExamChangeGraphFig({
      xMin: 0,
      xMax: 50,
      yMin: 0,
      yMax: 150,
      xTicks: [0, 10, 20, 30, 40, 50],
      yTicks: [0, 50, 100, 150],
      xLabel: "시간(초)",
      yLabel: "거리(m)",
      series: [
        { points: [[0, 0], [30, 150]], label: "형", color: "#E8547E" },
        { points: [[0, 0], [50, 150]], label: "동생", color: "#364FC7" },
      ],
    }),
    answer: "20",
    numKind: "int",
    unitLabel: "초",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>두 사람 모두 일정한 빠르기로 달리므로 달린 거리는 시간에 정비례해요. 형은 <i class='mv'>y</i>=5<i class='mv'>x</i>, 동생은 <i class='mv'>y</i>=3<i class='mv'>x</i>예요. 150 m 지점에 닿는 시각은 형이 150=5<i class='mv'>x</i>에서 30초, 동생이 150=3<i class='mv'>x</i>에서 50초예요. 따라서 동생은 형보다 50−30=<b>20</b>초 늦게 도착해요. 그래프에서도 형의 직선이 더 가파르게 올라가 150에 먼저 닿는 것이 보여요.<span class='xh'>계산 함정 격파</span>두 사람의 빠르기 차 5−3=2를 이용해 150÷2=75초라고 하면, '같은 시각에 벌어진 거리'와 '도착 시각의 차'를 섞은 오답이 돼요. 이 문제는 각자의 도착 시각을 먼저 구한 뒤 빼는 두 단계가 정석이에요. 가파른 직선일수록 빠른 사람이라는 것도 함께 기억해요.",
    core: "각자 도착 시각부터, 차는 마지막에 빼요.",
  },
  {
    // [슬롯 184] 검산: A는 y=−(1/2)x 위·y좌표 4 → 4=−(1/2)x → x=−8 → A(−8, 4). B는 y=x
    //  위 → B(4, 4). AB=4−(−8)=12(수평선 y=4), 높이=원점에서 4 → 넓이 12×4÷2=24 ✓
    //  (비상06-7 두 직선+수평선 계보 · 수치 신작). min −10·max 10·labelEvery 2로 −8·4가
    //  짝수 라벨 위(초판 min −9는 홀수 라벨만 인쇄되는 planeSpec 홀짝 함정 · 검산 V2 적발).
    //  y=4 연회색 수평 보조선이 선분 AB를 시각화(교과서 원형의 선분 표시 · 눈검수 반영).
    id: "m1u3e184",
    lessonId: "m1u3l9",
    type: "mcq",
    prompt:
      "그림과 같이 두 정비례 관계 " + withVars("y=x") + ", " + withVars("y=−(1/2)x") + "의 그래프가 " + withVars("y") + "좌표가 <b>4</b>인 두 점 B, A를 각각 지나요. 삼각형 OAB의 넓이는? (단, 점 O는 원점이에요.)",
    figure: mExamRelationPlaneFig({
      min: -10,
      max: 10,
      size: 330,
      labelEvery: 2,
      lines: [
        { a: 1, color: "#E8547E" },
        { a: -0.5, color: "#364FC7" },
        { a: 0, b: 4, color: "#B8C2D8" },
      ],
      points: [
        { label: "A", x: -8, y: 4, color: "#364FC7", labelDx: -4, labelDy: -8 },
        { label: "B", x: 4, y: 4, color: "#E8547E", labelDx: 12, labelDy: -6 },
      ],
    }),
    options: ["24", "12", "48", "16", "20"],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>두 점의 좌표부터 구해요. B는 <i class='mv'>y</i>=<i class='mv'>x</i> 위의 점이고 <i class='mv'>y</i>좌표가 4이므로 B(4, 4)예요. A는 <i class='mv'>y</i>=−(1/2)<i class='mv'>x</i> 위의 점이므로 4=−(1/2)<i class='mv'>x</i>에서 <i class='mv'>x</i>=−8, 즉 A(−8, 4)예요. 선분 AB는 높이 4에 놓인 수평 선분이라 길이가 4−(−8)=12이고, 원점 O에서 이 선분까지의 거리는 4예요. 넓이는 12×4÷2=<b>24</b>예요.<span class='xh'>오답 하나씩 격파</span>'48'은 밑변 곱 높이에서 2로 나누기를 빠뜨린 값이고, '12'는 밑변 길이를 그대로 답한 거예요. '16'은 A의 x좌표를 −4로 잘못 구했을 때 나오는 값이에요. −(1/2)<i class='mv'>x</i>=4를 풀 때 양변에 −2를 곱하는 부호 처리가 이 문제의 급소예요.",
    core: "수평 선분이 밑변이면 높이는 y좌표 그 자체예요.",
  },
  {
    // [슬롯 194] 검산: 곡선 y=20/x에 x=2를 넣으면 P(2, 10) → 직선 10=2a → a=5 ✓.
    //  보기 오답 = 10(y좌표)·2(x좌표)·40(곱 = 반비례 a 착각)·1/5(역수). min −12·max 12·
    //  labelEvery 2로 2·10 라벨 위(±10 격자는 P가 상단 경계 밀착 → ±12 여유, 눈검수 반영).
    id: "m1u3e194",
    lessonId: "m1u3l9",
    type: "mcq",
    prompt: "그림과 같이 정비례 관계 " + withVars("y=ax") + "의 그래프와 반비례 관계 " + withVars("y=20/x") + "의 그래프가 점 P에서 만나요. 점 P의 " + withVars("x") + "좌표가 <b>2</b>일 때, " + withVars("a") + "의 값은?",
    figure: mExamRelationPlaneFig({
      min: -12,
      max: 12,
      size: 330,
      labelEvery: 2,
      lines: [{ a: 5, color: "#E8547E" }],
      inverseCurves: [{ a: 20, color: "#364FC7" }],
      points: [{ label: "P", x: 2, y: 10, color: "#E8547E", labelDx: 14, labelDy: -4 }],
    }),
    options: ["5", "10", "2", "40", "1/5"],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>교점 P는 두 그래프를 모두 만족해요. 반비례 관계에 <i class='mv'>x</i>=2를 대입하면 <i class='mv'>y</i>=20÷2=10이므로 P(2, 10)이에요. 이 점을 정비례 관계에 대입하면 10=<i class='mv'>a</i>×2, <i class='mv'>a</i>=<b>5</b>예요.<span class='xh'>오답 하나씩 격파</span>'10'은 P의 y좌표를 그대로 <i class='mv'>a</i>로 착각한 답이고, '2'는 x좌표를 답한 거예요. '40'은 2×10, 즉 곱을 계산한 값인데 그건 반비례 쪽 <i class='mv'>a</i>=20을 구할 때나 쓰는 방법이고 여기 곱은 이미 20으로 주어져 있으니 이중으로 어긋나요. '1/5'은 <i class='mv'>x</i>÷<i class='mv'>y</i>로 거꾸로 나눈 값이에요. 정비례의 <i class='mv'>a</i>는 <i class='mv'>y</i>÷<i class='mv'>x</i>, 반비례의 <i class='mv'>a</i>는 <i class='mv'>x</i>×<i class='mv'>y</i>라는 두 공식을 나란히 두고 구분해요.",
    core: "곡선으로 P를 완성하고 직선으로 a를 구해요.",
  },
  {
    // [슬롯 199] 검산: 직선 y=(4/3)x·곡선 y=48/x → 교점 (6, 8)·(−6, −8) (검산: (4/3)×6=8 ✓
    //  6×8=48 ✓). ㄱ 참(교점 판독)·ㄴ 참(원점 대칭 교점, 그림에 표시)·ㄷ 참(정비례 직선) ·
    //  ㄹ 거짓(a>0 곡선은 1·3사분면)·ㅁ 거짓(교점 두 개, 그림). min −10·max 10·labelEvery 2.
    id: "m1u3e199",
    lessonId: "m1u3l9",
    type: "multi",
    prompt: "그림은 정비례 관계와 반비례 관계의 그래프예요. 옳은 것을 <b>모두</b> 고르세요.",
    figure: mExamRelationPlaneFig({
      min: -10,
      max: 10,
      size: 330,
      labelEvery: 2,
      lines: [{ a: 4 / 3, color: "#E8547E" }],
      inverseCurves: [{ a: 48, color: "#364FC7" }],
      points: [
        { label: "P", x: 6, y: 8, color: "#E8547E", labelDx: 13, labelDy: -6 },
        { label: "Q", x: -6, y: -8, color: "#E8547E", labelDx: -13, labelDy: 16 },
      ],
    }),
    options: [
      "점 P의 좌표는 (6, 8)이에요",
      "두 그래프는 점 Q(−6, −8)에서도 만나요",
      "정비례 관계의 그래프는 원점을 지나요",
      "반비례 관계의 그래프는 제2사분면을 지나요",
      "두 그래프가 만나는 점은 한 개뿐이에요",
    ],
    answer: [0, 1, 2],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>격자에서 점 P를 읽으면 가로 6, 세로 8이라 (6, 8)이 맞아요. 정비례 직선과 반비례 곡선은 원점에 대해 서로 반대쪽에서도 만나므로, 그림처럼 P와 부호만 바꾼 Q(−6, −8)이 두 번째 교점이 돼요. 그리고 정비례 그래프가 원점을 지나는 직선이라는 것은 언제나 참이죠.<span class='xh'>틀린 설명 격파</span>이 반비례 곡선은 제1사분면과 제3사분면에 놓여 있어요. 제2사분면을 지나는 건 <i class='mv'>a</i>가 음수일 때예요. '교점이 한 개뿐'이라는 설명은 그림의 Q를 놓친 거예요. 직선과 곡선이 제1사분면에서 만나면 제3사분면의 대칭 지점에서도 반드시 다시 만나요. 두 그래프 모두 원점 반대편까지 뻗어 있다는 것을 잊지 마세요.",
    core: "직선과 곡선의 교점은 원점 반대편에 짝이 있어요.",
  },
];
