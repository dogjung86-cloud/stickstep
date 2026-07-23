// 수학 중1 Ⅳ. 기본 도형: 단원 종합 평가 문항 풀(200제, 13레슨) — 2026-07 v2 재출제(교과서 준거).
// 유형 mcq 96/multi 26/num 78/word 0, diff 80/80/40, 그림 161. 정본 설계표 qa/m1u4-v2-blueprint.md. 풀 순서는 교과 진도 순서다.
import type { ExamDef } from "./types";
import { POOL_M1U4L1 } from "./m1u4l1";
import { POOL_M1U4L2 } from "./m1u4l2";
import { POOL_M1U4L3 } from "./m1u4l3";
import { POOL_M1U4L4 } from "./m1u4l4";
import { POOL_M1U4L5 } from "./m1u4l5";
import { POOL_M1U4L6 } from "./m1u4l6";
import { POOL_M1U4L7 } from "./m1u4l7";
import { POOL_M1U4L8 } from "./m1u4l8";
import { POOL_M1U4L9 } from "./m1u4l9";
import { POOL_M1U4L10 } from "./m1u4l10";
import { POOL_M1U4L11 } from "./m1u4l11";
import { POOL_M1U4L12 } from "./m1u4l12";
import { POOL_M1U4L13 } from "./m1u4l13";

export const M1U4_EXAM: ExamDef = {
  id: "m1u4exam",
  unitId: "m1u4",
  title: "기본 도형",
  pick: 20,
  pool: [
    ...POOL_M1U4L1,
    ...POOL_M1U4L2,
    ...POOL_M1U4L3,
    ...POOL_M1U4L4,
    ...POOL_M1U4L5,
    ...POOL_M1U4L6,
    ...POOL_M1U4L7,
    ...POOL_M1U4L8,
    ...POOL_M1U4L9,
    ...POOL_M1U4L10,
    ...POOL_M1U4L11,
    ...POOL_M1U4L12,
    ...POOL_M1U4L13,
  ],
};
