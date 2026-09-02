// [중1 Ⅲ v3] L1 particleDialLab — 「입자 다이얼, 온도의 정체」.
// 한 통찰: 온도는 입자 운동의 활발한 정도. 가열하면 입자가 활발해지고 입자 사이가 멀어지며 온도가 오른다.
// 조작: 온도 슬라이더 1개(냉각 ↔ 가열). 비커 속 입자 20개가 온도에 따라 흔들림·간격·색을 바꾼다.
// 목표 3: 가열 관찰(80℃ 이상) → 냉각 관찰(10℃ 이하) → 판정(b4Ask).
// rAF·캔버스 없음 — 입자 흔들림은 자가 예약 setTimeout(80ms), 시드 고정 난수(눈검수 안정).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { H3, tempColor, particleGrid, seededRandom, thermoSvg, flameSvg, burnerSvg, beakerSvg } from "../../../ui/heat3Kit";
import type { StepRenderer } from "../../types";
import { h3AskBox, h3Goals, h3Helper, h3Timers } from "./h3Lab";

interface PdlStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const COLS = 5;
const ROWS = 4;
const CX = 146;
const CY = 118;

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
      helper.innerHTML =
        "정리! <b>온도는 물체를 구성하는 입자의 운동이 활발한 정도</b>예요. 가열하면 입자가 <b>활발</b>해지고 입자 사이의 거리가 <b>멀어지며</b> 온도가 오르고, 냉각하면 반대예요. 그리고 아무리 차가워도 입자는 <b>멈추지 않아요</b>.";
      api.enableCTA(s.cta ?? "온도 정리하기");
    },
  );
  const helper = h3Helper("물이 든 비커를 <b>입자의 눈</b>으로 보고 있어요. 아래 슬라이더를 오른쪽 끝까지 밀어 <b>80℃ 이상으로 가열</b>해 보세요.");

  const stage = el("div", { class: "pdl-stage" });
  const particles = particleGrid(COLS, ROWS, CX, CY, 24);
  stage.innerHTML = `
  <svg viewBox="0 0 340 236" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="146" cy="226" rx="120" ry="7" fill="#2A3A5E" opacity="0.10"/>
    <g class="pdl-snow">
      <path d="M40 40 l6 6 M52 34 l0 8 M64 40 l-6 6 M246 56 l6 6 M258 50 l0 8 M270 56 l-6 6" stroke="#74B9F0" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    ${beakerSvg(66, 36, 160, 160, H3.water, "pdl", 0.82)}
    <g class="pdl-parts">
      ${particles.map((p, i) => `<circle class="pdl-p" data-i="${i}" cx="${p.x}" cy="${p.y}" r="7" fill="${tempColor(0.25)}" stroke="#FFFFFF" stroke-width="1.6"/>`).join("")}
    </g>
    ${flameSvg(146, 216, 1, "pdl")}
    ${burnerSvg(146, 216, 90)}
    ${thermoSvg(284, 40, 130, "pdl")}
    <text class="pdl-read" x="291" y="232" text-anchor="middle" font-size="13" font-weight="800" fill="${H3.ink}">25℃</text>
  </svg>`;
  const board = el("div", { class: "ht3-board pdl-board" }, stage);

  const slider = el("input", {
    class: "ht3-slider pdl-slider",
    attrs: { type: "range", min: "0", max: "100", step: "1", value: "25", "aria-label": "물의 온도" },
  }) as HTMLInputElement;
  const sliderRow = el(
    "div",
    { class: "ht3-sliderrow" },
    el("div", { class: "ht3-sliderlabels" }, el("span", { text: "냉각" }), el("span", { class: "pdl-temp", text: "25℃" }), el("span", { text: "가열" })),
    slider,
  );
  const qBox = h3AskBox("pdl-q");

  const parts = Array.from(stage.querySelectorAll<SVGCircleElement>(".pdl-p"));
  const merc = stage.querySelector(".pdl-merc") as SVGRectElement;
  const read = stage.querySelector(".pdl-read") as SVGTextElement;
  const flame = stage.querySelector(".pdl-flame") as SVGGElement;
  const snow = stage.querySelector(".pdl-snow") as SVGGElement;
  const liq = stage.querySelector(".pdl-liq") as SVGRectElement;
  const tempLabel = sliderRow.querySelector(".pdl-temp") as HTMLElement;

  let temp = 25;
  function applyTemp(): void {
    const p = temp / 100;
    merc.style.transform = `scaleY(${(0.08 + 0.9 * p).toFixed(3)})`;
    read.textContent = `${temp}℃`;
    tempLabel.textContent = `${temp}℃`;
    flame.style.opacity = String(Math.max(0, (temp - 35) / 65));
    flame.style.transform = `scaleY(${(0.6 + 0.5 * p).toFixed(2)})`;
    snow.style.opacity = String(Math.max(0, (18 - temp) / 18));
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
      b4Ask(
        qBox,
        "온도가 <b>높은</b> 물의 입자는 온도가 낮은 물의 입자와 어떻게 달랐나요?",
        [
          { t: "더 활발하게 움직이고, 입자 사이도 멀어졌다", ok: true },
          { t: "거의 멈춰 있었다", ok: false },
          { t: "입자의 개수가 더 많아졌다", ok: false },
        ],
        (ok) => {
          api.recordQuiz(ok);
          helper.innerHTML = ok
            ? "정확해요! 온도가 높을수록 입자가 <b>활발하게</b> 움직이고 입자 사이의 <b>거리가 멀어져요</b>. 온도는 바로 이 활발한 정도를 나타내는 값이랍니다."
            : "다시 떠올려요. 가열할수록 입자는 멈추기는커녕 <b>더 활발하게</b> 움직였고, 입자 사이의 <b>거리가 멀어졌죠</b>. 개수는 그대로였고요. 온도는 입자 운동의 활발한 정도예요.";
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
      helper.innerHTML = "80℃! 입자들이 <b>활발하게</b> 흔들리고 <b>서로 멀어졌어요</b>. 이번엔 슬라이더를 왼쪽 끝으로 밀어 <b>10℃ 아래로 냉각</b>해 보세요.";
    }
    if (temp <= 10 && !goals.has("cold")) {
      if (!goals.has("hot")) {
        helper.innerHTML = "차가워졌네요. 먼저 오른쪽 끝까지 밀어 <b>80℃ 이상으로 가열</b>부터 해 봐요. 그다음 다시 냉각!";
        return;
      }
      goals.collect("cold", "둔해져요");
      haptic(HAPTIC.correct);
      helper.innerHTML = "10℃. 입자 운동이 <b>둔해지고</b> 입자 사이가 <b>가까워졌어요</b>. 그래도 완전히 멈추지는 않죠?";
      maybeAsk();
    }
  });

  host.append(goals.chips, helper, board, sliderRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  applyTemp();
  jitter();
  api.setCTA("슬라이더로 가열과 냉각을 해 보세요", { enabled: false });
  return () => tm.clear();
};
