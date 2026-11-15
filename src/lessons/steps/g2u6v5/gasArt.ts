// [중2 Ⅵ v5] 기체 교환 랩(g2u6GasLab, breathLabs.ts)의 무대 그림(2026-11-15, 그래픽 감사 C087).
//
// 무대를 두 칸으로 나눴다: 왼쪽은 모세혈관이 감싼 허파꽈리, 오른쪽은 조직세포 곁을 지나는 모세혈관. 두 칸 사이에는 "심장을 거쳐" 가는 길 표시만 둔다
// (옛 판은 허파꽈리와 조직세포를 모세혈관 한 줄로 바로 이어 두 곳이 붙어 있는 것처럼 보였다).
// 과학 가드(순환 여행 랩과 같다): 산소는 적혈구에 붙어 실리고, 이산화 탄소는 적혈구 밖 혈장에 녹아 실린다.
// 혈액의 색은 모세혈관을 지나는 동안만 바뀐다: 허파에서는 들어오는 쪽(산소가 적은 색)에서 나가는 쪽(많은 색)으로, 조직에서는 그 반대.
// 그래서 교환한 칸의 관은 들어오는 쪽과 나가는 쪽의 색이 다르고, 세 적혈구가 교환의 앞, 가운데, 뒤를 보여 준다.
// 색은 단원 팔레트(kit.P): 산소 P.o2, 이산화 탄소 P.co2, 혈액 P.red, P.dark. 조직세포는 RC.cell.

import { P, tag, txt } from "./kit";
import { RC } from "./rideStage";

type Pt = [number, number];
export interface GasView {
  /** 지금 혈액이 있는 곳 */
  site: "lung" | "cell";
  lungDone: boolean;
  cellDone: boolean;
  /** 거꾸로 고른 곳(깜빡이는 가위표 화살) */
  miss: "" | "lung" | "cell";
  /** 판정과 결론: 두 칸을 다 밝힌다 */
  final: boolean;
  ns: string;
}

const RICH_RBC = "#E8505B";
const POOR_RBC = "#9C5A86";
const RICH_LUMEN = "#5A2630";
const POOR_LUMEN = "#3F2A4A";
const O2_LINE = "#2F6FA8";
const CO2_LINE = "#6A55B8";
// 칸: 왼쪽(허파꽈리) x 6~160, 오른쪽(조직세포) x 186~340, 위아래 y 6~176
const PY0 = 6, PY1 = 176;
const LX = 6, RX = 186, PW = 154;
/** 칸 안 모세혈관의 중심선(왼쪽에서 들어와 오른쪽으로 나간다): 가운데가 조금 올라간 활 */
const capAt = (x0: number, t: number): Pt => {
  const a: Pt = [x0, 148], c: Pt = [x0 + PW / 2, 126], b: Pt = [x0 + PW, 148];
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
};
const capPath = (x0: number): string => `M${x0 - 2} 148 Q${x0 + PW / 2} 126 ${x0 + PW + 2} 148`;
const f1 = (v: number): string => String(Math.round(v * 10) / 10);
const dot = (p: Pt, r: number, fill: string, line: string, cls = ""): string =>
  `<circle${cls ? ` class="${cls}"` : ""} cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" fill="${fill}" stroke="${line}" stroke-width="1.1"/>`;
/** 적혈구 하나와 거기에 붙은 산소(n개) */
function rbc(p: Pt, rich: number, o2: number, cls = ""): string {
  const col = rich >= 1 ? RICH_RBC : rich <= 0 ? POOR_RBC : "#C4566E";
  let s = `<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="14" ry="9.5" fill="${col}" stroke="#fff" stroke-width="1.3"/><ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="6" ry="3.6" fill="#000" opacity=".14"/>`;
  const spots: Pt[] = [[-7, -2.5], [7, -2.5], [-2.5, 3], [2.5, -4.5]];
  for (let i = 0; i < o2; i++) s += dot([p[0] + spots[i][0], p[1] + spots[i][1]], 3.1, P.o2, O2_LINE);
  return cls ? `<g class="${cls}">${s}</g>` : s;
}
const arrowV = (x: number, y0: number, y1: number, color: string, cls = "", w = 3): string => {
  const d = y1 > y0 ? 1 : -1;
  return `<g${cls ? ` class="${cls}"` : ""}><line x1="${x}" y1="${y0}" x2="${x}" y2="${y1 - d * 7}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/><polygon points="${x},${y1} ${x - 5.5},${y1 - d * 9} ${x + 5.5},${y1 - d * 9}" fill="${color}"/></g>`;
};
/** 거꾸로 고른 방향(가위표를 친 화살) */
const missArrow = (x: number, y0: number, y1: number, color: string): string => {
  const m = (y0 + y1) / 2;
  return `${arrowV(x, y0, y1, color, "", 2.6)}<path d="M${x - 7} ${m - 7} l14 14 M${x + 7} ${m - 7} l-14 14" stroke="${P.bad}" stroke-width="3.2" stroke-linecap="round"/>`;
};

/** 모세혈관(벽과 속). from과 to는 들어오는 쪽과 나가는 쪽의 속 색(같으면 한 색) */
function capillary(x0: number, ns: string, id: string, from: string, to: string, empty = false): string {
  const g = `${ns}-${id}`;
  const fill = empty ? "#1C2840" : from === to ? from : `url(#${g})`;
  return (
    `<linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="${x0 + 20}" y1="0" x2="${x0 + PW - 20}" y2="0"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>` +
    `<path d="${capPath(x0)}" fill="none" stroke="#F2A3AE" stroke-opacity=".75" stroke-width="30" stroke-linecap="butt"/>` +
    `<path d="${capPath(x0)}" fill="none" stroke="${fill}" stroke-width="24" stroke-linecap="butt"/>`
  );
}
/** 혈액이 흐르는 방향 표시(관 아래 작은 화살) */
const flowMark = (x0: number, color: string): string =>
  `<path d="M${x0 + PW - 46} 168 L${x0 + PW - 18} 168" stroke="${color}" stroke-width="2" stroke-linecap="round"/><polygon points="${x0 + PW - 12},168 ${x0 + PW - 20},164 ${x0 + PW - 20},172" fill="${color}"/>`;

export function gasSvg(v: GasView): string {
  const { site, lungDone, cellDone, miss, final, ns } = v;
  const lungOn = final || site === "lung";
  const cellOn = final || site === "cell";
  let out = "";
  // ── 칸 바탕 ──
  const panel = (x: number, on: boolean): string =>
    `<rect x="${x}" y="${PY0}" width="${PW}" height="${PY1 - PY0}" rx="14" fill="#0F1C31" stroke="${on ? "#5D7BA8" : "#263B5C"}" stroke-width="${on ? 1.6 : 1.2}"/>`;
  out += panel(LX, lungOn) + panel(RX, cellOn);

  // ── 왼쪽: 허파꽈리 ──
  let L = "";
  L += `<circle cx="83" cy="74" r="50" fill="rgba(124,200,255,.10)" stroke="#9AD1F5" stroke-width="2"/>`;
  const alvO2: Pt[] = lungDone ? [[62, 56], [104, 58]] : [[58, 56], [83, 50], [108, 56], [62, 80], [104, 82], [83, 96]];
  alvO2.forEach((p) => (L += dot(p, 5.5, P.o2, O2_LINE)));
  if (lungDone) ([[70, 82], [96, 84], [83, 104]] as Pt[]).forEach((p) => (L += dot(p, 5.5, P.co2, CO2_LINE, "g2u6x-pop")));
  L += capillary(LX, ns, "lc", lungDone ? POOR_LUMEN : POOR_LUMEN, lungDone ? RICH_LUMEN : POOR_LUMEN);
  if (lungDone) {
    // 교환의 앞(들어오는 쪽), 가운데, 뒤(나가는 쪽)
    L += rbc(capAt(LX, 0.17), 0, 0) + dot(capAt(LX, 0.06), 3.6, P.co2, CO2_LINE) + dot(capAt(LX, 0.28), 3.6, P.co2, CO2_LINE);
    L += rbc(capAt(LX, 0.5), 0.5, 2, "g2u6x-pop") + dot(capAt(LX, 0.39), 3.6, P.co2, CO2_LINE);
    L += rbc(capAt(LX, 0.83), 1, 4, "g2u6x-pop");
    L += arrowV(71, 92, 136, P.o2, "g2u6x-pop") + arrowV(96, 136, 96, P.co2, "g2u6x-pop");
  } else if (site === "lung") {
    [0.17, 0.5, 0.83].forEach((t) => (L += rbc(capAt(LX, t), 0, 0)));
    [0.06, 0.29, 0.39, 0.62, 0.72].forEach((t) => (L += dot(capAt(LX, t), 3.6, P.co2, CO2_LINE)));
  }
  if (miss === "lung") L += `<g class="g2u6x-blink">${missArrow(71, 136, 96, P.o2)}${missArrow(96, 96, 136, P.co2)}</g>`;
  L += flowMark(LX, lungDone ? P.red : P.dark);
  L += tag(46, 24, "허파꽈리", { size: 12 });
  out += `<g opacity="${lungOn ? 1 : 0.5}">${L}</g>`;

  // ── 오른쪽: 조직세포 ──
  let R = "";
  R += `<ellipse cx="230" cy="80" rx="36" ry="38" fill="${RC.cell}" fill-opacity=".14" stroke="${RC.cell}" stroke-width="2"/><circle cx="224" cy="70" r="11" fill="${RC.cell}" fill-opacity=".45" stroke="${RC.cell}" stroke-width="1.3"/>`;
  R += `<ellipse cx="304" cy="84" rx="30" ry="34" fill="${RC.cell}" fill-opacity=".14" stroke="${RC.cell}" stroke-width="2"/><circle cx="308" cy="76" r="9" fill="${RC.cell}" fill-opacity=".45" stroke="${RC.cell}" stroke-width="1.3"/>`;
  const cellCo2: Pt[] = cellDone ? [[292, 102]] : [[208, 60], [246, 58], [212, 98], [250, 96], [292, 104]];
  cellCo2.forEach((p) => (R += dot(p, 5.5, P.co2, CO2_LINE)));
  if (cellDone) ([[214, 96], [246, 92], [292, 64], [318, 104]] as Pt[]).forEach((p) => (R += dot(p, 5.5, P.o2, O2_LINE, "g2u6x-pop")));
  const arrived = site === "cell";
  R += capillary(RX, ns, "rc", RICH_LUMEN, cellDone ? POOR_LUMEN : RICH_LUMEN, !arrived);
  if (cellDone) {
    R += rbc(capAt(RX, 0.17), 1, 4);
    R += rbc(capAt(RX, 0.5), 0.5, 2, "g2u6x-pop") + dot(capAt(RX, 0.61), 3.6, P.co2, CO2_LINE, "g2u6x-pop");
    R += rbc(capAt(RX, 0.83), 0, 0, "g2u6x-pop") + dot(capAt(RX, 0.72), 3.6, P.co2, CO2_LINE, "g2u6x-pop") + dot(capAt(RX, 0.94), 3.6, P.co2, CO2_LINE, "g2u6x-pop");
    R += arrowV(240, 134, 102, P.o2, "g2u6x-pop") + arrowV(264, 104, 134, P.co2, "g2u6x-pop");
  } else if (arrived) [0.17, 0.5, 0.83].forEach((t) => (R += rbc(capAt(RX, t), 1, 4, "g2u6x-pop")));
  if (miss === "cell") R += `<g class="g2u6x-blink">${missArrow(240, 102, 134, P.o2)}${missArrow(264, 134, 104, P.co2)}</g>`;
  if (arrived) R += flowMark(RX, cellDone ? P.dark : P.red);
  R += tag(226, 24, "조직세포", { size: 12 });
  out += `<g opacity="${cellOn ? 1 : 0.5}">${R}</g>`;

  // ── 두 칸 사이: 심장을 거쳐 가는 길 ──
  const via = lungDone;
  out += `<path class="${via && site === "cell" && !final ? "g2u6x-pop" : ""}" d="M160 148 C172 150 162 186 173 188 C184 186 174 150 186 148" fill="none" stroke="${via ? P.red : "#3B5273"}" stroke-width="3" stroke-dasharray="${via ? "6 4" : "3 5"}" stroke-linecap="round"/>`;
  out += `<polygon points="187,148 179,143 180,153" fill="${via ? P.red : "#3B5273"}"/>`;
  out += txt(173, 203, "심장을 거쳐", { size: 12, fill: via ? P.hi : P.dim });
  // ── 범례 ──
  out += `${dot([110, 221], 5, P.o2, O2_LINE)}${txt(119, 225.5, "산소(적혈구)", { anchor: "start", size: 12, fill: P.hi })}${dot([206, 221], 5, P.co2, CO2_LINE)}${txt(215, 225.5, "이산화 탄소(혈장)", { anchor: "start", size: 12, fill: P.hi })}`;
  return out;
}
