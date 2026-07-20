// 레이저 미로 v2 — 도전 탭 미니게임(프리미엄). 사각 블록을 끌어 옮겨 45° 레이저를 모든
// 보석까지 보내는 배치 퍼즐(2026-07-19 사용자 확정 — v1 탭 토글 회전은 연타로 몇 초에
// 풀리는 마찰 0 게임이라 폐기). 판 생성은 gen.ts가 정답 역산으로 보장(불가능 판 0%),
// 이 파일은 화면 조립·드래그/탭-탭 입력·캔버스 렌더(대각 빔 글로우·광자 흐름·반사면
// 법선+입사각=반사각 호)·보상만 담당. main.ts openLaserMaze가 프리미엄 게이트 소유.
// 보상은 새 판 첫 클리어만 +3 스틱.
//
// 교육 장치(중2 III 연결): 반사점마다 법선 점선 + 입사각=반사각 쌍둥이 호(reflectLab 시각
// 언어 — 평평한 면+법선이라 교과서 도해 그대로), 합성 보석 판은 코치 한 줄로 가산혼합을
// 짚는다(colorMixLab 문법 — R+G=노랑). 빔끼리는 서로 통과한다(빛은 부딪히지 않는다).
//
// 입력 문법(연타 방지의 핵심): 드래그로 든 조각은 판에서 '들려' 빔이 그 칸을 지나가고,
// 빔 갱신은 내려놓는 순간(커밋)에만 — 끌고 다니며 빔을 훑는 스크럽 풀이를 차단해
// "예측→배치→확인" 리듬을 지킨다. 탭-탭(선택→목적지)은 폴백 겸 e2e 경로.
import { el } from "../../core/dom";
import { icon } from "../../core/icons";
import { haptic, HAPTIC } from "../../core/haptics";
import { createLoop } from "../../core/anim";
import { awardXp, bestScore, submitScore } from "../../core/store";
import type { Screen } from "../../core/router";
import { fitCanvas } from "../../ui/canvas";
import { Bgm, Particles, Sfx } from "../gameKit";
import { COLOR_HEX, COLOR_NAME, DDX, DDY, REV, inspect, puzzleFor, trace, type DDir, type LaserPuzzle, type Traced } from "./gen";

export const LASER_MAZE_ID = "lasermaze";
const SND_KEY = "lzm.sound"; // 기기 설정(동기화 대상 아님) — "0"이면 끔
const REWARD_XP = 3; // 새 판 첫 클리어 보상(한붓그리기와 통일)

const angOf = (d: DDir): number => Math.atan2(DDY[d], DDX[d]);

// ── 오디오 에셋(일레븐랩스 발주 — qa/gen-lasermaze-audio.mjs) ──
// BGM 존 2개 = 판 1~6(기초 반사)/판 7+(색 합성 시대). 파일이 없거나 로드 실패면
// Bgm 무음·Sfx 신스 폴백으로 무해(스텝 러시 문법). 이동 틱은 신스 고정.
const AUDIO_BASE = `${import.meta.env.BASE_URL}game/lasermaze/`;
const BGM_TRACKS = [`${AUDIO_BASE}bgm-laser-focus.mp3`, `${AUDIO_BASE}bgm-laser-prism.mp3`];
const SFX_SAMPLES: Record<string, string> = {
  best: `${AUDIO_BASE}sfx-clear.mp3`, // 판 완성 팬페어
  gem: `${AUDIO_BASE}sfx-gem.mp3`, // 보석 점등 유리 차임
  reset: `${AUDIO_BASE}sfx-reset.mp3`, // 처음 배치로(되감기 휘릭)
};

export function laserMazeScreen(o: { onExit: () => void }): Screen {
  // ---- 헤더(미니게임 공통 문법) ----
  const xbtn = el("button", { class: "xbtn", attrs: { "aria-label": "나가기" }, html: icon("x", 20, { sw: 2.4 }) });
  const sfx = new Sfx();
  sfx.enabled = window.localStorage.getItem(SND_KEY) !== "0";
  const sndBtn = el("button", {
    class: `xbtn lzm-snd ${sfx.enabled ? "" : "off"}`,
    attrs: { "aria-label": "소리 켜기/끄기", "aria-pressed": String(sfx.enabled) },
    html: icon("note", 18),
  });
  const bestPill = el("div", { class: "pill mg-best", text: `최고 ${bestScore(LASER_MAZE_ID)}판` });
  const header = el("div", { class: "lheader" }, xbtn, el("div", { class: "mg-title", text: "레이저 미로" }), sndBtn, bestPill);

  // ---- 무대(캔버스 + HUD) ----
  const cv = el("canvas", { class: "lzm-cv", attrs: { "aria-hidden": "true" } }) as unknown as HTMLCanvasElement;
  const prevBtn = el("button", { class: "lzm-nav", attrs: { "aria-label": "이전 판" }, html: icon("back", 16, { sw: 2.6 }) }) as HTMLButtonElement;
  const nextBtn = el("button", { class: "lzm-nav", attrs: { "aria-label": "다음 판" }, html: icon("chevron", 16, { sw: 2.6 }) }) as HTMLButtonElement;
  const stageLbl = el("b", { text: "1판" });
  const gemLbl = el("div", { class: "lzm-gems", attrs: { "aria-label": "켜진 보석 수" }, text: "보석 0/0" });
  const hud = el("div", { class: "lzm-hud" }, el("div", { class: "lzm-stagerow" }, prevBtn, stageLbl, nextBtn), gemLbl);
  const toast = el("div", { class: "lzm-toast", attrs: { role: "status" } });
  const coachMain = el("b", { text: "블록을 끌어 옮기면 빛이 튕겨요. 레이저를 모든 보석에!" });
  const coachSub = el("span", { text: "" });
  const helper = el("div", { class: "lzm-helper" }, coachMain, coachSub);
  const banNum = el("b", { text: "" });
  const banSub = el("div", { class: "lzm-ban-sub", text: "" });
  const banner = el("div", { class: "lzm-banner", attrs: { role: "status" } }, banNum, banSub);
  const stage = el("div", { class: "lzm-stage" }, cv, hud, helper, toast, banner);

  // ---- 조작부 ----
  const resetBtn = el("button", { class: "lzm-abtn" }, el("span", { class: "lzm-bi", html: icon("recycle", 16) }), el("span", { text: "처음 배치로" }));
  const ctrl = el("div", { class: "lzm-ctrl" }, resetBtn);

  const host = el("section", { class: "screen lzm-scr", attrs: { id: "sc-lasermaze" } }, header, stage, ctrl);

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
  let stageNo = bestScore(LASER_MAZE_ID) + 1;
  let pz: LaserPuzzle = puzzleFor(stageNo);
  let cur: { x: number; y: number }[] = []; // 조각 현재 칸
  let disp: { x: number; y: number }[] = []; // 표시 위치(칸 단위 float — cur로 스프링)
  let tr: Traced;
  let litPrev = new Set<number>();
  let phase: "idle" | "clear" = "idle";
  let moves = 0;
  let selIdx = -1; // 탭-탭 선택 조각
  interface DragSt { idx: number; pid: number; sx: number; sy: number; px: number; py: number; moved: boolean; }
  let drag: DragSt | null = null;
  const particles = new Particles();

  // ---- 캔버스 좌표계(격자 → 화면 맞춤) ----
  let ctx: CanvasRenderingContext2D | null = null;
  let vw = 0;
  let vh = 0;
  let cellPx = 40;
  let gx0 = 0;
  let gy0 = 0;
  function resize(): void {
    const f = fitCanvas(cv);
    ctx = f.ctx;
    vw = f.w;
    vh = f.h;
    const pad = 26;
    cellPx = Math.max(8, Math.min((vw - pad * 2) / pz.grid, (vh - pad * 2) / pz.grid));
    gx0 = (vw - pz.grid * cellPx) / 2;
    gy0 = (vh - pz.grid * cellPx) / 2;
  }
  const px = (u: number): number => gx0 + u * cellPx; // 칸 단위 → px (x)
  const py = (u: number): number => gy0 + u * cellPx;

  // 드래그로 든 조각은 판에서 '들려' 빔이 그 칸을 지나간다 — 커밋 순간에만 빔 갱신
  const posOf = (i: number): { x: number; y: number } => (drag && drag.moved && drag.idx === i ? { x: -99, y: -99 } : cur[i]);
  const retrace = (): void => {
    tr = trace(pz, posOf);
  };

  let toastTimer = 0;
  function showToast(msg: string): void {
    toast.textContent = msg;
    toast.classList.add("on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("on"), 1700);
  }

  const rockAt = (x: number, y: number): boolean => pz.rocks.some((r) => r.x === x && r.y === y);
  const pieceAt = (x: number, y: number, excl = -1): number => cur.findIndex((c, i) => i !== excl && c.x === x && c.y === y);
  const isFree = (x: number, y: number, excl = -1): boolean =>
    x >= 0 && y >= 0 && x < pz.grid && y < pz.grid && !rockAt(x, y) && pieceAt(x, y, excl) < 0;

  function litCount(): number {
    let n = 0;
    pz.gems.forEach((gm, i) => {
      if ((tr.arrived.get(i) ?? 0) === gm.req) n++;
    });
    return n;
  }

  function updateHud(): void {
    stageLbl.textContent = `${stageNo}판`;
    gemLbl.textContent = `보석 ${litCount()}/${pz.gems.length}`;
    const maxStage = bestScore(LASER_MAZE_ID) + 1;
    prevBtn.disabled = stageNo <= 1;
    nextBtn.disabled = stageNo >= maxStage;
    if (import.meta.env.DEV) {
      host.dataset.lzmStage = String(stageNo);
      host.dataset.lzmPhase = phase;
      host.dataset.lzmGems = `${litCount()}/${pz.gems.length}`;
      host.dataset.lzmMoves = String(moves);
      host.dataset.lzmKind = pz.kind;
    }
  }

  function coachFor(): string {
    if (pz.kind === "white") return "빨강·초록·파랑 세 빛이 모두 모이면 하얀빛 — 빛의 삼원색이에요!";
    if (pz.kind === "pair" && pz.pairReq) {
      const parts = [1, 2, 4].filter((b) => (pz.pairReq! & b) !== 0).map((b) => COLOR_NAME[b]);
      return `${parts[0]} 빛과 ${parts[1]} 빛이 한 보석에 모이면 ${COLOR_NAME[pz.pairReq]}빛이 돼요!`;
    }
    if (pz.pieces.some((p) => p.kind === "glass")) return "유리 블록은 빛을 반은 통과, 반은 반사시켜 둘로 나눠요.";
    if (stageNo < 5) return "빛은 블록 면에 부딪혀 튕겨요 — 입사각과 반사각이 언제나 같아요.";
    return "블록 자리를 잘 골라 보세요. 몇 번을 옮겨도 괜찮아요.";
  }

  function seedLit(): void {
    litPrev = new Set();
    pz.gems.forEach((gm, i) => {
      if ((tr.arrived.get(i) ?? 0) === gm.req) litPrev.add(i);
    });
  }

  function setStage(n: number): void {
    stageNo = n;
    pz = puzzleFor(n);
    bgm.setZone(n <= 6 ? 0 : 1); // 미기동 시에도 무해 — init이 밀린 존을 이어받는다
    bgm.duck(false);
    cur = pz.pieces.map((p) => ({ x: p.scrX, y: p.scrY }));
    disp = pz.pieces.map((p) => ({ x: p.scrX, y: p.scrY }));
    moves = 0;
    selIdx = -1;
    drag = null;
    phase = "idle";
    banner.classList.remove("on");
    particles.clear();
    retrace();
    seedLit();
    coachSub.textContent = coachFor();
    resize(); // 격자 크기가 판마다 달라질 수 있다
    updateHud();
  }

  // ---- 진행: 이동·점등·완성 ----
  function onClear(): void {
    phase = "clear";
    const isNew = submitScore(LASER_MAZE_ID, stageNo);
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
      pz.gems.forEach((gm, i) => {
        later(() => particles.burst(px(gm.ex / 2), py(gm.ey / 2), { n: 14, color: COLOR_HEX[gm.req], speed: 95, up: 30, life: 520, size: 2.6 }), i * 40);
      });
    later(() => setStage(stageNo + 1), 1500);
    updateHud();
  }

  function gemFx(): void {
    pz.gems.forEach((gm, gi) => {
      const lit = (tr.arrived.get(gi) ?? 0) === gm.req;
      if (lit && !litPrev.has(gi)) {
        litPrev.add(gi);
        sfx.gemLit();
        haptic(HAPTIC.correct);
        if (!reduced) particles.burst(px(gm.ex / 2), py(gm.ey / 2), { n: 10, color: COLOR_HEX[gm.req], speed: 80, up: 20, life: 420, size: 2.2 });
      } else if (!lit) {
        litPrev.delete(gi);
      }
    });
  }

  /** 조각을 (x,y) 칸으로 — 같은 칸이면 무이동 정착, 막힌 칸이면 false. */
  function commitMove(idx: number, x: number, y: number): boolean {
    const same = cur[idx].x === x && cur[idx].y === y;
    if (!same && !isFree(x, y, idx)) return false;
    if (!same) {
      cur[idx] = { x, y };
      moves++;
      sfx.flip();
      haptic(HAPTIC.tap);
    }
    retrace();
    gemFx();
    updateHud();
    if (tr.won && phase === "idle") onClear();
    return true;
  }

  // ---- 입력: 드래그(고스트+스냅) + 탭-탭 폴백 ----
  const cvPt = (e: PointerEvent): { x: number; y: number } => {
    const r = cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const cellOf = (p: { x: number; y: number }): { x: number; y: number; inside: boolean } => {
    const x = Math.floor((p.x - gx0) / cellPx);
    const y = Math.floor((p.y - gy0) / cellPx);
    return { x, y, inside: x >= 0 && y >= 0 && x < pz.grid && y < pz.grid };
  };

  cv.addEventListener("pointerdown", (e) => {
    audioBoot();
    if (phase !== "idle") return;
    const p = cvPt(e);
    const c = cellOf(p);
    const idx = c.inside ? pieceAt(c.x, c.y) : -1;
    if (idx >= 0) {
      drag = { idx, pid: e.pointerId, sx: p.x, sy: p.y, px: p.x, py: p.y, moved: false };
      try {
        cv.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 포인터 id에서 throw — 리스너는 cv에 있어 캡처 없이도 동작(capturePointer 관례) */
      }
    } else if (selIdx >= 0 && c.inside) {
      if (commitMove(selIdx, c.x, c.y)) selIdx = -1;
      else showToast("그 칸엔 놓을 수 없어요");
    } else {
      selIdx = -1;
    }
  });
  cv.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.pid) return;
    const p = cvPt(e);
    drag.px = p.x;
    drag.py = p.y;
    if (!drag.moved) {
      const dx = p.x - drag.sx;
      const dy = p.y - drag.sy;
      if (dx * dx + dy * dy > 49) {
        drag.moved = true; // 들어올림 — 빔이 이 조각 없이 다시 그려진다
        selIdx = -1;
        retrace();
      }
    }
  });
  const endDrag = (e: PointerEvent, cancelled: boolean): void => {
    if (!drag || e.pointerId !== drag.pid) return;
    const d = drag;
    drag = null;
    if (phase !== "idle") return;
    if (!d.moved) {
      selIdx = selIdx === d.idx ? -1 : d.idx; // 탭 — 선택 토글
      haptic(HAPTIC.select);
      return;
    }
    const drop = { x: (d.px - gx0) / cellPx - 0.5, y: (d.py - gy0) / cellPx - 0.5 };
    disp[d.idx] = drop; // 내려놓은 자리에서 목적지(성공)나 원래 칸(실패)으로 정착
    const c = cellOf({ x: d.px, y: d.py });
    if (cancelled || !c.inside || !commitMove(d.idx, c.x, c.y)) retrace(); // 스냅백 — 든 것 해제
  };
  cv.addEventListener("pointerup", (e) => endDrag(e, false));
  cv.addEventListener("pointercancel", (e) => endDrag(e, true));

  resetBtn.addEventListener("click", () => {
    audioBoot();
    if (phase !== "idle") return;
    cur = pz.pieces.map((p) => ({ x: p.scrX, y: p.scrY }));
    disp = pz.pieces.map((p) => ({ x: p.scrX, y: p.scrY }));
    moves = 0;
    selIdx = -1;
    drag = null;
    retrace();
    seedLit();
    sfx.resetWhoosh();
    haptic(HAPTIC.tap);
    showToast("처음 배치로 되돌렸어요");
    updateHud();
  });
  prevBtn.addEventListener("click", () => {
    if (phase !== "idle" || stageNo <= 1) return;
    haptic(HAPTIC.select);
    setStage(stageNo - 1);
  });
  nextBtn.addEventListener("click", () => {
    if (phase !== "idle" || stageNo >= bestScore(LASER_MAZE_ID) + 1) return;
    haptic(HAPTIC.select);
    setStage(stageNo + 1);
  });

  // ---- 렌더 ----
  /** #RRGGBB → rgba. */
  function hexA(hex: string, a: number): string {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function strokeSegs(list: { x1: number; y1: number; x2: number; y2: number }[], width: number, style: string, dashOff?: number): void {
    if (!ctx || !list.length) return;
    const g = ctx;
    g.lineWidth = width;
    g.strokeStyle = style;
    if (dashOff !== undefined) {
      g.setLineDash([3, 13]);
      g.lineDashOffset = dashOff;
    }
    for (const s of list) {
      g.beginPath();
      g.moveTo(px(s.x1), py(s.y1));
      g.lineTo(px(s.x2), py(s.y2));
      g.stroke();
    }
    if (dashOff !== undefined) g.setLineDash([]);
  }

  function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  /** 조각 그리기 — 파운드리 재질 문법(3스톱 면·키라이트·최암색 테두리). */
  function drawPiece(g: CanvasRenderingContext2D, cx: number, cy: number, kind: "box" | "glass", size: number, lifted: boolean, selected: boolean, tMs: number): void {
    const s = size;
    const x = cx - s / 2;
    const y = cy - s / 2;
    const r = Math.max(6, s * 0.17);
    if (lifted) {
      g.save();
      g.shadowColor = "rgba(2,8,18,0.5)";
      g.shadowBlur = 16;
      g.shadowOffsetY = 7;
    }
    if (kind === "box") {
      const grad = g.createLinearGradient(0, y, 0, y + s);
      grad.addColorStop(0, "#2B4064");
      grad.addColorStop(0.55, "#182741");
      grad.addColorStop(1, "#0F1B2E");
      roundRect(g, x, y, s, s, r);
      g.fillStyle = grad;
      g.fill();
      if (lifted) g.restore();
      g.strokeStyle = "#0A1322";
      g.lineWidth = 1.6;
      roundRect(g, x, y, s, s, r);
      g.stroke();
      // 좌상단 키라이트 + 상단 모서리 하이라이트
      g.strokeStyle = "rgba(212,232,255,0.16)";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x + r, y + 2.2);
      g.lineTo(x + s - r, y + 2.2);
      g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.10)";
      g.lineWidth = 2.4;
      g.beginPath();
      g.arc(x + r + 1, y + r + 1, r * 0.9, Math.PI, Math.PI * 1.5);
      g.stroke();
    } else {
      roundRect(g, x, y, s, s, r);
      g.fillStyle = "rgba(150,205,255,0.13)";
      g.fill();
      if (lifted) g.restore();
      g.strokeStyle = "rgba(140,200,255,0.30)";
      g.lineWidth = 4;
      roundRect(g, x + 1.5, y + 1.5, s - 3, s - 3, Math.max(4, r - 2));
      g.stroke();
      g.strokeStyle = "rgba(238,249,255,0.78)";
      g.lineWidth = 1.5;
      roundRect(g, x, y, s, s, r);
      g.stroke();
      // 유리 광택 — 대각 광선 두 줄
      g.strokeStyle = "rgba(255,255,255,0.25)";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x + s * 0.24, y + s * 0.7);
      g.lineTo(x + s * 0.52, y + s * 0.24);
      g.moveTo(x + s * 0.46, y + s * 0.8);
      g.lineTo(x + s * 0.74, y + s * 0.34);
      g.stroke();
    }
    if (selected) {
      const pul = 0.42 + Math.sin(tMs / 210) * 0.16;
      g.strokeStyle = `rgba(255,255,255,${pul})`;
      g.lineWidth = 2;
      roundRect(g, x - 4, y - 4, s + 8, s + 8, r + 4);
      g.stroke();
    }
  }

  function draw(tMs: number, dtNorm: number): void {
    if (!ctx) return;
    const g = ctx;
    g.clearRect(0, 0, vw, vh);
    const bg = g.createRadialGradient(vw / 2, vh * 0.42, 40, vw / 2, vh / 2, Math.max(vw, vh) * 0.75);
    bg.addColorStop(0, "#11223B");
    bg.addColorStop(1, "#0B1524");
    g.fillStyle = bg;
    g.fillRect(0, 0, vw, vh);
    g.lineCap = "round";

    // 격자 타일(레퍼런스의 희미한 칸) + 선
    g.fillStyle = "rgba(190,210,240,0.03)";
    for (let x = 0; x < pz.grid; x++)
      for (let y = 0; y < pz.grid; y++) {
        roundRect(g, px(x) + 2, py(y) + 2, cellPx - 4, cellPx - 4, 6);
        g.fill();
      }
    g.strokeStyle = "rgba(190,210,240,0.06)";
    g.lineWidth = 1;
    for (let i = 0; i <= pz.grid; i++) {
      g.beginPath();
      g.moveTo(px(i), py(0));
      g.lineTo(px(i), py(pz.grid));
      g.stroke();
      g.beginPath();
      g.moveTo(px(0), py(i));
      g.lineTo(px(pz.grid), py(i));
      g.stroke();
    }

    // 바위(고정) — 자갈 실루엣. 사각 블록과 실루엣부터 달라 "옮기는 조각이 아님"이 즉시 읽힌다
    const ROCK_R = [0.98, 0.84, 1, 0.88, 0.96, 0.82, 1, 0.9];
    for (const r of pz.rocks) {
      const cx = px(r.x + 0.5);
      const cy = py(r.y + 0.5);
      const R = cellPx * 0.4;
      const rot = ((r.x * 5 + r.y * 3) % 8) * (Math.PI / 16); // 칸마다 살짝 다른 결(결정적)
      g.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = rot + (k / 8) * Math.PI * 2;
        const rr = R * ROCK_R[k];
        const vx = cx + Math.cos(a) * rr;
        const vy = cy + Math.sin(a) * rr * 0.92;
        if (k === 0) g.moveTo(vx, vy);
        else g.lineTo(vx, vy);
      }
      g.closePath();
      g.fillStyle = "#0B1626";
      g.fill();
      g.lineJoin = "round";
      g.strokeStyle = "rgba(3,9,18,0.9)";
      g.lineWidth = 3;
      g.stroke();
      g.lineJoin = "miter";
      g.strokeStyle = "rgba(200,220,250,0.1)";
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(cx - R * 0.22, cy - R * 0.26, R * 0.5, Math.PI * 0.95, Math.PI * 1.45);
      g.stroke();
      g.strokeStyle = "rgba(0,0,0,0.55)";
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(cx - R * 0.34, cy - R * 0.1);
      g.lineTo(cx - R * 0.02, cy + R * 0.16);
      g.lineTo(cx - R * 0.24, cy + R * 0.48);
      g.moveTo(cx + R * 0.2, cy - R * 0.42);
      g.lineTo(cx + R * 0.4, cy - R * 0.08);
      g.stroke();
    }

    // 조각(스프링 정착) — 드래그로 든 조각은 고스트로 따로
    for (let i = 0; i < pz.pieces.length; i++) {
      const lifted = !!(drag && drag.moved && drag.idx === i);
      const t = cur[i];
      disp[i].x += (t.x - disp[i].x) * Math.min(1, 0.3 * dtNorm);
      disp[i].y += (t.y - disp[i].y) * Math.min(1, 0.3 * dtNorm);
      if (lifted) continue;
      drawPiece(g, px(disp[i].x + 0.5), py(disp[i].y + 0.5), pz.pieces[i].kind, cellPx * 0.84, false, selIdx === i, tMs);
    }

    // 빔 — 색별 3겹 글로우 + 광자 흐름 + 판 밖 꼬리
    const BIG = (vw + vh) / cellPx;
    const allSegs = tr.segs.concat(tr.exits.map((x) => ({ x1: x.x, y1: x.y, x2: x.x + DDX[x.dir] * BIG, y2: x.y + DDY[x.dir] * BIG, color: x.color })));
    const byColor = new Map<number, { x1: number; y1: number; x2: number; y2: number }[]>();
    for (const s of allSegs) {
      if (!byColor.has(s.color)) byColor.set(s.color, []);
      byColor.get(s.color)!.push(s);
    }
    const flow = reduced ? 0 : -((tMs * 0.022) % 16);
    for (const [c, list] of byColor) {
      const hex = COLOR_HEX[c];
      strokeSegs(list, 10, hexA(hex, 0.14));
      strokeSegs(list, 5.5, hexA(hex, 0.42));
      strokeSegs(list, 2.2, hexA(hex, 0.95));
      strokeSegs(list, 3.2, "rgba(255,255,255,0.75)", flow);
    }

    // 반사점 — 플레어 + 법선 점선 + 입사각=반사각 쌍둥이 호(교육 장치)
    for (const h of tr.hits) {
      const cx = px(h.x);
      const cy = py(h.y);
      const a1 = angOf(REV[h.din] as DDir); // 들어온 빛 쪽
      const a2 = angOf(h.dout);
      const v1 = { x: Math.cos(a1), y: Math.sin(a1) };
      const v2 = { x: Math.cos(a2), y: Math.sin(a2) };
      const bis = Math.atan2(v1.y + v2.y, v1.x + v2.x); // = 면 법선(바깥쪽)
      g.strokeStyle = "rgba(255,255,255,0.3)";
      g.lineWidth = 1;
      g.setLineDash([2.5, 4]);
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(bis) * cellPx * 0.5, cy + Math.sin(bis) * cellPx * 0.5);
      g.stroke();
      g.setLineDash([]);
      g.lineWidth = 1.6;
      g.strokeStyle = hexA(COLOR_HEX[h.color], 0.45);
      const r = cellPx * 0.3;
      const ccw1 = ((bis - a1 + Math.PI * 3) % (Math.PI * 2)) - Math.PI > 0;
      g.beginPath();
      g.arc(cx, cy, r, a1, bis, !ccw1);
      g.stroke();
      g.beginPath();
      g.arc(cx, cy, r * 0.8, bis, a2, !ccw1);
      g.stroke();
      // 면 위 플레어
      g.fillStyle = hexA(COLOR_HEX[h.color], 0.22);
      g.beginPath();
      g.arc(cx, cy, 5.5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.92)";
      g.beginPath();
      g.arc(cx, cy, 2.4, 0, Math.PI * 2);
      g.fill();
    }

    // 보석 — 통과형 링(노드 위)
    for (let i = 0; i < pz.gems.length; i++) {
      const gm = pz.gems[i];
      const cx = px(gm.ex / 2);
      const cy = py(gm.ey / 2);
      const hex = COLOR_HEX[gm.req];
      const arrived = tr.arrived.get(i) ?? 0;
      const lit = arrived === gm.req;
      const rr = cellPx * 0.22 + (lit && !reduced ? Math.sin(tMs / 240) * 1.5 : 0);
      if (lit) {
        g.beginPath();
        g.arc(cx, cy, rr + 5, 0, Math.PI * 2);
        g.fillStyle = hexA(hex, 0.2);
        g.fill();
      }
      g.beginPath();
      g.arc(cx, cy, rr, 0, Math.PI * 2);
      g.fillStyle = lit ? hexA(hex, 0.92) : "rgba(10,20,36,0.85)";
      g.fill();
      g.lineWidth = 2.2;
      g.strokeStyle = lit ? "rgba(255,255,255,0.92)" : hexA(hex, 0.85);
      g.stroke();
      if (!lit && !arrived) {
        g.beginPath();
        g.arc(cx, cy, 2, 0, Math.PI * 2);
        g.fillStyle = hexA(hex, 0.55);
        g.fill();
      }
      // 일부 색만 도착 — 안쪽 점으로 피드백("빨강만 오고 있어요")
      if (!lit && arrived) {
        const bits = [1, 2, 4].filter((b) => (arrived & b) !== 0);
        bits.forEach((b, bi) => {
          g.beginPath();
          g.arc(cx + (bi - (bits.length - 1) / 2) * 6, cy, 2.3, 0, Math.PI * 2);
          g.fillStyle = COLOR_HEX[b];
          g.fill();
        });
      }
    }

    // 광원 — 노드 위 발사 장치(방향 포신 + 색 LED)
    for (const e of pz.emitters) {
      const cx = px(e.ex / 2);
      const cy = py(e.ey / 2);
      const ang = angOf(e.dir);
      const hex = COLOR_HEX[e.color];
      g.strokeStyle = "#2A3D5C";
      g.lineWidth = 9;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(ang) * cellPx * 0.26, cy + Math.sin(ang) * cellPx * 0.26);
      g.stroke();
      g.beginPath();
      g.arc(cx, cy, cellPx * 0.19, 0, Math.PI * 2);
      g.fillStyle = "#101F35";
      g.fill();
      g.strokeStyle = "rgba(220,232,250,0.35)";
      g.lineWidth = 1.6;
      g.stroke();
      g.beginPath();
      g.arc(cx, cy, cellPx * 0.1, 0, Math.PI * 2);
      g.fillStyle = hex;
      g.fill();
      g.strokeStyle = hexA(hex, 0.35);
      g.lineWidth = 4;
      g.stroke();
      g.beginPath();
      g.arc(cx, cy, 2.2, 0, Math.PI * 2);
      g.fillStyle = "rgba(255,255,255,0.9)";
      g.fill();
    }

    // 드래그 고스트 + 목적지 하이라이트
    if (drag && drag.moved) {
      const c = cellOf({ x: drag.px, y: drag.py });
      const org = cur[drag.idx];
      g.setLineDash([5, 5]);
      g.strokeStyle = "rgba(255,255,255,0.2)";
      g.lineWidth = 1.6;
      roundRect(g, px(org.x) + 3, py(org.y) + 3, cellPx - 6, cellPx - 6, 7);
      g.stroke();
      g.setLineDash([]);
      if (c.inside) {
        const okDrop = (c.x === org.x && c.y === org.y) || isFree(c.x, c.y, drag.idx);
        g.strokeStyle = okDrop ? "rgba(122,220,160,0.7)" : "rgba(242,92,105,0.6)";
        g.fillStyle = okDrop ? "rgba(122,220,160,0.08)" : "rgba(242,92,105,0.07)";
        roundRect(g, px(c.x) + 2, py(c.y) + 2, cellPx - 4, cellPx - 4, 7);
        g.fill();
        g.lineWidth = 2;
        g.stroke();
      }
      drawPiece(g, drag.px, drag.py - cellPx * 0.18, pz.pieces[drag.idx].kind, cellPx * 0.92, true, false, tMs);
    }

    particles.draw(g);
  }

  // ---- 루프(mount 뒤 시작 — 스텝 러시 함정 계승) ----
  const loop = createLoop((dtNorm, tMs) => {
    particles.update(dtNorm * 16.7);
    draw(tMs, dtNorm);
  });
  later(() => {
    resize();
    loop.start();
  }, 0);
  const ro = new ResizeObserver(() => resize());
  ro.observe(stage);

  // ---- DEV·e2e 훅 ----
  if (import.meta.env.DEV) {
    (window as unknown as { __lzmDev?: unknown }).__lzmDev = {
      inspect,
      stage: (): number => stageNo,
      won: (): boolean => tr.won,
      moves: (): number => moves,
      grid: (): number => pz.grid,
      pieces: (): { kind: string; x: number; y: number; sx: number; sy: number; wrong: boolean }[] =>
        pz.pieces.map((p, i) => ({ kind: p.kind, x: cur[i].x, y: cur[i].y, sx: p.solX, sy: p.solY, wrong: cur[i].x !== p.solX || cur[i].y !== p.solY })),
      rocks: (): { x: number; y: number }[] => pz.rocks.map((r) => ({ x: r.x, y: r.y })),
      free: (x: number, y: number): boolean => isFree(x, y),
      cellPos: (x: number, y: number): { x: number; y: number } => {
        const r = cv.getBoundingClientRect();
        return { x: r.left + px(x + 0.5), y: r.top + py(y + 0.5) };
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
    if (import.meta.env.DEV) delete (window as unknown as { __lzmDev?: unknown }).__lzmDev;
  }
  xbtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    cleanup();
    o.onExit();
  });

  return { el: host, onExit: cleanup };
}
