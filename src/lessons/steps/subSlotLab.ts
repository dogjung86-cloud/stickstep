// subSlotLab, 대입법 랩(중2 수학 Ⅱ L7, 책 78~79쪽). 한 방정식이 y=(x의 식) 꼴일 때,
// 다른 방정식의 y 자리에 그 식 카드를 통째로 꽂아 미지수가 하나로 줄어드는 것을 본다.
// ── 스펙(구현 에이전트용) ──────────────────────────────────
// 국면 1: { y=x+3000, 2x+y=30000 } (빙수 소재 계승, 수치 유지 가능 — 표준 예시 구조).
//         ①카드의 y=x+3000에서 (x+3000) 식 칩을 드래그(탭탭 폴백)해 ②의 y 슬롯에 꽂으면
//         2x+(x+3000)=30000으로 변신(괄호가 반짝 — "통째로, 괄호째!") → 미지수 y 소멸 연출
//         → [정리] 3x=27000 → [÷3] x=9000 → 목표 slot.
// 국면 2: "y를 구하라" — x=9000 칩을 ①의 x 슬롯에 꽂아 y=12000 → "두 값 모두가 해!"
//         (한 미지수만 구하고 끝내는 오개념 차단) → 순서쌍 (9000, 12000) 완성 → 목표 back.
// 국면 3: { x-2y=2, 4x-3y=13 } — 먼저 ①을 x=2y+2로 변형(이항 버튼)한 뒤 꽂기.
//         괄호 없이 꽂는 함정 선택지(4·2y+2-3y? mq6-q 예측: 괄호가 필요할까?) → 목표 wrap.
// 목표 칩 3: slot·back·wrap. 문법: mboard+goalChips+mtoast, CSS 트랜지션+setTimeout(Set),
// rAF 금지, setPointerCapture try/catch, 칩 left/top. 참조: solveLab(칩 드래그), likeTerms.
// 스타일은 math2.css의 .ssl-* 섹션(스니펫 보고).
// ── 구현 노트 ─────────────────────────────────────────────
// 칩은 보드 절대좌표 left/top으로만 이동(transform은 born/poof 키프레임 몫), rAF 없음.
// 출발지(.ssl-anchor)는 칩 폭만큼 자리를 지키다 꽂힌 뒤 원본 식이 복원된다(①은 계속 참).
// busy는 모든 분기 종착점(arm 설치·spawnChip 안착·완주)에서 해제한다(powMulLab 실버그 재발 금지).
import { el, clamp, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const CHIP_H = 40; // .ssl-chip 높이(px), 드래그 경계 계산용

export const subSlotLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "slot", label: "식 꽂기", sub: "y 지우기" },
    { id: "back", label: "마저 구하기", sub: "순서쌍 완성" },
    { id: "wrap", label: "괄호째", sub: "함정 돌파" },
  ]);
  const board = mboard(380);
  const stage = el("div", { class: "ssl-stage" });
  const cardA = el("div", { class: "ssl-card" });
  const cardB = el("div", { class: "ssl-card" });
  stage.append(cardA, cardB);
  // mq6 패널 문법: inst → eqs → qline(판단 질문은 선택지 바로 위) → ctl
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst" });
  const eqs = el("div", { class: "mq6-eqs" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(goals.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let busy = true; // 연출·판정 중 입력 잠금
  let finished = false;
  let tray: HTMLElement | null = null; // 국면 2의 "찾은 값" 카드

  function maybeDone(): void {
    if (finished || goals.count() < 3) return;
    finished = true;
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ---------- 패널 도우미 ---------- */
  function pushEq(src: string, note?: string): void {
    eqs.appendChild(
      el("div", { class: "mq6-eq mq6-pop", html: `${mfmt(src)}${note ? `<span>${note}</span>` : ""}` }),
    );
  }
  function pushPair(pair: string, label: string): void {
    eqs.appendChild(el("div", { class: "ssl-pair mq6-pop", html: `${label} ${mfmt(pair)}` }));
  }
  /** 진행 버튼 하나를 ctl에 장착. 설치가 곧 입력 개방(busy 해제 지점). */
  function arm(label: string, on: () => void): void {
    clear(ctl);
    const b = el("button", { class: "ssl-btn go pulse", html: label, attrs: { type: "button" } });
    b.addEventListener("click", () => {
      if (busy || b.disabled) return;
      busy = true;
      b.disabled = true;
      b.classList.remove("pulse");
      haptic(HAPTIC.select);
      on();
    });
    ctl.appendChild(b);
    busy = false;
  }

  /* ---------- 카드 도우미 ---------- */
  function fillCard(card: HTMLElement, tag: string, pieces: (HTMLElement | string)[]): HTMLElement {
    clear(card);
    const row = el("div", { class: "ssl-crow" });
    for (const p of pieces) row.appendChild(typeof p === "string" ? el("span", { html: mfmt(p) }) : p);
    card.append(el("span", { class: "ssl-ctag", html: tag }), row);
    return row;
  }
  function mkSlot(ghost: string): HTMLElement {
    return el("span", {
      class: "ssl-slot live",
      html: mfmt(ghost),
      attrs: { role: "button", "aria-label": `${ghost} 자리 점선 홈` },
    });
  }
  const wrapFill = (src: string): string =>
    `<span class="ssl-par flash">(</span>${mfmt(src)}<span class="ssl-par flash">)</span>`;
  const plainFill = (src: string): string => `<span class="ssl-fillf">${mfmt(src)}</span>`;

  /* ---------- 칩 드래그(탭탭 폴백) ---------- */
  interface DragChip {
    chip: HTMLElement;
    anchor: HTMLElement;
    slot: HTMLElement;
    slotCard: HTMLElement;
    src: string;
    onDrop: () => void;
  }
  let cur: DragChip | null = null;
  let sel = false; // 탭탭 폴백: 칩 선택 상태
  let dragOn = false;
  let tapHinted = false;

  function placeChip(x: number, y: number, trans = ""): void {
    if (!cur) return;
    const c = cur.chip;
    c.style.transition = trans ? `left ${trans}, top ${trans}` : "";
    c.style.left = `${x}px`;
    c.style.top = `${y}px`;
    if (trans)
      later(() => {
        c.style.transition = "";
      }, 620);
  }
  function homePos(): { x: number; y: number } {
    const b = board.getBoundingClientRect();
    const a = cur!.anchor.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top };
  }
  function slotPos(): { x: number; y: number } {
    const b = board.getBoundingClientRect();
    const r = cur!.slot.getBoundingClientRect();
    return {
      x: r.left - b.left + (r.width - cur!.chip.offsetWidth) / 2,
      y: r.top - b.top + (r.height - CHIP_H) / 2,
    };
  }
  function overSlot(): boolean {
    if (!cur) return false;
    const c = cur.chip.getBoundingClientRect();
    const r = cur.slot.getBoundingClientRect();
    const cx = c.left + c.width / 2;
    const cy = c.top + c.height / 2;
    return cx > r.left - 18 && cx < r.right + 18 && cy > r.top - 16 && cy < r.bottom + 16;
  }
  function setSel(v: boolean): void {
    if (!cur) return;
    sel = v;
    cur.chip.classList.toggle("sel", v);
    if (v) {
      haptic(HAPTIC.tap);
      if (!tapHinted) {
        tapHinted = true;
        toast("좋아요, 이제 점선 홈을 탭하면 꽂혀요");
      }
    }
  }
  /** 드롭 확정: 칩이 홈으로 미끄러져 들어간 뒤 국면별 onDrop 호출. */
  function dropIn(soft = false): void {
    if (!cur) return;
    busy = true;
    dragOn = false;
    setSel(false);
    cur.slot.classList.remove("live", "hot");
    const p = slotPos();
    placeChip(p.x, p.y, soft ? ".4s var(--spring-soft)" : ".22s ease-out");
    haptic(HAPTIC.select);
    const cb = cur.onDrop;
    later(cb, soft ? 430 : 260);
  }
  /** 칩을 슬롯에 최종 합체: 칩 제거 + 슬롯 채움 + 출발지에 원본 식 복원(①은 계속 참). */
  function settleChip(fillHtml: string): void {
    if (!cur) return;
    cur.chip.remove();
    cur.slot.classList.add("filled");
    cur.slot.innerHTML = fillHtml;
    cur.anchor.classList.add("stay");
    cur.anchor.innerHTML = mfmt(cur.src);
    cur = null;
  }
  /** 슬롯에서 밀려난 미지수가 포프하고 사라지는 연출. */
  function poofGhost(slot: HTMLElement, txt: string): void {
    const b = board.getBoundingClientRect();
    const r = slot.getBoundingClientRect();
    const g = el("div", { class: "ssl-poofy", html: mfmt(txt), attrs: { "aria-hidden": "true" } });
    g.style.left = `${r.left - b.left + r.width / 2 - 5}px`;
    g.style.top = `${r.top - b.top - 4}px`;
    board.appendChild(g);
    later(() => g.remove(), 900);
  }
  function spawnChip(o: {
    src: string;
    anchor: HTMLElement;
    slot: HTMLElement;
    slotCard: HTMLElement;
    onDrop: () => void;
  }): void {
    const chip = el("div", {
      class: "ssl-chip",
      html: mfmt(o.src),
      attrs: { role: "button", "aria-label": `${o.src} 식 칩` },
    });
    chip.style.visibility = "hidden";
    board.appendChild(chip);
    cur = { chip, anchor: o.anchor, slot: o.slot, slotCard: o.slotCard, src: o.src, onDrop: o.onDrop };
    sel = false;
    dragOn = false;
    bindDrag(chip);
    later(() => {
      if (!cur || cur.chip !== chip) return;
      o.anchor.style.minWidth = `${chip.offsetWidth}px`;
      const h = homePos();
      placeChip(h.x, h.y);
      chip.style.visibility = "";
      chip.classList.add("born");
      dragOn = true;
      busy = false; // 칩이 자리 잡으면 조작 개방
    }, 60);
  }
  function bindDrag(chipEl: HTMLElement): void {
    let d: { sx: number; sy: number; ox: number; oy: number; moved: boolean } | null = null;
    chipEl.addEventListener("pointerdown", (e) => {
      if (busy || !dragOn || !cur || cur.chip !== chipEl) return;
      try {
        chipEl.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 포인터 안전 */
      }
      d = {
        sx: e.clientX,
        sy: e.clientY,
        ox: parseFloat(chipEl.style.left) || 0,
        oy: parseFloat(chipEl.style.top) || 0,
        moved: false,
      };
    });
    chipEl.addEventListener("pointermove", (e) => {
      if (!d || busy || !dragOn || !cur) return;
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;
      if (!d.moved && Math.hypot(dx, dy) > 7) {
        d.moved = true;
        chipEl.classList.add("drag");
        setSel(false);
      }
      if (!d.moved) return;
      const b = board.getBoundingClientRect();
      chipEl.style.left = `${clamp(d.ox + dx, 2, b.width - chipEl.offsetWidth - 2)}px`;
      chipEl.style.top = `${clamp(d.oy + dy, 2, b.height - CHIP_H - 2)}px`;
      cur.slot.classList.toggle("hot", overSlot());
    });
    const up = (): void => {
      if (!d) return;
      const moved = d.moved;
      d = null;
      chipEl.classList.remove("drag");
      if (busy || !dragOn || !cur) return;
      cur.slot.classList.remove("hot");
      if (!moved) {
        setSel(!sel); // 탭 = 선택 토글
        return;
      }
      if (overSlot()) dropIn();
      else {
        const h = homePos();
        placeChip(h.x, h.y, ".45s var(--spring-bounce)"); // 스프링 복귀
        toast("점선 홈 위에 놓아야 꽂혀요. 칩을 탭한 뒤 홈을 탭해도 돼요");
      }
    };
    chipEl.addEventListener("pointerup", up);
    chipEl.addEventListener("pointercancel", up);
  }
  // 탭탭 폴백 2단계: 칩 선택 상태에서 홈(또는 홈이 있는 카드)을 탭하면 꽂기
  board.addEventListener("pointerdown", (e) => {
    if (busy || !dragOn || !cur || !sel) return;
    const t = e.target as HTMLElement;
    if (t.closest(".ssl-chip")) return;
    const inSlot = t.closest(".ssl-slot") === cur.slot;
    const inCard = t.closest(".ssl-card") === cur.slotCard;
    if (inSlot || inCard) dropIn(true);
    else setSel(false);
  });

  /* ---------- 국면 1: ②의 y 슬롯에 식 통째로 꽂기(빙수 메뉴판) ---------- */
  function startP1(): void {
    inst.innerHTML = `① 과일빙수 ${mfmt("y")}는 팥빙수 ${mfmt("x")}보다 3000원 비싸요. ② 팥빙수 둘에 과일빙수 하나는 30000원!`;
    helper.innerHTML =
      "① 카드의 <b>x+3000</b> 칩을 ② 카드의 <b>y 자리 점선 홈</b>에 통째로 꽂아 보세요. 칩을 탭한 뒤 홈을 탭해도 돼요.";
    const anchor = el("span", { class: "ssl-anchor" });
    const rowA = fillCard(cardA, "①", ["y", "="]);
    rowA.appendChild(anchor);
    const slot = mkSlot("y");
    const rowB = fillCard(cardB, "②", ["2x", "+"]);
    rowB.append(slot, el("span", { html: mfmt("=30000") }));
    spawnChip({
      src: "x+3000",
      anchor,
      slot,
      slotCard: cardB,
      onDrop: () => {
        settleChip(wrapFill("x+3000"));
        poofGhost(slot, "y");
        haptic(HAPTIC.correct);
        toast("통째로, 괄호째! y가 있던 자리에 x의 식이 들어갔어요");
        pushEq("2x+(x+3000)=30000", "미지수가 x 하나로!");
        helper.innerHTML = "y가 사라졌어요. 이제 <b>x 하나짜리 방정식</b>이니 풀 수 있어요!";
        later(() => arm("정리하기", p1Tidy), 700);
      },
    });
  }
  function p1Tidy(): void {
    pushEq("3x+3000=30000", "2x+x=3x");
    later(() => pushEq("3x=27000", "3000을 오른쪽으로"), 620);
    later(() => arm("양변 ÷3", p1Div), 1300);
  }
  function p1Div(): void {
    pushEq("x=9000", "팥빙수 가격!");
    haptic(HAPTIC.correct);
    goals.on("slot", "x=9000!");
    toast("x를 잡았어요! 그런데 여기서 멈추면 반쪽 답이에요");
    helper.innerHTML = "연립방정식의 해는 <b>x와 y의 쌍</b>이에요. 남은 y도 구하러 가요!";
    later(startP2, 1600);
  }

  /* ---------- 국면 2: 찾은 값을 ①에 거꾸로 대입해 y까지(순서쌍 완성) ---------- */
  function startP2(): void {
    clear(eqs);
    inst.innerHTML = `x=9000을 알아냈어요. 이번엔 ①의 <b>x 자리</b>에 9000을 꽂을 차례!`;
    helper.innerHTML = "구한 값을 <b>거꾸로 대입</b>하면 남은 y가 바로 나와요.";
    cardB.classList.add("dim");
    const slot = mkSlot("x");
    const rowA = fillCard(cardA, "①", ["y", "="]);
    rowA.append(slot, el("span", { html: mfmt("+3000") }));
    tray = el("div", { class: "ssl-card tray" });
    stage.appendChild(tray);
    const anchor = el("span", { class: "ssl-anchor" });
    const rowT = fillCard(tray, "값", ["x", "="]);
    rowT.appendChild(anchor);
    spawnChip({
      src: "9000",
      anchor,
      slot,
      slotCard: cardA,
      onDrop: () => {
        settleChip(plainFill("9000"));
        poofGhost(slot, "x");
        haptic(HAPTIC.correct);
        toast("x 자리에 9000이 쏙!");
        pushEq("y=9000+3000", "①에 x=9000 대입");
        later(() => arm("계산하기", p2Calc), 700);
      },
    });
  }
  function p2Calc(): void {
    pushEq("y=12000", "과일빙수 가격!");
    haptic(HAPTIC.correct);
    later(() => {
      pushPair("(x, y)=(9000, 12000)", "두 값 모두가 해!");
      goals.on("back", "(9000, 12000)!");
      toast("x만 구하고 끝내면 안 돼요. 두 값의 쌍이 완성된 답!");
      helper.innerHTML = "순서쌍 완성! 다음 판은 <b>y= 꼴이 없는</b> 연립방정식이에요.";
      arm("다음 판: 꼴부터 만들기", startP3);
    }, 750);
  }

  /* ---------- 국면 3: 이항으로 x= 꼴을 만들고, 괄호 함정 예측 ---------- */
  function startP3(): void {
    clear(eqs);
    tray?.remove();
    tray = null;
    cardB.classList.remove("dim");
    inst.innerHTML = `새 문제: ① ${mfmt("x-2y=2")}, ② ${mfmt("4x-3y=13")}. 그런데 꽂을 <b>x= 꼴</b>이 아직 없어요!`;
    helper.innerHTML =
      "①에서 <b>−2y를 오른쪽으로</b> 옮기면 x= 꼴이 돼요. 등호를 건너면 부호가 뒤집히는 이항, 기억나죠?";
    const ty = el("span", { html: mfmt("-2y") });
    const tr = el("span", { html: mfmt("=2") });
    const rowA = fillCard(cardA, "①", ["x"]);
    rowA.append(ty, tr);
    const slot = mkSlot("x");
    slot.classList.remove("live"); // 칩이 생기기 전에는 조용히 대기
    const rowB = fillCard(cardB, "②", []);
    rowB.append(
      el("span", { html: mfmt("4") }),
      slot,
      el("span", { html: mfmt("-3y") }),
      el("span", { html: mfmt("=13") }),
    );
    arm("−2y 이항하기", () => p3Shift(ty, tr, slot));
  }
  /** 이항 연출: −2y가 등호를 건너 날아가며 +2y로 뒤집힌다. */
  function p3Shift(ty: HTMLElement, tr: HTMLElement, slot: HTMLElement): void {
    const b = board.getBoundingClientRect();
    const from = ty.getBoundingClientRect();
    const to = tr.getBoundingClientRect();
    const fly = el("span", { class: "ssl-fly", html: mfmt("-2y"), attrs: { "aria-hidden": "true" } });
    fly.style.left = `${from.left - b.left}px`;
    fly.style.top = `${from.top - b.top}px`;
    board.appendChild(fly);
    ty.style.opacity = "0";
    later(() => {
      fly.style.left = `${to.right - b.left + 8}px`;
      fly.style.top = `${to.top - b.top}px`;
    }, 40);
    later(() => {
      fly.innerHTML = mfmt("+2y");
      haptic(HAPTIC.select);
    }, 340);
    later(() => {
      fly.remove();
      const anchor = el("span", { class: "ssl-anchor" });
      const rowA = fillCard(cardA, "①", ["x", "="]);
      rowA.appendChild(anchor);
      toast("등호를 건너며 −2y가 +2y로! 정리하면 x=2y+2");
      pushEq("x=2y+2", "① 변신 완료");
      slot.classList.add("live");
      helper.innerHTML = "이제 <b>2y+2</b> 칩을 ②의 x 자리에 꽂아요. 4와 곱해질 텐데, 그냥 꽂아도 될까요?";
      spawnChip({ src: "2y+2", anchor, slot, slotCard: cardB, onDrop: () => p3Ask(slot) });
    }, 660);
  }
  /** 칩이 홈에 걸쳐진 채 판단 질문(.mq6-q). 예측은 채점에 넣지 않는다. */
  function p3Ask(slot: HTMLElement): void {
    qline.innerHTML = `x 자리에 2y+2를 꽂는 중이에요. <b>괄호가 필요할까요?</b>`;
    clear(ctl);
    const row = el("div", { class: "mq6-choices" });
    let answered = false;
    const bWrap = el("button", {
      class: "mq6-choice",
      html: `괄호째: ${mfmt("4(2y+2)-3y")}`,
      attrs: { type: "button" },
    });
    const bNaked = el("button", {
      class: "mq6-choice",
      html: `그대로: ${mfmt("4·2y+2-3y")}`,
      attrs: { type: "button" },
    });
    const pick = (good: boolean, btn: HTMLButtonElement): void => {
      if (answered) return;
      answered = true;
      busy = true;
      haptic(HAPTIC.select);
      [bWrap, bNaked].forEach((x) => (x.disabled = true));
      bWrap.classList.add("ok"); // 정답 선택지 공개(divLab 문법)
      if (good) p3Good(slot);
      else {
        btn.classList.add("no");
        p3Trap(slot);
      }
    };
    bWrap.addEventListener("click", () => pick(true, bWrap));
    bNaked.addEventListener("click", () => pick(false, bNaked));
    row.append(bWrap, bNaked);
    ctl.appendChild(row);
    busy = false; // 예측 선택 개방(ask 콜백 busy 해제 규칙)
  }
  function p3Good(slot: HTMLElement): void {
    settleChip(wrapFill("2y+2"));
    poofGhost(slot, "x");
    haptic(HAPTIC.correct);
    toast("괄호째 꽂았으니 4가 (2y+2) 전체와 곱해져요!");
    pushEq("4(2y+2)-3y=13", "미지수 y만 남았어요");
    later(() => {
      qline.innerHTML = "";
      arm("정리하기", p3Tidy);
    }, 800);
  }
  /** 함정 경로: 괄호 없이 꽂힌 4·2y+2를 목격 → 오개념 교정 → 자동 수정. */
  function p3Trap(slot: HTMLElement): void {
    settleChip(plainFill("2y+2"));
    cardB.classList.add("shake");
    haptic(HAPTIC.wrong);
    toast("이러면 4는 2y에만 곱해져 8y+2가 돼요. x는 2y+2 전체라서 통째로 곱해야 해요!");
    later(() => {
      cardB.classList.remove("shake");
      slot.innerHTML = wrapFill("2y+2");
      haptic(HAPTIC.correct);
      toast("괄호로 감싸면 4(2y+2), 한 덩어리로 곱해져요");
      pushEq("4(2y+2)-3y=13", "괄호째로 고쳤어요");
      later(() => {
        qline.innerHTML = "";
        arm("정리하기", p3Tidy);
      }, 900);
    }, 2200);
  }
  function p3Tidy(): void {
    pushEq("8y+8-3y=13", "4×2y=8y, 4×2=8");
    later(() => pushEq("5y=5", "8y−3y=5y, 13−8=5"), 620);
    later(() => arm("양변 ÷5", p3Div), 1300);
  }
  function p3Div(): void {
    pushEq("y=1", "y를 잡았어요");
    haptic(HAPTIC.correct);
    later(() => arm("x도 구하기", p3Back), 700);
  }
  function p3Back(): void {
    pushEq("x=2×1+2=4", "①에 y=1 대입");
    later(() => {
      pushPair("(x, y)=(4, 1)", "함정 돌파, 해 완성!");
      goals.on("wrap", "(4, 1)!");
      haptic(HAPTIC.correct);
      eqs.appendChild(
        el("div", {
          class: "mq6-concl mq6-pop",
          html:
            "한 식을 다른 식의 미지수 자리에 <b>통째로, 괄호째 대입</b>해서 미지수를 하나로 줄이는 풀이법이 <b>대입법</b>이에요. 값 하나를 구하면 <b>거꾸로 대입</b>해서 남은 값까지!",
        }),
      );
      helper.innerHTML = "식을 꽂고, 하나를 구하고, 거꾸로 꽂고. 대입법의 세 박자를 완주했어요!";
      clear(ctl);
      maybeDone();
      busy = false;
    }, 850);
  }

  api.setCTA("식을 꽂아 미지수를 지우면 열려요", { enabled: false });
  startP1();

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
