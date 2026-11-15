// Ⅲ 빛과 파동 그림 공용 도우미(빌드가 그림으로 치지 않는다: 밑줄 파일).
// 랩과 같은 색: 레이저 초록(BEAM_GREEN 88,240,150), 입사각 호 앰버(255,196,90), 반사각·굴절각 호 시안(126,214,255).
// 밝은 판 위에 그리므로 빛은 초록 심지 + 옅은 번짐, 호는 같은 색 면 + 선, 각 글자는 같은 색을 짙게 한 잉크.
export const D2R = Math.PI / 180;
export const BEAM = "88,240,150";
export const AMBER = "255,196,90";
export const CYAN = "126,214,255";
export const AMBER_INK = "#B86A00";
export const CYAN_INK = "#0B76B4";
export const GRAY_INK = "#5B6676";
export const N_WATER = 1.33;

/** 공기 → 물 굴절각(도) */
export const refractDeg = (deg, n = N_WATER) => Math.asin(Math.sin(deg * D2R) / n) / D2R;

const path = (ctx, pts) => {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
};

/** 레이저 빛(캔버스): 넓은 번짐 → 중간 → 초록 심지 → 밝은 속심. pts = [[x,y], …] */
export function beam(t, pts, o = {}) {
  const { ctx } = t;
  const w = o.w ?? 2.4;
  const a = o.alpha ?? 1;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (o.glow !== false) {
    ctx.strokeStyle = `rgba(${BEAM},${0.15 * a})`;
    ctx.lineWidth = w * 4.2;
    path(ctx, pts);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${BEAM},${0.34 * a})`;
    ctx.lineWidth = w * 2.0;
    path(ctx, pts);
    ctx.stroke();
  }
  ctx.strokeStyle = `rgba(20,176,88,${a})`;
  ctx.lineWidth = w;
  path(ctx, pts);
  ctx.stroke();
  ctx.strokeStyle = `rgba(214,255,228,${0.7 * a})`;
  ctx.lineWidth = Math.max(0.5, w * 0.28);
  path(ctx, pts);
  ctx.stroke();
  ctx.restore();
}

/** 빛이 닿은 점의 작은 빛무리 */
export function hotspot(t, x, y, r = 7, a = 1) {
  const { ctx } = t;
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,255,255,${0.95 * a})`);
  g.addColorStop(0.3, `rgba(${BEAM},${0.75 * a})`);
  g.addColorStop(1, `rgba(${BEAM},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** V자 화살촉(SVG, 랩 drawArrowHead와 같은 꼴: 끝, 두 날개, 안으로 팬 홈). ang: 진행 방향(라디안) */
export function vHead(S, sv, x, y, ang, size = 9, color = "#12A456") {
  const c = Math.cos(ang), s = Math.sin(ang);
  const P = (u, v) => [x + u * c - v * s, y + u * s + v * c];
  const pts = [P(size * 0.6, 0), P(-size * 0.55, -size * 0.52), P(-size * 0.26, 0), P(-size * 0.55, size * 0.52)];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ") + "Z";
  S.el(sv, "path", { d, fill: color, stroke: "#fff", "stroke-width": 1.1, "stroke-linejoin": "round", "paint-order": "stroke" });
}

/** 선분 a→b 위 비율 t 자리에 V자 화살촉 */
export function headOn(S, sv, a, b, t = 0.55, size = 9, color) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
  vHead(S, sv, x + Math.cos(ang) * size * 0.3, y + Math.sin(ang) * size * 0.3, ang, size, color);
}

/** 각도 호(SVG): 중심 c, 반지름 r, 화면 각 a0 → a1(도, 0 = 오른쪽, 90 = 아래). 같은 색의 옅은 면 + 선. */
export function arcWedge(S, sv, c, r, a0, a1, rgb, o = {}) {
  const p = (a) => [c[0] + r * Math.cos(a * D2R), c[1] + r * Math.sin(a * D2R)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  const arcD = `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} ${sweep} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  if (o.fill !== false) S.el(sv, "path", { d: `M${c[0]} ${c[1]} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} ${sweep} ${x1.toFixed(2)} ${y1.toFixed(2)} Z`, fill: `rgba(${rgb},${o.fillA ?? 0.26})` });
  S.el(sv, "path", { d: arcD, fill: "none", stroke: o.edge ?? "rgba(255,255,255,.9)", "stroke-width": (o.w ?? 2.3) + 1.8, "stroke-linecap": "round" });
  S.el(sv, "path", { d: arcD, fill: "none", stroke: `rgb(${rgb})`, "stroke-width": o.w ?? 2.3, "stroke-linecap": "round" });
  if (o.dark) S.el(sv, "path", { d: arcD, fill: "none", stroke: o.dark, "stroke-width": 0.7, "stroke-linecap": "round", opacity: 0.55 });
}

/** 점선(법선, 꺾이지 않았다면 갈 길, 눈이 느끼는 길). 흰 할로 위에 회색 점선. */
export function dashLine(S, sv, a, b, o = {}) {
  const at = { x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
  if (o.halo !== false) S.el(sv, "line", { ...at, stroke: "rgba(255,255,255,.8)", "stroke-width": (o.w ?? 1.5) + 2, "stroke-linecap": "round" });
  S.el(sv, "line", { ...at, stroke: o.color ?? "#5E6B7D", "stroke-width": o.w ?? 1.5, "stroke-dasharray": o.dash ?? "5 4", "stroke-linecap": "butt" });
}

/** 직각 표시: 꼭짓점 c에서 단위 방향 u, v로 한 변 s */
export function rightMark(S, sv, c, u, v, s = 8, color = "#5E6B7D") {
  const p1 = [c[0] + u[0] * s, c[1] + u[1] * s];
  const p2 = [c[0] + (u[0] + v[0]) * s, c[1] + (u[1] + v[1]) * s];
  const p3 = [c[0] + v[0] * s, c[1] + v[1] * s];
  S.el(sv, "path", { d: `M${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} L${p3[0]} ${p3[1]}`, fill: "none", stroke: color, "stroke-width": 1.3 });
}

/** 레이저 지시기 몸통(캔버스). (x, y) = 빛이 나오는 앞끝, ang = 빛의 방향(라디안). 금속 원통, 빛은 왼쪽 위. */
export function laser(t, x, y, ang, o = {}) {
  const { ctx } = t;
  const L = o.len ?? 42, W = o.wid ?? 12;
  // 빛 쪽 면 고르기: 몸통 옆 법선(+y 쪽)이 왼쪽 위를 보면 +y가 밝다
  const ny = [-Math.sin(ang), Math.cos(ang)];
  const litPlus = ny[0] * -0.63 + ny[1] * -0.77 > 0;
  ctx.save();
  // 바닥 그림자(몸통 아래로 살짝)
  ctx.save();
  ctx.shadowColor = "rgba(28,42,68,.28)";
  ctx.shadowBlur = 7 * t.dpr;
  ctx.shadowOffsetX = 2 * t.dpr;
  ctx.shadowOffsetY = 4 * t.dpr;
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.fillStyle = "#566377";
  ctx.beginPath();
  ctx.roundRect(-L, -W / 2, L, W, W / 2.6);
  ctx.fill();
  ctx.restore();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, litPlus ? W / 2 : -W / 2, 0, litPlus ? -W / 2 : W / 2);
  g.addColorStop(0, "#C9D3DF");
  g.addColorStop(0.2, "#F7FAFD");
  g.addColorStop(0.46, "#9BA8B9");
  g.addColorStop(0.8, "#56637A");
  g.addColorStop(1, "#3A4558");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(-L, -W / 2, L, W, W / 2.6);
  ctx.fill();
  // 앞 고리(짙은 금속)와 뒤 마개
  const g2 = ctx.createLinearGradient(0, litPlus ? W / 2 : -W / 2, 0, litPlus ? -W / 2 : W / 2);
  g2.addColorStop(0, "#56627A");
  g2.addColorStop(0.25, "#8C99AD");
  g2.addColorStop(1, "#1F2836");
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.roundRect(-7, -W / 2 - 0.6, 7, W + 1.2, 2.2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-L - 0.5, -W / 2 + 0.6, 5, W - 1.2, 2.4);
  ctx.fill();
  // 단추
  ctx.fillStyle = "#E8590C";
  ctx.beginPath();
  ctx.roundRect(-L * 0.55, litPlus ? W / 2 - 2.6 : -W / 2 - 0.4, 7, 3, 1.2);
  ctx.fill();
  // 방출구 빛
  const gl = ctx.createRadialGradient(1, 0, 0, 1, 0, 9);
  gl.addColorStop(0, "rgba(255,255,255,.95)");
  gl.addColorStop(0.3, `rgba(${BEAM},.8)`);
  gl.addColorStop(1, `rgba(${BEAM},0)`);
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(1, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 둥근 네모 작은 칸(확대 원과 같은 마감: 흰 테 + 회색 선 + 떨어진 그림자). 안쪽 그리기는 clip 상태에서 fn(ctx). */
export function insetBox(t, P, x, y, w, h, r, fn, o = {}) {
  const { ctx } = t;
  P.dropShadow(t, (c) => P.rrect(c, x, y, w, h, r), { dx: 2, dy: 4, blur: 10, a: 0.18 });
  ctx.save();
  ctx.beginPath();
  P.rrect(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.fillStyle = P.lg(ctx, x, y, x, y + h, [[0, o.top ?? "#FFFFFF"], [1, o.bottom ?? "#EEF2F7"]]);
  ctx.fillRect(x, y, w, h);
  fn(ctx);
  ctx.restore();
  ctx.save();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  P.rrect(ctx, x, y, w, h, r);
  ctx.stroke();
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = "#A9B3C1";
  ctx.beginPath();
  P.rrect(ctx, x - 2, y - 2, w + 4, h + 4, r + 2);
  ctx.stroke();
  ctx.restore();
}

/** 평면거울(옆에서 본 단면): 위쪽이 반사면(은빛 한 줄), 아래는 뒷면 빗금. 두께 없는 반사면으로 그린다. */
export function mirror(t, P, x0, x1, y, o = {}) {
  const { ctx } = t;
  const back = o.back ?? 12;
  P.dropShadow(t, (c) => c.rect(x0, y, x1 - x0, back), { dx: 1, dy: 4, blur: 8, a: 0.22 });
  // 뒷면: 짙은 칠 + 빗금
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y, x1 - x0, back);
  ctx.clip();
  ctx.fillStyle = P.lg(ctx, 0, y, 0, y + back, [[0, "#6C7A8E"], [1, "#465366"]]);
  ctx.fillRect(x0, y, x1 - x0, back);
  ctx.strokeStyle = "rgba(214,224,238,.55)";
  ctx.lineWidth = 1.1;
  for (let x = x0 - back; x < x1 + back; x += 6.5) {
    ctx.beginPath();
    ctx.moveTo(x, y + back);
    ctx.lineTo(x + back, y);
    ctx.stroke();
  }
  ctx.restore();
  // 반사면: 은빛 띠(밝은 반짝임 둘)
  ctx.save();
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, "#C3CDDA");
  g.addColorStop(0.18, "#FFFFFF");
  g.addColorStop(0.42, "#B9C5D4");
  g.addColorStop(0.66, "#EEF3F9");
  g.addColorStop(1, "#A9B6C7");
  ctx.fillStyle = g;
  ctx.fillRect(x0, y - 2.2, x1 - x0, 3.4);
  ctx.fillStyle = "rgba(60,74,96,.65)";
  ctx.fillRect(x0, y + 1.0, x1 - x0, 0.8);
  ctx.restore();
}
