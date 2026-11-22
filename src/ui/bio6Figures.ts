// bio6Figures: 중1 Ⅱ v5 문제 그림(2026-11-11). 개념과 정리의 그림은 v3(bio4Figures)를 그대로 쓴다.
// 그림 안 글자는 12px 이상, 정답을 드러내는 이름표는 넣지 않는다.

import { cellPartsQuizFig } from "./bio4Figures";
import { ONION_TILE_MM, bvRand, bvSrc } from "./bio6Kit";
import { webGroup } from "./bio6Web";

/** 식물세포 도해에 (가)~(마)를 붙인 문제 그림. v3의 그림(cellPartsQuizFig)을 쓰되 (라) 세포막의 지시선만 주황 선(세포막)까지 잇는다.
 *  v3 그림은 (라)의 선이 갈색 세포벽의 바깥 가장자리에서 끝나, (나) 세포벽과 같은 곳을 가리키는 것처럼 보인다(v3 그림은 정본이라 건드리지 않는다).
 *  새 끝점은 꼬리표에서 오던 방향 그대로 늘여 세포막 선과 만나는 자리다.
 *  v3 그림(bio4Figures)이 바뀌어 바꿀 곳을 못 찾으면 그 그림을 그대로 돌려주고 콘솔에 알린다. 이 함수는 단원 파일이 읽히는 순간
 *  불리므로 여기서 던지면 앱이 뜨지 않는다. 바뀐 그림이 (라)의 선을 이미 고쳤다면 이 감싸기는 지워도 된다(e2e-u2v5의 C가 이 선을 본다). */
export function cellPartsFigV5(): string {
  const from = `x1="53" y1="182"`;
  const fig = cellPartsQuizFig();
  const end = fig.lastIndexOf("</svg>");
  if (!fig.includes(from) || end < 0) {
    console.error("[u2v5] 식물세포 도해에서 (라)의 지시선을 찾지 못했어요. bio4Figures.cellPartsQuizFig가 바뀌었는지 보고 bio6Figures.cellPartsFigV5를 맞춰 주세요.");
    return fig;
  }
  // 지시선이 닿는 자리에 점을 찍는다. 세포벽(갈색 띠)과 세포막(주황 선)은 붙어 있어서 선 끝만으로는 어느 쪽인지 헷갈린다.
  const dots = [[105, 92], [268, 92], [150, 148], [60, 169], [243, 158]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#4E5968" stroke="#fff" stroke-width="1"/>`).join("");
  const out = fig.replace(from, `x1="60" y1="169"`);
  return out.slice(0, out.lastIndexOf("</svg>")) + dots + "</svg>";
}

// ── 세 세포(신경세포, 적혈구, 상피세포)와 모양 카드의 코드 그림(2026-11-15 그래픽 손질) ──────────────
// 레슨 문제, 시험, 정리 미니아트가 같은 모양과 색을 쓴다. 색은 세포 맡기기 랩(cellFitLab) 무대와 같다:
// 신경세포 주황(#F6B26B), 적혈구 빨강(#E5484D), 상피세포 분홍(#F7B8C8), 핵 보라(#7048E8).
// 시험 그림의 발주 상피세포가 연두색 판이라 식물세포처럼 보였다(레슨 문제와 랩은 먼저 분홍으로 바꿨다).
// 모두 120×120 상자 하나에 그린다(바탕은 그리지 않는다. 담는 칸이 종이색 바탕을 준다).

export type CellArtKind = "nerve" | "rbc" | "epi" | "ball" | "brick";
export const CELL_INK = { nerve: "#F6B26B", nerveEdge: "#B86A1E", rbc: "#E5484D", rbcEdge: "#A01B24", epi: "#F7B8C8", epiEdge: "#C75C80", nuc: "#7048E8" } as const;
const CELL_PAPER = "#FCF6ED";
let cellArtN = 0;
const r1 = (v: number): string => v.toFixed(1);
const nucGrad = (id: string): string =>
  `<radialGradient id="${id}" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#B9A3FF"/><stop offset=".6" stop-color="${CELL_INK.nuc}"/><stop offset="1" stop-color="#5230C2"/></radialGradient>`;

/** 신경세포: 가지돌기가 난 세포체, 길게 뻗은 축삭, 끝의 잔가지. */
function nerveBody(u: string): string {
  const rnd = bvRand(41);
  const segs: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [];
  const grow = (x: number, y: number, a: number, len: number, w: number, depth: number): void => {
    const bend = (rnd() - 0.5) * 0.35;
    const x2 = x + Math.cos(a + bend) * len;
    const y2 = y + Math.sin(a + bend) * len;
    segs.push({ x1: x, y1: y, x2, y2, w });
    if (depth <= 0) return;
    const spread = 0.42 + rnd() * 0.22;
    grow(x2, y2, a + bend - spread, len * 0.62, w * 0.64, depth - 1);
    grow(x2, y2, a + bend + spread, len * 0.6, w * 0.62, depth - 1);
  };
  const SX = 44;
  const SY = 46;
  [-2.6, -1.75, -0.95, 2.95, 2.2].forEach((a, i) => grow(SX + Math.cos(a) * 8, SY + Math.sin(a) * 8, a, 13 + (i % 2) * 3, 3, 2));
  const EX = 88;
  const EY = 96;
  const axon = `M${SX + 6} ${SY + 6}C62 66 72 78 ${EX} ${EY}`;
  const FAN = [0.35, 0.85, 1.35, 1.85];
  const ends = FAN.map((a) => `M${EX} ${EY}L${r1(EX + Math.cos(a) * 11)} ${r1(EY + Math.sin(a) * 11)}`).join("");
  const knobs = FAN.map((a) => `<circle cx="${r1(EX + Math.cos(a) * 12)}" cy="${r1(EY + Math.sin(a) * 12)}" r="1.9" fill="${CELL_INK.nerve}" stroke="${CELL_INK.nerveEdge}" stroke-width=".9"/>`).join("");
  const tube = (d: string, w: number): string =>
    `<path d="${d}" fill="none" stroke="${CELL_INK.nerveEdge}" stroke-width="${r1(w + 1.5)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${CELL_INK.nerve}" stroke-width="${r1(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const dend = segs.map((g) => tube(`M${r1(g.x1)} ${r1(g.y1)}L${r1(g.x2)} ${r1(g.y2)}`, g.w)).join("");
  return `
    <defs><radialGradient id="${u}s" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#FFE3BF"/><stop offset=".55" stop-color="${CELL_INK.nerve}"/><stop offset="1" stop-color="#DD8530"/></radialGradient>${nucGrad(`${u}n`)}</defs>
    ${dend}${tube(axon, 3.4)}${tube(ends, 1.7)}${knobs}
    <circle cx="${SX}" cy="${SY}" r="10.5" fill="url(#${u}s)" stroke="${CELL_INK.nerveEdge}" stroke-width="1.3"/>
    <circle cx="${SX + 1}" cy="${SY + 1}" r="4.2" fill="url(#${u}n)"/>`;
}

/** 적혈구 여럿: 가운데가 오목한 원반(테가 밝고 가운데가 어둡다). 몇 개는 비스듬히 보인다. */
function rbcBody(u: string): string {
  const discs: [number, number, number, number, number][] = [
    [36, 36, 16, 1, 0], [68, 26, 14.5, 0.72, -24], [92, 52, 15, 0.86, 30], [60, 58, 16.5, 1, 0],
    [30, 78, 15, 0.8, 18], [64, 92, 15.5, 0.92, -10], [94, 88, 13.5, 0.7, 55],
  ];
  const disc = ([x, y, r, k, a]: [number, number, number, number, number]): string =>
    `<g transform="translate(${x} ${y}) rotate(${a}) scale(1 ${k})">
      <circle cx="1.2" cy="2.6" r="${r}" fill="#7A1A20" opacity=".16"/>
      <circle r="${r}" fill="url(#${u}r)" stroke="${CELL_INK.rbcEdge}" stroke-width="1.2"/>
      <ellipse cx="${r1(r * 0.08)}" cy="${r1(r * 0.1)}" rx="${r1(r * 0.5)}" ry="${r1(r * 0.46)}" fill="url(#${u}d)"/>
      <path d="M${r1(-r * 0.7)} ${r1(-r * 0.32)}A${r1(r * 0.78)} ${r1(r * 0.78)} 0 0 1 ${r1(-r * 0.12)} ${r1(-r * 0.76)}" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" opacity=".5"/>
    </g>`;
  return `
    <defs><radialGradient id="${u}r" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#F06A6E"/><stop offset=".7" stop-color="${CELL_INK.rbc}"/><stop offset="1" stop-color="#C92A33"/></radialGradient>
    <radialGradient id="${u}d" cx=".55" cy=".58" r=".7"><stop offset="0" stop-color="#A51E27"/><stop offset="1" stop-color="#C93038" stop-opacity=".3"/></radialGradient></defs>
    ${discs.map(disc).join("")}`;
}

/** 상피세포 판: 납작한 세포가 빈틈없이 맞물린 한 겹(위에서 본 모습). 이웃한 칸이 꼭짓점을 함께 써서 틈이 없다. */
function epiBody(u: string): string {
  const CX = 60;
  const CY = 60;
  const RX = 47;
  const RY = 44;
  const R = 11;
  const rnd = bvRand(17);
  const jit = new Map<string, [number, number]>();
  const vtx = (x: number, y: number): [number, number] => {
    const k = `${Math.round(x * 10)},${Math.round(y * 10)}`;
    if (!jit.has(k)) jit.set(k, [x + (rnd() - 0.5) * R * 0.34, y + (rnd() - 0.5) * R * 0.34]);
    return jit.get(k) as [number, number];
  };
  const w = Math.sqrt(3) * R;
  const cells: string[] = [];
  const nucs: string[] = [];
  const shadow: string[] = [];
  const tones = ["#F7B8C8", "#F5AEC0", "#F9C3D1", "#F6B3C5"];
  for (let row = -4; row <= 4; row++) {
    for (let col = -4; col <= 4; col++) {
      const x = CX + col * w + (row & 1 ? w / 2 : 0);
      const y = CY + row * 1.5 * R;
      if (((x - CX) / RX) ** 2 + ((y - CY) / RY) ** 2 > 1) continue;
      const pts = [-90, -30, 30, 90, 150, 210].map((d) => vtx(x + R * Math.cos((d * Math.PI) / 180), y + R * Math.sin((d * Math.PI) / 180)));
      const d = `M${pts.map(([px, py]) => `${r1(px)} ${r1(py)}`).join("L")}Z`;
      shadow.push(d);
      cells.push(`<path d="${d}" fill="${tones[Math.floor(rnd() * tones.length)]}" stroke="${CELL_INK.epiEdge}" stroke-width="1.1" stroke-linejoin="round"/>`);
      const mx = pts.reduce((s, p) => s + p[0], 0) / 6 + (rnd() - 0.5) * 2;
      const my = pts.reduce((s, p) => s + p[1], 0) / 6 + (rnd() - 0.5) * 2;
      nucs.push(`<ellipse cx="${r1(mx)}" cy="${r1(my)}" rx="${r1(R * 0.3)}" ry="${r1(R * 0.25)}" fill="url(#${u}n)"/>`);
    }
  }
  return `
    <defs>${nucGrad(`${u}n`)}</defs>
    <path d="${shadow.join("")}" fill="#7A2E4A" opacity=".16" transform="translate(1.5 2.6)"/>
    ${cells.join("")}${nucs.join("")}`;
}

/** 공 모양 세포 하나(모양 카드의 보기). */
function ballBody(u: string): string {
  return `
    <defs><radialGradient id="${u}b" cx=".36" cy=".32" r=".78"><stop offset="0" stop-color="#FFE6E1"/><stop offset=".6" stop-color="#F7A99F"/><stop offset="1" stop-color="#DE7D72"/></radialGradient>${nucGrad(`${u}n`)}</defs>
    <ellipse cx="62" cy="99" rx="30" ry="5" fill="#2A3A5E" opacity=".1"/>
    <circle cx="60" cy="58" r="36" fill="url(#${u}b)" stroke="#C9655A" stroke-width="1.3"/>
    <circle cx="66" cy="55" r="10" fill="url(#${u}n)"/>
    <ellipse cx="45" cy="41" rx="10" ry="6" fill="#fff" opacity=".4" transform="rotate(-30 45 41)"/>`;
}

/** 각진 칸이 벽돌처럼 줄지어 맞물린 세포들(모양 카드의 보기). */
function brickBody(): string {
  let out = "";
  for (let row = 0; row < 4; row++) {
    const y = 20 + row * 20;
    const off = row % 2 ? -14 : 0;
    for (let i = 0; i < 5; i++) {
      const x0 = Math.max(14, 14 + off + i * 28);
      const x1 = Math.min(106, 14 + off + (i + 1) * 28);
      if (x1 - x0 < 8) continue;
      out += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="20" fill="#F4F6D6" stroke="#9CAE4E" stroke-width="2.2"/><circle cx="${(x0 + x1) / 2}" cy="${y + 10}" r="2.6" fill="${CELL_INK.nuc}" opacity=".85"/>`;
    }
  }
  return `<rect x="14" y="20" width="92" height="80" fill="#5C6B2A" opacity=".12" transform="translate(1.5 2.5)"/>${out}`;
}

function cellArtBody(kind: CellArtKind, u: string): string {
  if (kind === "nerve") return nerveBody(u);
  if (kind === "rbc") return rbcBody(u);
  if (kind === "epi") return epiBody(u);
  if (kind === "ball") return ballBody(u);
  return brickBody();
}

/** 세포 그림 하나(120×120, 바탕 없음). */
export function cellArt(kind: CellArtKind, alt = ""): string {
  const u = `cla${++cellArtN}`;
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" ${alt ? `role="img" aria-label="${alt}"` : `aria-hidden="true"`} style="display:block;width:100%;height:auto">${cellArtBody(kind, u)}</svg>`;
}

/** 세 세포 그림(u2l4 문제): 신경세포, 적혈구, 상피세포를 나란히 놓고 (가)~(다)를 붙인다(코드 그림. 랩과 같은 색).
 *  이름표에 세포 이름을 쓰지 않는다(정답이 드러난다). 바탕은 종이색(#FCF6ED). */
export function cellTrioFig(): string {
  const cell = (kind: CellArtKind, lab: string, alt: string): string =>
    `<figure style="margin:0"><div style="border-radius:12px;background:${CELL_PAPER};padding:4px">${cellArt(kind, `세포 그림 ${lab}: ${alt}`)}</div><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">${lab}</figcaption></figure>`;
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${cell("nerve", "(가)", "가지가 난 몸에서 길게 뻗은 세포")}${cell("rbc", "(나)", "가운데가 오목한 붉은 원반 여러 개")}${cell("epi", "(다)", "납작한 세포가 빈틈없이 맞물린 판")}</div>`;
}

/** 세 세포를 한 판에 나란히(시험용, 표지 없음). */
export function cellTrioExamFig(alt: string): string {
  const u = `cla${++cellArtN}`;
  const at = (k: CellArtKind, x: number): string => `<g transform="translate(${x} 0)">${cellArtBody(k, `${u}${k}`)}</g>`;
  return `<div style="border-radius:14px;background:${CELL_PAPER};padding:8px 6px"><svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${alt}" style="display:block;width:100%;height:auto">${at("nerve", 0)}${at("rbc", 120)}${at("epi", 240)}</svg></div>`;
}

/** 세포 모양 카드 ①~⑤(시험용). 3+2 격자, 카드마다 종이색 바탕과 원문자 표지. */
export function cellShapeCardsArt(cards: { kind: CellArtKind; alt: string }[]): string {
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${cards
    .map(
      (c, i) =>
        `<figure style="margin:0;position:relative"><div style="border-radius:10px;background:${CELL_PAPER};padding:6px">${cellArt(c.kind, c.alt)}</div><figcaption style="position:absolute;left:6px;top:6px;background:rgba(255,255,255,.95);border-radius:999px;width:22px;height:22px;line-height:22px;text-align:center;font-size:13px;font-weight:900;color:#20262E;box-shadow:0 1px 4px rgba(10,20,40,.22)">${"①②③④⑤"[i]}</figcaption></figure>`,
    )
    .join("")}</div>`;
}

/** 양파 껍질 현미경 사진 + 0.1 mm 눈금자(문제용). 세포 한 칸의 양 끝에서 점선을 내려 눈금자로 읽게 한다.
 *  축척은 랩(magnifyLab)과 같은 자다(거울 타일 한 장 = ONION_TILE_MM). 여기서는 1 mm = 460px(눈금 한 칸 0.1 mm = 46px).
 *  사진 칸에는 거울 타일의 오른쪽 위 한 장(원본의 좌우 뒤집힘)만 보인다. 타일 한 장을 넘지 않으니 거울 이음매가 안 보인다.
 *  표시한 세포는 그 장의 가로 7.7%에서 63.2%까지 뻗은 칸이다(양 끝 벽과 테두리의 자리는 그림에서 쟀다). 칸을 옅게 칠해 표시한다.
 *  타일 폭의 55.5%이므로 138px, 눈금 세 칸에 꼭 맞는다.
 *  사진과 눈금을 폭 284px의 한 상자 안에 px로 놓아서 문제 그림 칸의 폭이 달라져도(폰 폭 360~430) 둘의 비율이 어긋나지 않는다.
 *  주의: 문제 그림 칸의 svg는 폭 100%로 늘어나는 규칙을 받는다(.q-figure-art svg). 눈금 svg에는 px 크기를 style로 박아 둔다. */
export function onionRulerFig(): string {
  const PX_MM = 460;
  const T = ONION_TILE_MM * PX_MM; // 타일 한 장의 화면 크기(약 248px)
  const BOX = { x: 18, y: 10, w: 248, h: 132 };
  const step = PX_MM / 10;
  const xL = BOX.x + 0.077 * T; // 세포의 왼쪽 끝
  const xR = BOX.x + 0.632 * T; // 세포의 오른쪽 끝
  const yL = BOX.y + 0.174 * T; // 왼쪽 끝 벽의 가운데 높이
  const yR = BOX.y + 0.11 * T; // 오른쪽 끝 벽의 가운데 높이
  const RY = 168; // 눈금자 높이
  const ticks = [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${(xL + i * step).toFixed(1)} ${RY}v-${i === 0 || i === 5 ? 14 : 9}"/>`).join("");
  const guides = `M${xL.toFixed(1)} ${yL.toFixed(1)}V${RY}M${xR.toFixed(1)} ${yR.toFixed(1)}V${RY}`;
  // 표시한 세포의 테두리(타일의 %: 그림에서 잰 다섯 꼭짓점). 어느 칸인지 한눈에 보이게 옅게 칠한다.
  const cell = [[61.5, 6.8], [50.5, 6.9], [7.8, 13.7], [7.5, 21.0], [64.5, 15.5]]
    .map(([x, y]) => `${(BOX.x + (x / 100) * T).toFixed(1)},${(BOX.y + (y / 100) * T).toFixed(1)}`)
    .join(" ");
  const halo = `stroke="#0A1322" stroke-width="3.6" paint-order="stroke" stroke-linejoin="round"`;
  return `<div role="img" aria-label="양파 껍질을 크게 본 사진. 하얗게 표시한 세포 한 칸의 양 끝에서 눈금자로 점선이 내려와 있다" style="border-radius:12px;background:#0E1A2B">
    <div style="position:relative;width:284px;height:204px;margin:0 auto">
      <div style="position:absolute;left:${BOX.x}px;top:${BOX.y}px;width:${BOX.w}px;height:${BOX.h}px;border-radius:10px;background:url('${bvSrc("bio6/micro/onion-mirror.webp")}') ${(-T).toFixed(1)}px 0px / ${(2 * T).toFixed(1)}px ${(2 * T).toFixed(1)}px no-repeat;filter:saturate(.62) brightness(1.08)"></div>
      <svg viewBox="0 0 284 204" style="position:absolute;left:0;top:0;width:284px;height:204px;max-width:none;max-height:none" xmlns="http://www.w3.org/2000/svg" fill="none">
        <polygon points="${cell}" fill="#fff" fill-opacity=".26" stroke="#0A1322" stroke-width="4.4" stroke-opacity=".45" stroke-linejoin="round"/>
        <polygon points="${cell}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
        <path d="${guides}" stroke="#0A1322" stroke-width="3.6" stroke-linecap="round" opacity=".5"/>
        <path d="${guides}" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="4 4"/>
        <text x="${(xL + 50).toFixed(1)}" y="${(yL - 12).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" ${halo}>세포 한 칸</text>
        <path d="M${xL.toFixed(1)} ${RY}H${(xL + step * 5).toFixed(1)}" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
        <g stroke="#fff" stroke-width="2.2" stroke-linecap="round">${ticks}</g>
        <text x="${(xL + (step * 5) / 2).toFixed(1)}" y="${RY + 24}" text-anchor="middle" font-size="13" font-weight="800" fill="#EAF0FA">눈금 한 칸 = 0.1 mm</text>
      </svg>
    </div>
  </div>`;
}

// ── 시험 문제의 세포 그림(2026-11-15 그래픽 손질) ─────────────────────────────
// 시험 풀의 발주 세포 그림(bio3/figs/plant-cell, animal-cell)에는 이 단원에서 배우지 않는 구조(큰 물주머니, 막 주름 덩어리)가 함께 그려져 있었다.
// 레슨 그림(u2l2f2, 문제 도해)과 같은 다섯 구조(세포벽, 세포막, 핵, 마이토콘드리아, 엽록체)만 코드로 그린다.
// 색은 시험 글과 맞춘다: 핵은 보라색 덩어리, 마이토콘드리아는 주황빛 알갱이, 엽록체는 초록색 알갱이, 세포벽은 두꺼운 갈색 띠.
// 표시(㉠~㉢)는 그림 좌표로 준다: (bx, by)는 기호 동그라미, (tx, ty)는 가리키는 자리. 이름은 쓰지 않는다(정답이 드러난다).

export interface CellMark {
  sym: string;
  bx: number;
  by: number;
  tx: number;
  ty: number;
}

/** 볼록 다각형의 변을 d만큼 바깥(음수면 안쪽)으로 평행하게 민 다각형. */
function offsetPoly(pts: [number, number][], d: number): [number, number][] {
  const n = pts.length;
  // 시계 방향 여부(화면 좌표, y 아래)
  let area = 0;
  for (let i = 0; i < n; i++) area += pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1];
  const s = area > 0 ? 1 : -1;
  const lines = pts.map((p, i) => {
    const q = pts[(i + 1) % n];
    const ex = q[0] - p[0];
    const ey = q[1] - p[1];
    const l = Math.hypot(ex, ey);
    const nx = (s * ey) / l;
    const ny = (-s * ex) / l;
    return { x: p[0] + nx * d, y: p[1] + ny * d, ex, ey };
  });
  return lines.map((a, i) => {
    const b = lines[(i - 1 + n) % n];
    const den = b.ex * a.ey - b.ey * a.ex;
    const t = ((a.x - b.x) * a.ey - (a.y - b.y) * a.ex) / den;
    return [b.x + b.ex * t, b.y + b.ey * t] as [number, number];
  });
}
const polyD = (pts: [number, number][]): string => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;

let cellFigN = 0;
/** 그라데이션 묶음(그림마다 다른 id). */
function cellDefs(u: string): string {
  return `<defs>
    <radialGradient id="${u}cp" cx="42%" cy="36%" r="74%"><stop offset="0" stop-color="#F7FCE9"/><stop offset=".62" stop-color="#E2F2BF"/><stop offset="1" stop-color="#C9E29A"/></radialGradient>
    <radialGradient id="${u}ca" cx="42%" cy="36%" r="74%"><stop offset="0" stop-color="#FFF4E6"/><stop offset=".62" stop-color="#FFE1C2"/><stop offset="1" stop-color="#F8C79C"/></radialGradient>
    <linearGradient id="${u}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B89A8E"/><stop offset=".5" stop-color="#8D6E63"/><stop offset="1" stop-color="#6D4C41"/></linearGradient>
    <radialGradient id="${u}n" cx="36%" cy="32%" r="76%"><stop offset="0" stop-color="#C3B1FF"/><stop offset=".55" stop-color="#7C5CF0"/><stop offset="1" stop-color="#5230C2"/></radialGradient>
    <linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB49A"/><stop offset=".55" stop-color="#F76A4A"/><stop offset="1" stop-color="#C8452B"/></linearGradient>
    <linearGradient id="${u}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#95E6A2"/><stop offset=".55" stop-color="#40C057"/><stop offset="1" stop-color="#2B8A3E"/></linearGradient>
  </defs>`;
}
const cNuc = (u: string, x: number, y: number, r: number): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${u}n)" stroke="#4A2AAE" stroke-width="1.5"/>
   <circle cx="${x + r * 0.16}" cy="${y + r * 0.18}" r="${r * 0.32}" fill="#3F2499" opacity=".72"/>
   <ellipse cx="${x - r * 0.36}" cy="${y - r * 0.42}" rx="${r * 0.32}" ry="${r * 0.17}" fill="#fff" opacity=".45" transform="rotate(-28 ${x - r * 0.36} ${y - r * 0.42})"/>`;
const cMito = (u: string, x: number, y: number, a: number): string =>
  `<g transform="translate(${x} ${y}) rotate(${a})">
     <rect x="-14" y="-7.5" width="28" height="15" rx="7.5" fill="url(#${u}m)" stroke="#A33520" stroke-width="1.3"/>
     <path d="M-9 0.5q2.2-5 4.5 0t4.5 0 4.5 0 4.5 0" fill="none" stroke="#FFE8E0" stroke-width="1.7" stroke-linecap="round"/>
   </g>`;
const cChl = (u: string, x: number, y: number, a: number): string =>
  `<g transform="translate(${x} ${y}) rotate(${a})">
     <ellipse rx="16" ry="9" fill="url(#${u}c)" stroke="#1F6B30" stroke-width="1.3"/>
     <path d="M-7.5 -4.5v9M-2.5 -6.6v13.2M2.5 -6.6v13.2M7.5 -4.5v9" stroke="#1F6B30" stroke-width="1.7" stroke-linecap="round" opacity=".55"/>
     <ellipse cx="-4.5" cy="-4.4" rx="6" ry="2" fill="#fff" opacity=".38"/>
   </g>`;
/** 원문자 ㉠~㉤는 동그라미를 직접 그리고 그 안에 자모만 쓴다(원문자 글리프는 글꼴마다 테 크기가 달라 겹테로 보였다). */
const JAMO: Record<string, string> = { "㉠": "ㄱ", "㉡": "ㄴ", "㉢": "ㄷ", "㉣": "ㄹ", "㉤": "ㅁ" };
/** 기호 표시(이끎선 + 끝점 + 동그라미 기호). 글자는 15px(폰 표시 12px 이상). */
const cMarks = (marks: CellMark[]): string =>
  marks
    .map(
      (m) => `<g>
        <path d="M${m.bx} ${m.by}L${m.tx} ${m.ty}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>
        <path d="M${m.bx} ${m.by}L${m.tx} ${m.ty}" stroke="#20262E" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="${m.tx}" cy="${m.ty}" r="3" fill="#20262E" stroke="#fff" stroke-width="1.2"/>
        <circle cx="${m.bx}" cy="${m.by}" r="12.5" fill="#fff" stroke="#20262E" stroke-width="1.6"/>
        <text x="${m.bx}" y="${m.by + 5.2}" text-anchor="middle" font-size="15" font-weight="900" fill="#20262E">${JAMO[m.sym] ?? m.sym}</text>
      </g>`,
    )
    .join("");
const cellBox = (alt: string, body: string): string =>
  `<div style="background:#F4F7F6;border-radius:14px;padding:6px 0"><svg viewBox="0 0 340 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${alt}" style="display:block;width:100%;max-width:440px;margin:0 auto">${body}</svg></div>`;

/** 식물세포 그림: 각진 세포(육각형), 두꺼운 세포벽, 그 바로 안쪽의 세포막, 핵 하나, 엽록체 여섯, 마이토콘드리아 셋.
 *  표시를 붙일 때 쓰는 자리: 핵 (164, 120), 왼쪽 마이토콘드리아 (82, 132), 아래쪽 엽록체 (128, 186). */
export function examPlantCellFig(alt: string, marks: CellMark[] = []): string {
  const u = `xpc${++cellFigN}`;
  const hex: [number, number][] = [[96, 34], [244, 34], [300, 125], [244, 216], [96, 216], [40, 125]];
  const wallOut = offsetPoly(hex, 7);
  const wallIn = offsetPoly(hex, -7);
  const mem = offsetPoly(hex, -10);
  const body = `${cellDefs(u)}
    <ellipse cx="170" cy="232" rx="118" ry="7" fill="#2A3A5E" opacity=".1"/>
    <path d="${polyD(wallIn)}" fill="url(#${u}cp)"/>
    <path d="${polyD(wallOut)}${polyD(wallIn)}" fill="url(#${u}w)" fill-rule="evenodd" stroke="#5D4037" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="${polyD(offsetPoly(hex, 4.2))}" fill="none" stroke="#D7C2B8" stroke-width="1.6" stroke-linejoin="round" opacity=".55"/>
    <path d="${polyD(mem)}" fill="none" stroke="#F59F00" stroke-width="2.8" stroke-linejoin="round"/>
    ${[[106, 78, -22], [212, 64, 8], [266, 122, 84], [234, 174, -14], [128, 186, 14], [78, 146, 70]].map(([x, y, a]) => cChl(u, x, y, a)).join("")}
    ${[[82, 108, -62], [218, 116, 18], [168, 62, -6]].map(([x, y, a]) => cMito(u, x, y, a)).join("")}
    ${cNuc(u, 160, 124, 27)}
    ${cMarks(marks)}`;
  return cellBox(alt, body);
}

/** 동물세포 그림: 둥글고 무른 세포(세포막 한 겹), 핵 하나, 마이토콘드리아 넷. 세포벽과 엽록체는 없다.
 *  표시를 붙일 때 쓰는 자리: 막의 위쪽 (170, 37), 핵 (180, 116), 왼쪽 마이토콘드리아 (92, 132). */
export function examAnimalCellFig(alt: string, marks: CellMark[] = []): string {
  const u = `xac${++cellFigN}`;
  // 살짝 울퉁불퉁한 둥근 테두리(가운데 170, 125)
  const N = 72;
  let d = "";
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const k = 1 + 0.035 * Math.sin(3 * t + 0.6) + 0.025 * Math.cos(5 * t + 1.1);
    const x = 170 + 124 * k * Math.cos(t);
    const y = 125 + 88 * k * Math.sin(t);
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  d += "Z";
  const body = `${cellDefs(u)}
    <ellipse cx="170" cy="230" rx="112" ry="7" fill="#2A3A5E" opacity=".1"/>
    <path d="${d}" fill="url(#${u}ca)" stroke="#F59F00" stroke-width="9" stroke-opacity=".18" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="#F59F00" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M104 64C122 50 146 42 170 41" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    ${[[92, 132, -32], [244, 152, 22], [150, 180, 8], [236, 84, -24]].map(([x, y, a]) => cMito(u, x, y, a)).join("")}
    ${cNuc(u, 180, 116, 29)}
    ${cMarks(marks)}`;
  return cellBox(alt, body);
}

// ── 위에서 본 표본(받침 유리와 덮개 유리) ─────────────────────────────────
// u2l3 문제와 시험에 쓰던 512px 사진은 덮개 유리 아래 옅은 원 하나뿐이라(폰에서 지름 10px쯤) 랩에서 본 공기 방울과 생김새가 달랐다.
// 코드 그림으로: 받침 유리(76×26 mm) 가운데 덮개 유리(22 mm), 그 아래 물들인 입안 세포가 옅게 퍼져 있고, 공기 방울은 굵은 테 원으로 크게.
// 장면 좌표: 받침 유리 x 14~306, y 40~140(1 mm = 3.84px), 덮개 유리 가운데 (160, 90).

let slideN = 0;
const BENCH = "linear-gradient(160deg,#3B4F69 0%,#26364C 100%)"; // 실험대(어두운 판). 밝은 유리와 공기 방울이 또렷하게 보인다
function slideScene(u: string, bubbles: boolean): string {
  const smear = [[146, 78, 15, 10, -20], [172, 98, 17, 11, 25], [150, 106, 13, 8, 10], [176, 74, 10, 7, -35], [136, 96, 9, 6, 40]]
    .map(([x, y, rx, ry, a]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})" fill="#6F93D8" opacity=".3"/>`)
    .join("");
  const bub = (x: number, y: number, r: number): string =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" fill-opacity=".94" stroke="#22303F" stroke-width="${(r * 0.2 + 1.3).toFixed(1)}"/>
     <path d="M${x - r * 0.55} ${y - r * 0.2}a${r * 0.6} ${r * 0.6} 0 0 1 ${r * 0.5} ${-r * 0.42}" fill="none" stroke="#C9D7E6" stroke-width="${(r * 0.16 + 0.8).toFixed(1)}" stroke-linecap="round"/>`;
  return `
    <defs>
      <linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3F8FC" stop-opacity=".95"/><stop offset=".55" stop-color="#DCE8F2" stop-opacity=".9"/><stop offset="1" stop-color="#C3D6E6" stop-opacity=".92"/></linearGradient>
      <linearGradient id="${u}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EEF8FE"/><stop offset="1" stop-color="#CFE8F7"/></linearGradient>
    </defs>
    <rect x="18" y="46" width="292" height="100" rx="5" fill="#0B1524" opacity=".35"/>
    <rect x="14" y="40" width="292" height="100" rx="4" fill="url(#${u}g)" stroke="#A9C3D8" stroke-width="1.5"/>
    <rect x="18" y="44" width="46" height="92" rx="2.5" fill="#fff" opacity=".78"/>
    <path d="M72 50L104 50M232 130L284 130" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>
    <rect x="113" y="43" width="94" height="94" rx="3" fill="#9FD0EE" opacity=".35"/>
    ${smear}
    <rect x="118" y="48" width="84" height="84" rx="2" fill="url(#${u}c)" fill-opacity=".8" stroke="#6E9BBE" stroke-width="1.4"/>
    <path d="M124 56L150 56" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    ${bubbles ? `${bub(147, 84, 14)}${bub(178, 106, 9)}${bub(140, 114, 6.5)}` : ""}`;
}
const slideBox = (alt: string, vb: string, body: string, maxW = 420): string =>
  `<div style="background:${BENCH};border-radius:14px;padding:8px 0"><svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${alt}" style="display:block;width:100%;max-width:${maxW}px;margin:0 auto">${body}</svg></div>`;

/** 위에서 본 표본 하나(시험용. 덮개 유리 아래 공기 방울 셋). */
export function slideBubbleFig(alt: string): string {
  return slideBox(alt, "0 26 320 134", slideScene(`sld${++slideN}`, true));
}

/** 같은 시료로 만든 두 표본 (가) 깨끗한 것, (나) 공기 방울이 갇힌 것(시험용). 덮개 유리 둘레만 잘라 크게 보인다. */
export function slidePairFig(altA: string, altB: string): string {
  const one = (bub: boolean, alt: string, lab: string): string =>
    `<figure style="margin:0;position:relative"><div style="background:${BENCH};border-radius:12px"><svg viewBox="80 30 160 122" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${alt}" style="display:block;width:100%">${slideScene(`sld${++slideN}`, bub)}</svg></div><figcaption style="position:absolute;left:7px;top:7px;background:rgba(255,255,255,.94);border-radius:999px;padding:2px 9px;font-size:12px;font-weight:900;color:#1F3A5F">${lab}</figcaption></figure>`;
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${one(false, altA, "(가)")}${one(true, altB, "(나)")}</div>`;
}

/** 위에서 본 표본과 곁의 "현미경으로 보면" 작은 시야(u2l3 문제 1). 시야는 랩과 같은 모습: 물든 입안 세포 위에 굵은 테의 공기 방울. */
export function slideBubbleScopeFig(alt: string): string {
  const u = `sld${++slideN}`;
  const cells = [
    [262, 78, 15, 11, 20], [292, 70, 14, 10, -30], [318, 86, 13, 11, 10], [256, 106, 13, 10, -15],
    [308, 116, 15, 10, 30], [276, 132, 14, 10, 0], [300, 140, 11, 8, -25], [324, 120, 9, 8, 0],
  ]
    .map(([x, y, rx, ry, a]) => `<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#D4E1F8" stroke="#8EA7DA" stroke-width="1.2"/><circle cx="${x + 2}" cy="${y + 1}" r="2.6" fill="#2B4FC4"/></g>`)
    .join("");
  const body = `
    <g transform="translate(-6 18) scale(.78)">${slideScene(u, true)}</g>
    <defs><clipPath id="${u}v"><circle cx="292" cy="104" r="46"/></clipPath></defs>
    <circle cx="109" cy="83.5" r="16" fill="none" stroke="#FFD43B" stroke-width="1.6" stroke-dasharray="3 3"/>
    <path d="M121 72.6L262 69M121 94.4L262 139" stroke="#FFD43B" stroke-width="1.3" stroke-dasharray="3 4" opacity=".75"/>
    <g clip-path="url(#${u}v)">
      <rect x="240" y="52" width="110" height="110" fill="#E9F0FC"/>
      ${cells}
      <circle cx="280" cy="98" r="17" fill="#FDFEFF" stroke="#1B2430" stroke-width="5"/>
      <circle cx="310" cy="126" r="10" fill="#FDFEFF" stroke="#1B2430" stroke-width="4"/>
      <path d="M270 92a11 11 0 0 1 9 -7" fill="none" stroke="#C9D4E2" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    <circle cx="292" cy="104" r="46" fill="none" stroke="#9FB3D1" stroke-width="3"/>
    <text x="292" y="44" text-anchor="middle" font-size="14" font-weight="800" fill="#DCE6F5">현미경으로 보면</text>`;
  return slideBox(alt, "0 26 344 132", body, 440);
}

// ── 순환계(심장과 혈관) 그림(u2l5 문제 2, 2026-11-15 그래픽 손질) ──────────────────
// 고치기 전 그림은 사람 몸 윤곽 전체 안에 심장과 혈관을 그려 보기 "(나) 개체"와 헷갈렸다. 기관계 그림답게(소화계 그림처럼) 기관만 그린다:
// 가슴 높이에서 본 심장과 거기서 뻗어 나가는 큰 혈관 줄기(동맥 빨강, 정맥 파랑). 혈관은 그림 테두리 밖으로 이어진다(몸 윤곽, 팔다리 끝은 없다).
// 이름표는 달지 않는다(답이 된다). 방향: 그림의 왼쪽이 몸의 오른쪽(대정맥), 대동맥 활은 그림의 오른쪽으로 넘어가 내려간다.
let circN = 0;
export function circulatorySystemFig(alt: string): string {
  const u = `circ${++circN}`;
  const tube = (d: string, c: string, edge: string, w: number): string =>
    `<path d="${d}" fill="none" stroke="${edge}" stroke-width="${w + 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="#fff" stroke-width="${(w * 0.22).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity=".35" transform="translate(-${(w * 0.18).toFixed(1)} -${(w * 0.18).toFixed(1)})"/>`;
  const A = "#EF4B55";
  const AE = "#9E1A26";
  const V = "#4D8DF7";
  const VE = "#1E4FAE";
  // 정맥: 위 대정맥(머리와 팔에서), 아래 대정맥(아래 몸에서)
  const veins = [
    tube("M80 92V40C80 30 76 22 70 0", V, VE, 10),
    tube("M80 44C66 40 40 42 0 50", V, VE, 7),
    tube("M80 40C84 28 90 18 92 0", V, VE, 5),
    tube("M82 140V200", V, VE, 10),
    tube("M82 168L58 200M82 180L104 200", V, VE, 5),
  ].join("");
  // 동맥: 대동맥 활과 내려가는 대동맥, 활에서 머리와 팔로 가는 가지
  const arts = [
    tube("M106 92C104 70 108 56 120 52C134 48 146 58 146 74V200", A, AE, 11),
    tube("M112 54C106 40 102 22 104 0", A, AE, 6),
    tube("M106 44C96 40 74 30 48 22C30 16 14 20 0 26", A, AE, 6),
    tube("M124 50C124 34 126 18 128 0", A, AE, 5.5),
    tube("M136 54C152 42 172 36 200 36", A, AE, 6),
    tube("M146 150L168 156L200 152M146 176L122 186L104 200M146 186L172 200", A, AE, 4.5),
  ].join("");
  const heart = `
    <path d="M84 88C70 96 66 118 74 134C84 150 104 160 122 162C130 150 140 130 138 112C136 94 124 84 108 83C99 83 90 85 84 88Z" fill="url(#${u}h)" stroke="#6E0E1A" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M78 96C70 104 68 118 72 128" fill="none" stroke="#7A0F1C" stroke-width="1.4" opacity=".5"/>
    <path d="M110 90C116 108 118 130 120 158" fill="none" stroke="#B5172A" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>
    <path d="M113 104l8 6M116 120l-8 7M118 138l7 5" stroke="#B5172A" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>
    <path d="M104 92C108 110 108 132 112 156" fill="none" stroke="#3B6FD9" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
    <ellipse cx="94" cy="104" rx="10" ry="6" fill="#fff" opacity=".28" transform="rotate(-35 94 104)"/>`;
  const body = `
    <defs><radialGradient id="${u}h" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#F7787F"/><stop offset=".55" stop-color="#D93244"/><stop offset="1" stop-color="#93132A"/></radialGradient>
    <linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".12" stop-color="#fff" stop-opacity="0"/><stop offset=".88" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
    <linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".1" stop-color="#fff" stop-opacity="0"/><stop offset=".9" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient></defs>
    <rect width="200" height="200" fill="#fff"/>
    ${veins}${arts}${heart}
    <rect width="200" height="200" fill="url(#${u}f)"/><rect width="200" height="200" fill="url(#${u}g)"/>`;
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${alt}" style="display:block;width:100%;height:auto">${body}</svg>`;
}

/** u2l5 문제 2: (가) 잎 단면의 조직계, (나) 순환계. 이어받은 그림 짝(ppair)과 같은 틀. */
export function tissueVsCirculatoryFig(): string {
  const cap = (t: string): string => `<figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">${t}</figcaption>`;
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="${bvSrc("bio2/levels/tissue-system.webp")}" alt="잎 단면의 조직계 도해" style="display:block;width:100%;border-radius:12px"/>${cap("(가)")}</figure>
    <figure style="margin:0"><div style="border-radius:12px;background:#fff">${circulatorySystemFig("심장과 온몸으로 뻗은 혈관 줄기 도해")}</div>${cap("(나)")}</figure>
  </div>`;
}

// ── 같은 종류 무당벌레 다섯 마리(u2l6 랩의 셋째 눈금, u2l7 시험, 2026-11-15 그래픽 손질) ─────────────────
// 고치기 전 512px 사진은 다섯 마리가 거의 같은 빨강 바탕에 점 몇 개라 "같은 종류 안의 차이"가 약했고 넓은 화면에서 흐렸다.
// 겉날개의 색과 무늬가 뚜렷이 다르게: 실제 무당벌레(한 종)에서 볼 수 있는 다섯 무늬.
//   ① 노란빛 주황 바탕에 점이 없음  ② 붉은 바탕에 점 19개  ③ 주황 바탕에 점 9개  ④ 검정 바탕에 붉은 점 2개  ⑤ 검정 바탕에 붉은 점 4개
// 몸의 모양(머리, 앞가슴등판의 흰 무늬, 다리, 더듬이)은 다섯 마리가 같다(같은 종류라는 단서).
export const LADYBUG_FORMS = [
  { base: ["#FFE08A", "#F7B52C", "#C27C0A"], spot: "" },
  { base: ["#FF9A82", "#E8452F", "#A3261A"], spot: "black19" },
  { base: ["#FFC27A", "#F5841F", "#B8530B"], spot: "black9" },
  { base: ["#5A5A5A", "#232323", "#0B0B0B"], spot: "red2" },
  { base: ["#5A5A5A", "#232323", "#0B0B0B"], spot: "red4" },
] as const;
/** 겉날개 대표색(눈금의 점 다섯과 맞춘다). 검정 바탕은 붉은 점을 함께 그린다. */
export const LADYBUG_SWATCH = LADYBUG_FORMS.map((f) => ({ base: f.base[1], red: f.spot.startsWith("red") }));
let bugN = 0;
/** 무당벌레 한 마리(위에서 본 모습, 원점 가운데, 몸길이 약 64). */
function ladybug(u: string, form: number): string {
  const F = LADYBUG_FORMS[form];
  const g = `${u}e${form}`;
  const R = `${u}r`;
  // 오른쪽 겉날개의 점 자리(왼쪽은 거울). 가운데 이음매의 점(작은방패판 자리)은 따로.
  const right: Record<string, [number, number, number][]> = {
    black19: [[6.5, -9, 2.6], [15, -6.5, 2.6], [10.5, 1.5, 2.7], [19.5, 4, 2.4], [4.5, 10.5, 2.6], [14.5, 13, 2.7], [8.5, 20.5, 2.5], [17.5, 21.5, 2.2], [11.5, 27.5, 2.2]],
    black9: [[9.5, -5, 3.1], [17.5, 7, 3], [6.5, 11, 3], [13.5, 20, 3]],
    red2: [[11.5, -1, 6.6]],
    red4: [[11.5, -6, 5.2], [12, 16, 4.8]],
  };
  const pts = right[F.spot] ?? [];
  const red = F.spot.startsWith("red");
  const spots = pts.flatMap(([x, y, r]) => [[x, y, r], [-x, y, r]]).concat(F.spot === "black19" || F.spot === "black9" ? [[0, -12.5, 2.4]] : [])
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${red ? `url(#${R})` : "#161616"}"/>`).join("");
  // 다리는 위에서 보면 몸 밑으로 조금만 나온다(짧고 가늘게)
  const legs = [-6, 5, 16]
    .map((y, i) => `<path d="M-19 ${y}l-7.5 ${-2 + i * 3}l-1.5 3M19 ${y}l7.5 ${-2 + i * 3}l1.5 3" fill="none" stroke="#161616" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join("");
  return `
    <defs><radialGradient id="${g}" cx=".34" cy=".26" r=".85"><stop offset="0" stop-color="${F.base[0]}"/><stop offset=".55" stop-color="${F.base[1]}"/><stop offset="1" stop-color="${F.base[2]}"/></radialGradient></defs>
    <ellipse cx="2" cy="6" rx="27" ry="30" fill="#0B2A12" opacity=".28"/>
    ${legs}
    <path d="M-3.5 -30.5l-3.5 -6.5M3.5 -30.5l3.5 -6.5" stroke="#161616" stroke-width="1.4" stroke-linecap="round"/>
    <ellipse cx="0" cy="-28" rx="7.5" ry="4.8" fill="#161616"/>
    <path d="M-16 -18C-15 -26 -6 -27.5 0 -27.5C6 -27.5 15 -26 16 -18C10 -15 -10 -15 -16 -18Z" fill="#F2E9D3" stroke="#161616" stroke-width="1.2"/>
    <path d="M-8 -26.8C-7.4 -22.4 -5.6 -19.2 -3 -17.4L0 -21.4L3 -17.4C5.6 -19.2 7.4 -22.4 8 -26.8C3 -25.4 -3 -25.4 -8 -26.8Z" fill="#161616"/>
    <circle cx="-12" cy="-21.5" r="1.6" fill="#161616"/><circle cx="12" cy="-21.5" r="1.6" fill="#161616"/>
    <path d="M-23 -10C-25 10 -16 31 0 33C16 31 25 10 23 -10C19 -17.5 -19 -17.5 -23 -10Z" fill="url(#${g})" stroke="#111" stroke-width="1.4"/>
    ${spots}
    <path d="M0 -15.5V32.5" stroke="#111" stroke-width="1.4"/>
    <ellipse cx="-11" cy="-5" rx="6.5" ry="9.5" fill="#fff" opacity="${red ? ".16" : ".32"}" transform="rotate(18 -11 -5)"/>`;
}
const LEAF_BG = (u: string, w: number, h: number): string => `
  <defs><linearGradient id="${u}lf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CC659"/><stop offset=".55" stop-color="#55A93A"/><stop offset="1" stop-color="#3D8A2A"/></linearGradient>
  <radialGradient id="${u}r" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FF7A6A"/><stop offset=".6" stop-color="#E5352A"/><stop offset="1" stop-color="#A51D14"/></radialGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#${u}lf)"/>
  <path d="M-10 ${h * 0.62}C${w * 0.3} ${h * 0.5} ${w * 0.7} ${h * 0.56} ${w + 10} ${h * 0.44}" fill="none" stroke="#A7DE7E" stroke-width="3" opacity=".7"/>
  ${Array.from({ length: 9 }, (_, i) => {
    const x = (w / 8) * i - 10;
    return `<path d="M${x.toFixed(0)} ${(h * 0.58).toFixed(0)}C${(x + 18).toFixed(0)} ${(h * 0.3).toFixed(0)} ${(x + 34).toFixed(0)} ${(h * 0.12).toFixed(0)} ${(x + 46).toFixed(0)} -6M${x.toFixed(0)} ${(h * 0.58).toFixed(0)}C${(x + 18).toFixed(0)} ${(h * 0.8).toFixed(0)} ${(x + 30).toFixed(0)} ${(h * 0.92).toFixed(0)} ${(x + 40).toFixed(0)} ${h + 6}`;
  }).map((d) => `<path d="${d}" fill="none" stroke="#9AD472" stroke-width="1.4" opacity=".45"/>`).join("")}`;

/** 잎 위의 무당벌레 다섯 마리(가로로 한 줄). w×h 판에 꼭 맞게 놓는다. padTop은 위쪽에 비워 둘 높이(이름표 자리). */
export function ladybugRowSvg(w: number, h: number, alt = "", padTop = 0): string {
  const u = `lbg${++bugN}`;
  const k = Math.min(1, (h - padTop - 8) / 74, w / (5 * 66));
  const step = w / 5;
  const cy = padTop + (h - padTop) / 2 + 4 * k;
  const bugs = [0, 1, 2, 3, 4].map((i) => `<g transform="translate(${(step * (i + 0.5)).toFixed(1)} ${cy.toFixed(1)}) scale(${k.toFixed(3)}) rotate(${[-8, 6, -4, 9, -6][i]})">${ladybug(u, i)}</g>`).join("");
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" ${alt ? `role="img" aria-label="${alt}"` : `aria-hidden="true"`} style="display:block;width:100%;height:100%">${LEAF_BG(u, w, h)}${bugs}</svg>`;
}

/** 무당벌레 한 마리 아이콘(카드용, 잎 바탕). */
export function ladybugIconSvg(form = 2): string {
  const u = `lbg${++bugN}`;
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block;width:100%;height:100%">${LEAF_BG(u, 80, 80)}<g transform="translate(40 42) scale(.92) rotate(-10)">${ladybug(u, form)}</g></svg>`;
}

/** 시험 그림: 한 잎에서 함께 본 같은 종류의 무당벌레 다섯 마리. */
export function ladybugExamFig(alt: string): string {
  return `<div style="border-radius:14px;overflow:hidden">${ladybugRowSvg(340, 120, alt)}</div>`;
}

// ── 짝 잇기 "생물이 주는 것"의 작은 그림(u2l10, 2026-11-15 그래픽 손질, 2026-11-22 생물 셋을 바꿈) ──────────────────
// 생물과 얻는 것이 글뿐이면 도꼬마리 열매와 발명의 아이디어(찍찍이) 같은 짝이 낯설다. 카드마다 작은 코드 그림을 붙인다.
// 왼쪽은 생물(벼 이삭, 버드나무, 목화, 편백나무, 도꼬마리 열매), 오른쪽은 얻는 것(밥, 약, 실과 천, 판재, 찍찍이).
const pa = (bg: string, body: string): string => `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="11" fill="${bg}"/>${body}</svg>`;
export const PAIR_ART: Record<string, string> = {
  rice: pa("#F3F9E3", `
    <path d="M12 36C14 28 15 21 20 13" stroke="#5E9E2F" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 36C9 28 6 24 4 22M13 33C17 27 22 25 27 25" stroke="#7BBE45" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M20 13C24 9 30 9 33 14C35 18 34 23 31 27" stroke="#A6852A" stroke-width="1.4" stroke-linecap="round"/>
    ${[[23, 10.5, -20], [27.5, 10.2, 10], [31, 12.6, 40], [33, 16.6, 70], [33.4, 21, 85], [32, 25.2, 105], [21, 13.5, -50], [25.4, 13.6, 0], [29.4, 15.6, 50], [30.4, 19.8, 80], [29.6, 24, 100]]
      .map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="1.5" transform="rotate(${a} ${x} ${y})" fill="#F2C744" stroke="#B5891C" stroke-width=".7"/>`)
      .join("")}`),
  willow: pa("#EDF7E6", `
    <path d="M19.4 37C19.8 30 20 22 20.4 13" stroke="#7A5232" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M20.4 20C17.6 18.4 16.4 16.2 16 14M20.2 25C23 23.2 24.6 21 25 18.6" stroke="#7A5232" stroke-width="1.5" stroke-linecap="round"/>
    ${["M20 9C13.6 9.4 9.6 14.6 8.6 25", "M20 9C15.6 11.4 13.4 17.4 13.2 28", "M20 9C19 15 18.6 21 19 27", "M20 9C24.4 11.4 26.6 17.4 26.8 28", "M20 9C26.4 9.4 30.4 14.6 31.4 25"]
      .map((d) => `<path d="${d}" stroke="#4F9A35" stroke-width="1.3" stroke-linecap="round"/><path d="${d}" stroke="#8FD16A" stroke-width="3" stroke-linecap="round" stroke-dasharray="2.6 1.8"/>`)
      .join("")}
    <path d="M31.6 31.4l3.6 -1.4 .8 2.2 -3.6 1.4z" fill="#B7864E" stroke="#7A5232" stroke-width=".9" stroke-linejoin="round"/>`),
  cotton: pa("#F6F1EA", `
    <path d="M20 37V27" stroke="#6B8F3A" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M9.6 24.4L15.6 22.6L20 26.4L24.4 22.6L30.4 24.4L27.2 29.4H12.8Z" fill="#9C6B3C" stroke="#6E4824" stroke-width="1.1" stroke-linejoin="round"/>
    ${[[13.8, 18.2, 6], [26.2, 18.2, 6], [20, 12.4, 6.4], [20, 20.6, 5.6]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" stroke="#C9C0B4" stroke-width="1"/><path d="M${x - r * 0.45} ${y - r * 0.1}c${r * 0.3} ${-r * 0.35} ${r * 0.6} ${-r * 0.35} ${r * 0.9} 0" stroke="#E7E1D8" stroke-width=".9" stroke-linecap="round"/>`)
      .join("")}`),
  cocklebur: pa("#F4F1E6", `
    <g transform="rotate(-24 20 21)">
      ${Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const x1 = 20 + Math.cos(a) * 8.2;
        const y1 = 21 + Math.sin(a) * 11.2;
        const x2 = 20 + Math.cos(a) * 11.4;
        const y2 = 21 + Math.sin(a) * 14.6;
        return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}q${(Math.cos(a + 1.6) * 1.8).toFixed(1)} ${(Math.sin(a + 1.6) * 1.8).toFixed(1)} ${(Math.cos(a + 2.6) * 1.4).toFixed(1)} ${(Math.sin(a + 2.6) * 1.4).toFixed(1)}" stroke="#6E5A2A" stroke-width="1.1" stroke-linecap="round"/>`;
      }).join("")}
      <ellipse cx="20" cy="21" rx="8.6" ry="11.6" fill="#B49D5E" stroke="#6E5A2A" stroke-width="1.3"/>
      <ellipse cx="17.6" cy="16.6" rx="2.6" ry="4.6" fill="#D2BF85" opacity=".7"/>
      <path d="M17.4 9.8L15.6 5.6M22.4 9.8L24.6 5.8" stroke="#6E5A2A" stroke-width="1.8" stroke-linecap="round"/>
    </g>`),
  hinoki: pa("#EBF6EC", `
    <path d="M18.6 31h2.8v6h-2.8z" fill="#8A5A34"/>
    <path d="M20 4L28 15H24L31 24H26L33 32H7L14 24H9L16 15H12Z" fill="#2F8A4C" stroke="#1E5E33" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M20 8L16.5 13.5M20 16L14 22.5M20 25L12 31" stroke="#4DB06A" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>`),
  bowl: pa("#FFF3E4", `
    <path d="M9 21C9 15 14 11 20 11C26 11 31 15 31 21Z" fill="#FFFFFF" stroke="#CDBFA8" stroke-width="1.1"/>
    ${[[14, 17], [18, 14.5], [22, 15], [26, 17.5], [17, 19], [21.5, 18.6], [25, 20]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="1" fill="#F2EDE2" stroke="#D8CDB6" stroke-width=".5"/>`).join("")}
    <path d="M6 21H34C33 28 28 32 20 32C12 32 7 28 6 21Z" fill="#4C7BD0" stroke="#2F57A3" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M10 25H30" stroke="#A9C3F0" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M15 32h10l-1 3h-8z" fill="#2F57A3"/>`),
  medicine: pa("#EEF2FF", `
    <g transform="rotate(-38 18 20)"><rect x="6" y="14" width="24" height="12" rx="6" fill="#fff" stroke="#5470C9" stroke-width="1.3"/><path d="M18 14h6a6 6 0 0 1 0 12h-6z" fill="#5C7CFA" stroke="#5470C9" stroke-width="1.3"/><path d="M9 17.6h6" stroke="#E5EAFB" stroke-width="1.4" stroke-linecap="round"/></g>
    <circle cx="30" cy="30" r="5.4" fill="#FFF7E0" stroke="#D3A72F" stroke-width="1.2"/><path d="M26.4 30h7.2" stroke="#D3A72F" stroke-width="1.1"/>`),
  fiber: pa("#FBF1F6", `
    <path d="M5 30C11 25 15 31 21 27C26 24 30 28 35 25V35H5Z" fill="#F4E4EC" stroke="#C99AB2" stroke-width="1.1"/>
    <path d="M8 33C13 30 17 33 22 30C26 28 30 30 33 29" stroke="#E2C2D3" stroke-width="1"/>
    <rect x="13" y="6" width="14" height="4" rx="1.5" fill="#B0804F" stroke="#7E5631" stroke-width="1"/>
    <rect x="13" y="20" width="14" height="4" rx="1.5" fill="#B0804F" stroke="#7E5631" stroke-width="1"/>
    <rect x="14.5" y="10" width="11" height="10" fill="#FFFDF8" stroke="#C9C0AE" stroke-width="1"/>
    <path d="M15 12.5h10M15 15h10M15 17.5h10" stroke="#E6DDCB" stroke-width="1"/>
    <path d="M25.5 15C30 15 31 19 28 22" stroke="#D6CDB8" stroke-width="1.2" stroke-linecap="round"/>`),
  timber: pa("#F7EEE3", `
    ${[[6, 25], [9, 18.5], [12, 12]].map(([x, y]) => `<g><path d="M${x} ${y}h22l4 4h-22z" fill="#E8C08A" stroke="#9A6A36" stroke-width="1.1" stroke-linejoin="round"/><path d="M${x + 4} ${y + 4}h22v4.4h-22z" fill="#D4A469" stroke="#9A6A36" stroke-width="1.1"/><path d="M${x} ${y}v4.4l4 4v-4.4z" fill="#F1D4A6" stroke="#9A6A36" stroke-width="1.1" stroke-linejoin="round"/><path d="M${x + 8} ${y + 6.2}h12M${x + 7} ${y + 1.6}h14" stroke="#B88449" stroke-width=".7" opacity=".8"/></g>`).join("")}`),
  velcro: pa("#EEF3FB", `
    <rect x="5" y="8" width="30" height="7" rx="2.4" fill="#4C7BD0" stroke="#2F57A3" stroke-width="1.1"/>
    ${[9, 14, 19, 24, 29].map((x) => `<path d="M${x} 15V19.6c0 1.6 2.4 1.6 2.4 0" stroke="#2F57A3" stroke-width="1.2" stroke-linecap="round"/>`).join("")}
    ${[10.4, 15.4, 20.4, 25.4, 30.4].map((x) => `<ellipse cx="${x}" cy="23.6" rx="1.9" ry="2.4" stroke="#C2410C" stroke-width="1.1"/>`).join("")}
    <rect x="5" y="25.6" width="30" height="7" rx="2.4" fill="#F08C00" stroke="#C2410C" stroke-width="1.1"/>`),
};

// ── 두 곳에 나뉘어 사는 달팽이 무리(u2l7 문제, 2026-11-22) ─────────────────
// 껍데기 색에 변이가 있는 한 종류의 달팽이가 (가) 갈색 낙엽이 쌓인 숲 바닥과 (나) 초록 풀밭에 똑같이 섞여 산다. 두 곳 모두 위에 새가 있다.
// 오랜 시간 뒤의 결과(정답)를 미리 보이지 않게, 두 판의 달팽이는 자리와 색이 모두 같다(갈색 둘, 연두색 둘). 다른 것은 바닥뿐이다.
// 껍데기 색은 타고나 바뀌지 않는다(실제 숲달팽이의 껍데기 색 변이와 새의 포식에서 빌린 장면). 몸을 바탕색에 맞춰 바꾸는 메뚜기 같은 동물은 쓰지 않는다.
// 껍데기 색 [밝은 면, 바탕, 그늘·외곽선, 나선 띠]. 띠는 바탕보다 조금 짙어 껍데기의 '색'은 그대로 읽힌다(갈색, 연두색)
const SNAIL_SHELL = {
  brown: ["#E2B27A", "#A86C35", "#5B3716", "#7A4A20"],
  green: ["#F3F9C4", "#C3D962", "#6F8A26", "#94AF3C"],
} as const;
/** 껍데기 나선(로그 나선에 가깝게 바깥으로 갈수록 빨리 벌어진다). 가운데 (cx, cy), 반지름 r0 → r1, 돌린 수 turns. */
function shellSpiral(cx: number, cy: number, r0: number, r1: number, turns: number, th0: number, squash: number): string {
  const T = turns * 2 * Math.PI;
  let d = "";
  for (let t = 0; t <= T + 1e-6; t += 0.16) {
    const r = r0 + (r1 - r0) * Math.pow(t / T, 1.25);
    const a = th0 + t;
    d += `${d ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r * squash).toFixed(2)}`;
  }
  return d;
}
/** 옆에서 본 달팽이 한 마리(원점 = 발 가운데 바닥, 오른쪽을 본다, 높이 약 27).
 *  몸: 꼬리로 갈수록 가늘어지는 발, 목의 주름, 점액 광택, 눈이 달린 긴 더듬이 한 쌍과 짧은 더듬이 한 쌍.
 *  껍데기: 왼쪽 위 빛의 입체 그라데이션, 나선 봉합선과 나선 띠, 바깥 소용돌이의 성장선, 몸이 나오는 입구 테두리, 반짝임. */
function snail(u: string, x: number, y: number, k: number, kind: "brown" | "green", flip = 1): string {
  const [, , dark, band] = SNAIL_SHELL[kind];
  const cx = -2.4, cy = -13.2, R = 11.6, SQ = 0.94, TH0 = -2.4, TURNS = 2.3;
  const suture = shellSpiral(cx, cy, 0.6, R - 0.4, TURNS, TH0, SQ);
  const stripe = shellSpiral(cx, cy, 0.3, R - 3.3, TURNS - 0.15, TH0 + 0.5, SQ);
  // 바깥 소용돌이의 성장선(껍데기가 자라며 남긴 가는 결)
  const T = TURNS * 2 * Math.PI;
  let growth = "";
  for (let i = 0; i < 18; i++) {
    const t = T - 2 * Math.PI + 0.35 + i * ((2 * Math.PI - 0.6) / 18);
    const ro = 0.6 + (R - 0.4 - 0.6) * Math.pow(t / T, 1.25);
    const a = TH0 + t;
    const p = (r: number): string => `${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r * SQ).toFixed(2)}`;
    growth += `M${p(ro - 0.6)}L${p(ro - 3)}`;
  }
  return `<g transform="translate(${x} ${y}) scale(${(flip * k).toFixed(3)} ${k.toFixed(3)})">
    <ellipse cx="1" cy="1.6" rx="22" ry="3" fill="#1B1206" opacity=".2"/>
    <path d="M-21.5 0.4C-16.5 -2.8 -8.5 -4.3 0 -4.7C6 -5 10.2 -6.6 13.4 -10.4C15.8 -13.4 21.6 -14.6 23.4 -11.1C24.8 -8.3 23.2 -4.4 20.7 -2.2C19.1 -0.8 17.1 0.7 14.6 0.9L-12 1.3C-16.2 1.3 -19.8 1 -21.5 0.4Z" fill="url(#${u}body)" stroke="#765C3C" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M-19.5 0.9H14.8" stroke="#8E7350" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>
    <path d="M-15 -2.1C-8 -3.7 0 -3.9 6.4 -3.9" fill="none" stroke="#FFFFFF" stroke-width="1.1" stroke-linecap="round" opacity=".6"/>
    <path d="M10.6 -7.4q1.7 -1.5 3.4 -1M12.6 -9.6q1.4 -1.3 2.9 -0.9M19.4 -5.6q1.6 -0.4 2.6 0.6" fill="none" stroke="#8E7350" stroke-width=".8" stroke-linecap="round" opacity=".7"/>
    ${[[-16, -1.1], [-12, -1.9], [-8, -2.4], [9, -3.4], [12.6, -4.6], [15.8, -6.4], [16.4, -2.4], [18.8, -9.8]].map(([px, py]) => `<circle cx="${px}" cy="${py}" r=".55" fill="#8E7350" opacity=".38"/>`).join("")}
    <path d="M19.8 -13.4C20.4 -16.6 20.8 -19.4 21.6 -22.2M22.6 -12.8C24.2 -15.2 25.8 -17.4 27.8 -19.4" fill="none" stroke="#8A6E4B" stroke-width="1.7" stroke-linecap="round"/>
    <circle cx="21.8" cy="-22.8" r="1.8" fill="#4A3A26"/><circle cx="21.3" cy="-23.3" r=".55" fill="#FFFFFF" opacity=".8"/>
    <circle cx="28.2" cy="-19.9" r="1.8" fill="#4A3A26"/><circle cx="27.7" cy="-20.4" r=".55" fill="#FFFFFF" opacity=".8"/>
    <path d="M23.6 -8.8C24.9 -8.8 26.1 -8.3 27 -7.6" fill="none" stroke="#8A6E4B" stroke-width="1.3" stroke-linecap="round"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${(R * SQ).toFixed(2)}" fill="url(#${u}${kind})" stroke="${dark}" stroke-width="1.3"/>
    <path d="${stripe}" fill="none" stroke="${band}" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>
    <path d="${growth}" stroke="${dark}" stroke-width=".7" stroke-linecap="round" opacity=".32"/>
    <path d="${suture}" fill="none" stroke="${dark}" stroke-width="1.15" stroke-linecap="round" opacity=".9"/>
    <path d="M5.6 -4.9C7.6 -6.2 9.4 -7.8 10.2 -10.2" fill="none" stroke="${dark}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M5.9 -5.6C7.6 -6.8 9 -8.2 9.6 -10" fill="none" stroke="#FFFFFF" stroke-width=".8" stroke-linecap="round" opacity=".45"/>
    <ellipse cx="-7.4" cy="-19.6" rx="3.8" ry="2" fill="#FFFFFF" opacity=".55" transform="rotate(-28 -7.4 -19.6)"/>
    <circle cx="-2.6" cy="-22.2" r=".9" fill="#FFFFFF" opacity=".6"/>
  </g>`;
}
/** 가지에 앉아 아래를 내려다보는 작은 새(원점 = 발, 왼쪽을 본다). */
function perchBird(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})">
    <path d="M-30 1.5H30" stroke="#6B4A2B" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M6 -6L22 -2L20 2L4 -1Z" fill="#5E5446" stroke="#3E362C" stroke-width="1" stroke-linejoin="round"/>
    <ellipse cx="-1" cy="-8" rx="10.5" ry="7.4" fill="#8C7A62" stroke="#4E4334" stroke-width="1.2"/>
    <circle cx="-10" cy="-13" r="5.6" fill="#8C7A62" stroke="#4E4334" stroke-width="1.2"/>
    <path d="M-15.4 -13.6L-20.6 -10.4L-15 -11" fill="#E0A030" stroke="#9A6A14" stroke-width=".9" stroke-linejoin="round"/>
    <circle cx="-11.6" cy="-14.2" r="1.2" fill="#1E1A14"/>
    <path d="M-4 -1.2V1.5M1 -1V1.5" stroke="#4E4334" stroke-width="1.3" stroke-linecap="round"/>
  </g>`;
}
let snailN = 0;
/** (가) 낙엽이 쌓인 숲 바닥, (나) 풀밭. 두 판에 같은 자리, 같은 색의 달팽이 넷과 새 한 마리. 폭 344, 높이 150. */
export function snailHabitatPairFig(): string {
  const u = `snl${++snailN}`;
  const PW = 164;
  const PH = 116;
  const grad = (id: string, c: readonly string[]): string => `<radialGradient id="${u}${id}" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="${c[0]}"/><stop offset=".6" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient>`;
  // 판 안의 달팽이 자리와 색(두 판이 같다). 두 줄에 둘씩, 세부(껍데기 띠, 더듬이 눈)가 폰에서도 보이게 크게 그린다
  const SN: [number, number, "brown" | "green", number][] = [[33, 76, "brown", 1], [128, 76, "green", -1], [55, 108, "green", 1], [125, 108, "brown", -1]];
  const leaves = Array.from({ length: 16 }, (_, i) => {
    const lx = 8 + ((i * 37) % 150), ly = 52 + ((i * 23) % 60), a = (i * 53) % 180;
    const col = ["#A8682F", "#7A4B22", "#C99A5A", "#93602F"][i % 4];
    return `<ellipse cx="${lx}" cy="${ly}" rx="${9 + (i % 3) * 2}" ry="${4 + (i % 2)}" transform="rotate(${a} ${lx} ${ly})" fill="${col}" stroke="#5E3B1A" stroke-width=".7" opacity=".95"/>`;
  }).join("");
  const blades = Array.from({ length: 30 }, (_, i) => {
    const bx = 3 + ((i * 29) % 160), by = 54 + ((i * 17) % 62), h = 10 + (i % 4) * 4, lean = ((i % 5) - 2) * 2;
    return `<path d="M${bx} ${by}q${lean} ${-h * 0.6} ${lean * 1.6} ${-h}" fill="none" stroke="${["#3E8A2A", "#7CC659", "#58A83A"][i % 3]}" stroke-width="2" stroke-linecap="round"/>`;
  }).join("");
  const panel = (px: number, kind: "litter" | "grass", tag: string): string => `
    <g transform="translate(${px} 0)">
      <clipPath id="${u}c${kind}"><rect x="0" y="0" width="${PW}" height="${PH}" rx="12"/></clipPath>
      <g clip-path="url(#${u}c${kind})">
        <rect width="${PW}" height="${PH}" fill="url(#${u}${kind})"/>
        ${kind === "litter" ? leaves : blades}
        ${SN.map(([x, y, c, f]) => snail(u, x, y, 1.02, c, f)).join("")}
        ${perchBird(124, 24)}
      </g>
      <rect x="0" y="0" width="${PW}" height="${PH}" rx="12" fill="none" stroke="#C9CFD6" stroke-width="1.2"/>
      <text x="${PW / 2}" y="${PH + 22}" text-anchor="middle" font-size="14" font-weight="700" fill="#4E5968">${tag}</text>
    </g>`;
  return `<svg viewBox="0 0 344 ${PH + 30}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="(가) 낙엽이 쌓인 숲 바닥과 (나) 풀밭. 두 곳에 껍데기 색이 갈색인 달팽이와 연두색인 달팽이가 둘씩 똑같이 섞여 있고, 두 곳 모두 위쪽 가지에 새가 앉아 있다">
    <defs>
      ${grad("brown", SNAIL_SHELL.brown)}${grad("green", SNAIL_SHELL.green)}
      <linearGradient id="${u}body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBDDBF"/><stop offset=".55" stop-color="#D3BC93"/><stop offset="1" stop-color="#B0956C"/></linearGradient>
      <linearGradient id="${u}litter" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A06A"/><stop offset=".45" stop-color="#A9743F"/><stop offset="1" stop-color="#83552B"/></linearGradient>
      <linearGradient id="${u}grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B7E08F"/><stop offset=".45" stop-color="#86C55C"/><stop offset="1" stop-color="#5C9E3B"/></linearGradient>
    </defs>
    ${panel(0, "litter", "(가)")}
    ${panel(180, "grass", "(나)")}
  </svg>`;
}

/** (나) 생태계의 먹이 관계 그림(u2l10 문제). 랩의 무대와 같은 자리, 같은 화살표를 밝은 바탕에 그린다.
 *  화살표는 먹히는 생물에서 먹는 생물 쪽을 가리킨다. 그림 칸에서 폭에 맞춰 늘어나도 비율은 그대로다. */
export function foodWebFig(): string {
  return `<svg class="fwb-fig" viewBox="96 38 248 186" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="아홉 가지 생물의 먹이 관계. 화살표는 먹히는 생물에서 먹는 생물 쪽을 가리킨다">${webGroup("B")}</svg>`;
}

