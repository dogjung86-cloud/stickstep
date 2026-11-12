// 중2 대단원 Ⅳ. 물질의 구성 (책 134~167쪽). 이 파일이 단원의 정본이다.
// 중단원 1 '물질을 구성하는 성분': 원소와 화합물(138~139) · 원소 기호와 화학식(140~143) ·
//   원자의 구조(144~145) · 주기율표(146~149)
// 중단원 2 '물질을 구성하는 입자': 원자, 분자, 이온(154~157) · 이온의 이동(158~159)
// 여섯 레슨. 레슨의 머리 정보와 스텝 차례는 여기에 적고, 스텝의 내용은 길어서 두 파일로 나눴다:
//   unit4v5a.ts(레슨 1~3), unit4v5b.ts(레슨 4~6). 저작 도구는 unit4v5kit.ts. 설계는 design/g2u4v5-plan.md.
// 레슨 4만 만화로 시작한다(글과 그림의 정본은 만화 장면 파일, ui/sketchArt의 comicStory).
import type { Unit } from "../curriculum";
import { comicStory } from "../../ui/sketchArt";
import { comic } from "../dsl";
import { G2U4L1_STEPS, G2U4L2_STEPS, G2U4L3_STEPS } from "./unit4v5a";
import { G2U4L4_STEPS, G2U4L5_STEPS, G2U4L6_STEPS } from "./unit4v5b";

export const G2_UNIT4: Unit = {
  id: "g2u4",
  roman: "IV",
  title: "물질의 구성",
  subtitle: "원소에서 원자·분자·이온까지",
  color: "#7CB024",
  icon: "atom",

  standard: "2022 개정 교육과정",
  lessons: [
    // ══ 레슨 1. 원소와 화합물 (책 138~139쪽) ══
    {
      id: "g2u4l1",
      unitId: "g2u4",
      title: "원소와 화합물",
      subtitle: "한 종류일까, 여러 종류일까",
      label: "원소와 화합물",
      icon: "flask",
      minutes: 9,
      standard: "책 138~139쪽",
      doneNote: "원소와 화합물을 입자로 구분하는 법을 배웠어요",
      // 도입(물방울 나누기) → 물 분해 랩 → 성분 가르기 랩 → 용어 → 정리 → 문제(분류 1, 선택형 4)
      steps: [...G2U4L1_STEPS],
    },
    // ══ 레슨 2. 원소 기호와 화학식 (책 140~143쪽) ══
    {
      id: "g2u4l2",
      unitId: "g2u4",
      title: "원소 기호와 화학식",
      subtitle: "전 세계가 함께 쓰는 물질의 언어",
      label: "기호와 화학식",
      icon: "ptable",
      minutes: 12,
      standard: "책 140~143쪽",
      doneNote: "원소 기호와 화학식으로 물질을 표현하는 법을 배웠어요",
      // 도입(그림 기호) → 기호 짓기 랩 → 카드 놀이 랩 → 용어(원소 기호) → 용어(원자와 화학식) → 화학식 쓰기 랩 → 정리 → 문제(짝 맞추기 1, 선택형 5)
      steps: [...G2U4L2_STEPS],
    },
    // ══ 레슨 3. 원자의 구조 (책 144~145쪽) ══
    {
      id: "g2u4l3",
      unitId: "g2u4",
      title: "원자의 구조",
      subtitle: "원자핵과 전자, 그리고 양성자수",
      label: "원자의 구조",
      icon: "atom",
      minutes: 10,
      standard: "책 144~145쪽",
      doneNote: "원자의 구조와 양성자수의 의미를 배웠어요",
      // 도입(원자 확대) → 전자 넣기 랩 → 용어 → 원자의 종류 랩 → 정리 → 문제(선택형 4, 분류 1)
      steps: [...G2U4L3_STEPS],
    },
    // ══ 레슨 4. 주기율표 (책 146~149쪽) ══
    {
      id: "g2u4l4",
      unitId: "g2u4",
      premium: true,
      title: "주기율표",
      subtitle: "위치만 봐도 성질이 보인다",
      label: "주기율표",
      icon: "ptable",
      minutes: 14,
      standard: "책 146~149쪽",
      doneNote: "주기율표의 족·주기와 같은 족의 유사성을 배웠어요",
      // 만화 → 빈칸 채우기 랩 → 용어 → 1족 금속과 물 랩 → 18족 기체 랩 → 정리 → 문제(선택형 5)
      steps: [comic(comicStory("g2u4l4")), ...G2U4L4_STEPS],
    },
    // ══ 레슨 5. 원자, 분자, 이온 (책 154~157쪽) ══
    {
      id: "g2u4l5",
      unitId: "g2u4",
      premium: true,
      title: "원자 · 분자 · 이온",
      subtitle: "물질을 이루는 세 가지 입자",
      label: "원자·분자·이온",
      icon: "molecule",
      minutes: 14,
      standard: "책 154~157쪽",
      doneNote: "원자·분자·이온의 차이를 배웠어요",
      // 도입(소금을 물에) → 분자 붙이고 나누기 랩 → 용어(분자) → 전자 건네기 랩 → 용어(이온) → 캔 음료 랩 → 정리 → 문제(분류 1, 선택형 5)
      steps: [...G2U4L5_STEPS],
    },
    // ══ 레슨 6. 이온의 이동 (책 158~159쪽) ══
    {
      id: "g2u4l6",
      unitId: "g2u4",
      premium: true,
      title: "이온의 이동",
      subtitle: "전하를 띤 입자가 극으로 끌려간다",
      label: "이온의 이동",
      icon: "ionArrow",
      minutes: 11,
      standard: "책 158~159쪽",
      doneNote: "이온의 이동으로 물질의 구성 단원 완주!",
      // 도입(번지는 파란 방울) → 황산 구리(Ⅱ) 수용액 랩 → 극 바꾸기 랩 → 정리 → 문제(순서 1, 선택형 4)
      steps: [...G2U4L6_STEPS],
    },
  ],
};
