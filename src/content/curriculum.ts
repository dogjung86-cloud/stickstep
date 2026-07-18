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
import { G2_UNIT5 } from "./g2/unit5";
import { G2_UNIT6 } from "./g2/unit6";
import { G2_UNIT7 } from "./g2/unit7";
import { G2_UNIT8 } from "./g2/unit8";
import { MATH_CURRICULA } from "./math/curriculum";
import { SOC_CURRICULA } from "./soc/curriculum";

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

// 중2 — 대단원 8개.
export const CURRICULUM_G2: Unit[] = [
  G2_UNIT1,
  G2_UNIT2,
  G2_UNIT3,
  G2_UNIT4,
  G2_UNIT5,
  G2_UNIT6,
  G2_UNIT7,
  G2_UNIT8,
];

export const CURRICULA: Record<GradeId, Unit[]> = { g1: CURRICULUM, g2: CURRICULUM_G2 };

// ── 과목 트랙 — 과학(CURRICULA)·수학(MATH_CURRICULA)·사회(SOC_CURRICULA) ──
export type SubjectId = "sci" | "math" | "soc";
export const SUBJECT_LABEL: Record<SubjectId, string> = { sci: "과학", math: "수학", soc: "사회" };
export const CURRICULA_OF: Record<SubjectId, Record<GradeId, Unit[]>> = {
  sci: CURRICULA,
  math: MATH_CURRICULA,
  soc: SOC_CURRICULA,
};

/** 단원이 속한 과목 — 수학 단원 id는 m(m1uN·m2uN), 사회는 s(s1uN·s2uN)로 시작. */
export function subjectOfUnit(unitId: string): SubjectId {
  if (unitId.startsWith("m")) return "math";
  if (unitId.startsWith("s")) return "soc";
  return "sci";
}

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
  for (const cur of [CURRICULUM, CURRICULUM_G2, MATH_CURRICULA.g1, MATH_CURRICULA.g2, SOC_CURRICULA.g1, SOC_CURRICULA.g2]) {
    for (const unit of cur) {
      const index = unit.lessons.findIndex((l) => l.id === id);
      if (index >= 0) return { unit, lesson: unit.lessons[index], index };
    }
  }
  return null;
}

/** 단원 찾기 — 단원 종합 평가 화면 등 unitId만 아는 곳에서 쓴다. */
export function findUnit(unitId: string): Unit | null {
  for (const cur of [CURRICULUM, CURRICULUM_G2, MATH_CURRICULA.g1, MATH_CURRICULA.g2, SOC_CURRICULA.g1, SOC_CURRICULA.g2]) {
    const u = cur.find((x) => x.id === unitId);
    if (u) return u;
  }
  return null;
}

/** 단원이 속한 학년 — 레슨 완료 후 홈이 올바른 학년 지도로 복귀할 때 쓴다. */
export function gradeOfUnit(unitId: string): GradeId {
  const subj = subjectOfUnit(unitId);
  if (subj === "math") return MATH_CURRICULA.g2.some((u) => u.id === unitId) ? "g2" : "g1";
  if (subj === "soc") return SOC_CURRICULA.g2.some((u) => u.id === unitId) ? "g2" : "g1";
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
