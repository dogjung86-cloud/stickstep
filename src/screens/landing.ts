// 랜딩 — 첫 실행(비온보딩) 전용 관문(2026-07-12 IA 개편).
// "가치 먼저" 정책 유지: 프라이머리는 바로 시작하기(무로그인 둘러보기), 로그인은 보조.
// 재방문(onboarded)은 main.ts start()가 랜딩을 건너뛰고 바로 홈으로 간다.
// 학부모·선생님 공간은 후속 기능(학급 코드·대시보드) — 지금은 안내 스낵만.

import { el } from "../core/dom";
import { BRAND } from "../core/brand";
import { haptic, HAPTIC } from "../core/haptics";
import { stickAvatar } from "../ui/avatar";
import type { Screen } from "../core/router";

export function landingScreen(o: { onStart: () => void; onLogin: () => void }): Screen {
  const startBtn = el("button", { class: "btn", text: "바로 시작하기" });
  startBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onStart();
  });
  const loginBtn = el("button", { class: "ld-login", text: "로그인" });
  loginBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onLogin();
  });
  const teacherBtn = el("button", { class: "ld-teacher", text: "학부모·선생님이신가요?" });

  const elm = el(
    "section",
    { class: "screen", attrs: { id: "sc-landing" } },
    el(
      "div",
      { class: "ld-hero" },
      el("div", { class: "ld-ava" }, stickAvatar("cheer")),
      el("div", { class: "ld-word", text: BRAND.name }),
      el("div", { class: "ld-tag", text: BRAND.tagline }),
    ),
    el("div", { class: "footer ld-foot" }, startBtn, loginBtn, teacherBtn),
  );

  let snackTimer = 0;
  const snackEl = el("div", { class: "snack" });
  elm.appendChild(snackEl);
  teacherBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    snackEl.textContent = "선생님·학부모 공간은 준비 중이에요 — 곧 열려요";
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2000);
  });

  return { el: elm };
}
