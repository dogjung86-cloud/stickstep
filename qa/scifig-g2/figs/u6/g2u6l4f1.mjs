// g2u6l4f1 호흡계: 앞에서 비춰 본 머리와 가슴(코, 숨관, 숨관가지, 허파, 갈비뼈, 가로막) → 가장 가는 숨관가지 끝의 허파꽈리 무리
// → 허파꽈리를 덮은 모세혈관 그물. 앞에서 본 그림이라 그림의 왼쪽이 몸의 오른쪽(세 덩이 허파). 검산 메모는 g2u6l4f1.md
import * as L from "./_lib.mjs";

export const meta = {
  key: "g2u6l4f1",
  w: 340,
  h: 388,
  alt: "앞에서 비춰 본 호흡계. 코에서 숨관과 두 갈래 숨관가지를 지나 세 덩이와 두 덩이로 된 좌우 허파로 공기 길이 이어지고, 숨관가지 끝의 허파꽈리는 포도송이처럼 모여 모세혈관 그물로 덮여 있어요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(64);
  const rnd = N.rng(11);
  const R = (a, b) => a + (b - a) * rnd();

  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 몸의 자: 5 px = 1 cm. 정수리 y 10, 몸 가운데 x 102. 가슴 좌표(cm)는 목 아래 패인 곳(정수리에서 33 cm)이 원점 ──
  const s = 5, BX = 102, TOP = 10, NY = TOP + 33 * s;
  const X = (u) => BX + u * s, Y = (v) => NY + v * s;
  const C = (pts) => pts.map(([u, v]) => [X(u), Y(v)]);
  const body = L.frontBody(BX, TOP, s, { bottom: 68 });
  const fade = (x, y) => 1 - P.smooth(Y(25), Y(32.5), y);

  // 몸(반투명 살갗)
  L.pillow(t, L.bbox([...body.head, ...body.body]), (c) => {
    L.poly(c, body.head);
    L.poly(c, body.body);
    for (const e of L.ears(BX, TOP, s)) L.poly(c, e);
  }, { color: "#F3D2BE", light: "#FDF1E8", dark: "#D7A68C", blur: 11, relief: 0.8, alpha: 0.62, edgeAlpha: 0.95, spec: 0.08, rim: 0.1, alphaFn: fade });

  // ── 뒤로 비치는 뼈대: 등뼈, 갈비뼈, 복장뼈, 빗장뼈 ──
  const bone = L.layer(t);
  {
    const c = bone.ctx;
    c.lineCap = "round";
    c.lineJoin = "round";
    for (let v = -16.5; v < 30; v += 2.25) {
      const wv = v < -5 ? 1.35 : v < 18 ? 1.6 : 2.0;
      c.fillStyle = "#E9DFCC";
      c.beginPath();
      c.roundRect(X(-wv), Y(v), 2 * wv * s, 1.7 * s, 2.2);
      c.fill();
      c.strokeStyle = "rgba(150,130,100,.55)";
      c.lineWidth = 0.6;
      c.stroke();
    }
    const strokeIt = (pts, col, lw) => {
      c.strokeStyle = col;
      c.lineWidth = lw;
      c.beginPath();
      L.poly(c, C(pts), false);
      c.stroke();
    };
    for (const r of L.RIBS) {
      for (const sd of [-1, 1]) {
        const parts = L.ribParts(r, sd, L.RIBS);
        const wd = (r.k <= 2 ? 1.0 : 1.25) * s;
        strokeIt(parts.back, "rgba(150,128,96,.6)", wd + 1);
        strokeIt(parts.back, "#EDE3D0", wd);
        strokeIt(parts.front, "rgba(150,128,96,.6)", wd + 1);
        strokeIt(parts.front, "#F2E9D8", wd);
        if (parts.cart) {
          strokeIt(parts.cart, "rgba(120,140,160,.5)", wd * 0.85 + 0.8);
          strokeIt(parts.cart, "#E3ECF2", wd * 0.85);
        }
      }
    }
    c.fillStyle = "#EFE6D4";
    c.strokeStyle = "rgba(150,128,96,.6)";
    c.lineWidth = 0.8;
    c.beginPath();
    L.poly(c, L.spline(C([[0, -0.4], [2.6, 0.2], [2.4, 4.4], [1.7, 5.2], [1.8, 13.6], [1.2, 15.6], [0.5, 18.2], [-0.5, 18.2], [-1.2, 15.6], [-1.8, 13.6], [-1.7, 5.2], [-2.4, 4.4], [-2.6, 0.2]]), true, 6));
    c.fill();
    c.stroke();
    for (const sd of [-1, 1]) {
      const cl = C([[sd * 1.9, -0.7], [sd * 6, -1.6], [sd * 10.5, -1.2], [sd * 14.6, -2.6], [sd * 16.6, -2.9]]);
      const pts = L.spline(cl, false, 8);
      c.strokeStyle = "rgba(150,128,96,.6)";
      c.lineWidth = 1.5 * s + 1;
      c.beginPath();
      L.poly(c, pts, false);
      c.stroke();
      c.strokeStyle = "#F0E7D5";
      c.lineWidth = 1.5 * s;
      c.beginPath();
      L.poly(c, pts, false);
      c.stroke();
    }
  }
  L.put(t, bone, 0.72);

  // ── 가로막과 허파의 바닥(같은 곡선): 몸의 오른쪽(그림 왼쪽) 돔이 조금 높다 ──
  const DU = [[-12.8, 17.6], [-11.6, 15.6], [-9.8, 13.6], [-7.6, 12.6], [-5.6, 12.3], [-3.4, 12.7], [-1.2, 13.6], [1.5, 14.0], [4.2, 13.6], [6.4, 13.3], [8.6, 13.9], [10.6, 15.4], [12.2, 17.3], [13.0, 18.6]];
  const dUp = L.spline(C(DU), false, 10);
  const duAt = (u) => {
    const x = X(u);
    for (let i = 1; i < dUp.length; i++)
      if ((dUp[i - 1][0] - x) * (dUp[i][0] - x) <= 0) {
        const f = (x - dUp[i - 1][0]) / (dUp[i][0] - dUp[i - 1][0] || 1);
        return (dUp[i - 1][1] + (dUp[i][1] - dUp[i - 1][1]) * f - NY) / s;
      }
    return 20;
  };
  const DLo = [[13.0, 18.6], [13.5, 20.2], [13.6, 21.9], [12.0, 20.3], [10.4, 17.9], [8.4, 16.3], [6.3, 15.8], [3.5, 16.3], [0, 16.5], [-3.4, 15.5], [-5.6, 15.0], [-7.6, 15.3], [-9.8, 16.6], [-11.6, 18.7], [-12.9, 20.9], [-13.25, 19.2], [-12.8, 17.6]];
  const dLo = L.spline(C(DLo), false, 8);
  const dia = [...dUp, ...dLo.slice(1, -1)];
  // 아래 가장자리(배 쪽으로 휘어 내려가는 면)는 옅어지게: 막이 앞에서 뒤로 둥글게 덮인 모습
  const loEdge = dLo.slice(Math.round(dLo.length * 0.13), Math.round(dLo.length * 0.87));
  const yAt = (pts, x) => {
    for (let i = 1; i < pts.length; i++)
      if ((pts[i - 1][0] - x) * (pts[i][0] - x) <= 0) {
        const f = (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0] || 1);
        return pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f;
      }
    return null;
  };
  L.pillow(t, L.bbox(dia), (c) => L.poly(c, dia), {
    color: "#BE5059", light: "#F0A3A0", dark: "#7A2A3C", blur: 4.2, relief: 0.5, spec: 0.1, gloss: 14,
    alphaFn: (x, y) => {
      const yt = yAt(dUp, x), yb = yAt(loEdge, x);
      if (yt === null || yb === null || yb <= yt) return 1;
      return 1 - 0.62 * P.smooth(0.15, 1.0, (y - yt) / (yb - yt));
    },
    tex: (x, y) => {
      // 가운데 힘줄(흰빛 막)과 그 둘레에서 바깥 아래로 뻗는 근육 결
      const u = (x - BX) / s, v = (y - NY) / s;
      const tendon = (1 - P.smooth(2.6, 5.6, Math.abs(u + 0.3))) * (1 - P.smooth(15.0, 16.4, v));
      const ang = Math.atan2(y - Y(10), x - X(-0.4));
      const fib = 0.5 + 0.5 * Math.sin(ang * 90 + nz.n2(x * 0.07, y * 0.07) * 2.4);
      const m = 0.86 + 0.2 * fib * (1 - tendon);
      return [m + tendon * 0.55, m + tendon * 0.82, m + tendon * 0.8];
    },
  });

  // ── 허파(앞에서 본 모습: 그림 왼쪽이 몸의 오른쪽). 바닥은 가로막 윗면과 같은 곡선 ──
  const baseSeg = (u0, u1) => dUp.filter(([x]) => (x - X(u0)) * (x - X(u1)) <= 0).sort((a, b) => (u0 < u1 ? a[0] - b[0] : b[0] - a[0]));
  const RL = [
    ...L.spline(C([[-1.5, -0.6], [-2.3, -2.6], [-3.9, -3.3], [-6.4, -2.6], [-9.2, -0.5], [-11.3, 2.8], [-12.6, 7.0], [-13.2, 11.4], [-13.3, 15.0], [-13.1, 16.5], [-12.8, 17.6]]), false, 8),
    ...baseSeg(-12.8, -1.75),
    ...L.spline(C([[-1.75, duAt(-1.75)], [-2.15, 10.8], [-2.5, 7.8], [-2.3, 4.8], [-1.75, 1.8], [-1.5, -0.6]]), false, 8),
  ];
  const LL = [
    ...L.spline(C([[13.0, 18.6], [13.3, 17.2], [13.4, 14.4], [13.15, 10.8], [12.4, 6.8], [11.1, 3.0], [8.9, -0.4], [6.2, -2.5], [3.8, -3.2], [2.2, -2.5], [1.6, -0.6], [1.7, 2.0], [1.9, 5.0], [2.05, 8.3], [3.4, 9.7], [5.2, 10.7], [5.6, 11.8], [4.7, 12.7], [3.5, 13.4], [3.0, duAt(3.0)]]), false, 8),
    ...baseSeg(3.0, 13.0),
  ];
  // 접촉 그늘: 허파가 가로막 위에 얹힌 자리
  ctx.save();
  ctx.filter = "blur(2.2px)";
  ctx.strokeStyle = "rgba(70,20,35,.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  L.poly(ctx, dUp.map(([x, y]) => [x, y + 1.6]), false);
  ctx.stroke();
  ctx.restore();
  // 틈새: 몸의 오른쪽 허파는 수평 틈새와 비스듬한 틈새(세 덩이), 왼쪽 허파는 비스듬한 틈새(두 덩이)
  const fisH = L.spline(C([[-2.4, 8.7], [-6.5, 9.0], [-10.4, 9.4], [-13.4, 9.8]]), false, 8);
  const fisOR = L.spline(C([[-13.4, 9.8], [-12.1, 11.2], [-10.8, 12.6], [-9.9, duAt(-9.9)]]), false, 8);
  const fisOL = L.spline(C([[13.3, 7.2], [11.8, 9.9], [10.6, 12.4], [10.0, duAt(10.0)]]), false, 8);

  // 숨관가지 나무(허파 안): 그림 오른쪽 허파(몸의 왼쪽)에서 비쳐 보이게
  const tree = [], tips = [];
  const edgeD = (pl, x, y) => {
    let m = 1e9;
    for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) {
      const [ax, ay] = pl[j], [bx, by] = pl[i];
      const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
      const u = P.clamp(((x - ax) * dx + (y - ay) * dy) / (l2 || 1));
      m = Math.min(m, Math.hypot(x - ax - u * dx, y - ay - u * dy));
    }
    return m;
  };
  const cenL = [X(8.2), Y(7.5)];
  const grow = (pl, p, ang, len, wd, depth) => {
    let a = ang, ln = len, q = null;
    for (let k = 0; k < 7; k++) {
      const x2 = p[0] + Math.cos(a) * ln, y2 = p[1] + Math.sin(a) * ln;
      if (L.inPoly(pl, x2, y2) && edgeD(pl, x2, y2) > wd + 1.8) {
        q = [x2, y2];
        break;
      }
      const ca = Math.atan2(cenL[1] - p[1], cenL[0] - p[0]);
      let dA = ca - a;
      while (dA > Math.PI) dA -= Math.PI * 2;
      while (dA < -Math.PI) dA += Math.PI * 2;
      a += dA * 0.3;
      ln *= 0.84;
    }
    if (!q) {
      tips.push(p);
      return;
    }
    const bend = R(-0.16, 0.16) * ln;
    const mid = [(p[0] + q[0]) / 2 - Math.sin(a) * bend, (p[1] + q[1]) / 2 + Math.cos(a) * bend];
    tree.push({ pts: L.spline([p, mid, q], false, 4), w: wd });
    if (wd < 0.78 || depth > 7) {
      tips.push(q);
      return;
    }
    const sp = R(0.36, 0.6), sk = R(-0.15, 0.15);
    grow(pl, q, a - sp + sk, ln * R(0.72, 0.86), wd * R(0.7, 0.78), depth + 1);
    grow(pl, q, a + sp + sk, ln * R(0.72, 0.86), wd * R(0.68, 0.76), depth + 1);
  };
  const D = (deg) => (deg * Math.PI) / 180;
  const lMainEnd = [X(3.2), Y(7.9)], rMainEnd = [X(-1.25), Y(7.7)];
  const lobL = [
    { pts: L.spline([lMainEnd, [X(3.8), Y(7.2)], [X(4.4), Y(6.8)]], false, 4), w: 4.0 },
    { pts: L.spline([lMainEnd, [X(3.8), Y(9.2)], [X(4.6), Y(10.5)]], false, 4), w: 4.0 },
  ];
  grow(LL, [X(4.4), Y(6.8)], D(-78), 2.4 * s, 3.0, 0);
  grow(LL, [X(4.4), Y(6.8)], D(-30), 2.3 * s, 2.8, 0);
  grow(LL, [X(4.4), Y(6.8)], D(8), 2.0 * s, 2.5, 0);
  grow(LL, [X(4.6), Y(10.5)], D(18), 2.0 * s, 2.5, 0);
  grow(LL, [X(4.6), Y(10.5)], D(55), 2.4 * s, 3.0, 0);
  grow(LL, [X(4.6), Y(10.5)], D(88), 2.0 * s, 2.5, 0);
  const airTube = { edge: "#B98686", base: "#F1D6D3", mid: "#FBEDEA", hi: "#FFFFFF", edgeW: 1.1 };
  // 몸의 오른쪽 허파로 들어가는 가지(허파 겉 아래로 숨는다): 허파보다 먼저 그린다
  L.tubes(t, [
    { pts: L.spline([rMainEnd, [X(-2.2), Y(7.2)], [X(-3.8), Y(6.6)]], false, 4), w: 4.2 },
    { pts: L.spline([rMainEnd, [X(-1.7), Y(8.8)], [X(-2.6), Y(10.4)]], false, 4), w: 4.8 },
  ], { ...airTube, edge: "#A87676" });

  const lungTex = (x, y) => {
    const n = nz.fbm(x * 0.09, y * 0.09, 4);
    const sp2 = nz.n2(x * 0.55, y * 0.55);
    return 0.94 + 0.09 * n + (sp2 > 0.62 ? -0.07 : 0);
  };
  const lungStyle = { color: "#E7979E", light: "#FFD9D9", dark: "#A8505F", blur: 6.5, relief: 1.05, spec: 0.22, gloss: 22, rim: 0.2, tex: lungTex, bounce: "#C9B4D6" };
  const cutStroke = (pls) => (c) => {
    c.lineWidth = 2.4;
    for (const pl of pls) {
      c.beginPath();
      L.poly(c, pl, false);
      c.stroke();
    }
  };
  L.pillow(t, L.bbox(RL), (c) => L.poly(c, RL), { ...lungStyle, cut: cutStroke([fisH, fisOR]), alpha: 0.98 });
  L.pillow(t, L.bbox(LL), (c) => L.poly(c, LL), { ...lungStyle, cut: cutStroke([fisOL]), alpha: 0.92 });
  {
    const T = L.layer(t);
    L.tubes(T, [...lobL, ...tree], { ...airTube });
    T.ctx.save();
    T.ctx.globalCompositeOperation = "destination-in";
    T.ctx.beginPath();
    L.poly(T.ctx, LL);
    T.ctx.fill();
    T.ctx.restore();
    L.put(t, T, 0.84);
    L.pillow(t, L.bbox(LL), (c) => L.poly(c, LL), { ...lungStyle, tex: undefined, alpha: 0.14, edgeAlpha: 0.55, spec: 0.3, cut: cutStroke([fisOL]) });
  }
  for (const pl of [fisH, fisOR, fisOL]) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(122,40,56,.55)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    L.poly(ctx, pl, false);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,226,226,.6)";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    L.poly(ctx, pl.map(([x, y]) => [x + 0.6, y + 0.9]), false);
    ctx.stroke();
    ctx.restore();
  }

  // ── 숨관과 두 갈래 숨관가지(고리가 층층이). 몸의 오른쪽 숨관가지가 더 굵고 짧고 곧다 ──
  const bronchi = [
    { pts: L.spline([[X(-0.45), Y(5.1)], [X(-0.85), Y(6.4)], rMainEnd], false, 6), w: 7.4 },
    { pts: L.spline([[X(0.45), Y(5.1)], [X(1.8), Y(6.5)], lMainEnd], false, 6), w: 6.2 },
  ];
  L.tubes(t, bronchi, { ...airTube, edge: "#A87676" });
  L.bronchusRings(ctx, bronchi);
  L.trachea(t, X, Y, s);

  // ── 머리 속 공기 길: 코안 → 목구멍 → 후두 → 숨관 ──
  const hx = BX, hy = (cm) => TOP + cm * s;
  L.headAirway(t, BX, TOP, s);

  // ── 확대 원 1: 가장 가는 숨관가지 끝에 포도송이처럼 달린 허파꽈리 ──
  const tip = tips.filter(([x, y]) => x > X(8.5) && x < X(11.8) && y > Y(1.5) && y < Y(6.5)).sort((a, b) => b[0] - a[0])[0] ?? [X(10.5), Y(3.5)];
  const mk = { x: tip[0], y: tip[1], r: 5.5 };
  const Z1 = { x: 274, y: 94, r: 62 };
  L.zoomWedge(t, mk, Z1);
  const alvC = "#F0A3AB";
  let sacs = [];
  L.zoomCircle(t, Z1.x, Z1.y, Z1.r, () => {
    const br = L.spline([[Z1.x - 74, Z1.y - 50], [Z1.x - 44, Z1.y - 30], [Z1.x - 22, Z1.y - 12]], false, 8);
    const ducts = [
      L.spline([[Z1.x - 22, Z1.y - 12], [Z1.x - 2, Z1.y - 22], [Z1.x + 14, Z1.y - 30]], false, 6),
      L.spline([[Z1.x - 22, Z1.y - 12], [Z1.x - 2, Z1.y + 0], [Z1.x + 14, Z1.y + 6]], false, 6),
      L.spline([[Z1.x - 22, Z1.y - 12], [Z1.x - 18, Z1.y + 10], [Z1.x - 10, Z1.y + 26]], false, 6),
    ];
    L.tubes(t, [{ pts: br, w: 13 }, ...ducts.map((d) => ({ pts: d, w: 7 }))], { ...airTube, edge: "#B07878" });
    // 관 끝마다 꽈리가 모인 송이(작은 공기주머니가 빽빽이)
    const bunch = (cx, cy, n, rr, spread, seed) => {
      const g = N.rng(seed);
      const pts = [];
      for (let k = 0; k < n * 40 && pts.length < n; k++) {
        const a = g() * L.TAU, d = Math.sqrt(g()) * spread;
        const px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d;
        if (pts.every((q) => Math.hypot(q[0] - px, q[1] - py) > rr * 1.16)) pts.push([px, py, rr * (0.92 + g() * 0.16)]);
      }
      pts.sort((a, b) => a[1] + a[0] * 0.2 - (b[1] + b[0] * 0.2));
      // 송이 아래 그늘
      P.softShadow(t, cx + 3, cy + spread * 0.55, spread * 1.15, spread * 0.5, 0.16, "#7A3040");
      for (const [px, py, r0] of pts) {
        L.bubble(t, px, py, r0, alvC, { alpha: 0.86, edgeAlpha: 1, spec: 0.55, gloss: 30, rim: 0.28, ambient: 0.3 });
        ctx.save();
        ctx.strokeStyle = "rgba(150,60,78,.35)";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(px, py, r0 - 0.3, 0, L.TAU);
        ctx.stroke();
        ctx.restore();
      }
      return pts;
    };
    const b1 = bunch(Z1.x + 22, Z1.y - 34, 15, 6.0, 14, 3);
    const b2 = bunch(Z1.x + 24, Z1.y + 9, 15, 6.0, 14, 5);
    const b3 = bunch(Z1.x - 6, Z1.y + 36, 14, 5.8, 13, 8);
    // 관 벽에도 꽈리가 몇 개 붙어 있다
    for (const [d, q] of [[0, 0.55], [1, 0.5], [2, 0.6]]) {
      const p = L.along(ducts[d], q);
      const nx = -Math.sin(p.ang), ny = Math.cos(p.ang);
      L.bubble(t, p.x + nx * 6.4, p.y + ny * 6.4, 4.4, alvC, { alpha: 0.86, edgeAlpha: 1, spec: 0.5, gloss: 30 });
    }
    sacs = [b1, b2, b3];
  }, { bg: [[0, "#FFFFFF"], [1, "#F3EEF1"]] });
  L.marker(ctx, mk.x, mk.y, mk.r);

  // ── 확대 원 2: 허파꽈리를 덮은 모세혈관 그물(들어오는 쪽 파랑, 나가는 쪽 빨강), 관 속 적혈구 ──
  const pick = sacs[1].reduce((m, q) => (q[0] > m[0] ? q : m), sacs[1][0]);
  const mk2 = { x: Z1.x + 24, y: Z1.y + 9, r: 14 };
  const Z2 = { x: 276, y: 280, r: 60 };
  L.zoomWedge(t, mk2, Z2);
  const BLUE = "#4E6FD6", RED = "#E2404E";
  const al = [
    [Z2.x - 19, Z2.y - 21, 25],
    [Z2.x + 24, Z2.y - 15, 24],
    [Z2.x - 14, Z2.y + 27, 23],
    [Z2.x + 26, Z2.y + 29, 21],
  ];
  L.zoomCircle(t, Z2.x, Z2.y, Z2.r, () => {
    for (const [ax, ay, ar] of al) {
      P.softShadow(t, ax + 3, ay + 4, ar * 1.02, ar * 0.9, 0.14, "#7A3040");
      L.bubble(t, ax, ay, ar, "#F5B6BC", { alpha: 0.92, edgeAlpha: 1, spec: 0.35, gloss: 20, rim: 0.2, ambient: 0.3 });
    }
    // 그물: 꽈리 겉의 칸(보로노이) 경계를 가는 관으로
    const seeds = [];
    const rs = N.rng(21);
    for (const [ax, ay, ar] of al)
      for (let k = 0; k < 34; k++) {
        const a = rs() * L.TAU, d = Math.sqrt(rs()) * ar * 1.02;
        seeds.push([ax + Math.cos(a) * d, ay + Math.sin(a) * d]);
      }
    const near = N.makeCells(seeds, 12);
    const cb = P.lin(P.hex(BLUE)), cr = P.lin(P.hex(RED));
    P.shade(t, { x: Z2.x - Z2.r, y: Z2.y - Z2.r, w: 2 * Z2.r, h: 2 * Z2.r }, (x, y) => {
      let best = null;
      for (const [ax, ay, ar] of al) {
        const dd = Math.hypot(x - ax, y - ay) / ar;
        if (dd < 1 && (!best || dd < best.dd)) best = { dd, ax, ay, ar };
      }
      if (!best) return null;
      const q = near(x, y);
      const e = q.d2 - q.d1;
      const wd = 1.25 + 0.25 * (1 - best.dd);
      if (e > wd) return null;
      const u = e / wd;
      const nzz = Math.sqrt(Math.max(0, 1 - u * u));
      const f = P.smooth(Z2.x - 38, Z2.x + 38, x + (y - Z2.y) * 0.1);
      const col = P.mixc(cb, cr, f);
      const sph = Math.sqrt(Math.max(0, 1 - best.dd * best.dd));
      const lit2 = 0.55 + 0.45 * nzz * (0.5 + 0.5 * sph) + 0.18 * P.clamp((-(x - best.ax) / best.ar) * 0.5 - ((y - best.ay) / best.ar) * 0.6);
      const o = P.srgb(col.map((v) => v * lit2 * 1.25));
      return [o[0], o[1], o[2], P.clamp((1 - u) * 3) * (0.55 + 0.45 * sph)];
    });
    // 적혈구(관 속 작은 원반)
    let n = 0;
    const rr = N.rng(31);
    for (let k = 0; k < 1400 && n < 28; k++) {
      const x = Z2.x - Z2.r + rr() * 2 * Z2.r, y = Z2.y - Z2.r + rr() * 2 * Z2.r;
      if (!al.some(([ax, ay, ar]) => Math.hypot(x - ax, y - ay) < ar * 0.85)) continue;
      const q = near(x, y);
      if (q.d2 - q.d1 > 0.35) continue;
      ctx.fillStyle = "rgba(196,28,44,.92)";
      ctx.beginPath();
      ctx.ellipse(x, y, 1.35, 0.95, rr() * 3, 0, L.TAU);
      ctx.fill();
      n++;
    }
    // 들어오는 가는 혈관(파랑)은 왼쪽에서 그물로 갈라져 들어가고, 나가는 가는 혈관(빨강)은 오른쪽에서 모여 나간다
    const inV = [
      { pts: L.spline([[Z2.x - 40, Z2.y + 3], [Z2.x - 37, Z2.y - 6], [Z2.x - 31, Z2.y - 13], [Z2.x - 26, Z2.y - 17]], false, 6), w: 3.2 },
      { pts: L.spline([[Z2.x - 40, Z2.y + 3], [Z2.x - 36, Z2.y + 11], [Z2.x - 30, Z2.y + 17], [Z2.x - 25, Z2.y + 20]], false, 6), w: 3.2 },
      { pts: L.spline([[Z2.x - 76, Z2.y + 9], [Z2.x - 56, Z2.y + 5], [Z2.x - 40, Z2.y + 3]], false, 6), w: 6.4 },
    ];
    const outV = [
      { pts: L.spline([[Z2.x + 27, Z2.y - 13], [Z2.x + 33, Z2.y - 8], [Z2.x + 37, Z2.y - 1], [Z2.x + 39, Z2.y + 4]], false, 6), w: 3.2 },
      { pts: L.spline([[Z2.x + 27, Z2.y + 21], [Z2.x + 33, Z2.y + 15], [Z2.x + 37, Z2.y + 9], [Z2.x + 39, Z2.y + 4]], false, 6), w: 3.2 },
      { pts: L.spline([[Z2.x + 39, Z2.y + 4], [Z2.x + 56, Z2.y + 0], [Z2.x + 78, Z2.y - 8]], false, 6), w: 6.4 },
    ];
    L.tubes(t, inV, { edge: "#2E4592", base: BLUE, mid: "#7F97E6", hi: "#D5DEFA" });
    L.tubes(t, outV, { edge: "#9A2230", base: RED, mid: "#F27A84", hi: "#FFD7DA" });
  }, { bg: [[0, "#FFFFFF"], [1, "#F4EEF0"]] });
  L.marker(ctx, mk2.x, mk2.y, mk2.r);
  void pick;

  // ── 겹층: 흐름 화살표와 라벨 ──
  const sv = S.svgLayer(root, w, h);
  S.rayArrow(sv, [Z2.x - 59, Z2.y + 13], [Z2.x - 44, Z2.y + 10], { color: "#2E4592", w: 1.5, hl: 5.5, hw: 3.4 });
  S.rayArrow(sv, [Z2.x + 44, Z2.y + 9], [Z2.x + 59, Z2.y + 4], { color: "#9A2230", w: 1.5, hl: 5.5, hw: 3.4 });
  // 공기가 콧구멍으로
  S.fatArrow(sv, L.spline([[hx - 44, hy(21.6)], [hx - 22, hy(20.4)], [hx - 5.5, hy(17.6)]], false, 8), { fill: "#4DABF7", w0: 3, w1: 5, head: 8, hw: 6.5 });

  const lab = (x, y, text, pts, o = {}) => {
    if (pts) S.leader(sv, pts);
    S.label(sv, x, y, text, { size: 14, ...o });
  };
  lab(150, hy(13.2), "코", [[148, hy(12.3)], [hx + 5.5, hy(14.4)]], { anchor: "start" });
  lab(48, Y(-6.4), "숨관", [[50, Y(-7.1)], [X(-1.1), Y(-2.4)]], { anchor: "end" });
  lab(138, Y(-6.8), "숨관가지", [[146, Y(-5.6)], [X(2.4), Y(6.8)]], { anchor: "start" });
  lab(6, Y(4.6), "허파", [[22, Y(5.8)], [X(-10.8), Y(5.6)]], { anchor: "start" });
  const r7 = L.ribAt(L.RIBS[6]);
  lab(6, Y(20.6), "갈비뼈", [[26, Y(18.0)], [X(-r7.W + 0.3), Y(r7.yl + 0.6)]], { anchor: "start" });
  lab(6, Y(26.8), "가로막", [[28, Y(25.6)], [X(-8.4), Y(15.2)]], { anchor: "start" });
  // 확대 원의 라벨
  const sac = sacs[2].reduce((m, q) => (q[0] + q[1] * 0.4 > m[0] + m[1] * 0.4 ? q : m), sacs[2][0]);
  lab(Z1.x + 2, Z1.y + Z1.r + 22, "허파꽈리", [[Z1.x + 8, Z1.y + Z1.r + 9], [sac[0] + 1, sac[1] + 1]], { anchor: "middle" });
  lab(Z2.x - 4, Z2.y + Z2.r + 22, "모세혈관", [[Z2.x + 4, Z2.y + Z2.r + 8], [Z2.x + 11, Z2.y + 40]], { anchor: "middle" });
}
