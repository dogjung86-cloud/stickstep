// 중1 수학 III. 좌표평면과 그래프 단원 종합 평가(200제, 9레슨).
// 풀 등장 순서는 교과 진도 순서이며 응시당 20문항을 레슨 균형으로 추출한다.
// 유형 120/60/20(mcq+multi/num/word), diff 80/80/40. 추출 로직은 diff를 학생 화면에 쓰지 않는다.
import type { ExamDef } from "./types";
import { POOL_M1U3L1 } from "./m1u3l1";
import { POOL_M1U3L2 } from "./m1u3l2";
import { POOL_M1U3L3 } from "./m1u3l3";
import { POOL_M1U3L4 } from "./m1u3l4";
import { POOL_M1U3L5 } from "./m1u3l5";
import { POOL_M1U3L6 } from "./m1u3l6";
import { POOL_M1U3L7 } from "./m1u3l7";
import { POOL_M1U3L8 } from "./m1u3l8";
import { POOL_M1U3L9 } from "./m1u3l9";

export const M1U3_EXAM: ExamDef = {
  id: "m1u3exam",
  unitId: "m1u3",
  title: "좌표평면과 그래프",
  pick: 20,
  pool: [
    ...POOL_M1U3L1,
    ...POOL_M1U3L2,
    ...POOL_M1U3L3,
    ...POOL_M1U3L4,
    ...POOL_M1U3L5,
    ...POOL_M1U3L6,
    ...POOL_M1U3L7,
    ...POOL_M1U3L8,
    ...POOL_M1U3L9,
  ],
};
