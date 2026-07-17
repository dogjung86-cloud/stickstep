// bodyIntegrateLab — 소화·순환·호흡·배설계를 조직세포와 연결하는 통합 랩.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface BodyIntegrateStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Mission = "nutrient" | "oxygen" | "waste";

const MISSIONS: Record<Mission, { name: string; question: string; options: [string, string, string]; good: string; bad: string }> = {
  nutrient: {
    name: "영양소 전달",
    question: "음식 속 영양소가 조직세포에 도착하는 길은?",
    options: ["소화계 → 순환계 → 조직세포", "호흡계 → 배설계 → 조직세포", "조직세포 → 소화계 → 순환계"],
    good: "소화계에서 흡수한 영양소를 순환계가 온몸의 조직세포로 운반해요.",
    bad: "영양소는 소화계에서 흡수된 뒤 혈액을 따라 조직세포로 이동해요.",
  },
  oxygen: {
    name: "산소 전달",
    question: "들어온 산소가 조직세포에 도착하는 길은?",
    options: ["호흡계 → 순환계 → 조직세포", "소화계 → 배설계 → 조직세포", "조직세포 → 호흡계 → 순환계"],
    good: "호흡계에서 혈액으로 들어간 산소를 순환계가 조직세포로 운반해요.",
    bad: "산소는 호흡계에서 흡수되고, 순환계가 조직세포까지 운반해요.",
  },
  waste: {
    name: "노폐물 배출",
    question: "조직세포에서 생긴 노폐물이 몸 밖으로 나가는 길은?",
    options: ["조직세포 → 순환계 → 호흡계·배설계", "소화계 → 조직세포 → 호흡계", "배설계 → 순환계 → 조직세포"],
    good: "순환계가 이산화 탄소는 호흡계로, 요소 같은 노폐물은 배설계로 운반해요.",
    bad: "노폐물은 조직세포에서 생기며, 혈액이 호흡계와 배설계까지 운반해요.",
  },
};

const LAB_SVG = `<svg viewBox="0 0 360 292" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="소화계, 호흡계, 순환계, 배설계와 조직세포가 물질을 주고받는 모습"><defs><marker id="bil-n" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L9 5L1 9Z" fill="var(--body-nutrient)"/></marker><marker id="bil-o" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L9 5L1 9Z" fill="var(--body-oxygen)"/></marker><marker id="bil-w" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L9 5L1 9Z" fill="var(--body-carbon)"/></marker></defs>
<ellipse cx="180" cy="277" rx="145" ry="10" fill="var(--body-shadow)" opacity=".13"/>
<g class="bil-organ"><rect x="17" y="25" width="92" height="69" rx="22" fill="var(--body-tissue-hi)" stroke="var(--body-tissue-lo)" stroke-width="2"/><path d="M44 45c23-17 50-5 45 18-4 18-32 22-51 7-12-9-5-18 6-25Z" fill="var(--body-organ)"/><text x="63" y="84" text-anchor="middle">소화계</text></g>
<g class="bil-organ"><rect x="251" y="25" width="92" height="69" rx="22" fill="var(--body-airway-hi)" stroke="var(--body-airway-lo)" stroke-width="2"/><path d="M296 39v17m-3 0c-17-13-29 1-25 19 4 17 19 11 25-2m6-17c17-13 29 1 25 19-4 17-19 11-25-2" stroke="var(--body-airway)" stroke-width="6" stroke-linecap="round"/><text x="297" y="84" text-anchor="middle">호흡계</text></g>
<g class="bil-organ"><rect x="17" y="193" width="92" height="69" rx="22" fill="var(--body-kidney-hi)" stroke="var(--body-kidney-lo)" stroke-width="2"/><path d="M47 211c-15 1-17 31-1 34 12 2 14-11 13-19-1-10-3-16-12-15Zm32 0c15 1 17 31 1 34-12 2-14-11-13-19 1-10 3-16 12-15Z" fill="var(--body-kidney)"/><text x="63" y="252" text-anchor="middle">배설계</text></g>
<g class="bil-organ"><rect x="251" y="193" width="92" height="69" rx="22" fill="var(--body-cell-hi)" stroke="var(--body-cell-lo)" stroke-width="2"/><circle cx="297" cy="221" r="22" fill="var(--body-cell)"/><circle cx="303" cy="217" r="7" fill="var(--body-cell-lo)"/><text x="297" y="252" text-anchor="middle">조직세포</text></g>
<g class="bil-heart"><path d="M180 109c-16-22-47-10-42 15 4 22 42 46 42 46s38-24 42-46c5-25-26-37-42-15Z" fill="var(--body-oxygenated)" stroke="var(--body-organ-lo)" stroke-width="3"/><path d="M180 111v55M146 128h68" stroke="var(--body-organ-hi)" stroke-width="2"/><text x="180" y="189" text-anchor="middle">순환계</text></g>
<g class="bil-route bil-nutrient" opacity="0"><path d="M104 81C133 99 144 107 153 116" stroke="var(--body-nutrient)" stroke-width="5" stroke-linecap="round" marker-end="url(#bil-n)"/><path d="M202 151C233 165 255 185 271 205" stroke="var(--body-nutrient)" stroke-width="5" stroke-linecap="round" marker-end="url(#bil-n)"/></g>
<g class="bil-route bil-oxygen" opacity="0"><path d="M257 82C228 99 216 108 207 118" stroke="var(--body-oxygen)" stroke-width="5" stroke-linecap="round" marker-end="url(#bil-o)"/><path d="M202 143C237 153 264 178 281 202" stroke="var(--body-oxygen)" stroke-width="5" stroke-linecap="round" marker-end="url(#bil-o)"/></g>
<g class="bil-route bil-waste" opacity="0"><path d="M276 215C247 193 222 174 202 159" stroke="var(--body-carbon)" stroke-width="5" stroke-linecap="round" marker-end="url(#bil-w)"/><path d="M158 157C127 177 101 199 88 215" stroke="var(--body-urea)" stroke-width="5" stroke-linecap="round" marker-end="url(#bil-w)"/><path d="M193 112C219 92 240 78 258 68" stroke="var(--body-carbon)" stroke-width="5" stroke-linecap="round" marker-end="url(#bil-w)"/></g>
<g font-family="inherit" font-size="11.5" font-weight="850" fill="var(--n0)"><style>.bil-organ text,.bil-heart text{fill:var(--n800)}</style></g></svg>`;

export const bodyIntegrateLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BodyIntegrateStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));
  const ids: Mission[] = ["nutrient", "oxygen", "waste"];
  const goalsEl = el("div", { class: "pn-badges force3" }, ...ids.map((id) => el("div", { class: "pn-badge body", dataset: { g: id } }, el("b", { text: MISSIONS[id].name }), el("span", { text: "경로 연결" }))));
  const helper = el("div", { class: "helper", html: "물질을 하나씩 고른 뒤, 여러 기관계와 조직세포를 잇는 <b>올바른 이동 경로</b>를 찾아보세요." });
  const art = el("div", { class: "body-lab-art bil-art", html: LAB_SVG });
  const toast = el("div", { class: "toast" });
  const stage = el("div", { class: "stage body-lab-stage" }, art, toast);
  const tabs = el("div", { class: "djl-tabs bil-tabs" }, ...ids.map((id) => el("button", { class: "body-lab-btn", dataset: { mission: id }, attrs: { type: "button" }, text: MISSIONS[id].name })));
  const question = el("div", { class: "djl-result bil-question", text: "연결할 물질을 먼저 골라 주세요" });
  const answers = el("div", { class: "body-lab-controls bil-answers" });
  host.append(goalsEl, helper, stage, tabs, question, answers);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const goals = new Set<Mission>();
  const cleanups: (() => void)[] = [];
  let toastTimer = 0;
  let finished = false;
  const showToast = (message: string): void => {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1650);
  };
  const collect = (id: Mission): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const badge = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    badge.classList.add("on");
    badge.querySelector("span")!.textContent = "연결 완료";
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === ids.length && !finished) {
      finished = true;
      helper.innerHTML = "통합 연결 완료! <b>순환계는 영양소와 산소를 조직세포에 전달하고, 세포에서 생긴 노폐물을 호흡계와 배설계로 운반</b>해 기관계를 하나의 흐름으로 이어 줘요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "대단원 정리하기");
    }
  };
  const renderAnswers = (id: Mission): void => {
    answers.replaceChildren();
    const mission = MISSIONS[id];
    mission.options.forEach((label, index) => {
      const button = el("button", { class: "body-lab-btn", attrs: { type: "button" }, text: label }) as HTMLButtonElement;
      const handler = (): void => {
        if (index !== 0) {
          haptic(HAPTIC.wrong);
          button.classList.add("no");
          showToast(mission.bad);
          return;
        }
        haptic(HAPTIC.select);
        answers.querySelectorAll<HTMLButtonElement>("button").forEach((item) => { item.disabled = true; });
        button.classList.add("done");
        art.classList.add(`show-${id}`);
        question.textContent = mission.good;
        collect(id);
        showToast(`${mission.name} 경로를 연결했어요`);
      };
      button.addEventListener("click", handler);
      cleanups.push(() => button.removeEventListener("click", handler));
      answers.appendChild(button);
    });
  };
  tabs.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    const handler = (): void => {
      const id = button.dataset.mission as Mission;
      tabs.querySelectorAll("button").forEach((item) => item.classList.toggle("done", item === button));
      question.textContent = MISSIONS[id].question;
      renderAnswers(id);
      haptic(HAPTIC.select);
    };
    button.addEventListener("click", handler);
    cleanups.push(() => button.removeEventListener("click", handler));
  });
  api.setCTA("세 가지 물질 이동을 모두 연결해 보세요", { enabled: false });
  return () => {
    window.clearTimeout(toastTimer);
    cleanups.forEach((cleanup) => cleanup());
    answers.replaceChildren();
  };
};
