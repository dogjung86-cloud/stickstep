// 세로로 세운, 끝을 마개로 막은 주사기(Ⅵ 보일, 샤를 도해 공용). 흰 바탕의 SVG.
// 입자는 같은 크기의 파란 공과 옅은 꼬리(꼬리 길이 = 빠르기). 바닥은 아래, 피스톤은 위.

/** 기체 칸 안에 입자 n개를 고르게 놓는다(가장 넓은 간격부터 줄여 가며 n개가 들어가는 간격을 찾는다). */
export function spreadParticles(kit, box, n, seed, pr) {
  const { x0, y0, x1, y1 } = box;
  for (let d = 60; d > 6; d -= 0.5) {
    const r = kit.rng(seed), pts = [];
    for (let t = 0; t < 6000 && pts.length < n; t++) {
      const p = [x0 + pr + 1.5 + r() * (x1 - x0 - 2 * pr - 3), y0 + pr + 1.5 + r() * (y1 - y0 - 2 * pr - 3)];
      if (pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) >= d)) pts.push(p);
    }
    if (pts.length === n) return { pts, d };
  }
  throw new Error("입자 자리를 못 찾음");
}

/** 주사기 하나. o = { cx, bot(기체 칸 바닥), vol(mL), ppm(px/mL), halfW(안 반폭), cap(mL, 눈금 끝), rod(막대 길이),
 *   n, seed, tail(꼬리 px), color(입자 가운데색), dark(가장자리색), tailColor, hits: [{ size }] } 반환: 위치들 */
export function drawSyringe(svg, kit, o) {
  const { cx, bot, vol, ppm, halfW, cap, rod } = o;
  const top = bot - vol * ppm; // 피스톤 아랫면(기체 칸 위)
  const barTop = bot - cap * ppm - 8; // 통 위 끝
  const wall = 2.6;
  const g = kit.s("g");
  svg.appendChild(g);
  // 바닥 그림자
  g.appendChild(kit.s("ellipse", { cx, cy: bot + 21, rx: halfW + 10, ry: 3.2, fill: "#2A3A5E", opacity: 0.1 }));
  // 끝(노즐)과 마개
  g.appendChild(kit.s("path", { d: `M${cx - halfW - wall} ${bot} L${cx - 5} ${bot + 7} L${cx + 5} ${bot + 7} L${cx + halfW + wall} ${bot} Z`, fill: kit.lin(svg, 0, 0, 1, 0, [[0, "#DCE6F2"], [0.5, "#F7FAFD"], [1, "#D2DEEC"]]), stroke: "#9FB3CC", "stroke-width": 1 }));
  g.appendChild(kit.s("rect", { x: cx - 3.2, y: bot + 6, width: 6.4, height: 5, fill: "#E4ECF6", stroke: "#9FB3CC", "stroke-width": 0.9 }));
  g.appendChild(kit.s("rect", { x: cx - 7.5, y: bot + 9.5, width: 15, height: 9.5, rx: 3, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#F08A5C"], [1, "#C85A2E"]]), stroke: "#A8481F", "stroke-width": 0.9 }));
  // 통(유리): 바깥 벽
  g.appendChild(kit.s("rect", { x: cx - halfW - wall, y: barTop, width: 2 * (halfW + wall), height: bot - barTop, rx: 2, fill: kit.lin(svg, 0, 0, 1, 0, [[0, "#D6E2F0"], [0.18, "#F4F8FC"], [0.82, "#F1F6FB"], [1, "#CBD9EA"]]), stroke: "#9FB3CC", "stroke-width": 1.1 }));
  // 기체 칸(아주 옅은 바탕)
  g.appendChild(kit.s("rect", { x: cx - halfW, y: top, width: 2 * halfW, height: bot - top, fill: "#F3F8FE" }));
  // 눈금(왼쪽 벽, 2 mL마다 짧게, 10 mL마다 길게)
  for (let m = 2; m <= cap; m += 2) {
    const y = bot - m * ppm, L = m % 10 === 0 ? 8 : 4;
    g.appendChild(kit.s("path", { d: `M${cx - halfW} ${y} L${cx - halfW + L} ${y}`, stroke: "#7C93B2", "stroke-width": m % 10 === 0 ? 1.1 : 0.8 }));
  }
  // 손가락 걸이(통 위)
  g.appendChild(kit.s("rect", { x: cx - halfW - 13, y: barTop - 3, width: 2 * halfW + 26, height: 5, rx: 2.5, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#EEF2F7"], [1, "#C9D3E0"]]), stroke: "#93A4BC", "stroke-width": 0.9 }));
  // 입자
  const pr = 3.5;
  const { pts } = spreadParticles(kit, { x0: cx - halfW, y0: top, x1: cx + halfW, y1: bot }, o.n, o.seed, pr);
  const r = kit.rng(o.seed + 99);
  const grad = kit.rad(svg, 0.35, 0.3, 0.75, [[0, "#FFFFFF", 0.95], [0.38, o.color], [1, o.dark]]);
  for (const [x, y] of pts) {
    // 꼬리 끝이 기체 칸 안에 들도록 방향을 고른다(벽을 뚫는 꼬리 금지)
    let a = r() * Math.PI * 2;
    for (let t = 0; t < 60; t++) {
      const ex = x - Math.cos(a) * (pr + o.tail), ey = y - Math.sin(a) * (pr + o.tail);
      if (ex > cx - halfW + 1.5 && ex < cx + halfW - 1.5 && ey > top + 1.5 && ey < bot - 1.5) break;
      a = r() * Math.PI * 2;
    }
    g.appendChild(kit.s("path", { d: `M${x - Math.cos(a) * pr} ${y - Math.sin(a) * pr} L${x - Math.cos(a) * (pr + o.tail)} ${y - Math.sin(a) * (pr + o.tail)}`, stroke: o.tailColor, "stroke-width": 2.3, "stroke-linecap": "round", opacity: 0.85 }));
    g.appendChild(kit.s("circle", { cx: x, cy: y, r: pr, fill: grad }));
  }
  // 피스톤(고무)과 막대, 누르개
  g.appendChild(kit.s("rect", { x: cx - halfW, y: top - 9, width: 2 * halfW, height: 9, rx: 2, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#59626F"], [0.5, "#3B4350"], [1, "#2B323C"]]) }));
  g.appendChild(kit.s("path", { d: `M${cx - halfW} ${top - 4.5} L${cx + halfW} ${top - 4.5}`, stroke: "#6E7886", "stroke-width": 0.8 }));
  const hy = top - 9 - rod; // 누르개 윗면
  g.appendChild(kit.s("rect", { x: cx - 4, y: hy + 5, width: 8, height: rod - 5, fill: kit.lin(svg, 0, 0, 1, 0, [[0, "#C7D0DC"], [0.5, "#EEF2F7"], [1, "#BAC5D3"]]), stroke: "#93A4BC", "stroke-width": 0.8 }));
  g.appendChild(kit.s("rect", { x: cx - halfW - 6, y: hy, width: 2 * halfW + 12, height: 6, rx: 3, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#F2F5F9"], [1, "#C3CDDA"]]), stroke: "#8D9EB6", "stroke-width": 0.9 }));
  // 피스톤 아랫면의 부딪힘 표시
  const hits = o.hits || [];
  hits.forEach((h, i) => {
    const x = cx - halfW + ((i + 0.5) * 2 * halfW) / hits.length, y = top + 1.6, s = h.size;
    for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; g.appendChild(kit.s("path", { d: `M${x + Math.cos(a) * 1.2 * s} ${y + Math.sin(a) * 1.2 * s} L${x + Math.cos(a) * 3.6 * s} ${y + Math.sin(a) * 3.6 * s}`, stroke: "#F08C00", "stroke-width": 1.2 * Math.max(1, s * 0.8), "stroke-linecap": "round" })); }
  });
  return { top, hy, barTop, pts };
}
