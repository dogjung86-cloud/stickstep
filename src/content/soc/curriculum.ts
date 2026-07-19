// 사회 트랙 커리큘럼 — 중1 Ⅰ(세계화 시대, 지리의 힘)부터. 과학 curriculum.ts와 같은 Unit 계약.
// 사회 단원 id는 s1uN(중1)·s2uN(중2) — 과학 uN·g2uN, 수학 m1uN·m2uN과 절대 충돌 금지.
// 2022 개정 교육과정: 중1 = 지리(Ⅰ~Ⅵ) + 일반사회(Ⅶ~Ⅻ). 지금은 Ⅰ + 지리 대륙 단원(soon)만 노출.
import type { Unit, GradeId } from "../curriculum";
import { S1_UNIT1 } from "./unit1";
import { S1_UNIT2 } from "./unit2";
import { S1_UNIT3 } from "./unit3";
import { S1_UNIT4 } from "./unit4";
import { S1_UNIT5 } from "./unit5";
import { S1_UNIT6 } from "./unit6";

/** 준비 중 단원 — 탭·밴드는 노출하되 지도 대신 안내 카드(comingSoon). */
const soon = (id: string, roman: string, title: string, subtitle: string, color: string, icon: string): Unit => ({
  id, roman, title, subtitle, color, icon, comingSoon: true, lessons: [],
});

// 중1 사회 — 교과서 대단원 순서 그대로. 지리 영역(Ⅰ~Ⅵ) 완성, Ⅶ~ 일반사회는 다음 배치.
export const SOC_G1: Unit[] = [
  S1_UNIT1,
  S1_UNIT2,
  S1_UNIT3,
  S1_UNIT4,
  S1_UNIT5,
  S1_UNIT6,
];

// 중2 사회 — 다음 배치에서 제작(자리만 유지).
export const SOC_G2: Unit[] = [
  soon("s2u1", "I", "헌법과 국가기관", "나라의 설계도를 읽는 법", "#364FC7", "book"),
];

export const SOC_CURRICULA: Record<GradeId, Unit[]> = { g1: SOC_G1, g2: SOC_G2 };

// 퀴즈 스텝 자동 번호 — 과학 curriculum.ts와 같은 규칙(사회 단원은 여기서 처리).
for (const units of [SOC_G1, SOC_G2]) {
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
