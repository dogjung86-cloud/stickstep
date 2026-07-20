// 과목 허브, "무엇을 배워 볼까요?" 과목 선택 화면.
// 온보딩 진입(mode "onboard": 스플래시 다음)과 하단 과목 탭(onTab — 2026-07-20 신설, 런처형:
// 과목을 고르면 main.ts pickSubject가 학습 탭으로 점프) 겸용. 구 홈 앱바 subj-box 진입은 폐기.
// 배경엔 스틱맨·스틱 소품 데코(브랜드 정체성).
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { BRAND } from "../core/brand";
import { stickAvatar } from "../ui/avatar";
import { getState } from "../core/store";
import { CURRICULA_OF, type SubjectId } from "../content/curriculum";
import { isDone } from "../core/store";
import { gnav, type GnavKey } from "../ui/gnav";
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
  onPickSoc?: () => void;
  onPickHis?: () => void;
  onBack?: () => void;
  /** 하단 과목 탭 모드 — 주면 탭바(gnav)·tab-head 뒤로가기 장착(복습·도전·마이 탭과 공통 문법). */
  onTab?: (k: GnavKey) => void;
}): Screen {
  const st = getState();
  const tabMode = !!opts.onTab;
  let head: HTMLElement;
  if (tabMode) {
    // 탭 문법(2026-07-20): 상단 뒤로가기 = 학습 탭 복귀 — 복습·도전·마이와 동일
    const backToHome = el("button", { class: "tab-back", attrs: { "aria-label": "학습 탭으로 돌아가기" }, html: icon("back", 19) });
    backToHome.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      opts.onTab?.("home");
    });
    head = el("div", { class: "tab-head" }, el("div", { class: "tab-head-row" }, backToHome, el("div", { class: "h1 sm", text: "과목" })));
  } else {
    head = el("div", { class: "obhead" });
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
  }

  const h1 = el("div", { class: "h1", html: opts.mode === "onboard" ? "무엇을<br>배워 볼까요?" : "과목 고르기" });
  const sub = el("div", { class: "sub", text: "과학·수학·사회·역사가 열려 있어요. 골라 볼까요?" });

  // 과목 카드 스틱맨 — 발주 일러스트(public/brand/subj, 과목 소품 든 상반신) 우선, 로드 실패 시
  // 기존 stickAvatar 폴백. lazy 금지(.scroll 컨테이너에서 안 뜨는 사고 14 계보).
  const subjArt = (key: string, fallback: Parameters<typeof stickAvatar>[0]): HTMLElement => {
    const img = document.createElement("img");
    img.src = `${import.meta.env.BASE_URL}brand/subj/${key}.webp`;
    img.alt = "";
    img.addEventListener("error", () => img.replaceWith(stickAvatar(fallback)));
    return img;
  };

  // ── 과학 카드(활성), 스틱맨 쌤이 손을 흔든다 ──
  const prog = subjectProgress("sci");
  const started = prog.done > 0;
  const sci = el(
    "button",
    { class: "subj-card sci", attrs: { "aria-label": "과학 시작하기" } },
    el("div", { class: "subj-ava" }, subjArt("sci", started ? "cheer" : "wave")),
    el(
      "div",
      { class: "subj-body" },
      el("div", { class: "subj-name" }, el("span", { html: icon("flask", 18) }), el("span", { text: "과학" })),
      el("div", { class: "subj-desc", text: "중1·중2 — 실험하며 배우는 개념" }),
      // 태그라인 상시 표시(2026-07-21 사용자 확정 — 진행도는 학습 탭이 담당, 과목 고르는 화면은 "이 과목이 뭔지")
      el("div", { class: "subj-meta", text: "손끝 실험 랩 + 3D 우주 탐험" }),
    ),
    el("div", { class: "subj-go", html: icon("chevron", 20) }),
  );
  sci.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    opts.onPickScience();
  });

  // ── 수학 카드(활성), 문제를 손으로 만지며 푸는 트랙 ──
  const mprog = subjectProgress("math");
  const mstarted = mprog.done > 0;
  const mth = el(
    "button",
    { class: "subj-card mth", attrs: { "aria-label": "수학 시작하기" } },
    el("div", { class: "subj-ava" }, subjArt("math", mstarted ? "cheer" : "curious")),
    el(
      "div",
      { class: "subj-body" },
      el("div", { class: "subj-name" }, el("span", { html: icon("mathop", 18) }), el("span", { text: "수학" })),
      el("div", { class: "subj-desc", text: "중1·중2 — 단순 계산이 아닌, 감각으로" }),
      el("div", { class: "subj-meta", text: "수학의 원리를 발견하는 랩 + 스피드 퀴즈" }),
    ),
    el("div", { class: "subj-go", html: icon("chevron", 20) }),
  );
  mth.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    opts.onPickMath?.();
  });

  // ── 사회 카드(활성), 지도 위 세계 여행 트랙 ──
  const sprog = subjectProgress("soc");
  const sstarted = sprog.done > 0;
  const soc = el(
    "button",
    { class: "subj-card soc", attrs: { "aria-label": "사회 시작하기" } },
    el("div", { class: "subj-ava" }, subjArt("soc", sstarted ? "cheer" : "wave")),
    el(
      "div",
      { class: "subj-body" },
      el("div", { class: "subj-name" }, el("span", { html: icon("globe", 18) }), el("span", { text: "사회" })),
      el("div", { class: "subj-desc", text: "중1 — 지도 위에서 배우는 세상" }),
      el("div", { class: "subj-meta", text: "진짜 세계지도 배치 랩 + 생활 사례 판정" }),
    ),
    el("div", { class: "subj-go", html: icon("chevron", 20) }),
  );
  soc.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    opts.onPickSoc?.();
  });

  // ── 역사 카드(활성), 만화로 시간 여행을 떠나는 트랙 ──
  const hprog = subjectProgress("his");
  const hstarted = hprog.done > 0;
  const his = el(
    "button",
    { class: "subj-card his", attrs: { "aria-label": "역사 시작하기" } },
    el("div", { class: "subj-ava" }, subjArt("his", hstarted ? "cheer" : "curious")),
    el(
      "div",
      { class: "subj-body" },
      el("div", { class: "subj-name" }, el("span", { html: icon("book", 18) }), el("span", { text: "역사" })),
      el("div", { class: "subj-desc", text: "중1 — 만화로 떠나는 시간 여행" }),
      el("div", { class: "subj-meta", text: "웃으며 읽는 스틱맨 만화 + 단원별 요약 정리" }),
    ),
    el("div", { class: "subj-go", html: icon("chevron", 20) }),
  );
  his.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    opts.onPickHis?.();
  });

  // ── 배경 데코, 스틱맨 낙서 소품(연하게, 콘텐츠 방해 금지) ──
  const doodles = el("div", { class: "subj-doodles", attrs: { "aria-hidden": "true" } });
  const doodle = (svg: string, style: string): void => {
    doodles.appendChild(el("div", { class: "subj-doodle", style, html: svg }));
  };
  // 연필 든 스틱 팔 / 별 낙서 / 계단(스텝) 낙서, 손그림 잉크 라인 문법
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
    // 탭 모드는 tab-head "과목"이 제목 — 본문 h1("과목 고르기")은 중복이라 뺀다(2026-07-21 사용자 지시)
    ...(tabMode ? [] : [h1]),
    sub,
    el("div", { class: "subj-list" }, sci, mth, soc, his),
    el("div", { class: "subj-note", text: st.onboarded ? "과목은 언제든 여기서 바꿀 수 있어요." : "지금은 과학부터! 다른 과목도 준비되는 대로 열려요." },
    ),
  );

  const elm = el(
    "section",
    { class: `screen subj-screen ${tabMode ? "tabscr" : ""}`, attrs: tabMode ? { id: "sc-subjects" } : {} },
    head,
    doodles,
    body,
  );
  if (tabMode && opts.onTab) elm.appendChild(gnav("subjects", opts.onTab));
  return { el: elm };
}
