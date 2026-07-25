// webStabilityLab — 생물다양성이 낮은 생태계와 높은 생태계에서 한 생물을 없애 보고
// 먹이 관계가 얼마나 버티는지 비교하는 랩.
//  · 위(다양성 낮음) : 벼 → 메뚜기 → 개구리 → 매 — 먹이 사슬이 한 줄뿐이다.
//  · 아래(다양성 높음) : 벼·배추·옥수수 → 메뚜기·배추흰나비·참새 → 개구리·뱀 → 매 — 여러 갈래다.
//  · 생물을 탭하면 그 생물이 사라진다(멸종). 먹이가 모두 사라진 생물은 연결선이 끊기고
//    회색으로 바뀐다. [되돌리기]로 다시 살려 몇 번이든 실험할 수 있다.
//
// 판정 규칙(코드 = 개념): 어떤 생물은 자신의 먹이가 **전부** 사라졌을 때에만 위험해진다.
// 그래서 한 줄짜리 먹이 사슬은 가운데 한 칸만 끊겨도 위쪽이 줄줄이 무너지고,
// 여러 갈래인 쪽은 한 종이 사라져도 다른 생물이 그 자리를 대신해 매가 유지된다.
//
// 그림은 전부 캔버스 손코딩(발주 이미지 의존 없음). 텍스트는 12px 이상.

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import "../../styles/bio3-life.css";

interface WebStabilityStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "low" | "high" | "verdict";
type Web = "low" | "high";

// 논리 좌표 위쪽 50px는 무대 HUD 알약 자리, 아래쪽 49px(445~494)은 토스트 자리로 비워 둔다.
const CVH = 496;
const BASE_W = 360;
const BASE_H = 494;

const ALIVE = "#12B886";
const RISK = "#8A99AE";
const GONE = "#7C8AA0";
const INK = "#EAF1FA";

interface Node {
  id: string;
  name: string;
  web: Web;
  x: number;
  y: number;
  /** 이 생물이 먹는 생물들 — 전부 사라지면 이 생물도 위험해진다. */
  prey: string[];
  /** 라벨 폭에서 계산한 상자 너비(첫 프레임에 실측으로 갱신). */
  w: number;
}

const NODE_H = 26;

const node = (id: string, name: string, web: Web, x: number, y: number, prey: string[]): Node =>
  ({ id, name, web, x, y, prey, w: Math.max(54, name.length * 12.6 + 20) });

/** 위 무대 — 먹이 사슬이 한 줄뿐인 생태계. */
const LOW: Node[] = [
  node("aHawk", "매", "low", 180, 88, ["aFrog"]),
  node("aFrog", "개구리", "low", 180, 128, ["aHopper"]),
  node("aHopper", "메뚜기", "low", 180, 168, ["aRice"]),
  node("aRice", "벼", "low", 180, 208, []),
];

/** 아래 무대 — 먹이 관계가 여러 갈래인 생태계.
    뱀이 개구리와 참새를 함께 먹기 때문에 개구리가 사라져도 매까지 길이 이어진다. */
const HIGH: Node[] = [
  node("bHawk", "매", "high", 180, 284, ["bFrog", "bSnake"]),
  node("bSnake", "뱀", "high", 250, 322, ["bFrog", "bSparrow"]),
  node("bFrog", "개구리", "high", 110, 350, ["bHopper", "bButterfly"]),
  node("bHopper", "메뚜기", "high", 64, 392, ["bRice", "bCabbage", "bCorn"]),
  node("bButterfly", "배추흰나비", "high", 180, 392, ["bCabbage"]),
  node("bSparrow", "참새", "high", 296, 392, ["bRice", "bCorn"]),
  node("bRice", "벼", "high", 64, 432, []),
  node("bCabbage", "배추", "high", 180, 432, []),
  node("bCorn", "옥수수", "high", 296, 432, []),
];

const NODES: Node[] = LOW.concat(HIGH);
const BY_ID: Record<string, Node> = {};
for (const n of NODES) BY_ID[n.id] = n;

/** 먹이가 전부 사라진 생물을 위로 전파하며 찾아낸다. */
function computeStarving(dead: Set<string>): Set<string> {
  const out = new Set<string>();
  for (let pass = 0; pass < 8; pass++) {
    let changed = false;
    for (const n of NODES) {
      if (dead.has(n.id) || out.has(n.id) || n.prey.length === 0) continue;
      if (n.prey.every((p) => dead.has(p) || out.has(p))) { out.add(n.id); changed = true; }
    }
    if (!changed) break;
  }
  return out;
}

export const webStabilityLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as WebStabilityStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge bio", dataset: { g: "low" } }, el("b", { text: "한 줄 먹이" }), el("span", { text: "붕괴 확인" })),
    el("div", { class: "pn-badge bio", dataset: { g: "high" } }, el("b", { text: "여러 갈래" }), el("span", { text: "유지 확인" })),
    el("div", { class: "pn-badge bio", dataset: { g: "verdict" } }, el("b", { text: "안정성" }), el("span", { text: "판정 1문" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "두 생태계의 먹이 관계예요. 먼저 <b>위쪽 무대의 개구리</b>를 탭해 없애 보세요. 위로 이어진 생물들은 어떻게 될까요?",
  });

  const canvas = el("canvas", {
    class: "b3-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0", role: "img",
      "aria-label": "먹이 사슬이 한 줄인 생태계와 먹이 관계가 여러 갈래인 생태계를 위아래로 나란히 놓고 생물을 탭해 없애 보는 무대",
    },
  });
  const readPill = el("span", { text: "생물을 탭해 없애 보세요" });
  const toast = el("div", { class: "toast low" });
  const stage = el(
    "div", { class: "stage b3-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:${ALIVE}` }), readPill)),
    toast,
  );

  const legend = el(
    "div", { class: "wsl-legend" },
    el("span", { class: "wsl-key alive" }, el("i"), document.createTextNode("살아 있어요")),
    el("span", { class: "wsl-key risk" }, el("i"), document.createTextNode("먹이를 잃어 위험해요")),
    el("span", { class: "wsl-key gone" }, el("i"), document.createTextNode("사라졌어요")),
  );
  const why = el("div", { class: "wsl-why" });

  const controls = el("div", { class: "b3-controls" });
  const resetBtn = el("button", {
    class: "btn b3-btn b3-sub", attrs: { type: "button" }, dataset: { wslAct: "reset" }, text: "되돌리기 (모두 되살리기)",
  });
  controls.appendChild(resetBtn);

  host.append(goalsEl, helper, stage, legend, why, controls);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ── 상태 ──────────────────────────────────────────────────────────────
  const goals = new Set<Goal>();
  const dead = new Set<string>();
  let starving = new Set<string>();
  /** 노드별 연출값(0 → 1로 이징). */
  const anim: Record<string, { d: number; o: number }> = {};
  for (const n of NODES) anim[n.id] = { d: 0, o: 0 };
  let finished = false;
  let compareShown = false;
  let W = BASE_W;
  let k = 1;
  let ox = 0;
  let toastTimer = 0;
  const timers = new Set<number>();

  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  };
  const toastMsg = (msg: string): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  };

  const finish = (): void => {
    if (finished) return;
    finished = true;
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "생물다양성 보전 정리하기");
  };

  const collect = (id: Goal, msg: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement | null;
    if (chip) {
      chip.classList.add("on");
      const sp = chip.querySelector("span");
      if (sp) sp.textContent = "확인";
    }
    haptic(HAPTIC.ctaUnlock);
    toastMsg(msg);
    if (goals.size === 3) finish();
    maybeVerdict();
  };

  // ── 조작 ──────────────────────────────────────────────────────────────
  function recompute(): void {
    starving = computeStarving(dead);
  }

  function removeNode(n: Node): void {
    dead.add(n.id);
    haptic(HAPTIC.wrong);
    recompute();
    readPill.textContent = `사라진 생물 ${dead.size}종`;

    if (n.web === "low") {
      if (starving.has("aHawk")) {
        toastMsg("먹이 사슬이 한 줄이라 위쪽 생물까지 곧바로 위험해졌어요");
        helper.innerHTML = "먹이 사슬이 <b>한 줄</b>뿐이라, 가운데 한 곳만 끊겨도 위쪽 생물이 줄줄이 먹이를 잃어요. 이번엔 <b>아래쪽 무대</b>에서 같은 생물을 없애 볼까요?";
        collect("low", "한 줄짜리 먹이 사슬은 한 곳만 끊겨도 위험해져요");
      } else {
        toastMsg(`${n.name} 멸종 · 위로 이어진 먹이 관계를 살펴보세요`);
      }
      return;
    }

    if (!dead.has("bHawk") && !starving.has("bHawk")) {
      toastMsg("먹이 관계가 여러 갈래라 다른 생물이 대신해 매는 그대로예요");
      if (!goals.has("high")) {
        helper.innerHTML = "아래쪽은 <b>여러 갈래</b>예요. 개구리가 사라져도 뱀이 참새를 먹고, 매는 그 뱀을 먹으며 유지돼요.";
        collect("high", "길이 여러 갈래면 한 종이 사라져도 위쪽이 유지돼요");
      }
    } else if (starving.has("bHawk")) {
      toastMsg("여러 갈래도 너무 많이 끊기면 결국 위쪽이 위험해져요");
    } else {
      toastMsg(`${n.name} 멸종 · 위로 이어진 먹이 관계를 살펴보세요`);
    }
  }

  const onTap = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const lx = (e.clientX - r.left - ox) / k;
    const ly = (e.clientY - r.top) / k;
    for (const n of NODES) {
      if (Math.abs(lx - n.x) > n.w / 2 || Math.abs(ly - n.y) > NODE_H / 2) continue;
      if (dead.has(n.id)) { toastMsg("이미 사라진 생물이에요. 되돌리기로 다시 살릴 수 있어요"); return; }
      removeNode(n);
      return;
    }
  };
  canvas.addEventListener("pointerdown", onTap);

  resetBtn.addEventListener("click", () => {
    if (!dead.size) { toastMsg("아직 없앤 생물이 없어요"); return; }
    dead.clear();
    recompute();
    haptic(HAPTIC.tap);
    readPill.textContent = "모두 되살렸어요";
    toastMsg("모두 되살렸어요. 다른 생물로도 실험해 보세요");
  });

  // ── 판정 ──────────────────────────────────────────────────────────────
  function maybeVerdict(): void {
    if (compareShown || !goals.has("low") || !goals.has("high")) return;
    compareShown = true;
    helper.innerHTML = "두 무대를 견주어 보았어요. 왜 이런 차이가 생겼을까요?";
    const box = el(
      "div", { class: "hook-choices show" },
      el("div", { class: "hook-q", html: "먹이 관계가 <b>여러 갈래</b>인 생태계가 더 안정적인 까닭은 무엇일까요?" }),
    );
    const choices = [
      { t: "한 생물이 사라져도 다른 생물이 그 자리를 대신할 수 있어서", ok: true, miss: "" },
      { t: "생물의 수가 많아 먹이의 양이 더 많아서", ok: false, miss: "양이 아니라 이어진 길의 수가 중요해요. 길이 여러 갈래면 하나가 끊겨도 다른 길이 남아요" },
      { t: "먹이 사슬이 한 줄이면 관리하기 쉬워서", ok: false, miss: "한 줄이면 한 곳만 끊겨도 위쪽 생물이 모두 위험해져요. 위쪽 무대에서 방금 확인했죠" },
    ];
    let answered = false;
    for (const c of choices) {
      const b = el("button", {
        class: "hook-choice", attrs: { type: "button" }, dataset: { wslOk: String(c.ok) }, text: c.t,
      });
      b.addEventListener("click", () => {
        if (answered) return;
        if (!c.ok) {
          haptic(HAPTIC.wrong);
          b.classList.add("miss");
          toastMsg(c.miss);
          return;
        }
        answered = true;
        haptic(HAPTIC.correct);
        for (const other of Array.from(box.querySelectorAll(".hook-choice")) as HTMLElement[]) other.classList.add("dim");
        b.classList.remove("dim");
        b.classList.add("reveal");
        why.innerHTML = "생태계에서 어떤 생물종이 완전히 사라지는 것을 <b>멸종</b>이라고 해요. 생물다양성이 높은 생태계는 먹이 관계가 여러 갈래라, 한 종이 멸종해도 다른 생물이 그 자리를 대신해 비교적 안정적으로 유지돼요. 반대로 생물다양성이 낮은 생태계는 한 종만 사라져도 크게 흔들려요.";
        helper.innerHTML = "그래서 생물다양성을 지키는 일은 곧 <b>생태계를 안정적으로 지키는 일</b>이에요.";
        collect("verdict", "여러 갈래일수록 한 종이 멸종해도 생태계가 버텨요");
      });
      box.appendChild(b);
    }
    controls.appendChild(box);
    later(() => box.scrollIntoView({ behavior: "smooth", block: "nearest" }), 140);
  }

  // ── 그리기 ────────────────────────────────────────────────────────────
  const sx = (x: number): number => ox + x * k;
  const sy = (y: number): number => y * k;

  function drawLink(ctx: CanvasRenderingContext2D, prey: Node, pred: Node): void {
    const broken = dead.has(prey.id) || starving.has(prey.id);
    const x0 = sx(prey.x);
    const y0 = sy(prey.y - NODE_H / 2);
    const x1 = sx(pred.x);
    const y1 = sy(pred.y + NODE_H / 2);
    ctx.save();
    ctx.lineWidth = 2 * k;
    ctx.lineCap = "round";
    if (broken) {
      // 끊긴 길 — 가운데를 비우고 회색 점선으로.
      ctx.strokeStyle = "rgba(138,153,174,.45)";
      ctx.setLineDash([4 * k, 4 * k]);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + (x1 - x0) * 0.34, y0 + (y1 - y0) * 0.34);
      ctx.moveTo(x0 + (x1 - x0) * 0.66, y0 + (y1 - y0) * 0.66);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = "rgba(18,184,134,.62)";
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      // 먹이가 위로 흘러가는 방향 삼각형
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      const ang = Math.atan2(y1 - y0, x1 - x0);
      ctx.fillStyle = "rgba(18,184,134,.8)";
      ctx.translate(mx, my);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(5 * k, 0);
      ctx.lineTo(-3.6 * k, 3.4 * k);
      ctx.lineTo(-3.6 * k, -3.4 * k);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawNode(ctx: CanvasRenderingContext2D, n: Node): void {
    const a = anim[n.id];
    ctx.save();
    ctx.font = `800 ${Math.max(12, 12.5 * k)}px Pretendard, sans-serif`;
    n.w = Math.max(54, ctx.measureText(n.name).width / k + 22);
    const bw = n.w * k;
    const bh = NODE_H * k;
    const bx = sx(n.x) - bw / 2;
    const by = sy(n.y) - bh / 2;

    const fadeD = a.d;
    const fadeO = a.o;
    ctx.globalAlpha = 1 - fadeD * 0.62;
    ctx.fillStyle = fadeD > 0.1
      ? "rgba(52,64,84,.5)"
      : fadeO > 0.1 ? "rgba(138,153,174,.16)" : "rgba(18,184,134,.18)";
    ctx.strokeStyle = fadeD > 0.1 ? GONE : fadeO > 0.1 ? RISK : ALIVE;
    ctx.lineWidth = 1.6 * k;
    if (fadeD > 0.1 || fadeO > 0.1) ctx.setLineDash([5 * k, 4 * k]);
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 10 * k);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = fadeD > 0.1 ? "#6C82A2" : fadeO > 0.1 ? "#A8BCDF" : INK;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(n.name, sx(n.x), sy(n.y) + 0.5 * k);

    if (fadeD > 0.05) {
      // 사라진 생물 — 상자 위에 가위표
      ctx.globalAlpha = fadeD;
      ctx.strokeStyle = "#F04452";
      ctx.lineWidth = 2.2 * k;
      ctx.lineCap = "round";
      const m = 6 * k;
      ctx.beginPath();
      ctx.moveTo(bx + m, by + m);
      ctx.lineTo(bx + bw - m, by + bh - m);
      ctx.moveTo(bx + bw - m, by + m);
      ctx.lineTo(bx + m, by + bh - m);
      ctx.stroke();
    } else if (fadeO > 0.05) {
      // 먹이를 잃은 생물 — 상자 옆에 "위험" 칩(위로 붙이면 윗줄 상자와 겹친다).
      ctx.globalAlpha = fadeO;
      ctx.font = `800 ${Math.max(12, 12 * k)}px Pretendard, sans-serif`;
      const label = "위험";
      const cw = ctx.measureText(label).width + 16 * k;
      const chh = 18 * k;
      let chx = bx + bw + 6 * k;
      if (chx + cw > ox + (BASE_W - 6) * k) chx = bx - 6 * k - cw;
      chx = clamp(chx, ox + 4 * k, ox + BASE_W * k - cw - 4 * k);
      const chy = sy(n.y) - chh / 2;
      ctx.fillStyle = "rgba(20,32,52,.92)";
      ctx.strokeStyle = RISK;
      ctx.lineWidth = 1.2 * k;
      ctx.beginPath();
      ctx.roundRect(chx, chy, cw, chh, 9 * k);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#C7D4E8";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, chx + cw / 2, chy + chh / 2);
    }
    ctx.restore();
  }

  function drawHeader(ctx: CanvasRenderingContext2D, x: number, y: number, title: string, note: string): void {
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = `800 ${Math.max(12, 13 * k)}px Pretendard, sans-serif`;
    ctx.fillStyle = "#C7D4E8";
    ctx.fillText(title, sx(x), sy(y));
    const tw = ctx.measureText(title).width;
    ctx.font = `700 ${Math.max(12, 12 * k)}px Pretendard, sans-serif`;
    ctx.fillStyle = "#7E93B3";
    ctx.fillText(note, sx(x) + tw + 8 * k, sy(y) + 1.5 * k);
    ctx.restore();
  }

  const loop: Loop = createLoop((dt) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    k = Math.min(W / BASE_W, CVH / BASE_H);
    ox = (W - BASE_W * k) / 2;
    ctx.clearRect(0, 0, W, fit.h);

    for (const n of NODES) {
      const a = anim[n.id];
      const td = dead.has(n.id) ? 1 : 0;
      const to = !dead.has(n.id) && starving.has(n.id) ? 1 : 0;
      a.d += (td - a.d) * Math.min(1, dt * 0.16);
      a.o += (to - a.o) * Math.min(1, dt * 0.16);
    }

    drawHeader(ctx, 12, 50, "다양성이 낮은 곳", "먹이 사슬이 한 줄");
    drawHeader(ctx, 12, 238, "다양성이 높은 곳", "먹이 관계가 여러 갈래");

    // 두 무대를 가르는 선
    ctx.save();
    ctx.strokeStyle = "rgba(126,147,179,.28)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5 * k, 5 * k]);
    ctx.beginPath();
    ctx.moveTo(sx(12), sy(230));
    ctx.lineTo(sx(BASE_W - 12), sy(230));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    for (const n of NODES) for (const p of n.prey) drawLink(ctx, BY_ID[p], n);
    for (const n of NODES) drawNode(ctx, n);
  });

  recompute();
  const onResize = (): void => { fitCanvas(canvas, CVH); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("두 생태계에서 생물을 없애 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onTap);
  };
};
