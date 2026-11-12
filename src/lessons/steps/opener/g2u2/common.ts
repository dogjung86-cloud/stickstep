// 중2 Ⅱ 도입 장면의 공용 조각: 그림 겹, 조작 줄의 버튼, 꾹 누르기, 예측 걸기.
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";

/** 그림 한 겹을 무대에 놓는다. */
export function layer(c: OpenerCtx, key: string): HTMLElement {
  const node = el("div", { class: "opn-layer", html: (c.art as unknown as Record<string, string>)[key] ?? "" });
  c.stage.append(node);
  return node;
}
export const part = (c: OpenerCtx, cls: string): SVGGElement => c.stage.querySelector(`.${cls}`) as SVGGElement;

/** 검사 도구용: 다음에 누를 곳(개발 서버에서만 남긴다). */
export function hint(c: OpenerCtx, k: string): void {
  if (!import.meta.env.DEV) return;
  c.step.dataset.g2Hint = k;
  c.step.dataset.g2N = String(Number(c.step.dataset.g2N ?? 0) + 1);
}

/** 조작 줄에 넓은 버튼 하나를 놓는다(48px 이상). */
export function ctlBtn(c: OpenerCtx, key: string, text: string): HTMLButtonElement {
  const b = el("button", { class: "opn-g2u2-btn", text, attrs: { type: "button" } }) as HTMLButtonElement;
  b.dataset.k = key;
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

/** 예측을 건다(정오를 매기지 않는다. 답은 손으로 한 일이 보여 준다). 고른 글을 next에 넘긴다. */
export function bet(c: OpenerCtx, question: string, choices: string[], after: string, next: (picked: string) => void): void {
  c.step.dataset.opnPhase = "ask";
  hint(c, "predict");
  c.ask(question, {
    choices,
    neutral: true,
    good: after,
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      next(picked);
    },
  });
}

/** 도입의 끝: 쌤의 말을 바꾸고 끝 버튼을 연다. */
export function wrap(c: OpenerCtx, html: string): void {
  haptic(HAPTIC.correct);
  c.face("surprised");
  c.stage.classList.add("done");
  c.controls.replaceChildren();
  c.say(html);
  hint(c, "cta");
  c.finish();
}

export const head = (pred: string, right: string): string => (pred.startsWith(right) ? "예측대로" : "예측과 달리");
export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export { haptic, HAPTIC };
