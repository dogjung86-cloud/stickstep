// perpLab, 가장 짧은 길 랩(Ⅳ L5, 교과서 151쪽: 수직·수선의 발·점과 직선 사이의 거리).
// 점 P에서 직선 l 위의 점 H까지 레이저 거리계로 여러 길을 재 보고(고스트 기록),
// 길이가 자리마다 다름을 확인한 뒤 직각으로 만나는 길이 최단임을 발견한다.
// 국면: ① 여러 길 재 보기(서로 다른 3곳) ② 최단 지점 스냅 + 용어 카드 3연속 팝
// (수직 ⊥, 수선의 발, 점과 직선 사이의 거리) ③ 기록 판정단(멀리뛰기 공식 기록 = 수직 거리).
// 40px = 1m 환산. 드래그 중 즉시 갱신, 확정 판정은 pointerup. 포인터 캡처는 geoKit.capturePointer만.
// 채점 아님(발견 랩): 3목표 달성 시 recordQuiz(true) + enableCTA.
// rAF 금지: 모션은 CSS 트랜지션/키프레임 + setTimeout 체인(타이머는 Set으로 모아 cleanup 해제).

import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import { GEO, lineSvg, arrowHead, rightMark, dot, ptLabel, capturePointer, gsym } from "../../ui/geoKit";
import type { StepRenderer } from "../types";

interface PerpStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const HGT = 250;
const PXX = 170; // 점 P
const PYY = 56;
const LY = 188; // 직선 l의 y(아래쪽 1/4 지점)
const FOOT = 170; // 수선의 발 x(P 바로 아래)
const SNAP = 6; // 스냅 허용 오차(px)
const MPX = 40; // 40px = 1m

/* 판정 장면 기하: 출발선 x=104(세로), 발자국 P0=(264,125).
   (가) 수직 선분 (104,125)-(264,125) = 160px = 4.0m
   (나) 비스듬한 선분 (104,213)-(264,125) = 182.6px = 4.6m */
const JLX = 104;
const JPX = 264;
const JPY = 125;
const JBY = 213;

export const perpLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PerpStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "try", label: "길 재 보기", sub: "0/3곳" },
    { id: "min", label: "최단 발견", sub: "직각!" },
    { id: "judge", label: "기록 판정", sub: "수직 거리" },
  ]);

  const board = mboard(340);
  const qCard = el("div", { class: "mdr-q mcl-q" });
  const stage = el("div", { class: "mpl-stage" });
  const read = el("div", { class: "mpl-read", text: "0.0 m" });
  board.append(qCard, stage, read);
  const toast = mtoast(board);
  const terms = el("div", { class: "mpl-terms" });
  const helper = el("div", {
    class: "helper",
    html: "주황 점 <b>H</b>를 좌우로 끌어 P에서 <i class='mv'>l</i>까지 길을 놓아 보세요. 손을 떼면 레이저 거리계가 그 길이를 기록해요!",
  });
  host.append(chips.el, helper, board, terms); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ── 상태 ── */
  let phase: "measure" | "judge" | "done" = "measure";
  let locking = false;
  let dragging = false;
  let hx = 260; // H의 x
  let atFoot = false;
  const spots: number[] = []; // 서로 다른 기록 위치
  const ghosts: { x: number; g: SVGGElement }[] = [];

  const lenAt = (x: number): number => Math.hypot(x - PXX, LY - PYY) / MPX;
  const fmtLen = (x: number): string => `${lenAt(x).toFixed(1)} m`;

  /* ── 측정 장면 ── */
  qCard.innerHTML = `<span class="mcl-k">레이저 거리계</span> P에서 <i class='mv'>l</i>까지, 어떤 길이 가장 짧을까요?`;
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${HGT}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="mpl-ghosts"></g>` +
    lineSvg(12, LY, 328, LY, GEO.ink, 2.6) +
    arrowHead(328, LY, 0) +
    arrowHead(12, LY, 180) +
    `<text x="322" y="177" font-size="13.5" font-style="italic" font-weight="800" fill="${GEO.ink}">l</text>` +
    `<g class="mpl-live">` +
    `<line class="mpl-glow" x1="${PXX}" y1="${PYY}" x2="${hx}" y2="${LY}" stroke="${GEO.hlA}" stroke-width="8" opacity=".16" stroke-linecap="round"/>` +
    `<line class="mpl-core" x1="${PXX}" y1="${PYY}" x2="${hx}" y2="${LY}" stroke="${GEO.hlA}" stroke-width="2.6" stroke-linecap="round"/>` +
    `</g>` +
    `<g class="mpl-rm"></g>` +
    dot(PXX, PYY, GEO.ink, 5) +
    ptLabel(PXX, PYY, "P", 0, -12) +
    `<g class="mpl-hand" style="transform:translate(${hx}px,${LY}px)">` +
    `<circle r="15" fill="${GEO.hlA}" opacity=".15"/>` +
    `<circle r="7.5" fill="url(#mplHG)" stroke="#B26200" stroke-width="1.8"/>` +
    `<circle r="24" fill="transparent"/>` +
    `</g>` +
    `<text class="mpl-hlab" x="${hx}" y="212" text-anchor="middle" font-size="12.5" font-weight="800" fill="${GEO.soft}">H</text>` +
    `<defs><radialGradient id="mplHG" cx=".36" cy=".3" r="1">` +
    `<stop offset="0" stop-color="#FFC24D"/><stop offset="1" stop-color="#F08C00"/>` +
    `</radialGradient></defs>` +
    `</svg>`;

  let svg = stage.querySelector("svg") as SVGSVGElement;
  let gGhost = svg.querySelector(".mpl-ghosts") as SVGGElement;
  let glow = svg.querySelector(".mpl-glow") as SVGLineElement;
  let core = svg.querySelector(".mpl-core") as SVGLineElement;
  let rmG = svg.querySelector(".mpl-rm") as SVGGElement;
  let hand = svg.querySelector(".mpl-hand") as SVGGElement;
  let hlab = svg.querySelector(".mpl-hlab") as SVGTextElement;

  function paintMeasure(): void {
    hand.style.transform = `translate(${hx}px,${LY}px)`;
    hlab.setAttribute("x", String(hx));
    for (const ln of [glow, core]) {
      ln.setAttribute("x2", String(hx));
    }
    const col = atFoot ? GEO.ok : GEO.hlA;
    glow.setAttribute("stroke", col);
    core.setAttribute("stroke", col);
    read.textContent = atFoot ? `${fmtLen(hx)} 최단!` : fmtLen(hx);
    read.classList.toggle("min", atFoot);
  }

  function leaveFoot(): void {
    if (!atFoot) return;
    atFoot = false;
    rmG.innerHTML = "";
    rmG.setAttribute("class", "mpl-rm");
  }

  /** 서로 다른 위치 기록(목표 1). quiet면 토스트·helper를 건드리지 않는다. */
  function registerSpot(x: number, quiet = false): void {
    if (chips.has("try")) return;
    if (!spots.every((v) => Math.abs(v - x) > 12)) {
      if (!quiet) toast(`${fmtLen(x)}, 아까 잰 자리 근처예요`);
      return;
    }
    spots.push(x);
    if (spots.length < 3) {
      const chip = chips.el.querySelector(`[data-g="try"] span`) as HTMLElement;
      chip.textContent = `${spots.length}/3곳`;
      if (!quiet) toast(`${spots.length}곳째 기록, ${fmtLen(x)}!`);
    } else {
      chips.on("try", "3곳!");
      if (!quiet) toast(`3곳째 기록, ${fmtLen(x)}!`);
      if (chips.has("min")) goJudge();
      else if (!quiet)
        helper.innerHTML = "길이가 <b>자리마다 다르죠?</b> 가장 짧은 곳은 어디일까요? 거리계를 보며 찾아보세요!";
    }
  }

  /** 고스트 선분(회색 기록)을 남긴다. 최대 5개, 오래된 것부터 흐려진다. */
  function addGhost(x: number): void {
    if (ghosts.some((g) => Math.abs(g.x - x) < 8)) return;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const mx = (PXX + x) / 2;
    const my = (PYY + LY) / 2;
    const side = x >= PXX ? 1 : -1;
    g.innerHTML =
      `<line x1="${PXX}" y1="${PYY}" x2="${x}" y2="${LY}" stroke="${GEO.faint}" stroke-width="1.6" stroke-linecap="round"/>` +
      `<text x="${mx + side * 10}" y="${my}" text-anchor="${side > 0 ? "start" : "end"}" font-size="9.5" font-weight="700" fill="${GEO.soft}">${lenAt(x).toFixed(1)}m</text>`;
    gGhost.appendChild(g);
    ghosts.push({ x, g });
    if (ghosts.length > 5) {
      const old = ghosts.shift();
      old?.g.remove();
    }
    ghosts.forEach((it, i) => {
      it.g.style.opacity = String(0.62 * Math.pow(0.72, ghosts.length - 1 - i));
    });
  }

  /* ── 국면 2: 최단 지점 발견 + 용어 카드 3연속 ── */
  function popTerm(name: string, desc: string): void {
    haptic(HAPTIC.tap);
    terms.appendChild(
      el("div", { class: "mpl-term" }, el("b", { class: "mpl-tname", html: name }), el("span", { html: desc })),
    );
  }

  function termChain(): void {
    locking = true;
    later(
      () =>
        popTerm(
          "수직 ⊥",
          `직각으로 만나는 두 선은 서로 <b>수직</b>이에요. 기호로 ${gsym("PH", "seg")} ⊥ <i class='mv'>l</i> 이라고 써요.`,
        ),
      420,
    );
    later(
      () =>
        popTerm(
          "수선의 발",
          `점 P에서 <i class='mv'>l</i>에 수직으로 그은 직선이 <b>수선</b>, 수선이 <i class='mv'>l</i>과 만나는 점 H가 <b>수선의 발</b>이에요.`,
        ),
      1750,
    );
    later(
      () =>
        popTerm(
          "점과 직선 사이의 거리",
          `이 최단 길이 <b>3.3 m</b>, 수선의 발까지의 길이가 점 P와 직선 <i class='mv'>l</i> 사이의 <b>거리</b>예요.`,
        ),
      3080,
    );
    later(() => {
      chips.on("min", "90°!");
      locking = false;
      if (chips.has("try")) goJudge();
      else {
        const need = 3 - spots.length;
        helper.innerHTML = `용어 획득! 이제 <b>다른 자리 ${need}곳</b>도 재 보며 길이를 비교해 봐요.`;
      }
    }, 3950);
  }

  function drop(): void {
    if (Math.abs(hx - FOOT) <= SNAP) {
      hx = FOOT;
      atFoot = true;
      paintMeasure();
      rmG.innerHTML = rightMark(FOOT, LY, 0, 10, GEO.ok);
      rmG.setAttribute("class", "mpl-rm");
      void rmG.getBoundingClientRect();
      rmG.setAttribute("class", "mpl-rm pop");
      haptic(HAPTIC.correct);
      registerSpot(FOOT, true);
      if (!chips.has("min")) {
        toast("가장 짧은 길은 직각으로 만나는 길!");
        termChain();
      } else {
        toast("최단 지점, 3.3 m!");
      }
    } else {
      haptic(HAPTIC.tap);
      addGhost(hx);
      registerSpot(hx);
    }
  }

  /* ── 국면 3: 기록 판정단 ── */
  function goJudge(): void {
    if (phase !== "measure") return;
    phase = "judge";
    locking = true;
    helper.innerHTML = "판정단 입장! 배운 눈으로 <b>실전 기록</b>을 재 봐요.";
    later(() => stage.classList.add("fade"), 700);
    later(() => {
      buildJudge();
      stage.classList.remove("fade");
      locking = false;
    }, 1180);
  }

  let gA: SVGGElement | null = null;
  let gB: SVGGElement | null = null;
  let rm2: SVGGElement | null = null;
  let bLine: SVGLineElement | null = null;

  function buildJudge(): void {
    read.classList.add("off");
    qCard.innerHTML = `<span class="mcl-k">기록 판정단</span> 공식 기록은 어느 길이일까요?`;
    helper.innerHTML =
      "위에서 본 멀리뛰기 모래판이에요. 출발선에서 발자국 P′까지, <b>어느 선분이 공식 기록</b>일까요? 그림에서 골라 탭!";
    stage.innerHTML =
      `<svg viewBox="0 0 ${W} ${HGT}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<rect x="6" y="8" width="82" height="234" rx="10" fill="#E9EFF6"/>` +
      `<rect x="104" y="8" width="230" height="234" rx="12" fill="#F9EBCB"/>` +
      `<circle cx="150" cy="50" r="1.6" fill="#EAD9AE"/><circle cx="205" cy="34" r="1.4" fill="#EAD9AE"/>` +
      `<circle cx="300" cy="70" r="1.6" fill="#EAD9AE"/><circle cx="140" cy="180" r="1.5" fill="#EAD9AE"/>` +
      `<circle cx="290" cy="205" r="1.6" fill="#EAD9AE"/><circle cx="220" cy="230" r="1.4" fill="#EAD9AE"/>` +
      `<circle cx="320" cy="150" r="1.4" fill="#EAD9AE"/>` +
      `<rect x="88" y="8" width="16" height="234" fill="#FFFFFF" stroke="#C9D4E0" stroke-width="1.4"/>` +
      `<line x1="${JLX}" y1="8" x2="${JLX}" y2="242" stroke="${GEO.ink}" stroke-width="3"/>` +
      `<text x="96" y="26" text-anchor="end" font-size="10.5" font-weight="800" fill="${GEO.soft}">출발선</text>` +
      `<g class="mpl-sa">` +
      lineSvg(JLX, JPY, JPX, JPY, GEO.hlB, 2.8, "7 5") +
      `<text x="184" y="112" text-anchor="middle" font-size="12" font-weight="800" fill="#0A87A3" stroke="#F9EBCB" stroke-width="4" paint-order="stroke">(가) 4.0 m</text>` +
      `</g>` +
      `<g class="mpl-sb">` +
      `<line class="mpl-sbl" x1="${JLX}" y1="${JBY}" x2="${JPX}" y2="${JPY}" stroke="#8A6EE0" stroke-width="2.8" stroke-dasharray="7 5" stroke-linecap="round"/>` +
      `<text x="202" y="188" text-anchor="middle" font-size="12" font-weight="800" fill="#6A55F2" stroke="#F9EBCB" stroke-width="4" paint-order="stroke">(나) 4.6 m</text>` +
      `</g>` +
      `<g class="mpl-rm2"></g>` +
      `<g class="mpl-foot">` +
      `<ellipse cx="266" cy="124" rx="12" ry="7.5" fill="${GEO.hlC}" opacity=".9" transform="rotate(-8 266 124)"/>` +
      `<circle cx="250" cy="127" r="5.5" fill="${GEO.hlC}" opacity=".7"/>` +
      `</g>` +
      ptLabel(JPX, JPY, "P′", 4, -18) +
      `</svg>`;
    svg = stage.querySelector("svg") as SVGSVGElement;
    gA = svg.querySelector(".mpl-sa") as SVGGElement;
    gB = svg.querySelector(".mpl-sb") as SVGGElement;
    rm2 = svg.querySelector(".mpl-rm2") as SVGGElement;
    bLine = svg.querySelector(".mpl-sbl") as SVGLineElement;
  }

  function segDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const t = clamp(((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
  }

  function judgeTap(vx: number, vy: number): void {
    if (!gA || !gB) return;
    const da = segDist(vx, vy, JLX, JPY, JPX, JPY);
    const db = segDist(vx, vy, JLX, JBY, JPX, JPY);
    if (Math.min(da, db) > 30) return;
    if (da <= db) {
      // (가) 수직 거리: 정답
      phase = "done";
      haptic(HAPTIC.correct);
      const ln = gA.querySelector("line") as SVGLineElement;
      ln.setAttribute("stroke", GEO.ok);
      ln.removeAttribute("stroke-dasharray");
      (gA.querySelector("text") as SVGTextElement).setAttribute("fill", "#068D4E");
      if (rm2) {
        rm2.innerHTML = rightMark(JLX, JPY, 0, 10, GEO.ok);
        rm2.setAttribute("class", "mpl-rm2 mpl-rm pop");
      }
      gB.style.opacity = ".35";
      toast("기록은 언제나 수직 거리!");
      chips.on("judge", "공식 기록!");
      later(finishLab, 800);
    } else {
      // (나) 비스듬한 선분: 오개념 교정 후 재시도
      haptic(HAPTIC.cross);
      gB.setAttribute("class", "mpl-sb");
      void gB.getBoundingClientRect();
      gB.setAttribute("class", "mpl-sb mpl-shake");
      bLine?.setAttribute("stroke", GEO.no);
      later(() => bLine?.setAttribute("stroke", "#8A6EE0"), 650);
      toast("비스듬한 길은 더 길어요!");
      helper.innerHTML =
        "그렇게 재면 대회마다 기록이 달라져요. <b>가장 짧은 한 가지 길이</b>인 수직 거리가 공식 기록! 다시 골라 봐요.";
    }
  }

  function finishLab(): void {
    qCard.innerHTML = `<span class="mcl-k">완료</span> 점과 직선 사이의 거리 = 수선의 발까지!`;
    helper.innerHTML = "점에서 직선까지의 진짜 거리는 <b>딱 하나</b>, 수선의 발까지의 길이예요.";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 포인터(측정 드래그 + 판정 탭, stage에 위임) ── */
  const toView = (e: PointerEvent): { x: number; y: number } => {
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * HGT };
  };

  stage.addEventListener("pointerdown", (e) => {
    if (locking) return;
    const p = toView(e);
    if (phase === "measure") {
      dragging = true;
      capturePointer(stage, e.pointerId);
      const nx = Math.round(clamp(p.x, 26, 314));
      if (nx !== FOOT) leaveFoot();
      hx = nx;
      paintMeasure();
    } else if (phase === "judge") {
      judgeTap(p.x, p.y);
    }
  });
  stage.addEventListener("pointermove", (e) => {
    if (!dragging || phase !== "measure") return;
    const p = toView(e);
    const nx = Math.round(clamp(p.x, 26, 314));
    if (nx !== hx) leaveFoot();
    hx = nx;
    paintMeasure();
  });
  const up = (): void => {
    if (!dragging) return;
    dragging = false;
    if (phase === "measure" && !locking) drop();
  };
  stage.addEventListener("pointerup", up);
  stage.addEventListener("pointercancel", up);

  paintMeasure();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
