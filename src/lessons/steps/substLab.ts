// substLab, 대입 머신(교과서 69쪽 대입·식의 값). 식을 고르고 x 값을 스테퍼로 정한 뒤
// "대입!", 문자 자리에 수가 들어가는 순간을 2줄 계산 과정으로 펼쳐 보인다.
//   1줄차: 식에서 x가 값으로 치환된 모습(음수는 반드시 괄호와 함께, 강조 상자)
//   2줄차: 식의 값. 목표 ① 양수 대입 ② 음수 대입(괄호!) ③ (-x)²+x에 음수 대입(함정 비교).
// 식·x를 바꿔 가며 자유 탐색, 전 목표 달성 시 recordQuiz(true)+enableCTA.
// 모션은 전부 CSS transition + setTimeout(타이머 Set으로 모아 cleanup 해제). rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface SubstStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const X_MIN = -3;
const X_MAX = 4;

/** 치환된 값 강조 상자(대입의 흔적이 눈에 보이게). */
const HL_STYLE =
  "display:inline-flex; align-items:center; background:var(--subj-num-tint);" +
  " border:1.5px solid var(--subj-num); border-radius:9px; padding:1px 6px; margin:0 1px;";
const hl = (html: string): string => `<span style="${HL_STYLE}">${html}</span>`;

/** x 자리에 들어갈 값 토큰, 음수는 반드시 괄호와 함께. */
const valTok = (x: number): string => (x < 0 ? mfmt(`(${x})`) : mfmt(String(x)));

const fmtNum = (v: number): string => String(v).replace("-", "−");

/** mfmt가 "(−x)^2"를 지원하지 않아(문자 괄호 뒤 지수) 세 번째 식 라벨은 같은 클래스로 수공 조립. */
const NEGX_LABEL =
  `<span class="mx"><span class="mx-par">(</span><span class="mx-op">−</span><i class="mx-v">x</i>` +
  `<span class="mx-par">)</span><sup>2</sup><span class="mx-op">+</span><i class="mx-v">x</i></span>`;

interface ExprDef {
  label: string; // 탭·큰 표시용 HTML
  fn: (x: number) => number;
  subst: (x: number) => string; // 1줄차, x가 값으로 치환된 모습(HTML)
}

const EXPRS: ExprDef[] = [
  {
    label: mfmt("2x-1"),
    fn: (x) => 2 * x - 1,
    subst: (x) => mfmt("2×") + hl(valTok(x)) + mfmt("-1"),
  },
  {
    label: mfmt("10-x^2"),
    fn: (x) => 10 - x * x,
    subst: (x) => mfmt("10-") + `<span class="mx">${hl(valTok(x))}<sup>2</sup></span>`,
  },
  {
    label: NEGX_LABEL,
    fn: (x) => x * x + x, // (−x)² + x = x² + x
    subst: (x) =>
      `<span class="mx"><span class="mx-par">(</span><span class="mx-op">−</span>${hl(valTok(x))}` +
      `<span class="mx-par">)</span><sup>2</sup></span>` +
      mfmt("+") +
      hl(valTok(x)),
  },
];

export const substLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SubstStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "pos", label: "양수 대입", sub: "x=3" },
    { id: "neg", label: "음수 대입", sub: "괄호!" },
    { id: "trap", label: "함정 비교", sub: "(−x)² vs −x²" },
  ]);

  const board = mboard(300);

  // ---- ① 식 선택 탭 ----
  const tabs = EXPRS.map(
    (d, i) =>
      el("button", {
        class: "nl-card",
        html: d.label,
        attrs: { type: "button", "aria-label": `식 ${i + 1} 선택` },
      }) as HTMLButtonElement,
  );
  const tabRow = el("div", { class: "nl-cards", style: "padding-top:14px" }, ...tabs);

  // ---- ② 현재 식 + 계산 과정(2줄) ----
  const exprBig = el("div", { style: "display:flex; justify-content:center; font-size:27px" });
  const work = el("div", {
    style:
      "display:flex; flex-direction:column; align-items:center; justify-content:center;" +
      " gap:8px; min-height:86px; width:100%",
  });
  const qCard = el(
    "div",
    { class: "mdr-q", style: "margin:2px 14px 0; flex-direction:column; gap:8px; padding:18px 14px" },
    exprBig,
    work,
  );

  // ---- ③ x 스테퍼 ----
  const minusB = el("button", {
    class: "sd-step",
    text: "−",
    attrs: { type: "button", "aria-label": "x 1 줄이기" },
  }) as HTMLButtonElement;
  const plusB = el("button", {
    class: "sd-step",
    text: "+",
    attrs: { type: "button", "aria-label": "x 1 늘리기" },
  }) as HTMLButtonElement;
  const kv = el("div", { class: "sd-kv", attrs: { "aria-live": "polite" } });
  const ctrl = el("div", { class: "sd-ctrl", style: "padding-top:10px" }, minusB, kv, plusB);

  // ---- ④ 대입! ----
  const goB = el("button", {
    class: "ct-btn hero",
    text: "대입!",
    style: "font-size:15.5px; padding:11px 26px",
    attrs: { type: "button", "aria-label": "현재 x 값을 식에 대입" },
  }) as HTMLButtonElement;
  const actions = el("div", { class: "ct-actions" }, goB);

  board.append(tabRow, qCard, ctrl, actions);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "식을 고르고 x 값을 정한 뒤 <b>대입!</b>, 문자 자리에 수가 들어가는 순간을 지켜봐요.",
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
  let exprIdx = 0;
  let x = 3;
  let busy = false;
  let finished = false;

  function placeholder(msg: string): void {
    clear(work);
    work.appendChild(el("div", { style: "font-size:13px; font-weight:700; color:var(--n400)", text: msg }));
  }

  function paintTabs(): void {
    tabs.forEach((t, i) => {
      t.classList.toggle("now", i === exprIdx);
      t.setAttribute("aria-pressed", String(i === exprIdx));
    });
  }

  function paintX(): void {
    kv.innerHTML = `x = <b>${fmtNum(x)}</b>`;
    minusB.disabled = x <= X_MIN;
    plusB.disabled = x >= X_MAX;
    minusB.style.opacity = minusB.disabled ? ".35" : "";
    plusB.style.opacity = plusB.disabled ? ".35" : "";
  }

  function paintExpr(): void {
    exprBig.innerHTML = EXPRS[exprIdx].label;
    qCard.classList.remove("slidein");
    void qCard.offsetWidth; // 애니메이션 재시작
    qCard.classList.add("slidein");
  }

  tabs.forEach((t, i) =>
    t.addEventListener("click", () => {
      if (i === exprIdx || busy) return;
      haptic(HAPTIC.select);
      exprIdx = i;
      paintTabs();
      paintExpr();
      placeholder("식을 바꿨어요, 대입!으로 확인해요");
      if (i === 2 && !chips.has("trap"))
        helper.innerHTML = "이 식, 괄호 없는 <b>−x²</b>과 같을까요 다를까요? <b>음수</b>를 대입해서 확인해 봐요!";
    }),
  );

  function stepX(d: number): void {
    if (busy) return;
    const nx = Math.max(X_MIN, Math.min(X_MAX, x + d));
    if (nx === x) return;
    x = nx;
    haptic(HAPTIC.tap);
    paintX();
    placeholder("값을 바꿨어요, 대입!으로 확인해요");
  }
  minusB.addEventListener("click", () => stepX(-1));
  plusB.addEventListener("click", () => stepX(1));

  goB.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    haptic(HAPTIC.select);
    const d = EXPRS[exprIdx];
    const r = d.fn(x);
    clear(work);
    const lineStyle =
      "opacity:0; transform:translateY(8px);" +
      " transition:opacity .35s var(--ease-out), transform .35s var(--ease-out);";
    const line1 = el("div", { class: "mx", style: `${lineStyle} font-size:23px`, html: d.subst(x) });
    const line2 = el("div", {
      class: "mx",
      style: `${lineStyle} font-size:26px`,
      html: `<span class="mx-op">=</span><b style="color:var(--subj-num-press)">${fmtNum(r)}</b>`,
    });
    work.append(line1, line2);
    later(() => {
      line1.style.opacity = "1";
      line1.style.transform = "translateY(0)";
    }, 50);
    later(() => {
      line2.style.opacity = "1";
      line2.style.transform = "translateY(0)";
      haptic(HAPTIC.tap);
    }, 520);
    later(() => {
      onSubst(r);
      busy = false;
    }, 780);
  });

  function onSubst(r: number): void {
    // 조건 판정을 먼저, chips.on은 "새로 켜졌을 때만" true
    const gotTrap = exprIdx === 2 && x < 0 && chips.on("trap", "정체 확인!");
    const gotNeg = x < 0 && chips.on("neg", "완료!");
    const gotPos = x > 0 && chips.on("pos", "완료!");

    if (gotTrap) {
      const ax = Math.abs(x);
      toast("(−x)²은 +x²!");
      helper.innerHTML =
        `<b>(−x)²은 +x²</b>이에요! x=−${ax}이면 (−(−${ax}))²+(−${ax}) = ${ax * ax}−${ax} = <b>${fmtNum(r)}</b>. ` +
        `괄호 없는 −x²(=−${ax * ax})와는 부호가 완전히 달라요.` +
        (chips.has("pos") ? "" : " 이제 <b>양수</b> 대입도 한 번!");
    } else if (gotNeg) {
      toast("음수는 괄호에 담아 대입!");
      helper.innerHTML =
        "음수를 대입할 땐 <b>괄호가 필수</b>예요, 괄호 없이 2×−3−1처럼 쓰면 사고! " +
        `방금처럼 <b>(${fmtNum(x)})</b>에 담아야 안전해요.` +
        (chips.has("trap") ? "" : " 다음은 세 번째 식, (−x)²의 정체를 밝혀 봐요!");
    } else if (gotPos) {
      toast(`식의 값은 ${fmtNum(r)}!`);
      helper.innerHTML =
        `x가 ${x}일 때 이 식의 값은 <b>${fmtNum(r)}</b>! ` +
        (chips.has("neg") ? "새 식도 골라 자유롭게 실험해 봐요." : "이번엔 x를 <b>음수</b>로 내려서 대입해 봐요, 뭐가 달라질까요?");
    } else if (!finished) {
      toast(`식의 값은 ${fmtNum(r)}`);
      if (!chips.has("neg")) helper.innerHTML = "이번엔 x를 <b>음수</b>로 내려서 대입해 봐요, − 버튼으로!";
      else if (!chips.has("trap")) helper.innerHTML = "세 번째 식으로 바꾸고 <b>음수</b>를 대입해 봐요, (−x)²의 정체는?";
      else if (!chips.has("pos")) helper.innerHTML = "마지막 미션, x를 <b>양수</b>로 올려서 대입 1회!";
    } else {
      toast(`식의 값은 ${fmtNum(r)}`);
    }

    if (!finished && chips.count() === 3) {
      finished = true;
      haptic(HAPTIC.done);
      later(() => {
        toast("대입 마스터!");
        helper.innerHTML =
          "문자에 수를 넣는 것이 <b>대입</b>, 그 결과가 <b>식의 값</b>이에요. " +
          "음수는 언제나 <b>괄호</b>에 담아 넣기, 이 습관 하나가 부호 사고를 막아요!";
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "다음");
      }, 1500);
    }
  }

  paintTabs();
  paintExpr();
  paintX();
  placeholder("대입!을 누르면 계산 과정이 펼쳐져요");
  api.setCTA("대입 미션 3개를 완수해요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
