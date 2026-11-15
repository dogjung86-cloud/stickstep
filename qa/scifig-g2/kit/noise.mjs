// 씨앗을 주는 노이즈: 심플렉스 2D·3D, 겹친 노이즈(fbm), 능선 노이즈, 세포 노이즈(보로노이).
// 질감(암석 결, 막, 섬유, 액체의 일렁임)을 그릴 때 쓴다. 같은 씨앗이면 언제나 같은 그림이 나온다.

export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const G3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

export function makeNoise(seed = 1) {
  const r = rng(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  const pm12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    pm12[i] = perm[i] % 12;
  }
  const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
  function n2(xin, yin) {
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s), j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - (i - t), y0 = yin - (j - t);
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    let n = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) { const g = G3[pm12[ii + perm[jj]]]; t0 *= t0; n += t0 * t0 * (g[0] * x0 + g[1] * y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) { const g = G3[pm12[ii + i1 + perm[jj + j1]]]; t1 *= t1; n += t1 * t1 * (g[0] * x1 + g[1] * y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) { const g = G3[pm12[ii + 1 + perm[jj + 1]]]; t2 *= t2; n += t2 * t2 * (g[0] * x2 + g[1] * y2); }
    return 70 * n; // 대략 -1~1
  }
  const F3 = 1 / 3, G3c = 1 / 6;
  function n3(xin, yin, zin) {
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
    const t = (i + j + k) * G3c;
    const x0 = xin - (i - t), y0 = yin - (j - t), z0 = zin - (k - t);
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }
    const x1 = x0 - i1 + G3c, y1 = y0 - j1 + G3c, z1 = z0 - k1 + G3c;
    const x2 = x0 - i2 + 2 * G3c, y2 = y0 - j2 + 2 * G3c, z2 = z0 - k2 + 2 * G3c;
    const x3 = x0 - 1 + 0.5, y3 = y0 - 1 + 0.5, z3 = z0 - 1 + 0.5;
    const ii = i & 255, jj = j & 255, kk = k & 255;
    let n = 0;
    const c = (tt, gi, x, y, z) => {
      if (tt < 0) return 0;
      const g = G3[gi];
      tt *= tt;
      return tt * tt * (g[0] * x + g[1] * y + g[2] * z);
    };
    n += c(0.6 - x0 * x0 - y0 * y0 - z0 * z0, pm12[ii + perm[jj + perm[kk]]], x0, y0, z0);
    n += c(0.6 - x1 * x1 - y1 * y1 - z1 * z1, pm12[ii + i1 + perm[jj + j1 + perm[kk + k1]]], x1, y1, z1);
    n += c(0.6 - x2 * x2 - y2 * y2 - z2 * z2, pm12[ii + i2 + perm[jj + j2 + perm[kk + k2]]], x2, y2, z2);
    n += c(0.6 - x3 * x3 - y3 * y3 - z3 * z3, pm12[ii + 1 + perm[jj + 1 + perm[kk + 1]]], x3, y3, z3);
    return 32 * n;
  }
  /** 겹친 노이즈: oct 겹, 겹마다 주파수 lac배·세기 gain배 */
  function fbm(x, y, oct = 5, lac = 2, gain = 0.5) {
    let a = 1, f = 1, s = 0, norm = 0;
    for (let o = 0; o < oct; o++) {
      s += a * n2(x * f, y * f);
      norm += a;
      a *= gain;
      f *= lac;
    }
    return s / norm;
  }
  function fbm3(x, y, z, oct = 5, lac = 2, gain = 0.5) {
    let a = 1, f = 1, s = 0, norm = 0;
    for (let o = 0; o < oct; o++) {
      s += a * n3(x * f, y * f, z * f);
      norm += a;
      a *= gain;
      f *= lac;
    }
    return s / norm;
  }
  /** 능선 노이즈(0~1): 갈라진 결, 균열, 엽리 같은 줄무늬에 */
  function ridge(x, y, oct = 5) {
    let a = 0.5, f = 1, s = 0, norm = 0;
    for (let o = 0; o < oct; o++) {
      const v = 1 - Math.abs(n2(x * f, y * f));
      s += a * v * v;
      norm += a;
      a *= 0.5;
      f *= 2.03;
    }
    return s / norm;
  }
  return { n2, n3, fbm, fbm3, ridge };
}

/** 세포 노이즈: 점 집합을 받아 (x,y)에서 가장 가까운 두 점까지의 거리 d1·d2와 그 점의 번호를 돌려준다.
 *  광물 알갱이, 세포, 결정 경계를 그릴 때 쓴다(d2 - d1 이 작으면 경계). */
export function makeCells(points, cell = 40) {
  const grid = new Map();
  const key = (i, j) => i * 73856093 ^ j * 19349663;
  points.forEach((p, idx) => {
    const k = key(Math.floor(p[0] / cell), Math.floor(p[1] / cell));
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(idx);
  });
  return function near(x, y) {
    const ci = Math.floor(x / cell), cj = Math.floor(y / cell);
    let d1 = 1e9, d2 = 1e9, i1 = -1;
    for (let di = -2; di <= 2; di++) {
      for (let dj = -2; dj <= 2; dj++) {
        const list = grid.get(key(ci + di, cj + dj));
        if (!list) continue;
        for (const idx of list) {
          const p = points[idx];
          const d = Math.hypot(x - p[0], y - p[1]);
          if (d < d1) { d2 = d1; d1 = d; i1 = idx; } else if (d < d2) d2 = d;
        }
      }
    }
    return { d1, d2, i: i1 };
  };
}
