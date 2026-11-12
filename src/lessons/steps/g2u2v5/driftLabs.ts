// [중2 Ⅱ v5] g2u2l8 랩 1, 2: 대륙 이동설.
//
// 랩 1 「두 대륙의 해안선은 맞물릴까요?」(g2u2FitLab)
//   책의 해 보기(대륙의 해안선 맞추기: 해안선 모양과 화석 분포로 대륙 조각을 맞춘다)를 남아메리카와 아프리카 두 조각으로 한다.
//   학생이 정하는 것: 남아메리카 조각을 옮기는 거리와 돌리는 각도(막대 둘). '맞춰 보기'로 확인한다.
//   실패가 보이는 길: 덜 옮기면 틈이 남고, 방향이 어긋나면 해안선이 겹치거나 벌어진다(어긋난 채로 보인다).
//   판정 하나: 두 대륙에서 같은 화석이 나오는 띠가 맞춘 뒤 어떻게 됐는가. 통찰 하나: 해안선도, 화석의 분포도 이어진다.
//   두 조각의 모양은 지금 단원의 도입 그림(맞물리는 해안선 곡선)을 도구로 가져왔다.
//
// 랩 2 「더운 인도에 왜 빙하의 흔적이 있을까요?」(g2u2IceLab)
//   책의 그림(대륙 이동설의 증거: 빙하의 흔적)과 스스로 확인하기(열대인 인도 남부의 빙하 흔적)를 손으로 한다.
//   학생이 정하는 것: 대륙을 모으는 정도(막대). 먼저 예측한다(정오를 매기지 않는다).
//   판정 하나: 대륙을 모으자 빙하의 흔적이 어떻게 됐는가. 통찰 하나: 대륙이 한곳에 모여 있다가 이동했다.
//   대륙의 모양과 자리는 간추린 도해다(실제 지도가 아니다).

import type { StepRenderer } from "../../types";
import { bvRange } from "../bio6/b6Lab";
import { G, gBtn, gLab, gPredict, haptic, HAPTIC, label, svgOpen, type GStep } from "./kit";

/* ══════════ 랩 1: 해안선 맞추기 ══════════ */
const EDGE = "C98 44 98 50 100 56 C106 62 120 64 126 72 C130 80 118 86 112 94 C106 104 100 118 96 134";
const EDGE_REV = "C100 118 106 104 112 94 C118 86 130 80 126 72 C120 64 106 62 100 56 C98 50 98 44 106 38";
const SA = `M106 38 ${EDGE} Q94 144 88 151 Q81 156 79 148 Q76 140 78 131 Q73 114 69 98 Q63 78 67 62 Q72 46 86 40 Q98 34 106 38 Z`;
const AF = `M96 134 ${EDGE_REV} Q120 32 138 33 Q157 35 163 47 Q167 54 171 59 Q163 67 157 75 Q152 96 142 112 Q131 129 119 137 Q104 144 96 134 Z`;

export const g2u2FitLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-fit" });
  const { f, tm } = lab;
  f.stage.innerHTML = `${svgOpen}
    <rect width="346" height="230" fill="#12325C"/>
    <g transform="translate(64 -24) scale(1.36)">
      <g class="g2u2x-ft-af"><path d="${AF}" fill="#D9B45F" stroke="#8E6A24" stroke-width="1.4"/><path d="M110 97 L142 88" stroke="#12A594" stroke-width="11" stroke-linecap="round" opacity=".85"/></g>
      <g class="g2u2x-ft-sa"><path d="${SA}" fill="#86C06C" stroke="#4E7A38" stroke-width="1.4"/><path d="M80 105 L110 97" stroke="#12A594" stroke-width="11" stroke-linecap="round" opacity=".85"/></g>
      <path class="g2u2x-ft-seam" d="M106 38 ${EDGE}" stroke="#fff" stroke-width="2.2" fill="none"/>
    </g>
    ${label(258, 208, "아프리카", { size: 13, cls: "g2u2x-halo" })}
    ${label(0, 0, "남아메리카", { size: 13, cls: "g2u2x-ft-sn g2u2x-halo" })}
    <rect x="10" y="10" width="14" height="10" rx="3" fill="#12A594"/>${label(30, 20, "같은 화석이 나오는 곳", { anchor: "start", size: 12.5, cls: "g2u2x-halo" })}
  </svg>`;
  const sa = lab.q<SVGGElement>(".g2u2x-ft-sa"), sn = lab.q<SVGTextElement>(".g2u2x-ft-sn");
  let mv = 8, rot = 8, locked = false;
  const paint = (): void => {
    const dx = -(1 - mv / 100) * 72, deg = locked ? 0 : rot - 30;
    sa.setAttribute("transform", `translate(${dx.toFixed(1)} ${((1 - mv / 100) * 10).toFixed(1)}) rotate(${deg} 88 95)`);
    sn.setAttribute("x", (64 + (84 + dx) * 1.36).toFixed(1));
    sn.setAttribute("y", "208");
    host.dataset.g2Fit = `${mv},${rot}`;
  };
  const rMv = bvRange({ cls: "g2u2x-ft-mv", min: 0, max: 100, value: mv, label: "남아메리카를 아프리카 쪽으로 옮기기", onInput: (v) => { if (!locked) { mv = v; paint(); hintNow(); } } });
  const rRot = bvRange({ cls: "g2u2x-ft-rot", min: 0, max: 60, value: rot, label: "남아메리카 돌리기", onInput: (v) => { if (!locked) { rot = v; paint(); hintNow(); } } });
  rMv.input.dataset.k = "mv";
  rRot.input.dataset.k = "rot";
  const check = gBtn("check", "해안선 맞춰 보기");
  function hintNow(): void {
    lab.hint(Math.abs(rot - 30) > 4 ? "range:rot=30" : mv < 94 ? "range:mv=100" : "check");
  }
  check.addEventListener("click", () => {
    if (locked) return;
    const badRot = Math.abs(rot - 30) > 4, far = mv < 94;
    if (badRot || far) {
      haptic(HAPTIC.wrong);
      host.dataset.g2Miss = String(Number(host.dataset.g2Miss ?? 0) + 1);
      f.say(far ? "두 대륙 사이에 아직 <b>틈</b>이 남아 있어요. 더 가까이 옮겨 보세요." : "방향이 어긋나서 해안선이 <b>맞물리지 않아요</b>. 조각을 돌려 보세요.");
      return;
    }
    haptic(HAPTIC.correct);
    locked = true;
    mv = 100;
    paint();
    f.stage.classList.add("fit");
    rMv.input.disabled = rRot.input.disabled = check.disabled = true;
    f.pips(2);
    f.say("남아메리카의 동쪽 해안선과 아프리카의 서쪽 해안선이 <b>맞물렸어요</b>. 초록 띠도 살펴보세요.");
    tm.later(() => lab.ask("두 대륙에서 <b>같은 화석</b>이 나오는 띠는 어떻게 됐나요?", ["하나로 이어졌다", "여전히 어긋나 있다", "한쪽 대륙에만 남았다"], "해안선을 맞추자 화석이 나오는 곳도 <b>한 줄로</b> 이어졌어요.", () =>
      lab.finish("바다를 사이에 둔 두 대륙의 <b>해안선 모양</b>이 잘 맞물리고, 같은 화석이 나오는 곳도 <b>이어져요</b>. 두 대륙이 과거에 붙어 있었다고 생각할 만한 까닭이에요."),
    ), 1100);
  });
  paint();
  f.slot.setControls(rMv.el, rRot.el, check);
  f.say("남아메리카와 아프리카가 바다를 사이에 두고 떨어져 있어요. 조각을 <b>옮기고 돌려서</b> 해안선을 맞춰 보세요.");
  api.setCTA("해안선을 맞춰 보세요", { enabled: false });
  hintNow();
  return lab.cleanup;
};

/* ══════════ 랩 2: 빙하의 흔적 모으기 ══════════ */
// [이름, 지금 자리, 모였을 때 자리, 가로 반지름, 세로 반지름, 색, 빙하 흔적(가운데에서의 치우침과 반지름)]
const LAND: { k: string; name: string; now: [number, number]; old: [number, number]; rx: number; ry: number; c: string; ice: [number, number, number] }[] = [
  { k: "sa", name: "남아메리카", now: [62, 112], old: [118, 124], rx: 24, ry: 36, c: "#86C06C", ice: [12, 22, 17] },
  { k: "af", name: "아프리카", now: [160, 92], old: [166, 104], rx: 32, ry: 38, c: "#D9B45F", ice: [4, 30, 18] },
  { k: "in", name: "인도", now: [236, 56], old: [214, 132], rx: 15, ry: 19, c: "#E8915A", ice: [-6, 10, 12] },
  { k: "au", name: "오스트레일리아", now: [292, 138], old: [236, 168], rx: 27, ry: 19, c: "#C49AE8", ice: [-17, -2, 13] },
  { k: "an", name: "남극", now: [172, 204], old: [174, 184], rx: 46, ry: 19, c: "#BFD7EA", ice: [0, -9, 24] },
];
const blobPath = (rx: number, ry: number): string => `M${-rx} 0 C${-rx} ${-ry * 0.7} ${-rx * 0.5} ${-ry} 0 ${-ry} C${rx * 0.6} ${-ry} ${rx} ${-ry * 0.6} ${rx} 0 C${rx} ${ry * 0.7} ${rx * 0.4} ${ry} 0 ${ry} C${-rx * 0.6} ${ry} ${-rx} ${ry * 0.6} ${-rx} 0 Z`;

export const g2u2IceLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-icel" });
  const { f, tm } = lab;
  f.stage.innerHTML = `${svgOpen}
    <rect width="346" height="230" fill="#12325C"/>
    <path d="M0 74 H346" stroke="#FFD43B" stroke-width="1.4" stroke-dasharray="6 5" opacity=".8"/>${label(8, 68, "적도(더운 곳)", { anchor: "start", size: 12, fill: G.gold })}
    <defs>${LAND.map((l) => `<clipPath id="g2ic-${l.k}"><path d="${blobPath(l.rx, l.ry)}"/></clipPath>`).join("")}</defs>
    ${LAND.map((l) => `<g class="g2u2x-ic-l l-${l.k}"><path d="${blobPath(l.rx, l.ry)}" fill="${l.c}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
      <g clip-path="url(#g2ic-${l.k})"><circle cx="${l.ice[0]}" cy="${l.ice[1]}" r="${l.ice[2]}" fill="#F4FAFF"/><g stroke="#8FB6D6" stroke-width="1.4" stroke-linecap="round">${[-5, 0, 5].map((d) => `<path d="M${l.ice[0] + d - 3} ${l.ice[1] - 4} l6 8"/>`).join("")}</g></g>
      ${l.k === "an" ? label(0, 12, l.name, { size: 12, fill: "#1B2430" }) : label(0, l.k === "au" ? l.ry + 14 : -l.ry - 5, l.name, { size: 12, cls: "g2u2x-halo" })}</g>`).join("")}
    <ellipse class="g2u2x-ic-cap" cx="178" cy="150" rx="52" ry="34" stroke="#fff" stroke-width="2" stroke-dasharray="5 5" fill="none"/>
    <rect x="232" y="8" width="14" height="10" rx="3" fill="#F4FAFF"/>${label(252, 18, "빙하의 흔적", { anchor: "start", size: 12.5 })}
  </svg>`;
  const groups = LAND.map((l) => lab.q<SVGGElement>(`.l-${l.k}`));
  let g = 0, pred = "", locked = false;
  const paint = (): void => {
    const t = g / 100;
    LAND.forEach((l, i) => groups[i].setAttribute("transform", `translate(${(l.now[0] + (l.old[0] - l.now[0]) * t).toFixed(1)} ${(l.now[1] + (l.old[1] - l.now[1]) * t).toFixed(1)})`));
    host.dataset.g2G = String(g);
  };
  const range = bvRange({ cls: "g2u2x-ic-r", min: 0, max: 100, value: 0, label: "떨어진 대륙을 하나로 모으기", ticks: ["지금", "먼 옛날"], onInput: (v) => {
    if (locked) return;
    g = v;
    paint();
    if (g < 97) return;
    locked = true;
    g = 100;
    range.set(100);
    range.input.disabled = true;
    paint();
    haptic(HAPTIC.correct);
    f.stage.classList.add("joined");
    f.pips(2);
    f.say(`${pred.startsWith("옛날에는 인도") ? "예측대로" : "예측과 달리"} 인도가 <b>남극 가까이</b>로 옮겨 갔어요. 흰 빙하의 흔적을 살펴보세요.`);
    tm.later(() => lab.ask("대륙을 모으자 <b>빙하의 흔적</b>은 어떻게 됐나요?", ["남극 둘레에 하나로 모였다", "더 멀리 흩어졌다", "적도 쪽으로 옮겨 갔다"], "흩어져 있던 빙하의 흔적이 <b>한 덩어리</b>로 이어졌어요.", () =>
      lab.finish("여러 대륙에 흩어져 있는 <b>빙하의 흔적</b>은 대륙을 하나로 모으면 한곳에 모여요. 지금은 더운 인도도 먼 옛날에는 남극 가까이에 붙어 있다가 지금의 자리로 <b>이동</b>한 거예요."),
    ), 1100);
  } });
  range.input.dataset.k = "g";
  paint();
  f.say("지금은 더운 <b>인도</b>와 아프리카에도 먼 옛날 빙하가 덮였던 흔적이 있어요. 먼저 까닭을 예측해 보세요.");
  gPredict(lab, "더운 인도에 <b>빙하의 흔적</b>이 있는 까닭은 무엇일까요?", ["옛날에는 인도가 추운 곳에 있었다", "옛날에는 지구 전체가 얼어 있었다", "빙하가 바다를 건너 떠내려왔다"], (picked) => {
    pred = picked;
    f.pips(1);
    f.slot.setControls(range.el);
    f.say("막대를 밀어 떨어진 대륙들을 <b>하나로 모아</b> 보세요. 빙하의 흔적이 어떻게 되는지 지켜봐요.");
    api.setCTA("대륙을 끝까지 모아 보세요", { enabled: false });
    lab.hint("range:g=100");
  });
  return lab.cleanup;
};
