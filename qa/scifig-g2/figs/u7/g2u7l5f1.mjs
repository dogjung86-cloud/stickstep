// g2u7l5f1 직렬연결과 병렬연결을 물의 흐름에 비겨 보기: (가) 직렬, (나) 병렬. 왼쪽은 물 모형, 오른쪽은 같은 값의 회로.
// 물 모형: 투명한 물통을 높이를 달리해 놓는다(위 물통 수면 L3, 아래 물통 수면 L0. 직렬은 가운데 물통 수면 L2가 하나 더 있다).
// 아래 물통 속 파란 펌프가 하늘색 관으로 물을 위 물통에 올리고(전지), 물은 물레방아(저항)를 돌리며 떨어져 아래 물통으로 돌아온다.
// 높이 한 칸 = 1 V(펌프가 3칸을 올린다 = 전지 3 V). 물이 흐르는 관과 물줄기의 굵기 = 전류 × 26 px/A로 두 칸이 같은 눈금이다.
// 회로도 높이를 전압에 맞춰 그렸다((+)극에 이은 도선이 3칸 높이, (−)극에 이은 도선이 바닥, 직렬의 두 저항 사이 도선이 2칸 높이).
// 색과 모양의 약속(물길 랩도 따른다)은 검산 메모 g2u7l5f1.md 「모양과 색」.
import { COL, curArrow, tube, pathD } from "./_lib.mjs";

export const meta = {
  key: "g2u7l5f1",
  w: 340,
  h: 404,
  alt: "직렬연결은 아래 물통 속 펌프가 위 물통으로 3칸 올린 물이 한 갈래로 물레방아 두 개를 차례로 돌며 가운데 물통까지 1칸, 아래 물통까지 2칸을 떨어지고, 물줄기의 굵기가 어디서나 같아요. 병렬연결은 위 물통의 물이 두 갈래로 나뉘어 각각 물레방아를 돌며 3칸을 떨어지고, 두 갈래의 물을 더하면 펌프가 올린 물과 같아요. 오른쪽에는 같은 값의 전기 회로가 있어요.",
};

const KA = 26; // 흐름 굵기 px / A
const U = 28; // 높이 한 칸(1 V)

// 모양과 색(검산 메모와 같은 값)
const GLASS = { edge: "#8FB0CC", fill: "rgba(226,240,250,.55)", hi: "rgba(255,255,255,.9)" };
const WATER = { top: "#BFE6FB", bot: "#7CC2EC", line: "#3D9BEA" };
const PIPE = { edge: "#2B78BE", base: "#6CC0F4", hi: "rgba(236,248,255,.9)" }; // 물이 흐르는 하늘색 관과 물줄기
const PUMP = { light: "#8DB6F5", mid: "#2F6FDE", dark: "#1E4FA8", ink: "#173E85" };
const WHEEL = { ring: "#FFD43B", ringDark: "#E0A800", spoke: "#B07A00", hub: "#6C757D" };

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(55);
  const s = S.svgLayer(root, w, h);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 그리기 도구 ──
  /** 위가 열린 투명 물통: 안쪽 [x0,x1], 바닥 yB, 수면 yW, 벽 윗끝 yT */
  const tank = (x0, x1, yT, yW, yB) => {
    ctx.save();
    // 뒤 유리
    ctx.fillStyle = GLASS.fill;
    ctx.fillRect(x0, yT, x1 - x0, yB - yT);
    // 물
    ctx.fillStyle = P.lg(ctx, 0, yW, 0, yB, [[0, WATER.top], [1, WATER.bot]]);
    ctx.fillRect(x0, yW, x1 - x0, yB - yW);
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fillRect(x0, yW + 0.8, x1 - x0, 1.2);
    ctx.strokeStyle = WATER.line;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(x0, yW);
    ctx.lineTo(x1, yW);
    ctx.stroke();
    // 유리 벽(왼쪽, 오른쪽, 바닥): 두께 3
    ctx.fillStyle = "rgba(205,222,238,.95)";
    ctx.fillRect(x0 - 3, yT, 3, yB - yT + 3);
    ctx.fillRect(x1, yT, 3, yB - yT + 3);
    ctx.fillRect(x0 - 3, yB, x1 - x0 + 6, 3);
    ctx.strokeStyle = GLASS.edge;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(x0 - 3, yT);
    ctx.lineTo(x0 - 3, yB + 3);
    ctx.lineTo(x1 + 3, yB + 3);
    ctx.lineTo(x1 + 3, yT);
    ctx.moveTo(x0, yT);
    ctx.lineTo(x0, yB);
    ctx.lineTo(x1, yB);
    ctx.lineTo(x1, yT);
    ctx.stroke();
    // 벽 윗끝과 빛줄
    ctx.fillStyle = GLASS.edge;
    ctx.fillRect(x0 - 3, yT - 0.6, 3, 1.2);
    ctx.fillRect(x1, yT - 0.6, 3, 1.2);
    ctx.strokeStyle = GLASS.hi;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(x0 - 1.5, yT + 2);
    ctx.lineTo(x0 - 1.5, yB - 1);
    ctx.stroke();
    ctx.restore();
    P.softShadow(t, (x0 + x1) / 2 + 2, yB + 5, (x1 - x0) * 0.55, 2.4, 0.14);
  };
  /** 물이 흐르는 관과 물줄기(굵기 = 전류) */
  const flow = (pts, wd, cap = "butt") => tube(ctx, pts, { w: wd + 1.6, edge: PIPE.edge, base: PIPE.base, hi: PIPE.hi, hiW: Math.max(0.6, wd * 0.24), cap });
  const flowHead = (x, y, dir, wd) => {
    const b = Math.max(9, wd + 7), L = b * 0.85 + 1;
    const [ux, uy] = dir;
    const nx = -uy, ny = ux;
    const tip = [x + ux * L * 0.5, y + uy * L * 0.5];
    const bl = [x - ux * L * 0.5 + nx * b * 0.5, y - uy * L * 0.5 + ny * b * 0.5];
    const br = [x - ux * L * 0.5 - nx * b * 0.5, y - uy * L * 0.5 - ny * b * 0.5];
    S.el(s, "path", { d: pathD([bl, tip, br], true), fill: "#1864AB", stroke: "#fff", "stroke-width": 1.2, "stroke-linejoin": "round" });
  };
  /** 물이 떨어져 닿는 곳의 물보라 */
  const splash = (x, y, wd) => {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.9)";
    for (const [dx, dy, r] of [[0, 0, 1], [-0.9, 0.2, 0.6], [0.9, 0.25, 0.65], [-0.4, -0.5, 0.45], [0.5, -0.45, 0.4]]) {
      ctx.beginPath();
      ctx.ellipse(x + dx * (wd / 2 + 2.5), y + dy * 2.4, (wd / 2 + 1.4) * r, 1.8 * r + 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  /** 노란 물레방아(옆에서 본 모습): 안팎 두 테 사이 물받이 판 12개, 살 6개, 굴대 */
  const wheel = (cx, cy, r, ang = 0.2) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.save();
    ctx.shadowColor = "rgba(28,42,68,.26)";
    ctx.shadowBlur = 3.2 * t.dpr;
    ctx.shadowOffsetX = 1.3 * t.dpr;
    ctx.shadowOffsetY = 2 * t.dpr;
    ctx.fillStyle = P.lg(ctx, -r, -r, r, r, [[0, "#FFF1B8"], [0.5, WHEEL.ring], [1, WHEEL.ringDark]]);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
    ctx.lineCap = "butt";
    for (let i = 0; i < 12; i++) {
      const a = ang + (i / 12) * Math.PI * 2;
      ctx.strokeStyle = WHEEL.spoke;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.stroke();
    }
    for (const [rr, lw] of [[r, 1.5], [r * 0.6, 1.3]]) {
      ctx.strokeStyle = WHEEL.spoke;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.arc(0, 0, rr, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      const a = ang + 0.26 + (i / 6) * Math.PI * 2;
      ctx.strokeStyle = WHEEL.spoke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 2.4, Math.sin(a) * 2.4);
      ctx.lineTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, r - 0.8, Math.PI * 1.05, Math.PI * 1.55);
    ctx.stroke();
    ctx.fillStyle = P.rg(ctx, -1, -1, 0.3, 0, 0, 3.4, [[0, "#F8F9FA"], [1, WHEEL.hub]]);
    ctx.beginPath();
    ctx.arc(0, 0, 2.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  /** 파란 펌프(아래 물통 바닥에 잠긴 몸통 + 위 뚜껑) */
  const pump = (cx, yBot) => {
    const bw = 18, bh = 15, x0 = cx - bw / 2, y0 = yBot - bh;
    P.dropShadow(t, (c) => P.rrect(c, x0, y0, bw, bh, 4), { dx: 1.2, dy: 2, blur: 3.5, a: 0.25 });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, x0, y0, bw, bh, 4);
    ctx.fillStyle = P.lg(ctx, x0, 0, x0 + bw, 0, [[0, PUMP.light], [0.35, PUMP.mid], [1, PUMP.dark]]);
    ctx.fill();
    ctx.strokeStyle = PUMP.ink;
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.fillRect(x0 + 3, y0 + 2, 2, bh - 4);
    // 물을 빨아들이는 틈
    ctx.fillStyle = "rgba(14,38,90,.55)";
    for (let k = 0; k < 3; k++) ctx.fillRect(x0 + 6 + k * 3.6, y0 + bh - 5, 1.8, 3.2);
    ctx.restore();
  };
  /** 세로 치수선(높이 차 = 전압) */
  const dim = (x, ya, yb, text, o = {}) => {
    S.el(s, "line", { x1: x, y1: ya + 1, x2: x, y2: yb - 1, stroke: "#495057", "stroke-width": 1.1 });
    for (const [y, d] of [[ya, 1], [yb, -1]]) {
      S.el(s, "path", { d: `M${x - 3.2} ${y + d * 5} L${x} ${y} L${x + 3.2} ${y + d * 5}`, fill: "none", stroke: "#495057", "stroke-width": 1.1, "stroke-linejoin": "round" });
      S.el(s, "line", { x1: x - 4.5, y1: y, x2: x + 4.5, y2: y, stroke: "#495057", "stroke-width": 1 });
    }
    if (text) S.label(s, o.lx ?? x + 6, o.ly ?? (ya + yb) / 2 + 5, text, { size: 13.5, anchor: o.anchor ?? "start", color: "#343A40", weight: 800 });
  };
  const guide = (x0, x1, y) => S.el(s, "line", { x1: x0, y1: y, x2: x1, y2: y, stroke: "#7C8796", "stroke-width": 0.9, "stroke-dasharray": "2.5 2.5" });

  // ── 회로 도구(높이 = 전압) ──
  const WIRE = { hi: "#E8604A", mid: "#9C6ADE", lo: "#3D86E0" };
  const wire = (pts, col) => tube(ctx, pts, { w: 3.4, edge: "rgba(30,36,46,.65)", base: col, hi: "rgba(255,255,255,.55)" });
  const resistor = (x, y, vert) => {
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
    { y0: 174, kind: "parallel", tag: "(나)", title: "병렬연결" },
  ];
  const AMP = "#1864AB", CUR = "#8A5A00";
  const val = (x, y, text, o = {}) => S.label(s, x, y, text, { size: 13.5, weight: 800, ...o });
  const info = [];
  for (const row of ROWS) {
    const y0 = row.y0;
    const L3 = y0 + 58, L2 = L3 + U, L1 = L2 + U, L0 = L1 + U; // 수면 높이(위 물통 L3, 아래 물통 L0)
    const PX = 32; // 펌프와 올리는 관
    const T0 = [20, 166]; // 아래 물통 안쪽 가로
    const B0 = L0 + 16; // 아래 물통 바닥
    S.tag(s, 22, y0 + 14, row.tag);
    S.label(s, 40, y0 + 19, row.title, { size: 14 });

    if (row.kind === "series") {
      const I = 0.1, tw = I * KA;
      const T3 = [46, 86], T2 = [98, 140]; // 위 물통, 가운데 물통
      const XA = 108, XB = 158; // 물이 떨어지는 자리
      tank(T0[0], T0[1], L0 - 10, L0, B0);
      tank(T3[0], T3[1], L3 - 18, L3, L3 + 8);
      tank(T2[0], T2[1], L2 - 4, L2, L2 + 10);
      // 올리는 관: 펌프 → 위 물통 위에서 쏟아짐(굵기는 물줄기와 같은 0.1 A. 직렬은 어디서나 같은 굵기)
      const riseTop = L3 - 26;
      flow([[PX, L0 + 2], [PX, riseTop], [T3[0] + 10, riseTop], [T3[0] + 10, L3 - 8]], tw);
      pump(PX, B0 - 1);
      // 물통 수면에서 넘쳐 나가는 물길과 떨어지는 물줄기(굵기 = 0.1 A로 어디서나 같다)
      flow([[T3[1] + 2, L3 - tw / 2], [XA, L3 - tw / 2], [XA, L2 + 1]], tw);
      flow([[T2[1] + 2, L2 - tw / 2], [XB, L2 - tw / 2], [XB, L0 + 1]], tw);
      splash(XA, L2 + 0.5, tw);
      splash(XB, L0 + 0.5, tw);
      const wA = [XA - 7, L3 + 14], wB = [XB - 8, L2 + 28];
      wheel(wA[0], wA[1], 10, 0.3);
      wheel(wB[0], wB[1], 10, 0.1);
      flowHead(PX, (riseTop + L0) / 2 + 8, [0, -1], tw);
      flowHead(T3[1] + 11, L3 - tw / 2, [1, 0], tw);
      flowHead(T2[1] + 10, L2 - tw / 2, [1, 0], tw);
      // 높이 차(물통 수면 사이)
      guide(T3[1] + 3, 128, L3);
      guide(XB, 176, L2);
      guide(T0[1] + 3, 176, L0);
      guide(8, row.kind === "series" ? 43 : 45, L3);
      guide(8, T0[0] - 3, L0);
      dim(8, L3, L0, "3 V", { lx: 2 });
      dim(124, L3, L2, "1 V", { lx: 124, anchor: "middle" });
      dim(172, L2, L0, "2 V", { lx: 172, anchor: "middle" });
      val(wA[0] - 12, wA[1] + 10, "10 Ω", { anchor: "end" });
      val(wB[0] - 13, wB[1] + 5, "20 Ω", { anchor: "end" });
      val(PX + 7, L3 + 50, "0.1 A", { color: AMP });
      val(XB - 13, L0 - 2, "0.1 A", { anchor: "end", color: AMP });
      info.push({ row: "series", tw });
    } else {
      const IA = 0.3, IB = 0.15, IT = IA + IB;
      const tA = IA * KA, tB = IB * KA, tT = IT * KA;
      const T3 = [48, 88];
      const XA = 114, XB = 160;
      const oA = L3 + 11, oB = L3 + 3; // 위 물통 옆구리의 두 나가는 관(수면 아래)
      tank(T0[0], T0[1], L0 - 10, L0, B0);
      tank(T3[0], T3[1], L3 - 14, L3, L3 + 18);
      const riseTop = L3 - 24;
      flow([[PX, L0 + 2], [PX, riseTop], [T3[0] + 11, riseTop], [T3[0] + 11, L3 - 8]], tT); // 0.45 A = 두 갈래의 합
      pump(PX, B0 - 1);
      // 두 갈래: A(0.3 A)는 가까이, B(0.15 A)는 A 위를 지나 더 멀리 가서 떨어진다
      flow([[T3[1] + 2, oB], [XB, oB], [XB, L0 + 1]], tB);
      flow([[T3[1] + 2, oA], [XA, oA], [XA, L0 + 1]], tA);
      splash(XA, L0 + 0.5, tA);
      splash(XB, L0 + 0.5, tB);
      const wA = [XA - 9, L3 + 50], wB = [XB - 9, L3 + 56];
      wheel(wA[0], wA[1], 12, 0.25);
      wheel(wB[0], wB[1], 11, 0.05);
      flowHead(PX, L3 + 12, [0, -1], tT);
      flowHead(T3[1] + 12, oA, [1, 0], tA);
      flowHead(T3[1] + 44, oB, [1, 0], tB);
      guide(8, row.kind === "series" ? 43 : 45, L3);
      guide(8, T0[0] - 3, L0);
      dim(8, L3, L0, "3 V", { lx: 2 });
      val(wA[0] - 15, wA[1] + 5, "10 Ω", { anchor: "end" });
      val(wB[0], wB[1] - 17, "20 Ω", { anchor: "middle" });
      val(XA - 5, L3 + 33, "0.3 A", { anchor: "end", color: AMP });
      val(130, L3 - 5, "0.15 A", { anchor: "middle", color: AMP });
      val(PX + 9, L0 - 2, "0.45 A", { color: AMP });
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
  const pairs = [["펌프", "전지"], ["물의 높이 차", "전압"], ["물의 흐름", "전류"], ["물레방아", "저항"]];
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
