// u2l4f1 · 모양이 다른 세포들: 신경세포, 적혈구, 상피세포의 실제 생김새(칸마다 자기 눈금).
// 검산 메모: u2l4f1.md. 색은 세포 맡기기 랩(cellFitLab)과 같다(신경 주황, 적혈구 빨강, 상피 분홍, 핵 보라).
// 정사영. 신경세포 칸 1 µm = 1.15px(긴 돌기는 끊김 표시로 줄였다), 적혈구 칸 1 µm = 6px, 상피세포 칸 1 µm = 0.35px(세포 하나 약 50 µm).
export const meta = { key: "u2l4f1", w: 340, h: 300, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  // 화면 px를 그대로 월드 단위로 쓰는 정사영(x 오른쪽, y 위). 화면 (x, y) → 월드 (x - W/2, H/2 - y)
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 0, 600], look: [0, 0, 0], envIntensity: 0.6, key: [-300, 500, 600], keyI: 1.6, fillI: 0.85, rimI: 0.3, shadows: false });
  const { THREE: T, scene, renderer } = st;
  const at = (x, y, z = 0) => new T.Vector3(x - W / 2, H / 2 - y, z);
  const C = { nerve: 0xf6b26b, nerveEdge: 0xb86a1e, rbc: 0xe5484d, epi: 0xf7b8c8, nuc: 0x7048e8 };
  const phys = (color, extra = {}) => new T.MeshPhysicalMaterial({ color, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.35, sheenColor: 0xffffff, ...extra });
  const r = kit.rng(7);

  // ── 신경세포(윗줄): 세포체(핵 하나), 짧게 갈라진 돌기 여럿, 한쪽으로 아주 긴 돌기 하나(가운데 끊김), 끝은 잘게 갈라짐 ──
  const SOMA = [64, 74];
  const nerveM = phys(C.nerve);
  const soma = new T.Mesh(new T.SphereGeometry(13, 48, 32), nerveM);
  { const p = soma.geometry.attributes.position, v = new T.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 1 + 0.12 * Math.sin(v.x * 0.4 + 1) * Math.cos(v.y * 0.35); p.setXYZ(i, v.x * n * 1.1, v.y * n * 0.95, v.z * 0.55 * n); } soma.geometry.computeVertexNormals(); }
  soma.position.copy(at(...SOMA)); scene.add(soma);
  const nucN = new T.Mesh(new T.SphereGeometry(5, 32, 24), phys(C.nuc)); nucN.scale.set(1, 1, 0.6); nucN.position.copy(at(SOMA[0] - 1, SOMA[1] - 1, 6)); scene.add(nucN);
  // 관(굵기가 줄어드는 곡선): 점 열을 따라 짧은 원뿔대를 이어 붙인다
  const tube = (pts, r0, r1, mat) => {
    const curve = new T.CatmullRomCurve3(pts.map(([x, y]) => at(x, y, 0)));
    const N = 40, g = new T.TubeGeometry(curve, N, 1, 10, false);
    const pos = g.attributes.position, v = new T.Vector3();
    for (let i = 0; i <= N; i++) {
      const t = i / N, rad = r0 + (r1 - r0) * t, c = curve.getPointAt(t);
      for (let j = 0; j <= 10; j++) { const k = i * 11 + j; v.fromBufferAttribute(pos, k).sub(c).multiplyScalar(rad).add(c); pos.setXYZ(k, v.x, v.y, v.z); }
    }
    g.computeVertexNormals();
    const m = new T.Mesh(g, mat); scene.add(m); return m;
  };
  const branch = (x, y, ang, len, rad, depth) => {
    const pts = [[x, y]];
    let cx = x, cy = y, a = ang;
    for (let s = 0; s < 4; s++) { a += (r() - 0.5) * 0.5; cx += Math.cos(a) * len / 4; cy += Math.sin(a) * len / 4; pts.push([cx, cy]); }
    tube(pts, rad, rad * 0.55, nerveM);
    if (depth > 0) { branch(cx, cy, a - 0.5, len * 0.62, rad * 0.55, depth - 1); branch(cx, cy, a + 0.45, len * 0.6, rad * 0.55, depth - 1); }
  };
  for (const a of [2.3, 2.9, 3.6, 4.2, 1.6, 4.9]) branch(SOMA[0] + Math.cos(a) * 11, SOMA[1] + Math.sin(a) * 9, a, 22 + r() * 6, 3.0, 1);
  // 긴 돌기: 세포체 오른쪽에서 끊김 표시 앞까지, 끊김 뒤부터 끝 갈래까지
  const BREAK = [196, 214];
  tube([[SOMA[0] + 13, SOMA[1]], [110, SOMA[1] - 3], [150, SOMA[1] + 2], [BREAK[0], SOMA[1]]], 2.6, 2.2, nerveM);
  tube([[BREAK[1], SOMA[1]], [250, SOMA[1] - 2], [278, SOMA[1] + 1]], 2.2, 2.0, nerveM);
  for (const a of [-0.7, -0.25, 0.2, 0.65]) {
    const sx = 278, sy = SOMA[1] + 1, ex = sx + Math.cos(a) * 22, ey = sy + Math.sin(a) * 22;
    tube([[sx, sy], [(sx + ex) / 2, (sy + ey) / 2 + (r() - 0.5) * 4], [ex, ey]], 1.6, 0.9, nerveM);
    const knob = new T.Mesh(new T.SphereGeometry(2.0, 16, 12), nerveM); knob.position.copy(at(ex, ey, 0)); scene.add(knob);
  }

  // ── 적혈구(왼쪽 아래): 지름 약 8 µm, 가장자리 두께 약 2 µm, 가운데 약 1 µm, 핵 없음 ──
  const RS = 6; // px / µm
  const prof = [];
  // 적혈구 두께(Evans와 Fung의 측정 식): T(x) = √(1 − x²)(0.81 + 7.83x² − 4.39x⁴) µm, x = r / 3.91. 가운데 0.81, 가장자리 근처 최대 약 2.5 µm.
  for (let i = 0; i <= 64; i++) { const x = Math.min(0.9999, i / 64), Tk = Math.sqrt(1 - x * x) * (0.81 + 7.83 * x * x - 4.39 * x ** 4); prof.push([3.91 * x, Math.max(0.02, Tk / 2)]); }
  const lathePts = [...prof.map(([a, b]) => new T.Vector2(a * RS, b * RS)), ...prof.slice().reverse().map(([a, b]) => new T.Vector2(a * RS, -b * RS))];
  const rbcM = phys(C.rbc, { roughness: 0.38 });
  // 위에서 본 원반(살짝 기울여 오목한 가운데가 보이게)
  const rbcTop = new T.Mesh(new T.LatheGeometry(lathePts, 96), rbcM); rbcTop.rotation.x = 0.9; rbcTop.position.copy(at(58, 214, 0)); scene.add(rbcTop);
  // 반으로 자른 옆모습: 앞쪽 반을 떼어 낸 몸 + 자른 면(단면 꼴)
  const rbcHalf = kit.latheCut(T, prof.map(([a, b]) => [a * RS, b * RS]).concat(prof.slice().reverse().map(([a, b]) => [a * RS, -b * RS])), { phiStart: Math.PI / 2, phiLength: Math.PI, mat: rbcM, capMat: phys(0xc7353a, { side: T.DoubleSide, roughness: 0.6 }) });
  rbcHalf.group.rotation.x = 0.12; rbcHalf.group.position.copy(at(118, 258, 0)); scene.add(rbcHalf.group);

  // ── 상피세포(오른쪽 아래): 위에서 본 납작한 다각형이 빈틈없이 맞닿고 가운데 핵 하나씩 + 옆에서 본 한 겹 ──
  const ES = 0.35; // px / µm (보로노이 칸 지름 약 17px = 약 50 µm)
  const pts = kit.scatter(-46, -34, 46, 34, 15, 31, 6000);
  const cells = kit.voronoi(pts, -46, -34, 46, 34);
  const epiM = new T.MeshPhysicalMaterial({ color: 0xee9cb3, roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.4, side: T.DoubleSide });
  const nucM = phys(C.nuc);
  const EX = 260, EY = 186;
  cells.forEach((poly, i) => {
    if (poly.length < 3) return;
    const [qx, qy] = pts[i];
    if ((qx / 42) ** 2 + (qy / 30) ** 2 > 1) return; // 가장자리가 들쭉날쭉한 한 장(네모 틀처럼 보이지 않게)
    const ins = kit.inset(poly, 0.9);
    const sh = new T.Shape(ins.map(([x, y]) => new T.Vector2(x, y)));
    const g = new T.ExtrudeGeometry(sh, { depth: 1.5, bevelEnabled: true, bevelThickness: 1.6, bevelSize: 1.4, bevelSegments: 4 });
    const m = new T.Mesh(g, epiM); m.position.copy(at(EX, EY, 0)); m.rotation.x = -0.28; scene.add(m);
    const [cx, cy] = pts[i];
    const nm = new T.Mesh(new T.SphereGeometry(2.8, 24, 16), nucM); nm.scale.set(1, 0.85, 0.45);
    const local = new T.Vector3(cx, cy, 3.4).applyAxisAngle(new T.Vector3(1, 0, 0), -0.28);
    nm.position.copy(at(EX, EY, 0)).add(local); nm.rotation.x = -0.28; scene.add(nm);
  });
  // 옆에서 본 한 겹(얇은 세포가 한 줄로)
  for (let k = 0; k < 6; k++) {
    const g = new T.CapsuleGeometry(1.7, 13, 8, 24); g.rotateZ(Math.PI / 2);
    const m = new T.Mesh(g, epiM); m.scale.set(1, 1, 0.8); m.position.copy(at(EX - 40 + k * 16, 262, 0)); scene.add(m);
    const nm = new T.Mesh(new T.SphereGeometry(2.0, 16, 12), nucM); nm.scale.set(1.4, 0.8, 0.6); nm.position.copy(at(EX - 40 + k * 16, 262, 1.6)); scene.add(nm);
  }

  await kit.renderIllus(st, { ao: false, edgeK: 0.34 });
  await kit.frame();

  // ── 끊김 표시, 칸 나눔, 이름과 눈금 ──
  const svg = kit.layer(root, W, H);
  const brk = (x) => svg.appendChild(kit.s("path", { d: `M${x - 5} ${SOMA[1] + 8} q4 -8 0 -16 M${x + 3} ${SOMA[1] + 8} q4 -8 0 -16`, fill: "none", stroke: "#5B6475", "stroke-width": 1.4, "stroke-linecap": "round" }));
  brk((BREAK[0] + BREAK[1]) / 2 - 2);
  svg.appendChild(kit.s("path", { d: `M10 138 H${W - 10} M170 150 V${H - 8}`, stroke: "#E3E7EE", "stroke-width": 1.2 }));
  kit.text(svg, 12, 16, "신경세포", { size: 14, weight: 800, anchor: "start" });
  kit.text(svg, 12, 33, "긴 돌기는 1 m가 넘기도 해요", { size: 12, weight: 600, color: "#5B6475", anchor: "start" });
  kit.label(svg, { at: [SOMA[0] - 1, SOMA[1] - 1], via: [SOMA[0] + 26, 106], to: [SOMA[0] + 30, 106], text: "핵", side: "r", size: 13 });
  kit.text(svg, (BREAK[0] + BREAK[1]) / 2, SOMA[1] - 18, "끊어 줄임", { size: 12, weight: 600, color: "#5B6475" });
  kit.text(svg, 12, 158, "적혈구", { size: 14, weight: 800, anchor: "start" });
  kit.text(svg, 12, 175, "핵이 없어요", { size: 12, weight: 600, color: "#5B6475", anchor: "start" });
  kit.text(svg, 118, 232, "옆에서 본 모습", { size: 12, weight: 600, color: "#5B6475" });
  kit.text(svg, 182, 158, "상피세포", { size: 14, weight: 800, anchor: "start" });
  kit.text(svg, EX, 246, "옆에서 본 모습", { size: 12, weight: 600, color: "#5B6475" });
  const bar = (x, y, len, txt) => {
    svg.appendChild(kit.s("path", { d: `M${x} ${y - 3.5} V${y + 3.5} M${x} ${y} H${x + len} M${x + len} ${y - 3.5} V${y + 3.5}`, stroke: "#2B3445", "stroke-width": 1.4, fill: "none" }));
    kit.text(svg, x + len + 5, y, txt, { size: 12, weight: 700, anchor: "start" });
  };
  bar(232, 33, 20 * 1.15, "20 µm");
  bar(14, H - 14, 8 * RS, "8 µm");
  bar(182, H - 14, 50 * ES, "50 µm");
}
