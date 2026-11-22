// u4l4f1 · 상태 변화와 입자 배열: 크기가 같은 밀폐 유리그릇 셋에 같은 물질의 고체, 액체, 기체를 담고(입자 수가 같다),
// 여섯 가지 상태 변화를 그릇 사이의 화살표로 잇는다. 그릇은 정삼각형 자리(위 가운데 기체, 왼쪽 아래 고체, 오른쪽 아래 액체).
// 검산 메모: u4l4f1.md. 부피는 입자들이 차지한 자리: 고체는 바닥에 놓인 덩어리, 액체는 바닥을 덮은 낮은 층, 기체는 그릇 전체.
// 화살표 색은 Ⅳ 정리 카드와 u4l3f1의 짝 색(융해·응고 파랑, 기화·액화 산호, 승화 보라). 흡수와 방출의 뜻은 색에 싣지 않는다.
export const meta = { key: "u4l4f1", w: 340, h: 352, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [W / 2, -H / 2, 400], look: [W / 2, -H / 2, 0], envIntensity: 0.9, key: [-160, 260, 300], keyI: 1.5, fillI: 0.9, rimI: 0.25, shadows: false });
  const { THREE: T, scene, renderer } = st;
  const at = (x, y, z = 0) => new T.Vector3(x, -y, z);

  const PR = 4.6;   // 입자 반지름(px)
  const N = 18;     // 그릇마다 입자 수
  const COL = 0x1fa99c; // 청록(입자). 세 그릇이 같은 색, 같은 크기
  const JW = 110, JH = 108, JR = 14; // 그릇 몸통(바깥) 크기와 모서리 둥글기
  const WALL = 5; // 유리 두께(안쪽 여유)

  // ── 그릇 자리: 정삼각형(한 변 S). 위 가운데 기체, 왼쪽 아래 고체, 오른쪽 아래 액체 ──
  const S = 214, CX = W / 2, TOPY = 88;
  const GAS = { x: CX, y: TOPY }, SOL = { x: CX - S / 2, y: TOPY + S * Math.sqrt(3) / 2 }, LIQ = { x: CX + S / 2, y: TOPY + S * Math.sqrt(3) / 2 };
  const inner = (j) => ({ x0: j.x - JW / 2 + WALL, x1: j.x + JW / 2 - WALL, y0: j.y - JH / 2 + WALL, y1: j.y + JH / 2 - WALL });

  // 고체: 바닥에 놓인 가지런한 덩어리(육각 촘촘 쌓기 5, 4, 5, 4줄), 이웃과 거의 닿는다
  const d = PR * 2 * 1.03;
  const solid = [];
  { const b = inner(SOL), rows = [5, 4, 5, 4];
    rows.forEach((n, row) => { const y = b.y1 - PR - 0.5 - row * d * Math.sqrt(3) / 2; for (let i = 0; i < n; i++) solid.push([SOL.x + (i - (n - 1) / 2) * d, y]); }); }
  // 액체: 하나씩 떨어뜨려 바닥이나 다른 입자에 닿는 자리에 둔다(가장 낮은 자리를 고르되 조금 흔들어 줄이 생기지 않게).
  // 그래서 이웃과 닿을 만큼 가깝지만 배열이 불규칙하고, 그릇 바닥 모양을 따라 낮은 층이 된다.
  const liquid = [];
  { const b = inner(LIQ), r1 = kit.rng(23), touch = PR * 2 * 1.04;
    for (let k = 0; k < N; k++) {
      let best = null;
      for (let c = 0; c < 60; c++) {
        const x = b.x0 + PR + 0.6 + r1() * (b.x1 - b.x0 - 2 * PR - 1.2);
        let y = b.y1 - PR - 0.5; // 바닥에 닿는 자리
        for (const [qx, qy] of liquid) { const dx = Math.abs(x - qx); if (dx < touch) y = Math.min(y, qy - Math.sqrt(touch * touch - dx * dx)); }
        const score = y + r1() * 3.2;
        if (!best || score > best.score) best = { x, y, score };
      }
      liquid.push([best.x, best.y]);
    } }
  // 기체: 그릇 안 전체에 고르게, 서로 멀리(후보 여럿 가운데 이미 놓인 입자에서 가장 먼 자리를 고른다). 벽에 닿지 않게
  const gas = [];
  { const b = inner(GAS), r2 = kit.rng(31);
    const rnd = () => [b.x0 + PR + 3 + r2() * (b.x1 - b.x0 - 2 * PR - 6), b.y0 + PR + 3 + r2() * (b.y1 - b.y0 - 2 * PR - 6)];
    gas.push(rnd());
    while (gas.length < N) {
      let best = null, bestD = -1;
      for (let c = 0; c < 40; c++) { const p = rnd(), dmin = Math.min(...gas.map((q) => Math.hypot(q[0] - p[0], q[1] - p[1]))); if (dmin > bestD) { bestD = dmin; best = p; } }
      gas.push(best);
    }
    // 서로 너무 가까운 짝을 조금씩 밀어 간격을 고르게(벽 안에서)
    const D = 19.5, lo = [b.x0 + PR + 3, b.y0 + PR + 3], hi = [b.x1 - PR - 3, b.y1 - PR - 3];
    for (let it = 0; it < 300; it++) {
      for (let i = 0; i < gas.length; i++) for (let k = i + 1; k < gas.length; k++) {
        const dx = gas[k][0] - gas[i][0], dy = gas[k][1] - gas[i][1], dd = Math.hypot(dx, dy) || 1e-6;
        if (dd < D) { const m = (D - dd) * 0.25; gas[i][0] -= (dx / dd) * m; gas[i][1] -= (dy / dd) * m; gas[k][0] += (dx / dd) * m; gas[k][1] += (dy / dd) * m; }
      }
      for (const q of gas) { q[0] = Math.min(hi[0], Math.max(lo[0], q[0])); q[1] = Math.min(hi[1], Math.max(lo[1], q[1])); }
    } }
  const gasMin = Math.min(...gas.flatMap((p, i) => gas.slice(i + 1).map((q) => Math.hypot(q[0] - p[0], q[1] - p[1]))));
  if (gasMin < PR * 2 * 1.8) throw new Error(`기체 입자가 너무 가깝다: ${gasMin.toFixed(1)}`);
  if (gas.length !== N || solid.length !== N || liquid.length !== N) throw new Error(`입자 수 ${solid.length}/${liquid.length}/${gas.length}`);
  // 고체와 액체가 차지한 높이(부피 검산용): 고체 덩어리, 액체 층
  const hOf = (arr, j) => inner(j).y1 - Math.min(...arr.map((p) => p[1])) + PR;
  const wOf = (arr) => Math.max(...arr.map((p) => p[0])) - Math.min(...arr.map((p) => p[0])) + 2 * PR;
  console.log("placed", JSON.stringify({ N, gasMin: +gasMin.toFixed(1), solid: { w: +wOf(solid).toFixed(1), h: +hOf(solid, SOL).toFixed(1) }, liquid: { w: +wOf(liquid).toFixed(1), h: +hOf(liquid, LIQ).toFixed(1) }, gasInnerArea: (JW - 2 * WALL) * (JH - 2 * WALL) }));

  // ── 그릇 안쪽 바탕(옅은 유리빛 판, 둥근 직사각형) ──
  const rrect = (w, h, r) => { const s = new T.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; };
  const backTex = kit.canvasTex(T, renderer, kit.canvas(256, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#EEF4FA"); g.addColorStop(0.35, "#FBFDFF"); g.addColorStop(1, "#E7EEF6");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }));
  const backMat = new T.MeshBasicMaterial({ map: backTex });
  for (const j of [GAS, SOL, LIQ]) {
    const g = new T.ShapeGeometry(rrect(JW - 2, JH - 2, JR - 1), 8);
    const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / JW + 0.5, p.getY(i) / JH + 0.5);
    const m = new T.Mesh(g, backMat); m.position.copy(at(j.x, j.y, -20)); m.userData.noEdge = true; scene.add(m);
  }

  // ── 입자 ──
  const pMat = new T.MeshPhysicalMaterial({ color: COL, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: 0xdcfff8 });
  const sph = new T.SphereGeometry(PR, 48, 32);
  for (const [x, y] of [...solid, ...liquid, ...gas]) { const m = new T.Mesh(sph, pMat); m.position.copy(at(x, y, 0)); scene.add(m); }
  // 기체 입자의 움직임 꼬리(지나온 쪽으로 옅어지는 띠). 꼬리가 그릇 벽을 넘지 않는 방향만 고른다
  const trailTex = kit.canvasTex(T, renderer, kit.canvas(256, 64, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(31,169,156,0)"); g.addColorStop(1, "rgba(31,169,156,0.42)");
    c.fillStyle = g; c.beginPath(); c.moveTo(0, h / 2); c.quadraticCurveTo(w * 0.7, 2, w, 4); c.lineTo(w, h - 4); c.quadraticCurveTo(w * 0.7, h - 2, 0, h / 2); c.fill();
  }));
  const trailMat = new T.MeshBasicMaterial({ map: trailTex, transparent: true, depthWrite: false });
  const r3 = kit.rng(41), gb = inner(GAS);
  gas.forEach(([x, y]) => {
    const len = 13 + r3() * 5;
    let a = 0;
    for (let t = 0; t < 80; t++) { a = r3() * Math.PI * 2; const tx = x - Math.cos(a) * (len + PR), ty = y - Math.sin(a) * (len + PR); if (tx > gb.x0 + 2 && tx < gb.x1 - 2 && ty > gb.y0 + 2 && ty < gb.y1 - 2) break; }
    const pl = new T.Mesh(new T.PlaneGeometry(len, PR * 1.6), trailMat);
    pl.position.copy(at(x - Math.cos(a) * (len / 2 + PR * 0.2), y - Math.sin(a) * (len / 2 + PR * 0.2), -2));
    pl.rotation.z = -a; pl.userData.noEdge = true; scene.add(pl);
  });

  await kit.renderIllus(st, { radius: 8, thickness: 6, distanceExponent: 1.2, edgeK: 0.3, nT: 0.5, dT: 0.02 });
  await kit.frame();

  // ── 유리그릇 앞면(테두리, 반짝임, 뚜껑), 화살표, 이름 ──
  const svg = kit.layer(root, W, H);
  for (const j of [GAS, SOL, LIQ]) {
    const x = j.x - JW / 2, y = j.y - JH / 2;
    svg.appendChild(kit.s("rect", { x, y, width: JW, height: JH, rx: JR, fill: "none", stroke: "#9FB3CC", "stroke-width": 2.2 }));
    svg.appendChild(kit.s("rect", { x: x + 2.4, y: y + 2.4, width: JW - 4.8, height: JH - 4.8, rx: JR - 2, fill: "none", stroke: "#FFFFFF", "stroke-width": 1, opacity: 0.8 }));
    svg.appendChild(kit.s("path", { d: `M${x + 8} ${y + 18} V${y + JH - 22}`, stroke: "#FFFFFF", "stroke-width": 3, "stroke-linecap": "round", opacity: 0.75 }));
    svg.appendChild(kit.s("path", { d: `M${x + JW - 9} ${y + 16} V${y + 30}`, stroke: "#FFFFFF", "stroke-width": 2, "stroke-linecap": "round", opacity: 0.7 }));
    // 뚜껑(닫힌 그릇: 기체도 빠져나가지 않는다)
    svg.appendChild(kit.s("rect", { x: j.x - 34, y: y - 9, width: 68, height: 11, rx: 3.5, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#8796AB"], [1, "#5E6C80"]]), stroke: "#4C5869", "stroke-width": 0.9 }));
    for (let k = 1; k < 8; k++) svg.appendChild(kit.s("path", { d: `M${j.x - 34 + k * 8.5} ${y - 7} v7`, stroke: "#4C5869", "stroke-width": 0.7, opacity: 0.6 }));
  }

  // 화살표: 두 그릇 사이에 나란한 한 쌍(가는 쪽이 서로 반대). 이름은 그 화살표의 바깥쪽(쌍의 가운데선에서 먼 쪽)에
  const edgeHit = (j, ux, uy, pad) => { // 그릇 가운데에서 (ux, uy) 방향으로 나가 몸통(+뚜껑) 가장자리를 지나 pad만큼 더 간 점까지의 거리
    const hx = JW / 2 + pad, hy = JH / 2 + pad + (uy < 0 ? 10 : 0);
    return Math.min(Math.abs(ux) > 1e-6 ? hx / Math.abs(ux) : 1e9, Math.abs(uy) > 1e-6 ? hy / Math.abs(uy) : 1e9);
  };
  function pair(a, b, { sep = 14, bend = 0, colors, names, nameGap = 15 }) {
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const ta = edgeHit(a, ux, uy, 7), tb = edgeHit(b, -ux, -uy, 9);
    const out = [];
    [[a, b, 1], [b, a, -1]].forEach(([p, q, s], k) => {
      const off = (k === 0 ? 1 : -1) * sep / 2;
      const sx = s > 0 ? a.x + ux * ta : b.x - ux * tb, sy = s > 0 ? a.y + uy * ta : b.y - uy * tb;
      const ex = s > 0 ? b.x - ux * tb : a.x + ux * ta, ey = s > 0 ? b.y - uy * tb : a.y + uy * ta;
      const P0 = [sx + nx * off, sy + ny * off], P1 = [ex + nx * off, ey + ny * off];
      const mx = (P0[0] + P1[0]) / 2 + nx * bend * (k === 0 ? 1 : -1), my = (P0[1] + P1[1]) / 2 + ny * bend * (k === 0 ? 1 : -1);
      kit.flowArrow(svg, `M${P0[0]} ${P0[1]} Q${mx} ${my} ${P1[0]} ${P1[1]}`, { w: 3.4, head: 9, hw: 2.4, fill: colors[0] });
      const mid = [0.25 * P0[0] + 0.5 * mx + 0.25 * P1[0], 0.25 * P0[1] + 0.5 * my + 0.25 * P1[1]];
      const ox = nx * (k === 0 ? 1 : -1), oy = ny * (k === 0 ? 1 : -1);
      const anchor = Math.abs(ox) < 0.35 ? "middle" : ox > 0 ? "start" : "end";
      kit.text(svg, mid[0] + ox * nameGap, mid[1] + oy * nameGap, names[k], { size: 13.5, weight: 800, anchor, color: colors[1] });
      out.push({ P0, P1, mid });
    });
    return out;
  }
  const BLUE = ["#4E9BF5", "#2E7AD6"], CORAL = ["#F0705E", "#D9503D"], VIOLET = ["#8A6BFF", "#6E4FE0"];
  const sl = pair(SOL, LIQ, { colors: BLUE, names: ["융해", "응고"] });      // 고체→액체 융해, 액체→고체 응고
  const lg = pair(LIQ, GAS, { colors: CORAL, names: ["기화", "액화"] });     // 액체→기체 기화, 기체→액체 액화
  const sg = pair(SOL, GAS, { colors: VIOLET, names: ["승화", "승화"] });    // 고체→기체 승화, 기체→고체 승화
  console.log("proj", JSON.stringify({ GAS, SOL, LIQ, sl: sl.map((a) => a.mid.map(Math.round)), lg: lg.map((a) => a.mid.map(Math.round)), sg: sg.map((a) => a.mid.map(Math.round)) }));

  // 상태 이름(그릇 아래), 덧말
  const stateName = (j, t) => kit.text(svg, j.x, j.y + JH / 2 + 15, t, { size: 14.5, weight: 800, color: "#0E7C70" });
  stateName(GAS, "기체"); stateName(SOL, "고체"); stateName(LIQ, "액체");
  kit.text(svg, CX, SOL.y + JH / 2 + 15, "입자 수는 셋 다 18개", { size: 12.5, weight: 600, color: "#5B6475" });
  kit.text(svg, W - 6, GAS.y - 18, "실제 기체는", { size: 12, weight: 600, color: "#5B6475", anchor: "end" });
  kit.text(svg, W - 6, GAS.y - 2, "훨씬 더 커요", { size: 12, weight: 600, color: "#5B6475", anchor: "end" });
}
