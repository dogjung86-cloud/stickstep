// [Ⅳ단원 도입] u4l5 ramen: 「물이 끓을 때 불을 더 세게 하면 물이 더 뜨거워질까요?」
// 내기: 끓고 있는 물에 불을 더 세게 하면 물의 온도는 어떻게 될까(정오를 매기지 않는다).
// 손으로 하는 일: 버튼을 눌러 불을 세 번 키운다. 불꽃과 기포는 커지는데 온도계의 기둥은 움직이지 않는다.
// 도입은 까닭(받은 열에너지가 상태 변화에 쓰인다)을 말하지 않는다. 바로 뒤의 가열 곡선 랩이 받는다.
// 온도계에는 숫자가 없다(기둥의 높이만 본다).
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { ctlBtn, layer, metaOf } from "./common";

export function ramen(c: OpenerCtx): void {
  const M = metaOf(c).ramen;
  layer(c, "ramenBase");
  const flame = c.stage.querySelector<SVGGElement>(".opn-u4-rm-flame");
  let lv = 1;
  const paint = (): void => {
    c.stage.dataset.lv = String(lv);
    if (flame) flame.style.transform = `scale(${1 + 0.32 * (lv - 1)}, ${1 + 0.5 * (lv - 1)})`;
    c.step.dataset.opnLv = String(lv);
  };
  paint();
  c.step.dataset.opnPhase = "ask";
  // choices[0]이 옳은 예측이고 "그대로"로 시작해야 한다(끝의 말머리가 picked.startsWith("그대로")로 가른다)
  c.ask("냄비의 물이 보글보글 끓고 있어요. 이때 불을 더 세게 하면 끓는 물의 온도는 어떻게 될까요?", {
    choices: ["그대로 일정하다", "100℃보다 더 올라간다", "조금 내려간다"],
    neutral: true,
    good: "좋아요! 아래 버튼을 눌러 <b>불을 더 세게</b> 키워 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      const b = ctlBtn(c, "불 더 세게 하기");
      b.addEventListener("click", () => {
        if (lv >= M.levels) return;
        lv += 1;
        haptic(HAPTIC.tap);
        paint();
        if (lv < M.levels) {
          c.say("기포가 더 활발하게 올라오네요! <b>온도계 눈금</b>이 변하는지 확인하며 버튼을 한 번 더 눌러 보세요.");
          return;
        }
        b.disabled = true;
        haptic(HAPTIC.correct);
        c.face("surprised");
        c.stage.classList.add("done");
        const head = picked.startsWith("그대로") ? "예측대로" : "예측과 달리";
        c.say(`${head} 불을 세게 해도 기포만 더 활발해질 뿐 물의 온도는 <b>100℃ 그대로</b>예요! 열을 계속 가하는데도 왜 온도가 올라가지 않을까요?`);
        c.finish();
      });
    },
  });
}
