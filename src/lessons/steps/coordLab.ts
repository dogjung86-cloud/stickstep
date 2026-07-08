// coordLab, 좌표 명중(교과서 106~108쪽 순서쌍과 좌표). 두 국면:
//   A 읽기: 좌표평면 위 점을 보고 좌표 선택지 중 정답 탭(2문항)
//   B 찍기: 순서쌍 카드를 보고 격자 교점을 직접 탭(4문항 — (4,2)→(2,4) 순서 함정, (0,−3) 축 위)
// 채점 아님(발견 랩), 전 목표 달성 시 recordQuiz(true)+enableCTA.
// 모션은 전부 CSS transition + setTimeout(타이머 Set으로 모아 cleanup 해제). rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips, planeSpec } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface CoordStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface ReadRound {
  x: number;
  y: number;
  options: [number, number][]; // [0]이 정답
  hint: string;
}

interface PlotRound {
  x: number;
  y: number;
  note?: string; // 명중 시 한 줄(축 위 등)
  hint: string; // 오답 시 힌트
}

const READS: ReadRound[] = [
  {
    x: 3,
    y: 2,
    options: [[3, 2], [2, 3], [-3, 2], [3, -2]],
    hint: "x좌표(가로) 먼저, y좌표(세로) 나중이에요. 오른쪽으로 3, 위로 2!",
  },
  {
    x: -4,
    y: -2,
    options: [[-4, -2], [-2, -4], [4, -2], [-4, 2]],
    hint: "왼쪽으로 4칸이면 x좌표는 −4, 아래로 2칸이면 y좌표는 −2예요.",
  },
];

const PLOTS: PlotRound[] = [
  { x: 4, y: 2, hint: "괄호의 첫 수 4는 x좌표, 오른쪽으로 4칸부터!" },
  { x: 2, y: 4, note: "(4, 2)와 (2, 4), 숫자는 같아도 위치는 완전히 달라요!", hint: "아까와 반대로, 이번엔 오른쪽 2칸, 위로 4칸이에요." },
  { x: -3, y: 1, hint: "x좌표가 −3이니 왼쪽으로 3칸이에요." },
  { x: 0, y: -3, note: "x좌표가 0이면 점은 y축 위에 있어요!", hint: "x좌표 0은 좌우로 0칸, y축에서 아래로 3칸이에요." },
];

export const coordLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CoordStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "read", label: "좌표 읽기", sub: "0/2" },
    { id: "plot", label: "점 찍기", sub: "0/4" },
    { id: "swap", label: "순서의 힘", sub: "(4,2)≠(2,4)" },
  ]);

  const board = mboard(470);
  const qCard = el("div", { class: "mdr-q mcl-q" });
  const spec = planeSpec({ min: -5, max: 5, size: 340 });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML = `<svg viewBox="${spec.vb}" xmlns="http://www.w3.org/2000/svg" fill="none">${spec.grid}<g class="cl-guide"></g><g class="cl-pts"></g><g class="cl-flash"></g><rect class="cl-hit" x="0" y="0" width="${spec.size}" height="${spec.size}" fill="transparent"/></svg>`;
  const optRow = el("div", { class: "mcl-opts" });
  board.append(qCard, svgWrap, optRow);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper", html: "점이 깜빡이고 있어요. 이 점의 좌표를 아래에서 골라 보세요!" });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gGuide = svg.querySelector(".cl-guide") as SVGGElement;
  const gPts = svg.querySelector(".cl-pts") as SVGGElement;
  const gFlash = svg.querySelector(".cl-flash") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phase: "read" | "plot" | "done" = "read";
  let readIdx = 0;
  let plotIdx = 0;
  let readOk = 0;
  let plotOk = 0;
  let locking = false;

  const fmtPair = (x: number, y: number): string => mfmt(`(${x}, ${y})`);

  /** 점 + 좌표 라벨을 심는다(planted: 유지되는 점). */
  function plant(x: number, y: number, cls = "planted", withLabel = true): SVGGElement {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", `cl-dot ${cls}`);
    const cx = spec.px(x);
    const cy = spec.py(y);
    const above = cy > 30;
    g.innerHTML =
      `<circle cx="${cx}" cy="${cy}" r="6" fill="#0DA5C6" stroke="#077E9C" stroke-width="1.6"/>` +
      (withLabel
        ? `<text x="${cx}" y="${above ? cy - 11 : cy + 20}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#077E9C">(${String(x).replace("-", "−")}, ${String(y).replace("-", "−")})</text>`
        : "");
    gPts.appendChild(g);
    return g;
  }

  /** 축까지의 점선 가이드(현재 점 전용, 다음 문제에서 교체). */
  function guides(x: number, y: number): void {
    const cx = spec.px(x);
    const cy = spec.py(y);
    gGuide.innerHTML =
      `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${spec.py(0)}" stroke="#F08C2E" stroke-width="1.6" stroke-dasharray="4 4" opacity=".85"/>` +
      `<line x1="${cx}" y1="${cy}" x2="${spec.px(0)}" y2="${cy}" stroke="#8A6EE0" stroke-width="1.6" stroke-dasharray="4 4" opacity=".85"/>`;
  }

  /* ── A 읽기 국면 ── */
  function askRead(): void {
    const r = READS[readIdx];
    qCard.innerHTML = `<span class="mcl-k">읽기 ${readIdx + 1}/2</span> 깜빡이는 점의 좌표는?`;
    gPts.innerHTML = "";
    gGuide.innerHTML = "";
    const g = plant(r.x, r.y, "pulse", false);
    g.classList.add("cl-pulse");
    clear(optRow);
    // 표시 순서 셔플(정답 위치 고정 방지)
    const order = r.options.map((_, i) => i).sort(() => Math.random() - 0.5);
    for (const i of order) {
      const [ox, oy] = r.options[i];
      const b = el("button", { class: "mcl-opt", html: fmtPair(ox, oy), attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (locking || phase !== "read") return;
        if (i === 0) {
          locking = true;
          haptic(HAPTIC.correct);
          b.classList.add("ok");
          guides(r.x, r.y);
          readOk += 1;
          const chip = chips.el.querySelector(`[data-g="read"] span`) as HTMLElement;
          chip.textContent = `${readOk}/2`;
          toast(`가로 ${r.x}, 세로 ${r.y}, 정확해요!`);
          later(() => {
            locking = false;
            readIdx += 1;
            if (readIdx < READS.length) askRead();
            else {
              chips.on("read", "완료!");
              startPlot();
            }
          }, 1250);
        } else {
          haptic(HAPTIC.cross);
          b.classList.add("no");
          toast(r.hint);
          later(() => b.classList.remove("no"), 700);
        }
      });
      optRow.appendChild(b);
    }
  }

  /* ── B 찍기 국면 ── */
  function startPlot(): void {
    phase = "plot";
    helper.innerHTML = "이번엔 반대로! 카드의 순서쌍을 보고 <b>격자의 교점을 직접 탭</b>해서 점을 찍어요.";
    gPts.innerHTML = "";
    gGuide.innerHTML = "";
    clear(optRow);
    askPlot();
  }

  function askPlot(): void {
    const r = PLOTS[plotIdx];
    qCard.innerHTML = `<span class="mcl-k">찍기 ${plotIdx + 1}/4</span> ${mfmt(`(${r.x}, ${r.y})`)} 을(를) 찍어 보세요`;
  }

  function flashMiss(x: number, y: number): void {
    const cx = spec.px(x);
    const cy = spec.py(y);
    gFlash.innerHTML = `<circle cx="${cx}" cy="${cy}" r="7" fill="none" stroke="#F04452" stroke-width="2.2" opacity=".9"/>`;
    later(() => (gFlash.innerHTML = ""), 620);
  }

  svg.addEventListener("pointerdown", (e) => {
    if (phase !== "plot" || locking) return;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * spec.size;
    const sy = ((e.clientY - rect.top) / rect.height) * spec.size;
    const x = Math.round(spec.vx(sx));
    const y = Math.round(spec.vy(sy));
    if (x < spec.min || x > spec.max || y < spec.min || y > spec.max) return;
    // 탭 위치가 교점에서 너무 멀면 무시(격자 반 칸 이상)
    if (Math.abs(spec.px(x) - sx) > spec.unit * 0.5 || Math.abs(spec.py(y) - sy) > spec.unit * 0.5) return;
    const r = PLOTS[plotIdx];
    if (x === r.x && y === r.y) {
      locking = true;
      haptic(HAPTIC.correct);
      plant(x, y);
      guides(x, y);
      plotOk += 1;
      const chip = chips.el.querySelector(`[data-g="plot"] span`) as HTMLElement;
      chip.textContent = `${plotOk}/4`;
      if (r.note) toast(r.note);
      else toast("명중!");
      // (2,4)를 심는 순간 순서 함정 목표 달성 + 두 점 비교 강조
      if (plotIdx === 1) {
        chips.on("swap", "발견!");
        const a = { x: 4, y: 2 };
        gGuide.innerHTML += `<line x1="${spec.px(a.x)}" y1="${spec.py(a.y)}" x2="${spec.px(r.x)}" y2="${spec.py(r.y)}" stroke="#F2789A" stroke-width="1.6" stroke-dasharray="3 5"/>`;
        helper.innerHTML = "보이나요? <b>(4, 2)와 (2, 4)는 서로 다른 점</b>이에요. 순서쌍은 순서가 생명!";
      }
      later(() => {
        locking = false;
        plotIdx += 1;
        gGuide.innerHTML = "";
        if (plotIdx < PLOTS.length) askPlot();
        else finishLab();
      }, r.note ? 1900 : 1050);
    } else {
      haptic(HAPTIC.cross);
      flashMiss(x, y);
      toast(r.hint);
    }
  });

  function finishLab(): void {
    phase = "done";
    chips.on("plot", "4/4!");
    qCard.innerHTML = `<span class="mcl-k">완료</span> 순서쌍 (x좌표, y좌표), 이제 평면의 어떤 점도 콕!`;
    helper.innerHTML = "읽기도 찍기도 완벽해요. <b>x좌표 먼저, y좌표 나중</b>, 이 순서만 기억하면 평면 전체가 내 것이에요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  askRead();
  api.setCTA("점을 모두 찍으면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
