// 세포 그림 공용 부품(u2l2f1 동물세포, u2l9f1 핵막 비교 등). 브라우저에서 돈다.
// 약속: 세포는 윗부분을 수평으로 자른 모습(잘린 면 = 크림색 세포질), 소기관은 그 면에서 잘려 속이 보인다.
// 색은 세포 랩의 BV(세포막 앰버, 핵 보라, 마이토콘드리아 빨강, 엽록체 초록, 세포벽 갈색)를 재질로 옮긴 것.

/** 단면 질감과 재질을 만든다. */
export function cellMaterials(kit, T, renderer) {
  const mitoCap = kit.canvasTex(T, renderer, kit.canvas(560, 240, (c, w, h) => {
    const rr = h / 2, S = (pad) => { c.beginPath(); c.roundRect(pad, pad, w - pad * 2, h - pad * 2, rr - pad); };
    c.fillStyle = "#A92A1C"; S(0); c.fill();          // 바깥 막
    c.fillStyle = "#F7C0AE"; S(7); c.fill();          // 막 사이
    c.fillStyle = "#C2361F"; S(11); c.fill();         // 안쪽 막
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#FBC6B2"); g.addColorStop(1, "#F09A80");
    c.fillStyle = g; S(16); c.fill();                 // 기질
    c.save(); S(16); c.clip();
    const r = kit.rng(8);
    for (let x = 78, k = 0; x < w - 60; x += 66, k++) { // 안쪽 막이 안으로 접힌 주름
      const fromTop = k % 2 === 0, len = h * (0.5 + r() * 0.16), y0 = fromTop ? 10 : h - 10, dir = fromTop ? 1 : -1, wob = (r() - 0.5) * 16;
      c.lineCap = "round"; c.lineJoin = "round";
      c.strokeStyle = "#C2361F"; c.lineWidth = 22;
      c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + wob, y0 + dir * len * 0.5, x + wob * 0.3, y0 + dir * len); c.stroke();
      c.strokeStyle = "#F7C0AE"; c.lineWidth = 8;
      c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + wob, y0 + dir * len * 0.5, x + wob * 0.3, y0 + dir * (len - 6)); c.stroke();
    }
    c.restore();
  }));
  const nucCap = kit.canvasTex(T, renderer, kit.canvas(512, 512, (c, w, h) => {
    const g = c.createRadialGradient(w * 0.4, h * 0.45, 20, w / 2, h / 2, w * 0.6);
    g.addColorStop(0, "#B39BF2"); g.addColorStop(1, "#7656D8");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = kit.rng(12);
    c.lineCap = "round";
    for (let k = 0; k < 150; k++) { // 유전물질: 가는 실타래
      let x = r() * w, y = r() * h, a = r() * Math.PI * 2;
      c.strokeStyle = r() < 0.55 ? "rgba(72,40,160,0.55)" : "rgba(222,206,255,0.5)"; c.lineWidth = 2 + r() * 2.2;
      c.beginPath(); c.moveTo(x, y);
      for (let s2 = 0; s2 < 8; s2++) { a += (r() - 0.5) * 1.7; x += Math.cos(a) * 11; y += Math.sin(a) * 11; c.lineTo(x, y); }
      c.stroke();
    }
  }));
  const nucSurf = kit.canvasTex(T, renderer, kit.canvas(1024, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#9479EA"); g.addColorStop(1, "#6C4ECC");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = kit.rng(21);
    for (let k = 0; k < 170; k++) { // 핵공
      const x = r() * w, y = h * (0.15 + r() * 0.7), rr = 6.5 + r() * 2.5;
      c.fillStyle = "rgba(58,30,138,0.6)"; c.beginPath(); c.ellipse(x, y, rr, rr * 0.9, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "rgba(228,216,255,0.65)"; c.lineWidth = 2; c.beginPath(); c.ellipse(x - 1, y - 1, rr + 2.4, rr * 0.9 + 2.4, 0, Math.PI * 0.9, Math.PI * 1.9); c.stroke();
    }
  }));
  const cyto = kit.canvasTex(T, renderer, kit.canvas(1024, 1024, (c, w, h) => {
    const img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = kit.fbm(x / 70, y / 70, 4, 5), g = kit.noise2(x / 2.4, y / 2.4, 3);
      const v = 0.95 + (n - 0.5) * 0.07 - (g > 0.87 ? 0.04 : 0);
      const i = (y * w + x) * 4;
      img.data[i] = 252 * v; img.data[i + 1] = 238 * v; img.data[i + 2] = 205 * v; img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  }), { repeat: [0.22, 0.22] });
  return {
    mitoCap, nucCap, nucSurf, cyto,
    mito: new T.MeshPhysicalMaterial({ color: 0xdf4e36, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.22 }),
    nucShell: new T.MeshPhysicalMaterial({ map: nucSurf, roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.22, sheen: 0.3, sheenColor: 0xe6dcff }),
    cytoMat: new T.MeshPhysicalMaterial({ map: cyto, roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.35, side: T.DoubleSide }),
    mem: new T.MeshPhysicalMaterial({ color: 0xf29b2c, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.3, sheen: 0.35, sheenColor: 0xffe0a8, side: T.DoubleSide }),
    capMat: (tex) => new T.MeshStandardMaterial({ map: tex, roughness: 0.55, side: T.DoubleSide }),
  };
}

const clipAt = (T, y) => [new T.Plane(new T.Vector3(0, -1, 0), y)];

/** 캡슐(마이토콘드리아)을 cut 높이에서 자른다. 단면은 경기장 꼴에 주름 질감. */
export function cutCapsule(T, scene, M, { x, z, rotY, r, len, yc, cut }) {
  const g = new T.CapsuleGeometry(r, len, 16, 48); g.rotateZ(Math.PI / 2);
  const m = new T.Mesh(g, M.mito.clone());
  m.material.clippingPlanes = clipAt(T, cut); m.material.side = T.DoubleSide;
  m.position.set(x, yc, z); m.rotation.y = rotY; m.castShadow = true; m.receiveShadow = true; scene.add(m);
  const w = Math.sqrt(Math.max(0, r * r - (cut - yc) ** 2));
  const shape = new T.Shape();
  shape.moveTo(-len / 2, -w); shape.lineTo(len / 2, -w); shape.absarc(len / 2, 0, w, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(-len / 2, w); shape.absarc(-len / 2, 0, w, Math.PI / 2, Math.PI * 1.5, false);
  const sg = new T.ShapeGeometry(shape, 24); sg.rotateX(-Math.PI / 2);
  const p = sg.attributes.position, uv = sg.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + len / 2 + w) / (len + 2 * w), (p.getZ(i) + w) / (2 * w));
  const cm = new T.Mesh(sg, M.capMat(M.mitoCap)); cm.position.set(x, cut + 0.001, z); cm.rotation.y = rotY; cm.receiveShadow = true; scene.add(cm);
  return { top: [x, cut, z] };
}

/** 핵: 위 앞쪽 쐐기(w0~w1, +Z가 0, +X 쪽이 +, 높이 yCut 이상)를 떼어 속을 보인 공.
 *  아래쪽은 빈틈없는 360° 구로 세포질에 묻히고, 잘린 세 면(양옆 수직 부채꼴 + 바닥 수평 부채꼴)에 유전물질 질감과 두 겹 핵막을 올린다.
 *  (LatheGeometry는 프로파일이 아래→위로 올라가야 바깥 법선이 나온다. 예전 위→아래 프로파일은 앞면이 컬링돼 안쪽 면과 세포질이 비쳤다.) */
export function wedgeNucleus(kit, T, scene, M, { pos, R, w0, w1, yCut = 0 }) {
  const tCut = Math.acos(Math.max(-0.98, Math.min(0.98, yCut / R)));
  const rCut = R * Math.sin(tCut);
  const phiKeepStart = w1;
  const phiKeepLen = Math.PI * 2 - (w1 - w0);
  const group = new T.Group();
  group.position.set(...pos);

  // 구면 패치(바깥 법선 + 연속 UV) — LatheGeometry를 아래→위(t 감소)로 감아 앞면 법선을 바깥으로 보장한다.
  const makeShell = (tFrom, tTo, phiStart, phiLen, segU, segV) => {
    const pts = [];
    for (let i = 0; i <= segV; i++) {
      const t = tFrom + (tTo - tFrom) * (i / segV);
      pts.push(new T.Vector2(R * Math.sin(t), R * Math.cos(t)));
    }
    const g = new T.LatheGeometry(pts, segU, phiStart, phiLen);
    const p = g.attributes.position;
    const n = g.attributes.normal;
    const uv = g.attributes.uv;
    const v = new T.Vector3();
    for (let iu = 0; iu <= segU; iu++) {
      const phi = phiStart + (iu / segU) * phiLen;
      const uVal = (((phi % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
      for (let iv = 0; iv <= segV; iv++) {
        const k = iu * (segV + 1) + iv;
        v.fromBufferAttribute(p, k);
        const len = v.length() || 1;
        n.setXYZ(k, v.x / len, v.y / len, v.z / len);
        const t = tFrom + (tTo - tFrom) * (iv / segV);
        uv.setXY(k, uVal, 1 - t / Math.PI);
      }
    }
    n.needsUpdate = true;
    uv.needsUpdate = true;
    const mesh = new T.Mesh(g, M.nucShell);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  // 1) 아래쪽 온전한 구(남극 → yCut, 360°) + 2) 위쪽 잘린 구(yCut → 북극, 쐐기 제외)
  group.add(makeShell(Math.PI, tCut, 0, Math.PI * 2, 128, 28));
  group.add(makeShell(tCut, 0, phiKeepStart, phiKeepLen, 96, 32));

  // 3) 수직 절단면 둘(w0 왼쪽 벽, w1 오른쪽 벽) — 쐐기 안쪽(카메라 쪽)을 향하는 정확한 법선
  const capMat = M.capMat(M.nucCap);
  const makeVertWall = (phi, flipNormal) => {
    const seg = 40;
    const positions = [0, yCut, 0];
    const uvs = [0.5, 0.5];
    const s = Math.sin(phi), c = Math.cos(phi);
    for (let i = 0; i <= seg; i++) {
      const t = tCut * (1 - i / seg); // yCut(tCut) → 북극(0)
      const r = R * Math.sin(t), y = R * Math.cos(t);
      positions.push(r * s, y, r * c);
      uvs.push(0.5 + (r / R) * 0.45, 0.5 + ((y - yCut) / (R - yCut)) * 0.45);
    }
    const indices = [];
    for (let i = 1; i <= seg; i++) {
      if (flipNormal) indices.push(0, i + 1, i);
      else indices.push(0, i, i + 1);
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    g.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    const m = new T.Mesh(g, capMat);
    m.receiveShadow = true;
    return m;
  };
  // w0(왼쪽): 법선이 +phi 쪽(쐐기 안쪽), w1(오른쪽): 법선이 -phi 쪽(쐐기 안쪽)
  group.add(makeVertWall(w0, true));
  group.add(makeVertWall(w1, false));

  // 4) 수평 바닥 절단면(y = yCut, phi ∈ [w0, w1], 법선 +Y)
  {
    const seg = 48;
    const positions = [0, yCut, 0];
    const normals = [0, 1, 0];
    const uvs = [0.5, 0.5];
    for (let i = 0; i <= seg; i++) {
      const phi = w0 + (w1 - w0) * (i / seg);
      const s = Math.sin(phi), c = Math.cos(phi);
      positions.push(rCut * s, yCut, rCut * c);
      normals.push(0, 1, 0);
      uvs.push(0.5 + 0.45 * s, 0.5 + 0.45 * c);
    }
    const indices = [];
    for (let i = 1; i <= seg; i++) indices.push(0, i, i + 1);
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    g.setAttribute("normal", new T.Float32BufferAttribute(normals, 3));
    g.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);
    const floor = new T.Mesh(g, capMat);
    floor.receiveShadow = true;
    group.add(floor);
  }

  // 5) 두 겹 핵막: 잘린 세 호(왼쪽 세로, 오른쪽 세로, 바닥 가로)의 둘레에 두 줄
  const rimMat = new T.MeshStandardMaterial({ color: 0x4a2fa8, roughness: 0.48 });
  const tubeR = R * 0.017;
  const addArc = (pts) => {
    const curve = new T.CatmullRomCurve3(pts);
    const m = new T.Mesh(new T.TubeGeometry(curve, 48, tubeR, 8, false), rimMat);
    group.add(m);
  };
  for (const frac of [0.992, 0.942]) {
    // 왼쪽 세로 호(w0, 쐐기 안쪽으로 살짝 +nrm)
    const n0 = new T.Vector3(Math.cos(w0), 0, -Math.sin(w0)).multiplyScalar(0.003);
    const v0 = [];
    for (let i = 0; i <= 32; i++) {
      const t = tCut * (1 - i / 32);
      const rr = R * frac;
      v0.push(new T.Vector3(rr * Math.sin(t) * Math.sin(w0), rr * Math.cos(t), rr * Math.sin(t) * Math.cos(w0)).add(n0));
    }
    addArc(v0);
    // 오른쪽 세로 호(w1, 쐐기 안쪽으로 살짝 -nrm)
    const n1 = new T.Vector3(-Math.cos(w1), 0, Math.sin(w1)).multiplyScalar(0.003);
    const v1 = [];
    for (let i = 0; i <= 32; i++) {
      const t = tCut * (1 - i / 32);
      const rr = R * frac;
      v1.push(new T.Vector3(rr * Math.sin(t) * Math.sin(w1), rr * Math.cos(t), rr * Math.sin(t) * Math.cos(w1)).add(n1));
    }
    addArc(v1);
    // 수평 바닥 호(y = yCut, 위로 살짝 +Y)
    const vh = [];
    for (let i = 0; i <= 40; i++) {
      const phi = w0 + (w1 - w0) * (i / 40);
      const rr = rCut * frac;
      vh.push(new T.Vector3(rr * Math.sin(phi), yCut + 0.003, rr * Math.cos(phi)));
    }
    addArc(vh);
  }

  scene.add(group);
  const mid = (w0 + w1) / 2;
  return {
    group,
    inside: [pos[0] + rCut * 0.42 * Math.sin(mid), pos[1] + yCut + 0.01, pos[2] + rCut * 0.42 * Math.cos(mid)],
  };
}

/** 소기관 자리 고르기: 세포 안(볼록 다각형 safe) + 서로 gap 이상 떨어진 자리를 처음 자리 둘레에서 찾는다. 못 찾으면 멈춘다. */
export function placer(safePoly, gap = 0.05) {
  const insidePoly = (x, z) => {
    let sgn = 0;
    for (let i = 0; i < safePoly.length; i++) {
      const [x1, z1] = safePoly[i], [x2, z2] = safePoly[(i + 1) % safePoly.length];
      const cr = (x2 - x1) * (z - z1) - (z2 - z1) * (x - x1);
      if (cr !== 0) { if (sgn === 0) sgn = Math.sign(cr); else if (Math.sign(cr) !== sgn) return false; }
    }
    return true;
  };
  const outline = (shape, rotY) => {
    const pts = [];
    for (let i = 0; i < 32; i++) {
      const t = (i / 32) * Math.PI * 2;
      let lx, lz;
      if (shape.kind === "ellipse") { lx = shape.a * Math.cos(t); lz = shape.c * Math.sin(t); }
      else { lx = Math.cos(t) * shape.r + Math.sign(Math.cos(t)) * shape.len / 2; lz = Math.sin(t) * shape.r; }
      pts.push([lx * Math.cos(rotY) + lz * Math.sin(rotY), -lx * Math.sin(rotY) + lz * Math.cos(rotY)]);
    }
    return pts;
  };
  const placed = [];
  const insideShape = (o, px, pz) => {
    const dx = px - o.x, dz = pz - o.z, c = Math.cos(o.rotY), s = Math.sin(o.rotY);
    const lx = dx * c - dz * s, lz = dx * s + dz * c;
    if (o.shape.kind === "ellipse") return (lx / (o.shape.a + gap)) ** 2 + (lz / (o.shape.c + gap)) ** 2 <= 1;
    const cx = Math.max(-o.shape.len / 2, Math.min(o.shape.len / 2, lx));
    return Math.hypot(lx - cx, lz) <= o.shape.r + gap;
  };
  const fit = (x, z, rotY, shape, name) => {
    const pts = outline(shape, rotY);
    for (let k = 0; k <= 500; k++) {
      const ang = k * 2.399963, rad = 0.06 * Math.sqrt(k);
      const px = x + Math.cos(ang) * rad, pz = z + Math.sin(ang) * rad;
      const ok = pts.every(([ox, oz]) => insidePoly(px + ox, pz + oz) && placed.every((o) => !insideShape(o, px + ox, pz + oz)))
        && placed.every((o) => !outline(o.shape, o.rotY).some(([ox, oz]) => insideShape({ x: px, z: pz, rotY, shape }, o.x + ox, o.z + oz)));
      if (ok) { placed.push({ name, x: px, z: pz, rotY, shape, moved: k > 0 }); return [px, pz]; }
    }
    throw new Error(`${name}: 세포 안 빈자리를 못 찾음 (${x}, ${z})`);
  };
  return { fit, placed };
}
