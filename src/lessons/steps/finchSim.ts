// finchSim — 부리형 비율이 같은 두 초기 집단을 서로 다른 먹이 환경에 각각 놓아 생존을 비교한다.
// 씨앗 섬에서는 굵고 짧은 부리, 곤충 섬에서는 가늘고 긴 부리만 먹이를 얻는다.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";
import "../../styles/bio-unit.css";

interface FinchStep {
  title: string;
  lead?: string;
  explainGood?: string;
  completionTitle?: string;
}

type Environment = "seed" | "insect";
type BeakType = "thick" | "medium" | "thin";
type Goal = "seed" | "insect" | "compare";

interface EnvironmentInfo {
  name: string;
  short: string;
  winner: BeakType;
  prompt: string;
  result: string;
}

const ENVIRONMENTS: Record<Environment, EnvironmentInfo> = {
  seed: {
    name: "씨앗 섬",
    short: "큰 딱딱한 씨앗",
    winner: "thick",
    prompt: "껍질이 단단한 큰 씨앗뿐이에요. 어떤 부리가 씨앗을 깨 먹을 수 있을까요?",
    result: "굵고 짧은 부리가 단단한 씨앗을 깨 먹고 살아남았어요.",
  },
  insect: {
    name: "곤충 섬",
    short: "나무껍질 틈의 곤충",
    winner: "thin",
    prompt: "곤충이 나무껍질의 좁은 틈에 숨어 있어요. 어떤 부리가 틈 안까지 닿을까요?",
    result: "가늘고 긴 부리가 좁은 틈의 곤충을 꺼내 먹고 살아남았어요.",
  },
};

const BEAKS: Record<BeakType, { label: string; short: string }> = {
  thick: { label: "굵고 짧은 부리", short: "굵고 짧음" },
  medium: { label: "중간 부리", short: "중간" },
  thin: { label: "가늘고 긴 부리", short: "가늘고 긺" },
};

const BEAK_ORDER: BeakType[] = ["thick", "medium", "thin"];

export const finchSim: StepRenderer = (host, step, api) => {
  const s = step as unknown as FinchStep;
  let selected: Environment | null = null;
  let running = false;
  let finished = false;
  let disposed = false;
  const completed = new Set<Environment>();
  const goals = new Set<Goal>();
  const timers = new Set<number>();
  const cleanups: (() => void)[] = [];

  const later = (fn: () => void, delay: number): void => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      if (!disposed) fn();
    }, delay);
    timers.add(timer);
  };
  const listen = (target: EventTarget, type: string, handler: EventListener): void => {
    target.addEventListener(type, handler);
    cleanups.push(() => target.removeEventListener(type, handler));
  };

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3 fs-goals", attrs: { "aria-label": "먹이 경쟁 실험 목표" } },
    goalChip("seed", "씨앗 적합", "실험 전"),
    goalChip("insect", "곤충 적합", "실험 전"),
    goalChip("compare", "선택 비교", "두 섬 비교"),
  );

  const environmentButtons = {} as Record<Environment, HTMLButtonElement>;
  const environmentControl = el("div", {
    class: "seg fs-env-seg",
    attrs: { role: "group", "aria-label": "먹이 환경 선택" },
  });
  (["seed", "insect"] as const).forEach((environment) => {
    const info = ENVIRONMENTS[environment];
    const button = el(
      "button",
      {
        class: "fs-env-btn",
        attrs: {
          type: "button",
          "aria-pressed": "false",
          "aria-label": `${info.name}, ${info.short}`,
        },
      },
      el("span", { class: `fs-env-symbol ${environment}`, attrs: { "aria-hidden": "true" } }),
      el("span", { text: info.name }),
      el("small", { text: info.short }),
    );
    environmentButtons[environment] = button;
    environmentControl.appendChild(button);
    listen(button, "click", () => selectEnvironment(environment));
  });

  const stageState = el("span", { class: "fs-stage-state", text: "초기 집단 12마리" });
  const habitat = el("div", { class: "fs-habitat", html: overviewArt() });
  const population = el("div", { class: "fs-flock" });
  const comparison = el("div", { class: "fs-comparison", attrs: { hidden: true } });
  const stage = el(
    "div",
    {
      class: "stage fs-stage",
      dataset: { environment: "overview", phase: "ready" },
      attrs: { role: "region", "aria-label": "부리 변이와 먹이 경쟁 실험장" },
    },
    el(
      "div",
      { class: "fs-stage-head" },
      el("span", { class: "fs-stage-title", text: "초기 집단" }),
      stageState,
    ),
    habitat,
    population,
    comparison,
  );

  const startButton = el(
    "button",
    { class: "swapbtn fs-start", attrs: { type: "button", disabled: true } },
    el("span", { text: "환경을 먼저 선택하세요" }),
  );
  const helper = el("div", {
    class: "helper fs-helper",
    html: "각 섬에는 <b>세 가지 부리형이 각각 4마리씩인 별도 초기 집단</b>을 놓아요. 먼저 실험할 섬을 고르세요.",
    attrs: { role: "status", "aria-live": "polite" },
  });

  host.append(goalChips, environmentControl, stage, startButton, helper);
  renderPopulation();
  api.setCTA("씨앗 섬과 곤충 섬 실험을 모두 완료하세요", { enabled: false });
  listen(startButton, "click", runCompetition);

  function goalChip(id: Goal, label: string, detail: string): HTMLElement {
    return el(
      "div",
      { class: "pn-badge fs-goal", dataset: { g: id } },
      el("b", { text: label }),
      el("span", { text: detail }),
    );
  }

  function markGoal(goal: Goal, detail: string): void {
    if (goals.has(goal)) return;
    goals.add(goal);
    const chip = goalChips.querySelector<HTMLElement>(`[data-g="${goal}"]`);
    chip?.classList.add("on");
    const sub = chip?.querySelector<HTMLElement>("span");
    if (sub) sub.textContent = detail;
    haptic(goal === "compare" ? HAPTIC.ctaUnlock : HAPTIC.select);
  }

  function renderPopulation(resultFor?: Environment): void {
    population.replaceChildren();
    for (const type of BEAK_ORDER) {
      const birds = el("div", { class: "fs-birds" });
      for (let index = 0; index < 4; index += 1) {
        const bird = el(
          "div",
          {
            class: "fs-bird",
            dataset: { beak: type },
            attrs: {
              role: "img",
              "aria-label": `${BEAKS[type].label} ${index + 1}번 새, 먹이 경쟁 전`,
            },
          },
          el("span", { class: "fs-bird-art", html: birdArt(type, index) }),
          el("span", { class: "fs-bird-status", text: "대기" }),
        );
        birds.appendChild(bird);
      }
      population.appendChild(
        el(
          "div",
          { class: "fs-flock-row", dataset: { beak: type } },
          el(
            "div",
            { class: "fs-beak-label" },
            el("b", { text: BEAKS[type].short }),
            el("span", { text: "4마리" }),
          ),
          birds,
        ),
      );
    }
    if (resultFor) showOutcome(resultFor, true);
  }

  function selectEnvironment(environment: Environment): void {
    if (running || finished) return;
    selected = environment;
    const hasResult = completed.has(environment);
    stage.dataset.environment = environment;
    stage.dataset.phase = hasResult ? "resolved" : "ready";
    stage.classList.remove("fs-running", "fs-resolved", "fs-compared");
    stage.classList.toggle("fs-resolved", hasResult);
    comparison.hidden = true;
    habitat.innerHTML = environmentArt(environment);
    renderPopulation(hasResult ? environment : undefined);
    const info = ENVIRONMENTS[environment];
    helper.innerHTML = hasResult
      ? `<b>${info.name}</b> 실험은 완료했어요. 결과를 다시 보고 다른 섬을 선택하세요.`
      : `<b>${info.name}</b>, ${info.prompt}`;
    stageState.textContent = hasResult ? "실험 결과" : "초기 집단 12마리";
    haptic(HAPTIC.tap);
    syncControls();
  }

  function syncControls(): void {
    (["seed", "insect"] as const).forEach((environment) => {
      const button = environmentButtons[environment];
      const active = selected === environment;
      button.classList.toggle("on", active);
      button.classList.toggle("fs-done", completed.has(environment));
      button.classList.toggle("fs-next", completed.size === 1 && !completed.has(environment));
      button.setAttribute("aria-pressed", String(active));
      button.disabled = running || finished;
    });
    const label = startButton.querySelector<HTMLElement>("span")!;
    if (finished) {
      startButton.disabled = true;
      label.textContent = "두 환경 비교 완료";
    } else if (!selected) {
      startButton.disabled = true;
      label.textContent = "환경을 먼저 선택하세요";
    } else if (completed.has(selected)) {
      startButton.disabled = true;
      label.textContent = "이 환경의 실험을 완료했어요";
    } else if (running) {
      startButton.disabled = true;
      label.textContent = "먹이 경쟁 중";
    } else {
      startButton.disabled = false;
      label.textContent = "먹이 경쟁 시작";
    }
  }

  function runCompetition(): void {
    if (!selected || running || finished || completed.has(selected)) return;
    const environment = selected;
    const info = ENVIRONMENTS[environment];
    running = true;
    stage.dataset.environment = environment;
    stage.dataset.phase = "running";
    stage.classList.remove("fs-resolved");
    stage.classList.add("fs-running");
    stageState.textContent = "먹이 경쟁 중";
    helper.innerHTML = `<b>${info.short}</b>을 향해 모든 새가 출발했어요. 어느 부리형이 먹이를 얻는지 지켜보세요.`;
    syncControls();
    haptic(HAPTIC.select);

    later(() => {
      stage.dataset.phase = "resolved";
      stage.classList.remove("fs-running");
      stage.classList.add("fs-resolved");
      showOutcome(environment, false);
      helper.innerHTML = `<b>${info.result}</b> 다른 두 부리형은 먹이를 얻지 못했어요.`;
      haptic(HAPTIC.correct);
    }, 650);

    later(() => {
      population.querySelectorAll<HTMLElement>(".fs-bird.fs-fails").forEach((bird) => bird.classList.add("fs-dimmed"));
    }, 1120);

    later(() => {
      completed.add(environment);
      running = false;
      markGoal(environment, BEAKS[info.winner].short);
      if (completed.size === 2) {
        finishComparison();
      } else {
        stageState.textContent = `${info.name} 완료`;
        helper.innerHTML = `${info.result} 이제 <b>다른 섬에는 세 부리형 비율이 같은 별도 초기 집단</b>을 놓아 결과를 비교하세요.`;
        syncControls();
      }
    }, 1480);
  }

  function showOutcome(environment: Environment, immediate: boolean): void {
    const winner = ENVIRONMENTS[environment].winner;
    population.querySelectorAll<HTMLElement>(".fs-bird").forEach((bird) => {
      const survives = bird.dataset.beak === winner;
      bird.classList.toggle("fs-survives", survives);
      bird.classList.toggle("fs-fails", !survives);
      bird.classList.toggle("fs-dimmed", immediate && !survives);
      const status = bird.querySelector<HTMLElement>(".fs-bird-status");
      if (status) status.textContent = survives ? "먹이 획득" : "먹이 실패";
      bird.setAttribute(
        "aria-label",
        `${BEAKS[bird.dataset.beak as BeakType].label} 새, ${survives ? "먹이를 얻어 생존" : "먹이를 얻지 못함"}`,
      );
    });
  }

  function finishComparison(): void {
    if (finished) return;
    finished = true;
    markGoal("compare", "환경마다 선택됨");
    stage.dataset.phase = "compared";
    stage.classList.remove("fs-running", "fs-resolved");
    stage.classList.add("fs-compared");
    stageState.textContent = "두 실험 비교 완료";
    comparison.hidden = false;
    comparison.replaceChildren(
      comparisonCard("seed", "thick"),
      comparisonCard("insect", "thin"),
      el(
        "div",
        { class: "fs-compare-rule" },
        el("b", { text: "환경이 달라지면 살아남는 변이가 달라져요" }),
        el("span", { text: "두 초기 집단 모두 처음부터 세 부리형이 같은 비율로 있었고, 각 환경의 먹이에 알맞은 부리형이 살아남았어요." }),
      ),
    );
    helper.innerHTML =
      "비교 완료! 세 부리형 비율이 같은 두 초기 집단을 각 섬에 놓았을 때 <b>씨앗 섬에서는 굵고 짧은 부리</b>, <b>곤충 섬에서는 가늘고 긴 부리</b>가 선택됐어요.";
    api.recordQuiz(true);
    syncControls();
    later(() => {
      api.openSheet({
        good: true,
        title: s.completionTitle ?? "환경에 따라 살아남는 부리 변이가 달라요",
        html:
          s.explainGood ??
          "처음 집단에는 <b>굵고 짧은 부리·중간 부리·가늘고 긴 부리</b>가 모두 있었어요. 씨앗 섬과 곤충 섬에서 먹이를 얻기 알맞은 부리형이 각각 살아남았어요. 이런 선택이 여러 세대 반복되면 환경마다 생물 무리의 특징이 달라질 수 있어요.",
        onContinue: api.next,
      });
    }, 700);
  }

  function comparisonCard(environment: Environment, winner: BeakType): HTMLElement {
    const info = ENVIRONMENTS[environment];
    return el(
      "div",
      { class: `fs-compare-card ${environment}` },
      el("span", { class: "fs-compare-env", text: info.name }),
      el("span", { class: "fs-compare-food", text: info.short }),
      el("span", { class: "fs-compare-bird", html: birdArt(winner, environment === "seed" ? 4 : 5) }),
      el("b", { text: `${BEAKS[winner].label} 생존` }),
    );
  }

  return () => {
    disposed = true;
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    cleanups.forEach((cleanup) => cleanup());
  };
};

function birdArt(type: BeakType, index: number): string {
  const id = `fs-${type}-${index}`;
  const beak =
    type === "thick"
      ? '<path d="M60 19L82 25L61 32Z" fill="#F5B642" stroke="#A96514" stroke-width="1.4"/>'
      : type === "medium"
        ? '<path d="M60 21L84 25L61 29Z" fill="#F5B642" stroke="#A96514" stroke-width="1.3"/>'
        : '<path d="M60 23L88 25L61 27Z" fill="#F5B642" stroke="#A96514" stroke-width="1.2"/>';
  return `<svg viewBox="0 0 92 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="${id}-body" cx="35%" cy="28%" r="78%"><stop offset="0" stop-color="#76DDB4"/><stop offset=".6" stop-color="#3DB98B"/><stop offset="1" stop-color="#198266"/></radialGradient>
      <radialGradient id="${id}-wing" cx="35%" cy="28%" r="78%"><stop offset="0" stop-color="#A6E7CB"/><stop offset="1" stop-color="#2C9874"/></radialGradient>
    </defs>
    <ellipse cx="43" cy="57" rx="29" ry="4" fill="#06131E" opacity=".18"/>
    <ellipse cx="36" cy="39" rx="25" ry="16" fill="url(#${id}-body)" stroke="#12694F" stroke-width="1.5"/>
    <ellipse cx="29" cy="40" rx="13" ry="9" transform="rotate(-12 29 40)" fill="url(#${id}-wing)" stroke="#238565" stroke-width="1"/>
    <circle cx="56" cy="25" r="13" fill="url(#${id}-body)" stroke="#12694F" stroke-width="1.5"/>
    ${beak}
    <circle cx="59" cy="22" r="2.2" fill="#13272D"/><circle cx="58.4" cy="21.4" r=".7" fill="#fff"/>
    <path d="M17 37L7 31L12 43Z" fill="#277E65" stroke="#12694F" stroke-width="1"/>
    <path d="M29 54L27 60M45 54L47 60" stroke="#765126" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}

function overviewArt(): string {
  return `<svg viewBox="0 0 360 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="큰 딱딱한 씨앗이 있는 씨앗 섬과 나무껍질 틈에 곤충이 숨은 곤충 섬">
    <defs><linearGradient id="fs-over-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDF2F4"/><stop offset="1" stop-color="#B9DBCF"/></linearGradient></defs>
    <rect width="360" height="150" fill="url(#fs-over-sky)"/>
    <path d="M0 104Q88 75 178 104V150H0Z" fill="#C89B58"/><path d="M182 96Q272 67 360 96V150H182Z" fill="#446E4E"/>
    <path d="M29 116q18-26 36 0zM80 121q20-29 40 0zM132 114q16-23 32 0z" fill="#79532B" stroke="#4E351E" stroke-width="2"/>
    <path d="M242 150V51h72v99" fill="#855E3D" stroke="#513821" stroke-width="3"/><path d="M259 61l-7 31 10 19-8 27M294 55l8 26-9 24 11 34" fill="none" stroke="#402C1D" stroke-width="5"/>
    <g fill="#E4A52B" stroke="#603F1B" stroke-width="1.3"><ellipse cx="259" cy="93" rx="5" ry="3"/><ellipse cx="296" cy="106" rx="5" ry="3"/></g>
    <g font-family="Pretendard, sans-serif" font-size="13" font-weight="850" text-anchor="middle"><text x="90" y="27" fill="#553A22">씨앗 섬</text><text x="274" y="27" fill="#294831">곤충 섬</text></g>
  </svg>`;
}

function environmentArt(environment: Environment): string {
  if (environment === "seed") {
    return `<svg viewBox="0 0 360 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="두꺼운 껍질의 큰 딱딱한 씨앗이 널린 씨앗 섬">
      <defs><linearGradient id="fs-seed-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4DFC1"/><stop offset="1" stop-color="#D6AE73"/></linearGradient><radialGradient id="fs-seed-shell" cx="35%" cy="28%" r="78%"><stop offset="0" stop-color="#B9864B"/><stop offset="1" stop-color="#5B3B20"/></radialGradient></defs>
      <rect width="360" height="150" fill="url(#fs-seed-sky)"/><path d="M0 98Q85 73 170 100T360 94V150H0Z" fill="#B8864D"/>
      <g class="fs-food-token" fill="url(#fs-seed-shell)" stroke="#452D1B" stroke-width="2"><ellipse cx="75" cy="101" rx="26" ry="19" transform="rotate(-14 75 101)"/><ellipse cx="164" cy="110" rx="29" ry="21" transform="rotate(10 164 110)"/><ellipse cx="264" cy="98" rx="27" ry="20" transform="rotate(-8 264 98)"/></g>
      <g fill="none" stroke="#E6BE7A" stroke-width="2.4"><path d="M68 86q9 13 2 28"/><path d="M157 92q12 12 3 31"/><path d="M257 82q12 13 4 30"/></g>
      <rect x="92" y="17" width="176" height="31" rx="15.5" fill="#FFF8EC" opacity=".94"/><text x="180" y="38" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="14" font-weight="850" fill="#67431F">큰 딱딱한 씨앗</text>
      <g class="fs-evidence fs-seed-evidence" aria-hidden="true">
        <ellipse cx="181" cy="99" rx="151" ry="45" fill="#FFF4D8" opacity=".94"/>
        <text class="fs-evidence-caption" x="105" y="65">굵고 짧은 부리</text>
        <text class="fs-evidence-caption fs-evidence-result" x="260" y="65">껍질이 갈라짐</text>
        <g class="fs-evidence-bird fs-seed-bird">
          <circle cx="103" cy="97" r="28" fill="#39B987" stroke="#12694F" stroke-width="2"/>
          <path d="M82 111q18 18 39 3" fill="#258A6A" opacity=".78"/>
          <circle cx="112" cy="88" r="3.1" fill="#14272C"/><circle cx="111" cy="87" r="1" fill="#fff"/>
          <path class="fs-seed-beak" d="M124 87L181 99L124 111Z" fill="#F5B642" stroke="#8B5312" stroke-width="2.2" stroke-linejoin="round"/>
        </g>
        <ellipse class="fs-seed-kernel" cx="227" cy="103" rx="14" ry="9" fill="#F4D875" stroke="#9D7426" stroke-width="1.5"/>
        <g class="fs-seed-shell fs-seed-shell-left">
          <path d="M224 77C202 74 188 85 187 101c0 16 15 26 34 21l6-11-7-8 7-10-6-9Z" fill="url(#fs-seed-shell)" stroke="#452D1B" stroke-width="2.3"/>
        </g>
        <g class="fs-seed-shell fs-seed-shell-right">
          <path d="M228 77c22-3 36 9 36 24 0 16-15 26-34 21l-6-11 7-8-7-10 7-9Z" fill="url(#fs-seed-shell)" stroke="#452D1B" stroke-width="2.3"/>
        </g>
        <path class="fs-seed-crack" d="M226 82l-5 11 7 10-7 9 5 8" fill="none" stroke="#FFE7A9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <g class="fs-seed-crumbs" fill="#724821" stroke="#452D1B" stroke-width="1">
          <path d="m205 91-7-5 2 9Z"/><path d="m247 91 8-6-2 10Z"/><circle cx="203" cy="111" r="3"/><circle cx="250" cy="113" r="2.7"/>
        </g>
        <g class="fs-seed-impact" fill="none" stroke="#D27728" stroke-width="2.2" stroke-linecap="round"><path d="m183 83 8-7"/><path d="m186 99 10 0"/><path d="m183 115 8 7"/></g>
      </g>
    </svg>`;
  }
  return `<svg viewBox="0 0 360 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="나무껍질의 깊고 좁은 틈에 작은 곤충이 숨어 있는 곤충 섬">
    <defs><linearGradient id="fs-bug-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDE7D1"/><stop offset="1" stop-color="#759F75"/></linearGradient><linearGradient id="fs-bark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A3B27"/><stop offset=".5" stop-color="#946844"/><stop offset="1" stop-color="#4B321F"/></linearGradient></defs>
    <rect width="360" height="150" fill="url(#fs-bug-sky)"/><path d="M57 150V0h246v150" fill="url(#fs-bark)" stroke="#3C291B" stroke-width="3"/>
    <g fill="none" stroke="#302016" stroke-width="8" stroke-linecap="round"><path d="M108 8q24 30 4 61t10 70"/><path d="M184 0q-19 34 2 62t-8 80"/><path d="M258 7q-21 31-2 58t-8 73"/></g>
    <g class="fs-food-token" fill="#F0B43C" stroke="#5C3A17" stroke-width="1.5"><ellipse cx="113" cy="63" rx="7" ry="4"/><ellipse cx="184" cy="88" rx="7" ry="4"/><ellipse cx="253" cy="52" rx="7" ry="4"/></g>
    <g stroke="#5C3A17" stroke-width="1.3" stroke-linecap="round"><path d="M107 59l-7-5m8 12-7 5m77 12-7-5m8 12-7 5m75-47-7-5m8 12-7 5"/></g>
    <rect x="86" y="16" width="188" height="31" rx="15.5" fill="#F2FAF2" opacity=".94"/><text x="180" y="37" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="14" font-weight="850" fill="#2F5135">나무껍질 틈의 곤충</text>
    <g class="fs-evidence fs-insect-evidence" aria-hidden="true">
      <ellipse cx="179" cy="101" rx="151" ry="44" fill="#EAF6E8" opacity=".94"/>
      <text class="fs-evidence-caption" x="105" y="65">가늘고 긴 부리</text>
      <text class="fs-evidence-caption fs-evidence-result" x="260" y="65">곤충을 꺼냄</text>
      <path d="M209 67q-10 18 1 35t-4 34" fill="none" stroke="#49301F" stroke-width="18" stroke-linecap="round"/>
      <path class="fs-probe-crevice" d="M209 68q-8 18 1 34t-4 32" fill="none" stroke="#251811" stroke-width="7" stroke-linecap="round"/>
      <g class="fs-evidence-bird fs-probe-bird">
        <circle cx="86" cy="101" r="28" fill="#39B987" stroke="#12694F" stroke-width="2"/>
        <path d="M65 114q17 17 39 3" fill="#258A6A" opacity=".78"/>
        <circle cx="95" cy="91" r="3.1" fill="#14272C"/><circle cx="94" cy="90" r="1" fill="#fff"/>
        <path class="fs-probe-beak" d="M107 97L202 102L107 105Z" fill="#F5B642" stroke="#8B5312" stroke-width="1.8" stroke-linejoin="round"/>
      </g>
      <g class="fs-probe-bug" fill="#F0B43C" stroke="#5C3A17" stroke-width="1.5" stroke-linecap="round">
        <ellipse cx="225" cy="103" rx="8" ry="5"/>
        <path d="m220 99-7-5m8 12-8 5m16-12 7-5m-8 12 8 5" fill="none"/>
        <circle cx="230" cy="102" r="1.2" fill="#2A1A10" stroke="none"/>
      </g>
      <path class="fs-probe-trail" d="M222 118q-25 12-48 0" fill="none" stroke="#4C8E5D" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 5"/>
    </g>
  </svg>`;
}
