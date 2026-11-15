// g2u5l1f2 현미경으로 본 잎의 표면: 같은 배율의 잎 앞면과 잎 뒷면, 뒷면의 기공 하나를 크게.
// 표본은 µm 좌표로 한 번 정의하고(퍼즐 조각 모양 표면 세포 = 뒤틀린 보로노이, 기공 = 콩 모양 두 세포와 렌즈 모양 구멍),
// 시야 둘과 확대 원을 같은 함수에서 배율만 달리해 그린다(확대 원은 뒷면 시야의 그 자리를 그대로 키운 것). 검산 메모는 g2u5l1f2.md
import { lib } from "./_lib.mjs";

export const meta = {
  key: "g2u5l1f2",
  w: 340,
  h: 400,
  alt: "현미경으로 같은 배율로 본 잎의 앞면과 뒷면. 두 면 모두 퍼즐 조각처럼 맞물린 투명한 세포로 덮여 있고, 앞면에는 기공이 하나뿐이지만 뒷면에는 기공이 여러 개 있어요. 뒷면의 기공 하나를 크게 키우면 엽록체가 든 콩 모양 세포 두 개가 길쭉한 구멍을 감싸고 있어요.",
};

const K1 = 0.7; // 시야 배율(px/µm): 시야 지름 140 px = 200 µm
const K2 = 2.75; // 확대 원 배율(px/µm)
const A_S = 15, B_S = 11.2; // 기공(두 세포를 합친 테두리)의 반 길이, 반 너비(µm): 길이 30 µm

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N, cells: C } = kit;
  const L = lib(kit);
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  P.plate(t, N.makeNoise(31), { top: "#FDFDFB", bottom: "#F1F4EE", grain: 0.012 });

  // ── 표본 만들기 ──
  const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  const look = {
    bg: [238, 242, 226],
    wall: [104, 126, 86],
    halo: [252, 253, 246],
    gLight: [192, 224, 140],
    gDark: [92, 140, 58],
    chl: [62, 116, 40],
    pore: [46, 60, 38],
    lip: [240, 245, 226],
  };

  // 표면 세포: 포아송 씨앗의 보로노이 벽을 벽마다 다른 사인 물결로 휘게 한다(퍼즐 조각의 맞물린 돌기).
  // 물결 세기는 세 칸이 만나는 곳(d3 − d2가 작은 곳)에서 0으로 줄여 벽이 이음매에서 곧게 만나게 한다.
  function specimen(seed, stomataIn, { R, cellD, amp, lam }) {
    const rnd = N.rng(seed);
    const nz = N.makeNoise(seed * 3 + 1);
    const st = stomataIn.map((q) => ({ ...q, a: A_S, b: B_S, c: Math.cos(q.ang), s: Math.sin(q.ang), lp: A_S * 0.6, pw: 2.6 }));
    const seeds = L.poisson(rnd, {
      n: 600,
      minD: cellD,
      box: [-R, -R, R, R],
      inside: (x, y) => x * x + y * y < R * R && st.every((q) => Math.hypot(x - q.x, y - q.y) > q.a + 8),
    });
    const G = cellD;
    const grid = new Map();
    const key = (i, j) => i * 7919 + j;
    seeds.forEach((p, idx) => {
      const k = key(Math.floor(p[0] / G), Math.floor(p[1] / G));
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(idx);
    });
    const hash = (a, b) => {
      const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    const wavy = (x, y, a, b, taper) => {
      const i = Math.min(a, b), j = Math.max(a, b);
      const pa = seeds[i], pb = seeds[j];
      const dx = pb[0] - pa[0], dy = pb[1] - pa[1], Ld = Math.hypot(dx, dy);
      const nx = dx / Ld, ny = dy / Ld;
      const mx = (pa[0] + pb[0]) / 2, my = (pa[1] + pb[1]) / 2;
      const e = (x - mx) * nx + (y - my) * ny;
      const tt = -(x - mx) * ny + (y - my) * nx;
      const hs = hash(i, j);
      const lm = lam * (0.82 + 0.36 * hs), ph = hs * 45.7;
      const A = amp * (0.75 + 0.5 * hash(j, i)) * taper;
      const w2 = (2 * Math.PI) / lm;
      const arg = w2 * tt + ph;
      const wv = A * (Math.sin(arg) + 0.16 * Math.sin(2 * arg + 1.3));
      const sl = A * w2 * (Math.cos(arg) + 0.32 * Math.cos(2 * arg + 1.3));
      return Math.abs(e - wv) / Math.sqrt(1 + sl * sl);
    };
    const wallDist = (x, y) => {
      const ci = Math.floor(x / G), cj = Math.floor(y / G);
      let i1 = -1, i2 = -1, i3 = -1, d1 = 1e9, d2 = 1e9, d3 = 1e9;
      for (let di = -2; di <= 2; di++)
        for (let dj = -2; dj <= 2; dj++) {
          const list = grid.get(key(ci + di, cj + dj));
          if (!list) continue;
          for (const idx of list) {
            const p = seeds[idx];
            const d = (x - p[0]) ** 2 + (y - p[1]) ** 2;
            if (d < d1) { d3 = d2; i3 = i2; d2 = d1; i2 = i1; d1 = d; i1 = idx; }
            else if (d < d2) { d3 = d2; i3 = i2; d2 = d; i2 = idx; }
            else if (d < d3) { d3 = d; i3 = idx; }
          }
        }
      if (i2 < 0) return 99;
      const r1 = Math.sqrt(d1), r2 = Math.sqrt(d2), r3 = Math.sqrt(d3);
      if (r2 - r1 > 3.4 * amp + 8) return 99;
      const taper = P.smooth(1.4, 8.5, r3 - r2);
      let dd = wavy(x, y, i1, i2, taper);
      if (i3 >= 0 && r3 - r1 < 3.4 * amp + 8) dd = Math.min(dd, wavy(x, y, i1, i3, taper));
      return dd;
    };
    return { st, seeds, nz, wallDist };
  }

  // 한 화소의 색(µm 좌표). k = px/µm, o.hw = 표면 세포벽 반 두께(px), o.hwS = 기공 테두리 벽 반 두께(px), o.speck = 엽록체를 점으로
  function color(sp, x, y, k, o) {
    let col = look.bg.slice();
    const tx = sp.nz.fbm(x * 0.08 + 3, y * 0.08 - 5, 2);
    col = col.map((v, i) => v + tx * (i === 2 ? 5 : 3.5));
    let dW = 99; // 가장 가까운 벽까지 거리(px)
    let inStoma = null;
    for (const q of sp.st) {
      const dx = x - q.x, dy = y - q.y;
      if (dx * dx + dy * dy > (q.a + 6) ** 2) continue;
      const u = dx * q.c + dy * q.s, v = -dx * q.s + dy * q.c;
      const rho0 = Math.sqrt((u / q.a) ** 2 + (v / q.b) ** 2);
      const rho = rho0 * (1 + 0.24 * Math.exp(-((v / (0.17 * q.b)) ** 2)) * Math.pow(Math.min(1, Math.abs(u) / q.a), 8));
      const g = Math.hypot(u / (q.a * q.a), v / (q.b * q.b)) / Math.max(rho, 1e-6);
      const dE = (rho - 1) / Math.max(g, 1e-6); // 테두리까지 µm(안쪽 음수)
      dW = Math.min(dW, Math.abs(dE) * k * (o.hw / o.hwS));
      if (dE < 0) inStoma = { q, u, v };
    }
    if (inStoma) {
      const { q, u, v } = inStoma;
      const au = Math.abs(u), av = Math.abs(v);
      const poreH = au < q.lp ? q.pw * Math.pow(1 - (au / q.lp) ** 2, 0.8) : 0;
      // 구멍 둘레 벽의 두께: 구멍 끝으로 갈수록 얇아져 두 세포 사이 벽(0.62 µm)으로 이어진다
      const lipW = au < q.lp ? 0.62 + 0.55 * Math.sqrt(1 - (au / q.lp) ** 2) : 0.62;
      const vo = q.b * Math.sqrt(Math.max(0, 1 - (u / q.a) ** 2));
      if (au < q.lp && av < poreH) {
        // 구멍: 가운데가 가장 어둡다
        const f2 = av / Math.max(poreH, 1e-3);
        col = mix(look.pore, [92, 110, 74], f2 * f2);
      } else if (au < q.lp && av < poreH + lipW) {
        // 구멍 둘레의 두꺼운 벽(빛을 꺾어 밝게 보인다), 구멍 쪽 가장자리는 가는 어두운 선
        const e = (av - poreH) / lipW;
        col = mix(look.lip, look.gLight, Math.pow(P.clamp(e), 1.6) * 0.85);
        col = mix(col, look.wall, P.smooth(0.3, 0, e) * 0.85);
      } else if (au >= q.lp && av < 0.62) {
        col = mix(look.wall, [70, 92, 56], 0.5);
      } else {
        // 콩 모양 세포: 소시지 단면처럼 가운데가 볼록, 왼쪽 위 빛
        const vi = au < q.lp ? poreH + lipW : 0.62;
        const s = P.clamp((av - vi) / Math.max(0.5, vo - vi));
        // 세포 양 끝(극)으로 갈수록 얇아져 어둡게: 콩 하나하나가 따로 보이게
        const endF = P.smooth(0.97, 0.7, au / q.a);
        // 볼록함은 대칭으로(가운데 밝게), 왼쪽 위 빛은 약하게 더한다
        const hb = Math.pow(Math.sin(Math.PI * s), 0.6);
        const tilt = -Math.cos(Math.PI * s) * 0.6;
        const sg = v >= 0 ? 1 : -1;
        const dir = [-q.s * sg, q.c * sg];
        const ndl = tilt * (dir[0] * P.LIGHT[0] + dir[1] * P.LIGHT[1]);
        col = mix(look.gDark, look.gLight, P.clamp((0.12 + 0.78 * hb + 0.22 * ndl) * (0.55 + 0.45 * endF)));
        if (o.speck) {
          const nn = sp.nz.n2(x * 0.75 + 40, y * 0.75 - 13);
          const spot = P.smooth(0.12, 0.45, nn) * P.smooth(0.04, 0.22, s) * P.smooth(0.98, 0.8, s);
          col = mix(col, look.chl, spot * 0.9);
        }
      }
    } else {
      const dp = sp.wallDist(x, y) * k;
      dW = Math.min(dW, dp);
    }
    // 벽: 어두운 심 + 양옆 밝은 테
    const hw = o.hw;
    const core = 1 - P.smooth(hw - 0.5, hw + 0.5, dW);
    const halo = (1 - P.smooth(hw + 0.2, hw + 1.8, dW)) * (1 - core);
    col = mix(col, look.halo, halo * 0.5);
    col = mix(col, look.wall, core * 0.92);
    return col;
  }

  function view(sp, c, r, k, center, o) {
    P.shade(t, { x: c[0] - r - 1, y: c[1] - r - 1, w: 2 * r + 2, h: 2 * r + 2 }, (X, Y) => {
      const dx = X - c[0], dy = Y - c[1];
      const dd = Math.hypot(dx, dy);
      const cov = P.clamp(r - dd + 0.5);
      if (cov <= 0) return null;
      const col = color(sp, center[0] + dx / k, center[1] + dy / k, k, o);
      const vig = 1 - 0.09 * Math.pow(dd / r, 4); // 시야 가장자리가 살짝 어둡다
      return [col[0] * vig, col[1] * vig, col[2] * vig, cov];
    });
  }

  // 앞면: 기공 하나(거의 없음), 세포 굴곡은 조금 덜하게
  const spA = specimen(17, [{ x: 34, y: -30, ang: 2.15 }], { R: 140, cellD: 33, amp: 2.7, lam: 23 });
  // 뒷면: 기공 여러 개. 첫째가 확대할 기공(시야 아래쪽 왼편)
  const rS = N.rng(77);
  const stB = [{ x: -14, y: 50, ang: 0 }];
  for (let i = 0; i < 4000 && stB.length < 10; i++) {
    const x = (rS() * 2 - 1) * 110, y = (rS() * 2 - 1) * 110;
    if (x * x + y * y > 110 * 110) continue;
    if (stB.some((q) => Math.hypot(q.x - x, q.y - y) < 60)) continue;
    stB.push({ x, y, ang: rS() * Math.PI });
  }
  const spB = specimen(41, stB, { R: 140, cellD: 29, amp: 4.1, lam: 20 });

  // ── 배치 ──
  const FA = [84, 116], FB = [256, 116], RF = 70;
  const Q0 = stB[0];
  const q0 = [FB[0] + Q0.x * K1, FB[1] + Q0.y * K1];
  const E = [238, 304], RE = 74;

  // 확대 통로(바탕 위, 원들보다 먼저)
  L.lensPath(t, q0, 12.5, E, RE);
  L.lensOpen(t, FA, RF, null, 0.18);
  view(spA, FA, RF, K1, [0, 0], { hw: 0.62, hwS: 0.62, speck: true });
  L.lensClose(t, FA, RF);
  L.lensOpen(t, FB, RF, null, 0.18);
  view(spB, FB, RF, K1, [0, 0], { hw: 0.62, hwS: 0.62, speck: true });
  L.lensClose(t, FB, RF);

  L.lensOpen(t, E, RE, null, 0.2);
  view(spB, E, RE, K2, [Q0.x, Q0.y], { hw: 1.2, hwS: 1.6, speck: false });
  // 확대 원의 엽록체: 콩 모양 세포 안에만, 벽에서 떨어지게
  {
    const rr = N.rng(5);
    for (const q of spB.st) {
      const sx = E[0] + (q.x - Q0.x) * K2, sy = E[1] + (q.y - Q0.y) * K2;
      if (Math.hypot(sx - E[0], sy - E[1]) > RE + q.a * K2) continue;
      for (const sg of [1, -1]) {
        const pts = L.poisson(rr, {
          n: 13,
          minD: 2.55,
          box: [-q.a, 0, q.a, q.b],
          inside: (u, v) => {
            const au = Math.abs(u);
            const poreH = au < q.lp ? q.pw * Math.pow(1 - (au / q.lp) ** 2, 0.8) : 0;
            const vi = au < q.lp ? poreH + 0.62 + 0.55 * Math.sqrt(1 - (au / q.lp) ** 2) : 0.62;
            const vo = q.b * Math.sqrt(Math.max(0, 1 - (u / q.a) ** 2));
            if (vo - vi < 3.2) return false;
            const s = (v - vi) / (vo - vi);
            return s > 0.24 && s < 0.74;
          },
        });
        for (const [u, v0] of pts) {
          const v = v0 * sg;
          const X = sx + (u * q.c - v * q.s) * K2, Y = sy + (u * q.s + v * q.c) * K2;
          C.chloroplast(t, X, Y, 1.05 * K2, 1.42 * K2, Math.atan2(u * q.s + v * q.c, u * q.c - v * q.s) + rr() * 0.6);
        }
      }
    }
  }
  L.lensClose(t, E, RE);
  L.marker(t, q0, 11.5);

  // ── 글자 ──
  const s = S.svgLayer(root, w, h);
  S.label(s, FA[0], 34, "잎 앞면", { size: 15, anchor: "middle" });
  S.label(s, FB[0], 34, "잎 뒷면", { size: 15, anchor: "middle" });
  // 같은 배율: 두 시야 사이 아래의 눈금 막대 하나
  L.scaleBar(s, 170 - 25 * K1, 170 + 25 * K1, 180, "50 µm");
  // 확대 원의 눈금
  L.scaleBar(s, 294, 294 + 10 * K2, 372, "10 µm", { dy: 16 });

  // 지시선: 확대 원 속 대상(기공의 국소 좌표 u, v → 화면)
  const q = spB.st[0];
  const toE = (u, v) => [E[0] + (u * q.c - v * q.s) * K2, E[1] + (u * q.s + v * q.c) * K2];
  const pv = toE(-15.5, -16), gc = toE(-7.5, -6.6), po = toE(-5.2, 0.6);
  S.leader(s, [[104, 216], [150, 216], pv]);
  S.label(s, 12, 221, "잎 표면의 세포", { size: 14, sub: "(엽록체가 없어요)" });
  S.leader(s, [[160, 264], gc]);
  S.label(s, 12, 269, "기공을 둘러싼 두 세포", { size: 14, sub: "(엽록체가 있어요)" });
  S.leader(s, [[46, 334], [192, 334], po]);
  S.label(s, 12, 339, "기공", { size: 14 });
}
