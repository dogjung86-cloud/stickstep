// SVG 겹층 도구: 라벨(흰 할로), 지시선(끝점 점), 화살표(테이퍼 몸통, 광선용 가는 화살표), 각도 호, 치수선.
// 라벨 글자는 빌드 때 Pretendard로 래스터에 구워진다. 폰 카드(약 316px)에서 12px 이상이 되게 기본 13px.

const NS = "http://www.w3.org/2000/svg";
export const INK = "#26303D";
export const LEAD = "#4E5968";

export function svgLayer(root, w, h) {
  const s = document.createElementNS(NS, "svg");
  s.setAttribute("viewBox", `0 0 ${w} ${h}`);
  s.setAttribute("width", w);
  s.setAttribute("height", h);
  s.style.cssText = "position:absolute;left:0;top:0;overflow:visible";
  root.appendChild(s);
  return s;
}

export function el(parent, tag, attrs = {}, text) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  if (text !== undefined) e.textContent = text;
  parent.appendChild(e);
  return e;
}

/** 라벨. text의 \n은 줄바꿈. anchor: start | middle | end. 흰 할로가 기본. */
export function label(s, x, y, text, o = {}) {
  const size = o.size ?? 13.5;
  const lh = o.lh ?? size * 1.22;
  const lines = String(text).split("\n");
  const g = el(s, "g");
  const t = el(g, "text", {
    x,
    y,
    "text-anchor": o.anchor ?? "start",
    "font-size": size,
    "font-weight": o.weight ?? 700,
    fill: o.color ?? INK,
    "letter-spacing": o.ls ?? "-0.01em",
    "paint-order": "stroke",
    stroke: o.halo === false ? "none" : o.haloColor ?? "#fff",
    "stroke-width": o.halo === false ? 0 : o.haloW ?? 3.6,
    "stroke-linejoin": "round",
    "font-family": "'Pretendard Variable', Pretendard, sans-serif",
    "dominant-baseline": o.baseline ?? "alphabetic",
  });
  lines.forEach((ln, i) => {
    const sp = el(t, "tspan", { x, dy: i === 0 ? 0 : lh });
    sp.textContent = ln;
  });
  if (o.sub) {
    // 작은 보조 줄(설명): 라벨 아래
    el(g, "text", {
      x,
      y: y + lh * lines.length - size * 0.08,
      "text-anchor": o.anchor ?? "start",
      "font-size": o.subSize ?? 13.5,
      "font-weight": 600,
      fill: o.subColor ?? "#5B6676",
      "paint-order": "stroke",
      stroke: "#fff",
      "stroke-width": 3.2,
      "stroke-linejoin": "round",
      "font-family": "'Pretendard Variable', Pretendard, sans-serif",
    }).textContent = o.sub;
  }
  return g;
}

/** 지시선: pts = [[x,y], …] 라벨 쪽에서 대상 쪽으로. 끝(대상)에 점. */
export function leader(s, pts, o = {}) {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
  const g = el(s, "g");
  if (o.halo !== false) el(g, "path", { d, fill: "none", stroke: "#fff", "stroke-width": (o.w ?? 1.1) + 2.2, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.85 });
  el(g, "path", { d, fill: "none", stroke: o.color ?? LEAD, "stroke-width": o.w ?? 1.1, "stroke-linecap": "round", "stroke-linejoin": "round" });
  if (o.dot !== false) {
    const [x, y] = pts[pts.length - 1];
    el(g, "circle", { cx: x, cy: y, r: (o.dotR ?? 2.3) + 1.1, fill: "#fff" });
    el(g, "circle", { cx: x, cy: y, r: o.dotR ?? 2.3, fill: o.color ?? LEAD });
  }
  return g;
}

/** 굵은 과정 화살표(테이퍼 몸통 + 넓은 촉). pts는 중심선(2점 이상, 곡선은 점을 촘촘히). */
export function fatArrow(s, pts, o = {}) {
  const w0 = o.w0 ?? 3, w1 = o.w1 ?? 6, head = o.head ?? 11, hw = o.hw ?? 9;
  // 촉 길이만큼 중심선을 줄인다
  const n = pts.length;
  const [ex, ey] = pts[n - 1];
  const [px, py] = pts[n - 2];
  const L = Math.hypot(ex - px, ey - py);
  const ux = (ex - px) / L, uy = (ey - py) / L;
  const bx = ex - ux * head, by = ey - uy * head;
  const body = pts.slice(0, -1).concat([[bx, by]]);
  const left = [], right = [];
  let total = 0;
  const seg = [0];
  for (let i = 1; i < body.length; i++) seg.push((total += Math.hypot(body[i][0] - body[i - 1][0], body[i][1] - body[i - 1][1])));
  body.forEach((p, i) => {
    const a = body[Math.max(0, i - 1)], b = body[Math.min(body.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const w = (w0 + (w1 - w0) * (seg[i] / (total || 1))) / 2;
    left.push([p[0] - ty * w, p[1] + tx * w]);
    right.push([p[0] + ty * w, p[1] - tx * w]);
  });
  const nx = -uy, ny = ux;
  const poly = [
    ...left,
    [bx + nx * hw, by + ny * hw],
    [ex, ey],
    [bx - nx * hw, by - ny * hw],
    ...right.reverse(),
  ];
  const d = poly.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ") + "Z";
  const g = el(s, "g");
  if (o.shadow !== false) el(g, "path", { d, fill: "#1B2A44", opacity: 0.16, transform: "translate(1.2 1.8)" });
  el(g, "path", { d, fill: o.fill ?? "#3182F6", stroke: o.stroke ?? "#fff", "stroke-width": o.sw ?? 1.2, "stroke-linejoin": "round" });
  return g;
}

/** 가는 화살표(광선, 힘, 전류): 선 + V촉. at: 촉을 둘 자리(0~1, 선분 위), end: 끝에 촉. */
export function rayArrow(s, a, b, o = {}) {
  const g = el(s, "g");
  const col = o.color ?? "#E8590C";
  const w = o.w ?? 1.8;
  if (o.glow) el(g, "line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: o.glow, "stroke-width": w + 5, "stroke-linecap": "round", opacity: 0.35 });
  el(g, "line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: col, "stroke-width": w, "stroke-linecap": "round", "stroke-dasharray": o.dash ?? null });
  const ats = o.at ?? [1];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
  const hl = o.hl ?? 7.5, hwid = o.hw ?? 4.2;
  for (const t of ats) {
    const tx = a[0] + (b[0] - a[0]) * t + ux * (t === 1 ? 0 : hl / 2);
    const ty = a[1] + (b[1] - a[1]) * t + uy * (t === 1 ? 0 : hl / 2);
    const d = `M${tx - ux * hl + -uy * hwid} ${ty - uy * hl + ux * hwid} L${tx} ${ty} L${tx - ux * hl - -uy * hwid} ${ty - uy * hl - ux * hwid}`;
    el(g, "path", { d: d + "Z", fill: col, stroke: col, "stroke-width": 0.8, "stroke-linejoin": "round" });
  }
  return g;
}

/** 각도 호: 중심 c, 반지름 r, 시작각·끝각(도, 수학 방향이 아니라 화면 방향: 0=오른쪽, 90=아래). */
export function angleArc(s, c, r, a0, a1, o = {}) {
  const p = (a) => [c[0] + r * Math.cos((a * Math.PI) / 180), c[1] + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return el(s, "path", {
    d: `M${x0} ${y0} A${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`,
    fill: o.fill ?? "none",
    stroke: o.color ?? "#F59F00",
    "stroke-width": o.w ?? 1.6,
  });
}

/** 패널 글자((가), (나) 같은 그림 구분 표) */
export function tag(s, x, y, text, o = {}) {
  const g = el(s, "g");
  const w = o.w ?? 26, h = o.h ?? 19;
  el(g, "rect", { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill: o.fill ?? "#26303D", opacity: o.opacity ?? 0.9 });
  el(g, "text", { x, y: y + 4.4, "text-anchor": "middle", "font-size": o.size ?? 12.5, "font-weight": 800, fill: "#fff", "font-family": "'Pretendard Variable', Pretendard, sans-serif" }).textContent = text;
  return g;
}
