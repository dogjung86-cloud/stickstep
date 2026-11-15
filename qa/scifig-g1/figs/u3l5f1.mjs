// u3l5f1 · 액체의 열팽창: 같은 플라스크 둘(가열 전, 뜨거운 물에 담근 뒤), 가는 유리관 속 액체 높이, 입자 확대 창.
// 검산 메모: u3l5f1.md. 입자 색은 Ⅲ 온도 램프(가열 전 파랑 쪽, 가열 후 붉은 주황 쪽). 두 창의 입자 수와 크기가 같다.
export const meta = { key: "u3l5f1", w: 340, h: 330, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 70, 600], look: [0, 0, 0], envIntensity: 0.9, key: [-250, 400, 380], keyI: 1.4, fillI: 0.9, rimI: 0.4 });
  const { THREE: T, scene, renderer } = st;
  st.keyL.shadow.camera.left = -260; st.keyL.shadow.camera.right = 260; st.keyL.shadow.camera.top = 260; st.keyL.shadow.camera.bottom = -260; st.keyL.shadow.camera.far = 2000; st.keyL.shadow.camera.updateProjectionMatrix();
  const GY = -150;
  kit.shadowCatcher(T, scene, { y: GY, size: 900, opacity: 0.12 });

  // 삼각 플라스크 단면(반지름, 높이): 바닥 반지름 34, 높이 70에서 목(반지름 9), 목 높이 30
  const FL = [[0, 0], [33, 0], [35, 3], [35, 6], [11, 66], [9.5, 72], [9.5, 100], [11, 102], [11, 104], [8, 104], [8, 72], [9.5, 66], [32.5, 6], [31, 3.5], [0, 3.5]];
  const glassM = new T.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.96, roughness: 0.05, thickness: 0.6, ior: 1.45, clearcoat: 0.6, clearcoatRoughness: 0.08, side: T.DoubleSide, envMapIntensity: 0.55 });
  // 액체는 불투명하게(투과 재질끼리는 서로를 비추지 못해, 유리 속 액체가 사라진다)
  const liqM = new T.MeshPhysicalMaterial({ color: 0x1c46b0, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.25, sheenColor: 0x9cc2ff });
  const LIQ = [[0, 3.6], [31, 3.6], [32.4, 6.2], [9.4, 66], [7.9, 72], [7.9, 100], [0, 100]]; // 목까지 가득(공기층 없음)
  const stopM = new T.MeshPhysicalMaterial({ color: 0x5b5f66, roughness: 0.7, sheen: 0.3 });
  const TUBE_TOP = 220, TUBE_R = 2.2;
  const flask = (x, liquidTop) => {
    const g = new T.Group(); g.position.set(x, GY, 0); scene.add(g);
    const body = new T.Mesh(new T.LatheGeometry(FL.map(([r, y]) => new T.Vector2(r, y)), 96), glassM); body.castShadow = true; g.add(body);
    const liq = new T.Mesh(new T.LatheGeometry(LIQ.map(([r, y]) => new T.Vector2(r, y)), 96), liqM); g.add(liq);
    const stop = new T.Mesh(new T.CylinderGeometry(10.5, 8.5, 18, 32), stopM); stop.position.y = 104; stop.castShadow = true; g.add(stop);
    // 가는 유리관과 그 속의 액체 기둥
    const tubeM = new T.MeshPhysicalMaterial({ color: 0xdfeaf5, transparent: true, opacity: 0.22, roughness: 0.05, clearcoat: 1, side: T.DoubleSide, depthWrite: false });
    const tube = new T.Mesh(new T.CylinderGeometry(TUBE_R + 1.1, TUBE_R + 1.1, TUBE_TOP - 92, 24, 1, true), tubeM); tube.position.y = 92 + (TUBE_TOP - 92) / 2; g.add(tube);
    const col = new T.Mesh(new T.CylinderGeometry(TUBE_R, TUBE_R, liquidTop - 96, 24), liqM); col.position.y = 96 + (liquidTop - 96) / 2; g.add(col);
    const men = new T.Mesh(new T.SphereGeometry(TUBE_R, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), liqM); men.scale.y = 0.45; men.position.y = liquidTop; g.add(men);
    return g;
  };
  const H0 = 150, H1 = 176; // 관 속 액체 끝 높이(플라스크 바닥 기준): 처음, 나중
  const XL = -88, XR = 74;
  flask(XL, H0);
  flask(XR, H1);
  // 뜨거운 물 수조(오른쪽 플라스크를 아래쪽 절반쯤 담근다): 앞쪽 절반을 잘라 플라스크가 보이게
  const bathM = new T.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.05, thickness: 1, ior: 1.5, side: T.DoubleSide });
  const BR = 62, BH = 58;
  const bath = kit.latheCut(T, [[BR - 2, 0], [BR, 0], [BR, BH], [BR - 2, BH], [BR - 2, 2], [0, 2], [0, 0]], { phiStart: Math.PI / 2, phiLength: Math.PI, mat: bathM, capMat: bathM });
  bath.group.position.set(XR, GY, 0); scene.add(bath.group);
  const hotM = new T.MeshPhysicalMaterial({ color: 0xffb27e, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.6, side: T.DoubleSide, depthWrite: false });
  const hot = kit.latheCut(T, [[0, 2], [BR - 2.2, 2], [BR - 2.2, BH - 12], [0, BH - 12]], { phiStart: Math.PI / 2, phiLength: Math.PI, mat: hotM, capMat: hotM });
  hot.group.position.set(XR, GY, 0); hot.group.traverse((o) => (o.userData.noEdge = true)); scene.add(hot.group);

  await kit.renderIllus(st, { radius: 5, thickness: 5, edgeK: 0.3 });
  await kit.frame();

  // ── 높이 표시, 확대 창, 이름 ──
  const svg = kit.layer(root, W, H);
  const P = (p) => st.project(p);
  const yH0 = P([0, GY + H0, 0])[1], yH1 = P([0, GY + H1, 0])[1];
  const xl = P([XL, 0, 0])[0], xr = P([XR, 0, 0])[0];
  // 처음 높이 점선(두 관에 걸쳐)과 나중 높이 점선(오른쪽)
  svg.appendChild(kit.s("path", { d: `M${xl - 18} ${yH0} H${xr + 18}`, stroke: "#5B6475", "stroke-width": 1.2, "stroke-dasharray": "4 3" }));
  svg.appendChild(kit.s("path", { d: `M${xr - 18} ${yH1} H${xr + 18}`, stroke: "#D9480F", "stroke-width": 1.4, "stroke-dasharray": "4 3" }));
  kit.text(svg, xr + 22, yH1, "나중 높이", { size: 12.5, weight: 800, color: "#C2410C", anchor: "start" });
  kit.text(svg, xr + 22, yH0, "처음 높이", { size: 12.5, weight: 700, color: "#3B4456", anchor: "start" });
  // 오른 만큼 화살표
  kit.flowArrow(svg, `M${xr + 13} ${yH0 - 2} L${xr + 13} ${yH1 + 1}`, { w: 2.2, head: 6, hw: 2.4, fill: "#D9480F" });
  // 확대 창: 같은 입자 12개. 가열 전 = 가깝고 불규칙(파랑 쪽), 가열 후 = 사이가 조금 벌어지고 흔들림이 큼(붉은 주황 쪽)
  const win = (cx, cy, R, spread, color, wiggle, anchor) => {
    svg.appendChild(kit.s("path", { d: `M${anchor[0]} ${anchor[1]} L${cx + (anchor[0] < cx ? -R : R) * 0.7} ${cy + R * 0.7}`, stroke: "#8A93A3", "stroke-width": 1, "stroke-dasharray": "3 2" }));
    svg.appendChild(kit.s("circle", { cx, cy, r: R, fill: "#F7F9FC", stroke: "#B9C2D0", "stroke-width": 1.4 }));
    const r = kit.rng(5), pr = 5.2, pts = [];
    // 같은 배치(가까운 12개)를 spread 만큼 벌린다: 수는 그대로
    const base = [[-12, -10], [-1, -13], [10, -9], [-15, 1], [-4, -2], [7, 1], [16, -1], [-11, 11], [0, 9], [11, 11], [-5, 19], [6, 20]];
    for (const [bx, by] of base) pts.push([cx + bx * spread + (r() - 0.5) * 1.5, cy - 4 + by * spread + (r() - 0.5) * 1.5]);
    for (const [x, y] of pts) {
      if (wiggle) for (const k of [0, 1]) svg.appendChild(kit.s("path", { d: `M${x - pr - 2.5} ${y - 2 + k * 4} a ${pr + 2.5} ${pr + 2.5} 0 0 ${k} 0 ${k ? -4 : 4}`, fill: "none", stroke: color, "stroke-width": 1, opacity: 0.55 }));
      const g = kit.rad(svg, 0.35, 0.3, 0.75, [[0, "#FFFFFF", 0.95], [0.35, color], [1, kit.mix(color, "#1B1F2A", 0.35)]]);
      svg.appendChild(kit.s("circle", { cx: x, cy: y, r: pr, fill: g }));
    }
  };
  const tipL = P([XL, GY + H0 - 8, 0]), tipR = P([XR, GY + H1 - 8, 0]);
  win(48, 64, 40, 1.0, "#3D8DFF", false, [tipL[0] - 3, tipL[1]]);
  win(206, 64, 40, 1.14, "#F25C54", true, [tipR[0] - 3, tipR[1]]);
  kit.text(svg, 48, 14, "가열 전", { size: 13.5, weight: 800, color: "#1D5FBF" });
  kit.text(svg, 206, 14, "가열 후", { size: 13.5, weight: 800, color: "#C2410C" });
  kit.text(svg, 127, 64, "입자 수는 같아요", { size: 12, weight: 700, color: "#3B4456" });
  kit.text(svg, 127, 80, "사이만 멀어져요", { size: 12, weight: 700, color: "#3B4456" });
  for (const dx of [-40, 42]) {
    const b0 = P([XR + dx, GY + 50, -20]);
    svg.appendChild(kit.s("path", { d: `M${b0[0]} ${b0[1]} c -5 -8 5 -12 0 -20 c -5 -8 5 -12 0 -20`, fill: "none", stroke: "#F2A26B", "stroke-width": 1.6, "stroke-linecap": "round", opacity: 0.75 }));
  }
  const bathLab = P([XR + 50, GY + 30, 40]);
  kit.text(svg, bathLab[0] + 6, bathLab[1] + 20, "뜨거운 물", { size: 12, weight: 700, color: "#C2410C" });
  const tubeLab = P([XL, GY + 128, 0]);
  kit.label(svg, { at: [tubeLab[0] + 3, tubeLab[1]], via: [tubeLab[0] + 34, tubeLab[1] + 8], to: [tubeLab[0] + 38, tubeLab[1] + 8], text: "가는 유리관", side: "r", size: 12 });
  console.log("proj", JSON.stringify({ yH0, yH1, xl, xr, tipL, tipR, bathLab }));
}
