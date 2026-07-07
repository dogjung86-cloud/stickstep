// 스플래시 — 스틱맨 플립북 로딩 v2: "실컷 놀다가 → 공부하자!" 서사.
// 노는 프레임(먹기·티비·게임·컴퓨터·친구·공놀이·아차, public/brand/loading/0..6.webp)이
// 타다다닥 1바퀴 돌고, 머리띠("공부하자!")를 질끈 묶는 정착 컷(public/brand/study.webp)에서
// 탁! 멈추며 워드마크가 떠오른다. 프레임이 없으면 아바타 5종으로 우아하게 폴백.
// 탭하면 애니메이션을 건너뛰고 바로 완성 상태로.

import { el } from "../core/dom";
import { haptic, HAPTIC } from "../core/haptics";
import { BRAND } from "../core/brand";
import type { Screen } from "../core/router";

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

// 몽타주 순서 — 놀이 컷 13장을 리듬 있게 섞고, '아차! 시계'(6)는 항상 마지막에 온다.
// 0 먹기 · 1 티비 · 2 게임 · 3 컴퓨터 · 4 친구들 · 5 공놀이 · 6 아차!시계 ·
// 7 폰 낄낄 · 8 만화책 · 9 낮잠 · 10 과자 · 11 노래방 · 12 자전거 · 13 강아지
const FLIP_SEQ = [0, 1, 7, 2, 8, 3, 9, 10, 4, 11, 5, 12, 13, 6];
const FLIP_FRAMES = FLIP_SEQ.map((i) => `${base}brand/loading/${i}.webp`);
const STUDY = `${base}brand/study.webp`;
// 발주 전 폴백 — 만화 아바타(손그림 스틱맨 5종)
const FALLBACK_FRAMES = [0, 1, 2, 3, 4].map((i) => `${base}comics/avatar/${i}.png`);
const FALLBACK_STUDY = `${base}comics/avatar/4.png`;

// v2 플립북은 서사(먹고·놀고·티비·게임·친구·공놀이·아차!)라 1바퀴만 돌고
// 머리띠("공부하자!") 정착 컷으로 끝난다 — 반복하면 이야기가 두 번 재생돼 어색하다.
const FRAME_MS = 125; // 타다다닥 속도(서사가 읽히는 최소 호흡)
const LOOPS = 1;

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
