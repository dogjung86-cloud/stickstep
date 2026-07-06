// 커리큘럼 — 교과서 대단원 순서 그대로. 단원 = 데이터.
import type { Lesson } from "../lessons/types";
import { isDone } from "../core/store";
import { UNIT1 } from "./unit1";
import { UNIT2 } from "./unit2";
import { UNIT3 } from "./unit3";
import { UNIT4 } from "./unit4";
import { UNIT5 } from "./unit5";

export interface Unit {
  id: string;
  roman: string; // 'I', 'II'
  title: string;
  subtitle: string;
  color: string; // 단원 대표색
  icon: string; // 아이콘 이름
  standard?: string;
  lessons: Lesson[];
}

export const CURRICULUM: Unit[] = [UNIT1, UNIT2, UNIT3, UNIT4, UNIT5];

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
