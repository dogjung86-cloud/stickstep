// g2u4l3f1 헬륨 원자의 구조: 전자 구름 속 전자 2개와 가운데 원자핵, 원자핵을 확대하면 양성자 2개와 중성자 2개.
// 검산 메모는 g2u4l3f1.md
export const meta = { key: "g2u4l3f1", w: 340, h: 372, alt: "헬륨 원자 모형. 가운데의 작은 원자핵을 전자 2개가 둘러싸고 있고, 원자핵을 확대하면 (+)전하를 띠는 양성자 2개와 전하가 없는 중성자 2개가 뭉쳐 있어요." };

export default async function draw(root, { paint: P, svg: S, noise: N }) {
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(11);
  const rand = N.rng(4);

  // ── 바탕 ──
  P.plate(t, nz, { top: "#FCFCFD", bottom: "#EFF1F5", grain: 0.012 });

  // ── 원자(전자 구름) ──
  const A = [126, 232];
  const R = 112;
  // 부드러운 구름(부피감): 가운데가 진하고 바깥으로 옅어지며, 왼쪽 위가 밝고 오른쪽 아래 가장자리가 조금 짙다.
  const deep = P.lin(P.hex("#2F6FD6")), pale = P.lin(P.hex("#CFE2FF"));
  P.shade(t, { x: A[0] - R - 4, y: A[1] - R - 4, w: 2 * R + 8, h: 2 * R + 8 }, (x, y) => {
    const dx = (x - A[0]) / R, dy = (y - A[1]) / R;
    const s2 = dx * dx + dy * dy;
    const s = Math.sqrt(s2);
    if (s > 1.02) return null;
    const nzv = Math.sqrt(Math.max(0, 1 - s2));
    const dens = 0.62 * Math.exp(-2.4 * s2) + 0.2 * nzv; // 시선 방향으로 겹친 구름의 두께
    const n = nz.fbm(x * 0.03, y * 0.03, 3) * 0.1;
    const lit = P.clamp(0.5 - (dx * 0.55 + dy * 0.6) * 0.5 + 0.25 * nzv); // 왼쪽 위 밝음
    const rim = Math.pow(s, 5) * 0.32; // 가장자리 산란
    const edge = P.smooth(1.02, 0.9, s);
    const col = P.mixc(deep, pale, P.clamp(0.35 + 0.55 * lit - 0.25 * dens));
    const c = P.srgb(col);
    return [c[0], c[1], c[2], P.clamp((dens * (1 + n) * 0.9 + rim) * edge)];
  });
  // 구의 입체감: 왼쪽 위 옅은 빛 번짐, 오른쪽 아래 안쪽 그늘
  ctx.save();
  ctx.beginPath();
  ctx.arc(A[0], A[1], R * 0.99, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = P.rg(ctx, A[0] - R * 0.42, A[1] - R * 0.48, 0, A[0] - R * 0.42, A[1] - R * 0.48, R * 0.62, [[0, "rgba(255,255,255,.42)"], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(A[0] - R, A[1] - R, 2 * R, 2 * R);
  ctx.fillStyle = P.rg(ctx, A[0] - R * 0.25, A[1] - R * 0.3, R * 0.55, A[0] - R * 0.1, A[1] - R * 0.1, R * 1.15, [[0, "rgba(20,60,150,0)"], [1, "rgba(20,60,150,.16)"]]);
  ctx.fillRect(A[0] - R, A[1] - R, 2 * R, 2 * R);
  ctx.restore();
  // 점 구름: 전자가 있을 확률을 점의 밀도로 나타낸다(지름 방향 분포 r²e^(−2r/λ)의 표본을 평면에 투영)
  const lam = 34;
  ctx.save();
  for (let i = 0; i < 3200; i++) {
    const r = (-lam / 2) * Math.log(rand() * rand() * rand() + 1e-9);
    if (r > R * 0.96) continue;
    const ct = 2 * rand() - 1, ph = rand() * Math.PI * 2;
    const st = Math.sqrt(1 - ct * ct);
    const x = A[0] + r * st * Math.cos(ph), y = A[1] + r * st * Math.sin(ph);
    ctx.fillStyle = `rgba(28,80,180,${0.22 + 0.3 * rand()})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.45 + rand() * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // ── 원자 속 원자핵(작게): 가운데 붉은 알갱이 묶음 ──
  const nucleusDot = (cx, cy, s) => {
    P.sphere(t, cx - s * 0.5, cy - s * 0.4, s, "#E85B40", { spec: 0.5, gloss: 30 });
    P.sphere(t, cx + s * 0.55, cy - s * 0.25, s, "#B9C1CC", { spec: 0.45, gloss: 30 });
    P.sphere(t, cx - s * 0.2, cy + s * 0.55, s, "#B9C1CC", { spec: 0.45, gloss: 30 });
    P.sphere(t, cx + s * 0.35, cy + s * 0.5, s, "#E85B40", { spec: 0.5, gloss: 30 });
  };
  // 원자핵 주위의 은은한 빛(작은 것이 어디 있는지 보이게)
  ctx.fillStyle = P.rg(ctx, A[0], A[1], 0, A[0], A[1], 13, [[0, "rgba(255,240,230,.95)"], [0.5, "rgba(255,226,210,.55)"], [1, "rgba(255,226,210,0)"]]);
  ctx.beginPath();
  ctx.arc(A[0], A[1], 13, 0, Math.PI * 2);
  ctx.fill();
  nucleusDot(A[0], A[1], 2.6);

  // ── 확대 통로(원자핵 → 확대 원) ──
  const M = [266, 100];
  const MR = 64;
  {
    const dx = M[0] - A[0], dy = M[1] - A[1];
    const d = Math.hypot(dx, dy);
    const base = Math.atan2(dy, dx);
    const off = Math.asin(MR / d);
    const tl = Math.sqrt(d * d - MR * MR);
    const p1 = [A[0] + tl * Math.cos(base - off), A[1] + tl * Math.sin(base - off)];
    const p2 = [A[0] + tl * Math.cos(base + off), A[1] + tl * Math.sin(base + off)];
    ctx.save();
    ctx.fillStyle = P.lg(ctx, A[0], A[1], M[0], M[1], [[0, "rgba(150,160,178,.05)"], [1, "rgba(150,160,178,.26)"]]);
    ctx.beginPath();
    ctx.moveTo(A[0] + 2.5 * Math.cos(base - Math.PI / 2), A[1] + 2.5 * Math.sin(base - Math.PI / 2));
    ctx.lineTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(A[0] + 2.5 * Math.cos(base + Math.PI / 2), A[1] + 2.5 * Math.sin(base + Math.PI / 2));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── 확대 원: 원자핵 속 양성자 2개와 중성자 2개 ──
  P.dropShadow(t, (c) => c.arc(M[0], M[1], MR, 0, Math.PI * 2), { dx: 2, dy: 5, blur: 12, a: 0.22 });
  ctx.save();
  ctx.beginPath();
  ctx.arc(M[0], M[1], MR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = P.rg(ctx, M[0] - 20, M[1] - 26, 4, M[0], M[1], MR, [[0, "#FFFFFF"], [0.6, "#F4F1EF"], [1, "#E4DEDA"]]);
  ctx.fillRect(M[0] - MR, M[1] - MR, 2 * MR, 2 * MR);
  // 핵 주위의 따뜻한 빛
  ctx.fillStyle = P.rg(ctx, M[0], M[1], 10, M[0], M[1], MR, [[0, "rgba(255,190,160,.35)"], [1, "rgba(255,190,160,0)"]]);
  ctx.fillRect(M[0] - MR, M[1] - MR, 2 * MR, 2 * MR);
  ctx.restore();

  // 정사면체 꼴로 뭉친 네 알갱이(양성자 2, 중성자 2). 깊이(z)가 큰 것(뒤)부터 그린다.
  const r = 22.5;
  const tet = [
    { p: [-0.62, -0.42, -0.5], kind: "p" },
    { p: [0.66, -0.3, -0.42], kind: "n" },
    { p: [-0.12, 0.62, -0.2], kind: "n" },
    { p: [0.06, -0.02, 0.78], kind: "p" },
  ];
  // 살짝 돌려 보기 좋게
  const rot = (v, ay, ax) => {
    let [x, y, z] = v;
    [x, z] = [x * Math.cos(ay) + z * Math.sin(ay), -x * Math.sin(ay) + z * Math.cos(ay)];
    [y, z] = [y * Math.cos(ax) - z * Math.sin(ax), y * Math.sin(ax) + z * Math.cos(ax)];
    return [x, y, z];
  };
  const S3 = 29;
  const balls = tet
    .map((b) => {
      const q = rot(b.p, 0.35, -0.25);
      return { ...b, x: M[0] + q[0] * S3, y: M[1] + 4 + q[1] * S3, z: q[2] };
    })
    .sort((a, b) => a.z - b.z);
  for (const b of balls) {
    // 앞 알갱이가 뒤 알갱이에 드리우는 그늘(접촉 그늘)
    ctx.save();
    ctx.fillStyle = P.rg(ctx, b.x + 3, b.y + 4, r * 0.7, b.x + 3, b.y + 4, r * 1.32, [[0, "rgba(40,30,40,.30)"], [1, "rgba(40,30,40,0)"]]);
    ctx.beginPath();
    ctx.arc(b.x + 3, b.y + 4, r * 1.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (b.kind === "p") P.sphere(t, b.x, b.y, r, "#E5533A", { spec: 0.55, gloss: 26, rim: 0.18, bounce: "#FFB8A0" });
    else P.sphere(t, b.x, b.y, r, "#B5BDC9", { spec: 0.5, gloss: 26, rim: 0.2, bounce: "#E6EEF8" });
    if (b.kind === "p") {
      // (+) 표시: 흰 굵은 십자, 아래에 옅은 그늘
      const k = 7.4;
      ctx.save();
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(110,20,10,.35)";
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(b.x - k + 0.6, b.y + 1);
      ctx.lineTo(b.x + k + 0.6, b.y + 1);
      ctx.moveTo(b.x + 0.6, b.y - k + 1);
      ctx.lineTo(b.x + 0.6, b.y + k + 1);
      ctx.stroke();
      ctx.strokeStyle = "#FFF6F2";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(b.x - k, b.y);
      ctx.lineTo(b.x + k, b.y);
      ctx.moveTo(b.x, b.y - k);
      ctx.lineTo(b.x, b.y + k);
      ctx.stroke();
      ctx.restore();
    }
  }
  // 확대 원 테두리: 흰 고리 + 가는 회색 선(렌즈)
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(M[0], M[1], MR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "#A9B3C1";
  ctx.beginPath();
  ctx.arc(M[0], M[1], MR + 2.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ── 전자 2개: 구름 속, 원자핵 양쪽 ──
  const electrons = [
    [A[0] - 60, A[1] - 34],
    [A[0] + 50, A[1] + 52],
  ];
  for (const [ex, ey] of electrons) {
    ctx.fillStyle = P.rg(ctx, ex, ey, 2, ex, ey, 15, [[0, "rgba(120,180,255,.45)"], [1, "rgba(120,180,255,0)"]]);
    ctx.beginPath();
    ctx.arc(ex, ey, 15, 0, Math.PI * 2);
    ctx.fill();
    P.sphere(t, ex, ey, 8.2, "#3F86E0", { spec: 0.6, gloss: 30, rim: 0.25, bounce: "#BFE0FF" });
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "#F4F9FF";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(ex - 3.6, ey + 0.2);
    ctx.lineTo(ex + 3.6, ey + 0.2);
    ctx.stroke();
    ctx.restore();
  }

  // ── 라벨 ──
  const s = S.svgLayer(root, w, h);
  S.tag(s, 58, 24, "헬륨 원자", { w: 84, h: 24, size: 13.5, fill: "#2B3445" });
  // 원자핵(원자 속)
  S.leader(s, [[52, 352], [74, 352], [A[0] - 6, A[1] + 9]]);
  S.label(s, 16, 357, "원자핵", { size: 14 });
  // 전자
  S.leader(s, [[228, 336], [206, 336], [electrons[1][0] + 6, electrons[1][1] + 6]]);
  S.label(s, 232, 332, "전자", { size: 14, sub: "(−)전하" });
  // 양성자
  const front = balls[balls.length - 1];
  const backP = balls.find((b) => b.kind === "p" && b !== front);
  S.leader(s, [[188, 42], [204, 42], [backP.x - 8, backP.y - 10]]);
  S.label(s, 184, 37, "양성자", { size: 14, anchor: "end", sub: "(+)전하" });
  // 중성자: 앞 알갱이에 덜 가린 위쪽 중성자의 보이는 쪽(오른쪽 위)을 짚는다
  const nb = balls.filter((b) => b.kind === "n").sort((a, b) => a.y - b.y)[0];
  const nTip = [nb.x + r * 0.55, nb.y - r * 0.3];
  S.leader(s, [[318, 200], [334 - 2, 200], [334 - 2, 150], nTip].slice(1).reverse().concat([]).reverse(), { dot: true });
  S.label(s, 334, 222, "중성자", { size: 14, anchor: "end", sub: "전하 없음" });
  // 확대 표시
  S.label(s, M[0], M[1] + MR + 20, "원자핵 확대", { size: 13.5, anchor: "middle", color: "#5B6676", weight: 700 });
}
