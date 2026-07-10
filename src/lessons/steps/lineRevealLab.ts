// lineRevealLab, 해 점등 랩(중2 수학 Ⅲ L9, 책 124~127쪽). 미지수가 2개인 일차방정식의
// 해 순서쌍을 격자에 찍고(중2 Ⅱ crossLab의 "점들이 한 줄로 늘어선다" 예고를 정확히 회수),
// x·y를 수 전체로 확장해 점들 사이가 메워지며 직선이 되는 순간을 목격한다.
// 국면 1(sol): x+y-3=0의 해가 되는 격자점을 3개 탭(대입 검산 토스트, 오답은 계산 공개).
// 국면 2(line): "x, y를 수 전체로!" 버튼 → 반정수 점이 촤르르 → 직선 스윕 →
//               이항 변신 카드(x+y-3=0 → y=-x+3, 기울기 -1·y절편 3 읽기).
// 국면 3(vert): 새 방정식 x=2, x좌표가 2인 점을 3개 탭 → 세로 직선(y축 평행) →
//               "이 직선도 함수일까?" 판정(x 하나에 y 무수히 → 함수 아님, 교과서 오개념 정면).
// 목표 칩 3: sol·line·vert. 탭 판정은 최근접 격자점(pointerdown). rAF 금지(CSS+타이머 Set).
// 스타일: math2.css .lrv-* 섹션. 참조: interceptLab(격자 탭·스윕), lineLab(점→직선 서사).
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips, planeSpec } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

export const lineRevealLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "sol", label: "해 수집", sub: "0/3" },
    { id: "line", label: "직선의 탄생", sub: "잠김" },
    { id: "vert", label: "세로 직선", sub: "잠김" },
  ]);

  const board = mboard(520);
  const eqCard = el("div", { class: "mdr-q lrv-eq" });
  const spec = planeSpec({ min: -5, max: 5, size: 340 });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="${spec.vb}" xmlns="http://www.w3.org/2000/svg" fill="none">${spec.grid}` +
    `<g class="lrv-dots"></g>` +
    `<g class="lrv-fill"></g>` +
    `<g class="lrv-line"></g>` +
    `<g class="lrv-flash"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  const morph = el("div", { class: "lrv-morph", attrs: { "aria-live": "polite" } });
  const qline = el("div", { class: "mq6-q m2u3q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(eqCard, svgWrap, actions, morph, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "이 방정식을 <b>참이 되게 하는 순서쌍 (x, y)</b>, 즉 해를 격자에서 찾아 탭! 예를 들어 x=1이면 y는?",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gDots = svg.querySelector(".lrv-dots") as SVGGElement;
  const gFill = svg.querySelector(".lrv-fill") as SVGGElement;
  const gLine = svg.querySelector(".lrv-line") as SVGGElement;
  const gFlash = svg.querySelector(".lrv-flash") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  type Phase = "sol" | "line" | "vert" | "done";
  let phase: Phase = "sol";
  const found = new Set<string>();
  const vertFound = new Set<number>();

  const pretty = (n: number): string => String(n).replace(/-/g, "−");

  function flashMiss(x: number, y: number): void {
    gFlash.innerHTML = `<circle cx="${spec.px(x)}" cy="${spec.py(y)}" r="8" fill="none" stroke="#F04452" stroke-width="2.2"/>`;
    later(() => (gFlash.innerHTML = ""), 550);
    haptic(HAPTIC.cross);
  }

  function dot(x: number, y: number, r: number, color: string, dark: string): string {
    return `<g class="cl-dot"><circle cx="${spec.px(x)}" cy="${spec.py(y)}" r="${r}" fill="${color}" stroke="${dark}" stroke-width="1.5"/></g>`;
  }

  svg.addEventListener("pointerdown", (e) => {
    if (phase !== "sol" && phase !== "vert") return;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * spec.size;
    const sy = ((e.clientY - rect.top) / rect.height) * spec.size;
    const x = Math.round(spec.vx(sx));
    const y = Math.round(spec.vy(sy));
    if (Math.abs(spec.px(x) - sx) > spec.unit * 0.85 || Math.abs(spec.py(y) - sy) > spec.unit * 0.85) return;
    haptic(HAPTIC.tap);
    if (phase === "sol") {
      if (x + y - 3 === 0) {
        const key = `${x},${y}`;
        if (found.has(key)) {
          toast("이미 찾은 해예요!");
          return;
        }
        found.add(key);
        haptic(HAPTIC.correct);
        gDots.innerHTML += dot(x, y, 5.4, "#0CA678", "#067D57");
        toast(`(${pretty(x)}, ${pretty(y)}) 대입: ${pretty(x)}+${pretty(y)}−3=0, 참! 해예요.`);
        const sub = chips.el.querySelector(`[data-g="sol"] span`) as HTMLElement;
        sub.textContent = `${found.size}/3`;
        if (found.size === 3) {
          chips.on("sol", "3개!");
          helper.innerHTML = "해가 벌써 3개, 그런데 점들이 <b>한 줄로</b> 서 있는 것 같지 않나요? x, y에 모든 수를 허락하면?";
          wholeBtn();
        }
      } else {
        flashMiss(x, y);
        toast(`(${pretty(x)}, ${pretty(y)}) 대입: ${pretty(x)}+${pretty(y)}−3=${pretty(x + y - 3)}, 0이 아니라 거짓!`);
      }
    } else if (phase === "vert") {
      if (x === 2) {
        if (vertFound.has(y)) {
          toast("이미 찍은 점!");
          return;
        }
        vertFound.add(y);
        haptic(HAPTIC.correct);
        gDots.innerHTML += dot(x, y, 5.4, "#E8A93E", "#9C5A10");
        toast(`(2, ${pretty(y)}): x가 2이기만 하면 y는 뭐든 OK!`);
        const sub = chips.el.querySelector(`[data-g="vert"] span`) as HTMLElement;
        sub.textContent = `점 ${vertFound.size}/3`;
        if (vertFound.size === 3) later(vertLine, 400);
      } else {
        flashMiss(x, y);
        toast(`x=2의 해는 x좌표가 2인 점! (${pretty(x)}, ${pretty(y)})는 x가 ${pretty(x)}이라 탈락.`);
      }
    }
  });

  function wholeBtn(): void {
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "x, y를 수 전체로!" })) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      phase = "line";
      // 반정수 점 촤르르(스태거) → 직선 스윕
      const halves: [number, number][] = [];
      for (let x = -2.5; x <= 5.01; x += 0.5) {
        if (Number.isInteger(x)) continue;
        halves.push([x, 3 - x]);
      }
      halves.forEach(([x, y], i) =>
        later(() => {
          gFill.innerHTML += dot(x, y, 2.8, "#4ECBA0", "#0A8F67");
        }, 70 * i),
      );
      later(() => {
        const t = 6;
        gLine.innerHTML = `<line class="lrv-sweep" x1="${spec.px(-t + 3)}" y1="${spec.py(t)}" x2="${spec.px(t)}" y2="${spec.py(3 - t)}" stroke="#0CA678" stroke-width="3.2" stroke-linecap="round"/>`;
        const line = gLine.querySelector("line") as SVGLineElement;
        const len = Math.hypot(spec.px(t) - spec.px(-t + 3), spec.py(3 - t) - spec.py(t));
        line.style.strokeDasharray = `${len}`;
        line.style.strokeDashoffset = `${len}`;
        void line.getBoundingClientRect();
        line.style.transition = "stroke-dashoffset .9s var(--ease-out)";
        line.style.strokeDashoffset = "0";
        haptic(HAPTIC.done);
        chips.on("line", "직선 완성!");
        toast("해 전체를 찍으면 직선! 이 직선이 방정식의 그래프예요.");
        later(showMorph, 1100);
      }, 70 * halves.length + 350);
      clear(actions);
    });
    actions.appendChild(b);
  }

  function showMorph(): void {
    morph.innerHTML =
      `<span class="lrv-m1">${mfmt("x+y-3=0")}</span>` +
      `<span class="lrv-arr" aria-hidden="true">→</span>` +
      `<span class="lrv-m2">${mfmt("y=-x+3")}</span>` +
      `<span class="lrv-tag">기울기 −1 · y절편 3</span>`;
    morph.classList.add("show");
    helper.innerHTML =
      "y를 x의 식으로 정리하면 <b>y=−x+3</b>, 낯익은 일차함수죠! 방정식의 그래프 = 일차함수의 그래프. " +
      "그럼 이런 방정식은 어떨까요: <b>x=2</b>?";
    later(startVert, 2400);
  }

  function startVert(): void {
    phase = "vert";
    eqCard.innerHTML = `<span class="mcl-k">새 방정식</span> ${mfmt("x=2")}`;
    const sub = chips.el.querySelector(`[data-g="vert"] span`) as HTMLElement;
    sub.textContent = "점 0/3";
    helper.innerHTML = "y가 안 보이지만 <b>x+0×y−2=0</b>인 셈이에요. 이 방정식의 해가 되는 점을 <b>3개</b> 탭!";
    toast("x좌표가 2이기만 하면 전부 해!");
  }

  function vertLine(): void {
    gLine.innerHTML += `<line class="lrv-vline" x1="${spec.px(2)}" y1="${spec.py(-6)}" x2="${spec.px(2)}" y2="${spec.py(6)}" stroke="#E8A93E" stroke-width="3.2" stroke-linecap="round" opacity="0"/>`;
    const vl = gLine.querySelector(".lrv-vline") as SVGLineElement;
    void vl.getBoundingClientRect();
    vl.style.transition = "opacity .5s ease";
    vl.style.opacity = "1";
    haptic(HAPTIC.done);
    toast("x=2의 그래프: 점 (2, 0)을 지나고 y축에 평행한 직선!");
    later(askVert, 1200);
  }

  function askVert(): void {
    qline.innerHTML = `직선이 된 ${mfmt("x=2")}. 그런데 이것도 y가 x의 <b>함수</b>일까요?`;
    const items = [
      {
        t: "함수예요: 그래프가 직선이니까요",
        good: false,
        fb: "직선이라고 다 함수는 아니에요! x=2 하나에 y가 0, 1, 2, … 무수히 대응하니 '하나씩'이 깨져요.",
      },
      {
        t: "함수가 아니에요: x가 2일 때 y가 무수히 많아요",
        good: true,
        fb: "정확해요! 함수의 조건 'x 하나에 y 하나'가 깨졌죠. 그래도 어엿한 직선, 그래서 '직선의 방정식'이라 불러요.",
      },
    ];
    const row = el("div", { class: "mq6-choices" });
    let done = false;
    const btns: { bt: HTMLButtonElement; good: boolean }[] = [];
    for (const it of items) {
      const bt = el("button", { class: "mq6-choice wide", text: it.t, attrs: { type: "button" } });
      bt.addEventListener("click", () => {
        if (done) return;
        done = true;
        haptic(it.good ? HAPTIC.correct : HAPTIC.wrong);
        for (const z of btns) {
          z.bt.disabled = true;
          if (z.good) z.bt.classList.add("ok");
        }
        if (!it.good) bt.classList.add("no");
        toast(it.fb);
        later(() => {
          qline.innerHTML = "";
          clear(ctl);
          chips.on("vert", "함수는 아님!");
          phase = "done";
          haptic(HAPTIC.done);
          helper.innerHTML =
            "오늘의 발견: 일차방정식의 해 전체 = <b>직선</b>, 그 직선은 (x=2 꼴만 빼면) 일차함수의 그래프와 같다! " +
            "방정식과 함수, 같은 직선의 두 이름이었어요.";
          api.recordQuiz(true);
          api.enableCTA(s.cta ?? "다음");
        }, 1900);
      });
      btns.push({ bt, good: !!it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
  }

  eqCard.innerHTML = `<span class="mcl-k">방정식</span> ${mfmt("x+y-3=0")} <span class="lrv-hint">해는 순서쌍 (x, y)!</span>`;
  api.setCTA("직선의 정체를 밝히면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
