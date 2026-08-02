// 중1 과학 Ⅱ. 생물의 구성과 다양성 · 단원 종합 평가 문항 풀 v2(160제 = 16×10, 레슨 1:1).
// 문항은 레슨 파일(u2l1~u2l10)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 140 / multi 20 / num 0 / word 0 · diff 64/64/32 · 시각 100(도해·순서도·검색표·분포 자료·실사).
// 구 풀 120제(u2e01~e120 · 6파일)는 2026-08 전량 폐기 · id 대역을 e201~e360으로 분리했다.
// 규격·회피표·검산 기록 정본 = qa/u2-v2-blueprint.md, 이식 = qa/build-u2v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_U2L1 } from "./u2l1";
import { POOL_U2L2 } from "./u2l2";
import { POOL_U2L3 } from "./u2l3";
import { POOL_U2L4 } from "./u2l4";
import { POOL_U2L5 } from "./u2l5";
import { POOL_U2L6 } from "./u2l6";
import { POOL_U2L7 } from "./u2l7";
import { POOL_U2L8 } from "./u2l8";
import { POOL_U2L9 } from "./u2l9";
import { POOL_U2L10 } from "./u2l10";

export const U2_EXAM: ExamDef = {
  id: "u2exam",
  unitId: "u2",
  title: "생물의 구성과 다양성",
  pick: 20,
  pool: [...POOL_U2L1, ...POOL_U2L2, ...POOL_U2L3, ...POOL_U2L4, ...POOL_U2L5, ...POOL_U2L6, ...POOL_U2L7, ...POOL_U2L8, ...POOL_U2L9, ...POOL_U2L10],
};
