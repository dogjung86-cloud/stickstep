// feastLab — 사회 Ⅷ L6: 문화·종교 배경이 다른 세 손님에게 저녁상을 차리는 배려 랩.
// 비상 156쪽 도입 활동(외국인 손님 차림표 추천)의 앱판 — 다양성 존중을 '지식'이 아니라
// '행동'으로 체험한다. 국면: 손님 한 명씩 활성 → 음식 5종 중 대접할 수 있는 것을 모두 골라
// 접시 채우기(삼가는 음식을 고르면 즉시 교정 — judgeLab traps 문법) → 세 손님 완료 후
// "모두의 한 상"(셋이 함께 먹을 공통 음식 찾기) → 최종 msn 판정(까닭 명명).
// 민감 가드: "못 먹는"이 아니라 "먹지 않는/삼가는"(신념·선택 존중 워딩), 종교는 사실 서술만,
// 금기의 환경 배경은 L7 만화 몫. 이름은 가공(아민·프리야·리아) — 실존 인물 아님.
// rAF 없음 — CSS 전환 + setTimeout 체인.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Food {
  id: string;
  name: string;
  art: string;
}

interface Guest {
  id: string;
  name: string;
  note: string; // 배경 한 줄(존중 워딩)
  ok: string[]; // 대접 가능한 음식 id
  wrong: Record<string, string>; // 곤란한 음식 id → 교정 문구
}

const F = {
  bulgogi: `<svg viewBox="0 0 48 40" fill="none" aria-hidden="true"><ellipse cx="24" cy="28" rx="20" ry="8" fill="#E8EEF5" stroke="#8A93A6" stroke-width="1.4"/><path d="M10 26q4-8 14-8t14 8q-6 4-14 4t-14-4z" fill="#A05A38" stroke="#6E3A20" stroke-width="1.3"/><path d="M16 22q4-2 8-1M26 21q4 0 7 2" stroke="#D9A76C" stroke-width="1.4" fill="none"/><path d="M20 12c-2-3 2-4 0-7M28 12c-2-3 2-4 0-7" stroke="#B8C4D4" stroke-width="1.6" fill="none"/></svg>`,
  suyuk: `<svg viewBox="0 0 48 40" fill="none" aria-hidden="true"><ellipse cx="24" cy="29" rx="20" ry="7.5" fill="#E8EEF5" stroke="#8A93A6" stroke-width="1.4"/><g stroke="#C9848E" stroke-width="1.2"><rect x="10" y="18" width="13" height="8" rx="3" fill="#F2C4CA"/><rect x="18" y="14" width="13" height="8" rx="3" fill="#F6D2D6"/><rect x="26" y="18" width="13" height="8" rx="3" fill="#F2C4CA"/></g><path d="M13 22h7M21 18h7M29 22h7" stroke="#E2A6AE" stroke-width="1.2"/></svg>`,
  bibim: `<svg viewBox="0 0 48 40" fill="none" aria-hidden="true"><path d="M8 20h32l-3 10q-1 6-8 6h-10q-7 0-8-6z" fill="#4E4038" stroke="#2E241E" stroke-width="1.4"/><ellipse cx="24" cy="20" rx="16" ry="5" fill="#F6EFE0" stroke="#B8A278" stroke-width="1.2"/><path d="M12 19q3-2 7-1M20 17q4-1 8 0M30 18q4 0 6 2" stroke="#7A9646" stroke-width="2" stroke-linecap="round"/><path d="M16 20q3 1 6 0M27 20q3 1 5 0" stroke="#D14A32" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="17" r="3" fill="#F2C24E" stroke="#C2932E" stroke-width="1"/></svg>`,
  dubu: `<svg viewBox="0 0 48 40" fill="none" aria-hidden="true"><ellipse cx="24" cy="30" rx="20" ry="7" fill="#E8EEF5" stroke="#8A93A6" stroke-width="1.4"/><g stroke="#C9C0A8" stroke-width="1.2"><rect x="9" y="16" width="10" height="9" rx="2" fill="#FBF6E8"/><rect x="9" y="24" width="10" height="5" rx="2" fill="#F4EDD8"/></g><path d="M24 18q6-4 14-2 2 4-1 8-7 3-13-1 0-3 0-5z" fill="#D14A32" stroke="#9E2E1C" stroke-width="1.2"/><path d="M27 20q4-1 8 0M26 24q4 0 8-1" stroke="#F0907E" stroke-width="1.2" fill="none"/></svg>`,
  eggroll: `<svg viewBox="0 0 48 40" fill="none" aria-hidden="true"><ellipse cx="24" cy="30" rx="20" ry="7" fill="#E8EEF5" stroke="#8A93A6" stroke-width="1.4"/><g stroke="#C2932E" stroke-width="1.2"><rect x="8" y="16" width="12" height="10" rx="4" fill="#F6D66E"/><rect x="18" y="14" width="12" height="10" rx="4" fill="#F9DF86"/><rect x="28" y="16" width="12" height="10" rx="4" fill="#F6D66E"/></g><circle cx="14" cy="21" r="2.4" fill="#F2B93E"/><circle cx="24" cy="19" r="2.4" fill="#F2B93E"/><circle cx="34" cy="21" r="2.4" fill="#F2B93E"/></svg>`,
};

const FOODS: Food[] = [
  { id: "bulgogi", name: "불고기", art: F.bulgogi },
  { id: "suyuk", name: "돼지고기 수육", art: F.suyuk },
  { id: "bibim", name: "나물 비빔밥", art: F.bibim },
  { id: "dubu", name: "두부김치", art: F.dubu },
  { id: "eggroll", name: "달걀말이", art: F.eggroll },
];

const GUESTS: Guest[] = [
  {
    id: "amin",
    name: "아민",
    note: "이슬람교를 믿어 <b>돼지고기</b>를 먹지 않아요.",
    ok: ["bulgogi", "bibim", "dubu", "eggroll"],
    wrong: {
      suyuk: "아민은 이슬람교를 믿어 <b>돼지고기를 먹지 않아요</b> — 종교에 따라 삼가는 음식이 있답니다. 다른 요리를 골라 봐요!",
    },
  },
  {
    id: "priya",
    name: "프리야",
    note: "힌두교를 믿어 <b>소고기</b>를 먹지 않아요.",
    ok: ["suyuk", "bibim", "dubu", "eggroll"],
    wrong: {
      bulgogi: "프리야는 힌두교를 믿어 <b>소고기를 먹지 않아요</b> — 힌두교에서 소는 특별한 동물이거든요. 다른 요리를 골라 봐요!",
    },
  },
  {
    id: "ria",
    name: "리아",
    note: "채식을 실천해 <b>고기</b>를 먹지 않아요 — 달걀과 채소는 먹어요.",
    ok: ["bibim", "dubu", "eggroll"],
    wrong: {
      bulgogi: "리아는 고기를 먹지 않는 <b>채식</b>을 실천 중이에요 — 달걀과 채소 요리라면 좋아한답니다!",
      suyuk: "리아는 고기를 먹지 않는 <b>채식</b>을 실천 중이에요 — 두부나 나물, 달걀 요리를 골라 봐요!",
    },
  },
];

function guestFace(id: string): string {
  const acc =
    id === "amin"
      ? `<path d="M14 9q10-6 20 0l-2 4H16z" fill="#0CA678" opacity=".25" stroke="#0CA678" stroke-width="1.2"/>`
      : id === "priya"
        ? `<circle cx="24" cy="8" r="1.6" fill="#C13B2E"/>`
        : `<path d="M31 7l4-2M32 10l5-1" stroke="#7A9646" stroke-width="1.4" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 48 44" fill="none" aria-hidden="true">
    <circle cx="24" cy="20" r="12" fill="#F6EFE4" stroke="#3C4654" stroke-width="2"/>
    ${acc}
    <circle cx="20" cy="19" r="1.4" fill="#3C4654"/><circle cx="28" cy="19" r="1.4" fill="#3C4654"/>
    <path d="M21 25q3 2.4 6 0" stroke="#3C4654" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <path d="M24 32v8M24 35l-6 5M24 35l6 5" stroke="#3C4654" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

// 기계 검산용 export(qa/audit-soc8-data.mjs — ok ⊆ 음식 id·wrong 키 정합·공통 교집합 검사)
export const FEAST = { FOODS, GUESTS };

export const feastLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "serve" } }, el("b", { text: "세 손님 상차림" }), el("span", { text: "0 / 3" })),
    el("div", { class: "pn-badge world", dataset: { g: "common" } }, el("b", { text: "모두의 한 상" }), el("span", { text: "공통 음식 찾기" })),
    el("div", { class: "pn-badge world", dataset: { g: "why" } }, el("b", { text: "까닭 알기" }), el("span", { text: "마지막 판정" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "오늘 저녁, 서로 다른 문화의 손님 셋이 와요. 첫 손님 <b>아민</b>의 소개를 읽고, <b>대접할 수 있는 요리를 전부</b> 골라 접시를 채워 봐요!",
  });

  // ── 무대: 손님 행 + 접시 + 음식 그리드 ──
  const guestRow = el("div", { class: "fsl-guests" });
  const guestEls = new Map<string, HTMLElement>();
  for (const g of GUESTS) {
    const gEl = el(
      "div",
      { class: "fsl-guest", dataset: { g: g.id } },
      el("div", { class: "fsl-gface", html: guestFace(g.id) }),
      el("b", { text: g.name }),
      el("span", { class: "fsl-gserved", text: "기다려요" }),
    );
    guestEls.set(g.id, gEl);
    guestRow.appendChild(gEl);
  }
  const noteEl = el("div", { class: "fsl-note" });
  const plate = el("div", { class: "fsl-plate" });
  const stage = el("div", { class: "stage fsl-stage" }, guestRow, noteEl, plate);

  const foodGrid = el("div", { class: "fsl-foods" });
  const foodBtns = new Map<string, HTMLButtonElement>();
  for (const f of FOODS) {
    const b = el(
      "button",
      { class: "fsl-food", attrs: { type: "button", "aria-label": f.name }, dataset: { f: f.id } },
      el("span", { class: "fsl-fart", html: f.art }),
      el("b", { text: f.name }),
    ) as HTMLButtonElement;
    foodBtns.set(f.id, b);
    foodGrid.appendChild(b);
  }

  // ── 최종 판정(msn) ──
  const quizQ = el("div", { class: "msn-q", html: "손님마다 먹지 않는 음식이 서로 다른 까닭은 무엇일까요?" });
  const optBtns = [
    el("button", { class: "msn-opt", attrs: { type: "button" }, dataset: { o: "0" }, html: "문화나 종교에 따라 삼가는 음식이 서로 다르기 때문이에요" }),
    el("button", { class: "msn-opt", attrs: { type: "button" }, dataset: { o: "1" }, html: "손님들의 입맛이 유난히 까다롭기 때문이에요" }),
  ];
  const quizCard = el("div", { class: "msn-quiz fsl-quiz" }, quizQ, ...optBtns);

  host.append(goalChips, helper, stage, foodGrid, quizCard);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };
  const setChip = (g: string, sub?: string): void => {
    const chip = goalChips.querySelector(`[data-g="${g}"]`) as HTMLElement;
    if (!chip) return;
    if (sub) chip.querySelector("span")!.textContent = sub;
    if (!chip.classList.contains("on")) {
      chip.classList.add("on");
      haptic(HAPTIC.ctaUnlock);
    }
  };

  let gi = 0; // 현재 손님 인덱스(GUESTS 순), gi >= 3 → 공통 국면
  let picked = new Set<string>();
  let clean = true;
  let finalOpen = false;
  const COMMON = ["bibim", "dubu", "eggroll"];

  function mountGuest(): void {
    const g = GUESTS[gi];
    picked = new Set();
    plate.innerHTML = "";
    for (const [id, b] of foodBtns) {
      b.classList.remove("on", "dim", "shake");
      b.disabled = false;
      void id;
    }
    guestEls.forEach((gEl, id) => gEl.classList.toggle("live", id === g.id));
    noteEl.innerHTML = `<b>${g.name}</b> — ${g.note}`;
    helper.innerHTML = `${g.name}에게 <b>대접할 수 있는 요리를 전부</b> 골라 봐요 — 접시에 ${g.ok.length}가지가 올라가면 완성!`;
  }

  function mountCommon(): void {
    picked = new Set();
    plate.innerHTML = "";
    guestEls.forEach((gEl) => gEl.classList.add("live"));
    noteEl.innerHTML = "<b>모두의 한 상</b> — 이제 세 손님이 한 상에 둘러앉아요!";
    helper.innerHTML = "마지막 미션 — <b>세 손님이 모두 함께</b> 먹을 수 있는 요리만 골라 한 상을 차려 봐요!";
    for (const [id, b] of foodBtns) {
      b.classList.remove("on", "dim", "shake");
      b.disabled = false;
      void id;
    }
  }

  function addToPlate(fid: string): void {
    const f = FOODS.find((x) => x.id === fid)!;
    plate.appendChild(el("span", { class: "fsl-pitem", html: f.art, attrs: { title: f.name } }));
  }

  foodBtns.forEach((btn, fid) => {
    btn.addEventListener("click", () => {
      if (finalOpen || picked.has(fid)) return;
      const isCommonPhase = gi >= GUESTS.length;
      const okList = isCommonPhase ? COMMON : GUESTS[gi].ok;
      if (okList.includes(fid)) {
        picked.add(fid);
        haptic(HAPTIC.select);
        btn.classList.add("on");
        addToPlate(fid);
        if (!isCommonPhase) {
          const g = GUESTS[gi];
          if (picked.size >= g.ok.length) {
            haptic(HAPTIC.correct);
            const gEl = guestEls.get(g.id)!;
            gEl.classList.remove("live");
            gEl.classList.add("done");
            (gEl.querySelector(".fsl-gserved") as HTMLElement).textContent = "맛있어요!";
            setChip("serve", `${gi + 1} / 3`);
            if (gi + 1 < GUESTS.length) {
              const chip = goalChips.querySelector('[data-g="serve"]') as HTMLElement;
              chip.classList.remove("on");
              helper.innerHTML = `<b>${g.name}</b>의 접시 완성! 다음 손님이 기다려요.`;
              gi += 1;
              later(mountGuest, 900);
            } else {
              gi += 1;
              helper.innerHTML = "세 접시 모두 완성! 그런데 따로 먹으면 쓸쓸하죠 —";
              later(mountCommon, 1000);
            }
          } else {
            helper.innerHTML = `좋아요! <b>${picked.size} / ${g.ok.length}</b> — 더 대접할 수 있는 요리가 남아 있어요.`;
          }
        } else {
          if (picked.size >= COMMON.length) {
            haptic(HAPTIC.done);
            setChip("common", "한 상 완성!");
            foodBtns.get("bulgogi")!.classList.add("dim");
            foodBtns.get("suyuk")!.classList.add("dim");
            helper.innerHTML =
              "<b>나물 비빔밥·두부김치·달걀말이</b> — 서로 다른 세 사람이 함께 웃으며 먹을 수 있는 한 상이 차려졌어요! 다름을 알면 배려가 되고, 배려가 모이면 한 상이 돼요.";
            finalOpen = true;
            later(() => {
              quizCard.classList.add("show");
              later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
            }, 1100);
          } else {
            helper.innerHTML = `좋아요! 셋 모두의 요리 <b>${picked.size} / ${COMMON.length}</b>`;
          }
        }
      } else {
        clean = false;
        haptic(HAPTIC.wrong);
        btn.classList.remove("shake");
        void btn.offsetWidth;
        btn.classList.add("shake");
        if (gi >= GUESTS.length) {
          const f = FOODS.find((x) => x.id === fid)!;
          const who = fid === "bulgogi" ? "프리야와 리아" : "아민과 리아";
          // 받침 유무로 은/는 계산(regionPlaceLab topicJosa 관행)
          const last = f.name.charCodeAt(f.name.length - 1);
          const josa = (last - 0xac00) % 28 > 0 ? "은" : "는";
          helper.innerHTML = `${f.name}${josa} <b>${who}</b>가 먹지 않아요 — 셋 모두 함께 먹을 수 있는 요리만 골라 봐요!`;
        } else {
          helper.innerHTML = GUESTS[gi].wrong[fid] ?? "이 요리는 이 손님에게는 곤란해요 — 소개 글을 다시 읽어 봐요!";
        }
      }
    });
  });

  optBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (!finalOpen) return;
      if (i === 0) {
        haptic(HAPTIC.correct);
        btn.classList.add("ok");
        optBtns[1].classList.add("dim");
        setChip("why", "정리 완료");
        helper.innerHTML =
          "맞아요! 사람들은 자신이 속한 <b>문화와 종교</b>에 따라 먹는 것도, 삼가는 것도 달라요 — 다름을 알고 존중하는 것이 <b>다문화 사회를 살아가는 첫걸음</b>이랍니다.";
        finalOpen = false;
        api.recordQuiz(clean);
        api.enableCTA(s.cta ?? "용어로 정리하기");
      } else {
        clean = false;
        haptic(HAPTIC.wrong);
        btn.classList.add("no");
        helper.innerHTML =
          "까다로움의 문제가 아니에요 — 세 손님 모두 자신이 속한 문화·종교의 방식을 따르고 있을 뿐이죠. 다시 골라 봐요!";
        later(() => btn.classList.remove("no"), 900);
      }
    });
  });

  mountGuest();
  api.setCTA("세 손님 상을 모두 차려요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
