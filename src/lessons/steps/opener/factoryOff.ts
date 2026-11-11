// [도입 샘플 3] u2l2 factory: 「빵 공장, 한 곳이 멈추면?」
// 형식: 내기를 걸고, 잘 돌아가는 것을 직접 멈춰 보며 확인한다(되돌릴 수 있는 스위치). 멈춘 곳마다 다른 탈이 무대에서 보인다.
//   1 처음 화면: 빵 공장이 돌아가고 있다(출입문으로 밀가루가 들어오고, 화덕에서 빵이 나와 상자에 쌓인다).
//     바로 예측: 한 곳이 멈추면 탄 빵이 나온다는데, 어디일까(정오를 매기지 않는다. 답은 손으로 확인한다).
//   2 시설 카드(또는 그림 속 시설)를 누르면 그 시설만 멈춘다. 다시 누르면 일한다. 한 번에 하나만 멈춘다.
//       출입문: 밀가루가 못 들어온다 → 기계는 도는데 구울 반죽이 없다
//       통제실: 조절이 안 된다 → 빵이 타거나 덜 익어서 나온다
//       발전기: 전기가 끊긴다 → 기계가 모두 멎는다
//   3 셋을 다 멈춰 보고 공장을 다시 살리면 끝: 쌤이 예측과 견주어 말하고(탄 빵은 통제실), "멈춘 곳마다 탈이 다르다.
//      세포에서도 그럴까"로 넘긴다. 세포막을 문 하나로 여기지 않게 맺는 말에서는 시설 이름을 세포에 대지 않는다.
//      바로 뒤 랩의 제목이 「세포의 구조, 멈추면 어떻게 될까?」이고, 랩의 조작(구조 카드를 눌러 멈춘다)도 같다.
// 탈의 모양은 랩(cellWorkLab)과 짝을 맞췄다: 세포막이 멈추면 양분이 못 들어오고, 핵이 멈추면 조절이 안 되고,
// 마이토콘드리아가 멈추면 움직임이 멎는다. 도입은 세포의 구조 이름을 말하지 않는다(이름은 다음 개념 스텝이 붙인다).
// 과학 가드: 통제실이 멈춘 모습을 "기계가 날뛴다"로 그리지 않는다(조절이 끊긴 것이지 폭주가 아니다).
// 움직임은 CSS 키프레임이고 상태는 무대의 클래스(off-door, off-ctrl, off-gen)로 바꾼다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { OpenerCtx } from "./opener";

type Key = "door" | "ctrl" | "gen";
const KEYS: Key[] = ["door", "ctrl", "gen"];
const NAME: Record<Key, string> = { door: "출입문", ctrl: "통제실", gen: "발전기" };
const OFF_SAY: Record<Key, string> = {
  door: "문이 닫혀 <b>밀가루</b>가 못 들어와요. 기계는 도는데 구울 반죽이 없어요.",
  ctrl: "<b>조절</b>이 안 돼요. 빵이 타거나 덜 익어서 나와요.",
  gen: "<b>전기</b>가 끊겨 기계가 모두 멎었어요.",
};
// 예측은 증상을 보고 멈춘 곳을 짚는 물음이다(랩의 판정과 같은 꼴). 보기는 시설 이름 셋이라 길이와 말투가 나란하다.
const PICKS: Array<{ t: string; verdict: string }> = [
  { t: "통제실", verdict: "예측대로예요. 탄 빵은 <b>통제실</b>이 멈췄을 때 나왔어요." },
  { t: "발전기", verdict: "탄 빵은 <b>통제실</b>이 멈췄을 때 나왔어요. 발전기가 멈추면 기계가 멎었죠." },
  { t: "출입문", verdict: "탄 빵은 <b>통제실</b>이 멈췄을 때 나왔어요. 출입문이 멈추면 반죽이 떨어졌죠." },
];

export function factoryOff(c: OpenerCtx): void {
  const M = c.meta.factory;
  const S = c.meta.stage;
  const pct = (v: number, of: number): string => `${(v / of) * 100}%`;

  c.stage.append(el("div", { class: "opn-layer", html: c.art.factoryBase }));
  const tags = {} as Record<Key, HTMLElement>;
  const cards = {} as Record<Key, { btn: HTMLButtonElement; sub: HTMLElement }>;
  for (const key of KEYS) {
    const [hx, hy, hw, hh] = M.hit[key];
    const [tx, ty] = M.tag[key];
    const hit = el("button", {
      class: "opn-fc-hit",
      attrs: { type: "button", "aria-label": `${NAME[key]} 멈추거나 다시 일하게 하기`, "data-key": key },
      style: { left: pct(hx, S.w), top: pct(hy, S.h), width: pct(hw, S.w), height: pct(hh, S.h) },
    });
    hit.addEventListener("click", () => toggle(key));
    tags[key] = el("div", { class: "opn-tag opn-fc-tag", style: { left: pct(tx - 90, S.w), top: pct(ty, S.h), width: pct(180, S.w) } }, el("span", { text: NAME[key] }));
    c.stage.append(hit, tags[key]);
    const sub = el("span", { class: "opn-fc-sub", text: "일하는 중" });
    const btn = el("button", { class: "opn-fc-card", attrs: { type: "button", "data-key": key, "aria-pressed": "false" } }, el("b", { text: NAME[key] }), sub) as HTMLButtonElement;
    btn.addEventListener("click", () => toggle(key));
    cards[key] = { btn, sub };
    c.controls.appendChild(btn);
  }

  let off: Key | null = null;
  let phase: "ask" | "play" | "done" = "ask";
  let pred = PICKS[0];
  const tried = new Set<Key>();

  function paint(): void {
    for (const key of KEYS) {
      const isOff = off === key;
      c.stage.classList.toggle(`off-${key}`, isOff);
      tags[key].classList.toggle("off", isOff);
      cards[key].btn.classList.toggle("off", isOff);
      cards[key].btn.classList.toggle("tried", tried.has(key));
      cards[key].btn.setAttribute("aria-pressed", String(isOff));
      cards[key].sub.textContent = isOff ? "멈춤" : tried.has(key) ? "해 봤어요" : "일하는 중";
    }
    c.step.dataset.opnOff = off ?? "";
    c.step.dataset.opnTried = KEYS.filter((x) => tried.has(x)).join(",");
  }

  function wrapUp(): void {
    phase = "done";
    c.stage.classList.add("closed");
    c.face("smile");
    c.say(`${pred.verdict} 멈춘 곳마다 탈이 달라요. 세포에도 이런 일을 하는 구조들이 있어요. 세포에서도 그럴까요?`);
    c.finish();
  }

  function toggle(key: Key): void {
    if (phase !== "play") return;
    const all = (): boolean => tried.size === KEYS.length;
    if (off === key) {
      off = null;
      haptic(HAPTIC.tap);
      paint();
      if (all()) {
        wrapUp();
        return;
      }
      c.face("smile");
      c.say("다시 잘 돌아가요. 다른 곳도 <b>멈춰</b> 보세요.");
      return;
    }
    off = key;
    tried.add(key);
    haptic(HAPTIC.wrong);
    c.face(key === "gen" ? "surprised" : "curious");
    paint();
    c.say(all() ? `${OFF_SAY[key]} 이제 다시 눌러 공장을 살려 주세요.` : OFF_SAY[key]);
  }

  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  paint();
  c.ask("밀가루가 들어오고 빵이 구워져 나오는 공장이에요. 그런데 한 곳이 멈추면 <b>탄 빵</b>이 나온대요. 어디일까요?", {
    choices: PICKS.map((p) => p.t),
    neutral: true,
    good: "예측 완료! 이제 세 곳을 <b>하나씩 멈춰</b> 보며 확인해요.",
    onDone: (picked) => {
      pred = PICKS.find((p) => p.t === picked) ?? PICKS[0];
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.step.dataset.opnPred = String(PICKS.indexOf(pred));
      c.stage.classList.add("play");
      c.controls.hidden = false;
      c.face("curious");
    },
  });
}
