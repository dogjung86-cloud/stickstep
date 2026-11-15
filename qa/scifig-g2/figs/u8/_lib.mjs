// Ⅷ 별과 우주 그림의 공용 도우미: 실사 사진 불러오기(원판의 중심과 반지름은 사진에서 잰 값), 우주 바탕, 빛나는 별 점,
// 확대 원(흰 고리 + 회색 선)과 확대 통로, 어두운 바탕용 라벨과 지시선.
// 천체(태양, 행성, 달, 별)의 겉면은 그리지 않는다. 겉면은 언제나 public/photos의 실사이고, 별은 빛나는 점이다.

/** 사진과 원판 자리(원본 화소). 원판은 경계 화소에 원을 맞춰 잰 값(2026-11-15, 검산 메모 참고). */
export const PH = {
  earth: { src: "/public/photos/earth_apollo17.jpg", cx: 957, cy: 954, r: 856 },
  moon: { src: "/public/photos/moon_lro.jpg", cx: 700, cy: 700, r: 694 },
  sun: { src: "/public/photos/sun_whitelight.jpg", cx: 911, cy: 852, r: 745 },
  jupiter: { src: "/public/photos/jupiter.jpg", cx: 472, cy: 468, r: 433, ry: 416 },
  pluto: { src: "/public/photos/star/pluto.webp", cx: 633, cy: 622, r: 540 },
  // 위에서 본 우리은하(상상도): 은하 중심이 그림 한가운데, 원반 반지름 563 화소(앱 GalaxyLab의 R_GAL 0.44와 같다), 태양계는 중심 아래 320 화소.
  mwTop: { src: "/public/photos/star/milkyway-top.webp", cx: 640, cy: 640, r: 563, sun: [640, 960] },
  // 온 하늘 은하수 파노라마: 가로가 은경(한가운데가 은하 중심 방향, 양 끝이 반대 방향), 띠의 가운데 줄은 약 355.
  mwPan: { src: "/public/photos/star/milkyway-pan.webp", w: 1400, h: 700, band: 355 },
  // 안드로메다은하: 핵의 자리, 긴 축은 화면에서 오른쪽 아래로 약 50°.
  m31: { src: "/public/photos/star/andromeda.webp", cx: 639, cy: 650, ang: 50 },
};

export function loadImg(src) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error("사진을 못 불러왔어요: " + src));
    im.src = src;
  });
}

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

/** 씨앗 난수 */
export function rnd(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 별빛 색(희미한 별은 거의 흰색, 몇몇은 푸르거나 누렇게). */
function starTint(r) {
  const u = r();
  if (u < 0.22) return [196, 214, 255];
  if (u < 0.4) return [255, 228, 190];
  return [236, 240, 255];
}

/** 별이 흩뿌려진 밤하늘 점들. 대부분 희미하고 몇 개만 밝다(거듭제곱 분포). keep(x, y)가 거짓이면 그 자리는 건너뛴다. */
export function stars(t, rect, { n = 220, seed = 3, bright = 1, keep } = {}) {
  const { ctx } = t;
  const r = rnd(seed);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const x = rect.x + r() * rect.w, y = rect.y + r() * rect.h;
    const m = r();
    const c = starTint(r);
    if (keep && !keep(x, y)) continue;
    const b = (0.16 + 0.84 * Math.pow(m, 7)) * bright;
    const rad = 0.28 + 0.75 * Math.pow(m, 5);
    if (b > 0.55) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 4.2);
      g.addColorStop(0, `rgba(${c},${0.42 * b})`);
      g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, rad * 4.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(${c},${clamp(b)})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** 그림 전체를 덮는 우주 바탕: 위가 조금 밝은 남색, 아주 옅은 결, 별. */
export function space(t, P, nz, { top = "#0C1430", bottom = "#050913", n = 240, seed = 5, glowAt = null, rect = null, bright = 1 } = {}) {
  const { ctx } = t;
  const R = rect ?? { x: 0, y: 0, w: t.w, h: t.h };
  ctx.save();
  const g = ctx.createLinearGradient(0, R.y, 0, R.y + R.h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(R.x, R.y, R.w, R.h);
  // 왼쪽 위에서 비치는 아주 옅은 빛(화면이 평평해 보이지 않게)
  const [gx, gy] = glowAt ?? [R.x + R.w * 0.22, R.y + R.h * 0.12];
  const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(R.w, R.h) * 0.9);
  rg.addColorStop(0, "rgba(70,96,170,0.20)");
  rg.addColorStop(1, "rgba(70,96,170,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(R.x, R.y, R.w, R.h);
  ctx.restore();
  if (nz) {
    // 성간 먼지 같은 아주 옅은 결(밝기 ±2% 안쪽)
    P.shade(t, R, (x, y) => {
      const v = nz.fbm(x * 0.012, y * 0.012, 4);
      const a = Math.max(0, v) * 0.06;
      return a > 0.004 ? [120, 140, 210, a] : null;
    });
  }
  stars(t, R, { n, seed, bright });
}

/** 빛나는 별 점. r은 빛무리 반지름, core는 흰 속의 비율. spikes를 주면 십자 빛줄기. */
export function glow(ctx, x, y, r, col = [255, 236, 190], { core = 0.22, alpha = 1, spikes = 0, spikeA = 0.55 } = {}) {
  const c = col.join(",");
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,255,255,${alpha})`);
  g.addColorStop(core * 0.55, `rgba(255,255,255,${0.95 * alpha})`);
  g.addColorStop(core, `rgba(${c},${0.62 * alpha})`);
  g.addColorStop(Math.min(0.95, core * 2.2), `rgba(${c},${0.2 * alpha})`);
  g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  if (spikes > 0) {
    ctx.globalCompositeOperation = "lighter";
    for (const a of [0, Math.PI / 2]) {
      for (const s of [1, -1]) {
        const ex = x + Math.cos(a) * spikes * s, ey = y + Math.sin(a) * spikes * s;
        const lg = ctx.createLinearGradient(x, y, ex, ey);
        lg.addColorStop(0, `rgba(${c},${spikeA * alpha})`);
        lg.addColorStop(1, `rgba(${c},0)`);
        ctx.strokeStyle = lg;
        ctx.lineWidth = Math.max(0.6, r * 0.09);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

/** 실사 원판(태양, 행성, 달)을 (cx, cy) 반지름 r로 그린다. 원판 바깥은 잘라 낸다. ry를 주면 타원(목성의 납작함). */
export function photoDisc(ctx, img, m, cx, cy, r, { ry = null, rot = 0 } = {}) {
  const k = r / m.r;
  const rY = ry ?? (m.ry ? (m.ry / m.r) * r : r);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, rY, rot, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.drawImage(img, -m.cx * k, -m.cy * k, img.naturalWidth * k, img.naturalHeight * k);
  ctx.restore();
}

/** 검은 바탕의 사진(은하, 은하수)을 'screen'으로 얹는다: 검은 곳은 바탕이 그대로 비친다. clip(ctx)로 자를 수 있다. */
export function screenImg(ctx, img, { sx, sy, s, rot = 0, at = [0, 0], clip = null, alpha = 1, op = "screen" }) {
  ctx.save();
  if (clip) {
    ctx.beginPath();
    clip(ctx);
    ctx.clip();
  }
  ctx.globalCompositeOperation = op;
  ctx.globalAlpha = alpha;
  ctx.translate(at[0], at[1]);
  ctx.rotate(rot);
  ctx.drawImage(img, -sx * s, -sy * s, img.naturalWidth * s, img.naturalHeight * s);
  ctx.restore();
}

/** 사진을 타원 모양으로 부드럽게 오려 'screen'으로 얹는다(가장자리 fade 비율만큼 서서히 사라짐).
 *  사진의 (sx, sy) 화소가 화면 at에 오고, s배로 줄이며 rot만큼 돌린다. 오리는 타원은 반지름 rx, ry, 기울기 ang. */
export function maskedImg(t, img, { sx, sy, s, rot = 0, at, rx, ry = rx, ang = 0, fade = 0.18, op = "screen", alpha = 1 }) {
  const { ctx, dpr } = t;
  const R = Math.max(rx, ry) + 2;
  const W = Math.ceil(2 * R * dpr);
  const off = document.createElement("canvas");
  off.width = W;
  off.height = W;
  const o = off.getContext("2d");
  o.setTransform(dpr, 0, 0, dpr, R * dpr, R * dpr);
  o.rotate(rot);
  o.drawImage(img, -sx * s, -sy * s, img.naturalWidth * s, img.naturalHeight * s);
  o.setTransform(dpr, 0, 0, dpr, R * dpr, R * dpr);
  o.rotate(ang);
  o.scale(1, ry / rx);
  const g = o.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(Math.max(0, 1 - fade), "rgba(0,0,0,1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  o.globalCompositeOperation = "destination-in";
  o.fillStyle = g;
  const big = R * 4 * (rx / ry);
  o.fillRect(-big, -big, big * 2, big * 2);
  ctx.save();
  ctx.globalCompositeOperation = op;
  ctx.globalAlpha = alpha;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(off, Math.round((at[0] - R) * dpr), Math.round((at[1] - R) * dpr));
  ctx.restore();
}

/** 확대 원의 테: 흰 고리 + 바깥 회색 선(시범 그림과 같은 모양). */
export function ring(ctx, cx, cy, r, { white = 3.6, grey = "#A9B3C1" } = {}) {
  ctx.save();
  ctx.lineWidth = white;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = grey;
  ctx.beginPath();
  ctx.arc(cx, cy, r + white / 2 + 0.9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** 점 p에서 원(c, r)으로 벌어지는 확대 통로: 두 접선(점선)과 옅은 면. */
export function funnel(ctx, p, c, r, { line = "rgba(190,206,235,.62)", fill = ["rgba(150,175,225,.20)", "rgba(150,175,225,.04)"], dash = [3, 3] } = {}) {
  const dx = c[0] - p[0], dy = c[1] - p[1];
  const d = Math.hypot(dx, dy);
  const base = Math.atan2(dy, dx);
  const a = Math.asin(Math.min(1, r / d));
  const L = Math.sqrt(Math.max(0, d * d - r * r));
  const t1 = [p[0] + L * Math.cos(base - a), p[1] + L * Math.sin(base - a)];
  const t2 = [p[0] + L * Math.cos(base + a), p[1] + L * Math.sin(base + a)];
  ctx.save();
  const g = ctx.createLinearGradient(p[0], p[1], c[0], c[1]);
  g.addColorStop(0, fill[0]);
  g.addColorStop(1, fill[1]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  ctx.lineTo(t1[0], t1[1]);
  ctx.arc(c[0], c[1], r, Math.atan2(t1[1] - c[1], t1[0] - c[0]), Math.atan2(t2[1] - c[1], t2[0] - c[0]), true);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.setLineDash(dash);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  ctx.lineTo(t1[0], t1[1]);
  ctx.moveTo(p[0], p[1]);
  ctx.lineTo(t2[0], t2[1]);
  ctx.stroke();
  ctx.restore();
  return [t1, t2];
}

export const NIGHT = { ink: "#EEF3FB", halo: "#070C1A", dim: "#AFC0DA", gold: "#FFD166", sky: "#8FB4FF", lead: "#B9C8E0" };

/** 어두운 바탕 라벨: 밝은 글자 + 어두운 할로. */
export function dl(S, s, x, y, text, o = {}) {
  return S.label(s, x, y, text, { color: NIGHT.ink, haloColor: NIGHT.halo, haloW: 3.6, ...o });
}

/** 어두운 바탕 지시선: 어두운 테 + 밝은 선 + 끝점. */
export function dlead(S, s, pts, o = {}) {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
  const g = S.el(s, "g");
  const col = o.color ?? NIGHT.lead;
  S.el(g, "path", { d, fill: "none", stroke: NIGHT.halo, "stroke-width": (o.w ?? 1.1) + 2.2, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.7 });
  S.el(g, "path", { d, fill: "none", stroke: col, "stroke-width": o.w ?? 1.1, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": o.dash ?? null });
  if (o.dot !== false) {
    const [x, y] = pts[pts.length - 1];
    S.el(g, "circle", { cx: x, cy: y, r: (o.dotR ?? 2.2) + 1.1, fill: NIGHT.halo, opacity: 0.8 });
    S.el(g, "circle", { cx: x, cy: y, r: o.dotR ?? 2.2, fill: col });
  }
  return g;
}

/** 알약 모양 꼬리표(밝은 바탕에 어두운 글자). */
export function pill(S, s, x, y, text, { size = 13.5, fill = "rgba(232,238,249,.92)", color = "#14203A", padX = 8, h = 21, anchor = "middle", w = null } = {}) {
  const tw = w ?? text.length * size * 0.92 + padX * 2;
  const x0 = anchor === "middle" ? x - tw / 2 : anchor === "end" ? x - tw : x;
  const g = S.el(s, "g");
  S.el(g, "rect", { x: x0, y: y - h / 2, width: tw, height: h, rx: h / 2, fill });
  S.el(g, "text", {
    x: x0 + tw / 2, y: y + size * 0.36, "text-anchor": "middle", "font-size": size, "font-weight": 800, fill: color,
    "font-family": "'Pretendard Variable', Pretendard, sans-serif", "letter-spacing": "-0.01em",
  }).textContent = text;
  return g;
}
