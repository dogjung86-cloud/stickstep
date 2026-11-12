// 중2 대단원 VIII. 별과 우주 (책 278~309쪽). 이 파일이 정본이다.
// 중단원 1 '별의 특성': 별까지의 거리(282~283), 별의 밝기와 등급(284~287), 별의 색과 표면 온도(288~289)
// 중단원 2 '우리은하와 우주': 우리은하(294~295), 성단과 성운(296~299), 팽창하는 우주(300~303), 우주 탐사(304~305)
// 8레슨(무료 3 + 프리미엄 5). 레슨마다 도입(opener) → 랩 → 용어 → 정리 → 문제. g2u8l7만 허블 만화로 연다.
// 여기에는 단원과 레슨의 머리 정보, 스텝의 차례가 있다. 스텝의 내용은 unit8v5parts.ts(레슨 1~4)와 unit8v5parts2.ts(레슨 5~8)에 있다.
// 설계와 책의 탐구 대응표는 design/g2u8v5-plan.md. 개념 스텝에는 아직 컷이 없다(output/g2-v5/u8/concept-cuts.md 를 보고 그림 세션이 그린다).
import type { Unit } from "../curriculum";
import { comicStory } from "../../ui/sketchArt";
import { comic } from "../dsl";
import { L1, L2, L3, L4 } from "./unit8v5parts";
import { L5, L6, L7, L8 } from "./unit8v5parts2";

export const G2_UNIT8: Unit = {
  id: "g2u8",
  roman: "VIII",
  title: "별과 우주",
  subtitle: "별까지의 거리, 우리은하와 우주",
  color: "#2E3A8C",
  icon: "sparkle",
  standard: "2022 개정 교육과정",
  lessons: [
    {
      id: "g2u8l1",
      unitId: "g2u8",
      title: "별까지의 거리",
      subtitle: "손가락 하나로 재는 우주",
      label: "연주 시차",
      icon: "sparkle",
      minutes: 11,
      standard: "책 282~283쪽",
      doneNote: "시차와 연주 시차로 별까지의 거리를 비교할 수 있어요",
      // 도입 > 연필 랩 > 용어 > 연주 시차 랩 > 용어 > 정리 > 문제
      steps: [...L1],
    },
    {
      id: "g2u8l2",
      unitId: "g2u8",
      title: "별의 밝기와 거리",
      subtitle: "멀어지면 왜 어두워질까",
      label: "밝기와 거리",
      icon: "sparkle",
      minutes: 10,
      standard: "책 284~285쪽",
      doneNote: "밝기가 거리 제곱에 반비례함을 체험했어요",
      // 도입 > 조도 랩 > 퍼짐 랩 > 용어 > 정리 > 문제
      steps: [...L2],
    },
    {
      id: "g2u8l3",
      unitId: "g2u8",
      title: "별의 등급",
      subtitle: "겉보기와 진짜 밝기",
      label: "별의 등급",
      icon: "sparkle",
      minutes: 12,
      standard: "책 286~287쪽",
      doneNote: "겉보기 등급과 절대 등급으로 별을 비교할 수 있어요",
      // 도입 > 등급 랩 > 용어 > 절대 등급 랩 > 용어 > 정리 > 문제
      steps: [...L3],
    },
    {
      id: "g2u8l4",
      unitId: "g2u8",
      premium: true,
      title: "별의 색과 표면 온도",
      subtitle: "붉은 별, 파란 별의 비밀",
      label: "색과 표면 온도",
      icon: "sparkle",
      minutes: 10,
      standard: "책 288~289쪽",
      doneNote: "별의 색으로 표면 온도를 비교할 수 있어요",
      // 도입 > 전열기 랩 > 별의 온도 랩 > 용어 > 정리 > 문제
      steps: [...L4],
    },
    {
      id: "g2u8l5",
      unitId: "g2u8",
      premium: true,
      title: "우리은하",
      subtitle: "은하수 띠의 정체",
      label: "우리은하",
      icon: "sparkle",
      minutes: 10,
      standard: "책 294~295쪽",
      doneNote: "우리은하의 구조와 태양계의 위치를 배웠어요",
      // 도입 > 모형 랩 > 우리은하 랩 > 용어 > 정리 > 문제
      steps: [...L5],
    },
    {
      id: "g2u8l6",
      unitId: "g2u8",
      premium: true,
      title: "성단과 성운",
      subtitle: "별 무리와 우주 구름",
      label: "성단과 성운",
      icon: "sparkle",
      minutes: 11,
      standard: "책 296~299쪽",
      doneNote: "성단·성운의 종류를 실사로 구분할 수 있어요",
      // 도입 > 관측 랩 > 용어 > 성운 랩 > 용어 > 정리 > 문제
      steps: [...L6],
    },
    {
      id: "g2u8l7",
      unitId: "g2u8",
      premium: true,
      title: "팽창하는 우주",
      subtitle: "허블이 연 우주의 문",
      label: "팽창하는 우주",
      icon: "sparkle",
      minutes: 12,
      standard: "책 300~303쪽",
      doneNote: "우주 팽창과 '중심 없음'을 이해했어요",
      // 만화 > 풍선 랩 > 중심 랩 > 용어 > 정리 > 문제
      steps: [comic(comicStory("g2u8l7")), ...L7],
    },
    {
      id: "g2u8l8",
      unitId: "g2u8",
      premium: true,
      title: "우주 탐사",
      subtitle: "인류가 우주로 가는 이유",
      label: "우주 탐사",
      icon: "sparkle",
      minutes: 10,
      standard: "책 304~305쪽",
      doneNote: "우주 탐사의 역사와 의의를 배웠어요",
      // 도입 > 탐사 랩 > 계획 랩 > 용어 > 정리 > 문제
      steps: [...L8],
    },
  ],
};
