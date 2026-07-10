// 중1 과학 III. 열 — 단원 종합 평가 문항 풀(100제 = 레슨당 20제).
// 문항은 레슨 파일(u3l1~u3l5)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
import type { ExamDef } from "./types";
import { POOL_U3L1 } from "./u3l1";
import { POOL_U3L2 } from "./u3l2";
import { POOL_U3L3 } from "./u3l3";
import { POOL_U3L4 } from "./u3l4";
import { POOL_U3L5 } from "./u3l5";

export const U3_EXAM: ExamDef = {
  id: "u3exam",
  unitId: "u3",
  title: "열",
  pick: 20,
  pool: [...POOL_U3L1, ...POOL_U3L2, ...POOL_U3L3, ...POOL_U3L4, ...POOL_U3L5],
};
