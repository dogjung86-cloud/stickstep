// 중2 대단원 III. 빛과 파동 (책 94~133쪽). 이 파일이 정본이다.
// 중단원 1 '빛': 1 빛의 반사(98~99) · 2 빛의 굴절(100~101) · 3 물체를 보는 과정(102~103) ·
//   4 평면거울에서 상이 생기는 원리(104~105) · 5 거울과 렌즈(106~111) · 6 빛의 합성(112~115)
// 중단원 2 '파동': 1 파동의 발생과 전달(120~121) · 2 소리의 특성(122~127)
// 여기에는 단원과 레슨의 머리 정보, 레슨마다 스텝의 차례를 적는다. 도입, 랩, 개념, 정리, 문제의 내용은 unit3v5parts.ts에 있고,
// 레슨 6의 만화는 장면 파일이 정본이다(comicStory). 설계 근거: design/g2u3v5-plan.md.
import type { Unit } from "../curriculum";
import type { Lesson, Step } from "../../lessons/types";
import { comicStory } from "../../ui/sketchArt";
import { comic } from "../dsl";
import { G2U3_PARTS as P } from "./unit3v5parts";

/** 선택형 문제에 "몇 번째 / 모두 몇 개" 번호를 매긴 레슨의 스텝 배열 */
const steps = (...list: Step[]): Step[] => {
  const of = list.filter((st) => st.type === "quiz").length;
  let n = 0;
  return list.map((st) => (st.type === "quiz" ? ({ ...st, n: ++n, of } as Step) : st));
};

// ══════════════════════════════════════════════════════════
// 레슨 1. 빛의 반사 (책 98~99쪽)
// ══════════════════════════════════════════════════════════
const L1: Lesson = {
  id: "g2u3l1",
  unitId: "g2u3",
  title: "빛의 반사",
  subtitle: "입사각과 반사각의 약속",
  label: "빛의 반사",
  icon: "reflect",
  minutes: 10,
  standard: "책 98~99쪽",
  doneNote: "반사 법칙과 정반사·난반사를 배웠어요",
  steps: steps(P.g2u3l1.intro, ...P.g2u3l1.body),
};

// ══════════════════════════════════════════════════════════
// 레슨 2. 빛의 굴절 (책 100~101쪽)
// ══════════════════════════════════════════════════════════
const L2: Lesson = {
  id: "g2u3l2",
  unitId: "g2u3",
  title: "빛의 굴절",
  subtitle: "경계면에서 꺾이는 빛",
  label: "빛의 굴절",
  icon: "prism",
  minutes: 9,
  standard: "책 100~101쪽",
  doneNote: "굴절의 규칙과 생활 속 굴절 현상을 배웠어요",
  steps: steps(P.g2u3l2.intro, ...P.g2u3l2.body),
};

// ══════════════════════════════════════════════════════════
// 레슨 3. 물체를 보는 과정 (책 102~103쪽)
// ══════════════════════════════════════════════════════════
const L3: Lesson = {
  id: "g2u3l3",
  unitId: "g2u3",
  title: "물체를 보는 과정",
  subtitle: "빛은 언제나 광원에서 눈으로",
  label: "보는 과정",
  icon: "eye",
  minutes: 8,
  standard: "책 102~103쪽",
  doneNote: "광원과 물체를 보는 빛의 경로를 배웠어요",
  steps: steps(P.g2u3l3.intro, ...P.g2u3l3.body),
};

// ══════════════════════════════════════════════════════════
// 레슨 4. 평면거울에서 상이 생기는 원리 (책 104~105쪽)
// ══════════════════════════════════════════════════════════
const L4: Lesson = {
  id: "g2u3l4",
  unitId: "g2u3",
  premium: true,
  title: "평면거울의 상",
  subtitle: "거울 뒤 같은 거리, 같은 크기",
  label: "평면거울의 상",
  icon: "mirror",
  minutes: 9,
  standard: "책 104~105쪽",
  doneNote: "평면거울에서 상이 생기는 원리를 작도로 배웠어요",
  steps: steps(P.g2u3l4.intro, ...P.g2u3l4.body),
};

// ══════════════════════════════════════════════════════════
// 레슨 5. 거울과 렌즈 (책 106~111쪽)
// ══════════════════════════════════════════════════════════
const L5: Lesson = {
  id: "g2u3l5",
  unitId: "g2u3",
  premium: true,
  title: "거울과 렌즈",
  subtitle: "볼록·오목이 만드는 상의 변신",
  label: "거울과 렌즈",
  icon: "lens",
  minutes: 14,
  standard: "책 106~111쪽",
  doneNote: "거울·렌즈 4종의 상의 특징과 쓰임을 배웠어요",
  steps: steps(P.g2u3l5.intro, ...P.g2u3l5.body),
};

// ══════════════════════════════════════════════════════════
// 레슨 6. 빛의 합성 (책 112~115쪽)
// ══════════════════════════════════════════════════════════
const L6: Lesson = {
  id: "g2u3l6",
  unitId: "g2u3",
  premium: true,
  title: "빛의 합성",
  subtitle: "세 가지 빛으로 만드는 모든 색",
  label: "빛의 합성",
  icon: "rgb",
  minutes: 12,
  standard: "책 112~115쪽",
  doneNote: "물체의 색과 빛의 삼원색, 화소의 원리를 배웠어요",
  steps: steps(P.g2u3l6.intro, comic(comicStory("g2u3l6")), ...P.g2u3l6.body),
};

// ══════════════════════════════════════════════════════════
// 레슨 7. 파동의 발생과 전달 (책 120~121쪽)
// ══════════════════════════════════════════════════════════
const L7: Lesson = {
  id: "g2u3l7",
  unitId: "g2u3",
  premium: true,
  title: "파동의 발생과 전달",
  subtitle: "물은 제자리, 진동만 여행한다",
  label: "파동",
  icon: "wave",
  minutes: 10,
  standard: "책 120~121쪽",
  doneNote: "파동·매질과 파동의 네 요소를 배웠어요",
  steps: steps(P.g2u3l7.intro, ...P.g2u3l7.body),
};

// ══════════════════════════════════════════════════════════
// 레슨 8. 소리의 특성 (책 122~127쪽)
// ══════════════════════════════════════════════════════════
const L8: Lesson = {
  id: "g2u3l8",
  unitId: "g2u3",
  premium: true,
  title: "소리의 특성",
  subtitle: "세기·높낮이·음색, 소리의 3요소",
  label: "소리의 특성",
  icon: "note",
  minutes: 10,
  standard: "책 122~127쪽",
  doneNote: "소리의 3요소로 빛과 파동 단원 완주!",
  steps: steps(P.g2u3l8.intro, ...P.g2u3l8.body),
};

export const G2_UNIT3: Unit = {
  id: "g2u3",
  roman: "III",
  title: "빛과 파동",
  subtitle: "보이는 세상, 들리는 세상의 비밀",
  color: "#C838A6",
  icon: "prism",

  standard: "2022 개정 교육과정",
  lessons: [L1, L2, L3, L4, L5, L6, L7, L8],
};

// 검사 도구(qa/g2u3v5-lib.mjs)가 문제의 정답을 찾을 때 쓰는 단원 표. 개발 모드에서만 내놓는다.
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as { __g2u3v5?: unknown }).__g2u3v5 = G2_UNIT3;
}
