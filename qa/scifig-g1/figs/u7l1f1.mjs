// u7l1f1 · 혜성의 꼬리: 위에서 내려다본 길쭉한 타원 궤도 하나와 혜성의 다섯 자리. 꼬리는 자리마다 태양에서 혜성으로 그은 직선의 연장 쪽.
// 검산 메모: u7l1f1.md. 태양은 타원의 초점(가운데가 아니다), 궤도 이심률 0.8, 혜성은 위에서 보아 시계 반대로 돈다(행성과 같은 쪽).
// 꼬리 길이는 태양까지 거리 r로만 정한다: L = Lmax · (rc / r − 1) / (rc / rmin − 1), r > rc이면 0(멀면 꼬리가 없다).
export const meta = { key: "u7l1f1", w: 340, h: 204, scale: 3, quality: 88, bg: "#0B1426" };

const D2R = Math.PI / 180;

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const A = 118, E = 0.8, B = A * Math.sqrt(1 - E * E); // 긴반지름, 이심률, 짧은반지름
  const C = [148, 98]; // 타원 가운데
  const SUN = [C[0] + A * E, C[1]]; // 초점
  const P = A * (1 - E * E);
  const rOf = (nu) => P / (1 + E * Math.cos(nu));
  const at = (nu) => { const r = rOf(nu); return [SUN[0] + r * Math.cos(nu), SUN[1] - r * Math.sin(nu)]; }; // 화면 y는 아래로, nu는 시계 반대로 커진다
  const RMIN = A * (1 - E), RC = 1.08 * A, LMAX = 54;
  const tailLen = (r) => (r >= RC ? 0 : (LMAX * (RC / r - 1)) / (RC / RMIN - 1));

  const svg = kit.layer(root, W, H);
  svg.appendChild(kit.s("rect", { width: W, height: H, fill: kit.rad(svg, 0.7, 0.5, 0.8, [[0, "#15264B"], [1, "#0A1328"]]) }));
  const rs = kit.rng(31);
  for (let i = 0; i < 90; i++) svg.appendChild(kit.s("circle", { cx: rs() * W, cy: rs() * H, r: rs() < 0.9 ? 0.4 + rs() * 0.35 : 0.8 + rs() * 0.3, fill: "#FFFFFF", opacity: 0.18 + rs() * 0.35 }));
  const glow = kit.blurFilter(svg, 2.2);

  // 궤도(혜성이 도는 길)
  svg.appendChild(kit.s("ellipse", { cx: C[0], cy: C[1], rx: A, ry: B, fill: "none", stroke: "#7E9FD6", "stroke-width": 1.1, opacity: 0.85 }));
  // 진행 화살촉(시계 반대): 혜성 자리 사이마다
  for (const nd of [-150, -40, 100, 160]) {
    const nu = nd * D2R, p = at(nu), q = at(nu + 0.02);
    const tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty), ux = tx / tl, uy = ty / tl, L = 7, Wd = 3.4;
    svg.appendChild(kit.s("path", { d: `M${p[0] + ux * L * 0.55} ${p[1] + uy * L * 0.55} L${p[0] - ux * L * 0.45 - uy * Wd} ${p[1] - uy * L * 0.45 + ux * Wd} L${p[0] - ux * L * 0.45 + uy * Wd} ${p[1] - uy * L * 0.45 - ux * Wd} Z`, fill: "#A9C4F0" }));
  }

  // 태양(실사, 작게) + 빛무리
  const img = await kit.loadImg("/public/photos/sun_whitelight.jpg");
  const RS = 11, DPR = 3;
  const sunURL = kit.canvas(RS * 2 * DPR, RS * 2 * DPR, (c, w) => {
    c.beginPath(); c.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2); c.clip();
    const s = (w / 2) / 723; // 사진의 원판 반지름 723px, 가운데 (918, 852)
    c.drawImage(img, w / 2 - 918 * s, w / 2 - 852 * s, img.width * s, img.height * s);
  }).toDataURL("image/png");
  svg.appendChild(kit.s("circle", { cx: SUN[0], cy: SUN[1], r: RS * 2.4, fill: kit.rad(svg, 0.5, 0.5, 0.5, [[0, "#FFB547", 0.55], [0.45, "#FF9A2E", 0.22], [1, "#FF8A1C", 0]]) }));
  svg.appendChild(kit.s("image", { href: sunURL, x: SUN[0] - RS, y: SUN[1] - RS, width: RS * 2, height: RS * 2 }));

  // 혜성 다섯 자리: 먼 곳 → 다가옴 → 태양 곁 → 멀어짐 → 다시 멂
  const NUS = [180, -112, 0, 66, 128];
  const report = [];
  const heads = [];
  for (const nd of NUS) {
    const nu = nd * D2R, p = at(nu), r = rOf(nu);
    const ux = (p[0] - SUN[0]) / r, uy = (p[1] - SUN[1]) / r; // 태양 → 혜성 방향
    const L = tailLen(r);
    if (L > 0.5) {
      // 태양에서 혜성을 지나 꼬리 끝까지 옅은 점선(같은 직선 위임을 보인다)
      svg.appendChild(kit.s("path", { d: `M${SUN[0] + ux * (RS + 3)} ${SUN[1] + uy * (RS + 3)} L${p[0] - ux * 4} ${p[1] - uy * 4}`, stroke: "#FFD38A", "stroke-width": 0.8, "stroke-dasharray": "2 2.6", opacity: 0.55, fill: "none" }));
      const nx = -uy, ny = ux, w0 = 1.8, w1 = 2.2 + L * 0.13;
      const e = [p[0] + ux * L, p[1] + uy * L];
      const gid = kit.id("tl");
      const defs = kit.s("defs");
      const lg = kit.s("linearGradient", { id: gid, gradientUnits: "userSpaceOnUse", x1: p[0], y1: p[1], x2: e[0], y2: e[1] });
      for (const [o, c, a] of [[0, "#F2FAFF", 0.95], [0.35, "#BFE0FF", 0.7], [1, "#8CC4FF", 0]]) lg.appendChild(kit.s("stop", { offset: o, "stop-color": c, "stop-opacity": a }));
      defs.appendChild(lg); svg.appendChild(defs);
      const d = `M${p[0] + nx * w0} ${p[1] + ny * w0} L${e[0] + nx * w1} ${e[1] + ny * w1} Q${e[0] + ux * 3} ${e[1] + uy * 3} ${e[0] - nx * w1} ${e[1] - ny * w1} L${p[0] - nx * w0} ${p[1] - ny * w0} Z`;
      const tg = kit.s("path", { d, fill: `url(#${gid})`, opacity: 0.55 }); tg.setAttribute("filter", glow); svg.appendChild(tg);
      svg.appendChild(kit.s("path", { d, fill: `url(#${gid})` }));
    }
    // 머리(코마)
    svg.appendChild(kit.s("circle", { cx: p[0], cy: p[1], r: 4.2, fill: "#CFE8FF", opacity: 0.5, filter: glow }));
    svg.appendChild(kit.s("circle", { cx: p[0], cy: p[1], r: 2.1, fill: "#F4FBFF" }));
    heads.push({ nd, p, r, L, u: [ux, uy] });
    report.push(`${nd}° r=${r.toFixed(1)} 꼬리=${L.toFixed(1)}`);
  }
  // 멀어질 때 꼬리가 앞장서는지: 꼬리 방향과 진행 방향의 사이각
  const h66 = heads.find((h) => h.nd === 66), q = at((66 + 1) * D2R);
  const vx = q[0] - h66.p[0], vy = q[1] - h66.p[1], vl = Math.hypot(vx, vy);
  report.push(`66° 꼬리와 진행 방향 사이 ${(Math.acos((h66.u[0] * vx + h66.u[1] * vy) / vl) / D2R).toFixed(1)}°(90° 밑이면 앞장)`);
  console.log("placed " + report.join(" | "));

  // ── 이름 ──
  const SKY = "#0D1830";
  const dtext = (x, y, str, { size = 12.5, weight = 700, color = "#E6EDFF", anchor = "middle" } = {}) => {
    size = Math.max(kit.MIN_FONT, size);
    svg.appendChild(kit.s("text", { x, y, "text-anchor": anchor, "dominant-baseline": "central", "font-size": size, "font-weight": weight, fill: color,
      stroke: SKY, "stroke-width": 3.2, "stroke-linejoin": "round", "paint-order": "stroke", style: "letter-spacing:-.02em" }, str));
  };
  const lead = (pts) => svg.appendChild(kit.s("path", { d: pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" "), stroke: "#B9C8E8", "stroke-width": 0.9, fill: "none" }));
  dtext(SUN[0] - RS - 6, SUN[1], "태양", { size: 13, weight: 800, color: "#FFD38A", anchor: "end" });
  const far = heads[0].p;
  dtext(far[0] + 2, far[1] + 15, "꼬리 없음", { size: 12, weight: 700, color: "#C9D6F2", anchor: "start" });
  const per = heads.find((h) => h.nd === 0);
  const tailMid = [per.p[0] + per.u[0] * 30, per.p[1] + per.u[1] * 30];
  lead([tailMid, [tailMid[0] + 2, tailMid[1] + 20]]);
  dtext(tailMid[0] + 2, tailMid[1] + 28, "꼬리", { size: 12.5, weight: 800, color: "#DDEEFF" });
  const hc = heads.find((h) => h.nd === -112).p;
  lead([[hc[0] - 3, hc[1] + 2], [hc[0] - 22, hc[1] + 14]]);
  dtext(hc[0] - 24, hc[1] + 16, "혜성", { size: 12.5, weight: 800, color: "#DDEEFF", anchor: "end" });
  dtext(C[0] - 34, C[1] + B + 14, "혜성이 도는 길", { size: 12, weight: 700, color: "#A9C4F0" });
}
