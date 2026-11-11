// 중1 Ⅴ 힘의 작용: 랩과 도입 재제작(v5). 주소에 ?u5v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit5.ts)을 베끼지 않는다. remakeUnit으로 도입과 랩 스텝만 바꿔 끼운다(개념, 정리, 문제, 만화는 정본 그대로).
// 설계 근거: design/u5v5-plan.md. 랩의 수치는 정본과 같다(용수철 4 cm에 2 N, 부력 20 N에서 14 N, 지구 29.4 N과 달 4.9 N).
import type { Unit } from "./curriculum";
import type { Step } from "../lessons/types";
import { UNIT5 } from "./unit5";
import { remakeUnit } from "./v5remake";

const lab = (type: string) => (o: { title: string; cta?: string; curio?: unknown }): Step => ({ type, ...o }) as unknown as Step;
const forceLab = lab("u5ForceLab");
const tugLab = lab("u5TugLab");
const gravityLab = lab("u5GravityLab");
const springLab5 = lab("u5SpringLab");
const frictionLab = lab("u5FrictionLab");
const buoyLab = lab("u5BuoyLab");
const windLab = lab("u5WindLab");

export const UNIT5_V5: Unit | null = remakeUnit(UNIT5, {
  u5l1: {
    swap: { forceStudio: forceLab({ title: "힘을 화살표로 어떻게 나타낼까요?", cta: "개념 정리하기" }) },
  },
  u5l2: {
    swap: { tugOfWar: tugLab({ title: "리본은 언제 움직이고 언제 멈출까요?", cta: "개념 정리하기" }) },
  },
  u5l3: {
    // 만화로 시작하는 레슨이라 도입은 그대로 둔다. 랩 끝의 궁금증 카드(우주 정거장)는 정본의 것을 이어 쓴다.
    swap: { gravityDrop: (old) => gravityLab({ title: "사과는 어느 쪽으로 떨어질까요?", cta: "개념 정리하기", curio: (old as unknown as { curio?: unknown }).curio }) },
  },
  u5l4: {
    swap: { springLab: springLab5({ title: "많이 늘이면 힘도 커질까요?", cta: "개념 정리하기" }) },
  },
  u5l5: {
    swap: { frictionPush: frictionLab({ title: "어떤 때 상자를 밀기 더 힘들까요?", cta: "개념 정리하기" }) },
  },
  u5l6: {
    swap: { buoyancyLab: buoyLab({ title: "물에 담그면 눈금은 어떻게 될까요?", cta: "개념 정리하기" }) },
  },
  u5l7: {
    swap: { windSoccer: windLab({ title: "힘을 받으면 공은 어떻게 될까요?", cta: "개념 정리하기" }) },
  },
});
