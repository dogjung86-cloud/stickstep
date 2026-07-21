// 스플래시 = 랜딩(2026-07-12 통합, 사용자 확정) — 스틱맨 플립북 "실컷 놀다가 → 공부하자!" 서사가
// 정착 컷에서 탁 멈추면, 워드마크에 이어 하단 버튼 3개(바로 시작하기·로그인·학부모/선생님)가
// 같은 리듬으로 샥 나타난다. 별도 랜딩 화면을 두지 않는 게 결정 — 이 화면이 첫 관문이다.
// 프라이머리는 "한번 둘러보기"(무로그인 — 가치 먼저 정책, 문구는 사용자 확정), 로그인은 보조.
// 프레임이 없으면 아바타 5종으로 폴백, 탭하면 애니메이션 건너뛰고 바로 완성 상태로.

import { el } from "../core/dom";
import { haptic, HAPTIC } from "../core/haptics";
import { BRAND, BIZ_INFO } from "../core/brand";
import type { Screen } from "../core/router";
import { stepMarkSvg } from "../ui/stepMark";

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

export interface SplashScreen extends Screen {
  setSignedIn: (signedIn: boolean) => void;
}

export function splashScreen(o: { signedIn: boolean; instant?: boolean; onStart: () => void; onLogin: () => void }): SplashScreen {
  const img = el("img", { class: "flip-img", attrs: { alt: "", "aria-hidden": "true" } }) as HTMLImageElement;
  const book = el("div", { class: "flipbook" }, img);
  const word = el("div", { class: "wordmark", text: BRAND.name });
  const tag = el("div", { class: "tagline", text: BRAND.tagline });
  const note = el("div", { class: "splash-note", text: BRAND.note });
  const journey = el("div", { class: "splash-step-wrap", html: stepMarkSvg("splash-step") });
  const mid = el("div", { class: "splash-mid splash-anim" }, book, word, tag, note, journey);

  const startBtn = el("button", { class: "btn", text: "한번 둘러보기" }) as HTMLButtonElement;
  startBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onStart();
  });
  const loginBtn = el("button", { class: "ld-login", text: "로그인" }) as HTMLButtonElement;
  loginBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onLogin();
  });
  const teacherBtn = el("button", { class: "ld-teacher", text: "학부모·선생님이신가요?" }) as HTMLButtonElement;
  teacherBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    snack("선생님·학부모 공간은 준비 중이에요 — 곧 열려요");
  });
  const buttons = [startBtn, loginBtn, teacherBtn];
  for (const b of buttons) b.disabled = true; // 정착(settle) 때 함께 열린다

  // 첫 화면 자체가 공개 홈페이지 역할을 하므로 사업자 정보는 로그인·온보딩 없이 바로 확인할 수 있어야 한다.
  const business = el(
    "div",
    { class: "splash-business", attrs: { "aria-label": "사업자 정보" } },
    el("div", { class: "splash-business-title", text: "사업자 정보" }),
    ...BIZ_INFO.map((line) => el("div", { class: "splash-business-line", text: line })),
  );
  const foot = el("div", { class: "footer splash-foot" }, startBtn, loginBtn, teacherBtn, business);
  const elm = el("section", { class: "screen", attrs: { id: "sc-splash" } }, mid, foot);

  function setSignedIn(signedIn: boolean): void {
    startBtn.textContent = signedIn ? "학습 이어가기" : "한번 둘러보기";
    loginBtn.hidden = signedIn;
  }
  setSignedIn(o.signedIn);

  let snackTimer = 0;
  const snackEl = el("div", { class: "snack" });
  elm.appendChild(snackEl);
  function snack(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2000);
  }

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

  function settle(quiet = false): void {
    if (settled) return;
    settled = true;
    window.clearInterval(timer);
    img.src = study;
    book.classList.add("settled");
    mid.classList.add("done");
    foot.classList.add("done"); // 버튼 3개가 워드마크에 이어 샥 나타난다
    if (!quiet) haptic(HAPTIC.ctaUnlock);
    for (const b of buttons) b.disabled = false;
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

  if (o.instant) {
    // 학습 탭 홈 아이콘으로 돌아온 경우 — 플립북을 반복하지 않고 완성 컷을 즉시 보여 준다.
    elm.classList.add("instant");
    settle(true);
  } else {
    void (async () => {
      const ok = await preload([...FLIP_FRAMES, STUDY]);
      if (!ok) {
        const fbOk = await preload([...FALLBACK_FRAMES, FALLBACK_STUDY]);
        if (!fbOk) {
          // 이미지가 전혀 없으면 애니메이션 없이 바로 완성 상태
          book.classList.add("noart");
          mid.classList.add("done");
          foot.classList.add("done");
          settled = true;
          for (const b of buttons) b.disabled = false;
          return;
        }
        frames = FALLBACK_FRAMES;
        study = FALLBACK_STUDY;
      }
      play();
    })();
  }

  // 탭하면 건너뛰기
  elm.addEventListener("pointerdown", () => {
    if (!settled) settle();
  });

  return { el: elm, setSignedIn };
}
