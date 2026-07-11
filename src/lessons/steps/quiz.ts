// quiz — 다양한 문제 유형을 하나로. mcq(5지선다) · ox · multi(보기 합답형) · 그림 퀴즈.
// 플로우: 선택 → 확인하기 → 카드 채점 → 하단 시트 피드백 → 계속하기(next).

import { el } from "../../core/dom";
import { icon } from "../../core/icons";
import { haptic, HAPTIC } from "../../core/haptics";
import { recordWrongNote, resolveWrongNote } from "../../core/store";
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
  /** false면 표시 순서를 저작 순서로 고정 — ㄱㄴㄷ 조합·(가)(나)·①~⑤ 라벨형 보기용 */
  shuffle?: boolean;
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

/** q 텍스트 해시 — 오답노트 키(스텝엔 id가 없어 문항 텍스트로 안정 키를 만든다). */
function qhash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** 오답노트 수집 — 틀리면 스냅샷 기록, (복습에서) 다시 맞히면 극복 처리. */
function noteWrong(api: StepAPI, good: boolean, q: QuizStep): void {
  const key = `l:${api.lesson.id}:${qhash(q.prompt)}`;
  if (good) {
    resolveWrongNote(key);
    return;
  }
  const mode = q.mode ?? "mcq";
  recordWrongNote({
    key,
    kind: "lesson",
    srcId: api.lesson.id,
    lessonId: api.lesson.id,
    type: mode,
    q: q.prompt,
    opts: mode === "ox" ? ["O", "X"] : q.options,
    answer: mode === "ox" ? [q.answer === true ? 0 : 1] : Array.isArray(q.answer) ? q.answer : [q.answer as number],
    explain: q.explainBad ?? q.explainGood,
    hasFigure: !!q.figure,
  });
}

function feedback(api: StepAPI, good: boolean, q: QuizStep): void {
  noteWrong(api, good, q);
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

  // 표시 순서만 셔플(hookAsk 문법) — selected·answerSet·cards는 전부 저작 인덱스 기준이라
  // 채점·해설은 그대로다. "첫 보기=정답" 패턴 학습 방지. 라벨형 보기는 shuffle: false로 고정.
  const order = opts.map((_, i) => i);
  if (q.shuffle !== false) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }

  const cards: HTMLButtonElement[] = []; // 저작 인덱스 → 카드
  for (const oi of order) {
    const card = el("button", { class: "opt", html: `${opts[oi]}<span class="radio">${CHECK}</span>` });
    if (import.meta.env.DEV) card.dataset.oi = String(oi); // e2e가 셔플 무관하게 보기를 집는 열쇠(dev 전용)
    card.addEventListener("click", () => {
      if (locked) return;
      haptic(HAPTIC.select);
      if (mode === "multi") {
        if (selected.has(oi)) {
          selected.delete(oi);
          card.classList.remove("sel");
        } else {
          selected.add(oi);
          card.classList.add("sel");
        }
      } else {
        selected.clear();
        selected.add(oi);
        cards.forEach((c) => c.classList.remove("sel"));
        card.classList.add("sel");
      }
      api.setCTA("확인하기", { enabled: selected.size > 0, onClick: confirm, pop: true });
    });
    box.appendChild(card);
    cards[oi] = card;
  }

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
