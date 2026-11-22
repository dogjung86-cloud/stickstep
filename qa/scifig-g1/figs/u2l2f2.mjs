// u2l2f2 · 식물세포의 구조: 육각기둥 세포의 윗부분을 수평으로 잘라 속을 보인 입체 단면.
// 검산 메모: u2l2f2.md. 색은 세포 랩의 BV(세포막 앰버, 핵 보라, 마이토콘드리아 빨강, 엽록체 초록, 세포벽 갈색)를 명암 있는 재질로 옮긴다.
// 표현 관례(세포 단면 도해의 흔한 약속): 잘린 면(세포질)은 크림색 평면, 엽록체와 마이토콘드리아는 그 면에서 잘려 속(그라나, 주름)이 보이고,
// 핵은 위 앞쪽 쐐기를 떼어 속을 보인다. 엽록체 하나는 위 절반을 걷어 입체 그라나를 보인다. 세포벽 앞쪽에 홈을 파서 벽 바로 안쪽의 세포막을 드러낸다.
import { wedgeNucleus } from "../lib/cell.js";

export const meta = { key: "u2l2f2", w: 340, h: 276, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const st = await kit.three(root, { w: W, h: H, fov: 21.2, pos: [1.0, 9.0, 10.6], look: [0.05, 0.2, 0.3], envIntensity: 0.5, key: [-5, 11, 6], keyI: 1.65, fillI: 0.85, rimI: 0.35 });
  const { THREE: T, scene, renderer } = st;

  // ── 육각형(랩의 P_HEX를 월드 단위로, z가 앞쪽) ──
  const HEX = [[112, 36], [246, 36], [296, 118], [246, 200], [112, 200], [62, 118]].map(([x, y]) => [(x - 179) / 52, (y - 118) / 52]);
  const offset = (poly, d) => {
    const n = poly.length;
    let area = 0;
    for (let i = 0; i < n; i++) { const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % n]; area += x1 * y2 - x2 * y1; }
    const sgn = area > 0 ? 1 : -1;
    const lines = poly.map(([x1, y1], i) => {
      const [x2, y2] = poly[(i + 1) % n], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
      return [x1 - (dy / L) * sgn * d, y1 + (dx / L) * sgn * d, dx, dy];
    });
    return lines.map((a, i) => {
      const b = lines[(i + n - 1) % n];
      const det = b[2] * a[3] - b[3] * a[2];
      const t = ((a[0] - b[0]) * b[3] - (a[1] - b[1]) * b[2]) / det;
      return [a[0] + a[2] * t, a[1] + a[3] * t];
    });
  };
  const TW = 0.2, TM = 0.055; // 세포벽, 세포막 두께(보이게 과장. 실제 막은 벽보다 훨씬 얇다)
  const hexIn = offset(HEX, TW), hexMem = offset(HEX, TW + TM);
  const YC = 1.0; // 자른 높이(세포 바닥 y=0)
  const toShape = (poly) => new T.Shape(poly.map(([x, z]) => new T.Vector2(x, -z)));
  const prism = (shape, y0, y1, mat) => {
    const g = new T.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments: 8 });
    g.rotateX(-Math.PI / 2); g.translate(0, y0, 0);
    const m = new T.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    return m;
  };

  // ── 질감 ──
  const wallCnv = kit.canvas(512, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#B48E70"); g.addColorStop(1, "#A07B5F");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = kit.rng(9);
    const fib = [];
    for (let k = 0; k < 700; k++) fib.push([r() * w, r() * h, (r() < 0.5 ? 0.42 : -0.42) + (r() - 0.5) * 0.22, 24 + r() * 70, r() < 0.5, 0.7 + r() * 1.1]);
    for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) for (const [x, y, a, L, light, lw] of fib) {
      c.strokeStyle = light ? "rgba(255,238,220,0.10)" : "rgba(80,48,30,0.09)"; c.lineWidth = lw;
      c.beginPath(); c.moveTo(x + ox, y + oy); c.lineTo(x + ox + Math.cos(a) * L, y + oy + Math.sin(a) * L); c.stroke();
    }
  });
  const wallTex = kit.canvasTex(T, renderer, wallCnv, { repeat: [0.7, 0.7] });
  const cytoTex = kit.canvasTex(T, renderer, kit.canvas(1024, 1024, (c, w, h) => {
    const img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = kit.fbm(x / 70, y / 70, 4, 5), g = kit.noise2(x / 2.4, y / 2.4, 3);
      const v = 0.95 + (n - 0.5) * 0.07 - (g > 0.87 ? 0.04 : 0);
      const i = (y * w + x) * 4;
      img.data[i] = 252 * v; img.data[i + 1] = 238 * v; img.data[i + 2] = 205 * v; img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  }), { repeat: [0.22, 0.22] });

  const wallMat = new T.MeshPhysicalMaterial({ map: wallTex, roughness: 0.75, sheen: 0.25, sheenColor: 0xffe2c4 });
  const memMat = new T.MeshPhysicalMaterial({ color: 0xf29b2c, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.3, sheen: 0.35, sheenColor: 0xffe0a8 });
  const cytoMat = new T.MeshPhysicalMaterial({ map: cytoTex, roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.35 });

  // ── 세포벽: 아래는 고리 전체, 위쪽 띠는 앞변에 홈(벽 바로 안쪽의 세포막이 드러난다) ──
  const NOTCH_D = 0.42, NX0 = -0.62, NX1 = 0.02; // 앞변(z>0) 위 홈의 x 범위
  // 벽 둘레에 가로 이음매가 생기지 않게: 홈 자리만 뺀 C자 벽을 바닥부터 끝까지 한 덩어리로 세우고,
  // 홈 아래만 작은 조각으로 채운다(조각은 양옆으로 조금 겹쳐 세로 이음매도 보이지 않게).
  const zFrontO = HEX[3][1], zFrontI = hexIn[3][1];
  const cOuter = [[NX1, zFrontO], HEX[3], HEX[2], HEX[1], HEX[0], HEX[5], HEX[4], [NX0, zFrontO]];
  const cInner = [[NX0, zFrontI], hexIn[4], hexIn[5], hexIn[0], hexIn[1], hexIn[2], hexIn[3], [NX1, zFrontI]];
  prism(toShape([...cOuter, ...cInner]), 0, YC, wallMat);
  prism(toShape([[NX0 - 0.02, zFrontO], [NX1 + 0.02, zFrontO], [NX1 + 0.02, zFrontI], [NX0 - 0.02, zFrontI]]), 0, YC - NOTCH_D, wallMat);
  // 세포막: 벽 안쪽에 붙은 얇은 띠(위까지)
  const memRing = toShape(hexIn); memRing.holes.push(new T.Path(hexMem.map(([x, z]) => new T.Vector2(x, -z))));
  prism(memRing, 0.03, YC - 0.004, memMat);
  // 세포질(잘린 면)
  prism(toShape(hexMem), 0.05, YC - 0.012, cytoMat);

  // ── 세포 소기관 ──
  const CUT = YC + 0.04; // 소기관을 자르는 높이(세포질 면보다 조금 위: 잘린 둘레가 살짝 솟아 보인다)
  const clipAt = (y) => [new T.Plane(new T.Vector3(0, -1, 0), y)];
  const capMat = (tex) => new T.MeshStandardMaterial({ map: tex, roughness: 0.55, side: T.DoubleSide });

  // 엽록체 단면: 두 겹 막, 연두 바탕(스트로마), 옆에서 본 동전 더미(그라나)와 그 사이를 잇는 얇은 판
  const chlCap = kit.canvasTex(T, renderer, kit.canvas(640, 400, (c, w, h) => {
    const cx = w / 2, cy = h / 2, E = (pad) => { c.beginPath(); c.ellipse(cx, cy, w / 2 - pad, h / 2 - pad, 0, 0, Math.PI * 2); };
    c.fillStyle = "#2F7E25"; E(0); c.fill();
    c.fillStyle = "#A9DC80"; E(8); c.fill();
    c.fillStyle = "#3A8C2C"; E(12); c.fill();
    const sg = c.createRadialGradient(cx - 60, cy - 50, 10, cx, cy, w / 2);
    sg.addColorStop(0, "#D6F0B4"); sg.addColorStop(1, "#9FD176");
    c.fillStyle = sg; E(17); c.fill();
    c.save(); E(20); c.clip();
    const r = kit.rng(4);
    const grana = [[-190, 0], [-100, -58], [-95, 60], [0, 0], [100, -58], [100, 60], [190, 0]];
    c.strokeStyle = "#4C9E37"; c.lineWidth = 7; c.lineCap = "round";
    for (let i = 0; i < grana.length - 1; i++) { const [x1, y1] = grana[i], [x2, y2] = grana[i + 1]; c.beginPath(); c.moveTo(cx + x1, cy + y1); c.lineTo(cx + x2, cy + y2); c.stroke(); }
    for (const [gx, gy] of grana) {
      const n = 5 + Math.floor(r() * 2), dw = 78 + r() * 10, dh = 12, gap = 3, top = cy + gy - (n * (dh + gap)) / 2;
      for (let k = 0; k < n; k++) {
        const y = top + k * (dh + gap);
        const g = c.createLinearGradient(0, y, 0, y + dh); g.addColorStop(0, "#6CC24F"); g.addColorStop(0.55, "#2F8A24"); g.addColorStop(1, "#1C5E16");
        c.fillStyle = g; c.beginPath(); c.roundRect(cx + gx - dw / 2, y, dw, dh, 4); c.fill();
      }
    }
    c.restore();
  }));
  // 마이토콘드리아 단면: 바깥 막, 막 사이, 안쪽 막이 안으로 접힌 주름(크리스타), 속(기질)
  const mitoCap = kit.canvasTex(T, renderer, kit.canvas(560, 240, (c, w, h) => {
    const rr = h / 2, S = (pad) => { c.beginPath(); c.roundRect(pad, pad, w - pad * 2, h - pad * 2, rr - pad); };
    c.fillStyle = "#A92A1C"; S(0); c.fill();
    c.fillStyle = "#F7C0AE"; S(7); c.fill();
    c.fillStyle = "#C2361F"; S(11); c.fill();
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#FBC6B2"); g.addColorStop(1, "#F09A80");
    c.fillStyle = g; S(16); c.fill();
    c.save(); S(16); c.clip();
    const r = kit.rng(8);
    for (let x = 78, k = 0; x < w - 60; x += 66, k++) {
      const fromTop = k % 2 === 0, len = h * (0.5 + r() * 0.16), y0 = fromTop ? 10 : h - 10, dir = fromTop ? 1 : -1, wob = (r() - 0.5) * 16;
      c.lineCap = "round"; c.lineJoin = "round";
      c.strokeStyle = "#C2361F"; c.lineWidth = 22;
      c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + wob, y0 + dir * len * 0.5, x + wob * 0.3, y0 + dir * len); c.stroke();
      c.strokeStyle = "#F7C0AE"; c.lineWidth = 8;
      c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + wob, y0 + dir * len * 0.5, x + wob * 0.3, y0 + dir * (len - 6)); c.stroke();
    }
    c.restore();
  }));
  // 핵 단면: 보라 바탕에 가는 실타래(유전물질)
  const nucCap = kit.canvasTex(T, renderer, kit.canvas(512, 512, (c, w, h) => {
    const g = c.createRadialGradient(w * 0.4, h * 0.45, 20, w / 2, h / 2, w * 0.6);
    g.addColorStop(0, "#B39BF2"); g.addColorStop(1, "#7656D8");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = kit.rng(12);
    c.lineCap = "round";
    for (let k = 0; k < 150; k++) {
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
    for (let k = 0; k < 170; k++) { // 핵공: 핵막의 작은 구멍
      const x = r() * w, y = h * (0.15 + r() * 0.7), rr = 6.5 + r() * 2.5;
      c.fillStyle = "rgba(58,30,138,0.6)"; c.beginPath(); c.ellipse(x, y, rr, rr * 0.9, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "rgba(228,216,255,0.65)"; c.lineWidth = 2; c.beginPath(); c.ellipse(x - 1, y - 1, rr + 2.4, rr * 0.9 + 2.4, 0, Math.PI * 0.9, Math.PI * 1.9); c.stroke();
    }
  }));
  const chlSurf = kit.canvasTex(T, renderer, kit.canvas(512, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#63BA49"); g.addColorStop(1, "#3E9530");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = kit.rng(31);
    for (let k = 0; k < 60; k++) { const x = r() * w, y = h * (0.2 + r() * 0.6); c.fillStyle = "rgba(30,90,22,0.25)"; c.beginPath(); c.ellipse(x, y, 9, 6, 0, 0, Math.PI * 2); c.fill(); }
  }));

  const chlMat = new T.MeshPhysicalMaterial({ map: chlSurf, roughness: 0.35, clearcoat: 0.75, clearcoatRoughness: 0.18, sheen: 0.3, sheenColor: 0xdcffc8 });
  const mitoMat = new T.MeshPhysicalMaterial({ color: 0xdf4e36, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.22 });
  const nucShellMat = new T.MeshPhysicalMaterial({ map: nucSurf, roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.22, sheen: 0.3, sheenColor: 0xe6dcff });

  // 납작한 타원체(엽록체)를 CUT 높이에서 잘라 아래만 남기고 잘린 면에 단면 질감을 덮는다.
  function cutEllipsoid({ x, z, rotY, a, b, c, yc, mat, cap }) {
    const g = new T.SphereGeometry(1, 64, 40); g.scale(a, b, c);
    const m = new T.Mesh(g, mat.clone());
    m.material.clippingPlanes = clipAt(CUT); m.material.side = T.DoubleSide;
    m.position.set(x, yc, z); m.rotation.y = rotY; m.castShadow = true; m.receiveShadow = true; scene.add(m);
    const k = Math.sqrt(Math.max(0, 1 - ((CUT - yc) / b) ** 2));
    const cg = new T.CircleGeometry(1, 64); cg.rotateX(-Math.PI / 2); cg.scale(a * k, 1, c * k);
    const cm = new T.Mesh(cg, capMat(cap)); cm.position.set(x, CUT + 0.001, z); cm.rotation.y = rotY; cm.receiveShadow = true; scene.add(cm);
    return { top: [x, CUT, z] };
  }
  // 캡슐(마이토콘드리아)을 같은 높이에서 자른다(단면은 경기장 꼴)
  function cutCapsule({ x, z, rotY, r, len, yc, mat, cap }) {
    const g = new T.CapsuleGeometry(r, len, 16, 48); g.rotateZ(Math.PI / 2);
    const m = new T.Mesh(g, mat.clone());
    m.material.clippingPlanes = clipAt(CUT); m.material.side = T.DoubleSide;
    m.position.set(x, yc, z); m.rotation.y = rotY; m.castShadow = true; m.receiveShadow = true; scene.add(m);
    const w = Math.sqrt(Math.max(0, r * r - (CUT - yc) ** 2));
    const shape = new T.Shape();
    shape.moveTo(-len / 2, -w); shape.lineTo(len / 2, -w); shape.absarc(len / 2, 0, w, -Math.PI / 2, Math.PI / 2, false);
    shape.lineTo(-len / 2, w); shape.absarc(-len / 2, 0, w, Math.PI / 2, Math.PI * 1.5, false);
    const sg = new T.ShapeGeometry(shape, 24); sg.rotateX(-Math.PI / 2);
    const p = sg.attributes.position, uv = sg.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + len / 2 + w) / (len + 2 * w), (p.getZ(i) + w) / (2 * w));
    const cm = new T.Mesh(sg, capMat(cap)); cm.position.set(x, CUT + 0.001, z); cm.rotation.y = rotY; cm.receiveShadow = true; scene.add(cm);
    return { top: [x, CUT, z] };
  }
  // 열어 본 엽록체: 위 절반을 걷어 낸 그릇 속에 입체 그라나(동전 더미)와 그 사이를 잇는 얇은 판
  function openChloroplast({ x, z, rotY, a, b, c }) {
    const yc = YC + 0.06, rim = yc;
    const g = new T.Group(); g.position.set(x, yc, z); g.rotation.y = rotY; scene.add(g);
    const shellG = new T.SphereGeometry(1, 64, 40); shellG.scale(a, b, c);
    const sm = chlMat.clone(); sm.side = T.DoubleSide; sm.clippingPlanes = clipAt(rim);
    const shell = new T.Mesh(shellG, sm); shell.castShadow = true; shell.receiveShadow = true; g.add(shell);
    // 안쪽 막(조금 작은 껍질, 잘린 둘레에서 두 겹으로 보인다)
    const innerG = new T.SphereGeometry(1, 64, 40); innerG.scale(a * 0.9, b * 0.84, c * 0.88);
    g.add(new T.Mesh(innerG, new T.MeshPhysicalMaterial({ color: 0x8fcc63, roughness: 0.5, side: T.DoubleSide, clippingPlanes: clipAt(rim) })));
    // 스트로마 바닥(그릇 속 면)
    const floorY = -b * 0.18;
    const kf = Math.sqrt(1 - (floorY / (b * 0.84)) ** 2);
    const fl = new T.Mesh(new T.CircleGeometry(1, 64), new T.MeshStandardMaterial({ color: 0xc4e7a0, roughness: 0.7 }));
    fl.geometry.rotateX(-Math.PI / 2); fl.geometry.scale(a * 0.9 * kf, 1, c * 0.88 * kf); fl.position.y = floorY; fl.receiveShadow = true; g.add(fl);
    // 그라나: 납작한 원판 5~7장을 쌓은 더미
    const discG = new T.CylinderGeometry(0.046, 0.046, 0.013, 32);
    const discM = new T.MeshPhysicalMaterial({ color: 0x2f8e25, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25 });
    const gr = kit.rng(5);
    const spots = [[-0.27, -0.06], [-0.17, 0.09], [-0.07, -0.08], [0.03, 0.08], [0.13, -0.06], [0.23, 0.06]];
    for (const [sx, sz] of spots) {
      const n = 5 + Math.floor(gr() * 3);
      for (let k = 0; k < n; k++) {
        const d = new T.Mesh(discG, discM); d.position.set(sx * a / 0.42, floorY + 0.01 + k * 0.019, sz * c / 0.27); d.castShadow = true; d.receiveShadow = true; g.add(d);
      }
    }
    const lamM = new T.MeshStandardMaterial({ color: 0x55a83e, roughness: 0.5 });
    for (let i = 0; i < spots.length - 1; i++) {
      const [x1, z1] = spots[i], [x2, z2] = spots[i + 1];
      const ax = x1 * a / 0.42, az = z1 * c / 0.27, bx = x2 * a / 0.42, bz = z2 * c / 0.27, L = Math.hypot(bx - ax, bz - az);
      const lam = new T.Mesh(new T.BoxGeometry(L, 0.006, 0.03), lamM);
      lam.position.set((ax + bx) / 2, floorY + 0.045, (az + bz) / 2); lam.rotation.y = -Math.atan2(bz - az, bx - ax); g.add(lam);
    }
    return { top: [x, yc + 0.0, z] };
  }

  // ── 소기관은 모두 세포막 안(세포질 속)에 있어야 한다(세포벽이나 막을 뚫고 나가면 안 된다, 사용자 지적).
  // 소기관의 둘레(위에서 본 윤곽)를 32점으로 재어 세포막 안쪽 SAFE만큼 들어온 육각형 안에 다 들어오게 한다.
  // 들어오지 않으면 세포 가운데 쪽으로 조금씩 옮긴다. 옮기고도 안 들어오면 그리기를 멈춘다.
  const SAFE = 0.07;
  const hexSafe = offset(HEX, TW + TM + SAFE);
  const insidePoly = (poly, x, z) => {
    let sgn = 0;
    for (let i = 0; i < poly.length; i++) {
      const [x1, z1] = poly[i], [x2, z2] = poly[(i + 1) % poly.length];
      const cr = (x2 - x1) * (z - z1) - (z2 - z1) * (x - x1);
      if (cr !== 0) { if (sgn === 0) sgn = Math.sign(cr); else if (Math.sign(cr) !== sgn) return false; }
    }
    return true;
  };
  // 윤곽 점(로컬 x, z)을 rotation.y만큼 돌려 놓는다(three.js: x' = x cos + z sin, z' = -x sin + z cos)
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
  // 소기관끼리도 겹치지 않는다(사이 GAP). 이미 놓인 것의 윤곽 안에 새 윤곽 점이 하나라도 들어가면 겹침.
  const GAP = 0.05;
  const placed = [];
  const insideShape = (o, px, pz) => {
    const dx = px - o.x, dz = pz - o.z, c = Math.cos(o.rotY), s = Math.sin(o.rotY);
    const lx = dx * c - dz * s, lz = dx * s + dz * c; // 돌린 것을 되돌린다
    if (o.shape.kind === "ellipse") return (lx / (o.shape.a + GAP)) ** 2 + (lz / (o.shape.c + GAP)) ** 2 <= 1;
    const cx = Math.max(-o.shape.len / 2, Math.min(o.shape.len / 2, lx));
    return Math.hypot(lx - cx, lz) <= o.shape.r + GAP;
  };
  const fit = (x, z, rotY, shape, name) => {
    const pts = outline(shape, rotY);
    // 처음 자리에서 시작해 둘레를 점점 넓게 돌며 찾는다(세포 안 + 다른 소기관과 안 겹침)
    for (let k = 0; k <= 400; k++) {
      const ang = k * 2.399963, rad = 0.02 * Math.sqrt(k) * 3;
      const px = x + Math.cos(ang) * rad, pz = z + Math.sin(ang) * rad;
      const ok = pts.every(([ox, oz]) => insidePoly(hexSafe, px + ox, pz + oz) && placed.every((o) => !insideShape(o, px + ox, pz + oz)))
        && placed.every((o) => !outline(o.shape, o.rotY).some(([ox, oz]) => insideShape({ x: px, z: pz, rotY, shape }, o.x + ox, o.z + oz)));
      if (ok) {
        placed.push({ name, x: px, z: pz, rotY, shape, moved: k > 0 });
        return [px, pz];
      }
    }
    throw new Error(`${name}: 세포 안 빈자리를 못 찾음 (${x}, ${z})`);
  };
  // 핵을 먼저 놓는다(가운데에 고정)
  fit(-0.3, -0.12, 0, { kind: "ellipse", a: 0.62, c: 0.62 }, "핵");

  // 엽록체 7개(길이 약 0.84~0.92), 마이토콘드리아 3개(길이 약 0.42): 엽록체가 약 2배 길다
  const CHL = { kind: "ellipse", a: 0.42, c: 0.27 };
  // 벽을 따라 둘레에 눕힌다(여섯은 단면, 하나는 앞쪽에서 열어 본다)
  // 빗변 넷의 방향: 엽록체의 긴 축(로컬 x를 rotation.y만큼 돌린 (cos, -sin))이 벽과 나란하도록 ±1.025rad(= atan2(1.58, 0.96)).
  // 자리는 벽 가운데에서 안쪽 법선으로 (막 안쪽 여유 0.325 + 엽록체 반폭 0.27 + 0.03)만큼.
  [[0.55, -0.96, 0.0], [1.24, -0.47, -1.025], [1.24, 0.47, 1.025], [-1.24, -0.47, 1.025], [-1.24, 0.47, -1.025], [-0.62, 0.96, 0.0]]
    .forEach(([x0, z0, ry], i) => {
      const [x, z] = fit(x0, z0, ry, CHL, `엽록체${i + 1}`);
      cutEllipsoid({ x, z, rotY: ry, a: CHL.a, b: 0.17, c: CHL.c, yc: YC - 0.03 + (i % 3) * 0.01, mat: chlMat, cap: chlCap });
    });
  const [ox, oz] = fit(0.42, 0.9, -0.08, { kind: "ellipse", a: 0.46, c: 0.3 }, "열어 본 엽록체");
  const open = openChloroplast({ x: ox, z: oz, rotY: -0.08, a: 0.46, b: 0.19, c: 0.3 });
  const MITO = { kind: "capsule", r: 0.13, len: 0.16 };
  const mitos = [[0.62, 0.22, 1.6], [-0.95, -1.05, 0.0], [0.82, -0.34, 0.8]].map(([x0, z0, ry], i) => {
    const [x, z] = fit(x0, z0, ry, MITO, `마이토콘드리아${i + 1}`);
    return cutCapsule({ x, z, rotY: ry, r: MITO.r, len: MITO.len, yc: YC - 0.01, mat: mitoMat, cap: mitoCap });
  });
  console.log("placed", JSON.stringify(placed.map((p) => [p.name, +p.x.toFixed(2), +p.z.toFixed(2), p.moved])));

  // 핵: 위 앞쪽 약 110°의 쐐기를 떼어 속을 보인 공(공용 wedgeNucleus). 아래쪽은 온전한 구로 세포질 속에 묻힌다.
  const NR = 0.62, NP = [-0.3, YC + 0.1, -0.12];
  const W0 = (-45 * Math.PI) / 180, W1 = (65 * Math.PI) / 180; // 떼어 낸 쐐기의 범위(+Z가 0, +X 쪽이 +)
  const nuc = wedgeNucleus(kit, T, scene, { nucShell: nucShellMat, nucCap, capMat }, { pos: NP, R: NR, w0: W0, w1: W1 });

  kit.shadowCatcher(T, scene, { y: -0.005, opacity: 0.15 });
  await kit.renderIllus(st, { radius: 0.3, thickness: 0.7, edgeK: 0.36 });
  await kit.frame();

  // ── 라벨 ──
  const svg = kit.layer(root, W, H);
  const P = (p) => st.project(p);
  const nucIn = P(nuc.inside);
  const chlP = P(open.top), mitoP = P(mitos[0].top);
  const memP = P([(NX0 + NX1) / 2, YC - 0.2, zFrontI + 0.002]);
  const wallP = P([0.75, YC - 0.25, zFrontO]);
  // 왼쪽: 세포벽, 세포막(앞 벽의 홈) / 위: 핵, 마이토콘드리아 / 오른쪽 아래: 엽록체(열어 본 것)
  const wallL = P([-0.95, 0.42, zFrontO]);   // 홈 왼쪽 앞 벽 바깥면
  kit.label(svg, { at: wallL, via: [44, H - 40], to: [40, H - 40], text: "세포벽", side: "l", size: 13.5 });
  kit.label(svg, { at: memP, via: [memP[0] - 30, H - 16], to: [memP[0] - 34, H - 16], text: "세포막", side: "l", size: 13.5 });
  kit.label(svg, { at: nucIn, via: [nucIn[0] - 38, 18], to: [nucIn[0] - 44, 18], text: "핵", side: "l", size: 13.5 });
  kit.label(svg, { at: mitoP, via: [mitoP[0] + 40, 18], to: [mitoP[0] + 46, 18], text: "마이토콘드리아", side: "r", size: 13.5 });
  kit.label(svg, { at: chlP, via: [chlP[0] + 44, H - 18], to: [chlP[0] + 50, H - 18], text: "엽록체", side: "r", size: 13.5 });
  console.log("proj", JSON.stringify({ nucIn, chlP, mitoP, memP, wallL }));
}
