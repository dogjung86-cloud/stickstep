// [중2 Ⅴ v5] 랩 무대 그림의 공용 부품(2026-11-15, "식물의 잎, 줄기, 뿌리와 그 속의 입자를 교과서 수준으로" 다시 그리기).
//   층 무대   g5Layers: 무대 SVG를 층(g)으로 나누고 바뀐 층만 갈아 끼운다(움직이는 동안 큰 그림을 다시 만들지 않는다).
//   입자      mol(산소, 이산화 탄소, 물 분자 모형), glucose(육각 고리), sucrose(고리 둘), starchChain(고리 사슬), starchGrain(녹말 알갱이), spark(에너지).
//   식물      lettuce(주름진 상추 포기), leafBlade(톱니와 그물맥이 있는 잎), roots(원뿌리, 곁뿌리, 뿌리털), pot(화분).
//   기구      container(뚜껑과 걸쇠가 있는 투명 용기와 센서 둘), deskLamp(목이 휘는 발광 다이오드 전등), foil(구겨진 알루미늄박).
//   빛        sun(해), beam(빛줄기).
// 색은 kit의 P 팔레트(산소 하늘색, 이산화 탄소 회보라, 녹말 남보라, 설탕 앰버, 에너지 노랑)를 그대로 쓴다. 그 위에 음영(그라데이션)만 더한다.
// 그라데이션 id는 무대마다 다른 접두(ns)를 붙인다(라우터가 이전 화면을 남겨 두어 같은 id가 있으면 숨은 쪽이 잡힌다. SCI_GUIDE 상추 항목).
// 좌표는 무대 346×230 설계 px. 무대 안 글자는 12px 이상.

import { P, type G5Lab } from "./kit";

export type Pt = [number, number];

// ── 층 무대 ─────────────────────────────────────────────────────────
export interface G5Layers {
  el: SVGSVGElement;
  /** 층 하나의 내용을 바꾼다. 앞서 넣은 글과 같으면 건드리지 않는다. */
  set: (name: string, html: string) => void;
}
let nsSeq = 0;
/** 무대마다 다른 id 접두. */
export const newNs = (k: string): string => `g5${k}${(++nsSeq).toString(36)}-`;

export function g5Layers(lab: G5Lab, aria: string, names: string[]): G5Layers {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 346 230");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", aria);
  const groups = new Map<string, { g: SVGGElement; html: string }>();
  names.forEach((n) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.dataset.l = n;
    svg.appendChild(g);
    groups.set(n, { g, html: "" });
  });
  lab.f.stage.appendChild(svg);
  return {
    el: svg,
    set: (name, html) => {
      const L = groups.get(name);
      if (!L || L.html === html) return;
      L.html = html;
      L.g.innerHTML = html;
    },
  };
}

/** 같은 열쇠면 다시 만들지 않는 작은 저장소(그림 문자열은 수백 개의 도형이라 만드는 데 시간이 든다). */
export function memo<T>(): (key: string, make: () => T) => T {
  const m = new Map<string, T>();
  return (key, make) => {
    let v = m.get(key);
    if (v === undefined) {
      v = make();
      if (m.size > 60) m.clear();
      m.set(key, v);
    }
    return v;
  };
}

// ── 수 도구 ─────────────────────────────────────────────────────────
/** 씨앗이 같으면 같은 수열(그림이 그릴 때마다 바뀌지 않게). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const f1 = (v: number): string => (Math.round(v * 10) / 10).toString();
const pt = (p: Pt): string => `${f1(p[0])} ${f1(p[1])}`;
/** 점들을 지나는 매끈한 곡선(캣멀롬을 3차 베지어로). closed면 닫힌 모양. */
export function smooth(pts: Pt[], closed = false, tension = 1): string {
  const n = pts.length;
  if (n < 2) return "";
  const at = (i: number): Pt => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pt(pts[0])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const k = tension / 6;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return closed ? d + " Z" : d;
}
export const poly = (pts: Pt[]): string => "M" + pts.map(pt).join(" L") + " Z";

// ── 글 ─────────────────────────────────────────────────────────────
/** 이름표: 글자에 무대 바탕색 테두리(할로). 12px 이상. */
export function label(x: number, y: number, t: string, o: { fill?: string; size?: number; anchor?: string; weight?: number; halo?: string } = {}): string {
  return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${o.anchor ?? "middle"}" font-size="${o.size ?? 12.5}" font-weight="${o.weight ?? 800}" fill="${o.fill ?? "#FFFFFF"}" stroke="${o.halo ?? "#0B1524"}" stroke-width="3.2" stroke-linejoin="round" paint-order="stroke">${t}</text>`;
}
/** 이름표와 가리키는 가는 선(끝에 작은 점). */
export function callout(from: Pt, to: Pt, t: string, o: { fill?: string; anchor?: string; line?: string; dy?: number } = {}): string {
  const line = o.line ?? "#C6D3E6";
  return `<path d="M${pt(from)} L${pt(to)}" stroke="${line}" stroke-width="1" fill="none" opacity=".85"/><circle cx="${f1(from[0])}" cy="${f1(from[1])}" r="1.8" fill="${line}"/>` + label(to[0] + (o.anchor === "end" ? -3 : o.anchor === "middle" ? 0 : 3), to[1] + (o.dy ?? 4.5), t, { fill: o.fill, anchor: o.anchor ?? "start", size: 12 });
}

// ── 입자 ────────────────────────────────────────────────────────────
// 분자 모형: 산소는 원자 둘, 이산화 탄소는 가운데 탄소와 양옆 산소 셋(일직선), 물은 산소 하나와 수소 둘(굽은 모양).
// 색은 분자마다 하나(범례의 색)이고, 이산화 탄소의 가운데 원자만 조금 어둡게 해서 다른 원자임을 보인다. 화학식은 쓰지 않는다.
const SPH: Record<string, [string, string, string]> = {
  o2: ["#E4F4FF", "#7CC8FF", "#2C6CA6"],
  co2: ["#F1ECFF", "#BBA8F5", "#5B45A8"],
  c: ["#D9D3EE", "#8E83B8", "#433A6E"],
  h2o: ["#DDF0FF", "#5AB0F2", "#1D5C96"],
  h: ["#FFFFFF", "#E4F1FB", "#8FB2CF"],
  sugar: ["#FFF1CF", "#F5B544", "#9A6406"],
  starch: ["#E2E2FF", "#7474F2", "#2E2E9A"],
  energy: ["#FFFBE0", "#FFD43B", "#C98A00"],
};
/** 입자 그라데이션(무대 defs에 한 번). */
export function particleDefs(ns: string): string {
  return Object.entries(SPH)
    .map(([k, [a, b, c]]) => `<radialGradient id="${ns}p-${k}" cx=".36" cy=".32" r=".78"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`)
    .join("") +
    `<linearGradient id="${ns}p-hexS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE2A0"/><stop offset=".55" stop-color="#F5B544"/><stop offset="1" stop-color="#C98410"/></linearGradient>` +
    `<linearGradient id="${ns}p-hexN" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B7B7FF"/><stop offset=".55" stop-color="#6C6CF0"/><stop offset="1" stop-color="#3B3BB8"/></linearGradient>` +
    `<radialGradient id="${ns}p-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE98A" stop-opacity=".95"/><stop offset=".45" stop-color="#FFD43B" stop-opacity=".45"/><stop offset="1" stop-color="#FFD43B" stop-opacity="0"/></radialGradient>`;
}
/** 애니메이션 클래스와 스타일을 바깥 g에 건다(CSS transform 애니메이션이 SVG transform 속성을 덮어 원점으로 튀지 않게). */
const wrapAnim = (inner: string, o: { cls?: string; style?: string; op?: number }): string =>
  o.cls || o.style || o.op !== undefined ? `<g${o.cls ? ` class="${o.cls}"` : ""}${o.style ? ` style="${o.style}"` : ""}${o.op !== undefined ? ` opacity="${o.op}"` : ""}>${inner}</g>` : inner;
const ball = (ns: string, k: string, x: number, y: number, r: number): string =>
  `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#${ns}p-${k})" stroke="${SPH[k][2]}" stroke-width=".7"/>`;
export type Gas = "o2" | "co2" | "h2o";
/** 분자 하나. s=1이면 산소 폭 약 13px, 이산화 탄소 약 17px. rot은 도. */
export function mol(ns: string, kind: Gas, x: number, y: number, s = 1, o: { rot?: number; cls?: string; op?: number; style?: string } = {}): string {
  let b = "";
  if (kind === "o2") b = ball(ns, "o2", -2.7 * s, 0, 3.8 * s) + ball(ns, "o2", 2.7 * s, 0, 3.8 * s);
  else if (kind === "co2") b = ball(ns, "co2", -5.2 * s, 0, 3.3 * s) + ball(ns, "co2", 5.2 * s, 0, 3.3 * s) + ball(ns, "c", 0, 0, 3.2 * s);
  else b = ball(ns, "h", -3.9 * s, -2.4 * s, 2.3 * s) + ball(ns, "h", 3.9 * s, -2.4 * s, 2.3 * s) + ball(ns, "h2o", 0, 0.7 * s, 3.9 * s);
  const tr = `translate(${f1(x)} ${f1(y)})${o.rot ? ` rotate(${f1(o.rot)})` : ""}`;
  return wrapAnim(`<g transform="${tr}">${b}</g>`, o);
}
const hexPts = (x: number, y: number, r: number, rot = 0): string =>
  [0, 1, 2, 3, 4, 5].map((k) => `${f1(x + Math.cos(((k * 60 + rot) * Math.PI) / 180) * r)},${f1(y + Math.sin(((k * 60 + rot) * Math.PI) / 180) * r)}`).join(" ");
/** 포도당(육각 고리 하나, 앰버). */
export function glucose(ns: string, x: number, y: number, r = 6, o: { cls?: string; style?: string; op?: number } = {}): string {
  return `<g${o.cls ? ` class="${o.cls}"` : ""}${o.style ? ` style="${o.style}"` : ""}${o.op !== undefined ? ` opacity="${o.op}"` : ""}><polygon points="${hexPts(x, y, r)}" fill="url(#${ns}p-hexS)" stroke="#8A5A00" stroke-width=".9" stroke-linejoin="round"/><polygon points="${hexPts(x, y, r * 0.5)}" fill="none" stroke="#FFF1CF" stroke-width=".7" opacity=".75"/></g>`;
}
/** 설탕(고리 둘이 이어진 것, 앰버). 책의 그림처럼 육각 고리 둘로 그린다. */
export function sucrose(ns: string, x: number, y: number, r = 5, o: { cls?: string; style?: string; rot?: number } = {}): string {
  const dx = r * 0.95;
  const one = (cx: number): string => `<polygon points="${hexPts(cx, 0, r)}" fill="url(#${ns}p-hexS)" stroke="#8A5A00" stroke-width=".9" stroke-linejoin="round"/>`;
  return wrapAnim(`<g transform="translate(${f1(x)} ${f1(y)})${o.rot ? ` rotate(${o.rot})` : ""}">${one(-dx)}${one(dx)}<circle cx="0" cy="0" r="${f1(r * 0.28)}" fill="#FFE9B0" stroke="#8A5A00" stroke-width=".6"/></g>`, o);
}
/** 녹말(포도당 고리가 길게 이어진 사슬, 남보라). n개의 고리, 사슬은 살짝 굽는다. */
export function starchChain(ns: string, x: number, y: number, n: number, r = 4.6, o: { rot?: number; cls?: string; style?: string; bend?: number } = {}): string {
  let s = "";
  const step = r * 1.72;
  const bend = o.bend ?? 0.6;
  for (let i = 0; i < n; i++) {
    const u = i - (n - 1) / 2;
    const cx = u * step;
    const cy = Math.sin(i * 1.1) * bend * r * 0.5;
    s += `<polygon points="${hexPts(cx, cy, r, 30)}" fill="url(#${ns}p-hexN)" stroke="#23237A" stroke-width=".8" stroke-linejoin="round"/>`;
  }
  return wrapAnim(`<g transform="translate(${f1(x)} ${f1(y)})${o.rot ? ` rotate(${o.rot})` : ""}">${s}</g>`, o);
}
/** 녹말 알갱이(엽록체나 저장 기관 속, 겹겹의 결이 보이는 둥근 알). */
export function starchGrain(x: number, y: number, rx: number, ry: number, o: { rot?: number; fill?: string; ring?: string; op?: number } = {}): string {
  const fill = o.fill ?? "#E9E4CF";
  const ring = o.ring ?? "#B8AE88";
  const rings = [0.72, 0.46].map((k) => `<ellipse cx="${f1(-rx * 0.12)}" cy="${f1(ry * 0.08)}" rx="${f1(rx * k)}" ry="${f1(ry * k)}" fill="none" stroke="${ring}" stroke-width=".55" opacity=".8"/>`).join("");
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${o.rot ?? 0})"${o.op !== undefined ? ` opacity="${o.op}"` : ""}><ellipse rx="${f1(rx)}" ry="${f1(ry)}" fill="${fill}" stroke="${ring}" stroke-width=".7"/>${rings}<circle cx="${f1(-rx * 0.18)}" cy="${f1(ry * 0.1)}" r="${f1(Math.min(rx, ry) * 0.14)}" fill="${ring}"/></g>`;
}
/** 에너지(빛나는 네 갈래 별). */
export function spark(ns: string, x: number, y: number, r = 8, o: { cls?: string; style?: string } = {}): string {
  const p = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
    const a = (k * Math.PI) / 4 - Math.PI / 2;
    const rr = k % 2 ? r * 0.3 : r;
    return `${f1(x + Math.cos(a) * rr)},${f1(y + Math.sin(a) * rr)}`;
  });
  return `<g${o.cls ? ` class="${o.cls}"` : ""}${o.style ? ` style="${o.style}"` : ""}><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 1.25)}" fill="url(#${ns}p-glow)"/><polygon points="${p.join(" ")}" fill="#FFE066" stroke="#C98A00" stroke-width=".7" stroke-linejoin="round"/></g>`;
}

// ── 빛 ─────────────────────────────────────────────────────────────
export function sunDefs(ns: string): string {
  return `<radialGradient id="${ns}sun" cx=".4" cy=".36" r=".7"><stop offset="0" stop-color="#FFFBE3"/><stop offset=".45" stop-color="#FFE066"/><stop offset="1" stop-color="#F2A50C"/></radialGradient>` +
    `<radialGradient id="${ns}sunGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE38A" stop-opacity=".55"/><stop offset=".55" stop-color="#FFD43B" stop-opacity=".16"/><stop offset="1" stop-color="#FFD43B" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="${ns}beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFE380" stop-opacity=".0"/><stop offset=".25" stop-color="#FFE380" stop-opacity=".55"/><stop offset="1" stop-color="#FFE380" stop-opacity=".08"/></linearGradient>`;
}
/** 해. on이 false면 어둡게(빛이 없음). */
export function sun(ns: string, x: number, y: number, r: number, on = true): string {
  if (!on) return `<g opacity=".32"><circle cx="${x}" cy="${y}" r="${r}" fill="#4A4A3A" stroke="#77775E" stroke-width="1.2"/>${rays(x, y, r, "#77775E")}</g>`;
  return `<circle cx="${x}" cy="${y}" r="${f1(r * 2.6)}" fill="url(#${ns}sunGlow)"/>${rays(x, y, r, "#FFD43B")}<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${ns}sun)" stroke="#E39B0B" stroke-width="1"/>`;
}
function rays(x: number, y: number, r: number, c: string): string {
  return Array.from({ length: 12 }, (_, k) => {
    const a = (k * Math.PI) / 6 + 0.13;
    const r0 = r * 1.3;
    const r1 = r * (k % 2 ? 1.62 : 1.85);
    return `<line x1="${f1(x + Math.cos(a) * r0)}" y1="${f1(y + Math.sin(a) * r0)}" x2="${f1(x + Math.cos(a) * r1)}" y2="${f1(y + Math.sin(a) * r1)}" stroke="${c}" stroke-width="${k % 2 ? 1.6 : 2.2}" stroke-linecap="round"/>`;
  }).join("");
}
/** 빛줄기: a에서 b로 가는 가늘어지는 빛의 띠. */
export function beam(ns: string, a: Pt, b: Pt, w: number, o: { cls?: string; op?: number } = {}): string {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return wrapAnim(`<g transform="translate(${f1(a[0])} ${f1(a[1])}) rotate(${f1(ang)})"><path d="M0 ${f1(-w * 0.35)} L${f1(len)} ${f1(-w / 2)} L${f1(len)} ${f1(w / 2)} L0 ${f1(w * 0.35)} Z" fill="url(#${ns}beam)"/><line x1="0" y1="0" x2="${f1(len)}" y2="0" stroke="#FFE98A" stroke-width=".9" stroke-dasharray="2 5" opacity=".7"/></g>`, o);
}

// ── 식물 ────────────────────────────────────────────────────────────
export function plantDefs(ns: string): string {
  const lin = (id: string, stops: [number, string][], x2 = 0, y2 = 1, x1 = 0, y1 = 0): string =>
    `<linearGradient id="${ns}${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
  return (
    // 상추 잎(아래가 밑동): 바깥 잎은 짙고 속잎은 연하다
    lin("lb", [[0, "#3F8F45"], [0.55, "#2C7A3A"], [1, "#9ACB7A"]], 0, 0, 0, 1) +
    lin("lm", [[0, "#5FB45E"], [0.6, "#4BA153"], [1, "#C4E59C"]], 0, 0, 0, 1) +
    lin("lf", [[0, "#97D77D"], [0.6, "#7DC56E"], [1, "#E4F5C2"]], 0, 0, 0, 1) +
    lin("lh", [[0, "#D7F1B0"], [0.7, "#C2E89A"], [1, "#F2FBDF"]], 0, 0, 0, 1) +
    // 쌍떡잎식물의 잎(밑동에서 끝으로): 윗면은 짙은 초록, 빛 받는 쪽이 밝다
    lin("leaf", [[0, "#2F8A3E"], [0.5, "#3E9E4C"], [1, "#2A7A38"]], 1, 1) +
    lin("leafHi", [[0, "#6CC070"], [1, "#2F8A3E"]], 1, 1) +
    // 줄기(가로 음영)
    lin("stem", [[0, "#2F6F2F"], [0.35, "#5FA84E"], [0.6, "#4E9A43"], [1, "#2A5F2A"]], 1, 0) +
    // 뿌리(가로 음영)
    lin("root", [[0, "#B59E72"], [0.4, "#EFE3C4"], [1, "#A88F62"]], 1, 0) +
    // 화분
    lin("pot", [[0, "#8C4F2A"], [0.3, "#C9824F"], [0.62, "#B8703E"], [1, "#7A4122"]], 1, 0) +
    lin("potRim", [[0, "#A9653A"], [0.35, "#DC9864"], [1, "#8C4F2A"]], 1, 0) +
    `<radialGradient id="${ns}soilTop" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#5A3E2B"/><stop offset="1" stop-color="#3A271A"/></radialGradient>`
  );
}

/** 상추 잎 한 장(밑동이 0,0이고 위로 자란다). L 길이, W 반폭, 주름 ruff, 씨앗 seed. */
function lettuceLeaf(L: number, W: number, ruff: number, seed: number): { d: string; veins: string; folds: string } {
  const r = rng(seed);
  const n = 34;
  const bend = (r() - 0.5) * 0.18;
  const mid = (t: number): Pt => [bend * t * t * L, -t * L];
  const hw = (t: number): number => W * Math.pow(Math.sin(Math.PI * Math.pow(t, 1.55)), 0.78);
  const ph = r() * 6;
  const f = 7 + Math.floor(r() * 3);
  const wav = (t: number, side: number): number => ruff * W * (0.18 + 0.82 * t) * (0.55 * Math.sin(2 * Math.PI * f * t + ph + side * 1.7) + 0.25 * Math.sin(2 * Math.PI * f * 2.1 * t + side));
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const m = mid(t);
    const w = hw(t);
    left.push([m[0] - w - (t > 0.08 ? wav(t, -1) : 0), m[1]]);
    right.push([m[0] + w + (t > 0.08 ? wav(t, 1) : 0), m[1]]);
  }
  const outline = [...left.slice(0, n), mid(1.02), ...right.slice(0, n).reverse()];
  const d = smooth(outline, true);
  // 잎맥: 가운데 굵은 맥과 양쪽으로 굽어 나가는 곁맥
  let veins = `<path d="M0 0 Q${f1(mid(0.5)[0])} ${f1(mid(0.5)[1])} ${f1(mid(0.86)[0])} ${f1(mid(0.86)[1])}" stroke="#F4FBEA" stroke-width="${f1(Math.max(1, W * 0.1))}" stroke-linecap="round" fill="none" opacity=".72"/>`;
  [0.24, 0.4, 0.56, 0.72].forEach((t) => {
    [-1, 1].forEach((s) => {
      const a = mid(t);
      const b: Pt = [a[0] + s * hw(t + 0.1) * 0.86, mid(t + 0.13)[1]];
      const c: Pt = [a[0] + s * hw(t + 0.05) * 0.4, a[1] - L * 0.02];
      veins += `<path d="M${pt(a)} Q${pt(c)} ${pt(b)}" stroke="#EEF8DE" stroke-width=".75" fill="none" opacity=".55"/>`;
    });
  });
  // 주름: 가장자리에서 안으로 짧게 접힌 선
  let folds = "";
  for (let i = 0; i < 7; i++) {
    const t = 0.3 + r() * 0.62;
    const s = r() < 0.5 ? -1 : 1;
    const a = mid(t);
    const w = hw(t);
    folds += `<path d="M${f1(a[0] + s * w * 0.95)} ${f1(a[1])} q${f1(-s * w * 0.25)} ${f1(-L * 0.03)} ${f1(-s * w * 0.42)} ${f1(L * 0.01)}" stroke="#235F2C" stroke-width=".7" fill="none" opacity=".45"/>`;
  }
  return { d, veins, folds };
}
/** 상추 한 포기(로제트). (x, y)는 밑동, s 배율(1이면 높이 약 52px), shade는 pale(시듦)과 droop(처짐 0~1). */
export function lettuce(ns: string, x: number, y: number, s = 1, o: { pale?: boolean; droop?: number; seed?: number } = {}): string {
  const dr = o.droop ?? 0;
  const seed = o.seed ?? 7;
  const leaves: [number, number, number, string, number][] = [
    // [각도, 길이, 반폭, 그라데이션, 주름]
    [-62, 40, 15, "lb", 0.16],
    [62, 40, 15, "lb", 0.16],
    [-30, 50, 17, "lb", 0.15],
    [30, 50, 17, "lb", 0.15],
    [0, 54, 17, "lm", 0.14],
    [-46, 38, 14, "lm", 0.15],
    [46, 38, 14, "lm", 0.15],
    [-18, 34, 13, "lf", 0.13],
    [18, 34, 13, "lf", 0.13],
    [0, 22, 11, "lh", 0.1],
  ];
  let g = "";
  leaves.forEach(([a, L, W, gr, ru], i) => {
    const lf = lettuceLeaf(L, W, ru, seed * 31 + i * 7);
    const ang = a * (1 + dr * 0.55) + (a === 0 ? dr * 10 : 0);
    const fill = o.pale ? (gr === "lb" ? "#8EA07A" : gr === "lm" ? "#A9B88F" : "#C3CDA7") : `url(#${ns}${gr})`;
    const edge = o.pale ? "#5E7050" : "#1E5A2A";
    g += `<g transform="rotate(${f1(ang)})"><path d="${lf.d}" fill="${fill}" stroke="${edge}" stroke-width=".9" stroke-linejoin="round"/>${lf.folds}${lf.veins}</g>`;
  });
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${g}</g>`;
}
/** 따 낸 상추 잎 한 장(밑동 (x, y), 방향 ang 도, 0이면 위). */
export function looseLeaf(ns: string, x: number, y: number, ang: number, L: number, W: number, o: { grad?: string; seed?: number } = {}): string {
  const lf = lettuceLeaf(L, W, 0.15, o.seed ?? 5);
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})"><path d="${lf.d}" fill="url(#${ns}${o.grad ?? "lm"})" stroke="#1E5A2A" stroke-width=".9" stroke-linejoin="round"/>${lf.folds}${lf.veins}<path d="M0 3 L0 -2" stroke="#E8F4D2" stroke-width="2.2" stroke-linecap="round"/></g>`;
}
/** 당근(곧은뿌리). (x, y)는 자른 윗면 가운데, ang 방향(도, 0이면 아래로 자란다), len 길이, w 윗면 폭. */
export function carrot(ns: string, x: number, y: number, ang: number, len: number, w: number): string {
  const half = w / 2;
  const body: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    body.push([half * Math.pow(1 - t, 0.75) * (1 + 0.04 * Math.sin(t * 9)), t * len]);
  }
  const outline = [...body, ...body.slice(0, 12).reverse().map(([bx, by]) => [-bx, by] as Pt)];
  let s = `<path d="${smooth(outline, true, 0.8)}" fill="url(#${ns}carrot)" stroke="#9C4A12" stroke-width=".9"/>`;
  // 가로 주름(껍질의 고리 무늬)과 잔뿌리
  for (let i = 1; i < 9; i++) {
    const t = i / 9.5;
    const hw = half * Math.pow(1 - t, 0.75);
    s += `<path d="M${f1(-hw * 0.9)} ${f1(t * len)} q${f1(hw * 0.5)} ${f1(1.6)} ${f1(hw * 0.95)} ${f1(-0.2)}" stroke="#B85A1C" stroke-width=".7" fill="none" opacity=".75"/>`;
    if (i % 2) s += `<path d="M${f1((i % 4 === 1 ? 1 : -1) * hw)} ${f1(t * len + 1)} l${f1((i % 4 === 1 ? 1 : -1) * 5)} ${f1(2.4)}" stroke="#E9C9A0" stroke-width=".5" fill="none"/>`;
  }
  s += `<path d="M${f1(-half * 0.45)} ${f1(len * 0.1)} L${f1(-half * 0.2)} ${f1(len * 0.7)}" stroke="#FFC48A" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>`;
  // 자른 윗면(바깥 겉질은 짙은 주황, 가운데 심은 옅다)과 잎자루 밑동
  s += `<ellipse cx="0" cy="0" rx="${f1(half)}" ry="${f1(half * 0.36)}" fill="#F08A3C" stroke="#9C4A12" stroke-width=".8"/><ellipse cx="0" cy="0" rx="${f1(half * 0.5)}" ry="${f1(half * 0.18)}" fill="#F7B26A" stroke="#D9772E" stroke-width=".5"/>`;
  s += `<path d="M-2 -1 l-2.6 -7 M0.6 -1 l.6 -8 M3 -.6 l3 -6" stroke="#4E9A43" stroke-width="2" stroke-linecap="round"/>`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})">${s}</g>`;
}
export const carrotDefs = (ns: string): string =>
  `<linearGradient id="${ns}carrot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C4581A"/><stop offset=".35" stop-color="#F7943F"/><stop offset=".7" stop-color="#EE7F2C"/><stop offset="1" stop-color="#B24E14"/></linearGradient>`;
/** 화분(테라코타). (x, y)는 화분 바닥 가운데, w 윗지름, h 높이. 위에는 흙. */
export function pot(ns: string, x: number, y: number, w: number, h: number): string {
  const b = w * 0.74;
  return (
    `<ellipse cx="${x}" cy="${f1(y + 1)}" rx="${f1(b * 0.62)}" ry="2.2" fill="#000" opacity=".28"/>` +
    `<path d="M${f1(x - w / 2)} ${f1(y - h)} L${f1(x + w / 2)} ${f1(y - h)} L${f1(x + b / 2)} ${f1(y)} L${f1(x - b / 2)} ${f1(y)} Z" fill="url(#${ns}pot)" stroke="#5E3018" stroke-width=".9"/>` +
    `<rect x="${f1(x - w / 2 - 2)}" y="${f1(y - h - 4)}" width="${f1(w + 4)}" height="6" rx="1.6" fill="url(#${ns}potRim)" stroke="#5E3018" stroke-width=".9"/>` +
    `<ellipse cx="${x}" cy="${f1(y - h - 3.6)}" rx="${f1(w / 2 - 0.5)}" ry="2.4" fill="url(#${ns}soilTop)"/>` +
    `<path d="M${f1(x - w / 2 + 3)} ${f1(y - h + 4)} L${f1(x - b / 2 + 2.5)} ${f1(y - 2)}" stroke="#E7A877" stroke-width="1.1" opacity=".5"/>`
  );
}

/** 쌍떡잎식물의 잎: 톱니 가장자리, 깃 모양 그물맥. (x, y) 잎자루 밑동, ang 방향(도, 0이면 오른쪽), len 잎몸 길이, wid 반폭, pet 잎자루 길이. */
export function leafBlade(ns: string, x: number, y: number, ang: number, len: number, wid: number, o: { pet?: number; teeth?: number; seed?: number; pale?: boolean; fill?: string; veinOp?: number } = {}): string {
  const pet = o.pet ?? len * 0.18;
  const teeth = o.teeth ?? Math.max(8, Math.round(len / 7));
  const r = rng(o.seed ?? 3);
  // 잎몸 좌표: 잎자루 끝이 (pet, 0), 끝이 (pet + len, 0). 반폭은 달걀 모양(밑동 쪽이 넓다).
  const hw = (t: number): number => wid * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.82)), 0.85) * (1 - 0.08 * t);
  const n = teeth * 4;
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const tooth = t > 0.12 && t < 0.97 ? (i % 4 === 1 ? 1 : i % 4 === 2 ? 0.35 : 0) * Math.min(2.2, wid * 0.11) : 0;
    top.push([pet + t * len, -(hw(t) + tooth)]);
    bot.push([pet + t * len, hw(t) + tooth]);
  }
  const outline: Pt[] = [...top, ...bot.slice(1, n).reverse()];
  const d = poly(outline);
  // 맥: 가운데 맥(굵다가 가늘어짐), 곁맥 일곱 쌍(가장자리 톱니 쪽으로 굽음), 그 사이 가는 그물
  let v = `<path d="M${f1(pet - 1)} -1.1 L${f1(pet + len * 0.96)} -.25 L${f1(pet + len * 0.96)} .25 L${f1(pet - 1)} 1.1 Z" fill="#CFEBB8" opacity=".85"/>`;
  const pairs = Math.max(4, Math.round(len / 13));
  for (let k = 1; k <= pairs; k++) {
    const t = 0.08 + (k / (pairs + 0.6)) * 0.84;
    const x0 = pet + t * len;
    [-1, 1].forEach((sgn) => {
      const tt = Math.min(0.98, t + 0.14);
      const ex = pet + tt * len;
      const ey = sgn * hw(tt) * 0.9;
      v += `<path d="M${f1(x0)} 0 Q${f1(x0 + len * 0.05)} ${f1(sgn * hw(t) * 0.55)} ${f1(ex)} ${f1(ey)}" stroke="#C3E3AA" stroke-width=".8" fill="none" opacity=".75"/>`;
      // 그물맥(곁맥 사이를 잇는 가는 선)
      for (let j = 0; j < 2; j++) {
        const u = 0.3 + j * 0.3 + r() * 0.1;
        const px = x0 + (ex - x0) * u;
        const py = sgn * hw(t) * 0.55 * u * 1.2;
        v += `<path d="M${f1(px)} ${f1(py)} l${f1(len * 0.06)} ${f1(-sgn * wid * 0.12)}" stroke="#9FD08A" stroke-width=".45" fill="none" opacity=".55"/>`;
      }
    });
  }
  const fill = o.fill ?? (o.pale ? "#9DB38A" : `url(#${ns}leaf)`);
  const hi = o.pale ? "" : `<path d="${d}" fill="url(#${ns}leafHi)" opacity=".35"/>`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})"><path d="M0 0 L${f1(pet + 2)} 0" stroke="#3E8A3A" stroke-width="2.4" stroke-linecap="round"/><path d="${d}" fill="${fill}" stroke="#1B5A28" stroke-width="1" stroke-linejoin="round"/>${hi}<g opacity="${o.veinOp ?? 1}">${v}</g></g>`;
}

/** 뿌리 한 가닥: 원뿌리에서 가늘어지는 곡선, 끝 가까이에 뿌리털. pts는 뿌리가 지나는 점(위에서 아래로), w0는 밑동 굵기. */
export function rootStrand(ns: string, pts: Pt[], w0: number, o: { hairs?: number; seed?: number; color?: string; hairLen?: number } = {}): string {
  const r = rng(o.seed ?? 11);
  const n = pts.length;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const w = (w0 / 2) * (1 - (i / (n - 1)) * 0.82);
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
    R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  const body = smooth([...L, ...R.reverse()], true, 0.8);
  let hairs = "";
  const hn = o.hairs ?? 0;
  const hl = o.hairLen ?? 5;
  // 뿌리털: 끝(생장점) 바로 위의 구간에만 난다. 끝은 맨끝.
  for (let k = 0; k < hn; k++) {
    const t = 0.55 + (k / Math.max(1, hn)) * 0.35;
    const fi = t * (n - 1);
    const i = Math.floor(fi);
    const u = fi - i;
    const p0 = pts[i];
    const p1 = pts[Math.min(n - 1, i + 1)];
    const x = p0[0] + (p1[0] - p0[0]) * u;
    const y = p0[1] + (p1[1] - p0[1]) * u;
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const len = Math.hypot(dx, dy) || 1;
    const side = k % 2 ? 1 : -1;
    const nx = (-dy / len) * side;
    const ny = (dx / len) * side;
    const l = hl * (0.6 + r() * 0.6);
    hairs += `<path d="M${f1(x)} ${f1(y)} q${f1(nx * l * 0.5 + dx / len)} ${f1(ny * l * 0.5 + dy / len)} ${f1(nx * l)} ${f1(ny * l + 1)}" stroke="#F6EEDB" stroke-width=".5" fill="none" opacity=".85"/>`;
  }
  return `${hairs}<path d="${body}" fill="${o.color ?? `url(#${ns}root)`}" stroke="#8E7448" stroke-width=".6"/>`;
}

// ── 기구 ────────────────────────────────────────────────────────────
export function glassDefs(ns: string): string {
  return (
    `<linearGradient id="${ns}glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#CFE3FF" stop-opacity=".22"/><stop offset=".12" stop-color="#CFE3FF" stop-opacity=".06"/><stop offset=".8" stop-color="#CFE3FF" stop-opacity=".04"/><stop offset="1" stop-color="#CFE3FF" stop-opacity=".18"/></linearGradient>` +
    `<linearGradient id="${ns}lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA8C8"/><stop offset=".5" stop-color="#5D7699"/><stop offset="1" stop-color="#3E5577"/></linearGradient>` +
    `<linearGradient id="${ns}sensor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#14606B"/><stop offset=".35" stop-color="#2FA3B3"/><stop offset=".6" stop-color="#1F8A99"/><stop offset="1" stop-color="#0F4C55"/></linearGradient>` +
    `<linearGradient id="${ns}metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5E6B7E"/><stop offset=".4" stop-color="#C9D3E0"/><stop offset=".65" stop-color="#8E9AAC"/><stop offset="1" stop-color="#4A5568"/></linearGradient>` +
    `<linearGradient id="${ns}cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1B8" stop-opacity=".5"/><stop offset="1" stop-color="#FFE380" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="${ns}foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8EDF3"/><stop offset=".3" stop-color="#AEB8C6"/><stop offset=".55" stop-color="#D5DCE5"/><stop offset=".8" stop-color="#8C97A6"/><stop offset="1" stop-color="#C3CBD6"/></linearGradient>`
  );
}
/** 센서 하나(뚜껑에 꽂힌 청록색 막대, 머리의 색 띠가 그래프의 선 색과 같다). (x, top)은 뚜껑 위로 나온 머리의 꼭대기 가운데. */
export function sensor(ns: string, x: number, top: number, lidY: number, depth: number, band: string): string {
  return (
    // 선(케이블)
    `<path d="M${x} ${top} C${x} ${top - 10}, ${x + 14} ${top - 12}, ${x + 22} ${top - 16}" stroke="#2A3445" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
    // 용기 안으로 들어간 감지부(구멍 뚫린 끝)
    `<rect x="${f1(x - 3.4)}" y="${lidY}" width="6.8" height="${depth}" rx="2" fill="url(#${ns}metal)" stroke="#3A4556" stroke-width=".6"/>` +
    [0.35, 0.55, 0.75].map((k) => `<circle cx="${x}" cy="${f1(lidY + depth * k)}" r=".9" fill="#2A3445"/>`).join("") +
    // 몸통과 머리
    `<rect x="${f1(x - 6.5)}" y="${top}" width="13" height="${f1(lidY - top + 2)}" rx="3.5" fill="url(#${ns}sensor)" stroke="#0B3940" stroke-width=".8"/>` +
    `<rect x="${f1(x - 6.5)}" y="${f1(top + 3)}" width="13" height="4" fill="${band}"/>` +
    `<circle cx="${f1(x + 2.5)}" cy="${f1(top + 11)}" r="1.3" fill="#7CFFB0"/>`
  );
}
/** 투명 용기(클립 뚜껑). (x, y) 왼쪽 위, w×h. lid: 닫힘(true)이면 뚜껑을 덮고 센서 둘을 꽂는다. 열림이면 뚜껑을 옆에 둔다. */
export function container(ns: string, x: number, y: number, w: number, h: number, o: { lid?: boolean; inside?: string; sensors?: boolean; foil?: string } = {}): string {
  const lid = o.lid !== false;
  let s = `<ellipse cx="${f1(x + w / 2)}" cy="${f1(y + h + 2)}" rx="${f1(w * 0.55)}" ry="3.2" fill="#000" opacity=".3"/>`;
  s += o.inside ?? "";
  // 몸통(투명 플라스틱): 바탕은 아주 옅게, 가장자리와 모서리는 밝게
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#${ns}glass)" stroke="#A9C2E2" stroke-width="1.6"/>`;
  s += `<path d="M${f1(x + 6)} ${f1(y + 10)} L${f1(x + 6)} ${f1(y + h - 12)}" stroke="#F2F8FF" stroke-width="2.2" stroke-linecap="round" opacity=".35"/>`;
  s += `<path d="M${f1(x + 11)} ${f1(y + 16)} L${f1(x + 11)} ${f1(y + h * 0.45)}" stroke="#F2F8FF" stroke-width="1" stroke-linecap="round" opacity=".25"/>`;
  s += `<path d="M${f1(x + 4)} ${f1(y + h - 3)} L${f1(x + w - 4)} ${f1(y + h - 3)}" stroke="#DDEBFF" stroke-width="1" opacity=".35"/>`;
  if (o.foil) s += o.foil;
  // 뚜껑(센서 둘이 뚜껑의 구멍에 꽂혀 있다). 열림이면 뚜껑을 센서와 함께 들어 올려 비스듬히 둔다.
  let L = `<rect x="${f1(x - 4)}" y="${f1(y - 7)}" width="${f1(w + 8)}" height="10" rx="3.5" fill="url(#${ns}lid)" stroke="#2C3E5A" stroke-width=".9"/>`;
  L += `<path d="M${f1(x - 1)} ${f1(y - 5.5)} L${f1(x + w + 1)} ${f1(y - 5.5)}" stroke="#C9DAF0" stroke-width=".8" opacity=".6"/>`;
  if (o.sensors !== false) L += sensor(ns, x + w * 0.3, y - 26, y - 4, 22, P.co2) + sensor(ns, x + w * 0.7, y - 26, y - 4, 22, P.o2);
  if (lid) {
    s += L;
    // 걸쇠(양옆)
    [x - 6, x + w + 2].forEach((cx) => (s += `<rect x="${f1(cx)}" y="${f1(y - 6)}" width="4" height="13" rx="1.5" fill="#33475F" stroke="#1C2B40" stroke-width=".7"/>`));
  } else {
    [x - 6, x + w + 2].forEach((cx) => (s += `<rect x="${f1(cx)}" y="${f1(y - 1)}" width="4" height="7" rx="1.5" fill="#33475F" stroke="#1C2B40" stroke-width=".7"/>`));
    s += `<g transform="rotate(-6 ${f1(x - 4)} ${f1(y - 2)}) translate(0 -11)">${L}</g>`;
  }
  return `<g class="g2u5x-jar">${s}</g>`;
}
/** 목이 휘는 탁상 전등. 받침 (bx, by)(바닥 가운데), 머리 (hx, hy)(빛이 나오는 아래 가운데). on이면 빛 원뿔을 아래로 그린다(reach 길이). */
export function deskLamp(ns: string, bx: number, by: number, hx: number, hy: number, on: boolean, reach = 90, spread = 34): string {
  let s = "";
  if (on) s += `<path d="M${f1(hx - 12)} ${hy} L${f1(hx + 12)} ${hy} L${f1(hx + spread)} ${f1(hy + reach)} L${f1(hx - spread)} ${f1(hy + reach)} Z" fill="url(#${ns}cone)" class="g2u5x-ray"/>`;
  // 받침과 스위치
  s += `<rect x="${f1(bx - 17)}" y="${f1(by - 9)}" width="34" height="9" rx="2.5" fill="#E9A83A" stroke="#8C5E14" stroke-width=".8"/><rect x="${f1(bx - 17)}" y="${f1(by - 9)}" width="34" height="3" rx="1.5" fill="#FFD27A" opacity=".7"/><circle cx="${f1(bx + 9)}" cy="${f1(by - 4.5)}" r="1.6" fill="#3A2A10"/>`;
  // 휘는 목(마디가 보이는 금속 관)
  const p0: Pt = [bx - 6, by - 9];
  const c1: Pt = [bx - 8, hy - 30];
  const c2: Pt = [hx - 40, hy - 26];
  const p3: Pt = [hx - 6, hy - 9];
  const neck = `M${pt(p0)} C${pt(c1)} ${pt(c2)} ${pt(p3)}`;
  s += `<path d="${neck}" stroke="#4A5568" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="${neck}" stroke="url(#${ns}metal)" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="${neck}" stroke="#2D3748" stroke-width="3.2" fill="none" stroke-dasharray=".8 2.2"/>`;
  // 머리(갓)
  s += `<path d="M${f1(hx - 15)} ${hy} C${f1(hx - 14)} ${f1(hy - 12)}, ${f1(hx + 14)} ${f1(hy - 12)}, ${f1(hx + 15)} ${hy} Z" fill="${on ? "#F4F6FA" : "#C9D1DC"}" stroke="#6B778A" stroke-width=".9"/>`;
  s += `<path d="M${f1(hx - 9)} ${f1(hy - 6)} C${f1(hx - 6)} ${f1(hy - 10)}, ${f1(hx + 2)} ${f1(hy - 10)}, ${f1(hx + 5)} ${f1(hy - 9)}" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity=".8"/>`;
  s += `<ellipse cx="${hx}" cy="${f1(hy + 0.5)}" rx="11" ry="2.4" fill="${on ? "#FFF6C9" : "#5A6578"}" stroke="${on ? "#E8B92E" : "#4A5568"}" stroke-width=".7"/>`;
  return s;
}
/** 발광 다이오드 전등(작은 막대형). (x, y) 아래 가운데. */
export function ledBar(ns: string, x: number, y: number, on: boolean, reach = 40): string {
  let s = "";
  if (on) s += `<path d="M${f1(x - 7)} ${y} L${f1(x + 7)} ${y} L${f1(x + 15)} ${f1(y + reach)} L${f1(x - 15)} ${f1(y + reach)} Z" fill="url(#${ns}cone)" class="g2u5x-ray"/>`;
  s += `<rect x="${f1(x - 1.2)}" y="${f1(y - 18)}" width="2.4" height="8" fill="#4A5568"/>`;
  s += `<rect x="${f1(x - 10)}" y="${f1(y - 10)}" width="20" height="9" rx="2.5" fill="#3B4659" stroke="#1E2836" stroke-width=".8"/>`;
  s += `<rect x="${f1(x - 8)}" y="${f1(y - 2.4)}" width="16" height="3" rx="1.4" fill="${on ? "#FFF6C9" : "#5A6578"}" stroke="${on ? "#E8B92E" : "#3A4556"}" stroke-width=".6"/>`;
  if (on) s += `<rect x="${f1(x - 8)}" y="${f1(y - 2.4)}" width="16" height="3" rx="1.4" fill="#FFF" opacity=".5"/>`;
  return s;
}
/** 용기를 감싼 알루미늄박(구겨진 면이 빛을 받아 밝고 어두운 조각으로 보인다). */
export function foil(ns: string, x: number, y: number, w: number, h: number, seed = 5): string {
  const r = rng(seed);
  let s = `<rect x="${f1(x - 3)}" y="${f1(y + 3)}" width="${f1(w + 6)}" height="${f1(h - 1)}" rx="8" fill="url(#${ns}foil)" stroke="#E9EEF5" stroke-width="1.1"/>`;
  // 구김: 세로로 긴 삼각 조각들
  const cols = 6;
  const rows = 5;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const cx = x + (i + 0.5) * (w / cols) + (r() - 0.5) * 8;
      const cy = y + 8 + (j + 0.5) * ((h - 10) / rows) + (r() - 0.5) * 6;
      const k = 5 + r() * 6;
      const shade = r() < 0.5 ? "#FFFFFF" : "#5E6878";
      const a = r() * Math.PI;
      s += `<path d="M${f1(cx + Math.cos(a) * k)} ${f1(cy + Math.sin(a) * k)} L${f1(cx + Math.cos(a + 2.2) * k * 0.8)} ${f1(cy + Math.sin(a + 2.2) * k * 0.8)} L${f1(cx + Math.cos(a + 4) * k * 0.7)} ${f1(cy + Math.sin(a + 4) * k * 0.7)} Z" fill="${shade}" opacity="${f1(0.12 + r() * 0.16)}"/>`;
    }
  for (let i = 0; i < 9; i++) {
    const x0 = x + r() * w;
    const y0 = y + 6 + r() * (h - 14);
    s += `<path d="M${f1(x0)} ${f1(y0)} l${f1((r() - 0.5) * 12)} ${f1(6 + r() * 12)}" stroke="${r() < 0.5 ? "#FFFFFF" : "#6E7888"}" stroke-width=".8" opacity=".55"/>`;
  }
  // 위 가장자리(뚜껑 아래로 접어 넣은 박의 주름)
  s += `<path d="M${f1(x - 3)} ${f1(y + 6)} ${Array.from({ length: 10 }, (_, i) => `L${f1(x - 3 + ((i + 1) * (w + 6)) / 10)} ${f1(y + 4 + (i % 2) * 3)}`).join(" ")}" stroke="#F4F7FB" stroke-width="1" fill="none" opacity=".8"/>`;
  return s;
}
