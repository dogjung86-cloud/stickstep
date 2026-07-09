// divLab, 나눗셈 기계(중2 수학 Ⅰ L1, 책 12~14쪽). 분수를 넣고 [한 칸 더] 크랭크를 돌리면
// 소수점 아래 몫이 큰 숫자 칩으로 한 자리씩 슬라이드 인 되고, "나머지 ○" 필이 갱신된다.
// 나머지 0 → 기계 정지 연출(램프 초록 + "유한" 도장). 나머지가 계속 살아 돌면
// [영원히 안 멈춰요!] 선언이 완료 경로("무한" 도장). 세로 필산 재현 없이
// "나머지가 0이 되는 순간 멈춘다"만 보이게 한다.
// 국면 1: 1/4 예측(멈춘다/계속된다) → 크랭크 2번 → 0.25, 나머지 1→2→0 정지 → 목표 stop
// 국면 2: 1/6 예측 → 0.1666…, 나머지 4가 계속 반복, 5자리째 선언 버튼 → 선언이 정답 → 목표 nostop
// 국면 3: 3/8 vs 2/3 직접 선택 → 예측 → 실행 → 판정 → 목표 third(남은 분수는 보너스 실험)
// 문법: mboard+goalChips+mtoast+mq6 패널(inst→eqs→qline(.mq6-q 판단 질문은 선택지 바로 위)→ctl),
// CSS 트랜지션+setTimeout 체인(타이머 Set 일괄 해제), rAF 금지.
// 스타일은 math2.css의 .dvl-* 섹션. 참조 구현: freqLab(mq6 패널)·likeTerms(국면 전환·선언 버튼).

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

type PredKey = "stop" | "go";
type GoalId = "stop" | "nostop" | "third";

interface FracDef {
  num: number;
  den: number;
  src: string; // mfmt 분수 마크업
  finite: boolean;
  eq: string; // 판정 시 eqs 줄에 붙는 mfmt 마크업(계속되는 수는 … 포함)
}

interface RunOpts {
  goal?: GoalId;
  bonus?: boolean;
  after?: () => void;
}

const F14: FracDef = { num: 1, den: 4, src: "{1/4}", finite: true, eq: "{1/4}=0.25" };
const F16: FracDef = { num: 1, den: 6, src: "{1/6}", finite: false, eq: "{1/6}=0.1666…" };
const F38: FracDef = { num: 3, den: 8, src: "{3/8}", finite: true, eq: "{3/8}=0.375" };
const F23: FracDef = { num: 2, den: 3, src: "{2/3}", finite: false, eq: "{2/3}=0.666…" };

const DECLARE_AT = 5; // 안 멈추는 판에서 선언 버튼이 열리는 몫 자릿수
const CHIP_MAX = 6; // 몫 띠에 실제로 놓이는 숫자 칩 상한(이후 크랭크는 … 만 깜빡인다)
const GOAL_SUB: Record<GoalId, string> = { stop: "0.25!", nostop: "선언 성공!", third: "판정 완료!" };

/* 크랭크 휠(파운드리 재질: 3스톱 그라데이션 + 키라이트 스트릭 + 접촉 그림자) */
const WHEEL_SVG =
  `<svg viewBox="0 0 44 46" xmlns="http://www.w3.org/2000/svg" fill="none">` +
  `<defs><linearGradient id="dvlWm" x1="0" y1="0" x2="1" y2="1">` +
  `<stop offset="0" stop-color="#E9D3F4"/><stop offset=".55" stop-color="#C77BD6"/><stop offset="1" stop-color="#9C36B5"/>` +
  `</linearGradient></defs>` +
  `<ellipse cx="22" cy="42.5" rx="13" ry="2.6" fill="#2A3A5E" opacity=".11"/>` +
  `<g class="dvl-wheelg">` +
  `<circle cx="22" cy="22" r="15" fill="url(#dvlWm)" stroke="#7D2A93" stroke-width="1.5"/>` +
  `<circle cx="22" cy="22" r="12.5" fill="none" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="1.6" stroke-dasharray="12 67" stroke-dashoffset="-8"/>` +
  `<circle cx="22" cy="10.6" r="4.6" fill="url(#dvlWm)" stroke="#7D2A93" stroke-width="1.4"/>` +
  `<circle cx="20.6" cy="9.2" r="1.1" fill="#FFFFFF" opacity=".6"/>` +
  `<circle cx="22" cy="22" r="3.4" fill="#7D2A93"/>` +
  `<circle cx="20.9" cy="20.9" r="1" fill="#FFFFFF" opacity=".55"/>` +
  `</g></svg>`;

export const divLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "stop", label: "멈추는 수", sub: "1/4 실험" },
    { id: "nostop", label: "안 멈추는 수", sub: "1/6 실험" },
    { id: "third", label: "세 번째 손님", sub: "직접 고르기" },
  ]);

  const board = mboard(560);
  // ── 기계 무대 ──
  const fracWin = el("div", { class: "dvl-frac" });
  const wheel = el("div", { class: "dvl-wheel", html: WHEEL_SVG, attrs: { "aria-hidden": "true" } });
  const lamp = el("div", { class: "dvl-lamp", attrs: { "aria-hidden": "true" } });
  const belt = el("div", { class: "dvl-quot", attrs: { "aria-label": "몫 띠" } });
  const remPill = el("div", { class: "dvl-rem" });
  const stamp = el("div", { class: "dvl-stamp", attrs: { "aria-hidden": "true" } });
  const machine = el(
    "div",
    { class: "dvl-machine" },
    el("div", { class: "dvl-mhead" }, fracWin, wheel, lamp),
    belt,
    el("div", { class: "dvl-mfoot" }, remPill),
    stamp,
  );
  const stage = el("div", { class: "dvl-stage" }, machine);
  // ── mq6 패널: inst → eqs → qline(판단 질문, 선택지 바로 위) → ctl ──
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst" });
  const eqs = el("div", { class: "mq6-eqs" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "크랭크 한 번에 소수점 아래 몫이 한 자리씩! <b>나머지 필</b>을 잘 지켜봐요, 멈춤의 비밀이 숨어 있어요.",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ── 타이머(모든 지연은 여기로, cleanup에서 일괄 해제) ──
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  // ── 상태 ──
  let finished = false;
  let busy = true; // 국면 준비, 크랭크 연출 중 잠금
  let wheelDeg = 0;
  let cur: FracDef = F14;
  let rem = 0; // 지금 나머지
  let nd = 0; // 파낸 몫 자릿수
  let repeats = 0; // 같은 나머지가 되돌아온 횟수
  let ell: HTMLElement | null = null; // 몫 띠 끝 … 요소
  let predicted: PredKey | null = null;
  let predBtn: Partial<Record<PredKey, HTMLButtonElement>> = {};
  let bonusLeft: FracDef | null = null;

  function maybeFinish(): void {
    if (finished || chips.count() < 3) return;
    finished = true;
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  function setRem(v: number): void {
    remPill.classList.toggle("zero", v === 0);
    remPill.innerHTML = `나머지 <b>${v}</b>`;
    remPill.classList.remove("bump");
    void remPill.offsetWidth;
    remPill.classList.add("bump");
  }

  /** 기계에 새 분수를 장전(칩 페이드 아웃 → 리셋). */
  function loadFraction(def: FracDef): void {
    cur = def;
    rem = def.num;
    nd = 0;
    repeats = 0;
    ell = null;
    const olds = Array.from(belt.children) as HTMLElement[];
    olds.forEach((c) => {
      c.style.transition = "opacity .2s ease";
      c.style.opacity = "0";
    });
    const reset = (): void => {
      clear(belt);
      belt.appendChild(el("span", { class: "dvl-int", text: "0." }));
    };
    if (olds.length) later(reset, 210);
    else reset();
    lamp.classList.remove("stop");
    stamp.classList.remove("show");
    fracWin.innerHTML = mfmt(def.src);
    fracWin.classList.remove("pop");
    void fracWin.offsetWidth;
    fracWin.classList.add("pop");
    setRem(def.num);
  }

  function spinWheel(): void {
    wheelDeg += 180;
    const g = wheel.querySelector(".dvl-wheelg") as SVGGElement | null;
    if (g) g.style.transform = `rotate(${wheelDeg}deg)`;
  }

  function pushDigit(d: number): void {
    if (nd <= CHIP_MAX) {
      const c = el("span", { class: "dvl-digit", text: String(d) });
      if (ell) belt.insertBefore(c, ell);
      else belt.appendChild(c);
    } else {
      if (!ell) {
        ell = el("span", { class: "dvl-ell", text: "…" });
        belt.appendChild(ell);
      }
      ell.classList.remove("pop");
      void ell.offsetWidth;
      ell.classList.add("pop");
    }
  }

  /** 크랭크 한 바퀴: 휠 스핀 → 몫 칩 → 나머지 갱신 → onSettle. */
  function crank(onSettle: () => void): void {
    busy = true;
    haptic(HAPTIC.tap);
    spinWheel();
    lamp.classList.remove("go");
    void lamp.offsetWidth;
    lamp.classList.add("go");
    const before = rem;
    const r10 = rem * 10;
    const d = Math.floor(r10 / cur.den);
    rem = r10 % cur.den;
    if (!cur.finite && rem === before) repeats += 1;
    nd += 1;
    later(() => pushDigit(d), 240);
    later(() => setRem(rem), 400);
    later(onSettle, 560);
  }

  /** 판단 질문(예측): 선택지 바로 위 .mq6-q 강조 줄 + 자기설명형 버튼 2개. */
  function askPredict(q: string, onPicked: () => void): void {
    qline.innerHTML = q;
    predicted = null;
    predBtn = {};
    const row = el("div", { class: "mq6-choices" });
    (
      [
        ["stop", "멈춰요: 언젠가 나머지 0이 나와요"],
        ["go", "안 멈춰요: 소수점 아래가 끝없이 이어져요"],
      ] as [PredKey, string][]
    ).forEach(([k, label]) => {
      const b = el("button", { class: "mq6-choice", text: label, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (predicted !== null || finished) return;
        predicted = k;
        haptic(HAPTIC.select);
        b.classList.add("dvl-sel");
        row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
        toast("예측 완료! 크랭크를 돌려 직접 확인해요");
        onPicked();
      });
      predBtn[k] = b;
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    busy = false;
  }

  /** 크랭크(+선언) 버튼 장착. 나머지 0이면 정지, 안 멈추는 판은 선언이 완료 경로. */
  function armCrank(o: RunOpts): void {
    let declBtn: HTMLButtonElement | null = null;
    let resolved = false;
    const crankBtn = el("button", {
      class: "mq6-btn dvl-crank mq6-pop",
      text: "한 칸 더",
      attrs: { type: "button", "aria-label": "크랭크 돌리기, 몫을 한 자리 더 파기" },
    }) as HTMLButtonElement;
    ctl.appendChild(crankBtn);
    const settle = (): void => {
      if (rem === 0) {
        resolved = true;
        resolveRun(true, o);
        return;
      }
      if (!cur.finite) {
        if (repeats === 1) toast(`나머지가 또 ${rem}이에요! 아까와 똑같은 상황이 됐어요`);
        else if (repeats === 3) toast("같은 나머지에서는 같은 몫이 나와요, 계속 반복이죠");
        else if (nd > DECLARE_AT + 1) toast("아무리 돌려도 똑같아요, 이제 선언할 시간이에요!");
        if (nd >= DECLARE_AT && !declBtn) {
          if (!ell) {
            ell = el("span", { class: "dvl-ell", text: "…" });
            belt.appendChild(ell);
          }
          declBtn = el("button", {
            class: "mq6-btn dvl-declare mq6-pop",
            text: "영원히 안 멈춰요!",
            attrs: { type: "button", "aria-label": "이 나눗셈은 끝나지 않는다고 선언하기" },
          }) as HTMLButtonElement;
          ctl.appendChild(declBtn);
          helper.innerHTML = "크랭크를 아무리 돌려도 끝이 안 나요. 이럴 땐 <b>멈추지 않는다고 선언</b>하는 게 실험 완료예요!";
          declBtn.addEventListener("click", () => {
            if (busy || resolved) return;
            resolved = true;
            resolveRun(false, o);
          });
        }
      }
      busy = false;
    };
    crankBtn.addEventListener("click", () => {
      if (busy || resolved) return;
      crank(settle);
    });
    busy = false;
  }

  /** 판정: 정지 연출 또는 무한 선언 확정 + 예측 공개 + 목표 칩. */
  function resolveRun(stopped: boolean, o: RunOpts): void {
    busy = true;
    ctl.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
    stamp.textContent = stopped ? "유한" : "무한";
    stamp.classList.toggle("inf", !stopped);
    stamp.classList.remove("show");
    void stamp.offsetWidth;
    stamp.classList.add("show");
    if (stopped) lamp.classList.add("stop");
    haptic(HAPTIC.correct);
    eqs.appendChild(
      el("div", {
        class: "mq6-eq mq6-pop",
        html: `${mfmt(cur.eq)}<span>${stopped ? "나머지 0, 기계 정지!" : "나머지가 계속 살아 돌아요"}</span>`,
      }),
    );
    // 예측 공개: 정답 선택지는 초록, 빗나간 내 선택은 빨강
    const correct: PredKey = stopped ? "stop" : "go";
    const okBtn = predBtn[correct];
    if (okBtn) {
      okBtn.classList.add("ok");
      if (predicted && predicted !== correct) predBtn[predicted]?.classList.add("no");
    }
    let msg: string;
    if (o.bonus) msg = stopped ? "보너스 확인, 이 분수는 딱 멈춰요!" : "보너스 확인, 역시 안 멈추는 수였어요!";
    else if (!predicted) msg = stopped ? "나머지 0, 여기서 끝!" : "끝나지 않는 수예요!";
    else if (predicted === correct)
      msg = stopped ? "예측 적중! 나머지 0이 나오는 순간 끝났어요" : "예측 적중! 같은 나머지가 계속 돌아오면 영원히 안 끝나요";
    else msg = stopped ? "멈췄어요! 나머지가 0이 되면 나눗셈은 거기서 끝이에요" : "안 멈춰요! 같은 나머지가 계속 돌아오면 몫도 반복돼요";
    toast(msg);
    if (o.goal) chips.on(o.goal, GOAL_SUB[o.goal]);
    later(() => o.after?.(), 2000);
  }

  /* ── 국면 1: 1/4 ── */
  function startP1(): void {
    loadFraction(F14);
    inst.innerHTML = `첫 손님: ${mfmt("{1/4}")} 이에요. 크랭크 한 번에 소수점 아래 몫이 <b>한 자리씩</b> 나와요`;
    askPredict("이 나눗셈, 언젠가 멈출까요?", () => armCrank({ goal: "stop", after: startP2 }));
  }

  /* ── 국면 2: 1/6 ── */
  function startP2(): void {
    loadFraction(F16);
    inst.innerHTML = `두 번째 손님: ${mfmt("{1/6}")} 이에요. 이번에도 크랭크로 파 내려가요`;
    helper.innerHTML = "이번 손님은 어쩐지 느낌이 달라요. <b>나머지 필</b>에서 눈을 떼지 마세요!";
    askPredict("이번 나눗셈은 멈출까요?", () => armCrank({ goal: "nostop", after: startP3 }));
  }

  /* ── 국면 3: 3/8 vs 2/3 직접 선택 ── */
  function startP3(): void {
    inst.innerHTML = "마지막 실험: 이번엔 손님을 직접 골라요";
    helper.innerHTML = "멈출까요, 계속될까요? 이번엔 고르는 것부터 실력이에요!";
    qline.innerHTML = "어느 분수를 기계에 넣어 볼까요?";
    const row = el("div", { class: "mq6-choices" });
    [F38, F23].forEach((def) => {
      const b = el("button", {
        class: "mq6-choice",
        html: `${mfmt(def.src)} 넣기`,
        attrs: { type: "button" },
      }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (busy) return;
        busy = true;
        haptic(HAPTIC.select);
        bonusLeft = def === F38 ? F23 : F38;
        loadFraction(def);
        later(() => askPredict("이 분수의 나눗셈은 멈출까요?", () => armCrank({ goal: "third", after: offerBonus })), 340);
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    busy = false;
  }

  /* ── 판정 뒤 마무리 + 남은 분수 보너스 실험 ── */
  function offerBonus(): void {
    eqs.appendChild(
      el("div", {
        class: "mq6-concl mq6-pop",
        html: "나머지가 <b>0이 되는 순간</b> 소수는 딱 멈춰요. 나머지가 계속 살아 돌면 <b>영원히 계속</b>되고요!",
      }),
    );
    maybeFinish();
    helper.innerHTML = "실험 완료! 궁금하면 남은 분수도 넣어 봐요. 그냥 다음으로 넘어가도 좋아요.";
    qline.innerHTML = "";
    clear(ctl);
    const def = bonusLeft;
    if (!def) return;
    bonusLeft = null;
    const b = el("button", {
      class: "mq6-choice wide mq6-pop",
      html: `보너스: ${mfmt(def.src)} 도 넣어 보기`,
      attrs: { type: "button" },
    }) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (busy) return;
      haptic(HAPTIC.select);
      inst.innerHTML = `보너스 손님: ${mfmt(def.src)} 이에요. 크랭크로 바로 확인해요`;
      predicted = null;
      predBtn = {};
      loadFraction(def);
      clear(ctl);
      armCrank({ bonus: true, after: bonusDone });
    });
    ctl.appendChild(b);
    busy = false;
  }

  function bonusDone(): void {
    toast("두 분수 다 확인! 멈춤의 열쇠는 언제나 나머지예요");
    helper.innerHTML = `${mfmt("{3/8}")} 은 멈추고 ${mfmt("{2/3}")} 은 안 멈춰요. 왜 운명이 갈리는지는 다음 레슨의 비밀!`;
    qline.innerHTML = "";
    clear(ctl);
  }

  startP1();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
