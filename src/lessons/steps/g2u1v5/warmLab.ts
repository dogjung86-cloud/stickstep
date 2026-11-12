// [중2 Ⅰ v5] g2u1l3 데우기 랩: 「데우면 남은 질산 칼륨은 어떻게 될까요?」
// 책의 탐구 2를 손으로 한다: 실온의 물 10 g에 질산 칼륨 6 g을 넣으면 다 녹지 않는다. 병을 따뜻한 물에 담그면 변화가 나타난다.
// 학생이 정하는 것: 병을 담근 물의 온도. 온도를 밀면 병 속의 남은 양과 용해도 곡선 위의 점이 함께 움직인다.
// 통찰 하나: 고체의 용해도는 온도가 높을수록 커진다(식히면 녹아 있던 것이 다시 고체로 나온다).
// 수치: 질산 칼륨의 용해도(g/물 100 g) 0 ℃ 13.3, 20 ℃ 31.6, 40 ℃ 63.9, 60 ℃ 110, 80 ℃ 169(자연값). 사이는 매끄럽게 이었다.

import type { StepRenderer } from "../../types";
import { bvRange } from "../bio6/b6Lab";
import { kno3 } from "../../../ui/g2u1v5Figures";
import { P, fx, g1Lab, g1Predict, g1Strip, plot, ptsOf, seeded, svgOpen, type G1Step } from "./g2u1Kit";

const PUT = 6; // 병에 넣은 질산 칼륨(g), 물 10 g

export const g2u1WarmLab: StepRenderer = (host, step, api) => {
  const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 2, cls: "g2u1x-wm" });
  const { f } = lab;
  const pl = plot({ x: 208, y: 34, w: 126, h: 150, x0: 0, x1: 80, y0: 0, y1: 160, xl: "온도(℃)", yl: "녹는 양(g/물 100 g)", xt: [20, 40, 60, 80], yt: [40, 80, 120, 160] });
  const curve: Array<[number, number]> = [];
  for (let t = 0; t <= 80; t += 4) curve.push([pl.px(t), pl.py(kno3(t))]);
  f.stage.innerHTML = `${svgOpen}
    ${pl.svg}
    <polyline points="${ptsOf(curve)}" stroke="${P.rose}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${pl.px(0)} ${pl.py(PUT * 10)} H${pl.px(80)}" stroke="${P.yellow}" stroke-width="1.4" stroke-dasharray="4 3"/>
    <text x="${pl.px(80)}" y="${pl.py(PUT * 10) + 14}" text-anchor="end" font-size="12" font-weight="800" fill="${P.yellow}">넣은 양</text>
    <path class="g2u1x-wm-v" d="M0 0" stroke="rgba(255,255,255,.4)" stroke-width="1.2"/>
    <circle class="g2u1x-wm-dot" r="5.5" fill="#fff" stroke="${P.rose}" stroke-width="2.4"/>
    <rect class="g2u1x-wm-bath" x="23" y="112" width="124" height="85" rx="6" fill="${P.cold}" opacity=".35"/>
    <path d="M20 96 V190 a10 10 0 0 0 10 10 h110 a10 10 0 0 0 10 -10 V96 M14 96 h142" stroke="${P.glass}" stroke-width="2.4" stroke-linecap="round"/>
    <rect class="g2u1x-wm-liq" x="61" y="92" width="48" height="92" rx="5" fill="#DCEBFA" opacity=".42"/>
    <g class="g2u1x-wm-pile"></g>
    <path d="M58 70 V180 a7 7 0 0 0 7 7 h40 a7 7 0 0 0 7 -7 V70" stroke="${P.glass}" stroke-width="2.2"/>
    <rect x="54" y="60" width="62" height="12" rx="4" fill="#59657A" stroke="#8B9BB0" stroke-width="1.2"/>
    <text class="g2u1x-wm-t" x="85" y="40" text-anchor="middle" font-size="22" font-weight="800" fill="${P.text}"></text>
  </svg>`;
  const strip = g1Strip();
  const tEl = f.stage.querySelector(".g2u1x-wm-t") as SVGTextElement;
  const dot = f.stage.querySelector(".g2u1x-wm-dot") as SVGCircleElement;
  const vline = f.stage.querySelector(".g2u1x-wm-v") as SVGPathElement;
  const bath = f.stage.querySelector(".g2u1x-wm-bath") as SVGRectElement;
  const pile = f.stage.querySelector(".g2u1x-wm-pile") as SVGGElement;

  let T = 20;
  let phase: "pred" | "heat" | "cool" | "end" = "pred";
  let pred = "";

  function paint(): void {
    const s = kno3(T);
    const dis = Math.min(PUT, s / 10);
    const left = PUT - dis;
    dot.setAttribute("cx", fx(pl.px(T)));
    dot.setAttribute("cy", fx(pl.py(s)));
    vline.setAttribute("d", `M${fx(pl.px(T))} ${pl.py(0)} V${pl.py(160)}`);
    const k = (T - 20) / 60;
    bath.setAttribute("fill", k > 0.5 ? P.hot : k > 0.15 ? P.warm : P.cold);
    bath.setAttribute("opacity", (0.3 + 0.25 * k).toFixed(2));
    const r = seeded(11);
    let g = "";
    const n = Math.round(left * 9);
    for (let i = 0; i < n; i++) g += `<circle cx="${(66 + (i % 6) * 7.6 + r() * 3).toFixed(1)}" cy="${(180 - Math.floor(i / 6) * 5.4 - r() * 2).toFixed(1)}" r="3" fill="${P.kno3}" stroke="rgba(0,0,0,.25)" stroke-width=".6"/>`;
    pile.innerHTML = g;
    tEl.textContent = `${T} ℃`;
    strip.set(`<span>넣은 양 <b>6 g</b>  ·  녹은 양 <b>${fx(dis)} g</b>  ·  남은 양 <b class="${left > 0.05 ? "w" : ""}">${fx(left)} g</b></span>`);
    host.dataset.g2u1Wm = String(T);
  }
  const range = bvRange({
    cls: "g2u1x-wm-range",
    min: 20,
    max: 80,
    value: 20,
    label: "병을 담근 물의 온도",
    ticks: ["20 ℃", "50 ℃", "80 ℃"],
    onInput: (v) => {
      T = v;
      paint();
    },
    onChange: () => check(),
  });
  function check(): void {
    const left = PUT - Math.min(PUT, kno3(T) / 10);
    if (phase === "heat" && left <= 0.05) {
      phase = "cool";
      f.pips(1);
      const head = pred.startsWith("더 녹") ? "예측대로" : "예측과 달리";
      f.say(`${head} 남아 있던 질산 칼륨이 <b>모두 녹았어요</b>. 이번에는 다시 <b>20 ℃</b>까지 식혀 보세요.`);
      api.setCTA("다시 20 ℃까지 식혀 보세요", { enabled: false });
      lab.todo(".g2u1x-wm-range", 20);
    } else if (phase === "cool" && T <= 24) {
      phase = "end";
      range.input.disabled = true;
      f.say("식히자 녹아 있던 질산 칼륨이 <b>다시 고체로</b> 나왔어요. 점은 곡선을 따라 움직였어요.");
      lab.tm.later(ask, 900);
    }
  }
  function ask(): void {
    lab.judge(
      "분홍 곡선에서 <b>60 ℃</b>의 물 100 g에 질산 칼륨은 최대 얼마나 녹나요?",
      [{ t: "약 110 g", ok: true }, { t: "약 60 g" }, { t: "약 32 g" }],
      "60 ℃ 위의 곡선은 80과 120 사이, 약 <b>110 g</b>이에요. 32 g은 20 ℃의 값이에요.",
      () => lab.finish("질산 칼륨은 온도가 <b>높을수록</b> 물에 더 많이 녹아요. 식히면 한계가 줄어 넘친 만큼 다시 고체로 나와요."),
    );
  }

  paint();
  f.say("실온의 물 10 g에 질산 칼륨 <b>6 g</b>을 넣었더니 다 녹지 않았어요. 먼저 예측해 보세요.");
  g1Predict(lab, "이 병을 <b>따뜻한 물</b>에 담그면 바닥의 질산 칼륨은?", ["더 녹는다", "그대로 남는다", "더 많이 생긴다"], (picked) => {
    pred = picked;
    phase = "heat";
    f.slot.setControls(strip.el, range.el);
    f.say("막대를 밀어 <b>물의 온도</b>를 올려 보세요. 오른쪽 그래프의 점도 함께 움직여요.");
    api.setCTA("물의 온도를 올려 보세요", { enabled: false });
    lab.todo(".g2u1x-wm-range", 70);
  });
  return lab.cleanup;
};
