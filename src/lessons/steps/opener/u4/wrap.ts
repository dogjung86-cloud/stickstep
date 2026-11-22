// [Ⅳ단원 도입] u4l4 wrap: 「따뜻한 물을 조금 넣고 닫은 페트병은 어떻게 될까요?」
// 내기: 따뜻한 물을 조금 넣고 뚜껑을 꼭 닫은 얇은 페트병을 뜨거운 물에 담갔다가 얼음물로 옮기면 병은 어떻게 될까(정오를 매기지 않는다).
// 손으로 하는 일: 꾹 눌러 병을 뜨거운 물 대야에 담그면 병이 볼록해지고, 다시 꾹 눌러 얼음물 대야로 옮기면 찌그러지며 안쪽에 물방울이 맺힌다.
// 데우는 단계를 넣은 까닭: 닫은 병을 식히기만 하면 찌그러지기만 한다. 부풀었다가 찌그러지는 두 방향을 모두 보이려고 먼저 데운다.
// 도입은 까닭(기화하면 부피가 늘고 액화하면 준다)을 말하지 않는다. 뒤의 식용유 랩과 풍선 랩이 받는다.
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { ctlBtn, hold, layer, metaOf } from "./common";

const BULGE = 0.16; // 뜨거운 물에서 병이 가로로 부푸는 정도

export function wrap(c: OpenerCtx): void {
  const M = metaOf(c).wrap;
  layer(c, "wrapBase");
  const move = c.stage.querySelector<SVGGElement>(".opn-u4-bt-move");
  const body = c.stage.querySelector<SVGGElement>(".opn-u4-bt-body");
  const dent = c.stage.querySelector<SVGGElement>(".opn-u4-bt-dent");
  const dew = c.stage.querySelector<SVGGElement>(".opn-u4-bt-dew");
  const at = (p: readonly number[]): void => {
    if (move) move.style.transform = `translate(${p[0] - M.start[0]}px, ${p[1] - M.start[1]}px)`;
  };
  const lerp = (a: readonly number[], b: readonly number[], k: number): number[] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const puff = (k: number): void => {
    if (body) body.style.transform = `scaleX(${(1 + BULGE * k).toFixed(3)})`;
    c.step.dataset.opnWrap = k.toFixed(2);
  };
  puff(0);
  c.step.dataset.opnPhase = "ask";
  // 보기의 앞말이 겹치지 않아 끝의 말머리는 startsWith로 가른다
  c.ask("따뜻한 물을 조금 넣고 뚜껑을 꼭 닫은 얇은 페트병이에요. 뜨거운 물에 담갔다가 얼음물로 옮기면 병은 어떻게 될까요?", {
    choices: ["볼록해졌다가 찌그러진다", "처음 모양 그대로다", "찌그러졌다가 볼록해진다"],
    neutral: true,
    good: "좋아요! 아래 버튼을 <b>꾹 눌러</b> 병을 뜨거운 물에 담가 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "hot";
      c.face("curious");
      const b1 = ctlBtn(c, "꾹 눌러 뜨거운 물에 담그기");
      hold(c, b1, 2600, (p) => {
        // 앞의 3할은 대야로 옮기고, 그 뒤는 병이 차차 부푼다
        at(lerp(M.start, M.hot, Math.min(1, p / 0.3)));
        puff(Math.max(0, (p - 0.3) / 0.7));
      }, () => {
        haptic(HAPTIC.correct);
        c.step.dataset.opnPhase = "cool";
        c.stage.classList.add("hot");
        c.say("병이 <b>볼록하게</b> 부풀었어요! 이번에는 병을 얼음물로 옮겨 볼까요? 한 번 더 꾹 눌러 보세요.");
        const b2 = ctlBtn(c, "꾹 눌러 얼음물로 옮기기");
        hold(c, b2, 2600, (p) => {
          // 앞의 3할은 얼음물 대야로 옮기고, 뒤의 절반부터 부푼 병이 찌그러진 병으로 바뀐다
          at(lerp(M.hot, M.cold, Math.min(1, p / 0.3)));
          const k = Math.max(0, (p - 0.45) / 0.55);
          puff(1 - k);
          if (body) body.style.opacity = k > 0.5 ? "0" : "1";
          if (dent) dent.style.opacity = k > 0.5 ? "1" : "0";
          if (dew) dew.style.opacity = k > 0.7 ? "1" : "0";
        }, () => {
          haptic(HAPTIC.correct);
          c.face("surprised");
          c.stage.classList.remove("hot");
          c.stage.classList.add("done");
          const head = picked.startsWith("볼록해졌다가") ? "예측대로" : "예측과 달리";
          c.say(`${head} 뜨거운 물에서 볼록해졌던 병이 얼음물에서 <b>찌그러졌어요</b>! 병 안의 물은 어떻게 변했기에 병의 모양이 바뀌었을까요?`);
          c.finish();
        });
      });
    },
  });
}
