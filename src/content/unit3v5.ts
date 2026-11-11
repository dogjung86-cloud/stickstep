// 중1 Ⅲ 열: 랩과 도입 재제작(v5, 2026-11-12). 주소 ?u3v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit3.ts)에서 도입과 랩 스텝만 바꿔 끼운다. 레슨의 id와 수, 제목, 쪽수, 개념, 정리, 문제, u3l3의 만화는 정본 그대로다.
// 설계와 교과서 대응표: design/u3v5-plan.md
//   u3l1 도입 u3-cups  → 랩 u3TempLab(온도 막대 + 비밀의 물과 같은 온도 만들기)
//   u3l2 도입 u3-egg   → 랩 u3ContactLab(열량계에 컵 넣기, 컵 속 물의 온도를 학생이 정한다)
//   u3l3 (만화 그대로)  → 랩 u3RodLab(전도) · u3ConvLab(대류) · u3RadLab(복사)
//   u3l4 도입 u3-beach → 랩 u3RaceLab(물과 식용유 가열)
//   u3l5 도입 u3-wire  → 랩 u3ExpandLab(막대와 입자) · u3TapeLab(알루미늄박과 종이 띠, 바이메탈)
import type { Step } from "../lessons/types";
import type { Unit } from "./curriculum";
import { opener } from "./dsl";
import { UNIT3 } from "./unit3";
import { remakeUnit } from "./v5remake";

type Curio = { q: string; a: string };
const lab = (type: string) => (o: { title: string; cta?: string; curio?: Curio }): Step => ({ type, ...o });
const tempLab = lab("u3TempLab");

/** 정본 랩 스텝에 달려 있던 궁금증 카드를 새 랩으로 옮겨 단다(글의 주인은 정본이다). */
const withCurio = (make: (curio?: Curio) => Step) => (old: Step): Step => make(old.curio as Curio | undefined);

export const UNIT3_V5: Unit | null = remakeUnit(UNIT3, {
  u3l1: {
    intro: opener({ title: "똑같아 보이는 두 컵, 무엇이 다를까?", scene: "u3-cups", wait: "두 컵의 뚜껑을 열어 보세요", cta: "물속을 크게 확대해 보기" }),
    swap: { heatParticles: withCurio((curio) => tempLab({ title: "온도가 오르면 입자는 어떻게 될까?", cta: "개념 정리하기", curio })) },
  },
});
