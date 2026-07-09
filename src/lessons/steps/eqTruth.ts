// eqTruth, 등식 참·거짓 테이블(교과서 85쪽 방정식과 그 해). 행을 탭하면 그 x 값이
// 좌변·우변에 각각 대입돼 순차 계산되고 참/거짓 판정이 붙는다.
//   1단계 5x=2x+6: x=1..4 중 x=2에서만 참 → "참이 되게 하는 값 = 해" 발견
//   2단계 x+3x=4x: 네 값 전부 참 → "모든 값에서 참 = 항등식" 발견
// 채점 아님(발견 랩), 전 목표 달성 시 recordQuiz(true)+enableCTA.
// 모션은 전부 CSS transition + setTimeout(타이머 Set으로 모아 cleanup 해제). rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface EqStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface PhaseDef {
  eq: string; // mfmt 마크업
  lhsDisp: (x: number) => string; // mfmt 마크업(대입된 계산식)
  rhsDisp: (x: number) => string;
  lhsVal: (x: number) => number;
  rhsVal: (x: number) => number;
}

const PHASES: PhaseDef[] = [
  {
    eq: "5x=2x+6",
    lhsDisp: (x) => `5×${x}`,
    rhsDisp: (x) => `2×${x}+6`,
    lhsVal: (x) => 5 * x,
    rhsVal: (x) => 2 * x + 6,
  },
  {
    eq: "x+3x=4x",
    lhsDisp: (x) => `${x}+3×${x}`,
    rhsDisp: (x) => `4×${x}`,
    lhsVal: (x) => 4 * x,
    rhsVal: (x) => 4 * x,
  },
];

const XS = [1, 2, 3, 4];

export const eqTruth: StepRenderer = (host, step, api) => {
  const s = step as unknown as EqStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "table", label: "진실 검사", sub: "4개 대입" },
    { id: "sol", label: "해 발견", sub: "x=?" },
    { id: "iden", label: "항등식", sub: "전부 참?" },
  ]);

  const board = mboard(340);
  const eqCard = el("div", { class: "mdr-q", style: "margin:14px 14px 0; min-height:72px; padding:16px" });
  const rowsWrap = el("div", {
    class: "pt-rows",
    style: "transition:opacity .28s var(--ease-out)",
    attrs: { role: "group", "aria-label": "대입 검사 표" },
  });
  board.append(eqCard, rowsWrap);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "행을 탭하면 그 값이 좌변·우변에 대입돼요. <b>x=1부터 4까지 전부</b> 검사, 등식은 어디서 참이 될까요?",
  });
  host.append(chips.el, board, helper);
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
  let phase = 0;
  let doneCount = 0;
  let evaluating = false;
  let finished = false;

  /** 등장 팝, 트랜지션을 잠깐 끄고 축소 상태를 심은 뒤 스프링으로 복귀. */
  function pop(n: HTMLElement): void {
    const t = n.style.transition;
    n.style.transition = "none";
    n.style.transform = "scale(.55)";
    void n.offsetWidth; // 축소 상태 확정
    n.style.transition = t;
    n.style.transform = "scale(1)";
  }

  function reveal(res: HTMLElement, v: number): void {
    res.innerHTML = `<span class="mx-op">=</span><b style="color:var(--n900)">${v}</b>`;
    pop(res); // 트랜지션 복구 후에 opacity를 올려야 페이드가 산다
    res.style.opacity = "1";
  }

  function swapEq(): void {
    eqCard.classList.remove("slidein");
    void eqCard.offsetWidth;
    eqCard.innerHTML = mfmt(PHASES[phase].eq);
    eqCard.classList.add("slidein");
  }

  function buildRows(): void {
    clear(rowsWrap);
    doneCount = 0;
    const def = PHASES[phase];
    for (const x of XS) {
      const mkSide = (disp: string): { cell: HTMLElement; res: HTMLElement } => {
        const res = el("span", {
          style:
            "display:inline-flex; align-items:center; opacity:.4;" +
            " transition:opacity .3s var(--ease-out), transform .35s var(--spring-bounce)",
          html: `<span class="mx-op">=</span><span style="color:var(--n300); font-weight:800">?</span>`,
        });
        const cell = el(
          "span",
          { style: "display:inline-flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:1px" },
          el("span", { html: mfmt(disp) }),
          res,
        );
        return { cell, res };
      };
      const lhs = mkSide(def.lhsDisp(x));
      const rhs = mkSide(def.rhsDisp(x));
      const verdict = el("span", {
        style:
          "min-width:46px; text-align:center; font-size:12.5px; font-weight:800; padding:4px 9px;" +
          " border-radius:99px; background:var(--n100); color:var(--n400);" +
          " transition:transform .35s var(--spring-bounce), background .25s, color .25s",
        text: "?",
        attrs: { "aria-label": "판정 대기" },
      });
      const row = el(
        "button",
        {
          class: "pt-row",
          style: "grid-template-columns:auto 1fr 1fr auto; font-size:17px; gap:8px; padding:9px 10px; width:100%",
          attrs: { type: "button", "aria-label": `x=${x} 대입 검사` },
        },
        el("span", { class: "pt-delta", style: "margin-left:0", html: `<i>x</i>=${x}` }),
        lhs.cell,
        rhs.cell,
        verdict,
      ) as HTMLButtonElement;

      row.addEventListener("click", () => {
        if (row.dataset.done === "1") {
          toast("이미 검사한 값이에요");
          return;
        }
        if (evaluating) return;
        evaluating = true;
        haptic(HAPTIC.tap);
        row.classList.add("ask");
        const lv = def.lhsVal(x);
        const rv = def.rhsVal(x);
        later(() => {
          reveal(lhs.res, lv);
          haptic(HAPTIC.tap);
        }, 180);
        later(() => {
          reveal(rhs.res, rv);
          haptic(HAPTIC.tap);
        }, 660);
        later(() => {
          row.classList.remove("ask");
          row.dataset.done = "1";
          if (lv === rv) {
            row.classList.add("ok");
            verdict.textContent = "참!";
            verdict.setAttribute("aria-label", "판정 참");
            verdict.style.background = "var(--green)";
            verdict.style.color = "#fff";
            haptic(HAPTIC.correct);
            toast(`좌변 ${lv} = 우변 ${rv}, 참!`);
          } else {
            verdict.textContent = "거짓";
            verdict.setAttribute("aria-label", "판정 거짓");
            verdict.style.background = "var(--n200)";
            verdict.style.color = "var(--n600)";
            haptic(HAPTIC.cross);
            toast(`${lv} ≠ ${rv}, 거짓`);
          }
          pop(verdict);
          doneCount += 1;
          evaluating = false;
          if (doneCount === XS.length) phaseDone();
        }, 1140);
      });

      rowsWrap.appendChild(row);
    }
  }

  function phaseDone(): void {
    if (phase === 0) {
      chips.on("table", "완료!");
      toast("네 값 모두 검사 완료!");
      later(() => {
        chips.on("sol", "x=2!");
        helper.innerHTML = "x=2일 때<b>만</b> 참이었죠, 등식을 참이 되게 하는 값, 그게 바로 <b>해</b>예요!";
      }, 700);
      later(() => {
        rowsWrap.style.opacity = "0";
      }, 2300);
      later(() => {
        phase = 1;
        haptic(HAPTIC.select);
        swapEq();
        buildRows();
        rowsWrap.style.opacity = "1";
        helper.innerHTML = "새 등식이 왔어요. 이번에도 <b>네 값 모두</b> 검사, 참은 몇 번 나올까요?";
      }, 2650);
    } else {
      chips.on("iden", "전부 참!");
      toast("네 값 전부 참!");
      later(() => {
        if (finished) return;
        finished = true;
        haptic(HAPTIC.done);
        helper.innerHTML =
          "이번엔 <b>모든 값에서 참</b>, 이런 등식을 <b>항등식</b>이라고 해요. " +
          "x=2에서만 참이던 아까 등식과는 성격이 완전히 다르죠!";
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "다음");
      }, 900);
    }
  }

  eqCard.innerHTML = mfmt(PHASES[0].eq);
  buildRows();
  api.setCTA("표를 완성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
