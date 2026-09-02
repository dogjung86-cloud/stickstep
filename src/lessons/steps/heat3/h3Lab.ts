// h3Lab — 중1 Ⅲ v3 소형 랩 공용 뼈대(타이머·목표 칩·판정 상자). 랩 6종이 같은 골격을 쓴다.
// 규칙: rAF·캔버스 없음(SVG+CSS+자가 예약 setTimeout), 목표 3개가 다 켜지면 CTA 개방,
// 판정 선택지는 bio4Kit.b4Ask 공용(.hook-choices .show 계약).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";

export interface H3Timers {
  later: (fn: () => void, ms: number) => number;
  clear: () => void;
  alive: () => boolean;
}

/** 타이머 묶음 — cleanup에서 일괄 해제. alive()는 해제 뒤 false(자가 예약 루프의 종료 조건). */
export function h3Timers(): H3Timers {
  const timers = new Set<number>();
  let on = true;
  return {
    later(fn, ms) {
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (on) fn();
      }, ms);
      timers.add(id);
      return id;
    },
    clear() {
      on = false;
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
    },
    alive: () => on,
  };
}

export interface H3GoalDef {
  id: string;
  name: string;
  sub: string;
}

export interface H3Goals {
  chips: HTMLElement;
  collect: (id: string, subText: string) => void;
  has: (id: string) => boolean;
  size: () => number;
}

/** 목표 칩 3개(.pn-badges.force3 > .pn-badge.h3) — 전부 켜지면 onAll. */
export function h3Goals(defs: H3GoalDef[], onAll: () => void): H3Goals {
  const chips = el(
    "div",
    { class: "pn-badges force3" },
    ...defs.map((d) => el("div", { class: "pn-badge h3", dataset: { g: d.id } }, el("b", { text: d.name }), el("span", { text: d.sub }))),
  );
  const goals = new Set<string>();
  let fired = false;
  return {
    chips,
    has: (id) => goals.has(id),
    size: () => goals.size,
    collect(id, subText) {
      if (goals.has(id)) return;
      goals.add(id);
      const chip = chips.querySelector(`[data-g="${id}"]`) as HTMLElement | null;
      if (chip) {
        chip.classList.add("on");
        const span = chip.querySelector("span");
        if (span) span.textContent = subText;
      }
      haptic(HAPTIC.ctaUnlock);
      if (goals.size === defs.length && !fired) {
        fired = true;
        onAll();
      }
    },
  };
}

/** 판정 상자(.hook-choices) — b4Ask가 .show를 켜기 전까지 숨김. */
export function h3AskBox(extraClass: string): HTMLElement {
  const box = el("div", { class: `hook-choices ${extraClass}` });
  box.style.display = "none";
  return box;
}

/** 랩 지시문(helper) — 단원 톤 가이드 바(--helper-bar). */
export function h3Helper(html: string): HTMLElement {
  return el("div", { class: "helper", attrs: { style: "--helper-bar: var(--subj-heat)" }, html });
}
