// u5l6f1 · 배에 작용하는 부력: 같은 화물선, (가) 짐을 싣지 않은 배와 (나) 짐을 가득 실은 배를 옆에서.
// 검산 메모: u5l6f1.md. 물에 잠기는 쪽 선체는 옆면이 곧고 바닥이 평평해 잠긴 깊이 비 = 잠긴 부피 비(1 : 2).
// 떠서 멈춰 있으므로 한 장면 안에서 부력 = 중력(같은 길이, 한 세로선 위). (나)의 화살표는 (가)의 2배.
export const meta = { key: "u5l6f1", w: 340, h: 328, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 0, 600], look: [0, 0, 0], envIntensity: 0.6, key: [-250, 420, 360], keyI: 1.5, fillI: 0.9, rimI: 0.35, shadows: false });
  const { THREE: T, scene, renderer } = st;
  const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
  // 화면 px = 월드(정사영 옆모습): 화면 y = H/2 - 월드 y. 장면 둘: 위(가) 수면 화면 y=104, 아래(나) 수면 화면 y=254
  const L = 172, HULL_H = 48, BEAM = 36;
  const DRAFT = [15, 30]; // 잠긴 깊이(1 : 2)
  const WATER = [H / 2 - 104, H / 2 - 254];
  const hullM = new T.MeshPhysicalMaterial({ color: 0x2f4a6b, roughness: 0.55, clearcoat: 0.3 });
  const redM = new T.MeshPhysicalMaterial({ color: 0xb33a2e, roughness: 0.6 });
  const deckM = new T.MeshStandardMaterial({ color: 0x8c949e, roughness: 0.7 });
  const whiteM = new T.MeshPhysicalMaterial({ color: 0xf2f4f7, roughness: 0.5, clearcoat: 0.3 });
  const boxCols = [0x1c7ed6, 0xf08c00, 0x845ef7, 0x0c8599, 0xfab005, 0x868e96]; // 초록, 빨강은 부력, 중력 화살표 색이라 쓰지 않는다
  const ship = (waterY, draft, loaded) => {
    const g = new T.Group();
    const bottomY = waterY - draft; // 배 바닥 높이
    // 선체: 옆면이 곧은 상자(잠기는 쪽) + 위쪽 뱃머리만 비스듬히(가장 깊이 잠겨도 물 위)
    const shape = new T.Shape();
    shape.moveTo(-L / 2, 0); shape.lineTo(L / 2 - 6, 0); shape.quadraticCurveTo(L / 2, 0, L / 2, 6);
    shape.lineTo(L / 2, 33); shape.lineTo(L / 2 + 14, HULL_H); shape.lineTo(-L / 2 - 4, HULL_H); shape.lineTo(-L / 2, 33); shape.lineTo(-L / 2, 0);
    const hg = new T.ExtrudeGeometry(shape, { depth: BEAM, bevelEnabled: true, bevelThickness: 1.5, bevelSize: 1.2, bevelSegments: 3 });
    hg.translate(0, 0, -BEAM / 2);
    const hull = new T.Mesh(hg, hullM); g.add(hull);
    // 물에 닿는 아랫부분 빨간 띠(배 밑 도료): 바닥부터 34까지
    const bot = new T.Mesh(new RoundedBoxGeometry(L + 1, 31, BEAM + 3.5, 2, 1.2), redM); bot.position.set(-0.5, 15.5, 0); g.add(bot);
    // 갑판
    const deck = new T.Mesh(new T.BoxGeometry(L + 8, 2, BEAM - 2), deckM); deck.position.set(4, HULL_H + 1, 0); g.add(deck);
    // 선교(뒤쪽)
    const br = new T.Mesh(new RoundedBoxGeometry(24, 24, BEAM - 6, 2, 1.5), whiteM); br.position.set(-L / 2 + 17, HULL_H + 13, 0); g.add(br);
    const brTop = new T.Mesh(new RoundedBoxGeometry(30, 6, BEAM - 2, 2, 1.5), whiteM); brTop.position.set(-L / 2 + 17, HULL_H + 28, 0); g.add(brTop);
    for (let k = 0; k < 3; k++) { const w = new T.Mesh(new T.BoxGeometry(4, 3, 0.6), new T.MeshStandardMaterial({ color: 0x1f2a38 })); w.position.set(-L / 2 + 9 + k * 7.5, HULL_H + 19, (BEAM - 6) / 2 + 0.4); g.add(w); }
    const chim = new T.Mesh(new T.CylinderGeometry(3.4, 3.8, 10, 16), new T.MeshStandardMaterial({ color: 0xd9480f, roughness: 0.6 })); chim.position.set(-L / 2 + 22, HULL_H + 36, 0); g.add(chim);
    if (loaded) {
      // 컨테이너 3단 × 6열
      for (let c = 0; c < 5; c++) for (let r = 0; r < 2; r++) {
        const b = new T.Mesh(new RoundedBoxGeometry(22, 11.5, BEAM - 6, 2, 0.8), new T.MeshPhysicalMaterial({ color: boxCols[(c * 3 + r * 2) % boxCols.length], roughness: 0.6 }));
        b.position.set(-L / 2 + 46 + c * 24, HULL_H + 7.5 + r * 12, 0); g.add(b);
      }
    }
    g.position.set(-22, bottomY, 0);
    scene.add(g);
  };
  ship(WATER[0], DRAFT[0], false);
  ship(WATER[1], DRAFT[1], true);
  await kit.renderIllus(st, { ao: false, edgeK: 0.32 });
  await kit.frame();

  // ── 물(반투명 파랑), 잠긴 부분 빗금, 힘 화살표, 이름 ──
  const svg = kit.layer(root, W, H);
  const P = (x, y) => st.project([x, y, BEAM / 2]);
  const hatch = kit.id("ht");
  svg.defs.appendChild(kit.s("pattern", { id: hatch, width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, kit.s("path", { d: "M0 0 V6", stroke: "#FFFFFF", "stroke-width": 1.4, opacity: 0.8 })));
  [0, 1].forEach((i) => {
    const wy = P(0, WATER[i])[1], left = 0, right = W;
    const yb = P(0, WATER[i] - DRAFT[i])[1];
    const xL = P(-22 - L / 2, 0)[0], xR = P(-22 + L / 2, 0)[0];
    // 잠긴 부분 빗금(선체 옆면의 수면 아래)
    svg.appendChild(kit.s("rect", { x: xL, y: wy, width: xR - xL, height: yb - wy, fill: `url(#${hatch})` }));
    // 바닷물
    const deep = P(0, WATER[i] - DRAFT[i] - 14)[1];
    svg.appendChild(kit.s("rect", { x: left, y: wy, width: right - left, height: deep - wy, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#6FB3F2", 0.5], [1, "#2C79C9", 0.62]]) }));
    svg.appendChild(kit.s("path", { d: `M${left} ${wy} H${right}`, stroke: "#1C6CC1", "stroke-width": 1.6 }));
    // 힘: 배 한가운데 점에서 위로 부력(초록), 아래로 중력(빨강). 길이 = 잠긴 깊이 × 1.9(같은 장면에서 같은 길이)
    const c = P(-22, WATER[i] - DRAFT[i] + 24);
    const len = DRAFT[i] * 1.55;
    kit.flowArrow(svg, `M${c[0]} ${c[1]} L${c[0]} ${c[1] - len}`, { w: 4, head: 10, hw: 2.4, fill: "#2B8A3E", stroke: "#FFFFFF" }); // 흰 테: 초록 컨테이너 위에서도 갈리게
    kit.flowArrow(svg, `M${c[0]} ${c[1]} L${c[0]} ${c[1] + len}`, { w: 4, head: 10, hw: 2.4, fill: "#E03131", stroke: "#FFFFFF" });
    svg.appendChild(kit.s("circle", { cx: c[0], cy: c[1], r: 3.2, fill: "#FFFFFF", stroke: "#2B3445", "stroke-width": 1.4 }));
    kit.text(svg, c[0] + 9, c[1] - len + 6, "부력", { size: 13, weight: 800, color: "#2B8A3E", anchor: "start" });
    kit.text(svg, c[0] + 9, c[1] + len - 6, "중력", { size: 13, weight: 800, color: "#C92A2A", anchor: "start" });
    kit.text(svg, 8, i === 0 ? 14 : 170, i === 0 ? "(가) 짐을 싣지 않은 배" : "(나) 짐을 가득 실은 배", { size: 13.5, weight: 800, anchor: "start" });
    kit.label(svg, { at: [xR - 26, (wy + yb) / 2], via: [xR + 6, yb + 4], to: [xR + 10, yb + 4], text: "물에 잠긴 부분", side: "r", size: 12 });
    if (i === 0) kit.text(svg, W - 8, wy - 8, "수면", { size: 12, weight: 700, color: "#1C6CC1", anchor: "end" });
  });
}
