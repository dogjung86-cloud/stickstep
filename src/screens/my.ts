// 마이 탭 — "프로필 카드 → 스텝 요약 → 메뉴" 한 화면 구성(2026-07-15 리디자인).
// 아바타 편집은 인라인 픽커 대신 바텀시트로 분리: 프로필 카드의 아바타(또는 연필 버튼)가 연다.
// 시트 본문은 ui/avatarEditor.ts(v2, 2026-11)가 그린다. '캐릭터 고르기'와 '직접 꾸미기'는 완전히
// 분리된 상태다. 프리셋을 골라도 내가 꾸민 조합(avatarCustom)은 남고, 파츠를 만지는 순간 커스텀이
// 대표가 된다(사용자 확정: 고른 캐릭터를 이어서 꾸미게 하지 않는다). 선택은 즉시 적용(앱 관례,
// 저장 버튼 없음. 시트의 '완료'는 닫기일 뿐). 스텝 장화 단계표도 같은 시트 문법으로 연다.
// 소셜 프로필 사진은 쓰지 않는다(미성년 개인정보). 하단에는 개인정보처리방침과 로그인 상태의
// 로그아웃만 작게 두고, 사업자 정보는 로그인 없이 볼 수 있는 공개 스플래시가 전담한다.

import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { getState, currentStreak, setNickname, isDesktopMode, setDesktopMode, isPremium } from "../core/store";
import { onAuthChange, currentUser, pushNickname, signOut } from "../core/auth";
import { ownedPremiumSubjectIds, SELLABLE_SUBJECTS } from "../core/purchase";
import { bootLevel, BOOT_TIERS } from "../core/level";
import { bootArt } from "../ui/boots";
import { profileAvatar, setProfileAvatar } from "../ui/avatar";
import { avatarEditor } from "../ui/avatarEditor";
import { gnav, refreshGnavMyIcon, type GnavKey } from "../ui/gnav";
import type { Screen } from "../core/router";

export function myScreen(o: {
  onTab: (k: GnavKey) => void;
  onOpenAccount: () => void;
  onOpenPaywall: (onUnlocked?: () => void) => void;
  onOpenPolicy: () => void;
  onOpenRefund: () => void;
}): Screen {
  const st = getState();
  const lv = bootLevel(st.lifeXp);

  // ---- 아바타(프로필 카드 + 탭바 마이 아이콘이 함께 갱신. 시트 미리보기는 편집기가 스스로 그린다) ----
  const bigAva = profileAvatar(st.avatarId, st.avatarCustom, st.avatarPreset);
  const avaFrame = el("div", { class: "mypf-ava" }, bigAva);
  const bar = gnav("my", o.onTab);
  function refreshAvatars(): void {
    const s = getState();
    setProfileAvatar(bigAva, s.avatarId, s.avatarCustom, s.avatarPreset);
    refreshGnavMyIcon(bar); // 로그인 상태면 탭바 아바타도 그 자리에서 바뀐다(재렌더 없이)
  }

  // ---- 프로필 카드 ----
  const editBtn = el("button", {
    class: "mypf-edit",
    attrs: { "aria-label": "아바타 꾸미기", "aria-haspopup": "dialog" },
    html: icon("pencil", 13),
  });
  // 닉네임은 계정 기능(2026-07-21 사용자 확정) — 비로그인은 항상 "게스트 스틱"(저장된 별명은
  // 로그인하면 복원). 로그아웃하면 이름도 게스트로 돌아가 로그인 여부가 이름만으로 구분된다.
  // 로그인 상태 이름 = 닉네임 우선(기기 저장) → 소셜 이름 → 기본. 연필 탭 → 닉네임 시트.
  const displayName = (): string => {
    const u = currentUser();
    if (!u) return "게스트 스틱";
    return getState().nickname ?? u.name ?? "스틱스텝 친구";
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
      el("div", { class: "mypf-avawrap" }, avaFrame, editBtn),
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

  /** doneLabel을 주면 닫기 X 대신 글자 버튼("완료")을 머리말에 둔다(풋 없이 본문을 끝까지 쓰는 시트용). */
  function sheetShell(title: string, body: HTMLElement, foot?: HTMLElement, doneLabel?: string): HTMLElement {
    const x = doneLabel
      ? el("button", { class: "mysheet-x txt", text: doneLabel })
      : el("button", { class: "mysheet-x", attrs: { "aria-label": "닫기" }, html: icon("x", 15) });
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

  // ---- 아바타 시트: 본문은 ui/avatarEditor(미리보기 무대 + 캐릭터 고르기 ⇄ 직접 꾸미기) ----
  // 선택은 즉시 저장되므로 저장 버튼은 없다. 머리말의 "완료"는 닫기일 뿐이고, 풋을 비운 만큼
  // 파츠 격자가 화면 아래까지 내려간다(폰 한 화면에서 세 줄 이상 보이게).
  const editor = avatarEditor(refreshAvatars);
  const avaSheet = sheetShell("아바타 꾸미기", editor.el, undefined, "완료");
  avaSheet.classList.add("ava");
  const openAvatarSheet = (): void => {
    haptic(HAPTIC.tap);
    editor.sync();
    openSheet(avaSheet, editBtn);
  };
  editBtn.addEventListener("click", openAvatarSheet);
  // 아바타 자체도 누르면 열린다(연필 27px보다 큰 과녁). 연필은 키보드·보조기기용 이름 있는 버튼으로 남긴다.
  avaFrame.addEventListener("click", openAvatarSheet);

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
  // 현재 결제 모델은 premium=true가 전 과목 권한이다. 새 DEV 구매는 선택 id를 함께 저장하고,
  // 구버전 구매자·운영 계정은 현재 판매 과목 전체를 표시해 빈 이용권처럼 보이지 않게 한다.
  function premiumSummary(): string {
    if (!isPremium()) return "";
    const ids = ownedPremiumSubjectIds();
    const groups = new Map<string, string[]>();
    for (const subject of SELLABLE_SUBJECTS) {
      if (!ids.includes(subject.id)) continue;
      const [grade, name] = subject.name.split(" ");
      if (!grade || !name) continue;
      groups.set(grade, [...(groups.get(grade) ?? []), name]);
    }
    const owned = [...groups].map(([grade, names]) => `${grade} ${names.join(" ")}`).join(" / ");
    return owned ? `이용중 / ${owned}` : "이용중";
  }
  const premiumRow = row({
    ic: icon("footstep", 17),
    gold: true,
    title: "프리미엄",
    value: premiumSummary(),
    onClick: () => o.onOpenPaywall(refreshPremiumRow),
  });
  premiumRow.classList.toggle("premium-active", isPremium());
  const premiumValue = premiumRow.querySelector<HTMLElement>(".my-row-v")!;
  function refreshPremiumRow(): void {
    premiumValue.textContent = premiumSummary();
    premiumRow.classList.toggle("premium-active", isPremium());
  }
  const menuRows: HTMLElement[] = [
    row({ ic: bootArt(lv.tier.id, 19), title: "스텝 장화 레벨", value: lv.tier.name, onClick: (b) => openSheet(bootSheet, b) }),
    premiumRow,
    row({ ic: icon("book", 17), title: "과제함", onClick: () => snack("학급·과제 기능은 준비 중이에요") }),
  ];
  // 넓은 화면 레이아웃(데스크톱 셸) 토글 — 행은 항상 만들고 CSS 미디어쿼리로 ≥1024px에서만 보인다.
  // 화면 생성 시점의 matchMedia 결과로 DOM 자체를 빼면, 창을 나중에 넓혀도 행이 안 생기는 버그가 난다.
  const desktopRow = row({
    ic: icon("monitor", 17),
    title: "넓은 화면 레이아웃(PC, 태블릿용)",
    value: isDesktopMode() ? "켜짐" : "꺼짐",
    onClick: (b) => {
      const on = !isDesktopMode();
      setDesktopMode(on);
      document.documentElement.classList.toggle("dt", on); // 저장 + 즉시 반영(재렌더 불필요 — 순수 CSS 재배치)
      const v = b.querySelector<HTMLElement>(".my-row-v");
      if (v) v.textContent = on ? "켜짐" : "꺼짐";
      snack(on ? "넓은 화면 레이아웃을 켰어요" : "폰 화면 보기로 돌아왔어요");
    },
  });
  desktopRow.classList.add("desktop-pref-row");
  menuRows.push(desktopRow);

  const accountRow = row({ ic: icon("user", 17), title: "계정 관리 · 로그인", onClick: () => o.onOpenAccount() });
  const accountTitle = accountRow.querySelector<HTMLElement>(".my-row-t")!;
  menuRows.push(accountRow);
  const menu = el("nav", { class: "my-menu", attrs: { "aria-label": "더 보기" } }, ...menuRows);

  // ---- 상단 뒤로가기(학습 탭 복귀, 2026-07-20 — 복습·도전 탭과 공통 문법) ----
  const backToHome = el("button", { class: "tab-back", attrs: { "aria-label": "학습 탭으로 돌아가기" }, html: icon("back", 19) });
  backToHome.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onTab("home");
  });

  // ---- 하단 법적 고지 — 사업자 정보는 공개 스플래시로 옮긴다. 로그인 상태에선 로그아웃을 함께 둔다. ----
  const polBtn = el("button", { class: "legal-link", text: "개인정보처리방침" });
  polBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onOpenPolicy();
  });
  const refundBtn = el("button", { class: "legal-link", text: "환불 정책" });
  refundBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onOpenRefund();
  });
  // 방침·환불 사이 구분점은 항상 표시 — legalSep은 로그아웃과 짝이라 signedIn 토글을 받는다(아래 onAuthChange).
  const polSep = el("span", { class: "my-legal-sep", text: "·", attrs: { "aria-hidden": "true" } });
  const legalSep = el("span", { class: "my-legal-sep", text: "·", attrs: { "aria-hidden": "true" } });
  const logoutBtn = el("button", { class: "legal-link my-logout", text: "로그아웃" }) as HTMLButtonElement;
  let logoutBusy = false;
  logoutBtn.addEventListener("click", () => {
    if (logoutBusy) return;
    logoutBusy = true;
    logoutBtn.disabled = true;
    haptic(HAPTIC.tap);
    void signOut().then(() => snack("로그아웃했어요. 기록은 이 기기에 그대로 남아요.")).finally(() => {
      logoutBusy = false;
      logoutBtn.disabled = false;
    });
  });
  const legal = el("div", { class: "my-legal" }, polBtn, polSep, refundBtn, legalSep, logoutBtn);

  const elm = el(
    "section",
    { class: "screen tabscr", attrs: { id: "sc-my" } },
    el(
      "div",
      { class: "tab-head" },
      el("div", { class: "tab-head-row" }, backToHome, el("div", { class: "h1 sm", text: "마이" })),
    ),
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
    const signedIn = !!currentUser();
    nameEl.textContent = displayName();
    nickBtn.classList.toggle("hidden", !signedIn); // 닉네임 편집은 로그인 전용(등록 즉시 1회 호출로 초기 상태도 처리)
    accountTitle.textContent = signedIn ? "계정 관리" : "계정 관리 · 로그인";
    refreshPremiumRow();
    logoutBtn.hidden = !signedIn;
    legalSep.hidden = !signedIn;
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
