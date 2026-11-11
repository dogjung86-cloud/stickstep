// [도입] u2l8 shelves: 「토마토, 과일 칸일까 채소 칸일까?」
// 형식: 자신 있게 놓았는데 친구가 다른 칸으로 옮긴다. 놓는 일이 곧 예측이다(보기 고르기가 없다).
//   1 과일 상자(사과), 채소 상자(당근), 가운데 뒤에 친구, 바닥에 토마토. 상자를 눌러 토마토를 놓는다.
//   2 내가 놓은 칸에 내 까닭이 이름표로 붙는다. 곧 친구가 다른 까닭을 대며 토마토를 반대 칸으로 옮긴다.
//   3 두 까닭이 두 상자 위에 나란히 남는다. 기준이 다르면 자리도 달라진다는 것을 보고 랩(박쥐)으로 넘긴다.
// 까닭 둘은 둘 다 그럴듯한 기준이다(열매인가, 어떻게 먹는가). 어느 쪽이 옳다고 말하지 않는다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { OpenerCtx } from "./opener";

type Side = "fruit" | "veg";
const NAME: Record<Side, string> = { fruit: "과일 칸", veg: "채소 칸" };
const WHY: Record<Side, string> = { fruit: "열매니까 과일!", veg: "반찬이니까 채소!" };

export function shelves(c: OpenerCtx): void {
  const M = c.meta.shelves;
  const S = c.meta.stage;
  const pct = (v: number, of: number): string => `${(v / of) * 100}%`;
  const X: Record<Side, number> = { fruit: M.fruitX, veg: M.vegX };

  c.stage.append(el("div", { class: "opn-layer", html: c.art.shelvesBase }));
  const caps = {} as Record<Side, HTMLElement>;
  (["fruit", "veg"] as Side[]).forEach((side) => {
    const x = X[side];
    const hit = el("button", {
      class: "opn-sh-hit",
      attrs: { type: "button", "aria-label": `${NAME[side]}에 토마토 놓기`, "data-side": side },
      style: { left: pct(x - 170, S.w), top: pct(96, S.h), width: pct(340, S.w), height: pct(310, S.h) },
    });
    hit.addEventListener("click", () => put(side));
    const tag = el("div", { class: "opn-tag opn-sh-tag", text: NAME[side], style: { left: pct(x - 78, S.w), top: pct(M.top + 46, S.h), width: pct(156, S.w), height: pct(64, S.h) } });
    caps[side] = el("div", { class: "opn-sh-why", attrs: { "data-side": side }, style: { left: pct(x - 170, S.w), top: pct(34, S.h), width: pct(340, S.w) } }, el("span", {}));
    c.stage.append(hit, tag, caps[side]);
  });
  const tom = el("div", {
    class: "opn-sh-tom",
    html: c.art.shelvesTomato,
    attrs: { role: "img", "aria-label": "토마토" },
    style: { left: pct(M.homeX - M.tomW / 2, S.w), top: pct(M.homeY - M.tomW + 6, S.h), width: pct(M.tomW, S.w), height: pct(M.tomW, S.h) },
  });
  c.stage.append(tom);

  let phase: "play" | "busy" | "done" = "play";
  const k = (): number => (c.stage.clientWidth || S.w) / S.w;
  const hop = (side: Side, ms: number): void => {
    tom.style.transition = `transform ${ms}ms var(--spring)`;
    tom.style.transform = `translate(${(X[side] - M.homeX) * k()}px, ${(M.landY - M.homeY) * k()}px) scale(.8)`;
  };
  const why = (side: Side, who: string): void => {
    (caps[side].firstElementChild as HTMLElement).textContent = `${who}: ${WHY[side]}`;
    caps[side].classList.add("on", who === "나" ? "me" : "pal");
  };

  function put(side: Side): void {
    if (phase !== "play") return;
    phase = "busy";
    const other: Side = side === "fruit" ? "veg" : "fruit";
    c.stage.classList.add("tried");
    c.step.dataset.opnPut = side;
    haptic(HAPTIC.tap);
    hop(side, 420);
    why(side, "나");
    c.face("smile");
    c.say(`${NAME[side]}에 놓았어요. 어, 친구가 다시 집어 가요!`);
    c.later(() => {
      haptic(HAPTIC.wrong);
      hop(other, 520);
      why(other, "친구");
      c.face("surprised");
    }, 1300);
    c.later(() => {
      phase = "done";
      c.stage.classList.add("done");
      c.face("curious");
      c.say("<b>기준</b>이 다르니 자리도 달라져요. 생물은 무엇을 기준으로 나눌까요?");
      c.finish();
    }, 2500);
  }

  c.step.dataset.opnPhase = "play";
  c.say("<b>토마토</b>는 어느 칸에 놓을까요? 상자를 눌러 놓아 보세요.");
}
