// [중2 Ⅴ v5] 랩 무대의 확대 그림: 현미경 시야의 세포, 엽록체, 마이토콘드리아, 현미경(2026-11-15).
// 그리는 것: 상추와 검정말의 잎세포(눈금 막대), 엽록체, 엽록체와 마이토콘드리아.
// 과학 가드(검산 메모는 output/g2-v5/u5/lab-art/README.md):
//   · 검정말 잎세포는 벽돌처럼 늘어선 긴 네모 세포이고 엽록체는 세포벽을 따라 많다(살아 있는 잎은 세포질이 벽 쪽에 얇게 있다). 잎은 두 겹이라 아래 겹이 흐리게 비친다.
//   · 양파 비늘잎 안쪽 껍질 세포는 길쭉하고 핵이 하나씩 있으며 엽록체가 없다(물들이지 않은 모습).
//   · 엽록체는 두 겹의 막 안에 틸라코이드가 동전처럼 쌓인 그라나와 그 사이를 잇는 막, 녹말 알갱이가 있다.
//   · 마이토콘드리아는 바깥막이 매끈하고 안쪽 막이 안으로 접혀 주름(크리스타)을 이룬다.

import { f1, poly, rng, smooth, type Pt } from "./art";

// ── 현미경 시야 ──────────────────────────────────────────────────────
export function microDefs(ns: string): string {
  return (
    `<radialGradient id="${ns}chl" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#A6DE8C"/><stop offset=".5" stop-color="#4FAE4E"/><stop offset="1" stop-color="#23772F"/></radialGradient>` +
    `<radialGradient id="${ns}vig" cx=".5" cy=".5" r=".5"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset=".9" stop-color="#0A140A" stop-opacity=".22"/><stop offset="1" stop-color="#0A140A" stop-opacity=".5"/></radialGradient>` +
    `<radialGradient id="${ns}nuc" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#E9E3DA"/><stop offset=".7" stop-color="#CFC6BA"/><stop offset="1" stop-color="#ADA294"/></radialGradient>` +
    `<radialGradient id="${ns}stroma" cx=".42" cy=".35" r=".75"><stop offset="0" stop-color="#DDF5B8"/><stop offset=".6" stop-color="#B5E08E"/><stop offset="1" stop-color="#7DBB5C"/></radialGradient>` +
    `<linearGradient id="${ns}granum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4FA04A"/><stop offset="1" stop-color="#1F6B2B"/></linearGradient>` +
    `<radialGradient id="${ns}mito" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFD2B5"/><stop offset=".55" stop-color="#F59A6E"/><stop offset="1" stop-color="#C65B33"/></radialGradient>` +
    `<radialGradient id="${ns}matrix" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#FFE3CF"/><stop offset="1" stop-color="#F6B08A"/></radialGradient>`
  );
}

/** 엽록체 하나(현미경 배율의 작은 알, 안쪽이 조금 밝은 초록 원반). */
const chl = (ns: string, x: number, y: number, rx: number, ry: number, a: number): string =>
  `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" transform="rotate(${Math.round(a)} ${f1(x)} ${f1(y)})" fill="url(#${ns}chl)" stroke="#1E6A2B" stroke-width=".35"/>`;

/** 세포 안에 엽록체를 겹치지 않게 뿌린다(벽 쪽에 많이). box는 세포 안쪽 사각형. */
function scatter(ns: string, r: () => number, box: [number, number, number, number], n: number, size: number, edgeShare = 0.6): string {
  const [x0, y0, x1, y1] = box;
  const got: Pt[] = [];
  let s = "";
  const minD = size * 1.75;
  for (let tries = 0; got.length < n && tries < n * 14; tries++) {
    let x: number;
    let y: number;
    if (r() < edgeShare) {
      // 벽을 따라: 네 변 가운데 하나 가까이
      const side = Math.floor(r() * 4);
      const u = r();
      const inset = size * (0.9 + r() * 0.8);
      x = side < 2 ? x0 + inset + u * (x1 - x0 - 2 * inset) : side === 2 ? x0 + inset : x1 - inset;
      y = side === 0 ? y0 + inset : side === 1 ? y1 - inset : y0 + inset + u * (y1 - y0 - 2 * inset);
    } else {
      x = x0 + size + r() * (x1 - x0 - 2 * size);
      y = y0 + size + r() * (y1 - y0 - 2 * size);
    }
    if (got.some((g) => Math.hypot(g[0] - x, g[1] - y) < minD)) continue;
    got.push([x, y]);
    const k = 0.85 + r() * 0.35;
    s += chl(ns, x, y, size * k, size * 0.72 * k, r() * 180);
  }
  return s;
}

/** 검정말 잎의 세포(벽돌처럼 늘어선 긴 네모 세포, 두 겹 가운데 아래 겹은 흐리게). 시야 상자 [x0, y0, x1, y1]. */
export function elodeaField(ns: string, bx: [number, number, number, number]): string {
  const r = rng(41);
  const [X0, Y0, X1, Y1] = bx;
  let under = "";
  let cells = "";
  let walls = "";
  const rowsY: number[] = [];
  for (let y = Y0 - 18; y < Y1 + 26; y += 22 + r() * 5) rowsY.push(y);
  for (let j = 0; j < rowsY.length - 1; j++) {
    const ya = rowsY[j];
    const yb = rowsY[j + 1];
    let x = X0 - 40 - r() * 30;
    while (x < X1 + 10) {
      const w = 46 + r() * 22;
      const sk = (r() - 0.5) * 3;
      const q: Pt[] = [[x, ya], [x + w, ya], [x + w + sk, yb], [x + sk, yb]];
      cells += `<path d="${poly(q)}" fill="#E4F1D2"/>`;
      cells += scatter(ns, r, [x + 1.6, ya + 1.6, x + w - 1.6, yb - 1.6], 26 + Math.floor(r() * 10), 2.75);
      walls += `<path d="M${f1(x + w)} ${f1(ya)} L${f1(x + w + sk)} ${f1(yb)}" stroke="#4E8A45" stroke-width="2.3"/><path d="M${f1(x + w)} ${f1(ya)} L${f1(x + w + sk)} ${f1(yb)}" stroke="#D8EDC6" stroke-width=".8"/>`;
      x += w;
    }
    walls += `<path d="M${X0 - 60} ${f1(ya)} L${X1 + 40} ${f1(ya)}" stroke="#4E8A45" stroke-width="2.3"/><path d="M${X0 - 60} ${f1(ya)} L${X1 + 40} ${f1(ya)}" stroke="#D8EDC6" stroke-width=".8"/>`;
    // 아래 겹의 벽(어긋난 자리에 흐리게)
    under += `<path d="M${X0 - 60} ${f1(ya + 11)} L${X1 + 40} ${f1(ya + 11)}" stroke="#86AE76" stroke-width="1.4" opacity=".45"/>`;
  }
  return `<rect x="${X0 - 4}" y="${Y0 - 4}" width="${X1 - X0 + 8}" height="${Y1 - Y0 + 8}" fill="#DCEBC8"/>${under}${cells}${walls}`;
}

/** 볼록 다각형을 반평면으로 자른다(보로노이 칸 만들기). */
function clipHalf(pg: Pt[], a: Pt, b: Pt): Pt[] {
  // a 쪽(가까운 쪽)만 남긴다: |p-a| <= |p-b|
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const nx = b[0] - a[0];
  const ny = b[1] - a[1];
  const side = (p: Pt): number => (p[0] - mx) * nx + (p[1] - my) * ny;
  const out: Pt[] = [];
  for (let i = 0; i < pg.length; i++) {
    const p = pg[i];
    const q = pg[(i + 1) % pg.length];
    const sp = side(p);
    const sq = side(q);
    if (sp <= 0) out.push(p);
    if ((sp < 0 && sq > 0) || (sp > 0 && sq < 0)) {
      const t = sp / (sp - sq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}
/** 둥근 모서리 다각형(꼭짓점마다 짧은 곡선). */
function rounded(pg: Pt[], k = 0.28): string {
  const n = pg.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const p0 = pg[(i - 1 + n) % n];
    const p1 = pg[i];
    const p2 = pg[(i + 1) % n];
    const a: Pt = [p1[0] + (p0[0] - p1[0]) * k, p1[1] + (p0[1] - p1[1]) * k];
    const b: Pt = [p1[0] + (p2[0] - p1[0]) * k, p1[1] + (p2[1] - p1[1]) * k];
    d += `${i ? " L" : "M"}${f1(a[0])} ${f1(a[1])} Q${f1(p1[0])} ${f1(p1[1])} ${f1(b[0])} ${f1(b[1])}`;
  }
  return d + " Z";
}
const shrink = (pg: Pt[], d: number): Pt[] => {
  const cx = pg.reduce((s, p) => s + p[0], 0) / pg.length;
  const cy = pg.reduce((s, p) => s + p[1], 0) / pg.length;
  return pg.map((p) => {
    const L = Math.hypot(p[0] - cx, p[1] - cy) || 1;
    return [p[0] - ((p[0] - cx) / L) * d, p[1] - ((p[1] - cy) / L) * d] as Pt;
  });
};
/** 보로노이 칸들(무작위로 흔든 육각 격자 위의 점). */
export function voronoi(bx: [number, number, number, number], gap: number, seed: number, jitter = 0.36): Pt[][] {
  const r = rng(seed);
  const [X0, Y0, X1, Y1] = bx;
  const sites: Pt[] = [];
  const h = gap * 0.866;
  for (let j = 0, y = Y0 - gap; y < Y1 + gap; j++, y += h)
    for (let x = X0 - gap + (j % 2) * gap * 0.5; x < X1 + gap; x += gap) sites.push([x + (r() - 0.5) * gap * jitter * 2, y + (r() - 0.5) * gap * jitter * 2]);
  return sites.map((s, i) => {
    let pg: Pt[] = [[X0 - gap * 2, Y0 - gap * 2], [X1 + gap * 2, Y0 - gap * 2], [X1 + gap * 2, Y1 + gap * 2], [X0 - gap * 2, Y1 + gap * 2]];
    sites.forEach((t, j) => {
      if (i === j || Math.abs(t[0] - s[0]) > gap * 2.6 || Math.abs(t[1] - s[1]) > gap * 2.6) return;
      pg = clipHalf(pg, s, t);
    });
    return pg;
  });
}

/** 상추 잎의 세포(불규칙한 둥근 다각형, 엽록체가 빽빽, 세포 사이 틈). */
export function lettuceField(ns: string, bx: [number, number, number, number]): string {
  const r = rng(77);
  const cellsPg = voronoi(bx, 33, 19, 0.3);
  let s = `<rect x="${bx[0] - 4}" y="${bx[1] - 4}" width="${bx[2] - bx[0] + 8}" height="${bx[3] - bx[1] + 8}" fill="#557F49"/>`;
  cellsPg.forEach((pg) => {
    if (pg.length < 3) return;
    const cx = pg.reduce((a, p) => a + p[0], 0) / pg.length;
    const cy = pg.reduce((a, p) => a + p[1], 0) / pg.length;
    if (cx < bx[0] - 30 || cx > bx[2] + 30 || cy < bx[1] - 30 || cy > bx[3] + 30) return;
    const inner = shrink(pg, 1.25);
    s += `<path d="${rounded(inner, 0.3)}" fill="#E2F0CC" stroke="#3F7436" stroke-width="1"/>`;
    // 벽 안쪽의 밝은 선(세포벽의 두께)
    s += `<path d="${rounded(shrink(pg, 2.3), 0.3)}" fill="none" stroke="#F3FAE8" stroke-width=".6" opacity=".8"/>`;
    // 엽록체: 벽을 따라 둘레에 빽빽하게, 가운데는 조금
    const per = inner.length;
    let n = 0;
    for (let i = 0; i < per; i++) {
      const p = inner[i];
      const q = inner[(i + 1) % per];
      const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const m = Math.max(1, Math.floor(len / 5.6));
      for (let k = 0; k < m; k++) {
        const u = (k + 0.5 + (r() - 0.5) * 0.4) / m;
        const ex = p[0] + (q[0] - p[0]) * u;
        const ey = p[1] + (q[1] - p[1]) * u;
        const L = Math.hypot(ex - cx, ey - cy) || 1;
        if (r() < 0.12) continue;
        const inset = 3.2 + r() * 2.6;
        s += chl(ns, ex - ((ex - cx) / L) * inset, ey - ((ey - cy) / L) * inset, 2.5, 1.85, (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI + (r() - 0.5) * 30);
        n++;
      }
    }
    for (let k = 0; k < 4 + Math.floor(r() * 4); k++) {
      const a = r() * Math.PI * 2;
      const d = r() * 6;
      s += chl(ns, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2.5, 1.85, r() * 180);
    }
    void n;
  });
  return s;
}

/** 양파 비늘잎 안쪽 껍질의 세포(길쭉한 세포, 핵 하나, 엽록체 없음, 물들이지 않은 모습). */
export function onionField(ns: string, bx: [number, number, number, number]): string {
  const r = rng(23);
  const [X0, Y0, X1, Y1] = bx;
  let s = `<rect x="${X0 - 4}" y="${Y0 - 4}" width="${X1 - X0 + 8}" height="${Y1 - Y0 + 8}" fill="#EFEBE3"/>`;
  let walls = "";
  for (let y = Y0 - 20, j = 0; y < Y1 + 10; j++) {
    const h = 34 + r() * 8;
    let x = X0 - 60 - r() * 80 - (j % 2) * 40;
    while (x < X1 + 10) {
      const w = 190 + r() * 70;
      const tilt = (r() - 0.5) * 4;
      const q: Pt[] = [[x, y], [x + w, y + tilt * 0.3], [x + w - 4, y + h + tilt * 0.3], [x - 4, y + h]];
      s += `<path d="${poly(q)}" fill="${r() < 0.5 ? "#F4F1EA" : "#F1EDE5"}"/>`;
      // 세포질 가닥과 알갱이
      for (let k = 0; k < 14; k++) s += `<circle cx="${f1(x + 6 + r() * (w - 12))}" cy="${f1(y + 4 + r() * (h - 8))}" r="${f1(0.5 + r() * 0.7)}" fill="#BFB5A6" opacity=".7"/>`;
      // 핵(타원)과 인
      const nx = x + w * (0.25 + r() * 0.5);
      const ny = y + h * (0.35 + r() * 0.3);
      s += `<ellipse cx="${f1(nx)}" cy="${f1(ny)}" rx="8" ry="5.8" fill="url(#${ns}nuc)" stroke="#8C8070" stroke-width=".8"/><circle cx="${f1(nx + 1.6)}" cy="${f1(ny - 0.8)}" r="1.5" fill="#9C8F7E"/>`;
      walls += `<path d="M${f1(x - 4)} ${f1(y + h)} L${f1(x)} ${f1(y)}" stroke="#A69886" stroke-width="2"/><path d="M${f1(x - 4)} ${f1(y + h)} L${f1(x)} ${f1(y)}" stroke="#F8F5EF" stroke-width=".7"/>`;
      x += w;
    }
    walls += `<path d="M${X0 - 80} ${f1(y)} L${X1 + 40} ${f1(y + 1)}" stroke="#A69886" stroke-width="2"/><path d="M${X0 - 80} ${f1(y)} L${X1 + 40} ${f1(y + 1)}" stroke="#F8F5EF" stroke-width=".7"/>`;
    y += h;
  }
  return s + walls;
}

/** 현미경 시야의 가장자리 어둠과 눈금 막대. */
export function scopeOverlay(ns: string, cx: number, cy: number, R: number, bar: { px: number; text: string }): string {
  const bx = cx + R * 0.5;
  const by = cy + R * 0.62;
  return (
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${ns}vig)"/>` +
    `<path d="M${f1(bx - bar.px / 2)} ${f1(by)} L${f1(bx + bar.px / 2)} ${f1(by)} M${f1(bx - bar.px / 2)} ${f1(by - 3)} L${f1(bx - bar.px / 2)} ${f1(by + 3)} M${f1(bx + bar.px / 2)} ${f1(by - 3)} L${f1(bx + bar.px / 2)} ${f1(by + 3)}" stroke="#FFFFFF" stroke-width="3.6" stroke-linecap="round"/>` +
    `<path d="M${f1(bx - bar.px / 2)} ${f1(by)} L${f1(bx + bar.px / 2)} ${f1(by)} M${f1(bx - bar.px / 2)} ${f1(by - 3)} L${f1(bx - bar.px / 2)} ${f1(by + 3)} M${f1(bx + bar.px / 2)} ${f1(by - 3)} L${f1(bx + bar.px / 2)} ${f1(by + 3)}" stroke="#1E2B1E" stroke-width="1.4" stroke-linecap="round"/>` +
    `<text x="${f1(bx)}" y="${f1(by - 6)}" text-anchor="middle" font-size="12" font-weight="800" fill="#1E2B1E" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" paint-order="stroke">${bar.text}</text>`
  );
}

/** 광학 현미경(옆모습). (x, y)는 받침 바닥 가운데, s 배율(1이면 높이 약 150px). 재물대에 받침유리가 놓여 있다. */
export function microscope(x: number, y: number, s = 1): string {
  const g = (d: string, fill: string, stroke = "#0E1726", w = 1): string => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`;
  let m = "";
  // 받침과 기둥, 팔(뒤쪽으로 굽은 손잡이)
  m += `<ellipse cx="0" cy="1" rx="46" ry="3.5" fill="#000" opacity=".3"/>`;
  m += g("M-40 0 L36 0 L32 -10 L-34 -10 Z", "#2C3B55");
  m += g("M-34 -10 L32 -10", "none", "#56709A", 1.2);
  m += g("M-18 -10 C-20 -40, -26 -66, -12 -94 C-6 -106, 6 -112, 12 -116 L18 -104 C6 -96, 0 -86, -2 -70 C-4 -52, 2 -30, 6 -10 Z", "#34476A");
  m += g("M-14 -40 C-16 -60, -14 -80, -4 -96", "none", "#6D88B5", 1.4);
  // 재물대와 받침유리, 아래의 광원
  m += g("M-14 -52 L40 -52 L40 -46 L-14 -46 Z", "#22324D");
  m += `<rect x="-2" y="-55.5" width="34" height="3.4" rx=".8" fill="#CFE8FF" stroke="#7FA6CF" stroke-width=".6" opacity=".9"/><rect x="11" y="-55.2" width="8" height="2.8" fill="#9BD08A" opacity=".85"/>`;
  m += g("M8 -46 L22 -46 L20 -34 L10 -34 Z", "#3B4E73");
  m += `<ellipse cx="15" cy="-34" rx="6" ry="2" fill="#FFF3B8" stroke="#C9A53A" stroke-width=".6"/>`;
  // 경통, 회전판, 대물렌즈 셋, 접안렌즈
  m += g("M4 -112 L26 -112 L26 -84 L4 -84 Z", "#2C3B55");
  m += g("M0 -84 L30 -84 L27 -77 L3 -77 Z", "#3E5480");
  m += g("M8 -77 L13 -77 L12.5 -63 L8.5 -63 Z", "#C9D3E0", "#5E6B7E", 0.7);
  m += g("M14 -77 L19 -77 L18.6 -60 L14.4 -60 Z", "#E3E9F1", "#5E6B7E", 0.7);
  m += `<rect x="14.2" y="-66" width="4.6" height="2" fill="#E8B92E"/>`;
  m += g("M20 -77 L25 -77 L24 -66 L21 -66 Z", "#C9D3E0", "#5E6B7E", 0.7);
  m += g("M6 -112 L24 -112 L22 -128 L8 -128 Z", "#34476A");
  m += g("M6 -128 L24 -128 L24 -134 L6 -134 Z", "#B9C6D8", "#0E1726", 0.8);
  // 조동·미동 나사
  m += `<circle cx="-6" cy="-58" r="7" fill="#3E5480" stroke="#0E1726"/><circle cx="-6" cy="-58" r="3.6" fill="#5D79A8" stroke="#0E1726" stroke-width=".7"/>`;
  m += g("M-30 -6 L-24 -6", "none", "#56709A", 1.2);
  return `<g transform="translate(${x} ${y}) scale(${s})">${m}</g>`;
}

// ── 엽록체와 마이토콘드리아 ─────────────────────────────────────────
/** 렌즈 모양 윤곽(초타원). */
function lensPath(w: number, h: number, p = 2.4, n = 48): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return [(w / 2) * Math.sign(c) * Math.pow(Math.abs(c), 2 / p), (h / 2) * Math.sign(s) * Math.pow(Math.abs(s), 2 / p)] as Pt;
  });
}
/** 엽록체(두 겹 막, 그라나와 이음 막, 녹말 알갱이). (cx, cy) 가운데, w×h, rot 도. starch 녹말 알갱이 수. dim이면 회색으로(멈춤). */
/** soft면 그라나와 막을 옅게 그린다(속 구조보다 드나드는 물질이 주인공인 무대에서). */
export function chloroplast(ns: string, cx: number, cy: number, w: number, h: number, o: { rot?: number; starch?: number; seed?: number; dim?: boolean; soft?: boolean } = {}): string {
  const r = rng(o.seed ?? 5);
  const outer = lensPath(w, h);
  const inner = lensPath(w - 4.2, h - 4.2);
  let s = `<path d="${smooth(outer, true)}" fill="${o.dim ? "#8A9688" : `url(#${ns}stroma)`}" stroke="${o.dim ? "#5E6A5C" : "#2E7D32"}" stroke-width="1.3"/>`;
  s += `<path d="${smooth(inner, true)}" fill="none" stroke="${o.dim ? "#6E7A6C" : "#3E8E41"}" stroke-width=".8"/>`;
  // 그라나: 납작한 주머니(틸라코이드)가 동전처럼 몇 장씩 쌓인 더미. 긴 축을 따라 두 줄로 어긋나게 놓고, 더미 사이를 가는 막이 잇는다.
  const rows = h >= 34 ? 2 : 1;
  const disc = Math.max(1.3, h * 0.036);
  const dwBase = Math.max(6, Math.min(12, w * 0.1));
  const centers: Pt[] = [];
  for (let row = 0; row < rows; row++) {
    const yRow = rows === 1 ? 0 : (row ? 1 : -1) * h * 0.17;
    const nStack = Math.max(2, Math.floor((w - 14) / (dwBase + 6)));
    for (let k = 0; k < nStack; k++) {
      const u = (k + 0.5 + (row ? 0.45 : 0)) / (nStack + 0.45) - 0.5;
      const x = u * (w - 18);
      const lim = (h / 2 - 4) * Math.sqrt(Math.max(0, 1 - Math.pow((2 * x) / (w - 6), 2)));
      if (Math.abs(yRow) + disc * 3 > lim) continue;
      centers.push([x, yRow + (r() - 0.5) * 1.6]);
    }
  }
  const lam = o.dim ? "#7C8878" : "#4C9A47";
  const g0 = s.length;
  centers.forEach(([ax, ay], i) => {
    const near = centers.filter(([bx, by], j) => j !== i && bx > ax && bx - ax < dwBase * 2.4 && Math.abs(by - ay) < h * 0.4).slice(0, 2);
    near.forEach(([bx, by]) => (s += `<path d="M${f1(ax)} ${f1(ay)} C${f1((ax + bx) / 2)} ${f1(ay)}, ${f1((ax + bx) / 2)} ${f1(by)}, ${f1(bx)} ${f1(by)}" stroke="${lam}" stroke-width=".8" fill="none" opacity=".9"/>`));
  });
  centers.forEach(([x, y]) => {
    const nDisc = 4 + Math.floor(r() * 3);
    const dw = dwBase * (0.85 + r() * 0.3);
    for (let i = 0; i < nDisc; i++) {
      const yy = y + (i - (nDisc - 1) / 2) * (disc + 0.45);
      s += `<rect x="${f1(x - dw / 2)}" y="${f1(yy - disc / 2)}" width="${f1(dw)}" height="${f1(disc)}" rx="${f1(disc / 2)}" fill="${o.dim ? "#7C8878" : `url(#${ns}granum)`}" stroke="${o.dim ? "#5E6A5C" : "#1D5E28"}" stroke-width=".3"/>`;
    }
  });
  if (o.soft) s = s.slice(0, g0) + `<g opacity=".38">${s.slice(g0)}</g>`;
  // 녹말 알갱이(광합성으로 만든 포도당이 바뀌어 쌓인 것)와 기름 방울
  for (let k = 0; k < (o.starch ?? 0); k++) {
    const x = (k - ((o.starch ?? 1) - 1) / 2) * w * 0.3 + (r() - 0.5) * 6;
    const y = (k % 2 ? 1 : -1) * h * 0.02;
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w * 0.045 + 1.2)}" ry="${f1(h * 0.06 + 0.8)}" fill="#F3EFD9" stroke="#B9B08C" stroke-width=".55"/><ellipse cx="${f1(x - 0.6)}" cy="${f1(y - 0.3)}" rx="${f1(w * 0.02 + 0.5)}" ry="${f1(h * 0.025 + 0.4)}" fill="none" stroke="#CFC6A2" stroke-width=".45"/>`;
  }
  for (let k = 0; k < 3; k++) s += `<circle cx="${f1((r() - 0.5) * (w - 20))}" cy="${f1((r() - 0.5) * (h - 12))}" r="${f1(0.9 + r() * 0.6)}" fill="${o.dim ? "#5E6A5C" : "#2F5E2A"}"/>`;
  return `<g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${o.rot ?? 0})">${s}</g>`;
}

/** 마이토콘드리아(매끈한 바깥막, 안으로 접힌 안쪽 막). (cx, cy) 가운데, w×h, rot 도. dim이면 회색. */
export function mitochondrion(ns: string, cx: number, cy: number, w: number, h: number, o: { rot?: number; dim?: boolean } = {}): string {
  const outer = lensPath(w, h, 3.2);
  const iw = w - 5;
  const ih = h - 5;
  const inner = lensPath(iw, ih, 3.2);
  const edge = o.dim ? "#6B6560" : "#8E3B1E";
  let s = `<path d="${smooth(outer, true)}" fill="${o.dim ? "#9C948C" : `url(#${ns}mito)`}" stroke="${edge}" stroke-width="1.3"/>`;
  s += `<path d="${smooth(inner, true)}" fill="${o.dim ? "#B5ADA4" : `url(#${ns}matrix)`}" stroke="${o.dim ? "#7A726A" : "#B54E2A"}" stroke-width=".9"/>`;
  // 크리스타: 안쪽 막이 안으로 접혀 들어간 주름. 위와 아래에서 번갈아 손가락처럼 반쯤 들어가고(가로지르지 않는다), 끝이 둥글다.
  const n = Math.max(4, Math.round(w / 8));
  const fw = Math.max(1.3, Math.min(2.4, w * 0.024));
  for (let k = 0; k < n; k++) {
    const x = -iw / 2 + ((k + 0.7) / (n + 0.4)) * iw;
    const lim = (ih / 2) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs((2 * x) / iw), 3.2)), 1 / 3.2);
    if (lim < 3) continue;
    const top = k % 2 === 0;
    const y0 = top ? -lim - 0.4 : lim + 0.4;
    const y1 = top ? lim * 0.12 : -lim * 0.12;
    const tilt = (k % 3 - 1) * 0.9;
    const d = `M${f1(x - fw)} ${f1(y0)} C${f1(x - fw + tilt)} ${f1((y0 + y1) / 2)}, ${f1(x - fw - tilt)} ${f1(y1)}, ${f1(x - fw)} ${f1(y1)} A${f1(fw)} ${f1(fw)} 0 0 ${top ? 0 : 1} ${f1(x + fw)} ${f1(y1)} C${f1(x + fw - tilt)} ${f1(y1)}, ${f1(x + fw + tilt)} ${f1((y0 + y1) / 2)}, ${f1(x + fw)} ${f1(y0)} Z`;
    s += `<path d="${d}" fill="${o.dim ? "#C9C1B8" : "#FFD9C2"}" stroke="${o.dim ? "#7A726A" : "#B54E2A"}" stroke-width=".9" stroke-linejoin="round"/>`;
  }
  return `<g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${o.rot ?? 0})">${s}</g>`;
}
