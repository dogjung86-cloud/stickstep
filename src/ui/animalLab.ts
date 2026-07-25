// animalLab — 중2 Ⅵ 랩 12종의 공용 뼈대.
// 목표 칩 3개 → collect() → 전부 달성 시 recordQuiz(true) + enableCTA 라는 규율을
// 한 곳에 모아, 랩마다 반복되던 조립·정리 코드를 없앤다.
//
// 배치 규약(전 과목 공통, 2026-07-10 확정): 제목 → 목표 칩 → **helper(지시)** → 무대 → 조작부.
// "~해 보세요"가 무대 아래 깔리면 유저가 무엇을 할지 모른다.

import { el } from "../core/dom";
import { haptic, HAPTIC } from "../core/haptics";
import { curioCard, type Curio } from "./curio";
import type { StepAPI } from "../lessons/types";
import "../styles/animal.css";

export interface GoalDef {
  id: string;
  title: string;
  /** 미달성 상태의 부제(달성하면 collect(id, "…")로 교체한다). */
  sub: string;
}

export interface LabShell {
  goalsEl: HTMLElement;
  helper: HTMLElement;
  stage: HTMLElement;
  canvas: HTMLCanvasElement;
  /** 무대 아래 조작부 컨테이너 — 버튼·슬라이더를 여기에 append 한다. */
  controls: HTMLElement;
  /** 무대 우하단 상태 필(선택) — setPill로 갱신. */
  setPill(text: string): void;
  collect(id: string, sub?: string): void;
  has(id: string): boolean;
  count(): number;
  setHelper(html: string): void;
  /** 목표를 전부 달성한 순간 한 번 호출된다(피날레 연출용). */
  onComplete(fn: () => void): void;
}

export interface LabOpts {
  title: string;
  lead?: string;
  /** 캔버스 접근성 설명 — 그림이 무엇을 보여 주는지. 정답을 유출하지 말 것. */
  aria: string;
  /** 캔버스 CSS 높이(px). 논리 좌표 폭은 랩마다 BASE_W=360으로 스케일 매핑한다. */
  height: number;
  goals: [GoalDef, GoalDef, GoalDef];
  /** 첫 지시문. */
  helper: string;
  /** 전 목표 달성 시 helper 교체 문구. */
  finish: string;
  cta?: string;
  waitingCta?: string;
  curio?: Curio;
  /** 무대 좌상단 캡션(선택). */
  cap?: string;
}

export function buildLab(host: HTMLElement, api: StepAPI, o: LabOpts): LabShell {
  host.appendChild(el("div", { class: "h1", html: o.title }));
  if (o.lead) host.appendChild(el("div", { class: "sub", html: o.lead }));

  const goalsEl = el(
    "div",
    { class: "pn-badges force3 anim" },
    ...o.goals.map((g) =>
      el(
        "div",
        { class: "pn-badge anim", dataset: { g: g.id } },
        el("b", { text: g.title }),
        el("span", { text: g.sub }),
      ),
    ),
  );

  const helper = el("div", { class: "helper", attrs: { role: "status", "aria-live": "polite" }, html: o.helper });

  const canvas = el("canvas", {
    class: "an-canvas",
    style: `height:${o.height}px`,
    attrs: { role: "img", "aria-label": o.aria },
  });
  const pill = el("span", { text: "" });
  const stage = el(
    "div",
    { class: "stage an-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:var(--subj-body)" }), pill)),
    o.cap ? el("div", { class: "stage-cap", text: o.cap }) : null,
  );

  const controls = el("div", { class: "an-controls" });

  host.append(goalsEl, helper, stage, controls);
  if (o.curio) host.appendChild(curioCard(o.curio));

  const done = new Set<string>();
  let completed = false;
  let onComplete: (() => void) | null = null;

  api.setCTA(o.waitingCta ?? "목표 세 가지를 모두 달성해 보세요", { enabled: false });

  const shell: LabShell = {
    goalsEl,
    helper,
    stage,
    canvas,
    controls,
    setPill(text) {
      pill.textContent = text;
    },
    has(id) {
      return done.has(id);
    },
    count() {
      return done.size;
    },
    setHelper(html) {
      helper.innerHTML = html;
    },
    onComplete(fn) {
      onComplete = fn;
    },
    collect(id, sub) {
      if (done.has(id)) return;
      done.add(id);
      const chip = goalsEl.querySelector<HTMLElement>(`[data-g="${id}"]`);
      chip?.classList.add("on");
      if (sub) {
        const span = chip?.querySelector("span");
        if (span) span.textContent = sub;
      }
      haptic(HAPTIC.ctaUnlock);
      if (done.size === o.goals.length && !completed) {
        completed = true;
        helper.innerHTML = o.finish;
        api.recordQuiz(true);
        api.enableCTA(o.cta ?? "개념 정리하기");
        onComplete?.();
      }
    },
  };
  return shell;
}

/** 랩 정리 헬퍼 — 리스너·타이머를 모아 두고 cleanup에서 한 번에 해제한다. */
export function labLife(): {
  on<K extends keyof HTMLElementEventMap>(
    target: HTMLElement | Window,
    type: K | string,
    fn: EventListenerOrEventListenerObject,
  ): void;
  later(fn: () => void, ms: number): void;
  dispose(): void;
} {
  const offs: (() => void)[] = [];
  const timers = new Set<number>();
  let alive = true;
  return {
    on(target, type, fn) {
      target.addEventListener(type as string, fn);
      offs.push(() => target.removeEventListener(type as string, fn));
    },
    later(fn, ms) {
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (alive) fn();
      }, ms);
      timers.add(id);
    },
    dispose() {
      alive = false;
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      offs.forEach((off) => off());
      offs.length = 0;
    },
  };
}
