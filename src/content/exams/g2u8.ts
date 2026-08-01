// 중2 과학 VIII. 별과 우주 · 단원 종합 평가 문항 풀 v2(160제 = 21/18/21/19/20/22/20/19, 8레슨).
// 문항은 레슨 파일(g2u8l1~g2u8l8)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 136 / multi 16 / num 8 / word 0 · diff 64/64/32 · 시각 85(사진 37 포함) · bogi 합답 22.
// 규격·회피표·검산 기록 정본 = qa/g2u8-v2-blueprint.md, 이식 = qa/build-g2u8v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_G2U8L1 } from "./g2u8l1";
import { POOL_G2U8L2 } from "./g2u8l2";
import { POOL_G2U8L3 } from "./g2u8l3";
import { POOL_G2U8L4 } from "./g2u8l4";
import { POOL_G2U8L5 } from "./g2u8l5";
import { POOL_G2U8L6 } from "./g2u8l6";
import { POOL_G2U8L7 } from "./g2u8l7";
import { POOL_G2U8L8 } from "./g2u8l8";

export const G2U8_EXAM: ExamDef = {
  id: "g2u8exam",
  unitId: "g2u8",
  title: "별과 우주",
  pick: 20,
  pool: [
    ...POOL_G2U8L1,
    ...POOL_G2U8L2,
    ...POOL_G2U8L3,
    ...POOL_G2U8L4,
    ...POOL_G2U8L5,
    ...POOL_G2U8L6,
    ...POOL_G2U8L7,
    ...POOL_G2U8L8,
  ],
};
