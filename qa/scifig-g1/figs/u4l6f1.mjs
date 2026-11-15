// u4l6f1 · 열에너지를 방출하는 상태 변화: 기체를 계속 냉각할 때의 온도 그래프와 구간마다 입자 창(u4l5f1의 거울).
// 검산 메모: u4l6f1.md. 화살표 색은 이 레슨 정리 카드 0의 방출 색(#5AA2F8). 흡수와 방출을 색으로 가르는 범례는 만들지 않는다.
import { phaseCurve } from "../lib/phasecurve.js";

export const meta = { key: "u4l6f1", w: 340, h: 320, scale: 3, quality: 86 };

export async function draw(root, kit) {
  phaseCurve(root, kit, { mode: "cool", W: meta.w, H: meta.h, arrowColor: "#5AA2F8" });
}
