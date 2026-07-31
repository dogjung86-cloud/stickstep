// 중1 과학 IV. 물질의 상태 변화 · 단원 종합 평가 문항 풀 v2(160제 = 27×4+26×2, 6레슨 · 재출제 9호).
// 문항은 레슨 파일(u4l1~u4l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 142 / multi 18 / num 0 / word 0 · diff 64/64/32 · 시각 92(사진 8장 전량 재사용).
// 규격·회피표·검산 기록 정본 = qa/u4-v2-blueprint.md, 이식 = qa/build-u4v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_U4L1 } from "./u4l1";
import { POOL_U4L2 } from "./u4l2";
import { POOL_U4L3 } from "./u4l3";
import { POOL_U4L4 } from "./u4l4";
import { POOL_U4L5 } from "./u4l5";
import { POOL_U4L6 } from "./u4l6";

export const U4_EXAM: ExamDef = {
  id: "u4exam",
  unitId: "u4",
  title: "물질의 상태 변화",
  pick: 20,
  pool: [...POOL_U4L1, ...POOL_U4L2, ...POOL_U4L3, ...POOL_U4L4, ...POOL_U4L5, ...POOL_U4L6],
};
