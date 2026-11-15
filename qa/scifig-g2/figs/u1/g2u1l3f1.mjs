// g2u1l3f1 설탕의 용해: 같은 비커 셋(넣은 직후 → 녹는 중 → 다 녹은 뒤)과 비커 바닥 한 곳을 크게 본 원.
// 세 원 모두 설탕 입자 12개, 물 입자 수도 같다(녹아도 사라지지 않는다). 검산 메모는 g2u1l3f1.md
import { COL, ballSprite, stamp, ao, lens, zoomFill, zoomLines, beaker, pack, inCircle, spread, maxOverlap } from "./_lib.mjs";

export const meta = {
  key: "g2u1l3f1",
  w: 340,
  h: 256,
  alt: "물이 든 비커 바닥에 설탕을 넣은 직후, 녹는 중, 다 녹은 뒤의 세 모습. 비커 바닥을 크게 본 원에서 노란 설탕 입자 12개가 처음에는 한 덩이로 뭉쳐 있다가 하나씩 떨어져 나와 파란 물 입자 사이에 고르게 퍼져요. 세 원의 설탕 입자 수는 같아요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(31);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.012 });

  // ── 배치 ──
  const B = [88, 170, 252]; // 비커 가운데
  const BT = 36, BB = 98, BRX = 25, BRY = 5, LV = 52; // 비커 위 테두리, 바닥, 반지름, 액면
  const C = [60, 170, 280], CY = 170, CR = 48; // 확대 원
  const FLOOR = CY + 33; // 원 속 유리 바닥 윗면
  const RS = 7, RW = 2.9; // 설탕 입자, 물 입자 반지름(지름 비 2.4)
  const NW = 140; // 원마다 물 입자 수(같게)
  const spotY = BB - 6;

  // ── 확대 통로(물체보다 먼저 옅은 띠) ──
  for (let i = 0; i < 3; i++) zoomFill(t, { x: B[i], y: spotY, r: 8 }, { x: C[i], y: CY, r: CR });

  // ── 비커 셋 ──
  const rnd = N.rng(7);
  const heap = (cx, floorY, wid, hgt, count) => {
    // 바닥에 쌓인 흰 설탕 알갱이(작은 육면체 조각): 뒤(위)부터 앞(아래)으로
    const gs = [];
    for (let k = 0; k < count; k++) {
      const u = rnd() * 2 - 1;
      const hm = hgt * (1 - u * u);
      gs.push({ x: cx + u * wid * 0.5, y: floorY - rnd() * hm, s: 1.3 + rnd() * 1.1, a: rnd() * Math.PI });
    }
    gs.sort((a, b) => a.y - b.y);
    for (const g of gs) {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.a);
      ctx.fillStyle = P.lg(ctx, -g.s, -g.s, g.s, g.s, [[0, "#FFFFFF"], [0.55, "#F1F4F8"], [1, "#BAC4D2"]]);
      ctx.strokeStyle = "rgba(140,152,170,.6)";
      ctx.lineWidth = 0.35;
      ctx.beginPath();
      ctx.rect(-g.s / 2, -g.s / 2, g.s, g.s);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    // 반짝임 몇 개
    ctx.fillStyle = "rgba(255,255,255,.95)";
    for (let k = 0; k < 4; k++) {
      const u = rnd() * 1.4 - 0.7;
      ctx.beginPath();
      ctx.arc(cx + u * wid * 0.5, floorY - rnd() * hgt * (1 - u * u) - 0.6, 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  const schlieren = (cx, y0, y1) => {
    // 녹아 나오는 진한 설탕물이 만드는 아지랑이 결(빛이 휘는 줄)
    ctx.save();
    ctx.lineCap = "round";
    for (let k = 0; k < 5; k++) {
      const x0 = cx - 6 + k * 3;
      ctx.strokeStyle = k % 2 ? "rgba(255,255,255,.7)" : "rgba(70,130,190,.24)";
      ctx.lineWidth = k % 2 ? 0.9 : 0.7;
      ctx.beginPath();
      for (let s = 0; s <= 1.0001; s += 0.05) {
        const y = y0 - (y0 - y1) * s;
        const x = x0 + Math.sin(s * 9 + k * 1.7) * (1 + s * 3.2) + (k - 2) * s * 3.5;
        s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  };
  B.forEach((cx, i) => {
    beaker(t, {
      cx, top: BT, bot: BB, rx: BRX, ry: BRY, level: LV, liq: COL.water, liqA: 0.85, spout: "l", marks: 6,
      inLiquid: () => {
        if (i === 0) heap(cx, BB - 1.2, 30, 8, 70);
        if (i === 1) {
          schlieren(cx, BB - 5, LV + 14);
          heap(cx, BB - 1.2, 15, 4.2, 26);
        }
      },
    });
  });

  // ── 확대 통로의 점선과 표시 고리 ──
  for (let i = 0; i < 3; i++) zoomLines(t, { x: B[i], y: spotY, r: 8 }, { x: C[i], y: CY, r: CR });

  // ── 원 속 입자 배치 ──
  const sugarSets = [];
  // 1) 넣은 직후: 12개가 가지런히 뭉친 알갱이(바닥 위 3줄 × 4)
  const block = [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) block.push({ col, row, x: (col - 1.5) * 2 * RS, y: FLOOR - RS - row * 2 * RS });
  sugarSets.push(block.map((b) => ({ x: b.x, y: b.y, r: RS })));
  // 2) 녹는 중: 아랫줄 4개와 가운데 줄 3개가 남고, 겉의 5개가 떨어져 나와 퍼진다
  const stay = block.filter((b) => b.row === 0 || (b.row === 1 && b.col < 3));
  const off = [[-8, 158], [33.5, 176], [-31, 149], [9, 138], [31, 146]]; // 떨어져 나온 5개(x는 원 가운데 기준, y는 그림 좌표)
  sugarSets.push([...stay.map((b) => ({ x: b.x, y: b.y, r: RS })), ...off.map(([x, y]) => ({ x, y, r: RS }))]);
  // 3) 다 녹은 뒤: 12개가 물 전체에 고르게
  {
    const ins = inCircle(0, CY, CR - 1.5, FLOOR);
    sugarSets.push(spread({ n: 12, r: RS, seed: 11, box: { x: -CR, y: CY - CR, w: 2 * CR, h: 2 * CR }, inside: (x, y, r) => ins(x, y, r + 1.2), cand: 60 }));
  }
  // 원 가운데 기준 → 그림 좌표
  const sets = sugarSets.map((set, i) => set.map((p) => ({ x: C[i] + p.x, y: p.y, r: RS })));
  const waters = sets.map((sug, i) =>
    pack({ n: NW, r: RW, seed: 5 + i * 13, box: { x: C[i] - CR, y: CY - CR, w: 2 * CR, h: 2 * CR }, inside: inCircle(C[i], CY, CR - 0.6, FLOOR), fixed: sug, gap: 0.32, iters: 520 }),
  );
  // 검산(콘솔): 입자 수와 최대 겹침
  sets.forEach((sug, i) => console.warn(`[g2u1l3f1] 원${i + 1}: 설탕 ${sug.length}, 물 ${waters[i].length}, 최대 겹침 ${maxOverlap([...sug, ...waters[i]]).toFixed(2)}px`));

  const sprW = ballSprite(t, RW, COL.water, { spec: 0.45, gloss: 26, bounce: "#D0EBFF" });
  const sprS = ballSprite(t, RS, COL.sugar, { spec: 0.5, gloss: 30, bounce: "#FFF3BF", ambient: 0.34 });

  for (let i = 0; i < 3; i++) {
    lens(t, C[i], CY, CR, () => {
      // 액체 바탕: 물 쪽빛 옅게
      ctx.fillStyle = P.lg(ctx, 0, CY - CR, 0, FLOOR, [[0, "#F1F8FF"], [1, "#DCEEFC"]]);
      ctx.fillRect(C[i] - CR, CY - CR, 2 * CR, FLOOR - CY + CR);
      // 비커의 유리 바닥(자른 면처럼 두껍게)
      ctx.fillStyle = P.lg(ctx, 0, FLOOR, 0, CY + CR, [[0, "#E4ECF5"], [0.25, "#D2DDE9"], [1, "#C3D0DE"]]);
      ctx.fillRect(C[i] - CR, FLOOR, 2 * CR, CY + CR - FLOOR);
      ctx.strokeStyle = "rgba(255,255,255,.95)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(C[i] - CR, FLOOR + 0.6);
      ctx.lineTo(C[i] + CR, FLOOR + 0.6);
      ctx.stroke();
      ctx.strokeStyle = "rgba(120,140,165,.45)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(C[i] - CR, FLOOR - 0.2);
      ctx.lineTo(C[i] + CR, FLOOR - 0.2);
      ctx.stroke();
      const all = [...waters[i].map((p) => ({ ...p, s: sprW })), ...sets[i].map((p) => ({ ...p, s: sprS }))];
      for (const p of all) ao(t, p.x, p.y, p.r, p.s === sprS ? 0.22 : 0.16);
      for (const p of all) stamp(t, p.s, p.x, p.y);
    }, { bg: ["#F1F8FF", "#DCEEFC"] });
  }

  // ── 과정 화살표 ──
  const sv = S.svgLayer(root, w, h);
  const AY = 70;
  for (const [a, b] of [[B[0] + BRX + 4, B[1] - BRX - 5], [B[1] + BRX + 4, B[2] - BRX - 5]]) S.fatArrow(sv, [[a, AY], [b, AY]], { fill: "#9AA8BA", w0: 3, w1: 5, head: 8.5, hw: 6.5, sw: 1 });

  // ── 라벨 ──
  ["넣은 직후", "녹는 중", "다 녹은 뒤"].forEach((s, i) => S.label(sv, B[i], 20, s, { size: 14, anchor: "middle" }));
  S.label(sv, 4, 59, "용매(물)", { size: 13.5 });
  S.leader(sv, [[56, 54], [74, 60]]);
  S.label(sv, 6, 92, "용질\n(설탕)", { size: 13.5, lh: 16 });
  S.leader(sv, [[35, 87.5], [79, 93]]);
  S.label(sv, 334, 62, "용액\n(설탕물)", { size: 13.5, lh: 16, anchor: "end" });
  S.leader(sv, [[284, 66], [262, 70]]);
  // 원 속 입자 이름
  const near = (list, x, y) => list.reduce((m, p) => (Math.hypot(p.x - x, p.y - y) < Math.hypot(m.x - x, m.y - y) ? p : m), list[0]);
  const wp = near(waters[0], C[0] - 30, 188);
  S.leader(sv, [[24, 236], [wp.x - 0.5, wp.y + 0.8]], { dotR: 1.6 });
  S.label(sv, 6, 250, "물 입자", { size: 13.5 });
  const sp = near(sets[2], C[2] + 24, 196);
  S.leader(sv, [[314, 236], [sp.x + 2, sp.y + 2.5]], { dotR: 2 });
  S.label(sv, 334, 250, "설탕 입자", { size: 13.5, anchor: "end" });
}
