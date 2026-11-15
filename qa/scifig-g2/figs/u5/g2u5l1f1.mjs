// g2u5l1f1 잎의 단면: 광합성의 재료가 들어오는 길. 빛은 잎 위에서, 물은 잎맥의 물관으로, 이산화 탄소는 기공으로 들어오고
// 엽록체가 가득한 잎살 세포에서 광합성이 일어나며, 산소는 기공으로 나간다. 검산 메모는 g2u5l1f1.md
export const meta = {
  key: "g2u5l1f1",
  w: 340,
  h: 404,
  alt: "잎을 잘라 본 단면. 위 표피 아래에 엽록체가 가득한 길쭉한 세포가 빽빽하고, 그 아래 둥근 세포 사이에 공기 틈이 있어요. 잎맥 속 물관으로 물이 들어오고, 아래 표피의 기공으로 이산화 탄소가 들어오고 산소가 나가요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N, cells: C } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(23);
  const rnd = N.rng(9);
  const R = (a, b) => a + (b - a) * rnd();

  P.plate(t, nz, { top: "#FDFDFB", bottom: "#F1F4EE", grain: 0.012 });
  // 왼쪽 위 햇빛(따뜻한 빛 번짐)
  ctx.fillStyle = P.rg(ctx, 0, 0, 0, 0, 0, 190, [[0, "rgba(255,226,140,.55)"], [0.5, "rgba(255,236,170,.18)"], [1, "rgba(255,236,170,0)"]]);
  ctx.fillRect(0, 0, w, h);

  // ── 덩어리 기하 ──
  const F = { x: 62, y: 128, w: 222, h: 190 }; // 앞면(자른 면)
  const D = [48, -40]; // 안쪽으로 들어가는 방향
  const L = { cu: 3, epU: 19, pal: 78, spg: 171, epL: 186 }; // 층의 경계(앞면 위에서부터)
  const X = (u) => F.x + u, Y = (v) => F.y + v;
  const B = [X(64), Y(126)]; // 잎맥(관다발) 가운데
  const ST = X(158); // 기공 자리
  const GAP = 3.2; // 기공 구멍의 반쪽 너비

  P.softShadow(t, F.x + F.w / 2 + 22, F.y + F.h + 8, F.w * 0.66, 11, 0.16);

  // ── 윗면(잎 겉) ──
  const top = [[F.x, F.y], [F.x + F.w, F.y], [F.x + F.w + D[0], F.y + D[1]], [F.x + D[0], F.y + D[1]]];
  ctx.save();
  ctx.beginPath();
  top.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = P.lg(ctx, F.x, F.y, F.x + D[0] + 60, F.y + D[1], [[0, "#62AC3E"], [1, "#82C455"]]);
  ctx.fillRect(0, 0, w, h);
  const seeds = [];
  for (let i = 0; i < 220; i++) seeds.push([R(0, 1) * 300, R(0, 1) * 70]);
  const near = N.makeCells(seeds, 14);
  P.shade(t, { x: F.x, y: F.y + D[1], w: F.w + D[0], h: -D[1] }, (x, y) => {
    const v = (y - F.y) / D[1];
    const u = (x - F.x - v * D[0]) / F.w;
    if (u < -0.01 || u > 1.01 || v < -0.01 || v > 1.01) return null;
    const c = near(u * 300, v * 70);
    const line = P.smooth(1.5, 0.15, c.d2 - c.d1);
    return [232, 248, 206, line * 0.32];
  });
  const vein0 = [B[0], F.y], vein1 = [B[0] + D[0], F.y + D[1]];
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(50,100,25,.32)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(vein0[0] + 1.6, vein0[1] + 1.2);
  ctx.lineTo(vein1[0] + 1.6, vein1[1] + 1.2);
  ctx.stroke();
  ctx.strokeStyle = "#A6D474";
  ctx.lineWidth = 7.5;
  ctx.beginPath();
  ctx.moveTo(vein0[0], vein0[1]);
  ctx.lineTo(vein1[0], vein1[1]);
  ctx.stroke();
  ctx.strokeStyle = "rgba(240,255,220,.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(vein0[0] - 1.5, vein0[1] - 0.5);
  ctx.lineTo(vein1[0] - 1.5, vein1[1] - 0.5);
  ctx.stroke();
  ctx.fillStyle = P.lg(ctx, F.x + 30, F.y - 30, F.x + 170, F.y + 10, [[0, "rgba(255,255,255,0)"], [0.45, "rgba(255,255,255,.26)"], [0.62, "rgba(255,255,255,.04)"], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // ── 오른쪽 옆면: 같은 층을 비스듬히, 연하게 ──
  const sideQuad = (v0, v1) => {
    const a = [F.x + F.w, Y(v0)], b = [F.x + F.w + D[0], Y(v0) + D[1]], c = [F.x + F.w + D[0], Y(v1) + D[1]], d = [F.x + F.w, Y(v1)];
    return [a, b, c, d];
  };
  const fillQuad = (q, c0, c1) => {
    ctx.beginPath();
    q.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, q[0][0], q[0][1], q[1][0], q[1][1], [[0, c0], [1, c1]]);
    ctx.fill();
  };
  fillQuad(sideQuad(0, L.epU), "#C9D6C2", "#B6C5AE");
  fillQuad(sideQuad(L.epU, L.pal), "#7DB65C", "#6BA34C");
  fillQuad(sideQuad(L.pal, L.spg), "#B4D49A", "#A0C487");
  fillQuad(sideQuad(L.spg, F.h), "#C6D3BE", "#B3C2AA");
  ctx.save();
  ctx.beginPath();
  sideQuad(0, F.h).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  ctx.clip();
  // 울타리층: 세포 경계가 세로 줄로
  for (let k = 0; k < 16; k++) {
    const f = (k + 0.5) / 16;
    const x = F.x + F.w + D[0] * f, y = F.y + D[1] * f;
    ctx.strokeStyle = "rgba(235,250,220,.55)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y + L.epU + 2);
    ctx.lineTo(x, y + L.pal - 2);
    ctx.stroke();
  }
  // 해면층: 세포와 공기 틈이 성기게
  P.shade(t, { x: F.x + F.w, y: F.y + D[1], w: D[0], h: F.h - D[1] }, (x, y) => {
    const f = (x - F.x - F.w) / D[0];
    const v = y - F.y - D[1] * f;
    if (v < L.pal + 1 || v > L.spg - 1) return null;
    const n = nz.fbm(x * 0.2, (y - D[1] * f) * 0.2, 3);
    return n > 0.16 ? [242, 249, 234, P.clamp((n - 0.16) * 2) * 0.45] : null;
  });
  // 옆면 그늘
  ctx.fillStyle = "rgba(30,50,25,.10)";
  ctx.fillRect(F.x + F.w, 0, D[0], h);
  ctx.restore();

  // ── 앞면(자른 면) ──
  ctx.save();
  ctx.beginPath();
  ctx.rect(F.x, F.y, F.w, F.h);
  ctx.clip();
  // 공기 틈 바탕(해면층은 공기가 많아 밝고 깊다)
  ctx.fillStyle = "#EDF5E3";
  ctx.fillRect(F.x, F.y, F.w, F.h);
  P.shade(t, { x: F.x, y: Y(L.pal), w: F.w, h: L.spg - L.pal }, (x, y) => {
    const n = nz.fbm(x * 0.05, y * 0.05, 2);
    return [214, 232, 200, 0.28 + 0.12 * n];
  });

  const epCell = (x, cw, y0, y1) =>
    C.cell(t, [[x + 0.6, y0], [x + cw - 0.6, y0], [x + cw - 0.6, y1], [x + 0.6, y1]], {
      round: 4, fill: ["#F7FBF8", "#E0EBE5"], inner: "rgba(120,150,140,.2)", edge: "rgba(110,140,120,.72)", vac: "rgba(255,255,255,.55)",
    });
  // 위 표피
  let x = F.x - R(4, 10);
  while (x < F.x + F.w) {
    const cw = R(15, 23);
    epCell(x, cw, Y(L.cu) + 0.6, Y(L.epU) - 0.6);
    x += cw;
  }
  // 아래 표피(기공 자리를 비운다)
  x = F.x - R(2, 8);
  while (x < F.x + F.w) {
    let cw = R(15, 22);
    const g0 = ST - GAP - 13, g1 = ST + GAP + 13;
    if (x + cw > g0 && x < g1) {
      if (x < g0) cw = g0 - x;
      else {
        x = g1;
        continue;
      }
    }
    if (cw > 4) epCell(x, cw, Y(L.spg) + 0.6, Y(L.epL) - 0.6);
    x += cw;
  }
  // 큐티클: 위는 통째로, 아래는 기공 구멍에서 끊긴다
  const cut = (y0, y1, x0, x1) => {
    ctx.fillStyle = P.lg(ctx, 0, y0, 0, y1, [[0, "#F4F2D8"], [1, "#D8D4A4"]]);
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  };
  cut(F.y, Y(L.cu), F.x, F.x + F.w);
  cut(Y(L.epL), F.y + F.h, F.x, ST - GAP);
  cut(Y(L.epL), F.y + F.h, ST + GAP, F.x + F.w);

  // 울타리 조직
  x = F.x - R(3, 8);
  const palCells = [];
  while (x < F.x + F.w + 6) {
    const cw = R(14.5, 17.5);
    const y0 = Y(L.epU) + R(0.8, 1.8), y1 = Y(L.pal) - R(1, 6);
    palCells.push({ x, cw, y0, y1 });
    C.cell(t, [[x + 0.8, y0], [x + cw - 0.8, y0], [x + cw - 0.8, y1], [x + 0.8, y1]], { round: 5, fill: ["#DDF1C6", "#B6DB92"], inner: "rgba(50,110,30,.28)", edge: "rgba(78,122,52,.8)" });
    const n = Math.round((y1 - y0) / 7.2);
    for (let i = 0; i < n; i++) {
      const yy = y0 + 5 + ((y1 - y0 - 10) * (i + 0.5)) / n + R(-1, 1);
      for (const sd of [0, 1]) {
        const xx = sd ? x + cw - 3.6 + R(-0.4, 0.4) : x + 3.6 + R(-0.4, 0.4);
        C.chloroplast(t, xx, yy, 2.15, 3.3, R(-0.25, 0.25));
      }
    }
    x += cw;
  }

  // 해면 조직: 보로노이로 나눈 세포를 줄여 틈을 만들고, 몇 칸은 비워 큰 공기 틈을 낸다
  const band = { y0: Y(L.pal) + 1, y1: Y(L.spg) - 1 };
  const bundleR = (px, py) => Math.hypot((px - B[0]) / 33, (py - B[1]) / 29);
  const seedsS = [];
  for (let tries = 0; tries < 4000 && seedsS.length < 70; tries++) {
    const px = R(F.x - 10, F.x + F.w + 10), py = R(band.y0 + 4, band.y1 - 4);
    if (bundleR(px, py) < 1.25) continue;
    if (seedsS.some((s) => Math.hypot(s[0] - px, s[1] - py) < 19.5)) continue;
    seedsS.push([px, py]);
  }
  const chamber = [ST, Y(L.spg) - 8, 17]; // 기공 위 공기 방
  for (const [sx, sy] of seedsS) {
    if (Math.hypot(sx - chamber[0], sy - chamber[1]) < chamber[2] + 6) continue;
    if (rnd() < 0.16) continue; // 큰 공기 틈
    const poly = [];
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const u = [Math.cos(a), Math.sin(a)];
      let tmin = 14;
      for (const [ox, oy] of seedsS) {
        if (ox === sx && oy === sy) continue;
        const dx = ox - sx, dy = oy - sy;
        const dot = dx * u[0] + dy * u[1];
        if (dot <= 0) continue;
        tmin = Math.min(tmin, (dx * dx + dy * dy) / (2 * dot));
      }
      // 띠의 위아래, 잎맥 둘레, 기공 방에서 멈춘다
      if (u[1] < 0) tmin = Math.min(tmin, (sy - band.y0) / -u[1]);
      if (u[1] > 0) tmin = Math.min(tmin, (band.y1 - sy) / u[1]);
      for (let tt = 0; tt < tmin; tt += 0.8) {
        const qx = sx + u[0] * tt, qy = sy + u[1] * tt;
        if (bundleR(qx, qy) < 1.12 || Math.hypot(qx - chamber[0], qy - chamber[1]) < chamber[2]) {
          tmin = tt;
          break;
        }
      }
      const r = Math.max(3, tmin - R(0.7, 1.7));
      poly.push([sx + u[0] * r, sy + u[1] * r]);
    }
    C.cell(t, poly, { round: 7, fill: ["#E3F2D1", "#BCDE9C"], inner: "rgba(60,110,40,.24)", edge: "rgba(84,126,58,.75)", shadow: "rgba(40,70,30,.22)", shadowBlur: 2.5 });
    const k = 6;
    for (let i = 0; i < k; i++) {
      const p = poly[Math.floor((i / k) * n + 1) % n];
      const qx = sx + (p[0] - sx) * 0.72, qy = sy + (p[1] - sy) * 0.72;
      C.chloroplast(t, qx, qy, 2.0, 2.9, Math.atan2(p[1] - sy, p[0] - sx) + Math.PI / 2);
    }
  }

  // 관다발(잎맥)
  {
    const [bx, by] = B;
    ctx.beginPath();
    ctx.ellipse(bx, by, 33, 29, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#EEF4E2";
    ctx.fill();
    const ring = 15;
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2;
      const cx = bx + Math.cos(a) * 27.5, cy = by + Math.sin(a) * 24;
      const pts = [];
      for (let j = 0; j < 9; j++) {
        const b = (j / 9) * Math.PI * 2;
        pts.push([cx + Math.cos(b) * 6.2, cy + Math.sin(b) * 5.6]);
      }
      C.cell(t, pts, { round: 4, fill: ["#F2F8E8", "#D8EBC5"], inner: "rgba(80,120,50,.18)", edge: "rgba(100,140,70,.7)" });
    }
    // 물관: 위쪽 반, 두꺼운 벽(나무질)의 빈 관이 줄지어
    const xy = [
      [-11, -14, 4.4], [-1, -16, 5.0], [10, -13, 4.2], [-6, -6, 3.6], [5, -6.5, 4.0], [14, -4, 3.0], [-14, -4, 2.9], [-2, 1, 2.6], [8, 2.5, 2.4],
    ];
    for (const [dx, dy, r] of xy) {
      const cx = bx + dx, cy = by + dy;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 1.7, 0, Math.PI * 2);
      ctx.fillStyle = P.rg(ctx, cx - 1, cy - 1, 0.5, cx, cy, r + 1.7, [[0, "#D9B36C"], [1, "#9C6E2E"]]);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = P.rg(ctx, cx + r * 0.3, cy + r * 0.35, 0.2, cx, cy, r, [[0, "#FFFDF5"], [1, "#EADFC4"]]);
      ctx.fill();
    }
    // 체관: 아래쪽 작은 세포들
    for (let i = 0; i < 18; i++) {
      const a = Math.PI * (0.1 + 0.8 * (i / 17));
      const rr = 7 + (i % 3) * 4;
      const cx = bx + Math.cos(a) * rr * 1.15, cy = by + 8.5 + Math.sin(a) * rr * 0.7;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.3 + (i % 2) * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = "#DDEBCB";
      ctx.fill();
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = "rgba(90,130,70,.8)";
      ctx.stroke();
    }
  }

  // 기공: 공변세포 둘과 그 사이 구멍
  {
    const gy = Y(L.spg) + 8;
    // 구멍(어두운 틈): 바깥과 공기 방을 잇는다
    ctx.fillStyle = P.lg(ctx, 0, gy - 9, 0, F.y + F.h, [[0, "#DCE8D2"], [1, "#B8C7AE"]]);
    ctx.fillRect(ST - GAP, gy - 9, GAP * 2, F.y + F.h - gy + 9);
    for (const sgn of [-1, 1]) {
      const cx = ST + sgn * (GAP + 5.6);
      const pts = [];
      for (let j = 0; j < 14; j++) {
        const b = (j / 14) * Math.PI * 2;
        let rx = 6.2, ry = 8;
        if (Math.cos(b) * -sgn > 0.55) rx *= 0.84;
        pts.push([cx + Math.cos(b) * rx, gy + Math.sin(b) * ry]);
      }
      C.cell(t, pts, { round: 5, fill: ["#D5EDB8", "#A9D27F"], inner: "rgba(50,110,30,.3)", edge: "rgba(70,115,45,.85)" });
      for (let k = 0; k < 4; k++) C.chloroplast(t, cx + sgn * 1.2 + R(-1.2, 1.2), gy - 4.5 + k * 3, 1.5, 2.1, R(0, 3));
    }
  }
  ctx.restore();
  // 자른 면 가장자리
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(F.x, F.y + F.h);
  ctx.lineTo(F.x, F.y);
  ctx.lineTo(F.x + F.w, F.y);
  ctx.stroke();
  ctx.strokeStyle = "rgba(60,90,50,.32)";
  ctx.lineWidth = 1;
  ctx.strokeRect(F.x, F.y, F.w, F.h);
  ctx.restore();


  // ── 오른쪽 위: 자른 자리를 알려 주는 작은 잎 ──
  {
    const c = [292, 38], ang = -0.42, Lh = 34, Wh = 15;
    ctx.save();
    ctx.translate(c[0], c[1]);
    ctx.rotate(ang);
    const leaf = (k = 1) => {
      ctx.beginPath();
      ctx.moveTo(-Lh * k, 0);
      ctx.bezierCurveTo(-Lh * 0.55 * k, -Wh * 1.25 * k, Lh * 0.45 * k, -Wh * 1.05 * k, Lh * k, 0);
      ctx.bezierCurveTo(Lh * 0.45 * k, Wh * 1.05 * k, -Lh * 0.55 * k, Wh * 1.25 * k, -Lh * k, 0);
      ctx.closePath();
    };
    ctx.shadowColor = "rgba(30,60,20,.28)";
    ctx.shadowBlur = 4 * t.dpr;
    ctx.shadowOffsetY = 2 * t.dpr;
    leaf();
    ctx.fillStyle = P.lg(ctx, 0, -Wh, 0, Wh, [[0, "#86C95A"], [1, "#4E9A30"]]);
    ctx.fill();
    ctx.shadowColor = "transparent";
    // 잎자루와 가운데 잎맥, 곁잎맥
    ctx.strokeStyle = "#5C8F33";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-Lh - 9, 2);
    ctx.lineTo(-Lh, 0);
    ctx.stroke();
    ctx.strokeStyle = "rgba(225,245,200,.85)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-Lh, 0);
    ctx.lineTo(Lh - 2, 0);
    ctx.stroke();
    ctx.lineWidth = 0.7;
    for (let i = -3; i <= 3; i++) {
      if (!i) continue;
      const x0 = (i / 4) * Lh * 0.8;
      for (const sg of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        ctx.quadraticCurveTo(x0 + 5, sg * 5, x0 + 9, sg * Wh * 0.72 * (1 - Math.abs(i) / 5));
        ctx.stroke();
      }
    }
    // 광택
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.beginPath();
    ctx.ellipse(-4, -Wh * 0.45, Lh * 0.55, Wh * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    // 자른 자리(가운데를 가로지르는 점선)
    ctx.setLineDash([3, 2.4]);
    ctx.strokeStyle = "#C2255C";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(4, -Wh - 6);
    ctx.lineTo(4, Wh + 6);
    ctx.stroke();
    ctx.restore();
  }

  // ── 겹층 ──
  const s = S.svgLayer(root, w, h);
  // 빛
  for (const [ax, ay] of [[F.x + 18, F.y - 6], [F.x + 86, F.y - 30]]) S.rayArrow(s, [ax - 36, ay - 48], [ax, ay], { color: "#F08C00", w: 1.8, hl: 7, hw: 4, glow: "#FFE8A3" });
  S.label(s, 20, 44, "빛", { size: 14 });
  S.label(s, 304, 76, "자른 곳", { size: 13.5, anchor: "middle", color: "#C2255C" });
  // 물: 잎맥을 따라 안쪽에서 앞쪽으로
  S.fatArrow(s, [[vein1[0] - 2, vein1[1] + 2], [B[0] + D[0] * 0.2, F.y + D[1] * 0.2]], { fill: "#339AF0", w0: 3, w1: 5.5, head: 9, hw: 7 });
  S.label(s, vein1[0] + 9, vein1[1] + 3, "물", { size: 14 });
  // 엽록체(왼쪽 칸)
  const pc = palCells[1];
  S.leader(s, [[52, 168], [pc.x + 3.6, 168]]);
  S.label(s, 50, 173, "엽록체", { size: 14, anchor: "end" });
  // 물관(왼쪽 칸)
  S.leader(s, [[52, B[1] - 12], [B[0] - 9, B[1] - 12]]);
  S.label(s, 50, B[1] - 7, "물관", { size: 14, anchor: "end" });
  // 기공
  S.leader(s, [[ST - 60, 346], [ST - 40, 346], [ST, Y(L.spg) + 12]]);
  S.label(s, ST - 64, 351, "기공", { size: 14, anchor: "end" });
  // 이산화 탄소(들어옴), 산소(나감)
  const curve = (a, b, c, n = 14) => Array.from({ length: n + 1 }, (_, i) => {
    const t2 = i / n;
    return [(1 - t2) ** 2 * a[0] + 2 * (1 - t2) * t2 * b[0] + t2 ** 2 * c[0], (1 - t2) ** 2 * a[1] + 2 * (1 - t2) * t2 * b[1] + t2 ** 2 * c[1]];
  });
  S.fatArrow(s, curve([ST - 46, 392], [ST - 12, 374], [ST - 4, F.y + F.h + 5]), { fill: "#8E7BE6", w0: 4.5, w1: 7, head: 13, hw: 10, sw: 1 });
  S.fatArrow(s, curve([ST + 4, F.y + F.h + 5], [ST + 12, 374], [ST + 46, 390]), { fill: "#4DABF7", w0: 4.5, w1: 7, head: 13, hw: 10, sw: 1 });
  S.label(s, ST - 52, 397, "이산화 탄소", { size: 14, anchor: "end" });
  S.label(s, ST + 52, 395, "산소", { size: 14 });
}
