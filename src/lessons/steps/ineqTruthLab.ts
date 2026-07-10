// ineqTruthLab, 부등식 참·거짓 판정기(중2 수학 Ⅱ L1, 책 56~57쪽). 값 카드를 부등식에
// 대입해 참/거짓을 판정하며, 방정식과 달리 해가 '여러 개(범위)'임을 발견한다.
// 국면 1(truth): 부등식 카드 2x+1<7 아래 판정 테이블. x=1~4 카드를 탭하면 좌변이
//                계산돼 채워지고(2×1+1=3) 7과 비교, 참(초록)/거짓(빨강) 램프.
//                참은 1·2뿐(7<7 거짓 포인트 포함), "참이 되게 하는 값"의 선체험.
// 국면 2(edge): 4x-1≥x+8 에 x=1~5 대입(양변 모두 계산), 해는 3·4·5. 경계값 x=3
//               (11≥11)은 램프 대신 mq6-q 판단 질문으로 정면 승부: "=도 ≥의 참".
// 국면 3(many): "해는 몇 개?" 예측(여러 개/1개/0개) 뒤 수직선에 참 값 점들이
//               왼→오 스태거로 켜지고 끝에 … 화살(범위의 예감, 정식 ○● 표기는 L3 몫).
// 목표 칩 3: truth·edge·many. 전부 켜지면 recordQuiz(true)+enableCTA.
// 문법: mboard+goalChips+mtoast+mq6-q, CSS 트랜지션+setTimeout(타이머 Set 일괄 해제),
// rAF 금지. 참조: eqTruth.ts(참거짓 테이블 원전), divLab(mq6 패널 최신 예).
// 스타일: math2.css의 .itl-* 섹션(스니펫은 최종 보고로 전달, 메인이 붙인다).
import { el, clear } from "../../core/dom";
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

type Rel = "<" | ">" | "≥" | "≤";

interface PhaseDef {
  src: string; // mfmt 마크업(부등식 카드)
  rel: Rel;
  xs: number[];
  lhsDisp: (x: number) => string; // mfmt 마크업(대입된 좌변 계산식)
  lhsVal: (x: number) => number;
  rhsDisp: (x: number) => string;
  rhsVal: (x: number) => number;
  rhsConst: boolean; // 우변이 상수면 계산 연출 생략
  edgeX?: number; // 경계값 함정(좌변=우변, 판단 질문으로 판정)
}

const PHASES: PhaseDef[] = [
  {
    src: "2x+1<7",
    rel: "<",
    xs: [1, 2, 3, 4],
    lhsDisp: (x) => `2×${x}+1`,
    lhsVal: (x) => 2 * x + 1,
    rhsDisp: () => "7",
    rhsVal: () => 7,
    rhsConst: true,
  },
  {
    src: "4x-1≥x+8",
    rel: "≥",
    xs: [1, 2, 3, 4, 5],
    lhsDisp: (x) => `4×${x}-1`,
    lhsVal: (x) => 4 * x - 1,
    rhsDisp: (x) => `${x}+8`,
    rhsVal: (x) => x + 8,
    rhsConst: false,
    edgeX: 3,
  },
];

/** 부등식 성립 여부. */
function holds(l: number, r: number, rel: Rel): boolean {
  return rel === "<" ? l < r : rel === ">" ? l > r : rel === "≥" ? l >= r : l <= r;
}

/** 판정 토스트 문구. 경계(같은 값) 포인트는 따로 짚는다. */
function verdictMsg(l: number, r: number, rel: Rel, truth: boolean): string {
  if (l === r && rel === "<") return `${l}<${r}? 같은 수는 '작다'가 아니에요. 거짓!`;
  if (truth) return `${l} ${rel} ${r}, 맞아요. 참!`;
  return `${l} ${rel} ${r}? 아니죠, 거짓!`;
}

export const ineqTruthLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "truth", label: "판정 완주", sub: "2x+1<7" },
    { id: "edge", label: "경계값", sub: "=이면?" },
    { id: "many", label: "해는 몇 개?", sub: "예측" },
  ]);

  const board = mboard(430);
  const eqCard = el("div", { class: "itl-eq" });
  const rowsWrap = el("div", { class: "itl-rows", attrs: { role: "group", "aria-label": "대입 판정 표" } });
  const lineWrap = el("div", { class: "itl-linewrap", attrs: { "aria-hidden": "true" } });
  const qline = el("div", { class: "mq6-q itl-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(eqCard, rowsWrap, lineWrap, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "카드를 탭하면 그 값이 부등식에 대입돼요. <b>x=1부터 4까지 전부</b> 판정! 참 램프는 몇 번 켜질까요?",
  });
  host.append(chips.el, board, helper);
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
  let phase = 0;
  let doneCount = 0;
  let evaluating = false; // 판정 연출·판단 질문 중 입력 잠금
  let finished = false;

  function maybeFinish(): void {
    if (finished || chips.count() < 3) return;
    finished = true;
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /** 등장 팝: 트랜지션을 잠깐 끄고 축소 상태를 심은 뒤 스프링으로 복귀. */
  function pop(n: HTMLElement): void {
    const t = n.style.transition;
    n.style.transition = "none";
    n.style.transform = "scale(.55)";
    void n.offsetWidth;
    n.style.transition = t;
    n.style.transform = "scale(1)";
  }

  function reveal(res: HTMLElement, v: number): void {
    res.innerHTML = `<span class="mx-op">=</span><b>${v}</b>`;
    pop(res);
    res.style.opacity = "1";
  }

  function swapEq(): void {
    eqCard.classList.remove("slidein");
    void eqCard.offsetWidth;
    eqCard.innerHTML = mfmt(PHASES[phase].src);
    eqCard.classList.add("slidein");
  }

  /* ---------- 국면 1·2 공통: 판정 테이블 기계 ---------- */

  function judge(row: HTMLElement, lamp: HTMLElement, lv: number, rv: number): void {
    const def = PHASES[phase];
    row.classList.remove("ask");
    row.dataset.done = "1";
    const truth = holds(lv, rv, def.rel);
    if (truth) {
      row.classList.add("ok");
      lamp.textContent = "참!";
      lamp.setAttribute("aria-label", "판정 참");
      lamp.classList.add("ok");
      haptic(HAPTIC.correct);
    } else {
      row.classList.add("no");
      lamp.textContent = "거짓";
      lamp.setAttribute("aria-label", "판정 거짓");
      lamp.classList.add("no");
      haptic(HAPTIC.cross);
    }
    pop(lamp);
    toast(verdictMsg(lv, rv, def.rel, truth));
    doneCount += 1;
    evaluating = false;
    if (doneCount === def.xs.length) phaseDone();
  }

  function buildRows(): void {
    clear(rowsWrap);
    doneCount = 0;
    const def = PHASES[phase];
    for (const x of def.xs) {
      const mkCalc = (disp: string, fixed: boolean): { cell: HTMLElement; res: HTMLElement | null } => {
        if (fixed) return { cell: el("span", { class: "itl-cell", html: mfmt(disp) }), res: null };
        const res = el("span", {
          class: "itl-res",
          html: `<span class="mx-op">=</span><span class="itl-qm">?</span>`,
        });
        const cell = el("span", { class: "itl-cell" }, el("span", { html: mfmt(disp) }), res);
        return { cell, res };
      };
      const lhs = mkCalc(def.lhsDisp(x), false);
      const rhs = mkCalc(def.rhsDisp(x), def.rhsConst);
      const lamp = el("span", { class: "itl-lamp", text: "?", attrs: { "aria-label": "판정 대기" } });
      const row = el(
        "button",
        { class: "itl-row", attrs: { type: "button", "aria-label": `x=${x} 대입 판정` } },
        el("span", { class: "itl-x", html: `<i>x</i>=${x}` }),
        lhs.cell,
        el("span", { class: "itl-op", text: def.rel }),
        rhs.cell,
        lamp,
      );
      row.addEventListener("click", () => {
        if (finished) return;
        if (row.dataset.done === "1") {
          toast("이미 판정한 값이에요");
          return;
        }
        if (evaluating) return;
        evaluating = true;
        haptic(HAPTIC.tap);
        row.classList.add("ask");
        const lv = def.lhsVal(x);
        const rv = def.rhsVal(x);
        const lres = lhs.res;
        if (lres) later(() => reveal(lres, lv), 170);
        const rres = rhs.res;
        if (rres) later(() => reveal(rres, rv), 620);
        const judgeAt = rres ? 1060 : 760;
        if (def.edgeX === x) later(() => askEdge(row, lamp, lv, rv), judgeAt);
        else later(() => judge(row, lamp, lv, rv), judgeAt);
      });
      rowsWrap.appendChild(row);
    }
  }

  function phaseDone(): void {
    if (phase === 0) {
      chips.on("truth", "1·2만 참!");
      toast("네 값 판정 완료! 참은 1과 2, 두 개");
      later(() => {
        helper.innerHTML =
          "참이 되게 하는 값이 <b>두 개</b>나 나왔어요. 부등식을 참이 되게 하는 값을 그 부등식의 <b>해</b>라고 해요. 다음 판!";
      }, 800);
      later(() => {
        rowsWrap.style.opacity = "0";
      }, 2100);
      later(() => {
        phase = 1;
        haptic(HAPTIC.select);
        swapEq();
        buildRows();
        rowsWrap.style.opacity = "1";
        helper.innerHTML = "이번엔 <b>양변 모두 계산</b>이에요. x=1부터 5까지, 참은 어디서부터 시작될까요?";
      }, 2500);
    } else {
      toast("다섯 값 판정 완료!");
      later(startP3, 900);
    }
  }

  /* ---------- 판단 질문(mq6-q 문법)과 국면 2 경계값 함정 ---------- */

  /** 판단 질문: .mq6-q 강조 줄 + 자기설명형 선택지, 오답엔 오개념 교정 토스트. */
  function ask(qhtml: string, items: { t: string; good?: boolean; fb: string }[], onDone: () => void): void {
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
          onDone();
        }, 1500);
      });
      btns.push({ b, good: !!it.good });
      row.appendChild(b);
    }
    clear(ctl);
    ctl.appendChild(row);
  }

  /** 국면 2 경계값(x=3): 좌변=우변, 램프 대신 판단 질문으로 정면 승부. */
  function askEdge(row: HTMLElement, lamp: HTMLElement, lv: number, rv: number): void {
    row.classList.remove("ask");
    row.classList.add("edge");
    toast("어라, 두 변이 똑같아요! 아래에서 직접 판정해 봐요");
    ask(
      `좌변도 ${lv}, 우변도 ${rv}, 똑같아요. ${mfmt("4x-1≥x+8")} 은 참일까요, 거짓일까요?`,
      [
        {
          t: "거짓이에요: 왼쪽이 더 커야만 하니까요",
          fb: "함정이었어요! ≥는 '크거나 같다', 두 변이 같아도 참이에요",
        },
        {
          t: "참이에요: ≥는 '크거나 같다'니까요",
          good: true,
          fb: "정답! 같아도 ≥는 참, 경계값 3도 당당한 해예요",
        },
      ],
      () => {
        later(() => {
          lamp.textContent = "참!";
          lamp.setAttribute("aria-label", "판정 참");
          lamp.classList.add("ok");
          pop(lamp);
          row.classList.remove("edge");
          row.classList.add("ok");
          haptic(HAPTIC.correct);
          chips.on("edge", "=도 참!");
        }, 300);
        later(() => {
          row.dataset.done = "1";
          evaluating = false;
          doneCount += 1;
          if (doneCount === PHASES[phase].xs.length) phaseDone();
        }, 1200);
      },
    );
  }

  /* ---------- 국면 3: 해는 몇 개? 예측 → 수직선 점 연출 ---------- */

  function startP3(): void {
    helper.innerHTML = "판정을 마쳤으니, 이제 결정적인 질문이에요.";
    ask(
      "방정식이라면 해는 딱 1개였죠. 이 <b>부등식</b>을 참이 되게 하는 값, 그러니까 해는 몇 개일까요?",
      [
        {
          t: "딱 1개예요: 해는 원래 하나뿐이니까요",
          fb: "방정식은 1개지만 부등식은 달라요. 3, 4, 5 모두 참이었잖아요!",
        },
        {
          t: "여러 개예요: 3, 4, 5 전부 참이었으니까요",
          good: true,
          fb: "그렇죠! 벌써 3개나 찾았어요. 그런데 그게 끝이 아니에요",
        },
        {
          t: "0개예요: 참인 값이 하나도 없으니까요",
          fb: "판정표를 다시 봐요. 3, 4, 5에서 참 램프가 켜졌어요!",
        },
      ],
      showLine,
    );
  }

  /** 수직선(0~8): 참 값 3·4·5 점 + 6·7 유령 점 + 끝의 … 화살(범위의 예감). */
  function lineSvg(): string {
    const W = 340;
    const Y = 46;
    const px = (v: number): number => 24 + v * 34;
    let t = "";
    for (let v = 0; v <= 8; v++) {
      const sol = v >= 3;
      t += `<line x1="${px(v)}" y1="${Y - 5}" x2="${px(v)}" y2="${Y + 5}" stroke="#CDB392" stroke-width="1.6"/>`;
      t +=
        `<text x="${px(v)}" y="${Y + 24}" text-anchor="middle" font-size="11"` +
        ` font-weight="${sol ? 800 : 700}" fill="${sol ? "#7F4A12" : "#A08B6E"}">${v}</text>`;
    }
    let dots = "";
    for (const v of [3, 4, 5]) dots += `<circle class="itl-dot" cx="${px(v)}" cy="${Y}" r="7"/>`;
    for (const v of [6, 7]) dots += `<circle class="itl-dot ghost" cx="${px(v)}" cy="${Y}" r="5.5"/>`;
    return (
      `<svg viewBox="0 0 ${W} 92" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">` +
      `<line x1="10" y1="${Y}" x2="${W - 22}" y2="${Y}" stroke="#B99A70" stroke-width="2.4"/>` +
      t +
      dots +
      `<g class="itl-more"><text x="${px(7) + 16}" y="${Y - 12}" font-size="17" font-weight="900" fill="#A9631B">…</text>` +
      `<path d="M${W - 20} ${Y} l-9 -5.5 v11 z" fill="#A9631B"/></g>` +
      `</svg>`
    );
  }

  function showLine(): void {
    lineWrap.innerHTML = lineSvg();
    void lineWrap.offsetWidth;
    lineWrap.classList.add("show");
    const dots = Array.from(lineWrap.querySelectorAll(".itl-dot"));
    dots.forEach((d, i) => {
      later(() => {
        d.classList.add("on");
        haptic(HAPTIC.tap);
      }, 420 + i * 240);
    });
    const tail = 420 + dots.length * 240;
    later(() => {
      lineWrap.querySelector(".itl-more")?.classList.add("on");
    }, tail + 100);
    later(() => {
      toast("3, 4, 5에서 끝이 아니에요. 6도 7도 100도, 계속 참!");
      chips.on("many", "끝없이!");
      helper.innerHTML =
        "해가 하나가 아니라 <b>범위째</b>로 있어요. 이 범위를 수직선에 딱 새기는 법은 곧 배워요!";
      maybeFinish();
    }, tail + 650);
  }

  eqCard.innerHTML = mfmt(PHASES[0].src);
  buildRows();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
