// 중1 과학 III. 열 · 단원 종합 평가 문항 풀 v2(160제 = 28+30+36+34+32, 5레슨 · 재출제 10호).
// 문항은 레슨 파일(u3l1~u3l5)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 129 / multi 15 / num 16 / word 0 · diff 64/64/32 · 시각 99(발주 실사 8장 포함).
// 규격·회피표·검산 기록 정본 = qa/u3-v2-blueprint.md, 이식 = qa/build-u3v2-lessons.mjs(재실행 가능).
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
