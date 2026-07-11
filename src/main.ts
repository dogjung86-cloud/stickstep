import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/ui.css";
import "./styles/math.css";
import "./styles/math2.css";

import { nav } from "./core/router";
import { getState, completeLesson, setViewSubject } from "./core/store";
import { splashScreen } from "./screens/splash";
import { onboardingScreen } from "./screens/onboarding";
import { subjectScreen } from "./screens/subject";
import { loginScreen } from "./screens/login";
import { notebookScreen } from "./screens/notebook";
import { homeScreen } from "./screens/home";
import { doneScreen } from "./screens/done";
import { landingScreen } from "./screens/landing";
import { reviewScreen } from "./screens/review";
import { challengeScreen } from "./screens/challenge";
import { myScreen } from "./screens/my";
import type { GnavKey } from "./ui/gnav";
import { paywallScreen } from "./screens/paywall";
import { examScreen } from "./screens/exam";
import { createLessonPlayer } from "./lessons/player";
import { findLesson, isPremiumLocked } from "./content/curriculum";
import { initAuth } from "./core/auth";
import { initSync } from "./core/sync";

const frame = document.getElementById("frame")!;
nav.init(frame);

// 마지막으로 연 단원 — 레슨 완료·X 이탈 후 홈이 그 단원 지도로 돌아가게 한다.
let lastUnitId: string | undefined;

function goHome(): void {
  nav.reset(homeScreen(openLesson, lastUnitId, { onSubjects: openSubjects, onLogin: openLogin, onOpenExam: openExam, onTab: goTab }));
}

/** 하단 탭 전환(2026-07-12 IA 개편) — 탭은 스택을 쌓지 않고 reset으로 갈아끼운다. */
function goTab(k: GnavKey): void {
  if (k === "home") {
    goHome();
  } else if (k === "review") {
    nav.reset(reviewScreen({ onTab: goTab, onOpenNotebook: () => nav.go(notebookScreen(() => nav.back(), openLesson)) }));
  } else if (k === "challenge") {
    nav.reset(challengeScreen({ onTab: goTab }));
  } else {
    nav.reset(
      myScreen({
        onTab: goTab,
        onOpenAccount: openLogin,
        onOpenPaywall: () =>
          nav.go(
            paywallScreen({
              sub: "모든 프리미엄 레슨과 단원 평가 재응시를 평생 열 수 있어요.",
              onUnlocked: () => nav.back(),
              onClose: () => nav.back(),
            }),
          ),
      }),
    );
  }
}

/** 단원 종합 평가 — 항상 열린 지도 노드에서 진입. 재응시 잠금은 화면 안에서 페이월로 안내한다. */
function openExam(unitId: string): void {
  lastUnitId = unitId;
  nav.go(
    examScreen(unitId, {
      onExit: goHome,
      onOpenLesson: openLesson,
      onPaywall: (unlocked) =>
        nav.go(
          paywallScreen({
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

/** 과목 허브(홈에서 재진입) — 과목을 고르면 그 과목 지도로 홈을 다시 그린다. */
function openSubjects(): void {
  nav.go(
    subjectScreen({
      mode: "hub",
      onPickScience: () => pickSubject("sci"),
      onPickMath: () => pickSubject("math"),
      onBack: () => nav.back(),
    }),
  );
}

function pickSubject(s: "sci" | "math"): void {
  setViewSubject(s);
  lastUnitId = undefined; // 직전 과목의 단원 포커스를 버리고 새 과목 지도로
  goHome();
}

function openLogin(): void {
  nav.go(
    loginScreen(() => nav.back(), {
      onOpenNotebook: () => nav.go(notebookScreen(() => nav.back(), openLesson)),
    }),
  );
}

// 보너스 미니게임(단열 디펜스·별자리 한붓그리기)은 도전 탭으로 이사(2026-07-12) —
// 재단장 후 challenge.ts에서 minigameScreen/starGameScreen을 다시 연결한다.

function openLesson(id: string): void {
  const found = findLesson(id);
  if (!found) return;
  lastUnitId = found.unit.id;
  // 프리미엄 잠금 — 구매 전에는 페이월로 안내
  if (isPremiumLocked(found.lesson)) {
    nav.go(
      paywallScreen({
        lessonTitle: found.lesson.title,
        onUnlocked: goHome,
        onClose: () => nav.back(),
      }),
    );
    return;
  }
  const player = createLessonPlayer(found.lesson, {
    onExit: goHome,
    onComplete: (r) => {
      const gained = completeLesson(r.lessonId, r.acc, r.xp);
      const note = found.lesson.doneNote ?? found.lesson.subtitle ?? "한 걸음 더 나아갔어요!";
      nav.go(doneScreen(r, gained, note, goHome));
    },
  });
  nav.go({ el: player.el });
}

function start(): void {
  if (getState().onboarded) {
    goHome();
    return;
  }
  // 첫 사용 플로우(2026-07-12 IA): 스플래시 → 랜딩(바로 시작하기/로그인) → 과목 선택 → 학년·목표 온보딩 → 홈.
  // 프라이머리는 "바로 시작하기"(무로그인 둘러보기) — 가치 먼저, 로그인은 보조 진입이라는 정책 유지.
  const enterOnboarding = (): void => {
    if (getState().onboarded) {
      goHome(); // 랜딩에서 로그인해 서버 기록(onboarded)이 내려온 경우 — 온보딩 생략
      return;
    }
    nav.go(
      subjectScreen({
        mode: "onboard",
        onPickScience: () => {
          setViewSubject("sci");
          nav.go(onboardingScreen(goHome));
        },
        onPickMath: () => {
          setViewSubject("math");
          nav.go(onboardingScreen(goHome));
        },
      }),
    );
  };
  nav.go(
    splashScreen(() =>
      nav.go(
        landingScreen({
          onStart: enterOnboarding,
          onLogin: () =>
            nav.go(
              loginScreen(
                () => {
                  if (getState().onboarded) goHome();
                  else nav.back();
                },
                { onOpenNotebook: () => nav.go(notebookScreen(() => nav.back(), openLesson)) },
              ),
            ),
        }),
      ),
    ),
  );
}

// [임시 프리뷰] 적용 랩 시제품 — DEV에서 ?preview=u3l1v2 로 진입. 폐기 시 이 분기를 지우고 start()만 남긴다.
if (import.meta.env.DEV && new URLSearchParams(location.search).get("preview") === "u3l1v2") {
  void import("./content/previewU3l1").then(({ previewU3L1 }) => {
    const player = createLessonPlayer(previewU3L1(), {
      onExit: goHome,
      onComplete: () => goHome(), // 프리뷰는 완료를 기록하지 않는다(store 오염 방지)
    });
    nav.go({ el: player.el });
  });
} else {
  start();
}

// 로그인·동기화 부팅 — Supabase 환경변수(.env.local)가 없으면 둘 다 no-op(core/auth.ts 참조).
// initSync가 먼저 리스너를 배선해야 initAuth의 세션 복원 이벤트를 놓치지 않는다.
initSync();
void initAuth();
