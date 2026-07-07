import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/ui.css";

import { nav } from "./core/router";
import { getState, completeLesson } from "./core/store";
import { splashScreen } from "./screens/splash";
import { onboardingScreen } from "./screens/onboarding";
import { homeScreen } from "./screens/home";
import { doneScreen } from "./screens/done";
import { minigameScreen } from "./screens/minigame";
import { paywallScreen } from "./screens/paywall";
import { createLessonPlayer } from "./lessons/player";
import { findLesson, isPremiumLocked } from "./content/curriculum";

const frame = document.getElementById("frame")!;
nav.init(frame);

// 마지막으로 연 단원 — 레슨 완료·X 이탈 후 홈이 그 단원 지도로 돌아가게 한다.
let lastUnitId: string | undefined;

function goHome(): void {
  nav.reset(homeScreen(openLesson, openGame, lastUnitId));
}

function openGame(unitId: string): void {
  lastUnitId = unitId;
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
    nav.go(splashScreen(() => nav.go(onboardingScreen(goHome))));
  }
}

start();
