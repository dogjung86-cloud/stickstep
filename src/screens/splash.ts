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
import { SPLASH_FRAMES, SPLASH_SETTLE, STUDY_ART } from "../ui/sketchArt";

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

// 플립북 컷은 코드로 그린 SVG(public/sketch/splash, 원본 qa/sketch/scenes/splash.mjs).
// 넘기는 순서는 장면 파일의 frames() 순서다: 먹기 · 티비 · 폰 · 게임 · 만화책 · 컴퓨터 · 낮잠 · 과자 ·
// 친구 · 노래 · 공놀이 · 자전거 · 강아지 · 아차! 시계(항상 마지막) → 정착 장면 "공부하자!".
// 정착 장면(2026-11-12 사용자 확정): 책상 앞에 앉아(rest) 한 손을 올려(reach, touch) 안경을 살짝 올리는 순간(push)
// 안경이 반짝이고, 마지막 자세(STUDY)에서 멈춘다. 인물은 모두 눈동자 없이 안경만 쓴 얼굴이다.
const FLIP_FRAMES = SPLASH_FRAMES.map((f) => base + f);
const STUDY = base + STUDY_ART;
const SETTLE_FRAMES = SPLASH_SETTLE.map((f) => base + f); // rest, reach, touch, push
// 자세마다 머무는 시간(ms): 앉아서 한 박자 쉬고, 손이 빠르게 올라가, 올린 채 잠깐 멈춘다
const SETTLE_MS = [620, 85, 110, 170];
const FINAL_HOLD_MS = 330; // 마지막 자세가 자리 잡은 뒤 워드마크와 버튼이 뜬다
// 안경 반짝: 그림(512 좌표) 위에 겹치는 층. 안경알 안쪽(반지름 31)에서만 푸른 빛과 흰 사선이 지나가고 별이 튄다.
// 반지름을 안경테 안쪽으로 잡고 사선을 알 밖까지 보내야 흰 줄이 테를 덮은 채 남지 않는다.
const GLINT_SVG = `<svg class="flip-glint" viewBox="0 0 512 512" aria-hidden="true">
<defs><clipPath id="splash-lens"><circle cx="210" cy="210" r="31"/><circle cx="302" cy="210" r="31"/></clipPath></defs>
<g clip-path="url(#splash-lens)"><rect class="tint" x="160" y="164" width="200" height="92" fill="#8CC4FF"/>
<g class="bar"><polygon points="196,154 232,154 196,266 160,266" fill="#fff"/><polygon points="246,154 258,154 222,266 210,266" fill="#fff"/></g></g>
<path class="star a" d="M340 136 L349 166 L379 175 L349 184 L340 214 L331 184 L301 175 L331 166 Z" fill="#FFD84A" stroke="#1c1c1e" stroke-width="6" stroke-linejoin="round"/>
<path class="star b" d="M262 232 L267 246 L281 251 L267 256 L262 270 L257 256 L243 251 L257 246 Z" fill="#fff" stroke="#1c1c1e" stroke-width="5" stroke-linejoin="round"/>
</svg>`;
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
  book.insertAdjacentHTML("beforeend", GLINT_SVG);
  const glint = book.querySelector(".flip-glint") as SVGElement;
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
    snack("선생님·학부모 공간은 준비 중이에요. 곧 열려요");
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
  // 법적 고지 문서(방침·환불)도 같은 이유로 로그인 없이 접근 — 부팅 전 화면이라 인앱 정책 화면 대신
  // 정적 원본(public/*.html)을 새 탭으로 연다(전자상거래법 고지·PG 심사 제출 URL과 동일 문서).
  // 소개 페이지(about.html)도 같은 창구에 둔다(2026-08-11 사용자 확정 — 부모 설득·브랜드 검색용
  // 정적 페이지라 문법이 같다). **"학부모·선생님이신가요?" 버튼에 연결하지 말 것**: 그 자리는
  // 나중에 학생 진도 관리 공간이 들어올 역할 진입점이라 소개 페이지가 선점하면 안 된다.
  const legalLink = (file: string, label: string, cls = ""): HTMLElement =>
    el("a", { class: `splash-legal-link ${cls}`, text: label, attrs: { href: `${base}${file}`, target: "_blank", rel: "noopener" } });
  const legal = el(
    "div",
    { class: "splash-legal" },
    legalLink("about.html", "스틱스텝 소개", "about"),
    el("span", { class: "splash-legal-sep", text: "·", attrs: { "aria-hidden": "true" } }),
    legalLink("privacy.html", "개인정보처리방침"),
    el("span", { class: "splash-legal-sep", text: "·", attrs: { "aria-hidden": "true" } }),
    legalLink("refund.html", "환불 정책"),
  );
  const foot = el("div", { class: "footer splash-foot" }, startBtn, loginBtn, teacherBtn, business, legal);
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
  let settleFrames = SETTLE_FRAMES;
  let timer = 0;
  const settleTimers: number[] = [];
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
    for (const t of settleTimers) window.clearTimeout(t);
    img.src = study;
    book.classList.add("settled");
    mid.classList.add("done");
    foot.classList.add("done"); // 버튼 3개가 워드마크에 이어 샥 나타난다
    if (!quiet) haptic(HAPTIC.ctaUnlock);
    for (const b of buttons) b.disabled = false;
  }

  // 놀이 컷이 끝나면: 카드에 탁 갇히며 앉은 자세 → 손이 올라가 안경을 살짝 올리며 반짝 → 마지막 자세에서 settle().
  // 도중에 탭하면 settle()이 타이머를 끊고 마지막 자세로 바로 간다. 움직임 줄이기 설정이면 건너뛴다.
  function settleSequence(): void {
    window.clearInterval(timer);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (settleFrames.length < 4 || reduce) {
      settle();
      return;
    }
    let t = 0;
    settleFrames.forEach((src, k) => {
      settleTimers.push(
        window.setTimeout(() => {
          if (settled) return;
          img.src = src;
          if (k === 0) book.classList.add("settled");
          if (k === 3) {
            glint.classList.add("on");
            haptic(HAPTIC.tap);
          }
        }, t),
      );
      t += SETTLE_MS[k];
    });
    settleTimers.push(
      window.setTimeout(() => {
        if (!settled) img.src = study;
      }, t),
    );
    settleTimers.push(window.setTimeout(() => settle(), t + FINAL_HOLD_MS));
  }

  function play(): void {
    let i = 0;
    const total = frames.length * LOOPS;
    img.src = frames[0];
    timer = window.setInterval(() => {
      i += 1;
      if (i >= total) {
        settleSequence();
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
      const ok = await preload([...frames, ...settleFrames, study]);
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
        settleFrames = [];
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
