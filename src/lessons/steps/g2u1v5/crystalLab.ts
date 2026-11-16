// [중2 Ⅰ v5] g2u1l8 재결정 랩: 「용액을 식히면 어느 물질이 고체로 나올까요?」
// 책의 탐구(고체 혼합물에서 순수한 고체 물질 얻기)를 손으로 한다: 질산 칼륨 10 g과 염화 나트륨 2 g의 혼합물을 물 10 g에 넣고
//   가열해 모두 녹인 뒤, 얼음으로 식히고, 거름 장치로 거른다.
// 학생이 정하는 것: 용액의 온도를 올리고 내리는 차례, 거르는 때.
// 실패하는 길: 다 녹이기 전에 거르면 덩어리 속의 염화 나트륨까지 함께 걸러진다 / 뜨거운 채로 거르면 거름종이에 남는 것이 없다 / 덜 식히고 거르면 조금밖에 얻지 못한다.
// 통찰 하나: 온도에 따라 용해도가 크게 변하는 물질만 식힐 때 결정으로 나온다.
// 수치: 용해도는 자연값(ui/g2u1v5Figures의 kno3, nacl). 그래프는 물 100 g 기준이라 넣은 양을 10배 한 선(100, 20)을 그었다.
// 왼쪽 칸(2026-11-15 그래픽 감사): 단계마다 한 장치만 그린다. 데우는 동안은 가열 장치 위 비커와 유리 막대, 식히면 잘게 부순 얼음 속 비커,
//   거르면 스탠드에 건 깔때기와 거름종이 위 바늘 모양 결정 더미, 아래 비커의 거른 용액. 생김새는 정리 카드 자세히 그림(g2u1l8f1)과 같다.
//   결정은 바늘 모양 결정 무리(빗금이 아니다). 녹이기 전의 혼합물 가루는 동그란 알갱이.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange } from "../bio6/b6Lab";
import { kno3, nacl } from "../../../ui/g2u1v5Figures";
import { P, clamp, fx, g1Lab, g1Strip, plot, ptsOf, seeded, svgOpen, type G1Step } from "./g2u1Kit";

const K = 10; // 질산 칼륨(g)
const N = 2; // 염화 나트륨(g)

/** 바늘 모양 결정 무리 하나: (x, y)에서 위로 부채꼴로 뻗는 바늘 n개. */
function needles(x: number, y: number, n: number, r: () => number, k = 1): string {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = ((-62 + (124 * (i + 0.5)) / n + (r() - 0.5) * 18) * Math.PI) / 180;
    const len = (7 + r() * 6) * k;
    const x2 = x + Math.sin(a) * len;
    const y2 = y - Math.cos(a) * len;
    s += `<path d="M${fx(x)} ${fx(y)} L${fx(x2)} ${fx(y2)}" stroke="rgba(255,255,255,.28)" stroke-width="4" stroke-linecap="round"/><path d="M${fx(x)} ${fx(y)} L${fx(x2)} ${fx(y2)}" stroke="#F4F7FB" stroke-width="1.9" stroke-linecap="round"/>`;
  }
  return s;
}
/** 결정 더미: amount(g)에 따라 무리 수가 늘고, 많으면 위로 한 줄 더 쌓인다. 바닥 가운데 cx, 바닥 y, 폭 w. */
function crystalPile(amount: number, cx: number, y: number, w: number, k = 1): string {
  const r = seeded(13);
  const n = Math.min(9, Math.max(1, Math.round(amount * 0.9)));
  let s = "";
  for (let i = 0; i < n; i++) {
    const row = i < 6 ? 0 : 1;
    const inRow = row === 0 ? Math.min(n, 6) : n - 6;
    const j = row === 0 ? i : i - 6;
    const x = cx - w / 2 + (w * (j + 0.5)) / inRow + (r() - 0.5) * 4;
    s += needles(x, y - row * 7 * k, 5 + Math.round(r() * 2), r, k);
  }
  return s;
}
// 얼음 조각(비커 둘레와 아래): [x, y, 크기, 기울기]
const ICE: Array<[number, number, number, number]> = [
  [36, 122, 11, 14], [44, 136, 10, -10], [36, 150, 12, 20], [45, 163, 11, -16], [37, 178, 12, 8], [140, 124, 11, -12], [148, 138, 10, 14], [139, 152, 12, -18], [148, 166, 11, 10], [140, 180, 12, -6],
  [56, 182, 12, 12], [72, 186, 11, -14], [90, 183, 12, 18], [108, 187, 11, -8], [124, 182, 12, 16],
];

export const g2u1CrystalLab: StepRenderer = (host, step, api) => {
  const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 3, cls: "g2u1x-cr" });
  const { f, tm } = lab;
  const pl = plot({ x: 208, y: 34, w: 126, h: 150, x0: 0, x1: 80, y0: 0, y1: 160, xl: "온도(℃)", yl: "용해도(g/물 100 g)", xt: [20, 40, 60, 80], yt: [40, 80, 120, 160] });
  const cv = (fn: (t: number) => number): string => ptsOf(Array.from({ length: 21 }, (_, i) => [pl.px(i * 4), pl.py(fn(i * 4))] as [number, number]));
  /** 비커(왼쪽 위 부리 포함). */
  const beakerPath = (x0: number, y0: number, x1: number, y1: number): string => `M${x0} ${y0} V${y1 - 8} a8 8 0 0 0 8 8 H${x1 - 8} a8 8 0 0 0 8 -8 V${y0} M${x0 - 4} ${y0} H${x1 + 4} M${x0 - 4} ${y0} q-2 -1 -4 -4`;
  f.stage.innerHTML = `${svgOpen}
    ${pl.svg}
    <polyline points="${cv(kno3)}" stroke="${P.rose}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${cv(nacl)}" stroke="${P.green}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${pl.px(0)} ${pl.py(K * 10)} H${pl.px(80)}" stroke="${P.rose}" stroke-width="1.3" stroke-dasharray="4 3"/>
    <path d="M${pl.px(0)} ${pl.py(N * 10)} H${pl.px(80)}" stroke="${P.green}" stroke-width="1.3" stroke-dasharray="4 3"/>
    <text x="${pl.px(2)}" y="${pl.py(K * 10) - 5}" font-size="12" font-weight="800" fill="${P.rose}">질산 칼륨 10 g</text>
    <text x="${pl.px(80)}" y="${pl.py(N * 10) + 14}" text-anchor="end" font-size="12" font-weight="800" fill="${P.green}">염화 나트륨 2 g</text>
    <path class="g2u1x-cr-v" d="M0 0" stroke="rgba(255,255,255,.5)" stroke-width="1.4"/>
    <g class="g2u1x-cr-heat">
      <rect class="g2u1x-cr-glow" x="40" y="168" width="104" height="5" rx="2.5" fill="${P.warm}" opacity="0"/>
      <rect x="34" y="171" width="116" height="6" rx="2" fill="#39455A"/>
      <rect x="28" y="177" width="128" height="20" rx="6" fill="#C8D2DE" stroke="#8B9BB0" stroke-width="1.4"/>
      <circle class="g2u1x-cr-lamp" cx="44" cy="187" r="3" fill="#59657A"/>
      <circle cx="140" cy="187" r="5.5" fill="#59657A"/>
    </g>
    <g class="g2u1x-cr-ice" opacity="0">
      <rect x="32" y="122" width="120" height="72" rx="8" fill="${P.cold}" opacity=".22"/>
      ${ICE.map(([x, y, w, a]) => `<rect x="${x - w / 2}" y="${y - w / 2}" width="${w}" height="${fx(w * 0.85)}" rx="2.5" fill="#E6F6FF" fill-opacity=".85" stroke="#9BD0F2" stroke-width="1.1" transform="rotate(${a} ${x} ${y})"/>`).join("")}
      <path d="M30 112 V186 a10 10 0 0 0 10 10 H144 a10 10 0 0 0 10 -10 V112 M26 112 H158" stroke="${P.glass}" stroke-width="2.2" stroke-linecap="round"/>
    </g>
    <g class="g2u1x-cr-beaker">
      <rect x="55" y="100" width="74" height="67" rx="5" fill="${P.water}" opacity=".4"/>
      <g class="g2u1x-cr-pile"></g>
      <path class="g2u1x-cr-rod" d="M120 64 L88 160" stroke="#E3EEF9" stroke-width="3" stroke-linecap="round" opacity=".85"/>
      <path d="${beakerPath(52, 84, 132, 170)}" stroke="${P.glass}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    </g>
    <g class="g2u1x-cr-filter" opacity="0">
      <rect x="14" y="204" width="104" height="6" rx="2" fill="#39455A"/>
      <rect x="24" y="66" width="4" height="138" rx="2" fill="#59657A"/>
      <rect x="26" y="102" width="34" height="4" rx="2" fill="#59657A"/>
      <path d="M58 104 A34 4.5 0 0 1 126 104" stroke="#7D8BA0" stroke-width="2.4"/>
      <rect x="65" y="174" width="54" height="23" rx="5" fill="${P.water}" opacity=".35"/>
      <path d="${beakerPath(62, 150, 122, 200)}" stroke="${P.glass}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      <path d="M63 101 L92 137 L121 101 Z" fill="#F4F7FB" fill-opacity=".5" stroke="#E3EEF9" stroke-width="1"/>
      <g class="g2u1x-cr-cake"></g>
      <path d="M56 100 H128 M58 100 L89 139 V181 M126 100 L95 139 V181" stroke="${P.glass}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M58 104 A34 4.5 0 0 0 126 104" stroke="#7D8BA0" stroke-width="2.4"/>
      <circle cx="92" cy="186" r="2.4" fill="#DCE7F5"/>
      <path d="M92 78 V114" stroke="${P.dim}" stroke-width="1.2"/>
      <text x="92" y="74" text-anchor="middle" font-size="12" font-weight="700" fill="${P.text}">질산 칼륨 결정</text>
      <text x="127" y="191" font-size="12" font-weight="700" fill="${P.dim}">거른 용액</text>
    </g>
    <text class="g2u1x-cr-t" x="92" y="52" text-anchor="middle" font-size="22" font-weight="800" fill="${P.text}"></text>
    <text class="g2u1x-cr-m" x="92" y="219" text-anchor="middle" font-size="12.5" font-weight="700" fill="${P.dim}"></text>
  </svg>`;
  const strip = g1Strip();
  const q = <T extends Element>(s: string): T => f.stage.querySelector(s) as T;
  const vline = q<SVGPathElement>(".g2u1x-cr-v");
  const heatG = q<SVGGElement>(".g2u1x-cr-heat");
  const iceG = q<SVGGElement>(".g2u1x-cr-ice");
  const beakerG = q<SVGGElement>(".g2u1x-cr-beaker");
  const filterG = q<SVGGElement>(".g2u1x-cr-filter");
  const glow = q<SVGRectElement>(".g2u1x-cr-glow");
  const lamp = q<SVGCircleElement>(".g2u1x-cr-lamp");
  const rod = q<SVGPathElement>(".g2u1x-cr-rod");
  const pile = q<SVGGElement>(".g2u1x-cr-pile");
  const cake = q<SVGGElement>(".g2u1x-cr-cake");
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
    if (phase === "end") {
      // 거른 뒤: 스탠드에 건 깔때기, 거름종이 위 결정 더미, 아래 비커의 거른 용액
      heatG.setAttribute("opacity", "0");
      iceG.setAttribute("opacity", "0");
      beakerG.setAttribute("opacity", "0");
      filterG.setAttribute("opacity", "1");
      cake.innerHTML = crystalPile(left, 92, 133, 26, 1.05);
      mEl.textContent = "";
      host.dataset.g2u1Cr = String(T);
      return;
    }
    const cold = T <= 15;
    const heating = !cold && (T >= 55 || (!melted && T >= 30));
    heatG.setAttribute("opacity", cold ? "0" : "1");
    iceG.setAttribute("opacity", cold ? "1" : "0");
    glow.setAttribute("opacity", heating ? fx(clamp((T - 25) / 45), 2) : "0");
    lamp.setAttribute("fill", heating ? P.hot : "#59657A");
    rod.setAttribute("opacity", cold ? "0" : ".85");
    mEl.textContent = heating ? "가열 장치로 가열하는 중" : cold ? "잘게 부순 얼음에 담가 식히는 중" : melted ? "식히는 중" : "";
    if (melted) pile.innerHTML = left > 0.05 ? crystalPile(left, 92, 166, 66, 1.3) : "";
    else {
      // 녹이기 전의 혼합물 가루(동그란 알갱이)
      const r = seeded(13);
      let g = "";
      const n = Math.round(left * 5);
      for (let i = 0; i < n; i++) {
        const x = 60 + (i % 10) * 7 + r() * 3;
        const y = 164 - Math.floor(i / 10) * 6 - r() * 2;
        g += `<circle cx="${fx(x)}" cy="${fx(y)}" r="2.8" fill="#F4F7FB" stroke="rgba(0,0,0,.25)" stroke-width=".6"/>`;
      }
      pile.innerHTML = g;
    }
    if (phase === "play") strip.set(`<span>물 10 g  ·  바닥의 고체 <b class="${left > 0.05 ? "k" : ""}">${fx(left)} g</b></span>`);
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
      f.say("아직 고체를 <b>모두 녹이지 않았어요</b>. 먼저 온도를 높여 혼합물을 완전히 녹여 보세요.");
      return;
    }
    if (left <= 0.05) {
      haptic(HAPTIC.wrong);
      host.dataset.g2u1Fail = "hot";
      f.say("두 물질이 모두 녹아 있어 거름종이에 <b>걸러지는 고체가 없어요</b>. 먼저 얼음물로 차갑게 식혀 보세요.");
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
    paint();
    f.pips(2);
    strip.set(`<span>거름종이 <b>질산 칼륨 ${fx(left)} g</b>  ·  용액 <b>염화 나트륨 ${fx(N)} g</b></span>`);
    f.say(`거름종이에는 <b>질산 칼륨 결정 ${fx(left)} g</b>만 남았어요. 염화 나트륨 2 g은 녹은 채 지나갔어요.`);
    tm.later(
      () =>
        lab.judge(
          "식혔을 때 <b>염화 나트륨</b>이 결정으로 나오지 않은 까닭은?",
          // 정답 보기: 수정안은 "…2 g은 모두 녹아 있을 수 있어서"인데 오답 카드의 정답 줄(폭 약 274px)을 1px 넘겨 두 줄이 되고 조작 칸(208)을 넘친다. "모두"만 "다"로 둔다.
          [{ t: "식혀도 물 10 g에 2 g은 다 녹아 있을 수 있어서", ok: true }, { t: "염화 나트륨은 물에 녹지 않아서" }, { t: "질산 칼륨보다 먼저 거름종이에 걸려서" }],
          "0 ℃에서도 물 10 g에 염화 나트륨이 약 3.6 g까지 녹으므로 2 g은 <b>모두 녹아</b> 있어요.",
          () => lab.finish("온도에 따라 용해도가 <b>크게 변하는</b> 질산 칼륨만 식힐 때 결정으로 나왔어요. 이렇게 순수한 고체를 얻는 방법이 <b>재결정</b>이에요."),
        ),
      1300,
    );
  });

  paint();
  f.slot.setControls(strip.el, range.el, bFilter);
  f.say("물 10 g에 혼합물을 넣었더니 다 녹지 않았어요. <b>온도를 올려</b> 모두 녹인 뒤 식혀서 걸러요.");
  api.setCTA("온도를 올려 모두 녹여 보세요", { enabled: false });
  lab.todo(".g2u1x-cr-range", 70);
  return lab.cleanup;
};
