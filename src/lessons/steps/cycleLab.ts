// cycleLab, 순환마디 스캐너(중2 수학 Ⅰ L2, 책 14~15쪽). 무한소수 숫자 띠에서
// 반복되는 "가장 짧은 토막"을 골라 검사하고, 성공하면 양 끝 숫자 위에 점을 찍어 봉인한다.
// 무대: 소수 띠(정수부 칩 + 소수점 아래 숫자 칩 12~13개 + 끝 … 페이드). 칩 탭 = 토막 시작,
// 오른쪽 칩 한 번 더 탭 = 토막 끝 → [반복 검사] → 선택 토막이 띠를 따라 스탬프처럼
// 칸칸이 일치 확인(240ms 간격 setTimeout 체인, 비교 중인 마디 칩은 앰버 링).
// 실패 2종: (a) 최단 아님(77·135135·5858) → "맞긴 한데 더 짧은 마디가 있어요!" 토스트,
// (b) 시작 위치 오류(1.4585858…에서 4 포함) → 행진 첫 칸부터 빨간 X + "반복은 5부터 시작돼요".
// 성공: 마디 양 끝 숫자 위에 점(·)이 톡 떨어지고(absolute 점 요소), 띠가 "0.7̇" 표기 카드로 접힌다.
// 국면: 0.777…(마디 7) → 2.135135…(마디 135) → 1.4585858…(마디 58 함정). 목표: one·three·late.
// 문법: mboard+goalChips+mtoast+mq6 패널(inst→eqs→qline→ctl), CSS 트랜지션+setTimeout(Set 정리),
// rAF 금지. 스타일은 math2.css의 .cyl-* 섹션. 참조: likeTerms(국면 전환)·stemLab(칩 탭 선택).

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

interface PhaseDef {
  id: "one" | "three" | "late";
  intPart: string; // 정수부(소수점 포함해 "0." 로 그린다)
  digits: number[]; // 띠에 보이는 소수점 아래 숫자들
  start: number; // 정답 마디의 시작 인덱스
  len: number; // 정답 마디 길이
  intro: string; // inst
  q: string; // qline 판단 질문
  sub: string; // 목표 칩 달성 sub
  read: string; // 봉인 카드 아래 한 줄
}

const PHASES: PhaseDef[] = [
  {
    id: "one",
    intPart: "0",
    digits: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    start: 0,
    len: 1,
    intro: "첫 번째 무한소수: 0.777… 이에요. 되풀이되는 <b>가장 짧은 토막</b>을 찾아 봉인해요",
    q: "되풀이 토막은 어디부터 어디까지일까요? 시작 칩과 끝 칩을 차례로 탭!",
    sub: "7!",
    read: "7 하나가 끝없이 되풀이, 한 글자짜리도 훌륭한 마디예요",
  },
  {
    id: "three",
    intPart: "2",
    digits: [1, 3, 5, 1, 3, 5, 1, 3, 5, 1, 3, 5],
    start: 0,
    len: 3,
    intro: "두 번째: 2.135135… 이에요. 이번엔 토막이 좀 길어요",
    q: "되풀이 토막은 어디부터 어디까지일까요?",
    sub: "135!",
    read: "1 3 5 세 글자가 한 묶음으로 되풀이돼요",
  },
  {
    id: "late",
    intPart: "1",
    digits: [4, 5, 8, 5, 8, 5, 8, 5, 8, 5, 8, 5, 8],
    start: 1,
    len: 2,
    intro: "마지막: 1.4585858… 이에요. 함정이 있으니 눈을 크게!",
    q: "되풀이 토막은 어디부터 어디까지일까요? 시작 위치가 열쇠예요",
    sub: "58!",
    read: "4는 딱 한 번뿐, 되풀이는 5부터 시작돼요",
  },
];

export const cycleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "one", label: "한 글자 마디", sub: "0.777…" },
    { id: "three", label: "세 글자 마디", sub: "2.135…" },
    { id: "late", label: "숨은 시작", sub: "함정 주의" },
  ]);

  const board = mboard(540);
  const stripEl = el("div", { class: "cyl-strip" });
  const stage = el("div", { class: "cyl-stage" }, stripEl);
  // ── mq6 패널: inst → eqs(봉인 카드가 쌓인다) → qline → ctl ──
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst" });
  const eqs = el("div", { class: "mq6-eqs" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const pickEl = el("div", { class: "cyl-pick" });
  const checkBtn = el("button", {
    class: "mq6-btn cyl-check",
    text: "반복 검사",
    attrs: { type: "button", "aria-label": "고른 토막이 그대로 되풀이되는지 검사하기" },
  }) as HTMLButtonElement;
  ctl.append(pickEl, checkBtn);
  panel.append(inst, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
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
  let phaseNo = 0;
  let selA = -1; // 토막 시작(포함)
  let selB = -1; // 토막 끝(포함)
  let checking = false; // 행진 검사, 봉인 연출 중 잠금
  let finished = false;

  const dChips = (): HTMLElement[] => Array.from(stripEl.querySelectorAll(".cyl-d")) as HTMLElement[];

  function buildStrip(p: PhaseDef): void {
    clear(stripEl);
    stripEl.classList.remove("fold");
    stripEl.appendChild(el("span", { class: "cyl-int", text: `${p.intPart}.` }));
    p.digits.forEach((d, i) => {
      const b = el("button", {
        class: "cyl-d",
        text: String(d),
        dataset: { i: String(i) },
        attrs: { type: "button", "aria-label": `소수점 아래 ${i + 1}번째 숫자 ${d}` },
      });
      b.style.animationDelay = `${i * 36}ms`;
      stripEl.appendChild(b);
    });
    stripEl.appendChild(el("span", { class: "cyl-ell", text: "…", attrs: { "aria-hidden": "true" } }));
  }

  function paintSel(): void {
    dChips().forEach((c, i) => {
      c.classList.toggle("sel", selA >= 0 && i >= selA && i <= selB);
      c.classList.toggle("edge", selA >= 0 && (i === selA || i === selB));
    });
    checkBtn.disabled = selA < 0;
    if (selA >= 0) {
      const seg = PHASES[phaseNo].digits.slice(selA, selB + 1);
      pickEl.innerHTML = `고른 토막: <b>${seg.join(" ")}</b> (${seg.length}칸)`;
    } else {
      pickEl.innerHTML = "";
    }
  }

  /* ── 칩 탭: 첫 탭 = 시작(한 칸 토막), 오른쪽 탭 = 끝 확장, 왼쪽·안쪽 탭 = 새 시작 ── */
  stripEl.addEventListener("pointerdown", (e) => {
    if (checking || finished) return;
    const t = (e.target as Element).closest(".cyl-d") as HTMLElement | null;
    if (!t) return;
    const i = Number(t.dataset.i);
    haptic(HAPTIC.tap);
    if (selA < 0) {
      selA = selB = i;
    } else if (i === selA && selB === selA) {
      selA = selB = -1; // 같은 칩 다시 탭 = 해제
    } else if (i > selB) {
      selB = i; // 오른쪽으로 확장
    } else {
      selA = selB = i; // 새 시작
    }
    paintSel();
  });

  function resetSelection(): void {
    dChips().forEach((c) => {
      c.classList.remove("hit", "miss", "cmp", "sel", "edge");
      c.querySelector(".cyl-x")?.remove();
    });
    selA = selB = -1;
    paintSel();
    checking = false;
  }

  function dropDot(c: HTMLElement): void {
    c.classList.add("dotted");
    c.appendChild(el("i", { class: "cyl-dot", text: "·", attrs: { "aria-hidden": "true" } }));
    haptic(HAPTIC.select);
  }

  /** 봉인 표기: 정수부 + 앞자리 + 마디(양 끝 위에 점). */
  function notation(p: PhaseDef): string {
    const dg = (d: number, dot: boolean): string =>
      `<span class="cyl-dg">${d}${dot ? `<i class="cyl-dot" aria-hidden="true">·</i>` : ""}</span>`;
    let out = `<span class="cyl-dg">${p.intPart}.</span>`;
    p.digits.slice(0, p.start).forEach((d) => {
      out += dg(d, false);
    });
    const per = p.digits.slice(p.start, p.start + p.len);
    per.forEach((d, i) => {
      out += dg(d, i === 0 || i === per.length - 1);
    });
    return out;
  }

  /* ── [반복 검사]: 선택 토막이 띠를 따라 스탬프처럼 행진하며 칸칸이 일치 확인 ── */
  function runCheck(): void {
    if (checking || finished || selA < 0) return;
    const p = PHASES[phaseNo];
    checking = true;
    checkBtn.disabled = true;
    const seg = p.digits.slice(selA, selB + 1);
    const L = seg.length;
    const cells = dChips();
    cells.forEach((c) => {
      c.classList.remove("hit", "miss", "cmp");
      c.querySelector(".cyl-x")?.remove();
    });

    const marchFail = (p3trap: boolean): void => {
      toast(
        p3trap
          ? "행진 첫 칸부터 어긋났어요! 4는 딱 한 번뿐, 반복은 5부터 시작돼요"
          : "여기서 어긋났어요, 고른 토막이 그대로 되풀이되지 않아요!",
      );
      later(resetSelection, 1500);
    };

    const marchDone = (): void => {
      cells.forEach((c) => c.classList.remove("cmp"));
      if (selA === p.start && L === p.len) {
        succeed();
        return;
      }
      haptic(HAPTIC.cross);
      if (L > p.len) toast("맞긴 한데, 더 짧은 마디가 있어요! 토막 안에서 같은 무늬가 또 반복되죠?");
      else toast("반복 토막은 맞아요. 하지만 마디는 가장 먼저 시작하는 토막이에요, 한 발 앞에서 다시!");
      later(resetSelection, 1500);
    };

    const succeed = (): void => {
      haptic(HAPTIC.correct);
      cells.forEach((c) => c.classList.remove("hit"));
      const aEl = cells[p.start];
      const bEl = cells[p.start + p.len - 1];
      dropDot(aEl);
      if (bEl !== aEl) later(() => dropDot(bEl), 200);
      toast(p.len === 1 ? "전 구간 일치! 한 글자 마디는 그 위에 점 하나면 돼요" : "전 구간 일치! 마디 양 끝 숫자 위에 점을 찍어 봉인해요");
      later(foldStrip, 1450);
    };

    const foldStrip = (): void => {
      stripEl.classList.add("fold");
      later(() => {
        eqs.appendChild(
          el("div", {
            class: "cyl-fold mq6-pop",
            html: `<span class="cyl-note">${notation(p)}</span><span class="cyl-read">${p.read}</span>`,
          }),
        );
        chips.on(p.id, p.sub);
        if (phaseNo + 1 < PHASES.length) {
          later(() => {
            phaseNo += 1;
            startPhase();
          }, 1500);
        } else {
          finishAll();
        }
      }, 440);
    };

    let k = 0; // 행진 진행 칸 수
    const stepFn = (): void => {
      cells.forEach((c) => c.classList.remove("cmp"));
      const target = selB + 1 + k;
      if (target >= p.digits.length) {
        marchDone();
        return;
      }
      cells[selA + (k % L)].classList.add("cmp"); // 지금 비교 중인 마디 칩
      if (p.digits[target] === seg[k % L]) {
        cells[target].classList.add("hit");
        haptic(HAPTIC.tap);
        k += 1;
        later(stepFn, 240);
      } else {
        cells[target].classList.add("miss");
        cells[target].appendChild(el("i", { class: "cyl-x", text: "×", attrs: { "aria-hidden": "true" } }));
        haptic(HAPTIC.wrong);
        later(() => marchFail(p.id === "late" && selA === 0), 420);
      }
    };
    later(stepFn, 260);
  }
  checkBtn.addEventListener("click", runCheck);

  function startPhase(): void {
    const p = PHASES[phaseNo];
    selA = selB = -1;
    checking = false;
    buildStrip(p);
    paintSel();
    inst.innerHTML = p.intro;
    qline.innerHTML = p.q;
    helper.innerHTML =
      phaseNo === 0
        ? "칩 하나를 탭하면 토막의 <b>시작</b>, 오른쪽 칩을 한 번 더 탭하면 <b>끝</b>이에요. 한 칸짜리 토막도 좋아요!"
        : phaseNo === 1
          ? "이번엔 토막이 몇 칸일까요? 묶어서 <b>반복 검사</b>로 확인해요."
          : "맨 앞 숫자도 과연 반복될까요? 함정 조심!";
  }

  function finishAll(): void {
    if (finished) return;
    finished = true;
    inst.innerHTML = "숫자 띠 세 개를 전부 봉인했어요!";
    qline.innerHTML = "";
    clear(ctl);
    eqs.appendChild(
      el("div", {
        class: "mq6-concl mq6-pop",
        html: "되풀이되는 <b>가장 짧은 토막</b>을 찾아 양 끝 숫자 위에 점을 찍으면, 끝없는 소수를 짧게 쓸 수 있어요",
      }),
    );
    helper.innerHTML = "무한히 이어지던 숫자가 <b>점 두 개</b>로 접혔어요. 이 토막의 정식 이름을 배우러 가요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  startPhase();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
