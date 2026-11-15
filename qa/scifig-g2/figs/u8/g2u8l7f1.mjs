// g2u8l7f1 우리은하와 안드로메다은하를 같은 비율로: 아래 띠에서 두 은하의 크기와 사이 거리를 한 축척으로 줄이고,
// 위의 확대 원 둘에서 모양을 보여 준다. 우리은하는 위에서 본 상상도(NASA/JPL-Caltech), 안드로메다은하는 실사(NOIRLab).
// 은하의 겉모습은 사진만 쓰고 그리지 않는다. 안드로메다은하는 우리은하로 다가오는 은하라 멀어지는 화살표를 넣지 않는다. 검산 메모는 g2u8l7f1.md
import { PH, loadImg, space, maskedImg, ring, funnel, dl, dlead, pill, NIGHT } from "./_lib.mjs";

export const meta = {
  key: "g2u8l7f1",
  w: 340,
  h: 272,
  alt: "아래 띠에 우리은하와 안드로메다은하를 같은 비율로 줄여 놓았어요. 두 은하 사이는 우리은하 지름의 약 25배인 약 77만 pc이고, 위의 확대 원에는 위에서 본 우리은하와 비스듬히 기운 안드로메다은하의 모습이 있어요.",
};

// 같은 비율의 띠: 우리은하 지름 D(px), 중심 사이 거리 = 25 D(약 77만 pc ÷ 약 30000 pc ≈ 25.7, 빛으로 250만 년 ÷ 10만 년 = 25).
export const SCALE = { D: 11.6, K: 25, M31: 1.5 };

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const [mw, m31] = await Promise.all([loadImg(PH.mwTop.src), loadImg(PH.m31.src)]);

  space(t, P, N.makeNoise(77), { n: 170, seed: 71, bright: 0.75 });

  // ── 띠(같은 비율) ──
  const { D, K, M31 } = SCALE;
  const Y = 198;
  const X0 = 22; // 우리은하 중심
  const XA = X0 + K * D; // 안드로메다은하 중심
  ctx.save();
  ctx.fillStyle = "rgba(120,150,225,0.075)";
  ctx.strokeStyle = "rgba(170,195,240,0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  P.rrect(ctx, 6.5, Y - 19.5, w - 13, 39, 10);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // ── 확대 원 둘(모양 보기) ──
  const C1 = [72, 100], R1 = 56; // 우리은하
  const C2 = [262, 102], R2 = 62; // 안드로메다은하
  funnel(ctx, [X0, Y], C1, R1 + 3);
  funnel(ctx, [XA, Y], C2, R2 + 3);

  // 우리은하(위에서 본 상상도): 원반 반지름 48 px
  const s1 = 48 / PH.mwTop.r;
  P.dropShadow(t, (c) => c.arc(C1[0], C1[1], R1, 0, Math.PI * 2), { dx: 0, dy: 3, blur: 10, a: 0.5, color: "#000000" });
  ctx.save();
  ctx.beginPath();
  ctx.arc(C1[0], C1[1], R1, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = P.rg(ctx, C1[0], C1[1], 0, C1[0], C1[1], R1, [[0, "#0B1124"], [1, "#03060E"]]);
  ctx.fillRect(C1[0] - R1, C1[1] - R1, 2 * R1, 2 * R1);
  ctx.restore();
  maskedImg(t, mw, { sx: PH.mwTop.cx, sy: PH.mwTop.cy, s: s1, at: C1, rx: R1 - 1, fade: 0.06 });
  ring(ctx, C1[0], C1[1], R1);

  // 안드로메다은하(실사): 핵이 원의 가운데, 원 반지름 = 사진 700 화소
  const s2 = R2 / 700;
  P.dropShadow(t, (c) => c.arc(C2[0], C2[1], R2, 0, Math.PI * 2), { dx: 0, dy: 3, blur: 10, a: 0.5, color: "#000000" });
  ctx.save();
  ctx.beginPath();
  ctx.arc(C2[0], C2[1], R2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(m31, C2[0] - PH.m31.cx * s2, C2[1] - PH.m31.cy * s2, m31.naturalWidth * s2, m31.naturalHeight * s2);
  ctx.restore();
  ring(ctx, C2[0], C2[1], R2);

  // ── 띠 위의 두 은하(같은 비율) ──
  // 우리은하: 지름 D. 안드로메다은하: 긴 지름 약 1.5 D, 비스듬히 기울어 짧은 지름은 긴 지름의 약 0.35(사진의 원반 비).
  maskedImg(t, mw, { sx: PH.mwTop.cx, sy: PH.mwTop.cy, s: (D / 2) / PH.mwTop.r, at: [X0, Y], rx: D / 2 + 0.6, fade: 0.25 });
  const a = (M31 * D) / 2, b = a * 0.36;
  const ang = (PH.m31.ang * Math.PI) / 180;
  maskedImg(t, m31, { sx: PH.m31.cx, sy: PH.m31.cy, s: a / 980, at: [XA, Y], rx: a + 0.8, ry: b + 0.8, ang, fade: 0.45 });

  // ── 거리 눈금: 우리은하 지름 하나가 한 칸, 25칸 ──
  const RY = 226;
  ctx.save();
  for (let i = 0; i < K; i++) {
    ctx.fillStyle = i % 2 ? "rgba(120,140,180,0.75)" : "rgba(226,234,250,0.92)";
    ctx.fillRect(X0 + i * D, RY - 2.2, D, 4.4);
  }
  ctx.strokeStyle = "rgba(226,234,250,0.9)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (const x of [X0, XA]) {
    ctx.moveTo(x, RY - 7);
    ctx.lineTo(x, RY + 7);
  }
  ctx.stroke();
  // 띠의 두 은하 중심에서 눈금 끝으로 내린 가는 점선
  ctx.setLineDash([2, 2.5]);
  ctx.strokeStyle = "rgba(190,206,235,0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(X0, Y + 8);
  ctx.lineTo(X0, RY - 7);
  ctx.moveTo(XA, Y + 5);
  ctx.lineTo(XA, RY - 7);
  ctx.stroke();
  ctx.restore();

  // ── 라벨 ──
  const s = S.svgLayer(root, w, h);
  dl(S, s, C1[0], 22, "우리은하", { size: 14, anchor: "middle" });
  dl(S, s, C1[0], 38.5, "지름 약 30000 pc", { size: 13.5, anchor: "middle", color: NIGHT.dim, weight: 600 });
  dl(S, s, C2[0], 22, "안드로메다은하", { size: 14, anchor: "middle" });
  pill(S, s, (X0 + XA) / 2, Y - 19.5, "같은 비율", { size: 13.5 });
  dl(S, s, (X0 + XA) / 2, 250, "약 77만 pc(빛으로 약 250만 년)", { size: 14, anchor: "middle", color: NIGHT.gold });
  dl(S, s, (X0 + XA) / 2, 266.5, "우리은하 지름의 약 25배", { size: 13.5, anchor: "middle", color: NIGHT.dim, weight: 600 });
  void dlead;
}
