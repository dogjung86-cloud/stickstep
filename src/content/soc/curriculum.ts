// 사회 트랙 커리큘럼 — 중1 Ⅰ(세계화 시대, 지리의 힘)부터. 과학 curriculum.ts와 같은 Unit 계약.
// 사회 단원 id는 s1uN(중1)·s2uN(중2) — 과학 uN·g2uN, 수학 m1uN·m2uN과 절대 충돌 금지.
// 2022 개정 교육과정: 중1 = 지리(Ⅰ~Ⅵ) + 일반사회(Ⅶ~Ⅻ). 지금은 Ⅰ + 지리 대륙 단원(soon)만 노출.
import type { Unit, GradeId } from "../curriculum";
import { S1_UNIT1 } from "./unit1";

/** 준비 중 단원 — 탭·밴드는 노출하되 지도 대신 안내 카드(comingSoon). */
const soon = (id: string, roman: string, title: string, subtitle: string, color: string, icon: string): Unit => ({
  id, roman, title, subtitle, color, icon, comingSoon: true, lessons: [],
});

// 중1 사회 — 교과서 대단원 순서 그대로. Ⅱ~Ⅵ 대륙 지리는 다음 배치.
export const SOC_G1: Unit[] = [
  S1_UNIT1,
  soon("s1u2", "II", "아시아", "우리가 사는 대륙, 다양성의 최대치", "#D9480F", "globe"),
  soon("s1u3", "III", "유럽", "작은 대륙이 만든 큰 이야기", "#1971C2", "globe"),
  soon("s1u4", "IV", "아프리카", "인류의 고향, 가장 젊은 대륙", "#E8A104", "globe"),
  soon("s1u5", "V", "아메리카", "두 대륙을 잇는 신대륙 이야기", "#2F9E44", "globe"),
  soon("s1u6", "VI", "오세아니아와 극지방", "가장 멀리, 가장 추운 곳까지", "#0B7285", "globe"),
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
