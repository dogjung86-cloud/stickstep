// 중2 Ⅷ 별과 우주: 도입, 랩, 개념, 정리, 문제 전면 재제작(v5, 2026-11-12). 주소에 ?g2u8v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit8.ts)을 베끼지 않는다. 레슨의 id와 수, 제목, 쪽수, 잠금은 정본 그대로 따라오고, 스텝은 새 것으로 바꿔 끼운다.
// 레슨마다 도입(opener) → 랩 → 용어 → 정리 → 문제. g2u8l7만 정본의 만화 스텝을 그대로 두고(그림 세션이 따로 만든다) 그 뒤를 새 스텝으로 바꾼다.
// 새 스텝은 unit8v5parts.ts(레슨 1~4)와 unit8v5parts2.ts(레슨 5~8)에 있다. 설계와 책의 탐구 대응표는 design/g2u8v5-plan.md.
// 개념 스텝에는 아직 컷이 없다(output/g2-v5/u8/concept-cuts.md 를 보고 그림 세션이 그린다).
import type { Unit } from "../curriculum";
import type { Step } from "../../lessons/types";
import { G2_UNIT8 } from "./unit8";
import { remakeUnit } from "../v5remake";
import { L1, L2, L3, L4 } from "./unit8v5parts";
import { L5, L6, L7, L8 } from "./unit8v5parts2";

const all = (steps: Step[]) => ({ after: (): Step[] => steps });

export const G2_UNIT8_V5: Unit | null = remakeUnit(G2_UNIT8, {
  g2u8l1: all(L1),
  g2u8l2: all(L2),
  g2u8l3: all(L3),
  g2u8l4: all(L4),
  g2u8l5: all(L5),
  g2u8l6: all(L6),
  // 맨 앞의 만화(정본의 첫 스텝)는 자리와 내용 모두 그대로 둔다
  g2u8l7: { after: (steps: Step[]): Step[] => [steps[0], ...L7] },
  g2u8l8: all(L8),
});
