// [중1 Ⅱ v3] L7 beakIslandsLab — 「두 섬의 새」(기함).
// 교과서 해 보기(책 52~53쪽 — 변이가 있는 새 무리가 두 섬에서 변해 가는 과정)의 조작판.
// 과학 가드(위반 금지): 개체의 부리는 평생 변하지 않는다 — 세대마다 변하는 것은 무리의 "구성"뿐.
//   시뮬은 종류별 마리 수만 다룬다(개체 돌연변이 없음 — 라마르크식 오개념의 구조적 차단).
//   '자연선택'·'진화' 용어 금지 — "적합한 변이를 가진 새가 더 많이 살아남아 자손을 남긴다"로만.
// 수 규칙(결정적): 유리 = ×1.5 반올림 · 불리 = 절반 내림 · 시작 각 4마리 → 3세대에 불리 부리 0.
//   검산 (가): 두꺼운 4→6→9→14, 가는/짧은 4→2→1→0. (나)는 가는 부리가 유리(대칭).
// 표기: 「섬 (가)」·「섬 (나)」(괄호 필수 — 사용자 확정). 예측(첫 시도)만 recordQuiz.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import type { StepRenderer } from "../../types";

interface BklStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Beak = "thick" | "thin" | "short";
const BEAK_NAME: Record<Beak, string> = { thick: "크고 두꺼운 부리", thin: "길고 가는 부리", short: "짧고 작은 부리" };
const BEAK_COLOR: Record<Beak, string> = { thick: "#E8590C", thin: "#1971C2", short: "#8B95A1" };

/** 새 한 마리(부리 종류별) — 몸통은 동일, 부리만 다르다(부리=변이가 한눈에). */
function birdIcon(beak: Beak): string {
  const beakPath =
    beak === "thick"
      ? `<path d="M15 -2 l11 4 -11 5 Z" fill="${BEAK_COLOR.thick}"/>`
      : beak === "thin"
        ? `<path d="M15 0 l15 2 -15 3 Z" fill="${BEAK_COLOR.thin}"/>`
        : `<path d="M15 0 l6 2 -6 2.6 Z" fill="${BEAK_COLOR.short}"/>`;
  return `<g>
    <ellipse cx="4" cy="6" rx="11" ry="8" fill="#FFF8EC" stroke="#5F574A" stroke-width="1.8"/>
    <circle cx="11" cy="-1" r="6" fill="#FFF8EC" stroke="#5F574A" stroke-width="1.8"/>
    <circle cx="13" cy="-2" r="1.2" fill="#333"/>
    <path d="M-2 4 q-5 -5 -1 -9" stroke="#5F574A" stroke-width="1.6" fill="none"/>
    ${beakPath}
  </g>`;
}

/** 섬 무대 — 먹이(씨앗/나무 구멍)와 새 도트들. */
function islandSvg(kind: "seed" | "bug"): string {
  const food =
    kind === "seed"
      ? `<g transform="translate(24 118)">
          <circle cx="0" cy="0" r="7" fill="#D9B678" stroke="#A9854A" stroke-width="2"/>
          <circle cx="14" cy="5" r="7" fill="#D9B678" stroke="#A9854A" stroke-width="2"/>
          <circle cx="7" cy="12" r="7" fill="#D9B678" stroke="#A9854A" stroke-width="2"/>
          <path d="M-3 -2 l5 3 M12 3 l5 3" stroke="#8A6636" stroke-width="1.4"/>
        </g>`
      : `<g transform="translate(20 84)">
          <rect x="0" y="0" width="18" height="56" rx="8" fill="#C9A16B" stroke="#8A6636" stroke-width="2.2"/>
          <ellipse cx="9" cy="14" rx="4" ry="7" fill="#5F4A2E"/>
          <ellipse cx="9" cy="38" rx="4" ry="7" fill="#5F4A2E"/>
          <circle cx="9" cy="14" r="2.2" fill="#2F9E44"/>
          <circle cx="9" cy="38" r="2.2" fill="#2F9E44"/>
        </g>`;
  return `
  <svg viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="0" y="128" width="160" height="22" fill="#A5D8FF"/>
    <path d="M6 130 C30 96 130 96 154 130 Z" fill="#D8CFA8" stroke="#A99B6B" stroke-width="2.4"/>
    ${food}
    <g class="bkl-flock"></g>
  </svg>`;
}

/** 세대 규칙 — 유리 ×1.5 반올림, 불리 절반 내림(1→0 소멸). 표시는 최대 14도트. */
function nextGen(counts: Record<Beak, number>, fav: Beak): Record<Beak, number> {
  const out = {} as Record<Beak, number>;
  (Object.keys(counts) as Beak[]).forEach((b) => {
    out[b] = b === fav ? Math.min(14, Math.round(counts[b] * 1.5)) : Math.floor(counts[b] / 2);
  });
  return out;
}

export const beakIslandsLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BklStep;
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
    el("div", { class: "pn-badge b4", dataset: { g: "predict" } }, el("b", { text: "예측" }), el("span", { text: "질문 대기" })),
    el("div", { class: "pn-badge b4", dataset: { g: "gen" } }, el("b", { text: "3세대 관찰" }), el("span", { text: "0/3" })),
    el("div", { class: "pn-badge b4", dataset: { g: "law" } }, el("b", { text: "결론 발견" }), el("span", { text: "질문 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "부리가 <b>제각각(변이)</b>인 한 종류의 새 무리가 두 섬으로 날아갔어요. <b>섬 (가)</b>엔 크고 단단한 씨앗이, <b>섬 (나)</b>엔 나무 속 작은 곤충이 많죠. 먼저 예측부터!",
  });

  const islandA = el("div", { class: "bkl-island" });
  islandA.innerHTML = `${islandSvg("seed")}<b>섬 (가) · 단단한 씨앗</b>`;
  const islandB = el("div", { class: "bkl-island" });
  islandB.innerHTML = `${islandSvg("bug")}<b>섬 (나) · 나무 속 곤충</b>`;
  const counterA = el("div", { class: "bkl-count" });
  const counterB = el("div", { class: "bkl-count" });
  const board = el(
    "div",
    { class: "b4-board bkl-board" },
    el("div", { class: "bkl-islands" }, el("div", {}, islandA, counterA), el("div", {}, islandB, counterB)),
  );

  const genBtn = el("button", { class: "bkl-gen", text: "한 세대 지나기", attrs: { type: "button" } }) as HTMLButtonElement;
  genBtn.disabled = true;
  const genRow = el("div", { class: "bkl-genrow" }, genBtn);

  const askBox = el("div", { class: "hook-choices bkl-ask" });
  askBox.style.display = "none";
  const lawBox = el("div", { class: "hook-choices bkl-ask" });
  lawBox.style.display = "none";

  host.append(goalChips, helper, board, genRow, askBox, lawBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ── 상태 ──
  let countsA: Record<Beak, number> = { thick: 4, thin: 4, short: 4 };
  let countsB: Record<Beak, number> = { thick: 4, thin: 4, short: 4 };
  let gen = 0;

  function renderFlock(island: HTMLElement, counts: Record<Beak, number>): void {
    const flock = island.querySelector(".bkl-flock") as SVGGElement;
    const parts: string[] = [];
    let i = 0;
    (Object.keys(counts) as Beak[]).forEach((b) => {
      for (let k = 0; k < counts[b]; k++) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 58 + col * 26 + (row % 2) * 7;
        const y = 58 + row * 22;
        parts.push(`<g transform="translate(${x} ${y}) scale(0.82)">${birdIcon(b)}</g>`);
        i += 1;
      }
    });
    flock.innerHTML = parts.join("");
  }
  function renderCounts(): void {
    const chip = (b: Beak, n: number): string =>
      `<span class="bkl-chip" style="--c:${BEAK_COLOR[b]}${n === 0 ? ";opacity:.35" : ""}">${BEAK_NAME[b].slice(0, 6)} <b>${n}</b></span>`;
    counterA.innerHTML = (Object.keys(countsA) as Beak[]).map((b) => chip(b, countsA[b])).join("");
    counterB.innerHTML = (Object.keys(countsB) as Beak[]).map((b) => chip(b, countsB[b])).join("");
    renderFlock(islandA, countsA);
    renderFlock(islandB, countsB);
  }
  renderCounts();

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
        "정리하면, <b>변이가 다양한 무리</b>가 서로 다른 환경에서 살면, <b>각 환경에 적합한 변이를 가진 생물이 더 많이 살아남아 자손을 남기고</b>, 아주 오랜 시간이 지나면 서로 다른 생물 무리로 나뉠 수 있어요. 이렇게 <b>생물의 종류가 다양해진답니다</b>.";
      api.enableCTA(s.cta ?? "정리하기");
    }
  }

  // ① 예측(첫 시도 채점)
  later(() => {
    b4Ask(
      askBox,
      "<b>섬 (가)(크고 단단한 씨앗)</b>에서는 어떤 부리를 가진 새가 살아남기 유리할까요?",
      [
        { t: "크고 두꺼운 부리, 단단한 씨앗을 깨기 좋아서", ok: true },
        { t: "길고 가는 부리, 씨앗을 멀리서 집을 수 있어서", ok: false },
        { t: "부리 모양은 살아남기와 관계없다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "좋은 예측! 정말 그런지 <b>세대를 넘겨 가며</b> 지켜봐요. 버튼을 눌러 시간을 흘려요."
          : "씨앗은 <b>깨야</b> 먹을 수 있어요. 호두까기처럼 <b>두꺼운 부리</b>가 유리하죠. 정말 그런지 세대를 넘겨 확인해요!";
        collect("predict", ok ? "적중!" : "확인 완료");
        genBtn.disabled = false;
        later(() => genBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
      },
    );
  }, 600);

  // ② 세대 진행 3회
  genBtn.addEventListener("click", () => {
    if (gen >= 3) return;
    haptic(HAPTIC.tap);
    gen += 1;
    countsA = nextGen(countsA, "thick");
    countsB = nextGen(countsB, "thin");
    renderCounts();
    const chip = goalChips.querySelector('[data-g="gen"]') as HTMLElement;
    chip.querySelector("span")!.textContent = `${gen}/3`;
    genBtn.textContent = gen < 3 ? `한 세대 지나기 (${gen}/3)` : "3세대 완료";
    if (gen === 1)
      helper.innerHTML =
        "벌써 차이가 보여요. <b>먹이에 맞는 부리</b>는 새끼를 많이 남기고, 못 먹는 부리는 줄어들어요. <b>새 한 마리의 부리가 변한 게 아니라</b>, 살아남은 새의 자손이 늘어난 거예요!";
    if (gen === 2) helper.innerHTML = "불리한 부리가 점점 사라져요. 한 세대 더!";
    if (gen === 3) {
      genBtn.disabled = true;
      collect("gen", "3세대!");
      helper.innerHTML =
        "오랜 시간이 지나자, <b>섬 (가)엔 크고 두꺼운 부리</b>, <b>섬 (나)엔 길고 가는 부리</b>를 가진 새만 남았어요!";
      later(showLaw, 1100);
    }
  });

  // ③ 결론 질문
  let lawShown = false;
  function showLaw(): void {
    if (lawShown) return;
    lawShown = true;
    b4Ask(
      lawBox,
      "처음엔 <b>한 종류</b>였던 두 섬의 새 무리, 시간이 아주 오래 지나면 어떻게 될까요?",
      [
        { t: "무리 사이의 차이가 커져 서로 다른 종류로 나뉠 수 있다", ok: true },
        { t: "다시 섞이면 금방 원래 모습으로 돌아온다", ok: false },
        { t: "새들이 부리를 스스로 바꿔 서로 닮아 간다", ok: false },
      ],
      (ok) => {
        helper.innerHTML = ok
          ? "맞아요! 이 과정이 <b>아주 오랜 시간</b> 반복되면 무리 사이의 차이가 커져 <b>서로 다른 종류의 생물 무리</b>로 나뉠 수 있어요. 변이가 생물의 종류를 다양하게 만드는 원동력이죠."
          : "새는 부리를 <b>스스로 바꿀 수 없어요</b>(태어날 때 정해진 변이!). 오랜 시간 살아남기가 반복되면 무리의 차이가 커져 <b>서로 다른 종류로 나뉠 수 있다</b>는 게 핵심이랍니다.";
        collect("law", "종류 다양화!");
      },
    );
  }

  api.setCTA("예측 → 3세대 → 결론까지!", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
