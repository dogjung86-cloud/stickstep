// 마이 탭 — 프로필(스틱맨 아바타 + 장화 레벨)·스텝 요약·스텝 장화 레벨(접이식 단계표, 레벨 숫자 미표기)·계정 진입(2026-07-12 IA 개편).
// 소셜 프로필 사진은 쓰지 않는다(미성년 개인정보) — 아바타는 학생 캐릭터 중 선택(store.avatarId,
// 선생님 5종은 저장 호환용일 뿐 픽커 미노출). 개인정보처리방침은 큰 행 대신 하단 스몰 프린트(계정
// 관리 화면에도 진입이 있음), 사업자 표기는 brand.BIZ_INFO가 채워지면 같은 자리에 줄이 생긴다.
// 장화 레벨은 누적 스텝(lifeXp) 기준이라 미니게임 입장료 소비로는 내려가지 않는다.

import { el, clear } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { getState, currentStreak, setAvatarId, setAvatarCustom } from "../core/store";
import { onAuthChange } from "../core/auth";
import { BIZ_INFO } from "../core/brand";
import { bootLevel, BOOT_TIERS } from "../core/level";
import { bootArt } from "../ui/boots";
import { profileAvatar, setProfileAvatar, profileIdOf, PROFILE_COUNT, PROFILE_PICK_START } from "../ui/avatar";
import { STICK_SLOTS, DEFAULT_STICK, normStick, stickAvatarSvg } from "../ui/stickParts";
import { gnav, type GnavKey } from "../ui/gnav";
import type { Screen } from "../core/router";

export function myScreen(o: {
  onTab: (k: GnavKey) => void;
  onOpenAccount: () => void;
  onOpenPaywall: () => void;
  onOpenPolicy: () => void;
}): Screen {
  const st = getState();
  const lv = bootLevel(st.lifeXp);

  // ---- 프로필 ----
  const bigAva = profileAvatar(st.avatarId, st.avatarCustom);
  function refreshBig(): void {
    const s = getState();
    setProfileAvatar(bigAva, s.avatarId, s.avatarCustom);
  }
  const nameEl = el("div", { class: "my-name", text: "게스트 스틱" });
  const badge = el("div", { class: "boot-badge" });
  // 레벨 숫자는 쓰지 않는다(총 14단계라 숫자가 작아 심심 — 장화 이름이 곧 등급, 사용자 확정 2026-07-12)
  badge.innerHTML = `${bootArt(lv.tier.id, 20)}<span>${lv.tier.name}</span>`;
  const prog = el("div", { class: "boot-prog" }, el("i", { style: `width:${Math.round(lv.progress * 100)}%` }));
  const progCap = el("div", {
    class: "boot-cap",
    text: lv.next ? `다음 ${lv.next.name}까지 ${lv.toNext.toLocaleString()}스텝` : "가장 높은 장화를 신었어요!",
  });
  const prof = el("div", { class: "my-prof" }, el("div", { class: "login-ava" }, bigAva), nameEl, badge, prog, progCap);

  // ---- 아바타 고르기: 캐릭터(발주 프리셋) ⇄ 직접 꾸미기(파츠 조합 스틱맨) ----
  // 프리셋을 고르면 커스텀이 풀리고(avatarCustom=null), 파츠를 만지면 커스텀이 대표가 된다.
  const pick = el("div", { class: "ava-pick" });
  function renderPick(): void {
    clear(pick);
    const s = getState();
    const cur = profileIdOf(s.avatarId);
    const usingPreset = !s.avatarCustom;
    for (let i = PROFILE_PICK_START; i < PROFILE_COUNT; i++) {
      const b = el("button", { class: `ava-opt ${usingPreset && cur === i ? "sel" : ""}`, attrs: { "aria-label": `아바타 ${i + 1}` } }, profileAvatar(i));
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        setAvatarCustom(null);
        setAvatarId(i);
        refreshBig();
        renderPick();
      });
      pick.appendChild(b);
    }
  }
  renderPick();

  const custom = el("div", { class: "ava-custom" });
  function renderCustom(): void {
    // 슬롯 행의 가로 스크롤 위치를 보존하면서 통째로 다시 그린다(다른 슬롯 미리보기도 함께 갱신돼야 해서).
    const scrolls = new Map<string, number>();
    custom.querySelectorAll<HTMLElement>(".avc-opts").forEach((row) => {
      scrolls.set(row.dataset.slot ?? "", row.scrollLeft);
    });
    clear(custom);
    const cfg = normStick(getState().avatarCustom ?? DEFAULT_STICK);
    for (const slot of STICK_SLOTS) {
      const opts = el("div", { class: "avc-opts", attrs: { "data-slot": slot.key } });
      slot.parts.forEach((p, i) => {
        const b = el("button", {
          class: `avc-opt ${cfg[slot.key] === i ? "sel" : ""}`,
          attrs: { "aria-label": `${slot.label}: ${p.name}`, title: p.name },
        });
        b.innerHTML = stickAvatarSvg({ ...cfg, [slot.key]: i });
        b.addEventListener("click", () => {
          haptic(HAPTIC.tap);
          setAvatarCustom({ ...normStick(getState().avatarCustom ?? DEFAULT_STICK), [slot.key]: i });
          refreshBig();
          renderCustom();
        });
        opts.appendChild(b);
      });
      custom.appendChild(el("div", { class: "avc-row" }, el("div", { class: "avc-label", text: slot.label }), opts));
      opts.scrollLeft = scrolls.get(slot.key) ?? 0;
    }
  }

  // 모드 세그 — 저장 상태가 진실(커스텀이 있으면 커스텀 탭에서 시작)
  let mode: "preset" | "custom" = st.avatarCustom ? "custom" : "preset";
  const presetBtn = el("button", { class: "avm", text: "캐릭터 고르기", attrs: { role: "tab" } });
  const customBtn = el("button", { class: "avm", text: "직접 꾸미기", attrs: { role: "tab" } });
  const modeSeg = el("div", { class: "ava-mode", attrs: { role: "tablist", "aria-label": "아바타 방식" } }, presetBtn, customBtn);
  function applyMode(): void {
    presetBtn.classList.toggle("on", mode === "preset");
    customBtn.classList.toggle("on", mode === "custom");
    presetBtn.setAttribute("aria-selected", String(mode === "preset"));
    customBtn.setAttribute("aria-selected", String(mode === "custom"));
    pick.classList.toggle("hidden", mode !== "preset");
    custom.classList.toggle("hidden", mode !== "custom");
  }
  presetBtn.addEventListener("click", () => {
    if (mode === "preset") return;
    haptic(HAPTIC.tap);
    mode = "preset";
    renderPick();
    applyMode();
  });
  customBtn.addEventListener("click", () => {
    if (mode === "custom") return;
    haptic(HAPTIC.tap);
    mode = "custom";
    // 처음 들어오면 기본 조합으로 시작 — 이 순간부터 커스텀이 대표 아바타가 된다.
    if (!getState().avatarCustom) {
      setAvatarCustom({ ...DEFAULT_STICK });
      refreshBig();
      renderPick();
    }
    renderCustom();
    applyMode();
  });
  if (mode === "custom") renderCustom();
  applyMode();

  // ---- 스텝 요약 ----
  const stats = el(
    "div",
    { class: "my-stats" },
    el("div", { class: "my-stat" }, el("b", { text: st.lifeXp.toLocaleString() }), el("span", { text: "누적 스텝" })),
    el("div", { class: "my-stat" }, el("b", { text: st.totalXp.toLocaleString() }), el("span", { text: "보유 스텝" })),
    el("div", { class: "my-stat" }, el("b", { text: `${currentStreak()}일` }), el("span", { text: "연속 학습" })),
  );

  // ---- 스텝 레벨(장화 단계표) — 기본 접힘, 헤더 탭으로 펼치기 ----
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
  const dexToggle = el(
    "button",
    { class: "bdex-toggle", attrs: { "aria-expanded": "false" } },
    el("span", { class: "bdex-tg-art", html: bootArt(lv.tier.id, 22) }),
    el("span", { class: "bdex-tg-t", text: "스텝 장화 레벨" }),
    el("span", { class: "bdex-tg-s", text: lv.tier.name }),
    el("span", { class: "bdex-tg-chev", html: icon("chevronDown", 16) }),
  );
  dexToggle.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    const open = dex.classList.toggle("open");
    dexToggle.classList.toggle("open", open);
    dexToggle.setAttribute("aria-expanded", String(open));
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

  // ---- 하단 법적 고지(스몰 프린트) — 방침 링크 + 사업자 표기(BIZ_INFO 채워지면 줄 생성) ----
  const polBtn = el("button", { class: "legal-link", text: "개인정보처리방침" });
  polBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onOpenPolicy();
  });
  const legal = el("div", { class: "my-legal" }, polBtn);
  for (const line of BIZ_INFO) legal.appendChild(el("div", { class: "my-legal-line", text: line }));

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
        modeSeg,
        pick,
        custom,
        stats,
        dexToggle,
        dex,
        el("div", { class: "sec-head", text: "더 보기" }),
        row("user", "계정 관리 · 로그인", o.onOpenAccount),
        row("crown", "프리미엄", o.onOpenPaywall),
        row("book", "과제함", () => snack("학급·과제 기능은 준비 중이에요")),
        legal,
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
