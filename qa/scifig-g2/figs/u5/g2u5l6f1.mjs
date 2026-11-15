// g2u5l6f1 잎이 하나 달린 줄기 토막(입체). 앞 오른쪽 4분의 1을 떼어 낸 원기둥:
//   윗면 = 가로로 자른 면(겉껍질, 둥글게 한 바퀴 늘어선 다발 10개: 바깥쪽 체관, 안쪽 물관, 가운데 연한 부분),
//   앞면 = 가운데 축에서 바깥까지 세로로 자른 면(다발 하나를 펼친 면: 안쪽 물관, 바깥쪽 체관, 마디에서 잎으로 가는 갈래).
//   두 면은 같은 다발(φ = 0)에서 만난다: 윗면의 물관 구멍 자리 = 앞면의 물관 줄 자리.
// 정사영, 위에서 24° 내려다봄: 화면 X = cx + x, 화면 Y = (높이에 따른 기준) + z·sin24°. 검산 메모는 g2u5l6f1.md
import { lib } from "./_lib.mjs";

export const meta = {
  key: "g2u5l6f1",
  w: 340,
  h: 398,
  alt: "잎이 하나 달린 줄기 토막을 앞 오른쪽 4분의 1만큼 잘라 낸 입체 그림. 윗면의 가로로 자른 면에는 겉껍질 안쪽에 다발이 둥글게 한 바퀴 늘어서 있고, 다발마다 바깥쪽이 체관, 안쪽이 물관이에요. 앞면의 세로로 자른 면에서 안쪽의 굵은 물관은 벽에 고리와 나선 무늬가 있고, 바깥쪽의 가는 체관은 칸막이마다 작은 구멍이 나 있어요. 물관의 물은 위로만 가고, 잎에서 온 설탕은 마디에서 위쪽 체관으로는 위로, 아래쪽 체관으로는 아래로 가요.",
};

const WATER = "#3B9AE1", SUGAR = "#F08C00";

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const L = lib(kit);
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(83);
  P.plate(t, nz, { top: "#FDFDFB", bottom: "#F1F4EE", grain: 0.012 });

  // ── 기하 ──
  const R = 112, cx = 122;
  const E = (24 * Math.PI) / 180, sE = Math.sin(E), cE = Math.cos(E);
  const yTop = 84, Hs = 256, yBot = yTop + Hs; // 앞면(z = 0)의 위아래 가장자리
  const b = R * sE;
  // 반지름 방향 띠(R에 대한 비): 가운데 연한 부분, 물관 띠, 형성층, 체관 띠, 겉껍질 속(피층), 겉껍질(표피)
  const Z = { pith: 0.27, xyl: 0.62, cam: 0.645, phl: 0.8, ctx: 0.965 };
  const NB = 10; // 다발 수(봉선화 같은 쌍떡잎식물 줄기: 한 바퀴)
  const yAt = yTop + 0.36 * Hs; // 잎자루가 붙는 높이(바깥 가장자리)
  // 앞면의 관 자리(u = x/R)
  const VES = [
    { k: "ring", u0: 0.285, u1: 0.333 },
    { k: "spiral", u0: 0.35, u1: 0.41 },
    { k: "spiral2", u0: 0.435, u1: 0.515 },
    { k: "net", u0: 0.535, u1: 0.61 },
  ];
  const SIEVE = [
    { u0: 0.655, u1: 0.695, cc: [0.697, 0.716] },
    { u0: 0.722, u1: 0.762, cc: [0.764, 0.783] },
  ];
  const X = (u) => cx + u * R;
  const mix = (a, c, f) => [a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f, a[2] + (c[2] - a[2]) * f];

  // 격자를 흔든 세포 무늬(가로 간격 spx, 세로 간격 spy): 가장 가까운 두 씨앗까지 거리(칸 단위)와 씨앗 번호
  function gridCells(x0, y0, spx, spy, seed) {
    const r = N.rng(seed);
    const cache = new Map();
    const jit = (i, j) => {
      const key = i * 10007 + j;
      let v = cache.get(key);
      if (!v) {
        v = [i + 0.18 + 0.64 * r(), j + 0.18 + 0.64 * r()];
        cache.set(key, v);
      }
      return v;
    };
    // 미리 넉넉히 만들어 같은 씨앗이 언제나 같은 자리
    for (let i = -2; i < 140; i++) for (let j = -2; j < 140; j++) jit(i, j);
    return (x, y) => {
      const gx = (x - x0) / spx, gy = (y - y0) / spy;
      const ix = Math.floor(gx), iy = Math.floor(gy);
      let d1 = 9, d2 = 9, id = 0;
      for (let i = ix - 1; i <= ix + 1; i++)
        for (let j = iy - 1; j <= iy + 1; j++) {
          const s = jit(i, j);
          const d = Math.hypot(gx - s[0], gy - s[1]);
          if (d < d1) { d2 = d1; d1 = d; id = i * 131 + j * 17; }
          else if (d < d2) d2 = d;
        }
      return [d1, d2, id];
    };
  }
  const hash = (n) => {
    const v = Math.sin(n * 91.345 + 7.13) * 43758.5453;
    return v - Math.floor(v);
  };
  // 세포 한 칸의 색: 속 색 + 벽(밝은 테와 진한 심). wpx = 벽 반 두께(칸 단위 거리 차를 px로 바꾼 값 기준)
  const cellCol = (inner, wall, c, sp, wpx = 0.55, vary = 6) => {
    const dpx = ((c[1] - c[0]) / 2) * sp;
    const v = (hash(c[2]) - 0.5) * vary;
    let col = [inner[0] + v, inner[1] + v, inner[2] + v * 0.6];
    const core = 1 - P.smooth(wpx - 0.35, wpx + 0.45, dpx);
    const hl = (1 - P.smooth(wpx, wpx + 1.3, dpx)) * (1 - core);
    col = mix(col, [255, 255, 255], hl * 0.35);
    return mix(col, wall, core * 0.9);
  };

  // 조직 색(밝은 판)
  const T = {
    pith: { in: [247, 248, 239], wall: [196, 203, 182], sp: 10 },
    ray: { in: [243, 246, 233], wall: [192, 203, 176], sp: 7 },
    xyl: { in: [226, 238, 247], wall: [146, 172, 193], sp: 4.2 },
    cam: { in: [238, 243, 228], wall: [188, 200, 172], sp: 2.6 },
    phl: { in: [252, 237, 214], wall: [214, 178, 136], sp: 3.4 },
    ctx: { in: [216, 237, 196], wall: [146, 188, 118], sp: 6 },
    epi: { in: [176, 212, 138], wall: [104, 152, 74], sp: 3.4 },
  };

  // ── 바닥 그림자 ──
  P.softShadow(t, cx + 10, yBot + b + 6, R * 1.15, 13, 0.2);

  // ── 잎자루와 잎(줄기보다 먼저: 잎자루 밑동은 앞면 뒤에 숨는다) ──
  const pBase = [X(1) - 3, yAt], pEnd = [X(1) + 34, yAt - 27];
  const leafAng = (-58 * Math.PI) / 180;
  const LEN = 104, HW = 25;
  const lb = [pEnd[0] - 2, pEnd[1] + 1]; // 잎몸이 시작하는 곳
  {
    // 잎자루: 둥근 막대(왼쪽 위가 밝다)
    const dx = pEnd[0] - pBase[0], dy = pEnd[1] - pBase[1], Lp = Math.hypot(dx, dy);
    const ux = dx / Lp, uy = dy / Lp, nx = -uy, ny = ux;
    const pw = 6.6; // 잎자루 반 굵기: 물관 길과 체관 길이 나란히 들어간다
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pBase[0] + nx * pw * 1.15, pBase[1] + ny * pw * 1.15);
    ctx.quadraticCurveTo((pBase[0] + pEnd[0]) / 2 + nx * pw, (pBase[1] + pEnd[1]) / 2 + ny * pw + 1.5, pEnd[0] + nx * pw * 0.8, pEnd[1] + ny * pw * 0.8);
    ctx.lineTo(pEnd[0] - nx * pw * 0.8, pEnd[1] - ny * pw * 0.8);
    ctx.quadraticCurveTo((pBase[0] + pEnd[0]) / 2 - nx * pw, (pBase[1] + pEnd[1]) / 2 - ny * pw + 1.5, pBase[0] - nx * pw * 1.15, pBase[1] - ny * pw * 1.15);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, pBase[0] - nx * pw, pBase[1] - ny * pw, pBase[0] + nx * pw, pBase[1] + ny * pw, [[0, "#9BD06F"], [0.45, "#6FB24B"], [1, "#3F8130"]]);
    ctx.fill();
    ctx.restore();
    // 잎몸: 달걀 모양, 가운데 잎맥에서 살짝 접혀 한쪽이 밝다
    ctx.save();
    ctx.translate(lb[0], lb[1]);
    ctx.rotate(leafAng);
    const blade = (side) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      if (side < 0) {
        ctx.bezierCurveTo(LEN * 0.12, -HW * 1.05, LEN * 0.62, -HW * 1.15, LEN, -1);
        ctx.lineTo(LEN, 0);
      } else {
        ctx.lineTo(LEN, 0);
        ctx.bezierCurveTo(LEN * 0.62, HW * 1.1, LEN * 0.12, HW * 1.0, 0, 0);
      }
      ctx.closePath();
    };
    P.dropShadow(t, (q) => {
      q.moveTo(0, 0);
      q.bezierCurveTo(LEN * 0.12, -HW * 1.05, LEN * 0.62, -HW * 1.15, LEN, 0);
      q.bezierCurveTo(LEN * 0.62, HW * 1.1, LEN * 0.12, HW * 1.0, 0, 0);
    }, { dx: 3, dy: 5, blur: 7, a: 0.2 });
    blade(-1);
    ctx.fillStyle = P.lg(ctx, 0, -HW, 0, 0, [[0, "#86CB5C"], [1, "#5DAD3F"]]);
    ctx.fill();
    blade(1);
    ctx.fillStyle = P.lg(ctx, 0, 0, 0, HW, [[0, "#4E9A35"], [1, "#3A7F2A"]]);
    ctx.fill();
    // 잎맥: 가운데 잎맥과 곁잎맥(깃 모양)
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(225,245,200,.9)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(LEN - 3, 0);
    ctx.stroke();
    ctx.lineWidth = 0.8;
    for (let i = 1; i <= 5; i++) {
      const x0 = (i / 6.2) * LEN;
      const reach = HW * (1 - Math.abs(i / 6.2 - 0.4) * 0.9) * 0.85;
      for (const sg of [-1, 1]) {
        ctx.strokeStyle = sg < 0 ? "rgba(225,245,200,.8)" : "rgba(190,225,160,.55)";
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        ctx.quadraticCurveTo(x0 + reach * 0.45, sg * reach * 0.5, x0 + reach * 0.85, sg * reach);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.beginPath();
    ctx.ellipse(LEN * 0.42, -HW * 0.5, LEN * 0.3, HW * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── 바깥 겉면(앞 왼쪽 4분의 1): 원기둥 음영, 세로 결, 마디 테 ──
  {
    const Lw = P.norm3([-0.5, 0.62, 0.6]); // 세계 좌표(x 오른쪽, y 위, z 앞)에서 빛 쪽
    P.shade(t, { x: cx - R - 1, y: yTop - 2, w: R + 2, h: Hs + b + 6 }, (Xp, Yp) => {
      const sx = (cx - Xp) / R;
      if (sx < 0 || sx > 1) return null;
      const al = Math.asin(Math.min(1, sx));
      const off = R * Math.cos(al) * sE;
      const top = yTop + off, bot = yBot + off;
      if (Yp < top - 0.5 || Yp > bot + 0.5) return null;
      const cov = Math.min(P.clamp(Yp - top + 0.5), P.clamp(bot - Yp + 0.5), P.clamp((cx - Xp) * 3 + 0.5), P.clamp((1 - sx) * R + 0.5));
      const n = [-Math.sin(al), 0, Math.cos(al)];
      const lam = Math.max(0, n[0] * Lw[0] + n[2] * Lw[2]);
      let col = mix([60, 118, 46], [156, 210, 116], P.clamp(0.08 + 0.95 * lam));
      // 둥근 몸의 은은한 윤기(빛을 정면으로 받는 띠)
      const spec = Math.pow(Math.max(0, n[0] * Lw[0] + n[2] * Lw[2]), 18);
      col = mix(col, [236, 248, 220], spec * 0.35);
      // 세로 결(가는 이랑)
      const ridge = Math.sin(al * 46 + nz.n2(al * 6, Yp * 0.02) * 2.5);
      col = mix(col, ridge > 0 ? [170, 220, 130] : [40, 90, 32], Math.abs(ridge) * 0.12);
      // 마디: 잎이 붙은 높이에 살짝 부푼 테
      const yn = yAt + off;
      const dn = (Yp - yn) / 3.2;
      col = mix(col, [44, 96, 36], Math.exp(-dn * dn) * 0.35);
      col = mix(col, [190, 230, 150], Math.exp(-((dn + 1.4) ** 2)) * 0.25);
      // 가장자리로 갈수록 살짝 어둡게(둥근 몸)
      col = mix(col, [30, 60, 25], Math.pow(sx, 6) * 0.25);
      return [col[0], col[1], col[2], cov];
    });
  }

  // ── 앞면(세로로 자른 면, z = 0, 축에서 바깥까지) ──
  const cellsF = {
    pith: gridCells(cx, yTop, 10.5, 12, 3),
    xyl: gridCells(cx, yTop, 3.6, 15, 4),
    cam: gridCells(cx, yTop, 2.2, 17, 5),
    phl: gridCells(cx, yTop, 3.2, 13, 6),
    ctx: gridCells(cx, yTop, 7, 9, 7),
    col: gridCells(cx, yTop, 3.6, 8, 8),
    epi: gridCells(cx, yTop, 4.4, 11, 9),
  };
  // 잎으로 가는 갈래(마디): 다발 바깥쪽에서 비스듬히 위로, 바깥 가장자리의 잎자루 밑동까지
  const TR = [[X(0.615), yAt + 36], [X(0.83), yAt + 22], [X(1) + 1, yAt - 1]];
  const qpt = (u) => [(1 - u) ** 2 * TR[0][0] + 2 * (1 - u) * u * TR[1][0] + u * u * TR[2][0], (1 - u) ** 2 * TR[0][1] + 2 * (1 - u) * u * TR[1][1] + u * u * TR[2][1]];
  const trS = Array.from({ length: 61 }, (_, i) => qpt(i / 60));
  const trHalf = 9.5;
  const traceAt = (x, y) => {
    if (x < TR[0][0] - 12 || y < TR[2][1] - 14 || y > TR[0][1] + 14) return null;
    let best = 1e9, bi = 0;
    for (let i = 0; i < trS.length; i++) {
      const d = (x - trS[i][0]) ** 2 + (y - trS[i][1]) ** 2;
      if (d < best) { best = d; bi = i; }
    }
    const a = trS[Math.max(0, bi - 1)], c = trS[Math.min(trS.length - 1, bi + 1)];
    const tx = c[0] - a[0], ty = c[1] - a[1], tl = Math.hypot(tx, ty);
    const side = ((x - trS[bi][0]) * -ty + (y - trS[bi][1]) * tx) / tl; // + = 갈래의 위·안쪽(물관 쪽)
    return { d: Math.sqrt(best), side, s: bi / 60 };
  };
  P.shade(t, { x: cx, y: yTop, w: R, h: Hs }, (Xp, Yp) => {
    const u = (Xp - cx) / R;
    if (u < 0 || u > 1) return null;
    let col;
    if (u < Z.pith) col = cellCol(T.pith.in, T.pith.wall, cellsF.pith(Xp, Yp), 11);
    else if (u < Z.xyl) col = cellCol(T.xyl.in, T.xyl.wall, cellsF.xyl(Xp, Yp), 3.6, 0.45, 4);
    else if (u < Z.cam) col = cellCol(T.cam.in, T.cam.wall, cellsF.cam(Xp, Yp), 2.2, 0.38, 3);
    else if (u < Z.phl) col = cellCol(T.phl.in, T.phl.wall, cellsF.phl(Xp, Yp), 3.2, 0.42, 4);
    else if (u < Z.ctx) {
      // 피층: 엽록체가 든 둥근 세포, 겉 가까이는 작은 세포(두꺼운 벽)
      if (u > 0.915) col = cellCol([206, 230, 186], [120, 168, 96], cellsF.col(Xp, Yp), 3.6, 0.6, 4);
      else {
        const c = cellsF.ctx(Xp, Yp);
        col = cellCol(T.ctx.in, T.ctx.wall, c, 7, 0.55, 8);
        const dd = (c[1] - c[0]) * 3.5;
        const g = nz.n2(Xp * 0.9, Yp * 0.9);
        if (dd < 2.6 && dd > 0.9 && g > 0.15) col = mix(col, [90, 160, 64], 0.55);
      }
    } else col = cellCol(T.epi.in, T.epi.wall, cellsF.epi(Xp, Yp), 4.4, 0.5, 4);
    // 마디의 갈래
    const tr = traceAt(Xp, Yp);
    if (tr && tr.d < trHalf + 1) {
      const inner = tr.side > 0;
      const base = inner ? [222, 236, 248] : [252, 234, 210];
      const wall = inner ? [140, 168, 192] : [210, 170, 128];
      const c = (inner ? cellsF.xyl : cellsF.phl)(Xp * 0.8 + Yp * 0.6, Yp * 0.8 - Xp * 0.6);
      const tc = cellCol(base, wall, c, 3.4, 0.45, 3);
      col = mix(col, tc, P.clamp(trHalf + 1 - tr.d));
      if (tr.d > trHalf - 0.8) col = mix(col, [150, 170, 140], 0.35 * (1 - Math.abs(tr.d - trHalf)));
    }
    // 면 전체: 세로로 선 면이라 윗면보다 조금 어둡고, 아래로 갈수록 살짝 어둡다
    const k = 0.95 - 0.06 * ((Yp - yTop) / Hs);
    return [col[0] * k, col[1] * k, col[2] * k, 1];
  });

  // ── 앞면의 관: 물관(고리, 나선, 그물 무늬의 굵은 빈 관), 체관(칸막이마다 체처럼 구멍) ──
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx, yTop, R, Hs);
  ctx.clip();
  const inTrace = (y, u) => {
    const tr = traceAt(X(u), y);
    return tr && tr.d < trHalf + 0.5;
  };
  for (const v of VES) {
    const x0 = X(v.u0), x1 = X(v.u1), xm = (x0 + x1) / 2, vw = x1 - x0;
    // 속(빈 관): 연한 물빛, 가운데가 조금 밝다
    ctx.fillStyle = P.lg(ctx, x0, 0, x1, 0, [[0, "#CFE3F2"], [0.4, "#F2F8FD"], [1, "#C4DAEC"]]);
    ctx.fillRect(x0, yTop, vw, Hs);
    ctx.strokeStyle = "#5E7F99";
    ctx.lineWidth = 0.9;
    for (const xx of [x0 + 0.45, x1 - 0.45]) {
      ctx.beginPath();
      ctx.moveTo(xx, yTop);
      ctx.lineTo(xx, yBot);
      ctx.stroke();
    }
    // 벽의 두꺼워진 무늬
    if (v.k === "ring") {
      for (let y = yTop + 2; y < yBot; y += 3.6) {
        ctx.strokeStyle = "#56789A";
        ctx.lineWidth = 0.95;
        ctx.beginPath();
        ctx.ellipse(xm, y, vw / 2 - 0.2, 0.75, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (v.k === "spiral" || v.k === "spiral2") {
      const pitch = v.k === "spiral" ? 4.2 : 4.6;
      const turns = Hs / pitch + 2;
      for (const front of [false, true]) {
        ctx.strokeStyle = front ? "#4F7394" : "rgba(110,145,175,.55)";
        ctx.lineWidth = front ? 1.05 : 0.8;
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i <= turns * 24; i++) {
          const th = (i / 24) * Math.PI * 2;
          const y = yBot + 2 - (th / (2 * Math.PI)) * pitch;
          const x = xm + (vw / 2 - 0.4) * Math.cos(th);
          const isFront = Math.sin(th) > 0;
          if (isFront === front) {
            pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
            pen = true;
          } else pen = false;
        }
        ctx.stroke();
      }
    } else {
      // 그물 무늬: 엇갈린 사선
      ctx.strokeStyle = "#5A7C9C";
      ctx.lineWidth = 0.85;
      for (let y = yTop - vw; y < yBot + vw; y += 5.2) {
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y + vw * 0.55);
        ctx.moveTo(x0, y + vw * 0.55 + 2.6);
        ctx.lineTo(x1, y + 2.6);
        ctx.stroke();
      }
    }
    // 관 마디 자리(위아래 세포가 이어진 곳, 칸막이는 뚫려 없다): 벽의 작은 턱만
    ctx.strokeStyle = "rgba(70,100,130,.7)";
    ctx.lineWidth = 1;
    for (let y = yTop + 30 + v.u0 * 40; y < yBot; y += 46) {
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + 1.4, y + 0.6);
      ctx.moveTo(x1, y);
      ctx.lineTo(x1 - 1.4, y + 0.6);
      ctx.stroke();
    }
    // 입체: 왼쪽 벽 안쪽에 그늘, 오른쪽에 반사광
    ctx.fillStyle = "rgba(60,90,120,.10)";
    ctx.fillRect(x0 + 0.9, yTop, vw * 0.22, Hs);
  }
  for (const sv of SIEVE) {
    const x0 = X(sv.u0), x1 = X(sv.u1), vw = x1 - x0, xm = (x0 + x1) / 2;
    ctx.fillStyle = P.lg(ctx, x0, 0, x1, 0, [[0, "#F6DDB8"], [0.45, "#FFF4E3"], [1, "#F0D2A8"]]);
    ctx.fillRect(x0, yTop, vw, Hs);
    ctx.strokeStyle = "#A87A44";
    ctx.lineWidth = 0.8;
    for (const xx of [x0 + 0.4, x1 - 0.4]) {
      ctx.beginPath();
      ctx.moveTo(xx, yTop);
      ctx.lineTo(xx, yBot);
      ctx.stroke();
    }
    // 반세포(곁의 가는 세포, 핵 점)
    const c0 = X(sv.cc[0]), c1 = X(sv.cc[1]);
    ctx.fillStyle = "#F3DFC0";
    ctx.fillRect(c0, yTop, c1 - c0, Hs);
    ctx.strokeStyle = "rgba(170,130,85,.75)";
    ctx.lineWidth = 0.6;
    ctx.strokeRect(c0, yTop - 2, c1 - c0, Hs + 4);
    // 칸막이(체판): 일정한 간격, 구멍 난 판
    const step = 19.5;
    const off = sv.u0 * 37;
    for (let y = yTop + off; y < yBot; y += step) {
      ctx.strokeStyle = "#8F6230";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x0 + 0.5, y);
      ctx.lineTo(x1 - 0.5, y);
      ctx.stroke();
      ctx.fillStyle = "#FFF7EA";
      for (let k = 1; k <= 3; k++) {
        ctx.beginPath();
        ctx.arc(x0 + (vw * k) / 4, y, 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
      // 반세포의 칸과 핵
      ctx.strokeStyle = "rgba(170,130,85,.75)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(c0, y + 4);
      ctx.lineTo(c1, y + 4);
      ctx.stroke();
      ctx.fillStyle = "rgba(150,105,60,.65)";
      ctx.beginPath();
      ctx.ellipse((c0 + c1) / 2, y + 12, 0.75, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    void xm;
  }
  // 마디의 갈래 위에 다시: 갈래 속 물관 하나(나선), 체관 하나(칸막이)
  const lane = (off) => trS.map((p, i) => {
    const a = trS[Math.max(0, i - 1)], c = trS[Math.min(trS.length - 1, i + 1)];
    const tx = c[0] - a[0], ty = c[1] - a[1], tl = Math.hypot(tx, ty);
    return [p[0] - (ty / tl) * off, p[1] + (tx / tl) * off];
  });
  const laneV = lane(-4.4), laneS = lane(4.6);
  {
    // 갈래 바탕: 위(안쪽) 절반은 물관 쪽 빛, 아래(바깥쪽) 절반은 체관 쪽 빛. 줄기의 체관이 여기서 갈래와 이어진다
    const band = (o0, o1, fill) => {
      const a = lane(o0), c = lane(o1);
      ctx.beginPath();
      a.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      for (let i = c.length - 1; i >= 0; i--) ctx.lineTo(c[i][0], c[i][1]);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    };
    band(-trHalf, 0, "rgba(222,236,248,.96)");
    band(0, trHalf, "rgba(252,234,210,.96)");
    ctx.save();
    ctx.strokeStyle = "rgba(120,140,110,.6)";
    ctx.lineWidth = 0.8;
    for (const o of [-trHalf, trHalf]) {
      ctx.beginPath();
      lane(o).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.stroke();
    }
    ctx.restore();
    const tube = (pts, wdt, fill, wall) => {
      ctx.lineCap = "butt";
      ctx.strokeStyle = wall;
      ctx.lineWidth = wdt + 1.4;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.stroke();
      ctx.strokeStyle = fill;
      ctx.lineWidth = wdt;
      ctx.stroke();
    };
    tube(laneV, 6.2, "#EAF4FC", "#5E7F99");
    tube(laneS, 4.4, "#FFF2DF", "#A87A44");
    // 갈래 물관의 나선, 체관의 칸막이
    ctx.strokeStyle = "#4F7394";
    ctx.lineWidth = 0.9;
    for (let i = 2; i < laneV.length - 1; i += 2) {
      const a = laneV[i - 1], c = laneV[i + 1], p = laneV[i];
      const tx = c[0] - a[0], ty = c[1] - a[1], tl = Math.hypot(tx, ty);
      const nx = -ty / tl, ny = tx / tl;
      ctx.beginPath();
      ctx.moveTo(p[0] + nx * 3 - (tx / tl) * 1.2, p[1] + ny * 3 - (ty / tl) * 1.2);
      ctx.lineTo(p[0] - nx * 3 + (tx / tl) * 1.2, p[1] - ny * 3 + (ty / tl) * 1.2);
      ctx.stroke();
    }
    ctx.strokeStyle = "#8F6230";
    ctx.lineWidth = 1.3;
    for (let i = 6; i < laneS.length - 1; i += 11) {
      const a = laneS[i - 1], c = laneS[i + 1], p = laneS[i];
      const tx = c[0] - a[0], ty = c[1] - a[1], tl = Math.hypot(tx, ty);
      const nx = -ty / tl, ny = tx / tl;
      ctx.beginPath();
      ctx.moveTo(p[0] + nx * 2.2, p[1] + ny * 2.2);
      ctx.lineTo(p[0] - nx * 2.2, p[1] - ny * 2.2);
      ctx.stroke();
    }
  }
  ctx.restore();

  // ── 윗면(가로로 자른 면): 화면 → 원판 좌표로 되돌려 화소마다 ──
  const cellsT = {
    pith: gridCells(-R, -R, 9.5, 9.5, 21),
    gen: gridCells(-R, -R, 5.6, 5.6, 22),
    fine: gridCells(-R, -R, 3.1, 3.1, 23),
  };
  const bundleOf = (x, z) => {
    const r = Math.hypot(x, z) / R;
    const ph = Math.atan2(z, x);
    const step = (2 * Math.PI) / NB;
    const k = Math.round(ph / step);
    const s = r * R * (ph - k * step); // 다발 중심선에서 둘레 방향 거리(px)
    const hw = 6.8 + 8.4 * P.clamp((r - Z.pith) / (Z.phl - Z.pith));
    const q = s / hw;
    const rIn = Z.pith + 0.035 * q * q, rOut = Z.phl - 0.06 * q * q;
    return { r, s, k, in: Math.abs(q) < 1 && r > rIn && r < rOut };
  };
  // 물관 구멍(다발마다 같은 자리): 가운데 줄 넷은 앞면의 관 넷과 같은 자리(r = 관 가운데, 굵기 = 관 너비)
  const LUM = [
    [0.309, 0, 2.7], [0.38, 0, 3.3], [0.475, 0, 4.4], [0.5725, 0, 4.1],
    [0.43, -5.8, 2.3], [0.5, 6.2, 2.9], [0.565, -7.6, 2.8], [0.45, 6.6, 2.2],
  ];
  const SIEVE_T = [[0.675, -2.6, 2.0], [0.742, 2.4, 2.1], [0.71, 6.5, 1.6], [0.7, -7.5, 1.6]];
  P.shade(t, { x: cx - R - 1, y: yTop - b - 1, w: 2 * R + 2, h: 2 * b + 2 }, (Xp, Yp) => {
    const x = Xp - cx, z = (Yp - yTop) / sE;
    if (x > 0 && z > 0) return null;
    const rr = Math.hypot(x, z);
    if (rr > R + 0.5 / sE) return null;
    // 가장자리 부드럽게(세로로 눌린 만큼 넓게)
    const cov = P.clamp((R - rr) * sE * 1.2 + 0.5) * (x > 0 ? P.clamp(-z * sE + 0.5) : 1) * (z > 0 ? P.clamp(-x + 0.5) : 1);
    if (cov <= 0) return null;
    const bd = bundleOf(x, z);
    const r = bd.r;
    let col;
    if (bd.in) {
      if (r > Z.cam) {
        col = cellCol(T.phl.in, T.phl.wall, cellsT.fine(x, z), 3.1, 0.42, 5);
        for (const [rr0, s0, rad] of SIEVE_T) {
          const d = Math.hypot((r - rr0) * R, bd.s - s0);
          if (d < rad + 0.6) col = d < rad ? mix([255, 246, 232], [240, 214, 175], d / rad) : [176, 128, 78];
        }
      } else if (r > Z.xyl) col = cellCol(T.cam.in, T.cam.wall, cellsT.fine(x, z), 3.1, 0.4, 3);
      else {
        col = cellCol(T.xyl.in, T.xyl.wall, cellsT.fine(x, z), 3.1, 0.42, 4);
        for (const [rr0, s0, rad] of LUM) {
          const d = Math.hypot((r - rr0) * R, bd.s - s0);
          if (d < rad + 1.1) {
            col = d < rad ? mix([246, 251, 255], [214, 230, 244], (d / rad) ** 2) : mix([92, 124, 152], [130, 160, 186], (d - rad) / 1.1);
          }
        }
      }
    } else if (r < Z.pith + 0.01) {
      col = cellCol(T.pith.in, T.pith.wall, cellsT.pith(x, z), 9.5, 0.55, 5);
    } else if (r < Z.phl) col = cellCol(T.ray.in, T.ray.wall, cellsT.gen(x, z), 5.6, 0.5, 5);
    else if (r < Z.ctx) {
      const c = cellsT.gen(x, z);
      col = cellCol(T.ctx.in, T.ctx.wall, c, 5.6, 0.5, 7);
      const dd = (c[1] - c[0]) * 2.8;
      if (dd < 2.2 && dd > 0.7 && nz.n2(x * 0.8, z * 0.8) > 0.2) col = mix(col, [90, 160, 64], 0.5);
    } else col = cellCol(T.epi.in, T.epi.wall, cellsT.fine(x, z), 3.1, 0.5, 4);
    // 윗면은 빛을 바로 받아 밝다. 가장자리 테(겉껍질 바깥)는 조금 진하게
    const k = 1.0 - 0.05 * P.smooth(0.9, 1, rr / R);
    return [col[0] * k, col[1] * k, col[2] * k, cov];
  });

  // ── 자른 모서리의 빛 ──
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,.95)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(cx, yTop);
  ctx.lineTo(cx + R, yTop); // 윗면과 앞면이 만나는 모서리
  ctx.moveTo(cx, yTop);
  ctx.lineTo(cx, yTop + b); // 윗면의 다른 자른 모서리
  ctx.stroke();
  // 윗면의 앞 왼쪽 테두리(겉면과 만나는 모서리)
  ctx.beginPath();
  ctx.ellipse(cx, yTop, R, b, 0, Math.PI / 2, Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,.7)";
  ctx.lineWidth = 1.1;
  ctx.stroke();
  // 앞면의 가장자리 선(살짝)
  ctx.strokeStyle = "rgba(70,95,60,.35)";
  ctx.lineWidth = 0.9;
  ctx.strokeRect(cx, yTop, R, Hs);
  ctx.restore();

  // ── 겹층: 화살표와 글자 ──
  const s = S.svgLayer(root, w, h);
  const xv = (X(0.435) + X(0.515)) / 2; // 굵은 물관 가운데
  const xs1 = (X(SIEVE[0].u0) + X(SIEVE[0].u1)) / 2, xs2 = (X(SIEVE[1].u0) + X(SIEVE[1].u1)) / 2;
  // 잎자루 속 두 길: 위 절반(물관 길), 아래 절반(체관 길). 잎맥으로 이어지면 물관이 위, 체관이 아래(g2u5l1f1과 같다)
  const pdx = pEnd[0] - pBase[0], pdy = pEnd[1] - pBase[1], pl = Math.hypot(pdx, pdy);
  const pu = [pdx / pl, pdy / pl], pn = [-pu[1], pu[0]]; // pn: 잎자루의 아래쪽
  const along = (f, off) => [pBase[0] + pdx * f + pn[0] * off, pBase[1] + pdy * f + pn[1] * off];
  const lu = [Math.cos(leafAng), Math.sin(leafAng)], ln = [-lu[1], lu[0]];
  const inBlade = (d, off) => [lb[0] + lu[0] * d + ln[0] * off, lb[1] + lu[1] * d + ln[1] * off];
  // 물: 굵은 물관 속에서 아래에서 위로만(마디 아래와 위 모두)
  S.fatArrow(s, [[xv, yBot - 6], [xv, yTop + 14]], { fill: WATER, w0: 3.6, w1: 5, head: 10, hw: 6.5, sw: 1 });
  // 물의 갈래: 바깥쪽 물관에서 갈래의 위 길, 잎자루의 위 절반을 지나 잎으로
  const xm = X(0.5725);
  const wPath = [[xm, yAt + 58], [xm, yAt + 46], [xm + 1.2, yAt + 38.5]].concat(laneV.slice(3), [along(0.35, -3.2), along(0.75, -3.2), inBlade(4, -2.6), inBlade(17, -1.5)]);
  S.fatArrow(s, wPath, { fill: WATER, w0: 3, w1: 4.2, head: 8.5, hw: 5.6, sw: 1 });
  // 설탕: 잎에서 잎자루의 아래 절반, 갈래의 아래 길로 들어와 바깥쪽 체관에 닿는다
  let jI = 0;
  laneS.forEach((q, i) => { if (Math.abs(q[0] - xs2) < Math.abs(laneS[jI][0] - xs2)) jI = i; });
  const J = laneS[jI];
  const sPath = [inBlade(17, 2.4), inBlade(4, 3.2), along(0.75, 3.4), along(0.35, 3.4)].concat(laneS.slice(jI).reverse());
  S.fatArrow(s, sPath, { fill: SUGAR, w0: 3, w1: 4.2, head: 8.5, hw: 5.6, sw: 1 });
  // 마디에서 나뉜다: 바깥쪽 체관은 위로, 안쪽 체관은 아래로(한 관 속에서 맞부딪치지 않게 관을 나눈다)
  // 갈래 띠의 위아래 가장자리(그 x에서): 위로 가는 화살표는 띠 바로 위에서, 아래로 가는 화살표는 띠 바로 아래에서 시작
  const edgeY = (arr, x) => arr.reduce((m, q) => (Math.abs(q[0] - x) < Math.abs(m[0] - x) ? q : m), arr[0])[1];
  const upTop = edgeY(lane(-trHalf), xs2), dnBot = edgeY(lane(trHalf), xs1);
  S.fatArrow(s, [[xs2, upTop - 1.5], [xs2, yTop + 16]], { fill: SUGAR, w0: 3.2, w1: 4.6, head: 9.5, hw: 6.2, sw: 1 });
  S.fatArrow(s, [[xs1, dnBot + 1.5], [xs1, yBot - 10]], { fill: SUGAR, w0: 3.2, w1: 4.6, head: 9.5, hw: 6.2, sw: 1 });

  // 라벨
  S.leader(s, [[60, 22], [60, yTop - b * 0.45]]);
  S.label(s, 10, 18, "줄기를 가로로 자른 면", { size: 14 });
  const rim = [cx + R * 0.975 * Math.cos(-1.05), yTop + R * 0.975 * Math.sin(-1.05) * sE];
  S.leader(s, [[236, 26], rim]);
  S.label(s, 240, 31, "줄기의 바깥쪽", { size: 14 });
  S.leader(s, [[236, 49], [cx + 1, yTop - 2]]);
  S.label(s, 240, 54, "줄기의 가운데", { size: 14 });
  S.label(s, pEnd[0] + 6, pEnd[1] - 40, "잎", { size: 14 });
  S.label(s, pEnd[0] - 30, pEnd[1] - 8, "물", { size: 14, color: "#1F6FB2" });
  S.label(s, pEnd[0] + 10, pEnd[1] + 26, "설탕", { size: 14, color: "#B85F00" });
  S.leader(s, [[244, 246], [X(0.9), 246]]);
  S.label(s, 248, 251, "세로로 자른 면", { size: 14 });
  S.leader(s, [[xv, yBot + 12], [xv, yBot - 4]]);
  S.label(s, xv, yBot + 27, "물관", { size: 14, anchor: "middle" });
  S.leader(s, [[(xs1 + xs2) / 2 + 6, yBot + 12], [xs2, yBot - 3]]);
  S.label(s, (xs1 + xs2) / 2 + 8, yBot + 27, "체관", { size: 14, anchor: "middle" });
}
