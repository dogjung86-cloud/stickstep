// shiftLab, 무한 꼬리 지우개(중2 수학 Ⅰ L4 기함, 책 20~22쪽). 순환소수 x에 10의 거듭제곱을
// 곱하면 소수점만 오른쪽으로 미끄러진다(숫자 행렬은 그대로!). 두 식의 꼬리 무늬가 나란해지면
// 빼기 한 방으로 무한 꼬리가 통째로 소멸, 남는 건 유한한 등식 9x=7. 그렇게 분수를 잡는다.
// 판 1: x=0.777…, ×10 한 칸(정석 경로). 판 2: x=0.454545…, ×10을 당기면 꼬리가 어긋나는
// 교육적 실패 → ×100(마디 길이만큼!)으로 재도전 → 99x=45 → 45/99 → 약분 5/11.
// 문법: mboard+goalChips+mtoast, CSS 트랜지션+setTimeout 체인(타이머 Set 일괄 해제), rAF 금지.
// 소수점(닷)은 absolute로 셀 사이를 미끄러지고, 숫자 셀은 고정(×10=점이 오른쪽 한 칸).
import { el } from "../../core/dom";
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

const PITCH = 26; // 셀 간격(px) — .sfl-cell 22px + gap 4px
const TAIL_N = 8; // 소수점 아래 표시 자릿수(+ … 셀)

interface StageDef {
  id: "erase" | "frac"; // 완주 시 켜질 목표
  intro: string;
  q: string; // 레버 위 판단 질문
  tail: string; // 순환 꼬리(마디 반복으로 TAIL_N 채움)
  levers: (1 | 2)[]; // 제공 레버(10^1, 10^2)
  correct: 1 | 2;
  coef: number; // 10^correct − 1
  rhs: number; // 빼고 남는 정수
  frac: [number, number];
  reduced?: [number, number];
}

const STAGES: StageDef[] = [
  {
    id: "erase",
    intro: "끝없는 0.777…을 <b>x라고 부르기로 해요</b>. 이제 이 수를 통째로 다룰 수 있어요!",
    q: "소수점을 한 칸 밀면(×10) 두 식의 꼬리는 어떻게 될까요?",
    tail: "7",
    levers: [1],
    correct: 1,
    coef: 9,
    rhs: 7,
    frac: [7, 9],
  },
  {
    id: "frac",
    intro: "이번엔 x=0.454545…, <b>마디가 두 글자</b>예요.",
    q: "몇 배로 밀어야 꼬리 무늬가 나란해질까요?",
    tail: "45",
    levers: [1, 2],
    correct: 2,
    coef: 99,
    rhs: 45,
    frac: [45, 99],
    reduced: [5, 11],
  },
];

/** 숫자 행(레이블 + 셀 스트립 + 미끄러지는 소수점). */
interface Row {
  el: HTMLElement;
  labEl: HTMLElement;
  cells: HTMLElement[]; // [0]=정수부 0, 이후 꼬리, 마지막 … 셀
  dot: HTMLElement;
  setDot(pos: number, animate?: boolean): void;
}

function makeRow(label: string, tail: string): Row {
  const labEl = el("span", { class: "sfl-lab", html: mfmt(label) });
  const eq = el("span", { class: "sfl-eq", text: "=" });
  const strip = el("span", { class: "sfl-strip" });
  const cells: HTMLElement[] = [];
  const digits = "0" + tail.repeat(Math.ceil(TAIL_N / tail.length)).slice(0, TAIL_N);
  for (const d of digits) {
    const c = el("span", { class: "sfl-cell", text: d });
    cells.push(c);
    strip.appendChild(c);
  }
  const dots = el("span", { class: "sfl-cell more", text: "…" });
  strip.appendChild(dots);
  cells.push(dots);
  const dot = el("span", { class: "sfl-dot" });
  strip.appendChild(dot);
  const row = el("div", { class: "sfl-row" }, labEl, eq, strip);
  const setDot = (pos: number, animate = true): void => {
    dot.style.transition = animate ? "left .5s cubic-bezier(.34,1.35,.5,1)" : "none";
    dot.style.left = `${pos * PITCH - 5}px`;
    // 소수점이 지나간 맨 앞 0은 흐려진다(04.5 → 4.5로 읽히게)
    cells[0].classList.toggle("dim", pos > 1);
  };
  setDot(1, false);
  return { el: row, labEl, cells, dot, setDot };
}

export const shiftLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "shift", label: "꼬리 맞추기", sub: "소수점 밀기" },
    { id: "erase", label: "무한 소거", sub: "빼기 한 방" },
    { id: "frac", label: "함정 돌파", sub: "마디 두 글자" },
  ]);
  const board = mboard(300);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(goals.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const T = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let stageIdx = 0;
  let busy = false;

  function maybeDone(): void {
    if (goals.count() < 3) return;
    helper.innerHTML = "무한 꼬리는 <b>빼기 한 방</b>에 사라져요. 이 기술이 순환소수를 분수로 바꾸는 열쇠예요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "수학 용어 정복하기");
  }

  function spawnStage(i: number): void {
    stageIdx = i;
    const st = STAGES[i];
    board.querySelector(".sfl-stage")?.remove();
    const stage = el("div", { class: "sfl-stage" });
    board.appendChild(stage);
    helper.innerHTML = st.intro;

    const baseRow = makeRow("x", st.tail);
    const qline = el("div", { class: "sfl-q", text: st.q });
    const levers = el("div", { class: "sfl-levers" });
    const rowsBox = el("div", { class: "sfl-rows" }, baseRow.el);
    const actions = el("div", { class: "sfl-actions" });
    stage.append(rowsBox, qline, levers, actions);

    const leverBtns = st.levers.map((pow) => {
      const b = el("button", {
        class: "sfl-btn lever",
        attrs: { type: "button" },
        html: `${mfmt(`×${pow === 1 ? "10" : "100"}`)}<span class="sfl-bs">${pow === 1 ? "한 칸 밀기" : "두 칸 밀기"}</span>`,
      });
      b.addEventListener("click", () => pullLever(pow));
      levers.appendChild(b);
      return b;
    });

    let topRow: Row | null = null;

    function setLevers(enabled: boolean): void {
      leverBtns.forEach((b) => (b.disabled = !enabled));
    }

    function pullLever(pow: 1 | 2): void {
      if (busy) return;
      busy = true;
      setLevers(false);
      haptic(HAPTIC.select);
      // 10x(또는 100x) 행이 위에 나타난다 — 숫자 행렬은 base와 동일, 소수점만 민다
      topRow = makeRow(pow === 1 ? "10x" : "100x", st.tail);
      topRow.el.classList.add("enter");
      rowsBox.prepend(topRow.el);
      T(() => topRow!.el.classList.remove("enter"), 30);
      // 소수점 밀기 — ×100은 두 칸을 한 칸씩(두 번 곱한 것과 같음이 몸으로 읽히게)
      T(() => topRow!.setDot(2), 420);
      if (pow === 2) T(() => topRow!.setDot(3), 980);
      T(() => checkAlign(pow), pow === 2 ? 1560 : 1000);
    }

    function tailPairs(pow: 1 | 2): [HTMLElement, HTMLElement, boolean][] {
      // 위 행 소수점 아래 i번째 칸 ↔ 아래 행 소수점 아래 i번째 칸
      const out: [HTMLElement, HTMLElement, boolean][] = [];
      const digits = "0" + st.tail.repeat(Math.ceil(TAIL_N / st.tail.length)).slice(0, TAIL_N);
      for (let i = 0; ; i++) {
        const ti = 1 + pow + i;
        const bi = 1 + i;
        if (ti >= TAIL_N + 1 || bi >= TAIL_N + 1) break;
        out.push([topRow!.cells[ti], baseRow.cells[bi], digits[ti] === digits[bi]]);
      }
      return out;
    }

    function checkAlign(pow: 1 | 2): void {
      const pairs = tailPairs(pow);
      const ok = pairs.every(([, , same]) => same);
      if (ok) {
        pairs.forEach(([a, b], k) =>
          T(() => {
            a.classList.add("pair");
            b.classList.add("pair");
          }, k * 70),
        );
        T(() => {
          haptic(HAPTIC.correct);
          toast("꼬리 무늬가 나란해요! 이제 빼면 전부 지워져요");
          if (goals.on("shift")) void 0;
          showSubtract(pow);
          busy = false;
        }, pairs.length * 70 + 260);
      } else {
        pairs.forEach(([a, b, same], k) => {
          if (!same)
            T(() => {
              a.classList.add("bad");
              b.classList.add("bad");
            }, k * 60);
        });
        T(() => {
          topRow!.el.classList.add("shake");
          haptic(HAPTIC.wrong);
          toast("꼬리 무늬가 어긋나요! 45와 54, 빼도 무한 꼬리가 남아요. 마디 길이만큼 밀어야 해요");
        }, pairs.length * 60 + 200);
        T(() => {
          topRow!.el.classList.add("leave");
          baseRow.cells.forEach((c) => c.classList.remove("bad"));
        }, 2300);
        T(() => {
          topRow!.el.remove();
          topRow = null;
          setLevers(true);
          busy = false;
        }, 2700);
      }
    }

    function showSubtract(pow: 1 | 2): void {
      qline.textContent = "위에서 아래를 빼면?";
      const sub = el("button", { class: "sfl-btn go pulse", attrs: { type: "button" }, html: `${mfmt(pow === 1 ? "10x-x" : "100x-x")} 빼기` });
      actions.appendChild(sub);
      sub.addEventListener("click", () => {
        if (busy) return;
        busy = true;
        sub.disabled = true;
        sub.classList.remove("pulse");
        haptic(HAPTIC.select);
        const pairs = tailPairs(pow);
        // 꼬리 쌍이 왼쪽부터 짝지어 소멸 + … 셀도 함께
        pairs.forEach(([a, b], k) =>
          T(() => {
            a.classList.add("poof");
            b.classList.add("poof");
            if (k === pairs.length - 1) {
              // 마지막 셀은 … 표시(cells[TAIL_N+1]) — 꼬리와 함께 사라진다
              topRow!.cells[TAIL_N + 1].classList.add("poof");
              baseRow.cells[TAIL_N + 1].classList.add("poof");
            }
          }, 160 + k * 110),
        );
        T(() => showResult(pow), 160 + pairs.length * 110 + 480);
      });
    }

    function showResult(pow: 1 | 2): void {
      rowsBox.classList.add("collapse");
      qline.textContent = "";
      actions.innerHTML = "";
      const res = el("div", { class: "sfl-result", html: mfmt(`${st.coef}x=${st.rhs}`) });
      stage.appendChild(res);
      T(() => res.classList.add("show"), 40);
      toast(`무한 꼬리가 통째로 사라졌어요! 남은 건 유한한 식, ${st.coef}x=${st.rhs}`);
      const div = el("button", {
        class: "sfl-btn go pulse",
        attrs: { type: "button" },
        html: `양변을 ${st.coef}로 나누기`,
      });
      actions.appendChild(div);
      div.addEventListener("click", () => {
        div.remove();
        haptic(HAPTIC.correct);
        const fr = el("div", { class: "sfl-frac", html: mfmt(`x={${st.frac[0]}/${st.frac[1]}}`) });
        stage.appendChild(fr);
        T(() => fr.classList.add("show"), 40);
        if (st.reduced) {
          T(() => {
            fr.innerHTML = mfmt(`x={${st.frac[0]}/${st.frac[1]}}={${st.reduced![0]}/${st.reduced![1]}}`);
            toast("약분까지 하면 5/11, 순환소수가 깔끔한 분수로!");
          }, 900);
        } else {
          T(() => {
            const chk = el("div", { class: "sfl-check", html: `검산: ${mfmt("7÷9")}를 계산하면 0.777… 다시 제자리!` });
            stage.appendChild(chk);
            T(() => chk.classList.add("show"), 40);
          }, 900);
        }
        T(() => finishStage(pow), st.reduced ? 1500 : 1600);
      });
      busy = false;
    }

    function finishStage(_pow: 1 | 2): void {
      goals.on(st.id);
      if (stageIdx === 0) {
        const next = el("button", { class: "sfl-btn go pulse", attrs: { type: "button" }, text: "다음 판: 마디 두 글자" });
        actions.appendChild(next);
        next.addEventListener("click", () => {
          next.remove();
          spawnStage(1);
        });
      }
      maybeDone();
    }

    setLevers(true);
  }

  spawnStage(0);
  api.setCTA("소수점을 밀어 꼬리를 맞춰요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
