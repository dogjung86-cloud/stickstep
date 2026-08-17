// [중2 Ⅴ v3] L5 sunGaugeLab — 「해 게이지 — 잎의 하루」.
// 한 통찰: 잎의 기체 출입 방향은 광합성량과 호흡량의 "크기 비교"로 정해진다 —
// 낮(광합성>호흡)엔 CO₂ 흡수·O₂ 방출, 밤(호흡만)엔 반대(교과서 그림 V-4).
// 조작: 시각 슬라이더 1개(0~24시). 광합성 게이지는 해를 따라 오르내리고 호흡 게이지는 일정,
// 잎의 화살표가 두 게이지의 차이로 뒤집힌다. rAF·캔버스 없음 — 슬라이더 입력 구동.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { P3 } from "../../../ui/plant3Kit";
import type { StepRenderer } from "../../types";

interface SggStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const RESP = 0.35; // 호흡량(상대값) — 항상 일정
const psOf = (t: number): number => (t >= 6 && t <= 18 ? Math.sin(((t - 6) / 12) * Math.PI) : 0);

/** 무대 — 하늘·해·달 + 잎 + 기체 화살표 2쌍 + 게이지 2개. */
function stageScene(): string {
  const pill = (x: number, y: number, w: number, label: string, c: string): string =>
    `<g><rect x="${x - w / 2}" y="${y - 11}" width="${w}" height="22" rx="11" fill="#FFFFFF" stroke="${c}" stroke-width="2.2"/>
     <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#333D4B">${label}</text></g>`;
  return `<svg viewBox="0 0 340 216" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="sggLeaf" cx="0.4" cy="0.32" r="1">
        <stop offset="0" stop-color="#8CE99A"/><stop offset="0.6" stop-color="#51CF66"/><stop offset="1" stop-color="#2F9E44"/>
      </radialGradient>
    </defs>
    <g class="sgg-sun"><circle r="14" fill="${P3.light}"/>
      <path d="M0 -20 v5 M0 15 v5 M-20 0 h5 M15 0 h5 M-14 -14 l3.5 3.5 M10.5 10.5 l3.5 3.5 M14 -14 l-3.5 3.5 M-10.5 10.5 l-3.5 3.5" stroke="${P3.light}" stroke-width="2.4" stroke-linecap="round"/></g>
    <g class="sgg-moon"><path d="M6 -12 a12 12 0 1 0 6 22 a9.5 9.5 0 0 1 -6 -22" fill="#B9C2CC"/></g>
    <ellipse cx="150" cy="204" rx="120" ry="7" fill="#101625" opacity="0.25"/>
    <!-- 잎 -->
    <g>
      <path d="M150 74 C196 96 208 138 198 168 C188 192 166 200 150 200 C134 200 112 192 102 168 C92 138 104 96 150 74 Z" fill="url(#sggLeaf)" stroke="#1E5A2A" stroke-width="3"/>
      <path d="M150 80 L150 198 M150 110 C136 118 126 130 121 142 M150 110 C164 118 174 130 179 142 M150 146 C140 152 132 160 128 168 M150 146 C160 152 168 160 172 168" stroke="#1E5A2A" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    </g>
    <!-- 낮 화살표: CO₂ in(왼쪽에서 잎으로) · O₂ out(잎에서 오른쪽으로) -->
    <g class="sgg-arr sgg-day-in">
      ${pill(44, 108, 84, "이산화 탄소", P3.co2)}
      <path d="M44 122 q10 22 46 30 M84 148 l10 3 -7 7 Z" stroke="${P3.co2}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M84 148 l10 3 -7 7 Z" fill="${P3.co2}"/>
    </g>
    <g class="sgg-arr sgg-day-out">
      ${pill(258, 108, 50, "산소", P3.o2)}
      <path d="M206 150 q36 -6 46 -28 M244 128 l8 -7 2 10 Z" stroke="${P3.o2}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M244 128 l8 -7 2 10 Z" fill="${P3.o2}"/>
    </g>
    <!-- 밤 화살표: O₂ in · CO₂ out -->
    <g class="sgg-arr sgg-night-in">
      ${pill(48, 108, 50, "산소", P3.o2)}
      <path d="M48 122 q10 22 44 30 M86 148 l10 3 -7 7 Z" stroke="${P3.o2}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M86 148 l10 3 -7 7 Z" fill="${P3.o2}"/>
    </g>
    <g class="sgg-arr sgg-night-out">
      ${pill(254, 108, 84, "이산화 탄소", P3.co2)}
      <path d="M206 150 q36 -6 44 -28 M242 128 l8 -7 2 10 Z" stroke="${P3.co2}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M242 128 l8 -7 2 10 Z" fill="${P3.co2}"/>
    </g>
    <!-- 게이지 2개 -->
    <g>
      <rect x="288" y="150" width="18" height="52" rx="6" fill="#FFFFFF" stroke="#C9CDD2" stroke-width="2" opacity="0.9"/>
      <rect class="sgg-bar-ps" x="291" y="199" width="12" height="0" rx="4" fill="${P3.leaf}"/>
      <rect x="314" y="150" width="18" height="52" rx="6" fill="#FFFFFF" stroke="#C9CDD2" stroke-width="2" opacity="0.9"/>
      <rect class="sgg-bar-resp" x="317" y="199" width="12" height="0" rx="4" fill="#FF922B"/>
      <text class="sgg-glabel" x="297" y="144" text-anchor="middle" font-size="9.5" font-weight="800" fill="#4E5968">광합성</text>
      <text class="sgg-glabel" x="323" y="144" text-anchor="middle" font-size="9.5" font-weight="800" fill="#4E5968">호흡</text>
    </g>
  </svg>`;
}

export const sunGaugeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SggStep;
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
    el("div", { class: "pn-badge p3", dataset: { g: "noon" } }, el("b", { text: "한낮 관찰" }), el("span", { text: "해를 띄워요" })),
    el("div", { class: "pn-badge p3", dataset: { g: "night" } }, el("b", { text: "한밤 관찰" }), el("span", { text: "밤으로 가요" })),
    el("div", { class: "pn-badge p3", dataset: { g: "judge" } }, el("b", { text: "방향 판정" }), el("span", { text: "질문 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "아래 <b>시간 슬라이더</b>로 잎의 하루를 돌려 보세요. 오른쪽 <b>광합성·호흡 게이지</b>와 잎의 <b>기체 화살표</b>가 어떻게 변하는지가 관전 포인트예요.",
  });

  const board = el("div", { class: "p3-board sgg-board" , html: stageScene() });
  const statusPill = el("div", { class: "sgg-status", text: "" });

  const slider = el("input", {
    class: "sgg-slider",
    attrs: { type: "range", min: "0", max: "24", step: "0.5", value: "9", "aria-label": "하루 시각 조절" },
  }) as HTMLInputElement;
  const timeLabel = el("div", { class: "sgg-time", text: "오전 9시" });

  const qBox = el("div", { class: "hook-choices sgg-q" });
  qBox.style.display = "none";

  const goals = new Set<string>();
  let finished = false;
  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 기체의 방향을 정하는 건 <b>광합성량과 호흡량의 크기 비교</b>예요. 낮엔 광합성이 커서 <b>이산화 탄소 흡수·산소 방출</b>, 밤엔 호흡만 남아 <b>산소 흡수·이산화 탄소 방출</b>, 잎이 변덕을 부리는 게 아니라 산수가 바뀌는 거죠.";
      api.enableCTA(s.cta ?? "하루 정리하기");
    }
  }

  const fmtTime = (t: number): string => {
    const h = Math.floor(t);
    const half = t - h >= 0.5 ? "30분" : "";
    if (h === 0 && !half) return "자정";
    if (h === 12 && !half) return "정오";
    if (h < 12) return `오전 ${h}시${half ? " " + half : ""}`;
    if (h === 24) return "자정";
    return `오후 ${h - 12}시${half ? " " + half : ""}`;
  };

  function render(): void {
    const t = Number(slider.value);
    const ps = psOf(t);
    const net = ps - RESP;
    // 하늘 상태
    board.classList.toggle("night", ps <= 0.02);
    board.classList.toggle("dusk", ps > 0.02 && ps < RESP + 0.1);
    // 해·달 위치(호를 따라)
    const sun = board.querySelector(".sgg-sun") as SVGGElement;
    const moon = board.querySelector(".sgg-moon") as SVGGElement;
    if (t >= 6 && t <= 18) {
      const p = (t - 6) / 12;
      const x = 40 + p * 226;
      const y = 62 - Math.sin(p * Math.PI) * 34;
      sun.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      sun.style.opacity = "1";
      moon.style.opacity = "0";
    } else {
      const tt = t < 6 ? t + 6 : t - 18; // 0~12 밤 진행
      const p = tt / 12;
      const x = 40 + p * 226;
      const y = 58 - Math.sin(p * Math.PI) * 26;
      moon.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      moon.style.opacity = "1";
      sun.style.opacity = "0";
    }
    // 게이지
    const psBar = board.querySelector(".sgg-bar-ps") as SVGRectElement;
    const respBar = board.querySelector(".sgg-bar-resp") as SVGRectElement;
    const psH = Math.round(ps * 46);
    const respH = Math.round(RESP * 46);
    psBar.setAttribute("height", String(psH));
    psBar.setAttribute("y", String(199 - psH));
    respBar.setAttribute("height", String(respH));
    respBar.setAttribute("y", String(199 - respH));
    // 화살표 상태
    const day = net > 0.06;
    const night = net < -0.06;
    board.classList.toggle("flow-day", day);
    board.classList.toggle("flow-night", night && ps <= 0.02 ? true : night);
    board.classList.toggle("flow-even", !day && !night);
    timeLabel.textContent = fmtTime(t);
    // 상태 필
    if (day) statusPill.innerHTML = "지금: <b>광합성 > 호흡</b> → 이산화 탄소 흡수 · 산소 방출";
    else if (night) statusPill.innerHTML = ps <= 0.02 ? "지금: <b>호흡만</b> → 산소 흡수 · 이산화 탄소 방출" : "지금: <b>광합성 < 호흡</b> → 산소 흡수 · 이산화 탄소 방출";
    else statusPill.innerHTML = "지금: <b>광합성 ≈ 호흡</b> → 겉보기엔 기체 출입이 잠깐 비겨요";
    // 목표
    if (t >= 10 && t <= 14) {
      if (!goals.has("noon")) {
        collect("noon", "광합성 > 호흡!");
        if (!finished) helper.innerHTML = "한낮이에요. 광합성 게이지가 호흡을 <b>훌쩍 넘었죠</b>. 그래서 잎은 <b>이산화 탄소를 마시고 산소를 내놓아요</b>. 이제 슬라이더를 <b>한밤중</b>으로 돌려 보세요.";
      }
    }
    if ((t <= 4 || t >= 21) && goals.has("noon") && !goals.has("night")) {
      collect("night", "호흡만 남았다!");
      if (!goals.has("judge")) later(showAsk, 800);
    }
  }
  slider.addEventListener("input", () => render());

  let asked = false;
  function showAsk(): void {
    if (asked) return;
    asked = true;
    b4Ask(
      qBox,
      "깜깜한 한밤중, 이 잎의 기체 출입으로 옳은 것은?",
      [
        { t: "산소를 흡수하고 이산화 탄소를 방출한다", ok: true },
        { t: "이산화 탄소를 흡수하고 산소를 방출한다", ok: false },
        { t: "아무 기체도 드나들지 않는다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 밤엔 광합성이 멈추고 <b>호흡만</b> 남으니, 우리처럼 <b>산소를 마시고 이산화 탄소를 내놓아요</b>."
          : "게이지를 봐요. 밤엔 광합성 게이지가 0이고 <b>호흡 게이지만</b> 남았죠. 그래서 잎은 <b>산소를 흡수하고 이산화 탄소를 방출</b>한답니다. 기체가 안 드나드는 순간은 없어요!";
        collect("judge", "호흡의 방향!");
      },
    );
  }

  host.append(goalChips, helper, board, statusPill, el("div", { class: "sgg-sliderrow" }, timeLabel, slider), qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  render();
  api.setCTA("슬라이더로 하루를 돌려 보세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
