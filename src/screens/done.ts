import { el, countUp } from "../core/dom";
import { haptic, HAPTIC } from "../core/haptics";
import { createLoop } from "../core/anim";
import { fitCanvas } from "../ui/canvas";
import type { Screen } from "../core/router";
import type { LessonResult } from "../lessons/player";

export function doneScreen(
  r: LessonResult,
  gainedXp: number,
  doneNote: string,
  onHome: () => void,
): Screen {
  const confetti = el("canvas", { attrs: { id: "confetti" } });
  const xpNum = el("span", { text: "0" });
  const statAcc = el("div", { class: "sv", text: `${r.acc}%` });
  const mm = Math.floor(r.seconds / 60);
  const ss = String(r.seconds % 60).padStart(2, "0");
  const statTime = el("div", { class: "sv", text: `${mm}:${ss}` });

  const homeBtn = el("button", { class: "btn", text: "홈으로" });
  homeBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    onHome();
  });

  const elm = el(
    "section",
    { class: "screen", attrs: { id: "sc-done" } },
    confetti,
    el(
      "div",
      { class: "done-mid" },
      el("div", {
        html: `<svg class="cc" viewBox="0 0 96 96"><circle class="ccirc" cx="48" cy="48" r="42"/><path class="cmark" d="M31 49l12 12 22-24"/></svg>`,
      }),
      el("div", { class: "done-title", text: "레슨 완료!" }),
      el("div", { class: "done-sub", text: doneNote }),
      el("div", { class: "xpline" }, "+", xpNum, el("small", { text: "XP" })),
      el(
        "div",
        { class: "stats" },
        el("div", { class: "stat" }, statAcc, el("div", { class: "sk", text: "퀴즈 정확도" })),
        el("div", { class: "stat" }, statTime, el("div", { class: "sk", text: "학습 시간" })),
      ),
    ),
    el("div", { class: "footer", style: "width:100%" }, homeBtn),
  );

  // 진입 애니메이션 트리거
  requestAnimationFrame(() => {
    elm.classList.add("play");
    countUp(xpNum, gainedXp, 900);
    haptic(HAPTIC.done);
    runConfetti(confetti);
  });

  return { el: elm };
}

function runConfetti(cv: HTMLCanvasElement): void {
  requestAnimationFrame(() => {
    const { ctx, w, h } = fitCanvas(cv);
    const cols = ["#3182F6", "#04B45F", "#FFC53D", "#FF7A93", "#8A6BFF", "#12B886"];
    const ps = Array.from({ length: 96 }, (_, i) => ({
      x: w * Math.random(),
      y: -20 - Math.random() * h * 0.4,
      vx: (Math.random() - 0.5) * 1.7,
      vy: 1.6 + Math.random() * 2.5,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.26,
      w: 5 + Math.random() * 5,
      h: 8 + Math.random() * 7,
      c: cols[i % cols.length],
    }));
    const t0 = performance.now();
    const DUR = 2600;
    const loop = createLoop((_dt, t) => {
      const elapsed = t - t0;
      ctx.clearRect(0, 0, w, h);
      const fade = elapsed > DUR - 500 ? (DUR - elapsed) / 500 : 1;
      ctx.globalAlpha = Math.max(0, fade);
      for (const p of ps) {
        p.vy += 0.045;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (elapsed >= DUR) {
        ctx.clearRect(0, 0, w, h);
        loop.stop();
      }
    });
    loop.start();
  });
}
