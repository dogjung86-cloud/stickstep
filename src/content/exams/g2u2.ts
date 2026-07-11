// 중2 과학 II. 지권의 변화 — 단원 종합 평가 문항 풀(150제 = 17×6 + 16×3, 9레슨).
// 문항은 레슨 파일(g2u2l1~g2u2l9)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성은 u3 규격 스케일: 113(mcq+multi) / 18(num) / 19(word).
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
