// 중1 Ⅰ 도입(훅) 다시 만들기(2026-11-12): 첫 스텝이 hook인 세 레슨의 도입을 새 틀(opener 스텝)로 바꿔 끼운다.
// Ⅱ단원 샘플과 같은 병행 토글을 쓴다(unit2intro.ts의 U2_INTRO_ON: 주소 ?u2intro, 세션 "ss.u2intro").
// 꺼져 있으면 CURRICULUM의 Ⅰ단원은 UNIT1 그대로다(같은 객체를 돌려준다).
//   바로 열기: ?u2intro=u1l2 (이 도입으로 그 레슨을 연다)   지금 판으로 열기: ?u2intro=now:u1l2
// 바뀌는 것은 도입 스텝 하나뿐이다. 랩, 정리, 문제는 정본 그대로이고 도입 끝의 버튼 글도 정본과 같다.
// 첫 스텝이 만화(comic)인 u1l1, u1l3은 그대로 둔다.
//   u1l2 색컵        → suncups 「어느 컵이 가장 뜨거워질까?」      내기를 걸고, 해를 꾹 눌러 온도계를 올린다. 검은 컵만 그늘이었다
//   u1l4 스피커      → speaker 「말을 알아듣는 스피커, 비결은?」   내기를 걸고, 들려줄 양을 골라 들려주며 확인한다
//   u1l5 굴뚝 연기   → blanket 「지구를 덮은 기체, 두꺼워지면?」   내기를 걸고, 기체를 늘렸다 줄였다 하며 온도계를 본다

import type { Lesson, Step } from "../lessons/types";
import { opener } from "./dsl";
import { U2_INTRO_ON } from "./unit2intro";

/** 부팅하자마자 열 Ⅰ단원 레슨(판정용 바로 열기). 없으면 null */
export const U1_INTRO_OPEN = ((): string | null => {
  try {
    const id = (new URLSearchParams(location.search).get("u2intro") ?? "").replace(/^now:/, "");
    return /^u1l\d+$/.test(id) ? id : null;
  } catch {
    return null;
  }
})();

const OPENERS: Record<string, Step> = {
  u1l2: opener({
    title: "어느 컵이 가장 뜨거워질까?",
    scene: "suncups",
    wait: "해를 꾹 눌러 보세요",
    cta: "탐구 설계 시작",
  }),
  u1l4: opener({
    title: "말을 알아듣는 스피커, 비결은?",
    scene: "speaker",
    wait: "말을 들려주며 확인해 보세요",
    cta: "기술 카드 열기",
  }),
  u1l5: opener({
    title: "지구를 덮은 기체, 두꺼워지면?",
    scene: "blanket",
    wait: "기체를 늘렸다 줄여 보세요",
    cta: "실천 분류하기",
  }),
};

/** 토글이 켜져 있으면 세 레슨의 첫 스텝(hook)을 새 도입으로 바꾼 단원을, 꺼져 있으면 받은 단원을 그대로 돌려준다. */
export function withU1IntroSamples<U extends { lessons: Lesson[] }>(unit: U): U {
  if (!U2_INTRO_ON) return unit;
  return {
    ...unit,
    lessons: unit.lessons.map((l) => (OPENERS[l.id] && l.steps[0]?.type === "hook" ? { ...l, steps: [OPENERS[l.id], ...l.steps.slice(1)] } : l)),
  };
}
