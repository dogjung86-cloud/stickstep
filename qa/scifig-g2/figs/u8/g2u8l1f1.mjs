// g2u8l1f1 1″는 얼마나 작을까: 위는 각도의 사다리(1°를 60칸으로 나눈 한 칸이 1′, 그 한 칸을 60배 키워 다시 60칸으로 나눈 한 칸이 1″),
// 아래는 실제 크기 감각(눈에서 약 5 km 떨어진 100원짜리 동전의 폭이 1″, 약 6.4 km면 0.77″로 태양 다음으로 가까운 별의 연주 시차와 같다).
// 사다리의 칸은 실제 비(한 칸 = 1/60, 다음 줄은 정확히 60배)로 그렸다. 아래 그림은 각을 크게 벌려 그리고 거리는 줄였다(끊음 표시).
// 검산 메모는 g2u8l1f1.md
export const meta = {
  key: "g2u8l1f1",
  w: 340,
  h: 402,
  alt: "1°를 60칸으로 나눈 한 칸이 1′이고, 1′을 60배 키워 다시 60칸으로 나눈 한 칸이 1″예요. 아래에는 눈에서 약 5 km 떨어진 100원짜리 동전의 양 끝으로 뻗은 두 시선이 1″를 이루고, 약 6.4 km 떨어진 동전은 0.77″로 보여 태양 다음으로 가까운 별의 연주 시차와 같아요.",
};

// 실제 값
export const REAL = { coin: 0.024, rad1: Math.PI / 180 / 3600, d1: 0.024 / (Math.PI / 180 / 3600), d77: 0.024 / ((0.77 * Math.PI) / 180 / 3600) };

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(11);
  const rnd = N.rng(5);
  P.plate(t, nz);

  // ── 위: 각도의 사다리 ──
  const SX0 = 54, SX1 = 328, SW = SX1 - SX0, SH = 12, n = 60, step = SW / n;
  const rungs = [{ y: 36, k: 47 }, { y: 90, k: 12 }, { y: 144, k: -1 }];
  const sky = (y, ticks, hi) => {
    // 하늘 띠(어두운 남색 + 희미한 별)
    P.dropShadow(t, (c) => P.rrect(c, SX0, y, SW, SH, 4), { dx: 0, dy: 2, blur: 4, a: 0.22 });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, SX0, y, SW, SH, 4);
    ctx.clip();
    ctx.fillStyle = P.lg(ctx, 0, y, 0, y + SH, [[0, "#22305A"], [1, "#0D1530"]]);
    ctx.fillRect(SX0, y, SW, SH);
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = `rgba(230,236,255,${0.25 + rnd() * 0.45})`;
      ctx.beginPath();
      ctx.arc(SX0 + rnd() * SW, y + 2 + rnd() * (SH - 4), 0.35 + rnd() * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (hi >= 0) {
      ctx.fillStyle = "rgba(255,196,60,0.85)";
      ctx.fillRect(SX0 + hi * step, y, step, SH);
    }
    if (ticks) {
      for (let i = 1; i < n; i++) {
        const x = SX0 + i * step;
        const big = i % 10 === 0;
        ctx.strokeStyle = big ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.62)";
        ctx.lineWidth = big ? 0.9 : 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y + SH);
        ctx.lineTo(x, y + SH - (big ? 7.5 : 4.5));
        ctx.stroke();
      }
    }
    // 윗면 광택
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(SX0, y, SW, 2);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(20,30,60,0.55)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    P.rrect(ctx, SX0 + 0.4, y + 0.4, SW - 0.8, SH - 0.8, 4);
    ctx.stroke();
    if (hi >= 0) {
      ctx.strokeStyle = "#E67700";
      ctx.lineWidth = 1;
      ctx.strokeRect(SX0 + hi * step, y + 0.5, step, SH - 1);
    }
    ctx.restore();
  };
  // 확대 통로(한 칸 → 다음 줄 전체): 정확히 60배
  const zoom = (y0, k, y1) => {
    const a = SX0 + k * step, b = a + step;
    ctx.save();
    ctx.fillStyle = P.lg(ctx, 0, y0, 0, y1, [[0, "rgba(255,190,60,0.30)"], [1, "rgba(255,190,60,0.08)"]]);
    ctx.beginPath();
    ctx.moveTo(a, y0);
    ctx.lineTo(b, y0);
    ctx.lineTo(SX1, y1);
    ctx.lineTo(SX0, y1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(214,140,20,0.75)";
    ctx.setLineDash([3, 2.5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(a, y0);
    ctx.lineTo(SX0, y1);
    ctx.moveTo(b, y0);
    ctx.lineTo(SX1, y1);
    ctx.stroke();
    ctx.restore();
  };
  zoom(rungs[0].y + SH, rungs[0].k, rungs[1].y);
  zoom(rungs[1].y + SH, rungs[1].k, rungs[2].y);
  sky(rungs[0].y, true, rungs[0].k);
  sky(rungs[1].y, true, rungs[1].k);
  sky(rungs[2].y, false, -1);
  // 1″ 띠 양 끝 괄호
  {
    const y = rungs[2].y + SH + 5;
    ctx.save();
    ctx.strokeStyle = "#E67700";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(SX0, y - 3);
    ctx.lineTo(SX0, y);
    ctx.lineTo(SX1, y);
    ctx.lineTo(SX1, y - 3);
    ctx.stroke();
    ctx.restore();
  }

  // ── 아래: 눈과 동전(각은 크게 벌리고 거리는 줄여 그림) ──
  const EX = 22, H = 34; // 눈 자리, 그림 속 동전 높이(같은 동전)
  const L1 = 214; // 5 km를 그림에서 214 px로
  const L2 = L1 * (REAL.d77 / REAL.d1); // 6.4 km: 같은 비율로 더 멀리 → 시선의 각이 0.77배
  const rows = [{ y: 236, L: L1 }, { y: 326, L: L2 }];
  const eye = (cx, cy) => {
    P.softShadow(t, cx + 1, cy + 11, 9, 2.4, 0.18);
    P.sphere(t, cx, cy, 9.5, "#F3F5F8", { spec: 0.5, gloss: 40, bounce: "#BFD0E6", ambient: 0.32 });
    // 오른쪽을 보는 눈동자(옆에서 보아 납작한 타원)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx + 6.6, cy, 2.9, 5.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.rg(ctx, cx + 6, cy - 1.5, 0.5, cx + 6.6, cy, 5.5, [[0, "#8A5A2B"], [1, "#4A2E14"]]);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 7.6, cy, 1.5, 2.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#14100C";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 6.4, cy - 2.4, 0.9, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.fill();
    ctx.restore();
  };
  const coinEdge = (x, cy) => {
    P.softShadow(t, x + 1, cy + H / 2 + 2, 6, 1.6, 0.2);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, cy, 2.4, H / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, x - 2.4, 0, x + 2.4, 0, [[0, "#F1F3F5"], [0.45, "#ADB5BD"], [1, "#6C757D"]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(60,66,76,.6)";
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();
  };
  const PX = EX + 9.6; // 눈동자 자리(시선의 꼭짓점)
  const ARC = 42; // 각 표시 반지름
  for (const r of rows) {
    const xc = PX + r.L;
    // 시선 부채
    ctx.save();
    ctx.fillStyle = P.lg(ctx, PX, 0, xc, 0, [[0, "rgba(49,130,246,0.30)"], [1, "rgba(49,130,246,0.10)"]]);
    ctx.beginPath();
    ctx.moveTo(PX, r.y);
    ctx.lineTo(xc, r.y - H / 2);
    ctx.lineTo(xc, r.y + H / 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3182F6";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(PX, r.y);
    ctx.lineTo(xc, r.y - H / 2);
    ctx.moveTo(PX, r.y);
    ctx.lineTo(xc, r.y + H / 2);
    ctx.stroke();
    // 꼭짓점의 각 호
    const half = Math.atan(H / 2 / r.L);
    ctx.fillStyle = "rgba(245,140,0,0.38)";
    ctx.beginPath();
    ctx.moveTo(PX, r.y);
    ctx.arc(PX, r.y, ARC, -half, half);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#E67700";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(PX, r.y, ARC, -half, half);
    ctx.stroke();
    ctx.restore();
    coinEdge(xc, r.y);
    eye(EX, r.y);
    // 거리 치수선(가운데를 끊어 줄였다는 표시)
    const yd = r.y + H / 2 + 12, xm = (PX + xc) / 2;
    ctx.save();
    ctx.strokeStyle = "#4E5968";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PX, yd - 4);
    ctx.lineTo(PX, yd + 4);
    ctx.moveTo(xc, yd - 4);
    ctx.lineTo(xc, yd + 4);
    ctx.moveTo(PX, yd);
    ctx.lineTo(xm - 5, yd);
    ctx.moveTo(xm + 5, yd);
    ctx.lineTo(xc, yd);
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(xm - 7, yd + 4.5);
    ctx.lineTo(xm - 3, yd - 4.5);
    ctx.moveTo(xm + 3, yd + 4.5);
    ctx.lineTo(xm + 7, yd - 4.5);
    ctx.stroke();
    ctx.restore();
  }

  // 100원짜리 동전(확대해 앞면): 은빛 금속, 톱니 테두리
  const Z = [298, 196], ZR = 22;
  {
    const xc = PX + L1, cy = rows[0].y;
    ctx.save();
    ctx.strokeStyle = "rgba(120,135,160,.6)";
    ctx.setLineDash([2.5, 2.5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xc + 2, cy - H / 2 + 2);
    ctx.lineTo(Z[0] - ZR * 0.72, Z[1] + ZR * 0.7);
    ctx.stroke();
    ctx.restore();
    P.dropShadow(t, (c) => c.arc(Z[0], Z[1], ZR, 0, Math.PI * 2), { dx: 1.5, dy: 3, blur: 5, a: 0.3 });
    ctx.save();
    ctx.beginPath();
    ctx.arc(Z[0], Z[1], ZR, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, Z[0] - ZR, Z[1] - ZR, Z[0] + ZR, Z[1] + ZR, [[0, "#F8F9FA"], [0.5, "#C4CAD2"], [1, "#7D858F"]]);
    ctx.fill();
    // 톱니(가장자리의 가는 홈)
    ctx.strokeStyle = "rgba(70,78,90,.5)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 110; i++) {
      const a = (i / 110) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Z[0] + Math.cos(a) * (ZR - 1.6), Z[1] + Math.sin(a) * (ZR - 1.6));
      ctx.lineTo(Z[0] + Math.cos(a) * ZR, Z[1] + Math.sin(a) * ZR);
      ctx.stroke();
    }
    // 안쪽 테(돋은 가장자리)
    ctx.beginPath();
    ctx.arc(Z[0], Z[1], ZR - 3, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(Z[0] + 0.5, Z[1] + 0.6, ZR - 3, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(80,88,100,.35)";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(Z[0], Z[1], ZR - 3.5, 0, Math.PI * 2);
    ctx.fillStyle = P.rg(ctx, Z[0] - 7, Z[1] - 8, 1, Z[0], Z[1], ZR, [[0, "#F1F3F5"], [1, "#B9C0C9"]]);
    ctx.fill();
    ctx.restore();
  }

  // ── 라벨 ──
  const s = S.svgLayer(root, w, h);
  const big = (y, text) => S.label(s, 8, y, text, { size: 21, weight: 800, color: "#1B2A4A" });
  big(rungs[0].y + 12, "1°");
  big(rungs[1].y + 12, "1′");
  big(rungs[2].y + 12, "1″");
  // 1° 띠 전체를 감싸는 중괄호와 그 꼭지 위의 설명: 노란 한 칸(1′)이 아니라 띠 전체(1°)가 새끼손가락 폭이다
  {
    const yE = rungs[0].y - 2.5, yL = rungs[0].y - 6.5, yP = rungs[0].y - 10.5, r = 4.5, cx = (SX0 + SX1) / 2;
    const x0 = SX0 + 0.6, x1 = SX1 - 0.6;
    S.el(s, "path", {
      d: `M${x0} ${yE} Q${x0} ${yL} ${x0 + r} ${yL} L${cx - r} ${yL} Q${cx} ${yL} ${cx} ${yP} Q${cx} ${yL} ${cx + r} ${yL} L${x1 - r} ${yL} Q${x1} ${yL} ${x1} ${yE}`,
      fill: "none", stroke: "#4E5968", "stroke-width": 1.3, "stroke-linecap": "round", "stroke-linejoin": "round",
    });
    S.label(s, cx, yP - 5.5, "팔을 뻗었을 때 새끼손가락 폭", { size: 13.5, anchor: "middle", color: "#4E5968", weight: 700 });
  }
  S.label(s, 66, 72, "60배 확대", { size: 13.5, color: "#C25E00", weight: 800 });
  S.label(s, SX1, 126, "60배 확대", { size: 13.5, anchor: "end", color: "#C25E00", weight: 800 });
  S.label(s, SX0, rungs[2].y + SH + 21, "1° = 60′ = 3600″", { size: 13.5, color: "#4E5968", weight: 700 });
  // 동전
  S.label(s, Z[0] - ZR - 6, Z[1] + 5, "100원짜리 동전", { size: 13.5, anchor: "end" });
  S.el(s, "text", { x: Z[0], y: Z[1] + 5.2, "text-anchor": "middle", "font-size": 14, "font-weight": 800, fill: "#FFFFFF", opacity: 0.85, "font-family": "'Pretendard Variable', Pretendard, sans-serif", transform: "translate(-0.6 -0.6)" }).textContent = "100";
  S.el(s, "text", { x: Z[0], y: Z[1] + 5.2, "text-anchor": "middle", "font-size": 14, "font-weight": 800, fill: "#5F6773", "font-family": "'Pretendard Variable', Pretendard, sans-serif" }).textContent = "100";
  // 각과 거리
  const angLab = (r, text) => {
    const half = Math.atan(H / 2 / r.L);
    const ax = PX + ARC * Math.cos(half), ay = r.y - ARC * Math.sin(half);
    S.leader(s, [[PX + 56, r.y - 24], [ax + 0.5, ay - 0.8]], { dot: false, color: "#C25E00" });
    S.label(s, PX + 58, r.y - 24, text, { size: 15, weight: 800, color: "#C25E00" });
  };
  angLab(rows[0], "1″");
  angLab(rows[1], "0.77″");
  const dLab = (r, text) => S.label(s, PX + r.L / 2, r.y + H / 2 + 28, text, { size: 14, anchor: "middle" });
  dLab(rows[0], "약 5 km");
  dLab(rows[1], "약 6.4 km");
  S.label(s, w / 2, h - 7, "태양 다음으로 가까운 별의 연주 시차 약 0.77″", { size: 13.5, anchor: "middle", color: "#1B2A4A", weight: 700 });
}
