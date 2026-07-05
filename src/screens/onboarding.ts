// 온보딩 — 학년 → 하루 목표 2단계. 한 화면 안에서 패널을 바꾼다.
import { el, clear } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { setOnboarding } from "../core/store";
import type { Screen } from "../core/router";

const GRADES = [
  { v: "g0", t: "예비 중1", s: "초등학교 6학년" },
  { v: "g1", t: "중학교 1학년", s: "" },
  { v: "g2", t: "중학교 2학년", s: "" },
  { v: "g3", t: "중학교 3학년", s: "" },
];
const GOALS = [
  { v: 5, t: "5분 · 가볍게", s: "짧고 확실한 습관 만들기" },
  { v: 10, t: "10분 · 꾸준히", s: "가장 많은 친구들이 선택해요", rec: true },
  { v: 15, t: "15분 · 제대로", s: "개념부터 문제까지 탄탄하게" },
  { v: 20, t: "20분 · 진심으로", s: "상위권에 도전할 준비 완료" },
];

export function onboardingScreen(onDone: () => void): Screen {
  let grade: string | null = "g1";
  let goal: number | null = 10;
  let panel: 0 | 1 = 0;

  const dots = el("div", { class: "dots" }, el("i", { class: "on" }), el("i", {}));
  const back = el("button", { class: "backbtn", attrs: { "aria-label": "뒤로" }, html: icon("back", 22) });
  const head = el("div", { class: "obhead" }, back, dots, el("div", { style: "width:38px" }));

  const body = el("div", { class: "scroll pad", style: "padding-top:14px" });
  const cta = el("button", { class: "btn" });
  const footer = el("div", { class: "footer" }, cta);
  const elm = el("section", { class: "screen" }, head, body, footer);

  function opts(items: typeof GRADES | typeof GOALS, sel: string | number | null, onPick: (v: string | number) => void): HTMLElement {
    const box = el("div", { class: "opts" });
    items.forEach((it) => {
      const b = el("button", {
        class: `opt ${sel === (it as { v: string | number }).v ? "sel" : ""}`,
        html:
          `${it.t}${it.s ? `<span class="osub">${it.s}</span>` : ""}` +
          `${(it as { rec?: boolean }).rec ? '<span class="rec">추천</span>' : ""}` +
          `<span class="radio">${icon("check", 12)}</span>`,
      });
      b.addEventListener("click", () => {
        box.querySelectorAll(".opt").forEach((o) => o.classList.remove("sel"));
        b.classList.add("sel");
        haptic(HAPTIC.select);
        onPick((it as { v: string | number }).v);
      });
      box.appendChild(b);
    });
    return box;
  }

  function render(): void {
    clear(body);
    dots.children[0].classList.toggle("on", panel === 0);
    dots.children[1].classList.toggle("on", panel === 1);
    if (panel === 0) {
      body.append(
        el("div", { class: "h1", html: "반가워요!<br>지금 몇 학년이에요?" }),
        el("div", { class: "sub", text: "학년에 맞는 단원과 난이도로 준비할게요." }),
        opts(GRADES, grade, (v) => {
          grade = v as string;
          setCta();
        }),
      );
      cta.textContent = "다음";
    } else {
      body.append(
        el("div", { class: "h1", html: "하루 목표를<br>정해 볼까요?" }),
        el("div", { class: "sub", text: "부담 없이 시작해도 충분해요. 언제든 바꿀 수 있어요." }),
        opts(GOALS, goal, (v) => {
          goal = v as number;
          setCta();
        }),
      );
      cta.textContent = "이대로 시작하기";
    }
    setCta();
  }

  function setCta(): void {
    const ready = panel === 0 ? grade != null : goal != null;
    cta.disabled = !ready;
  }

  back.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    if (panel === 1) {
      panel = 0;
      render();
    }
  });
  cta.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    if (panel === 0) {
      panel = 1;
      render();
    } else {
      setOnboarding(grade ?? "g1", goal ?? 10);
      onDone();
    }
  });

  render();
  return { el: elm };
}
