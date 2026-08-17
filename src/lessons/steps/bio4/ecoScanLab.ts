// [중1 Ⅱ v3] L6 ecoScanLab — 「다양성 검사관」.
// 한 통찰: 생물다양성은 세 가지 눈금(생태계의 다양함·생물 종류의 다양함·변이의 다양함)으로 잰다.
// 조작: 논(가)과 숲(나)을 렌즈 3모드로 스캔 — 모드마다 해당 요소가 켜지고, 어느 쪽이 더
// 다양한지 지역 카드를 탭해 판정한다. 변이 렌즈는 무당벌레 무늬 클로즈업(L7 예고).
// 마지막 종합 판정(첫 시도)만 recordQuiz. rAF·캔버스 없음 — SVG + CSS.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import type { StepRenderer } from "../../types";

interface EcsStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 논(가) — 생태계 1곳(논), 생물 2종류(벼·참새), 무당벌레 없음. 같은 요소 반복이 핵심 인상. */
function paddyScene(): string {
  const rice = Array.from({ length: 12 }, (_, i) => {
    const x = 18 + (i % 6) * 22;
    const y = 96 + Math.floor(i / 6) * 34;
    return `<g class="ecs-life sp-rice" transform="translate(${x} ${y})">
      <path d="M0 22 v-16 M0 10 l-6 -8 M0 10 l6 -8 M0 14 l-4 -6 M0 14 l4 -6" stroke="#66A80F" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    </g>`;
  }).join("");
  return `
  <svg viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect class="ecs-eco" data-e="paddy" x="4" y="78" width="152" height="62" rx="10" fill="#D8F0B8" stroke="#94BE60" stroke-width="2.4"/>
    <path d="M10 112 h140 M10 128 h140" stroke="#B9DB90" stroke-width="2"/>
    <rect x="4" y="14" width="152" height="58" rx="10" fill="#EAF6FF"/>
    ${rice}
    <g class="ecs-life sp-sparrow" transform="translate(118 46)">
      <ellipse rx="9" ry="6.5" fill="#C9A16B" stroke="#8A6636" stroke-width="1.8"/>
      <circle cx="8" cy="-4" r="4.4" fill="#C9A16B" stroke="#8A6636" stroke-width="1.8"/>
      <path d="M12 -4 l4 1.5 -4 1.5 Z" fill="#5C4318"/>
    </g>
  </svg>`;
}

/** 숲(나) — 생태계 3곳(숲·호수·풀밭), 생물 6종류, 무당벌레 무늬 3종(변이). */
function forestScene(): string {
  return `
  <svg viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect class="ecs-eco" data-e="forest" x="4" y="14" width="152" height="64" rx="10" fill="#C8E6C0" stroke="#8FBE85" stroke-width="2.4"/>
    <ellipse class="ecs-eco" data-e="lake" cx="52" cy="116" rx="44" ry="24" fill="#A5D8FF" stroke="#4DABF7" stroke-width="2.4"/>
    <rect class="ecs-eco" data-e="meadow" x="102" y="92" width="54" height="48" rx="10" fill="#E7F5C8" stroke="#B5CE85" stroke-width="2.4"/>
    <g class="ecs-life sp-tree" transform="translate(30 44)">
      <rect x="-3" y="6" width="6" height="16" fill="#8A6636"/>
      <circle r="13" cy="0" fill="#69B05C" stroke="#417B36" stroke-width="2"/>
    </g>
    <g class="ecs-life sp-tree" transform="translate(66 40)">
      <rect x="-3" y="8" width="6" height="16" fill="#8A6636"/>
      <path d="M0 -16 L12 6 h-24 Z" fill="#4C9542" stroke="#2F6B28" stroke-width="2" stroke-linejoin="round"/>
    </g>
    <g class="ecs-life sp-bird" transform="translate(112 34)">
      <ellipse rx="8" ry="6" fill="#74C0FC" stroke="#1971C2" stroke-width="1.8"/>
      <circle cx="7" cy="-4" r="4" fill="#74C0FC" stroke="#1971C2" stroke-width="1.8"/>
      <path d="M11 -4 l4 1.5 -4 1.5 Z" fill="#E8A80C"/>
    </g>
    <g class="ecs-life sp-fish" transform="translate(46 116)">
      <ellipse rx="10" ry="5.5" fill="#FFC078" stroke="#E8590C" stroke-width="1.8"/>
      <path d="M10 0 l7 -5 v10 Z" fill="#FFC078" stroke="#E8590C" stroke-width="1.8" stroke-linejoin="round"/>
    </g>
    <g class="ecs-life sp-frog" transform="translate(84 130)">
      <ellipse rx="8" ry="5.5" fill="#8CE99A" stroke="#2B8A3E" stroke-width="1.8"/>
      <circle cx="-4" cy="-5" r="2.6" fill="#8CE99A" stroke="#2B8A3E" stroke-width="1.6"/>
      <circle cx="4" cy="-5" r="2.6" fill="#8CE99A" stroke="#2B8A3E" stroke-width="1.6"/>
    </g>
    <g class="ecs-life sp-flower" transform="translate(118 108)">
      <path d="M0 14 v-8" stroke="#2B8A3E" stroke-width="2"/>
      <circle r="3" fill="#FFD43B"/>
      <g fill="#FAA2C1"><circle cx="-5" r="3"/><circle cx="5" r="3"/><circle cy="-5" r="3"/><circle cy="5" r="3"/></g>
    </g>
    <g class="ecs-vary" transform="translate(128 122)">
      <g transform="translate(0 0)"><circle r="6" fill="#F03E3E" stroke="#A61E1E" stroke-width="1.6"/><circle cx="-2" cy="-1" r="1.3" fill="#1A1A1A"/><circle cx="2.4" cy="1.4" r="1.3" fill="#1A1A1A"/></g>
      <g transform="translate(16 6)"><circle r="6" fill="#F03E3E" stroke="#A61E1E" stroke-width="1.6"/><circle cx="0" cy="-1.6" r="1.3" fill="#1A1A1A"/><circle cx="-2.4" cy="1.6" r="1.3" fill="#1A1A1A"/><circle cx="2.4" cy="1.6" r="1.3" fill="#1A1A1A"/></g>
      <g transform="translate(6 14)"><circle r="6" fill="#FFB020" stroke="#B57808" stroke-width="1.6"/><circle cx="-2" cy="0" r="1.2" fill="#1A1A1A"/><circle cx="2" cy="-1.6" r="1.2" fill="#1A1A1A"/><circle cx="1.6" cy="2" r="1.2" fill="#1A1A1A"/><circle cx="-1.4" cy="-2.2" r="1.2" fill="#1A1A1A"/></g>
    </g>
  </svg>`;
}

interface Phase {
  id: string;
  chip: string;
  lensLabel: string;
  q: string;
  ans: "b" | "both";
  good: string;
  bad: string;
}

const PHASES: Phase[] = [
  {
    id: "eco",
    chip: "생태계 눈금",
    lensLabel: "생태계 렌즈",
    q: "렌즈에 <b>서로 다른 환경(생태계)</b>이 표시됐어요. (가) 논은 1곳, (나)는 숲·호수·풀밭 3곳! <b>생태계가 더 다양한 곳</b>을 탭하세요.",
    ans: "b",
    good: "맞아요! (나)에는 숲·호수·풀밭, <b>서로 다른 생태계가 3곳</b>, 첫 번째 눈금에서 (나) 승!",
    bad: "(가) 논은 논 <b>한 가지</b> 환경뿐이에요. 숲·호수·풀밭 세 환경을 가진 <b>(나)</b>가 생태계 눈금의 승자죠.",
  },
  {
    id: "kind",
    chip: "종류 눈금",
    lensLabel: "종류 렌즈",
    q: "이번엔 <b>생물 종류</b>에 불이 켜졌어요. (가)는 벼·참새 2종류, (나)는 나무·새·물고기·개구리·꽃… <b>종류가 더 다양한 곳</b>을 탭!",
    ans: "b",
    good: "맞아요! (나)엔 <b>여섯 종류가 넘는</b> 생물이 살아요. 두 번째 눈금도 (나) 승!",
    bad: "(가)는 벼가 가득해도 <b>종류로는 둘</b>뿐이에요. 여러 종류가 사는 <b>(나)</b>가 종류 눈금의 승자랍니다.",
  },
  {
    id: "vary",
    chip: "변이 눈금",
    lensLabel: "변이 렌즈",
    q: "마지막 렌즈, (나)의 풀밭을 확대하니 <b>무당벌레 세 마리</b>가! 같은 무당벌레인데 <b>등딱지 무늬가 제각각</b>이죠. 무늬가 다른 무당벌레들을 탭해 보세요.",
    ans: "both",
    good: "",
    bad: "",
  },
];

export const ecoScanLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as EcsStep;
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
    ...PHASES.map((p) =>
      el("div", { class: "pn-badge b4", dataset: { g: p.id } }, el("b", { text: p.chip }), el("span", { text: "대기 중" })),
    ),
  );
  const helper = el("div", {
    class: "helper",
    html: "다양성 검사관 출동! 아래 <b>렌즈 버튼</b>을 눌러 두 지역을 눈금 하나씩 검사해요.",
  });

  const regionA = el("button", { class: "ecs-region", attrs: { type: "button", "aria-label": "(가) 논" } }) as HTMLButtonElement;
  regionA.innerHTML = `${paddyScene()}<b>(가) 논</b>`;
  const regionB = el("button", { class: "ecs-region", attrs: { type: "button", "aria-label": "(나) 호수가 있는 숲" } }) as HTMLButtonElement;
  regionB.innerHTML = `${forestScene()}<b>(나) 호수가 있는 숲</b>`;
  const board = el("div", { class: "b4-board ecs-board" }, el("div", { class: "ecs-regions" }, regionA, regionB));

  const lensRow = el("div", { class: "ecs-lenses" });
  const lensBtns = PHASES.map((p, i) => {
    const b = el("button", { class: "ecs-lens", text: p.lensLabel, attrs: { type: "button" } }) as HTMLButtonElement;
    b.disabled = i !== 0;
    b.addEventListener("click", () => startPhase(i));
    lensRow.appendChild(b);
    return b;
  });

  const askBox = el("div", { class: "hook-choices ecs-ask" });
  askBox.style.display = "none";

  host.append(goalChips, helper, board, lensRow, askBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const goals = new Set<string>();
  let finished = false;
  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
  }

  let phase = -1;
  let judging = false;

  function startPhase(i: number): void {
    if (i !== phase + 1 && !(goals.size >= 3)) return;
    phase = i;
    const p = PHASES[i];
    haptic(HAPTIC.tap);
    board.classList.remove("mode-eco", "mode-kind", "mode-vary");
    board.classList.add(`mode-${p.id}`);
    lensBtns.forEach((b, k) => {
      b.classList.toggle("cur", k === i);
      b.disabled = goals.size >= 3 ? false : k !== i && k !== i + 1 ? true : k === i + 1;
    });
    helper.innerHTML = p.q;
    judging = p.ans === "b";
    if (p.id === "vary") setupVary();
  }

  function judge(region: "a" | "b"): void {
    if (!judging || finished) return;
    const p = PHASES[phase];
    if (region === "b") {
      judging = false;
      haptic(HAPTIC.correct);
      helper.innerHTML = p.good;
      collect(p.id, "(나) 승!");
      const next = phase + 1;
      if (next < PHASES.length) {
        later(() => {
          lensBtns[next].disabled = false;
          helper.innerHTML = `${p.good} 다음 <b>${PHASES[next].lensLabel}</b>를 켜 보세요.`;
        }, 900);
      }
    } else {
      haptic(HAPTIC.wrong);
      regionA.classList.add("nope");
      helper.innerHTML = p.bad;
      later(() => regionA.classList.remove("nope"), 650);
    }
  }
  regionA.addEventListener("click", () => judge("a"));
  regionB.addEventListener("click", () => judge("b"));

  // 변이 렌즈 — 무당벌레 3마리 탭 수집
  let varyCount = 0;
  function setupVary(): void {
    const bugs = [...regionB.querySelectorAll<SVGGElement>(".ecs-vary > g")];
    bugs.forEach((bug) => {
      bug.classList.add("tappable");
      bug.addEventListener("click", (e) => {
        e.stopPropagation();
        if (bug.classList.contains("seen")) return;
        bug.classList.add("seen");
        varyCount += 1;
        haptic(HAPTIC.tap);
        if (varyCount === 1) helper.innerHTML = "점 두 개 무늬! 다른 친구들도 확대해 봐요.";
        if (varyCount === 2) helper.innerHTML = "이번엔 점 세 개, 같은 무당벌레인데 무늬가 달라요!";
        if (varyCount === bugs.length) {
          collect("vary", "무늬 발견!");
          helper.innerHTML =
            "색도 점 개수도 제각각, <b>같은 종류 안에서 나타나는 서로 다른 특징</b>까지 다양성의 눈금이에요. 이제 종합 판정!";
          later(showFinal, 1000);
        }
      });
    });
  }

  let finalShown = false;
  function showFinal(): void {
    if (finalShown) return;
    finalShown = true;
    b4Ask(
      askBox,
      "검사 결과 종합, <b>생물다양성이 더 높은 지역</b>은 어디이고, 그 까닭은 무엇일까요?",
      [
        { t: "(나), 생태계도, 생물 종류도, 변이도 모두 다양해서", ok: true },
        { t: "(가), 벼가 훨씬 많이 자라고 있어서", ok: false },
        { t: "(나), 넓이가 더 넓어 보여서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "완벽한 판정! 다양성은 <b>개수나 넓이가 아니라</b> 생태계·종류·변이, <b>세 눈금이 고루 다양할 때</b> 높다고 말해요."
          : "벼가 아무리 많아도 <b>한 종류</b>일 뿐이에요. 다양성은 개수가 아니라 <b>생태계·종류·변이의 다양함</b>으로 재요. 정답은 (나)!";
        if (!finished) {
          finished = true;
          api.enableCTA(s.cta ?? "용어로 정리하기");
        }
      },
    );
  }

  api.setCTA("세 눈금을 모두 검사해요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
