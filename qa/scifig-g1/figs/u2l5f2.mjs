// u2l5f2 · 위 하나에도 여러 조직: 앞에서 본 위(J자, 위쪽에 식도, 그림의 왼쪽 아래로 작은창자 시작부)와 앞벽에 낸 계단 창.
// 검산 메모: u2l5f2.md. 창은 바깥부터 세로 근육, 둥근 근육, 비스듬한 근육(근육조직 세 겹, 결이 다름), 얇은 결합조직(이름 없음), 안쪽의 주름진 상피조직.
// 확대 원은 안쪽 표면의 상피세포 한 줄(키 큰 기둥 모양, 솔 같은 돌기 없음). 융털은 그리지 않는다(작은창자의 것). 작은창자는 사람의 오른쪽 = 그림의 왼쪽.
export const meta = { key: "u2l5f2", w: 340, h: 300, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 0, 600], look: [0, 0, 0], envIntensity: 0.7, key: [-260, 360, 420], keyI: 1.55, fillI: 0.85, rimI: 0.35, shadows: false });
  const { THREE: T, scene } = st;
  const at = (x, y, z = 0) => new T.Vector3(x - W / 2, H / 2 - y, z);
  // 굵기가 바뀌는 관(가운데 선과 반지름을 점마다 준다): 평행 이동 틀로 고리를 쓸어 만든다
  const varTube = (pts, radii, segs = 220, radial = 56) => {
    const curve = new T.CatmullRomCurve3(pts.map((p) => at(p[0], p[1], 0)), false, "centripetal");
    const n = radii.length - 1;
    const rAt = (t) => { const p = t * n, i = Math.min(n - 1, Math.floor(p)), f = p - i, a = radii[Math.max(0, i - 1)], b = radii[i], c = radii[i + 1], d = radii[Math.min(n, i + 2)]; return 0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f); };
    const pos = [], idx = [];
    let N0 = new T.Vector3(0, 0, 1);
    for (let k = 0; k <= segs; k++) {
      const t = k / segs, P = curve.getPoint(t), Tg = curve.getTangent(t).normalize();
      N0 = N0.sub(Tg.clone().multiplyScalar(N0.dot(Tg))).normalize();
      const B = new T.Vector3().crossVectors(Tg, N0).normalize();
      const r = rAt(t);
      for (let j = 0; j <= radial; j++) { const a = (j / radial) * Math.PI * 2; const v = P.clone().add(N0.clone().multiplyScalar(Math.cos(a) * r)).add(B.clone().multiplyScalar(Math.sin(a) * r)); pos.push(v.x, v.y, v.z); }
    }
    for (let k = 0; k < segs; k++) for (let j = 0; j < radial; j++) { const a = k * (radial + 1) + j, b = a + radial + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); } // 바깥을 보는 면(앞면)
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  };
  const serosa = new T.MeshPhysicalMaterial({ color: 0xe8908c, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.35, sheen: 0.5, sheenColor: 0xffd8d2 });
  const gullet = new T.MeshPhysicalMaterial({ color: 0xe3a39b, roughness: 0.45, clearcoat: 0.4 });
  // 위: 들문(식도가 들어오는 곳) → 몸통(그림 오른쪽으로 크게 굽음) → 아래 → 날문(그림 왼쪽) → 작은창자
  // 첫 점이 위바닥(들문 오른쪽 위의 둥근 지붕), 끝은 그림 밖으로 이어지는 작은창자
  // 위바닥(들문 오른쪽 위의 둥근 지붕)은 관의 반지름을 처음에 작게 시작해 둥글게 만든다. 끝은 그림 밖으로 이어지는 작은창자.
  // 지붕: 반지름 30인 반구 꼴(꼭대기에서 h만큼 내려간 곳의 반지름 = √(2·30·h − h²))
  const C = [[184.5, 33], [183.9, 36], [182.9, 41], [181.3, 49], [178.6, 62], [173, 98], [174, 142], [152, 187], [112, 207], [78, 198], [58, 188], [40, 198], [30, 236], [22, 320]];
  const R = [0.6, 13, 20.4, 26.5, 30, 38, 41, 35, 25, 13, 8.5, 10, 10, 10];
  scene.add(new T.Mesh(varTube(C, R, 360), serosa));
  scene.add(new T.Mesh(varTube([[134, -12], [138, 22], [150, 54], [168, 90]], [8.5, 8.5, 9.5, 11]), gullet)); // 끝은 위 몸통 속에 묻힌다
  await kit.renderIllus(st, { ao: true, radius: 8, thickness: 6, edge: true, edgeK: 0.4, nT: 0.5, dT: 0.02 });
  await kit.frame();

  const svg = kit.layer(root, W, H);
  // ── 계단 창(앞벽을 네모나게 걷어 낸 모습): 바깥에서 안으로 한 겹씩 ──
  const X0 = 140, Y0 = 108, WW = 60, HH = 64;
  const clipId = kit.id("wc");
  const defs = kit.s("defs"); svg.appendChild(defs);
  const layer = (inset, fill, pat, side) => {
    const x = X0 + inset, y = Y0 + inset, w = WW - inset * 1.4, h = HH - inset * 1.4;
    const id = kit.id("ly");
    const cp = kit.s("clipPath", { id }); cp.appendChild(kit.s("rect", { x, y, width: w, height: h, rx: 4 })); defs.appendChild(cp);
    const g = kit.s("g", { "clip-path": `url(#${id})` }); svg.appendChild(g);
    g.appendChild(kit.s("rect", { x, y, width: w, height: h, fill }));
    if (pat) pat(g, x, y, w, h);
    // 잘린 면(위와 왼쪽 가장자리의 어두운 턱): 깊이가 보이게
    g.appendChild(kit.s("path", { d: `M${x} ${y + h} L${x} ${y} L${x + w} ${y}`, stroke: side, "stroke-width": 4, fill: "none", opacity: 0.85 }));
    svg.appendChild(kit.s("rect", { x, y, width: w, height: h, rx: 4, fill: "none", stroke: "#7A2E2B", "stroke-width": 0.8, opacity: 0.6 }));
    return { x, y, w, h };
  };
  const stripes = (ang, gap, color, wdt = 1.1) => (g, x, y, w, h) => {
    const cx = x + w / 2, cy = y + h / 2, L = Math.hypot(w, h);
    for (let s = -L; s <= L; s += gap) {
      const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
      g.appendChild(kit.s("path", { d: `M${cx + nx * s - dx * L} ${cy + ny * s - dy * L} L${cx + nx * s + dx * L} ${cy + ny * s + dy * L}`, stroke: color, "stroke-width": wdt, opacity: 0.55 }));
    }
  };
  const L1 = layer(0, "#D45A55", stripes(Math.PI / 2, 3.2, "#9E2F2C"), "#8E2A27");   // 바깥: 세로 근육(결이 위아래)
  const L2 = layer(7, "#C94B47", stripes(0, 3.2, "#8A2522"), "#7F2421");             // 가운데: 둥근 근육(결이 가로)
  const L3 = layer(14, "#D35652", stripes(-Math.PI / 4, 3.4, "#952C29"), "#88302C");  // 안쪽: 비스듬한 근육
  const L4 = layer(21, "#F4DCCF", null, "#D9B3A3");                                   // 얇은 결합조직
  const L5 = layer(24.5, "#F28E9D", (g, x, y, w, h) => {                               // 상피조직: 큰 주름(융털 없음)
    for (let k = 0; k < 5; k++) {
      const yy = y + 5 + k * (h - 8) / 4.4;
      let d = `M${x - 2} ${yy}`;
      for (let xx = x; xx <= x + w + 2; xx += 4) d += ` L${xx} ${(yy + 2.4 * Math.sin((xx - x) / 5.5 + k * 1.3)).toFixed(2)}`;
      g.appendChild(kit.s("path", { d, stroke: "#C85A6C", "stroke-width": 2.2, fill: "none", opacity: 0.8 }));
      g.appendChild(kit.s("path", { d, stroke: "#FFD2DA", "stroke-width": 0.9, fill: "none", opacity: 0.9, transform: "translate(0 -1.3)" }));
    }
  }, "#C9606F");
  void L1; void L2; void L3; void L4;

  // ── 확대 원: 안쪽 표면의 상피세포 한 줄(키 큰 기둥 모양) ──
  const M = { x: 282, y: 214, r: 44 };
  const spot = [L5.x + L5.w * 0.55, L5.y + L5.h * 0.4];
  svg.appendChild(kit.s("circle", { cx: spot[0], cy: spot[1], r: 5, fill: "none", stroke: "#5B3E8C", "stroke-width": 1.2 }));
  for (const s of [-1, 1]) {
    const a = Math.atan2(M.y - spot[1], M.x - spot[0]) + s * Math.PI / 2;
    svg.appendChild(kit.s("path", { d: `M${spot[0] + Math.cos(a) * 5} ${spot[1] + Math.sin(a) * 5} L${M.x + Math.cos(a) * M.r} ${M.y + Math.sin(a) * M.r}`, stroke: "#8E7BC0", "stroke-width": 0.9, "stroke-dasharray": "2.5 2" }));
  }
  const mid = kit.id("mg");
  const mcp = kit.s("clipPath", { id: mid }); mcp.appendChild(kit.s("circle", { cx: M.x, cy: M.y, r: M.r })); defs.appendChild(mcp);
  const mg = kit.s("g", { "clip-path": `url(#${mid})` }); svg.appendChild(mg);
  mg.appendChild(kit.s("rect", { x: M.x - M.r, y: M.y - M.r, width: 2 * M.r, height: 2 * M.r, fill: "#FFF6F4" })); // 위 속(빈 곳)
  const top = M.y - 14, cellH = 30, cw = 9.6;
  mg.appendChild(kit.s("rect", { x: M.x - M.r, y: top + cellH, width: 2 * M.r, height: M.r, fill: "#F6DDD2" })); // 아래의 결합조직
  for (let i = -5; i <= 5; i++) {
    const x = M.x + i * cw - cw / 2;
    mg.appendChild(kit.s("rect", { x: x + 0.5, y: top, width: cw - 1, height: cellH, rx: 3.2, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#FBC6D0"], [1, "#F3A7B6"]]), stroke: "#C2647A", "stroke-width": 0.9 }));
    mg.appendChild(kit.s("ellipse", { cx: x + cw / 2, cy: top + cellH - 8, rx: 2.6, ry: 4, fill: "#7A5FB8" }));
  }
  svg.appendChild(kit.s("circle", { cx: M.x, cy: M.y, r: M.r, fill: "none", stroke: "#8E7BC0", "stroke-width": 1.6 }));
  kit.text(svg, M.x, top - 12, "위 속", { size: 12, weight: 600, color: "#8A6F7A" });

  // ── 이름 ──
  kit.label(svg, { at: [L5.x + L5.w * 0.72, L5.y + L5.h * 0.78], via: [226, 150], to: [230, 150], text: "상피조직", side: "r", size: 12.5, sub: "안쪽, 주름진 한 겹" });
  kit.label(svg, { at: [L1.x + L1.w - 4, L1.y + 10], via: [226, 104], to: [230, 104], text: "근육조직", side: "r", size: 12.5, sub: "세 겹, 결이 달라요" });
  kit.text(svg, M.x, M.y + M.r + 13, "상피세포", { size: 12.5, weight: 800 });
  kit.label(svg, { at: [128, 26], via: [104, 18], to: [100, 18], text: "식도", side: "l", size: 12.5 });
  kit.label(svg, { at: [33, 248], via: [52, 268], to: [56, 268], text: "작은창자로", side: "r", size: 12 });
  kit.text(svg, 196, 226, "위", { size: 14, weight: 800, color: "#8E2A27" });
}
