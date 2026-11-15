// g2u3l2f1 빛의 굴절: 공기에서 물로 들어가는 빛 네 줄기(입사각 0°, 20°, 40°, 60°)가 수면의 한 점 O에서 스넬 법칙(물 1.33)대로 꺾인다.
// 이름표를 다 단 40° 줄기는 왼쪽 위에서(랩의 레이저 자리), 견줌용 가는 세 줄기는 오른쪽 위에서 들어온다
// (모두 왼쪽에서 오면 60° 줄기의 굴절 광선 40.6°가 40° 줄기의 '꺾이지 않았다면 갈 길' 40°와 거의 겹친다). 검산 메모는 g2u3l2f1.md
import { D2R, AMBER, CYAN, AMBER_INK, CYAN_INK, GRAY_INK, beam, hotspot, headOn, arcWedge, dashLine, laser, refractDeg } from "./_lib.mjs";

export const meta = {
  key: "g2u3l2f1",
  w: 340,
  h: 312,
  alt: "위는 공기, 아래는 물이에요. 수면의 한 점에 세운 법선을 기준으로, 왼쪽 위에서 입사각 40°로 들어간 빛은 굴절각 약 29°로 꺾여 꺾이지 않았다면 갈 길보다 법선 쪽으로 다가가요. 오른쪽 위에서 들어간 빛은 입사각 0°일 때 0°, 20°일 때 약 15°, 60°일 때 약 41°로 꺾여요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(7);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#F2F5F8", grain: 0.01 });

  const SY = 160; // 수면
  const O = [150, SY];
  const up = (deg, R) => [O[0] - R * Math.sin(deg * D2R), O[1] - R * Math.cos(deg * D2R)]; // 왼쪽 위
  const upR = (deg, R) => [O[0] + R * Math.sin(deg * D2R), O[1] - R * Math.cos(deg * D2R)]; // 오른쪽 위
  const dnR = (deg, R) => [O[0] + R * Math.sin(deg * D2R), O[1] + R * Math.cos(deg * D2R)]; // 오른쪽 아래
  const dnL = (deg, R) => [O[0] - R * Math.sin(deg * D2R), O[1] + R * Math.cos(deg * D2R)]; // 왼쪽 아래

  // ── 물(단면): 수면에서 깊어질수록 짙어지는 파랑, 아주 옅은 일렁임 ──
  {
    const top = SY, bot = h;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, w, bot - top);
    ctx.clip();
    ctx.fillStyle = P.lg(ctx, 0, top, 0, bot, [[0, "#DDF0FC"], [0.3, "#C2E2F7"], [1, "#86BFE8"]]);
    ctx.fillRect(0, top, w, bot - top);
    ctx.restore();
    P.shade(t, { x: 0, y: top, w, h: bot - top }, (x, y) => {
      const d = (y - top) / (bot - top);
      const n = nz.fbm(x * 0.022, y * 0.06, 3);
      // 수면 가까이 옅은 빛 그물(물속으로 들어온 빛의 일렁임), 깊을수록 사라진다
      const r = nz.ridge(x * 0.045, y * 0.11 + x * 0.01, 3);
      const caus = Math.max(0, r - 0.72) * 2.4 * Math.max(0, 1 - d * 2.2);
      const v = n > 0 ? 255 : 40;
      const a = Math.abs(n) * (0.05 + 0.05 * d);
      return caus > a ? [255, 255, 255, caus * 0.55] : [v, v, 255, a];
    });
    // 수면: 밝은 띠와 그 아래 얇은 그늘(물 표면이 빛을 받는 모습)
    ctx.fillStyle = P.lg(ctx, 0, top - 1, 0, top + 7, [[0, "rgba(255,255,255,.95)"], [0.35, "rgba(240,250,255,.55)"], [1, "rgba(240,250,255,0)"]]);
    ctx.fillRect(0, top - 1, w, 8);
    ctx.fillStyle = "rgba(52,120,170,.55)";
    ctx.fillRect(0, top - 0.6, w, 1.1);
  }

  // ── 계산: 스넬 법칙(공기 1.00 → 물 1.33) ──
  const thin = [0, 20, 60].map((i) => ({ i, r: refractDeg(i) }));
  const bold = { i: 40, r: refractDeg(40) }; // 28.90°

  // 가는 줄기(오른쪽 위 → O → 왼쪽 아래)
  for (const q of thin) {
    beam(t, [upR(q.i, 124), O], { w: 1.6, alpha: 0.8 });
    beam(t, [O, dnL(q.r, 124)], { w: 1.6, alpha: 0.8 });
  }
  // 진한 줄기 40°(왼쪽 위 → O → 오른쪽 아래)
  const bs = up(bold.i, 124);
  const be = dnR(bold.r, 140);
  beam(t, [bs, O], { w: 2.6 });
  beam(t, [O, be], { w: 2.6 });
  hotspot(t, O[0], O[1], 9);
  laser(t, bs[0], bs[1], Math.atan2(O[1] - bs[1], O[0] - bs[0]), { len: 40, wid: 12 });

  // ── 겹층 ──
  const sv = S.svgLayer(root, w, h);
  // 법선(위아래)
  dashLine(S, sv, [O[0], O[1] - 142], [O[0], O[1] + 138]);
  // 꺾이지 않았다면 갈 길(40° 그대로)
  dashLine(S, sv, O, dnR(bold.i, 140), { color: "#7A8696", w: 1.6, dash: "6 4" });
  // 각
  arcWedge(S, sv, O, 54, -90 - bold.i, -90, AMBER);
  arcWedge(S, sv, O, 54, 90 - bold.r, 90, CYAN, { fillA: 0.42, dark: "#0B5E8E" });
  // 화살촉
  headOn(S, sv, bs, O, 0.5, 11);
  headOn(S, sv, O, be, 0.52, 11);
  for (const q of thin) {
    if (q.i > 0) headOn(S, sv, upR(q.i, 124), O, 0.42, 8.5, "#2DB86A");
    headOn(S, sv, O, dnL(q.r, 124), q.i > 0 ? 0.62 : 0.6, 8.5, "#2DB86A");
  }
  headOn(S, sv, [O[0], O[1] - 124], O, 0.3, 8.5, "#2DB86A");

  // 글자
  S.label(sv, O[0] - 6, 24, "법선", { anchor: "end", size: 14 });
  S.label(sv, 334, SY - 9, "공기", { anchor: "end", size: 14 });
  S.label(sv, 334, SY + 21, "물", { anchor: "end", size: 14, color: "#1B4F78" });
  S.label(sv, 96, 124, "입사 광선", { anchor: "end", size: 14 });
  S.label(sv, be[0], be[1] + 18, "굴절 광선", { anchor: "middle", size: 14 });
  const ia = [O[0] + 88 * Math.cos((-90 - bold.i / 2) * D2R), O[1] + 88 * Math.sin((-90 - bold.i / 2) * D2R)];
  S.label(sv, ia[0], ia[1] - 2, "입사각\n40°", { anchor: "middle", size: 14, color: AMBER_INK, lh: 16 });
  S.label(sv, O[0] + 6, 262, `굴절각\n약 ${Math.round(bold.r)}°`, { anchor: "start", size: 14, color: CYAN_INK, lh: 16 });
  S.label(sv, 336, 262, "꺾이지 않았다면\n갈 길", { anchor: "end", size: 13.5, color: GRAY_INK, lh: 16.5 });
  // 가는 줄기의 값 표(들어간 각 → 꺾인 각)
  const tag = (x, y, text, anchor = "start") => S.label(sv, x, y, text, { anchor, size: 13.5, color: "#1E7A47" });
  tag(O[0] + 7, 34, "0° → 0°");
  const s20 = upR(20, 124);
  tag(s20[0] + 7, s20[1] + 6, `20° → 약 ${Math.round(thin[1].r)}°`);
  const s60 = upR(60, 124);
  tag(s60[0] + 4, s60[1] - 12, `60° → 약 ${Math.round(thin[2].r)}°`, "middle");
}
