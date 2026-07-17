// 중2 수학 Ⅳ. 삼각형과 사각형의 성질 단원 종합 평가 200제(10레슨, 20×10 균일 — m2u3 배분 정확 계승).
// 유형 120(mcq+multi)/60(num)/20(word) — mcq/multi 분할은 10+2×8, 9+3×2(l7·l9).
// diff 80/80/40. 풀 순서는 교과 진도 순서다. 기하 풀이라 mfmt 미사용(gsym·유니코드 리터럴).
import type { ExamDef } from "./types";
import { POOL_M2U4L1 } from "./m2u4l1";
import { POOL_M2U4L2 } from "./m2u4l2";
import { POOL_M2U4L3 } from "./m2u4l3";
import { POOL_M2U4L4 } from "./m2u4l4";
import { POOL_M2U4L5 } from "./m2u4l5";
import { POOL_M2U4L6 } from "./m2u4l6";
import { POOL_M2U4L7 } from "./m2u4l7";
import { POOL_M2U4L8 } from "./m2u4l8";
import { POOL_M2U4L9 } from "./m2u4l9";
import { POOL_M2U4L10 } from "./m2u4l10";

export const M2U4_EXAM: ExamDef = {
  id: "m2u4exam",
  unitId: "m2u4",
  title: "삼각형과 사각형의 성질",
  pick: 20,
  pool: [
    ...POOL_M2U4L1,
    ...POOL_M2U4L2,
    ...POOL_M2U4L3,
    ...POOL_M2U4L4,
    ...POOL_M2U4L5,
    ...POOL_M2U4L6,
    ...POOL_M2U4L7,
    ...POOL_M2U4L8,
    ...POOL_M2U4L9,
    ...POOL_M2U4L10,
  ],
};
