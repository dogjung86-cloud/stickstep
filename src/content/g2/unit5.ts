// 중2 대단원 V: 식물과 에너지. 이 파일이 정본이다(curriculum.ts가 G2_UNIT5를 바로 싣는다).
// 소단원 순서는 책 그대로(책 168~197쪽): 식물의 광합성 → 환경요인 → 식물의 호흡과 광합성 → 광합성산물의 저장과 이용.
// 레슨의 스텝 내용은 길어서 두 파일로 나눴다: unit5v5a.ts(레슨 1~3), unit5v5b.ts(레슨 4~6). 저작 도구는 unit5v5kit.ts.
// 레슨 id는 g2u5l1~l6(시험 풀과 맞물린다). 설계와 책의 실험 대응표는 design/g2u5v5-plan.md.
// 언어 가드: 몰·화학식 금지 · 암처리 먼저 · 아이오딘=녹말 확인 · 호흡은 낮밤 항상 ·
// 체관 설탕은 위·아래로 · 온도는 알맞은 범위 뒤 광합성량 감소 · 해요체 · 이모지 금지.
import type { Unit } from "../curriculum";
import { lesson } from "../dsl";
import { G2U5L1_STEPS, G2U5L2_STEPS, G2U5L3_STEPS } from "./unit5v5a";
import { G2U5L4_STEPS, G2U5L5_STEPS, G2U5L6_STEPS } from "./unit5v5b";

export const G2_UNIT5: Unit = {
  id: "g2u5",
  roman: "V",
  title: "식물과 에너지",
  subtitle: "빛으로 양분을 만들고, 양분에서 에너지를 꺼내는 식물의 하루",
  color: "#12B886",
  icon: "leaf",
  standard: "책 168~197쪽",
  lessons: [
    lesson({
      id: "g2u5l1", unitId: "g2u5",
      title: "스스로 밥을 짓는 식물",
      subtitle: "160년에 걸친 발견, 광합성",
      label: "광합성", icon: "leaf", minutes: 10, standard: "책 170~173쪽",
      doneNote: "광합성은 엽록체에서, 빛·이산화 탄소·물로 포도당과 산소를",
      // 만화 → 현미경 관찰 랩 → 용어 → 재료 주고 끊기 랩 → 용어 → 정리 → 문제 6
      steps: G2U5L1_STEPS,
    }),
    lesson({
      id: "g2u5l2", unitId: "g2u5",
      title: "빛을 받은 잎의 비밀",
      subtitle: "센서와 아이오딘으로 잡는 광합성의 증거",
      label: "확인 실험", icon: "flask", minutes: 10, standard: "책 174~175쪽",
      doneNote: "빛을 받은 잎만 이산화 탄소를 쓰고, 산소를 내놓고, 녹말을 남겨요",
      // 도입(아이오딘 용액) → 센서 실험 랩 → 잎의 녹말 확인 랩 → 용어 → 정리 → 문제 6
      steps: G2U5L2_STEPS,
    }),
    lesson({
      id: "g2u5l3", unitId: "g2u5",
      title: "광합성의 조건 맞추기",
      subtitle: "빛·이산화 탄소·온도, 세 개의 다이얼",
      label: "환경요인", icon: "bulb", minutes: 9, standard: "책 176~181쪽",
      doneNote: "셋 다 '알맞을 때' 최대, 온도는 지나치면 오히려 뚝",
      // 도입(창가와 방 안쪽) → 빛의 세기 실험 설계 랩 → 온실 조건 정하기 랩 → 용어 → 정리 → 문제 6
      steps: G2U5L3_STEPS,
    }),
    lesson({
      id: "g2u5l4", unitId: "g2u5",
      title: "에너지를 꺼내는 숨, 호흡",
      subtitle: "양분을 분해해 에너지를 얻는 과정",
      label: "호흡", icon: "bolt", minutes: 9, standard: "책 182~185쪽",
      premium: true,
      doneNote: "호흡은 낮에도 밤에도, 모든 세포에서 계속돼요",
      // 도입(물에 잠긴 화분) → 빛을 막은 용기 랩 → 땅속의 콩 랩 → 용어 → 정리 → 문제 5
      steps: G2U5L4_STEPS,
    }),
    lesson({
      id: "g2u5l5", unitId: "g2u5",
      title: "낮의 잎, 밤의 잎",
      subtitle: "광합성과 호흡이 맞물리는 하루",
      label: "낮과 밤", icon: "swap", minutes: 9, standard: "책 184~185쪽",
      premium: true,
      doneNote: "기체의 방향은 광합성량과 호흡량의 크기 비교로 정해져요",
      // 도입(뚜껑을 닫은 유리병) → 빛의 세기와 기체 출입 랩 → 용어 → 붙임딱지 랩 → 정리 → 문제 5
      steps: G2U5L5_STEPS,
    }),
    lesson({
      id: "g2u5l6", unitId: "g2u5",
      title: "양분의 저장과 이용",
      subtitle: "고구마의 살은 잎이 보낸 선물",
      label: "양분의 여행", icon: "route", minutes: 10, standard: "책 186~197쪽",
      premium: true,
      doneNote: "녹말은 설탕이 되어 체관을 타고, 필요한 곳 어디로든",
      // 도입(열매 솎아 내기) → 양분 보내기 랩 → 용어 → 작물 검사 랩 → 용어 → 정리 → 문제 6
      steps: G2U5L6_STEPS,
    }),
  ],
};
