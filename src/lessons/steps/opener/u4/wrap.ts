// [Ⅳ단원 도입] u4l4 wrap: 「국그릇의 랩은 어떻게 될까요?」
// 내기: 뜨거운 국그릇에 랩을 씌우고 기다리면 랩은 어떻게 될까(정오를 매기지 않는다).
// 손으로 하는 일: 꾹 눌러 시간을 보내면 랩이 볼록해지고, 식을 때까지 더 누르면 오목해진다.
// 도입은 까닭(기화하면 부피가 늘어난다)을 말하지 않는다. 뒤의 올리브유 랩과 풍선 랩이 받는다.
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { ctlBtn, hold, layer } from "./common";

const FLAT = 0.05;

export function wrap(c: OpenerCtx): void {
  layer(c, "wrapBase");
  const dome = c.stage.querySelector<SVGGElement>(".opn-u4-wr-wrap");
  const set = (k: number): void => {
    if (dome) dome.style.transform = `scaleY(${k.toFixed(3)})`;
    c.step.dataset.opnWrap = k.toFixed(2);
  };
  set(FLAT);
  c.step.dataset.opnPhase = "ask";
  c.ask("뜨거운 국그릇에 랩을 씌웠어요. 잠시 뒤 랩은 어떻게 될까요?", {
    choices: ["볼록하게 부푼다", "그대로 평평하다", "오목하게 들어간다"],
    neutral: true,
    good: "예측 완료! 버튼을 <b>꾹 눌러</b> 시간을 보내 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "hot";
      c.stage.classList.add("hot");
      c.face("curious");
      const b1 = ctlBtn(c, "꾹 눌러 기다리기");
      hold(c, b1, 2600, (p) => set(FLAT + (1 - FLAT) * p), () => {
        haptic(HAPTIC.correct);
        c.step.dataset.opnPhase = "cool";
        c.say("랩이 <b>볼록</b>해졌어요! 이제 국이 식을 때까지 더 눌러 보세요.");
        const b2 = ctlBtn(c, "꾹 눌러 식히기");
        hold(c, b2, 2600, (p) => {
          set(1 - 1.4 * p);
          if (p > 0.3) c.stage.classList.remove("hot");
        }, () => {
          haptic(HAPTIC.correct);
          c.face("surprised");
          c.stage.classList.add("done");
          const head = picked.startsWith("볼록") ? "예측대로 볼록해졌다가" : "예측과 달리 볼록해졌다가";
          c.say(`${head} 식으니 <b>오목</b>해졌어요. 무엇이 랩을 밀어 올렸을까요?`);
          c.finish();
        });
      });
    },
  });
}
