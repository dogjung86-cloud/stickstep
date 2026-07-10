// lineLab, 직선 제조기(교과서 123~125쪽 정비례 그래프 함께 탐구 그대로).
//   ① y=2x 점 7개(x=−3..3)를 직접 찍는다 ② "간격 반으로"를 눌러 점이 촘촘해지는 것을 두 번 관찰
//   ③ "수 전체!"로 원점을 지나는 직선 완성(스윕) ④ a 스테퍼로 기울기·사분면·y축 근접을 탐험
// 직선은 원점 중심 회전(각도 = atan(a), 화면 y는 아래가 +라 부호 반전)으로 부드럽게 움직인다.
// 채점 아님(발견 랩), 전 목표 달성 시 recordQuiz(true)+enableCTA. rAF 금지(CSS+setTimeout).

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips, planeSpec } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LineStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const TARGETS: [number, number][] = [[-3, -6], [-2, -4], [-1, -2], [0, 0], [1, 2], [2, 4], [3, 6]];

export const lineLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LineStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "dots", label: "점 찍기", sub: "y=2x, 0/7" },
    { id: "line", label: "직선 완성", sub: "수 전체로" },
    { id: "steer", label: "a 조종", sub: "잠김" },
  ]);

  const board = mboard(500);
  const qCard = el("div", { class: "mdr-q mcl-q" });
  const spec = planeSpec({ min: -6, max: 6, size: 340, labelEvery: 2 });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="${spec.vb}" xmlns="http://www.w3.org/2000/svg" fill="none">${spec.grid}` +
    `<g class="ln-line" style="transform-origin:${spec.px(0)}px ${spec.py(0)}px; transition: transform .35s var(--ease-out); opacity:0">` +
    `<line x1="${spec.px(0) - 300}" y1="${spec.py(0)}" x2="${spec.px(0) + 300}" y2="${spec.py(0)}" stroke="#0DA5C6" stroke-width="3" stroke-linecap="round"/>` +
    `</g>` +
    `<g class="ln-dots"></g>` +
    `<g class="ln-one" style="opacity:0; transition: opacity .4s ease"></g>` +
    `<g class="ln-flash"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  board.append(qCard, svgWrap, actions);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "정비례 관계 <b>y=2x</b>를 만족하는 순서쌍부터 손으로 찍어 봐요. x가 −3이면 y는 2×(−3)=−6!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gDots = svg.querySelector(".ln-dots") as SVGGElement;
  const gLine = svg.querySelector(".ln-line") as SVGGElement;
  const gOne = svg.querySelector(".ln-one") as SVGGElement;
  const gFlash = svg.querySelector(".ln-flash") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phase: "dots" | "dense" | "steer" | "done" = "dots";
  let dotIdx = 0;
  let denseLevel = 0; // 0: 정수 7개, 1: 0.5 간격, 2: 0.25 간격
  let a = 2;
  let sawNeg = false;
  let sawSteep = false;

  const fmtA = (v: number): string => (v % 1 === 0 ? String(v) : v.toFixed(v * 4 % 2 === 0 ? 1 : 2));

  function dot(x: number, y: number, r = 4.6, cls = ""): string {
    return `<circle class="${cls}" cx="${spec.px(x)}" cy="${spec.py(y)}" r="${r}" fill="#E8608A" stroke="#B03A54" stroke-width="1.3"/>`;
  }

  function askDot(): void {
    const [x, y] = TARGETS[dotIdx];
    qCard.innerHTML = `<span class="mcl-k">점 ${dotIdx + 1}/7</span> ${mfmt(`(${x}, ${y})`)} 을(를) 찍어 보세요`;
  }

  svg.addEventListener("pointerdown", (e) => {
    if (phase !== "dots") return;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * spec.size;
    const sy = ((e.clientY - rect.top) / rect.height) * spec.size;
    const x = Math.round(spec.vx(sx));
    const y = Math.round(spec.vy(sy));
    if (Math.abs(spec.px(x) - sx) > spec.unit * 0.9 || Math.abs(spec.py(y) - sy) > spec.unit * 0.9) return;
    const [tx, ty] = TARGETS[dotIdx];
    if (x === tx && y === ty) {
      haptic(HAPTIC.correct);
      gDots.innerHTML += `<g class="cl-dot">${dot(tx, ty)}</g>`;
      dotIdx += 1;
      const chip = chips.el.querySelector(`[data-g="dots"] span`) as HTMLElement;
      chip.textContent = `y=2x, ${dotIdx}/7`;
      if (dotIdx < TARGETS.length) askDot();
      else {
        chips.on("dots", "7/7!");
        phase = "dense";
        qCard.innerHTML = `<span class="mcl-k">관찰</span> 점 7개가 한 줄로! 간격을 줄이면 어떻게 될까요?`;
        helper.innerHTML = "일곱 점이 벌써 <b>한 줄로 늘어선 것</b> 같죠? x의 간격을 반으로 줄여 점을 더 찍어 봐요.";
        denseBtn();
      }
    } else {
      haptic(HAPTIC.cross);
      gFlash.innerHTML = `<circle cx="${spec.px(x)}" cy="${spec.py(y)}" r="7" fill="none" stroke="#F04452" stroke-width="2.2"/>`;
      later(() => (gFlash.innerHTML = ""), 550);
      toast(`y=2x이니 x=${tx}일 때 y=2×${tx < 0 ? `(${tx})` : tx}=${ty}!`.replace(/-/g, "−"));
    }
  });

  function denseBtn(): void {
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "간격을 반으로" })) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      denseLevel += 1;
      const stepV = denseLevel === 1 ? 0.5 : 0.25;
      const pts: [number, number][] = [];
      for (let x = -3; x <= 3.001; x += stepV) {
        const q = Math.round(x * 4) / 4;
        if (denseLevel === 1 && q % 1 === 0) continue;
        if (denseLevel === 2 && (q * 2) % 1 === 0) continue;
        pts.push([q, 2 * q]);
      }
      pts.forEach(([x, y], i) => later(() => {
        gDots.innerHTML += `<g class="cl-dot">${dot(x, y, denseLevel === 1 ? 3.6 : 2.8)}</g>`;
        if (i === pts.length - 1) {
          if (denseLevel === 1) {
            helper.innerHTML = "점점 촘촘해져요! <b>한 번 더</b> 줄이면?";
            denseBtn();
          } else {
            helper.innerHTML = "이제 x에 <b>모든 수</b>(수 전체)를 허락하면 어떻게 될까요?";
            wholeBtn();
          }
        }
      }, 60 * i));
    });
    actions.appendChild(b);
    later(() => b.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function wholeBtn(): void {
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "x를 수 전체로!" })) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.done);
      // 직선 등장: a=2 각도로 회전해 두고 페이드+스윕
      gLine.style.transform = `rotate(${-Math.atan(2) * (180 / Math.PI)}deg)`;
      gLine.style.opacity = "1";
      gDots.style.transition = "opacity .8s ease";
      gDots.style.opacity = "0.25";
      chips.on("line", "원점 직선!");
      qCard.innerHTML = `<span class="mcl-k">완성</span> ${mfmt("y=2x")} 의 그래프: <b>원점을 지나는 직선</b>`;
      helper.innerHTML = "점 전체가 <b>원점을 지나는 직선</b>이 됐어요! 그런데 2 대신 다른 수 a를 넣으면 직선이 어떻게 변할까요?";
      later(steerUi, 1200);
    });
    actions.appendChild(b);
    later(() => b.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /* ── a 조종 국면 ── */
  function paintSteer(): void {
    gLine.style.transform = `rotate(${-Math.atan(a) * (180 / Math.PI)}deg)`;
    qCard.innerHTML =
      `<span class="mcl-k">a 조종</span> ` +
      mfmt(`y=${fmtA(a)}x`) +
      ` <span class="ln-quad ${a > 0 ? "pos" : "neg"}">${a > 0 ? "제1·3사분면" : "제2·4사분면"}</span>`;
    // (1, a) 강조점
    gOne.innerHTML =
      `<line x1="${spec.px(1)}" y1="${spec.py(0)}" x2="${spec.px(1)}" y2="${spec.py(a)}" stroke="#8A6EE0" stroke-width="1.6" stroke-dasharray="4 4"/>` +
      `<circle cx="${spec.px(1)}" cy="${spec.py(a)}" r="5" fill="#8A6EE0" stroke="#6A55F2" stroke-width="1.4"/>` +
      `<text x="${spec.px(1) + 8}" y="${spec.py(a) + (a > 0 ? -8 : 16)}" font-size="11.5" font-weight="800" fill="#6A55F2">(1, ${fmtA(a).replace("-", "−")})</text>`;
    gOne.style.opacity = "1";
    const sub = chips.el.querySelector(`[data-g="steer"] span`) as HTMLElement;
    if (!chips.has("steer")) sub.textContent = `${sawNeg ? "음수 확인" : "a<0 만들기"}${sawSteep ? " · 절벽 확인" : ""}`;
  }

  function steerUi(): void {
    clear(actions);
    const minus = el("button", { class: "ct-btn", attrs: { type: "button", "aria-label": "a 줄이기" } }, el("span", { text: "−" })) as HTMLButtonElement;
    const plus = el("button", { class: "ct-btn", attrs: { type: "button", "aria-label": "a 키우기" } }, el("span", { text: "+" })) as HTMLButtonElement;
    const read = el("span", { class: "ln-aread", html: `a = <b>2</b>` });
    const stepA = (d: number): void => {
      let next = Math.round((a + d) * 2) / 2;
      if (next === 0) next = d > 0 ? 0.5 : -0.5; // a≠0
      next = Math.max(-3, Math.min(3, next));
      if (next === a) return;
      a = next;
      haptic(HAPTIC.tap);
      read.innerHTML = `a = <b>${fmtA(a).replace("-", "−")}</b>`;
      paintSteer();
      if (a < 0 && !sawNeg) {
        sawNeg = true;
        toast("a가 음수면 직선이 반대로 기울어요, 제2·4사분면!");
      }
      if (Math.abs(a) === 3 && !sawSteep) {
        sawSteep = true;
        toast("a의 절댓값이 클수록 y축에 바짝 붙어요!");
      }
      if (sawNeg && sawSteep && !chips.has("steer")) {
        chips.on("steer", "정복!");
        helper.innerHTML =
          "조종 완료! <b>a>0이면 1·3사분면, a<0이면 2·4사분면.</b> 그리고 a의 절댓값이 클수록 직선이 y축에 가까워져요. 어느 a든 <b>(1, a)를 지나는 원점 직선</b>이라는 건 변하지 않고요!";
        haptic(HAPTIC.done);
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "다음");
      }
    };
    minus.addEventListener("click", () => stepA(-0.5));
    plus.addEventListener("click", () => stepA(0.5));
    actions.append(minus, read, plus);
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    helper.innerHTML = "−와 +로 <b>a를 조종</b>해 보세요. 미션: ① a를 음수로 ② 절댓값을 3까지!";
    paintSteer();
  }

  askDot();
  api.setCTA("직선을 완성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
