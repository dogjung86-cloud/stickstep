// u4l4f2 · 물은 예외: 물을 가득 채운 페트병과 얼려서 옆과 바닥이 부푼 같은 병, 병마다 입자 창(물: 가깝고 불규칙, 얼음: 육각형 고리로 가운데가 빈 배열).
// 검산 메모: u4l4f2.md. 두 창의 입자 수(24개)와 크기는 같다. 얼음 창의 넓이는 물 창의 1.12배(실제 부피 1.09배를 보이게 조금 키움, 두 배처럼 과장하지 않음).
// 입자 표현은 u4l4f1과 같다(Ⅳ 입자 색, 창 = 같은 입자들이 차지하는 자리). 빈틈에 공기 방울을 그리지 않는다. 분자 모양이나 막대(결합)를 그리지 않는다.
export const meta = { key: "u4l4f2", w: 340, h: 352, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [W / 2, -H / 2 + 40, 400], look: [W / 2, -H / 2, 0], envIntensity: 0.9, key: [-160, 260, 300], keyI: 1.5, fillI: 0.9, rimI: 0.3, shadows: false });
  const { THREE: T, scene, renderer } = st;
  const at = (x, y, z = 0) => new T.Vector3(x, -y, z);
  const V2 = (r, y) => new T.Vector2(r, y);

  // ── 페트병 둘 ──
  const GROUND = 190, BX = [84, 256];
  // 바깥 윤곽(px, 아래가 0): 둥근 바닥, 몸통의 홈 둘, 어깨, 목
  const OUT = [[0, 1.6], [10, 0.4], [20, 1.2], [25.6, 3.8], [27, 9], [27, 30], [25.9, 33], [27, 36], [27, 58], [25.9, 61], [27, 64], [27, 86], [26, 94], [22.5, 103], [17, 111], [12.6, 117], [11.2, 121], [11.2, 125], [13.4, 125.6], [13.4, 127.4], [11.4, 128]];
  const bulge = (r, y) => {
    // 얼린 병: 몸통 가운데가 9% 부풀고, 바닥 가운데가 아래로 6px 밀려 나온다(어깨 위와 목은 그대로)
    const k = y > 4 && y < 98 ? Math.sin((Math.PI * (y - 4)) / 94) : 0;
    const r2 = r * (1 + 0.09 * k);
    const y2 = y < 10 ? y - 6 * (1 - r / 27) : y;
    return [r2, y2];
  };
  const shellM = new T.MeshPhysicalMaterial({ color: 0xf2f8ff, roughness: 0.06, transparent: true, opacity: 0.28, clearcoat: 1, side: T.DoubleSide, depthWrite: false });
  const waterM = new T.MeshPhysicalMaterial({ color: 0x8cc4f5, roughness: 0.12, clearcoat: 0.6 });
  const ice = kit.canvasTex(T, renderer, kit.canvas(256, 512, (c, w, h) => {
    const img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = kit.fbm(x / 20, y / 46, 4, 11), i = (y * w + x) * 4; const v = 208 + (n - 0.5) * 50; img.data[i] = v - 22; img.data[i + 1] = v - 4; img.data[i + 2] = 252; img.data[i + 3] = 255; }
    c.putImageData(img, 0, 0);
  }));
  const iceM = new T.MeshPhysicalMaterial({ map: ice, roughness: 0.55, clearcoat: 0.4 });
  const capM = new T.MeshPhysicalMaterial({ color: 0x2f6fd0, roughness: 0.4, clearcoat: 0.5 });
  const report = [];
  BX.forEach((bx, k) => {
    const frozen = k === 1;
    const prof = OUT.map(([r, y]) => (frozen ? bulge(r, y) : [r, y]));
    const minY = Math.min(...prof.map((p) => p[1]));
    const g = new T.Group(); g.position.copy(at(bx, GROUND + minY)); scene.add(g);
    const shell = new T.Mesh(new T.LatheGeometry(prof.map(([r, y]) => V2(r, y)), 96), shellM); shell.userData.noEdge = true; g.add(shell);
    // 속(물 또는 얼음): 안쪽 벽(1.2px 안)을 따라 채운 높이까지, 위는 평평하게
    const level = frozen ? 123.5 : 119;
    const inner = prof.filter(([, y]) => y < level).map(([r, y]) => [Math.max(0, r - 1.2), y + 0.6]);
    const lastR = (() => { const a = prof.find(([, y]) => y >= level), b = [...prof].reverse().find(([, y]) => y < level); const t = (level - b[1]) / (a[1] - b[1]); return b[0] + (a[0] - b[0]) * t - 1.2; })();
    const fillProf = [[0, inner[0][1]], ...inner, [lastR, level], [0, level]].map(([r, y]) => V2(r, y));
    g.add(new T.Mesh(new T.LatheGeometry(fillProf, 96), frozen ? iceM : waterM));
    const cap = new T.Mesh(new T.CylinderGeometry(13.6, 13.6, 13, 48), capM); cap.position.y = 128 + 6.5; g.add(cap);
    for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2, rib = new T.Mesh(new T.BoxGeometry(1.2, 11, 1.2), capM); rib.position.set(Math.cos(a) * 13.7, 134.5, Math.sin(a) * 13.7); g.add(rib); }
    const maxR = Math.max(...prof.map((p) => p[0]));
    report.push(`${frozen ? "얼린 병" : "물 병"} 가장 넓은 반지름 ${maxR.toFixed(1)} 바닥 ${minY.toFixed(1)}`);
  });
  kit.shadowCatcher(T, scene, { y: -GROUND, size: 900, opacity: 0.1 });
  scene.children.find((o) => o.isMesh && o.material && o.material.isShadowMaterial)?.rotation.set(-Math.PI / 2, 0, 0);

  // ── 입자 창 둘(u4l4f1과 같은 창과 입자) ──
  const PR = 5.2, N = 24, d = PR * 2 * 1.03;
  const ICE = { x: 256, y: 270, R: 39.5 }, WAT = { x: 84, y: 270, R: 39.5 / Math.sqrt(1.12) };
  // 얼음: 벌집 꼴 꼭짓점 24개(가운데 육각형 하나와 둘레 육각형 여섯 → 육각형 고리 일곱, 고리마다 가운데가 빔)
  const hex = [];
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
    const cx = i * 1.5 * d, cy = (j + (Math.abs(i) % 2) * 0.5) * Math.sqrt(3) * d; // 육각형 가운데(평평한 꼭짓점 쪽 배치)
    for (let a = 0; a < 6; a++) { const ang = (a * Math.PI) / 3; const p = [cx + d * Math.cos(ang), cy + d * Math.sin(ang)]; if (!hex.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.01 * d)) hex.push(p); }
  }
  hex.sort((a, b) => Math.hypot(...a) - Math.hypot(...b));
  const icePts = hex.slice(0, N).map(([x, y]) => [ICE.x + x, ICE.y + y]);
  // 물: 이웃과 닿을 만큼 가깝지만 줄이 없다(u4l4f1의 액체와 같은 방법)
  const r1 = kit.rng(23);
  const wat = [[WAT.x + 1, WAT.y - 1.5]];
  for (let guard = 0; wat.length < N && guard < 8000; guard++) {
    let best = null, bestD = 1e9;
    for (let c = 0; c < 30; c++) {
      const base = wat[Math.floor(r1() * wat.length)], ang = r1() * Math.PI * 2;
      const p = [base[0] + Math.cos(ang) * d, base[1] + Math.sin(ang) * d];
      if (Math.hypot(p[0] - WAT.x, p[1] - WAT.y) > WAT.R - PR - 1.2) continue;
      if (!wat.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) >= d - 0.01)) continue;
      const dc = Math.hypot(p[0] - WAT.x, p[1] - WAT.y) + r1() * 7;
      if (dc < bestD) { bestD = dc; best = p; }
    }
    if (best) wat.push(best);
  }
  const iceFar = Math.max(...icePts.map(([x, y]) => Math.hypot(x - ICE.x, y - ICE.y))) + PR;
  if (wat.length !== N || icePts.length !== N || iceFar > ICE.R - 0.5) throw new Error(`입자 ${wat.length}/${icePts.length}, 얼음 끝 ${iceFar.toFixed(1)}/${ICE.R}`);
  report.push(`창 넓이 비 ${(ICE.R ** 2 / WAT.R ** 2).toFixed(3)} 얼음 바깥 입자 끝 ${iceFar.toFixed(1)}/${ICE.R}`);
  const winTex = kit.canvasTex(T, renderer, kit.canvas(512, 512, (c, w, h) => {
    const gr = c.createRadialGradient(w * 0.42, h * 0.38, 8, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "#FFFFFF"); gr.addColorStop(0.62, "#F4F2FF"); gr.addColorStop(0.9, "#E4E0FA"); gr.addColorStop(1, "#D9D3F6");
    c.fillStyle = gr; c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); c.fill();
  }));
  const winMat = new T.MeshBasicMaterial({ map: winTex, transparent: true });
  const rimMat = new T.MeshPhysicalMaterial({ color: 0xe9e6ff, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1, sheen: 0.5, sheenColor: 0xffffff });
  for (const w of [ICE, WAT]) {
    const disc = new T.Mesh(new T.CircleGeometry(w.R, 128), winMat); disc.position.copy(at(w.x, w.y, -20)); disc.userData.noEdge = true; scene.add(disc);
    const rim = new T.Mesh(new T.TorusGeometry(w.R, 1.8, 24, 160), rimMat); rim.position.copy(at(w.x, w.y, -4)); scene.add(rim);
  }
  const pMat = new T.MeshPhysicalMaterial({ color: 0x8f80f5, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: 0xe8e2ff });
  const sph = new T.SphereGeometry(PR, 40, 28);
  for (const [x, y] of [...icePts, ...wat]) { const m = new T.Mesh(sph, pMat); m.position.copy(at(x, y, 0)); scene.add(m); }
  await kit.renderIllus(st, { ao: true, radius: 4, thickness: 3, edge: true, edgeK: 0.38, nT: 0.5, dT: 0.02 });
  await kit.frame();

  // ── 확대선, 글자 ──
  const svg = kit.layer(root, W, H);
  const zoom = (bx, by, w) => {
    const r0 = 6.5;
    svg.appendChild(kit.s("circle", { cx: bx, cy: by, r: r0, fill: "none", stroke: "#6E64C8", "stroke-width": 1.2 }));
    for (const s of [-1, 1]) svg.appendChild(kit.s("path", { d: `M${bx + s * r0} ${by} L${w.x + s * w.R * 0.93} ${w.y - w.R * 0.36}`, stroke: "#9A90E0", "stroke-width": 0.9, "stroke-dasharray": "2.5 2" }));
  };
  zoom(BX[0], GROUND - 60, WAT); zoom(BX[1], GROUND - 60, ICE);
  kit.text(svg, BX[0], 13, "물을 가득 채운 병", { size: 12.5, weight: 800 });
  kit.text(svg, BX[1], 13, "얼린 뒤: 옆과 바닥이 부풀어요", { size: 12.5, weight: 800 });
  // 얼린 병 위에 얼리기 전 모습의 윤곽(점선, 목과 마개를 맞춰서)
  {
    const fprof = OUT.map(([r, y]) => bulge(r, y)), minY = Math.min(...fprof.map((p) => p[1]));
    const base = -(GROUND + minY);
    for (const sgn of [-1, 1]) {
      const pts = OUT.filter(([, y]) => y <= 112).map(([r, y]) => st.project([BX[1] + sgn * r, base + y, 0]));
      svg.appendChild(kit.s("path", { d: pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" "), stroke: "#E8590C", "stroke-width": 1.1, "stroke-dasharray": "3 2.4", fill: "none" }));
    }
    const lp = st.project([BX[1] - 27, base + 40, 0]);
    kit.label(svg, { at: lp, via: [lp[0] - 22, lp[1] + 18], to: [lp[0] - 26, lp[1] + 18], text: "얼리기 전", side: "l", size: 12, color: "#C2410C" });
  }
  kit.text(svg, WAT.x, WAT.y + WAT.R + 13, "물: 가깝고 불규칙", { size: 12, weight: 700, color: "#4E5968" });
  kit.text(svg, ICE.x, ICE.y + ICE.R + 13, "얼음: 고리 꼴, 빈틈이 많아요", { size: 12, weight: 700, color: "#4E5968" });
  // 빈틈(가운데 육각형의 빈 가운데)을 가리키는 이름표
  kit.label(svg, { at: [ICE.x, ICE.y], via: [ICE.x - 30, ICE.y - 52], to: [ICE.x - 34, ICE.y - 52], text: "빈틈", side: "l", size: 12.5 });
  kit.text(svg, W / 2, H - 10, "두 창의 입자 수(24개)와 크기는 같아요", { size: 12, weight: 600, color: "#5B6475" });
  console.log("placed " + report.join(" | "));
}
