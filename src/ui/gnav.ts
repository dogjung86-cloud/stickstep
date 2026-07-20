// 하단 글로벌 탭바 — 학습(홈)·과목·복습·도전·마이 5개 최상위 화면 공용(2026-07-12 IA 개편,
// 과목 탭 신설 2026-07-20 사용자 확정 — 홈 앱바 좌상단 subj-box 단독 진입은 발견성이 나빠 폐기).
// 탭 전환은 main.ts의 goTab(nav.reset)이 담당 — 여기서는 콜백만 쏜다. 활성 탭 재탭은 무시.
// 마이 탭 아이콘 = 로그인 시 내 아바타 원형 미니(2026-07-16 프로필 진입 단일화 — 우상단
// 프로필 버튼이 하던 로그인 상태 표시·아바타 노출을 이 아이콘이 흡수, 인스타·유튜브 You 탭 패턴).
// gnav는 화면마다 새로 그려져 렌더 시점 상태 반영이 기본 — 아바타 픽커 직후의 즉시 갱신만
// refreshGnavMyIcon(마이 화면 콜백)이 보조한다. e2e 계약: .gnav-item 구조·.gnav-tx 라벨 불변.

import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { getState } from "../core/store";
import { currentUser } from "../core/auth";
import { profileAvatar } from "./avatar";

export type GnavKey = "home" | "subjects" | "review" | "challenge" | "my";

const ITEMS: { key: GnavKey; label: string; ic: Parameters<typeof icon>[0] }[] = [
  { key: "home", label: "학습", ic: "route" },
  { key: "subjects", label: "과목", ic: "grid" }, // 런처형 탭 — 과목을 고르면 학습 탭으로 점프(main.ts pickSubject)
  { key: "review", label: "복습", ic: "book" },
  { key: "challenge", label: "도전", ic: "trophy" },
  { key: "my", label: "마이", ic: "user" },
];

/** 마이 탭 아이콘 채우기 — 로그인이면 내 아바타 미니(≈21px 원형), 로그아웃이면 user 아이콘. */
function fillMyIcon(host: HTMLElement): void {
  if (currentUser()) {
    const s = getState();
    const ava = profileAvatar(s.avatarId, s.avatarCustom, s.avatarPreset);
    ava.classList.add("gnav-ava");
    host.replaceChildren(ava);
  } else {
    host.innerHTML = icon("user", 21);
  }
}

/** 마이 탭 아이콘 즉시 갱신 — 아바타 픽커·로그인 상태 변화 콜백용(bar = gnav가 반환한 요소). */
export function refreshGnavMyIcon(bar: HTMLElement): void {
  const host = bar.querySelector<HTMLElement>(".gnav-ic.my");
  if (host) fillMyIcon(host);
}

export function gnav(active: GnavKey, go: (k: GnavKey) => void): HTMLElement {
  const bar = el("nav", { class: "gnav", attrs: { "aria-label": "주 메뉴" } });
  for (const it of ITEMS) {
    const on = it.key === active;
    const ic = el("span", { class: `gnav-ic ${it.key === "my" ? "my" : ""}` });
    if (it.key === "my") fillMyIcon(ic);
    else ic.innerHTML = icon(it.ic, 21);
    const b = el(
      "button",
      { class: `gnav-item ${on ? "on" : ""}`, attrs: on ? { "aria-current": "page" } : {} },
      ic,
      el("span", { class: "gnav-tx", text: it.label }),
    );
    b.addEventListener("click", () => {
      if (it.key === active) return;
      haptic(HAPTIC.tap);
      go(it.key);
    });
    bar.appendChild(b);
  }
  return bar;
}
