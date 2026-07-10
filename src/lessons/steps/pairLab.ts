// pairLab, 미지수 2개 랩(중2 수학 Ⅱ L5, 책 74~75쪽). (x, y) 값 조합을 일차방정식에
// 대입해 보며 "해가 여러 개"임을 발견하고 순서쌍 (x, y) 표기로 수집한다.
// 무대: 방정식 카드 x+2y=7(자연수 해만 배지) + 대입 계산 줄(좌변 실시간 미리보기 → 값 →
//       참/거짓 판정 핀) + x·y ± 스테퍼 다이얼 2개(1~9) + [대입] 버튼 + 수집 선반(순서쌍 칩).
// 국면 1: (1,3)(3,2)(5,1) 세 해 수집 → 목표 find. 짝수 x는 y가 분수, x=7은 y=0 함정을
//         실패 토스트로 교정("y도 자연수여야").
// 국면 2: 순서 함정, mq6-q "(3, 2)가 해면 (2, 3)도 해?" 판정 → x=2, y=3 자동 대입 검증으로
//         거짓 확인 → "순서가 바뀌면 다른 순서쌍!" → 목표 order.
// 국면 3: 3x+y=11로 교체, (1,8)(2,5)(3,2) 중 2개 빠른 수집 → 목표 more.
// 문법: mboard+goalChips+mtoast+mq6 패널(inst→eqs→qline→ctl), CSS 트랜지션+setTimeout 체인
// (타이머 Set 일괄 해제), rAF 금지. 격자는 쓰지 않고 선반 수집만.
// 참조: eqTruth(대입 판정 연출), divLab(mq6 패널·국면 전환). 스타일: math2.css .prl-*.

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

interface EqDef {
  src: string; // mfmt 마크업
  rhs: number;
  lhs: (x: number, y: number) => number;
  disp: (x: number, y: number) => string; // 대입식 mfmt 마크업
}

const EQ1: EqDef = {
  src: "x+2y=7",
  rhs: 7,
  lhs: (x, y) => x + 2 * y,
  disp: (x, y) => `${x}+2×${y}`,
};
const EQ2: EqDef = {
  src: "3x+y=11",
  rhs: 11,
  lhs: (x, y) => 3 * x + y,
  disp: (x, y) => `3×${x}+${y}`,
};

const V_MIN = 1;
const V_MAX = 9;

const P1_MSG = [
  "첫 해 발견! 해 하나를 순서쌍 (x, y)로 적어 선반에 보관해요",
  "두 번째 해! 방정식 하나에 해가 벌써 2개예요",
  "3개 모두 수집! x+2y=7의 자연수 해는 이 셋이 전부예요",
];
const P3_MSG = ["좋아요, 새 방정식도 해가 하나가 아니네요!", "2개 수집 완료! 이 방정식도 해가 여러 개예요"];

export const pairLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "find", label: "해 수집", sub: "3개 찾기" },
    { id: "order", label: "순서 판정", sub: "뒤집으면?" },
    { id: "more", label: "새 방정식", sub: "또 여러 개?" },
  ]);

  const board = mboard(560);

  // ── 무대: 방정식 카드 + 대입 계산 줄 + 다이얼 2개 + 대입 버튼 + 수집 선반 ──
  const eqBody = el("span", { html: mfmt(EQ1.src) });
  const eqCard = el("div", { class: "prl-eq" }, el("span", { class: "prl-cond", text: "자연수 해만!" }), eqBody);
  const calcEx = el("span");
  const calcRes = el("span", { class: "prl-res" });
  const verdict = el("span", { class: "prl-verdict", text: "?", attrs: { "aria-label": "판정 대기" } });
  const calc = el("div", { class: "prl-calc" }, calcEx, calcRes, verdict);

  const mkDial = (
    name: "x" | "y",
  ): { root: HTMLElement; val: HTMLElement; minus: HTMLButtonElement; plus: HTMLButtonElement } => {
    const val = el("span", { class: "prl-dv" });
    const minus = el("button", {
      class: "prl-db",
      text: "−",
      attrs: { type: "button", "aria-label": `${name} 값 1 줄이기` },
    });
    const plus = el("button", {
      class: "prl-db",
      text: "+",
      attrs: { type: "button", "aria-label": `${name} 값 1 늘리기` },
    });
    const root = el("div", { class: "prl-dial" }, el("span", { class: "prl-dlab", html: mfmt(name) }), minus, val, plus);
    return { root, val, minus, plus };
  };
  const dx = mkDial("x");
  const dy = mkDial("y");
  const subBtn = el("button", {
    class: "mq6-btn prl-go pulse",
    text: "대입",
    attrs: { type: "button", "aria-label": "고른 x와 y를 식에 대입해 참인지 검사하기" },
  });
  const slab = el("div", { class: "prl-slab", text: "수집 선반 0/3" });
  const chipsRow = el("div", { class: "prl-chips" });
  const stage = el(
    "div",
    { class: "prl-stage" },
    eqCard,
    calc,
    el("div", { class: "prl-dials" }, dx.root, dy.root),
    subBtn,
    el("div", { class: "prl-shelf" }, slab, chipsRow),
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
    html: "x와 y를 고르고 <b>대입</b>! 좌변이 우변과 같아지면 그 (x, y)가 해예요. 자연수만 인정!",
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
  let cur = EQ1;
  let x = 2;
  let y = 2;
  let need = 3;
  let phase: 1 | 2 | 3 = 1;
  let armed = true; // 다이얼·대입 버튼 사용 가능 국면인가
  let busy = false; // 대입 연출 중 잠금
  let finished = false;
  const collected = new Set<string>();

  function popNode(n: HTMLElement): void {
    n.classList.remove("pop");
    void n.offsetWidth;
    n.classList.add("pop");
  }

  /** 다이얼을 움직일 때마다 좌변 미리보기를 갱신, 판정 핀은 대기로 리셋. */
  function previewCalc(): void {
    calcEx.innerHTML = mfmt(cur.disp(x, y));
    calcRes.innerHTML = `= <span class="q">?</span>`;
    verdict.textContent = "?";
    verdict.className = "prl-verdict";
    verdict.setAttribute("aria-label", "판정 대기");
    calc.classList.remove("bad");
  }

  function paintDials(): void {
    dx.val.textContent = String(x);
    dy.val.textContent = String(y);
    const on = armed && !busy;
    dx.minus.disabled = !on || x <= V_MIN;
    dx.plus.disabled = !on || x >= V_MAX;
    dy.minus.disabled = !on || y <= V_MIN;
    dy.plus.disabled = !on || y >= V_MAX;
    subBtn.disabled = !on;
    previewCalc();
  }

  function bump(k: "x" | "y", d: number): void {
    if (busy || !armed || finished) return;
    const v = k === "x" ? x : y;
    const nv = Math.min(V_MAX, Math.max(V_MIN, v + d));
    if (nv === v) return;
    if (k === "x") x = nv;
    else y = nv;
    haptic(HAPTIC.tap);
    paintDials();
    popNode(k === "x" ? dx.val : dy.val);
  }
  dx.minus.addEventListener("click", () => bump("x", -1));
  dx.plus.addEventListener("click", () => bump("x", 1));
  dy.minus.addEventListener("click", () => bump("y", -1));
  dy.plus.addEventListener("click", () => bump("y", 1));

  /** 대입 연출: 좌변 값 공개 → 참/거짓 판정 핀 → onDone(ok). */
  function runSubst(onDone: (ok: boolean) => void): void {
    busy = true;
    subBtn.classList.remove("pulse");
    paintDials();
    haptic(HAPTIC.tap);
    const lv = cur.lhs(x, y);
    const ok = lv === cur.rhs;
    later(() => {
      calcRes.innerHTML = `= <b>${lv}</b>`;
      popNode(calcRes);
      haptic(HAPTIC.tap);
    }, 300);
    later(() => {
      if (ok) {
        verdict.textContent = "참!";
        verdict.className = "prl-verdict ok";
        verdict.setAttribute("aria-label", "판정 참");
        haptic(HAPTIC.correct);
      } else {
        verdict.textContent = "거짓";
        verdict.className = "prl-verdict no";
        verdict.setAttribute("aria-label", "판정 거짓");
        calc.classList.add("bad");
        haptic(HAPTIC.cross);
      }
      popNode(verdict);
      later(() => onDone(ok), 420);
    }, 840);
  }
  subBtn.addEventListener("click", () => {
    if (busy || !armed || finished) return;
    runSubst(onCollect);
  });

  /** 실패 시 오개념 교정 문구(짝수 x의 분수 y, x=7의 y=0, 너무 큰 x). */
  function hintOf(): string {
    const lv = cur.lhs(x, y);
    if (cur === EQ1) {
      if (x === 7) return "아깝게 x=7! 그럼 y=0이어야 하는데, 0은 자연수가 아니에요";
      if (x > 7) return "x가 너무 커요! x 혼자서 벌써 7을 넘죠. x를 줄여 봐요";
      if (x % 2 === 0) return `x=${x}(짝수)면 2y=${7 - x}: y가 ${(7 - x) / 2}가 되어야 해서 자연수 해가 없어요`;
      return `좌변이 ${lv}, 7이 아니에요. x가 ${x}일 때 2y는 얼마여야 할까요?`;
    }
    if (3 * x > 11) return `x가 너무 커요! 3×${x}=${3 * x}, 벌써 11을 넘죠. x를 줄여 봐요`;
    return `좌변이 ${lv}, 11이 아니에요. y가 몇이면 딱 11이 될지 3×${x}에 더해 봐요`;
  }

  function unlock(): void {
    busy = false;
    paintDials();
  }

  /** 수집 국면(1·3)의 대입 결과 처리. 판정 핀을 잠깐 보여 준 뒤 잠금 해제. */
  function onCollect(ok: boolean): void {
    if (!ok) {
      toast(hintOf());
      later(unlock, 900);
      return;
    }
    const key = `${x},${y}`;
    if (collected.has(key)) {
      toast("이미 선반에 있는 순서쌍이에요! 다른 조합을 찾아요");
      later(unlock, 700);
      return;
    }
    collected.add(key);
    chipsRow.appendChild(
      el("span", { class: "prl-pair", text: `(${x}, ${y})`, attrs: { "aria-label": `순서쌍 x=${x}, y=${y}` } }),
    );
    slab.textContent = `수집 선반 ${collected.size}/${need}`;
    if (phase === 3 && key === "3,2") toast("(3, 2)는 아까 첫 방정식의 해이기도 했죠? 이 우연은 다음 레슨의 주인공이에요");
    else toast((phase === 1 ? P1_MSG : P3_MSG)[collected.size - 1] ?? "해 발견!");
    if (collected.size >= need) {
      if (phase === 1) findDone();
      else moreDone();
    } else {
      later(unlock, 700);
    }
  }

  /* ── 국면 1: x+2y=7의 자연수 해 3개 수집 ── */
  function startP1(): void {
    inst.innerHTML = `첫 임무: ${mfmt("x+2y=7")} 을 참으로 만드는 자연수 (x, y)를 <b>3개 전부</b> 찾아요`;
    paintDials();
  }

  function findDone(): void {
    chips.on("find", "3개 수집!");
    armed = false;
    paintDials();
    later(startP2, 1600);
  }

  /* ── 국면 2: 순서쌍 순서 함정 판정 ── */
  function startP2(): void {
    if (finished) return;
    phase = 2;
    busy = false;
    inst.innerHTML = "선반의 <b>(3, 2)</b>가 보이죠? 숫자를 뒤집은 (2, 3)이 궁금해져요";
    qline.innerHTML = "(3, 2)는 해였어요. 그럼 (2, 3)도 같은 해일까요?";
    const row = el("div", { class: "mq6-choices" });
    let solved = false;
    (
      [
        ["아니요: 순서가 바뀌면 다른 순서쌍이에요", true],
        ["네: 같은 숫자 2와 3이니까 똑같아요", false],
      ] as [string, boolean][]
    ).forEach(([label, good]) => {
      const b = el("button", { class: "mq6-choice wide", text: label, attrs: { type: "button" } });
      b.addEventListener("click", () => {
        if (finished || solved) return;
        if (good) {
          solved = true;
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((n) => (n.disabled = true));
          b.classList.add("ok");
          toast("그 감각을 대입으로 증명해요! x=2, y=3을 넣어 볼게요");
          later(verifySwap, 900);
        } else {
          haptic(HAPTIC.cross);
          toast("숫자가 같아도 자리가 다르면 대입 값이 달라져요. 앞이 x, 뒤가 y!");
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
  }

  /** (2, 3)을 다이얼에 자동 장전하고 대입 검증(거짓 확인). */
  function verifySwap(): void {
    if (finished) return;
    x = 2;
    y = 3;
    paintDials();
    popNode(dx.val);
    popNode(dy.val);
    haptic(HAPTIC.select);
    later(() => runSubst(orderDone), 700);
  }

  function orderDone(): void {
    eqs.appendChild(
      el("div", {
        class: "mq6-eq mq6-pop",
        html: `(3, 2) 대입: ${mfmt("3+2×2=7")} 참! (2, 3) 대입: ${mfmt("2+2×3=8")} <b>거짓</b>!`,
      }),
    );
    chips.on("order", "순서가 생명!");
    later(() => {
      eqs.appendChild(
        el("div", {
          class: "mq6-concl mq6-pop",
          html: "순서쌍은 <b>순서가 생명</b>: 앞이 x, 뒤가 y예요. (3, 2)와 (2, 3)은 서로 다른 순서쌍!",
        }),
      );
      later(startP3, 1800);
    }, 1000);
  }

  /* ── 국면 3: 3x+y=11 빠른 수집(2개) ── */
  function startP3(): void {
    if (finished) return;
    phase = 3;
    cur = EQ2;
    collected.clear();
    need = 2;
    x = 1;
    y = 1;
    chipsRow.querySelectorAll(".prl-pair").forEach((c) => c.classList.add("dim"));
    slab.textContent = "수집 선반 0/2";
    eqBody.innerHTML = mfmt(EQ2.src);
    eqCard.classList.remove("swap");
    void eqCard.offsetWidth;
    eqCard.classList.add("swap");
    qline.innerHTML = "";
    inst.innerHTML = `새 방정식 ${mfmt("3x+y=11")} 등장! 이번엔 해를 <b>2개만</b> 빠르게 수집해요`;
    helper.innerHTML = "요령은 같아요. x를 하나 정하면 y가 얼마여야 할지 보여요!";
    clear(ctl);
    armed = true;
    busy = false;
    haptic(HAPTIC.select);
    paintDials();
  }

  function moreDone(): void {
    chips.on("more", "2개 수집!");
    armed = false;
    paintDials();
    eqs.appendChild(
      el("div", {
        class: "mq6-concl mq6-pop",
        html: "미지수가 2개면 해가 <b>여러 개</b>! 그 하나하나를 순서쌍 (x, y)로 적어요. 이런 방정식의 정식 이름은 다음 카드에서!",
      }),
    );
    later(finish, 1400);
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    haptic(HAPTIC.done);
    helper.innerHTML = "해가 하나뿐이던 중1 방정식과 달라요. <b>미지수 2개 = 해 여러 개</b>, 표기는 순서쌍 (x, y)!";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  startP1();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
