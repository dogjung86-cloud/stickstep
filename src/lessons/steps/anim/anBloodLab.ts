// anBloodLab — 중2 Ⅵ L7 "혈액 관찰실". 세 국면을 순서대로 지난다.
// ① 원심분리 — 혈액을 돌려 액체 성분(혈장)과 세포 성분(혈구)으로 갈라 두 층을 탭해 확인
// ② 혈구 분류 — 크기·핵 유무로 적혈구·백혈구·혈소판을 골라 담기
// ③ 작용 찾기 — 세 상황에 필요한 혈구를 짝지어 산소 운반·보호·혈액응고를 정리
// 혈구의 크기 대소(백혈구 > 적혈구 > 혈소판)와 핵 유무는 그림 자체가 정확해야 한다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { buildLab, labLife } from "../../../ui/animalLab";
import {
  fitLabCanvas,
  VESSEL, canvasPoint, drawPlatelet, drawRBC, drawWBC, labelChip, roundRect, withAlpha, cssVar,
} from "../../../ui/animalKit";
import type { StepRenderer } from "../../types";

const BASE_W = 360;
const CVH = 476;

type Kind = "rbc" | "wbc" | "plt";
type Phase = 0 | 1 | 2;

const PHASE_NAME = ["원심분리", "혈구 분류", "작용 찾기"] as const;

const KIND_NAME: Record<Kind, string> = { rbc: "적혈구", wbc: "백혈구", plt: "혈소판" };
const KIND_NOTE: Record<Kind, string> = {
  rbc: "수가 가장 많고 핵이 없어요. 가운데가 오목한 원반 모양이고 헤모글로빈이 있어 붉어요.",
  wbc: "혈구 중 가장 크고 모양이 일정하지 않으며 핵이 있어요.",
  plt: "혈구 중 가장 작고 모양이 일정하지 않으며 핵이 없어요.",
};

// ② 분류할 혈구 6개 — 적혈구 3, 백혈구 2, 혈소판 1(실제 수의 비를 어렴풋이 반영).
const SAMPLE: { id: string; kind: Kind; x: number; y: number }[] = [
  { id: "c1", kind: "rbc", x: 58, y: 104 },
  { id: "c2", kind: "rbc", x: 122, y: 84 },
  { id: "c3", kind: "rbc", x: 186, y: 108 },
  { id: "c4", kind: "wbc", x: 250, y: 84 },
  { id: "c5", kind: "wbc", x: 304, y: 112 },
  { id: "c6", kind: "plt", x: 156, y: 144 },
];
const BINS: { kind: Kind; x: number; w: number }[] = [
  { kind: "rbc", x: 14, w: 104 },
  { kind: "wbc", x: 128, w: 104 },
  { kind: "plt", x: 242, w: 104 },
];
const BIN_Y = 206;
const BIN_H = 96;

// ③ 상황 ↔ 혈구
const JOBS: { id: string; text: string; kind: Kind; job: string }[] = [
  { id: "j1", text: "숨을 들이쉬어 받은 산소를 온몸 세포에 보내야 해요", kind: "rbc", job: "산소 운반 작용" },
  { id: "j2", text: "몸속에 세균이 침입했어요", kind: "wbc", job: "보호 작용" },
  { id: "j3", text: "무릎이 까져 피가 나요", kind: "plt", job: "혈액응고 작용" },
];

export const anBloodLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } };
  const life = labLife();

  const lab = buildLab(host, api, {
    title: s.title,
    lead: s.lead,
    aria: "혈액을 원심분리해 두 성분으로 나누고, 혈구 세 종류를 크기와 핵으로 분류한 뒤 각각의 작용을 짝짓는 모형",
    height: CVH,
    goals: [
      { id: "split", title: "두 성분", sub: "혈장·혈구" },
      { id: "sort", title: "혈구 3종", sub: "크기·핵으로" },
      { id: "job", title: "맡은 작용", sub: "상황에 짝짓기" },
    ],
    helper: "먼저 <b>원심분리기 돌리기</b>를 눌러 혈액을 아주 빠르게 돌려 보세요.",
    finish: "정리됐어요! 혈액은 액체 성분인 <b>혈장</b>과 세포 성분인 <b>혈구</b>로 되어 있고, 혈구는 <b>적혈구(산소 운반)·백혈구(보호)·혈소판(혈액응고)</b>으로 나뉘어요. 크기는 <b>백혈구 &gt; 적혈구 &gt; 혈소판</b>, 핵은 <b>백혈구만</b> 있어요.",
    cta: s.cta ?? "개념 정리하기",
    waitingCta: "세 가지 목표를 모두 달성해 보세요",
    curio: s.curio,
  });

  lab.controls.classList.add("two");
  const actBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "원심분리기 돌리기" });
  const nextBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "다음 단계" });
  lab.controls.append(actBtn, nextBtn);

  let phase: Phase = 0;
  let spun = false;
  let spinT = 0;
  const layerSeen = new Set<string>();
  const placed = new Map<string, Kind>(); // 혈구 id → 담은 통
  let held: string | null = null;
  const matched = new Map<string, Kind>(); // 상황 id → 고른 혈구
  let pickedJob: string | null = null;
  let toast = "";
  let toastUntil = 0;

  const say = (m: string, ms = 3800): void => { toast = m; toastUntil = performance.now() + ms; };

  function setPhase(p: Phase): void {
    phase = p;
    held = null;
    pickedJob = null;
    actBtn.style.display = p === 0 ? "" : "none";
    lab.controls.classList.toggle("two", p === 0);
    if (p === 1) lab.setHelper("혈구를 탭해 고르고, 알맞은 통을 탭해 담아요. <b>가장 큰 것</b>과 <b>핵이 있는 것</b>이 단서예요.");
    if (p === 2) lab.setHelper("상황을 탭한 뒤, 그 일을 맡은 <b>혈구</b>를 탭해 짝지어요.");
    say(`${PHASE_NAME[p]} 단계예요.`);
  }

  life.on(actBtn, "click", () => {
    if (spun) { say("이미 분리했어요. 두 층을 각각 탭해 보세요."); return; }
    spun = true;
    spinT = 0;
    haptic(HAPTIC.tap);
    say("빠르게 돌리니 무거운 세포 성분이 아래로 가라앉았어요. 두 층을 각각 탭해 보세요.", 5000);
  });
  life.on(nextBtn, "click", () => {
    haptic(HAPTIC.tap);
    if (phase === 0 && !lab.has("split")) { say("두 층을 각각 탭해 정체를 확인한 뒤 넘어가요."); return; }
    if (phase === 1 && !lab.has("sort")) { say("혈구 6개를 모두 알맞은 통에 담은 뒤 넘어가요."); return; }
    setPhase(((phase + 1) % 3) as Phase);
  });

  // ── 입력 ────────────────────────────────────────────────────────────────
  const onDown = (ev: Event): void => {
    const p = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
    if (phase === 0) {
      if (!spun) { say("먼저 원심분리기를 돌려 주세요."); return; }
      if (p.x < 130 || p.x > 230) return;
      if (p.y > 96 && p.y < 226) {
        layerSeen.add("plasma");
        haptic(HAPTIC.tap);
        say("혈장 — 대부분 물이고, 영양소·이산화 탄소·노폐물을 운반해요.", 4800);
      } else if (p.y >= 226 && p.y < 330) {
        layerSeen.add("cells");
        haptic(HAPTIC.tap);
        say("혈구 — 세포 성분이에요. 적혈구·백혈구·혈소판이 여기 모여 있어요.", 4800);
      }
      if (layerSeen.size === 2 && !lab.has("split")) {
        lab.collect("split", "두 층 확인");
        lab.setHelper("혈액은 <b>액체 성분(혈장)</b>과 <b>세포 성분(혈구)</b>로 되어 있어요. <b>다음 단계</b>를 눌러 혈구를 자세히 봐요.");
      }
      return;
    }
    if (phase === 1) {
      if (held) {
        const bin = BINS.find((b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= BIN_Y && p.y <= BIN_Y + BIN_H);
        if (bin) {
          const cell = SAMPLE.find((c) => c.id === held)!;
          if (cell.kind === bin.kind) {
            placed.set(cell.id, bin.kind);
            haptic(HAPTIC.correct);
            say(`${KIND_NAME[cell.kind]} — ${KIND_NOTE[cell.kind]}`, 4600);
            if (placed.size === SAMPLE.length && !lab.has("sort")) {
              lab.collect("sort", "6개 모두");
              lab.setHelper("크기는 <b>백혈구 &gt; 적혈구 &gt; 혈소판</b>, 핵은 <b>백혈구만</b> 있었죠. <b>다음 단계</b>에서 각자 맡은 일을 찾아봐요.");
            }
          } else {
            haptic(HAPTIC.wrong);
            say(`이건 ${KIND_NAME[bin.kind]}이 아니에요. ${KIND_NOTE[cell.kind]}`, 4800);
          }
          held = null;
          return;
        }
      }
      const hit = SAMPLE.find((c) => !placed.has(c.id) && Math.hypot(p.x - c.x, p.y - c.y) <= 22);
      if (hit) { held = hit.id; haptic(HAPTIC.tap); say("담을 통을 탭하세요."); }
      return;
    }
    // phase 2 — 상황 탭 → 혈구 탭
    const job = JOBS.find((_, i) => p.y >= 74 + i * 44 && p.y <= 74 + i * 44 + 38 && p.x >= 14 && p.x <= 346);
    if (job) {
      if (matched.has(job.id)) { say(`이미 ${KIND_NAME[matched.get(job.id)!]}을(를) 골랐어요.`); return; }
      pickedJob = job.id;
      haptic(HAPTIC.tap);
      say("이 일을 맡은 혈구를 탭하세요.");
      return;
    }
    const kinds: Kind[] = ["rbc", "wbc", "plt"];
    const idx = kinds.findIndex((_, i) => Math.abs(p.x - (68 + i * 112)) <= 46 && p.y >= 250 && p.y <= 340);
    if (idx >= 0) {
      if (!pickedJob) { say("먼저 위의 상황을 하나 탭해 주세요."); return; }
      const job = JOBS.find((j) => j.id === pickedJob)!;
      if (job.kind === kinds[idx]) {
        matched.set(job.id, kinds[idx]);
        pickedJob = null;
        haptic(HAPTIC.correct);
        say(`맞아요! ${KIND_NAME[job.kind]}의 ${job.job}이에요.`, 4200);
        if (matched.size === JOBS.length) lab.collect("job", "세 작용 완성");
      } else {
        haptic(HAPTIC.wrong);
        say(`${KIND_NAME[kinds[idx]]}이 하는 일이 아니에요. ${KIND_NAME[kinds[idx]]}은 ${JOBS.find((j) => j.kind === kinds[idx])!.job}을 해요.`, 4800);
      }
    }
  };
  life.on(lab.canvas, "pointerdown", onDown);

  // ── 그리기 ──────────────────────────────────────────────────────────────
  function drawCell(ctx: CanvasRenderingContext2D, kind: Kind, x: number, y: number, scale = 1, seed = 0): void {
    // 크기 대소 관계를 반드시 지킨다: 백혈구 > 적혈구 > 혈소판.
    if (kind === "rbc") drawRBC(ctx, x, y, 11 * scale, seed);
    else if (kind === "wbc") drawWBC(ctx, x, y, 17 * scale, seed);
    else drawPlatelet(ctx, x, y, 6.5 * scale, seed);
  }

  function drawSpin(ctx: CanvasRenderingContext2D, t: number): void {
    const top = 84;
    const bot = 330;
    ctx.save();
    if (spun && spinT < 1) ctx.translate(Math.sin(t / 26) * 3, 0);
    // 유리관
    ctx.beginPath();
    ctx.moveTo(132, top);
    ctx.lineTo(228, top);
    ctx.lineTo(228, bot - 40);
    ctx.arcTo(228, bot, 180, bot, 44);
    ctx.arcTo(132, bot, 132, bot - 40, 44);
    ctx.closePath();
    ctx.fillStyle = withAlpha("#FFFFFF", 0.12);
    ctx.fill();
    ctx.save();
    ctx.clip();
    if (!spun || spinT < 0.5) {
      ctx.fillStyle = "#A81F30";
      ctx.fillRect(132, 96, 96, bot - 96);
    } else {
      const split = 226;
      ctx.fillStyle = "#EBC85A";
      ctx.fillRect(132, 96, 96, split - 96);
      ctx.fillStyle = "#8E1626";
      ctx.fillRect(132, split, 96, bot - split);
      ctx.fillStyle = withAlpha("#FFFFFF", 0.5);
      ctx.fillRect(132, split - 1.5, 96, 3);
    }
    ctx.restore();
    ctx.strokeStyle = withAlpha("#BBD2E4", 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = withAlpha("#DCE9F2", 0.9);
    roundRect(ctx, 128, top - 8, 104, 9, 4.5);
    ctx.fill();
    ctx.restore();

    if (spun && spinT >= 0.5) {
      labelChip(ctx, 180, 160, layerSeen.has("plasma") ? "혈장 — 액체 성분" : "위층을 탭해 보세요", {
        size: 10.5,
        bg: withAlpha(layerSeen.has("plasma") ? "#8A6A18" : "#0B1524", 0.9),
      });
      labelChip(ctx, 180, 278, layerSeen.has("cells") ? "혈구 — 세포 성분" : "아래층을 탭해 보세요", {
        size: 10.5,
        bg: withAlpha(layerSeen.has("cells") ? VESSEL.rich.lo : "#0B1524", 0.9),
      });
    } else {
      labelChip(ctx, 180, 200, spun ? "돌리는 중…" : "뽑아 둔 혈액", { size: 11, bg: withAlpha("#0B1524", 0.86) });
    }
  }

  function drawSort(ctx: CanvasRenderingContext2D, t: number): void {
    // 위 — 혈관 속 시료
    ctx.fillStyle = withAlpha("#3A1620", 0.85);
    roundRect(ctx, 8, 58, 344, 118, 14);
    ctx.fill();
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.5);
    ctx.fillText("혈관 속 시료", 20, 74);
    for (const c of SAMPLE) {
      if (placed.has(c.id)) continue;
      const on = held === c.id;
      drawCell(ctx, c.kind, c.x, c.y, on ? 1.14 : 1, c.x);
      if (on) {
        ctx.save();
        ctx.strokeStyle = "#FFE9A8";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 24 + Math.sin(t / 240) * 1.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    // 아래 — 세 통
    for (const b of BINS) {
      const mine = [...placed.entries()].filter(([, k]) => k === b.kind);
      ctx.save();
      ctx.fillStyle = withAlpha("#0B1524", 0.55);
      roundRect(ctx, b.x, BIN_Y, b.w, BIN_H, 12);
      ctx.fill();
      ctx.strokeStyle = held ? withAlpha("#FFE9A8", 0.8) : withAlpha("#8FA6C2", 0.34);
      ctx.lineWidth = held ? 2.2 : 1.2;
      ctx.setLineDash(held ? [] : [4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      labelChip(ctx, b.x + b.w / 2, BIN_Y + 14, KIND_NAME[b.kind], { size: 10.5, bg: withAlpha("#0B1524", 0.86) });
      mine.forEach(([, k], i) => drawCell(ctx, k, b.x + 26 + (i % 3) * 26, BIN_Y + 58 + Math.floor(i / 3) * 24, 0.82, i));
    }
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.62);
    ctx.fillText(`담은 혈구 ${placed.size} / ${SAMPLE.length}`, BASE_W / 2, 322);
    ctx.textAlign = "left";
  }

  function drawJobs(ctx: CanvasRenderingContext2D, t: number): void {
    JOBS.forEach((j, i) => {
      const y = 74 + i * 44;
      const done = matched.has(j.id);
      const on = pickedJob === j.id;
      ctx.save();
      ctx.fillStyle = withAlpha(done ? "#04B45F" : "#0B1524", done ? 0.28 : 0.55);
      roundRect(ctx, 14, y, 332, 38, 10);
      ctx.fill();
      ctx.strokeStyle = on ? "#FFE9A8" : withAlpha("#8FA6C2", done ? 0.5 : 0.3);
      ctx.lineWidth = on ? 2.2 : 1.2;
      ctx.stroke();
      ctx.restore();
      ctx.font = "700 10.5px Pretendard, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = withAlpha("#FFFFFF", 0.94);
      ctx.fillText(j.text, 26, y + 14);
      ctx.font = "800 9.5px Pretendard, sans-serif";
      ctx.fillStyle = done ? "#9BE8B6" : withAlpha("#FFFFFF", 0.45);
      ctx.fillText(done ? `${KIND_NAME[j.kind]} · ${j.job}` : "탭해서 고르기", 26, y + 29);
    });
    const kinds: Kind[] = ["rbc", "wbc", "plt"];
    kinds.forEach((k, i) => {
      const x = 68 + i * 112;
      const used = [...matched.values()].includes(k);
      ctx.save();
      ctx.globalAlpha = used ? 0.42 : 1;
      ctx.fillStyle = withAlpha("#0B1524", 0.5);
      roundRect(ctx, x - 46, 250, 92, 90, 12);
      ctx.fill();
      ctx.strokeStyle = pickedJob ? withAlpha("#FFE9A8", 0.7) : withAlpha("#8FA6C2", 0.3);
      ctx.lineWidth = pickedJob ? 2 : 1.2;
      ctx.stroke();
      drawCell(ctx, k, x, 292, 1.05, i + t / 4000);
      ctx.restore();
      labelChip(ctx, x, 328, KIND_NAME[k], { size: 10, bg: withAlpha("#0B1524", 0.86) });
    });
  }

  const loop: Loop = createLoop((dt, t) => {
    const { ctx } = fitLabCanvas(lab.canvas, BASE_W, CVH);
    ctx.save();
    ctx.fillStyle = cssVar("--stage") || "#0B1524";
    ctx.fillRect(0, 0, BASE_W, CVH);

    // 국면 세그
    PHASE_NAME.forEach((name, i) => {
      const x = 12 + i * 113;
      const on = i === phase;
      ctx.fillStyle = on ? withAlpha(VESSEL.rich.mid, 0.92) : withAlpha("#0B1524", 0.5);
      roundRect(ctx, x, 14, 108, 30, 10);
      ctx.fill();
      ctx.strokeStyle = on ? VESSEL.rich.hi : withAlpha("#8FA6C2", 0.26);
      ctx.lineWidth = on ? 2 : 1;
      ctx.stroke();
      ctx.font = "800 11.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = on ? "#FFFFFF" : withAlpha("#FFFFFF", 0.55);
      ctx.fillText(`${i + 1}. ${name}`, x + 54, 29);
    });

    if (spun && spinT < 1) spinT = Math.min(1, spinT + dt * 0.012);
    if (phase === 0) drawSpin(ctx, t);
    else if (phase === 1) drawSort(ctx, t);
    else drawJobs(ctx, t);

    // 하단 안내
    ctx.fillStyle = withAlpha("#0B1524", 0.6);
    roundRect(ctx, 8, 396, 344, 68, 12);
    ctx.fill();
    ctx.font = "700 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.86);
    ctx.fillText("크기: 백혈구 > 적혈구 > 혈소판", 20, 416);
    ctx.fillStyle = withAlpha("#FFFFFF", 0.7);
    ctx.fillText("핵: 백혈구만 있어요 (적혈구·혈소판은 없음)", 20, 438);

    if (toast && t < toastUntil) {
      labelChip(ctx, BASE_W / 2, 382, toast, { size: 10, bg: withAlpha("#0B1524", 0.94), fg: "#FFE9A8" });
    }
    ctx.restore();
    lab.setPill(`${phase + 1}. ${PHASE_NAME[phase]}`);
  });

  setPhase(0);
  const start = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    life.dispose();
  };
};
