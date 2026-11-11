// Ⅳ단원 도입 장면의 공용 조각: 그림 겹, 조작 줄의 버튼, 꾹 누르기.
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";

export type U4Meta = (typeof import("../../../../ui/introArt.u4.generated"))["INTRO_META"];
export const metaOf = (c: OpenerCtx): U4Meta => c.meta as unknown as U4Meta;

/** 그림 한 겹을 무대에 놓는다. */
export function layer(c: OpenerCtx, key: string): HTMLElement {
  const node = el("div", { class: "opn-layer", html: (c.art as unknown as Record<string, string>)[key] ?? "" });
  c.stage.append(node);
  return node;
}

/** 조작 줄에 넓은 버튼 하나를 놓는다(48px 이상). */
export function ctlBtn(c: OpenerCtx, text: string): HTMLButtonElement {
  const b = el("button", { class: "opn-u4-btn", text, attrs: { type: "button" } }) as HTMLButtonElement;
  c.controls.replaceChildren(b);
  return b;
}

/** 꾹 누르는 동안만 진행(0~1)이 찬다. 다 차면 onEnd. 키보드는 누를 때마다 3분의 1씩. */
export function hold(c: OpenerCtx, b: HTMLButtonElement, need: number, onP: (p: number) => void, onEnd: () => void): void {
  let p = 0;
  let holding = false;
  let last = 0;
  let raf = 0;
  let ended = false;
  function release(): void {
    if (!holding) return;
    holding = false;
    cancelAnimationFrame(raf);
    b.classList.remove("on");
  }
  const add = (d: number): void => {
    if (ended) return;
    p = Math.min(1, p + d);
    onP(p);
    if (p >= 1) {
      ended = true;
      release();
      b.disabled = true;
      onEnd();
    }
  };
  const tick = (t: number): void => {
    if (!holding || !c.alive()) return;
    add((t - last) / need);
    last = t;
    if (holding) raf = requestAnimationFrame(tick);
  };
  b.addEventListener("pointerdown", (e) => {
    if (ended || holding) return;
    try {
      b.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트에는 붙잡을 포인터가 없다 */
    }
    holding = true;
    last = performance.now();
    b.classList.add("on");
    haptic(HAPTIC.tap);
    raf = requestAnimationFrame(tick);
  });
  b.addEventListener("pointerup", release);
  b.addEventListener("pointercancel", release);
  b.addEventListener("contextmenu", (e) => e.preventDefault());
  b.addEventListener("click", (e) => {
    if (e.detail === 0) add(0.34);
  });
  c.onCleanup(() => cancelAnimationFrame(raf));
}
