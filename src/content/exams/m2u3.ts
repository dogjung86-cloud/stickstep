// 중2 수학 Ⅲ. 일차함수 단원 종합 평가 200제(10레슨, 20×10 균일 — m2u1 배분 정확 계승).
// 유형 120(mcq+multi)/60(num)/20(word) — mcq/multi 분할은 10+2×8, 9+3×2(l6·l9).
// diff 80/80/40. 풀 순서는 교과 진도 순서다.
import type { ExamDef } from "./types";
import { POOL_M2U3L1 } from "./m2u3l1";
import { POOL_M2U3L2 } from "./m2u3l2";
import { POOL_M2U3L3 } from "./m2u3l3";
import { POOL_M2U3L4 } from "./m2u3l4";
import { POOL_M2U3L5 } from "./m2u3l5";
import { POOL_M2U3L6 } from "./m2u3l6";
import { POOL_M2U3L7 } from "./m2u3l7";
import { POOL_M2U3L8 } from "./m2u3l8";
import { POOL_M2U3L9 } from "./m2u3l9";
import { POOL_M2U3L10 } from "./m2u3l10";

export const M2U3_EXAM: ExamDef = {
  id: "m2u3exam",
  unitId: "m2u3",
  title: "일차함수",
  pick: 20,
  pool: [
    ...POOL_M2U3L1,
    ...POOL_M2U3L2,
    ...POOL_M2U3L3,
    ...POOL_M2U3L4,
    ...POOL_M2U3L5,
    ...POOL_M2U3L6,
    ...POOL_M2U3L7,
    ...POOL_M2U3L8,
    ...POOL_M2U3L9,
    ...POOL_M2U3L10,
  ],
};
