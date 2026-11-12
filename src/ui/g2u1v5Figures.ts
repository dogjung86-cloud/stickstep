// 중2 Ⅰ v5의 문제 그림(흰 카드 위의 SVG). 모든 좌표는 계산으로 놓는다. 수치는 이 단원에서 정한 값과 자연값이다.
// 그림의 aria-label에는 답이 드러나는 말을 넣지 않는다.

const NS = `xmlns="http://www.w3.org/2000/svg"`;
const AX = "#B0B8C1";
const GRID = "#EDF0F4";
const TX = "#4E5968";
const DIM = "#8B95A1";
const ROSE = "#E64980";
const BLUE = "#3182F6";

interface Axes {
  svg: string;
  gx: (v: number) => number;
  gy: (v: number) => number;
}
/** 밝은 그래프 축. 그림 영역은 x 52~326, y 16~168(전체 344×204). */
function axes(o: { x1: number; y0?: number; y1: number; xt: number[]; yt: number[]; xl: string; yl: string; x0?: number }): Axes {
  const x0 = o.x0 ?? 0;
  const y0 = o.y0 ?? 0;
  const gx = (v: number): number => 52 + ((v - x0) / (o.x1 - x0)) * 266;
  const gy = (v: number): number => 168 - ((v - y0) / (o.y1 - y0)) * 146;
  const svg = `<line x1="52" y1="12" x2="52" y2="168" stroke="${AX}" stroke-width="1.6"/><line x1="52" y1="168" x2="326" y2="168" stroke="${AX}" stroke-width="1.6"/>
    ${o.yt.map((v) => `<line x1="52" y1="${gy(v).toFixed(1)}" x2="322" y2="${gy(v).toFixed(1)}" stroke="${GRID}"/><text x="46" y="${(gy(v) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="${DIM}">${String(v).replace("-", "−")}</text>`).join("")}
    ${o.xt.map((v) => `<text x="${gx(v).toFixed(1)}" y="184" text-anchor="middle" font-size="11" fill="${DIM}">${v}</text>`).join("")}
    <text x="8" y="11" font-size="11.5" fill="${TX}">${o.yl}</text><text x="326" y="200" text-anchor="end" font-size="11.5" fill="${TX}">${o.xl}</text>`;
  return { svg, gx, gy };
}
const wrap = (label: string, body: string, h = 204): string => `<svg viewBox="0 0 344 ${h}" ${NS} fill="none" role="img" aria-label="${label}">${body}</svg>`;
const line = (pts: Array<[number, number]>, a: Axes, color: string, w = 2.6): string =>
  `<polyline points="${pts.map(([x, y]) => `${a.gx(x).toFixed(1)},${a.gy(y).toFixed(1)}`).join(" ")}" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tag = (x: number, y: number, t: string, color = TX, size = 12.5): string => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${color}">${t}</text>`;

/** g2u1l1: 고체 A~E의 부피와 질량. A, B, E는 3 g/cm³로 같은 직선 위에 있다. */
export function g1ScatterFig(): string {
  const a = axes({ x1: 40, y1: 100, xt: [10, 20, 30, 40], yt: [20, 40, 60, 80, 100], xl: "부피(cm³)", yl: "질량(g)" });
  const pts: [string, number, number][] = [["A", 10, 30], ["B", 20, 60], ["C", 10, 60], ["D", 30, 60], ["E", 30, 90]];
  return wrap(
    "고체 A, B, C, D, E의 부피와 질량을 점으로 나타낸 그래프",
    a.svg + pts.map(([t, v, m]) => `<circle cx="${a.gx(v)}" cy="${a.gy(m)}" r="5" fill="${ROSE}"/>${tag(a.gx(v) + 13, a.gy(m) + 4, t)}`).join(""),
  );
}

// ── 용해도(g/물 100 g, 자연값). 표의 값 사이는 로그 눈금에서 곧게 이어 매끄러운 곡선으로 만든다. 랩과 문제 그림이 함께 쓴다. ──
const KNO3: Array<[number, number]> = [[0, 13.3], [20, 31.6], [40, 63.9], [60, 110], [80, 169]];
const NACL: Array<[number, number]> = [[0, 35.7], [20, 36.0], [40, 36.6], [60, 37.3], [80, 38.4]];
function interp(tab: Array<[number, number]>, t: number): number {
  const x = Math.max(0, Math.min(80, t));
  const i = Math.min(tab.length - 2, Math.floor(x / 20));
  const [t0, s0] = tab[i];
  const [t1, s1] = tab[i + 1];
  return Math.exp(Math.log(s0) + ((Math.log(s1) - Math.log(s0)) * (x - t0)) / (t1 - t0));
}
/** 질산 칼륨의 용해도(g/물 100 g) */
export const kno3 = (t: number): number => interp(KNO3, t);
/** 염화 나트륨의 용해도(g/물 100 g) */
export const nacl = (t: number): number => interp(NACL, t);
const curveOf = (fn: (t: number) => number): Array<[number, number]> => Array.from({ length: 21 }, (_, i) => [i * 4, fn(i * 4)] as [number, number]);

/** g2u1l2: 세 액체 (가), (나), (다)의 층과 물체 X, Y. X는 (가)와 (나) 사이, Y는 바닥. */
export function g1LayersFig(): string {
  const L = [["(가)", "#D9CCFF"], ["(나)", "#FFE8A3"], ["(다)", "#BFE0FF"]];
  const x = 112, w = 120, y0 = 22, h = 48;
  let s = "";
  L.forEach(([n, c], i) => {
    s += `<rect x="${x}" y="${y0 + i * h}" width="${w}" height="${h}" fill="${c}"/>${tag(x + w + 26, y0 + i * h + h / 2 + 4, n)}`;
  });
  s += `<path d="M${x} 12 V${y0 + 3 * h} a6 6 0 0 0 6 6 h${w - 12} a6 6 0 0 0 6 -6 V12" stroke="${AX}" stroke-width="2.4"/>`;
  s += `<rect x="${x + 30}" y="${y0 + h - 12}" width="24" height="24" rx="4" fill="#fff" stroke="${TX}" stroke-width="1.6"/>${tag(x + 42, y0 + h + 5, "X", TX, 12)}`;
  s += `<circle cx="${x + 84}" cy="${y0 + 3 * h - 12}" r="12" fill="#fff" stroke="${TX}" stroke-width="1.6"/>${tag(x + 84, y0 + 3 * h - 8, "Y", TX, 12)}`;
  return wrap("세 액체 가, 나, 다가 위에서부터 차례로 층을 이룬 컵. 물체 X는 가와 나 사이에, 물체 Y는 바닥에 있다", s, 184);
}

/** g2u1l3: 질산 칼륨의 용해도 곡선과 점 A(60 ℃, 60 g). */
export function g1SolPointFig(): string {
  const a = axes({ x1: 80, y1: 160, xt: [20, 40, 60, 80], yt: [40, 80, 120, 160], xl: "온도(℃)", yl: "용해도(g/물 100 g)" });
  return wrap(
    "질산 칼륨의 용해도 곡선과 점 A. A는 60도, 60그램 자리에 있다",
    a.svg + line(curveOf(kno3), a, ROSE) + tag(a.gx(70), a.gy(kno3(70)) - 10, "질산 칼륨", ROSE, 12) + `<circle cx="${a.gx(60)}" cy="${a.gy(60)}" r="5" fill="${BLUE}"/>${tag(a.gx(60) + 13, a.gy(60) + 4, "A", BLUE)}`,
  );
}

/** 가열 곡선 한 줄: t0 ℃에서 오르다가 stop ℃에서 a~b분 동안 멈추고 다시 오른다(drift는 멈춘 구간에서 오르는 정도). */
const heatPts = (t0: number, stop: number, a: number, b: number, end: number, tMax: number, drift = 0): Array<[number, number]> => [[0, t0], [a, stop], [b, stop + drift], [tMax, end]];

/** g2u1l5: 고체 A~D의 가열 곡선. A와 C는 50 ℃에서, B는 70 ℃에서, D는 60 ℃에서 멈춘다. */
export function g1HeatFig(): string {
  const a = axes({ x1: 12, y0: 20, y1: 90, xt: [2, 4, 6, 8, 10, 12], yt: [30, 50, 70, 90], xl: "가열 시간(분)", yl: "온도(℃)" });
  const C: Array<[string, Array<[number, number]>, string]> = [
    ["A", heatPts(25, 50, 2, 4, 84, 8), ROSE],
    ["B", heatPts(25, 70, 3, 6, 88, 9), BLUE],
    ["C", heatPts(25, 50, 4, 9, 66, 12), "#F08C00"],
    ["D", heatPts(25, 60, 5, 8, 80, 12), "#2F9E44"],
  ];
  return wrap(
    "고체 A, B, C, D를 가열할 때 시간에 따른 온도 그래프. 네 곡선 모두 중간에 온도가 일정한 구간이 있다",
    a.svg + C.map(([t, p, c]) => line(p, a, c) + tag(a.gx(p[3][0]) - 4, a.gy(p[3][1]) - 7, t, c)).join(""),
  );
}

/** g2u1l6: 액체 (가), (나), (다)의 가열 곡선. (가)는 78 ℃, (다)는 100 ℃에서 멈추고 (나)는 끓는 동안에도 계속 오른다. */
export function g1BoilFig(): string {
  const a = axes({ x1: 12, y0: 40, y1: 110, xt: [2, 4, 6, 8, 10, 12], yt: [50, 70, 90, 110], xl: "가열 시간(분)", yl: "온도(℃)" });
  const C: Array<[string, Array<[number, number]>, string]> = [
    ["(가)", [[0, 45], [3, 78], [12, 78]], ROSE],
    ["(나)", [[0, 45], [4, 84], [12, 97]], "#F08C00"],
    ["(다)", [[0, 45], [5, 100], [12, 100]], BLUE],
  ];
  return wrap(
    "액체 가, 나, 다를 가열할 때 시간에 따른 온도 그래프. 세 액체 모두 꺾인 뒤부터 끓고 있다",
    a.svg + C.map(([t, p, c]) => line(p, a, c) + (t === "(나)" ? tag(a.gx(7.4), a.gy(89.5) - 12, t, c) : tag(a.gx(11), a.gy(p[2][1]) - 7, t, c))).join(""),
  );
}

/** g2u1l8: 질산 칼륨과 염화 나트륨의 용해도 곡선. */
export function g1TwoSolFig(): string {
  const a = axes({ x1: 80, y1: 160, xt: [20, 40, 60, 80], yt: [40, 80, 120, 160], xl: "온도(℃)", yl: "용해도(g/물 100 g)" });
  return wrap(
    "질산 칼륨과 염화 나트륨의 용해도 곡선. 질산 칼륨의 곡선은 가파르게 오르고 염화 나트륨의 곡선은 거의 평평하다",
    a.svg + line(curveOf(kno3), a, ROSE) + line(curveOf(nacl), a, BLUE) + tag(a.gx(62), a.gy(kno3(70)) - 4, "질산 칼륨", ROSE, 12) + tag(a.gx(66), a.gy(38) - 8, "염화 나트륨", BLUE, 12),
  );
}

/** g2u1l9: 물과 에탄올 혼합물의 가열 곡선. 구간 A(오름), B(78 ℃쯤에서 거의 일정), C(다시 오름), D(100 ℃에서 일정). */
export function g1DistillFig(): string {
  const a = axes({ x1: 24, y0: 20, y1: 110, xt: [6, 12, 18, 24], yt: [40, 60, 80, 100], xl: "가열 시간(분)", yl: "온도(℃)" });
  const p: Array<[number, number]> = [[0, 25], [6, 78], [12, 81], [15, 100], [24, 100]];
  const seg = (x0: number, x1: number, t: string): string => `<line x1="${a.gx(x0)}" y1="16" x2="${a.gx(x0)}" y2="168" stroke="${AX}" stroke-dasharray="3 3"/>${tag((a.gx(x0) + a.gx(x1)) / 2, 30, t)}`;
  return wrap(
    "물과 에탄올 혼합물을 가열할 때 시간에 따른 온도 그래프. 구간 A에서 오르고, B에서 거의 일정하고, C에서 다시 오르고, D에서 일정하다",
    a.svg + seg(0, 6, "A") + seg(6, 12, "B") + seg(12, 15, "C") + seg(15, 24, "D") + line(p, a, ROSE),
  );
}

export { axes as g1Axes, wrap as g1Wrap, line as g1Line, tag as g1Tag, ROSE as G1_ROSE, BLUE as G1_BLUE, TX as G1_TX, DIM as G1_DIM, AX as G1_AX, NS as G1_NS };
