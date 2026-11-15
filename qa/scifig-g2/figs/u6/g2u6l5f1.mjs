// g2u6l5f1 배설계의 자리: 앞에서 비춰 본 몸통(성별이 드러나지 않는 실루엣, 등뼈와 아래쪽 갈비뼈와 골반이 뒤로 비침)과 작은 옆모습.
// 콩팥은 허리 높이(맨 아래 갈비뼈 언저리)에서 등뼈 양옆에 하나씩, 몸의 오른쪽(그림 왼쪽)이 조금 낮다. 오줌관 → 방광 → 요도.
// 대동맥(몸의 왼쪽)과 대정맥(몸의 오른쪽)에서 콩팥으로 드나드는 혈관은 이름 없이. 검산 메모는 g2u6l5f1.md
import * as L from "./_lib.mjs";

export const meta = {
  key: "g2u6l5f1",
  w: 340,
  h: 366,
  alt: "앞에서 비춰 본 몸통. 허리 높이의 등뼈 양옆에 콩팥이 하나씩 있고(그림 왼쪽인 몸의 오른쪽이 조금 낮아요) 오줌관이 골반 속 방광으로 이어지며, 옆모습에서는 콩팥이 창자보다 등 쪽에 있어요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(57);

  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 앞모습: 6 px = 1 cm. 세로 v(cm)는 목 아래 패인 곳에서 아래로 ──
  const s = 6, cx = 104;
  const X = (u) => cx + u * s, Y = (v) => 18 + (v - 6) * s;
  const C = (pts) => pts.map(([u, v]) => [X(u), Y(v)]);
  const mirror = (half) => [...half, ...half.slice().reverse().map(([u, v]) => [-u, v])];
  const fadeV = (v) => P.smooth(4.2, 10, v) * (1 - P.smooth(55, 60.5, v));

  // 몸통(팔 없이, 허벅지 윗부분까지)
  const torsoHalf = [[17.0, 3.6], [16.6, 8], [16.1, 13], [15.7, 18], [15.0, 24], [14.2, 29], [13.9, 33], [14.5, 37.5], [15.9, 42.5], [16.7, 47], [16.6, 51], [15.9, 55], [15.0, 59], [14.8, 61.5]];
  const torso = [
    ...L.spline(C(torsoHalf), false, 8),
    ...L.spline(C([[14.8, 61.5], [2.8, 61.5], [2.4, 58], [1.3, 55.3], [0, 54.7], [-1.3, 55.3], [-2.4, 58], [-2.8, 61.5], [-14.8, 61.5]]), false, 4),
    ...L.spline(C(torsoHalf.slice().reverse().map(([u, v]) => [-u, v])), false, 8),
  ];
  L.pillow(t, L.bbox(torso), (c) => L.poly(c, torso), {
    color: "#F3D2BE", light: "#FDF1E8", dark: "#D7A68C", blur: 12, relief: 0.75, alpha: 0.6, edgeAlpha: 0.95, spec: 0.06, rim: 0.1,
    alphaFn: (x, y) => fadeV((y - 18) / s + 6),
  });

  // ── 뒤로 비치는 뼈: 등뼈(가슴 아래쪽과 허리), 아래쪽 갈비뼈, 골반과 넙다리뼈 머리 ──
  const VT = (k) => L.RIBS[k - 1].yp; // 등뼈 마디의 높이(가슴 쪽)
  const lum = [23.4, 26.2, 29.0, 31.8, 34.6];
  const bone = L.layer(t);
  {
    const c = bone.ctx;
    c.lineCap = "round";
    c.lineJoin = "round";
    const block = (u0, v0, ww, hh, r = 2.4) => {
      c.beginPath();
      c.roundRect(X(u0), Y(v0), ww * s, hh * s, r);
      c.fill();
      c.stroke();
    };
    c.fillStyle = "#EDE3CF";
    c.strokeStyle = "rgba(140,118,86,.7)";
    c.lineWidth = 0.8;
    for (const k of [8, 9, 10, 11, 12]) {
      const wv = 1.5 + (k - 8) * 0.12;
      block(-wv, VT(k) - 1.0, 2 * wv, 2.0);
    }
    lum.forEach((v, i) => {
      const wv = 2.0 + i * 0.13;
      // 가로돌기(옆으로 뻗은 돌기)
      c.beginPath();
      c.roundRect(X(-wv - 2.5), Y(v - 0.4), (2 * wv + 5) * s, 0.8 * s, 2);
      c.fill();
      c.stroke();
      block(-wv, v - 1.15, 2 * wv, 2.3);
    });
    // 아래쪽 갈비뼈(뒤 활): 8~12번
    for (const r of L.RIBS.filter((q) => q.k >= 8))
      for (const sd of [-1, 1]) {
        const pr = L.ribParts(r, sd, L.RIBS);
        for (const [pts, col, lw] of [[pr.back, "rgba(140,118,86,.6)", 0.9 * s + 1], [pr.back, "#EDE3CF", 0.9 * s], [pr.front, "rgba(140,118,86,.6)", 0.9 * s + 1], [pr.front, "#F1E9D8", 0.9 * s]]) {
          c.strokeStyle = col;
          c.lineWidth = lw;
          c.beginPath();
          L.poly(c, C(pts), false);
          c.stroke();
        }
        if (pr.cart) {
          c.strokeStyle = "rgba(110,135,155,.55)";
          c.lineWidth = 0.9 * s + 1;
          c.beginPath();
          L.poly(c, C(pr.cart), false);
          c.stroke();
          c.strokeStyle = "#E1EAF0";
          c.lineWidth = 0.9 * s;
          c.beginPath();
          L.poly(c, C(pr.cart), false);
          c.stroke();
        }
      }
    // 엉치뼈와 꼬리뼈
    c.fillStyle = "#EDE3CF";
    c.strokeStyle = "rgba(140,118,86,.7)";
    c.beginPath();
    L.poly(c, L.spline(C([[0, 35.9], [4.6, 36.1], [3.8, 40.0], [2.0, 43.6], [0.7, 45.6], [-0.7, 45.6], [-2.0, 43.6], [-3.8, 40.0], [-4.6, 36.1]]), true, 6));
    c.fill();
    c.stroke();
    // 엉덩뼈(날개), 두덩뼈, 궁둥뼈: 바깥 윤곽 안에 폐쇄 구멍을 뚫는다. 안쪽 둘레(골반 입구)는 선으로
    for (const sd of [-1, 1]) {
      const m = (pts) => C(pts.map(([u, v]) => [sd * u, v]));
      const outer = L.spline(m([[4.3, 35.6], [5.6, 33.0], [8.2, 31.0], [11.2, 30.3], [13.4, 31.0], [14.4, 32.6], [14.2, 34.6], [13.2, 36.4], [12.4, 37.4], [12.1, 38.8], [12.0, 40.8], [12.5, 42.6], [11.8, 44.8], [10.1, 47.0], [8.2, 48.5], [6.3, 48.8], [4.4, 48.4], [2.2, 48.3], [0.6, 47.9], [0.6, 45.8], [2.6, 45.4], [5.0, 44.7], [7.0, 43.4], [7.6, 41.4], [7.0, 39.2], [5.6, 37.2], [4.3, 36.2]]), true, 6);
      const hole = L.spline(m([[4.0, 46.6], [5.6, 45.8], [7.6, 46.2], [7.6, 47.4], [5.6, 47.9]]), true, 6);
      c.beginPath();
      L.poly(c, outer);
      L.poly(c, hole);
      c.fill("evenodd");
      c.stroke();
      // 넙다리뼈 머리와 목(아래는 옅어진다)
      c.beginPath();
      c.arc(X(sd * 10.4), Y(43.4), 2.0 * s, 0, L.TAU);
      c.fill();
      c.stroke();
      c.beginPath();
      L.poly(c, L.spline(m([[11.4, 42.4], [13.6, 44.2], [14.4, 46.6], [13.8, 50.5], [13.4, 55], [11.4, 55], [11.6, 50.2], [11.4, 47.2], [9.8, 45.2]]), true, 6));
      c.fill();
      c.stroke();
    }
    // 아래쪽은 몸과 함께 흐리게
    c.save();
    c.globalCompositeOperation = "destination-in";
    c.fillStyle = P.lg(c, 0, Y(48), 0, Y(57), [[0, "rgba(0,0,0,1)"], [1, "rgba(0,0,0,0)"]]);
    c.fillRect(0, 0, w, h);
    c.restore();
  }
  L.put(t, bone, 0.4);

  // ── 콩팥(강낭콩 모양, 오목한 쪽이 안쪽). 몸의 오른쪽(그림 왼쪽)이 1.5 cm 낮다. 위 끝이 안쪽으로 조금 기운다 ──
  const kid = (side, cu, cv) => {
    const ang = side * 0.2; // 아래 끝이 바깥으로
    const a = 5.5, b = 2.95;
    const toW = ([lx, ly]) => {
      const ux = Math.cos(ang) * lx - Math.sin(ang) * ly, uy = Math.sin(ang) * lx + Math.cos(ang) * ly;
      return [X(cu + side * ux), Y(cv + uy)];
    };
    const pts = [];
    for (let i = 0; i < 72; i++) {
      const th = (i / 72) * L.TAU;
      let lx = b * Math.cos(th), ly = a * Math.sin(th);
      // 안쪽(-x)의 오목한 문(콩팥문)
      const inner = Math.max(0, -Math.cos(th));
      lx += 1.05 * Math.exp(-(((Math.sin(th) - 0.06) / 0.24) ** 2)) * inner * inner;
      // 위쪽은 조금 넓고 아래쪽은 조금 좁게
      lx *= 1 - 0.05 * Math.sin(th);
      pts.push(toW([lx, ly]));
    }
    const hil = toW([-b + 0.9, 0.35]);
    return { pts, hil, toW };
  };
  // ── 큰 혈관: 대동맥(몸의 왼쪽, 그림 오른쪽)과 대정맥(몸의 오른쪽, 그림 왼쪽), 아래에서 다리 쪽으로 갈라진다 ──
  const RED = "#E2404E", BLUE = "#4E6FD6";
  const art = { edge: "#9A2230", base: RED, mid: "#F27A84", hi: "#FFD7DA" };
  const ven = { edge: "#2E4592", base: BLUE, mid: "#7F97E6", hi: "#D5DEFA" };
  const vfade = (L0) => {
    // 위아래 끝을 몸과 함께 흐리게
    L0.ctx.save();
    L0.ctx.globalCompositeOperation = "destination-in";
    L0.ctx.fillStyle = P.lg(L0.ctx, 0, Y(9), 0, Y(52), [[0, "rgba(0,0,0,0)"], [0.16, "rgba(0,0,0,1)"], [0.66, "rgba(0,0,0,1)"], [1, "rgba(0,0,0,0)"]]);
    L0.ctx.fillRect(0, 0, w, h);
    L0.ctx.restore();
  };
  const tubeSet = (segs, st, alpha = 1) => {
    const T = L.layer(t);
    L.tubes(T, segs, st);
    vfade(T);
    L.put(t, T, alpha);
  };
  // 몸의 오른쪽 콩팥으로 가는 혈관은 대정맥 뒤로 지나간다(먼저 그린다)
  const KL = kid(1, 6.3, 24.8), KR = kid(-1, -6.4, 26.3);
  tubeSet([{ pts: L.spline([[X(1.0), Y(24.3)], [X(-1.6), Y(25.2)], [X(-3.2), Y(25.9)], KR.hil.map((q, i) => q + (i ? -3 : 1))], false, 6), w: 0.62 * s }], art);
  // 대정맥과 엉덩 정맥(대동맥보다 뒤)
  tubeSet([
    { pts: L.spline(C([[-2.3, 9], [-2.3, 20], [-2.2, 28], [-1.9, 34.4]]), false, 8), w: 2.4 * s },
    { pts: L.spline(C([[-1.9, 34.2], [-4.4, 37.6], [-6.8, 42.4], [-8.3, 48], [-8.9, 54]]), false, 8), w: 1.3 * s },
    { pts: L.spline(C([[-1.6, 34.2], [2.8, 37.4], [6.4, 42.6], [7.9, 48], [8.5, 54]]), false, 8), w: 1.3 * s },
  ], ven);
  // 대동맥과 엉덩 동맥
  tubeSet([
    { pts: L.spline(C([[1.4, 9], [1.4, 20], [1.3, 27], [0.9, 31.6]]), false, 8), w: 2.1 * s },
    { pts: L.spline(C([[0.9, 31.4], [-2.6, 35.8], [-6.0, 41.4], [-7.6, 47.6], [-8.2, 54]]), false, 8), w: 1.1 * s },
    { pts: L.spline(C([[1.0, 31.4], [3.8, 36.2], [6.8, 41.6], [8.4, 47.6], [9.0, 54]]), false, 8), w: 1.1 * s },
  ], art);

  // 콩팥 혈관(이름 없이): 대동맥에서 콩팥으로(빨강), 콩팥에서 대정맥으로(파랑). 몸의 왼쪽 정맥은 대동맥 앞을 지난다
  tubeSet([{ pts: L.spline([[X(1.6), Y(24.0)], [X(2.8), Y(24.2)], KL.hil.map((q, i) => q + (i ? -3 : -1))], false, 6), w: 0.62 * s }], art);
  tubeSet([
    { pts: L.spline([KL.hil.map((q, i) => q + (i ? 1 : -1)), [X(2.4), Y(25.3)], [X(0.4), Y(25.0)], [X(-1.6), Y(24.9)]], false, 6), w: 0.8 * s },
    { pts: L.spline([KR.hil.map((q, i) => q + (i ? 1 : 1)), [X(-3.4), Y(26.7)], [X(-2.4), Y(26.4)]], false, 6), w: 0.8 * s },
  ], ven);
  // 오줌관(콩팥깔때기에서 방광까지, 오줌 길은 노랑)
  const URE = { edge: "#A7822E", base: "#E8C86E", mid: "#F5E0A0", hi: "#FFFAE6", edgeW: 0.9 };
  const ureL = L.spline([[KL.hil[0] - 1, KL.hil[1] + 4], [X(3.9), Y(29.4)], [X(3.6), Y(33.4)], [X(4.0), Y(36.8)], [X(5.0), Y(40.0)], [X(5.1), Y(42.8)], [X(3.9), Y(45.0)], [X(2.4), Y(46.0)]], false, 8);
  const ureR = L.spline([[KR.hil[0] + 1, KR.hil[1] + 4], [X(-4.0), Y(31.0)], [X(-3.7), Y(34.6)], [X(-4.2), Y(37.8)], [X(-5.2), Y(40.8)], [X(-5.2), Y(43.3)], [X(-4.0), Y(45.2)], [X(-2.5), Y(46.2)]], false, 8);
  L.tubes(t, [{ pts: ureL, w: 0.55 * s }, { pts: ureR, w: 0.55 * s }], URE);
  // 콩팥(입체): 겉은 붉은 갈색, 매끈한 막
  for (const K of [KL, KR]) {
    P.softShadow(t, K.hil[0] + (K === KL ? 8 : -8), K.hil[1] + 8, 3.2 * s, 5 * s, 0.14, "#5A2A2A");
    L.pillow(t, L.bbox(K.pts), (c) => L.poly(c, K.pts), {
      color: "#B4524C", light: "#EEA592", dark: "#6A2427", blur: 6.5, relief: 1.1, spec: 0.42, gloss: 34, rim: 0.22, bounce: "#D9B7C4",
      tex: (x, y) => 0.96 + 0.06 * nz.fbm(x * 0.12, y * 0.12, 3),
    });
    // 콩팥깔때기(문에서 나와 오줌관으로)
    const sd = K === KL ? 1 : -1;
    const fun = L.spline([[K.hil[0] + sd * 4, K.hil[1] - 4], [K.hil[0] - sd * 1.5, K.hil[1] - 2], [K.hil[0] - sd * 2.4, K.hil[1] + 3], [K.hil[0] - sd * 0.6, K.hil[1] + 5.5], [K.hil[0] + sd * 4.2, K.hil[1] + 3.6]], true, 6);
    L.pillow(t, L.bbox(fun), (c) => L.poly(c, fun), { color: "#E3C06A", light: "#FFF0C0", dark: "#A57F2C", blur: 2.2, spec: 0.3 });
  }
  // 방광(골반 속 앞쪽, 오줌이 고여 노란빛이 비친다)과 요도
  L.tubes(t, [{ pts: L.spline([[X(0), Y(49.2)], [X(0), Y(51.5)], [X(0), Y(54.1)]], false, 6), w: 0.6 * s }], URE);
  const blad = L.spline(C([[0, 42.3], [2.5, 42.6], [3.9, 43.9], [4.1, 45.8], [3.3, 47.6], [1.6, 48.9], [0.5, 49.6], [-0.5, 49.6], [-1.6, 48.9], [-3.3, 47.6], [-4.1, 45.8], [-3.9, 43.9], [-2.5, 42.6]]), true, 8);
  P.softShadow(t, X(0.6), Y(49), 3.6 * s, 1.1 * s, 0.14, "#5A3A20");
  L.pillow(t, L.bbox(blad), (c) => L.poly(c, blad), {
    color: "#E9B58C", light: "#FFEBD6", dark: "#A46A47", blur: 7, relief: 1.0, spec: 0.5, gloss: 30, rim: 0.22, alpha: 0.95,
    tex: (x, y) => {
      // 근육 벽의 옅은 결
      const f = 0.5 + 0.5 * Math.sin((x - X(0)) * 0.9 + nz.n2(x * 0.08, y * 0.08) * 3);
      return 0.95 + 0.06 * f;
    },
  });

  // ── 옆모습: 4 px = 1 cm, 앞모습의 왼쪽 콩팥 가운데와 같은 높이에 맞춘다. 배 쪽이 왼쪽, 등 쪽이 오른쪽 ──
  const ss = 4, cs = 280;
  const Xs = (u) => cs + u * ss, Ys = (v) => Y(24.8) + (v - 24.8) * ss;
  const Cs = (pts) => pts.map(([u, v]) => [Xs(u), Ys(v)]);
  const side = [
    ...L.spline(Cs([[-10.4, 4.6], [-11.2, 10], [-11.4, 15], [-10.7, 20], [-10.2, 25], [-10.7, 30], [-10.4, 35], [-9.4, 40], [-8.3, 44.5], [-7.7, 48.5], [-8.3, 53], [-8.6, 58.5]]), false, 8),
    ...L.spline(Cs([[-8.6, 58.5], [-8.6, 61], [7.6, 61], [7.8, 58.5]]), false, 2),
    ...L.spline(Cs([[7.8, 58.5], [9.6, 54], [12.4, 50.4], [13.5, 46], [12.6, 41.6], [10.3, 37.6], [8.8, 33.2], [8.6, 29], [9.3, 24], [10.3, 19], [10.9, 14], [11.0, 9], [10.8, 4.6]]), false, 8),
  ];
  L.pillow(t, L.bbox(side), (c) => L.poly(c, side), {
    color: "#F3D2BE", light: "#FDF1E8", dark: "#D7A68C", blur: 9, relief: 0.75, alpha: 0.6, edgeAlpha: 0.95, spec: 0.06,
    alphaFn: (x, y) => P.smooth(Ys(4.6), Ys(10.5), y) * (1 - P.smooth(Ys(55), Ys(61), y)),
  });
  // 창자(배 속): 한 가닥 관이 구불구불 접혀 쌓인 덩어리. 콩팥보다 배 쪽
  {
    const gutShape = L.spline(Cs([[-9.8, 25.4], [-6.4, 23.9], [-2.4, 24.3], [0.5, 26.4], [1.1, 31], [0.7, 36.4], [-1.0, 40.6], [-4.0, 42.7], [-7.7, 42.1], [-9.9, 38.4], [-10.3, 31.6]]), true, 8);
    L.pillow(t, L.bbox(gutShape), (c) => L.poly(c, gutShape), { color: "#D99C9A", light: "#F6CFCB", dark: "#9C5A5E", blur: 4, relief: 0.6, alpha: 0.5, spec: 0.05 });
    const g = L.layer(t);
    const rr = N.rng(12);
    const path = [];
    const rows = 7;
    for (let k = 0; k < rows; k++) {
      const v = 25.6 + k * 2.45;
      const dir = k % 2 ? -1 : 1;
      const u0 = -9.4, u1 = 0.2 - Math.abs(k - 3) * 0.35;
      for (let q = 0; q <= 8; q++) {
        const f = dir > 0 ? q / 8 : 1 - q / 8;
        path.push([u0 + (u1 - u0) * f + (rr() - 0.5) * 0.5, v + Math.sin(f * Math.PI * 3 + k) * 0.55 + (rr() - 0.5) * 0.3]);
      }
    }
    const segs = [];
    const pts = L.spline(Cs(path), false, 5);
    for (let i = 0; i < pts.length - 1; i += 6) segs.push({ pts: pts.slice(i, Math.min(pts.length, i + 7)), w: 2.1 * ss });
    L.tubes(g, segs, { edge: "#B97273", base: "#EFB9B4", mid: "#F9D6D2", hi: "#FFF3F1", edgeW: 0.9 });
    g.ctx.save();
    g.ctx.globalCompositeOperation = "destination-in";
    g.ctx.beginPath();
    L.poly(g.ctx, gutShape);
    g.ctx.fill();
    g.ctx.restore();
    L.put(t, g, 0.85);
  }
  // 등뼈(옆에서): 등 쪽으로 휜 가슴 마디, 배 쪽으로 휜 허리 마디, 엉치뼈
  {
    const g = L.layer(t);
    const gc = g.ctx;
    gc.fillStyle = "#EDE3CF";
    gc.strokeStyle = "rgba(140,118,86,.75)";
    gc.lineWidth = 0.7;
    const col = [[6.2, 12.4], [5.9, 15.0], [5.6, 17.6], [5.2, 20.4], [4.6, 23.2], [4.0, 26.0], [3.6, 28.9], [3.6, 31.8], [4.1, 34.6]];
    col.forEach(([u, v], i) => {
      const hh = i < 4 ? 2.1 : 2.4, dd = i < 4 ? 3.0 : 3.6;
      gc.beginPath();
      gc.roundRect(Xs(u - dd / 2), Ys(v - hh / 2), dd * ss, hh * ss, 2);
      gc.fill();
      gc.stroke();
      // 가시돌기(등 쪽으로)
      gc.beginPath();
      gc.roundRect(Xs(u + dd / 2), Ys(v - 0.5), 2.6 * ss, 1.0 * ss, 1.4);
      gc.fill();
      gc.stroke();
    });
    gc.beginPath();
    L.poly(gc, L.spline(Cs([[3.0, 36.2], [6.4, 35.8], [8.4, 39], [9.6, 43.2], [9.0, 45.4], [7.4, 43.6], [5.0, 40.0]]), true, 6));
    gc.fill();
    gc.stroke();
    // 아래쪽 갈비뼈 셋(등에서 옆구리로 휘어 내려간다)
    gc.lineCap = "round";
    for (const [pts, lw] of [[[[7.6, 15.2], [3.0, 17.4], [-3, 20.0], [-7.4, 21.6]], 1.0], [[[7.8, 17.6], [4.4, 20.0], [0.4, 22.6], [-2.6, 24.0]], 0.95], [[[7.8, 20.0], [5.4, 22.0], [2.8, 23.8]], 0.9]]) {
      const pl = L.spline(Cs(pts), false, 8);
      gc.strokeStyle = "rgba(140,118,86,.7)";
      gc.lineWidth = lw * ss + 1;
      gc.beginPath();
      L.poly(gc, pl, false);
      gc.stroke();
      gc.strokeStyle = "#EDE3CF";
      gc.lineWidth = lw * ss;
      gc.beginPath();
      L.poly(gc, pl, false);
      gc.stroke();
    }
    // 두덩뼈(앞 아래)
    gc.beginPath();
    L.poly(gc, L.spline(Cs([[-8.4, 44.6], [-6.4, 44.2], [-5.8, 46.8], [-6.6, 49.0], [-8.4, 49.0], [-9.0, 46.8]]), true, 6));
    gc.fill();
    gc.stroke();
    L.put(t, g, 0.55);
  }
  // 옆모습의 콩팥(등 쪽 벽에 붙어 있다. 위 끝이 조금 더 등 쪽), 오줌관, 방광, 요도
  const sk = (() => {
    const ang = -0.26, a = 5.4, b = 2.0, cu = 3.0, cv = 25.0;
    const pts = [];
    for (let i = 0; i < 60; i++) {
      const th = (i / 60) * L.TAU;
      const lx = b * Math.cos(th) * (1 - 0.06 * Math.sin(th)), ly = a * Math.sin(th);
      pts.push([Xs(cu + Math.cos(ang) * lx - Math.sin(ang) * ly), Ys(cv + Math.sin(ang) * lx + Math.cos(ang) * ly)]);
    }
    return pts;
  })();
  const ureS = L.spline(Cs([[1.4, 27.6], [1.9, 31], [2.6, 34.6], [3.0, 37.8], [2.2, 41.6], [0.0, 44.4], [-2.6, 45.8]]), false, 8);
  L.tubes(t, [{ pts: ureS, w: 0.55 * ss + 0.4 }], URE);
  L.pillow(t, L.bbox(sk), (c) => L.poly(c, sk), { color: "#B4524C", light: "#EEA592", dark: "#6A2427", blur: 4.2, relief: 1.1, spec: 0.4, gloss: 30 });
  L.tubes(t, [{ pts: L.spline(Cs([[-5.0, 47.6], [-4.4, 50], [-3.6, 52.8]]), false, 6), w: 0.6 * ss + 0.4 }], URE);
  const bs = L.spline(Cs([[-5.6, 42.6], [-3.4, 43.0], [-2.4, 45.2], [-3.0, 47.2], [-5.0, 48.0], [-7.0, 47.0], [-7.6, 44.8]]), true, 8);
  L.pillow(t, L.bbox(bs), (c) => L.poly(c, bs), { color: "#EDBE84", light: "#FFF1D8", dark: "#AE7A44", blur: 4.4, spec: 0.45, gloss: 28, alpha: 0.95 });

  // ── 겹층: 오줌이 가는 방향, 같은 높이 안내선, 라벨 ──
  const sv = S.svgLayer(root, w, h);
  const PEE = "#F2B705";
  const fat = (pts) => S.fatArrow(sv, pts, { fill: PEE, w0: 2.6, w1: 4.2, head: 7.5, hw: 5.6, sw: 1.1 });
  fat([[X(5.3), Y(31.2)], [X(5.25), Y(35.0)]]);
  fat([[X(-5.4), Y(32.6)], [X(-5.35), Y(36.4)]]);
  fat([[X(1.3), Y(51.6)], [X(1.3), Y(55.2)]]);
  fat([[Xs(4.7), Ys(31.0)], [Xs(5.0), Ys(35.0)]]);
  // 앞모습과 옆모습의 콩팥이 같은 높이
  S.el(sv, "line", { x1: X(9.6), y1: Y(24.8), x2: Xs(0.6), y2: Y(24.8), stroke: "#7D8A9C", "stroke-width": 1, "stroke-dasharray": "3 3", opacity: 0.85 });

  const lab = (x, y, text, pts, o = {}) => {
    if (pts) S.leader(sv, pts);
    S.label(sv, x, y, text, { size: 14, ...o });
  };
  lab(4, Y(13.2), "대정맥", [[24, Y(14.4)], [X(-2.6), Y(17.4)]]);
  lab(X(5.6), Y(13.2), "대동맥", [[X(5.0), Y(14.4)], [X(1.6), Y(17.6)]]);
  const kr = KR.pts.reduce((m, q) => (q[0] < m[0] ? q : m), KR.pts[0]);
  lab(4, Y(24.2), "콩팥", [[26, Y(25.4)], [kr[0] + 4, kr[1] + 2]]);
  lab(4, Y(36.2), "오줌관", [[40, Y(37.4)], [X(-4.15), Y(37.6)]]);
  lab(4, Y(45.4), "방광", [[26, Y(46.6)], [X(-3.2), Y(46.6)]]);
  lab(4, Y(53.4), "요도", [[26, Y(52.6)], [X(-0.3), Y(52.4)]]);
  S.label(sv, X(0), Y(60) + 20, "앞에서 본 모습", { size: 13.5, anchor: "middle", color: "#4E5968" });
  S.label(sv, Xs(1.2), Ys(61) + 20, "옆에서 본 모습", { size: 13.5, anchor: "middle", color: "#4E5968" });
  S.label(sv, Xs(-10.2), Ys(4.6) - 6, "배 쪽", { size: 13.5, anchor: "start", color: "#4E5968" });
  S.label(sv, Xs(11.2), Ys(4.6) - 6, "등 쪽", { size: 13.5, anchor: "end", color: "#4E5968" });
}
