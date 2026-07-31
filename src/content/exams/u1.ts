// 중1 과학 I. 과학과 인류의 지속가능한 삶 · 단원 종합 평가 문항 풀 v2(160제 = 32×5, 5레슨 · 신규 출제).
// 문항은 레슨 파일(u1l1~u1l5)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 135 / multi 25 / num 0 / word 0 · diff 64/64/32 · 시각 112(자료 상자·표·그래프·실사 15장).
// 규격·회피표·검산 기록 정본 = qa/u1-v2-blueprint.md, 이식 = qa/build-u1v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_U1L1 } from "./u1l1";
import { POOL_U1L2 } from "./u1l2";
import { POOL_U1L3 } from "./u1l3";
import { POOL_U1L4 } from "./u1l4";
import { POOL_U1L5 } from "./u1l5";

export const U1_EXAM: ExamDef = {
  id: "u1exam",
  unitId: "u1",
  title: "과학과 인류의 지속가능한 삶",
  pick: 20,
  pool: [...POOL_U1L1, ...POOL_U1L2, ...POOL_U1L3, ...POOL_U1L4, ...POOL_U1L5],
};
