// orgLadderLab — 생물의 구성 단계를 아래에서 위로 직접 쌓아 올리는 사다리 조립 랩(동물·식물 2모드).
//  · 동물: 세포(상피세포) → 조직(상피조직) → 기관(위) → 기관계(소화계) → 개체(사람)
//  · 식물: 세포(잎살세포) → 조직(울타리조직) → 조직계(기본조직계) → 기관(잎) → 개체(나무)
//  · 카드를 탭해 사다리에 올린다. 순서가 틀리면 카드가 튕겨 나가고 "지금 필요한 단계"를 토스트로 짚는다.
//
// 이 랩의 핵심 발견: 동물에만 있는 자리(기관계)와 식물에만 있는 자리(조직계)는
// 사다리에서 **높이가 다르다**. 조직계는 조직과 기관 사이, 기관계는 기관과 개체 사이다.
// 두 사다리를 다 쌓아야 마무리(나란히 비교 + 자리 판정 1문)가 열린다 — 한쪽만 쌓으면
// "식물에도 기관계가 있겠지" 같은 오개념을 그대로 안고 나가기 때문이다.
//
// 그림은 전부 손코딩 SVG 실루엣(발주 이미지 의존 없음). rAF 루프를 쓰지 않고
// CSS 트랜지션 + setTimeout 체인으로만 움직인다(타이머는 Set에 모아 cleanup에서 일괄 해제).

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import "../../styles/bio3-life.css";

interface OrgLadderStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "animal" | "plant" | "verdict";
type Mode = "animal" | "plant";

interface Level {
  /** 단계 이름 — 사다리 칸과 비교 국면에 그대로 쓰인다. */
  name: string;
  /** 그 단계의 실제 예시(동물 위·식물 잎처럼 손에 잡히는 것). */
  ex: string;
  /** 32×32 실루엣 SVG. */
  art: string;
  /** 이 단계가 "지금 필요한 칸"일 때, 다른 카드를 놓으면 띄우는 안내. */
  need: string;
  /** 그 모드에만 있는 단계(동물 기관계 · 식물 조직계) — 비교 국면에서 강조된다. */
  key?: boolean;
}

const ART = (body: string): string => `<svg viewBox="0 0 32 32" aria-hidden="true">${body}</svg>`;

const A_CELL = ART(
  '<circle cx="16" cy="16" r="11" fill="#12B886" opacity=".28"/>' +
  '<circle cx="16" cy="16" r="11" fill="none" stroke="#12B886" stroke-width="1.6"/>' +
  '<circle cx="16" cy="15" r="4.2" fill="#0CA678"/>',
);
const A_TISSUE = ART(
  '<g fill="#12B886" opacity=".32" stroke="#0CA678" stroke-width="1.2">' +
  '<circle cx="9" cy="12" r="5"/><circle cx="19" cy="11" r="5"/><circle cx="13" cy="21" r="5"/><circle cx="23" cy="20" r="5"/></g>' +
  '<g fill="#0CA678"><circle cx="9" cy="12" r="1.7"/><circle cx="19" cy="11" r="1.7"/>' +
  '<circle cx="13" cy="21" r="1.7"/><circle cx="23" cy="20" r="1.7"/></g>',
);
const A_ORGAN = ART(
  '<rect x="12" y="2" width="6" height="5" rx="2.4" fill="#FF6B6B" opacity=".85"/>' +
  '<path d="M12 6 C12 11 10 12 8 16 C5 22 9 29 16 29 C23 29 26 22 23 16.5 C21 13 18 11.5 18 6 Z" ' +
  'fill="#FF8787" opacity=".45" stroke="#FF6B6B" stroke-width="1.6" stroke-linejoin="round"/>',
);
const A_SYSTEM = ART(
  '<path d="M16 3 V11" stroke="#FF6B6B" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
  '<path d="M16 11 c6 .5 6.5 8 1 9.4" stroke="#FF6B6B" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
  '<path d="M17 20.4 c-8 .4 -8.5 4.4 -3 5.4 c5.4 1 6 3 1.6 3.8" stroke="#FF8787" stroke-width="2.6" ' +
  'stroke-linecap="round" fill="none"/>',
);
const A_BODY = ART(
  '<circle cx="16" cy="6.5" r="4" fill="#EAF1FA"/>' +
  '<path d="M16 10.8 V20 M16 13.4 L10 17.4 M16 13.4 L22 17.4 M16 20 L11.5 29 M16 20 L20.5 29" ' +
  'stroke="#EAF1FA" stroke-width="2.1" stroke-linecap="round" fill="none"/>',
);

const P_CELL = ART(
  '<rect x="4.5" y="6" width="23" height="20" rx="4.5" fill="#12B886" opacity=".24"/>' +
  '<rect x="4.5" y="6" width="23" height="20" rx="4.5" fill="none" stroke="#0CA678" stroke-width="1.8"/>' +
  '<circle cx="11" cy="14" r="3" fill="#0CA678"/>' +
  '<ellipse cx="20" cy="19.5" rx="3.4" ry="2.2" fill="#2F9E44"/>' +
  '<ellipse cx="21" cy="12" rx="3.2" ry="2" fill="#2F9E44"/>',
);
const P_TISSUE = ART(
  '<g fill="#12B886" opacity=".3" stroke="#0CA678" stroke-width="1.4">' +
  '<rect x="4" y="5" width="6" height="22" rx="2.8"/><rect x="13" y="5" width="6" height="22" rx="2.8"/>' +
  '<rect x="22" y="5" width="6" height="22" rx="2.8"/></g>',
);
const P_SYSTEM = ART(
  '<rect x="2.5" y="8.5" width="27" height="15" rx="5" fill="#12B886" opacity=".18"/>' +
  '<rect x="2.5" y="8.5" width="27" height="15" rx="5" fill="none" stroke="#0CA678" stroke-width="1.6"/>' +
  '<g fill="#0CA678" opacity=".8"><circle cx="9" cy="14" r="2.1"/><circle cx="15" cy="13.4" r="2.1"/>' +
  '<circle cx="21" cy="14" r="2.1"/><circle cx="12" cy="19.4" r="2.1"/><circle cx="18" cy="19.4" r="2.1"/>' +
  '<circle cx="24" cy="18.8" r="2.1"/></g>',
);
const P_ORGAN = ART(
  '<path d="M27 4 C13.5 4 5 12.5 5 26 C18.5 26 27 17.5 27 4 Z" fill="#2F9E44" opacity=".5"/>' +
  '<path d="M27 4 C13.5 4 5 12.5 5 26 C18.5 26 27 17.5 27 4 Z" fill="none" stroke="#2F9E44" ' +
  'stroke-width="1.6" stroke-linejoin="round"/>' +
  '<path d="M6.5 25 L25.5 5.5" stroke="#0CA678" stroke-width="1.6" stroke-linecap="round"/>',
);
const P_BODY = ART(
  '<path d="M16 30 V19" stroke="#A97142" stroke-width="3.2" stroke-linecap="round"/>' +
  '<circle cx="16" cy="12" r="9" fill="#2F9E44" opacity=".55"/>' +
  '<circle cx="16" cy="12" r="9" fill="none" stroke="#2F9E44" stroke-width="1.6"/>',
);

const NEED_CELL = "가장 아래 칸은 언제나 세포예요. 세포는 생명 활동이 일어나는 기본 단위랍니다";
const NEED_TISSUE = "모양과 하는 일이 비슷한 세포가 모여야 조직이 돼요. 조직을 먼저 놓아요";

const LADDERS: Record<Mode, Level[]> = {
  animal: [
    { name: "세포", ex: "상피세포", art: A_CELL, need: NEED_CELL },
    { name: "조직", ex: "상피조직", art: A_TISSUE, need: NEED_TISSUE },
    { name: "기관", ex: "위", art: A_ORGAN, need: "여러 조직이 모여 고유한 모양과 기능을 갖춘 기관이 돼요. 기관이 먼저예요" },
    { name: "기관계", ex: "소화계", art: A_SYSTEM, need: "동물에는 기관과 개체 사이에 한 칸이 더 있어요. 관련된 기능을 하는 기관들이 모인 기관계랍니다", key: true },
    { name: "개체", ex: "사람", art: A_BODY, need: "개체는 맨 위 칸이에요. 아래 단계를 모두 쌓아야 하나의 생명체가 완성돼요" },
  ],
  plant: [
    { name: "세포", ex: "잎살세포", art: P_CELL, need: NEED_CELL },
    { name: "조직", ex: "울타리조직", art: P_TISSUE, need: NEED_TISSUE },
    { name: "조직계", ex: "기본조직계", art: P_SYSTEM, need: "식물에는 조직과 기관 사이에 한 칸이 더 있어요. 여러 조직이 모인 조직계랍니다", key: true },
    { name: "기관", ex: "잎", art: P_ORGAN, need: "조직계가 모여야 잎·줄기·뿌리 같은 기관이 돼요. 기관이 먼저예요" },
    { name: "개체", ex: "나무", art: P_BODY, need: "개체는 맨 위 칸이에요. 아래 단계를 모두 쌓아야 하나의 생명체가 완성돼요" },
  ],
};

/** 트레이 노출 순서(모드별 고정 셔플) — 매번 같은 판이라 e2e가 순서에 의존해도 안전하다. */
const TRAY_ORDER: Record<Mode, number[]> = { animal: [2, 4, 0, 3, 1], plant: [2, 0, 4, 1, 3] };
const MODE_NAME: Record<Mode, string> = { animal: "동물", plant: "식물" };

export const orgLadderLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as OrgLadderStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge bio", dataset: { g: "animal" } }, el("b", { text: "동물 사다리" }), el("span", { text: "0 / 5" })),
    el("div", { class: "pn-badge bio", dataset: { g: "plant" } }, el("b", { text: "식물 사다리" }), el("span", { text: "0 / 5" })),
    el("div", { class: "pn-badge bio", dataset: { g: "verdict" } }, el("b", { text: "자리 차이" }), el("span", { text: "판정 1문" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "동물의 몸은 어떤 순서로 이루어질까요? 아래 카드를 탭해 <b>가장 작은 단계부터 차례로</b> 사다리에 쌓아 보세요.",
  });

  const readPill = el("span", { text: "동물 사다리 0 / 5" });
  const toast = el("div", { class: "toast low" });
  const ladder = el("div", { class: "oll-ladder" });
  const tray = el("div", { class: "oll-tray" });
  const board = el("div", { class: "oll-board" }, ladder, tray);
  const compare = el("div", { class: "oll-compare", style: "display:none" });
  const stage = el(
    "div", { class: "stage b3-stage oll-stage" },
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#12B886" }), readPill)),
    board,
    compare,
    toast,
  );

  const controls = el("div", { class: "b3-controls" });
  const modeRow = el("div", { class: "b3-row" });
  const resetBtn = el("button", {
    class: "btn b3-btn b3-sub", attrs: { type: "button" }, dataset: { ollAct: "reset" }, text: "이 사다리 다시 놓기",
  });
  controls.append(modeRow, resetBtn);

  host.append(goalsEl, helper, stage, controls);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ── 상태 ──────────────────────────────────────────────────────────────
  const goals = new Set<Goal>();
  const placed: Record<Mode, number> = { animal: 0, plant: 0 };
  let mode: Mode = "animal";
  let finished = false;
  const timers = new Set<number>();

  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  };

  let toastTimer = 0;
  const toastMsg = (msg: string): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  };

  const finish = (): void => {
    if (finished) return;
    finished = true;
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "구성 단계 정리하기");
  };

  const collect = (id: Goal, msg: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement | null;
    if (chip) {
      chip.classList.add("on");
      const sp = chip.querySelector("span");
      if (sp) sp.textContent = id === "verdict" ? "확인" : "5 / 5";
    }
    haptic(HAPTIC.ctaUnlock);
    toastMsg(msg);
    if (goals.size === 3) finish();
  };

  const chipCount = (m: Mode): void => {
    if (goals.has(m)) return;
    const chip = goalsEl.querySelector(`[data-g="${m}"] span`) as HTMLElement | null;
    if (chip) chip.textContent = `${placed[m]} / 5`;
  };

  // ── 사다리·트레이 그리기 ──────────────────────────────────────────────
  const levelRow = (lv: Level, i: number): HTMLElement => el(
    "div", { class: `oll-slot on${lv.key ? " key" : ""}` },
    el("span", { class: "oll-rung", text: String(i + 1) }),
    el("span", { class: "oll-ic", html: lv.art }),
    el(
      "span", { class: "oll-txt" },
      el("span", { class: "oll-name", text: lv.name }),
      el("span", { class: "oll-ex", text: lv.ex }),
    ),
  );

  const render = (): void => {
    const list = LADDERS[mode];
    const done = placed[mode];

    ladder.replaceChildren();
    for (let i = 0; i < list.length; i++) {
      if (i < done) {
        ladder.appendChild(levelRow(list[i], i));
      } else {
        ladder.appendChild(el(
          "div", { class: `oll-slot${i === done ? " next" : ""}` },
          el("span", { class: "oll-rung", text: String(i + 1) }),
          el("span", {
            class: "oll-empty",
            text: i === done ? "여기에 놓을 단계를 골라요" : "아직 비어 있어요",
          }),
        ));
      }
    }

    tray.replaceChildren();
    for (const idx of TRAY_ORDER[mode]) {
      if (idx < done) continue;
      const lv = list[idx];
      const card = el(
        "button",
        { class: "oll-card", attrs: { type: "button" }, dataset: { ollLv: String(idx) } },
        el("span", { class: "oll-ic", html: lv.art }),
        el("span", {}, el("b", { text: lv.name }), el("i", { text: lv.ex })),
      );
      card.addEventListener("click", () => pick(idx, card));
      tray.appendChild(card);
    }

    readPill.textContent = `${MODE_NAME[mode]} 사다리 ${done} / 5`;
    renderModeRow();
  };

  const renderModeRow = (): void => {
    modeRow.replaceChildren();
    (["animal", "plant"] as Mode[]).forEach((m) => {
      const b = el("button", {
        class: `b3-chip oll-mode${m === mode ? " on" : ""}`,
        attrs: { type: "button" },
        dataset: { ollMode: m },
      }, document.createTextNode(`${MODE_NAME[m]} 사다리`));
      if (goals.has(m)) b.appendChild(el("i", { text: "완성" }));
      b.addEventListener("click", () => switchMode(m));
      modeRow.appendChild(b);
    });
  };

  // ── 조작 ──────────────────────────────────────────────────────────────
  function pick(idx: number, card: HTMLElement): void {
    const list = LADDERS[mode];
    const want = placed[mode];
    if (idx !== want) {
      haptic(HAPTIC.wrong);
      card.classList.add("bad");
      later(() => card.classList.remove("bad"), 460);
      toastMsg(list[want].need);
      return;
    }
    placed[mode] = want + 1;
    haptic(HAPTIC.tap);
    chipCount(mode);
    render();

    if (placed[mode] === 1) {
      helper.innerHTML = "좋아요. 이제 그 위 칸이에요. <b>비슷한 세포가 모이면</b> 무엇이 될까요?";
    } else if (list[want].key) {
      helper.innerHTML = mode === "animal"
        ? "<b>기관계</b>를 놓았어요. 소화계처럼 관련된 기능을 하는 기관들이 모인 단계로, <b>동물에만</b> 있어요."
        : "<b>조직계</b>를 놓았어요. 여러 조직이 모인 단계로, <b>식물에만</b> 있어요. 자리를 잘 기억해 두세요.";
    }

    if (placed[mode] === list.length) completeMode();
  }

  function completeMode(): void {
    const other: Mode = mode === "animal" ? "plant" : "animal";
    collect(mode, `${MODE_NAME[mode]} 사다리를 완성했어요`);
    if (goals.has(other)) {
      showCompare();
    } else {
      helper.innerHTML = `${MODE_NAME[mode]} 사다리를 완성했어요. 이번엔 <b>${MODE_NAME[other]} 사다리</b>도 쌓아 볼까요? 칸 수는 같지만 들어가는 단계가 하나 달라요.`;
      later(() => switchMode(other), 900);
    }
  }

  function switchMode(m: Mode): void {
    if (m === mode || (goals.has("animal") && goals.has("plant"))) return;
    mode = m;
    render();
    if (placed[m] === 0) {
      helper.innerHTML = m === "animal"
        ? "동물의 몸은 어떤 순서로 이루어질까요? <b>가장 작은 단계부터</b> 차례로 쌓아 보세요."
        : "식물의 몸은 어떤 순서로 이루어질까요? <b>가장 작은 단계부터</b> 차례로 쌓아 보세요.";
    }
  }

  resetBtn.addEventListener("click", () => {
    if (goals.has(mode)) { toastMsg("이미 완성한 사다리예요"); return; }
    placed[mode] = 0;
    haptic(HAPTIC.tap);
    chipCount(mode);
    render();
  });

  // ── 마무리 국면: 두 사다리 나란히 + 자리 판정 ─────────────────────────
  function miniCol(m: Mode): HTMLElement {
    const col = el("div", { class: "oll-col" }, el("div", { class: "oll-col-h", text: `${MODE_NAME[m]}` }));
    for (const lv of LADDERS[m]) {
      col.appendChild(el("div", { class: `oll-mini${lv.key ? " key" : ""}`, text: lv.name }));
    }
    return col;
  }

  function showCompare(): void {
    board.style.display = "none";
    modeRow.style.display = "none";
    resetBtn.style.display = "none";
    compare.style.display = "";
    compare.replaceChildren(
      miniCol("plant"),
      miniCol("animal"),
      el("div", {
        class: "oll-note",
        html: "칸 수는 다섯으로 같지만 자리가 달라요. 식물은 <b>조직계</b>가 조직과 기관 사이에, 동물은 <b>기관계</b>가 기관과 개체 사이에 들어가요.",
      }),
    );
    readPill.textContent = "두 사다리 비교하기";
    helper.innerHTML = "두 사다리를 나란히 놓고 보세요. 노란색 칸의 <b>높이가 다르죠?</b> 아래 문제로 확인해 봐요.";
    askVerdict();
  }

  function askVerdict(): void {
    const choices = [
      { t: "조직과 기관 사이", ok: true, why: "" },
      { t: "기관과 개체 사이", ok: false, why: "그 자리는 동물의 기관계예요. 조직계는 그보다 아래, 조직과 기관 사이에 있어요" },
      { t: "세포와 조직 사이", ok: false, why: "조직계는 여러 조직이 모여 이루어져요. 그러니 조직보다 위예요" },
    ];
    const box = el(
      "div", { class: "hook-choices show" },
      el("div", { class: "hook-q", html: "식물에만 있는 <b>조직계</b>는 사다리의 어느 자리에 들어갔나요?" }),
    );
    let answered = false;
    for (const c of choices) {
      const b = el("button", {
        class: "hook-choice", attrs: { type: "button" }, dataset: { ollOk: String(c.ok) }, text: c.t,
      });
      b.addEventListener("click", () => {
        if (answered) return;
        if (!c.ok) {
          haptic(HAPTIC.wrong);
          b.classList.add("miss");
          toastMsg(c.why);
          return;
        }
        answered = true;
        haptic(HAPTIC.correct);
        for (const other of Array.from(box.querySelectorAll(".hook-choice")) as HTMLElement[]) {
          other.classList.add("dim");
        }
        b.classList.remove("dim");
        b.classList.add("reveal");
        helper.innerHTML = "맞아요. 세포부터 개체까지 각 단계는 서로 밀접하게 관련되어 <b>떼어 낼 수 없어요</b>. 이런 관계를 <b>유기적</b>이라고 해요.";
        collect("verdict", "조직계는 조직과 기관 사이 · 기관계는 기관과 개체 사이");
      });
      box.appendChild(b);
    }
    controls.appendChild(box);
    later(() => box.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  }

  render();
  api.setCTA("두 사다리를 쌓아 보세요", { enabled: false });

  return () => {
    window.clearTimeout(toastTimer);
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
  };
};
