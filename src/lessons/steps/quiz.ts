// quiz — 다양한 문제 유형을 하나로. mcq(5지선다) · ox · multi(보기 합답형) · 그림 퀴즈.
// 플로우: 선택 → 확인하기 → 카드 채점 → 하단 시트 피드백 → 계속하기(next).

import { el } from "../../core/dom";
import { icon } from "../../core/icons";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepAPI, StepRenderer } from "../types";

interface QuizStep {
  mode?: "mcq" | "ox" | "multi";
  n?: number;
  of?: number;
  prompt: string;
  figure?: string;
  figureDark?: boolean;
  options?: string[];
  answer: number | boolean | number[];
  explainGood?: string;
  explainBad?: string;
}

const CHECK = icon("check", 12);

export const quiz: StepRenderer = (host, step, api) => {
  const q = step as unknown as QuizStep;
  const mode = q.mode ?? "mcq";

  if (q.n && q.of) host.appendChild(el("div", { class: "qnum", text: `문제 ${q.n} / ${q.of}` }));
  host.appendChild(el("div", { class: "h1 sm", html: q.prompt }));
  if (q.figure) {
    host.appendChild(
      el(
        "div",
        { class: `q-figure ${q.figureDark ? "dark" : ""}` },
        el("div", { class: "q-figure-art", html: q.figure }),
      ),
    );
  }

  if (mode === "ox") return renderOX(host, q, api);
  return renderChoice(host, q, api, mode);
};

function feedback(api: StepAPI, good: boolean, q: QuizStep): void {
  api.recordQuiz(good);
  window.setTimeout(() => {
    api.openSheet({
      good,
      title: good ? "정답이에요" : "다시 생각해 봐요",
      html: (good ? q.explainGood : q.explainBad) ?? (good ? "잘했어요." : "아쉬워요."),
      onContinue: api.next,
    });
  }, 420);
}

function renderChoice(host: HTMLElement, q: QuizStep, api: StepAPI, mode: "mcq" | "multi"): void {
  const box = el("div", { class: "opts" });
  host.appendChild(box);
  const opts = q.options ?? [];
  const selected = new Set<number>();
  let locked = false;
  const answerSet = new Set<number>(Array.isArray(q.answer) ? q.answer : [q.answer as number]);

  const cards = opts.map((text, i) => {
    const card = el("button", { class: "opt", html: `${text}<span class="radio">${CHECK}</span>` });
    card.addEventListener("click", () => {
      if (locked) return;
      haptic(HAPTIC.select);
      if (mode === "multi") {
        if (selected.has(i)) {
          selected.delete(i);
          card.classList.remove("sel");
        } else {
          selected.add(i);
          card.classList.add("sel");
        }
      } else {
        selected.clear();
        selected.add(i);
        cards.forEach((c) => c.classList.remove("sel"));
        card.classList.add("sel");
      }
      api.setCTA("확인하기", { enabled: selected.size > 0, onClick: confirm, pop: true });
    });
    box.appendChild(card);
    return card;
  });

  function confirm(): void {
    if (locked || selected.size === 0) return;
    locked = true;
    const good =
      selected.size === answerSet.size && Array.from(selected).every((i) => answerSet.has(i));
    cards.forEach((c, i) => {
      c.classList.remove("sel");
      if (answerSet.has(i)) c.classList.add("ok");
      else if (selected.has(i)) c.classList.add("no");
      else c.classList.add("dim");
    });
    api.setCTA("확인하기", { enabled: false });
    feedback(api, good, q);
  }

  api.setCTA("확인하기", { enabled: false });
}

function renderOX(host: HTMLElement, q: QuizStep, api: StepAPI): void {
  const grid = el("div", { class: "ox-grid" });
  host.appendChild(grid);
  let picked: boolean | null = null;
  let locked = false;

  const mk = (val: boolean, glyph: string, label: string) => {
    const btn = el(
      "button",
      { class: `ox-btn ${val ? "o" : "x"}` },
      el("span", { class: "ox-glyph", html: glyph }),
      el("span", { class: "ox-label", text: label }),
    );
    btn.addEventListener("click", () => {
      if (locked) return;
      haptic(HAPTIC.select);
      picked = val;
      grid.querySelectorAll(".ox-btn").forEach((b) => b.classList.remove("sel"));
      btn.classList.add("sel");
      api.setCTA("확인하기", { enabled: true, onClick: confirm, pop: true });
    });
    return btn;
  };
  const O_GLYPH =
    '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="12" cy="12" r="7.6"/></svg>';
  const oBtn = mk(true, O_GLYPH, "맞아요");
  const xBtn = mk(false, icon("xThick", 40), "아니에요");
  grid.append(oBtn, xBtn);

  function confirm(): void {
    if (locked || picked === null) return;
    locked = true;
    const good = picked === (q.answer as boolean);
    [oBtn, xBtn].forEach((b) => b.classList.remove("sel"));
    const correctBtn = (q.answer as boolean) ? oBtn : xBtn;
    correctBtn.classList.add("ok");
    if (!good) (picked ? oBtn : xBtn).classList.add("no");
    api.setCTA("확인하기", { enabled: false });
    feedback(api, good, q);
  }

  api.setCTA("확인하기", { enabled: false });
}
