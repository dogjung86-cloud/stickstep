// u7l1f2 · 소행성, 혜성, 왜소 행성의 생김새. 개념 '소행성, 혜성, 왜소 행성'의 용어 카드 뒤.
// 검산 메모: u7l1f2.md. 명왕성은 실사(public/photos/star/pluto.webp, NASA 뉴허라이즌스, 공공 저작물), 소행성과 혜성 핵은 코드로 만든 입체다
// (앱에 실사가 없다. 새 사진을 받으려면 사용자 허락이 필요해 그림으로 그렸다). 햇빛은 오른쪽에서 온다(명왕성 사진의 밝은 쪽과 같다).
// 그래서 혜성의 꼬리는 왼쪽(태양 반대쪽)으로 뻗는다. 세 천체의 크기 비율은 서로 다르다(실제로는 명왕성이 훨씬 크다).
export const meta = { key: "u7l1f2", w: 340, h: 206, scale: 3, quality: 88, bg: "#0B1426" };

// ── 3차원 값 잡음 ──
function hash3(x, y, z, s) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177) ^ Math.imul(s, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise3(x, y, z, s) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const c = (a, b, d) => hash3(xi + a, yi + b, zi + d, s);
  const x00 = c(0, 0, 0) + (c(1, 0, 0) - c(0, 0, 0)) * u, x10 = c(0, 1, 0) + (c(1, 1, 0) - c(0, 1, 0)) * u;
  const x01 = c(0, 0, 1) + (c(1, 0, 1) - c(0, 0, 1)) * u, x11 = c(0, 1, 1) + (c(1, 1, 1) - c(0, 1, 1)) * u;
  return x00 + (x10 - x00) * v + ((x01 + (x11 - x01) * v) - (x00 + (x10 - x00) * v)) * w;
}
function fbm3(x, y, z, s, oct = 5) {
  let a = 0.5, t = 0, n = 0;
  for (let i = 0; i < oct; i++) { t += a * vnoise3(x, y, z, s + i * 17); n += a; x *= 2.03; y *= 2.03; z *= 2.03; a *= 0.5; }
  return t / n;
}
const sm = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** 울퉁불퉁한 덩어리: 단위 구를 잡음과 구덩이로 부풀리고 찌그러뜨린다. 꼭짓점 색(구덩이 속은 어둡고 테두리는 밝다)을 함께. */
function lump(T, mergeVertices, { detail, amp, freq, seed, stretch, craters, lobes, base, dark, light }) {
  let g = new T.IcosahedronGeometry(1, detail);
  g.deleteAttribute("normal"); g.deleteAttribute("uv");
  g = mergeVertices(g);
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const v = new T.Vector3();
  let rs = seed * 7 + 1;
  const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
  const cr = [];
  for (let i = 0; i < craters; i++) {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, q = Math.sqrt(1 - u * u);
    const a = 0.1 + rnd() * rnd() * 0.42;
    cr.push({ c: new T.Vector3(q * Math.cos(th), u, q * Math.sin(th)), a, d: a * (0.32 + rnd() * 0.2) });
  }
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    let r = 1 + amp * (fbm3(v.x * freq + 3, v.y * freq, v.z * freq, seed) - 0.5) * 2 + 0.035 * (fbm3(v.x * 9, v.y * 9, v.z * 9, seed + 3, 3) - 0.5) * 2;
    let dent = 0, rim = 0;
    for (const k of cr) {
      const ang = Math.acos(Math.max(-1, Math.min(1, v.dot(k.c))));
      const q = ang / k.a;
      if (q < 1) { r -= k.d * (1 - q ** 4); dent = Math.max(dent, 1 - q); } // 바닥이 평평하고 벽이 가파른 구덩이
      else if (q < 1.4) { const b = 1 - Math.abs(q - 1.12) / 0.28; if (b > 0) { r += k.d * 0.5 * b; rim = Math.max(rim, b); } }
    }
    if (lobes) {
      r *= 1 + 0.42 * v.x * v.x - 0.22 * Math.exp(-((v.x / 0.3) ** 2));
      if (v.x > 0) r *= 0.82;
    }
    pos.setXYZ(i, v.x * r * stretch[0], v.y * r * stretch[1], v.z * r * stretch[2]);
    const t = fbm3(v.x * 4 + 9, v.y * 4, v.z * 4, seed + 5, 3);
    let c = t < 0.5 ? mix(dark, base, sm(0.28, 0.5, t)) : mix(base, light, sm(0.5, 0.75, t));
    c = mix(c, dark, Math.min(1, dent * 1.6) * 0.55);
    c = mix(c, light, rim * 0.45);
    // 꼭짓점 색은 선형 공간 값이다(sRGB 값을 그대로 넣으면 밝게 바랜다)
    col[i * 3] = (c[0] / 255) ** 2.2; col[i * 3 + 1] = (c[1] / 255) ** 2.2; col[i * 3 + 2] = (c[2] / 255) ** 2.2;
  }
  g.setAttribute("color", new T.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const AST = [60, 82];   // 소행성 가운데
  const HEAD = [220, 98]; // 혜성 머리
  const PLU = [284, 82];  // 명왕성 가운데
  const PR = 43;          // 명왕성 반지름(px)

  // ── 바탕: 우주, 혜성 꼬리와 머리의 빛(코마) ──
  const bg = kit.layer(root, W, H);
  bg.appendChild(kit.s("rect", { width: W, height: H, fill: kit.lin(bg, 0, 0, 0, 1, [[0, "#0A1224"], [1, "#0E1A33"]]) }));
  const rs = kit.rng(19);
  for (let i = 0; i < 110; i++) bg.appendChild(kit.s("circle", { cx: rs() * W, cy: rs() * H * 0.82, r: rs() < 0.9 ? 0.4 + rs() * 0.35 : 0.8 + rs() * 0.3, fill: "#FFFFFF", opacity: 0.16 + rs() * 0.32 }));
  // 칸 바탕(세 천체마다 옅은 칸)
  for (const [x0, x1] of [[6, 112], [116, 232], [236, 334]]) bg.appendChild(kit.s("rect", { x: x0, y: 6, width: x1 - x0, height: 172, rx: 12, fill: "#5C7CC4", "fill-opacity": 0.1, stroke: "#8FA8E0", "stroke-opacity": 0.22, "stroke-width": 1 }));
  // 꼬리: 태양(오른쪽, 조금 아래) 반대쪽, 머리에서 멀수록 넓고 옅다
  const ux = -0.985, uy = -0.172, L = 98;
  const nx = -uy, ny = ux;
  const end = [HEAD[0] + ux * L, HEAD[1] + uy * L];
  const tailPath = (w0, w1) => `M${HEAD[0] + nx * w0} ${HEAD[1] + ny * w0} L${end[0] + nx * w1} ${end[1] + ny * w1} Q${end[0] + ux * 10} ${end[1] + uy * 10} ${end[0] - nx * w1} ${end[1] - ny * w1} L${HEAD[0] - nx * w0} ${HEAD[1] - ny * w0} Z`;
  // 세 겹(넓고 흐린 겉, 가운데, 가는 속심)을 흐림으로 겹쳐 빛 띠처럼
  const tg = (a0, a1) => kit.lin(bg, HEAD[0], HEAD[1], end[0], end[1], [[0, "#F2FAFF", a0], [0.3, "#CDE6FF", a0 * 0.62], [0.75, "#9CCBFF", a1], [1, "#8CC4FF", 0]], { units: "userSpaceOnUse" });
  bg.appendChild(kit.s("path", { d: tailPath(9, 34), fill: tg(0.5, 0.12), filter: kit.blurFilter(bg, 6) }));
  bg.appendChild(kit.s("path", { d: tailPath(4.5, 20), fill: tg(0.7, 0.16), filter: kit.blurFilter(bg, 3) }));
  bg.appendChild(kit.s("path", { d: tailPath(1.8, 8), fill: tg(0.95, 0.2), filter: kit.blurFilter(bg, 1.2) }));
  bg.appendChild(kit.s("circle", { cx: HEAD[0], cy: HEAD[1], r: 24, fill: kit.rad(bg, 0.5, 0.5, 0.5, [[0, "#F0F8FF", 0.85], [0.35, "#C6E3FF", 0.4], [1, "#8CC4FF", 0]]) }));

  // ── 입체: 소행성과 혜성 핵(빛은 오른쪽 앞, 꼬리와 맞게 조금 아래에서) ──
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 0, 1000], look: [0, 0, 0], env: false, key: [640, -40, 260], keyI: 3.1, fillI: 0.12, rimI: 0.0, shadows: false });
  const { THREE: T, scene } = st;
  const { mergeVertices } = await import("three/addons/utils/BufferGeometryUtils.js");
  scene.add(new T.AmbientLight(0x9fb2d8, 0.3));
  const at = (x, y) => [x - W / 2, H / 2 - y];
  const ast = new T.Mesh(
    lump(T, mergeVertices, { detail: 6, amp: 0.16, freq: 1.7, seed: 41, stretch: [1.36, 0.82, 0.96], craters: 34, base: [104, 98, 90], dark: [60, 56, 52], light: [146, 138, 126] }),
    new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }),
  );
  ast.scale.setScalar(33);
  ast.rotation.set(0.35, -0.5, 0.42);
  ast.position.set(...at(...AST), 0);
  scene.add(ast);
  const nuc = new T.Mesh(
    lump(T, mergeVertices, { detail: 5, amp: 0.1, freq: 2.2, seed: 77, stretch: [1, 0.86, 0.9], craters: 6, lobes: true, base: [100, 94, 88], dark: [56, 52, 48], light: [140, 132, 122] }),
    new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }),
  );
  nuc.scale.setScalar(12);
  nuc.rotation.set(0.3, 0.6, -0.55);
  nuc.position.set(...at(...HEAD), 0);
  scene.add(nuc);
  await kit.renderIllus(st, { radius: 6, thickness: 8, edgeK: 0.42, edgeW: 1.1, dT: 0.03 });
  await kit.frame();
  const bb = new T.Box3().setFromObject(ast), bn = new T.Box3().setFromObject(nuc);
  console.log(`placed 소행성 크기 ${(bb.max.x - bb.min.x).toFixed(1)}×${(bb.max.y - bb.min.y).toFixed(1)}px, 혜성 핵 ${(bn.max.x - bn.min.x).toFixed(1)}×${(bn.max.y - bn.min.y).toFixed(1)}px, 꼬리 방향 (${ux}, ${uy})(화면), 빛이 오는 쪽 (+0.985, +0.17)의 반대`);

  // ── 앞: 명왕성 사진, 이름 ──
  const fg = kit.layer(root, W, H);
  const cid = kit.id("pl");
  fg.defs.appendChild(kit.s("clipPath", { id: cid }, kit.s("circle", { cx: PLU[0], cy: PLU[1], r: PR })));
  const ps = PR / 530; // 사진 속 명왕성: 가운데 (622, 612), 반지름 약 536px(테두리의 검은 띠가 끼지 않게 조금 안쪽으로)
  fg.appendChild(kit.s("image", { href: "/public/photos/star/pluto.webp", x: PLU[0] - 622 * ps, y: PLU[1] - 612 * ps, width: 1280 * ps, height: 1280 * ps, "clip-path": `url(#${cid})` }));
  // 혜성 핵 위의 옅은 빛(핵은 코마 속에 있다)
  fg.appendChild(kit.s("circle", { cx: HEAD[0], cy: HEAD[1], r: 18, fill: kit.rad(fg, 0.5, 0.5, 0.5, [[0, "#E8F4FF", 0.28], [1, "#BFE0FF", 0]]) }));
  const SKY = "#0D1830";
  const dtext = (x, y, str, { size = 13, weight = 700, color = "#E6EDFF", anchor = "middle" } = {}) => {
    size = Math.max(kit.MIN_FONT, size);
    fg.appendChild(kit.s("text", { x, y, "text-anchor": anchor, "dominant-baseline": "central", "font-size": size, "font-weight": weight, fill: color,
      stroke: SKY, "stroke-width": 3.2, "stroke-linejoin": "round", "paint-order": "stroke", style: "letter-spacing:-.02em" }, str));
  };
  // 빛이 오는 쪽(오른쪽 위 구석): 왼쪽을 가리키는 화살표
  fg.appendChild(kit.s("path", { d: "M330 22 H306", stroke: "#FFD38A", "stroke-width": 1.8, "stroke-linecap": "round" }));
  fg.appendChild(kit.s("path", { d: "M300 22 L308 17.6 V26.4 Z", fill: "#FFD38A" }));
  dtext(296, 22, "햇빛", { size: 13, weight: 800, color: "#FFD38A", anchor: "end" });
  // 꼬리 이름(꼬리 가운데쯤, 위쪽)
  const tm = [HEAD[0] + ux * 56, HEAD[1] + uy * 56];
  dtext(tm[0], tm[1] - 20, "꼬리", { size: 13, weight: 800, color: "#DDEEFF" });
  // 이름과 한 줄 풀이
  dtext(59, 146, "소행성", { size: 14.5, weight: 800, color: "#FFFFFF" });
  dtext(174, 146, "혜성", { size: 14.5, weight: 800, color: "#FFFFFF" });
  dtext(285, 146, "왜소 행성", { size: 14.5, weight: 800, color: "#FFFFFF" });
  dtext(59, 165, "울퉁불퉁한 암석", { size: 13, color: "#C9D6F2" });
  dtext(174, 165, "얼음과 먼지, 꼬리", { size: 13, color: "#C9D6F2" });
  dtext(285, 165, "명왕성(사진)", { size: 13, color: "#C9D6F2" });
  dtext(W / 2, 192, "세 천체는 서로 다른 비율로 줄였어요", { size: 13, weight: 600, color: "#9FB2D6" });
}
