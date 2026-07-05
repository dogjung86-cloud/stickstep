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
import { createLessonPlayer } from "./lessons/player";
import { findLesson } from "./content/curriculum";

const frame = document.getElementById("frame")!;
nav.init(frame);

function goHome(): void {
  nav.reset(homeScreen(openLesson, openGame));
}

function openGame(): void {
  nav.go(minigameScreen(goHome));
}

function openLesson(id: string): void {
  const found = findLesson(id);
  if (!found) return;
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
