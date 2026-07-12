// 수학 중1 Ⅴ. 평면도형과 입체도형: 단원 종합 평가 200문항 풀(14레슨), 응시당 20문항.
// 풀 등장 순서는 교과 진도 순서이며 drawExamItems가 레슨별로 균형 추출한다.
import type { ExamDef } from "./types";
import { POOL_M1U5L1 } from "./m1u5l1";
import { POOL_M1U5L2 } from "./m1u5l2";
import { POOL_M1U5L3 } from "./m1u5l3";
import { POOL_M1U5L4 } from "./m1u5l4";
import { POOL_M1U5L5 } from "./m1u5l5";
import { POOL_M1U5L6 } from "./m1u5l6";
import { POOL_M1U5L7 } from "./m1u5l7";
import { POOL_M1U5L8 } from "./m1u5l8";
import { POOL_M1U5L9 } from "./m1u5l9";
import { POOL_M1U5L10 } from "./m1u5l10";
import { POOL_M1U5L11 } from "./m1u5l11";
import { POOL_M1U5L12 } from "./m1u5l12";
import { POOL_M1U5L13 } from "./m1u5l13";
import { POOL_M1U5L14 } from "./m1u5l14";

export const M1U5_EXAM: ExamDef = {
  id: "m1u5exam",
  unitId: "m1u5",
  title: "평면도형과 입체도형",
  pick: 20,
  pool: [
    ...POOL_M1U5L1,
    ...POOL_M1U5L2,
    ...POOL_M1U5L3,
    ...POOL_M1U5L4,
    ...POOL_M1U5L5,
    ...POOL_M1U5L6,
    ...POOL_M1U5L7,
    ...POOL_M1U5L8,
    ...POOL_M1U5L9,
    ...POOL_M1U5L10,
    ...POOL_M1U5L11,
    ...POOL_M1U5L12,
    ...POOL_M1U5L13,
    ...POOL_M1U5L14,
  ],
};
