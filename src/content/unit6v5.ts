// 중1 Ⅵ 기체의 성질: 랩과 도입 재제작(v5). 주소 ?u6v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit6.ts)에서 도입(hook)과 랩 스텝만 바꿔 끼운다. 레슨의 id, 제목, 쪽수, 개념, 정리, 문제, u6l2의 만화는 정본 그대로다.
// 수치는 정본과 같다: 보일 24 mL·1기압(12 mL·2기압, 6 mL·4기압), 샤를 20 ℃ 30.0 mL에서 10 ℃마다 1.0 mL, 바닷속 30 m는 4기압.
// 설계와 교과서 대응표는 design/u6v5-plan.md.
import type { Step } from "../lessons/types";
import type { Unit } from "./curriculum";
import { opener } from "./dsl";
import { remakeUnit } from "./v5remake";
import { UNIT6 } from "./unit6";

const lab = (type: string, o: { title: string; cta?: string }): Step => ({ type, ...o });

export const UNIT6_V5: Unit | null = remakeUnit(UNIT6, {
  u6l1: {
    swap: { gasPressure: lab("u6PressureLab", { title: "기체의 압력은 어떻게 생길까?", cta: "개념 정리하기" }) },
  },
  u6l2: {
    swap: { boyleSyringe: lab("u6BoyleLab", { title: "누르면 압력은 어떻게 될까?", cta: "개념 정리하기" }) },
  },
  u6l3: {
    swap: { diverBubble: lab("u6DiverLab", { title: "누르는 압력이 줄면 기체는?", cta: "개념 정리하기" }) },
  },
  u6l4: {
    swap: { charlesSyringe: lab("u6CharlesLab", { title: "데우면 부피는 어떻게 될까?", cta: "개념 정리하기" }) },
  },
  u6l5: {
    swap: { hotairRide: lab("u6BalloonLab", { title: "열기구는 어떻게 떠오를까?", cta: "개념 정리하기" }) },
  },
});
void opener;
