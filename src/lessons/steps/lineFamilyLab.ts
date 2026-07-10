// lineFamilyLab, 직선 가족 조종실(중2 수학 Ⅲ L6, 책 111~113쪽). a·b 스테퍼로 y=ax+b를
// 조종하며 그래프의 성질을 발견한다: a의 부호 = 방향, |a| = 가파름(y축 근접), 기울기 같음 = 평행.
// 국면 1(dir): a를 양수·음수로 오가며 "오른쪽 위/아래" 방향 라벨을 둘 다 목격.
// 국면 2(steep): |a|=3까지 밀어 "y축에 바짝"을 확인(절댓값 클수록 가파름).
// 국면 3(par): 기준 점선 y=2x-3이 등장, 평행한 직선 만들기 미션, a=2·b=-3이면 "일치" 함정
//              (완전히 겹침 = 평행이 아니라 같은 직선), b를 옮겨야 진짜 평행.
// 직선은 lineLab 문법(원점 회전)에 translateY(b)를 더해 그린다(transform-origin = 원점 픽셀).
// 목표 칩 3: dir·steep·par. rAF 금지(CSS 트랜지션+타이머 Set). 스타일: math2.css .lfm-* 섹션.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips, planeSpec } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

export const lineFamilyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "dir", label: "방향 발견", sub: "a를 +와 −로" },
    { id: "steep", label: "절벽 만들기", sub: "|a|를 3까지" },
    { id: "par", label: "평행 미션", sub: "잠김" },
  ]);

  const board = mboard(520);
  const eqCard = el("div", { class: "mdr-q lfm-eq", attrs: { "aria-live": "polite" } });
  const spec = planeSpec({ min: -5, max: 5, size: 340 });
  const svgWrap = el("div", { class: "mcl-plane" });
  const O = `${spec.px(0)}px ${spec.py(0)}px`;
  svgWrap.innerHTML =
    `<svg viewBox="${spec.vb}" xmlns="http://www.w3.org/2000/svg" fill="none">${spec.grid}` +
    `<g class="lfm-ref" style="opacity:0; transition: opacity .5s ease">` +
    `<line x1="${spec.px(0) - 300}" y1="${spec.py(0)}" x2="${spec.px(0) + 300}" y2="${spec.py(0)}" stroke="#8A6EE0" stroke-width="2.4" stroke-dasharray="7 5" style="transform-origin:${O}; transform: translateY(${(3 * spec.unit).toFixed(1)}px) rotate(${(-Math.atan(2) * 180) / Math.PI}deg)"/>` +
    `<text x="${spec.px(2.1)}" y="${spec.py(2 * 2.1 - 3) + 16}" font-size="10.5" font-weight="800" font-style="italic" fill="#6A55F2">y=2x−3</text>` +
    `</g>` +
    `<g class="lfm-line" style="transform-origin:${O}; transition: transform .3s var(--ease-out)">` +
    `<line x1="${spec.px(0) - 300}" y1="${spec.py(0)}" x2="${spec.px(0) + 300}" y2="${spec.py(0)}" stroke="#0CA678" stroke-width="3.2" stroke-linecap="round"/>` +
    `</g>` +
    `<g class="lfm-badge"></g>` +
    `</svg>`;
  const dirPill = el("div", { class: "lfm-dir", attrs: { "aria-live": "polite" } });
  const ctlRow = el("div", { class: "lfm-ctl" });
  board.append(eqCard, dirPill, svgWrap, ctlRow);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "스테퍼로 <b>a</b>와 <b>b</b>를 조종해 보세요. 먼저 a를 <b>음수까지</b> 내려 보면?",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const gLine = svgWrap.querySelector(".lfm-line") as SVGGElement;
  const gRef = svgWrap.querySelector(".lfm-ref") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let a = 1;
  let b = 1;
  let sawUp = false;
  let sawDown = false;
  let refOn = false; // 평행 미션 개시
  let finished = false;

  const fmtA = (v: number): string => (v % 1 === 0 ? String(v) : v.toFixed(1));
  const eqStr = (): string => {
    const ax = a === 1 ? "x" : a === -1 ? "-x" : `${fmtA(a)}x`;
    return b === 0 ? `y=${ax}` : b > 0 ? `y=${ax}+${b}` : `y=${ax}-${Math.abs(b)}`;
  };

  function paint(): void {
    gLine.style.transform = `translateY(${(-b * spec.unit).toFixed(1)}px) rotate(${(-Math.atan(a) * 180) / Math.PI}deg)`;
    eqCard.innerHTML = `<span class="mcl-k">지금 직선</span> ${mfmt(eqStr())}`;
    dirPill.innerHTML =
      `<span class="lfm-pill ${a > 0 ? "up" : "down"}">${a > 0 ? "오른쪽 위로" : "오른쪽 아래로"}</span>` +
      `<span class="lfm-pill sub">|a| = ${fmtA(Math.abs(a))}</span>`;
  }

  function judge(): void {
    if (a > 0) sawUp = true;
    if (a < 0) sawDown = true;
    if (!chips.has("dir") && sawUp && sawDown) {
      chips.on("dir", "+위 −아래!");
      haptic(HAPTIC.correct);
      toast("a>0이면 오른쪽 위로, a<0이면 오른쪽 아래로!");
      helper.innerHTML = "방향은 정복! 이번엔 <b>|a|를 3까지</b> 밀어 보세요. 직선이 어디에 붙나요?";
    }
    if (!chips.has("steep") && Math.abs(a) === 3) {
      chips.on("steep", "y축에 바짝!");
      haptic(HAPTIC.correct);
      toast("a의 절댓값이 클수록 직선이 y축에 가까워져요!");
      if (!refOn) later(startPar, 900);
    }
    if (refOn && !finished) {
      if (a === 2 && b === -3) {
        toast("어라, 완전히 겹쳤어요! 이건 평행이 아니라 '일치', 같은 직선이에요. b를 옮겨 보세요!");
        haptic(HAPTIC.wrong);
      } else if (a === 2) {
        finished = true;
        chips.on("par", "기울기 같음!");
        haptic(HAPTIC.done);
        toast("나란히 달리는 두 직선, 평행 완성!");
        helper.innerHTML =
          "<b>기울기가 같으면 평행</b>(단, y절편까지 같으면 '일치'), 그리고 평행한 두 직선의 기울기는 같아요. " +
          "a는 방향과 가파름, b는 높이. 이제 식만 봐도 직선이 그려지죠!";
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "다음");
      }
    }
  }

  function startPar(): void {
    refOn = true;
    gRef.style.opacity = "1";
    const sub = chips.el.querySelector(`[data-g="par"] span`) as HTMLElement;
    sub.textContent = "점선과 나란히";
    helper.innerHTML = "보라 점선 <b>y=2x−3</b>이 나타났어요! 이 직선과 <b>평행한</b> 초록 직선을 만들어 보세요.";
    toast("미션: 보라 점선과 평행하게!");
  }

  function stepper(label: string, get: () => number, set: (v: number) => void, step: number, min: number, max: number, skipZero: boolean): HTMLElement {
    const read = el("span", { class: "lfm-read", html: `<i>${label}</i> = <b>${fmtA(get()).replace("-", "−")}</b>` });
    const mk = (d: number): HTMLButtonElement => {
      const bt = el("button", { class: "ct-btn", attrs: { type: "button", "aria-label": `${label} ${d > 0 ? "키우기" : "줄이기"}` } }, el("span", { text: d > 0 ? "+" : "−" })) as HTMLButtonElement;
      bt.addEventListener("click", () => {
        let next = Math.round((get() + d * step) * 2) / 2;
        if (skipZero && next === 0) next = d > 0 ? step : -step;
        next = Math.max(min, Math.min(max, next));
        if (next === get()) return;
        set(next);
        haptic(HAPTIC.tap);
        read.innerHTML = `<i>${label}</i> = <b>${fmtA(get()).replace("-", "−")}</b>`;
        paint();
        judge();
      });
      return bt;
    };
    return el("div", { class: "lfm-step" }, mk(-1), read, mk(1));
  }

  ctlRow.append(
    stepper("a", () => a, (v) => (a = v), 0.5, -3, 3, true),
    stepper("b", () => b, (v) => (b = v), 1, -4, 4, false),
  );

  paint();
  api.setCTA("세 미션을 마치면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
