// lightSee — 물체를 보는 과정 랩(중2 III L3, 책 102~103쪽).
//   밤 캠핑 장면: 랜턴(광원)·텐트·연못 물고기·사람 눈.
//   빛의 경로를 "출발점부터" 순서대로 탭해 조립한다 — 눈부터 탭하면 오개념 교정.
//   미션: ① 랜턴(광원 직접) ② 텐트(반사) ③ 물고기(반사+수면 굴절 — 굴절점은 스넬로 정확히 풂)
//         ④ 작살 실전(보이는 위치 vs 실제 위치 — 첫 시도를 채점).
//   경로가 완성된 물체만 밝아진다 — "보인다 = 빛이 눈에 들어온다"를 그대로 렌더링.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawBeam, eyeProp, TAU, type Pt } from "../../ui/lightKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const WARM = "255,214,130"; // 랜턴 빛
const N_WATER = 1.33;

export const seeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:350px" });
  const toast = el("div", { class: "toast" });
  const stage = el("div", { class: "stage" }, canvas, toast);

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    el("div", { class: "pn-badge", dataset: { g: "m0" } }, el("b", { text: "랜턴" }), el("span", { text: "광원 직접" })),
    el("div", { class: "pn-badge", dataset: { g: "m1" } }, el("b", { text: "텐트" }), el("span", { text: "반사" })),
    el("div", { class: "pn-badge", dataset: { g: "m2" } }, el("b", { text: "물고기" }), el("span", { text: "굴절" })),
    el("div", { class: "pn-badge", dataset: { g: "m3" } }, el("b", { text: "작살" }), el("span", { text: "실전!" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "캄캄한 밤, 랜턴 하나만 켜져 있어요. 첫 미션 — 우리는 <b>랜턴</b>을 어떻게 볼까요? 빛의 경로를 <b>출발점부터</b> 순서대로 탭!",
  });
  host.append(goalChips, helper, stage); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 장면 좌표(프레임마다 W,H 기준 갱신) ----
  let W = 340;
  let H = 350;
  const groundY = (): number => H - 58;
  const pondY = (): number => H - 52; // 연못 수면
  const L = { x: 0, y: 0 }; // 랜턴 램프
  const E = { x: 0, y: 0 }; // 눈
  const T = { x: 0, y: 0 }; // 텐트(꼭짓점 아래 몸통 중심)
  const F = { x: 0, y: 0 }; // 물고기(실제)
  const pondX0 = (): number => W * 0.04;
  const pondX1 = (): number => W * 0.46;
  function layout(): void {
    L.x = W * 0.13;
    L.y = 86;
    E.x = W * 0.6;
    E.y = H - 168;
    T.x = W * 0.86;
    T.y = groundY() - 34;
    F.x = W * 0.24;
    F.y = H - 22;
  }

  // ---- 스넬 굴절점(이분법) — 물속 A → 수면 → 공기 B ----
  function surfaceCross(inWater: Pt, inAir: Pt): Pt {
    const ys = pondY();
    let lo = Math.min(inWater.x, inAir.x) + 2;
    let hi = Math.max(inWater.x, inAir.x) - 2;
    // f(x) = sin(공기쪽) − n·sin(물쪽). 물쪽 각이 커질수록 f 감소 → 부호로 이분.
    const f = (x: number): number => {
      const sw = Math.abs(x - inWater.x) / Math.max(1, Math.hypot(x - inWater.x, ys - inWater.y));
      const sa = Math.abs(inAir.x - x) / Math.max(1, Math.hypot(inAir.x - x, inAir.y - ys));
      return sa - N_WATER * sw;
    };
    // 물속 점 바로 위(x=inWater.x)에서 f>0이 보장 — 그쪽을 lo로
    if (inWater.x > inAir.x) {
      const t = lo;
      lo = hi;
      hi = t;
    }
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2;
      if (f(mid) > 0) lo = mid;
      else hi = mid;
    }
    const x = clamp((lo + hi) / 2, pondX0() + 4, pondX1() - 4);
    return { x, y: ys };
  }

  // ---- 상태 ----
  type NodeKey = "lantern" | "tent" | "fish" | "eye";
  const MISSIONS: NodeKey[][] = [
    ["lantern", "eye"],
    ["lantern", "tent", "eye"],
    ["lantern", "fish", "eye"],
  ];
  let mission = 0; // 0..2 경로 조립, 3 = 작살, 4 = 완료
  let tapped: NodeKey[] = [];
  const litPaths: Pt[][] = []; // 완성된 경로(잔광)
  let animPath: Pt[] | null = null;
  let animT = 0;
  let ghost: Pt | null = null; // 물고기 겉보기 위치
  let spear: { x1: number; y1: number; t: number; hit: boolean; settled?: boolean } | null = null;
  let spearTried = false;
  let finished = false;
  let toastTimer = 0;

  function showToast(msg: string): void {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2000);
  }

  function chipOn(idx: number, subText: string): void {
    const chip = goalChips.querySelector(`[data-g="m${idx}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
  }

  /** 미션 경로 완성 → 실제 그릴 폴리라인(굴절 꺾임 포함) */
  function buildPath(m: number): Pt[] {
    if (m === 0) return [{ ...L }, { ...E }];
    if (m === 1) return [{ ...L }, { ...T }, { ...E }];
    const p1 = surfaceCross(F, L); // 랜턴 빛이 물로 들어가는 점
    const q = surfaceCross(F, E); // 물고기 빛이 물을 나서는 점
    return [{ ...L }, p1, { ...F }, q, { ...E }];
  }

  function nodePos(k: NodeKey): Pt {
    if (k === "lantern") return L;
    if (k === "tent") return T;
    if (k === "fish") return F;
    return E;
  }

  function missionDone(): void {
    const m = mission;
    const path = buildPath(m);
    litPaths.push(path);
    animPath = path;
    animT = 0;
    tapped = [];
    haptic(HAPTIC.correct);
    if (m === 0) {
      chipOn(0, "빛이 눈으로!");
      helper.innerHTML =
        "<b>광원</b>(랜턴)은 스스로 낸 빛이 눈에 <b>바로</b> 들어와서 보여요. 다음 — 스스로 빛을 못 내는 <b>텐트</b>는 어떻게 보일까요? 경로를 탭!";
    } else if (m === 1) {
      chipOn(1, "반사 → 눈!");
      helper.innerHTML =
        "랜턴 빛이 텐트에서 <b>반사</b>한 뒤 눈으로 들어와요 — 텐트가 밝아졌죠? 이번엔 <b>연못 속 물고기</b>! 경로를 탭해 봐요.";
    } else if (m === 2) {
      chipOn(2, "굴절 → 눈!");
      ghost = computeGhost();
      mission = 3;
      helper.innerHTML =
        "물고기의 빛은 수면에서 <b>굴절</b>하며 꺾여 눈에 들어와요. 그래서 물고기는 <b>실제와 다른 곳</b>에 보이죠! 이제 실전 — <b>작살로 물고기를 잡아 보세요.</b> 밝게 보이는 곳? 아니면…?";
      showToast("물 밖에서는 밝은 쪽이 '보이는 위치'예요");
      return;
    }
    mission = m + 1;
  }

  /** 겉보기 위치 — 눈→굴절점 시선을 물속으로 연장(더 얕게 떠 보임) */
  function computeGhost(): Pt {
    const q = surfaceCross(F, E);
    const dir = { x: q.x - E.x, y: q.y - E.y };
    const n = Math.hypot(dir.x, dir.y) || 1;
    dir.x /= n;
    dir.y /= n;
    const depth = (F.y - q.y) * 0.62; // 시선 연장선 위, 실제보다 얕은 지점
    const t = depth / Math.max(0.2, dir.y);
    return { x: q.x + dir.x * t, y: q.y + depth };
  }

  function wrongTap(k: NodeKey, expected: NodeKey): void {
    haptic(HAPTIC.wrong);
    if (k === "eye" && tapped.length === 0) {
      helper.innerHTML =
        "앗 — <b>눈에서 빛이 나가는 게 아니에요!</b> 옛날 사람들도 그렇게 생각했지만, 빛은 언제나 <b>광원에서 출발</b>해요. <b>랜턴</b>부터 탭!";
      showToast("빛의 출발점은 광원!");
    } else {
      const name = expected === "lantern" ? "랜턴" : expected === "tent" ? "텐트" : expected === "fish" ? "물고기" : "눈";
      helper.innerHTML = `지금 경로의 다음 차례는 <b>${name}</b>이에요. 빛이 지나가는 순서를 떠올려 봐요!`;
    }
  }

  // ---- 탭 ----
  canvas.addEventListener("pointerdown", (e) => {
    if (finished) return;
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;

    if (mission === 3) {
      // 작살 — 보이는 위치(유령) vs 실제 위치
      if (!ghost) return;
      const dGhost = Math.hypot(px - ghost.x, py - ghost.y);
      const dReal = Math.hypot(px - F.x, py - F.y);
      if (Math.min(dGhost, dReal) > 34) return;
      const aimReal = dReal < dGhost;
      const target = aimReal ? F : ghost;
      spear = { x1: target.x, y1: target.y, t: 0, hit: aimReal };
      haptic(HAPTIC.select);
      if (!spearTried) {
        spearTried = true;
        api.recordQuiz(aimReal);
      }
      return;
    }
    if (mission > 2) return;

    const seq = MISSIONS[mission];
    const expected = seq[tapped.length];
    let picked: NodeKey | null = null;
    let best = 36;
    (["lantern", "tent", "fish", "eye"] as NodeKey[]).forEach((k) => {
      const p = nodePos(k);
      const d = Math.hypot(px - p.x, py - p.y);
      if (d < best) {
        best = d;
        picked = k;
      }
    });
    if (!picked) return;
    if (picked === expected) {
      tapped.push(picked);
      haptic(HAPTIC.select);
      if (tapped.length === seq.length) missionDone();
      else {
        const nextName = seq[tapped.length] === "eye" ? "눈" : seq[tapped.length] === "tent" ? "텐트" : "물고기";
        helper.innerHTML = `좋아요! 다음은 <b>${nextName}</b> 차례예요.`;
      }
    } else {
      wrongTap(picked, expected);
    }
  });

  // ---- 그리기 도우미 ----
  function drawTent(ctx: CanvasRenderingContext2D, lit: number): void {
    const bx = T.x;
    const by = groundY();
    ctx.save();
    ctx.globalAlpha = 0.42 + lit * 0.58;
    // 접촉 그림자
    ctx.fillStyle = "rgba(3,9,20,.5)";
    ctx.beginPath();
    ctx.ellipse(bx, by + 4, 44, 7, 0, 0, TAU);
    ctx.fill();
    // 몸체(근-동조 3스톱)
    const g = ctx.createLinearGradient(bx - 40, by - 66, bx + 40, by);
    g.addColorStop(0, "#F0A45C");
    g.addColorStop(0.55, "#D97E3A");
    g.addColorStop(1, "#A9581F");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(bx, by - 66);
    ctx.lineTo(bx + 44, by);
    ctx.lineTo(bx - 44, by);
    ctx.closePath();
    ctx.fill();
    // 입구 + 키라이트 + 외곽
    ctx.fillStyle = "rgba(46,26,12,.85)";
    ctx.beginPath();
    ctx.moveTo(bx, by - 34);
    ctx.lineTo(bx + 14, by);
    ctx.lineTo(bx - 14, by);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,230,190,.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx - 4, by - 60);
    ctx.lineTo(bx - 30, by - 8);
    ctx.stroke();
    ctx.strokeStyle = "#6E3812";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx, by - 66);
    ctx.lineTo(bx + 44, by);
    ctx.lineTo(bx - 44, by);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function drawFishShape(ctx: CanvasRenderingContext2D, p: Pt, alpha: number, ghostStyle = false): void {
    ctx.save();
    ctx.globalAlpha = alpha;
    if (ghostStyle) ctx.setLineDash([4, 4]);
    const g = ctx.createLinearGradient(p.x - 16, p.y - 8, p.x + 16, p.y + 8);
    g.addColorStop(0, "#8FE0F0");
    g.addColorStop(0.55, "#4FB8D8");
    g.addColorStop(1, "#2E88AC");
    ctx.fillStyle = ghostStyle ? "rgba(150,220,240,.35)" : g;
    // 몸통 + 꼬리
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 15, 8.5, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p.x + 13, p.y);
    ctx.lineTo(p.x + 22, p.y - 7);
    ctx.lineTo(p.x + 22, p.y + 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = ghostStyle ? "rgba(190,235,250,.75)" : "#1D6A8C";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 15, 8.5, 0, 0, TAU);
    ctx.stroke();
    if (!ghostStyle) {
      ctx.fillStyle = "#0E2A3C";
      ctx.beginPath();
      ctx.arc(p.x - 8, p.y - 2, 1.8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.75)";
      ctx.beginPath();
      ctx.ellipse(p.x - 3, p.y - 4.5, 5, 2.2, -0.3, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawNode(ctx: CanvasRenderingContext2D, p: Pt, label: string, tMs: number, active: boolean, done: boolean): void {
    const pr = 15 + Math.sin(tMs / 320 + p.x) * (active ? 2.6 : 1.2);
    ctx.strokeStyle = done ? "rgba(126,214,255,.85)" : active ? "rgba(255,214,120,.85)" : "rgba(214,228,248,.35)";
    ctx.lineWidth = done ? 2.4 : 1.8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, done ? 14 : pr, 0, TAU);
    ctx.stroke();
    ctx.font = "800 11px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 3.4;
    ctx.strokeStyle = "rgba(7,14,26,.9)";
    ctx.strokeText(label, p.x, p.y - 22);
    ctx.fillStyle = "rgba(226,238,252,.95)";
    ctx.fillText(label, p.x, p.y - 22);
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 350);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    layout();
    const gy = groundY();

    // 밤하늘 별
    for (let i = 0; i < 16; i++) {
      const sx = (i * 71 + 13) % W;
      const sy = 12 + ((i * 37) % 90);
      const tw = 0.35 + 0.3 * Math.sin(tMs / 700 + i * 2.1);
      ctx.fillStyle = `rgba(214,228,252,${tw})`;
      ctx.fillRect(sx, sy, 1.6, 1.6);
    }

    // 땅
    const gg = ctx.createLinearGradient(0, gy, 0, H);
    gg.addColorStop(0, "#1C2C42");
    gg.addColorStop(1, "#0D1626");
    ctx.fillStyle = gg;
    ctx.fillRect(0, gy, W, H - gy);
    ctx.strokeStyle = "rgba(120,150,190,.3)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(W, gy);
    ctx.stroke();

    // 연못(땅에 파인 물) + 물고기
    const px0 = pondX0();
    const px1 = pondX1();
    const py = pondY();
    const pw = ctx.createLinearGradient(0, py, 0, H);
    pw.addColorStop(0, "rgba(96,156,232,.34)");
    pw.addColorStop(1, "rgba(60,110,190,.16)");
    ctx.fillStyle = pw;
    ctx.beginPath();
    ctx.moveTo(px0, py);
    ctx.lineTo(px1, py);
    ctx.quadraticCurveTo(px1 + 10, H - 8, px1 - 26, H - 4);
    ctx.lineTo(px0 + 20, H - 4);
    ctx.quadraticCurveTo(px0 - 10, H - 10, px0, py);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(196,224,255,.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px0, py);
    ctx.lineTo(px1, py);
    ctx.stroke();
    // 잔물결
    ctx.strokeStyle = "rgba(196,224,255,.22)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 2; i++) {
      const wy = py + 10 + i * 12 + Math.sin(tMs / 600 + i) * 1.5;
      ctx.beginPath();
      ctx.moveTo(px0 + 16, wy);
      ctx.quadraticCurveTo((px0 + px1) / 2, wy + 3, px1 - 16, wy);
      ctx.stroke();
    }

    // 랜턴(폴 + 램프 + 글로우)
    ctx.strokeStyle = "#4A5B76";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(L.x, gy);
    ctx.lineTo(L.x, L.y - 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(233,242,255,.4)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(L.x - 1.2, gy - 6);
    ctx.lineTo(L.x - 1.2, L.y + 8);
    ctx.stroke();
    const halo = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, 64);
    halo.addColorStop(0, "rgba(255,214,130,.5)");
    halo.addColorStop(0.4, "rgba(255,214,130,.16)");
    halo.addColorStop(1, "rgba(255,214,130,0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(L.x, L.y, 64, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    const lampG = ctx.createLinearGradient(L.x - 9, L.y - 12, L.x + 9, L.y + 12);
    lampG.addColorStop(0, "#FFF2CE");
    lampG.addColorStop(0.5, "#FFD98A");
    lampG.addColorStop(1, "#E8A63E");
    ctx.fillStyle = lampG;
    ctx.beginPath();
    ctx.roundRect(L.x - 9, L.y - 12, 18, 24, 5);
    ctx.fill();
    ctx.strokeStyle = "#8A5F1E";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(L.x - 9, L.y - 12, 18, 24, 5);
    ctx.stroke();
    ctx.fillStyle = "#4A5B76";
    ctx.beginPath();
    ctx.roundRect(L.x - 5, L.y - 17, 10, 5, 2);
    ctx.fill();

    // 텐트(경로 완성 시 밝아짐)
    drawTent(ctx, litPaths.length >= 2 ? 1 : 0);

    // 사람(스틱맨 — 손그림 라인 정체성 유지, 다크 무대용 밝은 선)
    const bodyTop = E.y + 14;
    ctx.strokeStyle = "#E8EEF6";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(E.x + 4, E.y, 13, 0, TAU); // 머리
    ctx.moveTo(E.x + 4, bodyTop);
    ctx.lineTo(E.x + 4, bodyTop + 34); // 몸
    ctx.moveTo(E.x + 4, bodyTop + 10);
    ctx.lineTo(E.x - 12, bodyTop + 24); // 왼팔(연못 쪽)
    ctx.moveTo(E.x + 4, bodyTop + 10);
    ctx.lineTo(E.x + 20, bodyTop + 26); // 오른팔
    ctx.moveTo(E.x + 4, bodyTop + 34);
    ctx.lineTo(E.x - 8, gy); // 왼다리
    ctx.moveTo(E.x + 4, bodyTop + 34);
    ctx.lineTo(E.x + 16, gy); // 오른다리
    ctx.stroke();
    // 눈(왼쪽을 바라봄) — 탭 노드
    eyeProp(ctx, E.x - 4, E.y - 2, Math.PI, 8.5);

    // 물고기 — 실제(어둡다가 M3 완성 시 밝아짐; 작살 단계에선 다시 어둡게 "안 보이는 실제")
    const fishLit = mission === 3 ? 0.16 : litPaths.length >= 3 ? 1 : 0.3;
    drawFishShape(ctx, F, fishLit);
    // 겉보기 물고기(작살 단계)
    if (ghost && mission >= 3) {
      drawFishShape(ctx, ghost, mission === 3 ? 0.95 : 0.4, true);
      ctx.font = "800 10.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(190,230,250,.9)";
      ctx.fillText(mission === 3 ? "보이는 위치" : "겉보기 위치", ghost.x, ghost.y - 16);
    }

    // 완성된 경로(잔광) + 진행 중 애니메이션
    litPaths.forEach((path, i) => {
      const isAnim = animPath === path;
      if (isAnim) {
        animT = Math.min(1, animT + dt * 0.028);
        // 부분 경로 그리기
        let total = 0;
        for (let k = 1; k < path.length; k++) total += Math.hypot(path[k].x - path[k - 1].x, path[k].y - path[k - 1].y);
        const upto = total * animT;
        const partial: Pt[] = [path[0]];
        let acc = 0;
        for (let k = 1; k < path.length; k++) {
          const seg = Math.hypot(path[k].x - path[k - 1].x, path[k].y - path[k - 1].y);
          if (acc + seg <= upto) {
            partial.push(path[k]);
            acc += seg;
          } else {
            const t = (upto - acc) / seg;
            partial.push({ x: path[k - 1].x + (path[k].x - path[k - 1].x) * t, y: path[k - 1].y + (path[k].y - path[k - 1].y) * t });
            break;
          }
        }
        drawBeam(ctx, partial, { rgb: WARM, width: 2.8, flow: (tMs / 800) % 1, arrow: animT > 0.97, arrowAt: 0.9 });
        if (animT >= 1) animPath = null;
      } else {
        const latest = i === litPaths.length - 1 && !animPath;
        drawBeam(ctx, path, {
          rgb: WARM,
          width: latest ? 2.6 : 1.8,
          alpha: latest ? 0.85 : 0.35,
          flow: latest ? (tMs / 800) % 1 : undefined,
          glow: latest,
        });
      }
    });

    // 굴절 꺾임 표시(M3 경로가 있으면 수면 교차점에 마커)
    if (litPaths.length >= 3) {
      const p3 = litPaths[2];
      [p3[1], p3[3]].forEach((q) => {
        ctx.strokeStyle = "rgba(126,214,255,.8)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 5.5, 0, TAU);
        ctx.stroke();
      });
    }

    // 작살
    if (spear) {
      spear.t = Math.min(1, spear.t + dt * 0.05);
      const sx = E.x - 12;
      const sy = E.y + 38;
      const tx = sx + (spear.x1 - sx) * spear.t;
      const ty = sy + (spear.y1 - sy) * spear.t;
      ctx.strokeStyle = "#D8C29A";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sx + (tx - sx) * 0.4, sy + (ty - sy) * 0.4);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.fillStyle = "#EDE2CC";
      const sa = Math.atan2(ty - sy, tx - sx);
      ctx.beginPath();
      ctx.moveTo(tx + Math.cos(sa) * 8, ty + Math.sin(sa) * 8);
      ctx.lineTo(tx + Math.cos(sa + 2.6) * 6, ty + Math.sin(sa + 2.6) * 6);
      ctx.lineTo(tx + Math.cos(sa - 2.6) * 6, ty + Math.sin(sa - 2.6) * 6);
      ctx.closePath();
      ctx.fill();
      if (spear.t >= 1) {
        if (!spear.hit) {
          // 빗나감 — 물보라 링
          ctx.strokeStyle = "rgba(196,230,255,.7)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(spear.x1, spear.y1, 12 + Math.sin(tMs / 90) * 2, 0, TAU);
          ctx.stroke();
        }
        if (!spear.settled) {
          spear.settled = true;
          if (spear.hit && !finished) {
            finished = true;
            mission = 4;
            chipOn(3, "명중!");
            showToast("명중! 굴절까지 계산했네요");
            helper.innerHTML =
              "명중! 물고기는 <b>보이는 곳보다 더 깊고 먼 곳</b>에 있었어요. 정리 — 광원은 <b>직접</b>, 물체는 <b>반사된 빛</b>, 물속 물체는 <b>굴절된 빛</b>이 눈에 들어와 보여요.";
            window.setTimeout(() => api.enableCTA(s.cta ?? "개념 정리하기"), 500);
          } else if (!spear.hit) {
            haptic(HAPTIC.wrong);
            helper.innerHTML =
              "텅 — 거기엔 물고기가 <b>없어요</b>! 밝게 보이는 건 굴절이 만든 <b>겉보기 위치</b>예요. 실제 물고기는 <b>더 깊고 왼쪽</b> — 다시 겨냥!";
            window.setTimeout(() => {
              if (!finished) spear = null;
            }, 900);
          }
        }
      }
    }

    // 탭 노드(현재 미션 후보 강조)
    if (mission <= 2) {
      const seq = MISSIONS[mission];
      const expected = seq[tapped.length];
      drawNode(ctx, L, "랜턴", tMs, expected === "lantern", tapped.includes("lantern"));
      drawNode(ctx, T, "텐트", tMs, expected === "tent", tapped.includes("tent"));
      drawNode(ctx, F, "물고기", tMs, expected === "fish", tapped.includes("fish"));
      drawNode(ctx, { x: E.x - 4, y: E.y - 2 }, "눈", tMs, expected === "eye", tapped.includes("eye"));
    }
  });

  api.setCTA("빛의 경로를 완성해요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(toastTimer);
  };
};
