// g2u2(지권의 변화) 그림들이 함께 쓰는 도우미: 단원 색, 화소 해시와 지터 격자 보로노이(광물 알갱이), 암석 질감 함수,
// 돋보기 원, 확대 깔때기, 깊이 눈금, 묶음 괄호. 빌드는 밑줄로 시작하는 이 파일을 그림으로 치지 않는다.
import * as P from "../../kit/paint.mjs";
import * as S from "../../kit/svg.mjs";

/** 단원 색. 지구 속 층은 LayerLab(earthLabs.ts COL), 암석 순환 다섯 자리는 CycleLab(rockLabs.ts NODE)과 같다. */
export const COL = {
  crust: "#9C7B58", mantle: "#E8743B", outer: "#FFB454", inner: "#FFE08A",
  ccrust: "#B38D66", // 대륙 지각(화강암질, 밝은 갈색)
  ocrust: "#5D5049", // 해양 지각(현무암질, 어두운 색)
  sedi: "#E2B85A", sed: "#C9A27A", ign: "#9AA5B1", met: "#B197FC", mag: "#FF7A45",
  sea0: "#9ED6F5", sea1: "#3E8DCF", land: "#9BC46A", rock: "#A08A70",
};

/** 정수 격자점 해시(0~1) */
export function hash2(i, j, s = 0) {
  let h = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** 지터 격자 보로노이: 크기 g(px) 칸마다 점 하나. d1·d2(가장 가까운 두 점까지 px), id(칸의 0~1 값), 점의 자리 px·py, 칸 번호 ci·cj */
export function vor(x, y, g, seed = 0, jit = 0.85) {
  const gx = x / g, gy = y / g;
  const ix = Math.floor(gx), iy = Math.floor(gy);
  let d1 = 1e9, d2 = 1e9, id = 0, px = 0, py = 0, ci = 0, cj = 0;
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const cx = ix + i, cy = iy + j;
      const ox = cx + 0.5 + (hash2(cx, cy, seed) - 0.5) * jit, oy = cy + 0.5 + (hash2(cx, cy, seed + 7) - 0.5) * jit;
      const d = Math.hypot(gx - ox, gy - oy);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = hash2(cx, cy, seed + 13);
        px = ox * g;
        py = oy * g;
        ci = cx;
        cj = cy;
      } else if (d < d2) d2 = d;
    }
  return { d1: d1 * g, d2: d2 * g, id, px, py, ci, cj };
}

const L = (h) => P.lin(P.hex(h));
export const linOf = L;

/** 암석 질감 색(선형 공간에서 계산해 sRGB로): 큰 얼룩(fbm) + 알갱이(보로노이) + 알갱이 경계 그늘 + 반점.
 *  o = { base, vari, freq, grain, grainAmp, edge, specks: [[hex, 확률]], speck, seed, band:[가로 주파수, 세로 주파수, 세기] } */
export function rockAt(nz, x, y, o) {
  const base = o._b ?? (o._b = L(o.base));
  const vari = o.vari ?? 0.1, freq = o.freq ?? 0.05;
  let f = 1 + vari * nz.fbm(x * freq + (o.seed ?? 0) * 3.1, y * freq, 3);
  if (o.band) f *= 1 + o.band[2] * nz.fbm(x * o.band[0] + 11, y * o.band[1] + 5, 2);
  const g = vor(x, y, o.grain ?? 1.8, o.seed ?? 1);
  f *= 1 + (o.grainAmp ?? 0.07) * (g.id - 0.5) * 2;
  const e = P.smooth(0, (o.grain ?? 1.8) * 0.28, g.d2 - g.d1);
  f *= 1 - (o.edge ?? 0.06) * (1 - e);
  let c = [base[0] * f, base[1] * f, base[2] * f];
  if (o.specks) {
    const sp = vor(x + 31.7, y + 17.3, o.speck ?? 2.2, (o.seed ?? 1) + 50);
    let acc = 0;
    for (const s of o.specks) {
      const lc = s._l ?? (s._l = L(s[0]));
      if (sp.id >= acc && sp.id < acc + s[1]) {
        const k = P.smooth((o.speck ?? 2.2) * 0.42, (o.speck ?? 2.2) * 0.18, sp.d1);
        c = P.mixc(c, lc, k * (s[2] ?? 0.85));
        break;
      }
      acc += s[1];
    }
  }
  return c;
}

/** 선형 색 배열을 sRGB [r,g,b,a]로 */
export const out = (c, a = 1) => {
  const s = P.srgb(c);
  return [s[0], s[1], s[2], a];
};

/** 돋보기 원(시범 그림과 같은 틀): 접촉 그림자, 안쪽 그리기(clip), 흰 고리와 회색 바깥 선, 유리 반사 */
export function lens(t, cx, cy, r, inner, o = {}) {
  const { ctx } = t;
  P.dropShadow(t, (c) => c.arc(cx, cy, r, 0, Math.PI * 2), { dx: 2, dy: 5, blur: 12, a: o.shadow ?? 0.22 });
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  inner(ctx);
  if (o.glass !== false) {
    // 유리의 옅은 반사(왼쪽 위)
    ctx.fillStyle = P.rg(ctx, cx - r * 0.55, cy - r * 0.6, 0, cx - r * 0.55, cy - r * 0.6, r * 0.9, [[0, "rgba(255,255,255,.22)"], [1, "rgba(255,255,255,0)"]]);
    ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  }
  ctx.restore();
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "#A9B3C1";
  ctx.beginPath();
  ctx.arc(cx, cy, r + 2.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** 확대 깔때기: 작은 자리(점 또는 상자)에서 큰 그림 쪽 두 점으로 옅은 면과 점선. 큰 그림보다 먼저(뒤에) 그린다. */
export function funnel(t, a, b, c, o = {}) {
  const { ctx } = t;
  const a2 = o.a2 ?? a;
  ctx.save();
  ctx.fillStyle = P.lg(ctx, a[0], a[1], (b[0] + c[0]) / 2, (b[1] + c[1]) / 2, [[0, "rgba(120,135,160,.24)"], [1, "rgba(120,135,160,.06)"]]);
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.lineTo(c[0], c[1]);
  ctx.lineTo(a2[0], a2[1]);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(120,135,160,.6)";
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.moveTo(a2[0], a2[1]);
  ctx.lineTo(c[0], c[1]);
  ctx.stroke();
  ctx.restore();
}

/** 깊이 눈금(SVG): x 자리의 세로선, 눈금 값 ticks(km), y0 = 0 km 자리, ppk = km당 px. 큰 눈금 major만 숫자. */
export function depthAxis(s, x, y0, ppk, ticks, o = {}) {
  const col = o.color ?? "#6B7684";
  const last = ticks[ticks.length - 1];
  S.el(s, "line", { x1: x, y1: y0, x2: x, y2: y0 + last * ppk, stroke: col, "stroke-width": 1.2 });
  for (const k of o.minor ?? []) S.el(s, "line", { x1: x, y1: y0 + k * ppk, x2: x + 3, y2: y0 + k * ppk, stroke: col, "stroke-width": 1 });
  for (const k of ticks) {
    const y = y0 + k * ppk;
    S.el(s, "line", { x1: x, y1: y, x2: x + 5.5, y2: y, stroke: col, "stroke-width": 1.3 });
    S.label(s, x + 8, y + 4.8, String(k), { size: 13.5, weight: 600, color: "#4E5968" });
  }
}

/** 세로 묶음 괄호(SVG): x, y0~y1, side = -1이면 괄호 등이 왼쪽(열린 쪽이 오른쪽) */
export function brace(s, x, y0, y1, side = -1, o = {}) {
  const w = (o.w ?? 7) * side;
  const ym = (y0 + y1) / 2;
  const q = Math.min(8, (y1 - y0) / 6);
  const d = `M${x - w * 0} ${y0} q${w} 0 ${w} ${q} V${ym - q} q0 ${q} ${w * 0.9} ${q} q${-w * 0.9} 0 ${-w * 0.9} ${q} V${y1 - q} q0 ${q} ${-w} ${q}`;
  S.el(s, "path", { d, fill: "none", stroke: "#fff", "stroke-width": (o.sw ?? 1.6) + 2.4, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.85 });
  S.el(s, "path", { d, fill: "none", stroke: o.color ?? "#3A4553", "stroke-width": o.sw ?? 1.6, "stroke-linecap": "round", "stroke-linejoin": "round" });
  return [x + w * 1.9, ym];
}

/** 점 배열 경로 */
export function path(ctx, pts, close = true) {
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  if (close) ctx.closePath();
}

/** 매끈한 곡선 경로(캣멀롬 → 베지어). 닫힌 고리면 close = true */
export function smoothPath(ctx, pts, close = true, k = 0.5) {
  const n = pts.length;
  const P0 = (i) => pts[close ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  ctx.moveTo(pts[0][0], pts[0][1]);
  const m = close ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const p0 = P0(i - 1), p1 = P0(i), p2 = P0(i + 1), p3 = P0(i + 2);
    ctx.bezierCurveTo(p1[0] + ((p2[0] - p0[0]) * k) / 3, p1[1] + ((p2[1] - p0[1]) * k) / 3, p2[0] - ((p3[0] - p1[0]) * k) / 3, p2[1] - ((p3[1] - p1[1]) * k) / 3, p2[0], p2[1]);
  }
  if (close) ctx.closePath();
}
