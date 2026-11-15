// [중2 Ⅵ v5] 융털 랩(g2u6VilliLab)의 그림. 2026-11-15 사용자 요청 "소장과 소장벽 융털의 모양을 교과서처럼 자세히"로 다시 그렸다.
//
// 책의 그림 Ⅵ-5(작은창자 안쪽의 구조와 융털의 속 구조)를 따른다.
//   벽 덩어리: 앞면은 자른 면이다. 맨 위가 점막(분홍)이고, 주름 속에는 점막 아래층(옅은 살색, 작은 혈관)이 심처럼 들어가며,
//   맨 아래에 근육층 두 겹(돌림근은 세로 결, 세로근은 가로 결)이 평평하게 깔린다. 주름은 근육층까지 접히지 않는다.
//   윗면은 안쪽(오른쪽 위)으로 물러나는 면이고, 주름은 그 면을 가로지르는 높은 둑이다. 융털이 있으면 윗면이 오돌토돌하다.
//   융털: 자른 면의 윤곽을 따라 손가락 모양으로 빽빽하게 선다. 속에 암죽관(노란 줄)이 비친다.
//   확대 칸 "융털 속": 융털 하나의 겉 세포 한 겹, 속의 모세혈관(빨강, 파랑의 그물)과 가운데 암죽관(노랑).
// 흡수 모형: 같은 수(20개)의 영양소를 흘려보낼 때 흡수되는 수는 영양소와 닿는 겉면의 길이(앞면 윤곽 + 융털의 옆면과 끝)에 비례하고,
//   가장 넓은 벽(주름과 융털)이 20개를 다 흡수한다고 놓는다. 겉면 길이는 아래 상수에서 계산한다(그림을 바꾸면 수도 같이 바뀐다).
// 좌표는 무대 346×230 설계 px. 무대 안 글자는 12px 이상.

import { P } from "./kit";

export type Pt = [number, number];

const X0 = 20;
const X1 = 314;
const BASE = 192; // 주름 사이 골짜기(매끈한 벽이면 겉면)의 높이
const BOTTOM = 230;
const FOLDS = 5;
const FOLD_H = 60;
const DEPTH: Pt = [18, -11]; // 윗면이 안쪽으로 물러나는 방향
const V_SP = 7.6; // 융털 사이(겉면을 따라 잰 길이)
const V_H = 12.5; // 융털 높이
const V_W = 5.4; // 융털 굵기

const ridge = (u: number): number => {
  const v = (u * FOLDS) % 1;
  return Math.pow(Math.sin(Math.PI * v), 0.65);
};
/** 앞면 겉선(왼쪽에서 오른쪽). level 0 매끈, 1과 2는 주름. */
function profile(level: number): Pt[] {
  const pts: Pt[] = [];
  const n = 240;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = X0 + (X1 - X0) * u;
    pts.push([x, level >= 1 ? BASE - FOLD_H * ridge(u) : BASE]);
  }
  return pts;
}
const PROFILES = [0, 1, 2].map(profile);
const lenOf = (p: Pt[]): number => p.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);
/** 겉선 위에 같은 간격(호의 길이)으로 놓은 융털의 뿌리와 바깥쪽 법선. */
function villiRoots(p: Pt[]): { at: Pt; n: Pt; t: Pt }[] {
  const out: { at: Pt; n: Pt; t: Pt }[] = [];
  let acc = V_SP / 2;
  for (let i = 1; i < p.length; i++) {
    const seg = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    while (acc <= seg) {
      const u = acc / seg;
      const at: Pt = [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * u, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * u];
      const t: Pt = [(p[i][0] - p[i - 1][0]) / seg, (p[i][1] - p[i - 1][1]) / seg];
      out.push({ at, t, n: [t[1], -t[0]] });
      acc += V_SP;
    }
    acc -= seg;
  }
  return out;
}
const ROOTS = villiRoots(PROFILES[2]);
/** 영양소와 닿는 겉면의 길이: 매끈, 주름은 겉선 길이. 융털은 손가락 하나가 뿌리 폭(V_W)을 옆면 둘과 둥근 끝으로 바꾼다. */
const SURFACE = [lenOf(PROFILES[0]), lenOf(PROFILES[1]), lenOf(PROFILES[1]) + ROOTS.length * (2 * (V_H - V_W / 2) + (Math.PI * V_W) / 2 - V_W)];
export const VILLI_TOTAL = 20;
/** 흡수된 수(가장 넓은 벽이 20개를 다 흡수한다고 놓고 겉면 길이에 비례). */
export const VILLI_ABSORBED = SURFACE.map((l) => Math.max(1, Math.round((VILLI_TOTAL * l) / SURFACE[2])));

const C = {
  top: "#F0B4B9",
  topLine: "#C98088",
  mucosa: "#E59AA1",
  mucosaLine: "#A9505C",
  sub: "#F4D6CB",
  muscle1: "#C25A66",
  muscle2: "#A64753",
  side: "#B8636D",
  villus: "#EBA0A7",
  villusCore: "#F6C9CB",
  lacteal: "#F5D36A",
};

const yAt = (p: Pt[], x: number): number => {
  const i = Math.max(0, Math.min(p.length - 2, Math.floor(((x - X0) / (X1 - X0)) * (p.length - 1))));
  const a = p[i];
  const b = p[i + 1];
  const u = (x - a[0]) / (b[0] - a[0] || 1);
  return a[1] + (b[1] - a[1]) * Math.max(0, Math.min(1, u));
};
const ptsStr = (p: Pt[]): string => p.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L");

/** 융털 하나(손가락 모양). 뿌리 at, 바깥 법선 n, 접선 t. */
function finger(at: Pt, n: Pt, t: Pt, h = V_H, w = V_W): string {
  const r = w / 2;
  const L: Pt = [at[0] - t[0] * r, at[1] - t[1] * r];
  const R: Pt = [at[0] + t[0] * r, at[1] + t[1] * r];
  const k = h - r;
  const Lt: Pt = [L[0] + n[0] * k, L[1] + n[1] * k];
  const Rt: Pt = [R[0] + n[0] * k, R[1] + n[1] * k];
  const f = (q: Pt): string => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  const core = (s: number): string => {
    const r2 = r * s;
    const L2: Pt = [at[0] - t[0] * r2, at[1] - t[1] * r2];
    const R2: Pt = [at[0] + t[0] * r2, at[1] + t[1] * r2];
    const k2 = h - r - 1.1;
    return `M${f(L2)} L${f([L2[0] + n[0] * k2, L2[1] + n[1] * k2])} A${r2.toFixed(2)} ${r2.toFixed(2)} 0 0 1 ${f([R2[0] + n[0] * k2, R2[1] + n[1] * k2])} L${f(R2)} Z`;
  };
  const tip: Pt = [at[0] + n[0] * (h - 3), at[1] + n[1] * (h - 3)];
  return (
    `<path d="M${f(L)} L${f(Lt)} A${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${f(Rt)} L${f(R)} Z" fill="${C.villus}" stroke="${C.mucosaLine}" stroke-width=".8"/>` +
    `<path d="${core(0.5)}" fill="${C.villusCore}" opacity=".9"/>` +
    `<line x1="${at[0].toFixed(1)}" y1="${at[1].toFixed(1)}" x2="${tip[0].toFixed(1)}" y2="${tip[1].toFixed(1)}" stroke="${C.lacteal}" stroke-width=".9" stroke-linecap="round"/>`
  );
}

/** 벽 덩어리 한 장과 흡수 자리(영양소가 닿는 점). */
export function villiWall(level: number): { svg: string; targets: Pt[] } {
  const p = PROFILES[level];
  const back = p.map((q): Pt => [q[0] + DEPTH[0], q[1] + DEPTH[1]]);
  let s = "";
  // 윗면(안쪽으로 물러나는 면): 앞뒤 겉선 사이의 띠. 앞면이 덮지 않은 곳만 보인다.
  s += `<path d="M${ptsStr(p)} L${ptsStr(back.slice().reverse())} Z" fill="${C.top}" stroke="${C.topLine}" stroke-width=".8"/>`;
  for (let i = 0; i < p.length - 1; i += 2) {
    const a = p[i];
    const b = p[i + 1];
    s += `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)} L${(b[0] + DEPTH[0]).toFixed(1)} ${(b[1] + DEPTH[1]).toFixed(1)} L${(a[0] + DEPTH[0]).toFixed(1)} ${(a[1] + DEPTH[1]).toFixed(1)} Z" fill="${C.top}"/>`;
  }
  // 주름 꼭대기를 따라 안쪽으로 이어지는 둑의 등선
  if (level >= 1) for (let k = 0; k < FOLDS; k++) {
    const x = X0 + ((k + 0.5) / FOLDS) * (X1 - X0);
    const y = yAt(p, x);
    s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + DEPTH[0]).toFixed(1)}" y2="${(y + DEPTH[1]).toFixed(1)}" stroke="#FAD3D6" stroke-width="1.4" opacity=".8"/>`;
  }
  // 융털이 있으면 윗면이 오돌토돌하다(융털 끝을 위에서 본 모습). 앞면에 가려지는 점은 앞면이 덮는다.
  if (level === 2)
    for (let i = 1; i < p.length; i += 3)
      [0.22, 0.5, 0.78].forEach((fr, j) => {
        const x = p[i][0] + DEPTH[0] * fr + (j % 2 ? 1.6 : 0);
        const y = p[i][1] + DEPTH[1] * fr;
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.55" fill="#F8CDD0" stroke="${C.topLine}" stroke-width=".5"/>`;
      });
  // 오른쪽 옆면
  const end = p[p.length - 1];
  s += `<path d="M${end[0]} ${end[1]} L${end[0]} ${BOTTOM} L${end[0] + DEPTH[0]} ${BOTTOM + DEPTH[1]} L${end[0] + DEPTH[0]} ${end[1] + DEPTH[1]} Z" fill="${C.side}" stroke="${C.mucosaLine}" stroke-width=".8"/>`;
  s += `<path d="M${end[0]} ${BASE + 16} L${end[0] + DEPTH[0]} ${BASE + 16 + DEPTH[1]} M${end[0]} ${BASE + 27} L${end[0] + DEPTH[0]} ${BASE + 27 + DEPTH[1]}" stroke="${C.muscle2}" stroke-width="1"/>`;
  // 앞면(자른 면): 점막
  s += `<path d="M${ptsStr(p)} L${X1} ${BOTTOM} L${X0} ${BOTTOM} Z" fill="${C.mucosa}"/>`;
  // 점막 아래층: 주름 속으로 심처럼 들어간다
  const sub = p.map((q, i): Pt => {
    const u = i / (p.length - 1);
    return [q[0], level >= 1 ? BASE + 7 - (FOLD_H - 13) * Math.pow(ridge(u), 1.35) : BASE + 7];
  });
  s += `<path d="M${ptsStr(sub)} L${X1} ${BOTTOM} L${X0} ${BOTTOM} Z" fill="${C.sub}"/>`;
  // 점막 아래층의 작은 혈관(자른 단면)
  for (let x = X0 + 10; x < X1 - 6; x += 23) {
    s += `<circle cx="${x}" cy="${BASE + 11.5}" r="1.7" fill="#E05B6E"/><circle cx="${x + 5}" cy="${BASE + 12.5}" r="1.5" fill="#4E7FD6"/>`;
  }
  // 근육층 두 겹: 돌림근(세로 결), 세로근(가로 결)
  s += `<rect x="${X0}" y="${BASE + 16}" width="${X1 - X0}" height="11" fill="${C.muscle1}"/>`;
  for (let x = X0 + 3; x < X1; x += 4.5) s += `<line x1="${x.toFixed(1)}" y1="${BASE + 16}" x2="${x.toFixed(1)}" y2="${BASE + 27}" stroke="#9E3F4A" stroke-width=".7" opacity=".7"/>`;
  s += `<rect x="${X0}" y="${BASE + 27}" width="${X1 - X0}" height="${BOTTOM - BASE - 27}" fill="${C.muscle2}"/>`;
  s += `<path d="M${X0} ${BASE + 31} H${X1} M${X0} ${BASE + 35} H${X1}" stroke="#7E2F3A" stroke-width=".7" opacity=".7"/>`;
  // 겉선
  s += `<path d="M${ptsStr(p)}" fill="none" stroke="${C.mucosaLine}" stroke-width="1.5" stroke-linejoin="round"/>`;
  // 융털
  let targets: Pt[] = [];
  if (level === 2) {
    ROOTS.forEach((r) => (s += finger(r.at, r.n, r.t)));
    targets = ROOTS.map((r): Pt => [r.at[0] + r.n[0] * (V_H + 4), r.at[1] + r.n[1] * (V_H + 4)]);
  } else {
    const L = lenOf(p);
    const m = 60;
    for (let i = 0; i < m; i++) {
      const d = ((i + 0.5) / m) * L;
      let acc = 0;
      for (let j = 1; j < p.length; j++) {
        const seg = Math.hypot(p[j][0] - p[j - 1][0], p[j][1] - p[j - 1][1]);
        if (acc + seg >= d) {
          const u = (d - acc) / seg;
          targets.push([p[j - 1][0] + (p[j][0] - p[j - 1][0]) * u, p[j - 1][1] + (p[j][1] - p[j - 1][1]) * u - 4]);
          break;
        }
        acc += seg;
      }
    }
  }
  return { svg: s, targets };
}

/** 이름표(흰 글자, 바탕색 테두리). */
const label = (x: number, y: number, t: string, color = "#FFFFFF", anchor = "middle"): string =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="12" font-weight="800" fill="${color}" stroke="#0B1524" stroke-width="3" stroke-linejoin="round" paint-order="stroke">${t}</text>`;

/** 벽의 이름표: 주름(1, 2), 융털(2). */
export function villiWallLabels(level: number): string {
  let s = "";
  if (level >= 1) {
    const x = X0 + (1.5 / FOLDS) * (X1 - X0);
    s += label(x, BASE - FOLD_H * 0.45, "주름");
  }
  s += label(X0 + 6, BOTTOM - 6, "근육층", "#FFE3E6", "start");
  return s;
}

/** 확대 칸 "융털 속": 겉 세포 한 겹, 모세혈관 그물(빨강은 들어오는 쪽, 파랑은 나가는 쪽), 가운데 암죽관. 오른쪽 위(234~342, 42~124). */
export function villiInset(): string {
  const bx = 234;
  const by = 42;
  const W = 108;
  const H = 82;
  const vx = bx + 30; // 융털 가운데
  const top = by + 10;
  const bot = by + H;
  const w = 32;
  let s = `<rect x="${bx}" y="${by}" width="${W}" height="${H}" rx="10" fill="#0E1A2E" stroke="#5B79A6" stroke-width="1.2"/>`;
  s += `<clipPath id="g6v-clip"><rect x="${bx + 1}" y="${by + 1}" width="${W - 2}" height="${H - 2}" rx="9"/></clipPath><g clip-path="url(#g6v-clip)">`;
  // 바닥 조직
  s += `<rect x="${bx}" y="${bot - 8}" width="${W}" height="10" fill="${C.sub}"/>`;
  // 융털의 겉(세포 한 겹)
  const capsule = (half: number, t: number): string => `M${vx - half} ${bot} L${vx - half} ${t + half} A${half} ${half} 0 0 1 ${vx + half} ${t + half} L${vx + half} ${bot} Z`;
  s += `<path d="${capsule(w / 2, top)}" fill="${C.villus}" stroke="${C.mucosaLine}" stroke-width="1"/>`;
  s += `<path d="${capsule(w / 2 - 5, top + 5)}" fill="#FBE7E4" stroke="#D88A93" stroke-width=".7"/>`;
  // 세포 칸막이와 핵
  for (let y = top + 18; y < bot - 6; y += 6) {
    s += `<line x1="${vx - w / 2}" y1="${y}" x2="${vx - w / 2 + 5}" y2="${y}" stroke="${C.mucosaLine}" stroke-width=".6"/><line x1="${vx + w / 2 - 5}" y1="${y}" x2="${vx + w / 2}" y2="${y}" stroke="${C.mucosaLine}" stroke-width=".6"/>`;
    s += `<circle cx="${vx - w / 2 + 2.5}" cy="${y + 3}" r=".9" fill="#8A3A50"/><circle cx="${vx + w / 2 - 2.5}" cy="${y + 3}" r=".9" fill="#8A3A50"/>`;
  }
  // 모세혈관: 왼쪽으로 올라가는 빨강, 오른쪽으로 내려오는 파랑, 사이를 잇는 그물
  const lx = vx - 8;
  const rx = vx + 8;
  s += `<path d="M${lx} ${bot} C${lx - 1} ${bot - 20}, ${lx + 1} ${top + 26}, ${lx} ${top + 16} C${lx} ${top + 10}, ${vx} ${top + 8}, ${vx} ${top + 9}" fill="none" stroke="#E5485C" stroke-width="2"/>`;
  s += `<path d="M${rx} ${bot} C${rx + 1} ${bot - 20}, ${rx - 1} ${top + 26}, ${rx} ${top + 16} C${rx} ${top + 10}, ${vx} ${top + 8}, ${vx} ${top + 9}" fill="none" stroke="#4E7FD6" stroke-width="2"/>`;
  [top + 24, top + 38, top + 52].forEach((y, i) => {
    s += `<path d="M${lx} ${y} C${vx - 3} ${y - 5 + i}, ${vx + 3} ${y + 5 - i}, ${rx} ${y - 2}" fill="none" stroke="#B05A9A" stroke-width="1.2"/>`;
  });
  // 암죽관(가운데, 끝이 막힌 관)
  s += `<path d="M${vx - 3} ${bot} L${vx - 3} ${top + 20} A3 3 0 0 1 ${vx + 3} ${top + 20} L${vx + 3} ${bot} Z" fill="${C.lacteal}" stroke="#B8901F" stroke-width=".8"/>`;
  s += `</g>`;
  // 이름표와 가리키는 선
  s += `<line x1="${rx + 1}" y1="${top + 30}" x2="${bx + 64}" y2="${by + 28}" stroke="#FF9AA5" stroke-width="1"/>` + label(bx + 66, by + 32, "모세혈관", "#FFB3BB", "start");
  s += `<line x1="${vx + 3}" y1="${top + 50}" x2="${bx + 64}" y2="${by + 60}" stroke="${C.lacteal}" stroke-width="1"/>` + label(bx + 66, by + 64, "암죽관", "#F5DA70", "start");
  s += label(bx + W - 8, by + 16, "융털 속", "#C6D3E6", "end");
  return s;
}

/** 확대 칸과 벽의 융털 하나를 잇는 점선(돋보기 선). */
export function villiInsetLink(): string {
  const r = ROOTS[Math.round(ROOTS.length * 0.66)];
  const tip: Pt = [r.at[0] + r.n[0] * V_H * 0.6, r.at[1] + r.n[1] * V_H * 0.6];
  return `<rect x="${(tip[0] - 5).toFixed(1)}" y="${(tip[1] - 7).toFixed(1)}" width="10" height="14" fill="none" stroke="#9CC2FF" stroke-width="1"/><path d="M${(tip[0] - 5).toFixed(1)} ${(tip[1] - 7).toFixed(1)} L234 124 M${(tip[0] + 5).toFixed(1)} ${(tip[1] - 7).toFixed(1)} L342 124" stroke="#9CC2FF" stroke-width="1" stroke-dasharray="3 3" opacity=".75"/>`;
}

export const VILLI_DOT = P.glucose;
