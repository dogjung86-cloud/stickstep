// 중1 과학 VI. 기체의 성질 · 단원 종합 평가 문항 풀 v2(160제 = 32×5, 5레슨 · 재출제 5호).
// 문항은 레슨 파일(u6l1~u6l5)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 129 / multi 15 / num 16 / word 0 · diff 64/64/32 · 시각 100(사진 10장 = 재사용 8+신규 2).
// 규격·회피표·검산 기록 정본 = qa/u6-v2-blueprint.md, 이식 = qa/build-u6v2-lessons.mjs(재실행 가능).
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
