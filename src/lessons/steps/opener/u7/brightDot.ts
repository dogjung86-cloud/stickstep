// [Ⅶ단원 도입] u7l1 u7-brightdot: 「저 밝은 점도 별일까요?」
// 형식: 내기를 걸고, 밝은 점을 꾹 눌러 망원경으로 확대한다. 끝에서 예측과 견준다.
//   1 밤하늘에 유난히 밝은 점 하나. 바로 예측(정오는 확대가 보여 준다).
//   2 점을 누르고 있는 동안 확대 창이 커진다. 손을 떼면 멈춘다.
//   3 끝: 고리를 두른 행성(토성)이다. "태양 둘레에는 또 누가 있을까"로 맺어 바로 뒤의 태양계 둘러보기로 넘긴다.
// 사실: 토성은 맨눈으로 별처럼 밝게 보이고 작은 망원경으로도 고리가 보인다.
// 행성은 스스로 빛나지 않는다는 말은 여기서 하지 않는다(랩과 정리의 몫).
import { el } from "../../../../core/dom";
import type { OpenerCtx } from "../opener";
import { makeHold, verdict } from "./hold";

type Meta = (typeof import("../../../../ui/introArt.u7.generated"))["INTRO_META"];
const PICKS = ["별이 아닌 다른 천체", "아주 밝은 별", "아주 가까운 별"];

export function brightDot(c: OpenerCtx): void {
  const meta = c.meta as unknown as Meta;
  const M = meta.brightdot;
  const S = meta.stage;
  const pct = (v: number, of: number): string => `${(v / of) * 100}%`;
  c.stage.append(el("div", { class: "opn-layer", html: c.art.brightdotBase }));
  const zoom = c.stage.querySelector<SVGElement>(".opn-u7-bd-zoom");
  let hit = true;
  const [hx, hy, hw, hh] = M.hit;
  const hold = makeHold(c, {
    cls: "opn-u7-hit",
    aria: "밝은 점을 꾹 눌러 확대하기",
    need: 1700,
    onProgress: (p) => zoom?.style.setProperty("--z", String(p)),
    onLetGo: () => c.say("손을 떼니 확대가 멈췄어요. 끝까지 <b>꾹</b> 눌러 주세요."),
    onDone: () => {
      c.stage.classList.add("done");
      c.face("surprised");
      c.say(`${verdict(hit)} 별이 아니에요. 고리를 두른 <b>행성</b>, 토성이에요. 태양 둘레에는 또 누가 있을까요?`);
      c.finish();
    },
  });
  Object.assign(hold.el.style, { left: pct(hx, S.w), top: pct(hy, S.h), width: pct(hw, S.w), height: pct(hh, S.h) });
  c.stage.append(hold.el);
  c.step.dataset.opnPhase = "ask";
  c.ask("밤하늘에 유난히 밝은 점이 하나 있어요. 이 점은 무엇일까요?", {
    choices: PICKS,
    neutral: true,
    good: "예측 완료! <b>밝은 점</b>을 꾹 눌러 망원경으로 확대해 보세요.",
    onDone: (picked) => {
      hit = picked === PICKS[0];
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.face("curious");
      hold.arm();
    },
  });
}
