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
const tempLab = lab("u4TempLab");
const shapeLab = lab("u4ShapeLab");
const modelLab = lab("u4ModelLab");
const namesLab = lab("u4NamesLab");
const watchLab = lab("u4WatchLab");
const dryIceLab = lab("u4DryIceLab");
const oliveLab = lab("u4OliveLab");
const balloonLab = lab("u4BalloonLab");
const heatLab = lab("u4HeatLab");
const curioOf = (old: Step): Curio | undefined => (old as unknown as { curio?: Curio }).curio;

export const UNIT4_V5: Unit | null = remakeUnit(UNIT4, {
  // 1. 입자의 운동: 뚜껑을 열면(도입) → 잉크와 식초의 확산 → 저울 위 소독제의 증발
  u4l1: {
    intro: opener({ title: "냄새는 어떻게 퍼질까요?", scene: "u4-lid", wait: "먼저 뚜껑을 열어 보세요", cta: "실험실 열기" }),
    swap: {
      diffusion: inkLab({ title: "젓지 않아도 잉크가 퍼질까요?", cta: "다음 실험, 증발" }),
      evaporation: evapLab({ title: "저울의 숫자는 어떻게 될까요?", cta: "개념 정리하기" }),
    },
  },
  // 2. 물질의 상태: 쏟아진 얼음과 주스(도입) → 온도에 따른 세 상태 → 그릇에 따른 모양과 부피 → 입자 모형 가려내기
  u4l2: {
    intro: opener({ title: "얼음은 줍는데 주스는요?", scene: "u4-spill", wait: "먼저 얼음과 주스를 주워 보세요", cta: "실험실 열기" }),
    swap: {
      matterTemp: tempLab({ title: "얼음을 데우면 어떻게 될까요?", cta: "다음, 그릇 실험" }),
      matterShape: shapeLab({ title: "그릇을 바꾸면 모양이 변할까요?", cta: "입자 모형 가려내기" }),
      matterCompare: modelLab({ title: "입자 모형은 어떤 상태일까요?", cta: "개념 정리하기" }),
    },
  },
  // 3. 물질의 상태 변화: 만화(그대로) → 이름 넷을 손으로 일으키기 → 시계 접시 실험(새로 넣음) → 드라이아이스와 비누막
  u4l3: {
    swap: {
      phaseNames: (old) => [
        namesLab({ title: "이름대로 물을 바꿔 볼까요?", cta: "다음 실험, 얼음 접시", curio: curioOf(old) }),
        watchLab({ title: "물방울은 어디에서 왔을까요?", cta: "다음 실험, 승화" }),
      ],
      sublimation: dryIceLab({ title: "비누막은 어떻게 될까요?", cta: "개념 정리하기" }),
    },
  },
  // 4. 상태 변화와 입자 배열: 국그릇의 랩(도입) → 올리브유 얼리기(새로 넣음) → 아세톤 풍선
  u4l4: {
    intro: opener({ title: "국그릇의 랩은 어떻게 될까요?", scene: "u4-wrap", wait: "먼저 랩을 지켜보세요", cta: "실험실 열기" }),
    swap: {
      phaseVolume: [
        oliveLab({ title: "얼리면 질량이 달라질까요?", cta: "다음 실험, 풍선" }),
        balloonLab({ title: "풍선은 어떻게 될까요?", cta: "개념 정리하기" }),
      ],
    },
  },
  // 5. 열에너지를 흡수하는 상태 변화: 끓는 물과 센 불(도입) → 가열 곡선
  u4l5: {
    intro: opener({ title: "센 불이면 더 뜨거울까요?", scene: "u4-ramen", wait: "먼저 불을 세게 해 보세요", cta: "실험실 열기" }),
    swap: { heatCurve: heatLab({ title: "가열하면 온도는 계속 오를까요?", mode: "heat", cta: "개념 정리하기" }) },
  },
  // 6. 열에너지를 방출하는 상태 변화: 만화(그대로) → 냉각 곡선
  u4l6: {
    swap: { heatCurve: heatLab({ title: "식히면 온도는 계속 내려갈까요?", mode: "cool", cta: "개념 정리하기" }) },
  },
});
