// 레슨 플레이어 — 레슨 화면(진행바·스텝 호스트·CTA·피드백 시트)을 조립하고
// 스텝 데이터를 registry의 렌더러로 그린다.

import { clear, el } from "../core/dom";
import { haptic, HAPTIC } from "../core/haptics";
import { icon } from "../core/icons";
import { stopAllLoops } from "../core/anim";
import { getRenderer } from "./registry";
import type { CtaVariant, Lesson, StepAPI, StepCleanup } from "./types";

export interface LessonResult {
  lessonId: string;
  acc: number;
  xp: number;
  correct: number;
  total: number;
  seconds: number;
}

export function createLessonPlayer(
  lesson: Lesson,
  hooks: { onExit: () => void; onComplete: (r: LessonResult) => void },
): { el: HTMLElement } {
  const steps = lesson.steps;
  let idx = 0;
  let gen = 0; // 스텝 세대 토큰 — 떠난 스텝의 지연 콜백(setTimeout 등)이 현재 스텝을 조작하지 못하게 한다
  let correct = 0;
  let quizTotal = 0;
  const recordedSteps = new Set<number>(); // 뒤로 갔다 다시 풀어도 첫 시도만 채점
  const t0 = Date.now();
  let cleanup: StepCleanup;
  let finishTimer = 0;

  // ---- DOM ----
  const pbar = el("div", { class: "pbar" });
  const backBtn = el("button", { class: "xbtn", attrs: { "aria-label": "이전 단계" }, html: icon("back", 20, { sw: 2.4 }) });
  const xbtn = el("button", { class: "xbtn", attrs: { "aria-label": "닫기" }, html: icon("x", 20, { sw: 2.4 }) });
  const header = el(
    "div",
    { class: "lheader" },
    backBtn,
    el("div", { class: "pwrap" }, pbar),
    xbtn,
  );

  const stepWrap = el("div", { class: "stepWrap" });
  const scroll = el("div", { class: "scroll" }, stepWrap);

  const cta = el("button", { class: "btn cta", attrs: { disabled: "true" }, text: "다음" });
  const footer = el("div", { class: "footer" }, cta);

  const dim = el("div", { class: "scrim" });
  const sheetIc = el("div", { class: "sheet-ic" });
  const sheetTitle = el("div", { class: "sheet-title" });
  const sheetExpl = el("p", { class: "sheet-expl" });
  const sheetBtn = el("button", { class: "btn", text: "계속하기" });
  const sheet = el(
    "div",
    { class: "sheet" },
    el(
      "div",
      { class: "sheet-card" },
      el("div", { class: "sheet-head" }, sheetIc, sheetTitle),
      sheetExpl,
      sheetBtn,
    ),
  );

  const snackEl = el("div", { class: "snack" });

  const section = el("section", { class: "screen lesson-screen" }, header, scroll, footer, dim, sheet, snackEl);

  // ---- CTA ----
  let ctaFn: (() => void) | null = null;
  cta.addEventListener("click", () => {
    if (cta.disabled) return;
    haptic(HAPTIC.tap);
    ctaFn?.();
  });
  function setCTA(
    label: string,
    o: { enabled?: boolean; variant?: CtaVariant; onClick?: () => void; pop?: boolean } = {},
  ): void {
    cta.textContent = label;
    cta.disabled = !(o.enabled ?? true);
    ctaFn = o.onClick ?? null;
    cta.classList.remove("good", "bad");
    if (o.variant === "good") cta.classList.add("good");
    if (o.variant === "bad") cta.classList.add("bad");
    if (o.pop && !cta.disabled) popCta();
  }
  function popCta(): void {
    cta.classList.add("pop");
    window.setTimeout(() => cta.classList.remove("pop"), 450);
  }
  function enableCTA(label?: string): void {
    // CTA 해제 = "다음 단계로 진행". 랩 스텝이 setCTA(enabled:false)로 onClick을 비워도
    // 여기서 진행 동작을 연결해 준다(안 그러면 켜진 버튼이 눌러도 안 넘어감).
    ctaFn = next;
    if (cta.disabled) {
      cta.disabled = false;
      if (label) cta.textContent = label;
      popCta();
      haptic(HAPTIC.ctaUnlock);
    } else if (label) {
      cta.textContent = label;
    }
  }

  // ---- 피드백 시트 ----
  let sheetFn: (() => void) | null = null;
  sheetBtn.addEventListener("click", () => {
    sheet.classList.remove("open");
    dim.classList.remove("open");
    const f = sheetFn;
    sheetFn = null;
    haptic(HAPTIC.tap);
    window.setTimeout(() => f?.(), 180);
  });
  function openSheet(o: {
    good: boolean;
    title: string;
    html: string;
    onContinue?: () => void;
    continueLabel?: string;
  }): void {
    sheet.classList.remove("good", "bad");
    sheet.classList.add(o.good ? "good" : "bad");
    sheetIc.innerHTML = o.good ? icon("check", 18) : icon("xThick", 18);
    sheetTitle.textContent = o.title;
    sheetExpl.innerHTML = o.html;
    sheetBtn.classList.remove("good", "bad");
    sheetBtn.classList.add(o.good ? "good" : "bad");
    sheetBtn.textContent = o.continueLabel ?? "계속하기";
    sheetFn = o.onContinue ?? null;
    dim.classList.add("open");
    sheet.classList.add("open");
    haptic(o.good ? HAPTIC.correct : HAPTIC.wrong);
  }

  // ---- 스낵바 ----
  let snackTimer = 0;
  function snack(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2200);
  }

  // ---- 스텝 진행 ----
  function api(): StepAPI {
    // 이 api는 특정 스텝(세대 g, 인덱스 at)에 묶인다. 스텝을 떠난 뒤 발화하는
    // 지연 콜백이 next/openSheet/enableCTA 등을 불러도 전부 무시된다.
    const g = gen;
    const at = idx;
    const fresh = (): boolean => g === gen;
    return {
      lesson,
      index: at,
      total: steps.length,
      setCTA: (label, opts) => {
        if (fresh()) setCTA(label, opts);
      },
      enableCTA: (label) => {
        if (fresh()) enableCTA(label);
      },
      disableCTA: () => {
        if (!fresh()) return;
        cta.disabled = true;
        ctaFn = null;
      },
      next: () => {
        if (fresh()) next();
      },
      openSheet: (o) => {
        if (fresh()) openSheet(o);
      },
      recordQuiz: (ok: boolean) => {
        if (!fresh() || recordedSteps.has(at)) return;
        recordedSteps.add(at);
        quizTotal += 1;
        if (ok) correct += 1;
      },
      snack: (msg) => {
        if (fresh()) snack(msg);
      },
    };
  }

  function renderStep(i: number): void {
    stopAllLoops();
    if (typeof cleanup === "function") cleanup();
    cleanup = undefined;
    gen += 1; // 이전 스텝의 지연 콜백 전부 무효화
    window.clearTimeout(finishTimer);
    // 열려 있던 피드백 시트·스낵바 정리(시트 위에서 뒤로가기 등)
    sheet.classList.remove("open");
    dim.classList.remove("open");
    sheetFn = null;
    window.clearTimeout(snackTimer);
    snackEl.classList.remove("show");
    idx = i;
    pbar.style.width = `${(i / steps.length) * 100}%`;
    backBtn.style.visibility = i > 0 ? "visible" : "hidden";
    clear(stepWrap);
    scroll.scrollTop = 0;
    const step = steps[i];
    const stepEl = el("div", { class: "step" });
    stepWrap.appendChild(stepEl);
    setCTA("다음", { enabled: true, onClick: next });
    const renderer = getRenderer(step.type);
    if (!renderer) {
      stepEl.appendChild(el("div", { class: "h1", text: `알 수 없는 스텝: ${step.type}` }));
      return;
    }
    cleanup = renderer(stepEl, step, api());
  }

  function next(): void {
    if (idx + 1 >= steps.length) {
      pbar.style.width = "100%";
      cta.disabled = true; // 더블탭으로 finish가 두 번 예약되는 것 방지
      ctaFn = null;
      window.clearTimeout(finishTimer);
      finishTimer = window.setTimeout(finish, 300);
    } else {
      renderStep(idx + 1);
    }
  }

  let finished = false;
  function finish(): void {
    if (finished) return;
    finished = true;
    gen += 1; // 완료 후 발화하는 스텝 지연 콜백 무효화
    stopAllLoops();
    if (typeof cleanup === "function") cleanup();
    cleanup = undefined;
    const acc = quizTotal ? Math.round((correct / quizTotal) * 100) : 100;
    const xp = 40 + correct * 20;
    const seconds = Math.max(1, Math.round((Date.now() - t0) / 1000));
    hooks.onComplete({ lessonId: lesson.id, acc, xp, correct, total: quizTotal, seconds });
  }

  backBtn.addEventListener("click", () => {
    if (idx === 0) return;
    haptic(HAPTIC.tap);
    renderStep(idx - 1);
  });

  xbtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    gen += 1;
    window.clearTimeout(finishTimer);
    stopAllLoops();
    if (typeof cleanup === "function") cleanup();
    hooks.onExit();
  });

  // 첫 스텝
  renderStep(0);

  return { el: section };
}
