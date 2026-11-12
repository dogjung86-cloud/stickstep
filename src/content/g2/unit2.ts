// 중2 대단원 Ⅱ 지권의 변화. 이 파일이 정본이다. 소단원 차례는 책 그대로:
// 지구계와 층상 구조 → 광물 → 화성암 → 퇴적암 → 변성암 → 암석의 순환 → 풍화와 토양 → 대륙 이동설 → 판의 경계. 무료 1~3 + 프리미엄 4~9.
// 레슨마다 스텝 차례는 도입(opener) → 랩과 용어 → 정리(recap) → 문제이고, 아래 레슨 위의 주석에 적었다.
// 스텝의 내용은 unit2v5a.ts(1), unit2v5b.ts(2~3), unit2v5c.ts(4~6), unit2v5d.ts(7~9)에, 저작 도구는 unit2v5kit.ts에 있다.
// 설계와 책의 탐구 대응표는 design/g2u2v5-plan.md.
import type { Unit } from "../curriculum";
import { lesson } from "../dsl";
import { L1 } from "./unit2v5a";
import { L2, L3 } from "./unit2v5b";
import { L4, L5, L6 } from "./unit2v5c";
import { L7, L8, L9 } from "./unit2v5d";

export const G2_UNIT2: Unit = {
  id: "g2u2",
  roman: "II",
  title: "지권의 변화",
  subtitle: "지구 속부터 움직이는 대륙까지, 땅의 과학",
  color: "#A9713B",
  icon: "globe",
  standard: "책 52~93쪽",
  lessons: [
    // 1. 지구계와 지구 내부: 지구의 물을 다 모으면(도입) → 풍경을 다섯 영역으로 → 용어 → 조사 방법 견주기 → 비율 모형 → 용어 → 정리 → 문제
    lesson({
      id: "g2u2l1",
      unitId: "g2u2",
      title: "지구계와 지구 내부",
      subtitle: "다섯 권역, 그리고 땅속 네 층",
      label: "지구 내부",
      icon: "globe",
      minutes: 9,
      standard: "책 56~61쪽",
      doneNote: "지각·맨틀·외핵·내핵, 지구 속 네 층!",
      steps: L1,
    }),
    // 2. 광물의 특성: 암석을 확대하면(도입) → 용어(광물) → 조흔판에 긁기 → 도구로 가려내기 → 용어(특성) → 정리 → 문제
    lesson({
      id: "g2u2l2",
      unitId: "g2u2",
      title: "광물의 특성",
      subtitle: "조흔색·굳기·자성·염산 반응으로 가려내요",
      label: "광물",
      icon: "sparkle",
      minutes: 9,
      standard: "책 62~65쪽",
      doneNote: "겉색이 같아도 가루색은 달라요",
      steps: L2,
    }),
    // 3. 화성암: 용암과 마그마(도입) → 식는 빠르기와 결정 → 화성암 분류표 → 용어 → 정리 → 문제
    lesson({
      id: "g2u2l3",
      unitId: "g2u2",
      title: "화성암",
      subtitle: "식는 속도가 결정 크기를 정해요",
      label: "화성암",
      icon: "flame",
      minutes: 9,
      standard: "책 66~67쪽",
      doneNote: "빨리 식으면 화산암, 천천히 식으면 심성암",
      steps: L3,
    }),
    // 4. 퇴적암: 흙탕물 병(도입) → 퇴적물 쌓고 다지기 → 용어 → 정리 → 문제
    lesson({
      id: "g2u2l4",
      unitId: "g2u2",
      title: "퇴적암",
      subtitle: "쌓이고 다져져 줄무늬(층리)가 생겨요",
      label: "퇴적암",
      icon: "layers",
      minutes: 8,
      standard: "책 68쪽",
      doneNote: "역암·사암·이암·석회암, 입자로 구분!",
      premium: true,
      steps: L4,
    }),
    // 5. 변성암: 눈 더미 누르기(도입) → 누르는 방향과 줄무늬 → 원래 암석과 변성암 → 용어 → 정리 → 문제
    lesson({
      id: "g2u2l5",
      unitId: "g2u2",
      title: "변성암",
      subtitle: "열과 압력이 암석을 다시 빚어요",
      label: "변성암",
      icon: "swap",
      minutes: 8,
      standard: "책 69쪽",
      doneNote: "압력에 수직으로 늘어선 줄무늬가 엽리",
      premium: true,
      steps: L5,
    }),
    // 6. 암석의 순환: 강가의 자갈(도입) → 표본 여섯 개 분류 → 암석이 변하는 길 찾기 → 용어 → 정리 → 문제
    lesson({
      id: "g2u2l6",
      unitId: "g2u2",
      title: "암석의 순환",
      subtitle: "암석은 끊임없이 서로 변해요",
      label: "암석의 순환",
      icon: "recycle",
      minutes: 10,
      standard: "책 70~71쪽",
      doneNote: "마그마→화성암→퇴적물→퇴적암→변성암→다시!",
      premium: true,
      steps: L6,
    }),
    // 7. 풍화와 토양: 얼어붙은 유리병(도입) → 얼고 녹기 → 용어(풍화) → 토양이 생기는 차례 → 용어(토양) → 정리 → 문제
    lesson({
      id: "g2u2l7",
      unitId: "g2u2",
      title: "풍화와 토양",
      subtitle: "바위가 흙이 되기까지",
      label: "풍화·토양",
      icon: "leaf",
      minutes: 8,
      standard: "책 78~79쪽",
      doneNote: "물·공기·생물이 오랜 시간 바위를 부숴요",
      premium: true,
      steps: L7,
    }),
    // 8. 대륙 이동설: 찢어진 종이(도입) → 해안선 맞추기 → 빙하의 흔적 모으기 → 용어 → 정리 → 문제
    lesson({
      id: "g2u2l8",
      unitId: "g2u2",
      title: "대륙 이동설",
      subtitle: "베게너의 네 가지 증거",
      label: "대륙 이동설",
      icon: "route",
      minutes: 10,
      standard: "책 80~81쪽",
      doneNote: "판게아, 대륙은 한 몸이었어요",
      premium: true,
      steps: L8,
    }),
    // 9. 판의 경계: 언 호수의 얼음판(도입) → 깃발 꽂고 지진 자료와 견주기 → 용어(화산대, 지진대, 판) → 판의 경계와 견주기 → 정리 → 문제
    lesson({
      id: "g2u2l9",
      unitId: "g2u2",
      title: "판의 경계",
      subtitle: "화산대·지진대는 왜 띠를 이룰까",
      label: "판의 경계",
      icon: "target",
      minutes: 9,
      standard: "책 82~85쪽",
      doneNote: "화산대·지진대 ≈ 판의 경계!",
      premium: true,
      steps: L9,
    }),
  ],
};
if (import.meta.env.DEV) Object.assign(globalThis as unknown as Record<string, unknown>, { __g2u2v5: G2_UNIT2 });
