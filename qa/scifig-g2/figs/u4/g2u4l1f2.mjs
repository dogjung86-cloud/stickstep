// g2u4l1f2 다이아몬드와 흑연: 둘 다 탄소 한 가지 입자. 다이아몬드는 탄소 하나가 이웃 넷과 정사면체 방향(109.5°)으로 이어진 입체 그물,
// 흑연은 육각형 벌집 판(판 안 이웃 셋, 120°)이 넓은 간격(판 안 결합의 약 2.36배)으로 한 칸씩 어긋나게 쌓인 모양. 검산 메모는 g2u4l1f2.md
import { ELEM, ball, contact } from "./_lib.mjs";

export const meta = {
  key: "g2u4l1f2",
  w: 340,
  h: 382,
  alt: "위쪽은 다이아몬드와 그 속을 확대한 모습이에요. 탄소 입자 하나가 이웃 4개와 이어지고, 이런 연결이 사방으로 이어진 입체 그물이에요. 아래쪽은 연필심의 흑연과 그 속을 확대한 모습이에요. 탄소 입자가 육각형으로 이어진 판이 넓은 간격을 두고 겹겹이 쌓여 있어요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(29);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  const rotF = (yaw, pitch) => ([x, y, z]) => {
    const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
    const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
    const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
    return [x1, y2, z2]; // 화면 x, 화면 y(아래 +), 깊이(앞 +)
  };
  const CARBON = "#545E6C";
  const stick = (a, b, wpx, col = "rgba(120,130,145,.95)", hi = "rgba(255,255,255,.5)") => {
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = col;
    ctx.lineWidth = wpx;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
    ctx.strokeStyle = hi;
    ctx.lineWidth = Math.max(0.8, wpx * 0.3);
    ctx.beginPath();
    ctx.moveTo(a[0] - 0.5, a[1] - 0.6);
    ctx.lineTo(b[0] - 0.5, b[1] - 0.6);
    ctx.stroke();
    ctx.restore();
  };
  const lens = (cx, cy, R, bg0, bg1, fn) => {
    P.dropShadow(t, (c) => c.arc(cx, cy, R, 0, Math.PI * 2), { dx: 2, dy: 5, blur: 12, a: 0.2 });
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = P.rg(ctx, cx - R * 0.3, cy - R * 0.35, 4, cx, cy, R, [[0, bg0], [1, bg1]]);
    ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    fn();
    ctx.restore();
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "#A9B3C1";
    ctx.beginPath();
    ctx.arc(cx, cy, R + 2.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  // ── 왼쪽: 다이아몬드 ──
  const DC = [246, 98], DR = 86;
  // 다이아몬드 격자(면심 입방 + 1/4 대각 이동). 가운데 원자에서 0.9a 안쪽만(29개, 결합 40개)
  const dia = (() => {
    const basis = [[0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]];
    const pts = [];
    for (let i = -2; i <= 2; i++)
      for (let j = -2; j <= 2; j++)
        for (let k = -2; k <= 2; k++)
          for (const b of basis)
            for (const o of [[0, 0, 0], [0.25, 0.25, 0.25]]) {
              const p = [i + b[0] + o[0], j + b[1] + o[1], k + b[2] + o[2]];
              if (Math.hypot(...p) <= 0.9 + 1e-9 && !pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < 1e-6)) pts.push(p);
            }
    const BL = Math.sqrt(3) / 4;
    const bonds = [];
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++)
        if (Math.abs(Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]) - BL) < 1e-6) bonds.push([i, j]);
    return { pts, bonds };
  })();
  const DA = 86; // 격자 상수(px): 결합 길이 = √3/4 × 86 = 37.2 px
  const rotD = rotF(0.42, -0.34);
  const dp = dia.pts.map((p) => {
    const r = rotD(p);
    return { x: DC[0] + r[0] * DA, y: DC[1] + r[1] * DA + 2, z: r[2], src: p };
  });
  const center = dp.findIndex((q) => Math.hypot(...q.src) < 1e-6);
  const nbr = new Set(dia.bonds.filter((b) => b.includes(center)).map((b) => (b[0] === center ? b[1] : b[0])));
  if (nbr.size !== 4) throw new Error("다이아몬드 이웃 수가 4가 아니에요");
  const zMinD = Math.min(...dp.map((q) => q.z)), zMaxD = Math.max(...dp.map((q) => q.z));
  const dCenter = dp[center];
  lens(DC[0], DC[1], DR, "#FFFFFF", "#E7ECF2", () => {
    // 뒤 → 앞 차례: 원자마다 자기 쪽 반막대를 먼저, 그다음 공
    const order = dp.map((q, i) => i).sort((a, b) => dp[a].z - dp[b].z);
    const rA = 7.2;
    // 가운데 원자와 이웃 넷 뒤의 옅은 빛(강조)
    for (const i of [center, ...nbr]) {
      const q = dp[i];
      ctx.save();
      ctx.fillStyle = P.rg(ctx, q.x, q.y, 2, q.x, q.y, i === center ? 17 : 13, [[0, "rgba(255,212,59,.55)"], [1, "rgba(255,212,59,0)"]]);
      ctx.beginPath();
      ctx.arc(q.x, q.y, i === center ? 17 : 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (const i of order) {
      const q = dp[i];
      const fog = 0.42 * (1 - (q.z - zMinD) / (zMaxD - zMinD));
      for (const [a, b] of dia.bonds) {
        if (a !== i && b !== i) continue;
        const o = dp[a === i ? b : a];
        const mid = [(q.x + o.x) / 2, (q.y + o.y) / 2];
        const hot = (a === center || b === center);
        stick([q.x, q.y], mid, hot ? 4.2 : 3.2, hot ? "rgba(214,160,30,.95)" : `rgba(${Math.round(120 + 90 * fog)},${Math.round(130 + 85 * fog)},${Math.round(145 + 80 * fog)},.95)`);
      }
      contact(t, P, q.x, q.y, rA, 0.22);
      const hl = i === center || nbr.has(i);
      P.sphere(t, q.x, q.y, hl ? rA + 0.6 : rA, mixC(CARBON, "#E9EDF2", hl ? 0 : fog), { spec: 0.55, gloss: 34, rim: 0.22, bounce: "#C9D2DE", wrap: 0.3 });
    }
  });
  function mixC(a, b, f) {
    const A = P.hex(a), B2 = P.hex(b);
    return "#" + [0, 1, 2].map((k) => Math.round(A[k] + (B2[k] - A[k]) * f).toString(16).padStart(2, "0")).join("");
  }

  // ── 오른쪽: 흑연 ──
  const GC = [246, 286], GR2 = 86;
  const b = 15.4; // 판 안 결합(px)
  const cgap = b * (0.335 / 0.142); // 판 사이 거리 = 2.36 b
  const rotG = rotF(0.16, -0.5);
  // 벌집: A = n1 a1 + n2 a2, B = A + δ.  a1 = (√3 b, 0), a2 = (√3 b/2, 3b/2), δ = (0, b).  판의 높이 차 c, 가운데 판만 δ만큼 어긋남(ABA)
  const sheets = [];
  const a1 = [Math.sqrt(3) * b, 0], a2 = [(Math.sqrt(3) / 2) * b, 1.5 * b], del = [0, b];
  const keyFor = (x, z) => `${Math.round(x * 10)},${Math.round(z * 10)}`;
  for (let k = 0; k < 3; k++) {
    const sh = k === 1 ? del : [0, 0];
    const atoms = [];
    const seen = new Set();
    for (let n1 = -8; n1 <= 8; n1++)
      for (let n2 = -8; n2 <= 8; n2++) {
        const A = [n1 * a1[0] + n2 * a2[0] + sh[0], n1 * a1[1] + n2 * a2[1] + sh[1]];
        for (const p of [A, [A[0] + del[0], A[1] + del[1]]]) {
          const px = p[0] - 0.43 * b, pz = p[1] - 0.5 * b; // 판 안 자리(가운데 맞춤)
          if (Math.abs(px) <= 3.5 * b && Math.abs(pz) <= 2.05 * b && !seen.has(keyFor(px, pz))) {
            seen.add(keyFor(px, pz));
            atoms.push([px, (k - 1) * cgap, pz]);
          }
        }
      }
    const bonds = [];
    for (let i = 0; i < atoms.length; i++)
      for (let j = i + 1; j < atoms.length; j++)
        if (Math.abs(Math.hypot(atoms[i][0] - atoms[j][0], atoms[i][2] - atoms[j][2]) - b) < 0.01) bonds.push([i, j]);
    sheets.push({ k, atoms, bonds });
  }
  const proj = (p) => {
    const r = rotG([p[0], p[1], p[2]]);
    return { x: GC[0] + r[0], y: GC[1] + r[1] + 2, z: r[2] };
  };
  const gInfo = {};
  lens(GC[0], GC[1], GR2, "#FFFFFF", "#E7ECF2", () => {
    // 아래 판(뒤)부터 그린다. 판마다 옅은 판 빛을 깔아 '판'이 보이게
    const zs = sheets.flatMap((s) => s.atoms.map((p) => proj(p).z));
    const zMin = Math.min(...zs), zMax = Math.max(...zs);
    for (const s of sheets.slice().sort((p, q) => q.k - p.k)) {
      const qs = s.atoms.map(proj);
      // 판 테두리(투영한 네모): 판 안 좌표의 네 귀퉁이
      const cs = [[-3.85 * b, -2.3 * b], [3.85 * b, -2.3 * b], [3.85 * b, 2.3 * b], [-3.85 * b, 2.3 * b]].map(([x, z]) => proj([x, (s.k - 1) * cgap, z]));
      ctx.save();
      ctx.beginPath();
      cs.forEach((c, i) => (i ? ctx.lineTo(c.x, c.y) : ctx.moveTo(c.x, c.y)));
      ctx.closePath();
      ctx.fillStyle = "rgba(150,165,190,.2)";
      ctx.fill();
      ctx.strokeStyle = "rgba(120,135,160,.35)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
      const order = qs.map((q, i) => i).sort((a, b2) => qs[a].z - qs[b2].z);
      for (const i of order) {
        const q = qs[i];
        const fog = 0.36 * (1 - (q.z - zMin) / (zMax - zMin));
        for (const [a, b2] of s.bonds) {
          if (a !== i && b2 !== i) continue;
          const o = qs[a === i ? b2 : a];
          stick([q.x, q.y], [(q.x + o.x) / 2, (q.y + o.y) / 2], 2.8, `rgba(${Math.round(120 + 90 * fog)},${Math.round(130 + 85 * fog)},${Math.round(145 + 80 * fog)},.95)`);
        }
        contact(t, P, q.x, q.y, 4.2, 0.18);
        P.sphere(t, q.x, q.y, 4.4, mixC(CARBON, "#E9EDF2", fog), { spec: 0.55, gloss: 34, rim: 0.22, bounce: "#C9D2DE", wrap: 0.3 });
      }
      gInfo[s.k] = { qs, cs };
    }
  });
  window.__gr = { b, cgap, ratio: cgap / b, sheets: sheets.map((s) => s.atoms.length) };

  // ── 다이아몬드 원석(왼쪽 위): 브릴리언트 컷 옆모습, 면마다 다른 밝기 ──
  const GEM = [62, 50];
  {
    const [gx, gy] = GEM;
    const W = 58, crown = 13, pav = 34, table = 30;
    const girdleL = [gx - W / 2, gy], girdleR = [gx + W / 2, gy];
    const tL = [gx - table / 2, gy - crown], tR = [gx + table / 2, gy - crown];
    const culet = [gx, gy + pav];
    P.softShadow(t, gx + 2, gy + pav + 6, 22, 4, 0.18);
    const poly = (pts, fill) => {
      ctx.beginPath();
      pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    };
    // 윗부분(크라운): 비스듬한 면 셋
    poly([girdleL, tL, [gx - 6, gy - crown], [gx - 13, gy]], P.lg(ctx, girdleL[0], gy - crown, gx, gy, [[0, "#FFFFFF"], [1, "#CFE6F7"]]));
    poly([[gx - 13, gy], [gx - 6, gy - crown], [gx + 6, gy - crown], [gx + 13, gy]], P.lg(ctx, gx - 13, gy - crown, gx + 13, gy, [[0, "#EAF6FF"], [1, "#9CC9EC"]]));
    poly([[gx + 13, gy], [gx + 6, gy - crown], tR, girdleR], P.lg(ctx, gx, gy - crown, girdleR[0], gy, [[0, "#BFDDF3"], [1, "#7FAED6"]]));
    // 아랫부분(파빌리온): 큘릿으로 모이는 면
    poly([girdleL, [gx - 13, gy], culet], P.lg(ctx, girdleL[0], gy, gx, culet[1], [[0, "#DDEFFC"], [1, "#8DBBE0"]]));
    poly([[gx - 13, gy], [gx + 4, gy], culet], P.lg(ctx, gx - 13, gy, gx, culet[1], [[0, "#FFFFFF"], [1, "#A9D2F0"]]));
    poly([[gx + 4, gy], [gx + 15, gy], culet], P.lg(ctx, gx, gy, gx + 15, culet[1], [[0, "#9BC6E8"], [1, "#5E8FBE"]]));
    poly([[gx + 15, gy], girdleR, culet], P.lg(ctx, gx + 15, gy, girdleR[0], culet[1], [[0, "#7FAAD3"], [1, "#4C7AAA"]]));
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (const seg of [[girdleL, girdleR], [tL, tR], [girdleL, culet], [girdleR, culet], [[gx - 13, gy], culet], [[gx + 4, gy], culet], [[gx + 15, gy], culet], [[gx - 13, gy], [gx - 6, gy - crown]], [[gx + 13, gy], [gx + 6, gy - crown]]]) {
      ctx.moveTo(seg[0][0], seg[0][1]);
      ctx.lineTo(seg[1][0], seg[1][1]);
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(70,110,150,.55)";
    ctx.beginPath();
    [girdleL, tL, tR, girdleR, culet].forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
    ctx.closePath();
    ctx.stroke();
    const star = (x, y, r) => {
      ctx.fillStyle = "rgba(255,255,255,.95)";
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.quadraticCurveTo(x, y, x, y + r);
      ctx.quadraticCurveTo(x, y, x - r, y);
      ctx.quadraticCurveTo(x, y, x, y - r);
      ctx.fill();
    };
    star(gx - 9, gy - 8, 6);
    star(gx + 12, gy + 12, 3.5);
    ctx.restore();
  }

  // ── 연필(왼쪽 아래): 육각 몸통, 깎은 나무, 흑연 심이 확대 원 쪽을 본다 ──
  const TIP = [118, 224];
  {
    const ang = -0.1;
    ctx.save();
    ctx.translate(TIP[0], TIP[1]);
    ctx.rotate(ang);
    const bx0 = -112, bx1 = -34, hw = 8;
    ctx.save();
    ctx.shadowColor = "rgba(28,42,68,.22)";
    ctx.shadowBlur = 7 * t.dpr;
    ctx.shadowOffsetY = 4 * t.dpr;
    ctx.fillStyle = "#E3A70C";
    ctx.fillRect(bx0, -hw, bx1 - bx0, 2 * hw);
    ctx.restore();
    const bands = [[-hw, -hw / 3, "#FFE27A", "#F5C518"], [-hw / 3, hw / 3, "#F7C21B", "#E3A70C"], [hw / 3, hw, "#D99A06", "#B07A04"]];
    for (const [y0, y1, c0, c1] of bands) {
      ctx.fillStyle = P.lg(ctx, 0, y0, 0, y1, [[0, c0], [1, c1]]);
      ctx.fillRect(bx0, y0, bx1 - bx0, y1 - y0);
    }
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fillRect(bx0, -hw + 1.2, bx1 - bx0, 1.3);
    const cone = (x0, x1, yy0, yy1, c0, c1) => {
      ctx.beginPath();
      ctx.moveTo(x0, yy0);
      ctx.lineTo(x1, yy1);
      ctx.lineTo(x1, -yy1);
      ctx.lineTo(x0, -yy0);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, -yy0, 0, yy0, [[0, c0], [1, c1]]);
      ctx.fill();
    };
    cone(bx1, -9, hw, 3.2, "#F6DFBC", "#C99A62");
    // 칠이 끝나는 물결 경계
    ctx.fillStyle = "#E9B21A";
    ctx.beginPath();
    ctx.moveTo(bx1 - 0.5, -hw);
    ctx.quadraticCurveTo(bx1 + 5, -hw / 2, bx1 + 1, 0);
    ctx.quadraticCurveTo(bx1 + 5, hw / 2, bx1 - 0.5, hw);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(150,105,60,.35)";
    ctx.lineWidth = 0.7;
    for (const yy of [-4, 0.5, 4.5]) {
      ctx.beginPath();
      ctx.moveTo(bx1 + 5, yy * 1.3);
      ctx.lineTo(-11, yy * 0.4);
      ctx.stroke();
    }
    cone(-9.5, 0, 3.4, 0.4, "#9AA3AE", "#2E3540");
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.beginPath();
    ctx.moveTo(-9, -2.6);
    ctx.lineTo(-2, -0.8);
    ctx.lineTo(-2.4, -0.2);
    ctx.lineTo(-9, -1.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── 확대 통로: 물체에서 확대 원으로 ──
  const funnel = (from, C, R) => {
    const d = Math.hypot(C[0] - from[0], C[1] - from[1]);
    const base = Math.atan2(C[1] - from[1], C[0] - from[0]);
    const al = Math.asin(R / d);
    const L2 = Math.sqrt(d * d - R * R);
    const p1 = [from[0] + L2 * Math.cos(base - al), from[1] + L2 * Math.sin(base - al)];
    const p2 = [from[0] + L2 * Math.cos(base + al), from[1] + L2 * Math.sin(base + al)];
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = P.lg(ctx, from[0], from[1], C[0], C[1], [[0, "rgba(120,135,160,.22)"], [1, "rgba(120,135,160,.04)"]]);
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(120,135,160,.55)";
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#FFD43B";
    ctx.beginPath();
    ctx.arc(from[0], from[1], 2.6, 0, Math.PI * 2);
    ctx.fill();
  };
  funnel([GEM[0] + 14, GEM[1] + 6], DC, DR + 2);
  funnel([TIP[0] - 1, TIP[1] + 0.2], GC, GR2 + 2);

  // ── 글자 ──
  const sv = S.svgLayer(root, w, h);
  S.label(sv, GEM[0], 106, "다이아몬드", { anchor: "middle", size: 14 });
  S.label(sv, 62, 262, "흑연(연필심)", { anchor: "middle", size: 14 });
  // 다이아몬드: 탄소, 이웃 4개
  {
    const left = dp.filter((q) => q.x < DC[0] - 40).sort((a, c) => c.z - a.z)[0];
    S.leader(sv, [[44, 134], [left.x - 5, left.y + 2]]);
    S.label(sv, 12, 139, "탄소", { size: 14 });
    S.leader(sv, [[84, 165], [dCenter.x - 4, dCenter.y + 5]], { color: "#8A5A00" });
    S.label(sv, 12, 166, "이웃 4개와", { size: 14, color: "#8A5A00" });
    S.label(sv, 12, 183, "이어져요", { size: 14, color: "#8A5A00" });
  }
  // 흑연: 육각형 판, 판 사이, 미끄러짐 (판 0이 맨 위, 판 1이 가운데)
  {
    const top = gInfo[0], mid = gInfo[1], bot = gInfo[2];
    // 판의 앞 모서리(cs[3]→cs[2] 쪽이 앞인지 보고 고른다) 위 x 자리의 y
    const edge = (cs, front) => {
      const e1 = [cs[0], cs[1]], e2 = [cs[3], cs[2]];
      const avg = (e) => (e[0].y + e[1].y) / 2;
      return front ? (avg(e1) > avg(e2) ? e1 : e2) : avg(e1) > avg(e2) ? e2 : e1;
    };
    const yAt = (e, x) => e[0].y + ((x - e[0].x) / (e[1].x - e[0].x)) * (e[1].y - e[0].y);
    const midY = (cs, x) => (yAt(edge(cs, true), x) + yAt(edge(cs, false), x)) / 2;
    // 판 사이 거리: 왼쪽 끝에서 위 판과 가운데 판의 가운데 줄 사이(세로로 c × cos(내려다본 각))
    // 가운데 판과 아래 판 사이(왼쪽 끝)
    const xg = Math.min(...mid.cs.map((c) => c.x)) - 7;
    const y1 = midY(mid.cs, xg + 9), y2 = midY(bot.cs, xg + 9);
    const g = S.el(sv, "g");
    S.el(g, "line", { x1: xg, y1: y1 + 4, x2: xg, y2: y2 - 4, stroke: "#fff", "stroke-width": 3.4 });
    S.el(g, "line", { x1: xg, y1: y1 + 4, x2: xg, y2: y2 - 4, stroke: "#B42318", "stroke-width": 1.5 });
    S.el(g, "path", { d: `M${xg} ${y1} L${xg - 3.4} ${y1 + 6.5} L${xg + 3.4} ${y1 + 6.5}Z M${xg} ${y2} L${xg - 3.4} ${y2 - 6.5} L${xg + 3.4} ${y2 - 6.5}Z`, fill: "#B42318" });
    S.el(g, "line", { x1: xg - 4, y1, x2: xg + 10, y2: y1, stroke: "#B42318", "stroke-width": 1 });
    S.el(g, "line", { x1: xg - 4, y1: y2, x2: xg + 10, y2: y2, stroke: "#B42318", "stroke-width": 1 });
    // 육각형 판(위 판의 왼쪽 위 공)
    const q = top.qs.filter((p) => p.x < GC[0] - 10).sort((a, c) => a.y - c.y)[0];
    S.leader(sv, [[78, 288], [q.x - 4, q.y + 1]]);
    S.label(sv, 12, 292, "육각형 판", { size: 14 });
    S.leader(sv, [[110, 344], [xg - 3, (y1 + y2) / 2]], { color: "#B42318" });
    S.label(sv, 12, 346, "판과 판 사이가", { size: 14, color: "#B42318" });
    S.label(sv, 12, 363, "넓어요", { size: 14, color: "#B42318" });
    // 판이 잘 미끄러져요: 위 판은 오른쪽으로, 가운데 판은 왼쪽으로(판의 가운데 줄 위, 판 밖으로 조금 나가게)
    const xs0 = Math.min(...top.cs.map((c) => c.x)), xs1 = Math.max(...top.cs.map((c) => c.x));
    const arrowOn = (cs, xa, xb) => {
      const pts = [];
      const dir = Math.sign(xb - xa);
      for (let x = xa; dir > 0 ? x <= xb : x >= xb; x += 4 * dir) pts.push([x, midY(cs, x) - 9]);
      S.fatArrow(sv, pts, { w0: 3, w1: 5, head: 9, hw: 7, fill: "#2F9E44", sw: 1.2 });
      return pts;
    };
    arrowOn(top.cs, xs1 - 50, xs1 + 8);
    const pm = arrowOn(mid.cs, xs0 + 54, xs0 - 4);
    S.leader(sv, [[132, 316], [pm[pm.length - 1][0] + 8, pm[pm.length - 1][1] + 3]], { color: "#2F9E44" });
    S.label(sv, 12, 320, "판이 잘 미끄러져요", { size: 14, color: "#2B8A3E" });
  }


}
