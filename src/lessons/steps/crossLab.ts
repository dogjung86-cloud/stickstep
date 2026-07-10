// crossLab, 공통 해 랩(중2 수학 Ⅱ L6 기함, 책 76~77쪽). 두 일차방정식의 자연수 해를
// 격자에 점으로 찍고, 두 색 점이 겹치는 "단 한 점"을 발견한다 — 연립방정식의 해 = 교집합.
// 직선은 긋지 않는다(일차함수 그래프는 중2 Ⅲ — 점만!). 격자 탭은 최근접 격자점 스냅,
// 판정은 pointerup(pointerdown 즉시 판정하면 드래그 스크롤과 충돌).
// 문법: mboard+goalChips+mtoast, CSS 트랜지션+setTimeout 체인(타이머 Set), rAF 금지.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N = 7; // 격자 0..7
const SIZE = 340;
const PAD = 26;
const UNIT = (SIZE - PAD * 2) / N;
const px = (v: number): number => PAD + v * UNIT;
const py = (v: number): number => SIZE - PAD - v * UNIT;

interface EqDef {
  id: "blue" | "orange";
  label: string; // mfmt
  test: (x: number, y: number) => boolean;
  calc: (x: number, y: number) => string; // 검산 문구(mfmt)
  sols: [number, number][];
}

const EQ1: EqDef = {
  id: "blue",
  label: "x+y=6",
  test: (x, y) => x + y === 6,
  calc: (x, y) => `${x}+${y}=6`,
  sols: [[1, 5], [2, 4], [3, 3], [4, 2], [5, 1]],
};
const EQ2: EqDef = {
  id: "orange",
  label: "2x+3y=14",
  test: (x, y) => 2 * x + 3 * y === 14,
  calc: (x, y) => `2×${x}+3×${y}=14`,
  sols: [[1, 4], [4, 2]],
};
const COMMON: [number, number] = [4, 2];

export const crossLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "blue", label: "파랑 조건", sub: "해 5개" },
    { id: "orange", label: "주황 조건", sub: "해 2개" },
    { id: "both", label: "공통의 해", sub: "단 한 점" },
  ]);
  const board = mboard(430);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(goals.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const T = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ── 무대 ── */
  const stage = el("div", { class: "crl-stage" });
  const cards = el("div", { class: "crl-cards" });
  const eqCard = (eq: EqDef): HTMLElement =>
    el("button", { class: `crl-eq ${eq.id}`, attrs: { type: "button", disabled: "true" } },
      el("span", { class: "dot" }),
      el("span", { class: "lab", html: mfmt(eq.label) }),
      el("span", { class: "cnt", text: `0/${eq.sols.length}` }),
    );
  const c1 = eqCard(EQ1);
  const c2 = eqCard(EQ2);
  cards.append(c1, c2);

  // SVG 격자
  const svgWrap = el("div", { class: "crl-grid" });
  let gridInner = "";
  for (let v = 0; v <= N; v++) {
    gridInner += `<line x1="${px(v)}" y1="${py(0)}" x2="${px(v)}" y2="${py(N)}" stroke="#E4D6C2" stroke-width="1"/>`;
    gridInner += `<line x1="${px(0)}" y1="${py(v)}" x2="${px(N)}" y2="${py(v)}" stroke="#E4D6C2" stroke-width="1"/>`;
    if (v > 0) {
      gridInner += `<text x="${px(v)}" y="${py(0) + 15}" text-anchor="middle" font-size="10" font-weight="700" fill="#A08B6E">${v}</text>`;
      gridInner += `<text x="${px(0) - 8}" y="${py(v) + 3.5}" text-anchor="end" font-size="10" font-weight="700" fill="#A08B6E">${v}</text>`;
    }
  }
  gridInner += `<line x1="${px(0)}" y1="${py(0)}" x2="${px(N) + 6}" y2="${py(0)}" stroke="#8C6A3E" stroke-width="1.8"/>`;
  gridInner += `<line x1="${px(0)}" y1="${py(0)}" x2="${px(0)}" y2="${py(N) - 6}" stroke="#8C6A3E" stroke-width="1.8"/>`;
  gridInner += `<text x="${px(0) - 8}" y="${py(0) + 15}" text-anchor="end" font-size="10.5" font-weight="800" fill="#8C6A3E">O</text>`;
  gridInner += `<text x="${px(N) + 2}" y="${py(0) - 8}" font-size="12" font-weight="800" font-style="italic" fill="#7A5A30">x</text>`;
  gridInner += `<text x="${px(0) + 8}" y="${py(N) + 2}" font-size="12" font-weight="800" font-style="italic" fill="#7A5A30">y</text>`;
  svgWrap.innerHTML = `<svg viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg" fill="none">${gridInner}<g class="crl-marks"></g></svg>`;
  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const marks = svg.querySelector(".crl-marks") as SVGGElement;

  const qline = el("div", { class: "crl-q" });
  stage.append(cards, svgWrap, qline);
  board.appendChild(stage);

  /* ── 상태 ── */
  let phase: 0 | 1 | 2 = 0; // 0=파랑, 1=주황, 2=공통 지목
  let busy = false;
  const found = { blue: new Set<string>(), orange: new Set<string>() };
  const key = (x: number, y: number): string => `${x},${y}`;

  const NS = "http://www.w3.org/2000/svg";
  function mark(x: number, y: number, cls: string): SVGElement {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", `crl-pt ${cls}`);
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", String(px(x)));
    c.setAttribute("cy", String(py(y)));
    c.setAttribute("r", cls.includes("ring") ? "11" : "6.5");
    g.appendChild(c);
    marks.appendChild(g);
    return g;
  }

  function flashX(x: number, y: number): void {
    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", String(px(x)));
    t.setAttribute("y", String(py(y) + 5));
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("class", "crl-x");
    t.textContent = "×";
    marks.appendChild(t);
    T(() => t.remove(), 750);
  }

  function updateCards(): void {
    (c1.querySelector(".cnt") as HTMLElement).textContent = `${found.blue.size}/${EQ1.sols.length}`;
    (c2.querySelector(".cnt") as HTMLElement).textContent = `${found.orange.size}/${EQ2.sols.length}`;
    c1.classList.toggle("on", phase === 0);
    c2.classList.toggle("on", phase === 1);
  }

  function handleTap(gx: number, gy: number): void {
    if (busy) return;
    if (gx < 0 || gy < 0 || gx > N || gy > N) return;
    haptic(HAPTIC.tap);
    if (phase === 2) {
      // 공통 해 지목
      if (gx === COMMON[0] && gy === COMMON[1]) {
        busy = true;
        const g = mark(gx, gy, "crown");
        g.classList.add("pop");
        haptic(HAPTIC.done);
        toast(`(${gx}, ${gy})만 두 조건을 동시에 만족, 이게 연립방정식의 해!`);
        qline.innerHTML = `공통의 해: ${mfmt(`(${gx},${gy})`)}`;
        goals.on("both");
        T(() => {
          helper.innerHTML =
            "두 방정식을 <b>동시에</b> 참이 되게 하는 순서쌍은 단 하나였어요. 이 한 점을 찾는 것이 연립방정식을 푸는 일이에요!";
          api.recordQuiz(true);
          api.enableCTA(s.cta ?? "수학 용어 정복하기");
        }, 1200);
      } else if (found.blue.has(key(gx, gy)) || found.orange.has(key(gx, gy))) {
        toast("그 점은 한쪽 조건만 만족해요. 두 색이 겹친 점을 찾아요!");
        haptic(HAPTIC.wrong);
      } else {
        flashX(gx, gy);
        haptic(HAPTIC.wrong);
      }
      return;
    }
    const eq = phase === 0 ? EQ1 : EQ2;
    const bag = phase === 0 ? found.blue : found.orange;
    if (bag.has(key(gx, gy))) {
      toast("이미 찾은 점이에요!");
      return;
    }
    if (eq.test(gx, gy)) {
      bag.add(key(gx, gy));
      const isOverlap = phase === 1 && found.blue.has(key(gx, gy));
      const g = mark(gx, gy, phase === 0 ? "blue" : "orange ring");
      g.classList.add("pop");
      haptic(HAPTIC.correct);
      toast(`${eq.calc(gx, gy).replace(/×/g, "×")} 참! ${isOverlap ? "어라, 파랑 점 위에 겹쳤어요!" : ""}`);
      updateCards();
      if (bag.size === eq.sols.length) {
        goals.on(eq.id);
        if (phase === 0) {
          T(() => {
            phase = 1;
            updateCards();
            helper.innerHTML = `이번엔 주황 조건 ${mfmt(EQ2.label)}. 이 식을 참이 되게 하는 점 <b>2개</b>를 찾아요.`;
            toast("두 번째 조건 시작!");
          }, 1100);
        } else {
          T(() => {
            phase = 2;
            updateCards();
            qline.textContent = "두 조건을 동시에 만족하는 점은 어디일까요? 그 점을 탭!";
            helper.innerHTML = "파랑 점이면서 주황 고리를 두른 점, <b>두 색이 겹친 곳</b>을 지목해요.";
          }, 1100);
        }
      }
    } else {
      flashX(gx, gy);
      haptic(HAPTIC.wrong);
      const lhs = phase === 0 ? gx + gy : 2 * gx + 3 * gy;
      const rhs = phase === 0 ? 6 : 14;
      toast(`(${gx}, ${gy})는 계산하면 ${lhs}, ${rhs}가 아니라서 해가 아니에요`);
    }
  }

  // 격자 탭: 최근접 격자점 스냅(판정은 pointerup)
  let downAt: { x: number; y: number } | null = null;
  svg.addEventListener("pointerdown", (e) => {
    downAt = { x: e.clientX, y: e.clientY };
  });
  svg.addEventListener("pointerup", (e) => {
    if (!downAt) return;
    const moved = Math.abs(e.clientX - downAt.x) + Math.abs(e.clientY - downAt.y);
    downAt = null;
    if (moved > 14) return; // 스크롤 제스처는 무시
    const r = svg.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * SIZE;
    const vy = ((e.clientY - r.top) / r.height) * SIZE;
    const gx = Math.round((vx - PAD) / UNIT);
    const gy = Math.round((SIZE - PAD - vy) / UNIT);
    // 스냅 허용 반경(격자점에서 0.38칸 이내)
    const dx = Math.abs(vx - px(gx));
    const dy = Math.abs(vy - py(gy));
    if (dx > UNIT * 0.38 || dy > UNIT * 0.38) return;
    handleTap(gx, gy);
  });

  helper.innerHTML = `먼저 파랑 조건 ${mfmt(EQ1.label)}. 이 식을 참이 되게 하는 격자점 <b>5개</b>를 전부 찾아 탭해요. (x, y 모두 자연수!)`;
  updateCards();
  api.setCTA("두 조건이 겹치는 한 점을 찾아요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
