// u5l7f1 · 힘과 운동: 나뭇가지에 매달린 사과(두 힘의 평형, 멈춰 있다)와 가지에서 떨어진 사과(중력만, 점점 빨라진다).
// 검산 메모: u5l7f1.md. 화살표 색은 Ⅴ단원 약속(중력 빨강, 떠받치는 힘과 운동 방향 초록). 힘 화살표는 사과 가운데 점에서 나간다.
// (나) 같은 시간 간격 t = 1, 2, 3, 4의 자리: 놓은 높이에서 떨어진 거리 K·t²(1 : 4 : 9 : 16, 자리 사이 간격 1 : 3 : 5 : 7),
// 빠르기는 t에 비례(초록 화살표 길이 1 : 2 : 3 : 4), 중력은 자리마다 같은 길이. 공기 저항은 무시.
export const meta = { key: "u5l7f1", w: 340, h: 306, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 0, 600], look: [0, 0, 0], envIntensity: 0.6, key: [-250, 420, 360], keyI: 1.5, fillI: 0.9, rimI: 0.35, shadows: false });
  const { THREE: T, scene, renderer } = st;
  const at = (x, y, z = 0) => new T.Vector3(x - W / 2, H / 2 - y, z);

  // ── 자리(화면 px) ──
  const BY = 40;          // 나뭇가지 높이
  const AR = 11;          // 사과 반지름
  const HANG = [58, 76];  // (가) 매달린 사과 가운데
  const XF = 212, Y0 = 76, K = 11; // (나) 떨어지는 사과의 세로줄, 놓은 높이(매달려 있던 가운데), 떨어진 거리 계수
  const FALL = [1, 2, 3, 4].map((t) => [XF, Y0 + K * t * t, t]);
  const F = 20;           // 힘 화살표 길이(중력, 당기는 힘 모두 같은 길이)
  const VS = 9;           // 운동 방향 화살표 길이 = VS · t
  // 검산: 간격 1 : 3 : 5 : 7, 중력 화살표 끝이 다음 사과에 닿지 않는다
  const gaps = FALL.map(([, y], i) => y - (i ? FALL[i - 1][1] : Y0));
  FALL.slice(0, -1).forEach(([, y], i) => { if (y + F + 1.5 > FALL[i + 1][1] - AR) throw new Error(`중력 화살표가 다음 사과에 닿음: ${i + 1}`); });
  console.log("placed", JSON.stringify({ gaps, ratio: gaps.map((g) => +(g / gaps[0]).toFixed(2)), v: FALL.map(([, , t]) => VS * t) }));

  // ── 나뭇가지(왼쪽 끝에서 오른쪽 끝까지, 조금 굽음)와 잎 ──
  const barkTex = kit.canvasTex(T, renderer, kit.canvas(256, 64, (c, w, h) => {
    const img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = kit.fbm(x / 30, y / 4, 3, 7), v = 0.85 + (n - 0.5) * 0.4; const i = (y * w + x) * 4; img.data[i] = 128 * v; img.data[i + 1] = 88 * v; img.data[i + 2] = 58 * v; img.data[i + 3] = 255; }
    c.putImageData(img, 0, 0);
  }), { repeat: [8, 1] });
  const barkM = new T.MeshStandardMaterial({ map: barkTex, roughness: 0.85 });
  const bpts = [[-12, BY - 3], [60, BY + 1], [130, BY - 2], [212, BY + 1], [290, BY - 1], [352, BY - 4]].map(([x, y]) => at(x, y, -6));
  const branch = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(bpts), 120, 3.4, 12, false), barkM); scene.add(branch);
  const twig = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([at(150, BY - 1, -6), at(162, BY - 12, -6), at(172, BY - 18, -6)]), 20, 1.6, 8, false), barkM); scene.add(twig);
  const leafM = new T.MeshPhysicalMaterial({ color: 0x5b9a3a, roughness: 0.5, clearcoat: 0.4, side: T.DoubleSide });
  const leaf = (x, y, ang, s = 1) => {
    const g = new T.SphereGeometry(1, 24, 12); g.scale(9 * s, 3.6 * s, 1.4);
    const m = new T.Mesh(g, leafM); m.position.copy(at(x, y, -4)); m.rotation.z = ang; scene.add(m);
  };
  // 잎은 사과, 화살표, 글자와 떨어진 자리에만(초록 화살표와 헷갈리지 않게 가지 위쪽으로)
  leaf(16, BY - 8, 0.6); leaf(104, BY - 9, -0.5, 0.9); leaf(176, BY - 22, 0.9, 0.85); leaf(300, BY - 9, -0.6); leaf(328, BY - 7, 0.5, 0.85);

  // ── 사과(회전체: 위아래가 조금 오목) ──
  const prof = [];
  for (let i = 0; i <= 48; i++) {
    const ph = Math.PI - (i / 48) * Math.PI; // 아래 극 → 위 극(바깥 법선)
    let x = AR * Math.sin(ph) * (1 + 0.06 * Math.sin(ph)), y = AR * Math.cos(ph) * 0.92;
    y -= 2.6 * Math.exp(-((ph / 0.42) ** 2)) - 1.6 * Math.exp(-(((Math.PI - ph) / 0.42) ** 2)); // 꼭지 자리와 아래쪽 오목
    prof.push(new T.Vector2(Math.max(0, x), y));
  }
  const appleG = new T.LatheGeometry(prof, 48);
  const appleTex = kit.canvasTex(T, renderer, kit.canvas(256, 128, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#C81E2E"); g.addColorStop(0.55, "#D7263D"); g.addColorStop(1, "#B51A2A");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = kit.rng(5);
    for (let k = 0; k < 90; k++) { const x = r() * w, y = r() * h; c.strokeStyle = `rgba(255,${180 + r() * 60},120,${0.12 + r() * 0.12})`; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 6, y + 8 + r() * 10); c.stroke(); }
  }));
  const stemM = new T.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.8 });
  const apple = (x, y, fade, stemLen) => {
    const m = new T.MeshPhysicalMaterial({ map: appleTex, roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2, sheen: 0.3, sheenColor: 0xffd7c8 });
    m.color.setRGB(1, 1, 1).lerp(new T.Color(0xffffff), 0); if (fade > 0) { m.transparent = false; m.color = new T.Color(1, 1, 1); m.emissive = new T.Color(0xffffff); m.emissiveIntensity = fade * 0.55; }
    const a = new T.Mesh(appleG, m); a.position.copy(at(x, y, 0)); a.rotation.x = 0.25; scene.add(a);
    const sl = stemLen ?? 7;
    const stem = new T.Mesh(new T.CylinderGeometry(0.9, 1.1, sl, 8), stemM.clone()); stem.position.copy(at(x + 0.6, y - AR * 0.85 - sl / 2 + 2.2, 0)); stem.rotation.z = -0.12; scene.add(stem);
    if (fade > 0) { stem.material.emissive = new T.Color(0xffffff); stem.material.emissiveIntensity = fade * 0.5; }
  };
  // (가) 매달린 사과: 꼭지가 가지까지 이어진다
  apple(HANG[0], HANG[1], 0, HANG[1] - AR * 0.85 - BY + 2);
  // (나) 가지에 남은 꼭지 자리(부러진 꼭지)와 떨어지는 사과 넷(앞선 자리일수록 옅게)
  { const stub = new T.Mesh(new T.CylinderGeometry(0.9, 1.2, 9, 8), stemM); stub.position.copy(at(XF + 0.6, BY + 6, 0)); scene.add(stub); }
  FALL.forEach(([x, y], k) => apple(x, y, 0.42 - k * 0.14, 6));

  await kit.renderIllus(st, { ao: false, edgeK: 0.28 });
  await kit.frame();

  const svg = kit.layer(root, W, H);
  // 땅(풀밭 띠)과 두 칸 사이 점선
  const GYs = H - 13;
  svg.appendChild(kit.s("rect", { x: 0, y: GYs, width: W, height: H - GYs, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#9BD27A"], [1, "#5FA344"]]) }));
  svg.appendChild(kit.s("path", { d: `M0 ${GYs} H${W}`, stroke: "#4E8F37", "stroke-width": 1.4 }));
  const DIV = 140;
  svg.appendChild(kit.s("path", { d: `M${DIV} ${BY + 18} V${GYs - 6}`, stroke: "#C9CFD9", "stroke-width": 1.2, "stroke-dasharray": "3 4" }));

  const dot = (x, y) => svg.appendChild(kit.s("circle", { cx: x, cy: y, r: 2.7, fill: "#FFFFFF", stroke: "#2B3445", "stroke-width": 1.3 }));
  const GREEN = "#2B8A3E", RED = "#E03131";
  // (가) 가지가 당기는 힘(위)과 중력(아래): 같은 길이, 반대 방향, 한 세로선 위
  kit.flowArrow(svg, `M${HANG[0]} ${HANG[1]} L${HANG[0]} ${HANG[1] - F}`, { w: 3.4, head: 8.5, hw: 2.4, fill: GREEN });
  kit.flowArrow(svg, `M${HANG[0]} ${HANG[1]} L${HANG[0]} ${HANG[1] + F}`, { w: 3.4, head: 8.5, hw: 2.4, fill: RED });
  dot(HANG[0], HANG[1]);
  kit.text(svg, HANG[0] + 12, HANG[1] - 30, "나뭇가지가", { size: 12.5, weight: 800, color: GREEN, anchor: "start" });
  kit.text(svg, HANG[0] + 12, HANG[1] - 15, "당기는 힘", { size: 12.5, weight: 800, color: GREEN, anchor: "start" });
  kit.text(svg, HANG[0] + 10, HANG[1] + F - 3, "중력", { size: 12.5, weight: 800, color: "#C92A2A", anchor: "start" });
  kit.text(svg, 8, 134, "(가) 매달린 사과", { size: 13.5, weight: 800, anchor: "start" });
  kit.text(svg, 8, 151, "두 힘이 평형이라", { size: 12.5, weight: 600, color: "#5B6475", anchor: "start" });
  kit.text(svg, 8, 167, "멈춰 있어요", { size: 12.5, weight: 600, color: "#5B6475", anchor: "start" });

  // (나) 자리마다 중력(가운데에서 아래로, 같은 길이)과 운동 방향(오른쪽 곁에서 아래로, 점점 길게)
  FALL.forEach(([x, y, t], k) => {
    kit.flowArrow(svg, `M${x + 20} ${y} L${x + 20} ${y + VS * t}`, { w: 3.0, head: Math.min(8, VS * t * 0.7), hw: 2.4, fill: GREEN });
    kit.flowArrow(svg, `M${x} ${y} L${x} ${y + F}`, { w: 3.2, head: 8, hw: 2.4, fill: RED });
    dot(x, y);
  });
  const last = FALL[3];
  kit.text(svg, last[0] - 10, last[1] + F - 3, "중력", { size: 12.5, weight: 800, color: "#C92A2A", anchor: "end" });
  kit.text(svg, last[0] + 28, last[1] + VS * 4 - 12, "운동 방향", { size: 12.5, weight: 800, color: GREEN, anchor: "start" });
  kit.text(svg, W - 6, BY + 24, "(나) 떨어지는 사과", { size: 13.5, weight: 800, anchor: "end" });
  kit.text(svg, W - 6, BY + 41, "중력만 작용해", { size: 12.5, weight: 600, color: "#5B6475", anchor: "end" });
  kit.text(svg, W - 6, BY + 57, "점점 빨라져요", { size: 12.5, weight: 600, color: "#5B6475", anchor: "end" });
  // 같은 시간 간격 표시: 사과 줄 왼쪽의 눈금자(놓은 높이부터 자리마다 눈금, 간격이 점점 커진다)와 자리를 잇는 점선
  const RX = 168;
  let prev = Y0;
  FALL.forEach(([, y], k) => { svg.appendChild(kit.s("path", { d: `M${RX} ${prev} V${y}`, stroke: k % 2 ? "#9AA5B5" : "#5B6475", "stroke-width": 3, "stroke-linecap": "butt" })); prev = y; });
  for (const y of [Y0, ...FALL.map((p) => p[1])]) svg.appendChild(kit.s("path", { d: `M${RX - 4} ${y} H${RX + 4}`, stroke: "#5B6475", "stroke-width": 1.2 }));
  FALL.forEach(([x, y]) => svg.appendChild(kit.s("path", { d: `M${RX + 6} ${y} H${x - AR - 3}`, stroke: "#C9CFD9", "stroke-width": 0.9, "stroke-dasharray": "2 3" })));
  const ny = (FALL[1][1] + FALL[2][1]) / 2;
  kit.text(svg, W - 6, ny - 8, "같은 시간마다", { size: 12, weight: 600, color: "#5B6475", anchor: "end" });
  kit.text(svg, W - 6, ny + 8, "더 많이 떨어져요", { size: 12, weight: 600, color: "#5B6475", anchor: "end" });
}
