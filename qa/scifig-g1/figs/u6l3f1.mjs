// u6l3f1 · 생활 속 보일 법칙: 공기 주머니가 든 운동화 뒤꿈치를 세로로 자른 단면. (가) 발을 들었을 때, (나) 착지할 때.
// 검산 메모: u6l3f1.md. 주머니는 닫혀 있어 두 장면의 입자 수(10개)와 크기가 같다. (나)는 주머니 부피가 작고 입자가 가까우며 안벽 부딪힘이 많다.
export const meta = { key: "u6l3f1", w: 340, h: 268, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const svg = kit.layer(root, W, H);
  const PC = "#5AA2F8"; // Ⅵ 랩의 기체 입자 색
  const foam = kit.grainFilter(svg, { freq: 0.9, k: 0.16, oct: 3, seed: 4 });
  const soft = kit.shadowFilter(svg, { dy: 2, b: 2.5, a: 0.16 });
  const panel = (ox, pressed, title) => {
    const cx = ox + 82, G = 212; // 땅 높이
    const bagH = pressed ? 15 : 28, bulge = pressed ? 6 : 0;
    const midTop = pressed ? G - 10 - 34 : G - 10 - 46;  // 폼 밑창 윗면(눌리면 조금 내려간다)
    // 땅
    svg.appendChild(kit.s("rect", { x: ox + 4, y: G, width: 156, height: 10, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#D6D9DE"], [1, "#F2F3F5"]]) }));
    // 바닥 고무(무늬 있는 아랫면)
    let tread = `M${ox + 14} ${G - 10}`;
    for (let x = ox + 14; x <= ox + 150; x += 9) tread += ` L${x} ${G - 10} L${x + 3} ${G} L${x + 6} ${G}`;
    tread += ` L${ox + 152} ${G - 10} Z`;
    svg.appendChild(kit.s("path", { d: `M${ox + 12} ${G - 12} H${ox + 152} V${G - 9} H${ox + 12} Z`, fill: "#3B4048" }));
    svg.appendChild(kit.s("path", { d: tread, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#4A505A"], [1, "#2A2E35"]]), filter: soft }));
    // 폼 밑창(속에 주머니 자리)
    const mid = kit.s("path", { d: `M${ox + 12} ${G - 12} V${midTop + 8} Q${ox + 12} ${midTop} ${ox + 22} ${midTop} H${ox + 146} Q${ox + 152} ${midTop} ${ox + 152} ${midTop + 8} V${G - 12} Z`, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#FAFAF7"], [1, "#E6E6E0"]]), filter: foam });
    svg.appendChild(mid);
    // 깔창과 발뒤꿈치 윤곽(위)
    svg.appendChild(kit.s("rect", { x: ox + 16, y: midTop - 6, width: 132, height: 6, rx: 2, fill: "#C9B79C" }));
    const heelTop = midTop - 6;
    svg.appendChild(kit.s("path", { d: `M${ox + 26} ${heelTop} C${ox + 26} ${heelTop - 26} ${ox + 44} ${heelTop - 52} ${ox + 82} ${heelTop - 56} C${ox + 112} ${heelTop - 58} ${ox + 140} ${heelTop - 40} ${ox + 142} ${heelTop} Z`, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#F6D2B6"], [1, "#E9B48F"]]), stroke: "#C98B66", "stroke-width": 1, filter: soft }));
    // 공기 주머니(투명): 가운데, 눌리면 납작해지고 옆이 조금 불룩
    const bw = 104 + bulge * 2, bx = cx - bw / 2, by = G - 12 - 8 - bagH;
    const bagD = `M${bx + 10} ${by} H${bx + bw - 10} Q${bx + bw + bulge * 0.6} ${by} ${bx + bw + bulge * 0.6} ${by + bagH / 2} Q${bx + bw + bulge * 0.6} ${by + bagH} ${bx + bw - 10} ${by + bagH} H${bx + 10} Q${bx - bulge * 0.6} ${by + bagH} ${bx - bulge * 0.6} ${by + bagH / 2} Q${bx - bulge * 0.6} ${by} ${bx + 10} ${by} Z`;
    svg.appendChild(kit.s("path", { d: bagD, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#EAF4FE", 0.95], [1, "#CFE4FA", 0.95]]), stroke: "#7FAEDB", "stroke-width": 1.6 }));
    svg.appendChild(kit.s("path", { d: `M${bx + 14} ${by + 3} H${bx + bw - 24}`, stroke: "#FFFFFF", "stroke-width": 2, "stroke-linecap": "round", opacity: 0.9 }));
    // 입자 10개(같은 수, 같은 크기). (가)는 넓게, (나)는 가깝게
    const r = kit.rng(pressed ? 11 : 7), pts = [], pr = 3.6;
    const ix0 = bx + 8, ix1 = bx + bw - 8, iy0 = by + 4.6, iy1 = by + bagH - 4.6;
    for (let t = 0; t < 4000 && pts.length < 10; t++) {
      const p = [ix0 + r() * (ix1 - ix0), iy0 + r() * Math.max(0.1, iy1 - iy0)];
      if (pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > (pressed ? 8.2 : 13))) pts.push(p);
    }
    if (pts.length !== 10) throw new Error(`입자 ${pts.length}`);
    for (const [x, y] of pts) {
      const a = r() * 6.28;
      svg.appendChild(kit.s("path", { d: `M${x - Math.cos(a) * pr} ${y - Math.sin(a) * pr} L${x - Math.cos(a) * 11} ${y - Math.sin(a) * 11}`, stroke: "#A9CCF5", "stroke-width": 2.4, "stroke-linecap": "round", opacity: 0.8 }));
      svg.appendChild(kit.s("circle", { cx: x, cy: y, r: pr, fill: kit.rad(svg, 0.35, 0.3, 0.75, [[0, "#FFFFFF", 0.95], [0.35, PC], [1, "#1F5FB8"]]) }));
    }
    // 안벽 부딪힘 표시(작은 별): (가) 2곳, (나) 6곳
    const hits = pressed ? [[bx + 6, by + bagH / 2], [bx + bw - 6, by + bagH / 2 - 2], [cx - 26, by + 1.5], [cx + 18, by + 1.5], [cx - 8, by + bagH - 1.5], [cx + 34, by + bagH - 1.5]] : [[bx + 7, by + bagH / 2], [cx + 30, by + 1.5]];
    for (const [x, y] of hits) for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; svg.appendChild(kit.s("path", { d: `M${x + Math.cos(a) * 1.5} ${y + Math.sin(a) * 1.5} L${x + Math.cos(a) * 4.5} ${y + Math.sin(a) * 4.5}`, stroke: "#F08C00", "stroke-width": 1.3, "stroke-linecap": "round" })); }
    if (pressed) {
      // 누르는 힘(큰 화살표 하나, 아래로)과 주머니 안벽에서 바깥쪽으로 미는 작은 화살표 여럿(되미는 쪽)
      kit.flowArrow(svg, `M${cx} ${heelTop - 96} L${cx} ${heelTop - 62}`, { w: 7, head: 12, hw: 2.2, fill: "#E03131" });
      kit.text(svg, cx + 10, heelTop - 86, "누르는 힘", { size: 12.5, weight: 800, color: "#C92A2A", anchor: "start" });
      const small = (x0, y0, dx, dy) => kit.flowArrow(svg, `M${x0} ${y0} L${x0 + dx} ${y0 + dy}`, { w: 1.8, head: 4.5, hw: 2.4, fill: "#1C7ED6" });
      for (const dxp of [-30, 0, 30]) small(cx + dxp, by - 1, 0, -8);
      for (const dxp of [-30, 0, 30]) small(cx + dxp, by + bagH + 1, 0, 8);
      small(bx - bulge * 0.6 - 1, by + bagH / 2, -8, 0); small(bx + bw + bulge * 0.6 + 1, by + bagH / 2, 8, 0);
    }
    kit.text(svg, cx, 18, title, { size: 13.5, weight: 800 });
    return { bag: [cx, by + bagH / 2], bagTop: by, bx, bw, midTop, G };
  };
  const A = panel(2, false, "(가) 발을 들었을 때");
  const B = panel(176, true, "(나) 착지할 때");
  // 이름
  kit.label(svg, { at: [A.bx + 14, A.bag[1] + 6], via: [A.bx - 2, A.G + 26], to: [A.bx + 2, A.G + 26], text: "공기 주머니", side: "r", size: 12 });
  kit.label(svg, { at: [A.bx + A.bw - 16, A.midTop + 6], via: [A.bx + A.bw + 2, A.midTop - 22], to: [A.bx + A.bw + 6, A.midTop - 22], text: "밑창", side: "r", size: 12, dot: true });
  kit.text(svg, B.bag[0], B.G + 24, "부피가 줄고,", { size: 13, weight: 700, color: "#1C6CC1" });
  kit.text(svg, B.bag[0], B.G + 40, "기체가 세게 되밀어요", { size: 13, weight: 700, color: "#1C6CC1" });
  kit.text(svg, A.bag[0] + 0, A.G + 44, "입자 수는 같아요(10개)", { size: 12, weight: 600, color: "#5B6475" });
}
