// shiftGraphLab, 직선 통째로 옮기기(중2 수학 Ⅲ L3, 책 102~104쪽). y=2x 직선을 손으로 잡아
// 위아래로 끌면 직선 위 모든 점이 "같은 거리만큼" 함께 이동하는 것을 목격한다(평행이동의 선체험,
// 명명은 concept 몫). 회색 점선(y=2x 원본)은 제자리에 남아 이동량 b를 세로 연결선으로 보여 준다.
// 국면 1(up): 위로 3칸 끌어 y=2x+3 만들기, 네 표본점의 연결선이 전부 +3.
// 국면 2(down): 아래로 2칸 끌어 y=2x-2 만들기, 아래 이동은 b가 음수.
// 국면 3(shape): "옮기는 동안 기울어진 정도(모양)는?" 판정 질문, 통째로 이동이라 모양 불변.
// 드래그는 자유(실수), 놓는 순간 정수 b로 스냅(판정은 pointerup, 격자 조작 문법).
// 목표 칩 3: up·down·shape. setPointerCapture try/catch(사고 7), rAF 금지(CSS 트랜지션+타이머 Set).
// 스타일: math2.css .sgl-* 섹션. 참조: quadLab(드래그), lineLab(planeSpec 무대), ineqTruthLab(mq6 ask).
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

const SAMPLE_XS = [-2, -1, 0, 1]; // 표본점(연결선을 그릴 x들)

export const shiftGraphLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "up", label: "위로 3칸", sub: "y=2x+3" },
    { id: "down", label: "아래로 2칸", sub: "y=2x−2" },
    { id: "shape", label: "모양은?", sub: "판정" },
  ]);

  const board = mboard(500);
  const eqCard = el("div", { class: "mdr-q sgl-eq" });
  const spec = planeSpec({ min: -6, max: 6, size: 340, labelEvery: 2 });
  const svgWrap = el("div", { class: "mcl-plane" });
  const L = 300; // 직선 절반 길이(px)
  const dx = 1 / Math.sqrt(5); // 기울기 2 단위 방향
  const dy = 2 / Math.sqrt(5);
  const x1 = spec.px(0) - L * dx;
  const y1 = spec.py(0) + L * dy;
  const x2 = spec.px(0) + L * dx;
  const y2 = spec.py(0) - L * dy;
  const ghostDots = SAMPLE_XS.map(
    (x) => `<circle cx="${spec.px(x)}" cy="${spec.py(2 * x)}" r="3.6" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.6"/>`,
  ).join("");
  svgWrap.innerHTML =
    `<svg viewBox="${spec.vb}" xmlns="http://www.w3.org/2000/svg" fill="none">${spec.grid}` +
    `<g class="sgl-ghost"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#94A3B8" stroke-width="2" stroke-dasharray="6 5" opacity=".7"/>${ghostDots}` +
    `<text x="${spec.px(-2) - 8}" y="${spec.py(-4) + 16}" font-size="10.5" font-weight="800" fill="#94A3B8" font-style="italic">y=2x</text></g>` +
    `<g class="sgl-links"></g>` +
    `<g class="sgl-move">` +
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0CA678" stroke-width="3.4" stroke-linecap="round"/>` +
    SAMPLE_XS.map((x) => `<circle cx="${spec.px(x)}" cy="${spec.py(2 * x)}" r="4.6" fill="#0CA678" stroke="#067D57" stroke-width="1.5"/>`).join("") +
    `</g>` +
    `</svg>`;
  const qline = el("div", { class: "mq6-q m2u3q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(eqCard, svgWrap, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "초록 직선을 <b>잡아서 위로</b> 끌어 보세요. 목표: 3칸 위, <b>y=2x+3</b>!",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gMove = svg.querySelector(".sgl-move") as SVGGElement;
  const gLinks = svg.querySelector(".sgl-links") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phase: "up" | "down" | "shape" | "done" = "up";
  let b = 0; // 놓았을 때의 정수 이동량
  let bLive = 0; // 드래그 중 실수 이동량
  let dragging = false;
  let startClientY = 0;
  let bStart = 0;

  const bStr = (v: number): string => (v >= 0 ? `+${v}` : `−${Math.abs(v)}`);
  const eqStr = (v: number): string => (v === 0 ? "y=2x" : v > 0 ? `y=2x+${v}` : `y=2x-${Math.abs(v)}`);

  function paintEq(v: number): void {
    eqCard.innerHTML = `<span class="mcl-k">지금 직선</span> ${mfmt(eqStr(v))}`;
  }

  /** 이동 그룹·연결선 다시 그리기. snap=true면 스프링 트랜지션. */
  function paint(v: number, snap: boolean): void {
    gMove.style.transition = snap ? "transform .28s var(--spring-soft)" : "none";
    gMove.style.transform = `translateY(${(-v * spec.unit).toFixed(1)}px)`;
    const vi = Math.round(v);
    if (vi === 0) {
      gLinks.innerHTML = "";
    } else {
      gLinks.innerHTML = SAMPLE_XS.map((x) => {
        const yA = spec.py(2 * x);
        const yB = yA - vi * spec.unit;
        const up = vi > 0;
        return (
          `<line x1="${spec.px(x)}" y1="${yA}" x2="${spec.px(x)}" y2="${yB}" stroke="${up ? "#0CA678" : "#E8608A"}" stroke-width="1.8" stroke-dasharray="4 3.4" opacity=".85"/>` +
          `<text x="${spec.px(x) + 5}" y="${(yA + yB) / 2 + 3.5}" font-size="10" font-weight="900" fill="${up ? "#067D57" : "#C2255C"}">${bStr(vi)}</text>`
        );
      }).join("");
    }
    paintEq(vi);
  }

  function clientToB(clientY: number): number {
    const rect = svg.getBoundingClientRect();
    const dyPx = ((startClientY - clientY) / rect.height) * spec.size;
    return Math.max(-4, Math.min(4, bStart + dyPx / spec.unit));
  }

  svg.addEventListener("pointerdown", (e) => {
    if (phase === "shape" || phase === "done") return;
    dragging = true;
    startClientY = e.clientY;
    bStart = b;
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트 안전(사고 7) */
    }
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    bLive = clientToB(e.clientY);
    paint(bLive, false);
  });
  const drop = (): void => {
    if (!dragging) return;
    dragging = false;
    b = Math.round(bLive);
    paint(b, true);
    haptic(HAPTIC.tap);
    judge();
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  function judge(): void {
    if (phase === "up") {
      if (b === 3) {
        chips.on("up", "완성!");
        haptic(HAPTIC.correct);
        toast("네 점이 전부 정확히 3칸씩 위로!");
        helper.innerHTML =
          "점선(y=2x) 위 <b>모든 점이 똑같이 +3</b>, 그래서 직선이 나란히 올라갔어요. 이번엔 <b>아래로 2칸</b>, y=2x−2!";
        phase = "down";
      } else if (b !== 0) {
        toast(b > 0 ? `지금 ${bStr(b)}칸이에요. 목표는 +3칸!` : "위로 끌어야 해요. 목표는 +3칸!");
      }
    } else if (phase === "down") {
      if (b === -2) {
        chips.on("down", "완성!");
        haptic(HAPTIC.correct);
        toast("이번엔 모든 점이 2칸씩 아래로!");
        phase = "shape";
        later(askShape, 900);
      } else {
        toast(b > 0 ? "이번엔 반대, 아래로 끌어요. 목표는 −2칸!" : `지금 ${bStr(b)}칸이에요. 목표는 −2칸!`);
      }
    }
  }

  function askShape(): void {
    helper.innerHTML = "위로도 아래로도 옮겨 봤으니, 결정적인 질문!";
    qline.innerHTML = "직선을 옮기는 동안, 직선의 <b>기울어진 정도(모양)</b>는 어떻게 됐나요?";
    const items = [
      {
        t: "위로 올릴수록 점점 가팔라졌어요",
        good: false,
        fb: "착시예요! 모든 점이 '같은 거리만큼' 이동해서 점선과 초록 직선은 딱 포개지는 같은 모양이에요.",
      },
      {
        t: "그대로예요: 통째로 미끄러질 뿐이니까요",
        good: true,
        fb: "정확해요! 모양은 그대로, 위치만 바뀌어요. 그래서 옮겨도 여전히 '나란한' 직선이죠.",
      },
    ];
    const row = el("div", { class: "mq6-choices" });
    let done = false;
    const btns: { bt: HTMLButtonElement; good: boolean }[] = [];
    for (const it of items) {
      const bt = el("button", { class: "mq6-choice wide", text: it.t, attrs: { type: "button" } });
      bt.addEventListener("click", () => {
        if (done) return;
        done = true;
        haptic(it.good ? HAPTIC.correct : HAPTIC.wrong);
        for (const x of btns) {
          x.bt.disabled = true;
          if (x.good) x.bt.classList.add("ok");
        }
        if (!it.good) bt.classList.add("no");
        toast(it.fb);
        later(() => {
          qline.innerHTML = "";
          clear(ctl);
          chips.on("shape", "모양 그대로!");
          phase = "done";
          haptic(HAPTIC.done);
          helper.innerHTML =
            "일정한 방향으로 일정한 거리만큼, <b>모양 그대로 통째로 옮기기</b>. 이 이동에도 정식 이름이 있어요. " +
            "그리고 y=2x를 위로 3만큼 옮긴 직선의 식이 <b>y=2x+3</b>이라는 것, 방금 눈으로 확인했죠!";
          api.recordQuiz(true);
          api.enableCTA(s.cta ?? "이름 붙이러 가기");
        }, 1700);
      });
      btns.push({ bt, good: !!it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
  }

  paint(0, false);
  api.setCTA("직선을 두 번 옮기면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
