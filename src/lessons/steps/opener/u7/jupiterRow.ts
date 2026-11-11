// [Ⅶ단원 도입] u7l2 u7-jupiterrow: 「목성 옆에 지구를 세우면?」
// 형식: 내기를 걸고, 버튼을 꾹 눌러 목성의 지름에 지구를 하나씩 세운다. 끝에서 예측과 견준다.
// 사실: 목성의 지름은 지구의 약 11.2배다(지구 열한 개가 한 줄로 선다).
// 맺는 물음("이렇게 큰 행성이 또 있을까")을 바로 뒤의 행성 그래프 랩이 받는다.
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { makeHold, verdict } from "./hold";

const PICKS = ["11개쯤", "3개쯤", "6개쯤"];
const N = 11;

export function jupiterRow(c: OpenerCtx): void {
  c.stage.append(el("div", { class: "opn-layer", html: c.art.jupiterrowBase }));
  const earths = Array.from({ length: N }, (_, i) => c.stage.querySelector<SVGElement>(`.opn-u7-jr-e.e${i + 1}`));
  let hit = true;
  let shown = 0;
  const hold = makeHold(c, {
    cls: "opn-u7-btn hold",
    label: "지구 세우기",
    sub: "꾹 누르고 있어요",
    aria: "꾹 눌러 지구를 한 줄로 세우기",
    need: 2600,
    onProgress: (p) => {
      const n = Math.min(N, Math.floor(p * N + 0.0001));
      if (n !== shown) {
        shown = n;
        haptic(HAPTIC.tap);
        earths.forEach((e, i) => e?.classList.toggle("on", i < n));
        c.step.dataset.opnCount = String(n);
      }
    },
    onLetGo: () => c.say("아직 자리가 남았어요. 끝까지 <b>꾹</b> 눌러 주세요."),
    onDone: () => {
      c.face("surprised");
      c.say(`${verdict(hit)} 지구가 <b>열한 개</b>쯤 들어가요. 이렇게 큰 행성이 또 있을까요? 여덟 행성을 견줘 봐요.`);
      c.finish();
    },
  });
  c.controls.style.gridTemplateColumns = "1fr";
  c.controls.append(hold.el);
  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  c.ask("가장 큰 행성인 목성이에요. 목성의 지름에 지구를 한 줄로 세우면 몇 개쯤 들어갈까요?", {
    choices: PICKS,
    neutral: true,
    good: "예측 완료! <b>지구 세우기</b>를 꾹 눌러 직접 세워 보세요.",
    onDone: (picked) => {
      hit = picked === PICKS[0];
      c.step.dataset.opnPhase = "play";
      c.controls.hidden = false;
      c.face("curious");
      hold.arm();
    },
  });
}
