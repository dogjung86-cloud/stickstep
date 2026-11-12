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

export { axes as g1Axes, wrap as g1Wrap, line as g1Line, tag as g1Tag, ROSE as G1_ROSE, BLUE as G1_BLUE, TX as G1_TX, DIM as G1_DIM, AX as G1_AX, NS as G1_NS };
