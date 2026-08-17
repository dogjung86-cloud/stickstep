// [중2 Ⅴ v3] L2 gasCrossLab — 「빛과 기체 교차 실험」(교과서 탐구 1).
// 한 통찰: 빛을 받은 식물은 이산화 탄소를 쓰고 산소를 내놓는다(끄면 곡선이 반대로 — L4 예고).
// 조작: 전등 토글 1개. 두 센서 그래프가 점점이 자란다(자가 예약 setTimeout — rAF·캔버스 없음).
// 목표 3: 빛 관찰 → 해석 판정(b4Ask) → 소등 역전 관찰.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { P3, p3Lettuce, p3LettuceDefs } from "../../../ui/plant3Kit";
import type { StepRenderer } from "../../types";

interface GxcStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 무대 — 투명 용기 + 상추 + 센서 2개 + 전등(점등은 CSS 상태 클래스 .lit). */
function jarScene(): string {
  return `<svg viewBox="0 0 340 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="gxcJar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/><stop offset="1" stop-color="#D8ECF5" stop-opacity="0.6"/>
      </linearGradient>
      ${p3LettuceDefs("gxc")}
    </defs>
    <ellipse cx="170" cy="178" rx="130" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <g class="gxc-lamp">
      <rect x="34" y="24" width="10" height="96" rx="4" fill="#8B95A1"/>
      <path d="M20 128 h38 v10 h-38 Z" fill="#6B7684"/>
      <path d="M44 24 q26 -8 40 10 l-12 16 q-16 -14 -28 -10 Z" fill="#C9CDD2" stroke="#6B7684" stroke-width="2.6"/>
      <circle class="gxc-bulb" cx="76" cy="42" r="9" fill="#FFE8A8" stroke="#D9A83C" stroke-width="2.4"/>
      <g class="gxc-rays" stroke="${P3.light}" stroke-width="3.4" stroke-linecap="round">
        <path d="M92 36 l22 -8 M94 48 l24 2 M90 58 l20 12"/>
      </g>
    </g>
    <g>
      <path d="M124 60 a46 26 0 0 1 92 0" fill="#EAF4FB" stroke="#9DB2C4" stroke-width="3"/>
      <rect x="124" y="58" width="92" height="102" rx="10" fill="url(#gxcJar)" stroke="#9DB2C4" stroke-width="3"/>
      <ellipse cx="170" cy="152" rx="30" ry="9" fill="#B08D5A"/>
      <path d="M148 152 h44 v8 a8 8 0 0 1 -8 8 h-28 a8 8 0 0 1 -8 -8 Z" fill="#C9885A" stroke="#8A5A30" stroke-width="2.4"/>
      ${p3Lettuce(170, 151, 0.62, "gxc")}
    </g>
    <g class="gxc-probe">
      <rect x="236" y="46" width="52" height="30" rx="7" fill="#FFFFFF" stroke="${P3.co2}" stroke-width="2.6"/>
      <circle cx="250" cy="61" r="5" fill="${P3.co2}"/>
      <path d="M236 61 h-22 q-10 0 -10 10 v18" stroke="${P3.co2}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <rect x="236" y="96" width="52" height="30" rx="7" fill="#FFFFFF" stroke="${P3.o2}" stroke-width="2.6"/>
      <circle cx="250" cy="111" r="5" fill="${P3.o2}"/>
      <path d="M236 111 h-14 q-8 0 -8 8 v10" stroke="${P3.o2}" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;
}

const GW = 150;
const GH = 96;
const PLOT_X0 = 30;
const PLOT_Y0 = 10;
const PLOT_W = 110;
const PLOT_H = 62;
const N_ON = 20;
const N_OFF = 14;

/** 미니 그래프 패널 — 제목 필 + 축(농도/시간) + polyline(점은 JS가 채운다). */
function graphPanel(id: string, label: string, color: string): HTMLElement {
  const box = el("div", { class: "gxc-graph" });
  box.innerHTML = `
    <div class="gxc-gtitle" style="--c:${color}">${label}</div>
    <svg viewBox="0 0 ${GW} ${GH}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <line x1="${PLOT_X0}" y1="${PLOT_Y0}" x2="${PLOT_X0}" y2="${PLOT_Y0 + PLOT_H}" stroke="#A9B6A9" stroke-width="2"/>
      <line x1="${PLOT_X0}" y1="${PLOT_Y0 + PLOT_H}" x2="${PLOT_X0 + PLOT_W + 4}" y2="${PLOT_Y0 + PLOT_H}" stroke="#A9B6A9" stroke-width="2"/>
      <text x="16" y="${PLOT_Y0 + 40}" font-size="9.5" font-weight="700" fill="#6B7684" transform="rotate(-90 16 ${PLOT_Y0 + 40})">농도</text>
      <text x="${PLOT_X0 + PLOT_W / 2}" y="${GH - 2}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#6B7684">시간</text>
      <polyline class="gxc-line" data-id="${id}" points="" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle class="gxc-head" data-id="${id}" r="3.4" fill="${color}" opacity="0"/>
    </svg>`;
  return box;
}

export const gasCrossLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as GxcStep;
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
    el("div", { class: "pn-badge p3", dataset: { g: "on" } }, el("b", { text: "빛 관찰" }), el("span", { text: "전등을 켜고" })),
    el("div", { class: "pn-badge p3", dataset: { g: "judge" } }, el("b", { text: "결과 해석" }), el("span", { text: "그래프 완성 뒤" })),
    el("div", { class: "pn-badge p3", dataset: { g: "off" } }, el("b", { text: "소등 실험" }), el("span", { text: "빛을 끄면?" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "투명 용기에 상추를 넣고 <b>이산화 탄소·산소 센서</b>를 꽂았어요. 아래 <b>전등 켜기</b> 버튼으로 빛을 비추고, 두 그래프를 지켜보세요.",
  });

  const stage = el("div", { class: "gxc-stage", html: jarScene() });
  const graphs = el("div", { class: "gxc-graphs" }, graphPanel("co2", "이산화 탄소 농도", P3.co2), graphPanel("o2", "산소 농도", P3.o2));
  const board = el("div", { class: "p3-board gxc-board" }, stage, graphs);

  const lampBtn = el("button", { class: "gxc-btn", text: "전등 켜기", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnRow = el("div", { class: "gxc-btnrow" }, lampBtn);
  const qBox = el("div", { class: "hook-choices gxc-q" });
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
        "정리! 빛을 받은 상추는 <b>이산화 탄소를 쓰고 산소를 내놓았어요</b>. 광합성의 증거 1호예요. 그리고 빛을 끄자 곡선이 <b>반대로</b> 뒤집혔죠? 어둠 속 식물의 비밀은 뒤 레슨에서 밝혀져요.";
      api.enableCTA(s.cta ?? "두 번째 증거 찾기");
    }
  }

  // 데이터 — 정성 그래프(수치 주장 없음). y는 플롯 안 픽셀로 직접 계산.
  const pts: Record<string, string[]> = { co2: [], o2: [] };
  let idx = 0;
  const yCo2 = (i: number, mode: "on" | "off"): number =>
    mode === "on" ? 12 + (i / N_ON) * 40 : 52 - (i / N_OFF) * 20;
  const yO2 = (i: number, mode: "on" | "off"): number =>
    mode === "on" ? 52 - (i / N_ON) * 40 : 12 + (i / N_OFF) * 20;
  function push(id: string, i: number, y: number): void {
    const x = PLOT_X0 + 4 + (i / (N_ON + N_OFF)) * (PLOT_W - 8);
    pts[id].push(`${x.toFixed(1)},${(PLOT_Y0 + y).toFixed(1)}`);
    const line = graphs.querySelector(`.gxc-line[data-id="${id}"]`) as SVGPolylineElement;
    line.setAttribute("points", pts[id].join(" "));
    const head = graphs.querySelector(`.gxc-head[data-id="${id}"]`) as SVGCircleElement;
    head.setAttribute("cx", x.toFixed(1));
    head.setAttribute("cy", (PLOT_Y0 + y).toFixed(1));
    head.setAttribute("opacity", "1");
  }

  let phase: "idle" | "on" | "ask" | "off" | "done" = "idle";
  let sub = 0;
  function tickOn(): void {
    if (phase !== "on") return;
    push("co2", idx, yCo2(sub, "on"));
    push("o2", idx, yO2(sub, "on"));
    idx += 1;
    sub += 1;
    if (sub > N_ON) {
      phase = "ask";
      collect("on", "10분 관찰!");
      helper.innerHTML = "10분이 지났어요. <b>이산화 탄소는 줄고, 산소는 늘었네요.</b> 이 결과를 어떻게 읽어야 할까요?";
      later(showAsk, 700);
      return;
    }
    later(tickOn, 170);
  }
  function tickOff(): void {
    if (phase !== "off") return;
    push("co2", idx, yCo2(sub, "off"));
    push("o2", idx, yO2(sub, "off"));
    idx += 1;
    sub += 1;
    if (sub > N_OFF) {
      phase = "done";
      collect("off", "곡선 역전!");
      return;
    }
    later(tickOff, 190);
  }

  let asked = false;
  function showAsk(): void {
    if (asked) return;
    asked = true;
    b4Ask(
      qBox,
      "빛을 비춘 10분 동안, 용기 속 상추는 무엇을 한 걸까요?",
      [
        { t: "이산화 탄소를 쓰고 산소를 내놓았다", ok: true },
        { t: "산소를 쓰고 이산화 탄소를 내놓았다", ok: false },
        { t: "용기가 새서 공기가 빠져나갔다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 줄어든 건 <b>이산화 탄소</b>(재료로 썼으니까), 늘어난 건 <b>산소</b>(산물로 내놓았으니까). 광합성이 일어났다는 증거죠. 이제 <b>전등을 꺼서</b> 빛이 없으면 어떻게 되는지 보세요."
          : "그래프의 방향을 다시 봐요. <b>이산화 탄소는 내려가고 산소는 올라갔어요</b>. 상추가 이산화 탄소를 쓰고 산소를 내놓은 것, 광합성의 증거랍니다. 이제 <b>전등을 꺼서</b> 빛이 없으면 어떻게 되는지 보세요.";
        lampBtn.disabled = false;
        lampBtn.textContent = "전등 끄기";
        collect("judge", ok ? "정확한 해석!" : "해석 완료");
      },
    );
  }

  lampBtn.addEventListener("click", () => {
    if (phase === "idle") {
      phase = "on";
      sub = 0;
      haptic(HAPTIC.tap);
      stage.classList.add("lit");
      lampBtn.disabled = true;
      helper.innerHTML = "전등을 켰어요! 두 그래프가 어떻게 갈라지는지 지켜보세요.";
      later(tickOn, 400);
    } else if (goals.has("judge") && phase === "ask") {
      phase = "off";
      sub = 0;
      haptic(HAPTIC.tap);
      stage.classList.remove("lit");
      lampBtn.disabled = true;
      helper.innerHTML = "전등을 껐어요. 어두워진 용기 속, 그래프의 방향을 보세요…";
      later(tickOff, 500);
    }
  });

  host.append(goalChips, helper, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("전등을 켜서 실험을 시작하세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
