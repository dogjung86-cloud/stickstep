import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { BRAND } from "../core/brand";
import type { Screen } from "../core/router";

export function splashScreen(onStart: () => void): Screen {
  const startBtn = el("button", { class: "btn", text: "시작하기" });
  startBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    onStart();
  });
  const elm = el(
    "section",
    { class: "screen", attrs: { id: "sc-splash" } },
    el(
      "div",
      { class: "splash-mid" },
      el("div", { class: "logo", html: icon("compass", 46) }),
      el("div", { class: "wordmark", text: BRAND.name }),
      el("div", { class: "tagline", text: BRAND.tagline }),
      el("div", { class: "splash-note", text: BRAND.note }),
    ),
    el("div", { class: "footer" }, startBtn),
  );
  return { el: elm };
}
