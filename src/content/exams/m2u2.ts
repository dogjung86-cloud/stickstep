// 중2 수학 Ⅱ. 부등식과 연립방정식 단원 종합 평가 200제(9레슨, 22×7+23×2 — 23은 L8·L9).
// 유형 120(mcq+multi)/60(num)/20(word), diff 80/80/40. 풀 순서는 교과 진도 순서다.
import type { ExamDef } from "./types";
import { POOL_M2U2L1 } from "./m2u2l1";
import { POOL_M2U2L2 } from "./m2u2l2";
import { POOL_M2U2L3 } from "./m2u2l3";
import { POOL_M2U2L4 } from "./m2u2l4";
import { POOL_M2U2L5 } from "./m2u2l5";
import { POOL_M2U2L6 } from "./m2u2l6";
import { POOL_M2U2L7 } from "./m2u2l7";
import { POOL_M2U2L8 } from "./m2u2l8";
import { POOL_M2U2L9 } from "./m2u2l9";

export const M2U2_EXAM: ExamDef = {
  id: "m2u2exam",
  unitId: "m2u2",
  title: "부등식과 연립방정식",
  pick: 20,
  pool: [
    ...POOL_M2U2L1,
    ...POOL_M2U2L2,
    ...POOL_M2U2L3,
    ...POOL_M2U2L4,
    ...POOL_M2U2L5,
    ...POOL_M2U2L6,
    ...POOL_M2U2L7,
    ...POOL_M2U2L8,
    ...POOL_M2U2L9,
  ],
};
