import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/ui.css";
import "./styles/math.css";

import { nav } from "./core/router";
import { getState, completeLesson, setViewSubject } from "./core/store";
import { splashScreen } from "./screens/splash";
import { onboardingScreen } from "./screens/onboarding";
import { subjectScreen } from "./screens/subject";
import { loginScreen } from "./screens/login";
import { homeScreen } from "./screens/home";
import { doneScreen } from "./screens/done";
import { minigameScreen } from "./screens/minigame";
import { starGameScreen } from "./screens/starGame";
import { paywallScreen } from "./screens/paywall";
import { createLessonPlayer } from "./lessons/player";
import { findLesson, isPremiumLocked } from "./content/curriculum";

const frame = document.getElementById("frame")!;
nav.init(frame);

// 마지막으로 연 단원 — 레슨 완료·X 이탈 후 홈이 그 단원 지도로 돌아가게 한다.
let lastUnitId: string | undefined;

function goHome(): void {
  nav.reset(homeScreen(openLesson, openGame, lastUnitId, { onSubjects: openSubjects, onLogin: openLogin }));
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
  nav.go(loginScreen(() => nav.back()));
}

function openGame(unitId: string): void {
  lastUnitId = unitId;
  // 단원별 보너스 게임 분기 — 수학 I은 별자리 한붓그리기, 과학 III은 단열 디펜스
  if (unitId === "m1u1") {
    nav.go(starGameScreen(goHome));
    return;
  }
  nav.go(minigameScreen(goHome));
}

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
  } else {
    // 첫 사용 플로우: 스플래시 → 과목 선택(과학만 열림) → 학년·목표 온보딩 → 홈
    nav.go(
      splashScreen(() =>
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
        ),
      ),
    );
  }
}

start();
