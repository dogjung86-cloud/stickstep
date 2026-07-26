// 중2 과학 VII. 전기와 자기 · 단원 종합 평가 문항 풀 v2(160제 = 20×8, 8레슨 · 재출제 2호).
// 문항은 레슨 파일(g2u7l1~g2u7l8)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 124 / multi 16 / num 20 / word 0 · diff 64/64/32 · 그림 91(사진 12장 재사용).
// 규격·회피표·검산 기록 정본 = qa/g2u7-v2-blueprint.md, 이식 = qa/build-g2u7v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_G2U7L1 } from "./g2u7l1";
import { POOL_G2U7L2 } from "./g2u7l2";
import { POOL_G2U7L3 } from "./g2u7l3";
import { POOL_G2U7L4 } from "./g2u7l4";
import { POOL_G2U7L5 } from "./g2u7l5";
import { POOL_G2U7L6 } from "./g2u7l6";
import { POOL_G2U7L7 } from "./g2u7l7";
import { POOL_G2U7L8 } from "./g2u7l8";

export const G2U7_EXAM: ExamDef = {
  id: "g2u7exam",
  unitId: "g2u7",
  title: "전기와 자기",
  pick: 20,
  pool: [
    ...POOL_G2U7L1,
    ...POOL_G2U7L2,
    ...POOL_G2U7L3,
    ...POOL_G2U7L4,
    ...POOL_G2U7L5,
    ...POOL_G2U7L6,
    ...POOL_G2U7L7,
    ...POOL_G2U7L8,
  ],
};
