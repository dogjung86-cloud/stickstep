// 중1 사회 II. 아시아 · 단원 종합 평가 문항 풀 v1(160제 = 20x8 균등, 8레슨 · 사회 시험 2호).
// 문항은 레슨 파일(s1u2l1~l8)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 128(bogi 24) / multi 16 / num 0 / word 16 · diff 64/64/32 · 시각은 설계표 §4 정본.
// 규격·회피표·검산 기록 정본 = qa/s1u2-v1-blueprint.md, 이식 = qa/build-s1u2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_S1U2L1 } from "./s1u2l1";
import { POOL_S1U2L2 } from "./s1u2l2";
import { POOL_S1U2L3 } from "./s1u2l3";
import { POOL_S1U2L4 } from "./s1u2l4";
import { POOL_S1U2L5 } from "./s1u2l5";
import { POOL_S1U2L6 } from "./s1u2l6";
import { POOL_S1U2L7 } from "./s1u2l7";
import { POOL_S1U2L8 } from "./s1u2l8";

export const S1U2_EXAM: ExamDef = {
  id: "s1u2exam",
  unitId: "s1u2",
  title: "아시아",
  pick: 20,
  pool: [
    ...POOL_S1U2L1, ...POOL_S1U2L2, ...POOL_S1U2L3, ...POOL_S1U2L4,
    ...POOL_S1U2L5, ...POOL_S1U2L6, ...POOL_S1U2L7, ...POOL_S1U2L8,
  ],
};
