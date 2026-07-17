// 중2 수학 Ⅵ. 확률 단원 종합 평가 200제(9레슨, 22×7+23×2 — 23은 L8·L9).
// 유형 120(mcq+multi)/60(num)/20(word), diff 80/80/40. 풀 순서는 교과 진도 순서다.
// num은 L1~L3 int(경우의 수, "가지")·L4~L8 frac(기약분수 — numKind frac 첫 도입)·L9 dec(소수).
import type { ExamDef } from "./types";
import { POOL_M2U6L1 } from "./m2u6l1";
import { POOL_M2U6L2 } from "./m2u6l2";
import { POOL_M2U6L3 } from "./m2u6l3";
import { POOL_M2U6L4 } from "./m2u6l4";
import { POOL_M2U6L5 } from "./m2u6l5";
import { POOL_M2U6L6 } from "./m2u6l6";
import { POOL_M2U6L7 } from "./m2u6l7";
import { POOL_M2U6L8 } from "./m2u6l8";
import { POOL_M2U6L9 } from "./m2u6l9";

export const M2U6_EXAM: ExamDef = {
  id: "m2u6exam",
  unitId: "m2u6",
  title: "확률",
  pick: 20,
  pool: [
    ...POOL_M2U6L1,
    ...POOL_M2U6L2,
    ...POOL_M2U6L3,
    ...POOL_M2U6L4,
    ...POOL_M2U6L5,
    ...POOL_M2U6L6,
    ...POOL_M2U6L7,
    ...POOL_M2U6L8,
    ...POOL_M2U6L9,
  ],
};
