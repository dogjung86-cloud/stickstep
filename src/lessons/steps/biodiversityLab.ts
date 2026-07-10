// biodiversityLab — 생물다양성을 세 개의 관찰 렌즈로 직접 비교하는 중1 II단원 랩.
// 생태계 세 곳 비교 → 한 생태계의 생물 종류 찾기 → 같은 종류의 개체 둘 비교.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { icon } from "../../core/icons";
import type { StepRenderer } from "../types";
import "../../styles/bio-unit.css";

interface BiodiversityStep {
  title: string;
  lead?: string;
  cta?: string;
}

type Lens = "ecosystem" | "species" | "variation";
type Ecosystem = "forest" | "wetland" | "coast";

interface LensInfo {
  id: Lens;
  label: string;
  short: string;
  icon: string;
}

interface EcosystemInfo {
  id: Ecosystem;
  name: string;
  icon: string;
  clue: string;
  summary: string;
}

interface SpeciesInfo {
  name: string;
  icon: string;
  x: number;
  y: number;
}

const LENSES: LensInfo[] = [
  { id: "ecosystem", label: "생태계 렌즈", short: "생태계", icon: "globe" },
  { id: "species", label: "생물 종류 렌즈", short: "생물 종류", icon: "leaf" },
  { id: "variation", label: "개체 차이 렌즈", short: "개체 차이", icon: "dna" },
];

const ECOSYSTEMS: EcosystemInfo[] = [
  {
    id: "forest",
    name: "숲",
    icon: "tree",
    clue: "그늘지고 흙이 촉촉해요",
    summary: "나무가 층을 이루고, 그 아래에 버섯과 고사리가 살아요.",
  },
  {
    id: "wetland",
    name: "습지",
    icon: "drop",
    clue: "땅에 물이 오래 머물러요",
    summary: "얕은 물과 갈대 사이에서 물풀, 개구리, 잠자리가 살아요.",
  },
  {
    id: "coast",
    name: "바닷가",
    icon: "wave",
    clue: "짠물과 파도가 드나들어요",
    summary: "모래와 바위, 바닷물이 만나 게, 조개, 해조류가 살아요.",
  },
];

const SPECIES: SpeciesInfo[] = [
  { name: "참나무", icon: "tree", x: 19, y: 28 },
  { name: "고사리", icon: "leaf", x: 29, y: 73 },
  { name: "버섯", icon: "mushroom", x: 69, y: 72 },
  { name: "다람쥐", icon: "paw", x: 78, y: 37 },
  { name: "박새", icon: "note", x: 50, y: 22 },
];

const ecosystemArt = (kind: Ecosystem): string => {
  const prefix = `bd-${kind}`;
  const shared = `<defs>
    <linearGradient id="${prefix}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--bd-sky-hi)"/><stop offset="1" stop-color="var(--bd-sky-lo)"/>
    </linearGradient>
    <linearGradient id="${prefix}-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--bd-ground-hi)"/><stop offset="1" stop-color="var(--bd-ground-lo)"/>
    </linearGradient>
    <radialGradient id="${prefix}-light" cx="32%" cy="18%" r="65%">
      <stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

  if (kind === "forest") {
    return `<svg class="bd-eco-art" viewBox="0 0 320 188" role="img" aria-label="나무와 고사리, 버섯이 있는 숲 생태계">
      ${shared}<rect width="320" height="188" rx="18" fill="url(#${prefix}-sky)"/>
      <path d="M0 118Q54 91 111 112T224 103T320 108V188H0Z" fill="url(#${prefix}-ground)"/>
      <ellipse cx="88" cy="161" rx="42" ry="8" fill="#243D35" opacity=".18"/><ellipse cx="240" cy="163" rx="48" ry="8" fill="#243D35" opacity=".16"/>
      <g stroke="var(--bd-trunk-edge)" stroke-width="2">
        <path d="M72 150L82 62h27l8 88z" fill="var(--bd-trunk)"/><path d="M213 151l8-104h30l10 104z" fill="var(--bd-trunk)"/>
      </g>
      <g fill="var(--bd-leaf)" stroke="var(--bd-leaf-edge)" stroke-width="1.5">
        <circle cx="73" cy="62" r="34"/><circle cx="104" cy="51" r="39"/><circle cx="126" cy="72" r="31"/>
        <circle cx="213" cy="46" r="37"/><circle cx="250" cy="42" r="42"/><circle cx="274" cy="69" r="34"/>
      </g>
      <g fill="none" stroke="var(--bd-fern)" stroke-width="4" stroke-linecap="round"><path d="M36 161q16-34 34-5M41 151l-13-6m20-4-13-9m20 5 12-12"/><path d="M157 167q12-34 31-8m-25-4-12-8m20 1 12-12"/></g>
      <g transform="translate(270 145)"><path d="M0 19h18l-3-17H4z" fill="#F5E3CA"/><path d="M-7 4q16-18 32 0z" fill="#E87955" stroke="#9E4937" stroke-width="1.5"/></g>
      <rect width="320" height="188" rx="18" fill="url(#${prefix}-light)"/>
    </svg>`;
  }

  if (kind === "wetland") {
    return `<svg class="bd-eco-art" viewBox="0 0 320 188" role="img" aria-label="얕은 물과 갈대, 개구리가 있는 습지 생태계">
      ${shared}<rect width="320" height="188" rx="18" fill="url(#${prefix}-sky)"/>
      <path d="M0 112Q65 91 128 106T248 99T320 104V188H0Z" fill="url(#${prefix}-ground)"/>
      <path d="M0 132q78-22 160 0t160-2v58H0Z" fill="var(--bd-water)"/>
      <path d="M0 143q80-20 160 0t160-2" fill="none" stroke="var(--bd-water-line)" stroke-width="3" opacity=".7"/>
      <g stroke="var(--bd-reed)" stroke-width="3" stroke-linecap="round"><path d="M45 156V91m14 66V78m16 79v-54M262 157V88m16 70V76m15 82v-53"/></g>
      <g fill="var(--bd-reed-tip)"><ellipse cx="45" cy="87" rx="5" ry="14"/><ellipse cx="59" cy="74" rx="5" ry="14"/><ellipse cx="262" cy="84" rx="5" ry="14"/><ellipse cx="278" cy="72" rx="5" ry="14"/></g>
      <g transform="translate(154 135)" stroke="var(--bd-frog-edge)" stroke-width="1.5"><ellipse cx="0" cy="15" rx="25" ry="11" fill="#486F55" opacity=".18"/><ellipse cx="0" cy="0" rx="20" ry="14" fill="var(--bd-frog)"/><circle cx="-10" cy="-11" r="7" fill="var(--bd-frog)"/><circle cx="10" cy="-11" r="7" fill="var(--bd-frog)"/><circle cx="-10" cy="-12" r="2" fill="#152A24"/><circle cx="10" cy="-12" r="2" fill="#152A24"/><path d="M-6 5q6 4 12 0" fill="none"/></g>
      <ellipse cx="101" cy="151" rx="24" ry="7" fill="var(--bd-lily)"/><ellipse cx="225" cy="165" rx="27" ry="7" fill="var(--bd-lily)"/>
      <rect width="320" height="188" rx="18" fill="url(#${prefix}-light)"/>
    </svg>`;
  }

  return `<svg class="bd-eco-art" viewBox="0 0 320 188" role="img" aria-label="모래와 바위, 파도가 만나는 바닷가 생태계">
    ${shared}<rect width="320" height="188" rx="18" fill="url(#${prefix}-sky)"/>
    <path d="M0 80q58-15 112 1t105-2t103 2v107H0Z" fill="var(--bd-sea)"/>
    <path d="M0 116q65-19 129 2t121 0t70 4v66H0Z" fill="var(--bd-sand)"/>
    <path d="M0 111q63-18 127 2t123 0t70 4" fill="none" stroke="var(--bd-foam)" stroke-width="7" opacity=".85"/>
    <ellipse cx="246" cy="151" rx="43" ry="9" fill="#293847" opacity=".17"/>
    <path d="M214 151q8-45 35-50 35 7 43 50z" fill="var(--bd-rock)" stroke="var(--bd-rock-edge)" stroke-width="2"/>
    <g transform="translate(91 142)" stroke="var(--bd-crab-edge)" stroke-width="2" stroke-linecap="round"><ellipse cx="0" cy="0" rx="18" ry="11" fill="var(--bd-crab)"/><circle cx="-7" cy="-4" r="2" fill="#1E2930"/><circle cx="7" cy="-4" r="2" fill="#1E2930"/><path d="M-15 2l-15 9m45-9 15 9M-13 7l-11 13m37-13 11 13M-17-4l-12-8m46 8 12-8" fill="none"/></g>
    <g fill="none" stroke="var(--bd-seaweed)" stroke-width="5" stroke-linecap="round"><path d="M20 119q16-21 5-39m14 35q-8-24 6-40m93 48q17-26 6-45"/></g>
    <rect width="320" height="188" rx="18" fill="url(#${prefix}-light)"/>
  </svg>`;
};

const speciesBackdrop = (): string => `<svg class="bd-species-backdrop" viewBox="0 0 320 210" aria-hidden="true">
  <defs><linearGradient id="bd-species-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#214E4A"/><stop offset="1" stop-color="#102E31"/></linearGradient><radialGradient id="bd-species-light" cx="50%" cy="18%" r="70%"><stop offset="0" stop-color="#B9F3D1" stop-opacity=".3"/><stop offset="1" stop-color="#B9F3D1" stop-opacity="0"/></radialGradient></defs>
  <rect width="320" height="210" rx="18" fill="url(#bd-species-sky)"/><path d="M0 142q63-25 127 2t193-5v71H0z" fill="#163A32"/>
  <path d="M44 161L52 43h25l9 118zM239 160l8-132h27l9 132z" fill="#6F523C" stroke="#3E332B" stroke-width="2"/>
  <g fill="#286C4D" stroke="#174937" stroke-width="1.5"><circle cx="59" cy="45" r="35"/><circle cx="91" cy="47" r="39"/><circle cx="244" cy="39" r="39"/><circle cx="279" cy="53" r="37"/></g>
  <path d="M0 177q76-24 157 3t163-7v37H0z" fill="#214B38"/><rect width="320" height="210" rx="18" fill="url(#bd-species-light)"/>
</svg>`;

const ladybugArt = (variant: number): string => {
  const variants: [number, number, number][][] = [
    [[15, 15, 2.5], [33, 15, 2.5], [15, 29, 2.5], [33, 29, 2.5]],
    [[13, 17, 3], [35, 13, 2.4], [27, 28, 3.2]],
    [[14, 13, 2.2], [34, 13, 2.2], [12, 27, 2.2], [36, 27, 2.2], [24, 21, 3]],
    [[16, 18, 3.4], [32, 18, 3.4]],
    [[13, 13, 2.4], [35, 13, 2.4], [17, 28, 3], [31, 28, 3], [24, 19, 1.8]],
    [[12, 16, 2.2], [36, 16, 2.2], [15, 29, 2.2], [33, 29, 2.2], [24, 24, 3.2]],
  ];
  const spots = variants[variant];
  const dots = spots.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join("");
  return `<svg class="bd-bug-art" viewBox="0 0 48 48" aria-hidden="true">
    <ellipse cx="24" cy="42" rx="17" ry="3" fill="#0B1820" opacity=".2"/>
    <path d="M12 20C12 8 36 8 36 20v10c0 10-24 10-24 0z" fill="var(--bd-bug-shell)" stroke="var(--bd-bug-edge)" stroke-width="1.8"/>
    <path d="M24 13v25" stroke="var(--bd-bug-edge)" stroke-width="1.5"/><path d="M16 14q8-10 16 0" fill="#1F2A30"/>
    <g fill="#1F2A30">${dots}</g><path d="M14 22L5 17m9 12-9 4m29-11 9-5m-9 12 9 4" stroke="#1F2A30" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
};

export const biodiversityLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BiodiversityStep;
  api.setCTA("세 가지 렌즈를 모두 완성해 보세요", { enabled: false });

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = new Set<Lens>();
  let finished = false;
  const cleanups: (() => void)[] = [];
  const listen = (target: EventTarget, type: string, handler: EventListener): void => {
    target.addEventListener(type, handler);
    cleanups.push(() => target.removeEventListener(type, handler));
  };

  const goalChips = el(
    "div",
    { class: "pn-badges force3 bd-goals" },
    ...LENSES.map((lens) =>
      el(
        "div",
        { class: "pn-badge bd-goal", dataset: { g: lens.id } },
        el("b", { html: `${icon(lens.icon, 16)}<span>${lens.short}</span>` }),
        el("span", { text: "살펴보기" }),
      ),
    ),
  );
  const helper = el("div", {
    class: "helper bd-helper",
    html: "먼저 <b>생태계 렌즈</b>로 숲·습지·바닷가를 하나씩 열어 보세요.",
    attrs: { "aria-live": "polite" },
  });

  const collect = (id: Lens, result: string, next: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector<HTMLElement>(`[data-g="${id}"]`);
    if (chip) {
      chip.classList.add("on", "bd-goal-done");
      const sub = chip.querySelector<HTMLElement>(":scope > span");
      if (sub) sub.textContent = result;
    }
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === LENSES.length && !finished) {
      finished = true;
      helper.innerHTML =
        "발견 완료! 생물다양성은 <b>서로 다른 생태계</b>, 한 생태계에 사는 <b>여러 생물 종류</b>, 같은 종류 안에서 나타나는 <b>개체마다의 차이</b>를 모두 포함해요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "세 가지 다양성 정리하기");
      return;
    }
    helper.innerHTML = next;
  };

  // ── 렌즈 1: 서로 다른 생태계 세 곳 비교 ──
  const ecoVisited = new Set<Ecosystem>();
  const ecoScene = el(
    "div",
    { class: "bd-eco-scene bd-empty" },
    el("div", { class: "bd-empty-mark", html: icon("globe", 34) }),
    el("div", { class: "bd-empty-copy", text: "아래 환경을 하나씩 열어 보세요" }),
  );
  const ecoReadout = el("div", { class: "bd-readout", html: "서로 다른 환경 <b>0 / 3</b>" });
  const ecoButtons = new Map<Ecosystem, HTMLButtonElement>();
  const ecoControls = el("div", { class: "bd-eco-controls", attrs: { "aria-label": "비교할 생태계" } });
  for (const eco of ECOSYSTEMS) {
    const button = el(
      "button",
      {
        class: "bd-eco-btn",
        dataset: { eco: eco.id },
        attrs: { type: "button", "aria-pressed": "false", "aria-label": `${eco.name} 생태계 열기` },
      },
      el("span", { class: "bd-eco-icon", html: icon(eco.icon, 20) }),
      el("span", { class: "bd-eco-name", text: eco.name }),
      el("span", { class: "bd-eco-check", html: icon("check", 15) }),
    );
    ecoButtons.set(eco.id, button);
    ecoControls.appendChild(button);
    listen(button, "click", () => {
      ecoScene.classList.remove("bd-empty");
      ecoScene.dataset.eco = eco.id;
      ecoScene.innerHTML = `${ecosystemArt(eco.id)}<div class="bd-scene-caption"><b>${eco.name}</b><span>${eco.summary}</span></div>`;
      for (const [id, btn] of ecoButtons) {
        const active = id === eco.id;
        btn.classList.toggle("bd-active", active);
        btn.setAttribute("aria-pressed", String(active));
      }
      if (!ecoVisited.has(eco.id)) {
        ecoVisited.add(eco.id);
        button.classList.add("bd-seen");
        haptic(HAPTIC.select);
      } else {
        haptic(HAPTIC.tap);
      }
      ecoReadout.innerHTML = `<span>${eco.clue}</span><b>${ecoVisited.size} / 3 비교</b>`;
      if (ecoVisited.size === ECOSYSTEMS.length) {
        collect(
          "ecosystem",
          "3곳 비교 완료",
          "숲·습지·바닷가는 빛, 물, 땅의 조건이 달라 <b>서로 다른 생태계</b>를 이루어요. 이제 <b>생물 종류 렌즈</b>를 눌러 한 숲 안을 살펴보세요.",
        );
      } else {
        helper.innerHTML = `<b>${eco.name}</b>을 열었어요. 아직 보지 않은 환경이 <b>${ECOSYSTEMS.length - ecoVisited.size}곳</b> 남았어요.`;
      }
    });
  }
  const ecosystemPanel = el(
    "section",
    { class: "bd-panel bd-panel-ecosystem", attrs: { id: "bd-panel-ecosystem", role: "tabpanel" } },
    el("div", { class: "bd-panel-kicker", text: "렌즈 1 · 서로 다른 삶의 터전" }),
    el("div", { class: "bd-panel-title", text: "환경을 바꾸면 무엇이 달라질까요?" }),
    ecoScene,
    ecoControls,
    ecoReadout,
  );

  // ── 렌즈 2: 한 생태계 속 서로 다른 생물 종류 찾기 ──
  const speciesFound = new Set<string>();
  const speciesCount = el("span", { text: "0 / 4" });
  const speciesScene = el("div", { class: "bd-species-scene" }, el("div", { class: "bd-species-bg", html: speciesBackdrop() }));
  for (const organism of SPECIES) {
    const button = el(
      "button",
      {
        class: "bd-specimen",
        style: `--bd-x:${organism.x}%;--bd-y:${organism.y}%`,
        attrs: { type: "button", "aria-pressed": "false", "aria-label": `${organism.name} 찾기` },
      },
      el("span", { class: "bd-specimen-ring", html: icon(organism.icon, 21) }),
      el("span", { class: "bd-specimen-name", text: organism.name }),
    );
    speciesScene.appendChild(button);
    listen(button, "click", () => {
      if (speciesFound.has(organism.name)) return;
      speciesFound.add(organism.name);
      button.classList.add("bd-found");
      button.setAttribute("aria-pressed", "true");
      haptic(HAPTIC.select);
      speciesCount.textContent = `${Math.min(speciesFound.size, 4)} / 4`;
      helper.innerHTML = `<b>${organism.name}</b>을 찾았어요. 같은 숲 안에서 서로 다른 생물을 <b>${speciesFound.size}종류</b> 발견했어요.`;
      if (speciesFound.size >= 4) {
        collect(
          "species",
          "4종류 발견",
          "한 숲에도 나무·고사리·버섯·동물처럼 <b>여러 생물 종류</b>가 함께 살아요. 마지막으로 <b>개체 차이 렌즈</b>에서 같은 종류끼리 비교해 보세요.",
        );
      }
    });
  }
  const speciesPanel = el(
    "section",
    { class: "bd-panel bd-panel-species", attrs: { id: "bd-panel-species", role: "tabpanel" } },
    el("div", { class: "bd-panel-kicker", text: "렌즈 2 · 한 생태계 안의 여러 종류" }),
    el(
      "div",
      { class: "bd-panel-heading" },
      el("div", { class: "bd-panel-title", text: "숲에서 서로 다른 생물 4종류를 찾아보세요" }),
      el("div", { class: "bd-counter" }, speciesCount),
    ),
    speciesScene,
    el("div", { class: "bd-readout", text: "둥근 표식을 눌러 생물을 관찰 기록에 담아요" }),
  );

  // ── 렌즈 3: 같은 종류 안 개체 둘의 무늬 비교 ──
  const selectedBugs: number[] = [];
  let variationDone = false;
  const bugButtons: HTMLButtonElement[] = [];
  const compareOutput = el("div", {
    class: "bd-compare-output",
    text: "같은 종류의 무당벌레 가운데 두 개체를 골라 보세요.",
    attrs: { "aria-live": "polite" },
  });
  const compareButton = el(
    "button",
    { class: "bd-compare-btn", attrs: { type: "button", disabled: true } },
    el("span", { html: icon("swap", 19) }),
    el("span", { text: "두 개체 비교하기" }),
  );
  const bugGrid = el("div", { class: "bd-bug-grid", attrs: { "aria-label": "같은 종류의 무당벌레 여섯 개체" } });
  for (let i = 0; i < 6; i += 1) {
    const button = el(
      "button",
      {
        class: "bd-bug",
        attrs: { type: "button", "aria-pressed": "false", "aria-label": `${i + 1}번 무당벌레 개체` },
      },
      el("span", { html: ladybugArt(i) }),
      el("span", { class: "bd-bug-label", text: `${i + 1}번` }),
    );
    bugButtons.push(button);
    bugGrid.appendChild(button);
    listen(button, "click", () => {
      if (variationDone) return;
      const at = selectedBugs.indexOf(i);
      if (at >= 0) selectedBugs.splice(at, 1);
      else {
        if (selectedBugs.length === 2) selectedBugs.shift();
        selectedBugs.push(i);
      }
      bugButtons.forEach((bug, index) => {
        const selected = selectedBugs.includes(index);
        bug.classList.toggle("bd-selected", selected);
        bug.setAttribute("aria-pressed", String(selected));
      });
      compareButton.toggleAttribute("disabled", selectedBugs.length !== 2);
      compareOutput.textContent =
        selectedBugs.length === 2
          ? `${selectedBugs[0] + 1}번과 ${selectedBugs[1] + 1}번을 골랐어요. 점의 수와 배열을 비교해 보세요.`
          : selectedBugs.length === 1
            ? "한 개체를 골랐어요. 비교할 개체를 하나 더 고르세요."
            : "같은 종류의 무당벌레 가운데 두 개체를 골라 보세요.";
      haptic(HAPTIC.select);
    });
  }
  listen(compareButton, "click", () => {
    if (variationDone || selectedBugs.length !== 2) return;
    variationDone = true;
    compareButton.toggleAttribute("disabled", true);
    compareButton.classList.add("bd-complete");
    compareButton.lastElementChild!.textContent = "차이 확인 완료";
    bugButtons.forEach((bug, index) => {
      bug.toggleAttribute("disabled", true);
      if (selectedBugs.includes(index)) bug.classList.add("bd-compared");
    });
    compareOutput.innerHTML =
      "둘은 모두 <b>같은 종류의 무당벌레</b>지만 점의 수와 배열이 달라요. 같은 종류 안에서 개체마다 나타나는 이런 차이를 <b>변이</b>라고 해요.";
    collect(
      "variation",
      "개체 차이 확인",
      "같은 종류라도 모든 개체가 똑같지는 않아요. 점무늬처럼 개체마다 다른 특징인 <b>변이</b>도 생물다양성의 한 부분이에요.",
    );
  });
  const variationPanel = el(
    "section",
    { class: "bd-panel bd-panel-variation", attrs: { id: "bd-panel-variation", role: "tabpanel" } },
    el("div", { class: "bd-panel-kicker", text: "렌즈 3 · 같은 종류 안의 개체 차이" }),
    el("div", { class: "bd-panel-title", text: "무당벌레 두 개체의 무늬를 비교해 보세요" }),
    bugGrid,
    compareOutput,
    compareButton,
  );

  // ── 공용 관찰대: 탭은 세 렌즈를 오가며 이미 한 조작을 그대로 보존한다. ──
  const panels: Record<Lens, HTMLElement> = {
    ecosystem: ecosystemPanel,
    species: speciesPanel,
    variation: variationPanel,
  };
  const tabButtons = new Map<Lens, HTMLButtonElement>();
  const tablist = el("div", { class: "bd-lenses", attrs: { role: "tablist", "aria-label": "생물다양성 관찰 렌즈" } });
  const setLens = (lens: Lens, moveFocus = false): void => {
    for (const info of LENSES) {
      const active = info.id === lens;
      const button = tabButtons.get(info.id)!;
      button.classList.toggle("bd-active", active);
      button.setAttribute("aria-selected", String(active));
      button.setAttribute("tabindex", active ? "0" : "-1");
      panels[info.id].hidden = !active;
    }
    if (moveFocus) tabButtons.get(lens)!.focus();
    if (finished) return;
    if (lens === "ecosystem" && ecoVisited.size < ECOSYSTEMS.length) {
      helper.innerHTML = "숲·습지·바닷가를 하나씩 열어 <b>환경과 사는 생물</b>이 어떻게 달라지는지 비교해 보세요.";
    } else if (lens === "species" && speciesFound.size < 4) {
      helper.innerHTML = "한 숲 안에도 여러 생물이 함께 살아요. 둥근 표식을 눌러 <b>서로 다른 생물 4종류</b>를 찾아보세요.";
    } else if (lens === "variation" && !variationDone) {
      helper.innerHTML = "모두 같은 종류의 무당벌레예요. <b>두 개체</b>를 골라 점무늬가 어떻게 다른지 비교해 보세요.";
    }
    haptic(HAPTIC.tap);
  };

  LENSES.forEach((lens, index) => {
    const button = el(
      "button",
      {
        class: `bd-lens-btn${index === 0 ? " bd-active" : ""}`,
        attrs: {
          type: "button",
          role: "tab",
          "aria-selected": String(index === 0),
          "aria-controls": `bd-panel-${lens.id}`,
          tabindex: index === 0 ? "0" : "-1",
        },
      },
      el("span", { class: "bd-lens-icon", html: icon(lens.icon, 18) }),
      el("span", { text: lens.short }),
    );
    tabButtons.set(lens.id, button);
    tablist.appendChild(button);
    listen(button, "click", () => setLens(lens.id));
    listen(button, "keydown", ((event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = (index + direction + LENSES.length) % LENSES.length;
      setLens(LENSES[next].id, true);
    }) as EventListener);
  });

  ecosystemPanel.hidden = false;
  speciesPanel.hidden = true;
  variationPanel.hidden = true;
  const stage = el("div", { class: "stage bd-stage" }, tablist, ecosystemPanel, speciesPanel, variationPanel);
  host.append(goalChips, helper, stage); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
};
