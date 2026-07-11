// 로그인·마이페이지 — 소셜 로그인(구글·카카오)과 로그인 후 내 정보/학습 요약.
// 정책: 로그인은 강요하지 않는다 — 학습은 로그인 없이 가능하고, 기록은 기기에 저장.
// 네이버는 Supabase 미지원이라 버튼을 두지 않는다(수요 확인 후 커스텀 구현 검토).
// Supabase 환경변수(.env.local)가 없으면 스텁 모드(안내 스낵만) — dev·e2e에서 백엔드 없이 동작.
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { stickAvatar } from "../ui/avatar";
import { getState, currentStreak, wrongNoteCount } from "../core/store";
import type { Screen } from "../core/router";
import { consumeAuthError, currentUser, isAuthConfigured, onAuthChange, signInWith, signOut } from "../core/auth";
import type { AuthUser, OAuthProvider } from "../core/auth";

// 간이 소셜 마크 — 외부 이미지 없이 브랜드가 연상되는 최소 글리프
const G_MARK = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="3.2" stroke-linecap="round">
  <path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="#4285F4"/>
  <path d="M20 12h-8" stroke="#34A853"/>
</svg>`;
const KAKAO_MARK = `<svg viewBox="0 0 24 24" width="20" height="20" fill="#3C1E1E">
  <path d="M12 4C7 4 3 7.2 3 11.2c0 2.6 1.7 4.8 4.3 6.1l-1 3.7 4-2.4c.6.1 1.1.1 1.7.1 5 0 9-3.2 9-7.2S17 4 12 4z"/>
</svg>`;

const PROVIDER_LABEL: Record<string, string> = { google: "Google", kakao: "카카오" };

// 실기기에서 "지금 어떤 빌드를 보고 있나"를 판별하는 표식 — 배포 때마다 올린다(캐시 디버깅용).
const BUILD_TAG = "v5";

/** 프로필 사진 원형(없거나 로드 실패 시 스틱맨 아바타 폴백). */
function avatarEl(u: AuthUser): HTMLElement {
  const host = el("div", { class: "login-ava" });
  if (u.avatarUrl) {
    const img = document.createElement("img");
    img.src = u.avatarUrl;
    img.alt = "";
    img.referrerPolicy = "no-referrer"; // 구글 아바타 리퍼러 403 방지
    img.onerror = () => {
      img.remove();
      host.appendChild(stickAvatar("wave"));
    };
    host.appendChild(img);
  } else {
    host.appendChild(stickAvatar("wave"));
  }
  return host;
}

export function loginScreen(onClose: () => void, extras?: { onOpenNotebook?: () => void }): Screen {
  let offAuth: (() => void) | null = null;
  const unsub = (): void => {
    offAuth?.();
    offAuth = null;
  };
  const leave = (): void => {
    unsub();
    onClose();
  };

  const close = el("button", { class: "backbtn", attrs: { "aria-label": "닫기" }, html: icon("x", 22) });
  close.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    leave();
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

  const body = el("div", { class: "scroll pad" });
  const footer = el("div", { class: "footer" });

  let busy = false; // OAuth 이동 중 중복 탭 방지

  const social = (cls: string, mark: string, label: string, onTap: () => void): HTMLElement => {
    const b = el("button", { class: `login-btn ${cls}` }, el("span", { class: "login-mark", html: mark }), el("span", { text: label }));
    b.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      onTap();
    });
    return b;
  };

  /** 오답노트 진입 카드 — 로그인 여부와 무관(기록은 기기 우선이라 비로그인도 쌓인다). */
  const notebookCard = (): HTMLElement | null => {
    if (!extras?.onOpenNotebook) return null;
    const { open, overcome } = wrongNoteCount();
    const label = open > 0 ? `${open}문제 대기 중` : overcome > 0 ? "전부 극복" : "아직 비어 있어요";
    const c = el(
      "button",
      { class: "nb-entry" },
      el("span", { class: "nb-entry-ic", html: icon("bulb", 18) }),
      el("span", { class: "nb-entry-t", text: "오답노트" }),
      el("span", { class: "nb-entry-n", text: label }),
      el("span", { class: "nb-entry-go", html: icon("chevron", 16) }),
    );
    c.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      extras.onOpenNotebook?.();
    });
    return c;
  };

  const startOAuth = (provider: OAuthProvider, label: string): void => {
    if (busy) return;
    busy = true;
    snack(`${label} 화면으로 이동할게요…`);
    void signInWith(provider).then((ok) => {
      if (!ok) {
        busy = false;
        snack("로그인 연결에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
      // 성공 시 공급자 페이지로 떠나므로 busy는 풀지 않는다.
    });
  };

  function renderSignedOut(): void {
    const hero = el(
      "div",
      { class: "login-hero" },
      el("div", { class: "login-ava" }, stickAvatar("wave")),
      el("div", { class: "pw-title", text: "로그인하고 기록을 지켜요" }),
      el("div", { class: "pw-sub", text: "기기를 바꿔도 학습 기록과 이용권이 그대로 이어져요." }),
    );
    const live = isAuthConfigured();
    const buttons = el(
      "div",
      { class: "login-list" },
      social("google", G_MARK, "Google로 계속하기", () =>
        live ? startOAuth("google", "구글") : snack("구글 로그인은 앱 출시와 함께 열려요!"),
      ),
      social("kakao", KAKAO_MARK, "카카오로 계속하기", () =>
        live ? startOAuth("kakao", "카카오") : snack("카카오 로그인은 앱 출시와 함께 열려요!"),
      ),
    );
    const note = el("div", { class: "login-note", text: "로그인 없이도 모든 학습을 할 수 있어요. 기록은 이 기기에 안전하게 저장돼요." });
    const ver = el("div", { class: "login-note", text: BUILD_TAG });
    body.replaceChildren(hero, buttons, note, ver);
    const nb = notebookCard();
    if (nb) body.insertBefore(nb, note);

    const later = el("button", { class: "btn-ghost", text: "나중에 할게요" });
    later.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      leave();
    });
    footer.replaceChildren(later);
  }

  function renderSignedIn(u: AuthUser): void {
    const who = u.name ?? u.email ?? "회원";
    const via = PROVIDER_LABEL[u.provider ?? ""] ?? "소셜";
    const hero = el(
      "div",
      { class: "login-hero" },
      avatarEl(u),
      el("div", { class: "pw-title", text: who }),
      el("div", { class: "pw-sub", text: u.email ? `${via} 계정 · ${u.email}` : `${via} 계정으로 로그인됨` }),
    );

    // 나의 학습 요약 — 홈 칩과 같은 수치(스트릭·XP)에 완료 레슨 수를 더해 한눈에.
    const st = getState();
    const doneCount = Object.values(st.lessons).filter((l) => l.done).length;
    const stat = (num: string, label: string): HTMLElement =>
      el("div", { class: "my-stat" }, el("b", { text: num }), el("span", { text: label }));
    const stats = el(
      "div",
      { class: "my-stats" },
      stat(`${currentStreak()}일`, "연속 학습"),
      stat(`${st.totalXp}`, "XP"),
      stat(`${doneCount}개`, "완료한 레슨"),
    );

    const note = el("div", { class: "login-note", text: "학습 기록이 자동으로 저장·동기화돼요. 다른 기기에서 같은 계정으로 로그인하면 기록이 이어져요." });
    const ver = el("div", { class: "login-note", text: BUILD_TAG });
    body.replaceChildren(hero, stats, note, ver);
    const nb = notebookCard();
    if (nb) body.insertBefore(nb, note);

    const out = el("button", { class: "btn-ghost", text: "로그아웃" });
    out.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      void signOut().then(() => snack("로그아웃했어요. 기록은 이 기기에 그대로 남아요."));
    });
    footer.replaceChildren(out);
  }

  function render(): void {
    const u = currentUser();
    if (u) renderSignedIn(u);
    else renderSignedOut();
  }

  const elm = el("section", { class: "screen" }, head, body, footer, snackEl);
  // 등록 즉시 1회 렌더 + 이후 로그인/로그아웃에 반응. 해제는 leave()와 라우터 onExit 양쪽에서(중복 안전).
  offAuth = onAuthChange(() => render());
  // OAuth 복귀가 에러였다면 원인을 보여 준다(조용한 실패 금지 — 실기기 디버깅의 유일한 창구)
  const authErr = consumeAuthError();
  if (authErr) window.setTimeout(() => snack(`로그인이 중단됐어요: ${authErr}`), 350);
  return { el: elm, onExit: unsub };
}
