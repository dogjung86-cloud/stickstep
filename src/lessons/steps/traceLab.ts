// traceLab, 점·선·면 생성기(Ⅳ L1 — 교과서 144쪽 "점이 움직인 자리는 선, 선이 움직인 자리는 면").
// 네 국면: ① 점 찍기(빈 종이 탭 3회) ② 선 만들기(꾹 누른 채 끌어 자취 누적 120px, 곡선도 선)
//          ③ 면 만들기(세로 선분을 손잡이로 옆으로 밀어 폭 55% 이상 쓸기)
//          ④ 만남(새 선을 그어 ②의 선과 교차 → 교점 발견, 이어서 두 면이 만나는 교선 비네트)
//          — concept의 교점·교선 용어를 랩에서 먼저 경험시키는 국면(용어 선경험 원칙).
// 채점 아님(발견 랩), 전 목표 달성 시 recordQuiz(true)+enableCTA.
// 모션은 CSS transition/keyframes + setTimeout(타이머 Set 일괄 해제)만, rAF 금지(MATH_GUIDE).
// 판정: 탭은 pointerdown(coordLab 선례), 드래그는 pointerup(드롭)에서 — E2E 합성 시퀀스 호환.

import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, dot, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface TraceStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const NS = "http://www.w3.org/2000/svg";
const W = 340;
const H = 264;
const LINE_GOAL = 120; // ② 자취 누적 길이(px)
/* ③ 면 국면 기하 */
const X0 = 50; // 선분 시작 x
const XMAX = 310; // 손잡이 이동 한계
const SEG_TOP = 62;
const SEG_BOT = 202; // 선분 높이 140
const MID = (SEG_TOP + SEG_BOT) / 2;
const GOAL_X = X0 + (XMAX - X0) * 0.55; // 결승선(폭 55%)

export const traceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TraceStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "pt", label: "점 찍기", sub: "0/3" },
    { id: "ln", label: "선 만들기", sub: "끌어서" },
    { id: "fc", label: "면 만들기", sub: "쓸어서" },
    { id: "x", label: "만나면?", sub: "선끼리 콕" },
  ]);

  const board = mboard(440);
  const qCard = el("div", { class: "mdr-q mtl-q" });
  const stage = el("div", { class: "mtl-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="${NS}" fill="none">` +
    `<rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="14" fill="#FFFFFF" stroke="#E2E9F2" stroke-width="1.5"/>` +
    `<g class="mtl-g-sweep"></g>` +
    `<g class="mtl-g-strokes"></g>` +
    `<g class="mtl-g-dots"></g>` +
    `<g class="mtl-g-x"></g>` +
    `<rect class="mtl-hit" x="0" y="0" width="${W}" height="${H}" fill="transparent"/>` +
    `</svg>`;
  board.append(qCard, stage);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "종이를 <b>콕콕 탭</b>하면 그 자리에 점이 생겨요. 아무 데나 3개!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gSweep = svg.querySelector(".mtl-g-sweep") as SVGGElement;
  const gStrokes = svg.querySelector(".mtl-g-strokes") as SVGGElement;
  const gDots = svg.querySelector(".mtl-g-dots") as SVGGElement;
  const gX = svg.querySelector(".mtl-g-x") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  const kicker = (t: string): string => `<span class="mtl-k">${t}</span>`;
  const chipSub = (id: string): HTMLElement => chips.el.querySelector(`[data-g="${id}"] span`) as HTMLElement;

  let phase: "pt" | "ln" | "fc" | "x" | "done" = "pt";
  let locking = false;

  qCard.innerHTML = `${kicker("1단계: 점")} 빈 종이에 손끝으로 점을 3개 찍어 보세요`;

  const pos = (e: PointerEvent): { x: number; y: number } => {
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  /* ── 국면 1: 점 찍기 ── */
  let dotCount = 0;

  function placeDot(p: { x: number; y: number }): void {
    const x = clamp(p.x, 18, W - 18);
    const y = clamp(p.y, 18, H - 18);
    dotCount += 1;
    haptic(HAPTIC.tap);
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "mtl-dot");
    g.innerHTML =
      dot(x, y, GEO.ink, 5) +
      `<circle class="mtl-ping" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="none" stroke="${GEO.ink}" stroke-width="1.6"/>`;
    gDots.appendChild(g);
    chipSub("pt").textContent = `${Math.min(dotCount, 3)}/3`;
    if (dotCount >= 3) {
      locking = true;
      chips.on("pt", "3/3!");
      toast("점은 크기가 없어요, 위치만 있죠!");
      later(() => {
        locking = false;
        startLine();
      }, 1500);
    }
  }

  /* ── 국면 2: 선 만들기 ── */
  let drawing = false;
  let lineLen = 0; // 모든 획 누적 자취 길이
  let strokeStartLen = 0;
  let lastPt: { x: number; y: number } | null = null;
  let ptsAttr = "";
  let curPts: { x: number; y: number }[] = []; // 현재 획의 점들(교차 검사용)
  const oldStrokes: { x: number; y: number }[][] = []; // ②에서 그린 획들(④의 교차 대상)
  let polyCore: SVGPolylineElement | null = null;
  let polyGlow: SVGPolylineElement | null = null;

  function startLine(): void {
    phase = "ln";
    qCard.innerHTML = `${kicker("2단계: 선")} 이번엔 꾹 누른 채 끌어 보세요`;
    helper.innerHTML = "점이 <b>움직이며 지나간 자리</b>가 그대로 남아요. 곧게도, 구불구불하게도 좋아요!";
    gDots.classList.add("mtl-dim");
    chipSub("ln").textContent = "0%";
  }

  function mkPoly(cls: string): SVGPolylineElement {
    const p = document.createElementNS(NS, "polyline");
    p.setAttribute("class", cls);
    p.setAttribute("points", ptsAttr);
    gStrokes.appendChild(p);
    return p;
  }

  function startStroke(e: PointerEvent, p: { x: number; y: number }): void {
    drawing = true;
    capturePointer(svg, e.pointerId);
    strokeStartLen = lineLen;
    lastPt = p;
    curPts = [{ x: p.x, y: p.y }];
    ptsAttr = `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const cross = phase === "x";
    polyGlow = mkPoly(cross ? "mtl-trace-glow xline" : "mtl-trace-glow");
    polyCore = mkPoly(cross ? "mtl-trace xline" : "mtl-trace");
  }

  function extendStroke(p: { x: number; y: number }): void {
    if (!lastPt || !polyCore || !polyGlow) return;
    const x = clamp(p.x, 12, W - 12);
    const y = clamp(p.y, 12, H - 12);
    const d = Math.hypot(x - lastPt.x, y - lastPt.y);
    if (d < 2) return;
    lineLen += d;
    lastPt = { x, y };
    curPts.push({ x, y });
    ptsAttr += ` ${x.toFixed(1)},${y.toFixed(1)}`;
    polyGlow.setAttribute("points", ptsAttr);
    polyCore.setAttribute("points", ptsAttr);
    if (phase === "ln" && !chips.has("ln")) chipSub("ln").textContent = `${Math.min(100, Math.round((lineLen / LINE_GOAL) * 100))}%`;
  }

  function endStroke(): void {
    drawing = false;
    // 움직임 없는 헛 획(탭)은 흔적을 남기지 않는다
    if (lineLen - strokeStartLen < 1 && polyCore && polyGlow) {
      polyCore.remove();
      polyGlow.remove();
    } else if (curPts.length >= 2) {
      oldStrokes.push(curPts.slice()); // ④의 교차 대상으로 보관
    }
    polyCore = polyGlow = null;
    lastPt = null;
    if (chips.has("ln") || locking) return;
    if (lineLen >= LINE_GOAL) {
      locking = true;
      haptic(HAPTIC.correct);
      chips.on("ln", "완성!");
      toast("점이 움직인 자리가 선이 돼요! 구불구불해도 선이에요");
      later(() => {
        locking = false;
        startFace();
      }, 1600);
    } else if (lineLen - strokeStartLen >= 6) {
      toast("좋아요, 조금만 더 길게 끌어 볼까요?");
    } else {
      toast("꾹 누른 채 손가락을 움직여 보세요");
    }
  }

  /* ── 국면 3: 면 만들기 ── */
  let sweeping = false;
  let grabDX = 0;
  let segX = X0;
  let maxX = X0;
  let mover: SVGGElement | null = null;
  let faceRect: SVGRectElement | null = null;
  let grabG: SVGGElement | null = null;

  function startFace(): void {
    phase = "fc";
    qCard.innerHTML = `${kicker("3단계: 면")} 이번엔 선을 통째로 옆으로 밀어 보세요`;
    helper.innerHTML = "가운데 <b>손잡이</b>를 잡고 오른쪽 깃발까지 쭉! 선이 지나간 자리를 잘 보세요.";
    gStrokes.classList.add("mtl-dim");
    segX = X0;
    maxX = X0;
    gSweep.innerHTML =
      // 결승선(55%) + 깃발
      `<line x1="${GOAL_X.toFixed(1)}" y1="${SEG_TOP - 10}" x2="${GOAL_X.toFixed(1)}" y2="${SEG_BOT + 10}" stroke="${GEO.soft}" stroke-width="1.6" stroke-dasharray="4 5"/>` +
      `<path d="M${GOAL_X.toFixed(1)} ${SEG_TOP - 10} l15 5 l-15 5 z" fill="${GEO.hlA}"/>` +
      // 출발선 잔상
      `<line x1="${X0}" y1="${SEG_TOP}" x2="${X0}" y2="${SEG_BOT}" stroke="${GEO.hlB}" stroke-width="1.6" stroke-dasharray="3 5" opacity=".5"/>` +
      // 쓸고 지나간 면
      `<rect class="mtl-face" x="${X0}" y="${SEG_TOP}" width="0" height="${SEG_BOT - SEG_TOP}" fill="${GEO.hlB}" opacity=".16"/>` +
      // 움직이는 선분 + 손잡이
      `<g class="mtl-mover">` +
      `<line x1="0" y1="${SEG_TOP}" x2="0" y2="${SEG_BOT}" stroke="${GEO.hlB}" stroke-width="5" stroke-linecap="round"/>` +
      `<g class="mtl-grab">` +
      `<circle cx="0" cy="${MID}" r="20" fill="${GEO.hlB}" opacity=".14"/>` +
      `<circle cx="0" cy="${MID}" r="13.5" fill="#FFFFFF" stroke="${GEO.hlB}" stroke-width="2.4"/>` +
      `<path d="M-5 ${MID - 5} l5 5 l-5 5 M2 ${MID - 5} l5 5 l-5 5" stroke="${GEO.hlB}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `</g>` +
      `</g>`;
    mover = gSweep.querySelector(".mtl-mover") as SVGGElement;
    faceRect = gSweep.querySelector(".mtl-face") as SVGRectElement;
    grabG = gSweep.querySelector(".mtl-grab") as SVGGElement;
    mover.style.transform = `translateX(${X0}px)`;
    chipSub("fc").textContent = "0%";
  }

  function tryGrab(e: PointerEvent, p: { x: number; y: number }): void {
    if (Math.abs(p.x - segX) <= 64 && p.y >= SEG_TOP - 28 && p.y <= SEG_BOT + 28) {
      sweeping = true;
      grabDX = p.x - segX;
      grabG?.classList.add("hold");
      capturePointer(svg, e.pointerId);
      haptic(HAPTIC.tap);
    } else {
      toast("선 가운데 동그란 손잡이를 잡아 보세요");
    }
  }

  function moveSweep(p: { x: number; y: number }): void {
    if (!mover || !faceRect) return;
    segX = clamp(p.x - grabDX, X0, XMAX);
    if (segX > maxX) {
      maxX = segX;
      faceRect.setAttribute("width", (maxX - X0).toFixed(1));
      if (!chips.has("fc")) chipSub("fc").textContent = `${Math.round(((maxX - X0) / (XMAX - X0)) * 100)}%`;
    }
    mover.style.transform = `translateX(${segX}px)`;
  }

  function endSweep(): void {
    sweeping = false;
    grabG?.classList.remove("hold");
    if (chips.has("fc") || locking) return;
    if (maxX >= GOAL_X - 0.5) {
      locking = true;
      haptic(HAPTIC.correct);
      chips.on("fc", "완성!");
      if (faceRect) faceRect.style.opacity = ".3";
      toast("선이 움직인 자리가 면이 돼요!");
      later(() => {
        locking = false;
        startCross();
      }, 1400);
    } else {
      toast("깃발까지, 조금 더 밀어 볼까요?");
    }
  }

  /* ── 국면 4: 만남(교점 발견 + 교선 비네트) ── */
  function startCross(): void {
    phase = "x";
    qCard.innerHTML = `${kicker("4단계: 만남")} 새 선을 그어 아까 그린 선과 만나게 해 보세요`;
    helper.innerHTML = "재료들이 <b>서로 만나면</b> 무엇이 생길까요? 아까의 선을 가로질러 쭉!";
    gStrokes.classList.remove("mtl-dim");
    gSweep.classList.add("mtl-dim");
    gDots.classList.add("mtl-dim");
  }

  /** 두 선분의 교점(없으면 null). */
  function segX2(
    a: { x: number; y: number }, b: { x: number; y: number },
    c: { x: number; y: number }, d: { x: number; y: number },
  ): { x: number; y: number } | null {
    const rx = b.x - a.x;
    const ry = b.y - a.y;
    const sx = d.x - c.x;
    const sy = d.y - c.y;
    const den = rx * sy - ry * sx;
    if (Math.abs(den) < 1e-9) return null;
    const t = ((c.x - a.x) * sy - (c.y - a.y) * sx) / den;
    const u = ((c.x - a.x) * ry - (c.y - a.y) * rx) / den;
    if (t < 0 || t > 1 || u < 0 || u > 1) return null;
    return { x: a.x + t * rx, y: a.y + t * ry };
  }

  function findCross(pts: { x: number; y: number }[]): { x: number; y: number } | null {
    for (const old of oldStrokes.slice(0, -1)) {
      for (let i = 1; i < pts.length; i++) {
        for (let j = 1; j < old.length; j++) {
          const hit = segX2(pts[i - 1], pts[i], old[j - 1], old[j]);
          if (hit) return hit;
        }
      }
    }
    return null;
  }

  function endCross(pts: { x: number; y: number }[]): void {
    const hit = findCross(pts);
    if (!hit) {
      toast("아직 안 만났어요. 아까 선을 가로질러 그어 보세요!");
      return;
    }
    locking = true;
    haptic(HAPTIC.correct);
    gX.innerHTML +=
      `<g class="mtl-dot">` +
      dot(hit.x, hit.y, GEO.hlA, 6) +
      `<circle class="mtl-ping" cx="${hit.x.toFixed(1)}" cy="${hit.y.toFixed(1)}" r="8" fill="none" stroke="${GEO.hlA}" stroke-width="2"/>` +
      `<text x="${hit.x.toFixed(1)}" y="${(hit.y - 14).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="#B26200">만나서 생긴 점!</text>` +
      `</g>`;
    toast("선과 선이 만나면 점이 생겨요!");
    chips.on("x", "발견!");
    later(bookVignette, 1500);
  }

  /** 교선 비네트: 책처럼 세운 두 면이 만나는 등줄기를 보여 준다. */
  function bookVignette(): void {
    gStrokes.classList.add("mtl-dim");
    gX.innerHTML +=
      `<g class="mtl-book">` +
      `<rect x="24" y="20" width="200" height="64" rx="10" fill="#FFFFFF" opacity=".88"/>` +
      `<polygon points="124,34 66,48 66,84 124,70" fill="${GEO.hlB}" opacity=".2" stroke="#8FB9C6" stroke-width="1.2"/>` +
      `<polygon points="124,34 182,48 182,84 124,70" fill="${GEO.hlB}" opacity=".13" stroke="#8FB9C6" stroke-width="1.2"/>` +
      `<line class="mtl-spine" x1="124" y1="34" x2="124" y2="70" stroke="${GEO.hlC}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<text x="140" y="30" font-size="11.5" font-weight="800" fill="#C93A62">면과 면이 만나면 선!</text>` +
      `</g>`;
    later(finish, 1700);
  }

  function finish(): void {
    phase = "done";
    locking = false;
    qCard.innerHTML = `${kicker("완성")} 점이 모여 선, 선이 지나가면 면, 만나면 또 점과 선!`;
    helper.innerHTML =
      "점 → 선 → 면이 도형의 재료이고, 재료가 <b>만나는 곳에는 새 점과 새 선</b>이 생겨요. 이제 전부 이름표를 붙일 차례!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 포인터 배선(국면 분기) ── */
  svg.addEventListener("pointerdown", (e) => {
    if (locking) return;
    const p = pos(e);
    if (phase === "pt") placeDot(p);
    else if (phase === "ln" || phase === "x") startStroke(e, p);
    else if (phase === "fc" && !chips.has("fc")) tryGrab(e, p);
  });
  svg.addEventListener("pointermove", (e) => {
    if ((phase === "ln" || phase === "x") && drawing) extendStroke(pos(e));
    else if (phase === "fc" && sweeping) moveSweep(pos(e));
  });
  const onUp = (): void => {
    if (phase === "ln" && drawing) endStroke();
    else if (phase === "x" && drawing) {
      drawing = false;
      const pts = curPts.slice();
      if (lineLen - strokeStartLen < 1 && polyCore && polyGlow) {
        polyCore.remove();
        polyGlow.remove();
      } else {
        oldStrokes.push(pts);
      }
      polyCore = polyGlow = null;
      lastPt = null;
      if (!chips.has("x") && !locking) endCross(pts);
    } else if (phase === "fc" && sweeping) endSweep();
  };
  svg.addEventListener("pointerup", onUp);
  svg.addEventListener("pointercancel", onUp);

  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
