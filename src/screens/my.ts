// 마이 탭 — 프로필(스틱맨 아바타 + 장화 레벨)·스텝 요약·장화 도감·계정 진입(2026-07-12 IA 개편).
// 소셜 프로필 사진은 쓰지 않는다(미성년 개인정보) — 아바타는 앱 스틱맨 중 선택(store.avatarId).
// 장화 레벨은 누적 스텝(lifeXp) 기준이라 미니게임 입장료 소비로는 내려가지 않는다.

import { el, clear } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { getState, currentStreak, setAvatarId } from "../core/store";
import { onAuthChange } from "../core/auth";
import { bootLevel, BOOT_TIERS } from "../core/level";
import { bootArt } from "../ui/boots";
import { profileAvatar, setProfileAvatar, profileIdOf, PROFILE_COUNT } from "../ui/avatar";
import { gnav, type GnavKey } from "../ui/gnav";
import type { Screen } from "../core/router";

export function myScreen(o: {
  onTab: (k: GnavKey) => void;
  onOpenAccount: () => void;
  onOpenPaywall: () => void;
}): Screen {
  const st = getState();
  const lv = bootLevel(st.lifeXp);

  // ---- 프로필 ----
  const bigAva = profileAvatar(st.avatarId);
  const nameEl = el("div", { class: "my-name", text: "게스트 스틱" });
  const badge = el("div", { class: "boot-badge" });
  badge.innerHTML = `${bootArt(lv.tier.id, 20)}<span>${lv.tier.name} · Lv.${lv.level}</span>`;
  const prog = el("div", { class: "boot-prog" }, el("i", { style: `width:${Math.round(lv.progress * 100)}%` }));
  const progCap = el("div", {
    class: "boot-cap",
    text: lv.next ? `다음 ${lv.next.name}까지 ${lv.toNext.toLocaleString()}스텝` : "가장 높은 장화를 신었어요!",
  });
  const prof = el("div", { class: "my-prof" }, el("div", { class: "login-ava" }, bigAva), nameEl, badge, prog, progCap);

  // ---- 아바타 고르기(선생님 5종 + 학생 캐릭터 발주본 — ui/avatar PROFILE 섹션이 자동 확장) ----
  const pick = el("div", { class: "ava-pick" });
  function renderPick(): void {
    clear(pick);
    const cur = profileIdOf(getState().avatarId);
    for (let i = 0; i < PROFILE_COUNT; i++) {
      const b = el("button", { class: `ava-opt ${cur === i ? "sel" : ""}`, attrs: { "aria-label": `아바타 ${i + 1}` } }, profileAvatar(i));
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        setAvatarId(i);
        setProfileAvatar(bigAva, i);
        renderPick();
      });
      pick.appendChild(b);
    }
  }
  renderPick();

  // ---- 스텝 요약 ----
  const stats = el(
    "div",
    { class: "my-stats" },
    el("div", { class: "my-stat" }, el("b", { text: st.lifeXp.toLocaleString() }), el("span", { text: "누적 스텝" })),
    el("div", { class: "my-stat" }, el("b", { text: st.totalXp.toLocaleString() }), el("span", { text: "보유 스텝" })),
    el("div", { class: "my-stat" }, el("b", { text: `${currentStreak()}일` }), el("span", { text: "연속 학습" })),
  );

  // ---- 장화 도감 ----
  const dex = el("div", { class: "bdex" });
  BOOT_TIERS.forEach((t, i) => {
    const got = st.lifeXp >= t.need;
    dex.appendChild(
      el(
        "div",
        { class: `bdex-row ${got ? "" : "locked"} ${t.id === lv.tier.id ? "on" : ""}` },
        el("span", { class: "bdex-art", html: bootArt(t.id, 26) }),
        el("span", { class: "bdex-name", text: t.name }),
        el("span", { class: "bdex-need", text: i === 0 ? "시작 장화" : `${t.need.toLocaleString()}스텝` }),
      ),
    );
  });

  // ---- 진입 행 ----
  function row(ic: Parameters<typeof icon>[0], title: string, onClick: () => void): HTMLElement {
    const r = el(
      "button",
      { class: "nb-entry" },
      el("span", { class: "nb-entry-ic", html: icon(ic, 18) }),
      el("span", { class: "nb-entry-t", text: title }),
      el("span", { class: "nb-entry-go", html: icon("chevron", 16) }),
    );
    r.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      onClick();
    });
    return r;
  }

  const elm = el(
    "section",
    { class: "screen tabscr", attrs: { id: "sc-my" } },
    el("div", { class: "tab-head" }, el("div", { class: "h1 sm", text: "마이" })),
    el(
      "div",
      { class: "scroll" },
      el(
        "div",
        { class: "pad" },
        prof,
        el("div", { class: "sec-head", text: "아바타 고르기" }),
        pick,
        stats,
        el("div", { class: "sec-head", text: "장화 도감" }),
        dex,
        el("div", { class: "sec-head", text: "더 보기" }),
        row("user", "계정 관리 · 로그인", o.onOpenAccount),
        row("crown", "프리미엄", o.onOpenPaywall),
        row("book", "과제함", () => snack("학급·과제 기능은 준비 중이에요")),
      ),
    ),
    gnav("my", o.onTab),
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

  const offAuth = onAuthChange((u) => {
    nameEl.textContent = u ? (u.name ?? "스틱스텝 친구") : "게스트 스틱";
  });

  return { el: elm, onExit: offAuth };
}
