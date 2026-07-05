// 개념 설명용 블록 렌더러 — 문단, 용어 카드, 노트, 콜아웃, 리스트, 그림.
// concept 스텝과 여러 랩에서 공용으로 쓴다.

import { el } from "../core/dom";
import { icon } from "../core/icons";

export type Tone = "gray" | "blue" | "bio" | "amber" | "violet";

export type Block =
  | { k: "p"; html: string }
  | { k: "term"; name: string; def: string; icon?: string }
  | { k: "note"; html: string; tone?: Tone }
  | { k: "callout"; icon?: string; title?: string; html: string; tone?: Tone }
  | { k: "list"; items: string[]; ordered?: boolean }
  | { k: "figure"; svg: string; cap?: string; dark?: boolean; flush?: boolean }
  | { k: "stats"; items: { v: string; label: string }[] };

export function renderBlocks(host: HTMLElement, blocks: Block[]): void {
  for (const b of blocks) host.appendChild(renderBlock(b));
}

export function renderBlock(b: Block): HTMLElement {
  switch (b.k) {
    case "p":
      return el("p", { class: "c-p", html: b.html });
    case "term":
      return el(
        "div",
        { class: "term-card" },
        el("div", { class: "term-ic", html: icon(b.icon ?? "bulb", 18) }),
        el(
          "div",
          {},
          el("div", { class: "term-name", html: b.name }),
          el("div", { class: "term-def", html: b.def }),
        ),
      );
    case "note":
      return el("div", { class: `c-note tone-${b.tone ?? "gray"}`, html: b.html });
    case "callout":
      return el(
        "div",
        { class: `c-callout tone-${b.tone ?? "blue"}` },
        el("div", { class: "c-callout-ic", html: icon(b.icon ?? "sparkle", 18) }),
        el(
          "div",
          {},
          b.title ? el("div", { class: "c-callout-title", text: b.title }) : el("span", {}),
          el("div", { class: "c-callout-body", html: b.html }),
        ),
      );
    case "list": {
      const list = el(b.ordered ? "ol" : "ul", { class: `c-list ${b.ordered ? "ol" : "ul"}` });
      for (const item of b.items) list.appendChild(el("li", { html: item }));
      return list;
    }
    case "figure": {
      const fig = el("div", { class: `c-figure ${b.dark ? "dark" : ""} ${b.flush ? "flush" : ""}` });
      fig.appendChild(el("div", { class: "c-figure-art", html: b.svg }));
      if (b.cap) fig.appendChild(el("div", { class: "c-figure-cap", html: b.cap }));
      return fig;
    }
    case "stats": {
      const grid = el("div", { class: "c-stats" });
      for (const s of b.items) {
        grid.appendChild(
          el("div", { class: "c-stat" }, el("div", { class: "c-stat-v", text: s.v }), el("div", { class: "c-stat-k", text: s.label })),
        );
      }
      return grid;
    }
  }
}
