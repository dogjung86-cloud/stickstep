// g2u6l5f2 콩팥의 세로 단면과 콩팥단위 하나.
// ① 콩팥을 세로로 반 가른 면: 바깥 띠의 콩팥겉질(오톨도톨), 줄무늬 진 원뿔 덩이의 콩팥속질(단면에 8개), 원뿔 끝을 받는 작은 깔때기가
//    모인 콩팥깔때기와 오줌관, 오목한 곳으로 드나드는 콩팥동맥(빨강)과 콩팥정맥(파랑), 원뿔 사이로 갈라져 경계에서 활처럼 휘는 혈관.
// ② 콩팥단위 하나(수백 배 확대): 겉질의 토리와 보먼주머니(앞쪽을 잘라 속이 보이게), 꼬불꼬불하다가 속질로 내려갔다 올라오는 세뇨관,
//    토리로 들어가고 나오는 가는 혈관, 나온 혈관이 세뇨관을 감싸는 모세혈관 그물. 오줌길은 노랑. 검산 메모는 g2u6l5f2.md
import * as L from "./_lib.mjs";

export const meta = {
  key: "g2u6l5f2",
  w: 340,
  h: 414,
  alt: "콩팥을 세로로 자른 면. 바깥 띠의 콩팥겉질, 줄무늬 진 원뿔 모양의 콩팥속질, 가운데의 콩팥깔때기와 오줌관, 콩팥동맥과 콩팥정맥이 보이고, 아래에는 토리와 보먼주머니에서 시작한 세뇨관이 속질로 내려갔다 올라오며 모세혈관 그물에 감싸인 콩팥단위가 있어요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(91);
  const rnd = N.rng(17);
  const R = (a, b) => a + (b - a) * rnd();
  const D2R = Math.PI / 180;

  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  const RED = "#E2404E", BLUE = "#4E6FD6";
  const ART = { edge: "#9A2230", base: RED, mid: "#F27A84", hi: "#FFD7DA", edgeW: 0.9 };
  const VEN = { edge: "#2E4592", base: BLUE, mid: "#7F97E6", hi: "#D5DEFA", edgeW: 0.9 };
  const URI = { edge: "#A7822E", base: "#E8C86E", mid: "#F5E0A0", hi: "#FFFAE6", edgeW: 0.9 };
  const BOUND = "#D9480F"; // 겉질과 속질의 경계(두 칸에서 같은 색)

  // ═════ ① 콩팥의 세로 단면: 15 px = 1 cm, 콩팥문이 오른쪽 ═════
  const k = 15, KX = 116, KY = 104;
  const Q = (lx, ly) => [KX + lx * k, KY + ly * k];
  const a = 5.5, b = 3.05;
  const outL = [];
  for (let i = 0; i < 120; i++) {
    const th = (i / 120) * L.TAU;
    let lx = b * Math.cos(th);
    const ly = a * Math.sin(th);
    const inner = Math.max(0, Math.cos(th));
    lx -= 1.65 * Math.exp(-((Math.sin(th) / 0.3) ** 2)) * inner * inner;
    lx *= 1 - 0.04 * Math.sin(th);
    outL.push([lx, ly]);
  }
  const outS = outL.map(([x, y]) => Q(x, y));
  // 겉질 깊이는 콩팥문의 오목한 곳을 뺀 볼록한 겉선에서 잰다
  const hullL = [];
  for (let i = 0; i < 120; i++) {
    const th = (i / 120) * L.TAU;
    hullL.push([b * Math.cos(th) * (1 - 0.04 * Math.sin(th)), a * Math.sin(th)]);
  }
  const distOut = (lx, ly) => {
    let m = 1e9;
    for (let i = 0, j = hullL.length - 1; i < hullL.length; j = i++) {
      const [ax, ay] = hullL[j], [bx, by] = hullL[i];
      const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
      const u = P.clamp(((lx - ax) * dx + (ly - ay) * dy) / (l2 || 1));
      m = Math.min(m, Math.hypot(lx - ax - u * dx, ly - ay - u * dy));
    }
    return m;
  };
  const SC = [1.35, 0.1], SRX = 1.45, SRY = 2.6; // 콩팥 가운데 빈자리(깔때기와 지방이 있는 곳)
  const CORT = 1.0; // 겉질 두께(cm)
  const rayToCortex = (phi) => {
    // 빈자리 가운데에서 phi 쪽으로 가다가 겉질이 시작하는 곳
    for (let r = 0.5; r < 7; r += 0.02) {
      const lx = SC[0] + Math.cos(phi) * r, ly = SC[1] + Math.sin(phi) * r;
      if (distOut(lx, ly) < CORT) return [lx, ly, r];
    }
    return null;
  };
  const sinusEdge = (phi) => [SC[0] + SRX * Math.cos(phi), SC[1] + SRY * Math.sin(phi)];
  // 원뿔(속질) 8개: 빈자리 둘레에서 바깥쪽으로
  const PHI = [-98, -124, -150, -174, -198, -222, -246, -270].map((d) => d * D2R); // 이어지는 각(±180을 넘지 않게)
  const pyr = PHI.map((phi) => {
    const ap = sinusEdge(phi).map((v, i) => v - (i ? Math.sin(phi) : Math.cos(phi)) * 0.12);
    const base = rayToCortex(phi);
    const half = 0.2; // 바닥의 반각(rad): 원뿔 사이에 겉질 기둥이 보이게
    const c1 = rayToCortex(phi - half), c2 = rayToCortex(phi + half);
    const mid1 = [(ap[0] + c1[0]) / 2 + Math.sin(phi) * 0.1, (ap[1] + c1[1]) / 2 - Math.cos(phi) * 0.1];
    const mid2 = [(ap[0] + c2[0]) / 2 - Math.sin(phi) * 0.1, (ap[1] + c2[1]) / 2 + Math.cos(phi) * 0.1];
    const bOut = rayToCortex(phi);
    const tipL = [ap[0] + Math.cos(phi - 1.2) * 0.22, ap[1] + Math.sin(phi - 1.2) * 0.22];
    const tipR = [ap[0] + Math.cos(phi + 1.2) * 0.22, ap[1] + Math.sin(phi + 1.2) * 0.22];
    const poly = L.spline([ap, tipR, mid2, [c2[0], c2[1]], [bOut[0] + Math.cos(phi) * 0.08, bOut[1] + Math.sin(phi) * 0.08], [c1[0], c1[1]], mid1, tipL].map(([x, y]) => Q(x, y)), true, 8);
    return { phi, ap, base, c1, c2, poly };
  });

  // 반쪽 콩팥의 뒤쪽 겉면(두께): 자른 면 뒤로 비친다
  const back = outS.map(([x, y]) => [x + 3.4, y + 4.4]);
  L.pillow(t, L.bbox(back), (c) => L.poly(c, back), { color: "#9E4440", light: "#D9806F", dark: "#5E2024", blur: 4, relief: 1.1, spec: 0.35, gloss: 30 });
  // 겉질(오톨도톨한 알갱이 = 토리, 안쪽으로 옅은 줄)
  const glSeeds = [];
  for (let i = 0; i < 700; i++) glSeeds.push([R(KX - 60, KX + 60), R(KY - 90, KY + 90)]);
  const glNear = N.makeCells(glSeeds, 10);
  P.shade(t, L.bbox(outS), (x, y) => {
    const lx = (x - KX) / k, ly = (y - KY) / k;
    const dO = distOut(lx, ly);
    const g = glNear(x, y);
    const dot = P.clamp((0.62 - g.d1) * 2.2) * (dO > 0.14 && dO < 0.92 ? 1 : 0);
    const n = nz.fbm(x * 0.12, y * 0.12, 3);
    const ray = 0.5 + 0.5 * Math.sin(Math.atan2(ly - SC[1], lx - SC[0]) * 90 + n * 2);
    const base = [234, 163, 144];
    const m = 0.95 + 0.06 * n - (dO > 0.55 ? 0.05 * ray : 0) - 0.05 * P.smooth(0.25, 0.0, dO);
    const c = P.mixc(base.map((v) => v * m), [172, 58, 66], dot * 0.9);
    return [c[0], c[1], c[2], 1];
  }, { mask: (c) => L.poly(c, outS) });
  // 빈자리의 지방(노란빛, 둥근 덩이 결)
  const sinPts = [];
  for (let i = 0; i < 60; i++) {
    const th = (i / 60) * L.TAU;
    sinPts.push(Q(SC[0] + SRX * Math.cos(th) * (Math.cos(th) > 0 ? 1.25 : 1), SC[1] + SRY * Math.sin(th)));
  }
  const fatSeeds = [];
  for (let i = 0; i < 70; i++) fatSeeds.push([R(KX, KX + 70), R(KY - 45, KY + 45)]);
  const fatNear = N.makeCells(fatSeeds, 14);
  P.shade(t, L.bbox(sinPts), (x, y) => {
    const f = fatNear(x, y);
    const edge = P.smooth(1.2, 0.2, f.d2 - f.d1);
    const shadeIn = 1 - 0.12 * P.clamp(f.d1 / 9);
    return [246 * shadeIn - 30 * edge, 222 * shadeIn - 40 * edge, 158 * shadeIn - 40 * edge, 1];
  }, { mask: (c) => { L.poly(c, sinPts); } });

  // 작은 깔때기(원뿔 끝을 받는 컵) → 큰 깔때기 → 콩팥깔때기 → 오줌관
  const PEL = Q(2.35, 0.75);
  const calTubes = [];
  pyr.forEach((p, i) => {
    const cup = Q(p.ap[0] - Math.cos(p.phi) * 0.18, p.ap[1] - Math.sin(p.phi) * 0.18);
    const hub = i < 4 ? Q(1.75, -1.2) : Q(1.7, 1.75);
    calTubes.push({ pts: L.spline([cup, [(cup[0] + hub[0]) / 2, (cup[1] + hub[1]) / 2], hub], false, 5), w: 0.36 * k });
  });
  calTubes.push({ pts: L.spline([Q(1.75, -1.2), Q(2.15, -0.3), PEL], false, 5), w: 0.62 * k });
  calTubes.push({ pts: L.spline([Q(1.7, 1.75), Q(2.1, 1.3), PEL], false, 5), w: 0.62 * k });
  // 정맥(뒤), 동맥(앞): 콩팥문에서 세 갈래 → 빈자리 가장자리에서 원뿔 사이 기둥으로(사이 혈관) → 원뿔 바닥을 따라 활처럼(활 모양 혈관)
  const veinSegs = [], artSegs = [];
  const colPhi = [PHI[0] + 0.42];
  for (let i = 0; i < PHI.length - 1; i++) colPhi.push((PHI[i] + PHI[i + 1]) / 2);
  colPhi.push(PHI[PHI.length - 1] - 0.42);
  const HUBS = { up: [1.6, -1.7], mid: [0.75, 0.15], lo: [1.55, 1.85] };
  const hubOf = (phi) => (phi > -140 * D2R ? "up" : phi > -232 * D2R ? "mid" : "lo");
  const tree = (list, entry, off, wS) => {
    for (const key of ["up", "mid", "lo"]) {
      const hb = HUBS[key];
      list.push({ pts: L.spline([Q(entry[0], entry[1]), Q((entry[0] + hb[0]) / 2 + 0.15, (entry[1] + hb[1]) / 2 + off * 4), Q(hb[0], hb[1] + off * 4)], false, 6), w: 0.15 * k * wS });
    }
    for (const phi0 of colPhi) {
      const phi = phi0 + off;
      const hb = HUBS[hubOf(phi0)];
      const e = sinusEdge(phi).map((v, i) => v - (i ? Math.sin(phi) : Math.cos(phi)) * 0.05);
      const c0 = rayToCortex(phi);
      if (!c0) continue;
      list.push({ pts: L.spline([Q(hb[0], hb[1] + off * 4), Q((hb[0] + e[0]) / 2, (hb[1] + e[1]) / 2), Q(e[0], e[1])], false, 6), w: 0.1 * k * wS });
      list.push({ pts: L.spline([Q(e[0], e[1]), Q(c0[0] - Math.cos(phi) * 0.12, c0[1] - Math.sin(phi) * 0.12)], false, 4), w: 0.085 * k * wS });
      for (const sg of [-1, 1]) {
        const arc = [];
        for (let q = 0; q <= 4; q++) {
          const pp = rayToCortex(phi + sg * q * 0.03);
          if (pp) arc.push(Q(pp[0] - Math.cos(phi + sg * q * 0.03) * 0.12, pp[1] - Math.sin(phi + sg * q * 0.03) * 0.12));
        }
        if (arc.length > 2) list.push({ pts: arc, w: 0.062 * k * wS });
      }
    }
  };
  tree(veinSegs, [2.55, 0.05], 0.05, 1.15);
  tree(artSegs, [2.5, -0.55], -0.04, 1.0);
  L.tubes(t, calTubes, URI);
  // 원뿔(속질): 바닥 쪽은 짙은 붉은빛, 끝(유두) 쪽은 옅게, 끝으로 모이는 줄무늬
  for (const p of pyr) {
    const A = Q(p.ap[0], p.ap[1]), B = Q(p.base[0], p.base[1]);
    const ax = (B[0] - A[0]), ay = (B[1] - A[1]), al = Math.hypot(ax, ay);
    P.shade(t, L.bbox(p.poly, 1), (x, y) => {
      const vx = x - A[0], vy = y - A[1];
      const along = (vx * ax + vy * ay) / (al * al);
      const across = (vx * ay - vy * ax) / al;
      const ang = Math.atan2(across, Math.max(0.5, along * al));
      const stripe = 0.5 + 0.5 * Math.sin(ang * 95 + nz.n2(x * 0.2, y * 0.2) * 1.4);
      const deep = P.clamp(along);
      const dark = [150, 50, 70], light = [214, 128, 134], tip = [226, 170, 160];
      const bc = P.mixc(tip, P.mixc(light, dark, 0.55), P.smooth(0.0, 0.55, deep));
      const c = P.mixc(bc, dark, 0.28 * stripe * P.smooth(0.05, 0.4, deep));
      return [c[0], c[1], c[2], 1];
    }, { mask: (c) => L.poly(c, p.poly) });
    ctx.save();
    ctx.strokeStyle = "rgba(110,30,50,.45)";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    L.poly(ctx, p.poly);
    ctx.stroke();
    ctx.restore();
  }
  // 작은 깔때기의 컵: 원뿔 끝(유두)을 감싸는 U자 벽
  for (const p of pyr) {
    const c0 = Q(p.ap[0] - Math.cos(p.phi) * 0.06, p.ap[1] - Math.sin(p.phi) * 0.06);
    const back = p.phi + Math.PI;
    for (const [col, lw] of [["#A7822E", 3.6], ["#EED487", 2.4], ["#FFF4CC", 0.9]]) {
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(c0[0], c0[1], 0.34 * k, back - 1.75, back + 1.75);
      ctx.stroke();
      ctx.restore();
    }
  }
  // 콩팥깔때기(작은 깔때기들이 모여 오줌관으로)
  const pel = L.spline([Q(1.7, -0.6), Q(2.45, -0.1), Q(2.95, 0.6), Q(2.9, 1.4), Q(2.5, 1.9), Q(2.0, 1.4), Q(1.75, 0.6)], true, 6);
  L.pillow(t, L.bbox(pel), (c) => L.poly(c, pel), { color: "#E9C76A", light: "#FFF2C4", dark: "#A87D2A", blur: 3.2, relief: 1, spec: 0.35, gloss: 26 });
  L.tubes(t, veinSegs, VEN);
  L.tubes(t, artSegs, ART);
  // 겉막(얇은 막)과 자른 면 가장자리
  ctx.save();
  ctx.lineJoin = "round";
  // 콩팥문의 오목한 곳(빈자리로 열린 곳)은 겉막을 긋지 않는다
  const capsule = [];
  for (let i = 0; i < outS.length; i++) {
    const th = (i / outS.length) * L.TAU;
    if (Math.cos(th) > 0.35 && Math.abs(Math.sin(th)) < 0.5) continue;
    capsule.push(outS[i]);
  }
  const startI = capsule.findIndex((q, i) => i > 0 && Math.hypot(q[0] - capsule[i - 1][0], q[1] - capsule[i - 1][1]) > 10);
  const capRun = startI > 0 ? [...capsule.slice(startI), ...capsule.slice(0, startI)] : capsule;
  ctx.strokeStyle = "rgba(120,40,40,.6)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  L.poly(ctx, capRun, false);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,236,228,.85)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  L.poly(ctx, capRun, false);
  ctx.stroke();
  ctx.restore();
  // 겉질과 속질의 경계(점선, 아래 확대 칸과 같은 색)
  ctx.save();
  ctx.strokeStyle = BOUND;
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 1.1;
  ctx.setLineDash([2.4, 2.2]);
  for (const p of pyr) {
    const arc = [];
    for (let q = -5; q <= 5; q++) {
      const pp = rayToCortex(p.phi + q * 0.042);
      if (pp) arc.push(Q(pp[0], pp[1]));
    }
    ctx.beginPath();
    L.poly(ctx, arc, false);
    ctx.stroke();
  }
  ctx.restore();
  // 콩팥문 밖: 콩팥동맥(위), 콩팥정맥(앞쪽, 조금 아래), 오줌관(아래로)
  const ureter = L.spline([Q(2.75, 1.6), Q(3.5, 2.6), Q(4.6, 3.6), Q(5.3, 4.6), Q(5.5, 6.2)], false, 8);
  L.tubes(t, [{ pts: ureter, w: 0.5 * k }], URI);
  L.tubes(t, [{ pts: L.spline([[KX + 7.6 * k, KY - 1.15 * k], Q(4.4, -0.9), Q(3.1, -0.62), Q(2.5, -0.55)], false, 8), w: 0.48 * k }], ART);
  L.tubes(t, [{ pts: L.spline([Q(2.55, 0.05), Q(3.3, -0.05), Q(4.6, -0.12), [KX + 7.6 * k, KY - 0.1 * k]], false, 8), w: 0.62 * k }], VEN);

  // ═════ ② 콩팥단위 하나(아래 칸) ═════
  const PX = 8, PY = 222, PW = 324, PH = 184;
  const BY = PY + 100; // 겉질과 속질의 경계
  // 확대 자리 표시(겉질과 속질에 걸친 곳)와 통로
  const mk = pyr[4];
  const mkC = Q((mk.base[0] + mk.c2[0]) / 2 + 0.15, (mk.base[1] + mk.c2[1]) / 2 + 0.2);
  ctx.save();
  ctx.fillStyle = P.lg(ctx, mkC[0], mkC[1], mkC[0], PY, [[0, "rgba(120,135,160,.2)"], [1, "rgba(120,135,160,.05)"]]);
  ctx.beginPath();
  ctx.moveTo(mkC[0] - 6, mkC[1] + 4);
  ctx.lineTo(PX + 14, PY + 2);
  ctx.lineTo(PX + 210, PY + 2);
  ctx.lineTo(mkC[0] + 6, mkC[1] + 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(110,125,150,.6)";
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(mkC[0] - 6, mkC[1] + 4);
  ctx.lineTo(PX + 14, PY + 2);
  ctx.moveTo(mkC[0] + 6, mkC[1] + 4);
  ctx.lineTo(PX + 210, PY + 2);
  ctx.stroke();
  ctx.restore();
  // 칸(흰 테 + 회색 선)
  P.dropShadow(t, (c) => P.rrect(c, PX, PY, PW, PH, 14), { dx: 2, dy: 5, blur: 12, a: 0.18 });
  ctx.save();
  ctx.beginPath();
  P.rrect(ctx, PX, PY, PW, PH, 14);
  ctx.clip();
  // 겉질(옅은 분홍, 알갱이)과 속질(옅은 붉은 보라, 세로 결)
  P.shade(t, { x: PX, y: PY, w: PW, h: PH }, (x, y) => {
    const n = nz.fbm(x * 0.05, y * 0.05, 3);
    if (y < BY) return [252 - 4 * n, 234 - 6 * n, 228 - 6 * n, 1];
    const st = 0.5 + 0.5 * Math.sin(x * 0.55 + nz.n2(x * 0.05, y * 0.02) * 3);
    return [244 - 10 * st, 218 - 14 * st, 226 - 10 * st, 1];
  });
  ctx.restore();

  // 콩팥단위 자리(px)
  const G = [76, 268], GR = 15; // 토리
  const vas = [48, 257]; // 혈관이 드나드는 쪽(왼쪽 위)
  const pct = L.spline([[93, 280], [104, 290], [116, 282], [113, 270], [124, 264], [138, 270], [134, 282], [146, 293], [160, 286], [162, 274], [176, 270], [186, 278], [180, 292], [186, 302], [188, 314]], false, 6);
  const desc = L.spline([[188, 314], [188, 346], [189, 374], [191, 389]], false, 6);
  const turn = L.spline([[191, 389], [196, 396], [203, 395], [206, 388]], false, 6);
  const asc = L.spline([[206, 388], [207, 352], [207, 308]], false, 6);
  // 돌아온 세뇨관은 보먼주머니 바깥 곁에서 꺾인다: 꺾임의 중심선이 주머니 가운데 (78, 269)에서 29.8 px 넘게 떨어져
  // 관 바깥 테가 주머니 테(반지름 21 + 테 두께 1.2)보다 3.9 px 밖. 주머니에서 나가는 관은 토리 오른쪽 아래의 하나뿐(pct)
  const dct = L.spline([[207, 308], [205, 294], [196, 286], [198, 274], [212, 267], [218, 258], [206, 252], [186, 254], [170, 258], [156, 254], [140, 250], [122, 252]], false, 6);
  const dct2 = L.spline([[122, 252], [107, 252.5], [100.5, 249.5], [99.5, 245.5], [102, 241], [108, 239.5], [140, 240], [176, 239], [212, 240], [238, 244], [254, 250]], false, 6);
  const cd = L.spline([[258, 249], [264, 262], [266, 300], [267, 350], [268, 398]], false, 6);
  // 혈관: 겉질의 가는 동맥에서 들어오는 혈관(토리로), 나가는 혈관(토리에서) → 세뇨관을 감싸는 모세혈관 그물 → 가는 정맥
  const artIn = L.spline([[PX + 4, 244], [24, 246], [40, 252], [vas[0] + 8, vas[1] + 3], [G[0] - 10, G[1] - 4]], false, 6);
  const artOut = L.spline([[G[0] - 10, G[1] + 3], [vas[0] + 5, vas[1] + 14], [44, 284], [58, 300], [82, 306], [104, 304]], false, 6);
  // 그물: 세뇨관 둘레의 띠 안에서 칸 경계를 혈관으로
  const netRegion = (x, y) => {
    if (y < PY + 6 || y > BY - 2) return false;
    if (x < 86 || x > 256) return false;
    return true;
  };
  const nSeeds = [];
  for (let i = 0; i < 230; i++) nSeeds.push([R(80, 256), R(PY + 4, BY)]);
  const nNear = N.makeCells(nSeeds, 12);
  const cR = P.lin(P.hex(RED)), cB = P.lin(P.hex(BLUE));
  P.shade(t, { x: 80, y: PY + 4, w: 180, h: BY - PY - 2 }, (x, y) => {
    if (!netRegion(x, y)) return null;
    const q = nNear(x, y);
    const e = q.d2 - q.d1;
    if (e > 1.15) return null;
    const u = e / 1.15;
    const nzz = Math.sqrt(Math.max(0, 1 - u * u));
    const f = P.smooth(110, 240, x + (y - 260) * 0.4);
    const col = P.mixc(cR, cB, f);
    const o = P.srgb(col.map((v) => v * (0.62 + 0.5 * nzz)));
    const fadeEdge = P.smooth(80, 96, x) * (1 - P.smooth(BY - 10, BY - 2, y));
    return [o[0], o[1], o[2], P.clamp((1 - u) * 3) * 0.85 * fadeEdge];
  });
  // 속질로 내려가는 곧은 모세혈관(세뇨관 고리 곁)
  const vrD = L.spline([[178, BY - 4], [180, 346], [181, 380], [184, 392]], false, 6);
  const vrU = L.spline([[184, 392], [217, 395], [218, 380], [218, 346], [220, BY - 4]], false, 6);
  L.tubes(t, [{ pts: vrD, w: 1.7 }], { ...ART, edgeW: 0.6, alpha: 0.85 });
  L.tubes(t, [{ pts: vrU, w: 1.7 }], { ...VEN, edgeW: 0.6, alpha: 0.85 });
  // 혈관 줄기
  L.tubes(t, [{ pts: artOut, w: 2.8 }], { ...ART, edgeW: 0.7 });
  L.tubes(t, [{ pts: L.spline([[246, 306], [262, 304], [292, 296], [304, 280], [306, PY + 6]], false, 6), w: 3.4 }], { ...VEN, edgeW: 0.7 });
  // 세뇨관(오줌길, 노랑)
  const tub = [pct, desc, turn, asc, dct, dct2].map((pts) => ({ pts, w: 6.4 }));
  L.tubes(t, tub, URI);
  // 그물 몇 가닥은 세뇨관 위로 지나간다(감싸는 모습)
  ctx.save();
  ctx.lineCap = "round";
  for (const [p0, p1, c1] of [[[118, 270], [128, 284], "#D24A62"], [[160, 260], [170, 278], "#A9548A"], [[196, 260], [204, 278], "#7C5CC4"], [[132, 234], [142, 246], "#C04C6E"], [[226, 236], [236, 248], "#6A64CC"]]) {
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.quadraticCurveTo((p0[0] + p1[0]) / 2 + 4, (p0[1] + p1[1]) / 2, p1[0], p1[1]);
    ctx.stroke();
    ctx.strokeStyle = c1;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.quadraticCurveTo((p0[0] + p1[0]) / 2 + 4, (p0[1] + p1[1]) / 2, p1[0], p1[1]);
    ctx.stroke();
  }
  ctx.restore();
  // 모으는 관(이름 없이): 원뿔 끝을 지나 콩팥깔때기로
  L.tubes(t, [{ pts: cd, w: 7.4 }], { ...URI, base: "#E2BE5C" });
  // 보먼주머니(뒤쪽 반은 비치는 막), 토리(모세혈관이 실뭉치처럼), 보먼주머니 앞쪽은 잘라 낸 테두리만
  L.bubble(t, G[0] + 2, G[1] + 1, 21, "#F1E2B2", { alpha: 0.35, edgeAlpha: 0.95, spec: 0.3, gloss: 24, rim: 0.3, ambient: 0.4 });
  L.tubes(t, [{ pts: artIn, w: 3.4 }], { ...ART, edgeW: 0.7 });
  {
    // 토리: 고리 여러 개가 겹친 공
    const loops = [];
    const rr = N.rng(44);
    for (let i = 0; i < 16; i++) {
      const a0 = rr() * L.TAU, rad = GR * (0.35 + rr() * 0.5);
      const cx0 = G[0] + Math.cos(a0) * GR * 0.35, cy0 = G[1] + Math.sin(a0) * GR * 0.35;
      const pts = [];
      for (let q = 0; q <= 10; q++) {
        const th = a0 + (q / 10) * Math.PI * 1.6;
        pts.push([cx0 + Math.cos(th) * rad * 0.62, cy0 + Math.sin(th) * rad * 0.48]);
      }
      loops.push({ pts: L.spline(pts, false, 3), w: 2.5 });
    }
    P.softShadow(t, G[0] + 2, G[1] + 4, GR * 1.05, GR * 0.8, 0.22, "#6A1A2A");
    L.tubes(t, loops, { edge: "#8E1E2E", base: "#D9404F", mid: "#F07C86", hi: "#FFD2D6", edgeW: 0.7 });
  }
  // 보먼주머니 앞쪽 잘린 테(두 겹 막의 단면)
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "#B99543";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(G[0] + 2, G[1] + 1, 21, -0.55 * Math.PI, 0.78 * Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "#F7E7B4";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(G[0] + 2, G[1] + 1, 21, -0.55 * Math.PI, 0.78 * Math.PI);
  ctx.stroke();
  ctx.restore();
  // 콩팥단위 묶음 표시(점선 테)
  ctx.save();
  ctx.setLineDash([3.5, 3]);
  ctx.strokeStyle = "rgba(70,85,105,.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  P.rrect(ctx, 44, PY + 10, 206, PH - 16, 12);
  ctx.stroke();
  ctx.restore();
  // 칸 테두리
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  P.rrect(ctx, PX, PY, PW, PH, 14);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "#A9B3C1";
  ctx.beginPath();
  P.rrect(ctx, PX - 2.4, PY - 2.4, PW + 4.8, PH + 4.8, 16);
  ctx.stroke();
  ctx.restore();
  // 경계선(위 칸과 같은 색)
  ctx.save();
  ctx.strokeStyle = BOUND;
  ctx.globalAlpha = 0.75;
  ctx.setLineDash([2.4, 2.2]);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(PX + 4, BY);
  ctx.lineTo(PX + PW - 4, BY);
  ctx.stroke();
  ctx.restore();
  // 위 칸의 확대 자리 표시
  L.marker(ctx, mkC[0], mkC[1], 7);

  // ── 겹층 ──
  const sv = S.svgLayer(root, w, h);
  const lab = (x, y, text, pts, o = {}) => {
    if (pts) S.leader(sv, pts);
    S.label(sv, x, y, text, { size: 14, ...o });
  };
  // ① 단면
  const cortPt = Q(-2.45, -2.9), medPt = pyr[3];
  lab(4, 48, "콩팥겉질", [[38, 54], cortPt]);
  const mp = Q(medPt.ap[0] * 0.45 + medPt.base[0] * 0.55, medPt.ap[1] * 0.45 + medPt.base[1] * 0.55);
  lab(4, 168, "콩팥속질", [[40, 160], mp]);
  lab(336, 76, "콩팥동맥", [[296, 72], [KX + 6.6 * k, KY - 1.12 * k]], { anchor: "end" });
  lab(336, 128, "콩팥정맥", [[296, 122], [KX + 6.4 * k, KY - 0.1 * k]], { anchor: "end" });
  const pelC = Q(2.45, 1.0);
  lab(336, 158, "콩팥깔때기", [[268, 154], [pelC[0] + 2, pelC[1] + 2]], { anchor: "end" });
  lab(336, 200, "오줌관", [[290, 196], [KX + 5.45 * k, KY + 5.5 * k]], { anchor: "end" });
  // ② 콩팥단위
  S.label(sv, 330, PY + 18, "수백 배 확대", { size: 13.5, anchor: "end", color: "#5B6676" });
  S.label(sv, 326, BY - 7, "콩팥겉질", { size: 13.5, anchor: "end", color: "#8A5A50" });
  S.label(sv, 326, BY + 18, "콩팥속질", { size: 13.5, anchor: "end", color: "#8A4A60" });
  lab(54, PY + PH - 12, "콩팥단위", null, { anchor: "start" });
  lab(14, 318, "토리", [[30, 312], [G[0] - 2, G[1] + 5]], { anchor: "start" });
  lab(14, 352, "보먼주머니", [[40, 340], [G[0] - 12, G[1] + 17]], { anchor: "start" });
  lab(118, 352, "세뇨관", [[160, 348], [188, 346]], { anchor: "start" });
  lab(330, PY + 56, "모세혈관", [[288, PY + 52], [244, 270]], { anchor: "end" });
  // 오줌이 가는 쪽
  S.fatArrow(sv, [[268, 380], [268, 404]], { fill: "#F2B705", w0: 2.6, w1: 4.2, head: 7.5, hw: 5.6, sw: 1.1 });
  S.label(sv, 278, 383, "콩팥\n깔때기로", { size: 13.5, anchor: "start", color: "#5B6676", lh: 15.5 });
}
