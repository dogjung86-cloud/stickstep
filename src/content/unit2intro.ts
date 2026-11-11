// 중1 Ⅱ 도입(훅) 다시 만들기 샘플(2026-11-11): 세 레슨의 도입만 새 형식(opener 스텝)으로 바꿔 끼운다.
// 병행 토글 뒤에서만 보인다. 꺼져 있으면 CURRICULUM의 Ⅱ단원은 UNIT2_V5 그대로다(같은 객체를 돌려준다).
//   켜기: 주소 ?u2intro (세션 "ss.u2intro"="1"로 남아 같은 탭에서는 유지된다)   끄기: 주소 ?u2intro=0
//   바로 열기: ?u2intro=u2l4 (샘플 도입으로 그 레슨을 연다)   지금 판으로 열기: ?u2intro=now:u2l4 (견주어 보기)
// 바뀌는 것은 도입 스텝 하나뿐이다. 랩, 개념, 정리, 문제는 정본 그대로다(도입 끝의 버튼 글은 정본과 같고, u2l2만 '부품'을 '구조'로 맞췄다).
//   u2l2 빵 공장       → factory  「빵 공장, 한 곳이 멈추면?」    내기를 걸고, 세 곳을 하나씩 멈춰 보며 확인한다(되돌릴 수 있는 스위치)
//   u2l4 피 한 방울    → longcell 「유난히 긴 세포, 얼마나 길까?」 내기를 걸고, 손으로 밀어 길이를 겪는다
//   u2l9 버섯 스캔     → baskets  「버섯은 어느 바구니에 넣을까?」 놓는 일이 곧 예측이다. 두 바구니가 모두 돌려보낸다
// 판정 자료: output/intro-redesign/README.md

import type { Lesson, Step } from "../lessons/types";
import { opener } from "./dsl";

const param = ((): string | null => {
  try {
    return new URLSearchParams(location.search).get("u2intro");
  } catch {
    return null;
  }
})();
const nowOnly = param?.startsWith("now:") ?? false;
const lessonOf = (v: string | null): string | null => {
  const id = (v ?? "").replace(/^now:/, "");
  return /^u2l\d+$/.test(id) ? id : null;
};

/** 샘플 도입이 켜져 있는가 */
export const U2_INTRO_ON = ((): boolean => {
  try {
    if (param === "0" || param === "off") sessionStorage.removeItem("ss.u2intro");
    else if (param !== null && !nowOnly) sessionStorage.setItem("ss.u2intro", "1");
    return !nowOnly && sessionStorage.getItem("ss.u2intro") === "1";
  } catch {
    return false;
  }
})();
/** 부팅하자마자 열 레슨(판정용 바로 열기). 없으면 null */
export const U2_INTRO_OPEN = lessonOf(param);

const SAMPLES: Record<string, Step> = {
  u2l2: opener({
    title: "빵 공장, 한 곳이 멈추면?",
    scene: "factory",
    wait: "세 곳을 하나씩 멈춰 보세요",
    cta: "세포 속 구조 알아보기",
  }),
  u2l4: opener({
    title: "유난히 긴 세포, 얼마나 길까?",
    scene: "longcell",
    wait: "세포를 끝까지 따라가 보세요",
    cta: "세포에게 일 맡기기",
  }),
  u2l9: opener({
    title: "버섯은 어느 바구니에 넣을까?",
    scene: "baskets",
    wait: "버섯을 바구니에 넣어 보세요",
    cta: "검색표에 생물 보내기",
  }),
};

/** 토글이 켜져 있으면 세 레슨의 첫 스텝(hook)을 샘플 도입으로 바꾼 단원을, 꺼져 있으면 받은 단원을 그대로 돌려준다. */
export function withU2IntroSamples<U extends { lessons: Lesson[] }>(unit: U): U {
  if (!U2_INTRO_ON) return unit;
  return {
    ...unit,
    lessons: unit.lessons.map((l) => (SAMPLES[l.id] && l.steps[0]?.type === "hook" ? { ...l, steps: [SAMPLES[l.id], ...l.steps.slice(1)] } : l)),
  };
}
