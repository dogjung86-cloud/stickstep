// 중2 Ⅲ 빛과 파동: 전면 재제작(v5). 주소에 ?g2u3v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit3.ts)을 베끼지 않는다. remakeUnit으로 레슨의 머리 정보(id, 제목, 쪽수, 잠금)와 만화만 정본에서 따라오고,
// 도입, 랩, 개념, 정리, 문제는 모두 새로 만든 것을 끼운다(unit3v5parts.ts). 설계 근거: design/g2u3v5-plan.md.
import type { Unit } from "../curriculum";
import type { Step } from "../../lessons/types";
import { G2_UNIT3 } from "./unit3";
import { remakeUnit, type V5LessonPlan } from "../v5remake";
import { G2U3_PARTS } from "./unit3v5parts";

const typeOf = (st: Step): string => (st as unknown as { type: string }).type;

/** 레슨을 도입 → (만화) → 새 본문으로 다시 짠다. 만화 스텝은 정본의 것을 자리와 내용 그대로 둔다. */
const plan = (id: string): V5LessonPlan => {
  const part = G2U3_PARTS[id];
  return {
    intro: part.intro,
    after: (steps) => [steps[0], ...steps.slice(1).filter((st) => typeOf(st) === "comic"), ...part.body],
  };
};

export const G2_UNIT3_V5: Unit | null = remakeUnit(G2_UNIT3, Object.fromEntries(Object.keys(G2U3_PARTS).map((id) => [id, plan(id)])));

// 검사 도구(qa/g2u3v5-lib.mjs)가 문제의 정답을 찾을 때 쓰는 단원 표. 개발 모드에서만 내놓는다.
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as { __g2u3v5?: unknown }).__g2u3v5 = G2_UNIT3_V5;
  (window as unknown as { __g2u3base?: unknown }).__g2u3base = G2_UNIT3;
}
