// [중2 Ⅴ v3] L4 flipEngineLab — 「거꾸로 엔진」.
// 한 통찰: 호흡은 광합성의 거꾸로 — 포도당과 산소로 에너지를 꺼내고(이산화 탄소·물 생성),
// 낮이든 밤이든 항상 돌아간다. (교과서 184~185쪽 비교표·기체 출입의 서사판)
// 조작: 뒤집기 버튼 → 식이 반전(crossfade) → 에너지 번개 탭 → 낮/밤 토글 → 판정.
// rAF·캔버스 없음 — 장면 2벌 crossfade(starchQuest 문법). 타이머는 Set으로 cleanup.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { P3 } from "../../../ui/plant3Kit";
import type { StepRenderer } from "../../types";

interface FpeStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 물질 칩 — 알약형 라벨(색은 P3 시맨틱). */
const chip = (x: number, y: number, w: number, label: string, c: string): string =>
  `<g><rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="13" fill="#FFFFFF" stroke="${c}" stroke-width="2.4"/>
   <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">${label}</text></g>`;

/** 무대 — 낮/밤 배경 + 세포 엔진(마이토콘드리아·표시등) + 광합성/호흡 장면 2벌. */
function stageScene(): string {
  return `<svg viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="fpeCell" cx="0.4" cy="0.32" r="1">
        <stop offset="0" stop-color="#FFFDF4"/><stop offset="0.7" stop-color="#F6EFD8"/><stop offset="1" stop-color="#EADFBE"/>
      </radialGradient>
    </defs>
    <g class="fpe-sky-day">
      <circle cx="42" cy="34" r="15" fill="${P3.light}"/>
      <path d="M42 13 v6 M42 49 v6 M21 34 h6 M57 34 h6 M27 19 l4 4 M53 45 l4 4 M57 19 l-4 4 M31 45 l-4 4" stroke="${P3.light}" stroke-width="2.6" stroke-linecap="round"/>
    </g>
    <g class="fpe-sky-night">
      <path d="M52 22 a13 13 0 1 0 6 24 a10.5 10.5 0 0 1 -6 -24" fill="#8B95A1"/>
      <circle cx="80" cy="20" r="1.8" fill="#B9C2CC"/><circle cx="26" cy="52" r="1.5" fill="#B9C2CC"/>
    </g>
    <ellipse cx="170" cy="208" rx="132" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <!-- 세포 엔진 -->
    <rect x="128" y="76" width="84" height="84" rx="22" fill="url(#fpeCell)" stroke="#B99655" stroke-width="3"/>
    <path d="M150 96 c8 -10 24 -12 34 -4 c-2 12 -14 20 -26 18 c-8 -2 -11 -8 -8 -14 Z" fill="#F03E3E" stroke="#B02525" stroke-width="2.6"/>
    <path d="M156 100 c6 -5 14 -6 20 -3 M154 106 c6 -4 14 -5 20 -3" stroke="#FFD3D3" stroke-width="2" stroke-linecap="round"/>
    <circle class="fpe-engine-light" cx="196" cy="142" r="7" fill="#20C997" stroke="#0CA678" stroke-width="2.2"/>
    <path class="fpe-gear" d="M146 138 l4 -2 1 -5 5 1 3 -4 4 3 5 -1 1 5 4 2 -2 5 2 5 -4 2 -1 5 -5 -1 -4 3 -3 -4 -5 1 -1 -5 -4 -2 2 -5 Z" fill="#C9CDD2" stroke="#8B95A1" stroke-width="1.8"/>
    <!-- 광합성 배열(A): 왼쪽 in CO₂·물, 오른쪽 out 포도당·산소, 위 빛에너지 in -->
    <g class="fpe-scA">
      ${chip(64, 100, 92, "이산화 탄소", P3.co2)}
      ${chip(64, 138, 46, "물", P3.water)}
      ${chip(276, 100, 66, "포도당", P3.glucose)}
      ${chip(276, 138, 54, "산소", P3.o2)}
      <path d="M96 168 q74 30 148 0" stroke="#B9C2CC" stroke-width="2.4" stroke-dasharray="5 5" fill="none"/>
      <path d="M112 100 h12 M118 96 l8 4 -8 4 Z" stroke="${P3.co2}" stroke-width="2.6" fill="${P3.co2}" stroke-linecap="round"/>
      <path d="M90 138 h34 M118 134 l8 4 -8 4 Z" stroke="${P3.water}" stroke-width="2.6" fill="${P3.water}" stroke-linecap="round"/>
      <path d="M216 100 h12 M222 96 l8 4 -8 4 Z" stroke="${P3.glucose}" stroke-width="2.6" fill="${P3.glucose}" stroke-linecap="round"/>
      <path d="M216 138 h27 M237 134 l8 4 -8 4 Z" stroke="${P3.o2}" stroke-width="2.6" fill="${P3.o2}" stroke-linecap="round"/>
      ${chip(170, 34, 78, "빛에너지", "#B8860B")}
      <path d="M170 50 v14 M166 58 l4 8 4 -8 Z" stroke="${P3.light}" stroke-width="2.8" fill="${P3.light}" stroke-linecap="round"/>
    </g>
    <!-- 호흡 배열(B): 왼쪽 in 포도당·산소, 오른쪽 out 이산화 탄소·물, 위 에너지 out -->
    <g class="fpe-scB">
      ${chip(64, 100, 66, "포도당", P3.glucose)}
      ${chip(64, 138, 54, "산소", P3.o2)}
      ${chip(276, 100, 92, "이산화 탄소", P3.co2)}
      ${chip(276, 138, 46, "물", P3.water)}
      <path d="M100 100 h24 M118 96 l8 4 -8 4 Z" stroke="${P3.glucose}" stroke-width="2.6" fill="${P3.glucose}" stroke-linecap="round"/>
      <path d="M94 138 h30 M118 134 l8 4 -8 4 Z" stroke="${P3.o2}" stroke-width="2.6" fill="${P3.o2}" stroke-linecap="round"/>
      <path d="M216 100 h8 M218 96 l8 4 -8 4 Z" stroke="${P3.co2}" stroke-width="2.6" fill="${P3.co2}" stroke-linecap="round"/>
      <path d="M216 138 h30 M240 134 l8 4 -8 4 Z" stroke="${P3.water}" stroke-width="2.6" fill="${P3.water}" stroke-linecap="round"/>
      <g class="fpe-bolt" role="button" tabindex="0" aria-label="에너지 번개 탭">
        <rect x="152" y="8" width="62" height="62" rx="14" fill="none" pointer-events="all"/>
        <path d="M178 18 l-14 24 h10 l-9 22 l22 -28 h-10 l9 -18 Z" fill="${P3.energy}" stroke="#E8A80C" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M196 20 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 Z" fill="#FFF3BF"/>
      </g>
      <path d="M170 74 v-8 M166 70 l4 -8 4 8 Z" stroke="${P3.energy}" stroke-width="2.8" fill="${P3.energy}" stroke-linecap="round"/>
    </g>
  </svg>`;
}

export const flipEngineLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as FpeStep;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge p3", dataset: { g: "flip" } }, el("b", { text: "식 뒤집기" }), el("span", { text: "버튼 대기" })),
    el("div", { class: "pn-badge p3", dataset: { g: "energy" } }, el("b", { text: "에너지 확인" }), el("span", { text: "번개 탭" })),
    el("div", { class: "pn-badge p3", dataset: { g: "always" } }, el("b", { text: "언제일까" }), el("span", { text: "낮·밤 실험" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "지난 시간의 <b>광합성 식</b>이에요(빛에너지로 재료 → 양분). 세포가 이 양분에서 에너지를 꺼낼 땐 어떻게 할까요? 아래 <b>뒤집기 버튼</b>을 눌러 보세요.",
  });

  const board = el("div", { class: "p3-board fpe-board day", html: stageScene() });

  const flipBtn = el("button", { class: "fpe-btn", text: "식 뒤집기", attrs: { type: "button" } }) as HTMLButtonElement;
  const dayBtn = el("button", { class: "fpe-seg", text: "낮으로", attrs: { type: "button" } }) as HTMLButtonElement;
  const nightBtn = el("button", { class: "fpe-seg", text: "밤으로", attrs: { type: "button" } }) as HTMLButtonElement;
  const segRow = el("div", { class: "fpe-segrow" }, dayBtn, nightBtn);
  segRow.style.display = "none";
  const btnRow = el("div", { class: "fpe-btnrow" }, flipBtn);

  const qBox = el("div", { class: "hook-choices fpe-q" });
  qBox.style.display = "none";

  const goals = new Set<string>();
  let finished = false;
  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chipEl = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chipEl.classList.add("on");
    chipEl.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! <b>호흡 = 포도당 + 산소 → 이산화 탄소 + 물 + 에너지</b>. 광합성의 거꾸로 방향이고, 낮이든 밤이든 <b>항상</b> 돌아가는 생명의 엔진이에요.";
      api.enableCTA(s.cta ?? "호흡 정리하기");
    }
  }

  // ── 1. 뒤집기 ──
  let flipped = false;
  flipBtn.addEventListener("click", () => {
    if (flipped) return;
    flipped = true;
    haptic(HAPTIC.tap);
    board.classList.add("rev");
    flipBtn.disabled = true;
    helper.innerHTML =
      "식이 뒤집혔어요! 이번엔 <b>포도당과 산소가 들어가고, 이산화 탄소와 물이 나와요</b>. 그리고 위쪽에 처음 보는 것이 하나, 반짝이는 <b>번개</b>를 탭해 보세요.";
    later(() => collect("flip", "거꾸로 방향!"), 700);
  });

  // ── 2. 에너지 번개 ──
  let boltDone = false;
  const boltHandler = (ev: Event): void => {
    const t = ev.target as Element | null;
    if (!t || !t.closest(".fpe-bolt") || !flipped || boltDone) return;
    boltDone = true;
    haptic(HAPTIC.correct);
    board.classList.add("boom");
    helper.innerHTML =
      "이게 호흡의 목적, <b>에너지</b>예요! 양분(포도당)에 저장돼 있던 에너지를 꺼내는 거죠. 식물은 이 에너지로 <b>자라고, 꽃을 피우고, 살아가요</b>. 그럼 이 엔진은 언제 돌까요? 아래 <b>낮·밤 버튼</b>으로 시험해 보세요.";
    collect("energy", "양분 속 에너지!");
    segRow.style.display = "";
    later(() => segRow.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  };
  board.addEventListener("click", boltHandler);
  board.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if ((k.key === " " || k.key === "Enter") && (k.target as Element)?.closest(".fpe-bolt")) {
      k.preventDefault();
      boltHandler(e);
    }
  });

  // ── 3. 낮·밤 토글 ──
  const seen = new Set<string>();
  function setTime(mode: "day" | "night"): void {
    if (!boltDone) return;
    haptic(HAPTIC.tap);
    board.classList.toggle("day", mode === "day");
    board.classList.toggle("night", mode === "night");
    dayBtn.classList.toggle("cur", mode === "day");
    nightBtn.classList.toggle("cur", mode === "night");
    seen.add(mode);
    if (!goals.has("always")) {
      helper.innerHTML =
        mode === "night"
          ? "깜깜한 밤, 그런데 엔진 표시등은 <b>여전히 초록불</b>이에요. 호흡이 계속되고 있다는 뜻!"
          : "환한 낮, 광합성이 활발한 시간이지만, 엔진 표시등은 <b>이때도 켜져 있어요</b>.";
    }
    if (seen.size === 2 && !goals.has("always")) later(showAsk, 900);
  }
  dayBtn.addEventListener("click", () => setTime("day"));
  nightBtn.addEventListener("click", () => setTime("night"));

  let asked = false;
  function showAsk(): void {
    if (asked) return;
    asked = true;
    b4Ask(
      qBox,
      "낮에도 밤에도 표시등이 켜져 있었어요. 식물의 <b>호흡</b>은 언제 일어날까요?",
      [
        { t: "낮과 밤을 가리지 않고 항상", ok: true },
        { t: "빛이 없는 밤에만", ok: false },
        { t: "광합성을 쉬는 낮에만", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 살아 있는 세포는 에너지가 <b>항상</b> 필요하니, 호흡도 낮밤 없이 계속돼요. 광합성이 '주로 낮'인 것과 대비되는 포인트죠."
          : "표시등을 다시 봐요. 낮에도 밤에도 초록불이었죠? 세포는 에너지가 <b>항상</b> 필요해서, 호흡은 낮과 밤을 가리지 않고 계속된답니다.";
        collect("always", "낮에도 밤에도!");
      },
    );
  }

  host.append(goalChips, helper, board, btnRow, segRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("뒤집기 버튼부터 눌러 보세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
