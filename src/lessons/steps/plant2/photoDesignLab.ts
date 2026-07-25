// photoDesignLab — 중2 Ⅴ 식물과 에너지: "빛의 세기에 따라 광합성량이 달라질까?" 실험 설계 랩.
//   장치는 상추 모종을 넣은 투명 용기 + 산소·이산화 탄소 센서, 빛의 세기는 전등과의 거리로 조절한다.
//   학생이 만드는 것은 실험 그 자체가 아니라 **계획서**다: 다르게 할 조건 1개 · 같게 할 조건 나머지 전부 ·
//   측정할 것 1개를 칩으로 채워야만 실험이 실행되고, 거리 3세트의 산소 농도 증가량 막대가 순차로 자란다.
//   "조건 하나만 다르게 했기 때문에 원인을 그 조건이라고 말할 수 있다"(변인 통제)를 조작으로 체험시키는 랩.
//   순수 DOM — 캔버스·rAF·난수 없음. 막대는 CSS 트랜지션 + setTimeout(타이머는 Set에 모아 cleanup에서 해제).
//   스타일은 styles/plant2.css의 .pgx-plan* / .pgx-chip* / .pgx-bar* / .pgx-note만 쓴다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { labButton } from "../../../ui/plantKit2";
import type { StepRenderer } from "../../types";

interface DesignStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type CardId = "vary" | "same" | "meas";

interface ChipDef {
  id: string;
  label: string;
}

interface Card {
  root: HTMLElement;
  note: HTMLElement;
  chips: Map<string, HTMLButtonElement>;
}

/** 카드 1·2가 함께 쓰는 조건 목록 — 빛의 세기를 바꾸는 손잡이는 dist(전등과의 거리) 하나뿐이다. */
const FACTORS: ChipDef[] = [
  { id: "dist", label: "전등과의 거리" },
  { id: "size", label: "상추 모종의 크기" },
  { id: "jar", label: "용기의 크기" },
  { id: "water", label: "물을 준 양" },
  { id: "temp", label: "온도" },
  { id: "time", label: "관찰한 시간" },
];

/** 카드 3 — 숫자로 잴 수 있는 것만 광합성량을 견줄 수 있다(o2가 정답). */
const MEASURES: ChipDef[] = [
  { id: "o2", label: "10분 뒤 산소 농도 증가량" },
  { id: "color", label: "상추 잎의 색깔" },
  { id: "mass", label: "용기의 무게" },
];

/** 전등과의 거리 3세트의 산소 농도 증가량 — 막대 폭은 가장 큰 값을 100으로 잡은 비율. */
const RESULTS = [
  { label: "가까이 10cm", value: "0.72%p", width: 100 },
  { label: "중간 30cm", value: "0.41%p", width: 57 },
  { label: "멀리 60cm", value: "0.15%p", width: 21 },
];

const TXT = {
  helper: "계획서를 채워요. 알아보려는 조건은 <b>하나만</b> 다르게, 나머지는 <b>모두 같게</b> 맞춰야 해요.",
  helperAll:
    "조건을 <b>하나만</b> 다르게 하고 나머지를 모두 같게 했기 때문에, 결과의 원인을 <b>빛의 세기</b>라고 말할 수 있어요. 이렇게 조건을 맞추는 것을 변인 통제라고 해요.",
  varyIdle: "알아보려는 조건 딱 하나만 골라요.",
  varyMany: "다르게 한 조건이 둘이면, 결과가 어느 조건 때문인지 알 수 없어요",
  varyWrong: "빛의 세기를 바꾸려면 무엇을 조절해야 할까요?",
  varyOk: "좋아요. 전등을 가까이·멀리 두면 상추가 받는 빛의 세기가 달라져요.",
  sameIdle: "다르게 한 조건 말고는 <b>전부</b> 같게 맞춰요.",
  sameShort: "빠뜨린 조건이 있어요 — 나머지는 모두 같게!",
  sameOk: "좋아요. 나머지를 모두 같게 했으니 견줄 준비가 됐어요.",
  measIdle: "10분 뒤에 무엇을 확인할지 하나 골라요.",
  measWrong:
    "눈으로 보는 색깔이나 무게로는 광합성량을 견주기 어려워요. <b>숫자로 잴 수 있는 것</b>을 골라요.",
  measOk: "좋아요. 숫자로 재면 얼마나 더 활발한지 견줄 수 있어요.",
  conclusion:
    "빛이 <b>셀수록</b>(전등이 가까울수록) 광합성량이 늘었어요. 다른 조건을 모두 같게 했기 때문에, 이 차이는 <b>빛의 세기</b> 때문이라고 말할 수 있어요.",
};

/** 스낵은 평문만 받으므로 안내 문구의 태그를 걷어낸다. */
const plain = (html: string): string => html.replace(/<[^>]*>/g, "");

export const photoDesignLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DesignStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ── 골격: 목표 칩 → 지시 helper → 계획서(조작 대상) → 실행 버튼 → 결과 ──────────
  const GOALS = [
    { id: "vary", name: "다르게 할 조건", hint: "하나만" },
    { id: "same", name: "같게 할 조건", hint: "나머지 전부" },
    { id: "run", name: "실험 수행", hint: "결과 확인" },
  ];
  const goalsEl = el("div", { class: "pn-badges force3" });
  for (const g of GOALS) {
    goalsEl.appendChild(
      el("div", { class: "pn-badge plant", dataset: { g: g.id } },
        el("b", { text: g.name }), el("span", { text: g.hint })),
    );
  }
  const helper = el("div", { class: "helper", html: TXT.helper });
  const plan = el("div", { class: "pgx-plan" });
  const controls = el("div", { class: "pgx-controls" });
  const result = el("div");
  host.append(goalsEl, helper, plan, controls, result);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  const got = new Set<string>();
  const collect = (id: string): void => {
    if (got.has(id)) return;
    got.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`);
    if (chip) {
      chip.classList.add("on");
      const span = chip.querySelector("span");
      if (span) span.textContent = "완료";
    }
    haptic(HAPTIC.ctaUnlock);
    if (got.size >= GOALS.length) {
      helper.innerHTML = TXT.helperAll;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  };

  // ── 계획서 카드 ────────────────────────────────────────────────────────────────
  const makeCard = (
    id: CardId, title: string, tag: string, defs: ChipDef[], onPick: (chipId: string) => void,
  ): Card => {
    const chips = new Map<string, HTMLButtonElement>();
    const row = el("div", { class: "pgx-chips" });
    for (const d of defs) {
      const b = el("button", {
        class: "pgx-chip",
        attrs: { type: "button", "aria-pressed": "false" },
        dataset: { chip: d.id, card: id },
        text: d.label,
      });
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        onPick(d.id);
      });
      chips.set(d.id, b);
      row.appendChild(b);
    }
    const note = el("div", { class: "pgx-note" });
    const root = el("div", { class: "pgx-plan-card" },
      el("div", { class: "pgx-plan-head" }, el("b", { text: title }), el("em", { text: tag })),
      row, note);
    plan.appendChild(root);
    return { root, note, chips };
  };

  const vary = new Set<string>();
  const same = new Set<string>();
  let meas = "";

  const labelOf = (chipId: string): string => FACTORS.find((f) => f.id === chipId)?.label ?? chipId;
  const setChip = (b: HTMLButtonElement, on: boolean): void => {
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", String(on));
  };

  const cardVary = makeCard("vary", "다르게 해야 할 조건", "1개만", FACTORS, (chipId) => {
    if (vary.has(chipId)) vary.delete(chipId);
    else vary.add(chipId);
    sync();
  });
  const cardSame = makeCard("same", "같게 해야 할 조건", "나머지 전부", FACTORS, (chipId) => {
    if (vary.has(chipId)) return; // 카드 1이 가져간 조건은 여기서 고를 수 없다
    if (same.has(chipId)) same.delete(chipId);
    else same.add(chipId);
    sync();
  });
  const cardMeas = makeCard("meas", "측정할 것", "1개", MEASURES, (chipId) => {
    meas = meas === chipId ? "" : chipId; // 하나만 — 같은 칩을 다시 누르면 해제
    sync();
  });

  function sync(): void {
    // 카드 1 — 하나만, 그리고 그 하나가 전등과의 거리여야 한다.
    let only = "";
    for (const id of vary) only = id;
    const oneVary = vary.size === 1;
    const varyOk = oneVary && only === "dist";
    for (const [id, b] of cardVary.chips) setChip(b, vary.has(id));
    cardVary.root.classList.toggle("bad", vary.size >= 2);
    cardVary.root.classList.toggle("ok", varyOk);
    if (vary.size >= 2) cardVary.note.innerHTML = TXT.varyMany;
    else if (varyOk) cardVary.note.innerHTML = TXT.varyOk;
    else if (oneVary) cardVary.note.innerHTML = TXT.varyWrong;
    else cardVary.note.innerHTML = TXT.varyIdle;

    // 카드 2 — 카드 1이 고른 조건은 자동 비활성("다르게"), 나머지는 전부 켜야 한다.
    for (const [id, b] of cardSame.chips) {
      const locked = vary.has(id);
      if (locked) same.delete(id);
      b.disabled = locked;
      b.textContent = locked ? `${labelOf(id)} · 다르게` : labelOf(id);
      setChip(b, same.has(id));
    }
    const sameOk = oneVary && same.size === FACTORS.length - 1;
    cardSame.root.classList.toggle("ok", sameOk);
    cardSame.note.innerHTML = sameOk ? TXT.sameOk : TXT.sameIdle;

    // 카드 3 — 숫자로 잴 수 있는 값 하나.
    for (const [id, b] of cardMeas.chips) setChip(b, meas === id);
    cardMeas.root.classList.toggle("ok", meas === "o2");
    if (meas === "o2") cardMeas.note.innerHTML = TXT.measOk;
    else if (meas) cardMeas.note.innerHTML = TXT.measWrong;
    else cardMeas.note.innerHTML = TXT.measIdle;

    if (varyOk) collect("vary");
    if (sameOk) collect("same");
  }

  // ── 실행과 결과 ────────────────────────────────────────────────────────────────
  const fail = (card: Card, html: string): void => {
    card.note.innerHTML = html;
    api.snack(plain(html));
    later(() => card.root.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
  };

  const showResult = (): void => {
    result.textContent = ""; // 다시 실행하면 이전 결과부터 정리
    const bars = el("div", { class: "pgx-bars" });
    RESULTS.forEach((r, i) => {
      const fill = el("div", { class: "pgx-bar-fill", style: "width:0%" });
      bars.appendChild(
        el("div", { class: "pgx-bar-row" },
          el("b", { text: r.label }),
          el("div", { class: "pgx-bar-track" }, fill),
          el("span", { text: r.value })),
      );
      later(() => { fill.style.width = `${r.width}%`; }, 150 * (i + 1));
    });
    result.append(bars, el("div", { class: "pgx-note", html: TXT.conclusion }));
    collect("run");
    later(() => result.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  };

  const run = (): void => {
    if (vary.size === 0) { fail(cardVary, TXT.varyIdle); return; }
    if (vary.size >= 2) { fail(cardVary, TXT.varyMany); return; }
    if (!vary.has("dist")) { fail(cardVary, TXT.varyWrong); return; }
    if (same.size < FACTORS.length - 1) { fail(cardSame, TXT.sameShort); return; }
    if (!meas) { fail(cardMeas, TXT.measIdle); return; }
    if (meas !== "o2") { fail(cardMeas, TXT.measWrong); return; }
    showResult();
  };

  const runBtn = labButton("실험 시작하기", run, { tone: "primary", sub: "10분 뒤 산소 농도 측정" });
  runBtn.dataset.act = "run";
  controls.appendChild(runBtn);

  sync();
  api.setCTA("계획서를 완성하고 실험을 해 보세요", { enabled: false });

  return () => {
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
  };
};
