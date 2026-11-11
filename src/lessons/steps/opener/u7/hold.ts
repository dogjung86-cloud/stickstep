// Ⅶ단원 도입 공용: 꾹 누르는 동안만 진행되는 조작(누르기 쉬운 큰 버튼 하나, 긴 끌기 없음).
// 누르고 있으면 p가 0에서 1까지 오르고, 손을 떼면 멈춘다. 키보드로는 누를 때마다 조금씩 오른다.
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";

export interface Hold {
  el: HTMLButtonElement;
  /** 누를 수 있게 한다(예측을 고른 뒤에 켠다). */
  arm(): void;
}

export function makeHold(c: OpenerCtx, o: { cls: string; label?: string; sub?: string; aria: string; need: number; onProgress: (p: number) => void; onDone: () => void; onLetGo?: () => void }): Hold {
  const kids = o.label ? [el("b", { text: o.label }), el("span", { text: o.sub ?? "" })] : [];
  const btn = el("button", { class: o.cls, attrs: { type: "button", "aria-label": o.aria } }, ...kids) as HTMLButtonElement;
  btn.disabled = true;
  let p = 0;
  let armed = false;
  let holding = false;
  let finished = false;
  let last = 0;
  let raf = 0;
  const add = (d: number): void => {
    if (finished) return;
    p = Math.min(1, p + d);
    o.onProgress(p);
    c.step.dataset.opnHold = p.toFixed(2);
    if (p >= 1) {
      finished = true;
      holding = false;
      cancelAnimationFrame(raf);
      btn.classList.remove("held");
      btn.disabled = true;
      haptic(HAPTIC.correct);
      o.onDone();
    }
  };
  const tick = (t: number): void => {
    if (!holding || !c.alive()) return;
    add((t - last) / o.need);
    last = t;
    if (holding) raf = requestAnimationFrame(tick);
  };
  const release = (): void => {
    if (!holding) return;
    holding = false;
    cancelAnimationFrame(raf);
    btn.classList.remove("held");
    if (!finished) o.onLetGo?.();
  };
  btn.addEventListener("pointerdown", (e) => {
    if (!armed || finished || holding) return;
    try {
      btn.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트에는 붙잡을 포인터가 없다 */
    }
    holding = true;
    last = performance.now();
    btn.classList.add("held", "touched");
    haptic(HAPTIC.tap);
    raf = requestAnimationFrame(tick);
  });
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointercancel", release);
  btn.addEventListener("contextmenu", (e) => e.preventDefault());
  btn.addEventListener("click", (e) => {
    if (e.detail !== 0 || !armed) return; // 키보드
    btn.classList.add("touched");
    add(0.34);
  });
  c.onCleanup(() => cancelAnimationFrame(raf));
  return {
    el: btn,
    arm() {
      armed = true;
      btn.disabled = false;
    },
  };
}

/** 예측과 결과를 견주는 말머리. */
export const verdict = (hit: boolean): string => (hit ? "예측대로" : "예측과 달리");
