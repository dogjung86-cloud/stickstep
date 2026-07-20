// 네온 한붓그리기 — 도전 탭 미니게임 2호(프리미엄). 어두운 무대의 네온사인을
// 손을 떼지 않고 한 붓에 그어 켠다. 퍼즐은 gen.ts가 수학적으로 보장(불가능 퍼즐 0%),
// 이 파일은 화면 조립·포인터 입력(스냅 커밋·후퇴 되돌리기·이어 그리기)·렌더·보상만 담당.
// main.ts openOneStroke()가 프리미엄 게이트 소유. 보상은 새 판 첫 클리어만 스틱(파밍 불가).
//
// 입력 문법(모바일 관용 — 1LINE류 표준):
//  · 점을 누르고 끌면 시작, 미사용 간선의 이웃 점 스냅 반경에 들어오면 그 선이 켜진다.
//  · 빠른 스트로크는 이동 선분 기준으로 순서대로 커밋(점을 스쳐 지나도 안 놓친다).
//  · 직전 점으로 되돌아가면 마지막 선 취소(재진입 무장 — 커밋 직후 오발 방지). 버튼도 있다.
//  · 손을 떼도 진행 유지 — 빛나는 끝점에서 이어 그린다. 막다른 길이면 자동 리셋(실패 누적).
//  · 홀수판에서 2번 막히면 홀수점 힌트(금빛 펄스) — 오일러의 규칙을 몸으로 배우는 장치.
import { el } from "../../core/dom";
import { icon } from "../../core/icons";
import { haptic, HAPTIC } from "../../core/haptics";
import { createLoop } from "../../core/anim";
import { awardXp, bestScore, submitScore } from "../../core/store";
import type { Screen } from "../../core/router";
import { fitCanvas } from "../../ui/canvas";
import { Bgm, Particles, Sfx } from "../gameKit";
import { BOARD, HAND_COUNT, inspect, puzzleFor, solvePath, type Pt, type StrokePuzzle } from "./gen";

export const ONE_STROKE_ID = "onestroke";
const SND_KEY = "ost.sound"; // 기기 설정(동기화 대상 아님) — "0"이면 끔
const REWARD_XP = 3; // 새 판 첫 클리어 보상(신기록 갱신분만)
const NEON = ["#38E1FF", "#FF5FA2", "#8CFF6B", "#FFC53D", "#B78CFF"]; // 판마다 순환하는 네온 색
const GOLD = "#FFC53D"; // 홀수점 힌트

// ── 오디오 에셋(일레븐랩스 발주 — qa/gen-onestroke-audio.mjs) ──
// BGM 존 2개 = 수제 1~6판(차분)/절차 7판+(심화). 파일이 없거나 로드 실패면
// Bgm 무음·Sfx 신스 폴백으로 무해하게 동작한다(스텝 러시 문법).
const AUDIO_BASE = `${import.meta.env.BASE_URL}game/onestroke/`;
const BGM_TRACKS = [`${AUDIO_BASE}bgm-neon-calm.mp3`, `${AUDIO_BASE}bgm-neon-deep.mp3`];
const SFX_SAMPLES: Record<string, string> = {
  best: `${AUDIO_BASE}sfx-clear.mp3`, // 판 완성 팬페어
  fall: `${AUDIO_BASE}sfx-stuck.mp3`, // 막다른 길(네온 플리커 다운)
  hint: `${AUDIO_BASE}sfx-hint.mp3`, // 홀수점 힌트 점등(발견 차임)
};

const dist = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);

/** 점 p에서 선분 ab까지 거리와 선분 위 파라미터 t(0..1). */
function segNear(p: Pt, a: Pt, b: Pt): { d: number; t: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const L2 = dx * dx + dy * dy;
  if (L2 === 0) return { d: dist(p, a), t: 0 };
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2));
  return { d: Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)), t };
}

export function oneStrokeScreen(o: { onExit: () => void }): Screen {
  // ---- 헤더(미니게임 공통 문법: 나가기·제목·소리·최고 기록) ----
  const xbtn = el("button", { class: "xbtn", attrs: { "aria-label": "나가기" }, html: icon("x", 20, { sw: 2.4 }) });
  const sfx = new Sfx();
  sfx.enabled = window.localStorage.getItem(SND_KEY) !== "0";
  const sndBtn = el("button", {
    class: `xbtn ost-snd ${sfx.enabled ? "" : "off"}`,
    attrs: { "aria-label": "소리 켜기/끄기", "aria-pressed": String(sfx.enabled) },
    html: icon("note", 18),
  });
  const bestPill = el("div", { class: "pill mg-best", text: `최고 ${bestScore(ONE_STROKE_ID)}판` });
  const header = el("div", { class: "lheader" }, xbtn, el("div", { class: "mg-title", text: "네온 한붓그리기" }), sndBtn, bestPill);

  // ---- 무대(캔버스 + HUD 오버레이) ----
  const cv = el("canvas", { class: "ost-cv", attrs: { "aria-hidden": "true" } }) as unknown as HTMLCanvasElement;
  const prevBtn = el("button", { class: "ost-nav", attrs: { "aria-label": "이전 판" }, html: icon("back", 16, { sw: 2.6 }) }) as HTMLButtonElement;
  const nextBtn = el("button", { class: "ost-nav", attrs: { "aria-label": "다음 판" }, html: icon("chevron", 16, { sw: 2.6 }) }) as HTMLButtonElement;
  const stageLbl = el("b", { text: "1판" });
  const stageRow = el("div", { class: "ost-stagerow" }, prevBtn, stageLbl, nextBtn);
  const edgeLbl = el("div", { class: "ost-edges", attrs: { "aria-label": "켠 선 수" }, text: "선 0/0" });
  const hud = el("div", { class: "ost-hud" }, stageRow, edgeLbl);
  const toast = el("div", { class: "ost-toast", attrs: { role: "status" } });
  const coachMain = el("b", { text: "모든 선을 딱 한 번씩 지나면 완성!" });
  const coachSub = el("span", { text: "" });
  const helper = el("div", { class: "ost-helper" }, coachMain, coachSub);
  const banNum = el("b", { text: "" });
  const banSub = el("div", { class: "ost-ban-sub", text: "" });
  const banner = el("div", { class: "ost-banner", attrs: { role: "status" } }, banNum, banSub);
  const stage = el("div", { class: "ost-stage" }, cv, hud, helper, toast, banner);

  // ---- 조작부 ----
  const undoBtn = el("button", { class: "ost-abtn" }, el("span", { class: "ost-bi", html: icon("back", 16, { sw: 2.4 }) }), el("span", { text: "되돌리기" }));
  const resetBtn = el("button", { class: "ost-abtn" }, el("span", { class: "ost-bi", html: icon("recycle", 16) }), el("span", { text: "처음부터" }));
  const ctrl = el("div", { class: "ost-ctrl" }, undoBtn, resetBtn);

  const host = el("section", { class: "screen ost-scr", attrs: { id: "sc-onestroke" } }, header, stage, ctrl);

  // ---- 오디오(사용자 제스처 안에서 기동 — soundLab 규율) ----
  const bgm = new Bgm(BGM_TRACKS);
  function audioBoot(): void {
    sfx.init();
    sfx.loadSamples(SFX_SAMPLES);
    bgm.init(sfx.context);
    bgm.setMuted(!sfx.enabled);
  }
  sndBtn.addEventListener("click", () => {
    audioBoot();
    sfx.enabled = !sfx.enabled;
    bgm.setMuted(!sfx.enabled);
    window.localStorage.setItem(SND_KEY, sfx.enabled ? "1" : "0");
    sndBtn.classList.toggle("off", !sfx.enabled);
    sndBtn.setAttribute("aria-pressed", String(sfx.enabled));
    haptic(HAPTIC.tap);
  });

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
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  let stageNo = bestScore(ONE_STROKE_ID) + 1; // 이어서 도전(깬 판 다음)
  let pz: StrokePuzzle = puzzleFor(stageNo);
  let neon = NEON[0];
  let edgeIdx = new Map<string, number>(); // "a-b"(a<b) -> 간선 인덱스
  let usedE: boolean[] = [];
  let usedCount = 0;
  let trail: number[] = [];
  let fails = 0;
  let hintOn = false;
  let phase: "idle" | "stuck" | "clear" = "idle";
  let dragging = false;
  let pointer: Pt = { x: 0, y: 0 };
  let armedUndo = false; // 커밋 직후 오발 방지 — 직전 점에서 충분히 멀어져야 후퇴 취소 무장
  let clearAt = 0;
  let stuckAt = 0;
  let vertFlash: number[] = []; // 정점별 커밋 팝 시각(tMs)
  let nowMs = 0;
  const particles = new Particles();

  // ---- 캔버스 좌표계(논리 1000² → 화면 맞춤) ----
  let ctx: CanvasRenderingContext2D | null = null;
  let vw = 0;
  let vh = 0;
  let scale = 1;
  let ox = 0;
  let oy = 0;
  function resize(): void {
    const f = fitCanvas(cv);
    ctx = f.ctx;
    vw = f.w;
    vh = f.h;
    const pad = 30;
    scale = Math.max(0.01, Math.min((vw - pad * 2) / BOARD, (vh - pad * 2) / BOARD));
    ox = (vw - BOARD * scale) / 2;
    oy = (vh - BOARD * scale) / 2;
  }
  const px = (p: Pt): Pt => ({ x: ox + p.x * scale, y: oy + p.y * scale });
  function toBoard(e: PointerEvent): Pt {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left - ox) / scale, y: (e.clientY - r.top - oy) / scale };
  }
  /** 스냅 반경(논리) — 화면에서 최소 28px은 보장. */
  const snapR = (): number => Math.max(92, 28 / scale);

  // ---- 퍼즐 접근 헬퍼 ----
  const ekey = (a: number, b: number): string => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const endpoint = (): number => trail[trail.length - 1];
  function unusedAt(v: number): number[] {
    const out: number[] = [];
    pz.edges.forEach(([a, b], i) => {
      if (!usedE[i] && (a === v || b === v)) out.push(i);
    });
    return out;
  }

  let toastTimer = 0;
  function showToast(msg: string): void {
    toast.textContent = msg;
    toast.classList.add("on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("on"), 1700);
  }

  function coach(msg: string): void {
    coachSub.textContent = msg;
  }

  function updateHud(): void {
    stageLbl.textContent = `${stageNo}판`;
    edgeLbl.textContent = `선 ${usedCount}/${pz.edges.length}`;
    const maxStage = bestScore(ONE_STROKE_ID) + 1;
    prevBtn.disabled = stageNo <= 1;
    nextBtn.disabled = stageNo >= maxStage;
    if (import.meta.env.DEV) {
      host.dataset.ostStage = String(stageNo);
      host.dataset.ostPhase = phase;
      host.dataset.ostEdges = `${usedCount}/${pz.edges.length}`;
      host.dataset.ostOdd = String(pz.odd.length);
      host.dataset.ostFails = String(fails);
      host.dataset.ostHint = hintOn ? "1" : "0";
    }
  }

  function resetTrail(): void {
    trail = [];
    usedE = pz.edges.map(() => false);
    usedCount = 0;
    dragging = false;
    armedUndo = false;
    phase = "idle";
    updateHud();
  }

  function setStage(n: number): void {
    stageNo = n;
    pz = puzzleFor(n);
    neon = NEON[(n - 1) % NEON.length];
    bgm.setZone(n <= HAND_COUNT ? 0 : 1); // 미기동 시에도 무해 — init이 밀린 존을 이어받는다
    bgm.duck(false);
    edgeIdx = new Map();
    pz.edges.forEach(([a, b], i) => edgeIdx.set(ekey(a, b), i));
    vertFlash = pz.verts.map(() => -1e9);
    fails = 0;
    hintOn = false;
    banner.classList.remove("on");
    particles.clear();
    resetTrail();
    coachMain.textContent = "모든 선을 딱 한 번씩 지나면 완성!";
    coach(
      n === 1
        ? "아무 점이나 눌러 시작해요. 손을 떼도 빛나는 점에서 이어 그릴 수 있어요."
        : pz.odd.length === 2
          ? "이번 판은 시작점이 중요해요. 막히면 다른 점에서 다시!"
          : "어느 점에서 시작해도 돼요. 길을 아껴 쓰며 돌아요.",
    );
  }

  // ---- 진행: 커밋·되돌리기·막힘·완성 ----
  function commit(ei: number): void {
    const cur = endpoint();
    const [a, b] = pz.edges[ei];
    const w = a === cur ? b : a;
    usedE[ei] = true;
    usedCount++;
    trail.push(w);
    vertFlash[w] = nowMs;
    armedUndo = false;
    sfx.neon(usedCount);
    haptic(HAPTIC.tap);
    if (!reduced) {
      const q = px(pz.verts[w]);
      particles.burst(q.x, q.y, { n: 6, color: neon, speed: 66, up: 8, life: 300, size: 2 });
    }
    updateHud();
    if (usedCount === pz.edges.length) onClear();
    else if (unusedAt(w).length === 0) onStuck();
  }

  function undo(): boolean {
    if (phase !== "idle" || trail.length < 2) return false;
    const w = trail.pop()!;
    const cur = endpoint();
    const ei = edgeIdx.get(ekey(cur, w));
    if (ei === undefined) return false;
    usedE[ei] = false;
    usedCount--;
    armedUndo = false;
    sfx.neonUndo();
    haptic(HAPTIC.tap);
    updateHud();
    return true;
  }

  function onStuck(): void {
    phase = "stuck";
    stuckAt = nowMs;
    fails++;
    dragging = false;
    sfx.fall();
    haptic(HAPTIC.wrong);
    if (!reduced) {
      stage.classList.remove("shake");
      void stage.offsetWidth;
      stage.classList.add("shake");
    }
    const left = pz.edges.length - usedCount;
    showToast(`막다른 길이에요! 남은 선 ${left}개`);
    let newHint = false;
    if (pz.odd.length === 2 && fails >= 2 && !hintOn) {
      hintOn = true;
      newHint = true;
      coach("비밀 공개: 선이 홀수 개 모인 점이 두 개 있어요. 금빛 점에서 시작해야 끝까지 그릴 수 있어요!");
    } else if (pz.odd.length === 0 && fails >= 3) {
      coach("시작점은 어디든 좋아요. 대신 시작점으로 돌아오는 건 마지막 한 번이어야 해요!");
    }
    later(() => {
      if (phase === "stuck") {
        resetTrail();
        updateHud();
        if (newHint) sfx.neonHint(); // 리셋된 새 판 + 금빛 링과 함께 발견 차임
      }
    }, 900);
    updateHud();
  }

  function onClear(): void {
    phase = "clear";
    clearAt = nowMs;
    dragging = false;
    const isNew = submitScore(ONE_STROKE_ID, stageNo);
    if (isNew) {
      awardXp(REWARD_XP);
      bestPill.textContent = `최고 ${stageNo}판`;
    }
    banNum.textContent = `${stageNo}판 완성!`;
    banSub.textContent = isNew ? `+${REWARD_XP} 스텝` : "이미 깬 판이에요";
    banner.classList.add("on");
    bgm.duck(true); // 팬페어 동안 살짝 가라앉힘 — 다음 판 setStage가 복귀시킨다
    sfx.best();
    haptic(HAPTIC.done);
    if (!reduced)
      pz.verts.forEach((v, i) => {
        later(() => {
          const q = px(v);
          particles.burst(q.x, q.y, { n: 10, color: i % 2 ? "#FFFFFF" : neon, speed: 90, up: 30, life: 480, size: 2.4 });
        }, i * 45);
      });
    later(() => setStage(stageNo + 1), 1500);
    updateHud();
  }

  // ---- 포인터 입력 ----
  function hitVert(p: Pt): number {
    const r = snapR() * 1.15; // 잡기는 살짝 후하게
    let best = -1;
    let bd = Infinity;
    pz.verts.forEach((v, i) => {
      const d = dist(p, v);
      if (d <= r && d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  }

  /** 이동 선분(p0→p1)을 따라 미사용 이웃 간선을 순서대로 커밋 — 빠른 스트로크 대응. */
  function commitAlong(p0: Pt, p1: Pt): void {
    let guard = 8;
    while (guard-- > 0 && phase === "idle" && trail.length) {
      const cur = endpoint();
      let best = -1;
      let bestT = Infinity;
      for (const ei of unusedAt(cur)) {
        const [a, b] = pz.edges[ei];
        const w = a === cur ? b : a;
        const near = segNear(pz.verts[w], p0, p1);
        if (near.d <= snapR() && near.t < bestT) {
          bestT = near.t;
          best = ei;
        }
      }
      if (best < 0) break;
      commit(best);
    }
  }

  let lastWrongToast = 0;
  cv.addEventListener("pointerdown", (e) => {
    audioBoot();
    if (phase !== "idle") return;
    try {
      cv.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 포인터 안전(binSort 선례) */
    }
    const p = toBoard(e);
    pointer = p;
    const v = hitVert(p);
    if (v < 0) return;
    if (trail.length === 0) {
      trail = [v];
      vertFlash[v] = nowMs;
      sfx.neon(0);
      haptic(HAPTIC.tap);
      updateHud();
    } else if (v !== endpoint()) {
      if (nowMs - lastWrongToast > 1100) {
        lastWrongToast = nowMs;
        showToast("이어 그리려면 빛나는 점에서!");
      }
      return;
    }
    dragging = true;
    armedUndo = false;
  });
  cv.addEventListener("pointermove", (e) => {
    if (!dragging || phase !== "idle" || !trail.length) return;
    const p = toBoard(e);
    commitAlong(pointer, p);
    // 후퇴 되돌리기 — 직전 점 재진입(무장 후)
    if (trail.length >= 2) {
      const prev = pz.verts[trail[trail.length - 2]];
      const d = dist(p, prev);
      if (!armedUndo && d > snapR() * 1.5) armedUndo = true;
      else if (armedUndo && d <= snapR()) undo();
    }
    pointer = p;
  });
  const endDrag = (): void => {
    dragging = false;
  };
  cv.addEventListener("pointerup", endDrag);
  cv.addEventListener("pointercancel", endDrag);

  // ---- 버튼 ----
  undoBtn.addEventListener("click", () => {
    audioBoot();
    if (phase !== "idle") return;
    if (trail.length >= 2) undo();
    else if (trail.length === 1) {
      resetTrail();
      haptic(HAPTIC.tap);
    }
  });
  resetBtn.addEventListener("click", () => {
    audioBoot();
    if (phase === "clear") return;
    resetTrail();
    haptic(HAPTIC.tap);
    showToast("처음부터 다시 그려요");
  });
  prevBtn.addEventListener("click", () => {
    if (phase === "clear" || stageNo <= 1) return;
    haptic(HAPTIC.select);
    setStage(stageNo - 1);
  });
  nextBtn.addEventListener("click", () => {
    if (phase === "clear" || stageNo >= bestScore(ONE_STROKE_ID) + 1) return;
    haptic(HAPTIC.select);
    setStage(stageNo + 1);
  });

  // ---- 렌더 ----
  function strokeEdges(list: number[], width: number, style: string): void {
    if (!ctx || !list.length) return;
    ctx.lineWidth = width;
    ctx.strokeStyle = style;
    ctx.beginPath();
    for (const ei of list) {
      const [a, b] = pz.edges[ei];
      const pa = px(pz.verts[a]);
      const pb = px(pz.verts[b]);
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
    }
    ctx.stroke();
  }

  function draw(tMs: number): void {
    if (!ctx) return;
    const g = ctx;
    // 배경 — 무대 톤 + 은은한 비네트
    g.clearRect(0, 0, vw, vh);
    const bg = g.createRadialGradient(vw / 2, vh * 0.42, 40, vw / 2, vh / 2, Math.max(vw, vh) * 0.75);
    bg.addColorStop(0, "#11223B");
    bg.addColorStop(1, "#0B1524");
    g.fillStyle = bg;
    g.fillRect(0, 0, vw, vh);

    g.lineCap = "round";
    g.lineJoin = "round";
    const un: number[] = [];
    const on: number[] = [];
    usedE.forEach((u, i) => (u ? on : un).push(i));

    // 꺼진 관(미사용) — 스틱 톤. 막힘 연출 동안엔 남은 선이 붉게 숨쉰다
    if (phase === "stuck") {
      const k = Math.min(1, (tMs - stuckAt) / 900);
      const puls = 0.35 + 0.3 * Math.sin(tMs / 90);
      strokeEdges(un, 5, `rgba(240,68,82,${(0.55 - 0.3 * k) * (reduced ? 0.7 : puls + 0.4)})`);
    } else {
      strokeEdges(un, 5, "rgba(158,180,210,0.22)");
      strokeEdges(un, 1.6, "rgba(210,226,248,0.3)");
    }

    // 켜진 네온 — 3겹 글로우(lightKit drawBeam 문법의 캔버스판)
    strokeEdges(on, 12, hexA(neon, 0.16));
    strokeEdges(on, 6.5, hexA(neon, 0.5));
    strokeEdges(on, 2.6, "rgba(244,254,255,0.95)");
    if (phase === "clear") {
      const k = Math.min(1, (tMs - clearAt) / 700);
      strokeEdges(on, 16 + 10 * k, hexA(neon, 0.24 * (1 - k)));
    }

    // 러버 밴드
    if (dragging && phase === "idle" && trail.length) {
      const pa = px(pz.verts[endpoint()]);
      const pb = px(pointer);
      g.setLineDash([8, 7]);
      g.lineWidth = 3;
      g.strokeStyle = hexA(neon, 0.55);
      g.beginPath();
      g.moveTo(pa.x, pa.y);
      g.lineTo(pb.x, pb.y);
      g.stroke();
      g.setLineDash([]);
    }

    // 정점
    const inTrail = new Set(trail);
    const endV = trail.length ? endpoint() : -1;
    pz.verts.forEach((v, i) => {
      const q = px(v);
      const flash = Math.max(0, 1 - (tMs - vertFlash[i]) / 340);
      const r = 8 + flash * 4 + (i === endV ? 2.5 : 0);
      // 시작 안내 — 아직 안 그렸으면 모든 점이 은은히 숨쉰다(홀수점 정보는 감춘다)
      if (trail.length === 0 && phase === "idle" && !reduced) {
        const puls = 0.5 + 0.5 * Math.sin(tMs / 480 + i * 1.7);
        g.beginPath();
        g.arc(q.x, q.y, 13 + puls * 3.5, 0, Math.PI * 2);
        g.strokeStyle = `rgba(210,226,248,${0.1 + puls * 0.12})`;
        g.lineWidth = 2;
        g.stroke();
      }
      // 홀수점 힌트 — 금빛 이중 링
      if (hintOn && pz.odd.includes(i) && phase !== "clear") {
        const puls = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(tMs / 300);
        g.beginPath();
        g.arc(q.x, q.y, 15 + puls * 4, 0, Math.PI * 2);
        g.strokeStyle = hexA(GOLD, 0.5 + puls * 0.3);
        g.lineWidth = 2.6;
        g.stroke();
        g.beginPath();
        g.arc(q.x, q.y, 22 + puls * 5, 0, Math.PI * 2);
        g.strokeStyle = hexA(GOLD, 0.18);
        g.lineWidth = 1.6;
        g.stroke();
      }
      // 끝점 글로우
      if (i === endV && phase === "idle") {
        const puls = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(tMs / 260);
        g.beginPath();
        g.arc(q.x, q.y, 14 + puls * 4.5, 0, Math.PI * 2);
        g.strokeStyle = hexA(neon, 0.35 + puls * 0.35);
        g.lineWidth = 3;
        g.stroke();
      }
      g.beginPath();
      g.arc(q.x, q.y, r, 0, Math.PI * 2);
      g.fillStyle = inTrail.has(i) ? neon : "#0E1B2E";
      g.fill();
      g.lineWidth = 2.2;
      g.strokeStyle = inTrail.has(i) ? "rgba(255,255,255,0.9)" : "rgba(196,212,236,0.6)";
      g.stroke();
      if (!inTrail.has(i)) {
        g.beginPath();
        g.arc(q.x, q.y, 2.6, 0, Math.PI * 2);
        g.fillStyle = "rgba(210,226,248,0.75)";
        g.fill();
      }
    });

    particles.draw(g);
  }

  /** #RRGGBB → rgba 문자열. */
  function hexA(hex: string, a: number): string {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  // ---- 루프(mount 뒤 시작 — 스텝 러시 함정 계승: nav.go가 stopAllLoops 후 mount) ----
  const loop = createLoop((dtNorm, tMs) => {
    nowMs = tMs;
    particles.update(dtNorm * 16.7);
    draw(tMs);
  });
  later(() => {
    resize(); // 팩토리 시점엔 0×0 — mount 후 실크기
    loop.start();
  }, 0);
  const ro = new ResizeObserver(() => resize());
  ro.observe(stage);

  // ---- DEV·e2e 훅 ----
  if (import.meta.env.DEV) {
    (window as unknown as { __ostDev?: unknown }).__ostDev = {
      inspect,
      stage: (): number => stageNo,
      path: (): number[] | null => solvePath(pz),
      pos: (i: number): { x: number; y: number } => {
        const r = cv.getBoundingClientRect();
        const q = px(pz.verts[i]);
        return { x: r.left + q.x, y: r.top + q.y };
      },
    };
  }

  // ---- 시작·정리 ----
  setStage(stageNo);
  let dead = false;
  function cleanup(): void {
    if (dead) return;
    dead = true;
    loop.stop();
    ro.disconnect();
    bgm.dispose(); // 컨텍스트 소유자(sfx)보다 먼저 정리(스텝 러시 관례)
    sfx.dispose();
    window.clearTimeout(toastTimer);
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
    if (import.meta.env.DEV) delete (window as unknown as { __ostDev?: unknown }).__ostDev;
  }
  xbtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    cleanup();
    o.onExit();
  });

  return { el: host, onExit: cleanup };
}
