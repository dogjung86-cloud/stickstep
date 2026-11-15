// 도해 그리기 도구(브라우저에서 돈다). 그림 모듈의 draw(root, kit)가 이것을 받는다.
// 원칙(README "화풍"): 왼쪽 위 빛, 재질마다 3단 이상 명암, 바닥 접촉 그림자, 균일한 검은 외곽선 금지,
// 라벨은 가는 지시선 + 끝점 + 흰 할로 글자(설계 폭 340px에서 13.5px 이상 = 폰 카드에서 12px 이상).

export const NS = "http://www.w3.org/2000/svg";

/** SVG 요소 하나. attrs의 값이 null/undefined면 빼고, children은 요소나 문자열(글)을 받는다. */
export function s(tag, attrs = {}, ...children) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) e.setAttribute(k, String(v));
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  return e;
}

/** 그림 칸 위에 w×h SVG 층을 하나 얹는다(뒤에 얹은 것이 위). */
export function layer(root, w, h, attrs = {}) {
  const svg = s("svg", { width: w, height: h, viewBox: `0 0 ${w} ${h}`, ...attrs });
  svg.style.overflow = "visible";
  root.appendChild(svg);
  const defs = s("defs");
  svg.appendChild(defs);
  svg.defs = defs;
  return svg;
}

let uid = 0;
export const id = (p = "k") => `${p}${++uid}`;

/** 선형 그라데이션을 defs에 넣고 url()을 돌려준다. stops = [[offset, color, opacity?], ...] */
export function lin(svg, x1, y1, x2, y2, stops, attrs = {}) {
  const i = id("lg");
  svg.defs.appendChild(s("linearGradient", { id: i, x1, y1, x2, y2, gradientUnits: attrs.units ?? "objectBoundingBox", ...attrs.extra },
    stops.map(([o, c, a]) => s("stop", { offset: o, "stop-color": c, "stop-opacity": a ?? 1 }))));
  return `url(#${i})`;
}
/** 방사 그라데이션. */
export function rad(svg, cx, cy, r, stops, attrs = {}) {
  const i = id("rg");
  svg.defs.appendChild(s("radialGradient", { id: i, cx, cy, r, fx: attrs.fx ?? cx, fy: attrs.fy ?? cy, gradientUnits: attrs.units ?? "objectBoundingBox", gradientTransform: attrs.transform },
    stops.map(([o, c, a]) => s("stop", { offset: o, "stop-color": c, "stop-opacity": a ?? 1 }))));
  return `url(#${i})`;
}

/** 부드러운 그림자 필터(아래로 dy, 흐림 b, 진하기 a). */
export function shadowFilter(svg, { dx = 0, dy = 2, b = 3, a = 0.18, color = "#1E2A44" } = {}) {
  const i = id("sh");
  svg.defs.appendChild(s("filter", { id: i, x: "-30%", y: "-30%", width: "160%", height: "160%" },
    s("feDropShadow", { dx, dy, stdDeviation: b, "flood-color": color, "flood-opacity": a })));
  return `url(#${i})`;
}

/** 흐림 필터. */
export function blurFilter(svg, b = 2) {
  const i = id("bl");
  svg.defs.appendChild(s("filter", { id: i, x: "-50%", y: "-50%", width: "200%", height: "200%" }, s("feGaussianBlur", { stdDeviation: b })));
  return `url(#${i})`;
}

/** 결 무늬 필터(feTurbulence를 면에 곱한다). 막, 섬유, 암석 결에 쓴다.
 *  freq: 결의 촘촘함, k: 세기(0~1), oct: 옥타브, seed */
export function grainFilter(svg, { freq = 0.9, k = 0.18, oct = 3, seed = 3, stretch = 1 } = {}) {
  const i = id("gr");
  svg.defs.appendChild(s("filter", { id: i, x: "0%", y: "0%", width: "100%", height: "100%", "color-interpolation-filters": "sRGB" },
    s("feTurbulence", { type: "fractalNoise", baseFrequency: `${freq} ${freq * stretch}`, numOctaves: oct, seed, result: "n" }),
    s("feColorMatrix", { in: "n", type: "matrix", values: `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${k * 2.2} ${-k * 0.9}`, result: "na" }),
    s("feComposite", { in: "na", in2: "SourceGraphic", operator: "in", result: "nm" }),
    s("feBlend", { in: "SourceGraphic", in2: "nm", mode: "multiply" })));
  return `url(#${i})`;
}

/** 가장자리를 유기적으로 흔드는 필터(세포, 잎 단면 같은 살아 있는 모양). */
export function wobbleFilter(svg, { freq = 0.03, amp = 4, seed = 7 } = {}) {
  const i = id("wb");
  svg.defs.appendChild(s("filter", { id: i, x: "-10%", y: "-10%", width: "120%", height: "120%" },
    s("feTurbulence", { type: "fractalNoise", baseFrequency: freq, numOctaves: 2, seed, result: "t" }),
    s("feDisplacementMap", { in: "SourceGraphic", in2: "t", scale: amp, xChannelSelector: "R", yChannelSelector: "G" })));
  return `url(#${i})`;
}

// ── 라벨 ───────────────────────────────────────────────────────────────
export const INK = "#1E2633";
export const LEAD = "#3D4757";
/** 그림 속 글자의 가장 작은 설계 크기. 폰(390 폭)에서 그림이 약 313px로 줄어 0.92배가 되므로 13px이어야 12px 이상으로 보인다. */
export const MIN_FONT = 13;

/** 지시선 라벨. at = 가리키는 점, to = 글자 쪽 끝점, side = 글자가 놓이는 쪽("l"|"r"|"t"|"b").
 *  via = 꺾이는 점(선택). 끝점에는 흰 테 두른 작은 점. 글자는 흰 할로. */
export function label(svg, { at, to, via, text, side = "r", size = 13.5, weight = 700, color = INK, sub, dot = true, line = LEAD, gap = 3 }) {
  size = Math.max(MIN_FONT, size);
  const g = s("g", { class: "lbl" });
  const pts = [at, ...(via ? [via] : []), to];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
  // 흰 바탕 선을 먼저 깔아 어두운 면 위에서도 선이 보이게
  g.appendChild(s("path", { d, fill: "none", stroke: "#fff", "stroke-width": 2.6, "stroke-opacity": 0.75, "stroke-linecap": "round", "stroke-linejoin": "round" }));
  g.appendChild(s("path", { d, fill: "none", stroke: line, "stroke-width": 0.95, "stroke-linecap": "round", "stroke-linejoin": "round" }));
  if (dot) {
    g.appendChild(s("circle", { cx: at[0], cy: at[1], r: 2.6, fill: "#fff" }));
    g.appendChild(s("circle", { cx: at[0], cy: at[1], r: 1.55, fill: line }));
  }
  const [tx, ty] = to;
  let x = tx, y = ty, anchor = "start", base = "central";
  if (side === "r") x = tx + gap;
  else if (side === "l") { x = tx - gap; anchor = "end"; }
  else if (side === "t") { y = ty - gap - size * 0.5; anchor = "middle"; }
  else if (side === "b") { y = ty + gap + size * 0.55; anchor = "middle"; }
  const t = s("text", { x, y, "text-anchor": anchor, "dominant-baseline": base, "font-size": size, "font-weight": weight, fill: color,
    stroke: "#fff", "stroke-width": 3.6, "stroke-linejoin": "round", "paint-order": "stroke", style: "letter-spacing:-.02em" }, text);
  g.appendChild(t);
  if (sub) {
    g.appendChild(s("text", { x, y: y + size * 1.12, "text-anchor": anchor, "dominant-baseline": base, "font-size": Math.max(MIN_FONT, size - 1.5), "font-weight": 500, fill: "#4E5968",
      stroke: "#fff", "stroke-width": 3.4, "stroke-linejoin": "round", "paint-order": "stroke" }, sub));
  }
  svg.appendChild(g);
  return g;
}

/** 지시선 없는 글자(제목, 구역 이름). */
export function text(svg, x, y, str, { size = 13.5, weight = 700, color = INK, anchor = "middle", halo = true, italic = false, ls = "-.02em" } = {}) {
  size = Math.max(MIN_FONT, size);
  const t = s("text", { x, y, "text-anchor": anchor, "dominant-baseline": "central", "font-size": size, "font-weight": weight, fill: color,
    stroke: halo ? "#fff" : null, "stroke-width": halo ? 3.6 : null, "stroke-linejoin": "round", "paint-order": "stroke",
    style: `letter-spacing:${ls}${italic ? ";font-style:italic" : ""}` }, str);
  svg.appendChild(t);
  return t;
}

/** 굵은 흐름 화살표(가운데선 d를 따라 폭이 일정하고 끝에 촉). 색은 그라데이션 가능.
 *  w = 몸통 폭, head = 촉 길이, hw = 촉 반폭 배수. 반환: g */
export function flowArrow(svg, d, { w = 6, head = 11, hw = 1.9, fill = "#E8590C", stroke = null, opacity = 1, shadow = null } = {}) {
  const probe = s("path", { d });
  svg.appendChild(probe);
  const L = probe.getTotalLength();
  const n = Math.max(12, Math.ceil(L / 3));
  const left = [], right = [];
  const bodyEnd = L - head;
  for (let i = 0; i <= n; i++) {
    const l = (bodyEnd * i) / n;
    const p = probe.getPointAtLength(l), q = probe.getPointAtLength(Math.min(L, l + 0.5)), q0 = probe.getPointAtLength(Math.max(0, l - 0.5));
    const tx = q.x - q0.x, ty = q.y - q0.y, tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl, ny = tx / tl;
    left.push([p.x + nx * w / 2, p.y + ny * w / 2]);
    right.push([p.x - nx * w / 2, p.y - ny * w / 2]);
  }
  const pb = probe.getPointAtLength(bodyEnd), pe = probe.getPointAtLength(L), pb0 = probe.getPointAtLength(Math.max(0, bodyEnd - 0.5));
  const tx = pe.x - pb0.x, ty = pe.y - pb0.y, tl = Math.hypot(tx, ty) || 1;
  const nx = -ty / tl, ny = tx / tl;
  const hl = [pb.x + nx * w * hw / 2 + nx * 0, pb.y + ny * w * hw / 2];
  const hr = [pb.x - nx * w * hw / 2, pb.y - ny * w * hw / 2];
  probe.remove();
  const ptsArr = [...left, hl, [pe.x, pe.y], hr, ...right.reverse()];
  const dd = "M" + ptsArr.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" L") + " Z";
  const g = s("g", { opacity, filter: shadow });
  g.appendChild(s("path", { d: dd, fill, stroke, "stroke-width": stroke ? 0.8 : null, "stroke-linejoin": "round" }));
  svg.appendChild(g);
  return g;
}

// ── 잡음(캔버스 질감) ───────────────────────────────────────────────────
function hash(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
export function noise2(x, y, seed = 1) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, seed), b = hash(xi + 1, yi, seed), c = hash(xi, yi + 1, seed), d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, oct = 4, seed = 1) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += a * noise2(x * f, y * f, seed + i * 17); f *= 2.02; a *= 0.5; }
  return v;
}
/** 0~1 고정 난수 열(그림이 빌드마다 같게). */
export function rng(seed = 1) {
  let t = seed >>> 0;
  return () => { t += 0x6d2b79f5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}

/** 점을 고르게 흩뿌린다(최소 간격 d, 직사각형 [x0,x1]×[y0,y1]). 표피세포 같은 다각형 무늬의 씨앗. */
export function scatter(x0, y0, x1, y1, d, seed = 1, tries = 4000) {
  const r = rng(seed), pts = [];
  for (let t = 0; t < tries; t++) {
    const p = [x0 + r() * (x1 - x0), y0 + r() * (y1 - y0)];
    if (pts.every((q) => (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 >= d * d)) pts.push(p);
  }
  return pts;
}

/** 보로노이 칸(경계 상자 안). 점마다 볼록 다각형 [[x,y],...]을 돌려준다(반평면 자르기, 점 수백 개까지). */
export function voronoi(pts, x0, y0, x1, y1, maxDist = Infinity) {
  const clip = (poly, a, b, c) => { // a*x + b*y <= c 쪽만 남긴다
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const P = poly[i], Q = poly[(i + 1) % poly.length];
      const fp = a * P[0] + b * P[1] - c, fq = a * Q[0] + b * Q[1] - c;
      if (fp <= 0) out.push(P);
      if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) { const t = fp / (fp - fq); out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]); }
    }
    return out;
  };
  return pts.map((p, i) => {
    let poly = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let j = 0; j < pts.length && poly.length; j++) {
      if (j === i) continue;
      const q = pts[j], a = q[0] - p[0], b = q[1] - p[1];
      if (a * a + b * b > maxDist * maxDist) continue; // 아주 먼 점은 건너뛸 수 있다(속도). 기본은 모두 본다
      poly = clip(poly, a, b, (q[0] * q[0] + q[1] * q[1] - p[0] * p[0] - p[1] * p[1]) / 2);
    }
    return poly;
  });
}

/** 볼록 다각형을 안쪽으로 d만큼 줄인다(꼭짓점을 무게중심 쪽으로). */
export function inset(poly, d) {
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  return poly.map(([x, y]) => { const dx = x - cx, dy = y - cy, L = Math.hypot(dx, dy) || 1; const k = Math.max(0, (L - d) / L); return [cx + dx * k, cy + dy * k]; });
}

/** 캔버스를 만들어 draw(ctx, w, h)로 칠한다. */
export function canvas(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  draw(ctx, w, h);
  return c;
}

/** 색 섞기(#rrggbb 둘, t 0~1). */
export function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
  return "#" + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
}

// ── three.js 무대 ──────────────────────────────────────────────────────
/** 입체 장면을 연다. 반환 { THREE, renderer, scene, camera, el, render(), project(v) }.
 *  빛: 왼쪽 위 앞의 키라이트(부드러운 그림자) + 하늘·바닥 반사광 + 스튜디오 환경 반사. */
export async function three(root, { w, h, fov = 30, pos = [0, 0, 10], look = [0, 0, 0], env = true, envIntensity = 0.55, key = [-3, 8, 4], keyI = 2.1,
  fillI = 0.55, rimI = 0.5, shadows = true, exposure = 1.0, tone = "none", bg = null, ortho = null } = {}) {
  const THREE = await import("three");
  const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = tone === "aces" ? THREE.ACESFilmicToneMapping : tone === "agx" ? THREE.AgXToneMapping : tone === "neutral" ? THREE.NeutralToneMapping : THREE.NoToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.localClippingEnabled = true;
  if (shadows) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; }
  const el = renderer.domElement;
  el.style.width = w + "px"; el.style.height = h + "px";
  root.appendChild(el);
  const scene = new THREE.Scene();
  if (bg) scene.background = new THREE.Color(bg);
  if (env) {
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = envIntensity;
  }
  let camera;
  if (ortho) {
    const a = w / h, hh = ortho / 2;
    camera = new THREE.OrthographicCamera(-hh * a, hh * a, hh, -hh, 0.1, 5000);
  } else camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 400);
  camera.position.set(...pos);
  camera.lookAt(...look);
  const keyL = new THREE.DirectionalLight(0xffffff, keyI);
  keyL.position.set(...key);
  if (shadows) {
    keyL.castShadow = true;
    keyL.shadow.mapSize.set(2048, 2048);
    keyL.shadow.radius = 6;
    keyL.shadow.bias = -0.0004;
    keyL.shadow.normalBias = 0.02;
    const sc = keyL.shadow.camera; sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; sc.near = 0.5; sc.far = 40;
  }
  scene.add(keyL);
  scene.add(new THREE.HemisphereLight(0xf4f8ff, 0xd8cfc2, fillI));
  const rim = new THREE.DirectionalLight(0xdfe9ff, rimI);
  rim.position.set(5, 2, -6);
  scene.add(rim);
  const v3 = new THREE.Vector3();
  const project = (p) => {
    v3.set(p[0], p[1], p[2]).project(camera);
    return [(v3.x * 0.5 + 0.5) * w, (-v3.y * 0.5 + 0.5) * h];
  };
  const render = () => renderer.render(scene, camera);
  return { THREE, renderer, scene, camera, el, render, project, keyL };
}

/** 회전체 단면(잘라 낸 모형). profile = 닫힌 단면 다각형 [[r, y], ...](r ≥ 0, 반시계든 시계든 무관),
 *  phiStart·phiLength = 남길 둘레(라디안, 0이 +Z 쪽, 남긴 부분은 phiStart에서 시작해 Y축을 반시계로 돈다).
 *  반환: { group, shell, caps }. shell은 겉(안팎 면), caps는 잘린 면 둘(평면). capMat이 없으면 mat을 쓴다. */
export function latheCut(T, profile, { phiStart = 0, phiLength = Math.PI * 1.5, segments = 128, mat, capMat, castShadow = true } = {}) {
  const pts = profile.map(([r, y]) => new T.Vector2(Math.max(0, r), y));
  const closed = pts[0].equals(pts[pts.length - 1]) ? pts : [...pts, pts[0].clone()];
  const shellGeo = new T.LatheGeometry(closed, segments, phiStart, phiLength);
  shellGeo.computeVertexNormals();
  const group = new T.Group();
  const shell = new T.Mesh(shellGeo, mat);
  shell.castShadow = castShadow; shell.receiveShadow = true;
  group.add(shell);
  const caps = [];
  if (phiLength < Math.PI * 2 - 1e-6) {
    const shape = new T.Shape(pts.map((p) => new T.Vector2(p.x, p.y)));
    for (const phi of [phiStart, phiStart + phiLength]) {
      const g = new T.ShapeGeometry(shape, 64);
      const m = new T.Mesh(g, capMat ?? mat);
      m.rotation.y = phi - Math.PI / 2;
      m.castShadow = castShadow; m.receiveShadow = true;
      group.add(m);
      caps.push(m);
    }
  }
  return { group, shell, caps };
}

/** 주변광 가림(GTAO)을 얹어 한 장 그린다. 틈과 맞닿은 곳이 자연스럽게 어두워진다(도감 그림의 깊이감).
 *  st = three()의 반환. radius·thickness는 장면 크기(월드 단위)에 맞춘다. */
export async function renderAO(st, { radius = 0.6, distanceExponent = 1.6, thickness = 1.2, scale = 1.0, blend = 1.0, samples = 16 } = {}) {
  const { THREE: T, renderer, scene, camera } = st;
  const { EffectComposer } = await import("three/addons/postprocessing/EffectComposer.js");
  const { RenderPass } = await import("three/addons/postprocessing/RenderPass.js");
  const { GTAOPass } = await import("three/addons/postprocessing/GTAOPass.js");
  const { OutputPass } = await import("three/addons/postprocessing/OutputPass.js");
  const size = renderer.getDrawingBufferSize(new T.Vector2());
  const rt = new T.WebGLRenderTarget(size.x, size.y, { type: T.HalfFloatType, samples: 4 });
  const comp = new EffectComposer(renderer, rt);
  comp.setPixelRatio(1);
  comp.setSize(size.x, size.y);
  comp.addPass(new RenderPass(scene, camera));
  const ao = new GTAOPass(scene, camera, size.x, size.y);
  ao.updateGtaoMaterial({ radius, distanceExponent, thickness, scale, samples });
  ao.blendIntensity = blend;
  comp.addPass(ao);
  comp.addPass(new OutputPass());
  comp.render();
}

/** 도감식 한 장 그리기: 주변광 가림(GTAO) + 윤곽선. 윤곽선은 검정이 아니라 그 자리 재질 색을 어둡게 한 선이다
 *  (리포의 "외곽선은 재질별 최암색" 문법). 선은 물체 쪽(가까운 쪽) 픽셀에만 그어 바탕으로 번지지 않는다.
 *  userData.noEdge 인 물체(그림자 판, 유리 등)는 선 계산에서 빠진다.
 *  edgeK: 선 진하기(0~1), edgeW: 선 폭(장치 픽셀), nT: 면이 꺾이는 정도의 문턱, dT: 깊이 차 문턱(상대값). */
export async function renderIllus(st, { ao = true, radius = 0.6, distanceExponent = 1.6, thickness = 1.2, aoScale = 1.0, blend = 1.0, samples = 16,
  edge = true, edgeK = 0.5, edgeW = 1.25, nT = 0.42, dT = 0.035 } = {}) {
  const { THREE: T, renderer, scene, camera } = st;
  const { EffectComposer } = await import("three/addons/postprocessing/EffectComposer.js");
  const { RenderPass } = await import("three/addons/postprocessing/RenderPass.js");
  const { GTAOPass } = await import("three/addons/postprocessing/GTAOPass.js");
  const { ShaderPass } = await import("three/addons/postprocessing/ShaderPass.js");
  const { OutputPass } = await import("three/addons/postprocessing/OutputPass.js");
  const size = renderer.getDrawingBufferSize(new T.Vector2());
  // 1) 면 방향과 깊이(선 계산용)
  const nrt = new T.WebGLRenderTarget(size.x, size.y, { type: T.HalfFloatType });
  nrt.depthTexture = new T.DepthTexture(size.x, size.y);
  nrt.depthTexture.type = T.FloatType;
  if (edge) {
    const hidden = [];
    scene.traverse((o) => { if (o.visible && o.userData && o.userData.noEdge) { hidden.push(o); o.visible = false; } });
    const nm = new T.MeshNormalMaterial({ side: T.DoubleSide });
    const prevO = scene.overrideMaterial, prevB = scene.background, prevC = renderer.getClearColor(new T.Color()), prevA = renderer.getClearAlpha();
    scene.overrideMaterial = nm; scene.background = null;
    renderer.setRenderTarget(nrt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); renderer.setRenderTarget(null);
    scene.overrideMaterial = prevO; scene.background = prevB; renderer.setClearColor(prevC, prevA);
    hidden.forEach((o) => (o.visible = true));
  }
  // 2) 그림 + 가림 + 선
  const rt = new T.WebGLRenderTarget(size.x, size.y, { type: T.HalfFloatType, samples: 4 });
  const comp = new EffectComposer(renderer, rt);
  comp.setPixelRatio(1);
  comp.setSize(size.x, size.y);
  comp.addPass(new RenderPass(scene, camera));
  if (ao) {
    const p = new GTAOPass(scene, camera, size.x, size.y);
    p.updateGtaoMaterial({ radius, distanceExponent, thickness, scale: aoScale, samples });
    p.blendIntensity = blend;
    comp.addPass(p);
  }
  if (edge) {
    const near = camera.near, far = camera.far, persp = !!camera.isPerspectiveCamera;
    const ep = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, tN: { value: null }, tD: { value: null }, res: { value: new T.Vector2(size.x, size.y) },
        k: { value: edgeK }, w: { value: edgeW }, nT: { value: nT }, dT: { value: dT }, cn: { value: near }, cf: { value: far }, persp: { value: persp ? 1 : 0 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `
        uniform sampler2D tDiffuse, tN, tD; uniform vec2 res; uniform float k, w, nT, dT, cn, cf, persp; varying vec2 vUv;
        float lin(float d){ if (persp < 0.5) return cn + d * (cf - cn); float z = d * 2.0 - 1.0; return (2.0 * cn * cf) / (cf + cn - z * (cf - cn)); }
        void main(){
          vec4 c = texture2D(tDiffuse, vUv);
          vec4 n0 = texture2D(tN, vUv);
          if (n0.a < 0.5) { gl_FragColor = c; return; }
          float d0 = lin(texture2D(tD, vUv).r);
          float e = 0.0;
          for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) continue;
            vec2 uv = vUv + vec2(float(i), float(j)) * w / res;
            vec4 nn = texture2D(tN, uv);
            if (nn.a < 0.5) { e = max(e, 1.0); continue; }
            float dd = lin(texture2D(tD, uv).r);
            float rel = (dd - d0) / d0;
            e = max(e, smoothstep(dT, dT * 2.2, rel));
            e = max(e, smoothstep(nT, nT * 1.6, length(nn.rgb - n0.rgb)) * 0.8);
          }
          gl_FragColor = vec4(c.rgb * (1.0 - k * e), c.a);
        }`,
    });
    // ShaderPass 는 uniform 을 복제하는데, 렌더 타깃 질감은 복제되지 않아 비워진다. 만든 뒤에 넣는다.
    ep.uniforms.tN.value = nrt.texture;
    ep.uniforms.tD.value = nrt.depthTexture;
    comp.addPass(ep);
  }
  comp.addPass(new OutputPass());
  comp.render();
}

/** 바닥 접촉 그림자 판(그림자만 받는 투명 면). */
export function shadowCatcher(T, scene, { y = 0, size = 30, opacity = 0.14 } = {}) {
  const m = new T.Mesh(new T.PlaneGeometry(size, size), new T.ShadowMaterial({ opacity, color: 0x1e2a44 }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  m.receiveShadow = true;
  m.userData.noEdge = true;
  scene.add(m);
  return m;
}

/** 캔버스 질감(색 공간 sRGB, 비등방 거르기). */
export function canvasTex(T, renderer, cnv, { repeat = null, srgb = true } = {}) {
  const t = new T.CanvasTexture(cnv);
  if (srgb) t.colorSpace = T.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(...repeat); }
  t.needsUpdate = true;
  return t;
}

/** 사진 질감 읽기(public/photos 등). */
export function loadTex(T, url) {
  return new Promise((res, rej) => new T.TextureLoader().load(url, (t) => { t.colorSpace = T.SRGBColorSpace; res(t); }, undefined, rej));
}

/** 이미지 읽기. */
export function loadImg(url) {
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
}

/** 한 프레임 더 기다린다(WebGL 그리기가 화면에 오를 때까지). */
export const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
