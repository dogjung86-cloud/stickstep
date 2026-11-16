// [Ⅳ단원 도입] u4l1 lid: 「맛있는 냄새는 멀리까지 퍼질까요?」
// 내기: 급식실 통의 뚜껑을 열면 멀리 있는 친구도 냄새를 맡을까(정오를 매기지 않는다).
// 손으로 하는 일: 버튼을 꾹 눌러 뚜껑을 든다. 냄새가 가까운 친구에게 먼저, 먼 친구에게 나중에 닿는다.
// 도입은 까닭(입자가 스스로 움직인다)을 말하지 않는다. 바로 뒤의 잉크 랩이 받는다.
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { ctlBtn, hold, layer, metaOf } from "./common";

export function lid(c: OpenerCtx): void {
  const M = metaOf(c).lid;
  layer(c, "lidBase");
  const lidEl = c.stage.querySelector<SVGGElement>(".opn-u4-ld-lid");
  const smells = Array.from(c.stage.querySelectorAll<SVGGElement>(".opn-u4-ld-sm"));
  const em1 = c.stage.querySelector<SVGGElement>(".opn-u4-ld-em.e1");
  const em2 = c.stage.querySelector<SVGGElement>(".opn-u4-ld-em.e2");
  let near = false;
  const paint = (p: number): void => {
    if (lidEl) lidEl.style.transform = `translate(${-26 * p}px, ${-96 * p}px) rotate(${-12 * p}deg)`;
    smells.forEach((g, i) => g.classList.toggle("on", p >= M.smell[i]));
    em1?.classList.toggle("on", p >= M.near);
    em2?.classList.toggle("on", p >= 1);
    if (!near && p >= M.near) {
      near = true;
      haptic(HAPTIC.tap);
      c.say("가까이 있는 친구가 먼저 냄새를 맡았어요! 멀리 있는 친구에게도 닿을 때까지 계속 <b>꾹</b> 눌러 보세요.");
    }
    c.step.dataset.opnP = p.toFixed(2);
  };
  paint(0);
  c.step.dataset.opnPhase = "ask";
  // choices[0]이 옳은 예측이고 "조금 뒤"로 시작해야 한다(끝의 말머리가 picked.startsWith("조금 뒤")로 가른다)
  c.ask("급식실 카레 통의 뚜껑을 열면 멀리 서 있는 친구도 냄새를 맡을 수 있을까요?", {
    choices: ["조금 뒤에 멀리 있는 친구도 맡는다", "가까이 있는 친구만 맡는다", "두 친구가 동시에 맡는다"],
    neutral: true,
    good: "좋아요! 이제 아래 버튼을 <b>꾹 눌러</b> 뚜껑을 열어 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      const b = ctlBtn(c, "꾹 눌러 뚜껑 열고 지켜보기");
      hold(c, b, 3000, paint, () => {
        haptic(HAPTIC.correct);
        c.face("surprised");
        const head = picked.startsWith("조금 뒤") ? "예측대로" : "예측과 달리";
        c.say(`${head} 멀리 있는 친구도 <b>조금 뒤에</b> 냄새를 맡았어요! 바람이 불지 않는데도 냄새는 어떻게 저절로 퍼져 나갔을까요?`);
        c.finish();
      });
    },
  });
}
