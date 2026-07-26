// 중2 과학 II. 지권의 변화 — 단원 종합 평가 문항 풀 v2(160제 = 18×7 + 17×2, 9레슨 — 17은 L4·L5).
// 문항은 레슨 파일(g2u2l1~g2u2l9)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 2026-07 교과서 준거 재출제 1호: mcq 140/multi 20/num 0/word 0 — 정본 기록은 qa/g2u2-v2-blueprint.md.
import type { ExamDef } from "./types";
import { POOL_G2U2L1 } from "./g2u2l1";
import { POOL_G2U2L2 } from "./g2u2l2";
import { POOL_G2U2L3 } from "./g2u2l3";
import { POOL_G2U2L4 } from "./g2u2l4";
import { POOL_G2U2L5 } from "./g2u2l5";
import { POOL_G2U2L6 } from "./g2u2l6";
import { POOL_G2U2L7 } from "./g2u2l7";
import { POOL_G2U2L8 } from "./g2u2l8";
import { POOL_G2U2L9 } from "./g2u2l9";

export const G2U2_EXAM: ExamDef = {
  id: "g2u2exam",
  unitId: "g2u2",
  title: "지권의 변화",
  pick: 20,
  pool: [
    ...POOL_G2U2L1,
    ...POOL_G2U2L2,
    ...POOL_G2U2L3,
    ...POOL_G2U2L4,
    ...POOL_G2U2L5,
    ...POOL_G2U2L6,
    ...POOL_G2U2L7,
    ...POOL_G2U2L8,
    ...POOL_G2U2L9,
  ],
};
