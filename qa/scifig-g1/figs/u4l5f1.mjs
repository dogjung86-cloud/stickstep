// u4l5f1 · 열에너지를 흡수하는 상태 변화: 고체를 계속 가열할 때의 온도 그래프와 구간마다 입자 창.
// 검산 메모: u4l5f1.md. 그리는 코드는 lib/phasecurve.js(냉각 곡선 u4l6f1과 공용).
import { phaseCurve } from "../lib/phasecurve.js";

export const meta = { key: "u4l5f1", w: 340, h: 320, scale: 3, quality: 86 };

export async function draw(root, kit) {
  phaseCurve(root, kit, { mode: "heat", W: meta.w, H: meta.h, arrowColor: "#FF8A5C" });
}
