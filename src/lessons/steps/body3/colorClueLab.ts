// [중2 Ⅵ v3] L1 colorClueLab — 「수상한 즙 수사대」.
// 한 통찰: 검출 시약마다 반응하는 영양소가 정해져 있다 — 색이 곧 단서다.
// (교과서 204~205쪽 탐구 「음식물에 들어 있는 영양소 검출하기」의 저밀도 소형판:
//  시료 3개(밥물·달걀흰자액·포도당 용액)를 한 번에 하나씩, 시약 4종 버튼으로 검사한다.)
// 조작: 시약 버튼 탭 → 방울 → 색 전환(CSS) → 판정(b4Ask) → 다음 시료. 베네딕트는 가열 버튼이 핵심.
// rAF·캔버스 없음 — SVG 한 장 + 클래스 전환. 타이머는 Set으로 cleanup.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { B6 } from "../../../ui/body3Kit";
import type { StepRenderer } from "../../types";

interface CluStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 시료 정의 — 액체 기본색과 정반응 시약. */
const SAMPLES = [
  { id: "A", name: "시료 ㉮ · 밥을 으깬 물", base: "#EFE9D6", react: "iodine" },
  { id: "B", name: "시료 ㉯ · 달걀흰자를 푼 물", base: "#FBF3DC", react: "biuret" },
  { id: "C", name: "시료 ㉰ · 맑은 단물", base: "#EAF4FB", react: "benedict" },
] as const;

const REAGENTS = [
  { id: "iodine", label: "아이오딘", dot: "#7B4A12", color: B6.iodine, colorName: "청람색" },
  { id: "benedict", label: "베네딕트", dot: "#3B82C4", color: B6.benedict, colorName: "황적색" },
  { id: "biuret", label: "뷰렛", dot: "#6741D9", color: B6.biuret, colorName: "보라색" },
  { id: "sudan", label: "수단 III", dot: "#D6336C", color: B6.sudan, colorName: "선홍색" },
] as const;

type ReagentId = (typeof REAGENTS)[number]["id"];

function stageScene(): string {
  return `<svg viewBox="0 0 340 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="cluGlass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/><stop offset="0.25" stop-color="#FFFFFF" stop-opacity="0"/>
        <stop offset="0.85" stop-color="#B9C6D2" stop-opacity="0.35"/><stop offset="1" stop-color="#8FA0AE" stop-opacity="0.4"/>
      </linearGradient>
      <linearGradient id="cluDesk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#EDE0C8"/><stop offset="1" stop-color="#DCC9A4"/>
      </linearGradient>
    </defs>
    <rect x="0" y="168" width="340" height="32" fill="url(#cluDesk)"/>
    <path d="M0 168 h340" stroke="#C3AB7E" stroke-width="3"/>
    <ellipse cx="170" cy="176" rx="70" ry="6" fill="#2A3A5E" opacity="0.10"/>
    <rect x="118" y="158" width="104" height="14" rx="7" fill="#C9A876" stroke="#A9885A" stroke-width="2.6"/>
    <g>
      <path d="M150 34 v104 a20 20 0 0 0 40 0 v-104" stroke="#8FA0AE" stroke-width="3.4" fill="#FFFFFF" fill-opacity="0.35"/>
      <rect class="clu-liquid" x="152" y="88" width="36" height="50" fill="#EFE9D6"/>
      <path class="clu-liquid-bottom" d="M152 132 a18 18 0 0 0 36 0 Z" fill="#EFE9D6"/>
      <ellipse class="clu-surface" cx="170" cy="88" rx="18" ry="4" fill="#FFFFFF" opacity="0.5"/>
      <rect x="150" y="34" width="40" height="132" fill="url(#cluGlass)" rx="6"/>
      <path d="M147 34 h46" stroke="#8FA0AE" stroke-width="3.4" stroke-linecap="round"/>
      <g class="clu-bubbles">
        <circle cx="162" cy="128" r="2.4" fill="#FFFFFF"/>
        <circle cx="174" cy="120" r="2" fill="#FFFFFF"/>
        <circle cx="168" cy="110" r="1.7" fill="#FFFFFF"/>
      </g>
    </g>
    <g class="clu-dropper">
      <path class="clu-drop" d="M166 52 c0 -6 4 -11 4 -11 c0 0 4 5 4 11 a4 4 0 0 1 -8 0 Z" fill="#7B4A12"/>
    </g>
    <g class="clu-bath">
      <path d="M236 118 l6 48 h44 l6 -48 Z" fill="#F3E8D2" stroke="#C9A876" stroke-width="3"/>
      <ellipse cx="264" cy="118" rx="28" ry="7" fill="#FBF3DF" stroke="#C9A876" stroke-width="3"/>
      <path class="clu-steam" d="M252 104 q4 -8 0 -16 M264 108 q4 -8 0 -16 M276 104 q4 -8 0 -16" stroke="#C9CDD2" stroke-width="2.8" stroke-linecap="round" fill="none"/>
    </g>
  </svg>`;
}

export const colorClueLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CluStep;
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
    el("div", { class: "pn-badge b6", dataset: { g: "A" } }, el("b", { text: "시료 ㉮ 정체" }), el("span", { text: "시약 대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "B" } }, el("b", { text: "시료 ㉯ 정체" }), el("span", { text: "수사 대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "C" } }, el("b", { text: "베네딕트의 비밀" }), el("span", { text: "수사 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "이름표가 지워진 즙 세 병이 실험대로 왔어요. 첫 번째는 <b>시료 ㉮(밥을 으깬 물)</b> — 아래 시약 버튼을 눌러 <b>색 단서</b>를 찾아보세요. 어떤 시약이든 좋아요!",
  });

  const board = el("div", { class: "b6-board clu-board", html: stageScene() });
  const samplePill = el("div", { class: "clu-pill", text: SAMPLES[0].name });
  board.appendChild(samplePill);

  const btnRow = el("div", { class: "clu-btnrow" });
  REAGENTS.forEach((r) => {
    const b = el(
      "button",
      { class: "clu-btn", attrs: { type: "button" } },
      el("span", { class: "clu-dot" }),
      el("span", { text: r.label }),
    ) as HTMLButtonElement;
    (b.querySelector(".clu-dot") as HTMLElement).style.background = r.dot;
    b.addEventListener("click", () => pickReagent(r.id));
    btnRow.appendChild(b);
  });
  const heatBtn = el("button", { class: "clu-heat", text: "뜨거운 물에 담그기", attrs: { type: "button" } }) as HTMLButtonElement;
  heatBtn.style.display = "none";

  const qBox = el("div", { class: "hook-choices clu-q" });
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
        "수사 종결! <b>아이오딘=녹말(청람색) · 뷰렛=단백질(보라색) · 베네딕트+가열=당분(황적색) · 수단 III=지방(선홍색)</b> — 시약마다 담당 영양소가 정해져 있어요.";
      api.enableCTA(s.cta ?? "정리하기");
    }
  }

  // ── 상태 ──
  let si = 0; // 현재 시료 인덱스
  let busy = false;
  let asking = false;
  let benedictWaiting = false; // 시료 ㉰에서 베네딕트 투입 후 가열 대기
  const setLiquid = (c: string): void =>
    board.querySelectorAll(".clu-liquid, .clu-liquid-bottom").forEach((n) => n.setAttribute("fill", c));

  const INTRO: Record<string, string> = {
    B: "다음 시료예요 — <b>시료 ㉯(달걀흰자를 푼 물)</b>. 이번에도 시약을 골라 색 단서를 찾아봐요.",
    C: "마지막 — <b>시료 ㉰(맑은 단물)</b>이에요. 살짝 달콤한 냄새가 나네요. 어떤 시약이 단서를 잡을까요?",
  };
  function switchSample(idx: number): void {
    si = idx;
    benedictWaiting = false;
    heatBtn.style.display = "none";
    heatBtn.disabled = false;
    board.classList.remove("heated");
    samplePill.textContent = SAMPLES[idx].name;
    setLiquid(SAMPLES[idx].base);
    helper.innerHTML = INTRO[SAMPLES[idx].id];
    board.classList.add("swap");
    later(() => board.classList.remove("swap"), 500);
  }

  function dropAnim(dot: string, after: () => void): void {
    (board.querySelector(".clu-drop") as SVGElement).setAttribute("fill", dot);
    board.classList.add("dripping");
    later(() => {
      board.classList.remove("dripping");
      after();
    }, 700);
  }

  function pickReagent(id: ReagentId): void {
    if (busy || finished || asking) return;
    const sample = SAMPLES[si];
    busy = true;
    haptic(HAPTIC.tap);
    const reagent = REAGENTS.find((r) => r.id === id)!;
    dropAnim(reagent.dot, () => {
      busy = false;
      if (id === sample.react && id !== "benedict") {
        setLiquid(reagent.color);
        helper.innerHTML = `색이 확 변했어요 — <b>${reagent.colorName}</b>! ${reagent.label} 용액이 단서를 잡았네요.`;
        later(() => askSample(), 800);
      } else if (id === "benedict") {
        if (sample.react === "benedict") {
          setLiquid("#CFE7F7");
          benedictWaiting = true;
          helper.innerHTML =
            "베네딕트 용액을 넣었는데… <b>아직 색이 그대로</b>예요. 이 시약에는 한 가지 조작이 더 필요하대요 — 아래 버튼을 눌러 보세요.";
          heatBtn.style.display = "";
          later(() => heatBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
        } else {
          setLiquid(sample.base);
          helper.innerHTML = "베네딕트 용액은 반응이 없어요(가열해도 마찬가지) — 이 시료엔 <b>당분이 없다</b>는 뜻이에요. 그것도 단서! 다른 시약을 시험해 봐요.";
        }
      } else {
        setLiquid(sample.base);
        helper.innerHTML = `변화가 없네요 — ${reagent.label} 용액이 찾는 영양소는 이 시료에 <b>없다</b>는 뜻이에요. 그것도 훌륭한 단서! 다른 시약을 시험해 봐요.`;
      }
    });
  }

  heatBtn.addEventListener("click", () => {
    if (!benedictWaiting || busy) return;
    busy = true;
    haptic(HAPTIC.tap);
    heatBtn.disabled = true;
    board.classList.add("heated");
    helper.innerHTML = "보글보글… 뜨거운 물에 담그고 잠시 기다려요.";
    later(() => {
      busy = false;
      setLiquid(B6.benedict);
      helper.innerHTML = "우와 — <b>황적색</b>! 시료 ㉰의 단물엔 <b>포도당 같은 당분</b>이 들어 있었어요. 그런데 방금, 색을 깨운 결정적 조작이 뭐였죠?";
      later(() => askSample(), 900);
    }, 1200);
  });

  function askSample(): void {
    if (asking) return;
    asking = true;
    const sample = SAMPLES[si];
    const qs: Record<string, { q: string; c: { t: string; ok: boolean }[]; sub: string; done: string; fix: string }> = {
      A: {
        q: "시료 ㉮는 아이오딘 용액에서 <b>청람색</b>이 됐어요. 이 즙의 정체는?",
        c: [
          { t: "녹말이 많은, 밥을 으깬 물", ok: true },
          { t: "단백질이 많은, 달걀흰자를 푼 물", ok: false },
          { t: "지방이 많은 식용유", ok: false },
        ],
        sub: "녹말 = 청람색!",
        done: "정답! 아이오딘 용액의 짝은 <b>녹말</b> — 밥의 주성분이죠.",
        fix: "청람색의 짝을 떠올려요 — 아이오딘 용액은 <b>녹말</b>을 만났을 때 청람색이 돼요. 녹말이 많은 건 밥을 으깬 물이죠.",
      },
      B: {
        q: "시료 ㉯는 뷰렛 용액에서 <b>보라색</b>이 됐어요. 이 즙에 들어 있는 영양소는?",
        c: [
          { t: "단백질", ok: true },
          { t: "녹말", ok: false },
          { t: "지방", ok: false },
        ],
        sub: "단백질 = 보라색!",
        done: "맞아요! 뷰렛 용액의 짝은 <b>단백질</b> — 달걀흰자의 주인공이에요.",
        fix: "보라색은 뷰렛 용액의 신호 — 뷰렛의 짝은 <b>단백질</b>이에요. 녹말은 아이오딘(청람), 지방은 수단 III(선홍)이 담당하죠.",
      },
      C: {
        q: "베네딕트 용액이 <b>황적색</b>을 보여 준 건 언제였나요?",
        c: [
          { t: "뜨거운 물에 담가 데운 뒤에", ok: true },
          { t: "용액을 넣자마자 바로", ok: false },
          { t: "차갑게 식힌 뒤에", ok: false },
        ],
        sub: "가열이 열쇠!",
        done: "그거예요 — 베네딕트 반응은 <b>가열</b>해야 색이 나타나요. 시험에 단골로 나오는 한 끗이랍니다.",
        fix: "순서를 다시 봐요 — 넣자마자는 색이 그대로였고, <b>뜨거운 물에 담근 뒤</b>에야 황적색이 됐죠. 베네딕트 반응의 열쇠는 가열이에요.",
      },
    };
    const def = qs[sample.id];
    b4Ask(qBox, def.q, def.c, (ok) => {
      if (sample.id === "A") api.recordQuiz(ok);
      helper.innerHTML = ok ? def.done : def.fix;
      collect(sample.id, def.sub);
      asking = false;
      later(() => {
        qBox.style.display = "none";
        qBox.innerHTML = "";
        if (si < 2) switchSample(si + 1);
      }, 1400);
    });
  }

  host.append(goalChips, helper, board, btnRow, heatBtn, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("시약을 골라 수사를 시작해요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
