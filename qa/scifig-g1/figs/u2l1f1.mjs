// u2l1f1 · 세포는 아주 작아요: 머리카락 한 가닥 위에 입안 상피세포, 적혈구, 세균을 같은 축척으로 올려 견준다.
// 검산 메모: u2l1f1.md. 1 µm = 1.9px(설계), 정사영 정면. 하나만 따로 키우지 않는다.
export const meta = { key: "u2l1f1", w: 340, h: 256, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const S = 1.9; // px / µm
  const st = await kit.three(root, { w: W, h: H, ortho: H / S, pos: [0, -8.7, 260], look: [0, -8.7, 0], envIntensity: 0.55, key: [-120, 260, 300], keyI: 1.7, fillI: 0.8, rimI: 0.35 });
  const { THREE: T, scene, renderer } = st;
  st.keyL.shadow.camera.left = -200; st.keyL.shadow.camera.right = 200; st.keyL.shadow.camera.top = 200; st.keyL.shadow.camera.bottom = -200; st.keyL.shadow.camera.far = 1200;
  st.keyL.shadow.camera.updateProjectionMatrix();

  // ── 머리카락: 지름 100 µm 원기둥(화면 가로로 길게), 겉에 비늘(큐티클) 결 ──
  const HAIR_D = 100, HY = -8; // 화면 가운데보다 조금 아래
  const hairTex = kit.canvasTex(T, renderer, kit.canvas(512, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "#4A3426"); g.addColorStop(0.5, "#5E4434"); g.addColorStop(1, "#4A3426");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = kit.rng(5);
    // 비늘: 머리카락 끝 쪽(오른쪽)으로 겹쳐 덮은 기와 모양의 물결 가장자리
    for (let y = 0; y < h; y += 4.2 + r() * 1.6) {
      const ph = r() * 6.28, amp = 1.2 + r() * 1.6;
      c.strokeStyle = "rgba(226,196,165,0.32)"; c.lineWidth = 1.0;
      c.beginPath();
      for (let x = 0; x <= w; x += 6) { const yy = y + Math.sin(x / 31 + ph) * amp + Math.sin(x / 9 + ph * 2) * 0.5; x === 0 ? c.moveTo(x, yy) : c.lineTo(x, yy); }
      c.stroke();
      c.strokeStyle = "rgba(18,10,6,0.22)"; c.lineWidth = 1.3;
      c.beginPath();
      for (let x = 0; x <= w; x += 6) { const yy = y + 1.4 + Math.sin(x / 31 + ph) * amp; x === 0 ? c.moveTo(x, yy) : c.lineTo(x, yy); }
      c.stroke();
    }
  }), { repeat: [1, 0.9] });
  const hair = new T.Mesh(new T.CylinderGeometry(HAIR_D / 2, HAIR_D / 2, 420, 96, 1, true), new T.MeshPhysicalMaterial({ map: hairTex, roughness: 0.55, clearcoat: 0.18, clearcoatRoughness: 0.55, sheen: 0.2, sheenColor: 0xffd9b8 }));
  hair.rotation.order = "ZYX"; hair.rotation.z = Math.PI / 2; hair.rotation.y = Math.PI; // 질감 이음매를 뒤쪽으로
  hair.position.set(0, HY, -HAIR_D / 2); hair.receiveShadow = true; scene.add(hair);

  // ── 입안 상피세포: 납작한 다각형(약 50 µm), 가운데 핵 하나, 옅은 분홍(랩과 같은 색) ──
  const cellPoly = [[-26, -4], [-21, -17], [-11, -25], [3, -27], [16, -21], [24, -11], [26, 3], [21, 15], [12, 24], [-3, 26], [-15, 21], [-24, 11]].map(([x, y], i) => [x * (1 + 0.04 * Math.sin(i * 2.3)), y * (1 + 0.04 * Math.cos(i * 1.7))]);
  const cs = new T.Shape(cellPoly.map(([x, y]) => new T.Vector2(x, y)));
  const cellG = new T.ExtrudeGeometry(cs, { depth: 1.2, bevelEnabled: true, bevelThickness: 1.4, bevelSize: 1.6, bevelSegments: 4 });
  const cellM = new T.MeshPhysicalMaterial({ color: 0xf6c4c4, roughness: 0.35, transmission: 0.35, thickness: 2, clearcoat: 0.5, sheen: 0.4, sheenColor: 0xffffff });
  const cell = new T.Mesh(cellG, cellM); cell.position.set(-62, HY + 4, 4); cell.castShadow = true; cell.receiveShadow = true; scene.add(cell);
  const nucl = new T.Mesh(new T.SphereGeometry(4.2, 48, 32), new T.MeshPhysicalMaterial({ color: 0x8b5cc8, roughness: 0.45, clearcoat: 0.4 }));
  nucl.scale.set(1, 0.92, 0.4); nucl.position.set(-62 + 2, HY + 4 + 1, 5.9); scene.add(nucl);

  // ── 적혈구: 지름 약 8 µm, 가운데가 오목한 원반, 핵 없음 ──
  const rbcProfile = []; // (반지름, 두께의 절반): 가장자리 약 2 µm, 가운데 약 1 µm
  for (let i = 0; i <= 40; i++) {
    const t = i / 40, rr = 4 * t;
    const half = 0.5 + 0.55 * Math.pow(t, 2) * (1 - Math.pow(t, 6)) * 1.25 + 0.02;
    rbcProfile.push([rr, half]);
  }
  const prof = [...rbcProfile.map(([r, h]) => new T.Vector2(r, h)), ...rbcProfile.slice().reverse().map(([r, h]) => new T.Vector2(r, -h))];
  const rbcG = new T.LatheGeometry(prof, 64);
  const rbc = new T.Mesh(rbcG, new T.MeshPhysicalMaterial({ color: 0xd93a3a, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.2, sheen: 0.4, sheenColor: 0xffb0a0 }));
  rbc.rotation.x = 0.55; rbc.rotation.z = 0.3; rbc.position.set(8, HY + 8, 10); rbc.castShadow = true; scene.add(rbc);

  // ── 세균: 약 1 × 2 µm 막대 ──
  const bac = new T.Mesh(new T.CapsuleGeometry(0.5, 1.0, 8, 24), new T.MeshPhysicalMaterial({ color: 0xb7f06a, roughness: 0.35, clearcoat: 0.6, emissive: 0x2a4a10 }));
  bac.rotation.z = Math.PI / 2 - 0.4; bac.position.set(46, HY - 6, 8); bac.castShadow = true; scene.add(bac);

  kit.shadowCatcher(T, scene, { y: -400, opacity: 0 });
  await kit.renderIllus(st, { ao: false, edgeK: 0.3 });
  await kit.frame();

  // ── 라벨과 치수 ──
  const svg = kit.layer(root, W, H);
  const P = (p) => st.project(p);
  const top = P([-140, HY + HAIR_D / 2, 0]), bot = P([-140, HY - HAIR_D / 2, 0]);
  const dx = 14;
  svg.appendChild(kit.s("path", { d: `M${dx} ${top[1]} V${bot[1]} M${dx - 5} ${top[1]} H${dx + 5} M${dx - 5} ${bot[1]} H${dx + 5}`, stroke: "#2B3445", "stroke-width": 1.4, fill: "none" }));
  kit.text(svg, dx - 4, top[1] - 13, "머리카락 굵기 약 100 µm", { size: 13, weight: 700, anchor: "start" });
  const cP = P([-62 - 16, HY + 4 - 14, 6]), rP = P([8, HY + 8, 13]), bP = P([46 + 1.6, HY - 6 - 1.6, 9]);
  kit.label(svg, { at: cP, via: [cP[0] - 2, bot[1] + 16], to: [cP[0] + 2, bot[1] + 16], text: "입안 상피세포 약 50 µm", side: "r", size: 13 });
  kit.label(svg, { at: rP, via: [rP[0] + 4, top[1] - 13], to: [rP[0] + 8, top[1] - 13], text: "적혈구 약 8 µm", side: "r", size: 13 });
  // 세균은 점(2.6px)보다 작아서 끝점 없이, 바로 곁에서 멈추는 선으로 가리킨다
  kit.label(svg, { at: [bP[0] - 2, bP[1] + 3], via: [206, bot[1] + 16], to: [210, bot[1] + 16], text: "세균 약 2 µm", side: "r", size: 13, dot: false });
  // 10 µm 눈금
  const s10 = P([10, 0, 0])[0] - P([0, 0, 0])[0];
  const sx = W - 16 - s10, sy = bot[1] - 14; // 머리카락 띠 안 오른쪽 아래(흰색)
  svg.appendChild(kit.s("path", { d: `M${sx} ${sy - 4} V${sy + 4} M${sx} ${sy} H${sx + s10} M${sx + s10} ${sy - 4} V${sy + 4}`, stroke: "#FFFFFF", "stroke-width": 1.8, fill: "none" }));
  kit.text(svg, sx - 6, sy, "10 µm", { size: 12, weight: 700, anchor: "end", color: "#FFFFFF", halo: false });
  console.log("proj", JSON.stringify({ top, bot, cP, rP, bP, s10 }));
}
