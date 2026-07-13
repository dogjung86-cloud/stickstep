// 수학 중1 Ⅰ. 수와 연산 — 단원 종합 평가 문항 풀(200제 = 17×8+16×4, 12레슨). 첫 200제 풀.
// 문항은 레슨 파일(m1u1l1~m1u1l12)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성은 54/36/10%: 108(mcq+multi) / 72(num) / 20(word) — m1u6 수학 규격(60/30/10)에서
// num 상향(수와 연산은 전 레슨이 자연수·정수 단답을 낳는 계산 단원, 넘패드 ± 키로 음수 정답 지원).
// 레슨당 쿼터 균일: 17문항 = 9(mcq+multi)/6(num)/2(word) · 16문항 = 9/6/1 (16문항 = L2·L5·L7·L9).
// 전 문항 diff(1 기초·2 표준·3 심화) = 17레슨 7/7/3 · 16레슨 6/6/4 (전체 80/80/40 = 40/40/20%).
import type { ExamDef } from "./types";
import { POOL_M1U1L1 } from "./m1u1l1";
import { POOL_M1U1L2 } from "./m1u1l2";
import { POOL_M1U1L3 } from "./m1u1l3";
import { POOL_M1U1L4 } from "./m1u1l4";
import { POOL_M1U1L5 } from "./m1u1l5";
import { POOL_M1U1L6 } from "./m1u1l6";
import { POOL_M1U1L7 } from "./m1u1l7";
import { POOL_M1U1L8 } from "./m1u1l8";
import { POOL_M1U1L9 } from "./m1u1l9";
import { POOL_M1U1L10 } from "./m1u1l10";
import { POOL_M1U1L11 } from "./m1u1l11";
import { POOL_M1U1L12 } from "./m1u1l12";

export const M1U1_EXAM: ExamDef = {
  id: "m1u1exam",
  unitId: "m1u1",
  title: "수와 연산",
  pick: 20,
  pool: [
    ...POOL_M1U1L1,
    ...POOL_M1U1L2,
    ...POOL_M1U1L3,
    ...POOL_M1U1L4,
    ...POOL_M1U1L5,
    ...POOL_M1U1L6,
    ...POOL_M1U1L7,
    ...POOL_M1U1L8,
    ...POOL_M1U1L9,
    ...POOL_M1U1L10,
    ...POOL_M1U1L11,
    ...POOL_M1U1L12,
  ],
};
