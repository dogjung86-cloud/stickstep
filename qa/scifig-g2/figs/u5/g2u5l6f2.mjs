// g2u5l6f2 흙을 세로로 자른 단면에 감자와 고구마 두 포기.
//   감자: 곧게 선 줄기와 깃 모양 겹잎, 땅속 줄기 마디에서 옆으로 뻗은 가는 줄기(땅속으로 뻗은 줄기) 끝마다 덩이(감자),
//         뿌리는 줄기 밑동에서 따로 난다. 감자 겉에는 눈(싹이 트는 곳)이 나선으로 흩어지고, 줄기가 붙은 쪽의 반대 끝에 더 많다.
//   고구마: 땅을 기는 덩굴 줄기와 하트 모양 잎, 덩굴 마디에서 내린 뿌리가 굵게 부푼 고구마. 겉에 잔뿌리, 끝은 가는 뿌리로 이어진다.
// 확대 원 둘: 감자의 눈과 돋아난 싹, 고구마 겉의 잔뿌리. 검산 메모는 g2u5l6f2.md
import { lib } from "./_lib.mjs";

export const meta = {
  key: "g2u5l6f2",
  w: 340,
  h: 400,
  alt: "흙을 세로로 자른 단면에 감자와 고구마를 나란히 그린 그림. 감자는 땅속 줄기에서 옆으로 뻗은 가는 줄기 끝마다 달려 있고, 뿌리는 줄기 밑동에서 따로 나 있어요. 감자 겉에는 싹이 트는 눈이 있어요. 고구마는 땅을 기는 덩굴 줄기의 마디에서 내린 뿌리가 굵게 부푼 것이라 겉에 잔뿌리가 나 있고 끝이 가는 뿌리로 이어져요. 둘 다 녹말을 저장해요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const L = lib(kit);
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(97);
  const rnd = N.rng(31);
  const R = (a, b) => a + (b - a) * rnd();
  const mix = (a, c, f) => [a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f, a[2] + (c[2] - a[2]) * f];
  const LG = P.LIGHT;
  P.plate(t, nz, { top: "#FAFCFE", bottom: "#F1F4EE", grain: 0.01 });

  // ── 흙 덩어리: 윗면(땅 겉, 조금 위에서 본 띠)과 자른 앞면 ──
  const GY = 122; // 땅 높이(자른 앞면의 위 가장자리)
  const SB = 300; // 흙 앞면 아래 가장자리
  const SX0 = 6, SX1 = 334;
  P.softShadow(t, 172, SB + 6, 176, 9, 0.18);
  // 땅 겉(윗면): 뒤로 물러나는 얇은 띠, 흙덩이로 가장자리가 울퉁불퉁
  const topEdge = (x) => GY - 9 + nz.fbm(x * 0.05, 3.1, 3) * 2.6;
  P.shade(t, { x: SX0, y: GY - 14, w: SX1 - SX0, h: 15 }, (x, y) => {
    const te = topEdge(x);
    if (y < te - 0.5 || y > GY) return null;
    const cov = P.clamp(y - te + 0.5);
    const n = nz.fbm(x * 0.35, y * 0.9, 3);
    const c = mix([150, 116, 82], [178, 146, 108], P.clamp(0.5 + n));
    const shadeTop = P.smooth(GY - 3, GY, y) * 0.18;
    return [c[0] * (1 - shadeTop), c[1] * (1 - shadeTop), c[2] * (1 - shadeTop), cov];
  });
  // 자른 앞면: 위가 진하고(겉흙) 아래로 갈수록 밝은 흙, 얼룩과 작은 알갱이
  P.shade(t, { x: SX0, y: GY, w: SX1 - SX0, h: SB - GY }, (x, y) => {
    const f = (y - GY) / (SB - GY);
    let c = mix([112, 80, 52], [158, 124, 88], P.smooth(0, 1, f));
    const n = nz.fbm(x * 0.06, y * 0.06, 4);
    const g = nz.n2(x * 0.7, y * 0.7);
    c = mix(c, [92, 64, 40], P.clamp(n * 0.8) * 0.35);
    c = mix(c, [190, 160, 120], P.clamp(-n * 0.8) * 0.2);
    if (g > 0.55) c = mix(c, [210, 184, 146], (g - 0.55) * 1.2);
    if (g < -0.6) c = mix(c, [70, 48, 30], (-g - 0.6) * 1.2);
    // 앞 모서리 쪽은 살짝 밝게(자른 면의 빛)
    const edge = P.smooth(5, 0, y - GY) * 0.12;
    c = mix(c, [220, 196, 160], edge);
    // 아래 가장자리 둥글게
    const cov = P.clamp(SB - y + 0.5) * P.clamp(x - SX0 + 0.5) * P.clamp(SX1 - x + 0.5);
    return [c[0], c[1], c[2], cov];
  });
  // 작은 돌
  for (let i = 0; i < 26; i++) {
    const x = R(SX0 + 6, SX1 - 6), y = R(GY + 12, SB - 6), rx = R(1.6, 3.6), ry = rx * R(0.6, 0.9);
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, R(0, 3), 0, Math.PI * 2);
    ctx.fillStyle = P.rg(ctx, x - rx * 0.4, y - ry * 0.5, 0.3, x, y, rx * 1.2, [[0, "#E6DCCB"], [0.6, "#B8A688"], [1, "#7E6A4E"]]);
    ctx.fill();
  }
  // 앞면 테두리 빛
  ctx.save();
  ctx.strokeStyle = "rgba(255,240,215,.55)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(SX0, GY + 0.5);
  ctx.lineTo(SX1, GY + 0.5);
  ctx.stroke();
  ctx.restore();

  // ── 공용 그리기 ──
  // 가는 뿌리: 갈라지며 아래로(재귀)
  function rootLine(x, y, ang, len, wid, depth, col = "#E2CFAE", edge = "rgba(120,90,55,.55)") {
    const pts = [[x, y]];
    let a = ang, px = x, py = y;
    const n = Math.max(3, Math.round(len / 4));
    for (let i = 0; i < n; i++) {
      a += R(-0.22, 0.22);
      px += Math.cos(a) * (len / n);
      py += Math.sin(a) * (len / n);
      pts.push([px, py]);
    }
    for (const [lw, c] of [[wid + 1, edge], [wid, col]]) {
      ctx.strokeStyle = c;
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.stroke();
    }
    if (depth > 0) {
      for (let k = 0; k < 2 + depth; k++) {
        const j = 1 + Math.floor(R(0.2, 0.85) * (pts.length - 1));
        const p = pts[j];
        rootLine(p[0], p[1], a + (rnd() < 0.5 ? -1 : 1) * R(0.5, 1.1), len * R(0.3, 0.5), Math.max(0.5, wid * 0.6), depth - 1, col, edge);
      }
    }
    return pts;
  }
  // 둥근 막대(줄기, 잎자루): 왼쪽 위가 밝은 원통 그라데이션
  function rod(pts, wid, c0, c1, c2) {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l, ny = dx / l;
      ctx.strokeStyle = P.lg(ctx, a[0] - nx * wid, a[1] - ny * wid, a[0] + nx * wid, a[1] + ny * wid, [[0, c0], [0.45, c1], [1, c2]]);
      ctx.lineWidth = wid;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
  }
  // 덩이(타원체) 화소 음영: 중심 c, 반축 a·b, 기울기 ang, 색 lo→hi, 겉 결
  function blobShade(c, a, b, ang, lo, hi, tex) {
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const rr = Math.max(a, b) + 2;
    P.shade(t, { x: c[0] - rr, y: c[1] - rr, w: 2 * rr, h: 2 * rr }, (x, y) => {
      const dx = x - c[0], dy = y - c[1];
      const u = (dx * ca + dy * sa) / a, v = (-dx * sa + dy * ca) / b;
      const wob = 1 + 0.035 * nz.n2(Math.atan2(v, u) * 2 + c[0], c[1] * 0.1);
      const rho = Math.hypot(u, v) / wob;
      const cov = P.clamp((1 - rho) * Math.min(a, b) + 0.5);
      if (cov <= 0) return null;
      const nzz = Math.sqrt(Math.max(0, 1 - Math.min(1, rho * rho)));
      // 법선(화면 좌표): 국소 (u, v)를 화면으로 돌린다
      const nx = u * ca - v * sa, ny = u * sa + v * ca;
      const ndl = P.clamp(nx * LG[0] + ny * LG[1] + nzz * LG[2]);
      let col = mix(lo, hi, P.clamp(0.12 + 0.95 * ndl));
      if (tex) col = tex(col, x, y, u, v, rho);
      const sp = Math.pow(P.clamp(nx * -0.45 + ny * -0.55 + nzz * 0.7), 22) * 0.35;
      col = mix(col, [255, 250, 240], sp);
      return [col[0], col[1], col[2], cov];
    });
  }
  // 흙 위에 덩이가 박힌 그늘(자른 면에 드리운 접촉 그림자)
  const embedShadow = (c, a, b, ang) =>
    P.dropShadow(t, (q) => q.ellipse(c[0], c[1], a, b, ang, 0, Math.PI * 2), { dx: 2.5, dy: 3.5, blur: 6, a: 0.38, color: "#2A1A0C" });

  // ══ 감자 ══
  const PX = 86; // 감자 줄기 자리
  // 땅속 줄기(땅 아래로 이어진 줄기, 햇빛을 못 받아 하얗다)
  const under = [[PX, GY - 2], [PX + 1, GY + 22], [PX - 1, GY + 46], [PX, GY + 58]];
  // 뿌리: 줄기 밑동(가장 아래 마디들)에서 따로 난다
  for (const [ang, len] of [[1.95, 64], [1.58, 80], [1.22, 70], [2.4, 50], [0.9, 52]]) rootLine(PX + R(-2, 2), GY + 52 + R(0, 6), ang, len, 1.3, 1);
  // 땅속으로 뻗은 줄기(가는 흰 줄기) 셋, 끝마다 감자
  const stolons = [
    { from: [PX - 1, GY + 18], c1: [PX - 30, GY + 22], to: [PX - 44, GY + 44], tub: { c: [PX - 58, GY + 66], a: 23, b: 16.5, ang: 2.15 } },
    { from: [PX + 1, GY + 30], c1: [PX + 26, GY + 34], to: [PX + 42, GY + 52], tub: { c: [PX + 56, GY + 72], a: 21, b: 15.5, ang: 0.95 } },
    { from: [PX, GY + 44], c1: [PX - 14, GY + 66], to: [PX - 22, GY + 96], tub: { c: [PX - 24, GY + 120], a: 24, b: 17, ang: 1.62 } },
  ];
  const tubers = [];
  for (const st of stolons) {
    const pts = L.quad(st.from, st.c1, st.to, 14);
    rod(pts, 3.2, "#FFFDF4", "#EFE6D2", "#C9B894");
    // 땅속 줄기의 마디(작은 비늘잎 자국)
    ctx.fillStyle = "rgba(150,125,90,.7)";
    for (const k of [5, 10]) {
      ctx.beginPath();
      ctx.ellipse(pts[k][0], pts[k][1], 1.4, 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    tubers.push(st.tub);
  }
  rod(under, 5.2, "#FFFBEF", "#ECE2CC", "#C7B58F");
  // 감자 덩이: 연갈색 껍질, 껍질눈(작은 점), 눈(눈썹 같은 자국 위의 오목한 곳)
  const eyesOf = [];
  for (const tb of tubers) {
    embedShadow(tb.c, tb.a, tb.b, tb.ang);
    blobShade(tb.c, tb.a, tb.b, tb.ang, [138, 98, 56], [232, 196, 140], (col, x, y) => {
      const n = nz.fbm(x * 0.5, y * 0.5, 2);
      col = mix(col, [120, 84, 48], P.clamp(n) * 0.25);
      const g = nz.n2(x * 1.3 + 50, y * 1.3);
      if (g > 0.62) col = mix(col, [246, 226, 190], (g - 0.62) * 1.6);
      return col;
    });
    // 눈: 붙은 쪽(줄기 쪽, 국소 u = −1)의 반대 끝(u = +1)에 더 많게, 나선으로 흩어진다
    const ca = Math.cos(tb.ang), sa = Math.sin(tb.ang);
    const eyes = [];
    const nE = 6;
    for (let i = 0; i < nE; i++) {
      const f = i / (nE - 1); // 0 = 붙은 쪽 가까이, 1 = 반대 끝
      const u = -0.35 + 1.15 * Math.pow(f, 0.6);
      const th = i * 2.4 + 0.6; // 나선(황금각 근처로 돌아가며)
      const v = Math.sin(th) * Math.sqrt(Math.max(0, 1 - u * u)) * 0.82;
      if (Math.cos(th) < -0.2 && i < nE - 1) continue; // 뒤쪽(안 보이는 쪽)
      const x = tb.c[0] + (u * tb.a) * ca - (v * tb.b) * sa, y = tb.c[1] + (u * tb.a) * sa + (v * tb.b) * ca;
      eyes.push([x, y, Math.atan2(y - tb.c[1], x - tb.c[0])]);
    }
    for (const [x, y, a] of eyes) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = "rgba(90,58,30,.45)";
      ctx.beginPath();
      ctx.ellipse(0, -0.6, 2.4, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(80,50,25,.85)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(0, 1.6, 2.6, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.fillStyle = "#B07AA0";
      ctx.beginPath();
      ctx.arc(0, -0.7, 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    eyesOf.push(eyes);
  }
  // 땅 위: 곧게 선 줄기와 깃 모양 겹잎(작은 잎이 마주 붙고 끝에 하나)
  const shoot = [[PX, GY - 2], [PX - 2, GY - 40], [PX + 1, GY - 70], [PX - 1, GY - 91]];
  function compoundLeaf(base, ang, len, flip) {
    const rx = Math.cos(ang), ry = Math.sin(ang);
    const tip = [base[0] + rx * len, base[1] + ry * len];
    rod([base, tip], 1.4, "#8CC86A", "#5E9E43", "#3E7A2E");
    const leaflet = (c, a, l, wdt) => {
      ctx.save();
      ctx.translate(c[0], c[1]);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(l * 0.3, -wdt, l * 0.8, -wdt * 0.8, l, 0);
      ctx.bezierCurveTo(l * 0.8, wdt * 0.8, l * 0.3, wdt, 0, 0);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, -wdt, 0, wdt, [[0, "#7DBF55"], [0.55, "#4E9437"], [1, "#336F25"]]);
      ctx.fill();
      ctx.strokeStyle = "rgba(220,240,200,.6)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0.5, 0);
      ctx.lineTo(l * 0.85, 0);
      ctx.stroke();
      ctx.restore();
    };
    // 작은 잎이 마주 두세 쌍(바깥쪽 쌍이 더 크다), 쌍 사이에 아주 작은 잎(감자 잎의 특징), 끝에 작은 잎 하나
    const pairs = 3;
    for (let i = 1; i <= pairs; i++) {
      const f = i / (pairs + 0.6);
      const c = [base[0] + rx * len * f, base[1] + ry * len * f];
      const l = len * (0.3 + 0.07 * i);
      for (const sg of [-1, 1]) leaflet(c, ang + sg * (1.05 - 0.12 * i), l, l * 0.5);
      if (i < pairs) {
        const c2 = [base[0] + rx * len * (f + 0.14), base[1] + ry * len * (f + 0.14)];
        for (const sg of [-1, 1]) leaflet(c2, ang + sg * 1.25, l * 0.3, l * 0.16);
      }
    }
    leaflet(tip, ang, len * 0.46, len * 0.24);
    void flip;
  }
  rod(shoot, 4.2, "#A6D67E", "#6BAA4A", "#3F7A30");
  compoundLeaf([PX - 1, GY - 30], -2.55, 40, false);
  compoundLeaf([PX + 0, GY - 52], -0.55, 42, true);
  compoundLeaf([PX - 1, GY - 78], -2.3, 34, false);
  compoundLeaf([PX - 1, GY - 89], -1.3, 21, true);

  // ══ 고구마 ══
  const NX = 250; // 덩굴의 마디(뿌리를 내린 곳)
  // 덩굴 줄기: 땅 위를 기어간다
  const vine = [];
  for (let i = 0; i <= 40; i++) {
    const x = 176 + (i / 40) * 160;
    vine.push([x, GY - 5 + Math.sin(i * 0.5) * 1.6 + (x < 190 ? (190 - x) * -0.15 : 0)]);
  }
  // 덩굴 마디의 다른 가는 뿌리
  rootLine(NX, GY + 2, 1.52, 62, 1.1, 1);
  rootLine(NX + 64, GY - 3, 1.7, 44, 1, 1);
  rootLine(NX - 58, GY - 3, 1.45, 38, 1, 1);
  // 고구마: 마디에서 내린 뿌리(가는 목) → 굵게 부푼 몸(방추 모양, 위가 조금 더 뭉툭) → 끝은 다시 가는 뿌리
  const sweetDefs = [
    { n0: [NX - 3, GY + 1], dir: 1.95, bend: 0.12, neck: 14, body: 76, W: 14, tail: 40, seed: 3 },
    { n0: [NX + 3, GY + 1], dir: 1.2, bend: -0.1, neck: 12, body: 80, W: 14.5, tail: 36, seed: 7 },
  ];
  const sweet = [];
  for (const sd of sweetDefs) {
    // 중심선: 목 + 몸, 조금씩 휜다
    const total = sd.neck + sd.body;
    const cl = [sd.n0.slice()];
    let a = sd.dir;
    const NS = 160;
    for (let i = 1; i <= NS; i++) {
      a = sd.dir + sd.bend * (i / NS);
      const p = cl[i - 1];
      cl.push([p[0] + Math.cos(a) * (total / NS), p[1] + Math.sin(a) * (total / NS)]);
    }
    const fn = sd.neck / total;
    const prof = (f) => {
      if (f < fn) return 1.3;
      const g = (f - fn) / (1 - fn);
      return Math.max(1.3, sd.W * Math.pow(Math.sin(Math.PI * Math.pow(g, 0.82)), 0.72));
    };
    const end = cl[cl.length - 1];
    // 끝의 가는 뿌리(꼬리)
    rootLine(end[0], end[1] - 1, a, sd.tail, 1.6, 1, "#E9D3BC", "rgba(120,60,60,.5)");
    // 목(가는 뿌리)
    const neckPts = cl.slice(0, Math.round(fn * NS) + 2);
    for (const [lw, c] of [[3.6, "rgba(110,50,60,.55)"], [2.6, "#C98A9C"]]) {
      ctx.strokeStyle = c;
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.beginPath();
      neckPts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.stroke();
    }
    // 몸의 테두리(그림자용)
    const body = cl.slice(Math.round(fn * NS));
    const outline = (q, inset = 0) => {
      const left = [], right = [];
      body.forEach((p, i) => {
        const pa = body[Math.max(0, i - 1)], pc = body[Math.min(body.length - 1, i + 1)];
        const dx = pc[0] - pa[0], dy = pc[1] - pa[1], l = Math.hypot(dx, dy);
        const wv = Math.max(0.5, prof(fn + (1 - fn) * (i / (body.length - 1))) - inset);
        left.push([p[0] - (dy / l) * wv, p[1] + (dx / l) * wv]);
        right.push([p[0] + (dy / l) * wv, p[1] - (dx / l) * wv]);
      });
      left.forEach((p, i) => (i ? q.lineTo(p[0], p[1]) : q.moveTo(p[0], p[1])));
      right.reverse().forEach((p) => q.lineTo(p[0], p[1]));
      q.closePath();
    };
    P.dropShadow(t, (q) => outline(q, 1.6), { dx: 2.5, dy: 3.5, blur: 6, a: 0.38, color: "#2A1A0C" });
    // 화소 음영: 중심선까지 거리 / 그 자리 굵기 → 둥근 몸의 법선
    const xs = body.map((p) => p[0]), ys = body.map((p) => p[1]);
    const bx0 = Math.min(...xs) - sd.W - 2, by0 = Math.min(...ys) - sd.W - 2;
    P.shade(t, { x: bx0, y: by0, w: Math.max(...xs) - bx0 + sd.W + 2, h: Math.max(...ys) - by0 + sd.W + 2 }, (x, y) => {
      let best = 1e9, bi = 0;
      for (let i = 0; i < body.length; i++) {
        const d = (x - body[i][0]) ** 2 + (y - body[i][1]) ** 2;
        if (d < best) { best = d; bi = i; }
      }
      const pa = body[Math.max(0, bi - 1)], pc = body[Math.min(body.length - 1, bi + 1)];
      const dx = pc[0] - pa[0], dy = pc[1] - pa[1], l = Math.hypot(dx, dy);
      const tx = dx / l, ty = dy / l, nxx = -ty, nyy = tx;
      const sdv = (x - body[bi][0]) * nxx + (y - body[bi][1]) * nyy;
      const along = (x - body[bi][0]) * tx + (y - body[bi][1]) * ty;
      const f = fn + (1 - fn) * (bi / (body.length - 1));
      const wv = prof(f);
      // 양 끝은 둥근 마개처럼(중심선 끝을 넘어가면 반구)
      let q = Math.abs(sdv) / Math.max(0.6, wv);
      if ((bi === 0 && along < 0) || (bi === body.length - 1 && along > 0)) q = Math.hypot(sdv, along) / Math.max(0.6, wv);
      if (q > 1.02) return null;
      const cov = P.clamp((1 - q) * wv + 0.5);
      const nz2 = Math.sqrt(Math.max(0, 1 - Math.min(1, q * q)));
      const side = sdv / Math.max(0.6, wv);
      const ndl = P.clamp(nxx * side * LG[0] + nyy * side * LG[1] + nz2 * LG[2]);
      let col = mix([100, 30, 58], [218, 118, 146], P.clamp(0.1 + 0.95 * ndl));
      // 긴 방향의 옅은 결, 작은 껍질눈 점
      const st = nz.n2(side * 3 + sd.seed, (f * 40 + along * 0.1));
      col = mix(col, [126, 44, 76], P.clamp(st) * 0.16);
      const dots = nz.n2(x * 1.1 + sd.seed * 9, y * 1.1);
      if (dots > 0.7) col = mix(col, [236, 186, 196], (dots - 0.7) * 2);
      const sp = Math.pow(P.clamp(nz2 * 0.75 - side * 0.45), 10) * 0.32;
      col = mix(col, [255, 230, 238], sp);
      return [col[0], col[1], col[2], cov];
    });
    // 잔뿌리: 겉에서 짧게 돋은 가는 뿌리(몸 둘레 여기저기)
    const rr = N.rng(sd.seed * 13);
    const hairs = [];
    for (let k = 0; k < 11; k++) {
      const i = 3 + Math.floor(rr() * (body.length - 6));
      const pa = body[i - 1], pc = body[i + 1], p = body[i];
      const dx = pc[0] - pa[0], dy = pc[1] - pa[1], l = Math.hypot(dx, dy);
      const sg = rr() < 0.5 ? -1 : 1;
      const wv = prof(fn + (1 - fn) * (i / (body.length - 1)));
      const bx = p[0] - (dy / l) * wv * sg * 0.94, by = p[1] + (dx / l) * wv * sg * 0.94;
      const ang = Math.atan2((dx / l) * sg, -(dy / l) * sg) + (rr() - 0.5) * 0.9 + 0.25;
      rootLine(bx, by, ang, 4 + rr() * 6, 0.8, 0, "#EED9C2", "rgba(110,60,60,.45)");
      hairs.push([bx, by]);
    }
    sweet.push({ cl, body, prof, hairs, end, sd });
  }
  // 덩굴 줄기와 잎(하트 모양, 잎자루 끝이 잎 밑의 오목한 곳에 붙는다)
  rod(vine, 3.4, "#B9D98F", "#7FA65A", "#5D6E3A");
  ctx.fillStyle = "rgba(120,60,90,.55)";
  for (const x of [NX - 58, NX, NX + 64]) {
    ctx.beginPath();
    ctx.ellipse(x, GY - 4.5, 2.4, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  function heartLeaf(base, ang, l) {
    ctx.save();
    ctx.translate(base[0], base[1]);
    ctx.rotate(ang);
    // 하트 모양: 잎자루가 붙는 오목한 곳(0, 0) 뒤로 두 귓불이 둥글게 나오고, 끝(l, 0)은 뾰족하다
    const heart = (q) => {
      q.moveTo(0, 0);
      q.bezierCurveTo(-0.08 * l, 0.06 * l, -0.3 * l, 0.16 * l, -0.24 * l, 0.34 * l);
      q.bezierCurveTo(-0.18 * l, 0.52 * l, 0.05 * l, 0.57 * l, 0.22 * l, 0.5 * l);
      q.bezierCurveTo(0.55 * l, 0.42 * l, 0.85 * l, 0.2 * l, l, 0);
      q.bezierCurveTo(0.85 * l, -0.2 * l, 0.55 * l, -0.42 * l, 0.22 * l, -0.5 * l);
      q.bezierCurveTo(0.05 * l, -0.57 * l, -0.18 * l, -0.52 * l, -0.24 * l, -0.34 * l);
      q.bezierCurveTo(-0.3 * l, -0.16 * l, -0.08 * l, -0.06 * l, 0, 0);
    };
    P.dropShadow(t, heart, { dx: 2, dy: 3, blur: 4, a: 0.2 });
    ctx.beginPath();
    heart(ctx);
    ctx.fillStyle = P.lg(ctx, 0, -0.5 * l, 0, 0.5 * l, [[0, "#8DCD62"], [0.5, "#5FA843"], [1, "#3C7D2C"]]);
    ctx.fill();
    // 손바닥 모양 잎맥(밑에서 퍼진다), 잎자루 쪽 자줏빛
    ctx.strokeStyle = "rgba(205,175,190,.8)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (const [ex, ey] of [[0.92, 0], [0.62, 0.3], [0.62, -0.3], [0.12, 0.44], [0.12, -0.44], [-0.16, 0.3], [-0.16, -0.3]]) {
      ctx.moveTo(0.02 * l, 0);
      ctx.quadraticCurveTo(ex * l * 0.5, ey * l * 0.35, ex * l, ey * l);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.beginPath();
    ctx.ellipse(0.45 * l, -0.22 * l, 0.3 * l, 0.12 * l, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (const [x, hh, lean, la, ll] of [[194, 30, -0.5, -2.45, 27], [232, 44, 0.15, -1.2, 30], [276, 34, -0.2, -2.0, 26], [316, 42, 0.4, -0.75, 28]]) {
    const top = [x + lean * 18, GY - 5 - hh];
    rod([[x, GY - 5], [x + lean * 8, GY - 5 - hh * 0.55], top], 1.7, "#C59AB0", "#8F6E5C", "#5E4A3C");
    heartLeaf(top, la, ll);
  }

  // ── 확대 원 ──
  const EA = [62, 352], RA = 44; // 감자의 눈과 싹
  const EB = [278, 352], RB = 44; // 고구마의 잔뿌리
  const tbA = tubers[1]; // 오른쪽 감자의 반대 끝 눈
  const eyeA = eyesOf[1].reduce((m, e) => (Math.hypot(e[0] - tbA.c[0], e[1] - tbA.c[1]) > 0 && e[1] > m[1] ? e : m), eyesOf[1][0]);
  const swB = sweet[1];
  const hairB = swB.hairs.reduce((m, q) => (q[1] > m[1] ? q : m), swB.hairs[0]);
  L.lensPath(t, [eyeA[0], eyeA[1]], 6, EA, RA);
  L.lensPath(t, hairB, 7, EB, RB);
  // 감자 눈: 껍질, 눈썹 같은 자국, 오목한 눈에서 돋은 싹(자줏빛 초록, 끝에 작은 잎)
  L.lensOpen(t, EA, RA, ["#E9CC9C", "#B88C58"]);
  P.shade(t, { x: EA[0] - RA, y: EA[1] - RA, w: 2 * RA, h: 2 * RA }, (x, y) => {
    const n = nz.fbm(x * 0.25, y * 0.25, 3);
    const g = nz.n2(x * 0.5 + 9, y * 0.5);
    let c = mix([214, 176, 120], [240, 210, 160], P.clamp(0.5 + n));
    if (g > 0.6) c = mix(c, [250, 234, 204], (g - 0.6) * 2);
    const dd = Math.hypot(x - EA[0] + 22, y - EA[1] + 26) / 70;
    c = mix(c, [150, 108, 62], P.clamp(dd - 0.3) * 0.6);
    return [c[0], c[1], c[2], 1];
  });
  {
    const ex = EA[0] + 2, ey = EA[1] + 12;
    // 오목한 눈
    ctx.beginPath();
    ctx.ellipse(ex, ey, 11, 6.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.rg(ctx, ex + 2, ey + 2, 1, ex, ey, 12, [[0, "#7C5530"], [0.7, "#A8804E"], [1, "rgba(200,160,110,0)"]]);
    ctx.fill();
    // 눈썹 같은 자국(눈 아래 반달 모양 흉터)
    ctx.strokeStyle = "#6E4A28";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(ex, ey - 7, 15, Math.PI * 0.22, Math.PI * 0.78);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,235,200,.6)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(ex, ey - 8.2, 15, Math.PI * 0.25, Math.PI * 0.75);
    ctx.stroke();
    // 싹: 굵고 짧은 자줏빛 초록 줄기, 끝에 작은 잎 두세 장
    const sprout = [[ex, ey + 1], [ex - 1, ey - 10], [ex + 2, ey - 22], [ex + 1, ey - 30]];
    P.dropShadow(t, (q) => {
      q.moveTo(ex - 2, ey);
      q.lineTo(ex - 1, ey - 29);
      q.lineTo(ex + 2.5, ey - 29);
      q.lineTo(ex + 2, ey);
    }, { dx: 2, dy: 2, blur: 3, a: 0.16 });
    rod(sprout, 6.5, "#E3C9E6", "#A97BB0", "#6E4C7C");
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.beginPath();
    ctx.ellipse(ex - 1.8, ey - 14, 1, 7, 0.05, 0, Math.PI * 2);
    ctx.fill();
    for (const [dx, dy, a, l] of [[-1, -30, -2.4, 9], [2, -31, -0.7, 10], [0.5, -33, -1.55, 7]]) {
      ctx.save();
      ctx.translate(ex + dx, ey + dy);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(l * 0.3, -l * 0.42, l * 0.8, -l * 0.35, l, 0);
      ctx.bezierCurveTo(l * 0.8, l * 0.35, l * 0.3, l * 0.42, 0, 0);
      ctx.fillStyle = P.lg(ctx, 0, -l * 0.4, 0, l * 0.4, [[0, "#A9D07A"], [1, "#5E8F3E"]]);
      ctx.fill();
      ctx.restore();
    }
  }
  L.lensClose(t, EA, RA);
  // 고구마 잔뿌리: 자줏빛 겉(둥근 몸의 한쪽)에서 돋은 가는 뿌리와 뿌리털
  L.lensOpen(t, EB, RB, ["#F4ECE2", "#DCCBB8"]);
  {
    // 몸: 원 왼쪽 위를 채우는 큰 타원체의 일부(둥근 겉면, 왼쪽 위 빛)
    const bc = [EB[0] - 26, EB[1] - 20], ba = 58, bb = 36, ang = 0.62;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    P.dropShadow(t, (q) => q.ellipse(bc[0], bc[1], ba, bb, ang, 0, Math.PI * 2), { dx: 3, dy: 4, blur: 7, a: 0.3, color: "#3A2418" });
    P.shade(t, { x: EB[0] - RB, y: EB[1] - RB, w: 2 * RB, h: 2 * RB }, (x, y) => {
      const dx = x - bc[0], dy = y - bc[1];
      const u = (dx * ca + dy * sa) / ba, v = (-dx * sa + dy * ca) / bb;
      const rho = Math.hypot(u, v);
      if (rho > 1.01) return null;
      const nzz = Math.sqrt(Math.max(0, 1 - rho * rho));
      const nx = u * ca - v * sa, ny = u * sa + v * ca;
      const ndl = P.clamp(nx * LG[0] + ny * LG[1] + nzz * LG[2]);
      let col = mix([100, 30, 58], [218, 118, 146], P.clamp(0.1 + 0.95 * ndl));
      const st = nz.n2(v * 6, u * 1.5);
      col = mix(col, [126, 44, 76], P.clamp(st) * 0.18);
      const dots = nz.n2(x * 0.55 + 5, y * 0.55);
      if (dots > 0.68) col = mix(col, [236, 186, 196], (dots - 0.68) * 2);
      const sp = Math.pow(P.clamp(nx * -0.5 + ny * -0.55 + nzz * 0.67), 16) * 0.35;
      col = mix(col, [255, 232, 240], sp);
      return [col[0], col[1], col[2], P.clamp((1 - rho) * bb + 0.5)];
    });
    // 잔뿌리: 몸 둘레(오른쪽 아래 가장자리)에서 바깥으로, 뿌리털이 난 가는 뿌리 넷 + 겉면의 짧은 뿌리 밑동 둘
    const rr = N.rng(77);
    var rootB = [];
    for (const [th, len] of [[-0.35, 26], [0.15, 32], [0.62, 28], [1.08, 22]]) {
      const ex = ba * Math.cos(th), ey = bb * Math.sin(th);
      const bx = bc[0] + ex * ca - ey * sa, by = bc[1] + ex * sa + ey * ca;
      // 그 자리 바깥 법선 방향
      const gx = Math.cos(th) / ba, gy = Math.sin(th) / bb;
      const nxx = gx * ca - gy * sa, nyy = gx * sa + gy * ca, nl = Math.hypot(nxx, nyy);
      const a0 = Math.atan2(nyy / nl, nxx / nl) + (rr() - 0.5) * 0.4;
      const pts = rootLine(bx, by, a0, len, 1.9, 0, "#F0DFCB", "rgba(120,70,60,.6)");
      rootB.push(pts);
      ctx.strokeStyle = "rgba(240,228,212,.95)";
      ctx.lineWidth = 0.5;
      for (let i = 3; i < pts.length; i++) {
        const p = pts[i], q = pts[i - 1];
        const tx = p[0] - q[0], ty = p[1] - q[1], tl = Math.hypot(tx, ty) || 1;
        for (const sg of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(p[0] + (-ty / tl) * sg * (1.6 + rr() * 1.6) - (tx / tl) * 1.2, p[1] + (tx / tl) * sg * (1.6 + rr() * 1.6) - (ty / tl) * 1.2);
          ctx.stroke();
        }
      }
    }
    for (const [u, v] of [[0.55, 0.35], [0.25, 0.7]]) {
      const x = bc[0] + u * ba * ca - v * bb * sa, y = bc[1] + u * ba * sa + v * bb * ca;
      ctx.fillStyle = "rgba(90,30,50,.45)";
      ctx.beginPath();
      ctx.ellipse(x, y, 2.2, 1.5, ang, 0, Math.PI * 2);
      ctx.fill();
      rootLine(x, y, 0.9, 7, 1.3, 0, "#F0DFCB", "rgba(120,70,60,.6)");
    }
  }
  L.lensClose(t, EB, RB);
  L.marker(t, [eyeA[0], eyeA[1]], 6);
  L.marker(t, hairB, 7);

  // ── 글자 ──
  const s = S.svgLayer(root, w, h);
  S.label(s, 10, 22, "감자", { size: 15 });
  S.label(s, 330, 22, "고구마", { size: 15, anchor: "end" });
  // 줄기: 감자의 땅 위 줄기와 고구마 덩굴을 함께
  S.leader(s, [[156, 40], [PX + 1, GY - 62]]);
  S.leader(s, [[184, 40], [212, GY - 6]]);
  S.label(s, 170, 45, "줄기", { size: 14, anchor: "middle" });
  // 땅속으로 뻗은 줄기
  const stoP = L.quad(stolons[1].from, stolons[1].c1, stolons[1].to, 14)[8];
  S.leader(s, [[150, GY + 30], stoP]);
  S.label(s, 154, GY + 26, "땅속으로", { size: 14 });
  S.label(s, 154, GY + 43, "뻗은 줄기", { size: 14 });
  // 뿌리: 감자의 밑동 뿌리, 고구마 끝으로 이어진 가는 뿌리
  const tail0 = sweet[0].end;
  S.leader(s, [[150, 236], [PX + 26, 226]]);
  S.leader(s, [[186, 236], [tail0[0] - 6, tail0[1] + 22]]);
  S.label(s, 168, 241, "뿌리", { size: 14, anchor: "middle" });
  // 둘 다 녹말을 저장해요: 감자 하나, 고구마 하나를 가리킨다
  const tbL = tubers[2], swL = sweet[0].body[Math.round(sweet[0].body.length * 0.55)];
  S.leader(s, [[104, 283], [tbL.c[0] + 14, tbL.c[1] + 8]]);
  S.leader(s, [[236, 283], [swL[0] + 4, swL[1] + 6]]);
  S.label(s, 170, 288, "둘 다 녹말을 저장해요", { size: 14, anchor: "middle" });
  // 확대 원
  S.leader(s, [[EA[0] + RA + 6, EA[1] - 15], [EA[0] + 13, EA[1] + 10]]);
  S.label(s, EA[0] + RA + 9, EA[1] - 10, "눈", { size: 14 });
  S.label(s, EA[0] + RA + 9, EA[1] + 7, "(싹이 트는 곳)", { size: 13.5 });
  const rb = rootB[3][Math.min(4, rootB[3].length - 1)];
  S.leader(s, [[EB[0] - RB - 6, EB[1] + 25], [EB[0] - RB + 4, EB[1] + 25], rb]);
  S.label(s, EB[0] - RB - 9, EB[1] + 30, "잔뿌리", { size: 14, anchor: "end" });
}
