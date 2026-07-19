// recap — 통일된 개념 정리 스텝. 스틱맨 쌤이 카드 몇 장으로 핵심을 정리한다.
// 모든 레슨의 "정리" 자리는 이 스텝 하나로 통일한다(표·긴 문단 나열 금지).
// 구성: 제목 → 스틱맨 말풍선 → 개념 카드(미니 일러스트 + 한 줄 핵심 + 예시 칩)
//       → (선택) 콜아웃 → 스틱맨 아웃트로.

import { el } from "../../core/dom";
import { icon } from "../../core/icons";
import { haptic, HAPTIC } from "../../core/haptics";
import { renderBlock, type Tone } from "../../ui/blocks";
import { stickAvatar } from "../../ui/avatar";
import type { StepRenderer } from "../types";

interface RecapCard {
  name: string;
  text: string; // 한두 문장 핵심(HTML)
  color?: string; // 카드 액센트
  art?: string; // 미니 일러스트 SVG(선택)
  examples?: string[]; // 예시 칩
  more?: string; // 카드를 탭하면 펼쳐지는 심화 설명(HTML) — 상식은 <span class="fun">…</span>
}

interface RecapStep {
  title: string;
  lead?: string;
  narrator?: string; // 스틱맨 말풍선(HTML)
  cards: RecapCard[];
  note?: { icon?: string; tone?: Tone; title?: string; html: string };
  outro?: string; // 아웃트로 말풍선(HTML)
  cta?: string;
}

export const recap: StepRenderer = (host, step, api) => {
  const s = step as unknown as RecapStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  host.appendChild(
    el(
      "div",
      { class: "comic-narrator" },
      el("div", { class: "comic-avatar" }, stickAvatar("smile")),
      el("div", { class: "comic-bubble", html: s.narrator ?? "오늘 배운 것, 카드로 정리했어요. 한 장씩 눈에 담아 봐요." }),
    ),
  );

  const cardsBox = el("div", { class: "rc-cards" });
  s.cards.forEach((c, i) => {
    const body = el("div", { class: "rc-body" });
    // 미니아트는 제목 줄 안에만(작게) — 옆 열로 세우면 본문·자세히까지 폭이 좁아져
    // 답답해진다(실사용 피드백 2026-07-10). 아트가 없으면 기존 색 점(rc-dot).
    body.appendChild(
      el(
        "div",
        { class: "rc-name" },
        c.art
          ? el("span", { class: "rc-art sm", html: c.art })
          : el("span", { class: "rc-dot", style: c.color ? `background:${c.color}` : "" }),
        el("span", { html: c.name }),
      ),
    );
    body.appendChild(el("div", { class: "rc-text", html: c.text }));
    if (c.examples?.length) {
      const ex = el("div", { class: "rc-ex" });
      // 기본은 textContent(부등식 예시의 raw < 안전) — 순환점(.cyd) 같은 span 마크업만 html로
      for (const e of c.examples) ex.appendChild(e.includes("<span") ? el("span", { html: e }) : el("span", { text: e }));
      body.appendChild(ex);
    }
    const card = el(
      "div",
      { class: "rc-card", style: `--rc:${c.color ?? "var(--blue)"};animation-delay:${i * 90}ms` },
      body,
    );
    // 더 알고 싶은 학생을 위한 펼침 — 카드(또는 '자세히' 버튼)를 탭하면 심화 설명이 열린다
    if (c.more) {
      card.classList.add("has-more");
      const toggleLabel = el("span", { text: "자세히" });
      const toggle = el(
        "button",
        { class: "rc-toggle", attrs: { type: "button", "aria-expanded": "false" } },
        toggleLabel,
        el("span", { class: "rc-chev", html: icon("chevronDown", 14) }),
      );
      body.appendChild(toggle);
      body.appendChild(el("div", { class: "rc-more", html: c.more }));
      card.addEventListener("click", () => {
        const open = card.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        toggleLabel.textContent = open ? "접기" : "자세히";
        haptic(HAPTIC.tap);
      });
    }
    cardsBox.appendChild(card);
  });
  host.appendChild(cardsBox);

  if (s.note) host.appendChild(renderBlock({ k: "callout", icon: s.note.icon, tone: s.note.tone, title: s.note.title, html: s.note.html }));

  host.appendChild(
    el(
      "div",
      { class: "rc-outro" },
      el("div", { class: "rc-outro-man" }, stickAvatar("cheer")),
      el("div", { class: "rc-outro-bubble", html: s.outro ?? "정리 끝! 이제 문제로 확인해 봐요. 틀려도 괜찮아요 — 틀린 문제가 오래 남거든요." }),
    ),
  );

  api.setCTA(s.cta ?? "문제 풀기", { enabled: true, onClick: api.next });
};
