// g2u5l4f1 잎의 세포와 뿌리의 세포(같은 배율), 엽록체와 마이토콘드리아 확대(서로 같은 배율).
// 세포 칸: 3 px/µm. 세포 36 × 32 µm, 엽록체 6 × 2.5 µm, 마이토콘드리아 1.9 × 0.8 µm(엽록체 길이의 약 3분의 1), 핵 약 9 × 6 µm.
// 확대 원: 26 px/µm(두 원 같은 배율, 1 µm 눈금 막대를 원마다 같은 길이로). 검산 메모는 g2u5l4f1.md
import { lib } from "./_lib.mjs";

export const meta = {
  key: "g2u5l4f1",
  w: 340,
  h: 386,
  alt: "같은 배율로 그린 잎의 세포와 뿌리의 세포. 두 세포 모두 세포벽, 커다란 액포, 벽 쪽으로 밀린 핵, 작은 분홍색 마이토콘드리아가 있고, 잎의 세포에만 초록색 엽록체가 벽을 따라 늘어서 있어요. 아래 확대 원에서 엽록체 속에는 납작한 주머니가 동전처럼 쌓인 초록 더미와 흰 녹말 알갱이가 있고, 마이토콘드리아는 안쪽 막이 주름처럼 접혀 있어요. 마이토콘드리아는 엽록체보다 훨씬 작아요.",
};

const K = 3; // 세포 칸 px/µm
const M = 26; // 확대 원 px/µm
const CHL = [6, 2.5]; // 엽록체 길이, 두께(µm)
const MIT = [1.9, 0.8]; // 마이토콘드리아 길이, 굵기(µm)

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const L = lib(kit);
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(61);
  const rnd = N.rng(12);
  const R = (a, b) => a + (b - a) * rnd();
  P.plate(t, nz, { top: "#FDFDFB", bottom: "#F1F4EE", grain: 0.012 });
  const LD = [P.LIGHT[0], P.LIGHT[1]];
  const LDn = Math.hypot(LD[0], LD[1]);
  const lx = LD[0] / LDn, ly = LD[1] / LDn; // 화면에서 빛이 오는 쪽(왼쪽 위)

  // ── 세포 모양: 둥근 네모(초타원) + 낮은 주파수 일그러짐 ──
  function shape(o) {
    const r = (th) => {
      const c = Math.abs(Math.cos(th)) / o.a, s = Math.abs(Math.sin(th)) / o.b;
      return Math.pow(c ** o.n + s ** o.n, -1 / o.n) * (1 + 0.022 * Math.sin(3 * th + o.ph) + 0.015 * Math.sin(5 * th + 2 * o.ph));
    };
    const pt = (th, inset = 0) => {
      const rr = r(th) - inset;
      return [o.cx + rr * Math.cos(th), o.cy + rr * Math.sin(th)];
    };
    const path = (q, inset = 0, n = 180) => {
      for (let i = 0; i <= n; i++) {
        const p = pt((i / n) * 2 * Math.PI, inset);
        i ? q.lineTo(p[0], p[1]) : q.moveTo(p[0], p[1]);
      }
      q.closePath();
    };
    const tan = (th, inset) => {
      const p0 = pt(th - 0.01, inset), p1 = pt(th + 0.01, inset);
      return Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
    };
    return { ...o, r, pt, path, tan };
  }

  // 엽록체(세포 칸): 렌즈 모양, 빛은 화면의 왼쪽 위에서(돌려 놓아도 밝은 쪽이 같다), 속의 그라나 더미 몇 개
  function chlp(x, y, hl, hw, ang) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const ca = Math.cos(-ang), sa = Math.sin(-ang);
    const vx = lx * ca - ly * sa, vy = lx * sa + ly * ca; // 빛 방향(국소 좌표)
    ctx.beginPath();
    ctx.ellipse(0, 0, hl, hw, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, vx * hw * 1.1, vy * hw * 1.1, -vx * hw * 1.1, -vy * hw * 1.1, [[0, "#A8DA74"], [0.5, "#4E9F3A"], [1, "#256A20"]]);
    ctx.fill();
    ctx.lineWidth = 0.55;
    ctx.strokeStyle = "rgba(24,74,22,.65)";
    ctx.stroke();
    ctx.fillStyle = "rgba(20,70,22,.5)";
    for (let i = -2; i <= 2; i++) {
      if (Math.abs(i) === 2 && hl < 8) continue;
      ctx.beginPath();
      ctx.ellipse((i * hl) / 2.9, 0, hl * 0.07, hw * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,.32)";
    ctx.beginPath();
    ctx.ellipse(vx * hw * 0.45, vy * hw * 0.45, hl * 0.55, hw * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 세포 하나: 벽 → 세포질 → 액포 → 핵 → 엽록체(잎만) → 마이토콘드리아 → 벽 선
  function cell(o) {
    const sh = shape(o);
    const wallT = 1.0 * K, cytoT = o.cytoT;
    P.dropShadow(t, (q) => sh.path(q, 0), { dx: 2, dy: 4, blur: 9, a: 0.16 });
    // 세포벽
    ctx.beginPath();
    sh.path(ctx, 0);
    ctx.fillStyle = P.lg(ctx, o.cx - o.a, o.cy - o.b, o.cx + o.a, o.cy + o.b, [[0, o.wall[0]], [1, o.wall[1]]]);
    ctx.fill();
    // 세포질
    ctx.beginPath();
    sh.path(ctx, wallT);
    ctx.fillStyle = P.lg(ctx, o.cx - o.a, o.cy - o.b, o.cx + o.a, o.cy + o.b, [[0, o.cyto[0]], [1, o.cyto[1]]]);
    ctx.fill();
    // 세포질의 작은 알갱이(결)
    ctx.save();
    ctx.beginPath();
    sh.path(ctx, wallT);
    ctx.clip();
    P.shade(t, { x: o.cx - o.a, y: o.cy - o.b, w: 2 * o.a, h: 2 * o.b }, (x, y) => {
      const n = nz.n2(x * 0.9 + o.ph * 10, y * 0.9);
      return n > 0.55 ? [o.grain[0], o.grain[1], o.grain[2], (n - 0.55) * 1.4] : null;
    });
    ctx.restore();
    // 액포: 세포의 대부분, 아주 옅은 푸른 투명
    ctx.beginPath();
    sh.path(ctx, wallT + cytoT);
    ctx.fillStyle = P.rg(ctx, o.cx - o.a * 0.35, o.cy - o.b * 0.4, 2, o.cx, o.cy, o.a, [[0, "#FCFEFF"], [0.6, "#EDF5F8"], [1, "#DCE9EF"]]);
    ctx.fill();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = "rgba(110,140,160,.45)";
    ctx.stroke();
    // 반투명한 덩어리: 벽 쪽으로 갈수록 그늘, 왼쪽 위가 밝다
    ctx.save();
    ctx.beginPath();
    sh.path(ctx, wallT);
    ctx.clip();
    ctx.fillStyle = P.rg(ctx, o.cx - o.a * 0.25, o.cy - o.b * 0.3, o.a * 0.1, o.cx, o.cy, o.a * 1.15, [[0, "rgba(255,255,255,.35)"], [0.62, "rgba(255,255,255,0)"], [1, o.inner]]);
    ctx.fillRect(o.cx - o.a - 2, o.cy - o.b - 2, 2 * o.a + 4, 2 * o.b + 4);
    ctx.restore();
    // 핵: 벽 쪽으로 밀려 액포 쪽으로 볼록, 인(진한 점)
    const nth = o.nucTh;
    const nr = sh.r(nth) - wallT - 6.4;
    const nx = o.cx + nr * Math.cos(nth), ny = o.cy + nr * Math.sin(nth);
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(nth);
    ctx.beginPath();
    ctx.ellipse(0, 0, 10.5, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = o.cyto[1];
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(nth);
    const ca = Math.cos(-nth), sa = Math.sin(-nth);
    const vx = lx * ca - ly * sa, vy = lx * sa + ly * ca;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8.6, 13.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.rg(ctx, vx * 5, vy * 6, 1, 0, 0, 15, [[0, "#E6DDF6"], [0.55, "#B9A8DE"], [1, "#8E78C2"]]);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(96,74,150,.8)";
    ctx.stroke();
    ctx.fillStyle = "rgba(110,88,170,.22)";
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.arc(R(-5, 5), R(-9, 9), R(0.7, 1.3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(-1.2, 2.5, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = P.rg(ctx, -2.2, 1.5, 0.3, -1.2, 2.5, 3.4, [[0, "#9B86CC"], [1, "#5E4894"]]);
    ctx.fill();
    ctx.restore();
    const out = { sh, nucleus: [nx, ny], chl: [], mito: [] };
    // 엽록체: 벽을 따라, 핵 자리를 비우고
    if (o.leaf) {
      const n = o.nChl;
      for (let i = 0; i < n; i++) {
        const th = nth + 0.5 + ((2 * Math.PI - 1.0) * (i + 0.5)) / n + R(-0.05, 0.05);
        const hl = (CHL[0] / 2) * K * R(0.92, 1.06), hw = (CHL[1] / 2) * K;
        const p = sh.pt(th, wallT + hw + 0.6);
        chlp(p[0], p[1], hl, hw, sh.tan(th, wallT + hw + 0.6));
        out.chl.push({ p, th });
      }
    }
    // 마이토콘드리아: 두 세포에 같은 수, 세포질 띠 안, 엽록체 사이
    for (let i = 0; i < o.nMito; i++) {
      const th = o.mitoTh[i];
      const depth = o.leaf ? wallT + (CHL[1] * K) + 2.6 : wallT + 3.2;
      const p = sh.pt(th, depth + R(-0.6, 0.6));
      const ang = sh.tan(th, depth) + R(-0.6, 0.6);
      L.mito(t, p[0], p[1], MIT[0] * K, MIT[1] * K, ang);
      out.mito.push({ p, th });
    }
    // 세포벽 선: 바깥 진한 선, 안쪽 밝은 선
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    sh.path(ctx, 0.4);
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = o.edge;
    ctx.stroke();
    ctx.beginPath();
    sh.path(ctx, wallT - 0.2);
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = o.edgeIn;
    ctx.stroke();
    // 세포벽 윗면 빛
    ctx.beginPath();
    sh.path(ctx, 1.4);
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = P.lg(ctx, o.cx - o.a, o.cy - o.b, o.cx + o.a * 0.2, o.cy + o.b * 0.2, [[0, "rgba(255,255,255,.85)"], [1, "rgba(255,255,255,0)"]]);
    ctx.stroke();
    ctx.restore();
    return out;
  }

  // ── 두 세포(같은 배율) ──
  const A = 18 * K, B = 16 * K; // 반 너비, 반 높이(36 × 32 µm)
  const leafO = {
    cx: 14 + A, cy: 84, a: A, b: B, n: 2.6, ph: 0.7,
    wall: ["#F6F8EC", "#E3EAD2"], cyto: ["#EEF6DC", "#DDEBC6"], grain: [120, 160, 90],
    edge: "rgba(96,130,70,.85)", edgeIn: "rgba(160,190,130,.7)", inner: "rgba(70,120,50,.26)",
    cytoT: 10, leaf: true, nChl: 12, nucTh: 0.05, nMito: 8,
    mitoTh: [0.95, 1.55, 2.25, 2.85, 3.55, 4.1, 4.75, 5.55],
  };
  const rootO = {
    cx: 340 - 14 - A, cy: 84, a: A, b: B, n: 2.5, ph: 2.3,
    wall: ["#F7F4EA", "#E8E1D0"], cyto: ["#F7F2E4", "#ECE3CF"], grain: [170, 150, 110],
    edge: "rgba(150,132,98,.85)", edgeIn: "rgba(205,192,160,.7)", inner: "rgba(130,105,70,.22)",
    cytoT: 6.5, leaf: false, nucTh: Math.PI - 0.05, nMito: 8,
    mitoTh: [-0.35, 0.35, 0.95, 1.6, 2.25, 4.0, 4.65, 5.35],
  };
  const leaf = cell(leafO);
  const rootC = cell(rootO);


  // ── 확대 원 ──
  const EC = [94, 276], RC = 82; // 엽록체
  const EM = [270, 232], RM = 42; // 마이토콘드리아
  const chlPick = leaf.chl.reduce((m, q) => (q.p[1] > m.p[1] && q.p[0] < leafO.cx ? q : m), leaf.chl[0]);
  const mitPick = rootC.mito.reduce((m, q) => (q.p[1] > m.p[1] ? q : m), rootC.mito[0]);
  // 통로는 확대 원보다 먼저(원이 끝을 덮는다)
  L.lensPath(t, chlPick.p, 11, EC, RC);
  L.lensPath(t, mitPick.p, 5.5, EM, RM);

  // 엽록체 확대: 렌즈 모양을 긴 축으로 자른 면. 겉막 두 겹, 기질, 그라나(납작한 주머니가 동전처럼 쌓인 더미)와
  // 그 사이를 잇는 막, 흰 녹말 알갱이
  L.lensOpen(t, EC, RC, ["#F8FAF2", "#E6EDDB"]);
  const grana = [], starch = [];
  const hlC = (CHL[0] / 2) * M, hwC = (CHL[1] / 2) * M; // 78 × 32.5
  const CC = [EC[0], EC[1] - 2];
  {
    const [cx, cy] = CC;
    const hl = hlC, hw = hwC;
    const ell = (q, inset) => {
      q.beginPath();
      q.ellipse(cx, cy, hl - inset, hw - inset, 0, 0, Math.PI * 2);
    };
    P.dropShadow(t, (q) => q.ellipse(cx, cy + 4, hl, hw + 2, 0, 0, Math.PI * 2), { dx: 2, dy: 5, blur: 10, a: 0.22 });
    // 자른 면 아래로 보이는 렌즈의 아래쪽 몸: 지름 6 µm, 두께 2.5 µm인 렌즈를 25° 위에서 본 것.
    // 가장자리(양 끝)는 얇아 두께 0, 앞 가운데에서 가장 많이 보인다(약 0.25 µm = 6.5 px).
    const bulge = 6.5;
    const bodyPath = (q) => {
      q.beginPath();
      for (let i = 0; i <= 48; i++) {
        const th = (i / 48) * Math.PI;
        const x = cx + hl * Math.cos(th), y = cy + hw * Math.sin(th);
        i ? q.lineTo(x, y) : q.moveTo(x, y);
      }
      for (let i = 48; i >= 0; i--) {
        const th = (i / 48) * Math.PI;
        q.lineTo(cx + hl * Math.cos(th), cy + hw * Math.sin(th) + bulge * Math.pow(Math.sin(th), 1.4));
      }
      q.closePath();
    };
    bodyPath(ctx);
    ctx.fillStyle = P.lg(ctx, cx, cy + hw - 4, cx, cy + hw + bulge, [[0, "#3F8E33"], [1, "#215F1E"]]);
    ctx.fill();
    // 겉막(바깥) → 막 사이 → 안쪽 막 → 기질
    ell(ctx, 0);
    ctx.fillStyle = P.lg(ctx, cx - hl * 0.4, cy - hw, cx + hl * 0.2, cy + hw, [[0, "#6DB851"], [1, "#2D7628"]]);
    ctx.fill();
    ell(ctx, 1.8);
    ctx.fillStyle = "#D6EEBC";
    ctx.fill();
    ell(ctx, 3.0);
    ctx.fillStyle = "#4C9A3B";
    ctx.fill();
    ell(ctx, 4.2);
    ctx.fillStyle = P.rg(ctx, cx - hl * 0.3, cy - hw * 0.5, 4, cx, cy, hl, [[0, "#EEF8DF"], [0.55, "#D7EDBD"], [1, "#BBDD9A"]]);
    ctx.fill();
    ctx.save();
    ell(ctx, 4.2);
    ctx.clip();
    P.shade(t, { x: cx - hl, y: cy - hw, w: 2 * hl, h: 2 * hw }, (x, y) => {
      const n = nz.fbm(x * 0.32, y * 0.32, 2);
      return [110, 165, 80, Math.max(0, n) * 0.13];
    });
    // 녹말 알갱이 자리(가운데 줄)
    starch.push({ x: cx - 33, y: cy + 0.5, a: 14.5, b: 6.4 }, { x: cx + 37, y: cy - 0.5, a: 12.5, b: 5.8 });
    // 그라나: 위·아래 줄은 5개씩 엇갈리게, 가운데 줄은 녹말 사이와 양 끝
    const rows = [
      { y: cy - 14.5, xs: [-42, -21, 0, 21, 42], nd: [5, 6, 6, 6, 5] },
      { y: cy + 14.5, xs: [-45, -24, -3, 18, 40], nd: [5, 6, 6, 6, 5] },
      { y: cy, xs: [-64, -4, 13, 64], nd: [4, 6, 6, 4] },
    ];
    for (const r of rows) r.xs.forEach((dx, i) => grana.push({ x: cx + dx, y: r.y, gw: 13 - (r.nd[i] < 5 ? 2 : 0), nd: r.nd[i] }));
    // 그라나를 잇는 막(긴 축을 따라 물결치는 가는 판), 그라나보다 뒤에
    ctx.lineCap = "round";
    for (const fy of [-14.5, -7.2, 0, 7.2, 14.5]) {
      const y = cy + fy;
      const span = (hl - 7) * Math.sqrt(Math.max(0, 1 - (fy / (hw - 5)) ** 2));
      for (const [col, lw] of [["rgba(40,110,40,.45)", 1.6], ["rgba(150,215,120,.85)", 0.7]]) {
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) {
          const x = cx - span + (2 * span * i) / 40;
          const yy = y + Math.sin(i * 0.55 + fy) * 1.2;
          i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
        }
        ctx.stroke();
      }
    }
    // 그라나: 동전 더미(원반의 옆 띠는 진하게, 윗면 타원은 밝게), 아래 원반부터 쌓는다
    for (const g of grana) {
      const rx = g.gw / 2, ry = rx * 0.42, dt = 1.45, gap = 0.45; // 원반 윗면: 25° 위에서 본 원(세로 = 가로 × sin 25°)
      const Ht = g.nd * (dt + gap) - gap;
      P.dropShadow(t, (q) => q.ellipse(g.x + 0.8, g.y + Ht / 2 - 0.5, rx, ry, 0, 0, Math.PI * 2), { dx: 0.8, dy: 1, blur: 2.4, a: 0.14, color: "#1E4A16" });
      for (let k = 0; k < g.nd; k++) {
        const yT = g.y + Ht / 2 - (k + 1) * dt - k * gap - ry * 0.4;
        // 원반 사이 틈(아래 원반 윗면에 드리운 그늘)
        if (k > 0) {
          ctx.beginPath();
          ctx.ellipse(g.x, yT + dt + gap * 0.6, rx * 0.98, ry, 0, 0, Math.PI);
          ctx.lineWidth = 0.7;
          ctx.strokeStyle = "rgba(20,70,20,.55)";
          ctx.stroke();
        }
        // 옆 띠
        ctx.beginPath();
        ctx.ellipse(g.x, yT + dt, rx, ry, 0, 0, Math.PI);
        ctx.lineTo(g.x - rx, yT);
        ctx.ellipse(g.x, yT, rx, ry, 0, Math.PI, 0, true);
        ctx.closePath();
        ctx.fillStyle = P.lg(ctx, g.x - rx, 0, g.x + rx, 0, [[0, "#3D9434"], [0.35, "#4DA840"], [1, "#25692A"]]);
        ctx.fill();
        // 윗면
        ctx.beginPath();
        ctx.ellipse(g.x, yT, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = P.lg(ctx, g.x - rx, yT - ry, g.x + rx, yT + ry, [[0, "#A6DE7E"], [1, "#62B44A"]]);
        ctx.fill();
        ctx.lineWidth = 0.35;
        ctx.strokeStyle = "rgba(30,90,30,.6)";
        ctx.stroke();
      }
    }
    // 녹말 알갱이: 흰빛, 매끈한 볼록 알갱이
    for (const sg of starch) {
      P.dropShadow(t, (q) => q.ellipse(sg.x, sg.y, sg.a, sg.b, 0, 0, Math.PI * 2), { dx: 1, dy: 1.8, blur: 3, a: 0.22, color: "#2C4A20" });
      ctx.beginPath();
      ctx.ellipse(sg.x, sg.y, sg.a, sg.b, 0, 0, Math.PI * 2);
      ctx.fillStyle = P.rg(ctx, sg.x - sg.a * 0.35, sg.y - sg.b * 0.45, 0.5, sg.x, sg.y, sg.a, [[0, "#FFFFFF"], [0.6, "#F7F7EE"], [1, "#DADBC7"]]);
      ctx.fill();
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = "rgba(150,150,120,.7)";
      ctx.stroke();
    }
    ctx.restore();
    // 겉막 윗면 빛
    ctx.save();
    ell(ctx, 0.7);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = P.lg(ctx, cx - hl, cy - hw, cx + hl * 0.3, cy + hw * 0.4, [[0, "rgba(255,255,255,.8)"], [1, "rgba(255,255,255,0)"]]);
    ctx.stroke();
    ctx.restore();
  }
  L.lensClose(t, EC, RC);

  // 마이토콘드리아 확대: 분홍 겉막, 주황 안쪽 막이 주름처럼 접혀 들어간다
  L.lensOpen(t, EM, RM, ["#FFF9FA", "#F2E7EB"]);
  {
    const hl = (MIT[0] / 2) * M, hw = (MIT[1] / 2) * M; // 24.7 × 10.4
    const [cx, cy] = [EM[0], EM[1] - 4];
    const cap = (q, inset) => {
      const a = hl - inset, b = hw - inset;
      q.beginPath();
      q.moveTo(cx - a + b, cy - b);
      q.lineTo(cx + a - b, cy - b);
      q.arc(cx + a - b, cy, b, -Math.PI / 2, Math.PI / 2);
      q.lineTo(cx - a + b, cy + b);
      q.arc(cx - a + b, cy, b, Math.PI / 2, (Math.PI * 3) / 2);
      q.closePath();
    };
    P.dropShadow(t, (q) => cap(q, 0), { dx: 1.5, dy: 4, blur: 6, a: 0.24, color: "#5A2036" });
    ctx.save();
    ctx.translate(0, 3.2);
    cap(ctx, 0.3);
    ctx.fillStyle = P.lg(ctx, cx, cy, cx, cy + hw, [[0, "#B83563"], [1, "#8E2249"]]);
    ctx.fill();
    ctx.restore();
    cap(ctx, 0);
    ctx.fillStyle = P.lg(ctx, cx - hl * 0.3, cy - hw, cx, cy + hw, [[0, "#F79BB6"], [0.5, "#DE4F7C"], [1, "#B0305A"]]);
    ctx.fill();
    cap(ctx, 2.1);
    ctx.fillStyle = "#FAD0DB";
    ctx.fill();
    cap(ctx, 3.0);
    ctx.fillStyle = "#EE8E3E";
    ctx.fill();
    cap(ctx, 4.1);
    ctx.fillStyle = P.lg(ctx, cx, cy - hw, cx, cy + hw, [[0, "#FDE7EC"], [1, "#F3C3CF"]]);
    ctx.fill();
    // 크리스타: 안쪽 막이 위아래에서 번갈아 접혀 들어온 주름(주황, 가운데 밝은 줄)
    ctx.save();
    cap(ctx, 3.0);
    ctx.clip();
    const nF = 7;
    for (let i = 0; i < nF; i++) {
      const x = cx - hl + 7.6 + ((2 * hl - 15.2) * i) / (nF - 1);
      const fromTop = i % 2 === 0;
      const y0 = fromTop ? cy - hw + 2.5 : cy + hw - 2.5;
      const y1 = fromTop ? cy + hw * 0.45 : cy - hw * 0.45;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#E07A2C";
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
      ctx.stroke();
      ctx.strokeStyle = "#FFD9AE";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1 + (fromTop ? -0.7 : 0.7));
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    cap(ctx, 0.7);
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = P.lg(ctx, cx - hl, cy - hw, cx + hl * 0.2, cy + hw, [[0, "rgba(255,255,255,.85)"], [1, "rgba(255,255,255,0)"]]);
    ctx.stroke();
    ctx.restore();
  }
  L.lensClose(t, EM, RM);
  L.marker(t, chlPick.p, 11);
  L.marker(t, mitPick.p, 5.5);

  // ── 글자 ──
  const s = S.svgLayer(root, w, h);
  S.label(s, leafO.cx, 20, "잎의 세포", { size: 15, anchor: "middle" });
  S.label(s, rootO.cx, 20, "뿌리의 세포", { size: 15, anchor: "middle" });
  // 가운데 공용 라벨: 세포벽, 핵(두 세포 모두를 가리킨다)
  const wl = leaf.sh.pt(-0.42, 1.5), wr = rootC.sh.pt(Math.PI + 0.42, 1.5);
  S.leader(s, [[148, 51], wl]);
  S.leader(s, [[192, 51], wr]);
  S.label(s, 170, 56, "세포벽", { size: 14, anchor: "middle" });
  S.leader(s, [[160, 92], leaf.nucleus]);
  S.leader(s, [[180, 92], rootC.nucleus]);
  S.label(s, 170, 97, "핵", { size: 14, anchor: "middle" });
  // 세포 칸 눈금(두 세포 같은 배율)
  L.scaleBar(s, 170 - 5 * K, 170 + 5 * K, 140, "10 µm");
  // 확대 원 이름과 눈금(두 원 같은 배율: 1 µm 막대가 같은 길이)
  S.label(s, EC[0], EC[1] + RC + 20, "엽록체(광합성)", { size: 14, anchor: "middle" });
  S.label(s, EM[0], EM[1] + RM + 20, "마이토콘드리아(호흡)", { size: 14, anchor: "middle" });
  L.scaleBar(s, EM[0] - 31, EM[0] - 31 + M, EM[1] + 21, "1 µm", { side: "right" });
  L.scaleBar(s, EC[0] - 22, EC[0] - 22 + M, EC[1] + 58, "1 µm", { side: "right" });
  // 엽록체 속: 엽록소 자리는 원 안 위에, 녹말은 원 밖 오른쪽에
  const gTop = grana.filter((g) => g.y < CC[1] - 5).sort((a, b) => Math.abs(a.x - CC[0] - 10) - Math.abs(b.x - CC[0] - 10))[0];
  const gTopY = gTop.y - (gTop.nd * 1.9) / 2 - 1.5;
  S.leader(s, [[gTop.x, CC[1] - 47], [gTop.x, gTopY]]);
  S.label(s, EC[0], CC[1] - 51, "엽록소가 들어 있는 곳", { size: 13.5, anchor: "middle" });
  const st0 = starch[1];
  S.leader(s, [[200, 318], [st0.x + st0.a * 0.45, st0.y + st0.b * 0.1]]);
  S.label(s, 204, 323, "녹말 알갱이", { size: 14 });
}
