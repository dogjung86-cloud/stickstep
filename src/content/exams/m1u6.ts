// 수학 중1 Ⅵ. 통계 · 단원 종합 평가 문항 풀(v2 재출제 200제, 배분 34/33/34/35/36/28 · 재출제 7호).
// 문항은 레슨 파일(m1u6l1~m1u6l6)에 살고, 정본은 스테이징 qa/m1u6v2-*.ts(수정 후
// node qa/build-m1u6v2-lessons.mjs 재이식). 설계 정본 = qa/m1u6-v2-blueprint.md.
// 규격 v2: mcq 104/multi 12/num 84/word 0(실측 판별 11.4% 준거 · 판별 상한 20) · diff 80/80/40 ·
// 시각자료(그림+표) 172/200 = 86%(자료는 문두 나열 금지 · 자료 상자 렌더) · 상대도수 num은 dec "소수로".
// 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준). 추출은 diff 미사용(레슨 균형 관행).
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
