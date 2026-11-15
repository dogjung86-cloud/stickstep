// u7l4f2 · 네 방향 하늘의 별 자취(네 칸 모두 같은 2시간). 동, 남, 서는 지평선을 향한 사진기, 북은 북극성을 향한 사진기로 본 모습을 계산한다.
// 검산 메모: u7l4f2.md. 위도 37°. 별의 방향 s(δ, H) = cos δ (cos H·m + sin H·W) + sin δ·p. 시간각 H가 커지는 쪽이 별이 움직이는 쪽(한 시간에 15°).
// 화살표도 같은 식으로 구한 별의 길을 따라 그린다(방향을 손으로 정하지 않는다). 투영은 직선 원근(지평선과 천구 적도는 곧은 선).
export const meta = { key: "u7l4f2", w: 340, h: 330, scale: 3, quality: 86 };

const D2R = Math.PI / 180;
const PHI = 37 * D2R; // 우리나라 위도
const WV = [0, 1, 0], UP = [0, 0, 1]; // 지평 좌표: 북 (1,0,0), 서 (0,1,0), 위 (0,0,1)
const P = [Math.cos(PHI), 0, Math.sin(PHI)]; // 천구 북극(고도 37°)
const M = [-Math.sin(PHI), 0, Math.cos(PHI)]; // 남쪽 하늘에서 천구 적도가 가장 높은 점(고도 53°)
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
const starDir = (dec, H) => {
  const c = Math.cos(dec), sd = Math.sin(dec), ch = Math.cos(H), sh = Math.sin(H);
  return [0, 1, 2].map((i) => c * (ch * M[i] + sh * WV[i]) + sd * P[i]);
};
const toEq = (v) => [Math.asin(Math.max(-1, Math.min(1, dot(v, P)))), Math.atan2(dot(v, WV), dot(v, M))];

const PW = 167, PH = 150, GAP = 6, HOR = 128, F = 95; // 칸 크기, 지평선 높이, 초점 거리(px)
const EXPO = 30 * D2R; // 2시간 = 시간각 30°
const SKY = "#0A1430";

function cam(dir) {
  // f = 사진기가 보는 쪽, r = 화면 오른쪽, u = 화면 위. 동, 남, 서는 지평선의 그 방위를 보고 광축 중심을 지평선에 둔다(위 하늘만 잘라 쓴다).
  if (dir === "E") return { f: [0, -1, 0], r: [-1, 0, 0], u: UP, cx: PW / 2, cy: HOR };
  if (dir === "S") return { f: [-1, 0, 0], r: [0, 1, 0], u: UP, cx: PW / 2, cy: HOR };
  if (dir === "W") return { f: [0, 1, 0], r: [1, 0, 0], u: UP, cx: PW / 2, cy: HOR };
  // 북: 북극성을 향한다(둘레의 원이 참 원). 지평선은 여전히 HOR에 온다: cy + F·tan 37° = HOR
  return { f: P, r: [0, -1, 0], u: M, cx: PW / 2, cy: HOR - F * Math.tan(PHI) };
}
const proj = (c, v) => { const z = dot(v, c.f); return z < 0.12 ? null : [c.cx + (F * dot(v, c.r)) / z, c.cy - (F * dot(v, c.u)) / z]; };
const unproj = (c, x, y) => { const a = (x - c.cx) / F, b = -(y - c.cy) / F; return norm([0, 1, 2].map((i) => c.f[i] + a * c.r[i] + b * c.u[i])); };

/** 별 하나의 길(H0 → H1)을 화면 점 묶음으로. 지평선 아래로 많이 내려간 곳과 사진기 뒤쪽은 끊는다. */
function trail(c, dec, H0, H1, n = 40) {
  const runs = []; let cur = [];
  for (let k = 0; k <= n; k++) {
    const H = H0 + ((H1 - H0) * k) / n, v = starDir(dec, H), p = v[2] > -0.08 ? proj(c, v) : null;
    if (p) cur.push(p); else if (cur.length) { runs.push(cur); cur = []; }
  }
  if (cur.length) runs.push(cur);
  return runs;
}
const dpath = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const svg = kit.layer(root, W, H);
  const glow = kit.blurFilter(svg, 1.6);
  const aglow = kit.blurFilter(svg, 2.4);
  const where = { E: [0, 0], S: [PW + GAP, 0], W: [0, PH + GAP], N: [PW + GAP, PH + GAP] };
  const NAME = { E: "동쪽 하늘", S: "남쪽 하늘", W: "서쪽 하늘", N: "북쪽 하늘" };
  const SIDES = { E: ["북", "남"], S: ["동", "서"], W: ["남", "북"], N: ["서", "동"] };
  const SEED = { E: 11, S: 23, W: 37, N: 53 };
  const report = [];

  // 어두운 하늘 위 글자(테두리를 하늘색으로)
  const dtext = (g, x, y, str, { size = 12, weight = 700, color = "#DCE7FB", anchor = "middle", halo = SKY } = {}) => {
    size = Math.max(kit.MIN_FONT, size);
    const t = kit.s("text", { x, y, "text-anchor": anchor, "dominant-baseline": "central", "font-size": size, "font-weight": weight, fill: color,
      stroke: halo, "stroke-width": 3.4, "stroke-linejoin": "round", "paint-order": "stroke", style: "letter-spacing:-.02em" }, str);
    g.appendChild(t);
    return t;
  };

  for (const dir of ["E", "S", "W", "N"]) {
    const c = cam(dir);
    const [ox, oy] = where[dir];
    const g = kit.s("g", { transform: `translate(${ox} ${oy})` });
    svg.appendChild(g);
    const clipId = kit.id("pc");
    const defs = kit.s("defs");
    const cp = kit.s("clipPath", { id: clipId });
    cp.appendChild(kit.s("rect", { width: PW, height: PH, rx: 10 }));
    defs.appendChild(cp);
    g.appendChild(defs);
    const body = kit.s("g", { "clip-path": `url(#${clipId})` });
    g.appendChild(body);

    // 하늘: 위는 짙고 지평선 쪽은 조금 밝게
    body.appendChild(kit.s("rect", { width: PW, height: PH, fill: kit.lin(svg, 0, 0, 0, 1, [[0, "#060C1E"], [0.62, "#0F1D40"], [0.86, "#1D3263"], [1, "#22396E"]]) }));

    // 별: 화면에 고르게 씨앗을 뿌리고, 씨앗 자리를 '지금(2시간 끝)'의 별 자리로 삼아 2시간 전부터의 길을 그린다
    const seeds = kit.scatter(4, 4, PW - 4, HOR - 6, dir === "N" ? 13.5 : 16, SEED[dir], 3000);
    const r = kit.rng(SEED[dir] + 5);
    const lines = kit.s("g", { "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none" });
    const glows = kit.s("g", { "stroke-linecap": "round", fill: "none", filter: glow, opacity: 0.85 });
    const dots = kit.s("g");
    body.appendChild(glows); body.appendChild(lines); body.appendChild(dots);
    let count = 0;
    for (const [x, y] of seeds) {
      if (dir === "N" && Math.hypot(x - c.cx, y - c.cy) < 15) continue; // 북극성 바로 곁은 비운다(이름 자리)
      const v = unproj(c, x, y);
      if (v[2] < 0.03) continue;
      const [dec, He] = toEq(v);
      const b = r(), bright = b > 0.9 ? 2 : b > 0.66 ? 1 : 0;
      const tone = r() < 0.12 ? "#F3E6D2" : r() < 0.5 ? "#D9E6FF" : "#F2F6FF";
      const op = [0.42 + r() * 0.18, 0.66 + r() * 0.12, 0.95][bright];
      const sw = [0.85, 1.15, 1.6][bright];
      for (const run of trail(c, dec, He - EXPO, He)) {
        if (run.length < 2) continue;
        const d = dpath(run);
        if (bright) glows.appendChild(kit.s("path", { d, stroke: tone, "stroke-width": sw + 1.6, opacity: bright === 2 ? 0.55 : 0.3 }));
        lines.appendChild(kit.s("path", { d, stroke: tone, "stroke-width": sw, opacity: op }));
      }
      // 지금 자리(자취의 끝)
      dots.appendChild(kit.s("circle", { cx: x, cy: y, r: [0.95, 1.25, 1.75][bright], fill: "#FFFFFF", opacity: Math.min(1, op + 0.15) }));
      count++;
    }
    report.push(`${dir} ${count}`);

    // 북쪽: 북극성, 30° 표시
    if (dir === "N") {
      const pc = [c.cx, c.cy];
      // 30° 보기 별: 북극성에서 60px(극거리 약 32°), 2시간 동안 시간각 210°→240°(오른쪽 아래)
      const decF = Math.atan(F / 60);
      const run = trail(c, decF, 210 * D2R, 240 * D2R)[0];
      const a = run[0], z = run[run.length - 1];
      for (const q of [a, z]) body.appendChild(kit.s("path", { d: `M${pc[0]} ${pc[1]} L${q[0]} ${q[1]}`, stroke: "#FFD98A", "stroke-width": 0.9, "stroke-dasharray": "2.2 2.2", opacity: 0.85 }));
      glows.appendChild(kit.s("path", { d: dpath(run), stroke: "#FFF1D2", "stroke-width": 3.4, opacity: 0.55 }));
      body.appendChild(kit.s("path", { d: dpath(run), stroke: "#FFF6E2", "stroke-width": 1.7, fill: "none", "stroke-linecap": "round" }));
      body.appendChild(kit.s("circle", { cx: z[0], cy: z[1], r: 1.9, fill: "#FFFFFF" }));
      const ang = (q) => Math.atan2(q[1] - pc[1], q[0] - pc[0]);
      const a0 = ang(a), a1 = ang(z), RA = 17;
      body.appendChild(kit.s("path", { d: `M${pc[0] + RA * Math.cos(a0)} ${pc[1] + RA * Math.sin(a0)} A${RA} ${RA} 0 0 0 ${pc[0] + RA * Math.cos(a1)} ${pc[1] + RA * Math.sin(a1)}`, stroke: "#FFD98A", "stroke-width": 1.2, fill: "none" }));
      const am = (a0 + a1) / 2;
      dtext(body, pc[0] + 30 * Math.cos(am), pc[1] + 30 * Math.sin(am), "30°", { size: 12, weight: 800, color: "#FFE3A6" });
      report.push(`30도 확인 ${((Math.abs(a1 - a0) * 180) / Math.PI).toFixed(2)}`);
      // 북극성
      body.appendChild(kit.s("circle", { cx: pc[0], cy: pc[1], r: 5.5, fill: "#FFF0C8", opacity: 0.45, filter: aglow }));
      body.appendChild(kit.s("circle", { cx: pc[0], cy: pc[1], r: 2.6, fill: "#FFF6DC" }));
      dtext(body, pc[0] + 6, pc[1] - 12, "북극성", { size: 12.5, weight: 800, color: "#FFEBC0", anchor: "start" });
    }

    // 화살표: 같은 식으로 구한 별의 길 한 토막(H가 커지는 쪽)
    let arrowRun;
    if (dir === "N") {
      const decA = Math.atan(F / 41); // 북극성에서 41px
      arrowRun = trail(c, decA, 28 * D2R, 128 * D2R, 60)[0];
    } else {
      const anchor = { E: [74, 84], S: [PW / 2, 46], W: [PW - 74, 84] }[dir];
      const [decA, HA] = toEq(unproj(c, anchor[0], anchor[1]));
      arrowRun = trail(c, decA, HA - (dir === "S" ? 17 : 14) * D2R, HA + (dir === "S" ? 17 : 14) * D2R, 40)[0];
    }
    const ad = dpath(arrowRun);
    const ag = kit.flowArrow(body, ad, { w: 6.5, head: 12, hw: 1.9, fill: "#FF9F1C", opacity: 0.5 });
    ag.setAttribute("filter", aglow);
    kit.flowArrow(body, ad, { w: 3.6, head: 10.5, hw: 2.2, fill: "#FFB547", stroke: "#7A3E00" });
    const A0 = arrowRun[0], A1 = arrowRun[arrowRun.length - 1];
    report.push(`${dir} 화살 (${A0[0].toFixed(0)},${A0[1].toFixed(0)})→(${A1[0].toFixed(0)},${A1[1].toFixed(0)})`);

    // 땅: 낮은 언덕과 나무 실루엣(지평선 HOR 둘레)
    const hr = kit.rng(SEED[dir] + 9);
    let gd = `M0 ${PH} L0 ${HOR - 1}`;
    const ph1 = hr() * 6.28, ph2 = hr() * 6.28;
    for (let x = 0; x <= PW; x += 4) gd += ` L${x} ${(HOR - 1 - 3.2 * Math.sin(x / 23 + ph1) - 2.2 * Math.sin(x / 9.5 + ph2) - 2).toFixed(2)}`;
    gd += ` L${PW} ${PH} Z`;
    body.appendChild(kit.s("path", { d: gd, fill: "#050A16" }));
    for (let i = 0; i < 4; i++) {
      const tx = 14 + hr() * (PW - 28), th = 6 + hr() * 6, base = HOR - 3 - 3.2 * Math.sin(tx / 23 + ph1) - 2.2 * Math.sin(tx / 9.5 + ph2);
      body.appendChild(kit.s("path", { d: `M${tx - th * 0.36} ${base + 1} L${tx} ${base - th} L${tx + th * 0.36} ${base + 1} Z`, fill: "#050A16" }));
    }
    dtext(body, PW / 2, PH - 11, NAME[dir], { size: 13, weight: 800, color: "#E4ECFB", halo: "#050A16" });
    dtext(body, 9, PH - 11, SIDES[dir][0], { size: 12, weight: 700, color: "#93A6C8", anchor: "start", halo: "#050A16" });
    dtext(body, PW - 9, PH - 11, SIDES[dir][1], { size: 12, weight: 700, color: "#93A6C8", anchor: "end", halo: "#050A16" });
  }

  kit.text(svg, W / 2, H - 11, "네 칸 모두 같은 2시간 동안의 자취예요", { size: 12, weight: 600, color: "#4E5968" });
  console.log("placed " + report.join(" | "));
}
