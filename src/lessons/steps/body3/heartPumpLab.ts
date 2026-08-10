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

/** 심장 단면 무대 — 심근 벽 실루엣 속 4개 공동(빈 주머니 0)·판막 2쌍·혈관 4개.
 *  혈액은 좌·우 각 1개의 공(왼쪽 = 산소 적은 혈액, 검붉음)이 정맥→심방→심실→동맥을 실제로 흐른다.
 *  동맥(폐동맥·대동맥)은 사이막 곁 통로로 심실 천장과 이어진다(교과서 모식도 문법). */
function stageScene(): string {
  const avFlap = (x: number, dir: 1 | -1): string =>
    `<path class="hpp-avflap" style="transform-origin:${x}px 110px; --fr:${dir === 1 ? -50 : 50}deg" d="M${x} 110 q${2 * dir} 7 ${7 * dir} 11" stroke="#B8236B" stroke-width="4.2" stroke-linecap="round" fill="none"/>`;
  const svFlap = (x: number, dir: 1 | -1): string =>
    `<path class="hpp-svflap" style="transform-origin:${x}px 121px; --fr:${dir === 1 ? 55 : -55}deg" d="M${x} 121 q${1 * dir} -6 ${5 * dir} -9" stroke="#B8236B" stroke-width="3.6" stroke-linecap="round" fill="none"/>`;
  const ball = (cls: string, grad: string, edge: string): string =>
    `<g class="hpp-ball ${cls}">
      <circle r="11" fill="url(#${grad})" stroke="${edge}" stroke-width="2"/>
      <circle cx="-3.6" cy="-4" r="3" fill="#FFFFFF" opacity="0.55"/>
    </g>`;
  return `<svg viewBox="0 0 340 250" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="hppWall" cx="0.36" cy="0.28" r="1.15">
        <stop offset="0" stop-color="#F7BCC3"/><stop offset="0.62" stop-color="#EE9AA5"/><stop offset="1" stop-color="#DE7787"/>
      </radialGradient>
      <linearGradient id="hppVe" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#93ADCF"/><stop offset="1" stop-color="#7F9DC4"/>
      </linearGradient>
      <linearGradient id="hppAr" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#EE8B98"/><stop offset="1" stop-color="#E05B6E"/>
      </linearGradient>
      <radialGradient id="hppBallL" cx="0.35" cy="0.3" r="1">
        <stop offset="0" stop-color="#C9506F"/><stop offset="1" stop-color="${B6.deoxyBlood}"/>
      </radialGradient>
      <radialGradient id="hppBallR" cx="0.35" cy="0.3" r="1">
        <stop offset="0" stop-color="#FF7B6F"/><stop offset="1" stop-color="#E8394A"/>
      </radialGradient>
    </defs>
    <ellipse cx="170" cy="238" rx="104" ry="7" fill="#2A3A5E" opacity="0.10"/>
    <!-- 정맥(바깥 두 개 — 심방으로 들어옴): 대정맥(파랑)·폐정맥(빨강) -->
    <rect x="100" y="14" width="17" height="52" rx="8.5" fill="url(#hppVe)" stroke="#5F7FA8" stroke-width="1.6"/>
    <rect x="223" y="14" width="17" height="52" rx="8.5" fill="url(#hppAr)" stroke="#C2485C" stroke-width="1.6"/>
    <!-- 심근 벽(외벽) — 아래로 갈수록 두꺼운 근육 -->
    <path d="M170 56 C160 44 130 38 108 45 C84 53 76 74 78 102 C79 130 85 162 103 191 C119 216 146 229 170 233 C194 229 221 216 237 191 C255 162 261 130 262 102 C264 74 256 53 232 45 C210 38 180 44 170 56 Z"
      fill="url(#hppWall)" stroke="#C2626F" stroke-width="2.4"/>
    <path d="M96 60 C103 51 120 47 133 51" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.35"/>
    <!-- 동맥 통로(사이막 곁 — 심실에서 위로 나감): 폐동맥(파랑)·대동맥(빨강) -->
    <rect x="150" y="12" width="16" height="120" rx="8" fill="url(#hppVe)" stroke="#5F7FA8" stroke-width="1.6"/>
    <rect x="174" y="12" width="16" height="120" rx="8" fill="url(#hppAr)" stroke="#C2485C" stroke-width="1.6"/>
    <!-- 방 4개 공동 — 심방(위·벽 얇음), 심실(아래·벽 두꺼워 공동이 안쪽으로 좁다) -->
    <rect x="88" y="56" width="56" height="54" rx="15" fill="#FFF0F2" stroke="#E2A0A9" stroke-width="1.5"/>
    <rect x="196" y="56" width="56" height="54" rx="15" fill="#FFF0F2" stroke="#E2A0A9" stroke-width="1.5"/>
    <path class="hpp-vent" d="M110 126 H158 Q166 126 166 138 V186 Q166 206 144 210 L128 212 Q100 214 98 184 V140 Q98 126 110 126 Z" fill="#FFF0F2" stroke="#E2A0A9" stroke-width="1.5"/>
    <path class="hpp-vent" d="M182 126 H230 Q242 126 242 140 V184 Q244 214 212 212 L196 210 Q174 206 174 186 V138 Q174 126 182 126 Z" fill="#FFF0F2" stroke="#E2A0A9" stroke-width="1.5"/>
    <!-- 심방↔심실 통로(방실 판막 자리) -->
    <rect x="116" y="102" width="24" height="30" fill="#FFF0F2"/>
    <rect x="200" y="102" width="24" height="30" fill="#FFF0F2"/>
    ${avFlap(117, 1)}${avFlap(139, -1)}
    ${avFlap(201, 1)}${avFlap(223, -1)}
    ${svFlap(151, 1)}${svFlap(165, -1)}
    ${svFlap(175, 1)}${svFlap(189, -1)}
    <!-- 거꾸로 실험 실패 X (방실 통로 위) -->
    <g class="hpp-noway">
      <path d="M120 110 l16 16 M136 110 l-16 16" stroke="${B6.danger}" stroke-width="5" stroke-linecap="round"/>
      <path d="M204 110 l16 16 M220 110 l-16 16" stroke="${B6.danger}" stroke-width="5" stroke-linecap="round"/>
    </g>
    ${ball("hpp-ball-l", "hppBallL", "#7E1638")}
    ${ball("hpp-ball-r", "hppBallR", "#B32536")}
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
    board.classList.remove("dia", "sys");
    diaBtn.classList.remove("cur");
    sysBtn.classList.remove("cur");
    board.classList.add("revfail");
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
