// 중2 수학 Ⅴ. 도형의 닮음과 피타고라스 정리 단원 종합 평가 200제(11레슨, 19×2+18×9 · 첫 비균일 배분).
// 유형 120(mcq+multi)/60(num)/20(word) · 19문항은 L4·L10(두 기둥, word 1), 상세 배분은 check specs가 정본.
// diff 80/80/40. 풀 순서는 교과 진도 순서다. 기하 풀이라 mfmt 미사용(gsym·유니코드 리터럴).
// √ 금지 단원 · num 전부 자연수(피타고라스 수치는 트리플 풀+자연수 배수 가족만).
import type { ExamDef } from "./types";
import { POOL_M2U5L1 } from "./m2u5l1";
import { POOL_M2U5L2 } from "./m2u5l2";
import { POOL_M2U5L3 } from "./m2u5l3";
import { POOL_M2U5L4 } from "./m2u5l4";
import { POOL_M2U5L5 } from "./m2u5l5";
import { POOL_M2U5L6 } from "./m2u5l6";
import { POOL_M2U5L7 } from "./m2u5l7";
import { POOL_M2U5L8 } from "./m2u5l8";
import { POOL_M2U5L9 } from "./m2u5l9";
import { POOL_M2U5L10 } from "./m2u5l10";
import { POOL_M2U5L11 } from "./m2u5l11";

export const M2U5_EXAM: ExamDef = {
  id: "m2u5exam",
  unitId: "m2u5",
  title: "도형의 닮음과 피타고라스 정리",
  pick: 20,
  pool: [
    ...POOL_M2U5L1,
    ...POOL_M2U5L2,
    ...POOL_M2U5L3,
    ...POOL_M2U5L4,
    ...POOL_M2U5L5,
    ...POOL_M2U5L6,
    ...POOL_M2U5L7,
    ...POOL_M2U5L8,
    ...POOL_M2U5L9,
    ...POOL_M2U5L10,
    ...POOL_M2U5L11,
  ],
};
