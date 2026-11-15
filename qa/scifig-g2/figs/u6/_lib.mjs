// Ⅵ 동물과 에너지 그림의 공용 도우미(밑줄로 시작해서 빌드가 그림으로 치지 않는다).
//   spline/poly/inPoly   매끈한 곡선 점열, 다각형 경로, 점이 안에 있는지
//   pillow               흐린 가림막으로 높이를 만들어 화소마다 음영(허파, 콩팥, 세포처럼 말랑한 덩어리)
//   tubes                굵기가 있는 관을 겹 선으로(가장자리, 바탕, 빛 받는 쪽, 반짝임). 가지 친 나무도 한 번에
//   capsule, bubble      작은 캡슐(마이토콘드리아)과 반투명 공(허파꽈리)
//   zoomCircle, zoomWedge, marker   확대 원(흰 고리 + 회색 선), 확대 통로, 짚는 작은 원
//   layer, put           덧그림 캔버스와 그것을 얹기
// 빛은 언제나 왼쪽 위(P.LIGHT). 좌표는 CSS px.
import * as P from "../../kit/paint.mjs";

export const TAU = Math.PI * 2;
const { clamp } = P;

// ── 점열 ───────────────────────────────────────────────────────────
/** Catmull-Rom 곡선을 점열로 편다. closed면 닫힌 곡선. per = 마디마다 점 수. */
export function spline(pts, closed = true, per = 10) {
  const n = pts.length;
  const out = [];
  const get = (i) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let j = 0; j < per; j++) {
      const t = j / per, t2 = t * t, t3 = t2 * t;
      const f = (k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
      out.push([f(0), f(1)]);
    }
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out;
}
export function poly(ctx, pts, close = true) {
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  if (close) ctx.closePath();
}
export function inPoly(pts, x, y) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
export const bbox = (pts, pad = 0) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x = Math.min(...xs) - pad, y = Math.min(...ys) - pad;
  return { x, y, w: Math.max(...xs) + pad - x, h: Math.max(...ys) + pad - y };
};
/** 점열의 길이를 따라 t(0~1) 자리의 점과 방향 */
export function along(pts, t) {
  const seg = [0];
  for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = seg[seg.length - 1], d = clamp(t) * L;
  let i = 1;
  while (i < seg.length - 1 && seg[i] < d) i++;
  const f = (d - seg[i - 1]) / (seg[i] - seg[i - 1] || 1);
  const a = pts[i - 1], b = pts[i];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, ang, len: L };
}
/** 점열을 옆으로 d만큼 민 점열(왼쪽 +) */
export function offset(pts, d) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1;
    const dd = typeof d === "function" ? d(i / (pts.length - 1)) : d;
    return [p[0] + (ty / L) * dd, p[1] - (tx / L) * dd];
  });
}

// ── 덧그림 캔버스 ──────────────────────────────────────────────────
export const layer = (t) => P.canvas(t.w, t.h, t.dpr);
export function put(t, L, alpha = 1, op = "source-over") {
  const c = t.ctx;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = alpha;
  c.globalCompositeOperation = op;
  c.drawImage(L.c, 0, 0);
  c.restore();
}

// ── 흐림(세 번 상자 흐림 ≈ 가우스) ───────────────────────────────────
function boxH(src, dst, W, H, r) {
  const inv = 1 / (2 * r + 1);
  for (let y = 0; y < H; y++) {
    const o = y * W;
    let acc = 0;
    for (let x = -r; x <= r; x++) if (x >= 0 && x < W) acc += src[o + x];
    for (let x = 0; x < W; x++) {
      dst[o + x] = acc * inv;
      const xo = x - r, xi = x + r + 1;
      if (xo >= 0) acc -= src[o + xo];
      if (xi < W) acc += src[o + xi];
    }
  }
}
function boxV(src, dst, W, H, r) {
  const inv = 1 / (2 * r + 1);
  for (let x = 0; x < W; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) if (y >= 0 && y < H) acc += src[y * W + x];
    for (let y = 0; y < H; y++) {
      dst[y * W + x] = acc * inv;
      const yo = y - r, yi = y + r + 1;
      if (yo >= 0) acc -= src[yo * W + x];
      if (yi < H) acc += src[yi * W + x];
    }
  }
}
export function blur3(src, W, H, r) {
  const a = Float32Array.from(src), b = new Float32Array(W * H);
  for (let k = 0; k < 3; k++) {
    boxH(a, b, W, H, r);
    boxV(b, a, W, H, r);
  }
  return a;
}

/** 말랑한 덩어리. path(ctx)로 모양을 주면(채우기 규칙 nonzero) 가림막을 흐려 높이로 삼고 화소마다 빛을 셈한다.
 *  o.color 바탕색, o.dark 그늘색, o.light 빛 받는 색, o.blur 둥글기(px), o.relief 볼록함,
 *  o.cut(ctx) 홈(틈새)을 긋는 선(stroke까지 직접), o.cutDepth, o.tex(x, y, h, n) → 곱할 수 또는 [r,g,b] 곱,
 *  o.alpha 속 불투명도, o.edgeAlpha 가장자리 불투명도(막처럼 비치게), o.spec, o.gloss, o.rim, o.bounce,
 *  o.op 합성 방식. 돌려주는 값: { h(x, y) } 높이 표본 */
export function pillow(t, box, path, o = {}) {
  const dpr = t.dpr;
  const x0 = Math.floor(box.x) - 2, y0 = Math.floor(box.y) - 2;
  const x1 = Math.ceil(box.x + box.w) + 2, y1 = Math.ceil(box.y + box.h) + 2;
  const W = Math.round((x1 - x0) * dpr), H = Math.round((y1 - y0) * dpr);
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d", { willReadFrequently: true });
  c.setTransform(dpr, 0, 0, dpr, -x0 * dpr, -y0 * dpr);
  c.fillStyle = "#fff";
  c.beginPath();
  path(c);
  c.fill(o.rule ?? "nonzero");
  const cov = c.getImageData(0, 0, W, H).data;
  const N = W * H;
  const cover = new Float32Array(N);
  for (let i = 0; i < N; i++) cover[i] = cov[i * 4 + 3] / 255;
  let hm = Float32Array.from(cover);
  if (o.cut) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    c.setTransform(dpr, 0, 0, dpr, -x0 * dpr, -y0 * dpr);
    c.strokeStyle = "#fff";
    c.fillStyle = "#fff";
    c.lineCap = "round";
    c.lineJoin = "round";
    o.cut(c);
    const cd = c.getImageData(0, 0, W, H).data;
    const dep = o.cutDepth ?? 1;
    for (let i = 0; i < N; i++) hm[i] *= 1 - (cd[i * 4 + 3] / 255) * dep;
  }
  const blur = o.blur ?? 6;
  hm = blur3(hm, W, H, Math.max(1, Math.round(blur * dpr * 0.62)));
  const K = (o.relief ?? 1) * 5.2 * blur;
  const L = o.light3 ?? P.LIGHT;
  const Hh = P.norm3([L[0], L[1], L[2] + 1]);
  const base = P.lin(P.hex(o.color ?? "#E9A0A6"));
  const dark = o.dark ? P.lin(P.hex(o.dark)) : base.map((v) => v * 0.32);
  const lite = o.light ? P.lin(P.hex(o.light)) : P.mixc(base, [1, 1, 1], 0.42);
  const bounce = P.lin(P.hex(o.bounce ?? "#B9C8DE"));
  const spec = o.spec ?? 0.25, gloss = o.gloss ?? 26, rim = o.rim ?? 0.18, wrap = o.wrap ?? 0.3;
  const a0 = o.alpha ?? 1, a1 = o.edgeAlpha ?? a0;
  const out = c.createImageData(W, H);
  const d = out.data;
  for (let j = 1; j < H - 1; j++) {
    const y = y0 + (j + 0.5) / dpr;
    for (let i = 1; i < W - 1; i++) {
      const k = j * W + i;
      const a = cover[k];
      if (a <= 0.002) continue;
      const x = x0 + (i + 0.5) / dpr;
      const gx = (hm[k + 1] - hm[k - 1]) * 0.5 * dpr, gy = (hm[k + W] - hm[k - W]) * 0.5 * dpr;
      let nx = -K * gx, ny = -K * gy, nz = 1;
      const nl = Math.hypot(nx, ny, nz);
      nx /= nl;
      ny /= nl;
      nz /= nl;
      const ndl = nx * L[0] + ny * L[1] + nz * L[2];
      const diff = clamp((ndl + wrap) / (1 + wrap));
      let col = diff < 0.55 ? P.mixc(dark, base, diff / 0.55) : P.mixc(base, lite, (diff - 0.55) / 0.45);
      if (o.tex) {
        const m = o.tex(x, y, hm[k], nz);
        if (Array.isArray(m)) col = [col[0] * m[0], col[1] * m[1], col[2] * m[2]];
        else col = [col[0] * m, col[1] * m, col[2] * m];
      }
      const ndh = Math.max(0, nx * Hh[0] + ny * Hh[1] + nz * Hh[2]);
      const sp = spec * Math.pow(ndh, gloss);
      const fres = Math.pow(1 - nz, 2.2);
      const low = clamp(ny * 0.9 + 0.1) * (1 - diff);
      const r = [0, 1, 2].map((q) => col[q] + bounce[q] * (low * 0.12 + rim * fres * 0.5) + sp);
      const s = P.srgb(r);
      const alpha = a * (a0 + (a1 - a0) * Math.pow(1 - nz, 1.4)) * (o.alphaFn ? o.alphaFn(x, y, hm[k]) : 1);
      const q = k * 4;
      d[q] = s[0];
      d[q + 1] = s[1];
      d[q + 2] = s[2];
      d[q + 3] = 255 * clamp(alpha);
    }
  }
  c.putImageData(out, 0, 0);
  const ctx = t.ctx;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = o.op ?? "source-over";
  ctx.globalAlpha = o.layerAlpha ?? 1;
  ctx.drawImage(cv, x0 * dpr, y0 * dpr);
  ctx.restore();
  return {
    h: (x, y) => {
      const i = Math.round((x - x0) * dpr - 0.5), j = Math.round((y - y0) * dpr - 0.5);
      if (i < 0 || j < 0 || i >= W || j >= H) return 0;
      return hm[j * W + i];
    },
  };
}

/** 관(굵기 있는 선)을 겹 선으로 그린다. segs = [{ pts, w }]. 같은 무리는 한 판에 겹쳐서 이음매가 보이지 않는다.
 *  st = { edge, base, mid, hi, edgeW, alpha, hiA } */
export function tubes(t, segs, st) {
  const L = layer(t);
  const c = L.ctx;
  c.lineCap = "round";
  c.lineJoin = "round";
  const pass = (fw, col, off, a = 1) => {
    c.globalAlpha = a;
    c.strokeStyle = col;
    for (const s of segs) {
      const w = fw(s.w);
      if (w <= 0.05) continue;
      c.lineWidth = w;
      const dd = off(s.w);
      c.beginPath();
      s.pts.forEach((p, i) => (i ? c.lineTo(p[0] + dd, p[1] + dd) : c.moveTo(p[0] + dd, p[1] + dd)));
      c.stroke();
    }
    c.globalAlpha = 1;
  };
  pass((w) => w + (st.edgeW ?? 1.1), st.edge, () => 0);
  pass((w) => w, st.base, () => 0);
  c.globalCompositeOperation = "source-atop";
  if (st.shadow) pass((w) => w * 0.55, st.shadow, (w) => w * 0.2, st.shadowA ?? 0.55);
  pass((w) => w * 0.6, st.mid, (w) => -w * 0.11);
  pass((w) => w * 0.24, st.hi, (w) => -w * 0.22, st.hiA ?? 0.85);
  c.globalCompositeOperation = "source-over";
  put(t, L, st.alpha ?? 1);
  return L;
}
/** 가지 하나를 굵기가 점점 줄도록 잘게 나눈 마디들로 */
export function taper(pts, w0, w1, n = 6) {
  const dense = pts.length > 2 ? pts : spline(pts, false, 1);
  const out = [];
  const total = along(dense, 1).len;
  for (let k = 0; k < n; k++) {
    const ta = k / n, tb = (k + 1) / n;
    const seg = [];
    for (let q = 0; q <= 4; q++) {
      const p = along(dense, ta + ((tb - ta) * q) / 4);
      seg.push([p.x, p.y]);
    }
    out.push({ pts: seg, w: w0 + (w1 - w0) * ((ta + tb) / 2) });
  }
  void total;
  return out;
}

// ── 작은 입체 ──────────────────────────────────────────────────────
function lit(base, nx, ny, nz, o) {
  const L = P.LIGHT;
  const H = P.norm3([L[0], L[1], L[2] + 1]);
  const wrap = o.wrap ?? 0.35;
  const ndl = nx * L[0] + ny * L[1] + nz * L[2];
  const diff = clamp((ndl + wrap) / (1 + wrap));
  const ndh = Math.max(0, nx * H[0] + ny * H[1] + nz * H[2]);
  const sp = (o.spec ?? 0.4) * Math.pow(ndh, o.gloss ?? 30);
  const fres = Math.pow(1 - nz, 3);
  const amb = o.ambient ?? 0.22;
  return [0, 1, 2].map((k) => base[k] * (amb + 0.55 * diff * diff + 0.35 * diff) + (o.rim ?? 0.15) * fres * base[k] + sp);
}
/** 캡슐(양 끝이 반구인 원기둥): 마이토콘드리아 같은 작은 알갱이 */
export function capsule(t, x0, y0, x1, y1, r, color, o = {}) {
  const base = P.lin(P.hex(color));
  const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
  const bx = Math.min(x0, x1) - r - 1, by = Math.min(y0, y1) - r - 1;
  P.shade(t, { x: bx, y: by, w: Math.abs(dx) + 2 * r + 2, h: Math.abs(dy) + 2 * r + 2 }, (x, y) => {
    let u = L2 ? ((x - x0) * dx + (y - y0) * dy) / L2 : 0;
    u = clamp(u);
    const cx = x0 + u * dx, cy = y0 + u * dy;
    const ex = (x - cx) / r, ey = (y - cy) / r;
    const d2 = ex * ex + ey * ey;
    const cov = clamp(r - Math.sqrt(d2) * r + 0.5);
    if (cov <= 0) return null;
    const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, d2)));
    const c = P.srgb(lit(base, ex, ey, nz, o));
    return [c[0], c[1], c[2], cov * (o.alpha ?? 1)];
  });
}
/** 반투명 공(막으로 된 주머니): 가장자리가 짙고 속이 비친다 */
export function bubble(t, cx, cy, r, color, o = {}) {
  const base = P.lin(P.hex(color));
  const a0 = o.alpha ?? 0.35, a1 = o.edgeAlpha ?? 0.95;
  P.shade(t, { x: cx - r - 1, y: cy - r - 1, w: 2 * r + 2, h: 2 * r + 2 }, (x, y) => {
    const ex = (x - cx) / r, ey = (y - cy) / r;
    const d2 = ex * ex + ey * ey;
    const cov = clamp(r - Math.sqrt(d2) * r + 0.5);
    if (cov <= 0) return null;
    const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, d2)));
    const c = P.srgb(lit(base, ex, ey, nz, o));
    return [c[0], c[1], c[2], cov * (a0 + (a1 - a0) * Math.pow(1 - nz, o.edgePow ?? 1.6))];
  });
}

// ── 확대 ────────────────────────────────────────────────────────────
/** 확대 원: 그림자, 안쪽(inner(ctx)), 흰 고리와 회색 선(시범 그림과 같은 결) */
export function zoomCircle(t, cx, cy, r, inner, o = {}) {
  const { ctx } = t;
  P.dropShadow(t, (c) => c.arc(cx, cy, r, 0, TAU), { dx: 2, dy: 5, blur: 12, a: 0.2 });
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.clip();
  ctx.fillStyle = P.rg(ctx, cx - r * 0.32, cy - r * 0.4, r * 0.06, cx, cy, r, o.bg ?? [[0, "#FFFFFF"], [1, "#EDF0F5"]]);
  ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  inner(ctx);
  ctx.restore();
  ring(ctx, cx, cy, r);
}
export function ring(ctx, cx, cy, r) {
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "#A9B3C1";
  ctx.beginPath();
  ctx.arc(cx, cy, r + 2.4, 0, TAU);
  ctx.stroke();
  ctx.restore();
}
/** 확대 통로: 작은 원 a에서 큰 원 b로 바깥 접선 두 줄(점선)과 옅은 면. 큰 원을 그리기 전에 부른다. */
export function zoomWedge(t, a, b, o = {}) {
  const { ctx } = t;
  const d = Math.hypot(b.x - a.x, b.y - a.y), th = Math.atan2(b.y - a.y, b.x - a.x);
  const phi = Math.acos(clamp(-(b.r - a.r) / d, -1, 1));
  const pt = (c, ang) => [c.x + c.r * Math.cos(ang), c.y + c.r * Math.sin(ang)];
  const A1 = pt(a, th + phi), B1 = pt(b, th + phi), A2 = pt(a, th - phi), B2 = pt(b, th - phi);
  ctx.save();
  ctx.fillStyle = P.lg(ctx, a.x, a.y, b.x, b.y, [[0, o.c0 ?? "rgba(120,135,160,.20)"], [1, o.c1 ?? "rgba(120,135,160,.06)"]]);
  ctx.beginPath();
  poly(ctx, [A1, B1, B2, A2]);
  ctx.fill();
  ctx.strokeStyle = o.line ?? "rgba(110,125,150,.6)";
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(A1[0], A1[1]);
  ctx.lineTo(B1[0], B1[1]);
  ctx.moveTo(A2[0], A2[1]);
  ctx.lineTo(B2[0], B2[1]);
  ctx.stroke();
  ctx.restore();
}
/** 확대할 자리를 짚는 작은 원(흰 테 + 진한 선) */
export function marker(ctx, x, y, r, color = "#3D4A5C") {
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,.95)";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

// ── 몸 ──────────────────────────────────────────────────────────────
/** 앞에서 본 몸(머리, 목, 팔 없는 몸통)의 윤곽. 단위 cm(정수리 가운데가 0,0, 아래가 +), s = px/cm, (cx, top) 자리.
 *  성별이 드러나지 않는 매끈한 실루엣. 돌려주는 값: { head, body } 점열(px) */
export function frontBody(cx, top, s, o = {}) {
  const X = (u) => cx + u * s, Y = (v) => top + v * s;
  const headHalf = [
    [0, 0], [3.9, 0.45], [6.3, 2.2], [7.45, 5.6], [7.7, 9.6], [7.45, 13.2], [6.6, 16.6], [5.1, 19.4], [2.9, 21.4], [0, 22.1],
  ];
  const mirror = (half) => {
    const right = half.map(([u, v]) => [X(u), Y(v)]);
    const left = half.slice(1, -1).reverse().map(([u, v]) => [X(-u), Y(v)]);
    return [...right, ...left];
  };
  const head = spline(mirror(headHalf), true, 8);
  const bottom = o.bottom ?? 64;
  const bodyHalf = [
    [0, 16], [4.9, 16.8], [5.3, 22], [5.6, 26.5], [7.6, 29.3], [12.6, 30.8], [16.4, 32.1], [18.2, 34.0], [18.6, 37.2], [17.7, 41.0], [16.3, 44.6],
    [15.9, 49.5], [15.4, 55.5], [14.4, 61], [14.0, 66], [14.6, 71], [16.2, 77], [16.8, 82], [16.6, 88],
  ];
  const half = [];
  for (let i = 0; i < bodyHalf.length; i++) {
    const [u, v] = bodyHalf[i];
    if (v < bottom) half.push([u, v]);
    else {
      const [pu, pv] = bodyHalf[i - 1];
      const f = (bottom - pv) / (v - pv);
      half.push([pu + (u - pu) * f, bottom]);
      break;
    }
  }
  const right = half.map(([u, v]) => [X(u), Y(v)]);
  const left = half.slice(1).reverse().map(([u, v]) => [X(-u), Y(v)]);
  const body = spline([...right, [X(0), Y(bottom)], ...left], true, 8);
  return { head, body, X, Y };
}
/** 귀: 머리 옆 작은 볼록 */
export function ears(cx, top, s) {
  const X = (u) => cx + u * s, Y = (v) => top + v * s;
  const one = (sg) => spline([[X(sg * 7.3), Y(9.2)], [X(sg * 8.3), Y(9.6)], [X(sg * 8.6), Y(11.6)], [X(sg * 8.2), Y(14.2)], [X(sg * 7.4), Y(15.2)]], true, 6);
  return [one(1), one(-1)];
}

// ── 가슴 뼈대(앞에서 본 모습) ───────────────────────────────────────
/** 갈비뼈 마디 값. 단위 cm, 목 아래 패인 곳(복장뼈 위 끝)이 (0, 0), 아래가 +, 바깥이 +.
 *  yp 등뼈와 만나는 높이, W 가장 바깥 반폭, yl 그 높이, xa 앞 끝(연골이 시작하는 곳) 반폭, ya 그 높이,
 *  ys 연골이 복장뼈에 닿는 높이(8~10번은 위 갈비뼈의 연골에 붙고, 11·12번은 떠 있다). 어른 몸의 평균 비례. */
export const RIBS = [
  { k: 1, yp: -3.4, W: 6.2, yl: -1.7, xa: 3.6, ya: 1.0, ys: 1.5 },
  { k: 2, yp: -1.2, W: 9.2, yl: 1.0, xa: 5.3, ya: 4.4, ys: 4.7 },
  { k: 3, yp: 1.0, W: 11.2, yl: 3.6, xa: 6.4, ya: 7.3, ys: 7.3 },
  { k: 4, yp: 3.2, W: 12.6, yl: 6.2, xa: 7.2, ya: 9.9, ys: 9.6 },
  { k: 5, yp: 5.4, W: 13.6, yl: 8.7, xa: 7.8, ya: 12.4, ys: 11.7 },
  { k: 6, yp: 7.6, W: 14.2, yl: 11.2, xa: 8.4, ya: 14.9, ys: 13.6 },
  { k: 7, yp: 9.8, W: 14.5, yl: 13.7, xa: 9.0, ya: 17.4, ys: 15.2 },
  { k: 8, yp: 12.0, W: 14.5, yl: 16.2, xa: 10.2, ya: 19.9, join: 7 },
  { k: 9, yp: 14.2, W: 14.2, yl: 18.7, xa: 11.0, ya: 22.1, join: 8 },
  { k: 10, yp: 16.4, W: 13.8, yl: 21.1, xa: 11.8, ya: 24.0, join: 9 },
  { k: 11, yp: 18.6, W: 12.6, yl: 23.0, xa: 11.4, ya: 25.4, float: true },
  { k: 12, yp: 20.8, W: 10.2, yl: 24.2, xa: 8.8, ya: 25.2, float: true },
];
/** 숨 상태에 따라 갈비뼈를 바꾼다. f = 0 날숨(쉬는 자리), 1 깊은 들숨: 앞 끝이 올라가고(위로) 옆이 벌어진다(바깥으로). */
export function ribAt(r, f = 0) {
  const up = 0.2 * f, out = (r.k >= 3 ? 0.075 : 0.03) * f;
  return {
    ...r,
    W: r.W * (1 + out),
    yl: r.yl - (r.yl - r.yp) * up * 0.7,
    xa: r.xa * (1 + out * 0.8),
    ya: r.ya - (r.ya - r.yp) * up,
    ys: r.ys !== undefined ? r.ys - (r.ys - r.yp) * up * 0.85 : undefined,
  };
}
/** 갈비뼈 하나의 뒤쪽 활(등뼈에서 옆까지)과 앞쪽 활(옆에서 앞 끝까지), 연골(앞 끝에서 복장뼈까지). side = −1(그림 왼쪽) 또는 1. 단위 cm. */
export function ribParts(r, side, all) {
  const sx = (u) => side * u;
  const back = spline([[sx(1.7), r.yp], [sx(r.W * 0.5), r.yp + (r.yl - r.yp) * 0.18], [sx(r.W * 0.86), r.yp + (r.yl - r.yp) * 0.55], [sx(r.W), r.yl]], false, 8);
  const front = spline([[sx(r.W), r.yl], [sx(r.W * 0.95 + r.xa * 0.05), r.yl + (r.ya - r.yl) * 0.4], [sx(r.xa + (r.W - r.xa) * 0.42), r.yl + (r.ya - r.yl) * 0.8], [sx(r.xa), r.ya]], false, 8);
  let cart = null;
  if (r.ys !== undefined) {
    const sw = 1.6; // 복장뼈 반폭
    const mx = r.xa * 0.45 + sw * 0.55;
    const my = r.k >= 6 ? r.ya + (r.ys - r.ya) * 0.15 + 0.5 : r.ya + (r.ys - r.ya) * 0.6;
    cart = spline([[sx(r.xa), r.ya], [sx(mx), my], [sx(sw), r.ys]], false, 8);
  } else if (r.join) {
    // 위 갈비뼈의 연골에 붙는다(갈비 활)
    const up = all.find((q) => q.k === r.join);
    const tx = up.xa * 0.62 + 0.6, ty = up.ya + 1.1 + (r.k - 8) * 0.4;
    cart = spline([[sx(r.xa), r.ya], [sx((r.xa + tx) / 2), (r.ya + ty) / 2 + 0.7], [sx(tx), ty]], false, 8);
  }
  return { back, front, cart };
}

// ── 호흡계 부품(앞에서 본 모습) ────────────────────────────────────
/** 머리 속 공기 길: 목구멍(비쳐 보이게), 후두, 코안(가운데 칸막이와 선반 주름), 바깥 코의 빛과 그늘, 입.
 *  hx 얼굴 가운데 x, top 정수리 y, s = px/cm. 크기는 5 px/cm에서 정한 값을 비례로 줄인다. */
export function headAirway(t, hx, top, s) {
  const k = s / 5, ctx = t.ctx;
  const hy = (cm) => top + cm * s;
  const sp = (pts, per = 6) => spline(pts.map(([dx, cm]) => [hx + dx * k, hy(cm)]), true, per);
  const ph = sp([[-7.4, 11.6], [7.4, 11.6], [8.2, 16], [7.6, 21.5], [6.6, 24.6], [-6.6, 24.6], [-7.6, 21.5], [-8.2, 16]]);
  pillow(t, bbox(ph), (c) => poly(c, ph), { color: "#E4959A", light: "#FBCDCB", dark: "#B4606B", blur: 4 * k, relief: 0.6, alpha: 0.42, edgeAlpha: 0.7, spec: 0.1 });
  const lx = sp([[0, 24.6], [4.2, 24.1], [7.2, 24.7], [6.6, 27.0], [5.0, 28.6], [0, 29.0], [-5.0, 28.6], [-6.6, 27.0], [-7.2, 24.7], [-4.2, 24.1]]);
  pillow(t, bbox(lx), (c) => poly(c, lx), { color: "#E8C3BF", light: "#FBE9E6", dark: "#B07F80", blur: 2.6 * k, spec: 0.2, alpha: 0.82 });
  ctx.save();
  ctx.strokeStyle = "rgba(170,120,112,.6)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(hx - 6.6 * k, hy(27.4));
  ctx.quadraticCurveTo(hx, hy(28.2), hx + 6.6 * k, hy(27.4));
  ctx.stroke();
  ctx.restore();
  const cav = sp([[0, 9.9], [3.6, 10.8], [7.4, 13.2], [9.2, 15.6], [7.6, 16.9], [2.4, 16.7], [0, 16.2], [-2.4, 16.7], [-7.6, 16.9], [-9.2, 15.6], [-7.4, 13.2], [-3.6, 10.8]], 8);
  pillow(t, bbox(cav), (c) => poly(c, cav), {
    color: "#E27F86", light: "#FFC4C2", dark: "#A3414F", blur: 2.6 * k, relief: 0.8, alpha: 0.78, edgeAlpha: 0.92, spec: 0.22,
    cut: (c) => {
      c.lineWidth = 1.4 * k;
      c.beginPath();
      c.moveTo(hx, hy(10.6));
      c.lineTo(hx, hy(16.4));
      c.stroke();
    },
  });
  ctx.save();
  ctx.strokeStyle = "rgba(255,214,214,.7)";
  ctx.lineWidth = 0.9 * Math.max(0.8, k);
  ctx.lineCap = "round";
  for (const sd of [-1, 1])
    for (const [v, ww] of [[12.4, 4.2], [13.9, 6.0], [15.3, 7.0]]) {
      ctx.beginPath();
      ctx.moveTo(hx + sd * 1.6 * k, hy(v) - 1 * k);
      ctx.quadraticCurveTo(hx + sd * ww * 0.6 * k, hy(v) + 1.6 * k, hx + sd * ww * k, hy(v) + 0.4 * k);
      ctx.stroke();
    }
  ctx.fillStyle = P.lg(ctx, hx - 6 * k, 0, hx + 7 * k, 0, [[0, "rgba(255,255,255,0)"], [0.35, "rgba(255,255,255,.42)"], [0.55, "rgba(255,255,255,0)"], [0.8, "rgba(150,80,60,.16)"], [1, "rgba(150,80,60,0)"]]);
  ctx.beginPath();
  poly(ctx, sp([[-1.8, 9.6], [1.8, 9.6], [3.2, 13.6], [6.4, 16.2], [0, 17.1], [-6.4, 16.2], [-3.2, 13.6]]));
  ctx.fill();
  for (const sd of [-1, 1]) {
    ctx.fillStyle = "rgba(110,45,45,.62)";
    ctx.beginPath();
    ctx.ellipse(hx + sd * 2.9 * k, hy(16.75), 1.9 * k, 0.9 * k, sd * 0.28, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,.5)";
  ctx.beginPath();
  ctx.ellipse(hx - 0.8 * k, hy(15.6), 1.6 * k, 1.1 * k, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(170,100,90,.42)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(hx - 9 * k, hy(18.7));
  ctx.quadraticCurveTo(hx, hy(19.2), hx + 9 * k, hy(18.7));
  ctx.stroke();
  ctx.restore();
}

/** 숨관: 지름 2 cm, 연골 고리가 층층이(n개). X(u), Y(v)는 가슴 좌표(cm) → px. v0 위 끝, v1 갈림목 */
export function trachea(t, X, Y, s, v0 = -4.5, v1 = 5.6, n = 18) {
  const x0 = X(-1.0), x1 = X(1.0), y0 = Y(v0), y1 = Y(v1);
  const ringH = (v1 - v0 - 0.1) / n;
  P.shade(t, { x: x0 - 1, y: y0, w: x1 - x0 + 2, h: y1 - y0 }, (x, y) => {
    const u = (x - (x0 + x1) / 2) / ((x1 - x0) / 2);
    if (Math.abs(u) > 1.04) return null;
    const cov = clamp((1.04 - Math.abs(u)) * 12);
    const nzz = Math.sqrt(Math.max(0, 1 - Math.min(1, u * u)));
    const vy = (y - y0) / s;
    const vEnd = v1 - v0 - 0.1;
    if (vy > vEnd && Math.hypot(u, (vy - vEnd) / 0.6) > 1.05) return null;
    const ph = ((vy / ringH) % 1 + 1) % 1;
    const ringOn = ph < 0.62;
    const edge = Math.min(ph, 0.62 - ph);
    const base = ringOn ? [247, 238, 232] : [222, 168, 166];
    const ndl = u * -0.52 + nzz * 0.56 + 0.3;
    const kk = 0.55 + 0.55 * clamp(ndl) + (ringOn ? 0.06 * Math.sin((ph / 0.62) * Math.PI) : -0.08);
    const dim = ringOn && edge < 0.07 ? 0.86 : 1;
    return [base[0] * kk * dim, base[1] * kk * dim, base[2] * kk * dim, cov];
  });
}
/** 숨관가지 위의 연골 고리 줄 */
export function bronchusRings(ctx, segs, col = "rgba(196,140,140,.55)") {
  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineWidth = 0.75;
  for (const b of segs) {
    for (let q = 0.2; q < 0.95; q += 0.17) {
      const p = along(b.pts, q);
      const nx = -Math.sin(p.ang), ny = Math.cos(p.ang), hw = b.w * 0.42;
      ctx.beginPath();
      ctx.moveTo(p.x - nx * hw, p.y - ny * hw);
      ctx.quadraticCurveTo(p.x + Math.cos(p.ang) * 0.8, p.y + Math.sin(p.ang) * 0.8, p.x + nx * hw, p.y + ny * hw);
      ctx.stroke();
    }
  }
  ctx.restore();
}
export const AIR_TUBE = { edge: "#B98686", base: "#F1D6D3", mid: "#FBEDEA", hi: "#FFFFFF", edgeW: 1.1 };
export const BONE = { edge: "#A8957A", base: "#F2EADB", mid: "#FBF7F0", hi: "#FFFFFF", edgeW: 1.0 };
export const CART = { edge: "#93A8BA", base: "#DCE7EF", mid: "#EEF4F8", hi: "#FFFFFF", edgeW: 0.9 };
