// h3Lab — 중1 Ⅲ v3 소형 랩 공용 뼈대(타이머·목표 칩·판정 슬롯·helper). 랩 6종이 같은 골격을 쓴다.
// 규칙: rAF·캔버스 없음(SVG+CSS+자가 예약 setTimeout), 목표 3개가 다 켜지면 CTA 개방,
// 판정 선택지는 bio4Kit.b4Ask 공용(.hook-choices .show 계약).
// 오답 피드백(2026-09-04 사용자 피드백 "오답이면 누른 보기 밑에 정답이 떠야"): 다음 질문·다음 국면은 tm.later 타이머가 아니라
//   slot.ask의 opts.onNext로 넘긴다 — 정답이면 1.1초 뒤 자동, 오답이면 정답 카드의 "다음" 필을 눌러야 넘어간다
//   (타이머가 정답 표시를 1.5초 만에 덮던 결함). 이유 한 줄은 opts.why(40자 이하), 예측 질문은 opts.predict(정답 공개 없음).
//
// 한 화면 예산(2026-09-03 사용자 피드백 — "모바일에서 요소가 너무 많고 한 화면에 안 들어온다", 중1 Ⅳ v3와 같은 문법):
//   제목 한 줄(리드 없음) → 목표 칩(압축) → helper 2줄 이하 → 보드(viewBox 340×180, 200px 이하) → 조작 슬롯 1개.
//   판정 질문(slot.ask)은 조작부를 숨기고 **같은 슬롯에** 뜬다 — 아래에 덧붙이지 않아 판정 국면에도 높이가 안 는다.
//   무대 안 요소는 통찰에 필요한 것만(라벨·보조 소품 금지). 궁금증 카드는 목표를 다 채운 뒤에 붙인다.
//   기계 검사: qa/check-u3v3-fit.mjs(390×700에서 마운트·판정 두 시점 모두 스크롤 영역 안).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { b4Ask, type B4AskOpts, type B4Choice } from "../../../ui/bio4Kit";

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

/** 목표 칩 3개(.pn-badges.force3.h3 > .pn-badge.h3) — 전부 켜지면 onAll. */
export function h3Goals(defs: H3GoalDef[], onAll: () => void): H3Goals {
  const chips = el(
    "div",
    { class: "pn-badges force3 h3" },
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

/** 랩 지시문(helper) — 단원 톤 가이드 바(--helper-bar). 문구는 2줄(56자) 이하가 예산. */
export function h3Helper(html: string): HTMLElement {
  return el("div", { class: "helper", attrs: { style: "--helper-bar: var(--subj-heat)" }, html });
}

/** 판정·새 버튼이 랩 중간에 등장할 때의 스크롤 보정(전 과목 배치 규칙). */
export function h3Reveal(tm: H3Timers, node: HTMLElement): void {
  tm.later(() => node.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
}

/** 조작 슬롯 — 조작부(버튼·세그·슬라이더)와 판정 상자가 같은 자리를 번갈아 쓴다(한 화면 예산의 핵심). */
export interface H3Slot {
  el: HTMLElement;
  btnRow: HTMLElement;
  qBox: HTMLElement;
  /** 판정 질문을 슬롯에 띄운다(조작부는 숨김). */
  ask: (question: string, choices: B4Choice[], onPick: (ok: boolean) => void, opts?: B4AskOpts) => void;
  /** 판정 뒤 조작부를 슬롯에 되돌린다. */
  showBtn: () => void;
}

export function h3Slot(tm: H3Timers, qCls: string, ...controls: HTMLElement[]): H3Slot {
  const btnRow = el("div", { class: "ht3-btnrow" }, ...controls);
  const qBox = h3AskBox(`${qCls} ht3-q`);
  const slot = el("div", { class: "ht3-slot" }, btnRow, qBox);
  return {
    el: slot,
    btnRow,
    qBox,
    ask(question, choices, onPick, opts) {
      btnRow.hidden = true;
      b4Ask(qBox, question, choices, onPick, opts);
      h3Reveal(tm, qBox);
    },
    showBtn() {
      qBox.innerHTML = "";
      qBox.classList.remove("show");
      qBox.style.display = "none";
      btnRow.hidden = false;
    },
  };
}

/** 랩 공용 버튼. */
export function h3Btn(cls: string, text: string): HTMLButtonElement {
  return el("button", { class: `ht3-btn ${cls}`, text, attrs: { type: "button" } }) as HTMLButtonElement;
}
