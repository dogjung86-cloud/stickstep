// g2u2l6f1 암석의 순환이 일어나는 곳: 산에서 바다까지 땅을 세로로 자른 풍경 단면. 다섯 자리(퇴적물, 퇴적암, 변성암, 마그마, 화성암)를
// CycleLab 마디 색의 이름표로 놓고, 큰 고리(굵은 화살표)와 지름길(점선 화살표)을 실제 길대로 잇는다. 깊이와 가로는 실제 비율이 아니다.
// 검산 메모는 g2u2l6f1.md
import { COL, linOf, out, vor } from "./_lib.mjs";

export const meta = {
  key: "g2u2l6f1",
  w: 340,
  h: 416,
  alt: "산에서 바다까지 땅을 자른 단면. 산의 암석이 잘게 부서져 강을 따라 바다에 퇴적물로 쌓이고, 다져지고 굳어 퇴적암이 되고, 더 깊은 곳에서 열과 압력을 받아 변성암이 되고, 녹아 마그마가 되고, 식어서 굳어 화성암이 되고, 지표로 드러나 다시 부서져요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(64);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 풍경 기하 ──
  const F = { x: 6, y: 6, w: 328, h: 384 };
  const YB = F.y + F.h;
  const gs = (x, m, s) => Math.exp(-(((x - m) / s) ** 2));
  const sm = (a, b, x) => P.smooth(a, b, x);
  const SEA = 98, COAST = 226;
  const mtnH = (x) => 58 * gs(x, 104, 40) + 10 * gs(x, 146, 14) + 6 * gs(x, 70, 14); // 산(해수면 위 높이 px)
  const volH = (x) => {
    // 왼쪽 끝 화산: 원뿔과 꼭대기의 분화구
    const v = Math.max(0, 1 - Math.abs(x - 25) / 26) ** 0.9 * 50;
    return v - (x > 20 && x < 30 ? 4 * Math.cos(((x - 25) / 5) * (Math.PI / 2)) : 0);
  };
  const inVolcano = (x, y) => x < 54 && volH(x) > mtnH(x) && y < SEA - 1 - mtnH(x) + 6;
  /** 지표(땅 또는 바다 밑바닥)의 y */
  function ground(x) {
    if (x >= COAST) return SEA + 36 * sm(COAST, 268, x) + 1.2 * nz.n2(x * 0.05, 2);
    const vol = volH(x);
    const top = Math.max(vol, mtnH(x));
    return SEA - 1 - top - 1.4 * nz.fbm(x * 0.09, 3.3, 3) * P.clamp(top / 20) + 1.2 * sm(200, COAST, x);
  }
  const sedBot = (x) => ground(x) + 10 + 0.6 * nz.n2(x * 0.05, 5); // 퇴적물(바다 밑에 수평으로 얇게)
  // 변성암: 산 아래와 산 전체(산은 변성암과 화강암이 드러난 곳), 평야와 바다 아래에서는 퇴적암 밑의 깊은 곳
  const metTop = (x) => 208 + 4 * nz.n2(x * 0.02, 7) - 170 * (1 - sm(150, 196, x));
  const magTop = (x) => 306 + 9 * nz.n2(x * 0.018, 9) + 7 * Math.sin(x * 0.045);
  // 화성암(화강암): 산 아래에서 마그마까지 이어진 덩어리, 산꼭대기 쪽은 지표로 드러났다
  const plutL = (y) => 78 + 12 * sm(80, 300, y) - 4 * gs(y, 150, 50) + 1.6 * nz.n2(y * 0.05, 3);
  const plutR = (y) => 132 - 14 * sm(80, 300, y) + 4 * gs(y, 150, 50) + 1.6 * nz.n2(y * 0.05, 4);
  const inPluton = (x, y) => y > ground(x) - 1 && y < magTop(x) + 4 && x > plutL(y) && x < plutR(y);
  // 화산으로 가는 가는 통로
  const dikeX = (y) => 25 + 2.2 * Math.sin(y * 0.05);

  const L = (h2) => linOf(h2);
  const cSed = L(COL.sedi), cSR = L(COL.sed), cIgn = L(COL.ign), cMet = L(COL.met), cMag = L(COL.mag);
  P.dropShadow(t, (c) => c.rect(F.x, F.y, F.w, F.h), { dx: 2, dy: 4, blur: 10, a: 0.18 });
  P.shade(t, { x: F.x, y: F.y, w: F.w, h: F.h }, (x, y) => {
    const gy = ground(x);
    const n1 = nz.fbm(x * 0.09, y * 0.09, 3);
    // 하늘과 바다
    if (y < gy - 0.5) {
      if (x >= COAST - 2 && y > SEA) {
        const d = P.clamp((y - SEA) / 36);
        return out(P.mixc(L("#8FCDF0"), L("#3F8ED0"), d * 0.85));
      }
      if (x >= COAST - 2 && y > SEA - 0.8) return out(L("#D8F0FC"));
      let c = P.mixc(L("#CFE4F5"), L("#F3F7FA"), P.clamp((y - F.y) / (SEA - F.y)));
      // 화산 위 연기
      const pl = Math.exp(-(((x - 26 - (66 - y) * 0.25) / (5 + (66 - y) * 0.35)) ** 2)) * sm(68, 58, y) * sm(F.y, 30, y);
      c = P.mixc(c, L("#B9B6B2"), 0.5 * pl * (0.7 + 0.3 * nz.fbm(x * 0.1, y * 0.1, 3)));
      return out(c);
    }
    const a = P.smooth(gy - 0.5, gy + 0.5, y);
    let c;
    const mt = magTop(x);
    if (y > mt) {
      // 마그마: 가장 깊은 곳에서 녹아 생김(빛남)
      const k = P.clamp((y - mt) / 40);
      c = P.mixc(L("#E2552A"), L("#FFB25A"), k * 0.8 + 0.2 * P.smooth(0.1, 0.6, nz.fbm(x * 0.05, y * 0.08, 3)));
      c = P.mixc(c, cMag, 0.35);
      c = P.mixc(c, L("#7A2A14"), 0.5 * P.smooth(4, 0, y - mt));
    } else if (Math.abs(x - dikeX(y)) < 1.8 && y > ground(x) + 2) {
      c = P.mixc(L("#FFC060"), L("#E8582A"), Math.abs(x - dikeX(y)) / 1.8);
    } else if (inVolcano(x, y)) {
      // 화산체: 용암과 화산재가 번갈아 쌓인 어두운 층(꼭대기를 따라 휨)
      const lay = (y - (SEA - 1 - volH(x))) * 0.9 + Math.abs(x - 25) * 0.1;
      const k = Math.floor(lay / 4.2 + 0.4 * nz.n2(x * 0.08, y * 0.08));
      c = L(["#5E5651", "#7A6F66", "#4E4743", "#6C625A"][((k % 4) + 4) % 4]);
    } else if (inPluton(x, y)) {
      // 화성암(화강암): 밝은 회색 바탕에 결정 알갱이
      const g = vor(x, y, 1.7, 3);
      c = g.id < 0.55 ? L("#DCDFE3") : g.id < 0.8 ? L("#99A1A9") : L("#3A3D41");
      c = P.mixc(c, cIgn, 0.4);
      c = P.mixc(c, L("#5A616A"), 0.25 * P.smooth(0.45, 0.05, g.d2 - g.d1));
      // 마그마에 가까운 아래쪽은 아직 뜨겁다
      c = P.mixc(c, L("#E2552A"), 0.45 * P.smooth(mt - 26, mt, y));
    } else if (y > metTop(x)) {
      // 변성암: 나란한 줄(엽리)과 반짝이는 운모, 깊을수록 열을 받아 붉어진다
      const yy = y + 2.4 * Math.sin(x * 0.07) + 2 * nz.n2(x * 0.03, y * 0.05);
      const band = 0.5 + 0.5 * Math.sin(yy * 0.8 + 1.6 * nz.fbm(x * 0.02, y * 0.03, 2));
      c = P.mixc(L("#948F9C"), L("#C3BFC9"), 0.42 * P.smooth(0.25, 0.75, band) + 0.3 * (0.5 + 0.5 * n1));
      c = P.mixc(c, cMet, 0.16);
      const g = vor(x, y * 1.6, 1.4, 12);
      c = P.mixc(c, g.id > 0.5 ? L("#F4F1F8") : L("#4E4859"), 0.16 * P.smooth(0.55, 0.1, g.d1) * (g.id > 0.8 || g.id < 0.15 ? 1 : 0));
      c = P.mixc(c, L("#E2552A"), 0.3 * P.smooth(mt - 18, mt, y));
    } else if (x >= COAST && y < sedBot(x)) {
      // 퇴적물: 바다 밑에 수평으로 쌓인 모래와 진흙(낱알)
      const g = vor(x, y, 1.2, 21);
      c = P.mixc(cSed, g.id > 0.5 ? L("#F2D99A") : L("#B8913E"), 0.4 * P.smooth(0.6, 0.1, g.d1));
      c = P.mixc(c, L("#C9A04C"), 0.25 * P.smooth(0.6, 1, Math.sin(y * 1.6)));
    } else {
      // 퇴적암: 수평 층리(아래가 먼저 쌓임)
      const lay = Math.floor((y + 1.2 * nz.n2(x * 0.03, y * 0.03)) / 7.5);
      const tones = ["#C9A27A", "#B58E66", "#D8B990", "#A98560", "#CFAE86"];
      c = P.mixc(L(tones[((lay % 5) + 5) % 5]), cSR, 0.35);
      const g = vor(x, y, 1.4, 31);
      c = P.mixc(c, g.id > 0.5 ? L("#F0DFC4") : L("#7A6248"), 0.15 * P.smooth(0.6, 0.1, g.d1));
      // 산 쪽 지표 가까이는 오래된 산의 암석(변성암과 같은 결이 드러남)
    }
    // 산의 지표: 드러난 화강암과 변성암, 비탈의 흙빛, 평야의 풀
    if (x < COAST) {
      const top = P.smooth(gy + 3.5, gy + 0.8, y);
      const grass = x > 158 ? L("#8DBA5E") : inVolcano(x, y) ? L("#5A524D") : P.mixc(L("#8E9A72"), L("#A9A3A6"), P.clamp((SEA - gy) / 50));
      if (!inPluton(x, y + 3)) c = P.mixc(c, grass, top * 0.85);
    }
    const f = 1 + 0.06 * n1;
    const lt = 1.04 - 0.06 * ((y - F.y) / F.h);
    return out([c[0] * f * lt, c[1] * f * lt, c[2] * f * lt], a);
  }, { mask: (c) => c.rect(F.x, F.y, F.w, F.h) });

  // 강: 산비탈에서 평야를 지나 바다로(지표 위의 물줄기), 자갈과 모래
  const riverPts = [];
  for (let x = 116; x <= COAST; x += 2) riverPts.push([x, ground(x) - 1.1]);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  riverPts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.strokeStyle = "#2F7FC0";
  ctx.lineWidth = 3.4;
  ctx.stroke();
  ctx.strokeStyle = "#7CC3EE";
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();
  // 화산의 오른쪽 비탈을 흘러내린 용암(위는 빛나고 아래는 식음)
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const lava = [];
  for (let x = 28; x <= 46; x += 1) lava.push([x, ground(x) - 0.6]);
  const lg = P.lg(ctx, 28, 0, 46, 0, [[0, "#FFD27A"], [0.45, "#F26A22"], [1, "#4A3A34"]]);
  ctx.beginPath();
  lava.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.strokeStyle = lg;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  // 부서진 바위 조각(산비탈)과 강바닥의 자갈
  const rnd = N.rng(5);
  const rock = (cx, cy, r, col) => {
    ctx.beginPath();
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd() * 0.5;
      const rr = r * (0.75 + 0.35 * rnd());
      const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * 0.8;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, cx - r, cy - r, cx + r, cy + r, [[0, P.tone(col, 0.35)], [1, P.tone(col, -0.3)]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(40,40,45,.35)";
    ctx.lineWidth = 0.6;
    ctx.stroke();
  };
  for (const [x, r] of [[96, 3.6], [104, 2.8], [111, 3.2], [100, 2.2], [124, 2.4], [132, 2.0], [146, 1.6], [158, 1.4], [176, 1.2], [194, 1.0], [210, 0.9]]) {
    rock(x, ground(x) - r * 0.6, r, x < 118 ? "#9AA5B1" : "#A79A88");
  }

  // 단면 테두리
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(F.x, YB);
  ctx.lineTo(F.x, F.y);
  ctx.lineTo(F.x + F.w, F.y);
  ctx.stroke();
  ctx.strokeStyle = "rgba(60,50,45,.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(F.x, F.y, F.w, F.h);
  ctx.restore();

  // ── 겹층: 이름표, 화살표, 과정 이름 ──
  const s = S.svgLayer(root, w, h);
  const curve = (pts, n = 18) => {
    // 이차 베지어(세 점) 또는 삼차(네 점)를 점 배열로
    const out2 = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      if (pts.length === 2) {
        const [a, b] = pts;
        out2.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
      } else if (pts.length === 3) {
        const [a, b, c] = pts;
        out2.push([(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * b[0] + u * u * c[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * b[1] + u * u * c[1]]);
      } else {
        const [a, b, c, d] = pts;
        const m = 1 - u;
        out2.push([m ** 3 * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u ** 3 * d[0], m ** 3 * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u ** 3 * d[1]]);
      }
    }
    return out2;
  };
  const big = (pts, fill) => S.fatArrow(s, curve(pts), { fill, w0: 3.4, w1: 5.6, head: 11, hw: 8.5, sw: 0.9 });
  const dash = (pts, col) => {
    const p = curve(pts);
    const d = p.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");
    S.el(s, "path", { d, fill: "none", stroke: "#fff", "stroke-width": 4.4, "stroke-linecap": "round", opacity: 0.85 });
    S.el(s, "path", { d, fill: "none", stroke: col, "stroke-width": 2.2, "stroke-dasharray": "5 3.5", "stroke-linecap": "round" });
    const [ax, ay] = p[p.length - 1], [bx, by] = p[p.length - 3];
    const L2 = Math.hypot(ax - bx, ay - by), ux = (ax - bx) / L2, uy = (ay - by) / L2;
    const hd = `M${ax - ux * 9 - uy * 5.5} ${ay - uy * 9 + ux * 5.5} L${ax} ${ay} L${ax - ux * 9 + uy * 5.5} ${ay - uy * 9 - ux * 5.5} Z`;
    S.el(s, "path", { d: hd, fill: col, stroke: "#fff", "stroke-width": 1.1, "stroke-linejoin": "round" });
  };
  const tagW = 58, tagH = 21;
  const tag = (x, y, text, col) => {
    S.el(s, "rect", { x: x - tagW / 2 + 1, y: y - tagH / 2 + 1.6, width: tagW, height: tagH, rx: tagH / 2, fill: "#1B2A44", opacity: 0.18 });
    S.el(s, "rect", { x: x - tagW / 2, y: y - tagH / 2, width: tagW, height: tagH, rx: tagH / 2, fill: col, stroke: "#fff", "stroke-width": 1.6 });
    S.label(s, x, y + 5, text, { size: 14, anchor: "middle", halo: false, color: "#1E2633" });
  };
  const ARW = "#4E5968";
  // 자리
  const T = { sedi: [288, 139], sed: [288, 186], met: [282, 254], mag: [226, 350], ign: [100, 206] };
  // 큰 고리(굵은 화살표): 화성암 → 지표로 드러남 → 잘게 부서짐 → 퇴적물 → 다져지고 굳어짐 → 퇴적암 → 열과 압력을 받음 → 변성암 → 녹음 → 마그마 → 식어서 굳어짐 → 화성암
  big([[T.ign[0], T.ign[1] - 13], [T.ign[0] + 1, 120], [T.ign[0] + 2, 44]], ARW);
  big([[118, 40], [212, 22], [T.sedi[0] - 22, T.sedi[1] - 12]], ARW);
  big([[T.sedi[0], T.sedi[1] + 12], [T.sedi[0], T.sed[1] - 12]], ARW);
  big([[T.sed[0], T.sed[1] + 12], [T.met[0] + 6, T.met[1] - 12]], ARW);
  big([[T.met[0] - 6, T.met[1] + 12], [262, 312], [T.mag[0] + 18, T.mag[1] - 12]], ARW);
  big([[T.mag[0] - 30, T.mag[1] + 2], [150, 354], [112, 300], [T.ign[0] + 3, T.ign[1] + 13]], ARW);
  // 지름길(점선): 화성암 → 변성암, 변성암 → 지표로 드러남(산비탈), 퇴적암 → 마그마
  dash([[126, 216], [190, 252], [T.met[0] - 31, T.met[1] + 1]], "#7B5FD0");
  dash([[156, 238], [159, 170], [153, 100]], "#7B5FD0");
  dash([[T.sed[0] + 26, T.sed[1] + 8], [326, 256], [292, 318]], "#D9480F");
  tag(...T.sedi, "퇴적물", COL.sedi);
  tag(...T.sed, "퇴적암", COL.sed);
  tag(...T.met, "변성암", COL.met);
  tag(...T.mag, "마그마", COL.mag);
  tag(...T.ign, "화성암", COL.ign);
  // 과정 이름(다섯 말 + 지표로 드러남). 같은 일로 같은 자리에 닿는 두 화살표는 이름 하나를 함께 쓴다
  S.label(s, 206, 18, "잘게 부서짐", { size: 13.5, anchor: "middle" });
  S.label(s, 278, 168, "다져지고 굳어짐", { size: 13.5, anchor: "end" });
  S.label(s, 226, 232, "열과 압력을 받음", { size: 13.5, anchor: "middle" });
  S.label(s, 292, 298, "녹음", { size: 13.5, anchor: "middle" });
  S.label(s, 150, 374, "식어서 굳어짐", { size: 13.5, anchor: "middle" });
  S.label(s, 128, 138, "지표로", { size: 13.5, anchor: "middle" });
  S.label(s, 128, 155, "드러남", { size: 13.5, anchor: "middle" });
  S.label(s, 192, 88, "강", { size: 14, anchor: "middle", color: "#1D5C8F" });
  S.label(s, 312, 116, "바다", { size: 14, anchor: "middle", color: "#1D5C8F" });
  S.label(s, 170, 408, "깊이와 가로 길이는 실제 비율이 아님", { size: 13.5, anchor: "middle", weight: 600, color: "#6B7684" });
}
