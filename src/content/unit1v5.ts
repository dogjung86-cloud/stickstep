// 중1 Ⅰ 과학과 인류의 지속가능한 삶: 랩 재제작(v5, 2026-11-12). 주소 ?u1v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit1.ts)에서 도입과 랩 스텝만 바꿔 끼운다. 레슨의 id와 수, 제목, 쪽수, 개념, 정리, 문제, 만화는 정본 그대로 따라온다.
// 설계와 근거는 design/u1v5-plan.md.
//   u1l1 과학적 탐구 방법   그대로(만화가 린드의 실험으로 여섯 단계를 겪게 한다)
//   u1l2 직접 탐구하기      도입 suncups → 공정한 실험 랩(변인 분류를 대신한다) → 그래프 그리기 랩(보기만 하던 표와 그래프를 대신한다)
//   u1l3 과학과 인류 문명   그대로(교과서에 실험이 없는 사례 조사 단원)
//   u1l4 첨단 과학기술      도입 speaker → 기술 켜 보기 랩(누르면 뜻이 뜨던 카드 넉 장을 대신한다)
//   u1l5 지속가능한 삶      도입 blanket → 온실 기체 줄이기 랩(새로 넣었다) → 실천 분류(정본 그대로)
// 도입 장면은 새로 만들지 않았다(unit1intro.ts와 같은 장면, 같은 제목). 끝 버튼 글만 새 랩의 첫 화면에 맞췄다.
import type { Step } from "../lessons/types";
import type { Unit } from "./curriculum";
import { opener } from "./dsl";
import { UNIT1 } from "./unit1";
import { remakeUnit } from "./v5remake";

const fairLab = (o: { title: string; cta?: string }): Step => ({ type: "u1FairLab", ...o });
const graphLab = (o: { title: string; cta?: string }): Step => ({ type: "u1GraphLab", ...o });
const techLab = (o: { title: string; cta?: string }): Step => ({ type: "u1TechLab", ...o });
const cleanLab = (o: { title: string; cta?: string }): Step => ({ type: "u1CleanLab", ...o });

export const UNIT1_V5: Unit | null = remakeUnit(UNIT1, {
  u1l2: {
    intro: opener({ title: "어느 컵이 가장 뜨거워질까?", scene: "suncups", wait: "해를 꾹 눌러 보세요", cta: "공정하게 다시 실험하기" }),
    swap: {
      binSort: fairLab({ title: "색깔만 달라지게 하려면?", cta: "결과를 그래프로" }),
      dataGraph: graphLab({ title: "표를 그래프로 옮기면?", cta: "정리하기" }),
    },
  },
  u1l4: {
    intro: opener({ title: "말을 알아듣는 스피커, 비결은?", scene: "speaker", wait: "말을 들려주며 확인해 보세요", cta: "기술 켜 보기" }),
    swap: { techCards: techLab({ title: "기술을 켜면 무엇이 달라질까?", cta: "정리하기" }) },
  },
  u1l5: {
    intro: opener({ title: "지구를 덮은 기체, 두꺼워지면?", scene: "blanket", wait: "기체를 늘렸다 줄여 보세요", cta: "온실 기체 줄여 보기" }),
    // 실천 분류(binSort)는 그대로 두고 그 앞에 랩을 넣는다
    swap: { binSort: (old) => [cleanLab({ title: "온실 기체를 줄이려면?", cta: "실천 분류하기" }), old] },
  },
});
