// exprAnatomy, 식의 해부(교과서 71~72쪽 항·계수·상수항·차수). 다항식을 탭 가능한
// 조각으로 분리해 미션 순서대로 태깅한다.
//   1단계 5x+8: 항 2개 탭(+는 다리) → 상수항(8) → 계수(5x 속 5 하이라이트)
//   2단계 3x−2: 항은 3x와 −2, 부호까지 한 몸(− 또는 2를 탭하면 교정 후 −2로 합체)
//   3단계 차수 보기(1·2·0) → 정답 시 "차수 1인 다항식 = 일차식" 명명
// 채점 아님(발견 랩), 전 목표 달성 시 recordQuiz(true)+enableCTA.
// 모션은 전부 CSS transition/animation + setTimeout(타이머 Set으로 모아 cleanup 해제). rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface AnatomyStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Phase = "A1" | "A2" | "A3" | "AX" | "B" | "C";

/** 5x, 계수 하이라이트를 위해 5를 별도 스팬으로(수공 조립, mfmt와 같은 클래스). */
const HTML_5X =
  `<span class="mx"><span data-cf style="border-radius:7px; padding:0 3px; margin:0 -2px;` +
  ` transition:background .3s, color .3s, box-shadow .3s, transform .35s var(--spring-bounce)">5</span>` +
  `<i class="mx-v">x</i></span>`;
const HTML_PLUS = `<span class="mx"><span class="mx-op">+</span></span>`;
const HTML_MINUS = `<span class="mx"><span class="mx-op">−</span></span>`;
const HTML_NEG2 = `<span class="mx" style="color:var(--m-neg)">−2</span>`;

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const exprAnatomy: StepRenderer = (host, step, api) => {
  const s = step as unknown as AnatomyStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "terms", label: "항 찾기", sub: "부호까지" },
    { id: "coef", label: "계수·상수항", sub: "태깅" },
    { id: "deg", label: "차수", sub: "일차식!" },
  ]);

  const board = mboard(300);
  // 질문 바 — 질문은 반드시 조작 대상(조각·선택지)보다 위에 보여야 한다(질문이 helper에만 있던 실사용 피드백).
  const qbar = el("div", {
    style: "padding:12px 16px 0; font-size:14px; font-weight:700; color:#2A3040; text-align:center; line-height:1.5;",
    html: "식은 <b>+로 이어진 조각</b>들로 이루어져요. 그 조각이 <b>항</b>! 5x+8에서 항을 <b>모두</b> 탭하세요",
  });
  board.appendChild(qbar);
  const stage = el("div", {
    style:
      "display:flex; align-items:flex-start; justify-content:center; gap:10px;" +
      " padding:20px 12px 10px; min-height:126px;" +
      " transition:opacity .26s var(--ease-out), transform .26s var(--ease-out)",
    attrs: { role: "group", "aria-label": "식 조각" },
  });
  board.appendChild(stage);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "조각을 잘못 짚어도 괜찮아요, 왜 아닌지 알려 줄게요!",
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
  let phase: Phase = "A1";
  let finished = false;

  // ---- 조각·라벨 공용 부품 ----
  interface Piece {
    wrap: HTMLElement;
    btn: HTMLButtonElement;
    slot: HTMLElement;
  }

  function piece(html: string, opts?: { op?: boolean; aria?: string }): Piece {
    const slot = el("div", { style: "height:24px; display:flex; align-items:center; justify-content:center" });
    const btn = el("button", {
      class: "nl-card",
      html,
      attrs: { type: "button", "aria-label": opts?.aria ?? "식 조각" },
      style: opts?.op ? "font-size:24px; padding:9px 12px; color:var(--n500)" : "font-size:26px; padding:10px 16px",
    }) as HTMLButtonElement;
    const wrap = el("div", { style: "display:flex; flex-direction:column; align-items:center; gap:7px" }, slot, btn);
    return { wrap, btn, slot };
  }

  function showBadge(p: Piece, text: string, tone: "num" | "amber" = "num"): void {
    const color =
      tone === "amber"
        ? "background:#FEF4E2; border:1px solid rgba(240,164,34,.45); color:#B25E09"
        : "background:var(--subj-num-tint); border:1px solid rgba(13,165,198,.35); color:var(--subj-num-press)";
    const b = el("span", {
      style:
        `${color}; border-radius:99px; padding:2px 9px; font-size:11.5px; font-weight:800; white-space:nowrap;` +
        " opacity:0; transform:translateY(4px) scale(.8);" +
        " transition:opacity .3s var(--ease-out), transform .35s var(--spring-bounce)",
      text,
    });
    clear(p.slot);
    p.slot.appendChild(b);
    later(() => {
      b.style.opacity = "1";
      b.style.transform = "translateY(0) scale(1)";
    }, 30);
  }

  function tag(p: Piece, label: string, tone: "num" | "amber" = "num"): void {
    p.btn.classList.add("now");
    p.btn.setAttribute("aria-pressed", "true");
    showBadge(p, label, tone);
  }

  function shake(btn: HTMLElement): void {
    haptic(HAPTIC.wrong);
    btn.style.animation = "mansShake .4s";
    btn.style.borderColor = "var(--red)";
    btn.style.background = "#FEF3F4";
    later(() => {
      btn.style.animation = "";
      btn.style.borderColor = "";
      btn.style.background = "";
    }, 460);
  }

  function slideStage(rebuild: () => void): void {
    stage.style.opacity = "0";
    stage.style.transform = "translateY(10px)";
    later(() => {
      rebuild();
      stage.style.opacity = "1";
      stage.style.transform = "translateY(0)";
    }, 280);
  }

  /* ============================== 1단계: 5x+8 ============================== */

  function buildA(): void {
    clear(stage);
    const p5x = piece(HTML_5X, { aria: "5x 조각" });
    const pPlus = piece(HTML_PLUS, { op: true, aria: "더하기 기호" });
    const p8 = piece(mfmt("8"), { aria: "8 조각" });
    stage.append(p5x.wrap, pPlus.wrap, p8.wrap);

    const found = new Set<string>();

    function tagTerm(key: "5x" | "8"): void {
      if (found.has(key)) {
        toast("이미 찾은 항이에요");
        return;
      }
      found.add(key);
      haptic(HAPTIC.correct);
      tag(key === "5x" ? p5x : p8, "항");
      if (found.size === 2) {
        phase = "A2";
        toast("항 2개 발견!");
        later(() => {
          qbar.innerHTML = "잘했어요! 이 중 <b>상수항</b>, 문자 없이 수만 있는 항은 어느 것일까요?";
        }, 550);
      } else {
        toast("하나 찾았어요, 항이 또 있어요!");
      }
    }

    pPlus.btn.addEventListener("click", () => {
      if (phase !== "A1" && phase !== "A2" && phase !== "A3") return;
      shake(pPlus.btn);
      toast("부호는 항을 잇는 다리, 항이 아니에요!");
    });

    p5x.btn.addEventListener("click", () => {
      if (phase === "A1") tagTerm("5x");
      else if (phase === "A2") {
        shake(p5x.btn);
        toast("5x엔 문자 x가 있어요, 문자 없는 항을 찾아요!");
      } else if (phase === "A3") {
        // ---- 계수 발견: 5만 하이라이트 ----
        phase = "AX";
        haptic(HAPTIC.correct);
        const cf = p5x.btn.querySelector("[data-cf]") as HTMLElement | null;
        if (cf) {
          cf.style.background = "var(--subj-num)";
          cf.style.color = "#fff";
          cf.style.boxShadow = "0 2px 8px -2px rgba(13,165,198,.55)";
          cf.style.transform = "scale(1.18)";
          later(() => {
            cf.style.transform = "scale(1)";
          }, 340);
        }
        tag(p5x, "계수 5");
        chips.on("coef", "완료!");
        toast("5x = 5×x, 계수는 5!");
        helper.innerHTML =
          "5x는 <b>5×x</b>, 곱셈 기호가 숨어 있을 뿐, 문자 앞의 <b>5가 x의 계수</b>예요. 이제 새 식으로 실전 점검!";
        later(() => slideStage(buildB), 1600);
      }
    });

    p8.btn.addEventListener("click", () => {
      if (phase === "A1") tagTerm("8");
      else if (phase === "A2") {
        phase = "A3";
        haptic(HAPTIC.correct);
        tag(p8, "상수항", "amber");
        toast("문자 없이 수만, 8이 상수항!");
        later(() => {
          qbar.innerHTML = "이번엔 x의 <b>계수</b>는 어디 숨었을까요? 문자 앞에 곱해진 수를 품은 조각을 탭!";
        }, 550);
      } else if (phase === "A3") {
        shake(p8.btn);
        toast("8은 상수항이었죠, 계수는 문자 앞에 곱해진 수예요!");
      }
    });
  }

  /* ============================== 2단계: 3x−2 ============================== */

  function buildB(): void {
    phase = "B";
    clear(stage);
    qbar.innerHTML = "새 식 <b>3x−2</b>가 왔어요. 이 식의 <b>항 2개</b>를 탭하세요, 방심 금지!";
    helper.innerHTML = "뺄셈이 섞이면 항의 부호를 조심해요!";

    const p3x = piece(mfmt("3x"), { aria: "3x 조각" });
    const pMinus = piece(HTML_MINUS, { op: true, aria: "빼기 기호" });
    const p2 = piece(mfmt("2"), { aria: "2 조각" });
    stage.append(p3x.wrap, pMinus.wrap, p2.wrap);

    let got3x = false;
    let gotN2 = false;
    let merged = false;

    function checkDone(): void {
      if (!got3x || !gotN2) return;
      chips.on("terms", "−2까지!");
      later(() => slideStage(buildC), 1600);
    }

    p3x.btn.addEventListener("click", () => {
      if (got3x) {
        toast("이미 찾은 항이에요");
        return;
      }
      got3x = true;
      haptic(HAPTIC.correct);
      tag(p3x, "항");
      toast("3x는 항!");
      checkDone();
    });

    // − 또는 2를 탭하면: 교정 토스트 → 둘이 −2 한 몸으로 합체
    function mergeNeg(btn: HTMLElement, msg: string): void {
      if (merged) return;
      merged = true;
      shake(btn);
      toast(msg);
      later(() => {
        const pn2 = piece(HTML_NEG2, { aria: "−2 조각" });
        pMinus.wrap.replaceWith(pn2.wrap);
        p2.wrap.remove();
        pn2.btn.style.animation = "mansPop .4s var(--spring-bounce)";
        pn2.btn.style.boxShadow = "0 0 0 4px var(--subj-num-tint)";
        qbar.innerHTML = "빼기 2는 <b>+(−2)</b>로 읽어요, 부호까지 한 몸인 <b>−2</b>를 통째로 탭하세요!";
        pn2.btn.addEventListener("click", () => {
          if (gotN2) return;
          gotN2 = true;
          haptic(HAPTIC.correct);
          pn2.btn.style.animation = "";
          pn2.btn.style.boxShadow = "";
          tag(pn2, "항");
          toast("−2까지 통째로, 정확해요!");
          helper.innerHTML =
            "뺄셈은 <b>+(−2)</b>로 읽어요, 항은 <b>부호까지 한 몸</b>! 3x−2의 항은 3x와 <b>−2</b>예요.";
          checkDone();
        });
      }, 500);
    }
    pMinus.btn.addEventListener("click", () => mergeNeg(pMinus.btn, "− 혼자는 항이 아니에요, 뒤의 2와 한 몸!"));
    p2.btn.addEventListener("click", () => mergeNeg(p2.btn, "부호를 두고 왔어요, 항은 부호까지 포함해요!"));
  }

  /* ============================== 3단계: 차수 → 일차식 ============================== */

  function buildC(): void {
    phase = "C";
    clear(stage);
    stage.appendChild(
      el("div", { class: "mdr-q slidein", style: "margin:0; flex:1; font-size:29px", html: mfmt("5x+8") }),
    );
    qbar.innerHTML =
      "마지막, <b>5x+8</b>의 <b>차수</b>는? 항에서 문자가 곱해진 개수가 차수, 식의 차수는 그중 <b>가장 큰</b> 것!";
    helper.innerHTML = "5x에서 x는 몇 번 곱해져 있을까요?";

    const defs: { t: string; ok: boolean; why?: string }[] = [
      { t: "1", ok: true },
      { t: "2", ok: false, why: "항의 개수(2개)와 차수는 달라요, x가 몇 번 곱해졌는지를 봐요!" },
      { t: "0", ok: false, why: "상수항 8만 보면 0이지만, 식의 차수는 가장 높은 항이 정해요!" },
    ];
    const choiceRow = el("div", { class: "pt-choices" });
    const btns: HTMLButtonElement[] = [];
    for (const o of shuffled(defs)) {
      const b = el("button", {
        class: "pt-choice",
        html: mfmt(o.t),
        attrs: { type: "button", "aria-label": `차수 ${o.t}` },
      }) as HTMLButtonElement;
      btns.push(b);
      b.addEventListener("click", () => {
        if (finished) return;
        if (!o.ok) {
          haptic(HAPTIC.wrong);
          b.classList.add("no");
          later(() => b.classList.remove("no"), 460);
          toast(o.why ?? "다시 생각해 봐요");
          return;
        }
        haptic(HAPTIC.correct);
        b.style.borderColor = "var(--green)";
        b.style.background = "#F0FBF5";
        b.style.color = "#067647";
        for (const x of btns)
          if (x !== b) {
            x.disabled = true;
            x.style.opacity = ".4";
          }
        chips.on("deg");
        toast("차수는 1!");
        finish();
      });
      choiceRow.appendChild(b);
    }
    board.appendChild(choiceRow);
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    haptic(HAPTIC.done);
    later(() => {
      helper.innerHTML =
        "6x는 x가 <b>한 번</b> 곱해진 항이라 차수 1, 차수가 1인 다항식을 <b>일차식</b>이라고 해요. " +
        "항·계수·상수항·차수, 식을 읽는 네 개의 눈 완성!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }, 700);
  }

  buildA();
  api.setCTA("해부 미션 3개를 완수해요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
