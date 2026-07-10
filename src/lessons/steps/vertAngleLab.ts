// vertAngleLab, 맞꼭지각 관측소(Ⅳ 기본 도형 — 교과서 149~150쪽 교각·맞꼭지각).
// 두 직선(l 고정, m 드래그 회전)의 교각 4개 — 마주 보는 쌍은 같은 색(a·c 앰버, b·d 시안).
// 국면 3개: 1 관찰 기록(돌리고 "기록하기" 3행 → 항상 ∠a=∠c 귀납) →
//   2 왜 같을까(평각 180° 반원 연출 + 등식 카드 시퀀스) → 3 정밀 조준(∠a=50° 스냅 → 맞꼭지각 명명).
// 판정·기록 확정은 pointerup/버튼에서, 드래그 중에는 즉시 갱신만(트랜지션 없음).
// 모션은 전부 CSS transition/keyframes + setTimeout 체인(타이머는 Set으로 모아 cleanup 일괄 해제). rAF 금지.

import { el, clear, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import {
  GEO,
  polar,
  angleOf,
  normDeg,
  arcPath,
  angleArc,
  dot,
  ptLabel,
  lineThrough,
  lineSvg,
  capturePointer,
} from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface VertStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/* 무대 기하(SVG 좌표) */
const W = 340;
const H = 256;
const OX = 170;
const OY = 128;
const L = 14; // 직선 l의 수학 각도(고정, 수평에서 +14°)
const MIN = 12; // l과 m의 최소 벌어짐(일치 방지)

/** 직선 이름표(l, m) — 반직선 위 r 지점에서 수직으로 살짝 비켜 배치. */
function lineLabel(r: number, aDeg: number, name: string): string {
  const p = polar(OX, OY, r, aDeg);
  const off = polar(0, 0, 11, aDeg + 90);
  return `<text x="${(p.x + off.x).toFixed(1)}" y="${(p.y + off.y + 4).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" font-style="italic" fill="${GEO.soft}">${name}</text>`;
}

/** 교각 하나 = 부채꼴 + 이름·실시간 각도 값 라벨. */
function wedge(a0: number, a1: number, color: string, name: string, val: number): string {
  const mid = a0 + normDeg(a1 - a0) / 2;
  const t = polar(OX, OY, 56, mid);
  return (
    angleArc(OX, OY, 34, a0, a1, color, undefined, { fill: true, width: 2.6 }) +
    `<text x="${t.x.toFixed(1)}" y="${(t.y + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" fill="${color}">∠${name} ${val}°</text>`
  );
}

/** 비밀 연출용 반원(평각 180°) — stroke-dashoffset으로 그려지는 애니메이션. */
function seqArc(a0: number, r: number, color: string): string {
  const len = Math.ceil(Math.PI * r) + 4;
  const t = polar(OX, OY, r + 13, a0 + 90);
  return (
    `<path d="${arcPath(OX, OY, r, a0, a0 + 180)}" class="mvl-seq-arc" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" style="stroke-dasharray:${len};stroke-dashoffset:${len}"/>` +
    `<text class="mvl-seq-t" x="${t.x.toFixed(1)}" y="${(t.y + 4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${color}">평각 180°</text>`
  );
}

export const vertAngleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as VertStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "same", label: "항상 같다", sub: "기록 0/3" },
    { id: "why", label: "비밀은 평각", sub: "180°" },
    { id: "aim", label: "정밀 조준", sub: "∠a=50°" },
  ]);

  const board = mboard(540);
  const stage = el("div", { class: "mvl-stage" });
  const lLine = lineThrough(OX, OY, L, 124);
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="mvl-fills"></g>` +
    lineSvg(lLine.x1, lLine.y1, lLine.x2, lLine.y2, GEO.ink, 3) +
    lineLabel(112, L, "l") +
    `<g class="mvl-mline"></g><g class="mvl-seq"></g><g class="mvl-flash"></g>` +
    dot(OX, OY, GEO.pt, 4.5) +
    ptLabel(OX, OY, "O", -11, 15, GEO.soft) +
    `<rect x="0" y="0" width="${W}" height="${H}" fill="transparent"/></svg>`;

  const panel = el("div", { class: "mvl-panel" });
  const inst = el("div", { class: "mvl-inst", html: "직선 <i>m</i>을 돌려 보고, 멈출 때마다 기록을 남겨 보세요" });
  const ctl = el("div", { class: "mvl-ctl" });
  const recBtn = el("button", { class: "mvl-btn", text: "기록하기", attrs: { type: "button" } }) as HTMLButtonElement;
  const secretBtn = el("button", { class: "mvl-btn", text: "비밀 보기", attrs: { type: "button" } }) as HTMLButtonElement;
  const aimRead = el("div", { class: "mvl-aimread" });
  const table = el("div", { class: "mvl-table" });
  table.appendChild(
    el(
      "div",
      { class: "mvl-thead" },
      el("span", { class: "mvl-am", text: "∠a (위)" }),
      el("i", { text: "" }),
      el("span", { class: "mvl-am", text: "∠c (아래)" }),
    ),
  );
  const rowEls: HTMLElement[] = [];
  for (let i = 0; i < 3; i++) {
    const r = el(
      "div",
      { class: "mvl-row" },
      el("span", { class: "va", html: `<span class="ph">?</span>` }),
      el("i", { text: "" }),
      el("span", { class: "vc", html: `<span class="ph">?</span>` }),
    );
    rowEls.push(r);
    table.appendChild(r);
  }
  const eqs = el("div", { class: "mvl-eqs" });
  ctl.appendChild(recBtn);
  panel.append(inst, ctl, table, eqs);

  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "직선 <i>m</i>을 드래그로 돌리면 네 각이 함께 변해요. 마주 보는 각을 잘 봐요!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gFills = svg.querySelector(".mvl-fills") as SVGGElement;
  const gM = svg.querySelector(".mvl-mline") as SVGGElement;
  const gSeq = svg.querySelector(".mvl-seq") as SVGGElement;
  const gFlash = svg.querySelector(".mvl-flash") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let m0 = 62; // l에서 잰 m의 방향(도), [MIN, 180-MIN] — ∠a의 크기와 같다
  let phase: 1 | 2 | 3 = 1;
  let seqLock = false; // 비밀 연출 중 조작 잠금
  let finished = false;
  let dragging = false;
  const recs: number[] = []; // 관찰 기록(∠a 반올림 값)

  function render(): void {
    const M = L + m0;
    const ra = Math.round(m0);
    const rb = Math.round(180 - m0);
    gFills.innerHTML =
      wedge(L, M, GEO.hlA, "a", ra) +
      wedge(M, L + 180, GEO.hlB, "b", rb) +
      wedge(L + 180, M + 180, GEO.hlA, "c", ra) +
      wedge(M + 180, L + 360, GEO.hlB, "d", rb);
    const ml = lineThrough(OX, OY, M, 118);
    const knob = polar(OX, OY, 88, M);
    gM.innerHTML =
      lineSvg(ml.x1, ml.y1, ml.x2, ml.y2, GEO.ink, 3) +
      `<circle cx="${knob.x.toFixed(1)}" cy="${knob.y.toFixed(1)}" r="8" fill="#FFFFFF" stroke="${GEO.ink}" stroke-width="2"/>` +
      lineLabel(102, M, "m");
    if (phase === 3 && !finished) aimRead.innerHTML = `지금 ∠a = <b>${ra}°</b>`;
  }

  function fillRow(i: number, v: number): void {
    const r = rowEls[i];
    r.classList.add("on");
    (r.querySelector(".va") as HTMLElement).textContent = `${v}°`;
    (r.querySelector("i") as HTMLElement).textContent = "=";
    (r.querySelector(".vc") as HTMLElement).textContent = `${v}°`;
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "두 직선이 만나면 각 4개, 마주 보는 짝꿍끼리는 언제나 같아요. 이름하여 <b>맞꼭지각</b>!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 국면 1: 관찰 기록 ── */
  recBtn.addEventListener("click", () => {
    if (phase !== 1) return;
    const av = Math.round(m0);
    if (recs.length > 0 && Math.abs(av - recs[recs.length - 1]) < 5) {
      haptic(HAPTIC.cross);
      toast("직선을 조금 더 돌려서, 다른 각도로!");
      return;
    }
    haptic(HAPTIC.correct);
    recs.push(av);
    fillRow(recs.length - 1, av);
    (chips.el.querySelector(`[data-g="same"] span`) as HTMLElement).textContent = `기록 ${recs.length}/3`;
    if (recs.length >= 3) {
      chips.on("same", "3/3 같음!");
      toast("돌려도 돌려도 마주 보는 두 각은 똑같아요!");
      recBtn.disabled = true;
      later(startPhase2, 1400);
    } else {
      toast(`기록! ∠a도 ∠c도 똑같이 ${av}°`);
    }
  });

  /* ── 국면 2: 왜 같을까(평각 연출) ── */
  function startPhase2(): void {
    if (finished) return;
    phase = 2;
    inst.innerHTML = "우연이 아니에요. 왜 항상 같은지, 비밀 장치를 켜 볼까요?";
    clear(ctl);
    ctl.appendChild(secretBtn);
    later(() => secretBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    helper.innerHTML = "세 번 모두 <b>∠a = ∠c</b>! 비밀 보기를 누르면 이유가 보여요.";
  }

  secretBtn.addEventListener("click", () => {
    if (phase !== 2 || seqLock) return;
    seqLock = true;
    secretBtn.disabled = true;
    haptic(HAPTIC.tap);
    const M = L + m0;
    // ① 직선 l 위쪽 반원: ∠a + ∠b = 180°
    gSeq.insertAdjacentHTML("beforeend", seqArc(L, 68, GEO.hlC));
    eqs.appendChild(
      el("div", {
        class: "mvl-eq pop",
        html: `<b class="mvl-am">∠a</b> + <b class="mvl-cy">∠b</b> = 180° <span class="mvl-tag">직선 l 위 평각</span>`,
      }),
    );
    // ② 직선 m 위쪽 반원: ∠c + ∠b = 180°
    later(() => {
      gSeq.insertAdjacentHTML("beforeend", seqArc(M, 82, GEO.hlD));
      eqs.appendChild(
        el("div", {
          class: "mvl-eq pop",
          html: `<b class="mvl-am">∠c</b> + <b class="mvl-cy">∠b</b> = 180° <span class="mvl-tag">직선 m 위 평각</span>`,
        }),
      );
    }, 1500);
    // ③ 두 식 나란히 → 등식 완성 팝
    later(() => {
      haptic(HAPTIC.correct);
      eqs.appendChild(
        el("div", {
          class: "mvl-concl pop",
          html: `그래서 <b class="mvl-am">∠a = ∠c</b>! <span>둘 다 180°에서 똑같은 <b class="mvl-cy">∠b</b>를 뺀 값이니까요.</span>`,
        }),
      );
    }, 3000);
    later(() => {
      chips.on("why", "확인!");
      seqLock = false;
      later(startPhase3, 1300);
    }, 4300);
  });

  /* ── 국면 3: 정밀 조준 ── */
  function startPhase3(): void {
    if (finished) return;
    phase = 3;
    gSeq.innerHTML = "";
    m0 = 96; // 목표(50°)에서 떨어진 자리에서 다시 시작
    table.remove();
    clear(eqs);
    clear(ctl);
    ctl.appendChild(aimRead);
    render();
    inst.innerHTML = `미션: <b class="mvl-am">∠a</b>를 정확히 <b>50°</b>로 만들어 보세요`;
    helper.innerHTML = "직선 <i>m</i>을 돌려 <b>∠a = 50°</b>에 맞추고 손을 떼면 판정돼요!";
  }

  function judgeAim(): void {
    const ra = Math.round(m0);
    if (ra >= 48 && ra <= 52) {
      m0 = 50; // 스냅
      render();
      const M = L + m0;
      gFlash.innerHTML =
        `<g class="mvl-glow">` +
        angleArc(OX, OY, 34, L, M, GEO.hlA, undefined, { fill: true, width: 3.2 }) +
        angleArc(OX, OY, 34, L + 180, M + 180, GEO.hlA, undefined, { fill: true, width: 3.2 }) +
        `</g>`;
      haptic(HAPTIC.correct);
      toast("∠a = 50°, 그럼 ∠c도 저절로 50°!");
      inst.innerHTML = `명중! <b class="mvl-am">∠a = 50°</b>, 마주 보는 <b class="mvl-am">∠c</b>도 함께 50°가 됐어요.`;
      clear(ctl);
      ctl.appendChild(el("div", { class: "mvl-name pop", text: "맞꼭지각" }));
      ctl.appendChild(el("div", { class: "mvl-namesub", text: "마주 보는 두 각의 이름, 크기는 언제나 같아요" }));
      chips.on("aim", "명중!");
      later(finish, 600);
    } else {
      haptic(HAPTIC.cross);
      toast(ra < 50 ? `지금 ${ra}°, 조금 더 벌려요!` : `지금 ${ra}°, 조금 좁혀요!`);
    }
  }

  /* ── 드래그(모든 국면 공통, 연출 중에는 잠금) ── */
  function pointerOrient(e: PointerEvent): number {
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    const sy = ((e.clientY - rect.top) / rect.height) * H;
    let rel = normDeg(angleOf(OX, OY, sx, sy) - L);
    if (rel >= 180) rel -= 180; // 직선은 방향이 둘 — 같은 기울기로 접는다
    return clamp(rel, MIN, 180 - MIN);
  }

  svg.addEventListener("pointerdown", (e) => {
    if (seqLock) return;
    dragging = true;
    capturePointer(svg, e.pointerId);
    m0 = pointerOrient(e);
    render();
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging || seqLock) return;
    m0 = pointerOrient(e);
    render();
  });
  svg.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    if (seqLock) return;
    m0 = pointerOrient(e);
    render();
    if (phase === 3 && !finished) judgeAim();
  });
  svg.addEventListener("pointercancel", () => {
    dragging = false;
  });

  render();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
