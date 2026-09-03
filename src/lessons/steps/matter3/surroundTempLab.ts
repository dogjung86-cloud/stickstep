// [중1 Ⅳ v3] L6 surroundTempLab — 「주변 온도 예측 랩」(교과서 3. 상태 변화와 열에너지의 이용).
// 한 통찰: 열에너지를 흡수하는 상태 변화(기화·융해·승화 고→기)가 일어나면 주변 온도가 낮아지고,
// 방출하는 상태 변화(응고·액화·승화 기→고)가 일어나면 주변 온도가 높아진다.
// 조작: 장면 3개(살수차·파라핀·눈 오는 날)를 차례로 — 예측(b4Ask) → 실행(온도계 이동) → 다음 장면(버튼, 자동 전환 없음).
// 목표 3: 살수차 → 파라핀 → 눈. rAF·캔버스 없음.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { M3, thermoSvg, stickSvg } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3AskBox, m3Goals, m3Helper, m3Reveal, m3Timers } from "./m3Lab";

interface StlStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface SceneDef {
  id: string;
  name: string;
  intro: string; // helper 도입
  question: string;
  okIdx: 0 | 1; // 0 = 내려간다, 1 = 올라간다
  before: number;
  after: number;
  explainGood: string;
  explainBad: string;
  art: (ns: string) => string;
}

const T0 = 0.25; // 온도계 기준 수은주 높이(scaleY)
/** 손 실루엣 한 경로(손목 위 → 팔꿈치 쪽 → 손날 → 손가락 네 개(아래로) → 엄지) — 벙어리장갑 모양 실격 회피, 손가락 갈림점은 밑동보다 손끝 쪽. */
const HAND_D = "M14 0 L40 0 L44 14 L48 34 L47 40 L48 66 Q48 74 42 74 Q36 74 36 66 L37 44 L35 44 L36 70 Q36 78 30 78 Q24 78 24 70 L25 44 L23 44 L24 66 Q24 74 18 74 Q12 74 12 66 L13 44 L11 44 L10 58 Q10 66 4 66 Q-2 66 -2 58 L0 40 L-10 28 Q-14 22 -9 19 Q-5 17 -1 22 L6 30 L8 14 Z";
const mercOf = (t: number): number => Math.max(0.08, Math.min(0.95, T0 + (t - 20) * 0.02));

const SCENES: SceneDef[] = [
  {
    id: "spray",
    name: "살수차",
    intro: "무더운 여름 한낮, 도로 온도계가 <b>34℃</b>예요. <b>살수차</b>가 지나가며 도로에 물을 뿌리면, 물이 <b>기화</b>하면서 주변 온도는 어떻게 될까요?",
    question: "도로의 물이 <b>기화</b>하는 동안, 주변 온도는?",
    okIdx: 0,
    before: 34,
    after: 30,
    explainGood: "정답! 물이 기화하려면 <b>열에너지를 흡수</b>해야 해요. 그 열에너지를 주변(도로와 공기)에서 빼앗아 가니 주변이 시원해지죠. 샤워 뒤 몸이 시원한 것도, 캥거루가 팔에 침을 묻히는 것도 같은 원리예요.",
    explainBad: "물이 기화할 때는 <b>열에너지를 흡수</b>해요. 그 열에너지를 주변에서 빼앗아 가니 주변 온도는 <b>낮아져요</b>. 온도계를 보세요, 34℃에서 30℃로 내려갔죠.",
    art: (ns) => `
      <rect x="0" y="120" width="230" height="60" fill="#8B95A1"/><path d="M0 150 h230" stroke="#FFF3BF" stroke-width="3" stroke-dasharray="14 10"/>
      <rect x="20" y="70" width="98" height="48" rx="8" fill="#4DABF7" stroke="#1C7ED6" stroke-width="2.4"/>
      <rect x="112" y="84" width="34" height="34" rx="5" fill="#74C0FC" stroke="#1C7ED6" stroke-width="2.4"/>
      <rect x="118" y="90" width="18" height="14" rx="3" fill="#E7F5FF"/>
      <circle cx="42" cy="122" r="10" fill="#343A40" stroke="#212529" stroke-width="2"/><circle cx="126" cy="122" r="10" fill="#343A40" stroke="#212529" stroke-width="2"/>
      <g class="${ns}-spray stl-fx">
        ${[0, 1, 2, 3, 4].map((k) => `<path d="M150 ${104 + k * 3} q20 ${8 + k * 6} 44 ${16 + k * 8}" stroke="#74C0FC" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="${0.9 - k * 0.12}"/>`).join("")}
        ${[168, 184, 200, 216].map((x, k) => `<path class="stl-mist" style="animation-delay:${k * 0.4}s" d="M${x} 118 q4 -8 0 -14 t0 -12" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.8"/>`).join("")}
        <path d="M150 128 q40 -2 80 2" stroke="#4DABF7" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
      </g>
      <circle cx="200" cy="34" r="16" fill="#FFD43B"/>`,
  },
  {
    id: "paraffin",
    name: "파라핀",
    intro: "따뜻하게 녹인 <b>액체 파라핀</b>이 담긴 통이에요. 손을 담갔다 빼면 손에 묻은 파라핀이 <b>굳어요(응고)</b>. 손 근처 온도계는 <b>30℃</b>. 파라핀이 굳는 동안 손 주변 온도는?",
    question: "손에 묻은 파라핀이 <b>응고</b>하는 동안, 손 주변 온도는?",
    okIdx: 1,
    before: 30,
    after: 34,
    explainGood: "정답! 파라핀이 굳을 때는 <b>열에너지를 방출</b>해요. 그 열에너지를 손이 받으니 손이 따뜻해지죠. 병원에서 손을 파라핀에 담그는 온열 치료가 이 원리예요.",
    explainBad: "굳는 건 응고, 응고할 때 물질은 <b>열에너지를 방출</b>해요. 그 열에너지가 손으로 옮겨 오니 손 주변 온도는 <b>높아져요</b>. 온도계를 보세요, 30℃에서 34℃로 올라갔죠.",
    art: (ns) => `
      <rect x="24" y="112" width="120" height="60" rx="10" fill="#FFF3BF" stroke="#E0B93A" stroke-width="2.4"/>
      <rect x="30" y="120" width="108" height="46" rx="7" fill="#FFE066" opacity="0.9"/>
      <text x="84" y="186" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">액체 파라핀</text>
      <g class="${ns}-hand" transform="translate(150 14)">
        <path d="${HAND_D}" fill="#FFE8CC" stroke="#C77B4A" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M18 30 q10 8 20 0 M16 42 q12 8 24 0" stroke="#D9A07A" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path class="${ns}-coat stl-fx" d="${HAND_D}" fill="#FFF3BF" stroke="#E0B93A" stroke-width="2.4" stroke-linejoin="round" opacity="0.92"/>
        <g class="stl-fx">${[-2, 24, 36].map((x) => `<path d="M${x + 12} 84 c-3 5 -3 8 0 10 c3 -2 3 -5 0 -10 Z" fill="#FFE066" stroke="#E0B93A" stroke-width="1.2"/>`).join("")}</g>
      </g>
      <g class="stl-fx">${[136, 156, 176, 196].map((x, k) => `<path style="animation-delay:${k * 0.3}s" class="stl-mist" d="M${x} 24 q4 -8 0 -14" stroke="${M3.warm}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join("")}</g>`,
  },
  {
    id: "snow",
    name: "눈 오는 날",
    intro: "겨울밤, 공기 중 <b>수증기</b>가 <b>눈 결정(얼음)</b>으로 변해 내리기 시작했어요. 눈이 오기 전 온도계는 <b>−3℃</b>. 수증기가 얼음으로 <b>승화</b>하는 동안 주변 온도는?",
    question: "수증기가 눈(얼음)으로 <b>승화</b>하는 동안, 주변 온도는?",
    okIdx: 1,
    before: -3,
    after: 1,
    explainGood: "정답! 기체에서 고체로의 승화도 <b>열에너지를 방출</b>하는 상태 변화예요. 눈이 내리는 날이 평소보다 포근하게 느껴지는 까닭이죠. 사과나무에 물을 뿌려 얼리는 것도 응고할 때 나오는 열에너지로 꽃을 지키는 방법이에요.",
    explainBad: "기체가 곧장 고체가 되는 승화는 <b>열에너지를 방출</b>하는 상태 변화예요. 그래서 눈이 내리기 시작하면 오히려 <b>포근해져요</b>. 온도계를 보세요, −3℃에서 1℃로 올라갔죠.",
    art: (ns) => `
      <rect x="0" y="0" width="230" height="180" fill="#101A33" rx="12"/>
      <path d="M0 140 q60 -14 120 0 t110 0 v40 h-230 Z" fill="#E9F2FA"/>
      <circle cx="190" cy="34" r="14" fill="#FFF3BF" opacity="0.9"/>
      <g class="${ns}-flakes stl-fx">${[[30, 30], [70, 60], [110, 24], [150, 70], [60, 100], [120, 100], [180, 96], [40, 130], [96, 128], [160, 40]].map(([x, y], k) => `<g class="stl-flake" style="animation-delay:${(k * 0.25) % 2.4}s"><path d="M${x - 5} ${y} h10 M${x} ${y - 5} v10 M${x - 3.5} ${y - 3.5} l7 7 M${x + 3.5} ${y - 3.5} l-7 7" stroke="#DCE8F5" stroke-width="1.6" stroke-linecap="round"/></g>`).join("")}</g>
      ${stickSvg(120, 100, 0.9, "smile")}`,
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
      helper.innerHTML =
        "정리! 열에너지를 <b>흡수</b>하는 상태 변화(융해·기화·승화 고→기)가 일어나면 주변 온도가 <b>낮아지고</b>(살수차·아이스크림 상자 속 드라이아이스), 열에너지를 <b>방출</b>하는 상태 변화(액화·응고·승화 기→고)가 일어나면 주변 온도가 <b>높아져요</b>(파라핀 온열 치료·사과나무에 물 뿌려 얼리기·눈 오는 날의 포근함).";
      api.enableCTA(s.cta ?? "이용 정리하기");
    },
  );
  const helper = m3Helper(SCENES[0].intro);

  const tabs = el("div", { class: "stl-tabs" }, ...SCENES.map((sc, i) => el("button", { class: `stl-tab${i === 0 ? " cur" : ""}`, text: sc.name, attrs: { type: "button", disabled: "true" } })));
  const stage = el("div", { class: "stl-stage" });
  const board = el("div", { class: "mt3-board stl-board" }, stage);
  const btn = el("button", { class: "mt3-btn stl-btn", text: "다음 장면", attrs: { type: "button" } }) as HTMLButtonElement;
  btn.disabled = true;
  const btnRow = el("div", { class: "mt3-btnrow" }, btn);
  const qBox = m3AskBox("stl-q mt3-q");

  let idx = 0;
  let phase: "ask" | "run" | "ready" | "done" = "ask";

  function render(): void {
    const sc = SCENES[idx];
    const ns = `stl${idx}`;
    stage.innerHTML = `
    <svg viewBox="0 0 340 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g class="stl-scene">${sc.art(ns)}</g>
      <rect x="240" y="8" width="94" height="176" rx="12" fill="#FFFFFF" stroke="#E5DFF7" stroke-width="1.6"/>
      ${thermoSvg(268, 26, 100, ns, "주변 온도")}
      <text class="${ns}-tread" x="300" y="76" text-anchor="start" font-size="13" font-weight="800" fill="${M3.ink}">${sc.before < 0 ? "−" + Math.abs(sc.before) : sc.before}℃</text>
    </svg>`;
    board.classList.remove("run");
    const merc = stage.querySelector(`.${ns}-merc`) as SVGRectElement;
    merc.style.transform = `scaleY(${mercOf(sc.before).toFixed(2)})`;
    merc.classList.add("stl-merc");
    tabs.querySelectorAll(".stl-tab").forEach((t, i) => {
      t.classList.toggle("cur", i === idx);
      t.classList.toggle("done", i < idx);
    });
    helper.innerHTML = sc.intro;
    phase = "ask";
    btn.disabled = true;
    btn.textContent = idx < SCENES.length - 1 ? "다음 장면" : "마지막 장면";
    tm.later(() => askScene(sc, ns), 500);
  }

  function askScene(sc: SceneDef, ns: string): void {
    const choices = [
      { t: "낮아진다(시원해진다)", ok: sc.okIdx === 0 },
      { t: "높아진다(따뜻해진다)", ok: sc.okIdx === 1 },
      { t: "변하지 않는다", ok: false },
    ];
    b4Ask(qBox, sc.question, choices, (ok) => {
      api.recordQuiz(ok);
      phase = "run";
      board.classList.add("run");
      const merc = stage.querySelector(`.${ns}-merc`) as SVGRectElement;
      const tread = stage.querySelector(`.${ns}-tread`) as SVGTextElement;
      merc.style.transform = `scaleY(${mercOf(sc.after).toFixed(2)})`;
      tm.later(() => {
        tread.textContent = `${sc.after < 0 ? "−" + Math.abs(sc.after) : sc.after}℃`;
        tread.setAttribute("fill", sc.after > sc.before ? M3.hot : M3.cold);
      }, 900);
      helper.innerHTML = ok ? sc.explainGood : sc.explainBad;
      goals.collect(sc.id, ok ? "정확한 예측!" : "확인 완료");
      haptic(ok ? HAPTIC.correct : HAPTIC.wrong);
      phase = "ready";
      if (idx < SCENES.length - 1) {
        btn.disabled = false;
        btn.textContent = "다음 장면";
      } else {
        btn.textContent = "세 장면 완료";
      }
    });
    m3Reveal(tm, qBox);
  }

  btn.addEventListener("click", () => {
    if (btn.disabled || phase !== "ready") return;
    haptic(HAPTIC.tap);
    if (idx < SCENES.length - 1) {
      idx += 1;
      qBox.innerHTML = "";
      qBox.classList.remove("show");
      qBox.style.display = "none";
      render();
    }
  });

  host.append(goals.chips, helper, tabs, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  render();
  api.setCTA("세 장면의 온도를 예측해 보세요", { enabled: false });
  return () => tm.clear();
};
