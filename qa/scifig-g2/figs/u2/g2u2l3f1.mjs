// g2u2l3f1 화성암이 생기는 두 자리: 땅을 세로로 자른 단면(화산, 산허리를 흘러내린 용암, 마그마 통로, 지하 깊은 곳의 마그마 덩어리와
// 가장자리부터 굳어 가는 테두리)과 같은 배율(14 px/mm)의 확대 원 두 개. 두 원은 같은 광물 색을 쓰고 결정의 크기만 다르다. 검산 메모는 g2u2l3f1.md
import { linOf, out, lens, funnel, vor, hash2, smoothPath } from "./_lib.mjs";

export const meta = {
  key: "g2u2l3f1",
  w: 340,
  h: 400,
  alt: "땅을 세로로 자른 단면에 화산과 산허리를 흘러내린 용암, 지하 깊은 곳의 큰 마그마 덩어리가 있어요. 지표에서 빨리 식은 용암을 확대하면 결정이 아주 작고 기체가 빠져나간 구멍이 보이고, 지하 깊은 곳에서 천천히 식은 부분은 결정이 커요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(8);
  const rnd = N.rng(21);
  const R = (a, b) => a + (b - a) * rnd();
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 단면의 틀 ──
  const F = { x: 10, y: 18, w: 192, h: 366 };
  const GY = 122; // 평지의 지표
  const VX = 104, VT = 50; // 화산 꼭대기(분화구) 자리
  const coneY = (x) => {
    // 원뿔: 꼭대기에서 양옆으로 오목하게 내려온다(성층 화산)
    const d = Math.abs(x - VX);
    if (d < 7) return VT + 3 + 1.2 * Math.cos((d / 7) * Math.PI); // 분화구의 오목한 곳
    const y = VT + 4 + (GY - VT - 4) * Math.pow(Math.min(1, (d - 7) / 80), 0.78);
    return Math.min(GY, y);
  };
  const surfY = (x) => Math.min(GY, coneY(x)) + 0.8 * nz.n2(x * 0.15, 3);
  const BODY = { cx: 104, cy: 326, rx: 72, ry: 33 }; // 지하 깊은 곳의 마그마 덩어리
  const bodyR = (x, y) => Math.hypot((x - BODY.cx) / BODY.rx, (y - BODY.cy) / BODY.ry) * (1 + 0.05 * nz.n2(x * 0.05, y * 0.05));
  const RIM = 0.8; // 정규 반지름 0.8~1.0 은 이미 굳은 테두리
  const pipeX = (y) => VX + 1.1 * Math.sin((y - VT) * 0.03) + 0.6 * nz.n2(y * 0.04, 1);
  const pipeW = (y) => 2.7 + 2.2 * P.smooth(BODY.cy - BODY.ry - 26, BODY.cy - BODY.ry + 4, y);
  // 산허리의 용암 흐름(오른쪽): 분화구에서 오른쪽 기슭과 평지까지. 위는 뜨겁게 빛나고 아래쪽 끝은 식어 굳었다
  const flowEnd = 196;
  const flowTop = (x) => surfY(x) - (3.4 + 3.2 * P.smooth(118, 170, x) + 2.4 * Math.exp(-(((x - 185) / 8) ** 2))) * P.smooth(VX + 3, VX + 12, x) * P.smooth(flowEnd + 0.5, flowEnd - 5, x);
  const hot = (x) => 1 - P.smooth(150, 176, x); // 1 = 아직 뜨거움, 0 = 식어 굳음

  P.dropShadow(t, (c) => c.rect(F.x, F.y, F.w, F.h), { dx: 2, dy: 4, blur: 10, a: 0.18 });
  const mn = { strata: ["#C9B79B", "#B39C7E", "#D3C3A6", "#9F8A70", "#BBA78C", "#A99478"] };
  P.shade(t, { x: F.x, y: F.y, w: F.w, h: F.h }, (x, y) => {
    const sy = surfY(x);
    // 하늘
    if (y < sy - 0.6) {
      const k = (y - F.y) / (GY - F.y);
      let c = P.mixc(linOf("#CFE3F4"), linOf("#F2F6F9"), k);
      // 화산 위의 옅은 연기
      const plume = Math.exp(-(((x - VX - (VT - y) * 0.35) / (10 + (VT - y) * 0.5)) ** 2)) * P.smooth(VT + 2, VT - 6, y);
      c = P.mixc(c, linOf("#B7B4B0"), 0.55 * plume * (0.7 + 0.3 * nz.fbm(x * 0.08, y * 0.08, 3)));
      return out(c);
    }
    const a = P.smooth(sy - 0.6, sy + 0.4, y);
    let c;
    // 땅속: 수평 지층(깊어질수록 어둡게)
    const depth = (y - GY) / (F.y + F.h - GY);
    const band = Math.floor((y + 2.2 * nz.n2(x * 0.03, y * 0.02)) / 21);
    c = linOf(mn.strata[((band % 6) + 6) % 6]);
    c = P.mixc(c, linOf("#6E6156"), 0.25 * P.clamp(depth));
    // 화산체: 꼭대기를 따라 휜 줄무늬(용암과 화산재가 번갈아 쌓임)
    if (y < GY) {
      const d = Math.abs(x - VX);
      const lay = (y - coneY(x)) * 0.9 + d * 0.06;
      const k = Math.floor(lay / 5.2 + 0.4 * nz.n2(x * 0.06, y * 0.06));
      c = linOf(["#7E7268", "#9A8B7D", "#6B6058", "#8A7D70", "#A59585"][((k % 5) + 5) % 5]);
    }
    const n = nz.fbm(x * 0.12, y * 0.12, 3);
    const f = 1 + 0.08 * n;
    c = [c[0] * f, c[1] * f, c[2] * f];
    // 알갱이 결
    const g = vor(x, y, 1.6, 4);
    c = P.mixc(c, g.id > 0.5 ? linOf("#F3EADB") : linOf("#4C4038"), 0.1 * P.smooth(0.7, 0.2, g.d1));
    // 지표의 풀(평지)
    if (y < GY + 2.4 && Math.abs(x - VX) > 82) c = P.mixc(c, linOf("#7FAE52"), P.smooth(GY + 2.4, GY + 0.6, y));
    return out(c, a);
  }, { mask: (c) => c.rect(F.x, F.y, F.w, F.h) });

  // 마그마 덩어리: 굳은 테두리(결정이 맞물린 암석) + 아직 녹아 있는 속(빛남)
  P.shade(t, { x: BODY.cx - BODY.rx - 6, y: BODY.cy - BODY.ry - 6, w: 2 * BODY.rx + 12, h: 2 * BODY.ry + 12 }, (x, y) => {
    const r = bodyR(x, y);
    if (r > 1.03) return null;
    const a = P.smooth(1.03, 0.99, r);
    if (r > RIM) {
      // 굳은 테두리: 밝은 결정과 어두운 결정이 섞인 결정질 암석
      const g = vor(x, y, 2.3, 11);
      let c = g.id < 0.5 ? linOf("#D9D4CC") : g.id < 0.72 ? linOf("#9DA2A6") : linOf("#2E2B29");
      c = P.mixc(c, linOf("#3B3632"), 0.4 * P.smooth(0.5, 0.05, g.d2 - g.d1));
      const f = 0.92 + 0.12 * (1 - (r - RIM) / (1 - RIM));
      // 녹은 속과 맞닿은 안쪽 경계는 붉게 달아 있다
      c = P.mixc(c, linOf("#E2582C"), 0.5 * P.smooth(RIM + 0.06, RIM, r));
      return out([c[0] * f, c[1] * f, c[2] * f], a);
    }
    // 녹아 있는 마그마: 가운데가 가장 뜨겁다
    const k = r / RIM;
    let c = P.mixc(linOf("#FFE7A0"), linOf("#FF8A2E"), P.smooth(0.0, 0.75, k));
    c = P.mixc(c, linOf("#D9481F"), P.smooth(0.7, 1.0, k));
    const fl = nz.fbm(x * 0.07 + 3, y * 0.12, 3);
    c = P.mixc(c, linOf("#FFF3C8"), 0.25 * P.smooth(0.15, 0.6, fl) * (1 - k));
    // 자라기 시작한 작은 결정 몇 개(테두리 가까이)
    const g = vor(x, y, 3.2, 17);
    if (g.id < 0.18 && k > 0.55) c = P.mixc(c, linOf("#7A4A32"), 0.55 * P.smooth(0.9, 0.3, g.d1));
    return out(c);
  });
  // 통로와 분화구의 마그마
  P.shade(t, { x: VX - 14, y: VT - 4, w: 28, h: BODY.cy - VT }, (x, y) => {
    if (y > BODY.cy - BODY.ry * 0.7) return null;
    const cx = pipeX(y), hw = pipeW(y);
    const d = Math.abs(x - cx) / hw;
    if (d > 1.15 || y < surfY(x) - 0.5) return null;
    const a = P.smooth(1.15, 0.95, d);
    let c = P.mixc(linOf("#FFE08A"), linOf("#F0601F"), P.smooth(0.1, 1.0, d));
    c = P.mixc(c, linOf("#8C2A12"), P.smooth(0.85, 1.1, d) * 0.8);
    return out(c, a);
  });
  // 산허리의 용암: 위는 빛나고 아래는 식은 검회색(표면에 붉은 금)
  P.shade(t, { x: VX, y: VT - 6, w: flowEnd - VX + 2, h: GY - VT + 10 }, (x, y) => {
    if (x > flowEnd || x < VX + 2) return null;
    const ty = flowTop(x), by = surfY(x) + 0.6;
    const endA = P.smooth(flowEnd, flowEnd - 3, x);
    if (y < ty - 0.6 || y > by + 0.6) return null;
    const a = P.smooth(ty - 0.6, ty + 0.4, y) * P.smooth(by + 0.6, by - 0.4, y) * endA;
    const hh = hot(x);
    let c = P.mixc(linOf("#3F3A38"), linOf("#5A5450"), 0.5 + 0.5 * nz.n2(x * 0.3, y * 0.4));
    const cr = Math.abs(nz.n2(x * 0.22, y * 0.5));
    c = P.mixc(c, linOf("#E85A24"), (0.9 * hh + 0.15) * P.smooth(0.12, 0.02, cr) * (0.4 + 0.6 * hh));
    c = P.mixc(c, P.mixc(linOf("#FFC65C"), linOf("#F26A22"), P.smooth(VX, 150, x)), hh * 0.85);
    return out(c, a);
  });
  // 단면 테두리
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(F.x, F.y + F.h);
  ctx.lineTo(F.x, F.y);
  ctx.lineTo(F.x + F.w, F.y);
  ctx.stroke();
  ctx.strokeStyle = "rgba(60,50,45,.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(F.x, F.y, F.w, F.h);
  ctx.restore();

  // ── 확대 원 두 개(같은 배율 14 px/mm) ──
  const PPM = 14;
  const C1 = [272, 108], C2 = [272, 298], CR = 52;
  const src1 = [182, surfY(182) + 0.6]; // 식어 굳은 용암(지표)
  const src2 = [BODY.cx + BODY.rx * 0.9 * Math.cos(-0.45), BODY.cy + BODY.ry * 0.9 * Math.sin(-0.45)]; // 지하 깊은 곳에서 굳은 테두리
  funnel(t, src1, [C1[0] - CR * 0.7, C1[1] - CR * 0.72], [C1[0] - CR * 0.55, C1[1] + CR * 0.84]);
  funnel(t, src2, [C2[0] - CR * 0.62, C2[1] - CR * 0.8], [C2[0] - CR * 0.7, C2[1] + CR * 0.72]);
  for (const p of [src1, src2]) {
    ctx.beginPath();
    ctx.arc(p[0], p[1], 3.4, 0, Math.PI * 2);
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = "#F59F00";
    ctx.stroke();
  }
  // 두 원이 같이 쓰는 광물 색(밝은 광물, 회색 광물, 어두운 광물)
  const ML = linOf("#E6E2DA"), MG = linOf("#8F959C"), MD = linOf("#25221F");
  // (1) 화산암: 아주 작은 결정이 모인 고운 바탕 + 기체가 빠져나간 구멍
  const holes = [];
  for (let i = 0; i < 60 && holes.length < 7; i++) {
    const a = R(0, Math.PI * 2), rr = Math.sqrt(rnd()) * (CR - 12);
    const p = [C1[0] + Math.cos(a) * rr, C1[1] + Math.sin(a) * rr];
    const r = R(3.5, 9.5);
    if (holes.some((q) => Math.hypot(q.x - p[0], q.y - p[1]) < q.r + r + 5)) continue;
    holes.push({ x: p[0], y: p[1], r, e: R(1.0, 1.35), ang: R(-0.5, 0.5) });
  }
  const laths = [];
  for (let i = 0; i < 4; i++) laths.push({ x: C1[0] + R(-34, 34), y: C1[1] + R(-30, 30), a: R(4, 6.5), b: R(1.1, 1.6), ang: R(0, Math.PI) });
  lens(t, C1[0], C1[1], CR, () => {
    P.shade(t, { x: C1[0] - CR, y: C1[1] - CR, w: 2 * CR, h: 2 * CR }, (x, y) => {
      // 바탕: 0.05~0.1 mm 결정(약 1 px)이 섞여 고르게 회색으로 보인다
      const g = vor(x, y, 0.95, 31);
      let c = g.id < 0.5 ? ML : g.id < 0.75 ? MG : MD;
      c = P.mixc(c, P.mixc(ML, MD, 0.47), 0.45);
      const f = 1 + 0.06 * nz.fbm(x * 0.08, y * 0.08, 2);
      c = [c[0] * f, c[1] * f, c[2] * f];
      // 작은 결정 몇 개(1 mm보다 작다)
      for (const l of laths) {
        const dx = x - l.x, dy = y - l.y, lx = dx * Math.cos(l.ang) + dy * Math.sin(l.ang), ly = -dx * Math.sin(l.ang) + dy * Math.cos(l.ang);
        const q = Math.max(Math.abs(lx) / l.a, Math.abs(ly) / l.b);
        if (q < 1) c = P.mixc(c, ML, 0.85 * P.smooth(1, 0.8, q));
      }
      // 기체 구멍: 속은 그늘, 빛을 받는 아래 오른쪽 안벽은 밝게, 둘레는 살짝 솟음
      for (const hl of holes) {
        const dx = x - hl.x, dy = y - hl.y;
        const lx = dx * Math.cos(hl.ang) + dy * Math.sin(hl.ang), ly = (-dx * Math.sin(hl.ang) + dy * Math.cos(hl.ang)) * hl.e;
        const rr = Math.hypot(lx, ly) / hl.r;
        if (rr < 1) {
          const wall = P.clamp((dx * 0.6 + dy * 0.7) / hl.r * 0.9 + 0.1);
          let hc = P.mixc(linOf("#1E1B1A"), linOf("#6F6A66"), wall * P.smooth(0.35, 0.95, rr));
          c = P.mixc(c, hc, P.smooth(1, 0.9, rr));
        } else if (rr < 1.25) {
          const rim = (-(dx * 0.6 + dy * 0.7) / hl.r) * P.smooth(1.25, 1.02, rr);
          c = P.mixc(c, rim > 0 ? [1, 1, 1] : linOf("#2A2724"), Math.abs(rim) * 0.35);
        }
      }
      return out(c);
    });
  });
  // (2) 심성암: 수 mm 결정이 빈틈없이 맞물림(같은 광물 색, 같은 비율 50 : 25 : 25). 거듭제곱 보로노이(mm), 밝은 광물은 네모난 결정,
  //     회색 광물(석영)은 사이를 메우고, 어두운 광물은 기둥 모양 결의 줄
  let cs = [];
  const makeCs = (sn) => {
    const rr2 = N.rng(sn);
    cs = [];
    for (let k = 0; k < 6000 && cs.length < 80; k++) {
      const x = (rr2() * 2 - 1) * 5.2, y = (rr2() * 2 - 1) * 5.2;
      if (cs.some((q) => Math.hypot(q.x - x, q.y - y) < 1.6)) continue;
      const u = rr2();
      const m = u < 0.46 ? 0 : u < 0.72 ? 1 : 2;
      const wgt = m === 0 ? (rr2() < 0.35 ? 1.5 : 0.35) : m === 1 ? -0.35 : rr2() < 0.4 ? 0.5 : -0.1;
      const ang = rr2() * Math.PI, rc = Math.sqrt(Math.max(0.4, 0.95 + wgt));
      cs.push({ x, y, m, w: wgt, c: Math.cos(ang), s: Math.sin(ang), k: rr2(), tx: rr2() * 2 - 1, ty: rr2() * 2 - 1, a: rc * (1.2 + 0.25 * rr2()), b: rc * (0.75 + 0.15 * rr2()) });
    }
  };
  const ownC = (px, py) => {
    let i1 = 0, d1 = 1e9, i2 = 0, d2 = 1e9;
    cs.forEach((q, i) => {
      const d = (px - q.x) ** 2 + (py - q.y) ** 2 - q.w;
      if (d < d1) {
        d2 = d1;
        i2 = i1;
        d1 = d;
        i1 = i;
      } else if (d < d2) {
        d2 = d;
        i2 = i;
      }
    });
    const q = cs[i1], q2 = cs[i2];
    let edge = (d2 - d1) / (2 * Math.hypot(q.x - q2.x, q.y - q2.y));
    const dx = px - q.x, dy = py - q.y, lx = dx * q.c + dy * q.s, ly = -dx * q.s + dy * q.c;
    const m = q.m;
    if (m === 0) {
      const r = Math.max(Math.abs(lx) / q.a, Math.abs(ly) / q.b);
      if (r > 1) return { m: 1, q, edge: Math.min(edge, (r - 1) * q.b), lx, ly, i: i1 + 500 };
      edge = Math.min(edge, (1 - r) * q.b);
    }
    return { m, q, edge, lx, ly, i: i1 };
  };
  // 원 안의 비율이 화산암 쪽 바탕과 같도록(밝은 50, 회색 25, 어두운 25) 배치를 고른다
  const statC = () => {
    let n = 0;
    const cnt = [0, 0, 0];
    for (let y = -CR; y < CR; y += 3)
      for (let x = -CR; x < CR; x += 3) {
        if (x * x + y * y > CR * CR) continue;
        n++;
        cnt[ownC(x / PPM, y / PPM).m]++;
      }
    return cnt.map((v) => v / n);
  };
  let bestC = 1, bestCs = 1e9;
  for (let sn = 1; sn <= 60; sn++) {
    makeCs(sn);
    const st = statC();
    const sc = Math.abs(st[0] - 0.5) + Math.abs(st[1] - 0.25) + Math.abs(st[2] - 0.25);
    if (sc < bestCs) {
      bestCs = sc;
      bestC = sn;
    }
  }
  makeCs(bestC);
  if (globalThis.__u2check) {
    let n = 0;
    const cnt = [0, 0, 0];
    for (let y = -CR; y < CR; y += 1.5)
      for (let x = -CR; x < CR; x += 1.5) {
        if (x * x + y * y > CR * CR) continue;
        n++;
        cnt[ownC(x / PPM, y / PPM).m]++;
      }
    console.warn(`coarse: light ${(cnt[0] / n).toFixed(2)} gray ${(cnt[1] / n).toFixed(2)} dark ${(cnt[2] / n).toFixed(2)}`);
  }
  lens(t, C2[0], C2[1], CR, () => {
    P.shade(t, { x: C2[0] - CR, y: C2[1] - CR, w: 2 * CR, h: 2 * CR }, (x, y) => {
      const o = ownC((x - C2[0]) / PPM, (y - C2[1]) / PPM);
      const q = o.q, bw = o.edge * PPM;
      const own2 = o.m === 1 && o.i >= 500;
      const tx = own2 ? hash2(o.i, 1, 2) * 2 - 1 : q.tx, ty = own2 ? hash2(o.i, 2, 3) * 2 - 1 : q.ty;
      const lit = -0.6 * tx - 0.7 * ty;
      let c;
      if (o.m === 0) {
        c = P.mixc(ML, linOf("#C2BBAE"), 0.4 * P.clamp(0.5 + 0.7 * nz.fbm(x * 0.06 + q.k * 9, y * 0.06, 3)));
        const f = 1 + 0.1 * lit;
        c = [c[0] * f, c[1] * f, c[2] * f];
        c = P.mixc(c, linOf("#B3AB9E"), 0.06 * (Math.sin(o.ly * 15) > 0.3 ? 1 : 0));
        const sheen = P.clamp(lit * 1.25 - 0.35);
        if (sheen > 0) c = P.mixc(c, [1, 1, 1], sheen * (0.22 + 0.2 * P.clamp(0.5 - (o.lx / q.a) * 0.35 - (o.ly / q.b) * 0.25)));
      } else if (o.m === 1) {
        const ox = (x - C2[0]) / PPM - q.x, oy = (y - C2[1]) / PPM - q.y;
        c = P.mixc(MG, linOf("#545C66"), 0.8 * P.clamp(0.5 + 0.3 * (ox * 0.55 + oy * 0.65) + 0.12 * nz.n2(x * 0.06, y * 0.06)));
        const f = 1 + 0.08 * lit;
        c = [c[0] * f, c[1] * f, c[2] * f];
        const gl = Math.exp(-((ox + 0.5 * (0.6 + tx * 0.3)) ** 2 + (oy + 0.45 * (0.6 + ty * 0.3)) ** 2) * 40);
        c = P.mixc(c, [1, 1, 1], 0.75 * gl * P.clamp(0.45 + lit));
        c = P.mixc(c, [1, 1, 1], 0.3 * P.smooth(2.2, 0.6, bw) * P.smooth(0.3, 0.9, bw) * P.clamp(0.5 + (ox * -0.6 + oy * -0.7)));
      } else {
        // 어두운 광물: 기둥 모양 결정의 결(가는 줄)과 둔한 광택
        const st = Math.sin(o.ly * 30 + q.k * 5);
        c = P.mixc(MD, linOf(q.k < 0.35 ? "#2E3427" : q.k < 0.7 ? "#3A2E26" : "#3A3A36"), 0.55 + 0.3 * P.clamp(0.5 + nz.n2(x * 0.1, y * 0.1)));
        c = P.mixc(c, linOf("#6A685C"), 0.3 * P.smooth(0.7, 1, st));
        c = P.mixc(c, linOf("#9A9278"), 0.3 * P.clamp(lit * 0.8) * Math.exp(-((o.lx / q.a - (q.k - 0.5)) ** 2) * 2));
      }
      c = P.mixc(c, linOf("#3D3833"), 0.45 * P.smooth(1.0, 0.1, bw));
      c = P.mixc(c, [1, 1, 1], (o.m === 0 ? 0.1 : 0.04) * P.smooth(2.6, 1.0, bw) * P.smooth(0.7, 1.5, bw));
      return out(c);
    });
  });
  // 1 mm 막대(두 원 같은 자리, 같은 길이)
  const s = S.svgLayer(root, w, h);
  for (const C of [C1, C2]) {
    const bx = C[0] - PPM / 2, by = C[1] + CR - 13;
    S.el(s, "rect", { x: bx - 18, y: by - 9, width: PPM + 36 + 16, height: 13, rx: 6.5, fill: "rgba(255,255,255,.88)" });
    S.el(s, "rect", { x: bx - 12, y: by - 4.4, width: PPM, height: 3.6, fill: "#26303D" });
    S.label(s, bx + PPM - 8, by + 1.2, "1 mm", { size: 13.5, weight: 700, halo: false, anchor: "start" });
  }

  // ── 라벨 ──
  S.label(s, 14, GY - 4, "지표", { size: 14, anchor: "start" });
  S.leader(s, [[150, 66], [138, 66], [126, flowTop(126) + 0.8]]);
  S.label(s, 154, 71, "용암", { size: 14 });
  S.leader(s, [[52, 274], [62, 274], [BODY.cx - 30, BODY.cy - 6]]);
  S.label(s, 48, 279, "마그마", { size: 14, anchor: "end" });
  S.label(s, 106, 377, "지하 깊은 곳", { size: 14, anchor: "middle" });
  // 원 둘레의 말
  S.label(s, C1[0], 34, "빨리 식음,", { size: 13.5, anchor: "middle" });
  S.label(s, C1[0], 51, "결정이 작음", { size: 13.5, anchor: "middle" });
  S.label(s, C1[0], C1[1] + CR + 20, "화산암", { size: 14, anchor: "middle", color: "#1B3A5C" });
  S.label(s, C1[0], C1[1] + CR + 37, "(현무암, 유문암)", { size: 13.5, anchor: "middle", weight: 600, color: "#4E5968" });
  S.label(s, C2[0], C2[1] - CR - 25, "천천히 식음,", { size: 13.5, anchor: "middle" });
  S.label(s, C2[0], C2[1] - CR - 8, "결정이 큼", { size: 13.5, anchor: "middle" });
  S.label(s, C2[0], C2[1] + CR + 20, "심성암", { size: 14, anchor: "middle", color: "#1B3A5C" });
  S.label(s, C2[0], C2[1] + CR + 37, "(반려암, 화강암)", { size: 13.5, anchor: "middle", weight: 600, color: "#4E5968" });
  void smoothPath;
}
