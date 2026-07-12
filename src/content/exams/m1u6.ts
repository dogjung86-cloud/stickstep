// 수학 중1 Ⅵ. 통계 — 단원 종합 평가 문항 풀(150제 = 25×6, 6레슨). 첫 수학 시험(수학 규격 1호).
// 문항은 레슨 파일(m1u6l1~m1u6l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성은 수학 규격 60/30/10%: 90(mcq+multi) / 45(num) / 15(word) — 과학 75/12/13과 달리
// 계산 단답(num)을 상향(통계·수학은 수치 단답이 자연스러운 문항이 많음), word는 용어 수가 적어 하향.
// 전 문항 diff(1 기초·2 표준·3 심화) 태그 = 파일당 10/10/5(전체 40/40/20%). 추출은 diff 미사용(레슨 균형 관행).
import type { ExamDef } from "./types";
import { POOL_M1U6L1 } from "./m1u6l1";
import { POOL_M1U6L2 } from "./m1u6l2";
import { POOL_M1U6L3 } from "./m1u6l3";
import { POOL_M1U6L4 } from "./m1u6l4";
import { POOL_M1U6L5 } from "./m1u6l5";
import { POOL_M1U6L6 } from "./m1u6l6";

export const M1U6_EXAM: ExamDef = {
  id: "m1u6exam",
  unitId: "m1u6",
  title: "통계",
  pick: 20,
  pool: [
    ...POOL_M1U6L1,
    ...POOL_M1U6L2,
    ...POOL_M1U6L3,
    ...POOL_M1U6L4,
    ...POOL_M1U6L5,
    ...POOL_M1U6L6,
  ],
};
