// 중1 과학 II. 생물의 구성과 다양성 — 단원 종합 평가 문항 풀(120제 = 20×6).
// 문항은 레슨 파일(u2l1~u2l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: 80 mcq / 10 multi / 14 num / 16 word.
import type { ExamDef } from "./types";
import { POOL_U2L1 } from "./u2l1";
import { POOL_U2L2 } from "./u2l2";
import { POOL_U2L3 } from "./u2l3";
import { POOL_U2L4 } from "./u2l4";
import { POOL_U2L5 } from "./u2l5";
import { POOL_U2L6 } from "./u2l6";

export const U2_EXAM: ExamDef = {
  id: "u2exam",
  unitId: "u2",
  title: "생물의 구성과 다양성",
  pick: 20,
  pool: [
    ...POOL_U2L1,
    ...POOL_U2L2,
    ...POOL_U2L3,
    ...POOL_U2L4,
    ...POOL_U2L5,
    ...POOL_U2L6,
  ],
};
