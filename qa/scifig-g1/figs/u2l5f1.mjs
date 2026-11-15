// u2l5f1 · 식물의 조직계: 잎 한 조각을 잘라 본 입체 모형(표피 조직계, 기본 조직계).
// 검산 메모: u2l5f1.md (같은 폴더). 그림만 고칠 때도 메모의 사실 목록과 어긋나지 않는지 본다.
export const meta = {
  key: "u2l5f1", w: 340, h: 186, scale: 3, quality: 86,
};

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const st = await kit.three(root, {
    w: W, h: H, fov: 17.42, pos: [2.38, 4.82, 15.93], look: [0.42, 0.93, 0], envIntensity: 0.42, key: [-5, 10, 7], keyI: 1.75, fillI: 0.85, rimI: 0.45,
  });
  const { THREE: T, scene, renderer } = st;
  const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
  const { mergeGeometries } = await import("three/addons/utils/BufferGeometryUtils.js");
  const R = kit.rng(11);

  // ── 크기(월드 단위). 잎 두께 방향이 y. ──
  const X0 = -2.2, X1 = 2.2, Z0 = -1.45, Z1 = 1.45;
  const LE = [0.0, 0.26], SP = [0.3, 1.2], PA = [1.24, 2.2], UE = [2.24, 2.5];

  // ── 질감 ──
  // 엽록체: 세포벽 안쪽에 붙은 납작한 초록 알갱이. 위쪽 왼편이 밝은 작은 렌즈로 칠한다.
  function chlTex({ base, rim, chl, n, nucleus, sy = 1, seed }) {
    const r = kit.rng(seed);
    const cnv = kit.canvas(256, 256, (c, w, h) => {
      const g = c.createRadialGradient(w * 0.42, h * 0.38, 10, w * 0.5, h * 0.5, w * 0.72);
      g.addColorStop(0, base[0]); g.addColorStop(0.7, base[1]); g.addColorStop(1, rim);
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      // 세포질의 옅은 결
      const img = c.getImageData(0, 0, w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const v = (kit.fbm(x / 18, y / 18, 3, seed) - 0.5) * 18;
        const i = (y * w + x) * 4; img.data[i] += v; img.data[i + 1] += v; img.data[i + 2] += v * 0.6;
      }
      c.putImageData(img, 0, 0);
      if (nucleus) {
        const nx = w * (0.35 + r() * 0.3), ny = h * (0.42 + r() * 0.16), rx = w * (sy < 1 ? 0.17 : 0.09), ry = rx * sy * (sy < 1 ? 1.1 : 1.6);
        const ng = c.createRadialGradient(nx - rx * 0.3, ny - ry * 0.35, 1, nx, ny, rx * 1.05);
        ng.addColorStop(0, "#C9A0E0"); ng.addColorStop(0.55, "#9661B8"); ng.addColorStop(1, "#6E3F92");
        c.fillStyle = ng; c.beginPath(); c.ellipse(nx, ny, rx, ry, 0, 0, Math.PI * 2); c.fill();
      }
      for (let k = 0; k < n; k++) {
        const x = w * (0.08 + r() * 0.84), y = h * (0.08 + r() * 0.84);
        const rx = w * (0.105 + r() * 0.02), ry = rx * (0.6 + r() * 0.14) * sy, a = (r() - 0.5) * 0.5;
        const cg = c.createRadialGradient(x - rx * 0.35, y - ry * 0.4, 0.5, x, y, Math.max(rx, ry));
        cg.addColorStop(0, chl[0]); cg.addColorStop(0.6, chl[1]); cg.addColorStop(1, chl[2]);
        c.fillStyle = cg; c.beginPath(); c.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); c.fill();
      }
    });
    return kit.canvasTex(T, renderer, cnv);
  }
  const PAL = { base: ["#B3E08A", "#93CF66"], rim: "#71B24A", chl: ["#86D05C", "#3E9A2C", "#25701D"] };
  const SPO = { base: ["#92CB66", "#76B84C"], rim: "#579937", chl: ["#78C24F", "#357F26", "#23601A"] };
  const cellMat = (tex, extra = {}) => new T.MeshPhysicalMaterial({ map: tex, roughness: 0.5, clearcoat: 0.18, clearcoatRoughness: 0.4, sheen: 0.12, sheenRoughness: 0.5, sheenColor: 0xe9ffd6, ...extra });

  // ── 울타리 조직: 길쭉한 기둥 세포가 촘촘히 ──
  // 핵은 세포마다 하나: 앞(+Z) 면의 질감에만 그린다(상자 여섯 면이 같은 질감이면 앞면과 옆면에 핵이 둘로 보인다).
  // RoundedBoxGeometry 는 BoxGeometry 의 면 묶음(px, nx, py, ny, pz, nz)을 그대로 가진다.
  const palMats = [0, 1, 2, 3].map((i) => {
    const side = cellMat(chlTex({ ...PAL, n: 13, nucleus: false, sy: 0.33, seed: 20 + i }));
    const front = cellMat(chlTex({ ...PAL, n: 12, nucleus: i !== 3, sy: 0.33, seed: 60 + i }));
    return [side, side, side, side, front, side];
  });
  const palGeo = new RoundedBoxGeometry(0.31, 0.88, 0.31, 4, 0.13);
  const palList = [[], [], [], []];
  const dx = 0.335, dz = 0.335;
  let row = 0;
  for (let z = Z1 - 0.16; z > Z0 + 0.1; z -= dz, row++) {
    for (let x = X0 + 0.16 + (row % 2 ? dx / 2 : 0); x < X1 - 0.12; x += dx) {
      const m = new T.Matrix4();
      const h = 1 + (R() - 0.5) * 0.06;
      const q = new T.Quaternion().setFromEuler(new T.Euler((R() - 0.5) * 0.05, (R() - 0.5) * 0.3, (R() - 0.5) * 0.05));
      m.compose(new T.Vector3(x + (R() - 0.5) * 0.02, (PA[0] + PA[1]) / 2 + (R() - 0.5) * 0.02, z + (R() - 0.5) * 0.02), q, new T.Vector3(1, h, 1));
      palList[Math.floor(R() * 4)].push(m);
    }
  }
  palList.forEach((list, i) => {
    const im = new T.InstancedMesh(palGeo, palMats[i], list.length);
    list.forEach((m, j) => im.setMatrixAt(j, m));
    im.castShadow = true; im.receiveShadow = true; scene.add(im);
  });

  // ── 해면 조직: 모양이 고르지 않은 세포가 듬성듬성(사이에 빈틈) ──
  const blobGeo = (seed) => {
    const g = new T.SphereGeometry(0.2, 28, 20);
    const p = g.attributes.position, v = new T.Vector3();
    const s = [1.0 + kit.rng(seed)() * 0.5, 0.78, 0.9];
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = kit.fbm(v.x * 6 + seed, v.y * 6 + v.z * 4, 3, seed) - 0.5;
      v.multiplyScalar(1 + n * 0.55);
      p.setXYZ(i, v.x * s[0], v.y * s[1], v.z * s[2]);
    }
    g.computeVertexNormals();
    return g;
  };
  const spoGeos = [1, 2, 3, 4, 5, 6].map(blobGeo);
  const spoMats = [0, 1, 2].map((i) => cellMat(chlTex({ ...SPO, n: 11, nucleus: i === 0, sy: 1, seed: 40 + i })));
  const spoPts = [];
  const sr = kit.rng(5);
  for (let t = 0; t < 9000 && spoPts.length < 300; t++) {
    const p = [X0 + 0.3 + sr() * (X1 - X0 - 0.6), SP[0] + 0.2 + sr() * (SP[1] - SP[0] - 0.4), Z0 + 0.3 + sr() * (Z1 - Z0 - 0.6)];
    if (spoPts.every((q) => (q[0] - p[0]) ** 2 + ((q[1] - p[1]) * 1.25) ** 2 + (q[2] - p[2]) ** 2 > 0.4 * 0.4)) spoPts.push(p);
  }
  const spoList = spoGeos.map(() => spoMats.map(() => []));
  for (const p of spoPts) {
    const m = new T.Matrix4();
    const q = new T.Quaternion().setFromEuler(new T.Euler((sr() - 0.5) * 0.6, sr() * Math.PI * 2, (sr() - 0.5) * 0.6));
    const k = 0.95 + sr() * 0.2;
    m.compose(new T.Vector3(...p), q, new T.Vector3(k, k, k));
    spoList[Math.floor(sr() * spoGeos.length)][Math.floor(sr() * spoMats.length)].push(m);
  }
  spoList.forEach((byMat, gi) => byMat.forEach((list, mi) => {
    if (!list.length) return;
    const im = new T.InstancedMesh(spoGeos[gi], spoMats[mi], list.length);
    list.forEach((m, j) => im.setMatrixAt(j, m));
    im.castShadow = true; im.receiveShadow = true; scene.add(im);
  }));

  // ── 표피 조직: 납작하고 투명에 가까운 세포 한 겹(위, 아래). 윗면은 다각형 무늬 ──
  function epidermis(y0, y1, seed, mat) {
    const pts = kit.scatter(X0, Z0, X1, Z1, 0.5, seed, 6000);
    const cells = kit.voronoi(pts, X0, Z0, X1, Z1);
    const geos = [];
    for (const poly of cells) {
      if (poly.length < 3) continue;
      const ins = kit.inset(poly, 0.1);
      const shape = new T.Shape(ins.map(([x, z]) => new T.Vector2(x, -z)));
      const th = Math.max(0.02, y1 - y0 - 0.15);
      const g = new T.ExtrudeGeometry(shape, { depth: th, bevelEnabled: true, bevelThickness: 0.075, bevelSize: 0.085, bevelSegments: 6, curveSegments: 4 });
      g.rotateX(-Math.PI / 2);
      g.translate(0, y0 + 0.075, 0);
      geos.push(g);
    }
    const mesh = new T.Mesh(mergeGeometries(geos), mat);
    mesh.castShadow = true; mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }
  const epiMat = new T.MeshPhysicalMaterial({ color: 0xd3ecc4, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.25, sheen: 0.6, sheenColor: 0xffffff, sheenRoughness: 0.35, transmission: 0.55, thickness: 0.25, ior: 1.35, attenuationColor: 0xb9e09a, attenuationDistance: 0.8 });
  epidermis(UE[0], UE[1], 7, epiMat);
  epidermis(LE[0], LE[1], 9, epiMat.clone());

  kit.shadowCatcher(T, scene, { y: -0.01, opacity: 0.16 });
  await kit.renderIllus(st, { radius: 0.35, thickness: 0.8, edgeK: 0.42, edgeW: 1.2 });
  await kit.frame();

  // ── 라벨: 왼쪽은 조직계(무리), 오른쪽은 조직(층) ──
  const svg = kit.layer(root, W, H);
  const P = (x, y, z) => st.project([x, y, z]);
  const mid = (a) => (a[0] + a[1]) / 2;
  const fl = (y) => P(X0, y, Z1); // 앞면 왼쪽 모서리
  const fr = (y) => P(X1, y, Z1); // 앞면 오른쪽 모서리
  const rightX = Math.max(P(X1, UE[1], Z0)[0], P(X1, LE[0], Z0)[0], fr(UE[1])[0]) + 8;
  // 오른쪽: 층 이름
  const rows = [
    { y: mid(UE), t: "표피 조직" }, { y: mid(PA), t: "울타리 조직" }, { y: mid(SP), t: "해면 조직" }, { y: mid(LE), t: "표피 조직" },
  ];
  for (const r of rows) {
    const a = P(X1 - 0.32, r.y, Z1);
    const b = fr(r.y);
    kit.label(svg, { at: a, via: [rightX - 2, b[1] + (a[1] - b[1]) * 0], to: [rightX + 4, b[1]], text: r.t, side: "r", size: 13 });
  }
  // 왼쪽: 조직계. 기본 조직계는 두 층을 묶는 꺾쇠, 표피 조직계는 위아래 표피에 하나씩
  const lx = Math.min(fl(PA[1])[0], fl(SP[0])[0]) - 7;
  const yTop = fl(PA[1] - 0.02)[1], yBot = fl(SP[0] + 0.02)[1];
  const br = kit.s("path", { d: `M${lx + 5} ${yTop} H${lx} V${yBot} H${lx + 5}`, fill: "none", stroke: kit.LEAD, "stroke-width": 1.1, "stroke-linejoin": "round" });
  svg.appendChild(br);
  const bm = (yTop + yBot) / 2;
  svg.appendChild(kit.s("path", { d: `M${lx} ${bm} H${lx - 5}`, stroke: kit.LEAD, "stroke-width": 1.1 }));
  kit.text(svg, lx - 8, bm - 8.5, "기본", { size: 13, anchor: "end", color: "#2F7A22" });
  kit.text(svg, lx - 8, bm + 8.5, "조직계", { size: 13, anchor: "end", color: "#2F7A22" });
  const ue = P(X0 + 0.3, mid(UE), Z1), le = P(X0 + 0.3, mid(LE), Z1);
  const EPI = "#2C6E8C";
  for (const [a, dy] of [[ue, -15], [le, 15]]) {
    const ty = a[1] + dy;
    kit.label(svg, { at: a, via: [lx, ty], to: [lx - 4, ty], text: "", side: "l", size: 13 });
    kit.text(svg, lx - 8, ty - 8.5, "표피", { size: 13, anchor: "end", color: EPI });
    kit.text(svg, lx - 8, ty + 8.5, "조직계", { size: 13, anchor: "end", color: EPI });
  }
  console.log("proj", JSON.stringify({ rightX, lx, ue, le, tl: P(X0, UE[1], Z0), bl: P(X0, 0, Z1), br: P(X1, 0, Z1), trb: P(X1, UE[1], Z0) }.valueOf()));
}
