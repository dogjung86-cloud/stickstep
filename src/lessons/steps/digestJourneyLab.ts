// digestJourneyLab — 영양소별 소화 장소·효소·최종 산물을 따라가는 여정 랩.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface DigestJourneyStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Nutrient = "starch" | "protein" | "fat";
type Organ = "mouth" | "stomach" | "intestine";

const ROUTES: Record<Nutrient, { name: string; route: Organ[]; product: string; notes: Record<Organ, string> }> = {
  starch: {
    name: "녹말", route: ["mouth", "intestine"], product: "포도당",
    notes: { mouth: "침의 아밀레이스가 녹말을 엿당으로 바꿔요.", stomach: "위에서는 녹말을 분해하는 소화효소가 작용하지 않아요.", intestine: "이자액의 아밀레이스가 녹말을 엿당으로 더 분해하고, 작은창자 효소가 엿당을 포도당으로 바꿔요." },
  },
  protein: {
    name: "단백질", route: ["stomach", "intestine"], product: "아미노산",
    notes: { mouth: "입에는 단백질을 분해하는 소화효소가 없어요.", stomach: "위의 펩신이 염산의 도움을 받아 단백질을 분해해요.", intestine: "작은창자에서 트립신 등이 작용해 최종적으로 아미노산이 돼요." },
  },
  fat: {
    name: "지방", route: ["intestine"], product: "지방산 + 모노글리세라이드",
    notes: { mouth: "입에서는 지방 소화가 본격적으로 일어나지 않아요.", stomach: "위의 주된 소화효소인 펩신은 단백질에 작용해요.", intestine: "작은창자에서 쓸개즙이 지방을 잘게 퍼뜨리고 라이페이스가 분해해요." },
  },
};

const STATION_X: Record<Organ, number> = { mouth: 58, stomach: 178, intestine: 302 };

const LAB_SVG = `<svg viewBox="0 0 360 238" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="입과 위, 작은창자 순서로 영양소를 이동시키는 소화 여정"><defs>
<linearGradient id="djl-organ" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-organ-hi)"/><stop offset=".54" stop-color="var(--body-organ)"/><stop offset="1" stop-color="var(--body-organ-lo)"/></linearGradient>
<linearGradient id="djl-int" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-tissue-hi)"/><stop offset=".55" stop-color="var(--body-tissue)"/><stop offset="1" stop-color="var(--body-tissue-lo)"/></linearGradient>
</defs><path d="M58 96 H302" stroke="var(--n600)" stroke-width="7" opacity=".32" stroke-linecap="round"/><path d="M58 96 H302" stroke="var(--n0)" stroke-width="2" stroke-dasharray="7 8" opacity=".48"/>
<g class="djl-station mouth" transform="translate(58 96)"><circle r="36" fill="var(--n0)" stroke="var(--body-airway-lo)" stroke-width="2"/><path d="M-18 -5 Q0 15 19 -5" stroke="var(--body-organ-lo)" stroke-width="4"/><path d="M-13 0 Q0 8 13 0" stroke="var(--body-organ)" stroke-width="3"/><text y="57" text-anchor="middle" font-size="13" font-weight="900" fill="var(--n0)">입</text></g>
<g class="djl-station stomach" transform="translate(178 96)"><circle r="36" fill="var(--n0)" stroke="var(--body-airway-lo)" stroke-width="2"/><path d="M-4 -25 C-9 -12 -5 -4 -13 4 C-22 14 -17 27 -4 29 C12 32 24 19 19 5 C15 -5 7 -1 4 -11 C2 -17 4 -22 5 -27Z" fill="url(#djl-organ)" stroke="var(--body-organ-lo)" stroke-width="1.5"/><text y="57" text-anchor="middle" font-size="13" font-weight="900" fill="var(--n0)">위</text></g>
<g class="djl-station intestine" transform="translate(302 96)"><circle r="36" fill="var(--n0)" stroke="var(--body-airway-lo)" stroke-width="2"/><path d="M-22 -20 C-4 -29 17 -22 18 -10 C20 2 -12 0 -14 11 C-16 22 14 26 21 13" stroke="url(#djl-int)" stroke-width="10" stroke-linecap="round"/><text y="57" text-anchor="middle" font-size="13" font-weight="900" fill="var(--n0)">작은창자</text></g>
<g class="djl-token" transform="translate(26 36)"><path d="M0 -13 L12 -6 L12 7 L0 14 L-12 7 L-12 -6Z" fill="var(--body-nutrient)" stroke="var(--body-cell-lo)" stroke-width="1.6"/><text y="4" text-anchor="middle" font-size="9" font-weight="900" fill="var(--n0)">출발</text></g>
<g class="djl-product" opacity="0"><rect x="90" y="180" width="180" height="40" rx="20" fill="var(--subj-body-tint)" stroke="var(--subj-body)"/><text x="180" y="205" text-anchor="middle" font-size="13" font-weight="900" fill="var(--subj-body-press)">최종 산물</text></g></svg>`;

export const digestJourneyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DigestJourneyStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));
  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    ...(["starch", "protein", "fat"] as Nutrient[]).map((id) => el("div", { class: "pn-badge body", dataset: { g: id } }, el("b", { text: ROUTES[id].name }), el("span", { text: "여정 완주" }))),
  );
  const helper = el("div", { class: "helper", html: "영양소를 고르고, 그 영양소의 소화가 일어나는 <b>다음 기관</b>을 차례로 눌러 보세요." });
  const art = el("div", { class: "body-lab-art djl-art", html: LAB_SVG });
  const toast = el("div", { class: "toast" });
  const stage = el("div", { class: "stage body-lab-stage" }, art, toast);
  const tabs = el("div", { class: "djl-tabs" });
  (["starch", "protein", "fat"] as Nutrient[]).forEach((id) => tabs.appendChild(el("button", { class: "body-lab-btn", dataset: { nutrient: id }, attrs: { type: "button" }, text: ROUTES[id].name })));
  const organs = el("div", { class: "body-lab-controls djl-organs" });
  const organLabels: Record<Organ, string> = { mouth: "입", stomach: "위", intestine: "작은창자" };
  (Object.keys(organLabels) as Organ[]).forEach((id) => organs.appendChild(el("button", { class: "body-lab-btn", dataset: { organ: id }, attrs: { type: "button" }, text: organLabels[id] })));
  const result = el("div", { class: "djl-result", text: "영양소를 골라 출발하세요" });
  host.append(goalsEl, helper, stage, tabs, organs, result);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let current: Nutrient | null = null;
  let routeIndex = 0;
  const goals = new Set<Nutrient>();
  const cleanups: (() => void)[] = [];
  let toastTimer = 0;
  let finished = false;
  const token = art.querySelector(".djl-token") as SVGGElement;
  const product = art.querySelector(".djl-product") as SVGGElement;

  const showToast = (message: string): void => {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1650);
  };
  const updateToken = (x: number): void => { token.style.transform = `translate(${x}px, 36px)`; };
  const select = (id: Nutrient): void => {
    current = id;
    routeIndex = 0;
    product.style.opacity = "0";
    updateToken(26);
    tabs.querySelectorAll("button").forEach((b) => b.classList.toggle("done", (b as HTMLElement).dataset.nutrient === id));
    result.textContent = `${ROUTES[id].name}: 첫 소화 장소를 고르세요`;
    haptic(HAPTIC.select);
  };
  const collect = (id: Nutrient): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = ROUTES[id].product;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML = "여정 완료! 소화효소는 <b>특정 영양소에만</b> 작용하며, 최종 산물은 녹말→포도당, 단백질→아미노산, 지방→지방산과 모노글리세라이드예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "순환계로 이동하기");
    }
  };
  const visit = (organ: Organ): void => {
    if (!current) { showToast("먼저 영양소를 골라 주세요"); return; }
    const spec = ROUTES[current];
    const expected = spec.route[routeIndex];
    if (organ !== expected) {
      haptic(HAPTIC.wrong);
      showToast(spec.notes[organ]);
      return;
    }
    haptic(HAPTIC.select);
    updateToken(STATION_X[organ]);
    art.querySelectorAll(".djl-station").forEach((node) => node.classList.remove("active"));
    art.querySelector(`.djl-station.${organ}`)?.classList.add("active");
    result.textContent = spec.notes[organ];
    routeIndex += 1;
    if (routeIndex === spec.route.length) {
      product.style.opacity = "1";
      (product.querySelector("text") as SVGTextElement).textContent = `${spec.name} → ${spec.product}`;
      collect(current);
    }
  };
  tabs.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    const handler = (): void => select(button.dataset.nutrient as Nutrient);
    button.addEventListener("click", handler);
    cleanups.push(() => button.removeEventListener("click", handler));
  });
  organs.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    const handler = (): void => visit(button.dataset.organ as Organ);
    button.addEventListener("click", handler);
    cleanups.push(() => button.removeEventListener("click", handler));
  });
  api.setCTA("세 영양소의 여정을 완주해 보세요", { enabled: false });
  return () => { window.clearTimeout(toastTimer); cleanups.forEach((cleanup) => cleanup()); };
};
