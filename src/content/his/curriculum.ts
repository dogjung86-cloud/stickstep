// 역사 트랙 커리큘럼 — 중1 역사① Ⅰ(역사 학습의 기초)부터. 사회 curriculum.ts와 같은 Unit 계약.
// 역사 단원 id는 h1uN(역사①)·h2uN(역사②) — 과학 uN·g2uN, 수학 m1uN·m2uN, 사회 s1uN과 절대 충돌 금지.
// 2022 개정 교육과정: 역사① = 세계사(Ⅰ~Ⅶ), 역사② = 한국사. 지금은 Ⅰ + 대단원(soon)만 노출.
import type { Unit, GradeId } from "../curriculum";
import { H1_UNIT1 } from "./unit1";
import { H1_UNIT2 } from "./unit2";
import { H1_UNIT3 } from "./unit3";
import { H1_UNIT4 } from "./unit4";

/** 준비 중 단원 — 탭·밴드는 노출하되 지도 대신 안내 카드(comingSoon). */
const soon = (id: string, roman: string, title: string, subtitle: string, color: string, icon: string): Unit => ({
  id, roman, title, subtitle, color, icon, comingSoon: true, lessons: [],
});

// 역사① — 교과서 대단원 순서 그대로. Ⅱ~Ⅶ은 다음 배치.
export const HIS_G1: Unit[] = [
  H1_UNIT1,
  H1_UNIT2,
  H1_UNIT3,
  H1_UNIT4,
  soon("h1u5", "V", "제국주의와 국민 국가 건설 운동", "격동의 시대를 읽는 법", "#5C677D", "book"),
  soon("h1u6", "VI", "세계 대전과 사회 변동", "두 번의 전쟁, 달라진 세계", "#495867", "book"),
  soon("h1u7", "VII", "현대 세계의 전개와 과제", "지금 이 순간도 역사", "#3E5C76", "book"),
];

// 역사② — 다음 배치에서 제작(자리만 유지).
export const HIS_G2: Unit[] = [
  soon("h2u1", "I", "국가의 형성과 발전", "우리 역사의 첫 나라들", "#7D5A44", "book"),
];

export const HIS_CURRICULA: Record<GradeId, Unit[]> = { g1: HIS_G1, g2: HIS_G2 };

// 퀴즈 스텝 자동 번호 — 과학 curriculum.ts와 같은 규칙(역사 단원은 여기서 처리).
for (const units of [HIS_G1, HIS_G2]) {
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
