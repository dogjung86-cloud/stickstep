// g2u7l8f1 전동기의 구조와 원리: 비스듬히 내려다본 전동기(왼쪽 N극, 오른쪽 S극, 수평으로 누운 네모 코일, 회전축, 앞쪽의 갈라진 고리와 고리에 닿는 막대)
// 와 아래 띠의 작은 그림 셋(0°, 90°, 180°). 좌표: x 오른쪽(N → S, 자기장 방향), y 위, z 보는 사람 쪽(회전축 방향).
// 힘은 전류 × 자기장으로 계산한다: 전류가 +z(보는 사람 쪽)이면 (0,0,1)×(1,0,0) = (0,1,0) 위쪽, −z이면 아래쪽.
// 오른쪽 막대가 (+)극에 이어져 있어, 그 막대에 닿은 고리 쪽 변에는 전류가 앞에서 뒤로(−z) 흐른다. 그래서 앞에서 보면 시계 방향으로 돈다.
// 검산 메모는 g2u7l8f1.md
import { COL, ortho, tube, curArrow, fat } from "./_lib.mjs";

export const meta = {
  key: "g2u7l8f1",
  w: 340,
  h: 396,
  alt: "왼쪽 N극과 오른쪽 S극 사이에 네모난 코일이 누워 있고, 앞쪽 회전축에 두 쪽으로 갈라진 고리가 있어 양옆의 막대가 닿아 전원과 이어져요. 코일의 왼쪽 부분은 위로, 오른쪽 부분은 아래로 힘을 받아 앞에서 보면 시계 방향으로 돌아요. 아래 그림 셋은 반 바퀴 돌면 고리의 두 쪽이 닿는 막대가 바뀌어 왼쪽에 온 부분에 다시 같은 방향의 전류가 흐르는 모습이에요.",
};

const A_HALF = 42, B_HALF = 40; // 코일 반 너비(x), 반 깊이(z)
const RC = 8, ZC0 = 54, ZC1 = 70; // 갈라진 고리 반지름, 앞뒤 z
const GAP = 16; // 고리 틈의 각(도)
const MH = 21, MZ = 36, MX0 = 56, MX1 = 86, RF = 56; // 자석: 높이 반, 깊이 반, 안쪽, 바깥쪽, 극의 면(축 둘레 원통) 반지름
const SIDE_A = "#F08C00", SIDE_B = "#7950F2"; // 아래 띠에서 코일 두 변을 구별하는 색

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(64);
  const s = S.svgLayer(root, w, h);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  const LGT = P.norm3([-0.45, 0.8, 0.42]);
  const shadeOf = (n, base, amb = 0.4) => {
    const d = Math.max(0, n[0] * LGT[0] + n[1] * LGT[1] + n[2] * LGT[2]);
    return P.tone(base, (amb + 0.66 * d - 0.72) * 0.85);
  };
  const path = (pts) => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
  };
  const fillPoly = (pts, fill, stroke, lw = 0.8) => {
    path(pts);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.stroke();
    }
  };
  /** 앞에서 볼 때 시계 방향으로 phi(도)만큼 돌린 (x, y) */
  const rotZ = (x, y, phi) => {
    const a = (-phi * Math.PI) / 180;
    return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  };
  const facing = (pr, n) => pr(n)[2] - pr([0, 0, 0])[2] > 0.02;

  /** 전동기 한 벌. pr: 투영, phi: 코일 각(앞에서 볼 때 시계 방향, 0 = 수평이고 처음 왼쪽 변 A가 왼쪽), o: 선택 */
  const motor = (pr, phi, o = {}) => {
    const V = (x, y, z) => pr([x, y, z]);
    const k = o.k ?? 1; // 선 굵기 배율
    const out = { V };
    // ── 자석(둥글게 판 극의 면): 코일에 가려지지 않으므로 먼저 그린다 ──
    const magnet = (sgn) => {
      const base = sgn < 0 ? COL.north : COL.south;
      const a0 = Math.asin(MH / RF);
      const arc = [];
      for (let i = 0; i <= 14; i++) {
        const a = -a0 + (2 * a0 * i) / 14;
        arc.push([sgn * RF * Math.cos(a), RF * Math.sin(a)]);
      }
      const faces = [
        { pts: [V(sgn * RF * Math.cos(a0), MH, -MZ), V(sgn * MX1, MH, -MZ), V(sgn * MX1, MH, MZ), V(sgn * RF * Math.cos(a0), MH, MZ)], n: [0, 1, 0] },
        { pts: [V(sgn * MX1, MH, -MZ), V(sgn * MX1, -MH, -MZ), V(sgn * MX1, -MH, MZ), V(sgn * MX1, MH, MZ)], n: [sgn, 0, 0] },
        { pts: [V(sgn * MX1, MH, MZ), V(sgn * MX1, -MH, MZ), ...arc.map(([x, y]) => V(x, y, MZ))], n: [0, 0, 1] },
      ];
      for (let i = 0; i < 14; i++) {
        const [x0, y0] = arc[i], [x1, y1] = arc[i + 1];
        const nx = -(x0 + x1) / 2, ny = -(y0 + y1) / 2, L = Math.hypot(nx, ny);
        faces.push({ pts: [V(x0, y0, -MZ), V(x1, y1, -MZ), V(x1, y1, MZ), V(x0, y0, MZ)], n: [nx / L, ny / L, 0], inner: true });
      }
      for (const f of faces) if (facing(pr, f.n)) fillPoly(f.pts, shadeOf(f.n, base, 0.46), f.inner ? null : "rgba(40,30,50,.35)", 0.7);
      // 윗면 빛줄
      const g0 = V(sgn * (RF + 8), MH, -MZ + 7), g1 = V(sgn * (MX1 - 7), MH, -MZ + 7);
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,.5)";
      ctx.lineWidth = 1.4 * k;
      ctx.beginPath();
      ctx.moveTo(g0[0], g0[1]);
      ctx.lineTo(g1[0], g1[1]);
      ctx.stroke();
      ctx.restore();
      return { topC: V(sgn * (RF + MX1) / 2 + sgn * 4, MH, 0), frontC: V(sgn * (MX0 + MX1) / 2 + sgn * 3, 0, MZ) };
    };
    if (o.magnets === "bars") {
      // 작은 그림: 극의 면만 얇은 판으로(왼쪽 N 빨강, 오른쪽 S 파랑)
      for (const sgn of [-1, 1]) {
        const x0 = sgn * 60, x1 = sgn * 68;
        const faces = [
          { pts: [V(x0, MH, -MZ), V(x1, MH, -MZ), V(x1, MH, MZ), V(x0, MH, MZ)], n: [0, 1, 0] },
          { pts: [V(x0, MH, MZ), V(x1, MH, MZ), V(x1, -MH, MZ), V(x0, -MH, MZ)], n: [0, 0, 1] },
          { pts: [V(x1, MH, -MZ), V(x1, -MH, -MZ), V(x1, -MH, MZ), V(x1, MH, MZ)], n: [sgn, 0, 0] },
          { pts: [V(x0, MH, -MZ), V(x0, -MH, -MZ), V(x0, -MH, MZ), V(x0, MH, MZ)], n: [-sgn, 0, 0] },
        ];
        for (const f of faces) if (facing(pr, f.n)) fillPoly(f.pts, shadeOf(f.n, sgn < 0 ? COL.north : COL.south, 0.5), "rgba(40,30,50,.3)", 0.5);
      }
    } else if (o.magnets !== false) {
      out.N = magnet(-1);
      out.S = magnet(1);
    }
    // ── 자기장 화살표(N → S) ──
    out.field = [];
    for (const [y, z, x1] of o.field ?? []) {
      const p0 = V(-RF + 3, y, z), p1 = V(x1 ?? 36, y, z);
      out.field.push([p0, p1]);
      const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
      ctx.save();
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255,255,255,.75)";
      ctx.lineWidth = 3.6 * k;
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();
      ctx.strokeStyle = COL.field;
      ctx.lineWidth = 1.5 * k;
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0] - Math.cos(ang) * 5 * k, p1[1] - Math.sin(ang) * 5 * k);
      ctx.stroke();
      const hl = 7.5 * k, hw = 4.2 * k;
      ctx.fillStyle = COL.field;
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p1[0] - Math.cos(ang) * hl - Math.sin(ang) * hw, p1[1] - Math.sin(ang) * hl + Math.cos(ang) * hw);
      ctx.lineTo(p1[0] - Math.cos(ang) * hl + Math.sin(ang) * hw, p1[1] - Math.sin(ang) * hl - Math.cos(ang) * hw);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // ── 회전축과 코일(구리) ──
    const [ax, ay] = rotZ(-A_HALF, 0, phi); // 변 A(처음에 왼쪽)
    const [bx, by] = rotZ(A_HALF, 0, phi); // 변 B(처음에 오른쪽)
    const copper = { w: 4.6 * k, edge: "#5E2E0E", base: "#D88A44", hi: "rgba(255,226,190,.95)" };
    tube(ctx, [V(0, 0, -B_HALF - 16), V(0, 0, ZC1 + 2)], { w: 4 * k, edge: "#495057", base: "#CED4DA", hi: "rgba(255,255,255,.95)" });
    out.back = [V(ax, ay, -B_HALF), V(bx, by, -B_HALF)];
    tube(ctx, out.back, copper);
    out.sides = {
      A: { pts: [V(ax, ay, -B_HALF), V(ax, ay, B_HALF)], x: ax, y: ay },
      B: { pts: [V(bx, by, -B_HALF), V(bx, by, B_HALF)], x: bx, y: by },
    };
    const sides = ["A", "B"].sort((p, q) => V(out.sides[p].x, out.sides[p].y, 0)[2] - V(out.sides[q].x, out.sides[q].y, 0)[2]);
    for (const key of sides) {
      if (o.marks) tube(ctx, out.sides[key].pts, { w: copper.w + 4, edge: key === "A" ? SIDE_A : SIDE_B, base: key === "A" ? SIDE_A : SIDE_B, hi: "rgba(0,0,0,0)" });
      tube(ctx, out.sides[key].pts, copper);
    }
    // 변의 앞 끝에서 고리의 두 쪽으로
    const thA = 180 - phi, thB = -phi; // 고리 두 쪽의 가운데 각(앞에서 볼 때 수학 방향, 0 = 오른쪽)
    const onRing = (th, z) => V((RC + 0.4) * Math.cos((th * Math.PI) / 180), (RC + 0.4) * Math.sin((th * Math.PI) / 180), z);
    out.leads = {
      A: [V(ax, ay, B_HALF), V(ax * 0.42, ay * 0.42, B_HALF + 8), onRing(thA, ZC0 + 3)],
      B: [V(bx, by, B_HALF), V(bx * 0.42, by * 0.42, B_HALF + 8), onRing(thB, ZC0 + 3)],
    };
    for (const key of ["A", "B"]) {
      if (o.marks) tube(ctx, out.leads[key], { w: 3.2 * k + 3.6, edge: key === "A" ? SIDE_A : SIDE_B, base: key === "A" ? SIDE_A : SIDE_B, hi: "rgba(0,0,0,0)" });
      tube(ctx, out.leads[key], { ...copper, w: 3.2 * k });
    }
    // ── 고리에 닿는 막대(흑연, 고정)와 놋쇠 받침 ──
    const zc = (ZC0 + ZC1) / 2;
    const brush = (sgn) => {
      const x0 = sgn * (RC + 0.2), x1 = sgn * (RC + 10);
      const bw = 3.2, bd = 4.4;
      const faces = [
        { pts: [V(x0, bw, zc - bd), V(x1, bw, zc - bd), V(x1, bw, zc + bd), V(x0, bw, zc + bd)], n: [0, 1, 0] },
        { pts: [V(x0, bw, zc + bd), V(x1, bw, zc + bd), V(x1, -bw, zc + bd), V(x0, -bw, zc + bd)], n: [0, 0, 1] },
        { pts: [V(x1, bw, zc - bd), V(x1, -bw, zc - bd), V(x1, -bw, zc + bd), V(x1, bw, zc + bd)], n: [sgn, 0, 0] },
      ];
      for (const f of faces) if (facing(pr, f.n)) fillPoly(f.pts, shadeOf(f.n, "#5C636E", 0.5), "rgba(20,24,30,.6)", 0.5);
      const term = V(sgn * (RC + 21), -19, zc + 4);
      tube(ctx, [V(x1, 0, zc), V(x1 + sgn * 6, -2, zc), term], { w: 2.4 * k, edge: "#7A5A12", base: "#E2B84A", hi: "rgba(255,240,200,.9)" });
      return { body: V((x0 + x1) / 2, bw, zc), term };
    };
    // ── 갈라진 고리(구리 두 쪽, 코일과 함께 돈다) ──
    const half = (th, key) => {
      const a0 = th - 90 + GAP / 2, a1 = th + 90 - GAP / 2;
      const F = [], B = [];
      for (let i = 0; i <= 20; i++) {
        const a = ((a0 + ((a1 - a0) * i) / 20) * Math.PI) / 180;
        F.push(V(RC * Math.cos(a), RC * Math.sin(a), ZC1));
        B.push(V(RC * Math.cos(a), RC * Math.sin(a), ZC0));
      }
      for (let i = 0; i < 20; i++) {
        const a = ((a0 + ((a1 - a0) * (i + 0.5)) / 20) * Math.PI) / 180;
        const n = [Math.cos(a), Math.sin(a), 0];
        if (facing(pr, n)) fillPoly([B[i], B[i + 1], F[i + 1], F[i]], shadeOf(n, "#D98B45", 0.5));
      }
      const inner = [];
      for (let i = 20; i >= 0; i--) {
        const a = ((a0 + ((a1 - a0) * i) / 20) * Math.PI) / 180;
        inner.push(V(RC * 0.42 * Math.cos(a), RC * 0.42 * Math.sin(a), ZC1));
      }
      if (o.marks) {
        // 고리 쪽마다 이어진 변의 색 테두리
        path([...F, ...inner]);
        ctx.strokeStyle = key === "A" ? SIDE_A : SIDE_B;
        ctx.lineWidth = 3.2;
        ctx.lineJoin = "round";
        ctx.stroke();
      }
      fillPoly([...F, ...inner], shadeOf([0, 0, 1], "#E8A462", 0.55), "rgba(94,46,14,.7)", 0.6);
    };
    const depthOf = (th) => V(Math.cos((th * Math.PI) / 180), Math.sin((th * Math.PI) / 180), 0)[2];
    out.brushL = brush(-1); // 왼쪽 막대는 고리보다 뒤쪽에 보인다
    for (const [th, key] of [[thA, "A"], [thB, "B"]].sort((p, q) => depthOf(p[0]) - depthOf(q[0]))) half(th, key);
    tube(ctx, [V(0, 0, ZC1 - 1), V(0, 0, ZC1 + 5)], { w: 4 * k, edge: "#495057", base: "#CED4DA", hi: "rgba(255,255,255,.95)" });
    out.brushR = brush(1);
    out.ringFront = V(0, -RC, ZC1);
    out.phi = phi;
    // 막대와 닿은 고리 쪽: 오른쪽 막대(+)는 각 0°, 왼쪽 막대(−)는 180°
    const touches = (th, at) => {
      let d = Math.abs((((at - th) % 360) + 540) % 360 - 180);
      return d < 90 - GAP / 2;
    };
    out.plusSide = touches(thA, 0) ? "A" : touches(thB, 0) ? "B" : null;
    out.minusSide = touches(thA, 180) ? "A" : touches(thB, 180) ? "B" : null;
    return out;
  };

  // ════════ 큰 그림 ════════
  const prM = ortho({ yaw: 0.36, pitch: 0.66, scale: 1.24, ox: 174, oy: 112 });
  const big = motor(prM, 0, { field: [[12, -18], [-12, 8], [12, 22]] });
  const V = big.V;
  // 전원(마른 전지, x 방향으로 눕힘, 오른쪽이 (+)극)과 전선: 오른쪽 막대 → (+), 왼쪽 막대 → (−)
  const bat0 = V(-22, -30, 92), bat1 = V(22, -30, 92);
  const wR = [big.brushR.term, V(31, -26, 82), V(28, -30, 92)];
  const wL = [big.brushL.term, V(-31, -26, 82), V(-28, -30, 92)];
  tube(ctx, wR, { w: 2.8, edge: "#7A1E14", base: "#E8503C", hi: "rgba(255,210,200,.85)" });
  tube(ctx, wL, { w: 2.8, edge: "#15181D", base: "#3A4048", hi: "rgba(200,210,225,.6)" });
  {
    const dx = bat1[0] - bat0[0], dy = bat1[1] - bat0[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
    ctx.save();
    ctx.translate(bat0[0], bat0[1]);
    ctx.rotate(ang);
    P.dropShadow(t, (c) => P.rrect(c, 0, -9, L, 18, 4), { dx: 2, dy: 3, blur: 5, a: 0.25 });
    ctx.beginPath();
    P.rrect(ctx, 0, -9, L, 18, 4);
    ctx.fillStyle = P.lg(ctx, 0, -9, 0, 9, [[0, "#6B7280"], [0.22, "#2B2F36"], [0.6, "#1B1E23"], [1, "#0E1013"]]);
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = P.lg(ctx, 0, -9, 0, 9, [[0, "#FFE59A"], [0.25, "#E2B84A"], [0.7, "#B88A25"], [1, "#7A5A12"]]);
    ctx.fillRect(L * 0.64, -9, L * 0.36, 18);
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.fillRect(2, -6.5, L - 4, 1.8);
    ctx.restore();
    ctx.beginPath();
    P.rrect(ctx, L - 0.5, -3.6, 5, 7.2, 1.6);
    ctx.fillStyle = P.lg(ctx, 0, -3.6, 0, 3.6, [[0, "#F1F3F5"], [1, "#868E96"]]);
    ctx.fill();
    ctx.restore();
  }

  // ── 겹층(큰 그림) ──
  const seg = (a, b, t0, t1) => [[a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1]];
  const sA = big.sides.A.pts, sB = big.sides.B.pts;
  // 전류: (+)극 → 오른쪽 막대 → 오른쪽 변(앞에서 뒤로) → 뒷변(오른쪽에서 왼쪽으로) → 왼쪽 변(뒤에서 앞으로) → 왼쪽 막대 → (−)극
  curArrow(S, s, seg(sB[1], sB[0], 0.2, 0.48), { w: 3.2, head: 8, hw: 5.2 });
  curArrow(S, s, seg(big.back[1], big.back[0], 0.32, 0.62), { w: 3.2, head: 8, hw: 5.2 });
  curArrow(S, s, seg(sA[0], sA[1], 0.5, 0.8), { w: 3.2, head: 8, hw: 5.2 });
  curArrow(S, s, seg(wR[2], wR[1], 0.05, 0.95), { w: 2.8, head: 7, hw: 4.6 });
  curArrow(S, s, seg(wL[1], wL[2], 0.05, 0.95), { w: 2.8, head: 7, hw: 4.6 });
  // 힘: 왼쪽 변 위로, 오른쪽 변 아래로(손바닥으로 검산: 네 손가락 N → S, 엄지 전류, 손바닥이 미는 쪽)
  const mA = V(-A_HALF, 0, -4), mB = V(A_HALF, 0, -4);
  const up = V(-A_HALF, 30, -4), dn = V(A_HALF, -30, -4);
  fat(S, s, [[mA[0], mA[1] - 3], up], { fill: COL.force, w: 5.5, head: 11, hw: 8 });
  fat(S, s, [[mB[0], mB[1] + 3], dn], { fill: COL.force, w: 5.5, head: 11, hw: 8 });
  // 도는 방향: 앞에서 볼 때 시계 방향(왼쪽 변이 올라간다). 코일 앞쪽에 원호
  const rot = [];
  for (let i = 0; i <= 30; i++) {
    const a = ((212 - (212 - 132) * (i / 30)) * Math.PI) / 180;
    rot.push(V(60 * Math.cos(a), 60 * Math.sin(a), B_HALF + 10));
  }
  fat(S, s, rot, { fill: "#7048E8", w: 4.2, head: 11, hw: 7.5 });

  // 이름표(큰 그림)
  const lab = (x, y, text, o = {}) => S.label(s, x, y, text, { size: 14, ...o });
  lab(big.N.topC[0], big.N.topC[1] - 9, "N극", { anchor: "middle", color: "#B5321F" });
  lab(big.S.topC[0] + 4, big.S.topC[1] - 9, "S극", { anchor: "middle", color: "#1F5FAF" });
  {
    const [p0, p1] = big.field[0];
    const m = [p0[0] + (p1[0] - p0[0]) * 0.78, p0[1] + (p1[1] - p0[1]) * 0.78];
    S.leader(s, [[m[0] + 22, m[1] - 52], [m[0] + 12, m[1] - 52], [m[0], m[1] - 1.5]]);
    lab(m[0] + 26, m[1] - 47, "자기장", { color: "#1864AB" });
  }
  lab(up[0] + 9, up[1] + 10, "힘", { color: "#0B6E63" });
  lab(dn[0] + 8, dn[1] + 4, "힘", { color: "#0B6E63" });
  lab(rot[0][0] - 9, rot[0][1] + 2, "도는 방향", { anchor: "end", color: "#5F3DC4" });
  {
    const bk = big.back[0], q = [bk[0] + (big.back[1][0] - bk[0]) * 0.18, bk[1] + (big.back[1][1] - bk[1]) * 0.18];
    S.leader(s, [[q[0] + 6, q[1] - 34], [q[0] + 6, q[1] - 26], [q[0] + 2, q[1] - 2]]);
    lab(q[0] + 6, q[1] - 38, "코일", { anchor: "middle" });
  }
  {
    const c = seg(sB[1], sB[0], 0.2, 0.48)[1];
    lab(c[0] + 10, c[1] - 6, "전류", { color: "#8A5A00" });
  }
  {
    const r = big.ringFront;
    S.leader(s, [[r[0] - 62, r[1] + 26], [r[0] - 52, r[1] + 26], [r[0] - 6, r[1] + 1]]);
    lab(r[0] - 65, r[1] + 31, "갈라진 고리", { anchor: "end" });
    const b = big.brushR.body;
    S.leader(s, [[b[0] + 50, b[1] + 16], [b[0] + 42, b[1] + 16], [b[0] + 2, b[1] + 1]]);
    lab(b[0] + 53, b[1] + 11, "고리에 닿는\n막대", {});
  }
  {
    const c = [(bat0[0] + bat1[0]) / 2, (bat0[1] + bat1[1]) / 2];
    lab(c[0] + 2, c[1] + 25, "전원", { anchor: "middle" });
    lab(bat1[0] + 12, bat1[1] + 18, "(+)", { anchor: "middle", size: 13.5 });
    lab(bat0[0] - 2, bat0[1] + 22, "(−)", { anchor: "middle", size: 13.5 });
  }

  // ════════ 아래 띠: 앞에서 본 작은 그림 셋(0°, 90°, 180°) ════════
  const BY = 258, BH = 134;
  ctx.save();
  ctx.beginPath();
  P.rrect(ctx, 6, BY, w - 12, BH, 12);
  ctx.fillStyle = "rgba(255,255,255,.88)";
  ctx.fill();
  ctx.strokeStyle = "rgba(120,132,150,.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
  const cells = [
    { phi: 0, cx: 61, tag: "0°", note: "왼쪽 부분이 위로" },
    { phi: 90, cx: 170, tag: "90°", note: "틈을 지나요" },
    { phi: 180, cx: 279, tag: "180°", note: "다시 왼쪽이 위로" },
  ];
  const info = [];
  for (const c of cells) {
    const pr = ortho({ yaw: 0.36, pitch: 0.5, scale: 0.6, ox: c.cx + 2, oy: BY + 70 });
    const m = motor(pr, c.phi, { k: 0.7, marks: true, magnets: "bars", field: [[MH + 6, 0, 46]] });
    const v = m.V;
    // 전류와 힘: (+) 막대에 닿은 쪽 변은 −z(뒤로), 다른 쪽 변은 +z(앞으로). 힘 = 전류 × 자기장
    if (m.plusSide) {
      for (const key of ["A", "B"]) {
        const sd = m.sides[key];
        const back = key === m.plusSide; // 뒤로 흐르는 변
        const p0 = back ? sd.pts[1] : sd.pts[0], p1 = back ? sd.pts[0] : sd.pts[1];
        curArrow(S, s, seg(p0, p1, back ? 0.08 : 0.5, back ? 0.5 : 0.92), { w: 2.4, head: 6.5, hw: 4, sw: 0.9 });
        const fy = back ? -1 : 1; // (−z)×x = −y, (+z)×x = +y
        const q0 = v(sd.x, sd.y, -24), q1 = v(sd.x, sd.y + fy * 26, -24);
        fat(S, s, [[q0[0], q0[1] - fy * 3], q1], { fill: COL.force, w: 3.8, head: 8, hw: 5.8, sw: 1 });
      }
    }
    info.push({ phi: c.phi, plus: m.plusSide, minus: m.minusSide });
    S.tag(s, c.cx, BY + 14, c.tag, { w: c.tag.length > 3 ? 40 : 34 });
    S.label(s, c.cx, BY + BH - 10, c.note, { size: 13.5, anchor: "middle", color: c.phi === 90 ? "#495057" : "#0B6E63" });
    // 막대의 극 표시(오른쪽 +, 왼쪽 −)
    S.label(s, m.brushR.term[0] + 6, m.brushR.term[1] + 6, "+", { size: 13.5, anchor: "middle", color: "#C2361F" });
    S.label(s, m.brushL.term[0] - 6, m.brushL.term[1] + 6, "−", { size: 13.5, anchor: "middle", color: "#343A40" });
  }
  window.__l8 = info;
}
