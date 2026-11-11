// 중1 과학 v5(랩과 도입 재제작): 정본 단원에서 도입과 랩 스텝만 바꿔 끼운 새 단원을 만든다(2026-11-12).
// 단원 파일을 통째로 베끼지 않는다. 개념, 정리, 문제, 만화는 정본의 스텝 객체를 그대로 쓰므로
// 다른 세션이 정본의 글을 고쳐도 v5에 그대로 따라온다. 정본 단원과 레슨 객체는 건드리지 않는다(새 객체를 만든다).
//
//   export const UNIT3_V5: Unit | null = remakeUnit(UNIT3, {
//     u3l1: { intro: opener({ ... }), swap: { heatParticles: tempLab({ ... }) } },
//     u3l3: { swap: { conduction: [labA, labB], radiation: null } },   // 여러 개로 바꾸거나(null) 빼기
//     u3l4: { swap: { specificHeat: (old, i) => (i === 0 ? labC : null) }, after: (steps) => steps },
//   });
//
// intro: 레슨의 첫 스텝이 hook일 때만 바꾼다(만화로 시작하는 레슨은 그대로 둔다).
// swap : 옛 스텝의 type 이름 → 새 스텝. 한 레슨에 같은 type이 여럿이면 함수로 몇 번째인지(i) 받아 가른다.
// after: 그 밖의 손질(랩이 바뀌어 어긋난 문장 하나를 맞추는 일 등). 받은 배열을 고치지 말고 새 배열을 돌려준다.
// 바꿀 스텝을 찾지 못하면 개발 서버 콘솔에 [v5]로 알린다(정본이 바뀌어 어긋난 것을 알아채기 위해서다).
import type { Lesson, Step } from "../lessons/types";

export type V5Swap = Step | Step[] | null | ((old: Step, i: number) => Step | Step[] | null);
export interface V5LessonPlan {
  intro?: Step;
  swap?: Record<string, V5Swap>;
  after?: (steps: Step[]) => Step[];
}

const warn = (msg: string): void => {
  if ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) console.warn(`[v5] ${msg}`);
};

export function remakeUnit<U extends { lessons: Lesson[] }>(base: U, plan: Record<string, V5LessonPlan>): U {
  for (const id of Object.keys(plan)) if (!base.lessons.some((l) => l.id === id)) warn(`정본에 없는 레슨: ${id}`);
  return {
    ...base,
    lessons: base.lessons.map((lesson) => {
      const p = plan[lesson.id];
      if (!p) return lesson;
      const seen: Record<string, number> = {};
      let steps: Step[] = [];
      lesson.steps.forEach((step, idx) => {
        if (idx === 0 && p.intro && step.type === "hook") {
          steps.push(p.intro);
          return;
        }
        const rule = p.swap?.[step.type];
        if (rule === undefined) {
          steps.push(step);
          return;
        }
        const i = seen[step.type] ?? 0;
        seen[step.type] = i + 1;
        const next = typeof rule === "function" ? rule(step, i) : rule;
        if (next) steps.push(...(Array.isArray(next) ? next : [next]));
      });
      if (p.intro && lesson.steps[0]?.type !== "hook") warn(`${lesson.id}: 첫 스텝이 hook이 아니라 도입을 바꾸지 않았다`);
      for (const type of Object.keys(p.swap ?? {})) if (!seen[type]) warn(`${lesson.id}: 바꿀 스텝(${type})을 찾지 못했다`);
      if (p.after) steps = p.after(steps);
      return { ...lesson, steps };
    }),
  };
}
