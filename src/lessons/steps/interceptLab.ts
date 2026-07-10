// interceptLab, 절편 수집 랩(중2 수학 Ⅲ L4, 책 105~107쪽). 직선이 좌표축과 만나는 점을
// 직접 탭해 절편을 읽고(절편은 점이 아니라 '값'), 절편 두 개만으로 새 직선을 고정해 본다.
// 국면 1(read): y=2x-4 직선에서 x축과 만나는 점(2,0)·y축과 만나는 점(0,-4)을 탭
//               → x절편 2, y절편 -4 라벨. "좌표 (2,0)이 아니라 값 2!"를 토스트로 못박는다.
// 국면 2(draw): "x절편 -3, y절편 2인 직선을 그려라", 격자에서 (-3,0)과 (0,2)를 탭하면
//               두 점을 지나는 직선이 스윕으로 완성(서로 다른 두 점이 직선을 결정).
// 국면 3(origin): "y=2x(원점 직선)도 절편만으로 그릴 수 있을까?" 판정 → 원점 한 점에 꽂힌
//                 후보 직선이 부채처럼 도는 연출(icl-spin), 점 하나로는 직선이 안 정해짐을 목격.
// 목표 칩 3: read·draw·origin. 탭 판정은 최근접 격자점 스냅(pointerdown), rAF 금지.
// 스타일: math2.css .icl-* 섹션. 참조: lineLab(격자 탭)·shiftGraphLab(mq6 ask)·quadLab.
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

export const interceptLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "read", label: "절편 읽기", sub: "축과 만나는 곳" },
    { id: "draw", label: "절편으로 긋기", sub: "잠김" },
    { id: "origin", label: "원점 함정", sub: "잠김" },
  ]);

  const board = mboard(500);
  const qCard = el("div", { class: "mdr-q icl-q" });
  const spec = planeSpec({ min: -5, max: 5, size: 340 });
  const svgWrap = el("div", { class: "mcl-plane" });
  // y=2x-4: 두 점 (-0.4, -4.8)~(4.6, 5.2) 정도로 화면을 가로지르게
  const lx1 = spec.px(-0.6);
  const ly1 = spec.py(2 * -0.6 - 4);
  const lx2 = spec.px(4.6);
  const ly2 = spec.py(2 * 4.6 - 4);
  svgWrap.innerHTML =
    `<svg viewBox="${spec.vb}" xmlns="http://www.w3.org/2000/svg" fill="none">${spec.grid}` +
    `<g class="icl-line1"><line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="#0CA678" stroke-width="3.2" stroke-linecap="round"/>` +
    `<text x="${spec.px(3.4) + 6}" y="${spec.py(2 * 3.4 - 4) + 2}" font-size="11" font-weight="800" font-style="italic" fill="#067D57">y=2x−4</text></g>` +
    `<g class="icl-marks"></g>` +
    `<g class="icl-dots2"></g>` +
    `<g class="icl-line2"></g>` +
    `<g class="icl-fan" style="opacity:0"></g>` +
    `<g class="icl-flash"></g>` +
    `</svg>`;
  const qline = el("div", { class: "mq6-q m2u3q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(qCard, svgWrap, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "초록 직선이 <b>x축과 만나는 점</b>을 찾아서 탭해 보세요!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gMarks = svg.querySelector(".icl-marks") as SVGGElement;
  const gDots2 = svg.querySelector(".icl-dots2") as SVGGElement;
  const gLine2 = svg.querySelector(".icl-line2") as SVGGElement;
  const gFan = svg.querySelector(".icl-fan") as SVGGElement;
  const gFlash = svg.querySelector(".icl-flash") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  type Phase = "readX" | "readY" | "draw" | "origin" | "done";
  let phase: Phase = "readX";
  const drawGot = new Set<string>(); // 국면 2에서 찍은 점

  function flashMiss(x: number, y: number): void {
    gFlash.innerHTML = `<circle cx="${spec.px(x)}" cy="${spec.py(y)}" r="8" fill="none" stroke="#F04452" stroke-width="2.2"/>`;
    later(() => (gFlash.innerHTML = ""), 550);
    haptic(HAPTIC.cross);
  }

  function markIntercept(kind: "x" | "y"): void {
    const x = kind === "x" ? 2 : 0;
    const y = kind === "x" ? 0 : -4;
    const color = kind === "x" ? "#0CA678" : "#E8A93E";
    const dark = kind === "x" ? "#067D57" : "#9C5A10";
    gMarks.innerHTML +=
      `<g class="cl-dot"><circle cx="${spec.px(x)}" cy="${spec.py(y)}" r="6" fill="${color}" stroke="${dark}" stroke-width="1.8"/>` +
      `<rect x="${spec.px(x) + (kind === "x" ? 8 : 8)}" y="${spec.py(y) - 11}" width="${kind === "x" ? 62 : 74}" height="20" rx="9" fill="#FFFFFF" stroke="${dark}" stroke-width="1.2" opacity=".95"/>` +
      `<text x="${spec.px(x) + (kind === "x" ? 39 : 45)}" y="${spec.py(y) + 3.5}" text-anchor="middle" font-size="10.5" font-weight="900" fill="${dark}">${kind}절편 = ${kind === "x" ? "2" : "−4"}</text></g>`;
  }

  function startDraw(): void {
    phase = "draw";
    qCard.innerHTML = `<span class="mcl-k">새 임무</span> x절편이 <b>−3</b>, y절편이 <b>2</b>인 직선을 그려요`;
    helper.innerHTML = "절편 정보만으로 직선을 그릴 수 있을까요? 두 절편이 말하는 <b>두 점을 탭</b>해 보세요!";
    const sub = chips.el.querySelector(`[data-g="draw"] span`) as HTMLElement;
    sub.textContent = "점 0/2";
  }

  function finishDraw(): void {
    // 기울기 2/3(두 절편 (−3,0)·(0,2)) 직선을 화면 밖까지 연장해 스윕으로 그린다
    const t = 4.6;
    gLine2.innerHTML =
      `<line class="icl-sweep" x1="${spec.px(-3 - t)}" y1="${spec.py((2 / 3) * (-3 - t) + 2)}" x2="${spec.px(t)}" y2="${spec.py((2 / 3) * t + 2)}" stroke="#8A6EE0" stroke-width="3.2" stroke-linecap="round"/>`;
    const line = gLine2.querySelector("line") as SVGLineElement;
    const len = Math.hypot(
      Number(line.getAttribute("x2")) - Number(line.getAttribute("x1")),
      Number(line.getAttribute("y2")) - Number(line.getAttribute("y1")),
    );
    line.style.strokeDasharray = `${len}`;
    line.style.strokeDashoffset = `${len}`;
    void line.getBoundingClientRect();
    line.style.transition = "stroke-dashoffset .9s var(--ease-out)";
    line.style.strokeDashoffset = "0";
    haptic(HAPTIC.done);
    chips.on("draw", "두 점이면 끝!");
    toast("서로 다른 두 점이면 직선은 딱 하나로 정해져요!");
    helper.innerHTML = "절편 둘 = 점 둘 = 직선 완성! 그런데 <b>원점을 지나는 직선</b>이라면 어떨까요?";
    later(askOrigin, 1600);
  }

  svg.addEventListener("pointerdown", (e) => {
    if (phase === "origin" || phase === "done") return;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * spec.size;
    const sy = ((e.clientY - rect.top) / rect.height) * spec.size;
    const x = Math.round(spec.vx(sx));
    const y = Math.round(spec.vy(sy));
    if (Math.abs(spec.px(x) - sx) > spec.unit * 0.85 || Math.abs(spec.py(y) - sy) > spec.unit * 0.85) return;
    haptic(HAPTIC.tap);
    if (phase === "readX") {
      if (x === 2 && y === 0) {
        haptic(HAPTIC.correct);
        markIntercept("x");
        toast("직선이 x축을 지나는 점 (2, 0). 이 점의 x좌표 2가 'x절편'!");
        phase = "readY";
        helper.innerHTML = "이번엔 <b>y축과 만나는 점</b>을 탭!";
      } else if (Math.abs(2 * x - 4 - y) < 0.01) {
        flashMiss(x, y);
        toast("직선 위의 점이긴 한데, x축과 만나는 점을 찾아요!");
      } else if (y === 0) {
        flashMiss(x, y);
        toast("x축 위가 맞긴 한데, 직선이 지나는 곳이어야 해요!");
      } else flashMiss(x, y);
    } else if (phase === "readY") {
      if (x === 0 && y === -4) {
        haptic(HAPTIC.correct);
        markIntercept("y");
        chips.on("read", "2와 −4!");
        toast("y축과 만나는 점 (0, −4)의 y좌표 −4가 'y절편'. 절편은 점이 아니라 값!");
        later(startDraw, 1500);
      } else if (Math.abs(2 * x - 4 - y) < 0.01) {
        flashMiss(x, y);
        toast("직선 위의 점이긴 한데, y축과 만나는 점을 찾아요!");
      } else flashMiss(x, y);
    } else if (phase === "draw") {
      const isA = x === -3 && y === 0;
      const isB = x === 0 && y === 2;
      if (isA || isB) {
        const key = isA ? "a" : "b";
        if (drawGot.has(key)) {
          toast("이미 찍은 점이에요!");
          return;
        }
        drawGot.add(key);
        haptic(HAPTIC.correct);
        gDots2.innerHTML += `<g class="cl-dot"><circle cx="${spec.px(x)}" cy="${spec.py(y)}" r="5.6" fill="#8A6EE0" stroke="#6A55F2" stroke-width="1.6"/></g>`;
        const sub = chips.el.querySelector(`[data-g="draw"] span`) as HTMLElement;
        sub.textContent = `점 ${drawGot.size}/2`;
        if (drawGot.size === 2) later(finishDraw, 350);
        else toast(isA ? "x절편 −3 = 점 (−3, 0), 정확해요!" : "y절편 2 = 점 (0, 2), 정확해요!");
      } else {
        flashMiss(x, y);
        toast("절편이 말하는 점은 축 위에 있어요. x절편 −3 → (−3, 0), y절편 2 → (0, 2)!");
      }
    }
  });

  function askOrigin(): void {
    phase = "origin";
    qCard.innerHTML = `<span class="mcl-k">마지막 관문</span> ${mfmt("y=2x")} 처럼 <b>원점을 지나는 직선</b>이라면?`;
    qline.innerHTML = `${mfmt("y=2x")} 의 그래프도 <b>절편만으로</b> 그릴 수 있을까요?`;
    const items = [
      {
        t: "그릴 수 있어요: 절편이 어디든 있을 테니까요",
        good: false,
        fb: "x절편도 y절편도 전부 0, 점이 원점 '하나'뿐이에요. 점 하나로는 직선이 안 정해져요!",
      },
      {
        t: "못 그려요: 절편이 둘 다 0이라 점이 하나뿐이니까요",
        good: true,
        fb: "정확해요! 원점 하나에 꽂힌 직선은 무수히 많아요. 원점 밖의 점 하나가 더 필요하죠.",
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
        for (const z of btns) {
          z.bt.disabled = true;
          if (z.good) z.bt.classList.add("ok");
        }
        if (!it.good) bt.classList.add("no");
        toast(it.fb);
        later(spinFan, 1300);
      });
      btns.push({ bt, good: !!it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /** 원점에 꽂힌 후보 직선들이 부채처럼 도는 연출, 점 하나로는 못 정한다. */
  function spinFan(): void {
    qline.innerHTML = "";
    clear(ctl);
    const O = `${spec.px(0)}px ${spec.py(0)}px`;
    gFan.innerHTML =
      `<circle cx="${spec.px(0)}" cy="${spec.py(0)}" r="6" fill="#E8A93E" stroke="#9C5A10" stroke-width="1.8"/>` +
      `<line class="icl-spin" style="transform-origin:${O}" x1="${spec.px(0) - 210}" y1="${spec.py(0)}" x2="${spec.px(0) + 210}" y2="${spec.py(0)}" stroke="#E8A93E" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>`;
    gFan.style.transition = "opacity .4s ease";
    gFan.style.opacity = "1";
    toast("원점만 알면 이 직선일 수도, 저 직선일 수도!");
    later(() => {
      chips.on("origin", "점 하나 부족!");
      haptic(HAPTIC.done);
      helper.innerHTML =
        "정리! 절편은 그래프가 <b>축과 만나는 점의 좌표 값</b>이고, 절편 두 개(=두 점)면 직선이 딱 정해져요. " +
        "단, 원점을 지나는 직선은 절편이 둘 다 0이라 <b>다른 한 점</b>이 더 필요해요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
      phase = "done";
    }, 2400);
  }

  qCard.innerHTML = `<span class="mcl-k">관찰</span> ${mfmt("y=2x-4")} 의 그래프가 축과 만나는 곳은?`;
  api.setCTA("절편을 전부 수집하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
