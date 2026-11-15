// g2u8l8f1 지구 둘레와 달, 그리고 명왕성까지: 위는 지구와 두 궤도(국제 우주 정거장, 허블 우주 망원경)를 같은 비율로,
// 아래 상자는 지구와 달만 같은 비율로 놓는다. 명왕성은 이 비율로 그릴 수 없어(크기는 점보다 작고 자리는 그림 밖 아주 먼 곳)
// 상자 밖 화살표 끝에 사진만 두고 크게 그렸다고 밝힌다. 지구, 달, 명왕성의 겉면은 실사(NASA).
// 모든 반지름과 거리는 실제 값에서 계산한다. 검산 메모는 g2u8l8f1.md
import { PH, loadImg, space, stars, photoDisc, glow, dl, dlead, pill, NIGHT } from "./_lib.mjs";

export const meta = {
  key: "g2u8l8f1",
  w: 340,
  h: 380,
  alt: "위에는 지구와 국제 우주 정거장(약 400 km), 허블 우주 망원경(약 500 km)의 궤도를 같은 비율로 그려서 두 궤도가 지구 테두리에 바짝 붙어 있어요. 아래 상자에는 지구와 달만 같은 비율로 놓아 달이 지구 지름의 약 30배 거리에 있어요. 상자 밖 화살표 끝의 명왕성은 달까지 거리의 약 1만 2천 배 먼 곳에 있고, 명왕성 사진은 크게 그렸어요.",
};

// 실제 값(km)
export const KM = { earthR: 6371, iss: 400, hubble: 500, moonD: 384400, moonR: 1737, plutoR: 1188, pluto: 4.8e9 };

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const [earth, moon, pluto] = await Promise.all([loadImg(PH.earth.src), loadImg(PH.moon.src), loadImg(PH.pluto.src)]);

  // 아래 상자(같은 비율)의 자리: 지구 지름 8.2 px, 달은 지구 지름의 30.2배 거리
  const BOX = { x0: 6.5, y0: 308, x1: 276.5, y1: 374 };
  const Y2 = 332;
  const e2 = [16, Y2], re2 = 4.1;
  const dPx = (KM.moonD / (2 * KM.earthR)) * (2 * re2);
  const m2 = [e2[0] + dPx, Y2], rm2 = re2 * (KM.moonR / KM.earthR); // 달 반지름 1.12 px
  const PL = [322, Y2], rpl = 12; // 명왕성 사진: 상자 밖 화살표 끝. 크기는 비율과 무관(같은 비율이면 지름 1.5 px)

  // 별은 space()와 같은 씨앗으로 따로 뿌리되, 아래 지구와 달 점 둘레(10 px)와 명왕성 사진 곁은 비운다
  // (달 점이 별과 헷갈리지 않게, 명왕성 곁의 별이 위성처럼 보이지 않게)
  space(t, P, N.makeNoise(88), { n: 0 });
  stars(t, { x: 0, y: 0, w, h }, {
    n: 200, seed: 83, bright: 0.85,
    keep: (x, y) => Math.hypot(x - m2[0], y - m2[1]) > 10 && Math.hypot(x - e2[0], y - e2[1]) > 10 && Math.hypot(x - PL[0], y - PL[1]) > rpl + 9,
  });

  // ── 위: 지구와 두 궤도(같은 비율) ──
  const E = [124, 126], RE = 98;
  const rIss = RE * (KM.earthR + KM.iss) / KM.earthR; // +6.2 px
  const rHub = RE * (KM.earthR + KM.hubble) / KM.earthR; // +7.7 px
  // 대기 빛(아주 얇게, 궤도선보다 안쪽)
  ctx.save();
  const ag = ctx.createRadialGradient(E[0], E[1], RE - 2, E[0], E[1], RE + 4.5);
  ag.addColorStop(0, "rgba(120,180,255,0.0)");
  ag.addColorStop(0.35, "rgba(120,180,255,0.35)");
  ag.addColorStop(1, "rgba(120,180,255,0)");
  ctx.fillStyle = ag;
  ctx.beginPath();
  ctx.arc(E[0], E[1], RE + 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  photoDisc(ctx, earth, PH.earth, E[0], E[1], RE);
  // 궤도 고리 둘
  const orbit = (r, col) => {
    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.arc(E[0], E[1], r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };
  orbit(rHub, "rgba(127,215,255,0.95)");
  orbit(rIss, "rgba(255,209,102,0.95)");
  const at = (r, deg) => [E[0] + r * Math.cos((deg * Math.PI) / 180), E[1] + r * Math.sin((deg * Math.PI) / 180)];
  const pIss = at(rIss, -32), pHub = at(rHub, 24);
  glow(ctx, pIss[0], pIss[1], 6, [255, 209, 102], { core: 0.3 });
  glow(ctx, pHub[0], pHub[1], 6, [127, 215, 255], { core: 0.3 });

  // ── 가르는 선 ──
  const YB = 258;
  ctx.save();
  ctx.strokeStyle = "rgba(170,195,240,0.22)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(10, YB - 8);
  ctx.lineTo(w - 10, YB - 8);
  ctx.stroke();
  ctx.restore();

  // ── 아래: 같은 비율 상자(지구와 달만) ──
  ctx.save();
  ctx.fillStyle = "rgba(120,150,225,0.075)";
  ctx.strokeStyle = "rgba(170,195,240,0.42)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  P.rrect(ctx, BOX.x0, BOX.y0, BOX.x1 - BOX.x0, BOX.y1 - BOX.y0, 10);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  // 아주 작게 줄이는 사진은 고른 화소만 집어 얼룩지지 않게 고품질로 줄인다
  ctx.imageSmoothingQuality = "high";
  photoDisc(ctx, earth, PH.earth, e2[0], e2[1], re2);
  // 달: 실제 비율 크기(지름 2.2 px) 그대로. 자리는 라벨의 지시선이 짚는다(둘레 고리는 두지 않는다)
  photoDisc(ctx, moon, PH.moon, m2[0], m2[1], rm2);
  ctx.imageSmoothingQuality = "low";
  // 거리 치수선
  const yd = Y2 + 14;
  ctx.save();
  ctx.strokeStyle = "rgba(255,209,102,0.9)";
  ctx.fillStyle = "rgba(255,209,102,0.9)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(e2[0], yd);
  ctx.lineTo(m2[0], yd);
  ctx.moveTo(e2[0], yd - 4);
  ctx.lineTo(e2[0], yd + 4);
  ctx.moveTo(m2[0], yd - 4);
  ctx.lineTo(m2[0], yd + 4);
  ctx.stroke();
  ctx.restore();
  // 명왕성 쪽 화살표: 달 곁에서 상자 밖으로 나가 명왕성 사진에 닿는다(이 비율로는 그릴 수 없을 만큼 멀다: 상자 밖에서 끊어 표시)
  const ax0 = m2[0] + 7, ax1 = PL[0] - rpl - 3, brk = 288; // 끊음 표시 가운데(상자 오른쪽 테 x 276.5 밖)
  ctx.save();
  ctx.strokeStyle = "rgba(190,206,235,0.85)";
  ctx.lineWidth = 1.3;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(ax0, Y2);
  ctx.lineTo(brk - 5.5, Y2);
  ctx.moveTo(brk + 5.5, Y2);
  ctx.lineTo(ax1 - 8, Y2);
  ctx.stroke();
  ctx.setLineDash([]);
  // 끊음 표시 //
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(brk - 4.5, Y2 + 5);
  ctx.lineTo(brk - 1.5, Y2 - 5);
  ctx.moveTo(brk + 1.5, Y2 + 5);
  ctx.lineTo(brk + 4.5, Y2 - 5);
  ctx.stroke();
  // 화살촉
  ctx.fillStyle = "rgba(190,206,235,0.95)";
  ctx.beginPath();
  ctx.moveTo(ax1, Y2);
  ctx.lineTo(ax1 - 9, Y2 - 4.6);
  ctx.lineTo(ax1 - 9, Y2 + 4.6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  photoDisc(ctx, pluto, PH.pluto, PL[0], PL[1], rpl);

  // ── 라벨 ──
  const s = S.svgLayer(root, w, h);
  pill(S, s, 44, 16, "같은 비율", { size: 13.5 });
  dlead(S, s, [[30, 226], [52, 200]]);
  dl(S, s, 12, 241, "지구", { size: 14 });
  // 국제 우주 정거장
  dlead(S, s, [[240, 56], [232, 56], [pIss[0] + 3, pIss[1] - 2]], { color: NIGHT.gold, dot: false });
  dl(S, s, 244, 52, "국제 우주 정거장", { size: 14 });
  dl(S, s, 244, 69, "약 400 km", { size: 13.5, color: NIGHT.gold });
  // 허블 우주 망원경
  dlead(S, s, [[240, 188], [232, 188], [pHub[0] + 3, pHub[1] + 2]], { color: "#7FD7FF", dot: false });
  dl(S, s, 244, 184, "허블 우주 망원경", { size: 14 });
  dl(S, s, 244, 201, "약 500 km", { size: 13.5, color: "#7FD7FF" });

  // 아래 상자: 꼬리표는 상자 위 테에 얹는다
  pill(S, s, 52, BOX.y0, "같은 비율", { size: 13.5 });
  dl(S, s, e2[0] + re2 + 5, Y2 + 5, "지구", { size: 14 });
  // 달: 끝점 없는 지시선이 달 점 바로 앞(중심에서 3.7 px)에서 멈춰 점을 짚는다
  dlead(S, s, [[m2[0] - 10.5, Y2 - 9.5], [m2[0] - 2.6, Y2 - 2.6]], { dot: false });
  dl(S, s, m2[0] - 12, Y2 - 9, "달", { size: 14, anchor: "end" });
  dl(S, s, (e2[0] + m2[0]) / 2, yd + 19, "약 38만 km", { size: 14, anchor: "middle", color: NIGHT.gold });
  // 명왕성(상자 밖): 사진 위에 오른쪽을 맞춘 세 줄
  dl(S, s, PL[0] + rpl, 266, "명왕성(뉴호라이즌스호)", { size: 14, anchor: "end" });
  dl(S, s, PL[0] + rpl, 282.5, "달까지 거리의 약 1만 2천 배", { size: 13.5, anchor: "end", color: NIGHT.dim, weight: 600 });
  dl(S, s, PL[0] + rpl, 299, "(명왕성 사진은 크게 그렸어요)", { size: 13.5, anchor: "end", color: NIGHT.dim, weight: 600 });
}
