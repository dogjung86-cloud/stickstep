// 중1 Ⅳ 물질의 상태 변화: 랩과 도입 재제작(v5, 2026-11-12). 주소에 ?u4v5 를 붙였을 때만 보인다.
// 정본(unit4.ts)에서 도입(hook)과 랩 스텝만 바꿔 끼운다. 레슨의 id와 수, 제목, 쪽수, 잠금, 만화, 정리, 문제는 정본 그대로 따라온다.
// 설계와 책의 실험 대응표는 design/u4v5-plan.md.
import type { Unit } from "./curriculum";
import type { Step } from "../lessons/types";
import type { Curio } from "../ui/curio";
import { opener } from "./dsl";
import { UNIT4 } from "./unit4";
import { remakeUnit } from "./v5remake";

// 새 랩 스텝의 팩토리(dsl.ts를 고치지 않고 이 파일 안에 둔다)
interface LabProps {
  title: string;
  cta?: string;
  curio?: Curio;
}
const lab = (type: string) => (o: LabProps & Record<string, unknown>): Step => ({ type, ...o }) as unknown as Step;
const inkLab = lab("u4InkLab");
const evapLab = lab("u4EvapLab");

export const UNIT4_V5: Unit | null = remakeUnit(UNIT4, {
  // 1. 입자의 운동: 뚜껑을 열면(도입) → 잉크와 식초의 확산 → 저울 위 소독제의 증발
  u4l1: {
    intro: opener({ title: "냄새는 어떻게 퍼질까요?", scene: "u4-lid", wait: "먼저 뚜껑을 열어 보세요", cta: "실험실 열기" }),
    swap: {
      diffusion: inkLab({ title: "젓지 않아도 잉크가 퍼질까요?", cta: "다음 실험, 증발" }),
      evaporation: evapLab({ title: "저울의 숫자는 어떻게 될까요?", cta: "개념 정리하기" }),
    },
  },
});
