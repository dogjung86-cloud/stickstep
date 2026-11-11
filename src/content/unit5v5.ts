// 중1 Ⅴ 힘의 작용: 랩과 도입 재제작(v5). 주소에 ?u5v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit5.ts)을 베끼지 않는다. remakeUnit으로 도입과 랩 스텝만 바꿔 끼운다(개념, 정리, 문제, 만화는 정본 그대로).
// 설계 근거: design/u5v5-plan.md. 랩의 수치는 정본과 같다(용수철 4 cm에 2 N, 부력 20 N에서 14 N, 지구 29.4 N과 달 4.9 N).
import type { Unit } from "./curriculum";
import type { Step } from "../lessons/types";
import { UNIT5 } from "./unit5";
import { remakeUnit } from "./v5remake";
import { opener } from "./dsl";

const lab = (type: string) => (o: { title: string; cta?: string; curio?: unknown }): Step => ({ type, ...o }) as unknown as Step;
const forceLab = lab("u5ForceLab");
const tugLab = lab("u5TugLab");
const gravityLab = lab("u5GravityLab");
const springLab5 = lab("u5SpringLab");
const frictionLab = lab("u5FrictionLab");
const buoyLab = lab("u5BuoyLab");
const windLab = lab("u5WindLab");

// 랩이 바뀌어 어긋난 문장만 맞춘다(정본의 정리와 해설이 옛 랩의 이름과 화살표 색을 가리키던 곳).
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

export const UNIT5_V5: Unit | null = remakeUnit(UNIT5, {
  u5l1: {
    after: retext([
      ["스튜디오에서 공을 살살 당기면 조금, 세게 당기면 멀리 날아갔죠?", "실험에서 공을 살살 밀면 조금, 세게 밀면 멀리 굴러갔죠?"],
      ["공을 조준할 때 화면에 뜨던 빨간 화살표가 바로 이거예요.", "공을 밀 때 그린 파란 화살표가 바로 이거예요."],
      ["길게 당길수록 화살표가 길어지고(크기), 당기는 각도에 따라 촉이 돌아갔죠(방향).", "길게 끌수록 화살표가 길어지고(크기), 끄는 쪽에 따라 촉이 향하는 곳이 달라졌죠(방향)."],
      ["스튜디오에서 세게 당길수록 화살표가 길어졌던 걸 떠올려 봐요.", "실험에서 세게 밀수록 화살표가 길었던 걸 떠올려 봐요."],
    ]),
    intro: opener({ title: "당겼다 놓은 풍선은 어디로 갈까요?", scene: "u5-balloon", wait: "풍선 줄을 당겼다 놓아 보세요", cta: "실험실 열기" }),
    swap: { forceStudio: forceLab({ title: "힘을 화살표로 어떻게 나타낼까요?", cta: "개념 정리하기" }) },
  },
  u5l2: {
    intro: opener({ title: "세게 당기는데 왜 안 움직일까요?", scene: "u5-tug", wait: "더 세게 당기게 해 보세요", cta: "실험실 열기" }),
    swap: { tugOfWar: tugLab({ title: "리본은 언제 움직이고 언제 멈출까요?", cta: "개념 정리하기" }) },
  },
  u5l3: {
    after: retext([
      ["행성 과수원에서 옆·아래에서 놓은 사과를 떠올려 봐요!", "실험에서 지구 옆과 아래에서 놓은 사과를 떠올려 봐요!"],
      ["실험실 HUD에서 본 숫자 그대로죠?", "실험에서 저울 눈금으로 본 숫자 그대로죠?"],
    ]),
    // 만화로 시작하는 레슨이라 도입은 그대로 둔다. 랩 끝의 궁금증 카드(우주 정거장)는 정본의 것을 이어 쓴다.
    swap: { gravityDrop: (old) => gravityLab({ title: "사과는 어느 쪽으로 떨어질까요?", cta: "개념 정리하기", curio: (old as unknown as { curio?: unknown }).curio }) },
  },
  u5l4: {
    intro: opener({ title: "뒤로 당긴 화살은 왜 앞으로 갈까요?", scene: "u5-bow", wait: "두 가지로 쏴 보세요", cta: "실험실 열기" }),
    swap: { springLab: springLab5({ title: "많이 늘이면 힘도 커질까요?", cta: "개념 정리하기" }) },
  },
  u5l5: {
    after: retext([
      ["얼음판에선 슥 밀리던 상자가 모랫바닥에선 꿈쩍도 안 했죠.", "얼음판에선 슥 밀리던 상자가 모래밭에선 훨씬 큰 힘을 줘야 움직였죠."],
    ]),
    intro: opener({ title: "썰매는 어느 길에서 멀리 갈까요?", scene: "u5-sled", wait: "두 길에서 밀어 보세요", cta: "실험실 열기" }),
    swap: { frictionPush: frictionLab({ title: "어떤 때 상자를 밀기 더 힘들까요?", cta: "개념 정리하기" }) },
  },
  u5l6: {
    intro: opener({ title: "눌러 넣은 병은 어떻게 될까요?", scene: "u5-bottle", wait: "병을 눌렀다 놓아 보세요", cta: "실험실 열기" }),
    swap: { buoyancyLab: buoyLab({ title: "물에 담그면 눈금은 어떻게 될까요?", cta: "개념 정리하기" }) },
  },
  u5l7: {
    after: retext([
      ["바람 축구장에서 바람(힘)을 거는 순간", "실험에서 바람(힘)을 보내는 순간"],
    ]),
    intro: opener({ title: "찬 공은 끝까지 굴러갈까요?", scene: "u5-roll", wait: "공을 차고 지켜보세요", cta: "실험실 열기" }),
    swap: { windSoccer: windLab({ title: "힘을 받으면 공은 어떻게 될까요?", cta: "개념 정리하기" }) },
  },
});
