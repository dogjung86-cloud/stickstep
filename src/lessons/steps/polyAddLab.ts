// polyAddLab, 다항식 정리 랩(중2 수학 Ⅰ L8, 책 38~40쪽). 중1 동류항 칩 문법(likeTerms)을
// 이차항까지 확장한다. Kind = x2 | x | c. 괄호 상자를 탭해 열면 칩이 쏟아지고(setTimeout
// 체인 낙하), 동류항끼리 드래그 병합. 빼기 괄호는 여는 순간 전원 부호 반전.
// 국면 1 "괄호 열고 정리": (2x²+3x)+(x²−5x+4), 상자 2개를 탭해 열고 동류항 병합 →
//   3x²−2x+4. x²와 x를 포개면 스프링 복귀 + "차수가 달라서 못 합쳐요"(핵심 함정).
// 국면 2 "빼기 괄호의 반전": (4x²+x)−(3x²−2x+1), 두 번째 상자에 큰 − 도장. 여는 순간
//   칩들이 스태거 120ms 카드 플립으로 일제히 부호 반전(+3x²→−3x², −2x→+2x, +1→−1,
//   부호 배지가 파랑↔빨강으로 색 반전) → 병합 → x²+3x−1.
// 국면 3 "함정 판": x²+5x−2, 더 합칠 동류항 없음 → [더는 못 합쳐요] 선언이 정답
//   (likeTerms 마지막 판 문법). 이 상태가 이차식의 최종 정리임을 토스트로.
// 목표 칩 3: open · flipsign · declare. 전부 달성 시 recordQuiz(true) + enableCTA.
// 규율: 모션은 전부 CSS 트랜지션 + setTimeout 체인(타이머 Set 일괄 해제), rAF 금지.
// 칩 배치는 left/top(px)로만, transform은 등장 팝·병합 팝·플립 연출 몫(counterLab 관례).
// setPointerCapture는 try/catch. 부호 배지(.pal-sg)는 셈돌의 파랑(+)·빨강(−) 언어 계승.
// 스타일은 math2.css의 .pal-* 섹션. 참조 구현: likeTerms(그대로 계승+확장), solveLab.

import { el, clamp } from "../../core/dom";
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

type Kind = "x2" | "x" | "c";
interface PDef {
  coef: number;
  kind: Kind;
}
interface PChip extends PDef {
  x: number;
  y: number;
  el: HTMLElement;
  sg: HTMLElement; // 부호 배지
  lb: HTMLElement; // 크기(부호 뺀 항) 라벨
  busy: boolean; // 낙하 비행 중
}

const BOARD_H = 300;
const CHIP_H = 46;
// x²·x는 같은 시안(같은 문자라 색이 같아도 차수가 다르면 안 합쳐지는 함정 학습, likeTerms 계승)
const KIND_CLS: Record<Kind, string> = { x2: "", x: "", c: "const" };
const KIND_ORDER: Record<Kind, number> = { x2: 0, x: 1, c: 2 };

/** 항 하나의 mfmt 마크업. lead=식의 첫 항(양수 + 생략). */
function termSrc(t: PDef, lead: boolean): string {
  const a = Math.abs(t.coef);
  const sgn = t.coef < 0 ? "-" : lead ? "" : "+";
  if (t.kind === "c") return `${sgn}${a}`;
  return `${sgn}${a === 1 ? "" : a}${t.kind === "x2" ? "x^2" : "x"}`;
}
/** 칩 라벨(부호 배지와 분리된 크기 부분). */
function magSrc(t: PDef): string {
  const a = Math.abs(t.coef);
  if (t.kind === "c") return String(a);
  return `${a === 1 ? "" : a}${t.kind === "x2" ? "x^2" : "x"}`;
}
/** 읽어 주는 라벨용 유니코드 표기(+3x² 꼴). */
function humanTerm(t: PDef): string {
  const a = Math.abs(t.coef);
  const mag = t.kind === "c" ? String(a) : `${a === 1 ? "" : a}${t.kind === "x2" ? "x²" : "x"}`;
  return `${t.coef < 0 ? "−" : "+"}${mag}`;
}
/** 남은 칩들을 x² → x → 상수 순으로 이어 붙인 정리 결과 식. */
function composeSrc(list: PDef[]): string {
  return [...list]
    .sort((p, q) => KIND_ORDER[p.kind] - KIND_ORDER[q.kind])
    .map((t, i) => termSrc(t, i === 0))
    .join("");
}

function wrongMsg(a: Kind, b: Kind): string {
  if (a === "c" || b === "c") return "상수항은 상수항끼리만 더해요!";
  return "x²과 x는 차수가 달라서 못 합쳐요!";
}

interface BoxDef {
  src: string; // 상자에 인쇄된 괄호식(mfmt)
  chips: PDef[];
  flip?: boolean; // 빼기 괄호: 여는 순간 전원 부호 반전
}
interface StageDef {
  boxes: BoxDef[];
  op?: "+" | "-"; // 상자 사이 연산 기호
  loose?: PDef[]; // 국면 3: 상자 없이 바로 스폰
  pos: [number, number][]; // 칩 낙하 위치 [x 비율, y px] (상자 정의 순서대로)
  goal: string;
  goalSub: string;
  intro: string;
  ready?: string; // 상자를 다 열었을 때의 안내
  done: string;
  doneToast: string;
  declare?: boolean; // 함정 판: 병합이 아니라 "없다" 선언이 완료 경로
}

const STAGES: StageDef[] = [
  {
    boxes: [
      {
        src: "(2x^2+3x)",
        chips: [
          { coef: 2, kind: "x2" },
          { coef: 3, kind: "x" },
        ],
      },
      {
        src: "(x^2-5x+4)",
        chips: [
          { coef: 1, kind: "x2" },
          { coef: -5, kind: "x" },
          { coef: 4, kind: "c" },
        ],
      },
    ],
    op: "+",
    pos: [
      [0.06, 104],
      [0.66, 104],
      [0.68, 192],
      [0.08, 192],
      [0.38, 148],
    ],
    goal: "open",
    goalSub: "3x²−2x+4",
    intro: "괄호 상자를 <b>탭</b>해서 열어 보세요. 안에 있던 항 칩이 쏟아져 나와요!",
    ready: "괄호가 열리면 항들은 자유! <b>동류항끼리</b> 끌어 포개요. x²은 x²끼리, x는 x끼리!",
    done: "(2x²+3x)+(x²−5x+4) = <b>3x²−2x+4</b>. 괄호를 열고 동류항끼리 더했어요!",
    doneToast: "정리 완료, 3x²−2x+4!",
  },
  {
    boxes: [
      {
        src: "(4x^2+x)",
        chips: [
          { coef: 4, kind: "x2" },
          { coef: 1, kind: "x" },
        ],
      },
      {
        src: "(3x^2-2x+1)",
        chips: [
          { coef: 3, kind: "x2" },
          { coef: -2, kind: "x" },
          { coef: 1, kind: "c" },
        ],
        flip: true,
      },
    ],
    op: "-",
    pos: [
      [0.06, 104],
      [0.64, 104],
      [0.66, 192],
      [0.08, 192],
      [0.37, 148],
    ],
    goal: "flipsign",
    goalSub: "x²+3x−1",
    intro: "이번 두 번째 상자엔 <b>− 도장</b>이 쾅! 열면 무슨 일이 벌어질까요?",
    ready: "부호가 전부 뒤집혔어요! 이제 <b>동류항끼리</b> 끌어 정리해요.",
    done: "−(3x²−2x+1)을 열면 <b>−3x²+2x−1</b>로 전원 반전! 정리하면 <b>x²+3x−1</b>이에요.",
    doneToast: "반전까지 완벽, x²+3x−1!",
  },
  {
    boxes: [],
    loose: [
      { coef: 1, kind: "x2" },
      { coef: 5, kind: "x" },
      { coef: -2, kind: "c" },
    ],
    pos: [
      [0.08, 84],
      [0.66, 84],
      [0.37, 176],
    ],
    goal: "declare",
    goalSub: "그대로!",
    intro: "함정 판! <b>합칠 수 있는 짝</b>이 있는지 전부 시도해 보고, 없으면 아래에서 선언하세요.",
    done: "x², 5x, −2는 차수가 달라 전부 남남. <b>이대로가 최종 정리</b>, 이차식의 완성형이에요!",
    doneToast: "정답! 이 상태가 최종 정리예요",
    declare: true,
  },
];

export const polyAddLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "open", label: "괄호 열기", sub: "동류항 정리" },
    { id: "flipsign", label: "부호 반전", sub: "빼기 괄호" },
    { id: "declare", label: "함정 판", sub: "정리 끝?" },
  ]);
  const board = mboard(BOARD_H);
  const toast = mtoast(board);
  const boxrow = el("div", { class: "pal-boxrow" });
  board.appendChild(boxrow);
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
  host.append(goals.el, helper, board, read, declareRow); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
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
  let chips: PChip[] = [];
  let stageNo = 0;
  let selected: PChip | null = null;
  let done = false;
  let lock = false; // 부호 반전 웨이브 동안 조작 잠금
  const opened = new Set<number>();

  const boardW = (): number => board.clientWidth || 340;
  const setPos = (c: PChip): void => {
    c.el.style.left = `${c.x}px`;
    c.el.style.top = `${c.y}px`;
  };

  function paintChip(c: PChip): void {
    c.sg.textContent = c.coef < 0 ? "−" : "+";
    c.sg.className = `pal-sg ${c.coef < 0 ? "n" : "p"}`;
    c.lb.innerHTML = mfmt(magSrc(c));
    c.el.setAttribute("aria-label", `${humanTerm(c)} 칩`);
  }

  /** 칩 생성. from이 있으면 상자에서 쏟아지는 낙하 연출(left/top 트랜지션). */
  function addChip(d: PDef, fx: number, y: number, from: [number, number] | null): PChip {
    const c: PChip = {
      coef: d.coef,
      kind: d.kind,
      x: 0,
      y,
      busy: true,
      el: el("div", { class: `tm-chip ${KIND_CLS[d.kind]}`, attrs: { role: "button" } }),
      sg: el("span", { class: "pal-sg" }),
      lb: el("span", { class: "pal-lb" }),
    };
    c.el.style.position = "absolute";
    c.el.style.left = "0";
    c.el.style.top = "0";
    c.el.append(c.sg, c.lb);
    paintChip(c);
    board.appendChild(c.el);
    const w = c.el.offsetWidth || 60;
    const bw = boardW();
    const tx = clamp(12 + fx * (bw - w - 24), 8, bw - w - 4);
    if (from) {
      // 상자 입구에서 등장 → 정해진 자리로 낙하(top은 바운스 이징)
      c.x = from[0];
      c.y = from[1];
      setPos(c);
      c.el.style.opacity = "0";
      c.el.style.transform = "scale(.4)";
      void c.el.offsetWidth;
      c.el.style.transition =
        "left .5s var(--spring-soft), top .56s var(--spring-bounce), opacity .25s ease, transform .3s ease";
      c.x = tx;
      c.y = y;
      setPos(c);
      c.el.style.opacity = "1";
      c.el.style.transform = "";
      later(() => {
        c.el.style.transition = "";
        c.busy = false;
      }, 600);
    } else {
      c.x = tx;
      setPos(c);
      c.el.style.opacity = "0";
      c.el.style.transform = "scale(.3)";
      void c.el.offsetWidth;
      c.el.style.transition = "transform .34s var(--spring-bounce), opacity .22s ease";
      c.el.style.opacity = "1";
      c.el.style.transform = "";
      later(() => {
        c.el.style.transition = "";
        c.busy = false;
      }, 380);
    }
    chips.push(c);
    bindDrag(c);
    return c;
  }

  function clearSelect(): void {
    selected = null;
    chips.forEach((o) => {
      o.el.style.outline = "";
    });
  }

  function nearest(c: PChip): { o: PChip; d: number } | null {
    let best: PChip | null = null;
    let bd = 1e9;
    for (const o of chips) {
      if (o === c || o.busy) continue;
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

  function springBack(c: PChip, x: number, y: number): void {
    c.x = x;
    c.y = y;
    c.el.style.transition = "left .4s var(--spring-bounce), top .4s var(--spring-bounce)";
    setPos(c);
    later(() => {
      c.el.style.transition = "";
    }, 430);
  }

  /** c가 o에 흡수, 계수 합산 + 스프링 팝(합이 0이면 항이 통째로 소멸). */
  function merge(c: PChip, o: PChip): void {
    chips = chips.filter((k) => k !== c);
    c.el.style.pointerEvents = "none";
    c.el.style.transition = "left .2s ease, top .2s ease, opacity .2s ease, transform .2s ease";
    c.x = o.x;
    c.y = o.y;
    setPos(c);
    c.el.style.transform = "scale(.4)";
    c.el.style.opacity = "0";
    const deadEl = c.el;
    later(() => deadEl.remove(), 220);
    o.coef += c.coef;
    later(() => {
      if (o.coef === 0) {
        chips = chips.filter((k) => k !== o);
        o.el.style.pointerEvents = "none";
        o.el.style.transition = "opacity .25s ease, transform .25s ease";
        o.el.style.opacity = "0";
        o.el.style.transform = "scale(.3)";
        const gone = o.el;
        later(() => gone.remove(), 270);
        toast("합이 0, 항이 통째로 사라졌어요!");
      } else {
        paintChip(o);
        o.el.classList.remove("merged");
        void o.el.offsetWidth;
        o.el.classList.add("merged");
      }
    }, 90);
    haptic(HAPTIC.select);
    later(checkStage, 140);
  }

  /** 드래그를 놓았을 때, 가까운 칩과 병합 시도. 다른 종류면 스프링 복귀. */
  function dropMerge(c: PChip, homeX: number, homeY: number): void {
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

  /** 탭탭 폴백: 선택 → 같은 종류 탭이면 병합, 다르면 교정 토스트. */
  function tapSelect(c: PChip): void {
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
        o.el.style.outline = o === c ? "3px solid rgba(156,54,181,.5)" : "";
      });
    }
  }

  function bindDrag(c: PChip): void {
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    let moved = false;
    let dragging = false;
    const down = (e: PointerEvent): void => {
      if (lock || done || c.busy) return;
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
      const w = c.el.offsetWidth || 60;
      c.x = clamp(ox + dx, 8, boardW() - w - 4);
      c.y = clamp(oy + dy, 10, BOARD_H - CHIP_H - 4);
      setPos(c);
    };
    const up = (): void => {
      if (!dragging) return;
      dragging = false;
      c.el.classList.remove("drag");
      if (lock || done) {
        clearSelect();
        return;
      }
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

  /* ================= 괄호 상자 ================= */

  function mkBox(b: BoxDef, j: number): HTMLElement {
    const box = el(
      "div",
      {
        class: `pal-box ${b.flip ? "minus" : ""}`,
        attrs: {
          role: "button",
          tabindex: "0",
          "aria-label": `괄호 상자 ${b.src.replace("^2", "²")} 열기`,
        },
      },
      el("span", { html: mfmt(b.src) }),
    );
    const tap = el("span", { class: "pal-tap", text: "탭!" });
    box.appendChild(tap);
    if (b.flip) box.appendChild(el("span", { class: "pal-stamp", text: "−", attrs: { "aria-hidden": "true" } }));
    const open = (): void => openBox(b, j, box, tap);
    box.addEventListener("click", open);
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
    return box;
  }

  function openBox(b: BoxDef, j: number, box: HTMLElement, tap: HTMLElement): void {
    if (opened.has(j) || done) return;
    opened.add(j);
    haptic(HAPTIC.select);
    box.classList.add("open");
    box.setAttribute("aria-disabled", "true");
    tap.remove();
    const st = STAGES[stageNo];
    const br = board.getBoundingClientRect();
    const r = box.getBoundingClientRect();
    const fromX = r.left - br.left + r.width / 2 - 28;
    const fromY = r.top - br.top + r.height / 2 - CHIP_H / 2;
    const base = st.boxes.slice(0, j).reduce((m, bb) => m + bb.chips.length, 0);
    const born: PChip[] = [];
    if (b.flip) lock = true; // 반전 전에 병합해 버리는 새치기 방지
    b.chips.forEach((d, k) => {
      later(() => {
        born.push(addChip(d, st.pos[base + k][0], st.pos[base + k][1], [fromX, fromY]));
      }, 140 * k);
    });
    const landAll = 140 * (b.chips.length - 1) + 640;
    if (b.flip) {
      later(() => flipWave(born), landAll + 320);
    } else {
      later(() => {
        if (opened.size === st.boxes.length && !lock && !done) helper.innerHTML = st.ready ?? "";
      }, landAll);
    }
  }

  /** 빼기 괄호의 부호 반전 웨이브: 카드 플립(스태거 120ms) + 배지 색 반전. */
  function flipWave(list: PChip[]): void {
    list.forEach((c, i) => {
      later(() => {
        haptic(HAPTIC.tap);
        c.el.style.transition = "transform .16s ease-in";
        c.el.style.transform = "perspective(430px) rotateY(90deg)";
        later(() => {
          c.coef = -c.coef;
          paintChip(c);
          c.el.style.transition = "transform .26s var(--spring-soft)";
          c.el.style.transform = "";
          later(() => {
            c.el.style.transition = "";
          }, 280);
        }, 170);
      }, 120 * i);
    });
    later(() => {
      lock = false;
      toast("− 하나가 전원 부호 반전!");
      haptic(HAPTIC.correct);
      const st = STAGES[stageNo];
      helper.innerHTML = opened.size === st.boxes.length ? (st.ready ?? "") : "나머지 상자도 탭해서 열어요!";
    }, 120 * (list.length - 1) + 520);
  }

  /* ================= 판 진행 ================= */

  /** 같은 종류 쌍이 더 없으면 스테이지 완료(함정 판 제외, 그쪽은 선언 버튼). */
  function checkStage(): void {
    const st = STAGES[stageNo];
    if (st.declare || done) return;
    if (opened.size < st.boxes.length || lock) return;
    if (chips.some((c) => c.busy)) return;
    const dup = chips.some((a) => chips.some((b) => a !== b && a.kind === b.kind));
    if (dup) return;
    read.innerHTML = mfmt(composeSrc(chips));
    helper.innerHTML = st.done;
    haptic(HAPTIC.correct);
    goals.on(st.goal, st.goalSub);
    toast(st.doneToast);
    if (stageNo + 1 < STAGES.length) later(() => spawnStage(stageNo + 1), 2400);
  }

  function spawnStage(i: number): void {
    stageNo = i;
    lock = false;
    clearSelect();
    opened.clear();
    chips.forEach((c) => {
      c.el.style.pointerEvents = "none";
      c.el.style.transition = "opacity .22s ease, transform .22s ease";
      c.el.style.opacity = "0";
      c.el.style.transform = "scale(.5)";
      const deadEl = c.el;
      later(() => deadEl.remove(), 240);
    });
    chips = [];
    read.innerHTML = "";
    boxrow.innerHTML = "";
    const st = STAGES[i];
    helper.innerHTML = st.intro;
    if (st.boxes.length) {
      st.boxes.forEach((b, j) => {
        if (j > 0)
          boxrow.appendChild(
            el("span", {
              class: `pal-op ${st.op === "-" ? "minus" : ""}`,
              text: st.op === "-" ? "−" : "+",
              attrs: { "aria-hidden": "true" },
            }),
          );
        boxrow.appendChild(mkBox(b, j));
      });
    } else if (st.loose) {
      st.loose.forEach((d, k) => later(() => addChip(d, st.pos[k][0], st.pos[k][1], null), 260 + k * 90));
      if (st.declare) {
        later(
          () => {
            declareRow.style.display = "";
            void declareRow.offsetWidth;
            declareRow.style.opacity = "1";
            later(() => declareBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
          },
          260 + st.loose.length * 90 + 260,
        );
      }
    }
  }

  declareBtn.addEventListener("click", () => {
    const st = STAGES[stageNo];
    if (done || !st.declare) return;
    done = true;
    read.innerHTML = mfmt(composeSrc(chips));
    helper.innerHTML = st.done;
    toast(st.doneToast);
    goals.on(st.goal, st.goalSub);
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
  api.setCTA(s.cta ?? "정리소 임무를 완수하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
