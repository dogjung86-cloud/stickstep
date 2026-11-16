// [도입] u2l10 beeswitch: 「꿀벌이 사라져도 식탁에 그대로 남는 음식은?」
// 형식: 내기를 걸고(빵, 사과, 딸기), 되돌릴 수 있는 스위치로 꿀벌을 없앴다가 다시 부르며 확인한다.
//   1 식탁에 사과, 딸기, 빵. 위에 꿀벌. 처음 화면에서 바로 예측한다.
//   2 스위치를 끄면 꿀벌이 사라지고 사과와 딸기가 줄어든다. 빵은 그대로다. 다시 켜면 돌아온다.
//   3 껐다가 다시 켜면 끝. 쌤이 예측과 견주어 말하고 랩(생물 하나를 빼면)으로 넘긴다.
// 사실 가드(근거: output/intro-redesign/research/intro-research.md 2부 C)
//   · 귤은 쓰지 않는다(꽃가루받이 없이도 열매가 맺힌다). 사과는 "사라진다"가 아니라 "크게 준다", 딸기는 "준다".
//   · 빵의 밀은 꿀벌 없이도 낟알을 맺는다. 그래서 빵은 그대로다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { OpenerCtx } from "./opener";

type Key = "apple" | "berry" | "bread";
const KEYS: Key[] = ["apple", "berry", "bread"];
const NAME: Record<Key, string> = { apple: "사과", berry: "딸기", bread: "빵" };
const OFF: Record<Key, string> = { apple: "크게 줄어요", berry: "줄어요", bread: "그대로예요" };
const PICKS = ["빵", "사과", "딸기"];

export function beeSwitch(c: OpenerCtx): void {
  const M = c.meta.beeswitch;
  const S = c.meta.stage;
  const pct = (v: number, of: number): string => `${(v / of) * 100}%`;

  c.stage.append(el("div", { class: "opn-layer", html: c.art.beeswitchBase }));
  const subs = {} as Record<Key, HTMLElement>;
  for (const key of KEYS) {
    subs[key] = el("i", { text: "" });
    c.stage.append(
      el("div", { class: "opn-tag opn-bs-tag", attrs: { "data-key": key }, style: { left: pct(M.items[key] - 120, S.w), top: pct(M.table + 14, S.h), width: pct(240, S.w) } }, el("span", {}, el("b", { text: NAME[key] }), subs[key])),
    );
  }
  const label = el("span", { text: "꿀벌 스위치 끄기" });
  const btn = el("button", { class: "opn-switch", attrs: { type: "button", "aria-pressed": "true" } }, el("i", {}), label) as HTMLButtonElement;
  c.controls.appendChild(btn);

  let phase: "ask" | "play" | "done" = "ask";
  let pick = PICKS[0];
  let on = true;
  let tried = false;

  function paint(): void {
    c.stage.classList.toggle("off", !on);
    btn.classList.toggle("off", !on);
    btn.setAttribute("aria-pressed", String(on));
    label.textContent = on ? "꿀벌 스위치 끄기" : "꿀벌 다시 부르기";
    for (const key of KEYS) subs[key].textContent = on ? "" : OFF[key];
    c.step.dataset.opnBee = on ? "on" : "off";
  }

  btn.addEventListener("click", () => {
    if (phase === "ask") return;
    on = !on;
    haptic(on ? HAPTIC.tap : HAPTIC.wrong);
    paint();
    if (!on) {
      tried = true;
      c.face("surprised");
      // 쌤의 말은 390px 폰에서 세 줄 안쪽(2026-11-16): 다른 예측 쪽 "줄어들고"를 "줄고"로(네 줄이었다)
      c.say(`${pick === PICKS[0] ? "예측대로 빵은 그대로 남았어요!" : "사과와 딸기는 줄고 빵만 그대로 남았어요!"} 빵을 만드는 밀은 바람이 꽃가루를 날라 주어 <b>꿀벌이 없어도</b> 열매를 맺거든요. 이제 스위치를 다시 눌러 꿀벌을 불러 보세요.`);
      return;
    }
    if (!tried || phase === "done") return;
    phase = "done";
    c.face("smile");
    c.say("꿀벌이 돌아오니 사과와 딸기도 다시 풍성하게 열렸어요! 그렇다면 생태계에서 다른 생물이 사라지면 어떤 일이 벌어질까요?");
    c.finish();
  });

  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  paint();
  c.ask("꽃가루를 옮겨 주는 꿀벌이 갑자기 사라진다면, 사과, 딸기, 빵 가운데 우리 식탁에 거의 <b>그대로</b> 남는 음식은 무엇일까요?", {
    choices: PICKS,
    neutral: true,
    good: "예측 완료! 아래 <b>꿀벌 스위치 끄기</b> 버튼을 눌러 결과를 확인해 보세요.",
    onDone: (picked) => {
      pick = PICKS.find((p) => p === picked) ?? PICKS[0];
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.controls.hidden = false;
      c.face("curious");
    },
  });
}
