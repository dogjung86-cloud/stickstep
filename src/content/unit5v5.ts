// 중1 Ⅴ 힘의 작용: 랩과 도입 재제작(v5). 주소에 ?u5v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit5.ts)을 베끼지 않는다. remakeUnit으로 도입과 랩 스텝만 바꿔 끼운다(개념, 정리, 문제, 만화는 정본 그대로).
// 설계 근거: design/u5v5-plan.md. 랩의 수치는 정본과 같다(용수철 4 cm에 2 N, 부력 20 N에서 14 N, 지구 29.4 N과 달 4.9 N).
import type { Unit } from "./curriculum";
import type { Step } from "../lessons/types";
import { UNIT5 } from "./unit5";
import { remakeUnit } from "./v5remake";

const lab = (type: string) => (o: { title: string; cta?: string }): Step => ({ type, ...o }) as unknown as Step;
const forceLab = lab("u5ForceLab");

export const UNIT5_V5: Unit | null = remakeUnit(UNIT5, {
  u5l1: {
    swap: { forceStudio: forceLab({ title: "힘을 화살표로 어떻게 나타낼까요?", cta: "개념 정리하기" }) },
  },
});
