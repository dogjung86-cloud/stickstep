// 중2 Ⅱ 지권의 변화: 도입, 랩, 개념, 정리, 문제 전면 재제작(v5, 2026-11-12). 주소에 ?g2u2v5 를 붙였을 때만 보인다.
// 정본(unit2.ts)에서 도입(hook), 랩, 개념, 정리(recap), 문제를 바꿔 끼운다. 레슨의 id와 수, 제목, 쪽수, 잠금은 정본 그대로 따라온다.
// 레슨별 내용은 unit2v5a.ts(1~3), unit2v5b.ts(4~6), unit2v5c.ts(7~9)에 있고 저작 도구는 unit2v5kit.ts에 있다.
// 설계와 책의 탐구 대응표는 design/g2u2v5-plan.md. 개념 스텝에는 컷이 없다(그림 세션이 output/g2-v5/u2/concept-cuts.md 를 보고 그린다).
import type { Unit } from "../curriculum";
import { remakeUnit } from "../v5remake";
import { G2_UNIT2 } from "./unit2";
import { L1 } from "./unit2v5a";

export const G2_UNIT2_V5: Unit | null = remakeUnit(G2_UNIT2, {
  g2u2l1: L1,
});
if (import.meta.env.DEV) Object.assign(globalThis as unknown as Record<string, unknown>, { __g2u2v5: G2_UNIT2_V5 });
