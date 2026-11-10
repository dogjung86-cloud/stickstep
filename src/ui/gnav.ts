// 하단 글로벌 탭바: 학습(홈)·과목·복습·도전·마이 최상위 화면 공용(2026-07-12 IA 개편,
// 과목 탭 신설 2026-07-20 사용자 확정 — 홈 앱바 좌상단 subj-box 단독 진입은 발견성이 나빠 폐기).
// 과목 탭은 지금 닫혀 있다(2026-11-11 사용자 확정, store.hasSubjectChoice). 공개된 과목이 과학 하나라
// 일반 사용자와 운영 계정 모두 탭이 넷(학습·복습·도전·마이)이고, 검토 모드와 dev에서만 다섯이다.
// 탭 전환은 main.ts의 goTab(nav.reset)이 담당 — 여기서는 콜백만 쏜다. 활성 탭 재탭은 무시.
// 마이 탭 아이콘 = 로그인 시 내 아바타 원형 미니(2026-07-16 프로필 진입 단일화 — 우상단
// 프로필 버튼이 하던 로그인 상태 표시·아바타 노출을 이 아이콘이 흡수, 인스타·유튜브 You 탭 패턴).
// gnav는 화면마다 새로 그려져 렌더 시점 상태 반영이 기본이다. 아바타 픽커 직후의 즉시 갱신만
// refreshGnavMyIcon(마이 화면 콜백)이 보조하고, 탭 구성이 바뀌는 순간(검토 모드 토글)은
// refreshGnav가 떠 있는 탭바를 그 자리에서 다시 그린다.
// e2e 계약: .gnav-item 구조·.gnav-tx 라벨 불변.

import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { getState, hasSubjectChoice } from "../core/store";
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

/** 마이 탭 아이콘 채우기: 로그인이면 내 아바타 미니(≈21px 원형), 로그아웃이면 user 아이콘.
 *  21px에는 상반신이 아니라 얼굴 확대("head")를 넣는다(2026-11, 상반신 축소는 얼굴이 뭉개졌다). */
function fillMyIcon(host: HTMLElement): void {
  if (currentUser()) {
    const s = getState();
    const ava = profileAvatar(s.avatarId, s.avatarCustom, s.avatarPreset, "head");
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

/** 탭바마다 "어느 탭이 켜져 있고 누르면 어디로 가는지"를 기억해 둔다(refreshGnav가 다시 그릴 때 쓴다). */
const BARS = new WeakMap<HTMLElement, { active: GnavKey; go: (k: GnavKey) => void }>();

function fill(bar: HTMLElement): void {
  const ctx = BARS.get(bar);
  if (!ctx) return;
  bar.replaceChildren();
  for (const it of ITEMS) {
    if (it.key === "subjects" && !hasSubjectChoice()) continue; // 과목 탭이 닫혀 있으면 건너뛴다
    const on = it.key === ctx.active;
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
      if (it.key === ctx.active) return;
      haptic(HAPTIC.navTap); // 8ms tap은 실기기에서 안 느껴져 격상(2026-07-21)
      ctx.go(it.key);
    });
    bar.appendChild(b);
  }
}

export function gnav(active: GnavKey, go: (k: GnavKey) => void): HTMLElement {
  const bar = el("nav", { class: "gnav", attrs: { "aria-label": "주 메뉴" } });
  BARS.set(bar, { active, go });
  fill(bar);
  return bar;
}

/** 탭 구성이 바뀌었을 때 화면에 떠 있는 탭바를 그 자리에서 다시 그린다.
 *  과목 탭이 열리고 닫히는 순간(검토 모드 토글)에 부른다. */
export function refreshGnav(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".gnav").forEach(fill);
}
