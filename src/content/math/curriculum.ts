// 수학 트랙 커리큘럼, 중1(Ⅰ 수와 연산부터)·중2(준비 중). 과학 curriculum.ts와 같은 Unit 계약.
// 수학 단원 id는 m1uN(중1)·m2uN(중2), 과학 uN·g2uN과 절대 충돌 금지.
import type { Unit, GradeId } from "../curriculum";
import { M1_UNIT1 } from "./unit1";
import { M1_UNIT2 } from "./unit2";
import { M1_UNIT3 } from "./unit3";
import { M1_UNIT4 } from "./unit4";
import { M1_UNIT5 } from "./unit5";
import { M1_UNIT6 } from "./unit6";
import { M2_UNIT1 } from "./g2/unit1";
import { M2_UNIT2 } from "./g2/unit2";

/** 준비 중 단원 자리, 콘텐츠가 완성되면 실제 UNIT 모듈로 교체한다. */
const soon = (id: string, roman: string, title: string, subtitle: string, icon: string): Unit => ({
  id,
  roman,
  title,
  subtitle,
  color: "#0DA5C6",
  icon,
  lessons: [],
  comingSoon: true,
});

// 중1 수학, 교과서 대단원 순서 그대로(Ⅰ만 완성, 나머지는 자리).
export const MATH_G1: Unit[] = [
  M1_UNIT1,
  M1_UNIT2,
  M1_UNIT3,
  M1_UNIT4,
  M1_UNIT5,
  M1_UNIT6,
];

// 중2 수학, Ⅰ부터 순차 제작(나머지는 준비 중 자리).
export const MATH_G2: Unit[] = [
  M2_UNIT1,
  M2_UNIT2,
  soon("m2u3", "III", "일차함수", "변화를 직선으로 읽기", "route"),
  soon("m2u4", "IV", "삼각형과 사각형의 성질", "도형의 논리", "layers"),
  soon("m2u5", "V", "도형의 닮음과 피타고라스 정리", "비율과 직각의 비밀", "target"),
  soon("m2u6", "VI", "확률", "우연을 수로 재는 법", "sparkle"),
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
