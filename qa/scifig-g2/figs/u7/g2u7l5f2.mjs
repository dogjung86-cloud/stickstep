// g2u7l5f2 멀티탭 속 모습: 덮개를 투명하게 비쳐 본 콘센트 셋짜리 멀티탭.
// 몸통을 따라 금속 띠 두 줄(빨강, 파랑으로 강조)이 지나고, 콘센트마다 왼쪽 구멍은 뒤 띠(빨강)의 집게에, 오른쪽 구멍은 앞 띠(파랑)의 집게에 닿는다.
// 그래서 모든 기구가 같은 두 띠 사이에 놓인다(병렬, 모두 220 V). 두 띠는 어디서도 서로 닿지 않는다.
// 실제 치수(mm)에 가깝게 잡고 위에서 비스듬히 본 정사영으로 그린다. 흐름은 화살촉 없이 띠 굵기로만(교류). 검산 메모는 g2u7l5f2.md
import { COL, ortho, tube, quad } from "./_lib.mjs";

export const meta = {
  key: "g2u7l5f2",
  w: 340,
  h: 404,
  alt: "덮개를 비쳐 본 멀티탭 속에 금속 띠 두 줄이 길게 지나고, 콘센트마다 두 구멍이 서로 다른 띠의 집게에 닿아 있어요. 텔레비전, 선풍기, 전등이 모두 같은 두 띠 사이에 이어져 220 V가 걸리고, 멀티탭 전선에는 세 기구의 전류를 더한 만큼 흘러요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(91);
  const s = S.svgLayer(root, w, h);

  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 투영: x 길이 방향(오른쪽), y 위, z 앞쪽(mm) ──
  const pr = ortho({ yaw: 0.14, pitch: 0.6, scale: 1.16, ox: 163, oy: 230 });
  const V = (x, y, z) => pr([x, y, z]);
  const LGT = P.norm3([-0.45, 0.8, 0.42]);
  const lit = (n, base, amb = 0.42) => {
    const d = Math.max(0, n[0] * LGT[0] + n[1] * LGT[1] + n[2] * LGT[2]);
    return P.tone(base, (amb + 0.62 * d - 0.75) * 0.9);
  };
  const path = (pts) => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
  };
  const fillPoly = (pts, fill, stroke, lw = 0.8) => {
    path(pts);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.stroke();
    }
  };
  const quad3 = (a, b, c, d) => [V(...a), V(...b), V(...c), V(...d)];
  const ring = (cx, y, cz, r, n = 56) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      out.push(V(cx + r * Math.cos(a), y, cz + r * Math.sin(a)));
    }
    return out;
  };
  /** 세운 원통(축 y): 옆면(가로 그라데이션) + 윗면 */
  const vcyl = (cx, cz, y0, y1, r, cols, top = true) => {
    const b = ring(cx, y0, cz, r), tp = ring(cx, y1, cz, r);
    const xs = b.map((p) => p[0]);
    const xl = Math.min(...xs), xr = Math.max(...xs);
    const il = xs.indexOf(xl), ir = xs.indexOf(xr);
    const front = (arr) => {
      const out = [];
      let i = ir;
      for (let k = 0; k < arr.length; k++) {
        out.push(arr[i]);
        if (i === il) break;
        i = (i + 1) % arr.length;
      }
      return out;
    };
    path([...front(b), ...front(tp).reverse()]);
    ctx.fillStyle = P.lg(ctx, xl, 0, xr, 0, cols.side);
    ctx.fill();
    if (cols.edge) {
      ctx.strokeStyle = cols.edge;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
    if (top) fillPoly(tp, cols.top, cols.edge, 0.7);
    return { tp, xl, xr };
  };

  // 치수(mm)
  const HL = 128, HZ = 25, HB = 14, HT = 48; // 몸통 반 길이, 반 폭, 받침 높이, 전체 높이
  const OUT = [-84, 0, 84]; // 콘센트 가운데
  const RR = 18, RD = 9, HOLE = 9.5; // 콘센트 오목 반지름, 깊이, 두 구멍 간격의 반(19 mm)
  const ZB = -13, ZF = 13; // 뒤 띠, 앞 띠
  const SY0 = 4, SY1 = 13; // 띠 높이
  const CY = 25; // 집게 꼭대기

  // ── 그림자 ──
  {
    const c0 = V(0, 0, 6);
    P.softShadow(t, c0[0] + 6, c0[1] + 5, 172, 24, 0.2);
  }

  // ── 받침(아래 껍데기, 흰 플라스틱): 바닥, 안쪽 뒷벽, 안쪽 왼벽 ──
  const WALL = 2.2;
  fillPoly(quad3([-HL + WALL, 2, -HZ + WALL], [HL - WALL, 2, -HZ + WALL], [HL - WALL, 2, HZ - WALL], [-HL + WALL, 2, HZ - WALL]), "#E3E7EB");
  fillPoly(quad3([-HL + WALL, 2, -HZ + WALL], [HL - WALL, 2, -HZ + WALL], [HL - WALL, HB, -HZ + WALL], [-HL + WALL, HB, -HZ + WALL]), "#F1F3F5", "rgba(150,158,170,.5)", 0.6);
  fillPoly(quad3([-HL + WALL, 2, -HZ + WALL], [-HL + WALL, 2, HZ - WALL], [-HL + WALL, HB, HZ - WALL], [-HL + WALL, HB, -HZ + WALL]), "#E9ECEF");

  // ── 금속 띠 두 줄 + 콘센트 구멍까지 뻗은 팔과 집게 ──
  const STR = {
    back: { z: ZB, tag: "#EC5B42" },
    front: { z: ZF, tag: "#2F7FE0", gap: true },
  };
  const brassFace = (y0, y1) => P.lg(ctx, 0, y0, 0, y1, [[0, "#F6E09A"], [0.45, "#D4AA4A"], [1, "#9C7522"]]);
  const glowPath = (pts, col, wd = 5.5) => {
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = col;
    ctx.lineWidth = wd;
    ctx.stroke();
    ctx.restore();
  };
  /** 띠 하나: 세운 놋쇠 띠(길이 방향) + 콘센트마다 구멍(z=0) 밑으로 뻗은 팔 + 두 잎 집게.
   *  띠마다 한 가지 색 테두리(빨강, 파랑)로 강조한다. 테두리를 먼저 다 긋고 놋쇠를 칠해 안쪽 금이 생기지 않게 한다. */
  const strip = (st, holeDx) => {
    const z = st.z, x0 = -HL + 10, x1 = HL - 20;
    const parts = [];
    const face = quad3([x0, SY1, z], [x1, SY1, z], [x1, SY0, z], [x0, SY0, z]);
    parts.push([face, brassFace(face[0][1], face[3][1])]);
    parts.push([quad3([x0, SY1, z - 0.9], [x1, SY1, z - 0.9], [x1, SY1, z + 0.9], [x0, SY1, z + 0.9]), "#FFF1C2"]);
    for (const xc of OUT) {
      const xh = xc + holeDx;
      const za = Math.min(z, 0) - 0.5, zb = Math.max(z, 0) + 0.5;
      parts.push([quad3([xh - 3.2, SY1, za], [xh + 3.2, SY1, za], [xh + 3.2, SY1, zb], [xh - 3.2, SY1, zb]), "#EDCB6C"]);
      parts.push([quad3([xh - 3.2, SY1, zb], [xh + 3.2, SY1, zb], [xh + 3.2, SY1 - 1.8, zb], [xh - 3.2, SY1 - 1.8, zb]), "#A98226"]);
      for (const sx of [-1, 1]) {
        const leaf = quad3([xh + sx * 3.2, SY1, 1], [xh + sx * 2.3, CY, 1], [xh + sx * 3.4, CY + 1.3, 1], [xh + sx * 4.6, SY1, 1]);
        parts.push([leaf, P.lg(ctx, 0, leaf[2][1], 0, leaf[0][1], [[0, "#FFEDB5"], [1, "#B88A2B"]])]);
      }
    }
    ctx.save();
    ctx.lineJoin = "round";
    if (st.gap) {
      // 앞 띠의 팔과 집게가 뒤 띠 앞을 지날 때 닿아 보이지 않게 흰 틈을 둔다
      for (const [pts] of parts.slice(2)) {
        path(pts);
        ctx.strokeStyle = "rgba(255,255,255,.95)";
        ctx.lineWidth = 6.4;
        ctx.stroke();
      }
    }
    for (const [pts] of parts) {
      path(pts);
      ctx.strokeStyle = st.tag;
      ctx.lineWidth = 3.4;
      ctx.stroke();
    }
    for (const [pts, fill] of parts) {
      path(pts);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = "rgba(100,70,15,.55)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ctx.restore();
  };
  // 핀(지름 4.8 mm): 콘센트 바닥에서 집게 속까지
  const pin = (x) => vcyl(x, 0, CY - 7, HT - RD, 2.4, { side: [[0, "#F8F9FA"], [0.4, "#CED4DA"], [1, "#5C6670"]], top: "#E9ECEF", edge: "rgba(60,66,76,.65)" }, false);
  // 멀티탭 전선의 두 가닥(오른쪽 끝 고무 부싱에서 띠 끝으로)
  const lead = (z, col) => {
    const a = [HL + 5, 9.5, 0], b = [HL - 20.5, (SY0 + SY1) / 2, z];
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u, zz = a[2] + (b[2] - a[2]) * Math.sin((u * Math.PI) / 2);
      pts.push(V(x, y, zz));
    }
    tube(ctx, pts, { w: 3.8, edge: "rgba(30,30,30,.6)", base: col, hi: "rgba(255,255,255,.55)" });
    // 띠 끝을 무는 나사
    const sc = V(b[0] + 1.2, b[1], z);
    ctx.save();
    ctx.beginPath();
    ctx.arc(sc[0], sc[1], 2.2, 0, Math.PI * 2);
    ctx.fillStyle = P.rg(ctx, sc[0] - 0.7, sc[1] - 0.7, 0.2, sc[0], sc[1], 2.2, [[0, "#F8F9FA"], [1, "#6C757D"]]);
    ctx.fill();
    ctx.restore();
  };
  strip(STR.back, -HOLE);
  strip(STR.front, HOLE);
  lead(ZB, "#B5562F");
  lead(ZF, "#3E78C9");
  for (const xc of OUT) {
    pin(xc - HOLE);
    pin(xc + HOLE);
  }

  // ── 받침 바깥: 앞벽, 오른쪽 끝벽 ──
  fillPoly(quad3([-HL, 0, HZ], [HL, 0, HZ], [HL, HB, HZ], [-HL, HB, HZ]), P.lg(ctx, 0, V(0, HB, HZ)[1], 0, V(0, 0, HZ)[1], [[0, "#FFFFFF"], [1, "#D5DAE0"]]), "rgba(110,120,134,.55)", 0.8);
  fillPoly(quad3([HL, 0, HZ], [HL, 0, -HZ], [HL, HB, -HZ], [HL, HB, HZ]), "#E3E7EC", "rgba(110,120,134,.55)", 0.8);
  {
    const c = V(HL + 0.3, 9.5, 0);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(c[0], c[1], 3, 5.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#3B4048";
    ctx.fill();
    ctx.restore();
  }

  // ── 투명하게 비친 덮개 ──
  const edge = "rgba(112,124,142,.8)";
  fillPoly(quad3([-HL, HB, HZ], [HL, HB, HZ], [HL, HT, HZ], [-HL, HT, HZ]), "rgba(255,255,255,.26)", edge, 0.9);
  fillPoly(quad3([HL, HB, HZ], [HL, HB, -HZ], [HL, HT, -HZ], [HL, HT, HZ]), "rgba(232,236,242,.45)", edge, 0.9);
  const coverTop = quad3([-HL, HT, -HZ], [HL, HT, -HZ], [HL, HT, HZ], [-HL, HT, HZ]);
  path(coverTop);
  for (const xc of OUT) {
    const r = ring(xc, HT, 0, RR);
    r.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
  }
  ctx.fillStyle = "rgba(255,255,255,.3)";
  ctx.fill("evenodd");
  fillPoly(coverTop, null, edge, 0.9);
  // 콘센트(오목한 둥근 자리) 바닥과 구멍, 둘레
  for (const xc of OUT) {
    fillPoly(ring(xc, HT - RD, 0, RR), "rgba(240,243,247,.35)", "rgba(112,124,142,.55)", 0.7);
    for (const dx of [-HOLE, HOLE]) fillPoly(ring(xc + dx, HT - RD, 0, 2.7, 24), "rgba(52,58,68,.6)");
    fillPoly(ring(xc, HT, 0, RR), null, "rgba(100,112,130,.9)", 1);
  }

  // ── 플러그(둥근 흰 몸통)가 콘센트에 꽂혀 있다 ──
  const plugTops = [];
  for (const xc of OUT) {
    // 접지 날개(뒤쪽, 오목한 벽의 회색 금속: 플러그 뒤로 조금 보인다)
    const wb = quad3([xc - 3.5, HT, -RR + 0.6], [xc + 3.5, HT, -RR + 0.6], [xc + 3.5, HT - RD + 1, -RR + 0.6], [xc - 3.5, HT - RD + 1, -RR + 0.6]);
    fillPoly(wb, "#ADB5BD", "rgba(70,76,86,.7)", 0.6);
    vcyl(xc, 0, HT - RD + 0.5, HT + 5, 15, { side: [[0, "#FFFFFF"], [0.35, "#F1F3F5"], [0.8, "#C9CFD6"], [1, "#9AA3AE"]], top: "#F8F9FA", edge: "rgba(110,120,134,.65)" });
    vcyl(xc, 0, HT + 5, HT + 19, 8.5, { side: [[0, "#FFFFFF"], [0.4, "#EEF0F3"], [1, "#A3ACB6"]], top: "#F8F9FA", edge: "rgba(110,120,134,.65)" });
    plugTops.push(V(xc, HT + 19, 0));
  }

  // ── 기구(텔레비전, 선풍기, 전등)와 줄, 흐름 띠 ──
  // 흐름(전류)의 굵기: 텔레비전 3, 선풍기 2, 전등 1 (한 눈금 1.6 px) → 멀티탭 전선 6 눈금 = 9.6 px
  const UNIT = 1.6;
  const band = (pts, wd) => {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = "rgba(110,63,22,.6)";
    ctx.lineWidth = wd + 1.5;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,212,0,.95)";
    ctx.lineWidth = wd;
    ctx.stroke();
    ctx.restore();
  };
  const APP = [
    { key: "tv", x: plugTops[0][0], y: 38, i: 3 },
    { key: "fan", x: plugTops[1][0], y: 38, i: 2 },
    { key: "lamp", x: plugTops[2][0], y: 38, i: 1 },
  ];
  APP.forEach((a, k) => {
    const p0 = plugTops[k];
    const p1 = [a.x, a.y + 52];
    const pts = quad(p0, [p0[0] - 4, (p0[1] + p1[1]) / 2], p1, 20);
    tube(ctx, pts, { w: 3.6, edge: "rgba(70,78,90,.7)", base: "#F1F3F5", hi: "rgba(255,255,255,.9)" });
    band(pts.slice(3, -3).map(([x, y]) => [x + 7.5, y]), a.i * UNIT);
  });
  // 멀티탭 전선: 오른쪽 끝에서 나와 아래로
  const c0 = V(HL + 4, 9.5, 0);
  const cord = quad([c0[0], c0[1]], [c0[0] + 26, c0[1] + 6], [c0[0] + 18, c0[1] + 60], 18).concat(quad([c0[0] + 18, c0[1] + 60], [c0[0] + 12, c0[1] + 120], [c0[0] + 14, h + 4], 18).slice(1));
  tube(ctx, cord, { w: 6.6, edge: "rgba(40,44,52,.8)", base: "#E9ECEF", hi: "rgba(255,255,255,.9)" });
  band(cord.slice(12).map(([x, y]) => [x - 11, y]), 6 * UNIT);

  // 기구 그림(작은 크기, 왼쪽 위 빛)
  const tv = (cx, cy) => {
    fillPoly([[cx - 14, cy + 27], [cx + 14, cy + 27], [cx + 10, cy + 23], [cx - 10, cy + 23]], "#495057");
    ctx.fillStyle = "#5C6670";
    ctx.fillRect(cx - 2, cy + 17, 4, 7);
    P.dropShadow(t, (c) => P.rrect(c, cx - 27, cy - 18, 54, 36, 3), { dx: 1.5, dy: 2.5, blur: 4, a: 0.25 });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, cx - 27, cy - 18, 54, 36, 3);
    ctx.fillStyle = "#1E2228";
    ctx.fill();
    ctx.beginPath();
    P.rrect(ctx, cx - 24.5, cy - 15.5, 49, 31, 1.5);
    ctx.fillStyle = P.lg(ctx, cx - 24, cy - 15, cx + 24, cy + 15, [[0, "#4D74AE"], [0.5, "#21375A"], [1, "#0F1726"]]);
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,.14)";
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy - 15);
    ctx.lineTo(cx + 2, cy - 15);
    ctx.lineTo(cx - 14, cy + 16);
    ctx.lineTo(cx - 24, cy + 16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  const fan = (cx, cy) => {
    ctx.fillStyle = P.lg(ctx, cx - 2, 0, cx + 2, 0, [[0, "#F1F3F5"], [1, "#9AA3AE"]]);
    ctx.fillRect(cx - 2, cy + 6, 4, 18);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy + 26, 14, 3.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, cx - 14, 0, cx + 14, 0, [[0, "#F8F9FA"], [1, "#8E98A4"]]);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(cx, cy - 4);
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate(0.4 + (i / 3) * Math.PI * 2);
      ctx.beginPath();
      ctx.ellipse(9, 0, 9, 4.6, 0.25, 0, Math.PI * 2);
      ctx.fillStyle = P.lg(ctx, 0, -5, 18, 5, [[0, "#C5E3FA"], [1, "#4C9AE0"]]);
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 3.4, 0, Math.PI * 2);
    ctx.fillStyle = "#ADB5BD";
    ctx.fill();
    ctx.strokeStyle = "rgba(90,98,110,.75)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, 0, 21, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4);
      ctx.lineTo(Math.cos(a) * 21, Math.sin(a) * 21);
      ctx.stroke();
    }
    ctx.restore();
  };
  const lamp = (cx, cy) => {
    ctx.save();
    ctx.fillStyle = P.rg(ctx, cx + 8, cy + 8, 1, cx + 8, cy + 8, 26, [[0, "rgba(255,226,140,.75)"], [1, "rgba(255,226,140,0)"]]);
    ctx.fillRect(cx - 20, cy - 20, 56, 56);
    ctx.restore();
    ctx.beginPath();
    ctx.ellipse(cx - 10, cy + 26, 13, 3.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, cx - 23, 0, cx + 3, 0, [[0, "#495057"], [1, "#212529"]]);
    ctx.fill();
    tube(ctx, [[cx - 10, cy + 25], [cx - 16, cy + 2], [cx + 2, cy - 12]], { w: 3.4, edge: "#212529", base: "#5C6670", hi: "rgba(255,255,255,.5)" });
    ctx.save();
    ctx.translate(cx + 4, cy - 12);
    ctx.rotate(0.55);
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.lineTo(4, -5);
    ctx.lineTo(13, 9);
    ctx.lineTo(-13, 9);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, -13, 0, 13, 0, [[0, "#868E96"], [0.4, "#495057"], [1, "#212529"]]);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 9.5, 12, 2.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF3BF";
    ctx.fill();
    ctx.restore();
  };
  const ICON = { tv, fan, lamp };
  APP.forEach((a) => ICON[a.key](a.x, a.y));

  // ── 옆 칸: 같은 연결을 회로로(두 줄 사이에 기구 셋, 흐름 띠는 줄마다 더해진다) ──
  const px0 = 8, py0 = 302, pw = 188, ph = 98;
  P.dropShadow(t, (c) => P.rrect(c, px0, py0, pw, ph, 10), { dx: 0, dy: 2, blur: 5, a: 0.12 });
  ctx.save();
  ctx.beginPath();
  P.rrect(ctx, px0, py0, pw, ph, 10);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.strokeStyle = "rgba(120,132,150,.3)";
  ctx.stroke();
  ctx.restore();
  const rT = py0 + 36, rB = py0 + 84, rx0 = px0 + 14, xs = [px0 + 62, px0 + 116, px0 + 170];
  tube(ctx, [[rx0, rT], [xs[2], rT]], { w: 3.4, edge: "rgba(30,36,46,.6)", base: "#E8604A", hi: "rgba(255,255,255,.55)" });
  tube(ctx, [[rx0, rB], [xs[2], rB]], { w: 3.4, edge: "rgba(30,36,46,.6)", base: "#3D86E0", hi: "rgba(255,255,255,.55)" });
  ctx.save();
  ctx.fillStyle = "#495057";
  for (const y of [rT, rB]) {
    ctx.beginPath();
    ctx.arc(rx0, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  xs.forEach((x, k) => {
    tube(ctx, [[x, rT], [x, rB]], { w: 2.6, edge: "rgba(30,36,46,.6)", base: "#ADB5BD", hi: "rgba(255,255,255,.6)" });
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, (rT + rB) / 2, 13, 0, Math.PI * 2);
    ctx.fillStyle = "#F8F9FA";
    ctx.fill();
    ctx.strokeStyle = "#868E96";
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.clip();
    ctx.translate(x, (rT + rB) / 2);
    ctx.scale(0.38, 0.38);
    ICON[APP[k].key](k === 2 ? -2 : 0, k === 1 ? -2 : -4);
    ctx.restore();
  });

  // ── 겹층: 이름표 ──
  APP.forEach((a) => {
    S.el(s, "rect", { x: a.x - 22, y: a.y + 33, width: 44, height: 18, rx: 9, fill: "#FFF3BF", stroke: "#E0B000", "stroke-width": 1 });
    S.label(s, a.x, a.y + 46.5, "220 V", { size: 13.5, anchor: "middle", weight: 800, halo: false, color: "#5C4300" });
  });
  S.label(s, px0 + 12, py0 + 21, "병렬연결", { size: 14 });
  S.label(s, px0 + pw - 10, py0 + 21, "모두 220 V", { size: 13.5, anchor: "end", color: "#5C4300" });
  // 금속 띠: 빨간 띠, 파란 띠에 하나씩
  const sB = V(-112, SY1, ZB), sF = V(-104, SY0, ZF);
  S.leader(s, [[30, 258], [36, 252], [sF[0] + 2, sF[1] + 1]]);
  S.leader(s, [[30, 258], [24, 252], [sB[0] - 2, sB[1] - 1]]);
  S.label(s, 8, 276, "금속 띠", { size: 14 });
  // 콘센트: 플러그를 뽑은 모습을 확대 원으로(둥근 구멍 둘, 양옆 회색 접지 날개)
  {
    const IX = 150, IY = 270, IR = 25;
    const sc = V(0, HT, RR);
    S.el(s, "path", { d: `M${IX} ${IY - IR - 2} L${sc[0] - 2} ${sc[1] + 3}`, stroke: "#8D99A8", "stroke-width": 1, "stroke-dasharray": "3 2.5", fill: "none" });
    ctx.save();
    P.dropShadow(t, (c) => c.arc(IX, IY, IR, 0, Math.PI * 2), { dx: 0, dy: 2, blur: 5, a: 0.18 });
    ctx.beginPath();
    ctx.arc(IX, IY, IR, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, IX - IR, IY - IR, IX + IR, IY + IR, [[0, "#FFFFFF"], [1, "#E3E7EC"]]);
    ctx.fill();
    ctx.clip();
    const k = 1.05; // mm → px
    // 오목한 자리(바닥이 조금 어둡고, 왼쪽 위 벽에 그늘)
    ctx.beginPath();
    ctx.arc(IX, IY, RR * k, 0, Math.PI * 2);
    ctx.fillStyle = P.rg(ctx, IX + 4, IY + 4, 2, IX, IY, RR * k, [[0, "#F1F3F5"], [0.82, "#DDE2E8"], [1, "#B9C1CB"]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(90,100,116,.7)";
    ctx.lineWidth = 1;
    ctx.stroke();
    // 접지 날개(위아래 벽, 회색 금속)
    for (const sy of [-1, 1]) {
      ctx.beginPath();
      P.rrect(ctx, IX - 4.2, IY + sy * RR * k - 2.6, 8.4, 5.2, 1.4);
      ctx.fillStyle = P.lg(ctx, IX - 4, 0, IX + 4, 0, [[0, "#E9ECEF"], [0.5, "#ADB5BD"], [1, "#6C757D"]]);
      ctx.fill();
      ctx.strokeStyle = "rgba(60,66,76,.7)";
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
    // 구멍 둘(지름 4.8 mm, 19 mm 떨어짐)
    for (const sx of [-1, 1]) {
      const hx = IX + sx * HOLE * k;
      ctx.beginPath();
      ctx.arc(hx, IY, 2.9, 0, Math.PI * 2);
      ctx.fillStyle = P.rg(ctx, hx - 0.8, IY - 0.8, 0.3, hx, IY, 2.9, [[0, "#1E2228"], [1, "#4A515C"]]);
      ctx.fill();
    }
    ctx.restore();
    S.el(s, "circle", { cx: IX, cy: IY, r: IR + 1.2, fill: "none", stroke: "#fff", "stroke-width": 3 });
    S.el(s, "circle", { cx: IX, cy: IY, r: IR + 2.6, fill: "none", stroke: "#9AA5B4", "stroke-width": 1 });
    S.label(s, IX + IR + 8, IY + 5, "콘센트", { size: 14 });
  }
  const pg = V(-84 - 15.5, HT + 2, 0);
  S.leader(s, [[52, 158], [58, 158], [pg[0] + 1.5, pg[1]]]);
  S.label(s, 8, 163, "플러그", { size: 14 });
  const cq = cord[22];
  S.leader(s, [[cq[0] - 34, 296], [cq[0] - 24, 296], [cq[0] - 2, cq[1]]]);
  S.label(s, cq[0] - 37, 301, "멀티탭 전선", { size: 14, anchor: "end" });
  S.label(s, 206, 330, "전선에는\n기구들의 전류를\n더한 만큼\n흘러요.", { size: 13.5, color: "#5C4300", lh: 17 });
  // 전류(흐름 띠) 이름: 텔레비전 줄 옆
  S.label(s, plugTops[0][0] + 12, 118, "전류", { size: 13.5, color: "#8A5A00" });
  window.__l5f2 = { plugTops };
}
