// likeTerms, 동류항 정리소(Ⅱ 문자와 식 랩, 책 74~75쪽). 문자와 차수가 같은 항 칩만
// 드래그로 포개면 계수가 더해져 합쳐진다(3x+2x → 5x). 다른 종류는 스프링 복귀 +
// 오개념 토스트("x와 y는 못 합쳐요" / "상수항은 상수항끼리!" / "x와 x²은 차수가 달라요").
// powBuild의 드래그 병합 + 탭탭 폴백 문법을 그대로 계승. 마지막 판은 동류항이 없는
// 함정 판, "더는 못 합쳐요!" 선언이 정답(못 합치면 그대로 두는 것도 실력).
// 모션은 전부 CSS transition + setTimeout 체인(rAF 금지). setPointerCapture는 try/catch.
// 병합 팝은 translate+scale을 한 인라인 transform으로 합성(키프레임이 배치 translate를
// 덮어쓰는 충돌 없이 .merged와 같은 스프링 바운스).

import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface TermsStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Kind = "x" | "y" | "x2" | "c";
interface ChipDef {
  coef: number;
  kind: Kind;
}
interface Chip extends ChipDef {
  x: number;
  y: number;
  el: HTMLElement;
}

const BOARD_H = 260;
const CHIP_H = 46;
// 색 규약: x·x²=기본(시안, 같은 문자라 색이 같아도 차수가 다르면 안 합쳐지는 게 함정 학습),
// y=.alt(보라), 상수항=.const(앰버)
const KIND_CLS: Record<Kind, string> = { x: "", y: "alt", x2: "", c: "const" };
const KIND_ORDER: Record<Kind, number> = { x2: 0, x: 1, y: 2, c: 3 };

/** 항 하나의 mfmt 마크업. lead=식의 첫 항(양수 + 생략). */
function termSrc(t: ChipDef, lead: boolean): string {
  if (t.kind === "c") return t.coef < 0 ? String(t.coef) : `${lead ? "" : "+"}${t.coef}`;
  const vr = t.kind === "x2" ? "x^2" : t.kind;
  const a = Math.abs(t.coef);
  const sgn = t.coef < 0 ? "-" : lead ? "" : "+";
  return `${sgn}${a === 1 ? "" : a}${vr}`;
}
/** 칩 라벨, 문자항은 "3x"·"-x", 상수항은 부호를 항상 붙여 "+10"·"-8". */
const chipLabel = (t: ChipDef): string => termSrc(t, t.kind !== "c");
/** 남은 칩들을 x² → x → y → 상수 순으로 이어 붙인 정리 결과 식. */
function composeSrc(list: ChipDef[]): string {
  return [...list]
    .sort((p, q) => KIND_ORDER[p.kind] - KIND_ORDER[q.kind])
    .map((t, i) => termSrc(t, i === 0))
    .join("");
}

function wrongMsg(a: Kind, b: Kind): string {
  if (a === "c" || b === "c") return "상수항은 상수항끼리!";
  if ((a === "x" && b === "x2") || (a === "x2" && b === "x")) return "x와 x²은 차수가 달라요";
  return "문자가 달라요, x와 y는 못 합쳐요";
}

interface StageDef {
  chips: ChipDef[];
  pos: [number, number][]; // [x 비율, y px], 같은 종류는 대각선으로 떨어뜨린다
  goal: string;
  sub: string;
  intro: string;
  done: string;
  declare?: boolean; // 함정 판, 병합이 아니라 "없다" 선언이 완료 경로
}

const STAGES: StageDef[] = [
  {
    chips: [
      { coef: 3, kind: "x" },
      { coef: 2, kind: "x" },
      { coef: 10, kind: "c" },
      { coef: -8, kind: "c" },
    ],
    pos: [
      [0.06, 36],
      [0.64, 148],
      [0.7, 40],
      [0.1, 152],
    ],
    goal: "s1",
    sub: "5x+2!",
    intro: "<b>같은 문자끼리</b> 끌어 포개 보세요, x는 x끼리, 상수는 상수끼리!",
    done: "3x+2x=<b>5x</b>, (+10)+(−8)=<b>+2</b>. 이렇게 문자와 차수가 같은 항이 <b>동류항</b>이에요.",
  },
  {
    chips: [
      { coef: 4, kind: "x" },
      { coef: -1, kind: "x" },
      { coef: 7, kind: "y" },
      { coef: 2, kind: "y" },
      { coef: -3, kind: "c" },
    ],
    pos: [
      [0.04, 30],
      [0.66, 144],
      [0.68, 30],
      [0.08, 144],
      [0.36, 88],
    ],
    goal: "s2",
    sub: "3종 정리!",
    intro: "세 종류가 섞였어요, <b>x·y·상수</b>를 각각 모아요.",
    done: "4x−x=<b>3x</b>, 7y+2y=<b>9y</b>, −3은 짝이 없어 <b>그대로</b>. 종류별로 딱 한 항씩!",
  },
  {
    chips: [
      { coef: 2, kind: "x" },
      { coef: 3, kind: "c" },
      { coef: 1, kind: "x2" },
    ],
    pos: [
      [0.08, 52],
      [0.7, 52],
      [0.38, 148],
    ],
    goal: "s3",
    sub: "그대로!",
    intro: "함정 판, <b>합칠 수 있는 짝</b>이 있을까요? 전부 시도해 보고, 없으면 아래에서 선언!",
    done: "x와 x²은 <b>차수가 달라서</b> 동류항이 아니에요. 못 합치면 그대로 두기, 그것도 실력!",
    declare: true,
  },
];

export const likeTerms: StepRenderer = (host, step, api) => {
  const s = step as unknown as TermsStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "s1", label: "x 모으기", sub: "5x+2" },
    { id: "s2", label: "섞인 판", sub: "3종 분리" },
    { id: "s3", label: "함정 판", sub: "합칠 수 없다?" },
  ]);
  const board = mboard(BOARD_H);
  const toast = mtoast(board);
  const read = el("div", { class: "pw-read" });
  const declareBtn = el("button", {
    class: "ct-btn hero",
    text: "더는 못 합쳐요!",
    attrs: { type: "button", "aria-label": "동류항이 더 없다고 선언하기" },
  });
  const declareRow = el(
    "div",
    { class: "ct-actions", style: "display:none; opacity:0; transition:opacity .35s var(--ease-out)" },
    declareBtn,
  );
  const helper = el("div", { class: "helper" });
  host.append(goals.el, board, read, declareRow, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 타이머(모든 지연은 여기로, cleanup에서 일괄 해제) ----
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  // ---- 상태 ----
  let chips: Chip[] = [];
  let stageNo = 0;
  let selected: Chip | null = null;
  let done = false;

  const boardW = (): number => board.clientWidth || 340;

  function setXY(c: Chip, scale = 1): void {
    c.el.style.transform = `translate(${c.x}px, ${c.y}px)${scale !== 1 ? ` scale(${scale})` : ""}`;
  }
  function paintChip(c: Chip): void {
    c.el.innerHTML = mfmt(chipLabel(c));
    c.el.setAttribute("aria-label", `${chipLabel(c)} 칩`);
  }

  function addChip(d: ChipDef, fx: number, y: number): void {
    const c: Chip = { ...d, x: 0, y, el: el("div", { class: `tm-chip ${KIND_CLS[d.kind]}`, attrs: { role: "button" } }) };
    // 배치 기준을 보드 원점으로 고정(absolute + left/top 0 + transform, vn-chip 사고 방지)
    c.el.style.position = "absolute";
    c.el.style.left = "0";
    c.el.style.top = "0";
    paintChip(c);
    board.appendChild(c.el);
    const w = c.el.offsetWidth || 64;
    const bw = boardW();
    c.x = clamp(12 + fx * (bw - w - 24), 4, bw - w - 4);
    // 등장 팝(인라인 트랜지션, 배치 transform과 합성)
    c.el.style.opacity = "0";
    setXY(c, 0.3);
    void c.el.offsetWidth;
    c.el.style.transition = "transform .34s var(--spring-bounce), opacity .22s ease, box-shadow .2s";
    c.el.style.opacity = "1";
    setXY(c);
    later(() => {
      c.el.style.transition = "";
    }, 380);
    chips.push(c);
    bindDrag(c);
  }

  function clearSelect(): void {
    selected = null;
    chips.forEach((o) => {
      o.el.style.outline = "";
    });
  }

  function nearest(c: Chip): { o: Chip; d: number } | null {
    let best: Chip | null = null;
    let bd = 1e9;
    for (const o of chips) {
      if (o === c) continue;
      const d = Math.hypot(
        o.x + o.el.offsetWidth / 2 - (c.x + c.el.offsetWidth / 2),
        o.y + CHIP_H / 2 - (c.y + CHIP_H / 2),
      );
      if (d < bd) {
        bd = d;
        best = o;
      }
    }
    return best ? { o: best, d: bd } : null;
  }

  function springBack(c: Chip, x: number, y: number): void {
    c.x = x;
    c.y = y;
    c.el.style.transition = "transform .4s var(--spring-bounce), box-shadow .2s";
    setXY(c);
    later(() => {
      c.el.style.transition = "";
    }, 420);
  }

  /** c가 o에 흡수, 계수 합산 + 스프링 팝. */
  function merge(c: Chip, o: Chip): void {
    chips = chips.filter((k) => k !== c);
    c.el.style.pointerEvents = "none";
    c.el.style.transition = "transform .2s ease, opacity .2s ease";
    c.el.style.transform = `translate(${o.x}px, ${o.y}px) scale(.4)`;
    c.el.style.opacity = "0";
    const deadEl = c.el;
    later(() => deadEl.remove(), 220);
    o.coef += c.coef;
    later(() => {
      paintChip(o);
      o.el.style.transition = "transform .09s ease-out, box-shadow .2s";
      setXY(o, 1.16);
      later(() => {
        o.el.style.transition = "transform .3s var(--spring-bounce), box-shadow .2s";
        setXY(o);
        later(() => {
          o.el.style.transition = "";
        }, 320);
      }, 100);
    }, 90);
    haptic(HAPTIC.select);
    checkStage();
  }

  /** 드래그를 놓았을 때, 가까운 칩과 병합 시도. 다른 종류면 스프링 복귀. */
  function dropMerge(c: Chip, homeX: number, homeY: number): void {
    const hit = nearest(c);
    if (!hit || hit.d > 54) return; // 빈 곳, 놓은 자리 그대로
    if (hit.o.kind !== c.kind) {
      haptic(HAPTIC.wrong);
      toast(wrongMsg(c.kind, hit.o.kind));
      springBack(c, homeX, homeY);
      return;
    }
    merge(c, hit.o);
  }

  /** 탭탭 폴백, 선택 → 같은 종류 탭이면 병합, 다르면 교정 토스트. */
  function tapSelect(c: Chip): void {
    if (selected && selected !== c) {
      const a = selected;
      clearSelect();
      if (a.kind === c.kind) {
        merge(a, c);
      } else {
        haptic(HAPTIC.wrong);
        toast(wrongMsg(a.kind, c.kind));
      }
    } else if (selected === c) {
      clearSelect();
    } else {
      selected = c;
      haptic(HAPTIC.tap);
      chips.forEach((o) => {
        o.el.style.outline = o === c ? "3px solid rgba(13,165,198,.55)" : "";
      });
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
      c.el.style.transition = ""; // 스프링 복귀 중 잡아도 1:1 추적
      c.el.classList.add("drag");
      try {
        c.el.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 포인터 id 안전 */
      }
    };
    const move = (e: PointerEvent): void => {
      if (!dragging) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
      const w = c.el.offsetWidth || 64;
      c.x = clamp(ox + dx, 4, boardW() - w - 4);
      c.y = clamp(oy + dy, 4, BOARD_H - CHIP_H - 4);
      setXY(c);
    };
    const up = (): void => {
      if (!dragging) return;
      dragging = false;
      c.el.classList.remove("drag");
      if (moved) {
        clearSelect();
        dropMerge(c, ox, oy);
      } else {
        tapSelect(c);
      }
    };
    c.el.addEventListener("pointerdown", down);
    c.el.addEventListener("pointermove", move);
    c.el.addEventListener("pointerup", up);
    c.el.addEventListener("pointercancel", up);
  }

  /** 같은 종류 쌍이 더 없으면 스테이지 완료(함정 판 제외, 그쪽은 선언 버튼). */
  function checkStage(): void {
    const st = STAGES[stageNo];
    if (st.declare) return;
    const dup = chips.some((a) => chips.some((b) => a !== b && a.kind === b.kind));
    if (dup) return;
    read.innerHTML = mfmt(composeSrc(chips));
    helper.innerHTML = st.done;
    haptic(HAPTIC.correct);
    goals.on(st.goal, st.sub);
    toast(stageNo === 0 ? "정리 완료, 5x+2!" : "3종 딱 정리!");
    if (stageNo + 1 < STAGES.length) later(() => spawnStage(stageNo + 1), 2100);
  }

  function spawnStage(i: number): void {
    stageNo = i;
    clearSelect();
    chips.forEach((c) => {
      c.el.style.pointerEvents = "none";
      c.el.style.transition = "opacity .22s ease, transform .22s ease";
      c.el.style.opacity = "0";
      setXY(c, 0.5);
      const deadEl = c.el;
      later(() => deadEl.remove(), 240);
    });
    chips = [];
    read.innerHTML = "";
    const st = STAGES[i];
    helper.innerHTML = st.intro;
    st.chips.forEach((d, k) => later(() => addChip(d, st.pos[k][0], st.pos[k][1]), 260 + k * 90));
    if (st.declare) {
      later(() => {
        declareRow.style.display = "";
        void declareRow.offsetWidth;
        declareRow.style.opacity = "1";
      }, 260 + st.chips.length * 90 + 240);
    }
  }

  declareBtn.addEventListener("click", () => {
    if (done || !STAGES[stageNo].declare) return;
    done = true;
    const st = STAGES[stageNo];
    read.innerHTML = mfmt(composeSrc(chips));
    helper.innerHTML = st.done;
    toast("정답, 동류항이 없어요!");
    goals.on(st.goal, st.sub);
    declareBtn.disabled = true;
    declareRow.style.opacity = "0";
    later(() => {
      declareRow.style.display = "none";
    }, 360);
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  });

  spawnStage(0);
  api.setCTA("동류항을 모아 정리해요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
