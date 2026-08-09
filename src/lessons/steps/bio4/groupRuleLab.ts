// [중1 Ⅱ v3] L8 groupRuleLab — 「기준 스위치」.
// 한 통찰: 어떤 기준을 고르느냐에 따라 무리가 완전히 달라진다 — 겉모습(날개)·사는 곳은
// 이상한 짝(박쥐+나비, 고래+붕어)을 만들고, 고유한 특징(번식 방법)이라야 멀고 가까움이 보인다.
// 조작: 기준 버튼 3개를 차례로 탭 → 생물 카드 6장이 두 무리로 재배치(CSS transform 이동).
// 마지막 판정 질문(첫 시도)만 recordQuiz. 카드 실루엣은 식별 기호 과장 관행(biomedoor 교훈).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import type { StepRenderer } from "../../types";

interface GrlStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Animal = "gull" | "bat" | "squirrel" | "whale" | "fish" | "butterfly";
const ANIMAL_NAME: Record<Animal, string> = {
  gull: "갈매기", bat: "박쥐", squirrel: "다람쥐", whale: "고래", fish: "붕어", butterfly: "나비",
};

/** 생물 미니 아이콘 — 식별 기호 하나를 과장(갈매기 V날개·박쥐 막날개·다람쥐 큰 꼬리·고래 물줄기·붕어 지느러미·나비 무늬 날개). */
function animalIcon(a: Animal): string {
  const body: Record<Animal, string> = {
    gull: `<path d="M8 26 q14 -12 24 0 q10 -12 24 0" stroke="#5F574A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="32" cy="34" rx="13" ry="8" fill="#FFFFFF" stroke="#5F574A" stroke-width="2.4"/>
      <circle cx="43" cy="28" r="5.5" fill="#FFFFFF" stroke="#5F574A" stroke-width="2.4"/>
      <path d="M48 28 l7 2.4 -7 2.4 Z" fill="#F08C00"/>`,
    bat: `<path d="M32 30 q-6 -8 -16 -9 q3 5 1 9 q-5 -1 -9 2 q5 3 6 8 q8 -2 18 -2 q10 0 18 2 q1 -5 6 -8 q-4 -3 -9 -2 q-2 -4 1 -9 q-10 1 -16 9 Z" fill="#8B95A1" stroke="#4E5968" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="32" cy="34" r="7.5" fill="#B9C2CC" stroke="#4E5968" stroke-width="2.2"/>
      <path d="M28 27 l-2 -6 4 3 Z M36 27 l2 -6 -4 3 Z" fill="#8B95A1" stroke="#4E5968" stroke-width="1.8"/>`,
    squirrel: `<path d="M40 40 q14 -2 12 -16 q-2 -10 -12 -10 q6 8 2 16 Z" fill="#C9772E" stroke="#8A4E16" stroke-width="2.2"/>
      <ellipse cx="28" cy="34" rx="11" ry="9" fill="#E8A05C" stroke="#8A4E16" stroke-width="2.2"/>
      <circle cx="20" cy="26" r="6" fill="#E8A05C" stroke="#8A4E16" stroke-width="2.2"/>
      <circle cx="18" cy="24" r="1.4" fill="#4A2C10"/>
      <path d="M16 21 l-2 -4 3 1 Z" fill="#E8A05C" stroke="#8A4E16" stroke-width="1.6"/>`,
    whale: `<path d="M10 36 q10 -12 30 -10 q14 2 14 9 q0 6 -12 7 q-22 2 -32 -6 Z" fill="#74A8DB" stroke="#2E5E8E" stroke-width="2.4"/>
      <path d="M52 36 l8 -5 -2 7 6 4 -10 0 Z" fill="#74A8DB" stroke="#2E5E8E" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="20" cy="32" r="1.6" fill="#1E3E5E"/>
      <path d="M18 24 q-1 -6 -4 -8 M18 24 q1 -6 4 -8 M18 24 q0 -7 0 -9" stroke="#4DABF7" stroke-width="2" stroke-linecap="round" fill="none"/>`,
    fish: `<ellipse cx="30" cy="32" rx="16" ry="10" fill="#E8A05C" stroke="#A8611E" stroke-width="2.4"/>
      <path d="M46 32 l12 -8 v16 Z" fill="#E8A05C" stroke="#A8611E" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M26 22 q4 -5 8 0 Z M26 42 q4 5 8 0 Z" fill="#F5C08A" stroke="#A8611E" stroke-width="1.8"/>
      <circle cx="21" cy="30" r="1.7" fill="#5E3A10"/>`,
    butterfly: `<path d="M32 24 q-12 -12 -18 -4 q-4 6 8 12 q-12 4 -6 11 q5 6 16 -7 Z" fill="#B197FC" stroke="#7048E8" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M32 24 q12 -12 18 -4 q4 6 -8 12 q12 4 6 11 q-5 6 -16 -7 Z" fill="#D0BFFF" stroke="#7048E8" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="32" cy="33" rx="3" ry="9" fill="#4E5968"/>
      <path d="M30 24 q-2 -5 -5 -6 M34 24 q2 -5 5 -6" stroke="#4E5968" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="24" cy="24" r="2" fill="#7048E8"/><circle cx="40" cy="24" r="2" fill="#7048E8"/>`,
  };
  return `<svg viewBox="0 0 64 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body[a]}</svg>`;
}

interface Rule {
  id: string;
  label: string;
  groupA: Animal[];
  note: string;
}
const RULES: Rule[] = [
  {
    id: "wing",
    label: "날개가 있다?",
    groupA: ["gull", "bat", "butterfly"],
    note: "날개 기준이면 <b>갈매기·박쥐·나비</b>가 한 무리 — 새·젖먹이·곤충이 뒤죽박죽이에요. 뭔가 이상하죠?",
  },
  {
    id: "water",
    label: "물에서 산다?",
    groupA: ["whale", "fish"],
    note: "사는 곳 기준이면 <b>고래가 붕어와</b> 한 무리! 그런데 고래는 알이 아니라 새끼를 낳는데… 다음 스위치!",
  },
  {
    id: "milk",
    label: "새끼를 낳아 젖을 먹인다?",
    groupA: ["bat", "squirrel", "whale"],
    note: "번식 방법 기준 — <b>박쥐가 다람쥐·고래 곁으로</b>! 온몸의 털, 새끼, 젖… 이제야 진짜 가까운 사이가 보여요.",
  },
];

export const groupRuleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as GrlStep;
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
    ...RULES.map((r, i) =>
      el("div", { class: "pn-badge b4", dataset: { g: r.id } }, el("b", { text: `스위치 ${i + 1}` }), el("span", { text: "대기 중" })),
    ),
  );
  const helper = el("div", {
    class: "helper",
    html: "생물 여섯이 모여 있어요. <b>기준 스위치</b>를 차례로 눌러 — 기준이 바뀌면 무리가 어떻게 갈라지는지 보세요.",
  });

  const board = el("div", { class: "b4-board grl-board" });
  const zoneA = el("div", { class: "grl-zone a" }, el("b", { class: "grl-zone-label", text: "무리 ①" }));
  const zoneB = el("div", { class: "grl-zone b" }, el("b", { class: "grl-zone-label", text: "무리 ②" }));
  board.append(zoneA, zoneB);
  const cards = {} as Record<Animal, HTMLElement>;
  (Object.keys(ANIMAL_NAME) as Animal[]).forEach((a) => {
    const c = el("div", { class: "grl-card" }, el("span", { class: "grl-card-art", html: animalIcon(a) }), el("b", { text: ANIMAL_NAME[a] }));
    cards[a] = c;
    zoneA.appendChild(c);
  });

  const ruleRow = el("div", { class: "grl-rules" });
  const ruleBtns = RULES.map((r, i) => {
    const b = el("button", { class: "grl-rule", text: r.label, attrs: { type: "button" } }) as HTMLButtonElement;
    b.disabled = i !== 0;
    b.addEventListener("click", () => applyRule(i));
    ruleRow.appendChild(b);
    return b;
  });

  const askBox = el("div", { class: "hook-choices grl-ask" });
  askBox.style.display = "none";

  host.append(goalChips, helper, board, ruleRow, askBox);
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

  let ri = -1;
  function applyRule(i: number): void {
    if (i !== ri + 1) return;
    ri = i;
    const r = RULES[i];
    haptic(HAPTIC.tap);
    ruleBtns.forEach((b, k) => {
      b.classList.toggle("cur", k === i);
      b.disabled = k > i + 0;
    });
    (zoneA.querySelector(".grl-zone-label") as HTMLElement).textContent = "그렇다";
    (zoneB.querySelector(".grl-zone-label") as HTMLElement).textContent = "아니다";
    (Object.keys(cards) as Animal[]).forEach((a) => {
      const target = r.groupA.includes(a) ? zoneA : zoneB;
      if (cards[a].parentElement !== target) target.appendChild(cards[a]);
      cards[a].classList.remove("pop");
      void cards[a].offsetWidth;
      cards[a].classList.add("pop");
    });
    helper.innerHTML = r.note;
    collect(r.id, r.id === "milk" ? "진짜 가족!" : "뒤죽박죽…");
    if (i < RULES.length - 1) {
      later(() => {
        ruleBtns[i + 1].disabled = false;
      }, 900);
    } else {
      later(showFinal, 1500);
    }
  }

  let finalShown = false;
  function showFinal(): void {
    if (finalShown) return;
    finalShown = true;
    b4Ask(
      askBox,
      "세 스위치를 겪어 보니 — 생물을 분류할 때 기준으로 삼아야 하는 것은 무엇일까요?",
      [
        { t: "몸의 생김새·한살이·번식 방법 같은 생물의 고유한 특징", ok: true },
        { t: "날개가 있는지 같은 겉모습 한 가지", ok: false },
        { t: "물이나 땅처럼 지금 사는 곳", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정답! <b>고유한 특징</b>을 기준으로 분류하면 생물 사이의 <b>멀고 가까운 관계</b>까지 보여요 — 박쥐의 진짜 가족을 찾아냈듯이요."
          : "날개·사는 곳 스위치에서 이상한 짝이 생겼던 걸 떠올려요 — 기준은 <b>생물의 고유한 특징</b>(생김새·한살이·번식 방법)이어야 관계가 바로 보인답니다.";
        if (!finished) {
          finished = true;
          api.enableCTA(s.cta ?? "용어로 정리하기");
        }
      },
    );
  }

  api.setCTA("스위치 셋을 차례로!", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
