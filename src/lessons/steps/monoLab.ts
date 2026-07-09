// monoLab, 단항식 헤쳐 모여 랩(중2 수학 Ⅰ L7, 책 35~37쪽). 곱셈은 수 칩·문자 칩을
// 존으로 분류해 "계수는 계수끼리, 문자는 문자끼리"를 몸으로 익히고, 나눗셈은 역수
// 뒤집기 카드 플립(perspective 회전)으로 곱셈으로 바꿔 분수 무대에서 약분한다.
// 국면 1 "헤쳐 모여": 3a×2b, [3][a][2][b] 칩을 수의 존·문자의 존으로 드래그(탭탭 폴백)
//   분류 → 수 존 3×2=6 합체, 문자 존 a×b=ab 정렬 → 결과 카드 6ab + 교환·결합법칙 라벨.
//   잘못된 존은 스프링 복귀 + 교정 토스트("3은 수예요, 수의 존으로!").
// 국면 2 "같은 문자 곱": 5a²×3a, 문자 존에서 a²·a가 지수 덧셈으로 a³ 합체(지수법칙
//   재사용을 토스트로 언급), 수 존 5×3=15 → 15a³.
// 국면 3 "역수 뒤집기": 6a²b÷2a, ÷2a 카드의 [뒤집기] 레버 → 카드가 가로 플립해 ×1/(2a)
//   → 분수 무대(위 6a²b, 아래 2a)에서 위아래 짝 탭 상쇄(6/2→3, a²/a→a) → 3ab.
// 목표 칩 3: sort · pow · flip. 전부 달성 시 recordQuiz(true) + enableCTA.
// 규율: 모션은 전부 CSS 트랜지션 + setTimeout 체인(타이머 Set 일괄 해제), rAF 금지.
// 칩 배치는 left/top(px)로만, transform은 등장 팝·병합 팝·플립 연출 몫(counterLab 관례).
// setPointerCapture는 try/catch. 스타일은 math2.css의 .mnl-* 섹션.
// 참조 구현: likeTerms(칩 드래그·병합), solveLab(left/top 이동), powDivLab(탭 상쇄).

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

type Zone = "num" | "var";

interface MChipDef {
  src: string; // mfmt 소스("3", "a^2" ...)
  zone: Zone; // 올바른 존
  aria: string;
  wrong: string; // 잘못된 존에 넣었을 때의 교정 토스트
}
interface MChip extends MChipDef {
  x: number;
  y: number;
  el: HTMLElement;
  state: "free" | "flying" | "locked";
}

interface MulPhase {
  expr: string; // 상단 미션 수식(mfmt)
  chips: MChipDef[];
  pos: [number, number][]; // [x 비율, y px]
  numRes: string; // 수 존 합체 라벨
  varRes: string; // 문자 존 합체 라벨
  numToast: string;
  varToast: string;
  result: string; // 결과 카드(mfmt)
  read: string; // 정리식 한 줄(mfmt)
  goal: string;
  goalSub: string;
  intro: string;
  done: string;
  laws?: boolean; // 국면 1에서만 교환·결합법칙 라벨 표시
}

const BOARD_H = 310;
const CHIP_H = 46;

const PHASES: MulPhase[] = [
  {
    expr: "3a×2b",
    chips: [
      { src: "3", zone: "num", aria: "3 칩", wrong: "3은 수예요, 수의 존으로!" },
      { src: "a", zone: "var", aria: "a 칩", wrong: "a는 문자예요, 문자의 존으로!" },
      { src: "2", zone: "num", aria: "2 칩", wrong: "2는 수예요, 수의 존으로!" },
      { src: "b", zone: "var", aria: "b 칩", wrong: "b는 문자예요, 문자의 존으로!" },
    ],
    pos: [
      [0.07, 64],
      [0.6, 58],
      [0.32, 122],
      [0.78, 118],
    ],
    numRes: "6",
    varRes: "ab",
    numToast: "3×2=6, 수는 수끼리!",
    varToast: "a×b=ab, 문자는 문자끼리!",
    result: "6ab",
    read: "3a×2b = 6ab",
    goal: "sort",
    goalSub: "6ab!",
    intro: "곱셈은 <b>순서를 바꿔도</b> 값이 같아요. 칩을 끌어 수는 <b>수의 존</b>, 문자는 <b>문자의 존</b>으로!",
    done: "3a×2b = (3×2)×(a×b) = <b>6ab</b>. 계수는 계수끼리, 문자는 문자끼리 모으면 끝!",
    laws: true,
  },
  {
    expr: "5a^2×3a",
    chips: [
      { src: "5", zone: "num", aria: "5 칩", wrong: "5는 수예요, 수의 존으로!" },
      { src: "a^2", zone: "var", aria: "a제곱 칩", wrong: "a²은 문자예요, 문자의 존으로!" },
      { src: "3", zone: "num", aria: "3 칩", wrong: "3은 수예요, 수의 존으로!" },
      { src: "a", zone: "var", aria: "a 칩", wrong: "a는 문자예요, 문자의 존으로!" },
    ],
    pos: [
      [0.07, 60],
      [0.62, 58],
      [0.3, 122],
      [0.8, 120],
    ],
    numRes: "15",
    varRes: "a^3",
    numToast: "5×3=15, 수는 수끼리!",
    varToast: "지수법칙 재등장! a²×a는 지수끼리 2+1=3",
    result: "15a^3",
    read: "5a^2×3a = 15a^3",
    goal: "pow",
    goalSub: "15a³!",
    intro: "이번엔 <b>같은 문자끼리의 곱</b>이에요. 문자 존에 모이면 무슨 일이 생길까요?",
    done: "문자 존에서 a²×a = a³, 지수법칙이 그대로 통했어요. 5a²×3a = <b>15a³</b>!",
  },
];

/** 국면 3 분수 무대의 약분 칩. */
interface FChip {
  k: "n" | "a" | "b"; // 수 | 문자 a | 문자 b
  row: "top" | "bot";
  el: HTMLElement;
  dead: boolean; // 빗금 맞고 상쇄됨(분모)
  used: boolean; // 약분을 마친 분자(더 못 씀)
}

export const monoLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "sort", label: "헤쳐 모여", sub: "3a×2b" },
    { id: "pow", label: "지수 합체", sub: "5a²×3a" },
    { id: "flip", label: "역수 뒤집기", sub: "6a²b÷2a" },
  ]);
  const board = mboard(BOARD_H);
  const toast = mtoast(board);
  const expr = el("div", { class: "mnl-expr" });
  const mkZone = (z: Zone, label: string): HTMLElement =>
    el(
      "div",
      {
        class: `mnl-zone ${z === "num" ? "znum" : "zvar"}`,
        attrs: { role: "button", tabindex: "0", "aria-label": `${label}에 담기` },
      },
      el("div", { class: "mnl-zlabel", text: label }),
    );
  const zoneEls: Record<Zone, HTMLElement> = { num: mkZone("num", "수의 존"), var: mkZone("var", "문자의 존") };
  const zonesRow = el("div", { class: "mnl-zones" }, zoneEls.num, zoneEls.var);
  const lawsRow = el(
    "div",
    { class: "mnl-laws", attrs: { "aria-hidden": "true" } },
    el("span", { class: "mnl-law", text: "자리 바꾸기: 교환법칙" }),
    el("span", { class: "mnl-law", text: "묶어 곱하기: 결합법칙" }),
  );
  const resultCard = el("div", { class: "mnl-result" });
  board.append(expr, zonesRow, lawsRow, resultCard);
  const read = el("div", { class: "pw-read" });
  const actions = el("div", { class: "ct-actions", style: "display:none" });
  const helper = el("div", { class: "helper" });
  host.append(goals.el, board, read, actions, helper);
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
  let phaseNo = 0;
  let phaseDone = false;
  let chips: MChip[] = [];
  let selected: MChip | null = null;
  let zoneAssigned: Record<Zone, MChip[]> = { num: [], var: [] };
  const mergedZones = new Set<Zone>();
  // 국면 3 상태
  let flipped = false;
  let flipDone = false;
  let divrow: HTMLElement | null = null;
  let fracwrap: HTMLElement | null = null;
  let fTop: FChip[] = [];
  let fBot: FChip[] = [];
  let fSel: FChip | null = null;

  const boardW = (): number => board.clientWidth || 340;
  const setPos = (c: MChip): void => {
    c.el.style.left = `${c.x}px`;
    c.el.style.top = `${c.y}px`;
  };

  /* ================= 국면 1·2: 존 분류 ================= */

  function addChip(d: MChipDef, fx: number, y: number): void {
    const c: MChip = {
      ...d,
      x: 0,
      y,
      state: "free",
      el: el("div", {
        class: `tm-chip ${d.zone === "num" ? "const" : ""}`,
        attrs: { role: "button", "aria-label": d.aria },
      }),
    };
    c.el.style.position = "absolute";
    c.el.style.left = "0";
    c.el.style.top = "0";
    c.el.innerHTML = mfmt(d.src);
    board.appendChild(c.el);
    const w = c.el.offsetWidth || 56;
    const bw = boardW();
    c.x = clamp(12 + fx * (bw - w - 24), 4, bw - w - 4);
    setPos(c);
    // 등장 팝(배치는 left/top 고정, transform은 팝 몫)
    c.el.style.opacity = "0";
    c.el.style.transform = "scale(.3)";
    void c.el.offsetWidth;
    c.el.style.transition = "transform .34s var(--spring-bounce), opacity .22s ease, box-shadow .2s";
    c.el.style.opacity = "1";
    c.el.style.transform = "";
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
    zoneEls.num.classList.remove("cue");
    zoneEls.var.classList.remove("cue");
  }

  function tapSelect(c: MChip): void {
    if (selected === c) {
      clearSelect();
      return;
    }
    clearSelect();
    selected = c;
    haptic(HAPTIC.tap);
    c.el.style.outline = "3px solid rgba(156,54,181,.5)";
    zoneEls.num.classList.add("cue");
    zoneEls.var.classList.add("cue");
  }

  /** 칩 중심이 어느 존 위에 있는지(클라이언트 rect 판정). */
  function zoneUnder(c: MChip): Zone | null {
    if (zonesRow.style.display === "none") return null;
    const br = board.getBoundingClientRect();
    const cx = br.left + c.x + (c.el.offsetWidth || 56) / 2;
    const cy = br.top + c.y + CHIP_H / 2;
    for (const z of ["num", "var"] as Zone[]) {
      const r = zoneEls[z].getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) return z;
    }
    return null;
  }

  function hoverZone(z: Zone | null): void {
    zoneEls.num.classList.toggle("hot", z === "num");
    zoneEls.var.classList.toggle("hot", z === "var");
  }

  function springBack(c: MChip, x: number, y: number): void {
    c.x = x;
    c.y = y;
    c.el.style.transition = "left .4s var(--spring-bounce), top .4s var(--spring-bounce)";
    setPos(c);
    later(() => {
      c.el.style.transition = "";
    }, 430);
  }

  function bindDrag(c: MChip): void {
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    let moved = false;
    let dragging = false;
    const down = (e: PointerEvent): void => {
      if (c.state !== "free" || phaseDone) return;
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
      const w = c.el.offsetWidth || 56;
      c.x = clamp(ox + dx, 4, boardW() - w - 4);
      c.y = clamp(oy + dy, 4, BOARD_H - CHIP_H - 4);
      setPos(c);
      hoverZone(moved ? zoneUnder(c) : null);
    };
    const up = (): void => {
      if (!dragging) return;
      dragging = false;
      c.el.classList.remove("drag");
      hoverZone(null);
      if (moved) {
        clearSelect();
        dropChip(c, ox, oy);
      } else {
        tapSelect(c);
      }
    };
    c.el.addEventListener("pointerdown", down);
    c.el.addEventListener("pointermove", move);
    c.el.addEventListener("pointerup", up);
    c.el.addEventListener("pointercancel", up);
  }

  /** 드래그를 놓았을 때: 존 위면 판정, 빈 곳이면 그 자리 유지. */
  function dropChip(c: MChip, homeX: number, homeY: number): void {
    const z = zoneUnder(c);
    if (!z) return;
    if (z !== c.zone) {
      haptic(HAPTIC.wrong);
      toast(c.wrong);
      springBack(c, homeX, homeY);
      return;
    }
    accept(c, z);
  }

  // 탭탭 폴백: 칩 선택 → 존 탭
  (["num", "var"] as Zone[]).forEach((z) => {
    const onPick = (): void => {
      if (!selected || phaseDone) return;
      const c = selected;
      clearSelect();
      if (c.zone === z) accept(c, z);
      else {
        haptic(HAPTIC.wrong);
        toast(c.wrong);
      }
    };
    zoneEls[z].addEventListener("click", onPick);
    zoneEls[z].addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPick();
      }
    });
  });

  /** 올바른 존에 안착: 슬롯으로 비행 후 잠금, 존이 차면 합체. */
  function accept(c: MChip, z: Zone): void {
    c.state = "flying";
    c.el.style.pointerEvents = "none";
    haptic(HAPTIC.select);
    const idx = zoneAssigned[z].length;
    zoneAssigned[z].push(c);
    const br = board.getBoundingClientRect();
    const zr = zoneEls[z].getBoundingClientRect();
    const w = c.el.offsetWidth || 56;
    c.x = zr.left - br.left + zr.width / 2 + (idx === 0 ? -(w + 5) : 5);
    c.y = zr.top - br.top + 46;
    c.el.style.transition = "left .45s var(--spring-soft), top .45s var(--spring-soft)";
    setPos(c);
    later(() => {
      c.el.style.transition = "";
      c.state = "locked";
      if (zoneAssigned[z].length === 2 && zoneAssigned[z].every((o) => o.state === "locked") && !mergedZones.has(z))
        later(() => mergeZone(z), 260);
    }, 470);
  }

  /** 존 안 두 칩 합체: 뒤 칩이 앞 칩에 흡수, 앞 칩이 결과 라벨로 팝. */
  function mergeZone(z: Zone): void {
    if (mergedZones.has(z)) return;
    mergedZones.add(z);
    const ph = PHASES[phaseNo];
    const [a, b] = zoneAssigned[z];
    b.el.style.transition = "left .26s ease, top .26s ease, opacity .26s ease";
    b.x = a.x;
    b.y = a.y;
    setPos(b);
    b.el.style.opacity = "0";
    const deadEl = b.el;
    later(() => deadEl.remove(), 300);
    chips = chips.filter((k) => k !== b);
    later(() => {
      const src = z === "num" ? ph.numRes : ph.varRes;
      a.el.innerHTML = mfmt(src);
      a.el.setAttribute("aria-label", `${z === "num" ? "수" : "문자"} 존 결과 ${src.replace("^2", "²").replace("^3", "³")} 칩`);
      const br = board.getBoundingClientRect();
      const zr = zoneEls[z].getBoundingClientRect();
      a.x = zr.left - br.left + zr.width / 2 - (a.el.offsetWidth || 56) / 2;
      a.el.style.transition = "left .24s var(--ease-out)";
      setPos(a);
      later(() => {
        a.el.style.transition = "";
      }, 260);
      a.el.classList.remove("merged");
      void a.el.offsetWidth;
      a.el.classList.add("merged");
      haptic(HAPTIC.select);
      toast(z === "num" ? ph.numToast : ph.varToast);
      if (mergedZones.size === 2) later(completePhase, 750);
    }, 180);
  }

  function completePhase(): void {
    if (phaseDone) return;
    phaseDone = true;
    const ph = PHASES[phaseNo];
    resultCard.innerHTML = mfmt(ph.result);
    resultCard.classList.add("show");
    read.innerHTML = mfmt(ph.read);
    helper.innerHTML = ph.done;
    if (ph.laws) lawsRow.classList.add("show");
    haptic(HAPTIC.correct);
    goals.on(ph.goal, ph.goalSub);
    if (phaseNo + 1 < PHASES.length) later(() => spawnPhase(phaseNo + 1), 2500);
    else later(setupFlip, 2500);
  }

  function spawnPhase(i: number): void {
    phaseNo = i;
    phaseDone = false;
    mergedZones.clear();
    zoneAssigned = { num: [], var: [] };
    clearSelect();
    chips.forEach((c) => {
      c.el.style.pointerEvents = "none";
      c.el.style.transition = "opacity .22s ease, transform .22s ease";
      c.el.style.opacity = "0";
      c.el.style.transform = "scale(.5)";
      const deadEl = c.el;
      later(() => deadEl.remove(), 240);
    });
    chips = [];
    resultCard.classList.remove("show");
    lawsRow.classList.remove("show");
    read.innerHTML = "";
    const ph = PHASES[i];
    expr.innerHTML = mfmt(ph.expr);
    helper.innerHTML = ph.intro;
    ph.chips.forEach((d, k) => later(() => addChip(d, ph.pos[k][0], ph.pos[k][1]), 260 + k * 90));
  }

  /* ================= 국면 3: 역수 뒤집기 + 분수 약분 ================= */

  function setupFlip(): void {
    expr.innerHTML = mfmt("6a^2b÷2a");
    read.innerHTML = "";
    resultCard.classList.remove("show");
    lawsRow.classList.remove("show");
    clearSelect();
    chips.forEach((c) => {
      c.el.style.pointerEvents = "none";
      c.el.style.transition = "opacity .22s ease, transform .22s ease";
      c.el.style.opacity = "0";
      c.el.style.transform = "scale(.5)";
      const deadEl = c.el;
      later(() => deadEl.remove(), 240);
    });
    chips = [];
    zonesRow.style.opacity = "0";
    later(() => {
      zonesRow.style.display = "none";
    }, 320);
    helper.innerHTML = "나눗셈은 존 분류가 안 통해요. 카드 아래 <b>뒤집기</b> 레버로 나눗셈의 정체를 바꿔 봐요!";

    const flipin = el(
      "div",
      { class: "mnl-flipin" },
      el("div", { class: "mnl-face front", html: mfmt("÷2a") }),
      el("div", { class: "mnl-face back", html: mfmt("×{1/2a}") }),
    );
    divrow = el(
      "div",
      { class: "mnl-divrow" },
      el("div", { class: "mnl-card", html: mfmt("6a^2b") }),
      el("div", { class: "mnl-flip" }, flipin),
    );
    board.appendChild(divrow);

    const lever = el("button", {
      class: "ct-btn hero",
      text: "뒤집기",
      attrs: { type: "button", "aria-label": "나눗셈 카드를 역수의 곱셈으로 뒤집기" },
    });
    actions.style.display = "";
    actions.appendChild(lever);
    lever.addEventListener("click", () => {
      if (flipped) return;
      flipped = true;
      haptic(HAPTIC.select);
      flipin.classList.add("go");
      lever.disabled = true;
      lever.style.transition = "opacity .3s ease";
      lever.style.opacity = "0";
      later(() => {
        lever.remove();
        actions.style.display = "none";
      }, 420);
      later(() => toast("나눗셈은 역수의 곱셈!"), 700);
      later(buildFraction, 1150);
    });
  }

  function buildFraction(): void {
    helper.innerHTML = "위(분자)와 아래(분모)에서 <b>약분할 짝</b>을 하나씩 골라 탭해요!";
    const mk = (src: string, k: FChip["k"], row: FChip["row"], aria: string): FChip => {
      const f: FChip = {
        k,
        row,
        dead: false,
        used: false,
        el: el("div", {
          class: `tm-chip ${k === "n" ? "const" : ""}`,
          attrs: { role: "button", "aria-label": aria },
        }),
      };
      f.el.innerHTML = mfmt(src);
      f.el.addEventListener("click", () => pickF(f));
      return f;
    };
    fTop = [mk("6", "n", "top", "분자 6 칩"), mk("a^2", "a", "top", "분자 a제곱 칩"), mk("b", "b", "top", "분자 b 칩")];
    fBot = [mk("2", "n", "bot", "분모 2 칩"), mk("a", "a", "bot", "분모 a 칩")];
    fracwrap = el(
      "div",
      { class: "mnl-fracwrap" },
      el("div", { class: "mnl-frow" }, ...fTop.map((f) => f.el)),
      el("div", { class: "mnl-fbar", attrs: { "aria-hidden": "true" } }),
      el("div", { class: "mnl-frow" }, ...fBot.map((f) => f.el)),
    );
    board.appendChild(fracwrap);
    void fracwrap.offsetWidth;
    fracwrap.classList.add("show");
  }

  function pickF(f: FChip): void {
    if (f.dead || f.used || flipDone) return;
    if (fSel === f) {
      fSel = null;
      f.el.style.outline = "";
      return;
    }
    if (!fSel) {
      fSel = f;
      haptic(HAPTIC.tap);
      f.el.style.outline = "3px solid rgba(156,54,181,.5)";
      return;
    }
    const g = fSel;
    fSel = null;
    g.el.style.outline = "";
    if (g.row === f.row) {
      haptic(HAPTIC.wrong);
      toast("위(분자)와 아래(분모)에서 하나씩 짝지어요!");
      return;
    }
    const t = g.row === "top" ? g : f; // 분자
    const u = g.row === "top" ? f : g; // 분모
    if (t.k === "n" && u.k === "n") cancelPair(t, u, "3", "분자 3 칩", "6÷2=3, 수는 수끼리 약분!");
    else if (t.k === "a" && u.k === "a") cancelPair(t, u, "a", "분자 a 칩", "a²÷a는 지수끼리 2−1, a!");
    else if (t.k !== "n" && u.k !== "n") {
      haptic(HAPTIC.wrong);
      toast("문자가 달라요, b는 아래에 짝이 없어 그대로 남아요!");
    } else {
      haptic(HAPTIC.wrong);
      toast("수는 수끼리, 문자는 문자끼리 약분해요!");
    }
  }

  /** 분모 칩에 빗금 + 분자 칩 몫 라벨로 팝. */
  function cancelPair(t: FChip, u: FChip, next: string, aria: string, msg: string): void {
    u.dead = true;
    t.used = true;
    u.el.classList.add("mnl-x");
    haptic(HAPTIC.select);
    toast(msg);
    later(() => {
      t.el.innerHTML = mfmt(next);
      t.el.setAttribute("aria-label", aria);
      t.el.classList.remove("merged");
      void t.el.offsetWidth;
      t.el.classList.add("merged");
    }, 240);
    later(() => {
      if (fBot.every((o) => o.dead)) finishFlip();
    }, 900);
  }

  function finishFlip(): void {
    if (flipDone) return;
    flipDone = true;
    if (fracwrap) fracwrap.style.opacity = "0";
    if (divrow) divrow.style.opacity = "0";
    later(() => {
      if (fracwrap) fracwrap.style.display = "none";
      if (divrow) divrow.style.display = "none";
    }, 380);
    resultCard.innerHTML = mfmt("3ab");
    resultCard.classList.add("show");
    read.innerHTML = mfmt("6a^2b÷2a = 3ab");
    helper.innerHTML = "6a²b÷2a = 6a²b×1/(2a) = <b>3ab</b>. 뒤집으면 나눗셈도 곱셈처럼 헤쳐 모여!";
    haptic(HAPTIC.done);
    goals.on("flip", "3ab!");
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  spawnPhase(0);
  api.setCTA(s.cta ?? "존 분류 작전을 완수하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
