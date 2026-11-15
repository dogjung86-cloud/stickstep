// g2u6l3f2 동맥, 모세혈관, 정맥의 자른 면: 짧게 자른 관 셋을 비스듬히 내려다본 모습. 위의 자른 면에서 벽의 두께와 속의 넓이를 비교해 보이고,
// 앞쪽 벽을 걷어 낸 창으로 속을 보인다(정맥은 판막, 모세혈관은 한 줄로 지나는 적혈구).
// 동맥: 벽이 가장 두껍고(탄력 있는 층이 여러 겹) 속이 좁다. 정맥: 바깥 굵기는 동맥과 비슷하거나 크고 벽이 얇고 속이 넓으며 판막이 있다.
// 모세혈관: 벽이 세포 한 겹이라 매우 얇다(아주 가늘어서 같은 배율이 아니다. 따로 크게 그렸다).
// 색은 같은 레슨의 랩, 정리 카드와 같게(동맥 쪽 산소가 많은 혈액 빨강, 정맥 쪽 산소가 적은 혈액 자주). 검산 메모는 g2u6l3f2.md
import * as L from "./_lib.mjs";

export const meta = {
  key: "g2u6l3f2",
  w: 340,
  h: 300,
  alt: "짧게 자른 동맥, 모세혈관, 정맥을 나란히 그린 그림. 동맥은 벽이 가장 두껍고 속이 좁고, 정맥은 벽이 얇고 속이 넓으며 속에 판막이 있고, 모세혈관은 벽이 세포 한 겹이라 매우 얇아 적혈구가 한 줄로 지나가요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(61);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  const K = 0.36; // 자른 면 타원의 납작함(비스듬히 내려다본 정도)
  const Y0 = 70; // 위 자른 면의 높이
  const Y1 = 196; // 관의 아래 끝
  /** 원기둥 몸통(왼쪽 위 빛): 옆면 그라데이션 + 아래 끝 타원 */
  const body = (cx, R, cols) => {
    P.softShadow(t, cx + 6, Y1 + R * K + 4, R * 1.05, 7, 0.16);
    ctx.save();
    ctx.fillStyle = P.lg(ctx, cx - R, 0, cx + R, 0, [[0, cols.mid], [0.28, cols.light], [0.62, cols.mid], [1, cols.dark]]);
    ctx.beginPath();
    ctx.moveTo(cx - R, Y0);
    ctx.lineTo(cx - R, Y1);
    ctx.ellipse(cx, Y1, R, R * K, 0, Math.PI, 0, true);
    ctx.lineTo(cx + R, Y0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = cols.edge;
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();
  };
  /** 위 자른 면: 벽의 층(바깥에서 안으로 반지름과 색), 속(혈액) */
  const face = (cx, layers, lumenR, blood) => {
    ctx.save();
    for (const [r, col] of layers) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(cx, Y0, r, r * K, 0, 0, L.TAU);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(90,30,30,.55)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(cx, Y0, layers[0][0], layers[0][0] * K, 0, 0, L.TAU);
    ctx.stroke();
    // 속: 안쪽은 아래로 깊어 보이게(위쪽 가장자리가 짙다)
    ctx.fillStyle = P.lg(ctx, 0, Y0 - lumenR * K, 0, Y0 + lumenR * K, [[0, blood[1]], [0.55, blood[0]], [1, blood[0]]]);
    ctx.beginPath();
    ctx.ellipse(cx, Y0, lumenR, lumenR * K, 0, 0, L.TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(60,10,20,.5)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  };
  /** 앞쪽 벽을 걷어 낸 창: 속(뒤쪽 벽과 혈액)과 창 가장자리에 보이는 벽 두께 */
  const windowCut = (cx, R, lumenR, y0, y1, inner, wallCol) => {
    const half = lumenR * 0.92;
    ctx.save();
    ctx.fillStyle = P.lg(ctx, cx - half, 0, cx + half, 0, [[0, inner[1]], [0.45, inner[0]], [1, inner[1]]]);
    ctx.beginPath();
    P.rrect(ctx, cx - half, y0, half * 2, y1 - y0, 5);
    ctx.fill();
    // 창 가장자리: 벽의 두께
    const wall = Math.max(1.6, (R - lumenR) * 0.9);
    ctx.fillStyle = wallCol;
    ctx.fillRect(cx - half - wall, y0, wall, y1 - y0);
    ctx.fillRect(cx + half, y0, wall, y1 - y0);
    ctx.strokeStyle = "rgba(90,30,30,.5)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(cx - half - wall, y0, half * 2 + wall * 2, y1 - y0);
    ctx.restore();
  };

  // ── 동맥(왼쪽): 바깥 반지름 34, 속 반지름 13(벽이 두껍고 탄력 있는 층이 여러 겹) ──
  const AX = 62;
  body(AX, 34, { light: "#F4B3B0", mid: "#E28A88", dark: "#B85A5E", edge: "#9A4048" });
  face(AX, [[34, "#F2C4BC"], [30.5, "#E07F7F"], [26, "#EC9A97"], [22, "#DA7477"], [18, "#E8908F"], [14.5, "#F6D9D2"]], 13, ["#D84250", "#8E1F2C"]);
  // ── 모세혈관(가운데, 크게): 바깥 반지름 16, 속 반지름 14.4(벽이 세포 한 겹) ──
  const CX = 170;
  body(CX, 16, { light: "#F7CFD3", mid: "#ECAAB2", dark: "#C9808C", edge: "#A35A68" });
  face(CX, [[16, "#F4C9CD"], [14.6, "#F9E2E4"]], 14.4, ["#C24D63", "#7E2C44"]);
  windowCut(CX, 16, 14.4, 98, 178, ["#B44A63", "#7A2C46"], "#F4C9CD");
  // 한 줄로 지나는 적혈구(오목한 원반을 옆에서 본 모습)
  for (const y of [110, 136, 162]) {
    ctx.save();
    ctx.fillStyle = P.rg(ctx, CX - 3, y - 3, 1, CX, y, 12, [[0, "#F27A82"], [1, "#B8303D"]]);
    ctx.beginPath();
    ctx.ellipse(CX, y, 11.5, 6.2, 0, 0, L.TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(120,20,30,.35)";
    ctx.beginPath();
    ctx.ellipse(CX, y, 5, 2.4, 0, 0, L.TAU);
    ctx.fill();
    ctx.restore();
  }
  // 벽을 이루는 납작한 세포의 핵(창 가장자리 벽에 작은 볼록)
  ctx.save();
  ctx.fillStyle = "#9C5BA8";
  for (const [dx, y] of [[-16.2, 120], [16.2, 150], [-16.2, 168]]) {
    ctx.beginPath();
    ctx.ellipse(CX + dx, y, 1.8, 5, 0, 0, L.TAU);
    ctx.fill();
  }
  ctx.restore();

  // ── 정맥(오른쪽): 바깥 반지름 36, 속 반지름 29.5(벽이 얇고 속이 넓다), 속에 판막 ──
  const VX = 278;
  body(VX, 36, { light: "#D7CBEA", mid: "#B6A3D6", dark: "#8A74B4", edge: "#6E5A98" });
  face(VX, [[36, "#E2D8F0"], [33, "#B9A6DA"], [31, "#E9E2F4"]], 29.5, ["#8E4A7A", "#4E2546"]);
  windowCut(VX, 36, 29.5, 96, 182, ["#8A4678", "#5A2A52"], "#C8B8E2");
  // 판막: 양쪽 벽에서 안으로 뻗은 주머니 모양 막 두 장. 끝이 위(심장 쪽)를 향해 맞닿는다
  const half = 29.5 * 0.92;
  const cusp = (sd) => {
    const x0 = VX + sd * half;
    const pts = L.spline([[x0, 168], [x0 - sd * 8, 156], [VX + sd * 3, 140], [VX + sd * 1, 134], [x0 - sd * 3, 146], [x0, 152]], true, 8);
    ctx.save();
    ctx.fillStyle = P.lg(ctx, x0, 0, VX, 0, [[0, "#EFE6F8"], [1, "#CDBBE6"]]);
    ctx.strokeStyle = "#7A64A6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    L.poly(ctx, pts);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  cusp(-1);
  cusp(1);

  // ── 겹층: 혈액이 흐르는 차례, 라벨 ──
  const sv = S.svgLayer(root, w, h);
  const arrow = (x0, x1, y) => S.fatArrow(sv, [[x0, y], [x1, y]], { fill: "#9AA8BC", stroke: "#fff", sw: 1, w0: 3, w1: 4, head: 9, hw: 6.5, shadow: false });
  arrow(104, 142, 126);
  arrow(198, 236, 126);
  // 정맥 속 혈액이 흐르는 방향(심장 쪽): 판막 사이를 지나 위로
  S.fatArrow(sv, [[VX, 186], [VX, 158]], { fill: "#FFD43B", stroke: "#8A6400", sw: 1, w0: 3, w1: 4.2, head: 8, hw: 6, shadow: false });
  S.label(sv, VX, 30, "정맥", { size: 15, anchor: "middle", weight: 800, color: "#5B4A8A" });
  S.label(sv, AX, 30, "동맥", { size: 15, anchor: "middle", weight: 800, color: "#B03A46" });
  S.label(sv, CX, 30, "모세혈관", { size: 15, anchor: "middle", weight: 800, color: "#A0465A" });
  S.label(sv, AX, 236, "벽이 두껍고\n탄력이 강해요", { size: 13.5, anchor: "middle", weight: 700, color: "#3D4654" });
  S.label(sv, CX, 236, "벽이 매우 얇아\n물질이 오가요", { size: 13.5, anchor: "middle", weight: 700, color: "#3D4654" });
  S.label(sv, VX, 236, "벽이 얇고\n판막이 있어요", { size: 13.5, anchor: "middle", weight: 700, color: "#3D4654" });
  // 짚는 라벨: 벽, 판막
  S.leader(sv, [[AX - 44, 106], [AX - 31, Y0 + 2]]);
  S.label(sv, AX - 46, 120, "벽", { size: 13.5, anchor: "middle" });
  S.leader(sv, [[VX + 4, 112], [VX + 14, 140]]);
  S.label(sv, VX - 2, 108, "판막", { size: 13.5, anchor: "middle" });
  S.label(sv, CX, 284, "모세혈관은 실제로는 머리카락보다 훨씬 가늘어요", { size: 13.5, anchor: "middle", weight: 600, color: "#6B7684" });
}
