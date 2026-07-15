// 마이 탭 — "프로필 카드 → 스텝 요약 → 메뉴" 한 화면 구성(2026-07-15 리디자인).
// 아바타 편집은 인라인 픽커 대신 바텀시트로 분리: 프로필 카드의 연필 버튼이 연다.
// 시트 안 '캐릭터 고르기'(파츠 프리셋)와 '직접 꾸미기'(파츠 조합)는 완전히 분리된 상태 —
// 프리셋을 골라도 내가 꾸민 조합(avatarCustom)은 남고, 파츠를 만지는 순간 커스텀이 대표가
// 된다(사용자 확정: 고른 캐릭터를 이어서 꾸미게 하지 않는다). 선택은 즉시 적용(앱 관례 —
// 저장 버튼 없음, 시트의 '완료'는 닫기일 뿐). 스텝 장화 단계표도 같은 시트 문법으로 연다.
// 소셜 프로필 사진은 쓰지 않는다(미성년 개인정보). 개인정보처리방침은 하단 스몰 프린트,
// 사업자 표기는 brand.BIZ_INFO가 채워지면 같은 자리에 줄이 생긴다.

import { el, clear } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { getState, currentStreak, setAvatarPreset, setAvatarCustom, setNickname } from "../core/store";
import { onAuthChange, currentUser, pushNickname } from "../core/auth";
import { BIZ_INFO } from "../core/brand";
import { bootLevel, BOOT_TIERS } from "../core/level";
import { bootArt } from "../ui/boots";
import { profileAvatar, setProfileAvatar } from "../ui/avatar";
import { STICK_SLOTS, STICK_PRESETS, DEFAULT_STICK, normStick, stickAvatarSvg } from "../ui/stickParts";
import { gnav, refreshGnavMyIcon, type GnavKey } from "../ui/gnav";
import type { Screen } from "../core/router";

export function myScreen(o: {
  onTab: (k: GnavKey) => void;
  onOpenAccount: () => void;
  onOpenPaywall: () => void;
  onOpenPolicy: () => void;
}): Screen {
  const st = getState();
  const lv = bootLevel(st.lifeXp);

  // ---- 아바타(프로필 카드 + 시트 미리보기 + 탭바 마이 아이콘이 함께 갱신) ----
  const bigAva = profileAvatar(st.avatarId, st.avatarCustom, st.avatarPreset);
  const preview = profileAvatar(st.avatarId, st.avatarCustom, st.avatarPreset);
  const bar = gnav("my", o.onTab);
  function refreshAvatars(): void {
    const s = getState();
    setProfileAvatar(bigAva, s.avatarId, s.avatarCustom, s.avatarPreset);
    setProfileAvatar(preview, s.avatarId, s.avatarCustom, s.avatarPreset);
    refreshGnavMyIcon(bar); // 로그인 상태면 탭바 아바타도 그 자리에서 바뀐다(재렌더 없이)
  }

  // ---- 프로필 카드 ----
  const editBtn = el("button", {
    class: "mypf-edit",
    attrs: { "aria-label": "아바타 꾸미기", "aria-haspopup": "dialog" },
    html: icon("pencil", 13),
  });
  // 이름 = 닉네임 우선(기기 저장) → 소셜 이름 → 기본(게스트 스틱). 연필 탭 → 닉네임 시트.
  const displayName = (): string => {
    const s = getState();
    const u = currentUser();
    return s.nickname ?? (u ? (u.name ?? "스틱스텝 친구") : "게스트 스틱");
  };
  const nameEl = el("div", { class: "my-name", text: displayName() });
  const nickBtn = el("button", {
    class: "mypf-nick-edit",
    attrs: { "aria-label": "닉네임 바꾸기", "aria-haspopup": "dialog" },
    html: icon("pencil", 11),
  });
  const badge = el("div", { class: "boot-badge" });
  // 레벨 숫자는 쓰지 않는다(총 14단계라 숫자가 작아 심심 — 장화 이름이 곧 등급, 사용자 확정 2026-07-12)
  badge.innerHTML = `${bootArt(lv.tier.id, 20)}<span>${lv.tier.name}</span>`;
  const prog = el("div", { class: "boot-prog" }, el("i", { style: `width:${Math.round(lv.progress * 100)}%` }));
  const progCap = el("div", { class: "boot-cap" });
  if (lv.next) {
    progCap.append(
      el("span", { html: `다음 <b>${lv.next.name}</b>까지` }),
      el("b", { text: `${lv.toNext.toLocaleString()}스텝 남음` }),
    );
  } else {
    progCap.append(el("span", { text: "가장 높은 장화를 신었어요!" }));
  }
  const prof = el(
    "section",
    { class: "my-prof", attrs: { "aria-label": "프로필" } },
    el(
      "div",
      { class: "mypf-top" },
      el("div", { class: "mypf-avawrap" }, el("div", { class: "mypf-ava" }, bigAva), editBtn),
      el("div", { class: "mypf-who" }, el("div", { class: "mypf-name-row" }, nameEl, nickBtn), badge),
    ),
    prog,
    progCap,
  );

  // ---- 스텝 요약 ----
  const stats = el(
    "section",
    { class: "my-stats", attrs: { "aria-label": "학습 현황" } },
    el("div", { class: "my-stat" }, el("b", { text: st.lifeXp.toLocaleString() }), el("span", { text: "누적 스텝" })),
    el("div", { class: "my-stat" }, el("b", { text: st.totalXp.toLocaleString() }), el("span", { text: "보유 스텝" })),
    el("div", { class: "my-stat" }, el("b", { text: `${currentStreak()}일` }), el("span", { text: "연속 학습" })),
  );

  // ---- 바텀시트 공통(스크림 하나를 아바타·장화 시트가 공유) ----
  const scrim = el("div", { class: "scrim" });
  let opened: HTMLElement | null = null;
  let opener: HTMLElement | null = null;
  function openSheet(sh: HTMLElement, from?: HTMLElement): void {
    opened = sh;
    opener = from ?? null;
    scrim.classList.add("open");
    sh.classList.add("open");
    sh.querySelector<HTMLElement>(".mysheet-x")?.focus({ preventScroll: true });
  }
  function closeSheet(): void {
    if (!opened) return;
    opened.classList.remove("open");
    opened = null;
    scrim.classList.remove("open");
    opener?.focus({ preventScroll: true });
    opener = null;
  }
  scrim.addEventListener("click", closeSheet);
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") closeSheet();
  };
  document.addEventListener("keydown", onKey);

  function sheetShell(title: string, body: HTMLElement, foot?: HTMLElement): HTMLElement {
    const x = el("button", { class: "mysheet-x", attrs: { "aria-label": "닫기" }, html: icon("x", 15) });
    x.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      closeSheet();
    });
    return el(
      "div",
      { class: "sheet mysheet", attrs: { role: "dialog", "aria-modal": "true", "aria-label": title } },
      el(
        "div",
        { class: "mysheet-card" },
        el("div", { class: "mysheet-grip", attrs: { "aria-hidden": "true" } }),
        el("div", { class: "mysheet-head" }, el("div", { class: "mysheet-title", text: title }), x),
        body,
        foot,
      ),
    );
  }

  // ---- 아바타 시트: 캐릭터 고르기 ⇄ 직접 꾸미기 ----
  // 시작 탭은 저장 상태가 진실(커스텀이 대표면 커스텀 탭). 탭을 구경만 해서는 대표가 안 바뀐다.
  let mode: "preset" | "custom" = st.avatarPreset == null && st.avatarCustom ? "custom" : "preset";
  const presetBtn = el("button", { class: "avm", text: "캐릭터 고르기", attrs: { role: "tab" } });
  const customBtn = el("button", { class: "avm", text: "직접 꾸미기", attrs: { role: "tab" } });
  const modeSeg = el("div", { class: "ava-mode", attrs: { role: "tablist", "aria-label": "꾸미기 방식" } }, presetBtn, customBtn);

  // 캐릭터 고르기 — 완성 캐릭터 프리셋. 골라도 내가 꾸민 조합은 그대로 남는다.
  const presetGrid = el("div", { class: "avp-grid", attrs: { role: "group", "aria-label": "캐릭터 프리셋" } });
  function renderPresets(): void {
    clear(presetGrid);
    const cur = getState().avatarPreset;
    STICK_PRESETS.forEach((p, i) => {
      const on = cur === i;
      const b = el("button", { class: `avp ${on ? "sel" : ""}`, attrs: { "aria-pressed": String(on) } });
      b.innerHTML = stickAvatarSvg(p.cfg) + `<span class="avp-name">${p.name}</span>`;
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        setAvatarPreset(i);
        refreshAvatars();
        renderPresets();
      });
      presetGrid.appendChild(b);
    });
  }

  // 직접 꾸미기 — 한 번에 한 카테고리(칩)씩. 썸네일 = 현재 조합에서 그 파츠만 바꾼 모습.
  let slotKey = STICK_SLOTS[0].key;
  const cats = el("div", { class: "avc-cats", attrs: { role: "tablist", "aria-label": "꾸미기 항목" } });
  const optGrid = el("div", { class: "avc-grid", attrs: { role: "group" } });
  const customPanel = el("div", { class: "avc-panel" }, cats, optGrid);
  const draft = () => normStick(getState().avatarCustom ?? DEFAULT_STICK);
  function renderCats(): void {
    clear(cats);
    for (const slot of STICK_SLOTS) {
      const on = slot.key === slotKey;
      const b = el("button", {
        class: `avc-cat ${on ? "on" : ""}`,
        text: slot.label,
        attrs: { role: "tab", "aria-selected": String(on) },
      });
      b.addEventListener("click", () => {
        if (slot.key === slotKey) return;
        haptic(HAPTIC.tap);
        slotKey = slot.key;
        renderCats();
        renderOptions();
      });
      cats.appendChild(b);
    }
  }
  function renderOptions(): void {
    clear(optGrid);
    const slot = STICK_SLOTS.find((s) => s.key === slotKey) ?? STICK_SLOTS[0];
    const cfg = draft();
    slot.parts.forEach((p, i) => {
      const on = cfg[slot.key] === i;
      const b = el("button", {
        class: `avc-opt ${on ? "sel" : ""}`,
        attrs: { "aria-label": `${slot.label}: ${p.name}`, title: p.name, "aria-pressed": String(on) },
      });
      b.innerHTML = stickAvatarSvg({ ...cfg, [slot.key]: i });
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        // 파츠를 만지는 순간 커스텀이 대표가 된다(setAvatarCustom이 프리셋을 해제).
        setAvatarCustom({ ...draft(), [slot.key]: i });
        refreshAvatars();
        renderOptions();
        renderPresets(); // 프리셋 선택 표시 해제 반영
      });
      optGrid.appendChild(b);
    });
  }

  function applyMode(): void {
    presetBtn.classList.toggle("on", mode === "preset");
    customBtn.classList.toggle("on", mode === "custom");
    presetBtn.setAttribute("aria-selected", String(mode === "preset"));
    customBtn.setAttribute("aria-selected", String(mode === "custom"));
    presetGrid.classList.toggle("hidden", mode !== "preset");
    customPanel.classList.toggle("hidden", mode !== "custom");
  }
  presetBtn.addEventListener("click", () => {
    if (mode === "preset") return;
    haptic(HAPTIC.tap);
    mode = "preset";
    renderPresets();
    applyMode();
  });
  customBtn.addEventListener("click", () => {
    if (mode === "custom") return;
    haptic(HAPTIC.tap);
    mode = "custom";
    renderCats();
    renderOptions();
    applyMode();
  });
  renderPresets();
  renderCats();
  renderOptions();
  applyMode();

  const doneBtn = el("button", { class: "mysheet-done", text: "완료" });
  doneBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    closeSheet();
  });
  const avaSheet = sheetShell(
    "아바타 꾸미기",
    el("div", { class: "mysheet-body" }, el("div", { class: "avs-preview", attrs: { "aria-hidden": "true" } }, preview), modeSeg, presetGrid, customPanel),
    el("div", { class: "mysheet-foot" }, doneBtn),
  );
  editBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    openSheet(avaSheet, editBtn);
  });

  // ---- 장화 레벨 시트(단계표) ----
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
  const bootSheet = sheetShell("스텝 장화 레벨", el("div", { class: "mysheet-body" }, dex));

  // ---- 닉네임 시트 ----
  const nickInput = el("input", {
    class: "nick-input",
    attrs: { type: "text", maxlength: "12", placeholder: "별명을 입력해 주세요", "aria-label": "닉네임", autocomplete: "off", enterkeyhint: "done" },
  }) as HTMLInputElement;
  const nickSave = el("button", { class: "mysheet-done", text: "저장" });
  function saveNick(): void {
    haptic(HAPTIC.tap);
    setNickname(nickInput.value);
    void pushNickname(getState().nickname); // 로그인 상태면 profiles.nickname에도 반영(아니면 no-op)
    nameEl.textContent = displayName();
    closeSheet();
    snack("이름을 바꿨어요");
  }
  nickSave.addEventListener("click", saveNick);
  nickInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveNick();
  });
  const nickSheet = sheetShell(
    "닉네임 바꾸기",
    el(
      "div",
      { class: "mysheet-body" },
      nickInput,
      el("div", { class: "nick-hint", text: "실명 대신 별명을 추천해요 · 최대 12자 · 비우면 기본 이름으로 돌아가요" }),
    ),
    el("div", { class: "mysheet-foot" }, nickSave),
  );
  nickBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    nickInput.value = getState().nickname ?? "";
    openSheet(nickSheet, nickBtn);
    nickInput.focus({ preventScroll: true }); // openSheet의 X 포커스를 입력으로 재지정(입력이 본론)
  });

  // ---- 메뉴(흰 카드 하나에 행 목록) ----
  function row(opts: { ic: string; gold?: boolean; title: string; value?: string; onClick: (btn: HTMLElement) => void }): HTMLElement {
    const r = el(
      "button",
      { class: "my-row" },
      el("span", { class: `my-row-ic ${opts.gold ? "gold" : ""}`, html: opts.ic }),
      el("span", { class: "my-row-t", text: opts.title }),
      el("span", { class: "my-row-v", text: opts.value ?? "" }),
      el("span", { class: "my-row-go", html: icon("chevron", 15) }),
    );
    r.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      opts.onClick(r);
    });
    return r;
  }
  const menu = el(
    "nav",
    { class: "my-menu", attrs: { "aria-label": "더 보기" } },
    row({ ic: bootArt(lv.tier.id, 19), title: "스텝 장화 레벨", value: lv.tier.name, onClick: (b) => openSheet(bootSheet, b) }),
    row({ ic: icon("footstep", 17), gold: true, title: "프리미엄", onClick: () => o.onOpenPaywall() }),
    row({ ic: icon("book", 17), title: "과제함", onClick: () => snack("학급·과제 기능은 준비 중이에요") }),
    row({ ic: icon("user", 17), title: "계정 관리 · 로그인", onClick: () => o.onOpenAccount() }),
  );

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
    el("div", { class: "scroll" }, el("div", { class: "pad" }, prof, stats, menu, legal)),
    bar,
    scrim,
    avaSheet,
    bootSheet,
    nickSheet,
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

  const offAuth = onAuthChange(() => {
    nameEl.textContent = displayName();
    refreshGnavMyIcon(bar); // 로그인·로그아웃 즉시 탭바 아이콘도 아바타 ⇄ user로 전환
  });

  return {
    el: elm,
    onExit: () => {
      offAuth();
      document.removeEventListener("keydown", onKey);
    },
  };
}
