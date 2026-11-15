// g2u1l5f1 끓는점과 압력: 같은 불 위의 그릇 셋을 압력 차례로(한라산 꼭대기 약 0.8기압 → 평지 1기압 → 압력솥 안 약 2기압).
// 모두 앞쪽을 잘라 속을 보인다. 물을 누르는 압력 화살표의 길이는 압력에 비례(0.8 : 1 : 2), 끓는 온도 약 93 ℃, 100 ℃, 약 120 ℃.
// 검산 메모는 g2u1l5f1.md
import { qcurve, gasFlames, thermo, bubble } from "./_lib.mjs";

export const meta = {
  key: "g2u1l5f1",
  w: 340,
  h: 398,
  alt: "같은 세기의 불 위에서 물이 끓는 그릇 셋을 앞쪽을 잘라 보였어요. 기압이 약 0.8기압인 한라산 꼭대기의 냄비는 약 93 ℃, 1기압인 평지의 냄비는 100 ℃에서 끓어요. 고무 패킹이 틈을 막아 수증기가 갇힌 압력솥 안은 약 2기압이라 물을 누르는 압력이 가장 크고, 약 120 ℃에서 끓어요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(57);
  const rnd = N.rng(17);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.012 });

  const PRESS = "#4263EB"; // 물을 누르는 압력 화살표
  const PK = 15; // 1기압일 때 화살표 길이(px). 0.8기압 12, 2기압 30
  const T2F = (T) => (T - 50) / 80; // 온도계 눈금: 50 ℃ ~ 130 ℃

  // ── 공통 조각 ──
  /** 같은 버너(모든 그릇이 같은 크기, 같은 불꽃): 받침 윗면 y=sy(그릇 바닥이 놓이는 높이) */
  const burner = (cx, sy) => {
    const ringY = sy + 9.5, bodyT = ringY + 3, bodyB = bodyT + 13, bw = 33;
    P.softShadow(t, cx + 2, bodyB + 1.5, bw + 6, 4, 0.22);
    // 몸통
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, cx - bw, bodyT, 2 * bw, bodyB - bodyT, 3.5);
    ctx.fillStyle = P.lg(ctx, 0, bodyT, 0, bodyB, [[0, "#5C6672"], [0.18, "#3C4550"], [1, "#22282F"]]);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.22)";
    ctx.fillRect(cx - bw + 3, bodyT + 1, 2 * bw - 6, 1);
    // 손잡이(불 조절)
    ctx.beginPath();
    ctx.arc(cx + bw - 9, (bodyT + bodyB) / 2 + 1, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = P.rg(ctx, cx + bw - 10, (bodyT + bodyB) / 2, 0.4, cx + bw - 9, (bodyT + bodyB) / 2 + 1, 3.6, [[0, "#C9D1DB"], [1, "#6B7683"]]);
    ctx.fill();
    ctx.restore();
    // 버너 머리
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, ringY + 1.2, 12.5, 3.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#2A3037";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, ringY, 11.5, 2.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, cx - 11, 0, cx + 11, 0, [[0, "#4A525C"], [0.4, "#8A94A0"], [1, "#3A4048"]]);
    ctx.fill();
    ctx.restore();
    gasFlames(t, cx, ringY - 0.6, 21, { n: 7, hgt: 8.5, ry: 2.2 });
    // 받침(삼발이): 그릇이 놓이는 가는 쇠막대
    ctx.save();
    ctx.strokeStyle = "#2B3138";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (const dx of [-25, 25]) {
      ctx.moveTo(cx + dx, sy);
      ctx.lineTo(cx + dx * 0.86, bodyT);
    }
    ctx.moveTo(cx - 27, sy);
    ctx.lineTo(cx - 14, sy);
    ctx.moveTo(cx + 14, sy);
    ctx.lineTo(cx + 27, sy);
    ctx.stroke();
    ctx.restore();
  };

  /** 끓는 물 속 기포(바닥에서 생겨 떠오르며 커진다) */
  const boil = (x0, x1, top, bot, n, seed) => {
    const r2 = N.rng(seed);
    for (let i = 0; i < n; i++) {
      const s = (i + 0.5) / n;
      const x = x0 + 5 + (x1 - x0 - 10) * ((s * 0.83 + r2() * 0.17 + i * 0.37) % 1);
      const f = r2();
      const y = bot - 3 - (bot - top - 6) * f;
      const r = 1.3 + f * 2.3;
      bubble(t, x, y, r, { tint: "#F2F8FF", edge: "rgba(70,120,170,.75)" });
    }
    // 바닥에 붙어 막 생기는 작은 기포
    for (let k = 0; k < Math.max(3, n / 2); k++) {
      const x = x0 + 4 + (x1 - x0 - 8) * r2();
      bubble(t, x, bot - 1.3, 1.2, { tint: "#F2F8FF", edge: "rgba(70,120,170,.7)" });
    }
  };

  /** 김(작은 물방울이 된 수증기)이 피어오르는 줄기: 옅은 흰 뭉게 */
  const plume = (x, y, hgt, lean, seed, a = 0.55) => {
    const r2 = N.rng(seed);
    ctx.save();
    const pts = [];
    for (let k = 0; k < 16; k++) {
      const s = k / 15;
      pts.push([x + lean * s * s + Math.sin(s * 5 + seed) * 2.6 * s, y - hgt * s, 2 + s * 6 + r2() * 1.2, s]);
    }
    for (const [px, py, rr, s] of pts) {
      ctx.fillStyle = P.rg(ctx, px, py, 0, px, py, rr * 1.25, [[0, `rgba(150,170,195,${0.16 * (1 - s)})`], [1, "rgba(150,170,195,0)"]]);
      ctx.beginPath();
      ctx.arc(px, py, rr * 1.25, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const [px, py, rr, s] of pts) {
      ctx.fillStyle = P.rg(ctx, px - rr * 0.2, py - rr * 0.25, 0, px, py, rr, [[0, `rgba(255,255,255,${a * (1 - s * 0.85)})`], [1, "rgba(255,255,255,0)"]]);
      ctx.beginPath();
      ctx.arc(px, py, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  /** 앞쪽 절반을 잘라 낸 냄비(스테인리스). rim=테두리 높이, bot=바닥, rx=반지름, lv=수면 */
  const pot = (cx, rim, bot, rx, lv, opt = {}) => {
    const wall = 2, ry = rx * 0.17;
    const L = cx - rx, R = cx + rx;
    // 양쪽 손잡이(검은 손잡이, 뒤쪽 절반에 붙은 것이 잘린 면에 보인다)
    for (const sgn of [-1, 1]) {
      ctx.save();
      const hx = sgn < 0 ? L : R, hy = rim + 7;
      ctx.beginPath();
      ctx.moveTo(hx, hy - 3);
      ctx.lineTo(hx + sgn * 6, hy - 3.6);
      ctx.quadraticCurveTo(hx + sgn * 10, hy - 3.4, hx + sgn * 10, hy);
      ctx.quadraticCurveTo(hx + sgn * 10, hy + 3.4, hx + sgn * 6, hy + 3.2);
      ctx.lineTo(hx, hy + 2.6);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, hy - 4, 0, hy + 4, [[0, "#59616B"], [0.35, "#2E343B"], [1, "#16191D"]]);
      ctx.fill();
      ctx.restore();
    }
    // 안쪽 뒷벽(오목한 금속면: 왼쪽 위 빛이 오른쪽 안벽에)
    const inner = (c) => {
      c.moveTo(L + wall, rim);
      c.ellipse(cx, rim, rx - wall, ry, 0, Math.PI, Math.PI * 2);
      c.lineTo(R - wall, bot - wall);
      c.lineTo(L + wall, bot - wall);
      c.closePath();
    };
    ctx.save();
    ctx.beginPath();
    inner(ctx);
    ctx.fillStyle = P.lg(ctx, L, 0, R, 0, [[0, "#6E7886"], [0.25, "#9AA4B1"], [0.62, "#D5DBE3"], [0.86, "#EEF1F5"], [1, "#A7B0BC"]]);
    ctx.fill();
    ctx.clip();
    // 세로로 흐르는 금속 결
    ctx.globalAlpha = 0.18;
    for (let k = 0; k < 26; k++) {
      const x = L + ((k + rnd()) / 26) * 2 * rx;
      ctx.strokeStyle = rnd() > 0.5 ? "#fff" : "#55606D";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(x, rim - ry);
      ctx.lineTo(x, bot);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = P.lg(ctx, 0, rim - ry, 0, bot, [[0, "rgba(30,40,55,.18)"], [0.3, "rgba(30,40,55,0)"], [1, "rgba(30,40,55,.12)"]]);
    ctx.fillRect(L, rim - ry, 2 * rx, bot - rim + ry);
    opt.inside?.();
    ctx.restore();
    // 뒤쪽 테두리 입술
    ctx.save();
    ctx.strokeStyle = "#F4F6F9";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, rim, rx - 0.6, ry, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(80,90,105,.7)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(cx, rim - 0.9, rx + 0.2, ry + 0.4, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // 물: 잘린 앞면(세로 면)과 뒤쪽 반 타원 수면
    if (lv != null) {
      const wl = L + wall, wr = R - wall, wb = bot - wall;
      ctx.save();
      // 수면(뒤쪽 반)
      ctx.beginPath();
      ctx.moveTo(wl, lv);
      ctx.ellipse(cx, lv, rx - wall, ry, 0, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, lv - ry, 0, lv, [[0, "#CFE8FB"], [1, "#9ED0F5"]]);
      ctx.fill();
      // 잘린 물의 면
      ctx.beginPath();
      ctx.rect(wl, lv, wr - wl, wb - lv);
      ctx.fillStyle = P.lg(ctx, 0, lv, 0, wb, [[0, "rgba(116,192,252,.78)"], [1, "rgba(51,154,240,.85)"]]);
      ctx.fill();
      ctx.fillStyle = P.lg(ctx, wl, 0, wr, 0, [[0, "rgba(255,255,255,.1)"], [0.3, "rgba(255,255,255,.22)"], [1, "rgba(20,70,130,.12)"]]);
      ctx.fill();
      // 수면 선(일렁임)
      ctx.strokeStyle = "rgba(255,255,255,.95)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = wl; x <= wr; x += 1) {
        const yy = lv + Math.sin(x * 0.55 + cx) * 0.55;
        x === wl ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(wl, lv - ry - 1, wr - wl, wb - lv + ry + 1);
      ctx.clip();
      boil(wl, wr, lv, wb, opt.bubbles ?? 7, opt.seed ?? 3);
      ctx.restore();
    }
    // 잘린 벽과 바닥(밝은 금속 단면)
    ctx.save();
    ctx.fillStyle = "#E3E8EE";
    ctx.strokeStyle = "rgba(70,80,95,.85)";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(L, rim);
    ctx.lineTo(L, bot - 4);
    ctx.quadraticCurveTo(L, bot, L + 4, bot);
    ctx.lineTo(R - 4, bot);
    ctx.quadraticCurveTo(R, bot, R, bot - 4);
    ctx.lineTo(R, rim);
    ctx.lineTo(R - wall, rim);
    ctx.lineTo(R - wall, bot - wall);
    ctx.lineTo(L + wall, bot - wall);
    ctx.lineTo(L + wall, rim);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // 말린 입술(단면이 작은 동그라미)
    for (const x of [L + 0.6, R - 0.6]) {
      ctx.beginPath();
      ctx.arc(x, rim, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = "#EEF1F5";
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  };

  /** 비스듬히 꽂은 온도계: (x0, y0) 위 끝, (x1, y1) 구부 */
  const thermoAt = (x0, y0, x1, y1, frac) => {
    const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(x0 - x1, y1 - y0);
    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(a);
    thermo(t, 0, -L, 0, 0, frac, { w: 4, bulb: 3.2, ticks: 8 });
    ctx.restore();
  };

  // ── 1줄: 한라산 꼭대기와 평지(작은 장면 창) ──
  const WIN = [{ x: 4, y: 4, w: 162, h: 132 }, { x: 174, y: 4, w: 162, h: 132 }];
  const scene = (wn, mountain) => {
    P.dropShadow(t, (q) => P.rrect(q, wn.x, wn.y, wn.w, wn.h, 12), { dx: 0, dy: 2, blur: 6, a: 0.12 });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, wn.x, wn.y, wn.w, wn.h, 12);
    ctx.clip();
    const gy = wn.y + 118; // 버너가 놓인 땅
    if (mountain) {
      // 높은 하늘(위가 짙다) → 발아래 구름바다 → 꼭대기 바위
      ctx.fillStyle = P.lg(ctx, 0, wn.y, 0, wn.y + 96, [[0, "#7FAEDF"], [0.6, "#B9D5F0"], [1, "#E2EEF9"]]);
      ctx.fillRect(wn.x, wn.y, wn.w, wn.h);
      // 먼 구름바다(지평선 높이에 넓게 깔린 흰 구름): 발아래 멀리 보인다
      ctx.fillStyle = P.lg(ctx, 0, wn.y + 74, 0, wn.y + 106, [[0, "rgba(255,255,255,.0)"], [0.4, "rgba(250,252,255,.95)"], [1, "#F3F7FC"]]);
      ctx.fillRect(wn.x, wn.y + 74, wn.w, 40);
      for (let k = 0; k < 13; k++) {
        const cxk = wn.x - 6 + k * 14 + rnd() * 6, cyk = wn.y + 85 + rnd() * 5, rr = 5 + rnd() * 6;
        ctx.fillStyle = P.rg(ctx, cxk - rr * 0.3, cyk - rr * 0.4, 0.5, cxk, cyk, rr, [[0, "rgba(255,255,255,1)"], [0.65, "rgba(245,249,253,.9)"], [1, "rgba(235,242,250,0)"]]);
        ctx.beginPath();
        ctx.arc(cxk, cyk, rr, 0, Math.PI * 2);
        ctx.fill();
      }
      // 꼭대기 바위: 가까운 정상부(어두운 현무암)가 아래를 채우고, 그 너머 아래로 구름바다가 보인다.
      // 오른쪽 끝에 솟은 바위 봉우리 하나. 지평선(눈높이)은 구름바다 위끝.
      const edge = [[0, 104], [0.1, 102], [0.22, 104.5], [0.36, 103], [0.5, 104], [0.62, 102.5], [0.72, 103.5], [0.8, 99], [0.86, 90], [0.9, 84], [0.95, 82], [1, 86]];
      const rock = (c) => {
        c.moveTo(wn.x, wn.y + wn.h);
        for (const [u, v] of edge) c.lineTo(wn.x + u * wn.w, wn.y + v);
        c.lineTo(wn.x + wn.w, wn.y + wn.h);
        c.closePath();
      };
      ctx.beginPath();
      rock(ctx);
      ctx.fillStyle = P.lg(ctx, wn.x, wn.y + 82, wn.x + wn.w * 0.3, wn.y + wn.h, [[0, "#6B737C"], [0.45, "#4E555D"], [1, "#363B41"]]);
      ctx.fill();
      // 거친 현무암 결(옅게) + 윗면 빛
      P.shade(t, { x: wn.x, y: wn.y + 80, w: wn.w, h: wn.h - 80 }, (x, y) => {
        const n = nz.fbm(x * 0.09, y * 0.16, 4);
        const m = nz.n2(x * 0.5, y * 0.5);
        const v = n * 0.7 + m * 0.3;
        return v > 0 ? [210, 216, 224, v * 0.22] : [10, 14, 20, -v * 0.3];
      }, { mask: rock });
      ctx.strokeStyle = "rgba(235,240,246,.55)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      edge.forEach(([u, v], i) => (i ? ctx.lineTo(wn.x + u * wn.w, wn.y + v + 0.5) : ctx.moveTo(wn.x + u * wn.w, wn.y + v + 0.5)));
      ctx.stroke();
    } else {
      ctx.fillStyle = P.lg(ctx, 0, wn.y, 0, wn.y + 100, [[0, "#BCD8F2"], [1, "#EAF3FB"]]);
      ctx.fillRect(wn.x, wn.y, wn.w, wn.h);
      // 평지: 낮은 지평선과 들판, 먼 나무 줄
      for (let k = 0; k < 15; k++) {
        const x = wn.x + 2 + k * 11.5 + rnd() * 4, y = wn.y + 99 - rnd() * 1.5, rr = 2.8 + rnd() * 2;
        ctx.fillStyle = P.rg(ctx, x - 1, y - rr, 0.5, x, y - rr * 0.6, rr * 1.3, [[0, "#86AE74"], [1, "#5A8650"]]);
        ctx.beginPath();
        ctx.ellipse(x, y - rr * 0.6, rr, rr * 1.15, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = P.lg(ctx, 0, wn.y + 98, 0, gy, [[0, "#A9C99B"], [1, "#8FB57F"]]);
      ctx.fillRect(wn.x, wn.y + 98, wn.w, gy - wn.y - 98);
      ctx.fillStyle = P.lg(ctx, 0, gy, 0, wn.y + wn.h, [[0, "#B9A88E"], [1, "#9E8D73"]]);
      ctx.fillRect(wn.x, gy, wn.w, wn.y + wn.h - gy);
    }
    ctx.restore();
    // 창 테두리
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, wn.x + 0.5, wn.y + 0.5, wn.w - 1, wn.h - 1, 11.5);
    ctx.strokeStyle = "rgba(120,135,155,.55)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    return gy;
  };

  const small = [
    { wn: WIN[0], mtn: true, p: 0.8, T: 93, seed: 5 },
    { wn: WIN[1], mtn: false, p: 1.0, T: 100, seed: 9 },
  ];
  const arrowsLater = [];
  for (const s of small) {
    const gy = scene(s.wn, s.mtn);
    const cx = s.wn.x + s.wn.w / 2 - 6;
    const sy = gy - 26; // 그릇 바닥(받침 윗면)
    const rim = sy - 36, rx = 30, lv = rim + 13;
    burner(cx, sy);
    pot(cx, rim, sy, rx, lv, { bubbles: 6, seed: s.seed });
    // 온도계(뒤쪽 테두리에 기대어 물에 꽂았다)
    thermoAt(cx + 21, rim - 13, cx + 12, sy - 8, T2F(s.T));
    // 김이 자유롭게 빠져나간다
    plume(cx - 13, lv - 4, 36, -6, s.seed, 0.8);
    plume(cx + 1, lv - 4, 40, 4, s.seed + 3, 0.75);
    // 물을 누르는 압력(공기): 길이 = PK × 기압
    const n = s.mtn ? 3 : 4, len = PK * s.p;
    for (let k = 0; k < n; k++) {
      const x = cx - rx + 9 + ((2 * rx - 18) * (k + 0.5)) / n;
      arrowsLater.push([[x, lv - 1.5 - len], [x, lv - 1.5]]);
    }
    s.cx = cx;
    s.rim = rim;
  }

  // ── 2줄: 압력솥(크게, 앞쪽을 잘라 속을 보인다) ──
  const K = { cx: 116, rim: 246, bot: 338, rx: 86 };
  const KL = K.cx - K.rx, KR = K.cx + K.rx;
  const lvK = 302;
  const lidTop = 224; // 뚜껑 가운데 꼭대기(바깥면)
  const sK = K.bot; // 받침 윗면
  // 손잡이(왼쪽): 몸통 손잡이 위에 뚜껑 손잡이가 겹쳐 잠긴다
  const handle = (x0, y0, len, th, col0, col1) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0 - th / 2);
    ctx.lineTo(x0 - len + 6, y0 - th / 2 - 0.6);
    ctx.quadraticCurveTo(x0 - len, y0 - th / 2 - 0.4, x0 - len, y0);
    ctx.quadraticCurveTo(x0 - len, y0 + th / 2 + 0.4, x0 - len + 6, y0 + th / 2 + 0.6);
    ctx.lineTo(x0, y0 + th / 2);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, 0, y0 - th / 2, 0, y0 + th / 2, [[0, col0], [0.3, col1], [1, "#121417"]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x0 - 2, y0 - th / 2 + 1);
    ctx.lineTo(x0 - len + 7, y0 - th / 2 + 0.6);
    ctx.stroke();
    ctx.restore();
  };
  burner(K.cx, sK);
  P.softShadow(t, K.cx + 4, sK + 2, K.rx * 0.9, 5, 0.12);
  handle(KL - 1, K.rim + 10, 24, 8, "#5A626C", "#2C3137"); // 몸통 손잡이
  handle(KL - 1, K.rim - 0.5, 25, 7.5, "#646D78", "#30363D"); // 뚜껑 손잡이(잠금 손잡이)
  // 잠금 단추
  ctx.save();
  ctx.fillStyle = P.lg(ctx, 0, K.rim - 6, 0, K.rim - 3, [[0, "#FF8787"], [1, "#C92A2A"]]);
  ctx.beginPath();
  P.rrect(ctx, KL - 17, K.rim - 5.6, 7, 2.6, 1.2);
  ctx.fill();
  ctx.restore();
  // 오른쪽 짧은 보조 손잡이
  ctx.save();
  ctx.beginPath();
  P.rrect(ctx, KR - 1, K.rim + 7, 12, 7, 3);
  ctx.fillStyle = P.lg(ctx, 0, K.rim + 7, 0, K.rim + 14, [[0, "#5A626C"], [0.35, "#2C3137"], [1, "#121417"]]);
  ctx.fill();
  ctx.restore();

  // 솥 몸통(안쪽, 물, 기포)
  const steamLater = [];
  pot(K.cx, K.rim, K.bot, K.rx, lvK, {
    bubbles: 13,
    seed: 21,
    inside: () => {
      // 갇힌 수증기: 위쪽 빈 곳을 채운 옅은 김
      for (let k = 0; k < 7; k++) steamLater.push([KL + 22 + k * 23 + rnd() * 6, lvK - 6 - rnd() * 8]);
    },
  });
  // 갇힌 수증기(솥 안 위쪽, 뚜껑 아래까지 가득): 옅은 흰 소용돌이
  ctx.save();
  ctx.beginPath();
  ctx.rect(KL + 2, lidTop + 6, 2 * K.rx - 4, lvK - lidTop - 6);
  ctx.clip();
  ctx.fillStyle = P.lg(ctx, 0, lidTop, 0, lvK, [[0, "rgba(255,255,255,.42)"], [1, "rgba(255,255,255,.18)"]]);
  ctx.fillRect(KL, lidTop, 2 * K.rx, lvK - lidTop);
  for (let k = 0; k < 26; k++) {
    const sx = KL + 8 + rnd() * (2 * K.rx - 16), sy = lidTop + 14 + rnd() * (lvK - lidTop - 22), rr = 6 + rnd() * 9;
    ctx.fillStyle = P.rg(ctx, sx - rr * 0.2, sy - rr * 0.3, 0, sx, sy, rr, [[0, "rgba(255,255,255,.55)"], [1, "rgba(255,255,255,0)"]]);
    ctx.beginPath();
    ctx.arc(sx, sy, rr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(255,255,255,.8)";
  ctx.lineWidth = 0.9;
  ctx.lineCap = "round";
  for (let k = 0; k < 8; k++) {
    const sx = KL + 20 + k * 21, sy = lvK - 6;
    ctx.beginPath();
    for (let s2 = 0; s2 <= 1.0001; s2 += 0.05) {
      const x = sx + Math.sin(s2 * 8 + k) * 3.2 * s2 + (k % 2 ? 4 : -4) * s2;
      const y = sy - s2 * (lvK - lidTop - 24);
      s2 === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 뚜껑(단면): 얕은 돔, 가장자리는 솥 입술을 감싸며 내려온다
  const lid = (c) => {
    // 바깥선: 왼쪽 가장자리 아래 → 돔 → 오른쪽 가장자리 아래, 안쪽선으로 돌아온다(두께 2.4)
    const th = 3.2;
    const top = (x) => lidTop + (K.rim - 8 - lidTop) * Math.pow((x - K.cx) / (K.rx + 3), 2);
    c.moveTo(KL - 3, K.rim + 5);
    c.lineTo(KL - 3, K.rim - 7);
    for (let x = KL - 3; x <= KR + 3; x += 2) c.lineTo(x, top(x));
    c.lineTo(KR + 3, K.rim + 5);
    c.lineTo(KR + 3 - th, K.rim + 5);
    c.lineTo(KR + 3 - th, K.rim - 5);
    for (let x = KR + 3 - th; x >= KL - 3 + th; x -= 2) c.lineTo(x, top(x) + th);
    c.lineTo(KL - 3 + th, K.rim - 5);
    c.lineTo(KL - 3 + th, K.rim + 5);
    c.closePath();
  };
  // 뚜껑 안쪽 뒷면(솥 안 천장, 어둡게)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(KL - 1, K.rim - 4);
  for (let x = KL - 1; x <= KR + 1; x += 2) ctx.lineTo(x, lidTop + 2.4 + (K.rim - 8 - lidTop) * Math.pow((x - K.cx) / (K.rx + 3), 2));
  ctx.lineTo(KR + 1, K.rim - 4);
  ctx.closePath();
  ctx.fillStyle = P.lg(ctx, KL, 0, KR, 0, [[0, "rgba(90,100,115,.55)"], [0.5, "rgba(160,170,182,.35)"], [1, "rgba(120,130,145,.45)"]]);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  lid(ctx);
  ctx.fillStyle = "#E3E8EE";
  ctx.fill();
  ctx.strokeStyle = "rgba(70,80,95,.9)";
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.restore();
  // 뚜껑의 바깥 뒷면 윗부분(돔의 둥근 겉면이 조금 보이게 반사 띠)
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = KL + 20; x <= K.cx - 6; x += 2) {
    const y = lidTop + (K.rim - 8 - lidTop) * Math.pow((x - K.cx) / (K.rx + 3), 2) + 0.9;
    x === KL + 20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
  // 고무 패킹(뚜껑 가장자리 홈 안, 솥 입술 위를 꽉 누른다): 단면이 검은 둥근 덩이
  const gasket = [];
  for (const sgn of [-1, 1]) {
    const gx = sgn < 0 ? KL + 1.5 : KR - 1.5;
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, gx - 3, K.rim - 6.2, 6, 5.4, 2.2);
    ctx.fillStyle = P.lg(ctx, 0, K.rim - 6.2, 0, K.rim - 0.8, [[0, "#4A4F56"], [0.4, "#26292E"], [1, "#0F1113"]]);
    ctx.fill();
    ctx.restore();
    gasket.push([gx, K.rim - 3.5]);
  }
  // 김 구멍 관과 압력추(뚜껑 가운데 위)
  const wx = K.cx, wy = lidTop;
  ctx.save();
  ctx.fillStyle = P.lg(ctx, wx - 2, 0, wx + 2, 0, [[0, "#9AA4B1"], [0.5, "#E9EDF2"], [1, "#7E8895"]]);
  ctx.fillRect(wx - 1.8, wy - 8, 3.6, 8.5);
  // 압력추: 둥근 몸통 + 꼭지
  ctx.beginPath();
  ctx.moveTo(wx - 7.5, wy - 6);
  ctx.lineTo(wx - 7.5, wy - 14);
  ctx.quadraticCurveTo(wx - 7.5, wy - 19, wx, wy - 19.5);
  ctx.quadraticCurveTo(wx + 7.5, wy - 19, wx + 7.5, wy - 14);
  ctx.lineTo(wx + 7.5, wy - 6);
  ctx.closePath();
  ctx.fillStyle = P.lg(ctx, wx - 7.5, 0, wx + 7.5, 0, [[0, "#6E7886"], [0.3, "#F1F4F7"], [0.55, "#C2CAD4"], [1, "#5E6875"]]);
  ctx.fill();
  ctx.strokeStyle = "rgba(60,70,85,.7)";
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(wx, wy - 21, 2.6, 0, Math.PI * 2);
  ctx.fillStyle = P.rg(ctx, wx - 1, wy - 22, 0.2, wx, wy - 21, 2.6, [[0, "#FFFFFF"], [1, "#8C96A3"]]);
  ctx.fill();
  ctx.restore();
  // 압력추 아래로 조금씩 새는 김(정해진 압력을 넘으면 들썩이며 내보낸다)
  plume(wx + 9, wy - 9, 24, 12, 31, 0.85);
  // 안전 밸브(뚜껑 오른쪽)
  const vx = K.cx + 46, vy = lidTop + (K.rim - 8 - lidTop) * Math.pow(46 / (K.rx + 3), 2);
  ctx.save();
  ctx.fillStyle = P.lg(ctx, vx - 3.5, 0, vx + 3.5, 0, [[0, "#8A94A0"], [0.4, "#E6EAEF"], [1, "#6C7683"]]);
  ctx.fillRect(vx - 3.2, vy - 5, 6.4, 5.6);
  ctx.beginPath();
  ctx.ellipse(vx, vy - 5.2, 4.2, 1.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = P.lg(ctx, vx - 4, 0, vx + 4, 0, [[0, "#C92A2A"], [0.4, "#FF6B6B"], [1, "#A51D1D"]]);
  ctx.fill();
  ctx.restore();
  // 솥 안 온도계(물에 꽂혀 있다)
  thermoAt(KL + 34, K.rim + 18, KL + 50, K.bot - 10, T2F(120));
  // 물을 누르는 압력(갇힌 수증기): 2기압 → 길이 30
  const nK = 8, lenK = PK * 2;
  for (let k = 0; k < nK; k++) {
    const x = KL + 18 + ((2 * K.rx - 36) * (k + 0.5)) / nK;
    if (Math.abs(x - (KL + 44)) < 7) continue; // 온도계 자리 비우기
    arrowsLater.push([[x, lvK - 1.5 - lenK], [x, lvK - 1.5]]);
  }

  // ── 겹층 ──
  const sv = S.svgLayer(root, w, h);
  for (const [a, b] of arrowsLater) S.rayArrow(sv, a, b, { color: PRESS, w: 1.7, hl: 5.5, hw: 3.4, glow: "#fff" });
  // 1줄 라벨
  const T1 = [["한라산 꼭대기", "(약 0.8기압)", "약 93 ℃에서 끓어요"], ["평지", "(1기압)", "100 ℃에서 끓어요"]];
  small.forEach((s, i) => {
    const cx = s.wn.x + s.wn.w / 2;
    S.label(sv, cx, s.wn.y + 19, T1[i][0], { size: 14, anchor: "middle" });
    S.label(sv, cx, s.wn.y + 35, T1[i][1], { size: 13.5, anchor: "middle", color: "#364FC7" });
    S.label(sv, cx, s.wn.y + s.wn.h + 18, T1[i][2], { size: 14, anchor: "middle", color: "#D9480F" });
  });
  // 2줄 라벨
  {
    const tx = S.el(sv, "text", { x: 8, y: 183, "font-size": 14, "font-weight": 700, fill: "#26303D", "letter-spacing": "-0.01em", "font-family": "'Pretendard Variable', Pretendard, sans-serif", "paint-order": "stroke", stroke: "#fff", "stroke-width": 3.6, "stroke-linejoin": "round" });
    S.el(tx, "tspan", {}, "압력솥 안");
    S.el(tx, "tspan", { fill: "#364FC7", "font-size": 13.5 }, "(약 2기압)");
  }
  S.label(sv, K.cx, 391, "약 120 ℃에서 끓어요", { size: 14, anchor: "middle", color: "#D9480F" });
  const LX = 236; // 오른쪽 라벨 줄
  S.leader(sv, [[LX - 3, 204], [wx + 6, wy - 15]]);
  S.label(sv, LX, 209, "압력추", { size: 13.5 });
  S.leader(sv, [[LX - 3, 226], [vx + 3, vy - 5]]);
  S.label(sv, LX, 231, "안전 밸브", { size: 13.5 });
  S.leader(sv, [[LX - 3, 250], [gasket[1][0] + 2, gasket[1][1]]]);
  S.label(sv, LX, 255, "고무 패킹", { size: 13.5 });
  S.leader(sv, [[LX - 3, 271], [K.cx + 52, 271]]);
  S.label(sv, LX, 276, "갇힌 수증기", { size: 13.5 });
  const ax = arrowsLater[arrowsLater.length - 1][0][0];
  S.leader(sv, [[LX - 3, 294], [ax + 2, lvK - 12]]);
  S.label(sv, LX, 299, "물을 누르는", { size: 13.5 });
  S.label(sv, LX, 315, "압력", { size: 13.5 });
  S.leader(sv, [[30, 214], [KL - 14, K.rim - 2]]);
  S.label(sv, 8, 209, "잠금 손잡이", { size: 13.5 });
}
