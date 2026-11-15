// Ⅰ 물질의 특성 그림의 공용 도우미: 입체 공 도장, 확대 원과 확대 통로, 유리 비커, 입자 채우기, 불꽃, 온도계, 곡선 화살표.
// 빛은 왼쪽 위. 좌표는 모두 CSS px(설계 폭 340). 그림 파일은 "./_lib.mjs"로 불러 쓴다.
import * as P from "/kit/paint.mjs";
import * as N from "/kit/noise.mjs";

/** 단원 입자 색(랩 g2u1Kit의 물 #4DABF7와 맞춤). Ⅰ단원 입자는 물질마다 한 덩이 공이다. */
export const COL = {
  water: "#4DABF7",
  sugar: "#FFD43B",
  co2: "#8E979F",
  o2: "#F0524F",
  n2: "#3B5BDB",
  ink: "#26303D",
};

// ── 입체 공(같은 크기와 색은 한 번 굽고 찍는다) ──────────────────────
const cache = new Map();
export function ballSprite(t, r, color, o = {}) {
  const key = [r, color, JSON.stringify(o), t.dpr].join("|");
  if (cache.has(key)) return cache.get(key);
  const pad = 2;
  const s = P.canvas(2 * r + 2 * pad, 2 * r + 2 * pad, t.dpr);
  P.sphere(s, r + pad, r + pad, r, color, { spec: 0.5, gloss: 30, rim: 0.2, wrap: 0.3, ...o });
  const spr = { c: s.c, r, pad };
  cache.set(key, spr);
  return spr;
}
/** 구운 공을 (x, y) 가운데에 찍는다. 화소 격자에 맞춰 흐림을 줄인다. */
export function stamp(t, spr, x, y, alpha = 1) {
  const { ctx, dpr } = t;
  const size = 2 * (spr.r + spr.pad);
  const sx = Math.round((x - spr.r - spr.pad) * dpr) / dpr, sy = Math.round((y - spr.r - spr.pad) * dpr) / dpr;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(spr.c, sx, sy, size, size);
  ctx.restore();
}
/** 공 아래 접촉 그늘(오른쪽 아래로 살짝 밀린 둥근 어둠) */
export function ao(t, x, y, r, a = 0.22, color = "30,40,60") {
  const { ctx } = t;
  const ox = x + r * 0.14, oy = y + r * 0.2, R = r * 1.32;
  ctx.fillStyle = P.rg(ctx, ox, oy, r * 0.7, ox, oy, R, [[0, `rgba(${color},${a})`], [1, `rgba(${color},0)`]]);
  ctx.beginPath();
  ctx.arc(ox, oy, R, 0, Math.PI * 2);
  ctx.fill();
}

// ── 확대 원 ─────────────────────────────────────────────────────────
/** 확대 원: 그림자, 원 안 바탕(bg 두 색), inner(ctx)로 속을 그린 뒤 흰 고리와 회색 선. */
export function lens(t, cx, cy, r, inner, { bg = ["#FFFFFF", "#E9EDF2"], shadow = true } = {}) {
  const { ctx } = t;
  if (shadow) P.dropShadow(t, (c) => c.arc(cx, cy, r, 0, Math.PI * 2), { dx: 2, dy: 5, blur: 12, a: 0.2 });
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = P.rg(ctx, cx - r * 0.35, cy - r * 0.4, 2, cx, cy, r * 1.05, [[0, bg[0]], [1, bg[1]]]);
  ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  inner?.(ctx);
  // 원 가장자리 안쪽의 옅은 그늘(유리 렌즈 느낌)
  ctx.fillStyle = P.rg(ctx, cx, cy, r * 0.8, cx, cy, r, [[0, "rgba(40,55,80,0)"], [1, "rgba(40,55,80,.10)"]]);
  ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  ctx.restore();
  ring(t, cx, cy, r);
}
export function ring(t, cx, cy, r, w = 4) {
  const { ctx } = t;
  ctx.save();
  ctx.lineWidth = w;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "#A9B3C1";
  ctx.beginPath();
  ctx.arc(cx, cy, r + w / 2 + 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
/** 두 원의 바깥 공통 접선 두 개: 작은 원 s{x,y,r}에서 큰 원 L{x,y,r}로. [[p1, p2], [q1, q2]] */
export function tangents(s, L) {
  const dx = L.x - s.x, dy = L.y - s.y, d = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx), b = Math.acos(Math.max(-1, Math.min(1, (s.r - L.r) / d)));
  return [a + b, a - b].map((th) => {
    const n = [Math.cos(th), Math.sin(th)];
    return [[s.x + s.r * n[0], s.y + s.r * n[1]], [L.x + L.r * n[0], L.y + L.r * n[1]]];
  });
}
/** 확대 통로: 옅은 띠(fill)만. 대상 물체보다 먼저 그린다. */
export function zoomFill(t, s, L, a = 0.16) {
  const { ctx } = t;
  const [[p1, p2], [q1, q2]] = tangents(s, L);
  ctx.save();
  ctx.fillStyle = P.lg(ctx, s.x, s.y, L.x, L.y, [[0, `rgba(120,135,160,${a})`], [1, `rgba(120,135,160,${a * 0.3})`]]);
  ctx.beginPath();
  ctx.moveTo(...p1);
  ctx.lineTo(...p2);
  ctx.lineTo(...q2);
  ctx.lineTo(...q1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
/** 확대 통로의 점선 두 줄과 작은 표시 고리. 물체 뒤에 그린다(확대 원보다는 먼저). */
export function zoomLines(t, s, L, { spotRing = true } = {}) {
  const { ctx } = t;
  const [[p1, p2], [q1, q2]] = tangents(s, L);
  ctx.save();
  ctx.strokeStyle = "rgba(110,125,150,.6)";
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(...p1);
  ctx.lineTo(...p2);
  ctx.moveTo(...q1);
  ctx.lineTo(...q2);
  ctx.stroke();
  ctx.setLineDash([]);
  if (spotRing) {
    ctx.fillStyle = "rgba(120,135,160,.16)";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = "rgba(95,110,135,.85)";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r + 1.1, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// ── 유리 비커(앞에서 조금 위로 본 원통) ─────────────────────────────
/** o: { cx, top, bot, rx, ry, wall, level(액면 y), liq(hex), liqA(진하기 0~1), spout('l'|'r'|null), marks(눈금 수),
 *       inLiquid(ctx)  액체 속에 그릴 것(안쪽으로 잘림), behind(ctx) 액체 뒤(뒷벽 앞), shadow } */
export function beaker(t, o) {
  const { ctx } = t;
  const { cx, top, bot, rx } = o;
  const ry = o.ry ?? rx * 0.2;
  const wall = o.wall ?? 1.5;
  const L = cx - rx, R = cx + rx;
  const body = (c) => {
    c.moveTo(L, top);
    c.lineTo(L, bot);
    c.ellipse(cx, bot, rx, ry, 0, Math.PI, 0, true);
    c.lineTo(R, top);
    c.ellipse(cx, top, rx, ry, 0, 0, Math.PI, true);
    c.closePath();
  };
  if (o.shadow !== false) P.softShadow(t, cx + 3, bot + ry * 0.7, rx * 1.15, ry * 1.25 + 2.5, 0.2);
  // 뒷벽(안쪽): 가장자리가 짙은 옅은 유리 빛
  ctx.save();
  ctx.beginPath();
  body(ctx);
  ctx.clip();
  ctx.fillStyle = P.lg(ctx, L, 0, R, 0, [[0, "rgba(140,160,188,.34)"], [0.1, "rgba(205,218,232,.16)"], [0.5, "rgba(255,255,255,.08)"], [0.9, "rgba(205,218,232,.16)"], [1, "rgba(140,160,188,.34)"]]);
  ctx.fillRect(L, top - ry, 2 * rx, bot - top + 2 * ry);
  // 바닥 안쪽 면(두꺼운 유리 바닥)
  ctx.fillStyle = "rgba(225,234,244,.55)";
  ctx.beginPath();
  ctx.ellipse(cx, bot - 2.4, rx - wall, ry * (rx - wall) / rx, 0, 0, Math.PI * 2);
  ctx.fill();
  o.behind?.(ctx);
  ctx.restore();
  // 뒷쪽 테두리
  ctx.save();
  ctx.strokeStyle = "rgba(130,148,172,.55)";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.ellipse(cx, top, rx, ry, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  // 액체
  if (o.level != null) {
    const ly = o.level;
    const lrx = rx - wall, lry = (ry * lrx) / rx;
    const base = P.hex(o.liq ?? COL.water);
    const A = o.liqA ?? 1;
    const liqPath = (c) => {
      c.moveTo(L + wall, ly);
      c.lineTo(L + wall, bot - 2.4);
      c.ellipse(cx, bot - 2.4, lrx, lry, 0, Math.PI, 0, true);
      c.lineTo(R - wall, ly);
      c.ellipse(cx, ly, lrx, lry, 0, 0, Math.PI, true);
      c.closePath();
    };
    ctx.save();
    ctx.beginPath();
    liqPath(ctx);
    ctx.clip();
    ctx.fillStyle = P.lg(ctx, L, 0, R, 0, [
      [0, P.css(base, 0.42 * A)],
      [0.18, P.css(base, 0.2 * A)],
      [0.55, P.css(base, 0.14 * A)],
      [0.86, P.css(base, 0.22 * A)],
      [1, P.css(base, 0.44 * A)],
    ]);
    ctx.fillRect(L, ly - ry, 2 * rx, bot - ly + 2 * ry);
    ctx.fillStyle = P.lg(ctx, 0, ly, 0, bot, [[0, P.css(base, 0)], [1, P.css(base, 0.12 * A)]]);
    ctx.fillRect(L, ly - ry, 2 * rx, bot - ly + 2 * ry);
    o.inLiquid?.(ctx);
    ctx.restore();
    // 액면: 뒤쪽은 밝게(빛 반사), 앞쪽 가장자리는 액체 색
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, ly, lrx, lry, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, 0, ly - lry, 0, ly + lry, [[0, "rgba(255,255,255,.55)"], [0.6, P.css(P.srgb(P.mixc(P.lin(base), [1, 1, 1], 0.6)), 0.35 * A)], [1, P.css(base, 0.3 * A)]]);
    ctx.fill();
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.beginPath();
    ctx.ellipse(cx, ly, lrx, lry, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = P.css(base, 0.55 * A + 0.1);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(cx, ly, lrx, lry, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }
  o.front?.(ctx);
  // 앞 유리: 세로 반사 띠
  ctx.save();
  ctx.beginPath();
  body(ctx);
  ctx.clip();
  const hl = (x0, x1, a) => {
    ctx.fillStyle = P.lg(ctx, x0, 0, x1, 0, [[0, "rgba(255,255,255,0)"], [0.5, `rgba(255,255,255,${a})`], [1, "rgba(255,255,255,0)"]]);
    ctx.fillRect(x0, top + ry * 0.4, x1 - x0, bot - top);
  };
  hl(L + rx * 0.12, L + rx * 0.36, 0.7);
  hl(L + rx * 0.4, L + rx * 0.47, 0.35);
  hl(R - rx * 0.24, R - rx * 0.12, 0.32);
  ctx.restore();
  // 눈금(흰 칠)
  if (o.marks) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 0.8;
    const n = o.marks, y0 = bot - (bot - top) * 0.18, y1 = top + (bot - top) * 0.22;
    for (let i = 0; i <= n; i++) {
      const y = y0 + ((y1 - y0) * i) / n;
      const len = i % 2 === 0 ? rx * 0.36 : rx * 0.2;
      ctx.beginPath();
      ctx.moveTo(R - rx * 0.62, y);
      ctx.lineTo(R - rx * 0.62 + len, y);
      ctx.stroke();
    }
    ctx.restore();
  }
  // 유리 가장자리(두께: 바깥 짙은 선 + 안쪽 밝은 선)
  ctx.save();
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(112,132,160,.75)";
  ctx.lineWidth = 0.95;
  ctx.beginPath();
  ctx.moveTo(L, top);
  ctx.lineTo(L, bot);
  ctx.ellipse(cx, bot, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(R, top);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.75)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(L + wall, top + ry * 0.6);
  ctx.lineTo(L + wall, bot - 2.2);
  ctx.moveTo(R - wall, top + ry * 0.6);
  ctx.lineTo(R - wall, bot - 2.2);
  ctx.stroke();
  // 두꺼운 바닥의 앞 가장자리 빛
  ctx.strokeStyle = "rgba(255,255,255,.8)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, bot - 1.2, rx - 2, ry - 0.8, 0, Math.PI * 0.12, Math.PI * 0.88);
  ctx.stroke();
  // 앞 테두리(굵은 입술)
  ctx.strokeStyle = "rgba(112,132,160,.7)";
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(cx, top, rx, ry, 0, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.95)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.ellipse(cx, top - 0.3, rx, ry, 0, 0.05, Math.PI - 0.05);
  ctx.stroke();
  // 따르는 입(부리)
  if (o.spout) {
    const sx = o.spout === "l" ? L : R, dir = o.spout === "l" ? -1 : 1;
    ctx.fillStyle = "rgba(235,242,250,.9)";
    ctx.strokeStyle = "rgba(112,132,160,.75)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(sx - dir * 1.5, top - 1.6);
    ctx.quadraticCurveTo(sx + dir * 2.2, top - 2.6, sx + dir * 3.6, top - 3.4);
    ctx.quadraticCurveTo(sx + dir * 1.6, top + 0.6, sx - dir * 0.2, top + 2.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
  return { L, R, ry, body };
}

// ── 액체 입자 채우기(맞닿게, 무질서하게) ──────────────────────────────
/** 영역 안에 반지름 r인 공 n개를 겹치지 않게 빽빽이 흩는다(부드러운 밀어내기 반복).
 *  inside(x, y, r) → 영역 안이면 true, 아니면 [x, y]로 끌어들인 자리. fixed = [{x,y,r}] 움직이지 않는 공. */
export function pack({ n, r, seed = 1, box, inside, fixed = [], gap = 0.25, iters = 420, jitter = 0 }) {
  const rnd = N.rng(seed);
  const pts = [];
  let guard = 0;
  while (pts.length < n && guard++ < n * 400) {
    const x = box.x + rnd() * box.w, y = box.y + rnd() * box.h;
    if (inside(x, y, r) !== true) continue;
    if (fixed.some((f) => Math.hypot(f.x - x, f.y - y) < f.r + r)) continue;
    pts.push({ x, y, r });
  }
  const cell = 2 * r + gap;
  for (let it = 0; it < iters; it++) {
    const k = it < iters * 0.6 ? 1 : 0.6;
    // 처음엔 작은 공으로 고르게 펴고 점점 키운다(빈 구멍 없이 빽빽해진다)
    const grow = Math.min(1, 0.72 + (0.28 * it) / (iters * 0.55));
    for (const p of pts) p.r = r * grow;
    // 격자 버킷으로 이웃만 견준다
    const grid = new Map();
    const key = (i, j) => i * 92821 + j;
    pts.forEach((p, idx) => {
      const kk = key(Math.floor(p.x / cell), Math.floor(p.y / cell));
      if (!grid.has(kk)) grid.set(kk, []);
      grid.get(kk).push(idx);
    });
    for (let a = 0; a < pts.length; a++) {
      const p = pts[a];
      const ci = Math.floor(p.x / cell), cj = Math.floor(p.y / cell);
      for (let di = -1; di <= 1; di++)
        for (let dj = -1; dj <= 1; dj++) {
          const list = grid.get(key(ci + di, cj + dj));
          if (!list) continue;
          for (const b of list) {
            if (b <= a) continue;
            const q = pts[b];
            let dx = q.x - p.x, dy = q.y - p.y;
            let d = Math.hypot(dx, dy);
            const m = p.r + q.r + gap;
            if (d < m) {
              if (d < 1e-6) {
                dx = rnd() - 0.5;
                dy = rnd() - 0.5;
                d = Math.hypot(dx, dy);
              }
              const push = ((m - d) / 2) * k;
              p.x -= (dx / d) * push;
              p.y -= (dy / d) * push;
              q.x += (dx / d) * push;
              q.y += (dy / d) * push;
            }
          }
        }
      for (const f of fixed) {
        const dx = p.x - f.x, dy = p.y - f.y, d = Math.hypot(dx, dy) || 1e-6;
        const m = f.r + p.r + gap;
        if (d < m) {
          p.x += (dx / d) * (m - d);
          p.y += (dy / d) * (m - d);
        }
      }
      const c = inside(p.x, p.y, p.r);
      if (c !== true) {
        p.x = c[0];
        p.y = c[1];
      }
    }
    if (jitter && it < iters * 0.3) for (const p of pts) (p.x += (rnd() - 0.5) * jitter), (p.y += (rnd() - 0.5) * jitter);
  }
  return pts;
}
/** 원(cx, cy, R) 안, 그리고 y ≤ floor 인 영역의 inside 함수 */
export function inCircle(cx, cy, R, floor = Infinity, ceil = -Infinity) {
  return (x, y, r) => {
    let nx = x, ny = y;
    const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy), lim = R - r - 0.4;
    let ok = true;
    if (d > lim) {
      nx = cx + (dx / d) * lim;
      ny = cy + (dy / d) * lim;
      ok = false;
    }
    if (ny > floor - r) {
      ny = floor - r;
      ok = false;
    }
    if (ny < ceil + r) {
      ny = ceil + r;
      ok = false;
    }
    return ok ? true : [nx, ny];
  };
}
/** 겹친 쌍의 최대 겹침(px). 검산용. */
export function maxOverlap(list) {
  let m = 0;
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      const o = a.r + b.r - Math.hypot(a.x - b.x, a.y - b.y);
      if (o > m) m = o;
    }
  return m;
}
/** 고르게 흩기(가장 먼 후보 고르기): 영역 안에 n개, 서로 멀리. 고정점 fixed와도 멀리. */
export function spread({ n, r, seed = 3, box, inside, fixed = [], cand = 40 }) {
  const rnd = N.rng(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    let best = null, bd = -1;
    for (let k = 0; k < cand; k++) {
      const x = box.x + rnd() * box.w, y = box.y + rnd() * box.h;
      if (inside(x, y, r) !== true) continue;
      let d = Infinity;
      for (const p of pts.concat(fixed)) d = Math.min(d, Math.hypot(p.x - x, p.y - y) - p.r - r);
      if (d > bd) {
        bd = d;
        best = { x, y, r };
      }
    }
    if (best) pts.push(best);
  }
  return pts;
}

// ── 곡선 화살표 중심선 ──────────────────────────────────────────────
/** 이차 베지어 a → c(조절점) → b 를 n개 점으로 */
export function qcurve(a, c, b, n = 18) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, u = 1 - s;
    out.push([u * u * a[0] + 2 * u * s * c[0] + s * s * b[0], u * u * a[1] + 2 * u * s * c[1] + s * s * b[1]]);
  }
  return out;
}

// ── 가스 불꽃(파란 불꽃 줄) ─────────────────────────────────────────
/** 버너 고리 위의 파란 불꽃. (cx, y)=불꽃 밑동 가운데, w=고리 지름, n=불꽃 수, hgt=높이 */
export function gasFlames(t, cx, y, w, { n = 7, hgt = 9, ry = 2.2 } = {}) {
  const { ctx } = t;
  ctx.save();
  // 바닥의 푸른 번짐
  ctx.fillStyle = P.rg(ctx, cx, y, 1, cx, y, w * 0.62, [[0, "rgba(90,140,255,.28)"], [1, "rgba(90,140,255,0)"]]);
  ctx.beginPath();
  ctx.ellipse(cx, y, w * 0.62, ry + hgt * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < n; i++) {
    const s = n === 1 ? 0.5 : i / (n - 1);
    const x = cx - w / 2 + s * w;
    const yy = y + Math.sin(s * Math.PI) * ry * 0.9; // 고리의 앞쪽이 조금 아래
    const h = hgt * (0.85 + 0.3 * Math.sin(s * Math.PI));
    const fw = (w / n) * 0.52;
    const tongue = (scale, col0, col1) => {
      ctx.beginPath();
      ctx.moveTo(x - fw * scale, yy);
      ctx.quadraticCurveTo(x - fw * scale * 0.9, yy - h * scale * 0.55, x + fw * 0.15, yy - h * scale);
      ctx.quadraticCurveTo(x + fw * scale * 0.8, yy - h * scale * 0.5, x + fw * scale, yy);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, yy - h * scale, 0, yy, [[0, col0], [1, col1]]);
      ctx.fill();
    };
    tongue(1, "rgba(120,170,255,.15)", "rgba(60,110,240,.85)");
    tongue(0.55, "rgba(170,210,255,.35)", "rgba(150,200,255,.95)");
  }
  ctx.restore();
}

// ── 장작불(주황 불꽃) ───────────────────────────────────────────────
export function fire(t, cx, y, w, h, seed = 4) {
  const { ctx } = t;
  const rnd = N.rng(seed);
  ctx.save();
  ctx.fillStyle = P.rg(ctx, cx, y - h * 0.3, 2, cx, y - h * 0.3, w * 0.8, [[0, "rgba(255,170,60,.55)"], [1, "rgba(255,120,40,0)"]]);
  ctx.fillRect(cx - w, y - h * 1.4, 2 * w, h * 1.6);
  const tongues = 7;
  for (let pass = 0; pass < 3; pass++) {
    const sc = [1, 0.7, 0.42][pass];
    const cols = [["rgba(255,90,30,.0)", "rgba(240,80,30,.9)"], ["rgba(255,170,40,.0)", "rgba(255,160,40,.95)"], ["rgba(255,240,170,.0)", "rgba(255,236,160,1)"]][pass];
    for (let i = 0; i < tongues; i++) {
      const s = (i + 0.5) / tongues;
      const x = cx - w / 2 + s * w + (rnd() - 0.5) * 3;
      const th = h * sc * (0.55 + 0.45 * Math.sin(s * Math.PI)) * (0.8 + rnd() * 0.35);
      const fw = (w / tongues) * 0.95 * (pass === 0 ? 1.15 : 1);
      const lean = (rnd() - 0.5) * fw * 0.8;
      ctx.beginPath();
      ctx.moveTo(x - fw, y);
      ctx.bezierCurveTo(x - fw * 1.1, y - th * 0.45, x + lean - fw * 0.2, y - th * 0.7, x + lean, y - th);
      ctx.bezierCurveTo(x + lean + fw * 0.3, y - th * 0.65, x + fw * 1.1, y - th * 0.4, x + fw, y);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, y - th, 0, y, [[0, cols[0]], [0.45, cols[1]], [1, cols[1]]]);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ── 유리 온도계(세로) ───────────────────────────────────────────────
/** x=가운데, y0=위 끝, y1=구부 가운데, frac=빨간 기둥이 눈금 구간(y0+6 ~ y1−6)에서 차지하는 비율 */
export function thermo(t, x, y0, y1, frac, { w = 4.4, bulb = 3.6, ticks = 8, col = "#E8463A" } = {}) {
  const { ctx } = t;
  ctx.save();
  // 유리 관
  const tube = (c) => {
    c.moveTo(x - w / 2, y1 - bulb * 0.6);
    c.lineTo(x - w / 2, y0 + w / 2);
    c.arc(x, y0 + w / 2, w / 2, Math.PI, 0);
    c.lineTo(x + w / 2, y1 - bulb * 0.6);
    c.arc(x, y1, bulb, -Math.PI / 2 + 0.6, Math.PI * 1.5 - 0.6, false);
    c.closePath();
  };
  ctx.beginPath();
  tube(ctx);
  ctx.fillStyle = P.lg(ctx, x - w / 2, 0, x + w / 2, 0, [[0, "rgba(200,212,226,.95)"], [0.35, "rgba(255,255,255,.98)"], [1, "rgba(190,204,220,.95)"]]);
  ctx.fill();
  ctx.strokeStyle = "rgba(110,128,152,.8)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // 빨간 기둥과 구부
  const yt = y1 - 6 - (y1 - 6 - (y0 + 6)) * frac;
  ctx.fillStyle = P.lg(ctx, x - 1, 0, x + 1, 0, [[0, "#B8231A"], [0.5, col], [1, "#C42A20"]]);
  ctx.fillRect(x - 0.9, yt, 1.8, y1 - yt);
  ctx.beginPath();
  ctx.arc(x, y1, bulb - 1.1, 0, Math.PI * 2);
  ctx.fillStyle = P.rg(ctx, x - bulb * 0.35, y1 - bulb * 0.4, 0.3, x, y1, bulb, [[0, "#FF9A8C"], [0.5, col], [1, "#A81E16"]]);
  ctx.fill();
  // 눈금
  ctx.strokeStyle = "rgba(60,72,90,.55)";
  ctx.lineWidth = 0.55;
  for (let i = 0; i <= ticks; i++) {
    const y = y0 + 6 + ((y1 - 6 - (y0 + 6)) * i) / ticks;
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - (i % 2 ? 1.1 : 1.8), y);
    ctx.lineTo(x + w / 2, y);
    ctx.stroke();
  }
  // 반사
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + 0.9, y0 + w);
  ctx.lineTo(x - w / 2 + 0.9, y1 - bulb);
  ctx.stroke();
  ctx.restore();
  return yt;
}

// ── 물방울(눈물 모양) ───────────────────────────────────────────────
export function droplet(t, x, y, r, { col = "#9FD3FF", hang = false } = {}) {
  const { ctx } = t;
  ctx.save();
  ctx.beginPath();
  if (hang) {
    // 매달린 방울: 위가 좁고 아래가 둥글다
    ctx.moveTo(x, y - r * 1.5);
    ctx.bezierCurveTo(x + r * 0.35, y - r * 0.8, x + r, y - r * 0.2, x + r, y + r * 0.2);
    ctx.arc(x, y + r * 0.2, r, 0, Math.PI);
    ctx.bezierCurveTo(x - r, y - r * 0.2, x - r * 0.35, y - r * 0.8, x, y - r * 1.5);
  } else {
    ctx.moveTo(x, y - r * 1.7);
    ctx.bezierCurveTo(x + r * 0.5, y - r * 0.9, x + r, y - r * 0.3, x + r, y + r * 0.15);
    ctx.arc(x, y + r * 0.15, r, 0, Math.PI);
    ctx.bezierCurveTo(x - r, y - r * 0.3, x - r * 0.5, y - r * 0.9, x, y - r * 1.7);
  }
  ctx.closePath();
  const c = P.hex(col);
  ctx.fillStyle = P.rg(ctx, x - r * 0.35, y - r * 0.2, 0.2, x, y, r * 1.6, [[0, "rgba(255,255,255,.95)"], [0.35, P.css(c, 0.75)], [1, P.css(P.srgb(P.mixc(P.lin(c), [0, 0, 0], 0.35)), 0.9)]]);
  ctx.fill();
  ctx.strokeStyle = P.css(P.srgb(P.mixc(P.lin(c), [0, 0, 0], 0.45)), 0.55);
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.95)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.35, y - r * 0.1, r * 0.22, r * 0.34, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ── 기포(액체 속 기체 방울) ─────────────────────────────────────────
export function bubble(t, x, y, r, { tint = "#E8F4FF", edge = "rgba(120,150,185,.75)" } = {}) {
  const { ctx } = t;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = P.rg(ctx, x + r * 0.2, y + r * 0.25, r * 0.1, x, y, r, [[0, "rgba(255,255,255,.25)"], [0.75, P.css(P.hex(tint), 0.35)], [1, "rgba(255,255,255,.75)"]]);
  ctx.fill();
  ctx.lineWidth = Math.max(0.6, r * 0.09);
  ctx.strokeStyle = edge;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.95)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.38, y - r * 0.42, r * 0.26, r * 0.15, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
