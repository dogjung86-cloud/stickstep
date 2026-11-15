// g2u8l8f1 지구 둘레와 달, 그리고 명왕성까지: 위는 지구와 두 궤도(국제 우주 정거장, 허블 우주 망원경)를 같은 비율로,
// 아래는 지구와 달을 같은 비율로 놓고 명왕성은 화살표로 거리만 알린다. 지구, 달, 명왕성의 겉면은 실사(NASA).
// 모든 반지름과 거리는 실제 값에서 계산한다. 검산 메모는 g2u8l8f1.md
import { PH, loadImg, space, photoDisc, glow, dl, dlead, pill, NIGHT } from "./_lib.mjs";

export const meta = {
  key: "g2u8l8f1",
  w: 340,
  h: 360,
  alt: "위에는 지구와 국제 우주 정거장(약 400 km), 허블 우주 망원경(약 500 km)의 궤도를 같은 비율로 그려서 두 궤도가 지구 테두리에 바짝 붙어 있어요. 아래에는 지구와 달을 같은 비율로 놓아 달이 지구 지름의 약 30배 거리에 있고, 명왕성은 달까지 거리의 약 1만 2천 배 먼 곳에 있다고 화살표로 알려 줘요.",
};

// 실제 값(km)
export const KM = { earthR: 6371, iss: 400, hubble: 500, moonD: 384400, moonR: 1737, pluto: 4.8e9 };

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const [earth, moon, pluto] = await Promise.all([loadImg(PH.earth.src), loadImg(PH.moon.src), loadImg(PH.pluto.src)]);

  space(t, P, N.makeNoise(88), { n: 200, seed: 83, bright: 0.85 });

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

  // ── 아래: 지구와 달(같은 비율) ──
  const Y2 = 312;
  const e2 = [17, Y2], re2 = 4.1; // 지구 지름 8.2 px
  const dPx = (KM.moonD / (2 * KM.earthR)) * (2 * re2); // 지구 지름의 30.2배
  const m2 = [e2[0] + dPx, Y2], rm2 = re2 * (KM.moonR / KM.earthR); // 1.12 px
  photoDisc(ctx, earth, PH.earth, e2[0], e2[1], re2);
  // 달: 실제 크기(1.1 px)로 그리고 가는 고리로 자리를 짚어 준다
  ctx.save();
  ctx.strokeStyle = "rgba(220,228,245,0.55)";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(m2[0], m2[1], 5.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  photoDisc(ctx, moon, PH.moon, m2[0], m2[1], rm2);
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
  // 명왕성 쪽 화살표(이 비율로는 그릴 수 없을 만큼 멀다: 가운데를 끊어 표시)
  const ax0 = m2[0] + 10, ax1 = w - 8;
  ctx.save();
  ctx.strokeStyle = "rgba(190,206,235,0.85)";
  ctx.lineWidth = 1.3;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(ax0, Y2);
  ctx.lineTo(ax0 + 22, Y2);
  ctx.moveTo(ax0 + 30, Y2);
  ctx.lineTo(ax1 - 8, Y2);
  ctx.stroke();
  ctx.setLineDash([]);
  // 끊음 표시 //
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(ax0 + 22.5, Y2 + 5);
  ctx.lineTo(ax0 + 25.5, Y2 - 5);
  ctx.moveTo(ax0 + 27, Y2 + 5);
  ctx.lineTo(ax0 + 30, Y2 - 5);
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
  // 명왕성 사진(기호, 크기는 비율과 무관)
  const PL = [w - 20, Y2 - 26], rpl = 12;
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

  pill(S, s, 44, YB + 12, "같은 비율", { size: 13.5 });
  dl(S, s, 6, Y2 - 12, "지구", { size: 14 });
  dl(S, s, m2[0] - 9, Y2 + 4.8, "달", { size: 14, anchor: "end" });
  dl(S, s, (e2[0] + m2[0]) / 2, yd + 19, "약 38만 km", { size: 14, anchor: "middle", color: NIGHT.gold });
  dl(S, s, PL[0] - rpl - 8, Y2 - 31, "명왕성(뉴호라이즌스호)", { size: 14, anchor: "end" });
  dl(S, s, PL[0] - rpl - 8, Y2 - 14.5, "달까지 거리의 약 1만 2천 배", { size: 13.5, anchor: "end", color: NIGHT.dim, weight: 600 });
}
