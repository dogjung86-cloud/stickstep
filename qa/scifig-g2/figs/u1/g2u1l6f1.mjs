// g2u1l6f1 순물질과 혼합물: 물과 설탕물, 산소만 모은 병과 공기. 눈으로 보면 똑같이 맑지만 확대하면 입자의 종류가 다르다.
// 두 줄 두 칸: 윗줄 액체, 아랫줄 기체. 순물질 칸(파랑)과 혼합물 칸(주황)의 테두리 색이 다르다. 검산 메모는 g2u1l6f1.md
import { COL, ballSprite, stamp, ao, lens, zoomFill, zoomLines, beaker, pack, inCircle, spread, maxOverlap } from "./_lib.mjs";

export const meta = {
  key: "g2u1l6f1",
  w: 340,
  h: 386,
  alt: "물과 설탕물이 든 두 컵, 산소만 모은 병과 공기가 든 병은 눈으로 보면 똑같이 맑아요. 확대하면 물은 파란 물 입자만, 설탕물은 물 입자 사이에 노란 설탕 입자가 섞여 있어요. 산소 병은 빨간 산소 입자 20개만, 공기는 남색 질소 입자 16개와 산소 입자 4개가 고르게 섞여 있어요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(61);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.012 });

  const PURE = "#3D8BEB", MIX = "#E8890C"; // 순물질 칸 파랑, 혼합물 칸 주황
  const CW = 162, CH = 186;
  const cards = [
    { x: 4, y: 4, kind: "liq", pure: true, name: "물", tag: "(순물질)" },
    { x: 174, y: 4, kind: "liq", pure: false, name: "설탕물", tag: "(혼합물)" },
    { x: 4, y: 196, kind: "gas", pure: true, name: "산소만 모은 병", tag: "(순물질)" },
    { x: 174, y: 196, kind: "gas", pure: false, name: "공기", tag: "(혼합물)" },
  ];
  const RW = 3.1, RS = 7.4, RG = 3.8; // 물, 설탕, 기체 입자 반지름(설탕 지름은 물의 약 2.4배, 기체 입자는 물보다 조금 크게)
  const CR = 41;

  // ── 칸(카드) ──
  for (const c of cards) {
    const col = c.pure ? PURE : MIX;
    P.dropShadow(t, (q) => P.rrect(q, c.x, c.y, CW, CH, 12), { dx: 0, dy: 2, blur: 6, a: 0.1 });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, c.x, c.y, CW, CH, 12);
    ctx.fillStyle = P.lg(ctx, 0, c.y, 0, c.y + CH, [[0, "#FFFFFF"], [1, "#F7F9FB"]]);
    ctx.fill();
    // 머리 띠(옅은 칸 색)
    ctx.clip();
    const hc = P.hex(col);
    ctx.fillStyle = P.lg(ctx, 0, c.y, 0, c.y + 30, [[0, P.css(hc, 0.13)], [1, P.css(hc, 0.02)]]);
    ctx.fillRect(c.x, c.y, CW, 30);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, c.x + 0.8, c.y + 0.8, CW - 1.6, CH - 1.6, 11.2);
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  }

  // ── 겉모습과 확대 원의 자리 ──
  const at = (c) => ({ cx: c.x + CW / 2, oy: c.y + 30, cy: c.y + 139 });
  // 확대 통로(물체보다 먼저)
  for (const c of cards) {
    const { cx, cy } = at(c);
    const sy = c.kind === "liq" ? c.y + 66 : c.y + 63;
    c.spot = { x: cx, y: sy, r: 7 };
    zoomFill(t, c.spot, { x: cx, y: cy, r: CR }, 0.13);
  }
  for (const c of cards) {
    const { cx } = at(c);
    if (c.kind === "liq") {
      // 같은 컵, 같은 물빛: 겉으로는 구별되지 않는다
      beaker(t, { cx, top: c.y + 39, bot: c.y + 82, rx: 23, ry: 4.6, level: c.y + 50, liq: COL.water, liqA: 0.85, spout: null, marks: 0 });
    } else {
      // 집기병 + 유리판 뚜껑
      const top = c.y + 41, bot = c.y + 83, rx = 19;
      beaker(t, { cx, top, bot, rx, ry: 3.8, spout: null, marks: 0 });
      // 유리판(뚜껑): 앞 옆면 + 윗면
      const pr = rx + 6, pry = 4.6, th = 2.4, py = top - 1.2;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, py, pr, pry, 0, 0, Math.PI);
      ctx.lineTo(cx - pr, py - th);
      ctx.ellipse(cx, py - th, pr, pry, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, cx - pr, 0, cx + pr, 0, [[0, "rgba(150,172,198,.75)"], [0.3, "rgba(225,236,247,.9)"], [1, "rgba(160,182,206,.8)"]]);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, py - th, pr, pry, 0, 0, Math.PI * 2);
      ctx.fillStyle = P.lg(ctx, cx - pr, py - th - pry, cx + pr * 0.4, py - th + pry, [[0, "rgba(255,255,255,.85)"], [0.5, "rgba(214,228,242,.55)"], [1, "rgba(190,208,228,.6)"]]);
      ctx.fill();
      ctx.strokeStyle = "rgba(112,132,160,.7)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.95)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.ellipse(cx - 2, py - th - 0.6, pr * 0.62, pry * 0.5, 0, Math.PI * 1.05, Math.PI * 1.55);
      ctx.stroke();
      ctx.restore();
    }
  }
  for (const c of cards) zoomLines(t, c.spot, { x: at(c).cx, y: at(c).cy, r: CR });

  // ── 원 속 입자 ──
  const sprW = ballSprite(t, RW, COL.water, { spec: 0.45, gloss: 26, bounce: "#D0EBFF" });
  const sprS = ballSprite(t, RS, COL.sugar, { spec: 0.5, gloss: 30, bounce: "#FFF3BF", ambient: 0.34 });
  const sprO = ballSprite(t, RG, COL.o2, { spec: 0.5, gloss: 30, bounce: "#FFE3E3" });
  const sprN = ballSprite(t, RG, COL.n2, { spec: 0.5, gloss: 30, bounce: "#DBE4FF", ambient: 0.28 });
  const parts = [];
  for (const c of cards) {
    const { cx, cy } = at(c);
    const box = { x: cx - CR, y: cy - CR, w: 2 * CR, h: 2 * CR };
    let list = [];
    if (c.kind === "liq") {
      const sug = c.pure ? [] : spread({ n: 4, r: RS, seed: 21, box, inside: inCircle(cx, cy, CR - 3), cand: 80 }).map((p) => ({ ...p, s: sprS }));
      const nW = c.pure ? 136 : 120;
      const wat = pack({ n: nW, r: RW, seed: c.pure ? 41 : 43, box, inside: inCircle(cx, cy, CR - 0.6), fixed: sug, gap: 0.3, iters: 520 }).map((p) => ({ ...p, s: sprW }));
      console.warn(`[g2u1l6f1] ${c.name}: 물 ${wat.length}, 설탕 ${sug.length}, 최대 겹침 ${maxOverlap([...wat, ...sug]).toFixed(2)}`);
      list = [...wat, ...sug];
    } else {
      const g = spread({ n: 20, r: RG, seed: c.pure ? 52 : 57, box, inside: inCircle(cx, cy, CR - 2.5), cand: 90 });
      if (c.pure) list = g.map((p) => ({ ...p, s: sprO }));
      else {
        // 20개 가운데 산소 4개를 고르게(네 방향에서 하나씩), 나머지 16개는 질소
        const pick = new Set();
        for (const [ax, ay] of [[-1, -1], [1, -0.6], [-0.7, 1], [0.8, 0.9]]) {
          let best = -1, bd = 1e9;
          g.forEach((p, i) => {
            if (pick.has(i)) return;
            const d = Math.hypot(p.x - (cx + ax * CR * 0.45), p.y - (cy + ay * CR * 0.45));
            if (d < bd) (bd = d), (best = i);
          });
          pick.add(best);
        }
        list = g.map((p, i) => ({ ...p, s: pick.has(i) ? sprO : sprN }));
      }
      console.warn(`[g2u1l6f1] ${c.name}: 입자 ${list.length} (산소 ${list.filter((p) => p.s === sprO).length}, 질소 ${list.filter((p) => p.s === sprN).length})`);
    }
    c.list = list;
    parts.push(list);
    const bg = c.kind === "liq" ? ["#F1F8FF", "#DCEEFC"] : ["#FFFFFF", "#ECF0F5"];
    lens(t, cx, cy, CR, () => {
      for (const p of list) ao(t, p.x, p.y, p.r, c.kind === "liq" ? 0.16 : 0.12);
      for (const p of list) stamp(t, p.s, p.x, p.y);
    }, { bg });
  }

  // ── 라벨 ──
  const sv = S.svgLayer(root, w, h);
  const FONT = "'Pretendard Variable', Pretendard, sans-serif";
  for (const c of cards) {
    const { cx } = at(c);
    const tx = S.el(sv, "text", { x: cx, y: c.y + 21, "text-anchor": "middle", "font-size": 13.5, "font-weight": 800, fill: "#26303D", "letter-spacing": "-0.01em", "font-family": FONT, "paint-order": "stroke", stroke: "#fff", "stroke-width": 3, "stroke-linejoin": "round" });
    S.el(tx, "tspan", {}, c.name);
    S.el(tx, "tspan", { fill: c.pure ? "#1C6FD6" : "#C46A00" }, c.tag);
  }
  // 가운데 띠(두 칸에 함께 걸리는 말)
  const pill = (x, y, text) => {
    const g = S.el(sv, "g");
    const wd = text.length * 12.4 + 14;
    S.el(g, "rect", { x: x - wd / 2, y: y - 11, width: wd, height: 22, rx: 11, fill: "#fff", stroke: "#B7C1CE", "stroke-width": 1 });
    S.el(g, "text", { x, y: y + 4.8, "text-anchor": "middle", "font-size": 13.5, "font-weight": 700, fill: "#4E5968", "font-family": FONT, "letter-spacing": "-0.01em" }, text);
  };
  for (const row of [4, 196]) {
    pill(170, row + 62, "눈으로 보면");
    pill(170, row + 139, "확대하면");
  }
  // 입자 이름(원 아래 귀퉁이)
  const near = (list, x, y) => list.reduce((m, p) => (Math.hypot(p.x - x, p.y - y) < Math.hypot(m.x - x, m.y - y) ? p : m), list[0]);
  const tagAt = (c, sprite, text, side) => {
    const { cx, cy } = at(c);
    const cand = c.list.filter((p) => p.s === sprite);
    const p = near(cand, cx + side * 22, cy + 24);
    const lx = side < 0 ? c.x + 8 : c.x + CW - 8;
    S.leader(sv, [[lx + side * -2 + (side < 0 ? 14 : -14), c.y + CH - 20], [p.x, p.y + p.r * 0.3]], { dotR: p.r > 5 ? 2 : 1.6 });
    S.label(sv, lx, c.y + CH - 7, text, { size: 13.5, anchor: side < 0 ? "start" : "end" });
  };
  tagAt(cards[0], sprW, "물 입자", -1);
  tagAt(cards[1], sprS, "설탕 입자", 1);
  tagAt(cards[2], sprO, "산소 입자", -1);
  tagAt(cards[3], sprN, "질소 입자", 1);
}
