// 중2 Ⅰ 도입 장면의 공용 조각: 그림 겹, 조작 줄의 버튼, 꾹 누르기, 누르는 자리.
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";

export type G2U1Meta = (typeof import("../../../../ui/introArt.g2u1.generated"))["INTRO_META"];
export const metaOf = (c: OpenerCtx): G2U1Meta => c.meta as unknown as G2U1Meta;

/** 그림 한 겹을 무대에 놓는다. */
export function layer(c: OpenerCtx, key: string): HTMLElement {
  const node = el("div", { class: "opn-layer", html: (c.art as unknown as Record<string, string>)[key] ?? "" });
  c.stage.append(node);
  return node;
}

export const part = <T extends Element = SVGGElement>(c: OpenerCtx, sel: string): T | null => c.stage.querySelector<T>(sel);

/** 조작 줄에 넓은 버튼 하나를 놓는다(48px 이상). */
export function ctlBtn(c: OpenerCtx, text: string): HTMLButtonElement {
  const b = el("button", { class: "opn-g2u1-btn", text, attrs: { type: "button" } }) as HTMLButtonElement;
  c.controls.replaceChildren(b);
  return b;
}

/** 무대 위의 누르는 자리(그림 좌표 x, y, w, h). */
export function hit(c: OpenerCtx, label: string, x: number, y: number, w: number, h: number, onTap: (b: HTMLButtonElement) => void): HTMLButtonElement {
  const S = metaOf(c).stage;
  const pct = (v: number, of: number): string => `${(v / of) * 100}%`;
  const b = el("button", { class: "opn-g2u1-hit", attrs: { type: "button", "aria-label": label }, style: { left: pct(x, S.w), top: pct(y, S.h), width: pct(w, S.w), height: pct(h, S.h) } }) as HTMLButtonElement;
  b.addEventListener("click", () => {
    if (b.disabled) return;
    haptic(HAPTIC.tap);
    onTap(b);
  });
  c.stage.append(b);
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
    c.step.dataset.opnP = p.toFixed(2);
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

/** 예측과 결과를 잇는 말머리. */
export const head = (picked: string, right: string): string => (picked.startsWith(right) ? "예측대로" : "예측과 달리");

/** 내기(정오를 매기지 않는 예측)를 걸고 조작을 시작한다. */
export function bet(c: OpenerCtx, question: string, choices: string[], go: string, run: (picked: string) => void): void {
  c.step.dataset.opnPhase = "ask";
  c.ask(question, {
    choices,
    neutral: true,
    good: `예측 완료! ${go}`,
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.face("curious");
      run(picked);
    },
  });
}

/** 도입의 끝: 쌤의 말을 바꾸고 아래 버튼을 연다. */
export function wrap(c: OpenerCtx, html: string): void {
  haptic(HAPTIC.correct);
  c.face("surprised");
  c.stage.classList.add("done");
  c.say(html);
  c.finish();
}
