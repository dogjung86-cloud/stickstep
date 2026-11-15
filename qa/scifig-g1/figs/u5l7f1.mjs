// u5l7f1 · 힘과 운동: 다이빙대 끝에 서 있는 선수(두 힘의 평형)와 걸어 나가 떨어지는 선수(중력만).
// 검산 메모: u5l7f1.md. 같은 시간 간격의 자리: 가로 간격은 같고 세로로 떨어진 거리는 1 : 4 : 9 : 16(간격 1 : 3 : 5 : 7).
export const meta = { key: "u5l7f1", w: 340, h: 268, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 0, 600], look: [0, 0, 0], envIntensity: 0.6, key: [-250, 420, 360], keyI: 1.5, fillI: 0.9, rimI: 0.35, shadows: false });
  const { THREE: T, scene, renderer } = st;
  const at = (x, y, z = 0) => new T.Vector3(x - W / 2, H / 2 - y, z);
  const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
  // ── 다이빙대(콘크리트, 오른쪽 위) ──
  const EDGE_X = 226, TOP_Y = 96;
  const conc = kit.canvasTex(T, renderer, kit.canvas(256, 256, (c, w, h) => { const img = c.createImageData(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = 196 + (kit.fbm(x / 9, y / 9, 3, 2) - 0.5) * 40; const i = (y * w + x) * 4; img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v * 0.98; img.data[i + 3] = 255; } c.putImageData(img, 0, 0); }));
  const tower = new T.Mesh(new RoundedBoxGeometry(W - EDGE_X + 20, H - TOP_Y, 60, 3, 2), new T.MeshStandardMaterial({ map: conc, roughness: 0.9 }));
  tower.position.copy(at(EDGE_X + (W - EDGE_X + 20) / 2, TOP_Y + (H - TOP_Y) / 2, -30)); scene.add(tower);
  // ── 선수(매끈한 인형 꼴): 허리 점 기준 ──
  const skin = new T.MeshPhysicalMaterial({ color: 0xf1c3a0, roughness: 0.55, sheen: 0.4, sheenColor: 0xffe2d0 });
  const suit = new T.MeshPhysicalMaterial({ color: 0x1c7ed6, roughness: 0.45, clearcoat: 0.4 });
  const cap = (r, len, m) => new T.Mesh(new T.CapsuleGeometry(r, len, 8, 20), m);
  // fade: 0이면 제 색, 1에 가까울수록 흰색에 가깝게(앞선 자리일수록 옅게. 투명하게 겹치지 않는다)
  const diver = (waistX, waistY, tilt, armsUp, fade) => {
    const g = new T.Group();
    const sk = skin.clone(), su = suit.clone();
    sk.color.lerp(new T.Color(0xffffff), fade); su.color.lerp(new T.Color(0xffffff), fade);
    const torso = cap(5.4, 13, su); torso.position.y = 11.5; g.add(torso);
    const head = new T.Mesh(new T.SphereGeometry(5.2, 24, 16), sk); head.position.y = 30; g.add(head);
    for (const sgn of [-1, 1]) {
      const leg = cap(2.8, 19, sk); leg.position.set(sgn * 2.8, -12, 0); g.add(leg);
      if (!armsUp) { const arm = cap(2.0, 16, sk); arm.position.set(sgn * 7.6, 11.5, 0); arm.rotation.z = sgn * 0.08; g.add(arm); }
    }
    if (armsUp) { const arms = cap(2.9, 15, sk); arms.position.set(0, 42, 0); g.add(arms); } // 두 팔을 머리 위로 모은 자세(한 덩어리)
    const hip = cap(5.2, 3, su); hip.rotation.z = Math.PI / 2; hip.position.y = 1.5; g.add(hip);
    g.position.copy(at(waistX, waistY, 0)); g.rotation.z = tilt; scene.add(g);
  };
  // (가) 서 있는 선수: 발이 대 위(허리 = 대 윗면 - 24)
  const STAND = [EDGE_X + 16, TOP_Y - 24];
  diver(STAND[0], STAND[1], 0, false, 0);
  // (나) 떨어지는 선수: 같은 시간 간격 t = 1, 2, 3, 4. 가로 32px씩(같은 간격), 세로 5.6·t²(1 : 4 : 9 : 16, 간격 1 : 3 : 5 : 7)
  const FALL = [1, 2, 3, 4].map((t) => [EDGE_X - 8 - 32 * t, TOP_Y - 24 + 5.6 * t * t]);
  FALL.forEach(([x, y], k) => diver(x, y, 0.22 + k * 0.24, true, 0.55 - k * 0.18));
  await kit.renderIllus(st, { ao: false, edge: false });
  await kit.frame();

  const svg = kit.layer(root, W, H);
  // 물
  const WY = H - 28;
  svg.appendChild(kit.s("rect", { x: 0, y: WY, width: EDGE_X, height: H - WY, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#7DB9F0"], [1, "#2C79C9"]]) }));
  svg.appendChild(kit.s("path", { d: `M0 ${WY} H${EDGE_X}`, stroke: "#1C6CC1", "stroke-width": 1.6 }));
  // 힘 화살표(허리 점에서): 서 있을 때 위로 떠받치는 힘과 아래로 중력이 같은 길이, 떨어질 때는 중력만(모두 같은 길이, 곧장 아래)
  const F = 26;
  const dot = (x, y) => svg.appendChild(kit.s("circle", { cx: x, cy: y, r: 2.8, fill: "#FFFFFF", stroke: "#2B3445", "stroke-width": 1.3 }));
  kit.flowArrow(svg, `M${STAND[0]} ${STAND[1]} L${STAND[0]} ${STAND[1] - F}`, { w: 3.6, head: 9, hw: 2.4, fill: "#2B8A3E" });
  kit.flowArrow(svg, `M${STAND[0]} ${STAND[1]} L${STAND[0]} ${STAND[1] + F}`, { w: 3.6, head: 9, hw: 2.4, fill: "#E03131" });
  dot(STAND[0], STAND[1]);
  FALL.forEach(([x, y], k) => { kit.flowArrow(svg, `M${x} ${y} L${x} ${y + F}`, { w: 3.2, head: 8, hw: 2.4, fill: "#E03131", opacity: 0.6 + 0.13 * k }); dot(x, y); });
  // 이름
  kit.text(svg, W - 6, STAND[1] - F - 18, "다이빙대가", { size: 12.5, weight: 800, color: "#2B8A3E", anchor: "end" });
  kit.text(svg, W - 6, STAND[1] - F - 3, "떠받치는 힘", { size: 12.5, weight: 800, color: "#2B8A3E", anchor: "end" });
  kit.text(svg, STAND[0] + 8, STAND[1] + F - 4, "중력", { size: 12.5, weight: 800, color: "#C92A2A", anchor: "start" });
  kit.text(svg, W - 6, TOP_Y + 18, "(가) 서 있을 때", { size: 13, weight: 800, anchor: "end" });
  kit.text(svg, 8, 18, "(나) 떨어질 때", { size: 13, weight: 800, anchor: "start" });
  kit.text(svg, 8, 35, "중력만 작용해요", { size: 12, weight: 600, color: "#5B6475", anchor: "start" });
  const last = FALL[3];
  kit.text(svg, last[0] + 9, last[1] + F - 2, "중력", { size: 12.5, weight: 800, color: "#C92A2A", anchor: "start" });
  // 같은 시간 간격 표시: 자리 사이 세로 간격이 점점 커진다(1 : 3 : 5 : 7)
  const xs = 30;
  let prev = TOP_Y - 24;
  FALL.forEach(([, y], k) => { svg.appendChild(kit.s("path", { d: `M${xs} ${prev} V${y}`, stroke: k % 2 ? "#9AA5B5" : "#5B6475", "stroke-width": 3, "stroke-linecap": "butt" })); prev = y; });
  svg.appendChild(kit.s("path", { d: `M${xs - 4} ${TOP_Y - 24} H${xs + 4}`, stroke: "#5B6475", "stroke-width": 1.2 }));
  FALL.forEach(([, y]) => svg.appendChild(kit.s("path", { d: `M${xs - 4} ${y} H${xs + 4}`, stroke: "#5B6475", "stroke-width": 1.2 })));
  FALL.forEach(([x, y]) => svg.appendChild(kit.s("path", { d: `M${xs + 5} ${y} H${x - 14}`, stroke: "#C9CFD9", "stroke-width": 0.9, "stroke-dasharray": "2 3" })));
  kit.text(svg, 8, FALL[3][1] + 22, "같은 시간마다", { size: 12, weight: 600, color: "#5B6475", anchor: "start" });
  kit.text(svg, 8, FALL[3][1] + 37, "더 많이 떨어져요", { size: 12, weight: 600, color: "#5B6475", anchor: "start" });
}
