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

export { axes as g1Axes, wrap as g1Wrap, line as g1Line, tag as g1Tag, ROSE as G1_ROSE, BLUE as G1_BLUE, TX as G1_TX, DIM as G1_DIM, AX as G1_AX, NS as G1_NS };
