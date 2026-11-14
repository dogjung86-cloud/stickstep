// 캔버스 그리기 도구: 고해상도 캔버스, 색 계산(선형 공간), 화소 단위 음영, 입체 구, 부드러운 그림자, 질감.
// 빛은 언제나 왼쪽 위에서 온다(LIGHT). 모든 함수는 CSS px 좌표를 받고, 화소 밀도는 캔버스가 안다.

export const LIGHT = norm3([-0.52, -0.64, 0.56]);

export function norm3(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// ── 색 ─────────────────────────────────────────────────────────────
export function hex(h) {
  const s = h.replace("#", "");
  const n = parseInt(s.length === 3 ? s.split("").map((c) => c + c).join("") : s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const toLin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const toSrgb = (c) => {
  c = clamp(c);
  return 255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
};
/** sRGB 0~255 → 선형 0~1 */
export const lin = (rgb) => [toLin(rgb[0]), toLin(rgb[1]), toLin(rgb[2])];
/** 선형 0~1 → sRGB 0~255 */
export const srgb = (l) => [toSrgb(l[0]), toSrgb(l[1]), toSrgb(l[2])];
export const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const css = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
/** hex 색을 t만큼 밝게(+)·어둡게(−). 선형 공간에서 흰색·검정과 섞는다. */
export function tone(h, t) {
  const l = lin(typeof h === "string" ? hex(h) : h);
  const m = t >= 0 ? mixc(l, [1, 1, 1], t) : mixc(l, [0, 0, 0], -t);
  return css(srgb(m));
}

// ── 캔버스 ──────────────────────────────────────────────────────────
export function canvas(w, h, dpr = window.devicePixelRatio || 1) {
  const c = document.createElement("canvas");
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  c.style.width = w + "px";
  c.style.height = h + "px";
  const ctx = c.getContext("2d", { willReadFrequently: false });
  ctx.scale(dpr, dpr);
  return { c, ctx, w, h, dpr };
}

/** 화소 단위 음영. 영역(CSS px) 안 화소마다 fn(x, y)를 불러 [r,g,b,a](sRGB 0~255, a 0~1) 또는 null을 받는다.
 *  mask(ctx)를 주면 그 경로 안쪽(가장자리 부드럽게)만 칠한다. 결과를 대상 캔버스에 겹쳐 그린다. */
export function shade(target, region, fn, { mask, op = "source-over", alpha = 1 } = {}) {
  const { dpr } = target;
  const x0 = Math.floor(region.x), y0 = Math.floor(region.y);
  const w = Math.ceil(region.w + (region.x - x0)), h = Math.ceil(region.h + (region.y - y0));
  const W = Math.round(w * dpr), H = Math.round(h * dpr);
  const off = document.createElement("canvas");
  off.width = W;
  off.height = H;
  const octx = off.getContext("2d", { willReadFrequently: true });
  const img = octx.createImageData(W, H);
  const d = img.data;
  for (let j = 0; j < H; j++) {
    const y = y0 + (j + 0.5) / dpr;
    for (let i = 0; i < W; i++) {
      const x = x0 + (i + 0.5) / dpr;
      const v = fn(x, y);
      if (!v) continue;
      const k = (j * W + i) * 4;
      d[k] = v[0];
      d[k + 1] = v[1];
      d[k + 2] = v[2];
      d[k + 3] = 255 * clamp(v[3] ?? 1);
    }
  }
  octx.putImageData(img, 0, 0);
  if (mask) {
    const m = document.createElement("canvas");
    m.width = W;
    m.height = H;
    const mctx = m.getContext("2d");
    mctx.setTransform(dpr, 0, 0, dpr, -x0 * dpr, -y0 * dpr);
    mctx.fillStyle = "#000";
    mctx.beginPath();
    mask(mctx);
    mctx.fill();
    octx.globalCompositeOperation = "destination-in";
    octx.drawImage(m, 0, 0);
  }
  const ctx = target.ctx;
  ctx.save();
  ctx.globalCompositeOperation = op;
  ctx.globalAlpha = alpha;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(off, x0 * dpr, y0 * dpr);
  ctx.restore();
}

/** 입체 구(원자, 이온, 입자). 선형 공간에서 감싼 확산광 + 블린 퐁 반사 + 가장자리 산란 + 아래 반사광.
 *  o: { spec 0~1, gloss(반짝임 지수), rim, sss(속살 비침), bounce(아래 반사광 색 hex), ao } */
export function sphere(target, cx, cy, r, color, o = {}) {
  const base = lin(hex(color));
  const spec = o.spec ?? 0.55, gloss = o.gloss ?? 38, rim = o.rim ?? 0.22, wrap = o.wrap ?? 0.35;
  const bounce = lin(hex(o.bounce ?? "#9DB7D9"));
  const amb = o.ambient ?? 0.2;
  const L = o.light ? norm3(o.light) : LIGHT;
  const H = norm3([L[0], L[1], L[2] + 1]);
  shade(target, { x: cx - r - 1, y: cy - r - 1, w: 2 * r + 2, h: 2 * r + 2 }, (x, y) => {
    const dx = (x - cx) / r, dy = (y - cy) / r;
    const dd = dx * dx + dy * dy;
    const dist = Math.sqrt(dd) * r;
    const cov = clamp(r - dist + 0.5);
    if (cov <= 0) return null;
    const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, dd)));
    const ndl = dx * L[0] + dy * L[1] + nz * L[2];
    const diff = clamp((ndl + wrap) / (1 + wrap));
    const ndh = clamp(dx * H[0] + dy * H[1] + nz * H[2]);
    const sp = spec * Math.pow(ndh, gloss);
    const fres = Math.pow(1 - nz, 3);
    const low = clamp(dy * 0.8 + 0.2) * (1 - diff); // 아래쪽 그늘에 반사광
    const out = [0, 1, 2].map((k) =>
      base[k] * (amb + 0.95 * diff * diff * 0.6 + 0.4 * diff) + bounce[k] * low * 0.16 + rim * fres * (0.55 * base[k] + 0.45 * bounce[k]) + sp,
    );
    const c = srgb(out);
    return [c[0], c[1], c[2], cov];
  });
}

/** 부드러운 타원 그림자(접촉 그림자). */
export function softShadow(target, cx, cy, rx, ry, a = 0.22, color = "#22314F") {
  const { ctx } = target;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  const c = hex(color);
  g.addColorStop(0, css(c, a));
  g.addColorStop(0.55, css(c, a * 0.55));
  g.addColorStop(1, css(c, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 경로를 흐린 그림자로 떨어뜨린다(물체 아래 깔리는 그림자). path(ctx)로 모양을 준다. */
export function dropShadow(target, path, { dx = 3, dy = 5, blur = 8, a = 0.25, color = "#1C2A44" } = {}) {
  const { ctx } = target;
  ctx.save();
  ctx.shadowColor = css(hex(color), a);
  ctx.shadowBlur = blur * target.dpr;
  ctx.shadowOffsetX = dx * target.dpr;
  ctx.shadowOffsetY = dy * target.dpr;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  path(ctx);
  ctx.fill();
  ctx.restore();
}

/** 선형 그라데이션 헬퍼: stops = [[0,"#fff"],[1,"#000"]] */
export function lg(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [t, c] of stops) g.addColorStop(t, c);
  return g;
}
export function rg(ctx, x0, y0, r0, x1, y1, r1, stops) {
  const g = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  for (const [t, c] of stops) g.addColorStop(t, c);
  return g;
}

/** 둥근 사각형 경로 */
export function rrect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** 판(그림 바탕): 아주 옅은 세로 그라데이션 + 종이 결. 그림이 카드 위에 떠 보이지 않게 연하게 둔다. */
export function plate(target, noise, { top = "#FBFCFD", bottom = "#EEF2F6", grain = 0.018 } = {}) {
  const { ctx, w, h } = target;
  ctx.fillStyle = lg(ctx, 0, 0, 0, h, [[0, top], [1, bottom]]);
  ctx.fillRect(0, 0, w, h);
  if (grain > 0 && noise) {
    shade(target, { x: 0, y: 0, w, h }, (x, y) => {
      const n = noise.fbm(x * 0.9, y * 0.9, 2);
      const v = n > 0 ? 255 : 0;
      return [v, v, v, Math.abs(n) * grain * 3];
    });
  }
}
