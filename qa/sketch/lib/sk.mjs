// 손그림 SVG 엔진 (빌드 타임 전용, 브라우저에서도 그대로 돈다).
// 영상 샘플(video/u3_ep01_sketch_sample/src/sketch.js, 캔버스 2D)의 선과 채움 문법을 SVG 경로로 옮겼다.
//   ink()  살짝 떨리는 굵은 마커 선
//   fill() 외곽선과 살짝 어긋나는 단색 채움 + 마커로 칠한 결(선택)
// 모든 함수는 (좌표, 시드)만의 순수 함수라 같은 장면은 언제 뽑아도 같은 SVG가 나온다(diff가 안정적).
// 좌표는 변환 행렬을 미리 곱해 평평한 경로로 내보낸다. 그래서 인물 머리 같은 기준점의
// 화면 좌표를 그리는 쪽이 알고 있고(mark), 말풍선 자리를 거기서 계산할 수 있다.

export const TAU = Math.PI * 2;

export const C = {
  ink: "#1c1c1e",
  paper: "#FFFFFF",
  gray: "#9b9b9b",
  grayLight: "#D6D6D2",
  skin: "#F6D6BE",
  skinSick: "#E2E4C8",
  hair: "#5B463A",
  wig: "#E9E5DD",
  blue: "#2F8EE0",
  navy: "#2F4168",
  sea: "#8CC8EC",
  seaDeep: "#5FAEDD",
  teal: "#12A594",
  red: "#E0503A",
  orange: "#F58A2E",
  lemon: "#FFD84A",
  yellow: "#FFC83D",
  gold: "#E2B23C",
  green: "#3FAE5A",
  board: "#3E7A5E",
  wood: "#C99A62",
  woodDark: "#A9773F",
  woodLight: "#EBD9BA",
  sail: "#F6EFDC",
  cloth: "#DCE6F0",
  parchment: "#F5E9C9",
  white: "#FFFFFF",
};

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
export function vnoise(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const a = hash(i + seed * 57.31), b = hash(i + 1 + seed * 57.31);
  const u = f * f * (3 - 2 * f);
  return (a + (b - a) * u) * 2 - 1;
}
export function mix(h1, h2, k) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const ch = s => Math.round(lerp((a >> s) & 255, (b >> s) & 255, k));
  return "#" + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, "0")).join("");
}

/* ---------- 경로 만들기 (촘촘한 점 배열) ---------- */

export function dense(pts, step = 4) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 0; k < n; k++) out.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]);
  }
  out.push(pts[pts.length - 1]);
  return out;
}
// 닫힌 다각형(모서리가 살아 있는 도형)
export const poly = (pts, step = 4) => dense([...pts, pts[0]], step);

// 점들을 지나는 부드러운 곡선 (Catmull-Rom)
export function curve(pts, closed = false, step = 4) {
  const n = pts.length;
  const get = i => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const out = [];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const m = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < m; k++) {
      const t = k / m, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(closed ? out[0] : pts[n - 1]);
  return out;
}

// 손으로 그린 원: 반지름이 살짝 출렁이고, 끝이 시작점을 조금 지나쳐 겹친다
export function circ(cx, cy, r, o = {}) {
  const seed = o.seed ?? 1, a0 = o.a0 ?? -2.3, over = o.over ?? 0.2;
  const sx = o.sx ?? 1, sy = o.sy ?? 1;
  const span = TAU + over;
  const n = Math.max(16, Math.ceil(span * r / 4));
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + span * i / n;
    const rr = r * (1 + (o.lump ?? 0.022) * vnoise(a * 1.15 + seed * 3.3, seed)) + (o.drift ?? r * 0.03) * (i / n - 0.5);
    out.push([cx + rr * Math.cos(a) * sx, cy + rr * Math.sin(a) * sy]);
  }
  return out;
}
export function ell(cx, cy, rx, ry, a0 = 0, a1 = TAU) {
  const n = Math.max(12, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 4));
  const out = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  return out;
}
export const arc = (cx, cy, r, a0, a1) => ell(cx, cy, r, r, a0, a1);
export function rrect(x, y, w, h, r = 20) {
  const out = [];
  const corner = (cx, cy, a0) => { for (let i = 0; i <= 6; i++) { const a = a0 + (Math.PI / 2) * i / 6; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  corner(x + w - r, y + r, -Math.PI / 2);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  out.push(out[0]);
  return dense(out, 4);
}

export function wobble(pts, amp = 2, seed = 1, freq = 1 / 80) {
  let s = 0;
  const out = new Array(pts.length);
  for (let i = 0; i < pts.length; i++) {
    if (i > 0) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    out[i] = [pts[i][0] + amp * vnoise(s * freq + 3.7, seed), pts[i][1] + amp * vnoise(s * freq + 91.3, seed + 0.5)];
  }
  return out;
}

// 구불구불한 선 (김, 어지럼). 아래에서 위로 올라간다.
export function squiggle(x, y0, len, amp, waves, phase = 0, lean = 0) {
  const pts = [];
  const n = Math.ceil(len / 3);
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    pts.push([x + lean * u * len + amp * Math.sin(u * waves * TAU + phase) * (0.35 + 0.65 * u), y0 - u * len]);
  }
  return pts;
}

/* ---------- 경로 직렬화: 단순화 + 부드러운 2차 곡선 ---------- */

function rdp(pts, tol) {
  const n = pts.length;
  if (n < 3) return pts.slice();
  const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1;
  const st = [[0, n - 1]];
  while (st.length) {
    const [a, b] = st.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
    let far = -1, fd = tol;
    for (let i = a + 1; i < b; i++) {
      const d = L < 1e-6 ? Math.hypot(pts[i][0] - ax, pts[i][1] - ay) : Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / L;
      if (d > fd) { fd = d; far = i; }
    }
    if (far > 0) { keep[far] = 1; st.push([a, far], [far, b]); }
  }
  const out = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(pts[i]);
  return out;
}

const T10 = v => Math.round(v * 10);
function num(t) {
  let s = (t / 10).toString();
  if (s.startsWith("0.")) s = s.slice(1); else if (s.startsWith("-0.")) s = "-" + s.slice(2);
  return s;
}
const pair = (a, b) => { const sa = num(a), sb = num(b); return sa + (sb[0] === "-" ? "" : " ") + sb; };
const turn = (a, b, c) => {
  const a1 = Math.atan2(b[1] - a[1], b[0] - a[0]), a2 = Math.atan2(c[1] - b[1], c[0] - b[0]);
  let d = Math.abs(a2 - a1); if (d > Math.PI) d = TAU - d;
  return d;
};
const CORNER = 0.9; // 이보다 크게 꺾이면 모서리로 본다(둥글리지 않는다)

// 점 배열 → path d. 완만한 구간은 중점 2차 곡선(Q + T)으로, 꺾이는 점은 그대로 지난다.
export function pathD(input, closed, tol = 0.3) {
  let pts = input;
  if (closed && pts.length > 2) {
    const a = pts[0], b = pts[pts.length - 1];
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.8) pts = pts.slice(0, -1);
    // 고리는 가장 먼 점에서 둘로 갈라 단순화한다
    let far = 1, fd = -1;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]); if (d > fd) { fd = d; far = i; } }
    const h1 = rdp(pts.slice(0, far + 1), tol), h2 = rdp([...pts.slice(far), pts[0]], tol);
    pts = [...h1, ...h2.slice(1, -1)];
  } else {
    pts = rdp(pts, tol);
  }
  const n = pts.length;
  if (n < 2) return "";
  let cx = 0, cy = 0;
  let d = "";
  const M = p => { cx = T10(p[0]); cy = T10(p[1]); d += "M" + pair(cx, cy); };
  const rel = p => { const x = T10(p[0]), y = T10(p[1]); const s = pair(x - cx, y - cy); cx = x; cy = y; return s; };
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  // 한 구간(양 끝은 정확히 지나는 열린 조각)
  const piece = seg => {
    const k = seg.length - 1;
    if (k === 1) { d += "l" + rel(seg[1]); return; }
    let sinceQ = 99;
    for (let j = 1; j < k; j++) {
      const end = j === k - 1 ? seg[k] : mid(seg[j], seg[j + 1]);
      if (sinceQ >= 10) {
        const ox = cx, oy = cy;
        const c = pair(T10(seg[j][0]) - ox, T10(seg[j][1]) - oy);
        d += "q" + c + " " + rel(end); sinceQ = 0;
      } else { d += "t" + rel(end); sinceQ++; }
    }
  };
  if (closed) {
    const cor = [];
    for (let i = 0; i < n; i++) if (turn(pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n]) > CORNER) cor.push(i);
    if (!cor.length) {
      if (n < 3) return "";
      M(mid(pts[n - 1], pts[0]));
      // 고리 전체가 완만하면 중점에서 중점으로 돈다
      let sinceQ = 99;
      for (let i = 0; i < n; i++) {
        const end = mid(pts[i], pts[(i + 1) % n]);
        if (sinceQ >= 10) { const ox = cx, oy = cy; d += "q" + pair(T10(pts[i][0]) - ox, T10(pts[i][1]) - oy) + " " + rel(end); sinceQ = 0; }
        else { d += "t" + rel(end); sinceQ++; }
      }
    } else {
      M(pts[cor[0]]);
      for (let c = 0; c < cor.length; c++) {
        const a = cor[c], b = cor[(c + 1) % cor.length];
        const seg = [];
        for (let i = a; ; i = (i + 1) % n) { seg.push(pts[i]); if (i === b && seg.length > 1) break; if (seg.length > n + 1) break; }
        piece(seg);
      }
    }
    return d + "z";
  }
  M(pts[0]);
  let start = 0;
  for (let i = 1; i < n; i++) {
    if (i === n - 1 || turn(pts[i - 1], pts[i], pts[i + 1]) > CORNER) { piece(pts.slice(start, i + 1)); start = i; }
  }
  return d;
}

const r1 = v => { const s = (Math.round(v * 10) / 10).toString(); return s; };

/* ---------- 그리기 ---------- */

export class Sk {
  // w, h: 그림 크기(=viewBox). o.id: 요소 id 접두(같은 문서에 여러 장이 인라인으로 들어갈 때 충돌 방지)
  // o.wobK: 떨림 배율, o.lwK: 선 굵기 배율, o.tex: 채움 결(false면 끔), o.tol: 경로 단순화 허용 오차
  constructor(w, h, o = {}) {
    this.w = w; this.h = h;
    this.id = o.id ?? "k";
    this.wobK = o.wobK ?? 1;
    this.lwK = o.lwK ?? 1;
    this.tex = o.tex ?? true;
    this.tol = o.tol ?? 0.3;
    this.body = []; this.defs = []; this.n = 0;
    this.M = [1, 0, 0, 1, 0, 0]; this.stack = [];
    this.anchors = {};
  }
  save() { this.stack.push(this.M.slice()); }
  restore() { this.M = this.stack.pop(); }
  _mul(a, b, c, d, e, f) {
    const [A, B, Cc, D, E, F] = this.M;
    this.M = [A * a + Cc * b, B * a + D * b, A * c + Cc * d, B * c + D * d, A * e + Cc * f + E, B * e + D * f + F];
  }
  translate(x, y) { this._mul(1, 0, 0, 1, x, y); }
  scale(sx, sy = sx) { this._mul(sx, 0, 0, sy, 0, 0); }
  rotate(a) { const c = Math.cos(a), s = Math.sin(a); this._mul(c, s, -s, c, 0, 0); }
  // (x, y)에 원점을 두고 s배로 fn을 그린다
  at(x, y, s, fn, rot = 0, flip = 1) { this.save(); this.translate(x, y); if (rot) this.rotate(rot); this.scale(s * flip, s); fn(); this.restore(); }
  pt(p) { const [a, b, c, d, e, f] = this.M; return [a * p[0] + c * p[1] + e, b * p[0] + d * p[1] + f]; }
  get k() { const [a, b, c, d] = this.M; return Math.sqrt(Math.abs(a * d - b * c)); }
  // 기준점 기록(화면 좌표). 말풍선 자리 계산에 쓴다.
  mark(name, x, y, r = 0) { const p = this.pt([x, y]); this.anchors[name] = { x: p[0], y: p[1], r: r * this.k }; }

  // 마커 선
  ink(pts, o = {}) {
    if (!pts || pts.length < 2) return;
    const seed = o.seed ?? 1;
    const wob = (o.wob ?? 2) * this.wobK;
    const p = wob ? wobble(pts, wob, seed, o.freq) : pts;
    const d = pathD(p.map(v => this.pt(v)), !!o.closed, this.tol);
    if (!d) return;
    const w = (o.w ?? 11) * this.lwK * this.k;
    let a = `stroke="${o.color ?? C.ink}" stroke-width="${r1(w)}"`;
    if (o.dash) a += ` stroke-dasharray="${o.dash.map(v => r1(v * this.k)).join(" ")}"`;
    if (o.alpha !== undefined && o.alpha < 1) a += ` opacity="${o.alpha}"`;
    if (o.cap) a += ` stroke-linecap="${o.cap}"`;
    this.body.push(`<path d="${d}" ${a}/>`);
  }

  // 마커 채움: 외곽선과 살짝 어긋나게 칠한다. o.tex 가 참이면 칠한 결을 얹는다.
  fill(pts, color, o = {}) {
    if (!pts || pts.length < 3) return;
    const seed = o.seed ?? 3;
    const wob = (o.wob ?? 2.2) * this.wobK;
    const dx = (o.dx ?? 2) * (this.wobK > 0 ? Math.min(1, this.wobK + 0.3) : 0), dy = (o.dy ?? 2.5) * (this.wobK > 0 ? Math.min(1, this.wobK + 0.3) : 0);
    const p = (wob ? wobble(pts, wob, seed, 1 / 95) : pts).map(v => this.pt([v[0] + dx, v[1] + dy]));
    const d = pathD(p, true, this.tol);
    if (!d) return;
    const al = o.alpha !== undefined && o.alpha < 1 ? ` opacity="${o.alpha}"` : "";
    const tex = this.tex && o.tex;
    if (!tex) { this.body.push(`<path d="${d}" fill="${color}"${al}/>`); return; }
    const id = `${this.id}${++this.n}`;
    this.defs.push(`<path id="${id}" d="${d}"/><clipPath id="${id}c"><use href="#${id}"/></clipPath>`);
    this.body.push(`<use href="#${id}" fill="${color}"${al}/>`);
    // 결: 마커가 겹쳐 지나간 자리(조금 진한 띠)와 덜 칠해진 자리(조금 밝은 띠)
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const q of p) { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }
    const bw = x1 - x0, bh = y1 - y0, diag = Math.hypot(bw, bh);
    const ang = (o.texAng ?? -0.5) + 0.25 * (hash(seed * 7.7) - 0.5);
    const ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const gap = clamp(diag / 7, 9, 34) * (typeof tex === "number" ? tex : 1);
    const dark = mix(color, "#000000", o.texDark ?? 0.16), light = mix(color, "#ffffff", o.texLight ?? 0.45);
    const parts = [];
    let i = 0;
    for (let t = -diag / 2 + gap * 0.6; t < diag / 2; t += gap * (0.75 + 0.6 * hash(seed * 3.1 + i * 9.7)), i++) {
      const h1 = hash(seed * 11.3 + i * 5.3), h2 = hash(seed * 2.9 + i * 13.1);
      const a0 = -diag / 2 * (0.55 + 0.45 * h1), a1 = diag / 2 * (0.55 + 0.45 * h2);
      const line = [];
      const m = Math.max(4, Math.ceil((a1 - a0) / 14));
      for (let j = 0; j <= m; j++) {
        const s = a0 + (a1 - a0) * j / m;
        const off = t + gap * 0.18 * vnoise(s / 46 + i * 3.3, seed + 2.2);
        line.push([mx + ux * s + vx * off, my + uy * s + vy * off]);
      }
      const lightOne = i % 3 === 1;
      const lw = gap * (lightOne ? 0.2 + 0.25 * h2 : 0.18 + 0.3 * h1);
      parts.push(`<path d="${pathD(line, false, 0.6)}" stroke="${lightOne ? light : dark}" stroke-width="${r1(lw)}" opacity="${lightOne ? 0.55 : 0.5}"/>`);
    }
    if (parts.length) this.body.push(`<g clip-path="url(#${id}c)">${parts.join("")}</g>`);
  }

  // 채움 + 외곽선 한 번에
  shape(pts, color, o = {}) {
    this.fill(pts, color, { seed: (o.seed ?? 1) + 40, tex: o.tex, wob: o.fwob, dx: o.dx, dy: o.dy, alpha: o.falpha, texAng: o.texAng });
    this.ink(pts, { w: o.w ?? 10, seed: o.seed ?? 1, wob: o.wob ?? 1.6, color: o.line });
  }

  // 부드러운 번짐(열기, 강조)
  glow(cx, cy, r, color, alpha = 0.5, inner = 0.2) {
    const id = `${this.id}${++this.n}`;
    const p = this.pt([cx, cy]);
    this.defs.push(`<radialGradient id="${id}"><stop offset="${inner}" stop-color="${color}" stop-opacity="${alpha}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`);
    this.body.push(`<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="${r1(r * this.k)}" fill="url(#${id})"/>`);
  }

  // 까만 점(눈동자 등)
  dot(cx, cy, r, color = C.ink) {
    const p = this.pt([cx, cy]);
    this.body.push(`<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="${r1(r * this.k)}" fill="${color}"/>`);
  }

  raw(s) { this.body.push(s); }

  // o.inline: 문서에 직접 넣을 때(크기 속성 없이, 접근성 숨김)
  svg(o = {}) {
    const size = o.inline ? ` aria-hidden="true" focusable="false"` : ` width="${this.w}" height="${this.h}"`;
    const vb = o.viewBox ?? `0 0 ${this.w} ${this.h}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${size} fill="none" stroke-linecap="round" stroke-linejoin="round">` +
      (this.defs.length ? `<defs>${this.defs.join("")}</defs>` : "") + this.body.join("") + `</svg>`;
  }
}

/* ---------- 자주 쓰는 기호 ---------- */

export function arrow(sk, pts, o = {}) {
  const d = o.straight ? dense(pts) : curve(pts);
  sk.ink(d, o);
  const n = d.length, a = d[Math.max(0, n - 8)], b = d[n - 1];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const hl = o.head ?? (o.w ?? 11) * 2.6, sp = 0.52;
  for (const sgn of [-1, 1]) {
    const e = [b[0] - hl * Math.cos(ang + sgn * sp), b[1] - hl * Math.sin(ang + sgn * sp)];
    sk.ink(dense([e, b]), { ...o, dash: null, seed: (o.seed ?? 1) + 3 + sgn, wob: 0.6 });
  }
}

// 물음표 (글자가 아니라 기호로 그린다)
export function qmark(sk, x, y, s = 1, o = {}) {
  const col = o.color ?? C.ink, w = (o.w ?? 12);
  sk.at(x, y, s, () => {
    sk.ink(curve([[-22, -30], [-16, -58], [8, -66], [26, -46], [16, -20], [0, -4], [0, 14]]), { w, color: col, seed: o.seed ?? 51, wob: 0.8 });
    sk.dot(0, 40, w * 0.62, col);
  }, o.rot ?? 0);
}
export function emark(sk, x, y, s = 1, o = {}) {
  const col = o.color ?? C.red, w = (o.w ?? 13);
  sk.at(x, y, s, () => {
    sk.ink(dense([[2, -62], [0, 8]]), { w, color: col, seed: o.seed ?? 53, wob: 0.6 });
    sk.dot(0, 38, w * 0.62, col);
  }, o.rot ?? 0.12);
}
export function check(sk, x, y, s = 1, o = {}) {
  sk.at(x, y, s, () => sk.ink(curve([[-26, 2], [-8, 24], [34, -30]]), { w: o.w ?? 13, color: o.color ?? C.green, seed: 31, wob: 0.6 }));
}
// 반짝임 선(머리 위 방사선)
export function rays(sk, x, y, r0, r1x, n = 5, o = {}) {
  const a0 = o.a0 ?? -2.5, a1 = o.a1 ?? -0.64;
  for (let i = 0; i < n; i++) {
    const a = lerp(a0, a1, n === 1 ? 0.5 : i / (n - 1));
    sk.ink(dense([[x + r0 * Math.cos(a), y + r0 * Math.sin(a)], [x + r1x * Math.cos(a), y + r1x * Math.sin(a)]]), { w: o.w ?? 7, color: o.color ?? C.ink, seed: 60 + i, wob: 0.5 });
  }
}
// 네 갈래 반짝이
export function sparkle(sk, x, y, r, o = {}) {
  const col = o.color ?? C.yellow;
  const pts = [];
  for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, rr = i % 2 ? r * 0.3 : r; pts.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]); }
  sk.fill(poly(pts, 3), col, { dx: 0, dy: 0, wob: 0.4, seed: o.seed ?? 71 });
  sk.ink(poly(pts, 3), { w: o.w ?? 5, wob: 0.4, seed: o.seed ?? 72 });
}
// 땀방울
export function drop(sk, x, y, s = 1, o = {}) {
  const pts = curve([[0, -22], [12, 0], [9, 14], [0, 19], [-9, 14], [-12, 0]], true, 3);
  sk.at(x, y, s, () => {
    sk.fill(pts, o.color ?? "#BFE2F4", { dx: 0, dy: 0, wob: 0.4, seed: 81 });
    sk.ink(pts, { w: o.w ?? 5, color: o.line ?? C.blue, wob: 0.4, seed: 82 });
  }, o.rot ?? 0);
}
// 어지럼 구불선 (아픈 사람 머리 위)
export function dizzy(sk, x, y, s = 1, o = {}) {
  sk.at(x, y, s, () => {
    for (let i = 0; i < (o.n ?? 2); i++) sk.ink(squiggle(-14 + i * 28, 0, 44, 7, 2, i * 1.6), { w: o.w ?? 6, color: o.color ?? C.gray, wob: 0, seed: 90 + i });
  });
}

// 하트
export function heart(sk, x, y, s = 1, o = {}) {
  const col = o.color ?? "#F0627A";
  const pts = curve([[0, 22], [-26, -2], [-24, -22], [-10, -26], [0, -14], [10, -26], [24, -22], [26, -2]], true, 3);
  sk.at(x, y, s, () => {
    sk.fill(pts, col, { dx: 0, dy: 0, wob: 0.4, seed: o.seed ?? 111 });
    sk.ink(pts, { w: o.w ?? 6, wob: 0.4, seed: (o.seed ?? 111) + 1 });
  }, o.rot ?? 0);
}

// 가위표
export function xmark(sk, x, y, s = 1, o = {}) {
  const col = o.color ?? C.red, w = o.w ?? 13;
  sk.at(x, y, s, () => {
    sk.ink(dense([[-30, -30], [30, 30]]), { w, color: col, seed: o.seed ?? 121, wob: 0.8 });
    sk.ink(dense([[30, -30], [-30, 30]]), { w, color: col, seed: (o.seed ?? 121) + 1, wob: 0.8 });
  }, o.rot ?? 0);
}
