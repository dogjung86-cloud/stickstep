// [중1 Ⅱ v3] L9 kingdomGateLab — 「다섯 왕국 검색표 여행」.
// 교과서 탐구(책 30~31쪽 검색표)의 조작판: 생물 5종이 차례로 관문(예/아니요)을 내려가
// 자기 왕국 방에 도착한다 — 관문 순서가 곧 5계를 가르는 열쇠(핵막→나머지 무리→광합성→운동성).
// 판단 근거(특징 카드)는 무대 위(helper와 무대 사이 — kingdomKey 배치 교훈), 조작부는 아래.
// 생물 아이콘은 구작 검증 발주 자산(figures.organism) 재사용. 첫 여행자(대장균) 첫 시도만 recordQuiz.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { organism } from "../../../ui/figures";
import type { StepRenderer } from "../../types";

interface KgtStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 관문 4개 — 교과서 검색표 문구 그대로. yes/no가 각각 방(계) 또는 다음 관문. */
const GATES = [
  { q: "유전물질이 <b>핵막</b>으로 싸여 있나요?", yes: "g1", no: "R원핵생물계" },
  { q: "균계·식물계·동물계가 <b>아닌</b> 생물 무리인가요?", yes: "R원생생물계", no: "g2" },
  { q: "<b>광합성</b>을 하나요?", yes: "R식물계", no: "g3" },
  { q: "<b>세포벽이 없고 운동성</b>이 있나요?", yes: "R동물계", no: "R균계" },
] as const;

interface Traveler {
  name: string;
  hints: string[];
  path: ("yes" | "no")[]; // 관문 0부터의 정답 경로
  home: string;
}
const TRAVELERS: Traveler[] = [
  { name: "대장균", hints: ["몸이 세포 1개", "핵이 뚜렷하게 구분되지 않아요", "세포벽 있음"], path: ["no"], home: "원핵생물계" },
  { name: "아메바", hints: ["대부분 세포 1개", "핵막으로 싸인 핵 있음", "균·식물·동물 어디에도 딱 맞지 않아요"], path: ["yes", "yes"], home: "원생생물계" },
  { name: "소나무", hints: ["세포 여러 개", "핵막 있음 · 세포벽 있음", "빛으로 스스로 양분을 만들어요"], path: ["yes", "no", "yes"], home: "식물계" },
  { name: "박새", hints: ["세포 여러 개 · 핵막 있음", "세포벽 없음", "날아다니며 먹이를 잡아먹어요"], path: ["yes", "no", "no", "yes"], home: "동물계" },
  { name: "버섯", hints: ["세포 여러 개 · 핵막 있음", "세포벽 있음 · 움직이지 못해요", "광합성 못 함 — 죽은 생물을 분해"], path: ["yes", "no", "no", "no"], home: "균계" },
];

const ROOMS = ["원핵생물계", "원생생물계", "식물계", "동물계", "균계"];

export const kingdomGateLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as KgtStep;
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
    el("div", { class: "pn-badge b4", dataset: { g: "r2" } }, el("b", { text: "방 2곳" }), el("span", { text: "0/2" })),
    el("div", { class: "pn-badge b4", dataset: { g: "r4" } }, el("b", { text: "방 4곳" }), el("span", { text: "0/4" })),
    el("div", { class: "pn-badge b4", dataset: { g: "r5" } }, el("b", { text: "다섯 왕국" }), el("span", { text: "0/5" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "생물 다섯이 자기 <b>왕국(계)</b>을 찾아가요. 여행자의 <b>특징 카드</b>를 읽고, 관문의 질문에 <b>예/아니요</b>로 답해 길을 안내하세요!",
  });

  // 여행자 카드(판단 근거 — 무대 위)
  const travName = el("b", { text: "" });
  const travArt = el("span", { class: "kgt-trav-art" });
  const travHints = el("ul", { class: "kgt-hints" });
  const travCard = el("div", { class: "kgt-trav" }, travArt, el("div", { class: "kgt-trav-txt" }, travName, travHints));

  // 관문 + 방 무대
  const gateQ = el("div", { class: "kgt-gate-q" });
  const roomRow = el("div", { class: "kgt-rooms" });
  const roomEls: Record<string, HTMLElement> = {};
  ROOMS.forEach((r) => {
    const room = el("div", { class: "kgt-room" }, el("span", { class: "kgt-room-art" }), el("b", { text: r }));
    roomEls[r] = room;
    roomRow.appendChild(room);
  });
  const board = el("div", { class: "b4-board kgt-board" }, gateQ, roomRow);

  // 조작부: 예/아니요
  const yesBtn = el("button", { class: "kgt-ans yes", text: "예", attrs: { type: "button" } }) as HTMLButtonElement;
  const noBtn = el("button", { class: "kgt-ans no", text: "아니요", attrs: { type: "button" } }) as HTMLButtonElement;
  const ansRow = el("div", { class: "kgt-ansrow" }, yesBtn, noBtn);

  host.append(goalChips, helper, travCard, board, ansRow);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let ti = 0; // 현재 여행자
  let gi = 0; // 현재 관문(경로 인덱스)
  let arrived = 0;
  let firstTravFirstTry = true;
  let recorded = false;
  let finished = false;

  function loadTraveler(): void {
    const t = TRAVELERS[ti];
    gi = 0;
    travName.textContent = t.name;
    travArt.innerHTML = organism(t.name);
    travHints.innerHTML = t.hints.map((h) => `<li>${h}</li>`).join("");
    travCard.classList.remove("pop");
    void travCard.offsetWidth;
    travCard.classList.add("pop");
    showGate();
  }

  function gateIndex(): number {
    // 경로 인덱스 gi = 지금까지 통과한 관문 수 — 관문 번호와 동일(경로가 항상 다음 관문으로 이어짐)
    return gi;
  }

  function showGate(): void {
    const g = GATES[gateIndex()];
    gateQ.innerHTML = `<span class="kgt-gate-n">관문 ${gateIndex() + 1}</span> ${g.q}`;
    gateQ.classList.remove("pop");
    void gateQ.offsetWidth;
    gateQ.classList.add("pop");
  }

  function answer(a: "yes" | "no"): void {
    if (finished) return;
    const t = TRAVELERS[ti];
    const correct = t.path[gi];
    if (a !== correct) {
      haptic(HAPTIC.wrong);
      board.classList.add("shake");
      if (ti === 0) firstTravFirstTry = false;
      const g = GATES[gateIndex()];
      helper.innerHTML = `특징 카드를 다시 봐요 — <b>${t.name}</b>: ${t.hints.join(" · ")}. ${g.q.replace(/<[^>]*>/g, "")} 답이 보일 거예요!`;
      later(() => board.classList.remove("shake"), 600);
      return;
    }
    haptic(HAPTIC.select);
    const g = GATES[gateIndex()];
    const dest = a === "yes" ? g.yes : g.no;
    if (dest.startsWith("R")) {
      const home = dest.slice(1);
      const room = roomEls[home];
      (room.querySelector(".kgt-room-art") as HTMLElement).innerHTML = organism(t.name);
      room.classList.add("filled", "pop");
      haptic(HAPTIC.correct);
      arrived += 1;
      updateGoals();
      helper.innerHTML = `<b>${t.name}</b>, <b>${home}</b> 도착! ${arrivalNote(home)}`;
      if (ti === 0 && !recorded) {
        recorded = true;
        api.recordQuiz(firstTravFirstTry);
      }
      ti += 1;
      if (ti < TRAVELERS.length) {
        later(loadTraveler, 1500);
      } else {
        finished = true;
        gateQ.innerHTML = `<span class="kgt-gate-n">여행 완료</span> 다섯 왕국이 모두 찼어요!`;
        later(() => {
          helper.innerHTML =
            "다섯 왕국 완성! 갈림길의 열쇠는 <b>핵막이 있는가 → 어느 무리에도 안 맞는가 → 광합성을 하는가 → 세포벽 없이 움직이는가</b> — 이 질문 사슬만 기억하면 어떤 생물이든 제 왕국을 찾아 줄 수 있어요.";
          api.enableCTA(s.cta ?? "왕국 도감 펼치기");
        }, 900);
      }
    } else {
      gi += 1;
      helper.innerHTML = `통과! 다음 관문으로 — <b>${t.name}</b>의 특징 카드를 계속 참고하세요.`;
      showGate();
    }
  }
  yesBtn.addEventListener("click", () => answer("yes"));
  noBtn.addEventListener("click", () => answer("no"));

  function arrivalNote(home: string): string {
    switch (home) {
      case "원핵생물계": return "핵막이 없는 단세포 왕국 — 세균들의 나라예요.";
      case "원생생물계": return "핵막은 있지만 균·식물·동물 어디에도 안 맞는 '나머지' 왕국이에요.";
      case "식물계": return "광합성으로 스스로 양분을 만드는 왕국!";
      case "동물계": return "세포벽 없이 움직이며 먹이를 섭취하는 왕국!";
      default: return "광합성 없이 죽은 생물을 분해해 양분을 얻는 왕국 — 버섯의 진짜 집이죠!";
    }
  }

  function updateGoals(): void {
    const set = (id: string, cur: number, max: number, label: string): void => {
      const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
      chip.querySelector("span")!.textContent = cur >= max ? label : `${Math.min(cur, max)}/${max}`;
      if (cur >= max && !chip.classList.contains("on")) {
        chip.classList.add("on");
        haptic(HAPTIC.ctaUnlock);
      }
    };
    set("r2", arrived, 2, "채움!");
    set("r4", arrived, 4, "채움!");
    set("r5", arrived, 5, "완성!");
  }

  loadTraveler();
  api.setCTA("다섯 왕국을 모두 채워요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
