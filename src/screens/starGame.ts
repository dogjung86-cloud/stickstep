// starGame — "별자리 한붓그리기" (수학 Ⅰ 수와 연산 보너스 게임, 단원 정복 보상)
// L4 별그리기 랩을 자유 놀이로 승격한 화면: 점 개수(5~12)를 고르고 보폭을 그어
// 한붓 별을 수집한다. 성공 조건 = 점 개수와 보폭이 서로소(레슨에서 배운 그 감각).
// 도감 9칸 = 별 8종(5·2, 7·2, 7·3, 8·3, 9·2, 9·4, 10·3, 12·5) + 비밀 1(6점 별은 없다).
// 새 발견마다 +5 XP(최고 기록 갱신분만 — 파밍 방지). rAF 없음, CSS 트랜지션만(수학 규율).
import { el, clear } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { mboard, mtoast, gcd } from "../ui/mathKit";
import { awardXp, bestScore, submitScore } from "../core/store";
import type { Screen } from "../core/router";

export const STAR_GAME_ID = "m1u1-stars";

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
const HIT = 30;

const C_PT_STROKE = "#0DA5C6";
const C_PT_FILL = "#0DA5C6";
const C_LINE = "#22ACCB";
const C_GOLD = "#F0B429";
const C_FAILLINE = "#9DB0C2";
const C_GUIDE = "#D8E9EF";
const C_DIM = "#64748B";
const C_RUBBER = "#7CCBDE";

const SEG_NS = [5, 6, 7, 8, 9, 10, 12];

/** 도감: 존재하는 한붓 별 전부(보폭은 방향 무관 대표값 2..n/2, n과 서로소, 1 제외) + 비밀 1. */
const DEX: { key: string; n: number; k: number }[] = [
  { key: "5/2", n: 5, k: 2 },
  { key: "7/2", n: 7, k: 2 },
  { key: "7/3", n: 7, k: 3 },
  { key: "8/3", n: 8, k: 3 },
  { key: "9/2", n: 9, k: 2 },
  { key: "9/4", n: 9, k: 4 },
  { key: "10/3", n: 10, k: 3 },
  { key: "12/5", n: 12, k: 5 },
];
const SECRET_KEY = "no6";
const DEX_TOTAL = DEX.length + 1; // 9

/** {n/k} 미니 별 SVG(도감 칸용). */
function miniStar(n: number, k: number, size = 22): string {
  const r = size / 2 - 1.6;
  const c = size / 2;
  const pt = (i: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  };
  let d = "";
  let cur = 0;
  for (let i = 0; i <= n; i++) {
    const [x, y] = pt(cur);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    cur = (cur + k) % n;
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" fill="none"><path d="${d}Z" stroke="#FFF7E0" stroke-width="1.7" stroke-linejoin="round"/></svg>`;
}

export function starGameScreen(onExit: () => void): Screen {
  // ---- 헤더 ----
  const xbtn = el("button", { class: "xbtn", attrs: { "aria-label": "나가기" }, html: icon("x", 20, { sw: 2.4 }) });
  const bestPill = el("div", { class: "pill mg-best", text: `최고 ${bestScore(STAR_GAME_ID)}/${DEX_TOTAL}` });
  const header = el("div", { class: "lheader" }, xbtn, el("div", { class: "mg-title", text: "별자리 한붓그리기" }), bestPill);

  // ---- 도감 ----
  const found = new Set<string>();
  const dexRow = el("div", { class: "stg-dex", attrs: { role: "list", "aria-label": "별 도감" } });
  const slotEls = new Map<string, HTMLElement>();
  for (const d of DEX) {
    const slot = el("div", { class: "stg-slot", text: "?", attrs: { role: "listitem", "aria-label": "미발견 별" } });
    slotEls.set(d.key, slot);
    dexRow.appendChild(slot);
  }
  const secretSlot = el("div", { class: "stg-slot secret", text: "6?", attrs: { role: "listitem", "aria-label": "6점의 비밀" } });
  slotEls.set(SECRET_KEY, secretSlot);
  dexRow.appendChild(secretSlot);

  function paintDex(): void {
    for (const d of DEX) {
      const slot = slotEls.get(d.key)!;
      if (found.has(d.key) && !slot.classList.contains("on")) {
        slot.classList.add("on");
        slot.innerHTML = miniStar(d.n, d.k);
        slot.setAttribute("aria-label", `${d.n}점 별, 보폭 ${d.k}`);
      }
    }
    if (found.has(SECRET_KEY) && !secretSlot.classList.contains("on")) {
      secretSlot.classList.add("on");
      secretSlot.textContent = "6✕";
      secretSlot.setAttribute("aria-label", "비밀: 6점 별은 없다");
    }
  }

  // ---- 무대(레슨 별그리기와 같은 기하) ----
  const board = mboard(322);
  const svg = sv("svg", {
    viewBox: `0 0 ${VB_W} ${VB_H}`,
    role: "application",
    "aria-label": "별그리기 무대, 시작 점에서 다른 점으로 선을 그어요. 첫 걸음이 보폭이 되고, 이후 같은 보폭으로만 이을 수 있어요.",
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

  const segBtns: HTMLButtonElement[] = SEG_NS.map((nv) =>
    el("button", { class: "ct-btn", text: `${nv}점`, attrs: { type: "button", "aria-label": `점 ${nv}개로 전환` } }),
  );
  const segRow = el("div", { class: "ct-actions stg-segs" }, ...segBtns);

  const kvMain = el("div", { html: "보폭 <b>?</b>" });
  const kvGcd = el("div", { style: "font-size:11px; font-weight:700; color:var(--n500); margin-top:2px", text: "첫 걸음이 보폭을 정해요" });
  const kv = el("div", { class: "sd-kv" }, kvMain, kvGcd);
  const retryB = el("button", { class: "ct-btn", text: "다시 그리기", attrs: { type: "button" } }) as HTMLButtonElement;
  const ctrl = el("div", { class: "sd-ctrl" }, kv, retryB);

  board.append(stage, segRow, ctrl);
  const toast = mtoast(board);
  const coach = el("div", {
    class: "helper",
    html: "점 개수를 고르고 <b>시작 점</b>에서 선을 그어 별을 완성해 봐요. 레슨에서 배운 <b>서로소 감각</b>이 무기예요, 도감 9칸을 채워요!",
  });

  const wrap = el("div", { class: "wrap stg-wrap" }, dexRow, board, coach);
  const scroll = el("div", { class: "scroll" }, wrap);
  const section = el("section", { class: "screen stg-screen" }, header, scroll);

  const snackEl = el("div", { class: "snack" });
  section.appendChild(snackEl);
  let snackTimer = 0;
  function snack(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2200);
  }

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
  let n = 5;
  let k = 0;
  let cur = 0;
  let ended = false;
  let ptEls: SVGCircleElement[] = [];
  let lineEls: SVGLineElement[] = [];
  let seen = new Set<number>();
  let paidBest = bestScore(STAR_GAME_ID); // 이미 보상받은 최고 기록(파밍 방지선)

  const ptPos = (i: number): { x: number; y: number } => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
  };

  function updateKv(): void {
    if (k === 0) {
      kvMain.innerHTML = "보폭 <b>?</b>";
      kvGcd.textContent = "첫 걸음이 보폭을 정해요";
      return;
    }
    const kd = Math.min(k, n - k);
    const g = gcd(n, kd);
    kvMain.innerHTML = `보폭 <b>${kd}</b>칸`;
    kvGcd.innerHTML =
      g === 1
        ? `${n}과 ${kd}, 최대공약수 1 <span style="color:var(--subj-num-press, #0A87A3)">(서로소!)</span>`
        : `${n}과 ${kd}, 최대공약수 ${g}…`;
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
    segBtns.forEach((x, i) => x.classList.toggle("hero", SEG_NS[i] === n));
  }

  function drawSeg(a: number, b: number): void {
    const p1 = ptPos(a);
    const p2 = ptPos(b);
    const ln = sv("line", { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: C_LINE, "stroke-width": 2.6, "stroke-linecap": "round" });
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    ln.style.setProperty("stroke-dasharray", String(len));
    ln.style.setProperty("stroke-dashoffset", String(len));
    gLines.appendChild(ln);
    void ln.getBoundingClientRect();
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

  /** 새 발견 → 도감 갱신 + 최고 기록 갱신분만 XP 보상. */
  function discover(key: string, msg: string): void {
    if (found.has(key)) {
      toast("이미 도감에 있어요!");
      return;
    }
    found.add(key);
    paintDex();
    haptic(HAPTIC.correct);
    const score = found.size;
    let reward = "";
    if (score > paidBest) {
      submitScore(STAR_GAME_ID, score);
      awardXp(5);
      paidBest = score;
      bestPill.textContent = `최고 ${score}/${DEX_TOTAL}`;
      reward = " (+5 스텝)";
    }
    snack(`${msg}, 도감 ${score}/${DEX_TOTAL}${reward}`);
    if (score === DEX_TOTAL) {
      haptic(HAPTIC.done);
      coach.innerHTML =
        "<b>도감 완성!</b> 존재하는 한붓 별을 전부 찾았어요. 별이 되는 조건은 언제나 하나, 점 개수와 보폭이 <b>서로소</b>일 것. 이제 어떤 n이든 별이 몇 종류인지 세어 볼 수 있겠죠?";
    }
  }

  function evaluate(): void {
    ended = true;
    paintHints();
    const kd = Math.min(k, n - k);
    const g = gcd(n, kd);
    if (seen.size === n) {
      if (kd === 1) {
        haptic(HAPTIC.tap);
        toast("다 돌긴 했는데… 다각형!");
        coach.innerHTML = "이웃 점끼리 이으면 <b>다각형 둘레</b>일 뿐, 별은 <b>건너뛰어야</b> 태어나요. 다시 그리기로 2칸 이상!";
        return;
      }
      goldify();
      discover(`${n}/${kd}`, `별 ${n}·${kd} 발견!`);
      if (found.size < DEX_TOTAL)
        coach.innerHTML = `${n}과 ${kd}는 <b>서로소</b>(최대공약수 1)라 모든 점을 다 돌았어요. 같은 ${n}점에 <b>다른 서로소 보폭</b>이 더 있을지도?`;
    } else {
      dimUnvisited();
      haptic(HAPTIC.cross);
      toast(`점 ${seen.size}개만 밟고 제자리로!`);
      if (n === 6 && kd >= 2) {
        discover(SECRET_KEY, "비밀 발견: 6점 별은 없다!");
        coach.innerHTML =
          "6과 서로소인 보폭은 <b>1과 5뿐</b>(둘 다 육각형 둘레)이라 <b>6점 별은 존재하지 않아요</b>. 도감의 비밀 칸이 열렸어요!";
      } else {
        coach.innerHTML = `${n}과 ${kd}의 최대공약수가 <b>${g}</b>라서 점을 ${n}÷${g} = <b>${n / g}개</b>만 밟고 돌아왔어요. 서로소인 보폭으로 다시!`;
      }
    }
  }

  function jump(t: number): void {
    if (ended || t === cur) return;
    const skip = (t - cur + n) % n;
    if (k === 0) {
      k = skip;
      updateKv();
    } else if (skip !== k) {
      haptic(HAPTIC.wrong);
      const want = (cur + k) % n;
      ptEls[want]?.style.setProperty("r", "9.5");
      later(() => paintHints(), 380);
      toast(`별은 같은 보폭으로만, ${Math.min(k, n - k)}칸씩!`);
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
    if (ended) return;
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
    if (ended) return;
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

  // ---- 컨트롤 ----
  retryB.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    resetAttempt();
    toast("처음부터, 보폭을 골라 그어요");
  });
  function switchN(nv: number): void {
    if (nv === n) return;
    n = nv;
    haptic(HAPTIC.select);
    buildPoints();
    resetAttempt();
    paintSegs();
  }
  segBtns.forEach((b, i) => b.addEventListener("click", () => switchN(SEG_NS[i])));

  xbtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    window.clearTimeout(snackTimer);
    onExit();
  });

  buildPoints();
  resetAttempt();
  paintSegs();

  return { el: section };
}
