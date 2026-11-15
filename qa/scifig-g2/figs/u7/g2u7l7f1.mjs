// g2u7l7f1 막대자석 주위의 자기장: 종이 위 쇳가루가 늘어선 무늬와, 둘레에 놓은 나침반 바늘의 N극이 가리키는 방향.
// 자기장은 자석 양 끝면의 자극(N극 +, S극 −)이 만드는 장을 계산해서 그린다(눈대중 없음). 검산 메모는 g2u7l7f1.md
export const meta = {
  key: "g2u7l7f1",
  w: 340,
  h: 300,
  alt: "막대자석 주위에 뿌린 쇳가루가 N극과 S극을 잇는 굽은 줄무늬로 늘어서 있고, 둘레에 놓은 나침반 바늘의 N극이 자석의 N극에서 나와 S극으로 들어가는 방향을 가리켜요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(31);
  const rnd = N.rng(17);

  // ── 종이 ──
  ctx.fillStyle = P.lg(ctx, 0, 0, w, h, [[0, "#FFFFFF"], [1, "#F2F1EC"]]);
  ctx.fillRect(0, 0, w, h);
  P.shade(t, { x: 0, y: 0, w, h }, (x, y) => {
    const n = nz.fbm(x * 0.6, y * 0.08, 3); // 종이 섬유결(가로로 긴)
    const v = n > 0 ? 255 : 120;
    return [v, v, v - 6, Math.abs(n) * 0.06];
  });

  // ── 자석과 자기장 모형 ──
  const C = [170, 150];
  const half = 74, thick = 18; // 반 길이, 반 두께
  const box = { x0: C[0] - half, x1: C[0] + half, y0: C[1] - thick, y1: C[1] + thick };
  // 자극: 양 끝면에 고르게 퍼진 점 자극 7개씩(N극 +1, S극 −1). 3차원 거리 제곱 반비례 장을 종이 평면에서 계산.
  const poles = [];
  for (let i = 0; i < 7; i++) {
    const yy = C[1] - thick * 0.8 + (thick * 1.6 * i) / 6;
    poles.push([box.x0 + 3, yy, +1]);
    poles.push([box.x1 - 3, yy, -1]);
  }
  const field = (x, y) => {
    let bx = 0, by = 0;
    for (const [px, py, q] of poles) {
      const dx = x - px, dy = y - py;
      const r2 = dx * dx + dy * dy + 9; // 3D에서 종이 위 약간의 높이
      const r3 = r2 * Math.sqrt(r2);
      bx += (q * dx) / r3;
      by += (q * dy) / r3;
    }
    return [bx, by];
  };
  const inMag = (x, y, m = 0) => x > box.x0 - m && x < box.x1 + m && y > box.y0 - m && y < box.y1 + m;

  // ── 쇳가루: 자기장 방향으로 늘어선 사슬. 자기장이 셀수록 빽빽하다. ──
  const filings = [];
  const B0 = Math.hypot(...field(C[0], C[1] - 70));
  for (let k = 0; k < 2600; k++) {
    let x = rnd() * w, y = rnd() * h;
    if (inMag(x, y, 4)) continue;
    const [bx, by] = field(x, y);
    const mag = Math.hypot(bx, by);
    const accept = P.clamp(Math.pow(mag / B0, 0.42) * 0.55);
    if (rnd() > accept) continue;
    const n = 2 + Math.floor(rnd() * 5);
    let dir = rnd() < 0.5 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const [fx, fy] = field(x, y);
      const m = Math.hypot(fx, fy) || 1;
      const j = (rnd() - 0.5) * 0.22; // 쇳가루 하나하나는 조금씩 비뚤다
      const ux = (fx / m) * Math.cos(j) - (fy / m) * Math.sin(j), uy = (fx / m) * Math.sin(j) + (fy / m) * Math.cos(j);
      const len = 2.2 + rnd() * 3.2;
      if (!inMag(x, y, 3) && x > -4 && x < w + 4 && y > -4 && y < h + 4) filings.push([x, y, ux, uy, len, 0.75 + rnd() * 0.5]);
      x += ux * (len + 1.1) * dir;
      y += uy * (len + 1.1) * dir;
    }
  }
  ctx.save();
  ctx.lineCap = "round";
  for (const [x, y, ux, uy, len, wd] of filings) {
    const a = 0.5 + rnd() * 0.4;
    ctx.strokeStyle = `rgba(40,44,52,${a})`;
    ctx.lineWidth = wd;
    ctx.beginPath();
    ctx.moveTo(x - (ux * len) / 2, y - (uy * len) / 2);
    ctx.lineTo(x + (ux * len) / 2, y + (uy * len) / 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(190,196,206,${a * 0.5})`;
    ctx.lineWidth = 0.35;
    ctx.beginPath();
    ctx.moveTo(x - (ux * len) / 2 - 0.25, y - (uy * len) / 2 - 0.25);
    ctx.lineTo(x + (ux * len) / 2 - 0.25, y + (uy * len) / 2 - 0.25);
    ctx.stroke();
  }
  ctx.restore();

  // ── 자기장 방향을 보여 주는 선 두 줄(위아래): N극 끝에서 출발해 장을 따라 적분 ──
  const trace = (x, y, maxSteps = 900) => {
    const pts = [[x, y]];
    for (let i = 0; i < maxSteps; i++) {
      const [bx, by] = field(x, y);
      const m = Math.hypot(bx, by) || 1;
      x += (bx / m) * 0.8;
      y += (by / m) * 0.8;
      pts.push([x, y]);
      if (inMag(x, y, 0.5)) break;
      if (x < -20 || x > w + 20 || y < -20 || y > h + 20) break;
    }
    return pts;
  };
  // 위아래로 한 줄씩: 고리가 그림 안에 다 들어오는 출발점을 고른다(가장 높은 곳이 위 여백 30 px 아래)
  const pick = (sgn) => {
    for (let k = 0; k < 40; k++) {
      const ln = trace(box.x0 + 1 + k * 0.6, sgn < 0 ? box.y0 - 1.5 : box.y1 + 1.5);
      const ext = sgn < 0 ? Math.min(...ln.map((p) => p[1])) : Math.max(...ln.map((p) => p[1]));
      const endsInS = inMag(...ln[ln.length - 1], 1) && ln[ln.length - 1][0] > C[0];
      if (endsInS && (sgn < 0 ? ext > 34 : ext < h - 22)) return ln;
    }
    return trace(box.x0 + 1, sgn < 0 ? box.y0 - 1.5 : box.y1 + 1.5);
  };
  const lines = [pick(-1), pick(1)];

  // ── 자석(위에서 본 막대, 칠한 금속의 입체감) ──
  P.dropShadow(t, (c) => P.rrect(c, box.x0, box.y0, half * 2, thick * 2, 5), { dx: 3, dy: 5, blur: 7, a: 0.3 });
  const half2 = (x0, x1, base, hi, lo) => {
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, box.x0, box.y0, half * 2, thick * 2, 5);
    ctx.clip();
    ctx.fillStyle = P.lg(ctx, 0, box.y0, 0, box.y1, [[0, hi], [0.18, base], [0.8, base], [1, lo]]);
    ctx.fillRect(x0, box.y0, x1 - x0, thick * 2);
    ctx.restore();
  };
  half2(box.x0, C[0], "#E0503A", "#FF9A86", "#A3311F");
  half2(C[0], box.x1, "#3D8FE8", "#9CCBFF", "#1F5FAF");
  ctx.save();
  ctx.beginPath();
  P.rrect(ctx, box.x0, box.y0, half * 2, thick * 2, 5);
  ctx.clip();
  // 광택: 위쪽 가는 빛 줄, 왼쪽 위 번짐
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.fillRect(box.x0 + 6, box.y0 + 3.2, half * 2 - 12, 2.2);
  ctx.fillStyle = P.rg(ctx, box.x0 + 40, box.y0, 2, box.x0 + 40, box.y0, 90, [[0, "rgba(255,255,255,.22)"], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(box.x0, box.y0, half * 2, thick * 2);
  // 가운데 경계
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.fillRect(C[0] - 0.6, box.y0, 1.2, thick * 2);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "rgba(40,30,60,.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  P.rrect(ctx, box.x0 + 0.5, box.y0 + 0.5, half * 2 - 1, thick * 2 - 1, 5);
  ctx.stroke();
  ctx.restore();

  // ── 나침반: 바늘의 N극(빨강)이 그 자리의 자기장 방향을 가리킨다 ──
  const comps = [
    [C[0] - 120, C[1]], [C[0] + 120, C[1]],
    [C[0], C[1] - 76], [C[0], C[1] + 76],
    [C[0] - 92, C[1] - 64], [C[0] + 92, C[1] - 64],
    [C[0] - 92, C[1] + 64], [C[0] + 92, C[1] + 64],
  ];
  const compass = (cx, cy, r) => {
    const [bx, by] = field(cx, cy);
    const ang = Math.atan2(by, bx);
    P.dropShadow(t, (c) => c.arc(cx, cy, r, 0, Math.PI * 2), { dx: 1.5, dy: 2.5, blur: 4, a: 0.3 });
    // 테(은빛)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, cx - r, cy - r, cx + r, cy + r, [[0, "#F8F9FA"], [0.5, "#ADB5BD"], [1, "#6C757D"]]);
    ctx.fill();
    // 판
    ctx.beginPath();
    ctx.arc(cx, cy, r - 2.2, 0, Math.PI * 2);
    ctx.fillStyle = P.rg(ctx, cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r, [[0, "#FFFFFF"], [1, "#E9ECEF"]]);
    ctx.fill();
    // 눈금 8개
    ctx.strokeStyle = "rgba(73,80,87,.55)";
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3));
      ctx.lineTo(cx + Math.cos(a) * (r - 5), cy + Math.sin(a) * (r - 5));
      ctx.stroke();
    }
    // 바늘(마름모 반쪽씩): N 빨강, S 흰회색
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    const L = r - 4.2, Wn = 2.6;
    ctx.shadowColor = "rgba(0,0,0,.25)";
    ctx.shadowBlur = 1.5 * t.dpr;
    ctx.shadowOffsetY = 0.8 * t.dpr;
    ctx.beginPath();
    ctx.moveTo(L, 0);
    ctx.lineTo(0, -Wn);
    ctx.lineTo(0, Wn);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, 0, -Wn, 0, Wn, [[0, "#FF6B6B"], [1, "#C92A2A"]]);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-L, 0);
    ctx.lineTo(0, -Wn);
    ctx.lineTo(0, Wn);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, 0, -Wn, 0, Wn, [[0, "#F8F9FA"], [1, "#ADB5BD"]]);
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#495057";
    ctx.fill();
    // 유리 반사
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 2.2, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = P.lg(ctx, cx - r, cy - r, cx, cy, [[0, "rgba(255,255,255,.55)"], [1, "rgba(255,255,255,0)"]]);
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.35, cy - r * 0.42, r * 0.8, r * 0.36, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return ang;
  };
  const angs = comps.map(([x, y]) => compass(x, y, 13.5));

  // ── 겹층 ──
  const s = S.svgLayer(root, w, h);
  // 자기장 방향 선(N에서 나와 S로)
  for (const ln of lines) {
    const d = ln.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
    S.el(s, "path", { d, fill: "none", stroke: "#fff", "stroke-width": 4, opacity: 0.8, "stroke-linecap": "round" });
    S.el(s, "path", { d, fill: "none", stroke: "#1971C2", "stroke-width": 1.7, "stroke-linecap": "round" });
    // 화살촉 둘(1/3, 2/3 지점)
    for (const f of [0.3, 0.7]) {
      const i = Math.floor(ln.length * f);
      const a = ln[i], b = ln[Math.min(ln.length - 1, i + 6)];
      S.rayArrow(s, a, b, { color: "#1971C2", w: 0, hl: 8, hw: 4.6 });
    }
  }
  S.label(s, box.x0 + half * 0.5, C[1] + 6.5, "N", { size: 20, anchor: "middle", color: "#fff", halo: false, weight: 800 });
  S.label(s, box.x1 - half * 0.5, C[1] + 6.5, "S", { size: 20, anchor: "middle", color: "#fff", halo: false, weight: 800 });
  // 라벨: 나침반, 쇳가루, 자기장의 방향
  const tr = comps[5];
  S.leader(s, [[tr[0] + 30, tr[1] - 34], [tr[0] + 18, tr[1] - 34], [tr[0] + 9, tr[1] - 9]]);
  S.label(s, tr[0] + 34, tr[1] - 29.5, "나침반", { size: 14, anchor: "start" });
  S.leader(s, [[30, 270], [44, 270], [62, 238]]);
  S.label(s, 8, 284, "쇳가루", { size: 14 });
  const top = lines[0][Math.floor(lines[0].length * 0.5)];
  S.leader(s, [[top[0] - 8, 24], [top[0] - 8, 32], [top[0], top[1] - 1.5]]);
  S.label(s, top[0] - 8, 19, "자기장의 방향", { size: 14, anchor: "middle" });
  window.__angs = angs;
}
