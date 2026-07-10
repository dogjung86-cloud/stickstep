// [임시 프리뷰] u3l1 적용 랩 시제품 — 본 커리큘럼 미부착.
// 새 레슨 공식 실험: 훅 → 발견 랩 → 개념 카드(recap) → 적용 랩(NEW, 복습) → 문제.
//   · 사용자 방향(2026-07): 적용 랩은 "개념 카드로 학습을 마친 뒤" 그 내용을 손으로 재조립하는
//     복습 활동 — 그래서 recap 뒤에 선다. recap의 CTA 문구만 연출 랩으로 이어지게 복제 수정한다.
// 확정 시: unit3.ts L1 steps에 directorLab 스텝을 이식하고 이 파일 + main.ts 프리뷰 분기를 삭제.
// 폐기 시: 이 파일, main.ts 분기, registry의 directorLab 두 줄, steps/directorLab.ts,
//          ui.css의 [임시 프리뷰] 블록, qa/preview-u3l1v2.mjs를 삭제하면 흔적이 남지 않는다.
import type { Lesson, Step } from "../lessons/types";
import { UNIT3 } from "./unit3";

export function previewU3L1(): Lesson {
  const base = UNIT3.lessons.find((l) => l.id === "u3l1")!;
  const steps: Step[] = [...base.steps];
  const applyStep: Step = {
    type: "directorLab",
    title: "지워진 입자 장면,<br>직접 연출해 볼까?",
    lead: "스틱맨 쌤의 ‘입자의 눈’ 카메라가 고장 나서, 편의점 음료들의 입자 장면이 몽땅 지워졌어요. 방금 카드에서 배운 대로 직접 연출해 주세요!",
    cta: "문제 풀기",
  };
  const at = steps.findIndex((st) => st.type === "recap");
  if (at >= 0) {
    // recap CTA가 "문제 풀기" 대신 연출 랩으로 이어지도록 — 원본 스텝 객체는 본 커리큘럼과 공유되므로 복제해서 바꾼다
    steps[at] = { ...steps[at], cta: "배운 대로 연출하기" };
    steps.splice(at + 1, 0, applyStep);
  } else {
    steps.push(applyStep);
  }
  return { ...base, id: "u3l1v2", subtitle: "적용 랩 시제품", steps };
}
