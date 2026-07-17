import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/ui.css";
import "./styles/math.css";
import "./styles/math2.css";
import "./styles/body-hook.css";
import "./styles/body.css";
import "./styles/policy.css";
import "./styles/stickavatar.css";
import "./styles/tutor.css";

import { nav } from "./core/router";
import { getState, completeLesson, setViewSubject, isPremium, isReviewMode, setPremiumOverride, isDone } from "./core/store";
import type { WrongNote } from "./core/store";
import { isTutorConfigured } from "./core/tutor";
import { tutorScreen } from "./screens/tutor";
import { splashScreen } from "./screens/splash";
import { onboardingScreen } from "./screens/onboarding";
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
import { findLesson, isPremiumLocked } from "./content/curriculum";
import { initAuth, onAuthChange, isPrivilegedUser } from "./core/auth";
import { initSync } from "./core/sync";

const frame = document.getElementById("frame")!;
nav.init(frame);

// 마지막으로 연 단원 — 레슨 완료·X 이탈 후 홈이 그 단원 지도로 돌아가게 한다.
let lastUnitId: string | undefined;
// 새 레슨 첫 완료 귀환 시 홈 걷기 연출(README design/ "걷기 트리거 확정") — goHome이 1회 소비한다.
let walkFromLessonId: string | undefined;

function goHome(): void {
  const walkFrom = walkFromLessonId;
  walkFromLessonId = undefined;
  nav.reset(homeScreen(openLesson, lastUnitId, { onSubjects: openSubjects, onOpenExam: openExam, onTab: goTab }, { walkFrom }));
}

/** 하단 탭 전환(2026-07-12 IA 개편) — 탭은 스택을 쌓지 않고 reset으로 갈아끼운다. */
function goTab(k: GnavKey): void {
  if (k === "home") {
    goHome();
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
        onOpenPolicy: openPolicy,
      }),
    );
  }
}

/** 오답노트 — 프리미엄 전용(복습 탭 콘텐츠 전면 프리미엄, 2026-07-15 사용자 확정).
 *  오답 "수집"은 무료 사용자도 계속된다(구매 순간 과거 오답이 이미 쌓여 있게) — 잠긴 건 열람·다시 풀기. */
function openNotebook(): void {
  if (isPremium() || isReviewMode()) {
    nav.go(notebookScreen(() => nav.back(), openLesson, isTutorConfigured() ? openTutor : undefined));
    return;
  }
  nav.go(
    paywallScreen({
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
      sub: "취약 단원 문제 뽑기로 원하는 소단원만 골라 맞춤 문제지를 만들 수 있어요.",
      onUnlocked: () => {
        nav.back();
        openWeakDrill();
      },
      onClose: () => nav.back(),
    }),
  );
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
      onOpenNotebook: openNotebook,
      onOpenPolicy: openPolicy,
    }),
  );
}

/** 개인정보처리방침 — 마이 탭 행과 로그인 화면 동의 고지가 함께 쓴다(원본: public/privacy.html). */
function openPolicy(): void {
  nav.go(policyScreen(() => nav.back()));
}

// 보너스 미니게임은 도전 탭으로 이사(2026-07-12). 단열 디펜스는 폐기(2026-07-17 — minigame.ts 삭제),
// 별자리 한붓그리기는 재단장 후 challenge.ts에서 starGameScreen을 다시 연결한다.

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

function start(): void {
  if (getState().onboarded) {
    goHome();
    return;
  }
  // 첫 사용 플로우(2026-07-12 IA): 스플래시(=랜딩 — 플립북 정착 후 버튼 3개가 나타남) → 과목 선택 →
  // 학년·목표 온보딩 → 홈. 프라이머리는 "한번 둘러보기"(무로그인) — 가치 먼저, 로그인은 보조.
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
    splashScreen({
      onStart: enterOnboarding,
      onLogin: () =>
        nav.go(
          loginScreen(
            () => {
              if (getState().onboarded) goHome();
              else nav.back();
            },
            { onOpenNotebook: openNotebook, onOpenPolicy: openPolicy },
          ),
        ),
    }),
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
onAuthChange((u) => setPremiumOverride(isPrivilegedUser(u)));
initSync();
void initAuth();
