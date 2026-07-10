// peelLab, "겹침 벗겨내기"(중2 수학 Ⅴ L5, 숨은 닮음 찾기 — 책 202~203쪽).
// 겹친 삼각형 구도 3종을 순차 체험: ① 공통각(△ABC 안 △ADE, ∠ADE=∠ACB 교차 대응 —
// DE와 BC는 평행이 아님) ② 맞꼭지각 나비(△ABC와 △DEC) ③ 직각 수선(∠A=90°에서 빗변에
// 수선, △ABC와 △DBA). 작은 삼각형을 40px 이상 끌면 유령 사본이 떨어져 나와 슬롯으로
// 날아가 회전·(필요시 반전) 정렬된다 — 정렬 변환은 두 대응점으로 푼 닮음(합동) 행렬을
// CSS matrix()로 적용(눈대중 금지, 반전 여부는 방향성 부호 비교로 판정). 착지 후 대응변
// 3쌍이 같은 색으로 순차 점등 + 대응 순서 리드아웃(∽) → 근거 판정(AA/SAS/SSS — L4 기왕).
// 구도 ①은 정답 후 "평행 표시 없이 동위각 금지" 함정 토스트를 노출한다.
// rAF 금지: CSS 트랜지션 + setTimeout 체인(타이머 Set → cleanup). CSS: math2.css .pel-*.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, angleArc, angleOf, normDeg, dot, ptLabel, lineSvg, rightMark, gsym, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Pt {
  x: number;
  y: number;
}

const NS = "http://www.w3.org/2000/svg";
const SIM = "#C2255C"; // 단원 액센트(작은 삼각형)
const VW = 340;
const VH = 260;
const PAIRC = [GEO.hlA, GEO.hlB, GEO.hlC]; // 대응변 3쌍 색
const PAIRH = ["rgba(240,140,0,.25)", "rgba(13,165,198,.25)", "rgba(232,84,126,.25)"];

const dist = (p: Pt, q: Pt): number => Math.hypot(q.x - p.x, q.y - p.y);
const sub = (p: Pt, q: Pt): Pt => ({ x: p.x - q.x, y: p.y - q.y });
const add = (p: Pt, v: Pt): Pt => ({ x: p.x + v.x, y: p.y + v.y });
const mul = (v: Pt, k: number): Pt => ({ x: v.x * k, y: v.y * k });
const mix = (p: Pt, q: Pt, t: number): Pt => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
const unitV = (p: Pt, q: Pt): Pt => mul(sub(q, p), 1 / dist(p, q));
const orient = (t: [Pt, Pt, Pt]): number =>
  Math.sign((t[1].x - t[0].x) * (t[2].y - t[0].y) - (t[1].y - t[0].y) * (t[2].x - t[0].x));

/** 꼭짓점 v에서 p·q 방향 사이의 각 호(반시계 스팬 180° 이하 쪽). */
function arcBetween(v: Pt, p: Pt, q: Pt, r: number, color: string): string {
  let a1 = angleOf(v.x, v.y, p.x, p.y);
  let a2 = angleOf(v.x, v.y, q.x, q.y);
  if (normDeg(a2 - a1) > 180) [a1, a2] = [a2, a1];
  return angleArc(v.x, v.y, r, a1, a2, color, undefined, { width: 2.2 });
}

/** 꼭짓점 v의 직각 표시(두 방향이 90°일 때). */
function rmAt(v: Pt, p: Pt, q: Pt, size: number, color: string): string {
  const a1 = angleOf(v.x, v.y, p.x, p.y);
  const a2 = angleOf(v.x, v.y, q.x, q.y);
  return rightMark(v.x, v.y, Math.abs(normDeg(a2 - a1) - 90) < 2 ? a1 : a2, size, color);
}

/** 두 대응점(P1→Q1, P2→Q2)으로 결정되는 회전+이동(+반전) CSS matrix 문자열. */
function simMatrix(p1: Pt, p2: Pt, q1: Pt, q2: Pt, flip: boolean): string {
  const cj = (z: Pt): Pt => (flip ? { x: z.x, y: -z.y } : z);
  const s1 = cj(p1);
  const s2 = cj(p2);
  const dx = s2.x - s1.x;
  const dy = s2.y - s1.y;
  const ex = q2.x - q1.x;
  const ey = q2.y - q1.y;
  const den = dx * dx + dy * dy;
  const a = (ex * dx + ey * dy) / den;
  const b = (ey * dx - ex * dy) / den;
  const tx = q1.x - (a * s1.x - b * s1.y);
  const ty = q1.y - (b * s1.x + a * s1.y);
  const f = (v: number): string => v.toFixed(4);
  return flip
    ? `matrix(${f(a)}, ${f(b)}, ${f(b)}, ${f(-a)}, ${f(tx)}, ${f(ty)})`
    : `matrix(${f(a)}, ${f(b)}, ${f(-b)}, ${f(a)}, ${f(tx)}, ${f(ty)})`;
}

const triPath = (t: [Pt, Pt, Pt]): string =>
  `M${t[0].x.toFixed(1)} ${t[0].y.toFixed(1)} L${t[1].x.toFixed(1)} ${t[1].y.toFixed(1)} L${t[2].x.toFixed(1)} ${t[2].y.toFixed(1)} Z`;

interface Scene {
  small: [Pt, Pt, Pt];
  target: [Pt, Pt, Pt];
  figSvg: string;
  slotMarks: string;
  pairs: [Pt, Pt, Pt, Pt][]; // [빅 변 양끝, 타깃 변 양끝] 3쌍
  readout: string;
  helper: string;
  chipId: string;
  order: ("AA" | "SAS" | "SSS")[];
  fb: { aa: string; sas: string; sss: string };
  trapToast?: string;
}

/* ── 구도 ① 공통각: D는 AB 위, E는 AC 위, AD:AC = AE:AB(교차 대응) → ∠ADE=∠ACB ── */
function scene1(): Scene {
  const A = { x: 78, y: 40 };
  const B = { x: 18, y: 210 };
  const C = { x: 182, y: 210 };
  const k = 0.42;
  const lAB = dist(A, B);
  const lAC = dist(A, C);
  const D = mix(A, B, (k * lAC) / lAB);
  const E = mix(A, C, (k * lAB) / lAC);
  const A2 = { x: 262, y: 78 };
  const D2 = add(A2, mul(unitV(A, C), k * lAC));
  const E2 = add(A2, mul(unitV(A, B), k * lAB));
  return {
    small: [A, D, E],
    target: [A2, D2, E2],
    figSvg:
      `<path d="${triPath([A, B, C])}" fill="rgba(51,65,85,.06)" stroke="${GEO.ink}" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<path class="pel-src" d="${triPath([A, D, E])}" fill="rgba(194,37,92,.22)" stroke="${SIM}" stroke-width="2.2" stroke-linejoin="round"/>` +
      arcBetween(A, B, C, 13, GEO.hlA) +
      arcBetween(D, A, E, 11, GEO.hlB) +
      arcBetween(C, A, B, 13, GEO.hlB) +
      dot(A.x, A.y, GEO.ink, 3) + dot(B.x, B.y, GEO.ink, 3) + dot(C.x, C.y, GEO.ink, 3) +
      dot(D.x, D.y, SIM, 3) + dot(E.x, E.y, SIM, 3) +
      ptLabel(A.x, A.y, "A", 0, -10) + ptLabel(B.x, B.y, "B", -10, 12) + ptLabel(C.x, C.y, "C", 10, 12) +
      ptLabel(D.x, D.y, "D", -12, 4, SIM) + ptLabel(E.x, E.y, "E", 13, 0, SIM),
    slotMarks:
      arcBetween(A2, D2, E2, 12, GEO.hlA) +
      arcBetween(D2, A2, E2, 11, GEO.hlB) +
      ptLabel(A2.x, A2.y, "A", 0, -9, SIM) + ptLabel(D2.x, D2.y, "D", 9, 13, SIM) + ptLabel(E2.x, E2.y, "E", -9, 13, SIM),
    pairs: [
      [A, B, A2, E2],
      [B, C, E2, D2],
      [C, A, D2, A2],
    ],
    readout: `${gsym("ABC", "tri")} <span class="pel-arr">∽</span> ${gsym("AED", "tri")}`,
    helper: "큰 삼각형 안에 작은 삼각형이 숨어 있어요. <b>작은 삼각형을 꾹 잡고</b> 오른쪽 빈 슬롯까지 끌어 보세요!",
    chipId: "s1",
    order: ["AA", "SAS", "SSS"],
    fb: {
      aa: "맞아요! ∠A는 공통, 그리고 ∠ADE=∠ACB 표시. 각 2개가 같으니 AA 닮음이에요.",
      sas: "변의 길이나 비 정보가 그림에 없어요. 지금 주어진 건 각 표시 2개(공통각과 표시각), 그래서 AA예요.",
      sss: "세 변의 비는 그림 어디에도 없어요. 표시된 건 각 2개뿐이라 근거는 AA예요.",
    },
    trapToast:
      "주의! DE와 BC가 평행해 보여도 평행 표시가 없으면 동위각을 쓸 수 없어요. 여기선 ∠ADE=∠ACB 표시가 근거였어요.",
  };
}

/* ── 구도 ② 맞꼭지각 나비: AD와 BE가 C에서 교차, △ABC ∽ △DEC ── */
function scene2(): Scene {
  const C = { x: 108, y: 128 };
  const A = { x: 20, y: 62 };
  const B = { x: 24, y: 196 };
  const k = 0.56;
  const D = add(C, mul(sub(C, A), k));
  const E = add(C, mul(sub(C, B), k));
  const C2 = { x: 312, y: 156 };
  const D2 = add(C2, mul(unitV(C, A), k * dist(C, A)));
  const E2 = add(C2, mul(unitV(C, B), k * dist(C, B)));
  return {
    small: [D, E, C],
    target: [D2, E2, C2],
    figSvg:
      `<path d="${triPath([A, B, C])}" fill="rgba(51,65,85,.06)" stroke="${GEO.ink}" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<path class="pel-src" d="${triPath([D, E, C])}" fill="rgba(194,37,92,.22)" stroke="${SIM}" stroke-width="2.2" stroke-linejoin="round"/>` +
      arcBetween(C, A, B, 12, GEO.hlA) +
      arcBetween(C, D, E, 12, GEO.hlA) +
      arcBetween(A, B, C, 12, GEO.hlB) +
      arcBetween(D, E, C, 11, GEO.hlB) +
      dot(A.x, A.y, GEO.ink, 3) + dot(B.x, B.y, GEO.ink, 3) + dot(C.x, C.y, GEO.ink, 3) +
      dot(D.x, D.y, SIM, 3) + dot(E.x, E.y, SIM, 3) +
      ptLabel(A.x, A.y, "A", -9, -6) + ptLabel(B.x, B.y, "B", -9, 12) + ptLabel(C.x, C.y, "C", 4, -12) +
      ptLabel(D.x, D.y, "D", 11, 10, SIM) + ptLabel(E.x, E.y, "E", 11, -6, SIM),
    slotMarks:
      arcBetween(C2, D2, E2, 12, GEO.hlA) +
      arcBetween(D2, E2, C2, 11, GEO.hlB) +
      ptLabel(D2.x, D2.y, "D", -9, -6, SIM) + ptLabel(E2.x, E2.y, "E", -9, 13, SIM) + ptLabel(C2.x, C2.y, "C", 11, 4, SIM),
    pairs: [
      [A, B, D2, E2],
      [B, C, E2, C2],
      [C, A, C2, D2],
    ],
    readout: `${gsym("ABC", "tri")} <span class="pel-arr">∽</span> ${gsym("DEC", "tri")}`,
    helper: "이번엔 나비 모양이에요. <b>오른쪽 작은 날개</b>를 잡아 슬롯으로 끌어 보세요!",
    chipId: "s2",
    order: ["SAS", "AA", "SSS"],
    fb: {
      aa: "맞꼭지각 ∠ACB=∠DCE에 ∠A=∠D 표시까지, 각 2개가 같으니 AA 닮음이에요!",
      sas: "두 변의 비가 같다는 정보는 없어요. 여기 있는 건 맞꼭지각과 ∠A=∠D, 각 2개예요.",
      sss: "변 정보는 하나도 없어요. 맞꼭지각은 언제나 같다는 것, 그게 공짜로 얻는 각 정보예요.",
    },
  };
}

/* ── 구도 ③ 직각 수선: ∠A=90°, A에서 빗변 BC에 수선의 발 D, △ABC ∽ △DBA ── */
function scene3(): Scene {
  const B = { x: 18, y: 206 };
  const C = { x: 186, y: 206 };
  const A = { x: 66, y: 206 - Math.sqrt(84 * 84 - 36 * 36) }; // 반원(지름 BC) 위 → ∠A=90°
  const D = { x: 66, y: 206 };
  const k2 = dist(B, A) / dist(B, C);
  const B2 = { x: 232, y: 190 };
  const D2 = add(B2, mul(sub(A, B), k2));
  const A2 = add(B2, mul(sub(C, B), k2));
  return {
    small: [D, B, A],
    target: [D2, B2, A2],
    figSvg:
      `<path d="${triPath([A, B, C])}" fill="rgba(51,65,85,.06)" stroke="${GEO.ink}" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<path class="pel-src" d="${triPath([D, B, A])}" fill="rgba(194,37,92,.22)" stroke="${SIM}" stroke-width="2.2" stroke-linejoin="round"/>` +
      rmAt(A, B, C, 9, GEO.hlB) +
      rmAt(D, A, B, 8, GEO.hlB) +
      arcBetween(B, A, C, 13, GEO.hlA) +
      dot(A.x, A.y, GEO.ink, 3) + dot(B.x, B.y, GEO.ink, 3) + dot(C.x, C.y, GEO.ink, 3) + dot(D.x, D.y, SIM, 3) +
      ptLabel(A.x, A.y, "A", 0, -9) + ptLabel(B.x, B.y, "B", -10, 12) + ptLabel(C.x, C.y, "C", 10, 12) +
      ptLabel(D.x, D.y, "D", 4, 14, SIM),
    slotMarks:
      rmAt(D2, B2, A2, 8, GEO.hlB) +
      arcBetween(B2, D2, A2, 12, GEO.hlA) +
      ptLabel(D2.x, D2.y, "D", 0, -9, SIM) + ptLabel(B2.x, B2.y, "B", -9, 12, SIM) + ptLabel(A2.x, A2.y, "A", 9, 12, SIM),
    pairs: [
      [A, B, D2, B2],
      [B, C, B2, A2],
      [C, A, A2, D2],
    ],
    readout: `${gsym("ABC", "tri")} <span class="pel-arr">∽</span> ${gsym("DBA", "tri")}`,
    helper: "직각삼각형의 직각 꼭짓점에서 빗변에 수선을 내렸어요. <b>왼쪽 작은 직각삼각형</b>을 슬롯으로 끌어 보세요!",
    chipId: "s3",
    order: ["SSS", "SAS", "AA"],
    fb: {
      aa: "∠B는 공통, 직각도 하나씩! 각 2개가 같으니 AA, 직각삼각형 속 닮음의 단골이에요.",
      sas: "변의 비 정보가 없어요. 그림의 표시는 공통각 ∠B와 직각, 각 2개라 AA예요.",
      sss: "세 변의 비는 표시돼 있지 않아요. 직각 표시와 공통각 ∠B, 각 2개가 근거라 AA예요.",
    },
  };
}

const SCENES = [scene1, scene2, scene3];

export const peelLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "s1", label: "공통각", sub: "구도 ①" },
    { id: "s2", label: "맞꼭지각", sub: "잠김" },
    { id: "s3", label: "직각 수선", sub: "잠김" },
  ]);

  const board = mboard(540);
  const svgWrap = el("div", {
    class: "mcl-plane",
    attrs: { role: "img", "aria-label": "겹친 두 삼각형과 오른쪽 빈 슬롯" },
  });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 ${VW} ${VH}" xmlns="${NS}" fill="none">` +
    `<g class="pel-slotbase"></g><g class="pel-fig"></g><g class="pel-pairs"></g><g class="pel-slot"></g><g class="pel-fly"></g>` +
    `</svg>`;
  const readout = el("div", { class: "pel-read", attrs: { "aria-live": "polite" } });
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q m2u5q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(svgWrap, readout, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(chips.el, helper, board); // 칩 → helper(지시) → 보드, 사용자 확정 배치
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gSlotBase = svg.querySelector(".pel-slotbase") as SVGGElement;
  const gFig = svg.querySelector(".pel-fig") as SVGGElement;
  const gPairs = svg.querySelector(".pel-pairs") as SVGGElement;
  const gSlot = svg.querySelector(".pel-slot") as SVGGElement;
  const gFly = svg.querySelector(".pel-fly") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let sceneIdx = 0;
  let sc: Scene = SCENES[0]();
  let state: "wait" | "drag" | "fly" | "quiz" | "done" = "wait";
  let ghost: SVGGElement | null = null;
  let p0: Pt = { x: 0, y: 0 };
  let hinted = false;
  let finished = false;

  function paintSlotBase(withCap: boolean): void {
    gSlotBase.innerHTML =
      `<rect x="202" y="42" width="132" height="180" rx="12" fill="rgba(194,37,92,.035)" stroke="${GEO.faint}" stroke-width="1.8" stroke-dasharray="7 6"/>` +
      (withCap
        ? `<text x="268" y="238" text-anchor="middle" font-size="9.5" font-weight="700" fill="${GEO.soft}">여기로 끌어요</text>`
        : "");
  }

  function setScene(i: number): void {
    sceneIdx = i;
    sc = SCENES[i]();
    state = "wait";
    ghost = null;
    paintSlotBase(true);
    gFig.innerHTML = sc.figSvg;
    gPairs.innerHTML = "";
    gSlot.innerHTML = "";
    gFly.innerHTML = "";
    readout.innerHTML = "";
    qline.innerHTML = "";
    clear(ctl);
    clear(actions);
    helper.innerHTML = sc.helper;
    if (i === 1) (chips.el.querySelector(`[data-g="s2"] span`) as HTMLElement).textContent = "구도 ②";
    if (i === 2) (chips.el.querySelector(`[data-g="s3"] span`) as HTMLElement).textContent = "구도 ③";
  }

  /* ── 포인터: 작은 삼각형 잡아 끌기 ── */

  function pt(e: PointerEvent): Pt {
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * VW, y: ((e.clientY - r.top) / r.height) * VH };
  }

  function inSmall(p: Pt): boolean {
    const t = sc.small;
    const sg = (a: Pt, b: Pt): number => (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
    const d1 = sg(t[0], t[1]);
    const d2 = sg(t[1], t[2]);
    const d3 = sg(t[2], t[0]);
    const inside = !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
    const cx = (t[0].x + t[1].x + t[2].x) / 3;
    const cy = (t[0].y + t[1].y + t[2].y) / 3;
    return inside || Math.hypot(p.x - cx, p.y - cy) < 42;
  }

  svg.addEventListener("pointerdown", (e) => {
    if (state !== "wait") return;
    const p = pt(e);
    if (!inSmall(p)) return;
    state = "drag";
    p0 = p;
    capturePointer(svg, e.pointerId);
    haptic(HAPTIC.tap);
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "pel-ghost");
    g.style.transformOrigin = "0 0";
    g.style.transition = "none";
    g.innerHTML = `<path d="${triPath(sc.small)}" fill="rgba(194,37,92,.30)" stroke="${SIM}" stroke-width="2.4" stroke-linejoin="round"/>`;
    gFly.appendChild(g);
    ghost = g;
  });

  svg.addEventListener("pointermove", (e) => {
    if (state !== "drag" || !ghost) return;
    const p = pt(e);
    const dx = p.x - p0.x;
    const dy = p.y - p0.y;
    ghost.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    if (Math.hypot(dx, dy) >= 40) launch();
  });

  const drop = (): void => {
    if (state !== "drag" || !ghost) return;
    state = "wait";
    const g = ghost;
    ghost = null;
    g.style.transition = "transform .35s var(--ease, cubic-bezier(.22,1,.36,1))";
    g.getBoundingClientRect();
    g.style.transform = "";
    later(() => g.remove(), 380);
    if (!hinted) {
      hinted = true;
      toast("조금 더 힘있게! 삼각형을 잡고 쭉 끌어 보세요.");
    }
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  /** 40px 돌파: 유령이 슬롯으로 날아가 정렬(회전·필요시 반전). */
  function launch(): void {
    if (!ghost) return;
    state = "fly";
    haptic(HAPTIC.select);
    const flip = orient(sc.small) !== orient(sc.target);
    const m = simMatrix(sc.small[0], sc.small[1], sc.target[0], sc.target[1], flip);
    const g = ghost;
    g.style.transition = "transform .95s var(--ease, cubic-bezier(.22,1,.36,1))";
    g.getBoundingClientRect();
    g.style.transform = m;
    const src = gFig.querySelector(".pel-src") as SVGPathElement | null;
    if (src) src.classList.add("gone");
    helper.innerHTML = flip
      ? "빙글, <b>뒤집어서</b> 딱 맞춰 놓을게요. 두 삼각형이 따로 보이죠?"
      : "빙글 돌려서 나란히! 두 삼각형이 따로 보이죠?";
    later(land, 1050);
  }

  function land(): void {
    state = "quiz";
    haptic(HAPTIC.correct);
    paintSlotBase(false);
    gSlot.innerHTML = sc.slotMarks;
    sc.pairs.forEach(([P, Q, P2, Q2], i) => {
      later(() => {
        gPairs.insertAdjacentHTML(
          "beforeend",
          lineSvg(P.x, P.y, Q.x, Q.y, PAIRH[i], 9) +
            lineSvg(P.x, P.y, Q.x, Q.y, PAIRC[i], 2.6) +
            lineSvg(P2.x, P2.y, Q2.x, Q2.y, PAIRH[i], 9) +
            lineSvg(P2.x, P2.y, Q2.x, Q2.y, PAIRC[i], 2.6),
        );
        haptic(HAPTIC.tap);
      }, 350 + i * 430);
    });
    later(() => {
      readout.innerHTML = `${sc.readout} <span class="pel-cap">대응변끼리 같은 색이에요</span>`;
      later(() => readout.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
    }, 350 + 3 * 430);
    later(askBasis, 350 + 3 * 430 + 700);
  }

  /* ── 근거 판정 ── */

  function askBasis(): void {
    qline.innerHTML = "이 닮음의 근거는? 그림의 <b>표시</b>를 보고 골라요.";
    const fbOf = { AA: sc.fb.aa, SAS: sc.fb.sas, SSS: sc.fb.sss } as const;
    const row = el("div", { class: "mq6-choices" });
    let solved = false;
    const btns: HTMLButtonElement[] = [];
    for (const k of sc.order) {
      const bt = el("button", { class: "mq6-choice", text: `${k} 닮음`, attrs: { type: "button" } }) as HTMLButtonElement;
      bt.addEventListener("click", () => {
        if (solved || bt.disabled) return;
        if (k === "AA") {
          solved = true;
          haptic(HAPTIC.correct);
          bt.classList.add("ok");
          for (const z of btns) z.disabled = true;
          toast(fbOf.AA);
          afterSolve();
        } else {
          haptic(HAPTIC.wrong);
          bt.classList.add("no");
          bt.disabled = true;
          toast(fbOf[k]);
          later(() => {
            bt.classList.remove("no");
            bt.disabled = false;
          }, 900);
        }
      });
      btns.push(bt);
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function afterSolve(): void {
    state = "done";
    chips.on(sc.chipId, "AA 간파!");
    const hasTrap = !!sc.trapToast;
    if (hasTrap) later(() => toast(sc.trapToast!), 2100);
    later(() => {
      qline.innerHTML = "";
      clear(ctl);
      if (sceneIdx < 2) {
        helper.innerHTML = "겹침 속 닮음 하나 해결! <b>다음 구도</b>로 가 볼까요?";
        const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "다음 구도" })) as HTMLButtonElement;
        b.addEventListener("click", () => {
          if (b.disabled) return;
          b.disabled = true;
          haptic(HAPTIC.tap);
          setScene(sceneIdx + 1);
        });
        actions.appendChild(b);
        later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
      } else {
        finish();
      }
    }, hasTrap ? 4300 : 1600);
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML =
      "공통각, 맞꼭지각, 직각과 공통각. 겹친 그림은 <b>벗겨서 나란히</b> 놓으면 닮음이 보여요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  setScene(0);
  api.setCTA("세 구도를 모두 벗겨내면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
