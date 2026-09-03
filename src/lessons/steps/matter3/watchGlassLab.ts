// [중1 Ⅳ v3] L3 watchGlassLab — 「시계 접시 실험, 변하는 것과 변하지 않는 것」(교과서 해 보기 재현).
// 한 통찰: 얼음이 녹고(융해) 물이 수증기가 되고(기화) 수증기가 다시 물방울이 되어도(액화) 물질의 성질은 변하지 않는다
// (푸른색 염화 코발트 종이가 비커의 물에도 접시 밑 물방울에도 똑같이 붉게 변한다).
// 조작: 관찰 시작(버튼) → 물방울 정체 판정 → 염화 코발트 종이 대기(버튼) → 성질 판정.
// 목표 3: 관찰 → 물방울 판정 → 성질 검사. rAF·캔버스 없음.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { M3, flameSvg, burnerSvg } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3AskBox, m3Goals, m3Helper, m3Reveal, m3Timers } from "./m3Lab";

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
      helper.innerHTML =
        "정리! 접시 위 얼음은 <b>융해</b>, 비커의 물은 <b>기화</b>, 접시 아랫면의 물방울은 수증기의 <b>액화</b>예요. 그리고 비커의 물과 접시 밑 물방울에 댄 종이가 <b>둘 다 붉게</b> 변했죠. 상태가 변해도 <b>물질의 성질은 변하지 않는다</b>는 증거예요.";
      api.enableCTA(s.cta ?? "승화 실험으로");
    },
  );
  const helper = m3Helper("<b>뜨거운 물</b>이 든 비커 위에 <b>얼음</b>을 담은 시계 접시를 올렸어요. 아래 버튼으로 관찰을 시작하고, 접시의 <b>위</b>와 <b>아래</b>, 비커의 <b>물</b>에서 무슨 일이 일어나는지 보세요.");

  const stage = el("div", { class: "wgl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 226" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="wglIceG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#DDEFFF"/><stop offset="1" stop-color="#B7D9F5"/></linearGradient>
      <linearGradient id="wglWaterG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9BD5FF"/><stop offset="1" stop-color="#4A9BDA"/></linearGradient>
      <radialGradient id="wglDropG" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#E6F5FF"/><stop offset="1" stop-color="#6CB6EC"/></radialGradient>
    </defs>
    <ellipse cx="130" cy="216" rx="90" ry="6" fill="#2A3A5E" opacity="0.10"/>
    ${burnerSvg(130, 200, 90)}
    ${flameSvg(130, 200, 1, "wgl")}
    <rect class="wgl-water" x="83" y="118" width="94" height="72" rx="6" fill="url(#wglWaterG)" opacity="0.8"/>
    <g class="wgl-steamg">
      ${[104, 124, 144, 160].map((x, i) => `<path class="wgl-steam" style="animation-delay:${i * 0.5}s" d="M${x} 112 q6 -10 0 -18 t0 -18" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("")}
    </g>
    <path d="M80 60 v128 a10 10 0 0 0 10 10 h80 a10 10 0 0 0 10 -10 v-128" fill="none" stroke="${M3.glass}" stroke-width="3"/>
    <path d="M74 60 h112" stroke="${M3.glass}" stroke-width="3" stroke-linecap="round"/>
    <path d="M90 76 v96" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
    <g class="wgl-drops">
      ${[104, 120, 136, 152].map((x, i) => `<path class="wgl-drop" data-i="${i}" d="M${x} 62 c-4 6 -4 10 0 12 c4 -2 4 -6 0 -12 Z" fill="url(#wglDropG)" stroke="#5BA7E0" stroke-width="1" style="transform: scale(0)"/>`).join("")}
    </g>
    <path d="M66 58 q64 22 128 0" fill="#EAF4FB" stroke="${M3.glass}" stroke-width="3" opacity="0.9"/>
    <path d="M66 58 q64 -6 128 0" fill="none" stroke="${M3.glass}" stroke-width="2"/>
    <g class="wgl-ices">
      <g class="wgl-ice" data-i="0"><rect x="98" y="34" width="26" height="22" rx="5" fill="url(#wglIceG)" stroke="#8FC1E8" stroke-width="1.6"/></g>
      <g class="wgl-ice" data-i="1"><rect x="128" y="38" width="24" height="18" rx="5" fill="url(#wglIceG)" stroke="#8FC1E8" stroke-width="1.6"/></g>
    </g>
    <path class="wgl-melt" d="M92 56 q38 8 76 0" stroke="#6CB6EC" stroke-width="3" fill="none" stroke-linecap="round" opacity="0"/>
    <g class="wgl-tag wgl-tag-top"><rect x="196" y="30" width="118" height="26" rx="8" fill="#FFFFFF" stroke="${M3.matter}" stroke-width="1.8"/><text x="255" y="48" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.matterDeep}">접시 위: 얼음이 녹아요</text></g>
    <g class="wgl-tag wgl-tag-bot"><rect x="196" y="66" width="118" height="26" rx="8" fill="#FFFFFF" stroke="${M3.matter}" stroke-width="1.8"/><text x="255" y="84" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.matterDeep}">접시 밑: 물방울이 맺혀요</text></g>
    <g class="wgl-tag wgl-tag-water"><rect x="196" y="122" width="118" height="26" rx="8" fill="#FFFFFF" stroke="${M3.matter}" stroke-width="1.8"/><text x="255" y="140" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.matterDeep}">비커: 김이 올라와요</text></g>
    <g class="wgl-strips" opacity="0">
      <rect class="wgl-strip wgl-strip-a" x="150" y="130" width="12" height="40" rx="2" fill="#4C6EF5" stroke="#364FC7" stroke-width="1.2" transform="rotate(-18 156 150)"/>
      <rect class="wgl-strip wgl-strip-b" x="116" y="64" width="12" height="30" rx="2" fill="#4C6EF5" stroke="#364FC7" stroke-width="1.2" transform="rotate(12 122 79)"/>
      <text class="wgl-striptxt" x="255" y="178" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">푸른색 염화 코발트 종이</text>
    </g>
    <text x="130" y="24" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">얼음을 담은 시계 접시</text>
  </svg>`;
  const board = el("div", { class: "mt3-board wgl-board" }, stage);

  const btn = el("button", { class: "mt3-btn wgl-btn", text: "관찰 시작", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnRow = el("div", { class: "mt3-btnrow" }, btn);
  const qBox = m3AskBox("wgl-q mt3-q");

  const ices = Array.from(stage.querySelectorAll<SVGGElement>(".wgl-ice"));
  const drops = Array.from(stage.querySelectorAll<SVGPathElement>(".wgl-drop"));
  const melt = stage.querySelector(".wgl-melt") as SVGPathElement;
  const tagTop = stage.querySelector(".wgl-tag-top") as SVGGElement;
  const tagBot = stage.querySelector(".wgl-tag-bot") as SVGGElement;
  const tagWater = stage.querySelector(".wgl-tag-water") as SVGGElement;
  const strips = stage.querySelector(".wgl-strips") as SVGGElement;
  const stripA = stage.querySelector(".wgl-strip-a") as SVGRectElement;
  const stripB = stage.querySelector(".wgl-strip-b") as SVGRectElement;
  const striptxt = stage.querySelector(".wgl-striptxt") as SVGTextElement;

  type Phase = "idle" | "run" | "ranAsk" | "paperReady" | "paper" | "done";
  let phase: Phase = "idle";

  function tick(i: number): void {
    const t = i / N_TICK;
    ices.forEach((g, k) => { g.style.transform = `scaleY(${(1 - 0.55 * t - k * 0.05).toFixed(2)}) scaleX(${(1 - 0.25 * t).toFixed(2)})`; });
    melt.setAttribute("opacity", Math.min(0.9, t * 1.2).toFixed(2));
    drops.forEach((d, k) => { d.style.transform = `scale(${Math.max(0, Math.min(1, (t - 0.25 - k * 0.1) * 2.2)).toFixed(2)})`; });
    if (i === 3) tagWater.classList.add("on");
    if (i === 6) tagTop.classList.add("on");
    if (i === 11) tagBot.classList.add("on");
    if (i >= N_TICK) {
      phase = "ranAsk";
      goals.collect("watch", "세 곳 다 봄!");
      haptic(HAPTIC.correct);
      btn.textContent = "관찰 끝";
      helper.innerHTML = "접시 위 얼음은 <b>녹아 물</b>이 되고, 비커의 물에서는 <b>김</b>이 오르고, 접시 <b>아랫면</b>에는 물방울이 맺혔어요. 그런데 접시 아랫면의 물방울은 대체 어디서 온 걸까요?";
      tm.later(askDrop, 700);
      return;
    }
    tm.later(() => tick(i + 1), 220);
  }

  function askDrop(): void {
    b4Ask(
      qBox,
      "접시 <b>아랫면의 물방울</b>은 어떻게 생긴 걸까요?",
      [
        { t: "비커에서 올라온 수증기가 차가운 접시에 닿아 물로 변했다", ok: true },
        { t: "접시 위의 얼음이 녹아 접시 가장자리로 새어 나왔다", ok: false },
        { t: "비커의 물이 튀어 올라 접시 밑에 붙었다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 비커의 물이 <b>기화</b>해 올라온 수증기가 차가운 접시 아랫면에 닿아 다시 물로 변한 거예요. 이게 <b>액화</b>죠. 그럼 이 물방울은 정말 '물'일까요? 아래 버튼으로 <b>푸른색 염화 코발트 종이</b>를 대어 확인해요."
          : "접시 위의 얼음물이 새어 나온 것도, 물이 튄 것도 아니에요. 비커의 물이 <b>기화</b>해 올라온 수증기가 차가운 접시에 닿아 다시 물로 변한(<b>액화</b>) 거예요. 정말 물인지 <b>푸른색 염화 코발트 종이</b>로 확인해요.";
        goals.collect("drop", ok ? "정확한 판정!" : "판정 완료");
        phase = "paperReady";
        btn.textContent = "염화 코발트 종이 대기";
        btn.disabled = false;
      },
    );
    m3Reveal(tm, qBox);
  }

  function doPaper(): void {
    phase = "paper";
    btn.disabled = true;
    btn.textContent = "색이 변하는 중…";
    strips.setAttribute("opacity", "1");
    helper.innerHTML = "푸른색 염화 코발트 종이는 <b>물을 만나면 붉게</b> 변하는 종이예요. 하나는 비커의 물에, 하나는 접시 밑 물방울에 댔어요.";
    tm.later(() => {
      stripA.setAttribute("fill", "#F03E3E");
      stripB.setAttribute("fill", "#F03E3E");
      stripA.setAttribute("stroke", "#B02A2A");
      stripB.setAttribute("stroke", "#B02A2A");
      striptxt.textContent = "둘 다 붉게 변했어요";
      striptxt.setAttribute("fill", M3.hot);
    }, 900);
    tm.later(() => {
      haptic(HAPTIC.correct);
      btn.textContent = "검사 끝";
      helper.innerHTML = "<b>두 종이 모두</b> 붉게 변했어요. 비커의 물도, 접시 밑 물방울도 종이를 똑같이 붉게 만들었죠. 이건 무엇을 뜻할까요?";
      tm.later(askPaper, 600);
    }, 2200);
  }

  function askPaper(): void {
    b4Ask(
      qBox,
      "비커의 물과 접시 밑 물방울에 댄 종이가 <b>둘 다 붉게</b> 변한 것은 무엇을 뜻하나요?",
      [
        { t: "물이 수증기가 되었다가 다시 물이 되어도 성질은 변하지 않는다", ok: true },
        { t: "뜨거운 비커의 열이 종이의 색을 바꾸었다", ok: false },
        { t: "얼음이 녹은 물이 새어 나와 종이를 적셨다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 물 → 수증기 → 물로 상태가 두 번 변했는데도 <b>종이를 붉게 만드는 물의 성질</b>은 그대로였어요. 상태가 변해도 <b>물질의 성질은 변하지 않는다</b>는 증거예요."
          : "열이 종이를 바꾼 게 아니라(그래서 접시 밑 차가운 물방울에서도 붉어졌죠), 얼음물이 샌 것도 아니에요. 물 → 수증기 → 물로 상태가 변해도 <b>물의 성질은 그대로</b>라서 두 종이가 똑같이 붉어진 거랍니다.";
        goals.collect("paper", ok ? "정확한 판정!" : "판정 완료");
        phase = "done";
      },
    );
    m3Reveal(tm, qBox);
  }

  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    haptic(HAPTIC.tap);
    if (phase === "idle") {
      phase = "run";
      btn.disabled = true;
      btn.textContent = "관찰 중…";
      board.classList.add("running");
      helper.innerHTML = "관찰 시작! 접시 위·접시 아래·비커의 물, 세 곳을 보세요.";
      tm.later(() => tick(1), 400);
    } else if (phase === "paperReady") {
      doPaper();
    }
  });

  host.append(goals.chips, helper, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("관찰 시작 버튼을 누르세요", { enabled: false });
  return () => tm.clear();
};
