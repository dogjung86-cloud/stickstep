// hotspot — 그림 위 지점을 탭해 구조 이름·기능을 드러내거나(reveal),
// 지목된 구조를 찾게 한다(find). 세포 소기관 라벨링 등에 사용.
// spot.photo가 있으면 설명 아래에 해당 부분의 실사 사진 카드를 띄운다(태양 지도 등).

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepAPI, StepRenderer } from "../types";

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

interface Spot { x: number; y: number; label: string; desc?: string; photo?: string; photoCredit?: string; }
interface HotspotStep {
  title: string;
  lead?: string;
  svg: string;
  spots: Spot[];
  mode?: "reveal" | "find";
  dark?: boolean;
  explainGood?: string;
  explainBad?: string;
}

export const hotspot: StepRenderer = (host, step, api) => {
  const s = step as unknown as HotspotStep;
  const mode = s.mode ?? "reveal";
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const stage = el("div", { class: `hs-stage ${s.dark ? "dark" : ""}` });
  stage.appendChild(el("div", { class: "hs-art", html: s.svg }));
  const label = el("div", { class: "hs-readout" });
  const photoBox = el("div", { class: "hs-photo" });
  host.append(stage, label, photoBox);

  if (mode === "find") return renderFind(stage, label, s, api);
  return renderReveal(stage, label, photoBox, s, api);
};

function showPhoto(photoBox: HTMLElement, spot: Spot): void {
  clear(photoBox);
  if (!spot.photo) {
    photoBox.classList.remove("show");
    return;
  }
  const img = el("img", { attrs: { src: base + spot.photo, alt: `${spot.label} 실제 사진`, loading: "lazy" } });
  img.addEventListener("error", () => photoBox.classList.remove("show"));
  photoBox.append(img, el("span", { class: "hs-photo-cap", text: `${spot.label} — 실제 관측 사진${spot.photoCredit ? ` (${spot.photoCredit})` : ""}` }));
  // reflow 후 표시 — 스팟을 바꿔 눌러도 매번 전환 애니메이션이 재생되게
  photoBox.classList.remove("show");
  void photoBox.offsetWidth;
  photoBox.classList.add("show");
}

function renderReveal(stage: HTMLElement, label: HTMLElement, photoBox: HTMLElement, s: HotspotStep, api: StepAPI): void {
  const revealed = new Set<number>();
  label.innerHTML = `<b>${revealed.size}</b> / ${s.spots.length} · 각 부분을 눌러 보세요`;
  s.spots.forEach((spot, i) => {
    const dot = el("button", {
      class: "hs-dot",
      style: `left:${spot.x}%;top:${spot.y}%`,
      attrs: { "aria-label": spot.label },
    });
    dot.appendChild(el("span", { class: "hs-pulse" }));
    dot.addEventListener("click", () => {
      if (!revealed.has(i)) {
        revealed.add(i);
        dot.classList.add("on");
        haptic(HAPTIC.select);
      }
      showTag(stage, spot);
      label.innerHTML = `<b class="hs-name">${spot.label}</b>${spot.desc ? " · " + spot.desc : ""}`;
      showPhoto(photoBox, spot);
      if (revealed.size === s.spots.length) api.enableCTA("다 배웠어요");
    });
    stage.appendChild(dot);
  });
  api.setCTA("각 부분을 눌러 보세요", { enabled: false });
}

function renderFind(stage: HTMLElement, label: HTMLElement, s: HotspotStep, api: StepAPI): void {
  const queue = s.spots.map((_, i) => i);
  let qi = 0;
  let wrongAny = false;
  let done = false;

  function ask(): void {
    if (qi >= queue.length) {
      done = true;
      api.recordQuiz(!wrongAny);
      window.setTimeout(() => {
        api.openSheet({
          good: !wrongAny,
          title: wrongAny ? "거의 다 왔어요" : "모두 찾았어요!",
          html: (wrongAny ? s.explainBad : s.explainGood) ?? "",
          onContinue: api.next,
        });
      }, 360);
      return;
    }
    label.innerHTML = `<b class="hs-name">${s.spots[queue[qi]].label}</b> 은(는) 어디일까요?`;
  }

  s.spots.forEach((spot, i) => {
    const dot = el("button", { class: "hs-dot hidden", style: `left:${spot.x}%;top:${spot.y}%` });
    dot.appendChild(el("span", { class: "hs-pulse" }));
    dot.addEventListener("click", () => {
      if (done) return;
      const target = queue[qi];
      if (i === target) {
        dot.classList.add("on");
        showTag(stage, spot);
        haptic(HAPTIC.correct);
        qi += 1;
        ask();
      } else {
        wrongAny = true;
        dot.classList.add("miss");
        haptic(HAPTIC.wrong);
        window.setTimeout(() => dot.classList.remove("miss"), 400);
      }
    });
    stage.appendChild(dot);
  });
  api.disableCTA();
  api.setCTA("구조를 찾아 탭하세요", { enabled: false });
  ask();
}

function showTag(stage: HTMLElement, spot: Spot): void {
  const old = stage.querySelector(".hs-tag");
  if (old) old.remove();
  const tag = el("div", { class: "hs-tag", style: `left:${spot.x}%;top:${spot.y}%`, html: spot.label });
  stage.appendChild(tag);
  requestAnimationFrame(() => tag.classList.add("show"));
}
