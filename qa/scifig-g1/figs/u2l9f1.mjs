// u2l9f1 · 핵막이 없는 세포와 있는 세포: 젖산균(원핵생물)과 효모를 같은 축척으로 나란히, 둘 다 길게 반 갈라 속을 보인다.
// 검산 메모: u2l9f1.md. 1 µm = 월드 1단위, 정사영 카메라(크기 비교가 원근에 흔들리지 않게).
// 원핵세포의 유전물질은 막 없이 세포질에 엉켜 있고, 효모의 유전물질은 두 겹 핵막 안에 있다. 유전물질 색은 둘이 같다.
import { cellMaterials, cutCapsule, wedgeNucleus, placer } from "../lib/cell.js";

export const meta = { key: "u2l9f1", w: 340, h: 258, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const S = 29; // px / µm
  const VIEW = H / S;
  const EL = (48 * Math.PI) / 180; // 내려다보는 각
  const LOOK = [0.15, 0.9, 0.0];
  const st = await kit.three(root, { w: W, h: H, ortho: VIEW, pos: [LOOK[0], LOOK[1] + Math.sin(EL) * 60, LOOK[2] + Math.cos(EL) * 60], look: LOOK, envIntensity: 0.5, key: [-5, 11, 6], keyI: 1.6, fillI: 0.85, rimI: 0.3 });
  const { THREE: T, scene, renderer } = st;
  const M = cellMaterials(kit, T, renderer);
  const wallTex = kit.canvasTex(T, renderer, kit.canvas(256, 256, (c, w, h) => {
    c.fillStyle = "#A9825F"; c.fillRect(0, 0, w, h);
    const r = kit.rng(3);
    for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, a = (r() - 0.5) * 0.8; c.strokeStyle = r() < 0.5 ? "rgba(255,236,214,0.12)" : "rgba(70,44,26,0.12)"; c.lineWidth = 1 + r(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); c.stroke(); }
  }), { repeat: [2, 2] });
  const wallMat = new T.MeshPhysicalMaterial({ map: wallTex, roughness: 0.7, sheen: 0.25, sheenColor: 0xffe2c4, side: T.DoubleSide });
  const GEN = 0x5b3fc4; // 유전물질 색(두 세포가 같다)

  // ── 잘린 면(위에서 본 윤곽 셋: 벽 바깥, 벽 안 = 막 바깥, 막 안 = 세포질) ──
  function capRings(outlineAt, yCut, tWall, tMem) {
    const shapeOf = (d) => outlineAt(d).map(([x, z]) => new T.Vector2(x, -z));
    const mk = (outerD, innerD, mat) => {
      const sh = new T.Shape(shapeOf(outerD)); if (innerD !== null) sh.holes.push(new T.Path(shapeOf(innerD)));
      const g = new T.ShapeGeometry(sh, 1); g.rotateX(-Math.PI / 2);
      const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) * 0.6, p.getZ(i) * 0.6);
      const m = new T.Mesh(g, mat); m.position.y = yCut; m.receiveShadow = true; scene.add(m);
    };
    mk(0, tWall, wallMat);
    mk(tWall, tWall + tMem, M.mem);
    mk(tWall + tMem, null, M.cytoMat);
  }
  const clip = (y) => [new T.Plane(new T.Vector3(0, -1, 0), y)];

  // ── 젖산균: 막대(지름 1 µm, 길이 3 µm). 굴대 높이에서 잘라 아래 절반만 ──
  const BX = -3.55, BR = 0.5, BL = 3.0, BY = BR;
  {
    const g = new T.CapsuleGeometry(BR, BL - 2 * BR, 24, 64); g.rotateZ(Math.PI / 2);
    const wm = wallMat.clone(); wm.clippingPlanes = clip(BY);
    const m = new T.Mesh(g, wm); m.position.set(BX, BY, 0); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    const stadium = (d) => { // 길이 방향 x, 반폭 BR - d
      const pts = [], hl = (BL - 2 * BR) / 2, rr = BR - d;
      for (let i = 0; i <= 24; i++) { const t = -Math.PI / 2 + (i / 24) * Math.PI; pts.push([BX + hl + rr * Math.cos(t), rr * Math.sin(t)]); }
      for (let i = 0; i <= 24; i++) { const t = Math.PI / 2 + (i / 24) * Math.PI; pts.push([BX - hl + rr * Math.cos(t), rr * Math.sin(t)]); }
      return pts;
    };
    capRings(stadium, BY + 0.002, 0.075, 0.045);
    // 유전물질: 막 없이 세포질 가운데에 엉킨 실타래(관 여러 가닥)
    const r = kit.rng(19), genMat = new T.MeshPhysicalMaterial({ color: GEN, roughness: 0.4, clearcoat: 0.5 });
    for (let k = 0; k < 10; k++) {
      const pts = [];
      let x = BX + (r() - 0.5) * 0.9, z = (r() - 0.5) * 0.24;
      for (let s = 0; s < 9; s++) { x += (r() - 0.5) * 0.42; z += (r() - 0.5) * 0.22; x = Math.max(BX - 0.7, Math.min(BX + 0.7, x)); z = Math.max(-0.17, Math.min(0.17, z)); pts.push(new T.Vector3(x, BY + 0.01 + r() * 0.035, z)); }
      const tube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 80, 0.022, 8, false), genMat);
      tube.castShadow = true; scene.add(tube);
    }
  }

  // ── 효모: 타원체(5 × 4 µm). 가운데 높이에서 잘라 아래 절반만 ──
  const YX = 2.75, YA = 2.5, YB = 1.9, YCc = 2.0, YY = YB;
  const yeastCut = YY + 0.002;
  {
    const g = new T.SphereGeometry(1, 96, 64); g.scale(YA, YB, YCc);
    const wm = wallMat.clone(); wm.clippingPlanes = clip(YY);
    const m = new T.Mesh(g, wm); m.position.set(YX, YY, 0); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    const ell = (d) => { const pts = []; for (let i = 0; i < 96; i++) { const t = (i / 96) * Math.PI * 2; pts.push([YX + (YA - d) * Math.cos(t), (YCc - d) * Math.sin(t)]); } return pts; };
    capRings(ell, yeastCut, 0.17, 0.05);
  }
  // 효모 속: 핵(지름 약 1.5 µm, 두 겹 핵막과 핵공) + 마이토콘드리아 둘
  const safe = []; for (let i = 0; i < 48; i++) { const t = (i / 48) * Math.PI * 2; safe.push([YX + (YA - 0.38) * Math.cos(t), (YCc - 0.38) * Math.sin(t)]); }
  const PL = placer(safe, 0.08);
  // 핵: 세포와 같은 면에서 잘린 공. 잘린 면에 두 겹 핵막(군데군데 핵공으로 끊긴 두 고리)과 그 안의 유전물질.
  const NR = 0.78, NP = [YX - 0.45, yeastCut - 0.12, -0.12], NCUT = yeastCut + 0.05;
  PL.fit(NP[0], NP[2], 0, { kind: "ellipse", a: NR, c: NR }, "핵");
  const kN = Math.sqrt(1 - ((NCUT - NP[1]) / NR) ** 2), NRc = NR * kN; // 잘린 면의 반지름
  {
    const sm = M.nucShell.clone(); sm.side = T.DoubleSide; sm.clippingPlanes = clip(NCUT);
    const sh = new T.Mesh(new T.SphereGeometry(NR, 96, 64), sm); sh.position.set(...NP); sh.castShadow = true; sh.receiveShadow = true; scene.add(sh);
    const capTex = kit.canvasTex(T, renderer, kit.canvas(512, 512, (c, w, h) => {
      const cx = w / 2, cy = h / 2, R0 = w / 2;
      c.save(); c.beginPath(); c.arc(cx, cy, R0, 0, Math.PI * 2); c.clip();
      const g = c.createRadialGradient(cx - 60, cy - 60, 20, cx, cy, R0); g.addColorStop(0, "#C9B8F5"); g.addColorStop(1, "#9C86E8");
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      // 유전물질: 막대 세균의 실타래와 같은 색, 같은 굵기
      const r = kit.rng(12); c.lineCap = "round";
      for (let k = 0; k < 46; k++) {
        let x = cx + (r() - 0.5) * 300, y = cy + (r() - 0.5) * 300, a = r() * Math.PI * 2;
        c.strokeStyle = "#5B3FC4"; c.lineWidth = 9;
        c.beginPath(); c.moveTo(x, y);
        for (let q = 0; q < 7; q++) { a += (r() - 0.5) * 1.6; x += Math.cos(a) * 16; y += Math.sin(a) * 16; c.lineTo(x, y); }
        c.stroke();
      }
      c.restore();
      // 두 겹 핵막: 바깥 고리와 안쪽 고리, 열두 군데 핵공에서 두 고리가 함께 끊긴다
      const gaps = 12;
      for (const [rad, col, lw] of [[R0 - 9, "#3A2393", 13], [R0 - 33, "#4B2FA8", 11]]) {
        c.strokeStyle = col; c.lineWidth = lw; c.lineCap = "butt";
        for (let i = 0; i < gaps; i++) {
          const a0 = (i / gaps) * Math.PI * 2 + 0.06, a1 = ((i + 1) / gaps) * Math.PI * 2 - 0.06;
          c.beginPath(); c.arc(cx, cy, rad, a0, a1); c.stroke();
        }
      }
    }));
    const cap = new T.Mesh(new T.CircleGeometry(NRc, 96), M.capMat(capTex)); cap.geometry.rotateX(-Math.PI / 2); cap.position.set(NP[0], NCUT + 0.001, NP[2]); scene.add(cap);
  }
  const nuc = { inside: [NP[0] + 0.12, NCUT, NP[2] + 0.1] };
  const MITO = { kind: "capsule", r: 0.17, len: 0.34 };
  const mitos = [[YX + 1.15, 0.55, 0.5], [YX + 0.95, -0.75, -0.6]].map(([x0, z0, ry], i) => {
    const [x, z] = PL.fit(x0, z0, ry, MITO, `마이토콘드리아${i + 1}`);
    return cutCapsule(T, scene, M, { x, z, rotY: ry, r: MITO.r, len: MITO.len, yc: yeastCut - 0.02, cut: yeastCut + 0.04 });
  });
  console.log("placed", JSON.stringify(PL.placed.map((p) => [p.name, +p.x.toFixed(2), +p.z.toFixed(2), p.moved])));

  kit.shadowCatcher(T, scene, { y: 0, opacity: 0.14 });
  await kit.renderIllus(st, { radius: 0.35, thickness: 0.8, edgeK: 0.36 });
  await kit.frame();

  // ── 라벨: 가운데 줄의 이름에서 두 세포로 갈라지는 지시선(세포벽, 세포막, 유전물질), 효모에만 있는 것은 오른쪽 ──
  const svg = kit.layer(root, W, H);
  const P = (p) => st.project(p);
  const midX = P([-0.75, 0, 0])[0];
  const fz = (d, x, A, Cc) => (Cc - d) * Math.sqrt(Math.max(0, 1 - (x / (A - d)) ** 2)); // 타원 앞쪽 둘레의 z
  const bWall = P([BX + 0.55, BY, BR - 0.035]), bMem = P([BX + 0.15, BY, BR - 0.1]);
  const yWall = P([YX - 1.0, yeastCut, fz(0.085, 1.0, YA, YCc)]), yMem = P([YX - 1.35, yeastCut, fz(0.195, 1.35, YA, YCc)]);
  const bGen = P([BX + 0.05, BY + 0.04, 0.0]), yGen = P(nuc.inside);
  const yNuc = P([NP[0] - NRc * 0.5, NCUT, NP[2] - NRc * 0.5]), yEnv = P([NP[0] + NRc * 0.94, NCUT, NP[2] - NRc * 0.2]);
  const yMito = P(mitos[0].top);
  console.log("proj", JSON.stringify({ midX, bWall, yWall, bMem, yMem, bGen, yGen, yNuc, yEnv, yMito }));
  const fork = (y, text, a, b) => {
    const tw = text.length * 12.6 + 4;
    kit.label(svg, { at: a, via: [midX - tw / 2 - 6, y], to: [midX - tw / 2 - 2, y], text: "", side: "r", size: 13 });
    kit.label(svg, { at: b, via: [midX + tw / 2 + 6, y], to: [midX + tw / 2 + 2, y], text: "", side: "l", size: 13 });
    kit.text(svg, midX, y, text, { size: 13, weight: 700 });
  };
  fork(32, "유전물질", bGen, yGen);
  fork(152, "세포막", bMem, yMem);
  fork(178, "세포벽", bWall, yWall);
  kit.label(svg, { at: yNuc, via: [yNuc[0] + 4, 58], to: [yNuc[0] + 8, 58], text: "핵", side: "r", size: 13.5 });
  kit.label(svg, { at: yEnv, via: [yEnv[0] + 22, 76], to: [yEnv[0] + 26, 76], text: "핵막", side: "r", size: 13.5 });
  kit.label(svg, { at: yMito, via: [W - 96, H - 54], to: [W - 92, H - 54], text: "마이토콘드리아", side: "r", size: 12.5 });
  // 이름과 축척
  const bTitle = P([BX, 0, BR + 0.4]), yTitle = P([YX, 0, YCc + 0.4]);
  kit.text(svg, bTitle[0], H - 34, "젖산균", { size: 14, weight: 800, color: "#2B3445" });
  kit.text(svg, bTitle[0], H - 16, "핵막이 없어요", { size: 12, weight: 600, color: "#5B6475" });
  kit.text(svg, yTitle[0], H - 34, "효모", { size: 14, weight: 800, color: "#2B3445" });
  kit.text(svg, yTitle[0], H - 16, "핵막이 있어요", { size: 12, weight: 600, color: "#5B6475" });
  const s1 = P([1, 0, 0])[0] - P([0, 0, 0])[0];
  const sbX = midX - s1 / 2, sbY = H - 30;
  svg.appendChild(kit.s("path", { d: `M${sbX} ${sbY - 4} V${sbY + 4} M${sbX} ${sbY} H${sbX + s1} M${sbX + s1} ${sbY - 4} V${sbY + 4}`, stroke: "#2B3445", "stroke-width": 1.6, fill: "none" }));
  kit.text(svg, midX, sbY + 14, "1 µm", { size: 12, weight: 700 });
  void bTitle; void yTitle;
}
