// 중2 과학 III. 빛과 파동 — 단원 종합 평가 문항 풀(150제 = 19×6 + 18×2, 8레슨).
// 문항은 레슨 파일(g2u3l1~g2u3l8)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성은 u3 규격 스케일: 113(mcq+multi) / 18(num) / 19(word). 18문항 레슨은 L3(보는 과정)·L4(평면거울).
import type { ExamDef } from "./types";
import { POOL_G2U3L1 } from "./g2u3l1";
import { POOL_G2U3L2 } from "./g2u3l2";
import { POOL_G2U3L3 } from "./g2u3l3";
import { POOL_G2U3L4 } from "./g2u3l4";
import { POOL_G2U3L5 } from "./g2u3l5";
import { POOL_G2U3L6 } from "./g2u3l6";
import { POOL_G2U3L7 } from "./g2u3l7";
import { POOL_G2U3L8 } from "./g2u3l8";

export const G2U3_EXAM: ExamDef = {
  id: "g2u3exam",
  unitId: "g2u3",
  title: "빛과 파동",
  pick: 20,
  pool: [
    ...POOL_G2U3L1,
    ...POOL_G2U3L2,
    ...POOL_G2U3L3,
    ...POOL_G2U3L4,
    ...POOL_G2U3L5,
    ...POOL_G2U3L6,
    ...POOL_G2U3L7,
    ...POOL_G2U3L8,
  ],
};
