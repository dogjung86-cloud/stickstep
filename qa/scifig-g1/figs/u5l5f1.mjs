// u5l5f1 · 마찰력: 나무판 위 나무 도막을 힘 센서로 끄는데 아직 움직이지 않는다. 맞닿은 면을 크게 확대하면 울퉁불퉁해 몇 곳에서만 걸려 있다.
// 검산 메모: u5l5f1.md. 움직이기 전이라 끄는 힘과 마찰력의 길이가 같다. 확대 그림은 입자 크기가 아니다(입자라는 말 금지).
export const meta = { key: "u5l5f1", w: 340, h: 320, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 90, 600], look: [0, 0, 0], envIntensity: 0.6, key: [-250, 420, 360], keyI: 1.5, fillI: 0.9, rimI: 0.35 });
  const { THREE: T, scene, renderer } = st;
  const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
  st.keyL.shadow.camera.left = -260; st.keyL.shadow.camera.right = 260; st.keyL.shadow.camera.top = 260; st.keyL.shadow.camera.bottom = -260; st.keyL.shadow.camera.far = 2000; st.keyL.shadow.camera.updateProjectionMatrix();
  const wood = (base, dark, seed) => kit.canvasTex(T, renderer, kit.canvas(512, 256, (c, w, h) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    const r = kit.rng(seed);
    for (let k = 0; k < 70; k++) { const y = r() * h, a = 1.2 + r() * 2.2; c.strokeStyle = `rgba(${dark},${0.12 + r() * 0.18})`; c.lineWidth = 0.8 + r() * 1.6; c.beginPath(); for (let x = 0; x <= w; x += 8) { const yy = y + Math.sin(x / 40 + k) * a + Math.sin(x / 9 + k * 2) * 0.5; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); }
  }), { repeat: [1, 1] });
  // 나무판(긴 판)과 나무 도막(월드 = 화면 px 근처, 판 윗면 y=60)
  const BOARD_Y = 60;
  const board = new T.Mesh(new RoundedBoxGeometry(300, 12, 70, 3, 2), new T.MeshStandardMaterial({ map: wood("#D9B07A", "120,80,40", 3), roughness: 0.75 }));
  board.position.set(0, BOARD_Y - 6, 0); board.receiveShadow = true; board.castShadow = true; scene.add(board);
  const block = new T.Mesh(new RoundedBoxGeometry(84, 44, 46, 3, 2), new T.MeshStandardMaterial({ map: wood("#B9824E", "80,45,20", 7), roughness: 0.7 }));
  const BX = -40; block.position.set(BX, BOARD_Y + 22, 0); block.castShadow = true; block.receiveShadow = true; scene.add(block);
  // 고리와 줄, 힘 센서(오른쪽)
  const metal = new T.MeshPhysicalMaterial({ color: 0x9aa1aa, metalness: 0.9, roughness: 0.3 });
  const hook = new T.Mesh(new T.TorusGeometry(3.2, 0.9, 8, 24), metal); hook.position.set(BX + 44, BOARD_Y + 22, 0); hook.rotation.y = Math.PI / 2; scene.add(hook);
  const string = new T.Mesh(new T.CylinderGeometry(0.6, 0.6, 70, 8), new T.MeshStandardMaterial({ color: 0xece3d0, roughness: 0.9 })); string.rotation.z = Math.PI / 2; string.position.set(BX + 82, BOARD_Y + 22, 0); scene.add(string);
  const sensor = new T.Mesh(new RoundedBoxGeometry(46, 22, 20, 3, 4), new T.MeshPhysicalMaterial({ color: 0x2b6fd6, roughness: 0.4, clearcoat: 0.6 })); sensor.position.set(BX + 140, BOARD_Y + 22, 0); sensor.castShadow = true; scene.add(sensor);
  const screen = new T.Mesh(new T.BoxGeometry(22, 10, 1), new T.MeshStandardMaterial({ color: 0xd8f5e3, emissive: 0x3a7a55, emissiveIntensity: 0.25 })); screen.position.set(BX + 142, BOARD_Y + 24, 10.4); scene.add(screen);
  const sHook = new T.Mesh(new T.CylinderGeometry(1, 1, 8, 8), metal); sHook.rotation.z = Math.PI / 2; sHook.position.set(BX + 113, BOARD_Y + 22, 0); scene.add(sHook);
  kit.shadowCatcher(T, scene, { y: BOARD_Y - 12.5, size: 900, opacity: 0.1 });
  await kit.renderIllus(st, { radius: 5, thickness: 5, edgeK: 0.3 });
  await kit.frame();

  const svg = kit.layer(root, W, H);
  const P = (x, y, z = 23) => st.project([x, y, z]);
  // 힘: 끄는 힘(파랑, 줄을 맨 점에서 오른쪽), 마찰력(빨강, 맞닿은 면에서 왼쪽). 움직이기 전이라 길이가 같다.
  const F = 44;
  const pull = P(BX + 44, BOARD_Y + 22), fr = P(BX + 6, BOARD_Y);
  kit.flowArrow(svg, `M${pull[0] + 2} ${pull[1] - 14} L${pull[0] + 2 + F} ${pull[1] - 14}`, { w: 4, head: 10, hw: 2.4, fill: "#1C7ED6" });
  svg.appendChild(kit.s("path", { d: `M${pull[0] + 2} ${pull[1] - 14} V${pull[1] - 2}`, stroke: "#1C7ED6", "stroke-width": 1, "stroke-dasharray": "2 2" }));
  kit.flowArrow(svg, `M${fr[0]} ${fr[1] + 1} L${fr[0] - F} ${fr[1] + 1}`, { w: 4, head: 10, hw: 2.4, fill: "#E03131" });
  kit.text(svg, pull[0] + 2 + F / 2, pull[1] - 27, "끄는 힘", { size: 13, weight: 800, color: "#1C7ED6" });
  kit.text(svg, fr[0] - F / 2 - 4, fr[1] + 16, "마찰력", { size: 13, weight: 800, color: "#C92A2A" });
  const bl = P(BX - 30, BOARD_Y + 40), bd = P(-130, BOARD_Y - 4);
  kit.label(svg, { at: bl, via: [bl[0] - 20, 22], to: [bl[0] - 24, 22], text: "나무 도막", side: "l", size: 12.5 });
  kit.label(svg, { at: bd, via: [bd[0] + 4, bd[1] + 30], to: [bd[0] + 8, bd[1] + 30], text: "나무판", side: "r", size: 12.5 });
  const sn = P(BX + 140, BOARD_Y + 34);
  kit.text(svg, sn[0], sn[1] - 12, "힘 센서", { size: 12, weight: 700, color: "#3B4456" });
  // 돋보기(맞닿은 면 한 곳)와 큰 확대 창
  const mg = P(BX + 22, BOARD_Y);
  svg.appendChild(kit.s("circle", { cx: mg[0], cy: mg[1], r: 9, fill: "none", stroke: "#2B3445", "stroke-width": 1.6 }));
  const CX = 170, CY = 232, R = 74;
  svg.appendChild(kit.s("path", { d: `M${mg[0] - 8} ${mg[1] + 4} L${CX - R * 0.86} ${CY - R * 0.5} M${mg[0] + 8} ${mg[1] + 4} L${CX + R * 0.86} ${CY - R * 0.5}`, stroke: "#8A93A3", "stroke-width": 1 }));
  const clip = kit.id("mc"); svg.defs.appendChild(kit.s("clipPath", { id: clip }, kit.s("circle", { cx: CX, cy: CY, r: R })));
  const g = kit.s("g", { "clip-path": `url(#${clip})` }); svg.appendChild(g);
  g.appendChild(kit.s("rect", { x: CX - R, y: CY - R, width: 2 * R, height: 2 * R, fill: "#FFFFFF" }));
  // 울퉁불퉁한 두 면: 불규칙한 돌기(같은 모양 반복 금지). 위 = 도막 아랫면, 아래 = 판 윗면. 몇 곳에서만 닿는다.
  // 울퉁불퉁한 두 면: 매끈한 무작위 굴곡(같은 모양 반복 없음). 위 = 도막 아랫면(돌기가 아래로), 아래 = 판 윗면(돌기가 위로).
  // 도막을 판 위에 내려놓듯 위 면을 아래로 옮겨 가장 높은 돌기끼리 닿게 하고, 아주 가까운 곳(1.8px 안)만 맞닿은 곳으로 본다.
  const r = kit.rng(23), N = 120, x0 = CX - R - 4, x1 = CX + R + 4, mid = CY + 4;
  const xs = Array.from({ length: N + 1 }, (_, i) => x0 + (i / N) * (x1 - x0));
  // 가장자리로 갈수록 굴곡을 줄여(창 둘레에서 잘리는 곳) 맞닿는 곳이 창 가운데 쪽에 생기게 한다
  const win = (i) => { const t = (xs[i] - CX) / (R + 4); return Math.max(0.25, 1 - t * t); };
  const bump = (i, seed) => ((kit.fbm(i / 11, seed, 3, seed) - 0.5) * 2 * 18 + (kit.noise2(i / 3.5, seed * 3, seed) - 0.5) * 5) * win(i);
  const topEdge = xs.map((x, i) => mid - 8 + bump(i, 5));
  const botEdge = xs.map((x, i) => mid + 8 - bump(i, 9));
  const central = (i) => Math.abs(xs[i] - CX) < R * 0.68; // 창 안쪽 가운데만 맞닿는 곳을 찾는다(둘레는 잘려 보이지 않음)
  let gapMin = Infinity; xs.forEach((x, i) => { if (central(i)) gapMin = Math.min(gapMin, botEdge[i] - topEdge[i]); });
  for (let i = 0; i <= N; i++) topEdge[i] += gapMin; // 내려놓기: 가장 가까운 곳에서 꼭 닿는다
  let thr = 1.8, groups = [];
  for (let tries = 0; tries < 16; tries++) {
    const idx = []; for (let i = 0; i <= N; i++) if (central(i) && botEdge[i] - topEdge[i] < thr) idx.push(i);
    groups = []; for (const i of idx) { const last = groups[groups.length - 1]; if (last && i - last[last.length - 1] <= 2) last.push(i); else groups.push([i]); }
    if (groups.length >= 3) break; thr += 0.7;
  }
  for (const grp of groups) for (const i of grp) { const yy = (topEdge[i] + botEdge[i]) / 2; topEdge[i] = yy; botEdge[i] = yy; }
  for (let i = 0; i <= N; i++) if (!central(i) && botEdge[i] - topEdge[i] < 4) topEdge[i] = botEdge[i] - 4; // 둘레 쪽은 겹치지 않게만
  const contactsXY = groups.map((grp) => { const i = grp[Math.floor(grp.length / 2)]; return [xs[i], topEdge[i]]; });
  const smooth = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const upPath = `M${x0} ${CY - R - 4} L${x1} ${CY - R - 4} ` + smooth(xs.map((x, i) => [x, topEdge[i]]).reverse()).replace("M", "L") + " Z";
  const dnPath = `M${x0} ${CY + R + 4} L${x1} ${CY + R + 4} ` + smooth(xs.map((x, i) => [x, botEdge[i]]).reverse()).replace("M", "L") + " Z";
  g.appendChild(kit.s("path", { d: upPath, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#C99366"], [1, "#9A6338"]]) }));
  g.appendChild(kit.s("path", { d: dnPath, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#E7C595"], [1, "#C79A62"]]) }));
  // 나뭇결 몇 줄
  for (let k = 0; k < 6; k++) { const y = CY - R + 10 + k * 9; g.appendChild(kit.s("path", { d: `M${x0} ${y} q ${R} ${(r() - 0.5) * 6} ${2 * R + 8} 0`, fill: "none", stroke: "#7E4E28", "stroke-width": 0.8, opacity: 0.35 })); }
  for (let k = 0; k < 6; k++) { const y = CY + 28 + k * 9; g.appendChild(kit.s("path", { d: `M${x0} ${y} q ${R} ${(r() - 0.5) * 6} ${2 * R + 8} 0`, fill: "none", stroke: "#9A6A35", "stroke-width": 0.8, opacity: 0.35 })); }
  // 닿은 곳마다 작은 빨간 화살표(왼쪽)
  for (const c of contactsXY) kit.flowArrow(g, `M${c[0] + 7} ${c[1]} L${c[0] - 10} ${c[1]}`, { w: 2.2, head: 5.5, hw: 2.2, fill: "#E03131" });
  svg.appendChild(kit.s("circle", { cx: CX, cy: CY, r: R, fill: "none", stroke: "#2B3445", "stroke-width": 1.8 }));
  kit.text(svg, CX - R - 6, CY - R + 14, "크게 확대한 모습", { size: 12.5, weight: 800, anchor: "end" });
  kit.text(svg, CX + R + 4, CY - 36, "도막 아랫면", { size: 12, weight: 700, color: "#7E4E28", anchor: "start" });
  kit.text(svg, CX + R + 4, CY + 40, "판 윗면", { size: 12, weight: 700, color: "#9A6A35", anchor: "start" });
  if (contactsXY.length) { const c = contactsXY.reduce((a, b) => (b[0] > a[0] ? b : a)); kit.label(svg, { at: [c[0] + 1, c[1] - 1], via: [CX + R + 2, CY + 6], to: [CX + R + 6, CY + 6], text: "맞닿은 곳", side: "r", size: 12 }); }
  console.log("proj", JSON.stringify({ contacts: contactsXY.length, pull, fr, mg }));
}
