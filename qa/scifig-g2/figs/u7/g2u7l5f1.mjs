// g2u7l5f1 직렬연결과 병렬연결을 물길에 비겨 보기: (가) 직렬, (나) 병렬. 왼쪽은 물길(레슨 3 물길 랩과 같은 펌프, 물레방아, 블록), 오른쪽은 같은 값의 회로.
// 높이 한 칸 = 1 V(펌프가 3칸을 올린다 = 전지 3 V). 물의 흐름 굵기 = 전류 × 26 px/A로 두 칸이 같은 눈금이다.
// 회로도 높이를 전압에 맞춰 그렸다((+)극에 이은 도선이 3칸 높이, (−)극에 이은 도선이 바닥, 직렬의 두 저항 사이 도선이 2칸 높이).
// 검산 메모는 g2u7l5f1.md
import { COL, curArrow, tube, pathD, arrowPoly } from "./_lib.mjs";

export const meta = {
  key: "g2u7l5f1",
  w: 340,
  h: 398,
  alt: "직렬연결은 펌프가 3칸 올린 물이 한 물길로 물레방아 두 개를 차례로 지나며 1칸, 2칸씩 떨어지고 흐름의 굵기가 어디서나 같아요. 병렬연결은 같은 높이의 물이 두 갈래로 나뉘어 각각 3칸을 떨어지고, 두 갈래의 흐름을 더하면 나뉘기 전의 흐름과 같아요. 오른쪽에는 같은 값의 전기 회로가 있어요.",
};

const KA = 26; // 흐름 굵기 px / A
const U = 28; // 높이 한 칸(1 V)

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(55);
  const s = S.svgLayer(root, w, h);

  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  const D = [7, -5]; // 블록 깊이(비스듬히 보이는 윗면과 옆면)

  // ── 그리기 도구 ──
  const concrete = (path, top, bot, region, seed = 0) => {
    ctx.save();
    ctx.beginPath();
    path(ctx);
    ctx.fillStyle = P.lg(ctx, region.x, region.y, region.x + region.w * 0.4, region.y + region.h, [[0, top], [1, bot]]);
    ctx.fill();
    ctx.restore();
    P.shade(t, region, (x, y) => {
      const n = nz.fbm(x * 0.35 + seed, y * 0.35, 3) + nz.n2(x * 1.6, y * 1.6) * 0.35;
      return n > 0 ? [255, 255, 255, n * 0.1] : [40, 46, 56, -n * 0.12];
    }, { mask: path });
  };
  /** 콘크리트 블록: 앞면 [x0,x1]×[yT,yB], 단(한 칸) 줄눈. 오른쪽 면과 윗면이 보인다. */
  const block = (x0, x1, yT, yB, courses) => {
    // 오른쪽 옆면
    const side = (c) => {
      c.moveTo(x1, yT);
      c.lineTo(x1 + D[0], yT + D[1]);
      c.lineTo(x1 + D[0], yB + D[1]);
      c.lineTo(x1, yB);
      c.closePath();
    };
    concrete(side, "#9EA6B2", "#7F8895", { x: x1, y: yT + D[1], w: D[0] + 1, h: yB - yT - D[1] }, 3);
    // 윗면
    const top = (c) => {
      c.moveTo(x0, yT);
      c.lineTo(x0 + D[0], yT + D[1]);
      c.lineTo(x1 + D[0], yT + D[1]);
      c.lineTo(x1, yT);
      c.closePath();
    };
    concrete(top, "#EEF0F3", "#DADEE4", { x: x0, y: yT + D[1], w: x1 - x0 + D[0], h: -D[1] + 1 }, 7);
    // 앞면
    const front = (c) => c.rect(x0, yT, x1 - x0, yB - yT);
    concrete(front, "#D3D8DF", "#B9C0CA", { x: x0, y: yT, w: x1 - x0, h: yB - yT }, 11);
    // 줄눈(가로 = 한 칸, 세로는 엇갈리게)
    ctx.save();
    ctx.strokeStyle = "rgba(92,100,114,.55)";
    ctx.lineWidth = 0.8;
    for (let i = 1; i < courses; i++) {
      const y = yB - i * U;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.lineTo(x1 + D[0], y + D[1]);
      ctx.stroke();
    }
    for (let i = 0; i < courses; i++) {
      const ya = yB - (i + 1) * U, yb = yB - i * U;
      const off = i % 2 ? 13 : 0;
      for (let x = x0 + 26 + off; x < x1 - 6; x += 26) {
        ctx.beginPath();
        ctx.moveTo(x, ya + 0.6);
        ctx.lineTo(x, yb - 0.6);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x0, yT + 0.5);
    ctx.lineTo(x1, yT + 0.5);
    ctx.stroke();
    ctx.strokeStyle = "rgba(60,66,78,.45)";
    ctx.lineWidth = 0.9;
    ctx.strokeRect(x0 + 0.45, yT + 0.45, x1 - x0 - 0.9, yB - yT - 0.9);
    ctx.restore();
  };
  /** 물줄기(가운데 선 pts, 굵기 wd): 짙은 가장자리 + 파란 몸 + 왼쪽 위 빛줄 */
  const water = (pts, wd) => {
    tube(ctx, pts, { w: wd + 1.2, edge: "#1F6FB8", base: "#4AA3EE", hi: "rgba(225,244,255,.85)", hiW: Math.max(0.6, wd * 0.22), cap: "butt" });
  };
  const flowHead = (x, y, dir, wd) => {
    // dir: [ux, uy]. 흐름 물줄기 위에 얹는 화살촉(굵기에 맞춘다)
    const b = Math.max(9, wd + 7), L = b * 0.85 + 1;
    const [ux, uy] = dir;
    const nx = -uy, ny = ux;
    const tip = [x + ux * L * 0.5, y + uy * L * 0.5];
    const bl = [x - ux * L * 0.5 + nx * b * 0.5, y - uy * L * 0.5 + ny * b * 0.5];
    const br = [x - ux * L * 0.5 - nx * b * 0.5, y - uy * L * 0.5 - ny * b * 0.5];
    S.el(s, "path", { d: pathD([bl, tip, br], true), fill: "#1864AB", stroke: "#fff", "stroke-width": 1.2, "stroke-linejoin": "round" });
  };
  const wheel = (cx, cy, r, ang = 0.2) => {
    // 나무 물레방아(옆에서 본 모습): 안팎 두 테 사이의 물받이 판 12개 + 살 6개 + 굴대
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = "butt";
    // 두 테 사이(옆판): 옅은 나무색, 벽에 옅은 그림자
    ctx.save();
    ctx.shadowColor = "rgba(28,42,68,.28)";
    ctx.shadowBlur = 3.5 * t.dpr;
    ctx.shadowOffsetX = 1.4 * t.dpr;
    ctx.shadowOffsetY = 2.2 * t.dpr;
    ctx.fillStyle = P.lg(ctx, -r, -r, r, r, [[0, "#F6DDAE"], [1, "#C49656"]]);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
    // 물받이 판(테 사이를 잇는 판의 옆선)
    for (let i = 0; i < 12; i++) {
      const a = ang + (i / 12) * Math.PI * 2;
      const c0 = [Math.cos(a), Math.sin(a)];
      ctx.strokeStyle = "#7A5222";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(c0[0] * r * 0.6, c0[1] * r * 0.6);
      ctx.lineTo(c0[0] * r * 1.0, c0[1] * r * 1.0);
      ctx.stroke();
    }
    // 테 둘
    for (const [rr, lw] of [[r, 1.6], [r * 0.6, 1.4]]) {
      ctx.strokeStyle = "#7A5222";
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.arc(0, 0, rr, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 살 6개
    ctx.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      const a = ang + 0.26 + (i / 6) * Math.PI * 2;
      ctx.strokeStyle = "#8C5E26";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 2.4, Math.sin(a) * 2.4);
      ctx.lineTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
      ctx.stroke();
    }
    // 빛: 왼쪽 위 테에 얇은 빛줄
    ctx.strokeStyle = "rgba(255,246,226,.8)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, r - 0.8, Math.PI * 1.05, Math.PI * 1.55);
    ctx.stroke();
    ctx.fillStyle = P.rg(ctx, -1, -1, 0.3, 0, 0, 3.4, [[0, "#F8F9FA"], [1, "#6C757D"]]);
    ctx.beginPath();
    ctx.arc(0, 0, 2.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  /** 물이 떨어져 닿는 곳의 물보라 */
  const splash = (x, y, wd) => {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.85)";
    for (const [dx, dy, r] of [[0, 0, 1], [-0.9, 0.2, 0.6], [0.9, 0.25, 0.65], [-0.4, -0.5, 0.45], [0.5, -0.45, 0.4]]) {
      ctx.beginPath();
      ctx.ellipse(x + dx * (wd / 2 + 2.5), y + dy * 2.4, (wd / 2 + 1.4) * r, 1.8 * r + 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  const pump = (px, yTop, yBot) => {
    // 관(회색 금속): 바닥 물길에서 위 물길 높이까지
    const pts = [[px, yBot + 2], [px, yTop + 2]];
    tube(ctx, pts, { w: 8, edge: "#4D5562", base: "#A9B2BE", hi: "rgba(255,255,255,.85)", cap: "butt" });
    // 펌프 몸통(빨간 원통)
    const bx = px - 10, by = yTop - 22, bw = 20, bh = 20;
    P.dropShadow(t, (c) => P.rrect(c, bx, by, bw, bh, 4), { dx: 1.5, dy: 2.5, blur: 4, a: 0.28 });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, bx, by, bw, bh, 4);
    ctx.fillStyle = P.lg(ctx, bx, 0, bx + bw, 0, [[0, "#FF9A86"], [0.3, "#E0503A"], [0.8, "#B33A27"], [1, "#82261A"]]);
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.fillRect(bx + 3.5, by + 2, 2, bh - 4);
    ctx.restore();
    // 뚜껑
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(px, by + 0.5, bw / 2, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, bx, 0, bx + bw, 0, [[0, "#FFC2B6"], [1, "#C2412C"]]);
    ctx.fill();
    ctx.restore();
  };
  /** 높이 차 표시(세로 치수선, 가운데에 값) */
  const dim = (x, ya, yb, text) => {
    S.el(s, "line", { x1: x, y1: ya + 1, x2: x, y2: yb - 1, stroke: "#495057", "stroke-width": 1.1 });
    for (const [y, d] of [[ya, 1], [yb, -1]]) {
      S.el(s, "path", { d: `M${x - 3.2} ${y + d * 5} L${x} ${y} L${x + 3.2} ${y + d * 5}`, fill: "none", stroke: "#495057", "stroke-width": 1.1, "stroke-linejoin": "round" });
      S.el(s, "line", { x1: x - 4.5, y1: y, x2: x + 4.5, y2: y, stroke: "#495057", "stroke-width": 1 });
    }
    S.label(s, x, (ya + yb) / 2 + 5, text, { size: 13.5, anchor: "middle", color: "#343A40", weight: 800 });
  };
  const ground = (x0, x1, yG) => {
    // 바닥 물길(블록 앞, 바닥 높이): 얕은 콘크리트 도랑
    const path = (c) => {
      c.rect(x0, yG - 2, x1 - x0, 9);
    };
    concrete(path, "#C9CFD7", "#AAB2BD", { x: x0, y: yG - 2, w: x1 - x0, h: 9 }, 19);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillRect(x0, yG + 6.2, x1 - x0, 0.8);
    ctx.strokeStyle = "rgba(60,66,78,.4)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x0 + 0.4, yG - 1.6, x1 - x0 - 0.8, 8.2);
    ctx.restore();
  };

  // ── 회로 도구(높이 = 전압) ──
  const WIRE = { hi: "#E8604A", mid: "#9C6ADE", lo: "#3D86E0" };
  const wire = (pts, col) => tube(ctx, pts, { w: 3.4, edge: "rgba(30,36,46,.65)", base: col, hi: "rgba(255,255,255,.55)" });
  const resistor = (x, y, vert, ohm) => {
    const L = 24, Wd = 11;
    ctx.save();
    ctx.translate(x, y);
    if (vert) ctx.rotate(Math.PI / 2);
    P.dropShadow(t, (c) => P.rrect(c, -L / 2, -Wd / 2, L, Wd, 5), { dx: 1, dy: 2, blur: 3, a: 0.2 });
    ctx.beginPath();
    P.rrect(ctx, -L / 2, -Wd / 2, L, Wd, 5);
    ctx.fillStyle = P.lg(ctx, 0, -Wd / 2, 0, Wd / 2, [[0, "#F6E7C6"], [0.5, "#DDBF86"], [1, "#A8884F"]]);
    ctx.fill();
    ctx.strokeStyle = "#6B5228";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#8A4B2A";
    for (const dx of [-6, 0, 6]) ctx.fillRect(dx - 1.3, -Wd / 2 + 1, 2.6, Wd - 2);
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fillRect(-L / 2 + 4, -Wd / 2 + 2, L - 8, 1.2);
    ctx.restore();
  };
  const battery = (x, yc) => {
    // 세운 마른 전지((+)극이 위)
    const bw = 15, bh = 34;
    P.dropShadow(t, (c) => P.rrect(c, x - bw / 2, yc - bh / 2, bw, bh, 3), { dx: 1.5, dy: 2.5, blur: 4, a: 0.25 });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, x - bw / 2, yc - bh / 2, bw, bh, 3);
    ctx.fillStyle = P.lg(ctx, x - bw / 2, 0, x + bw / 2, 0, [[0, "#6B7280"], [0.25, "#2B2F36"], [0.7, "#16191D"], [1, "#0B0D10"]]);
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = P.lg(ctx, x - bw / 2, 0, x + bw / 2, 0, [[0, "#FFE59A"], [0.3, "#E2B84A"], [0.75, "#B88A25"], [1, "#7A5A12"]]);
    ctx.fillRect(x - bw / 2, yc - bh / 2, bw, bh * 0.36);
    ctx.fillStyle = "rgba(255,255,255,.3)";
    ctx.fillRect(x - bw / 2 + 2.5, yc - bh / 2 + 1, 1.8, bh - 2);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, x - 3.5, yc - bh / 2 - 4, 7, 5, 1.5);
    ctx.fillStyle = P.lg(ctx, x - 3.5, 0, x + 3.5, 0, [[0, "#F1F3F5"], [1, "#868E96"]]);
    ctx.fill();
    ctx.restore();
  };

  // ── 판 두 개 ──
  const ROWS = [
    { y0: 0, kind: "series", tag: "(가)", title: "직렬연결" },
    { y0: 172, kind: "parallel", tag: "(나)", title: "병렬연결" },
  ];
  const info = [];
  const AMP = "#1864AB", CUR = "#8A5A00";
  const val = (x, y, text, o = {}) => S.label(s, x, y, text, { size: 13.5, weight: 800, ...o });
  for (const row of ROWS) {
    const y0 = row.y0;
    const L3 = y0 + 58, L2 = L3 + U, L1 = L2 + U, L0 = L1 + U; // 바닥이 L0
    const PX = 31; // 펌프 관
    const XA = 98, XB = 150; // 두 물줄기가 떨어지는 자리(두 칸이 같다)
    S.tag(s, 22, y0 + 14, row.tag);
    S.label(s, 40, y0 + 19, row.title, { size: 14 });
    ctx.save();
    ctx.fillStyle = P.lg(ctx, 0, L0 + 7, 0, L0 + 14, [[0, "rgba(70,80,96,.16)"], [1, "rgba(70,80,96,0)"]]);
    ctx.fillRect(8, L0 + 7, 170, 7);
    ctx.restore();

    if (row.kind === "series") {
      const I = 0.1, tw = I * KA;
      block(38, XA, L3, L0, 3);
      block(XA, XB, L2, L0, 2);
      ground(16, XB + 16, L0);
      pump(PX, L3, L0);
      const fA = XA + tw / 2 + 0.6, fB = XB + tw / 2 + 0.6;
      const wA = [XA - 6, (L3 + L2) / 2], wB = [XB - 6, (L2 + L0) / 2];
      wheel(wA[0], wA[1], 12, 0.3);
      wheel(wB[0], wB[1], 12, 0.1);
      water([[PX + 8, L3 - tw / 2], [fA, L3 - tw / 2], [fA, L2 - tw / 2], [fB, L2 - tw / 2], [fB, L0 + 1 - tw / 2], [PX + 3, L0 + 1 - tw / 2]], tw);
      splash(fA, L2 - tw / 2, tw);
      splash(fB, L0 + 1 - tw / 2, tw);
      flowHead(66, L3 - tw / 2, [1, 0], tw);
      flowHead(137, L2 - tw / 2, [1, 0], tw);
      flowHead(84, L0 + 1 - tw / 2, [-1, 0], tw);
      flowHead(PX, (L3 + L0) / 2 + 6, [0, -1], 4);
      dim(13, L3, L0, "3 V");
      dim(119, L3, L2, "1 V");
      dim(166, L2, L0, "2 V");
      val(wA[0] - 15, wA[1] + 5, "10 Ω", { anchor: "end" });
      val(wB[0] - 15, wB[1] + 5, "20 Ω", { anchor: "end" });
      val(68, L3 - 8, "0.1 A", { anchor: "middle", color: AMP });
      val(92, L0 + 23, "0.1 A", { anchor: "middle", color: AMP });
      info.push({ row: "series", tw });
    } else {
      const IA = 0.3, IB = 0.15, IT = IA + IB;
      const tA = IA * KA, tB = IB * KA, tT = IT * KA;
      block(38, XA, L3, L0, 3);
      // 물길 다리(블록 끝에서 B 물줄기까지, 3칸 높이)와 받침 기둥
      const pier = (c) => c.rect(XB - 7, L3 + 4, 5, L0 - L3 - 4);
      concrete(pier, "#C3C9D2", "#A5ADB8", { x: XB - 7, y: L3 + 4, w: 5, h: L0 - L3 - 4 }, 31);
      const deck = (c) => c.rect(XA, L3, XB - XA, 4);
      concrete(deck, "#D7DCE2", "#A9B1BC", { x: XA, y: L3, w: XB - XA, h: 4 }, 37);
      ctx.save();
      ctx.fillStyle = "#EEF0F3";
      ctx.beginPath();
      ctx.moveTo(XA, L3);
      ctx.lineTo(XA + D[0], L3 + D[1]);
      ctx.lineTo(XB + D[0], L3 + D[1]);
      ctx.lineTo(XB, L3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ground(16, XB + 16, L0);
      pump(PX, L3, L0);
      const fA = XA + 1 + tA / 2, fB = XB + tB / 2 + 0.6;
      const wA = [XA - 6, (L3 + L0) / 2], wB = [XB - 6, (L3 + L0) / 2];
      wheel(wA[0], wA[1], 12, 0.25);
      wheel(wB[0], wB[1], 12, 0.05);
      // 나뉘기 전(0.45 A) → 아래층 0.3 A는 블록 끝에서 떨어지고, 위층 0.15 A는 다리를 건너 B에서 떨어진다 → 바닥에서 합쳐 펌프로
      water([[PX + 8, L3 - tT / 2], [XA + 0.5, L3 - tT / 2]], tT);
      water([[XA, L3 - tA / 2], [fA, L3 - tA / 2], [fA, L0 + 1 - tA / 2]], tA);
      water([[XA, L3 - tT + tB / 2], [XA + 8, L3 - tT + tB / 2], [XA + 20, L3 - tB / 2], [fB, L3 - tB / 2], [fB, L0 + 1 - tB / 2], [fA + tA / 2 - 0.5, L0 + 1 - tB / 2]], tB);
      water([[fA + tA / 2, L0 + 1 - tT / 2], [PX + 3, L0 + 1 - tT / 2]], tT);
      splash(fA, L0 + 1 - tA * 0.8, tA);
      splash(fB, L0 + 1 - tB * 0.8, tB);
      flowHead(64, L3 - tT / 2, [1, 0], tT);
      flowHead(128, L3 - tB / 2, [1, 0], tB);
      flowHead(66, L0 + 1 - tT / 2, [-1, 0], tT);
      flowHead(PX, (L3 + L0) / 2 + 6, [0, -1], 4);
      dim(13, L3, L0, "3 V");
      // 갈래 A의 높이 차: 값은 아래쪽에(물레방아 B 이름과 겹치지 않게)
      S.el(s, "line", { x1: 119, y1: L3 + 5, x2: 119, y2: L0 - 1, stroke: "#495057", "stroke-width": 1.1 });
      for (const [y, d] of [[L3 + 4, 1], [L0, -1]]) {
        S.el(s, "path", { d: `M${115.8} ${y + d * 5} L119 ${y} L${122.2} ${y + d * 5}`, fill: "none", stroke: "#495057", "stroke-width": 1.1, "stroke-linejoin": "round" });
      }
      val(119, L0 - 13, "3 V", { anchor: "middle", color: "#343A40" });
      dim(166, L3, L0, "3 V");
      val(wA[0] - 15, wA[1] + 5, "10 Ω", { anchor: "end" });
      val(XB - 1, L2 - 2, "20 Ω", { anchor: "end" });
      val(66, L3 - 15, "0.45 A", { anchor: "middle", color: AMP });
      val(XA - 3, L3 + 20, "0.3 A", { anchor: "end", color: AMP });
      val(124, L3 - 9, "0.15 A", { anchor: "middle", color: AMP });
      val(66, L0 + 25, "0.45 A", { anchor: "middle", color: AMP });
      info.push({ row: "parallel", tA, tB, tT });
    }

    // ── 회로(오른쪽): 높이 = 전압 ──
    const bxC = 192, rA = 240, rB = 294;
    const yH = L3, yL = L0, yM = L2;
    const yBat = (yH + yL) / 2;
    if (row.kind === "series") {
      wire([[bxC, yBat - 20], [bxC, yH], [rA, yH], [rA, (yH + yM) / 2]], WIRE.hi);
      wire([[rA, (yH + yM) / 2], [rA, yM], [rB, yM], [rB, (yM + yL) / 2]], WIRE.mid);
      wire([[rB, (yM + yL) / 2], [rB, yL], [bxC, yL], [bxC, yBat + 20]], WIRE.lo);
      resistor(rA, (yH + yM) / 2, true);
      resistor(rB, (yM + yL) / 2, true);
      battery(bxC, yBat);
      curArrow(S, s, [[bxC + 9, yH], [bxC + 31, yH]], { w: 3, head: 7, hw: 4.8 });
      curArrow(S, s, [[rA + 9, yM], [rA + 31, yM]], { w: 3, head: 7, hw: 4.8 });
      curArrow(S, s, [[rB - 12, yL], [rB - 34, yL]], { w: 3, head: 7, hw: 4.8 });
      val(rA + 9, (yH + yM) / 2 + 5, "10 Ω");
      val(rA - 8, (yH + yM) / 2 + 5, "1 V", { anchor: "end" });
      val(rB + 9, (yM + yL) / 2 + 5, "20 Ω");
      val(rB - 8, (yM + yL) / 2 + 5, "2 V", { anchor: "end" });
      val(bxC + 11, yBat + 5, "3 V");
      val(rB - 23, yL + 17, "0.1 A", { anchor: "middle", color: CUR });
    } else {
      const yR = yBat;
      wire([[bxC, yBat - 20], [bxC, yH], [rB, yH], [rB, yR]], WIRE.hi);
      wire([[rA, yH], [rA, yR]], WIRE.hi);
      wire([[rB, yR], [rB, yL], [bxC, yL], [bxC, yBat + 20]], WIRE.lo);
      wire([[rA, yR], [rA, yL]], WIRE.lo);
      resistor(rA, yR, true);
      resistor(rB, yR, true);
      battery(bxC, yBat);
      curArrow(S, s, [[bxC + 9, yH], [bxC + 31, yH]], { w: 3, head: 7, hw: 4.8 });
      curArrow(S, s, [[rA, yH + 4], [rA, yH + 24]], { w: 3, head: 7, hw: 4.8 });
      curArrow(S, s, [[rB, yH + 4], [rB, yH + 24]], { w: 3, head: 7, hw: 4.8 });
      val(rA + 9, yR + 5, "10 Ω");
      val(rB + 9, yR + 5, "20 Ω");
      val(rA + 9, yR + 21, "3 V");
      val(rB + 9, yR + 21, "3 V");
      val(bxC + 11, yBat + 5, "3 V");
      val(bxC + 22, yH - 8, "0.45 A", { anchor: "middle", color: CUR });
      val(rA - 7, yH + 22, "0.3 A", { anchor: "end", color: CUR });
      val(rB - 7, yH + 22, "0.15 A", { anchor: "end", color: CUR });
    }
  }

  // ── 짝 띠 ──
  const by = h - 50;
  const pairs = [["펌프", "전지"], ["높이 차", "전압"], ["물의 흐름", "전류"], ["물레방아", "저항"]];
  ctx.save();
  ctx.beginPath();
  P.rrect(ctx, 8, by - 4, w - 16, 52, 10);
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.fill();
  ctx.strokeStyle = "rgba(120,132,150,.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
  pairs.forEach(([a, b], i) => {
    const cx = i % 2 ? 254 : 86, cy = by + 13 + Math.floor(i / 2) * 22;
    S.label(s, cx - 10, cy + 5, a, { size: 13.5, anchor: "end", color: "#1864AB", weight: 800 });
    S.el(s, "path", { d: `M${cx - 6} ${cy} L${cx + 6} ${cy} M${cx - 3} ${cy - 3} L${cx - 6} ${cy} L${cx - 3} ${cy + 3} M${cx + 3} ${cy - 3} L${cx + 6} ${cy} L${cx + 3} ${cy + 3}`, fill: "none", stroke: "#495057", "stroke-width": 1.3, "stroke-linecap": "round", "stroke-linejoin": "round" });
    S.label(s, cx + 10, cy + 5, b, { size: 13.5, color: "#8A5A00", weight: 800 });
  });
  window.__l5 = info;
}
