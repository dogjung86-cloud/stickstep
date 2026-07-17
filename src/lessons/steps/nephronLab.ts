// nephronLab — 여과·재흡수·분비의 이동 방향과 물질을 판정하는 콩팥단위 랩.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface NephronStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Phase = "filter" | "reabsorb" | "secrete";

const PHASES: Record<Phase, { name: string; q: string; options: [string, string]; good: string; bad: string }> = {
  filter: { name: "여과", q: "토리에서 보먼주머니로 여과되는 물질 묶음은?", options: ["물·포도당·무기염류·요소", "혈구·단백질"], good: "작은 물질은 통과하고 혈구와 단백질은 혈액에 남아요.", bad: "혈구와 단백질은 크기가 커서 여과막을 통과하지 못해요." },
  reabsorb: { name: "재흡수", q: "세뇨관에서 모세혈관으로 되돌아가는 물질은?", options: ["포도당·아미노산 전부와 대부분의 물", "단백질과 적혈구 전부"], good: "몸에 필요한 영양소와 물은 혈액으로 되돌아가요.", bad: "단백질과 적혈구는 애초에 여과되지 않아요. 재흡수의 대표는 포도당과 아미노산이에요." },
  secrete: { name: "분비", q: "모세혈관에서 세뇨관으로 더 보내는 것은?", options: ["미처 여과되지 않고 혈액에 남은 노폐물", "재흡수된 포도당 전부"], good: "혈액에 남은 노폐물을 세뇨관으로 더 내보내요.", bad: "포도당은 몸에 필요한 영양소라 정상 상태에서는 전부 재흡수해요." },
};

const LAB_SVG = `<svg viewBox="0 0 360 264" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="토리와 보먼주머니, 세뇨관, 모세혈관에서 물질이 이동하는 콩팥단위"><defs><linearGradient id="nl-kidney" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-kidney-hi)"/><stop offset=".55" stop-color="var(--body-kidney)"/><stop offset="1" stop-color="var(--body-kidney-lo)"/></linearGradient><marker id="nl-f-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L9 5L1 9Z" fill="var(--body-nutrient)"/></marker><marker id="nl-r-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L9 5L1 9Z" fill="var(--body-oxygen)"/></marker><marker id="nl-s-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L9 5L1 9Z" fill="var(--body-carbon)"/></marker></defs>
<ellipse cx="180" cy="248" rx="140" ry="10" fill="var(--body-shadow)" opacity=".13"/><circle cx="79" cy="82" r="48" fill="url(#nl-kidney)" stroke="var(--body-kidney-lo)" stroke-width="2"/><path d="M46 86 C50 47 88 112 118 61 C130 42 137 83 110 102 C80 124 55 106 46 86" stroke="var(--body-oxygenated)" stroke-width="7" stroke-linecap="round"/>
<path d="M121 64 C151 51 169 73 152 97 C134 123 193 117 178 151 C166 180 224 167 229 224" stroke="var(--body-urea)" stroke-width="14" stroke-linecap="round"/><path d="M117 48 C179 21 265 40 282 91 C299 144 257 190 217 190" stroke="var(--body-deoxygenated)" stroke-width="8" stroke-linecap="round"/>
<g class="nl-filter" opacity="0"><path d="M105 89 C123 97 134 104 143 117" stroke="var(--body-nutrient)" stroke-width="4" marker-end="url(#nl-f-a)"/><g fill="var(--body-nutrient)" stroke="var(--body-cell-lo)" stroke-width="1"><circle cx="112" cy="92" r="4"/><circle cx="124" cy="101" r="4"/><circle cx="136" cy="110" r="4"/></g></g>
<g class="nl-reabsorb" opacity="0"><path d="M175 130 C199 108 231 99 270 98" stroke="var(--body-oxygen)" stroke-width="4" marker-end="url(#nl-r-a)"/><path d="M191 166 C214 145 239 137 271 138" stroke="var(--body-oxygen)" stroke-width="4" marker-end="url(#nl-r-a)"/></g>
<g class="nl-secrete" opacity="0"><path d="M272 153 C245 157 219 167 189 184" stroke="var(--body-carbon)" stroke-width="4" marker-end="url(#nl-s-a)"/><g fill="var(--body-urea)" stroke="var(--body-cell-lo)" stroke-width="1"><path d="M254 150l5 5-5 5-5-5Z"/><path d="M226 163l5 5-5 5-5-5Z"/></g></g>
<g font-size="11.5" font-weight="850" fill="var(--n0)"><text x="30" y="29">토리·보먼주머니</text><text x="137" y="231">세뇨관</text><text x="267" y="48">모세혈관</text></g><g class="nl-phase-label" opacity="0"><rect x="246" y="207" width="93" height="28" rx="14" fill="var(--n0)"/><text x="292" y="226" text-anchor="middle" font-size="12" font-weight="900" fill="var(--subj-body-press)">단계를 고르세요</text></g></svg>`;

export const nephronLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as NephronStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));
  const goalsEl = el("div", { class: "pn-badges force3" }, ...(["filter", "reabsorb", "secrete"] as Phase[]).map((id) => el("div", { class: "pn-badge body", dataset: { g: id } }, el("b", { text: PHASES[id].name }), el("span", { text: "이동 찾기" }))));
  const helper = el("div", { class: "helper", html: "오줌이 만들어지는 세 단계를 고르고, 각 단계에서 <b>어떤 물질이 어느 쪽으로</b> 움직이는지 판정하세요." });
  const art = el("div", { class: "body-lab-art nl-art", html: LAB_SVG });
  const toast = el("div", { class: "toast" });
  const stage = el("div", { class: "stage body-lab-stage" }, art, toast);
  const tabs = el("div", { class: "djl-tabs nl-tabs" });
  (["filter", "reabsorb", "secrete"] as Phase[]).forEach((id) => tabs.appendChild(el("button", { class: "body-lab-btn", dataset: { phase: id }, attrs: { type: "button" }, text: PHASES[id].name })));
  const question = el("div", { class: "djl-result nl-question", text: "단계를 먼저 골라 주세요" });
  const answers = el("div", { class: "body-lab-controls nl-answers" });
  host.append(goalsEl, helper, stage, tabs, question, answers);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let current: Phase | null = null;
  const goals = new Set<Phase>();
  const cleanups: (() => void)[] = [];
  let toastTimer = 0;
  let finished = false;
  const showToast = (message: string): void => {
    toast.textContent = message; toast.classList.add("show"); window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1650);
  };
  const collect = (id: Phase): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on"); chip.querySelector("span")!.textContent = "방향 확인"; haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML = "세 단계 완료! 정상 오줌에 <b>단백질은 여과되지 않아 없고, 포도당은 전부 재흡수되어 없어요</b>. 요소와 남은 물, 무기염류 등이 오줌으로 나가요.";
      api.recordQuiz(true); api.enableCTA(s.cta ?? "기관계 연결하기");
    }
  };
  const renderAnswers = (phase: Phase): void => {
    answers.replaceChildren();
    const spec = PHASES[phase];
    spec.options.forEach((text, index) => {
      const button = el("button", { class: "body-lab-btn", attrs: { type: "button" }, text }) as HTMLButtonElement;
      const handler = (): void => {
        if (index !== 0) { haptic(HAPTIC.wrong); showToast(spec.bad); button.classList.add("no"); return; }
        haptic(HAPTIC.select); button.classList.add("done"); answers.querySelectorAll("button").forEach((b) => ((b as HTMLButtonElement).disabled = true));
        question.textContent = spec.good; art.classList.add(`show-${phase}`); collect(phase); showToast(`${spec.name}의 이동을 확인했어요`);
      };
      button.addEventListener("click", handler); cleanups.push(() => button.removeEventListener("click", handler)); answers.appendChild(button);
    });
  };
  tabs.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    const handler = (): void => {
      current = button.dataset.phase as Phase;
      tabs.querySelectorAll("button").forEach((b) => b.classList.toggle("done", b === button));
      question.textContent = PHASES[current].q; renderAnswers(current); haptic(HAPTIC.select);
    };
    button.addEventListener("click", handler); cleanups.push(() => button.removeEventListener("click", handler));
  });
  void current;
  api.setCTA("여과·재흡수·분비를 모두 해결해 보세요", { enabled: false });
  return () => { window.clearTimeout(toastTimer); cleanups.forEach((cleanup) => cleanup()); answers.replaceChildren(); };
};
