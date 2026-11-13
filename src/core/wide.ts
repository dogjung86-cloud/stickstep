// wide: 넓은 화면(태블릿 가로, PC) 자동 전환(2026-11-14 사용자 확정).
//   가로 방향이고 폭 1024px, 높이 600px 이상이면 스위치 없이 넓은 화면으로 연다(<html class="wide dt">).
//   마이 탭의 "넓은 화면 레이아웃" 줄은 끄는 스위치다(store.wideOff. 끄면 넓은 화면에서도 폰 모양).
//   폰(세로든 가로든), 펼친 폴드, 세로로 든 태블릿은 조건에 들지 않아 폰 모양 그대로다.
// 배치(스타일은 styles/wide.css, 홈과 탭의 뼈대는 styles/desktop.css):
//   · 원칙 하나: 보는 것은 왼쪽에 크게, 읽고 답하는 것은 오른쪽 노트에. 다음 버튼은 늘 노트 아래 같은 자리.
//   · 랩(bvFrame 뼈대, 중1·중2 과학 열다섯 단원): 왼쪽에 무대와 바로 아래 조작, 오른쪽 '탐구 노트'에 제목, 도움말, 질문, 판정,
//     그리고 답한 것의 기록. 무대는 다시 짜지 않고 설계 크기(346×230)를 통째로 키운다(CSS zoom: var(--lk)).
//   · 도입(opener), 만화, 개념, 그림 있는 문제: 그림은 왼쪽, 글과 보기는 노트. 그림 없는 문제와 그 밖의 스텝은 가운데 한 단.
//   · 시작 화면, 단원 지도, 복습·도전·마이 탭, 시험 안내와 문제도 wide.css가 다시 놓는다.
// 이 파일이 하는 일: ① 조건을 보고 클래스를 붙였다 뗀다 ② 화면 크기에서 배율과 칸 폭을 계산해 CSS 변수로 넣는다
//   ③ 랩 뼈대를 '무대 쪽'과 '노트 쪽' 두 묶음으로 다시 묶고(조건이 풀리면 원래대로 되돌린다) 그 밖의 스텝에 종류 표식을 붙인다.
// 요소는 옮기기만 한다. 랩 코드가 쥔 참조는 그대로 살아 있어 랩 쪽 코드는 넓은 화면을 모른다.

import { el } from "./dom";
import { isWideOff } from "./store";

const MQ = "(orientation: landscape) and (min-width: 1024px) and (min-height: 600px)";
const HEADER = 48; // 넓은 화면에서 레슨 머리 줄의 높이(wide.css와 같은 값)
const LESSON_MAX = 1440; // 레슨 화면이 쓰는 최대 폭(더 넓은 모니터에서는 가운데에 둔다)
const STAGE_MAX = 2.6; // 무대 배율 상한
const clamp = (lo: number, v: number, hi: number): number => Math.max(lo, Math.min(hi, v));

let mq: MediaQueryList | null = null;
let active = false;
let stageScale = 1;
let observer: MutationObserver | null = null;

/** 지금 넓은 화면 배치인가. */
export function isWide(): boolean {
  return active;
}

/** 랩 무대의 확대 배율(넓은 화면이 아니면 1). 캔버스 무대가 흐려지지 않게 그리는 해상도를 올릴 때 쓴다. */
export function wideStageScale(): number {
  return active ? stageScale : 1;
}

/** 랩 무대 캔버스의 기기 픽셀 배율. 넓은 화면에서는 확대 배율만큼 더 촘촘히 그린다(상한 4). */
export function stageDpr(): number {
  return Math.min(Math.min(window.devicePixelRatio || 1, 2) * wideStageScale(), 4);
}

function fit(): void {
  const root = document.documentElement;
  const set = (k: string, v: string): void => root.style.setProperty(k, v);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const H = vh - HEADER;

  // 시작 화면: 플립북 배율
  set("--fz", clamp(1.4, (vh - 150) / 320, 1.95).toFixed(3));

  // 단원 지도와 탭: 메뉴 폭, 오른쪽 칸 폭, 지도 배율
  const hs = vw >= 1280 ? 224 : 88;
  const hp = Math.round(clamp(340, vw * 0.32, 420));
  set("--hs", `${hs}px`);
  set("--hp", `${hp}px`);
  set("--mz", clamp(1.15, (vw - hs - hp - 68) / 480, 1.7).toFixed(3));

  // 레슨: 아주 넓은 모니터에서는 가운데 LESSON_MAX 폭만 쓴다
  const W = Math.min(vw, LESSON_MAX);
  set("--lx", `${Math.round((vw - W) / 2)}px`);
  // 랩: 노트 폭, 조작 칸 배율, 무대 배율
  const P = Math.round(clamp(340, W * 0.33, 430));
  const ck = 1.18;
  stageScale = clamp(1, Math.min((W - P - 68) / 346, (H - 30 - 208 * ck - 12) / 230), STAGE_MAX);
  set("--lp", `${P}px`);
  set("--lck", String(ck));
  set("--lk", stageScale.toFixed(3));
  // 랩이 아닌 스텝(도입, 만화, 개념, 문제): 읽을 것이 많아 노트를 더 넓게 잡는다
  const Q = Math.round(clamp(400, W * 0.42, 520));
  const left = W - Q - 68;
  set("--lq", `${Q}px`);
  set("--lqk", ((Q - 50) / 346).toFixed(3));
  set("--lkc", clamp(1, Math.min(left / 350, (H - 46) / 264), STAGE_MAX).toFixed(3));
  set("--lko", clamp(1, Math.min(left / 346, (H - 46) / 250), STAGE_MAX).toFixed(3));
}

// ── 랩: 뼈대를 두 묶음으로 ─────────────────────────────────────────
interface Regrouped {
  head: HTMLElement;
  helper: HTMLElement;
  stage: HTMLElement;
  slot: HTMLElement;
  qBox: HTMLElement;
  done: HTMLElement;
  main: HTMLElement;
  note: HTMLElement;
  watch: MutationObserver;
}
const regrouped = new Map<HTMLElement, Regrouped>();

function regroupLab(step: HTMLElement): void {
  if (regrouped.has(step)) return;
  const pick = (c: string): HTMLElement | null => step.querySelector<HTMLElement>(`:scope > .${c}`);
  const head = pick("bv-head");
  const helper = pick("bv-helper");
  const stage = pick("bv-stage");
  const slot = pick("bv-slot");
  if (!head || !helper || !stage || !slot) return;
  const qBox = slot.querySelector<HTMLElement>(":scope > .bv-q");
  const done = slot.querySelector<HTMLElement>(":scope > .bv-done");
  if (!qBox || !done) return;
  const log = el("div", { class: "wd-log" });
  const logWrap = el("div", { class: "wd-logwrap" }, el("div", { class: "wd-log-k", text: "지금까지 알아낸 것" }), log);
  const note = el("div", { class: "wd-note" }, el("div", { class: "wd-note-k", text: "탐구 노트" }), head, helper, qBox, done, logWrap);
  const main = el("div", { class: "wd-main" }, stage, slot);
  step.prepend(main, note);

  // 답한 질문은 다음 질문으로 넘어갈 때 노트 아래에 한 줄로 남긴다(예측 질문은 남기지 않는다).
  let lastQt: Element | null = null;
  let pending: { q: string; a: string; hit: boolean } | null = null;
  const flush = (): void => {
    if (!pending) return;
    const p = pending;
    pending = null;
    log.appendChild(el("div", { class: `wd-log-i ${p.hit ? "hit" : "miss"}` }, el("span", { class: "wd-log-q", text: p.q }), el("b", { class: "wd-log-a", text: p.a })));
    logWrap.classList.add("on");
    log.scrollTop = log.scrollHeight;
  };
  const watch = new MutationObserver(() => {
    const qt = qBox.querySelector(".bv-qt");
    if (qt !== lastQt) {
      flush();
      lastQt = qt;
    }
    if (!qt || pending) return;
    const ok = qBox.querySelector(".bv-choice.ok .bv-choice-t");
    const miss = qBox.querySelector(".bv-choice.miss");
    if (!ok && !miss) return;
    const a = ok ? ok.textContent : qBox.querySelector(".bv-ans-t")?.textContent;
    if (a) pending = { q: qt.textContent ?? "", a, hit: !!ok };
  });
  watch.observe(qBox, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  regrouped.set(step, { head, helper, stage, slot, qBox, done, main, note, watch });
}

/** 넓은 화면이 풀릴 때(기기를 세로로 돌림, 창을 줄임, 스위치를 끔) 랩 뼈대를 원래 차례로 되돌린다. */
function restoreLabs(): void {
  regrouped.forEach((r, step) => {
    r.watch.disconnect();
    if (step.isConnected) {
      // 원래 차례: 제목, 도움말, 무대, 조작 칸(조작부, 판정 상자, 결론). 랩이 뒤에 붙인 것(궁금증 카드 등)은 그 뒤에 그대로 남는다.
      r.slot.append(r.qBox, r.done);
      step.prepend(r.head, r.helper, r.stage, r.slot);
    }
    r.main.remove();
    r.note.remove();
  });
  regrouped.clear();
}

/** 랩이 아닌 스텝에 종류 표식을 붙인다(배치는 CSS가 한다. 요소는 옮기지 않는다).
 *  왼쪽에 둘 것(.wd-left) = 도입 무대, 개념의 첫 그림, 문제의 질문과 그림. 나머지는 오른쪽 노트로 간다. */
function tagStep(step: HTMLElement): void {
  if (step.dataset.wd) return;
  const kid = (sel: string): HTMLElement | null => step.querySelector<HTMLElement>(`:scope > ${sel}`);
  let t = "plain";
  const opts = kid(".opts");
  const stage = kid(".opn-stage");
  const fig = kid(".c-figure");
  if (stage) {
    t = "opener";
    stage.classList.add("wd-left");
  } else if (kid(".comic-panel")) {
    t = "comic";
  } else if (opts && !kid(".q-figure")) {
    t = "plain"; // 그림 없는 문제: 질문과 보기를 붙여 가운데 한 단으로(나누면 왼쪽이 빈다)
  } else if (opts) {
    t = "quiz";
    for (let n = step.firstElementChild; n && n !== opts; n = n.nextElementSibling) n.classList.add("wd-left");
  } else if (kid(".rc-cards")) {
    t = "recap";
  } else if (fig) {
    t = "concept";
    fig.classList.add("wd-left");
  }
  step.dataset.wd = t;
  if (t !== "plain" && t !== "recap") step.classList.add("wd-split");
  step.classList.add(`wd-${t}`);
}

function scan(): void {
  if (!active) return;
  document.querySelectorAll<HTMLElement>(".lesson-screen .step").forEach((st) => {
    if (!st.childElementCount) return;
    if (st.classList.contains("bv-step")) regroupLab(st);
    else tagStep(st);
  });
  // 화면에서 사라진 랩의 기록은 버린다
  regrouped.forEach((r, step) => {
    if (!step.isConnected) {
      r.watch.disconnect();
      regrouped.delete(step);
    }
  });
}

function apply(): void {
  const want = !!mq?.matches && !isWideOff();
  if (want === active) {
    if (active) fit();
    return;
  }
  active = want;
  const root = document.documentElement;
  root.classList.toggle("wide", active);
  root.classList.toggle("dt", active); // 홈과 탭의 뼈대(왼쪽 메뉴, 가운데 단)는 styles/desktop.css가 html.dt에 건다
  if (active) {
    fit();
    observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    scan();
  } else {
    observer?.disconnect();
    observer = null;
    restoreLabs();
  }
}

/** 마이 탭에서 스위치를 바꾼 뒤 부른다. */
export function refreshWide(): void {
  apply();
}

/** 부팅 때 한 번(main.ts). 화면을 그리기 전에 불러 첫 화면부터 맞는 배치로 나오게 한다. */
export function initWide(): void {
  if (mq) return;
  mq = window.matchMedia(MQ);
  mq.addEventListener("change", apply);
  window.addEventListener("resize", () => {
    if (active) fit();
  });
  apply();
}
