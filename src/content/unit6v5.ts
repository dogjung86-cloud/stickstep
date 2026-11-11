// 중1 Ⅵ 기체의 성질: 랩과 도입 재제작(v5). 주소 ?u6v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit6.ts)에서 도입(hook)과 랩 스텝만 바꿔 끼운다. 레슨의 id, 제목, 쪽수, 개념, 정리, 문제, u6l2의 만화는 정본 그대로다.
// 수치는 정본과 같다: 보일 24 mL·1기압(12 mL·2기압, 6 mL·4기압), 샤를 20 ℃ 30.0 mL에서 10 ℃마다 1.0 mL, 바닷속 30 m는 4기압.
// 설계와 교과서 대응표는 design/u6v5-plan.md.
import type { Step } from "../lessons/types";
import type { Unit } from "./curriculum";
import { opener } from "./dsl";
import { remakeUnit } from "./v5remake";
import { UNIT6 } from "./unit6";

const lab = (type: string, o: { title: string; cta?: string }): Step => ({ type, ...o });

/** 랩이 바뀌어 어긋난 문장만 맞춘다: 스텝 안의 글에서 from을 to로 바꾼 새 스텝을 돌려준다(정본 객체는 건드리지 않는다). */
type Words = [from: string, to: string][];
const reword = (v: unknown, words: Words): unknown => {
  if (typeof v === "string") return words.reduce((s, [a, b]) => s.split(a).join(b), v);
  if (Array.isArray(v)) return v.map((x) => reword(x, words));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, reword(x, words)]));
  return v;
};
const rewordSteps = (words: Words) => (steps: Step[]): Step[] => steps.map((st) => (st.type === "opener" || st.type.startsWith("u6") ? st : (reword(st, words) as Step)));

export const UNIT6_V5: Unit | null = remakeUnit(UNIT6, {
  u6l1: {
    intro: opener({ title: "얇은 얼음판, 어떻게 건널까?", scene: "u6-ice", wait: "곰을 직접 건너게 해 보세요", cta: "실험실 열기" }),
    swap: { gasPressure: lab("u6PressureLab", { title: "기체의 압력은 어떻게 생길까?", cta: "개념 정리하기" }) },
    after: rewordSteps([["실험에서 펌프를 누를수록 충돌 플래시가 촘촘해지고 게이지가 올라갔죠.", "실험에서 공기를 넣을수록 벽의 번쩍임이 잦아지고 압력 막대가 올라갔죠."]]),
  },
  u6l2: {
    swap: { boyleSyringe: lab("u6BoyleLab", { title: "누르면 압력은 어떻게 될까?", cta: "개념 정리하기" }) },
    after: rewordSteps([["'벽 충돌' 게이지를 봤나요?", "'벽 충돌' 막대를 봤나요?"]]),
  },
  u6l3: {
    intro: opener({ title: "뽁뽁이를 눌렀다 떼면?", scene: "u6-wrap", wait: "공기 방울을 눌렀다 떼 보세요", cta: "실험실 열기" }),
    swap: { diverBubble: lab("u6DiverLab", { title: "누르는 압력이 줄면 기체는?", cta: "개념 정리하기" }) },
  },
  u6l4: {
    intro: opener({ title: "은박 풍선, 밖에 나가면?", scene: "u6-foil", wait: "밖에 나갔다 들어와 보세요", cta: "실험실 열기" }),
    swap: { charlesSyringe: lab("u6CharlesLab", { title: "데우면 부피는 어떻게 될까?", cta: "개념 정리하기" }) },
    after: rewordSteps([
      ["(실험 결과 표 기준)", "(실험에서 잰 값 기준)"],
      ["표에서 50℃일 때 딱", "실험에서 50℃일 때 딱"],
      ["실험 표를 떠올려요.", "실험에서 잰 값을 떠올려요."],
      ["실험 표 그대로예요.", "실험에서 잰 값 그대로예요."],
      ["표의 수치처럼", "실험에서 잰 값처럼"],
      ["실험에서 '도로 식히기' 목표를 기억해요. 온도를 내리자 부피가 30.0 mL로 <b>돌아왔죠</b>.", "실험에서 얼음물에 담갔을 때를 기억해요. 온도를 내리자 부피가 <b>줄었죠</b>."],
    ]),
  },
  u6l5: {
    intro: opener({ title: "찌그러진 탁구공, 펴질까?", scene: "u6-pong", wait: "공을 물에 꾹 담가 보세요", cta: "실험실 열기" }),
    swap: { hotairRide: lab("u6BalloonLab", { title: "열기구는 어떻게 떠오를까?", cta: "개념 정리하기" }) },
  },
});
