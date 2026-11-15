// u6l4f1 · 샤를 법칙을 입자로: 끝을 막은 같은 주사기 셋, 피스톤은 자유롭다. (가) 0 ℃ 28.0 mL, (나) 20 ℃ 30.0 mL, (다) 80 ℃ 36.0 mL(랩의 값).
// 검산 메모: u6l4f1.md. 입자 수 12개와 크기는 같고 꼬리(빠르기)만 다르다(랩 syringe.ts의 빠르기 비 0.55 : 0.77 : 1.37).
// 바깥에서 누르는 힘은 셋 다 같은 길이(압력 일정). 기둥 높이 28 : 30 : 36. 부딪힘 표시는 수가 아니라 크기로 '세게'를 보인다(셋 다 3개).
import { drawSyringe } from "../lib/syringe.js";

export const meta = { key: "u6l4f1", w: 340, h: 398, scale: 3, quality: 86 };

const hsl = (h, s, l) => `hsl(${h % 360} ${s}% ${l}%)`;

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const svg = kit.layer(root, W, H);
  const PPM = 5, CAP = 40, BOT = 298, HW = 23;
  const ROD = (CAP - 28) * PPM + 8 + 9 - 7; // 가장 줄어든 0 ℃에도 누르개가 손가락 걸이 위에 남게(2px)
  const hueOf = (t) => 205 + (t / 80) * 180; // 랩과 같은 색 흐름(파랑 → 주황)
  const speedOf = (t) => 0.55 + (Math.sqrt((273 + t) / 293) - 0.965) * 6.2; // 랩과 같은 빠르기
  const SET = [{ cx: 62, t: 0, vol: 28.0, seed: 5, tag: "(가)" }, { cx: 170, t: 20, vol: 30.0, seed: 9, tag: "(나)" }, { cx: 278, t: 80, vol: 36.0, seed: 14, tag: "(다)" }];
  const report = [];
  for (const s of SET) {
    const h = hueOf(s.t), sp = speedOf(s.t);
    const g = drawSyringe(svg, kit, { cx: s.cx, bot: BOT, vol: s.vol, ppm: PPM, halfW: HW, cap: CAP, rod: ROD, n: 12, seed: s.seed, tail: 9.2 * sp,
      color: hsl(h, 78, 58), dark: hsl(h, 70, 34), tailColor: hsl(h, 80, 80), hits: [0, 1, 2].map(() => ({ size: 0.25 + sp * 0.95 })) }); // 표시 크기 0.77, 0.98, 1.55: 뜨거울수록 세게(수는 그대로)
    // 바깥에서 누르는 힘(셋 다 같은 길이)
    kit.flowArrow(svg, `M${s.cx} ${g.hy - 28} L${s.cx} ${g.hy - 2}`, { w: 3.4, head: 8, hw: 2.2, fill: "#E03131" });
    // 온도 띠와 글자
    const by = BOT + 27;
    svg.appendChild(kit.s("rect", { x: s.cx - 30, y: by - 9, width: 60, height: 18, rx: 9, fill: kit.lin(svg, 0, 0, 1, 0, [[0, hsl(h, 80, 62)], [1, hsl(h + 12, 80, 56)]]) }));
    kit.text(svg, s.cx, by + 0.5, `${s.t} ℃`, { size: 12.5, weight: 800, color: "#FFFFFF", halo: false });
    kit.text(svg, s.cx, by + 23, `${s.vol.toFixed(1)} mL`, { size: 13, weight: 800 });
    report.push(`${s.t}℃ 기둥 ${(BOT - g.top).toFixed(1)}px 꼬리 ${(9.2 * sp).toFixed(1)}px 누르개 ${g.hy.toFixed(0)} 통 위 ${g.barTop.toFixed(0)}`);
  }
  kit.text(svg, W / 2, H - 28, "빨간 화살표: 바깥에서 누르는 힘, 셋 다 같아요", { size: 12, weight: 700, color: "#C92A2A" });
  kit.text(svg, W / 2, H - 10, "입자 12개는 그대로, 데울수록 빨라져요(꼬리)", { size: 12, weight: 600, color: "#5B6475" });
  console.log("placed " + report.join(" | "));
}
