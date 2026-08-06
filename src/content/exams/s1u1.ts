// 중1 사회 I. 세계화 시대, 지리의 힘 · 단원 종합 평가 문항 풀 v1(160제 = 27x4+26x2, 6레슨 · 사회 첫 시험).
// 문항은 레슨 파일(s1u1l1~l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 128(bogi 24) / multi 16 / num 0 / word 16 · diff 64/64/32 · 시각은 설계표 §4 정본.
// 규격·회피표·검산 기록 정본 = qa/s1u1-v1-blueprint.md, 이식 = qa/build-s1u1-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_S1U1L1 } from "./s1u1l1";
import { POOL_S1U1L2 } from "./s1u1l2";
import { POOL_S1U1L3 } from "./s1u1l3";
import { POOL_S1U1L4 } from "./s1u1l4";
import { POOL_S1U1L5 } from "./s1u1l5";
import { POOL_S1U1L6 } from "./s1u1l6";

export const S1U1_EXAM: ExamDef = {
  id: "s1u1exam",
  unitId: "s1u1",
  title: "세계화 시대, 지리의 힘",
  pick: 20,
  pool: [...POOL_S1U1L1, ...POOL_S1U1L2, ...POOL_S1U1L3, ...POOL_S1U1L4, ...POOL_S1U1L5, ...POOL_S1U1L6],
};
