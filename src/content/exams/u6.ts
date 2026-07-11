// 중1 과학 VI. 기체의 성질 — 단원 종합 평가 문항 풀(120제 = 레슨당 24·24·24·24·24).
// 문항은 레슨 파일(u6l1~u6l5)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
import type { ExamDef } from "./types";
import { POOL_U6L1 } from "./u6l1";
import { POOL_U6L2 } from "./u6l2";
import { POOL_U6L3 } from "./u6l3";
import { POOL_U6L4 } from "./u6l4";
import { POOL_U6L5 } from "./u6l5";

export const U6_EXAM: ExamDef = {
  id: "u6exam",
  unitId: "u6",
  title: "기체의 성질",
  pick: 20,
  pool: [...POOL_U6L1, ...POOL_U6L2, ...POOL_U6L3, ...POOL_U6L4, ...POOL_U6L5],
};
