// parallelLab, 평행선의 성질(Ⅳ L9 기함 — 교과서 158~159쪽).
// 직선 m의 기울기를 드래그하며 동위각 ∠a·∠b를 실시간 비교한다.
//  ① 기울이면 다르다: |θ|≥4°에서 놓으면 연장 점선이 저 멀리 교점을 드러낸다(평행이 아니면 만난다)
//  ② 평행 스냅: ∠b를 ∠a와 같게(|θ|≤1.5°) 만들면 스냅 + l∥m 배지 + 등간격 마커
//  ③ 엇각도 같다: 동위각 부채꼴이 두 교점의 중간점 기준 180° 회전해 엇각 자리에 겹친다
//     (anglePairLab의 회전 연출 문법 계승 — 엇각 = 동위각의 맞꼭지각).
// 채점 아님(발견 랩), 전 목표 달성 시 recordQuiz(true)+enableCTA.
// 드래그 중 즉시 갱신, 판정은 pointerup. rAF 금지(CSS 트랜지션 + setTimeout, 타이머 Set 일괄 해제).

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, polar, angleOf, angleArc, arcPath, lineSvg, dot, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface ParaStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const NS = "http://www.w3.org/2000/svg";
const W = 340;
const H = 252;
const ANG_N = 52; // 횡단선 n의 기울기(수학 각도)
const P2 = { x: 140, y: 168 }; // n×m 교점(m의 회전축)
const T_N = (P2.y - 70) / Math.sin((ANG_N * Math.PI) / 180); // P2→P1 거리
const P1 = polar(P2.x, P2.y, T_N, ANG_N); // n×l 교점(y=70)
const MIDP = { x: (P1.x + P2.x) / 2, y: (P1.y + P2.y) / 2 };
const MAX_T = 30; // m 기울기 한계(±도)
const SNAP = 1.6; // 평행 스냅 허용(도)
const DIFF = 4; // "다르다" 관찰 문턱(도)

export const parallelLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ParaStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "diff", label: "기울이면?", sub: "각이 달라요" },
    { id: "snap", label: "평행 스냅", sub: "∠a=∠b" },
    { id: "alt", label: "엇각도 같다", sub: "180° 돌리면" },
  ]);

  const board = mboard(470);
  const qCard = el("div", { class: "mdr-q mpr-q" });
  const stage = el("div", { class: "mpr-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="${NS}" fill="none">` +
    `<g class="mpr-ext"></g>` + // 연장 점선·교점(비평행 반례)
    `<g class="mpr-static"></g>` + // l·n·라벨(고정)
    `<g class="mpr-m"></g>` + // 직선 m(동적)
    `<g class="mpr-arcs"></g>` + // 각 호·수치(동적)
    `<g class="mpr-even"></g>` + // 평행 등간격 마커
    `<g class="mpr-fx"></g>` + // 엇각 회전 연출
    `<g class="mpr-handle"></g>` +
    `</svg>`;
  const readout = el("div", { class: "mpr-read" });
  const altBtn = el("button", { class: "mpr-alt mpr-hide", text: "엇각도 재 보기", attrs: { type: "button" } }) as HTMLButtonElement;
  board.append(qCard, stage, readout, altBtn);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "주황 손잡이를 위아래로 끌어 직선 <i>m</i>을 <b>기울여 보세요</b>. 두 각의 크기가 어떻게 변하나요?",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gExt = svg.querySelector(".mpr-ext") as SVGGElement;
  const gStatic = svg.querySelector(".mpr-static") as SVGGElement;
  const gM = svg.querySelector(".mpr-m") as SVGGElement;
  const gArcs = svg.querySelector(".mpr-arcs") as SVGGElement;
  const gEven = svg.querySelector(".mpr-even") as SVGGElement;
  const gFx = svg.querySelector(".mpr-fx") as SVGGElement;
  const gHandle = svg.querySelector(".mpr-handle") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ── 고정 배경: 직선 l, 횡단선 n, ∠a ── */
  const nA = polar(P2.x, P2.y, -34, ANG_N);
  const nB = polar(P2.x, P2.y, T_N + 44, ANG_N);
  gStatic.innerHTML =
    lineSvg(12, P1.y, 328, P1.y, GEO.ink, 2.6) +
    `<text x="322" y="${P1.y - 9}" font-size="13" font-style="italic" font-weight="800" fill="${GEO.ink}">l</text>` +
    lineSvg(nA.x, nA.y, nB.x, nB.y, GEO.soft, 2.2) +
    `<text x="${nB.x + 8}" y="${nB.y + 4}" font-size="12.5" font-style="italic" font-weight="700" fill="#64748B">n</text>` +
    angleArc(P1.x, P1.y, 26, 0, ANG_N, GEO.hlA, `${ANG_N}°`, { fill: true, labelR: 43, fontSize: 12 }) +
    dot(P1.x, P1.y, GEO.ink, 3);

  /* ── 상태 ── */
  let theta = 16; // m의 기울기(수학 각도, +면 오른쪽이 위로)
  let parallel = false;
  let dragging = false;
  let finished = false;

  const bVal = (): number => Math.round(ANG_N - theta);

  function redraw(): void {
    // 직선 m
    const e1 = polar(P2.x, P2.y, -168, theta);
    const e2 = polar(P2.x, P2.y, 168, theta);
    gM.innerHTML =
      lineSvg(e1.x, e1.y, e2.x, e2.y, parallel ? GEO.ok : GEO.ink, 2.6) +
      `<text x="${e2.x - 14}" y="${e2.y - 10}" font-size="13" font-style="italic" font-weight="800" fill="${GEO.ink}">m</text>` +
      dot(P2.x, P2.y, GEO.ink, 3);
    // ∠b 호
    const col = parallel ? GEO.ok : GEO.hlB;
    gArcs.innerHTML = angleArc(P2.x, P2.y, 26, theta, ANG_N, col, `${bVal()}°`, { fill: true, labelR: 43, fontSize: 12 });
    // 손잡이
    const hd = polar(P2.x, P2.y, 128, theta);
    gHandle.innerHTML =
      `<circle cx="${hd.x.toFixed(1)}" cy="${hd.y.toFixed(1)}" r="17" fill="${GEO.hlA}" opacity=".15"/>` +
      `<circle cx="${hd.x.toFixed(1)}" cy="${hd.y.toFixed(1)}" r="8" fill="#FFC24D" stroke="#B26200" stroke-width="1.8"/>` +
      `<circle cx="${hd.x.toFixed(1)}" cy="${hd.y.toFixed(1)}" r="26" fill="transparent" class="mpr-grab"/>`;
    // 읽기 패널
    const d = Math.abs(Math.round(theta));
    readout.innerHTML = parallel
      ? `<b class="ok">∠a = ∠b = ${ANG_N}°</b><span class="mpr-badge"><i>l</i> ∥ <i>m</i></span>`
      : `∠a = ${ANG_N}° · ∠b = ${bVal()}° <span class="mpr-diff">차이 ${d}°</span>`;
    // 연장·교점(비평행일 때만)
    drawExt();
  }

  function drawExt(): void {
    if (parallel || Math.abs(theta) < 0.5) {
      gExt.innerHTML = "";
      return;
    }
    const rad = (theta * Math.PI) / 180;
    const t = (P2.y - P1.y) / Math.sin(rad); // m 위에서 y=l 에 닿는 파라미터
    const mx = P2.x + t * Math.cos(rad);
    if (mx > 6 && mx < 334) {
      gExt.innerHTML =
        lineSvg(P2.x, P2.y, mx, P1.y, "#F04452", 1.6, "6 5") +
        `<circle cx="${mx.toFixed(1)}" cy="${P1.y}" r="6" fill="none" stroke="#F04452" stroke-width="2.2"/>`;
    } else {
      const right = mx >= 334;
      const ax = right ? 326 : 14;
      gExt.innerHTML =
        lineSvg(P2.x, P2.y, right ? 330 : 10, P2.y - (right ? 330 - P2.x : P2.x - 10) * Math.tan(rad) * (right ? 1 : -1), "#F04452", 1.6, "6 5") +
        `<g class="mpr-far"><path d="M${ax} ${P1.y + 26} l${right ? 10 : -10} 5 l${right ? -10 : 10} 5 z" fill="#F04452"/>` +
        `<text x="${right ? ax - 4 : ax + 4}" y="${P1.y + 48}" text-anchor="${right ? "end" : "start"}" font-size="10" font-weight="800" fill="#C93A62">저 멀리서 만나요!</text></g>`;
    }
  }

  /* ── 드래그(손잡이) ── */
  svg.addEventListener("pointerdown", (e) => {
    dragging = true;
    capturePointer(svg, e.pointerId);
    onMove(e);
  });
  svg.addEventListener("pointermove", (e) => {
    if (dragging) onMove(e);
  });
  const onMove = (e: PointerEvent): void => {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    if (Math.hypot(x - P2.x, y - P2.y) < 20) return; // 축 근처는 각도 불안정
    let a = angleOf(P2.x, P2.y, x, y);
    if (a > 180) a -= 360; // [-180, 180)
    // 손잡이는 오른쪽 반원에서 조작
    if (a > 90 || a < -90) return;
    const was = parallel;
    theta = Math.max(-MAX_T, Math.min(MAX_T, a));
    parallel = false;
    if (was) {
      gEven.innerHTML = "";
      altBtn.classList.add("mpr-hide");
    }
    redraw();
  };
  const onUp = (): void => {
    if (!dragging) return;
    dragging = false;
    if (finished) return;
    // 판정은 드롭에서
    if (Math.abs(theta) <= SNAP) {
      theta = 0;
      parallel = true;
      haptic(HAPTIC.correct);
      redraw();
      drawEven();
      if (chips.on("snap", `둘 다 ${ANG_N}°!`)) {
        toast("동위각이 같아지는 순간, 두 직선은 평행!");
        helper.innerHTML = `<b>∠a = ∠b = ${ANG_N}°</b>, 그리고 <i>l</i> ∥ <i>m</i>! 동위각이 같으면 평행, 평행하면 동위각이 같아요. 서로가 서로의 증거죠.`;
      }
      if (!chips.has("diff")) later(() => {
        helper.innerHTML = "이번엔 일부러 <b>기울여</b> 보세요. 평행이 깨지면 두 각과 두 직선에 무슨 일이 생기는지!";
      }, 2400);
      if (chips.has("diff") && !chips.has("alt")) {
        altBtn.classList.remove("mpr-hide");
        altBtn.classList.add("pulse");
        later(() => altBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
      }
      maybeFinish();
    } else if (Math.abs(theta) >= DIFF) {
      if (chips.on("diff", "만나 버려요")) {
        haptic(HAPTIC.tap);
        toast("동위각이 다르면, 연장했을 때 반드시 만나요!");
        helper.innerHTML = `지금 ∠a ${ANG_N}°, ∠b ${bVal()}°. 각이 다르니 빨간 점선처럼 <b>언젠가 만나는 두 직선</b>이에요. 이제 ∠b를 ∠a와 똑같이 맞춰 볼까요?`;
      }
    }
  };
  svg.addEventListener("pointerup", onUp);
  svg.addEventListener("pointercancel", onUp);

  /* ── 평행 등간격 마커 ── */
  function drawEven(): void {
    const gap = (x: number): string =>
      lineSvg(x, P1.y, x, P2.y, GEO.ok, 1.8, "3 4") +
      `<path d="M${x - 4} ${P1.y + 7} l4 -6 l4 6 z" fill="${GEO.ok}"/>` +
      `<path d="M${x - 4} ${P2.y - 7} l4 6 l4 -6 z" fill="${GEO.ok}"/>` +
      lineSvg(x - 5, (P1.y + P2.y) / 2, x + 5, (P1.y + P2.y) / 2, GEO.ok, 2);
    gEven.innerHTML = gap(58) + gap(292);
  }

  /* ── 엇각 연출: 동위각 부채꼴이 중간점 기준 180° 회전 → 엇각 자리 ── */
  altBtn.addEventListener("click", () => {
    if (!parallel || chips.has("alt") || finished) return;
    altBtn.disabled = true;
    altBtn.classList.remove("pulse");
    haptic(HAPTIC.select);
    // 복제 부채꼴(∠b 자리에서 출발)
    const fly = document.createElementNS(NS, "path");
    const wedge =
      `M${P2.x.toFixed(1)} ${P2.y.toFixed(1)} L` + arcPath(P2.x, P2.y, 30, 0, ANG_N).slice(1) + " Z";
    fly.setAttribute("d", wedge);
    fly.setAttribute("class", "mpr-fly");
    fly.style.transformBox = "view-box";
    fly.style.transformOrigin = `${MIDP.x}px ${MIDP.y}px`;
    fly.style.transform = "rotate(0deg)";
    fly.style.transition = "transform 1.1s cubic-bezier(.34,1.2,.5,1)";
    gFx.appendChild(fly);
    later(() => {
      fly.style.transform = "rotate(180deg)";
    }, 60);
    later(() => {
      // 엇각 호(∠c, P1의 안쪽-왼)
      gFx.innerHTML += angleArc(P1.x, P1.y, 26, 180, 180 + ANG_N, GEO.hlC, `${ANG_N}°`, { fill: true, labelR: 43, fontSize: 12 });
      haptic(HAPTIC.correct);
      toast("반 바퀴 돌리면 딱 겹치는 자리, 엇각!");
      helper.innerHTML = `평행선에서는 <b>엇각도 ${ANG_N}°로 같아요.</b> 동위각을 맞꼭지각으로 반 바퀴 돌린 게 엇각이니까요. 동위각이 같으면 엇각도 자동으로 같은 거죠!`;
      chips.on("alt", `엇각도 ${ANG_N}°`);
      maybeFinish();
    }, 1250);
  });

  function maybeFinish(): void {
    if (finished || chips.count() < 3) return;
    finished = true;
    qCard.innerHTML = `<span class="mpr-k">완성</span> 평행 ↔ 동위각·엇각 같음, 양방향 모두 확인!`;
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  qCard.innerHTML = `<span class="mpr-k">기울이기 실험</span> 두 각이 <b>같아지는 순간</b>, 무슨 일이 생길까요?`;
  redraw();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
