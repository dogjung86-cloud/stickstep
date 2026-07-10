// numWalk, 수직선 산책(L8 랩). 도착점을 먼저 예측(탭)하고, 스틱맨이 걸어가 확인한다.
// 예측→실행→확인 문법. 예측은 채점하지 않는다(사전 예측 효과, 훅 규칙과 같은 정신).
// rAF 없음, 걸음은 setTimeout 체인 + CSS transform 트랜지션.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface WalkStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 360;
const H = 168;
const Y = 118; // 수직선 y
const LO = -6;
const HI = 6;
const X = (v: number): number => 24 + ((v - LO) / (HI - LO)) * (W - 48);

const PROBS: { a: number; b: number; goal: string; sub: string; note: string }[] = [
  {
    a: 3,
    b: 2,
    goal: "pp",
    sub: "(+3)+(+2)",
    note: "같은 방향으로 쭉, 오른쪽 3칸, 또 2칸. 부호가 같으면 <b>절댓값의 합</b>에 그 부호!",
  },
  {
    a: 4,
    b: -6,
    goal: "pn",
    sub: "(+4)+(-6)",
    note: "오른쪽 4칸, 다시 왼쪽 6칸, 반대로 걸으면 <b>절댓값의 차</b>만 남아요. 부호는 더 많이 걸은 쪽!",
  },
  {
    a: -2,
    b: -3,
    goal: "nn",
    sub: "(-2)+(-3)",
    note: "왼쪽으로 2칸, 또 3칸, 음수끼리도 규칙은 같아요. 절댓값의 합에 <b>−</b>!",
  },
];

export const numWalk: StepRenderer = (host, step, api) => {
  const s = step as unknown as WalkStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "pp", label: "양+양", sub: "예측 산책" },
    { id: "pn", label: "양+음", sub: "예측 산책" },
    { id: "nn", label: "음+음", sub: "예측 산책" },
  ]);
  const expr = el("div", { class: "nw-expr" });
  const board = mboard(0);
  const toast = mtoast(board);
  const stage = el("div", { class: "nw-stage", attrs: { tabindex: "0", role: "slider", "aria-label": "도착점 예측, 좌우 화살표로 이동, 엔터로 확정" } });
  board.appendChild(stage);
  const helper = el("div", { class: "helper" });
  host.append(goals.el, helper, expr, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  let pi = 0;
  let phase: "predict" | "walk" | "done" = "predict";
  let guess: number | null = null;
  let kbGuess = 0;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };

  function ticksSvg(): string {
    let t = "";
    for (let v = LO; v <= HI; v++) {
      const big = v === 0;
      t += `<line x1="${X(v)}" y1="${Y - (big ? 9 : 5)}" x2="${X(v)}" y2="${Y + (big ? 9 : 5)}" stroke="${big ? "#54677A" : "#B9C6D2"}" stroke-width="${big ? 2.4 : 1.5}"/>`;
      t += `<text x="${X(v)}" y="${Y + 26}" text-anchor="middle" font-size="11" font-weight="700" fill="${big ? "#54677A" : "#8CA0B3"}">${String(v).replace("-", "−")}</text>`;
    }
    return t;
  }

  function legArc(from: number, to: number, lift: number, color: string): string {
    const x1 = X(from);
    const x2 = X(to);
    const mid = (x1 + x2) / 2;
    const dir = to > from ? 1 : -1;
    return (
      `<path d="M ${x1} ${Y - 14} Q ${mid} ${Y - 14 - lift} ${x2} ${Y - 14}" stroke="${color}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".9"/>` +
      `<path d="M ${x2 - dir * 8} ${Y - 20} L ${x2} ${Y - 14} L ${x2 - dir * 8} ${Y - 9}" stroke="${color}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    );
  }

  /** 스틱맨(손그림 라인), pos 위치에 서 있는 그룹. transform으로 걷는다. */
  function stickSvg(): string {
    return (
      `<g class="nwman" style="transition: transform .24s cubic-bezier(.34,1.2,.5,1)">` +
      `<circle cx="0" cy="${Y - 46}" r="9" fill="#fff" stroke="#3C4654" stroke-width="2.2"/>` +
      `<path d="M -3 ${Y - 48} h 2 M 2 ${Y - 48} h 2 M -3 ${Y - 42} q 3 2.4 6 0" stroke="#3C4654" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
      `<path d="M 0 ${Y - 37} V ${Y - 22} M 0 ${Y - 33} l -8 6 M 0 ${Y - 33} l 8 6 M 0 ${Y - 22} l -6 9 M 0 ${Y - 22} l 6 9" stroke="#3C4654" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
      `</g>`
    );
  }

  let manEl: SVGGElement | null = null;
  let flagEl: SVGGElement | null = null;

  function draw(): void {
    stage.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<line x1="10" y1="${Y}" x2="${W - 10}" y2="${Y}" stroke="#94A3B8" stroke-width="2.4" stroke-linecap="round"/>` +
      ticksSvg() +
      `<g class="nwlegs"></g>` +
      `<g class="nwflag" style="transition: transform .2s ease" opacity="0">` +
      `<path d="M 0 ${Y - 12} v -26 l 16 5 l -16 5" fill="#FFB01F" stroke="#D8952E" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<circle cx="0" cy="${Y - 12}" r="3" fill="#D8952E"/>` +
      `</g>` +
      stickSvg() +
      `</svg>`;
    manEl = stage.querySelector(".nwman");
    flagEl = stage.querySelector(".nwflag");
    moveMan(0, false);
  }

  function moveMan(v: number, smooth = true): void {
    if (!manEl) return;
    if (!smooth) manEl.style.transition = "none";
    manEl.style.transform = `translateX(${X(v)}px)`;
    if (!smooth)
      later(() => {
        if (manEl) manEl.style.transition = "transform .24s cubic-bezier(.34,1.2,.5,1)";
      }, 30);
  }

  function setFlag(v: number | null): void {
    if (!flagEl) return;
    if (v == null) {
      flagEl.setAttribute("opacity", "0");
    } else {
      flagEl.setAttribute("opacity", "1");
      flagEl.style.transform = `translateX(${X(v)}px)`;
    }
  }

  function mount(i: number): void {
    pi = i;
    phase = "predict";
    guess = null;
    kbGuess = 0;
    const p = PROBS[i];
    expr.innerHTML = mfmt(`(${p.a >= 0 ? "+" + p.a : p.a})+(${p.b >= 0 ? "+" + p.b : p.b}) = ?`);
    draw();
    setFlag(null);
    helper.innerHTML = "스틱맨이 <b>어디에 도착할지</b> 먼저 예측해서 수직선을 탭해 보세요. 그다음 함께 걸어요.";
  }

  function predict(v: number): void {
    if (phase !== "predict") return;
    guess = v;
    setFlag(v);
    haptic(HAPTIC.select);
    helper.innerHTML = `<b>${String(v).replace("-", "−")}</b>에 깃발을 꽂았어요, 이제 걸어서 확인!`;
    later(walk, 550);
  }

  function walk(): void {
    if (phase !== "predict") return;
    phase = "walk";
    const p = PROBS[pi];
    const legs = stage.querySelector(".nwlegs")!;
    let pos = 0;
    const hop = (target: number, stepDir: number, then: () => void): void => {
      if (pos === target) {
        then();
        return;
      }
      pos += stepDir;
      moveMan(pos);
      haptic(HAPTIC.tap);
      later(() => hop(target, stepDir, then), 265);
    };
    // 1구간
    legs.innerHTML = legArc(0, p.a, 26, p.a >= 0 ? "var(--m-pos)" : "var(--m-neg)");
    hop(p.a, p.a >= 0 ? 1 : -1, () => {
      later(() => {
        // 2구간
        legs.innerHTML += legArc(p.a, p.a + p.b, 40, p.b >= 0 ? "var(--m-pos)" : "var(--m-neg)");
        hop(p.a + p.b, p.b >= 0 ? 1 : -1, () => arrive(p.a + p.b));
      }, 420);
    });
  }

  function arrive(v: number): void {
    phase = "done";
    const p = PROBS[pi];
    const hit = guess === v;
    haptic(hit ? HAPTIC.correct : HAPTIC.tap);
    toast(hit ? "예측 명중!" : `도착: ${String(v).replace("-", "−")}`);
    expr.innerHTML = mfmt(`(${p.a >= 0 ? "+" + p.a : p.a})+(${p.b >= 0 ? "+" + p.b : p.b}) = (${v >= 0 ? "+" + v : v})`);
    helper.innerHTML = (hit ? "" : "예측과 달랐어도 괜찮아요, 눈으로 확인했으니까요. ") + p.note;
    goals.on(p.goal, `${v >= 0 ? "+" + v : String(v).replace("-", "−")}!`);
    if (pi + 1 < PROBS.length) {
      later(() => mount(pi + 1), 2400);
    } else {
      later(() => {
        helper.innerHTML =
          "산책 정리: 부호가 <b>같으면</b> 같은 방향, 절댓값의 <b>합</b>. 부호가 <b>다르면</b> 반대로 걷다, 절댓값의 <b>차</b>, 부호는 절댓값이 큰 쪽!";
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "정리하기");
      }, 1400);
    }
  }

  stage.addEventListener("pointerdown", (e) => {
    if (phase !== "predict") return;
    const r = stage.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * W; // svg 좌표
    let bestV = 0;
    let bd = 1e9;
    for (let t = LO; t <= HI; t++) {
      const d = Math.abs(X(t) - sx);
      if (d < bd) {
        bd = d;
        bestV = t;
      }
    }
    predict(bestV);
  });
  stage.addEventListener("keydown", (e) => {
    if (phase !== "predict") return;
    if (e.key === "ArrowLeft") kbGuess = Math.max(LO, kbGuess - 1);
    else if (e.key === "ArrowRight") kbGuess = Math.min(HI, kbGuess + 1);
    else if (e.key === "Enter") {
      predict(kbGuess);
      return;
    } else return;
    e.preventDefault();
    setFlag(kbGuess);
  });

  mount(0);
  api.setCTA("세 번 산책하면 열려요", { enabled: false });
  return () => {
    timers.forEach((t) => window.clearTimeout(t));
  };
};
