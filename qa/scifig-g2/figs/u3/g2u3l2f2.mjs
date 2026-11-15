// g2u3l2f2 물속 빨대가 꺾여 보이는 까닭: 물이 든 유리컵을 옆에서 자른 단면. 곧은 빨대의 물속 세 점(끝, 가운데, 수면 가까이)에서
// 눈동자 위아래 끝으로 가는 빛 두 줄기씩을 스넬 법칙(물 1.33)으로 계산하고, 눈에 든 두 줄기를 거슬러 이은 선이 만나는 점(겉보기 점)을 구한다.
// 흐린 빨대는 물속 빨대의 모든 점에서 같은 방법으로 구한 겉보기 점을 이은 것이다. 검산 메모는 g2u3l2f2.md
import { D2R, AMBER, CYAN, GRAY_INK, N_WATER, arcWedge, dashLine, vHead } from "./_lib.mjs";

export const meta = {
  key: "g2u3l2f2",
  w: 340,
  h: 404,
  alt: "물이 든 유리컵에 곧은 빨대가 비스듬히 꽂혀 있어요. 물속 빨대의 세 점에서 나온 빛은 수면에서 법선에서 멀어지는 쪽으로 꺾여 오른쪽 위의 눈에 들어가요. 눈에 든 빛을 곧게 거슬러 이은 점선은 실제보다 위의 점에서 만나고, 그 점들을 이은 흐린 빨대가 수면에서 꺾여 보여요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(23);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.012 });

  // ── 장면 수치 ──
  const WS = 222; // 수면
  const RIM = 200; // 컵 입구(안쪽 벽 꼭대기)
  const IB = 372; // 컵 안쪽 바닥
  const GL = 22, GR = 238; // 안쪽 벽
  const WALL = 8, BASE = 15;
  const SR = 4.6; // 빨대 반지름
  const ALPHA = 48; // 빨대가 연직선과 이루는 각
  // 빨대가 수면을 뚫는 점: 빨대 아랫면이 오른쪽 벽 입구 모서리(GR, RIM)에 얹히게 정한다
  const Q = [GR - (SR - (RIM - WS) * Math.sin(ALPHA * D2R)) / Math.cos(ALPHA * D2R), WS];
  const uD = [-Math.sin(ALPHA * D2R), Math.cos(ALPHA * D2R)]; // Q → 물속 끝
  const uU = [-uD[0], -uD[1]];
  const LS = (IB - SR - 1 - WS) / uD[1]; // 끝이 바닥에 닿는 길이
  const at = (s) => [Q[0] + uD[0] * s, Q[1] + uD[1] * s]; // 물속 빨대 위의 점(s = Q에서 거리)
  const tipP = at(LS);
  const topP = [Q[0] + uU[0] * 106, Q[1] + uU[1] * 106];

  // 눈: 시선은 수면의 빛이 나오는 곳을 향한다
  const E = [300, 50];
  const gz = (() => {
    const d = [168 - E[0], WS - E[1]];
    const l = Math.hypot(d[0], d[1]);
    return [d[0] / l, d[1] / l];
  })();
  const ES = 17; // 눈 반 길이(앞에서 본 아몬드 꼴, 홍채가 물 쪽을 본다)
  const IRIS = [gz[0] * ES * 0.3, gz[1] * ES * 0.16];
  const pupC = [E[0] + IRIS[0], E[1] + IRIS[1]];
  const nrm = [-gz[1], gz[0]];
  const PUP = 4.2; // 눈동자 반지름(두 줄기가 닿는 위아래 끝)
  const T1 = [pupC[0] + nrm[0] * PUP, pupC[1] + nrm[1] * PUP];
  const T2 = [pupC[0] - nrm[0] * PUP, pupC[1] - nrm[1] * PUP];

  // 빛길 계산: 물속 점 Pw에서 수면의 한 점을 지나 눈의 점 T로. 스넬 sin(공기 쪽 각) = 1.33 sin(물 쪽 각)을 이분법으로 푼다.
  const exitX = (Pw, T) => {
    let lo = Math.min(Pw[0], T[0]), hi = Math.max(Pw[0], T[0]);
    for (let i = 0; i < 70; i++) {
      const x = (lo + hi) / 2;
      const sw = (x - Pw[0]) / Math.hypot(x - Pw[0], WS - Pw[1]);
      const sa = (T[0] - x) / Math.hypot(T[0] - x, T[1] - WS);
      if (sa - N_WATER * sw > 0) lo = x;
      else hi = x;
    }
    return (lo + hi) / 2;
  };
  const meet = (a1, a2, b1, b2) => {
    const d1 = [a2[0] - a1[0], a2[1] - a1[1]], d2 = [b2[0] - b1[0], b2[1] - b1[1]];
    const den = d1[0] * d2[1] - d1[1] * d2[0];
    const k = ((b1[0] - a1[0]) * d2[1] - (b1[1] - a1[1]) * d2[0]) / den;
    return [a1[0] + k * d1[0], a1[1] + k * d1[1]];
  };
  const trace = (Pw) => {
    const S1 = [exitX(Pw, T1), WS], S2 = [exitX(Pw, T2), WS];
    return { Pw, S1, S2, A: meet(T1, S1, T2, S2) };
  };
  const picks = [LS - 0.5, LS * 0.56, LS * 0.2].map((s) => trace(at(s))); // 끝, 가운데, 수면 가까이
  const ghost = [];
  for (let s = 2; s <= LS; s += 3) ghost.push(trace(at(s)).A);
  ghost.unshift([...Q]);
  ghost.push(picks[0].A);
  window.__straw = { picks, Q, tipP, E, ghostEnd: picks[0].A };

  // ── 바닥 그림자 ──
  P.softShadow(t, (GL + GR) / 2, IB + BASE + 3, 138, 10, 0.2);

  // ── 물 ──
  ctx.save();
  ctx.beginPath();
  ctx.rect(GL, WS, GR - GL, IB - WS);
  ctx.clip();
  ctx.fillStyle = P.lg(ctx, 0, WS, 0, IB, [[0, "#DCF0FC"], [0.4, "#C3E3F7"], [1, "#98CBEE"]]);
  ctx.fillRect(GL, WS, GR - GL, IB - WS);
  P.shade(t, { x: GL, y: WS, w: GR - GL, h: IB - WS }, (x, y) => {
    const n = nz.fbm(x * 0.03, y * 0.07, 3);
    const v = n > 0 ? 255 : 40;
    return [v, v, 255, Math.abs(n) * 0.07];
  });
  ctx.restore();

  // ── 빨대(실제): 원통 음영, 빛은 왼쪽 위 ──
  const strawSeg = (a, b, o = {}) => {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    ctx.save();
    ctx.translate(a[0], a[1]);
    ctx.rotate(ang);
    // 옆면 법선 +y가 화면에서 어디를 보는지: 빛(왼쪽 위)을 보는 쪽을 밝게
    const ny = [-Math.sin(ang), Math.cos(ang)];
    const litPlus = ny[0] * -0.63 + ny[1] * -0.77 > 0;
    const g = ctx.createLinearGradient(0, litPlus ? SR : -SR, 0, litPlus ? -SR : SR);
    g.addColorStop(0, o.c0 ?? "#FF9C93");
    g.addColorStop(0.28, o.c1 ?? "#F5655C");
    g.addColorStop(0.72, o.c2 ?? "#D23F3B");
    g.addColorStop(1, o.c3 ?? "#9E2A2C");
    ctx.globalAlpha = o.alpha ?? 1;
    ctx.fillStyle = g;
    ctx.fillRect(0, -SR, L, SR * 2);
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fillRect(0, litPlus ? SR * 0.35 : -SR * 0.62, L, SR * 0.26);
    ctx.restore();
  };
  strawSeg(tipP, topP);
  // 빨대 위 끝(열린 구멍)과 바닥 끝
  {
    const ang = Math.atan2(uU[1], uU[0]);
    ctx.save();
    ctx.translate(topP[0], topP[1]);
    ctx.rotate(ang);
    ctx.fillStyle = "#B8302F";
    ctx.beginPath();
    ctx.ellipse(0, 0, 1.9, SR, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5E1517";
    ctx.beginPath();
    ctx.ellipse(0.2, 0, 1.2, SR * 0.68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // 물에 잠긴 부분은 물빛이 덮는다
  {
    ctx.save();
    ctx.beginPath();
    ctx.rect(GL, WS, GR - GL, IB - WS);
    ctx.clip();
    ctx.translate(Q[0], Q[1]);
    ctx.rotate(Math.atan2(uD[1], uD[0]));
    ctx.fillStyle = "rgba(160,212,244,.34)";
    ctx.fillRect(-2, -SR - 0.5, LS + 4, SR * 2 + 1);
    ctx.restore();
  }

  // ── 수면: 밝은 띠, 벽에 붙은 살짝 올라간 물 ──
  ctx.save();
  ctx.fillStyle = P.lg(ctx, 0, WS - 1, 0, WS + 6, [[0, "rgba(255,255,255,.95)"], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(GL, WS - 1, GR - GL, 7);
  ctx.strokeStyle = "rgba(48,118,170,.7)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(GL, WS - 3.2);
  ctx.quadraticCurveTo(GL + 3, WS, GL + 9, WS);
  ctx.lineTo(GR - 9, WS);
  ctx.quadraticCurveTo(GR - 3, WS, GR, WS - 3.2);
  ctx.stroke();
  ctx.restore();

  // ── 유리컵(자른 면): 두 벽과 두꺼운 바닥, 유리 단면의 옅은 청록, 왼쪽 위 빛의 반짝임 ──
  const glassFace = (x, y, ww, hh, r, vertical) => {
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, x, y, ww, hh, r);
    ctx.fillStyle = vertical
      ? P.lg(ctx, x, 0, x + ww, 0, [[0, "rgba(214,240,246,.62)"], [0.32, "rgba(255,255,255,.82)"], [0.7, "rgba(222,243,248,.6)"], [1, "rgba(168,210,222,.78)"]])
      : P.lg(ctx, 0, y, 0, y + hh, [[0, "rgba(236,249,252,.86)"], [0.55, "rgba(206,236,243,.82)"], [1, "rgba(150,198,214,.9)"]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(92,146,166,.6)";
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.restore();
  };
  glassFace(GL - WALL, RIM - 2, WALL, IB - RIM + 3, 3.8, true);
  glassFace(GR, RIM - 2, WALL, IB - RIM + 3, 3.8, true);
  glassFace(GL - WALL, IB, GR - GL + 2 * WALL, BASE, 5, false);
  // 반짝임: 벽의 세로 줄, 입구의 둥근 테, 두꺼운 바닥의 밝은 결
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,.95)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(GL - WALL + 2.6, RIM + 8);
  ctx.lineTo(GL - WALL + 2.6, IB - 14);
  ctx.moveTo(GR + 2.6, RIM + 8);
  ctx.lineTo(GR + 2.6, RIM + 64);
  ctx.moveTo(GR + 2.6, RIM + 84);
  ctx.lineTo(GR + 2.6, RIM + 96);
  ctx.moveTo(GL + 8, IB + 4);
  ctx.lineTo(GL + 96, IB + 4);
  ctx.stroke();
  ctx.strokeStyle = "rgba(98,150,170,.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(GL - WALL + 3, IB + BASE - 2.2);
  ctx.lineTo(GR + WALL - 3, IB + BASE - 2.2);
  ctx.stroke();
  for (const x of [GL - WALL / 2, GR + WALL / 2]) {
    ctx.fillStyle = P.rg(ctx, x - 1.2, RIM - 1.8, 0.3, x, RIM - 0.5, 4.2, [[0, "rgba(255,255,255,1)"], [1, "rgba(255,255,255,0)"]]);
    ctx.beginPath();
    ctx.arc(x, RIM - 0.5, 4.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // ── 흐린 빨대(눈에 보이는 자리): 계산한 겉보기 점을 잇는다 ──
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const gpath = () => {
    ctx.beginPath();
    ghost.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  };
  ctx.strokeStyle = "rgba(242,95,92,.40)";
  ctx.lineWidth = SR * 2;
  gpath();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.45)";
  ctx.lineWidth = 1;
  gpath();
  ctx.stroke();
  ctx.restore();

  // ── 빛(초록): 물속 점 → 수면 → 눈 ──
  const ray = (pts, a = 0.95) => {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(88,240,150,${0.28 * a})`;
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.stroke();
    ctx.strokeStyle = `rgba(20,170,86,${a})`;
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.restore();
  };
  for (const k of picks) {
    ray([k.Pw, k.S1, T1]);
    ray([k.Pw, k.S2, T2]);
  }

  // ── 눈: 앞에서 본 아몬드 꼴, 홍채와 눈동자가 물 쪽(왼쪽 아래)을 본다 ──
  {
    const s = ES;
    const almond = (c) => {
      c.moveTo(E[0] - s, E[1]);
      c.quadraticCurveTo(E[0] - s * 0.1, E[1] - s * 0.95, E[0] + s, E[1] - s * 0.04);
      c.quadraticCurveTo(E[0] + s * 0.05, E[1] + s * 0.78, E[0] - s, E[1]);
    };
    P.dropShadow(t, (c) => almond(c), { dx: 1.2, dy: 2.5, blur: 5, a: 0.16 });
    ctx.save();
    // 쌍꺼풀 주름
    ctx.strokeStyle = "rgba(150,96,78,.5)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(E[0] - s * 0.86, E[1] - s * 0.34);
    ctx.quadraticCurveTo(E[0] - s * 0.05, E[1] - s * 1.22, E[0] + s * 0.9, E[1] - s * 0.3);
    ctx.stroke();
    ctx.beginPath();
    almond(ctx);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, 0, E[1] - s * 0.6, 0, E[1] + s * 0.5, [[0, "#FFFFFF"], [1, "#D9E2EC"]]);
    ctx.fill();
    ctx.save();
    ctx.clip();
    const ix = pupC[0], iy = pupC[1];
    const ir = ctx.createRadialGradient(ix - 2, iy - 2, 0.5, ix, iy, s * 0.46);
    ir.addColorStop(0, "#A0703F");
    ir.addColorStop(0.7, "#5E3A20");
    ir.addColorStop(1, "#3A2414");
    ctx.fillStyle = ir;
    ctx.beginPath();
    ctx.arc(ix, iy, s * 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#110C0A";
    ctx.beginPath();
    ctx.arc(ix, iy, PUP + 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.beginPath();
    ctx.arc(ix + 2.2, iy - 2.6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // 윗눈꺼풀 그늘
    ctx.fillStyle = P.lg(ctx, 0, E[1] - s * 0.7, 0, E[1] - s * 0.15, [[0, "rgba(90,60,50,.28)"], [1, "rgba(90,60,50,0)"]]);
    ctx.fillRect(E[0] - s, E[1] - s, s * 2, s);
    ctx.restore();
    // 눈매(윗선은 짙게, 아랫선은 옅게)
    ctx.lineCap = "round";
    ctx.strokeStyle = "#3D2620";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(E[0] - s, E[1]);
    ctx.quadraticCurveTo(E[0] - s * 0.1, E[1] - s * 0.95, E[0] + s, E[1] - s * 0.04);
    ctx.stroke();
    ctx.strokeStyle = "rgba(61,38,32,.55)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(E[0] + s, E[1] - s * 0.04);
    ctx.quadraticCurveTo(E[0] + s * 0.05, E[1] + s * 0.78, E[0] - s, E[1]);
    ctx.stroke();
    // 속눈썹
    ctx.strokeStyle = "#3D2620";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (const [u, len, tilt] of [[0.18, 5, -0.5], [0.42, 5.5, -0.2], [0.66, 5.5, 0.15], [0.86, 5, 0.45]]) {
      const x = E[0] - s + 2 * s * u;
      const tq = u;
      const y = (1 - tq) * (1 - tq) * E[1] + 2 * (1 - tq) * tq * (E[1] - s * 0.95) + tq * tq * (E[1] - s * 0.04);
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.sin(tilt) * len, y - Math.cos(tilt) * len);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ── 겹층 ──
  const sv = S.svgLayer(root, w, h);
  // 눈이 느끼는 빛의 길: 눈에 든 빛을 곧게 거슬러 수면 아래로(겉보기 점까지)
  for (const k of picks) {
    for (const Sx of [k.S1, k.S2]) dashLine(S, sv, Sx, k.A, { color: "#56657A", w: 1.15, dash: "4 3" });
  }
  // 세 점: 실제 점(진한 점)과 겉보기 점(속 빈 점)
  for (const k of picks) {
    S.el(sv, "circle", { cx: k.Pw[0], cy: k.Pw[1], r: 2.6, fill: "#7A1F21", stroke: "#fff", "stroke-width": 1 });
    S.el(sv, "circle", { cx: k.A[0], cy: k.A[1], r: 2.8, fill: "#fff", stroke: "#56657A", "stroke-width": 1.3 });
  }
  // 화살촉: 빛은 빨대에서 눈으로
  for (const k of picks) {
    const a = k.Pw, b = k.S1;
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const m = [a[0] + (b[0] - a[0]) * 0.58, a[1] + (b[1] - a[1]) * 0.58];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 30) vHead(S, sv, m[0], m[1], ang, 8);
    const c = T1;
    const ang2 = Math.atan2(c[1] - b[1], c[0] - b[0]);
    const m2 = [b[0] + (c[0] - b[0]) * 0.5, b[1] + (c[1] - b[1]) * 0.5];
    vHead(S, sv, m2[0], m2[1], ang2, 8);
  }
  // 꺾이는 점 하나(가운데 점의 빛)에 법선과 두 각
  {
    const k = picks[1];
    const Sx = k.S1;
    dashLine(S, sv, [Sx[0], Sx[1] - 62], [Sx[0], Sx[1] + 34], { w: 1.3 });
    const aw = (Math.atan2(k.Pw[1] - Sx[1], k.Pw[0] - Sx[0]) * 180) / Math.PI; // 물속 빛의 방향(아래 왼쪽)
    const aa = (Math.atan2(T1[1] - Sx[1], T1[0] - Sx[0]) * 180) / Math.PI; // 공기 중 빛의 방향(위 오른쪽)
    arcWedge(S, sv, Sx, 21, 90, aw, AMBER, { w: 2 });
    arcWedge(S, sv, Sx, 21, aa, -90, CYAN, { w: 2, dark: "#0B5E8E" });
    S.label(sv, Sx[0], Sx[1] - 68, "법선", { anchor: "middle", size: 13.5 });
  }

  // 글자
  S.label(sv, 16, 30, "공기", { size: 14 });
  S.label(sv, E[0], E[1] - 22, "눈", { anchor: "middle", size: 14 });
  S.label(sv, GR - 8, IB - 12, "물", { anchor: "end", size: 14, color: "#1B4F78" });
  S.label(sv, 254, WS + 5, "수면", { size: 14 });
  S.leader(sv, [[252, WS + 0.5], [GR - 6, WS + 0.5]]);
  // 실제 빨대
  {
    const p = at(LS * 0.42);
    S.leader(sv, [[252, 300], [p[0] + 2, p[1] + 4]]);
    S.label(sv, 254, 305, "실제 빨대", { size: 14 });
  }
  // 눈에 보이는 빨대
  {
    const p = ghost[Math.round(ghost.length * 0.9)];
    S.leader(sv, [[34, 156], [p[0] - 2, p[1] - 3]]);
    S.label(sv, 16, 150, "눈에 보이는 빨대", { size: 14 });
  }
  // 꺾여 들어온 빛
  {
    const k = picks[0];
    const y = 120;
    const f = (y - k.S1[1]) / (T1[1] - k.S1[1]);
    const x = k.S1[0] + (T1[0] - k.S1[0]) * f;
    S.leader(sv, [[x - 40, y - 6], [x - 1, y]]);
    S.label(sv, x - 42, y - 10, "꺾여 들어온 빛", { anchor: "end", size: 14 });
  }
  // 눈이 느끼는 빛의 길(점선)
  {
    const k = picks[0];
    const m = [k.S1[0] + (k.A[0] - k.S1[0]) * 0.42, k.S1[1] + (k.A[1] - k.S1[1]) * 0.42];
    S.leader(sv, [[96, 206], [m[0] - 1, m[1] - 1]]);
    S.label(sv, 66, 182, "눈이 느끼는", { size: 13.5 });
    S.label(sv, 66, 198, "빛의 길(점선)", { size: 13.5 });
  }
}
