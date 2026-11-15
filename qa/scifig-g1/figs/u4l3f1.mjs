// u4l3f1 · 상태 변화 여섯 이름 지도: 고체, 액체, 기체 세 칸을 한 줄로, 칸마다 물의 모습(얼음, 물방울, 눈에 안 보이는 수증기가 든 빈 병).
// 검산 메모: u4l3f1.md. 위쪽 화살표는 오른쪽(융해, 기화, 위로 넘는 긴 호 승화), 아래쪽은 왼쪽(응고, 액화, 아래로 도는 긴 호 승화).
// 화살표 색은 정리 카드의 짝 색(융해·응고 #4E9BF5, 기화·액화 #F0705E, 승화 #8A6BFF). 흡수, 방출의 뜻은 색에 싣지 않는다. 입자는 그리지 않는다.
export const meta = { key: "u4l3f1", w: 340, h: 254, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const svg = kit.layer(root, W, H);
  const PW = 84, GAP = 44, Y0 = 70, PH = 108;
  const PX = [0, PW + GAP, 2 * (PW + GAP)];
  const MID = PX.map((x) => x + PW / 2);
  const BLUE = "#4E9BF5", CORAL = "#F0705E", VIOLET = "#8A6BFF";
  const soft = kit.shadowFilter(svg, { dy: 2, b: 2.6, a: 0.14 });
  // 칸
  const NAMES = [["고체", "얼음"], ["액체", "물"], ["기체", "수증기"]];
  PX.forEach((x, i) => {
    svg.appendChild(kit.s("rect", { x: x + 1, y: Y0, width: PW - 2, height: PH, rx: 14, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#F7FAFF"], [1, "#EAF1FB"]]), stroke: "#C9D7EA", "stroke-width": 1 }));
    kit.text(svg, MID[i], Y0 + PH - 26, NAMES[i][0], { size: 14, weight: 800 });
    kit.text(svg, MID[i], Y0 + PH - 10, NAMES[i][1], { size: 12, weight: 600, color: "#5B6475" });
  });
  const cy = Y0 + 40; // 물체 가운데 높이
  // 접촉 그림자
  for (const i of [0, 1, 2]) svg.appendChild(kit.s("ellipse", { cx: MID[i], cy: cy + 25, rx: 20, ry: 3.2, fill: "#2A3A5E", opacity: 0.11 }));

  // (1) 얼음 조각: 등각 정육면체, 모서리를 둥글게, 속에 흰 결
  {
    const c = [MID[0], cy + 3], s = 19, dx = s * 0.87, dy = s * 0.5;
    const top = [[c[0], c[1] - s - dy], [c[0] + dx, c[1] - s], [c[0], c[1] - s + dy], [c[0] - dx, c[1] - s]];
    const left = [[c[0] - dx, c[1] - s], [c[0], c[1] - s + dy], [c[0], c[1] + dy + 4], [c[0] - dx, c[1] + 4]];
    const right = [[c[0] + dx, c[1] - s], [c[0], c[1] - s + dy], [c[0], c[1] + dy + 4], [c[0] + dx, c[1] + 4]];
    const poly = (pts) => "M" + pts.map((p) => p.map((v) => v.toFixed(2)).join(" ")).join(" L") + " Z";
    const g = kit.s("g", { filter: soft, "stroke-linejoin": "round" }); svg.appendChild(g);
    g.appendChild(kit.s("path", { d: poly(left), fill: kit.lin(svg, 0, 0, 1, 1, [[0, "#CFE6FA"], [1, "#9CC8EE"]]), stroke: "#7FB0DD", "stroke-width": 1.2 }));
    g.appendChild(kit.s("path", { d: poly(right), fill: kit.lin(svg, 1, 0, 0, 1, [[0, "#E2F0FC"], [1, "#B4D6F3"]]), stroke: "#7FB0DD", "stroke-width": 1.2 }));
    g.appendChild(kit.s("path", { d: poly(top), fill: kit.lin(svg, 0, 0, 1, 1, [[0, "#FFFFFF"], [1, "#DDEEFC"]]), stroke: "#7FB0DD", "stroke-width": 1.2 }));
    // 속의 흰 결과 반짝임
    g.appendChild(kit.s("path", { d: `M${c[0] - dx * 0.6} ${c[1] - s * 0.55} Q${c[0] - dx * 0.35} ${c[1] - s * 0.1} ${c[0] - dx * 0.55} ${c[1] + 2}`, stroke: "#FFFFFF", "stroke-width": 1.6, fill: "none", opacity: 0.8 }));
    g.appendChild(kit.s("path", { d: `M${c[0] + dx * 0.25} ${c[1] - s * 0.45} L${c[0] + dx * 0.55} ${c[1] - s * 0.05}`, stroke: "#FFFFFF", "stroke-width": 1.3, fill: "none", opacity: 0.7 }));
    g.appendChild(kit.s("path", { d: `M${top[3][0] + 3} ${top[3][1]} L${top[0][0]} ${top[0][1] + 2}`, stroke: "#FFFFFF", "stroke-width": 1.8, opacity: 0.9 }));
  }
  // (2) 물방울: 위가 뾰족한 방울, 파란 그라데이션과 반짝임
  {
    const x = MID[1], y = cy + 6, r = 17;
    const d = `M${x} ${y - r * 2.05} C${x + r * 0.35} ${y - r * 1.35} ${x + r} ${y - r * 0.75} ${x + r} ${y} A${r} ${r} 0 1 1 ${x - r} ${y} C${x - r} ${y - r * 0.75} ${x - r * 0.35} ${y - r * 1.35} ${x} ${y - r * 2.05} Z`;
    svg.appendChild(kit.s("path", { d, fill: kit.rad(svg, 0.38, 0.6, 0.75, [[0, "#BFE0FF"], [0.6, "#5AA2F8"], [1, "#2F78D6"]]), stroke: "#2F6FC2", "stroke-width": 1.2, filter: soft }));
    svg.appendChild(kit.s("ellipse", { cx: x - r * 0.42, cy: y - r * 0.35, rx: r * 0.2, ry: r * 0.38, fill: "#FFFFFF", opacity: 0.85, transform: `rotate(20 ${x - r * 0.42} ${y - r * 0.35})` }));
    svg.appendChild(kit.s("circle", { cx: x + r * 0.45, cy: y + r * 0.45, r: 1.8, fill: "#FFFFFF", opacity: 0.7 }));
  }
  // (3) 수증기: 눈에 보이지 않으니 마개를 닫은 빈 유리병만(흰 김이나 구름을 그리지 않는다)
  {
    const x = MID[2], yb = cy + 24, w = 36, h = 42, nk = 12;
    const body = `M${x - w / 2} ${yb - 6} L${x - w / 2} ${yb - h + 8} Q${x - w / 2} ${yb - h} ${x - w / 2 + 8} ${yb - h} L${x - nk / 2} ${yb - h} L${x - nk / 2} ${yb - h - 9} L${x + nk / 2} ${yb - h - 9} L${x + nk / 2} ${yb - h} L${x + w / 2 - 8} ${yb - h} Q${x + w / 2} ${yb - h} ${x + w / 2} ${yb - h + 8} L${x + w / 2} ${yb - 6} Q${x + w / 2} ${yb} ${x + w / 2 - 6} ${yb} L${x - w / 2 + 6} ${yb} Q${x - w / 2} ${yb} ${x - w / 2} ${yb - 6} Z`;
    svg.appendChild(kit.s("path", { d: body, fill: kit.lin(svg, 0, 0, 1, 0, [[0, "#E6EEF8"], [0.25, "#FFFFFF"], [0.8, "#F6F9FD"], [1, "#DCE6F2"]]), stroke: "#9FB3CC", "stroke-width": 1.3, filter: soft }));
    svg.appendChild(kit.s("rect", { x: x - nk / 2 - 2, y: yb - h - 15, width: nk + 4, height: 7, rx: 2, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#C9A27A"], [1, "#9C7651"]]), stroke: "#7D5C3D", "stroke-width": 0.8 }));
    svg.appendChild(kit.s("path", { d: `M${x - w / 2 + 5} ${yb - h + 10} L${x - w / 2 + 5} ${yb - 10}`, stroke: "#FFFFFF", "stroke-width": 2.6, "stroke-linecap": "round", opacity: 0.95 }));
    svg.appendChild(kit.s("path", { d: `M${x + w / 2 - 6} ${yb - h + 12} L${x + w / 2 - 6} ${yb - h + 20}`, stroke: "#FFFFFF", "stroke-width": 1.8, "stroke-linecap": "round", opacity: 0.8 }));
  }

  // ── 화살표 ──
  const ya = Y0 + 26, yb2 = Y0 + PH - 52; // 위쪽 줄, 아래쪽 줄
  const arr = (x0, x1, y, color) => kit.flowArrow(svg, `M${x0} ${y} L${x1} ${y}`, { w: 4.4, head: 10, hw: 2.1, fill: color });
  const gx0 = PW + 3, gx1 = PW + GAP - 3;
  arr(gx0, gx1, ya, BLUE); arr(gx0 + PW + GAP, gx1 + PW + GAP, ya, CORAL);
  arr(gx1, gx0, yb2, BLUE); arr(gx1 + PW + GAP, gx0 + PW + GAP, yb2, CORAL);
  const nm = (x, y, t, c) => kit.text(svg, x, y, t, { size: 12.5, weight: 800, color: c });
  nm(PW + GAP / 2, ya - 13, "융해", "#2E7AD6"); nm(PW + GAP / 2 + PW + GAP, ya - 13, "기화", "#D9503D");
  nm(PW + GAP / 2, yb2 + 15, "응고", "#2E7AD6"); nm(PW + GAP / 2 + PW + GAP, yb2 + 15, "액화", "#D9503D");
  // 승화: 위로 넘는 긴 호(고체 → 기체), 아래로 도는 긴 호(기체 → 고체)
  const top0 = [MID[0], Y0 - 3], top1 = [MID[2], Y0 - 3];
  kit.flowArrow(svg, `M${top0[0]} ${top0[1]} C${top0[0] + 20} ${Y0 - 58} ${top1[0] - 20} ${Y0 - 58} ${top1[0]} ${top1[1]}`, { w: 4.4, head: 10, hw: 2.1, fill: VIOLET });
  nm(W / 2, Y0 - 57, "승화", "#6E4FE0");
  const bot0 = [MID[2], Y0 + PH + 3], bot1 = [MID[0], Y0 + PH + 3];
  kit.flowArrow(svg, `M${bot0[0]} ${bot0[1]} C${bot0[0] - 20} ${Y0 + PH + 58} ${bot1[0] + 20} ${Y0 + PH + 58} ${bot1[0]} ${bot1[1]}`, { w: 4.4, head: 10, hw: 2.1, fill: VIOLET });
  nm(W / 2, Y0 + PH + 60, "승화", "#6E4FE0");
}
