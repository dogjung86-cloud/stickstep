// powBuild, 거듭제곱 칩 쌓기(L2 랩). 같은 수 칩을 겹치면 지수 배지가 자란다:
// 2·2·2 → [2]³. 밑이 다른 칩은 합쳐지지 않는다(2²×5³처럼 곱으로 나란히).
// 드래그가 기본, 탭-탭 폴백. rAF 없음, transform + CSS 애니만.
import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface PowStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Chip {
  base: number;
  exp: number;
  x: number;
  y: number;
  el: HTMLElement;
  badge: HTMLElement;
}

const CHIP = 54;

export const powBuild: StepRenderer = (host, step, api) => {
  const s = step as unknown as PowStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "s1", label: "2가 3개", sub: "한 칩으로" },
    { id: "s2", label: "3이 4개", sub: "더 높이" },
    { id: "s3", label: "섞인 곱", sub: "2와 5" },
  ]);
  const board = mboard(238);
  const toast = mtoast(board);
  const read = el("div", { class: "pw-read" });
  const helper = el("div", { class: "helper" });
  host.append(goals.el, board, read, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let chips: Chip[] = [];
  let stageNo = 0;
  let selected: Chip | null = null;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };

  const STAGES: { spawn: number[]; want: Record<number, number>; goal: string; sub: string; intro: string; doneMsg: string; readSrc: string }[] = [
    {
      spawn: [2, 2, 2],
      want: { 2: 3 },
      goal: "s1",
      sub: "2³!",
      intro: "<b>2</b> 칩 세 개: 같은 수끼리 겹쳐 보세요(끌어서 포개기).",
      doneMsg: "2×2×2를 <b>2³</b> 한 글자로! 아래 숫자 <b>2</b>가 밑, 오른쪽 위 <b>3</b>이 지수(곱한 횟수)예요.",
      readSrc: "2×2×2 = 2^3",
    },
    {
      spawn: [3, 3, 3, 3],
      want: { 3: 4 },
      goal: "s2",
      sub: "3⁴!",
      intro: "이번엔 <b>3</b>이 네 개: 전부 한 칩으로 모아 보세요.",
      doneMsg: "3×3×3×3 = <b>3⁴</b>. 지수는 '곱한 횟수'예요, 3⁴은 3×4(=12)가 아니라 <b>81</b>!",
      readSrc: "3×3×3×3 = 3^4",
    },
    {
      spawn: [2, 5, 2, 5, 5],
      want: { 2: 2, 5: 3 },
      goal: "s3",
      sub: "2²×5³!",
      intro: "<b>2</b>와 <b>5</b>가 섞여 있어요, 같은 수끼리만 모아 보세요.",
      doneMsg: "밑이 다르면 하나로 못 합쳐요, 곱으로 나란히 <b>2²×5³</b>. 작은 밑부터 쓰는 게 약속!",
      readSrc: "2×2×5×5×5 = 2^2×5^3",
    },
  ];

  function boardW(): number {
    return board.clientWidth || 340;
  }

  function spawnStage(i: number): void {
    stageNo = i;
    chips.forEach((c) => c.el.remove());
    chips = [];
    selected = null;
    read.innerHTML = "";
    const st = STAGES[i];
    helper.innerHTML = st.intro;
    const bw = boardW();
    const n = st.spawn.length;
    const gap = Math.min(64, (bw - 40 - CHIP) / Math.max(1, n - 1));
    const x0 = (bw - (gap * (n - 1) + CHIP)) / 2;
    st.spawn.forEach((base, k) => {
      const x = x0 + k * gap;
      const y = 66 + (k % 2 ? 44 : 0) + (k % 3 === 2 ? 18 : 0);
      later(() => addChip(base, x, y), k * 110);
    });
  }

  function addChip(base: number, x: number, y: number): Chip {
    const badge = el("span", { class: "exp", text: "" });
    badge.style.display = "none";
    const c: Chip = {
      base,
      exp: 1,
      x,
      y,
      badge,
      el: el("div", { class: `pw-chip ${base === 5 ? "alt" : ""} stacked`, text: String(base), attrs: { role: "button", "aria-label": `${base} 칩` } }),
    };
    c.el.appendChild(badge);
    c.el.style.position = "absolute";
    place(c);
    board.appendChild(c.el);
    chips.push(c);
    bindDrag(c);
    return c;
  }

  function place(c: Chip): void {
    c.el.style.transform = `translate(${c.x}px, ${c.y}px)`;
  }

  function paintBadge(c: Chip): void {
    if (c.exp > 1) {
      c.badge.style.display = "";
      c.badge.textContent = String(c.exp);
    } else {
      c.badge.style.display = "none";
    }
  }

  function tryMerge(c: Chip): boolean {
    // 가장 가까운 다른 칩
    let best: Chip | null = null;
    let bd = 1e9;
    for (const o of chips) {
      if (o === c) continue;
      const d = Math.hypot(o.x - c.x, o.y - c.y);
      if (d < bd) {
        bd = d;
        best = o;
      }
    }
    if (!best || bd > CHIP * 0.92) return false;
    if (best.base !== c.base) {
      haptic(HAPTIC.wrong);
      toast(`밑이 달라요, ${c.base}는 ${c.base}끼리만!`);
      return false;
    }
    // 병합: best가 흡수
    best.exp += c.exp;
    chips = chips.filter((o) => o !== c);
    c.el.style.transition = "transform .18s ease, opacity .18s";
    c.el.style.transform = `translate(${best.x}px, ${best.y}px) scale(.4)`;
    c.el.style.opacity = "0";
    const dead = c.el;
    later(() => dead.remove(), 200);
    paintBadge(best);
    best.el.classList.remove("stacked");
    void best.el.offsetWidth;
    best.el.classList.add("stacked");
    haptic(HAPTIC.select);
    checkStage();
    return true;
  }

  function checkStage(): void {
    const st = STAGES[stageNo];
    const wantKeys = Object.keys(st.want).map(Number);
    const okay =
      chips.length === wantKeys.length &&
      wantKeys.every((b) => chips.some((c) => c.base === b && c.exp === st.want[b]));
    if (!okay) return;
    read.innerHTML = mfmt(st.readSrc);
    helper.innerHTML = st.doneMsg;
    haptic(HAPTIC.correct);
    goals.on(st.goal, st.sub);
    if (stageNo + 1 < STAGES.length) {
      later(() => spawnStage(stageNo + 1), 2100);
    } else {
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "표기 연습하기");
    }
  }

  function bindDrag(c: Chip): void {
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    let moved = false;
    let dragging = false;
    const down = (e: PointerEvent): void => {
      dragging = true;
      moved = false;
      sx = e.clientX;
      sy = e.clientY;
      ox = c.x;
      oy = c.y;
      c.el.classList.add("drag");
      try {
        c.el.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 이벤트 안전 */
      }
    };
    const move = (e: PointerEvent): void => {
      if (!dragging) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
      const bw = boardW();
      c.x = clamp(ox + dx, 4, bw - CHIP - 4);
      c.y = clamp(oy + dy, 4, 238 - CHIP - 4);
      place(c);
    };
    const up = (): void => {
      if (!dragging) return;
      dragging = false;
      c.el.classList.remove("drag");
      if (moved) {
        if (!tryMerge(c)) place(c);
        selected = null;
      } else {
        // 탭 폴백: 선택 → 같은 수 칩 탭 → 병합
        if (selected && selected !== c) {
          if (selected.base === c.base) {
            selected.x = c.x;
            selected.y = c.y;
            tryMerge(selected);
          } else {
            haptic(HAPTIC.wrong);
            toast(`밑이 달라요, ${selected.base}는 ${selected.base}끼리만!`);
          }
          chips.forEach((o) => (o.el.style.outline = ""));
          selected = null;
        } else {
          selected = c;
          chips.forEach((o) => (o.el.style.outline = o === c ? "3px solid rgba(13,165,198,.55)" : ""));
        }
      }
    };
    c.el.addEventListener("pointerdown", down);
    c.el.addEventListener("pointermove", move);
    c.el.addEventListener("pointerup", up);
    c.el.addEventListener("pointercancel", up);
  }

  spawnStage(0);
  api.setCTA("칩을 다 모으면 열려요", { enabled: false });
  return () => {
    timers.forEach((t) => window.clearTimeout(t));
  };
};
