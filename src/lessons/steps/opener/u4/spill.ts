// [Ⅳ단원 도입] u4l2 spill: 「구슬 얼음과 물을 체에 부으면 어떻게 될까요?」
// 내기: 구멍 뚫린 체에 구슬 모양 얼음과 물을 차례로 부으면 무엇이 체에 남을까(정오를 매기지 않는다).
// 손으로 하는 일: 얼음 컵을 눌러 체에 붓고(얼음은 동그란 모양 그대로 체에 걸린다), 물 컵을 눌러 붓는다(물은 구멍으로 빠져나가 그릇 모양대로 고인다).
// 고체는 모양이 일정해 걸러지고, 액체는 흘러서 모양이 바뀐다는 대조만 겪게 한다. 까닭(입자의 배열)은 바로 뒤의 온도 랩과 그릇 랩이 받는다.
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { layer, metaOf } from "./common";

export function spill(c: OpenerCtx): void {
  const meta = metaOf(c);
  const M = meta.spill;
  const S = meta.stage;
  layer(c, "spillBase");
  const pct = (v: number, of: number): string => `${(v / of) * 100}%`;
  let phase: "ask" | "ice" | "water" | "done" = "ask";
  let pred = "";
  const balls = M.ice.map((_, i) => c.stage.querySelector<SVGGElement>(`.opn-u4-sp-ice.i${i + 1}`));

  const hit = (cls: string, label: string, [x, y, w, h]: readonly number[]): HTMLButtonElement => {
    const b = el("button", {
      class: `opn-u4-hit ${cls}`,
      attrs: { type: "button", "aria-label": label },
      style: { left: pct(x, S.w), top: pct(y, S.h), width: pct(w, S.w), height: pct(h, S.h) },
    }) as HTMLButtonElement;
    c.stage.append(b);
    return b;
  };
  const cupBtn = hit("ice", "얼음 컵을 체에 붓기", M.cupHit);
  const jugBtn = hit("water", "물 컵을 체에 붓기", M.jugHit);

  cupBtn.addEventListener("click", () => {
    if (phase !== "ice") return;
    phase = "water";
    haptic(HAPTIC.tap);
    c.stage.classList.add("pour-ice");
    // 얼음은 체 바닥의 자리로 하나씩 옮겨 간다(모양은 그대로)
    balls.forEach((g, i) => {
      const [x, y] = M.ice[i];
      const [tx, ty] = M.to[i];
      c.later(() => {
        if (g) g.style.transform = `translate(${tx - x}px, ${ty - y}px)`;
      }, 140 * i);
    });
    c.step.dataset.opnIce = String(M.ice.length);
    c.later(() => {
      c.stage.classList.remove("pour-ice");
      c.stage.classList.add("iced");
      c.step.dataset.opnPhase = "water";
      c.say("구슬 얼음은 <b>동그란 모양 그대로</b> 체에 걸렸어요! 이번에는 오른쪽의 <b>물 컵</b>을 눌러 체에 부어 보세요.");
    }, 1100);
  });

  jugBtn.addEventListener("click", () => {
    if (phase !== "water" || !c.stage.classList.contains("iced")) return;
    phase = "done";
    haptic(HAPTIC.tap);
    c.stage.classList.add("pour-water");
    c.later(() => {
      haptic(HAPTIC.correct);
      c.face("surprised");
      c.stage.classList.remove("pour-water");
      c.stage.classList.add("done");
      const head = pred.startsWith("얼음은 체에 남고") ? "예측대로" : "예측과 달리";
      c.say(`${head} 물은 체의 구멍으로 <b>빠져나가</b> 아래 그릇 모양대로 고였어요! 얼음과 물은 어떤 성질이 다른 걸까요?`);
      c.finish();
    }, 1700);
  });

  c.step.dataset.opnPhase = "ask";
  // choices[0]이 옳은 예측이고 "얼음은 체에 남고"로 시작해야 한다(끝의 말머리가 pred.startsWith로 가른다)
  c.ask("구멍 뚫린 체에 구슬 모양 얼음과 물을 차례로 부으면 어떻게 될까요?", {
    choices: ["얼음은 체에 남고, 물은 체를 빠져나간다", "얼음과 물 둘 다 체에 남는다", "얼음과 물 둘 다 체를 빠져나간다"],
    neutral: true,
    good: "좋아요! 먼저 왼쪽의 <b>얼음 컵</b>을 눌러 체에 부어 보세요.",
    onDone: (picked) => {
      pred = picked;
      phase = "ice";
      c.step.dataset.opnPhase = "ice";
      c.stage.classList.add("play");
      c.face("curious");
    },
  });
}
