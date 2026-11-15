// [중2 Ⅵ v5] 판막 랩(g2u6HeartLab, circLabs.ts)의 무대 그림: 앞에서 본 심장의 단면(2026-11-15 다시 그림, 그래픽 감사 C082).
//
// 근육 윤곽 하나 안에 방 넷을 파냈다. 근육 밖은 무대 바탕이라 빈 주머니가 '방'으로 읽히지 않는다(옛 판에서 "방이 여섯"으로 읽힌 일).
// 혈관의 자리는 책의 심장 그림, 같은 레슨의 순환 여행 랩(rideStage.ts)과 같다:
//   대정맥은 왼쪽 바깥에서 우심방으로, 폐정맥은 오른쪽 바깥에서 좌심방으로 들어오고,
//   폐동맥(우심실)과 대동맥(좌심실)은 가운데에서 위로 나간다. 앞에서 본 그림이라 화면 왼쪽이 몸의 오른쪽이다.
// 색: 산소가 많은 혈액 P.red, 적은 혈액 P.dark(순환 여행 랩의 RC.rich, RC.poor와 같은 값), 판막은 RC.valve(연노랑).
// 판막의 모습(SCI_GUIDE 순환 여행 랩의 과학 가드와 같다): 쉬거나 심방이 수축할 때 방실판막 열림, 동맥 쪽 판막 닫힘.
//   심실이 수축할 때 그 반대(그동안 닫힌 방실판막이 빛난다).
// 장면 넷: rest(심방에 혈액), toVent(심방 수축: 심실로), toArtery(심실 수축: 동맥으로만), back(판막을 뺀 채 심실 수축: 심방으로 거꾸로, 동맥은 덜 참).
// 무대 설계 판 346×230. 좌표는 전부 이 파일에 있다.

import { P } from "./kit";
import { RC } from "./rideStage";

type Pt = [number, number];
export type HeartScene = "rest" | "toVent" | "toArtery" | "back";
export interface HeartView {
  scene: HeartScene;
  /** 판막을 끼웠는가(빼면 판막 자리에 점선만 남는다) */
  valves: boolean;
  /** 움직임 표시(나타나기, 깜빡임). 판정과 결론 동안에는 끈다(장면을 멈춰 남긴다) */
  live: boolean;
  /** 그라데이션 id 접두(무대마다 달라야 한다) */
  ns: string;
}

const f1 = (v: number): string => String(Math.round(v * 10) / 10);
/** 점들을 지나는 매끈한 곡선(캣멀롬을 3차 베지에로). */
function curve(pts: Pt[], closed = true): string {
  const n = pts.length;
  const at = (i: number): Pt => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return closed ? d + "Z" : d;
}
/** 열린 곡선의 길이(굵은 관을 아래에서부터 덜 채울 때 쓴다). 곡선을 잘게 나눠 잰다. */
function curveLen(pts: Pt[]): number {
  let len = 0;
  const n = pts.length;
  const at = (i: number): Pt => pts[Math.max(0, Math.min(n - 1, i))];
  let prev = pts[0];
  for (let i = 0; i < n - 1; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let k = 1; k <= 12; k++) {
      const t = k / 12, t2 = t * t, t3 = t2 * t;
      const c = (a: number, b: number, cc: number, d: number): number => 0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
      const q: Pt = [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])];
      len += Math.hypot(q[0] - prev[0], q[1] - prev[1]);
      prev = q;
    }
  }
  return len;
}

// ── 생김새(설계 판 px) ───────────────────────────────────────────────
/** 근육의 바깥 윤곽(시계 방향). 심장 끝은 아래 조금 오른쪽이다(좌심실이 심장 끝을 이룬다). */
const OUTLINE: Pt[] = [
  [173, 55], [158, 47], [136, 41], [110, 38], [88, 43], [75, 57], [71, 80], [73, 106], [78, 132], [89, 157], [108, 180], [136, 197],
  [170, 207], [204, 209], [231, 200], [252, 182], [266, 158], [274, 130], [276, 100], [272, 74], [261, 54], [242, 42], [218, 38], [196, 43], [186, 49],
];
interface Side {
  key: "R" | "L";
  atr: Pt[];
  atrC: Pt;
  ven: Pt[];
  venC: Pt;
  /** 방실판막(심방과 심실 사이)의 가운데 x */
  av: number;
  /** 동맥 관의 가운데 x와 관 안쪽 폭 */
  art: number;
  artW: number;
  artPts: Pt[];
  veinPts: Pt[];
  veinW: number;
  blood: string;
}
const SIDES: Side[] = [
  {
    key: "R",
    atr: [[89, 70], [95, 55], [112, 47], [128, 48], [137, 57], [139, 76], [135, 91], [127, 99], [126, 114], [100, 114], [99, 99], [91, 89]],
    atrC: [114, 73],
    ven: [[88, 120], [99, 110], [122, 108], [146, 108], [160, 112], [164, 126], [162, 146], [154, 163], [139, 175], [119, 175], [103, 162], [93, 143]],
    venC: [127, 142],
    av: 113,
    art: 154,
    artW: 16,
    artPts: [[154, 116], [154, 72], [153, 42], [146, 26], [133, 15], [117, 8], [100, 2], [88, -6]],
    veinPts: [[-8, 62], [40, 62], [70, 64], [96, 69]],
    veinW: 16,
    blood: P.dark,
  },
  {
    key: "L",
    atr: [[257, 70], [251, 55], [234, 47], [218, 48], [209, 57], [207, 76], [211, 91], [219, 99], [220, 114], [246, 114], [247, 99], [255, 89]],
    atrC: [232, 73],
    ven: [[184, 118], [196, 109], [220, 108], [242, 110], [252, 120], [254, 138], [248, 158], [236, 176], [219, 188], [205, 185], [193, 172], [185, 152], [182, 134]],
    venC: [218, 146],
    av: 233,
    art: 192,
    artW: 17,
    artPts: [[192, 116], [192, 72], [193, 42], [200, 26], [213, 15], [229, 8], [246, 2], [258, -6]],
    veinPts: [[354, 62], [306, 62], [276, 64], [250, 69]],
    veinW: 15,
    blood: P.red,
  },
];
const VALVE = RC.valve;
const VALVE_LINE = "#B98A2A";
const WALL = RC.muscle; // 혈관 벽과 근육의 테두리
const EMPTY = "#17233A";
const AV_Y = 101; // 방실판막이 붙는 높이
const SL_Y = 100; // 동맥 쪽 판막이 붙는 높이

/** 굵은 화살표(몸통 + 넓은 촉). 혈액 위에서도 보이게 테두리를 두른다. */
function fatArrow(x0: number, y0: number, x1: number, y1: number, o: { w: number; head: number; hw: number; fill: string; line: string; cls?: string }): string {
  const L = Math.hypot(x1 - x0, y1 - y0) || 1;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L;
  const nx = -uy, ny = ux;
  const bx = x1 - ux * o.head, by = y1 - uy * o.head;
  const w = o.w / 2;
  const pts: Pt[] = [
    [x0 + nx * w, y0 + ny * w],
    [bx + nx * w, by + ny * w],
    [bx + nx * o.hw, by + ny * o.hw],
    [x1, y1],
    [bx - nx * o.hw, by - ny * o.hw],
    [bx - nx * w, by - ny * w],
    [x0 - nx * w, y0 - ny * w],
  ];
  return `<polygon${o.cls ? ` class="${o.cls}"` : ""} points="${pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(" ")}" fill="${o.fill}" stroke="${o.line}" stroke-width="1.6" stroke-linejoin="round"/>`;
}
const flowArrow = (x0: number, y0: number, x1: number, y1: number, cls: string): string =>
  fatArrow(x0, y0, x1, y1, { w: 4.4, head: 11, hw: 7.5, fill: "#FFFFFF", line: "rgba(11,21,36,.55)", cls });
const backArrow = (x0: number, y0: number, x1: number, y1: number, cls: string): string =>
  fatArrow(x0, y0, x1, y1, { w: 7.5, head: 15, hw: 11, fill: P.bad, line: "#FFFFFF", cls });

/** 방실판막: 판막 두 장. 열리면 심실 쪽으로 늘어지고(가는 끈이 심실 벽에 이어져 있다), 닫히면 가운데에서 맞닿는다. */
function avValve(cx: number, mode: "open" | "closed" | "gone"): string {
  const a = cx - 14, b = cx + 14;
  if (mode === "gone")
    return `<path d="M${a} ${AV_Y + 1} Q${cx - 6} ${AV_Y + 1} ${cx} ${AV_Y + 7} Q${cx + 6} ${AV_Y + 1} ${b} ${AV_Y + 1}" fill="none" stroke="#9AAECC" stroke-width="1.6" stroke-dasharray="3 3" stroke-linecap="round" opacity=".85"/>`;
  const leaf = (d: string): string => `<path d="${d}" fill="${VALVE}" stroke="${VALVE_LINE}" stroke-width="1.1" stroke-linejoin="round"/>`;
  if (mode === "open") {
    const cord = (x0: number, y0: number, x1: number, y1: number): string => `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${VALVE}" stroke-width="1.1" opacity=".7"/>`;
    return (
      cord(a + 4, AV_Y + 24, a - 3, AV_Y + 40) +
      cord(b - 4, AV_Y + 24, b + 3, AV_Y + 40) +
      leaf(`M${a} ${AV_Y - 1} Q${a + 7} ${AV_Y + 9} ${a + 5} ${AV_Y + 25} Q${a - 1} ${AV_Y + 14} ${a} ${AV_Y + 5} Z`) +
      leaf(`M${b} ${AV_Y - 1} Q${b - 7} ${AV_Y + 9} ${b - 5} ${AV_Y + 25} Q${b + 1} ${AV_Y + 14} ${b} ${AV_Y + 5} Z`)
    );
  }
  return (
    `<line x1="${cx - 4}" y1="${AV_Y + 8}" x2="${a - 3}" y2="${AV_Y + 40}" stroke="${VALVE}" stroke-width="1.1" opacity=".7"/><line x1="${cx + 4}" y1="${AV_Y + 8}" x2="${b + 3}" y2="${AV_Y + 40}" stroke="${VALVE}" stroke-width="1.1" opacity=".7"/>` +
    leaf(`M${a} ${AV_Y - 2} Q${cx - 7} ${AV_Y - 2} ${cx} ${AV_Y + 7} Q${cx - 8} ${AV_Y + 7} ${a} ${AV_Y + 5} Z`) +
    leaf(`M${b} ${AV_Y - 2} Q${cx + 7} ${AV_Y - 2} ${cx} ${AV_Y + 7} Q${cx + 8} ${AV_Y + 7} ${b} ${AV_Y + 5} Z`)
  );
}
/** 동맥 쪽 판막: 주머니 모양의 막 두 장. 닫히면 가운데에서 맞닿고, 열리면 혈관 벽에 붙는다. */
function slValve(cx: number, w: number, mode: "open" | "closed" | "gone"): string {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  if (mode === "gone")
    return `<path d="M${x0 + 1} ${SL_Y - 5} Q${x0 + 3} ${SL_Y + 4} ${cx} ${SL_Y + 2} Q${x1 - 3} ${SL_Y + 4} ${x1 - 1} ${SL_Y - 5}" fill="none" stroke="#9AAECC" stroke-width="1.6" stroke-dasharray="3 3" stroke-linecap="round" opacity=".85"/>`;
  const leaf = (d: string): string => `<path d="${d}" fill="${VALVE}" stroke="${VALVE_LINE}" stroke-width="1.1" stroke-linejoin="round"/>`;
  if (mode === "open") return leaf(`M${x0 + 0.5} ${SL_Y + 5} Q${x0 + 5} ${SL_Y - 4} ${x0 + 2.5} ${SL_Y - 14} L${x0 + 0.5} ${SL_Y - 12} Z`) + leaf(`M${x1 - 0.5} ${SL_Y + 5} Q${x1 - 5} ${SL_Y - 4} ${x1 - 2.5} ${SL_Y - 14} L${x1 - 0.5} ${SL_Y - 12} Z`);
  return leaf(`M${x0 + 0.5} ${SL_Y - 6} Q${x0 + 1.5} ${SL_Y + 5} ${cx} ${SL_Y + 2} L${cx} ${SL_Y - 2} Q${x0 + 5} ${SL_Y - 1} ${x0 + 0.5} ${SL_Y - 6} Z`) + leaf(`M${x1 - 0.5} ${SL_Y - 6} Q${x1 - 1.5} ${SL_Y + 5} ${cx} ${SL_Y + 2} L${cx} ${SL_Y - 2} Q${x1 - 5} ${SL_Y - 1} ${x1 - 0.5} ${SL_Y - 6} Z`);
}
const squeezeAt = (c: Pt, k: number): string => `translate(${c[0]} ${c[1]}) scale(${k}) translate(${-c[0]} ${-c[1]})`;
const text = (x: number, y: number, s: string, o: { anchor?: string; fill?: string; size?: number; weight?: number } = {}): string =>
  `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? "middle"}" font-size="${o.size ?? 12}" font-weight="${o.weight ?? 700}" fill="${o.fill ?? P.text}">${s}</text>`;
/** 바깥 이름표와 짚는 선 */
const callout = (x: number, y: number, s: string, to: Pt, from: Pt, fill = P.text): string =>
  `<line x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}" stroke="#6F84A6" stroke-width="1"/><circle cx="${to[0]}" cy="${to[1]}" r="1.8" fill="#9DB0CF"/>${text(x, y, s, { fill })}`;

/** 무대 SVG 안쪽(346×230). */
export function heartSvg(v: HeartView): string {
  const { scene, valves, live, ns } = v;
  const pop = live ? "g2u6x-pop" : "";
  // 방마다 혈액이 있는가(동맥은 채운 비율)
  const atrFull = scene === "rest" || scene === "back";
  const venFull = scene === "toVent" || scene === "back";
  const artFill = scene === "toArtery" ? 1 : scene === "back" ? 0.42 : 0;
  const sqA = scene === "toVent";
  const sqV = scene === "toArtery" || scene === "back";
  const avMode = !valves ? "gone" : scene === "toArtery" ? "closed" : "open";
  const slMode = !valves ? "gone" : scene === "toArtery" ? "open" : "closed";
  let out = `<defs>
    <linearGradient id="${ns}-mus" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A3E4D"/><stop offset=".55" stop-color="#5F2F3D"/><stop offset="1" stop-color="#4A2431"/></linearGradient>
    <radialGradient id="${ns}-glow"><stop offset="0" stop-color="${VALVE}" stop-opacity=".75"/><stop offset="1" stop-color="${VALVE}" stop-opacity="0"/></radialGradient>
    <clipPath id="${ns}-clip"><path d="${curve(OUTLINE)}"/></clipPath>
  </defs>`;
  out += `<g transform="translate(0 3)">`;
  // 근육(윤곽 하나). 근육 결은 윤곽을 줄인 옅은 선 몇 줄로
  out += `<path d="${curve(OUTLINE)}" fill="url(#${ns}-mus)" stroke="${WALL}" stroke-width="2.4" stroke-linejoin="round"/>`;
  out += `<g clip-path="url(#${ns}-clip)" fill="none" stroke="#A35C6C" stroke-width="1" opacity=".28">${[0.9, 0.8, 0.7]
    .map((k) => `<path d="${curve(OUTLINE.map(([x, y]) => [173 + (x - 173) * k, 128 + (y - 128) * k] as Pt))}"/>`)
    .join("")}</g>`;
  out += `<path d="M86 52 Q104 40 128 42" fill="none" stroke="#F3C1C8" stroke-width="3" stroke-linecap="round" opacity=".35"/>`;
  // 혈관: 정맥은 늘 혈액이 들어오고 있다. 동맥은 지금 채운 만큼(아래에서부터)
  SIDES.forEach((s) => {
    const vd = curve(s.veinPts, false);
    out += `<path d="${vd}" fill="none" stroke="${WALL}" stroke-width="${s.veinW + 5}" stroke-linecap="butt"/><path d="${vd}" fill="none" stroke="${s.blood}" stroke-width="${s.veinW}" stroke-linecap="butt"/>`;
    const ad = curve(s.artPts, false);
    out += `<path d="${ad}" fill="none" stroke="${WALL}" stroke-width="${s.artW + 7}" stroke-linecap="butt"/><path d="${ad}" fill="none" stroke="${EMPTY}" stroke-width="${s.artW}" stroke-linecap="butt"/>`;
    if (artFill > 0) {
      const len = curveLen(s.artPts);
      const dash = artFill >= 1 ? "" : ` stroke-dasharray="${f1(len * artFill)} ${f1(len)}"`;
      out += `<path class="${pop}" d="${ad}" fill="none" stroke="${s.blood}" stroke-width="${s.artW}" stroke-linecap="butt"${dash}/>`;
    }
  });
  // 방(심방은 벽이 얇고 심실은 두껍다). 수축하는 방은 안쪽 공간이 줄어든다
  SIDES.forEach((s) => {
    out += `<path${sqA ? ` class="${live ? "g2u6x-squeeze" : ""}" transform="${squeezeAt(s.atrC, 0.88)}"` : ""} d="${curve(s.atr)}" fill="${atrFull ? s.blood : EMPTY}" stroke="#2A1822" stroke-opacity=".6" stroke-width="1.2"/>`;
    out += `<path${sqV ? ` class="${live ? "g2u6x-squeeze" : ""}" transform="${squeezeAt(s.venC, 0.86)}"` : ""} d="${curve(s.ven)}" fill="${venFull ? s.blood : EMPTY}" stroke="#2A1822" stroke-opacity=".6" stroke-width="1.2"/>`;
    // 심실에서 동맥으로 나가는 길목(동맥 쪽 판막 아래)
    out += `<rect x="${s.art - s.artW / 2 + 0.5}" y="${SL_Y + 2}" width="${s.artW - 1}" height="10" fill="${scene === "toArtery" || venFull ? s.blood : EMPTY}"/>`;
    // 혈액의 윤기(왼쪽 위 빛)
    if (atrFull) out += `<ellipse cx="${s.atrC[0] - 9}" cy="${s.atrC[1] - 10}" rx="9" ry="4" fill="#fff" opacity=".16"/>`;
    if (venFull) out += `<ellipse cx="${s.venC[0] - 12}" cy="${s.venC[1] - 18}" rx="11" ry="5" fill="#fff" opacity=".14"/>`;
  });
  // 판막(닫혀서 막는 동안 빛난다)
  SIDES.forEach((s) => {
    if (avMode === "closed") out += `<ellipse class="${pop}" cx="${s.av}" cy="${AV_Y + 3}" rx="24" ry="12" fill="url(#${ns}-glow)"/>`;
    out += avValve(s.av, avMode);
    out += slValve(s.art, s.artW, slMode);
  });
  // 흐름
  SIDES.forEach((s) => {
    if (scene === "rest") {
      const [vx0, vy0] = s.veinPts[1], [vx1, vy1] = s.veinPts[2];
      out += flowArrow(vx0, vy0 + 1, vx1, vy1 + 1, live ? "g2u6x-flow" : "");
    }
    if (scene === "toVent") out += flowArrow(s.av, 64, s.av, 136, pop);
    if (scene === "toArtery") out += flowArrow(s.art, 132, s.art, 30, pop);
    if (scene === "back") {
      out += flowArrow(s.art, 126, s.art, 76, pop);
      out += backArrow(s.av, 160, s.av, 58, live ? "g2u6x-blink" : "");
    }
  });
  // 이름표(바깥, 짚는 선)
  out += text(30, 46, "대정맥") + text(316, 46, "폐정맥") + text(62, 14, "폐동맥") + text(286, 14, "대동맥");
  out += callout(30, 100, "우심방", [96, 84], [50, 96]) + callout(30, 168, "우심실", [104, 150], [50, 164]);
  out += callout(316, 100, "좌심방", [250, 84], [296, 96]) + callout(316, 168, "좌심실", [244, 150], [296, 164]);
  out += valves ? callout(30, 134, "판막", [101, AV_Y + 2], [46, 130], VALVE) : callout(30, 134, "판막 없음", [101, AV_Y + 2], [60, 130], P.bad);
  out += `</g>`;
  // 범례(무대 아래)
  const leg = (x: number, color: string, s: string): string => `<circle cx="${x}" cy="222" r="5" fill="${color}" stroke="#0B1524" stroke-width="1"/>${text(x + 9, 226.5, s, { anchor: "start", fill: P.hi })}`;
  out += leg(62, P.red, "산소가 많은 혈액") + leg(186, P.dark, "산소가 적은 혈액");
  return out;
}
