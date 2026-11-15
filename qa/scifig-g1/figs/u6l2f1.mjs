// u6l2f1 · 보일 법칙을 입자로: 끝을 막은 같은 주사기 셋(24 mL, 12 mL, 6 mL)을 1, 2, 4기압으로 누를 때.
// 검산 메모: u6l2f1.md. 입자 수 12개, 크기와 꼬리 길이(빠르기, 온도 일정)는 셋 다 같다. 기체 기둥 높이 4 : 2 : 1, 압력 × 부피 = 24로 같다.
// 같은 넓이인 피스톤 아랫면의 부딪힘 표시는 2, 4, 8개(1 : 2 : 4). 막대 길이가 같아 누를수록 누르개가 내려온다.
import { drawSyringe } from "../lib/syringe.js";

export const meta = { key: "u6l2f1", w: 340, h: 360, scale: 3, quality: 86 };

export async function draw(root, kit) {
  const W = meta.w, H = meta.h;
  const svg = kit.layer(root, W, H);
  const PPM = 5, CAP = 26, BOT = 286, HW = 23;
  // 막대 길이: 6 mL까지 눌러도 누르개가 통 위에 남게(실제 주사기처럼). 셋 다 같은 막대라 누를수록 누르개가 내려온다
  const ROD = (CAP - 6) * PPM + 8 + 9 - 4;
  const SET = [{ cx: 62, vol: 24, atm: 1, hits: 2, seed: 3 }, { cx: 170, vol: 12, atm: 2, hits: 4, seed: 8 }, { cx: 278, vol: 6, atm: 4, hits: 8, seed: 12 }];
  const report = [];
  for (const s of SET) {
    const g = drawSyringe(svg, kit, { cx: s.cx, bot: BOT, vol: s.vol, ppm: PPM, halfW: HW, cap: CAP, rod: ROD, n: 12, seed: s.seed, tail: 7,
      color: "#5AA2F8", dark: "#1F5FB8", tailColor: "#A9CCF5", hits: Array.from({ length: s.hits }, () => ({ size: 0.82 })) });
    // 누르는 압력: 같은 크기의 빨간 화살표 1, 2, 4개(바깥 공기를 포함한 누르는 압력 전체)
    const n = s.atm, xs = { 1: [0], 2: [-9, 9], 4: [-16.5, -5.5, 5.5, 16.5] }[n], y1 = g.hy - 2, y0 = y1 - 24;
    for (const dx of xs) {
      const x = s.cx + dx;
      kit.flowArrow(svg, `M${x} ${y0} L${x} ${y1}`, { w: 3.2, head: 7.5, hw: 2.2, fill: "#E03131" });
    }
    kit.text(svg, s.cx, y0 - 10, `${s.atm}기압`, { size: 13, weight: 800, color: "#C92A2A" });
    kit.text(svg, s.cx, BOT + 33, `${s.vol} mL`, { size: 13, weight: 800 });
    report.push(`${s.vol}mL 기둥 ${(BOT - g.top).toFixed(1)}px 압력×부피 ${s.atm * s.vol} 누르개 ${g.hy.toFixed(0)} 통 위 ${g.barTop.toFixed(0)}`);
  }
  kit.text(svg, W / 2, H - 10, "입자 12개, 꼬리(빠르기)는 셋 다 같아요", { size: 12, weight: 600, color: "#5B6475" });
  console.log("placed " + report.join(" | "));
}
