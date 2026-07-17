// breathModelLab — 고무막을 위아래로 움직여 흉강 부피·압력·허파 부피를 연결한다.

import { clamp, el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { safePointerCapture } from "../../ui/bodyKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface BreathModelStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "inhale" | "exhale" | "match";

const LAB_SVG = `<svg viewBox="0 0 360 276" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="병 속 작은 풍선과 아래 고무막으로 만든 호흡운동 모형"><defs>
<linearGradient id="bml-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--n0)" stop-opacity=".88"/><stop offset=".55" stop-color="var(--body-airway-hi)" stop-opacity=".34"/><stop offset="1" stop-color="var(--body-airway)" stop-opacity=".18"/></linearGradient><linearGradient id="bml-lung" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-tissue-hi)"/><stop offset=".55" stop-color="var(--body-tissue)"/><stop offset="1" stop-color="var(--body-tissue-lo)"/></linearGradient><linearGradient id="bml-rubber" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--body-protein)"/><stop offset=".55" stop-color="var(--body-deoxygenated)"/><stop offset="1" stop-color="var(--body-organ-lo)"/></linearGradient>
<marker id="bml-air-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L9 5L1 9Z" fill="var(--body-oxygen)"/></marker></defs><ellipse cx="180" cy="259" rx="116" ry="10" fill="var(--body-shadow)" opacity=".14"/>
<path d="M94 42 H266 L250 226 Q180 247 110 226Z" fill="url(#bml-glass)" stroke="var(--body-airway-lo)" stroke-width="2"/><path d="M105 55 C119 48 135 47 149 50" stroke="var(--n0)" stroke-width="4" opacity=".55"/>
<path d="M180 18 V86 M180 64 L140 99 M180 64 L220 99" stroke="var(--body-airway-lo)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path class="bml-air" d="M180 5 V48" stroke="var(--body-oxygen)" stroke-width="4" marker-end="url(#bml-air-a)"/>
<g class="bml-lungs"><path class="bml-lung left" d="M137 94 C111 93 106 125 111 169 C114 205 136 216 157 194 C167 181 163 119 155 103 C151 96 145 94 137 94Z" fill="url(#bml-lung)" stroke="var(--body-tissue-lo)" stroke-width="1.8"/><path class="bml-lung right" d="M223 94 C249 93 254 125 249 169 C246 205 224 216 203 194 C193 181 197 119 205 103 C209 96 215 94 223 94Z" fill="url(#bml-lung)" stroke="var(--body-tissue-lo)" stroke-width="1.8"/><path d="M123 111 C132 104 143 104 150 108" stroke="var(--n0)" stroke-width="3" opacity=".44"/></g>
<g class="bml-membrane" tabindex="0" role="slider" aria-label="고무막을 위아래로 움직이기" aria-valuemin="-30" aria-valuemax="30" aria-valuenow="0"><path d="M103 223 Q180 196 257 223 Q180 248 103 223Z" fill="url(#bml-rubber)" stroke="var(--body-organ-lo)" stroke-width="2"/><rect class="bml-handle" x="153" y="219" width="54" height="25" rx="12.5" fill="var(--n0)" stroke="var(--body-protein)" stroke-width="2"/><path d="M166 231H194" stroke="var(--body-protein)" stroke-width="3"/></g>
<g class="bml-labels" opacity="0"><rect x="18" y="48" width="91" height="25" rx="12.5" fill="var(--n0)"/><text x="63" y="65" text-anchor="middle" font-size="11" font-weight="850" fill="var(--n800)">병 = 흉강</text><path d="M109 61H125" stroke="var(--n400)"/>
<rect x="250" y="104" width="101" height="25" rx="12.5" fill="var(--n0)"/><text x="300" y="121" text-anchor="middle" font-size="11" font-weight="850" fill="var(--n800)">작은 풍선 = 허파</text><path d="M250 116H230" stroke="var(--n400)"/>
<rect x="17" y="195" width="114" height="25" rx="12.5" fill="var(--n0)"/><text x="74" y="212" text-anchor="middle" font-size="11" font-weight="850" fill="var(--n800)">고무막 = 가로막</text><path d="M131 208L153 220" stroke="var(--n400)"/></g></svg>`;

export const breathModelLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BreathModelStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));
  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge body", dataset: { g: "inhale" } }, el("b", { text: "고무막 아래" }), el("span", { text: "들숨 만들기" })),
    el("div", { class: "pn-badge body", dataset: { g: "exhale" } }, el("b", { text: "고무막 위" }), el("span", { text: "날숨 만들기" })),
    el("div", { class: "pn-badge body", dataset: { g: "match" } }, el("b", { text: "모형 대응" }), el("span", { text: "세 부분" })),
  );
  const helper = el("div", { class: "helper", html: "병 아래의 <b>고무막 손잡이</b>를 위아래로 움직여 작은 풍선의 변화를 관찰하세요." });
  const art = el("div", { class: "body-lab-art bml-art", html: LAB_SVG });
  const toast = el("div", { class: "toast" });
  const stage = el("div", { class: "stage body-lab-stage bml-stage" }, art, toast);
  const controls = el(
    "div", { class: "body-lab-controls bml-controls" },
    el("button", { class: "body-lab-btn", dataset: { action: "down" }, attrs: { type: "button" }, text: "고무막 아래로 당기기" }),
    el("button", { class: "body-lab-btn", dataset: { action: "up" }, attrs: { type: "button" }, text: "고무막 위로 밀기" }),
    el("button", { class: "body-lab-btn", dataset: { action: "match" }, attrs: { type: "button" }, text: "모형 대응표 펼치기" }),
  );
  const result = el("div", { class: "djl-result", text: "고무막이 움직이면 병 속 부피와 압력이 함께 달라져요" });
  host.append(goalsEl, helper, stage, controls, result);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const goals = new Set<Goal>();
  const cleanups: (() => void)[] = [];
  let toastTimer = 0;
  let finished = false;
  let y = 0;
  let dragging = false;
  let pointerStart = 0;
  let yStart = 0;
  const membrane = art.querySelector(".bml-membrane") as SVGGElement;

  const showToast = (message: string): void => {
    toast.textContent = message; toast.classList.add("show"); window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1500);
  };
  const collect = (id: Goal, sub: string, message: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on"); chip.querySelector("span")!.textContent = sub;
    haptic(HAPTIC.ctaUnlock); showToast(message);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML = "모형 완성! <b>가로막이 내려가 흉강 부피가 커지면 압력이 낮아져 들숨</b>, 올라가 부피가 작아지면 압력이 높아져 날숨이 일어나요. 허파는 스스로 움직이지 않아요.";
      api.recordQuiz(true); api.enableCTA(s.cta ?? "기체 교환 정리하기");
    }
  };
  const setState = (next: number): void => {
    y = clamp(next, -30, 30);
    membrane.style.setProperty("--bml-y", `${y}px`);
    membrane.setAttribute("aria-valuenow", String(Math.round(y)));
    const scale = 1 + y / 100;
    art.style.setProperty("--bml-lung-scale", String(clamp(scale, 0.7, 1.3)));
    art.classList.toggle("inhale", y > 19);
    art.classList.toggle("exhale", y < -19);
    if (y > 22) {
      result.innerHTML = "고무막 아래 → 병 속 부피 <b>커짐</b> → 압력 낮아짐 → 공기 들어옴";
      collect("inhale", "풍선 커짐", "들숨 모형을 만들었어요");
    } else if (y < -22) {
      result.innerHTML = "고무막 위 → 병 속 부피 <b>작아짐</b> → 압력 높아짐 → 공기 나감";
      collect("exhale", "풍선 작아짐", "날숨 모형을 만들었어요");
    }
  };
  const onDown = (event: PointerEvent): void => {
    dragging = true; pointerStart = event.clientY; yStart = y; safePointerCapture(membrane, event.pointerId); haptic(HAPTIC.tap); art.classList.add("dragging");
  };
  const onMove = (event: PointerEvent): void => {
    if (!dragging) return;
    const rect = art.getBoundingClientRect();
    setState(yStart + (event.clientY - pointerStart) * (276 / Math.max(1, rect.height)));
  };
  const onUp = (): void => { dragging = false; art.classList.remove("dragging"); };
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === "ArrowDown") setState(y + 10);
    else if (event.key === "ArrowUp") setState(y - 10);
    else return;
    event.preventDefault();
  };
  membrane.addEventListener("pointerdown", onDown); membrane.addEventListener("pointermove", onMove); membrane.addEventListener("pointerup", onUp); membrane.addEventListener("pointercancel", onUp); membrane.addEventListener("keydown", onKey);
  cleanups.push(() => membrane.removeEventListener("pointerdown", onDown), () => membrane.removeEventListener("pointermove", onMove), () => membrane.removeEventListener("pointerup", onUp), () => membrane.removeEventListener("pointercancel", onUp), () => membrane.removeEventListener("keydown", onKey));
  controls.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    const handler = (): void => {
      const action = button.dataset.action;
      button.classList.add("done"); haptic(HAPTIC.select);
      if (action === "down") setState(30);
      else if (action === "up") setState(-30);
      else { art.classList.add("matched"); result.textContent = "병=흉강, 빨대=숨관, 작은 풍선=허파, 고무막=가로막"; collect("match", "병·풍선·고무막", "모형과 몸의 부분을 연결했어요"); }
    };
    button.addEventListener("click", handler); cleanups.push(() => button.removeEventListener("click", handler));
  });
  api.setCTA("들숨·날숨·모형 대응을 모두 확인해 보세요", { enabled: false });
  return () => { window.clearTimeout(toastTimer); cleanups.forEach((cleanup) => cleanup()); };
};
