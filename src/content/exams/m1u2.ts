// 중1 II. 문자와 식 단원 종합 평가 200제(9레슨).
// 유형 120(mcq+multi)/60(num)/20(word), diff 80/80/40. 풀 순서는 교과 진도 순서다.
import type { ExamDef } from "./types";
import { POOL_M1U2L1 } from "./m1u2l1";
import { POOL_M1U2L2 } from "./m1u2l2";
import { POOL_M1U2L3 } from "./m1u2l3";
import { POOL_M1U2L4 } from "./m1u2l4";
import { POOL_M1U2L5 } from "./m1u2l5";
import { POOL_M1U2L6 } from "./m1u2l6";
import { POOL_M1U2L7 } from "./m1u2l7";
import { POOL_M1U2L8 } from "./m1u2l8";
import { POOL_M1U2L9 } from "./m1u2l9";

export const M1U2_EXAM: ExamDef = {
  id: "m1u2exam",
  unitId: "m1u2",
  title: "문자와 식",
  pick: 20,
  pool: [
    ...POOL_M1U2L1,
    ...POOL_M1U2L2,
    ...POOL_M1U2L3,
    ...POOL_M1U2L4,
    ...POOL_M1U2L5,
    ...POOL_M1U2L6,
    ...POOL_M1U2L7,
    ...POOL_M1U2L8,
    ...POOL_M1U2L9,
  ],
};
