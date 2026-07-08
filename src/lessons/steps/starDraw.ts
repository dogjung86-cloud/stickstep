// starDraw — 별그리기 랩. 학생이 원 위의 점을 손으로 직접 이어 별을 그린다.
//   첫 걸음(시작점 → 아무 점)이 보폭 k를 정하고, 그다음부터는 같은 보폭만 허용 —
//   시작점으로 돌아왔을 때 모든 점을 밟았으면 한붓 별(성공 조건 = n과 k가 서로소).
//   시나리오: ① n=6 — 건너뛰는 보폭(2·3·4)은 전부 실패 → "6점 별은 없다"
//             ② n=5 — 성공, '서로소' 명명 ③ n=8 — 성공 보폭(3·5) 찾기. 세그 잠금 해제 순서 6→5→8.
//   조작: 점에서 점으로 드래그(러버밴드) 또는 목표 점 탭. rAF 금지 — CSS 트랜지션만.
//   setPointerCapture는 try/catch(합성 포인터 안전).

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips, gcd } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface StarStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

// ---- SVG 헬퍼 ----
const NS = "http://www.w3.org/2000/svg";
function sv<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}

const VB_W = 360;
const VB_H = 240;
const CX = 180;
const CY = 126;
const R = 90;
const HIT = 30; // 점 히트 반경(뷰박스 단위)

// 장면 색
const C_PT_STROKE = "#0DA5C6";
const C_PT_FILL = "#0DA5C6";
const C_LINE = "#22ACCB";
const C_GOLD = "#F0B429";
const C_FAILLINE = "#9DB0C2";
const C_GUIDE = "#D8E9EF";
const C_DIM = "#64748B";
const C_RUBBER = "#7CCBDE";

const SEG_NS = [6, 5, 8];
const SEG_LABELS = ["6점", "5점", "8점"];

export const starDraw: StepRenderer = (host, step, api) => {
  const s = step as unknown as StarStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "six", label: "6점의 비밀", sub: "별은?" },
    { id: "five", label: "첫 별", sub: "n=5" },
    { id: "eight", label: "8점 별", sub: "보폭은?" },
  ]);
  const board = mboard(330);

  const svg = sv("svg", {
    viewBox: `0 0 ${VB_W} ${VB_H}`,
    role: "application",
    "aria-label": "별그리기 무대 — 시작 점에서 다른 점으로 선을 그어요. 첫 걸음이 보폭이 되고, 이후 같은 보폭으로만 이을 수 있어요.",
  });
  const gLines = sv("g");
  const gRubber = sv("g");
  const gPts = sv("g");
  svg.append(
    sv("circle", { cx: CX, cy: CY, r: R, fill: "none", stroke: C_GUIDE, "stroke-width": 1.6, "stroke-dasharray": "3 5" }),
    gLines,
    gRubber,
    gPts,
  );
  const startLbl = sv("text", { x: CX, y: CY - R - 13, fill: C_DIM, "font-size": 11, "font-weight": 800, "text-anchor": "middle" });
  startLbl.textContent = "시작";
  svg.appendChild(startLbl);
  const stage = el("div", { class: "sd-stage" });
  stage.appendChild(svg);
  svg.style.touchAction = "none";

  // 세그(점 개수) — 시나리오 순서대로 잠금 해제
  const unlockedN = new Set<number>([6]);
  const segBtns: HTMLButtonElement[] = SEG_NS.map((nv, i) =>
    el("button", { class: "ct-btn", text: SEG_LABELS[i], attrs: { type: "button", "aria-label": `점 ${nv}개로 전환` } }),
  );
  const segRow = el("div", { class: "ct-actions" }, ...segBtns);

  // 보폭 표시 + 다시 그리기
  const kvMain = el("div", { html: "보폭 <b>?</b>" });
  const kvGcd = el("div", { style: "font-size:11px; font-weight:700; color:var(--n500); margin-top:2px", text: "첫 걸음이 보폭을 정해요" });
  const kv = el("div", { class: "sd-kv" }, kvMain, kvGcd);
  const retryB = el("button", { class: "ct-btn", text: "다시 그리기", attrs: { type: "button" } }) as HTMLButtonElement;
  const ctrl = el("div", { class: "sd-ctrl" }, kv, retryB);

  board.append(stage, segRow, ctrl);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "<b>시작 점</b>에서 원하는 점으로 <b>선을 그어 보세요</b>(탭도 돼요). 첫 걸음의 칸수가 보폭이 되고, 그다음부턴 <b>같은 보폭</b>으로만 갈 수 있어요. 한붓 별, 될까요?",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 타이머 ----
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  // ---- 상태 ----
  let n = 6;
  let k = 0; // 0 = 아직 보폭 미정(첫 걸음 전)
  let cur = 0; // 현재 점
  let ended = false; // 이번 시도 종료(성공/실패) — 재시도 전 입력 잠금
  let named = false; // '서로소' 명명 이후 표기
  let finished = false;
  let ptEls: SVGCircleElement[] = [];
  let lineEls: SVGLineElement[] = [];
  let seen = new Set<number>();
  const sixTried = new Set<number>();

  const ptPos = (i: number): { x: number; y: number } => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; // 12시부터 시계 방향
    return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
  };

  function updateKv(): void {
    if (k === 0) {
      kvMain.innerHTML = "보폭 <b>?</b>";
      kvGcd.textContent = "첫 걸음이 보폭을 정해요";
      return;
    }
    const kd = Math.min(k, n - k); // 표시용 보폭(방향 무관)
    kvMain.innerHTML = `보폭 <b>${kd}</b>칸`;
    const g = gcd(n, kd);
    kvGcd.innerHTML =
      named && g === 1
        ? `최대공약수 1 — <span style="color:var(--subj-num-press)">서로소!</span>`
        : `최대공약수 ${g}`;
  }

  function buildPoints(): void {
    clear(gPts);
    ptEls = [];
    for (let i = 0; i < n; i++) {
      const p = ptPos(i);
      const c = sv("circle", { cx: p.x, cy: p.y, r: 6.5, fill: "#FFFFFF", stroke: C_PT_STROKE, "stroke-width": 2.2 });
      c.style.transition = "fill .25s, opacity .3s, r .18s var(--ease-out)";
      gPts.appendChild(c);
      ptEls.push(c);
    }
  }

  /** 다음에 갈 수 있는 점을 살짝 크게(첫 걸음 전엔 전부 후보). */
  function paintHints(): void {
    ptEls.forEach((c, i) => {
      const isNext = !ended && i !== cur && (k === 0 || i === (cur + k) % n);
      c.style.setProperty("r", i === cur ? "8.5" : isNext ? "7.6" : "6.5");
      c.setAttribute("stroke-width", i === cur ? "3" : "2.2");
    });
  }

  function resetAttempt(): void {
    clear(gLines);
    gRubber.innerHTML = "";
    lineEls = [];
    seen = new Set<number>([0]);
    cur = 0;
    k = 0;
    ended = false;
    for (const c of ptEls) {
      c.setAttribute("fill", "#FFFFFF");
      c.style.opacity = "1";
    }
    ptEls[0]?.setAttribute("fill", C_PT_FILL);
    updateKv();
    paintHints();
  }

  function paintSegs(): void {
    segBtns.forEach((x, i) => {
      x.classList.toggle("hero", SEG_NS[i] === n);
      const on = unlockedN.has(SEG_NS[i]);
      x.disabled = !on;
      x.style.opacity = on ? "" : ".38";
    });
  }

  function drawSeg(a: number, b: number): void {
    const p1 = ptPos(a);
    const p2 = ptPos(b);
    const ln = sv("line", { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: C_LINE, "stroke-width": 2.6, "stroke-linecap": "round" });
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    ln.style.setProperty("stroke-dasharray", String(len));
    ln.style.setProperty("stroke-dashoffset", String(len));
    gLines.appendChild(ln);
    void ln.getBoundingClientRect(); // 트랜지션 시작점 확정
    ln.style.transition = "stroke-dashoffset .16s linear, stroke .5s, stroke-width .5s, opacity .4s";
    ln.style.setProperty("stroke-dashoffset", "0");
    lineEls.push(ln);
  }

  function goldify(): void {
    for (const ln of lineEls) {
      ln.style.stroke = C_GOLD;
      ln.style.strokeWidth = "3.4";
    }
    ptEls.forEach((c, i) => {
      later(() => c.style.setProperty("r", "9"), i * 40);
      later(() => c.style.setProperty("r", "6.5"), i * 40 + 220);
    });
  }

  function dimUnvisited(): void {
    ptEls.forEach((c, i) => {
      if (!seen.has(i)) c.style.opacity = ".3";
    });
    for (const ln of lineEls) {
      ln.style.stroke = C_FAILLINE;
      ln.style.opacity = ".8";
    }
  }

  function collect(id: string, sub: string, msg: string): void {
    if (!chips.on(id, sub)) return;
    toast(msg);
    if (chips.count() === 3 && !finished) {
      finished = true;
      haptic(HAPTIC.done);
      later(() => {
        helper.innerHTML =
          "별의 비밀은 <b>서로소</b>! 점 개수 n과 보폭 k의 <b>최대공약수가 1</b>일 때만, 내 손으로 그은 선이 모든 점을 도는 별이 돼요.";
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "다음");
      }, 1600);
    }
  }

  function unlock(nv: number): void {
    unlockedN.add(nv);
    paintSegs();
  }

  /** 시작점으로 돌아온 순간 — 시도 평가. */
  function evaluate(): void {
    ended = true;
    paintHints();
    const kd = Math.min(k, n - k);
    const g = gcd(n, kd);
    if (seen.size === n) {
      if (kd === 1) {
        // 다각형 — 모든 점을 돌긴 했지만 별이 아니다
        haptic(HAPTIC.tap);
        toast("다 돌긴 했는데… 다각형!");
        helper.innerHTML =
          "이웃 점끼리 이으면 <b>다각형 둘레</b>가 될 뿐이에요. 별은 <b>건너뛰어야</b> 태어나요 — 다시 그리기로 2칸 이상 건너 보세요!";
        return;
      }
      // ---- 성공: 한붓 별 ----
      goldify();
      haptic(HAPTIC.correct);
      if (n === 5 && !chips.has("five")) {
        named = true;
        updateKv();
        collect("five", "별 완성!", "내 손으로 그린 한붓 별!");
        helper.innerHTML =
          `<b>gcd(5,${kd})=1</b> — 최대공약수가 1인 두 수를 <b>서로소</b>라고 해요. 서로소라서 모든 점을 한 번씩 다 돌았어요! 이제 <b>8점</b>에 도전!`;
        unlock(8);
      } else if (n === 8 && !chips.has("eight")) {
        collect("eight", `${kd}칸!`, `보폭 ${kd} — 8점 별 완성!`);
        helper.innerHTML = `8과 ${kd}의 최대공약수는 1 — <b>서로소</b>예요. 8점에서는 서로소인 보폭(3, 5)만 별을 그려요!`;
      } else {
        toast("한붓 별 완성!");
      }
    } else {
      // ---- 실패: 일부 점만 밟고 제자리 ----
      dimUnvisited();
      haptic(HAPTIC.cross);
      toast(`점 ${seen.size}개만 밟고 제자리로!`);
      if (n === 6) {
        if (kd >= 2) sixTried.add(kd);
        if (sixTried.size >= 2 && !chips.has("six")) {
          collect("six", "별 불가!", "6점 별은 불가능!");
          helper.innerHTML =
            "6과 서로소인 보폭은 <b>1과 5뿐</b> — 그건 그냥 육각형 둘레라서, <b>6점 별은 없어요!</b> 이제 5점으로 가 볼까요?";
          unlock(5);
        } else if (!chips.has("six")) {
          helper.innerHTML = `gcd(6,${kd})=${g}라서 점 ${6 / g}개만 밟고 시작점으로 돌아왔어요. <b>다른 보폭</b>으로도 그어 봐요!`;
        }
      } else {
        helper.innerHTML = `gcd(${n},${kd})=${g}라서 점 ${n / g}개만 밟았어요. <b>다시 그리기</b>로 보폭을 바꿔 도전!`;
      }
    }
  }

  /** 점프 시도 — 목표 점 t로. */
  function jump(t: number): void {
    if (ended || finished || t === cur) return;
    const skip = (t - cur + n) % n;
    if (k === 0) {
      k = skip;
      updateKv();
    } else if (skip !== k) {
      // 같은 보폭 강제 — 별의 규칙
      haptic(HAPTIC.wrong);
      const want = (cur + k) % n;
      ptEls[want]?.style.setProperty("r", "9.5");
      later(() => paintHints(), 380);
      toast(`별은 같은 보폭으로만 — ${Math.min(k, n - k)}칸씩!`);
      return;
    }
    haptic(HAPTIC.tap);
    drawSeg(cur, t);
    cur = t;
    seen.add(t);
    ptEls[t].setAttribute("fill", C_PT_FILL);
    paintHints();
    if (t === 0) later(evaluate, 280);
  }

  // ---- 포인터: 드래그 러버밴드 + 탭 ----
  const toVb = (e: PointerEvent): { x: number; y: number } => {
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / Math.max(1, r.width)) * VB_W, y: ((e.clientY - r.top) / Math.max(1, r.height)) * VB_H };
  };
  const hitPoint = (p: { x: number; y: number }): number => {
    for (let i = 0; i < n; i++) {
      const q = ptPos(i);
      if (Math.hypot(q.x - p.x, q.y - p.y) < HIT) return i;
    }
    return -1;
  };
  let dragging = false;
  let rubber: SVGLineElement | null = null;

  svg.addEventListener("pointerdown", (e) => {
    if (ended || finished) return;
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 포인터 안전 */
    }
    dragging = true;
    const c = ptPos(cur);
    gRubber.innerHTML = "";
    rubber = sv("line", { x1: c.x, y1: c.y, x2: c.x, y2: c.y, stroke: C_RUBBER, "stroke-width": 2.4, "stroke-dasharray": "5 5", "stroke-linecap": "round" });
    gRubber.appendChild(rubber);
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging || !rubber) return;
    const p = toVb(e);
    rubber.setAttribute("x2", String(p.x));
    rubber.setAttribute("y2", String(p.y));
    const h = hitPoint(p);
    ptEls.forEach((c, i) => c.setAttribute("stroke-width", i === h && i !== cur ? "3.4" : i === cur ? "3" : "2.2"));
  });
  const endDrag = (e: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    gRubber.innerHTML = "";
    rubber = null;
    if (ended || finished) return;
    const t = hitPoint(toVb(e));
    if (t >= 0 && t !== cur) jump(t);
    else paintHints();
  };
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", () => {
    dragging = false;
    gRubber.innerHTML = "";
    rubber = null;
  });

  // ---- 컨트롤 배선 ----
  retryB.addEventListener("click", () => {
    if (finished && chips.count() === 3) return;
    haptic(HAPTIC.tap);
    resetAttempt();
    toast("처음부터 — 보폭을 골라 그어요");
  });

  function switchN(nv: number): void {
    if (nv === n || !unlockedN.has(nv)) return;
    n = nv;
    haptic(HAPTIC.select);
    buildPoints();
    resetAttempt();
    paintSegs();
    helper.innerHTML =
      nv === 6
        ? "6점이에요. 보폭을 바꿔 가며 직접 그어 봐요!"
        : nv === 5
          ? "이번엔 <b>5점</b>! 2칸씩 건너 그으면 어떻게 될까요?"
          : "<b>8점 별</b>에 도전 — 성공하는 보폭을 찾아 그어 봐요!";
  }
  segBtns.forEach((b, i) => b.addEventListener("click", () => switchN(SEG_NS[i])));

  buildPoints();
  resetAttempt();
  paintSegs();
  api.setCTA("별 미션 3개를 완수해요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
