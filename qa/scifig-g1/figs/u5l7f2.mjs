// u5l7f2 · 같은 빠르기로 도는 회전목마: 위에서 내려다본 회전판과, 그 위에 고정된 마차 자리 하나를 같은 시간 간격의 네 자리에 그린 모습.
// 검산 메모: u5l7f2.md. 자리마다 초록 운동 방향(원에 접함)과 빨간 힘(중심을 향함). 두 화살표는 서로 수직이고 네 자리 모두 같은 길이.
// 바깥을 향하는 화살표는 없다. 회전판은 위에서 보아 시계 반대로 돈다. 말이 오르내리는 움직임은 넣지 않는다(고정된 마차 자리).
export const meta = { key: "u5l7f2", w: 340, h: 304, scale: 3, quality: 86 };

const D2R = Math.PI / 180;

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const CX = 140, CY = 158, RP = 114, RS = 82; // 회전판 가운데, 반지름, 자리 반지름
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 1000, 0], look: [0, 0, 0], envIntensity: 0.6, key: [-300, 700, -260], keyI: 1.7, fillI: 0.9, rimI: 0.25, shadows: true });
  const { THREE: T, scene, camera, renderer, keyL } = st;
  camera.up.set(0, 0, -1); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  const sc = keyL.shadow.camera; sc.left = -200; sc.right = 200; sc.top = 200; sc.bottom = -200; sc.near = 100; sc.far = 2000; sc.updateProjectionMatrix();
  keyL.shadow.mapSize.set(2048, 2048); keyL.shadow.radius = 4; keyL.shadow.normalBias = 0.4;
  // 화면 (x, y) → 세계 (x, 0, z): 위에서 보므로 화면 아래쪽이 +z
  const at = (x, y, h = 0) => [x - W / 2, h, y - H / 2];
  // 회전판: 칠한 나무 판(가운데에서 뻗는 무늬)과 둘레 띠
  const deck = kit.canvasTex(T, renderer, kit.canvas(1024, 1024, (c, w) => {
    const cx = w / 2;
    for (let i = 0; i < 24; i++) {
      c.beginPath(); c.moveTo(cx, cx); c.arc(cx, cx, w / 2, (i / 24) * Math.PI * 2, ((i + 1) / 24) * Math.PI * 2); c.closePath();
      c.fillStyle = i % 2 ? "#D7A86E" : "#C4915A"; c.fill();
    }
    const img = c.getImageData(0, 0, w, w);
    for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) { const n = (kit.fbm(x / 7, y / 90, 2, 3) - 0.5) * 22, i = (y * w + x) * 4; img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n * 0.8; }
    c.putImageData(img, 0, 0);
    c.lineWidth = 26; c.strokeStyle = "#D9485F"; c.beginPath(); c.arc(cx, cx, w / 2 - 14, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 6; c.strokeStyle = "#F7C948"; c.beginPath(); c.arc(cx, cx, w / 2 - 32, 0, Math.PI * 2); c.stroke();
  }));
  const plat = new T.Mesh(new T.CylinderGeometry(RP, RP, 10, 128), [new T.MeshStandardMaterial({ color: 0xc8384f, roughness: 0.6 }), new T.MeshStandardMaterial({ map: deck, roughness: 0.75 }), new T.MeshStandardMaterial({ color: 0x8a2436 })]);
  plat.position.set(...at(CX, CY, -5)); plat.receiveShadow = true; scene.add(plat);
  // 가운데 기둥
  const pole = new T.Mesh(new T.CylinderGeometry(15, 17, 46, 48), new T.MeshPhysicalMaterial({ color: 0xf2c14e, roughness: 0.35, metalness: 0.3, clearcoat: 0.5 }));
  pole.position.set(...at(CX, CY, 23)); pole.castShadow = true; scene.add(pole);
  const capM = new T.Mesh(new T.ConeGeometry(19, 16, 48), new T.MeshPhysicalMaterial({ color: 0xd9485f, roughness: 0.4, clearcoat: 0.6 }));
  capM.position.set(...at(CX, CY, 54)); capM.castShadow = true; scene.add(capM);
  // 마차 자리(같은 자리를 같은 시간 간격의 네 곳에): 진행 방향(접선)으로 길쭉하게
  const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
  const coachM = new T.MeshPhysicalMaterial({ color: 0x3f8edc, roughness: 0.4, clearcoat: 0.6 });
  const trimM = new T.MeshPhysicalMaterial({ color: 0xf7c948, roughness: 0.35, metalness: 0.4 });
  const seatM = new T.MeshStandardMaterial({ color: 0xd9485f, roughness: 0.7 });
  const ANG = [-20, 70, 160, 250]; // 화면에서 잰 각(시계 반대가 +, 0°가 오른쪽)
  const seats = [];
  for (const ad of ANG) {
    const a = ad * D2R, sx = CX + RS * Math.cos(a), sy = CY - RS * Math.sin(a);
    const g = new T.Group();
    const body = new T.Mesh(new RoundedBoxGeometry(34, 20, 22, 4, 5), coachM); body.position.y = 12; body.castShadow = true; g.add(body);
    const seat = new T.Mesh(new RoundedBoxGeometry(14, 6, 16, 2, 2.5), seatM); seat.position.set(-4, 23, 0); g.add(seat);
    const back = new T.Mesh(new RoundedBoxGeometry(5, 12, 18, 2, 2), trimM); back.position.set(-13, 26, 0); g.add(back);
    const front = new T.Mesh(new RoundedBoxGeometry(5, 8, 18, 2, 2), trimM); front.position.set(14, 24, 0); g.add(front);
    g.position.set(...at(sx, sy, 0));
    // 마차의 앞(+x 쪽)이 진행 방향을 보게: 화면 접선 (−sin a, −cos a) → 세계 (−sin a, 0, −cos a)
    g.rotation.y = Math.atan2(Math.cos(a), -Math.sin(a));
    scene.add(g);
    seats.push({ a, sx, sy });
  }
  kit.shadowCatcher(T, scene, { y: -10.5, size: 600, opacity: 0.12 });
  await kit.renderIllus(st, { ao: true, radius: 8, thickness: 6, edge: true, edgeK: 0.38, nT: 0.5, dT: 0.02 });
  await kit.frame();

  const svg = kit.layer(root, W, H);
  // 지나는 길(점선 원)
  svg.appendChild(kit.s("circle", { cx: CX, cy: CY, r: RS, fill: "none", stroke: "#5B6475", "stroke-width": 1.1, "stroke-dasharray": "4 3.5", opacity: 0.8 }));
  const LV = 40, LF = 34;
  const report = [];
  for (const s of seats) {
    const tx = -Math.sin(s.a), ty = -Math.cos(s.a); // 화면에서 시계 반대 접선
    const rx = (CX - s.sx) / RS, ry = (CY - s.sy) / RS; // 중심 쪽
    const g0 = [s.sx + tx * 6, s.sy + ty * 6];
    kit.flowArrow(svg, `M${g0[0]} ${g0[1]} L${s.sx + tx * (6 + LV)} ${s.sy + ty * (6 + LV)}`, { w: 4.2, head: 10, hw: 2.1, fill: "#2B9348", stroke: "#FFFFFF" });
    kit.flowArrow(svg, `M${s.sx + rx * 4} ${s.sy + ry * 4} L${s.sx + rx * (4 + LF)} ${s.sy + ry * (4 + LF)}`, { w: 4.2, head: 10, hw: 2.1, fill: "#E03131", stroke: "#FFFFFF" });
    svg.appendChild(kit.s("circle", { cx: s.sx, cy: s.sy, r: 3, fill: "#FFFFFF", stroke: "#2B3445", "stroke-width": 1.3 }));
    report.push(`${(s.a / D2R).toFixed(0)}° 접선·중심 내적 ${(tx * rx + ty * ry).toFixed(3)}`);
  }
  // 이름
  const s0 = seats[0];
  const gTip = [s0.sx - Math.sin(s0.a) * 40, s0.sy - Math.cos(s0.a) * 40];
  kit.label(svg, { at: [gTip[0] + 2, gTip[1]], via: [CX + RP + 10, gTip[1] - 14], to: [CX + RP + 14, gTip[1] - 14], text: "운동 방향", side: "r", size: 12.5, color: "#1E7B39" });
  const fMid = [s0.sx + ((CX - s0.sx) / RS) * 24, s0.sy + ((CY - s0.sy) / RS) * 24];
  kit.label(svg, { at: fMid, via: [CX + RP + 10, s0.sy + 40], to: [CX + RP + 14, s0.sy + 40], text: "힘(중심 쪽)", side: "r", size: 12.5, color: "#C92A2A" });
  const pp = [CX + RS * Math.cos(118 * D2R), CY - RS * Math.sin(118 * D2R)];
  kit.label(svg, { at: pp, via: [pp[0] + 12, 18], to: [pp[0] + 16, 18], text: "마차 자리가 지나는 길", side: "r", size: 12 });
  kit.text(svg, 8, H - 12, "같은 시간 간격의 네 자리", { size: 12, weight: 600, color: "#5B6475", anchor: "start" });
  console.log("placed " + report.join(" | "));
}
