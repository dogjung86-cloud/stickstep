// u7l4f1 · 천구에 그린 별의 하루 길(우리나라, 북위 37°). 둥근 땅 가운데 관측자, 그 위의 투명한 반구가 천구.
// 검산 메모: u7l4f1.md. 별의 방향 s(δ, H) = cos δ (cos H·m + sin H·W) + sin δ·p(지평 좌표 북, 서, 위). 길은 모두 자전축 방향 p에 수직인 평행한 원.
// 사진기는 남남동쪽 바깥 위에 둔다. 북쪽 원을 천구 안쪽 면으로 보게 되어 화면에서도 관측자가 보는 대로 시계 반대로 돈다(코드가 넓이 부호로 확인한다).
// 땅과 관측자는 입체로 굽고, 천구 유리와 별의 길은 계산한 자리에 그린다. 앞면(사진기 쪽)의 길은 진하게, 뒷면은 유리 너머라 옅게.
export const meta = { key: "u7l4f1", w: 340, h: 242, scale: 3, quality: 86 };

const D2R = Math.PI / 180;
const PHI = 37 * D2R;
const P = [Math.cos(PHI), 0, Math.sin(PHI)]; // 천구 북극(지평 좌표: 북, 서, 위)
const M = [-Math.sin(PHI), 0, Math.cos(PHI)]; // 남쪽 하늘에서 적도가 가장 높은 점
const WV = [0, 1, 0];
const starDir = (dec, H) => {
  const c = Math.cos(dec), sd = Math.sin(dec), ch = Math.cos(H), sh = Math.sin(H);
  return [0, 1, 2].map((i) => c * (ch * M[i] + sh * WV[i]) + sd * P[i]);
};
// 지평 좌표(북, 서, 위) → 장면 좌표(x 동, y 위, z 남)
const toScene = (v, R) => [-v[1] * R, v[2] * R, -v[0] * R];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]); return v.map((x) => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export async function draw(root, kit) { return drawWith(root, kit, {}); }
export async function drawWith(root, kit, opt) {
  const W = meta.w, H = meta.h;
  const R = opt.R ?? 146;            // 천구 반지름(px)
  const AZ = (opt.az ?? 160) * D2R;  // 사진기 방위(북에서 시계 방향, 160° = 남남동)
  const EL = (opt.el ?? 14) * D2R;   // 사진기 높이(내려다보는 각, 낮을수록 북쪽 원이 둥글게 보인다)
  const OX = W / 2, OY = opt.oy ?? 170; // 땅 가운데의 화면 자리
  const SLAB = 9;
  const posDir = [Math.sin(AZ) * Math.cos(EL), Math.sin(EL), -Math.cos(AZ) * Math.cos(EL)];
  const fwd = posDir.map((v) => -v);
  const right = norm([-fwd[2], 0, fwd[0]]);
  const up = cross(right, fwd);
  const tgt = up.map((v) => v * (OY - H / 2));
  const camPos = tgt.map((v, i) => v + posDir[i] * 2000);

  // ── 뒤 칸: 천구 안쪽(뒷면) 바탕과 뒷면의 길 ──
  const bg = kit.layer(root, W, H);
  // ── 입체: 둥근 땅과 관측자 ──
  const st = await kit.three(root, { w: W, h: H, ortho: H, pos: camPos, look: tgt, envIntensity: 0.55, key: [-260, 520, 300], keyI: 1.7, fillI: 0.85, rimI: 0.35, shadows: true });
  const { THREE: T, scene, renderer } = st;
  const sk = st.keyL.shadow.camera; sk.left = -60; sk.right = 60; sk.top = 60; sk.bottom = -60; sk.near = 10; sk.far = 1500; sk.updateProjectionMatrix();
  st.keyL.target.position.set(0, 0, 0); scene.add(st.keyL.target);
  const grass = kit.canvasTex(T, renderer, kit.canvas(512, 512, (c, w, h) => {
    const img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = kit.fbm(x / 22, y / 22, 4, 5), m = kit.fbm(x / 4.5, y / 4.5, 2, 9);
      const i = (y * w + x) * 4;
      img.data[i] = 150 + (n - 0.5) * 34 + (m - 0.5) * 16; img.data[i + 1] = 190 + (n - 0.5) * 30 + (m - 0.5) * 18; img.data[i + 2] = 128 + (n - 0.5) * 24; img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  }));
  const soil = new T.MeshStandardMaterial({ color: 0xb48c66, roughness: 0.95 });
  const top = new T.MeshStandardMaterial({ map: grass, roughness: 0.95 });
  const ground = new T.Mesh(new T.CylinderGeometry(R, R, SLAB, 160, 1), [soil, top, soil]);
  ground.position.y = -SLAB / 2; ground.receiveShadow = true; scene.add(ground);
  // 관측자(노란 모자 학생): 북쪽을 보고 서서 고개를 들어 북극성 쪽을 본다
  const man = new T.Group();
  const skin = new T.MeshPhysicalMaterial({ color: 0xf1c3a0, roughness: 0.55, sheen: 0.3, sheenColor: 0xffe2d0 });
  const coat = new T.MeshPhysicalMaterial({ color: 0x2f9e8f, roughness: 0.5, clearcoat: 0.2 });
  const pants = new T.MeshStandardMaterial({ color: 0x34406a, roughness: 0.7 });
  const capM = new T.MeshPhysicalMaterial({ color: 0xffcf33, roughness: 0.45, clearcoat: 0.3 });
  const capsule = (r, len, m) => { const o = new T.Mesh(new T.CapsuleGeometry(r, len, 8, 18), m); o.castShadow = true; return o; };
  for (const sx of [-1, 1]) { const leg = capsule(2.1, 8, pants); leg.position.set(sx * 2.3, 6.2, 0); man.add(leg); }
  const body = capsule(4.3, 6.5, coat); body.position.y = 17; man.add(body);
  for (const sx of [-1, 1]) { const arm = capsule(1.6, 8.5, coat); arm.position.set(sx * 5.6, 16.4, 0); arm.rotation.z = sx * 0.16; man.add(arm); }
  const head = new T.Group(); head.position.y = 27.6; head.rotation.x = 0.55; man.add(head); // 고개를 든다(얼굴 쪽 = -z = 북)
  const skull = new T.Mesh(new T.SphereGeometry(4.5, 28, 20), skin); skull.castShadow = true; head.add(skull);
  const dome = new T.Mesh(new T.SphereGeometry(4.75, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), capM); dome.position.y = 0.5; head.add(dome);
  const brim = new T.Mesh(new T.CylinderGeometry(3.6, 3.6, 0.7, 24, 1, false, 0, Math.PI), capM); brim.rotation.y = Math.PI / 2; brim.position.set(0, 1.4, -3.4); brim.scale.set(1, 1, 1.25); head.add(brim);
  scene.add(man);
  await kit.renderIllus(st, { ao: true, radius: 6, thickness: 4, aoScale: 1.0, edge: true, edgeK: 0.42, nT: 0.5, dT: 0.02 });
  await kit.frame();

  const proj = (v) => st.project(v);
  const O = proj([0, 0, 0]);
  const front = (v) => dot(v, posDir) > 0; // 바깥 법선이 사진기를 보면 앞면
  const EYE = [0, 27.6, 0];

  // ── 천구 유리의 테두리와 바탕(위 반원 + 앞쪽 반타원) ──
  const SE = Math.sin(EL);
  const domeD = `M${O[0] - R} ${O[1]} A${R} ${R} 0 0 1 ${O[0] + R} ${O[1]} A${R} ${R * SE} 0 0 1 ${O[0] - R} ${O[1]} Z`;
  bg.appendChild(kit.s("path", { d: domeD, fill: kit.rad(bg, 0.5, 0.62, 0.62, [[0, "#F4F8FF"], [0.72, "#E4EEFC"], [1, "#CCDDF6"]]) }));

  // ── 별의 길 ──
  const DECS = opt.decs ?? [75, 55, 0, -12];
  const backG = kit.s("g", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" });
  bg.appendChild(backG);
  const fg = kit.layer(root, W, H);
  const axisG = kit.s("g"); fg.appendChild(axisG);
  // 앞 유리(땅과 관측자 위를 살짝 덮는다)
  fg.appendChild(kit.s("path", { d: domeD, fill: kit.rad(fg, 0.5, 0.78, 0.62, [[0, "#D6E6FB", 0.04], [0.72, "#C9DCF7", 0.12], [1, "#9DBDEB", 0.42]]) }));
  fg.appendChild(kit.s("path", { d: `M${O[0] + R} ${O[1]} A${R} ${R * SE} 0 0 1 ${O[0] - R} ${O[1]}`, stroke: "#9DBDEB", "stroke-width": 1.2, fill: "none", opacity: 0.9 }));
  const hl = kit.s("path", { d: `M${O[0] - R * 0.86} ${O[1] - R * 0.36} A${R * 0.93} ${R * 0.93} 0 0 1 ${O[0] - R * 0.3} ${O[1] - R * 0.86}`, stroke: "#FFFFFF", "stroke-width": 5, fill: "none", "stroke-linecap": "round", opacity: 0.75 });
  hl.setAttribute("filter", kit.blurFilter(fg, 1.4)); fg.appendChild(hl);
  fg.appendChild(kit.s("path", { d: `M${O[0] - R} ${O[1]} A${R} ${R} 0 0 1 ${O[0] + R} ${O[1]}`, stroke: "#7EA3D8", "stroke-width": 1.3, fill: "none" }));
  const frontG = kit.s("g", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" });
  fg.appendChild(frontG);
  const FRONT = "#3346C8", BACK = "#8E9BE6";
  const pathPts = (dec) => {
    const out = [];
    for (let k = 0; k <= 720; k++) {
      const Hh = -Math.PI + (k * Math.PI) / 360;
      const v = toScene(starDir(dec * D2R, Hh), R);
      out.push({ v, up: v[1] > 0.6, fr: front(v), s: proj(v), H: Hh });
    }
    return out;
  };
  let ccw = null;
  for (const dec of DECS) {
    const pts = pathPts(dec);
    let run = [], cls = null;
    const flush = () => {
      if (run.length > 1) {
        const d = run.map((p, i) => `${i ? "L" : "M"}${p.s[0].toFixed(2)} ${p.s[1].toFixed(2)}`).join(" ");
        if (cls === "f") { frontG.appendChild(kit.s("path", { d, stroke: "#FFFFFF", "stroke-width": 4.4, opacity: 0.85 })); frontG.appendChild(kit.s("path", { d, stroke: FRONT, "stroke-width": 2.1 })); }
        else backG.appendChild(kit.s("path", { d, stroke: BACK, "stroke-width": 1.6 }));
      }
      run = [];
    };
    for (const p of pts) {
      const c = !p.up ? null : p.fr ? "f" : "b";
      if (c !== cls) { if (cls) { const last = run[run.length - 1]; flush(); if (c && last) run.push(last); } else flush(); cls = c; }
      if (c) run.push(p);
    }
    flush();
    if (dec === 75) {
      // 넓이 부호(화면 y는 아래로): 음수면 화면에서 시계 반대
      let A = 0;
      for (let i = 0; i < pts.length - 1; i++) A += pts[i].s[0] * pts[i + 1].s[1] - pts[i + 1].s[0] * pts[i].s[1];
      ccw = A / 2;
    }
  }
  console.log(`proj 북쪽 원(적위 75°) 화면 넓이 ${ccw.toFixed(0)} (${ccw < 0 ? "시계 반대" : "시계 방향"})`);

  // 길 위 화살촉(시간각이 커지는 쪽 = 별이 움직이는 쪽)
  const arrowHead = (dec, Hd) => {
    const a = toScene(starDir(dec * D2R, Hd * D2R), R), b = toScene(starDir(dec * D2R, (Hd + 1.5) * D2R), R);
    if (a[1] < 1) return;
    const sa = proj(a), sb = proj(b);
    const tx = sb[0] - sa[0], ty = sb[1] - sa[1], tl = Math.hypot(tx, ty) || 1, ux = tx / tl, uy = ty / tl;
    const fr = front(a), L = fr ? 7.5 : 6.5, Wd = fr ? 3.6 : 3.1;
    const tip = [sa[0] + ux * L * 0.55, sa[1] + uy * L * 0.55];
    const b1 = [sa[0] - ux * L * 0.45 - uy * Wd, sa[1] - uy * L * 0.45 + ux * Wd], b2 = [sa[0] - ux * L * 0.45 + uy * Wd, sa[1] - uy * L * 0.45 - ux * Wd];
    (fr ? frontG : backG).appendChild(kit.s("path", { d: `M${tip[0]} ${tip[1]} L${b1[0]} ${b1[1]} L${b2[0]} ${b2[1]} Z`, fill: fr ? FRONT : BACK, stroke: "none" }));
  };
  const ARROWS = { 75: [100, -80], 60: [100, -80], 55: [100, -80], 30: [-75, 70], 0: [-55, 52], [-12]: [-46, 42], [-30]: [-38, 34] };
  for (const dec of DECS) for (const Hd of ARROWS[dec]) arrowHead(dec, Hd);

  // 별(지금 자리)
  const starShape = (cx, cy, r) => {
    let d = "";
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`; }
    return d + "Z";
  };
  const putStar = (v, r, g) => { const s = proj(v); g.appendChild(kit.s("path", { d: starShape(s[0], s[1], r), fill: "#FFC21A", stroke: "#B7791F", "stroke-width": 0.8, "stroke-linejoin": "round" })); return s; };
  const STARS = { 75: 160, 60: -150, 55: -150, 30: -40, 0: 18, [-12]: -12, [-30]: -10 };
  for (const dec of DECS) { const v = toScene(starDir(dec * D2R, STARS[dec] * D2R), R); putStar(v, 4.4, front(v) ? frontG : backG); }

  // 북극성과 자전축 방향(관측자 눈에서 북극성까지, 넘어서 천구 밖으로)
  const pole = toScene(P, R);
  const sp = proj(pole), se = proj(EYE);
  const ux = sp[0] - se[0], uy = sp[1] - se[1], ul = Math.hypot(ux, uy);
  axisG.appendChild(kit.s("path", { d: `M${se[0]} ${se[1]} L${sp[0]} ${sp[1]}`, stroke: "#4A5874", "stroke-width": 1.3, "stroke-dasharray": "3.5 3", fill: "none" }));
  const ext = [sp[0] + (ux / ul) * 30, sp[1] + (uy / ul) * 30];
  kit.flowArrow(fg, `M${sp[0] + (ux / ul) * 6} ${sp[1] + (uy / ul) * 6} L${ext[0]} ${ext[1]}`, { w: 1.4, head: 6.5, hw: 3.2, fill: "#4A5874" });
  fg.appendChild(kit.s("circle", { cx: sp[0], cy: sp[1], r: 8, fill: "#FFE9A8", opacity: 0.6, filter: kit.blurFilter(fg, 2) }));
  putStar(pole, 6.2, fg);

  // ── 이름 ──
  kit.text(fg, ext[0] + 4, ext[1] - 6, "자전축 방향", { size: 12, weight: 700, color: "#3D4757", anchor: "start" });
  kit.label(fg, { at: [sp[0] + 4, sp[1] + 5], via: [sp[0] + 26, sp[1] + 18], to: [sp[0] + 30, sp[1] + 18], text: "북극성", size: 12.5 });
  const sil = (deg) => [O[0] + R * Math.cos(deg * D2R), O[1] - R * Math.sin(deg * D2R)];
  const c1 = sil(146);
  kit.label(fg, { at: c1, via: [c1[0] - 10, c1[1] - 22], to: [c1[0] - 14, c1[1] - 22], text: "천구", side: "l", size: 13 });
  const rimL = [O[0] - R * Math.cos(30 * D2R), O[1] + R * SE * Math.sin(30 * D2R)];
  kit.label(fg, { at: rimL, via: [rimL[0] - 4, O[1] + R * SE + SLAB + 16], to: [rimL[0], O[1] + R * SE + SLAB + 16], text: "지평선", side: "r", size: 12.5 });
  // 방위 표지(땅 위)
  const badge = (v, t) => {
    const s = proj(v);
    fg.appendChild(kit.s("circle", { cx: s[0], cy: s[1], r: 9, fill: "#FFFFFF", stroke: "#5B6B8C", "stroke-width": 1.1 }));
    kit.text(fg, s[0], s[1] + 0.5, t, { size: 12, weight: 800, color: "#2B3445", halo: false });
  };
  // 방위 표지가 앞면의 길과 겹치지 않는 거리를 고른다(길 점에서 표지 가운데까지 13px 넘게)
  const frontPts = [];
  for (const dec of DECS) for (const p of pathPts(dec)) if (p.up && p.fr) frontPts.push(p.s);
  const clear = (v) => Math.min(...frontPts.map((q) => Math.hypot(q[0] - proj(v)[0], q[1] - proj(v)[1])));
  const pick = (dir) => {
    let best = null;
    for (const f of [0.84, 0.78, 0.72, 0.66, 0.9]) { const v = dir.map((x) => x * f * R); v[1] = 0.5; const c = clear(v); if (!best || c > best.c + 2) best = { v, c, f }; if (c > 13) { best = { v, c, f }; break; } }
    return best;
  };
  const bad = [];
  for (const [dir, t] of [[[0, 0, -1], "북"], [[0, 0, 1], "남"], [[1, 0, 0], "동"], [[-1, 0, 0], "서"]]) { const b = pick(dir); badge(b.v, t); bad.push(`${t} ${b.f} ${b.c.toFixed(1)}px`); }
  console.log("placed 방위 표지 " + bad.join(", "));
  console.log(`placed 북극성 (${sp[0].toFixed(0)},${sp[1].toFixed(0)}) 눈 (${se[0].toFixed(0)},${se[1].toFixed(0)}) 땅 가운데 (${O[0].toFixed(0)},${O[1].toFixed(0)})`);
}
