// quadLab, 사분면 탐사(교과서 108~109쪽). 점 하나를 드래그(또는 탭)해 옮기면
// 부호 패널과 구역 하이라이트가 실시간으로 따라온다.
//   목표 ① 네 사분면 모두 방문 ② 축 위에 올려 "어느 사분면도 아님" 발견 ③ 부호 조건 미션(x<0, y<0)
// 점은 정수 격자에 스냅(부호·축 판정이 명확). setPointerCapture는 try/catch(사고 7).
// 채점 아님(발견 랩), 전 목표 달성 시 recordQuiz(true)+enableCTA. rAF 금지.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips, planeSpec } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface QuadStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const Q_TINT = [
  { q: 1, color: "#0DA5C6" },
  { q: 2, color: "#8A6EE0" },
  { q: 3, color: "#F08C2E" },
  { q: 4, color: "#12B886" },
];

export const quadLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as QuadStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "visit", label: "네 구역 방문", sub: "0/4" },
    { id: "axis", label: "축 위의 비밀", sub: "경계에 올려 봐요" },
    { id: "sign", label: "부호 미션", sub: "잠김" },
  ]);

  const board = mboard(470);
  const spec = planeSpec({ min: -5, max: 5, size: 340 });
  const svgWrap = el("div", { class: "mcl-plane" });

  // 사분면 틴트 + 이름표(반시계 순서: 1 → 2 → 3 → 4)
  const o = spec.px(0);
  const lo = spec.px(spec.min);
  const hi = spec.px(spec.max);
  const zone = (q: number): string => {
    const [x0, x1] = q === 1 || q === 4 ? [o, hi] : [lo, o];
    const [y0, y1] = q === 1 || q === 2 ? [spec.py(spec.max), o] : [o, spec.py(spec.min)];
    const c = Q_TINT[q - 1].color;
    const tx = (x0 + x1) / 2;
    const ty = (y0 + y1) / 2;
    return (
      `<rect class="ql-z ql-z${q}" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${c}" opacity=".05" style="transition: opacity .3s ease"/>` +
      `<text x="${tx}" y="${ty - 52}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${c}" opacity=".5">제${q}사분면</text>`
    );
  };
  svgWrap.innerHTML =
    `<svg viewBox="${spec.vb}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    zone(2) + zone(1) + zone(3) + zone(4) + spec.grid +
    `<g class="ql-pt" style="transition: transform .14s ease-out">` +
    `<circle class="ql-halo" r="16" fill="#0DA5C6" opacity=".18"/>` +
    `<circle r="8" fill="url(#ql-bd)" stroke="#077E9C" stroke-width="1.8"/>` +
    `<circle r="22" fill="transparent"/>` +
    `</g>` +
    `<defs><radialGradient id="ql-bd" cx=".36" cy=".3" r="1"><stop offset="0" stop-color="#7FE0EE"/><stop offset="1" stop-color="#0DA5C6"/></radialGradient></defs>` +
    `</svg>`;
  const panel = el("div", {
    class: "mql-panel",
    html: `<b class="mql-name"></b><span class="mql-signs"><span class="mql-lab">x</span><b class="mql-sx"></b><span class="mql-lab">y</span><b class="mql-sy"></b></span>`,
  });
  const mission = el("div", { class: "mql-mission", html: "점을 끌거나 원하는 자리를 탭해 옮겨 보세요." });
  board.append(svgWrap, panel, mission);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "파란 점을 <b>이리저리 옮기며</b> 아래 패널을 관찰해요. 네 구역의 부호가 각각 어떻게 다른가요?",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const pt = svg.querySelector(".ql-pt") as SVGGElement;
  const nameEl = panel.querySelector(".mql-name") as HTMLElement;
  const sxEl = panel.querySelector(".mql-sx") as HTMLElement;
  const syEl = panel.querySelector(".mql-sy") as HTMLElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let px = 2;
  let py = 2;
  const visited = new Set<number>();
  let axisDone = false;
  let signOpen = false;
  let signDone = false;
  let finished = false;

  const quadrantOf = (x: number, y: number): number =>
    x > 0 && y > 0 ? 1 : x < 0 && y > 0 ? 2 : x < 0 && y < 0 ? 3 : x > 0 && y < 0 ? 4 : 0;

  function signChip(elx: HTMLElement, v: number): void {
    elx.textContent = v > 0 ? "+" : v < 0 ? "−" : "0";
    elx.classList.remove("pos", "neg", "zero");
    elx.classList.add(v > 0 ? "pos" : v < 0 ? "neg" : "zero");
  }

  function paint(): void {
    pt.style.transform = `translate(${spec.px(px)}px, ${spec.py(py)}px)`;
    const q = quadrantOf(px, py);
    for (let i = 1; i <= 4; i++) (svg.querySelector(`.ql-z${i}`) as SVGRectElement).style.opacity = i === q ? "0.16" : "0.05";
    signChip(sxEl, px);
    signChip(syEl, py);
    if (q > 0) {
      nameEl.textContent = `제${q}사분면`;
      nameEl.style.color = Q_TINT[q - 1].color;
    } else if (px === 0 && py === 0) {
      nameEl.textContent = "원점";
      nameEl.style.color = "var(--n700)";
    } else {
      nameEl.textContent = px === 0 ? "y축 위" : "x축 위";
      nameEl.style.color = "var(--n700)";
    }
  }

  /** 이동을 마쳤을 때(드롭)만 미션을 판정한다. */
  function judge(): void {
    if (finished) return;
    const q = quadrantOf(px, py);
    if (q > 0 && !visited.has(q)) {
      visited.add(q);
      haptic(HAPTIC.tap);
      const chip = chips.el.querySelector(`[data-g="visit"] span`) as HTMLElement;
      chip.textContent = `${visited.size}/4`;
      if (visited.size === 4) {
        chips.on("visit", "완주!");
        toast("네 구역 완주! 부호 조합이 전부 달랐죠?");
        later(() => {
          helper.innerHTML = "이제 점을 <b>x축이나 y축 위</b>(경계선)에 정확히 올려 보세요. 무슨 일이 생길까요?";
          mission.innerHTML = "미션: 점을 <b>축 위</b>에 올리기";
        }, 900);
      } else {
        toast(`제${q}사분면 방문! (${visited.size}/4)`);
      }
    }
    if (q === 0 && visited.size === 4 && !axisDone) {
      axisDone = true;
      chips.on("axis", "발견!");
      haptic(HAPTIC.correct);
      const where = px === 0 && py === 0 ? "원점은" : px === 0 ? "y축 위의 점은" : "x축 위의 점은";
      toast(`${where} 어느 사분면에도 속하지 않아요!`);
      helper.innerHTML =
        "중요한 발견! <b>좌표축 위의 점(원점 포함)은 어느 사분면에도 속하지 않아요.</b> 사분면은 축으로 나뉜 네 조각의 '안쪽'만 말하거든요.";
      later(() => {
        signOpen = true;
        const chip = chips.el.querySelector(`[data-g="sign"] span`) as HTMLElement;
        chip.textContent = "도전!";
        mission.innerHTML = "마지막 미션: <b>x좌표<0, y좌표<0</b>인 곳으로!";
        helper.innerHTML = "부호만 보고 구역을 찾을 수 있나요? <b>x좌표<0, y좌표<0</b>인 자리에 점을 놓아 보세요.";
      }, 2100);
    }
    if (signOpen && !signDone && px < 0 && py < 0) {
      signDone = true;
      chips.on("sign", "제3사분면!");
      haptic(HAPTIC.done);
      toast("(−, −)는 제3사분면, 정확해요!");
      finished = true;
      helper.innerHTML =
        "완벽해요! 반시계 방향으로 <b>1(+,+) → 2(−,+) → 3(−,−) → 4(+,−)</b>. 부호 두 개면 구역이 바로 보여요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  }

  function moveTo(clientX: number, clientY: number): void {
    const rect = svg.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * spec.size;
    const sy = ((clientY - rect.top) / rect.height) * spec.size;
    px = Math.max(spec.min, Math.min(spec.max, Math.round(spec.vx(sx))));
    py = Math.max(spec.min, Math.min(spec.max, Math.round(spec.vy(sy))));
    paint();
  }

  let dragging = false;
  svg.addEventListener("pointerdown", (e) => {
    dragging = true;
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트 안전(사고 7) */
    }
    moveTo(e.clientX, e.clientY);
  });
  svg.addEventListener("pointermove", (e) => {
    if (dragging) moveTo(e.clientX, e.clientY);
  });
  const drop = (): void => {
    if (!dragging) return;
    dragging = false;
    judge();
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  paint();
  api.setCTA("세 미션을 마치면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
