// comic — 스틱맨 쌤이 과학사 이야기를 만화 컷으로 들려주며 개념을 가르치는 스텝.
// 하단 CTA로 컷을 한 장씩 넘기고, 마지막 컷에서 다음 단계로 넘어간다.
// 이미지(Imagen 발주)가 아직 없거나 로드 실패하면 스틱맨 SVG로 폴백.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { renderBlock } from "../../ui/blocks";
import { stickman } from "../../ui/figures";
import { stickAvatar } from "../../ui/avatar";
import type { StepRenderer } from "../types";

/** 컷 위 한글 말풍선 — dsl.ts CutBubble 하이브리드 표준의 comic판.
 *  발주 컷엔 글자·말풍선 없이 인물 연기만, 앱이 이미지 % 좌표에 한글을 얹는다.
 *  x·y = 컷 프레임 기준 %(말풍선 중심·아래 꼭지). flip이면 꼬리가 위(인물 아래 배치용). */
interface PanelBubble {
  text: string;
  x: number;
  y: number;
  flip?: boolean;
}
interface Panel {
  img?: string;
  stage: string;
  title: string;
  caption: string;
  term?: { name: string; def: string };
  bubbles?: PanelBubble[];
}
interface ComicStep {
  title?: string;
  lead?: string;
  narrator?: string;
  panels: Panel[];
  cta?: string;
}

const STAGE_COLOR: Record<string, string> = {
  인트로: "#3182F6", "문제 인식": "#3182F6", "가설 설정": "#FF9500",
  "탐구 설계": "#8A6BFF", "탐구 계획": "#8A6BFF", "탐구 수행": "#12B886",
  "자료 해석": "#0CA6C0", "결론 도출": "#04B45F",
  // 열 단원(III)
  전도: "#FF6B4A", 대류: "#0CA6C0", 복사: "#F04452", 정리: "#04B45F",
  // 역사 트랙 — 탐구 5단계 + 서사 배지
  "주제 선정": "#3182F6", "자료 수집": "#E8850C", "분석·해석": "#8A6BFF", 검증: "#0CA6C0", "정리·발표": "#04B45F",
  랑케: "#3D5BC0", "카의 생각": "#0E7C8A", 사관: "#8A6BFF", 대결: "#E8590C",
  // 사회 Ⅶ — 장영실 서사(귀속→성취)
  "타고난 자리": "#8A6A3E", "재능의 부름": "#E8850C", "스스로 얻은 자리": "#0E7C8A", "두 이름표": "#862E9C",
};
function stageColor(stage: string): string {
  for (const key of Object.keys(STAGE_COLOR)) if (stage.includes(key)) return STAGE_COLOR[key];
  return "#3182F6";
}
const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

export const comic: StepRenderer = (host, step, api) => {
  const s = step as unknown as ComicStep;
  if (s.title) host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  host.appendChild(
    el(
      "div",
      { class: "comic-narrator" },
      el("div", { class: "comic-avatar" }, stickAvatar("smile")),
      el("div", { class: "comic-bubble", html: s.narrator ?? "스틱맨 쌤이 <b>과학사 이야기</b>로 탐구 과정을 알려줄게요. 컷을 한 장씩 넘겨 보세요." }),
    ),
  );

  const dots = el("div", { class: "comic-dots" });
  const panelEl = el("div", { class: "comic-panel" });
  host.append(dots, panelEl);

  let i = 0;

  function fallback(): HTMLElement {
    return el("div", { class: "comic-fallback", html: stickman() });
  }

  function renderDots(): void {
    clear(dots);
    s.panels.forEach((_, k) => {
      const d = el("i", { class: k === i ? "on" : k < i ? "past" : "" });
      dots.appendChild(d);
    });
  }

  function render(): void {
    const p = s.panels[i];
    const color = stageColor(p.stage);
    clear(panelEl);

    const prevBtn = el(
      "button",
      { class: "comic-prev", attrs: { type: "button", "aria-label": "이전 컷" } },
      el("span", { text: "‹ 이전 컷" }),
    ) as HTMLButtonElement;
    prevBtn.disabled = i === 0;
    prevBtn.addEventListener("click", () => {
      if (i === 0) return;
      i -= 1;
      haptic(HAPTIC.tap);
      render();
    });
    const head = el(
      "div",
      { class: "comic-head" },
      el("span", { class: "comic-badge", style: `--bc:${color}`, text: p.stage }),
      el(
        "span",
        { class: "comic-nav" },
        prevBtn,
        el("span", { class: "comic-count", text: `${i + 1} / ${s.panels.length}` }),
      ),
    );
    const title = el("div", { class: "comic-title", html: p.title });

    const art = el("div", { class: "comic-art" });
    if (p.img) {
      const img = el("img", { class: "comic-img", attrs: { src: base + p.img, alt: p.title, loading: "eager" } });
      img.addEventListener("error", () => {
        clear(art);
        art.classList.add("is-fallback");
        art.appendChild(fallback());
      });
      art.appendChild(img);
      // 말풍선 하이브리드 — 이미지 % 좌표에 얹는 HTML(로드 실패 시 clear(art)가 함께 걷어낸다).
      // wrap 변형: cut()의 nowrap 한 줄과 달리 만화 대사는 2줄까지 줄바꿈 허용(폰 폭 390 가독성).
      for (const b of p.bubbles ?? []) {
        art.appendChild(
          el("span", {
            class: `cut-bubble wrap${b.flip ? " flip" : ""}`,
            style: `left:${b.x}%;top:${b.y}%`,
            html: b.text,
          }),
        );
      }
    } else {
      art.classList.add("is-fallback");
      art.appendChild(fallback());
    }

    const cap = el("div", { class: "comic-caption", html: p.caption });
    panelEl.append(head, title, art, cap);
    if (p.term) panelEl.appendChild(renderBlock({ k: "term", name: p.term.name, def: p.term.def, icon: "bulb" }));

    // reflow 후 .in 부여 — rAF에 의존하지 않고 항상 보이면서 전환 애니메이션도 재생.
    panelEl.classList.remove("in");
    void panelEl.offsetWidth;
    panelEl.classList.add("in");
    renderDots();

    const last = i === s.panels.length - 1;
    api.setCTA(last ? (s.cta ?? "개념 정리하기") : "다음 컷", {
      enabled: true,
      onClick: last ? api.next : advance,
      pop: true,
    });
  }

  function advance(): void {
    if (i < s.panels.length - 1) {
      i += 1;
      haptic(HAPTIC.select);
      render();
    }
  }

  render();
};
