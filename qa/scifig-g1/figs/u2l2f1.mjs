// u2l2f1 · 동물세포의 구조: 둥글고 조금 울퉁불퉁한 세포의 윗부분을 수평으로 잘라 속을 보인 입체 단면.
// 검산 메모: u2l2f1.md. 약속은 식물세포 그림(u2l2f2)과 같다(잘린 면은 크림색 세포질, 소기관은 그 면에서 잘려 속이 보임).
// 동물세포의 겉은 곧 세포막이다(세포벽이 없다). 소기관은 모두 막 안에 있다(placer가 검사).
import { cellMaterials, cutCapsule, wedgeNucleus, placer } from "../lib/cell.js";

export const meta = { key: "u2l2f1", w: 340, h: 218, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const st = await kit.three(root, { w: W, h: H, fov: 17.5, pos: [1.0, 8.95, 10.2], look: [0.1, 0.65, 0.25], envIntensity: 0.5, key: [-5, 11, 6], keyI: 1.65, fillI: 0.85, rimI: 0.35 });
  const { THREE: T, scene, renderer } = st;
  const M = cellMaterials(kit, T, renderer);

  // ── 세포의 꼴: 위에서 본 윤곽 R(θ)(타원에 낮은 물결) × 높이 방향 둥근 상자 꼴 ──
  const A = 2.0, C = 1.45, Y0 = 0.72, HH = 0.72, PW = 2.6;
  const R = (th) => {
    const e = 1 / Math.sqrt((Math.cos(th) / A) ** 2 + (Math.sin(th) / C) ** 2);
    return e * (1 + 0.05 * Math.sin(3 * th + 0.6) + 0.035 * Math.sin(5 * th + 2.1) + 0.02 * Math.sin(2 * th + 1.0));
  };
  const f = (t) => Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), PW)), 1 / PW);
  const YC = 1.08; // 자른 높이
  const fc = f((YC - Y0) / HH);
  const TMW = 0.07; // 잘린 둘레에서 보이는 막의 두께(보이게 과장)

  // 겉면(= 세포막): θ 160칸 × 높이 64칸, 위는 YC에서 잘린다
  const NU = 160, NV = 64;
  const pos = [], idx = [];
  for (let j = 0; j <= NV; j++) {
    const ph = -Math.PI / 2 + (j / NV) * Math.PI, t = Math.sin(ph), y = Y0 + HH * t, k = f(t);
    for (let i = 0; i <= NU; i++) {
      const th = (i / NU) * Math.PI * 2, rr = R(th) * k;
      pos.push(rr * Math.cos(th), y, rr * Math.sin(th));
    }
  }
  for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
    const a = j * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const memSkin = M.mem.clone(); memSkin.clippingPlanes = [new T.Plane(new T.Vector3(0, -1, 0), YC)];
  const skin = new T.Mesh(g, memSkin); skin.castShadow = true; skin.receiveShadow = true; scene.add(skin);

  // 잘린 면: 바깥 고리(막) + 안쪽(세포질)
  const ring = (scale, inset) => { const pts = []; for (let i = 0; i < 180; i++) { const th = (i / 180) * Math.PI * 2, rr = R(th) * scale - inset; pts.push(new T.Vector2(rr * Math.cos(th), -rr * Math.sin(th))); } return pts; };
  const outer = ring(fc, 0), inner = ring(fc, TMW);
  const ringShape = new T.Shape(outer); ringShape.holes.push(new T.Path(inner));
  const capRing = new T.Mesh(new T.ShapeGeometry(ringShape, 1), M.mem); capRing.geometry.rotateX(-Math.PI / 2); capRing.position.y = YC; scene.add(capRing);
  const cytoGeo = new T.ShapeGeometry(new T.Shape(inner), 1); cytoGeo.rotateX(-Math.PI / 2);
  // 세포질 질감 좌표(월드 x, z)
  { const p = cytoGeo.attributes.position, uv = cytoGeo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) * 0.5, p.getZ(i) * 0.5); }
  const cyto = new T.Mesh(cytoGeo, M.cytoMat); cyto.position.y = YC - 0.002; cyto.receiveShadow = true; scene.add(cyto);

  // ── 소기관: 막 안쪽(볼록 타원으로 안전하게 줄인 영역) + 서로 떨어지게 ──
  const safe = []; const sa = A * fc * 0.92 - 0.14, sc = C * fc * 0.92 - 0.14;
  for (let i = 0; i < 48; i++) { const th = (i / 48) * Math.PI * 2; safe.push([sa * Math.cos(th), sc * Math.sin(th)]); }
  const PL = placer(safe, 0.06);
  const CUT = YC + 0.045;
  const NP = [-0.35, YC + 0.06, -0.12], NR = 0.6;
  PL.fit(NP[0], NP[2], 0, { kind: "ellipse", a: NR, c: NR }, "핵");
  const W0 = (-50 * Math.PI) / 180, W1 = (62 * Math.PI) / 180;
  const nuc = wedgeNucleus(kit, T, scene, M, { pos: NP, R: NR, w0: W0, w1: W1 });
  const MITO = { kind: "capsule", r: 0.14, len: 0.2 };
  const mitos = [[0.75, 0.55, 0.4], [1.15, -0.25, 1.3], [0.45, -0.75, -0.3], [-1.25, 0.25, 1.4], [-0.6, 0.85, -0.2], [-1.05, -0.65, 0.6]].map(([x0, z0, ry], i) => {
    const [x, z] = PL.fit(x0, z0, ry, MITO, `마이토콘드리아${i + 1}`);
    return cutCapsule(T, scene, M, { x, z, rotY: ry, r: MITO.r, len: MITO.len, yc: YC - 0.01, cut: CUT });
  });
  console.log("placed", JSON.stringify(PL.placed.map((p) => [p.name, +p.x.toFixed(2), +p.z.toFixed(2), p.moved])));

  kit.shadowCatcher(T, scene, { y: 0, opacity: 0.15 });
  await kit.renderIllus(st, { radius: 0.3, thickness: 0.7, edgeK: 0.36 });
  await kit.frame();

  // ── 라벨 ──
  const svg = kit.layer(root, W, H);
  const P = (p) => st.project(p);
  const nucIn = P(nuc.inside), nucTop = P([NP[0] - 0.15, NP[1] + NR * 0.8, NP[2] - 0.25]);
  const mitoP = P(mitos[0].top);
  const thM = 2.2, memP = P([R(thM) * fc * Math.cos(thM) * 0.995, YC - 0.25, R(thM) * fc * Math.sin(thM) * 0.995]);
  console.log("proj", JSON.stringify({ nucIn, nucTop, mitoP, memP }));
  kit.label(svg, { at: nucTop, via: [nucTop[0] - 30, 18], to: [nucTop[0] - 36, 18], text: "핵", side: "l", size: 13.5 });
  kit.label(svg, { at: nucIn, via: [nucIn[0] + 70, 22], to: [nucIn[0] + 76, 22], text: "유전물질", side: "r", size: 13, sub: null });
  kit.label(svg, { at: mitoP, via: [mitoP[0] + 22, H - 16], to: [mitoP[0] + 28, H - 16], text: "마이토콘드리아", side: "r", size: 13.5 });
  kit.label(svg, { at: memP, via: [memP[0] - 26, memP[1] + 34], to: [memP[0] - 32, memP[1] + 34], text: "세포막", side: "l", size: 13.5 });
}
