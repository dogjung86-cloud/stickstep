// CSS는 math2.css의 해당 랩 섹션에 병합 완료(단일 진실 공급원).
// inCircleLab, 최대 원 공방(중2 수학 Ⅳ L5 삼각형의 내심, 책 154~161쪽).
// 삼각형 반죽 안에서 점 P를 끌어 "가장 큰 원"을 찾고, 각의 이등분선 도구 두 개로
// 교점에 스냅하면 원이 세 변에 동시에 닿음을 발견한다. '내심/내접원' 명칭은 다음 concept 몫.
// 국면 1(grow): 감으로 원 키우기, 최대 반지름의 90% 도달 시 칩 점등 + 도구 등장
//   (첫 드래그 후 6초가 지나도 90% 미만이면 힌트와 함께 도구만 먼저 등장).
// 국면 2(meet): 각 B(앰버)·각 C(시안)의 이등분선을 그리면 교점이 반짝, P가 14px 안으로
//   오면 자동 스냅(짧은 글라이드), 원이 세 변에 동시에 닿고 수선 발 3개가 반짝.
// 국면 3(dist): "세 변까지의 거리는?" mq6 판정, 오답은 "가까운 변만"(원이 뚫고 나감)과
//   "꼭짓점까지 같다"(지난 시간 외심과의 헷갈림)를 짚는다. 정답 후 각 A의 이등분선이
//   0.6초 페이드로 자동 등장("세 번째도 이 점을 지나요").
// 기하는 전부 계산: 내심 = (a·A+b·B+c·C)/(a+b+c), 원 반지름 = P에서 세 변까지 거리의
// 최솟값(예각삼각형이라 내부 점의 수선 발이 항상 변 위에 떨어져 직선 거리 = 선분 거리).
// 삼각형 A(150,36) B(36,244) C(312,232)는 부등변 예각(약 68.3°/58.8°/52.9°), 내심
// (162.3,165.4), 최대 반지름 73.0px(리드아웃 눈금은 px÷4 반올림, 최대 18).
// rAF 금지: 스냅 글라이드는 setTimeout 체인(8스텝×26ms), 페이드는 인라인 CSS 트랜지션.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import {
  GEO, polar, angleOf, normDeg, deg, angleArc, rightMark, dot, ptLabel, lineSvg, tickMark, capturePointer,
} from "../../ui/geoKit";
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

const VW = 340;
const VH = 280;

const sub = (p: Pt, q: Pt): Pt => ({ x: p.x - q.x, y: p.y - q.y });
const cross = (u: Pt, v: Pt): number => u.x * v.y - u.y * v.x;
const vlen = (v: Pt): number => Math.hypot(v.x, v.y);
const vunit = (v: Pt): Pt => {
  const L = vlen(v);
  return { x: v.x / L, y: v.y / L };
};
const distPts = (p: Pt, q: Pt): number => Math.hypot(p.x - q.x, p.y - q.y);
/** 화면 벡터의 수학 각도(도). geoKit angleOf와 같은 y 반전 관례. */
const mathAng = (v: Pt): number => angleOf(0, 0, v.x, v.y);

/* 무대 삼각형(부등변 예각): 예각이어야 내부 점의 수선 발이 항상 변 위에 떨어진다. */
const TA: Pt = { x: 150, y: 36 };
const TB: Pt = { x: 36, y: 244 };
const TC: Pt = { x: 312, y: 232 };

/* 내심 = 대변 길이 가중 평균. a=BC(A의 대변), b=CA, c=AB. */
const aL = distPts(TB, TC);
const bL = distPts(TC, TA);
const cL = distPts(TA, TB);
const IC: Pt = {
  x: (aL * TA.x + bL * TB.x + cL * TC.x) / (aL + bL + cL),
  y: (aL * TA.y + bL * TB.y + cL * TC.y) / (aL + bL + cL),
};

interface Side {
  s0: Pt;
  s1: Pt;
  ux: number;
  uy: number;
  L: number;
  sgn: number; // 내부 방향의 외적 부호(내심 기준으로 확정)
}
const mkSide = (s0: Pt, s1: Pt): Side => {
  const L = distPts(s0, s1);
  const sgn = Math.sign(cross(sub(s1, s0), sub(IC, s0)));
  return { s0, s1, ux: (s1.x - s0.x) / L, uy: (s1.y - s0.y) / L, L, sgn };
};
const SIDES: Side[] = [mkSide(TA, TB), mkSide(TB, TC), mkSide(TC, TA)];

/** 점 p에서 변으로 내린 수선의 발과 거리(예각삼각형 내부 점은 발이 항상 선분 위). */
function distFoot(p: Pt, sd: Side): { d: number; foot: Pt } {
  const t = (p.x - sd.s0.x) * sd.ux + (p.y - sd.s0.y) * sd.uy;
  const foot = { x: sd.s0.x + t * sd.ux, y: sd.s0.y + t * sd.uy };
  return { d: distPts(p, foot), foot };
}

/** 변에서 내부 쪽으로 잰 부호 있는 거리(음수면 바깥). */
const inwardDist = (p: Pt, sd: Side): number => (cross(sub(sd.s1, sd.s0), sub(p, sd.s0)) / sd.L) * sd.sgn;
/** 세 변 모두에서 inset 이상 안쪽인가(드래그 내부 클램프). */
const insideBy = (p: Pt, inset: number): boolean => SIDES.every((sd) => inwardDist(p, sd) >= inset);

/** 최대 원의 반지름 = 내심에서 변까지 거리(세 값이 같지만 안전하게 min). */
const R_STAR = Math.min(...SIDES.map((sd) => distFoot(IC, sd).d));

/** 꼭짓점 V의 각의 이등분선: 방향(이웃 두 변 단위벡터의 합), 맞은편 변과의 교점, 각 범위. */
function bisectorOf(V: Pt, P1: Pt, P2: Pt): { d: Pt; hit: Pt; a0: number; a1: number; mid: number } {
  const u1 = vunit(sub(P1, V));
  const u2 = vunit(sub(P2, V));
  const d = vunit({ x: u1.x + u2.x, y: u1.y + u2.y });
  // V + t·d = P1 + s·(P2−P1) 2×2 풀이
  const ex = P2.x - P1.x;
  const ey = P2.y - P1.y;
  const det = -d.x * ey + ex * d.y;
  const t = (-(P1.x - V.x) * ey + ex * (P1.y - V.y)) / det;
  const hit = { x: V.x + d.x * t, y: V.y + d.y * t };
  const aP = angleOf(V.x, V.y, P1.x, P1.y);
  const aQ = angleOf(V.x, V.y, P2.x, P2.y);
  const inner = normDeg(aQ - aP) <= 180;
  const a0 = inner ? aP : aQ;
  const a1 = inner ? aQ : aP;
  const mid = a0 + normDeg(a1 - a0) / 2;
  return { d, hit, a0, a1, mid };
}

/** 이등분선 한 벌의 SVG: 점선 + 반쪽 각 호 2개 + 같은 각 표시 틱 + (선택) 길 라벨. */
function bisectorSvg(V: Pt, P1: Pt, P2: Pt, color: string, dark: string, ticks: number, labelLines: string[] | null): string {
  const b = bisectorOf(V, P1, P2);
  const span = normDeg(b.a1 - b.a0);
  let s = lineSvg(V.x, V.y, b.hit.x, b.hit.y, color, 2.6, "7 5");
  s += angleArc(V.x, V.y, 17, b.a0, b.mid, color, undefined, { width: 2 });
  s += angleArc(V.x, V.y, 17, b.mid, b.a1, color, undefined, { width: 2 });
  for (const hm of [b.a0 + span / 4, b.a0 + (3 * span) / 4]) {
    for (let k = 0; k < ticks; k++) {
      const ag = hm + (k - (ticks - 1) / 2) * 5;
      const q1 = polar(V.x, V.y, 13, ag);
      const q2 = polar(V.x, V.y, 21, ag);
      s += lineSvg(q1.x, q1.y, q2.x, q2.y, color, 1.9);
    }
  }
  if (labelLines) {
    // 꼭짓점과 내심의 중간에, 선을 따라 눕힌 2줄 라벨(뒤집힘 방지로 ±90° 안으로 보정).
    // 원·점선 위에서도 읽히게 흰 할로, 문구는 짧게·크게(9.5px 장문이 안 읽히던 실사용 피드백).
    const lm = { x: (V.x + IC.x) / 2, y: (V.y + IC.y) / 2 };
    let rot = deg(Math.atan2(b.d.y, b.d.x));
    if (rot > 90) rot -= 180;
    if (rot < -90) rot += 180;
    const tsp = labelLines
      .map((tx, i) => `<tspan x="${lm.x.toFixed(1)}" dy="${i === 0 ? -7 - (labelLines.length - 1) * 13.5 : 13.5}">${tx}</tspan>`)
      .join("");
    s +=
      `<text transform="rotate(${rot.toFixed(1)} ${lm.x.toFixed(1)} ${lm.y.toFixed(1)})" x="${lm.x.toFixed(1)}" y="${lm.y.toFixed(1)}"` +
      ` text-anchor="middle" font-size="12" font-weight="800" fill="${dark}" stroke="#FFFFFF" stroke-width="3.2" paint-order="stroke" stroke-linejoin="round">${tsp}</text>`;
  }
  return s;
}

const CHOICES = [
  {
    t: "가장 가까운 변까지만 재면 돼요, 나머지는 달라요",
    good: false,
    fb: "그러면 원이 한 변에만 닿고 나머지 변과는 떨어지거나 뚫고 나가요. 세 변에 동시에 닿았다는 건 세 거리가 전부 같다는 뜻이에요!",
  },
  {
    t: "모두 같아요, 그래서 세 변에 동시에 닿는 원을 그릴 수 있어요",
    good: true,
    fb: "정답! 이 점은 세 변에서 같은 거리예요. 그 같은 거리를 반지름으로 하니 원이 세 변에 꼭 맞게 닿는 거죠.",
  },
  {
    t: "세 꼭짓점까지의 거리가 같아요",
    good: false,
    fb: "그건 지난 시간의 점(세 꼭짓점에서 같은 거리, 바깥 원의 중심)이에요! 오늘의 점은 꼭짓점이 아니라 변까지의 거리가 같아요. 헷갈리기 쉬운 짝이죠.",
  },
];

export const inCircleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "grow", label: "원 키우기", sub: "P를 끌어요" },
    { id: "meet", label: "교점 발견", sub: "잠김" },
    { id: "dist", label: "거리의 비밀", sub: "잠김" },
  ]);
  const helper = el("div", {
    class: "helper",
    html: "점 P를 끌어서 <b>가장 큰 원</b>이 되는 자리를 찾아보세요. 원은 가장 가까운 변에 닿는 만큼만 커져요.",
  });

  const board = mboard(520);
  const read = el("div", { class: "icl-read", attrs: { "aria-live": "polite" } });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="icl-tri"></g>` +
    `<g class="icl-circ"></g>` +
    `<g class="icl-bb" style="opacity:0;transition:opacity .45s var(--ease-out)"></g>` +
    `<g class="icl-bc" style="opacity:0;transition:opacity .45s var(--ease-out)"></g>` +
    `<g class="icl-ba" style="opacity:0;transition:opacity .6s var(--ease-out)"></g>` +
    `<g class="icl-meet"></g>` +
    `<g class="icl-touch"></g>` +
    `<g class="icl-p"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q icl-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(read, svgWrap, actions, panel);
  const toast = mtoast(board);
  host.append(chips.el, helper, board); // 칩 → helper(지시) → 보드
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gTri = svg.querySelector(".icl-tri") as SVGGElement;
  const gCirc = svg.querySelector(".icl-circ") as SVGGElement;
  const gBB = svg.querySelector(".icl-bb") as SVGGElement;
  const gBC = svg.querySelector(".icl-bc") as SVGGElement;
  const gBA = svg.querySelector(".icl-ba") as SVGGElement;
  const gMeet = svg.querySelector(".icl-meet") as SVGGElement;
  const gTouch = svg.querySelector(".icl-touch") as SVGGElement;
  const gP = svg.querySelector(".icl-p") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let P: Pt = { x: 110, y: 210 }; // 시작 자리(반지름 눈금 8, 최대는 18)
  let best = 0;
  let lastRv = -1;
  let growDone = false;
  let toolsShown = false;
  let bisB = false;
  let bisC = false;
  let snapping = false; // 스냅 글라이드 중
  let snapped = false; // 스냅 완료(드래그 잠금)
  let asked = false;
  let hintArmed = false;
  let dragging = false;

  /* 반죽 삼각형(정적) */
  gTri.innerHTML =
    `<path d="M${TA.x} ${TA.y} L${TB.x} ${TB.y} L${TC.x} ${TC.y} Z" fill="#E7F1FB" stroke="#1971C2" stroke-width="2.8" stroke-linejoin="round"/>` +
    dot(TA.x, TA.y, "#12518B", 3.2) +
    dot(TB.x, TB.y, "#12518B", 3.2) +
    dot(TC.x, TC.y, "#12518B", 3.2) +
    ptLabel(TA.x, TA.y, "A", 0, -10, "#12518B") +
    ptLabel(TB.x, TB.y, "B", -8, 16, "#12518B") +
    ptLabel(TC.x, TC.y, "C", 9, 16, "#12518B");

  /** 원(가장 가까운 변에 닿는 반지름)·손잡이·리드아웃을 다시 그린다. */
  function paint(): void {
    const minD = Math.min(...SIDES.map((sd) => distFoot(P, sd).d));
    gCirc.innerHTML = `<circle cx="${P.x.toFixed(1)}" cy="${P.y.toFixed(1)}" r="${minD.toFixed(1)}" fill="rgba(25,113,194,.13)" stroke="#1971C2" stroke-width="2.6"/>`;
    gP.innerHTML =
      `<g class="icl-hd"><circle cx="${P.x.toFixed(1)}" cy="${P.y.toFixed(1)}" r="13" fill="rgba(25,113,194,.15)"/>` +
      `<circle cx="${P.x.toFixed(1)}" cy="${P.y.toFixed(1)}" r="7" fill="${snapped ? "#1971C2" : "#FFFFFF"}" stroke="${snapped ? "#FFFFFF" : "#1971C2"}" stroke-width="2.6"/>` +
      ptLabel(P.x, P.y, "P", 14, -11, "#12518B") +
      `</g>`;
    const rv = Math.round(minD / 4); // px÷4 정수 눈금
    if (rv > best) best = rv;
    if (rv !== lastRv) {
      if (lastRv !== -1 && !snapping) haptic(HAPTIC.tap);
      lastRv = rv;
    }
    read.innerHTML =
      `<span class="icl-rl">쿠키 반지름</span><b class="icl-rv"><i class='mv'>r</i> = ${rv}</b>` +
      (snapped ? `<span class="icl-max">최대 확정!</span>` : `<span class="icl-best">최고 기록 ${best}</span>`);
    judge(minD);
  }

  function judge(minD: number): void {
    if (growDone || minD < R_STAR * 0.9) return;
    growDone = true;
    chips.on("grow", "거의 최대!");
    haptic(HAPTIC.correct);
    if (!snapping) {
      if (!bisB && !bisC) {
        toast("커졌어요! 그런데 이게 진짜 최대일까요? 감으로는 확신이 안 서죠.");
        helper.innerHTML =
          "거의 최대까지 왔어요. 그런데 <b>진짜 최대</b>라고 확신할 수 있나요? 아래 <b>각 B의 이등분선</b> 버튼부터 눌러 보세요.";
      } else toast("반지름이 거의 최대까지 왔어요!"); // 도구 흐름이 이미 시작됐으면 안내는 유지
    }
    showTools();
  }

  function showTools(): void {
    if (toolsShown) return;
    toolsShown = true;
    const mk = (label: string, color: string, onTap: () => void): HTMLButtonElement => {
      const b = el(
        "button",
        { class: "ct-btn icl-tool", attrs: { type: "button" } },
        el("span", { class: "icl-dot", style: `background:${color}` }),
        el("span", { text: label }),
      ) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (b.disabled) return;
        b.disabled = true;
        haptic(HAPTIC.select);
        onTap();
      });
      return b;
    };
    actions.append(mk("각 B의 이등분선", GEO.hlA, () => drawBis("B")), mk("각 C의 이등분선", GEO.hlB, () => drawBis("C")));
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function drawBis(which: "B" | "C"): void {
    const g = which === "B" ? gBB : gBC;
    if (which === "B") {
      bisB = true;
      g.innerHTML = bisectorSvg(TB, TA, TC, GEO.hlA, "#B87708", 1, ["각 B의 두 변에서", "같은 거리인 길"]);
    } else {
      bisC = true;
      g.innerHTML = bisectorSvg(TC, TA, TB, GEO.hlB, "#0B7285", 2, ["각 C의 두 변에서", "같은 거리인 길"]);
    }
    void g.getBoundingClientRect(); // reflow로 페이드 트랜지션 발동(rAF 금지)
    g.style.opacity = "1";
    if (bisB && bisC) {
      gMeet.innerHTML =
        `<circle class="icl-x" cx="${IC.x.toFixed(1)}" cy="${IC.y.toFixed(1)}" r="11" fill="none" stroke="#1971C2" stroke-width="2"/>` +
        `<circle cx="${IC.x.toFixed(1)}" cy="${IC.y.toFixed(1)}" r="3.4" fill="#1971C2"/>`;
      toast("두 길이 한 점에서 만나요! 점 P를 반짝이는 교점으로 끌어가 보세요.");
      helper.innerHTML = "두 점선이 <b>한 점</b>에서 만났어요. 점 P를 반짝이는 <b>교점</b> 위로 끌어가면 무슨 일이 생길까요?";
      later(maybeSnap, 900); // P가 이미 교점 곁이면 선이 그려진 뒤 바로 스냅
    } else {
      const done = which;
      const next = which === "B" ? "C" : "B";
      toast(`각 ${done}를 반으로 가르는 길이에요. 이 길 위의 점은 각 ${done}의 두 변에서 같은 거리예요!`);
      helper.innerHTML = `점선 위는 어디든 각 ${done}의 <b>두 변에서 같은 거리</b>예요. 이제 <b>각 ${next}의 이등분선</b>도 눌러 보세요.`;
    }
  }

  /** 두 이등분선이 다 그려졌고 P가 교점 14px 안이면 자동 스냅(짧은 글라이드). */
  function maybeSnap(): void {
    if (snapped || snapping || !bisB || !bisC) return;
    if (distPts(P, IC) > 14) return;
    snapping = true;
    dragging = false;
    const from = { x: P.x, y: P.y };
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      later(() => {
        const t = i / steps;
        const k = 1 - (1 - t) * (1 - t); // easeOut
        P = { x: from.x + (IC.x - from.x) * k, y: from.y + (IC.y - from.y) * k };
        if (i === steps) {
          P = { x: IC.x, y: IC.y };
          snapped = true; // 리드아웃·손잡이가 잠금 상태로 그려지게 먼저
          paint();
          snapDone();
        } else paint();
      }, i * 26);
    }
  }

  function snapDone(): void {
    gMeet.innerHTML = "";
    let tp = "";
    SIDES.forEach((sd, i) => {
      const f = distFoot(IC, sd).foot;
      // 수선 발 직각 표시: 한 다리는 변 방향, 다른 다리(+90°)가 내심 쪽을 보게 방향 보정
      let aS = mathAng({ x: sd.ux, y: sd.uy });
      const inw = polar(f.x, f.y, 6, aS + 90);
      const outw = polar(f.x, f.y, 6, aS - 90);
      if (distPts(inw, IC) > distPts(outw, IC)) aS += 180;
      tp +=
        `<g class="icl-tp" style="animation-delay:${i * 120}ms">` +
        lineSvg(IC.x, IC.y, f.x, f.y, "rgba(25,113,194,.55)", 1.8) +
        tickMark(IC.x, IC.y, f.x, f.y, 1, "#1971C2") +
        rightMark(f.x, f.y, aS, 8, "#4A7DB4") +
        `<circle cx="${f.x.toFixed(1)}" cy="${f.y.toFixed(1)}" r="4.2" fill="#FFFFFF" stroke="#1971C2" stroke-width="2.4"/>` +
        `</g>`;
    });
    gTouch.innerHTML = tp;
    chips.on("meet", "세 변에 동시에!");
    haptic(HAPTIC.correct);
    toast("여기예요! 두 이등분선의 교점에서 원이 세 변에 동시에 닿아요.");
    helper.innerHTML = "원이 <b>세 변에 동시에 닿으면서</b> 반지름도 딱 최대가 됐어요. 이 점의 비밀, 판정해 볼까요?";
    snapping = false;
    later(askDist, 1400);
  }

  function askDist(): void {
    if (asked) return;
    asked = true;
    qline.innerHTML = "이 특별한 점에서 <b>세 변까지의 거리</b>는 어떤 관계일까요?";
    const row = el("div", { class: "mq6-choices" });
    let done = false;
    const btns: { bt: HTMLButtonElement; good: boolean }[] = [];
    for (const it of CHOICES) {
      const bt = el("button", { class: "mq6-choice wide", text: it.t, attrs: { type: "button" } }) as HTMLButtonElement;
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
        later(finale, it.good ? 1900 : 3400); // 오답 해설은 읽을 시간을 더 준다
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function finale(): void {
    qline.innerHTML = "";
    clear(ctl);
    gBA.innerHTML = bisectorSvg(TA, TB, TC, GEO.hlC, "#C2255C", 3, null);
    void gBA.getBoundingClientRect();
    gBA.style.opacity = "1"; // 0.6초 페이드
    toast("세 번째 이등분선도 정확히 이 점을 지나요! 세 길이 전부 한 점에서 만나요.");
    later(() => {
      chips.on("dist", "모두 같아요!");
      haptic(HAPTIC.done);
      helper.innerHTML =
        "이 점은 <b>세 변에서 같은 거리</b>예요. 그 거리를 반지름 삼으면 삼각형 안에 꼭 맞는 <b>가장 큰 원</b>이 그려지죠. " +
        "각을 반으로 가르는 세 길이 모두 지나는 이 특별한 점, 정식 이름이 기다리고 있어요!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "이름 붙이러 가기");
    }, 750);
  }

  /* ── 드래그(삼각형 내부 클램프, 실시간) ── */
  function toLocal(e: PointerEvent): Pt {
    const rect = svg.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * VW, y: ((e.clientY - rect.top) / rect.height) * VH };
  }

  function dragTo(e: PointerEvent): void {
    if (!dragging || snapping || snapped) return;
    const q = toLocal(e);
    if (!insideBy(q, 5)) return; // 내부 판정 실패 시 이동 무시
    P = q;
    paint();
    maybeSnap();
  }

  svg.addEventListener("pointerdown", (e) => {
    if (snapped || snapping) return;
    if (distPts(toLocal(e), P) > 30) return;
    dragging = true;
    capturePointer(svg, e.pointerId);
    if (!hintArmed) {
      // 첫 드래그부터 6초가 지나도 90% 미만이면 도구를 먼저 열어 준다(칩은 90% 도달 시)
      hintArmed = true;
      later(() => {
        if (!toolsShown) {
          helper.innerHTML = "꽤 어렵죠? 도구 없이는 확신할 수 없어요. 아래 <b>도구 버튼</b>을 눌러 보세요.";
          showTools();
        }
      }, 6000);
    }
    dragTo(e);
  });
  svg.addEventListener("pointermove", (e) => {
    if (dragging) dragTo(e);
  });
  const drop = (): void => {
    if (!dragging) return;
    dragging = false;
    maybeSnap();
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  paint();
  api.setCTA("가장 큰 원의 비밀을 밝히면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
