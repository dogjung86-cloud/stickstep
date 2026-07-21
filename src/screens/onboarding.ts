// 온보딩 — 학년 → 관심 과목 → 하루 학습량 3단계. 완료 시 해당 학년·과목 지도로 바로 이어진다.
import { el, clear } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { setOnboarding, setViewGrade, setViewSubject } from "../core/store";
import type { SubjectId } from "../content/curriculum";
import type { Screen } from "../core/router";

interface Choice<T extends string | number> {
  v: T;
  t: string;
  s: string;
  rec?: boolean;
}

const GRADES: Choice<string>[] = [
  { v: "g0", t: "예비 중1", s: "초등학교 6학년" },
  { v: "g1", t: "중학교 1학년", s: "" },
  { v: "g2", t: "중학교 2학년", s: "" },
];
const SUBJECTS: Choice<SubjectId>[] = [
  { v: "sci", t: "과학", s: "실험하며 개념을 이해해요" },
  { v: "math", t: "수학", s: "원리를 발견하며 문제를 풀어요" },
  { v: "soc", t: "사회", s: "지도와 생활 사례로 세상을 배워요" },
  { v: "his", t: "역사", s: "만화로 시대의 흐름을 익혀요" },
];
const GOALS: Choice<number>[] = [
  { v: 5, t: "5분 · 가볍게", s: "짧고 확실한 습관 만들기" },
  { v: 10, t: "10분 · 꾸준히", s: "가장 많은 친구들이 선택해요", rec: true },
  { v: 15, t: "15분 · 제대로", s: "개념부터 문제까지 탄탄하게" },
  { v: 20, t: "20분 · 진심으로", s: "상위권에 도전할 준비 완료" },
];

export function onboardingScreen(onDone: () => void, onBack: () => void): Screen {
  let grade: string | null = null;
  let subject: SubjectId | null = null;
  let goal: number | null = null;
  let panel: 0 | 1 | 2 = 0;

  const dots = el("div", { class: "dots" }, el("i", { class: "on" }), el("i", {}), el("i", {}));
  const back = el("button", { class: "backbtn", attrs: { "aria-label": "뒤로" }, html: icon("back", 22) });
  const head = el("div", { class: "obhead" }, back, dots, el("div", { style: "width:38px" }));

  const body = el("div", { class: "scroll pad", style: "padding-top:14px" });
  const cta = el("button", { class: "btn" });
  const footer = el("div", { class: "footer" }, cta);
  const elm = el("section", { class: "screen" }, head, body, footer);

  function opts<T extends string | number>(items: Choice<T>[], sel: T | null, onPick: (v: T) => void): HTMLElement {
    const box = el("div", { class: "opts" });
    items.forEach((it) => {
      const b = el("button", {
        class: `opt ${sel === it.v ? "sel" : ""}`,
        html:
          `${it.t}${it.s ? `<span class="osub">${it.s}</span>` : ""}` +
          `${it.rec ? '<span class="rec">추천</span>' : ""}` +
          `<span class="radio">${icon("check", 12)}</span>`,
      });
      b.addEventListener("click", () => {
        box.querySelectorAll(".opt").forEach((o) => o.classList.remove("sel"));
        b.classList.add("sel");
        haptic(HAPTIC.select);
        onPick(it.v);
      });
      box.appendChild(b);
    });
    return box;
  }

  function render(): void {
    clear(body);
    [...dots.children].forEach((dot, i) => dot.classList.toggle("on", panel === i));
    if (panel === 0) {
      body.append(
        el("div", { class: "h1", html: "반가워요!<br>지금 몇 학년이에요?" }),
        el("div", { class: "sub", text: "학년에 맞는 단원과 난이도로 준비할게요." }),
        opts(GRADES, grade, (v) => {
          grade = v;
          setCta();
        }),
      );
      cta.textContent = "다음";
    } else if (panel === 1) {
      body.append(
        el("div", { class: "h1", html: "가장 관심 있는<br>과목은 무엇인가요?" }),
        el("div", { class: "sub", text: "선택한 과목의 학습 지도로 바로 안내할게요." }),
        opts(SUBJECTS, subject, (v) => {
          subject = v;
          setCta();
        }),
      );
      cta.textContent = "다음";
    } else {
      body.append(
        el("div", { class: "h1", html: "하루 학습량을<br>정해 볼까요?" }),
        el("div", { class: "sub", text: "부담 없이 시작해도 충분해요. 언제든 바꿀 수 있어요." }),
        opts(GOALS, goal, (v) => {
          goal = v;
          setCta();
        }),
      );
      cta.textContent = "학습 시작하기";
    }
    setCta();
  }

  function setCta(): void {
    const ready = panel === 0 ? grade != null : panel === 1 ? subject != null : goal != null;
    cta.disabled = !ready;
  }

  back.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    if (panel > 0) {
      panel = (panel - 1) as 0 | 1;
      render();
    } else onBack();
  });
  cta.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    if (panel < 2) {
      panel = (panel + 1) as 1 | 2;
      render();
    } else {
      setOnboarding(grade ?? "g1", goal ?? 10);
      setViewGrade(grade === "g2" ? "g2" : "g1");
      setViewSubject(subject ?? "sci");
      onDone();
    }
  });

  render();
  return { el: elm };
}
