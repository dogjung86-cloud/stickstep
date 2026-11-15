// u7l3f1 · 태양풍이 지구에 미치는 영향. 정리 카드 3 '지구로 부는 바람'의 자세히, '지구에서 생기는 일' 문단 뒤.
// 검산 메모: u7l3f1.md. 왼쪽 가장자리에 태양(실사 photos/sun_whitelight.jpg, NOIRLab CC BY 4.0), 태양풍의 흐름이 지구로 간다.
// 지구는 실사 질감(public/textures/earth.jpg)을 입힌 공을 태양 쪽(왼쪽)에서 비춘다. 오로라는 두 극을 둘러싼 고리(위도 약 67°)로,
// 밤 쪽에서 더 밝다. 인공위성 하나에 고장 표시. 아래 줄은 랩의 '그때 지구는' 칩과 같은 이름과 그림(넓은 오로라, 통신 장애, 정전).
export const meta = { key: "u7l3f1", w: 340, h: 252, scale: 3, quality: 88, bg: "#0B1426" };

const D2R = Math.PI / 180;

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const SUN = { x: -58, y: 112, r: 92 };
  const E = { x: 240, y: 112, r: 46 };
  const TILT = 18; // 화면에서 자전축이 왼쪽(태양 쪽)으로 기운 각(°)

  // ── 바탕: 우주, 태양, 태양풍 ──
  const bg = kit.layer(root, W, H);
  bg.appendChild(kit.s("rect", { width: W, height: H, fill: kit.lin(bg, 0, 0, 0, 1, [[0, "#0A1224"], [1, "#0E1A33"]]) }));
  const rs = kit.rng(23);
  for (let i = 0; i < 120; i++) bg.appendChild(kit.s("circle", { cx: 40 + rs() * (W - 40), cy: rs() * 196, r: rs() < 0.9 ? 0.4 + rs() * 0.35 : 0.8 + rs() * 0.3, fill: "#FFFFFF", opacity: 0.14 + rs() * 0.3 }));
  bg.appendChild(kit.s("circle", { cx: SUN.x, cy: SUN.y, r: SUN.r + 30, fill: kit.rad(bg, 0.5, 0.5, 0.5, [[0.7, "#FFB547", 0.55], [0.85, "#FF9A2E", 0.18], [1, "#FF8A1C", 0]]) }));
  const img = await kit.loadImg("/public/photos/sun_whitelight.jpg");
  const DPR = 3;
  const sunURL = kit.canvas(SUN.r * 2 * DPR, SUN.r * 2 * DPR, (c, w) => {
    c.beginPath(); c.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2); c.clip();
    const s = (w / 2) / 760; // 사진의 원판: 가운데 (905, 855), 반지름 760px
    c.drawImage(img, w / 2 - 905 * s, w / 2 - 855 * s, img.width * s, img.height * s);
  }).toDataURL("image/png");
  bg.appendChild(kit.s("image", { href: sunURL, x: SUN.x - SUN.r, y: SUN.y - SUN.r, width: SUN.r * 2, height: SUN.r * 2 }));

  // 태양풍: 입자 점이 줄지어 지구로. 위아래 두 줄은 지구의 두 극 쪽으로 휘어 들어간다(오로라 자리)
  const npole = [E.x - Math.sin(TILT * D2R) * E.r * 0.9, E.y - Math.cos(TILT * D2R) * E.r * 0.9];
  const spole = [E.x + Math.sin(TILT * D2R) * E.r * 0.9, E.y + Math.cos(TILT * D2R) * E.r * 0.9];
  const streams = [
    { pts: [[44, 58], [120, 50], [178, 52], [npole[0] - 4, npole[1] - 6]], curve: true },
    { pts: [[46, 86], [150, 86]] },
    { pts: [[48, 112], [160, 112]] },
    { pts: [[46, 138], [150, 138]] },
    { pts: [[44, 166], [120, 174], [178, 176], [spole[0] - 8, spole[1] + 6]], curve: true },
  ];
  const dot = (x, y, r, o) => bg.appendChild(kit.s("circle", { cx: x, cy: y, r, fill: "#FFE0A8", opacity: o }));
  for (const st of streams) {
    const d = st.curve
      ? `M${st.pts[0][0]} ${st.pts[0][1]} C${st.pts[1][0]} ${st.pts[1][1]} ${st.pts[2][0]} ${st.pts[2][1]} ${st.pts[3][0]} ${st.pts[3][1]}`
      : `M${st.pts[0][0]} ${st.pts[0][1]} L${st.pts[1][0]} ${st.pts[1][1]}`;
    const probe = kit.s("path", { d });
    bg.appendChild(probe);
    const len = probe.getTotalLength();
    probe.setAttribute("stroke", "#FFD9A0"); probe.setAttribute("stroke-width", "0.8"); probe.setAttribute("opacity", "0.28"); probe.setAttribute("fill", "none");
    for (let s = 6; s < len - 6; s += 9) {
      const p = probe.getPointAtLength(s);
      dot(p.x, p.y, 1.5, 0.45 + 0.45 * (s / len));
    }
    // 끝의 화살촉
    const p1 = probe.getPointAtLength(len), p0 = probe.getPointAtLength(len - 3);
    const ux = (p1.x - p0.x) / 3, uy = (p1.y - p0.y) / 3;
    bg.appendChild(kit.s("path", { d: `M${p1.x + ux * 5} ${p1.y + uy * 5} L${p1.x - uy * 3.6} ${p1.y + ux * 3.6} L${p1.x + uy * 3.6} ${p1.y - ux * 3.6} Z`, fill: "#FFD9A0", opacity: 0.95 }));
  }

  // ── 입체: 지구(태양 쪽인 왼쪽에서 빛), 두 극의 오로라, 인공위성 ──
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 160, 1000], look: [0, 0, 0], env: false, key: [-900, 60, 380], keyI: 2.6, fillI: 0.0, rimI: 0.0, shadows: false });
  const { THREE: T, scene, renderer } = st;
  scene.add(new T.AmbientLight(0x6f86b8, 0.16));
  const at = (x, y) => {
    // 화면 좌표 → 사진기가 조금 위에서 내려다보는 장면의 한 점(z = 0 면). 사진기 행렬을 먼저 맞춘다(첫 호출 때 아직 단위 행렬이다)
    st.camera.updateMatrixWorld();
    const v = new T.Vector3(((x / W) * 2 - 1), -((y / H) * 2 - 1), 0).unproject(st.camera);
    const dir = new T.Vector3(); st.camera.getWorldDirection(dir);
    const t = -v.z / dir.z;
    return v.addScaledVector(dir, t);
  };
  const tex = await kit.loadTex(T, "/public/textures/earth.jpg");
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const earth = new T.Group();
  const globe = new T.Mesh(new T.SphereGeometry(E.r, 128, 96), new T.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 }));
  globe.rotation.y = -1.9; // 유라시아 쪽이 낮에 보이게
  earth.add(globe);
  // 오로라: 위도 약 67°의 고리 + 고리 위로 선 옅은 커튼(아래가 초록, 위로 갈수록 보라에서 투명)
  const curtainTex = kit.canvasTex(T, renderer, kit.canvas(8, 128, (c, w, h) => {
    const g = c.createLinearGradient(0, h, 0, 0);
    g.addColorStop(0, "rgba(110,255,170,0.9)"); g.addColorStop(0.5, "rgba(90,235,175,0.4)"); g.addColorStop(1, "rgba(120,160,255,0)");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }));
  // 밤 쪽(오른쪽, +x)이 더 밝게: 꼭짓점 색으로 밝기를 준다(더하기 섞기라 어두운 곳은 거의 안 보인다)
  const nightTint = (geo, base) => {
    const p = geo.attributes.position;
    const c = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const nx = p.getX(i) / Math.max(1e-6, Math.hypot(p.getX(i), p.getZ(i)));
      const k = 0.28 + 0.72 * Math.min(1, Math.max(0, (nx + 0.35) / 1.1));
      c[i * 3] = base[0] * k; c[i * 3 + 1] = base[1] * k; c[i * 3 + 2] = base[2] * k;
    }
    geo.setAttribute("color", new T.BufferAttribute(c, 3));
    return geo;
  };
  for (const sgn of [1, -1]) {
    const co = 23 * D2R; // 극에서 잰 각(고리 반지름), 위도 약 67°
    const rr = E.r * 1.012 * Math.sin(co);
    const ringGeo = nightTint(new T.TorusGeometry(rr, E.r * 0.013, 10, 180), [0.42, 1, 0.68]);
    const ring = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = sgn * E.r * 1.012 * Math.cos(co);
    ring.userData.noEdge = true;
    earth.add(ring);
    const curGeo = new T.CylinderGeometry(rr * 0.985, rr, E.r * 0.075, 180, 1, true);
    // 원기둥의 꼭짓점은 xz 면에 있다(고리와 달리 회전하지 않았다): 밤 쪽 밝기를 같은 식으로
    const cp = curGeo.attributes.position;
    const cc = new Float32Array(cp.count * 3);
    for (let i = 0; i < cp.count; i++) {
      const nx = cp.getX(i) / Math.max(1e-6, Math.hypot(cp.getX(i), cp.getZ(i)));
      const k = 0.25 + 0.75 * Math.min(1, Math.max(0, (nx + 0.35) / 1.1));
      cc[i * 3] = k; cc[i * 3 + 1] = k; cc[i * 3 + 2] = k;
    }
    curGeo.setAttribute("color", new T.BufferAttribute(cc, 3));
    const cur = new T.Mesh(curGeo, new T.MeshBasicMaterial({ map: curtainTex, vertexColors: true, transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    cur.position.y = sgn * (E.r * 1.012 * Math.cos(co) + E.r * 0.0375);
    if (sgn < 0) cur.rotation.x = Math.PI;
    cur.userData.noEdge = true;
    earth.add(cur);
  }
  earth.rotation.z = TILT * D2R; // 북극이 왼쪽(태양 쪽)으로
  earth.position.copy(at(E.x, E.y));
  scene.add(earth);
  // 인공위성(몸통 + 태양 전지판 둘)
  const sat = new T.Group();
  sat.add(new T.Mesh(new T.BoxGeometry(8, 7, 7), new T.MeshStandardMaterial({ color: 0xd8b25a, roughness: 0.55, metalness: 0.2 })));
  for (const sx of [-1, 1]) {
    const p = new T.Mesh(new T.BoxGeometry(15, 6, 0.8), new T.MeshStandardMaterial({ color: 0x3a70cc, roughness: 0.45, metalness: 0.1 }));
    p.position.x = sx * 12;
    sat.add(p);
  }
  sat.rotation.set(0.5, 0.6, -0.35);
  sat.position.copy(at(178, 44));
  scene.add(sat);
  await kit.renderIllus(st, { radius: 5, thickness: 8, edgeK: 0.35, edgeW: 1.0 });
  await kit.frame();
  const eb = new T.Box3().setFromObject(globe);
  const pe = st.project([earth.position.x, earth.position.y, earth.position.z]);
  console.log(`placed 지구 화면 자리 (${pe.map((v) => v.toFixed(1))}) = 설계 (${E.x}, ${E.y})`);
  console.log(`placed 지구 반지름 ${((eb.max.x - eb.min.x) / 2).toFixed(1)}px, 자전축 기울기(화면) ${TILT}°, 오로라 고리 위도 67°`);

  // ── 앞: 이름, 고장 표시, 칩 줄 ──
  const fg = kit.layer(root, W, H);
  const SKY = "#0D1830";
  const dtext = (x, y, str, { size = 13, weight = 700, color = "#E6EDFF", anchor = "middle" } = {}) => {
    size = Math.max(kit.MIN_FONT, size);
    fg.appendChild(kit.s("text", { x, y, "text-anchor": anchor, "dominant-baseline": "central", "font-size": size, "font-weight": weight, fill: color,
      stroke: SKY, "stroke-width": 3.2, "stroke-linejoin": "round", "paint-order": "stroke", style: "letter-spacing:-.02em" }, str));
  };
  const lead = (pts) => fg.appendChild(kit.s("path", { d: pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" "), stroke: "#C9D6F2", "stroke-width": 0.9, fill: "none" }));
  dtext(8, 22, "태양", { size: 13.5, weight: 800, color: "#FFD38A", anchor: "start" });
  dtext(98, 34, "태양풍", { size: 13.5, weight: 800, color: "#FFE0A8" });
  dtext(E.x, E.y + E.r + 18, "지구", { size: 13.5, weight: 800, color: "#BFD8FF" });
  // 오로라 이름: 밤 쪽(오른쪽) 두 고리 끝을 가리킨다
  const nEnd = [E.x + 14, E.y - E.r * 0.9], sEnd = [E.x + 24, E.y + E.r * 0.86];
  lead([[300, 102], nEnd]);
  lead([[300, 122], sEnd]);
  dtext(313, 112, "오로라", { size: 13.5, weight: 800, color: "#7DFFC0" });
  // 인공위성 고장: 노란 번개 표시
  fg.appendChild(kit.s("path", { d: "M193 34 L188 42 L193 42 L189 51", stroke: "#FFD25E", "stroke-width": 1.8, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }));
  dtext(176, 18, "인공위성 고장", { size: 13, weight: 800, color: "#FFE9B8" });

  // 아래 줄: 랩의 '그때 지구는' 칩과 같은 이름과 그림
  const ICON = {
    aurora: `<path d="M2.5 13.2c.4-3.6 1.2-7 2.4-10.2M7.1 13.2c.4-3.6 1.1-7 2.2-10.2M11.6 13.2c.3-3.4 1-6.6 2-9.6" stroke="#12A36B" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M1.3 14.4h13.4" stroke="#9A5B00" stroke-width="1.3" stroke-linecap="round"/>`,
    radio: `<g stroke="#9A5B00" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7.2v7.3M5.6 14.5h4.8M8 7.2 5.9 12.6M8 7.2l2.1 5.4" stroke-width="1.4"/><path d="M5.1 5.1a4.1 4.1 0 0 1 5.8 0M3.2 3.2a6.8 6.8 0 0 1 9.6 0" stroke-width="1.4"/><path d="M12.4 9.2l2.6 2.6M15 9.2l-2.6 2.6" stroke-width="1.5"/></g>`,
    power: `<path d="M8 1.6 4.4 14.6M8 1.6l3.6 13M4.9 5.2h6.2M3.6 8.4h8.8M5.2 8.4l5.4 4.4M10.8 8.4l-5.4 4.4M3.4 14.6h9.2" stroke="#9A5B00" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  };
  const chips = [["aurora", "넓은 오로라"], ["radio", "통신 장애"], ["power", "정전"]];
  const CY = 230;
  // 칩 너비는 글자 폭으로 잰다(앞말 '그때 지구는'까지 한 줄에 들어가게)
  const meas = kit.s("text", { "font-size": 13, "font-weight": 800, style: "letter-spacing:-.03em" }, "");
  fg.appendChild(meas);
  const tw = (str) => { meas.textContent = str; return meas.getComputedTextLength(); };
  const PAD = 7, IC = 14, GAP = 3, SEP = 5;
  const lead0 = tw("그때 지구는");
  const widths = chips.map(([, n]) => PAD + IC + GAP + tw(n) + PAD + 1);
  const total = lead0 + 8 + widths.reduce((a2, b2) => a2 + b2, 0) + SEP * (chips.length - 1);
  let x = (W - total) / 2;
  dtext(x, CY, "그때 지구는", { size: 13, weight: 800, color: "#C9D6F2", anchor: "start" });
  x += lead0 + 8;
  chips.forEach(([k, name], i) => {
    const w = widths[i];
    fg.appendChild(kit.s("rect", { x, y: CY - 13, width: w, height: 26, rx: 13, fill: "#FFF3D6", stroke: "#F5C56B", "stroke-width": 1 }));
    const ic = kit.s("svg", { x: x + PAD, y: CY - IC / 2, width: IC, height: IC, viewBox: "0 0 16 16", overflow: "visible" });
    ic.innerHTML = ICON[k];
    fg.appendChild(ic);
    fg.appendChild(kit.s("text", { x: x + PAD + IC + GAP, y: CY, "dominant-baseline": "central", "font-size": 13, "font-weight": 800, fill: "#9A5B00", style: "letter-spacing:-.03em" }, name));
    x += w + SEP;
  });
  meas.remove();
  console.log(`placed 칩 줄 ${((W - total) / 2).toFixed(1)}~${(x - SEP).toFixed(1)} (그림 폭 ${W})`);
}
