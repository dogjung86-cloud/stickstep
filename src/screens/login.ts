// 로그인 — 소셜 로그인(구글·카카오·네이버) 진입 장치. 현재는 스텁:
// 버튼 UI와 진입점만 갖춰 두고, 실제 연동은 출시(백엔드/OAuth) 시점에 붙인다.
// 정책: 로그인은 강요하지 않는다 — 학습은 로그인 없이 가능하고, 기록은 기기에 저장.
// 로그인의 가치(기기 간 동기화·구매 복원)를 문구로 설명만 해 둔다.
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { stickAvatar } from "../ui/avatar";
import type { Screen } from "../core/router";

// 간이 소셜 마크 — 외부 이미지 없이 브랜드가 연상되는 최소 글리프(스텁 단계 전용)
const G_MARK = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="3.2" stroke-linecap="round">
  <path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="#4285F4"/>
  <path d="M20 12h-8" stroke="#34A853"/>
</svg>`;
const KAKAO_MARK = `<svg viewBox="0 0 24 24" width="20" height="20" fill="#3C1E1E">
  <path d="M12 4C7 4 3 7.2 3 11.2c0 2.6 1.7 4.8 4.3 6.1l-1 3.7 4-2.4c.6.1 1.1.1 1.7.1 5 0 9-3.2 9-7.2S17 4 12 4z"/>
</svg>`;
const NAVER_MARK = `<svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
  <path d="M5 4h4.6l4.8 7V4H19v16h-4.6l-4.8-7v7H5z"/>
</svg>`;

export function loginScreen(onClose: () => void): Screen {
  const close = el("button", { class: "backbtn", attrs: { "aria-label": "닫기" }, html: icon("x", 22) });
  close.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    onClose();
  });
  const head = el("div", { class: "obhead" }, close, el("div", {}), el("div", { style: "width:38px" }));

  let snackTimer = 0;
  const snackEl = el("div", { class: "snack" });
  function snack(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2200);
  }

  const hero = el(
    "div",
    { class: "login-hero" },
    el("div", { class: "login-ava" }, stickAvatar("wave")),
    el("div", { class: "pw-title", text: "로그인하고 기록을 지켜요" }),
    el("div", { class: "pw-sub", text: "기기를 바꿔도 학습 기록과 이용권이 그대로 이어져요." }),
  );

  const social = (cls: string, mark: string, label: string, msg: string): HTMLElement => {
    const b = el("button", { class: `login-btn ${cls}` }, el("span", { class: "login-mark", html: mark }), el("span", { text: label }));
    b.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      snack(msg);
    });
    return b;
  };

  const buttons = el(
    "div",
    { class: "login-list" },
    social("google", G_MARK, "Google로 계속하기", "구글 로그인은 앱 출시와 함께 열려요!"),
    social("kakao", KAKAO_MARK, "카카오로 계속하기", "카카오 로그인은 앱 출시와 함께 열려요!"),
    social("naver", NAVER_MARK, "네이버로 계속하기", "네이버 로그인은 앱 출시와 함께 열려요!"),
  );

  const note = el("div", { class: "login-note", text: "로그인 없이도 모든 학습을 할 수 있어요. 기록은 이 기기에 안전하게 저장돼요." });

  const later = el("button", { class: "btn-ghost", text: "나중에 할게요" });
  later.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    onClose();
  });

  const body = el("div", { class: "scroll pad" }, hero, buttons, note);
  const footer = el("div", { class: "footer" }, later);
  const elm = el("section", { class: "screen" }, head, body, footer, snackEl);
  return { el: elm };
}
