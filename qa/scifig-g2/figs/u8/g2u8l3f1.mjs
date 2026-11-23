// g2u8l3f1 겉보기 등급의 눈금자: +6에서 −27까지를 1등급마다 같은 간격으로 두 줄에 이어 놓고, 천체마다 자리를 짚는다.
// 왼쪽(숫자가 큰 쪽)이 어둡게, 오른쪽(숫자가 작은 쪽)이 밝게 보인다(MagLab 막대와 같은 방향). 두 줄의 간격은 똑같다.
// 태양, 보름달, 목성은 실사 사진 동그라미(크기는 같게, 실제 겉보기 크기가 아님), 별은 빛나는 점. 검산 메모는 g2u8l3f1.md
import { PH, loadImg, space, photoDisc, glow, dl, dlead, NIGHT } from "./_lib.mjs";

export const meta = {
  key: "g2u8l3f1",
  w: 340,
  h: 320,
  alt: "겉보기 등급 눈금자가 두 줄로 이어져 있어요. 1등급마다 간격이 같고, 오른쪽으로 갈수록 숫자가 작아지며 밝게 보여요. 맨눈으로 보이는 가장 어두운 별은 약 6등급, 북극성은 2.1등급, 시리우스는 −1.5등급, 목성은 −2.9등급, 보름달은 −12.5등급, 태양은 −26.8등급 자리에 있어요.",
};

// 앱과 교과서의 값(목성은 가장 밝을 때)
export const MAGS = { faint: 6, polaris: 2.1, sirius: -1.5, jupiter: -2.9, moon: -12.5, sun: -26.8 };
// 눈금자: 한 줄에 17등급, 1등급 = PX. 1줄 +6.5 ~ −10.5, 2줄 −10.5 ~ −27.5
const X0 = 22, LEN = 300, PER = 17, PX = LEN / PER;
const ROW = [{ top: 6.5, y: 134 }, { top: -10.5, y: 266 }];
const rowOf = (m) => (m > -10.5 ? 0 : 1);
const xOf = (m) => X0 + (ROW[rowOf(m)].top - m) * PX;
const fmt = (m) => (m < 0 ? "−" + String(Math.abs(m)) : String(m));

// 눈금자 색: 등급에 따라 어두운 남색에서 밝은 금빛 흰색으로(선형 색 공간에서 섞음)
function barColor(P, m) {
  const u = P.clamp((6.5 - m) / 34);
  const A = P.lin([40, 50, 78]), B = P.lin([150, 136, 96]), C = P.lin([255, 247, 214]);
  const c = u < 0.5 ? P.mixc(A, B, u / 0.5) : P.mixc(B, C, (u - 0.5) / 0.5);
  return P.css(P.srgb(c));
}

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const [sun, moon, jup] = await Promise.all([loadImg(PH.sun.src), loadImg(PH.moon.src), loadImg(PH.jupiter.src)]);

  space(t, P, N.makeNoise(33), { n: 150, seed: 37, bright: 0.6 });

  // ── 머리줄: 어둡게 → 밝게 ──
  const HY = 20;
  {
    const x0 = 196, x1 = 238;
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, barColor(P, 6));
    g.addColorStop(1, barColor(P, -27));
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0, HY - 2.2);
    ctx.lineTo(x1 - 7, HY - 2.2);
    ctx.lineTo(x1 - 7, HY - 5.6);
    ctx.lineTo(x1, HY);
    ctx.lineTo(x1 - 7, HY + 5.6);
    ctx.lineTo(x1 - 7, HY + 2.2);
    ctx.lineTo(x0, HY + 2.2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── 두 줄의 눈금자 ──
  for (let r = 0; r < 2; r++) {
    const { top, y } = ROW[r];
    const g = ctx.createLinearGradient(X0, 0, X0 + LEN, 0);
    for (let k = 0; k <= 8; k++) g.addColorStop(k / 8, barColor(P, top - (PER * k) / 8));
    // 실험에서 본 범위(1~6등급) 옅은 띠
    if (r === 0) {
      ctx.save();
      ctx.fillStyle = "rgba(255,209,102,0.16)";
      ctx.strokeStyle = "rgba(255,209,102,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      P.rrect(ctx, xOf(6) - 7, y - 11, xOf(1) - xOf(6) + 14, 22, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.45)";
    ctx.shadowBlur = 4 * t.dpr;
    ctx.shadowOffsetY = 1.5 * t.dpr;
    ctx.fillStyle = g;
    ctx.beginPath();
    P.rrect(ctx, X0 - 4, y - 3.6, LEN + 8, 7.2, 3.6);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(200,215,240,0.28)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    P.rrect(ctx, X0 - 4.4, y - 4, LEN + 8.8, 8, 4);
    ctx.stroke();
    ctx.restore();
    // 윗면 광택
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(X0, y - 2.6, LEN, 1.2);
    ctx.restore();
    // 눈금: 1등급마다, 짝수 등급은 길게
    ctx.save();
    ctx.strokeStyle = "rgba(225,233,248,0.85)";
    for (let i = 0; i <= PER; i++) {
      const m = top - i - 0.5; // 줄 끝은 x.5라 눈금은 정수 등급
      if (m < top - PER) break;
      const x = X0 + (top - m) * PX;
      const major = Math.round(m) % 2 === 0;
      ctx.lineWidth = major ? 1.2 : 0.9;
      ctx.beginPath();
      ctx.moveTo(x, y + 4);
      ctx.lineTo(x, y + (major ? 10 : 7));
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── 줄 바꿈 이음선(1줄 끝 → 2줄 처음) ──
  {
    const yA = ROW[0].y, yB = ROW[1].y, xr = X0 + LEN + 4, xl = X0 - 4, ym = 194;
    ctx.save();
    ctx.strokeStyle = "rgba(190,206,235,0.5)";
    ctx.lineWidth = 1.1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(xr, yA);
    ctx.lineTo(xr + 5, yA);
    ctx.arcTo(w - 5, yA, w - 5, yA + 10, 7);
    ctx.lineTo(w - 5, ym - 8);
    ctx.arcTo(w - 5, ym, w - 13, ym, 8);
    ctx.lineTo(13, ym);
    ctx.arcTo(5, ym, 5, ym + 8, 8);
    ctx.lineTo(5, yB - 8);
    ctx.arcTo(5, yB, 13, yB, 8);
    ctx.lineTo(xl - 6, yB);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(190,206,235,0.75)";
    ctx.beginPath();
    ctx.moveTo(xl - 1, yB);
    ctx.lineTo(xl - 7, yB - 3.6);
    ctx.lineTo(xl - 7, yB + 3.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── 천체 표지 ──
  const pin = (m, top, col) => {
    const x = xOf(m), y = ROW[rowOf(m)].y;
    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = 1;
    ctx.setLineDash([1.6, 2.2]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, y - 4);
    ctx.stroke();
    ctx.setLineDash([]);
    // 눈금자 위 자리: 작은 흰 점(어두운 테)
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "rgba(8,12,26,.95)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, 3.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  };
  const SY = 112; // 1줄 별 점의 높이
  // 별: 밝을수록 빛무리가 크다
  pin(MAGS.faint, SY + 3, "rgba(200,212,235,.55)");
  glow(ctx, xOf(MAGS.faint), SY, 3.2, [205, 215, 240], { core: 0.34, alpha: 0.75 });
  pin(MAGS.polaris, SY + 5, "rgba(255,241,194,.6)");
  glow(ctx, xOf(MAGS.polaris), SY, 6, [255, 236, 190], { core: 0.3 });
  pin(MAGS.sirius, SY + 7, "rgba(221,232,255,.6)");
  glow(ctx, xOf(MAGS.sirius), SY, 10.5, [205, 222, 255], { core: 0.26, spikes: 13, spikeA: 0.5 });
  // 사진 동그라미(같은 크기) + 밝기에 맞춘 빛무리
  const PR = 13.5;
  const photo = (img, m, m2, y, halo, col) => {
    const x = xOf(m);
    const g = ctx.createRadialGradient(x, y, PR * 0.7, x, y, halo);
    g.addColorStop(0, `rgba(${col},0.5)`);
    g.addColorStop(0.45, `rgba(${col},0.16)`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, halo, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    pin(m, y + PR + 1, `rgba(${col},.6)`);
    photoDisc(ctx, img, m2, x, y, PR);
  };
  photo(jup, MAGS.jupiter, PH.jupiter, SY - 6, 24, "255,236,200");
  const SY2 = 238;
  photo(moon, MAGS.moon, PH.moon, SY2, 32, "226,232,245");
  photo(sun, MAGS.sun, PH.sun, SY2, 46, "255,214,140");

  // ── 라벨 ──
  const s = S.svgLayer(root, w, h);
  dl(S, s, 8, HY + 5.5, "겉보기 등급", { size: 15, weight: 800 });
  dl(S, s, 190, HY + 5, "어둡게 보여요", { size: 13.5, anchor: "end", color: NIGHT.dim, weight: 700 });
  dl(S, s, 244, HY + 5, "밝게 보여요", { size: 13.5, color: "#FFF1C2", weight: 800 });
  // 눈금 숫자(짝수 등급)
  for (let r = 0; r < 2; r++) {
    const { top, y } = ROW[r];
    for (let m = Math.floor(top); m >= top - PER; m--) {
      if (m % 2 !== 0) continue;
      dl(S, s, X0 + (top - m) * PX, y + 25, fmt(m), { size: 13.5, anchor: "middle", color: NIGHT.dim, weight: 700, haloW: 3 });
    }
  }
  // 1줄
  const fx = xOf(MAGS.faint);
  dlead(S, s, [[fx - 6, 76], [fx, SY - 5]], { dot: false });
  dl(S, s, 8, 54, "맨눈으로 보이는", { size: 13.5 });
  dl(S, s, 8, 70.5, "가장 어두운 별 약 6", { size: 13.5 });
  dl(S, s, xOf(MAGS.polaris), SY - 13, "북극성 2.1", { size: 14, anchor: "middle" });
  const sx = xOf(MAGS.sirius);
  dlead(S, s, [[214, 52], [207, 52], [sx + 3, SY - 6]], { dot: false });
  dl(S, s, 218, 57, "시리우스 −1.5", { size: 14 });
  dl(S, s, xOf(MAGS.jupiter) + PR + 6, SY - 1, "목성 −2.9", { size: 14 });
  // 실험에서 본 범위, 1등급의 배수
  const y0 = ROW[0].y;
  const bracket = (xa, xb, y) => {
    S.el(s, "path", { d: `M${xa} ${y - 4} V${y} H${xb} V${y - 4}`, fill: "none", stroke: NIGHT.halo, "stroke-width": 3.4, "stroke-linejoin": "round", opacity: 0.7 });
    S.el(s, "path", { d: `M${xa} ${y - 4} V${y} H${xb} V${y - 4}`, fill: "none", stroke: "#FFD166", "stroke-width": 1.2, "stroke-linejoin": "round" });
  };
  bracket(xOf(6), xOf(1), y0 + 33);
  dl(S, s, (xOf(6) + xOf(1)) / 2, y0 + 50, "실험에서 본 1~6등급", { size: 13.5, anchor: "middle", color: NIGHT.gold });
  bracket(xOf(-6), xOf(-7), y0 + 33);
  dl(S, s, w - 8, y0 + 50, "1등급 차이: 밝기 약 2.5배", { size: 13.5, anchor: "end", color: NIGHT.gold });
  // 2줄
  dl(S, s, xOf(MAGS.moon) + PR + 6, SY2 + 5, "보름달 −12.5", { size: 14 });
  dl(S, s, xOf(MAGS.sun) - PR - 8, SY2 + 5, "태양 −26.8", { size: 14, anchor: "end" });
  dl(S, s, w / 2, h - 9, "사진 동그라미의 크기는 실제로 보이는 크기와 달라요", { size: 13.5, anchor: "middle", color: NIGHT.dim, weight: 600 });
}
