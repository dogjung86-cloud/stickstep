// 중2 과학 VII. 전기와 자기 — 단원 종합 평가 문항 풀(150제 = 19×6 + 18×2, 8레슨).
// 문항은 레슨 파일(g2u7l1~g2u7l8)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성은 u3 규격 스케일: 113(mcq+multi) / 18(num) / 19(word). 18문항 레슨은 L2(정전기 유도)·
// L7(전류가 만드는 자기장) — 관찰 중심의 좁은 소단원. word 3문항 레슨은 L1·L3·L7.
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
