// Ⅶ 전기와 자기 그림들이 함께 쓰는 도우미: 계산한 자기장(코일, 막대자석), 나침반, 전하 알갱이, 전류 화살표(볼트 옐로 + 진갈색 테두리),
// 구리 전선 같은 원통 획, 비스듬한 투영, 꺾은선 도구. 이 파일은 빌드가 그림으로 치지 않는다(밑줄로 시작).
// 시범 그림 g2u7l7f1.mjs는 고치지 않는다. 나침반 그리기와 장 따라 잇기는 그 그림의 방식을 그대로 옮겨 왔다.

export const COL = {
  cur: "#FFD400", // 전류 화살표(볼트 옐로)
  curEdge: "#6E3F16", // 전류 화살표 테두리(진갈색)
  north: "#E0503A", // N극
  south: "#3D8FE8", // S극
  field: "#1971C2", // 자기장 선(시범 그림과 같은 파랑)
  plus: "#E8583F", // 원자핵과 (+)
  minus: "#3B8DE8", // 전자와 (−)
  force: "#12A594", // 힘
  water: "#3D9BEA",
};

// ── 꺾은선 도구 ──────────────────────────────────────────────────────
export const dist2 = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
export function polyLen(pts) {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += dist2(pts[i - 1], pts[i]);
  return s;
}
/** 꺾은선 위 처음부터 d만큼 간 점과 그 자리의 방향(단위 벡터) */
export function polyAt(pts, d) {
  let left = Math.max(0, d);
  for (let i = 1; i < pts.length; i++) {
    const L = dist2(pts[i - 1], pts[i]);
    if (left <= L || i === pts.length - 1) {
      const t = L ? Math.min(1, left / L) : 0;
      const ux = L ? (pts[i][0] - pts[i - 1][0]) / L : 1, uy = L ? (pts[i][1] - pts[i - 1][1]) / L : 0;
      return { p: [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t], u: [ux, uy] };
    }
    left -= L;
  }
  return { p: pts[pts.length - 1], u: [1, 0] };
}
/** 꺾은선의 d0~d1 구간(길이 기준)을 잘라 낸다 */
export function polySlice(pts, d0, d1, step = 1) {
  const out = [];
  for (let d = d0; d < d1; d += step) out.push(polyAt(pts, d).p);
  out.push(polyAt(pts, d1).p);
  return out;
}
export const pathD = (pts, close = false) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ") + (close ? "Z" : "");
/** 2차 베지어 곡선을 점으로 */
export function quad(a, c, b, n = 24) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return out;
}
/** 원호를 점으로(화면 각도, 0 = 오른쪽, 90 = 아래) */
export function arcPts(cx, cy, r, a0, a1, n = 32, ry = r) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + r * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}

// ── 화살표 다각형(굵은 화살표: 몸통 + 촉) ─────────────────────────────
/** pts 중심선을 따라 폭 w0 → w1, 끝에 촉(길이 head, 반폭 hw). 다각형 점 목록을 돌려준다. */
export function arrowPoly(pts, { w0 = 4, w1 = 4, head = 9, hw = 6.5 } = {}) {
  const n = pts.length;
  const [ex, ey] = pts[n - 1];
  // 촉 길이만큼 중심선 끝을 잘라 낸다(꺾은선 길이 기준)
  const total = polyLen(pts);
  const body = polySlice(pts, 0, Math.max(0.5, total - head), 0.8);
  const last = body[body.length - 1];
  let ux = ex - last[0], uy = ey - last[1];
  const ul = Math.hypot(ux, uy) || 1;
  ux /= ul;
  uy /= ul;
  const left = [], right = [];
  const bl = polyLen(body) || 1;
  let acc = 0;
  body.forEach((p, i) => {
    if (i) acc += dist2(body[i - 1], p);
    const a = body[Math.max(0, i - 1)], b = body[Math.min(body.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const w = (w0 + (w1 - w0) * (acc / bl)) / 2;
    left.push([p[0] - ty * w, p[1] + tx * w]);
    right.push([p[0] + ty * w, p[1] - tx * w]);
  });
  const nx = -uy, ny = ux;
  return [...left, [last[0] + nx * hw, last[1] + ny * hw], [ex, ey], [last[0] - nx * hw, last[1] - ny * hw], ...right.reverse()];
}

/** 전류 화살표(SVG): 볼트 옐로 몸통 + 진갈색 테두리. 코일과 전선 위에서도 구리색과 헷갈리지 않는다. */
export function curArrow(S, s, pts, o = {}) {
  const poly = arrowPoly(pts, { w0: o.w ?? 3.6, w1: o.w ?? 3.6, head: o.head ?? 8.5, hw: o.hw ?? 5.6 });
  const d = pathD(poly, true);
  const g = S.el(s, "g");
  if (o.halo !== false) S.el(g, "path", { d, fill: "none", stroke: "#fff", "stroke-width": 3.4, "stroke-linejoin": "round", opacity: 0.75 });
  S.el(g, "path", { d, fill: COL.cur, stroke: COL.curEdge, "stroke-width": o.sw ?? 1.15, "stroke-linejoin": "round" });
  return g;
}
/** 같은 전류 화살표를 캔버스에(다른 물체 뒤에 깔아야 할 때) */
export function curArrowCtx(ctx, pts, o = {}) {
  const poly = arrowPoly(pts, { w0: o.w ?? 3.6, w1: o.w ?? 3.6, head: o.head ?? 8.5, hw: o.hw ?? 5.6 });
  ctx.save();
  ctx.beginPath();
  poly.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  ctx.lineJoin = "round";
  if (o.halo !== false) {
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 3.4;
    ctx.stroke();
  }
  ctx.fillStyle = COL.cur;
  ctx.fill();
  ctx.strokeStyle = COL.curEdge;
  ctx.lineWidth = o.sw ?? 1.15;
  ctx.stroke();
  ctx.restore();
}
/** 굵은 화살표(SVG, 힘이나 물의 흐름): 채움 + 흰 테두리 + 옅은 그림자 */
export function fat(S, s, pts, o = {}) {
  const poly = arrowPoly(pts, { w0: o.w0 ?? o.w ?? 5, w1: o.w1 ?? o.w ?? 5, head: o.head ?? 11, hw: o.hw ?? 8 });
  const d = pathD(poly, true);
  const g = S.el(s, "g");
  if (o.shadow !== false) S.el(g, "path", { d, fill: "#1B2A44", opacity: 0.16, transform: "translate(1.1 1.6)" });
  S.el(g, "path", { d, fill: o.fill ?? COL.force, stroke: o.stroke ?? "#fff", "stroke-width": o.sw ?? 1.2, "stroke-linejoin": "round" });
  return g;
}

// ── 원통 획(전선, 구리선): 어두운 테두리 → 바탕 → 왼쪽 위 빛줄 ─────────
export function tube(ctx, pts, { w = 4, edge = "#5A2E10", base = "#C77A3A", hi = "rgba(255,226,190,.9)", hiW, cap = "round", shade } = {}) {
  if (pts.length < 2) return;
  const path = () => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  };
  ctx.save();
  ctx.lineCap = cap;
  ctx.lineJoin = "round";
  path();
  ctx.strokeStyle = edge;
  ctx.lineWidth = w;
  ctx.stroke();
  path();
  ctx.strokeStyle = base;
  ctx.lineWidth = w * 0.72;
  ctx.stroke();
  if (shade) {
    // 아래쪽 그늘: 빛과 반대쪽으로 조금 밀어 어둡게
    ctx.translate(w * 0.12, w * 0.16);
    path();
    ctx.strokeStyle = shade;
    ctx.lineWidth = w * 0.3;
    ctx.stroke();
    ctx.translate(-w * 0.12, -w * 0.16);
  }
  ctx.translate(-w * 0.14, -w * 0.18);
  path();
  ctx.strokeStyle = hi;
  ctx.lineWidth = hiW ?? Math.max(0.6, w * 0.24);
  ctx.stroke();
  ctx.restore();
}

// ── 전하 알갱이: 입체 구 + 흰 기호 ──────────────────────────────────
export function charge(P, t, x, y, r, plus, o = {}) {
  P.sphere(t, x, y, r, plus ? (o.color ?? "#E85A40") : (o.color ?? "#3E8EEA"), {
    spec: 0.5,
    gloss: 30,
    rim: 0.25,
    bounce: plus ? "#FFD8CC" : "#D0E6FF",
    wrap: 0.35,
    ambient: 0.24,
  });
  const ctx = t.ctx;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.96)";
  ctx.lineWidth = Math.max(1.1, r * 0.3);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - r * 0.46, y);
  ctx.lineTo(x + r * 0.46, y);
  if (plus) {
    ctx.moveTo(x, y - r * 0.46);
    ctx.lineTo(x, y + r * 0.46);
  }
  ctx.stroke();
  ctx.restore();
}

// ── 나침반(시범 그림과 같은 모양): 바늘의 빨간 끝이 N극, ang은 그 끝이 가리키는 화면 각(라디안) ──
export function compass(P, t, cx, cy, r, ang) {
  const ctx = t.ctx;
  P.dropShadow(t, (c) => c.arc(cx, cy, r, 0, Math.PI * 2), { dx: 1.5, dy: 2.5, blur: 4, a: 0.3 });
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = P.lg(ctx, cx - r, cy - r, cx + r, cy + r, [[0, "#F8F9FA"], [0.5, "#ADB5BD"], [1, "#6C757D"]]);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 2.2, 0, Math.PI * 2);
  ctx.fillStyle = P.rg(ctx, cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r, [[0, "#FFFFFF"], [1, "#E9ECEF"]]);
  ctx.fill();
  ctx.strokeStyle = "rgba(73,80,87,.55)";
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3));
    ctx.lineTo(cx + Math.cos(a) * (r - 5), cy + Math.sin(a) * (r - 5));
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  const L = r - 4.2, Wn = 2.6;
  ctx.shadowColor = "rgba(0,0,0,.25)";
  ctx.shadowBlur = 1.5 * t.dpr;
  ctx.shadowOffsetY = 0.8 * t.dpr;
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.lineTo(0, -Wn);
  ctx.lineTo(0, Wn);
  ctx.closePath();
  ctx.fillStyle = P.lg(ctx, 0, -Wn, 0, Wn, [[0, "#FF6B6B"], [1, "#C92A2A"]]);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-L, 0);
  ctx.lineTo(0, -Wn);
  ctx.lineTo(0, Wn);
  ctx.closePath();
  ctx.fillStyle = P.lg(ctx, 0, -Wn, 0, Wn, [[0, "#F8F9FA"], [1, "#ADB5BD"]]);
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "#495057";
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 2.2, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = P.lg(ctx, cx - r, cy - r, cx, cy, [[0, "rgba(255,255,255,.55)"], [1, "rgba(255,255,255,0)"]]);
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.35, cy - r * 0.42, r * 0.8, r * 0.36, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ── 계산한 자기장 ────────────────────────────────────────────────────
/** 완전 타원 적분 K(m), E(m) (m = k², 산술 기하 평균) */
export function ellipKE(m) {
  let a = 1, b = Math.sqrt(1 - m), c;
  let sum = 0.5 * m, pw = 0.5;
  for (let i = 0; i < 40; i++) {
    c = (a - b) / 2;
    const an = (a + b) / 2;
    b = Math.sqrt(a * b);
    a = an;
    pw *= 2;
    sum += pw * c * c;
    if (Math.abs(c) < 1e-14) break;
  }
  const K = Math.PI / (2 * a);
  return [K, K * (1 - sum)];
}
/** 반지름 a인 고리 전류(축 위 거리 d, 축에서 ρ) 의 자기장 [축 방향, 바깥 방향]. 상수(μ0 I / 2π)는 뺐다. */
export function loopB(a, d, rho) {
  const q = (a + rho) * (a + rho) + d * d;
  const m = Math.min((4 * a * rho) / q, 0.9999999);
  const [K, E] = ellipKE(m);
  const den = (a - rho) * (a - rho) + d * d;
  const sq = Math.sqrt(q);
  const Bx = (K + ((a * a - rho * rho - d * d) / den) * E) / sq;
  const Br = rho < 1e-7 ? 0 : (d / (rho * sq)) * (-K + ((a * a + rho * rho + d * d) / den) * E);
  return [Bx, Br];
}
/** 축이 화면 가로(x)인 원통(반지름 R, x0~x1)에 고르게 감은 전류 면의 자기장. 축 위 cy를 지나는 평면에서 [bx, by]를 준다.
 *  dir = 1이면 속의 자기장이 오른쪽(+x)을 향한다. 고르게 자화한 막대자석의 바깥 자기장과 같다. */
export function solenoid({ x0, x1, cy, R, n = 48, dir = 1 }) {
  const xs = [];
  for (let k = 0; k < n; k++) xs.push(x0 + ((k + 0.5) * (x1 - x0)) / n);
  return (x, y) => {
    const dy = y - cy;
    const rho = Math.abs(dy);
    let bx = 0, br = 0;
    for (const xk of xs) {
      const [a, b] = loopB(R, x - xk, rho);
      bx += a;
      br += b;
    }
    return [dir * bx, dir * br * Math.sign(dy || 0)];
  };
}
/** 장을 따라 잇기(RK4, 한 걸음 h px). stop(x, y, i)가 참이면 멈춘다. 되돌아와 출발점에 닿으면 닫는다. */
export function trace(field, x, y, { h = 0.7, max = 4000, sign = 1, stop, close = true } = {}) {
  const pts = [[x, y]];
  const dir = (px, py) => {
    const [bx, by] = field(px, py);
    const m = Math.hypot(bx, by) || 1;
    return [(sign * bx) / m, (sign * by) / m];
  };
  let far = false;
  for (let i = 0; i < max; i++) {
    const k1 = dir(x, y);
    const k2 = dir(x + (h / 2) * k1[0], y + (h / 2) * k1[1]);
    const k3 = dir(x + (h / 2) * k2[0], y + (h / 2) * k2[1]);
    const k4 = dir(x + h * k3[0], y + h * k3[1]);
    x += (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    y += (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    pts.push([x, y]);
    const d0 = Math.hypot(x - pts[0][0], y - pts[0][1]);
    if (d0 > 12) far = true;
    if (close && far && d0 < h * 1.2) {
      pts.push([...pts[0]]);
      return { pts, closed: true };
    }
    if (stop && stop(x, y, i)) break;
  }
  return { pts, closed: false };
}

// ── 비스듬한 투영(오른쪽 x, 위 y, 앞쪽 z → 화면) ──────────────────────
/** 정사영. yaw(세로축 둘레, +면 오른쪽 면이 보인다), pitch(+면 위에서 내려다본다). 깊이 z2는 클수록 앞. */
export function ortho({ yaw = 0.5, pitch = 0.45, scale = 1, ox = 0, oy = 0 } = {}) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const f = ([x, y, z]) => {
    const x1 = x * cy - z * sy; // 오른쪽으로 돈다: 앞쪽(z+)이 화면 왼쪽으로
    const z1 = x * sy + z * cy;
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    return [ox + x1 * scale, oy - y2 * scale, z2];
  };
  f.dirLight = [-0.5, 0.75, 0.45];
  return f;
}
