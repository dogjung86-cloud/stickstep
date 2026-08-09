// [중1 Ⅱ v3] L3 slideMakeLab — 「나의 첫 현미경표본」(기함).
// 교과서 탐구(책 42~43쪽) 절차의 조작판: 채취 → 염색(왜? 예측) → 덮개 유리(비스듬히 vs 바로 —
// 기포 함정 체험·재시도) → 거름종이 → 현미경 관찰(초점 손잡이 + 표본 스왑 비교).
// 관찰 사진은 구작 검증 자산(exam/u2/cheek-cells·elodea-cells — 원형 시야 프레임 내장) 재사용.
// 목표 3: ① 표본 완성 ② 두 표본 모두 초점 성공 ③ 동물/식물 비교 발견(첫 시도만 채점).
// rAF·캔버스 없음 — DOM/SVG + CSS 전환. 타이머는 Set으로 모아 cleanup.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";

interface SmkStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

/** 받침 유리 무대 — 상태(mark·drop·cover·bubbles·paper)에 따라 오버레이가 쌓인다. */
function slideSvg(): string {
  return `
  <svg viewBox="0 0 320 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="smkGlass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F4FAFF"/><stop offset="1" stop-color="#DCEDF8"/>
      </linearGradient>
    </defs>
    <ellipse cx="160" cy="150" rx="120" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <rect x="42" y="58" width="236" height="76" rx="8" fill="url(#smkGlass)" stroke="#9DB8CC" stroke-width="2.6"/>
    <path d="M52 66 C90 60 150 60 190 63" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
    <g class="smk-mark" opacity="0">
      <path d="M126 88 c14 -6 32 -7 46 -2 M120 100 c20 -7 46 -7 62 -1 M128 111 c16 -5 36 -6 50 -2"
        stroke="#E8D8C2" stroke-width="7" stroke-linecap="round"/>
    </g>
    <g class="smk-drop" opacity="0">
      <ellipse cx="160" cy="98" rx="46" ry="26" fill="#4DABF7" opacity="0.34"/>
      <ellipse cx="146" cy="88" rx="12" ry="6" fill="#FFFFFF" opacity="0.5" transform="rotate(-18 146 88)"/>
    </g>
    <g class="smk-bubbles" opacity="0">
      <circle cx="138" cy="92" r="7" fill="#FFFFFF" opacity="0.85" stroke="#9DB8CC" stroke-width="1.6"/>
      <circle cx="176" cy="104" r="9" fill="#FFFFFF" opacity="0.85" stroke="#9DB8CC" stroke-width="1.6"/>
      <circle cx="158" cy="84" r="5" fill="#FFFFFF" opacity="0.85" stroke="#9DB8CC" stroke-width="1.6"/>
      <circle cx="190" cy="90" r="6" fill="#FFFFFF" opacity="0.85" stroke="#9DB8CC" stroke-width="1.6"/>
    </g>
    <g class="smk-cover" opacity="0">
      <rect x="108" y="70" width="104" height="56" rx="3" fill="#EAF6FF" opacity="0.55" stroke="#8FB8D8" stroke-width="2.2"/>
      <path d="M114 76 l20 -4" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    </g>
    <g class="smk-paper" opacity="0">
      <rect x="196" y="52" width="66" height="44" rx="6" fill="#FBF7EC" stroke="#C9BFA2" stroke-width="2.2" transform="rotate(8 229 74)"/>
    </g>
  </svg>`;
}

export const slideMakeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SmkStep;
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
    el("div", { class: "pn-badge b4", dataset: { g: "make" } }, el("b", { text: "표본 완성" }), el("span", { text: "4단계" })),
    el("div", { class: "pn-badge b4", dataset: { g: "focus" } }, el("b", { text: "초점 성공" }), el("span", { text: "두 표본" })),
    el("div", { class: "pn-badge b4", dataset: { g: "compare" } }, el("b", { text: "비교 발견" }), el("span", { text: "질문 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "관찰 대상은 <b>내 입안의 상피세포</b>! 아래 도구를 <b>순서대로 탭</b>해서 현미경표본을 만들어요.",
  });

  // ── 제작 무대 ──
  const slideStage = el("div", { class: "b4-board smk-board" });
  slideStage.innerHTML = slideSvg();
  const q = <T extends Element>(sel: string): T => slideStage.querySelector(sel) as T;

  const TOOLS = [
    { id: "swab", name: "면봉", desc: "볼 안쪽 문지르기" },
    { id: "stain", name: "메틸렌 블루", desc: "한 방울 톡" },
    { id: "cover", name: "덮개 유리", desc: "조심조심 덮기" },
    { id: "paper", name: "거름종이", desc: "꾹 눌러 정리" },
  ] as const;
  const toolRow = el("div", { class: "smk-tools" });
  const toolBtns = TOOLS.map((t, i) => {
    const b = el(
      "button",
      { class: "smk-tool", attrs: { type: "button" } },
      el("b", { text: t.name }),
      el("span", { text: t.desc }),
    ) as HTMLButtonElement;
    b.disabled = i !== 0;
    b.addEventListener("click", () => useTool(t.id));
    toolRow.appendChild(b);
    return b;
  });

  // 선택지 박스(염색 예측·덮개 방식) — .hook-choices 공용 스타일 재사용
  const askBox = el("div", { class: "hook-choices smk-ask" });
  askBox.style.display = "none";

  // ── 관찰 무대(표본 완성 후 교체) ──
  const obsWrap = el("div", { class: "smk-obs" });
  obsWrap.style.display = "none";
  const segCheek = el("button", { class: "smk-seg cur", text: "입안 상피세포", attrs: { type: "button" } }) as HTMLButtonElement;
  const segElodea = el("button", { class: "smk-seg", text: "검정말잎", attrs: { type: "button" } }) as HTMLButtonElement;
  const segRow = el("div", { class: "smk-segrow" }, segCheek, segElodea);
  const viewImg = el("img", {
    class: "smk-view",
    attrs: { src: `${BASE}exam/u2/cheek-cells.webp`, alt: "현미경 시야 — 초점을 맞춰 보세요" },
  }) as HTMLImageElement;
  const viewWrap = el("div", { class: "b4-board dark smk-viewwrap" }, viewImg);
  const focusLabel = el("div", { class: "smk-focus-cap", html: "초점 손잡이를 천천히 돌려 보세요" });
  const focus = el("input", {
    class: "smk-focus",
    attrs: { type: "range", min: "0", max: "100", value: "16", "aria-label": "초점 손잡이" },
  }) as HTMLInputElement;
  obsWrap.append(segRow, viewWrap, focusLabel, focus);

  const compareBox = el("div", { class: "hook-choices smk-ask" });
  compareBox.style.display = "none";

  host.append(goalChips, helper, slideStage, toolRow, askBox, obsWrap, compareBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ── 목표 ──
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
        "관찰 일지 완성! <b>얇게 바르고 → 염색하고 → 비스듬히 덮고 → 거름종이</b> 절차로 표본을 만들고, 초점을 맞춰 <b>동물세포와 식물세포의 차이</b>까지 눈으로 확인했어요.";
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  let toolIdx = 0;
  const advanceTool = (): void => {
    toolBtns[toolIdx]?.classList.add("done");
    toolIdx += 1;
    toolBtns.forEach((b, i) => {
      b.disabled = i !== toolIdx;
    });
  };

  function useTool(id: string): void {
    haptic(HAPTIC.tap);
    if (id === "swab") {
      q<SVGGElement>(".smk-mark").setAttribute("opacity", "1");
      helper.innerHTML = "볼 안쪽을 문질러 받침 유리에 발랐어요. 그런데… 유리가 <b>거의 그대로 투명</b>해 보이네요?";
      advanceTool();
    } else if (id === "stain") {
      toolBtns[1].disabled = true;
      helper.innerHTML = "세포는 색이 거의 없어서 그냥 보면 잘 안 보여요. <b>어떻게 하면 잘 보일까요?</b>";
      showAsk(askBox, [
        { t: "색깔 있는 약품으로 세포를 물들인다", ok: true },
        { t: "더 밝은 손전등으로 비춘다", ok: false },
        { t: "물을 더 많이 넣는다", ok: false },
      ], (ok) => {
        helper.innerHTML = ok
          ? "정답! <b>메틸렌 블루</b> 용액을 한 방울 떨어뜨리고 <b>1분쯤 놓아두면</b> — 유전물질이 <b>푸른색</b>으로 물들어 핵이 또렷해져요."
          : "빛을 밝게 해도 투명한 건 투명해요. 답은 <b>염색</b> — 메틸렌 블루를 한 방울 떨어뜨리고 <b>1분쯤 놓아두면</b> 유전물질이 <b>푸른색</b>으로 물들어 핵이 또렷해져요.";
        q<SVGGElement>(".smk-drop").setAttribute("opacity", "1");
        advanceTool();
      });
    } else if (id === "cover") {
      toolBtns[2].disabled = true;
      helper.innerHTML = "이제 덮개 유리를 덮을 차례 — <b>어떻게 덮을까요?</b>";
      showAsk(askBox, [
        { t: "비스듬히 기울여서 천천히 덮는다", ok: true },
        { t: "위에서 한 번에 바로 덮는다", ok: false },
      ], (ok) => {
        if (ok) {
          q<SVGGElement>(".smk-cover").setAttribute("opacity", "1");
          helper.innerHTML = "부드럽게 안착! 비스듬히 덮으면 공기가 밀려나 <b>기포가 생기지 않아요</b>.";
          advanceTool();
        } else {
          q<SVGGElement>(".smk-cover").setAttribute("opacity", "1");
          q<SVGGElement>(".smk-bubbles").setAttribute("opacity", "1");
          slideStage.classList.add("shake");
          haptic(HAPTIC.wrong);
          helper.innerHTML = "앗, <b>기포</b>가 뽕뽕! 기포는 시야를 가려 관찰을 방해해요. 덮개를 들어내고 <b>다시</b> 해 봐요.";
          later(() => {
            slideStage.classList.remove("shake");
            q<SVGGElement>(".smk-cover").setAttribute("opacity", "0");
            q<SVGGElement>(".smk-bubbles").setAttribute("opacity", "0");
            toolBtns[2].disabled = false; // 같은 단계 재시도
          }, 1500);
        }
      });
    } else if (id === "paper") {
      q<SVGGElement>(".smk-paper").setAttribute("opacity", "1");
      later(() => q<SVGGElement>(".smk-paper").setAttribute("opacity", "0"), 900);
      advanceTool();
      collect("make", "완성!");
      helper.innerHTML = "여분의 용액까지 정리 — <b>현미경표본 완성</b>! 이제 현미경에 올려요.";
      later(() => {
        slideStage.style.display = "none";
        toolRow.style.display = "none";
        obsWrap.style.display = "";
        helper.innerHTML = "화면이 뿌옇죠? 실제 현미경처럼 <b>초점 손잡이</b>를 돌려 선명하게 맞춰 보세요. (검정말잎 표본은 미리 만들어 뒀어요!)";
        later(() => obsWrap.scrollIntoView({ behavior: "smooth", block: "nearest" }), 140);
      }, 1300);
    }
  }

  /** 랩 내 선택지 공용 — 질문(helper의 현재 문구)을 선택지 위 .hook-q로 복제, 표시 순서 셔플. */
  function showAsk(box: HTMLElement, choices: { t: string; ok: boolean }[], onPick: (ok: boolean) => void): void {
    box.innerHTML = "";
    box.style.display = "";
    box.appendChild(el("div", { class: "hook-q", html: helper.innerHTML }));
    const order = choices.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let picked = false;
    order.forEach((idx) => {
      const c = choices[idx];
      const b = el("button", { class: "hook-choice", text: c.t, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (picked) return;
        picked = true;
        haptic(c.ok ? HAPTIC.select : HAPTIC.wrong);
        const btns = [...box.querySelectorAll<HTMLButtonElement>(".hook-choice")];
        btns.forEach((x) => {
          const mine = x === b;
          x.classList.add(mine ? (c.ok ? "sel" : "miss") : "dim");
          x.disabled = true;
        });
        if (!c.ok) {
          const goodBtn = btns.find((x) => x.textContent === choices.find((y) => y.ok)?.t);
          goodBtn?.classList.remove("dim");
          goodBtn?.classList.add("reveal");
        }
        later(() => {
          box.style.display = "none";
          onPick(c.ok);
        }, c.ok ? 700 : 1600);
      });
      box.appendChild(b);
    });
    later(() => box.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  }

  // ── 관찰: 초점 + 표본 스왑 ──
  const SPECIMENS = {
    cheek: { img: "exam/u2/cheek-cells.webp", sharp: 68, name: "입안 상피세포", found: false },
    elodea: { img: "exam/u2/elodea-cells.webp", sharp: 38, name: "검정말잎", found: false },
  };
  let curSpec: keyof typeof SPECIMENS = "cheek";
  let holdTimer = 0;

  function blurOf(v: number): number {
    const d = Math.abs(v - SPECIMENS[curSpec].sharp);
    return Math.min(11, (d / 46) * 11);
  }
  function applyFocus(): void {
    const b = blurOf(Number(focus.value));
    viewImg.style.filter = `blur(${b.toFixed(2)}px)`;
    const spec = SPECIMENS[curSpec];
    if (b < 1.3 && !spec.found) {
      window.clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        if (blurOf(Number(focus.value)) < 1.3 && !spec.found) {
          spec.found = true;
          haptic(HAPTIC.correct);
          focusLabel.innerHTML = curSpec === "cheek"
            ? "<b>선명!</b> 파랗게 염색된 <b>핵</b>이 점처럼 또렷해요 — 납작하고 편평한 상피세포죠."
            : "<b>선명!</b> 각진 칸이 벽돌담처럼 — 칸마다 <b>초록 알갱이(엽록체)</b>가 가득해요.";
          if (SPECIMENS.cheek.found && SPECIMENS.elodea.found) {
            collect("focus", "둘 다 선명!");
            later(showCompare, 900);
          } else {
            helper.innerHTML = "한 표본 성공! 위 버튼으로 <b>다른 표본</b>으로 바꿔 마저 관찰해요.";
          }
        }
      }, 420);
      timers.add(holdTimer);
    }
  }
  focus.addEventListener("input", applyFocus);
  applyFocus();

  function swapSpec(k: keyof typeof SPECIMENS): void {
    if (curSpec === k) return;
    curSpec = k;
    haptic(HAPTIC.tap);
    segCheek.classList.toggle("cur", k === "cheek");
    segElodea.classList.toggle("cur", k === "elodea");
    viewImg.src = `${BASE}${SPECIMENS[k].img}`;
    focus.value = String(k === "cheek" ? 16 : 84); // 새 표본 = 초점이 다시 흐려진다
    focusLabel.innerHTML = `<b>${SPECIMENS[k].name}</b> 표본 — 초점을 다시 맞춰요`;
    applyFocus();
  }
  segCheek.addEventListener("click", () => swapSpec("cheek"));
  segElodea.addEventListener("click", () => swapSpec("elodea"));

  let compareShown = false;
  function showCompare(): void {
    if (compareShown) return;
    compareShown = true;
    helper.innerHTML = "두 표본을 모두 봤어요 — 마지막 질문!";
    compareBox.style.display = "";
    compareBox.appendChild(el("div", { class: "hook-q", html: "두 세포에서 <b>다르게</b> 보인 것은 무엇이었나요?" }));
    const choices = [
      { t: "검정말잎 세포에만 각진 칸(세포벽)과 초록 알갱이(엽록체)가 보였다", ok: true },
      { t: "입안 상피세포에만 초록 알갱이가 보였다", ok: false },
      { t: "두 세포는 완전히 똑같이 생겼다", ok: false },
    ];
    const order = choices.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let picked = false;
    order.forEach((idx) => {
      const c = choices[idx];
      const b = el("button", { class: "hook-choice", text: c.t, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (picked) return;
        picked = true;
        haptic(c.ok ? HAPTIC.correct : HAPTIC.wrong);
        const btns = [...compareBox.querySelectorAll<HTMLButtonElement>(".hook-choice")];
        btns.forEach((x) => {
          const mine = x === b;
          x.classList.add(mine ? (c.ok ? "sel" : "miss") : "dim");
          x.disabled = !mine;
        });
        if (!c.ok) {
          const goodBtn = btns.find((x) => x.textContent === choices[0].t);
          goodBtn?.classList.remove("dim");
          goodBtn?.classList.add("reveal");
        }
        api.recordQuiz(c.ok);
        helper.innerHTML = c.ok
          ? "정확한 관찰! <b>세포벽과 엽록체</b>는 식물세포에만 있어서, 현미경 사진만으로도 동물/식물을 구별할 수 있어요."
          : "사진을 다시 떠올려요 — 각진 칸과 초록 알갱이는 <b>검정말잎(식물)</b> 쪽이었죠. 세포벽·엽록체가 식물세포의 증거예요.";
        collect("compare", "세포벽·엽록체!");
      });
      compareBox.appendChild(b);
    });
    later(() => compareBox.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  }

  api.setCTA("표본을 만들어 관찰까지!", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    window.clearTimeout(holdTimer);
  };
};
