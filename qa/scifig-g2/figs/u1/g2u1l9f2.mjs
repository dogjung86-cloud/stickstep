// g2u1l9f2 소줏고리: 아궁이 위 솥(발효한 술), 그 위의 소줏고리(허리가 잘록한 위아래 두 짝), 맨 위 찬물 그릇을 세로로 잘라 본 모습.
// 기체가 된 에탄올(물도 조금)이 허리를 지나 찬물 그릇 밑면에 닿아 방울로 맺히고, 방울은 그릇 밑면의 가장자리로 흘러
// 위짝 안벽을 타고 허리에 둘린 홈에 모인 뒤, 허리 바로 위에서 아래로 비스듬히 난 주둥이로 나와 병에 모인다. 검산 메모는 g2u1l9f2.md
import { qcurve, fire, droplet } from "./_lib.mjs";

export const meta = {
  key: "g2u1l9f2",
  w: 340,
  h: 326,
  alt: "아궁이 위 솥에 발효한 술을 넣고 그 위에 허리가 잘록한 소줏고리를 얹었어요. 맨 위 그릇에는 찬물이 들어 있어요. 데워진 술에서 기체가 된 에탄올이 올라가 찬물 그릇 밑면에서 방울로 맺히고, 방울은 위짝 안벽을 타고 허리에 둘린 홈에 모였다가 주둥이로 흘러나와 병에 소주로 모여요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(73);
  const rnd = N.rng(37);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.012 });
  const UP = 74; // 그림 전체를 위로 올린다(위쪽 빈 곳 없이)
  ctx.save();
  ctx.translate(0, -UP);

  const AX = 136; // 가운데 축
  const WT = 6; // 옹기 벽 두께
  // ── 소줏고리 바깥 반지름(키 점을 부드럽게 잇는다) ──
  const interp = (pts) => (y) => {
    // pts: [[y, r], ...] y가 커지는 차례. 캣멀롬 곡선으로 매끈하게 잇는다(키 점마다 기울기가 이어진다).
    if (y <= pts[0][0]) return pts[0][1];
    const n = pts.length;
    if (y >= pts[n - 1][0]) return pts[n - 1][1];
    let i = 0;
    while (y > pts[i + 1][0]) i++;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    const s = (y - p1[0]) / (p2[0] - p1[0]);
    const m1 = ((p2[1] - p0[1]) / (p2[0] - p0[0] || 1)) * (p2[0] - p1[0]);
    const m2 = ((p3[1] - p1[1]) / (p3[0] - p1[0] || 1)) * (p2[0] - p1[0]);
    const s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * p1[1] + (s3 - 2 * s2 + s) * m1 + (-2 * s3 + 3 * s2) * p2[1] + (s3 - s2) * m2;
  };
  const RIM = 114, WAIST = 192, GBOT = 286;
  const rOut = interp([[RIM, 64], [124, 66], [142, 66], [160, 59], [174, 46], [184, 33], [WAIST, 27], [200, 33], [214, 47], [236, 60], [258, 61], [276, 57], [GBOT, 55]]);
  const rIn = (y) => rOut(y) - WT;
  // 허리 안쪽 깃(홈의 안벽)과 홈
  const COLLAR_TOP = 176, COLLAR_IN = 18, COLLAR_OUT = 22;
  const TROUGH_LV = 182; // 홈에 고인 소주 높이

  // ── 아궁이(바닥 화덕): 앞면은 자르지 않고, 아궁이 입 속 불이 보인다 ──
  const HT = 318, HB = 392, HL = 52, HR = 220;
  P.softShadow(t, (HL + HR) / 2 + 4, HB + 2, (HR - HL) * 0.56, 5, 0.22);
  ctx.save();
  // 윗면(얇은 띠) + 앞면
  ctx.beginPath();
  ctx.moveTo(HL, HT + 4);
  ctx.lineTo(HL + 6, HT - 4);
  ctx.lineTo(HR - 6, HT - 4);
  ctx.lineTo(HR, HT + 4);
  ctx.closePath();
  ctx.fillStyle = P.lg(ctx, 0, HT - 4, 0, HT + 4, [[0, "#D9C3A5"], [1, "#BFA382"]]);
  ctx.fill();
  ctx.beginPath();
  P.rrect(ctx, HL, HT + 4, HR - HL, HB - HT - 4, 3);
  ctx.fillStyle = P.lg(ctx, HL, HT, HR, HB, [[0, "#C7AB88"], [0.55, "#A88B69"], [1, "#8A6F52"]]);
  ctx.fill();
  // 흙 바름과 돌 결
  ctx.clip();
  P.shade(t, { x: HL, y: HT + 4 - UP, w: HR - HL, h: HB - HT - 4 }, (x, y) => { // shade는 변환을 무시하고 화면 좌표로 그린다(UP만큼 올린 자리)
    const n = nz.fbm(x * 0.07, y * 0.07, 4), c = N ? nz.n2(x * 0.6, y * 0.6) : 0;
    const v = n * 0.75 + c * 0.25;
    return v > 0 ? [255, 240, 220, v * 0.22] : [60, 40, 25, -v * 0.3];
  });
  ctx.restore();
  // 아궁이 입(둥근 문틀) + 불 + 장작
  const FX = AX, FW = 64, FT = 346;
  ctx.save();
  const arch = (c, inset = 0) => {
    c.moveTo(FX - FW / 2 + inset, HB);
    c.lineTo(FX - FW / 2 + inset, FT + 14);
    c.quadraticCurveTo(FX - FW / 2 + inset, FT + inset, FX, FT + inset);
    c.quadraticCurveTo(FX + FW / 2 - inset, FT + inset, FX + FW / 2 - inset, FT + 14);
    c.lineTo(FX + FW / 2 - inset, HB);
    c.closePath();
  };
  ctx.beginPath();
  arch(ctx, -3);
  ctx.fillStyle = "#6B5440";
  ctx.fill();
  ctx.beginPath();
  arch(ctx, 0);
  ctx.fillStyle = "#1C120C";
  ctx.fill();
  ctx.clip();
  ctx.fillStyle = P.rg(ctx, FX, HB - 6, 2, FX, HB - 6, 44, [[0, "rgba(255,200,90,.9)"], [0.45, "rgba(240,110,40,.55)"], [1, "rgba(120,30,10,0)"]]);
  ctx.fillRect(FX - FW, FT, 2 * FW, HB - FT);
  ctx.restore();
  // 장작
  ctx.save();
  for (const [x0, y0, x1, y1] of [[FX - 26, HB - 3, FX + 14, HB - 9], [FX - 8, HB - 9, FX + 27, HB - 3], [FX - 20, HB - 6, FX + 22, HB - 6]]) {
    ctx.strokeStyle = "#3B2416";
    ctx.lineWidth = 5.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,150,70,.55)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x0 + 2, y0 - 1.6);
    ctx.lineTo(x1 - 2, y1 - 1.6);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  arch(ctx, 0);
  ctx.clip();
  fire(t, FX, HB - 8, 46, 34, 5);
  ctx.restore();
  // 아궁이 입의 불빛이 앞면에 번진다
  ctx.save();
  ctx.fillStyle = P.rg(ctx, FX, HB - 10, 10, FX, HB - 10, 70, [[0, "rgba(255,150,60,.25)"], [1, "rgba(255,150,60,0)"]]);
  ctx.fillRect(HL, HT, HR - HL, HB - HT);
  ctx.restore();

  // ── 솥(무쇠): 앞쪽을 잘라 속의 발효한 술이 보인다. 솥전이 아궁이 윗면에 걸린다 ──
  const PR = GBOT, PB = HT; // 솥 테두리, 솥전 높이(보이는 아래 끝)
  const potR = (y) => interp([[PR, 57], [300, 62], [PB, 64]])(y);
  const LIQ = 298; // 술 수면
  {
    const IN = 3.4;
    // 솥전(넓은 테): 아궁이 윗면 위
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(AX, PB - 1, 80, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, AX - 80, 0, AX + 80, 0, [[0, "#1B1D20"], [0.3, "#4A4F56"], [0.6, "#2A2D31"], [1, "#141518"]]);
    ctx.fill();
    ctx.restore();
    // 안쪽 뒷면(검은 무쇠, 오목)
    const inner = (c) => {
      c.moveTo(AX - potR(PR) + IN, PR);
      for (let y = PR; y <= PB - 2; y += 1) c.lineTo(AX - potR(y) + IN, y);
      c.lineTo(AX + potR(PB - 2) - IN, PB - 2);
      for (let y = PB - 2; y >= PR; y -= 1) c.lineTo(AX + potR(y) - IN, y);
      c.closePath();
    };
    ctx.save();
    ctx.beginPath();
    inner(ctx);
    ctx.fillStyle = P.lg(ctx, AX - 62, 0, AX + 62, 0, [[0, "#121315"], [0.6, "#34383D"], [0.85, "#4A4F55"], [1, "#1D1F22"]]);
    ctx.fill();
    ctx.clip();
    // 발효한 술(뿌옇고 누르스름한 액체, 데워져 기포가 오른다)
    ctx.fillStyle = P.lg(ctx, 0, LIQ, 0, PB, [[0, "#E9DDB5"], [1, "#CDBB86"]]);
    ctx.fillRect(AX - 70, LIQ, 140, PB - LIQ);
    ctx.fillStyle = P.lg(ctx, AX - 62, 0, AX + 62, 0, [[0, "rgba(90,70,30,.25)"], [0.5, "rgba(255,255,255,.12)"], [1, "rgba(90,70,30,.2)"]]);
    ctx.fillRect(AX - 70, LIQ, 140, PB - LIQ);
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let x = AX - 62; x <= AX + 62; x += 1) {
      const yy = LIQ + Math.sin(x * 0.5) * 0.5;
      x === AX - 62 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke();
    for (let k = 0; k < 9; k++) {
      const bx = AX - 50 + rnd() * 100, by = LIQ + 3 + rnd() * (PB - LIQ - 6), br = 0.9 + rnd() * 1.3;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.fill();
      ctx.strokeStyle = "rgba(140,120,70,.6)";
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }
    ctx.restore();
    // 잘린 무쇠 벽(단면)
    ctx.save();
    ctx.fillStyle = "#5F656C";
    ctx.strokeStyle = "rgba(20,22,25,.9)";
    ctx.lineWidth = 0.6;
    for (const sgn of [-1, 1]) {
      ctx.beginPath();
      for (let y = PR; y <= PB - 2; y += 1) ctx.lineTo(AX + sgn * potR(y), y);
      for (let y = PB - 2; y >= PR; y -= 1) ctx.lineTo(AX + sgn * (potR(y) - IN), y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── 소줏고리(옹기, 세로로 자른 모습) ──
  // 안쪽 뒷면: 오목한 유약면(왼쪽 위 빛이 오른쪽 안벽에 닿는다)
  const innerPath = (c, y0, y1) => {
    c.moveTo(AX - rIn(y0), y0);
    for (let y = y0; y <= y1; y += 1) c.lineTo(AX - rIn(y), y);
    for (let y = y1; y >= y0; y -= 1) c.lineTo(AX + rIn(y), y);
    c.closePath();
  };
  const glazeIn = (y0, y1) => {
    ctx.save();
    ctx.beginPath();
    innerPath(ctx, y0, y1);
    ctx.fillStyle = P.lg(ctx, AX - 66, 0, AX + 66, 0, [[0, "#24160D"], [0.45, "#3E2817"], [0.82, "#6B4628"], [1, "#3A2414"]]);
    ctx.fill();
    ctx.clip();
    // 물레 자국(가로 결)
    ctx.strokeStyle = "rgba(255,220,180,.07)";
    ctx.lineWidth = 0.7;
    for (let y = y0 + 3; y < y1; y += 4.2) {
      ctx.beginPath();
      ctx.moveTo(AX - 70, y);
      ctx.lineTo(AX + 70, y + 0.6);
      ctx.stroke();
    }
    ctx.restore();
  };
  // 위짝 속(찬물 그릇 아래 ~ 허리), 아래짝 속(허리 ~ 솥)
  glazeIn(RIM, WAIST);
  glazeIn(WAIST, GBOT);
  // 잘린 옹기 벽(밝은 흙빛 단면, 안팎에 유약 선)
  const cutWall = (sgn) => {
    ctx.save();
    ctx.beginPath();
    for (let y = RIM; y <= GBOT; y += 1) ctx.lineTo(AX + sgn * rOut(y), y);
    for (let y = GBOT; y >= RIM; y -= 1) ctx.lineTo(AX + sgn * rIn(y), y);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, 0, RIM, 0, GBOT, [[0, "#C47A4A"], [0.5, "#B86B3D"], [1, "#A85E33"]]);
    ctx.fill();
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = "#3E2414";
    ctx.beginPath();
    for (let y = RIM; y <= GBOT; y += 1) ctx.lineTo(AX + sgn * rOut(y), y);
    ctx.stroke();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = "#4A2C18";
    ctx.beginPath();
    for (let y = RIM; y <= GBOT; y += 1) ctx.lineTo(AX + sgn * rIn(y), y);
    ctx.stroke();
    ctx.restore();
  };
  cutWall(-1);
  cutWall(1);
  // 허리 안의 깃과 홈(위짝 바닥에 둘린 고리 모양 도랑). 단면에서는 양쪽에 U자로 보인다.
  for (const sgn of [-1, 1]) {
    ctx.save();
    // 깃(허리 구멍 둘레로 솟은 턱): 단면
    ctx.beginPath();
    ctx.moveTo(AX + sgn * COLLAR_IN, WAIST + 2);
    ctx.lineTo(AX + sgn * COLLAR_IN, COLLAR_TOP + 1);
    ctx.quadraticCurveTo(AX + sgn * (COLLAR_IN + 2), COLLAR_TOP - 1, AX + sgn * COLLAR_OUT, COLLAR_TOP + 1);
    ctx.lineTo(AX + sgn * COLLAR_OUT, WAIST - 4);
    ctx.lineTo(AX + sgn * rIn(WAIST - 4), WAIST - 4);
    ctx.lineTo(AX + sgn * rIn(WAIST + 2), WAIST + 2);
    ctx.closePath();
    ctx.fillStyle = "#BE7243";
    ctx.fill();
    ctx.strokeStyle = "#4A2C18";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    // 홈에 고인 소주(맑은 액체)
    ctx.beginPath();
    ctx.moveTo(AX + sgn * COLLAR_OUT, TROUGH_LV);
    ctx.lineTo(AX + sgn * COLLAR_OUT, WAIST - 4);
    ctx.lineTo(AX + sgn * rIn(WAIST - 4), WAIST - 4);
    for (let y = WAIST - 4; y >= TROUGH_LV; y -= 0.5) ctx.lineTo(AX + sgn * rIn(y), y);
    ctx.closePath();
    ctx.fillStyle = "rgba(150,205,250,.95)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(AX + sgn * COLLAR_OUT, TROUGH_LV);
    ctx.lineTo(AX + sgn * rIn(TROUGH_LV), TROUGH_LV);
    ctx.stroke();
    ctx.restore();
  }
  // 깃 뒤쪽 반(고리)이 뒤에 둥글게 보인다
  ctx.save();
  ctx.strokeStyle = "rgba(190,115,70,.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(AX, COLLAR_TOP + 1, COLLAR_OUT - 1, 3.2, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(150,205,250,.85)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(AX, TROUGH_LV, (COLLAR_OUT + rIn(TROUGH_LV)) / 2, 4.2, 0, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();
  ctx.restore();

  // ── 주둥이: 오른쪽 홈 바닥에서 벽을 뚫고 나와 아래로 비스듬히(단면이라 속 구멍이 보인다) ──
  const SP0 = [AX + rIn(WAIST - 4) - 1, WAIST - 5.5]; // 홈 바닥 쪽 입구(안)
  const SP1 = [258, 248]; // 주둥이 끝
  {
    const ang = Math.atan2(SP1[1] - SP0[1], SP1[0] - SP0[0]);
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    const outer = 4.2, bore = 1.6;
    const seg = (d, r0, r1) => [[SP0[0] + nx * d * r0, SP0[1] + ny * d * r0], [SP1[0] + nx * d * r1, SP1[1] + ny * d * r1]];
    ctx.save();
    // 바깥 몸(옹기)
    const [a0, a1] = seg(1, outer, outer * 0.8), [b0, b1] = seg(-1, outer, outer * 0.8);
    ctx.beginPath();
    ctx.moveTo(...a0);
    ctx.lineTo(...a1);
    ctx.lineTo(...b1);
    ctx.lineTo(...b0);
    ctx.closePath();
    ctx.fillStyle = "#BE7243";
    ctx.fill();
    ctx.strokeStyle = "#3E2414";
    ctx.lineWidth = 0.9;
    ctx.stroke();
    // 속 구멍(소주가 흐른다)
    const [c0, c1] = seg(1, bore, bore * 0.8), [d0, d1] = seg(-1, bore, bore * 0.8);
    ctx.beginPath();
    ctx.moveTo(...c0);
    ctx.lineTo(...c1);
    ctx.lineTo(...d1);
    ctx.lineTo(...d0);
    ctx.closePath();
    ctx.fillStyle = "rgba(150,205,250,.95)";
    ctx.fill();
    ctx.restore();
  }

  // ── 찬물 그릇(맨 위): 테가 소줏고리 입에 걸리고, 밑면은 가운데가 조금 솟은 둥근 판 ──
  const BW = { rim: 90, rimR: 76, seat: 112, skirtR: 56, under: 128, dome: 8 };
  const bowlUnder = (x) => BW.under - BW.dome * (1 - Math.pow((x - AX) / BW.skirtR, 2)); // 밑면(바깥) y
  {
    // 그릇 단면 경로(오른쪽 반 → 왼쪽 반 거울)
    const half = (sgn) => [
      [AX + sgn * BW.rimR, BW.rim],
      [AX + sgn * (BW.rimR - 2), BW.rim + 6],
      [AX + sgn * 68, BW.seat - 4],
      [AX + sgn * 64.5, BW.seat],
      [AX + sgn * (BW.skirtR + 2), BW.seat + 1],
      [AX + sgn * BW.skirtR, BW.under],
    ];
    const outerPts = [...half(-1)];
    for (let x = AX - BW.skirtR; x <= AX + BW.skirtR; x += 2) outerPts.push([x, bowlUnder(x)]);
    outerPts.push(...half(1).reverse());
    // 속(물이 담기는 안쪽): 두께 5
    const innerY = (x) => bowlUnder(x) - 5;
    const innerPts = [[AX + (BW.rimR - 5), BW.rim + 1], [AX + 63, BW.seat - 4], [AX + BW.skirtR - 5, BW.under - 6]];
    for (let x = AX + BW.skirtR - 6; x >= AX - BW.skirtR + 6; x -= 2) innerPts.push([x, innerY(x)]);
    innerPts.push([AX - BW.skirtR + 5, BW.under - 6], [AX - 63, BW.seat - 4], [AX - (BW.rimR - 5), BW.rim + 1]);
    // 그릇 안 뒷면(유약)
    ctx.save();
    ctx.beginPath();
    innerPts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, AX - 76, 0, AX + 76, 0, [[0, "#2A1A10"], [0.6, "#4E331E"], [1, "#2E1D12"]]);
    ctx.fill();
    ctx.clip();
    // 찬물
    const WL = 100;
    ctx.fillStyle = P.lg(ctx, 0, WL, 0, BW.under, [[0, "rgba(116,192,252,.92)"], [1, "rgba(51,154,240,.95)"]]);
    ctx.fillRect(AX - 80, WL, 160, BW.under - WL);
    ctx.fillStyle = P.lg(ctx, AX - 76, 0, AX + 76, 0, [[0, "rgba(255,255,255,.08)"], [0.35, "rgba(255,255,255,.22)"], [1, "rgba(10,60,120,.12)"]]);
    ctx.fillRect(AX - 80, WL, 160, BW.under - WL);
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(AX - 80, WL);
    ctx.lineTo(AX + 80, WL);
    ctx.stroke();
    ctx.restore();
    // 그릇 단면 벽
    ctx.save();
    ctx.beginPath();
    outerPts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
    innerPts.slice().reverse().forEach((p) => ctx.lineTo(...p));
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, 0, BW.rim, 0, BW.under, [[0, "#C98150"], [1, "#B0653A"]]);
    ctx.fill("evenodd");
    ctx.strokeStyle = "#3E2414";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    outerPts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
    ctx.stroke();
    ctx.restore();
    // 밀가루 반죽으로 막은 틈(그릇 테와 고리 입, 고리와 솥 사이)
    ctx.save();
    ctx.fillStyle = P.lg(ctx, 0, 0, 0, 4, [[0, "#F3E7CF"], [1, "#D9C7A2"]]);
    for (const sgn of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(AX + sgn * 66.5, BW.seat - 1, 3.2, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(AX + sgn * 57.5, GBOT - 0.5, 3.6, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── 그릇 밑면에 맺힌 방울(가장자리로 갈수록 크다), 안벽을 타고 내려가는 얇은 물줄기 ──
  const drops = [];
  for (const u of [-0.86, -0.62, -0.38, -0.14, 0.14, 0.38, 0.62, 0.86]) {
    const x = AX + u * (BW.skirtR - 3), y = bowlUnder(x) + 1.6;
    const r = 1.5 + Math.abs(u) * 1.1;
    droplet(t, x, y + r * 0.6, r, { col: "#9FD3FF", hang: true });
    drops.push([x, y + r]);
  }
  // 그릇 가장자리에서 떨어진 방울이 위짝 안벽을 타고 홈으로
  for (const sgn of [-1, 1]) {
    ctx.save();
    ctx.strokeStyle = "rgba(150,205,250,.9)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let y = BW.under + 4; y <= TROUGH_LV; y += 1) ctx.lineTo(AX + sgn * (rIn(y) - 0.9), y);
    ctx.stroke();
    ctx.restore();
    for (const yy of [140, 158]) droplet(t, AX + sgn * (rIn(yy) - 2.2), yy, 1.6, { col: "#9FD3FF" });
  }
  // 주둥이 끝에서 병으로 떨어지는 방울
  droplet(t, SP1[0] + 1, SP1[1] + 7, 1.7, { col: "#9FD3FF" });
  droplet(t, SP1[0] + 1.5, SP1[1] + 15, 1.5, { col: "#9FD3FF" });

  // ── 받는 병(유리병, 소주가 모인다): 작은 나무 받침 위 ──
  const BT = { cx: 262, mouth: 264, base: 336 };
  {
    // 받침(나무 소반)
    P.softShadow(t, BT.cx + 3, HB + 1, 34, 4, 0.2);
    ctx.save();
    ctx.fillStyle = P.lg(ctx, 0, BT.base, 0, BT.base + 6, [[0, "#C8925A"], [1, "#8E5E33"]]);
    ctx.beginPath();
    P.rrect(ctx, BT.cx - 30, BT.base, 60, 6, 2);
    ctx.fill();
    ctx.fillStyle = P.lg(ctx, 0, BT.base + 6, 0, HB, [[0, "#9A6A3E"], [1, "#6E4626"]]);
    for (const dx of [-25, 21]) ctx.fillRect(BT.cx + dx, BT.base + 6, 4, HB - BT.base - 6);
    ctx.restore();
    // 병 모양
    const bodyR = 17, neckR = 5;
    const bottle = (c) => {
      c.moveTo(BT.cx - neckR, BT.mouth);
      c.lineTo(BT.cx - neckR, BT.mouth + 14);
      c.bezierCurveTo(BT.cx - neckR, BT.mouth + 26, BT.cx - bodyR, BT.mouth + 26, BT.cx - bodyR, BT.mouth + 40);
      c.lineTo(BT.cx - bodyR, BT.base - 4);
      c.quadraticCurveTo(BT.cx - bodyR, BT.base, BT.cx - bodyR + 4, BT.base);
      c.lineTo(BT.cx + bodyR - 4, BT.base);
      c.quadraticCurveTo(BT.cx + bodyR, BT.base, BT.cx + bodyR, BT.base - 4);
      c.lineTo(BT.cx + bodyR, BT.mouth + 40);
      c.bezierCurveTo(BT.cx + bodyR, BT.mouth + 26, BT.cx + neckR, BT.mouth + 26, BT.cx + neckR, BT.mouth + 14);
      c.lineTo(BT.cx + neckR, BT.mouth);
      c.closePath();
    };
    ctx.save();
    ctx.beginPath();
    bottle(ctx);
    ctx.fillStyle = P.lg(ctx, BT.cx - bodyR, 0, BT.cx + bodyR, 0, [[0, "rgba(150,190,165,.55)"], [0.3, "rgba(225,242,232,.45)"], [0.75, "rgba(200,228,212,.35)"], [1, "rgba(130,175,150,.55)"]]);
    ctx.fill();
    ctx.clip();
    // 모인 소주(맑다)
    const SL = BT.base - 26;
    ctx.fillStyle = P.lg(ctx, BT.cx - bodyR, 0, BT.cx + bodyR, 0, [[0, "rgba(150,205,250,.55)"], [0.5, "rgba(200,232,255,.35)"], [1, "rgba(150,205,250,.55)"]]);
    ctx.fillRect(BT.cx - bodyR, SL, 2 * bodyR, BT.base - SL);
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(BT.cx, SL, bodyR - 1, 2.4, 0, 0, Math.PI * 2);
    ctx.stroke();
    // 반사
    ctx.fillStyle = P.lg(ctx, BT.cx - bodyR + 3, 0, BT.cx - bodyR + 9, 0, [[0, "rgba(255,255,255,0)"], [0.5, "rgba(255,255,255,.75)"], [1, "rgba(255,255,255,0)"]]);
    ctx.fillRect(BT.cx - bodyR + 3, BT.mouth + 30, 6, BT.base - BT.mouth - 36);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    bottle(ctx);
    ctx.strokeStyle = "rgba(80,120,100,.8)";
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(BT.cx, BT.mouth, neckR + 0.8, 1.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(235,248,240,.9)";
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    BT.SL = SL;
  }

  ctx.restore();
  // ── 겹층: 화살표와 라벨 ──
  const sv0 = S.svgLayer(root, w, h);
  const sv = S.el(sv0, "g", { transform: `translate(0 ${-UP})` });
  // 기체가 된 에탄올(연보라): 술에서 허리 깃을 지나 그릇 밑면까지
  const VAP = "#B197FC";
  for (const [a, c, b] of [
    [[AX - 30, LIQ - 4], [AX - 30, 240], [AX - 9, 200]],
    [[AX, LIQ - 4], [AX + 4, 245], [AX, 200]],
    [[AX + 30, LIQ - 4], [AX + 30, 240], [AX + 9, 200]],
  ]) S.fatArrow(sv, qcurve(a, c, b, 16), { fill: VAP, w0: 2.4, w1: 4.6, head: 8, hw: 6, sw: 0.9 });
  for (const [a, c, b] of [
    [[AX - 6, 172], [AX - 22, 152], [AX - 34, 136]],
    [[AX, 172], [AX, 150], [AX + 2, 132]],
    [[AX + 6, 172], [AX + 22, 152], [AX + 34, 136]],
  ]) S.fatArrow(sv, qcurve(a, c, b, 14), { fill: VAP, w0: 2.2, w1: 4.2, head: 7.5, hw: 5.6, sw: 0.9 });
  // 방울이 가는 길(파랑): 그릇 밑면을 따라 가장자리로 → 안벽을 타고 홈으로 → 주둥이로 → 병으로
  const FLOW = "#1C7ED6";
  for (const sgn of [-1, 1]) {
    S.rayArrow(sv, [AX + sgn * 18, bowlUnder(AX + sgn * 18) + 8], [AX + sgn * 44, bowlUnder(AX + sgn * 44) + 8], { color: FLOW, w: 1.3, hl: 4.6, hw: 2.8 });
    const y0 = 146, y1 = 172;
    S.rayArrow(sv, [AX + sgn * (rIn(y0) - 6), y0], [AX + sgn * (rIn(y1) - 5), y1], { color: FLOW, w: 1.3, hl: 4.6, hw: 2.8 });
  }
  S.rayArrow(sv, [SP0[0] + 26, SP0[1] + 13], [SP0[0] + 62, SP0[1] + 40], { color: FLOW, w: 1.3, hl: 4.6, hw: 2.8 });
  // 라벨: 왼쪽
  const L = (x, y, s, o = {}) => S.label(sv, x, y, s, { size: 13.5, ...o });
  L(4, 92, "냉각수\n(찬물)", { lh: 16 });
  S.leader(sv, [[48, 96], [AX - 40, 106]]);
  L(4, 140, "맺힌 방울", {});
  S.leader(sv, [[64, 136], [drops[1][0] - 1, drops[1][1] + 1]], { dotR: 1.8 });
  L(4, 206, "소줏고리", {});
  S.leader(sv, [[58, 202], [AX - rOut(214) + 3, 214]]);
  L(4, 248, "기체가 된\n에탄올", { lh: 16 });
  S.leader(sv, [[62, 252], [AX - 28, 262]]);
  L(4, 302, "발효한 술", {});
  S.leader(sv, [[64, 298], [AX - 44, 306]]);
  L(4, 330, "솥", {});
  S.leader(sv, [[20, 326], [AX - 72, PB - 2]]);
  L(4, 378, "아궁이", {});
  S.leader(sv, [[46, 374], [FX - FW / 2 + 6, 376]]);
  // 라벨: 오른쪽
  L(300, 166, "홈", {});
  S.leader(sv, [[298, 162], [AX + (COLLAR_OUT + rIn(TROUGH_LV + 3)) / 2, TROUGH_LV + 3.5]], { dotR: 1.8 });
  L(290, 214, "주둥이", {});
  S.leader(sv, [[288, 210], [226, 225]]);
  L(300, 312, "소주", {});
  S.leader(sv, [[298, 308], [BT.cx + 6, BT.SL + 9]]);
}
