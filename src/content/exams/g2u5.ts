// 중2 과학 V. 식물과 에너지 · 단원 종합 평가 문항 풀 v2(160제 = 27x4 + 26x2, 6레슨 · 신규 출제).
// 문항은 레슨 파일(g2u5l1~g2u5l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 144 / multi 16 / num 0 / word 0 · diff 64/64/32 · 시각 112(도해·표·자료 상자·사진 18문항).
// 규격·회피표·검산 기록 정본 = qa/g2u5-v2-blueprint.md, 이식 = qa/build-g2u5v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_G2U5L1 } from "./g2u5l1";
import { POOL_G2U5L2 } from "./g2u5l2";
import { POOL_G2U5L3 } from "./g2u5l3";
import { POOL_G2U5L4 } from "./g2u5l4";
import { POOL_G2U5L5 } from "./g2u5l5";
import { POOL_G2U5L6 } from "./g2u5l6";

export const G2U5_EXAM: ExamDef = {
  id: "g2u5exam",
  unitId: "g2u5",
  title: "식물과 에너지",
  pick: 20,
  pool: [...POOL_G2U5L1, ...POOL_G2U5L2, ...POOL_G2U5L3, ...POOL_G2U5L4, ...POOL_G2U5L5, ...POOL_G2U5L6],
};
