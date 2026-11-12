// [중2 Ⅰ v5] g2u1l8 재결정 랩: 「식히면 어느 물질이 고체로 나올까요?」
// 책의 탐구(고체 혼합물에서 순수한 고체 물질 얻기)를 손으로 한다: 질산 칼륨 10 g과 염화 나트륨 2 g의 혼합물을 물 10 g에 넣고
//   가열해 모두 녹인 뒤, 얼음으로 식히고, 거름 장치로 거른다.
// 학생이 정하는 것: 용액의 온도를 올리고 내리는 차례, 거르는 때.
// 실패하는 길: 다 녹이기 전에 거르면 덩어리 속의 염화 나트륨까지 함께 걸러진다 / 뜨거운 채로 거르면 거름종이에 남는 것이 없다 / 덜 식히고 거르면 조금밖에 얻지 못한다.
// 통찰 하나: 온도에 따라 용해도가 크게 변하는 물질만 식힐 때 결정으로 나온다.
// 수치: 용해도는 자연값(ui/g2u1v5Figures의 kno3, nacl). 그래프는 물 100 g 기준이라 넣은 양을 10배 한 선(100, 20)을 그었다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange } from "../bio6/b6Lab";
import { kno3, nacl } from "../../../ui/g2u1v5Figures";
import { P, fx, g1Lab, g1Log, plot, ptsOf, seeded, svgOpen, type G1Step } from "./g2u1Kit";

const K = 10; // 질산 칼륨(g)
const N = 2; // 염화 나트륨(g)

export const g2u1CrystalLab: StepRenderer = (host, step, api) => {
  const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 3, cls: "g2u1x-cr" });
  const { f, tm } = lab;
  const pl = plot({ x: 208, y: 34, w: 126, h: 150, x0: 0, x1: 80, y0: 0, y1: 160, xl: "온도(℃)", yl: "물 100 g에 녹는 양(g)", xt: [20, 40, 60, 80], yt: [40, 80, 120, 160] });
  const cv = (fn: (t: number) => number): string => ptsOf(Array.from({ length: 21 }, (_, i) => [pl.px(i * 4), pl.py(fn(i * 4))] as [number, number]));
  f.stage.innerHTML = `${svgOpen}
    ${pl.svg}
    <polyline points="${cv(kno3)}" stroke="${P.rose}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${cv(nacl)}" stroke="${P.green}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${pl.px(0)} ${pl.py(K * 10)} H${pl.px(80)}" stroke="${P.rose}" stroke-width="1.3" stroke-dasharray="4 3"/>
    <path d="M${pl.px(0)} ${pl.py(N * 10)} H${pl.px(80)}" stroke="${P.green}" stroke-width="1.3" stroke-dasharray="4 3"/>
    <text x="${pl.px(2)}" y="${pl.py(K * 10) - 5}" font-size="12" font-weight="800" fill="${P.rose}">질산 칼륨</text>
    <text x="${pl.px(80)}" y="${pl.py(N * 10) + 14}" text-anchor="end" font-size="12" font-weight="800" fill="${P.green}">염화 나트륨</text>
    <path class="g2u1x-cr-v" d="M0 0" stroke="rgba(255,255,255,.5)" stroke-width="1.4"/>
    <rect class="g2u1x-cr-bath" x="22" y="120" width="140" height="78" rx="8" fill="${P.cold}" opacity="0"/>
    <rect class="g2u1x-cr-liq" x="49" y="108" width="86" height="80" rx="5" fill="${P.water}" opacity=".4"/>
    <g class="g2u1x-cr-pile"></g>
    <path d="M46 92 V182 a9 9 0 0 0 9 9 h74 a9 9 0 0 0 9 -9 V92 M40 92 h104" stroke="${P.glass}" stroke-width="2.4" stroke-linecap="round"/>
    <text class="g2u1x-cr-t" x="150" y="84" text-anchor="middle" font-size="18" font-weight="800" fill="${P.text}"></text>
    <text class="g2u1x-cr-m" x="92" y="216" text-anchor="middle" font-size="12.5" font-weight="700" fill="${P.dim}"></text>
  </svg>`;
  const log = g1Log(lab);
  const q = <T extends Element>(s: string): T => f.stage.querySelector(s) as T;
  const vline = q<SVGPathElement>(".g2u1x-cr-v");
  const bath = q<SVGRectElement>(".g2u1x-cr-bath");
  const pile = q<SVGGElement>(".g2u1x-cr-pile");
  const tEl = q<SVGTextElement>(".g2u1x-cr-t");
  const mEl = q<SVGTextElement>(".g2u1x-cr-m");

  let T = 20;
  let melted = false; // 한 번이라도 모두 녹였는가
  let phase: "play" | "end" = "play";
  const solid = (): number => Math.max(0, K - kno3(T) / 10);

  function paint(): void {
    const left = solid();
    vline.setAttribute("d", `M${fx(pl.px(T))} ${pl.py(0)} V${pl.py(160)}`);
    tEl.textContent = `${T} ℃`;
    const hot = T >= 45;
    const cold = T <= 12;
    bath.setAttribute("fill", hot ? P.hot : P.cold);
    bath.setAttribute("opacity", hot ? "0.28" : cold ? "0.4" : "0");
    mEl.textContent = hot ? "가열 장치로 가열하는 중" : cold ? "얼음에 담가 식히는 중" : "";
    const r = seeded(13);
    let g = "";
    const n = Math.round(left * 5);
    for (let i = 0; i < n; i++) {
      const x = 56 + (i % 10) * 7.6 + r() * 3;
      const y = 184 - Math.floor(i / 10) * 6 - r() * 2;
      g += melted ? `<path d="M${fx(x - 3)} ${fx(y + 2)} L${fx(x + 4)} ${fx(y - 4)}" stroke="#F4F7FB" stroke-width="2.2" stroke-linecap="round"/>` : `<circle cx="${fx(x)}" cy="${fx(y)}" r="2.8" fill="#F4F7FB" stroke="rgba(0,0,0,.25)" stroke-width=".6"/>`;
    }
    pile.innerHTML = g;
    log.set([`질산 칼륨 <b class="k">10 g</b>`, `염화 나트륨 <b class="k">2 g</b>`, `바닥의 고체 <b class="${left > 0.05 ? "w" : ""}">${fx(left)} g</b>`]);
    host.dataset.g2u1Cr = String(T);
  }
  const range = bvRange({
    cls: "g2u1x-cr-range",
    min: 0,
    max: 80,
    value: 20,
    label: "용액의 온도",
    ticks: ["0 ℃ 얼음", "40 ℃", "80 ℃ 가열"],
    onInput: (v) => {
      T = v;
      paint();
    },
    onChange: () => {
      if (phase !== "play") return;
      if (!melted && solid() <= 0) {
        melted = true;
        f.pips(1);
        paint();
        f.say("혼합물이 <b>모두 녹았어요</b>. 이제 얼음에 담가 <b>식혀</b> 보세요. 그래프의 세로선이 함께 움직여요.");
        api.setCTA("용액을 식혀 보세요", { enabled: false });
        lab.todo(".g2u1x-cr-range", 5);
      } else if (melted && solid() > 0.05) {
        f.say(`바늘 모양의 <b>결정</b>이 ${fx(solid())} g 나왔어요. 염화 나트륨 선은 아직 곡선 아래에 있어요.`);
        if (T <= 25) lab.todo("[data-k='filter']");
      } else if (!melted) f.say("아직 바닥에 고체가 남아 있어요. 온도를 더 올려 <b>모두</b> 녹여요.");
    },
  });
  const bFilter = bvBtn("main", "거름 장치로 거르기");
  bFilter.dataset.k = "filter";
  bFilter.addEventListener("click", () => {
    if (phase !== "play") return;
    const left = solid();
    if (!melted) {
      haptic(HAPTIC.wrong);
      host.dataset.g2u1Fail = "early";
      f.say("아직 <b>다 녹이지 않았어요</b>. 덩어리 속에 갇힌 염화 나트륨까지 함께 걸러져요. 먼저 모두 녹여요.");
      return;
    }
    if (left <= 0.05) {
      haptic(HAPTIC.wrong);
      host.dataset.g2u1Fail = "hot";
      f.say("거름종이에 <b>남은 것이 없어요</b>. 두 물질이 모두 녹은 채 거름종이를 빠져나갔어요. 먼저 식혀요.");
      return;
    }
    if (T > 25) {
      haptic(HAPTIC.wrong);
      host.dataset.g2u1Fail = "warm";
      f.say(`지금 거르면 ${fx(left)} g밖에 얻지 못해요. <b>더 식히면</b> 결정이 더 많이 나와요.`);
      return;
    }
    phase = "end";
    haptic(HAPTIC.correct);
    range.input.disabled = true;
    bFilter.disabled = true;
    f.pips(2);
    log.set([`거름종이 위: 질산 칼륨 <b>${fx(left)} g</b>`, `거른 용액: 염화 나트륨 <b>${fx(N)} g</b>`, `거른 용액: 질산 칼륨 <b>${fx(K - left)} g</b>`]);
    f.say("거름종이에는 <b>질산 칼륨 결정</b>만 남았어요. 염화 나트륨은 녹은 채 거름종이를 지나갔어요.");
    tm.later(
      () =>
        lab.judge(
          "식혔을 때 <b>염화 나트륨</b>이 결정으로 나오지 않은 까닭은?",
          [{ t: "식혀도 2 g은 물 10 g에 다 녹아 있을 수 있어서", ok: true }, { t: "염화 나트륨은 물에 녹지 않아서" }, { t: "질산 칼륨보다 먼저 거름종이에 걸려서" }],
          "염화 나트륨 선(20)은 0 ℃에서도 곡선(약 36)보다 <b>아래</b>예요.",
          () => lab.finish("온도에 따라 용해도가 <b>크게 변하는</b> 질산 칼륨만 식힐 때 결정으로 나왔어요. 이렇게 순수한 고체를 얻는 방법이 <b>재결정</b>이에요."),
        ),
      1300,
    );
  });

  paint();
  f.slot.setControls(range.el, bFilter);
  f.say("물 10 g에 혼합물을 넣었더니 다 녹지 않았어요. <b>온도를 올려</b> 모두 녹인 뒤 식혀서 걸러요.");
  api.setCTA("온도를 올려 모두 녹여 보세요", { enabled: false });
  lab.todo(".g2u1x-cr-range", 70);
  return lab.cleanup;
};
