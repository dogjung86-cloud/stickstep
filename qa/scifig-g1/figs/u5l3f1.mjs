// u5l3f1 · 지구와 달에서 잰 같은 상자(질량 3 kg): 위 줄 용수철저울(무게), 아래 줄 양팔저울(질량). 왼쪽 칸 지구, 오른쪽 칸 달.
// 검산 메모: u5l3f1.md. 무게 지구 29.4 N(3 kg × 9.8), 달 4.9 N(29.4 ÷ 6). 용수철이 늘어난 길이(1 N에 K px)와 중력 화살표(1 N에 G px)가 모두 6 : 1.
// 양팔저울은 두 곳 모두 저울대가 수평(3 kg = 1 kg 추 셋). 두 접시의 물체마다 중력 화살표가 같은 길이이고, 달에서는 둘 다 6분의 1.
// 화살표는 물체 가운데(작용점)에서 아래로. 색은 Ⅴ 랩 약속(중력 빨강). 지구와 달의 겉은 public/textures 실사 질감(머리줄의 작은 공, 달 땅).
export const meta = { key: "u5l3f1", w: 340, h: 392, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const COL = [0, 170]; // 칸의 왼쪽 끝(지구, 달)
  const WEIGHT = [29.4, 4.9]; // N
  const K = 2.4; // 용수철이 늘어난 길이: 1 N에 2.4px
  const G = 2.2; // 중력 화살표: 1 N에 2.2px
  // ── 위 줄(용수철저울) ──
  const ARM_Y = 40, S_TOP = 44, R0 = 18, HOOK = 7, BOX_W = 26, BOX_H = 22, G1 = 214;
  const SX = 96; // 칸 안에서 용수철의 x
  const POLE = 24; // 칸 안에서 받침대 기둥의 x
  const RUL = 70; // 칸 안에서 눈금판의 x(가운데)
  const sEnd = (n) => S_TOP + R0 + n * K; // 용수철 끝(바늘)의 y
  // ── 아래 줄(양팔저울) ──
  const BEAM_Y = 266, PAN_Y = 304, ARM = 52, G2 = 362, PAN_R = 17;
  const BCX = 85; // 칸 안에서 저울의 가운데 x

  // ── 바탕: 칸 나눔, 땅(지구는 풀과 흙, 달은 실사 질감) ──
  const bg = kit.layer(root, W, H);
  const moonImg = "/public/textures/moon.jpg";
  const mp = kit.id("mp");
  bg.defs.appendChild(kit.s("pattern", { id: mp, patternUnits: "userSpaceOnUse", width: 360, height: 180, x: -40, y: 0 },
    kit.s("image", { href: moonImg, width: 360, height: 180, preserveAspectRatio: "none" })));
  const ground = (x0, gy) => {
    // 지구: 풀 띠 + 흙
    const ex = x0 === COL[0];
    if (ex) {
      bg.appendChild(kit.s("rect", { x: x0 + 4, y: gy, width: 162, height: 13, rx: 3, fill: kit.lin(bg, 0, 0, 0, 1, [[0, "#B07B4A"], [1, "#7E5532"]]) }));
      bg.appendChild(kit.s("rect", { x: x0 + 4, y: gy - 1, width: 162, height: 5, rx: 2.5, fill: kit.lin(bg, 0, 0, 0, 1, [[0, "#8CCB5E"], [1, "#5E9E43"]]) }));
      const r = kit.rng(gy + 3);
      for (let i = 0; i < 26; i++) { const x = x0 + 8 + r() * 154; bg.appendChild(kit.s("path", { d: `M${x} ${gy + 1} l${(r() - 0.5) * 2} -${2 + r() * 3}`, stroke: "#5E9E43", "stroke-width": 1.2, "stroke-linecap": "round" })); }
    } else {
      bg.appendChild(kit.s("rect", { x: x0 + 4, y: gy - 1, width: 162, height: 14, rx: 3, fill: `url(#${mp})` }));
      bg.appendChild(kit.s("rect", { x: x0 + 4, y: gy - 1, width: 162, height: 14, rx: 3, fill: kit.lin(bg, 0, 0, 0, 1, [[0, "#FFFFFF", 0.18], [1, "#2B3445", 0.22]]) }));
      bg.appendChild(kit.s("path", { d: `M${x0 + 6} ${gy - 0.5} H${x0 + 164}`, stroke: "#8A8F98", "stroke-width": 1 }));
    }
  };
  COL.forEach((x0) => { ground(x0, G1); ground(x0, G2); });
  bg.appendChild(kit.s("path", { d: `M170 6 V${H - 6}`, stroke: "#E5E8EB", "stroke-width": 1.2 }));
  bg.appendChild(kit.s("path", { d: `M8 232 H${W - 8}`, stroke: "#EEF0F3", "stroke-width": 1.2 }));

  // ── 입체(정사영, 조금 위에서) ──
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 80, 640], look: [0, 0, 0], envIntensity: 0.65, key: [-260, 420, 380], keyI: 1.5, fillI: 0.9, rimI: 0.35, shadows: false });
  const { THREE: T, scene, renderer } = st;
  const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
  const at = (x, y, z = 0) => new T.Vector3(x - W / 2, H / 2 - y, z);
  const steel = new T.MeshPhysicalMaterial({ color: 0xc3cad4, metalness: 0.9, roughness: 0.32 });
  const frameM = new T.MeshPhysicalMaterial({ color: 0x55657f, metalness: 0.55, roughness: 0.45 });
  const brass = new T.MeshPhysicalMaterial({ color: 0xd9ad3c, metalness: 0.85, roughness: 0.33 });
  const wood = kit.canvasTex(T, renderer, kit.canvas(256, 256, (c, w, h) => {
    const img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = kit.fbm(x / 60, y / 6, 4, 11), i = (y * w + x) * 4; img.data[i] = 196 + (v - 0.5) * 70; img.data[i + 1] = 142 + (v - 0.5) * 52; img.data[i + 2] = 84 + (v - 0.5) * 34; img.data[i + 3] = 255; }
    c.putImageData(img, 0, 0);
  }));
  const woodM = new T.MeshStandardMaterial({ map: wood, roughness: 0.78 });
  const cyl = (r, x0, y0, x1, y1, m, z = 0) => {
    const a = at(x0, y0, z), b = at(x1, y1, z), L = a.distanceTo(b);
    const mesh = new T.Mesh(new T.CylinderGeometry(r, r, L, 16), m);
    mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    scene.add(mesh); return mesh;
  };
  const box = (x, yTop) => {
    const b = new T.Mesh(new RoundedBoxGeometry(BOX_W, BOX_H, 20, 3, 2.5), woodM);
    b.position.copy(at(x, yTop + BOX_H / 2, 0)); scene.add(b);
    // 띠 장식(나무 상자의 테)
    const band = new T.Mesh(new RoundedBoxGeometry(BOX_W + 0.6, 3.2, 20.6, 2, 1.2), new T.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.7 }));
    band.position.copy(at(x, yTop + BOX_H * 0.5, 0)); scene.add(band);
  };
  class Helix extends T.Curve {
    constructor(x, y0, y1, n, rc) { super(); this.x = x; this.y0 = y0; this.y1 = y1; this.n = n; this.rc = rc; }
    getPoint(t, out = new T.Vector3()) { const a = 2 * Math.PI * this.n * t; return out.copy(at(this.x + this.rc * Math.cos(a), this.y0 + (this.y1 - this.y0) * t, this.rc * Math.sin(a))); }
  }
  const report = [];
  COL.forEach((x0, i) => {
    const sx = x0 + SX, end = sEnd(WEIGHT[i]);
    // 받침대: 바닥판, 기둥, 팔, 걸이
    const base = new T.Mesh(new RoundedBoxGeometry(30, 5, 18, 2, 2), frameM); base.position.copy(at(x0 + POLE, G1 - 2.5, 0)); scene.add(base);
    cyl(2.1, x0 + POLE, G1 - 4, x0 + POLE, ARM_Y - 1, frameM);
    cyl(1.9, x0 + POLE - 1, ARM_Y, sx + 5, ARM_Y, frameM);
    // 용수철(고른 감김, 늘어난 만큼 간격이 넓다)
    cyl(1.1, sx, ARM_Y + 1, sx, S_TOP, steel);
    scene.add(new T.Mesh(new T.TubeGeometry(new Helix(sx, S_TOP, end, 8, 5.4), 8 * 30, 1.05, 10, false), steel));
    cyl(1.1, sx, end, sx, end + HOOK - 3, steel);
    const ring = new T.Mesh(new T.TorusGeometry(3, 0.9, 10, 28), steel); ring.position.copy(at(sx, end + HOOK - 1.5, 0)); scene.add(ring);
    box(sx, end + HOOK);
    report.push(`${i ? "달" : "지구"} 무게 ${WEIGHT[i]} N 늘어난 길이 ${(WEIGHT[i] * K).toFixed(2)}px 화살표 ${(WEIGHT[i] * G).toFixed(2)}px`);
    // ── 양팔저울 ──
    const cx = x0 + BCX;
    const bb = new T.Mesh(new RoundedBoxGeometry(40, 6, 20, 2, 2.5), frameM); bb.position.copy(at(cx, G2 - 3, 0)); scene.add(bb);
    cyl(2.3, cx, G2 - 5, cx, BEAM_Y, frameM);
    const beam = new T.Mesh(new RoundedBoxGeometry(ARM * 2 + 8, 4.2, 5, 2, 1.4), frameM); beam.position.copy(at(cx, BEAM_Y, 0)); scene.add(beam);
    const piv = new T.Mesh(new T.SphereGeometry(3.4, 20, 14), steel); piv.position.copy(at(cx, BEAM_Y, 2.5)); scene.add(piv);
    for (const sgn of [-1, 1]) {
      const px = cx + sgn * ARM;
      cyl(0.55, px, BEAM_Y + 2, px - PAN_R + 2, PAN_Y - 0.5, steel, 0);
      cyl(0.55, px, BEAM_Y + 2, px + PAN_R - 2, PAN_Y - 0.5, steel, 0);
      const pan = new T.Mesh(new T.CylinderGeometry(PAN_R, PAN_R - 3, 3, 40), steel); pan.position.copy(at(px, PAN_Y + 1.5, 0)); scene.add(pan);
    }
    box(cx - ARM, PAN_Y - BOX_H);
    for (const dx of [-10, 0, 10]) {
      const wgt = new T.Mesh(new T.CylinderGeometry(4.2, 4.4, 14, 28), brass); wgt.position.copy(at(cx + ARM + dx, PAN_Y - 7, 0)); scene.add(wgt);
      const knob = new T.Mesh(new T.SphereGeometry(1.9, 14, 10), brass); knob.position.copy(at(cx + ARM + dx, PAN_Y - 15, 0)); scene.add(knob);
    }
  });
  // 머리줄의 작은 지구와 달(실사 질감)
  const [earthTex, moonTex] = await Promise.all([kit.loadTex(T, "/public/textures/earth.jpg"), kit.loadTex(T, "/public/textures/moon.jpg")]);
  const globe = (x, tex, rotY) => { const m = new T.Mesh(new T.SphereGeometry(10, 48, 32), new T.MeshStandardMaterial({ map: tex, roughness: 0.9 })); m.position.copy(at(x, 15, 0)); m.rotation.y = rotY; m.userData.noEdge = true; scene.add(m); };
  globe(COL[0] + 17, earthTex, 2.2);
  globe(COL[1] + 17, moonTex, -1.4);
  await kit.renderIllus(st, { ao: true, radius: 4, thickness: 4, edge: true, edgeK: 0.36, nT: 0.5, dT: 0.02 });
  await kit.frame();

  // ── 겹그림: 눈금, 바늘, 값, 화살표, 이름 ──
  const svg = kit.layer(root, W, H);
  const pj = (x, y, z = 0) => st.project(at(x, y, z).toArray());
  const RED = "#E03131", RED_T = "#C92A2A";
  const arrow = (x, y0, len) => {
    const a = pj(x, y0, 11), b = pj(x, y0 + len, 11);
    kit.flowArrow(svg, `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`, { w: 3.6, head: Math.min(9, len * 0.82), hw: 2.3, fill: RED, stroke: "#FFFFFF" });
    svg.appendChild(kit.s("circle", { cx: a[0], cy: a[1], r: 2.7, fill: "#FFFFFF", stroke: RED, "stroke-width": 1.6 }));
    return b[1] - a[1];
  };
  const lens = [];
  COL.forEach((x0, i) => {
    const sx = x0 + SX, end = sEnd(WEIGHT[i]), moon = i === 1;
    // 머리줄
    kit.text(svg, x0 + 33, 15, moon ? "달에서" : "지구에서", { size: 14, weight: 800, anchor: "start" });
    // 눈금판(0 ~ 30 N)과 눈금, 바늘
    const r0 = pj(x0 + RUL - 5.5, S_TOP + R0 - 7), r1 = pj(x0 + RUL + 5.5, sEnd(32) + 6);
    svg.appendChild(kit.s("rect", { x: r0[0], y: r0[1], width: r1[0] - r0[0], height: r1[1] - r0[1], rx: 2.5, fill: kit.lin(svg, 0, 0, 1, 0, [[0, "#F4F6F9"], [1, "#E2E7EE"]]), stroke: "#AEB8C6", "stroke-width": 1 }));
    for (let n = 0; n <= 30; n += 5) {
      const p = pj(x0 + RUL, sEnd(n), -0.5);
      svg.appendChild(kit.s("path", { d: `M${p[0] + 1} ${p[1]} H${p[0] + (n % 10 ? 4 : 5.5)}`, stroke: "#5B6475", "stroke-width": n % 10 ? 0.9 : 1.3 }));
      if (n % 10 === 0) kit.text(svg, p[0] - 7, p[1], String(n), { size: 13, weight: 700, color: "#5B6475", anchor: "end" });
    }
    // 바늘: 용수철 끝에 붙어 눈금판을 가리키는 가는 막대(끝이 뾰족)
    const pe = pj(sx, end, 0), pr = pj(x0 + RUL + 5.5, end, 0);
    svg.appendChild(kit.s("path", { d: `M${pe[0] - 3} ${pe[1] - 1.1} L${pr[0] + 6} ${pe[1] - 1.1} L${pr[0]} ${pe[1]} L${pr[0] + 6} ${pe[1] + 1.1} L${pe[0] - 3} ${pe[1] + 1.1} Z`, fill: "#2B3445" }));
    // 값(바늘 높이, 용수철 오른쪽)
    kit.text(svg, x0 + 116, pe[1] - 9, "용수철저울", { size: 13, weight: 600, color: "#5B6475", anchor: "start" });
    kit.text(svg, x0 + 116, pe[1] + 9, `${WEIGHT[i]} N`, { size: 16, weight: 800, anchor: "start" });
    // 중력: 상자 가운데에서 아래로(무게에 비례)
    const cY = end + HOOK + BOX_H / 2;
    lens.push(arrow(sx, cY, WEIGHT[i] * G));
    const lab = moon ? pj(sx + 17, cY + 7) : pj(sx + 8, cY + 46);
    kit.text(svg, lab[0], lab[1], "중력", { size: 13, weight: 800, color: RED_T, anchor: "start" });
    // ── 양팔저울: 두 접시의 물체마다 같은 길이의 중력 ──
    const cx = x0 + BCX;
    const lb = arrow(cx - ARM, PAN_Y - BOX_H / 2, WEIGHT[i] * G);
    const rb = arrow(cx + ARM, PAN_Y - 7.5, WEIGHT[i] * G);
    report.push(`${moon ? "달" : "지구"} 양팔저울 화살표 ${lb.toFixed(1)} ${rb.toFixed(1)}`);
    const t = pj(cx, BEAM_Y - 16);
    kit.text(svg, t[0], t[1], "수평", { size: 13, weight: 800, color: "#2B8A3E" });
    kit.text(svg, x0 + 164, 244, "양팔저울", { size: 13, weight: 600, color: "#5B6475", anchor: "end" });
    // 값: 왼쪽 접시의 상자 = 오른쪽 접시의 1 kg 추 셋 = 3 kg. 두 글은 두 접시의 화살표 사이(기둥 양옆)에 둔다
    const kg = pj(cx + ARM, PAN_Y + 16);
    kit.text(svg, kg[0] - 8, kg[1], "3 kg", { size: 16, weight: 800, anchor: "end" });
    const bx = pj(cx - ARM, PAN_Y + 16);
    kit.text(svg, bx[0] + 8, bx[1], "상자", { size: 13, weight: 700, color: "#5B6475", anchor: "start" });
  });
  // 검산: 늘어난 길이와 화살표가 6 : 1
  const ext = WEIGHT.map((w) => w * K);
  const ratioE = ext[0] / ext[1], ratioA = lens[0] / lens[1];
  if (Math.abs(ratioE - 6) > 0.01 || Math.abs(ratioA - 6) > 0.06) throw new Error(`6 : 1이 아니다: 늘어난 길이 ${ratioE}, 화살표 ${ratioA}`);
  console.log("placed " + report.join(" | ") + ` | 비: 늘어난 길이 ${ratioE.toFixed(3)}, 화살표 ${ratioA.toFixed(3)}`);
}
