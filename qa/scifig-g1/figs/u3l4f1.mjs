// u3l4f1 · 비열: 물을 1로 놓고 견준 여러 물질의 비열(가로 막대). 물질마다 작은 입체 그림.
// 검산 메모: u3l4f1.md. 값은 상온 표준 자료의 비(물 = 1). 얼음은 넣지 않는다(상태가 바뀌면 비열이 달라 정리 카드 0의 문장과 부딪힌다).
export const meta = { key: "u3l4f1", w: 340, h: 286, scale: 3, quality: 86 };

const ROWS = [
  { k: "iron", name: "철", v: 0.11 },
  { k: "sand", name: "모래", v: 0.19 },
  { k: "al", name: "알루미늄", v: 0.21 },
  { k: "oil", name: "식용유", v: 0.47 },
  { k: "eth", name: "에탄올", v: 0.58 },
  { k: "water", name: "물", v: 1.0 },
];

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const TOP = 40, ROW = 38, ICON_X = 24, BAR_X = 108, BAR_L = 190;
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 0, 600], look: [0, 0, 0], envIntensity: 0.9, key: [-250, 400, 380], keyI: 1.4, fillI: 0.9, rimI: 0.4, shadows: false });
  const { THREE: T, scene, renderer } = st;
  const at = (x, y, z = 0) => new T.Vector3(x - W / 2, H / 2 - y, z);
  const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
  const tilt = (o) => { o.rotation.x = 0.35; o.rotation.y = -0.5; return o; };
  // 흰 바탕에서 사라지지 않게 옅은 빛깔의 반투명 유리(투과 재질이 아니라 투명도)
  // 앞면 한 겹만(양면이면 두 겹의 유리와 흰 반사가 겹쳐 속의 기름과 에탄올이 하얗게 묻혔다)
  const glassM = new T.MeshPhysicalMaterial({ color: 0xb4c8e0, transparent: true, opacity: 0.24, roughness: 0.08, clearcoat: 0.5, clearcoatRoughness: 0.1, side: T.FrontSide, depthWrite: false });
  ROWS.forEach((r, i) => {
    const cy = TOP + i * ROW + ROW / 2;
    const g = new T.Group(); g.position.copy(at(ICON_X, cy, 0)); scene.add(g);
    if (r.k === "iron") {
      tilt(g); g.add(new T.Mesh(new RoundedBoxGeometry(24, 14, 16, 3, 2), new T.MeshPhysicalMaterial({ color: 0x5f666f, metalness: 0.85, roughness: 0.35 })));
    } else if (r.k === "sand") {
      const cone = new T.ConeGeometry(15, 13, 48, 6);
      const p = cone.attributes.position, v = new T.Vector3();
      for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k); const n = 1 + (kit.noise2(v.x * 0.6, v.z * 0.6, 4) - 0.5) * 0.25; p.setXYZ(k, v.x * n, v.y, v.z * n); }
      cone.computeVertexNormals();
      const sandTex = kit.canvasTex(T, renderer, kit.canvas(128, 128, (c, w, h) => { c.fillStyle = "#C99A55"; c.fillRect(0, 0, w, h); const rr = kit.rng(2); for (let k = 0; k < 900; k++) { c.fillStyle = rr() < 0.5 ? "rgba(120,86,40,0.35)" : "rgba(255,240,210,0.4)"; c.fillRect(rr() * w, rr() * h, 1.5, 1.5); } }));
      const m = new T.Mesh(cone, new T.MeshStandardMaterial({ map: sandTex, roughness: 0.95 })); m.position.y = -1; m.rotation.x = 0.25; g.add(m);
    } else if (r.k === "al") {
      tilt(g); const can = new T.Mesh(new T.CylinderGeometry(7, 7, 20, 40), new T.MeshPhysicalMaterial({ color: 0xd8dde3, metalness: 0.9, roughness: 0.25 })); g.add(can);
      const lid = new T.Mesh(new T.TorusGeometry(6.3, 0.9, 8, 32), new T.MeshPhysicalMaterial({ color: 0xc4cad1, metalness: 0.9, roughness: 0.3 })); lid.rotation.x = Math.PI / 2; lid.position.y = 10; g.add(lid);
    } else {
      // 병이나 컵 + 속의 액체
      const isCup = r.k === "water";
      const prof = isCup ? [[0, 0], [8.5, 0], [10, 22], [9, 22], [7.6, 1.6], [0, 1.6]] : [[0, 0], [8, 0], [8.6, 2], [8.6, 14], [4, 19], [3.4, 24], [2.6, 24], [3.2, 19], [7.6, 14], [7.6, 2], [0, 1.5]];
      const bottle = new T.Mesh(new T.LatheGeometry(prof.map(([a, b]) => new T.Vector2(a, b)), 48), glassM); bottle.position.y = -12; g.add(bottle);
      const liqColor = r.k === "oil" ? 0xeaa812 : r.k === "eth" ? 0xa9cdf0 : 0x5aa0e8; // 에탄올은 본래 무색이지만 흰 바탕에서 액체로 읽히게 옅은 파랑
      const lp = isCup ? [[0, 1.7], [7.7, 1.7], [9.2, 17], [0, 17]] : [[0, 1.6], [7.5, 1.6], [7.5, 13.4], [0, 13.4]];
      const liq = new T.Mesh(new T.LatheGeometry(lp.map(([a, b]) => new T.Vector2(a, b)), 48), new T.MeshPhysicalMaterial({ color: liqColor, roughness: 0.12, clearcoat: 1 }));
      liq.position.y = -12; g.add(liq);
      if (!isCup) { const cap = new T.Mesh(new T.CylinderGeometry(2.8, 2.8, 3, 20), new T.MeshStandardMaterial({ color: r.k === "oil" ? 0xd9480f : 0x4a6fa8, roughness: 0.5 })); cap.position.y = 13.5; g.add(cap); }
    }
  });
  await kit.renderIllus(st, { ao: false, edgeK: 0.3 });
  await kit.frame();

  const svg = kit.layer(root, W, H);
  // 병과 컵의 테두리(투명한 유리라 흰 바탕에서 모양이 사라지지 않게, 입체와 같은 회전체 윤곽을 그대로 긋는다)
  ROWS.forEach((r, i) => {
    if (!["oil", "eth", "water"].includes(r.k)) return;
    const cy = TOP + i * ROW + ROW / 2;
    const outer = r.k === "water" ? [[0, 0], [8.5, 0], [10, 22]] : [[0, 0], [8, 0], [8.6, 2], [8.6, 14], [4, 19], [3.4, 24]];
    const pt = ([rr, y], sx) => `${(ICON_X + sx * rr).toFixed(2)} ${(cy + 12 - y).toFixed(2)}`;
    const d = "M" + [...outer.map((q) => pt(q, -1)), ...outer.slice().reverse().map((q) => pt(q, 1))].join(" L");
    svg.appendChild(kit.s("path", { d, fill: "none", stroke: "#7F93AE", "stroke-width": 1, "stroke-linejoin": "round" }));
  });
  kit.text(svg, 8, 14, "물을 1로 놓았을 때", { size: 12.5, weight: 700, color: "#4E5968", anchor: "start" });
  // 눈금(0, 0.5, 1)
  for (const t of [0, 0.5, 1]) {
    const x = BAR_X + t * BAR_L;
    svg.appendChild(kit.s("path", { d: `M${x} ${TOP - 4} V${TOP + ROWS.length * ROW}`, stroke: t === 0 ? "#AEB6C2" : "#E1E5EB", "stroke-width": 1, "stroke-dasharray": t === 0 ? null : "3 3" }));
    kit.text(svg, x, TOP + ROWS.length * ROW + 10, String(t), { size: 12, weight: 600, color: "#6B7484" });
  }
  ROWS.forEach((r, i) => {
    const cy = TOP + i * ROW + ROW / 2, isW = r.k === "water", len = r.v * BAR_L;
    kit.text(svg, ICON_X + 22, cy, r.name, { size: 13, weight: 700, anchor: "start", color: isW ? "#1D5FBF" : "#2B3445" });
    const fill = kit.lin(svg, 0, 0, 1, 0, isW ? [[0, "#4C9BF5"], [1, "#1E6FE0"]] : [[0, "#C7CED9"], [1, "#9AA5B5"]]);
    svg.appendChild(kit.s("rect", { x: BAR_X, y: cy - 8, width: len, height: 16, rx: 4, fill, filter: kit.shadowFilter(svg, { dy: 1, b: 1.2, a: 0.15 }) }));
    svg.appendChild(kit.s("rect", { x: BAR_X, y: cy - 8, width: len, height: 6, rx: 3, fill: "#FFFFFF", opacity: 0.25 }));
    kit.text(svg, BAR_X + len + 5, cy, r.v.toFixed(2).replace(/0$/, "").replace(/\.$/, ""), { size: 12.5, weight: 800, anchor: "start", color: isW ? "#1D5FBF" : "#3B4456" });
  });
  kit.text(svg, W - 8, 14, "물은 철의 약 9배", { size: 12.5, weight: 800, color: "#1D5FBF", anchor: "end" });
}
