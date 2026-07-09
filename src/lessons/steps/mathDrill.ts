// mathDrill, 계산 스프린트. 커스텀 넘패드로 연속 풀이(시스템 키보드 금지 원칙).
// 흐름: 문항 카드 → 넘패드 입력 → 확인하기 → 정답: 초록 플래시 후 자동 진행 /
//       오답: 정답 공개 + 오개념 한 줄(why) + (정수 덧뺄이면) 수직선 미니 재생 → 계속하기.
// 채점: recordQuiz는 스텝당 1회, 첫 시도 정답률 ≥ passRatio(기본 0.7)를 성공으로 기록.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, makeAnswerPad, checkAnswer, mstrip, type AnswerKind } from "../../ui/mathKit";
import type { StepRenderer } from "../types";

interface DrillItem {
  q: string;
  a: number | string;
  kind?: AnswerKind;
  why?: string;
  strip?: { from: number; move: number };
}

interface DrillStep {
  title: string;
  lead?: string;
  items: DrillItem[];
  passRatio?: number;
  cta?: string;
}

export const mathDrill: StepRenderer = (host, step, api) => {
  const s = step as unknown as DrillStep;
  const items = s.items ?? [];
  const passRatio = s.passRatio ?? 0.7;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const pips = el("div", { class: "mdr-pips", attrs: { "aria-hidden": "true" } });
  const pipEls = items.map(() => {
    const p = el("div", { class: "mdr-pip" });
    pips.appendChild(p);
    return p;
  });
  const qCard = el("div", { class: "mdr-q", attrs: { role: "heading", "aria-level": "2" } });
  const padHost = el("div", {});
  const whyBox = el("div", { class: "mdr-why", style: "display:none" });
  const stripHost = el("div", {});
  const summary = el("div", { class: "mdr-summary" });
  host.append(pips, qCard, padHost, whyBox, stripHost, summary);

  let idx = 0;
  let firstTry = 0;
  let tried = false; // 현재 문항에서 이미 틀렸는지
  let timer = 0;
  let finished = false;

  function mount(i: number): void {
    idx = i;
    tried = false;
    const it = items[i];
    pipEls.forEach((p, k) => p.classList.toggle("now", k === i));
    qCard.innerHTML = mfmt(it.q);
    qCard.classList.remove("slidein");
    void qCard.offsetWidth;
    qCard.classList.add("slidein");
    whyBox.style.display = "none";
    stripHost.innerHTML = "";

    padHost.innerHTML = "";
    const pad = makeAnswerPad(it.kind ?? "int", (ready) => {
      if (!finished) api.setCTA("확인하기", { enabled: ready, onClick: submit });
    });
    padHost.append(pad.ansEl, pad.padEl);
    api.setCTA("확인하기", { enabled: false });

    function submit(): void {
      const val = pad.value();
      if (!val) return;
      const { good, reduced } = checkAnswer(val, it.a);
      pad.flash(good);
      if (good) {
        haptic(HAPTIC.correct);
        pipEls[i].classList.add("ok");
        if (!tried) firstTry += 1;
        if (!reduced) api.snack("정답! 다음엔 기약분수로 줄여서 써 보세요");
        pad.setEnabled(false);
        api.setCTA("확인하기", { enabled: false });
        timer = window.setTimeout(advance, 700);
      } else {
        haptic(HAPTIC.wrong);
        if (!tried) {
          tried = true;
          pipEls[i].classList.add("no");
        }
        // 정답 공개 + 교정 한 줄 + (있으면) 수직선 재생
        pad.reveal(it.a);
        pad.setEnabled(false);
        const aTxt = String(it.a).includes("/") ? `{${it.a}}` : String(it.a);
        whyBox.innerHTML = `<b>정답은 ${mfmt(aTxt)}</b>` + (it.why ? `, ${mfmt(it.why)}` : "");
        whyBox.style.display = "";
        if (it.strip) stripHost.appendChild(mstrip(it.strip.from, it.strip.move));
        api.setCTA("계속하기", { enabled: true, onClick: advance, pop: true });
      }
    }
  }

  function advance(): void {
    window.clearTimeout(timer);
    if (idx + 1 < items.length) {
      mount(idx + 1);
    } else {
      finish();
    }
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    qCard.style.display = "none";
    padHost.innerHTML = "";
    whyBox.style.display = "none";
    stripHost.innerHTML = "";
    pips.style.display = "none";
    const ok = firstTry / Math.max(1, items.length) >= passRatio;
    summary.innerHTML = `<b>${items.length}문제 중 ${firstTry}문제</b>를 첫 시도에 해결했어요${ok ? ", 스피드 퀴즈 성공!" : ", 오답을 한 번 더 살펴봐요"}`;
    haptic(ok ? HAPTIC.correct : HAPTIC.tap);
    api.recordQuiz(ok);
    api.setCTA(s.cta ?? "계속하기", { enabled: true, onClick: api.next, pop: true });
  }

  if (items.length) mount(0);
  else api.setCTA(s.cta ?? "다음", { enabled: true });

  return () => {
    window.clearTimeout(timer);
  };
};
