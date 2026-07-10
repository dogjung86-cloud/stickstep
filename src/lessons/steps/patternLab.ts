// patternLab, 곱 패턴 랩. 곱하는 수를 1씩 줄이며 (−)×(−)=+를 패턴으로 발견.
//   1막 (+3)×□: 곱이 3씩 작아지는 패턴을 이어 (+3)×(−2)=−6, 양×음=음
//   2막 (−3)×□: 곱이 3씩 커지는 패턴을 이어 (−3)×(−2)=+6, 음×음=양(클라이맥스)
//   3막 규칙 카드: 탭해 뒤집으면 "부호가 같으면 +, 다르면 −" 한 줄 법칙
// 보기 선택은 예측 취급, 채점에 넣지 않고, 전 목표 달성 시 recordQuiz(true) 1회.
// 모션은 전부 CSS transition/animation + setTimeout 체인(rAF 금지).

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface PatternStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface RowDef {
  lhs: string; // mfmt 마크업
  rhs: string; // 정답(mfmt 마크업)
  choices?: [string, string, string]; // [정답, 오답, 오답], 표시 순서는 셔플
}

interface ActDef {
  delta: string; // 델타 배지 문구
  wrongToast: string; // 오답 토스트
  rows: RowDef[];
}

const ACTS: ActDef[] = [
  {
    delta: "곱이 3씩 작아져요",
    wrongToast: "패턴을 봐요, 곱이 3씩 작아지는 중이에요",
    rows: [
      { lhs: "(+3)×(+2)", rhs: "(+6)" },
      { lhs: "(+3)×(+1)", rhs: "(+3)" },
      { lhs: "(+3)×0", rhs: "0" },
      { lhs: "(+3)×(-1)", rhs: "(-3)", choices: ["(-3)", "(+3)", "0"] },
      { lhs: "(+3)×(-2)", rhs: "(-6)", choices: ["(-6)", "(+6)", "(-5)"] },
    ],
  },
  {
    delta: "곱이 3씩 커져요!",
    wrongToast: "패턴을 봐요, 곱이 3씩 커지는 중이에요",
    rows: [
      { lhs: "(-3)×(+2)", rhs: "(-6)" },
      { lhs: "(-3)×(+1)", rhs: "(-3)" },
      { lhs: "(-3)×0", rhs: "0" },
      { lhs: "(-3)×(-1)", rhs: "(+3)", choices: ["(+3)", "(-3)", "0"] },
      { lhs: "(-3)×(-2)", rhs: "(+6)", choices: ["(+6)", "(-6)", "(+5)"] },
    ],
  },
];

const QMARK = `<span style="color:var(--subj-num-press); font-weight:800">?</span>`;

const RULE_FRONT =
  `<span style="display:block; font-size:11.5px; font-weight:800; letter-spacing:.04em; color:var(--subj-num-press); margin-bottom:5px">탭해서 뒤집기</span>` +
  `<span style="font-size:16px">그래서… 부호 법칙은?</span>`;
const RULE_BACK =
  `<span style="display:block; font-size:11.5px; font-weight:800; letter-spacing:.04em; color:var(--subj-num-press); margin-bottom:5px">부호 법칙</span>` +
  `<span style="font-size:16.5px">부호가 <b style="color:var(--m-pos)">같으면 +</b> · <b style="color:var(--m-neg)">다르면 −</b></span>` +
  `<span style="display:block; margin-top:6px; font-size:13px; font-weight:600; color:var(--n600)">절댓값의 곱을 구하고, 그 앞에 부호만 붙이면 끝!</span>`;

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const patternLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PatternStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "pxn", label: "양×음", sub: "패턴으로" },
    { id: "nxn", label: "음×음", sub: "발견!" },
    { id: "rule", label: "부호 법칙", sub: "한 줄로" },
  ]);
  const board = mboard(360);
  const rowsWrap = el("div", { class: "pt-rows" });
  const ruleCard = el("button", {
    class: "pt-rule",
    attrs: { type: "button", "aria-expanded": "false" },
    style:
      "display:none; width:calc(100% - 28px); margin:0 14px 16px; padding:16px 14px;" +
      " border-radius:16px; background:var(--n0); border:1.5px dashed var(--subj-num);" +
      " box-shadow:var(--sh-card); color:var(--n800); font-weight:800; text-align:center;" +
      " cursor:pointer; opacity:0; transition:transform .17s ease-in, opacity .35s var(--ease-out);",
    html: RULE_FRONT,
  });
  board.append(rowsWrap, ruleCard);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "곱하는 수가 <b>1씩 작아질 때</b> 곱이 어떻게 변하는지 보세요. 완성된 세 줄의 패턴이 다음 답을 알려 줘요.",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 타이머(모든 지연은 여기로, cleanup에서 일괄 해제) ----
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  // ---- 상태 ----
  let act = 0;
  let rowEls: HTMLElement[] = [];
  let flipped = false;
  let finished = false;

  function deltaGap(): HTMLElement {
    return el(
      "div",
      { style: "display:flex; justify-content:flex-end; padding:0 4px; margin:-3px 0;", attrs: { "aria-hidden": "true" } },
      el("span", { class: "pt-delta", text: ACTS[act].delta }),
    );
  }

  function makeRow(r: RowDef, state: "done" | "ask" | "future"): HTMLElement {
    return el(
      "div",
      { class: `pt-row${state === "ask" ? " ask" : state === "future" ? " future" : ""}` },
      el("span", { class: "lhs", html: mfmt(r.lhs) }),
      el("span", { class: "eq", text: "=" }),
      el("span", { class: "rhs", html: state === "done" ? mfmt(r.rhs) : QMARK }),
    );
  }

  function mountChoices(i: number): void {
    const def = ACTS[act].rows[i];
    if (!def.choices) return;
    const wrap = el("div", { class: "pt-choices" });
    const opts = shuffled(def.choices.map((label, idx) => ({ label, correct: idx === 0 })));
    for (const o of opts) {
      const b = el("button", {
        class: "pt-choice",
        html: mfmt(o.label),
        attrs: { type: "button", "aria-label": o.label },
      });
      b.addEventListener("click", () => {
        if (o.correct) {
          solve(i, wrap);
        } else {
          haptic(HAPTIC.wrong);
          toast(ACTS[act].wrongToast);
          b.classList.add("no");
          later(() => b.classList.remove("no"), 450);
        }
      });
      wrap.appendChild(b);
    }
    rowEls[i].after(wrap);
  }

  function buildAct(): void {
    clear(rowsWrap);
    rowEls = [];
    const rows = ACTS[act].rows;
    const firstAsk = rows.findIndex((r) => !!r.choices);
    rows.forEach((r, i) => {
      const state: "done" | "ask" | "future" = r.choices ? (i === firstAsk ? "ask" : "future") : "done";
      // 완료 행 사이에 델타 배지, "3씩" 패턴을 세로로 시각화
      if (i > 0 && !r.choices && !rows[i - 1].choices) rowsWrap.appendChild(deltaGap());
      const row = makeRow(r, state);
      rowEls.push(row);
      rowsWrap.appendChild(row);
    });
    mountChoices(firstAsk);
  }

  function solve(i: number, wrap: HTMLElement): void {
    const rows = ACTS[act].rows;
    const row = rowEls[i];
    if (row.classList.contains("ok")) return;
    haptic(HAPTIC.correct);
    wrap.remove();
    row.classList.remove("ask");
    row.classList.add("ok");
    (row.querySelector(".rhs") as HTMLElement).innerHTML = mfmt(rows[i].rhs);
    // 새로 완성된 행 위에도 델타 배지가 이어진다
    const gap = deltaGap();
    gap.style.opacity = "0";
    gap.style.transition = "opacity .3s var(--ease-out)";
    rowsWrap.insertBefore(gap, row);
    later(() => {
      gap.style.opacity = "1";
    }, 30);

    if (i + 1 < rows.length && rows[i + 1].choices) {
      // 다음 물음 행 개방
      later(() => {
        rowEls[i + 1].classList.remove("future");
        rowEls[i + 1].classList.add("ask");
        mountChoices(i + 1);
        later(() => rowEls[i + 1].scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
      }, 300);
    } else if (act === 0) {
      // ---- 1막 완료: 양×음=음 발견 ----
      chips.on("pxn");
      toast("양수 × 음수 = 음수! 패턴 그대로예요");
      helper.innerHTML = "이번엔 <b>(−3)의 곱</b>이에요. 곱이 3씩 <b>커지는</b> 패턴, 0을 지나면 어떻게 될까요?";
      later(toAct2, 1300);
    } else {
      // ---- 2막 클라이맥스: 음×음=양 ----
      row.style.transition = "box-shadow .3s var(--ease-out)";
      row.style.boxShadow = "0 0 0 5px var(--subj-num-tint)";
      later(() => {
        row.style.boxShadow = "";
      }, 950);
      chips.on("nxn");
      toast("음수 × 음수 = 양수!");
      helper.innerHTML = "패턴이 알려 줬어요, 양×음은 <b>음</b>, 음×음은 <b>양</b>. 아래 카드를 탭해 한 줄로 정리해요!";
      later(showRule, 1000);
    }
  }

  function toAct2(): void {
    rowsWrap.style.transition = "opacity .26s var(--ease-out), transform .26s var(--ease-out)";
    rowsWrap.style.opacity = "0";
    rowsWrap.style.transform = "translateY(10px)";
    later(() => {
      act = 1;
      buildAct();
      rowsWrap.style.opacity = "1";
      rowsWrap.style.transform = "translateY(0)";
    }, 290);
  }

  function showRule(): void {
    ruleCard.style.display = "block";
    void ruleCard.offsetWidth; // 트랜지션 재시작
    ruleCard.style.opacity = "1";
    later(() => ruleCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  ruleCard.addEventListener("click", () => {
    if (flipped || ruleCard.style.display === "none") return;
    flipped = true;
    haptic(HAPTIC.tap);
    ruleCard.style.transform = "perspective(640px) rotateX(88deg)";
    later(() => {
      ruleCard.innerHTML = RULE_BACK;
      ruleCard.setAttribute("aria-expanded", "true");
      ruleCard.style.transform = "perspective(640px) rotateX(0deg)";
      chips.on("rule");
      finish();
    }, 175);
  });

  function finish(): void {
    if (finished || chips.count() < 3) return;
    finished = true;
    haptic(HAPTIC.done);
    toast("부호 법칙 완성!");
    helper.innerHTML =
      "발견 완료! 곱셈의 부호는 <b>같으면 +, 다르면 −</b>, 절댓값의 곱에 부호만 붙이면 어떤 곱셈도 문제없어요.";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  buildAct();
  api.setCTA("패턴으로 다음 곱을 찾아요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
