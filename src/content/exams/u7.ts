// 중1 과학 VII. 태양계 · 단원 종합 평가 문항 풀 v2(160제 = 27×4+26×2, 6레슨 · 재출제 3호).
// 문항은 레슨 파일(u7l1~u7l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 140 / multi 18 / num 2 / word 0 · diff 64/64/32 · 시각 106(사진 재사용+신규 NASA 9).
// 규격·회피표·검산 기록 정본 = qa/u7-v2-blueprint.md, 이식 = qa/build-u7v2-lessons.mjs(재실행 가능).
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
