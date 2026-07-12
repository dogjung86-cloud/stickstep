// 단원 종합 평가 레지스트리 — 단원 id → 시험 정의.
// 새 단원 시험을 추가하면 여기와 해당 단원 풀 파일(content/exams/<unit>*.ts)만 만들면 된다.
import type { ExamDef } from "./types";
import { U3_EXAM } from "./u3";
import { U4_EXAM } from "./u4";
import { U5_EXAM } from "./u5";
import { U6_EXAM } from "./u6";
import { U7_EXAM } from "./u7";
import { G2U1_EXAM } from "./g2u1";
import { G2U2_EXAM } from "./g2u2";
import { G2U3_EXAM } from "./g2u3";
import { G2U4_EXAM } from "./g2u4";
import { G2U7_EXAM } from "./g2u7";
import { G2U8_EXAM } from "./g2u8";
import { M1U3_EXAM } from "./m1u3";
import { M1U6_EXAM } from "./m1u6";

export type { ExamDef, ExamItem, ExamItemType } from "./types";
export { drawExamItems } from "./types";

const EXAMS: Record<string, ExamDef> = {
  u3: U3_EXAM,
  u4: U4_EXAM,
  u5: U5_EXAM,
  u6: U6_EXAM,
  u7: U7_EXAM,
  g2u1: G2U1_EXAM,
  g2u2: G2U2_EXAM,
  g2u3: G2U3_EXAM,
  g2u4: G2U4_EXAM,
  g2u7: G2U7_EXAM,
  g2u8: G2U8_EXAM,
  m1u3: M1U3_EXAM,
  m1u6: M1U6_EXAM, // 첫 수학 시험(수학 규격 60/30/10 — m1u6.ts 헤더 참조)
};

/** 단원에 종합 평가가 있으면 정의를 반환(홈 지도 노드·라우팅의 근거). */
export function examForUnit(unitId: string): ExamDef | null {
  return EXAMS[unitId] ?? null;
}

/** 시험 id("u3exam")로 정의 찾기 — 오답노트가 문항 원본(그림)을 역추적하는 근거. */
export function examById(id: string): ExamDef | null {
  for (const def of Object.values(EXAMS)) if (def.id === id) return def;
  return null;
}
