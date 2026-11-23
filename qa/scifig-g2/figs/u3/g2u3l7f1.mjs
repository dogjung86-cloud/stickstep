// g2u3l7f1 물결파의 모습: 옆에서 본 유리 수조의 단면. 왼쪽 나무 막대가 수면을 위아래로 두드려 만든 물결이 오른쪽으로 퍼지고,
// 수면에 띄운 탁구공(랩 g2u3BallLab과 같은 흰색에서 주황으로 가는 공)은 제자리에서 마루 높이와 골 높이 사이를 오르내린다.
// 마루, 골, 진동 중심, 파장(마루에서 마루, 골에서 골), 진폭(진동 중심에서 마루, 진동 중심에서 골)을 단면 위에 잰다. 검산 메모는 g2u3l7f1.md
// 수면 높이 h(x) = −A sin(K|x − XS|), 화면 y = C − h(x). 같아야 하는 값(마루와 골 자리, 진폭 둘, 파장 둘)은 아래에서 확인한다.
export const meta = {
  key: "g2u3l7f1",
  w: 340,
  h: 282,
  alt: "옆에서 본 수조의 단면이에요. 왼쪽 나무 막대가 수면을 위아래로 두드리자 높은 마루와 낮은 골이 번갈아 생기며 물결이 오른쪽으로 나아가요. 점선은 물결이 없을 때의 수면인 진동 중심이에요. 마루에서 이웃한 마루까지, 골에서 이웃한 골까지가 파장이고, 진동 중심에서 마루까지와 골까지가 진폭이에요. 물 위의 주황색 탁구공은 옆으로 밀려가지 않고 제자리에서 마루 높이와 골 높이 사이를 오르내려요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(17);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.01 });

  // ── 물결 수치 ──
  const LAM = 88; // 파장(px)
  const A = 18; // 진폭(px, 세로를 키워 그림)
  const K = (2 * Math.PI) / LAM;
  const XS = 26; // 막대가 두드리는 자리
  const C = 150; // 진동 중심(물결이 없을 때 수면)의 화면 높이
  const TX0 = 10, TX1 = 298; // 수조 안벽(왼쪽, 오른쪽). 오른쪽 여백에 진동 중심 이름
  const RIM = 84, BOT = 252; // 수조 윗테, 바닥(안쪽)
  const hgt = (x) => -A * Math.sin(K * Math.abs(x - XS)); // 막대 양쪽으로 똑같이 퍼진다
  const sy = (x) => C - hgt(x);
  // 마루와 골: K(x − XS) = 3π/2 + 2πn(마루), π/2 + 2πn(골)
  const crest = [0, 1, 2].map((n) => XS + LAM * (0.75 + n)); // 92, 180, 268
  const trough = [0, 1, 2].map((n) => XS + LAM * (0.25 + n)); // 48, 136, 224
  const near = (a, b) => Math.abs(a - b) < 1e-6;
  if (!crest.every((x) => near(sy(x), C - A)) || !trough.every((x) => near(sy(x), C + A))) throw new Error("마루와 골 자리가 식과 어긋남");
  const BALL = XS + LAM * 2.5; // 246: 골(224)과 마루(268) 사이, 수면이 진동 중심을 지나는 자리
  const BR = 8.5; // 탁구공 반지름
  if (!near(sy(BALL), C)) throw new Error("탁구공 자리가 진동 중심 높이가 아님");

  // ── 수조: 뒤 유리, 물, 앞 유리 테두리 ──
  P.softShadow(t, (TX0 + TX1) / 2 + 4, BOT + 9, (TX1 - TX0) * 0.56, 5, 0.18);
  ctx.save();
  // 뒤 유리(물 위로 보이는 부분)
  ctx.fillStyle = P.lg(ctx, 0, RIM, 0, C, [[0, "rgba(214,232,246,.35)"], [1, "rgba(214,232,246,.6)"]]);
  ctx.fillRect(TX0, RIM, TX1 - TX0, C - RIM);
  // 물(수면 아래)
  ctx.beginPath();
  ctx.moveTo(TX0, sy(TX0));
  for (let x = TX0; x <= TX1; x += 0.5) ctx.lineTo(x, sy(x));
  ctx.lineTo(TX1, BOT);
  ctx.lineTo(TX0, BOT);
  ctx.closePath();
  ctx.fillStyle = P.lg(ctx, 0, C - A, 0, BOT, [[0, "#A6DAF4"], [0.35, "#7CC0EA"], [1, "#4A98D2"]]);
  ctx.fill();
  // 물속 결(아주 옅은 가로 물결무늬)
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = "rgba(255,255,255,.16)";
  ctx.lineWidth = 1;
  for (let k = 0; k < 6; k++) {
    const yy = C + 30 + k * 16;
    ctx.beginPath();
    for (let x = TX0; x <= TX1; x += 2) ctx.lineTo(x, yy + Math.sin(x * 0.045 + k) * 1.6);
    ctx.stroke();
  }
  ctx.restore();
  // 수면 선(밝은 띠 + 짙은 선)
  ctx.beginPath();
  for (let x = TX0; x <= TX1; x += 0.5) (x === TX0 ? ctx.moveTo(x, sy(x) + 1.8) : ctx.lineTo(x, sy(x) + 1.8));
  ctx.strokeStyle = "rgba(255,255,255,.75)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  for (let x = TX0; x <= TX1; x += 0.5) (x === TX0 ? ctx.moveTo(x, sy(x)) : ctx.lineTo(x, sy(x)));
  ctx.strokeStyle = "#2F74B5";
  ctx.lineWidth = 2;
  ctx.stroke();
  // 유리 벽과 바닥(두께 4, 옅은 청회색)
  ctx.fillStyle = "rgba(198,214,230,.95)";
  ctx.fillRect(TX0 - 4, RIM, 4, BOT - RIM + 4);
  ctx.fillRect(TX1, RIM, 4, BOT - RIM + 4);
  ctx.fillRect(TX0 - 4, BOT, TX1 - TX0 + 8, 4);
  ctx.strokeStyle = "rgba(104,124,146,.7)";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(TX0 - 4, RIM, TX1 - TX0 + 8, BOT - RIM + 4);
  ctx.strokeRect(TX0, RIM, TX1 - TX0, BOT - RIM);
  ctx.strokeStyle = "rgba(255,255,255,.85)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(TX0 - 2, RIM + 4);
  ctx.lineTo(TX0 - 2, BOT);
  ctx.stroke();
  ctx.restore();

  // ── 나무 막대(수면을 두드리는 끝) ──
  {
    const x = XS, top = 44, tip = C - 1;
    ctx.save();
    P.dropShadow(t, (c) => P.rrect(c, x - 4.5, top, 9, tip - top, 3), { dx: 1.5, dy: 2, blur: 3, a: 0.18 });
    ctx.beginPath();
    P.rrect(ctx, x - 4.5, top, 9, tip - top, 3);
    ctx.fillStyle = P.lg(ctx, x - 4.5, 0, x + 4.5, 0, [[0, "#A9773F"], [0.45, "#EBD9BA"], [1, "#9C6A35"]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(110,72,30,.55)";
    ctx.lineWidth = 0.6;
    ctx.stroke();
    // 끝이 닿은 자리의 작은 물보라 고리
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, tip + 1, 9, 2.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── 탁구공: 지금 자리(진하게)와 가장 높을 때, 가장 낮을 때(흐린 점선) ──
  const ballAt = (cy, ghost) => {
    ctx.save();
    if (ghost) {
      ctx.beginPath();
      ctx.arc(BALL, cy, BR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,179,92,.22)";
      ctx.fill();
      ctx.setLineDash([2.6, 2.2]);
      ctx.strokeStyle = "rgba(214,110,20,.85)";
      ctx.lineWidth = 1.1;
      ctx.stroke();
    } else {
      P.softShadow(t, BALL + 1.5, cy + BR - 0.5, BR * 0.9, 1.8, 0.22);
      ctx.beginPath();
      ctx.arc(BALL, cy, BR, 0, Math.PI * 2);
      ctx.fillStyle = P.rg(ctx, BALL - 3, cy - 3, 1, BALL, cy, BR + 1, [[0, "#FFFFFF"], [1, "#FFB35C"]]);
      ctx.fill();
      ctx.strokeStyle = "rgba(196,104,22,.85)";
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }
    ctx.restore();
  };
  const yHi = C - A - BR + 1.5, yLo = C + A - BR + 1.5, yNow = sy(BALL) - BR + 1.5; // 공은 수면에 조금 잠겨 뜬다
  ballAt(yHi, true);
  ballAt(yLo, true);
  ballAt(yNow, false);

  // ── 겹층: 진동 중심, 자, 화살표, 라벨 ──
  const sv = S.svgLayer(root, w, h);
  const INK = "#26303D";
  const DIM = "#2B3A55";
  // 진동 중심(점선)
  S.el(sv, "line", { x1: TX0, y1: C, x2: TX1 + 6, y2: C, stroke: "#1F3556", "stroke-width": 1.3, "stroke-dasharray": "5 4", opacity: 0.85 });
  S.label(sv, TX1 + 9, C - 3, "진동\n중심", { size: 13.5, lh: 16 });
  // 양쪽 화살표 자
  const dimH = (x0, x1, y, o = {}) => {
    S.rayArrow(sv, [(x0 + x1) / 2, y], [x0 + 0.5, y], { color: o.color ?? DIM, w: 1.6, hl: 6.5, hw: 3.6 });
    S.rayArrow(sv, [(x0 + x1) / 2, y], [x1 - 0.5, y], { color: o.color ?? DIM, w: 1.6, hl: 6.5, hw: 3.6 });
  };
  const dimV = (x, y0, y1, o = {}) => {
    S.rayArrow(sv, [x, (y0 + y1) / 2], [x, y0 + 0.5], { color: o.color ?? DIM, w: 1.6, hl: 5.5, hw: 3.4 });
    S.rayArrow(sv, [x, (y0 + y1) / 2], [x, y1 - 0.5], { color: o.color ?? DIM, w: 1.6, hl: 5.5, hw: 3.4 });
  };
  const tick = (x, y0, y1) => S.el(sv, "line", { x1: x, y1: y0, x2: x, y2: y1, stroke: "#5B6676", "stroke-width": 1, "stroke-dasharray": "3 3" });
  // 파장(위): 마루 180 → 268
  const YW1 = 106;
  tick(crest[1], C - A - 2, YW1 - 4);
  tick(crest[2], C - A - 2, YW1 - 4);
  dimH(crest[1], crest[2], YW1);
  S.label(sv, (crest[1] + crest[2]) / 2, YW1 - 8, "파장", { size: 14, anchor: "middle" });
  // 파장(아래): 골 136 → 224
  const YW2 = 204;
  tick(trough[1], C + A + 2, YW2 + 4);
  tick(trough[2], C + A + 2, YW2 + 4);
  dimH(trough[1], trough[2], YW2);
  S.label(sv, (trough[1] + trough[2]) / 2, YW2 + 20, "파장", { size: 14, anchor: "middle", haloColor: "#7FC2EA" });
  // 진폭(마루): x 92, 진동 중심 → 마루
  dimV(crest[0], C, C - A);
  S.label(sv, crest[0] + 7, C - 4, "진폭", { size: 13.5 });
  S.label(sv, crest[0], C - A - 9, "마루", { size: 14, anchor: "middle" });
  // 진폭(골): x 48, 진동 중심 → 골
  dimV(trough[0], C, C + A);
  S.label(sv, trough[0] + 7, C + 15, "진폭", { size: 13.5 });
  S.label(sv, trough[0], C + A + 18, "골", { size: 14, anchor: "middle", haloColor: "#8ACAEE" });
  // 탁구공: 세로 자취(점선)와 위아래 양쪽 화살표
  S.el(sv, "line", { x1: BALL, y1: yHi - BR - 4, x2: BALL, y2: yLo + BR + 4, stroke: "#C2410C", "stroke-width": 1, "stroke-dasharray": "2 3", opacity: 0.8 });
  const AX = BALL - BR - 6;
  dimV(AX, yHi - 2, yLo + 2, { color: "#C2410C" });
  S.label(sv, BALL, yLo + BR + 20, "탁구공", { size: 13.5, anchor: "middle", color: "#B4380D", haloColor: "#8ACAEE" });
  // 나무 막대와 막대의 움직임
  dimV(XS + 12, 50, 76, { color: "#7A5A30" });
  S.label(sv, XS + 20, 60, "나무 막대", { size: 13.5 });
  // 파동의 진행 방향
  S.fatArrow(sv, [[160, 50], [292, 50]], { w0: 3, w1: 6, head: 12, hw: 8, fill: "#3182F6" });
  S.label(sv, 226, 34, "파동의 진행 방향", { size: 14, anchor: "middle" });
}
