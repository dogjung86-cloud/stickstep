// areaSplit, 분배법칙 넓이 랩. 직사각형을 쪼개도 넓이 합이 같다 → 98×5 암산 지름길.
//   1막 5×7: 쪼개기 핸들을 드래그(정수 열 스냅), 어디서 잘라도 5×c + 5×(7−c) = 35
//   2막 5×98: "90+8" vs "100−2" 두 길 비교, 채웠다 빼는 지름길이 한눈에 쉬움
//   3막 넘패드: 500 − 10 = 490 입력으로 암산 완성
// 모션은 전부 CSS transition + setTimeout 체인(rAF 금지). setPointerCapture는 try/catch.

import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips, makeAnswerPad, checkAnswer } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface AreaSplitStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

// ---- SVG 헬퍼 ----
const NS = "http://www.w3.org/2000/svg";
function sv<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}
function txt(x: number, y: number, str: string, fill: string, size = 12, weight = 800): SVGTextElement {
  const t = sv("text", { x, y, fill, "font-size": size, "font-weight": weight, "text-anchor": "middle" });
  t.textContent = str;
  return t;
}

// ---- 기하 상수 ----
const VB_W = 360;
const VB_H = 170;
// 1막: 5×7 모눈
const CELL = 24;
const COLS = 7;
const ROWS = 5;
const RW = CELL * COLS;
const RH = CELL * ROWS;
const X0 = (VB_W - RW) / 2;
const Y0 = 16;
const KNOB_Y = Y0 + RH + 16;
// 2막: 5×98 (가로 1u = U px, 세로는 도식적으로 과장)
const U = 3.16;
const X0B = 22;
const Y0B = 46;
const HB = 64;

// 장면 색(파운드리 재질 문법, 시안/보라 연한 면 + 재질별 진한 라벨)
const C_CYAN_FILL = "rgba(13,165,198,.15)";
const C_CYAN_INK = "#0A87A3";
const C_VIOLET_FILL = "rgba(124,107,255,.15)";
const C_VIOLET_INK = "#6A55F2";
const C_RED_FILL = "rgba(232,67,79,.16)";
const C_RED_INK = "#E8434F";
const C_GRID = "#D3E9F0";
const C_EDGE = "#8FA5B8";
const C_DIM = "#64748B";
const C_HANDLE = "#0DA5C6";

export const areaSplit: StepRenderer = (host, step, api) => {
  const s = step as unknown as AreaSplitStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "split", label: "쪼개기", sub: "합은 그대로" },
    { id: "short", label: "지름길", sub: "100−2" },
    { id: "calc", label: "암산 완성", sub: "5×98=?" },
  ]);
  const board = mboard(214);
  const svg = sv("svg", { viewBox: `0 0 ${VB_W} ${VB_H}` });
  const stage = el("div", { class: "as-stage" });
  stage.appendChild(svg);
  const read = el("div", { class: "as-read" });
  const bSum = el("button", { class: "pt-choice", html: mfmt("98=90+8"), attrs: { type: "button", "aria-label": "98은 90 더하기 8" } });
  const bDiff = el("button", { class: "pt-choice", html: mfmt("98=100-2"), attrs: { type: "button", "aria-label": "98은 100 빼기 2" } });
  const btnRow = el("div", { class: "pt-choices", style: "display:none" }, bSum, bDiff);
  board.append(stage, read, btnRow);
  const toast = mtoast(board);

  // 3막 넘패드(숨김 대기)
  const confirmBtn = el("button", { class: "ct-btn hero", text: "확인하기", attrs: { type: "button" } });
  const setConfirm = (b: boolean): void => {
    confirmBtn.disabled = !b;
    confirmBtn.style.opacity = b ? "" : ".45";
  };
  let solved = false;
  const pad = makeAnswerPad("int", (ready) => setConfirm(ready && !solved));
  const padWrap = el(
    "div",
    { style: "display:none; opacity:0; transition:opacity .35s var(--ease-out)" },
    el("div", { class: "as-read", html: mfmt("500-10=?") }),
    pad.ansEl,
    pad.padEl,
    el("div", { class: "ct-actions", style: "padding-top:12px" }, confirmBtn),
  );
  setConfirm(false);

  const helper = el("div", {
    class: "helper",
    html: "손잡이를 <b>좌우로 드래그</b>해 직사각형을 잘라 보세요. 두 조각의 넓이를 더하면 얼마일까요?",
  });
  host.append(chips.el, helper, board, padWrap); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 타이머 ----
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  // ---- 상태 ----
  let actNo = 1;
  let col = 3; // 스냅 열(1..6)
  let divX = 0; // 절단선 현재 x(viewBox 좌표)
  let dragging = false;
  let dragOff = 0;
  const visited = new Set<number>();
  let mode2: "sum" | "diff" | null = null;
  let finished = false;

  // ---- 1막 요소 ----
  let leftRect!: SVGRectElement;
  let rightRect!: SVGRectElement;
  let lblL!: SVGTextElement;
  let lblR!: SVGTextElement;
  let topL!: SVGTextElement;
  let topR!: SVGTextElement;
  let divG!: SVGGElement;
  // ---- 2막 요소 ----
  let strip!: SVGRectElement;
  let lblTop2!: SVGTextElement;
  let centerLbl!: SVGTextElement;
  let splitLine!: SVGLineElement;
  let lblSum1!: SVGTextElement;
  let lblSum2!: SVGTextElement;
  let lblDiff!: SVGTextElement;

  const xAt = (c: number): number => X0 + c * CELL;

  function setDivX(x: number, animate: boolean): void {
    divG.style.transition = animate ? "transform .2s var(--spring-soft)" : "none";
    divG.style.transform = `translateX(${x}px)`;
    divX = x;
  }

  function layout1(): void {
    const xw = col * CELL;
    leftRect.setAttribute("width", String(xw));
    rightRect.setAttribute("x", String(X0 + xw));
    rightRect.setAttribute("width", String(RW - xw));
    const areaL = ROWS * col;
    const areaR = ROWS * (COLS - col);
    const midY = Y0 + RH / 2 + 5;
    lblL.setAttribute("x", String(X0 + xw / 2));
    lblL.setAttribute("y", String(midY));
    lblL.textContent = xw >= 58 ? `5×${col}=${areaL}` : String(areaL);
    lblR.setAttribute("x", String(X0 + xw + (RW - xw) / 2));
    lblR.setAttribute("y", String(midY));
    lblR.textContent = RW - xw >= 58 ? `5×${COLS - col}=${areaR}` : String(areaR);
    topL.setAttribute("x", String(X0 + xw / 2));
    topL.textContent = String(col);
    topR.setAttribute("x", String(X0 + xw + (RW - xw) / 2));
    topR.textContent = String(COLS - col);
    read.innerHTML = mfmt(`5×7=5×${col}+5×${COLS - col}=35`);
  }

  function setCol(c: number): void {
    if (c === col) return;
    col = c;
    haptic(HAPTIC.tap);
    layout1();
    svg.setAttribute("aria-valuenow", String(c));
  }

  function buildAct1(): void {
    svg.innerHTML = "";
    svg.setAttribute("tabindex", "0");
    svg.setAttribute("role", "slider");
    svg.setAttribute("aria-label", "쪼개기 손잡이, 좌우로 드래그하거나 화살표 키로 옮겨요");
    svg.setAttribute("aria-valuemin", "1");
    svg.setAttribute("aria-valuemax", String(COLS - 1));
    svg.setAttribute("aria-valuenow", String(col));

    leftRect = sv("rect", { x: X0, y: Y0, width: col * CELL, height: RH, fill: C_CYAN_FILL });
    rightRect = sv("rect", { x: X0 + col * CELL, y: Y0, width: RW - col * CELL, height: RH, fill: C_VIOLET_FILL });
    leftRect.style.transition = "width .16s var(--ease-out)";
    rightRect.style.transition = "width .16s var(--ease-out), x .16s var(--ease-out)";
    svg.append(leftRect, rightRect);

    for (let i = 1; i < COLS; i++)
      svg.appendChild(sv("line", { x1: X0 + i * CELL, y1: Y0, x2: X0 + i * CELL, y2: Y0 + RH, stroke: C_GRID, "stroke-width": 1 }));
    for (let j = 1; j < ROWS; j++)
      svg.appendChild(sv("line", { x1: X0, y1: Y0 + j * CELL, x2: X0 + RW, y2: Y0 + j * CELL, stroke: C_GRID, "stroke-width": 1 }));
    svg.appendChild(sv("rect", { x: X0, y: Y0, width: RW, height: RH, fill: "none", stroke: C_EDGE, "stroke-width": 1.8, rx: 3 }));

    lblL = txt(0, 0, "", C_CYAN_INK, 12.5);
    lblR = txt(0, 0, "", C_VIOLET_INK, 12.5);
    topL = txt(0, Y0 - 5, "", C_DIM, 11);
    topR = txt(0, Y0 - 5, "", C_DIM, 11);
    svg.append(lblL, lblR, topL, topR, txt(X0 - 13, Y0 + RH / 2 + 4, "5", C_DIM, 12));

    // 절단선 + 둥근 손잡이(x=0 기준 그룹, transform으로 이동)
    divG = sv("g");
    divG.appendChild(
      sv("line", { x1: 0, y1: Y0 - 6, x2: 0, y2: KNOB_Y - 11, stroke: C_HANDLE, "stroke-width": 2.4, "stroke-dasharray": "5 4", "stroke-linecap": "round" }),
    );
    divG.appendChild(sv("circle", { cx: 0, cy: KNOB_Y, r: 10, fill: "#FFFFFF", stroke: C_HANDLE, "stroke-width": 2.4 }));
    divG.appendChild(
      sv("path", { d: `M -3.4 ${KNOB_Y - 3.2} L -6.2 ${KNOB_Y} L -3.4 ${KNOB_Y + 3.2}`, fill: "none", stroke: C_HANDLE, "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" }),
    );
    divG.appendChild(
      sv("path", { d: `M 3.4 ${KNOB_Y - 3.2} L 6.2 ${KNOB_Y} L 3.4 ${KNOB_Y + 3.2}`, fill: "none", stroke: C_HANDLE, "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" }),
    );
    svg.appendChild(divG);
    setDivX(xAt(col), false);
    layout1();
  }

  function buildAct2(): void {
    svg.innerHTML = "";
    svg.removeAttribute("tabindex");
    svg.removeAttribute("aria-valuemin");
    svg.removeAttribute("aria-valuemax");
    svg.removeAttribute("aria-valuenow");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "5 곱하기 98 직사각형, 점선 100 윤곽에서 5 곱하기 2 조각이 빠진 모양");

    const solidW = 98 * U;
    const midY = Y0B + HB / 2 + 7;
    // 점선 100 윤곽 + 빠진 5×2 조각
    svg.appendChild(sv("rect", { x: X0B, y: Y0B, width: 100 * U, height: HB, fill: "none", stroke: C_EDGE, "stroke-width": 1.6, "stroke-dasharray": "6 5", rx: 2 }));
    svg.appendChild(sv("rect", { x: X0B, y: Y0B, width: solidW, height: HB, fill: C_CYAN_FILL, stroke: C_HANDLE, "stroke-width": 1.8, rx: 2 }));
    strip = sv("rect", { x: X0B + solidW, y: Y0B, width: 2 * U, height: HB, fill: C_RED_FILL, stroke: C_RED_INK, "stroke-width": 1.6, "stroke-dasharray": "4 3" });
    svg.appendChild(strip);

    lblTop2 = txt(X0B + 99 * U, Y0B - 8, "2", C_RED_INK, 11);
    centerLbl = txt(X0B + solidW / 2, midY, "5×98", C_CYAN_INK, 19);
    splitLine = sv("line", { x1: X0B + 90 * U, y1: Y0B, x2: X0B + 90 * U, y2: Y0B + HB, stroke: C_HANDLE, "stroke-width": 2, "stroke-dasharray": "5 4" });
    lblSum1 = txt(X0B + 45 * U, midY, "450", C_CYAN_INK, 15);
    lblSum2 = txt(X0B + 94 * U, midY, "40", C_VIOLET_INK, 11);
    lblDiff = txt(X0B + 99 * U, Y0B + HB + 15, "−10", C_RED_INK, 12.5);
    splitLine.style.display = "none";
    lblSum1.style.display = "none";
    lblSum2.style.display = "none";
    lblDiff.style.display = "none";
    svg.append(
      txt(X0B + solidW / 2, Y0B - 8, "98", C_CYAN_INK, 12),
      lblTop2,
      txt(12, Y0B + HB / 2 + 4, "5", C_DIM, 12),
      centerLbl,
      splitLine,
      lblSum1,
      lblSum2,
      lblDiff,
    );
  }

  function styleChoice(b: HTMLButtonElement, on: boolean): void {
    b.style.borderColor = on ? "var(--subj-num)" : "";
    b.style.background = on ? "var(--subj-num-tint)" : "";
  }

  function blinkStrip(): void {
    strip.style.transition = "opacity .16s";
    [0, 170, 340, 510].forEach((t, idx) =>
      later(() => {
        strip.style.opacity = idx % 2 === 0 ? ".2" : "1";
      }, t),
    );
    later(() => {
      strip.style.opacity = "1";
    }, 690);
  }

  function setMode2(m: "sum" | "diff"): void {
    if (actNo !== 2 || mode2 === m) return;
    mode2 = m;
    haptic(HAPTIC.select);
    styleChoice(bSum, m === "sum");
    styleChoice(bDiff, m === "diff");
    splitLine.style.display = m === "sum" ? "" : "none";
    lblSum1.style.display = m === "sum" ? "" : "none";
    lblSum2.style.display = m === "sum" ? "" : "none";
    lblDiff.style.display = m === "diff" ? "" : "none";
    centerLbl.style.display = m === "sum" ? "none" : "";
    if (m === "sum") {
      strip.style.opacity = ".35";
      lblTop2.style.opacity = ".35";
      read.innerHTML = mfmt("5×98=5×90+5×8=450+40");
      toast("되긴 해요, 그런데 곱을 두 번이나 해야 해요");
    } else {
      strip.style.opacity = "1";
      lblTop2.style.opacity = "1";
      centerLbl.textContent = "500";
      read.innerHTML = mfmt("5×98=5×100-5×2=500-10");
      blinkStrip();
      collect("short", "100−2!", "거의 100! 채웠다 빼면 한 번에 쉬워요");
    }
  }
  bSum.addEventListener("click", () => setMode2("sum"));
  bDiff.addEventListener("click", () => setMode2("diff"));

  // ---- 목표 수집 · 막 전환 ----
  function collect(id: string, sub: string, msg: string): void {
    if (!chips.on(id, sub)) return;
    toast(msg);
    if (id === "split") later(toAct2, 1400);
    else if (id === "short") later(showPad, 1100);
    if (chips.count() === 3 && !finished) {
      finished = true;
      later(() => {
        helper.innerHTML =
          "이 쪼개기의 정체는 <b>분배법칙</b>, 곱을 쪼개거나 채워서 계산해도 결과가 같아요. 99×7, 102×3도 이제 암산!";
        haptic(HAPTIC.done);
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "다음");
      }, 600);
    }
  }

  function toAct2(): void {
    actNo = 2;
    stage.style.transition = "opacity .28s var(--ease-out)";
    stage.style.opacity = "0";
    later(() => {
      buildAct2();
      btnRow.style.display = "";
      stage.style.opacity = "1";
      read.innerHTML = mfmt("5×98=?");
      helper.innerHTML = "이번엔 <b>5×98</b>, 98을 어떻게 쪼개면 암산이 쉬울까요? 두 길을 눌러 비교해 봐요.";
      later(() => btnRow.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }, 300);
  }

  function showPad(): void {
    padWrap.style.display = "block";
    void padWrap.offsetWidth;
    padWrap.style.opacity = "1";
    helper.innerHTML = "마지막, <b>500 − 10</b>. 넘패드로 답을 완성해요!";
    later(() => padWrap.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  confirmBtn.addEventListener("click", () => {
    if (solved) return;
    const v = pad.value();
    if (!v) return;
    if (checkAnswer(v, 490).good) {
      solved = true;
      pad.flash(true);
      pad.setEnabled(false);
      setConfirm(false);
      haptic(HAPTIC.correct);
      collect("calc", "490!", "정답! 5×98 = 490");
    } else {
      pad.flash(false);
      haptic(HAPTIC.wrong);
      toast("500에서 10을 빼요");
      later(() => pad.ansEl.classList.remove("bad"), 700);
    }
  });

  // ---- 1막 입력: 핸들 드래그(정수 열 스냅) + 화살표 키 ----
  function toVB(e: PointerEvent): { x: number; y: number } {
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * VB_W, y: ((e.clientY - r.top) / r.height) * VB_H };
  }
  function visit(c: number): void {
    const isNew = !visited.has(c);
    visited.add(c);
    if (visited.size >= 2 && !chips.has("split")) collect("split", "합은 늘 35!", "어디서 잘라도 합은 35!");
    else if (isNew) toast(`5×${c} + 5×${COLS - c} = 35 그대로!`);
  }
  const onDown = (e: PointerEvent): void => {
    if (actNo !== 1) return;
    const p = toVB(e);
    if (Math.abs(p.x - divX) > 30) return;
    dragging = true;
    dragOff = divX - p.x;
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 포인터 id 안전 */
    }
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const p = toVB(e);
    const x = clamp(p.x + dragOff, xAt(1), xAt(COLS - 1));
    setDivX(x, false);
    setCol(clamp(Math.round((x - X0) / CELL), 1, COLS - 1));
  };
  const onUp = (): void => {
    if (!dragging) return;
    dragging = false;
    setDivX(xAt(col), true);
    visit(col);
  };
  const onKey = (e: KeyboardEvent): void => {
    if (actNo !== 1) return;
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const c = clamp(col + d, 1, COLS - 1);
    setCol(c);
    setDivX(xAt(c), true);
    visit(c);
  };
  svg.addEventListener("pointerdown", onDown);
  svg.addEventListener("pointermove", onMove);
  svg.addEventListener("pointerup", onUp);
  svg.addEventListener("pointercancel", onUp);
  svg.addEventListener("keydown", onKey);

  buildAct1();
  api.setCTA("쪼개기 → 지름길 → 암산 완성!", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
