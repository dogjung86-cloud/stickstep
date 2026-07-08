// figTabs — 그림 상태 전환 스텝. 세그 탭을 누르면 그림과 설명이 함께 바뀐다.
// 교과서의 "~할 때" 상태 비교 그림(전기 그네 3상태 등)을 탭 인터랙션으로 옮기는 범용 위젯.
// 모든 탭을 한 번씩 봐야 CTA가 열린다(채점 없음 — 관찰 스텝).

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface FigTab {
  name: string;
  art: string; // HTML(발주 이미지 + SVG 오버레이 등)
  cap: string; // 설명(HTML)
}
interface FigTabsStep {
  title: string;
  lead?: string;
  tabs: FigTab[];
  cta?: string;
}

export const figTabs: StepRenderer = (host, step, api) => {
  const s = step as unknown as FigTabsStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const seg = el("div", { class: "seg", style: "margin-top:14px" });
  const artBox = el("div", { class: "c-figure-art" });
  const capBox = el("div", { class: "c-figure-cap" });
  const card = el("div", { class: "c-figure figtabs" }, artBox, capBox);
  host.append(seg, card);

  const seen = new Set<number>();
  const btns: HTMLButtonElement[] = [];

  function show(i: number): void {
    btns.forEach((b, k) => {
      b.classList.toggle("on", k === i);
      b.setAttribute("aria-pressed", String(k === i));
    });
    // 짧은 페이드로 전환이 읽히게
    artBox.style.opacity = "0";
    window.setTimeout(() => {
      clear(artBox);
      artBox.innerHTML = s.tabs[i].art;
      capBox.innerHTML = s.tabs[i].cap;
      artBox.style.opacity = "1";
    }, 90);
    if (!seen.has(i)) {
      seen.add(i);
      if (seen.size === s.tabs.length) api.enableCTA(s.cta ?? "다음");
    }
  }

  s.tabs.forEach((t, i) => {
    const b = el("button", { text: t.name, attrs: { type: "button", "aria-pressed": String(i === 0) } });
    b.addEventListener("click", () => {
      haptic(HAPTIC.select);
      show(i);
    });
    btns.push(b);
    seg.appendChild(b);
  });

  artBox.style.transition = "opacity .16s ease-out";
  artBox.innerHTML = s.tabs[0].art;
  capBox.innerHTML = s.tabs[0].cap;
  seen.add(0);
  api.setCTA("세 장면을 모두 확인해요", { enabled: false });
};
