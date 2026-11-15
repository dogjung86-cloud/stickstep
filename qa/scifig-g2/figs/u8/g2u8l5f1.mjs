// g2u8l5f1 여름 은하수가 넓고 뚜렷한 까닭: 위에서 본 우리은하(NASA/JPL-Caltech 상상도)에서 태양계 자리를 확대 원으로 뽑아
// 지구의 공전 궤도를 아주 크게 늘려 그렸다. 여름(우리나라)에는 지구가 태양보다 은하 중심 쪽에 있어 밤인 반쪽이 은하 중심을 향하고,
// 겨울에는 반대편에 있어 밤에 은하 바깥쪽을 본다. 시선 끝의 창은 실제 은하수 사진(ESO 파노라마)에서 그 방향을 잘라 같은 처리로 보였다.
// 그림은 태양계가 은하 중심의 왼쪽에 오도록 상상도를 90° 돌렸다(위아래 뒤집기는 하지 않음). 검산 메모는 g2u8l5f1.md
import { PH, loadImg, space, maskedImg, photoDisc, glow, ring, funnel, dl, dlead, NIGHT, rnd as RND } from "./_lib.mjs";

export const meta = {
  key: "g2u8l5f1",
  w: 340,
  h: 406,
  alt: "위에서 본 우리은하에서 태양계 자리를 크게 늘려 보면, 여름에는 지구가 태양보다 은하 중심 쪽에 있어 밤에 별이 많은 은하 중심 쪽을 보고 넓고 뚜렷한 은하수가 보여요. 겨울에는 지구가 반대편에 있어 밤에 은하 바깥쪽을 보고 흐린 은하수가 보여요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const [mw, pan, sun, earth] = await Promise.all([loadImg(PH.mwTop.src), loadImg(PH.mwPan.src), loadImg(PH.sun.src), loadImg(PH.earth.src)]);

  space(t, P, N.makeNoise(55), { n: 190, seed: 51, bright: 0.8 });

  // ── 위: 우리은하(위에서 본 상상도, 90° 돌림: 태양계가 중심의 왼쪽) ──
  const G = [222, 98], RG = 80;
  const sG = RG / PH.mwTop.r;
  const ROT = Math.PI / 2;
  maskedImg(t, mw, { sx: PH.mwTop.cx, sy: PH.mwTop.cy, s: sG, rot: ROT, at: G, rx: RG + 7, fade: 0.14 });
  // 태양계 자리: 사진 속 (640, 960) → 중심에서 아래로 320 화소 → 돌리면 왼쪽으로 320 × sG
  const dSun = (PH.mwTop.sun[1] - PH.mwTop.cy) * sG;
  const SUN = [G[0] - dSun, G[1]];

  // ── 아래: 확대 원(태양과 지구의 공전 궤도) ──
  const Z = [170, 292], ZR = 72;
  funnel(ctx, SUN, Z, ZR + 3);
  P.dropShadow(t, (c) => c.arc(Z[0], Z[1], ZR, 0, Math.PI * 2), { dx: 0, dy: 3, blur: 10, a: 0.5, color: "#000000" });
  ctx.save();
  ctx.beginPath();
  ctx.arc(Z[0], Z[1], ZR, 0, Math.PI * 2);
  ctx.fillStyle = P.rg(ctx, Z[0] - 20, Z[1] - 24, 4, Z[0], Z[1], ZR, [[0, "#141E3C"], [1, "#070B18"]]);
  ctx.fill();
  ctx.restore();

  // 시선 부채와 하늘 창(은하수 사진): 오른쪽 = 은하 중심 쪽(여름 밤), 왼쪽 = 은하 바깥쪽(겨울 밤)
  const RO = 44; // 그림 속 공전 궤도 반지름
  const ER = 9.5; // 그림 속 지구 반지름
  const summer = [Z[0] + RO, Z[1]], winter = [Z[0] - RO, Z[1]];
  const WIN = { w: 50, h: 96 };
  const winR = [w - 6 - WIN.w, Z[1] - WIN.h / 2], winL = [6, Z[1] - WIN.h / 2];
  const r = RND(9);
  const fan = (from, toX, dir, dense) => {
    const half = 30;
    const g = ctx.createLinearGradient(from[0], 0, toX, 0);
    g.addColorStop(0, dense ? "rgba(255,226,160,0.42)" : "rgba(170,190,230,0.30)");
    g.addColorStop(1, dense ? "rgba(255,226,160,0.10)" : "rgba(170,190,230,0.06)");
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(toX, from[1] - half);
    ctx.lineTo(toX, from[1] + half);
    ctx.closePath();
    ctx.fill();
    ctx.clip();
    // 부채 속 별: 여름 쪽은 많이 겹치고 겨울 쪽은 드물다
    const nStar = dense ? 120 : 22;
    for (let i = 0; i < nStar; i++) {
      const u = Math.sqrt(r());
      const x = from[0] + (toX - from[0]) * u;
      const y = from[1] + (r() * 2 - 1) * half * u;
      const b = 0.35 + r() * 0.6;
      ctx.fillStyle = dense ? `rgba(255,240,205,${b})` : `rgba(215,225,250,${b})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.35 + r() * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = dense ? "rgba(255,214,140,0.85)" : "rgba(180,198,235,0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(toX, from[1] - half);
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(toX, from[1] + half);
    ctx.stroke();
    ctx.restore();
    void dir;
  };
  fan([summer[0] + ER, summer[1]], winR[0], 1, true);
  fan([winter[0] - ER, winter[1]], winL[0] + WIN.w, -1, false);

  // 하늘 창: 파노라마에서 그 방향을 잘라 세로로 세운다(은하 원반이 창의 세로 방향과 겹친다). 두 창은 같은 배율, 같은 처리.
  const skyWin = (at, srcX) => {
    const [x, y] = at;
    P.dropShadow(t, (c) => P.rrect(c, x, y, WIN.w, WIN.h, 7), { dx: 0, dy: 2, blur: 6, a: 0.45, color: "#000000" });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, x, y, WIN.w, WIN.h, 7);
    ctx.clip();
    ctx.fillStyle = "#000";
    ctx.fillRect(x, y, WIN.w, WIN.h);
    const s = 0.34;
    ctx.translate(x + WIN.w / 2, y + WIN.h / 2);
    ctx.rotate(-Math.PI / 2);
    for (const off of [-PH.mwPan.w, 0, PH.mwPan.w]) {
      ctx.drawImage(pan, (off - srcX) * s, -PH.mwPan.band * s, pan.naturalWidth * s, pan.naturalHeight * s);
    }
    // 두 창에 똑같이 밝기를 조금 올린다(작게 보여도 띠가 읽히게)
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.55;
    for (const off of [-PH.mwPan.w, 0, PH.mwPan.w]) {
      ctx.drawImage(pan, (off - srcX) * s, -PH.mwPan.band * s, pan.naturalWidth * s, pan.naturalHeight * s);
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(220,230,250,0.75)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    P.rrect(ctx, x + 0.6, y + 0.6, WIN.w - 1.2, WIN.h - 1.2, 6.5);
    ctx.stroke();
    ctx.restore();
  };
  skyWin(winR, PH.mwPan.w / 2); // 은하 중심 방향(파노라마 한가운데)
  skyWin(winL, 0); // 반대 방향(파노라마 양 끝)

  // 공전 궤도(점선), 태양, 지구 둘
  ctx.save();
  ctx.strokeStyle = "rgba(170,195,240,0.75)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(Z[0], Z[1], RO, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  {
    const g = ctx.createRadialGradient(Z[0], Z[1], 6, Z[0], Z[1], 26);
    g.addColorStop(0, "rgba(255,200,110,0.55)");
    g.addColorStop(1, "rgba(255,200,110,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(Z[0], Z[1], 26, 0, Math.PI * 2);
    ctx.fill();
  }
  photoDisc(ctx, sun, PH.sun, Z[0], Z[1], 10.5);
  // 지구: 태양 쪽 반이 낮, 반대쪽 반이 밤(그늘을 얹는다)
  const earthAt = (c) => {
    photoDisc(ctx, earth, PH.earth, c[0], c[1], ER);
    const dx = c[0] - Z[0], dy = c[1] - Z[1];
    const L = Math.hypot(dx, dy);
    const ux = dx / L, uy = dy / L; // 태양에서 멀어지는 쪽 = 밤
    ctx.save();
    ctx.beginPath();
    ctx.arc(c[0], c[1], ER + 0.2, 0, Math.PI * 2);
    ctx.clip();
    const g = ctx.createLinearGradient(c[0] - ux * ER, c[1] - uy * ER, c[0] + ux * ER, c[1] + uy * ER);
    g.addColorStop(0, "rgba(2,6,18,0)");
    g.addColorStop(0.44, "rgba(2,6,18,0)");
    g.addColorStop(0.56, "rgba(2,6,18,0.86)");
    g.addColorStop(1, "rgba(2,6,18,0.9)");
    ctx.fillStyle = g;
    ctx.fillRect(c[0] - ER - 1, c[1] - ER - 1, 2 * ER + 2, 2 * ER + 2);
    ctx.restore();
  };
  earthAt(summer);
  earthAt(winter);
  ring(ctx, Z[0], Z[1], ZR);

  // 우리은하 위의 표지: 태양계 자리(빛나는 점과 흰 고리), 은하 중심
  glow(ctx, SUN[0], SUN[1], 7, [255, 214, 120], { core: 0.35 });
  ctx.save();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(SUN[0], SUN[1], 4.6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ── 라벨 ──
  const s = S.svgLayer(root, w, h);
  dl(S, s, 8, 24, "우리은하", { size: 15, weight: 800 });
  dl(S, s, 8, 41, "위에서 본 상상도", { size: 13.5, color: NIGHT.dim, weight: 600 });
  dlead(S, s, [[G[0] + 34, G[1] - 50], [G[0] + 2, G[1] - 2]]);
  dl(S, s, G[0] + 36, G[1] - 53, "은하 중심", { size: 14 });
  dlead(S, s, [[SUN[0] - 40, SUN[1] + 30], [SUN[0] - 3, SUN[1] + 3]]);
  dl(S, s, SUN[0] - 42, SUN[1] + 44, "태양계", { size: 14, anchor: "middle" });
  // 확대 원 안
  dl(S, s, Z[0], Z[1] + 25, "태양", { size: 13.5, anchor: "middle" });
  dl(S, s, summer[0], summer[1] - ER - 7, "지구", { size: 13.5, anchor: "middle" });
  dl(S, s, winter[0], winter[1] - ER - 7, "지구", { size: 13.5, anchor: "middle" });
  dl(S, s, summer[0] - 3, summer[1] + ER + 16, "낮", { size: 13.5, anchor: "end" });
  dl(S, s, summer[0] + 3, summer[1] + ER + 16, "밤", { size: 13.5, anchor: "start", color: NIGHT.dim });
  dl(S, s, winter[0] + 3, winter[1] + ER + 16, "낮", { size: 13.5, anchor: "start" });
  dl(S, s, winter[0] - 3, winter[1] + ER + 16, "밤", { size: 13.5, anchor: "end", color: NIGHT.dim });
  // 방향과 하늘 창
  dl(S, s, w - 6, winR[1] - 24, "여름 밤", { size: 14.5, anchor: "end", color: NIGHT.gold, weight: 800 });
  dl(S, s, w - 6, winR[1] - 8, "은하 중심 쪽", { size: 13.5, anchor: "end", color: NIGHT.gold, weight: 700 });
  dl(S, s, 6, winL[1] - 24, "겨울 밤", { size: 14.5, color: "#B9D3FF", weight: 800 });
  dl(S, s, 6, winL[1] - 8, "은하 바깥쪽", { size: 13.5, color: "#B9D3FF", weight: 700 });
  dl(S, s, w - 6, winR[1] + WIN.h + 17, "넓고 뚜렷한", { size: 13.5, anchor: "end" });
  dl(S, s, w - 6, winR[1] + WIN.h + 33, "은하수", { size: 13.5, anchor: "end" });
  dl(S, s, 6, winL[1] + WIN.h + 17, "흐린 은하수", { size: 13.5 });
  dl(S, s, Z[0], h - 25, "지구의 공전 궤도", { size: 14, anchor: "middle" });
  dl(S, s, Z[0], h - 8, "(아주 크게 늘려 그렸어요)", { size: 13.5, anchor: "middle", color: NIGHT.dim, weight: 600 });
}
