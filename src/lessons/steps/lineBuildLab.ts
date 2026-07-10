// lineBuildLab, 직선 복원 수사대(중2 수학 Ⅲ L7, 책 114~115쪽). 단서만 보고 a·b를 조종해
// 사라진 직선을 복원한다, "일차함수의 식 구하기 = a와 b를 알아내기"의 체험판.
// 사건 1(case1): 단서 "기울기 2, 점 (1, 3) 통과", a 다이얼로 기울기부터, b 다이얼로 점 관통.
// 중간 판정(read): 사건 2의 두 점 (-1, 4)·(2, -2) 사이 세모가 자동으로 그려지고
//                  "기울기 = ?" 판정(세로 -6/가로 +3 = -2, 부호 함정 +2).
// 사건 2(case2): a=-2를 맞춘 뒤 b를 조종해 두 점을 동시에 관통, y=-2x+2 복원.
// 목표 칩 3: case1·read·case2. 직선 회전+이동은 lineLab/lineFamilyLab 문법(원점 픽셀 기준).
// rAF 금지(CSS 트랜지션+타이머 Set). 스타일: math2.css .lbd-* 섹션(lfm 스테퍼 재사용).
import { el, clear } from "../../core/dom";
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

export const lineBuildLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "case1", label: "사건 1", sub: "기울기+점 하나" },
    { id: "read", label: "기울기 읽기", sub: "잠김" },
    { id: "case2", label: "사건 2", sub: "잠김" },
  ]);

  const board = mboard(540);
  const clueCard = el("div", { class: "lbd-clue" });
  const spec = planeSpec({ min: -5, max: 5, size: 340 });
  const svgWrap = el("div", { class: "mcl-plane" });
  const O = `${spec.px(0)}px ${spec.py(0)}px`;
  svgWrap.innerHTML =
    `<svg viewBox="${spec.vb}" xmlns="http://www.w3.org/2000/svg" fill="none">${spec.grid}` +
    `<g class="lbd-tri"></g>` +
    `<g class="lbd-pts"></g>` +
    `<g class="lbd-line" style="transform-origin:${O}; transition: transform .3s var(--ease-out)">` +
    `<line x1="${spec.px(0) - 300}" y1="${spec.py(0)}" x2="${spec.px(0) + 300}" y2="${spec.py(0)}" stroke="#0CA678" stroke-width="3.2" stroke-linecap="round"/>` +
    `</g>` +
    `</svg>`;
  const eqCard = el("div", { class: "mdr-q lbd-eq", attrs: { "aria-live": "polite" } });
  const ctlRow = el("div", { class: "lfm-ctl" });
  const qline = el("div", { class: "mq6-q m2u3q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(clueCard, svgWrap, eqCard, ctlRow, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "단서 카드를 읽고, 스테퍼로 직선을 복원해요. <b>기울기(a)부터</b> 맞추는 게 수사의 정석!",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const gLine = svgWrap.querySelector(".lbd-line") as SVGGElement;
  const gPts = svgWrap.querySelector(".lbd-pts") as SVGGElement;
  const gTri = svgWrap.querySelector(".lbd-tri") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let a = 1;
  let b = 0;
  let phase: "case1" | "read" | "case2" | "done" = "case1";
  let aLocked1 = false; // 사건 1에서 기울기 맞춤 안내를 한 번만
  const reads: Record<string, HTMLElement> = {}; // 스테퍼 읽기 표시(리셋 때 갱신)

  const fmtA = (v: number): string => (v % 1 === 0 ? String(v) : v.toFixed(1));
  const eqStr = (): string => {
    const ax = a === 1 ? "x" : a === -1 ? "-x" : `${fmtA(a)}x`;
    return b === 0 ? `y=${ax}` : b > 0 ? `y=${ax}+${b}` : `y=${ax}-${Math.abs(b)}`;
  };

  function paint(): void {
    gLine.style.transform = `translateY(${(-b * spec.unit).toFixed(1)}px) rotate(${(-Math.atan(a) * 180) / Math.PI}deg)`;
    eqCard.innerHTML = `<span class="mcl-k">지금 짐작</span> ${mfmt(eqStr())}`;
  }

  function star(x: number, y: number, color: string, dark: string): string {
    return (
      `<circle cx="${spec.px(x)}" cy="${spec.py(y)}" r="10" fill="${color}" opacity=".18"/>` +
      `<circle cx="${spec.px(x)}" cy="${spec.py(y)}" r="5.4" fill="${color}" stroke="${dark}" stroke-width="1.8"/>` +
      `<text x="${spec.px(x) + 9}" y="${spec.py(y) - 8}" font-size="10.5" font-weight="900" fill="${dark}">(${String(x).replace("-", "−")}, ${String(y).replace("-", "−")})</text>`
    );
  }

  function setCase1(): void {
    clueCard.innerHTML =
      `<b class="lbd-k">사건 1</b> 단서: 기울기가 <b>2</b>, 점 <b>(1, 3)</b>을 지나간 직선을 찾아라!`;
    gPts.innerHTML = star(1, 3, "#E8A93E", "#9C5A10");
  }

  function judgeCase1(): void {
    if (a === 2 && !aLocked1) {
      aLocked1 = true;
      toast("기울기 2, 방향 일치! 이제 b로 위아래를 맞춰 점을 꿰뚫어요.");
    }
    if (a === 2 && b === 1) {
      chips.on("case1", "y=2x+1!");
      haptic(HAPTIC.done);
      toast("점 (1, 3) 관통! 복원된 식은 y=2x+1");
      helper.innerHTML =
        "기울기를 먼저, 그다음 점을 지나도록 b를 조정. 이게 식 구하기의 정석 순서예요! 다음 사건은 <b>점 두 개</b>뿐이에요.";
      phase = "read";
      later(setRead, 1600);
    }
  }

  function setRead(): void {
    a = 1;
    b = 0;
    reads.a.innerHTML = `<i>a</i> = <b>1</b>`;
    reads.b.innerHTML = `<i>b</i> = <b>0</b>`;
    paint();
    clueCard.innerHTML = `<b class="lbd-k">사건 2</b> 단서: 두 점 <b>(−1, 4)</b>와 <b>(2, −2)</b>를 지나간 직선을 찾아라!`;
    gPts.innerHTML = star(-1, 4, "#8A6EE0", "#6A55F2") + star(2, -2, "#8A6EE0", "#6A55F2");
    // 두 점 사이 계단 세모 자동 표시(왼→오: 가로 +3, 세로 -6)
    const cx = spec.px(2);
    const cy = spec.py(4);
    gTri.innerHTML =
      `<line x1="${spec.px(-1)}" y1="${cy}" x2="${cx}" y2="${cy}" stroke="#E8A93E" stroke-width="2.2" stroke-dasharray="5 4"/>` +
      `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${spec.py(-2)}" stroke="#E8608A" stroke-width="2.2" stroke-dasharray="5 4"/>` +
      `<text x="${(spec.px(-1) + cx) / 2}" y="${cy - 7}" text-anchor="middle" font-size="11" font-weight="900" fill="#B87708">가로 +3</text>` +
      `<text x="${cx + 7}" y="${(cy + spec.py(-2)) / 2 + 4}" font-size="11" font-weight="900" fill="#C2255C">세로 −6</text>`;
    helper.innerHTML = "기울기 단서가 없다고요? 아니요, <b>두 점 사이에 이미 있어요</b>. 세모를 읽어 보세요!";
    qline.innerHTML = "가로 +3, 세로 −6. 이 직선의 기울기는?";
    const items = [
      { t: "+2", good: false, fb: "부호 함정! 오른쪽으로 가며 y가 '내려가면' 세로 증가량이 음수예요. −6/3 = −2." },
      { t: "−2", good: true, fb: "정확해요! (세로 증가량)/(가로 증가량) = −6/3 = −2." },
      { t: "−3", good: false, fb: "위아래가 바뀌었어요. 기울기는 (세로)/(가로), −6을 3으로 나눠서 −2!" },
    ];
    const row = el("div", { class: "mq6-choices" });
    let done = false;
    const btns: { bt: HTMLButtonElement; good: boolean }[] = [];
    for (const it of items) {
      const bt = el("button", { class: "mq6-choice", text: it.t, attrs: { type: "button" } });
      bt.addEventListener("click", () => {
        if (done) return;
        done = true;
        haptic(it.good ? HAPTIC.correct : HAPTIC.wrong);
        for (const z of btns) {
          z.bt.disabled = true;
          if (z.good) z.bt.classList.add("ok");
        }
        if (!it.good) bt.classList.add("no");
        toast(it.fb);
        later(() => {
          qline.innerHTML = "";
          clear(ctl);
          chips.on("read", "−2!");
          phase = "case2";
          helper.innerHTML = "기울기 −2를 알아냈으니, 스테퍼로 <b>a=−2</b>를 맞추고 b로 두 점을 동시에 꿰뚫어요!";
        }, 1800);
      });
      btns.push({ bt, good: !!it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
  }

  function judgeCase2(): void {
    if (a === -2 && b === 2) {
      chips.on("case2", "y=−2x+2!");
      haptic(HAPTIC.done);
      toast("두 점 동시 관통! 복원된 식은 y=−2x+2");
      helper.innerHTML =
        "점 두 개뿐이어도 <b>기울기는 두 점 사이 세모에서</b>, b는 점을 관통시키며. 어떤 단서 조합이든 " +
        "결국 <b>a와 b 두 가지</b>만 알아내면 식이 복원돼요!";
      phase = "done";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  }

  function stepper(label: string, get: () => number, set: (v: number) => void, step: number, min: number, max: number, skipZero: boolean): HTMLElement {
    const read = el("span", { class: "lfm-read", html: `<i>${label}</i> = <b>${fmtA(get()).replace("-", "−")}</b>` });
    reads[label] = read;
    const mk = (d: number): HTMLButtonElement => {
      const bt = el("button", { class: "ct-btn", attrs: { type: "button", "aria-label": `${label} ${d > 0 ? "키우기" : "줄이기"}` } }, el("span", { text: d > 0 ? "+" : "−" })) as HTMLButtonElement;
      bt.addEventListener("click", () => {
        if (phase === "read" || phase === "done") return;
        let next = Math.round((get() + d * step) * 2) / 2;
        if (skipZero && next === 0) next = d > 0 ? step : -step;
        next = Math.max(min, Math.min(max, next));
        if (next === get()) return;
        set(next);
        haptic(HAPTIC.tap);
        read.innerHTML = `<i>${label}</i> = <b>${fmtA(get()).replace("-", "−")}</b>`;
        paint();
        if (phase === "case1") judgeCase1();
        else if (phase === "case2") judgeCase2();
      });
      return bt;
    };
    return el("div", { class: "lfm-step" }, mk(-1), read, mk(1));
  }

  ctlRow.append(
    stepper("a", () => a, (v) => (a = v), 0.5, -3, 3, true),
    stepper("b", () => b, (v) => (b = v), 1, -4, 4, false),
  );

  setCase1();
  paint();
  api.setCTA("두 사건을 해결하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
