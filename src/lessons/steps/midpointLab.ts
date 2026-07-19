// midpointLab, 중점 잇기(중2 수학 Ⅴ L7, 책 206쪽). 정리의 이름은 이 랩에서 쓰지 않는다 —
// 명명은 다음 concept 몫('중점'은 중1 기왕, '평행'과 '평행사변형'(m2u4 기왕)은 사용 가능).
// 국면 1(pick): △ABC에서 AB·AC의 중점 M·N을 차례로 탭 → MN이 그어지고(선 긋기 애니)
//   평행 인디케이터(MN·BC 같은 방향 화살촉) + 실측 리드아웃(MN=7·BC=14, 딱 절반) 등장.
// 국면 2(morph): 꼭짓점 A 자유 드래그(범위 제한) — 어떤 모양이 돼도 평행·절반이 유지된다.
//   BC가 고정이라 MN 실측도 7에서 꿈쩍 않는 것이 발견 장치(큰 변형 2회로 달성).
// 국면 3(quad): 무대 교체 — 볼록 사각형 네 변의 중점 4개를 전부 탭 → 안쪽 사각형 완성 +
//   "마주 보는 변이 평행!" 배지(두 쌍 인디케이터) → 꼭짓점 C를 찌그러뜨려도 유지 →
//   대각선 보기 토글이 위·아래 삼각형 힌트(중점 연결선 ∥ 대각선 AC)를 보여 준다.
// 좌표 검산: BC 238px = 14칸(1칸 17px) → MN 119px = 7칸 정확. C 이동 상자(x 200~330, y 140~250)는
//   네 코너 모두 대각선 BD 기준 외적 부호가 같아 변 교차(자기 교차)가 없다.
// 클래스 접두사는 .mdp-(2026-07-20 개명): 처음 쓰던 .mpl-은 중1 시트 math.css의 랩(.mpl-read가
//   absolute+::before "거리")이 선점한 접두사라, 리드아웃 필이 무대 위에 떠 꼭짓점 A를 덮는
//   실사고가 났다. 새 랩 접두사는 math.css·math2.css 양쪽 grep으로 선점 검사부터(테마명 규칙의 클래스판).
// rAF 금지(CSS 트랜지션 + setTimeout 체인, 타이머 Set). 스타일: math2.css .mdp- 섹션.
import { el, clear, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, dot, ptLabel, tickMark, arrowHead, angleOf, lineSvg, capturePointer } from "../../ui/geoKit";
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

const RB = "#C2255C"; // 단원 액센트(마트료시카 라즈베리)
const U = 17; // 1칸(px) — BC 238px = 14칸, MN은 언제나 119px = 7칸
const TB: Pt = { x: 51, y: 218 };
const TC: Pt = { x: 289, y: 218 };
const A0: Pt = { x: 170, y: 48 };
const ABOX = { x0: 46, x1: 294, y0: 36, y1: 148 };
/* 국면 3: 찌그러진 볼록 사각형(랜덤 느낌 고정 좌표) */
const QA: Pt = { x: 58, y: 80 };
const QB: Pt = { x: 272, y: 44 };
const QD: Pt = { x: 90, y: 232 };
const QC0: Pt = { x: 296, y: 200 };
const CBOX = { x0: 200, x1: 330, y0: 140, y1: 250 };

const mid = (p: Pt, q: Pt): Pt => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
const dist = (p: Pt, q: Pt): number => Math.hypot(q.x - p.x, q.y - p.y);

/** 칸 수 표기: 정수는 정수로, 아니면 소수 1자리. */
function fmtU(px: number): string {
  const v = Math.round((px / U) * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/** 평행 인디케이터: 선분 위 같은 방향 화살촉 n개(쌍 구분은 개수로). */
function paraMark(p: Pt, q: Pt, color: string, n: number): string {
  const a = angleOf(p.x, p.y, q.x, q.y);
  let sv = "";
  for (let k = 0; k < n; k++) {
    const tt = 0.46 + (k - (n - 1) / 2) * 0.12;
    const m = { x: p.x + (q.x - p.x) * tt, y: p.y + (q.y - p.y) * tt };
    sv += arrowHead(m.x, m.y, a, color, 6.5);
  }
  return sv;
}

export const midpointLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "link", label: "중점 잇기", sub: "M과 N을 탭" },
    { id: "morph", label: "모양이 변해도", sub: "잠김" },
    { id: "quad", label: "어떤 사각형이든", sub: "잠김" },
  ]);

  const board = mboard(520);
  const readout = el("div", { class: "mdp-read", attrs: { "aria-live": "polite" } });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 260" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="중점 잇기 실험 무대">` +
    `<g class="mdp-base"></g><g class="mdp-link"></g><g class="mdp-mid"></g><g class="mdp-mark"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  board.append(readout, svgWrap, actions);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "AB의 한가운데 <b>M</b>, AC의 한가운데 <b>N</b>이 반짝여요. 두 중점을 <b>차례로 탭</b>해서 이어 보세요!",
  });
  host.append(chips.el, helper, board); // 칩 → helper(지시) → 보드, 확정 배치
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gBase = svg.querySelector(".mdp-base") as SVGGElement;
  const gLink = svg.querySelector(".mdp-link") as SVGGElement;
  const gMid = svg.querySelector(".mdp-mid") as SVGGElement;
  const gMark = svg.querySelector(".mdp-mark") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ── 상태 ── */
  let phase: "pick" | "morph" | "quad" | "diag" | "done" = "pick";
  let ax = A0.x;
  let ay = A0.y;
  let sel: "M" | "N" | null = null;
  let linked = false;
  let moves = 0;
  let lastRest: Pt = { ...A0 };
  let dragA = false;
  let tick = 0;
  /* 국면 3 */
  let qc: Pt = { ...QC0 };
  const lit = new Set<number>();
  let innerDone = false;
  let dragC = false;
  let cAcc = 0;
  let diagShown = false;
  let diagOn = false;
  let badgePop = false;

  function popRead(): void {
    readout.classList.remove("mq6-pop");
    void readout.offsetWidth;
    readout.classList.add("mq6-pop");
  }

  /* ══════════ 국면 1~2: 삼각형 ══════════ */

  /** 중점 점(대기 중엔 점선 링 펄스, 선택되면 초록 링). */
  function mdot(p: Pt, selOn: boolean, name: string, dx: number): string {
    const pulse =
      phase === "pick" && !linked && !selOn
        ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="11" fill="none" stroke="${RB}" stroke-width="2" stroke-dasharray="4 3">` +
          `<animate attributeName="stroke-opacity" values="1;.25;1" dur="1.4s" repeatCount="indefinite"/></circle>`
        : "";
    const ring = selOn
      ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="10.5" fill="none" stroke="${GEO.ok}" stroke-width="2.6"/>`
      : "";
    return pulse + ring + dot(p.x, p.y, RB, 5) + ptLabel(p.x, p.y, name, dx, 4, RB);
  }

  function paintTri(): void {
    const AP: Pt = { x: ax, y: ay };
    const M = mid(AP, TB);
    const N = mid(AP, TC);
    gBase.innerHTML =
      `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)} L${TB.x} ${TB.y} L${TC.x} ${TC.y} Z" fill="rgba(194,37,92,.06)" stroke="${GEO.ink}" stroke-width="2.2" stroke-linejoin="round"/>` +
      dot(TB.x, TB.y) + dot(TC.x, TC.y) +
      ptLabel(ax, ay, "A", 0, -14) + ptLabel(TB.x, TB.y, "B", -12, 12) + ptLabel(TC.x, TC.y, "C", 12, 12) +
      (phase === "morph"
        ? `<g><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="14" fill="rgba(194,37,92,.14)"/>` +
          `<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="7.5" fill="#FFFFFF" stroke="${RB}" stroke-width="2.8"/></g>` +
          (moves === 0 && !dragA
            ? arrowHead(ax - 25, ay, 180, "#B6C2D2", 6) +
              arrowHead(ax + 25, ay, 0, "#B6C2D2", 6) +
              arrowHead(ax, ay + 23, 270, "#B6C2D2", 6)
            : "")
        : dot(ax, ay));
    gMid.innerHTML = mdot(M, sel === "M", "M", -14) + mdot(N, sel === "N", "N", 14);
    if (linked) {
      gLink.innerHTML =
        lineSvg(M.x, M.y, N.x, N.y, RB, 3.4) +
        paraMark(M, N, GEO.hlD, 1) +
        paraMark(TB, TC, GEO.hlD, 1) +
        tickMark(ax, ay, M.x, M.y, 1, GEO.hlA) +
        tickMark(M.x, M.y, TB.x, TB.y, 1, GEO.hlA) +
        tickMark(ax, ay, N.x, N.y, 2, GEO.hlB) +
        tickMark(N.x, N.y, TC.x, TC.y, 2, GEO.hlB);
      readout.innerHTML =
        `<span class="mdp-para">MN ∥ BC</span>` +
        `<span>MN <b>${fmtU(dist(M, N))}</b> · BC <b>${fmtU(dist(TB, TC))}</b></span>` +
        `<span class="mdp-half">딱 절반!</span>`;
    }
  }

  function link(): void {
    linked = true;
    sel = null;
    haptic(HAPTIC.correct);
    const AP: Pt = { x: ax, y: ay };
    const M = mid(AP, TB);
    const N = mid(AP, TC);
    const len = dist(M, N);
    gLink.innerHTML =
      `<line x1="${M.x.toFixed(1)}" y1="${M.y.toFixed(1)}" x2="${N.x.toFixed(1)}" y2="${N.y.toFixed(1)}" stroke="${RB}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="${len.toFixed(1)}" stroke-dashoffset="${len.toFixed(1)}" style="transition: stroke-dashoffset .6s var(--ease, cubic-bezier(.22,1,.36,1))"/>`;
    const ln = gLink.querySelector("line") as SVGLineElement;
    later(() => {
      ln.style.strokeDashoffset = "0";
    }, 30);
    later(() => {
      paintTri(); // 인디케이터·틱·리드아웃 확정 렌더
      popRead();
      chips.on("link", "평행 + 절반!");
      toast("놀라운 두 가지! MN은 BC와 평행하고, 길이는 딱 절반(7과 14)이에요.");
      helper.innerHTML = "이 삼각형만 그런 걸까요? 이제 꼭짓점 <b>A를 잡고</b> 마음껏 끌어 보세요!";
      later(() => {
        phase = "morph";
        lastRest = { x: ax, y: ay };
        paintTri();
      }, 1200);
    }, 750);
  }

  /* ══════════ 국면 3: 사각형 피날레 ══════════ */

  const quadMids = (): Pt[] => [mid(QA, QB), mid(QB, qc), mid(qc, QD), mid(QD, QA)];

  function paintQuad(animSegs: boolean): void {
    const m = quadMids();
    gBase.innerHTML =
      `<path d="M${QA.x} ${QA.y} L${QB.x} ${QB.y} L${qc.x.toFixed(1)} ${qc.y.toFixed(1)} L${QD.x} ${QD.y} Z" fill="#F2F6FB" stroke="${GEO.ink}" stroke-width="2.2" stroke-linejoin="round"/>` +
      dot(QA.x, QA.y) + dot(QB.x, QB.y) + dot(QD.x, QD.y) +
      ptLabel(QA.x, QA.y, "A", -12, -6) + ptLabel(QB.x, QB.y, "B", 10, -6) +
      ptLabel(qc.x, qc.y, "C", 15, 6) + ptLabel(QD.x, QD.y, "D", -12, 13) +
      (innerDone
        ? `<g><circle cx="${qc.x.toFixed(1)}" cy="${qc.y.toFixed(1)}" r="14" fill="rgba(194,37,92,.14)"/>` +
          `<circle cx="${qc.x.toFixed(1)}" cy="${qc.y.toFixed(1)}" r="7.5" fill="#FFFFFF" stroke="${RB}" stroke-width="2.8"/></g>` +
          (cAcc < 8 && !dragC
            ? arrowHead(qc.x - 25, qc.y, 180, "#B6C2D2", 6) + arrowHead(qc.x, qc.y - 23, 90, "#B6C2D2", 6)
            : "")
        : dot(qc.x, qc.y));
    let mids = "";
    for (let k = 0; k < 4; k++) {
      const p = m[k];
      mids += lit.has(k)
        ? dot(p.x, p.y, RB, 5.5)
        : `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="10" fill="none" stroke="${RB}" stroke-width="2" stroke-dasharray="4 3">` +
          `<animate attributeName="stroke-opacity" values="1;.25;1" dur="1.4s" repeatCount="indefinite"/></circle>` +
          dot(p.x, p.y, RB, 4);
    }
    gMid.innerHTML = mids;
    if (innerDone) {
      gLink.innerHTML =
        `<path d="M${m[0].x.toFixed(1)} ${m[0].y.toFixed(1)} L${m[1].x.toFixed(1)} ${m[1].y.toFixed(1)} L${m[2].x.toFixed(1)} ${m[2].y.toFixed(1)} L${m[3].x.toFixed(1)} ${m[3].y.toFixed(1)} Z" fill="rgba(194,37,92,.10)" stroke="${RB}" stroke-width="3" stroke-linejoin="round"/>` +
        paraMark(m[0], m[1], GEO.hlD, 1) + paraMark(m[3], m[2], GEO.hlD, 1) +
        paraMark(m[1], m[2], GEO.hlB, 2) + paraMark(m[0], m[3], GEO.hlB, 2);
    } else {
      let segs = "";
      for (let k = 0; k < 4; k++) {
        const a = m[k];
        const b = m[(k + 1) % 4];
        if (lit.has(k) && lit.has((k + 1) % 4)) {
          segs += `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${RB}" stroke-width="3.2" stroke-linecap="round"${animSegs ? ` class="mdp-seg"` : ""}/>`;
        }
      }
      gLink.innerHTML = segs;
    }
    let mk = "";
    if (diagOn) {
      mk +=
        `<path d="M${QA.x} ${QA.y} L${QB.x} ${QB.y} L${qc.x.toFixed(1)} ${qc.y.toFixed(1)} Z" fill="rgba(240,140,0,.10)"/>` +
        `<path d="M${QA.x} ${QA.y} L${qc.x.toFixed(1)} ${qc.y.toFixed(1)} L${QD.x} ${QD.y} Z" fill="rgba(13,165,198,.10)"/>` +
        lineSvg(QA.x, QA.y, qc.x, qc.y, GEO.hlC, 2.4, "7 5") +
        paraMark(QA, qc, GEO.hlD, 1);
    }
    if (innerDone) {
      mk +=
        `<g class="mdp-badge${badgePop ? " pop" : ""}"><rect x="78" y="6" width="184" height="27" rx="9" fill="#F0FBF5" stroke="#04B45F" stroke-width="2"/>` +
        `<text x="170" y="24.5" text-anchor="middle" font-size="12.5" font-weight="900" fill="#1E7A31">마주 보는 변이 평행!</text></g>`;
    }
    gMark.innerHTML = mk;
  }

  function buildQuad(): void {
    phase = "quad";
    readout.innerHTML = "";
    helper.innerHTML =
      "이번엔 찌그러진 <b>사각형</b>이에요! 네 변의 <b>중점 4개</b>를 전부 탭해서 이어 보세요.";
    paintQuad(false);
  }

  function quadComplete(): void {
    innerDone = true;
    badgePop = true;
    haptic(HAPTIC.correct);
    paintQuad(false);
    later(() => {
      badgePop = false;
    }, 700);
    toast("안쪽에 새 사각형이 태어났어요! 마주 보는 변이 두 쌍 모두 평행이에요.");
    helper.innerHTML = "우연인지 확인해요. 꼭짓점 <b>C를 잡고</b> 마음껏 찌그러뜨려 보세요!";
  }

  function showDiagBtn(): void {
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "대각선 보기" }));
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      diagOn = true;
      phase = "diag";
      paintQuad(false);
      toast("대각선 AC가 사각형을 두 삼각형으로 갈랐어요. 위 삼각형의 중점 연결선은 AC와 평행, 방금 그 규칙이에요! 아래 삼각형도 똑같죠.");
      helper.innerHTML =
        "사각형의 비밀은 <b>삼각형 규칙 두 번</b>이었어요. 그래서 어떤 사각형이든 안쪽은 평행사변형!";
      later(() => {
        chips.on("quad", "안쪽은 평행사변형");
        complete();
      }, 2200);
    });
    actions.appendChild(b);
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function complete(): void {
    phase = "done";
    clear(actions);
    haptic(HAPTIC.done);
    helper.innerHTML =
      "중점 두 개만 이으면 <b>평행</b>과 <b>절반</b>이 공짜로 따라와요. 이 발견에 이름을 붙이러 가요!";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 포인터(탭 판정·드래그, 캡처는 try/catch 내장 헬퍼) ── */
  function toPt(e: PointerEvent): Pt {
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 340, y: ((e.clientY - r.top) / r.height) * 260 };
  }

  function moveA(p: Pt): void {
    const nx = clamp(p.x, ABOX.x0, ABOX.x1);
    const ny = clamp(p.y, ABOX.y0, ABOX.y1);
    if (Math.abs(nx - ax) < 0.5 && Math.abs(ny - ay) < 0.5) return;
    ax = nx;
    ay = ny;
    const k = Math.round(ax / 20) * 100 + Math.round(ay / 20);
    if (k !== tick) {
      tick = k;
      haptic(HAPTIC.tap);
    }
    paintTri();
  }

  function moveC(p: Pt): void {
    const nx = clamp(p.x, CBOX.x0, CBOX.x1);
    const ny = clamp(p.y, CBOX.y0, CBOX.y1);
    if (Math.abs(nx - qc.x) < 0.5 && Math.abs(ny - qc.y) < 0.5) return;
    cAcc += Math.hypot(nx - qc.x, ny - qc.y);
    qc = { x: nx, y: ny };
    const k = Math.round(nx / 20) * 100 + Math.round(ny / 20);
    if (k !== tick) {
      tick = k;
      haptic(HAPTIC.tap);
    }
    paintQuad(false);
  }

  svg.addEventListener("pointerdown", (e) => {
    const p = toPt(e);
    if (phase === "pick") {
      const AP: Pt = { x: ax, y: ay };
      const M = mid(AP, TB);
      const N = mid(AP, TC);
      const hitM = dist(p, M) <= 26;
      const hitN = dist(p, N) <= 26;
      if (!hitM && !hitN) return;
      const name: "M" | "N" = hitM && (!hitN || dist(p, M) <= dist(p, N)) ? "M" : "N";
      if (sel === null) {
        sel = name;
        haptic(HAPTIC.select);
        helper.innerHTML = `좋아요, <b>${name}</b>을 골랐어요. 이제 <b>${name === "M" ? "N" : "M"}</b>도 탭해서 이어요!`;
        paintTri();
      } else if (sel !== name) {
        link();
      } else {
        toast("다른 쪽 중점을 탭해서 이어요!");
      }
      return;
    }
    if (phase === "morph") {
      if (dist(p, { x: ax, y: ay }) <= 30) {
        dragA = true;
        capturePointer(svg, e.pointerId);
        paintTri();
      }
      return;
    }
    if (phase === "quad" && !innerDone) {
      const m = quadMids();
      for (let k = 0; k < 4; k++) {
        if (!lit.has(k) && dist(p, m[k]) <= 24) {
          lit.add(k);
          haptic(HAPTIC.select);
          if (lit.size === 4) quadComplete();
          else {
            paintQuad(true);
            toast(`${lit.size}/4 연결! 남은 중점도 탭해요.`);
          }
          return;
        }
      }
      return;
    }
    if ((phase === "quad" || phase === "diag") && innerDone) {
      if (dist(p, qc) <= 30) {
        dragC = true;
        capturePointer(svg, e.pointerId);
        paintQuad(false);
      }
    }
  });
  svg.addEventListener("pointermove", (e) => {
    if (dragA) moveA(toPt(e));
    else if (dragC) moveC(toPt(e));
  });
  const drop = (): void => {
    if (dragA) {
      dragA = false;
      const d = dist({ x: ax, y: ay }, lastRest);
      if (d >= 60) {
        moves += 1;
        lastRest = { x: ax, y: ay };
        if (moves === 1) {
          toast("모양이 확 바뀌었는데 MN ∥ BC도, 7 대 14 절반도 그대로예요! 한 번 더 크게!");
        } else if (chips.on("morph", "그래도 절반!")) {
          haptic(HAPTIC.correct);
          popRead();
          toast("어떤 삼각형이 돼도 중점을 이은 선은 밑변과 평행, 길이는 절반이에요!");
          helper.innerHTML = "삼각형은 정복 완료예요. 그럼 <b>사각형</b>이라면 어떨까요?";
          later(buildQuad, 1600);
        }
      }
      paintTri();
    }
    if (dragC) {
      dragC = false;
      if (cAcc >= 80 && !diagShown) {
        diagShown = true;
        haptic(HAPTIC.correct);
        toast("아무리 찌그러뜨려도 안쪽은 마주 보는 변이 평행한 사각형, 평행사변형이에요!");
        helper.innerHTML = "왜 그런지 비밀은 대각선에 있어요. 아래 <b>대각선 보기</b>를 눌러요!";
        showDiagBtn();
      }
      paintQuad(false);
    }
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  paintTri();
  api.setCTA("사각형까지 이으면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
