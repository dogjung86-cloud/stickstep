// 스플래시 — 스틱맨 플립북 로딩.
// 코믹한 포즈 프레임(public/brand/loading/0..6.png)이 타다다닥 넘어가다가
// 마지막에 "머리 질끈 묶고 공부하는 포즈"(public/brand/study.png)로 탁! 멈추며
// 워드마크가 떠오른다. 프레임이 없으면(발주 전) 아바타 5종으로 우아하게 폴백.
// 탭하면 애니메이션을 건너뛰고 바로 완성 상태로.

import { el } from "../core/dom";
import { haptic, HAPTIC } from "../core/haptics";
import { BRAND } from "../core/brand";
import type { Screen } from "../core/router";

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

const FLIP_FRAMES = [0, 1, 2, 3, 4, 5, 6].map((i) => `${base}brand/loading/${i}.webp`);
const STUDY = `${base}brand/study.webp`;
// 발주 전 폴백 — 만화 아바타(손그림 스틱맨 5종)
const FALLBACK_FRAMES = [0, 1, 2, 3, 4].map((i) => `${base}comics/avatar/${i}.png`);
const FALLBACK_STUDY = `${base}comics/avatar/4.png`;

const FRAME_MS = 105; // 타다다다 속도
const LOOPS = 2;

export function splashScreen(onStart: () => void): Screen {
  const img = el("img", { class: "flip-img", attrs: { alt: "", "aria-hidden": "true" } }) as HTMLImageElement;
  const book = el("div", { class: "flipbook" }, img);
  const word = el("div", { class: "wordmark", text: BRAND.name });
  const tag = el("div", { class: "tagline", text: BRAND.tagline });
  const note = el("div", { class: "splash-note", text: BRAND.note });
  const mid = el("div", { class: "splash-mid splash-anim" }, book, word, tag, note);

  const startBtn = el("button", { class: "btn", text: "시작하기" }) as HTMLButtonElement;
  startBtn.disabled = true;
  startBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    onStart();
  });
  const elm = el("section", { class: "screen", attrs: { id: "sc-splash" } }, mid, el("div", { class: "footer" }, startBtn));

  // ---- 프레임 프리로드(발주본 → 폴백) ----
  let frames = FLIP_FRAMES;
  let study = STUDY;
  let timer = 0;
  let settled = false;

  function preload(srcs: string[]): Promise<boolean> {
    return Promise.all(
      srcs.map(
        (src) =>
          new Promise<boolean>((res) => {
            const im = new Image();
            im.onload = () => res(true);
            im.onerror = () => res(false);
            im.src = src;
          }),
      ),
    ).then((oks) => oks.every(Boolean));
  }

  function settle(): void {
    if (settled) return;
    settled = true;
    window.clearInterval(timer);
    img.src = study;
    book.classList.add("settled");
    mid.classList.add("done");
    haptic(HAPTIC.ctaUnlock);
    startBtn.disabled = false;
  }

  function play(): void {
    let i = 0;
    const total = frames.length * LOOPS;
    img.src = frames[0];
    timer = window.setInterval(() => {
      i += 1;
      if (i >= total) {
        settle();
        return;
      }
      img.src = frames[i % frames.length];
      if (i % 3 === 0) haptic(HAPTIC.tap);
    }, FRAME_MS);
  }

  void (async () => {
    const ok = await preload([...FLIP_FRAMES, STUDY]);
    if (!ok) {
      const fbOk = await preload([...FALLBACK_FRAMES, FALLBACK_STUDY]);
      if (!fbOk) {
        // 이미지가 전혀 없으면 애니메이션 없이 바로 완성 상태
        book.classList.add("noart");
        mid.classList.add("done");
        settled = true;
        startBtn.disabled = false;
        return;
      }
      frames = FALLBACK_FRAMES;
      study = FALLBACK_STUDY;
    }
    play();
  })();

  // 탭하면 건너뛰기
  elm.addEventListener("pointerdown", () => {
    if (!settled) settle();
  });

  return { el: elm };
}
