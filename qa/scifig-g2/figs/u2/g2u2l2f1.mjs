// g2u2l2f1 화강암과 돋보기: 같은 결정 배치(mm 좌표)를 표본에서는 2.6 px/mm로, 돋보기 속에서는 4배(10.4 px/mm)로 그린다.
// 장석(흰색 사장석, 분홍 정장석: 네모나게 각진 결정, 쪼개짐 면의 반사), 석영(유리 같은 회색, 다른 결정 사이를 메움),
// 흑운모(검은 육각 판, 옆에서 보면 책장처럼 겹친 판). 알갱이 사이에 틈이나 바탕 물질이 없다. 검산 메모는 g2u2l2f1.md
import { hash2, linOf, out, lens } from "./_lib.mjs";

export const meta = {
  key: "g2u2l2f1",
  w: 340,
  h: 380,
  alt: "화강암 표본 위에 돋보기를 댔어요. 돋보기 속에는 흰색과 분홍색의 각진 장석, 유리처럼 회색으로 비치는 석영, 얇은 판이 겹친 검은 흑운모 알갱이가 빈틈없이 맞물려 있어요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(12);
  const rnd = N.rng(77);
  const R = (a, b) => a + (b - a) * rnd();
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F4", grain: 0.012 });

  // ── 표본과 돋보기의 자리 ──
  const SP = 2.6; // 표본: mm당 px(1 cm = 26 px)
  const MAG = 4; // 돋보기 배율
  const C0 = [150, 268], RX = 138, RY = 72; // 표본 덩어리
  const O = [C0[0] - RX, C0[1] - RY]; // 결정 좌표 (0, 0) mm의 화면 자리
  const LC = [172, 222], LR = 92; // 돋보기 렌즈
  const toMM = (x, y) => [(x - O[0]) / SP, (y - O[1]) / SP];
  const LCmm = toMM(LC[0], LC[1]);

  // ── 결정 만들기(mm): 씨앗의 거듭제곱 보로노이(빈틈없이 맞물린 알갱이). 장석 칸은 크게, 흑운모 칸은 작게 ──
  const W = (2 * RX) / SP + 6, Hh = (2 * RY) / SP + 6;
  let seeds = [];
  const GB = 3;
  let grid = new Map();
  const key = (i, j) => i * 1000 + j;
  function generate(sn) {
    const rr = N.rng(sn);
    const Rr = (a, b) => a + (b - a) * rr();
    seeds = [];
    grid = new Map();
    const near = (x, y, r) => {
      const bi = Math.floor(x / GB), bj = Math.floor(y / GB), n = Math.ceil(r / GB);
      for (let j = -n; j <= n; j++)
        for (let i = -n; i <= n; i++) {
          const l = grid.get(key(bi + i, bj + j));
          if (l) for (const k of l) if (Math.hypot(seeds[k].x - x, seeds[k].y - y) < r) return true;
        }
      return false;
    };
    for (let tries = 0; tries < 40000; tries++) {
      const x = Rr(-3, W), y = Rr(-3, Hh);
      if (near(x, y, 2.3)) continue;
      const u = rr();
      const m = u < 0.25 ? "fw" : u < 0.5 ? "fp" : u < 0.8 ? "qz" : u < 0.91 ? "bh" : "bb";
      const big = m[0] === "f" && rr() < 0.16;
      const wgt = m[0] === "f" ? (big ? 4.2 : 1.6) : m === "qz" ? -0.6 : m === "bh" ? 0.2 : -0.3;
      const ang = Rr(0, Math.PI);
      const rc = Math.sqrt(Math.max(0.5, 1.45 + wgt)); // 칸의 어림 반지름(mm)
      seeds.push({ x, y, m, w: wgt, k: rr(), tx: Rr(-1, 1), ty: Rr(-1, 1), ang, c: Math.cos(ang), s: Math.sin(ang), r: Rr(1.05, 1.4), a: rc * Rr(1.15, 1.4), b: rc * Rr(0.72, 0.9) });
      const kk = key(Math.floor(x / GB), Math.floor(y / GB));
      if (!grid.has(kk)) grid.set(kk, []);
      grid.get(kk).push(seeds.length - 1);
    }
  }
  const HEXN = [0, 1, 2].map((k) => [Math.cos(Math.PI / 6 + (k * Math.PI) / 3), Math.sin(Math.PI / 6 + (k * Math.PI) / 3)]);
  const hexn = (lx, ly) => {
    let m = 0;
    for (const n of HEXN) m = Math.max(m, Math.abs(lx * n[0] + ly * n[1]));
    return m;
  };
  /** (px, py) mm의 알갱이: m 광물, s 씨앗, edge 경계까지 mm, lx·ly 씨앗 기준 결 방향 좌표 */
  function own(px, py) {
    const bi = Math.floor(px / GB), bj = Math.floor(py / GB);
    let i1 = -1, d1 = 1e9, i2 = -1, d2 = 1e9;
    for (let j = -2; j <= 2; j++)
      for (let i = -2; i <= 2; i++) {
        const l = grid.get(key(bi + i, bj + j));
        if (!l) continue;
        for (const k of l) {
          const sd = seeds[k];
          const d = (px - sd.x) ** 2 + (py - sd.y) ** 2 - sd.w;
          if (d < d1) {
            d2 = d1;
            i2 = i1;
            d1 = d;
            i1 = k;
          } else if (d < d2) {
            d2 = d;
            i2 = k;
          }
        }
      }
    const s1 = seeds[i1], s2 = seeds[i2];
    let edge = (d2 - d1) / (2 * Math.hypot(s1.x - s2.x, s1.y - s2.y));
    const dx = px - s1.x, dy = py - s1.y;
    const lx = dx * s1.c + dy * s1.s, ly = -dx * s1.s + dy * s1.c;
    let m = s1.m;
    if (m === "fw" || m === "fp") {
      // 장석은 일찍 굳어 네모난 결정 면을 갖는다: 직사각형 밖의 모서리 자리는 나중에 굳은 석영이 메운다
      const q = Math.max(Math.abs(lx) / s1.a, Math.abs(ly) / s1.b);
      if (q > 1) return { m: "qz", s: s1, edge: Math.min(edge, (q - 1) * s1.b), hexEdge: (q - 1) * s1.b, lx, ly, i: i1 + 7000 };
      edge = Math.min(edge, (1 - q) * s1.b);
    }
    if (m === "bh") {
      // 먼저 굳은 흑운모는 제 모양(육각 판)을 지키고, 둘레의 남은 자리는 나중에 굳은 석영이 메운다
      const inr = s1.r * 0.866;
      const hn = hexn(lx, ly);
      if (hn > inr) return { m: "qz", s: s1, edge: Math.min(edge, hn - inr), hexEdge: hn - inr, lx, ly, i: i1 };
      edge = Math.min(edge, inr - hn);
    }
    return { m, s: s1, edge, lx, ly, i: i1 };
  }

  // 렌즈 속 비율이 사실(장석 절반 남짓, 석영 4분의 1 안팎, 흑운모 1할 안팎)에 맞고 광물이 고루 보이는 배치를 씨앗 40개 가운데서 고른다
  const LPMc = SP * MAG;
  function lensStats() {
    let n = 0, f = 0, fw = 0, fp = 0, q = 0, b = 0;
    const bios = new Set();
    for (let y = -LR; y < LR; y += 3)
      for (let x = -LR; x < LR; x += 3) {
        if (x * x + y * y > LR * LR) continue;
        const o = own(LCmm[0] + x / LPMc, LCmm[1] + y / LPMc);
        n++;
        if (o.m === "qz") q++;
        else if (o.m === "fw") (f++, fw++);
        else if (o.m === "fp") (f++, fp++);
        else (b++, bios.add(o.i));
      }
    return { F: f / n, Q: q / n, B: b / n, fw: fw / n, fp: fp / n, nb: bios.size };
  }
  let bestSn = 1, bestScore = 1e9;
  for (let sn = 1; sn <= 40; sn++) {
    generate(sn);
    const st = lensStats();
    const score = Math.abs(st.F - 0.56) + 1.2 * Math.abs(st.Q - 0.28) + 2 * Math.abs(st.B - 0.11) + 0.6 * Math.abs(st.fw - st.fp) + (st.nb < 4 ? 0.3 : 0);
    if (score < bestScore) {
      bestScore = score;
      bestSn = sn;
    }
  }
  generate(bestSn);

  // 광물 색(선형). 결정마다 면의 기울기(tx, ty)가 달라 빛을 다르게 받는다(왼쪽 위 빛).
  const FW = linOf("#E9E5DC"), FWd = linOf("#C4BDAF"), FP = linOf("#D59C85"), FPd = linOf("#B27662");
  const QZ = linOf("#959CA4"), QZd = linOf("#525A64"), BT = linOf("#151312"), BTs = linOf("#A48E62");
  const WHITE = [1, 1, 1];
  const mix = P.mixc;
  const LX = -0.6, LY = -0.7;
  /** 결정 좌표(mm)의 색. ppm = 그리는 배율(mm당 px, 세부 무늬는 배율이 클 때만) */
  function rockColor(px, py, ppm) {
    const o = own(px, py);
    const fine = P.smooth(5, 9, ppm); // 쌍정 줄, 판 줄 같은 세부는 돋보기에서만
    const relief = P.smooth(3, 8, ppm); // 알갱이 경계선도 돋보기에서만
    const sd = o.s, lx = o.lx, ly = o.ly;
    const bw = o.edge * ppm; // 경계까지 px
    const pit = 1 + 0.035 * fine * nz.n2(px * 7, py * 7); // 겉면의 아주 작은 오톨도톨함
    let c;
    if (o.m === "fw" || o.m === "fp") {
      const pink = o.m === "fp";
      const lit = sd.tx * LX + sd.ty * LY;
      // 불투명한 우윳빛 속 흐림(구름 무늬)
      c = mix(pink ? FP : FW, pink ? FPd : FWd, 0.42 * P.clamp(0.5 + 0.7 * nz.fbm(px * 0.7 + sd.k * 7, py * 0.7, 3)));
      let f = (1 + 0.11 * lit) * pit;
      if (pink && sd.k > 0.4) f *= ly > 0 ? 1.045 : 0.955; // 두 쪽 쌍정(분홍 장석)
      if (pink) {
        c = mix(c, linOf("#EBC3B1"), 0.3 * P.smooth(0.15, 0.55, nz.fbm(lx * 1.3 + sd.k * 5, ly * 2.2 + sd.k * 9, 2))); // 옅게 얼룩진 밝은 부분
      } else {
        f *= 1 + 0.03 * fine * (Math.sin(ly * 17 + sd.k * 6) > 0 ? 1 : -1); // 아주 가는 쌍정 줄
      }
      c = [c[0] * f, c[1] * f, c[2] * f];
      // 쪼개짐 면: 빛 쪽으로 기운 결정은 거울처럼 평평한 면 전체가 밝게 되비친다
      const sheen = P.clamp(lit * 1.25 - 0.35);
      if (sheen > 0) c = mix(c, WHITE, sheen * (0.22 + 0.2 * P.clamp(0.5 - (lx / sd.a) * 0.35 - (ly / sd.b) * 0.25)));
      c = mix(c, linOf("#4A443D"), 0.32 * P.smooth(1.0, 0.1, bw) * relief);
      c = mix(c, WHITE, 0.12 * P.smooth(2.6, 1.0, bw) * P.smooth(0.7, 1.5, bw) * relief * P.clamp(0.4 + lit));
    } else if (o.m === "bh" || o.m === "bb") {
      const lit = sd.tx * LX + sd.ty * LY;
      if (o.m === "bh") {
        // 흑운모 바닥면(육각 판): 검정에 놋쇠빛 광택, 둘레를 따라 겹친 판의 가장자리 단
        const sh = P.clamp(lit * 0.7 + 0.35);
        const g = Math.exp(-((((lx * 0.7 + ly * 0.7) / sd.r) - (sd.k - 0.5) * 0.8) ** 2) * 3.2);
        c = mix(BT, BTs, 0.03 + 0.42 * sh * g);
        const m = hexn(lx, ly) / (sd.r * 0.866);
        for (const st of [0.86, 0.66, 0.46]) c = mix(c, linOf("#5A4E40"), 0.26 * fine * P.smooth(st - 0.05, st, m) * P.smooth(st + 0.05, st, m));
      } else {
        // 흑운모 옆모습: 얇은 판이 책장처럼 겹친 줄
        const ln = Math.sin(ly * 36 + sd.k * 4);
        c = mix(BT, linOf("#6E6150"), fine * (ln > 0.55 ? 0.45 : 0.02) + 0.06 * (1 - fine));
        c = mix(c, BTs, 0.18 * Math.exp(-((lx * 0.8 - (sd.k - 0.5) * 1.6) ** 2) * 1.5));
      }
      c = [c[0] * pit, c[1] * pit, c[2] * pit];
      c = mix(c, linOf("#3E3934"), 0.2 * P.smooth(1.0, 0.1, bw) * relief);
    } else {
      // 석영: 유리처럼 비치는 회색. 속이 깊어 보이는 그늘, 빛 쪽 가장자리의 날카로운 반사, 작은 반짝임, 쪼개짐 없음
      const tx = hash2(o.i, 3, 3) * 2 - 1, ty = hash2(o.i, 4, 4) * 2 - 1;
      const lit = tx * LX + ty * LY;
      const dx = px - sd.x, dy = py - sd.y;
      const depth = P.clamp(0.5 + 0.34 * (dx * 0.55 + dy * 0.65) / 2.2 + 0.12 * nz.n2(px * 0.9, py * 0.9));
      c = mix(QZ, QZd, depth * 0.85);
      c = mix(c, linOf("#B8C3CF"), 0.12 * P.clamp(nz.fbm(px * 1.4 + o.i, py * 1.4, 2) + 0.2));
      const f = (1 + 0.08 * lit) * pit;
      c = [c[0] * f, c[1] * f, c[2] * f];
      // 조개껍데기 모양으로 깨진 면의 가는 호
      const rr = Math.hypot(dx - 0.9 * tx, dy - 0.9 * ty);
      c = mix(c, linOf("#D4DBE2"), 0.07 * fine * P.smooth(0.93, 0.995, Math.sin(rr * 6 + o.i)) * P.smooth(1.6, 0.9, rr));
      for (const [gx, gy, gs] of [[-0.7, -0.6, 40], [0.5, 0.2, 70]]) {
        const g = Math.exp(-((dx - gx * (0.6 + tx * 0.3)) ** 2 + (dy - gy * (0.6 + ty * 0.3)) ** 2) * gs);
        c = mix(c, WHITE, (0.75 * fine + 0.2) * g * P.clamp(0.45 + lit));
      }
      const side = P.clamp(-(dx * LX + dy * LY) / 1.2); // 빛을 등진 쪽 가장자리일수록 0
      c = mix(c, WHITE, 0.35 * fine * P.smooth(2.2, 0.6, bw) * P.smooth(0.3, 0.9, bw) * (1 - side));
      c = mix(c, linOf("#3E3934"), 0.3 * P.smooth(1.0, 0.1, bw) * relief);
    }
    return c;
  }

  // ── 표본 덩어리: 둥근 덩어리에 깨진 면, 왼쪽 위 빛 ──
  const lump = [];
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const r = 1 + 0.07 * nz.n2(Math.cos(a) * 1.6 + 4, Math.sin(a) * 1.6) + 0.03 * nz.n2(Math.cos(a) * 5, Math.sin(a) * 5 + 2);
    const flat = a > 0.2 && a < 2.9 ? 0.93 : 1; // 아래쪽은 바닥에 놓여 평평
    lump.push([C0[0] + Math.cos(a) * RX * r, C0[1] + Math.sin(a) * RY * r * flat]);
  }
  const lumpPath = (c) => lump.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  P.softShadow(t, C0[0] + 10, C0[1] + RY * 0.86, RX * 0.95, 13, 0.24);
  P.shade(t, { x: C0[0] - RX - 12, y: C0[1] - RY - 10, w: 2 * RX + 24, h: 2 * RY + 20 }, (x, y) => {
    const [mx, my] = toMM(x, y);
    const c = rockColor(mx, my, SP);
    // 덩어리의 면: 둥근 몸통 + 깨진 면(능선 노이즈)으로 기울기
    const u = (x - C0[0]) / RX, v = (y - C0[1]) / RY;
    const rr = Math.min(0.98, u * u + v * v);
    const hz = Math.sqrt(1 - rr);
    const fx = 0.5 * nz.fbm(x * 0.03, y * 0.03, 2), fy = 0.5 * nz.fbm(x * 0.03 + 9, y * 0.03, 2);
    const nxv = u * 0.9 + fx * 0.6, nyv = v * 1.1 + fy * 0.6 - 0.35, nzv = hz + 0.25;
    const L = Math.hypot(nxv, nyv, nzv);
    const ndl = (-0.55 * nxv - 0.62 * nyv + 0.56 * nzv) / L;
    const f = 0.5 + 0.62 * Math.max(0, ndl);
    return out([c[0] * f, c[1] * f, c[2] * f]);
  }, { mask: lumpPath });
  // 덩어리 테두리: 위쪽에 빛, 아래쪽에 그늘
  ctx.save();
  ctx.beginPath();
  lumpPath(ctx);
  ctx.closePath();
  ctx.clip();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(30,25,22,.25)";
  ctx.beginPath();
  lumpPath(ctx);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // ── 돋보기 ──
  // 손잡이(렌즈 테 오른쪽 위로)
  const ha = (-40 * Math.PI) / 180;
  const h0 = [LC[0] + Math.cos(ha) * (LR + 6), LC[1] + Math.sin(ha) * (LR + 6)], h1 = [LC[0] + Math.cos(ha) * (LR + 98), LC[1] + Math.sin(ha) * (LR + 98)];
  {
    const nx = -Math.sin(ha), ny = Math.cos(ha);
    const bar = (w0, w1, a, b, fill) => {
      ctx.beginPath();
      ctx.moveTo(a[0] + nx * w0, a[1] + ny * w0);
      ctx.lineTo(b[0] + nx * w1, b[1] + ny * w1);
      ctx.lineTo(b[0] - nx * w1, b[1] - ny * w1);
      ctx.lineTo(a[0] - nx * w0, a[1] - ny * w0);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    };
    P.dropShadow(t, (c) => {
      c.moveTo(h0[0] + nx * 6, h0[1] + ny * 6);
      c.lineTo(h1[0] + nx * 8, h1[1] + ny * 8);
      c.lineTo(h1[0] - nx * 8, h1[1] - ny * 8);
      c.lineTo(h0[0] - nx * 6, h0[1] - ny * 6);
    }, { dx: 2, dy: 6, blur: 9, a: 0.25 });
    const g = P.lg(ctx, h0[0] + nx * 8, h0[1] + ny * 8, h0[0] - nx * 8, h0[1] - ny * 8, [[0, "#5B6472"], [0.35, "#2B313B"], [1, "#151A21"]]);
    const neck = [LC[0] + Math.cos(ha) * (LR + 30), LC[1] + Math.sin(ha) * (LR + 30)];
    bar(4.2, 4.2, h0, neck, P.lg(ctx, h0[0] + nx * 5, h0[1] + ny * 5, h0[0] - nx * 5, h0[1] - ny * 5, [[0, "#C9D0D8"], [0.5, "#8E98A5"], [1, "#59626E"]]));
    bar(7, 8.2, neck, h1, g);
    // 손잡이 광택
    ctx.save();
    ctx.globalAlpha = 0.5;
    bar(1.2, 1.4, [neck[0] + nx * 4, neck[1] + ny * 4], [h1[0] + nx * 4.6, h1[1] + ny * 4.6], "rgba(255,255,255,.55)");
    ctx.restore();
    ctx.beginPath();
    ctx.arc(h1[0], h1[1], 8.2, ha - Math.PI / 2, ha + Math.PI / 2);
    ctx.fillStyle = "#1B2028";
    ctx.fill();
  }
  // 렌즈 속: 같은 결정을 4배로
  const LPM = SP * MAG;
  lens(t, LC[0], LC[1], LR, () => {
    P.shade(t, { x: LC[0] - LR - 1, y: LC[1] - LR - 1, w: 2 * LR + 2, h: 2 * LR + 2 }, (x, y) => {
      const mx = LCmm[0] + (x - LC[0]) / LPM, my = LCmm[1] + (y - LC[1]) / LPM;
      const c = rockColor(mx, my, LPM);
      const rr = Math.hypot(x - LC[0], y - LC[1]) / LR;
      const f = (1.06 - 0.1 * ((x - LC[0] + y - LC[1]) / (2 * LR))) * (1 - 0.18 * P.smooth(0.82, 1, rr));
      return out([c[0] * f, c[1] * f, c[2] * f]);
    });
  }, { shadow: 0.26 });
  // 렌즈 테(금속)
  ctx.save();
  ctx.lineWidth = 7;
  ctx.strokeStyle = P.lg(ctx, LC[0] - LR, LC[1] - LR, LC[0] + LR, LC[1] + LR, [[0, "#E3E8EE"], [0.45, "#8F99A6"], [1, "#4F5866"]]);
  ctx.beginPath();
  ctx.arc(LC[0], LC[1], LR + 4.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(30,36,46,.6)";
  ctx.beginPath();
  ctx.arc(LC[0], LC[1], LR + 8.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ── 라벨: 렌즈 속 알갱이를 골라 지시선 끝을 얹는다(알갱이 안쪽으로 경계에서 6 px 넘게 떨어진 자리) ──
  const inLens = (p, m) => Math.hypot(p[0] - LC[0], p[1] - LC[1]) < LR - m;
  const pickAt = (types, tx, ty) => {
    let best = null, bd = 1e9;
    for (let y = LC[1] - LR + 14; y < LC[1] + LR - 14; y += 2)
      for (let x = LC[0] - LR + 14; x < LC[0] + LR - 14; x += 2) {
        if (!inLens([x, y], 16)) continue;
        const o = own(LCmm[0] + (x - LC[0]) / LPM, LCmm[1] + (y - LC[1]) / LPM);
        if (!types.includes(o.m) || o.edge * LPM < 7) continue;
        const d = Math.hypot(x - tx, y - ty) - o.edge * LPM * 0.6;
        if (d < bd) {
          bd = d;
          best = [x, y];
        }
      }
    return best;
  };
  const s = S.svgLayer(root, w, h);
  const pw = pickAt(["fw"], 130, 170), pp = pickAt(["fp"], 176, 150), pq = pickAt(["qz"], 108, 214), pb = pickAt(["bh"], 228, 226);
  S.label(s, 10, 30, "장석", { size: 14 });
  S.label(s, 10, 47, "흰색, 분홍색", { size: 13.5, weight: 600, color: "#4E5968" });
  if (pw) S.leader(s, [[52, 56], [pw[0] - 30, 56], pw]);
  if (pp) S.leader(s, [[52, 56], [pp[0] - 44, 56], pp]);
  S.label(s, 8, 150, "석영", { size: 14 });
  S.label(s, 8, 167, "무색투명,", { size: 13.5, weight: 600, color: "#4E5968" });
  S.label(s, 8, 184, "회색으로 비침", { size: 13.5, weight: 600, color: "#4E5968" });
  if (pq) S.leader(s, [[66, 158], [pq[0] - 14, 158], pq]);
  S.label(s, 336, 214, "흑운모", { size: 14, anchor: "end" });
  S.label(s, 336, 231, "검은색,", { size: 13.5, anchor: "end", weight: 600, color: "#4E5968" });
  S.label(s, 336, 248, "얇은 판", { size: 13.5, anchor: "end", weight: 600, color: "#4E5968" });
  if (pb) S.leader(s, [[288, 209], [pb[0] + 12, 209], pb]);
  S.label(s, 58, 366, "화강암", { size: 14, anchor: "middle" });
  // 1 cm 막대(표본 배율)
  const bx = 214, by = 360;
  S.el(s, "rect", { x: bx - 1, y: by - 5, width: 26 * 1 + 2, height: 7, fill: "#fff", rx: 1.5, opacity: 0.85 });
  S.el(s, "rect", { x: bx, y: by - 4, width: 13, height: 5, fill: "#26303D" });
  S.el(s, "rect", { x: bx + 13, y: by - 4, width: 13, height: 5, fill: "#fff", stroke: "#26303D", "stroke-width": 1 });
  S.label(s, bx + 32, by + 2, "1 cm", { size: 13.5, weight: 700 });
  // 결정 비율 검사(개발용): 렌즈 안 넓이 비
  if (globalThis.__u2check) {
    let n = 0, f = 0, b = 0, q = 0;
    for (let y = -LR; y < LR; y += 1.5)
      for (let x = -LR; x < LR; x += 1.5) {
        if (x * x + y * y > LR * LR) continue;
        const o = own(LCmm[0] + x / LPM, LCmm[1] + y / LPM);
        n++;
        if (o.m === "qz") q++;
        else if (o.m[0] === "f") f++;
        else b++;
      }
    let n2 = 0, f2 = 0, b2 = 0, q2 = 0;
    for (let y = 0; y < Hh - 6; y += 0.4)
      for (let x = 0; x < W - 6; x += 0.4) {
        const o = own(x, y);
        n2++;
        if (o.m === "qz") q2++;
        else if (o.m[0] === "f") f2++;
        else b2++;
      }
    const nBio = seeds.length;
    console.warn(`lens: F ${(f / n).toFixed(2)} Q ${(q / n).toFixed(2)} B ${(b / n).toFixed(2)} | rock: F ${(f2 / n2).toFixed(2)} Q ${(q2 / n2).toFixed(2)} B ${(b2 / n2).toFixed(2)} (seeds ${nBio})`);
  }
}
