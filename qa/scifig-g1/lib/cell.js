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

/** 핵: 쐐기(w0~w1, +Z가 0, +X 쪽이 +)를 떼어 속을 보인 공. 두 겹 핵막은 잘린 둘레의 두 줄. */
export function wedgeNucleus(kit, T, scene, M, { pos, R, w0, w1 }) {
  const prof = [];
  for (let i = 0; i <= 48; i++) { const t = (i / 48) * Math.PI; prof.push([R * Math.sin(t), R * Math.cos(t)]); }
  const nuc = kit.latheCut(T, prof, { phiStart: w1, phiLength: Math.PI * 2 - (w1 - w0), mat: M.nucShell, capMat: M.capMat(M.nucCap) });
  for (const cp of nuc.caps) { const uv = cp.geometry.attributes.uv, pp = cp.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pp.getX(i) / (2 * R) + 0.5, pp.getY(i) / (2 * R) + 0.5); }
  nuc.group.position.set(...pos);
  scene.add(nuc.group);
  for (const cp of nuc.caps) {
    for (const rr of [R * 0.985, R * 0.935]) {
      const arc = new T.Mesh(new T.TorusGeometry(rr, R * 0.019, 8, 96, Math.PI), new T.MeshStandardMaterial({ color: 0x4a2fa8, roughness: 0.5 }));
      arc.rotation.z = -Math.PI / 2;
      const holder = new T.Group(); holder.add(arc); holder.rotation.y = cp.rotation.y; holder.position.copy(nuc.group.position);
      const nrm = new T.Vector3(0, 0, 1).applyAxisAngle(new T.Vector3(0, 1, 0), cp.rotation.y);
      holder.position.addScaledVector(nrm, cp === nuc.caps[0] ? -0.004 : 0.004);
      scene.add(holder);
    }
  }
  const mid = (w0 + w1) / 2;
  return { inside: [pos[0] + R * 0.48 * Math.sin(mid), pos[1] + R * 0.2, pos[2] + R * 0.48 * Math.cos(mid)] };
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
