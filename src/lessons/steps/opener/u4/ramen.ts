// [Ⅳ단원 도입] u4l5 ramen: 「센 불이면 더 뜨거울까요?」
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
  c.ask("물이 끓고 있어요. 불을 더 세게 하면 물의 온도는 어떻게 될까요?", {
    choices: ["그대로다", "더 올라간다", "조금 내려간다"],
    neutral: true,
    good: "예측 완료! 버튼을 눌러 <b>불을 세게</b> 해 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      const b = ctlBtn(c, "불 더 세게");
      b.addEventListener("click", () => {
        if (lv >= M.levels) return;
        lv += 1;
        haptic(HAPTIC.tap);
        paint();
        if (lv < M.levels) {
          c.say("기포가 더 세차게 올라와요. <b>온도계</b>도 보면서 한 번 더 눌러요.");
          return;
        }
        b.disabled = true;
        haptic(HAPTIC.correct);
        c.face("surprised");
        c.stage.classList.add("done");
        const head = picked.startsWith("그대로") ? "예측대로" : "예측과 달리";
        c.say(`${head} 기포만 세졌고 온도계는 <b>그대로</b>예요. 열을 더 주는데 왜 그대로일까요?`);
        c.finish();
      });
    },
  });
}
