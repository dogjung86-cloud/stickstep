// u7l6f1 · 일식과 월식이 매달 일어나지 않는 까닭: 달이 도는 길은 지구가 태양을 도는 면에 대해 기울어 있다(그림은 16°로 과장, 실제 약 5°).
// 검산 메모: u7l6f1.md. 태양은 왼쪽(햇빛 +x). 거의 옆에서 조금 위(8°)에서 본다. 달은 위에서 보아 시계 반대로 돌아 앞쪽(사진기 쪽)을 왼쪽에서 오른쪽으로 지난다.
// (가) 기울어진 길의 '높낮이 축'이 태양 쪽을 향할 때: 삭은 태양-지구 선 위, 망은 아래(한 판이 기울었으니 반드시 반대쪽). 그림자가 비껴간다.
// (나) 길이 면을 지나는 두 곳이 태양 쪽을 향할 때: 삭과 망이 면 위에 놓여 일식과 월식. 길이 기운 방향은 그대로이고 (가)와 (나)는 한 해 가운데 다른 때다.
// 크기는 지구 반지름 18px, 달은 그 0.27배(실제 비), 달 자리의 지구 그림자 반지름은 지구의 0.73배(실제 비). 거리만 줄였다.
export const meta = { key: "u7l6f1", w: 340, h: 360, scale: 3, quality: 88, bg: "#0B1426" };

const D2R = Math.PI / 180;

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const EL = 8 * D2R, INC = 16 * D2R;
  const RE = 18, RM = 0.27 * RE, RO = 92, UMB = 0.73 * RE; // 지구, 달, 달 궤도 반지름, 달 자리의 지구 본그림자 반지름
  const EX = 228;           // 지구의 화면 x
  const PANEL = [{ y0: 0, cy: 98, mode: "miss" }, { y0: 182, cy: 278, mode: "hit" }];

  const bg = kit.layer(root, W, H);
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 1000 * Math.sin(EL), 1000 * Math.cos(EL)], look: [0, 0, 0], env: false, key: [-1000, 0, 0], keyI: 2.8, fillI: 0, rimI: 0, shadows: false });
  const { THREE: T, scene, renderer } = st;
  scene.add(new T.AmbientLight(0x9fb2d8, 0.05));
  const [earthTex, moonTex] = await Promise.all([kit.loadTex(T, "/public/textures/earth.jpg"), kit.loadTex(T, "/public/textures/moon.jpg")]);
  for (const t of [earthTex, moonTex]) t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  // 화면 y → 세계 y (직교 사진기가 8° 내려다보므로 cos로 나눈다)
  const worldY = (sy) => (H / 2 - sy) / Math.cos(EL);
  const earthMat = new T.MeshStandardMaterial({ map: earthTex, roughness: 0.9 });
  const moonMat = new T.MeshStandardMaterial({ map: moonTex, roughness: 1 });
  const moonEclipsed = new T.MeshStandardMaterial({ map: moonTex, roughness: 1, color: 0x8a3a26, emissive: 0x3a0f08, emissiveIntensity: 0.6 });
  const P = []; // 패널별 계산 결과
  for (const pn of PANEL) {
    const O = [EX - W / 2, worldY(pn.cy), 0];
    const earth = new T.Mesh(new T.SphereGeometry(RE, 64, 48), earthMat); earth.position.set(...O); earth.rotation.y = 2.4; scene.add(earth);
    // 달이 도는 길: θ가 커질수록 위에서 보아 시계 반대(θ=0 +x, 90° 먼 쪽, 180° -x, 270° 가까운 쪽)
    const orbit = (th) => {
      const c = Math.cos(th), s = Math.sin(th);
      if (pn.mode === "miss") return [O[0] + RO * c * Math.cos(INC), O[1] - RO * c * Math.sin(INC), O[2] - RO * s]; // 높낮이 축이 태양 쪽: 삭(θ=180°)이 위
      return [O[0] + RO * c, O[1] - RO * s * Math.sin(INC), O[2] - RO * s * Math.cos(INC)]; // 면을 지나는 곳이 태양 쪽: 삭과 망이 면 위
    };
    const newM = orbit(Math.PI), fullM = orbit(0);
    const mN = new T.Mesh(new T.SphereGeometry(RM, 40, 28), moonMat); mN.position.set(...newM); mN.rotation.y = Math.PI; scene.add(mN);
    const mF = new T.Mesh(new T.SphereGeometry(RM, 40, 28), pn.mode === "hit" ? moonEclipsed : moonMat); mF.position.set(...fullM); scene.add(mF);
    P.push({ ...pn, O, orbit, newM, fullM });
  }
  st.render();
  await kit.frame();
  const pr = (v) => st.project(v);

  // ── 바탕(패널 둘): 우주, 햇빛이 비치는 공간(옅은 노랑), 지구가 태양을 도는 면 ──
  const fg = kit.layer(root, W, H);
  // 3D 캔버스가 bg와 fg 사이에 있다. 뒤쪽에 깔 것은 bg, 앞쪽에 얹을 것은 fg.
  bg.appendChild(kit.s("rect", { width: W, height: H, fill: "#0B1426" }));
  const sunImg = await kit.loadImg("/public/photos/sun_whitelight.jpg");
  const report = [];
  const SKY = "#0D1830";
  const dtext = (g, x, y, str, { size = 12, weight = 700, color = "#E6EDFF", anchor = "middle" } = {}) => {
    size = Math.max(kit.MIN_FONT, size);
    g.appendChild(kit.s("text", { x, y, "text-anchor": anchor, "dominant-baseline": "central", "font-size": size, "font-weight": weight, fill: color,
      stroke: SKY, "stroke-width": 3.2, "stroke-linejoin": "round", "paint-order": "stroke", style: "letter-spacing:-.02em" }, str));
  };
  for (const [k, pn] of P.entries()) {
    const top = pn.y0, ph = 176;
    const clipId = kit.id("pc");
    const defs = kit.s("defs"); const cp = kit.s("clipPath", { id: clipId }); cp.appendChild(kit.s("rect", { x: 0, y: top, width: W, height: ph, rx: 10 })); defs.appendChild(cp); bg.appendChild(defs);
    const g = kit.s("g", { "clip-path": `url(#${clipId})` }); bg.appendChild(g);
    g.appendChild(kit.s("rect", { x: 0, y: top, width: W, height: ph, fill: kit.rad(bg, 0.5, 0.5, 0.75, [[0, "#13244A"], [1, "#0A1328"]]) }));
    const rs = kit.rng(11 + k);
    for (let i = 0; i < 50; i++) g.appendChild(kit.s("circle", { cx: rs() * W, cy: top + rs() * ph, r: 0.4 + rs() * 0.4, fill: "#FFFFFF", opacity: 0.15 + rs() * 0.3 }));
    // 햇빛이 비치는 공간
    g.appendChild(kit.s("rect", { x: 0, y: top, width: W, height: ph, fill: kit.lin(bg, 0, 0, 1, 0, [[0, "#FFD27A", 0.15], [1, "#FFD27A", 0.05]]) }));
    // 지구가 태양을 도는 면(얇은 띠)
    const Oc = pr(pn.O);
    const band = [pr([pn.O[0] - 400, pn.O[1], -112]), pr([pn.O[0] + 200, pn.O[1], -112]), pr([pn.O[0] + 200, pn.O[1], 112]), pr([pn.O[0] - 400, pn.O[1], 112])];
    g.appendChild(kit.s("path", { d: "M" + band.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L") + " Z", fill: "#8FB0F0", "fill-opacity": 0.16, stroke: "#9DB6EA", "stroke-opacity": 0.35, "stroke-width": 0.8 }));
    // 그림자(본그림자): 달 그림자는 삭의 달에서 오른쪽으로 좁아져 지구 거리 무렵 끝, 지구 그림자는 지구에서 오른쪽으로 좁아진다
    const sN = pr(pn.newM), sF = pr(pn.fullM);
    const tipX = Oc[0] - (pn.mode === "hit" ? RE * 0.98 : 0);
    const moonShadow = `M${sN[0]} ${sN[1] - RM} L${tipX} ${sN[1]} L${sN[0]} ${sN[1] + RM} Z`;
    const earthShadow = `M${Oc[0]} ${Oc[1] - RE} L${W + 10} ${Oc[1] - RE + (RE - UMB) * ((W + 10 - Oc[0]) / RO)} L${W + 10} ${Oc[1] + RE - (RE - UMB) * ((W + 10 - Oc[0]) / RO)} L${Oc[0]} ${Oc[1] + RE} Z`;
    for (const d of [moonShadow, earthShadow]) g.appendChild(kit.s("path", { d, fill: "#050912", "fill-opacity": 0.9, stroke: "#6B7FA8", "stroke-opacity": 0.55, "stroke-width": 0.7 }));
    // 태양-지구 선
    g.appendChild(kit.s("path", { d: `M${40} ${Oc[1]} L${Oc[0] - RE - 2} ${Oc[1]}`, stroke: "#FFE3A6", "stroke-width": 0.8, "stroke-dasharray": "3 3", opacity: 0.6 }));
    // 태양(왼쪽 가장자리에 걸친 큰 원판, 실사)
    const RSN = 64, sx = -34, sy = Oc[1];
    const sunURL = kit.canvas(RSN * 2 * 2, RSN * 2 * 2, (c, w) => { c.beginPath(); c.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2); c.clip(); const s = (w / 2) / 723; c.drawImage(sunImg, w / 2 - 918 * s, w / 2 - 852 * s, sunImg.width * s, sunImg.height * s); }).toDataURL("image/png");
    g.appendChild(kit.s("circle", { cx: sx, cy: sy, r: RSN + 16, fill: kit.rad(bg, 0.5, 0.5, 0.5, [[0.7, "#FF9A2E", 0.5], [1, "#FF8A1C", 0]]) }));
    g.appendChild(kit.s("image", { href: sunURL, x: sx - RSN, y: sy - RSN, width: RSN * 2, height: RSN * 2 }));
    // 달이 도는 길: 먼 쪽 반(지구 뒤)은 3D 아래에, 가까운 쪽 반은 위에
    const back = [], front = [];
    for (let i = 0; i <= 180; i++) { const th = (i / 180) * Math.PI * 2, v = pn.orbit(th), s = pr(v); (v[2] < 0 ? back : front).push({ th, s }); }
    const pathOf = (arr) => { arr.sort((a, b) => a.th - b.th); return arr.map((p, i) => `${i ? "L" : "M"}${p.s[0].toFixed(2)} ${p.s[1].toFixed(2)}`).join(" "); };
    g.appendChild(kit.s("path", { d: pathOf(back), stroke: "#9CC2FF", "stroke-width": 1.1, fill: "none", opacity: 0.6 }));
    // 가까운 쪽(θ 180°~360°)은 이어서 그린다
    const fr = [];
    for (let i = 0; i <= 90; i++) { const th = Math.PI + (i / 90) * Math.PI; fr.push(pr(pn.orbit(th))); }
    fg.appendChild(kit.s("path", { d: fr.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" "), stroke: "#B9D3FF", "stroke-width": 1.4, fill: "none" }));
    // 진행 화살촉(가까운 쪽, 왼쪽 → 오른쪽)
    for (const thd of [235, 305]) {
      const p = pr(pn.orbit(thd * D2R)), q = pr(pn.orbit((thd + 1) * D2R));
      const tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty), ux = tx / tl, uy = ty / tl, L = 7, Wd = 3.3;
      fg.appendChild(kit.s("path", { d: `M${p[0] + ux * L * 0.55} ${p[1] + uy * L * 0.55} L${p[0] - ux * L * 0.45 - uy * Wd} ${p[1] - uy * L * 0.45 + ux * Wd} L${p[0] - ux * L * 0.45 + uy * Wd} ${p[1] - uy * L * 0.45 - ux * Wd} Z`, fill: "#CFE0FF" }));
    }
    // 검산: 삭과 망의 높이(면에서), 그림자와 지구 사이
    const upN = pn.newM[1] - pn.O[1], upF = pn.fullM[1] - pn.O[1];
    report.push(`${pn.mode} 삭 높이 ${upN.toFixed(1)} 망 높이 ${upF.toFixed(1)} (지구 반지름 ${RE}, 지구 그림자 반지름 ${UMB.toFixed(1)}, 달 반지름 ${RM.toFixed(1)})`);

    // ── 글자 ──
    const title = k === 0 ? "(가) 대부분의 때" : "(나) 한 해에 두 번쯤 오는 때";
    dtext(fg, 10, top + 14, title, { size: 13, weight: 800, color: "#FFFFFF", anchor: "start" });
    dtext(fg, Oc[0], Oc[1] + RE + 12, "지구", { size: 12.5, weight: 800 });
    dtext(fg, sN[0], sN[1] - RM - 11, "삭", { size: 12.5, weight: 800 });
    dtext(fg, 26, Oc[1] - 14, "태양", { size: 12.5, weight: 800, color: "#FFD38A", anchor: "start" });
    if (k === 0) {
      dtext(fg, sF[0] + 1, sF[1] + RM + 11, "망", { size: 12.5, weight: 800 });
      dtext(fg, Oc[0] + 4, sN[1] - 17, "지구 위로 비껴가요", { size: 12, weight: 700, color: "#FFE3A6" });
      dtext(fg, W - 8, sF[1] + RM + 29, "그림자 아래로 비껴가요", { size: 12, weight: 700, color: "#FFE3A6", anchor: "end" });
      // 달이 도는 길: 가까운 쪽 길에서 왼쪽 아래 글자로 지시선
      const lp = pr(pn.orbit(243 * D2R));
      const tx = 104, ty = Oc[1] + 40;
      fg.appendChild(kit.s("path", { d: `M${lp[0]} ${lp[1]} L${tx + 4} ${ty - 7}`, stroke: "#B9D3FF", "stroke-width": 0.9, fill: "none" }));
      fg.appendChild(kit.s("circle", { cx: lp[0], cy: lp[1], r: 1.8, fill: "#B9D3FF" }));
      dtext(fg, tx, ty, "달이 도는 길", { size: 12, weight: 700, color: "#B9D3FF", anchor: "end" });
      dtext(fg, 112, Oc[1] - 1, "지구가 태양을 도는 길", { size: 12, weight: 700, color: "#DCE6FA" });
    } else {
      dtext(fg, sF[0] - 2, sF[1] - RE - 6, "망", { size: 12.5, weight: 800 });
      dtext(fg, tipX - 34, sN[1] + 17, "일식", { size: 12.5, weight: 800, color: "#FFB547" });
      dtext(fg, sF[0] - 2, sF[1] + RE + 4, "월식", { size: 12.5, weight: 800, color: "#FFB547" });
    }
  }
  dtext(fg, W - 8, H - 10, "기울기는 실제(약 5°)보다 크게 그렸어요", { size: 12, weight: 600, color: "#AFC0E2", anchor: "end" });
  console.log("placed " + report.join(" | "));
}
