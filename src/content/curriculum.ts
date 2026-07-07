// 커리큘럼 — 교과서 대단원 순서 그대로. 단원 = 데이터.
import type { Lesson } from "../lessons/types";
import { isDone } from "../core/store";
import { UNIT1 } from "./unit1";
import { UNIT2 } from "./unit2";
import { UNIT3 } from "./unit3";
import { UNIT4 } from "./unit4";
import { UNIT5 } from "./unit5";
import { UNIT6 } from "./unit6";
import { UNIT7 } from "./unit7";
import { G2UNIT3 } from "./g2unit3";
import { G2UNIT4 } from "./g2unit4";

export interface Unit {
  id: string;
  roman: string; // 'I', 'II'
  title: string;
  subtitle: string;
  color: string; // 단원 대표색
  icon: string; // 아이콘 이름
  grade?: number; // 학년(생략 = 1). 중2 단원부터 표기 — 탭·배너에 "중2"가 붙는다.
  standard?: string;
  lessons: Lesson[];
}

export const CURRICULUM: Unit[] = [UNIT1, UNIT2, UNIT3, UNIT4, UNIT5, UNIT6, UNIT7, G2UNIT3, G2UNIT4];

// 퀴즈 스텝 자동 번호 — "문제 n / of" 헤더용. 이미 n/of를 명시한 스텝은 그대로 둔다.
for (const u of CURRICULUM) {
  for (const les of u.lessons) {
    const qs = les.steps.filter((st) => (st as { type?: string }).type === "quiz") as { n?: number; of?: number }[];
    qs.forEach((st, i) => {
      if (st.n == null) st.n = i + 1;
      if (st.of == null) st.of = qs.length;
    });
  }
}

export function findLesson(id: string): { unit: Unit; lesson: Lesson; index: number } | null {
  for (const unit of CURRICULUM) {
    const index = unit.lessons.findIndex((l) => l.id === id);
    if (index >= 0) return { unit, lesson: unit.lessons[index], index };
  }
  return null;
}

/** 단원 내 순차 잠금 해제: 첫 레슨 또는 직전 레슨 완료 시 열림. */
export function isUnlocked(unit: Unit, index: number): boolean {
  if (index === 0) return true;
  return isDone(unit.lessons[index - 1].id);
}

export function unitProgress(unit: Unit): number {
  const done = unit.lessons.filter((l) => isDone(l.id)).length;
  return Math.round((done / unit.lessons.length) * 100);
}
