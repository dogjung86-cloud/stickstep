// funcLab, 대응 기계 검사소(중2 수학 Ⅲ L1, 책 98~99쪽). 수를 넣으면 수가 나오는 기계
// 3대를 검사하며 "x 하나에 y가 오직 하나"라는 함수의 조건을 손으로 발견한다(명명은 concept 몫).
// 국면 1(plus): 더하기 3 기계, 2·5·8을 넣으면 5·8·11이 하나씩. 판정: 하나로 딱 정해진다.
// 국면 2(divisor): 약수 기계, 1은 1개지만 4는 3개, 6은 4개가 우르르. 판정: 정해지지 않는다
//                  (x=1에서 하나였다고 통과 아님, "모든 x에서 하나씩"이 조건).
// 국면 3(constant): 무조건 5 기계, 1도 7도 100도 전부 5. "안 변하니 탈락?" 함정 정면 승부:
//                  x마다 오직 하나씩 정해지므로 당당한 통과(무제한 요금제 오개념의 원형).
// 목표 칩 3: plus·divisor·constant. 문법: mboard+goalChips+mtoast+mq6-q(ineqTruthLab 계승),
// CSS 트랜지션+setTimeout(타이머 Set 일괄 해제), rAF 금지. 스타일: math2.css .fnl-* 섹션.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Mac {
  goal: string;
  name: string;
  arrive: string; // 기계 등장 시 helper
  inputs: number[];
  out: (x: number) => number[];
  q: string; // 판정 질문(mq6-q)
  items: { t: string; good?: boolean; fb: string }[];
  chipSub: string; // 목표 칩 달성 문구
  pass: boolean; // 검사 통과 여부(통과 도장/탈락 도장)
}

const MACS: Mac[] = [
  {
    goal: "plus",
    name: "더하기 3 기계",
    arrive: "수 카드를 탭해서 기계에 넣어 보세요. <b>셋 다</b> 넣으면 판정 시간!",
    inputs: [2, 5, 8],
    out: (x) => [x + 3],
    q: "검사 끝! 이 기계, 넣는 수 <i>x</i>를 정하면 나오는 수 <i>y</i>도 <b>하나로 딱 정해지나요</b>?",
    items: [
      {
        t: "아니요: y가 5, 8, 11로 자꾸 달라졌어요",
        fb: "y가 달라진 건 x를 바꿔 넣어서예요. x를 '하나' 정하면 y는 언제나 '하나', 2를 넣으면 반드시 5!",
      },
      {
        t: "네: x마다 나오는 수가 하나씩 딱!",
        good: true,
        fb: "정확해요. 2→5, 5→8, 8→11, 어떤 x든 y가 하나로 정해져요. 검사 통과!",
      },
    ],
    chipSub: "하나씩!",
    pass: true,
  },
  {
    goal: "divisor",
    name: "약수 기계",
    arrive: "이번 기계는 넣은 수의 <b>약수</b>를 몽땅 뱉어요. 1, 4, 6을 차례로!",
    inputs: [1, 4, 6],
    out: (x) => Array.from({ length: x }, (_, i) => i + 1).filter((d) => x % d === 0),
    q: "1에서는 하나였는데 6에서는 넷이 우르르! <i>y</i>가 <b>하나로 딱 정해진다</b>고 할 수 있을까요?",
    items: [
      {
        t: "네: 1을 넣었을 땐 하나만 나왔잖아요",
        fb: "함정! 단 하나의 x라도 y가 여러 개면 실격이에요. '모든 x에서 하나씩'이어야 하거든요.",
      },
      {
        t: "아니요: 여러 개가 나오는 x가 있어요",
        good: true,
        fb: "맞아요. 4만 넣어도 1, 2, 4 세 개가 쏟아지죠. 하나로 정해지지 않으니 탈락!",
      },
    ],
    chipSub: "우르르, 탈락!",
    pass: false,
  },
  {
    goal: "constant",
    name: "무조건 5 기계",
    arrive: "마지막 기계는 수상해요. 1, 7, 100, 아무거나 넣어 보세요.",
    inputs: [1, 7, 100],
    out: () => [5],
    q: "뭘 넣어도 5만 나와요. 이 기계는 <i>y</i>가 <b>하나로 딱 정해지는</b> 기계일까요?",
    items: [
      {
        t: "아니요: y가 전혀 변하지 않으니까요",
        fb: "함정이었어요! 조건은 'y가 변한다'가 아니라 '하나로 정해진다'예요. x마다 y=5로 딱 하나, 통과!",
      },
      {
        t: "네: x마다 y가 5로 오직 하나예요",
        good: true,
        fb: "날카로워요! 늘 같은 값이라도 x 하나에 y 하나면 조건 충족. 검사 통과!",
      },
    ],
    chipSub: "함정 통과!",
    pass: true,
  },
];

export const funcLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "plus", label: "더하기 3 기계", sub: "검사 대기" },
    { id: "divisor", label: "약수 기계", sub: "검사 대기" },
    { id: "constant", label: "무조건 5 기계", sub: "함정 주의" },
  ]);

  const board = mboard(440);
  const title = el("div", { class: "mdr-q fnl-title" });
  const inRow = el("div", { class: "fnl-in", attrs: { role: "group", "aria-label": "넣을 수 카드" } });
  const mac = el("div", { class: "fnl-mac" });
  const log = el("div", { class: "fnl-log", attrs: { role: "group", "aria-label": "대응 기록장" } });
  const qline = el("div", { class: "mq6-q fnl-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(title, inRow, mac, log, panel);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let mi = 0; // 현재 기계 인덱스
  let fed = 0; // 넣은 카드 수
  let chewing = false;
  let finished = false;

  const pretty = (n: number): string => String(n).replace(/-/g, "−");

  function pop(n: HTMLElement): void {
    const t = n.style.transition;
    n.style.transition = "none";
    n.style.transform = "scale(.5)";
    void n.offsetWidth;
    n.style.transition = t;
    n.style.transform = "scale(1)";
  }

  /** 판단 질문(mq6-q 문법, ineqTruthLab 계승). */
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
        }, 1700);
      });
      btns.push({ b, good: !!it.good });
      row.appendChild(b);
    }
    clear(ctl);
    ctl.appendChild(row);
  }

  /** 기계 한 대 설치(슬라이드 인). */
  function setup(): void {
    const m = MACS[mi];
    fed = 0;
    title.innerHTML = `<span class="mcl-k">검사 ${mi + 1}/3</span> <b>${m.name}</b>`;
    mac.innerHTML =
      `<div class="fnl-mouth" aria-hidden="true"></div>` +
      `<div class="fnl-face"><span class="fnl-gear" aria-hidden="true"></span><b>${m.name}</b></div>` +
      `<div class="fnl-chute" aria-hidden="true"></div>`;
    mac.classList.remove("passed", "failed");
    clear(log);
    clear(inRow);
    for (const x of m.inputs) {
      const b = el("button", {
        class: "fnl-chip",
        text: pretty(x),
        attrs: { type: "button", "aria-label": `${x} 넣기` },
      }) as HTMLButtonElement;
      b.addEventListener("click", () => feed(b, x));
      inRow.appendChild(b);
    }
    mac.classList.add("enter");
    later(() => mac.classList.remove("enter"), 60);
    helper.innerHTML = m.arrive;
  }

  /** 카드 투입 → 기계 우물우물 → 출력 기록. */
  function feed(btn: HTMLButtonElement, x: number): void {
    if (chewing || btn.disabled || finished) return;
    chewing = true;
    btn.disabled = true;
    btn.classList.add("used");
    haptic(HAPTIC.tap);
    mac.classList.remove("chew");
    void mac.offsetWidth;
    mac.classList.add("chew");
    const m = MACS[mi];
    const ys = m.out(x);
    later(() => {
      const pair = el("span", { class: `fnl-pair${ys.length > 1 ? " multi" : ""}` });
      pair.innerHTML =
        `<b>${pretty(x)}</b><span class="fnl-arr" aria-hidden="true">→</span>` +
        `<span class="fnl-ys">${ys.map(pretty).join(", ")}</span>` +
        (ys.length > 1 ? `<i class="fnl-cnt">${ys.length}개!</i>` : "");
      log.appendChild(pair);
      pop(pair);
      haptic(ys.length > 1 ? HAPTIC.cross : HAPTIC.correct);
      if (ys.length > 1) toast(`${x}을(를) 넣었더니 ${ys.length}개가 우르르!`.replace("1을(를)", "1을"));
      fed += 1;
      chewing = false;
      if (fed === m.inputs.length) later(judge, 500);
    }, 520);
  }

  /** 판정 국면 → 도장 → 다음 기계 or 마무리. */
  function judge(): void {
    const m = MACS[mi];
    helper.innerHTML = "기록장을 보고 판정해 보세요.";
    ask(m.q, m.items, () => {
      mac.classList.add(m.pass ? "passed" : "failed");
      const stamp = el("span", { class: `fnl-stamp ${m.pass ? "ok" : "no"}`, text: m.pass ? "하나씩!" : "탈락" });
      mac.appendChild(stamp);
      pop(stamp);
      chips.on(m.goal, m.chipSub);
      if (mi < MACS.length - 1) {
        mi += 1;
        later(setup, 1500);
      } else {
        finished = true;
        haptic(HAPTIC.done);
        helper.innerHTML =
          "검사 결과: <b>더하기 3 기계</b>와 <b>무조건 5 기계</b>만 통과! x마다 y가 <b>오직 하나씩 정해지는</b> " +
          "이런 대응 관계에는 정식 이름이 있어요. 바로 다음에서 명명식을 열어요!";
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "이름 붙이러 가기");
      }
    });
  }

  setup();
  api.setCTA("기계 3대를 모두 검사하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
