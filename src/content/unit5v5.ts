// 중1 Ⅴ 힘의 작용: 랩과 도입 재제작(v5). 주소에 ?u5v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit5.ts)을 베끼지 않는다. remakeUnit으로 도입과 랩 스텝만 바꿔 끼운다(개념, 정리, 문제, 만화는 정본 그대로).
// 설계 근거: design/u5v5-plan.md. 랩의 수치는 정본과 같다(용수철 4 cm에 2 N, 부력 20 N에서 14 N, 지구 29.4 N과 달 4.9 N).
import type { Unit } from "./curriculum";
import type { Step } from "../lessons/types";
import { UNIT5 } from "./unit5";
import { remakeUnit } from "./v5remake";
import { opener } from "./dsl";
import { U5_PARTS } from "./unit5v5parts";

const lab = (type: string) => (o: { title: string; cta?: string; curio?: unknown }): Step => ({ type, ...o }) as unknown as Step;
const arrowLab = lab("u5ArrowLab");
const sumLab = lab("u5SumLab");
const gravityLab = lab("u5GravityLab");
const springLab5 = lab("u5SpringLab");
const frictionLab = lab("u5FrictionLab");
const buoyLab = lab("u5BuoyLab");
const windLab = lab("u5WindLab");

// 남겨 쓰는 정본 문제의 해설에서 옛 랩의 이름을 가리키던 글귀만 맞춘다(개념, 정리, 새 문제는 unit5v5parts.ts).
// 스텝 객체를 고치지 않고 글자만 바꾼 새 객체를 만든다. 찾지 못한 글귀는 개발 서버 콘솔에 알린다.
type Pair = [string, string];
const retext = (pairs: Pair[]) => (steps: Step[]): Step[] => {
  const hit = new Set<string>();
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") {
      let out = v;
      for (const [a, b] of pairs) if (out.includes(a)) {
        out = out.split(a).join(b);
        hit.add(a);
      }
      return out;
    }
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  const out = steps.map((st) => ((st as unknown as { type: string }).type.startsWith("u5") || (st as unknown as { type: string }).type === "opener" ? st : (walk(st) as Step)));
  if (import.meta.env.DEV) for (const [a] of pairs) if (!hit.has(a)) console.warn(`[v5] u5: 맞출 글귀를 찾지 못했다: ${a}`);
  return out;
};

/** 레슨의 스텝을 도입(또는 만화) → 랩 → 개념 → 정리 → 문제로 다시 짠다. 앞의 둘은 이미 바꿔 끼운 것을 그대로 쓴다. */
const rebuild = (id: string) => (steps: Step[]): Step[] => {
  const part = U5_PARTS[id];
  const ri = steps.findIndex((st) => (st as unknown as { type: string }).type === "recap");
  if (!part || ri < 0) {
    if (import.meta.env.DEV) console.warn(`[v5] u5: ${id}의 정리 스텝을 찾지 못했다`);
    return steps;
  }
  const out = [...steps.slice(0, ri), ...(part.concept ? [part.concept] : []), part.recap, ...part.quiz(steps.slice(ri + 1))];
  if (import.meta.env.DEV && out.some((st) => !st)) console.warn(`[v5] u5: ${id}의 문제 구간에 빈 스텝이 있다(정본의 문제 수가 바뀌었다)`);
  return out.filter(Boolean);
};
const then = (...fns: Array<(steps: Step[]) => Step[]>) => (steps: Step[]): Step[] => fns.reduce((acc, fn) => fn(acc), steps);

export const UNIT5_V5: Unit | null = remakeUnit(UNIT5, {
  u5l1: {
    after: then(rebuild("u5l1")),
    intro: opener({ title: "당겼다 놓은 풍선은 어디로 갈까요?", scene: "u5-balloon", wait: "풍선 줄을 당겼다 놓아 보세요", cta: "실험실 열기" }),
    swap: { forceStudio: arrowLab({ title: "힘을 화살표로 어떻게 나타낼까요?", cta: "개념 정리하기" }) },
  },
  u5l2: {
    after: then(rebuild("u5l2")),
    intro: opener({ title: "세게 당기는데 왜 안 움직일까요?", scene: "u5-tug", wait: "더 세게 당기게 해 보세요", cta: "실험실 열기" }),
    swap: { tugOfWar: sumLab({ title: "두 힘을 합치면 얼마일까요?", cta: "개념 정리하기" }) },
  },
  u5l3: {
    after: then(retext([["행성 과수원에서 옆·아래에서 놓은 사과를 떠올려 봐요!", "실험에서 지구 옆과 아래에서 놓은 사과를 떠올려 봐요!"]]), rebuild("u5l3")),
    // 만화로 시작하는 레슨이라 도입은 그대로 둔다. 랩 끝의 궁금증 카드(우주 정거장)는 정본의 것을 이어 쓴다.
    swap: { gravityDrop: (old) => gravityLab({ title: "사과는 어느 쪽으로 떨어질까요?", cta: "개념 정리하기", curio: (old as unknown as { curio?: unknown }).curio }) },
  },
  u5l4: {
    after: then(rebuild("u5l4")),
    intro: opener({ title: "뒤로 당긴 화살은 왜 앞으로 갈까요?", scene: "u5-bow", wait: "두 가지로 쏴 보세요", cta: "실험실 열기" }),
    swap: { springLab: springLab5({ title: "늘일수록 힘은 어떻게 변할까요?", cta: "개념 정리하기" }) },
  },
  u5l5: {
    after: then(rebuild("u5l5")),
    intro: opener({ title: "썰매는 어느 길에서 멀리 갈까요?", scene: "u5-sled", wait: "두 길에서 밀어 보세요", cta: "실험실 열기" }),
    swap: { frictionPush: frictionLab({ title: "어떤 때 상자를 밀기 더 힘들까요?", cta: "개념 정리하기" }) },
  },
  u5l6: {
    after: then(rebuild("u5l6")),
    intro: opener({ title: "눌러 넣은 병은 어떻게 될까요?", scene: "u5-bottle", wait: "병을 눌렀다 놓아 보세요", cta: "실험실 열기" }),
    swap: { buoyancyLab: buoyLab({ title: "물에 담그면 눈금은 어떻게 될까요?", cta: "개념 정리하기" }) },
  },
  u5l7: {
    after: then(retext([["바람 축구장에서 바람(힘)을 거는 순간", "실험에서 바람(힘)을 보내는 순간"], ["실험실에서 건 바람과 똑같아요.", "실험에서 보낸 바람과 똑같아요."]]), rebuild("u5l7")),
    intro: opener({ title: "찬 공은 끝까지 굴러갈까요?", scene: "u5-roll", wait: "공을 차고 지켜보세요", cta: "실험실 열기" }),
    swap: { windSoccer: windLab({ title: "힘을 받으면 공은 어떻게 될까요?", cta: "개념 정리하기" }) },
  },
});
