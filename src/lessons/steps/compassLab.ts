// compassLab, 작도 아틀리에(Ⅳ L10 · 교과서 166~167쪽). 눈금 없는 자와 컴퍼스만으로
// 길이가 같은 선분(3단계)·크기가 같은 각(4단계)을 옮기는 "순서 선택 + 실행" 스테퍼 랩.
// 파트 1: 선분 AB를 직선 위 점 C로 복사(CD=AB) → 도구 요약 카드(눈금의 유혹) →
// 파트 2: ∠AOB를 반직선 PQ 위로 복사(∠CPQ=∠AOB). 각 질문은 정답 1 + 함정 1 버튼,
// 함정은 흔들림 + 오개념 교정 토스트, 정답은 무대 애니(누적 그림)로 실행된다.
// 모션은 전부 CSS transition/keyframes + setTimeout 체인(타이머 Set으로 모아 cleanup 해제),
// rAF 금지. 전 목표가 버튼 클릭만으로 달성돼 E2E 자동 조작이 가능하다.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, polar, angleOf, arcPath, angleArc, deg, dot, ptLabel, lineSvg, arrowHead, tickMark, gsym } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface CompassStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Pt {
  x: number;
  y: number;
}

interface QDef {
  kicker: string;
  q: string; // HTML 허용
  choices: { html: string; good: boolean; msg?: string }[];
  run(done: () => void): void;
}

interface CompassCtl {
  g: SVGGElement;
  open(): void;
}

const NS = "http://www.w3.org/2000/svg";

/* ---------- 무대 기하 상수 ---------- */
// 파트 1: 선분 옮기기
const A1: Pt = { x: 98, y: 88 };
const B1: Pt = { x: 208, y: 88 };
const SEG = 110; // |AB|
const LN = { y: 196, x0: 30, x1: 336 }; // 눈금 없는 자로 그린 직선
const C1: Pt = { x: 98, y: 196 };
const D1: Pt = { x: 208, y: 196 }; // C에서 반지름 AB인 원호와 직선의 교점
const H1: Pt = { x: 153, y: 26 }; // 컴퍼스 힌지(AB 위)

// 파트 2: 각 옮기기(약 52°)
const ANG = 52;
const R0 = 46; // 첫 원호(적당한 반지름)
const RAY = 124; // 반직선 길이
const O2: Pt = { x: 34, y: 200 };
const PV: Pt = { x: 206, y: 200 }; // 새 각의 꼭짓점 P
const X2 = polar(O2.x, O2.y, R0, 0);
const Y2 = polar(O2.x, O2.y, R0, ANG);
const D2 = polar(PV.x, PV.y, R0, 0);
const C2 = polar(PV.x, PV.y, R0, ANG); // 두 원호의 교점(구성 결과)
const RXY = Math.hypot(Y2.x - X2.x, Y2.y - X2.y); // 컴퍼스가 옮기는 벌어짐

export const compassLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CompassStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "seg", label: "선분 복사", sub: "CD=AB" },
    { id: "tool", label: "도구의 규칙", sub: "자·컴퍼스" },
    { id: "ang", label: "각 복사", sub: "∠CPQ=∠AOB" },
  ]);

  const board = mboard(430);
  const qCard = el("div", { class: "mcp-q" });
  const stage1 = el("div", { class: "mcp-stage" });
  const stage2 = el("div", { class: "mcp-stage out", style: "display:none" });
  const optRow = el("div", { class: "mcp-opts" });
  board.append(qCard, stage1, stage2, optRow);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "다음 한 수를 고르면 무대에서 바로 실행돼요. <b>작도는 순서가 생명</b>이에요!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ---------- 무대 조립 ---------- */
  const cap = (x: number, y: number, t: string): string =>
    `<text x="${x}" y="${y}" font-size="10.5" font-weight="700" fill="${GEO.soft}">${t}</text>`;

  stage1.innerHTML =
    `<svg viewBox="0 0 360 250" xmlns="${NS}" fill="none"><g>` +
    cap(30, 66, "원본") +
    lineSvg(A1.x, A1.y, B1.x, B1.y, GEO.ink, 3) +
    dot(A1.x, A1.y, GEO.ink, 4) +
    dot(B1.x, B1.y, GEO.ink, 4) +
    ptLabel(A1.x, A1.y, "A", 0, -12) +
    ptLabel(B1.x, B1.y, "B", 0, -12) +
    cap(30, 178, "옮길 곳") +
    lineSvg(LN.x0, LN.y, LN.x1, LN.y, GEO.ink, 2.4) +
    dot(C1.x, C1.y, GEO.ink, 4) +
    ptLabel(C1.x, C1.y, "C", 0, 20) +
    `</g><g class="mcp-wk"></g><g class="mcp-tl"></g><g class="mcp-fx"></g></svg>`;

  const aTip = polar(O2.x, O2.y, RAY, ANG);
  const aPt = polar(O2.x, O2.y, 112, ANG);
  stage2.innerHTML =
    `<svg viewBox="0 0 360 250" xmlns="${NS}" fill="none"><g>` +
    cap(26, 122, "원본") +
    lineSvg(O2.x, O2.y, O2.x + RAY, O2.y, GEO.ink, 2.8) +
    arrowHead(O2.x + RAY, O2.y, 0, GEO.ink) +
    lineSvg(O2.x, O2.y, aTip.x, aTip.y, GEO.ink, 2.8) +
    arrowHead(aTip.x, aTip.y, ANG, GEO.ink) +
    `<g class="mcp-oarc">${angleArc(O2.x, O2.y, 20, 0, ANG, GEO.soft, undefined, { width: 2 })}</g>` +
    dot(O2.x, O2.y, GEO.ink, 4) +
    ptLabel(O2.x, O2.y, "O", -10, 16) +
    dot(aPt.x, aPt.y, GEO.ink, 3.4) +
    ptLabel(aPt.x, aPt.y, "A", 12, 2) +
    dot(140, 200, GEO.ink, 3.4) +
    ptLabel(140, 200, "B", 0, 18) +
    cap(206, 122, "복사할 곳") +
    lineSvg(PV.x, PV.y, PV.x + 128, PV.y, GEO.ink, 2.8) +
    arrowHead(PV.x + 128, PV.y, 0, GEO.ink) +
    dot(PV.x, PV.y, GEO.ink, 4) +
    ptLabel(PV.x, PV.y, "P", -10, 16) +
    dot(294, 200, GEO.ink, 3.4) +
    ptLabel(294, 200, "Q", 0, 18) +
    `</g><g class="mcp-wk"></g><g class="mcp-tl"></g><g class="mcp-fx"></g></svg>`;

  const w1 = stage1.querySelector(".mcp-wk") as SVGGElement;
  const t1 = stage1.querySelector(".mcp-tl") as SVGGElement;
  const f1 = stage1.querySelector(".mcp-fx") as SVGGElement;
  const w2 = stage2.querySelector(".mcp-wk") as SVGGElement;
  const t2 = stage2.querySelector(".mcp-tl") as SVGGElement;
  const f2 = stage2.querySelector(".mcp-fx") as SVGGElement;
  const oarc = stage2.querySelector(".mcp-oarc") as SVGGElement;

  /* ---------- SVG 소도구 ---------- */
  function addSvg(layer: SVGGElement, html: string, cls?: string): SVGGElement {
    const g = document.createElementNS(NS, "g") as SVGGElement;
    if (cls) g.setAttribute("class", cls);
    g.innerHTML = html;
    layer.appendChild(g);
    return g;
  }

  const popIn = (layer: SVGGElement, html: string): SVGGElement => addSvg(layer, html, "mcp-pop");

  /** 원호·선이 스르륵 그려지는 연출(stroke-dashoffset 트랜지션). */
  function drawIn(layer: SVGGElement, d: string, color: string, w: number, dur: number): void {
    const g = addSvg(layer, `<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none"/>`);
    const p = g.querySelector("path") as SVGPathElement;
    const L = p.getTotalLength();
    p.style.strokeDasharray = String(L);
    p.style.strokeDashoffset = String(L);
    p.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.4,.1,.3,1)`;
    later(() => {
      p.style.strokeDashoffset = "0";
    }, 30);
  }

  /** 간단한 컴퍼스 아이콘(두 다리). closed면 다리를 모은 채 시작, open()으로 벌어진다. */
  function mkCompass(h: Pt, ta: Pt, tb: Pt, closed: boolean): CompassCtl {
    const hx = +h.x.toFixed(1);
    const hy = +h.y.toFixed(1);
    const len = Math.hypot(ta.x - h.x, ta.y - h.y);
    const ty = +(h.y + len).toFixed(1);
    const aA = deg(Math.atan2(-(ta.x - h.x), ta.y - h.y));
    const aB = deg(Math.atan2(-(tb.x - h.x), tb.y - h.y));
    const g = document.createElementNS(NS, "g") as SVGGElement;
    g.setAttribute("class", "mcp-cmp");
    const leg = (tip: string): string =>
      `<g class="mcp-leg"><line x1="${hx}" y1="${hy}" x2="${hx}" y2="${ty}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>${tip}</g>`;
    g.innerHTML =
      leg(`<circle cx="${hx}" cy="${ty}" r="2.3" fill="${GEO.ink}"/>`) +
      leg(`<circle cx="${hx}" cy="${ty}" r="3.1" fill="${GEO.hlB}"/>`) +
      `<line x1="${hx}" y1="${hy - 15}" x2="${hx}" y2="${hy}" stroke="${GEO.ink}" stroke-width="3.2" stroke-linecap="round"/>` +
      `<circle cx="${hx}" cy="${hy}" r="4.4" fill="#FFFFFF" stroke="${GEO.ink}" stroke-width="2.2"/>`;
    const legs = Array.from(g.querySelectorAll<SVGGElement>(".mcp-leg"));
    legs.forEach((lg, i) => {
      lg.style.setProperty("transform-box", "view-box");
      lg.style.transformOrigin = `${hx}px ${hy}px`;
      lg.style.transform = `rotate(${closed ? (i === 0 ? 6 : -6) : i === 0 ? aA : aB}deg)`;
    });
    return {
      g,
      open(): void {
        legs[0].style.transform = `rotate(${aA}deg)`;
        legs[1].style.transform = `rotate(${aB}deg)`;
      },
    };
  }

  function badge(cx: number, cy: number, w: number, label: string): string {
    return (
      `<rect x="${(cx - w / 2).toFixed(1)}" y="${cy - 15}" width="${w}" height="30" rx="15" fill="#FFFFFF" stroke="${GEO.hlA}" stroke-width="1.6"/>` +
      `<text x="${cx}" y="${cy + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#B26A00">${label}</text>`
    );
  }

  /* ---------- 스테퍼 상태 ---------- */
  let locking = false;
  let trapMet = 0; // 눈금의 유혹(함정) 조우 횟수, 요약 카드 문구 분기용
  let cmp1: CompassCtl | null = null;
  let cmp2: CompassCtl | null = null;

  /* ---------- 파트 1: 길이가 같은 선분 옮기기 ---------- */
  const p1q1: QDef = {
    kicker: "선분 1/2",
    q: `${gsym("AB", "seg")}의 길이를 가져가려면?`,
    choices: [
      { html: "컴퍼스를 A와 B에 벌려 재기", good: true },
      {
        html: "자의 눈금으로 재기",
        good: false,
        msg: "이 자에는 눈금이 없어요! 작도에서 길이를 재는 도구는 컴퍼스뿐이에요.",
      },
    ],
    run(done) {
      const cm = mkCompass(H1, A1, B1, true);
      cmp1 = cm;
      cm.g.style.opacity = "0";
      t1.appendChild(cm.g);
      later(() => {
        cm.g.style.opacity = "1";
      }, 30);
      later(() => {
        cm.open();
        haptic(HAPTIC.tap);
      }, 300);
      later(() => {
        drawIn(w1, arcPath(A1.x, A1.y, SEG, -6, 6), GEO.hlB, 2.4, 260);
      }, 780);
      later(() => {
        toast("컴퍼스가 AB의 길이를 기억했어요!");
        done();
      }, 1060);
    },
  };

  const p1q2: QDef = {
    kicker: "선분 2/2",
    q: "잰 길이로 무엇을 할까요?",
    choices: [
      { html: "점 C를 중심으로 원 그리기", good: true },
      { html: "점 B를 중심으로 원 그리기", good: false, msg: "B는 원본이에요, 옮길 곳은 C!" },
    ],
    run(done) {
      const cm = cmp1;
      if (cm) cm.g.style.transform = `translate(0px, ${LN.y - A1.y}px)`; // 벌린 채 그대로 C 위로
      later(() => {
        drawIn(w1, arcPath(C1.x, C1.y, SEG, -18, 28), GEO.hlB, 2.6, 550);
      }, 520);
      later(() => {
        popIn(w1, dot(D1.x, D1.y, GEO.ink, 4) + ptLabel(D1.x, D1.y, "D", 13, 17));
        haptic(HAPTIC.tap);
      }, 750);
      later(() => {
        drawIn(w1, `M${C1.x} ${C1.y} L${D1.x} ${D1.y}`, GEO.hlA, 3.4, 360);
      }, 810);
      later(() => {
        popIn(w1, tickMark(A1.x, A1.y, B1.x, B1.y, 1, GEO.hlA) + tickMark(C1.x, C1.y, D1.x, D1.y, 1, GEO.hlA));
        popIn(f1, badge(272, 152, 134, "CD = AB, 복사 완료!"));
        if (cm) cm.g.classList.add("ghost");
        chips.on("seg");
        toast("C에서 D까지가 딱 AB만큼이에요!");
      }, 1140);
      later(done, 1290);
    },
  };

  /* ---------- 파트 2: 크기가 같은 각 옮기기 ---------- */
  const p2q1: QDef = {
    kicker: "각 1/4",
    q: `${gsym("AOB", "angle")}를 ${gsym("PQ", "ray")} 위로 옮겨요. 첫걸음은?`,
    choices: [
      { html: "O를 중심으로 적당한 원호 긋기", good: true },
      { html: "P와 Q를 컴퍼스로 재기", good: false, msg: "PQ는 새 각의 변일 뿐, 길이는 필요 없어요." },
    ],
    run(done) {
      drawIn(w2, arcPath(O2.x, O2.y, R0, -16, 68), GEO.hlB, 2.6, 620);
      later(() => {
        popIn(w2, dot(X2.x, X2.y, GEO.ink, 3.6) + ptLabel(X2.x, X2.y, "X", -13, 17));
      }, 210);
      later(() => {
        popIn(w2, dot(Y2.x, Y2.y, GEO.ink, 3.6) + ptLabel(Y2.x, Y2.y, "Y", -12, 4));
        haptic(HAPTIC.tap);
      }, 580);
      later(() => {
        toast("원호가 두 변과 만나 X와 Y가 생겼어요!");
        done();
      }, 880);
    },
  };

  const p2q2: QDef = {
    kicker: "각 2/4",
    q: "X와 Y가 생겼어요. 다음은?",
    choices: [
      { html: "P를 중심으로 아까와 같은 반지름의 원호 긋기", good: true },
      {
        html: `${gsym("XY", "seg")} 길이부터 재기`,
        good: false,
        msg: "순서가 급했어요! 새 자리에 같은 원호부터 만들어 놔야 옮길 곳이 생겨요.",
      },
    ],
    run(done) {
      drawIn(w2, arcPath(PV.x, PV.y, R0, -16, 68), GEO.hlB, 2.6, 620);
      later(() => {
        popIn(w2, dot(D2.x, D2.y, GEO.ink, 3.6) + ptLabel(D2.x, D2.y, "D", 13, 17));
        haptic(HAPTIC.tap);
      }, 240);
      later(() => {
        toast("같은 반지름의 원호가 PQ와 만나 D가 생겼어요!");
        done();
      }, 880);
    },
  };

  const p2q3: QDef = {
    kicker: "각 3/4",
    q: "새 자리에 D가 생겼어요. 다음은?",
    choices: [
      { html: `컴퍼스로 ${gsym("XY", "seg")} 길이 재기`, good: true },
      { html: `${gsym("PC", "ray")}부터 긋기`, good: false, msg: "C가 아직 없어요! 벌어진 정도(XY)를 먼저 재야죠." },
    ],
    run(done) {
      const mid = { x: (X2.x + Y2.x) / 2, y: (X2.y + Y2.y) / 2 };
      const ux = (Y2.x - X2.x) / RXY;
      const uy = (Y2.y - X2.y) / RXY;
      const cm = mkCompass({ x: mid.x - uy * 34, y: mid.y + ux * 34 }, X2, Y2, false);
      cmp2 = cm;
      cm.g.style.opacity = "0";
      t2.appendChild(cm.g);
      later(() => {
        cm.g.style.opacity = "1";
      }, 30);
      const aY = angleOf(X2.x, X2.y, Y2.x, Y2.y);
      later(() => {
        drawIn(w2, arcPath(X2.x, X2.y, RXY, aY - 7, aY + 7), GEO.hlB, 2.2, 240);
        haptic(HAPTIC.tap);
      }, 380);
      later(() => {
        toast("X와 Y 사이의 벌어짐을 컴퍼스가 기억했어요!");
        done();
      }, 800);
    },
  };

  const p2q4: QDef = {
    kicker: "각 4/4",
    q: "컴퍼스가 XY만큼 벌어져 있어요. 마지막 한 수는?",
    choices: [
      { html: `D를 중심으로 반지름 ${gsym("XY", "seg")}인 원호를 그려 교점 C 찾기`, good: true },
      {
        html: `P를 중심으로 반지름 ${gsym("XY", "seg")}인 원호 그리기`,
        good: false,
        msg: "중심은 D예요! X와 Y가 벌어진 만큼을 D에서 벌려야 교점 C가 생겨요.",
      },
    ],
    run(done) {
      const cm = cmp2;
      // 벌림을 유지한 채 통째로 이동: 바늘은 D, 연필은 정확히 C 자리에 놓인다
      if (cm) cm.g.style.transform = `translate(${(D2.x - X2.x).toFixed(1)}px, ${(D2.y - X2.y).toFixed(1)}px)`;
      const ac = angleOf(D2.x, D2.y, C2.x, C2.y);
      later(() => {
        drawIn(w2, arcPath(D2.x, D2.y, RXY, ac - 26, ac + 22), GEO.hlB, 2.6, 440);
      }, 540);
      later(() => {
        popIn(w2, dot(C2.x, C2.y, GEO.ink, 4) + ptLabel(C2.x, C2.y, "C", -6, -12));
        const rg = addSvg(
          f2,
          `<circle cx="${C2.x.toFixed(1)}" cy="${C2.y.toFixed(1)}" r="9" stroke="${GEO.hlA}" stroke-width="2.4" fill="none"/>`,
          "mcp-ring",
        );
        later(() => rg.remove(), 820);
        haptic(HAPTIC.correct);
      }, 860);
      later(() => {
        const tip = polar(PV.x, PV.y, RAY, ANG);
        drawIn(w2, `M${PV.x} ${PV.y} L${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`, GEO.hlA, 3.2, 400);
      }, 1100);
      later(() => {
        const tip = polar(PV.x, PV.y, RAY, ANG);
        popIn(w2, arrowHead(tip.x, tip.y, ANG, GEO.hlA));
        popIn(w2, angleArc(O2.x, O2.y, 24, 0, ANG, GEO.hlA, undefined, { fill: true, width: 2.8 }));
        popIn(w2, angleArc(PV.x, PV.y, 24, 0, ANG, GEO.hlA, undefined, { fill: true, width: 2.8 }));
        oarc.style.opacity = "0";
        popIn(f2, badge(280, 58, 112, "∠CPQ = ∠AOB!"));
        if (cm) cm.g.classList.add("ghost");
        chips.on("ang");
        toast("두 각의 벌어짐이 완전히 같아요!");
      }, 1540);
      later(done, 1700);
    },
  };

  type FlowItem = QDef | "toolcard";
  const FLOW: FlowItem[] = [p1q1, p1q2, "toolcard", p2q1, p2q2, p2q3, p2q4];
  let fi = 0;

  /* ---------- 질문 렌더 ---------- */
  function ask(def: QDef): void {
    qCard.innerHTML = `<span class="mcp-k">${def.kicker}</span><span>${def.q}</span>`;
    qCard.classList.remove("in");
    void qCard.offsetWidth;
    qCard.classList.add("in");
    clear(optRow);
    optRow.classList.remove("lock");
    const list = [...def.choices].sort(() => Math.random() - 0.5);
    for (const c of list) {
      const b = el("button", { class: "mcp-choice", html: c.html, attrs: { type: "button" } });
      b.addEventListener("click", () => {
        if (locking) return;
        if (c.good) {
          locking = true;
          haptic(HAPTIC.correct);
          b.classList.add("ok");
          optRow.classList.add("lock");
          def.run(() => {
            locking = false;
            advance();
          });
        } else {
          trapMet += 1;
          haptic(HAPTIC.wrong);
          b.classList.remove("no");
          void b.offsetWidth;
          b.classList.add("no");
          if (c.msg) toast(c.msg);
          later(() => b.classList.remove("no"), 650);
        }
      });
      optRow.appendChild(b);
    }
    later(() => qCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function advance(): void {
    fi += 1;
    if (fi >= FLOW.length) {
      finish();
      return;
    }
    const item = FLOW[fi];
    if (item === "toolcard") showToolCard();
    else ask(item);
  }

  /* ---------- 목표 2: 작도 2도구 요약 카드(눈금의 유혹 정리) ---------- */
  function showToolCard(): void {
    qCard.innerHTML = `<span class="mcp-k">정리</span><span>작도의 두 도구를 확인해 보세요</span>`;
    clear(optRow);
    const sub =
      trapMet > 0
        ? "눈금의 유혹에 걸렸어도 괜찮아요. 이제 두 도구의 역할이 확실해졌으니까요!"
        : "함정을 하나도 안 밟았네요! 두 도구의 역할을 한 번 더 새겨 두어요.";
    const rulerIco =
      `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">` +
      `<rect x="4" y="15" width="32" height="11" rx="3" fill="#EAF0F6" stroke="${GEO.ink}" stroke-width="1.8"/>` +
      `<line x1="7" y1="31" x2="33" y2="31" stroke="${GEO.soft}" stroke-width="2" stroke-linecap="round"/></svg>`;
    const cmpIco =
      `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">` +
      `<line x1="20" y1="5" x2="20" y2="11" stroke="${GEO.ink}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<circle cx="20" cy="12" r="2.8" fill="#FFFFFF" stroke="${GEO.ink}" stroke-width="2"/>` +
      `<line x1="20" y1="13" x2="11" y2="32" stroke="${GEO.ink}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<line x1="20" y1="13" x2="29" y2="32" stroke="${GEO.ink}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<circle cx="29" cy="32" r="2.2" fill="${GEO.hlB}"/>` +
      `<path d="M9 35 Q20 40 31 35" stroke="${GEO.hlB}" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/></svg>`;
    const wrap = el("div", { class: "mcp-toolcard" });
    wrap.innerHTML =
      `<div class="mcp-tcbox">` +
      `<div class="mcp-tct">작도의 두 도구</div>` +
      `<div class="mcp-tcsub">${sub}</div>` +
      `<div class="mcp-tcrow">${rulerIco}<div><b>눈금 없는 자</b><span>선을 긋거나 늘이는 담당이에요. 길이 재기는 못 해요!</span></div></div>` +
      `<div class="mcp-tcrow">${cmpIco}<div><b>컴퍼스</b><span>원을 그리는 담당이에요. 길이를 재서 옮기는 일도 컴퍼스의 몫이에요!</span></div></div>` +
      `<button class="mcp-okbtn" type="button">확인!</button>` +
      `</div>`;
    board.appendChild(wrap);
    later(() => wrap.classList.add("show"), 30);
    later(() => wrap.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    let confirmed = false;
    (wrap.querySelector(".mcp-okbtn") as HTMLButtonElement).addEventListener("click", () => {
      if (confirmed) return;
      confirmed = true;
      haptic(HAPTIC.tap);
      chips.on("tool");
      wrap.classList.remove("show");
      later(() => wrap.remove(), 320);
      swapStage();
    });
  }

  /* ---------- 파트 전환(무대 크로스페이드) ---------- */
  function swapStage(): void {
    stage1.classList.add("out");
    later(() => {
      stage1.style.display = "none";
      stage2.style.display = "";
      void stage2.offsetWidth;
      later(() => stage2.classList.remove("out"), 40);
      helper.innerHTML = "이번엔 각을 통째로 복사해요. <b>원호 두 번, 벌어짐 재기, 교점 찾기</b> 순서예요!";
      advance();
    }, 430);
  }

  /* ---------- 완료 ---------- */
  function finish(): void {
    qCard.innerHTML = `<span class="mcp-k">작도 완성</span><span>자와 컴퍼스, 단 둘이면 충분해요!</span>`;
    clear(optRow);
    helper.innerHTML = "눈금 없이도 길이와 각이 그대로 옮겨졌어요. <b>이 두 가지 복사 기술이 모든 작도의 재료</b>예요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  ask(FLOW[0] as QDef);
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
