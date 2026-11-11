// 중1 Ⅴ 힘의 작용: 랩과 도입 재제작(v5). 주소에 ?u5v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit5.ts)을 베끼지 않는다. remakeUnit으로 도입과 랩 스텝만 바꿔 끼운다(개념, 정리, 문제, 만화는 정본 그대로).
// 설계 근거: design/u5v5-plan.md. 랩의 수치는 정본과 같다(용수철 4 cm에 2 N, 부력 20 N에서 14 N, 지구 29.4 N과 달 4.9 N).
import type { Unit } from "./curriculum";
import type { Step } from "../lessons/types";
import { UNIT5 } from "./unit5";
import { remakeUnit } from "./v5remake";
import { opener } from "./dsl";

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
    intro: opener({ title: "당겼다 놓은 풍선은 어디로 갈까요?", scene: "u5-balloon", wait: "풍선 줄을 당겼다 놓아 보세요", cta: "실험실 열기" }),
    swap: { forceStudio: forceLab({ title: "힘을 화살표로 어떻게 나타낼까요?", cta: "개념 정리하기" }) },
  },
  u5l2: {
    intro: opener({ title: "세게 당기는데 왜 안 움직일까요?", scene: "u5-tug", wait: "더 세게 당기게 해 보세요", cta: "실험실 열기" }),
    swap: { tugOfWar: tugLab({ title: "리본은 언제 움직이고 언제 멈출까요?", cta: "개념 정리하기" }) },
  },
  u5l3: {
    // 만화로 시작하는 레슨이라 도입은 그대로 둔다. 랩 끝의 궁금증 카드(우주 정거장)는 정본의 것을 이어 쓴다.
    swap: { gravityDrop: (old) => gravityLab({ title: "사과는 어느 쪽으로 떨어질까요?", cta: "개념 정리하기", curio: (old as unknown as { curio?: unknown }).curio }) },
  },
  u5l4: {
    intro: opener({ title: "뒤로 당긴 화살은 왜 앞으로 갈까요?", scene: "u5-bow", wait: "두 가지로 쏴 보세요", cta: "실험실 열기" }),
    swap: { springLab: springLab5({ title: "많이 늘이면 힘도 커질까요?", cta: "개념 정리하기" }) },
  },
  u5l5: {
    intro: opener({ title: "썰매는 어느 길에서 멀리 갈까요?", scene: "u5-sled", wait: "두 길에서 밀어 보세요", cta: "실험실 열기" }),
    swap: { frictionPush: frictionLab({ title: "어떤 때 상자를 밀기 더 힘들까요?", cta: "개념 정리하기" }) },
  },
  u5l6: {
    intro: opener({ title: "눌러 넣은 병은 어떻게 될까요?", scene: "u5-bottle", wait: "병을 눌렀다 놓아 보세요", cta: "실험실 열기" }),
    swap: { buoyancyLab: buoyLab({ title: "물에 담그면 눈금은 어떻게 될까요?", cta: "개념 정리하기" }) },
  },
  u5l7: {
    intro: opener({ title: "찬 공은 끝까지 굴러갈까요?", scene: "u5-roll", wait: "공을 차고 지켜보세요", cta: "실험실 열기" }),
    swap: { windSoccer: windLab({ title: "힘을 받으면 공은 어떻게 될까요?", cta: "개념 정리하기" }) },
  },
});
