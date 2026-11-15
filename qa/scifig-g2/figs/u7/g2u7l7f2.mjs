// g2u7l7f2 막대자석과 전류가 흐르는 코일의 자기장 견주기: 같은 축척, 같은 방향(오른쪽이 N)의 두 칸.
// 두 칸의 자기장은 같은 식으로 계산한다(반지름 20 px, 길이 108 px 원통에 고르게 감은 전류 면 = 고르게 자화한 막대자석). 그래서 바깥 선이 똑같다.
// 코일은 앞쪽 전선이 왼쪽 위에서 오른쪽 아래로 비스듬한 나선이고, 전원의 (+)극에서 온 전선이 왼쪽 끝에 이어진다. 검산 메모는 g2u7l7f2.md
import { COL, compass, curArrow, solenoid, trace, tube, polyAt, polyLen, pathD } from "./_lib.mjs";

export const meta = {
  key: "g2u7l7f2",
  w: 340,
  h: 400,
  alt: "위 칸은 막대자석, 아래 칸은 전원에 이은 코일이에요. 두 칸 모두 자기장이 오른쪽 끝에서 나와 둥글게 돌아 왼쪽 끝으로 들어가고, 같은 자리의 나침반 바늘이 같은 쪽을 가리켜요. 코일 속에서는 자기장이 촘촘하게 오른쪽으로 나란히 지나요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(72);

  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 두 칸(종이 판) ──
  const CX = 170, R = 20, HALF = 54;
  const panels = [
    { y0: 6, y1: 180, cy: 92, kind: "bar" },
    { y0: 186, y1: 394, cy: 274, kind: "coil" },
  ];
  for (const p of panels) {
    P.dropShadow(t, (c) => P.rrect(c, 6, p.y0, w - 12, p.y1 - p.y0, 12), { dx: 0, dy: 2, blur: 6, a: 0.14 });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, 6, p.y0, w - 12, p.y1 - p.y0, 12);
    ctx.fillStyle = P.lg(ctx, 0, p.y0, w, p.y1, [[0, "#FFFFFF"], [1, "#F4F3EE"]]);
    ctx.fill();
    ctx.restore();
    P.shade(t, { x: 6, y: p.y0, w: w - 12, h: p.y1 - p.y0 }, (x, y) => {
      const n = nz.fbm(x * 0.55, y * 0.09, 3);
      const v = n > 0 ? 255 : 120;
      return [v, v, v - 6, Math.abs(n) * 0.05];
    }, { mask: (c) => P.rrect(c, 6, p.y0, w - 12, p.y1 - p.y0, 12) });
    ctx.save();
    ctx.strokeStyle = "rgba(120,132,150,.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    P.rrect(ctx, 6.5, p.y0 + 0.5, w - 13, p.y1 - p.y0 - 1, 11.5);
    ctx.stroke();
    ctx.restore();
  }

  // ── 자기장: 두 칸 모두 같은 식 ──
  const lineSet = (cy) => {
    const F = solenoid({ x0: CX - HALF, x1: CX + HALF, cy, R, n: 72 });
    const y0s = [0, 6, 11, 16, 18];
    const lines = [];
    for (const r0 of y0s) {
      for (const sg of r0 === 0 ? [1] : [-1, 1]) {
        const sy = cy + sg * r0;
        const stop = (x, y) => x < 0 || x > w || y < cy - 92 || y > cy + 92;
        // 가운데에서 앞(오른쪽)으로, 뒤(왼쪽)로 이어 붙인다
        const fw = trace(F, CX, sy, { h: 0.55, max: 6000, stop });
        if (fw.closed) {
          lines.push({ pts: fw.pts, closed: true, r0, sg });
        } else {
          const bw = trace(F, CX, sy, { h: 0.55, max: 6000, stop, sign: -1, close: false });
          lines.push({ pts: [...bw.pts.reverse(), ...fw.pts.slice(1)], closed: false, r0, sg });
        }
      }
    }
    return { F, lines };
  };
  const strokeLine = (pts, hole) => {
    const path = () => {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    };
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // 흰 테두리: 코일 속(hole)에서는 빼서 뒤쪽 전선이 끊겨 보이지 않게
    ctx.save();
    if (hole) {
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.rect(hole[0], hole[1] + hole[3], hole[2], -hole[3]);
      ctx.clip("evenodd");
    }
    path();
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.lineWidth = 3.8;
    ctx.stroke();
    ctx.restore();
    path();
    ctx.strokeStyle = COL.field;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  };
  const clipPanel = (p, fn) => {
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, 7, p.y0 + 1, w - 14, p.y1 - p.y0 - 2, 11);
    ctx.clip();
    fn();
    ctx.restore();
  };

  // 나침반 자리(두 칸 같은 자리)
  const compSpots = (cy) => [
    [CX - HALF - 32, cy],
    [CX + HALF + 32, cy],
    [CX, cy - 47],
    [CX, cy + 47],
  ];

  // ===== (가) 막대자석 =====
  const A = panels[0];
  const LA = lineSet(A.cy);
  clipPanel(A, () => LA.lines.forEach((l) => strokeLine(l.pts)));
  // 자석(위에서 본 막대, 칠한 금속)
  const bx0 = CX - HALF, by0 = A.cy - R, bw = HALF * 2, bh = R * 2;
  P.dropShadow(t, (c) => P.rrect(c, bx0, by0, bw, bh, 5), { dx: 3, dy: 5, blur: 7, a: 0.3 });
  const halfBar = (x0, x1, base, hi, lo) => {
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, bx0, by0, bw, bh, 5);
    ctx.clip();
    ctx.fillStyle = P.lg(ctx, 0, by0, 0, by0 + bh, [[0, hi], [0.18, base], [0.8, base], [1, lo]]);
    ctx.fillRect(x0, by0, x1 - x0, bh);
    ctx.restore();
  };
  halfBar(bx0, CX, COL.south, "#9CCBFF", "#1F5FAF");
  halfBar(CX, bx0 + bw, COL.north, "#FF9A86", "#A3311F");
  ctx.save();
  ctx.beginPath();
  P.rrect(ctx, bx0, by0, bw, bh, 5);
  ctx.clip();
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.fillRect(bx0 + 6, by0 + 3.2, bw - 12, 2.2);
  ctx.fillStyle = P.rg(ctx, bx0 + 34, by0, 2, bx0 + 34, by0, 84, [[0, "rgba(255,255,255,.22)"], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(bx0, by0, bw, bh);
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.fillRect(CX - 0.6, by0, 1.2, bh);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "rgba(40,30,60,.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  P.rrect(ctx, bx0 + 0.5, by0 + 0.5, bw - 1, bh - 1, 5);
  ctx.stroke();
  ctx.restore();
  const angA = compSpots(A.cy).map(([x, y]) => {
    const [fx, fy] = LA.F(x, y);
    const a = Math.atan2(fy, fx);
    compass(P, t, x, y, 13, a);
    return a;
  });

  // ===== (나) 코일 =====
  const B = panels[1];
  const LB = lineSet(B.cy);
  // 나선: φ는 전류가 흐르는 쪽으로 커진다. 남쪽 끝(화면 아래, φ=180°)에서 시작해 아홉 바퀴, 남쪽 끝에서 끝난다.
  // 세계 좌표: x 오른쪽, yN 북쪽(화면 위), z 보는 사람 쪽(종이 위). 앞(z>0)은 화면에서 오른쪽으로 k·z만큼 비켜 보인다.
  const TURNS = 9, PITCH = (HALF * 2) / TURNS, K = 0.3;
  const xL = CX - HALF;
  const helix = (phiDeg) => {
    const ph = (phiDeg * Math.PI) / 180;
    const x = xL + ((phiDeg - 180) / 360) * PITCH;
    const yN = R * Math.cos(ph), z = R * Math.sin(ph);
    return { sx: x + K * z, sy: B.cy - yN, z };
  };
  const backSegs = [], frontSegs = [];
  for (let i = 0; i < TURNS; i++) {
    const b = [], f = [];
    for (let d = 0; d <= 180; d += 4) {
      const q = helix(180 + 360 * i + d);
      b.push([q.sx, q.sy]);
    }
    for (let d = 180; d <= 360; d += 4) {
      const q = helix(180 + 360 * i + d);
      f.push([q.sx, q.sy]);
    }
    backSegs.push(b);
    frontSegs.push(f);
  }
  // 뒤쪽 반 바퀴(종이 아래로 지나는 쪽): 어둡게
  for (const seg of backSegs) tube(ctx, seg, { w: 4.4, edge: "#4A2410", base: "#8E5326", hi: "rgba(230,170,120,.35)" });
  clipPanel(B, () => LB.lines.forEach((l) => strokeLine(l.pts, [CX - HALF - 8, B.cy - R - 4, HALF * 2 + 16, R * 2 + 8])));
  // 앞쪽 반 바퀴: 밝은 구리
  for (const seg of frontSegs) tube(ctx, seg, { w: 4.6, edge: "#6A3510", base: "#D0843F", hi: "rgba(255,232,200,.95)" });

  // 전원(마른 전지, 눕혀 둠, 왼쪽 끝이 (+)극) 과 전선
  const by = B.cy + 92, bl = 66, br2 = 11;
  const bxa = CX - bl / 2, bxb = CX + bl / 2;
  const start = helix(180), end = helix(180 + 360 * TURNS);
  const leadL = [[start.sx, start.sy], [start.sx, by], [bxa - 7, by]];
  const leadR = [[end.sx, end.sy], [end.sx, by], [bxb + 1, by]];
  tube(ctx, leadL, { w: 3.6, edge: "#7A1E14", base: "#E8503C", hi: "rgba(255,210,200,.85)" });
  tube(ctx, leadR, { w: 3.6, edge: "#15181D", base: "#3A4048", hi: "rgba(200,210,225,.6)" });
  P.softShadow(t, CX + 4, by + br2 + 2, bl * 0.62, 4.5, 0.2);
  // 몸통
  ctx.save();
  ctx.beginPath();
  P.rrect(ctx, bxa, by - br2, bl, br2 * 2, 4);
  ctx.fillStyle = P.lg(ctx, 0, by - br2, 0, by + br2, [[0, "#6B7280"], [0.22, "#2B2F36"], [0.6, "#1B1E23"], [1, "#0E1013"]]);
  ctx.fill();
  ctx.clip();
  // 금빛 띠(+쪽)
  ctx.fillStyle = P.lg(ctx, 0, by - br2, 0, by + br2, [[0, "#FFE59A"], [0.25, "#E2B84A"], [0.7, "#B88A25"], [1, "#7A5A12"]]);
  ctx.fillRect(bxa, by - br2, bl * 0.36, br2 * 2);
  ctx.fillStyle = "rgba(255,255,255,.28)";
  ctx.fillRect(bxa + 2, by - br2 + 3, bl - 4, 2.2);
  ctx.restore();
  // (+)극 꼭지와 (−)극 바닥
  ctx.save();
  ctx.beginPath();
  P.rrect(ctx, bxa - 6, by - 4.5, 7, 9, 2);
  ctx.fillStyle = P.lg(ctx, 0, by - 4.5, 0, by + 4.5, [[0, "#F1F3F5"], [0.5, "#ADB5BD"], [1, "#6C757D"]]);
  ctx.fill();
  ctx.strokeStyle = "rgba(40,44,52,.5)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.beginPath();
  P.rrect(ctx, bxb - 1.5, by - br2 + 1, 3, br2 * 2 - 2, 1.5);
  ctx.fillStyle = P.lg(ctx, 0, by - br2, 0, by + br2, [[0, "#E9ECEF"], [1, "#868E96"]]);
  ctx.fill();
  ctx.restore();

  const angB = compSpots(B.cy).map(([x, y]) => {
    const [fx, fy] = LB.F(x, y);
    const a = Math.atan2(fy, fx);
    compass(P, t, x, y, 13, a);
    return a;
  });

  // ── 겹층: 화살촉, 전류, 이름표 ──
  const s = S.svgLayer(root, w, h);
  const head = (pts, d, color = COL.field) => {
    const a = polyAt(pts, d), b = polyAt(pts, d + 5);
    S.rayArrow(s, a.p, b.p, { color, w: 0, hl: 8, hw: 4.6 });
  };
  const nearest = (pts, ok, score) => {
    const len = polyLen(pts);
    let best = -1, bs = 1e9;
    for (let d = 0; d < len; d += 0.5) {
      const q = polyAt(pts, d).p;
      if (!ok(q)) continue;
      const sc = score(q);
      if (sc < bs) {
        bs = sc;
        best = d;
      }
    }
    return best;
  };
  // 코일 속 화살촉: 앞쪽 전선 5번과 6번 사이 틈의 가운데(그 높이에서)
  const gapX = (v) => {
    const ph = Math.acos(Math.max(-1, Math.min(1, -v / R)));
    const xAt = (i) => xL + (i + 0.5 + ph / (2 * Math.PI)) * PITCH + K * R * Math.sin(ph);
    return (xAt(5) + xAt(6)) / 2;
  };
  const arrowsOn = (L, cy, inside) => {
    for (const l of L.lines) {
      const pts = l.pts;
      const out = (q) => Math.abs(q[1] - cy) > R + 8 && q[0] > 14 && q[0] < w - 14 && q[1] > cy - 84 && q[1] < cy + 84;
      if (l.r0 === 0) {
        for (const xx of [CX - HALF - 62, CX + HALF + 62]) head(pts, nearest(pts, () => true, (q) => Math.abs(q[0] - xx)));
      } else if (l.closed) {
        head(pts, nearest(pts, out, (q) => Math.abs(q[0] - (CX - 24))));
      } else {
        const off = l.r0 <= 6 ? 74 : 40;
        for (const xx of [CX - HALF - off, CX + HALF + off]) {
          const d = nearest(pts, (q) => Math.abs(q[1] - cy) > 5 && q[1] > cy - 66 && q[1] < cy + 66, (q) => Math.abs(q[0] - xx));
          if (d >= 0) head(pts, d);
        }
      }
      if (inside && (l.r0 === 0 || l.r0 === 11)) {
        const gx = gapX(l.sg * l.r0);
        const d = nearest(pts, (q) => Math.abs(q[1] - cy) < R - 1 && Math.abs(q[0] - CX) < HALF, (q) => Math.abs(q[0] - (gx - 3)));
        if (d >= 0) {
          const a = polyAt(pts, d), b = polyAt(pts, d + 4);
          S.rayArrow(s, a.p, b.p, { color: COL.field, w: 0, hl: 6.5, hw: 3.6 });
        }
      }
    }
  };
  arrowsOn(LA, A.cy, false);
  arrowsOn(LB, B.cy, true);

  // 전류: 앞쪽 전선 셋(아래 방향), 왼쪽 전선(위로), 오른쪽 전선(아래로)
  for (const i of [1, 4, 7]) {
    const seg = frontSegs[i];
    const n = seg.length;
    curArrow(S, s, seg.slice(Math.floor(n * 0.2), Math.floor(n * 0.82)), { w: 3.2, head: 7.5, hw: 5 });
  }
  curArrow(S, s, [[start.sx, by - 4], [start.sx, by - 30]], { w: 3.4, head: 8, hw: 5.4 });
  curArrow(S, s, [[end.sx, B.cy + R + 8], [end.sx, B.cy + R + 34]], { w: 3.4, head: 8, hw: 5.4 });

  // 이름표
  S.tag(s, 24, A.y0 + 15, "(가)");
  S.tag(s, 24, B.y0 + 15, "(나)");
  S.label(s, 42, A.y0 + 20, "막대자석", { size: 14 });
  S.label(s, 42, B.y0 + 20, "전류가 흐르는 코일", { size: 14 });
  // 자석 몸통 글자와 두 끝의 이름(코일 칸과 같은 자리)
  S.label(s, CX - HALF / 2, A.cy + 6.5, "S", { size: 19, anchor: "middle", color: "#fff", halo: false, weight: 800 });
  S.label(s, CX + HALF / 2, A.cy + 6.5, "N", { size: 19, anchor: "middle", color: "#fff", halo: false, weight: 800 });
  S.label(s, CX - HALF - 6, A.cy - R - 9, "S극", { size: 14, anchor: "middle", color: "#1F5FAF" });
  S.label(s, CX + HALF + 6, A.cy - R - 9, "N극", { size: 14, anchor: "middle", color: "#B5321F" });
  S.label(s, CX - HALF - 6, B.cy - R - 9, "S극처럼", { size: 14, anchor: "middle", color: "#1F5FAF" });
  S.label(s, CX + HALF + 6, B.cy - R - 9, "N극처럼", { size: 14, anchor: "middle", color: "#B5321F" });
  // 자기장: 오른쪽 위 고리 선에
  for (const [L, p] of [[LA, A], [LB, B]]) {
    const loop = L.lines.find((l) => l.r0 === 11 && l.sg === -1);
    const d = nearest(loop.pts, (q) => q[0] > CX + HALF, (q) => Math.abs(q[1] - (p.cy - 52)));
    const q = polyAt(loop.pts, d).p;
    S.leader(s, [[q[0] + 26, p.y0 + 24], [q[0] + 16, p.y0 + 24], q]);
    S.label(s, q[0] + 30, p.y0 + 29, "자기장", { size: 14 });
  }
  const cR = compSpots(A.cy)[1];
  S.leader(s, [[cR[0] + 30, cR[1] + 34], [cR[0] + 22, cR[1] + 34], [cR[0] + 8, cR[1] + 10]]);
  S.label(s, cR[0] - 2, cR[1] + 50, "나침반", { size: 14 });
  S.label(s, start.sx - 9, by - 22, "전류", { size: 14, anchor: "end", color: "#8A5A00" });
  S.label(s, CX, by + 4.6, "전원", { size: 13.5, anchor: "middle", color: "#fff", halo: false, weight: 800 });
  S.label(s, bxa - 12, by + 22, "(+)", { size: 14, anchor: "middle" });
  S.label(s, bxb + 8, by + 22, "(−)", { size: 14, anchor: "middle" });

  window.__f2 = { angA, angB, lines: LB.lines.map((l) => ({ r0: l.r0, sg: l.sg, closed: l.closed, n: l.pts.length })) };
}
