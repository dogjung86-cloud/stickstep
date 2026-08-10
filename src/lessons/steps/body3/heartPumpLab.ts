// [중2 Ⅵ v3] L3 heartPumpLab — 「심장 펌프장」.
// 한 통찰: 판막은 일방통행 문 — 혈액은 심방→심실→동맥 방향으로만 흐른다.
// (교과서 212~213쪽 그림 VI-6: 2심방 2심실·판막·심실 벽이 두껍고 탄력 강함.)
// 조작: 이완/수축 버튼 토글(펌프 관찰) → "거꾸로 밀어 보기" 버튼(판막이 막음) → 판정(b4Ask).
// 그림 관례: 정면 뷰라 화면 왼쪽 = 몸의 오른쪽(우심방·우심실). rAF·캔버스 없음.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { B6 } from "../../../ui/body3Kit";
import type { StepRenderer } from "../../types";

interface HppStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 심장 단면 무대 — 방 4개·판막 2쌍·위쪽 혈관, 혈액 점은 CSS 국면 전환. */
function stageScene(): string {
  const flap = (x: number, y: number, cls: string): string =>
    `<g class="hpp-valve ${cls}">
      <path class="hpp-flapL" d="M${x - 14} ${y} q7 3 13 12" stroke="#B8236B" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path class="hpp-flapR" d="M${x + 14} ${y} q-7 3 -13 12" stroke="#B8236B" stroke-width="4" stroke-linecap="round" fill="none"/>
    </g>`;
  const dots = (cls: string, cx: number, cy: number, c: string): string =>
    `<g class="hpp-blood ${cls}">
      <circle cx="${cx - 10}" cy="${cy}" r="5" fill="${c}"/>
      <circle cx="${cx + 8}" cy="${cy - 8}" r="5" fill="${c}"/>
      <circle cx="${cx + 2}" cy="${cy + 9}" r="5" fill="${c}"/>
    </g>`;
  return `<svg viewBox="0 0 340 250" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="hppBody" cx="0.4" cy="0.32" r="1.1">
        <stop offset="0" stop-color="#FFE3E6"/><stop offset="0.7" stop-color="#FBC6CC"/><stop offset="1" stop-color="#F2A6AF"/>
      </radialGradient>
    </defs>
    <ellipse cx="170" cy="240" rx="120" ry="7" fill="#2A3A5E" opacity="0.10"/>
    <!-- 혈관 4개(위) : 화면 왼쪽 = 몸의 오른쪽 -->
    <path d="M108 44 v-24" stroke="#7F9DC4" stroke-width="16" stroke-linecap="round"/>
    <path d="M148 36 v-22" stroke="#C46A7C" stroke-width="13" stroke-linecap="round"/>
    <path d="M196 36 v-22" stroke="#7F9DC4" stroke-width="13" stroke-linecap="round"/>
    <path d="M234 44 v-24" stroke="#E05B6E" stroke-width="16" stroke-linecap="round"/>
    <!-- 심장 몸통 -->
    <path d="M170 46 C120 20 62 52 66 118 C69 176 116 218 170 236 C224 218 271 176 274 118 C278 52 220 20 170 46 Z" fill="url(#hppBody)" stroke="#C2626F" stroke-width="4"/>
    <!-- 방 4개 : 심방(위·얇은 벽) / 심실(아래·두꺼운 벽) -->
    <rect x="88" y="58" width="70" height="52" rx="20" fill="#FFF2F3" stroke="#D98D98" stroke-width="3"/>
    <rect x="182" y="58" width="70" height="52" rx="20" fill="#FFF2F3" stroke="#D98D98" stroke-width="3"/>
    <rect class="hpp-vent" x="86" y="128" width="74" height="76" rx="24" fill="#FFEBEE" stroke="#C2626F" stroke-width="7"/>
    <rect class="hpp-vent" x="180" y="128" width="74" height="76" rx="24" fill="#FFEBEE" stroke="#C2626F" stroke-width="7"/>
    ${flap(123, 112, "hpp-av-l")}
    ${flap(217, 112, "hpp-av-r")}
    ${flap(123, 40, "hpp-sv-l")}
    ${flap(217, 40, "hpp-sv-r")}
    ${dots("hpp-b-atrL", 123, 84, B6.deoxyBlood)}
    ${dots("hpp-b-atrR", 217, 84, B6.oxyBlood)}
    ${dots("hpp-b-venL", 123, 166, B6.deoxyBlood)}
    ${dots("hpp-b-venR", 217, 166, B6.oxyBlood)}
    <!-- 거꾸로 실험 실패 X -->
    <g class="hpp-noway">
      <path d="M108 116 l30 24 M138 116 l-30 24" stroke="${B6.danger}" stroke-width="6" stroke-linecap="round"/>
      <path d="M202 116 l30 24 M232 116 l-30 24" stroke="${B6.danger}" stroke-width="6" stroke-linecap="round"/>
    </g>
  </svg>`;
}

export const heartPumpLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as HppStep;
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
    el("div", { class: "pn-badge b6", dataset: { g: "pump" } }, el("b", { text: "펌프 리듬" }), el("span", { text: "이완·수축 대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "rev" } }, el("b", { text: "거꾸로 실험" }), el("span", { text: "잠김" })),
    el("div", { class: "pn-badge b6", dataset: { g: "why" } }, el("b", { text: "한 방향의 비밀" }), el("span", { text: "판정 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "심장의 단면이에요 — 위 두 방이 <b>심방</b>(받는 곳), 아래 두 방이 <b>심실</b>(내보내는 곳·벽이 더 두껍죠). 아래 <b>이완·수축</b> 버튼으로 심장을 직접 뛰게 해 보세요.",
  });

  const board = el("div", { class: "b6-board hpp-board", html: stageScene() });
  const tagAtr = el("div", { class: "hpp-tag hpp-tag-atr", text: "심방(받는 곳)" });
  const tagVen = el("div", { class: "hpp-tag hpp-tag-ven", text: "심실(내보내는 곳)" });
  board.append(tagAtr, tagVen);

  const diaBtn = el("button", { class: "hpp-seg", text: "이완(받기)", attrs: { type: "button" } }) as HTMLButtonElement;
  const sysBtn = el("button", { class: "hpp-seg", text: "수축(내보내기)", attrs: { type: "button" } }) as HTMLButtonElement;
  const segRow = el("div", { class: "hpp-segrow" }, diaBtn, sysBtn);
  const revBtn = el("button", { class: "hpp-rev", text: "거꾸로 밀어 보기", attrs: { type: "button" } }) as HTMLButtonElement;
  revBtn.style.display = "none";

  const qBox = el("div", { class: "hook-choices hpp-q" });
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
        "정리! 심방과 심실 사이·심실과 동맥 사이의 <b>판막</b>이 거꾸로 가는 길을 막아, 혈액은 <b>심방 → 심실 → 동맥</b> 한 방향으로만 흘러요.";
      api.enableCTA(s.cta ?? "혈관·혈액 만나기");
    }
  }

  // ── 이완/수축 ──
  const seen = new Set<string>();
  let busy = false;
  function setPhase(mode: "dia" | "sys"): void {
    if (busy) return;
    haptic(HAPTIC.tap);
    board.classList.toggle("dia", mode === "dia");
    board.classList.toggle("sys", mode === "sys");
    diaBtn.classList.toggle("cur", mode === "dia");
    sysBtn.classList.toggle("cur", mode === "sys");
    seen.add(mode);
    if (!goals.has("pump")) {
      helper.innerHTML =
        mode === "dia"
          ? "<b>이완</b> — 심장이 느슨해지면 정맥을 타고 온 혈액이 <b>심방으로</b> 들어오고, 심방과 심실 사이 판막이 열려 <b>심실까지</b> 채워져요."
          : "<b>수축</b> — 벽이 두꺼운 <b>심실</b>이 힘차게 조이면, 위쪽 판막이 열리며 혈액이 <b>동맥으로</b> 뿜어져 나가요! 이때 심방 쪽 판막은 꽉 닫히죠.";
    }
    if (seen.size === 2 && !goals.has("pump")) {
      collect("pump", "이완·수축 완주!");
      later(() => {
        helper.innerHTML =
          "펌프 리듬을 익혔어요! 그런데… 수축할 때 혈액을 <b>심방 쪽으로 되밀 수는 없을까요?</b> 아래 새 버튼으로 시험해 봐요.";
        revBtn.style.display = "";
        const chipEl = goalChips.querySelector(`[data-g="rev"] span`) as HTMLElement;
        chipEl.textContent = "버튼 등장!";
        later(() => revBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
      }, 1400);
    }
  }
  diaBtn.addEventListener("click", () => setPhase("dia"));
  sysBtn.addEventListener("click", () => setPhase("sys"));

  // ── 거꾸로 실험 ──
  let reversed = false;
  revBtn.addEventListener("click", () => {
    if (reversed || !goals.has("pump")) return;
    reversed = true;
    busy = true;
    haptic(HAPTIC.wrong);
    revBtn.disabled = true;
    board.classList.remove("dia");
    board.classList.add("sys", "revfail");
    helper.innerHTML = "혈액을 심방 쪽으로 밀어 봤지만 — <b>판막이 탁! 닫히며 길을 막았어요.</b> 거꾸로 가는 문은 열리지 않네요.";
    later(() => {
      busy = false;
      board.classList.remove("revfail");
      collect("rev", "판막이 막았다!");
      later(() => askWhy(), 700);
    }, 1600);
  });

  let asked = false;
  function askWhy(): void {
    if (asked) return;
    asked = true;
    b4Ask(
      qBox,
      "심장 속 혈액이 <b>심방 → 심실 → 동맥</b> 한 방향으로만 흐르는 까닭은 뭘까요?",
      [
        { t: "판막이 거꾸로 가는 길을 막아 줘서", ok: true },
        { t: "심장이 한쪽으로 기울어져 있어서", ok: false },
        { t: "혈액이 무거워서 아래로만 흘러서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! <b>판막</b>은 한쪽으로만 열리는 문이라, 혈액이 거꾸로 흐르려 하면 꽉 닫혀 버려요. 방금 실험에서 본 그대로죠."
          : "기울기나 무게 때문이 아니에요 — 방금 실험을 떠올려요. 거꾸로 밀자 <b>판막</b>이 닫히며 길을 막았죠? 판막이 한 방향 흐름의 비밀이랍니다.";
        collect("why", "판막 = 일방통행!");
      },
    );
  }

  host.append(goalChips, helper, board, segRow, revBtn, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("이완·수축을 모두 눌러 보세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
