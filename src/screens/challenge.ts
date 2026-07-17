// 도전 탭 — 랭킹(준비 중)과 미니게임 코너(2026-07-12 IA 개편).
// 미니게임은 지도 노드에서 이사 왔다(단원 지도는 학습 서사만). 단열 디펜스는 폐기(2026-07-17 사용자
// 확정 — minigame.ts 삭제), 간판 신작 '스텝 러시' 제작 중. 별자리 한붓그리기는 재단장 후
// main.ts에서 starGameScreen을 다시 연결한다.
// 랭킹은 서버 검증 채점(+검토 모드 우회 제거)이 선행 조건이라 자리만 잡는다.

import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { gnav, type GnavKey } from "../ui/gnav";
import type { Screen } from "../core/router";

export function challengeScreen(o: { onTab: (k: GnavKey) => void }): Screen {
  // premium: 미니게임은 프리미엄 콘텐츠로 재오픈 예정(2026-07-15 사용자 확정) — 닫힌 지금도
  // 골드 크라운을 함께 달아 가격 정책을 미리 알린다. 열 때 main.ts 게이트(openWeakDrill 문법)를 붙일 것.
  function prepCard(ic: Parameters<typeof icon>[0], title: string, desc: string, o2: { accent?: boolean; premium?: boolean } = {}): HTMLElement {
    const card = el(
      "button",
      { class: `prep-card ${o2.accent ? "accent" : ""}` },
      el("span", { class: "prep-ic", html: icon(ic, 20) }),
      el(
        "span",
        { class: "prep-tx" },
        el(
          "b",
          {},
          el("span", { text: title }),
          o2.premium ? el("i", { class: "prep-pill gold", html: `${icon("crown", 11)}<span>프리미엄</span>` }) : null,
          el("i", { class: "prep-pill", text: "준비 중" }),
        ),
        el("span", { class: "prep-desc", text: desc }),
      ),
    );
    card.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      snack("준비 중이에요 — 곧 열려요");
    });
    return card;
  }

  const elm = el(
    "section",
    { class: "screen tabscr", attrs: { id: "sc-challenge" } },
    el(
      "div",
      { class: "tab-head" },
      el("div", { class: "h1 sm", text: "도전" }),
      el("div", { class: "sub", text: "스텝으로 겨루고, 게임으로 쉬어 가는 곳이에요." }),
    ),
    el(
      "div",
      { class: "scroll" },
      el(
        "div",
        { class: "pad" },
        prepCard("trophy", "친구·우리 학교 랭킹", "같은 학교 친구들과 스텝으로 겨루는 주간 랭킹", { accent: true }),
        el("div", { class: "sec-head", text: "미니게임" }),
        prepCard("star", "별자리 한붓그리기", "서로소의 비밀로 별을 긋는 퍼즐", { premium: true }),
        el("div", { class: "tab-footnote", text: "미니게임은 새 단장 중이에요. 스텝을 걸고 더 재미있게 돌아올게요." }),
      ),
    ),
    gnav("challenge", o.onTab),
  );

  let snackTimer = 0;
  const snackEl = el("div", { class: "snack" });
  elm.appendChild(snackEl);
  function snack(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2000);
  }

  return { el: elm };
}
