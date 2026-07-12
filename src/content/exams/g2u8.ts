// 중2 과학 VIII. 별과 우주 — 단원 종합 평가 문항 풀(150제 = 19×6 + 18×2, 8레슨).
// 문항은 레슨 파일(g2u8l1~g2u8l8)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성은 u3 규격 스케일: 113(mcq+multi) / 18(num) / 19(word). 18문항 레슨은 L4(색과 표면 온도)·
// L8(우주 탐사) — 단일 규칙·지식 나열형의 좁은 소단원. word 4문항 레슨은 L5·L6(용어 밀집 소단원).
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
