// 중2 과학 I. 물질의 특성 — 단원 종합 평가 문항 풀(150제 = 17×6 + 16×3, 9레슨).
// 문항은 레슨 파일(g2u1l1~g2u1l9)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성은 u3 규격 스케일: 113(mcq+multi) / 18(num) / 19(word).
import type { ExamDef } from "./types";
import { POOL_G2U1L1 } from "./g2u1l1";
import { POOL_G2U1L2 } from "./g2u1l2";
import { POOL_G2U1L3 } from "./g2u1l3";
import { POOL_G2U1L4 } from "./g2u1l4";
import { POOL_G2U1L5 } from "./g2u1l5";
import { POOL_G2U1L6 } from "./g2u1l6";
import { POOL_G2U1L7 } from "./g2u1l7";
import { POOL_G2U1L8 } from "./g2u1l8";
import { POOL_G2U1L9 } from "./g2u1l9";

export const G2U1_EXAM: ExamDef = {
  id: "g2u1exam",
  unitId: "g2u1",
  title: "물질의 특성",
  pick: 20,
  pool: [
    ...POOL_G2U1L1,
    ...POOL_G2U1L2,
    ...POOL_G2U1L3,
    ...POOL_G2U1L4,
    ...POOL_G2U1L5,
    ...POOL_G2U1L6,
    ...POOL_G2U1L7,
    ...POOL_G2U1L8,
    ...POOL_G2U1L9,
  ],
};
