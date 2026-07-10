// vsLab, 유리한 선택 랩(중2 수학 Ⅱ L4, 책 66~67쪽). 인원 스테퍼를 움직여 개인 요금과
// 단체 요금 막대를 실시간 비교, 손익이 뒤집히는 교차 인원을 찾는다(부등식 활용의 시각화).
// 무대: 요금표(개인 1인 4000원, 단체 정액 80000원 = 25명분 20% 할인, 수치 자체 제작) +
//       가로 막대 2개(개인 합계 4000x는 인원 비례 신축, 단체 정액은 고정, 값 라벨 상시 표시,
//       점선 = 단체 정액선) + 상태 배지 + 인원 x 스테퍼(±, 1~30).
// 국면 1: 예측(mq6-q: 몇 명부터 단체가 유리? 21명/20명/25명) → 목표 guess.
// 국면 2: 스테퍼 탐색, 20명 "같음! 본전"(같으면 유리 아님 함정) → 21명 역전(색 강조+배지)
//         → 예측 공개 → 부등식 4000x>80000, x>20(20 초과) 카드 → 목표 cross.
// 국면 3: 경계 검산(20명·21명 값 확인) + "딱 20명이면 이득?" 판단 질문 → 목표 verify.
// 문법: mboard+goalChips+mtoast+mq6 패널(inst→eqs→qline→ctl), CSS 트랜지션+setTimeout 체인
// (타이머 Set 일괄 해제), rAF 금지. 막대는 div width 트랜지션.
// 참조: relFreqLab(비교 막대·값 라벨), divLab(mq6 패널·예측 공개). 스타일: math2.css .vsl-*.

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

type PredKey = "g21" | "g20" | "g25";
type BadgeState = "ind" | "even" | "grp";

const UNIT = 4000; // 개인권 1인 요금
const FLAT = 80000; // 단체권 정액(25명분 20% 할인)
const X_MIN = 1;
const X_MAX = 30;
const SCALE = UNIT * X_MAX; // 막대 폭 100% 기준(120000원)
const MARK = (FLAT / SCALE) * 100; // 단체 정액선 위치(%)

const PREDS: { k: PredKey; label: string }[] = [
  { k: "g21", label: "21명부터: 개인 합계가 80000원을 처음 넘어서요" },
  { k: "g20", label: "20명부터: 80000÷4000이 딱 20이니까요" },
  { k: "g25", label: "25명부터: 원래 25명분 요금이니까요" },
];

const BADGE_TEXT: Record<BadgeState, string> = {
  ind: "지금은 개인이 유리",
  even: "같음! 본전",
  grp: "이제 단체가 유리!",
};

export const vsLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "guess", label: "예측", sub: "몇 명부터?" },
    { id: "cross", label: "역전 발견", sub: "교차 인원" },
    { id: "verify", label: "경계 검산", sub: "20 vs 21" },
  ]);

  const board = mboard(540);

  // ── 무대: 요금표 + 가로 막대 2개 + 상태 배지 + 인원 스테퍼 ──
  const subInd = el("span", { class: "vsl-sub" });
  const valInd = el("span", { class: "vsl-val" });
  const fillInd = el("div", { class: "vsl-fill ind" });
  const fillGrp = el("div", { class: "vsl-fill grp", style: `width:${MARK}%` });
  const badge = el("div", { class: "vsl-badge", attrs: { role: "status" } });
  const cntB = el("b", { text: "" });
  const minusB = el("button", {
    class: "vsl-step",
    text: "−",
    attrs: { type: "button", "aria-label": "인원 1명 줄이기" },
  });
  const plusB = el("button", {
    class: "vsl-step",
    text: "+",
    attrs: { type: "button", "aria-label": "인원 1명 늘리기" },
  });
  const stage = el(
    "div",
    { class: "vsl-stage" },
    el(
      "div",
      { class: "vsl-tickets" },
      el(
        "div",
        { class: "vsl-ticket" },
        el("span", { class: "cap", text: "개인권" }),
        el("span", { class: "val", text: "1명에 4000원" }),
      ),
      el(
        "div",
        { class: "vsl-ticket grp" },
        el("span", { class: "cap", text: "단체권(정액)" }),
        el("span", { class: "val", text: "80000원" }),
        el("span", { class: "note", text: "25명분 20% 할인, 25명 미만도 구매 가능" }),
      ),
    ),
    el(
      "div",
      { class: "vsl-bars" },
      el(
        "div",
        { class: "vsl-row" },
        el("span", { class: "vsl-blab" }, el("b", { text: "개인 합계" }), subInd),
        el("div", { class: "vsl-track" }, el("div", { class: "vsl-mark", style: `left:${MARK}%` }), fillInd),
        valInd,
      ),
      el(
        "div",
        { class: "vsl-row" },
        el("span", { class: "vsl-blab" }, el("b", { text: "단체 정액" }), el("span", { class: "vsl-sub", text: "인원 무관" })),
        el("div", { class: "vsl-track" }, el("div", { class: "vsl-mark", style: `left:${MARK}%` }), fillGrp),
        el("span", { class: "vsl-val", text: `${FLAT}원` }),
      ),
    ),
    badge,
    el("div", { class: "vsl-counter" }, minusB, el("span", { class: "vsl-count" }, "인원 ", cntB, "명"), plusB),
  );

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
    html: "인원(x)이 늘면 <b>개인 합계 막대만</b> 자라요. 단체 정액은 몇 명이든 80000원 그대로!",
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
  let x = 18;
  let phase: 1 | 2 | 3 = 1;
  let stepOn = false; // 예측 전에는 스테퍼 잠금
  let seen20 = false;
  let seen21 = false;
  let finished = false;
  let predicted: PredKey | null = null;
  let badgeState: BadgeState | "" = "";
  const predBtn: Partial<Record<PredKey, HTMLButtonElement>> = {};

  function maybeFinish(): void {
    if (finished || chips.count() < 3) return;
    finished = true;
    haptic(HAPTIC.done);
    helper.innerHTML = `요금 비교는 부등식 한 줄로 끝나요: ${mfmt("4000x>80000")}. 경계(20명) 검산까지 하면 완벽!`;
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  function setBadge(st: BadgeState): void {
    if (st === badgeState) return;
    badgeState = st;
    badge.textContent = BADGE_TEXT[st];
    badge.className = `vsl-badge ${st}`;
    void badge.offsetWidth; // 팝 애니메이션 재시작
    badge.classList.add("pop");
  }

  /** 인원 x 기준으로 막대·라벨·배지·스테퍼를 갱신(막대 폭은 CSS 트랜지션). */
  function paint(): void {
    const sum = UNIT * x;
    fillInd.style.width = `${(sum / SCALE) * 100}%`;
    valInd.textContent = `${sum}원`;
    subInd.innerHTML = mfmt(`4000×${x}`);
    cntB.textContent = String(x);
    minusB.disabled = !stepOn || x <= X_MIN;
    plusB.disabled = !stepOn || x >= X_MAX;
    const st: BadgeState = sum < FLAT ? "ind" : sum === FLAT ? "even" : "grp";
    fillInd.classList.toggle("best", st === "ind");
    fillInd.classList.toggle("over", st === "grp");
    fillGrp.classList.toggle("best", st === "grp");
    setBadge(st);
  }

  function onStep(d: number): void {
    const nx = Math.min(X_MAX, Math.max(X_MIN, x + d));
    if (nx === x) return;
    x = nx;
    haptic(HAPTIC.tap);
    paint();
    if (phase !== 2) return;
    if (x === 20 && !seen20) {
      seen20 = true;
      haptic(HAPTIC.select);
      toast("4000×20 = 80000, 단체 정액과 딱 같아요. 같으면 유리한 게 아니라 본전!");
    }
    if (x === 21 && !seen21) {
      seen21 = true;
      onCross();
    }
  }
  minusB.addEventListener("click", () => onStep(-1));
  plusB.addEventListener("click", () => onStep(1));

  /* ── 국면 1: 예측 ── */
  function startP1(): void {
    inst.innerHTML = "개인권은 1명에 <b>4000원</b>, 단체권은 몇 명이든 <b>정액 80000원</b>이에요";
    qline.innerHTML = "몇 명부터 단체권이 유리해질까요?";
    const row = el("div", { class: "mq6-choices" });
    for (const { k, label } of PREDS) {
      const b = el("button", { class: "mq6-choice wide", text: label, attrs: { type: "button" } });
      b.addEventListener("click", () => {
        if (predicted !== null || finished) return;
        predicted = k;
        haptic(HAPTIC.select);
        b.classList.add("vsl-sel");
        row.querySelectorAll("button").forEach((n) => (n.disabled = true));
        chips.on("guess", "선택 완료");
        toast("예측 완료! 이제 ± 버튼으로 직접 확인해요");
        later(startP2, 700);
      });
      predBtn[k] = b;
      row.appendChild(b);
    }
    clear(ctl);
    ctl.appendChild(row);
  }

  /* ── 국면 2: 스테퍼로 교차점 탐색 ── */
  function startP2(): void {
    if (finished) return;
    phase = 2;
    qline.innerHTML = "";
    inst.innerHTML = "± 버튼으로 인원을 바꿔 <b>역전이 일어나는 순간</b>을 찾아요";
    helper.innerHTML = "막대 위 점선이 단체 정액 80000원 선이에요. 개인 막대가 저 선을 넘는 순간이 역전!";
    stepOn = true;
    paint();
  }

  /** 21명 도달: 역전 연출 + 예측 공개 + 부등식 카드 완성. */
  function onCross(): void {
    haptic(HAPTIC.done);
    toast("역전! 개인 막대가 단체 정액선을 넘어섰어요");
    const okB = predBtn.g21;
    if (okB) {
      okB.classList.add("ok");
      if (predicted && predicted !== "g21") predBtn[predicted]?.classList.add("no");
    }
    later(() => {
      eqs.appendChild(
        el("div", {
          class: "mq6-eq mq6-pop",
          html: `단체가 유리 = 개인 합계가 정액보다 비쌀 때: ${mfmt("4000x>80000")}`,
        }),
      );
    }, 700);
    later(() => {
      eqs.appendChild(
        el("div", {
          class: "mq6-eq mq6-pop",
          html: `양변을 4000으로 나누면 ${mfmt("x>20")}: x는 <b>20 초과</b>, 자연수라 <b>21명부터</b>!`,
        }),
      );
      chips.on("cross", "21명부터!");
      if (predicted === "g20") toast("20명은 같아지는 지점이었죠. 유리는 그다음, 21명부터예요");
      else if (predicted === "g25") toast("25명을 기다릴 필요 없어요. 21명이면 벌써 단체가 싸요");
      else toast("예측 적중! 21명부터 단체가 유리해요");
    }, 1600);
    later(startP3, 3400);
  }

  /* ── 국면 3: 경계 검산(확인하기) + 판단 질문 ── */
  function startP3(): void {
    if (finished) return;
    phase = 3;
    inst.innerHTML = "마지막 관문: <b>경계에서 검산</b>해요. 두 인원을 각각 확인!";
    helper.innerHTML = "부등식 활용의 마무리는 언제나 검산이에요.";
    const row = el("div", { class: "mq6-choices" });
    const done = new Set<string>();
    const defs: { k: string; cx: number; label: string; result: string }[] = [
      {
        k: "c20",
        cx: 20,
        label: "20명 검산: 4000×20 계산하기",
        result: `${mfmt("4000×20=80000")}<br>단체 정액과 같음, 본전!`,
      },
      {
        k: "c21",
        cx: 21,
        label: "21명 검산: 4000×21 계산하기",
        result: `${mfmt("4000×21=84000")}<br>84000이 더 커요, 단체 유리!`,
      },
    ];
    for (const { k, cx, label, result } of defs) {
      const b = el("button", { class: "mq6-choice", text: label, attrs: { type: "button" } });
      b.addEventListener("click", () => {
        if (finished || done.has(k)) return;
        done.add(k);
        haptic(HAPTIC.correct);
        x = cx;
        paint();
        b.classList.add("ok");
        b.disabled = true;
        b.innerHTML = result;
        if (done.size >= 2) {
          later(() => {
            eqs.appendChild(
              el("div", {
                class: "mq6-eq mq6-pop",
                html: "검산 결과: 20명은 <b>80000원 같음(본전)</b>, 21명은 <b>84000원 &gt; 80000원(단체 유리)</b>",
              }),
            );
            later(askFinal, 900);
          }, 800);
        }
      });
      row.appendChild(b);
    }
    clear(ctl);
    ctl.appendChild(row);
  }

  function askFinal(): void {
    if (finished) return;
    qline.innerHTML = "친구들이 딱 20명 모였어요. 단체권을 사면 이득일까요?";
    const row = el("div", { class: "mq6-choices" });
    let solved = false;
    (
      [
        ["이득은 아니에요: 요금이 같아서 본전일 뿐이에요", true],
        ["이득이에요: 20명이면 단체가 유리해요", false],
        ["손해예요: 개인권 합계가 더 싸요", false],
      ] as [string, boolean][]
    ).forEach(([label, good], i) => {
      const b = el("button", { class: "mq6-choice wide", text: label, attrs: { type: "button" } });
      b.addEventListener("click", () => {
        if (finished || solved) return;
        if (good) {
          solved = true;
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((n) => (n.disabled = true));
          b.classList.add("ok");
          eqs.appendChild(
            el("div", {
              class: "mq6-concl mq6-pop",
              html:
                "경계가 포함되면 '이상(≥)', 포함되지 않으면 '초과(&gt;)'. 같은 요금은 유리가 아니니 " +
                `답은 ${mfmt("x>20")}, <b>20 초과</b>! 딱 20명은 본전, 진짜 유리는 <b>21명부터</b>예요.`,
            }),
          );
          chips.on("verify", "검산 완료!");
          later(maybeFinish, 1200);
        } else {
          haptic(HAPTIC.cross);
          toast(
            i === 1
              ? "80000원 = 80000원, 같은 건 유리가 아니라 본전이에요. 유리는 21명부터!"
              : "20명의 개인 합계도 80000원이라 더 싸지 않아요. 딱 같은 본전이에요",
          );
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
  }

  paint();
  startP1();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
