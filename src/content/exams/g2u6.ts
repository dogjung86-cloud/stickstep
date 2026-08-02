// 중2 과학 VI. 동물과 에너지 · 단원 종합 평가 문항 풀 v2(160제 = 27×4 + 26×2, 6레슨 · 신규 출제).
// 문항은 레슨 파일(g2u6l1~g2u6l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 144(합답형 bogi 28) / multi 16 / num 0 / word 0 · diff 64/64/32 · 시각 116(72.5%).
// 규격·회피표·검산 기록 정본 = qa/g2u6-v2-blueprint.md, 이식 = qa/build-g2u6v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_G2U6L1 } from "./g2u6l1";
import { POOL_G2U6L2 } from "./g2u6l2";
import { POOL_G2U6L3 } from "./g2u6l3";
import { POOL_G2U6L4 } from "./g2u6l4";
import { POOL_G2U6L5 } from "./g2u6l5";
import { POOL_G2U6L6 } from "./g2u6l6";

export const G2U6_EXAM: ExamDef = {
  id: "g2u6exam",
  unitId: "g2u6",
  title: "동물과 에너지",
  pick: 20,
  pool: [...POOL_G2U6L1, ...POOL_G2U6L2, ...POOL_G2U6L3, ...POOL_G2U6L4, ...POOL_G2U6L5, ...POOL_G2U6L6],
};
