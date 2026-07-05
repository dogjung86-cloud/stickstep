// orgLevels — 생물의 구성 단계를 "더 큰 단위로" 확대하며 오르는 스테퍼.
// 동물: 세포→조직→기관→기관계→개체 / 식물: 세포→조직→조직계→기관→개체.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface Level { name: string; example: string; svg: string; desc: string; }
interface OrgLevelsStep { title: string; lead?: string; levels: Level[]; cta?: string; }

export const orgLevels: StepRenderer = (host, step, api) => {
  const s = step as unknown as OrgLevelsStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  let cur = 0;
  const top = s.levels.length - 1;

  const stage = el("div", { class: "org-stage" });
  const railBox = el("div", { class: "org-rail" });
  const upBtn = el("button", { class: "org-up" }, el("span", { html: "▲" }), el("span", { class: "org-up-t", text: "더 큰 단위로" }));
  const wrap = el("div", { class: "org-wrap" }, railBox, el("div", { class: "org-main" }, stage, upBtn));
  host.appendChild(wrap);

  function rail(): void {
    clear(railBox);
    s.levels.forEach((lv, i) => {
      const node = el(
        "div",
        { class: `org-rnode ${i === cur ? "on" : ""} ${i < cur ? "done" : ""}` },
        el("span", { class: "org-rdot" }),
        el("span", { class: "org-rname", text: lv.name }),
      );
      railBox.appendChild(node);
    });
  }

  function show(): void {
    const lv = s.levels[cur];
    clear(stage);
    const art = el("div", { class: "org-art", html: lv.svg });
    const meta = el(
      "div",
      { class: "org-meta" },
      el("div", { class: "org-step", text: `${cur + 1}단계 · ${lv.name}` }),
      el("div", { class: "org-ex", text: lv.example }),
      el("div", { class: "org-desc", html: lv.desc }),
    );
    stage.append(art, meta);
    requestAnimationFrame(() => stage.classList.add("in"));
    rail();
    upBtn.classList.toggle("hidden", cur >= top);
    if (cur >= top) api.enableCTA(s.cta ?? "구성 단계를 이해했어요");
  }

  upBtn.addEventListener("click", () => {
    if (cur >= top) return;
    cur += 1;
    stage.classList.remove("in");
    haptic(HAPTIC.select);
    requestAnimationFrame(show);
  });

  api.setCTA(s.cta ?? "위로 올라가며 살펴보세요", { enabled: false });
  show();
};
