// finchIslandLab — 중1 Ⅱ L7의 기함. "변이 → 환경 적응 → 새로운 종"을 **무리 구성의 변화**로 체험시킨다.
//
// ── 2026-07-26 전면 단순화(실사용 피드백: 초판이 너무 어려웠다) ─────────────────────────
// 초판은 부리 굵기를 1~9 연속값으로 두고 8칸 히스토그램이 6세대에 걸쳐 이동하는 형태였다.
// 중1이 읽기엔 분포·평균 개념이 앞서고, 무엇이 변한 건지 한눈에 안 잡혔다.
// 구작 finchSim의 문법(부리를 **세 종류로 딱 나눔**)을 가져와 다음으로 바꿨다:
//   · 부리 3종(굵고 짧은 / 중간 / 가늘고 긴) — 연속값·평균·히스토그램 전부 제거
//   · 분포는 **마리 수 점(●)** 으로만 표기 — 세면 바로 안다
//   · 세대는 6 → **3**, 매 세대 "누가 먹었고 누가 못 먹었나"를 문장으로 못 박는다
//
// ── 과학 정확성 가드(위반 금지) ─────────────────────────────────────────────
// 개체의 부리 종류는 태어날 때 정해지고 평생 바뀌지 않는다(`Bird.kind`가 readonly — 재대입 불가).
// 세대를 지나며 변하는 것은 **무리의 구성비**뿐이다. "많이 써서 부리가 굵어졌다"는 라마르크식
// 오개념이라, 코드 구조와 문구 양쪽에서 막는다.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface FinchStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "vary" | "gens" | "species";
type Phase = "vary" | "predict" | "gens" | "meet" | "done";
type Kind = "thick" | "mid" | "thin";

const CVH = 316;
const BASE_W = 360;
const GENS_TARGET = 3;
const FLOCK = 6; // 섬마다 유지되는 마리 수

const SEED_COLOR = "#F08C00"; // 섬 (가) — 크고 단단한 씨앗
const BUG_COLOR = "#2F80ED";  // 섬 (나) — 나무 속 작은 곤충
const BODY = "#E8F0FB";

const KINDS: Kind[] = ["thick", "mid", "thin"];
const KIND_NAME: Record<Kind, string> = {
  thick: "굵고 짧은 부리",
  mid: "중간 부리",
  thin: "가늘고 긴 부리",
};
/** 부리 그리기 파라미터 — 길이·두께가 이름 그대로 보이게 한다. */
const KIND_BEAK: Record<Kind, { len: number; th: number; color: string }> = {
  thick: { len: 7.5, th: 6.4, color: SEED_COLOR },
  mid: { len: 9.5, th: 4.0, color: "#9AA7B8" },
  thin: { len: 13, th: 2.2, color: BUG_COLOR },
};

interface Bird {
  /** 태어날 때 정해지는 부리 종류 — 평생 바뀌지 않는다(라마르크 오개념 가드). */
  readonly kind: Kind;
  x: number; y: number; tx: number; ty: number;
  seen: boolean;
  bob: number;
}

export const finchIslandLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as FinchStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge bio", dataset: { g: "vary" } }, el("b", { text: "변이 확인" }), el("span", { text: "0 / 3" })),
    el("div", { class: "pn-badge bio", dataset: { g: "gens" } }, el("b", { text: "세대 지나기" }), el("span", { text: `0 / ${GENS_TARGET}` })),
    el("div", { class: "pn-badge bio", dataset: { g: "species" } }, el("b", { text: "새로운 종" }), el("span", { text: "다시 만나기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "육지에 한 종류의 핀치 무리가 살아요. <b>새를 탭해</b> 부리를 살펴보세요. 부리가 <b>세 가지</b>나 있어요.",
  });
  const canvas = el("canvas", {
    class: "fil-canvas",
    style: `height:${CVH}px`,
    attrs: { tabindex: "0", role: "img", "aria-label": "핀치 무리와 두 섬, 부리 종류별 마리 수가 보이는 무대" },
  });
  const readPill = el("span", { text: "새를 탭해 부리를 살펴보세요" });
  const toast = el("div", { class: "toast low" });
  const stage = el(
    "div", { class: "stage fil-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#12B886" }), readPill)),
    toast,
  );
  const controls = el("div", { class: "fil-controls" });
  host.append(goalsEl, helper, stage, controls);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let W = BASE_W;
  const scale = (): number => W / BASE_W;
  const sc = (v: number): number => v * scale();
  const goals = new Set<Goal>();
  let phase: Phase = "vary";
  let gen = 0;
  let toastTimer = 0;
  let finished = false;
  let meetT = 0;
  /** 이번 세대에 먹이를 얻지 못해 사라지는 중인 새들(연출용 페이드). */
  let fading: { kind: Kind; x: number; y: number; t: number }[] = [];

  const seen = new Set<Kind>();
  const mainland: Bird[] = [];
  let islandA: Bird[] = [];
  let islandB: Bird[] = [];

  let bobSeed = 0;
  const makeBird = (kind: Kind, x: number, y: number): Bird => {
    bobSeed = (bobSeed + 1.7) % 6.283;
    return { kind, x, y, tx: x, ty: y, seen: false, bob: bobSeed };
  };

  // 육지 무리 12마리 = 세 종류 4마리씩. "같은 종류인데 부리가 다르다"가 곧 변이다.
  const LAND = { x: 34, y: 74, w: 292, h: 96 };
  const START: Kind[] = ["thick", "mid", "thin", "thick", "mid", "thin", "thick", "mid", "thin", "thick", "mid", "thin"];
  START.forEach((k, i) => {
    const b = makeBird(k, LAND.x + 24, LAND.y + 40);
    const col = i % 6;
    const row = Math.floor(i / 6);
    b.tx = LAND.x + ((col + 0.5) / 6) * LAND.w;
    b.ty = LAND.y + ((row + 0.6) / 2) * LAND.h;
    b.x = b.tx; b.y = b.ty;
    mainland.push(b);
  });

  const toastMsg = (msg: string): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
  };
  const collect = (id: Goal): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    haptic(HAPTIC.ctaUnlock);
  };
  const countOf = (list: Bird[], k: Kind): number => list.filter((b) => b.kind === k).length;

  // ── 컨트롤 ────────────────────────────────────────────────────────────
  const btn = (label: string, act: string, onClick: () => void): HTMLButtonElement => {
    const b = el("button", { class: "btn fil-btn primary", attrs: { type: "button" }, dataset: { filAct: act }, text: label });
    b.addEventListener("click", onClick);
    return b;
  };
  const renderControls = (): void => {
    controls.replaceChildren();
    if (phase === "vary") {
      const go = btn("두 섬으로 날아가기", "split", startSplit);
      go.disabled = !goals.has("vary");
      controls.appendChild(go);
    } else if (phase === "gens") {
      controls.appendChild(btn(`한 세대 지나기  (${gen} / ${GENS_TARGET})`, "gen", stepGeneration));
    } else if (phase === "meet") {
      controls.appendChild(btn("두 무리를 다시 만나게 하기", "meet", startMeet));
    }
  };

  // ── 국면 1: 부리 살펴보기 ─────────────────────────────────────────────
  const onTap = (e: PointerEvent): void => {
    if (phase !== "vary") return;
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) / scale();
    const py = (e.clientY - r.top) / scale();
    let best: Bird | null = null;
    let bestD = 22;
    for (const b of mainland) {
      const d = Math.hypot(px - b.x, py - b.y);
      if (d < bestD) { bestD = d; best = b; }
    }
    if (!best) return;
    best.seen = true;
    const k = best.kind;
    haptic(HAPTIC.tap);
    readPill.textContent = KIND_NAME[k];
    if (!seen.has(k)) {
      seen.add(k);
      const chip = goalsEl.querySelector('[data-g="vary"] span') as HTMLElement;
      chip.textContent = `${seen.size} / 3`;
      toastMsg(`${KIND_NAME[k]}를 찾았어요`);
    }
    if (seen.size === 3 && !goals.has("vary")) {
      collect("vary");
      helper.innerHTML = "같은 종류인데 부리가 세 가지나 됐어요. 이렇게 <b>같은 종류의 생물 사이에 나타나는 차이</b>를 변이라고 해요. 이제 무리를 두 섬으로 보내 볼까요?";
      renderControls();
    }
  };
  canvas.addEventListener("pointerdown", onTap);

  // ── 국면 2: 이주 + 예측 ───────────────────────────────────────────────
  const A_BOX = { x: 18, y: 70, w: 150, h: 92 };
  const B_BOX = { x: 192, y: 70, w: 150, h: 92 };
  const place = (list: Bird[], box: { x: number; y: number; w: number; h: number }): void => {
    list.forEach((b, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      b.tx = box.x + ((col + 0.5) / 3) * box.w;
      b.ty = box.y + ((row + 0.6) / 2) * box.h;
    });
  };

  function startSplit(): void {
    phase = "predict";
    // 부리 종류와 무관하게 우연히 갈라진다 — 선택은 섬에서 일어난다.
    islandA = [makeBird("thick", 0, 0), makeBird("thick", 0, 0), makeBird("mid", 0, 0), makeBird("mid", 0, 0), makeBird("thin", 0, 0), makeBird("thin", 0, 0)];
    islandB = [makeBird("thick", 0, 0), makeBird("thick", 0, 0), makeBird("mid", 0, 0), makeBird("mid", 0, 0), makeBird("thin", 0, 0), makeBird("thin", 0, 0)];
    for (const b of islandA.concat(islandB)) { b.x = 180; b.y = 120; }
    place(islandA, A_BOX);
    place(islandB, B_BOX);
    readPill.textContent = "섬 (가) = 단단한 씨앗 · 섬 (나) = 작은 곤충";
    helper.innerHTML = "무리가 우연히 두 섬으로 갈라졌어요. 두 섬 모두 <b>세 종류가 두 마리씩</b> 똑같이 출발해요. 섬 (가)에는 <b>크고 단단한 씨앗</b>이, 섬 (나)에는 <b>나무 속 작은 곤충</b>이 먹이예요.";
    renderControls();
    window.setTimeout(askPrediction, 1000);
  }

  function askPrediction(): void {
    const q = el("div", { class: "hook-q", html: "<b>섬 (가)</b>에서는 어떤 부리를 가진 새가 더 많이 살아남을까요?" });
    const wrap = el("div", { class: "hook-choices show" });
    const choices = [
      { t: "굵고 짧은 부리", ok: true },
      { t: "가늘고 긴 부리", ok: false },
      { t: "부리 모양은 상관없어요", ok: false },
    ];
    let answered = false;
    for (const idx of [0, 1, 2].sort(() => (bobSeed = (bobSeed * 7 + 3) % 11) - 5)) {
      const c = choices[idx];
      const b = el("button", { class: "hook-choice", attrs: { type: "button" }, dataset: { filOk: String(c.ok) }, text: c.t });
      b.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        haptic(HAPTIC.select);
        for (const other of Array.from(wrap.children) as HTMLElement[]) {
          other.classList.add("dim");
          if (other.dataset.filOk === "true") other.classList.add("reveal");
        }
        b.classList.remove("dim");
        b.classList.add(c.ok ? "reveal" : "miss");
        helper.innerHTML = "예측을 골랐어요. 정말 그런지 <b>한 세대씩 지나며</b> 직접 확인해요.";
        phase = "gens";
        renderControls();
        window.setTimeout(() => { q.remove(); wrap.remove(); }, 1100);
      });
      wrap.appendChild(b);
    }
    controls.replaceChildren(q, wrap);
    window.setTimeout(() => wrap.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  // ── 국면 3: 한 세대 지나기 ────────────────────────────────────────────
  /** 섬 (가)(씨앗)는 굵은 부리, 섬 (나)(곤충)는 가는 부리가 먹이를 얻는다. 중간 부리는 절반만 성공. */
  const eats = (k: Kind, seedIsland: boolean): "ok" | "half" | "no" => {
    const good: Kind = seedIsland ? "thick" : "thin";
    if (k === good) return "ok";
    if (k === "mid") return "half";
    return "no";
  };

  function nextGen(list: Bird[], seedIsland: boolean, box: { x: number; y: number; w: number; h: number }): Bird[] {
    // 중간 부리는 "절반만" 살아남는다 — 남은 수의 절반을 **내림**으로 잡아야 세대를 거듭할수록
    // 실제로 사라진다(토글로 한 마리를 늘 살리면 5:1에서 영영 멈춰, 마지막 문구가 거짓이 된다).
    const midQuota = Math.floor(list.filter((b) => b.kind === "mid").length / 2);
    let midLeft = midQuota;
    const survivors: Bird[] = [];
    for (const b of list) {
      const r = eats(b.kind, seedIsland);
      if (r === "ok") survivors.push(b);
      else if (r === "half" && midLeft > 0) { survivors.push(b); midLeft -= 1; }
      else fading.push({ kind: b.kind, x: b.x, y: b.y, t: 1 });
    }
    // 살아남은 개체가 자손을 남겨 다시 6마리 — 자손의 부리는 부모와 같은 종류다.
    // 배분은 **생존자 구성비에 비례**(최대잔여법)해야 한다. 생존자 배열을 순서대로 순환시키면
    // 배열 앞에 놓인 종류가 계속 자리를 차지해 한쪽 섬이 4:2에서 진동한다(실측 버그).
    if (!survivors.length) survivors.push(list[0]);
    const survCount: Record<Kind, number> = { thick: 0, mid: 0, thin: 0 };
    for (const b of survivors) survCount[b.kind] += 1;
    const total = survivors.length;
    const quota: { k: Kind; whole: number; rem: number }[] = KINDS.map((k) => {
      const exact = (survCount[k] / total) * FLOCK;
      return { k, whole: Math.floor(exact), rem: exact - Math.floor(exact) };
    });
    let assigned = quota.reduce((sum, q) => sum + q.whole, 0);
    for (const q of [...quota].sort((a, b) => b.rem - a.rem)) {
      if (assigned >= FLOCK) break;
      q.whole += 1;
      assigned += 1;
    }
    const next: Bird[] = [];
    for (const q of quota) {
      const anchor = survivors.find((b) => b.kind === q.k) ?? survivors[0];
      for (let i = 0; i < q.whole; i++) next.push(makeBird(q.k, anchor.x, anchor.y));
    }
    place(next, box);
    return next;
  }

  function stepGeneration(): void {
    if (phase !== "gens") return;
    gen += 1;
    fading = [];
    islandA = nextGen(islandA, true, A_BOX);
    islandB = nextGen(islandB, false, B_BOX);
    haptic(HAPTIC.tap);
    (goalsEl.querySelector('[data-g="gens"] span') as HTMLElement).textContent = `${gen} / ${GENS_TARGET}`;
    readPill.textContent = `${gen}세대가 지났어요`;
    if (gen === 1) {
      helper.innerHTML = "섬 (가)에서는 <b>굵고 짧은 부리</b>가 씨앗을 깨 먹었고, 섬 (나)에서는 <b>가늘고 긴 부리</b>가 틈 속 곤충을 꺼내 먹었어요. 먹지 못한 새는 자손을 남기지 못했어요. <b>한 마리의 부리가 변한 게 아니라</b>, 무리에 남은 부리 종류가 달라진 거예요.";
    } else if (gen === 2) {
      helper.innerHTML = "중간 부리도 점점 줄어요. 아래 점을 세어 보면 두 섬의 무리가 <b>서로 반대쪽</b>으로 기울고 있어요.";
    }
    if (gen >= GENS_TARGET) {
      collect("gens");
      phase = "meet";
      helper.innerHTML = `${GENS_TARGET}세대가 지나자 섬 (가)는 <b>굵고 짧은 부리</b>만, 섬 (나)는 <b>가늘고 긴 부리</b>만 남았어요. 두 무리를 다시 만나게 하면 어떻게 될까요?`;
      toastMsg("두 섬의 무리가 완전히 달라졌어요");
    }
    renderControls();
  }

  // ── 국면 4: 재회 → 종 분화 ────────────────────────────────────────────
  function startMeet(): void {
    phase = "done";
    meetT = 0.0001;
    place(islandA, { x: 30, y: 78, w: 128, h: 84 });
    place(islandB, { x: 202, y: 78, w: 128, h: 84 });
    readPill.textContent = "다시 만난 두 무리";
    helper.innerHTML = "다시 만났지만 두 무리는 서로 짝을 짓지 않아요. 오랜 시간 서로 다른 환경에 적응하는 동안 <b>서로 다른 종</b>으로 나뉜 거예요.";
    collect("species");
    if (!finished) {
      finished = true;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "변이와 종 정리하기");
    }
    renderControls();
  }

  // ── 그리기 ────────────────────────────────────────────────────────────
  function drawBird(ctx: CanvasRenderingContext2D, kind: Kind, x: number, y: number, t: number, bob: number, alpha = 1): void {
    const bx = sc(x);
    const by = sc(y + Math.sin(t / 640 + bob) * 1.5);
    const r = sc(7);
    const bk = KIND_BEAK[kind];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = BODY;
    ctx.beginPath(); ctx.ellipse(bx, by, r * 1.12, r, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bx + r * 0.92, by - r * 0.7, r * 0.64, 0, Math.PI * 2); ctx.fill();
    const hx = bx + r * 1.46;
    const hy = by - r * 0.74;
    ctx.fillStyle = bk.color;
    ctx.beginPath();
    ctx.moveTo(hx, hy - sc(bk.th) / 2);
    ctx.lineTo(hx + sc(bk.len), hy);
    ctx.lineTo(hx, hy + sc(bk.th) / 2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#0B1524";
    ctx.beginPath(); ctx.arc(bx + r * 1.02, by - r * 0.9, sc(0.95), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawGround(ctx: CanvasRenderingContext2D, box: { x: number; y: number; w: number; h: number }, color: string, label: string, food: "seed" | "bug" | "none"): void {
    const gx = sc(box.x);
    const gy = sc(box.y + box.h);
    const gw = sc(box.w);
    ctx.save();
    const grad = ctx.createLinearGradient(gx, gy - sc(16), gx, gy + sc(14));
    grad.addColorStop(0, `${color}3D`);
    grad.addColorStop(1, `${color}10`);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.ellipse(gx + gw / 2, gy + sc(4), gw / 2, sc(13), 0, 0, Math.PI * 2); ctx.fill();
    if (food !== "none") {
      ctx.fillStyle = color;
      for (let i = 0; i < 4; i++) {
        const fx = gx + gw * (0.2 + i * 0.2);
        const fy = gy + sc(3);
        ctx.beginPath();
        if (food === "seed") ctx.ellipse(fx, fy, sc(3.6), sc(2.7), 0.5, 0, Math.PI * 2);
        else ctx.ellipse(fx, fy, sc(1.5), sc(3.4), 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = color;
    ctx.font = `700 ${sc(12)}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(label, gx + gw / 2, gy + sc(12));
    ctx.restore();
  }

  /** 부리 종류별 마리 수를 점(●)으로 — 세면 바로 아는 표기. 히스토그램보다 훨씬 쉽다. */
  function drawTally(ctx: CanvasRenderingContext2D, list: Bird[], left: number, top: number, w: number, accent: string): void {
    ctx.save();
    ctx.textBaseline = "middle";
    KINDS.forEach((k, i) => {
      const y = top + i * 22;
      const n = countOf(list, k);
      ctx.textAlign = "left";
      ctx.font = `700 ${sc(12)}px Pretendard, sans-serif`;
      ctx.fillStyle = n ? "#C9D8EC" : "#54657E";
      ctx.fillText(KIND_NAME[k], sc(left), sc(y));
      // 점 6개 자리: 채운 점 = 살아 있는 마리 수
      for (let d = 0; d < FLOCK; d++) {
        const cx = sc(left + w - 6 - d * 11);
        ctx.beginPath();
        ctx.arc(cx, sc(y), sc(4), 0, Math.PI * 2);
        if (d < n) { ctx.fillStyle = k === "mid" ? "#9AA7B8" : accent; ctx.fill(); }
        else { ctx.strokeStyle = "#2A3A5E"; ctx.lineWidth = sc(1.2); ctx.stroke(); }
      }
    });
    ctx.restore();
  }

  function drawVerdict(ctx: CanvasRenderingContext2D): void {
    if (meetT < 0.5) return;
    const a = Math.min(1, (meetT - 0.5) / 0.35);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = "#0B1524";
    ctx.strokeStyle = "#12B886";
    ctx.lineWidth = sc(1.6);
    const bw = 208; const bh = 38;
    const bx = sc(BASE_W / 2 - bw / 2);
    const by = sc(176);
    ctx.beginPath(); ctx.roundRect(bx, by, sc(bw), sc(bh), sc(12)); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#12B886";
    ctx.font = `800 ${sc(14)}px Pretendard, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("짝이 맺어지지 않아요", sc(BASE_W / 2), by + sc(bh / 2));
    ctx.restore();
  }

  const sizeCanvas = (): number => {
    const rw = canvas.getBoundingClientRect().width || BASE_W;
    const h = Math.round(CVH * (rw / BASE_W));
    canvas.style.height = `${h}px`;
    return h;
  };

  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, sizeCanvas());
    const ctx = fit.ctx;
    W = fit.w;
    ctx.clearRect(0, 0, W, fit.h);
    if (meetT > 0) meetT = Math.min(1, meetT + dt * 0.012);

    if (phase === "vary") {
      drawGround(ctx, LAND, "#12B886", "육지 — 한 종류의 무리", "none");
      for (const b of mainland) {
        b.x += (b.tx - b.x) * Math.min(1, dt * 0.12);
        b.y += (b.ty - b.y) * Math.min(1, dt * 0.12);
        drawBird(ctx, b.kind, b.x, b.y, tMs, b.bob);
      }
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = `700 ${sc(12.5)}px Pretendard, sans-serif`;
      ctx.fillStyle = "#93A9C6";
      ctx.fillText("부리가 세 가지예요 — 눌러서 확인해 보세요", sc(BASE_W / 2), sc(214));
      ctx.restore();
    } else {
      const meeting = phase === "done";
      drawGround(ctx, meeting ? { x: 30, y: 70, w: 128, h: 92 } : A_BOX, SEED_COLOR, meeting ? "섬 (가) 무리" : "섬 (가) — 단단한 씨앗", meeting ? "none" : "seed");
      drawGround(ctx, meeting ? { x: 202, y: 70, w: 128, h: 92 } : B_BOX, BUG_COLOR, meeting ? "섬 (나) 무리" : "섬 (나) — 작은 곤충", meeting ? "none" : "bug");
      for (const f of fading) {
        f.t = Math.max(0, f.t - dt * 0.02);
        if (f.t > 0) drawBird(ctx, f.kind, f.x, f.y, tMs, 0, f.t * 0.55);
      }
      for (const b of islandA.concat(islandB)) {
        b.x += (b.tx - b.x) * Math.min(1, dt * 0.12);
        b.y += (b.ty - b.y) * Math.min(1, dt * 0.12);
        drawBird(ctx, b.kind, b.x, b.y, tMs, b.bob);
      }
      drawTally(ctx, islandA, 14, 208, 158, SEED_COLOR);
      drawTally(ctx, islandB, 190, 208, 158, BUG_COLOR);
      if (meetT > 0) drawVerdict(ctx);
    }
  });

  renderControls();
  const onResize = (): void => { fitCanvas(canvas, sizeCanvas()); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("부리를 살펴보고 세대를 지나 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onTap);
  };
};
