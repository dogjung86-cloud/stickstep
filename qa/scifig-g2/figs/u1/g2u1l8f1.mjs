// g2u1l8f1 재결정: ① 가열해 모두 녹이기 → ② 얼음으로 식히기(질산 칼륨만 바늘 모양 결정) → ③ 거르기, 그리고 거름종이 한 점을 크게 본 원.
// 넣은 양은 랩과 같게 질산 칼륨 10 g, 염화 나트륨 2 g, 물 10 g. 염화 나트륨은 식혀도 다 녹아 있으므로 정육면체 결정을 그리지 않는다.
// 녹아 있는 물질은 종류를 나누지 않은 아주 작은 점(Ⅰ단원 공통 규칙). 검산 메모는 g2u1l8f1.md
import { lens, zoomFill, zoomLines, beaker, qcurve } from "./_lib.mjs";

export const meta = {
  key: "g2u1l8f1",
  w: 340,
  h: 402,
  alt: "재결정의 세 단계. 가열 장치 위의 비커에서 혼합물을 유리 막대로 저으며 모두 녹이고, 잘게 부순 얼음 속에 비커를 넣어 식히면 바닥에 바늘 모양의 흰 질산 칼륨 결정이 생겨요. 스탠드에 건 깔때기와 거름종이로 거르면 결정은 거름종이 위에 남고 거른 용액이 아래 비커에 모여요. 거름종이를 크게 본 원에서 결정은 구멍보다 커서 걸리고, 녹아 있는 물질의 아주 작은 점과 물은 구멍을 지나가요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(83);
  const rnd = N.rng(29);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.012 });
  const SOL = "#A5D8FF"; // 용액(무색 투명에 가깝게, 물빛 아주 옅게)

  // ── 도우미 ──
  /** 유리 막대(가는 원기둥) */
  const rod = (x0, y0, x1, y1, wd = 2.4) => {
    const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(110,130,155,.75)";
    ctx.lineWidth = wd + 0.8;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.strokeStyle = "rgba(232,240,248,.95)";
    ctx.lineWidth = wd;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.lineWidth = wd * 0.32;
    ctx.beginPath();
    ctx.moveTo(x0 + nx * wd * 0.22, y0 + ny * wd * 0.22);
    ctx.lineTo(x1 + nx * wd * 0.22, y1 + ny * wd * 0.22);
    ctx.stroke();
    ctx.restore();
  };
  /** 바늘 모양 결정(긴 각기둥): 가운데 (x, y), 길이 L, 굵기 d, 각 a */
  const needle = (x, y, L, d, a, alpha = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(-L / 2, 0);
    ctx.lineTo(-L / 2 + d * 0.6, -d / 2);
    ctx.lineTo(L / 2 - d * 0.6, -d / 2);
    ctx.lineTo(L / 2, 0);
    ctx.lineTo(L / 2 - d * 0.6, d / 2);
    ctx.lineTo(-L / 2 + d * 0.6, d / 2);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, 0, -d / 2, 0, d / 2, [[0, "#FFFFFF"], [0.5, "#FAFCFE"], [0.56, "#DCE4EE"], [1, "#BFCBD8"]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(96,114,138,.85)";
    ctx.lineWidth = 0.45;
    ctx.stroke();
    ctx.restore();
  };
  /** 바늘 결정 더미(바닥에 쌓이고 몇 개는 비스듬히 솟는다) */
  const needlePile = (cx, floor, wid, n, seed) => {
    const r2 = N.rng(seed);
    const list = [];
    for (let i = 0; i < n; i++) {
      const u = r2() * 2 - 1;
      const up = r2() < 0.28;
      list.push({ x: cx + u * wid * 0.5, y: floor - 1.4 - r2() * 6 * (1 - u * u) - (up ? 3 : 0), L: 11 + r2() * 9, d: 2.6 + r2() * 0.8, a: up ? (r2() < 0.5 ? -1 : 1) * (0.5 + r2() * 0.6) : (r2() - 0.5) * 0.5 });
    }
    list.sort((a, b) => a.y - b.y);
    for (const q of list) needle(q.x, q.y, q.L, q.d, q.a);
  };
  /** 김(옅은 흰 줄기) */
  const wisp = (x, y, hgt, lean, seed) => {
    const r2 = N.rng(seed);
    for (let k = 0; k < 12; k++) {
      const s = k / 11, px = x + lean * s * s + Math.sin(s * 6 + seed) * 1.6 * s, py = y - hgt * s, rr = 1.5 + s * 4.5 + r2();
      ctx.fillStyle = P.rg(ctx, px, py, 0, px, py, rr * 1.3, [[0, `rgba(150,170,195,${0.14 * (1 - s)})`], [1, "rgba(150,170,195,0)"]]);
      ctx.beginPath();
      ctx.arc(px, py, rr * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = P.rg(ctx, px, py, 0, px, py, rr, [[0, `rgba(255,255,255,${0.75 * (1 - s)})`], [1, "rgba(255,255,255,0)"]]);
      ctx.beginPath();
      ctx.arc(px, py, rr, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // ══ ① 가열해 모두 녹이기 ══
  const H1 = { cx: 78, top: 132 }; // 가열 장치 윗면
  {
    const { cx, top } = H1;
    const bw = 44, bodyT = top + 5, bodyB = top + 25;
    P.softShadow(t, cx + 3, bodyB + 1.5, bw + 6, 4.5, 0.22);
    ctx.save();
    // 몸통(흰 몸체)
    ctx.beginPath();
    P.rrect(ctx, cx - bw, bodyT, 2 * bw, bodyB - bodyT, 4);
    ctx.fillStyle = P.lg(ctx, 0, bodyT, 0, bodyB, [[0, "#FFFFFF"], [0.3, "#EEF1F5"], [1, "#C9D1DA"]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(120,132,148,.6)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    // 조절 손잡이와 켜짐 등
    ctx.beginPath();
    ctx.arc(cx + bw - 11, (bodyT + bodyB) / 2 + 1, 5, 0, Math.PI * 2);
    ctx.fillStyle = P.rg(ctx, cx + bw - 13, (bodyT + bodyB) / 2 - 1, 0.5, cx + bw - 11, (bodyT + bodyB) / 2 + 1, 5, [[0, "#6A727C"], [1, "#1E2227"]]);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + bw - 11, (bodyT + bodyB) / 2 + 1);
    ctx.lineTo(cx + bw - 13.5, (bodyT + bodyB) / 2 - 2.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx - bw + 9, (bodyT + bodyB) / 2 + 1, 1.7, 0, Math.PI * 2);
    ctx.fillStyle = "#FF6B5B";
    ctx.fill();
    ctx.fillStyle = "rgba(255,107,91,.3)";
    ctx.beginPath();
    ctx.arc(cx - bw + 9, (bodyT + bodyB) / 2 + 1, 3.4, 0, Math.PI * 2);
    ctx.fill();
    // 검은 가열판(위에서 비스듬히 본 판)
    ctx.beginPath();
    ctx.moveTo(cx - bw + 3, bodyT + 0.5);
    ctx.lineTo(cx - bw + 9, top - 3);
    ctx.lineTo(cx + bw - 9, top - 3);
    ctx.lineTo(cx + bw - 3, bodyT + 0.5);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, cx - bw, top - 3, cx + bw * 0.4, bodyT, [[0, "#4A525C"], [0.5, "#23282E"], [1, "#15181C"]]);
    ctx.fill();
    // 판이 달아 오른 붉은 빛(비커 밑)
    ctx.fillStyle = P.rg(ctx, cx, top + 1, 1, cx, top + 1, 22, [[0, "rgba(255,90,50,.45)"], [1, "rgba(255,90,50,0)"]]);
    ctx.beginPath();
    ctx.ellipse(cx, top + 1, 22, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // 작은 비커와 무색 투명한 용액(두 물질이 모두 녹았다)
    beaker(t, { cx, top: 88, bot: top - 2, rx: 18, ry: 3.6, level: 105, liq: SOL, liqA: 0.85, spout: "l", marks: 4 });
    rod(cx - 7, top - 6, cx + 14, 70);
    // 달아 오른 용액의 아지랑이와 김
    wisp(cx - 6, 92, 16, -4, 3);
    wisp(cx + 5, 92, 18, 3, 7);
  }

  // ══ ② 얼음으로 식히기 ══
  const C2 = { cx: 240, top: 78, bot: 152, rx: 37 };
  const small2 = { cx: 240, top: 92, bot: 147, rx: 18 };
  {
    const waterLv = 121;
    const ice = (x, y, s, seed, a = 0.95) => {
      const r2 = N.rng(seed);
      const k = 5 + Math.floor(r2() * 3);
      const pts = [];
      for (let i = 0; i < k; i++) {
        const ang = (i / k) * Math.PI * 2 + r2() * 0.5, rr = s * (0.7 + r2() * 0.45);
        pts.push([x + Math.cos(ang) * rr, y + Math.sin(ang) * rr * 0.85]);
      }
      ctx.save();
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, x - s, y - s, x + s, y + s, [[0, `rgba(255,255,255,${a})`], [0.45, `rgba(232,243,252,${a * 0.92})`], [1, `rgba(176,205,232,${a * 0.9})`]]);
      ctx.fill();
      ctx.strokeStyle = "rgba(130,160,192,.8)";
      ctx.lineWidth = 0.55;
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,1)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(pts[k - 1][0] * 0.75 + x * 0.25, pts[k - 1][1] * 0.75 + y * 0.25);
      ctx.lineTo(pts[0][0] * 0.75 + x * 0.25, pts[0][1] * 0.75 + y * 0.25);
      ctx.lineTo(pts[1][0] * 0.75 + x * 0.25, pts[1][1] * 0.75 + y * 0.25);
      ctx.stroke();
      ctx.restore();
    };
    const IL = C2.cx - C2.rx + 4, IR = C2.cx + C2.rx - 4;
    beaker(t, {
      ...C2, ry: 7, level: waterLv, liq: "#74C0FC", liqA: 0.45, spout: "l", marks: 0,
      behind: () => {
        // 뒤쪽 얼음(작은 비커 뒤): 물 위로 조금 솟은 더미
        for (let k = 0; k < 26; k++) {
          const x = IL + rnd() * (IR - IL), y = waterLv - 6 + rnd() * (C2.bot - waterLv + 2), sz = 5.5 + rnd() * 3;
          if (Math.abs(x - C2.cx) < small2.rx - 1 && y > small2.top) continue; // 작은 비커 뒤는 비워 결정이 또렷하게
          ice(x, y, sz, 100 + k, 0.9);
        }
      },
      front: () => {
        // 작은 비커(얼음물 속에 서 있다)와 바닥의 바늘 모양 질산 칼륨 결정
        beaker(t, { ...small2, ry: 3.3, level: 106, liq: SOL, liqA: 0.8, spout: "l", marks: 0, shadow: false, inLiquid: () => needlePile(small2.cx, small2.bot - 3, 30, 34, 41) });
        // 작은 비커 앞의 찬물(옅게 한 겹)
        ctx.save();
        ctx.fillStyle = "rgba(116,192,252,.10)";
        ctx.fillRect(IL, waterLv, IR - IL, C2.bot - waterLv - 2);
        ctx.restore();
        // 앞쪽 얼음: 양옆에만(가운데는 결정이 보이게 비운다)
        for (let k = 0; k < 18; k++) {
          const side = k % 2 ? -1 : 1;
          const x = C2.cx + side * (small2.rx + 5 + rnd() * (C2.rx - small2.rx - 10));
          ice(x, waterLv - 4 + rnd() * (C2.bot - waterLv - 4), 5 + rnd() * 2.6, 200 + k, 0.95);
        }
        for (let k = 0; k < 4; k++) ice(C2.cx - 13 + k * 8.6, C2.bot - 3.6, 3.4, 300 + k, 0.85);
      },
    });
  }

  // ══ ③ 거르기 ══
  const ST = { rodX: 184, top: 206, baseY: 386 };
  const F = { cx: 236, rim: 236, rx: 25, ry: 5 }; // 깔때기 위 테두리
  const apexY = F.rim + F.rx / Math.tan(Math.PI / 6); // 60° 깔때기: 반각 30°
  const stemB = 322;
  const RB = { cx: 254, top: 311, bot: 383, rx: 22, lv: 361 }; // 받침판 위에 놓인다 // 받는 비커(왼쪽 안벽이 깔때기 끝에 닿는다)
  const paperTop = F.rim + 3.2; // 거름종이 가장자리는 깔때기 테두리보다 조금 아래
  const fLv = F.rim + 22; // 거름종이 속 용액 높이(종이 높이를 넘지 않는다)
  const rAt = (y) => F.rx * (1 - (y - F.rim) / (apexY - F.rim)); // 깔때기 안 반지름
  // 확대 통로(물체보다 먼저)
  const spot = { x: F.cx - 2, y: fLv + 2, r: 6 };
  const LZ = { x: 86, y: 296, r: 62 };
  zoomFill(t, spot, LZ, 0.12);
  {
    // 스탠드: 받침판과 막대
    P.softShadow(t, 238, ST.baseY + 5, 66, 5, 0.22);
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, 174, ST.baseY - 3, 128, 9, 2.5);
    ctx.fillStyle = P.lg(ctx, 0, ST.baseY - 3, 0, ST.baseY + 6, [[0, "#5D6670"], [0.25, "#3E464F"], [1, "#22272D"]]);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.fillRect(177, ST.baseY - 2.4, 122, 0.9);
    ctx.fillStyle = P.lg(ctx, ST.rodX - 2.2, 0, ST.rodX + 2.2, 0, [[0, "#7D8794"], [0.35, "#F4F6F8"], [0.6, "#BCC5CF"], [1, "#6A7480"]]);
    ctx.fillRect(ST.rodX - 2.1, ST.top, 4.2, ST.baseY - ST.top);
    ctx.beginPath();
    ctx.ellipse(ST.rodX, ST.top, 2.1, 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#E9EDF1";
    ctx.fill();
    ctx.restore();
    // 고리(링): 깔때기를 받친다. 뒤쪽 반은 깔때기 뒤
    const ringY = F.rim + 9, ringR = rAt(ringY) + 2.2;
    ctx.save();
    ctx.strokeStyle = "#5C6570";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(F.cx, ringY, ringR, 2.6, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // 거름종이(원뿔): 깔때기 안쪽, 세 겹인 쪽은 오른쪽
    const pTopR = rAt(paperTop) - 0.8;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(F.cx - pTopR, paperTop);
    ctx.lineTo(F.cx, apexY - 2);
    ctx.lineTo(F.cx + pTopR, paperTop);
    ctx.ellipse(F.cx, paperTop, pTopR, F.ry * 0.9, 0, 0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, F.cx - pTopR, 0, F.cx + pTopR, 0, [[0, "#E9E5DA"], [0.45, "#FBFAF5"], [1, "#F1EEE6"]]);
    ctx.fill();
    ctx.clip();
    // 종이 결
    P.shade(t, { x: F.cx - pTopR, y: paperTop - 5, w: 2 * pTopR, h: apexY - paperTop + 5 }, (x, y) => {
      const n = nz.fbm(x * 0.8, y * 0.35, 2);
      return [150, 140, 120, Math.max(0, n) * 0.18];
    });
    // 종이 속 용액(종이 높이를 넘지 않게) + 바닥의 결정
    ctx.fillStyle = "rgba(165,216,255,.42)";
    ctx.fillRect(F.cx - pTopR, fLv, 2 * pTopR, apexY - fLv);
    ctx.fillStyle = "rgba(220,238,252,.9)";
    ctx.beginPath();
    ctx.ellipse(F.cx, fLv, rAt(fLv) - 1.2, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let k = 0; k < 16; k++) {
      const yy = apexY - 6 - rnd() * 14;
      const half = rAt(yy) - 3;
      needle(F.cx + (rnd() * 2 - 1) * half * 0.8, yy, 6 + rnd() * 6, 1.8, (rnd() - 0.5) * 1.4);
    }
    ctx.restore();
    // 세 겹인 쪽 접힌 선
    ctx.save();
    ctx.strokeStyle = "rgba(170,160,140,.8)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(F.cx + pTopR * 0.45, paperTop + 1.2);
    ctx.lineTo(F.cx + 1, apexY - 3);
    ctx.stroke();
    // 종이 가장자리(뒤쪽 테두리)
    ctx.strokeStyle = "rgba(175,165,140,.85)";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.ellipse(F.cx, paperTop, pTopR, F.ry * 0.9, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // 깔때기 유리: 원뿔 + 다리(끝은 비스듬히 자르고 뾰족한 쪽이 비커 안벽에 닿는다)
    ctx.save();
    const cone = (c) => {
      c.moveTo(F.cx - F.rx, F.rim);
      c.lineTo(F.cx - 3, apexY);
      c.lineTo(F.cx - 2.6, stemB);
      c.lineTo(F.cx + 2.6, stemB - 4.5);
      c.lineTo(F.cx + 3, apexY);
      c.lineTo(F.cx + F.rx, F.rim);
      c.ellipse(F.cx, F.rim, F.rx, F.ry, 0, 0, Math.PI, true);
      c.closePath();
    };
    ctx.beginPath();
    cone(ctx);
    ctx.fillStyle = P.lg(ctx, F.cx - F.rx, 0, F.cx + F.rx, 0, [[0, "rgba(150,172,198,.35)"], [0.25, "rgba(240,246,252,.25)"], [0.6, "rgba(255,255,255,.12)"], [1, "rgba(150,172,198,.32)"]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(105,125,150,.85)";
    ctx.lineWidth = 0.9;
    ctx.stroke();
    // 다리 속(물줄기)
    ctx.strokeStyle = "rgba(120,180,230,.7)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(F.cx, apexY - 1);
    ctx.lineTo(F.cx + 0.6, stemB - 2);
    ctx.stroke();
    // 반사
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(F.cx - F.rx + 6, F.rim + 3);
    ctx.lineTo(F.cx - 6, apexY - 6);
    ctx.stroke();
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(F.cx - 1.4, apexY + 3);
    ctx.lineTo(F.cx - 1.2, stemB - 8);
    ctx.stroke();
    // 앞 테두리
    ctx.strokeStyle = "rgba(105,125,150,.8)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(F.cx, F.rim, F.rx, F.ry, 0, 0, Math.PI);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(F.cx, F.rim - 0.3, F.rx, F.ry, 0, 0.1, Math.PI - 0.1);
    ctx.stroke();
    ctx.restore();
    // 받는 비커(거른 용액): 깔때기 다리 끝은 비커 안에 들어가 왼쪽 안벽에 닿는다. 다리의 비커 속 부분은 앞 유리 뒤에 다시 그린다.
    beaker(t, {
      ...RB, ry: 4.4, level: RB.lv, liq: SOL, liqA: 0.85, spout: "l", marks: 4,
      front: () => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(RB.cx - RB.rx - 4, RB.top - 6, 2 * RB.rx + 8, RB.bot - RB.top + 6);
        ctx.clip();
        ctx.beginPath();
        cone(ctx);
        ctx.fillStyle = "rgba(236,243,250,.9)";
        ctx.fill();
        ctx.strokeStyle = "rgba(105,125,150,.85)";
        ctx.lineWidth = 0.9;
        ctx.stroke();
        ctx.strokeStyle = "rgba(120,180,230,.75)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(F.cx, RB.top - 6);
        ctx.lineTo(F.cx + 0.6, stemB - 2);
        ctx.stroke();
        // 다리 끝에서 안벽을 타고 흘러내리는 줄기
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(RB.cx - RB.rx + 1.8, stemB - 1);
        ctx.lineTo(RB.cx - RB.rx + 1.8, RB.lv);
        ctx.stroke();
        ctx.restore();
      },
    });
    // 고리 앞쪽 반 + 고리를 막대에 잇는 팔과 죔쇠
    ctx.save();
    ctx.strokeStyle = "#4F5862";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(F.cx, ringY, ringR, 2.6, 0, 0, Math.PI);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.45)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(F.cx, ringY - 0.6, ringR, 2.6, 0, 0.3, Math.PI - 0.3);
    ctx.stroke();
    ctx.fillStyle = P.lg(ctx, 0, ringY - 1.4, 0, ringY + 1.4, [[0, "#9AA4AF"], [1, "#4C5560"]]);
    ctx.fillRect(ST.rodX + 2, ringY - 1.3, F.cx - ringR - ST.rodX - 2, 2.6);
    ctx.beginPath();
    P.rrect(ctx, ST.rodX - 4.5, ringY - 5, 9, 10, 1.6);
    ctx.fillStyle = P.lg(ctx, ST.rodX - 4.5, 0, ST.rodX + 4.5, 0, [[0, "#3B424A"], [0.4, "#6A737E"], [1, "#2A2F35"]]);
    ctx.fill();
    ctx.restore();
    // 따르는 비커(기울임): 유리 막대를 타고 용액이 거름종이의 세 겹 쪽으로
    const tip = [F.cx + 13, F.rim - 22]; // 따르는 입
    const ang = -0.95; // 기울기(라디안, 반시계)
    const RX = 15, HT = 36;
    ctx.save();
    ctx.translate(tip[0], tip[1]);
    ctx.rotate(ang);
    // 부리가 원점에 오도록: 왼쪽 위 테두리 = (0, 0)
    beaker(t, { cx: RX, top: 0, bot: HT, rx: RX, ry: 3.2, spout: "l", marks: 0, shadow: false });
    ctx.restore();
    // 기운 비커 속 용액(수면은 수평)
    {
      const c = Math.cos(ang), s = Math.sin(ang);
      const toW = (u, v) => [tip[0] + u * c - v * s, tip[1] + u * s + v * c];
      const quad = [toW(1.4, 1), toW(2 * RX - 1.4, 1), toW(2 * RX - 1.4, HT - 2.4), toW(1.4, HT - 2.4)];
      const surfY = tip[1] + 6;
      ctx.save();
      ctx.beginPath();
      quad.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = "rgba(165,216,255,.5)";
      ctx.fillRect(tip[0] - 10, surfY, 80, 60);
      ctx.strokeStyle = "rgba(255,255,255,.95)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(tip[0] - 10, surfY);
      ctx.lineTo(tip[0] + 70, surfY);
      ctx.stroke();
      // 아래로 가라앉은 결정 몇 개(바닥 쪽 벽에)
      for (let k = 0; k < 7; k++) {
        const [x, y] = toW(2 * RX - 4 - rnd() * 5, 10 + rnd() * (HT - 16));
        needle(x, y, 5 + rnd() * 3, 1.2, ang + Math.PI / 2 + (rnd() - 0.5) * 0.8);
      }
      ctx.restore();
    }
    // 유리 막대(입에 대고 거름종이 세 겹 쪽에 끝을 댄다)와 그 위를 타고 흐르는 용액
    const rodTop = [tip[0] + 6, tip[1] - 8], rodBot = [F.cx + rAt(fLv - 6) * 0.55, fLv - 6];
    rod(rodTop[0], rodTop[1], rodBot[0], rodBot[1]);
    ctx.save();
    ctx.strokeStyle = "rgba(120,180,235,.8)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(tip[0] + 0.5, tip[1] + 0.5);
    const tt = (tip[1] + 2 - rodTop[1]) / (rodBot[1] - rodTop[1]);
    ctx.lineTo(rodTop[0] + (rodBot[0] - rodTop[0]) * tt - 1.2, tip[1] + 2);
    ctx.lineTo(rodBot[0] - 1.2, rodBot[1]);
    ctx.stroke();
    ctx.restore();
    ST.ring = [ST.rodX + 10, ringY];
    ST.paperPt = [F.cx - rAt(paperTop + 6) + 3, paperTop + 6];
  }
  zoomLines(t, spot, LZ);

  // ══ 확대 원: 거름종이의 섬유와 구멍 ══
  const band = { y0: LZ.y - 9, y1: LZ.y + 15 }; // 거름종이 두께(원 안)
  const pores = [LZ.x - 33, LZ.x - 4, LZ.x + 27]; // 큰 구멍 자리(x)
  const dotsAbove = [], dotsBelow = [], dotsIn = [];
  lens(t, LZ.x, LZ.y, LZ.r, () => {
    const x0 = LZ.x - LZ.r, x1 = LZ.x + LZ.r;
    // 액체 바탕(위아래 모두 용액)
    ctx.fillStyle = P.lg(ctx, 0, LZ.y - LZ.r, 0, LZ.y + LZ.r, [[0, "#EEF7FF"], [1, "#DDEEFC"]]);
    ctx.fillRect(x0, LZ.y - LZ.r, 2 * LZ.r, 2 * LZ.r);
    // 섬유 층: 납작한 셀룰로스 섬유가 여러 방향으로 얽힌 깔개. 큰 구멍 세 곳은 섬유가 비켜 간다.
    const poreW = (px, y) => 3.6 + 1.6 * Math.sin(y * 0.7 + px); // 구멍 반폭(들쭉날쭉)
    const inPore = (x, y) => pores.some((px) => Math.abs(x - (px + Math.sin(y * 0.45 + px) * 1.4)) < poreW(px, y));
    const fibers = [];
    for (let k = 0; k < 88; k++) {
      const y = band.y0 + rnd() * (band.y1 - band.y0);
      const len = 16 + rnd() * 34, xs = x0 - 12 + rnd() * (2 * LZ.r + 12);
      const ang = (rnd() - 0.5) * 1.1;
      fibers.push({ xs, y, len, ang, wd: 2 + rnd() * 1.8, ph: rnd() * 6, tone: rnd() });
    }
    for (const f of fibers) {
      const segs = [];
      let cur = [];
      for (let s = 0; s <= 1.0001; s += 0.05) {
        const x = f.xs + Math.cos(f.ang) * f.len * s, y = f.y + Math.sin(f.ang) * f.len * (s - 0.5) + Math.sin(s * 4 + f.ph) * 1.1;
        if (inPore(x, y) || y < band.y0 - 1.5 || y > band.y1 + 1.5) {
          if (cur.length > 1) segs.push(cur);
          cur = [];
        } else cur.push([x, y]);
      }
      if (cur.length > 1) segs.push(cur);
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const sg of segs) {
        const path = () => {
          ctx.beginPath();
          sg.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
        };
        path();
        ctx.strokeStyle = "rgba(140,122,92,.6)";
        ctx.lineWidth = f.wd + 0.8;
        ctx.stroke();
        ctx.strokeStyle = f.tone > 0.5 ? "#F8F3E7" : "#EFE8D8";
        ctx.lineWidth = f.wd;
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.9)";
        ctx.lineWidth = f.wd * 0.28;
        ctx.beginPath();
        sg.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1] - f.wd * 0.22) : ctx.moveTo(p[0], p[1] - f.wd * 0.22)));
        ctx.stroke();
      }
      ctx.restore();
    }
    // 녹아 있는 물질: 종류를 나누지 않은 아주 작은 점(위, 구멍 속, 아래)
    const dot = (x, y, list) => {
      list.push([x, y]);
      ctx.fillStyle = "#5A5470";
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    };
    for (let k = 0; k < 70; k++) {
      const x = x0 + rnd() * 2 * LZ.r, y = LZ.y - LZ.r + rnd() * (band.y0 - 2 - (LZ.y - LZ.r));
      if (Math.hypot(x - LZ.x, y - LZ.y) < LZ.r - 2) dot(x, y, dotsAbove);
    }
    for (let k = 0; k < 64; k++) {
      const x = x0 + rnd() * 2 * LZ.r, y = band.y1 + 2 + rnd() * (LZ.y + LZ.r - band.y1 - 2);
      if (Math.hypot(x - LZ.x, y - LZ.y) < LZ.r - 2) dot(x, y, dotsBelow);
    }
    for (const px of pores) for (let k = 0; k < 4; k++) { const yy = band.y0 + 2 + rnd() * (band.y1 - band.y0 - 4); dot(px + Math.sin(yy * 0.45 + px) * 1.4 + (rnd() - 0.5) * 3, yy, dotsIn); }
    // 질산 칼륨 결정: 구멍보다 훨씬 커서 종이 위에 걸린다
    const big = (x, y, L, d, a) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      // 그림자
      ctx.fillStyle = "rgba(60,70,90,.18)";
      ctx.fillRect(-L / 2 + 2, d / 2 - 0.5, L - 2, 2.2);
      // 각기둥: 윗면(밝음), 앞면(중간), 끝 면
      ctx.beginPath();
      ctx.moveTo(-L / 2, -d * 0.1);
      ctx.lineTo(-L / 2 + d * 0.5, -d / 2);
      ctx.lineTo(L / 2 - d * 0.3, -d / 2);
      ctx.lineTo(L / 2, -d * 0.1);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, -d / 2, 0, 0, [[0, "#FFFFFF"], [1, "#EEF3F8"]]);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-L / 2, -d * 0.1);
      ctx.lineTo(L / 2, -d * 0.1);
      ctx.lineTo(L / 2 - d * 0.3, d / 2);
      ctx.lineTo(-L / 2 + d * 0.5, d / 2);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, 0, 0, d / 2, [[0, "#DCE4EE"], [1, "#B3C1D1"]]);
      ctx.fill();
      ctx.strokeStyle = "rgba(110,128,150,.8)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-L / 2, -d * 0.1);
      ctx.lineTo(-L / 2 + d * 0.5, -d / 2);
      ctx.lineTo(L / 2 - d * 0.3, -d / 2);
      ctx.lineTo(L / 2, -d * 0.1);
      ctx.lineTo(L / 2 - d * 0.3, d / 2);
      ctx.lineTo(-L / 2 + d * 0.5, d / 2);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    };
    big(LZ.x - 20, band.y0 - 6.5, 46, 11, -0.06);
    big(LZ.x + 26, band.y0 - 6, 38, 10, 0.08);
    big(LZ.x + 4, band.y0 - 15.5, 40, 9, 0.12);
  }, { bg: ["#EEF7FF", "#DDEEFC"] });

  // ══ 겹층: 화살표와 라벨 ══
  const sv = S.svgLayer(root, w, h);
  // 구멍을 지나가는 물과 녹아 있는 물질(가는 파란 화살표)
  for (const px of pores) S.rayArrow(sv, [px, band.y0 - 9], [px, band.y1 + 9], { color: "#1C7ED6", w: 1.3, hl: 5, hw: 3 });
  // 단계 화살표
  S.fatArrow(sv, [[128, 112], [196, 112]].map((p, i) => (i ? [194, 112] : [150, 112])), { fill: "#9AA8BA", w0: 3, w1: 5.5, head: 9, hw: 7, sw: 1 });
  S.fatArrow(sv, [[C2.cx, 168], [C2.cx, 192]], { fill: "#9AA8BA", w0: 3, w1: 5.5, head: 9, hw: 7, sw: 1 });
  // 단계 이름
  S.label(sv, H1.cx, 18, "① 가열해 모두 녹이기", { size: 14, anchor: "middle" });
  S.label(sv, C2.cx, 18, "② 얼음으로 식히기", { size: 14, anchor: "middle" });
  S.label(sv, 176, 200, "③ 거르기", { size: 14 });
  // ① 라벨
  S.label(sv, H1.cx, 176, "가열 장치", { size: 13.5, anchor: "middle" });
  S.leader(sv, [[H1.cx - 20, 164], [H1.cx - 26, H1.top + 13]]);
  S.label(sv, 100, 62, "유리 막대", { size: 13.5 });
  S.leader(sv, [[98, 58], [H1.cx + 12, 74]]);
  // ② 라벨(오른쪽)
  S.label(sv, 282, 62, "질산 칼륨\n결정", { size: 13.5, lh: 16 });
  S.leader(sv, [[290, 82], [small2.cx + 8, small2.bot - 8]]);
  S.label(sv, 282, 124, "잘게\n부순 얼음", { size: 13.5, lh: 16 });
  S.leader(sv, [[284, 143], [C2.cx + C2.rx - 8, 141]]);
  // ③ 라벨
  S.label(sv, 291, 254, "깔때기", { size: 13.5 });
  S.leader(sv, [[289, 250], [F.cx + rAt(F.rim + 14) - 1, F.rim + 14]]);
  S.label(sv, 338, 280, "거름종이", { size: 13.5, anchor: "end" });
  S.leader(sv, [[286, 276], [F.cx + 9, fLv - 4]]);
  S.label(sv, 287, 334, "거른\n용액", { size: 13.5, lh: 16 });
  S.leader(sv, [[285, 340], [RB.cx + 9, RB.lv + 9]]);
  S.label(sv, 190, 230, "스탠드", { size: 13.5 });
  S.leader(sv, [[192, 233], [ST.rodX + 1, 238]], { dot: false });
  // 확대 원 라벨
  S.label(sv, 8, 229, "질산 칼륨 결정", { size: 13.5 });
  S.leader(sv, [[56, 233], [LZ.x - 26, band.y0 - 10]]);
  const da = dotsAbove.reduce((m, p) => (Math.hypot(p[0] - (LZ.x + 30), p[1] - (LZ.y - 44)) < Math.hypot(m[0] - (LZ.x + 30), m[1] - (LZ.y - 44)) ? p : m), dotsAbove[0]);
  S.label(sv, 8, 211, "녹아 있는 물질", { size: 13.5 });
  S.leader(sv, [[100, 206], [da[0], da[1]]], { dotR: 1.4 });
  S.label(sv, 8, 380, "거름종이의 구멍", { size: 13.5 });
  S.leader(sv, [[48, 366], [pores[0] + 1, band.y1 - 2]], { dotR: 1.6 });
  S.label(sv, 8, 397, "크기는 실제와 다르게 그렸어요", { size: 13.5, weight: 600, color: "#5B6676" });
}
