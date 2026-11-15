// u7l5f1 · 달의 위상 변화: 북극 위에서 내려다본 지구와 달의 길, 길 위 여덟 자리의 달, 자리마다 지구에서 보이는 모양.
// 검산 메모: u7l5f1.md. 천체 겉모습은 그리지 않고 실사 질감(public/textures, Solar System Scope CC BY 4.0)을 공에 입혀 빛으로 비춘다.
// 바깥 고리의 모양도 그리지 않고 계산한다: 자리 E(삭에서 시계 반대로 잰 각)마다 달 공을 지구 쪽에서 보고, 태양 쪽 빛을 그 방향에서 비춘다.
export const meta = { key: "u7l5f1", w: 340, h: 372, scale: 3, quality: 88, bg: "#0B1426" };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const CX = 153, CY = 186; // 지구 중심(화면)
  const RO = 82;            // 달이 도는 길의 반지름(px)
  const RP = 128;           // 바깥 모양의 자리(px)
  const DM = 15;            // 길 위 달 지름
  const DP = 40;            // 바깥 모양 지름
  const DE = 50;            // 지구 지름(실제 비율 아님)

  // ── 바탕: 짙은 남색 하늘과 옅은 별 ──
  const bg = kit.layer(root, W, H);
  bg.appendChild(kit.s("rect", { width: W, height: H, fill: kit.rad(bg, 0.42, 0.5, 0.75, [[0, "#14254A"], [1, "#09111F"]]) }));
  const rs = kit.rng(77);
  for (let i = 0; i < 110; i++) {
    const x = rs() * W, y = rs() * H, r = rs() < 0.9 ? 0.45 + rs() * 0.4 : 0.9 + rs() * 0.5;
    if (Math.hypot(x - CX, y - CY) < RP + DP * 0.6 && Math.hypot(x - CX, y - CY) > RO - 6 && false) continue;
    bg.appendChild(kit.s("circle", { cx: x, cy: y, r, fill: "#FFFFFF", opacity: 0.25 + rs() * 0.45 }));
  }

  // ── 지구와 길 위의 달(위에서 내려다본 입체) ──
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [W / 2 - CX, 500, H / 2 - CY], look: [W / 2 - CX, 0, H / 2 - CY], env: false, key: [100, 0, 0], keyI: 3.1, fillI: 0.0, rimI: 0.0, shadows: false });
  const { THREE: T, scene, camera, renderer } = st;
  camera.up.set(0, 0, -1); camera.lookAt(W / 2 - CX, 0, H / 2 - CY); camera.updateProjectionMatrix();
  scene.add(new T.AmbientLight(0x8fa6d6, 0.07)); // 밤 쪽이 바탕과 구분될 만큼만
  const [earthTex, moonTex] = await Promise.all([kit.loadTex(T, "/public/textures/earth.jpg"), kit.loadTex(T, "/public/textures/moon.jpg")]);
  for (const t of [earthTex, moonTex]) t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  // 지구: 북극이 +Y(카메라 쪽). 경도는 위에서 볼 때 시계 반대로 커진다(SphereGeometry 기본 배치, 거울상 아님).
  const earth = new T.Mesh(new T.SphereGeometry(DE / 2, 96, 64), new T.MeshStandardMaterial({ map: earthTex, roughness: 0.85 }));
  earth.rotation.y = 1.9; // 그린란드와 북아메리카가 위에서 보이게 돌린 각(돌리기만 하고 뒤집지 않는다)
  scene.add(earth);
  // 길 위의 달 여덟: 자리 E에서 (cos E, 0, -sin E)·RO. 앞면(질감 가운데, 기본 +X)이 지구를 향하게.
  const moonGeo = new T.SphereGeometry(DM / 2, 64, 40);
  const moonMat = new T.MeshStandardMaterial({ map: moonTex, roughness: 1 });
  const E8 = [0, 45, 90, 135, 180, 225, 270, 315].map((d) => (d * Math.PI) / 180);
  for (const E of E8) {
    const m = new T.Mesh(moonGeo, moonMat);
    m.position.set(Math.cos(E) * RO, 0, -Math.sin(E) * RO);
    m.rotation.y = E + Math.PI;
    scene.add(m);
  }
  st.render();
  await kit.frame();

  // ── 지구에서 본 모양 여덟(따로 그려 붙인다) ──
  const pr = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  const PX = Math.round(DP * window.devicePixelRatio * 1.0);
  pr.setPixelRatio(1); pr.setSize(PX, PX); pr.outputColorSpace = T.SRGBColorSpace;
  const ps = new T.Scene();
  const pc = new T.OrthographicCamera(-1.02, 1.02, 1.02, -1.02, 0.1, 50); pc.position.set(0, 0, 10); pc.lookAt(0, 0, 0);
  const pm = new T.Mesh(new T.SphereGeometry(1, 128, 96), new T.MeshStandardMaterial({ map: moonTex, roughness: 1 }));
  pm.rotation.y = -Math.PI / 2; // 앞면이 카메라(+Z) 쪽, 북쪽이 위
  ps.add(pm);
  const sun = new T.DirectionalLight(0xffffff, 3.2); ps.add(sun); ps.add(sun.target);
  const amb = new T.AmbientLight(0xaabbdd, 0.035); ps.add(amb);
  const phaseImg = (E) => {
    // 관측자 틀: 오른쪽 = (sin E, -cos E)(지면 좌표), 위 = 북쪽. 태양 방향의 성분: 오른쪽 sin E, 카메라 쪽 -cos E.
    sun.position.set(Math.sin(E) * 10, 0, -Math.cos(E) * 10);
    pr.render(ps, pc);
    return pr.domElement.toDataURL("image/png");
  };
  const fg = kit.layer(root, W, H);
  const dots = [];
  E8.forEach((E, i) => {
    const x = CX + Math.cos(E) * RP, y = CY - Math.sin(E) * RP;
    if (i === 0) {
      // 삭: 보이지 않는다. 자리만 점선 원으로
      fg.appendChild(kit.s("circle", { cx: x, cy: y, r: DP / 2 - 0.6, fill: "#0E1830", stroke: "#AFC0E0", "stroke-width": 1, "stroke-dasharray": "2.4 2.6", opacity: 0.9 }));
    } else {
      fg.appendChild(kit.s("image", { href: phaseImg(E), x: x - DP / 2, y: y - DP / 2, width: DP, height: DP }));
    }
    dots.push([x, y]);
  });
  pr.dispose();

  // ── 달이 도는 길(시계 반대 화살촉) ──
  const path = kit.s("circle", { cx: CX, cy: CY, r: RO, fill: "none", stroke: "#7FB0FF", "stroke-width": 1.3, opacity: 0.85 });
  bg.appendChild(path);
  // 화살촉: 두 달 사이(22.5° + 45°·k)마다 시계 반대 방향을 가리킨다
  for (let k = 0; k < 8; k++) {
    const a = ((22.5 + 45 * k) * Math.PI) / 180;
    const x = CX + Math.cos(a) * RO, y = CY - Math.sin(a) * RO;
    const tx = -Math.sin(a), ty = -Math.cos(a); // 화면에서 시계 반대 진행 방향(각이 커지는 쪽)
    const nx = Math.cos(a), ny = -Math.sin(a);
    const L = 6.5, Wd = 3.6;
    const tip = [x + tx * L / 2, y + ty * L / 2], b1 = [x - tx * L / 2 + nx * Wd, y - ty * L / 2 + ny * Wd], b2 = [x - tx * L / 2 - nx * Wd, y - ty * L / 2 - ny * Wd];
    bg.appendChild(kit.s("path", { d: `M${tip[0]} ${tip[1]} L${b1[0]} ${b1[1]} L${b2[0]} ${b2[1]} Z`, fill: "#9CC2FF" }));
  }

  // ── 햇빛 화살표 ──
  // 오른쪽 끝에서 왼쪽으로 나란히(평행한 햇빛). 가운데 둘은 삭 자리 위아래로 비껴 지나간다.
  const glow = kit.blurFilter(fg, 2.2);
  for (const y of [46, CY - 33, CY + 33, H - 30]) {
    const g = kit.flowArrow(fg, `M${W - 3} ${y} L${W - 33} ${y}`, { w: 5.5, head: 10, hw: 2.0, fill: "#FFB938", opacity: 0.55 });
    g.setAttribute("filter", glow);
    kit.flowArrow(fg, `M${W - 3} ${y} L${W - 33} ${y}`, { w: 3.0, head: 9, hw: 2.3, fill: "#FFD06A" });
  }
  kit.text(fg, W - 20, 22, "햇빛", { size: 13, weight: 800, color: "#FFD58A", halo: false });

  // ── 이름표 ──
  const LBL = "#F3F6FF", SUB = "#BFD0EE";
  const lab = (x, y, t, anchor = "middle", sub) => {
    kit.text(fg, x, y, t, { size: 13, weight: 800, color: LBL, anchor, halo: false });
    if (sub) kit.text(fg, x, y + 15, sub, { size: 12, weight: 600, color: SUB, anchor, halo: false });
  };
  const [p0, p1, p2, p3, p4, p5, p6, p7] = dots;
  lab(p0[0], p0[1] + DP / 2 + 12, "삭");
  lab(p1[0] + DP / 2 + 3, p1[1] - DP / 2 + 2, "초승달", "start");
  lab(p2[0] + DP / 2 + 6, p2[1], "상현달", "start");
  lab(p4[0], p4[1] + DP / 2 + 12, "망", "middle", "보름달");
  lab(p6[0] + DP / 2 + 6, p6[1], "하현달", "start");
  lab(p7[0] + DP / 2 + 3, p7[1] + DP / 2 - 2, "그믐달", "start");
  void p3; void p5;
  kit.text(fg, CX, CY + DE / 2 + 11, "지구", { size: 12.5, weight: 800, color: LBL, halo: false });
  // 달이 도는 길: 왼쪽 위 길 바깥에 지시선 없이
  kit.text(fg, CX, CY - 52, "달이 도는 길", { size: 12, weight: 700, color: "#A9C7FF", halo: false });
  kit.text(fg, 6, H - 12, "바깥 동그라미: 지구에서 본 달의 모양", { size: 12, weight: 600, color: SUB, anchor: "start", halo: false });
}
