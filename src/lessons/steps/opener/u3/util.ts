// Ⅲ단원 도입 장면의 공용 도우미: 그림 좌표 표의 타입, 누르는 자리 버튼, 꾹 누르기.
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";

export type U3Meta = (typeof import("../../../../ui/introArt.u3.generated"))["INTRO_META"];
export const metaOf = (c: OpenerCtx): U3Meta => c.meta as unknown as U3Meta;

/** 무대 위의 투명한 버튼(그림 좌표 x, y, w, h). */
export function hitBtn(c: OpenerCtx, r: readonly [number, number, number, number], label: string, round = false): HTMLButtonElement {
  const S = metaOf(c).stage;
  const pct = (v: number, of: number): string => `${(v / of) * 100}%`;
  const b = el("button", {
    class: `opn-u3-hit${round ? " round" : ""}`,
    attrs: { type: "button", "aria-label": label },
    style: { left: pct(r[0], S.w), top: pct(r[1], S.h), width: pct(r[2], S.w), height: pct(r[3], S.h) },
  }) as HTMLButtonElement;
  c.stage.append(b);
  return b;
}

/** 꾹 누르는 동안 진행도(0~1)가 오른다. 다 차면 done. 키보드는 누를 때마다 조금씩. */
export function holdFill(c: OpenerCtx, btn: HTMLButtonElement, o: { need: number; can: () => boolean; onDown: () => void; onUp: (finished: boolean) => void; paint: (p: number) => void; done: () => void }): void {
  let p = 0;
  let holding = false;
  let last = 0;
  let raf = 0;
  const add = (d: number): void => {
    p = Math.min(1, p + d);
    o.paint(p);
    if (p >= 1) {
      release(true);
      o.done();
    }
  };
  const tick = (t: number): void => {
    if (!holding || !c.alive()) return;
    const d = (t - last) / o.need;
    last = t;
    add(d);
    if (holding) raf = requestAnimationFrame(tick);
  };
  function release(finished = false): void {
    if (!holding) return;
    holding = false;
    cancelAnimationFrame(raf);
    o.onUp(finished);
  }
  btn.addEventListener("pointerdown", (e) => {
    try {
      btn.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트에는 붙잡을 포인터가 없다 */
    }
    if (!o.can() || holding || p >= 1) return;
    holding = true;
    last = performance.now();
    haptic(HAPTIC.tap);
    o.onDown();
    raf = requestAnimationFrame(tick);
  });
  btn.addEventListener("pointerup", () => release());
  btn.addEventListener("pointercancel", () => release());
  btn.addEventListener("contextmenu", (e) => e.preventDefault());
  btn.addEventListener("click", (e) => {
    if (e.detail !== 0 || !o.can() || p >= 1) return;
    o.onDown();
    add(0.34);
    if (p < 1) o.onUp(false);
  });
  c.onCleanup(() => cancelAnimationFrame(raf));
  o.paint(0);
}
