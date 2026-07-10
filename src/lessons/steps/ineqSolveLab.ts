// ineqSolveLab, 일차부등식 풀이 랩(중2 수학 Ⅱ L3, 책 61~63쪽). 이항 드래그(solveLab 문법)로
// 부등식을 정리하고, 음수로 나누는 마지막 순간 부등호가 홱 뒤집히는 것을 체험한다.
// 해는 수직선에 ○(미포함)·●(포함)로 새긴다.
// 국면 1(move): 3x-1>5, 첫 이항 시도 순간 mq6-q 함정 예측("부등호도 뒤집힐까?" 답:
//               이항은 더하기·빼기라 방향 유지). [-1] 이항(드래그, 탭탭 폴백) → 3x>6 →
//               [양변 ÷ 3] → x>2 → 수직선에 ○(미포함)와 오른쪽 화살.
// 국면 2(flip): 2(x-3)>5x+3, [괄호 풀기] → 2x-6>5x+3 → 이항 2회 → -3x>9 →
//               반전 예측(그대로/뒤집힘) → [양변 ÷ (−3)] 순간 부등호 글리프가
//               scaleX(-1)로 홱 플립 + 앰버 경고 플래시 → x<-3 → 수직선 ○ 왼쪽 화살.
// 국면 3(dot): -7x+5≥-2 → -7x≥-7 → [양변 ÷ (−7)] → ≥가 ≤로 → x≤1 →
//              "경계 1 자신은 해?" 판단 → ●(포함) 발견, ○·● 구분.
// 목표 칩 3: move(이항 유지)·flip(음수 나눗셈 반전)·dot(○● 구분). 전부 켜지면
// recordQuiz(true)+enableCTA. rAF 금지(CSS 트랜지션+setTimeout, 타이머 Set 일괄 해제),
// setPointerCapture try/catch, 칩 배치는 left/top(transform은 팝 키프레임 몫).
// 참조: solveLab.ts(이항 원전), flipLab(반전 연출 톤), divLab(mq6 패널 최신 예).
// 스타일: math2.css의 .isl-* 섹션(스니펫은 최종 보고로 전달, 메인이 붙인다).
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

type Rel = ">" | "<" | "≥" | "≤";
const FLIP: Record<Rel, Rel> = { ">": "<", "<": ">", "≥": "≤", "≤": "≥" };

interface Term {
  x: boolean; // x항 여부
  v: number; // 계수 또는 상수값
  side: "L" | "R";
  elm: HTMLElement;
  px: number;
  py: number;
  alive: boolean;
}

type GoalId = "move" | "flip" | "dot";

interface Mission {
  goal: GoalId;
  rel: Rel;
  l: [number, number]; // [x계수, 상수] 0이면 없음
  r: [number, number];
  paren?: boolean; // 좌변이 2(x-3) 괄호 칩으로 시작(국면 2)
}

const BOARD_H = 300;
const CHIP_H = 46;
const CHIP_CY = 92; // 칩 존 세로 중심(보드 아래쪽은 수직선 스트립 자리)

const MISSIONS: Mission[] = [
  { goal: "move", rel: ">", l: [3, -1], r: [0, 5] },
  { goal: "flip", rel: ">", l: [0, 0], r: [5, 3], paren: true },
  { goal: "dot", rel: "≥", l: [-7, 5], r: [0, -2] },
];

/** 항 표기: x항 "5x"/"-x", 상수 "+7"/"-4"(맨 앞이면 양의 부호 생략). */
function termSrc(x: boolean, v: number, lead: boolean): string {
  const sign = v < 0 ? "-" : lead ? "" : "+";
  const a = Math.abs(v);
  if (x) return `${sign}${a === 1 ? "" : a}x`;
  return `${sign}${a}`;
}

/** 토스트·라벨용 음수 표기(U+2212). */
const mono = (v: number): string => String(v).replace("-", "−");

export const ineqSolveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "move", label: "이항", sub: "방향 유지?" },
    { id: "flip", label: "반전", sub: "음수 나눗셈" },
    { id: "dot", label: "경계 표시", sub: "○? ●?" },
  ]);
  const eqRead = el("div", { class: "nw-expr" });
  const board = mboard(BOARD_H);
  const divider = el("div", { class: "isl-divider", attrs: { "aria-hidden": "true" } });
  const sg = el("span", { class: "isl-sg", text: ">" });
  const sign = el("div", { class: "isl-sign", attrs: { "aria-hidden": "true" } }, sg);
  const flash = el("div", { class: "isl-flash", attrs: { "aria-hidden": "true" } });
  const lineWrap = el("div", { class: "isl-linewrap", attrs: { "aria-hidden": "true" } });
  board.append(divider, sign, lineWrap, flash);
  const toast = mtoast(board);
  const actions = el("div", { class: "ct-actions" });
  const qline = el("div", { class: "mq6-q isl-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  const helper = el("div", { class: "helper" });
  host.append(goals.el, helper, eqRead, board, actions, panel); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
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
  let terms: Term[] = [];
  let mi = 0;
  let rel: Rel = ">";
  let solving = false; // 정리·연출 중 입력 잠금
  let solved = false; // 현재 미션 완료
  let finished = false;
  let predicting = false; // 판단 질문 중 조작 잠금
  let mustExpand = false; // 국면 2: 괄호 풀기 전 칩 잠금
  let movePredicted = false; // 국면 1 이항 함정, 전체에서 한 번만
  let flipPredicted = false; // 국면 2 반전 예측(미션마다 리셋)
  let parenElm: HTMLElement | null = null;
  let drag: { t: Term; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null = null;
  let pendingTap: Term | null = null;

  const bw = (): number => board.clientWidth || 340;

  function maybeFinish(): void {
    if (finished || goals.count() < 3) return;
    finished = true;
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  const put = (t: Term, x: number, y: number, trans = ""): void => {
    t.px = x;
    t.py = y;
    t.elm.style.transition = trans ? `left ${trans}, top ${trans}` : "";
    t.elm.style.left = `${x}px`;
    t.elm.style.top = `${y}px`;
    if (trans)
      later(() => {
        t.elm.style.transition = "";
      }, 480);
  };

  /** 한 변의 칩들을 정렬 배치(칩 존은 위쪽, 보드 아래는 수직선 자리). */
  function layoutSide(side: "L" | "R"): void {
    const list = terms.filter((t) => t.alive && t.side === side);
    const cx = side === "L" ? bw() * 0.25 : bw() * 0.75;
    list.forEach((t, i) => {
      const y = CHIP_CY - (list.length * (CHIP_H + 12) - 12) / 2 + i * (CHIP_H + 12);
      put(t, cx - t.elm.offsetWidth / 2, y, ".4s var(--spring-soft)");
    });
  }

  function paintChip(t: Term): void {
    t.elm.innerHTML = mfmt(termSrc(t.x, t.v, t.v >= 0));
    t.elm.classList.toggle("const", !t.x);
  }

  function mkTerm(x: boolean, v: number, side: "L" | "R"): Term {
    const t: Term = {
      x,
      v,
      side,
      px: 0,
      py: 0,
      alive: true,
      elm: el("div", { class: "tm-chip", style: "position:absolute; left:0; top:0;", attrs: { role: "button" } }),
    };
    paintChip(t);
    board.appendChild(t.elm);
    terms.push(t);
    bindDrag(t);
    return t;
  }

  function eqSrc(): string {
    const sideSrc = (sd: "L" | "R"): string => {
      if (sd === "L" && mustExpand) return "2(x-3)";
      const list = terms.filter((t) => t.alive && t.side === sd);
      if (!list.length) return "0";
      list.sort((a, b) => Number(b.x) - Number(a.x));
      return list.map((t, i) => termSrc(t.x, t.v, i === 0)).join("");
    };
    return `${sideSrc("L")} ${rel} ${sideSrc("R")}`;
  }

  function paintEq(): void {
    eqRead.innerHTML = mfmt(eqSrc());
  }

  /** 판단 질문(mq6-q 문법): 강조 줄 + 자기설명형 선택지, 오답엔 오개념 교정 토스트. */
  function ask(qhtml: string, items: { t: string; good?: boolean; fb: string }[], onDone: () => void): void {
    predicting = true;
    qline.innerHTML = qhtml;
    const row = el("div", { class: "mq6-choices" });
    let done = false;
    const btns: { b: HTMLButtonElement; good: boolean }[] = [];
    for (const it of items) {
      const b = el("button", { class: "mq6-choice wide", text: it.t, attrs: { type: "button" } });
      b.addEventListener("click", () => {
        if (done) return;
        done = true;
        haptic(it.good ? HAPTIC.correct : HAPTIC.wrong);
        for (const x of btns) {
          x.b.disabled = true;
          if (x.good) x.b.classList.add("ok");
        }
        if (!it.good) b.classList.add("no");
        toast(it.fb);
        later(() => {
          qline.innerHTML = "";
          clear(ctl);
          predicting = false;
          onDone();
        }, 1500);
      });
      btns.push({ b, good: !!it.good });
      row.appendChild(b);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /* ---------- 국면 1: 이항 조작(동류항 정리·드래그·탭탭·표준형 검사) ---------- */

  /** 같은 변의 동류항 자동 정리(하나로 합침). */
  function combine(side: "L" | "R", then: () => void): void {
    const list = terms.filter((t) => t.alive && t.side === side);
    const xs = list.filter((t) => t.x);
    const cs = list.filter((t) => !t.x);
    let merged = false;
    const mergeGroup = (grp: Term[]): void => {
      if (grp.length < 2) return;
      merged = true;
      const sum = grp.reduce((m, t) => m + t.v, 0);
      const keep = grp[0];
      grp.slice(1).forEach((t) => {
        t.alive = false;
        put(t, keep.px, keep.py, ".3s ease");
        t.elm.style.opacity = "0";
        const dead = t.elm;
        later(() => dead.remove(), 340);
      });
      keep.v = sum;
      if (sum === 0) {
        keep.alive = false;
        keep.elm.style.opacity = "0";
        keep.elm.style.transform = "scale(.4)";
        const dead = keep.elm;
        later(() => dead.remove(), 340);
      } else {
        paintChip(keep);
        keep.elm.classList.remove("merged");
        void keep.elm.offsetWidth;
        keep.elm.classList.add("merged");
      }
    };
    mergeGroup(xs);
    mergeGroup(cs);
    later(
      () => {
        layoutSide(side);
        paintEq();
        then();
      },
      merged ? 380 : 40,
    );
  }

  /** 이항 실행: 항 t를 반대편으로, 부호 반전(부등호 방향은 유지). */
  function transpose(t: Term): void {
    if (solving || solved) return;
    solving = true;
    haptic(HAPTIC.select);
    t.v = -t.v;
    t.side = t.side === "L" ? "R" : "L";
    paintChip(t);
    t.elm.style.boxShadow = "0 0 0 4px rgba(232,169,62,.6)";
    later(() => {
      t.elm.style.boxShadow = "";
    }, 600);
    toast(mi === 0 ? "부호는 반대로! 부등호 방향은 그대로예요" : "이항 완료, 부호만 반대로!");
    layoutSide("L");
    layoutSide("R");
    later(() => {
      combine("L", () =>
        combine("R", () => {
          solving = false;
          checkState();
        }),
      );
    }, 420);
  }

  /** 국면 1의 첫 이항만 함정 예측("부등호도 뒤집힐까?")을 먼저 짚는다. */
  function tryTranspose(t: Term): void {
    if (mi === 0 && !movePredicted) {
      movePredicted = true;
      askMovePredict(t);
      return;
    }
    transpose(t);
  }

  function askMovePredict(t: Term): void {
    t.elm.classList.add("isl-hold");
    toast("잠깐! 건너기 전에 예측부터");
    ask(
      "칩이 부등호를 건너면 부호는 반대로 바뀌죠. 그럼 <b>부등호의 방향</b>은 어떻게 될까요?",
      [
        {
          t: "부등호도 뒤집혀요: 선을 넘으면 다 반대니까요",
          fb: "이항의 정체는 양변에 같은 수 더하기·빼기예요. 더하고 빼는 건 부등호 방향을 못 바꿔요!",
        },
        {
          t: "부등호는 그대로예요: 이항은 양변에 같은 수를 더한 것뿐이니까요",
          good: true,
          fb: "정답! 이항은 더하기·빼기라 부등호 방향은 그대로예요",
        },
      ],
      () => {
        t.elm.classList.remove("isl-hold");
        transpose(t);
      },
    );
  }

  /** 표준형(ax rel b)이면 나누기 버튼을 연다(음수 계수면 반전 예측 먼저). */
  function checkState(): void {
    paintEq();
    actions.innerHTML = "";
    if (solved) return;
    const lList = terms.filter((t) => t.alive && t.side === "L");
    const rList = terms.filter((t) => t.alive && t.side === "R");
    const lx = lList.filter((t) => t.x);
    const lc = lList.filter((t) => !t.x);
    const rx = rList.filter((t) => t.x);
    const rc = rList.filter((t) => !t.x);
    if (lx.length === 1 && lc.length === 0 && rx.length === 0 && rc.length <= 1) {
      const a = lx[0].v;
      const b = rc[0]?.v ?? 0;
      if (a === 1) {
        finishMission(b);
        return;
      }
      if (b % a === 0) {
        if (a < 0 && MISSIONS[mi].goal === "flip" && !flipPredicted) askFlipPredict(a, b, lx[0], rc[0]);
        else armDivide(a, b, lx[0], rc[0]);
      }
      return;
    }
    helper.innerHTML =
      "<b>x 항은 왼쪽, 상수는 오른쪽</b>으로, 칩을 부등호 너머로 보내세요(칩 탭 → 반대편 탭도 돼요).";
  }

  function armDivide(a: number, b: number, xt: Term, ct: Term | undefined, pulse = false): void {
    const db = el("button", {
      class: `ct-btn isl-hero${pulse ? " pulse" : ""}`,
      text: `양변 ÷ ${a < 0 ? `(${mono(a)})` : a}`,
      attrs: { type: "button" },
    });
    db.addEventListener("click", () => {
      if (solving || solved || predicting) return;
      solving = true;
      haptic(HAPTIC.select);
      db.disabled = true;
      if (a < 0) {
        flipRelAnim();
        later(() => applyDivide(a, b, xt, ct), 640);
      } else {
        toast("양수로 나누기, 부등호 방향은 그대로!");
        applyDivide(a, b, xt, ct);
      }
    });
    actions.appendChild(db);
    later(() => db.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    helper.innerHTML =
      a < 0
        ? `${mfmt(eqSrc())} 까지 왔어요. 남은 건 <b>음수로 나누기</b>, 부등호에서 눈을 떼지 마세요!`
        : `${mfmt(eqSrc())} 까지 왔어요. <b>양변 나누기</b>로 x만 남겨요!`;
  }

  function applyDivide(a: number, b: number, xt: Term, ct: Term | undefined): void {
    xt.v = 1;
    paintChip(xt);
    const q = b / a;
    if (ct) {
      ct.v = q;
      paintChip(ct);
    } else {
      mkTerm(false, q, "R");
    }
    layoutSide("L");
    layoutSide("R");
    paintEq();
    later(() => finishMission(q), 520);
  }

  /* ---------- 드래그 + 탭-탭 ---------- */
  function bindDrag(t: Term): void {
    t.elm.addEventListener("pointerdown", (e) => {
      if (solving || solved || predicting || !t.alive || drag) return;
      if (mustExpand) {
        toast("먼저 [괄호 풀기]로 괄호를 열어야 해요!");
        return;
      }
      try {
        t.elm.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 포인터 안전 */
      }
      drag = { t, sx: e.clientX, sy: e.clientY, ox: t.px, oy: t.py, moved: false };
    });
    t.elm.addEventListener("pointermove", (e) => {
      if (!drag || drag.t !== t) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) > 7) {
        drag.moved = true;
        t.elm.classList.add("drag");
      }
      if (!drag.moved) return;
      t.px = clamp(drag.ox + dx, 2, bw() - t.elm.offsetWidth - 2);
      t.py = clamp(drag.oy + dy, 2, BOARD_H - CHIP_H - 2);
      t.elm.style.left = `${t.px}px`;
      t.elm.style.top = `${t.py}px`;
    });
    const up = (): void => {
      if (!drag || drag.t !== t) return;
      const d = drag;
      drag = null;
      t.elm.classList.remove("drag");
      if (solving || solved || predicting) return;
      if (!d.moved) {
        // 탭-탭: 칩 선택 → 반대편 보드 탭은 board 리스너가 처리
        if (pendingTap === t) {
          pendingTap = null;
          t.elm.style.outline = "";
        } else {
          if (pendingTap) pendingTap.elm.style.outline = "";
          pendingTap = t;
          t.elm.style.outline = "3px solid rgba(201,138,61,.6)";
        }
        return;
      }
      // 드롭: 중앙선을 넘었는가?
      const center = t.px + t.elm.offsetWidth / 2;
      const crossed = (t.side === "L" && center > bw() / 2) || (t.side === "R" && center < bw() / 2);
      if (crossed) tryTranspose(t);
      else layoutSide(t.side);
    };
    t.elm.addEventListener("pointerup", up);
    t.elm.addEventListener("pointercancel", up);
  }
  board.addEventListener("pointerdown", (e) => {
    if (!pendingTap || solving || solved || predicting || mustExpand) return;
    if ((e.target as HTMLElement).closest(".tm-chip")) return;
    const r = board.getBoundingClientRect();
    const half = e.clientX - r.left > r.width / 2 ? "R" : "L";
    const t = pendingTap;
    pendingTap = null;
    t.elm.style.outline = "";
    if (half !== t.side) tryTranspose(t);
  });

  /* ---------- 국면 2: 부등호 반전(scaleX 플립 + 앰버 경고 플래시) ---------- */

  /** 부등호 글리프가 홱 뒤집히는 연출. 애니 끝에 글리프를 실제 문자로 교체한다. */
  function flipRelAnim(): void {
    haptic(HAPTIC.wrong);
    sign.classList.remove("warn");
    flash.classList.remove("on");
    void sign.offsetWidth;
    sign.classList.add("warn");
    flash.classList.add("on");
    sg.classList.add("flip");
    toast("음수로 나누는 순간, 부등호가 홱 뒤집혀요!");
    later(() => {
      rel = FLIP[rel];
      sg.style.transition = "none";
      sg.classList.remove("flip");
      sg.textContent = rel;
      void sg.offsetWidth;
      sg.style.transition = "";
    }, 540);
  }

  /** 음수 나눗셈 직전 반전 예측(국면 2에서 한 번). */
  function askFlipPredict(a: number, b: number, xt: Term, ct: Term | undefined): void {
    flipPredicted = true;
    ask(
      `이번엔 x의 계수가 음수예요. 양변을 ${mono(a)}으로 나누면 <b>부등호</b>는 어떻게 될까요?`,
      [
        {
          t: "방향 그대로예요: 나누기는 부등호를 못 바꿔요",
          fb: "3<5에 ×(−1)을 하면 −3>−5로 뒤집혔었죠! 음수로 나눌 때도 똑같이 반전이에요",
        },
        {
          t: "홱 뒤집혀요: 음수를 곱하거나 나누면 대소가 반전되니까요",
          good: true,
          fb: "맞아요! 수직선 반전 실험 그대로, 음수 나눗셈은 순서를 뒤집어요",
        },
      ],
      () => armDivide(a, b, xt, ct, true),
    );
  }

  /* ---------- 미션 완료: 수직선에 ○·●와 화살을 새긴다 ---------- */

  function finishMission(v: number): void {
    if (solved) return;
    solved = true;
    actions.innerHTML = "";
    haptic(HAPTIC.correct);
    paintEq();
    toast(`x ${rel} ${mono(v)} 완성!`);
    later(() => showLine(v), 420);
  }

  /** 수직선 조각: 경계 v 주변 정수 눈금 + 경계 점(○/●) + 방향 화살. */
  function lineSvg(v: number, dir: "L" | "R", closed: boolean, pending: boolean): string {
    const lo = v - 3;
    const hi = v + 3;
    const W = 320;
    const Y = 34;
    const px = (val: number): number => 26 + ((val - lo) * (W - 52)) / (hi - lo);
    let t = "";
    for (let k = lo; k <= hi; k++) {
      const zero = k === 0;
      t +=
        `<line x1="${px(k)}" y1="${Y - (zero ? 7 : 5)}" x2="${px(k)}" y2="${Y + (zero ? 7 : 5)}"` +
        ` stroke="${zero ? "#8C6A3E" : "#CDB392"}" stroke-width="${zero ? 2.2 : 1.6}"/>`;
      t +=
        `<text x="${px(k)}" y="${Y + 24}" text-anchor="middle" font-size="11"` +
        ` font-weight="${k === v ? 900 : 700}" fill="${k === v ? "#7F4A12" : "#A08B6E"}">${mono(k)}</text>`;
    }
    const x0 = px(v) + (dir === "R" ? 9 : -9);
    const x1 = dir === "R" ? W - 16 : 16;
    const len = Math.abs(x1 - x0);
    const ray =
      `<line class="isl-ray" x1="${x0}" y1="${Y}" x2="${x1}" y2="${Y}" stroke="#A9631B" stroke-width="4"` +
      ` stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${len}"/>`;
    const arr =
      dir === "R"
        ? `<path class="isl-arr" d="M${W - 6} ${Y} l-11 -6 v12 z" fill="#A9631B"/>`
        : `<path class="isl-arr" d="M6 ${Y} l11 -6 v12 z" fill="#A9631B"/>`;
    const dot = `<circle class="isl-nldot ${closed ? "closed" : "open"}" cx="${px(v)}" cy="${Y}" r="8"/>`;
    const hole = pending ? `<circle class="isl-hole" cx="${px(v)}" cy="${Y}" r="8"/>` : "";
    return (
      `<svg viewBox="0 0 ${W} 66" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">` +
      `<line x1="6" y1="${Y}" x2="${W - 6}" y2="${Y}" stroke="#B99A70" stroke-width="2.2"/>` +
      t +
      ray +
      arr +
      dot +
      hole +
      `</svg>`
    );
  }

  function showLine(v: number): void {
    const m = MISSIONS[mi];
    const dir: "L" | "R" = rel === ">" || rel === "≥" ? "R" : "L";
    const closed = rel === "≥" || rel === "≤";
    const pending = m.goal === "dot"; // 국면 3은 경계 점을 판단 뒤에 찍는다
    lineWrap.innerHTML = lineSvg(v, dir, closed, pending);
    void lineWrap.offsetWidth;
    lineWrap.classList.add("show");
    const ray = lineWrap.querySelector(".isl-ray");
    const arr = lineWrap.querySelector(".isl-arr");
    const dot = lineWrap.querySelector(".isl-nldot");
    const hole = lineWrap.querySelector(".isl-hole");
    if (pending) {
      later(() => ray?.classList.add("draw"), 260);
      later(() => arr?.classList.add("on"), 980);
      later(() => hole?.classList.add("on"), 1150);
      later(() => askDot(dot, hole), 1400);
    } else {
      later(() => {
        dot?.classList.add("on");
        haptic(HAPTIC.tap);
      }, 300);
      later(() => ray?.classList.add("draw"), 660);
      later(() => arr?.classList.add("on"), 1380);
      later(() => missionWrap(v), 1650);
    }
  }

  function missionWrap(v: number): void {
    const m = MISSIONS[mi];
    if (m.goal === "move") {
      toast(`경계 ${mono(v)} 자신은 ${mono(v)}>${mono(v)}라 거짓, 해가 아니에요. 그래서 속이 빈 ○!`);
      goals.on("move", "그대로!");
      helper.innerHTML = `${mfmt("x>2")}, 2보다 큰 모든 수가 해예요. 다음 판, 이번엔 괄호가 등장해요!`;
      later(() => setupMission(1), 3000);
    } else {
      toast("반전 완료! 이번엔 −3보다 작은 쪽, 왼쪽으로 뻗어요");
      goals.on("flip", "홱!");
      helper.innerHTML = "음수로 나누는 순간 부등호가 뒤집혔어요. 마지막 판은 ≥, 혼자 힘으로!";
      later(() => setupMission(2), 3000);
    }
  }

  /** 국면 3: 경계 포함 판단 → ●(포함) 발견. */
  function askDot(dot: Element | null, hole: Element | null): void {
    ask(
      `${mfmt("x≤1")} 완성! 1보다 작은 수는 전부 해예요. 그럼 <b>경계인 1 자신</b>은 해일까요?`,
      [
        {
          t: "해가 아니에요: 1보다 작아야만 하니까요",
          fb: "≤는 '작거나 같다'예요. 1≤1이 참이니까 1도 해!",
        },
        {
          t: "해예요: 1≤1, 같아도 ≤는 참이니까요",
          good: true,
          fb: "정답! 1≤1도 참이라 1도 당당한 해예요",
        },
      ],
      () => {
        hole?.classList.remove("on");
        hole?.classList.add("off");
        dot?.classList.add("on");
        haptic(HAPTIC.correct);
        later(() => {
          toast("포함되는 경계는 속을 꽉 채운 ●로 새겨요. 아까 x>2의 2는 속이 빈 ○였죠!");
          goals.on("dot", "● 포함!");
          helper.innerHTML = "○은 미포함, ●은 포함이에요. 부등호에 =이 붙으면(≥, ≤) 경계도 해라서 ●!";
          maybeFinish();
        }, 900);
      },
    );
  }

  /* ---------- 미션 셋업 ---------- */
  function setupMission(i: number): void {
    mi = i;
    solved = false;
    solving = false;
    predicting = false;
    flipPredicted = false;
    pendingTap = null;
    terms.forEach((t) => t.elm.remove());
    terms = [];
    if (parenElm) {
      parenElm.remove();
      parenElm = null;
    }
    actions.innerHTML = "";
    qline.innerHTML = "";
    clear(ctl);
    lineWrap.classList.remove("show");
    later(() => {
      lineWrap.innerHTML = "";
    }, 350);
    const m = MISSIONS[i];
    rel = m.rel;
    sg.textContent = rel;
    mustExpand = !!m.paren;
    if (m.paren) {
      const pe = el("div", {
        class: "tm-chip isl-paren",
        style: "position:absolute; left:0; top:0;",
        html: mfmt("2(x-3)"),
        attrs: { role: "button", "aria-label": "괄호 항 2(x-3)" },
      });
      parenElm = pe;
      board.appendChild(pe);
      pe.addEventListener("click", () => {
        if (!mustExpand) return;
        toast("괄호째로는 못 옮겨요. 아래 [괄호 풀기] 버튼부터!");
        pe.classList.remove("shake");
        void pe.offsetWidth;
        pe.classList.add("shake");
      });
      const xb = el("button", { class: "ct-btn isl-hero pulse", text: "괄호 풀기", attrs: { type: "button" } });
      xb.addEventListener("click", () => {
        if (!mustExpand || solving || predicting) return;
        solving = true;
        haptic(HAPTIC.select);
        xb.disabled = true;
        pe.classList.add("burst");
        later(() => {
          const bx = pe.offsetLeft;
          const by = pe.offsetTop;
          pe.remove();
          parenElm = null;
          mustExpand = false;
          const t1 = mkTerm(true, 2, "L");
          const t2 = mkTerm(false, -6, "L");
          put(t1, bx, by);
          put(t2, bx + 24, by);
          t1.elm.classList.add("merged");
          t2.elm.classList.add("merged");
          toast("2×x는 2x, 2×(−3)은 −6. 괄호 안 모든 항에 2를 곱해요!");
          layoutSide("L");
          later(() => {
            actions.innerHTML = "";
            solving = false;
            checkState();
          }, 480);
        }, 300);
      });
      actions.appendChild(xb);
      later(() => xb.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }
    if (m.l[0]) mkTerm(true, m.l[0], "L");
    if (m.l[1]) mkTerm(false, m.l[1], "L");
    if (m.r[0]) mkTerm(true, m.r[0], "R");
    if (m.r[1]) mkTerm(false, m.r[1], "R");
    later(() => {
      layoutSide("L");
      layoutSide("R");
      if (parenElm) {
        parenElm.style.left = `${bw() * 0.25 - parenElm.offsetWidth / 2}px`;
        parenElm.style.top = `${CHIP_CY - CHIP_H / 2}px`;
      }
      paintEq();
    }, 40);
    helper.innerHTML =
      i === 0
        ? `첫 문제 ${mfmt("3x-1>5")}. 방정식에서 하던 그대로, <b>−1 칩을 부등호 너머로</b> 끌어 보내요(칩 탭 → 반대편 탭도 돼요).`
        : i === 1
          ? "괄호 등장! 먼저 <b>[괄호 풀기]</b>, 그다음 x 항은 왼쪽, 상수는 오른쪽으로 모아요."
          : `마지막 ${mfmt("-7x+5≥-2")}. 안내 없이 혼자 풀어 봐요. 음수로 나눌 때만 조심!`;
  }

  setupMission(0);
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
