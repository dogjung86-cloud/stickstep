// u5l4f1 · 탄성력의 방향: 벽에 한끝을 고정한 같은 용수철을 (가) 당길 때, (나) 누를 때. 옆에서 본 모습.
// 검산 메모: u5l4f1.md. 원래 길이 150px(= 6 cm로 봄), 늘어난 길이와 줄어든 길이는 같게 4 cm(40px). 랩 값 1 cm에 0.5 N이라 네 화살표 모두 2 N(같은 길이).
// 두 화살표는 손과 용수철이 닿은 점에서 시작한다. 탄성력은 늘 변형시킨 힘과 반대. 감김 간격은 고르게(늘이면 넓게, 누르면 좁게, 닿지 않게). 벽 쪽의 힘은 그리지 않는다.
export const meta = { key: "u5l4f1", w: 340, h: 312, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const WALL = 30, L0 = 150, D = 40, N = 11, RC = 9, RW = 1.45; // 벽 면, 원래 길이, 변형, 감김 수, 감김 반지름, 철사 반지름
  const SC = [{ y0: 0, yc: 82, mode: "pull" }, { y0: 156, yc: 238, mode: "push" }];
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 140, 1000], look: [0, 0, 0], envIntensity: 0.7, key: [-300, 500, 500], keyI: 1.6, fillI: 0.85, rimI: 0.35, shadows: false });
  const { THREE: T, scene, renderer } = st;
  const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
  const at = (x, y, z = 0) => new T.Vector3(x - W / 2, H / 2 - y, z);
  // 화면 y는 사진기가 조금 위에서 보므로 세계 y와 살짝 다르다. 그림은 st.project로 다시 잰다.
  const steel = new T.MeshPhysicalMaterial({ color: 0xc3cad4, metalness: 0.92, roughness: 0.3 });
  const wood = kit.canvasTex(T, renderer, kit.canvas(256, 512, (c, w, h) => {
    const img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = kit.fbm(x / 50, y / 5, 4, 7), i = (y * w + x) * 4; img.data[i] = 176 + (v - 0.5) * 60; img.data[i + 1] = 128 + (v - 0.5) * 44; img.data[i + 2] = 82 + (v - 0.5) * 30; img.data[i + 3] = 255; }
    c.putImageData(img, 0, 0);
  }));
  const skin = new T.MeshPhysicalMaterial({ color: 0xf1c3a0, roughness: 0.55, sheen: 0.4, sheenColor: 0xffe2d0 });
  const sleeve = new T.MeshPhysicalMaterial({ color: 0x4c6ef5, roughness: 0.6 });
  const cap = (r, len, m) => new T.Mesh(new T.CapsuleGeometry(r, len, 8, 20), m);
  class Helix extends T.Curve {
    constructor(x0, x1, yc) { super(); this.x0 = x0; this.x1 = x1; this.yc = yc; }
    getPoint(t, out = new T.Vector3()) { const a = 2 * Math.PI * N * t; return out.copy(at(this.x0 + (this.x1 - this.x0) * t, this.yc + RC * Math.cos(a), RC * Math.sin(a))); }
  }
  const out = [];
  for (const sc of SC) {
    const end = sc.mode === "pull" ? WALL + L0 + D : WALL + L0 - D;
    // 벽
    const wall = new T.Mesh(new RoundedBoxGeometry(22, 78, 46, 3, 2), new T.MeshStandardMaterial({ map: wood, roughness: 0.85 }));
    wall.position.copy(at(WALL - 11, sc.yc, 0)); scene.add(wall);
    const mount = new T.Mesh(new T.CylinderGeometry(6, 6, 3, 28), steel); mount.rotation.z = Math.PI / 2; mount.position.copy(at(WALL + 1.5, sc.yc)); scene.add(mount);
    // 용수철(고른 감김)
    scene.add(new T.Mesh(new T.TubeGeometry(new Helix(WALL + 3, end, sc.yc), N * 28, RW, 10, false), steel));
    let contact;
    if (sc.mode === "pull") {
      // 끝 고리와 쥔 손
      const stem = new T.Mesh(new T.CylinderGeometry(RW, RW, 9, 12), steel); stem.rotation.z = Math.PI / 2; stem.position.copy(at(end + 4.5, sc.yc)); scene.add(stem);
      const ring = new T.Mesh(new T.TorusGeometry(7.5, 1.7, 14, 48), steel); ring.position.copy(at(end + 16.5, sc.yc)); scene.add(ring);
      contact = [end + 24, sc.yc]; // 손가락이 고리를 거는 곳(고리의 오른쪽 끝)
      const fist = new T.Mesh(new RoundedBoxGeometry(18, 22, 20, 4, 6), skin); fist.position.copy(at(end + 34, sc.yc + 1, 2)); scene.add(fist);
      for (let k = 0; k < 4; k++) { const f = cap(3.3, 9, skin); f.rotation.x = Math.PI / 2; f.position.copy(at(end + 25.5, sc.yc - 7.6 + k * 5.1, 7)); scene.add(f); }
      const thumb = cap(3.2, 10, skin); thumb.rotation.z = Math.PI / 2; thumb.position.copy(at(end + 30, sc.yc - 11.5, 4)); scene.add(thumb);
      const arm = cap(8.5, 60, sleeve); arm.rotation.z = Math.PI / 2; arm.position.copy(at(end + 80, sc.yc + 2, 0)); scene.add(arm);
    } else {
      // 끝판과 누르는 주먹: 주먹의 손가락 마디 쪽이 끝판에 바로 닿는다(닿은 곳이 화살표에 가리지 않게. 처음 판의 손가락은 빨간 화살표에 덮여 손이 떨어져 보였다)
      const plate = new T.Mesh(new T.CylinderGeometry(11, 11, 3, 36), steel); plate.rotation.z = Math.PI / 2; plate.position.copy(at(end + 1.5, sc.yc)); scene.add(plate);
      contact = [end + 3, sc.yc];
      const fist = new T.Mesh(new RoundedBoxGeometry(18, 22, 20, 4, 6), skin); fist.position.copy(at(end + 3 + 3.3 + 9, sc.yc + 1, 2)); scene.add(fist);
      for (let k = 0; k < 4; k++) { const f = cap(3.3, 9, skin); f.rotation.x = Math.PI / 2; f.position.copy(at(end + 3 + 3.3, sc.yc - 7.6 + k * 5.1, 7)); scene.add(f); }
      const thumb = cap(3.2, 10, skin); thumb.rotation.z = Math.PI / 2; thumb.position.copy(at(end + 11, sc.yc - 11.5, 4)); scene.add(thumb);
      const arm = cap(8.5, 60, sleeve); arm.rotation.z = Math.PI / 2; arm.position.copy(at(end + 3 + 3.3 + 18 + 38, sc.yc + 2, 0)); scene.add(arm);
    }
    out.push({ ...sc, end, contact });
  }
  await kit.renderIllus(st, { ao: true, radius: 5, thickness: 4, edge: true, edgeK: 0.4, nT: 0.5, dT: 0.02 });
  await kit.frame();

  const svg = kit.layer(root, W, H);
  const pj = (x, y) => st.project(at(x, y).toArray());
  const report = [];
  for (const sc of out) {
    const yAxis = pj(WALL, sc.yc)[1];
    const xOrig = pj(WALL + L0, sc.yc)[0], xEnd = pj(sc.end, sc.yc)[0], xWall = pj(WALL, sc.yc)[0];
    // 원래 길이(옅은 점선 윤곽, 위쪽에)
    const yG = yAxis - 40;
    let d = "";
    for (let i = 0; i <= 220; i++) { const t = i / 220, x = xWall + 3 + (xOrig - xWall - 3) * t, y = yG + RC * 0.95 * Math.cos(2 * Math.PI * N * t); d += `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`; }
    svg.appendChild(kit.s("path", { d, fill: "none", stroke: "#8A97AB", "stroke-width": 1.1, "stroke-dasharray": "2.4 2.2" }));
    kit.text(svg, xOrig + 6, yG, "원래 길이", { size: 12, weight: 700, color: "#5B6475", anchor: "start" });
    // 원래 끝 자리의 세로 점선
    svg.appendChild(kit.s("path", { d: `M${xOrig} ${yG - RC - 2} L${xOrig} ${yAxis + 48}`, stroke: "#5B6475", "stroke-width": 1, "stroke-dasharray": "3 2.5" }));
    // 변형된 길이 표시(아래)
    const yb = yAxis + 44;
    const [xa, xb] = [Math.min(xOrig, xEnd), Math.max(xOrig, xEnd)];
    svg.appendChild(kit.s("path", { d: `M${xa} ${yb - 4} L${xa} ${yb + 4} M${xa} ${yb} L${xb} ${yb} M${xb} ${yb - 4} L${xb} ${yb + 4}`, stroke: "#2B3445", "stroke-width": 1.2 }));
    kit.text(svg, (xa + xb) / 2, yb + 13, sc.mode === "pull" ? "4 cm 늘어남" : "4 cm 줄어듦", { size: 12, weight: 700, color: "#2B3445" });
    // 두 힘: 닿은 점에서, 같은 길이(2 N)
    const c = pj(...sc.contact), L = 46;
    const push = sc.mode === "pull" ? 1 : -1; // 손이 주는 힘의 방향(+ 오른쪽)
    kit.flowArrow(svg, `M${c[0]} ${c[1]} L${c[0] + push * L} ${c[1]}`, { w: 4.4, head: 10.5, hw: 2.1, fill: "#1C7ED6", stroke: "#FFFFFF" });
    kit.flowArrow(svg, `M${c[0]} ${c[1]} L${c[0] - push * L} ${c[1]}`, { w: 4.4, head: 10.5, hw: 2.1, fill: "#E03131", stroke: "#FFFFFF" });
    svg.appendChild(kit.s("circle", { cx: c[0], cy: c[1], r: 3.3, fill: "#1E2633", stroke: "#FFFFFF", "stroke-width": 1.2 }));
    const handLbl = sc.mode === "pull" ? "당기는 힘 2 N" : "미는 힘 2 N";
    kit.text(svg, c[0] + push * L * 0.72, c[1] - 22, handLbl, { size: 12.5, weight: 800, color: "#1864AB" });
    kit.text(svg, c[0] - push * L * 0.72, c[1] + 25, "탄성력 2 N", { size: 12.5, weight: 800, color: "#C92A2A" });
    kit.text(svg, 8, sc.y0 + 14, sc.mode === "pull" ? "(가) 당길 때" : "(나) 누를 때", { size: 13, weight: 800, anchor: "start" });
    report.push(`${sc.mode} 끝 ${xEnd.toFixed(1)} 원래 ${xOrig.toFixed(1)} 차 ${(xEnd - xOrig).toFixed(1)}px 감김 간격 ${((sc.end - WALL - 3) / N).toFixed(1)}px(철사 지름 ${(2 * RW).toFixed(1)})`);
  }
  console.log("placed " + report.join(" | "));
}
