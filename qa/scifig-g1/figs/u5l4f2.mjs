// u5l4f2 · 볼펜 속 용수철: 누름 볼펜의 촉 쪽을 세로로 반 갈라 속을 보인 단면 두 개(촉이 아래). (가) 심이 들어갔을 때, (나) 단추를 눌러 심이 나왔을 때.
// 검산 메모: u5l4f2.md. 크기는 mm로 잡고 3.4px/mm로 그린다. 용수철은 몸통 안쪽 턱(y 21 mm)과 심의 턱(칼라) 사이. 심이 5 mm 내려오면 용수철이 16 → 11 mm로 짧아진다.
// 탄성력(빨강)은 심의 턱에서 단추 쪽(위)으로. 두 장면의 몸통과 심은 같고, 용수철 두 끝은 늘 같은 두 턱에 닿아 있다. 용수철을 원래보다 늘어난 모습으로 그리지 않는다.
// 단추와 걸쇠는 그림 위쪽 바깥(몸통 뒤쪽 절반)에 있어 그리지 않았다(지어내지 않는다).
export const meta = { key: "u5l4f2", w: 340, h: 340, scale: 3, quality: 86 };

const D2R = Math.PI / 180;

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const MM = 3.4, YTIP = 292, TOPMM = 70; // px/mm, 펜 좌표 y = 0의 화면 높이, 그릴 위 끝(mm)
  const PENS = [{ sx: 92, yb: 5.5, tag: "(가) 심이 들어갔을 때" }, { sx: 248, yb: 0.5, tag: "(나) 단추를 눌러 심이 나왔을 때" }];
  const SHELF = 21, COLLAR = 1.6;
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: [0, 1000 * Math.sin(10 * D2R), 1000 * Math.cos(10 * D2R)], look: [0, 0, 0], envIntensity: 0.7, key: [-300, 500, 600], keyI: 1.5, fillI: 0.9, rimI: 0.3, shadows: false });
  const { THREE: T, scene } = st;
  // 펜 좌표(mm, 촉이 0, 위가 +) → 세계(px). 화면 x = sx.
  const toW = (sx, ymm) => new T.Vector3(sx - W / 2, (H / 2 - YTIP) + ymm * MM, 0);
  const barrelM = new T.MeshPhysicalMaterial({ color: 0x9fb8da, roughness: 0.4, clearcoat: 0.5, side: T.DoubleSide });
  const capM = new T.MeshStandardMaterial({ color: 0x7f9cc4, roughness: 0.6, side: T.DoubleSide });
  const steel = new T.MeshPhysicalMaterial({ color: 0xc5ccd6, metalness: 0.92, roughness: 0.28 });
  const brass = new T.MeshPhysicalMaterial({ color: 0xd9b25a, metalness: 0.85, roughness: 0.32 });
  const white = new T.MeshPhysicalMaterial({ color: 0xf4f6f8, roughness: 0.45, clearcoat: 0.3 });
  const tubeM = new T.MeshPhysicalMaterial({ color: 0xe9f1f9, roughness: 0.15, transparent: true, opacity: 0.22, clearcoat: 0.6, depthWrite: false });
  const inkM = new T.MeshStandardMaterial({ color: 0x1b3f8f, roughness: 0.45 });
  const bore = (y) => 1.15 + ((2.6 - 1.15) * (y - 4)) / (SHELF - 4); // 촉 쪽 안지름(반지름 mm)
  const out = [];
  for (const p of PENS) {
    const g = new T.Group(); g.position.copy(toW(p.sx, 0)); g.scale.setScalar(MM); scene.add(g);
    // 몸통(반 갈라 뒤쪽 절반만): 바깥 원뿔 → 원통, 안쪽 원통 → 턱 → 원뿔 구멍
    const prof = [[1.9, 4], [5.0, SHELF], [5.0, TOPMM], [4.0, TOPMM], [4.0, SHELF], [2.6, SHELF], [1.15, 4]];
    const barrel = kit.latheCut(T, prof, { phiStart: Math.PI / 2, phiLength: Math.PI, mat: barrelM, capMat: capM, castShadow: false });
    g.add(barrel.group);
    // 심: 볼, 황동 촉, 목, 턱(칼라), 잉크 대롱
    const yb = p.yb, yc = SHELF + (yb === 5.5 ? 16 : 11);
    const ball = new T.Mesh(new T.SphereGeometry(0.36, 24, 16), steel); ball.position.y = yb; g.add(ball);
    const tip = new T.Mesh(new T.LatheGeometry([new T.Vector2(0, yb + 0.15), new T.Vector2(0.45, yb + 0.25), new T.Vector2(1.0, yb + 4.0), new T.Vector2(0, yb + 4.0)], 48), brass); g.add(tip);
    const neck = new T.Mesh(new T.CylinderGeometry(1.0, 1.0, yc - (yb + 4), 40), white); neck.position.y = (yc + yb + 4) / 2; g.add(neck);
    const col = new T.Mesh(new T.CylinderGeometry(3.0, 3.0, COLLAR, 48), white); col.position.y = yc + COLLAR / 2; g.add(col);
    const tube = new T.Mesh(new T.CylinderGeometry(1.9, 1.9, TOPMM - yc - COLLAR, 48, 1, true), tubeM); tube.position.y = (TOPMM + yc + COLLAR) / 2; tube.userData.noEdge = true; g.add(tube);
    const ink = new T.Mesh(new T.CylinderGeometry(1.42, 1.42, TOPMM - yc - COLLAR - 0.4, 40), inkM); ink.position.y = (TOPMM + yc + COLLAR) / 2; g.add(ink);
    // 용수철: 턱(SHELF)과 칼라 아랫면 사이, 7감김
    const NC = 7, RC = 2.95, RW = 0.32;
    class Hx extends T.Curve { getPoint(t, o = new T.Vector3()) { const a = 2 * Math.PI * NC * t; return o.set(RC * Math.cos(a), SHELF + RW + (yc - SHELF - 2 * RW) * t, RC * Math.sin(a)); } }
    g.add(new T.Mesh(new T.TubeGeometry(new Hx(), NC * 40, RW, 10, false), steel));
    out.push({ ...p, yc, len: yc - SHELF, pitch: (yc - SHELF) / NC, tipOut: 4 - (yb - 0.36), bore: bore(yb + 4) });
  }
  await kit.renderIllus(st, { ao: true, radius: 2.5, thickness: 2, edge: true, edgeK: 0.42, nT: 0.5, dT: 0.02 });
  await kit.frame();

  const svg = kit.layer(root, W, H);
  const pj = (sx, ymm, xmm = 0) => st.project(toW(sx, ymm).add(new T.Vector3(xmm * MM, 0, 0)).toArray());
  const report = [];
  out.forEach((p, k) => {
    // 위쪽 끊김 표시(몸통은 위로 이어진다)
    const tl = pj(p.sx, TOPMM, -5.3), tr = pj(p.sx, TOPMM, 5.3);
    let d = `M${tl[0]} ${tl[1]}`;
    for (let i = 1; i <= 8; i++) { const x = tl[0] + ((tr[0] - tl[0]) * i) / 8; d += ` L${x} ${tl[1] + (i % 2 ? -2.2 : 2.2)}`; }
    svg.appendChild(kit.s("path", { d, stroke: "#FFFFFF", "stroke-width": 3.2, fill: "none" }));
    svg.appendChild(kit.s("path", { d, stroke: "#7F8FA6", "stroke-width": 1, fill: "none" }));
    kit.flowArrow(svg, `M${tl[0] + 8} ${tl[1] - 6} L${tl[0] + 8} ${tl[1] - 22}`, { w: 1.6, head: 6, hw: 3, fill: "#7F8FA6" });
    kit.text(svg, tl[0] + 14, tl[1] - 15, "단추 쪽", { size: 12, weight: 600, color: "#5B6475", anchor: "start" });
    kit.text(svg, p.sx, YTIP + 30, p.tag.split(" ").slice(0, 1)[0] + " " + p.tag.split(" ").slice(1).join(" "), { size: 12.5, weight: 800 });
    // 용수철 길이 표시(왼쪽)
    const yA = pj(p.sx, SHELF, -5.6), yB = pj(p.sx, p.yc, -5.6);
    const bx = yA[0] - 8;
    svg.appendChild(kit.s("path", { d: `M${bx + 3} ${yA[1]} L${bx - 3} ${yA[1]} M${bx} ${yA[1]} L${bx} ${yB[1]} M${bx + 3} ${yB[1]} L${bx - 3} ${yB[1]}`, stroke: "#2B3445", "stroke-width": 1.1, fill: "none" }));
    kit.text(svg, bx - 5, (yA[1] + yB[1]) / 2, k === 0 ? "길게" : "짧게", { size: 12, weight: 700, color: "#2B3445", anchor: "end" });
    report.push(`${p.tag.slice(0, 3)} 용수철 ${p.len} mm 간격 ${p.pitch.toFixed(2)} mm(철사 지름 0.64) 촉 ${p.yb < 4 ? "밖 " + (4 - p.yb + 0.36).toFixed(1) + " mm" : "안"} 촉 쪽 틈 ${(p.bore - 1.0).toFixed(2)} mm`);
  });
  // 이름(가): 용수철, 심, 심의 턱 / (나): 탄성력, 촉
  const A = out[0], B = out[1];
  const sp = pj(A.sx, SHELF + A.len * 0.55, 2.9), cl = pj(A.sx, A.yc + 0.8, 3.0), tb = pj(A.sx, 52, 1.9), bt = pj(A.sx, SHELF - 0.2, 3.5);
  kit.label(svg, { at: sp, via: [sp[0] + 30, sp[1]], to: [sp[0] + 34, sp[1]], text: "용수철", side: "r", size: 12.5 });
  kit.label(svg, { at: cl, via: [cl[0] + 30, cl[1] - 18], to: [cl[0] + 34, cl[1] - 18], text: "심의 턱", side: "r", size: 12.5 });
  kit.label(svg, { at: tb, via: [tb[0] + 30, tb[1]], to: [tb[0] + 34, tb[1]], text: "심", side: "r", size: 12.5 });
  kit.label(svg, { at: bt, via: [bt[0] + 30, bt[1] + 30], to: [bt[0] + 34, bt[1] + 30], text: "몸통 안쪽 턱", side: "r", size: 12, sub: "용수철이 닿는 곳" });
  // 탄성력: 심의 턱(칼라 오른쪽 가장자리)에서 위로, 대롱과 몸통 벽 사이 틈으로
  const c0 = pj(B.sx, B.yc + COLLAR, 2.95), c1 = pj(B.sx, B.yc + COLLAR + 11, 2.95);
  kit.flowArrow(svg, `M${c0[0]} ${c0[1]} L${c1[0]} ${c1[1]}`, { w: 3, head: 8, hw: 2.2, fill: "#E03131", stroke: "#FFFFFF" });
  kit.label(svg, { at: [c1[0] + 1, c1[1] + 6], via: [c1[0] + 26, c1[1] + 6], to: [c1[0] + 30, c1[1] + 6], text: "탄성력", side: "r", size: 12.5, color: "#C92A2A", dot: false });
  const tp = pj(B.sx, 1.2, 0.6);
  kit.label(svg, { at: tp, via: [tp[0] + 28, tp[1] + 4], to: [tp[0] + 32, tp[1] + 4], text: "촉이 밖으로", side: "r", size: 12 });
  console.log("placed " + report.join(" | "));
}
