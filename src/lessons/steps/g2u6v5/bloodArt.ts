// [중2 Ⅵ v5] 혈액 성분 랩(g2u6BloodLab, circLabs.ts)의 무대 그림(2026-11-15, 그래픽 감사 C084).
//
// 왼쪽은 가라앉힌 시험관(혈장과 혈구), 오른쪽 칸은 지금 맡길 일의 장면이다. 일을 맡을 성분을 고르기 전에는 문제만 보이고(답이 되는 성분은 그리지 않는다),
// 맞게 맡기면 그 성분이 일을 해내는 모습으로, 잘못 맡기면 문제가 그대로이거나 더 커진 모습으로 남는다.
//   o2   모세혈관 곁의 조직세포: 산소가 모자란 세포 → 적혈구가 산소를 내려놓는다
//   germ 조직에 들어온 세균 → 백혈구가 감싸 먹는다(잘못 맡기면 세균이 늘어난다)
//   cut  찢어진 혈관에서 새는 혈액 → 혈소판이 모여 막는다(잘못 맡기면 계속 샌다)
//   nut  혈관 밖에 쌓인 영양소와 노폐물 → 혈장에 녹아 실려 간다(잘못 맡기면 그대로 쌓여 있다)
// 일을 다 맡긴 뒤의 판정(수가 가장 많은 혈구)에서는 혈구를 확대한 모습으로 돌아간다.
// 색은 단원 팔레트(kit.P)와 순환 여행 랩(rideStage.RC)에서: 산소 P.o2, 영양소 P.glucose, 노폐물 RC.waste(연두), 조직세포 RC.cell.
// 세균은 노폐물의 연두와 헷갈리지 않게 청록 막대로 그린다.

import { P, tag, txt } from "./kit";
import { RC } from "./rideStage";

export type BloodJob = "o2" | "germ" | "cut" | "nut";
export interface BloodView {
  settled: boolean;
  /** 지금 맡길 일(없으면 확대한 혈구) */
  job: BloodJob | null;
  /** ask 고르는 중, miss 잘못 맡김, done 해결 */
  state: "ask" | "miss" | "done";
  ns: string;
}

const RBC_FILL = "#E8505B";
const GERM = "#4FC1A6";
const GERM_LINE = "#1F7A66";
// 오른쪽 칸
const X0 = 98, Y0 = 16, X1 = 338, Y1 = 204;

export const rbc = (x: number, y: number, r = 9): string =>
  `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.82}" fill="${RBC_FILL}" stroke="#8E1E2A" stroke-width="1.3"/><ellipse cx="${x}" cy="${y}" rx="${r * 0.42}" ry="${r * 0.34}" fill="#C7353F"/>`;
export const wbc = (x: number, y: number, k = 1): string =>
  `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-15 -4 q3 -14 16 -12 q14 0 13 13 q2 12 -11 14 q-14 3 -18 -6 z" fill="#E9EEF7" stroke="#8FA3BC" stroke-width="${1.4 / k}"/><path d="M-6 -3 q6 -7 11 0 q3 7 -5 8 q-8 0 -6 -8 z" fill="#8E7CC8"/></g>`;
export const plt = (x: number, y: number): string => `<path d="M${x - 4} ${y - 2} l5 -3 l4 4 l-3 4 l-6 -1 z" fill="#F2C879" stroke="#9A6A1C" stroke-width="1"/>`;
const dotC = (x: number, y: number, r: number, fill: string, line: string, cls = ""): string =>
  `<circle${cls ? ` class="${cls}"` : ""} cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${line}" stroke-width="1.1"/>`;
/** 조직세포(핵이 있는 둥근 세포). ok가 아니면 산소가 모자라 흐리고, 빈 자리(점선)가 있다. */
function cell(x: number, y: number, rx: number, ry: number, ok: boolean, o2 = 0): string {
  let s = `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${RC.cell}" fill-opacity="${ok ? 0.3 : 0.1}" stroke="${RC.cell}" stroke-opacity="${ok ? 1 : 0.45}" stroke-width="2"${ok ? "" : ` stroke-dasharray="5 4"`}/>`;
  s += `<circle cx="${x - rx * 0.3}" cy="${y - ry * 0.15}" r="${Math.min(rx, ry) * 0.3}" fill="#C46A3C" opacity="${ok ? 0.9 : 0.35}"/>`;
  for (let i = 0; i < o2; i++) s += dotC(x + rx * 0.25 + i * 9, y + ry * 0.2 - i * 4, 4.2, P.o2, "#2F6FA8", "g2u6x-pop");
  return s;
}
/** 세균(청록 막대와 털). */
const germ = (x: number, y: number, a: number, fade = 1): string =>
  `<g opacity="${fade}"><g transform="rotate(${a} ${x} ${y})"><path d="M${x - 9} ${y - 1} l-6 -4 M${x + 9} ${y + 1} l6 4 M${x - 3} ${y - 4} l-2 -5 M${x + 4} ${y + 4} l2 5" stroke="${GERM_LINE}" stroke-width="1.2" stroke-linecap="round"/><rect x="${x - 10}" y="${y - 4.5}" width="20" height="9" rx="4.5" fill="${GERM}" stroke="${GERM_LINE}" stroke-width="1.3"/><circle cx="${x - 3}" cy="${y - 1}" r="1.4" fill="${GERM_LINE}"/><circle cx="${x + 4}" cy="${y + 1}" r="1.4" fill="${GERM_LINE}"/></g></g>`;
/** 핏방울 */
const drop = (x: number, y: number, k = 1): string =>
  `<path d="M${x} ${y - 7 * k} C${x + 5 * k} ${y - 1 * k} ${x + 5 * k} ${y + 4 * k} ${x} ${y + 4.5 * k} C${x - 5 * k} ${y + 4 * k} ${x - 5 * k} ${y - 1 * k} ${x} ${y - 7 * k} Z" fill="${RBC_FILL}" stroke="#8E1E2A" stroke-width="1"/>`;
/** 가로로 지나는 혈관(벽과 속). y0~y1이 속, 벽은 두께 w. */
const vessel = (y0: number, y1: number, inner: string, w = 4): string =>
  `<rect x="${X0 - 4}" y="${y0 - w}" width="${X1 - X0 + 8}" height="${y1 - y0 + 2 * w}" fill="#F2A3AE" opacity=".9"/><rect x="${X0 - 4}" y="${y0}" width="${X1 - X0 + 8}" height="${y1 - y0}" fill="${inner}"/>`;
const flow = (x0: number, y: number, x1: number, color: string, cls = "g2u6x-flow"): string => {
  const d = x1 > x0 ? 1 : -1;
  return `<g class="${cls}"><line x1="${x0}" y1="${y}" x2="${x1 - d * 7}" y2="${y}" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/><polygon points="${x1},${y} ${x1 - d * 9},${y - 5} ${x1 - d * 9},${y + 5}" fill="${color}"/></g>`;
};
const vArrow = (x: number, y0: number, y1: number, color: string, cls = "g2u6x-pop"): string => {
  const d = y1 > y0 ? 1 : -1;
  return `<g class="${cls}"><line x1="${x}" y1="${y0}" x2="${x}" y2="${y1 - d * 7}" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/><polygon points="${x},${y1} ${x - 5},${y1 - d * 9} ${x + 5},${y1 - d * 9}" fill="${color}"/></g>`;
};
/** 칸 왼쪽 위의 글: 고르는 중에는 장면 이름, 잘못 맡기면 빨강(문제가 그대로), 해결하면 초록 */
function title(state: BloodView["state"], ask: string, miss: string, done: string): string {
  const s = state === "done" ? done : state === "miss" ? miss : ask;
  const o = state === "done" ? { fill: P.good, stroke: P.good } : state === "miss" ? { fill: P.bad, stroke: P.bad } : {};
  return tag(X0 + 8 + (s.length * 12 * 0.92 + 14) / 2, Y0 + 20, s, { size: 12, ...o });
}

function sceneO2(state: BloodView["state"]): string {
  const ok = state === "done";
  let s = vessel(110, 134, "#4A2230");
  const cells: [number, number][] = [[140, 76], [214, 72], [290, 78], [148, 172], [224, 176], [300, 170]];
  cells.forEach(([x, y]) => (s += cell(x, y, 30, 20, ok, ok ? 2 : 0)));
  if (ok) {
    // 적혈구가 모세혈관을 지나며 산소를 내려놓는다
    [[152, 122], [226, 122], [298, 122]].forEach(([x, y]) => (s += `<g class="g2u6x-pop">${rbc(x, y, 10)}${dotC(x - 3, y - 2, 3.4, P.o2, "#2F6FA8")}</g>`));
    [[140, 108, 90], [214, 108, 86], [290, 108, 92], [148, 136, 156], [224, 136, 160], [300, 136, 154]].forEach(([x, a, b]) => (s += vArrow(x + 10, a, b, P.o2)));
  } else s += flow(X0 + 6, 122, X0 + 40, "#C9707E", "");
  s += title(state, "산소가 모자란 조직세포", "여전히 산소가 모자라요", "적혈구가 산소를 날랐어요");
  return s;
}
function sceneGerm(state: BloodView["state"]): string {
  let s = vessel(176, 196, "#4A2230");
  [[130, 70, 18], [300, 66, 20], [126, 140, 17], [306, 142, 19]].forEach(
    ([x, y, r]) => (s += `<ellipse cx="${x}" cy="${y}" rx="${r + 8}" ry="${r}" fill="${RC.cell}" fill-opacity=".12" stroke="${RC.cell}" stroke-opacity=".6" stroke-width="1.6"/><circle cx="${x - 6}" cy="${y - 2}" r="${r * 0.32}" fill="#C46A3C" opacity=".55"/>`),
  );
  const base: [number, number, number][] = [[214, 74, 20], [244, 94, -30], [198, 104, 60]];
  const more: [number, number, number][] = [[230, 60, -10], [262, 116, 40], [180, 80, -50], [222, 126, 15], [262, 74, 70]];
  if (state === "done") {
    // 백혈구가 혈관 밖으로 나와 세균을 감싸 먹는다
    s += `<g class="g2u6x-pop">${wbc(224, 96, 2.4)}${base.map(([x, y, a]) => germ(224 + (x - 220) * 0.45, 96 + (y - 92) * 0.45, a, 0.55)).join("")}</g>`;
    s += vArrow(224, 172, 132, "#E9EEF7");
  } else {
    s += base.map(([x, y, a]) => germ(x, y, a)).join("");
    if (state === "miss") s += `<g class="g2u6x-pop">${more.map(([x, y, a]) => germ(x, y, a)).join("")}</g>`;
  }
  s += title(state, "몸속에 들어온 세균", "세균이 늘어나요", "백혈구가 세균을 잡아먹었어요");
  return s;
}
function sceneCut(state: BloodView["state"]): string {
  // 혈관의 위쪽 벽이 찢어진 자리(x 204~236)
  let s = `<path d="M${X0 - 4} 118 L${X1 + 4} 118 L${X1 + 4} 160 L${X0 - 4} 160 Z" fill="#4A2230"/>`;
  s += `<path d="M${X0 - 4} 112 L204 112 L208 118 L${X0 - 4} 118 Z" fill="#F2A3AE"/><path d="M236 118 L240 112 L${X1 + 4} 112 L${X1 + 4} 118 Z" fill="#F2A3AE"/>`;
  s += `<rect x="${X0 - 4}" y="160" width="${X1 - X0 + 8}" height="6" fill="#F2A3AE"/>`;
  s += `<path d="M204 112 l3 4 l-2 3 M236 112 l-3 5 l3 2" fill="none" stroke="#C9707E" stroke-width="1.6"/>`;
  [[140, 139], [182, 141], [262, 138], [304, 140]].forEach(([x, y]) => (s += rbc(x, y, 9)));
  // 피부 위로 나온 핏방울
  const drops: [number, number, number][] = [[214, 96, 1], [228, 80, 1.1], [210, 64, 0.9]];
  const more: [number, number, number][] = [[246, 58, 1.2], [188, 76, 1], [240, 40, 1.1], [262, 84, 0.9]];
  if (state === "done") {
    s += `<g class="g2u6x-pop">${[[208, 115], [214, 111], [220, 116], [226, 112], [232, 116], [212, 120], [224, 121], [218, 107], [229, 106]].map(([x, y]) => plt(x, y)).join("")}<path d="M206 108 Q220 100 234 108 M207 116 Q220 110 233 117 M210 104 L230 120 M230 104 L210 120" fill="none" stroke="#FFE7B3" stroke-width="1" opacity=".85"/></g>`;
    s += drops.slice(0, 2).map(([x, y, k]) => drop(x, y, k)).join("");
  } else {
    s += drops.map(([x, y, k]) => drop(x, y, k)).join("");
    if (state === "miss") s += `<g class="g2u6x-pop">${more.map(([x, y, k]) => drop(x, y, k)).join("")}</g>`;
  }
  s += title(state, "찢어진 혈관에서 새는 피", "피가 계속 나요", "혈소판이 모여 막았어요");
  return s;
}
function sceneNut(state: BloodView["state"], ns: string): string {
  const ok = state === "done";
  let s = `<defs><linearGradient id="${ns}-pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0DC9A" stop-opacity=".6"/><stop offset="1" stop-color="#E0C670" stop-opacity=".4"/></linearGradient></defs>`;
  s += vessel(104, 140, ok ? `url(#${ns}-pl)` : "#4A2230");
  // 왼쪽 위: 작은창자에서 흡수된 영양소, 오른쪽 아래: 조직세포가 내놓은 노폐물. 혈장에 녹아야 실려 간다
  s += `<ellipse cx="302" cy="178" rx="28" ry="17" fill="${RC.cell}" fill-opacity=".2" stroke="${RC.cell}" stroke-width="1.8"/><circle cx="294" cy="176" r="6" fill="#C46A3C" opacity=".85"/>`;
  const nutPile: [number, number][] = [[124, 70], [136, 64], [146, 74], [130, 80], [142, 84]];
  const wastePile: [number, number][] = [[256, 172], [248, 184], [262, 186], [244, 168]];
  if (ok) {
    s += vArrow(136, 92, 116, P.glucose) + vArrow(252, 164, 132, RC.waste);
    [[166, 116], [202, 130], [238, 114], [274, 128], [310, 116]].forEach(([x, y]) => (s += dotC(x, y, 4.6, P.glucose, "#8A5A0A", "g2u6x-pop")));
    [[184, 126], [220, 116], [292, 130], [322, 126]].forEach(([x, y]) => (s += dotC(x, y, 4.6, RC.waste, "#4E7A2A", "g2u6x-pop")));
    s += flow(X0 + 44, 154, X0 + 118, P.hi);
  } else {
    nutPile.forEach(([x, y]) => (s += dotC(x, y, 4.6, P.glucose, "#8A5A0A")));
    wastePile.forEach(([x, y]) => (s += dotC(x, y, 4.6, RC.waste, "#4E7A2A")));
  }
  s += txt(158, 78, "영양소", { size: 12, fill: P.glucose, anchor: "start" }) + txt(236, 184, "노폐물", { size: 12, fill: RC.waste, anchor: "end" });
  s += title(state, "혈관 밖에 쌓인 물질", "그대로 쌓여 있어요", "혈장에 녹아 실려 가요");
  return s;
}

/** 무대 SVG 안쪽(346×230). */
export function bloodSvg(v: BloodView): string {
  // 왼쪽: 시험관
  let out = `<path d="M24 28 L24 176 A22 22 0 0 0 68 176 L68 28" fill="rgba(200,225,255,.07)" stroke="${P.glass}" stroke-width="1.8"/>`;
  if (!v.settled) out += `<path d="M26 52 L26 176 A20 20 0 0 0 66 176 L66 52 Z" fill="#C7353F"/>` + txt(46, 216, "혈액", { size: 12.5, fill: P.hi });
  else {
    const plasmaHi = v.job === "nut" && v.state === "done";
    out += `<path class="g2u6x-pop" d="M26 52 L26 120 L66 120 L66 52 Z" fill="#F0DC9A"/><path class="g2u6x-pop" d="M26 120 L26 176 A20 20 0 0 0 66 176 L66 120 Z" fill="#B32A36"/>`;
    out += tag(46, 90, "혈장", { size: 12, stroke: plasmaHi ? P.good : undefined }) + tag(46, 160, "혈구", { size: 12 });
  }
  if (!v.settled) return out + txt(214, 110, "가라앉히면 무엇으로", { size: 13, fill: P.dim }) + txt(214, 130, "나뉠까요?", { size: 13, fill: P.dim });
  // 오른쪽 칸
  out += `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="14" fill="#101D33" stroke="#263B5C"/>`;
  out += `<clipPath id="${v.ns}-c"><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="14"/></clipPath>`;
  if (!v.job) {
    out += `<line x1="68" y1="150" x2="${X0}" y2="40" stroke="#55698A" stroke-dasharray="3 4"/><line x1="68" y1="190" x2="${X0}" y2="196" stroke="#55698A" stroke-dasharray="3 4"/>`;
    const R: [number, number][] = [[124, 46], [154, 40], [186, 50], [218, 38], [308, 48], [130, 84], [166, 80], [298, 88], [124, 126], [158, 122], [194, 116], [228, 130], [316, 128], [138, 168], [176, 164], [214, 172], [294, 170]];
    R.forEach(([x, y]) => (out += rbc(x, y)));
    out += wbc(260, 66) + wbc(256, 146);
    [[204, 86], [236, 96], [190, 142], [276, 110], [318, 180]].forEach(([x, y]) => (out += plt(x, y)));
    out += txt(218, 220, "혈구를 확대한 모습", { size: 12, fill: P.dim });
    return out;
  }
  let sc = "";
  if (v.job === "o2") sc = sceneO2(v.state);
  else if (v.job === "germ") sc = sceneGerm(v.state);
  else if (v.job === "cut") sc = sceneCut(v.state);
  else sc = sceneNut(v.state, v.ns);
  out += `<g clip-path="url(#${v.ns}-c)">${sc}</g>`;
  return out;
}
