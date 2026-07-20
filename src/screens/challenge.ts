// 도전 탭 — 랭킹(준비 중)과 게임 섹션 "쉬는 시간"(2026-07-19 사용자 확정 — '미니게임' 라벨 폐기,
// 탭 부제 "게임으로 쉬어 가는 곳"과 맞물리는 학교 어휘).
// 게임은 지도 노드에서 이사 왔다(단원 지도는 학습 서사만). 단열 디펜스는 폐기(2026-07-17 사용자
// 확정 — minigame.ts 삭제), 별자리 한붓그리기도 폐기(2026-07-19 사용자 확정 — starGame.ts 삭제).
// 열린 게임 = 코스모 머지·스텝 러시·레이저 미로·네온 한붓그리기(2026-07-20 사용자 확정 순서) —
// 프리미엄 게이트는 main.ts openStepRush/openCosmoMerge/openOneStroke/openLaserMaze가 소유.
// **입장료(2026-07-20 사용자 확정)**: 게임을 열 때마다 보유 스텝(totalXp)에서 GAME_FEE를 차감 —
// 학습으로 번 스텝이 쉬는 시간의 입장권이 되는 루프. 잔고에서만 빠지고 누적 스텝(장화 레벨)은
// 그대로다(spendXp 규약). 검토 모드는 면제(잠금 전부 해제와 같은 결 — QA·e2e 경로).
// 순서: ① 페이월 게이트(비프리미엄 → main.ts가 페이월) ② 입장료 차감 ③ 게임 오픈 —
// 요금을 게이트보다 먼저 걷으면 페이월행 유저의 스텝을 훔치게 되니 순서를 바꾸지 말 것.
// 판수 하드캡은 두지 않는다(입장료·잔고가 자연 제한 — 필요해지면 여기 상수 하나로 조절).
// 랭킹은 서버 검증 채점(+검토 모드 우회 제거)이 선행 조건이라 자리만 잡는다.

import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { getState, spendXp, isPremium, isReviewMode } from "../core/store";
import { gnav, type GnavKey } from "../ui/gnav";
import type { Screen } from "../core/router";

/** 게임 1회 입장 스텝 — 레슨 한 번(약 100~160스텝)으로 5~8판 놀 수 있는 수준. */
export const GAME_FEE = 20;

export function challengeScreen(o: {
  onTab: (k: GnavKey) => void;
  onPlayStepRush?: () => void;
  onPlayCosmo?: () => void;
  onPlayOneStroke?: () => void;
  onPlayLaserMaze?: () => void;
}): Screen {
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

  // 열려 있는 실카드 — 크라운(가격 정책)+입장 스텝 필. 아이콘은 전 카드 accent(회색이면 비활성으로 읽힌다).
  function gameCard(id: string, ic: Parameters<typeof icon>[0], title: string, desc: string, onPlay?: () => void): HTMLElement {
    const card = el(
      "button",
      { class: "prep-card accent", attrs: { id } },
      el("span", { class: "prep-ic", html: icon(ic, 20) }),
      el(
        "span",
        { class: "prep-tx" },
        el(
          "b",
          {},
          el("span", { text: title }),
          el("i", { class: "prep-pill gold", html: `${icon("crown", 11)}<span>프리미엄</span>` }),
          el("i", { class: "prep-pill fee", html: `${icon("footstep", 10)}<span>${GAME_FEE} 스텝</span>` }),
        ),
        el("span", { class: "prep-desc", text: desc }),
      ),
    );
    card.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      if (!onPlay) {
        snack("준비 중이에요 — 곧 열려요");
        return;
      }
      // ① 비프리미엄은 요금 없이 통과 — main.ts 게이트가 페이월을 띄운다
      if (!isPremium() && !isReviewMode()) {
        onPlay();
        return;
      }
      // ② 검토 모드 면제 → ③ 입장료 차감 후 오픈(부족하면 학습 유도 스낵)
      if (!isReviewMode() && !spendXp(GAME_FEE)) {
        snack(`스텝이 ${GAME_FEE} 필요해요 — 레슨을 완주하면 스텝이 쌓여요!`);
        return;
      }
      onPlay();
    });
    return card;
  }

  // 쉬는 시간 헤더 — 섹션 제목 강조판(2026-07-20 사용자 피드백): 배지형 타이틀 + 보유 스텝 잔고 +
  // 입장료 규칙 한 줄. 잔고는 화면이 탭 전환마다 새로 그려져 항상 최신이다.
  const playHead = el(
    "div",
    { class: "play-head" },
    el(
      "span",
      { class: "play-title" },
      el("span", { class: "play-title-ic", html: icon("sparkle", 14) }),
      el("span", { text: "쉬는 시간" }),
    ),
    el("span", { class: "play-bal", html: `${icon("footstep", 12)}<span>내 스텝 <b>${getState().totalXp.toLocaleString()}</b></span>` }),
  );
  const playNote = el("div", {
    class: "play-note",
    text: `레슨·시험에서 모은 스텝 ${GAME_FEE}으로 한 번 입장해요. 잔고에서만 빠지고, 장화 레벨(누적 스텝)은 줄지 않아요.`,
  });

  const elm = el(
    "section",
    { class: "screen tabscr", attrs: { id: "sc-challenge" } },
    el(
      "div",
      { class: "tab-head" },
      el(
        "div",
        { class: "tab-head-row" },
        el("button", { class: "tab-back", attrs: { "aria-label": "학습 탭으로 돌아가기" }, html: icon("back", 19) }),
        el("div", { class: "h1 sm", text: "도전" }),
      ),
      el("div", { class: "sub", text: "스텝으로 겨루고, 게임으로 쉬어 가는 곳이에요." }),
    ),
    el(
      "div",
      { class: "scroll" },
      el(
        "div",
        { class: "pad" },
        prepCard("trophy", "친구·우리 학교 랭킹", "같은 학교 친구들과 스텝으로 겨루는 주간 랭킹", { accent: true }),
        playHead,
        playNote,
        gameCard("btn-cosmo", "globe", "코스모 머지", "천체에 대해 배우면서 같은 천체를 합쳐 태양까지 키우는 낙하 퍼즐", o.onPlayCosmo),
        gameCard("btn-steprush", "footstep", "스텝 러시", "두 버튼으로 무한 계단을 오르는 반사신경 게임", o.onPlayStepRush),
        gameCard("btn-lasermaze", "reflect", "레이저 미로", "빛의 반사를 배우면서 블록을 옮겨 레이저를 보석까지 보내는 퍼즐", o.onPlayLaserMaze),
        gameCard("btn-onestroke", "route", "네온 한붓그리기", "네온사인을 손 떼지 않고 한 붓에 켜는 퍼즐", o.onPlayOneStroke),
      ),
    ),
    gnav("challenge", o.onTab),
  );
  elm.querySelector(".tab-back")?.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onTab("home");
  });

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
