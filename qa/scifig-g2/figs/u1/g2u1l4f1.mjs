// g2u1l4f1 탄산수 병: 뚜껑을 닫은 병과 방금 연 병을 세로로 잘라 본 모습. 이산화 탄소 입자(회색 공)만 그리고 물 입자는 옅은 바탕색.
// 닫은 병: 위쪽 빈 곳에 입자가 많고(압력이 높다) 음료 속에도 많이 녹아 있으며 기포가 없다.
// 연 병: 위쪽 입자가 입구로 빠져나가고, 음료 속 입자가 줄며 벽과 바닥에서 기포가 생겨 떠오르며 커진다. 검산 메모는 g2u1l4f1.md
import { COL, ballSprite, stamp, ao, spread, thermo, bubble } from "./_lib.mjs";

export const meta = {
  key: "g2u1l4f1",
  w: 340,
  h: 364,
  alt: "탄산수 병 두 개를 세로로 잘라 본 그림. 뚜껑을 닫은 병은 위쪽 빈 곳에 회색 이산화 탄소 입자가 많고 음료 속에도 많이 녹아 있으며 기포가 없어요. 뚜껑을 연 병은 위쪽의 입자가 입구로 빠져나가고, 음료 속에 녹아 있는 입자가 줄어든 대신 벽과 바닥에서 생긴 기포가 떠오르며 커져요. 두 병의 온도계 눈금은 같아요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(44);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.012 });
  const D = 14; // 병 그림 전체를 제목 아래로 내린다(빠져나가는 입자가 제목과 겹치지 않게)
  ctx.save();
  ctx.translate(0, D);

  const BX = [92, 248];
  const YT = 62; // 병 입구 위 끝
  const LV = 117; // 액면
  const WALL = 1.4;
  const RC = 3.3; // 이산화 탄소 입자 반지름
  const sprC = ballSprite(t, RC, COL.co2, { spec: 0.5, gloss: 30, bounce: "#E9ECEF", ambient: 0.26 });

  // ── 병 단면의 바깥 반지름 r(y) (병 가운데 기준) ──
  const sm = (a, b, x) => P.smooth(a, b, x);
  const prof = (y) => {
    if (y < YT + 13) {
      // 입구와 나사산(두 줄)
      const bump = Math.max(0, 1 - Math.abs(y - (YT + 4.5)) / 1.6) + Math.max(0, 1 - Math.abs(y - (YT + 9)) / 1.6);
      return 10.4 + bump * 1.25;
    }
    if (y < YT + 16) return 13.4; // 받침 고리
    if (y < YT + 21) return 10.8;
    if (y < 118) {
      const s = (y - (YT + 21)) / (118 - (YT + 21));
      return 10.8 + 26.2 * (0.5 - 0.5 * Math.cos(Math.PI * s));
    }
    // 몸통(얕은 홈 두 쌍)
    let r = 37;
    for (const gy of [168, 176, 238, 246]) r -= 1.3 * Math.max(0, 1 - Math.abs(y - gy) / 2.2);
    return r;
  };
  const BOT = 298; // 몸통이 끝나고 바닥 꽃 모양이 시작되는 높이
  const FOOT = 313; // 바닥 발 끝
  // 바닥 단면(가운데를 지나는 면): 양쪽 발과 가운데 볼록 솟은 바닥
  const baseOuter = (s) => {
    // s: −1(왼쪽 벽) ~ 1(오른쪽 벽) → [x, y]
    const ax = Math.abs(s);
    let y;
    if (ax > 0.8) y = BOT + (FOOT - BOT) * Math.sin(((1 - ax) / 0.2) * (Math.PI / 2)); // 벽에서 발 끝으로
    else y = FOOT - (FOOT - (BOT + 5)) * Math.pow(1 - ax / 0.8, 1.6) * 1; // 발 끝에서 가운데 솟은 곳으로
    const x = s * (ax > 0.8 ? 37 - (1 - Math.cos(((1 - ax) / 0.2) * (Math.PI / 2))) * 6 : 31 * (ax / 0.8));
    return [x, y];
  };

  const outline = (cx, inset) => {
    // 병 안쪽 빈 곳(inset>0이면 벽 두께만큼 안쪽) 경로의 점 목록: 왼쪽 위 → 아래 → 바닥 → 오른쪽 위
    const pts = [];
    for (let y = YT + (inset ? 1.2 : 0); y <= BOT; y += 0.5) pts.push([cx - prof(y) + inset, y]);
    for (let s = -1; s <= 1.0001; s += 0.02) {
      const [x, y] = baseOuter(s);
      pts.push([cx + x * (1 - inset / 37), y - inset * 0.9]);
    }
    for (let y = BOT; y >= YT + (inset ? 1.2 : 0); y -= 0.5) pts.push([cx + prof(y) - inset, y]);
    return pts;
  };
  const poly = (c, pts) => pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));

  // ── 병 하나(잘라 본 모습) ──
  const bottle = (cx, open) => {
    const outer = outline(cx, 0), inner = outline(cx, WALL);
    P.softShadow(t, cx + 3, FOOT + 2, 44, 6, 0.2);
    // 안쪽 뒷면(오목한 뒷벽: 왼쪽 위 빛이 오른쪽 안벽에 닿는다)
    ctx.save();
    ctx.beginPath();
    poly(ctx, inner);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = P.lg(ctx, cx - 37, 0, cx + 37, 0, [[0, "#C9D6E3"], [0.14, "#E3EBF3"], [0.6, "#F3F7FB"], [0.88, "#FAFCFE"], [1, "#DCE6F0"]]);
    ctx.fillRect(cx - 40, YT - 4, 80, FOOT - YT + 8);
    // 음료(물 입자는 그리지 않고 옅은 바탕색)
    ctx.fillStyle = P.lg(ctx, cx - 37, 0, cx + 37, 0, [[0, "rgba(120,180,215,.42)"], [0.2, "rgba(170,210,232,.32)"], [0.7, "rgba(185,220,238,.26)"], [1, "rgba(140,190,220,.4)"]]);
    ctx.fillRect(cx - 40, LV, 80, FOOT - LV + 4);
    ctx.fillStyle = P.lg(ctx, 0, LV, 0, FOOT, [[0, "rgba(255,255,255,0)"], [1, "rgba(90,150,190,.12)"]]);
    ctx.fillRect(cx - 40, LV, 80, FOOT - LV + 4);
    // 액면(뒤쪽 반 타원이 살짝 보인다)
    ctx.fillStyle = "rgba(225,240,250,.85)";
    ctx.beginPath();
    ctx.ellipse(cx, LV, prof(LV) - WALL, 3.2, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(cx, LV, prof(LV) - WALL, 3.2, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(80,140,185,.55)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(cx - prof(LV) + WALL, LV);
    ctx.lineTo(cx + prof(LV) - WALL, LV);
    ctx.stroke();
    // 안벽의 세로 반사
    ctx.fillStyle = P.lg(ctx, cx + 14, 0, cx + 26, 0, [[0, "rgba(255,255,255,0)"], [0.5, "rgba(255,255,255,.45)"], [1, "rgba(255,255,255,0)"]]);
    ctx.fillRect(cx + 14, 122, 12, BOT - 130);
    ctx.restore();
    // 자른 벽(얇은 페트 단면): 바깥선과 안선 사이
    ctx.save();
    ctx.beginPath();
    poly(ctx, outer);
    ctx.closePath();
    poly(ctx, inner.slice().reverse());
    ctx.closePath();
    ctx.fillStyle = "rgba(196,214,232,.95)";
    ctx.fill("evenodd");
    ctx.strokeStyle = "rgba(96,120,150,.85)";
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    poly(ctx, outer);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    poly(ctx, inner);
    ctx.stroke();
    ctx.restore();
    return { inner };
  };

  // ── 입자와 기포 자리 ──
  const insideBottle = (cx, y0, y1) => (x, y, r) => {
    if (y < y0 + r || y > y1 - r) return false;
    const rr = (y > BOT ? 30 : prof(y)) - WALL - r - 0.6;
    if (Math.abs(x - cx) > rr) return false;
    // 목 부분은 위아래 두 점도 확인(어깨가 굽어 있으니)
    const r2 = prof(Math.max(YT + 1, y - r)) - WALL - r - 0.6;
    return Math.abs(x - cx) <= r2;
  };
  const box = (cx, y0, y1) => ({ x: cx - 37, y: y0, w: 74, h: y1 - y0 });
  const inner = (f) => (x, y, r) => (f(x, y, r) ? true : [x, y]);

  // 닫은 병
  bottle(BX[0], false);
  const headC = spread({ n: 11, r: RC, seed: 3, box: box(BX[0], YT + 2, LV - 1), inside: inner(insideBottle(BX[0], YT + 3, LV - 1)), cand: 80 });
  const liqC = spread({ n: 104, r: RC, seed: 5, box: box(BX[0], LV + 2, 304), inside: inner(insideBottle(BX[0], LV + 2, 300)), cand: 30 });
  for (const p of [...headC, ...liqC]) ao(t, p.x, p.y, RC, 0.14);
  for (const p of [...headC, ...liqC]) stamp(t, sprC, p.x, p.y);

  // 연 병
  bottle(BX[1], true);
  const cx2 = BX[1];
  // 기포: 벽과 바닥에 붙어 생기는 작은 것 → 떠오르며 커지는 것
  const bubs = [
    { x: cx2 - 34.2, y: 282, r: 4.6, n: 1, wall: -1 },
    { x: cx2 - 34.6, y: 214, r: 4.4, n: 1, wall: -1 },
    { x: cx2 + 34.4, y: 258, r: 4.8, n: 1, wall: 1 },
    { x: cx2 + 33.6, y: 190, r: 4.4, n: 1, wall: 1 },
    { x: cx2 - 9, y: 300.5, r: 4.8, n: 1, wall: 0 },
    { x: cx2 + 13, y: 303.5, r: 4.4, n: 1, wall: 0 },
    { x: cx2 - 19, y: 252, r: 6.6, n: 2 },
    { x: cx2 + 10, y: 228, r: 7.6, n: 2 },
    { x: cx2 - 13, y: 190, r: 8.8, n: 3 },
    { x: cx2 + 17, y: 160, r: 10, n: 4 },
    { x: cx2 - 15, y: 138, r: 11.2, n: 5 },
  ];
  const bubFixed = bubs.map((b) => ({ x: b.x, y: b.y, r: b.r + 1.6 }));
  const headO = [{ x: cx2 - 9, y: 104 }, { x: cx2 + 13, y: 110 }, { x: cx2 + 1, y: 92 }, { x: cx2 - 20, y: 112 }].map((p) => ({ ...p, r: RC }));
  const liqO = spread({ n: 54, r: RC, seed: 9, box: box(cx2, LV + 2, 304), inside: inner(insideBottle(cx2, LV + 2, 300)), fixed: bubFixed, cand: 40 });
  for (const p of [...headO, ...liqO]) ao(t, p.x, p.y, RC, 0.14);
  for (const p of [...headO, ...liqO]) stamp(t, sprC, p.x, p.y);
  // 기포와 그 속의 입자(기포 속 기체도 이산화 탄소)
  let inBub = 0;
  for (const b of bubs) {
    bubble(t, b.x, b.y, b.r, { tint: "#EEF6FF", edge: "rgba(110,140,175,.8)" });
    const ang0 = b.wall === -1 ? 0 : b.wall === 1 ? Math.PI : -Math.PI / 2;
    for (let k = 0; k < b.n; k++) {
      let px = b.x, py = b.y;
      if (b.n > 1) {
        const a = ang0 + (k / b.n) * Math.PI * 2 + 0.5;
        const rr = b.r - RC - 1.2;
        px = b.x + Math.cos(a) * rr * (b.n === 2 ? 0.95 : 0.8);
        py = b.y + Math.sin(a) * rr * (b.n === 2 ? 0.95 : 0.8);
      }
      stamp(t, sprC, px, py);
      inBub++;
    }
    // 기포 겉의 반사는 입자 위로 한 번 더
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.beginPath();
    ctx.ellipse(b.x - b.r * 0.4, b.y - b.r * 0.45, b.r * 0.24, b.r * 0.13, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // 떠오르는 기포 옆의 짧은 꼬리(움직임)
  ctx.save();
  ctx.strokeStyle = "rgba(110,140,175,.45)";
  ctx.lineWidth = 0.8;
  ctx.lineCap = "round";
  for (const b of bubs.filter((q) => q.wall === undefined)) {
    for (const dx of [-0.45, 0.45]) {
      ctx.beginPath();
      ctx.moveTo(b.x + dx * b.r, b.y + b.r + 2);
      ctx.lineTo(b.x + dx * b.r * 0.8, b.y + b.r + 2 + b.r * 0.55);
      ctx.stroke();
    }
  }
  ctx.restore();
  // 빠져나가는 이산화 탄소(입구 위)
  const outP = [{ x: cx2 + 1, y: 51 }, { x: cx2 + 21, y: 37 }, { x: cx2 - 17, y: 38 }];
  for (const p of outP) stamp(t, sprC, p.x, p.y);
  console.warn(`[g2u1l4f1] 닫은 병: 위쪽 ${headC.length}, 음료 속 ${liqC.length} / 연 병: 위쪽 ${headO.length}, 음료 속 ${liqO.length}, 기포 ${bubs.length}개 속 ${inBub}, 빠져나가는 ${outP.length}`);

  // ── 닫은 병의 뚜껑(잘라 본 모습: 윗판, 치마, 안쪽 나사산, 입구를 막는 마개 고리) ──
  {
    const cx = BX[0];
    const top = YT - 6, bot = YT + 12.5, Ro = 13.6, Ri = 11.9;
    const green = "#2F9E44", greenCut = "#69DB7C";
    ctx.save();
    // 단면(초록, 밝은 자른 면)
    const capCut = (c) => {
      c.moveTo(cx - Ro, bot);
      c.lineTo(cx - Ro, top + 1.4);
      c.quadraticCurveTo(cx - Ro, top, cx - Ro + 1.4, top);
      c.lineTo(cx + Ro - 1.4, top);
      c.quadraticCurveTo(cx + Ro, top, cx + Ro, top + 1.4);
      c.lineTo(cx + Ro, bot);
      c.lineTo(cx + Ri, bot);
      c.lineTo(cx + Ri, top + 3);
      c.lineTo(cx - Ri, top + 3);
      c.lineTo(cx - Ri, bot);
      c.closePath();
    };
    // 뚜껑 안쪽 뒷면(어둡게)
    ctx.fillStyle = P.lg(ctx, cx - Ri, 0, cx + Ri, 0, [[0, "#1F6B2E"], [0.5, "#2B8A3E"], [1, "#237032"]]);
    ctx.fillRect(cx - Ri, top + 3, 2 * Ri, bot - top - 3);
    ctx.beginPath();
    capCut(ctx);
    ctx.fillStyle = P.lg(ctx, 0, top, 0, bot, [[0, greenCut], [1, "#51CF66"]]);
    ctx.fill();
    ctx.strokeStyle = green;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // 안쪽 나사산(뚜껑 쪽)
    ctx.fillStyle = greenCut;
    for (const yy of [YT + 6.8, YT + 11.2]) for (const sgn of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + sgn * Ri, yy - 1.4);
      ctx.lineTo(cx + sgn * (Ri - 1.2), yy);
      ctx.lineTo(cx + sgn * Ri, yy + 1.4);
      ctx.closePath();
      ctx.fill();
    }
    // 입구를 막는 마개 고리(병 입구 안쪽에 끼워진다)
    for (const sgn of [-1, 1]) {
      ctx.fillStyle = greenCut;
      ctx.fillRect(cx + sgn * 8.6 - (sgn > 0 ? 1.6 : 0), top + 3, 1.6, 5.5);
    }
    ctx.restore();
  }
  // ── 연 병의 뚜껑: 탁자 위에 놓인 온전한 뚜껑 ──
  {
    const cx = 312, y = FOOT;
    P.softShadow(t, cx + 2, y + 1, 16, 3.5, 0.22);
    const Rr = 13.2, ry = 4.2, hgt = 9;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, y - ry * 0.2, Rr, ry, 0, 0, Math.PI);
    ctx.lineTo(cx - Rr, y - hgt);
    ctx.ellipse(cx, y - hgt, Rr, ry, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, cx - Rr, 0, cx + Rr, 0, [[0, "#2B8A3E"], [0.3, "#51CF66"], [0.55, "#37B24D"], [1, "#1F6B2E"]]);
    ctx.fill();
    // 옆면의 세로 홈(미끄럼 방지)
    ctx.strokeStyle = "rgba(20,70,30,.35)";
    ctx.lineWidth = 0.5;
    for (let k = -10; k <= 10; k++) {
      const s = k / 10.5, x = cx + Rr * Math.sin(s * Math.PI / 2);
      const yy = y - ry * 0.2 + ry * Math.cos(s * Math.PI / 2) * 0.9;
      ctx.beginPath();
      ctx.moveTo(x, yy - 1);
      ctx.lineTo(x, yy - hgt + 1.2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(cx, y - hgt, Rr, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, cx - Rr, y - hgt - ry, cx + Rr, y - hgt + ry, [[0, "#8CE99A"], [0.6, "#51CF66"], [1, "#2F9E44"]]);
    ctx.fill();
    ctx.restore();
  }

  // ── 온도계(두 병 옆, 같은 눈금) ──
  const TF = 0.3;
  thermo(t, 34, 236, 304, TF);
  thermo(t, 191, 236, 304, TF);
  P.softShadow(t, 34, 309, 6, 1.6, 0.18);
  P.softShadow(t, 191, 309, 6, 1.6, 0.18);

  ctx.restore();
  // ── 겹층: 화살표와 라벨 ──
  const sv0 = S.svgLayer(root, w, h);
  const sv = S.el(sv0, "g", { transform: `translate(0 ${D})` });
  // 빠져나가는 방향
  for (const [a, b] of [[[cx2 - 4, 62], [cx2 - 12.5, 46]], [[cx2 + 5, 62], [cx2 + 15.5, 46]]]) S.rayArrow(sv, a, b, { color: "#868E96", w: 1.4, hl: 6, hw: 3.4 });
  S.label(sv0, 92, 19, "뚜껑을 닫은 병", { size: 14, anchor: "middle" });
  S.label(sv0, 248, 19, "뚜껑을 연 병", { size: 14, anchor: "middle" });
  S.label(sv0, 92, 37, "병 속 압력이 높아요", { size: 13.5, anchor: "middle", color: "#C2410C" });
  S.label(sv0, 248, 37, "병 속 압력이 낮아져요", { size: 13.5, anchor: "middle", color: "#1971C2" });
  // 왼쪽 병을 가리키는 이름(가운데 틈)
  const near = (list, x, y) => list.reduce((m, p) => (Math.hypot(p.x - x, p.y - y) < Math.hypot(m.x - x, m.y - y) ? p : m), list[0]);
  const hp = near(headC, BX[0] + 14, 100);
  S.label(sv, 134, 88, "이산화 탄소\n입자", { size: 13.5, lh: 16 });
  S.leader(sv, [[132, 84], [hp.x + 1, hp.y]], { dotR: 1.8 });
  const lp = near(liqC, BX[0] + 22, 190);
  S.label(sv, 134, 180, "녹아 있는\n이산화 탄소", { size: 13.5, lh: 16 });
  S.leader(sv, [[132, 176], [lp.x + 1, lp.y]], { dotR: 1.8 });
  // 오른쪽 병
  S.label(sv, 338, 76, "빠져나가는\n이산화 탄소", { size: 13.5, lh: 16, anchor: "end" });
  S.leader(sv, [[276, 72], [cx2 + 23, 39]], { dotR: 1.8 });
  const bb = bubs[9];
  S.label(sv, 338, 214, "기포", { size: 13.5, anchor: "end" });
  S.leader(sv, [[312, 209], [bb.x + bb.r * 0.75, bb.y + bb.r * 0.4]], { dotR: 1.8 });
  S.label(sv, 170, 342, "물 입자는 그리지 않았어요", { size: 13.5, anchor: "middle", weight: 600, color: "#5B6676" });
}
