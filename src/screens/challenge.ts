// 도전 탭 — 랭킹(준비 중)과 게임 섹션 "쉬는 시간"(2026-07-19 사용자 확정 — '미니게임' 라벨 폐기,
// 탭 부제 "게임으로 쉬어 가는 곳"과 맞물리는 학교 어휘).
// 게임은 지도 노드에서 이사 왔다(단원 지도는 학습 서사만). 단열 디펜스는 폐기(2026-07-17 사용자
// 확정 — minigame.ts 삭제), 별자리 한붓그리기도 폐기(2026-07-19 사용자 확정 — starGame.ts 삭제).
// 열린 게임 = 코스모 머지·스텝 러시·레이저 미로·네온 한붓그리기(2026-07-20 사용자 확정 순서) —
// 프리미엄 게이트는 main.ts openStepRush/openCosmoMerge/openOneStroke/openLaserMaze가 소유.
// **입장료(2026-07-20 사용자 확정)**: 게임을 열 때마다 보유 스텝(totalXp)에서 GAME_FEE를 차감 —
// 학습으로 번 스텝이 쉬는 시간의 입장권이 되는 루프. 잔고에서만 빠지고 누적 스텝(장화 레벨)은
// 그대로다(spendXp 규약). 검토 모드는 면제(잠금 전부 해제와 같은 결 — QA·e2e 경로).
// **일일 상한(2026-07-20 사용자 확정 15판)**: 전 게임 합산 하루 PLAY_CAP회 입장 — 학교 쉬는 시간이
// 끝나듯 앱이 스스로 멈춰 주는 장치(잔고 부자의 폭식 방지 + 학부모 신뢰). 기기 저장(game.dailyPlays,
// srx.daily 문법)·자정 리셋. 검토 모드 면제, 소진 시 스낵 + 헤더 카운터가 done 스타일로 전환.
// 순서: ① 페이월 게이트(비프리미엄 → main.ts가 페이월) ② 상한 확인 ③ 입장료 차감 ④ 판수 기록 —
// 요금을 게이트·상한보다 먼저 걷으면 못 들어갈 유저의 스텝을 훔치게 되니 순서를 바꾸지 말 것.
// 랭킹은 서버 검증 채점(+검토 모드 우회 제거)이 선행 조건이라 자리만 잡는다.

import { el } from "../core/dom";
import { gameIcon, icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { getState, spendXp, isPremium, isReviewMode } from "../core/store";
import { gnav, type GnavKey } from "../ui/gnav";
import type { Screen } from "../core/router";

/** 게임 1회 입장 스텝 — 레슨 한 번(약 100~160스텝)으로 5~8판 놀 수 있는 수준. */
export const GAME_FEE = 20;
/** 하루 입장 상한(전 게임 합산) — 쉬는 시간은 끝나는 시간이 있다. */
export const PLAY_CAP = 15;

const PLAYS_KEY = "game.dailyPlays"; // { d: "YYYY-MM-DD", n } — 기기 저장, 날짜가 바뀌면 자동 0
function dayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function playsToday(): number {
  try {
    const v = JSON.parse(localStorage.getItem(PLAYS_KEY) ?? "null") as { d?: string; n?: number } | null;
    return v && v.d === dayKey() ? Math.max(0, v.n ?? 0) : 0;
  } catch {
    return 0;
  }
}
function countPlay(): void {
  try {
    localStorage.setItem(PLAYS_KEY, JSON.stringify({ d: dayKey(), n: playsToday() + 1 }));
  } catch {
    /* 저장 실패는 무시 — 다음 판에 다시 센다 */
  }
}

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

  // 열려 있는 실카드 — 비프리미엄에게만 크라운, 모두에게 입장료 필을 보인다.
  // 이미 이용 중인 사람에게 구매 배지를 반복하면 잠긴 카드처럼 읽히므로 감춘다.
  function gameCard(
    id: string,
    tone: "cosmo" | "rush" | "laser" | "stroke",
    art: Parameters<typeof gameIcon>[0],
    title: string,
    desc: string,
    onPlay?: () => void,
  ): HTMLElement {
    const card = el(
      "button",
      { class: `prep-card accent game-tile ${tone}`, attrs: { id } },
      el(
        "span",
        { class: "prep-tx" },
        el(
          "b",
          {},
          el("span", { class: "game-title-icon", html: gameIcon(art, 22) }),
          el("span", { text: title }),
        ),
        el("span", { class: "prep-desc", text: desc }),
        el(
          "span",
          { class: "game-meta" },
          !isPremium() ? el("i", { class: "prep-pill gold", html: `${icon("crown", 10)}<span>프리미엄</span>` }) : null,
          el("i", { class: "prep-pill fee", html: `${icon("footstep", 10)}<span>입장료 ${GAME_FEE} 스텝</span>` }),
        ),
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
      // ② 검토 모드 면제 → ③ 일일 상한 → ④ 입장료 차감 + 판수 기록(상한을 요금보다 먼저 —
      //    막힐 판에 스텝부터 걷지 않는다)
      if (!isReviewMode()) {
        if (playsToday() >= PLAY_CAP) {
          snack("오늘 쉬는 시간은 끝났어요 — 내일 다시 열려요!");
          return;
        }
        if (!spendXp(GAME_FEE)) {
          snack(`스텝이 ${GAME_FEE} 필요해요 — 레슨을 완주하면 스텝이 쌓여요!`);
          return;
        }
        countPlay();
      }
      onPlay();
    });
    return card;
  }

  // 쉬는 시간 헤더 — 섹션 제목 강조판(2026-07-20 사용자 피드백): 배지형 타이틀 + 보유 스텝 잔고 +
  // 오늘 판수 카운터 + 입장 규칙 한 줄. 화면이 탭 전환마다 새로 그려져 잔고·판수는 항상 최신이다.
  const played = Math.min(playsToday(), PLAY_CAP);
  const capLeft = played < PLAY_CAP;
  const playHead = el(
    "div",
    { class: "play-head" },
    el(
      "span",
      { class: "play-title" },
      el("span", { class: "play-title-ic", html: icon("sparkle", 14) }),
      el("span", { text: "쉬는 시간" }),
    ),
    el(
      "span",
      { class: "play-chips" },
      el("span", { class: "play-bal", html: `${icon("footstep", 12)}<span>내 스텝 <b>${getState().totalXp.toLocaleString()}</b></span>` }),
      el("span", { class: `play-cnt ${capLeft ? "" : "done"}`, text: `오늘 ${played}/${PLAY_CAP}판` }),
    ),
  );
  const playNote = el("div", {
    class: "play-note",
    text: capLeft
      ? `레슨·시험에서 모은 스텝으로 입장해요. 하루 ${PLAY_CAP}판까지, 잔고만 차감되고 장화 레벨은 그대로예요.`
      : `오늘 ${PLAY_CAP}판을 모두 이용했어요. 내일 다시 열려요.`,
  });

  const gameGrid = el(
    "div",
    { class: "game-grid", attrs: { "aria-label": "미니게임" } },
    gameCard("btn-cosmo", "cosmo", "sun", "태양 만들기", "천체를 합쳐 태양 만들기에 도전하고 태양계를 알아보자!", o.onPlayCosmo),
    gameCard("btn-steprush", "rush", "footsteps", "스텝 러시", "무한 계단을 빠르게 오르면서 대기권의 구조를 알아보자!", o.onPlayStepRush),
    gameCard("btn-lasermaze", "laser", "laser", "레이저 미로", "반사의 원리를 이용해 블록을 옮겨 레이저를 통과시켜라!", o.onPlayLaserMaze),
    gameCard("btn-onestroke", "stroke", "neonStar", "네온 한붓그리기", "제한 시간 내에 한 붓으로 네온 사인의 빛을 모두 켜 보자!", o.onPlayOneStroke),
  );

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
      el("div", { class: "sub", text: "나의 랭킹을 확인하고, 게임으로 쉬어 가는 곳" }),
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
        gameGrid,
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
