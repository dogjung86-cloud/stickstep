// g2u2l4f1 퇴적물이 퇴적암이 되기까지: 같은 배율의 세 칸(쌓임, 다져짐, 굳어짐). 세 칸의 알갱이는 같은 모양, 크기, 개수이고 자리만 가까워진다.
// 다져진 배치(알갱이 넓이 75 %)를 먼저 만들고 세로로 1.25배 늘려 쌓인 배치(넓이 60 %, 틈 40 %)를 얻는다: 알갱이 부피가 같으니 두께는 0.8배.
// 위에는 바다 밑 지층 속 자리(새 층이 쌓일수록 아래로 내려감)의 작은 단면 셋. 검산 메모는 g2u2l4f1.md
import { linOf, out, vor, funnel } from "./_lib.mjs";

export const meta = {
  key: "g2u2l4f1",
  w: 340,
  h: 312,
  alt: "바다 밑에 쌓인 모래 알갱이 사이의 틈에 물이 차 있어요. 위에 새 층이 쌓여 그 무게에 눌리면 같은 알갱이들이 촘촘해지며 틈이 줄고 물이 빠져나가요. 물에 녹아 있던 물질이 틈에 남아 알갱이를 붙이면 단단한 퇴적암이 돼요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(4);
  const rnd = N.rng(13);
  const R = (a, b) => a + (b - a) * rnd();
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 칸 기하 ──
  const PW = 94, YPB = 238, H1 = 125, H2 = 100; // H2 = 0.8 H1
  const PX = [24, 130, 236];
  const PH = [H1, H2, H2];
  const CX = PX.map((x) => x + PW / 2);

  // ── 알갱이: 다져진 배치를 먼저(넓이 75 %) ──
  const EX = 16; // 다져진 배치를 이만큼 더 높은 상자에서 만들고, 칸은 그 아래쪽 H2만 보여 준다(층 속을 들여다본 창)
  const target = 0.75 * PW * (H2 + EX);
  const grains = [];
  let area = 0;
  while (area < target) {
    const r = R(5.2, 9.6);
    const e = R(1.0, 1.3);
    const g = { x: R(r, PW - r), y: R(r, H2 + EX - r), r, e, ang: R(0, Math.PI), seed: R(0, 100), k: rnd() };
    g.area = Math.PI * r * r * 0.97; // 둥근 모양의 넓이(타원 비 e를 반지름 r 안에서 맞춤)
    grains.push(g);
    area += g.area;
  }
  // 겹침을 밀어내며 아래로 가라앉힌다(상자 안, 바닥 쪽으로)
  for (let it = 0; it < 900; it++) {
    for (const g of grains) g.y += 0.06; // 아래로(위쪽 y가 작다: 여기서는 y가 바닥에서 잰 높이가 아니라 위에서 잰 값)
    for (let i = 0; i < grains.length; i++)
      for (let j = i + 1; j < grains.length; j++) {
        const a = grains[i], b = grains[j];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01;
        const m = (a.r + b.r) * 0.985 - d;
        if (m > 0) {
          const ux = dx / d, uy = dy / d;
          a.x -= ux * m * 0.5;
          a.y -= uy * m * 0.5;
          b.x += ux * m * 0.5;
          b.y += uy * m * 0.5;
        }
      }
    for (const g of grains) {
      g.x = Math.max(g.r * 0.9, Math.min(PW - g.r * 0.9, g.x));
      g.y = Math.max(g.r * 0.9 - EX, Math.min(H2 + EX - g.r * 0.9, g.y));
    }
  }
  // 알갱이 모양: 반지름이 각도에 따라 조금씩(닳아서 둥근 모래)
  const shapeR = (g, a) => g.r * (1 + 0.06 * Math.sin(3 * a + g.seed) + 0.04 * Math.sin(5 * a + g.seed * 1.7)) / Math.sqrt(Math.abs(Math.cos(a - g.ang)) ** 2 * g.e + Math.abs(Math.sin(a - g.ang)) ** 2 / g.e);
  /** 칸 i(0, 1, 2)에서 알갱이 g의 화면 가운데: 1번 칸은 세로로 1.25배 늘린 자리, 바닥은 같다 */
  const gpos = (g, i) => [PX[i] + g.x, YPB - (H2 + EX - g.y) * (i === 0 ? H1 / H2 : 1)];
  const inside = (g, i, x, y) => {
    const [cx, cy] = gpos(g, i);
    const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
    if (d > g.r * 1.5) return 9;
    return d / shapeR(g, Math.atan2(dy, dx));
  };
  const near = (i, x, y) => {
    let best = null, bd = 9, d2 = 9;
    for (const g of grains) {
      const d = inside(g, i, x, y);
      if (d < bd) {
        d2 = bd;
        bd = d;
        best = g;
      } else if (d < d2) d2 = d;
    }
    return { g: best, d: bd, d2 };
  };
  // 알갱이 색: 석영(맑은 연갈색), 장석(분홍빛), 암석 조각(회갈색)
  const GC = [linOf("#E6D3AE"), linOf("#D9A588"), linOf("#8F8273"), linOf("#EFE2C6")];
  const gcol = (g) => GC[g.k < 0.55 ? 0 : g.k < 0.75 ? 1 : g.k < 0.88 ? 2 : 3];
  const WAT = linOf("#8FCBEF"), WATd = linOf("#5FA6D9"), CEM = linOf("#F7F4EE"), CEMd = linOf("#D9D4CA");

  // ── 위: 바다 밑 지층 속 자리(같은 층이 새 층에 덮여 점점 깊어진다) ──
  const MW = 66, MT = 24, MB = 82;
  const layersAbove = [0, 3, 6];
  const mini = [];
  for (let i = 0; i < 3; i++) {
    const x0 = CX[i] - MW / 2;
    const lh = 5.2; // 새 층 하나의 두께
    const sampH = i === 0 ? 8 : 6.4; // 다져지면 0.8배
    const sampTop = 60 - layersAbove[i] * lh * 0.62 + layersAbove[i] * lh; // 바다 밑바닥은 올라오고 표본은 깊어진다
    const floor = sampTop - layersAbove[i] * lh;
    mini.push({ x0, floor, sampTop, sampBot: sampTop + sampH });
  }
  // 깔때기(표본 층 → 칸 위)
  for (let i = 0; i < 3; i++) {
    const m = mini[i];
    funnel(t, [m.x0 + 8, m.sampBot], [PX[i] + 2, YPB - PH[i]], [PX[i] + PW - 2, YPB - PH[i]], { a2: [m.x0 + MW - 8, m.sampBot] });
  }
  for (let i = 0; i < 3; i++) {
    const m = mini[i];
    P.dropShadow(t, (c) => P.rrect(c, m.x0, MT, MW, MB - MT, 6), { dx: 1, dy: 3, blur: 6, a: 0.16 });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, m.x0, MT, MW, MB - MT, 6);
    ctx.clip();
    ctx.fillStyle = P.lg(ctx, 0, MT, 0, m.floor, [[0, "#BFE3F7"], [1, "#69B3E6"]]);
    ctx.fillRect(m.x0, MT, MW, m.floor - MT);
    // 층(위에서 아래로): 새 층들, 표본 층, 그 아래 오래된 층
    const tones = ["#D8C49C", "#C9AE86", "#E3D2AE", "#BFA37C", "#D2BB92", "#C7AC84"];
    let y = m.floor, k = 0;
    while (y < MB) {
      const isS = Math.abs(y - m.sampTop) < 0.01;
      const hh = isS ? m.sampBot - m.sampTop : y < m.sampTop ? 5.2 : 5.6;
      ctx.fillStyle = isS ? "#E9C77A" : tones[k++ % tones.length];
      ctx.fillRect(m.x0, y, MW, hh + 0.3);
      // 깊을수록 살짝 어둡게
      ctx.fillStyle = `rgba(60,40,20,${0.05 + 0.1 * ((y - MT) / (MB - MT))})`;
      ctx.fillRect(m.x0, y, MW, hh + 0.3);
      y += hh;
    }
    ctx.restore();
    // 표본 층 테두리
    ctx.save();
    ctx.strokeStyle = "#F59F00";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(m.x0 + 1, m.sampTop, MW - 2, m.sampBot - m.sampTop);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.beginPath();
    P.rrect(ctx, m.x0, MT, MW, MB - MT, 6);
    ctx.stroke();
    ctx.restore();
  }

  // ── 세 칸 ──
  // 남은 틈(굳어짐 칸): 알갱이에서 가장 먼 틈의 한가운데만 조금 남는다
  const fieldD = (i, x, y) => {
    // 가장 가까운 알갱이 겉면까지의 대략 거리(px)
    let m = 99;
    for (const g of grains) {
      const [cx, cy] = gpos(g, i);
      const d = Math.hypot(x - cx, y - cy) - shapeR(g, Math.atan2(y - cy, x - cx));
      if (d < m) m = d;
    }
    return m;
  };
  for (let i = 0; i < 3; i++) {
    const x0 = PX[i], y0 = YPB - PH[i];
    P.dropShadow(t, (c) => P.rrect(c, x0, y0, PW, PH[i], 8), { dx: 2, dy: 4, blur: 8, a: 0.2 });
    P.shade(t, { x: x0, y: y0, w: PW, h: PH[i] }, (x, y) => {
      const o = near(i, x, y);
      let c;
      if (o.d < 1) {
        const g = o.g;
        const [cx, cy] = gpos(g, i);
        const dx = (x - cx) / g.r, dy = (y - cy) / g.r;
        const nzv = Math.sqrt(Math.max(0, 1 - Math.min(1, o.d * o.d)));
        const ndl = P.clamp(-0.52 * dx - 0.64 * dy + 0.56 * nzv * 1.2);
        c = gcol(g);
        c = P.mixc(c, linOf("#5E5040"), 0.12 * (0.5 + 0.5 * nz.n2(x * 0.5 + g.seed, y * 0.5)));
        const f = 0.62 + 0.55 * ndl;
        c = [c[0] * f, c[1] * f, c[2] * f];
        c = P.mixc(c, [1, 1, 1], 0.45 * Math.exp(-((dx + 0.38) ** 2 + (dy + 0.42) ** 2) * 9));
        c = P.mixc(c, linOf("#3A3026"), 0.55 * P.smooth(0.86, 1, o.d));
      } else if (i < 2) {
        // 물이 찬 틈
        c = P.mixc(WAT, WATd, 0.35 + 0.25 * nz.n2(x * 0.08, y * 0.08));
        c = P.mixc(c, linOf("#3A3026"), 0.5 * P.smooth(1.12, 1.0, o.d)); // 알갱이 둘레의 가는 그늘
      } else {
        // 굳어짐: 물에 녹아 있던 물질이 틈을 채워 알갱이를 붙인다(하얀 결정질). 틈 한가운데는 조금 남음
        const fd = fieldD(i, x, y);
        if (fd > 3.1) {
          c = P.mixc(WAT, WATd, 0.5);
          c = P.mixc(c, CEMd, 0.6 * P.smooth(3.6, 3.1, fd));
        } else {
          const gg = vor(x, y, 2.2, 7);
          c = P.mixc(CEM, CEMd, 0.45 * gg.id + 0.2 * P.smooth(0.5, 0.05, gg.d2 - gg.d1));
          c = P.mixc(c, linOf("#B9B2A6"), 0.35 * P.smooth(1.0, 0, fd));
        }
        c = P.mixc(c, linOf("#3A3026"), 0.45 * P.smooth(1.1, 1.0, o.d));
      }
      return out(c);
    }, { mask: (c) => P.rrect(c, x0, y0, PW, PH[i], 8) });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, x0, y0, PW, PH[i], 8);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#A9B3C1";
    ctx.beginPath();
    P.rrect(ctx, x0 - 2, y0 - 2, PW + 4, PH[i] + 4, 9.5);
    ctx.stroke();
    ctx.restore();
  }

  // ── 겹층 ──
  const s = S.svgLayer(root, w, h);
  // 처음 두께와 줄어든 두께(점선) + 왼쪽 눈금
  for (const yy of [YPB - H1, YPB - H2]) S.el(s, "line", { x1: PX[0] - 2, y1: yy, x2: PX[2] + PW + 2, y2: yy, stroke: "#8B95A1", "stroke-width": 1, "stroke-dasharray": "3 3" });
  S.el(s, "line", { x1: 12, y1: YPB, x2: 12, y2: YPB - H1, stroke: "#6B7684", "stroke-width": 1.2 });
  for (let k = 0; k <= 12; k++) {
    const yy = YPB - (H1 * k) / 12.5;
    S.el(s, "line", { x1: 12, y1: yy, x2: k % 4 === 0 ? 19 : 16, y2: yy, stroke: "#6B7684", "stroke-width": 1 });
  }
  // 위에 쌓인 퇴적물의 무게(2, 3번 단면의 표본 층 위를 누르는 화살표)
  for (const i of [1, 2]) {
    const m = mini[i];
    S.fatArrow(s, [[CX[i], m.floor + 1], [CX[i], m.sampTop - 1]], { fill: "#8A5A2B", w0: 4, w1: 6, head: 7, hw: 7.5, sw: 1.2 });
  }
  S.label(s, (CX[1] + CX[2]) / 2, 15, "위에 쌓인 퇴적물의 무게", { size: 13.5, anchor: "middle" });
  // 칸 사이의 진행 표시
  for (const x of [PX[1] - 6, PX[2] - 6]) S.el(s, "path", { d: `M${x - 3} ${YPB - 56} l5 6 l-5 6`, fill: "none", stroke: "#8B95A1", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" });
  // 다져짐 칸: 빠져나가는 물
  for (const dx of [-24, 2, 26]) S.rayArrow(s, [CX[1] + dx, YPB - H2 - 2], [CX[1] + dx + 5, YPB - H2 - 15], { color: "#2F8FD8", w: 1.8, hl: 5.5, hw: 3.4 });
  // 단계 이름표
  const pill = (x, y, text, fill) => {
    const ww = text.length * 14 + 20;
    S.el(s, "rect", { x: x - ww / 2, y: y - 10.5, width: ww, height: 21, rx: 10.5, fill, stroke: "#fff", "stroke-width": 1.4 });
    S.label(s, x, y + 5, text, { size: 13.5, anchor: "middle", halo: false, color: "#fff" });
  };
  pill(CX[0], MB + 13, "쌓임", "#3D5A80");
  pill(CX[1], MB + 13, "다져짐", "#3D5A80");
  pill(CX[2], MB + 13, "굳어짐", "#3D5A80");
  // 지시선 대상 고르기
  const pickGrain = (i, tx, ty) => {
    let best = null, bd = 1e9;
    for (const g of grains) {
      const [cx, cy] = gpos(g, i);
      if (g.r < 7) continue;
      const d = Math.hypot(cx - tx, cy - ty);
      if (d < bd) {
        bd = d;
        best = [cx, cy];
      }
    }
    return best;
  };
  const pickPore = (i, tx, ty, minD) => {
    let best = null, bd = 1e9;
    const x0 = PX[i], y0 = YPB - PH[i];
    for (let y = y0 + 6; y < YPB - 6; y += 1)
      for (let x = x0 + 6; x < x0 + PW - 6; x += 1) {
        const fd = fieldD(i, x, y);
        if (fd < minD) continue;
        const d = Math.hypot(x - tx, y - ty) - fd * 2;
        if (d < bd) {
          bd = d;
          best = [x, y];
        }
      }
    return best;
  };
  const g1 = pickGrain(0, PX[0] + 30, YPB - 30);
  const p1 = pickPore(0, PX[0] + 66, YPB - 34, 2.6);
  const p2 = pickPore(1, CX[1], YPB - 28, 2.0);
  const c3 = (() => {
    let best = null, bd = 1e9;
    for (let y = YPB - H2 + 8; y < YPB - 8; y += 1)
      for (let x = PX[2] + 8; x < PX[2] + PW - 8; x += 1) {
        if (near(2, x, y).d < 1.15) continue;
        const fd = fieldD(2, x, y);
        if (fd > 2.6 || fd < 1.2) continue;
        const d = Math.hypot(x - (CX[2] + 10), y - (YPB - 26));
        if (d < bd) {
          bd = d;
          best = [x, y];
        }
      }
    return best;
  })();
  if (g1) S.leader(s, [[44, 254], [g1[0], g1[1]]]);
  S.label(s, 8, 266, "퇴적물 알갱이", { size: 13.5 });
  if (p1) S.leader(s, [[100, 270], [p1[0], p1[1]]]);
  S.label(s, 100, 285, "물", { size: 14, anchor: "middle" });
  if (p2) S.leader(s, [[CX[1] + 6, 254], [p2[0], p2[1]]]);
  S.label(s, CX[1] + 6, 266, "알갱이 사이의 틈", { size: 13.5, anchor: "middle" });
  if (c3) S.leader(s, [[CX[2] + 12, 254], [c3[0], c3[1]]]);
  S.label(s, CX[2] + 12, 266, "알갱이를", { size: 13.5, anchor: "middle" });
  S.label(s, CX[2] + 12, 283, "붙이는 물질", { size: 13.5, anchor: "middle" });
  S.label(s, CX[2] + 12, 304, "퇴적암", { size: 14, anchor: "middle", color: "#7A4E1E" });
}
