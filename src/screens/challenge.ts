// 도전 탭 — 랭킹(준비 중)과 미니게임 코너(2026-07-12 IA 개편).
// 미니게임은 지도 노드에서 이사 왔다(단원 지도는 학습 서사만). 단열 디펜스는 폐기(2026-07-17 사용자
// 확정 — minigame.ts 삭제). 열린 게임 = 스텝 러시(간판)·코스모 머지(수박게임 문법 천체 합체,
// 2026-07-18 신작)·네온 한붓그리기(오일러 도형 스테이지 퍼즐, 2026-07-18 신작)·별자리
// 한붓그리기(2026-07-18 재연결) — 프리미엄 게이트는 main.ts openStepRush/openCosmoMerge/
// openOneStroke/openStarGame이 소유하고 이 카드는 콜백만 부른다.
// 랭킹은 서버 검증 채점(+검토 모드 우회 제거)이 선행 조건이라 자리만 잡는다.

import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { gnav, type GnavKey } from "../ui/gnav";
import type { Screen } from "../core/router";

export function challengeScreen(o: {
  onTab: (k: GnavKey) => void;
  onPlayStepRush?: () => void;
  onPlayStarGame?: () => void;
  onPlayCosmo?: () => void;
  onPlayOneStroke?: () => void;
}): Screen {
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

  // 열려 있는 실카드(준비 중 아님) — 크라운은 가격 정책 표시, 게이트는 main.ts 몫.
  function gameCard(id: string, ic: Parameters<typeof icon>[0], title: string, desc: string, onPlay?: () => void, accent = false): HTMLElement {
    const card = el(
      "button",
      { class: `prep-card ${accent ? "accent" : ""}`, attrs: { id } },
      el("span", { class: "prep-ic", html: icon(ic, 20) }),
      el(
        "span",
        { class: "prep-tx" },
        el(
          "b",
          {},
          el("span", { text: title }),
          el("i", { class: "prep-pill gold", html: `${icon("crown", 11)}<span>프리미엄</span>` }),
        ),
        el("span", { class: "prep-desc", text: desc }),
      ),
    );
    card.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      if (onPlay) onPlay();
      else snack("준비 중이에요 — 곧 열려요");
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
        gameCard("btn-steprush", "footstep", "스텝 러시", "두 버튼으로 무한 계단을 오르는 반사신경 게임", o.onPlayStepRush, true),
        gameCard("btn-cosmo", "globe", "코스모 머지", "우주먼지부터 태양까지, 같은 천체를 합쳐 키우는 낙하 퍼즐", o.onPlayCosmo, true),
        gameCard("btn-onestroke", "route", "네온 한붓그리기", "네온사인을 손 떼지 않고 한 붓에 켜는 퍼즐, 판이 오를수록 어려워요", o.onPlayOneStroke),
        gameCard("btn-stargame", "star", "별자리 한붓그리기", "서로소의 비밀로 별을 한 붓에 긋는 퍼즐", o.onPlayStarGame),
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
