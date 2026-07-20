// 화면 라우터 — #frame 안에 화면(.screen)을 마운트/전환한다.
// 화면 전환마다 모든 캔버스 루프를 멈춰 배터리·컨텍스트 누수를 막는다.

import { stopAllLoops } from "./anim";

export interface Screen {
  el: HTMLElement;
  onExit?: () => void;
}

const TRANSITION = 360;

class Nav {
  private frame!: HTMLElement;
  private stack: Screen[] = [];
  // 화면 전환 알림(main.ts 하드웨어 뒤로가기 히스토리 무장용) — go/replace/back/reset 후 호출.
  private onChange: (() => void) | null = null;

  init(frame: HTMLElement): void {
    this.frame = frame;
  }

  get top(): Screen | undefined {
    return this.stack[this.stack.length - 1];
  }

  /** 스택 깊이 — 1이면 루트 화면(하드웨어 뒤로가기 판단 근거). */
  get depth(): number {
    return this.stack.length;
  }

  setOnChange(fn: (() => void) | null): void {
    this.onChange = fn;
  }

  /** 새 화면으로 이동(뒤로가기 스택에 쌓음). */
  go(screen: Screen): void {
    stopAllLoops();
    const prev = this.top;
    this.mountEnter(screen, false);
    if (prev) this.hide(prev.el); // 스택에 남기되 숨김
    this.stack.push(screen);
    this.onChange?.();
  }

  /** 현재 화면을 교체(스택 크기 유지). */
  replace(screen: Screen): void {
    stopAllLoops();
    const prev = this.stack.pop();
    this.mountEnter(screen, false);
    if (prev) this.leave(prev, false);
    this.stack.push(screen);
    this.onChange?.();
  }

  /** 뒤로가기. */
  back(): void {
    if (this.stack.length < 2) return;
    stopAllLoops();
    const cur = this.stack.pop()!;
    const prev = this.top!;
    prev.el.classList.remove("enter-rev");
    prev.el.style.display = "";
    void prev.el.offsetWidth;
    prev.el.classList.add("active");
    this.leave(cur, true);
    this.onChange?.();
  }

  /** 스택을 비우고 단일 화면으로 리셋(홈 복귀 등). */
  reset(screen: Screen): void {
    stopAllLoops();
    for (const s of this.stack) {
      s.onExit?.();
      s.el.remove();
    }
    this.stack = [];
    this.mountEnter(screen, false);
    this.stack.push(screen);
    this.onChange?.();
  }

  private mountEnter(screen: Screen, rev: boolean): void {
    const { el } = screen;
    el.classList.add("screen");
    if (rev) el.classList.add("enter-rev");
    this.frame.appendChild(el);
    void el.offsetWidth; // reflow로 초기 상태 확정
    el.classList.remove("enter-rev");
    el.classList.add("active");
  }

  private hide(el: HTMLElement): void {
    el.classList.remove("active");
    window.setTimeout(() => {
      if (!el.classList.contains("active")) el.style.display = "none";
    }, TRANSITION);
  }

  private leave(screen: Screen, rev: boolean): void {
    const { el } = screen;
    el.classList.remove("active");
    el.classList.add("leaving");
    if (rev) el.classList.add("rev");
    window.setTimeout(() => {
      screen.onExit?.();
      el.remove();
    }, TRANSITION);
  }
}

export const nav = new Nav();
