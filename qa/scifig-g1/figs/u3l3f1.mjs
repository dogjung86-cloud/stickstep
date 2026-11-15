// u3l3f1 · 열의 이동 세 가지: 모닥불 한 장면 속 전도(쇠막대), 대류(냄비 속 물), 복사(불 곁의 손).
// 검산 메모: u3l3f1.md. Ⅲ단원 말은 '열'. 복사는 곧은 주황 점선이 사방으로(복사 랩과 같은 표현), 대류는 가운데에서 오르는 고리 둘.
export const meta = { key: "u3l3f1", w: 340, h: 272, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  // 화면 px = 월드 단위(정사영, 살짝 내려다봄). 화면 (x, y) ≈ 월드 (x - W/2, H/2 - y)
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 120, 600], look: [0, 0, 0], envIntensity: 0.55, key: [-250, 400, 380], keyI: 1.5, fillI: 0.85, rimI: 0.3 });
  const { THREE: T, scene, renderer, camera } = st;
  st.keyL.shadow.camera.left = -260; st.keyL.shadow.camera.right = 260; st.keyL.shadow.camera.top = 260; st.keyL.shadow.camera.bottom = -260; st.keyL.shadow.camera.far = 2000; st.keyL.shadow.camera.updateProjectionMatrix();
  const GY = -96; // 땅 높이(월드)
  const FX = 0;   // 모닥불 중심 x(월드)

  // ── 땅의 그림자 받이 ──
  kit.shadowCatcher(T, scene, { y: GY, size: 900, opacity: 0.12 });

  // ── 돌 고리 ──
  const rockTex = kit.canvasTex(T, renderer, kit.canvas(256, 256, (c, w, h) => {
    const img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = kit.fbm(x / 22, y / 22, 4, 9), v = 150 + (n - 0.5) * 70; const i = (y * w + x) * 4; img.data[i] = v; img.data[i + 1] = v * 0.97; img.data[i + 2] = v * 0.92; img.data[i + 3] = 255; }
    c.putImageData(img, 0, 0);
  }));
  const rockM = new T.MeshStandardMaterial({ map: rockTex, roughness: 0.9 });
  const rr = kit.rng(3);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + 0.2, R = 38;
    const g = new T.IcosahedronGeometry(9 + rr() * 3, 2);
    const p = g.attributes.position, v = new T.Vector3();
    for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k); const n = 1 + (kit.fbm(v.x * 0.2 + i, v.y * 0.2, 2, i) - 0.5) * 0.5; p.setXYZ(k, v.x * n * 1.2, v.y * n * 0.75, v.z * n); }
    g.computeVertexNormals();
    const m = new T.Mesh(g, rockM); m.position.set(FX + Math.cos(a) * R, GY + 5, Math.sin(a) * R * 0.55); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  }
  // ── 장작 ──
  const barkM = new T.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.85 });
  const charM = new T.MeshStandardMaterial({ color: 0x2a1d17, roughness: 0.9, emissive: 0x3a1206 });
  for (const [a, tilt] of [[0.3, 0.5], [2.4, 0.55], [4.3, 0.5]]) {
    const log = new T.Mesh(new T.CylinderGeometry(5, 6, 62, 16), barkM);
    log.position.set(FX + Math.cos(a) * 10, GY + 14, Math.sin(a) * 8); log.rotation.z = Math.cos(a) * tilt; log.rotation.x = Math.sin(a) * tilt; log.castShadow = true; scene.add(log);
    const end = new T.Mesh(new T.CylinderGeometry(5.2, 5.2, 4, 16), charM); end.position.copy(log.position); end.rotation.copy(log.rotation); end.translateY(29); scene.add(end);
  }

  // ── 걸이: 양옆 기둥 둘과 가로대(가운데 뒤에 막대가 없어 냄비와 불을 가리지 않는다), 냄비(앞쪽 절반을 잘라 속의 물이 보인다) ──
  const woodM = new T.MeshStandardMaterial({ color: 0x8a6545, roughness: 0.8 });
  const BAR_Y = 92;
  for (const px of [-100, 100]) {
    const post = new T.Mesh(new T.CylinderGeometry(2.8, 3.2, BAR_Y - GY + 6, 12), woodM);
    post.position.set(FX + px, (BAR_Y + GY) / 2, -12); post.castShadow = true; scene.add(post);
  }
  const bar = new T.Mesh(new T.CylinderGeometry(2.4, 2.4, 214, 12), woodM); bar.rotation.z = Math.PI / 2; bar.position.set(FX, BAR_Y, -12); bar.castShadow = true; scene.add(bar);
  const chainM = new T.MeshStandardMaterial({ color: 0x5a6068, metalness: 0.8, roughness: 0.4 });
  const POT_R = 42, POT_H = 40, POT_Y = -6; // 냄비 바닥 높이(월드): 불꽃 끝 바로 위
  const potProf = [[0, 0], [POT_R - 4, 0], [POT_R, 4], [POT_R, POT_H], [POT_R - 2.5, POT_H], [POT_R - 2.5, 4], [POT_R - 5, 2.5], [0, 2.5]];
  const potM = new T.MeshPhysicalMaterial({ color: 0x8d949c, metalness: 0.85, roughness: 0.32, clearcoat: 0.3 });
  const potCapM = new T.MeshStandardMaterial({ color: 0x6e757d, metalness: 0.7, roughness: 0.45, side: T.DoubleSide });
  const pot = kit.latheCut(T, potProf, { phiStart: Math.PI / 2, phiLength: Math.PI, mat: potM, capMat: potCapM });
  pot.group.position.set(FX, POT_Y, 0); scene.add(pot.group);
  const handle = new T.Mesh(new T.TorusGeometry(POT_R, 0.9, 8, 64, Math.PI), chainM); handle.position.set(FX, POT_Y + POT_H, 0); handle.scale.set(1, 0.5, 1); scene.add(handle);
  { const top = new T.Vector3(FX, BAR_Y, -12), bot = new T.Vector3(FX, POT_Y + POT_H + POT_R * 0.5, 0), d = top.clone().sub(bot); const chain = new T.Mesh(new T.CylinderGeometry(0.8, 0.8, d.length(), 8), chainM); chain.position.copy(top.clone().add(bot).multiplyScalar(0.5)); chain.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); scene.add(chain); } // 가로대에서 손잡이 꼭대기까지
  // 물: 냄비 안을 채운 반원기둥(앞쪽 잘린 면이 화면을 향한다)
  const WATER_H = 34;
  const waterTex = kit.canvasTex(T, renderer, kit.canvas(512, 384, (c, w, h) => {
    // 데워진 물: 가운데 아래가 따뜻한 색, 위와 가장자리가 차가운 색(Ⅲ 온도 색 램프 쪽으로 옅게)
    const g = c.createRadialGradient(w / 2, h * 1.05, 20, w / 2, h * 0.6, w * 0.62);
    g.addColorStop(0, "#F9B8A0"); g.addColorStop(0.55, "#BBD6F5"); g.addColorStop(1, "#9CC4F2");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }));
  const waterProf = [[0, 2.6], [POT_R - 2.6, 2.6], [POT_R - 2.6, WATER_H], [0, WATER_H]];
  const water = kit.latheCut(T, waterProf, { phiStart: Math.PI / 2, phiLength: Math.PI, mat: new T.MeshPhysicalMaterial({ color: 0x9cc4f2, roughness: 0.15, transmission: 0.2, clearcoat: 1 }), capMat: new T.MeshBasicMaterial({ map: waterTex, side: T.DoubleSide }) });
  water.group.position.set(FX, POT_Y, 0); scene.add(water.group);
  // 잘린 면(옆으로 서 있는 판 둘) 가운데 한 장만 화면을 향하므로 그 판의 UV를 단면 좌표로
  for (const cp of water.caps) { const uv = cp.geometry.attributes.uv, p = cp.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.5 + (cp === water.caps[0] ? -1 : 1) * p.getX(i) / (2 * (POT_R - 2.6)), (p.getY(i) - 2.6) / (WATER_H - 2.6)); }

  // ── 쇠막대: 한쪽 끝은 불 속, 다른 끝은 장갑 낀 손 ──
  const rodA = new T.Vector3(FX - 12, GY + 16, 6), rodB = new T.Vector3(FX - 138, GY + 70, 30);
  const rodD = rodB.clone().sub(rodA), rodL = rodD.length();
  const rodM = new T.MeshPhysicalMaterial({ color: 0x9aa1aa, metalness: 0.9, roughness: 0.28 });
  const rod = new T.Mesh(new T.CylinderGeometry(2.2, 2.2, rodL, 16), rodM);
  rod.position.copy(rodA.clone().add(rodB).multiplyScalar(0.5)); rod.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), rodD.clone().normalize()); rod.castShadow = true; scene.add(rod);
  // 불 쪽 끝이 달아오른 빛
  const glow = new T.Mesh(new T.CylinderGeometry(2.4, 2.4, 22, 16), new T.MeshStandardMaterial({ color: 0xff7a3a, emissive: 0xff4a10, emissiveIntensity: 0.9, roughness: 0.4 }));
  glow.position.copy(rodA.clone().add(rodD.clone().normalize().multiplyScalar(11))); glow.quaternion.copy(rod.quaternion); scene.add(glow);
  // 장갑 낀 손(손모아장갑): 막대 끝을 쥔다
  const gloveM = new T.MeshPhysicalMaterial({ color: 0xe0883a, roughness: 0.7, sheen: 0.5, sheenColor: 0xffd0a0 });
  const glove = new T.Mesh(new T.CapsuleGeometry(9, 12, 8, 24), gloveM); glove.position.copy(rodB).add(new T.Vector3(-6, 0, 0)); glove.rotation.z = 1.0; glove.castShadow = true; scene.add(glove);
  const thumb = new T.Mesh(new T.CapsuleGeometry(3.6, 6, 6, 16), gloveM); thumb.position.copy(rodB).add(new T.Vector3(2, 8, 4)); thumb.rotation.z = -0.6; scene.add(thumb);
  const cuff = new T.Mesh(new T.CylinderGeometry(10, 10, 8, 24), new T.MeshStandardMaterial({ color: 0x8a5a2a, roughness: 0.8 })); cuff.position.copy(rodB).add(new T.Vector3(-22, -10, 0)); cuff.rotation.z = 1.0; scene.add(cuff);

  // ── 불 곁의 두 손(맨손, 손바닥이 불 쪽): 불 위가 아니라 옆에 ──
  const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
  const skinM = new T.MeshPhysicalMaterial({ color: 0xf1c3a0, roughness: 0.55, sheen: 0.4, sheenColor: 0xffe2d0 });
  const sleeveM = new T.MeshStandardMaterial({ color: 0x4a7fc0, roughness: 0.8 });
  for (const [dy, dz] of [[6, 14], [-14, -8]]) {
    const hand = new T.Group(); hand.position.set(FX + 112, GY + 66 + dy, dz); hand.rotation.z = 0.12; scene.add(hand);
    const palm = new T.Mesh(new RoundedBoxGeometry(6, 26, 15, 4, 2.8), skinM); palm.position.set(0, 3, 0); palm.castShadow = true; hand.add(palm);
    const thumb = new T.Mesh(new T.CapsuleGeometry(2.6, 7, 6, 16), skinM); thumb.position.set(-1, -5, 9); thumb.rotation.x = -0.9; thumb.castShadow = true; hand.add(thumb);
    const wrist = new T.Mesh(new T.CylinderGeometry(5.2, 5.6, 10, 16), skinM); wrist.position.set(5, -11, 0); wrist.rotation.z = 1.2; hand.add(wrist);
    const sleeve = new T.Mesh(new T.CylinderGeometry(7, 8, 46, 20), sleeveM); sleeve.position.set(28, -21, 0); sleeve.rotation.z = 1.2; sleeve.castShadow = true; hand.add(sleeve);
  }

  await kit.renderIllus(st, { radius: 6, thickness: 6, edgeK: 0.32 });
  await kit.frame();

  // ── 불꽃과 화살표, 이름(그림 위 SVG) ──
  const svg = kit.layer(root, W, H);
  const P = (v) => st.project(v instanceof T.Vector3 ? [v.x, v.y, v.z] : v);
  const fire = P([FX, GY + 30, 0]);
  // 불꽃: 겹친 혀 모양(바깥 주황, 안쪽 노랑)
  const flame = (x, y, w, h, c1, c2, op = 1) => {
    const d = `M${x - w / 2} ${y} C${x - w / 2} ${y - h * 0.45} ${x - w * 0.12} ${y - h * 0.6} ${x} ${y - h} C${x + w * 0.16} ${y - h * 0.62} ${x + w / 2} ${y - h * 0.42} ${x + w / 2} ${y} Z`;
    svg.appendChild(kit.s("path", { d, fill: kit.lin(svg, 0, 1, 0, 0, [[0, c1], [1, c2]]), opacity: op }));
  };
  const glowF = kit.blurFilter(svg, 6);
  svg.appendChild(kit.s("ellipse", { cx: fire[0], cy: fire[1] + 6, rx: 46, ry: 26, fill: "#FFB347", opacity: 0.35, filter: glowF }));
  flame(fire[0] - 13, fire[1] + 14, 24, 44, "#F2581B", "#FFC24A", 0.95);
  flame(fire[0] + 12, fire[1] + 14, 22, 40, "#F2581B", "#FFC24A", 0.95);
  flame(fire[0], fire[1] + 14, 30, 60, "#F26B1D", "#FFD25A");
  flame(fire[0], fire[1] + 12, 15, 34, "#FFC24A", "#FFF3B0");
  // 복사: 불에서 사방으로 뻗는 곧은 주황 점선(손에 닿는 것을 포함해 여러 줄)
  const RAY = "#F08C00";
  for (const a of [-2.75, -2.25, -1.75, -0.95, -0.45, 0.0, 0.32]) {
    const r0 = 34, r1 = a > -0.6 && a < 0.5 ? 92 : 64;
    const x0 = fire[0] + Math.cos(a) * r0, y0 = fire[1] - 8 + Math.sin(a) * r0 * 0.9, x1 = fire[0] + Math.cos(a) * r1, y1 = fire[1] - 8 + Math.sin(a) * r1 * 0.9;
    svg.appendChild(kit.s("path", { d: `M${x0} ${y0} L${x1} ${y1}`, stroke: RAY, "stroke-width": 2.2, "stroke-dasharray": "5 4", "stroke-linecap": "round", fill: "none" }));
    const ang = Math.atan2(y1 - y0, x1 - x0);
    svg.appendChild(kit.s("path", { d: `M${x1 + Math.cos(ang) * 6} ${y1 + Math.sin(ang) * 6} L${x1 + Math.cos(ang + 2.5) * 6} ${y1 + Math.sin(ang + 2.5) * 6} L${x1 + Math.cos(ang - 2.5) * 6} ${y1 + Math.sin(ang - 2.5) * 6} Z`, fill: RAY }));
  }
  // 대류: 냄비 속 물의 고리 둘(가운데에서 오르고 수면에서 양옆으로, 벽을 따라 내려와 바닥을 따라 가운데로)
  const wc = P([FX, POT_Y + 2.6 + (WATER_H - 2.6) / 2, 0]);
  const wl = P([FX - POT_R + 4, POT_Y + 5, 0]), wr = P([FX + POT_R - 4, POT_Y + 5, 0]), wt = P([FX, POT_Y + WATER_H - 3, 0]), wb = P([FX, POT_Y + 5, 0]);
  const loopW = (wr[0] - wl[0]) / 2 - 7, loopTop = wt[1] + 3, loopBot = wb[1] - 3;
  for (const s of [-1, 1]) {
    const cx0 = wc[0] + s * 3, xo = wc[0] + s * loopW;
    const d = `M${cx0} ${loopBot} L${cx0} ${loopTop + 4} Q${cx0} ${loopTop} ${cx0 + s * 8} ${loopTop} L${xo - s * 8} ${loopTop} Q${xo} ${loopTop} ${xo} ${loopTop + 8} L${xo} ${loopBot - 8} Q${xo} ${loopBot} ${xo - s * 8} ${loopBot} L${cx0 + s * 6} ${loopBot}`;
    kit.flowArrow(svg, d, { w: 2.8, head: 7, hw: 2.4, fill: s < 0 ? "#E8590C" : "#E8590C" });
  }
  // 전도: 막대를 따라 불 쪽에서 손 쪽으로
  const ra = P(rodA.clone().add(rodD.clone().multiplyScalar(0.28))), rb = P(rodA.clone().add(rodD.clone().multiplyScalar(0.8)));
  const off = 11;
  const nx = -(rb[1] - ra[1]), ny = rb[0] - ra[0], nl = Math.hypot(nx, ny);
  kit.flowArrow(svg, `M${ra[0] + nx / nl * off} ${ra[1] + ny / nl * off} L${rb[0] + nx / nl * off} ${rb[1] + ny / nl * off}`, { w: 3.6, head: 9, hw: 2.2, fill: "#D9480F" });

  // 이름
  const lab = (x, y, t, sub, anchor = "start", color = "#C2410C") => {
    kit.text(svg, x, y, t, { size: 15, weight: 800, color, anchor });
    if (sub) kit.text(svg, x, y + 16, sub, { size: 12, weight: 600, color: "#4E5968", anchor });
  };
  const mid = [(ra[0] + rb[0]) / 2 + nx / nl * 30, (ra[1] + rb[1]) / 2 + ny / nl * 30];
  lab(mid[0] - 8, mid[1] - 16, "전도", "흔들림이 차례로", "middle");
  lab(wr[0] + 22, wt[1] - 2, "대류", "물이 직접 돌며");
  lab(W - 10, fire[1] - 64, "복사", "물질 없이 곧게", "end");
  const sm = (x, y, t, anchor = "middle") => kit.text(svg, x, y, t, { size: 12, weight: 700, color: "#3B4456", anchor });
  sm(fire[0], fire[1] + 44, "모닥불");
  const rodMid = P(rodA.clone().add(rodD.clone().multiplyScalar(0.62)));
  kit.label(svg, { at: rodMid, via: [rodMid[0] - 6, rodMid[1] + 26], to: [rodMid[0] - 10, rodMid[1] + 26], text: "쇠막대", side: "l", size: 12 });
  kit.label(svg, { at: [wc[0] + 4, wc[1] + 2], via: [wl[0] - 18, wc[1] - 20], to: [wl[0] - 22, wc[1] - 20], text: "냄비 속 물", side: "l", size: 12, dot: false });
  console.log("proj", JSON.stringify({ fire, wc, wl, wr, wt, wb, ra, rb }));
  void camera;
}
