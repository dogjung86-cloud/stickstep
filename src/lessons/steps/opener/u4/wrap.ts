// [Ⅳ단원 도입] u4l4 wrap: 「뜨거운 국그릇에 씌운 랩은 어떻게 될까요?」
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
  const dent = c.stage.querySelector<SVGGElement>(".opn-u4-wr-dent");
  const set = (k: number): void => {
    if (dome) dome.style.transform = `scaleY(${k.toFixed(3)})`;
    c.step.dataset.opnWrap = k.toFixed(2);
  };
  set(FLAT);
  c.step.dataset.opnPhase = "ask";
  // 보기 앞에 '위로', '아래로'가 붙어 끝의 말머리는 startsWith가 아니라 includes("볼록"), includes("오목")로 가른다
  c.ask("갓 끓인 뜨거운 국그릇에 랩을 씌웠어요. 잠시 뒤 랩은 어떻게 변할까요?", {
    choices: ["위로 볼록하게 부풀어 오른다", "처음 그대로 평평하다", "아래로 오목하게 들어간다"],
    neutral: true,
    good: "좋아요! 아래 버튼을 <b>꾹 눌러</b> 랩이 어떻게 변하는지 살펴보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "hot";
      c.stage.classList.add("hot");
      c.face("curious");
      const b1 = ctlBtn(c, "꾹 눌러 변화 관찰하기");
      hold(c, b1, 2600, (p) => set(FLAT + (1 - FLAT) * p), () => {
        haptic(HAPTIC.correct);
        c.step.dataset.opnPhase = "cool";
        c.say("랩이 위로 <b>볼록하게</b> 부풀어 올랐어요! 이제 국이 식으면 어떻게 될지 한 번 더 꾹 눌러 보세요.");
        const b2 = ctlBtn(c, "꾹 눌러 국 식히기");
        hold(c, b2, 2600, (p) => {
          // 앞의 절반은 볼록한 랩이 내려앉고, 뒤의 절반은 그릇 안쪽으로 오목하게 처진다
          set(Math.max(FLAT, 1 - 2 * p));
          if (dent) {
            dent.style.opacity = p > 0.5 ? "1" : "0";
            dent.style.transform = `scaleY(${Math.max(0, (p - 0.5) * 2).toFixed(3)})`;
          }
          if (dome) dome.style.opacity = p > 0.5 ? "0" : "1";
          if (p > 0.3) c.stage.classList.remove("hot");
        }, () => {
          haptic(HAPTIC.correct);
          c.face("surprised");
          c.stage.classList.add("done");
          const head = picked.includes("볼록") ? "예측대로 볼록해졌다가" : picked.includes("오목") ? "먼저 볼록해졌다가" : "예측과 달리 볼록해졌다가";
          c.say(`${head} 국이 식으니 다시 <b>오목하게</b> 들어갔어요! 그릇 안에서 무엇이 변했기에 랩을 밀어 올렸다가 다시 들어가게 했을까요?`);
          c.finish();
        });
      });
    },
  });
}
