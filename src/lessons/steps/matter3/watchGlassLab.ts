// [중1 Ⅳ v3] L3 watchGlassLab — 「시계 접시 실험」(교과서 해 보기 재현).
// 한 통찰: 얼음이 녹고(융해) 물이 수증기가 되고(기화) 수증기가 다시 물방울이 되어도(액화) 물질의 성질은 변하지 않는다
// (푸른색 염화 코발트 종이가 비커의 물에도 접시 밑 물방울에도 똑같이 붉게 변한다).
// 조작: 관찰 시작(버튼) → 물방울 정체 판정 → 염화 코발트 종이 대기(버튼) → 성질 판정.
// 한 화면 예산: 무대 안 설명 태그·제목 글자 제거(helper가 말한다), 종이 2장은 검사 국면에만.
// 목표 3: 관찰 → 물방울 판정 → 성질 검사. rAF·캔버스 없음.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { M3, flameSvg, burnerSvg } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3Btn, m3Goals, m3Helper, m3Slot, m3Timers } from "./m3Lab";

interface WglStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N_TICK = 18;

export const watchGlassLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as WglStep;
  const tm = m3Timers();

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "watch", name: "관찰", sub: "세 가지 변화" },
      { id: "drop", name: "물방울 정체", sub: "관찰 뒤" },
      { id: "paper", name: "성질 검사", sub: "종이 대기" },
    ],
    () => {
      helper.innerHTML = "정리! 얼음은 융해, 물은 기화, 접시 밑 물방울은 액화. 상태가 바뀌어도 <b>성질은 그대로</b>예요.";
      api.enableCTA(s.cta ?? "승화 실험으로");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = m3Helper("<b>뜨거운 물</b> 비커 위에 <b>얼음</b>을 담은 시계 접시를 올렸어요. 관찰을 시작해요.");

  const stage = el("div", { class: "wgl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="wglIceG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#DDEFFF"/><stop offset="1" stop-color="#B7D9F5"/></linearGradient>
      <linearGradient id="wglWaterG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9BD5FF"/><stop offset="1" stop-color="#4A9BDA"/></linearGradient>
      <radialGradient id="wglDropG" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#E6F5FF"/><stop offset="1" stop-color="#6CB6EC"/></radialGradient>
    </defs>
    <ellipse cx="170" cy="172" rx="90" ry="5" fill="#2A3A5E" opacity="0.10"/>
    ${burnerSvg(170, 156, 90)}
    ${flameSvg(170, 156, 0.9, "wgl")}
    <rect class="wgl-water" x="123" y="92" width="94" height="56" rx="6" fill="url(#wglWaterG)" opacity="0.8"/>
    <g class="wgl-steamg">
      ${[144, 170, 196].map((x, i) => `<path class="wgl-steam" style="animation-delay:${i * 0.5}s" d="M${x} 88 q6 -10 0 -18 t0 -18" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("")}
    </g>
    <path d="M120 46 v98 a10 10 0 0 0 10 10 h80 a10 10 0 0 0 10 -10 v-98" fill="none" stroke="${M3.glass}" stroke-width="3"/>
    <path d="M114 46 h112" stroke="${M3.glass}" stroke-width="3" stroke-linecap="round"/>
    <g class="wgl-drops">
      ${[146, 170, 194].map((x, i) => `<path class="wgl-drop" data-i="${i}" d="M${x} 48 c-4 6 -4 10 0 12 c4 -2 4 -6 0 -12 Z" fill="url(#wglDropG)" stroke="#5BA7E0" stroke-width="1" style="transform: scale(0)"/>`).join("")}
    </g>
    <path d="M106 44 q64 22 128 0" fill="#EAF4FB" stroke="${M3.glass}" stroke-width="3" opacity="0.9"/>
    <path d="M106 44 q64 -6 128 0" fill="none" stroke="${M3.glass}" stroke-width="2"/>
    <g class="wgl-ice" data-i="0"><rect x="156" y="20" width="28" height="22" rx="5" fill="url(#wglIceG)" stroke="#8FC1E8" stroke-width="1.6"/></g>
    <path class="wgl-melt" d="M132 42 q38 8 76 0" stroke="#6CB6EC" stroke-width="3" fill="none" stroke-linecap="round" opacity="0"/>
    <g class="wgl-strips">
      <rect class="wgl-strip wgl-strip-a" x="188" y="104" width="12" height="38" rx="2" fill="#4C6EF5" stroke="#364FC7" stroke-width="1.2" transform="rotate(-18 194 123)"/>
      <rect class="wgl-strip wgl-strip-b" x="252" y="50" width="12" height="30" rx="2" fill="#4C6EF5" stroke="#364FC7" stroke-width="1.2" transform="rotate(12 258 65)"/>
      <path d="M258 64 L214 52" stroke="#8B95A1" stroke-width="1.4" stroke-dasharray="3 3"/>
    </g>
  </svg>`;
  const board = el("div", { class: "mt3-board wgl-board" }, stage);

  const btn = m3Btn("wgl-btn", "관찰 시작");
  const slot = m3Slot(tm, "wgl-q", btn);

  const ice = stage.querySelector(".wgl-ice") as SVGGElement;
  const drops = Array.from(stage.querySelectorAll<SVGPathElement>(".wgl-drop"));
  const melt = stage.querySelector(".wgl-melt") as SVGPathElement;
  const stripA = stage.querySelector(".wgl-strip-a") as SVGRectElement;
  const stripB = stage.querySelector(".wgl-strip-b") as SVGRectElement;

  type Phase = "idle" | "run" | "ranAsk" | "paperReady" | "paper" | "done";
  let phase: Phase = "idle";

  function tick(i: number): void {
    const t = i / N_TICK;
    ice.style.transform = `scaleY(${(1 - 0.55 * t).toFixed(2)}) scaleX(${(1 - 0.25 * t).toFixed(2)})`;
    melt.setAttribute("opacity", Math.min(0.9, t * 1.2).toFixed(2));
    drops.forEach((d, k) => { d.style.transform = `scale(${Math.max(0, Math.min(1, (t - 0.25 - k * 0.1) * 2.2)).toFixed(2)})`; });
    if (i >= N_TICK) {
      phase = "ranAsk";
      goals.collect("watch", "세 곳 다 봄!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "얼음은 녹고, 비커에선 김이 오르고, 접시 <b>아랫면</b>엔 물방울이 맺혔어요.";
      tm.later(askDrop, 700);
      return;
    }
    tm.later(() => tick(i + 1), 220);
  }

  function askDrop(): void {
    slot.ask(
      "접시 <b>아랫면의 물방울</b>은 어떻게 생겼을까요?",
      [
        { t: "수증기가 차가운 접시에 닿아 물이 됐다", ok: true },
        { t: "접시 위 얼음물이 새어 나왔다", ok: false },
        { t: "비커의 물이 튀어 붙었다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 물이 <b>기화</b>해 오른 수증기가 차가운 접시에서 다시 물이 됐어요(<b>액화</b>). 정말 물일까요?"
          : "샌 것도 튄 것도 아니에요. <b>기화</b>한 수증기가 차가운 접시에서 다시 물이 된(<b>액화</b>) 거예요.";
        goals.collect("drop", ok ? "정확한 판정!" : "판정 완료");
        phase = "paperReady";
        btn.textContent = "염화 코발트 종이 대기";
        btn.disabled = false;
        slot.showBtn();
      },
    );
  }

  function doPaper(): void {
    phase = "paper";
    btn.disabled = true;
    btn.textContent = "색이 변하는 중…";
    board.classList.add("paper");
    helper.innerHTML = "<b>푸른색 염화 코발트 종이</b>는 물을 만나면 붉게 변해요. 비커 물과 접시 밑 물방울에 댔어요.";
    tm.later(() => {
      [stripA, stripB].forEach((r) => { r.setAttribute("fill", "#F03E3E"); r.setAttribute("stroke", "#B02A2A"); });
    }, 900);
    tm.later(() => {
      haptic(HAPTIC.correct);
      helper.innerHTML = "<b>두 종이 모두</b> 붉게 변했어요. 이건 무엇을 뜻할까요?";
      tm.later(askPaper, 600);
    }, 2200);
  }

  function askPaper(): void {
    slot.ask(
      "두 종이가 <b>똑같이 붉게</b> 변한 것은 무엇을 뜻하나요?",
      [
        { t: "상태가 변해도 물의 성질은 변하지 않는다", ok: true },
        { t: "비커의 열이 종이 색을 바꿨다", ok: false },
        { t: "얼음 녹은 물이 종이를 적셨다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 물 → 수증기 → 물로 두 번 변했어도 <b>물의 성질은 그대로</b>였어요."
          : "차가운 접시 밑에서도 붉어졌으니 열 때문이 아니에요. 상태가 변해도 <b>물의 성질은 그대로</b>예요.";
        goals.collect("paper", ok ? "정확한 판정!" : "판정 완료");
        phase = "done";
      },
    );
  }

  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    haptic(HAPTIC.tap);
    if (phase === "idle") {
      phase = "run";
      btn.disabled = true;
      btn.textContent = "관찰 중…";
      board.classList.add("running");
      helper.innerHTML = "접시 위, 접시 아래, 비커의 물. 세 곳을 보세요.";
      tm.later(() => tick(1), 400);
    } else if (phase === "paperReady") {
      doPaper();
    }
  });

  host.append(goals.chips, helper, board, slot.el);

  api.setCTA("관찰 시작 버튼을 누르세요", { enabled: false });
  return () => tm.clear();
};
