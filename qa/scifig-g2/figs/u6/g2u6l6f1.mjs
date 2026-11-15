// g2u6l6f1 세포 속의 마이토콘드리아: 동물 세포 하나를 잘라 연 모습(세포막, 핵, 세포질 곳곳의 작은 마이토콘드리아 수십 개)과
// 마이토콘드리아 하나를 길게 갈라 연 모습(두 겹의 막, 여러 번 접힌 안쪽 막). 세포로 들어오는 포도당과 산소, 나가는 이산화 탄소와 물은
// 작은 화살표로만(RespLab이 크게 보여 준다). 색은 랩과 같게. 검산 메모는 g2u6l6f1.md
import * as L from "./_lib.mjs";

export const meta = {
  key: "g2u6l6f1",
  w: 340,
  h: 372,
  alt: "동물 세포 하나를 자른 면. 세포막 안 세포질 곳곳에 작은 마이토콘드리아가 수십 개 흩어져 있고 포도당과 산소가 들어오고 이산화 탄소와 물이 나가며, 확대 원에는 막이 두 겹이고 안쪽 막이 여러 번 접힌 마이토콘드리아가 있어요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(31);
  const rnd = N.rng(7);
  const R = (a, b) => a + (b - a) * rnd();

  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 세포(지름 약 20 µm를 225 px로): 조금 울퉁불퉁한 둥근 모양 ──
  const CX = 150, CY = 124, RX = 104, RY = 84;
  const cellPts = [];
  for (let i = 0; i < 96; i++) {
    const th = (i / 96) * L.TAU;
    const wob = 1 + 0.05 * nz.n2(Math.cos(th) * 1.6 + 3, Math.sin(th) * 1.6 + 7) + 0.03 * Math.sin(th * 3 + 0.6);
    cellPts.push([CX + Math.cos(th) * RX * wob, CY + Math.sin(th) * RY * wob]);
  }
  P.softShadow(t, CX + 10, CY + RY + 6, RX * 0.95, 12, 0.16);
  // 세포질(반투명, 가장자리 세포막이 짙게)
  L.pillow(t, L.bbox(cellPts), (c) => L.poly(c, cellPts), {
    color: "#F6D7CB", light: "#FFF4EE", dark: "#D9A493", blur: 12, relief: 0.7, spec: 0.18, gloss: 18, rim: 0.2, alpha: 0.92,
    tex: (x, y) => 0.97 + 0.04 * nz.fbm(x * 0.18, y * 0.18, 3),
  });
  // 세포질 속 작은 알갱이(옅게)
  for (let i = 0; i < 260; i++) {
    const a = R(0, L.TAU), d = Math.sqrt(R(0, 1));
    const x = CX + Math.cos(a) * RX * 0.9 * d, y = CY + Math.sin(a) * RY * 0.9 * d;
    ctx.fillStyle = `rgba(190,120,110,${R(0.18, 0.35).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(x, y, R(0.45, 0.8), 0, L.TAU);
    ctx.fill();
  }
  // 세포막(두께가 보이는 얇은 막)
  ctx.save();
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(196,120,104,.75)";
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  L.poly(ctx, cellPts);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,240,232,.9)";
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  L.poly(ctx, cellPts);
  ctx.stroke();
  ctx.restore();

  // ── 핵(보라, 핵막과 인) ──
  const NX = CX - 6, NY = CY + 4, NR = 34;
  const nucPts = [];
  for (let i = 0; i < 60; i++) {
    const th = (i / 60) * L.TAU;
    const wob = 1 + 0.04 * Math.sin(th * 2 + 1) + 0.03 * nz.n2(Math.cos(th) + 9, Math.sin(th) + 2);
    nucPts.push([NX + Math.cos(th) * NR * 1.08 * wob, NY + Math.sin(th) * NR * 0.92 * wob]);
  }
  P.softShadow(t, NX + 4, NY + 6, NR * 1.05, NR * 0.8, 0.16, "#5A3A70");
  L.pillow(t, L.bbox(nucPts), (c) => L.poly(c, nucPts), {
    color: "#A88AD6", light: "#E6DAFA", dark: "#5E428E", blur: 9, relief: 1.0, spec: 0.35, gloss: 26, rim: 0.2,
    tex: (x, y) => 0.93 + 0.1 * nz.fbm(x * 0.12, y * 0.12, 3),
  });
  L.bubble(t, NX + 8, NY + 4, 9.5, "#6C4CA8", { alpha: 0.9, edgeAlpha: 1, spec: 0.35, gloss: 24 });
  // 핵막의 구멍(작은 점)
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const p = nucPts[Math.floor((i / 18) * nucPts.length)];
    ctx.fillStyle = "rgba(70,40,110,.45)";
    ctx.beginPath();
    ctx.arc(p[0], p[1], 0.9, 0, L.TAU);
    ctx.fill();
  }
  ctx.restore();

  // ── 마이토콘드리아: 굵기 0.5~1 µm, 길이 1~2 µm라 세포보다 훨씬 작다. 단면에 수십 개(세포 하나에는 수백~수천 개) ──
  const MITO = "#E9895C";
  const mitos = [];
  const inNuc = (x, y, pad) => Math.hypot((x - NX) / (NR * 1.08 + pad), (y - NY) / (NR * 0.92 + pad)) < 1;
  const inCell = (x, y, pad) => L.inPoly(cellPts, x, y) && Math.hypot((x - CX) / (RX - pad), (y - CY) / (RY - pad)) < 1;
  for (let k = 0; k < 4000 && mitos.length < 64; k++) {
    const x = R(CX - RX, CX + RX), y = R(CY - RY, CY + RY);
    const len = R(5.5, 11.5), rad = R(2.6, 3.4), ang = R(0, Math.PI);
    if (!inCell(x, y, len + 8) || inNuc(x, y, len + 5)) continue;
    if (mitos.some((m) => Math.hypot(m.x - x, m.y - y) < (m.len + len) * 0.5 + 6.5)) continue;
    mitos.push({ x, y, len, rad, ang });
  }
  mitos.sort((a, b) => a.y - b.y);
  for (const m of mitos) {
    const dx = (Math.cos(m.ang) * m.len) / 2, dy = (Math.sin(m.ang) * m.len) / 2;
    P.softShadow(t, m.x + 1.2, m.y + 1.8, m.len / 2 + m.rad, m.rad * 1.1, 0.16, "#7A3A20");
    L.capsule(t, m.x - dx, m.y - dy, m.x + dx, m.y + dy, m.rad, MITO, { spec: 0.4, gloss: 24, rim: 0.18 });
    // 속의 접힌 안쪽 막(가는 줄)
    ctx.save();
    ctx.strokeStyle = "rgba(255,236,220,.85)";
    ctx.lineWidth = 0.55;
    ctx.lineCap = "round";
    const n = Math.max(2, Math.round(m.len / 3.2));
    for (let q = 0; q < n; q++) {
      const f = (q + 0.5) / n - 0.5;
      const px = m.x + Math.cos(m.ang) * m.len * f, py = m.y + Math.sin(m.ang) * m.len * f;
      const nx = -Math.sin(m.ang), ny = Math.cos(m.ang);
      const sd = q % 2 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(px + nx * sd * m.rad * 0.8, py + ny * sd * m.rad * 0.8);
      ctx.lineTo(px - nx * sd * m.rad * 0.15, py - ny * sd * m.rad * 0.15);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── 확대 원: 마이토콘드리아 하나를 길게 갈라 연 모습 ──
  const pick = mitos.filter((m) => m.x > CX + 30 && m.y > CY + 18).sort((a, b) => b.x + b.y - (a.x + a.y))[0] ?? mitos[0];
  const mk = { x: pick.x, y: pick.y, r: 9 };
  const Z = { x: 262, y: 290, r: 70 };
  L.zoomWedge(t, mk, Z);
  L.zoomCircle(t, Z.x, Z.y, Z.r, () => {
    const ang = -0.2, len = 112, rad = 34;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const toW = (lx, ly) => [Z.x + lx * ca - ly * sa, Z.y + lx * sa + ly * ca];
    // 캡슐 윤곽(로컬 좌표: 긴 축 x)
    const capsulePts = (hl, r) => {
      const pts = [];
      for (let i = 0; i <= 24; i++) {
        const th = -Math.PI / 2 + (i / 24) * Math.PI;
        pts.push(toW(hl + Math.cos(th) * r, Math.sin(th) * r));
      }
      for (let i = 0; i <= 24; i++) {
        const th = Math.PI / 2 + (i / 24) * Math.PI;
        pts.push(toW(-hl + Math.cos(th) * r, Math.sin(th) * r));
      }
      return pts;
    };
    const hl = len / 2 - rad;
    const outer = capsulePts(hl, rad);
    const inner = capsulePts(hl - 1, rad - 5);
    // 뒤쪽 반의 겉면(바깥 막)
    P.softShadow(t, Z.x + 4, Z.y + rad + 4, len * 0.5, 7, 0.2, "#6A3018");
    L.pillow(t, L.bbox(outer), (c) => L.poly(c, outer), { color: "#E58552", light: "#FFC9A6", dark: "#9A4420", blur: 7, relief: 1.1, spec: 0.45, gloss: 30, rim: 0.2 });
    // 속 공간(안쪽에서 본 뒤 벽: 오목해서 왼쪽 위가 그늘)
    const inr = (x, y) => {
      const lx = (x - Z.x) * ca + (y - Z.y) * sa, ly = -(x - Z.x) * sa + (y - Z.y) * ca;
      return [lx, ly];
    };
    P.shade(t, L.bbox(inner), (x, y) => {
      const [lx, ly] = inr(x, y);
      const cx2 = Math.max(-hl + 1, Math.min(hl - 1, lx));
      const ex = (lx - cx2) / (rad - 5), ey = ly / (rad - 5);
      const d2 = ex * ex + ey * ey;
      if (d2 > 1.02) return null;
      // 오목한 면: 법선이 가운데를 향한다
      const nzz = Math.sqrt(Math.max(0, 1 - Math.min(1, d2)));
      const ndl = -ex * -0.52 - ey * -0.64 + nzz * 0.56;
      const k = 0.62 + 0.38 * P.clamp(ndl);
      const g = 0.96 + 0.06 * nz.fbm(x * 0.3, y * 0.3, 2);
      return [214 * k * g, 108 * k * g, 78 * k * g, 1];
    }, { mask: (c) => L.poly(c, inner) });
    // 접힌 안쪽 막: 위와 아래 벽에서 번갈아 안으로 깊이 뻗은 판(서로 엇갈린다). 판마다 가운데에 접힌 틈(가는 선)
    const folds = 10;
    const ir = rad - 5;
    for (let q = 0; q < folds; q++) {
      const fx = -hl - ir * 0.62 + ((q + 0.5) / folds) * (2 * hl + ir * 1.24);
      const top = q % 2 === 0;
      const sg = top ? 1 : -1; // 위 벽에서 아래로(+), 아래 벽에서 위로(−)
      const endCut = Math.max(0, Math.abs(fx) - hl); // 둥근 끝 쪽은 벽이 휘어 짧다
      const wall = Math.sqrt(Math.max(0, ir * ir - endCut * endCut));
      const y0 = -sg * (wall + 3), reach = wall * 2 * (0.6 + 0.05 * Math.sin(q * 2.3)) + 3;
      const bend = 2.2 * Math.sin(q * 1.7 + 0.5);
      const wB = 9.6, wT = 6.6;
      const path = [];
      const N2 = 10;
      for (let k2 = 0; k2 <= N2; k2++) {
        const f = k2 / N2, wv = wB + (wT - wB) * f;
        path.push(toW(fx - wv / 2 + bend * f * f, y0 + sg * reach * f));
      }
      for (let k2 = 0; k2 <= 8; k2++) {
        const th = Math.PI + (k2 / 8) * Math.PI;
        path.push(toW(fx + bend + Math.cos(th) * wT / 2 * (top ? -1 : 1), y0 + sg * reach + sg * Math.abs(Math.sin(th)) * wT * 0.55));
      }
      for (let k2 = N2; k2 >= 0; k2--) {
        const f = k2 / N2, wv = wB + (wT - wB) * f;
        path.push(toW(fx + wv / 2 + bend * f * f, y0 + sg * reach * f));
      }
      ctx.save();
      ctx.beginPath();
      L.poly(ctx, inner);
      ctx.clip();
      for (const [ox, oy, al] of [[3.0, 3.6, 0.13], [1.7, 2.1, 0.2]]) {
        ctx.fillStyle = `rgba(90,30,10,${al})`;
        ctx.beginPath();
        L.poly(ctx, path.map(([x, y]) => [x + ox, y + oy]));
        ctx.fill();
      }
      const g0 = toW(fx - wB / 2, 0), g1 = toW(fx + wB / 2, 0);
      ctx.fillStyle = P.lg(ctx, g0[0], g0[1], g1[0], g1[1], [[0, "#FFE6D2"], [0.35, "#F8C29E"], [0.8, "#E08A5C"], [1, "#C2643A"]]);
      ctx.beginPath();
      L.poly(ctx, path);
      ctx.fill();
      ctx.strokeStyle = "rgba(150,62,30,.7)";
      ctx.lineWidth = 0.9;
      ctx.stroke();
      // 접힌 틈(판 가운데의 가는 선)
      ctx.strokeStyle = "rgba(170,80,44,.55)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let k2 = 0; k2 <= N2; k2++) {
        const f = (k2 / N2) * 0.92;
        const p0 = toW(fx + bend * f * f, y0 + sg * reach * f);
        if (k2) ctx.lineTo(p0[0], p0[1]);
        else ctx.moveTo(p0[0], p0[1]);
      }
      ctx.stroke();
      ctx.restore();
    }
    // 바탕질의 작은 알갱이
    ctx.save();
    ctx.beginPath();
    L.poly(ctx, inner);
    ctx.clip();
    const rr = N.rng(77);
    for (let i = 0; i < 70; i++) {
      const lx = (rr() * 2 - 1) * (hl + rad * 0.6), ly = (rr() * 2 - 1) * (rad - 8);
      const p = toW(lx, ly);
      ctx.fillStyle = "rgba(120,40,20,.35)";
      ctx.beginPath();
      ctx.arc(p[0], p[1], 0.8 + rr() * 0.6, 0, L.TAU);
      ctx.fill();
    }
    ctx.restore();
    // 자른 가장자리: 바깥 막과 안쪽 막(두 겹), 사이의 틈
    ctx.save();
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#B4552B";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    L.poly(ctx, capsulePts(hl, rad - 1.6));
    ctx.stroke();
    ctx.strokeStyle = "#FFD8BE";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    L.poly(ctx, capsulePts(hl, rad - 1.6));
    ctx.stroke();
    ctx.strokeStyle = "#C2643A";
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    L.poly(ctx, capsulePts(hl - 0.5, rad - 5));
    ctx.stroke();
    ctx.strokeStyle = "#F8C29E";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    L.poly(ctx, capsulePts(hl - 0.5, rad - 5));
    ctx.stroke();
    ctx.restore();
  }, { bg: [[0, "#FFFFFF"], [1, "#F6EEEA"]] });
  L.marker(ctx, mk.x, mk.y, mk.r);

  // ── 겹층: 들고 나는 물질(작은 화살표), 라벨 ──
  const sv = S.svgLayer(root, w, h);
  const fat = (pts, fill) => S.fatArrow(sv, pts, { fill, w0: 2.8, w1: 4.6, head: 8, hw: 6, sw: 1.1 });
  const GLU = "#F5B544", O2 = "#7CC8FF", CO2 = "#BBA8F5", WATER = "#5AB0F2";
  const edgeAt = (ang) => {
    // 세포 가장자리의 점(각도)
    const i = Math.round(((ang % L.TAU) + L.TAU) % L.TAU / L.TAU * cellPts.length) % cellPts.length;
    return cellPts[i];
  };
  const e1 = edgeAt(Math.PI * 1.06), e2 = edgeAt(Math.PI * 0.9);
  fat([[e1[0] - 34, e1[1] - 8], [e1[0] + 7, e1[1] + 1]], GLU);
  fat([[e2[0] - 34, e2[1] + 9], [e2[0] + 7, e2[1] - 1]], O2);
  const e3 = edgeAt(Math.PI * 1.66), e4 = edgeAt(Math.PI * 1.86);
  fat([[e3[0] - 4, e3[1] + 7], [e3[0] + 16, e3[1] - 26]], CO2);
  fat([[e4[0] - 7, e4[1] + 5], [e4[0] + 28, e4[1] - 14]], WATER);
  const lab = (x, y, text, pts, o = {}) => {
    if (pts) S.leader(sv, pts);
    S.label(sv, x, y, text, { size: 14, ...o });
  };
  lab(4, e1[1] - 16, "포도당", null, { anchor: "start" });
  lab(4, e2[1] + 28, "산소", null, { anchor: "start" });
  lab(e3[0] - 2, e3[1] - 32, "이산화 탄소", null, { anchor: "start" });
  lab(e4[0] + 32, e4[1] - 10, "물", null, { anchor: "start" });
  // 세포 속 부분
  const memPt = edgeAt(Math.PI * 0.8);
  lab(4, memPt[1] + 52, "세포막", [[24, memPt[1] + 38], [memPt[0], memPt[1]]], { anchor: "start" });
  lab(NX - 2, NY + 6, "핵", null, { anchor: "middle", color: "#2E1A50" });
  const m1 = mitos.filter((m) => m.x > CX - 70 && m.x < CX - 20 && m.y > CY + 36).sort((a, b) => b.y - a.y)[0] ?? mitos[1];
  lab(8, h - 88, "마이토콘드리아", [[74, h - 104], [m1.x - 1, m1.y + 2]], { anchor: "start" });
  // 확대 원 속
  const ang = -0.2, rad = 34, hl = 112 / 2 - rad;
  const toW = (lx, ly) => [Z.x + lx * Math.cos(ang) - ly * Math.sin(ang), Z.y + lx * Math.sin(ang) + ly * Math.cos(ang)];
  const om = toW(-hl - rad + 1.6, -4), im = toW(-hl + 18, rad - 18);
  lab(Z.x - Z.r - 4, Z.y - 36, "바깥 막", [[Z.x - Z.r - 2, Z.y - 31], [om[0] + 1, om[1]]], { anchor: "end", size: 13.5 });
  lab(Z.x - Z.r - 4, Z.y + 48, "접힌\n안쪽 막", [[Z.x - Z.r - 2, Z.y + 44], [im[0], im[1]]], { anchor: "end", size: 13.5 });
}
