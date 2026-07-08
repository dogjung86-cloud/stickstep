// 과목 허브 — "무엇을 배워 볼까요?" 과목 선택 화면.
// 온보딩 진입(mode "onboard": 스플래시 다음)과 홈 재진입(mode "hub": 앱바 과목 버튼) 겸용.
// 과학만 열려 있고 수학·사회는 준비 중 카드. 배경엔 스틱맨·스틱 소품 데코(브랜드 정체성).
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { BRAND } from "../core/brand";
import { stickAvatar } from "../ui/avatar";
import { getState, currentStreak } from "../core/store";
import { CURRICULA_OF, type SubjectId } from "../content/curriculum";
import { isDone } from "../core/store";
import type { Screen } from "../core/router";

function subjectProgress(subject: SubjectId): { done: number; total: number } {
  let done = 0;
  let total = 0;
  const cur = CURRICULA_OF[subject];
  for (const units of [cur.g1, cur.g2]) {
    for (const u of units) {
      for (const l of u.lessons) {
        total += 1;
        if (isDone(l.id)) done += 1;
      }
    }
  }
  return { done, total };
}

export function subjectScreen(opts: {
  mode: "onboard" | "hub";
  onPickScience: () => void;
  onPickMath?: () => void;
  onBack?: () => void;
}): Screen {
  const st = getState();
  const head = el("div", { class: "obhead" });
  if (opts.mode === "hub" && opts.onBack) {
    const back = el("button", { class: "backbtn", attrs: { "aria-label": "뒤로" }, html: icon("back", 22) });
    back.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      opts.onBack?.();
    });
    head.append(back, el("div", {}), el("div", { style: "width:38px" }));
  } else {
    head.append(el("div", { class: "subj-brand", text: BRAND.name }), el("div", {}));
  }

  // 스낵(준비 중 안내)
  let snackTimer = 0;
  const snackEl = el("div", { class: "snack" });
  function snack(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2000);
  }

  const h1 = el("div", { class: "h1", html: opts.mode === "onboard" ? "무엇을<br>배워 볼까요?" : "과목 고르기" });
  const sub = el("div", { class: "sub", text: "과학과 수학이 열려 있어요. 사회도 곧 만나요!" });

  // ── 과학 카드(활성) — 스틱맨 쌤이 손을 흔든다 ──
  const prog = subjectProgress("sci");
  const started = prog.done > 0;
  const sci = el(
    "button",
    { class: "subj-card sci", attrs: { "aria-label": "과학 시작하기" } },
    el("div", { class: "subj-ava" }, stickAvatar(started ? "cheer" : "wave")),
    el(
      "div",
      { class: "subj-body" },
      el("div", { class: "subj-name" }, el("span", { html: icon("flask", 18) }), el("span", { text: "과학" })),
      el("div", { class: "subj-desc", text: "중1·중2 — 실험하며 배우는 개념" }),
      started
        ? el("div", { class: "subj-meta", text: `레슨 ${prog.done}개 완료 · ${currentStreak()}일 연속` })
        : el("div", { class: "subj-meta", text: "손끝 실험 랩 + 게임 지도" }),
    ),
    el("div", { class: "subj-go", html: icon("chevron", 20) }),
  );
  sci.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    opts.onPickScience();
  });

  // ── 수학 카드(활성) — 문제를 손으로 만지며 푸는 트랙 ──
  const mprog = subjectProgress("math");
  const mstarted = mprog.done > 0;
  const mth = el(
    "button",
    { class: "subj-card mth", attrs: { "aria-label": "수학 시작하기" } },
    el("div", { class: "subj-ava" }, stickAvatar(mstarted ? "cheer" : "curious")),
    el(
      "div",
      { class: "subj-body" },
      el("div", { class: "subj-name" }, el("span", { html: icon("mathop", 18) }), el("span", { text: "수학" })),
      el("div", { class: "subj-desc", text: "중1 — 계산이 아니라 감각으로" }),
      mstarted
        ? el("div", { class: "subj-meta", text: `레슨 ${mprog.done}개 완료 · ${currentStreak()}일 연속` })
        : el("div", { class: "subj-meta", text: "수와 연산부터 — 발견 랩 + 스프린트" }),
    ),
    el("div", { class: "subj-go", html: icon("chevron", 20) }),
  );
  mth.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    opts.onPickMath?.();
  });

  // ── 준비 중 카드(수학·사회) ──
  const soonCard = (name: string, ico: string, desc: string): HTMLElement => {
    const c = el(
      "button",
      { class: "subj-card soon", attrs: { "aria-label": `${name} — 준비 중`, "aria-disabled": "true" } },
      el("div", { class: "subj-ico", html: icon(ico, 24) }),
      el(
        "div",
        { class: "subj-body" },
        el("div", { class: "subj-name" }, el("span", { text: name }), el("span", { class: "subj-soon-pill", text: "준비 중" })),
        el("div", { class: "subj-desc", text: desc }),
      ),
      el("div", { class: "subj-go", html: icon("lock", 18) }),
    );
    c.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      snack(`${name}은 열심히 만들고 있어요 — 곧 만나요!`);
    });
    return c;
  };

  // ── 배경 데코 — 스틱맨 낙서 소품(연하게, 콘텐츠 방해 금지) ──
  const doodles = el("div", { class: "subj-doodles", attrs: { "aria-hidden": "true" } });
  const doodle = (svg: string, style: string): void => {
    doodles.appendChild(el("div", { class: "subj-doodle", style, html: svg }));
  };
  // 연필 든 스틱 팔 / 별 낙서 / 계단(스텝) 낙서 — 손그림 잉크 라인 문법
  doodle(
    `<svg viewBox="0 0 64 64" fill="none" stroke="#3C4654" stroke-width="2.2" stroke-linecap="round"><circle cx="26" cy="16" r="8" fill="#fff"/><path d="M23 14h2M29 14h2M23 20q3 2 6 0"/><path d="M26 24v16M26 30l-9 7M26 30l10 6M26 40l-8 12M26 40l9 12"/><path d="M36 36l12-9 3 4-12 9z" fill="#FFD98A" stroke-width="1.8"/></svg>`,
    "right:7%;top:8%;width:72px;transform:rotate(6deg)",
  );
  doodle(
    `<svg viewBox="0 0 64 64" fill="none" stroke="#8B95A1" stroke-width="2"><path d="M8 52h12v-10h12V32h12V22h12" stroke-linecap="round"/><path d="M46 14l1.6 3.6 3.6 1.6-3.6 1.6L46 24l-1.6-3.2-3.6-1.6 3.6-1.6z" fill="#FFD98A" stroke="none"/></svg>`,
    "right:6%;bottom:16%;width:84px;opacity:.5",
  );
  doodle(
    `<svg viewBox="0 0 64 64" fill="none" stroke="#3C4654" stroke-width="2.2" stroke-linecap="round"><circle cx="32" cy="18" r="8" fill="#fff"/><path d="M29 16h2M35 16h2M29 21q3 2 6 0"/><path d="M32 26v14M32 30l-10 2M32 30l10 2M32 40l-7 12M32 40l7 12"/><path d="M14 58h36" stroke="#C4CAD2"/></svg>`,
    "left:10%;bottom:8%;width:64px;opacity:.55;transform:rotate(5deg)",
  );

  const body = el(
    "div",
    { class: "scroll pad subj-body-wrap" },
    h1,
    sub,
    el("div", { class: "subj-list" }, sci, mth, soonCard("사회", "globe", "지도 위에서 배우는 세상")),
    el("div", { class: "subj-note", text: st.onboarded ? "과목은 언제든 여기서 바꿀 수 있어요." : "지금은 과학부터! 다른 과목도 준비되는 대로 열려요." },
    ),
  );

  const elm = el("section", { class: "screen subj-screen" }, head, doodles, body, snackEl);
  return { el: elm };
}
