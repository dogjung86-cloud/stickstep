// g2u2l1f1 지구 속 쐐기와 지각 블록 단면: 쐐기(네 층을 반지름 비율대로, 지각은 선 하나) → 지표 한 자리를 키운 블록
// (대륙에서 바다까지, 세로만 실제 비율 3.2 px/km). 검산 메모는 g2u2l1f1.md
import { COL, rockAt, out, funnel, depthAxis, linOf } from "./_lib.mjs";

export const meta = {
  key: "g2u2l1f1",
  w: 340,
  h: 400,
  alt: "지구를 부채꼴로 자른 단면에서 지각은 바깥 둘레의 선 하나 굵기예요. 그 지표 한 자리를 키운 단면에서는 산맥이 있는 대륙 아래 지각이 두껍게 내려가고, 바다 밑의 해양 지각은 아주 얇아요. 지각 아래는 고체인 맨틀이에요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(31);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.012 });

  // ── 블록 기하(앞면 = 자른 면, 세로 3.2 px/km) ──
  const X0 = 30, X1 = 298, S0 = 172, K = 3.2, ZB = 64; // 바닥 깊이 64 km
  const D = [-16, -15]; // 윗면이 왼쪽 위로 물러난다
  const XC = 190, XS = 210, XB = 240; // 해안선, 대륙붕 끝, 비탈 아래(대륙 지각과 해양 지각이 만나는 곳)
  const gs = (x, m, s) => Math.exp(-(((x - m) / s) ** 2));
  const sm = (a, b, x) => P.smooth(a, b, x);
  /** 높이(km): 양수는 해발, 음수는 바다 깊이 */
  function elev(x) {
    if (x <= XC) {
      const mtn = 3.55 * gs(x, 88, 11) + 2.5 * gs(x, 70, 8.5) + 2.3 * gs(x, 106, 9) + 1.1 * gs(x, 54, 7) + 0.75 * gs(x, 124, 8);
      const plain = 0.4 * (1 - sm(132, XC, x));
      const rough = (0.05 + 0.06 * Math.min(1, mtn)) * nz.fbm(x * 0.09, 3.7, 3);
      return Math.max(0, plain + mtn + rough * (1 - sm(176, XC, x)));
    }
    if (x <= XS) return -0.15 * sm(XC, XS, x);
    if (x <= XB) return -(0.15 + 3.85 * sm(XS, XB, x));
    return -(4 + 0.06 * nz.fbm(x * 0.05, 9.1, 2));
  }
  /** 지각과 맨틀의 경계 깊이(km): 대륙 평균 35, 산맥 아래 뿌리 +20(최대 55), 비탈에서 얇아져 해양 쪽은 바다 4 + 지각 5 */
  function moho(x) {
    if (x >= XB) return -elev(x) + 5;
    return 35 + 20 * gs(x, 88, 34) - 26 * sm(XC - 4, XB, x);
  }
  // 열마다 미리 계산(0.25 px 간격)
  const STEP = 0.25, NC = Math.ceil((X1 - X0) / STEP) + 2;
  const E = new Float32Array(NC), M = new Float32Array(NC);
  for (let i = 0; i < NC; i++) {
    const x = X0 + i * STEP;
    E[i] = elev(x);
    M[i] = moho(x);
  }
  const at = (arr, x) => {
    const f = Math.max(0, Math.min(NC - 1.001, (x - X0) / STEP));
    const i = Math.floor(f);
    return arr[i] + (arr[i + 1] - arr[i]) * (f - i);
  };
  const eAt = (x) => at(E, x), mAt = (x) => at(M, x);
  const topY = (x) => S0 - Math.max(0, eAt(x)) * K; // 앞면의 윗선(땅 표면 또는 해수면)
  const crustY = (x) => S0 - eAt(x) * K; // 지각의 윗면(땅 표면 또는 바다 밑바닥)
  const mohoY = (x) => S0 + mAt(x) * K;
  const YB = S0 + ZB * K;

  // ── 왼쪽 위: 지구 쐐기(지구 중심이 꼭짓점, 반지름 6400 km = 106 px) ──
  const A = [86, 128], R = 106;
  const a0 = (-125 * Math.PI) / 180, a1 = (-55 * Math.PI) / 180;
  const rIn = (R * 1300) / 6400, rOut = (R * 3500) / 6400; // 내핵 바깥 경계(깊이 5100 km), 외핵 바깥 경계(깊이 2900 km)
  // 확대할 자리(둘레 위 작은 상자)
  const az = (-62 * Math.PI) / 180;
  const Z = [A[0] + Math.cos(az) * R, A[1] + Math.sin(az) * R];

  // ── 확대 깔때기(블록보다 먼저) ──
  const backL = [X0 + D[0], crustY(X0) + D[1]], backR = [X1 + D[0], S0 + D[1]];
  funnel(t, [Z[0] - 2, Z[1] + 2], backL, backR, { a2: [Z[0] + 2, Z[1] - 2] });

  const sector = (r) => {
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]);
    ctx.arc(A[0], A[1], r, a0, a1);
    ctx.closePath();
  };
  P.dropShadow(t, (c) => {
    c.moveTo(A[0], A[1]);
    c.arc(A[0], A[1], R, a0, a1);
    c.closePath();
  }, { dx: 2, dy: 4, blur: 9, a: 0.2 });
  // 맨틀(고체 암석 결)
  {
    const base = linOf(COL.mantle);
    const mo = { base: COL.mantle, vari: 0.07, freq: 0.06, grain: 1.5, grainAmp: 0.05, edge: 0.05, seed: 4 };
    P.shade(t, { x: A[0] - R, y: A[1] - R, w: 2 * R, h: R }, (x, y) => {
      const c = rockAt(nz, x, y, mo);
      const lt = 1.06 - 0.12 * ((x - (A[0] - R)) / (2 * R)) - 0.05 * ((y - (A[1] - R)) / R);
      return out([c[0] * lt, c[1] * lt, c[2] * lt]);
    }, { mask: (c) => { c.moveTo(A[0], A[1]); c.arc(A[0], A[1], R, a0, a1); c.closePath(); } });
    void base;
  }
  // 외핵(액체: 결 없이 매끈한 빛)
  sector(rOut);
  ctx.fillStyle = P.rg(ctx, A[0] - 18, A[1] - 44, 2, A[0], A[1], rOut, [[0, "#FFD48A"], [0.6, COL.outer], [1, "#F3A044"]]);
  ctx.fill();
  // 내핵(고체)
  sector(rIn);
  ctx.fillStyle = P.rg(ctx, A[0] - 6, A[1] - 14, 1, A[0], A[1], rIn, [[0, "#FFF4C9"], [0.6, COL.inner], [1, "#F2CB63"]]);
  ctx.fill();
  // 층 경계의 가는 선
  ctx.save();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = "rgba(120,60,20,.35)";
  for (const r of [rIn, rOut]) {
    ctx.beginPath();
    ctx.arc(A[0], A[1], r, a0, a1);
    ctx.stroke();
  }
  ctx.restore();
  // 지각: 바깥 둘레의 선 하나(실제 두께는 반지름의 약 0.5%)
  ctx.save();
  ctx.lineWidth = 1.7;
  ctx.strokeStyle = COL.crust;
  ctx.beginPath();
  ctx.arc(A[0], A[1], R - 0.6, a0, a1);
  ctx.stroke();
  // 자른 면의 곧은 두 모서리에 빛
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = "rgba(255,255,255,.85)";
  ctx.beginPath();
  ctx.moveTo(A[0] + Math.cos(a0) * R, A[1] + Math.sin(a0) * R);
  ctx.lineTo(A[0], A[1]);
  ctx.lineTo(A[0] + Math.cos(a1) * R, A[1] + Math.sin(a1) * R);
  ctx.stroke();
  ctx.restore();

  // ── 블록: 왼쪽 옆면 ──
  {
    const yt = crustY(X0), ym = mohoY(X0);
    const quad = (y0, y1, c0, c1) => {
      ctx.beginPath();
      ctx.moveTo(X0, y0);
      ctx.lineTo(X0 + D[0], y0 + D[1]);
      ctx.lineTo(X0 + D[0], y1 + D[1]);
      ctx.lineTo(X0, y1);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, X0 + D[0], 0, X0, 0, [[0, c0], [1, c1]]);
      ctx.fill();
    };
    quad(yt, ym, "#A5815B", "#957250");
    quad(ym, YB, "#D9693A", "#C65E33");
  }

  // ── 블록: 윗면(땅과 바다의 겉, 뒤에서 앞으로 얇게 겹쳐 칠한다) ──
  {
    const xs = [];
    for (let x = X0; x <= X1 + 0.01; x += 1.5) xs.push(Math.min(x, X1));
    const NS = 18;
    const Lx = -0.52, Ly = 0.64;
    const land = (e) => {
      // 평야(초록) → 산(바위색) → 높은 봉우리(밝은 바위)
      const c0 = linOf("#9CC46A"), c1 = linOf("#93A067"), c2 = linOf("#A48D72"), c3 = linOf("#D2CBC2");
      if (e < 0.9) return c0;
      if (e < 1.8) return P.mixc(c0, c1, (e - 0.9) / 0.9);
      if (e < 2.8) return P.mixc(c1, c2, (e - 1.8) / 1.0);
      return P.mixc(c2, c3, Math.min(1, (e - 2.8) / 1.2) * 0.75);
    };
    const sea = linOf("#8CCBF1");
    for (let k = NS - 1; k >= 0; k--) {
      const t0 = k / NS, t1 = (k + 1) / NS;
      for (let i = 0; i < xs.length - 1; i++) {
        const xa = xs[i], xb = xs[i + 1];
        const ea = eAt(xa), eb = eAt(xb);
        const ya = topY(xa), yb = topY(xb);
        let col;
        if (ea <= 0 && eb <= 0) {
          col = P.mixc(sea, [1, 1, 1], 0.1 + 0.22 * t0);
          const sp = 0.5 + 0.5 * nz.n2(xa * 0.12, t0 * 9);
          col = P.mixc(col, [1, 1, 1], 0.08 * sp);
        } else {
          const em = Math.max(0, (ea + eb) / 2);
          const dx = xb - xa, dy = (Math.max(0, eb) - Math.max(0, ea)) * K;
          const L = Math.hypot(dx, dy);
          const ndl = Lx * (-dy / L) + Ly * (dx / L);
          const f = (0.5 + 0.78 * ndl) * (1 + 0.07 * nz.n2(xa * 0.4, t0 * 13));
          const c = land(em);
          col = [c[0] * f, c[1] * f, c[2] * f];
        }
        const s = P.srgb(col);
        ctx.fillStyle = ctx.strokeStyle = `rgb(${s[0] | 0},${s[1] | 0},${s[2] | 0})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(xa + D[0] * t0, ya + D[1] * t0);
        ctx.lineTo(xb + D[0] * t0, yb + D[1] * t0);
        ctx.lineTo(xb + D[0] * t1, yb + D[1] * t1);
        ctx.lineTo(xa + D[0] * t1, ya + D[1] * t1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    // 바닷가(해안선)의 흰 물거품 선
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(XC + 0.5, S0);
    ctx.lineTo(XC + 0.5 + D[0], S0 + D[1]);
    ctx.stroke();
    ctx.restore();
  }

  // ── 블록: 앞면(자른 면) ──
  {
    const cont = { base: COL.ccrust, vari: 0.1, freq: 0.04, band: [0.012, 0.08, 0.07], grain: 1.5, grainAmp: 0.09, edge: 0.07, specks: [["#EFE5D3", 0.08, 0.55], ["#4C3A2C", 0.06, 0.55]], speck: 1.7, seed: 2 };
    const oce = { base: COL.ocrust, vari: 0.08, freq: 0.06, grain: 1.2, grainAmp: 0.08, edge: 0.06, specks: [["#8F8279", 0.1, 0.6], ["#2C2521", 0.08, 0.6]], speck: 1.5, seed: 6 };
    const man = { base: COL.mantle, vari: 0.08, freq: 0.035, grain: 2.0, grainAmp: 0.06, edge: 0.06, specks: [["#B5512A", 0.1, 0.55], ["#F5A06E", 0.06, 0.5]], speck: 2.6, seed: 3 };
    const w0 = linOf(COL.sea0), w1 = linOf(COL.sea1);
    P.shade(t, { x: X0, y: S0 - 14, w: X1 - X0, h: YB - S0 + 14 }, (x, y) => {
      const ty = topY(x);
      if (y < ty - 0.6) return null;
      const a = P.smooth(ty - 0.5, ty + 0.5, y);
      const cy = crustY(x), my = mohoY(x);
      const e = eAt(x);
      const wMan = P.smooth(my - 0.45, my + 0.45, y);
      const wWat = e < 0 ? 1 - P.smooth(cy - 0.45, cy + 0.45, y) : 0;
      let c;
      if (wMan > 0) c = rockAt(nz, x, y, man);
      if (wMan < 1) {
        const wO = P.smooth(XB - 0.45, XB + 0.45, x);
        let cr;
        if (wO < 1) cr = rockAt(nz, x, y, cont);
        if (wO > 0) {
          const co = rockAt(nz, x, y, oce);
          cr = cr ? P.mixc(cr, co, wO) : co;
        }
        c = c ? P.mixc(cr, c, wMan) : cr;
      }
      if (wWat > 0) {
        const d = P.clamp((y - S0) / (4 * K));
        const wc = P.mixc(w0, w1, d * 0.9 + 0.05 * nz.n2(x * 0.1, y * 0.3));
        c = P.mixc(c, wc, wWat);
      }
      const lt = 1.05 - 0.07 * ((x - X0) / (X1 - X0)) - 0.07 * ((y - S0) / (YB - S0));
      return out([c[0] * lt, c[1] * lt, c[2] * lt], a);
    });
    // 지각과 맨틀의 경계선
    ctx.save();
    ctx.beginPath();
    for (let x = X0; x <= X1; x += 0.5) (x === X0 ? ctx.moveTo : ctx.lineTo).call(ctx, x, mohoY(x));
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(255,240,225,.55)";
    ctx.lineWidth = 2.6;
    ctx.stroke();
    ctx.strokeStyle = "#5B3A24";
    ctx.lineWidth = 1.15;
    ctx.stroke();
    ctx.restore();
    // 바다 밑바닥(물과 지각의 경계)
    ctx.save();
    ctx.beginPath();
    for (let x = XC; x <= X1; x += 0.5) (x === XC ? ctx.moveTo : ctx.lineTo).call(ctx, x, crustY(x));
    ctx.strokeStyle = "rgba(40,60,80,.45)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
    // 앞면 테두리: 위와 왼쪽 모서리에 빛, 둘레에 옅은 선
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X0, YB);
    ctx.lineTo(X0, crustY(X0));
    for (let x = X0; x <= X1; x += 0.5) ctx.lineTo(x, topY(x));
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(X1, S0);
    ctx.lineTo(X1, YB);
    ctx.lineTo(X0, YB);
    ctx.strokeStyle = "rgba(60,50,45,.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  P.softShadow(t, (X0 + X1) / 2, YB + 5, (X1 - X0) * 0.52, 6, 0.14);

  // ── 겹층: 라벨 ──
  const s = S.svgLayer(root, w, h);
  // 쐐기
  S.label(s, A[0], A[1] - (rOut + R) / 2 + 5, "맨틀", { size: 14, anchor: "middle" });
  S.label(s, A[0], A[1] - (rIn + rOut) / 2 + 5, "외핵", { size: 14, anchor: "middle" });
  const ai = (-80 * Math.PI) / 180;
  S.leader(s, [[A[0] - 30, 119], [A[0] + Math.cos(ai) * rIn * 0.55, A[1] + Math.sin(ai) * rIn * 0.55]]);
  S.label(s, A[0] - 34, 124, "내핵", { size: 14, anchor: "end" });
  const ac = (-112 * Math.PI) / 180;
  S.leader(s, [[A[0] - 50, 19], [A[0] + Math.cos(ac) * (R - 0.6), A[1] + Math.sin(ac) * (R - 0.6)]]);
  S.label(s, A[0] - 54, 24, "지각", { size: 14, anchor: "end" });
  // 확대 자리 표시(노란 점과 흰 고리)
  S.el(s, "circle", { cx: Z[0], cy: Z[1], r: 4.6, fill: "none", stroke: "#fff", "stroke-width": 3 });
  S.el(s, "circle", { cx: Z[0], cy: Z[1], r: 4.6, fill: "none", stroke: "#F59F00", "stroke-width": 1.6 });
  S.el(s, "circle", { cx: Z[0], cy: Z[1], r: 1.6, fill: "#F59F00" });

  // 블록
  S.label(s, 236, 168, "바다", { size: 14, anchor: "middle", color: "#1D5C8F" });
  S.label(s, 150, 224, "대륙 지각", { size: 14, anchor: "middle", sub: undefined });
  S.label(s, 150, 241, "평균 약 35 km", { size: 13.5, anchor: "middle", weight: 600, color: "#4E5968" });
  S.leader(s, [[266, 224], [266, 193]]);
  S.label(s, 258, 238, "해양 지각", { size: 14, anchor: "middle" });
  S.label(s, 258, 255, "평균 약 5 km", { size: 13.5, anchor: "middle", weight: 600, color: "#4E5968" });
  S.leader(s, [[178, 304], [178, mohoY(178)]]);
  S.label(s, 178, 318, "지각과 맨틀의 경계", { size: 14, anchor: "middle" });
  S.label(s, 96, 368, "맨틀(고체)", { size: 14, anchor: "middle" });
  // 깊이 눈금(해수면 = 0)
  depthAxis(s, 304, S0, K, [0, 10, 20, 30, 40, 50, 60]);
  S.label(s, 338, 156, "깊이(km)", { size: 13.5, anchor: "end", weight: 700, color: "#4E5968" });
  S.label(s, 170, 394, "세로만 실제 비율(가로는 줄임)", { size: 13.5, anchor: "middle", weight: 600, color: "#6B7684" });
}
