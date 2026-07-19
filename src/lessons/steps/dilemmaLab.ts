// dilemmaLab — 시나리오 갈림길 랩(일반사회 문법 2호, 사회 Ⅶ 확립 — Ⅷ~Ⅻ 재사용 후보).
// 구조가 곧 교육이다: **"정답 없는 선택"과 "정답 있는 판정"을 국면으로 분리**한다.
//   국면 1(선택 — 채점 없음): 갈림길에서 어느 쪽을 골라도 gain과 loss가 함께 온다.
//     한쪽을 겪은 뒤 "시간 되감기"로 다른 갈래도 걷게 해 "무엇을 골라도 잃는 게 있다"를
//     체험시킨다 — 두 갈래를 모두 겪어야 국면 2가 열린다.
//   국면 2(명명 — 정답 있음): 그 곤란함의 '이름'을 판정(msn 문법, options[0]=정답)하고
//     용어 카드로 굳힌다. recordQuiz는 이 판정의 첫 시도만 본다(선택은 채점하지 않는다).
// 데이터는 ui/judgeKit.ts DILEMMAS[defId] — 렌더러는 파라미터형(본체 수정 없이 새 딜레마 추가).
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import { DILEMMAS, type DilemmaChoice } from "../../ui/judgeKit";
import type { StepRenderer } from "../types";

interface DilemmaStep {
  title: string;
  lead?: string;
  dilemma: string; // DILEMMAS 키
  cta?: string;
  curio?: Curio;
}

/** 갈림길 위 스틱맨 — 양쪽 지위가 점선으로 당기는 구도(손그림 라인 유지). */
function pulledStickman(): string {
  return `<svg viewBox="0 0 240 120" fill="none" aria-hidden="true">
    <path d="M20 96q40-10 88-10t92 10" stroke="#2E3E5E" stroke-width="2" opacity=".6"/>
    <path d="M118 86q-30-6-92-4M122 86q34-6 96-4" stroke="#5E7096" stroke-width="1.6" stroke-dasharray="5 5" opacity=".7"/>
    <g stroke="#E8EDF6" stroke-width="2.6" stroke-linecap="round" fill="none">
      <circle cx="120" cy="38" r="9" fill="#0B1524"/>
      <path d="M120 47v22M120 52l-17 8M120 52l17 8M120 69l-10 17M120 69l10 17"/>
    </g>
    <circle cx="117" cy="36.6" r="1.2" fill="#E8EDF6"/><circle cx="123" cy="36.6" r="1.2" fill="#E8EDF6"/>
    <path d="M117.5 41.5q2.5 1.6 5 0" stroke="#E8EDF6" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M132 30q4-5 9-5M108 30q-4-5-9-5" stroke="#8FA2C4" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
    <path d="M136 24l1.6-4M104 24l-1.6-4" stroke="#8FA2C4" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>
    <ellipse cx="120" cy="98" rx="16" ry="2.6" fill="#000" opacity=".3"/>
  </svg>`;
}

export const dilemmaLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DilemmaStep;
  const def = DILEMMAS[s.dilemma];
  if (!def) {
    host.appendChild(el("div", { class: "h1", html: s.title }));
    host.appendChild(el("div", { class: "sub", text: `시나리오 데이터가 없어요: ${s.dilemma}` }));
    api.setCTA("다음", { enabled: true, onClick: api.next });
    return;
  }

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chipDefs: [string, string][] = [
    ["a", def.chips.a],
    ["b", def.chips.b],
    ["name", def.chips.name],
  ];
  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    ...chipDefs.map(([g, label]) =>
      el("div", { class: "pn-badge world", dataset: { g } }, el("b", { text: label }), el("span", { text: g === "name" ? "마지막에" : "걸어 보기" })),
    ),
  );
  const helper = el("div", { class: "helper", html: def.intro });

  // ── 무대: 시각 필 + 지위 배지 + 스틱맨 + 갈림길 버튼 ──
  const when = el("div", { class: "dlm-when", text: def.when });
  const stakesRow = el(
    "div",
    { class: "dlm-stakes" },
    ...def.stakes.map((st, i) =>
      el("div", { class: `dlm-stake ${i === 0 ? "l" : "r"}`, dataset: { st: st.id } }, el("b", { text: st.badge }), el("span", { text: st.role })),
    ),
  );
  const man = el("div", { class: "dlm-man" });
  man.innerHTML = pulledStickman();
  const choiceBtns = def.choices.map((c) =>
    el("button", { class: "dlm-choice", attrs: { type: "button" }, dataset: { ch: c.id } }, el("b", { text: c.label }), el("span", { class: "dlm-check", text: "" })),
  );
  const choicesRow = el("div", { class: "dlm-choices" }, ...choiceBtns);

  // 선택 결과 패널(장면 + 얻은 것/잃은 것)
  const sceneTxt = el("div", { class: "dlm-scene" });
  const gainCol = el("div", { class: "dlm-col gain" });
  const lossCol = el("div", { class: "dlm-col loss" });
  const rewind = el("button", { class: "dlm-rewind", attrs: { type: "button" }, html: "시간 되감기 — 갈림길로 돌아가기" });
  const result = el("div", { class: "dlm-result" }, sceneTxt, el("div", { class: "dlm-cols" }, gainCol, lossCol), rewind);

  const stage = el("div", { class: "stage dlm-stage" }, when, stakesRow, man, choicesRow, result);

  // ── 국면 2: 명명 판정(msn 문법) + 용어 카드 ──
  const quizQ = el("div", { class: "msn-q", html: def.naming.q });
  const opts = def.naming.options.map((o, i) =>
    el("button", { class: "msn-opt", attrs: { type: "button" }, dataset: { o: String(i) }, html: o }),
  );
  const quizCard = el("div", { class: "msn-quiz" }, quizQ, ...opts);
  const termCard = el(
    "div",
    { class: "dlm-term" },
    el("div", { class: "dlm-term-k", text: "이 상황의 이름" }),
    el("b", { text: def.naming.term }),
    el("p", { html: def.naming.def }),
  );

  host.append(goalChips, helper, stage, quizCard, termCard);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };

  const walked = new Set<string>(); // 겪은 갈래(choice id)
  let inResult = false;
  let namingDone = false;
  let cleanNaming = true;

  const chipOn = (g: string, sub: string): void => {
    const chip = goalChips.querySelector(`[data-g="${g}"]`) as HTMLElement;
    if (!chip || chip.classList.contains("on")) return;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = sub;
    haptic(HAPTIC.ctaUnlock);
  };

  function openNaming(): void {
    quizCard.classList.add("show");
    later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function showResult(c: DilemmaChoice): void {
    inResult = true;
    stage.classList.add("chosen");
    sceneTxt.innerHTML = c.scene;
    gainCol.innerHTML = "";
    lossCol.innerHTML = "";
    gainCol.appendChild(el("div", { class: "dlm-col-h", text: "얻은 것" }));
    lossCol.appendChild(el("div", { class: "dlm-col-h", text: "잃은 것" }));
    c.gain.forEach((g, i) => {
      const it = el("div", { class: "dlm-item", style: `--d:${0.35 + i * 0.22}s`, html: g });
      gainCol.appendChild(it);
    });
    c.loss.forEach((l, i) => {
      const it = el("div", { class: "dlm-item bad", style: `--d:${0.85 + i * 0.22}s`, html: l });
      lossCol.appendChild(it);
    });
    result.classList.remove("show");
    void result.offsetWidth;
    result.classList.add("show");

    const first = !walked.has(c.id);
    walked.add(c.id);
    const btn = choiceBtns.find((b) => b.dataset.ch === c.id);
    btn?.classList.add("walked");
    const mark = btn?.querySelector(".dlm-check");
    if (mark) mark.textContent = "걸어 봤어요";
    if (first) chipOn(c.id === def.choices[0].id ? "a" : "b", "겪었어요");

    if (walked.size >= def.choices.length) {
      rewind.classList.add("hide");
      later(() => {
        helper.innerHTML = "두 갈래를 모두 걸었어요 — 어느 쪽도 <b>가볍지 않았죠</b>. 이 곤란함의 정체를 아래에서 밝혀 봐요!";
        openNaming();
      }, 1700);
    } else {
      later(() => {
        helper.innerHTML = def.reprompt;
        rewind.classList.remove("hide");
      }, 1600);
    }
  }

  choiceBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (inResult) return;
      haptic(HAPTIC.select);
      showResult(def.choices[i]);
    });
  });

  rewind.addEventListener("click", () => {
    if (!inResult) return;
    haptic(HAPTIC.tap);
    inResult = false;
    stage.classList.remove("chosen");
    result.classList.remove("show");
    rewind.classList.add("hide");
    helper.innerHTML = `다시 ${def.when} — 이번엔 <b>아직 걷지 않은 길</b>을 골라 봐요.`;
  });

  opts.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (namingDone) return;
      if (i === 0) {
        namingDone = true;
        btn.classList.add("ok");
        opts.forEach((b, k) => k !== 0 && b.classList.add("dim"));
        haptic(HAPTIC.correct);
        chipOn("name", def.naming.term);
        helper.innerHTML = def.naming.good;
        termCard.classList.add("show");
        later(() => termCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
        later(() => {
          helper.innerHTML = def.finale;
          api.recordQuiz(cleanNaming);
          api.enableCTA(s.cta ?? "다음");
        }, 1600);
      } else {
        cleanNaming = false;
        btn.classList.add("no");
        haptic(HAPTIC.wrong);
        helper.innerHTML = def.naming.wrong;
        later(() => btn.classList.remove("no"), 900);
      }
    });
  });

  api.setCTA("두 갈래를 모두 걸어 봐요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
