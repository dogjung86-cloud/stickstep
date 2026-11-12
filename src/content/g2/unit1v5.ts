// 중2 Ⅰ 물질의 특성: 전면 재제작(v5, 2026-11-12). 주소에 ?g2u1v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts에 이미 있다).
// 정본(unit1.ts)에서 도입(hook), 랩, 표, 개념, 정리, 문제를 바꿔 끼운다. 레슨의 id와 수, 제목, 쪽수, 잠금은 정본 그대로 따라온다.
// 레슨별 새 스텝은 unit1v5a.ts(1~3), unit1v5b.ts(4~6), unit1v5c.ts(7~9)에 있고 공용 도구는 unit1v5kit.ts에 있다.
// 설계와 책의 실험 대응표는 design/g2u1v5-plan.md. 개념 스텝에는 컷이 없다(그림 세션이 output/g2-v5/u1/concept-cuts.md 를 보고 그린다).
import type { Unit } from "../curriculum";
import { remakeUnit } from "../v5remake";
import { G2_UNIT1 } from "./unit1";
import { L1 } from "./unit1v5a";
import { L2, L3 } from "./unit1v5b";

export const G2_UNIT1_V5: Unit | null = remakeUnit(G2_UNIT1, {
  g2u1l1: L1,
  g2u1l2: L2,
  g2u1l3: L3,
});

// 검사 도구(qa/check-g2u1v5.mjs)가 문제의 정답을 찾는 표. 개발 모드에서만 내놓는다(운영 번들에는 없다).
if (import.meta.env.DEV) Object.assign(globalThis as unknown as Record<string, unknown>, { __g2u1v5: G2_UNIT1_V5, __g2u1base: G2_UNIT1 });
