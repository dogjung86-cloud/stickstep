// [Ⅳ단원 도입] u4l2 spill: 「얼음은 줍는데 주스는요?」
// 내기: 쏟아진 얼음과 주스를 둘 다 손으로 주워 담을 수 있을까(정오를 매기지 않는다).
// 손으로 하는 일: 얼음 세 조각을 눌러 접시에 담고, 주스를 눌러 집어 본다(집었다가 흘러내린다).
// 도입은 까닭(입자의 배열)을 말하지 않는다. 바로 뒤의 온도 랩과 그릇 랩이 받는다.
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
  let phase: "ask" | "ice" | "juice" | "done" = "ask";
  let got = 0;
  let pred = "";

  M.ice.forEach(([x, y], i) => {
    const g = c.stage.querySelector<SVGGElement>(`.opn-u4-sp-ice.i${i + 1}`);
    const b = el("button", {
      class: "opn-u4-hit ice",
      attrs: { type: "button", "aria-label": `얼음 ${i + 1} 접시에 담기` },
      style: { left: pct(x - M.iceHit / 2, S.w), top: pct(y - M.iceHit * 0.7, S.h), width: pct(M.iceHit, S.w), height: pct(M.iceHit * 1.4, S.h) },
    }) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (phase !== "ice" || b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.tap);
      const [tx, ty] = M.to[i];
      if (g) g.style.transform = `translate(${tx - x}px, ${ty - y}px)`;
      got += 1;
      c.step.dataset.opnIce = String(got);
      if (got === M.ice.length) {
        phase = "juice";
        c.step.dataset.opnPhase = "juice";
        c.stage.classList.add("juice");
        c.say("얼음은 <b>모양 그대로</b> 담겼어요. 이번에는 <b>주스</b>를 눌러 집어 보세요.");
      }
    });
    c.stage.append(b);
  });
  const [jx, jy, jw, jh] = M.juiceHit;
  const juice = el("button", {
    class: "opn-u4-hit juice",
    attrs: { type: "button", "aria-label": "주스 집어 보기" },
    style: { left: pct(jx, S.w), top: pct(jy, S.h), width: pct(jw, S.w), height: pct(jh, S.h) },
  }) as HTMLButtonElement;
  juice.addEventListener("click", () => {
    if (phase !== "juice") return;
    phase = "done";
    haptic(HAPTIC.tap);
    c.stage.classList.add("scoop");
    c.later(() => {
      haptic(HAPTIC.correct);
      c.face("surprised");
      c.stage.classList.add("done");
      const head = pred.startsWith("얼음만") ? "예측대로" : "예측과 달리";
      c.say(`${head} 주스는 손가락 사이로 <b>흘러내려요</b>. 얼음과 주스는 무엇이 다를까요?`);
      c.finish();
    }, 1500);
  });
  c.stage.append(juice);

  c.step.dataset.opnPhase = "ask";
  c.ask("얼음과 주스를 쏟았어요. 둘 다 손으로 주워 담을 수 있을까요?", {
    choices: ["얼음만 주울 수 있다", "둘 다 주울 수 있다", "둘 다 못 줍는다"],
    neutral: true,
    good: "예측 완료! <b>얼음</b>을 하나씩 눌러 접시에 담아 보세요.",
    onDone: (picked) => {
      pred = picked;
      phase = "ice";
      c.step.dataset.opnPhase = "ice";
      c.stage.classList.add("play");
      c.face("curious");
    },
  });
}
