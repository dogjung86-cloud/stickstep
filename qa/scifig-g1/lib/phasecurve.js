// 가열 곡선과 냉각 곡선(u4l5f1, u4l6f1 공용). 위는 온도와 시간 그래프, 아래는 구간마다 입자 창 다섯.
// 규칙(검산 메모): 평평한 구간은 완전히 수평, 온도는 가열에서 내려가지 않고 냉각에서 오르지 않는다,
// 기화(액화) 구간이 융해(응고) 구간보다 길다, 열에너지 화살표는 처음부터 끝까지 끊기지 않는다,
// 평평한 구간의 창에는 두 상태가 함께, 같은 상태 안에서는 온도가 높을수록 흔들림이 크다, 입자 크기는 모든 창에서 같다,
// 물질 이름과 숫자(0 ℃, 100 ℃), 녹는점과 끓는점, 구간 기호를 쓰지 않는다.

export function phaseCurve(root, kit, { mode, W, H, arrowColor }) {
  const heat = mode === "heat";
  const svg = kit.layer(root, W, H);
  const INK = "#2B3445", PC = "#9B8CFF";
  // ── 그래프 틀 ──
  const GX0 = 34, GX1 = W - 12, GY0 = 30, GY1 = 160; // 그림 영역(위가 높은 온도)
  const ax = kit.s("path", { d: `M${GX0} ${GY0 - 12} V${GY1} H${GX1}`, fill: "none", stroke: INK, "stroke-width": 1.6 });
  svg.appendChild(ax);
  svg.appendChild(kit.s("path", { d: `M${GX0 - 4} ${GY0 - 6} L${GX0} ${GY0 - 14} L${GX0 + 4} ${GY0 - 6} Z M${GX1 - 7} ${GY1 - 4} L${GX1 + 1} ${GY1} L${GX1 - 7} ${GY1 + 4} Z`, fill: INK }));
  kit.text(svg, GX0 + 6, GY0 - 14, "온도", { size: 12.5, weight: 700, anchor: "start" });
  kit.text(svg, GX1, GY1 + 13, heat ? "가열 시간" : "냉각 시간", { size: 12.5, weight: 700, anchor: "end" });
  // 구간 경계(가로 위치)와 높이: 가열은 아래에서 위로, 냉각은 위에서 아래로(시간축은 둘 다 왼쪽에서 오른쪽)
  const X = [GX0 + 4, GX0 + 52, GX0 + 102, GX0 + 152, GX0 + 238, GX1 - 14];
  const LOW = GY1 - 18, MID = GY1 - 58, HIGH = GY0 + 34, TOP = GY0 + 6;
  // 가열: 오르기(고체) → 평평(융해, 짧음) → 오르기(액체) → 평평(기화, 김) → 오르기(기체)
  // 냉각: 내리기(기체) → 평평(액화, 김) → 내리기(액체) → 평평(응고, 짧음) → 내리기(고체)
  // 냉각은 구간 길이를 거울로: 처음 평평한 구간이 길다
  const XS = heat ? X : [X[0], X[0] + 48, X[0] + 48 + 86, X[0] + 48 + 86 + 50, X[0] + 48 + 86 + 50 + 50, X[5]];
  const Y = heat ? [LOW, MID, MID, HIGH, HIGH, TOP] : [TOP, HIGH, HIGH, MID, MID, LOW];
  const pts = [[XS[0], Y[0]], [XS[1], Y[1]], [XS[2], Y[2]], [XS[3], Y[3]], [XS[4], Y[4]], [XS[5], Y[5]]];
  // 평평한 구간을 옅은 띠로
  for (const [a, b] of [[1, 2], [3, 4]]) {
    svg.appendChild(kit.s("rect", { x: XS[a], y: GY0 - 6, width: XS[b] - XS[a], height: GY1 - GY0 + 6, fill: "#FFF3EC", opacity: 0.9 }));
    for (const xx of [XS[a], XS[b]]) svg.appendChild(kit.s("path", { d: `M${xx} ${GY0 - 6} V${GY1}`, stroke: "#C9CFD9", "stroke-width": 1, "stroke-dasharray": "3 3" }));
  }
  svg.appendChild(ax); // 축을 띠 위로
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  svg.appendChild(kit.s("path", { d, fill: "none", stroke: "#FFFFFF", "stroke-width": 6, "stroke-linejoin": "round", "stroke-linecap": "round" }));
  svg.appendChild(kit.s("path", { d, fill: "none", stroke: kit.lin(svg, 0, 0, 1, 0, heat ? [[0, "#5B7BE0"], [0.5, "#B05AC8"], [1, "#E8590C"]] : [[0, "#E8590C"], [0.5, "#B05AC8"], [1, "#5B7BE0"]]), "stroke-width": 3.4, "stroke-linejoin": "round", "stroke-linecap": "round" }));
  // 평평한 구간 이름과 '온도가 일정해요'
  const flatNames = heat ? ["융해", "기화"] : ["액화", "응고"];
  [[1, 2], [3, 4]].forEach(([a, b], i) => {
    const cx = (XS[a] + XS[b]) / 2, y = Y[a];
    kit.text(svg, cx, y - 13, flatNames[i], { size: 13.5, weight: 800, color: "#C2410C" });
  });
  // 긴 평평한 구간(가열은 기화, 냉각은 액화) 아래에 "온도가 일정해요"
  { const [a, b] = heat ? [3, 4] : [1, 2]; kit.text(svg, (XS[a] + XS[b]) / 2, Y[a] + 14, "온도가 일정해요", { size: 12, weight: 700, color: "#5B6475" }); }
  // 구간의 상태 이름(오르거나 내리는 선 곁)
  const segName = heat ? ["고체", "액체", "기체"] : ["기체", "액체", "고체"];
  [[0, 1], [2, 3], [4, 5]].forEach(([a, b], i) => {
    const mx = (XS[a] + XS[b]) / 2, my = (Y[a] + Y[b]) / 2;
    const dx = heat ? 13 : 13;
    kit.text(svg, mx + dx, my + (heat ? 9 : -9), segName[i], { size: 12.5, weight: 800, color: "#4B3FB8", anchor: "start" });
  });
  // ── 열에너지 화살표 줄: 처음부터 끝까지 끊기지 않게(가열은 들어오는 쪽, 냉각은 나가는 쪽) ──
  const AY = GY1 + 26;
  const n = 9, span = (X[5] - X[0]) / n;
  for (let i = 0; i < n; i++) {
    const x = X[0] + i * span + span / 2;
    const p = heat ? `M${x} ${AY + 9} L${x} ${AY - 6}` : `M${x} ${AY - 6} L${x} ${AY + 9}`;
    kit.flowArrow(svg, p, { w: 3.2, head: 6.5, hw: 2.3, fill: arrowColor });
  }
  kit.text(svg, X[0] + (X[5] - X[0]) / 2, AY + 20, heat ? "열에너지가 계속 들어와요" : "열에너지가 계속 빠져나가요", { size: 12.5, weight: 700, color: kit.mix(arrowColor, "#2B3445", 0.35) });
  // ── 입자 창 다섯(구간 가운데 아래) ──
  const WY = AY + 62, R = 23;
  const centers = [0, 1, 2, 3, 4].map((i) => (XS[i] + XS[i + 1]) / 2);
  // 창들이 겹치지 않게 간격을 고르게 펴되 순서는 구간 순서 그대로
  const minGap = 2 * R + 6;
  for (let i = 1; i < 5; i++) if (centers[i] - centers[i - 1] < minGap) centers[i] = centers[i - 1] + minGap;
  const shift = Math.max(0, centers[4] + R + 4 - W); for (let i = 0; i < 5; i++) centers[i] -= shift;
  const states = heat ? ["s", "sl", "l", "lg", "g"] : ["g", "gl", "l", "ls", "s"];
  const temps = heat ? [0.2, 0.35, 0.55, 0.7, 0.95] : [0.95, 0.7, 0.55, 0.35, 0.2];
  const names = { s: ["고체"], l: ["액체"], g: ["기체"], sl: ["고체와", "액체가 함께"], ls: ["액체와", "고체가 함께"], lg: ["액체와", "기체가 함께"], gl: ["기체와", "액체가 함께"] }; // 두 줄을 비슷한 폭으로(이웃 이름과 붙지 않게)
  const pr = 3.9;
  const ball = (x, y) => {
    const g = kit.rad(svg, 0.35, 0.3, 0.75, [[0, "#FFFFFF", 0.95], [0.35, PC], [1, "#4B3FB8"]]);
    svg.appendChild(kit.s("circle", { cx: x, cy: y, r: pr, fill: g }));
  };
  const jiggle = (x, y, amp) => { if (amp <= 0) return; svg.appendChild(kit.s("path", { d: `M${x - pr - 1.5 - amp} ${y - 1.6} q ${-amp} 1.6 0 3.2 M${x + pr + 1.5 + amp} ${y - 1.6} q ${amp} 1.6 0 3.2`, fill: "none", stroke: "#7C6BFF", "stroke-width": 0.9, opacity: 0.7 })); };
  const trail = (x, y, a) => { svg.appendChild(kit.s("path", { d: `M${x - Math.cos(a) * pr} ${y - Math.sin(a) * pr} L${x - Math.cos(a) * 15} ${y - Math.sin(a) * 15}`, stroke: "#B9B0FF", "stroke-width": 2.6, "stroke-linecap": "round", opacity: 0.7 })); };
  const rr = kit.rng(13);
  // 창 하나 안의 입자들: 고체 격자, 액체는 가깝고 불규칙(아래쪽에 모임), 기체는 흩어짐
  const lattice = (cx, cy, cols, rows, x0, y0) => { const out = []; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) out.push([cx + x0 + i * (pr * 2.1) + (j % 2 ? pr * 1.05 : 0), cy + y0 + j * (pr * 1.85)]); return out; };
  // 액체: 이웃과 닿을 만큼 가깝지만 줄이 없다. 이미 놓인 입자 둘레에 닿게 붙여 키운다(아래쪽부터 차오르게).
  const liquidBlob = (cx, cy, nN, x0, y0, w, h) => {
    const inBox = (p) => p[0] >= cx + x0 && p[0] <= cx + x0 + w && p[1] >= cy + y0 && p[1] <= cy + y0 + h && Math.hypot(p[0] - cx, p[1] - cy) < R - pr - 1.5;
    const out = [[cx + x0 + w / 2 + (rr() - 0.5) * 4, cy + y0 + h - pr - 1]];
    const touch = pr * 2.06;
    for (let t = 0; t < 4000 && out.length < nN; t++) {
      let best = null, bestScore = 1e9;
      for (let c = 0; c < 24; c++) {
        const base = out[Math.floor(rr() * out.length)], a = rr() * Math.PI * 2;
        const p = [base[0] + Math.cos(a) * touch, base[1] + Math.sin(a) * touch];
        if (!inBox(p) || !out.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) >= touch - 0.01)) continue;
        const score = -p[1] + rr() * 6; // 아래쪽(큰 y)을 먼저 채운다
        if (score < bestScore) { bestScore = score; best = p; }
      }
      if (best) out.push(best);
    }
    return out;
  };
  centers.forEach((cx, i) => {
    const cy = WY, st = states[i], amp = temps[i] * 2.4;
    svg.appendChild(kit.s("circle", { cx, cy, r: R, fill: "#F4F2FF", stroke: "#C9C2F0", "stroke-width": 1.4 }));
    const clip = kit.id("cw"); svg.defs.appendChild(kit.s("clipPath", { id: clip }, kit.s("circle", { cx, cy, r: R - 1 })));
    const g0 = svg.childNodes.length;
    let P = [], gas = [];
    if (st === "s") P = lattice(cx, cy, 4, 5, -pr * 3.6, -pr * 3.7);
    else if (st === "l") P = liquidBlob(cx, cy, 14, -R + 3, -R * 0.55, 2 * R - 6, R * 1.45);
    else if (st === "g") { for (let t = 0; t < 400 && gas.length < 5; t++) { const a = rr() * 6.28, d = Math.sqrt(rr()) * (R - 7); const p = [cx + Math.cos(a) * d, cy + Math.sin(a) * d]; if (gas.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 12)) gas.push(p); } }
    else if (st === "sl" || st === "ls") { P = [...lattice(cx, cy, 2, 5, -pr * 4.4, -pr * 3.7), ...liquidBlob(cx, cy, 6, 0, -R * 0.35, R - 4, R * 1.2)]; }
    else if (st === "lg" || st === "gl") { P = liquidBlob(cx, cy, 8, -R + 4, R * 0.05, 2 * R - 8, R * 0.85); for (let t = 0; t < 400 && gas.length < 3; t++) { const p = [cx + (rr() - 0.5) * (2 * R - 14), cy - R * 0.35 - rr() * R * 0.45]; if (gas.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 11)) gas.push(p); } }
    for (const [x, y] of P) { jiggle(x, y, (st === "s" || ((st === "sl" || st === "ls") && x < cx)) ? amp * 0.6 : amp); ball(x, y); }
    for (const [x, y] of gas) { trail(x, y, rr() * 6.28); ball(x, y); }
    const kids = Array.from(svg.childNodes).slice(g0);
    const grp = kit.s("g", { "clip-path": `url(#${clip})` }); kids.forEach((k) => grp.appendChild(k)); svg.appendChild(grp);
    const nm = names[st];
    nm.forEach((t, k) => kit.text(svg, cx, cy + R + 12 + k * 14, t, { size: 12, weight: nm.length > 1 ? 600 : 800, color: nm.length > 1 ? "#4E5968" : "#4B3FB8" }));
    // 창과 구간을 잇는 옅은 점선
    svg.appendChild(kit.s("path", { d: `M${(XS[i] + XS[i + 1]) / 2} ${GY1 + 2} L${cx} ${cy - R - 2}`, stroke: "#D5DAE2", "stroke-width": 1, "stroke-dasharray": "2 3" }));
  });
  return svg;
}
