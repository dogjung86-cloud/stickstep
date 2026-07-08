// counterLab — 셈돌 랩(수학 · 정수와 유리수의 덧셈·뺄셈).
//   add: (+1)파랑·(−1)빨강 돌을 겹쳐 0쌍으로 상쇄 — 문제 3개(다른 부호·같은 부호·정반대)
//   sub: (+3)−(−2) — 뺄 빨간 돌이 없어서 0쌍(+1,−1)을 투입한 뒤 빼기 통으로 꺼낸다
// 규율: rAF 금지(QA 프리즈) — 이동은 left/top 트랜지션, 등장/소멸은 .born/.poof 키프레임 + setTimeout.
// 돌 배치는 left/top(px)로만 한다 — transform은 .born/.poof/.drag 애니메이션 몫이라 겹치면 순간이동한다.
// setPointerCapture는 반드시 try/catch(합성 포인터에서 throw하면 리스너 전체가 죽는다).

import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { icon } from "../../core/icons";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface CounterStep {
  title: string;
  lead?: string;
  mode: "add" | "sub";
  cta?: string;
  curio?: Curio;
}

interface Stone {
  elm: HTMLElement;
  sign: 1 | -1;
  x: number;
  y: number;
  jx: number; // 유기적 배치용 지터(돌마다 고정)
  jy: number;
  alive: boolean;
}

const SZ = 46; // 돌 지름(px)
const R = SZ / 2;
const PAIR_DIST = 44; // 상쇄 판정 중심 거리
const RING = "0 0 0 3px #fff, 0 0 0 5px var(--subj-num)"; // 선택/타깃 강조(인라인 — 클래스 불필요)
const rnd = (a: number, b: number): number => a + Math.random() * (b - a);

export const counterLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CounterStep;
  const isAdd = s.mode === "add";

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips(
    isAdd
      ? [
          { id: "mix", label: "다른 부호", sub: "상쇄!" },
          { id: "same", label: "같은 부호", sub: "그냥 모임" },
          { id: "zero", label: "정반대", sub: "합은?" },
        ]
      : [
          { id: "stuck", label: "문제 발견", sub: "뺄 돌이 없다!" },
          { id: "pairin", label: "0쌍 투입", sub: "×2" },
          { id: "out", label: "빼기 완료", sub: "결과는?" },
        ],
  );
  const board = mboard(280);
  const exprEl = el("div", { class: "nw-expr" });
  const tray = el("div", { class: "ct-tray" });
  const readEl = el("div", { class: "ct-read" });
  const actions = el("div", { class: "ct-actions" });
  board.append(exprEl, tray, readEl, actions);
  const say = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("목표를 달성해 보세요", { enabled: false });

  /* ---------- 공용 상태 ---------- */
  const stones: Stone[] = [];
  let sel: Stone | null = null;
  let busy = true; // 스폰이 끝나면 풀린다
  let finished = false;
  let bin: HTMLElement | null = null;
  // 모드별 구현(아래 분기에서 채움)을 공용 드래그 로직과 잇는 훅 — 렌더러 스코프라 인스턴스 간 누수 없음
  let addDoneHook: (() => void) | null = null;
  let binTakeHook: ((st: Stone) => void) | null = null;
  const timers = new Set<number>();
  const later = (ms: number, fn: () => void): number => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };
  const trayW = (): number => tray.clientWidth || 328;
  const trayH = (): number => Math.max(tray.clientHeight, 210);
  const dist = (a: Stone, b: Stone): number => Math.hypot(a.x - b.x, a.y - b.y);

  function maybeFinish(): void {
    if (finished || chips.count() < 3) return;
    finished = true;
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /** left/top 배치(트랜지션 옵션). transform은 건드리지 않는다 — born/poof 몫. */
  function put(st: Stone, x: number, y: number, trans = ""): void {
    st.x = x;
    st.y = y;
    st.elm.style.transition = trans ? `left ${trans}, top ${trans}` : "";
    st.elm.style.left = `${x}px`;
    st.elm.style.top = `${y}px`;
    if (trans)
      later(560, () => {
        st.elm.style.transition = "";
      });
  }
  /** 가운데 정렬 한 줄 슬롯(개수·기준 y). */
  function rowSlots(count: number, y: number): { x: number; y: number }[] {
    const w = trayW();
    const spacing = count > 1 ? Math.min(52, (w - 72) / (count - 1)) : 52;
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) out.push({ x: w / 2 - R + (i - (count - 1) / 2) * spacing, y });
    return out;
  }
  function lineUp(list: Stone[], y: number): void {
    const w = trayW();
    const slots = rowSlots(list.length, y);
    list.forEach((q, i) => put(q, clamp(slots[i].x, 4, w - SZ - 4), y, ".5s var(--ease-out)"));
  }

  function setSel(st: Stone | null): void {
    if (sel) sel.elm.style.boxShadow = "";
    sel = st;
    if (sel) sel.elm.style.boxShadow = RING;
  }

  /* ---------- 드래그(캡처 실패 대비 try/catch) + 탭 폴백 ---------- */
  let drag: { st: Stone; pid: number; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null = null;

  function clearCues(): void {
    for (const q of stones) if (q !== sel) q.elm.style.boxShadow = "";
    bin?.classList.remove("hot");
  }
  function overBin(e: PointerEvent): boolean {
    if (!bin) return false;
    const r = bin.getBoundingClientRect();
    return e.clientX > r.left - 8 && e.clientX < r.right + 8 && e.clientY > r.top - 8 && e.clientY < r.bottom + 8;
  }
  function onDown(st: Stone, e: PointerEvent): void {
    if (busy || !st.alive || drag) return;
    try {
      st.elm.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 포인터 — 캡처 없이 진행 */
    }
    drag = { st, pid: e.pointerId, sx: e.clientX, sy: e.clientY, ox: st.x, oy: st.y, moved: false };
  }
  function onMove(st: Stone, e: PointerEvent): void {
    if (!drag || drag.st !== st || e.pointerId !== drag.pid) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) <= 7) return; // 이보다 덜 움직이면 탭
      drag.moved = true;
      setSel(null);
      st.elm.classList.add("drag");
      st.elm.style.transition = "";
      haptic(HAPTIC.select);
    }
    st.x = clamp(drag.ox + dx, 2, trayW() - SZ - 2);
    st.y = clamp(drag.oy + dy, 2, trayH() - SZ - 2);
    st.elm.style.left = `${st.x}px`;
    st.elm.style.top = `${st.y}px`;
    // 타깃 힌트: 상쇄 가능한 반대색(add) · 빼기 통 근접(sub)
    let target: Stone | null = null;
    if (isAdd) {
      for (const q of stones) {
        if (q.alive && q !== st && q.sign !== st.sign && dist(q, st) < PAIR_DIST + 4) {
          target = q;
          break;
        }
      }
    }
    for (const q of stones) if (q !== st) q.elm.style.boxShadow = q === target ? RING : "";
    bin?.classList.toggle("hot", overBin(e));
  }
  function onUp(st: Stone, e: PointerEvent): void {
    if (!drag || drag.st !== st || e.pointerId !== drag.pid) return;
    const d = drag;
    drag = null;
    st.elm.classList.remove("drag");
    clearCues();
    if (busy || !st.alive) return;
    if (!d.moved) {
      tapStone(st);
      return;
    }
    resolveDrop(st, d, e);
  }
  function onCancel(st: Stone, e: PointerEvent): void {
    if (!drag || drag.st !== st || e.pointerId !== drag.pid) return;
    drag = null;
    st.elm.classList.remove("drag");
    clearCues();
  }
  function goHome(st: Stone, d: { ox: number; oy: number }): void {
    put(st, d.ox, d.oy, ".3s var(--spring-soft)");
  }
  function resolveDrop(st: Stone, d: { ox: number; oy: number }, e: PointerEvent): void {
    if (!isAdd && overBin(e)) {
      if (st.sign < 0) {
        binTakeHook?.(st);
      } else {
        goHome(st, d);
        say("빼야 하는 건 −2, 빨간 돌이에요");
        haptic(HAPTIC.wrong);
      }
      return;
    }
    const hit = stones.find((q) => q.alive && q !== st && dist(q, st) < PAIR_DIST) ?? null;
    if (!hit) return; // 빈자리에 놓으면 자유 배치
    if (hit.sign === st.sign) {
      goHome(st, d);
      say("같은 부호끼리는 사라지지 않아요 — 그냥 모여요");
      return;
    }
    if (!isAdd) {
      goHome(st, d);
      say("지금은 빼기 실험 — 겹치기 말고 빼기 통에 넣어요");
      return;
    }
    cancelPair(st, hit);
  }
  function tapStone(st: Stone): void {
    if (busy || !st.alive) return;
    haptic(HAPTIC.tap);
    if (sel === st) {
      setSel(null);
      return;
    }
    if (sel && sel.alive && sel.sign !== st.sign) {
      if (isAdd) {
        const a = sel;
        setSel(null);
        cancelPair(a, st);
      } else {
        setSel(st);
        say("빼려면 빨간 돌을 고른 뒤 빼기 통을 탭해요");
      }
      return;
    }
    if (sel && isAdd) say("같은 부호끼리는 사라지지 않아요 — 그냥 모여요");
    setSel(st);
  }

  function makeStone(sign: 1 | -1): Stone {
    const elm = el("div", {
      class: `ct-stone ${sign > 0 ? "pos" : "neg"}`,
      text: sign > 0 ? "+" : "−",
      style: "cursor:grab",
      attrs: { role: "button", tabindex: "0", "aria-label": sign > 0 ? "+1 돌(파랑)" : "−1 돌(빨강)" },
    });
    const st: Stone = { elm, sign, x: 0, y: 0, jx: rnd(-5, 5), jy: rnd(-4, 4), alive: true };
    elm.addEventListener("pointerdown", (e) => onDown(st, e));
    elm.addEventListener("pointermove", (e) => onMove(st, e));
    elm.addEventListener("pointerup", (e) => onUp(st, e));
    elm.addEventListener("pointercancel", (e) => onCancel(st, e));
    elm.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tapStone(st);
      }
    });
    stones.push(st);
    return st;
  }
  function spawnAt(sign: 1 | -1, x: number, y: number): Stone {
    const st = makeStone(sign);
    tray.appendChild(st.elm);
    put(st, clamp(x + st.jx, 4, trayW() - SZ - 4), clamp(y + st.jy, 4, trayH() - SZ - 4));
    st.elm.classList.add("born");
    later(480, () => st.elm.classList.remove("born"));
    return st;
  }
  /** 0쌍! — 끌던 돌이 상대 위로 탁 붙고 함께 사라진다. */
  function cancelPair(a: Stone, b: Stone): void {
    a.alive = false;
    b.alive = false;
    put(a, b.x, b.y, ".14s ease-out");
    haptic(HAPTIC.cross);
    later(150, () => {
      a.elm.classList.add("poof");
      b.elm.classList.add("poof");
      later(460, () => {
        a.elm.remove();
        b.elm.remove();
      });
    });
    if (isAdd) later(640, () => addDoneHook?.());
  }

  /** 히어로 버튼(스프링 등장). */
  function showHero(label: string, onTap: () => void): HTMLElement {
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" }, text: label });
    b.style.opacity = "0";
    b.style.transform = "translateY(8px)";
    actions.appendChild(b);
    void b.offsetWidth;
    b.style.transition = "opacity .35s, transform .35s var(--spring-soft)";
    b.style.opacity = "1";
    b.style.transform = "";
    b.addEventListener("click", onTap);
    return b;
  }

  /* ============================== add — 상쇄로 덧셈 ============================== */
  if (isAdd) {
    interface Prob {
      src: string;
      t1: { sign: 1 | -1; n: number };
      t2: { sign: 1 | -1; n: number };
    }
    const PROBS: Prob[] = [
      { src: "(+3)+(-5)", t1: { sign: 1, n: 3 }, t2: { sign: -1, n: 5 } },
      { src: "(-2)+(-4)", t1: { sign: -1, n: 2 }, t2: { sign: -1, n: 4 } },
      { src: "(+4)+(-4)", t1: { sign: 1, n: 4 }, t2: { sign: -1, n: 4 } },
    ];
    let prob = 0;
    let hero: HTMLElement | null = null;

    function checkAddDone(): void {
      if (busy) return;
      const hasPos = stones.some((q) => q.alive && q.sign > 0);
      const hasNeg = stones.some((q) => q.alive && q.sign < 0);
      if (hasPos && hasNeg) return; // 아직 상쇄할 짝이 남았다
      busy = true;
      setSel(null);
      const alive = stones.filter((q) => q.alive);
      if (prob === 0) {
        lineUp(alive, 96);
        readEl.innerHTML = mfmt("(+3)+(-5)=(-2)");
        helper.innerHTML =
          "파란 3개가 빨간 3개와 <b>0쌍으로 사라지고</b>, 빨간 2개가 남았어요 — 그래서 −2! 다른 부호의 합은 <b>절댓값의 차</b>에 절댓값 큰 쪽 부호예요.";
        chips.on("mix", "−2!");
        haptic(HAPTIC.correct);
        later(900, () => startProblem(1));
      } else {
        // 정반대 — 전부 소멸
        readEl.innerHTML =
          mfmt("(+4)+(-4)") + `<span class="mx-op" style="margin:0 .18em">=</span><b style="font-size:31px;color:var(--subj-num-press)">0!</b>`;
        helper.innerHTML =
          "전부 사라졌어요! <b>절댓값이 같고 부호가 다르면 합이 0</b>이에요. 정리 — 다른 부호는 차(상쇄), 같은 부호는 그냥 모임(합), 정반대는 0!";
        chips.on("zero", "0!");
        haptic(HAPTIC.done);
        maybeFinish();
      }
    }
    addDoneHook = checkAddDone; // 공용 cancelPair가 이 훅으로 문제 완료를 판정한다

    function startProblem(k: number): void {
      prob = k;
      busy = true;
      setSel(null);
      if (hero) {
        hero.remove();
        hero = null;
      }
      const olds = stones.map((q) => q.elm);
      for (const q of stones) {
        if (!q.alive) continue;
        q.alive = false;
        q.elm.style.transition = "opacity .22s";
        q.elm.style.opacity = "0";
      }
      later(240, () => olds.forEach((o) => o.remove()));
      stones.length = 0;

      const p = PROBS[k];
      exprEl.innerHTML = mfmt(p.src);
      readEl.innerHTML = "";
      if (k === 0)
        helper.innerHTML =
          "파랑(+1)과 빨강(−1)이 만나면 <b>0쌍</b> — 서로 지워져요! 파란 돌을 끌어 빨간 돌 위에 놓아 보세요. 돌 탭 → 반대색 탭도 돼요.";
      if (k === 2) helper.innerHTML = "이번엔 파랑 4개, 빨강 4개 — 전부 없애면 뭐가 남을까요?";

      // 스폰 계획: 다른 부호면 위(+)/아래(−) 줄, 같은 부호면 항별 두 무더기
      const w = trayW();
      const plan: { sign: 1 | -1; x: number; y: number }[] = [];
      if (p.t1.sign !== p.t2.sign) {
        const s1 = rowSlots(p.t1.n, p.t1.sign > 0 ? 26 : 118);
        const s2 = rowSlots(p.t2.n, p.t2.sign > 0 ? 26 : 118);
        s1.forEach((q) => plan.push({ sign: p.t1.sign, ...q }));
        s2.forEach((q) => plan.push({ sign: p.t2.sign, ...q }));
      } else {
        const C1 = [
          [-27, 0],
          [27, 8],
        ];
        const C2 = [
          [-30, -24],
          [26, -30],
          [-24, 28],
          [32, 22],
        ];
        C1.slice(0, p.t1.n).forEach(([ox, oy]) => plan.push({ sign: p.t1.sign, x: w * 0.3 + ox - R, y: 74 + oy }));
        C2.slice(0, p.t2.n).forEach(([ox, oy]) => plan.push({ sign: p.t2.sign, x: w * 0.66 + ox - R, y: 116 + oy }));
      }
      plan.forEach((pt, i) => {
        const delay = i * 120 + (i >= p.t1.n ? 160 : 0); // 항 사이 잠깐 숨 고르기
        later(delay, () => spawnAt(pt.sign, pt.x, pt.y));
      });
      later(plan.length * 120 + 420, () => {
        busy = false;
        if (k === 1) {
          helper.innerHTML = "사라질 짝이 없네요! 이번엔 <b>빨강뿐</b>이에요.";
          hero = showHero("그냥 세어 보기", onCountTap);
        }
      });
    }
    function onCountTap(): void {
      if (busy || prob !== 1) return;
      busy = true;
      haptic(HAPTIC.correct);
      if (hero) {
        hero.style.opacity = "0";
        const h = hero;
        later(300, () => h.remove());
        hero = null;
      }
      lineUp(
        stones.filter((q) => q.alive),
        96,
      );
      readEl.innerHTML = mfmt("(-2)+(-4)=(-6)");
      helper.innerHTML =
        "사라질 짝이 없으니 <b>그냥 모여요</b> — 개수는 2+4=6, 부호는 그대로 −. 같은 부호의 합은 <b>절댓값의 합</b>에 공통 부호!";
      chips.on("same", "−6!");
      later(1400, () => startProblem(2));
    }

    later(140, () => startProblem(0));
  } else {
    /* ============================== sub — 0쌍 투입으로 뺄셈 ============================== */
    let pairs = 0; // 투입한 0쌍 수(최대 2)
    let taken = 0; // 통에 뺀 빨간 돌 수
    let hero: HTMLElement | null = null;

    bin = el(
      "div",
      { class: "ct-bin", attrs: { role: "button", tabindex: "0", "aria-label": "빼기 통 — 빼낼 돌을 여기에 넣어요" } },
      el("span", { html: icon("x", 20), style: "display:grid;place-items:center" }),
      el("span", { text: "빼기", style: "font-size:10px;font-weight:800" }),
    );
    tray.appendChild(bin);

    const liveSum = (): string => {
      const v = stones.reduce((a, q) => a + (q.alive ? q.sign : 0), 0);
      const src = v === 0 ? "0" : `(${v > 0 ? "+" : "-"}${Math.abs(v)})`;
      return `<span style="font-size:14px;font-weight:700;color:var(--n500)">지금 합&nbsp;</span>${mfmt(src)}`;
    };
    /** 밴드(부호별 줄)에 돌 하나 추가 — 기존 돌은 글라이드로 자리를 내준다. */
    function addToBand(sign: 1 | -1): void {
      const st = makeStone(sign);
      tray.appendChild(st.elm);
      const band = stones.filter((q) => q.alive && q.sign === sign);
      const slots = rowSlots(band.length, sign > 0 ? 74 : 140);
      const w = trayW();
      band.forEach((q, i) => {
        const x = clamp(slots[i].x + q.jx, 4, w - SZ - 4);
        const y = clamp(slots[i].y + q.jy, 4, trayH() - SZ - 4);
        if (q === st) put(q, x, y);
        else put(q, x, y, ".4s var(--ease-out)");
      });
      st.elm.classList.add("born");
      later(480, () => st.elm.classList.remove("born"));
    }

    function binTakeSub(st: Stone): void {
      if (!bin) return;
      st.alive = false;
      setSel(null);
      put(st, bin.offsetLeft + 29 - R, bin.offsetTop + 29 - R, ".2s ease-in");
      haptic(HAPTIC.cross);
      bin.classList.add("hot");
      later(210, () => {
        st.elm.classList.add("poof");
        later(460, () => st.elm.remove());
        bin?.classList.remove("hot");
      });
      taken++;
      readEl.innerHTML = liveSum();
      if (taken === 1) say("−1 하나 뺐어요 — 하나 더!");
      if (taken === 2) later(760, finishSub);
    }
    binTakeHook = binTakeSub;

    function finishSub(): void {
      busy = true;
      setSel(null);
      lineUp(
        stones.filter((q) => q.alive),
        108,
      );
      readEl.innerHTML = mfmt("(+3)-(-2)=(+5)");
      chips.on("out", "+5!");
      helper.innerHTML =
        "빨간 돌 2개를 <b>빼는</b> 것과 파란 돌 2개를 <b>더하는</b> 것 — 결과가 같아요! 그래서 빼기는 <b>반대 수의 덧셈</b>으로 바꿀 수 있어요." +
        `<div style="margin-top:8px">${mfmt("(+3)-(-2)=(+3)+(+2)")}</div>`;
      haptic(HAPTIC.done);
      maybeFinish();
    }

    function onPairTap(): void {
      if (busy || pairs >= 2) return;
      pairs++;
      haptic(HAPTIC.select);
      if (pairs === 1) chips.on("stuck");
      addToBand(1);
      addToBand(-1);
      readEl.innerHTML = liveSum();
      say(pairs === 1 ? "합은 변하지 않아요 — 0을 넣었으니까요" : "또 0쌍! 합은 여전히 +3이에요");
      if (pairs === 1) {
        helper.innerHTML = "빨간 돌이 생겼어요! 그런데 <b>2개</b> 필요하죠 — 한 쌍 더 넣어요.";
      } else {
        chips.on("pairin", "완료!");
        if (hero) {
          hero.setAttribute("aria-disabled", "true");
          hero.style.opacity = ".35";
          hero.style.pointerEvents = "none";
        }
        helper.innerHTML = "이제 빨간 돌 <b>2개</b>를 우상단 <b>빼기 통</b>으로! 끌어다 넣거나, 돌 탭 → 통 탭이에요.";
      }
    }

    bin.addEventListener("click", () => {
      if (busy) return;
      haptic(HAPTIC.tap);
      if (!sel || !sel.alive) {
        say("먼저 빼낼 빨간 돌을 탭해서 골라요");
        return;
      }
      if (sel.sign > 0) {
        say("빼야 하는 건 −2, 빨간 돌이에요");
        haptic(HAPTIC.wrong);
        return;
      }
      binTakeSub(sel);
    });
    bin.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        bin?.click();
      }
    });

    exprEl.innerHTML = mfmt("(+3)-(-2)");
    helper.innerHTML = "빨간 돌(−1) <b>2개를 꺼내야</b> 해요. …그런데 빨간 돌이 없네요?";
    const slots0 = rowSlots(3, 74);
    slots0.forEach((q, i) => later(160 + i * 120, () => spawnAt(1, q.x, q.y)));
    later(160 + 3 * 120 + 320, () => {
      busy = false;
      readEl.innerHTML = liveSum();
      hero = showHero("0쌍 넣기 (+1 −1)", onPairTap);
    });
  }

  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    timers.clear();
  };
};
