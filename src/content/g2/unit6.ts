// 중2 대단원 Ⅵ 동물과 에너지. 이 파일이 정본이다(책 198~237쪽, 소단원 차례 그대로).
// 단원과 레슨의 머리 정보, 레슨마다의 스텝 차례를 여기에 적는다. 스텝의 내용은 길어서 두 파일로 나눴다:
// unit6v5a.ts(레슨 1~3), unit6v5b.ts(레슨 4~6). 저작 도구는 unit6v5kit.ts. 설계는 design/g2u6v5-plan.md.
// 레슨 3의 만화는 장면 파일이 정본이다(comicStory). 레슨 id는 g2u6l1~l6(시험 풀과 맞물린다).
import type { Unit } from "../curriculum";
import { comicStory } from "../../ui/sketchArt";
import { lesson, comic } from "../dsl";
import { G2U6L1_STEPS, G2U6L2_STEPS, G2U6L3_STEPS } from "./unit6v5a";
import { G2U6L4_STEPS, G2U6L5_STEPS, G2U6L6_STEPS } from "./unit6v5b";

export const G2_UNIT6: Unit = {
  id: "g2u6",
  roman: "VI",
  title: "동물과 에너지",
  subtitle: "먹고, 돌리고, 숨쉬고, 내보내며 에너지를 얻는 몸",
  color: "#E23B4B",
  icon: "heart",
  standard: "책 198~237쪽",
  lessons: [
    lesson({
      id: "g2u6l1", unitId: "g2u6",
      title: "몸을 짓는 여섯 가지 재료",
      subtitle: "영양소의 종류와 검출",
      label: "영양소", icon: "flask", minutes: 10, standard: "책 202~205쪽",
      doneNote: "에너지원 셋(탄수화물·단백질·지방) + 조절 셋(바이타민·무기염류·물), 색으로 검출해요",
      // 도입(땅콩과 종이) → 용어 → 홈판 검출 랩 → 베네딕트 검사 랩 → 용어 → 정리 → 문제
      steps: [...G2U6L1_STEPS],
    }),
    lesson({
      id: "g2u6l2", unitId: "g2u6",
      title: "잘게 나눠야 들어간다, 소화",
      subtitle: "소화계의 구조와 소화효소",
      label: "소화", icon: "route", minutes: 12, standard: "책 206~211쪽",
      doneNote: "소화효소는 자기 담당 영양소만, 최종 산물은 융털로 흡수돼요",
      // 도입(밥 씹기) → 침의 소화 실험 랩 → 용어 → 소화액과 영양소 랩 → 작은창자 벽 랩 → 용어 → 정리 → 문제
      steps: [...G2U6L2_STEPS],
    }),
    lesson({
      id: "g2u6l3", unitId: "g2u6",
      title: "피는 돈다, 심장과 순환",
      subtitle: "순환계의 구조와 혈액의 순환 경로",
      label: "순환", icon: "heart", minutes: 12, standard: "책 212~217쪽",
      doneNote: "판막은 일방통행 문, 혈액은 온몸·허파 두 순환을 돌아요",
      // 만화 → 심장과 판막 랩 → 용어 → 혈액의 구성 랩 → 순환 경로 랩 → 용어 → 정리 → 문제
      steps: [comic(comicStory("g2u6l3")), ...G2U6L3_STEPS],
    }),
    lesson({
      id: "g2u6l4", unitId: "g2u6",
      title: "숨을 움직이는 압력",
      subtitle: "호흡계의 구조와 호흡운동",
      label: "호흡", icon: "cloud", minutes: 11, standard: "책 220~225쪽",
      premium: true,
      doneNote: "허파는 스스로 못 움직여요. 갈비뼈·가로막이 압력을 바꿔요",
      // 도입(가슴둘레) → 호흡운동 모형 랩 → 용어 → 기체 교환 랩 → 용어 → 정리 → 문제
      steps: [...G2U6L4_STEPS],
    }),
    lesson({
      id: "g2u6l5", unitId: "g2u6",
      title: "몸속 정수장, 콩팥",
      subtitle: "배설계의 구조와 오줌 생성",
      label: "배설", icon: "drop", minutes: 11, standard: "책 226~229쪽",
      premium: true,
      doneNote: "여과는 크기로, 재흡수는 필요로, 요소는 오줌으로 나가요",
      // 도입(물과 오줌) → 용어 → 콩팥단위 랩 → 용어 → 정리 → 문제
      steps: [...G2U6L5_STEPS],
    }),
    lesson({
      id: "g2u6l6", unitId: "g2u6",
      title: "에너지를 꺼내는 팀워크",
      subtitle: "세포호흡과 기관계의 통합 작용",
      label: "세포호흡", icon: "bolt", minutes: 10, standard: "책 230~231쪽",
      premium: true,
      doneNote: "영양소+산소 → 에너지, 네 기관계의 협력이 세포호흡을 떠받쳐요",
      // 도입(제자리 뛰기) → 세포호흡 랩 → 용어 → 기관계의 협력 랩 → 정리 → 문제
      steps: [...G2U6L6_STEPS],
    }),
  ],
};
