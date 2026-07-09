// triSumLab, 삼각형 내각·외각 랩(Ⅴ 평면도형 — 교과서 189쪽 삼각형의 내각과 외각의 성질).
// 국면 3개: 1 세 각 조각을 아래 직선 위 한 점으로 드래그(스냅 시 자기 자리 회전 정렬),
//   셋이 모이면 평각 180° 발견 → 2 꼭짓점 A를 드래그해 모양을 바꿔도 합은 늘 180°(불변량 관찰,
//   합 미터는 반올림 보정으로 항상 180 표시) → 3 변 늘리기로 외각 등장, ∠a+∠b 조각이
//   외각 자리에 쏙 들어가는 연출(외각 = 이웃하지 않는 두 내각의 합).
// 판정: 드롭(pointerup)에서 스냅 반경 검사. 모션은 CSS transition + setTimeout 체인. rAF 금지.

import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, polar, angleOf, normDeg, arcPath, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface TriStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/* 무대 기하(SVG 좌표) */
const W = 340;
const H = 300;
const B = { x: 70, y: 172 }; // 밑변 왼쪽(고정)
const C = { x: 272, y: 172 }; // 밑변 오른쪽(고정)
const LINE_Y = 258; // 평각 무대(아래 직선)
const O = { x: 170, y: LINE_Y }; // 조각이 모이는 점
const PR = 34; // 각 조각 반지름
const COLORS = ["#F08C00", "#0DA5C6", "#E8547E"]; // ∠a(A)·∠b(B)·∠c(C)

/** 반올림 삼각형 각(합이 정확히 180이 되도록 마지막 각을 보정). */
function roundAngles(a: number, b: number): [number, number, number] {
  const ra = Math.round(a);
  const rb = Math.round(b);
  return [ra, rb, 180 - ra - rb];
}

export const triSumLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TriStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "gather", label: "세 각 모으기", sub: "0/3" },
    { id: "always", label: "모양을 바꿔도", sub: "항상 180°" },
    { id: "ext", label: "외각의 정체", sub: "= a+b" },
  ]);

  const board = mboard(600);
  const stage = el("div", { class: "mts-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="mts-line"></g>` +
    `<g class="mts-tri"></g>` +
    `<g class="mts-ext"></g>` +
    `<g class="mts-pieces"></g>` +
    `<g class="mts-apex"></g>` +
    `</svg>`;
  const panel = el("div", { class: "mts-panel" });
  const inst = el("div", { class: "mts-inst", html: "세 각 조각을 아래 <b>직선 위 점</b>으로 끌어 모아 보세요" });
  const meter = el("div", { class: "mts-meter" });
  const ctl = el("div", { class: "mts-ctl" });
  const eqs = el("div", { class: "mts-eqs" });
  panel.append(inst, meter, ctl, eqs);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "삼각형의 세 각을 색종이처럼 <b>찢어서</b> 한 점에 모으면 무슨 모양이 될까요?",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gLine = svg.querySelector(".mts-line") as SVGGElement;
  const gTri = svg.querySelector(".mts-tri") as SVGGElement;
  const gExt = svg.querySelector(".mts-ext") as SVGGElement;
  const gPieces = svg.querySelector(".mts-pieces") as SVGGElement;
  const gApex = svg.querySelector(".mts-apex") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let A = { x: 152, y: 46 }; // 꼭짓점(국면 2에서 드래그)
  let phase: 1 | 2 | 3 = 1;
  let finished = false;
  let lock = false;
  let placed = 0; // 국면 1에서 자리 잡은 조각 수
  let moveAcc = 0; // 국면 2 누적 드래그 거리

  /** 현재 삼각형의 각(도, [∠A, ∠B, ∠C] 반올림 합 180 보정). */
  function angles(): [number, number, number] {
    const aB = normDeg(angleOf(B.x, B.y, A.x, A.y) - angleOf(B.x, B.y, C.x, C.y));
    const aC = normDeg(angleOf(C.x, C.y, B.x, B.y) - angleOf(C.x, C.y, A.x, A.y));
    const [rb, rc, ra] = roundAngles(aB, aC);
    return [ra, rb, rc];
  }

  /** 꼭짓점 P의 각 조각(부채꼴) path — a0에서 a1까지 반시계. */
  function wedgePath(px: number, py: number, a0: number, a1: number, r = PR): string {
    const p0 = polar(px, py, r, a0);
    const large = normDeg(a1 - a0) > 180 ? 1 : 0;
    const p1 = polar(px, py, r, a1);
    return `M${px.toFixed(1)} ${py.toFixed(1)} L${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${r} ${r} 0 ${large} 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z`;
  }

  /** 각 꼭짓점의 두 변 방향(수학 각도): [시작, 끝](반시계로 내각을 이룸). */
  function cornerDirs(): { p: { x: number; y: number }; a0: number; a1: number }[] {
    const dirAB = angleOf(A.x, A.y, B.x, B.y);
    const dirAC = angleOf(A.x, A.y, C.x, C.y);
    const dirBA = angleOf(B.x, B.y, A.x, A.y);
    const dirBC = angleOf(B.x, B.y, C.x, C.y);
    const dirCA = angleOf(C.x, C.y, A.x, A.y);
    const dirCB = angleOf(C.x, C.y, B.x, B.y);
    // 내각이 반시계 span이 되도록 (a0→a1 반시계 = 내각)
    return [
      { p: A, a0: dirAB, a1: dirAC }, // ∠A: AB에서 AC로(반시계)
      { p: B, a0: dirBC, a1: dirBA }, // ∠B
      { p: C, a0: dirCA, a1: dirCB }, // ∠C
    ];
  }

  function drawStatic(): void {
    // 아래 평각 무대(직선 + 점)
    gLine.innerHTML =
      `<line x1="26" y1="${LINE_Y}" x2="${W - 26}" y2="${LINE_Y}" stroke="${GEO.ink}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<circle cx="${O.x}" cy="${O.y}" r="5" fill="${GEO.ink}"/>` +
      `<circle class="mts-halo" cx="${O.x}" cy="${O.y}" r="14" fill="none" stroke="#2F9E44" stroke-width="2" stroke-dasharray="4 5"/>`;
  }

  function drawTriangle(): void {
    const [ra, rb, rc] = angles();
    const cs = cornerDirs();
    const wedges = cs
      .map((c, i) => `<path d="${wedgePath(c.p.x, c.p.y, c.a0, c.a1)}" fill="${COLORS[i]}" opacity=".3"/>`)
      .join("");
    const labels = [
      { p: A, t: `a ${ra}°` },
      { p: B, t: `b ${rb}°` },
      { p: C, t: `c ${rc}°` },
    ]
      .map((l, i) => {
        const cx = (B.x + C.x + A.x) / 3;
        const cy = (B.y + C.y + A.y) / 3;
        const off = { x: (cx - l.p.x) * 0.36, y: (cy - l.p.y) * 0.36 };
        return `<text x="${(l.p.x + off.x).toFixed(1)}" y="${(l.p.y + off.y + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${COLORS[i]}">∠${l.t}</text>`;
      })
      .join("");
    gTri.innerHTML =
      `<path d="M${A.x.toFixed(1)} ${A.y.toFixed(1)} L${B.x} ${B.y} L${C.x} ${C.y} Z" stroke="${GEO.ink}" stroke-width="3" stroke-linejoin="round" fill="#FFFFFF"/>` +
      wedges +
      labels;
    // 국면 2 꼭짓점 손잡이
    gApex.innerHTML =
      phase === 2
        ? `<circle class="mts-knob" cx="${A.x.toFixed(1)}" cy="${A.y.toFixed(1)}" r="11" fill="#FFFFFF" stroke="#2F9E44" stroke-width="3"/>` +
          `<circle cx="${A.x.toFixed(1)}" cy="${A.y.toFixed(1)}" r="3.4" fill="#2F9E44"/>`
        : "";
    updateMeter();
  }

  function updateMeter(): void {
    const [ra, rb, rc] = angles();
    meter.innerHTML =
      `<b style="color:${COLORS[0]}">${ra}°</b> + <b style="color:${COLORS[1]}">${rb}°</b> + <b style="color:${COLORS[2]}">${rc}°</b> = <b class="sum">180°</b>`;
  }

  /* ── 국면 1: 조각 드래그 ──
     조각 i의 목표 자리: O에서 반시계 누적 구간(0→a, a→a+b, a+b→180). 놓는 순서와 무관하게
     자기 구간이 정해져 있어 색으로 확인된다. */
  interface Piece {
    g: SVGGElement;
    home: { x: number; y: number }; // 원래 꼭짓점
    span: number; // 각 크기
    slotStart: number; // O 기준 시작 각(반시계)
    homeStart: number; // 원래 방향(a0)
    done: boolean;
  }
  const pieces: Piece[] = [];

  function buildPieces(): void {
    gPieces.innerHTML = "";
    pieces.length = 0;
    const [ra, rb, rc] = angles();
    const spans = [ra, rb, rc];
    const cs = cornerDirs();
    const starts = [0, ra, ra + rb]; // 슬롯 시작(∠a 오른쪽부터 차곡차곡)
    for (let i = 0; i < 3; i++) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("mts-pc");
      g.dataset.i = String(i);
      // 조각은 원점(0,0) 기준 부채꼴로 그리고 transform으로 배치(끌기·회전이 쉬움)
      const p0 = polar(0, 0, PR, 0);
      const p1 = polar(0, 0, PR, spans[i]);
      const large = spans[i] > 180 ? 1 : 0;
      g.innerHTML =
        `<path d="M0 0 L${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${PR} ${PR} 0 ${large} 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z"` +
        ` fill="${COLORS[i]}" opacity=".85" stroke="${COLORS[i]}" stroke-width="1.5"/>`;
      // 시작 배치: 꼭짓점 위치·원래 방향
      g.setAttribute("transform", `translate(${cs[i].p.x} ${cs[i].p.y}) rotate(${-cs[i].a0})`);
      g.style.cursor = "grab";
      gPieces.appendChild(g);
      pieces.push({ g, home: { x: cs[i].p.x, y: cs[i].p.y }, span: spans[i], slotStart: starts[i], homeStart: cs[i].a0, done: false });
    }
  }

  function finishGather(): void {
    lock = true;
    // 평각 호 연출: O 위 반원
    gLine.insertAdjacentHTML(
      "beforeend",
      `<path d="${arcPath(O.x, O.y, PR + 10, 0, 180)}" class="mts-arc180" stroke="#2F9E44" stroke-width="3" fill="none" stroke-linecap="round"/>` +
        `<text x="${O.x}" y="${O.y - PR - 20}" text-anchor="middle" font-size="14" font-weight="900" fill="#1E7A31" class="pop">평각 180°!</text>`,
    );
    haptic(HAPTIC.done);
    toast("세 조각이 딱 맞게 일직선을 채웠어요!");
    chips.on("gather", "평각!");
    later(startPhase2, 1800);
  }

  /* ── 국면 2: 꼭짓점 드래그(불변량) ── */
  function startPhase2(): void {
    if (finished) return;
    phase = 2;
    lock = false;
    gPieces.innerHTML = "";
    gLine.innerHTML = "";
    inst.innerHTML = "꼭짓점을 <b>드래그</b>해서 삼각형 모양을 마음껏 바꿔 보세요";
    helper.innerHTML = "홀쭉하게, 뚱뚱하게! 각각의 각은 변해도 <b>합</b>은 어떻게 되는지 미터를 지켜봐요.";
    drawTriangle();
  }

  /* ── 국면 3: 외각 ── */
  function startPhase3(): void {
    if (finished) return;
    phase = 3;
    drawTriangle(); // 손잡이 제거
    const extBtn = el("button", { class: "mts-btn pulse", text: "변 BC 늘려 보기", attrs: { type: "button" } }) as HTMLButtonElement;
    ctl.appendChild(extBtn);
    inst.innerHTML = "삼각형 <b>바깥</b>에도 각이 숨어 있어요. 변을 늘려 찾아봐요!";
    helper.innerHTML = "변 BC를 C 너머로 쭉 늘리면, 변과 연장선 사이에 새 각이 생겨요.";
    extBtn.addEventListener("click", () => {
      extBtn.disabled = true;
      haptic(HAPTIC.tap);
      const D = { x: C.x + 52, y: C.y };
      const [ra, rb, rc] = angles();
      const dirCA = angleOf(C.x, C.y, A.x, A.y);
      // 연장선 + 외각 호(빈 윤곽)
      gExt.innerHTML =
        `<line class="mts-extline" x1="${C.x}" y1="${C.y}" x2="${D.x}" y2="${D.y}" stroke="${GEO.ink}" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="60" style="transition: stroke-dashoffset .6s ease-out" stroke-linecap="round"/>` +
        `<path d="${wedgePath(C.x, C.y, 0, dirCA, PR + 6)}" fill="none" stroke="#8093A8" stroke-width="2" stroke-dasharray="5 4"/>` +
        `<text x="${(C.x + 34).toFixed(1)}" y="${(C.y - 34).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="#5C6E80">외각 ${180 - rc}°</text>`;
      later(() => ((gExt.querySelector(".mts-extline") as SVGLineElement).style.strokeDashoffset = "0"), 30);
      later(() => {
        // ∠a·∠b 조각이 외각 자리로 날아 들어가는 연출
        const fly = (i: number, startDeg: number, delay: number): void => {
          const cs = cornerDirs();
          const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
          const span = i === 0 ? ra : rb;
          const p0 = polar(0, 0, PR, 0);
          const p1 = polar(0, 0, PR, span);
          g.innerHTML = `<path d="M0 0 L${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${PR} ${PR} 0 0 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z" fill="${COLORS[i]}" opacity=".85"/>`;
          g.setAttribute("transform", `translate(${cs[i].p.x} ${cs[i].p.y}) rotate(${-cs[i].a0})`);
          (g as unknown as SVGGElement).style.transition = "transform .9s cubic-bezier(.34,1.2,.5,1)";
          gExt.appendChild(g);
          later(() => {
            g.setAttribute("transform", `translate(${C.x} ${C.y}) rotate(${-startDeg})`);
            haptic(HAPTIC.tap);
          }, delay);
        };
        // 외각 구간 [0, 180-rc]를 ∠b(아래) → ∠a(위) 순서로 채움
        fly(1, 0, 120); // ∠b: 0부터
        fly(0, rb, 1000); // ∠a: b 위에
        later(() => {
          haptic(HAPTIC.correct);
          eqs.appendChild(
            el("div", {
              class: "mts-eq pop",
              html: `<b style="color:${COLORS[2]}">∠c의 외각</b> = 180° − ∠c = <b style="color:${COLORS[0]}">∠a</b> + <b style="color:${COLORS[1]}">∠b</b>`,
            }),
          );
          eqs.appendChild(
            el("div", {
              class: "mts-concl pop",
              html: `외각은 <b>이웃하지 않는 두 내각의 합</b>! <span>${ra}° + ${rb}° = ${ra + rb}°, 옆자리 ∠c만 빼고 다 더해요.</span>`,
            }),
          );
          chips.on("ext", `${ra}+${rb}`);
          later(finish, 900);
        }, 2200);
      }, 800);
    });
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "세 내각의 합은 언제나 <b>180°</b>, 한 외각은 <b>이웃하지 않는 두 내각의 합</b>. 삼각형 각의 2대 법칙 획득!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 포인터: 국면 1 조각 드래그 · 국면 2 꼭짓점 드래그 ── */
  let dragPiece: Piece | null = null;
  let dragApex = false;

  function svgPoint(e: PointerEvent): { x: number; y: number } {
    const rect = svg.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
  }

  svg.addEventListener("pointerdown", (e) => {
    if (lock || finished) return;
    const pt = svgPoint(e);
    if (phase === 1) {
      const t = (e.target as Element).closest(".mts-pc") as SVGGElement | null;
      if (!t) return;
      const pc = pieces[Number(t.dataset.i)];
      if (pc.done) return;
      dragPiece = pc;
      capturePointer(svg, e.pointerId);
      haptic(HAPTIC.tap);
    } else if (phase === 2) {
      if (Math.hypot(pt.x - A.x, pt.y - A.y) < 30) {
        dragApex = true;
        capturePointer(svg, e.pointerId);
      }
    }
  });

  svg.addEventListener("pointermove", (e) => {
    if (lock || finished) return;
    const pt = svgPoint(e);
    if (phase === 1 && dragPiece) {
      // 끌리는 동안은 회전 없이 위치만 따라감
      dragPiece.g.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${-dragPiece.homeStart})`);
    } else if (phase === 2 && dragApex) {
      const nx = clamp(pt.x, 96, 244);
      const ny = clamp(pt.y, 34, 128);
      moveAcc += Math.hypot(nx - A.x, ny - A.y);
      A = { x: nx, y: ny };
      drawTriangle();
    }
  });

  svg.addEventListener("pointerup", (e) => {
    if (phase === 1 && dragPiece) {
      const pt = svgPoint(e);
      const pc = dragPiece;
      dragPiece = null;
      if (Math.hypot(pt.x - O.x, pt.y - O.y) < 42) {
        // 스냅: 자기 슬롯으로 회전 정렬
        pc.done = true;
        pc.g.style.transition = "transform .4s cubic-bezier(.34,1.2,.5,1)";
        pc.g.setAttribute("transform", `translate(${O.x} ${O.y}) rotate(${-pc.slotStart})`);
        pc.g.style.cursor = "default";
        placed += 1;
        haptic(HAPTIC.correct);
        chips.el.querySelector(`[data-g="gather"] span`)!.textContent = `${placed}/3`;
        if (placed >= 3) later(finishGather, 450);
        else toast(`좋아요! ${3 - placed}조각 남았어요.`);
      } else {
        // 제자리 복귀
        pc.g.style.transition = "transform .35s var(--ease-out, ease-out)";
        pc.g.setAttribute("transform", `translate(${pc.home.x} ${pc.home.y}) rotate(${-pc.homeStart})`);
        later(() => (pc.g.style.transition = ""), 400);
      }
    } else if (phase === 2 && dragApex) {
      dragApex = false;
      if (moveAcc > 90) {
        const [ra, rb, rc] = angles();
        toast(`${ra}°+${rb}°+${rc}°, 여전히 180°!`);
        if (moveAcc > 210 && chips.on("always")) {
          haptic(HAPTIC.correct);
          inst.innerHTML = "어떤 삼각형을 만들어도 합은 <b>180°</b>, 이게 삼각형의 약속이에요";
          lock = true;
          later(() => {
            lock = false;
            startPhase3();
          }, 1200);
        }
      }
    }
  });
  svg.addEventListener("pointercancel", () => {
    dragPiece = null;
    dragApex = false;
  });

  drawStatic();
  drawTriangle();
  buildPieces();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
