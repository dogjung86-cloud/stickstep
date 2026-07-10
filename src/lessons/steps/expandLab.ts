// expandLab, 전개 작업대(중2 수학 Ⅰ L9, 책 41~43쪽). 단항식×다항식을 직사각형 넓이 분배로
// 눈에 보이게 쪼개고(전개), 반대로 (다항식)÷(단항식)은 조각마다 나눠 되돌린다.
// 중1 areaSplit(수 분배 98×5)의 문자 승격판.
//   국면 1 "쪼개기 = 전개": 3a(4a+b), 경계 눈금의 손잡이를 아래로 드래그(칼질, 탭 폴백)하면
//          두 조각으로 갈라지고 3a×4a=12a², 3a×b=3ab 라벨 → 위 저울 카드가 = 로 채워진다.
//   국면 2 "음수 항 분배": 2a(3a−5), 예측(뒤 항을 빼먹는 오개념 선택지) → 칼질로 확인,
//          −5 구간 조각은 빨간 톤(빼는 넓이, 절단 뒤 점선 테두리).
//   국면 3 "되돌리기 = 나눗셈": (8a²+6ab)÷2a, 조각마다 [÷2a] 버튼. 세로 2a를 걷어내면
//          가로(몫)만 남는 연출. 한 조각만 나누고 완성 선언하면 "각 항을 따로따로" 교정.
// 목표 칩 3: cutk(쪼개서 전개) · minus(음수 항 분배) · undo(각 항 나눗셈 되돌리기).
// 모션은 전부 CSS transition + setTimeout 체인(rAF 금지). 포인터 캡처는 geoKit
// capturePointer(try/catch). 스타일은 math2.css의 .exl-* 섹션. 참조 구현: areaSplit(원전).

import { el, clamp, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/* ---- SVG 헬퍼 ---- */
const NS = "http://www.w3.org/2000/svg";
function sv<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}

/** SVG 수식 텍스트: 영문자는 이탤릭, ^n은 위첨자 tspan, '-'는 −. (mfmt의 SVG 판) */
function fml(
  x: number,
  y: number,
  src: string,
  fill: string,
  size = 13,
  anchor: "middle" | "start" | "end" = "middle",
  weight = 800,
): SVGTextElement {
  const t = sv("text", { x, y, fill, "font-size": size, "font-weight": weight, "text-anchor": anchor });
  let pendDy = 0;
  let buf = "";
  let bufItalic = false;
  const flush = (): void => {
    if (!buf) return;
    const attrs: Record<string, string | number> = {};
    if (pendDy) {
      attrs.dy = pendDy;
      pendDy = 0;
    }
    if (bufItalic) attrs["font-style"] = "italic";
    const ts = sv("tspan", attrs);
    ts.textContent = buf;
    t.appendChild(ts);
    buf = "";
  };
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "^") {
      const m = src.slice(i).match(/^\^(\d+)/);
      if (m) {
        flush();
        const up = -size * 0.36;
        const ts = sv("tspan", { "font-size": Math.round(size * 6.6) / 10, dy: up + pendDy });
        ts.textContent = m[1];
        t.appendChild(ts);
        pendDy = -up;
        i += m[0].length;
        continue;
      }
    }
    const italic = /[a-z]/.test(ch);
    if (buf && italic !== bufItalic) flush();
    bufItalic = italic;
    buf += ch === "-" ? "−" : ch;
    i += 1;
  }
  flush();
  return t;
}

/* ---- 기하·재질 상수 ---- */
const VB_W = 360;
// 파운드리 재질: 3스톱 근-동조 그라데이션 면 + 재질별 최암색 스트로크 + 접촉 그림자
type Mat = "grape" | "cyan" | "red";
const GRAD: Record<Mat, [string, string, string]> = {
  grape: ["#F7ECFA", "#EBD5F3", "#DCC0EA"],
  cyan: ["#E6F5FA", "#D2EBF4", "#BEE0EE"],
  red: ["#FDEEF0", "#F9DBE0", "#F3C7CE"],
};
const INK: Record<Mat, string> = { grape: "#7D2A93", cyan: "#0A87A3", red: "#D6394B" };
const C_DIM = "#64748B";
const C_AXIS = "#94A3B8";
const C_KNIFE = "#9C36B5";
const C_GUIDE = "#C77BD6";

interface CutSeg {
  w: number; // 구간 픽셀 폭
  label: string; // 위 눈금 라벨(fml)
  mat: Mat;
  mul: string; // 절단 뒤 조각 라벨 윗줄(예: 3a×4a)
  out: string; // 절단 뒤 조각 라벨 아랫줄(예: 12a^2)
  tag?: string; // 보조 태그(빼는 넓이)
}
interface CutScene {
  h: number; // 세로 픽셀
  hLabel: string; // 세로 눈금 라벨
  segs: [CutSeg, CutSeg];
  total: string; // 저울 왼쪽 mfmt
  sum: string; // 저울 오른쪽 mfmt
  aria: string;
}

const SCENE1: CutScene = {
  h: 96,
  hLabel: "3a",
  segs: [
    { w: 132, label: "4a", mat: "grape", mul: "3a×4a", out: "12a^2" },
    { w: 62, label: "b", mat: "cyan", mul: "3a×b", out: "3ab" },
  ],
  total: "3a(4a+b)",
  sum: "12a^2+3ab",
  aria: "세로 3a, 가로 4a 더하기 b인 직사각형. 경계에서 아래로 드래그하거나 경계를 탭해 자르기",
};
const SCENE2: CutScene = {
  h: 68,
  hLabel: "2a",
  segs: [
    { w: 124, label: "3a", mat: "grape", mul: "2a×3a", out: "6a^2" },
    { w: 56, label: "-5", mat: "red", mul: "2a×5", out: "-10a", tag: "빼는 넓이" },
  ],
  total: "2a(3a-5)",
  sum: "6a^2-10a",
  aria: "세로 2a, 가로 3a 빼기 5인 직사각형. 빨간 구간은 빼는 넓이. 경계에서 아래로 드래그하거나 탭해 자르기",
};

// 국면 3: 이미 잘려 놓인 조각 두 개(세로는 둘 다 2a)
const DIV_Y0 = 40;
const DIV_H = 64;
const DIV_PIECES: { x: number; w: number; mat: Mat; area: string; quot: string; btnAria: string }[] = [
  { x: 64, w: 128, mat: "grape", area: "8a^2", quot: "4a", btnAria: "8a제곱 조각을 2a로 나누기" },
  { x: 200, w: 96, mat: "cyan", area: "6ab", quot: "3b", btnAria: "6ab 조각을 2a로 나누기" },
];

export const expandLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "cutk", label: "쪼개서 전개", sub: "칼질 한 번" },
    { id: "minus", label: "음수 항 분배", sub: "예측 먼저" },
    { id: "undo", label: "되돌려 나누기", sub: "각 항 따로" },
  ]);

  const board = mboard(330);
  const scaleRow = el("div", { class: "exl-scale" }); // 저울 카드(전체 = 조각 합), 무대 위에
  const stage = el("div", { class: "exl-stage" });
  const svg = sv("svg", { viewBox: `0 0 ${VB_W} 162` });
  stage.appendChild(svg);
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst" });
  const eqs = el("div", { class: "mq6-eqs" });
  const qline = el("div", { class: "mq6-q" }); // 판단 질문 강조 줄, 선택지 바로 위
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, eqs, qline, ctl);
  board.append(scaleRow, stage, panel);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  /* ---- 타이머(모든 지연은 여기로, cleanup에서 일괄 해제) ---- */
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ---- 상태 ---- */
  let phase: 1 | 2 | 3 = 1;
  let finished = false;
  let predicted: boolean | null = null; // 국면 2 예측(true=정답 쪽)
  let choiceOk: HTMLButtonElement | null = null;
  let choiceNo: HTMLButtonElement | null = null;
  let declareBtn: HTMLButtonElement | null = null;
  let divPieces: { body: SVGGElement; lblArea: SVGTextElement; lblQuot: SVGTextElement; btn: HTMLButtonElement; done: boolean }[] = [];

  /* ---- 저울 카드 ---- */
  let sumCard: HTMLElement | null = null;
  let sumVal: HTMLElement | null = null;
  let eqSign: HTMLElement | null = null;
  function setScale(totalSrc: string, capL: string, capR: string): void {
    clear(scaleRow);
    eqSign = el("div", { class: "exl-seq", text: "=" });
    sumVal = el("div", { class: "val", text: "?" });
    sumCard = el("div", { class: "exl-scard wait" }, el("div", { class: "cap", text: capR }), sumVal);
    scaleRow.append(
      el(
        "div",
        { class: "exl-scard" },
        el("div", { class: "cap", text: capL }),
        el("div", { class: "val", html: mfmt(totalSrc) }),
      ),
      eqSign,
      sumCard,
    );
  }
  function fillScale(sumSrc: string): void {
    if (!sumCard || !sumVal || !eqSign) return;
    sumCard.classList.remove("wait");
    sumCard.classList.add("on", "mq6-pop");
    eqSign.classList.add("on");
    sumVal.innerHTML = mfmt(sumSrc);
  }

  /* ---- SVG 공용 조각 ---- */
  function defs(): SVGDefsElement {
    const d = sv("defs");
    (Object.keys(GRAD) as Mat[]).forEach((m) => {
      const g = sv("linearGradient", { id: `exl-g-${m}`, x1: 0, y1: 0, x2: 0.85, y2: 1 });
      GRAD[m].forEach((c, i) => g.appendChild(sv("stop", { offset: i * 0.5, "stop-color": c })));
      d.appendChild(g);
    });
    const hl = sv("radialGradient", { id: "exl-hl", cx: 0.26, cy: 0.18, r: 0.9 });
    hl.appendChild(sv("stop", { offset: 0, "stop-color": "#FFFFFF", "stop-opacity": 0.6 }));
    hl.appendChild(sv("stop", { offset: 0.55, "stop-color": "#FFFFFF", "stop-opacity": 0 }));
    d.appendChild(hl);
    return d;
  }

  /** 재질 면 하나: 접촉 그림자 + 3스톱 그라데이션 몸체 + 좌상단 키라이트. */
  function makePiece(
    x: number,
    y: number,
    w: number,
    h: number,
    mat: Mat,
  ): { g: SVGGElement; body: SVGGElement; rect: SVGRectElement } {
    const g = sv("g");
    g.appendChild(sv("ellipse", { cx: x + w / 2, cy: y + h + 9, rx: w * 0.46, ry: 5.5, fill: "#2A3A5E", opacity: 0.11 }));
    const body = sv("g");
    const rect = sv("rect", {
      x,
      y,
      width: w,
      height: h,
      rx: 2.5,
      fill: `url(#exl-g-${mat})`,
      stroke: INK[mat],
      "stroke-width": 1.5,
      "vector-effect": "non-scaling-stroke",
    });
    body.appendChild(rect);
    body.appendChild(sv("rect", { x, y, width: w, height: h, rx: 2.5, fill: "url(#exl-hl)", "pointer-events": "none" }));
    g.appendChild(body);
    return { g, body, rect };
  }

  /** 세로 눈금 브래킷(왼쪽) + 라벨. */
  function vBracket(x: number, y0: number, h: number, label: string): SVGGElement {
    const g = sv("g");
    g.appendChild(sv("line", { x1: x, y1: y0, x2: x, y2: y0 + h, stroke: C_AXIS, "stroke-width": 1.6 }));
    g.appendChild(sv("line", { x1: x - 3.5, y1: y0, x2: x + 3.5, y2: y0, stroke: C_AXIS, "stroke-width": 1.6 }));
    g.appendChild(sv("line", { x1: x - 3.5, y1: y0 + h, x2: x + 3.5, y2: y0 + h, stroke: C_AXIS, "stroke-width": 1.6 }));
    g.appendChild(fml(x - 7, y0 + h / 2 + 4, label, "#475569", 12, "end"));
    return g;
  }

  function prepPop(t: SVGElement): void {
    t.style.opacity = "0";
    t.style.transform = "translateY(5px)";
    t.style.transition = "opacity .4s ease, transform .45s var(--spring-soft)";
  }

  /* ---- 칼질 장치(국면 1·2 공용) ---- */
  interface CutRig {
    sc: CutScene;
    x0: number;
    x1: number;
    y0: number;
    bx: number; // 경계 x
    gL: SVGGElement;
    gR: SVGGElement;
    knob: SVGGElement;
    blade: SVGLineElement;
    guide: SVGLineElement;
    notch: SVGPathElement;
    popEls: SVGElement[];
    rightRect: SVGRectElement;
    enabled: boolean;
    done: boolean;
    prog: number; // 절단 진행 0..1
    onDone: () => void;
  }
  let rig: CutRig | null = null;
  let dragging = false;
  let dragMoved = false;
  let downCY = 0;
  let busy = false; // 자동 절단·복귀 연출 중

  function paintKnob(): void {
    if (!rig) return;
    const y = rig.prog <= 0 ? rig.y0 - 16 : rig.y0 + rig.prog * rig.sc.h;
    rig.knob.style.transform = `translate(${rig.bx}px, ${y}px)`;
    rig.knob.style.opacity = rig.enabled ? "1" : ".35";
    rig.blade.setAttribute("y2", String(rig.y0 + rig.prog * rig.sc.h));
  }
  function setProg(p: number): void {
    if (!rig) return;
    rig.prog = p;
    paintKnob();
  }

  function buildCutScene(sc: CutScene, startEnabled: boolean, onDone: () => void): void {
    const totalW = sc.segs[0].w + sc.segs[1].w;
    const x0 = (VB_W - totalW) / 2 + 8;
    const y0 = 40;
    const bx = x0 + sc.segs[0].w;
    svg.setAttribute("viewBox", `0 0 ${VB_W} ${y0 + sc.h + 26}`);
    svg.innerHTML = "";
    svg.appendChild(defs());
    svg.setAttribute("role", "button");
    svg.setAttribute("tabindex", "0");
    svg.setAttribute("aria-label", sc.aria);

    const popEls: SVGElement[] = [];
    const groups: SVGGElement[] = [];
    let rightRect!: SVGRectElement;
    let segX = x0;
    sc.segs.forEach((seg, i) => {
      const pk = makePiece(segX, y0, seg.w, sc.h, seg.mat);
      // 구간 폭 눈금 라벨(위)
      pk.g.appendChild(fml(segX + seg.w / 2, y0 - 8, seg.label, seg.mat === "red" ? INK.red : C_DIM, 12));
      // 절단 뒤 등장하는 조각 라벨(2줄 + 태그)
      const cy = y0 + sc.h / 2;
      const lm = fml(segX + seg.w / 2, cy - 7, seg.mul, INK[seg.mat], 10.5, "middle", 700);
      const lo = fml(segX + seg.w / 2, cy + 14, seg.out, INK[seg.mat], 15);
      prepPop(lm);
      prepPop(lo);
      pk.g.append(lm, lo);
      popEls.push(lm, lo);
      if (seg.tag) {
        const tg = fml(segX + seg.w / 2, cy + 28, seg.tag, INK.red, 9);
        prepPop(tg);
        pk.g.appendChild(tg);
        popEls.push(tg);
      }
      if (i === 1) rightRect = pk.rect;
      groups.push(pk.g);
      svg.appendChild(pk.g);
      segX += seg.w;
    });

    svg.appendChild(vBracket(x0 - 10, y0, sc.h, sc.hLabel));

    // 경계 눈금(노치) + 절단 가이드 점선 + 칼날 + 둥근 손잡이
    const notch = sv("path", {
      d: `M ${bx - 4.5} ${y0 - 3.5} L ${bx + 4.5} ${y0 - 3.5} L ${bx} ${y0 + 3.5} Z`,
      fill: C_KNIFE,
    });
    const guide = sv("line", {
      x1: bx,
      y1: y0,
      x2: bx,
      y2: y0 + sc.h,
      stroke: C_GUIDE,
      "stroke-width": 1.6,
      "stroke-dasharray": "4 4",
      opacity: 0.9,
    });
    const blade = sv("line", { x1: bx, y1: y0, x2: bx, y2: y0, stroke: C_KNIFE, "stroke-width": 3.4, "stroke-linecap": "round" });
    const knob = sv("g");
    knob.appendChild(sv("circle", { cx: 0, cy: 0, r: 11, fill: "#FFFFFF", stroke: C_KNIFE, "stroke-width": 2.4 }));
    knob.appendChild(
      sv("path", {
        d: "M -3.8 -1.6 L 0 2.6 L 3.8 -1.6",
        fill: "none",
        stroke: C_KNIFE,
        "stroke-width": 1.9,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );
    svg.append(guide, blade, notch, knob);

    rig = {
      sc,
      x0,
      x1: x0 + totalW,
      y0,
      bx,
      gL: groups[0],
      gR: groups[1],
      knob,
      blade,
      guide,
      notch,
      popEls,
      rightRect,
      enabled: startEnabled,
      done: false,
      prog: 0,
      onDone,
    };
    paintKnob();
  }

  /** 스텝식 진행 애니(자동 절단·복귀). CSS 트랜지션 불가한 SVG 속성용 setTimeout 체인. */
  function animProg(to: number, done?: () => void): void {
    if (!rig) return;
    busy = true;
    const from = rig.prog;
    const steps = Math.max(3, Math.round(Math.abs(to - from) * 9));
    let i = 0;
    const tick = (): void => {
      if (!rig) return;
      i += 1;
      const t = i / steps;
      setProg(from + (to - from) * (t * (2 - t)));
      if (i < steps) later(tick, 30);
      else {
        busy = false;
        if (done) done();
      }
    };
    tick();
  }
  function autoCut(): void {
    if (!rig || rig.done || busy) return;
    haptic(HAPTIC.tap);
    animProg(1, finishCut);
  }

  function finishCut(): void {
    if (!rig || rig.done) return;
    rig.done = true;
    setProg(1);
    haptic(HAPTIC.correct);
    const r = rig;
    // 칼 퇴장
    [r.knob, r.blade, r.guide, r.notch].forEach((n) => {
      (n as SVGElement).style.transition = "opacity .3s ease";
    });
    later(() => {
      [r.knob, r.blade, r.guide, r.notch].forEach((n) => {
        (n as SVGElement).style.opacity = "0";
      });
    }, 140);
    // 두 조각이 8px 벌어진다
    r.gL.style.transition = "transform .5s var(--spring-soft)";
    r.gR.style.transition = "transform .5s var(--spring-soft)";
    later(() => {
      r.gL.style.transform = "translateX(-4px)";
      r.gR.style.transform = "translateX(4px)";
    }, 60);
    // 국면 2: 빼는 조각은 점선 테두리로(빼는 넓이 표현)
    if (r.sc.segs[1].mat === "red") later(() => r.rightRect.setAttribute("stroke-dasharray", "5 4"), 220);
    // 조각 라벨 팝
    later(() => {
      r.popEls.forEach((t) => {
        t.style.opacity = "1";
        t.style.transform = "translateY(0)";
      });
    }, 340);
    // 저울 카드 채우기 → 국면별 마무리
    later(() => {
      fillScale(r.sc.sum);
      r.onDone();
    }, 620);
  }

  /* ---- 칼질 입력: 경계에서 아래로 드래그, 탭 폴백, 키보드 ---- */
  function vbPoint(e: PointerEvent): { x: number; y: number } {
    const r = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    return { x: ((e.clientX - r.left) / r.width) * vb.width, y: ((e.clientY - r.top) / r.height) * vb.height };
  }
  const onDown = (e: PointerEvent): void => {
    if (phase === 3 || !rig || rig.done || busy) return;
    const p = vbPoint(e);
    const nearBoundary = Math.abs(p.x - rig.bx) <= 30 && p.y >= rig.y0 - 32 && p.y <= rig.y0 + rig.sc.h + 14;
    if (!nearBoundary) {
      if (p.x >= rig.x0 && p.x <= rig.x1 && p.y >= rig.y0 && p.y <= rig.y0 + rig.sc.h)
        toast("자르는 곳은 두 구간의 경계! 보라 점선을 노려요");
      return;
    }
    if (!rig.enabled) {
      toast("먼저 아래에서 결과를 예측해요!");
      return;
    }
    dragging = true;
    dragMoved = false;
    downCY = e.clientY;
    capturePointer(svg, e.pointerId);
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging || !rig || rig.done) return;
    if (!dragMoved && Math.abs(e.clientY - downCY) < 7) return;
    dragMoved = true;
    const p = vbPoint(e);
    setProg(clamp((p.y - rig.y0) / rig.sc.h, 0, 1));
  };
  const onUp = (): void => {
    if (!dragging || !rig || rig.done) return;
    dragging = false;
    if (!dragMoved) {
      autoCut(); // 탭 폴백: 경계 한 번 탭으로 끝까지 긋기
      return;
    }
    if (rig.prog >= 0.88) finishCut();
    else {
      animProg(0);
      toast("경계를 따라 아래 끝까지 쭉 그어요!");
    }
  };
  const onCancel = (): void => {
    if (!dragging || !rig || rig.done) return;
    dragging = false;
    if (rig.prog > 0) animProg(0);
  };
  const onKey = (e: KeyboardEvent): void => {
    if (phase === 3 || !rig || rig.done || busy) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (!rig.enabled) {
      toast("먼저 아래에서 결과를 예측해요!");
      return;
    }
    autoCut();
  };
  svg.addEventListener("pointerdown", onDown);
  svg.addEventListener("pointermove", onMove);
  svg.addEventListener("pointerup", onUp);
  svg.addEventListener("pointercancel", onCancel);
  svg.addEventListener("keydown", onKey);

  /* ---- 목표 수집 · 국면 전환 · 완주 ---- */
  function collect(id: string, sub: string): void {
    if (!chips.on(id, sub)) return;
    if (id === "cutk") later(startPhase2, 2000);
    else if (id === "minus") later(startPhase3, 2200);
    if (chips.count() === 3 && !finished) {
      finished = true;
      later(() => {
        helper.innerHTML =
          "괄호를 열어 <b>각 항에 골고루 곱하는 게 전개</b>예요. 나눌 때도 각 항을 따로, 넓이가 그 이유를 보여줬어요!";
        haptic(HAPTIC.done);
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "다음");
      }, 900);
    }
  }

  function crossfade(build: () => void): void {
    stage.style.transition = "opacity .28s var(--ease-out)";
    stage.style.opacity = "0";
    later(() => {
      build();
      stage.style.opacity = "1";
    }, 300);
  }

  /* ---- 국면 1: 쪼개기 = 전개 ---- */
  function startPhase1(): void {
    phase = 1;
    buildCutScene(SCENE1, true, () => {
      inst.innerHTML = `${mfmt("3a×4a=12a^2")}, ${mfmt("3a×b=3ab")}. 두 조각의 합이 전체와 같아요!`;
      toast("넓이는 그대로, 모양만 갈랐어요!");
      collect("cutk", "12a²+3ab!");
    });
    setScale("3a(4a+b)", "전체 넓이", "조각의 합");
    inst.innerHTML = `세로가 ${mfmt("3a")}, 가로가 ${mfmt("(4a+b)")}인 직사각형이에요. 전체 넓이는 ${mfmt("3a(4a+b)")}!`;
    helper.innerHTML = "경계 눈금의 <b>손잡이를 아래로 드래그</b>해 세로로 잘라요. 경계를 톡 탭해도 돼요!";
  }

  /* ---- 국면 2: 음수 항 분배(예측 → 칼질 확인) ---- */
  function revealPhase2(): void {
    inst.innerHTML = `${mfmt("2a(3a-5)=6a^2-10a")}, 빼는 구간까지 <b>골고루</b> 곱해요!`;
    if (predicted === true) {
      choiceOk?.classList.add("ok");
      toast("예측 적중! 뒤 항 −5에도 2a를 곱해 −10a예요");
    } else {
      choiceNo?.classList.add("no");
      choiceOk?.classList.add("ok");
      haptic(HAPTIC.wrong);
      toast("뒤 항은 그대로가 아니에요! −5에도 2a를 곱해서 −10a");
    }
    collect("minus", "−10a!");
  }
  function startPhase2(): void {
    phase = 2;
    predicted = null;
    crossfade(() => {
      buildCutScene(SCENE2, false, revealPhase2);
      setScale("2a(3a-5)", "괄호 그대로", "전개 결과");
      inst.innerHTML = `이번엔 ${mfmt("2a(3a-5)")}, 뒤 항이 <b>음수</b>예요. 빨간 구간은 빼는 넓이!`;
      qline.textContent = "괄호를 열면 어떤 식이 될까요?";
      clear(ctl);
      const mkChoice = (html: string, good: boolean): HTMLButtonElement => {
        const b = el("button", { class: "mq6-choice wide", html, attrs: { type: "button" } });
        b.addEventListener("click", () => {
          if (phase !== 2 || predicted !== null || !rig || rig.done) return;
          predicted = good;
          haptic(HAPTIC.select);
          b.classList.add("exl-picked");
          if (choiceOk) choiceOk.disabled = true;
          if (choiceNo) choiceNo.disabled = true;
          qline.textContent = "";
          rig.enabled = true;
          paintKnob();
          toast("예측 완료! 이제 칼질로 확인해요");
          helper.innerHTML = "경계 손잡이를 <b>아래로 드래그</b>(또는 경계 탭)해서 진실을 확인해요!";
        });
        return b;
      };
      choiceOk = mkChoice(`${mfmt("6a^2-10a")}, 뒤 항에도 2a를 곱해요`, true);
      choiceNo = mkChoice(`${mfmt("6a^2-5")}, 뒤 항은 그대로예요`, false);
      ctl.append(choiceOk, choiceNo);
      later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
      helper.innerHTML = "먼저 <b>예측</b>을 고르고, 칼질로 확인해요.";
    });
  }

  /* ---- 국면 3: 되돌리기 = 나눗셈 ---- */
  function buildDivScene(): void {
    rig = null;
    svg.setAttribute("viewBox", `0 0 ${VB_W} 176`);
    svg.innerHTML = "";
    svg.appendChild(defs());
    svg.setAttribute("role", "img");
    svg.removeAttribute("tabindex");
    svg.setAttribute("aria-label", "8a제곱 조각과 6ab 조각, 세로는 둘 다 2a. 각 조각 아래에 나누기 2a 버튼이 있어요");
    svg.appendChild(vBracket(DIV_PIECES[0].x - 10, DIV_Y0, DIV_H, "2a"));
    divPieces = [];
    DIV_PIECES.forEach((pc, i) => {
      const pk = makePiece(pc.x, DIV_Y0, pc.w, DIV_H, pc.mat);
      const lblArea = fml(pc.x + pc.w / 2, DIV_Y0 + DIV_H / 2 + 5, pc.area, INK[pc.mat], 16);
      pk.g.appendChild(lblArea);
      const lblQuot = fml(pc.x + pc.w / 2, DIV_Y0 + DIV_H - 22, pc.quot, INK[pc.mat], 15);
      prepPop(lblQuot);
      pk.g.appendChild(lblQuot);
      svg.appendChild(pk.g);
      const btn = el("button", {
        class: "exl-divbtn",
        html: mfmt("÷2a"),
        attrs: { type: "button", "aria-label": pc.btnAria },
      });
      btn.style.left = `${(((pc.x + pc.w / 2) / VB_W) * 100).toFixed(2)}%`;
      btn.addEventListener("click", () => divide(i));
      stage.appendChild(btn);
      divPieces.push({ body: pk.body, lblArea, lblQuot, btn, done: false });
    });
  }

  function divide(i: number): void {
    const d = divPieces[i];
    if (!d || d.done || phase !== 3 || finished) return;
    d.done = true;
    haptic(HAPTIC.correct);
    d.btn.disabled = true;
    d.btn.classList.add("gone");
    // 세로 2a를 걷어내는 연출: 몸체가 바닥으로 눌려 가로(몫)만 남는다
    d.body.style.setProperty("transform-box", "fill-box");
    d.body.style.transformOrigin = "50% 100%";
    d.body.style.transition = "transform .55s var(--ease-out)";
    d.body.style.transform = "scaleY(0.2)";
    d.lblArea.style.transition = "opacity .3s ease";
    d.lblArea.style.opacity = "0";
    later(() => {
      d.lblQuot.style.opacity = "1";
      d.lblQuot.style.transform = "translateY(0)";
    }, 380);
    toast(i === 0 ? "8a²에서 세로 2a를 걷어내면 가로는 4a!" : "6ab에서 세로 2a를 걷어내면 가로는 3b!");
    if (divPieces.every((x) => x.done)) later(finishDiv, 800);
    else inst.innerHTML = "한 조각 완료! <b>남은 조각도</b> 2a로 나눠요. 각 항을 따로따로!";
  }

  function finishDiv(): void {
    fillScale("4a+3b");
    eqs.appendChild(
      el("div", {
        class: "mq6-concl mq6-pop",
        html: `${mfmt("(8a^2+6ab)÷2a=4a+3b")}, 각 항을 <b>따로따로</b> 나눴어요!`,
      }),
    );
    inst.innerHTML = "몫 완성! 나눗셈은 전개를 <b>되돌리는</b> 셈이에요.";
    if (declareBtn) {
      const b = declareBtn;
      b.disabled = true;
      b.style.transition = "opacity .3s ease";
      b.style.opacity = "0";
      later(() => {
        b.style.display = "none";
      }, 320);
    }
    collect("undo", "4a+3b!");
  }

  function onDeclare(): void {
    if (phase !== 3 || finished) return;
    const n = divPieces.filter((d) => d.done).length;
    if (n >= 2) return; // 완성 흐름이 이미 처리
    haptic(HAPTIC.wrong);
    toast(n === 0 ? "아직 하나도 안 나눴어요! 조각의 ÷2a 버튼부터 눌러요" : "각 항을 따로따로, 둘 다 나눠요! 남은 조각도 ÷2a");
  }

  function startPhase3(): void {
    phase = 3;
    crossfade(() => {
      buildDivScene();
      setScale("(8a^2+6ab)÷2a", "나눗셈", "몫");
      inst.innerHTML = `이번엔 거꾸로! ${mfmt("(8a^2+6ab)÷2a")}, 잘린 두 조각을 <b>각각</b> 2a로 나눠요.`;
      qline.textContent = "";
      clear(ctl);
      declareBtn = el("button", { class: "exl-declare", text: "다 나눴어요, 완성!", attrs: { type: "button" } });
      declareBtn.addEventListener("click", onDeclare);
      ctl.appendChild(declareBtn);
      later(() => declareBtn?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
      helper.innerHTML = "조각마다 붙은 <b>÷2a</b> 버튼을 탭해요. 세로 2a를 걷어내면 남는 가로가 몫!";
    });
  }

  startPhase1();
  api.setCTA(s.cta ?? "목표 3개를 모두 달성해요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
