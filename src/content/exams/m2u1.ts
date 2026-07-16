// 수학 중2 Ⅰ. 유리수의 표현과 식의 계산 — 단원 종합 평가 문항 풀(200제 = 20×10, 10레슨). 첫 중2 수학 시험.
// 문항은 레슨 파일(m2u1l1~m2u1l10)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성은 60/30/10%: 120(mcq+multi) / 60(num) / 20(word) — m1u1(54/36/10)을 따르지 않은 근거:
// L5~L10의 답이 "식"이라 넘패드(int/dec)로 못 받는 문항이 많음. num 30%는 지수·계수 부품 규약으로 유지.
// 레슨당 쿼터 균일: mcq+multi 12(mcq 9~10 + multi 2~3) / num 6 / word 2.
// 전 문항 diff(1 기초·2 표준·3 심화) = 레슨당 8/8/4 (전체 80/80/40 = 40/40/20%).
import type { ExamDef } from "./types";
import { POOL_M2U1L1 } from "./m2u1l1";
import { POOL_M2U1L2 } from "./m2u1l2";
import { POOL_M2U1L3 } from "./m2u1l3";
import { POOL_M2U1L4 } from "./m2u1l4";
import { POOL_M2U1L5 } from "./m2u1l5";
import { POOL_M2U1L6 } from "./m2u1l6";
import { POOL_M2U1L7 } from "./m2u1l7";
import { POOL_M2U1L8 } from "./m2u1l8";
import { POOL_M2U1L9 } from "./m2u1l9";
import { POOL_M2U1L10 } from "./m2u1l10";

export const M2U1_EXAM: ExamDef = {
  id: "m2u1exam",
  unitId: "m2u1",
  title: "유리수의 표현과 식의 계산",
  pick: 20,
  pool: [
    ...POOL_M2U1L1,
    ...POOL_M2U1L2,
    ...POOL_M2U1L3,
    ...POOL_M2U1L4,
    ...POOL_M2U1L5,
    ...POOL_M2U1L6,
    ...POOL_M2U1L7,
    ...POOL_M2U1L8,
    ...POOL_M2U1L9,
    ...POOL_M2U1L10,
  ],
};
