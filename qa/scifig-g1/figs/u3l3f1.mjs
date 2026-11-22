// u3l3f1 · 열의 이동 세 가지: 부엌 조리대의 가스 불 한 장면 속 전도(긴 금속 손잡이), 대류(냄비 속 물), 복사(불 옆에 세운 온도계).
// 검산 메모: u3l3f1.md. Ⅲ단원 말은 '열'. 표현은 랩의 약속을 따른다: 복사는 곧은 주황 점선(복사 랩), 대류는 가운데에서 오르는 고리 둘이고
// 오르는 쪽은 따뜻한 주황, 내려오는 쪽은 차가운 파랑(대류 랩), 전도는 손잡이를 따라 냄비 쪽에서 끝 쪽으로.
// 이름 밑 보조 글은 이 레슨 분류 문제의 힌트와 같은 말(차례로 전달, 입자가 직접 이동, 물질 없이 직접).
export const meta = { key: "u3l3f1", w: 340, h: 250, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  // 화면 px = 월드 단위(정사영, 살짝 내려다봄). 화면 (x, y) ≈ 월드 (x - W/2, H/2 - y)
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 190, 600], look: [0, -6, 0], envIntensity: 0.55, key: [-250, 420, 380], keyI: 1.45, fillI: 0.9, rimI: 0.3 });
  const { THREE: T, scene, renderer } = st;
  const sc = st.keyL.shadow.camera; sc.left = -260; sc.right = 260; sc.top = 260; sc.bottom = -260; sc.far = 2000; sc.updateProjectionMatrix();

  const GY = -78;  // 조리대 윗면 높이(월드)
  const PX = 22;   // 불과 냄비 가운데 x(월드)

  // ── 조리대: 밝은 돌 판(윗면 + 앞면) ──
  const woodTex = kit.canvasTex(T, renderer, kit.canvas(512, 256, (c, w, h) => {
    const img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = kit.fbm(x / 160, y / 9, 4, 3), v = 0.93 + (n - 0.5) * 0.12; const i = (y * w + x) * 4; img.data[i] = 236 * v; img.data[i + 1] = 214 * v; img.data[i + 2] = 178 * v; img.data[i + 3] = 255; }
    c.putImageData(img, 0, 0);
  }));
  // 조리대(밝은 나무 판): 윗면과 앞면
  const counter = new T.Mesh(new T.BoxGeometry(400, 26, 170), new T.MeshStandardMaterial({ map: woodTex, roughness: 0.72 }));
  counter.position.set(0, GY - 13, -10); counter.receiveShadow = true; scene.add(counter);
  // 가스레인지 상판(짙은 회색 유리)과 버너, 받침살
  const plate = new T.Mesh(new T.BoxGeometry(176, 4, 118), new T.MeshPhysicalMaterial({ color: 0x2b3038, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.15 }));
  plate.position.set(PX, GY + 2, -6); plate.receiveShadow = true; plate.castShadow = true; scene.add(plate);
  const metalDark = new T.MeshStandardMaterial({ color: 0x4a4f57, metalness: 0.7, roughness: 0.42 });
  const burner = new T.Mesh(new T.CylinderGeometry(17, 19, 8, 40), metalDark); burner.position.set(PX, GY + 8, 0); burner.castShadow = true; scene.add(burner);
  const capB = new T.Mesh(new T.CylinderGeometry(11, 13, 3, 40), new T.MeshStandardMaterial({ color: 0x23262b, metalness: 0.5, roughness: 0.5 })); capB.position.set(PX, GY + 13.5, 0); scene.add(capB);
  const grateM = new T.MeshStandardMaterial({ color: 0x1f2226, metalness: 0.35, roughness: 0.6 });
  const POT_Y = GY + 28; // 냄비 바닥 높이: 받침살 위
  // 받침살: 버너를 두른 고리와 냄비를 받치는 짧은 살 넷
  const ring = new T.Mesh(new T.TorusGeometry(40, 2.2, 10, 64), grateM); ring.rotation.x = Math.PI / 2; ring.position.set(PX, GY + 6, 0); scene.add(ring);
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const tooth = new T.Mesh(new T.BoxGeometry(18, POT_Y - (GY + 6), 3.2), grateM);
    tooth.position.set(PX + Math.cos(a) * 33, (POT_Y + GY + 6) / 2, Math.sin(a) * 33); tooth.rotation.y = -a; tooth.castShadow = true; scene.add(tooth);
  }

  // ── 냄비(앞쪽 절반을 잘라 속의 물이 보인다) ──
  const POT_R = 46, POT_H = 42;
  const potProf = [[0, 0], [POT_R - 4, 0], [POT_R, 4], [POT_R, POT_H], [POT_R - 2.5, POT_H], [POT_R - 2.5, 4], [POT_R - 5, 2.5], [0, 2.5]];
  const potM = new T.MeshPhysicalMaterial({ color: 0x9aa1a9, metalness: 0.85, roughness: 0.3, clearcoat: 0.3 });
  const potCapM = new T.MeshStandardMaterial({ color: 0x737a82, metalness: 0.7, roughness: 0.45, side: T.DoubleSide });
  const pot = kit.latheCut(T, potProf, { phiStart: Math.PI / 2, phiLength: Math.PI, mat: potM, capMat: potCapM });
  pot.group.position.set(PX, POT_Y, 0); scene.add(pot.group);
  // 물: 냄비 안을 채운 반원기둥(앞쪽 잘린 면이 화면을 향한다). 가운데 아래가 따뜻한 색, 위와 가장자리가 차가운 색
  const WATER_H = 34;
  const waterTex = kit.canvasTex(T, renderer, kit.canvas(512, 384, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h * 1.05, 20, w / 2, h * 0.6, w * 0.62);
    g.addColorStop(0, "#F6C2AE"); g.addColorStop(0.55, "#C6DDF6"); g.addColorStop(1, "#A9CBF2");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }));
  const waterProf = [[0, 2.6], [POT_R - 2.6, 2.6], [POT_R - 2.6, WATER_H], [0, WATER_H]];
  const water = kit.latheCut(T, waterProf, { phiStart: Math.PI / 2, phiLength: Math.PI, mat: new T.MeshPhysicalMaterial({ color: 0xa9cbf2, roughness: 0.15, transmission: 0.2, clearcoat: 1 }), capMat: new T.MeshBasicMaterial({ map: waterTex, side: T.DoubleSide }) });
  water.group.position.set(PX, POT_Y, 0); scene.add(water.group);
  for (const cp of water.caps) { const uv = cp.geometry.attributes.uv, p = cp.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.5 + (cp === water.caps[0] ? -1 : 1) * p.getX(i) / (2 * (POT_R - 2.6)), (p.getY(i) - 2.6) / (WATER_H - 2.6)); }

  // ── 긴 금속 손잡이: 냄비 왼쪽 가장자리에 붙어 왼쪽 위로 뻗는다(끝까지 금속. 나무나 플라스틱 덮개가 없다) ──
  const hA = new T.Vector3(PX - POT_R + 1, POT_Y + POT_H - 6, 0), hB = new T.Vector3(PX - POT_R - 128, POT_Y + POT_H + 14, 0);
  const hD = hB.clone().sub(hA), hL = hD.length();
  const hGeo = new T.BoxGeometry(hL, 3.2, 9);
  // 냄비 쪽은 조금 데워진 빛깔, 끝으로 갈수록 본디 금속 빛(정점 색)
  { const p = hGeo.attributes.position, col = []; for (let i = 0; i < p.count; i++) { const t = (p.getX(i) + hL / 2) / hL; const warm = Math.max(0, 1 - t * 4); col.push(0.68 + 0.2 * warm, 0.71 - 0.02 * warm, 0.75 - 0.14 * warm); } hGeo.setAttribute("color", new T.Float32BufferAttribute(col, 3)); }
  const handle = new T.Mesh(hGeo, new T.MeshPhysicalMaterial({ vertexColors: true, metalness: 0.85, roughness: 0.26, clearcoat: 0.4 }));
  handle.position.copy(hA.clone().add(hB).multiplyScalar(0.5)); handle.rotation.z = Math.atan2(hD.y, hD.x); handle.castShadow = true; scene.add(handle);
  const hole = new T.Mesh(new T.TorusGeometry(3.6, 1.3, 10, 28), new T.MeshPhysicalMaterial({ color: 0x9aa1a9, metalness: 0.8, roughness: 0.3 }));
  hole.position.copy(hB.clone().add(hD.clone().normalize().multiplyScalar(-8))); hole.rotation.x = Math.PI / 2; hole.rotation.z = handle.rotation.z; scene.add(hole);

  // ── 온도계 받침: 원판 + 세로 막대 + 집게 팔(온도계는 SVG로 그 위에 그린다) ──
  const TX = 120, TZ = 8; // 온도계 자리(월드)
  const BULB_Y = POT_Y - 13; // 온도계 구부(액체 통) 높이: 불꽃 높이
  const standM = new T.MeshStandardMaterial({ color: 0x5c636d, metalness: 0.6, roughness: 0.45 });
  const base = new T.Mesh(new T.CylinderGeometry(13, 15, 5, 40), standM); base.position.set(TX + 22, GY + 2.5, TZ - 12); base.castShadow = true; scene.add(base);
  const rod = new T.Mesh(new T.CylinderGeometry(2, 2, 132, 16), standM); rod.position.set(TX + 22, GY + 66, TZ - 12); rod.castShadow = true; scene.add(rod);
  const CLAMP_Y = GY + 112;
  const arm = new T.Mesh(new T.BoxGeometry(24, 3.4, 3.4), standM); arm.position.set(TX + 11, CLAMP_Y, TZ - 6); arm.rotation.y = 0.35; arm.castShadow = true; scene.add(arm);
  const jaw = new T.Mesh(new T.BoxGeometry(7, 8, 7), new T.MeshStandardMaterial({ color: 0x3d434b, roughness: 0.5 })); jaw.position.set(TX, CLAMP_Y, TZ); scene.add(jaw);

  kit.shadowCatcher(T, scene, { y: GY + 0.1, size: 900, opacity: 0.1 });
  await kit.renderIllus(st, { radius: 6, thickness: 6, edgeK: 0.3 });
  await kit.frame();

  // ── 불꽃, 온도계, 화살표, 이름(그림 위 SVG) ──
  const svg = kit.layer(root, W, H);
  const P = (v) => st.project(v instanceof T.Vector3 ? [v.x, v.y, v.z] : v);
  // 가스 불꽃: 버너 둘레의 작은 혀 여럿(바깥 파랑, 안쪽 옅은 하늘), 냄비 바닥에 닿아 옆으로 번진다
  const fb = P([PX, GY + 15, 6]), potBot = P([PX, POT_Y, 6]);
  const glowF = kit.blurFilter(svg, 4);
  svg.appendChild(kit.s("ellipse", { cx: fb[0], cy: (fb[1] + potBot[1]) / 2 + 2, rx: 50, ry: 10, fill: "#7FB2FF", opacity: 0.35, filter: glowF }));
  const tongue = (x, y, w, h, c1, c2, lean = 0) => {
    const d = `M${x - w / 2} ${y} C${x - w / 2} ${y - h * 0.5} ${x - w * 0.15 + lean * 0.5} ${y - h * 0.7} ${x + lean} ${y - h} C${x + w * 0.2 + lean * 0.5} ${y - h * 0.68} ${x + w / 2} ${y - h * 0.45} ${x + w / 2} ${y} Z`;
    svg.appendChild(kit.s("path", { d, fill: kit.lin(svg, 0, 1, 0, 0, [[0, c1], [1, c2]]) }));
  };
  const fh = fb[1] - potBot[1] + 4; // 불꽃 높이(냄비 바닥까지 닿는다)
  for (const [dx, s, lean] of [[-30, 0.8, -5], [-20, 0.95, -3], [-10, 1, -1], [0, 1, 0], [10, 1, 1], [20, 0.95, 3], [30, 0.8, 5]]) {
    tongue(fb[0] + dx, fb[1] + 1, 9, fh * s, "#2F6FE0", "#9CC8FF", lean);
    tongue(fb[0] + dx, fb[1] + 1, 4.4, fh * s * 0.55, "#7AB6FF", "#E6F2FF", lean * 0.6);
  }
  // 온도계(유리는 흰 바탕에서 사라지므로 SVG로): 가는 관 + 아래 구부, 붉은 액체 기둥, 눈금
  const tb = P([TX, BULB_Y, TZ]), tt = P([TX, CLAMP_Y + 22, TZ]);
  const tubeW = 7, bulbR = 6.2;
  svg.appendChild(kit.s("rect", { x: tb[0] - tubeW / 2, y: tt[1], width: tubeW, height: tb[1] - tt[1], rx: tubeW / 2, fill: kit.lin(svg, 0, 0, 1, 0, [[0, "#E4ECF5"], [0.35, "#FFFFFF"], [1, "#D2DDEA"]]), stroke: "#93A4B8", "stroke-width": 1 }));
  const colTop = tt[1] + (tb[1] - tt[1]) * 0.36;
  svg.appendChild(kit.s("rect", { x: tb[0] - 1.6, y: colTop, width: 3.2, height: tb[1] - colTop, fill: "#E03131" }));
  svg.appendChild(kit.s("circle", { cx: tb[0], cy: tb[1], r: bulbR, fill: kit.rad(svg, 0.38, 0.35, 0.7, [[0, "#FF8787"], [0.6, "#E03131"], [1, "#B02525"]]), stroke: "#8F2020", "stroke-width": 1 }));
  svg.appendChild(kit.s("circle", { cx: tb[0] - 2, cy: tb[1] - 2, r: 1.6, fill: "#FFFFFF", opacity: 0.8 }));
  for (let k = 0; k < 7; k++) { const y = tt[1] + 8 + k * ((tb[1] - tt[1] - 20) / 6); svg.appendChild(kit.s("path", { d: `M${tb[0] + tubeW / 2 - 0.5} ${y} h${k % 2 ? 3 : 5}`, stroke: "#5B6475", "stroke-width": 0.9 })); }
  svg.appendChild(kit.s("path", { d: `M${tb[0] - tubeW / 2 + 1.6} ${tt[1] + 6} V${tb[1] - 10}`, stroke: "#FFFFFF", "stroke-width": 1.4, opacity: 0.9 }));

  // 복사: 불에서 곧게 뻗는 주황 점선(복사 랩과 같은 표현). 온도계 구부에 닿는 두 줄 + 다른 쪽으로 가는 줄
  const RAY = "#F08C00";
  const ray = (x0, y0, x1, y1) => {
    svg.appendChild(kit.s("path", { d: `M${x0} ${y0} L${x1} ${y1}`, stroke: RAY, "stroke-width": 2.2, "stroke-dasharray": "5 4", "stroke-linecap": "round", fill: "none" }));
    const ang = Math.atan2(y1 - y0, x1 - x0);
    svg.appendChild(kit.s("path", { d: `M${x1 + Math.cos(ang) * 6} ${y1 + Math.sin(ang) * 6} L${x1 + Math.cos(ang + 2.5) * 6} ${y1 + Math.sin(ang + 2.5) * 6} L${x1 + Math.cos(ang - 2.5) * 6} ${y1 + Math.sin(ang - 2.5) * 6} Z`, fill: RAY }));
  };
  const fc = [fb[0], fb[1] - fh * 0.45]; // 불꽃 가운데
  for (const dy of [-3.5, 3.5]) {
    const tx = tb[0] - bulbR - 7, ty = tb[1] + dy;
    const a = Math.atan2(ty - fc[1], tx - fc[0]);
    ray(fc[0] + Math.cos(a) * 40, fc[1] + Math.sin(a) * 40, tx, ty);
  }
  for (const a of [Math.PI - 0.04, Math.PI - 0.34]) ray(fc[0] + Math.cos(a) * 40, fc[1] + Math.sin(a) * 40, fc[0] + Math.cos(a) * 80, fc[1] + Math.sin(a) * 80);

  // 대류: 냄비 속 물의 고리 둘(가운데에서 오르고 수면에서 양옆으로, 벽을 따라 내려와 바닥을 따라 가운데로).
  // 오르는 가운데는 따뜻한 주황, 내려오는 벽 쪽은 차가운 파랑(가로 그라데이션)
  const wl = P([PX - POT_R + 4, POT_Y + 5, 0]), wr = P([PX + POT_R - 4, POT_Y + 5, 0]), wt = P([PX, POT_Y + WATER_H - 3, 0]), wb = P([PX, POT_Y + 5, 0]), wc = P([PX, POT_Y + 2.6 + (WATER_H - 2.6) / 2, 0]);
  const loopW = (wr[0] - wl[0]) / 2 - 7, loopTop = wt[1] + 3, loopBot = wb[1] - 3;
  const convFill = kit.lin(svg, wl[0], 0, wr[0], 0, [[0, "#3D8BEB"], [0.3, "#3D8BEB"], [0.5, "#F06A28"], [0.7, "#3D8BEB"], [1, "#3D8BEB"]], { units: "userSpaceOnUse" });
  for (const s of [-1, 1]) {
    const cx0 = wc[0] + s * 3, xo = wc[0] + s * loopW;
    const d = `M${cx0} ${loopBot} L${cx0} ${loopTop + 4} Q${cx0} ${loopTop} ${cx0 + s * 8} ${loopTop} L${xo - s * 8} ${loopTop} Q${xo} ${loopTop} ${xo} ${loopTop + 8} L${xo} ${loopBot - 8} Q${xo} ${loopBot} ${xo - s * 8} ${loopBot} L${cx0 + s * 6} ${loopBot}`;
    kit.flowArrow(svg, d, { w: 2.8, head: 7, hw: 2.4, fill: convFill });
  }
  // 전도: 손잡이를 따라 냄비 쪽에서 끝 쪽으로(손잡이 바로 위에 나란히). 냄비 쪽이 짙은 빨강, 끝으로 갈수록 옅은 주황
  const ha = P(hA.clone().add(hD.clone().multiplyScalar(0.1))), hb2 = P(hA.clone().add(hD.clone().multiplyScalar(0.86)));
  const nx = hb2[1] - ha[1], ny = -(hb2[0] - ha[0]), nl = Math.hypot(nx, ny), off = -11;
  const c0 = [ha[0] + (nx / nl) * off, ha[1] + (ny / nl) * off], c1 = [hb2[0] + (nx / nl) * off, hb2[1] + (ny / nl) * off];
  const condFill = kit.lin(svg, c0[0], c0[1], c1[0], c1[1], [[0, "#D9381E"], [1, "#FF9F5A"]], { units: "userSpaceOnUse" });
  kit.flowArrow(svg, `M${c0[0]} ${c0[1]} L${c1[0]} ${c1[1]}`, { w: 3.6, head: 9, hw: 2.2, fill: condFill });

  // 이름(셋)과 작은 이름
  const lab = (x, y, t, sub, color, anchor = "start") => {
    kit.text(svg, x, y, t, { size: 15, weight: 800, color, anchor });
    kit.text(svg, x, y + 16, sub, { size: 13, weight: 600, color: "#4E5968", anchor });
  };
  const hm = [(c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2];
  lab(hm[0] - 30, hm[1] - 34, "전도", "차례로 전달", "#D9381E");
  const potTop = P([PX, POT_Y + POT_H, -POT_R]);
  lab(wc[0], potTop[1] - 38, "대류", "입자가 직접 이동", "#0B8FA6", "middle");
  lab(W - 6, tt[1] - 30, "복사", "물질 없이 직접", "#D96A00", "end");
  const sm = (x, y, t, anchor = "middle") => kit.text(svg, x, y, t, { size: 13, weight: 700, color: "#3B4456", anchor });
  sm(fb[0], P([PX, GY - 6, 60])[1] + 8, "가스 불");
  const hmid = P(hA.clone().add(hD.clone().multiplyScalar(0.55)));
  kit.label(svg, { at: hmid, via: [hmid[0] - 4, hmid[1] + 30], to: [hmid[0] - 8, hmid[1] + 30], text: "금속 손잡이", side: "l", size: 13 });
  kit.label(svg, { at: [tb[0] + 2, tb[1] + bulbR], via: [tb[0] + 6, H - 22], to: [tb[0] + 6, H - 18], text: "온도계", side: "b", size: 13 });
  console.log("proj", JSON.stringify({ fb, potBot, tb, tt, wl, wr, wt, wb, ha, hb2 }));
}
