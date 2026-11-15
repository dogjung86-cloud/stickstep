// u7l6f2 · 개기월식 때 달이 붉은 까닭: 지구 대기를 스치는 햇빛만 그림자 쪽(안쪽)으로 꺾여 붉은 빛으로 달에 닿는다.
// 검산 메모: u7l6f2.md. 옆에서 본 모습, 태양은 왼쪽(햇빛 +x). 지구 반지름 46px, 달 반지름은 그 0.22배(실제 0.27배보다 조금 작게 해 그림자 안이 넉넉히 보이게).
// 달 자리의 지구 본그림자 지름 = 달 지름의 2.7배(실제 비). 대기 두께와 꺾이는 각은 크게 과장(그림 안에 적는다). 거리도 줄였다.
// 지구와 달의 겉은 실사 질감(public/textures, Solar System Scope CC BY 4.0). 달은 스스로 빛나지 않으니 어둑한 구릿빛으로 비춘다.
export const meta = { key: "u7l6f2", w: 340, h: 226, scale: 3, quality: 88, bg: "#0B1426" };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const EX = 90, CY = 108, RE = 46, ATM = 9; // 지구 가운데, 반지름, 대기 두께(과장)
  const MX = 280, RM = 10;                  // 달 가운데 x, 반지름
  const UM = 2.7 * RM;                      // 달 자리의 본그림자 반지름(달 지름의 2.7배 = 지름 비)
  const slope = (RE - UM) / (MX - EX);      // 그림자 가장자리가 좁아지는 기울기

  const bg = kit.layer(root, W, H);
  bg.appendChild(kit.s("rect", { width: W, height: H, fill: kit.rad(bg, 0.55, 0.5, 0.8, [[0, "#14254A"], [1, "#0A1328"]]) }));
  const rs = kit.rng(19);
  for (let i = 0; i < 70; i++) bg.appendChild(kit.s("circle", { cx: rs() * W, cy: rs() * H, r: 0.4 + rs() * 0.4, fill: "#FFFFFF", opacity: 0.15 + rs() * 0.3 }));
  // 햇빛이 비치는 공간(옅게), 그 위의 본그림자
  bg.appendChild(kit.s("rect", { width: W, height: H, fill: kit.lin(bg, 0, 0, 1, 0, [[0, "#FFD27A", 0.13], [1, "#FFD27A", 0.05]]) }));
  const ex = W + 6, hw = (x) => RE - slope * (x - EX);
  const umbra = `M${EX} ${CY - RE} L${ex} ${CY - hw(ex)} L${ex} ${CY + hw(ex)} L${EX} ${CY + RE} Z`;
  bg.appendChild(kit.s("path", { d: umbra, fill: "#04070F", "fill-opacity": 0.9, stroke: "#6B7FA8", "stroke-opacity": 0.5, "stroke-width": 0.7 }));

  // ── 지구와 달(입체) ──
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 0, 1000], look: [0, 0, 0], env: false, key: [-1000, 0, 0], keyI: 2.7, fillI: 0, rimI: 0, shadows: false });
  const { THREE: T, scene, renderer } = st;
  scene.add(new T.AmbientLight(0x9fb2d8, 0.05));
  const [earthTex, moonTex] = await Promise.all([kit.loadTex(T, "/public/textures/earth.jpg"), kit.loadTex(T, "/public/textures/moon.jpg")]);
  for (const t of [earthTex, moonTex]) t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const at = (x, y) => [x - W / 2, H / 2 - y, 0];
  const earth = new T.Mesh(new T.SphereGeometry(RE, 96, 64), new T.MeshStandardMaterial({ map: earthTex, roughness: 0.9 }));
  earth.position.set(...at(EX, CY)); earth.rotation.y = 2.6; earth.rotation.z = 0.2; scene.add(earth);
  // 달: 그림자 속이라 햇빛은 닿지 않고, 지구 대기를 지나 꺾인 붉은 빛이 왼쪽(지구 쪽) 둘레에서 고르게 온다
  const moon = new T.Mesh(new T.SphereGeometry(RM, 64, 48), new T.MeshStandardMaterial({ map: moonTex, roughness: 1, color: 0xb4522e, emissive: 0x4e170a, emissiveIntensity: 0.95 }));
  moon.position.set(...at(MX, CY)); moon.rotation.y = -Math.PI / 2 + 0.2; scene.add(moon);
  st.render();
  await kit.frame();

  const fg = kit.layer(root, W, H);
  // 지구 대기(두께 과장): 낮 쪽은 옅은 파랑, 위아래 가장자리(햇빛이 스치는 곳)는 붉게
  const atmId = kit.id("atm");
  const defs = kit.s("defs");
  const rg = kit.s("radialGradient", { id: atmId, gradientUnits: "userSpaceOnUse", cx: EX, cy: CY, r: RE + ATM });
  for (const [o, c, a] of [[RE / (RE + ATM), "#9CC8FF", 0.75], [(RE + ATM * 0.55) / (RE + ATM), "#7FB2FF", 0.32], [1, "#7FB2FF", 0]]) rg.appendChild(kit.s("stop", { offset: o, "stop-color": c, "stop-opacity": a }));
  defs.appendChild(rg); fg.appendChild(defs);
  fg.appendChild(kit.s("path", { d: `M${EX + RE + ATM} ${CY} A${RE + ATM} ${RE + ATM} 0 1 0 ${EX - RE - ATM} ${CY} A${RE + ATM} ${RE + ATM} 0 1 0 ${EX + RE + ATM} ${CY} Z M${EX + RE} ${CY} A${RE} ${RE} 0 1 1 ${EX - RE} ${CY} A${RE} ${RE} 0 1 1 ${EX + RE} ${CY} Z`, fill: `url(#${atmId})`, "fill-rule": "evenodd" }));

  // ── 햇빛 줄기 ──
  const glow = kit.blurFilter(fg, 1.4);
  const rayG = kit.s("g", { fill: "none", "stroke-linecap": "round" });
  fg.appendChild(rayG);
  const arrowHead = (x, y, ang, color, L = 7, Wd = 3.2) => {
    const ux = Math.cos(ang), uy = Math.sin(ang);
    rayG.appendChild(kit.s("path", { d: `M${x + ux * L * 0.55} ${y + uy * L * 0.55} L${x - ux * L * 0.45 - uy * Wd} ${y - uy * L * 0.45 + ux * Wd} L${x - ux * L * 0.45 + uy * Wd} ${y - uy * L * 0.45 - ux * Wd} Z`, fill: color }));
  };
  // (1) 지구에 닿는 빛: 낮 쪽 표면에서 멈춘다
  for (const dy of [-30, 0, 30]) {
    const xs = EX - Math.sqrt(RE * RE - dy * dy) - 1;
    rayG.appendChild(kit.s("path", { d: `M4 ${CY + dy} L${xs} ${CY + dy}`, stroke: "#FFE7A8", "stroke-width": 1.3, opacity: 0.75 }));
    arrowHead(xs - 12, CY + dy, 0, "#FFE7A8");
  }
  // (2) 대기 바깥을 지나는 빛: 꺾이지 않고 곧게, 달에 닿지 않는다
  for (const dy of [-76, 76]) {
    rayG.appendChild(kit.s("path", { d: `M4 ${CY + dy} L${W - 4} ${CY + dy}`, stroke: "#FFE7A8", "stroke-width": 1.3, opacity: 0.7 }));
    arrowHead(W - 22, CY + dy, 0, "#FFE7A8");
  }
  // (3) 대기를 스치는 빛: 대기 속에서 안쪽으로 꺾이고 붉어져 그림자 속 달에 닿는다
  const report = [];
  for (const sgn of [-1, 1]) for (const k of [0, 1]) {
    const y0 = CY + sgn * (RE + 2.5 + k * 3.5);
    const target = [MX - RM * 0.75, CY + sgn * (RM * 0.35 + k * 2.6)];
    const tanB = (sgn * (y0 - target[1])) / (target[0] - EX); // 꺾인 뒤 기울기(안쪽으로)
    const p0 = [EX - 16, y0], p1 = [EX, y0], p2 = [EX + 16, y0 - sgn * 16 * tanB];
    const gid = kit.id("ry");
    const d2 = kit.s("defs");
    const lg = kit.s("linearGradient", { id: gid, gradientUnits: "userSpaceOnUse", x1: EX - 20, y1: 0, x2: target[0], y2: 0 });
    for (const [o, c] of [[0, "#FFE7A8"], [0.08, "#FFB45C"], [0.3, "#FF6A3C"], [1, "#E8452E"]]) lg.appendChild(kit.s("stop", { offset: o, "stop-color": c }));
    d2.appendChild(lg); fg.appendChild(d2);
    rayG.appendChild(kit.s("path", { d: `M4 ${y0} L${p0[0]} ${p0[1]}`, stroke: "#FFE7A8", "stroke-width": 1.4, opacity: 0.85 }));
    const dd = `M${p0[0]} ${p0[1]} Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} L${target[0]} ${target[1]}`;
    const gl = kit.s("path", { d: dd, stroke: "#FF5A36", "stroke-width": 4, opacity: 0.35 }); gl.setAttribute("filter", glow); rayG.appendChild(gl);
    rayG.appendChild(kit.s("path", { d: dd, stroke: `url(#${gid})`, "stroke-width": k ? 1.3 : 1.8 }));
    if (k === 0) { const mx = EX + 100, my = p2[1] - sgn * (mx - p2[0]) * tanB; arrowHead(mx, my, Math.atan2(-sgn * tanB, 1), "#FF6A3C"); }
    report.push(`꺾인 각 ${(Math.atan(tanB) * 180 / Math.PI).toFixed(1)}°`);
  }
  report.push(`달 자리 본그림자 반지름 ${hw(MX).toFixed(1)} = 달 반지름 ${RM}의 ${(hw(MX) / RM).toFixed(2)}배`);
  console.log("placed " + report.join(" | "));

  // ── 이름 ──
  const SKY = "#0D1830";
  const dtext = (x, y, str, { size = 12, weight = 700, color = "#E6EDFF", anchor = "middle" } = {}) => {
    fg.appendChild(kit.s("text", { x, y, "text-anchor": anchor, "dominant-baseline": "central", "font-size": size, "font-weight": weight, fill: color,
      stroke: SKY, "stroke-width": 3.2, "stroke-linejoin": "round", "paint-order": "stroke", style: "letter-spacing:-.02em" }, str));
  };
  const lead = (pts, color = "#B9C8E8") => fg.appendChild(kit.s("path", { d: pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" "), stroke: color, "stroke-width": 0.9, fill: "none" }));
  dtext(8, CY - 92, "햇빛", { size: 13, weight: 800, color: "#FFE3A6", anchor: "start" });
  dtext(EX, CY + RE + ATM + 13, "지구", { size: 12.5, weight: 800 });
  const ap = [EX - (RE + ATM * 0.5) * Math.cos(1.0), CY - (RE + ATM * 0.5) * Math.sin(1.0)];
  lead([ap, [ap[0] + 18, ap[1] - 22]]);
  dtext(ap[0] + 20, ap[1] - 29, "지구 대기", { size: 12, weight: 700, color: "#BFD8FF", anchor: "start" });
  dtext(196, CY, "지구의 그림자", { size: 12, weight: 700, color: "#AFC0E2" });
  dtext(206, CY - 48, "붉은 빛", { size: 12.5, weight: 800, color: "#FF8A66" });
  lead([[MX + 4, CY + RM + 2], [MX + 14, CY + 44]], "#E9A08A");
  dtext(W - 6, CY + 52, "개기월식의 달", { size: 12.5, weight: 800, color: "#FFB89E", anchor: "end" });
  dtext(W - 6, H - 10, "대기의 두께와 빛이 꺾이는 정도는 크게 그렸어요", { size: 12, weight: 600, color: "#AFC0E2", anchor: "end" });
}
