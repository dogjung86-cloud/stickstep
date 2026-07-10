// flipLab, 수직선 반전 랩(중2 수학 Ⅱ L2 기함, 책 58~60쪽). 수직선 위 두 점(2와 4)에
// 같은 연산을 가하며 이동을 관찰한다. 더하기·빼기는 나란히 이동, 양수 곱은 원점에서
// 멀어지기, 음수 곱은 "원점 기준 반사" — 반사 순간 좌우 순서가 뒤집히며 부등식 카드의
// 부등호가 홱 회전한다. 국면마다 2<4에서 새로 시작해 연산 하나의 효과만 본다.
// 문법: mboard+goalChips+mtoast, CSS 트랜지션+setTimeout 체인(타이머 Set 일괄 해제), rAF 금지.
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

const MIN = -10;
const MAX = 10;

interface OpDef {
  key: string;
  label: string; // mfmt
  sub: string;
  fn: (v: number) => number;
  reflect: boolean; // 음수 곱·나눗셈(원점 반사)
}

const OPS: Record<string, OpDef> = {
  add3: { key: "add3", label: "+3", sub: "양변에 더하기", fn: (v) => v + 3, reflect: false },
  sub5: { key: "sub5", label: "-5", sub: "양변에서 빼기", fn: (v) => v - 5, reflect: false },
  mul2: { key: "mul2", label: "×2", sub: "양수 곱하기", fn: (v) => v * 2, reflect: false },
  muln1: { key: "muln1", label: "×(-1)", sub: "음수 곱하기", fn: (v) => -v, reflect: true },
  divn2: { key: "divn2", label: "÷(-2)", sub: "음수로 나누기", fn: (v) => v / -2, reflect: true },
};

interface PhaseDef {
  id: "add" | "mul" | "flip";
  intro: string;
  ops: string[]; // 이 국면에서 켜는 레버
  need: string[]; // 전부 실행해야 국면 완료
  done: string;
  predict?: { q: string; choices: [string, boolean, string][] }; // [라벨, 정답?, 교정]
}

const PHASES: PhaseDef[] = [
  {
    id: "add",
    intro: "출발은 언제나 <b>2<4</b>. 양변에 같은 수를 더하거나 빼면 두 점은 어떻게 될까요?",
    ops: ["add3", "sub5"],
    need: ["add3", "sub5"],
    done: "두 점이 <b>나란히 이동</b>했을 뿐, 왼쪽·오른쪽 순서는 그대로예요. 더하기·빼기는 방향 유지!",
  },
  {
    id: "mul",
    intro: "다시 <b>2<4</b>. 이번엔 양변에 <b>양수 2</b>를 곱해 봐요.",
    ops: ["mul2"],
    need: ["mul2"],
    done: "원점에서 두 배씩 <b>멀어지며</b> 간격은 벌어졌지만, 순서는 그대로! 양수 곱도 방향 유지예요.",
  },
  {
    id: "flip",
    intro: "마지막 실험, <b>2<4</b>에 <b>음수</b>를 곱하면?",
    ops: ["muln1", "divn2"],
    need: ["muln1"],
    done: "원점을 축으로 <b>반사</b>되며 큰 수가 왼쪽으로! 음수를 곱하거나 나누면 부등호가 뒤집혀요.",
    predict: {
      q: "×(-1)을 하면 두 점의 왼쪽·오른쪽 순서는 어떻게 될까요?",
      choices: [
        ["뒤집혀요, 원점 반대편으로 넘어가니까요", true, ""],
        ["그대로예요, 곱하기는 아까도 그대로였잖아요", false, "양수 곱은 그대로였지만, 음수 곱은 원점 너머로 반사돼요. 직접 확인!"],
        ["둘 다 0에 모여요", false, "0이 되려면 0을 곱해야 해요. 음수를 곱하면 반대편으로 반사된답니다."],
      ],
    },
  },
];

export const flipLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "add", label: "더하고 빼기", sub: "나란히 이동" },
    { id: "mul", label: "양수 곱", sub: "멀어질 뿐" },
    { id: "flip", label: "음수 곱", sub: "원점 반사!" },
  ]);
  const board = mboard(320);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(goals.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const T = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ── 무대 조립 ── */
  const stage = el("div", { class: "fpl-stage" });
  const card = el("div", { class: "fpl-card" }); // 부등식 카드
  const lineWrap = el("div", { class: "fpl-line" });
  const qline = el("div", { class: "fpl-q" });
  const levers = el("div", { class: "fpl-levers" });
  stage.append(card, lineWrap, qline, levers);
  board.appendChild(stage);

  // 수직선(눈금 + 0 강조)
  const track = el("div", { class: "fpl-track" });
  lineWrap.appendChild(track);
  const pct = (v: number): number => ((v - MIN) / (MAX - MIN)) * 100;
  for (let v = MIN; v <= MAX; v++) {
    const tick = el("span", { class: `fpl-tick${v === 0 ? " zero" : ""}`, style: `left:${pct(v)}%` });
    lineWrap.appendChild(tick);
    if (v % 2 === 0) {
      lineWrap.appendChild(
        el("span", { class: `fpl-num${v === 0 ? " zero" : ""}`, style: `left:${pct(v)}%`, text: String(v).replace("-", "−") }),
      );
    }
  }
  const mirror = el("span", { class: "fpl-mirror", style: `left:${pct(0)}%` }); // 반사 축(국면 3에서 점등)
  lineWrap.appendChild(mirror);

  interface Dot {
    el: HTMLElement;
    lab: HTMLElement;
    v: number;
  }
  const mkDot = (cls: string, v: number): Dot => {
    const d = el("span", { class: `fpl-dot ${cls}`, style: `left:${pct(v)}%` });
    const lab = el("span", { class: `fpl-dlab ${cls}`, style: `left:${pct(v)}%`, html: mfmt(String(v)) });
    lineWrap.append(d, lab);
    return { el: d, lab, v };
  };
  const A = mkDot("a", 2);
  const B = mkDot("b", 4);

  let phaseIdx = 0;
  let busy = false;
  const used = new Set<string>();
  const leverBtns = new Map<string, HTMLButtonElement>();

  function setCard(a: number, b: number, animateFlip = false): void {
    const rel = a < b ? "<" : ">";
    const fa = Number.isInteger(a) ? String(a) : String(a);
    const fb = Number.isInteger(b) ? String(b) : String(b);
    card.innerHTML = `${mfmt(fa)}<span class="fpl-rel">${rel}</span>${mfmt(fb)}`;
    if (animateFlip) {
      const relEl = card.querySelector(".fpl-rel") as HTMLElement;
      relEl.classList.add("spin");
      card.classList.add("flash");
      T(() => card.classList.remove("flash"), 700);
    }
  }

  function moveDot(d: Dot, v: number, reflect: boolean): void {
    // 잔상(이전 자리)
    const ghost = el("span", { class: `fpl-dot ghost`, style: `left:${pct(d.v)}%` });
    lineWrap.appendChild(ghost);
    T(() => {
      ghost.style.opacity = "0";
    }, 60);
    T(() => ghost.remove(), 900);
    d.v = v;
    d.el.classList.toggle("hop", reflect);
    d.el.style.left = `${pct(v)}%`;
    d.lab.style.left = `${pct(v)}%`;
    d.lab.innerHTML = mfmt(String(v).replace("-", "-"));
    if (reflect) T(() => d.el.classList.remove("hop"), 900);
  }

  function resetDots(): void {
    moveDot(A, 2, false);
    moveDot(B, 4, false);
    setCard(2, 4);
  }

  function applyOp(op: OpDef): void {
    if (busy) return;
    busy = true;
    haptic(HAPTIC.select);
    const btn = leverBtns.get(op.key);
    btn?.classList.add("used");
    if (op.reflect) {
      mirror.classList.add("on");
      haptic(HAPTIC.tap);
    }
    const na = op.fn(A.v);
    const nb = op.fn(B.v);
    moveDot(A, na, op.reflect);
    moveDot(B, nb, op.reflect);
    T(() => {
      const flipped = na > nb;
      setCard(na, nb, flipped);
      if (flipped) {
        haptic(HAPTIC.correct);
        toast("순서가 뒤집혔어요! 큰 수였던 쪽이 왼쪽으로 넘어왔죠");
      } else if (op.reflect) {
        toast("반사됐지만 순서 확인!");
      }
      used.add(op.key);
      busy = false;
      checkPhase();
    }, op.reflect ? 950 : 620);
  }

  function checkPhase(): void {
    const ph = PHASES[phaseIdx];
    if (!ph.need.every((k) => used.has(k))) return;
    goals.on(ph.id);
    helper.innerHTML = ph.done;
    haptic(HAPTIC.correct);
    if (phaseIdx < PHASES.length - 1) {
      T(() => spawnPhase(phaseIdx + 1), 1700);
    } else {
      T(() => {
        helper.innerHTML =
          "정리! 더하기·빼기·양수 곱나눗셈은 방향 <b>유지</b>, 음수 곱나눗셈만 <b>반전</b>이에요. 원점 반사가 그 이유!";
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "규칙 정리");
      }, 1500);
    }
  }

  function buildLevers(ph: PhaseDef): void {
    levers.innerHTML = "";
    leverBtns.clear();
    for (const key of ph.ops) {
      const op = OPS[key];
      const b = el("button", {
        class: "fpl-btn",
        attrs: { type: "button", "aria-label": `${op.sub} ${op.label}` },
        html: `${mfmt(op.label)}<span class="fpl-bs">${op.sub}</span>`,
      }) as HTMLButtonElement;
      b.addEventListener("click", () => applyOp(op));
      leverBtns.set(key, b);
      levers.appendChild(b);
    }
  }

  function spawnPhase(i: number): void {
    phaseIdx = i;
    used.clear();
    const ph = PHASES[i];
    helper.innerHTML = ph.intro;
    qline.innerHTML = "";
    mirror.classList.remove("on");
    resetDots();
    if (ph.predict) {
      // 예측 먼저: 레버는 답을 고른 뒤 활성화
      levers.innerHTML = "";
      qline.textContent = ph.predict.q;
      const row = el("div", { class: "fpl-choices" });
      let answered = false;
      ph.predict.choices.forEach(([label, good, fix]) => {
        const b = el("button", { class: "fpl-choice", text: label, attrs: { type: "button" } }) as HTMLButtonElement;
        b.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          if (good) {
            b.classList.add("ok");
            haptic(HAPTIC.correct);
            toast("좋은 예측! 직접 확인해 봐요");
          } else {
            b.classList.add("no");
            haptic(HAPTIC.wrong);
            const okIdx = ph.predict!.choices.findIndex(([, g]) => g);
            (row.children[okIdx] as HTMLElement | undefined)?.classList.add("ok");
            if (fix) toast(fix);
          }
          T(() => {
            qline.innerHTML = "";
            row.remove();
            buildLevers(ph);
          }, good ? 900 : 1600);
        });
        row.appendChild(b);
      });
      qline.after(row);
      T(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    } else {
      buildLevers(ph);
    }
  }

  spawnPhase(0);
  api.setCTA("세 가지 연산을 모두 실험해요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
