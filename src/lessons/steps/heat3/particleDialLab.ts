// [중1 Ⅲ v3] L1 particleDialLab — 「입자 다이얼」(온도의 정체).
// 한 통찰: 온도는 입자 운동의 활발한 정도. 가열하면 입자가 활발해지고 입자 사이가 멀어지며 온도가 오른다.
// 조작: 온도 슬라이더 1개(냉각 ↔ 가열, 슬롯 안). 비커 속 입자 12개가 온도에 따라 흔들림·간격·색을 바꾼다.
// 한 화면 예산: 무대 340×180(비커·입자·불꽃·온도계만, 서리 표시·그림자 제거), 판정은 슬라이더 자리에 교체.
// 목표 3: 가열 관찰(80℃ 이상) → 냉각 관찰(10℃ 이하) → 판정(b4Ask).
// rAF·캔버스 없음 — 입자 흔들림은 자가 예약 setTimeout(80ms), 시드 고정 난수(눈검수 안정).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { H3, tempColor, particleGrid, seededRandom, thermoSvg, flameSvg, burnerSvg, beakerSvg } from "../../../ui/heat3Kit";
import type { StepRenderer } from "../../types";
import { h3Goals, h3Helper, h3Slot, h3Timers } from "./h3Lab";

interface PdlStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const COLS = 4;
const ROWS = 3;
const CX = 135;
const CY = 100;

export const particleDialLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PdlStep;
  const tm = h3Timers();
  const rnd = seededRandom(31);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = h3Goals(
    [
      { id: "hot", name: "가열", sub: "80℃까지" },
      { id: "cold", name: "냉각", sub: "10℃까지" },
      { id: "judge", name: "판정", sub: "둘 다 본 뒤" },
    ],
    () => {
      helper.innerHTML = "정리! 온도는 <b>입자 운동이 활발한 정도</b>예요. 아무리 차가워도 입자는 멈추지 않아요.";
      api.enableCTA(s.cta ?? "온도 정리하기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = h3Helper("비커 속 물을 입자의 눈으로 봐요. 슬라이더를 오른쪽 끝까지 밀어 <b>80℃ 이상</b>으로 가열해요.");

  const stage = el("div", { class: "pdi-stage" });
  const particles = particleGrid(COLS, ROWS, CX, CY, 24);
  stage.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${beakerSvg(60, 16, 150, 130, H3.water, "pdi", 0.82)}
    <g class="pdi-parts">
      ${particles.map((p, i) => `<circle class="pdi-p" data-i="${i}" cx="${p.x}" cy="${p.y}" r="7" fill="${tempColor(0.25)}" stroke="#FFFFFF" stroke-width="1.6"/>`).join("")}
    </g>
    ${flameSvg(135, 156, 0.9, "pdi")}
    ${burnerSvg(135, 156, 80)}
    ${thermoSvg(268, 14, 100, "pdi")}
    <text class="pdi-read" x="275" y="152" text-anchor="middle" font-size="13" font-weight="800" fill="${H3.ink}">25℃</text>
  </svg>`;
  const board = el("div", { class: "ht3-board pdi-board" }, stage);

  const slider = el("input", {
    class: "ht3-slider pdi-slider",
    attrs: { type: "range", min: "0", max: "100", step: "1", value: "25", "aria-label": "물의 온도" },
  }) as HTMLInputElement;
  const sliderRow = el(
    "div",
    { class: "ht3-sliderrow" },
    el("div", { class: "ht3-sliderlabels" }, el("span", { text: "냉각" }), el("span", { class: "pdi-temp", text: "25℃" }), el("span", { text: "가열" })),
    slider,
  );
  const slot = h3Slot(tm, "pdi-q", sliderRow);

  const parts = Array.from(stage.querySelectorAll<SVGCircleElement>(".pdi-p"));
  const merc = stage.querySelector(".pdi-merc") as SVGRectElement;
  const read = stage.querySelector(".pdi-read") as SVGTextElement;
  const flame = stage.querySelector(".pdi-flame") as SVGGElement;
  const liq = stage.querySelector(".pdi-liq") as SVGRectElement;
  const tempLabel = sliderRow.querySelector(".pdi-temp") as HTMLElement;

  let temp = 25;
  function applyTemp(): void {
    const p = temp / 100;
    merc.style.transform = `scaleY(${(0.08 + 0.9 * p).toFixed(3)})`;
    read.textContent = `${temp}℃`;
    tempLabel.textContent = `${temp}℃`;
    flame.style.opacity = String(Math.max(0, (temp - 35) / 65));
    flame.style.transform = `scaleY(${(0.6 + 0.5 * p).toFixed(2)})`;
    liq.setAttribute("fill", tempColor(0.15 + 0.6 * p));
    const col = tempColor(0.1 + 0.85 * p);
    for (const c of parts) c.setAttribute("fill", col);
  }

  // 입자 흔들림 루프 — 온도가 높을수록 진폭·간격이 커진다(자가 예약 setTimeout).
  function jitter(): void {
    if (!tm.alive()) return;
    const p = temp / 100;
    const gap = 22 + 9 * p;
    const amp = 0.6 + 7.5 * Math.pow(p, 1.15);
    const base = particleGrid(COLS, ROWS, CX, CY + 6 - 6 * p, gap);
    parts.forEach((c, i) => {
      const b = base[i];
      c.setAttribute("cx", (b.x + (rnd() - 0.5) * 2 * amp).toFixed(1));
      c.setAttribute("cy", (b.y + (rnd() - 0.5) * 2 * amp).toFixed(1));
    });
    tm.later(jitter, 80);
  }

  let asked = false;
  function maybeAsk(): void {
    if (asked || !goals.has("hot") || !goals.has("cold")) return;
    asked = true;
    helper.innerHTML = "가열도 냉각도 해 봤어요. 눈으로 본 것을 정리해 볼까요?";
    tm.later(() => {
      slot.ask(
        "온도가 <b>높은</b> 물의 입자는 낮은 물의 입자와 어떻게 달랐나요?",
        [
          { t: "더 활발하게 움직이고 사이도 멀어졌다", ok: true },
          { t: "거의 멈춰 있었다", ok: false },
          { t: "입자의 개수가 더 많아졌다", ok: false },
        ],
        (ok) => {
          api.recordQuiz(ok);
          helper.innerHTML = ok
            ? "정확해요! 온도가 높을수록 입자가 <b>활발</b>하고 사이가 <b>멀어요</b>. 온도는 이 활발한 정도예요."
            : "가열할수록 입자는 <b>더 활발</b>해지고 사이가 <b>멀어졌죠</b>. 개수는 그대로였고요.";
          goals.collect("judge", ok ? "정확한 판정!" : "판정 완료");
        },
      );
    }, 500);
  }

  slider.addEventListener("input", () => {
    temp = Number(slider.value);
    applyTemp();
    if (temp >= 80 && !goals.has("hot")) {
      goals.collect("hot", "활발해요!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "80℃! 입자가 <b>활발하게</b> 흔들리고 <b>서로 멀어졌어요</b>. 이번엔 왼쪽 끝으로 밀어 <b>10℃ 아래</b>로 냉각해요.";
    }
    if (temp <= 10 && !goals.has("cold")) {
      if (!goals.has("hot")) {
        helper.innerHTML = "차가워졌네요. 먼저 오른쪽 끝까지 밀어 <b>80℃ 이상</b>으로 가열부터 해 봐요.";
        return;
      }
      goals.collect("cold", "둔해져요");
      haptic(HAPTIC.correct);
      helper.innerHTML = "10℃. 입자 운동이 <b>둔해지고</b> 사이가 <b>가까워졌어요</b>. 그래도 완전히 멈추진 않죠?";
      maybeAsk();
    }
  });

  host.append(goals.chips, helper, board, slot.el);

  applyTemp();
  jitter();
  api.setCTA("슬라이더로 가열과 냉각을 해 보세요", { enabled: false });
  return () => tm.clear();
};
