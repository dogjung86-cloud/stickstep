// g2u4l5f1 염화 나트륨 결정: 소금 알갱이(정육면체) → 그 한 귀퉁이 속 이온의 입체 배열(나트륨 이온과 염화 이온이 세 방향으로 번갈아)
// → 이온 하나를 둘러싼 반대 이온 6개. 검산 메모는 g2u4l5f1.md
export const meta = {
  key: "g2u4l5f1",
  w: 340,
  h: 384,
  alt: "정육면체 모양의 소금 알갱이를 확대하면 작은 보라색 나트륨 이온과 큰 초록색 염화 이온이 가로, 세로, 높이로 번갈아 쌓여 있어요. 이온 하나는 반대 이온 6개에 둘러싸여 있어요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(5);

  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 공통: 3D 회전과 투영(정사영, 위에서 비스듬히) ──
  const yaw = -0.5, pitch = -0.44; // 위(윗면), 앞(앞면), 오른쪽(오른쪽 면)이 보이는 시점
  const rot = ([x, y, z]) => {
    const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
    const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
    const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
    return [x1, y2, z2]; // 화면 x, 화면 y(아래가 +), 깊이(클수록 앞)
  };

  // 이온 반지름(pm): Na⁺ 102, Cl⁻ 181(6배위). 이웃 중심 거리 = 283 pm(실측 282 pm)
  const RNA = 102, RCL = 181, DIST = RNA + RCL;
  const NA = "#9662E0", CL = "#3EBA58"; // chemKit ELEMS Na(150,98,224), Cl(62,186,88)

  // ── 큰 그림: 결정 한 귀퉁이(3×3×3 이온) ──
  const sc = 0.1; // pm → px
  const O = [176, 252]; // 덩어리 가운데의 화면 자리
  const NE = 4; // 한 변의 이온 수(4 × 4 × 4 = 64개, 나트륨 이온 32개와 염화 이온 32개)
  const ions = [];
  const c0 = (NE - 1) / 2;
  for (let i = 0; i < NE; i++)
    for (let j = 0; j < NE; j++)
      for (let k = 0; k < NE; k++) {
        const cl = (i + j + k) % 2 === 0; // 세 방향 모두 번갈아
        const p = rot([(i - c0) * DIST, -(j - c0) * DIST, (k - c0) * DIST]);
        ions.push({ i, j, k, cl, x: O[0] + p[0] * sc, y: O[1] + p[1] * sc, z: p[2], r: (cl ? RCL : RNA) * sc });
      }
  ions.sort((a, b) => a.z - b.z);
  // 덩어리 아래 그림자
  P.softShadow(t, O[0] + 8, O[1] + 112, 116, 15, 0.2);
  // 끝없이 이어짐: 덩어리 바깥 세 방향으로 흐린 이온 몇 개(뒤쪽 먼저)
  const ghost = [];
  for (const [di, dj, dk] of [[3, 0, 0], [3, 1, 0], [3, 2, 0], [0, 0, 3], [1, 0, 3], [2, 0, 3], [3, 0, 1], [3, 0, 2], [0, 3, 0], [1, 3, 0], [0, 3, 1]]) {
    const cl = (di + dj + dk) % 2 === 0;
    // 덩어리 밖으로 한 칸: i=3(오른쪽 뒤), k=3(앞쪽), j=3(아래)
    const p = rot([(di - 1) * DIST, -(dj - 1) * DIST, (dk - 1) * DIST]);
    ghost.push({ cl, x: O[0] + p[0] * sc, y: O[1] + p[1] * sc, z: p[2], r: (cl ? RCL : RNA) * sc });
  }
  // 흐린 이온은 그리지 않고 점선 고리로만(실제로 이어진다는 표시, 덩어리를 가리지 않게)
  const zMin = Math.min(...ions.map((q) => q.z)), zMax = Math.max(...ions.map((q) => q.z));
  const mixHex = (a, b, f) => {
    const A = P.hex(a), B2 = P.hex(b);
    return "#" + [0, 1, 2].map((q) => Math.round(A[q] + (B2[q] - A[q]) * f).toString(16).padStart(2, "0")).join("");
  };
  for (const b of ions) {
    const fog = 0.28 * (1 - (b.z - zMin) / (zMax - zMin || 1));
    // 접촉 그늘: 앞 이온이 뒤 이온에 드리우는 어둠
    ctx.save();
    ctx.fillStyle = P.rg(ctx, b.x + b.r * 0.12, b.y + b.r * 0.18, b.r * 0.85, b.x + b.r * 0.12, b.y + b.r * 0.18, b.r * 1.28, [[0, "rgba(30,25,45,.32)"], [1, "rgba(30,25,45,0)"]]);
    ctx.beginPath();
    ctx.arc(b.x + b.r * 0.12, b.y + b.r * 0.18, b.r * 1.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    P.sphere(t, b.x, b.y, b.r, mixHex(b.cl ? CL : NA, "#E8ECF2", fog), { spec: 0.5, gloss: 30, rim: 0.2, bounce: b.cl ? "#D3F9D8" : "#E5DBFF", wrap: 0.3 });
  }
  // 앞에 보이는 이온에 전하 표시(가운데가 가려지지 않은 이온만)
  const visible = (b, idx) => !ions.slice(idx + 1).some((c) => Math.hypot(c.x - b.x, c.y - b.y) < c.r + b.r * 0.42);
  ions.forEach((b, idx) => {
    if (!visible(b, idx)) return;
    const k = b.cl ? b.r * 0.34 : b.r * 0.42;
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(20,30,20,.28)";
    ctx.lineWidth = b.cl ? 2.8 : 2.2;
    const draw = (dx, dy) => {
      ctx.beginPath();
      ctx.moveTo(b.x - k + dx, b.y + dy);
      ctx.lineTo(b.x + k + dx, b.y + dy);
      if (!b.cl) {
        ctx.moveTo(b.x + dx, b.y - k + dy);
        ctx.lineTo(b.x + dx, b.y + k + dy);
      }
      ctx.stroke();
    };
    draw(0.5, 0.8);
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = b.cl ? 2.4 : 1.9;
    draw(0, 0);
    ctx.restore();
  });

  // ── 왼쪽 위: 소금 알갱이(돋보기 원 속 정육면체) ──
  const G = [70, 78], GR = 54;
  P.dropShadow(t, (c) => c.arc(G[0], G[1], GR, 0, Math.PI * 2), { dx: 2, dy: 5, blur: 12, a: 0.22 });
  ctx.save();
  ctx.beginPath();
  ctx.arc(G[0], G[1], GR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = P.rg(ctx, G[0] - 18, G[1] - 22, 4, G[0], G[1], GR, [[0, "#4A5568"], [1, "#2A3140"]]);
  ctx.fillRect(G[0] - GR, G[1] - GR, 2 * GR, 2 * GR);
  // 정육면체 알갱이: 같은 회전으로 그린다
  const s = 30;
  const V = (x, y, z) => {
    const p = rot([x * s, -y * s, z * s]);
    return [G[0] + 2 + p[0], G[1] + 6 + p[1]];
  };
  const face = (pts, c0, c1, a0, a1) => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, a0[0], a0[1], a1[0], a1[1], [[0, c0], [1, c1]]);
    ctx.fill();
  };
  // 아래 그림자
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.beginPath();
  ctx.ellipse(G[0] + 6, G[1] + 34, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // 여섯 면 가운데 시점 쪽을 보는 면만(회전한 법선의 깊이 성분 > 0), 뒤에서 앞 차례로
  const faces = [
    { n: [0, 1, 0], v: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]], c: ["#FFFFFF", "#E3E9F0"] },
    { n: [0, -1, 0], v: [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]], c: ["#8E9AAB", "#6F7B8C"] },
    { n: [0, 0, 1], v: [[-1, 1, 1], [1, 1, 1], [1, -1, 1], [-1, -1, 1]], c: ["#D9E1EA", "#AFBBC9"] },
    { n: [0, 0, -1], v: [[-1, 1, -1], [1, 1, -1], [1, -1, -1], [-1, -1, -1]], c: ["#D9E1EA", "#AFBBC9"] },
    { n: [1, 0, 0], v: [[1, 1, 1], [1, 1, -1], [1, -1, -1], [1, -1, 1]], c: ["#C3CDD9", "#93A1B3"] },
    { n: [-1, 0, 0], v: [[-1, 1, 1], [-1, 1, -1], [-1, -1, -1], [-1, -1, 1]], c: ["#C3CDD9", "#93A1B3"] },
  ];
  const shown = faces
    .map((f) => ({ ...f, nz: rot([f.n[0], -f.n[1], f.n[2]])[2], pts: f.v.map((q) => V(...q)) }))
    .filter((f) => f.nz > 0.02);
  for (const f of shown) {
    const xs = f.pts.map((p) => p[1]);
    face(f.pts, f.c[0], f.c[1], f.pts[0], f.pts[2]);
    void xs;
  }
  // 반투명 결정의 결(앞면에 옅은 계단 줄)과 모서리 빛
  const vis = (n) => rot([n[0], -n[1], n[2]])[2] > 0.02;
  ctx.strokeStyle = "rgba(255,255,255,.5)";
  ctx.lineWidth = 0.8;
  if (vis([0, 0, 1]))
    for (const f of [0.34, 0.67]) {
      const a1 = V(-1 + 2 * f, 1, 1), b1 = V(-1 + 2 * f, -1, 1);
      ctx.beginPath();
      ctx.moveTo(a1[0], a1[1]);
      ctx.lineTo(b1[0], b1[1]);
      ctx.stroke();
    }
  ctx.strokeStyle = "rgba(255,255,255,.95)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (const [p0, p1] of [[[-1, 1, 1], [1, 1, 1]], [[1, 1, 1], [1, 1, -1]], [[1, 1, 1], [1, -1, 1]]]) {
    ctx.moveTo(...V(...p0));
    ctx.lineTo(...V(...p1));
  }
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.arc(G[0], G[1], GR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "#A9B3C1";
  ctx.beginPath();
  ctx.arc(G[0], G[1], GR + 2.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  // 알갱이의 앞 위 꼭짓점(1,1,1) → 큰 덩어리 쪽으로 확대 통로
  const corner = V(1, 1, 1);
  {
    const L0 = ions.reduce((m, q) => (q.x - q.r < m.x - m.r ? q : m), ions[0]);
    const T0 = ions.reduce((m, q) => (q.y - q.r < m.y - m.r ? q : m), ions[0]);
    const pl = [L0.x - L0.r, L0.y], pt = [T0.x, T0.y - T0.r];
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = P.lg(ctx, corner[0], corner[1], O[0], O[1], [[0, "rgba(120,135,160,.22)"], [1, "rgba(120,135,160,.05)"]]);
    ctx.beginPath();
    ctx.moveTo(corner[0], corner[1]);
    ctx.lineTo(pl[0], pl[1]);
    ctx.lineTo(O[0], O[1]);
    ctx.lineTo(pt[0], pt[1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(120,135,160,.55)";
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(corner[0], corner[1]);
    ctx.lineTo(pl[0], pl[1]);
    ctx.moveTo(corner[0], corner[1]);
    ctx.lineTo(pt[0], pt[1]);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#FFD43B";
    ctx.beginPath();
    ctx.arc(corner[0], corner[1], 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── 오른쪽 위: 이온 하나와 이웃 6개(막대로 이은 모형) ──
  const Q = [272, 92], QR = 58;
  P.dropShadow(t, (c) => c.arc(Q[0], Q[1], QR, 0, Math.PI * 2), { dx: 2, dy: 5, blur: 12, a: 0.2 });
  ctx.save();
  ctx.beginPath();
  ctx.arc(Q[0], Q[1], QR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = P.rg(ctx, Q[0] - 18, Q[1] - 22, 4, Q[0], Q[1], QR, [[0, "#FFFFFF"], [1, "#E9EDF2"]]);
  ctx.fillRect(Q[0] - QR, Q[1] - QR, 2 * QR, 2 * QR);
  const qs = 0.135;
  const oct = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map((v) => {
    const p = rot(v.map((c) => c * DIST));
    return { x: Q[0] + p[0] * qs, y: Q[1] + 4 + p[1] * qs, z: p[2] };
  });
  const cen = { x: Q[0], y: Q[1] + 4, z: 0 };
  const balls = [...oct.map((o) => ({ ...o, cl: true })), { ...cen, cl: false }].sort((a, b) => a.z - b.z);
  const rb = (cl) => (cl ? RCL : RNA) * qs * 0.45; // 막대 모형: 공을 줄여 이웃이 보이게(크기 비는 그대로)
  for (const b of balls) {
    if (b.cl) {
      // 막대(가운데 이온과 잇는다): 이 이웃 공보다 먼저
      ctx.strokeStyle = "rgba(120,130,145,.9)";
      ctx.lineWidth = 3.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cen.x, cen.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cen.x - 0.6, cen.y - 0.6);
      ctx.lineTo(b.x - 0.6, b.y - 0.6);
      ctx.stroke();
    }
    P.sphere(t, b.x, b.y, rb(b.cl), b.cl ? CL : NA, { spec: 0.55, gloss: 32, rim: 0.2, bounce: b.cl ? "#D3F9D8" : "#E5DBFF" });
  }
  ctx.restore();
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.arc(Q[0], Q[1], QR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "#A9B3C1";
  ctx.beginPath();
  ctx.arc(Q[0], Q[1], QR + 2.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ── 겹층: 라벨 ──
  const sv = S.svgLayer(root, w, h);
  S.label(sv, G[0], G[1] + GR + 20, "소금 알갱이", { size: 14, anchor: "middle" });
  S.label(sv, Q[0], Q[1] + QR + 20, "이웃은 반대 이온 6개", { size: 13.5, anchor: "middle" });
  // 이온 이름(이온식은 위 첨자로)
  const ionLabel = (x, y, name, sym, sup, anchor = "start") => {
    const g = S.el(sv, "text", {
      x, y, "text-anchor": anchor, "font-size": 14, "font-weight": 700, fill: "#26303D",
      "paint-order": "stroke", stroke: "#fff", "stroke-width": 3.6, "stroke-linejoin": "round",
      "font-family": "'Pretendard Variable', Pretendard, sans-serif",
    });
    S.el(g, "tspan", {}, name + " ");
    S.el(g, "tspan", {}, sym);
    S.el(g, "tspan", { "font-size": 10.5, dy: -6 }, sup);
    return g;
  };
  // 왼쪽 아래 앞 염화 이온, 앞쪽 나트륨 이온을 짚는다
  const front = ions.filter((b, idx) => visible(b, idx));
  const pickCl = front.filter((b) => b.cl).sort((a, b) => a.x - b.x)[0];
  const pickNa = front.filter((b) => !b.cl).sort((a, b) => (b.x + b.y * 0.6) - (a.x + a.y * 0.6))[0];
  S.leader(sv, [[40, 352], [pickCl.x - pickCl.r * 0.45, pickCl.y + pickCl.r * 0.5]]);
  ionLabel(12, 370, "염화 이온", "Cl", "−", "start");
  S.leader(sv, [[300, 352], [pickNa.x + pickNa.r * 0.3, pickNa.y + pickNa.r * 0.5]]);
  ionLabel(330, 370, "나트륨 이온", "Na", "+", "end");
  void ghost;
}
