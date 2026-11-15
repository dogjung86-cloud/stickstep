// b6Lab: 중1 Ⅱ v5 랩 공용 뼈대(2026-11-11). 랩마다 같은 자리에 같은 것이 놓인다.
//
//   제목(질문 한 줄) + 진행 점  30px
//   도움말(지금 할 일, 두 줄 고정) 50px
//   무대(어두운 판 하나)          230px
//   조작 칸(높이 고정)            208px   조작부, 판정 질문, 결론이 이 칸을 번갈아 쓴다
//
// 한 화면 예산: 390×700 화면의 스크롤 영역 554px에서 랩 스텝 위아래 여백(6, 10)을 뺀 538px.
// 조작 칸 높이가 고정이라 국면이 바뀌어도 무대와 버튼 자리가 움직이지 않는다(조작 중 화면 밀림 0).
// 판정(2026-11-11 사용자 피드백으로 고침): 맞혔는지 틀렸는지를 누른 보기에 새긴다.
//   정답: 누른 보기가 초록이 되고 체크와 "정답이에요"가 붙는다. 그 아래에 이유 한 줄과 '다음'.
//   오답: 누른 보기가 빨강이 되고 가위표와 "오답이에요"가 붙는다. 그 아래 카드에 정답, 이유 한 줄, '다음'.
//   어느 쪽이든 다른 보기는 접히고, '다음'을 눌러야 넘어간다(타이머로 다음 질문을 덮지 않는다).
//   고치기 전에는 오답일 때 초록 "정답" 상자만 눈에 띄어 맞힌 것처럼 읽혔고, 정답일 때는 1초 뒤 말없이 넘어갔다.
//   예측 질문(predict)은 정오를 밝히지 않는다(고른 보기만 남기고 잠깐 뒤 넘어간다).
// 움직임은 CSS와 setTimeout만 쓴다(캔버스, rAF 없음. 화면 캡처가 멈춘 환경에서도 끝까지 진행된다).
// CSS 접두는 .bv-(styles/bio6.css). .b6-은 중2 Ⅵ v3(body3)가 쓰고 있어 피했다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { icon } from "../../../core/icons";
import type { StepAPI } from "../../types";

// ── 타이머 묶음 ─────────────────────────────────────────────────────
export interface BvTimers {
  later: (fn: () => void, ms: number) => number;
  cancel: (id: number) => void;
  clear: () => void;
  alive: () => boolean;
}

/** cleanup에서 clear() 한 번이면 예약된 일이 전부 사라진다. */
export function bvTimers(): BvTimers {
  const ids = new Set<number>();
  let on = true;
  return {
    later(fn, ms) {
      const id = window.setTimeout(() => {
        ids.delete(id);
        if (on) fn();
      }, ms);
      ids.add(id);
      return id;
    },
    cancel(id) {
      window.clearTimeout(id);
      ids.delete(id);
    },
    clear() {
      on = false;
      ids.forEach((id) => window.clearTimeout(id));
      ids.clear();
    },
    alive: () => on,
  };
}

/** setTimeout 보간. dur ms 동안 fn(t)를 부른다(t는 0에서 1, 부드럽게). 끝나면 done. */
export function bvTween(tm: BvTimers, dur: number, fn: (t: number) => void, done?: () => void, ease: (x: number) => number = (x) => x * x * (3 - 2 * x)): void {
  const steps = Math.max(2, Math.round(dur / 33));
  let i = 0;
  const tick = (): void => {
    i += 1;
    fn(ease(Math.min(1, i / steps)));
    if (i < steps) tm.later(tick, dur / steps);
    else done?.();
  };
  fn(0);
  tm.later(tick, dur / steps);
}

// ── 판정 상자 ───────────────────────────────────────────────────────
export interface BvChoice {
  t: string; // 보기(한 줄, 20자 안쪽)
  ok?: boolean;
}
export interface BvAskOpts {
  /** 답한 뒤 카드에 붙는 이유 한 줄(HTML, 40자 안쪽). 맞혔을 때도 틀렸을 때도 같은 글이 보이므로 "아니에요"로 시작하지 않는다. */
  why?: string;
  /** 다음 국면. 맞히든 틀리든 '다음'을 눌러야 넘어간다(예측 질문만 잠깐 뒤 저절로 넘어간다). */
  onNext?: () => void;
  /** 예측 질문. 정오를 밝히지 않고 고른 보기만 남긴 채 넘어간다(답은 실험이 보여 준다). */
  predict?: boolean;
  /** 예측 질문이 넘어가기까지의 시간(ms). */
  nextDelay?: number;
}

// ── 글 맞춤(2026-11-16, 도입과 랩 글 다듬기) ─────────────────────────
// 글이 길어져도 잘리거나 상자를 넘치지 않게 상자가 글에 맞춘다. 맞춤 없이 들어가는 글은 예전 모양 그대로다.
//   제목(한 줄 말줄임): 넘치면 18px, 그래도 넘치면 18px 두 줄(머리 44px).
//   도움말(두 줄 고정): 넘치면 그 랩이 끝날 때까지 세 줄 상자. 처음부터 세 줄 글이 있는 랩은
//     bvFrame({ tall: true })로 세 줄을 잡아 두면 랩 도중에 무대가 밀리지 않는다.
//   두 줄 제목이나 세 줄 도움말이 생기면 위아래 여백을 줄여 한 화면(390×700의 554px)을 지킨다(bio6.css 「글 맞춤」).
//   판정 질문: 두 줄이 넘치면 13.5px. 판정 보기와 오답 카드의 정답 글: 한 줄이 넘치면 13px 두 줄(보기 높이 48px 그대로).
//   조건 카드(bvCard): 이름이나 보조 글이 넘치면 작게, 그래도 넘치면 두 줄.
// 제목과 도움말 맞춤은 폰 모양에서만 한다(넓은 화면은 wide.css가 두 상자를 이미 풀어 둔다).
// 개발 모드에서는 맞춤이 일어나거나 맞춤으로도 모자라면 console.warn("[bv-fit] …")을 남긴다(검사 스크립트가 모은다).
const wideView = (): boolean => document.documentElement.classList.contains("wide");
const overX = (e: Element): boolean => e.scrollWidth > e.clientWidth + 1;
const overY = (e: Element): boolean => e.scrollHeight > e.clientHeight + 1;
function fitWarn(kind: string, e: Element): void {
  if (import.meta.env.DEV) console.warn(`[bv-fit] ${kind}: ${(e.textContent ?? "").trim().slice(0, 70)}`);
}
/** 화면에 그려진 뒤(크기가 정해진 뒤) fn을 부른다. 이미 그려져 있으면 바로, 아니면 다음 프레임에 한 번 더 본다. */
function whenLaid(e: Element, fn: () => void): void {
  if (e.isConnected && (e as HTMLElement).offsetParent !== null) fn();
  else requestAnimationFrame(() => {
    if (e.isConnected) fn();
  });
}
/** 판정 보기 하나: 한 줄에 안 들어가면 두 줄 모양(two). */
function fitChoice(b: HTMLElement): void {
  const t = b.querySelector(".bv-choice-t");
  if (!t) return;
  b.classList.remove("two");
  if (!overX(t)) return;
  b.classList.add("two");
  fitWarn("보기 두 줄", t);
  if (overY(t)) fitWarn("보기 넘침(두 줄로도 모자람)", t);
}
/** 조건 카드 하나: 이름(b)과 보조 글(i)이 카드 폭을 넘으면 작게(fs), 그래도 넘으면 두 줄(two). */
function fitCard(card: HTMLElement): void {
  const b = card.querySelector(".bv-card-tx > b");
  const i = card.querySelector(".bv-card-tx > i");
  card.classList.remove("fs-b", "two-b", "two-i");
  if (b && overX(b)) {
    card.classList.add("fs-b");
    if (overX(b)) {
      card.classList.add("two-b");
      fitWarn("카드 이름 두 줄", b);
    }
  }
  if (i && i.textContent && overX(i)) {
    card.classList.add("two-i");
    fitWarn("카드 보조 글 두 줄", i);
  }
  if (overY(card)) fitWarn("카드 넘침", card);
}

/** 판정이 뜨는 동안 맨 아래 큰 버튼(잠긴 채 지금 할 일을 알려 주는 글)에 쓸 말. 이미 끝낸 조작을 시키는 글이 남지 않게 한다. */
const CTA_ASK = "질문에 답해 보세요";
const CTA_NEXT = "'다음'을 눌러 계속해 보세요";

function ask(box: HTMLElement, question: string, choices: BvChoice[], onPick: (ok: boolean) => void, opts: BvAskOpts, api?: Pick<StepAPI, "setCTA">): void {
  box.innerHTML = "";
  box.classList.add("show");
  if (!opts.predict) api?.setCTA(CTA_ASK, { enabled: false });
  // 질문 글자는 span 하나로 감싼다(.bv-qt가 flex라 굵은 글씨 앞뒤의 띄어쓰기가 사라지는 것을 막는다).
  const qEl = el("div", { class: "bv-qt" }, el("span", { html: question }));
  box.appendChild(qEl);
  // 질문이 두 줄(42px)을 넘으면 글씨를 조금 줄인다(보기 셋과 함께 조작 칸 208px에 들게).
  whenLaid(qEl, () => {
    if (wideView() || qEl.offsetHeight <= 43) return;
    qEl.classList.add("small");
    fitWarn("질문 세 줄", qEl);
  });
  // 보기 순서는 매번 섞는다(첫 칸이 정답이라는 버릇을 막는다).
  const order = choices.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const good = choices.find((c) => c.ok);
  let picked = false;
  const goNext = (): void => {
    const fn = opts.onNext;
    if (!fn) return;
    window.setTimeout(() => {
      if (box.isConnected && box.contains(qEl)) fn();
    }, opts.nextDelay ?? 1000);
  };
  const btns: HTMLButtonElement[] = [];
  order.forEach((idx) => {
    const c = choices[idx];
    const label = el("span", { class: "bv-choice-t", text: c.t });
    const b = el("button", { class: "bv-choice", attrs: { type: "button" } }, label) as HTMLButtonElement;
    // 검사 도구가 섞인 차례와 무관하게 보기를 집는 열쇠. 개발 서버에서만 붙인다(quiz.ts의 data-oi와 같은 약속. 운영 화면에는 정답 표식을 남기지 않는다).
    if (import.meta.env.DEV) b.dataset.ok = c.ok ? "1" : "0";
    btns.push(b);
    b.addEventListener("click", () => {
      if (picked) return;
      picked = true;
      btns.forEach((x) => (x.disabled = true));
      if (opts.predict) {
        haptic(HAPTIC.tap);
        btns.forEach((x) => x.classList.add(x === b ? "sel" : "dim"));
        onPick(!!c.ok);
        goNext();
        return;
      }
      const ok = !!c.ok;
      haptic(ok ? HAPTIC.correct : HAPTIC.wrong);
      // 맞혔는지 틀렸는지를 누른 보기에 새긴다(동그란 표시 + 말 + 고른 답). 나머지 보기는 접는다.
      b.classList.add(ok ? "ok" : "miss");
      b.replaceChildren(
        el("span", { class: "bv-vd-ic", html: icon(ok ? "check" : "xThick", 13), attrs: { "aria-hidden": "true" } }),
        el("span", { class: "bv-vd-tx" }, el("span", { class: "bv-vd", text: ok ? "정답이에요" : "오답이에요" }), label),
      );
      // 판정 모양은 표시 동그라미만큼 글 자리가 좁다. 한 줄에 안 들어가면 두 줄 모양으로 다시 맞춘다.
      if (!b.classList.contains("two") && overX(label)) b.classList.add("two");
      btns.forEach((x) => {
        if (x !== b) x.classList.add("gone");
      });
      // 그 바로 아래 카드: 틀렸으면 정답을 먼저 알려 주고, 어느 쪽이든 이유 한 줄과 '다음'.
      const fn = opts.onNext;
      if (!ok || opts.why || fn) {
        const card = el("div", { class: `bv-ans ${ok ? "ok" : "no"}`, attrs: { role: "status" } });
        if (!ok) card.appendChild(el("div", { class: "bv-ans-row" }, el("span", { class: "bv-ans-tag", text: "정답" }), el("span", { class: "bv-ans-t", text: good?.t ?? "" })));
        const foot = el("div", { class: "bv-ans-foot" });
        foot.appendChild(el("span", { class: "bv-why", html: opts.why ?? "" }));
        if (fn) {
          const next = el("button", { class: "bv-next", text: "다음", attrs: { type: "button" } }) as HTMLButtonElement;
          next.addEventListener("click", () => {
            next.disabled = true;
            haptic(HAPTIC.tap);
            fn();
          });
          foot.appendChild(next);
        }
        card.appendChild(foot);
        b.after(card);
        const ansT = card.querySelector(".bv-ans-t");
        if (ansT && overX(ansT)) {
          ansT.classList.add("two");
          fitWarn("정답 글 두 줄", ansT);
        }
        if (fn) api?.setCTA(CTA_NEXT, { enabled: false });
      }
      onPick(ok);
    });
    box.appendChild(b);
  });
  whenLaid(box, () => btns.forEach(fitChoice));
}

// ── 조작 칸 ─────────────────────────────────────────────────────────
export interface BvSlot {
  el: HTMLElement;
  ctl: HTMLElement;
  qBox: HTMLElement;
  /** 조작부를 이 칸에 놓는다(판정 상자와 결론은 걷는다). */
  setControls: (...nodes: HTMLElement[]) => void;
  /** 판정 질문을 같은 칸에 띄운다(조작부는 숨긴다). */
  ask: (question: string, choices: BvChoice[], onPick: (ok: boolean) => void, opts?: BvAskOpts) => void;
  /** 판정을 걷고 조작부를 되돌린다. */
  showControls: () => void;
  /** 결론 한 문장을 같은 칸에 띄운다(랩의 마지막). */
  conclude: (html: string) => void;
}

function makeSlot(qCls: string, api?: Pick<StepAPI, "setCTA">): BvSlot {
  const ctl = el("div", { class: "bv-ctl" });
  const qBox = el("div", { class: `bv-q ${qCls}` });
  const done = el("div", { class: "bv-done" });
  const slot = el("div", { class: "bv-slot" }, ctl, qBox, done);
  const showControls = (): void => {
    qBox.innerHTML = "";
    qBox.classList.remove("show");
    done.classList.remove("show");
    ctl.hidden = false;
  };
  return {
    el: slot,
    ctl,
    qBox,
    setControls(...nodes) {
      ctl.replaceChildren(...nodes);
      showControls();
    },
    ask(question, choices, onPick, opts = {}) {
      ctl.hidden = true;
      done.classList.remove("show");
      ask(qBox, question, choices, onPick, opts, api);
    },
    showControls,
    conclude(html) {
      ctl.hidden = true;
      qBox.innerHTML = "";
      qBox.classList.remove("show");
      done.innerHTML = "";
      done.append(el("div", { class: "bv-done-k", text: "핵심 정리" }), el("div", { class: "bv-done-t", html }));
      done.classList.add("show");
    },
  };
}

// ── 랩 틀 ──────────────────────────────────────────────────────────
export interface BvFrame {
  /** 도움말(지금 할 일)을 바꾼다. 두 줄(46자 안쪽)이 예산이고, 넘치면 세 줄 상자로 바뀐다(위 「글 맞춤」). */
  say: (html: string) => void;
  helper: HTMLElement;
  stage: HTMLElement;
  slot: BvSlot;
  /** 진행 점을 n개까지 켠다. */
  pips: (n: number) => void;
}

/** 랩 한 판의 뼈대를 host에 놓는다. cls는 무대에 붙는 랩 전용 클래스, qCls는 판정 상자 클래스.
 *  api를 넘기면 판정이 뜨는 동안 맨 아래 큰 버튼의 글을 "질문에 답해 보세요", 답한 뒤에는 "'다음'을 눌러 이어 가요"로 바꾼다. */
export function bvFrame(host: HTMLElement, o: { title: string; steps: number; cls: string; qCls: string; api?: Pick<StepAPI, "setCTA">; tall?: boolean }): BvFrame {
  host.classList.add("bv-step");
  const pipEls = Array.from({ length: o.steps }, () => el("i"));
  const titleEl = el("div", { class: "bv-title", html: o.title });
  const head = el("div", { class: "bv-head" }, titleEl, el("div", { class: "bv-pips", attrs: { "aria-hidden": "true" } }, ...pipEls));
  const helper = el("div", { class: "bv-helper" });
  const stage = el("div", { class: `bv-stage ${o.cls}` });
  const slot = makeSlot(o.qCls, o.api);
  host.append(head, helper, stage, slot.el);
  let lastSay = "";
  // 세 줄 도움말: 랩이 처음부터 잡아 두었거나(o.tall), 넘치는 글이 한 번 나온 뒤로는 랩이 끝날 때까지 그대로 둔다(되돌리면 무대가 오르내린다).
  let tall = !!o.tall;
  if (tall) host.classList.add("bv-tall");
  const fitTitle = (): void => {
    titleEl.classList.remove("fs18", "two");
    host.classList.remove("bv-t2");
    if (wideView() || !overX(titleEl)) return;
    titleEl.classList.add("fs18");
    if (!overX(titleEl)) return;
    titleEl.classList.remove("fs18");
    titleEl.classList.add("two");
    host.classList.add("bv-t2");
    fitWarn("제목 두 줄", titleEl);
    if (overY(titleEl)) fitWarn("제목 넘침(두 줄로도 모자람)", titleEl);
  };
  const fitHelper = (): void => {
    helper.classList.remove("dense");
    if (wideView() || !helper.textContent) return;
    if (!tall && overY(helper)) {
      tall = true;
      host.classList.add("bv-tall");
      fitWarn("도움말 세 줄(랩 처음부터 tall: true로 잡으면 무대가 밀리지 않아요)", helper);
    }
    if (tall && overY(helper)) {
      helper.classList.add("dense");
      if (overY(helper)) fitWarn("도움말 넘침(세 줄로도 모자람)", helper);
    }
  };
  // 폭이 바뀔 때(처음 그려질 때, 화면 회전, 넓은 화면 전환) 다시 맞춘다. 높이 변화에는 반응하지 않는다(맞춤이 높이를 바꾸므로).
  let lastW = -1;
  const ro = new ResizeObserver(() => {
    if (!host.isConnected) {
      if (lastW >= 0) ro.disconnect();
      return;
    }
    const w = titleEl.clientWidth + helper.clientWidth * 1000;
    if (w === lastW) return;
    lastW = w;
    fitTitle();
    fitHelper();
  });
  ro.observe(titleEl);
  ro.observe(helper);
  return {
    helper,
    stage,
    slot,
    say(html) {
      if (html === lastSay) return;
      lastSay = html;
      helper.innerHTML = html;
      if (helper.isConnected) fitHelper();
    },
    pips(n) {
      pipEls.forEach((p, i) => p.classList.toggle("on", i < n));
    },
  };
}

// ── 조작 부품 ───────────────────────────────────────────────────────
/** 넓은 버튼(48px 이상). */
export function bvBtn(cls: string, text: string): HTMLButtonElement {
  return el("button", { class: `bv-btn ${cls}`, text, attrs: { type: "button" } }) as HTMLButtonElement;
}

/** 카드 버튼(재료, 도구, 구조 고르기). 아이콘 + 이름 + 한 줄 설명. 해 본 것에는 done()으로 체크가 붙는다. */
export interface BvCard {
  el: HTMLButtonElement;
  sub: (text: string) => void;
  on: (v: boolean) => void;
  done: () => void;
  isDone: () => boolean;
}
export function bvCard(cls: string, o: { name: string; sub?: string; icon?: string; key?: string }): BvCard {
  const subEl = el("i", { text: o.sub ?? "" });
  const b = el(
    "button",
    { class: `bv-card ${cls}`, attrs: { type: "button" } },
    o.icon ? el("span", { class: "bv-card-ic", html: o.icon, attrs: { "aria-hidden": "true" } }) : null,
    el("span", { class: "bv-card-tx" }, el("b", { text: o.name }), subEl),
  ) as HTMLButtonElement;
  if (o.key) b.dataset.k = o.key;
  let finished = false;
  // 글 맞춤: 그려질 때와 폭이 바뀔 때, 보조 글을 바꿀 때 카드 폭에 맞춘다(위 「글 맞춤」).
  let lastW = -1;
  const ro = new ResizeObserver(() => {
    if (!b.isConnected) {
      if (lastW >= 0) ro.disconnect();
      return;
    }
    if (b.clientWidth === lastW) return;
    lastW = b.clientWidth;
    fitCard(b);
  });
  ro.observe(b);
  return {
    el: b,
    sub: (t) => {
      subEl.textContent = t;
      if (b.isConnected && lastW >= 0) fitCard(b);
    },
    on: (v) => b.classList.toggle("on", v),
    done() {
      finished = true;
      b.classList.add("done");
    },
    isDone: () => finished,
  };
}

/** 카드 줄. cols는 한 줄의 칸 수. */
export function bvCards(cols: number, ...cards: BvCard[]): HTMLElement {
  const row = el("div", { class: "bv-cards" }, ...cards.map((c) => c.el));
  row.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  return row;
}

/** 미는 막대(네이티브 range). ticks는 막대 아래 눈금 글자. 값이 바뀔 때마다 onInput, 손을 떼면 onChange. */
export interface BvRange {
  el: HTMLElement;
  input: HTMLInputElement;
  set: (v: number) => void;
  value: () => number;
}
export function bvRange(o: { cls: string; min: number; max: number; value: number; label: string; ticks?: (string | { t: string; p: number })[]; onInput: (v: number) => void; onChange?: (v: number) => void }): BvRange {
  const input = el("input", { class: `bv-range-in ${o.cls}`, attrs: { type: "range", min: String(o.min), max: String(o.max), step: "1", value: String(o.value), "aria-label": o.label } }) as HTMLInputElement;
  const paint = (): void => {
    const p = ((Number(input.value) - o.min) / (o.max - o.min)) * 100;
    input.style.setProperty("--p", `${p}%`);
  };
  input.addEventListener("input", () => {
    paint();
    o.onInput(Number(input.value));
  });
  input.addEventListener("change", () => o.onChange?.(Number(input.value)));
  const wrap = el("div", { class: "bv-range" }, el("div", { class: "bv-range-cap", text: o.label }), input);
  if (o.ticks?.length) {
    // 눈금 글자: 문자열이면 고르게 벌리고, { t, p }면 막대의 p% 자리에 놓는다(로그 눈금용).
    const placed = o.ticks.some((t) => typeof t !== "string");
    const row = el("div", { class: `bv-ticks${placed ? " placed" : ""}`, attrs: { "aria-hidden": "true" } });
    o.ticks.forEach((t) => {
      const sp = el("span", { text: typeof t === "string" ? t : t.t });
      if (typeof t !== "string") sp.style.left = `${t.p}%`;
      row.appendChild(sp);
    });
    wrap.appendChild(row);
  }
  paint();
  return {
    el: wrap,
    input,
    set(v) {
      input.value = String(v);
      paint();
    },
    value: () => Number(input.value),
  };
}

/** 포인터 캡처는 반드시 try/catch(합성 이벤트에서 throw하면 리스너가 통째로 죽는다). */
export function bvCapture(node: Element, pointerId: number): void {
  try {
    (node as HTMLElement).setPointerCapture?.(pointerId);
  } catch {
    /* 합성 포인터 id는 무시 */
  }
}

/** 화면 좌표를 SVG viewBox 좌표로 바꾼다. */
export function bvSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}
