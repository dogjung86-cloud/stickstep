// [Ⅶ단원 도입] u7l6 u7-bittensun: 「한낮의 해가 왜 이지러질까요?」
// 형식: 내기를 걸고, 버튼을 꾹 눌러 시간을 보내며 관측 안경 속의 해가 가려지는 것을 본다.
// 이 장면은 끝에서 예측의 정오를 밝히지 않는다. 가린 것이 둥글다는 것만 보여 주고,
// 무엇인지는 바로 뒤의 랩(세 천체를 한 줄로)이 답한다.
// 정본 훅(sunglasses)은 답한 뒤 "달이 태양 앞을 지나가며 가린 것(일식)"이라고 바로 알려 줬다. 그 답은 랩으로 옮겼다.
// 사실: 일식 때 달이 해의 앞을 지나며 해가 한쪽부터 가려진다. 해는 맨눈으로 보면 안 되고 태양 관측 안경을 써야 한다.
// 가리는 둥근 것은 안경 속 하늘과 같은 색이라 파인 자리로만 드러난다(앱이 그 원을 옮긴다). 끝에서만 테두리를 보여 준다.
import { el } from "../../../../core/dom";
import type { OpenerCtx } from "../opener";
import { makeHold } from "./hold";

type Meta = (typeof import("../../../../ui/introArt.u7.generated"))["INTRO_META"];
const PICKS: Array<{ t: string; again: string }> = [
  { t: "달", again: "달이" },
  { t: "구름", again: "구름이" },
  { t: "지구의 그림자", again: "지구의 그림자가" },
];

export function bittenSun(c: OpenerCtx): void {
  const M = (c.meta as unknown as Meta).bittensun;
  c.stage.append(el("div", { class: "opn-layer", html: c.art.bittensunBase }));
  const moon = c.stage.querySelector<SVGElement>(".opn-u7-bs-moon");
  let pick = PICKS[0];
  const place = (p: number): void => {
    const x = M.from[0] + (M.to[0] - M.from[0]) * p;
    const y = M.from[1] + (M.to[1] - M.from[1]) * p;
    if (moon) moon.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  };
  const hold = makeHold(c, {
    cls: "opn-u7-btn hold",
    label: "시간 보내기",
    sub: "꾹 누르고 있어요",
    aria: "꾹 눌러 시간 보내기",
    need: 2600,
    onProgress: place,
    onLetGo: () => c.say("해가 더 가려질 것 같아요. 끝까지 <b>꾹</b> 눌러 주세요."),
    onDone: () => {
      c.stage.classList.add("done");
      c.face("surprised");
      c.say(`해를 가린 것은 <b>둥근 모양</b>이에요. 정말 ${pick.again} 가렸을까요? 세 천체를 한 줄로 세워 확인해요.`);
      c.finish();
    },
  });
  c.controls.style.gridTemplateColumns = "1fr";
  c.controls.append(hold.el);
  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  place(0);
  c.ask("한낮인데 관측 안경으로 본 해의 한쪽이 파였어요. 무엇이 해를 가리고 있을까요?", {
    choices: PICKS.map((p) => p.t),
    neutral: true,
    good: "예측 완료! 해는 꼭 관측 안경으로 봐요. <b>시간 보내기</b>를 꾹 눌러 보세요.",
    onDone: (picked) => {
      pick = PICKS.find((p) => p.t === picked) ?? PICKS[0];
      c.step.dataset.opnPhase = "play";
      c.controls.hidden = false;
      c.face("curious");
      hold.arm();
    },
  });
}
