// [중1 Ⅳ v3] L6 surroundTempLab — 「주변 온도 예측하기」(교과서 3. 상태 변화와 열에너지의 이용).
// 한 통찰: 열에너지를 흡수하는 상태 변화(기화·융해·승화 고→기)가 일어나면 주변 온도가 낮아지고,
// 방출하는 상태 변화(응고·액화·승화 기→고)가 일어나면 주변 온도가 높아진다.
// 조작: 장면 3개(살수차·파라핀·눈 오는 날)를 차례로 — 예측(b4Ask, 버튼 슬롯에) → 실행(온도계 이동) → 다음 장면(버튼, 자동 전환 없음).
// 한 화면 예산: 장면 탭 줄 제거(진행은 슬롯 버튼 하나), 장면마다 소품은 주인공 하나 + 온도계.
// 목표 3: 살수차 → 파라핀 → 눈. rAF·캔버스 없음.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { M3, thermoSvg } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3Btn, m3Deg, m3Goals, m3Helper, m3Slot, m3Timers } from "./m3Lab";

interface StlStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface SceneDef {
  id: string;
  name: string;
  intro: string; // helper 도입(2줄 이하)
  question: string;
  okIdx: 0 | 1; // 0 = 낮아진다, 1 = 높아진다
  before: number;
  after: number;
  explainGood: string;
  explainBad: string;
  why: string; // 오답 정답 카드의 이유 한 줄(40자 이하)
  art: (ns: string) => string;
}

const T0 = 0.25; // 온도계 기준 수은주 높이(scaleY)
/** 손 실루엣 한 경로(손목 위 → 팔꿈치 쪽 → 손날 → 손가락 네 개(아래로) → 엄지) — 벙어리장갑 모양 실격 회피. */
const HAND_D = "M14 0 L40 0 L44 14 L48 34 L47 40 L48 66 Q48 74 42 74 Q36 74 36 66 L37 44 L35 44 L36 70 Q36 78 30 78 Q24 78 24 70 L25 44 L23 44 L24 66 Q24 74 18 74 Q12 74 12 66 L13 44 L11 44 L10 58 Q10 66 4 66 Q-2 66 -2 58 L0 40 L-10 28 Q-14 22 -9 19 Q-5 17 -1 22 L6 30 L8 14 Z";
const mercOf = (t: number): number => Math.max(0.08, Math.min(0.95, T0 + (t - 20) * 0.02));

const SCENES: SceneDef[] = [
  {
    id: "spray",
    name: "살수차",
    intro: "여름 한낮 도로는 <b>34℃</b>. 살수차가 뿌린 물이 <b>기화</b>하면 주변 온도는 어떻게 될까요?",
    question: "도로의 물이 <b>기화</b>하는 동안, 주변 온도는?",
    okIdx: 0,
    before: 34,
    after: 30,
    explainGood: "정답! 물이 기화하려면 <b>열에너지를 흡수</b>해야 해요. 주변에서 빼앗아 가니 시원해지죠.",
    explainBad: "기화할 때는 <b>열에너지를 흡수</b>해요. 주변에서 빼앗아 가니 온도는 <b>낮아져요</b>. 34℃ → 30℃.",
    why: "기화할 때는 <b>열에너지를 흡수</b>해요. 주변에서 빼앗아 가니 온도가 낮아져요.",
    art: (ns) => `
      <rect x="0" y="118" width="248" height="62" fill="#8B95A1"/><path d="M0 150 h248" stroke="#FFF3BF" stroke-width="3" stroke-dasharray="14 10"/>
      <rect x="18" y="66" width="98" height="50" rx="8" fill="#4DABF7" stroke="#1C7ED6" stroke-width="2.4"/>
      <rect x="110" y="82" width="36" height="34" rx="5" fill="#74C0FC" stroke="#1C7ED6" stroke-width="2.4"/>
      <rect x="116" y="88" width="18" height="14" rx="3" fill="#E7F5FF"/>
      <circle cx="42" cy="120" r="10" fill="#343A40" stroke="#212529" stroke-width="2"/><circle cx="128" cy="120" r="10" fill="#343A40" stroke="#212529" stroke-width="2"/>
      <g class="${ns}-spray stl-fx">
        ${[0, 1, 2].map((k) => `<path d="M150 ${102 + k * 4} q22 ${10 + k * 6} 48 ${18 + k * 8}" stroke="#74C0FC" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="${0.9 - k * 0.15}"/>`).join("")}
        ${[176, 204].map((x, k) => `<path class="stl-mist" style="animation-delay:${k * 0.4}s" d="M${x} 116 q4 -8 0 -14 t0 -12" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.8"/>`).join("")}
        <path d="M150 126 q40 -2 80 2" stroke="#4DABF7" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
      </g>`,
  },
  {
    id: "paraffin",
    name: "파라핀",
    intro: "따뜻하게 녹인 <b>액체 파라핀</b>에 손을 담갔다 뺐어요. 손에 묻은 파라핀이 <b>굳는</b> 동안 손 주변은?",
    question: "손에 묻은 파라핀이 <b>응고</b>하는 동안, 손 주변 온도는?",
    okIdx: 1,
    before: 30,
    after: 34,
    explainGood: "정답! 굳을 때는 <b>열에너지를 방출</b>해요. 그 열을 손이 받아 따뜻해지죠. 파라핀 온열 치료의 원리예요.",
    explainBad: "응고할 때 물질은 <b>열에너지를 방출</b>해요. 그 열이 손으로 오니 온도는 <b>높아져요</b>. 30℃ → 34℃.",
    why: "응고할 때는 <b>열에너지를 방출</b>해요. 그 열이 손으로 오니 온도가 높아져요.",
    art: (ns) => `
      <rect x="22" y="106" width="122" height="62" rx="10" fill="#FFF3BF" stroke="#E0B93A" stroke-width="2.4"/>
      <rect x="28" y="114" width="110" height="48" rx="7" fill="#FFE066" opacity="0.9"/>
      <g class="${ns}-hand" transform="translate(150 12)">
        <path d="${HAND_D}" fill="#FFE8CC" stroke="#C77B4A" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M18 30 q10 8 20 0 M16 42 q12 8 24 0" stroke="#D9A07A" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path class="${ns}-coat stl-fx" d="${HAND_D}" fill="#FFF3BF" stroke="#E0B93A" stroke-width="2.4" stroke-linejoin="round" opacity="0.92"/>
      </g>
      <g class="stl-fx">${[140, 166, 192].map((x, k) => `<path style="animation-delay:${k * 0.3}s" class="stl-mist" d="M${x} 108 q4 -8 0 -14" stroke="${M3.warm}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join("")}</g>`,
  },
  {
    id: "snow",
    name: "눈 오는 날",
    intro: "겨울밤 <b>−3℃</b>. 공기 중 수증기가 <b>눈(얼음)</b>으로 변해 내리기 시작하면 주변 온도는?",
    question: "수증기가 눈(얼음)으로 <b>승화</b>하는 동안, 주변 온도는?",
    okIdx: 1,
    before: -3,
    after: 1,
    explainGood: "정답! 기체 → 고체 승화도 <b>열에너지를 방출</b>해요. 눈 오는 날이 포근하게 느껴지는 까닭이죠.",
    explainBad: "기체가 곧장 고체가 되는 승화는 <b>열에너지를 방출</b>해요. 그래서 눈이 오면 <b>포근해져요</b>. −3℃ → 1℃.",
    why: "기체가 곧장 고체가 되는 승화도 <b>열에너지를 방출</b>해요. 그래서 포근해져요.",
    art: (ns) => `
      <rect x="0" y="0" width="248" height="180" rx="12" fill="#101A33"/>
      <path d="M0 140 q60 -14 124 0 t124 0 v40 h-248 Z" fill="#E9F2FA"/>
      <circle cx="200" cy="34" r="14" fill="#FFF3BF" opacity="0.9"/>
      <g class="${ns}-flakes stl-fx">${[[36, 34], [84, 62], [128, 28], [172, 74], [64, 104], [124, 100], [190, 110], [96, 128]].map(([x, y], k) => `<g class="stl-flake" style="animation-delay:${(k * 0.3) % 2.4}s"><path d="M${x - 5} ${y} h10 M${x} ${y - 5} v10 M${x - 3.5} ${y - 3.5} l7 7 M${x + 3.5} ${y - 3.5} l-7 7" stroke="#DCE8F5" stroke-width="1.6" stroke-linecap="round"/></g>`).join("")}</g>`,
  },
];

export const surroundTempLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as StlStep;
  const tm = m3Timers();

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    SCENES.map((sc) => ({ id: sc.id, name: sc.name, sub: "예측하고 확인" })),
    () => {
      helper.innerHTML = "정리! 열에너지를 <b>흡수</b>하는 상태 변화는 주변을 <b>시원하게</b>, <b>방출</b>하는 상태 변화는 <b>따뜻하게</b> 해요.";
      api.enableCTA(s.cta ?? "이용 정리하기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = m3Helper(SCENES[0].intro);

  const stage = el("div", { class: "stl-stage" });
  const board = el("div", { class: "mt3-board stl-board" }, stage);
  const btn = m3Btn("stl-btn", "다음 장면");
  btn.disabled = true;
  const slot = m3Slot(tm, "stl-q", btn);

  let idx = 0;
  let phase: "ask" | "ready" | "done" = "ask";

  function render(): void {
    const sc = SCENES[idx];
    const ns = `stl${idx}`;
    stage.innerHTML = `
    <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g class="stl-scene">${sc.art(ns)}</g>
      ${thermoSvg(276, 14, 96, ns, "주변 온도")}
      <text class="${ns}-tread" x="303" y="66" text-anchor="start" font-size="13" font-weight="800" fill="${M3.ink}">${m3Deg(sc.before)}</text>
    </svg>`;
    board.classList.remove("run");
    const merc = stage.querySelector(`.${ns}-merc`) as SVGRectElement;
    merc.style.transform = `scaleY(${mercOf(sc.before).toFixed(2)})`;
    merc.classList.add("stl-merc");
    helper.innerHTML = sc.intro;
    phase = "ask";
    btn.disabled = true;
    tm.later(() => askScene(sc, ns), 500);
  }

  function askScene(sc: SceneDef, ns: string): void {
    const choices = [
      { t: "낮아진다(시원해진다)", ok: sc.okIdx === 0 },
      { t: "높아진다(따뜻해진다)", ok: sc.okIdx === 1 },
      { t: "변하지 않는다", ok: false },
    ];
    slot.ask(sc.question, choices, (ok) => {
      api.recordQuiz(ok);
      board.classList.add("run");
      const merc = stage.querySelector(`.${ns}-merc`) as SVGRectElement;
      const tread = stage.querySelector(`.${ns}-tread`) as SVGTextElement;
      merc.style.transform = `scaleY(${mercOf(sc.after).toFixed(2)})`;
      tm.later(() => {
        tread.textContent = m3Deg(sc.after);
        tread.setAttribute("fill", sc.after > sc.before ? M3.hot : M3.cold);
      }, 900);
      helper.innerHTML = ok ? sc.explainGood : sc.explainBad;
      goals.collect(sc.id, ok ? "정확한 예측!" : "확인 완료");
      haptic(ok ? HAPTIC.correct : HAPTIC.wrong);
      if (idx < SCENES.length - 1) {
        phase = "ready";
        btn.disabled = false;
        btn.textContent = "다음 장면";
      } else {
        phase = "done";
      }
    }, { why: sc.why, onNext: idx < SCENES.length - 1 ? () => slot.showBtn() : undefined });
  }

  btn.addEventListener("click", () => {
    if (btn.disabled || phase !== "ready") return;
    haptic(HAPTIC.tap);
    if (idx < SCENES.length - 1) {
      idx += 1;
      render();
    }
  });

  host.append(goals.chips, helper, board, slot.el);

  render();
  api.setCTA("세 장면의 온도를 예측해 보세요", { enabled: false });
  return () => tm.clear();
};
