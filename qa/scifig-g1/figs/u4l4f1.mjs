// u4l4f1 · 상태 변화와 입자 배열: 한 물질의 세 상태를 입자 창 셋으로, 여섯 가지 상태 변화를 화살표로.
// 검산 메모: u4l4f1.md. 창의 넓이가 곧 부피(같은 입자 19개가 차지하는 자리). 입자 수와 크기는 세 창이 같다.
export const meta = { key: "u4l4f1", w: 340, h: 346, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [W / 2, -H / 2, 400], look: [W / 2, -H / 2, 0], envIntensity: 0.9, key: [-160, 260, 300], keyI: 1.5, fillI: 0.9, rimI: 0.25, shadows: false });
  const { THREE: T, scene, renderer } = st;
  const at = (x, y, z = 0) => new T.Vector3(x, -y, z);

  const PR = 6.4; // 입자 반지름(px)
  const N = 19;
  const COL = 0x8f80f5; // Ⅳ 입자 색(#9B8CFF 계열)을 조금 짙게: 흰 창 위에서 또렷하게

  // ── 세 창(중심, 반지름) ──
  const SOL = { x: 192, y: 296, R: 37 }, LIQ = { x: 54, y: 214, R: 42 }, GAS = { x: 243, y: 105, R: 94 };

  // 고체: 육각 촘촘 쌓기 3, 4, 5, 4, 3 (가지런한 배열, 이웃과 거의 닿음)
  const d = PR * 2 * 1.03;
  const solid = [];
  [3, 4, 5, 4, 3].forEach((n, row) => {
    for (let i = 0; i < n; i++) solid.push([SOL.x + (i - (n - 1) / 2) * d, SOL.y + (row - 2) * d * Math.sqrt(3) / 2]);
  });
  // 액체: 이웃과 닿을 만큼 가깝지만 줄이 없다. 새 입자를 이미 놓인 입자 둘레에 닿게 무작위로 붙이며 키운다
  // (후보 여럿 가운데 가운데에 가까운 것을 고르되 조금씩 흔들어 육각 격자로 굳지 않게 한다).
  const r1 = kit.rng(17);
  const liquid = [[LIQ.x + 1.5, LIQ.y - 1]];
  const touch = PR * 2 * 1.03;
  for (let guard = 0; liquid.length < N && guard < 5000; guard++) {
    let best = null, bestD = 1e9;
    for (let c = 0; c < 26; c++) {
      const base = liquid[Math.floor(r1() * liquid.length)], ang = r1() * Math.PI * 2;
      const p = [base[0] + Math.cos(ang) * touch, base[1] + Math.sin(ang) * touch];
      if (Math.hypot(p[0] - LIQ.x, p[1] - LIQ.y) > LIQ.R - PR - 2) continue;
      if (!liquid.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) >= touch - 0.01)) continue;
      const dc = Math.hypot(p[0] - LIQ.x, p[1] - LIQ.y) + r1() * 9;
      if (dc < bestD) { bestD = dc; best = p; }
    }
    if (best) liquid.push(best);
  }
  // 기체: 서로 멀리, 닿지 않게(최소 간격 29px)
  const r2 = kit.rng(29);
  const gas = [];
  for (let t = 0; t < 20000 && gas.length < N; t++) {
    const a = r2() * Math.PI * 2, rr = Math.sqrt(r2()) * (GAS.R - 14), p = [GAS.x + Math.cos(a) * rr, GAS.y + Math.sin(a) * rr];
    if (gas.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 29)) gas.push(p);
  }
  if (gas.length !== N || solid.length !== N || liquid.length !== N) throw new Error(`입자 수 ${solid.length}/${liquid.length}/${gas.length}`);

  // ── 창: 옅은 바탕(가운데가 밝고 테두리로 갈수록 살짝 짙음) + 유리 테 ──
  const winTex = kit.canvasTex(T, renderer, kit.canvas(512, 512, (c, w, h) => {
    const g = c.createRadialGradient(w * 0.42, h * 0.38, 8, w / 2, h / 2, w / 2);
    g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.62, "#F4F2FF"); g.addColorStop(0.9, "#E4E0FA"); g.addColorStop(1, "#D9D3F6");
    c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); c.fill();
  }));
  const winMat = new T.MeshBasicMaterial({ map: winTex, transparent: true });
  const rimMat = new T.MeshPhysicalMaterial({ color: 0xe9e6ff, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1, metalness: 0.0, sheen: 0.5, sheenColor: 0xffffff });
  for (const w of [SOL, LIQ, GAS]) {
    const disc = new T.Mesh(new T.CircleGeometry(w.R, 128), winMat);
    disc.position.copy(at(w.x, w.y, -20)); disc.userData.noEdge = true; scene.add(disc);
    const rim = new T.Mesh(new T.TorusGeometry(w.R, w === GAS ? 2.2 : 1.8, 24, 160), rimMat);
    rim.position.copy(at(w.x, w.y, -4)); scene.add(rim);
  }

  // ── 입자 ──
  const pMat = new T.MeshPhysicalMaterial({ color: COL, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: 0xe8e2ff });
  const sph = new T.SphereGeometry(PR, 48, 32);
  for (const [x, y] of [...solid, ...liquid, ...gas]) { const m = new T.Mesh(sph, pMat); m.position.copy(at(x, y, 0)); scene.add(m); }

  // ── 기체 입자의 움직임 꼬리(지나온 쪽으로 옅어지는 띠) ──
  const trailTex = kit.canvasTex(T, renderer, kit.canvas(256, 64, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(143,128,245,0)"); g.addColorStop(1, "rgba(143,128,245,0.42)");
    c.fillStyle = g; c.beginPath(); c.moveTo(0, h / 2); c.quadraticCurveTo(w * 0.7, 2, w, 4); c.lineTo(w, h - 4); c.quadraticCurveTo(w * 0.7, h - 2, 0, h / 2); c.fill();
  }));
  const r3 = kit.rng(41);
  const trailMat = new T.MeshBasicMaterial({ map: trailTex, transparent: true, depthWrite: false });
  // 꼬리가 창 밖으로 나가지 않는 방향만 고른다(꼬리 끝이 테두리 안쪽 8px 안에)
  const motion = gas.map(([x, y]) => {
    for (let t = 0; t < 60; t++) {
      const a = r3() * Math.PI * 2, tx = x - Math.cos(a) * 30, ty = y - Math.sin(a) * 30;
      if (Math.hypot(tx - GAS.x, ty - GAS.y) < GAS.R - 8) return a;
    }
    return Math.atan2(y - GAS.y, x - GAS.x) + Math.PI; // 가운데 쪽을 향해 움직이는 중(꼬리는 바깥 반대편이 아니라 안쪽)
  });
  gas.forEach(([x, y], i) => {
    const a = motion[i], len = 19 + r3() * 8;
    const pl = new T.Mesh(new T.PlaneGeometry(len, PR * 1.7), trailMat);
    // 꼬리는 움직이는 쪽의 반대편으로
    pl.position.copy(at(x - Math.cos(a) * (len / 2 + PR * 0.2), y - Math.sin(a) * (len / 2 + PR * 0.2), -2));
    pl.rotation.z = -a; pl.userData.noEdge = true; scene.add(pl);
  });

  await kit.renderIllus(st, { radius: 9, thickness: 6, distanceExponent: 1.2, edgeK: 0.32, nT: 0.5, dT: 0.02 });
  await kit.frame();

  // ── 화살표와 이름 ──
  const svg = kit.layer(root, W, H);
  const ARW = "#7E8AA0";
  const grad = kit.lin(svg, 0, 0, 1, 0, [[0, ARW, 0.55], [1, ARW, 1]]);
  void grad;
  // 두 창 사이에 나란히 휘는 화살표 한 쌍. a, b = 두 창, bend = 휘는 정도, sep = 두 화살표 사이
  function pair(a, b, { bend, sep, t0 = 0.0, t1 = 1.0, names, nameOff }) {
    const ax = a.x, ay = a.y, bx = b.x, by = b.y;
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const out = [];
    [[a, b, 1], [b, a, -1]].forEach(([p, q, s], k) => {
      const off = (k === 0 ? 1 : -1) * sep / 2;
      const sx = p.x + (q.x - p.x) * 0 + nx * off, sy = p.y + ny * off;
      // 출발과 도착은 창 테두리 바깥 6px
      const dirx = (q.x - p.x) / L, diry = (q.y - p.y) / L;
      const P0 = [p.x + dirx * (p.R + 7) + nx * off, p.y + diry * (p.R + 7) + ny * off];
      const P1 = [q.x - dirx * (q.R + 9) + nx * off, q.y - diry * (q.R + 9) + ny * off];
      const mx = (P0[0] + P1[0]) / 2 + nx * bend, my = (P0[1] + P1[1]) / 2 + ny * bend;
      kit.flowArrow(svg, `M${P0[0]} ${P0[1]} Q${mx} ${my} ${P1[0]} ${P1[1]}`, { w: 3.6, head: 9, hw: 2.4, fill: ARW });
      const ptAt = (t) => [(1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * mx + t * t * P1[0], (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * my + t * t * P1[1]];
      out.push({ mid: ptAt(0.5), ptAt, side: k === 0 ? 1 : -1, nx, ny });
    });
    return out;
  }
  const lg = pair(LIQ, GAS, { bend: -14, sep: 13 });   // [0] 액체→기체 기화, [1] 기체→액체 액화
  const sl = pair(SOL, LIQ, { bend: 10, sep: 13 });     // [0] 고체→액체 융해, [1] 액체→고체 응고
  const sg = pair(SOL, GAS, { bend: -8, sep: 13 });     // [0] 고체→기체 승화, [1] 기체→고체 승화
  // 이름은 그 화살표의 바깥쪽(한 쌍의 가운데선에서 먼 쪽)에 둔다. 글자 시작점은 법선이 가리키는 쪽에 맞춰 왼쪽 또는 오른쪽 정렬.
  const name = (arrow, t, gap = 15, along = 0.5) => {
    const ox = arrow.nx * arrow.side, oy = arrow.ny * arrow.side;
    const m = arrow.ptAt(along);
    const x = m[0] + ox * gap, y = m[1] + oy * gap;
    const anchor = Math.abs(ox) < 0.35 ? "middle" : ox > 0 ? "start" : "end";
    kit.text(svg, x, y, t, { size: 13, weight: 700, anchor, color: "#3B4456" });
  };
  name(lg[0], "기화"); name(lg[1], "액화");
  name(sl[0], "융해"); name(sl[1], "응고");
  name(sg[0], "승화"); name(sg[1], "승화", 14, 0.28); // 왼쪽 승화는 기체 쪽 위로 올려 융해와 떨어뜨린다
  console.log("proj", JSON.stringify({ lg: lg.map((a) => [a.mid.map(Math.round), a.side]), sl: sl.map((a) => [a.mid.map(Math.round), a.side]), sg: sg.map((a) => [a.mid.map(Math.round), a.side]) }));

  // 상태 이름
  const stateName = (x, y, t) => kit.text(svg, x, y, t, { size: 14.5, weight: 800, color: "#4B3FB8" });
  stateName(LIQ.x, LIQ.y - LIQ.R - 13, "액체");
  stateName(SOL.x - SOL.R - 22, SOL.y + 18, "고체");
  stateName(GAS.x - 30, GAS.y - GAS.R + 22, "기체");
  // 덧말
  kit.text(svg, 333, 236, "실제 기체는", { size: 12, weight: 600, color: "#5B6475", anchor: "end" });
  kit.text(svg, 333, 252, "훨씬 더 커요", { size: 12, weight: 600, color: "#5B6475", anchor: "end" });
  kit.text(svg, 8, H - 12, "입자 수는 셋 다 같아요(19개)", { size: 12, weight: 600, color: "#5B6475", anchor: "start" });
}
