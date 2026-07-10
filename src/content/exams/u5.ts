// 중1 과학 V. 힘의 작용 — 단원 종합 평가 문항 풀(100제 = 레슨당 15·15·15·14·14·14·13).
// 문항은 레슨 파일(u5l1~u5l7)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
import type { ExamDef } from "./types";
import { POOL_U5L1 } from "./u5l1";
import { POOL_U5L2 } from "./u5l2";
import { POOL_U5L3 } from "./u5l3";
import { POOL_U5L4 } from "./u5l4";
import { POOL_U5L5 } from "./u5l5";
import { POOL_U5L6 } from "./u5l6";
import { POOL_U5L7 } from "./u5l7";

export const U5_EXAM: ExamDef = {
  id: "u5exam",
  unitId: "u5",
  title: "힘의 작용",
  pick: 20,
  pool: [...POOL_U5L1, ...POOL_U5L2, ...POOL_U5L3, ...POOL_U5L4, ...POOL_U5L5, ...POOL_U5L6, ...POOL_U5L7],
};
