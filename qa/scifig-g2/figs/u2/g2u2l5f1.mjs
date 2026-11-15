// g2u2l5f1 변성암이 생기는 두 자리: 땅을 세로로 자른 단면 하나. 왼쪽은 산맥 아래 지하 깊은 곳(열과 압력): 이암 → 편암 → 편마암(깊을수록),
// 양옆에서 미는 압력에 수직인 세로 엽리. 오른쪽은 석회암 층을 뚫고 올라온 마그마와 그 둘레의 대리암 고리(열만 받아 엽리 없음, 알갱이가 커짐).
// 아래에 두 자리의 확대 원. 검산 메모는 g2u2l5f1.md
import { linOf, out, lens, funnel, vor } from "./_lib.mjs";

export const meta = {
  key: "g2u2l5f1",
  w: 340,
  h: 392,
  alt: "땅을 세로로 자른 단면. 왼쪽 산맥 아래에서는 깊이 내려갈수록 이암이 편암, 편마암으로 바뀌고 양옆에서 누르는 압력에 수직인 세로 줄무늬가 생겨요. 오른쪽에서는 석회암 층을 뚫고 올라온 마그마 둘레만 대리암으로 바뀌었고 줄무늬가 없어요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(15);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 단면 기하 ──
  const F = { x: 10, y: 34, w: 320, h: 230 };
  const YB = F.y + F.h;
  const gs = (x, m, s) => Math.exp(-(((x - m) / s) ** 2));
  const sm = (a, b, x) => P.smooth(a, b, x);
  const plainY = 70;
  const surfY = (x) => plainY - 26 * (gs(x, 70, 22) + 0.75 * gs(x, 112, 16) + 0.5 * gs(x, 36, 12)) * (1 - sm(150, 185, x)) - 1.2 * nz.fbm(x * 0.12, 1.3, 3) * (1 - sm(150, 185, x));
  // 왼쪽(산맥 아래)의 변성 띠 경계: 산맥 쪽에서는 얕고 오른쪽으로 갈수록 깊어져 단면 밖으로 빠진다
  const schTop = (x) => 128 + 6 * nz.n2(x * 0.03, 4) + 150 * sm(140, 250, x);
  const gnTop = (x) => 190 + 5 * nz.n2(x * 0.03, 8) + 120 * sm(112, 222, x);
  // 오른쪽: 위의 이암 층 아래로 두꺼운 석회암 층(왼쪽으로 가며 얇아져 끝난다)
  const limTop = 114;
  const limLeft = (y) => 204 - 0.16 * (y - limTop) + 1.4 * nz.n2(y * 0.02, 2);
  // 마그마 덩어리와 아래로 이어진 통로
  const MG = { cx: 276, cy: 212, rx: 31, ry: 27 };
  const magR = (x, y) => {
    const body = Math.hypot((x - MG.cx) / MG.rx, (y - MG.cy) / MG.ry) * (1 + 0.04 * nz.n2(x * 0.08, y * 0.08));
    const pipe = y > MG.cy ? Math.abs(x - (MG.cx + 2 + 2 * Math.sin(y * 0.08))) / 9.5 : 9;
    return Math.min(body, pipe);
  };
  const AUR = 11; // 대리암 고리의 두께(px)
  const magD = (x, y) => {
    // 마그마 겉면까지의 대략 거리(px)
    const r = magR(x, y);
    return (r - 1) * Math.min(MG.rx, MG.ry) * (r < 1 ? 1 : 0.95);
  };

  const C = {
    mud: linOf("#857767"), mud2: linOf("#6E6255"), sch: linOf("#8E8C88"), schM: linOf("#C9CBC6"), gnL: linOf("#D3CBBD"), gnD: linOf("#5E5853"),
    lim: linOf("#D2CEC1"), lim2: linOf("#B9B4A6"), mar: linOf("#F3F1EC"), mar2: linOf("#D9D8D4"), sky0: linOf("#D4E6F5"), sky1: linOf("#F2F6F9"),
  };
  P.dropShadow(t, (c) => c.rect(F.x, F.y, F.w, F.h), { dx: 2, dy: 4, blur: 10, a: 0.18 });
  P.shade(t, { x: F.x, y: F.y, w: F.w, h: F.h }, (x, y) => {
    const sy = surfY(x);
    if (y < sy - 0.6) return out(P.mixc(C.sky0, C.sky1, (y - F.y) / (plainY - F.y)));
    const a = P.smooth(sy - 0.6, sy + 0.4, y);
    let c;
    const n1 = nz.fbm(x * 0.1, y * 0.1, 3);
    const rm = magR(x, y), dm = magD(x, y);
    const inLim = x > limLeft(y) && y > limTop + 2 * nz.n2(x * 0.04, 6);
    if (rm < 1) {
      // 마그마(녹아 있음): 빛난다
      const k = P.clamp(rm);
      c = P.mixc(linOf("#FFE6A0"), linOf("#FF8A2E"), P.smooth(0, 0.8, k));
      c = P.mixc(c, linOf("#D9481F"), P.smooth(0.75, 1, k));
      c = P.mixc(c, linOf("#FFF3C8"), 0.22 * P.smooth(0.2, 0.6, nz.fbm(x * 0.08, y * 0.12, 3)) * (1 - k));
    } else if (inLim && dm < AUR + 1.5 * nz.n2(x * 0.1, y * 0.1)) {
      // 대리암: 하얗고 알갱이가 커진 결정질, 줄무늬 없음
      const g = vor(x, y, 2.6, 21);
      c = P.mixc(C.mar, C.mar2, 0.5 * g.id);
      c = P.mixc(c, linOf("#B7B5B0"), 0.45 * P.smooth(0.5, 0.05, g.d2 - g.d1));
      c = P.mixc(c, linOf("#FFD8B0"), 0.25 * P.smooth(4, 0, dm)); // 마그마와 맞닿은 곳은 달아 있다
    } else if (inLim) {
      // 석회암: 밝은 회백색, 나란한 층리
      const b = Math.sin((y + 2 * nz.n2(x * 0.02, y * 0.02)) * 0.55);
      c = P.mixc(C.lim, C.lim2, 0.35 * P.smooth(0.6, 1, b) + 0.2 * (0.5 + 0.5 * n1));
      const g = vor(x, y, 1.4, 5);
      c = P.mixc(c, linOf("#9C968A"), 0.12 * P.smooth(0.6, 0.1, g.d1) * (g.id > 0.7 ? 1 : 0));
    } else if (y > gnTop(x)) {
      // 편마암: 밝은 띠와 어두운 띠가 세로로 번갈아(압력에 수직)
      const xx = x + 3 * Math.sin(y * 0.08) + 2 * nz.n2(x * 0.05, y * 0.03);
      const band = 0.5 + 0.5 * Math.sin(xx * 0.5 + 2.6 * nz.fbm(x * 0.025, y * 0.006, 2));
      c = P.mixc(C.gnD, C.gnL, P.smooth(0.28, 0.72, band + 0.18 * nz.n2(x * 0.3, y * 0.08)));
      const g = vor(x, y * 0.55, 1.3, 9);
      c = P.mixc(c, g.id > 0.5 ? linOf("#F1ECE2") : linOf("#2F2C2A"), 0.18 * P.smooth(0.6, 0.15, g.d1));
      c = P.mixc(c, linOf("#C26A3E"), 0.06); // 깊은 곳의 열(살짝 따뜻한 빛깔)
    } else if (y > schTop(x)) {
      // 편암: 운모가 나란히 누운 가는 세로 줄(반짝임)
      const xx = x + 1.6 * Math.sin(y * 0.22) + 1.2 * nz.n2(x * 0.08, y * 0.05);
      const ln = 0.5 + 0.5 * Math.sin(xx * 1.9);
      c = P.mixc(C.sch, C.schM, 0.3 * P.smooth(0.55, 0.95, ln) + 0.12 * (0.5 + 0.5 * n1));
      const g = vor(x * 2.2, y * 0.6, 2.2, 13);
      c = P.mixc(c, [1, 1, 1], 0.28 * P.smooth(0.5, 0.1, g.d1) * (g.id > 0.75 ? 1 : 0));
      c = P.mixc(c, linOf("#C26A3E"), 0.03);
    } else {
      // 이암: 고운 진흙이 굳은 어두운 갈회색, 얇은 수평 층리
      const b = Math.sin((y + 1.5 * nz.n2(x * 0.03, 1)) * 0.9);
      c = P.mixc(C.mud, C.mud2, 0.3 * P.smooth(0.5, 1, b) + 0.25 * (0.5 + 0.5 * n1));
    }
    // 산맥 아래 깊은 곳의 열: 깊을수록 살짝 따뜻한 빛깔(녹지 않은 고체)
    if (!inLim && rm >= 1) c = P.mixc(c, linOf("#D9784A"), 0.16 * P.smooth(120, YB, y) * (1 - P.smooth(150, 215, x)));
    // 지표의 흙과 풀
    if (y < sy + 3) c = P.mixc(c, x < 160 ? linOf("#8F8A62") : linOf("#86B057"), P.smooth(sy + 3, sy + 0.8, y) * 0.9);
    const lt = 1.04 - 0.08 * ((y - F.y) / F.h);
    return out([c[0] * lt, c[1] * lt, c[2] * lt], a);
  }, { mask: (c) => c.rect(F.x, F.y, F.w, F.h) });
  // 띠 경계의 가는 선
  ctx.save();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = "rgba(40,30,25,.4)";
  for (const fy of [schTop, gnTop]) {
    ctx.beginPath();
    for (let x = F.x; x <= 230; x += 1) {
      const y = fy(x);
      if (y > YB) break;
      x === F.x ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.beginPath();
  for (let y = limTop; y <= YB; y += 1) (y === limTop ? ctx.moveTo : ctx.lineTo).call(ctx, limLeft(y), y);
  ctx.moveTo(limLeft(limTop), limTop);
  ctx.lineTo(F.x + F.w, limTop);
  ctx.stroke();
  ctx.restore();
  // 단면 테두리
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(F.x, YB);
  ctx.lineTo(F.x, F.y);
  ctx.lineTo(F.x + F.w, F.y);
  ctx.stroke();
  ctx.strokeStyle = "rgba(60,50,45,.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(F.x, F.y, F.w, F.h);
  ctx.restore();

  // ── 확대 원 ──
  const CA = [90, 324], CB = [254, 324], CR = 42;
  const srcA = [96, 252], srcB = [MG.cx - MG.rx - 5, MG.cy - 6];
  funnel(t, srcA, [CA[0] + CR * 0.55, CA[1] - CR * 0.82], [CA[0] - CR * 0.25, CA[1] - CR * 0.97]);
  funnel(t, srcB, [CB[0] - CR * 0.72, CB[1] - CR * 0.7], [CB[0] + CR * 0.1, CB[1] - CR]);
  for (const p of [srcA, srcB]) {
    ctx.beginPath();
    ctx.arc(p[0], p[1], 3.4, 0, Math.PI * 2);
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = "#F59F00";
    ctx.stroke();
  }
  // (가) 편마암: 밝은 광물 띠와 어두운 광물 띠, 납작한 운모가 모두 세로로 나란히
  lens(t, CA[0], CA[1], CR, () => {
    P.shade(t, { x: CA[0] - CR, y: CA[1] - CR, w: 2 * CR, h: 2 * CR }, (x, y) => {
      const xx = x + 3.5 * Math.sin(y * 0.07) + 2.2 * nz.n2(x * 0.03, y * 0.02);
      const band = 0.5 + 0.5 * Math.sin(xx * 0.3 + 0.8 * nz.n2(y * 0.02, 7));
      const dark = P.smooth(0.42, 0.58, band);
      const g = vor(x * 1.0, y * 0.5, 4.2, 33);
      let c;
      if (dark > 0.5) {
        // 어두운 띠: 흑운모 판이 세로로 늘어섬
        const fl = vor(x * 1.6, y * 0.32, 4.0, 41);
        c = P.mixc(linOf("#2B2724"), linOf("#5A4E42"), 0.4 * P.smooth(0.3, 0.9, fl.d2 - fl.d1) * (fl.id > 0.5 ? 1 : 0.5));
        c = P.mixc(c, linOf("#A08B66"), 0.25 * (fl.id > 0.85 ? 1 : 0) * P.smooth(1.2, 0.3, fl.d1));
      } else {
        c = g.id < 0.6 ? linOf("#E4DED2") : linOf("#A7ABAE");
        c = P.mixc(c, linOf("#3E3934"), 0.4 * P.smooth(1.0, 0.15, g.d2 - g.d1));
        const tl = 1 + 0.08 * (g.id - 0.5);
        c = [c[0] * tl, c[1] * tl, c[2] * tl];
      }
      const f = 1.04 - 0.08 * ((x - CA[0] + y - CA[1]) / (2 * CR));
      return out([c[0] * f, c[1] * f, c[2] * f]);
    });
  });
  // (나) 대리암: 하얀 방해석 알갱이가 크게 자라 맞물림, 줄무늬 없음
  lens(t, CB[0], CB[1], CR, () => {
    P.shade(t, { x: CB[0] - CR, y: CB[1] - CR, w: 2 * CR, h: 2 * CR }, (x, y) => {
      const g = vor(x + 300, y + 300, 15, 55, 0.95);
      let c = P.mixc(C.mar, linOf("#DEDDDA"), 0.6 * g.id);
      const tx = Math.cos(g.id * 40), ty = Math.sin(g.id * 40);
      const lit = -0.6 * tx - 0.7 * ty;
      const f = 1 + 0.07 * lit;
      c = [c[0] * f, c[1] * f, c[2] * f];
      // 방해석의 마름모 쪼개짐 줄(옅게)
      const u = x * Math.cos(g.id * 9) + y * Math.sin(g.id * 9), v = x * Math.cos(g.id * 9 + 1.3) + y * Math.sin(g.id * 9 + 1.3);
      c = P.mixc(c, linOf("#BDBAB4"), 0.22 * (P.smooth(0.9, 1, Math.sin(u * 0.55)) + P.smooth(0.9, 1, Math.sin(v * 0.55))) * (g.id > 0.35 ? 1 : 0));
      c = P.mixc(c, [1, 1, 1], 0.35 * Math.exp(-(((x + 300 - g.px) + 4) ** 2 + ((y + 300 - g.py) + 4) ** 2) / 10) * P.clamp(lit + 0.3));
      c = P.mixc(c, linOf("#9F9C96"), 0.45 * P.smooth(1.3, 0.2, g.d2 - g.d1));
      return out(c);
    });
  });

  // ── 겹층 ──
  const s = S.svgLayer(root, w, h);
  // 압력: 양옆에서 미는 굵은 화살표(깊은 곳)
  const ay = 238;
  S.fatArrow(s, [[16, ay], [50, ay]], { fill: "#E8590C", w0: 5, w1: 7, head: 12, hw: 10 });
  S.fatArrow(s, [[178, ay], [144, ay]], { fill: "#E8590C", w0: 5, w1: 7, head: 12, hw: 10 });
  S.label(s, 18, ay - 12, "압력", { size: 14 });
  // 두 자리의 머리말
  S.label(s, 92, 22, "지하 깊은 곳(열과 압력)", { size: 14, anchor: "middle" });
  S.label(s, 262, 22, "마그마와 닿은 곳(열)", { size: 14, anchor: "middle" });
  // 암석 이름
  S.label(s, 46, 104, "이암", { size: 14, anchor: "middle" });
  S.label(s, 46, 166, "편암", { size: 14, anchor: "middle" });
  S.label(s, 96, 214, "편마암", { size: 14, anchor: "middle" });
  S.label(s, 238, 148, "석회암", { size: 14, anchor: "middle" });
  S.leader(s, [[302, 152], [MG.cx + MG.rx * 0.62, MG.cy - MG.ry - 4]]);
  S.label(s, 304, 148, "대리암", { size: 14, anchor: "middle" });
  S.label(s, MG.cx + 1, MG.cy + 5, "마그마", { size: 14, anchor: "middle" });
  // 원 둘레: (가) 엽리, (나) 엽리 없음
  S.leader(s, [[150, 310], [CA[0] + 13, 314]]);
  S.label(s, 154, 315, "엽리", { size: 14 });
  for (const [x0, x1] of [[CA[0] - CR - 20, CA[0] - CR - 7], [CA[0] + CR + 20, CA[0] + CR + 7]]) S.rayArrow(s, [x0, CA[1] + 14], [x1, CA[1] + 14], { color: "#E8590C", w: 2, hl: 6, hw: 3.6 });
  S.label(s, CB[0], CB[1] + CR + 19, "엽리 없음", { size: 13.5, anchor: "middle", weight: 600, color: "#4E5968" });
}
