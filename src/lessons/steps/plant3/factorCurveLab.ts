// [중2 Ⅴ v3] L3 factorCurveLab — 「조건 다이얼, 곡선을 내 손으로」.
// 한 통찰: 빛·이산화 탄소·온도 셋 다 '알맞을 때' 최대 — 빛·CO₂는 증가 후 일정(엽록체 수 한정),
// 온도만 알맞은 범위를 지나면 빠르게 감소한다(교과서 그림 V-3의 세 곡선을 스크럽으로 직접 완성).
// 조작: 요인 탭 3개 + 슬라이더 1개. 슬라이더를 끝까지 훑으면 곡선이 완성된다.
// rAF·캔버스 없음 — SVG polyline + input range. 타이머는 Set으로 cleanup.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import type { StepRenderer } from "../../types";

interface FctStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const PX0 = 44;
const PY0 = 16;
const PW = 250;
const PH = 128;

interface FactorDef {
  id: string;
  name: string;
  axis: string;
  color: string;
  hint: string;
  doneMsg: string;
  /** x∈[0,1] → 광합성량 y∈[0,1] */
  f: (x: number) => number;
}

const FACTORS: FactorDef[] = [
  {
    id: "light",
    name: "빛의 세기",
    axis: "빛의 세기",
    color: "#E8A80C",
    hint: "슬라이더로 <b>빛의 세기</b>를 0부터 끝까지 천천히 올려 보세요 — 광합성량이 어떻게 변하는지 곡선이 그려져요.",
    doneMsg: "빛이 셀수록 광합성량이 <b>증가하다가, 일정 세기 이상이 되면 더 늘지 않고 일정</b>해요. 세포 속 <b>엽록체의 수가 한정</b>돼 있어서, 빛만 더 준다고 무한정 일할 수는 없거든요.",
    f: (x) => Math.min(1, x / 0.52),
  },
  {
    id: "co2",
    name: "이산화 탄소",
    axis: "이산화 탄소의 농도",
    color: "#845EF7",
    hint: "이번엔 <b>이산화 탄소의 농도</b> 차례예요. 슬라이더를 끝까지 올리며 곡선을 그려 보세요.",
    doneMsg: "이산화 탄소도 마찬가지 — 농도가 높을수록 광합성량이 <b>증가하다가, 일정 농도 이상이면 일정</b>해져요. 재료만 쌓인다고 공장이 무한히 빨라지진 않죠.",
    f: (x) => Math.min(1, x / 0.55),
  },
  {
    id: "temp",
    name: "온도",
    axis: "온도",
    color: "#F03E3E",
    hint: "마지막 <b>온도</b>! 슬라이더를 끝까지 올려 보세요 — 앞의 두 곡선과 같을까요?",
    doneMsg: "온도는 달라요! 높아질수록 광합성량이 증가하다가, <b>알맞은 온도를 지나면 빠르게 감소</b>해요. 무조건 뜨겁다고 좋은 게 아니라 '알맞은 온도'가 있는 거죠.",
    f: (x) => (x <= 0.62 ? x / 0.62 : Math.max(0.06, 1 - (x - 0.62) * 4.4)),
  },
];

export const factorCurveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as FctStep;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge p3", dataset: { g: "light" } }, el("b", { text: "빛의 세기" }), el("span", { text: "곡선 그리기" })),
    el("div", { class: "pn-badge p3", dataset: { g: "co2" } }, el("b", { text: "이산화 탄소" }), el("span", { text: "대기 중" })),
    el("div", { class: "pn-badge p3", dataset: { g: "temp" } }, el("b", { text: "온도" }), el("span", { text: "대기 중" })),
  );
  const helper = el("div", { class: "helper", html: FACTORS[0].hint });

  // 그래프 무대
  const axisLabel = `<text class="fct-xlabel" x="${PX0 + PW / 2}" y="${PY0 + PH + 26}" text-anchor="middle" font-size="12" font-weight="700" fill="#6B7684">빛의 세기</text>`;
  const stage = el("div", { class: "fct-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="${PX0}" y1="${PY0 - 4}" x2="${PX0}" y2="${PY0 + PH}" stroke="#A9B6A9" stroke-width="2.4"/>
    <line x1="${PX0}" y1="${PY0 + PH}" x2="${PX0 + PW + 10}" y2="${PY0 + PH}" stroke="#A9B6A9" stroke-width="2.4"/>
    <path d="M${PX0} ${PY0 - 4} l-4 7 h8 Z M${PX0 + PW + 10} ${PY0 + PH} l-7 -4 v8 Z" fill="#A9B6A9"/>
    <text x="${PX0 - 8}" y="${PY0 + PH + 14}" text-anchor="middle" font-size="11" font-weight="700" fill="#6B7684">0</text>
    <text x="30" y="${PY0 + 54}" text-anchor="middle" font-size="12" font-weight="700" fill="#6B7684" transform="rotate(-90 30 ${PY0 + 54})">광합성량</text>
    ${axisLabel}
    <polyline class="fct-trail" points="" stroke="#E8A80C" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="fct-dot" r="6" fill="#E8A80C" stroke="#FFFFFF" stroke-width="2.4" opacity="0"/>
  </svg>`;
  const board = el("div", { class: "p3-board fct-board" }, stage);

  // 요인 탭 + 슬라이더
  const tabs = el("div", { class: "fct-tabs" });
  const tabBtns = FACTORS.map((fd, i) => {
    const b = el("button", { class: "fct-tab" + (i === 0 ? " cur" : ""), text: fd.name, attrs: { type: "button" } }) as HTMLButtonElement;
    b.disabled = i !== 0;
    b.addEventListener("click", () => selectTab(i));
    tabs.appendChild(b);
    return b;
  });
  const slider = el("input", {
    class: "fct-slider",
    attrs: { type: "range", min: "0", max: "100", step: "1", value: "0", "aria-label": "요인 값 조절" },
  }) as HTMLInputElement;

  const qBox = el("div", { class: "hook-choices fct-q" });
  qBox.style.display = "none";

  const goals = new Set<string>();
  let finished = false;
  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! <b>빛의 세기·이산화 탄소의 농도·온도</b>가 모두 알맞아야 광합성이 활발해요. 빛·이산화 탄소는 <b>늘다가 일정</b>, 온도만 <b>알맞은 범위를 지나면 뚝</b> — 세 곡선의 모양을 눈에 새겨 두세요.";
      api.enableCTA(s.cta ?? "환경요인 정리하기");
    }
  }

  let cur = 0;
  let maxP = 0;
  const trailPts: string[] = [];
  const trail = (): SVGPolylineElement => stage.querySelector(".fct-trail") as SVGPolylineElement;
  const dot = (): SVGCircleElement => stage.querySelector(".fct-dot") as SVGCircleElement;

  function plot(p: number): { x: number; y: number } {
    const fd = FACTORS[cur];
    return { x: PX0 + 6 + p * (PW - 12), y: PY0 + PH - 8 - fd.f(p) * (PH - 20) };
  }
  function selectTab(i: number): void {
    if (tabBtns[i].disabled || i === cur) return;
    cur = i;
    maxP = 0;
    trailPts.length = 0;
    tabBtns.forEach((b, k) => b.classList.toggle("cur", k === i));
    const fd = FACTORS[i];
    trail().setAttribute("points", "");
    trail().setAttribute("stroke", fd.color);
    dot().setAttribute("opacity", "0");
    dot().setAttribute("fill", fd.color);
    (stage.querySelector(".fct-xlabel") as SVGTextElement).textContent = fd.axis;
    slider.value = "0";
    slider.disabled = false;
    if (!finished) helper.innerHTML = fd.hint;
    haptic(HAPTIC.tap);
  }

  let curveDone = false;
  function onScrub(): void {
    const p = Number(slider.value) / 100;
    const { x, y } = plot(p);
    dot().setAttribute("cx", String(x));
    dot().setAttribute("cy", String(y));
    dot().setAttribute("opacity", "1");
    while (maxP < p - 0.001) {
      maxP = Math.min(p, maxP + 0.02);
      const q = plot(maxP);
      trailPts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`);
    }
    trail().setAttribute("points", trailPts.join(" "));
    if (maxP >= 0.985 && !curveDone) {
      curveDone = true;
      slider.disabled = true;
      const fd = FACTORS[cur];
      helper.innerHTML = fd.doneMsg;
      haptic(HAPTIC.correct);
      if (cur < 2) {
        collect(fd.id, "곡선 완성!");
        tabBtns[cur + 1].disabled = false;
        const next = cur + 1;
        later(() => {
          curveDone = false;
          selectTab(next);
        }, 2400);
      } else {
        later(showAsk, 1400);
      }
    }
  }
  slider.addEventListener("input", onScrub);

  let asked = false;
  function showAsk(): void {
    if (asked) return;
    asked = true;
    b4Ask(
      qBox,
      "세 곡선을 모두 그렸어요. <b>'지나치면 오히려 광합성량이 뚝 떨어지는'</b> 환경요인은 무엇이었나요?",
      [
        { t: "온도", ok: true },
        { t: "빛의 세기", ok: false },
        { t: "이산화 탄소의 농도", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "맞아요! 빛과 이산화 탄소는 지나쳐도 <b>일정</b>해질 뿐이지만, <b>온도</b>는 알맞은 범위를 지나면 광합성량이 <b>빠르게 감소</b>했죠. 그래서 한여름 온실은 오히려 환기로 온도를 낮춘답니다."
          : "방금 그린 곡선을 떠올려요 — 빛과 이산화 탄소 곡선은 끝에서 <b>평평</b>해졌지만, <b>온도</b> 곡선만 산봉우리처럼 <b>뚝 떨어졌어요</b>. 지나친 더위는 광합성의 적이랍니다.";
        collect("temp", "산봉우리 곡선!");
      },
    );
  }

  host.append(goalChips, helper, board, tabs, el("div", { class: "fct-sliderrow" }, slider), qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("슬라이더로 세 곡선을 완성하세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
