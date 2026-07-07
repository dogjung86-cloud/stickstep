// 커리큘럼 — 교과서 대단원 순서 그대로. 단원 = 데이터.
// 학년별 트랙: 중1(CURRICULUM)·중2(CURRICULUM_G2). 홈이 getViewGrade()로 전환한다.
import type { Lesson } from "../lessons/types";
import { isDone, isPremium, isReviewMode } from "../core/store";
import { UNIT1 } from "./unit1";
import { UNIT2 } from "./unit2";
import { UNIT3 } from "./unit3";
import { UNIT4 } from "./unit4";
import { UNIT5 } from "./unit5";
import { UNIT6 } from "./unit6";
import { UNIT7 } from "./unit7";
import { G2_UNIT1 } from "./g2/unit1";
import { G2_UNIT2 } from "./g2/unit2";
import { G2_UNIT3 } from "./g2/unit3";
import { G2_UNIT4 } from "./g2/unit4";

export interface Unit {
  id: string;
  roman: string; // 'I', 'II'
  title: string;
  subtitle: string;
  color: string; // 단원 대표색
  icon: string; // 아이콘 이름
  standard?: string;
  comingSoon?: boolean; // 준비 중 단원 — 지도 대신 안내 카드를 보여준다
  lessons: Lesson[];
}

export type GradeId = "g1" | "g2";
export const GRADE_LABEL: Record<GradeId, string> = { g1: "중1", g2: "중2" };

export const CURRICULUM: Unit[] = [UNIT1, UNIT2, UNIT3, UNIT4, UNIT5, UNIT6, UNIT7];

/** 준비 중 단원 자리 — 콘텐츠가 완성되면 실제 UNIT 모듈로 교체한다. */
const soon = (id: string, roman: string, title: string, subtitle: string, icon: string): Unit => ({
  id,
  roman,
  title,
  subtitle,
  color: "#3182F6",
  icon,
  lessons: [],
  comingSoon: true,
});

// 중2 — 대단원 8개. V·VI(식물·동물과 에너지)은 의도적으로 뒤 순번 제작(자리만 유지).
export const CURRICULUM_G2: Unit[] = [
  G2_UNIT1,
  G2_UNIT2,
  G2_UNIT3,
  G2_UNIT4,
  soon("g2u5", "V", "식물과 에너지", "광합성, 식물이 양분을 만드는 법", "leaf"),
  soon("g2u6", "VI", "동물과 에너지", "소화·순환·호흡·배설의 협동", "heart"),
  soon("g2u7", "VII", "전기와 자기", "전류·전압·저항, 그리고 자기장", "bolt"),
  soon("g2u8", "VIII", "별과 우주", "별까지의 거리, 우리은하와 우주", "sparkle"),
];

export const CURRICULA: Record<GradeId, Unit[]> = { g1: CURRICULUM, g2: CURRICULUM_G2 };

// 퀴즈 스텝 자동 번호 — "문제 n / of" 헤더용. 이미 n/of를 명시한 스텝은 그대로 둔다.
for (const u of [...CURRICULUM, ...CURRICULUM_G2]) {
  for (const les of u.lessons) {
    const qs = les.steps.filter((st) => (st as { type?: string }).type === "quiz") as { n?: number; of?: number }[];
    qs.forEach((st, i) => {
      if (st.n == null) st.n = i + 1;
      if (st.of == null) st.of = qs.length;
    });
  }
}

export function findLesson(id: string): { unit: Unit; lesson: Lesson; index: number } | null {
  for (const cur of [CURRICULUM, CURRICULUM_G2]) {
    for (const unit of cur) {
      const index = unit.lessons.findIndex((l) => l.id === id);
      if (index >= 0) return { unit, lesson: unit.lessons[index], index };
    }
  }
  return null;
}

/** 단원이 속한 학년 — 레슨 완료 후 홈이 올바른 학년 지도로 복귀할 때 쓴다. */
export function gradeOfUnit(unitId: string): GradeId {
  return CURRICULUM_G2.some((u) => u.id === unitId) ? "g2" : "g1";
}

/** 단원 내 순차 잠금 해제: 첫 레슨 또는 직전 레슨 완료 시 열림. 검토 모드는 전부 개방. */
export function isUnlocked(unit: Unit, index: number): boolean {
  if (isReviewMode()) return true;
  if (index === 0) return true;
  return isDone(unit.lessons[index - 1].id);
}

/** 프리미엄 잠금 — premium 레슨 && 미구매. 순차 잠금과 별개의 겹층. 검토 모드는 해제. */
export function isPremiumLocked(lesson: Lesson): boolean {
  return !!lesson.premium && !isPremium() && !isReviewMode();
}

export function unitProgress(unit: Unit): number {
  if (!unit.lessons.length) return 0;
  const done = unit.lessons.filter((l) => isDone(l.id)).length;
  return Math.round((done / unit.lessons.length) * 100);
}
