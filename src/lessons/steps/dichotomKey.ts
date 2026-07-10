// dichotomKey - observe representative organisms, verify their traits, and sort them into the five kingdoms.

import { clear, el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import "../../styles/bio-kingdom.css";

type Kingdom = "원핵생물계" | "원생생물계" | "균계" | "식물계" | "동물계";

interface OrganismCheck {
  q: string;
  answer: boolean;
  good: string;
  bad: string;
}

interface Organism {
  name: string;
  kingdom: Kingdom;
  svg?: string;
  facts: string[];
  checks: OrganismCheck[];
  reason?: string;
}

interface DichotomStep {
  title: string;
  lead?: string;
  organisms: Organism[];
  explainGood?: string;
  explainBad?: string;
  curio?: Curio;
}

interface KingdomMeta {
  short: string;
  color: string;
  nucleus: string;
  wall: string;
  nutrition: string;
}

const KINGDOM_ORDER: Kingdom[] = ["원핵생물계", "원생생물계", "균계", "식물계", "동물계"];

const KINGDOM_META: Record<Kingdom, KingdomMeta> = {
  원핵생물계: {
    short: "원핵<br>생물계",
    color: "#7657E8",
    nucleus: "없음 · 한 세포",
    wall: "있음",
    nutrition: "종류마다 다름",
  },
  원생생물계: {
    short: "원생<br>생물계",
    color: "#078FA8",
    nucleus: "있음 · 대부분 한 세포",
    wall: "종류마다 다름",
    nutrition: "종류마다 다름",
  },
  균계: {
    short: "균계",
    color: "#D96B22",
    nucleus: "있음 · 대부분 여러 세포",
    wall: "있음",
    nutrition: "분해해 흡수",
  },
  식물계: {
    short: "식물계",
    color: "#218A52",
    nucleus: "있음 · 여러 세포",
    wall: "있음",
    nutrition: "광합성",
  },
  동물계: {
    short: "동물계",
    color: "#2773D3",
    nucleus: "있음 · 여러 세포",
    wall: "없음",
    nutrition: "먹이 섭취",
  },
};

export const dichotomKey: StepRenderer = (host, step, api) => {
  const s = step as unknown as DichotomStep;
  let organismIndex = 0;
  let checkIndex = 0;
  let answerLocked = false;
  let firstTryPerfect = true;
  let finished = false;
  let disposed = false;
  let quizRecorded = false;

  const timers = new Set<number>();
  const frames = new Set<number>();
  const flightTokens = new Set<HTMLElement>();
  const cleanups: (() => void)[] = [];
  const placedCounts = new Map<Kingdom, number>(KINGDOM_ORDER.map((kingdom) => [kingdom, 0]));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lessonScroll = host.closest<HTMLElement>(".scroll");

  const later = (fn: () => void, delay: number): void => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      if (!disposed) fn();
    }, delay);
    timers.add(timer);
  };

  const nextFrame = (fn: () => void): void => {
    const frame = window.requestAnimationFrame(() => {
      frames.delete(frame);
      if (!disposed) fn();
    });
    frames.add(frame);
  };

  const listen = (target: EventTarget, type: string, handler: EventListener): void => {
    target.addEventListener(type, handler);
    cleanups.push(() => target.removeEventListener(type, handler));
  };

  const pinAppFrame = (): void => {
    if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0);
    const frame = document.querySelector<HTMLElement>("#frame");
    if (frame && (frame.scrollTop !== 0 || frame.scrollLeft !== 0)) frame.scrollTo(0, 0);
    const screen = host.closest<HTMLElement>(".screen");
    if (screen && (screen.scrollTop !== 0 || screen.scrollLeft !== 0)) screen.scrollTo(0, 0);
  };

  const scrollInsideLesson = (target: HTMLElement, alignStart = false): void => {
    pinAppFrame();
    if (!lessonScroll) return;
    const paneRect = lessonScroll.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    let nextTop = lessonScroll.scrollTop;

    if (alignStart) {
      const stickyBoard = host.querySelector<HTMLElement>(".dk5-board-shell");
      const stickyOffset = (stickyBoard?.offsetHeight ?? 0) + 8;
      nextTop += targetRect.top - paneRect.top - stickyOffset;
    } else if (targetRect.bottom > paneRect.bottom - 12) {
      nextTop += targetRect.bottom - paneRect.bottom + 12;
    } else if (targetRect.top < paneRect.top + 12) {
      nextTop += targetRect.top - paneRect.top - 12;
    }

    lessonScroll.scrollTo({
      top: Math.max(0, nextTop),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const lockImages = (root: ParentNode): void => {
    root.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      image.draggable = false;
      image.setAttribute("draggable", "false");
    });
  };

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const progress = el("div", {
    class: "dk5-progress",
    attrs: { role: "status", "aria-live": "polite" },
  });
  const slotMap = new Map<Kingdom, HTMLElement>();
  const destinationBoard = el("div", {
    class: "dk5-board",
    attrs: { role: "list", "aria-label": "다섯 생물계 분류 목적지" },
  });

  for (const kingdom of KINGDOM_ORDER) {
    const meta = KINGDOM_META[kingdom];
    const slot = el(
      "div",
      {
        class: "dk5-slot",
        dataset: { kingdom },
        style: `--dk5-color:${meta.color}`,
        attrs: { role: "listitem", "aria-label": `${kingdom} 목적지, 분류된 생물 0개` },
      },
      el("span", { class: "dk5-slot-label", html: meta.short }),
      el("span", { class: "dk5-slot-items", attrs: { "aria-hidden": "true" } }),
      el("span", { class: "dk5-slot-count", text: "0" }),
    );
    slotMap.set(kingdom, slot);
    destinationBoard.appendChild(slot);
  }

  const boardShell = el(
    "div",
    { class: "dk5-board-shell" },
    progress,
    destinationBoard,
  );

  const organismKicker = el("div", { class: "dk5-organism-kicker" });
  const heroArt = el("div", { class: "dk5-hero-art" });
  const heroName = el("div", { class: "dk5-hero-name" });
  const factList = el("ul", { class: "dk5-facts", attrs: { "aria-label": "관찰한 특징" } });
  const startButton = el(
    "button",
    { class: "dk5-start", attrs: { type: "button" } },
    el("span", { text: "특징으로 분류 시작" }),
  );

  const questionStep = el("div", { class: "dk5-question-step" });
  const question = el("div", { class: "dk5-question" });
  const yesButton = answerButton(true);
  const noButton = answerButton(false);
  const answerButtons = el("div", { class: "dk5-answer-buttons" }, yesButton, noButton);
  const feedback = el("div", {
    class: "dk5-feedback",
    attrs: { role: "status", "aria-live": "polite" },
  });
  const questionPanel = el(
    "div",
    { class: "dk5-question-panel", attrs: { hidden: true } },
    questionStep,
    question,
    answerButtons,
    feedback,
  );
  const reason = el("div", { class: "dk5-reason", attrs: { hidden: true } });

  const organismStage = el(
    "section",
    { class: "dk5-stage", attrs: { "aria-label": "대표 생물 특징 관찰과 분류" } },
    organismKicker,
    heroArt,
    heroName,
    factList,
    startButton,
    questionPanel,
    reason,
  );

  const finalWrap = el("section", {
    class: "dk5-final",
    attrs: { hidden: true, "aria-label": "다섯 생물계 최종 비교" },
  });

  host.append(boardShell, organismStage, finalWrap);
  api.setCTA("대표 생물 5종을 모두 분류하세요", { enabled: false });

  listen(startButton, "click", beginQuestions);
  listen(yesButton, "click", () => answerCurrent(true));
  listen(noButton, "click", () => answerCurrent(false));
  listen(host, "dragstart", (event) => event.preventDefault());

  renderOrganism();

  function answerButton(value: boolean): HTMLButtonElement {
    const label = value ? "O, 그렇다" : "X, 그렇지 않다";
    return el(
      "button",
      {
        class: `dk5-answer-btn ${value ? "yes" : "no"}`,
        dataset: { answer: String(value) },
        attrs: { type: "button", "aria-label": label },
      },
      el("span", { class: "dk5-answer-symbol", text: value ? "O" : "×", attrs: { "aria-hidden": "true" } }),
      el("span", { class: "dk5-sr", text: label }),
    );
  }

  function renderOrganism(): void {
    const organism = s.organisms[organismIndex];
    checkIndex = 0;
    answerLocked = false;
    organismStage.hidden = false;
    organismStage.classList.remove("is-classified", "is-flying");
    finalWrap.hidden = true;
    progress.innerHTML = `<b>${organismIndex}</b> / ${s.organisms.length} 대표 생물 분류 완료`;
    organismKicker.textContent = `대표 생물 ${organismIndex + 1} / ${s.organisms.length}`;
    heroArt.innerHTML = organism.svg ?? "";
    heroName.textContent = organism.name;
    clear(factList);
    organism.facts.forEach((fact, index) => {
      factList.appendChild(
        el(
          "li",
          { class: "dk5-fact", dataset: { fact: String(index) } },
          el("span", { class: "dk5-fact-mark", text: String(index + 1), attrs: { "aria-hidden": "true" } }),
          el("span", { class: "dk5-fact-text", html: fact }),
        ),
      );
    });
    lockImages(heroArt);
    startButton.hidden = false;
    questionPanel.hidden = true;
    reason.hidden = true;
    reason.innerHTML = "";
    feedback.className = "dk5-feedback";
    feedback.innerHTML = "관찰한 특징을 근거로 판단해 보세요.";
    resetAnswerButtons();
    if (organismIndex > 0) nextFrame(() => scrollInsideLesson(organismStage, true));
  }

  function beginQuestions(): void {
    if (answerLocked || finished) return;
    pinAppFrame();
    haptic(HAPTIC.select);
    startButton.hidden = true;
    questionPanel.hidden = false;
    renderQuestion();
    scrollInsideLesson(questionPanel);
  }

  function renderQuestion(): void {
    const organism = s.organisms[organismIndex];
    const check = organism.checks[checkIndex];
    answerLocked = false;
    questionStep.textContent = `근거 확인 ${checkIndex + 1} / ${organism.checks.length}`;
    question.innerHTML = check.q;
    feedback.className = "dk5-feedback";
    feedback.innerHTML = "O 또는 X를 고르세요.";
    factList.querySelectorAll(".dk5-fact").forEach((fact) => {
      fact.classList.remove("is-evidence", "is-correction");
    });
    resetAnswerButtons();
  }

  function answerCurrent(value: boolean): void {
    if (answerLocked || finished || questionPanel.hidden) return;
    pinAppFrame();
    const organism = s.organisms[organismIndex];
    const check = organism.checks[checkIndex];
    const chosen = value ? yesButton : noButton;
    const fact = relatedFact(organism);
    answerLocked = true;
    setAnswerButtonsDisabled(true);

    if (value !== check.answer) {
      firstTryPerfect = false;
      chosen.classList.add("is-wrong");
      fact?.classList.remove("is-evidence");
      fact?.classList.add("is-correction");
      question.classList.add("shake");
      feedback.className = "dk5-feedback bad";
      feedback.innerHTML = `<b>다시 확인해요.</b> ${check.bad}`;
      haptic(HAPTIC.wrong);
      later(() => question.classList.remove("shake"), 420);
      later(() => {
        answerLocked = false;
        resetAnswerButtons();
      }, 620);
      return;
    }

    chosen.classList.add("is-correct");
    fact?.classList.remove("is-correction");
    fact?.classList.add("is-evidence", "is-confirmed");
    feedback.className = "dk5-feedback good";
    feedback.innerHTML = `<b>근거를 찾았어요.</b> ${check.good}`;
    haptic(HAPTIC.select);
    later(() => {
      checkIndex += 1;
      if (checkIndex < organism.checks.length) renderQuestion();
      else classifyCurrent();
    }, reduceMotion ? 180 : 720);
  }

  function relatedFact(organism: Organism): HTMLElement | null {
    const index = Math.min(checkIndex, Math.max(0, organism.facts.length - 1));
    return factList.querySelector<HTMLElement>(`[data-fact="${index}"]`);
  }

  function resetAnswerButtons(): void {
    [yesButton, noButton].forEach((button) => {
      button.disabled = false;
      button.classList.remove("is-correct", "is-wrong");
    });
  }

  function setAnswerButtonsDisabled(disabled: boolean): void {
    yesButton.disabled = disabled;
    noButton.disabled = disabled;
  }

  function classifyCurrent(): void {
    const organism = s.organisms[organismIndex];
    answerLocked = true;
    organismStage.classList.add("is-classified");
    questionPanel.hidden = true;
    reason.hidden = false;
    reason.innerHTML = `<b style="color:${KINGDOM_META[organism.kingdom].color}">${organism.kingdom}</b>${organism.reason ? `<span>${organism.reason}</span>` : ""}`;
    haptic(HAPTIC.correct);
    later(() => launchToKingdom(organism), reduceMotion ? 120 : 460);
  }

  function launchToKingdom(organism: Organism): void {
    const destination = slotMap.get(organism.kingdom);
    if (!destination) return;
    const sourceRect = heroArt.getBoundingClientRect();
    const targetRect = destination.getBoundingClientRect();
    const targetSize = Math.min(38, Math.max(28, targetRect.width - 12));
    const targetLeft = targetRect.left + (targetRect.width - targetSize) / 2;
    const targetTop = targetRect.top + targetRect.height - targetSize - 7;
    const duration = reduceMotion ? 80 : 720;

    const flight = el(
      "div",
      {
        class: "dk5-flight",
        attrs: { "aria-hidden": "true" },
        style: {
          left: `${sourceRect.left}px`,
          top: `${sourceRect.top}px`,
          width: `${sourceRect.width}px`,
          height: `${sourceRect.height}px`,
          transitionDuration: `${duration}ms`,
        },
      },
      el("span", { class: "dk5-flight-art", html: organism.svg ?? "" }),
    );
    lockImages(flight);
    flightTokens.add(flight);
    document.body.appendChild(flight);
    organismStage.classList.add("is-flying");

    nextFrame(() => {
      flight.style.left = `${targetLeft}px`;
      flight.style.top = `${targetTop}px`;
      flight.style.width = `${targetSize}px`;
      flight.style.height = `${targetSize}px`;
      flight.style.transform = "rotate(7deg) scale(.92)";
    });

    later(() => {
      flight.remove();
      flightTokens.delete(flight);
      addPlacedToken(organism);
      organismStage.classList.remove("is-flying");
      organismIndex += 1;
      if (organismIndex >= s.organisms.length) finishLab();
      else later(renderOrganism, reduceMotion ? 80 : 260);
    }, duration + 90);
  }

  function addPlacedToken(organism: Organism): void {
    const slot = slotMap.get(organism.kingdom);
    if (!slot) return;
    const items = slot.querySelector<HTMLElement>(".dk5-slot-items");
    const count = (placedCounts.get(organism.kingdom) ?? 0) + 1;
    placedCounts.set(organism.kingdom, count);
    const token = el("span", {
      class: "dk5-mini-token",
      html: organism.svg ?? "",
      attrs: { title: organism.name, "aria-label": organism.name },
    });
    lockImages(token);
    items?.appendChild(token);
    slot.querySelector<HTMLElement>(".dk5-slot-count")!.textContent = String(count);
    slot.classList.add("is-filled");
    slot.setAttribute("aria-label", `${organism.kingdom} 목적지, 분류된 생물 ${count}개`);
  }

  function finishLab(): void {
    if (finished) return;
    finished = true;
    answerLocked = true;
    progress.innerHTML = `<b>${s.organisms.length}</b> / ${s.organisms.length} 대표 생물 분류 완료`;
    boardShell.classList.add("is-complete");
    organismStage.hidden = true;
    renderFinalComparison();
    finalWrap.hidden = false;
    if (!quizRecorded) {
      quizRecorded = true;
      api.recordQuiz(firstTryPerfect);
    }
    api.setCTA("5계 비교 결과 확인하기", {
      enabled: true,
      pop: true,
      onClick: openCompletionSheet,
    });
    haptic(HAPTIC.ctaUnlock);
    later(() => {
      scrollInsideLesson(finalWrap, true);
    }, 120);
  }

  function renderFinalComparison(): void {
    clear(finalWrap);
    finalWrap.append(
      el("div", { class: "dk5-final-kicker", text: "분류 지도가 완성됐어요" }),
      el("div", { class: "dk5-final-title", text: "다섯 계의 결정적 특징 비교" }),
      el("p", { class: "dk5-final-lead", text: "대표 생물과 핵막·세포 수, 세포벽, 양분을 얻는 방법을 한 표에서 비교해요." }),
      buildComparisonTable(),
    );
    if (s.curio) finalWrap.appendChild(curioCard(s.curio));
    lockImages(finalWrap);
  }

  function buildComparisonTable(): HTMLElement {
    const table = el("div", {
      class: "dk5-table",
      attrs: { role: "table", "aria-label": "다섯 생물계 최종 비교표" },
    });
    table.appendChild(
      el(
        "div",
        { class: "dk5-table-head", attrs: { role: "row" } },
        tableHead("계"),
        tableHead("대표"),
        tableHead("핵막·세포 수"),
        tableHead("세포벽"),
        tableHead("양분 얻기"),
      ),
    );

    const body = el("div", { class: "dk5-table-body", attrs: { role: "rowgroup" } });
    for (const kingdom of KINGDOM_ORDER) {
      const meta = KINGDOM_META[kingdom];
      const representative = s.organisms.find((organism) => organism.kingdom === kingdom);
      const repValue = el(
        "span",
        { class: "dk5-representative" },
        el("span", { class: "dk5-representative-art", html: representative?.svg ?? "" }),
        el("span", { text: representative?.name ?? "-" }),
      );
      const row = el(
        "div",
        {
          class: "dk5-table-row",
          style: `--dk5-color:${meta.color}`,
          attrs: { role: "row" },
        },
        el("div", { class: "dk5-cell kingdom", attrs: { role: "rowheader" } }, el("span", { text: kingdom })),
        tableCell("대표", repValue),
        tableCell("핵막·세포 수", meta.nucleus),
        tableCell("세포벽", meta.wall),
        tableCell("양분 얻기", meta.nutrition),
      );
      body.appendChild(row);
    }
    table.appendChild(body);
    return table;
  }

  function tableHead(label: string): HTMLElement {
    return el("div", { class: "dk5-head-cell", text: label, attrs: { role: "columnheader" } });
  }

  function tableCell(label: string, value: string | HTMLElement): HTMLElement {
    return el(
      "div",
      { class: "dk5-cell", dataset: { label }, attrs: { role: "cell" } },
      typeof value === "string" ? el("span", { text: value }) : value,
    );
  }

  function openCompletionSheet(): void {
    api.openSheet({
      good: firstTryPerfect,
      title: firstTryPerfect ? "특징으로 다섯 계를 완성했어요" : "다섯 계 분류를 완성했어요",
      html: (firstTryPerfect ? s.explainGood : s.explainBad) ?? "",
      onContinue: api.next,
    });
  }

  return () => {
    disposed = true;
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    frames.forEach((frame) => window.cancelAnimationFrame(frame));
    frames.clear();
    cleanups.forEach((cleanup) => cleanup());
    flightTokens.forEach((token) => token.remove());
    flightTokens.clear();
  };
};
