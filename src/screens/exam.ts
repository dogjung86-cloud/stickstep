// 단원 종합 평가 — 인트로 → 시험(해설 없이 쭉) → 제출 후 일괄 채점 → 결과(진단·전 문항 리뷰).
// 레슨 플레이어와 별개의 화면. 문항은 content/exams/ 풀에서 응시마다 레슨 균형 랜덤 추출(drawExamItems).
// 규칙: 시험 중에는 정오·해설을 절대 노출하지 않는다(몰입 유지) — explain·core는 리뷰 전용.
import { el, clear, countUp } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { makeAnswerPad, checkAnswer } from "../ui/mathKit";
import { examForUnit, drawExamItems } from "../content/exams";
import type { ExamDef, ExamItem } from "../content/exams";
import { findUnit, unitProgress, findLesson } from "../content/curriculum";
import type { Unit } from "../content/curriculum";
import { examRecordOf, isExamRetakeLocked, recordExamResult } from "../core/store";
import type { Screen } from "../core/router";

interface SessionQ {
  item: ExamItem;
  /** mcq·multi 표시 순서(저작 인덱스 나열) — 리뷰가 시험과 같은 순서로 재현하는 근거. */
  order: number[];
  resp: number | number[] | string | null;
  good: boolean;
}

const CHECK = icon("check", 12);

export interface ExamScreenOpts {
  onExit: () => void;
  onOpenLesson: (lessonId: string) => void;
  /** 재응시 잠금 시 페이월로 — 구매가 끝나면 unlocked 콜백으로 되돌아온다. */
  onPaywall: (unlocked: () => void) => void;
}

export function examScreen(unitId: string, opts: ExamScreenOpts): Screen {
  const def = examForUnit(unitId);
  const unit = findUnit(unitId);
  if (!def || !unit) {
    // 등록되지 않은 단원 — 방어적 빈 화면(홈 노드는 examForUnit이 있는 단원에만 뜬다)
    const sec = el("section", { class: "screen" }, el("div", { class: "scroll pad" }, el("div", { class: "h1", text: "준비 중인 평가예요" })));
    return { el: sec };
  }
  return buildExamScreen(def, unit, opts);
}

function buildExamScreen(def: ExamDef, unit: Unit, opts: ExamScreenOpts): Screen {
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };

  // ---- 뼈대: 헤더(닫기·진행) + 본문 + 푸터 ----
  const xbtn = el("button", { class: "xbtn", attrs: { "aria-label": "닫기" }, html: icon("x", 20, { sw: 2.4 }) });
  const pbar = el("div", { class: "pbar" });
  const pwrap = el("div", { class: "pwrap" }, pbar);
  const counter = el("div", { class: "ex-counter" });
  const header = el("div", { class: "lheader" }, xbtn, pwrap, counter);
  const body = el("div", { class: "scroll" });
  const footer = el("div", { class: "footer ex-footer" });
  const section = el("section", { class: "screen exam-screen" }, header, body, footer);

  // 시험 중 이탈 확인 오버레이 — 푼 내용은 저장되지 않는다는 것을 분명히 알린다
  const quitDim = el("div", { class: "scrim" });
  const quitCard = el(
    "div",
    { class: "ex-quit-card" },
    el("div", { class: "ex-quit-t", text: "시험을 그만둘까요?" }),
    el("div", { class: "ex-quit-s", text: "지금까지 푼 내용은 저장되지 않아요. 응시 횟수도 차감되지 않으니 안심해요." }),
  );
  const quitStay = el("button", { class: "btn", text: "계속 풀기" });
  const quitLeave = el("button", { class: "ex-quit-leave", text: "그만두기" });
  quitCard.append(quitStay, quitLeave);
  const quitWrap = el("div", { class: "ex-quit" }, quitCard);
  section.append(quitDim, quitWrap);
  function showQuit(show: boolean): void {
    quitDim.classList.toggle("open", show);
    quitWrap.classList.toggle("open", show);
  }
  quitStay.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    showQuit(false);
  });
  quitLeave.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    opts.onExit();
  });
  quitDim.addEventListener("click", () => showQuit(false));

  let phase: "intro" | "exam" | "result" = "intro";
  xbtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    if (phase === "exam") showQuit(true);
    else opts.onExit();
  });

  // ---- CTA ----
  const cta = el("button", { class: "btn cta", attrs: { disabled: "true" }, text: "다음" });
  let ctaFn: (() => void) | null = null;
  cta.addEventListener("click", () => {
    if (cta.disabled) return;
    haptic(HAPTIC.tap);
    ctaFn?.();
  });
  function setCTA(label: string, enabled: boolean, fn: (() => void) | null, pop = false): void {
    cta.textContent = label;
    cta.disabled = !enabled;
    ctaFn = fn;
    if (pop && enabled) {
      cta.classList.add("pop");
      later(() => cta.classList.remove("pop"), 450);
    }
  }

  // ---- 인트로 ────────────────────────────────────────────
  function renderIntro(): void {
    phase = "intro";
    pwrap.style.visibility = "hidden";
    counter.textContent = "";
    clear(body);
    clear(footer);
    const rec = examRecordOf(def.id);
    const locked = isExamRetakeLocked(def.id);
    const pct = unitProgress(unit);

    const hero = el(
      "div",
      { class: "ex-hero" },
      el("div", { class: "ex-med", html: icon("target", 40) }),
      el("div", { class: "ex-eyebrow", text: `대단원 ${unit.roman} · ${unit.title}` }),
      el("div", { class: "ex-title", text: "단원 종합 평가" }),
      el("div", { class: "ex-sub", text: "레슨 진행과 상관없이 언제든 도전할 수 있어요. 실전처럼 풀고, 약한 부분을 찾아요." }),
    );

    // 파트 수는 풀의 레슨 수에서 계산(u3는 다섯, u4는 여섯 파트 — 하드코딩 금지)
    const partCount = new Set(def.pool.map((it) => it.lessonId)).size;
    const partWord = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열"][partCount] ?? String(partCount);
    const rules = el(
      "div",
      { class: "ex-rules" },
      ruleRow("layers", `매번 새로운 ${def.pick}문제`, `문제 은행에서 ${partWord} 파트를 골고루 섞어 새로 뽑아요`),
      ruleRow("play", "푸는 동안 해설 없음", "실전처럼 몰입해서 끝까지 풀어요. 채점은 제출 후 한 번에!"),
      ruleRow("route", "제출하면 약점 진단", "점수와 함께 파트별 정오표, 전 문항 해설을 받아요"),
    );

    const status = el("div", { class: "ex-status" });
    if (rec.attempts > 0) {
      status.appendChild(statChip("trophy", `최고 ${rec.best}점`));
      status.appendChild(statChip("check", `${rec.attempts}회 응시`));
    }
    if (rec.conquered) status.appendChild(statChip("crown", "정복 인증", true));

    // 정복 인증 안내 — 100% 정복 후 응시가 인증 조건
    const conqHint = rec.conquered
      ? null
      : el(
          "div",
          { class: "ex-conq-hint" },
          el("span", { html: icon("crown", 15) }),
          el("span", {
            html:
              pct === 100
                ? "모든 레슨을 정복했네요! 지금 응시하면 <b>정복 인증 배지</b>를 받아요."
                : `모든 레슨을 정복한 뒤 응시하면 <b>정복 인증 배지</b>를 받아요. (현재 정복률 ${pct}%)`,
          }),
        );

    const free = el("div", {
      class: "ex-freeline",
      text: rec.attempts === 0 ? "첫 응시는 무료예요 · 두 번째부터는 프리미엄" : "재응시는 프리미엄에서 무제한이에요",
    });

    const wrap = el("div", { class: "pad ex-intro" }, hero, rules, status, conqHint, free);
    body.appendChild(wrap);

    clear(footer);
    footer.appendChild(cta);
    if (def.pool.length === 0) {
      setCTA("문항 준비 중이에요", false, null); // 풀이 비어 있는 개발 중 상태 방어
    } else if (locked) {
      setCTA("프리미엄으로 다시 풀기", true, () => opts.onPaywall(() => renderIntro()));
      cta.classList.add("gold");
    } else {
      cta.classList.remove("gold");
      setCTA("시험 시작하기", true, startExam, true);
    }
  }

  function ruleRow(ic: string, t: string, s: string): HTMLElement {
    return el(
      "div",
      { class: "ex-rule" },
      el("div", { class: "ex-rule-ic", html: icon(ic, 19) }),
      el("div", {}, el("div", { class: "ex-rule-t", text: t }), el("div", { class: "ex-rule-s", text: s })),
    );
  }
  function statChip(ic: string, text: string, gold = false): HTMLElement {
    return el("div", { class: `ex-stat ${gold ? "gold" : ""}` }, el("span", { html: icon(ic, 14) }), el("span", { text }));
  }

  // ---- 시험 ──────────────────────────────────────────────
  let session: SessionQ[] = [];
  let qi = 0;

  function displayOrder(it: ExamItem): number[] {
    const n = it.options?.length ?? 0;
    const order = Array.from({ length: n }, (_, i) => i);
    if (it.shuffle !== false) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    return order;
  }

  function startExam(): void {
    session = drawExamItems(def).map((item) => ({ item, order: displayOrder(item), resp: null, good: false }));
    qi = 0;
    phase = "exam";
    cta.classList.remove("gold");
    renderQuestion();
  }

  const GANADA = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ"];

  /** 문항 본문(질문·보기 상자·그림) — 시험과 리뷰가 공유한다. */
  function questionBody(it: ExamItem): HTMLElement {
    const box = el("div", {});
    box.appendChild(el("div", { class: "h1 sm", html: it.prompt }));
    if (it.bogi?.length) {
      const rows = it.bogi.map((b, i) =>
        el("div", { class: "ex-bogi-row" }, el("span", { class: "ex-bogi-label", text: `${GANADA[i]}.` }), el("span", { html: b })),
      );
      box.appendChild(el("div", { class: "ex-bogi" }, el("div", { class: "ex-bogi-head", text: "보기" }), ...rows));
    }
    if (it.figure) {
      box.appendChild(
        el("div", { class: `q-figure ${it.figureDark ? "dark" : ""}` }, el("div", { class: "q-figure-art", html: it.figure })),
      );
    }
    return box;
  }

  function renderQuestion(): void {
    phase = "exam";
    const q = session[qi];
    const it = q.item;
    pwrap.style.visibility = "visible";
    pbar.style.width = `${(qi / session.length) * 100}%`;
    counter.textContent = `${qi + 1} / ${session.length}`;
    clear(body);
    clear(footer);
    footer.appendChild(cta);

    const step = el("div", { class: "pad ex-q" });
    if (import.meta.env.DEV) {
      step.dataset.qid = it.id;
      step.dataset.type = it.type;
      step.dataset.ans = JSON.stringify(it.answer);
    }
    body.appendChild(step);
    body.scrollTop = 0;

    step.appendChild(el("div", { class: "qnum", text: `문제 ${qi + 1} / ${session.length}` }));
    step.appendChild(questionBody(it));

    const isLast = qi === session.length - 1;
    const ctaLabel = isLast ? "제출하기" : "다음 문제";
    const advance = (resp: number | number[] | string): void => {
      q.resp = resp;
      haptic(HAPTIC.tap);
      if (isLast) grade();
      else {
        qi += 1;
        renderQuestion();
      }
    };

    if (it.type === "mcq" || it.type === "multi") {
      const opts_ = it.options ?? [];
      const boxEl = el("div", { class: "opts ex-opts" });
      step.appendChild(boxEl);
      const selected = new Set<number>();
      const cards: HTMLButtonElement[] = [];
      for (const oi of q.order) {
        const card = el("button", { class: "opt", html: `${opts_[oi]}<span class="radio">${CHECK}</span>` });
        if (import.meta.env.DEV) card.dataset.oi = String(oi);
        card.addEventListener("click", () => {
          haptic(HAPTIC.select);
          if (it.type === "multi") {
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
          setCTA(ctaLabel, selected.size > 0, () => {
            const resp = it.type === "multi" ? [...selected].sort((a, b) => a - b) : [...selected][0];
            advance(resp);
          });
        });
        boxEl.appendChild(card);
        cards[oi] = card;
      }
      if (it.type === "multi") step.appendChild(el("div", { class: "ex-multi-hint", text: "정답을 모두 고른 뒤 버튼을 눌러요" }));
      setCTA(ctaLabel, false, null);
    } else if (it.type === "num") {
      const pad = makeAnswerPad(it.numKind ?? "int", (ready) => {
        setCTA(ctaLabel, ready, () => advance(pad.value()));
      });
      const row = el("div", { class: "ex-num-row" }, pad.ansEl);
      if (it.unitLabel) row.appendChild(el("span", { class: "ex-unit", text: it.unitLabel }));
      step.appendChild(row);
      step.appendChild(pad.padEl);
      setCTA(ctaLabel, false, null);
    } else {
      // word — 워드뱅크 칩(시스템 키보드 금지 원칙). 표시 순서만 셔플 —
      // 풀 전체가 정답을 bank[0]에 저작하는 관행이라 고정 노출 시 "첫 칩=정답" 패턴이 학습된다(u4 감사 지적).
      const bank = [...(it.bank ?? [])];
      for (let i = bank.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bank[i], bank[j]] = [bank[j], bank[i]];
      }
      const grid = el("div", { class: "ex-bank" });
      step.appendChild(grid);
      let picked: string | null = null;
      const chips: HTMLButtonElement[] = bank.map((w) => {
        const chip = el("button", { class: "ex-chip", text: w });
        if (import.meta.env.DEV) chip.dataset.w = w;
        chip.addEventListener("click", () => {
          haptic(HAPTIC.select);
          picked = w;
          chips.forEach((c) => c.classList.remove("sel"));
          chip.classList.add("sel");
          setCTA(ctaLabel, true, () => advance(picked!));
        });
        return chip;
      });
      chips.forEach((c) => grid.appendChild(c));
      step.appendChild(el("div", { class: "ex-multi-hint", text: "알맞은 용어 칩을 하나 골라요" }));
      setCTA(ctaLabel, false, null);
    }
  }

  // ---- 채점 ──────────────────────────────────────────────
  function isCorrect(q: SessionQ): boolean {
    const it = q.item;
    if (q.resp == null) return false;
    if (it.type === "mcq") return q.resp === it.answer;
    if (it.type === "multi") {
      const a = new Set(it.answer as number[]);
      const r = q.resp as number[];
      return r.length === a.size && r.every((x) => a.has(x));
    }
    if (it.type === "num") return checkAnswer(String(q.resp), String(it.answer)).good;
    return q.resp === it.answer;
  }

  function grade(): void {
    pbar.style.width = "100%";
    setCTA("채점 중…", false, null);
    clear(body);
    body.appendChild(
      el(
        "div",
        { class: "pad ex-grading" },
        el("div", { class: "ex-grading-ic", html: icon("target", 44) }),
        el("div", { class: "ex-grading-t", text: "채점하고 있어요" }),
        el("div", { class: "ex-grading-s", text: "파트별 진단표를 만드는 중…" }),
      ),
    );
    for (const q of session) q.good = isCorrect(q);
    const correct = session.filter((q) => q.good).length;
    const score = Math.round((correct / session.length) * 100);
    const conqueredNow = unitProgress(unit) === 100;
    const { gained, newBest } = recordExamResult(def.id, score, conqueredNow);
    later(() => {
      haptic(HAPTIC.done);
      renderResult(score, correct, gained, newBest, conqueredNow);
    }, 900);
  }

  // ---- 결과: 점수 + 레슨별 진단 + 전 문항 리뷰 ────────────
  function renderResult(score: number, correct: number, gained: number, newBest: boolean, conqueredNow: boolean): void {
    phase = "result";
    pwrap.style.visibility = "hidden";
    counter.textContent = "";
    clear(body);
    clear(footer);
    const rec = examRecordOf(def.id);
    const wrap = el("div", { class: "pad ex-result" });
    body.appendChild(wrap);
    body.scrollTop = 0;

    // 점수 히어로
    const band =
      score === 100
        ? "완벽해요! 단원을 완전히 손에 넣었어요"
        : score >= 90
          ? "훌륭해요! 정상이 코앞이에요"
          : score >= 70
            ? "좋아요! 약한 파트만 다지면 돼요"
            : score >= 50
              ? "절반을 넘었어요. 진단표부터 살펴봐요"
              : "이제 시작이에요. 어디가 약한지 알게 됐잖아요!";
    const scoreNum = el("span", { class: "ex-score-num", text: "0" });
    wrap.appendChild(
      el(
        "div",
        { class: "ex-score-hero", dataset: import.meta.env.DEV ? { score: String(score) } : undefined },
        el("div", { class: "ex-score-line" }, scoreNum, el("span", { class: "ex-score-max", text: "점" })),
        el("div", { class: "ex-score-sub", text: `${session.length}문제 중 ${correct}개 정답` }),
        el("div", { class: "ex-score-band", text: band }),
      ),
    );
    countUp(scoreNum, score, 800);

    // XP — 신기록 갱신분만(스타 게임 문법)
    if (gained > 0) {
      wrap.appendChild(
        el("div", { class: "ex-xp" }, el("span", { html: icon("bolt", 15) }), el("span", { html: `신기록! <b>+${gained} XP</b>` })),
      );
    } else if (rec.attempts > 1) {
      wrap.appendChild(
        el("div", { class: "ex-xp quiet" }, el("span", { html: icon("trophy", 15) }), el("span", { text: `최고 기록 ${rec.best}점` })),
      );
    }

    // 정복 인증 배지
    if (rec.conquered) {
      wrap.appendChild(
        el(
          "div",
          { class: "ex-conq" },
          el("div", { class: "ex-conq-med", html: icon("crown", 26) }),
          el(
            "div",
            {},
            el("div", { class: "ex-conq-t", text: conqueredNow && newBest ? "단원 정복 인증!" : "단원 정복 인증" }),
            el("div", { class: "ex-conq-s", text: "모든 레슨을 정복한 상태로 평가를 마쳤어요" }),
          ),
        ),
      );
    } else {
      wrap.appendChild(
        el(
          "div",
          { class: "ex-conq-hint" },
          el("span", { html: icon("crown", 15) }),
          el("span", { html: "모든 레슨을 정복한 뒤 응시하면 <b>정복 인증 배지</b>를 받아요." }),
        ),
      );
    }

    // 레슨별 진단
    wrap.appendChild(el("div", { class: "sec-head", text: "파트별 진단" }));
    const byLesson = new Map<string, { c: number; t: number }>();
    for (const q of session) {
      const s = byLesson.get(q.item.lessonId) ?? { c: 0, t: 0 };
      s.t += 1;
      if (q.good) s.c += 1;
      byLesson.set(q.item.lessonId, s);
    }
    let worst = 1;
    for (const s of byLesson.values()) worst = Math.min(worst, s.c / s.t);
    const diag = el("div", { class: "ex-diag" });
    for (const lesson of unit.lessons) {
      const s = byLesson.get(lesson.id);
      if (!s) continue;
      const ratio = s.c / s.t;
      const weak = ratio === worst && ratio < 1;
      const row = el("div", { class: `ex-diag-row ${weak ? "weak" : ""}` });
      if (import.meta.env.DEV) {
        row.dataset.lesson = lesson.id;
        row.dataset.c = String(s.c);
        row.dataset.t = String(s.t);
      }
      const barFill = el("i", { style: `width:${(ratio * 100).toFixed(0)}%` });
      row.appendChild(
        el(
          "div",
          { class: "ex-diag-main" },
          el(
            "div",
            { class: "ex-diag-top" },
            el("span", { class: "ex-diag-name", text: lesson.label ?? lesson.title }),
            weak ? el("span", { class: "ex-diag-tag", text: "이 파트가 약해요" }) : null,
            el("span", { class: "ex-diag-score", text: `${s.c}/${s.t}` }),
          ),
          el("div", { class: "ex-diag-bar" }, barFill),
        ),
      );
      if (ratio < 1) {
        const go = el("button", { class: "ex-diag-btn", attrs: { "aria-label": `${lesson.title} 복습하기` } }, el("span", { text: "복습" }), el("span", { html: icon("chevron", 14) }));
        go.addEventListener("click", () => {
          haptic(HAPTIC.tap);
          opts.onOpenLesson(lesson.id);
        });
        row.appendChild(go);
      }
      diag.appendChild(row);
    }
    if (worst === 1) diag.appendChild(el("div", { class: "ex-diag-perfect", text: "모든 파트를 완벽하게 해냈어요!" }));
    wrap.appendChild(diag);

    // 전 문항 리뷰(오답 리뷰 + 맞은 문항 다시 보기)
    const wrongCount = session.length - correct;
    wrap.appendChild(
      el("div", { class: "sec-head", text: wrongCount > 0 ? `문항 리뷰 · 오답 ${wrongCount}` : "문항 리뷰" }),
    );
    const reviewBox = el("div", { class: "ex-review" });
    session.forEach((q, i) => reviewBox.appendChild(reviewRow(q, i)));
    wrap.appendChild(reviewBox);

    // 푸터: 홈으로(주) + 다시 응시(부 — 잠기면 페이월)
    const retake = el("button", { class: "ex-retake" });
    const paintRetake = (): void => {
      const locked = isExamRetakeLocked(def.id);
      retake.innerHTML = locked ? `${icon("crown", 15)}<span>프리미엄으로 다시 풀기</span>` : `<span>다시 응시하기</span>`;
      retake.classList.toggle("gold", locked);
    };
    paintRetake();
    retake.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      if (isExamRetakeLocked(def.id)) opts.onPaywall(() => {
        paintRetake();
        startExam();
      });
      else startExam();
    });
    footer.append(cta, retake);
    setCTA("홈으로", true, opts.onExit, true);
  }

  /** 리뷰 행 — 접었다 펴는 아코디언. 펼치면 그림·보기·내 답·해설·레슨 바로가기까지 전부. */
  function reviewRow(q: SessionQ, i: number): HTMLElement {
    const it = q.item;
    const row = el("div", { class: `xr-row ${q.good ? "good" : "bad"}` });
    if (import.meta.env.DEV) {
      row.dataset.qid = it.id;
      row.dataset.good = q.good ? "1" : "0";
    }
    const head = el(
      "button",
      { class: "xr-head", attrs: { "aria-expanded": "false" } },
      el("span", { class: `xr-ic ${q.good ? "good" : "bad"}`, html: q.good ? icon("check", 13) : icon("xThick", 13) }),
      el("span", { class: "xr-num", text: String(i + 1).padStart(2, "0") }),
      el("span", { class: "xr-sum", text: summarize(it.prompt) }),
      el("span", { class: "xr-chev", html: icon("chevronDown", 16) }),
    );
    row.appendChild(head);
    let bodyEl: HTMLElement | null = null;
    head.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      if (bodyEl) {
        const open = row.classList.toggle("open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
        return;
      }
      bodyEl = reviewBody(q);
      row.appendChild(bodyEl);
      row.classList.add("open");
      head.setAttribute("aria-expanded", "true");
    });
    return row;
  }

  function reviewBody(q: SessionQ): HTMLElement {
    const it = q.item;
    const box = el("div", { class: "xr-body" });
    const lessonInfo = findLesson(it.lessonId);
    box.appendChild(el("div", { class: "xr-lesson-chip", text: lessonInfo ? `${lessonInfo.lesson.label ?? lessonInfo.lesson.title}` : "" }));
    box.appendChild(questionBody(it));

    if (it.type === "mcq" || it.type === "multi") {
      const optsBox = el("div", { class: "opts ex-opts review" });
      const answers = new Set<number>(Array.isArray(it.answer) ? (it.answer as number[]) : [it.answer as number]);
      const mine = new Set<number>(q.resp == null ? [] : Array.isArray(q.resp) ? (q.resp as number[]) : [q.resp as number]);
      for (const oi of q.order) {
        const isAns = answers.has(oi);
        const isMine = mine.has(oi);
        const card = el("div", { class: `opt ${isAns ? "ok" : isMine ? "no" : "dim"}` });
        card.innerHTML = `${it.options![oi]}${
          isAns ? `<span class="xr-tag ok">정답</span>` : isMine ? `<span class="xr-tag no">내 답</span>` : ""
        }`;
        // 맞은 보기에 내가 골랐다는 표시도 함께(합답형에서 부분 선택 확인용)
        if (isAns && isMine) card.innerHTML = `${it.options![oi]}<span class="xr-tag ok">정답 · 내 답</span>`;
        optsBox.appendChild(card);
      }
      box.appendChild(optsBox);
    } else if (it.type === "num") {
      box.appendChild(answerPair(q.resp == null ? "무응답" : `${q.resp}${it.unitLabel ? ` ${it.unitLabel}` : ""}`, `${it.answer}${it.unitLabel ? ` ${it.unitLabel}` : ""}`, q.good));
    } else {
      box.appendChild(answerPair(q.resp == null ? "무응답" : String(q.resp), String(it.answer), q.good));
    }

    const expl = el("div", { class: "xr-expl" });
    expl.appendChild(el("div", { class: "xr-expl-head", text: q.good ? "해설 — 이렇게 푸는 문제였어요" : "해설 — 왜 그런지 뜯어봐요" }));
    expl.appendChild(el("div", { class: "xr-expl-body", html: it.explain }));
    box.appendChild(expl);

    box.appendChild(el("div", { class: "xr-core" }, el("span", { html: icon("bulb", 14) }), el("span", { html: it.core })));

    if (lessonInfo) {
      const go = el("button", { class: "xr-lesson-btn" });
      go.innerHTML = `<span>이 레슨 복습하기 — ${lessonInfo.lesson.label ?? lessonInfo.lesson.title}</span>${icon("chevron", 15)}`;
      go.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        opts.onOpenLesson(it.lessonId);
      });
      box.appendChild(go);
    }
    return box;
  }

  /** 내 답 vs 정답 카드(num·word 공용). */
  function answerPair(mine: string, ans: string, good: boolean): HTMLElement {
    const box = el("div", { class: "xr-pair" });
    box.appendChild(
      el("div", { class: `xr-pair-cell ${good ? "ok" : "no"}` }, el("div", { class: "xr-pair-k", text: "내 답" }), el("div", { class: "xr-pair-v", text: mine })),
    );
    if (!good) {
      box.appendChild(
        el("div", { class: "xr-pair-cell ok" }, el("div", { class: "xr-pair-k", text: "정답" }), el("div", { class: "xr-pair-v", text: ans })),
      );
    }
    return box;
  }

  function summarize(html: string): string {
    const div = document.createElement("div");
    div.innerHTML = html;
    const t = (div.textContent ?? "").replace(/\s+/g, " ").trim();
    return t.length > 46 ? `${t.slice(0, 46)}…` : t;
  }

  renderIntro();
  return {
    el: section,
    onExit: () => {
      for (const t of timers) window.clearTimeout(t);
      timers.clear();
    },
  };
}
