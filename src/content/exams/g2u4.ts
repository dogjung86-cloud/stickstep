// 중2 과학 IV. 물질의 구성 — 단원 종합 평가 문항 풀(150제 = 25×6, 6레슨).
// 문항은 레슨 파일(g2u4l1~g2u4l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성은 u3 규격 스케일: 113(mcq+multi) / 18(num) / 19(word). word 4문항 레슨은 L6(이온의 이동).
import type { ExamDef } from "./types";
import { POOL_G2U4L1 } from "./g2u4l1";
import { POOL_G2U4L2 } from "./g2u4l2";
import { POOL_G2U4L3 } from "./g2u4l3";
import { POOL_G2U4L4 } from "./g2u4l4";
import { POOL_G2U4L5 } from "./g2u4l5";
import { POOL_G2U4L6 } from "./g2u4l6";

export const G2U4_EXAM: ExamDef = {
  id: "g2u4exam",
  unitId: "g2u4",
  title: "물질의 구성",
  pick: 20,
  pool: [
    ...POOL_G2U4L1,
    ...POOL_G2U4L2,
    ...POOL_G2U4L3,
    ...POOL_G2U4L4,
    ...POOL_G2U4L5,
    ...POOL_G2U4L6,
  ],
};
