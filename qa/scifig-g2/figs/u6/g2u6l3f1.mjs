// g2u6l3f1 앞에서 본 심장의 단면: 방 넷(우심방, 우심실, 좌심방, 좌심실), 판막 넷(방실판막 둘과 동맥 쪽 판막 둘), 혈관 넷, 혈액이 흐르는 방향.
// 생김새는 같은 레슨 판막 랩(src/lessons/steps/g2u6v5/heartArt.ts)의 심장을 그대로 키운 것이다(같은 점열을 K배). 혈관의 자리도 같다:
// 대정맥은 왼쪽 바깥에서 우심방으로, 폐정맥은 오른쪽 바깥에서 좌심방으로 들어오고 폐동맥(우심실)과 대동맥(좌심실)은 가운데에서 위로 나간다.
// 앞에서 본 그림이라 그림의 왼쪽이 몸의 오른쪽이다. 색은 랩과 같게(산소가 많은 혈액 빨강, 적은 혈액 자주). 검산 메모는 g2u6l3f1.md
import * as L from "./_lib.mjs";

export const meta = {
  key: "g2u6l3f1",
  w: 340,
  h: 322,
  alt: "앞에서 본 심장의 단면. 그림의 왼쪽에 우심방과 우심실, 오른쪽에 좌심방과 좌심실이 있고, 좌심실의 벽이 가장 두꺼워요. 대정맥은 우심방으로, 폐정맥은 좌심방으로 들어오고 폐동맥은 우심실에서, 대동맥은 좌심실에서 위로 나가요. 심방과 심실 사이, 심실과 동맥 사이에 판막이 있고 화살표가 정맥, 심방, 심실, 동맥 차례로 흐르는 방향을 가리켜요.",
};

// 랩 무대(346×230)의 점열. heartArt.ts와 같은 값이다(무대에서는 아래로 3 px 옮겨 그린다).
const OUTLINE = [
  [173, 55], [158, 47], [136, 41], [110, 38], [88, 43], [75, 57], [71, 80], [73, 106], [78, 132], [89, 157], [108, 180], [136, 197],
  [170, 207], [204, 209], [231, 200], [252, 182], [266, 158], [274, 130], [276, 100], [272, 74], [261, 54], [242, 42], [218, 38], [196, 43], [186, 49],
];
const RA = [[89, 70], [95, 55], [112, 47], [128, 48], [137, 57], [139, 76], [135, 91], [127, 99], [126, 114], [100, 114], [99, 99], [91, 89]];
const RV = [[88, 120], [99, 110], [122, 108], [146, 108], [160, 112], [164, 126], [162, 146], [154, 163], [139, 175], [119, 175], [103, 162], [93, 143]];
const LA = [[257, 70], [251, 55], [234, 47], [218, 48], [209, 57], [207, 76], [211, 91], [219, 99], [220, 114], [246, 114], [247, 99], [255, 89]];
const LV = [[184, 118], [196, 109], [220, 108], [242, 110], [252, 120], [254, 138], [248, 158], [236, 176], [219, 188], [205, 185], [193, 172], [185, 152], [182, 134]];
const PA = [[154, 116], [154, 72], [153, 42], [146, 26], [133, 15], [117, 8], [100, 2], [86, -8]];
const AO = [[192, 116], [192, 72], [193, 42], [200, 26], [213, 15], [229, 8], [246, 2], [260, -8]];
const VC = [[-60, 62], [40, 62], [70, 64], [96, 69]];
const PV = [[406, 62], [306, 62], [276, 64], [250, 69]];
const K = 1.08;
const M = (p) => [170 + (p[0] - 173) * K, 72 + (p[1] - 38) * K];
const MP = (pts) => pts.map(M);

const RICH = { edge: "#8E2430", base: "#DC4C58", mid: "#EE7880", hi: "#FFD3D6", edgeW: 1.2 };
const POOR = { edge: "#4A2550", base: "#874477", mid: "#A56496", hi: "#E5C8E0", edgeW: 1.2 };
const VALVE = "#FFF1CF", VALVE_LINE = "#B98A3A";

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(23);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 혈관(심장 밖으로 보이는 부분): 심장 근육이 끝을 덮는다 ──
  const tubeSeg = (pts, wLab) => [{ pts: L.spline(MP(pts), false, 10), w: wLab * K + 6 }];
  P.softShadow(t, 170, M([0, 214])[1] + 6, 120, 10, 0.14);
  L.tubes(t, tubeSeg(VC, 16), POOR);
  L.tubes(t, tubeSeg(PV, 15), RICH);
  L.tubes(t, tubeSeg(PA.slice(1), 16), POOR);
  L.tubes(t, tubeSeg(AO.slice(1), 17), RICH);

  // ── 심장 근육(자른 면은 옅은 살구색, 가장자리는 바깥 겉면) ──
  const out = L.spline(MP(OUTLINE), true, 10);
  P.dropShadow(t, (c) => L.poly(c, out), { dx: 3, dy: 6, blur: 12, a: 0.2 });
  L.pillow(t, L.bbox(out), (c) => L.poly(c, out), {
    color: "#E99C8F", light: "#FBD6CB", dark: "#B85E58", blur: 14, relief: 0.75, spec: 0.12, gloss: 20, rim: 0.12,
    tex: (x, y) => 0.95 + 0.07 * nz.fbm(x * 0.09 + y * 0.05, y * 0.16, 3),
  });
  // 근육 결(옅은 곡선)
  ctx.save();
  ctx.beginPath();
  L.poly(ctx, out);
  ctx.clip();
  ctx.strokeStyle = "rgba(170,80,74,.16)";
  ctx.lineWidth = 0.8;
  for (const k of [0.94, 0.86, 0.78, 0.7]) {
    ctx.beginPath();
    L.poly(ctx, L.spline(MP(OUTLINE.map(([x, y]) => [173 + (x - 173) * k, 128 + (y - 128) * k])), true, 8));
    ctx.stroke();
  }
  ctx.restore();

  // ── 자른 면 속의 빈 곳: 혈액이 찬 방과 통로 ──
  const blood = (pts, rich, light) => {
    const bb = L.bbox(pts);
    ctx.save();
    ctx.fillStyle = P.rg(ctx, bb.x + bb.w * 0.32, bb.y + bb.h * 0.25, 2, bb.x + bb.w / 2, bb.y + bb.h / 2, Math.max(bb.w, bb.h) * 0.75, rich ? [[0, light ? "#F7898F" : "#EE6B75"], [1, "#B8303D"]] : [[0, "#B07AA6"], [1, "#6A3560"]]);
    ctx.beginPath();
    L.poly(ctx, pts);
    ctx.fill();
    // 안쪽 벽의 그늘(위와 왼쪽이 짙다: 오목한 자리)
    ctx.clip();
    ctx.strokeStyle = rich ? "rgba(110,20,32,.45)" : "rgba(50,16,48,.5)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    L.poly(ctx, pts.map(([x, y]) => [x + 1.5, y + 2]));
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(120,40,40,.75)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    L.poly(ctx, pts);
    ctx.stroke();
    ctx.restore();
  };
  const rect = (x0, y0, x1, y1) => MP([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
  // 정맥이 방으로 들어오는 입구, 심실에서 동맥으로 나가는 통로(근육 속)
  // 근육 윤곽 밖으로 삐져나오지 않게 윤곽 안에서만 칠한다(동맥 통로의 위 끝이 근육의 위 가장자리에서 관으로 이어진다)
  ctx.save();
  ctx.beginPath();
  L.poly(ctx, out);
  ctx.clip();
  blood(rect(66, 62.5, 96, 75.5), false);
  blood(rect(250, 62.5, 280, 75.5), true);
  blood(rect(146.5, 40, 161.5, 118), false);
  blood(rect(184, 40, 200, 118), true);
  ctx.restore();
  blood(L.spline(MP(RA), true, 8), false);
  blood(L.spline(MP(LA), true, 8), true);
  blood(L.spline(MP(RV), true, 8), false);
  blood(L.spline(MP(LV), true, 8), true);
  // 통로와 방이 만나는 자리의 금을 지운다(같은 혈액이 이어진다)
  const seam = (x0, y0, x1, y1, col) => {
    const [a, b] = [M([x0, y0]), M([x1, y1])];
    ctx.fillStyle = col;
    ctx.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
  };
  seam(147.5, 104, 160.5, 118, "#8D4A80");
  seam(185, 104, 199, 118, "#D64754");
  seam(84, 64, 96, 74, "#8D4A80");
  seam(250, 64, 262, 74, "#D64754");

  // ── 판막: 방실판막(열려 심실 쪽으로 늘어진 막 두 장, 가는 끈이 심실 벽의 작은 근육에), 동맥 쪽 판막(주머니 모양 막 두 장) ──
  const leaf = (pts) => {
    ctx.save();
    ctx.fillStyle = VALVE;
    ctx.strokeStyle = VALVE_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    L.poly(ctx, pts);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  const av = (cx) => {
    const a = cx - 13.5, b = cx + 13.5, y = 101;
    // 작은 근육(유두근)과 끈
    for (const [px, sd] of [[a - 2, -1], [b + 2, 1]]) {
      const pm = M([px, 146]);
      ctx.fillStyle = "#D98A82";
      ctx.beginPath();
      ctx.ellipse(pm[0], pm[1], 3.6, 6.5, sd * 0.25, 0, L.TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,240,215,.95)";
      ctx.lineWidth = 0.7;
      for (const dx of [-1.5, 1.5]) {
        const p0 = M([px - sd * 6 + dx, y + 24]), p1 = M([px, 141]);
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.stroke();
      }
    }
    leaf(L.spline(MP([[a, y - 1], [a + 6, y + 8], [a + 6, y + 25], [a + 3, y + 26], [a - 0.5, y + 10]]), true, 6));
    leaf(L.spline(MP([[b, y - 1], [b - 6, y + 8], [b - 6, y + 25], [b - 3, y + 26], [b + 0.5, y + 10]]), true, 6));
  };
  const sl = (cx, wd) => {
    const x0 = cx - wd / 2, x1 = cx + wd / 2, y = 100;
    leaf(L.spline(MP([[x0 + 0.5, y + 4], [x0 + 4, y - 4], [x0 + 3, y - 13], [x0 + 0.6, y - 12]]), true, 6));
    leaf(L.spline(MP([[x1 - 0.5, y + 4], [x1 - 4, y - 4], [x1 - 3, y - 13], [x1 - 0.6, y - 12]]), true, 6));
  };
  av(113);
  av(233);
  sl(154, 15);
  sl(192, 16);

  // ── 겹층: 혈액이 흐르는 방향, 라벨, 범례 ──
  const sv = S.svgLayer(root, w, h);
  // 굵은 화살: 곡선 점열에서 촉 길이 안쪽의 점을 걷어 낸다(남겨 두면 몸통이 촉을 지나 꼬여 촉에 가위표 모양이 생겼다)
  const flow = (pts) => {
    const dense = L.spline(MP(pts), false, 6);
    const tip = dense[dense.length - 1];
    const body = dense.filter((p, i) => i === 0 || Math.hypot(p[0] - tip[0], p[1] - tip[1]) > 14);
    return S.fatArrow(sv, [...body, tip], { fill: "#FFD43B", stroke: "#8A6400", sw: 1, w0: 3.2, w1: 5, head: 10, hw: 7.5 });
  };
  flow([[18, 62], [52, 63], [86, 68]]);
  flow([[328, 62], [294, 63], [260, 68]]);
  flow([[110, 66], [112, 96], [113, 130]]);
  flow([[236, 66], [234, 96], [233, 130]]);
  flow([[116, 156], [138, 140], [152, 118], [154, 92], [154, 58]]);
  flow([[230, 160], [208, 140], [194, 118], [192, 92], [192, 58]]);
  flow([[148, 30], [135, 17], [114, 7]]);
  flow([[198, 30], [212, 17], [234, 7]]);

  const lab = (x, y, text, to, o = {}) => {
    if (to) S.leader(sv, to);
    S.label(sv, x, y, text, { size: 14, ...o });
  };
  const [vcx, vcy] = M([24, 62]);
  lab(4, vcy - 16, "대정맥", null);
  const [pvx, pvy] = M([322, 62]);
  lab(w - 4, pvy - 16, "폐정맥", null, { anchor: "end" });
  lab(4, 30, "폐동맥", [[50, 26], M([118, 9])]);
  lab(w - 4, 30, "대동맥", [[w - 50, 26], M([226, 9])], { anchor: "end" });
  lab(4, M([0, 96])[1], "우심방", [[50, M([0, 92])[1]], M([100, 80])]);
  lab(4, M([0, 168])[1], "우심실", [[50, M([0, 164])[1]], M([110, 150])]);
  lab(w - 4, M([0, 96])[1], "좌심방", [[w - 50, M([0, 92])[1]], M([246, 80])], { anchor: "end" });
  lab(w - 4, M([0, 168])[1], "좌심실", [[w - 50, M([0, 164])[1]], M([238, 156])], { anchor: "end" });
  // 판막: 왼쪽 라벨은 방실판막과 폐동맥 쪽 판막을, 오른쪽 라벨은 방실판막과 대동맥 쪽 판막을 짚는다
  const yv = M([0, 132])[1];
  S.leader(sv, [[38, yv - 4], M([103, 107])]);
  S.leader(sv, [[38, yv - 4], [M([130, 0])[0], yv - 22], M([148, 92])]);
  lab(4, yv, "판막", null);
  S.leader(sv, [[w - 38, yv - 4], M([243, 107])]);
  S.leader(sv, [[w - 38, yv - 4], [M([216, 0])[0], yv - 22], M([198, 92])]);
  lab(w - 4, yv, "판막", null, { anchor: "end" });
  void vcx;
  void pvx;

  // 범례(두 줄)
  const ly = h - 34;
  S.fatArrow(sv, [[60, ly - 4], [88, ly - 4]], { fill: "#FFD43B", stroke: "#8A6400", sw: 1, w0: 3.2, w1: 4.4, head: 9, hw: 6.5, shadow: false });
  S.label(sv, 96, ly + 1, "혈액이 흐르는 방향", { size: 13.5 });
  const chip = (x, y, col, text) => {
    S.el(sv, "circle", { cx: x, cy: y - 4.5, r: 5.5, fill: col, stroke: "#fff", "stroke-width": 1.4 });
    S.label(sv, x + 9, y + 1, text, { size: 13.5 });
  };
  chip(52, ly + 21, "#DC4C58", "산소가 많은 혈액");
  chip(186, ly + 21, "#874477", "산소가 적은 혈액");
}
