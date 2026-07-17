// digestJourneyLab — 영양소 토큰을 소화관(입→위→작은창자)을 따라 끌어 소화 여정을 완주하는 캔버스 랩.
//  · 토큰을 경로 위에서 오른쪽으로 끌면 진행률이 오르고, 소화가 일어나는 기관을 지날 때 반응이 터진다.
//  · 녹말=입·작은창자, 단백질=위·작은창자, 지방=작은창자에서만 분해된다. 소화 안 되는 기관은 통과만.
//  · 작은창자(경로 끝)에 닿으면 최종 산물(포도당·아미노산·지방산+모노글리세라이드)로 바뀐다.
//  · 목표 ① 녹말 ② 단백질 ③ 지방 완주.
// 조작 실체: 경로 폴리라인 위 최근접점으로 스냅하며 누적 진행률을 재고, 역주행은 무시한다(circulationLab 계승).

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { bodyColor, safePointerCapture, type BodyColor } from "../../ui/bodyKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface DigestJourneyStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Nutrient = "starch" | "protein" | "fat";
type Organ = "mouth" | "stomach" | "intestine";

const CVH = 300;
const BASE_W = 360;
// 완주한 영양소가 최종 산물로 모이는 하단 트레이(경로와 겹치지 않는 여백).
const TRAY_Y = 276;
const TRAY_X: Record<Nutrient, number> = { starch: 80, protein: 180, fat: 286 };

// 소화관 경로(가로, 완만한 굽이): 입 → 식도 → 위 → 작은창자.
const DUCT: [number, number][] = [
  [52, 74], [96, 74], [140, 88], [180, 118], [206, 150], [230, 178], [268, 190], [308, 188],
];
// 각 기관의 경로상 위치(t 근사)와 화면 좌표.
const STATIONS: { organ: Organ; t: number; label: string }[] = [
  { organ: "mouth", t: 0.02, label: "입" },
  { organ: "stomach", t: 0.5, label: "위" },
  { organ: "intestine", t: 0.99, label: "작은창자" },
];

const ROUTES: Record<Nutrient, { name: string; product: string; colorKey: BodyColor; digestAt: Organ[]; notes: Record<Organ, string> }> = {
  starch: {
    name: "녹말", product: "포도당", colorKey: "nutrient", digestAt: ["mouth", "intestine"],
    notes: {
      mouth: "침 속 아밀레이스가 녹말을 엿당으로 바꿔요",
      stomach: "위에서는 녹말을 분해하는 효소가 작용하지 않아요",
      intestine: "이자액과 작은창자 효소가 엿당을 포도당까지 분해해요",
    },
  },
  protein: {
    name: "단백질", product: "아미노산", colorKey: "protein", digestAt: ["stomach", "intestine"],
    notes: {
      mouth: "입에는 단백질을 분해하는 효소가 없어요",
      stomach: "위의 펩신이 염산의 도움을 받아 단백질을 분해해요",
      intestine: "작은창자에서 트립신 등이 작용해 아미노산이 돼요",
    },
  },
  fat: {
    name: "지방", product: "지방산·모노글리세라이드", colorKey: "fat", digestAt: ["intestine"],
    notes: {
      mouth: "입에서는 지방 소화가 거의 일어나지 않아요",
      stomach: "위의 펩신은 지방이 아니라 단백질에 작용해요",
      intestine: "쓸개즙이 지방을 잘게 흩고 라이페이스가 분해해요",
    },
  },
};
const NUTRIENTS: Nutrient[] = ["starch", "protein", "fat"];

function pathLen(pts: [number, number][]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return d;
}
function pointAt(pts: [number, number][], t: number): [number, number] {
  const total = pathLen(pts);
  let target = clamp(t, 0, 1) * total;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (target <= seg) {
      const f = seg === 0 ? 0 : target / seg;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
    }
    target -= seg;
  }
  return pts[pts.length - 1];
}
function nearestT(pts: [number, number][], px: number, py: number): { t: number; dist: number } {
  const total = pathLen(pts);
  let acc = 0;
  let best = { t: 0, dist: Infinity };
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const dx = bx - ax;
    const dy = by - ay;
    const seg = Math.hypot(dx, dy) || 1;
    const u = clamp(((px - ax) * dx + (py - ay) * dy) / (seg * seg), 0, 1);
    const cx = ax + dx * u;
    const cy = ay + dy * u;
    const dist = Math.hypot(px - cx, py - cy);
    if (dist < best.dist) best = { t: (acc + u * seg) / total, dist };
    acc += seg;
  }
  return best;
}

export const digestJourneyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DigestJourneyStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    ...NUTRIENTS.map((id) => el("div", { class: "pn-badge body", dataset: { g: id } }, el("b", { text: ROUTES[id].name }), el("span", { text: "여정 완주" }))),
  );
  const helper = el("div", {
    class: "helper",
    html: "영양소 알갱이를 <b>소화관을 따라 오른쪽으로 끌어</b> 보세요. 소화가 일어나는 기관을 지날 때마다 무슨 일이 생기는지 확인해요.",
  });
  const canvas = el("canvas", {
    class: "body-lab-canvas",
    style: `height:${CVH}px`,
    attrs: { tabindex: "0", role: "img", "aria-label": "입에서 위, 작은창자로 이어지는 소화관 위에서 영양소 알갱이를 끌어 이동시키는 무대" },
  });
  const readPill = el("span", { text: "영양소를 소화관으로 끌어요" });
  const toast = el("div", { class: "toast" });
  const stage = el(
    "div", { class: "stage body-lab-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#E23B4B" }), readPill)),
    toast,
  );
  host.append(goalsEl, helper, stage);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let W = BASE_W;
  const scale = (): number => W / BASE_W;
  const sx = (x: number): number => x * scale();
  const sy = (y: number): number => y * scale();

  interface Tok { id: Nutrient; color: string; t: number; done: boolean; passed: Set<Organ> }
  const toks: Tok[] = NUTRIENTS.map((id) => ({ id, color: bodyColor(ROUTES[id].colorKey) || "#12B886", t: 0, done: false, passed: new Set() }));
  const byId = (id: Nutrient): Tok => toks.find((t) => t.id === id)!;
  // t=0에서 세 토큰이 겹치지 않게 시작점만 세로로 흩는다.
  const startOffset: Record<Nutrient, number> = { starch: -20, protein: 0, fat: 20 };

  const goals = new Set<Nutrient>();
  let finished = false;
  let toastTimer = 0;
  let active: Nutrient | null = null;

  const toastMsg = (msg: string): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1750);
  };
  const collect = (id: Nutrient): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = ROUTES[id].product;
    haptic(HAPTIC.ctaUnlock);
    toastMsg(`${ROUTES[id].name} → ${ROUTES[id].product}`);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML = "여정 완주! 소화효소는 <b>특정 영양소에만</b> 작용해요. 녹말은 <b>포도당</b>, 단백질은 <b>아미노산</b>, 지방은 <b>지방산과 모노글리세라이드</b>로 분해돼 작은창자에서 흡수돼요.";
      readPill.textContent = "세 영양소 소화 완성";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "순환계로 이동하기");
    }
  };

  const tokPos = (tk: Tok): [number, number] => {
    const [x, y] = pointAt(DUCT, tk.t);
    return tk.t < 0.02 ? [x, y + startOffset[tk.id]] : [x, y];
  };

  const passStation = (tk: Tok): void => {
    for (const st of STATIONS) {
      if (tk.t + 1e-6 >= st.t && !tk.passed.has(st.organ)) {
        tk.passed.add(st.organ);
        const spec = ROUTES[tk.id];
        const digests = spec.digestAt.includes(st.organ);
        toastMsg(spec.notes[st.organ]);
        if (digests) haptic(HAPTIC.select);
      }
    }
  };

  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) / scale();
    const py = (e.clientY - r.top) / scale();
    let pick: Nutrient | null = null;
    let pickDist = Infinity;
    for (const tk of toks) {
      if (tk.done) continue;
      const [tx, ty] = tokPos(tk);
      const d = Math.hypot(px - tx, py - ty);
      if (d < 22 && d < pickDist) { pick = tk.id; pickDist = d; }
    }
    if (!pick) return;
    active = pick;
    safePointerCapture(canvas, e.pointerId);
    haptic(HAPTIC.tap);
    readPill.textContent = `${ROUTES[pick].name}을(를) 작은창자까지 끌어요`;
  };
  const onMove = (e: PointerEvent): void => {
    if (!active) return;
    const tk = byId(active);
    if (tk.done) { active = null; return; }
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) / scale();
    const py = (e.clientY - r.top) / scale();
    const hit = nearestT(DUCT, px, py);
    if (hit.dist > 46) return; // 경로에서 너무 벗어나면 무시
    tk.t = clamp(Math.max(tk.t, hit.t), 0, 1);
    passStation(tk);
    if (tk.t > 0.985 && !tk.done) {
      tk.done = true;
      tk.color = bodyColor(ROUTES[tk.id].colorKey) || tk.color;
      collect(tk.id);
      active = null;
    }
  };
  const onUp = (): void => { active = null; };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // ── 그리기 ────────────────────────────────────────────────
  function drawDuct(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // 관 배경
    ctx.strokeStyle = "rgba(150,170,200,.2)";
    ctx.lineWidth = 26 * scale();
    ctx.beginPath();
    ctx.moveTo(sx(DUCT[0][0]), sy(DUCT[0][1]));
    for (let i = 1; i < DUCT.length; i++) ctx.lineTo(sx(DUCT[i][0]), sy(DUCT[i][1]));
    ctx.stroke();
    // 관 안쪽 점선(이동 방향 힌트)
    ctx.strokeStyle = "rgba(200,220,250,.5)";
    ctx.setLineDash([6 * scale(), 9 * scale()]);
    ctx.lineWidth = 2 * scale();
    ctx.beginPath();
    ctx.moveTo(sx(DUCT[0][0]), sy(DUCT[0][1]));
    for (let i = 1; i < DUCT.length; i++) ctx.lineTo(sx(DUCT[i][0]), sy(DUCT[i][1]));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  function drawStations(ctx: CanvasRenderingContext2D): void {
    for (const st of STATIONS) {
      const [x, y] = pointAt(DUCT, st.t);
      ctx.save();
      const g = ctx.createRadialGradient(sx(x) - 6, sy(y) - 8, 3, sx(x), sy(y), 26 * scale());
      g.addColorStop(0, bodyColor("organHi") || "rgba(255,255,255,.4)");
      g.addColorStop(0.6, bodyColor("organ") || "rgba(220,140,120,.7)");
      g.addColorStop(1, bodyColor("organLo") || "rgba(170,90,80,.8)");
      ctx.fillStyle = g;
      ctx.strokeStyle = bodyColor("organLo") || "rgba(150,70,60,.8)";
      ctx.lineWidth = 1.6 * scale();
      ctx.beginPath();
      ctx.arc(sx(x), sy(y), 24 * scale(), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = `900 ${11 * scale()}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(st.label, sx(x), sy(y));
      ctx.restore();
    }
  }
  function drawTok(ctx: CanvasRenderingContext2D, tk: Tok, dimQueue: boolean): void {
    // 완주 토큰은 하단 트레이의 제 자리로 모아 경로·기관과 겹치지 않게 한다.
    const [px, py] = tk.done ? [TRAY_X[tk.id], TRAY_Y] : tokPos(tk);
    const x = sx(px);
    const y = sy(py);
    const r = 13 * scale();
    ctx.save();
    if (active === tk.id) { ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 12; }
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,.92)");
    g.addColorStop(0.4, tk.color);
    g.addColorStop(1, tk.color);
    ctx.fillStyle = g;
    ctx.globalAlpha = dimQueue ? 0.55 : 1;
    ctx.strokeStyle = "rgba(18,26,44,.55)";
    ctx.lineWidth = 1.5 * scale();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    if (!tk.done && !dimQueue) {
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 1.5 * scale();
      ctx.beginPath();
      ctx.arc(x, y, r + 3 * scale(), 0, Math.PI * 2);
      ctx.stroke();
      // 끌기 유도 화살표(아직 출발 전)
      if (tk.t < 0.02 && active !== tk.id) {
        ctx.strokeStyle = "rgba(226,59,75,.7)";
        ctx.lineWidth = 2.2 * scale();
        ctx.beginPath();
        ctx.moveTo(x + r + 3, y);
        ctx.lineTo(x + r + 13, y);
        ctx.moveTo(x + r + 9, y - 4);
        ctx.lineTo(x + r + 13, y);
        ctx.lineTo(x + r + 9, y + 4);
        ctx.stroke();
      }
    }
    ctx.fillStyle = tk.done ? "rgba(255,236,190,.95)" : "rgba(255,255,255,.9)";
    ctx.font = `800 ${9 * scale()}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // 완주 토큰은 하단 트레이라 라벨을 위로(잘림 방지), 최종 산물명을 보여 준다.
    const labelY = tk.done ? y - r - 8 * scale() : y + r + 9 * scale();
    ctx.fillText(tk.done ? ROUTES[tk.id].product.split("·")[0] : ROUTES[tk.id].name, x, labelY);
    ctx.restore();
  }

  const loop: Loop = createLoop(() => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    ctx.clearRect(0, 0, W, fit.h);
    drawDuct(ctx);
    drawStations(ctx);
    // 완주 산물 트레이(하단) — 완주한 토큰이 하나라도 있으면 배경 띠를 깐다.
    if (toks.some((t) => t.done)) {
      ctx.save();
      ctx.fillStyle = "rgba(150,170,200,.12)";
      (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void })
        .roundRect(sx(28), sy(TRAY_Y - 20), sx(304), sy(40), 14 * scale());
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.font = `800 ${9 * scale()}px Pretendard, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("최종 산물", sx(34), sy(TRAY_Y - 27));
      ctx.restore();
    }
    // 완주 토큰 → 대기 토큰 → 활성 토큰 순으로 그려 활성이 맨 위.
    for (const tk of toks) if (tk.done) drawTok(ctx, tk, false);
    for (const tk of toks) if (!tk.done && active !== tk.id) drawTok(ctx, tk, active !== null);
    if (active) drawTok(ctx, byId(active), false);
  });

  const onResize = (): void => { fitCanvas(canvas, CVH); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("세 영양소의 여정을 완주해 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
  };
};
