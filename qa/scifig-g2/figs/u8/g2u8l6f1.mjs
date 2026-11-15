// g2u8l6f1 성단과 성운은 우리은하의 어디에 있을까: 옆에서 본 우리은하(얇은 원반, 가운데 티끌 띠, 볼록한 중심부)와
// 원반을 둘러싼 공 모양의 공간. 산개 성단과 성운은 원반(나선팔)에만, 구상 성단은 중심부와 공 모양의 공간에 퍼지며 중심 쪽에 많다.
// 옆모습은 별의 분포 식(지수 원반 + sech² 두께 + 중심부 + 티끌의 빛 가림)으로 화소마다 계산해 그렸다(실제 사진이 아닌 모형).
// 왼쪽 위 작은 원은 위에서 본 상상도(NASA/JPL-Caltech)이고, 성단과 성운 기호는 그 사진의 밝은 나선팔 자리에 놓았다. 검산 메모는 g2u8l6f1.md
import { PH, loadImg, space, maskedImg, glow, ring, dl, dlead, NIGHT, rnd as RND } from "./_lib.mjs";

export const meta = {
  key: "g2u8l6f1",
  w: 340,
  h: 380,
  alt: "옆에서 본 우리은하는 얇은 원반 가운데에 볼록한 중심부가 있어요. 산개 성단과 성운은 원반의 나선팔에 있고, 구상 성단은 중심부와 원반을 둘러싼 공 모양의 공간에 퍼져 있으며 중심 쪽에 많이 모여 있어요. 태양계는 원반에서 중심부와 떨어진 곳에 있어요.",
};

// 축척: 1 kpc = K px, 원반 반지름 15 kpc(지름 약 30000 pc), 공 모양 공간의 반지름도 15 kpc, 태양계는 중심에서 8.5 kpc
export const GAL = { K: 8.4, RD: 15, SUN: 8.5, hR: 4.4, hz: 0.32, hzThick: 0.95, hDust: 0.17 };
const C = [150, 172];

// 위에서 본 상상도에서 고른 자리(원반 반지름 단위, 사진의 원래 방향: 아래가 태양계 쪽). 밝은 나선팔과 붉은 별 탄생 구역.
const ARM_OC = [[-0.696, -0.361], [0.472, 0.544], [-0.213, -0.647], [0.334, -0.425], [-0.419, 0.028], [-0.098, 0.533]];
const ARM_NEB = [[0.611, 0.407], [-0.217, 0.655], [0.306, 0.197], [-0.247, 0.217], [0.19, 0.593]];

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(61);
  const mw = await loadImg(PH.mwTop.src);
  const { K, RD, hR, hz, hzThick, hDust } = GAL;
  const R = RD * K; // 126 px

  space(t, P, nz, { n: 170, seed: 66, bright: 0.7 });

  // ── 공 모양의 공간(별무리 헤일로): 아주 옅은 빛 + 점선 테두리 ──
  {
    const g = ctx.createRadialGradient(C[0], C[1], 0, C[0], C[1], R);
    g.addColorStop(0, "rgba(255,226,180,0.16)");
    g.addColorStop(0.25, "rgba(255,226,180,0.07)");
    g.addColorStop(1, "rgba(255,226,180,0.015)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(C[0], C[1], R, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.strokeStyle = "rgba(255,214,160,0.55)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(C[0], C[1], R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 원반을 감싸는 옅은 빛(두꺼운 원반의 별빛)
  {
    ctx.save();
    ctx.translate(C[0], C[1]);
    ctx.scale(1, 0.13);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.95);
    g.addColorStop(0, "rgba(220,215,200,0.30)");
    g.addColorStop(0.45, "rgba(170,190,235,0.12)");
    g.addColorStop(1, "rgba(170,190,235,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.95, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // ── 원반과 중심부: 화소마다 별빛을 더하고 티끌이 가린다 ──
  const sech2 = (u) => {
    const c = Math.cosh(u);
    return 1 / (c * c);
  };
  const lightAt = (X, Z) => {
    const aX = Math.abs(X);
    const taper = 1 - P.smooth(13.0, 15.3, aX);
    const clump = 0.78 + 0.44 * (0.5 + 0.5 * nz.fbm(X * 1.1 + 7, Z * 2.6, 3));
    const thin = Math.exp(-aX / hR) * sech2(Z / hz) * taper * clump;
    const thick = 0.26 * Math.exp(-aX / 4.6) * sech2(Z / hzThick) * taper;
    // 중심부: 조금 네모난(상자 모양) 볼록한 덩어리
    const ax = Math.abs(X) / 1.45, az = Math.abs(Z) / 1.05;
    const rb = Math.pow(Math.pow(ax, 2.4) + Math.pow(az, 2.4), 1 / 2.4);
    const bulge = 1.3 * Math.exp(-rb / 0.9);
    // 티끌 띠: 원반 한가운데, 군데군데 짙다
    const patch = 0.5 + 0.9 * Math.max(0, 0.5 + 0.65 * nz.fbm(X * 0.8 + 3, Z * 5 + 11, 3));
    const tau = 2.7 * Math.exp(-aX / 6.5) * sech2(Z / hDust) * patch * taper;
    return { thin, thick, bulge, aX, tau };
  };
  P.shade(t, { x: C[0] - R - 4, y: C[1] - 64, w: 2 * R + 8, h: 128 }, (x, y) => {
    const X = (x - C[0]) / K, Z = (y - C[1]) / K;
    const { thin, thick, bulge, aX, tau } = lightAt(X, Z);
    const inner = Math.exp(-aX / 4.0);
    // 원반 빛: 바깥은 푸른 흰빛(젊은 별이 많음), 안쪽은 누런빛. 중심부는 주황빛(늙은 별).
    const disk = thin + thick;
    let r = disk * (0.72 + 0.28 * inner) + bulge * 1.0;
    let g = disk * (0.82 + 0.08 * inner) + bulge * 0.74;
    let b = disk * (1.0 - 0.32 * inner) + bulge * 0.42;
    // 티끌은 파란빛을 더 많이 가린다
    r *= Math.exp(-tau * 0.78);
    g *= Math.exp(-tau * 0.93);
    b *= Math.exp(-tau * 1.1);
    const E = 3.0;
    const tm = (v) => 1 - Math.exp(-E * v);
    const a = Math.max(tm(r), tm(g), tm(b));
    if (a < 0.004) return null;
    const edge = 1 - P.smooth(48, 63, Math.abs(y - C[1])); // 칠하는 칸의 위아래 끝에서 서서히 0
    return [(255 * tm(r)) / a, (255 * tm(g)) / a, (255 * tm(b)) / a, a * edge];
  }, { op: "lighter" });

  // 별 알갱이: 같은 분포(티끌에 가린 만큼 빼고)에서 뽑은 희미한 점들
  {
    const rr = RND(17);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    let placed = 0;
    for (let i = 0; i < 90000 && placed < 650; i++) {
      const X = (rr() * 2 - 1) * 15.2, Z = (rr() * 2 - 1) * 3.0;
      const { thin, thick, bulge, tau } = lightAt(X, Z);
      const d = (thin * Math.exp(-tau) + thick * 2.5 + bulge * 0.25) * 0.9;
      if (rr() > d) continue;
      placed++;
      const x = C[0] + X * K, y = C[1] + Z * K;
      const warm = bulge > thin;
      const b = 0.14 + rr() * 0.36;
      ctx.fillStyle = warm ? `rgba(255,214,160,${b})` : `rgba(215,228,255,${b})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.28 + rr() * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── 기호(실제보다 아주 크게): 산개 성단, 성운, 구상 성단 ──
  const openCluster = (x, y, sc = 1, seed = 1) => {
    const q = RND(seed);
    const g = ctx.createRadialGradient(x, y, 0, x, y, 6 * sc);
    g.addColorStop(0, "rgba(150,190,255,0.35)");
    g.addColorStop(1, "rgba(150,190,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 6 * sc, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const a = q() * Math.PI * 2, d = (0.6 + q() * 3.4) * sc;
      glow(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, (1.5 + q() * 1.1) * sc, [170, 205, 255], { core: 0.4 });
    }
  };
  const nebula = (x, y, kind, sc = 1, seed = 1) => {
    const q = RND(seed);
    const col = kind === "red" ? [255, 92, 120] : kind === "blue" ? [110, 165, 255] : [12, 8, 14];
    ctx.save();
    if (kind === "dark") ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < 5; i++) {
      const a = q() * Math.PI * 2, d = q() * 2.2 * sc;
      const rx = x + Math.cos(a) * d, ry = y + Math.sin(a) * d * 0.7;
      const rad = (2.6 + q() * 2.2) * sc;
      const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
      const al = kind === "dark" ? 0.75 : 0.55;
      g.addColorStop(0, `rgba(${col},${al})`);
      g.addColorStop(0.6, `rgba(${col},${al * 0.45})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(rx, ry, rad, rad * 0.75, q() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  const globular = (x, y, sc = 1) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, 4.6 * sc);
    g.addColorStop(0, "rgba(255,246,220,1)");
    g.addColorStop(0.28, "rgba(255,206,140,0.95)");
    g.addColorStop(0.6, "rgba(255,160,90,0.45)");
    g.addColorStop(1, "rgba(255,150,80,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 4.6 * sc, 0, Math.PI * 2);
    ctx.fill();
  };

  // 원반 안(나선팔): 산개 성단과 성운을 번갈아(kpc, 높이는 원반 두께 안쪽)
  const inDisk = [
    [-13.3, 0.05, "oc"], [-11.6, -0.1, "red"], [-9.9, 0.08, "oc"], [-8.1, 0.38, "dark"], [-6.3, -0.06, "oc"], [-4.5, 0.1, "red"],
    [3.9, -0.08, "blue"], [5.5, 0.06, "oc"], [7.0, -0.1, "red"], [10.3, 0.07, "oc"], [11.9, -0.08, "red"], [13.5, 0.05, "blue"],
  ];
  inDisk.forEach(([X, Z, k], i) => {
    const x = C[0] + X * K, y = C[1] + Z * K;
    if (k === "oc") openCluster(x, y, 1.1, 31 + i);
    else nebula(x, y, k, 1.05, 51 + i);
  });

  // 구상 성단: 중심에서의 거리 r을 1.3~15 kpc에서 로그로 고르게(밀도 ∝ r^−3) 뽑고 방향은 고르게. 원반 높이 1.1 kpc 안쪽은 비운다.
  const gcs = [];
  {
    const q = RND(4);
    const keepOut = [
      [C[0] - 30, C[1] + 18, 60, 30], // 은하 중심부 라벨
      [C[0] + 8.5 * K + 4, C[1] + 6, 70, 34], // 태양계 라벨
      [6, 146, 54, 22], // 원반 라벨
    ];
    let guard = 0;
    while (gcs.length < 40 && guard++ < 20000) {
      const r = 1.3 * Math.pow(15 / 1.3, q());
      const cz = q() * 2 - 1, ph = q() * Math.PI * 2;
      const sz = Math.sqrt(1 - cz * cz);
      const X = r * sz * Math.cos(ph), Z = r * cz;
      if (Math.abs(Z) < 1.1) continue;
      const x = C[0] + X * K, y = C[1] + Z * K;
      if (gcs.some(([a, b]) => Math.hypot(a - x, b - y) < 8)) continue;
      if (keepOut.some(([a, b, ww, hh]) => x > a - 5 && x < a + ww + 5 && y > b - 5 && y < b + hh + 5)) continue;
      gcs.push([x, y, r]);
    }
    for (const [x, y] of gcs) globular(x, y, 0.82);
  }

  // 태양계(빛나는 점 + 흰 고리)
  const SUNP = [C[0] + GAL.SUN * K, C[1]];
  glow(ctx, SUNP[0], SUNP[1], 7, [255, 214, 120], { core: 0.36 });
  ctx.save();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(SUNP[0], SUNP[1], 4.6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ── 왼쪽 위: 위에서 본 모습(상상도를 돌려 태양계가 오른쪽) ──
  const I = [46, 54], IR = 36;
  const sI = (IR - 3) / PH.mwTop.r;
  P.dropShadow(t, (c) => c.arc(I[0], I[1], IR, 0, Math.PI * 2), { dx: 0, dy: 3, blur: 8, a: 0.5, color: "#000000" });
  ctx.save();
  ctx.beginPath();
  ctx.arc(I[0], I[1], IR, 0, Math.PI * 2);
  ctx.fillStyle = "#04070F";
  ctx.fill();
  ctx.restore();
  maskedImg(t, mw, { sx: PH.mwTop.cx, sy: PH.mwTop.cy, s: sI, rot: -Math.PI / 2, at: I, rx: IR - 0.5, fade: 0.05 });
  const rotP = ([nx, ny]) => [I[0] + ny * (IR - 3), I[1] - nx * (IR - 3)]; // −90° 돌림: (x, y) → (y, −x)
  ARM_OC.forEach((p, i) => openCluster(...rotP(p), 0.42, 71 + i));
  ARM_NEB.forEach((p, i) => nebula(...rotP(p), "red", 0.42, 91 + i));
  ring(ctx, I[0], I[1], IR, { white: 3 });

  // ── 범례 ──
  const LY = 332;
  openCluster(22, LY, 1.45, 5);
  nebula(122, LY, "red", 1.1, 6);
  nebula(140, LY, "blue", 1.1, 7);
  // 암흑 성운 기호: 붉게 빛나는 구름 앞을 가린 검은 구름
  {
    const g = ctx.createRadialGradient(160, LY - 1, 0, 160, LY - 1, 9);
    g.addColorStop(0, "rgba(255,110,135,0.6)");
    g.addColorStop(1, "rgba(255,110,135,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(160, LY - 1, 9, 0, Math.PI * 2);
    ctx.fill();
    nebula(161, LY + 2.5, "dark", 0.7, 8);
  }
  globular(238, LY, 1.35);

  // ── 라벨 ──
  const s = S.svgLayer(root, w, h);
  dl(S, s, 90, 24, "위에서 본 모습", { size: 13.5, color: NIGHT.dim, weight: 700 });
  const armPt = rotP([-0.696, -0.361]);
  dlead(S, s, [[100, 44], [92, 44], [armPt[0] + 2, armPt[1]]]);
  dl(S, s, 104, 48.5, "나선팔", { size: 14 });
  // 구상 성단 하나를 짚는다(오른쪽 위에서 가장 높은 것)
  const pick = gcs.filter(([x, y]) => x > C[0] + 20 && y < C[1] - 30).sort((a, b) => a[1] - b[1])[0] ?? gcs[0];
  dlead(S, s, [[w - 8, 70], [w - 8, 78], [pick[0] + 3, pick[1] + 2]]);
  dl(S, s, w - 8, 64, "구상 성단", { size: 14, anchor: "end", color: "#FFC98A" });
  dlead(S, s, [[50, 276], [C[0] - R * 0.6 + 0.5, C[1] + R * 0.8 - 0.5]]);
  dl(S, s, 6, 291, "원반을 둘러싼", { size: 13.5 });
  dl(S, s, 6, 307.5, "공 모양의 공간", { size: 13.5 });
  dlead(S, s, [[C[0], C[1] + 30], [C[0], C[1] + 9]]);
  dl(S, s, C[0], C[1] + 44, "은하 중심부", { size: 14, anchor: "middle" });
  dlead(S, s, [[28, 160], [C[0] - 12.45 * K, C[1] - 0.6]]);
  dl(S, s, 10, 157, "원반", { size: 14 });
  dlead(S, s, [[SUNP[0] + 18, SUNP[1] + 26], [SUNP[0] + 2, SUNP[1] + 3]]);
  dl(S, s, SUNP[0] + 20, SUNP[1] + 40, "태양계", { size: 14, anchor: "middle", color: "#FFE08A" });
  // 범례 글
  dl(S, s, 36, LY + 5, "산개 성단", { size: 14 });
  dl(S, s, 174, LY + 5, "성운", { size: 14 });
  dl(S, s, 250, LY + 5, "구상 성단", { size: 14 });
  dl(S, s, w / 2, h - 10, "성단과 성운은 실제보다 아주 크게 그렸어요", { size: 13.5, anchor: "middle", color: NIGHT.dim, weight: 600 });
}
