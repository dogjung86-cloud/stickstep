// 중1 과학 VII. 태양계 — 단원 종합 평가 문항 풀(120제 = 레슨당 20×6).
// 문항은 레슨 파일(u7l1~u7l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
import type { ExamDef } from "./types";
import { POOL_U7L1 } from "./u7l1";
import { POOL_U7L2 } from "./u7l2";
import { POOL_U7L3 } from "./u7l3";
import { POOL_U7L4 } from "./u7l4";
import { POOL_U7L5 } from "./u7l5";
import { POOL_U7L6 } from "./u7l6";

export const U7_EXAM: ExamDef = {
  id: "u7exam",
  unitId: "u7",
  title: "태양계",
  pick: 20,
  pool: [...POOL_U7L1, ...POOL_U7L2, ...POOL_U7L3, ...POOL_U7L4, ...POOL_U7L5, ...POOL_U7L6],
};
