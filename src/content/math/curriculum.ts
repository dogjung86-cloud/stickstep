// 수학 트랙 커리큘럼, 중1 Ⅰ~Ⅵ·중2 Ⅰ~Ⅵ 전 단원 완성. 과학 curriculum.ts와 같은 Unit 계약.
// 수학 단원 id는 m1uN(중1)·m2uN(중2), 과학 uN·g2uN과 절대 충돌 금지.
// 준비 중 단원이 다시 생기면 과거 soon() 헬퍼(comingSoon: true, lessons: [])를 되살려 쓴다.
import type { Unit, GradeId } from "../curriculum";
import { M1_UNIT1 } from "./unit1";
import { M1_UNIT2 } from "./unit2";
import { M1_UNIT3 } from "./unit3";
import { M1_UNIT4 } from "./unit4";
import { M1_UNIT5 } from "./unit5";
import { M1_UNIT6 } from "./unit6";
import { M2_UNIT1 } from "./g2/unit1";
import { M2_UNIT2 } from "./g2/unit2";
import { M2_UNIT3 } from "./g2/unit3";
import { M2_UNIT4 } from "./g2/unit4";
import { M2_UNIT5 } from "./g2/unit5";
import { M2_UNIT6 } from "./g2/unit6";

// 중1 수학, 교과서 대단원 순서 그대로.
export const MATH_G1: Unit[] = [
  M1_UNIT1,
  M1_UNIT2,
  M1_UNIT3,
  M1_UNIT4,
  M1_UNIT5,
  M1_UNIT6,
];

// 중2 수학, Ⅰ~Ⅵ 전 단원 완성.
export const MATH_G2: Unit[] = [
  M2_UNIT1,
  M2_UNIT2,
  M2_UNIT3,
  M2_UNIT4,
  M2_UNIT5,
  M2_UNIT6,
];

export const MATH_CURRICULA: Record<GradeId, Unit[]> = { g1: MATH_G1, g2: MATH_G2 };

// 퀴즈 스텝 자동 번호, 과학 curriculum.ts와 같은 규칙(수학 단원은 여기서 처리).
for (const units of [MATH_G1, MATH_G2]) {
  for (const u of units) {
    for (const les of u.lessons) {
      const qs = les.steps.filter((st) => (st as { type?: string }).type === "quiz") as { n?: number; of?: number }[];
      qs.forEach((st, i) => {
        if (st.n == null) st.n = i + 1;
        if (st.of == null) st.of = qs.length;
      });
    }
  }
}
