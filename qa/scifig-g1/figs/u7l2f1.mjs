// u7l2f1 · 여덟 행성을 같은 비율로 줄인 모음. 위 칸은 지구형 행성 넷, 아래 칸은 목성형 행성 넷.
// 검산 메모: u7l2f1.md. 크기는 적도 반지름(km)에 같은 배율 하나를 곱한다(목성 지름 104px). 지구형만 따로 키우지 않는다.
// 행성 겉은 그리지 않고 실사 질감(public/textures, Solar System Scope CC BY 4.0)을 공에 입혀 한 방향 빛(왼쪽 위 앞)으로 비춘다.
// 극 쪽이 눌린 정도(극 반지름 / 적도 반지름)와 자전축 기울기도 실제 값. 고리는 저마다 적도면에 있다.
export const meta = { key: "u7l2f1", w: 340, h: 344, scale: 3, quality: 88, bg: "#0B1426" };

const D2R = Math.PI / 180;
const KM = 52 / 71492; // px per km (목성 적도 반지름 71,492 km = 52px)
// 적도 반지름 km, 극/적도 비, 자전축 기울기(°)
const PL = {
  mercury: { r: 2439.7, f: 1.0, eps: 0.03, name: "수성" },
  venus: { r: 6051.8, f: 1.0, eps: 177.4, name: "금성" },
  earth: { r: 6378.1, f: 0.9966, eps: 23.4, name: "지구" },
  mars: { r: 3396.2, f: 0.9941, eps: 25.2, name: "화성" },
  jupiter: { r: 71492, f: 0.9351, eps: 3.1, name: "목성" },
  saturn: { r: 60268, f: 0.902, eps: 26.7, name: "토성" },
  uranus: { r: 25559, f: 0.9771, eps: 97.8, name: "천왕성" },
  neptune: { r: 24764, f: 0.9829, eps: 28.3, name: "해왕성" },
};

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const px = (k) => PL[k].r * KM;
  // ── 자리(화면 px) ──
  const T1 = { x: 6, y: 6, w: 328, h: 60 };          // 지구형 칸
  const T2 = { x: 6, y: 74, w: 328, h: H - 80 };     // 목성형 칸
  const COLX = 114, COLR = 276;
  const POS = {
    mercury: [128, 40], venus: [176, 40], earth: [224, 40], mars: [272, 40],
    jupiter: [COLX, 148], uranus: [COLR, 140], saturn: [COLX, 268], neptune: [COLR, 266],
  };

  // ── 바탕: 우주와 두 무리의 칸 ──
  const bg = kit.layer(root, W, H);
  bg.appendChild(kit.s("rect", { width: W, height: H, fill: kit.lin(bg, 0, 0, 0, 1, [[0, "#0A1224"], [1, "#0E1A33"]]) }));
  const rs = kit.rng(5);
  for (let i = 0; i < 140; i++) bg.appendChild(kit.s("circle", { cx: rs() * W, cy: rs() * H, r: rs() < 0.9 ? 0.4 + rs() * 0.35 : 0.8 + rs() * 0.4, fill: "#FFFFFF", opacity: 0.18 + rs() * 0.35 }));
  for (const b of [T1, T2]) bg.appendChild(kit.s("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 12, fill: "#5C7CC4", "fill-opacity": 0.13, stroke: "#8FA8E0", "stroke-opacity": 0.28, "stroke-width": 1 }));

  // ── 행성(입체) ──
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 0, 1000], look: [0, 0, 0], env: false, key: [-300, 280, 860], keyI: 2.6, fillI: 0.0, rimI: 0.0, shadows: true });
  const { THREE: T, scene, renderer, keyL } = st;
  scene.add(new T.AmbientLight(0x9fb2d8, 0.09)); // 밤 쪽이 바탕과 겨우 갈릴 만큼(빛은 거의 앞에서, 위상각 약 26°)
  keyL.shadow.mapSize.set(4096, 4096);
  keyL.shadow.radius = 1.5; keyL.shadow.bias = -0.0002; keyL.shadow.normalBias = 0.6;
  const sc = keyL.shadow.camera; sc.left = -240; sc.right = 240; sc.top = 240; sc.bottom = -240; sc.near = 50; sc.far = 2400; sc.updateProjectionMatrix();
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const tex = {};
  await Promise.all(Object.keys(PL).map(async (k) => { tex[k] = await kit.loadTex(T, `/public/textures/${k}.jpg`); tex[k].anisotropy = aniso; }));
  // 토성 고리 질감: 가로가 반지름 방향(안 1.176 R → 밖 2.327 R, 카시니 간극 1.95 R에서 맞춘 값). 원본이 어두워 밝기만 올린다.
  const ringImg = await kit.loadImg("/public/textures/saturn_ring.png");
  const ringCnv = kit.canvas(ringImg.width, ringImg.height, (c, w, h) => {
    c.drawImage(ringImg, 0, 0);
    const d = c.getImageData(0, 0, w, h);
    for (let i = 0; i < d.data.length; i += 4) { d.data[i] = Math.min(255, d.data[i] * 1.75); d.data[i + 1] = Math.min(255, d.data[i + 1] * 1.72); d.data[i + 2] = Math.min(255, d.data[i + 2] * 1.62); }
    c.putImageData(d, 0, 0);
  });
  const ringTex = kit.canvasTex(T, renderer, ringCnv);
  const at = (x, y) => [x - W / 2, H / 2 - y];
  const ringMesh = (rIn, rOut, mat) => {
    const geo = new T.RingGeometry(rIn, rOut, 256, 1);
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) { const r = Math.hypot(pos.getX(i), pos.getY(i)); uv.setXY(i, (r - rIn) / (rOut - rIn), 0.5); }
    const m = new T.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2; // 적도면(무리의 xz 면)에 눕힌다
    return m;
  };
  const faint = (color, opacity) => new T.MeshBasicMaterial({ color, transparent: true, opacity, side: T.DoubleSide, depthWrite: false });
  const report = [];
  // psi = 자전축이 화면 앞쪽으로 기운 정도(고리가 열려 보이는 각을 정한다), sgn = 화면에서 기우는 쪽, spin = 경도 돌리기
  const planet = (k, { psi = 60, sgn = 1, spin = 0, rings = [] } = {}) => {
    const p = PL[k], R = px(k), eps = p.eps * D2R, ps = psi * D2R;
    const g = new T.Group();
    const a = new T.Vector3(sgn * Math.sin(eps) * Math.cos(ps), Math.cos(eps), Math.sin(eps) * Math.sin(ps)).normalize();
    g.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), a);
    const seg = R > 12 ? [128, 96] : [48, 32];
    const m = new T.Mesh(new T.SphereGeometry(R, seg[0], seg[1]), new T.MeshStandardMaterial({ map: tex[k], roughness: 1, metalness: 0 }));
    m.scale.y = p.f; m.rotation.y = spin;
    g.add(m);
    for (const r of rings) g.add(r(R, m));
    const [x, y] = at(...POS[k]);
    g.position.set(x, y, 0);
    scene.add(g);
    const B = Math.asin(Math.abs(a.z)) / D2R; // 고리가 열려 보이는 각
    report.push(`${p.name} 반지름 ${R.toFixed(2)}px 고리 열림 ${B.toFixed(1)}°`);
    return { g, m, R };
  };
  for (const k of ["mercury", "venus", "earth", "mars"]) planet(k, { psi: 40, spin: k === "earth" ? 2.2 : 0.6 });
  // 목성: 주 고리 1.72~1.81 R(축이 3°만 기울어 거의 옆면, 가는 선)
  planet("jupiter", { psi: 60, sgn: 1, spin: -1.03, rings: [(R) => ringMesh(1.72 * R, 1.81 * R, faint(0xc8b298, 0.55))] });
  // 토성: 질감 고리. 토성 몸이 고리에 그림자를 드리운다(고리 그림자는 몸을 잘린 것처럼 보이게 해 넣지 않는다)
  const sat = planet("saturn", {
    psi: 68, sgn: 1, spin: 0.4, rings: [(R) => {
      const mat = new T.MeshLambertMaterial({ map: ringTex, transparent: true, side: T.DoubleSide, depthWrite: false });
      const m = ringMesh(1.176 * R, 2.327 * R, mat);
      m.castShadow = false; m.receiveShadow = true;
      m.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: ringTex, alphaTest: 0.4 });
      return m;
    }],
  });
  sat.m.castShadow = true; sat.m.receiveShadow = false;
  // 천왕성: ε 고리 1.95~2.0 R과 안쪽 고리들(아주 옅게). 축이 98° 기울어 고리가 서 있다
  planet("uranus", { psi: 18, sgn: 1, spin: 0, rings: [(R) => ringMesh(1.95 * R, 2.0 * R, faint(0xb6c3d2, 0.6)), (R) => ringMesh(1.64 * R, 1.86 * R, faint(0xa6b4c6, 0.16))] });
  // 해왕성: 애덤스 고리 2.52~2.56 R, 르베리에 고리 2.13~2.17 R
  planet("neptune", { psi: 62, sgn: -1, spin: 0, rings: [(R) => ringMesh(2.52 * R, 2.56 * R, faint(0xaab8d2, 0.5)), (R) => ringMesh(2.13 * R, 2.17 * R, faint(0xaab8d2, 0.38))] });
  st.render();
  await kit.frame();
  console.log("placed " + report.join(" | "));

  // ── 이름 ──
  const fg = kit.layer(root, W, H);
  const SKY = "#0C1730";
  const dtext = (x, y, str, { size = 12.5, weight = 700, color = "#E6EDFF", anchor = "middle" } = {}) => {
    size = Math.max(kit.MIN_FONT, size);
    const t = kit.s("text", { x, y, "text-anchor": anchor, "dominant-baseline": "central", "font-size": size, "font-weight": weight, fill: color,
      stroke: SKY, "stroke-width": 3.2, "stroke-linejoin": "round", "paint-order": "stroke", style: "letter-spacing:-.02em" }, str);
    fg.appendChild(t);
  };
  dtext(T1.x + 12, T1.y + 30, "지구형 행성", { size: 13.5, weight: 800, color: "#FFFFFF", anchor: "start" });
  dtext(T2.x + 12, T2.y + 16, "목성형 행성", { size: 13.5, weight: 800, color: "#FFFFFF", anchor: "start" });
  for (const k of ["mercury", "venus", "earth", "mars"]) dtext(POS[k][0], POS[k][1] + 15, PL[k].name, { size: 12.5 });
  dtext(POS.jupiter[0], POS.jupiter[1] + px("jupiter") * PL.jupiter.f + 12, "목성");
  dtext(POS.saturn[0], POS.saturn[1] + px("saturn") * 2.327 * 0.43 + 14, "토성");
  dtext(POS.uranus[0], POS.uranus[1] + px("uranus") * 2.0 + 12, "천왕성");
  dtext(POS.neptune[0], POS.neptune[1] + 32, "해왕성");
  // 희미한 고리: 천왕성의 선 고리와 목성의 가는 고리를 함께 가리킨다
  const lx = 214, ly = 90;
  dtext(lx, ly, "희미한 고리", { size: 12, weight: 700, color: "#C9D6F2" });
  const lead = (x2, y2) => fg.appendChild(kit.s("path", { d: `M${lx} ${ly + 8} L${x2} ${y2}`, stroke: "#AFC0E2", "stroke-width": 0.9, fill: "none", opacity: 0.9 }));
  lead(POS.uranus[0] - 6, POS.uranus[1] - px("uranus") * 2.0 + 3);
  lead(POS.jupiter[0] + px("jupiter") * 1.77, POS.jupiter[1] - 2);
}
