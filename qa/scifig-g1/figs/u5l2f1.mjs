// u5l2f1 · 두 힘의 평형 조건: 매끄러운 얼음판 위 나무 도막을 위에서. (가) 한 직선 위의 두 힘 → 멈춰 있다. (나) 서로 다른 직선 위 → 돌아간다.
// 검산 메모: u5l2f1.md. 두 힘은 5 N씩 같은 길이, 정확히 반대 방향, 줄을 맨 점에서 바깥쪽으로.
// (나)는 위쪽 끝을 왼쪽으로, 아래쪽 끝을 오른쪽으로 당겨 위에서 볼 때 시계 반대 방향으로 돈다. 도막의 중심은 제자리(알짜힘 0).
export const meta = { key: "u5l2f1", w: 340, h: 290, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  // 위에서 내려다본 정사영(살짝 기울여 도막 옆면이 조금 보이게). 화면 오른쪽 = +x, 화면 위 = -z
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 600, 160], look: [0, 0, 0], envIntensity: 0.6, key: [-250, 500, 200], keyI: 1.4, fillI: 0.9, rimI: 0.3 });
  const { THREE: T, scene, renderer, camera } = st;
  camera.up.set(0, 0, -1); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
  st.keyL.shadow.camera.left = -260; st.keyL.shadow.camera.right = 260; st.keyL.shadow.camera.top = 260; st.keyL.shadow.camera.bottom = -260; st.keyL.shadow.camera.far = 2000; st.keyL.shadow.camera.updateProjectionMatrix();
  // 얼음판
  const ice = kit.canvasTex(T, renderer, kit.canvas(512, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#DDF0FA"); g.addColorStop(1, "#BFE0F2"); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = kit.rng(4); c.strokeStyle = "rgba(255,255,255,0.7)"; c.lineWidth = 1.2;
    for (let k = 0; k < 14; k++) { let x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); for (let s = 0; s < 4; s++) { x += (r() - 0.5) * 80; y += (r() - 0.5) * 80; c.lineTo(x, y); } c.stroke(); }
  }));
  const sheet = new T.Mesh(new T.PlaneGeometry(W + 40, H + 40), new T.MeshPhysicalMaterial({ map: ice, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 }));
  sheet.rotation.x = -Math.PI / 2; sheet.receiveShadow = true; sheet.userData.noEdge = true; scene.add(sheet);
  const woodTex = kit.canvasTex(T, renderer, kit.canvas(512, 256, (c, w, h) => { c.fillStyle = "#C08A55"; c.fillRect(0, 0, w, h); const r = kit.rng(7); for (let k = 0; k < 60; k++) { const y = r() * h; c.strokeStyle = `rgba(90,52,24,${0.12 + r() * 0.15})`; c.lineWidth = 1 + r() * 1.5; c.beginPath(); for (let x = 0; x <= w; x += 8) { const yy = y + Math.sin(x / 40 + k) * 2; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); } }));
  const BW = 92, BD = 56, BH = 26;
  const blockAt = (cx, cz, rotY = 0, ghost = false) => {
    const m = new T.MeshStandardMaterial({ map: woodTex, roughness: 0.7, transparent: ghost, opacity: ghost ? 0.32 : 1, depthWrite: !ghost });
    const b = new T.Mesh(new RoundedBoxGeometry(BW, BH, BD, 3, 3), m); b.position.set(cx, BH / 2, cz); b.rotation.y = rotY; b.castShadow = !ghost; if (ghost) b.userData.noEdge = true; scene.add(b);
  };
  const Z1 = -78, Z2 = 82; // (가), (나) 도막 중심의 z(화면 위아래)
  blockAt(0, Z1);
  blockAt(0, Z2, 0.3, true);   // (나) 조금 돌아간 잔상(시계 반대: 위에서 볼 때 y축 양의 회전)
  blockAt(0, Z2);
  await kit.renderIllus(st, { radius: 6, thickness: 6, edgeK: 0.3 });
  await kit.frame();

  const svg = kit.layer(root, W, H);
  const P = (x, z) => st.project([x, BH, z]);
  const F = 62, FC = "#E8590C";
  const pull = (ax, az, dir, label) => {
    const a = P(ax, az);
    kit.flowArrow(svg, `M${a[0]} ${a[1]} L${a[0] + dir * F} ${a[1]}`, { w: 4, head: 10, hw: 2.4, fill: FC });
    svg.appendChild(kit.s("circle", { cx: a[0], cy: a[1], r: 3, fill: "#FFFFFF", stroke: "#2B3445", "stroke-width": 1.3 }));
    kit.text(svg, a[0] + dir * (F / 2), a[1] - 12, label, { size: 12.5, weight: 800, color: "#C2410C" });
    return a;
  };
  // (가): 왼쪽 면 가운데, 오른쪽 면 가운데 → 같은 직선(도막 중심을 지나는 점선) 위
  const aL = pull(-BW / 2, Z1, -1, "5 N"), aR = pull(BW / 2, Z1, 1, "5 N");
  svg.appendChild(kit.s("path", { d: `M8 ${aL[1]} H${W - 8}`, stroke: "#5B6475", "stroke-width": 1, "stroke-dasharray": "4 4", opacity: 0.8 }));
  // (나): 왼쪽 면 위쪽 끝 가까이, 오른쪽 면 아래쪽 끝 가까이 → 나란한 두 직선
  const off = BD / 2 - 9;
  const bL = pull(-BW / 2, Z2 - off, -1, "5 N"), bR = pull(BW / 2, Z2 + off, 1, "5 N");
  svg.appendChild(kit.s("path", { d: `M8 ${bL[1]} H${W - 8}`, stroke: "#5B6475", "stroke-width": 1, "stroke-dasharray": "4 4", opacity: 0.8 }));
  svg.appendChild(kit.s("path", { d: `M8 ${bR[1]} H${W - 8}`, stroke: "#5B6475", "stroke-width": 1, "stroke-dasharray": "4 4", opacity: 0.8 }));
  // 도는 방향(위에서 볼 때 시계 반대): 도막 둘레의 굽은 화살표
  const c2 = P(0, Z2), rr = 58;
  const a0 = (-25 * Math.PI) / 180, a1 = (-125 * Math.PI) / 180; // 화면 각(y 아래)으로 오른쪽 위에서 왼쪽 위로 = 시계 반대
  const p0 = [c2[0] + rr * Math.cos(a0), c2[1] + rr * Math.sin(a0) * 0.62], p1 = [c2[0] + rr * Math.cos(a1), c2[1] + rr * Math.sin(a1) * 0.62];
  kit.flowArrow(svg, `M${p0[0]} ${p0[1]} A ${rr} ${rr * 0.62} 0 0 0 ${p1[0]} ${p1[1]}`, { w: 3, head: 9, hw: 2.4, fill: "#7048E8" });
  // 중심 점(제자리)
  svg.appendChild(kit.s("circle", { cx: c2[0], cy: c2[1], r: 2.4, fill: "#2B3445" }));
  // 이름
  kit.text(svg, 8, 16, "(가) 한 직선 위", { size: 13.5, weight: 800, anchor: "start" });
  kit.text(svg, W - 8, P(0, Z1 + BD / 2 + 4)[1] + 14, "그대로 멈춰 있어요", { size: 12.5, weight: 800, color: "#2B8A3E", anchor: "end" });
  kit.text(svg, 8, P(0, Z2 - BD / 2 - 30)[1], "(나) 서로 다른 직선 위", { size: 13.5, weight: 800, anchor: "start" });
  kit.text(svg, p0[0] + 10, p0[1] - 10, "돌아가요", { size: 12.5, weight: 800, color: "#7048E8", anchor: "start" });
}
