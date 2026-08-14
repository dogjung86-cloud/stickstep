import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/ui.css";
import "./styles/bio3.css"; // 중1 Ⅱ 재제작 전용 시트(공용 크롬) — 랩별 시트는 각 렌더러가 자체 import
import "./styles/bio3-hook.css"; // 훅 10종(hookBio2)은 자체 import를 하지 않아 여기서 싣는다
import "./styles/bio4.css"; // 중1 Ⅱ v3 재제작(2026-08-10) 공용 크롬 — ss.u2v3 병행 배선
import "./styles/bio4-hook.css"; // v3 훅 8장면(hookBio4)
import "./styles/plant3.css"; // 중2 Ⅴ v3 재제작(2026-08-10) 공용 크롬 — ss.g2u5v3 병행 배선
import "./styles/plant3-hook.css"; // v3 훅 5장면(hookPlant3)
import "./styles/body3.css"; // 중2 Ⅵ v3 재제작(2026-08-10) 공용 크롬 — ss.g2u6v3 병행 배선
import "./styles/body3-hook.css"; // v3 훅 5장면(hookBody3)
import "./styles/math.css";
import "./styles/math2.css";
import "./styles/body-hook.css";
import "./styles/body.css";
import "./styles/policy.css";
import "./styles/stickavatar.css";
import "./styles/tutor.css";
import "./styles/game.css";
import "./styles/plant2.css";
import "./styles/soc.css";
import "./styles/his.css";
import "./styles/desktop.css"; // 데스크톱 셸(옵트인·≥1024px) — html.dt 게이트, 캐스케이드 최후순위

import { nav } from "./core/router";
import { parseRoute, writeHash } from "./core/route";
import type { AppRoute } from "./core/route";
import { getState, completeLesson, setOnboarding, setViewSubject, setViewGrade, getViewSubject, isPremium, isReviewMode, setPremiumOverride, setAdminOverride, canSeeAllSubjects, isDone, setLastUnit, recentUnit } from "./core/store";
import type { WrongNote } from "./core/store";
import { isTutorConfigured } from "./core/tutor";
import { tutorScreen } from "./screens/tutor";
import { splashScreen } from "./screens/splash";
import { subjectScreen } from "./screens/subject";
import { loginScreen } from "./screens/login";
import { notebookScreen } from "./screens/notebook";
import { homeScreen } from "./screens/home";
import { doneScreen } from "./screens/done";
import { reviewScreen } from "./screens/review";
import { challengeScreen } from "./screens/challenge";
import { myScreen } from "./screens/my";
import type { GnavKey } from "./ui/gnav";
import { paywallScreen } from "./screens/paywall";
import { policyScreen } from "./screens/policy";
import { examScreen } from "./screens/exam";
import { weakDrillScreen } from "./screens/weakDrill";
import { createLessonPlayer } from "./lessons/player";
import { findLesson, findUnit, isPremiumLocked, subjectOfUnit, gradeOfUnit } from "./content/curriculum";
import { initAuth, onAuthChange, isPrivilegedUser, currentUser, isAuthConfigured, hasStoredSession } from "./core/auth";
import { initSync } from "./core/sync";
import { capturePaymentReturn, resumePaymentConfirm } from "./core/purchase";

const frame = document.getElementById("frame")!;
nav.init(frame);

// 데스크톱 셸은 옵트인(사용자 확정 2026-07-20) — 기본은 넓은 화면에서도 폰 프레임.
// 마이 탭 "넓은 화면 레이아웃" 토글이 저장(store.desktopMode)·클래스 갱신을 함께 수행한다.
document.documentElement.classList.toggle("dt", getState().desktopMode);

// 마지막으로 연 단원 — 레슨 완료·X 이탈 후 홈이 그 단원 지도로 돌아가게 한다.
let lastUnitId: string | undefined;
// 새 레슨 첫 완료 귀환 시 홈 걷기 연출(README design/ "걷기 트리거 확정") — goHome이 1회 소비한다.
let walkFromLessonId: string | undefined;
// 현재 탭(하드웨어 뒤로가기 판단 근거) — goHome/goTab이 갱신한다.
let currentTab: GnavKey = "home";
// 스플래시는 앱을 열 때마다 거치는 공개 메인 화면이다. 세션 복원이 늦게 끝나도 버튼 문구가
// "한번 둘러보기" → "학습 이어가기"로 즉시 맞춰지도록 현재 스플래시의 갱신 함수를 잡아 둔다.
let updateSplashAuth: ((signedIn: boolean) => void) | null = null;

function goHome(): void {
  currentTab = "home";
  const walkFrom = walkFromLessonId;
  walkFromLessonId = undefined;
  nav.reset(
    homeScreen(
      openLesson,
      lastUnitId,
      { onOpenExam: openExam, onTab: goTab, onOpenNotebook: openNotebook, onOpenSplash: () => showSplash(true) },
      { walkFrom },
    ),
  );
}

/** 스플래시의 "학습 이어가기" — 마지막 대단원의 과목·학년을 복원한 뒤 그 지도에 초점을 맞춘다.
 *  과목 공개 게이트가 닫혀 있으면 숨김 과목(수학·사회·역사)의 최근 단원은 복귀 목적지가 될 수
 *  없다(과거에 열어 본 기록이 있어도 과학 지도로) — 진행 기록 자체는 보존된다. */
function resumeLearning(): void {
  const recent = recentUnit();
  if (recent && findUnit(recent) && (canSeeAllSubjects() || subjectOfUnit(recent) === "sci")) {
    lastUnitId = recent;
    setViewSubject(subjectOfUnit(recent));
    setViewGrade(gradeOfUnit(recent));
  }
  goHome();
}

/** 하단 탭 전환(2026-07-12 IA 개편) — 탭은 스택을 쌓지 않고 reset으로 갈아끼운다. */
function goTab(k: GnavKey): void {
  currentTab = k;
  if (k === "home") {
    goHome();
  } else if (k === "subjects") {
    // 과목 탭(2026-07-20 신설) — 허브를 탭 화면으로. 과목을 고르면 pickSubject가 학습 탭으로 점프(런처형).
    nav.reset(
      subjectScreen({
        mode: "hub",
        onTab: goTab,
        onPickScience: () => pickSubject("sci"),
        onPickMath: () => pickSubject("math"),
        onPickSoc: () => pickSubject("soc"),
        onPickHis: () => pickSubject("his"),
      }),
    );
  } else if (k === "review") {
    nav.reset(
      reviewScreen({
        onTab: goTab,
        onOpenNotebook: openNotebook,
        onOpenDrill: openWeakDrill,
        onOpenTutor: () => openTutor(),
      }),
    );
  } else if (k === "challenge") {
    nav.reset(
      challengeScreen({
        onTab: goTab,
        onPlayStepRush: openStepRush,
        onPlayCosmo: openCosmoMerge,
        onPlayOneStroke: openOneStroke,
        onPlayLaserMaze: openLaserMaze,
      }),
    );
  } else {
    nav.reset(
      myScreen({
        onTab: goTab,
        onOpenAccount: openLogin,
        onOpenPaywall: (onUnlocked) =>
          nav.go(
            paywallScreen({
              onLogin: openLogin,
              sub: "모든 프리미엄 레슨과 단원 평가 재응시를 열 수 있어요.",
              onUnlocked: () => {
                nav.back();
                onUnlocked?.();
              },
              onClose: () => nav.back(),
            }),
          ),
        onOpenPolicy: openPolicy,
        onOpenRefund: openRefund,
      }),
    );
    // 비로그인 유저의 마이 탭 = 로그인 유도 창구(2026-07-20 사용자 확정) — 마이 화면 위에
    // 로그인 화면을 얹는다(닫으면 마이 화면). 스텁 모드(env 없음 — dev·e2e)는 로그인이 불가하니 생략.
    // 세션 토큰 흔적이 있으면(부팅 복원이 끝나기 전일 수 있음) 띄우지 않는다 — 복원이 끝나는 순간
    // 비로그인 로그인 화면이 로그인된 모습으로 뒤바뀌는 경합 혼란 차단(2026-07-21 사용자 보고).
    if (isAuthConfigured() && !currentUser() && !hasStoredSession()) openLogin();
  }
}

// ── 안드로이드 하드웨어(브라우저) 뒤로가기 = 앱 내 뒤로가기(2026-07-20 사용자 피드백) ──
// 가드 히스토리 상태 1개를 유지: 루트(학습 탭 홈)가 아니면 pushState로 back을 가로채 두고,
// popstate가 오면 앱 내 이전 화면으로 이동한다. 루트에선 무장하지 않아(가드도 반납) 다음
// back이 자연스럽게 사이트를 떠난다. Capacitor WebView의 하드웨어 back도 같은 경로를 탄다.
let historyArmed = false;
// 히스토리 방향 판별 인덱스(2026-08-14) — 크롬은 해시 이동(주소창 수정·location.hash 대입)에도
// popstate를 쏜다. 엔트리마다 ssIdx를 심어 두면 popstate에서 "인덱스가 줄었다 = 진짜 뒤로가기 →
// appBack" / "늘었다·없다 = 해시 전진 내비 → 라우트 적용"을 가를 수 있다(없으면 해시 이동이
// appBack으로 오인돼 방금 연 화면이 닫히는 실사고 — qa/e2e-route.mjs [D] 회귀 가드).
let histIdx = 0;
try {
  history.replaceState({ ...((history.state as object | null) ?? {}), ssIdx: 0 }, "");
} catch {
  /* 무시 */
}
function armHistory(): void {
  if (!historyArmed) {
    history.pushState({ stickstep: true, ssIdx: histIdx + 1 }, "");
    histIdx += 1;
    historyArmed = true;
  }
}
/** 앱 내 뒤로가기 — 스택이 쌓였으면 pop, 루트의 비홈 탭이면 학습 탭으로. 처리했으면 true. */
function appBack(): boolean {
  if (nav.depth > 1) {
    nav.back();
    return true;
  }
  if (getState().onboarded && currentTab !== "home") {
    goTab("home");
    return true;
  }
  return false;
}
window.addEventListener("popstate", (e) => {
  // popstate 직후의 hashchange는 여기서 이미 처리한 이동 — 라우트 재적용을 잠깐 막는다
  // (이중 내비 차단, core/route.ts 계약 ②).
  hashFromPop = true;
  window.setTimeout(() => (hashFromPop = false), 80);
  const s = (e.state as { ssIdx?: number } | null)?.ssIdx;
  if (typeof s === "number" && s < histIdx) {
    // 인덱스 감소 = 진짜 뒤로가기(하드웨어 back·가드 반납) → 앱 내 뒤로가기
    histIdx = s;
    historyArmed = false;
    appBack(); // 이동이 일어나면 nav 변경 훅이 필요 시 다시 무장한다
    return;
  }
  // 인덱스 없음(새 해시 엔트리)·증가(브라우저 앞으로가기) = 주소 이동 — 라우트로 처리.
  if (typeof s === "number") {
    histIdx = s;
  } else {
    histIdx += 1;
    try {
      history.replaceState({ ...((history.state as object | null) ?? {}), ssIdx: histIdx }, "");
    } catch {
      /* 무시 */
    }
  }
  historyArmed = true; // 등 뒤에 엔트리가 생겼으니 back 1회는 우리가 받는다
  const r = parseRoute(location.hash);
  if (r) enterFromRoute(r);
});
nav.setOnChange(() => {
  if (nav.depth > 1 || currentTab !== "home") armHistory();
  // 루트 복귀 — 가드 상태를 조용히 반납(popstate는 루트라 no-op). 단 라우트 적용 버스트 중에는
  // 보류한다: enterFromRoute가 "goHome → 서브 화면 push"를 연달아 실행할 때 중간 홈 상태가
  // back()을 쏘면, 그 popstate가 방금 push한 화면을 도로 닫는 경합이 있었다(2026-08-14 실사고).
  else if (historyArmed && !routingBurst) history.back();
  syncHash(); // 화면 전환마다 주소창 해시를 따라 맞춘다(2026-08-14 URL 라우팅)
});

// ── URL 해시 라우팅(2026-08-14 토스PG 심사 대응 — 계약은 core/route.ts 헤더) ──
// 아웃바운드: 화면 → 주소. 스플래시·로그인·상품(페이월)·정책 화면과 최상위 탭만 주소를 가진다.
function syncHash(): void {
  const top = nav.top?.el;
  if (!top) return;
  const id = top.id;
  if (id === "sc-splash") writeHash("");
  else if (id === "sc-login") writeHash("login");
  else if (id === "sc-paywall") writeHash("pricing");
  else if (id === "sc-policy") writeHash(top.dataset.policyFile === "refund.html" ? "refund" : "privacy");
  else if (nav.depth === 1) writeHash(currentTab === "home" ? `subject/${getViewSubject()}` : currentTab);
  // 레슨·시험 등 그 외 화면은 주소를 바꾸지 않는다(마지막 주소 유지 — 계약 ③).
}

/** 인바운드: 주소 → 화면. 부팅 딥링크와 주소창 수정(hashchange) 공용. 스플래시를 건너뛰므로
 *  미온보딩 방문자(PG 심사역 포함)에게는 둘러보기와 같은 기본값을 먼저 심는다(showSplash 참조). */
let routingBurst = false;
function enterFromRoute(r: AppRoute): void {
  // 같은 서브 화면이 이미 떠 있으면 재적용하지 않는다(주소창 재입력·중복 hashchange 멱등).
  const topId = nav.top?.el.id ?? "";
  if ((r.k === "login" && topId === "sc-login") || (r.k === "pricing" && topId === "sc-paywall")) return;
  if (r.k === "policy" && topId === "sc-policy" && nav.top?.el.dataset.policyFile === r.file) return;
  if (!getState().onboarded) {
    setOnboarding("g1", 10);
    setViewGrade("g1");
    setViewSubject("sci");
  }
  routingBurst = true;
  try {
    if (r.k === "subject") {
      pickSubject(r.s); // 공개 게이트가 닫혀 있으면 getViewSubject 클램프가 과학 지도로 거른다
    } else if (r.k === "grade") {
      setViewGrade(r.g);
      goHome();
    } else if (r.k === "tab") {
      goTab(r.tab);
    } else {
      goHome(); // 닫기·뒤로가기가 홈으로 떨어지도록 홈을 깔고 위에 얹는다
      if (r.k === "login") openLogin();
      else if (r.k === "pricing") openPricing();
      else if (r.file === "refund.html") openRefund();
      else openPolicy();
    }
  } finally {
    // 버스트 종료 — 최종 상태가 루트 홈인데 가드가 남아 있으면 이제 반납한다(보류분 정산).
    window.setTimeout(() => {
      routingBurst = false;
      if (nav.depth === 1 && currentTab === "home" && historyArmed) history.back();
    }, 0);
  }
}

let hashFromPop = false;
// 폴백 — 크롬은 해시 이동도 popstate로 먼저 들어와 위에서 처리된다(hashFromPop이 이중 적용 차단).
// popstate 없이 hashchange만 오는 환경을 위한 안전망.
window.addEventListener("hashchange", () => {
  if (hashFromPop) return;
  const r = parseRoute(location.hash);
  if (r) enterFromRoute(r);
});

/** 오답노트 — 프리미엄 전용(복습 탭 콘텐츠 전면 프리미엄, 2026-07-15 사용자 확정).
 *  오답 "수집"은 무료 사용자도 계속된다(구매 순간 과거 오답이 이미 쌓여 있게) — 잠긴 건 열람·다시 풀기. */
function openNotebook(): void {
  if (isPremium() || isReviewMode()) {
    nav.go(notebookScreen(() => nav.back(), openLesson, isTutorConfigured() ? openTutor : undefined));
    return;
  }
  nav.go(
    paywallScreen({
      onLogin: openLogin,
      sub: "틀린 문제가 오답노트에 차곡차곡 모여 있어요. 다시 풀어 완전히 내 것으로 만들 수 있어요.",
      onUnlocked: () => {
        nav.back();
        openNotebook();
      },
      onClose: () => nav.back(),
    }),
  );
}

/** 질문하기(AI 튜터 '스틱쌤') — 프리미엄 전용. 복습 탭 카드(일반) · 오답노트 카드(문항 그라운딩).
 *  키(.env.local) 없으면 isTutorConfigured()가 false — 복습 탭은 "준비 중" 카드, 오답노트 버튼은 미노출. */
function openTutor(note?: WrongNote): void {
  if (isPremium() || isReviewMode()) {
    nav.go(tutorScreen({ onClose: () => nav.back(), note }));
    return;
  }
  nav.go(
    paywallScreen({
      onLogin: openLogin,
      sub: "AI 튜터 스틱쌤에게 막힌 문제를 사진과 함께 바로 물어볼 수 있어요.",
      onUnlocked: () => {
        nav.back();
        openTutor(note);
      },
      onClose: () => nav.back(),
    }),
  );
}

/** 취약 단원 문제 뽑기(복습 탭) — 프리미엄 전용. 잠겨 있으면 페이월을 먼저 보여 준다. */
function openWeakDrill(): void {
  if (isPremium() || isReviewMode()) {
    nav.go(weakDrillScreen({ onExit: () => goTab("review"), onOpenLesson: openLesson }));
    return;
  }
  nav.go(
    paywallScreen({
      onLogin: openLogin,
      sub: "취약 단원 문제 뽑기로 원하는 소단원만 골라 맞춤 문제지를 만들 수 있어요.",
      onUnlocked: () => {
        nav.back();
        openWeakDrill();
      },
      onClose: () => nav.back(),
    }),
  );
}

/** 스텝 러시(도전 탭 간판 미니게임) — 프리미엄 전용. 게임 코드는 동적 import(three 규칙)로
 *  플레이 순간에만 받는다. 나가기는 도전 탭으로 복귀. */
function openStepRush(): void {
  if (isPremium() || isReviewMode()) {
    void import("./game/stepRush/index").then(({ stepRushScreen }) => {
      nav.go(stepRushScreen({ onExit: () => goTab("challenge") }));
    });
    return;
  }
  nav.go(
    paywallScreen({
      onLogin: openLogin,
      sub: "도전 탭 미니게임 스텝 러시가 프리미엄에 포함돼 있어요. 무한 계단을 오르며 최고 기록에 도전해 보세요.",
      onUnlocked: () => {
        nav.back();
        openStepRush();
      },
      onClose: () => nav.back(),
    }),
  );
}

/** 태양 만들기(내부 모듈명 cosmoMerge, 도전 탭 미니게임 2호 — 수박게임 문법의 천체 합체) — 프리미엄 전용.
 *  게임 코드는 동적 import(three 규칙) — matter-js 물리까지 이 청크에 실려 초기 번들 무영향. */
function openCosmoMerge(): void {
  if (isPremium() || isReviewMode()) {
    void import("./game/cosmoMerge/index").then(({ cosmoScreen }) => {
      nav.go(cosmoScreen({ onExit: () => goTab("challenge") }));
    });
    return;
  }
  nav.go(
    paywallScreen({
      onLogin: openLogin,
      sub: "도전 탭 미니게임 태양 만들기가 프리미엄에 포함돼 있어요. 우주먼지를 합쳐 태양까지 키워 보세요.",
      onUnlocked: () => {
        nav.back();
        openCosmoMerge();
      },
      onClose: () => nav.back(),
    }),
  );
}

/** 레이저 미로(도전 탭 미니게임 — 거울 반사·빛의 합성 격자 퍼즐) — 프리미엄 전용, 동적 import(스텝 러시 문법). */
function openLaserMaze(): void {
  if (isPremium() || isReviewMode()) {
    void import("./game/laserMaze/index").then(({ laserMazeScreen }) => {
      nav.go(laserMazeScreen({ onExit: () => goTab("challenge") }));
    });
    return;
  }
  nav.go(
    paywallScreen({
      onLogin: openLogin,
      sub: "도전 탭 미니게임 레이저 미로가 프리미엄에 포함돼 있어요. 거울을 돌려 레이저를 보석까지 보내 보세요.",
      onUnlocked: () => {
        nav.back();
        openLaserMaze();
      },
      onClose: () => nav.back(),
    }),
  );
}

/** 네온 한붓그리기(도전 탭 미니게임 — 오일러 도형 스테이지 퍼즐) — 프리미엄 전용, 동적 import(스텝 러시 문법). */
function openOneStroke(): void {
  if (isPremium() || isReviewMode()) {
    void import("./game/oneStroke/index").then(({ oneStrokeScreen }) => {
      nav.go(oneStrokeScreen({ onExit: () => goTab("challenge") }));
    });
    return;
  }
  nav.go(
    paywallScreen({
      onLogin: openLogin,
      sub: "도전 탭 미니게임 네온 한붓그리기가 프리미엄에 포함돼 있어요. 네온사인을 한 붓에 켜며 몇 판까지 가는지 도전해 보세요.",
      onUnlocked: () => {
        nav.back();
        openOneStroke();
      },
      onClose: () => nav.back(),
    }),
  );
}

/** 단원 종합 평가 — 항상 열린 지도 노드에서 진입. 재응시 잠금은 화면 안에서 페이월로 안내한다. */
function openExam(unitId: string): void {
  lastUnitId = unitId;
  rememberUnit(unitId); // 기기 기억 — 재접속·과목 전환 시 홈 지도 초기 포커스(store.lastUnits)
  nav.go(
    examScreen(unitId, {
      onExit: goHome,
      onOpenLesson: openLesson,
      onPaywall: (unlocked) =>
        nav.go(
          paywallScreen({
            onLogin: openLogin,
            sub: "단원 종합 평가를 무제한으로 다시 풀고, 모든 프리미엄 레슨도 함께 열 수 있어요.",
            onUnlocked: () => {
              nav.back();
              unlocked();
            },
            onClose: () => nav.back(),
          }),
        ),
    }),
  );
}

// 과목 허브 진입은 하단 과목 탭(goTab "subjects")뿐 — 구 홈 앱바 subj-box 진입(openSubjects)은
// 폐기(2026-07-20 사용자 확정). 과목을 고르면 그 과목 지도로 홈을 다시 그린다.
function pickSubject(s: "sci" | "math" | "soc" | "his"): void {
  setViewSubject(s);
  lastUnitId = undefined; // 직전 과목의 단원 포커스를 버리고 새 과목 지도로
  goHome();
}

function openLogin(): void {
  nav.go(
    loginScreen(() => nav.back(), {
      onOpenNotebook: openNotebook,
      onOpenPolicy: openPolicy,
    }),
  );
}

/** 상품(프리미엄 안내) 화면 단독 진입 — 심사·공유용 URL(#/pricing)이 여는 경로(2026-08-14).
 *  기존 9곳 게이트 진입과 달리 맥락 문구 없이 기본 페이월을 연다. 닫기·구매 완료 모두 홈 복귀. */
function openPricing(): void {
  nav.go(
    paywallScreen({
      onLogin: openLogin,
      onUnlocked: () => nav.back(),
      onClose: () => nav.back(),
    }),
  );
}

/** 개인정보처리방침 — 마이 탭 행과 로그인 화면 동의 고지가 함께 쓴다(원본: public/privacy.html). */
function openPolicy(): void {
  nav.go(policyScreen(() => nav.back()));
}

/** 환불 정책 — 마이 탭 legal 행이 쓴다(원본: public/refund.html).
 *  스플래시·페이월의 환불 링크는 정적 URL을 새 탭으로 직접 연다(policy.ts 헤더 주석 참조). */
function openRefund(): void {
  nav.go(policyScreen(() => nav.back(), { file: "refund.html", title: "환불 정책" }));
}

// 보너스 미니게임은 도전 탭으로 이사(2026-07-12). 단열 디펜스는 폐기(2026-07-17 — minigame.ts 삭제),
// 별자리 한붓그리기도 폐기(2026-07-19 사용자 확정 — starGame.ts 삭제, 서로소 학습은 vennFactor 몫).
// 스텝 러시 = openStepRush(간판), 태양 만들기 = openCosmoMerge(matter-js 천체 합체),
// 네온 한붓그리기 = openOneStroke(오일러 스테이지 퍼즐), 레이저 미로 = openLaserMaze(빛 반사 퍼즐) —
// 넷 다 프리미엄 게이트 + 동적 import, 나가기는 도전 탭 복귀.

/** 최근에 연 단원을 기기에 기억(과목:학년 키) — 홈 지도가 재접속·과목 전환 시 이 단원부터 연다(2026-07-21). */
function rememberUnit(unitId: string): void {
  setLastUnit(`${subjectOfUnit(unitId)}:${gradeOfUnit(unitId)}`, unitId);
}

function openLesson(id: string): void {
  const found = findLesson(id);
  if (!found) return;
  lastUnitId = found.unit.id;
  rememberUnit(found.unit.id);
  // 프리미엄 잠금 — 구매 전에는 페이월로 안내
  if (isPremiumLocked(found.lesson)) {
    nav.go(
      paywallScreen({
        onLogin: openLogin,
        lessonTitle: found.lesson.title,
        onUnlocked: goHome,
        onClose: () => nav.back(),
      }),
    );
    return;
  }
  const wasDone = isDone(id); // 첫 완료 판정 — 복습 재플레이 귀환에는 걷기 연출이 없다
  const player = createLessonPlayer(found.lesson, {
    onExit: goHome,
    onComplete: (r) => {
      const gained = completeLesson(r.lessonId, r.acc, r.xp);
      if (!wasDone) walkFromLessonId = r.lessonId; // 완료 화면 "홈으로" 귀환과 동시에 자동 재생
      const note = found.lesson.doneNote ?? found.lesson.subtitle ?? "한 걸음 더 나아갔어요!";
      nav.go(doneScreen(r, gained, note, goHome));
    },
  });
  nav.go({ el: player.el });
}

function showSplash(instant = false): void {
  // 공개 진입 플로우(2026-07-21 사용자 확정): 누구나 앱을 열면 스플래시(=상시 메인)를 먼저 거친다.
  // 신규 사용자도 설문(학년·과목·학습량) 없이 곧바로 중1 과학 지도로 보낸다(2026-08-11 사용자
  // 확정 — 공개 과목이 과학뿐이라 물을 게 없다. screens/onboarding.ts는 배선만 해제, 파일 보존).
  // 기본값 = 중1·과학·하루 10분, 학년은 홈 상단 세그(중1⇄중2)로 언제든 전환한다.
  const enterOnboarding = (): void => {
    if (getState().onboarded) {
      resumeLearning();
      return;
    }
    setOnboarding("g1", 10);
    setViewGrade("g1");
    setViewSubject("sci");
    goHome();
  };
  const splash = splashScreen({
    signedIn: !!currentUser() || hasStoredSession(),
    instant,
    onStart: enterOnboarding,
    onLogin: () =>
      nav.go(
        loginScreen(
          () => nav.back(),
          { onOpenNotebook: openNotebook, onOpenPolicy: openPolicy },
        ),
      ),
  });
  updateSplashAuth = splash.setSignedIn;
  splash.onExit = () => {
    if (updateSplashAuth === splash.setSignedIn) updateSplashAuth = null;
  };
  nav.reset(splash);
}

// 토스 결제창 복귀 접수 — 반드시 부팅 라우팅·initAuth보다 먼저(failUrl의 ?code=…를 OAuth 코드
// 교환이 오인하지 않게 주소를 즉시 청소한다). 승인 실행은 아래 resumePaymentConfirm이 맡는다.
capturePaymentReturn();
// 주소 청소(replaceState)가 히스토리 방향 인덱스를 지웠을 수 있어 재스탬프(armHistory 항목 참조).
try {
  history.replaceState({ ...((history.state as object | null) ?? {}), ssIdx: histIdx }, "");
} catch {
  /* 무시 */
}

// [임시 프리뷰] 적용 랩 시제품 — DEV에서 ?preview=u3l1v2 로 진입. 폐기 시 이 분기를 지우고 start()만 남긴다.
const bootRoute = parseRoute(location.hash);
if (import.meta.env.DEV && new URLSearchParams(location.search).get("preview") === "u3l1v2") {
  void import("./content/previewU3l1").then(({ previewU3L1 }) => {
    const player = createLessonPlayer(previewU3L1(), {
      onExit: goHome,
      onComplete: () => goHome(), // 프리뷰는 완료를 기록하지 않는다(store 오염 방지)
    });
    nav.go({ el: player.el });
  });
} else if (bootRoute) {
  enterFromRoute(bootRoute); // 딥링크(#/pricing·#/login 등) — 스플래시를 건너뛰고 해당 화면으로(2026-08-14)
} else {
  showSplash();
}

// [DEV 전용] 걷기 연출 눈검수 트리거 — 콘솔에서 __walkHome("u1l2")처럼 방금 완료한 레슨 id를 넘기면
// 실제 완료 귀환과 같은 경로(goHome 1회 소비)로 재생된다. 프로덕션 번들에는 포함되지 않는다.
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__walkHome = (id: string) => {
    const found = findLesson(id);
    if (!found) return;
    lastUnitId = found.unit.id;
    walkFromLessonId = id;
    goHome();
  };
}

// 로그인·동기화 부팅 — Supabase 환경변수(.env.local)가 없으면 둘 다 no-op(core/auth.ts 참조).
// initSync가 먼저 리스너를 배선해야 initAuth의 세션 복원 이벤트를 놓치지 않는다.
// 운영 계정 프리미엄 겹층 — 지정 이메일 로그인 시 결제 없이 전 기능(로그아웃하면 자동 해제).
// 과목 공개 게이트도 같은 지점에서 주입 — 운영 계정만 수학·사회·역사가 보인다(store.canSeeAllSubjects).
onAuthChange((u) => {
  setPremiumOverride(isPrivilegedUser(u));
  setAdminOverride(isPrivilegedUser(u));
  // 저장된 세션은 initAuth 복원 전에도 로그인 사용자 버튼을 먼저 보여 줘 깜빡임을 막는다.
  updateSplashAuth?.(!!u || hasStoredSession());
});
initSync();
void initAuth();

// ── 결제창 복귀 마무리 — 세션 복원을 기다렸다가 승인(pay-confirm)까지 밀어붙이고 결과를 알린다.
// 화면 스택과 무관한 전역 스낵(.pay-snack, paywall.css) — 스플래시 위에서도 보인다.
let paySnackEl: HTMLElement | null = null;
let paySnackTimer = 0;
function paySnack(msg: string, good: boolean): void {
  if (!paySnackEl) {
    paySnackEl = document.createElement("div");
    paySnackEl.className = "pay-snack";
    document.body.appendChild(paySnackEl);
  }
  paySnackEl.textContent = msg;
  paySnackEl.classList.toggle("good", good);
  paySnackEl.classList.add("show");
  window.clearTimeout(paySnackTimer);
  paySnackTimer = window.setTimeout(() => paySnackEl?.classList.remove("show"), good ? 4200 : 3400);
}
resumePaymentConfirm((msg, ok) => {
  paySnack(msg, ok);
  // 이용권이 방금 반영됐다면 열려 있는 홈 지도의 크라운 잠금을 즉시 다시 그린다(스플래시 등 다른
  // 화면이면 건드리지 않는다 — 어차피 다음 홈 진입 때 새 상태로 그려진다).
  if (ok && document.getElementById("sc-home")) goHome();
});
