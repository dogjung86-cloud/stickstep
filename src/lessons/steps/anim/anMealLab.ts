// anMealLab — 중2 Ⅵ L1 "식판 설계소".
// 음식을 끌어다 식판에 담으면 6영양소 게이지가 실시간으로 차오른다.
// 국면 ① 탄수화물만 담아 편식을 몸으로 겪고 → ② 에너지원 3종 → ③ 6영양소 균형.
// "밥만 먹어도 되지 않나?"라는 도입의 오개념을 랩 안에서 깨는 것이 설계 의도.

import { clamp } from "../../../core/dom";
import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { buildLab, labLife } from "../../../ui/animalLab";
import {
  fitLabCanvas,
  SUBSTANCE, anAsset, anMat, capturePointer, canvasPoint,
  contactShadow, drawToken, labelChip, roundRect, withAlpha, cssVar,
} from "../../../ui/animalKit";
import type { StepRenderer } from "../../types";

const BASE_W = 360;
const CVH = 470;

type NutKey = "carb" | "protein" | "fat" | "vitamin" | "mineral" | "water";

const NUTS: { key: NutKey; name: string; mat: string; role: string }[] = [
  { key: "carb", name: "탄수화물", mat: "starch", role: "에너지원" },
  { key: "protein", name: "단백질", mat: "protein", role: "구성·조절·에너지원" },
  { key: "fat", name: "지방", mat: "fat", role: "구성·에너지원" },
  { key: "vitamin", name: "바이타민", mat: "vitamin", role: "조절" },
  { key: "mineral", name: "무기염류", mat: "mineral", role: "구성·조절" },
  { key: "water", name: "물", mat: "water", role: "운반·체온 조절" },
];

interface Food {
  id: string;
  name: string;
  nut: Partial<Record<NutKey, number>>;
}

// 각 음식에 "많이 들어 있는" 영양소만 담는다(학습 범위의 분류를 따른다).
const FOODS: Food[] = [
  { id: "rice", name: "밥", nut: { carb: 34 } },
  { id: "bread", name: "빵", nut: { carb: 30 } },
  { id: "potato", name: "감자", nut: { carb: 26 } },
  { id: "meat", name: "살코기", nut: { protein: 30, fat: 10 } },
  { id: "egg", name: "달걀", nut: { protein: 26, fat: 8 } },
  { id: "tofu", name: "두부", nut: { protein: 24 } },
  { id: "butter", name: "버터", nut: { fat: 34 } },
  { id: "peanut", name: "땅콩", nut: { fat: 26, protein: 10 } },
  { id: "apple", name: "사과", nut: { vitamin: 28, water: 8 } },
  { id: "carrot", name: "당근", nut: { vitamin: 30 } },
  { id: "anchovy", name: "멸치", nut: { mineral: 32, protein: 8 } },
  { id: "milk", name: "우유", nut: { mineral: 26, protein: 10, water: 10 } },
  { id: "water", name: "물", nut: { water: 40 } },
];

/** 음식 → 대표 영양소(폴백 그림의 색). */
function mainNut(f: Food): NutKey {
  let best: NutKey = "carb";
  let max = -1;
  for (const [k, v] of Object.entries(f.nut) as [NutKey, number][]) {
    if (v > max) { max = v; best = k; }
  }
  return best;
}

const FILLED = 20; // 게이지가 "채워졌다"고 보는 기준
const TRAY = { x: 14, y: 46, w: 332, h: 132 };
const SLOTS = [
  ...[0, 1, 2, 3, 4].map((i) => ({ x: 52 + i * 62, y: 84 })),
  ...[0, 1, 2, 3, 4].map((i) => ({ x: 52 + i * 62, y: 142 })),
];
const PICK_ROW1 = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ x: 30 + i * 50, y: 366 }));
const PICK_ROW2 = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 55 + i * 50, y: 424 }));
const PICKS = [...PICK_ROW1, ...PICK_ROW2];
const ITEM_R = 22;

export const anMealLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } };
  const life = labLife();

  const lab = buildLab(host, api, {
    title: s.title,
    lead: s.lead,
    aria: "음식을 끌어다 식판에 담으면 여섯 가지 영양소 게이지가 차오르는 식단 설계 모형",
    height: CVH,
    goals: [
      { id: "only", title: "한 가지만", sub: "탄수화물만 3개" },
      { id: "energy", title: "에너지원 3종", sub: "탄·단·지" },
      { id: "balance", title: "여섯 가지 균형", sub: "모두 채우기" },
    ],
    helper: "먼저 <b>밥·빵·감자</b>만 골라 식판에 담아 보세요. 탄수화물만 잔뜩 담으면 어떻게 되는지 봐요.",
    finish: "완성! <b>탄수화물·단백질·지방</b>은 에너지원이 되고, <b>바이타민·무기염류</b>는 적은 양으로 몸을 조절하고 구성해요. <b>물</b>은 몸의 구성 성분 중 가장 많고 물질을 운반하죠. 그래서 골고루 먹어야 해요!",
    cta: s.cta ?? "개념 정리하기",
    waitingCta: "세 가지 목표를 모두 달성해 보세요",
    curio: s.curio,
  });

  const clearBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "식판 비우기" });
  lab.controls.classList.add("two");
  const eatBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "지금 식단 평가하기" });
  lab.controls.append(clearBtn, eatBtn);

  // ── 상태 ────────────────────────────────────────────────────────────────
  const placed: Food[] = [];
  const gauge: Record<NutKey, number> = { carb: 0, protein: 0, fat: 0, vitamin: 0, mineral: 0, water: 0 };
  const shown: Record<NutKey, number> = { carb: 0, protein: 0, fat: 0, vitamin: 0, mineral: 0, water: 0 };
  let selected: Food | null = null;
  let dragPos: { x: number; y: number } | null = null;
  let downAt: { x: number; y: number } | null = null;
  let warn = "";
  let warnUntil = 0;

  const images = new Map<string, HTMLImageElement>();
  const failed = new Set<string>();
  for (const f of FOODS) {
    const img = new Image();
    img.addEventListener("error", () => failed.add(f.id));
    img.src = anAsset(`food/${f.id}.webp`);
    images.set(f.id, img);
  }

  function recompute(): void {
    for (const n of NUTS) gauge[n.key] = 0;
    for (const f of placed) {
      for (const [k, v] of Object.entries(f.nut) as [NutKey, number][]) {
        gauge[k] = Math.min(100, gauge[k] + v);
      }
    }
  }

  function filledCount(): number {
    return NUTS.filter((n) => gauge[n.key] >= FILLED).length;
  }

  function checkGoals(): void {
    const carbOnly = gauge.carb >= 80 && NUTS.every((n) => n.key === "carb" || gauge[n.key] === 0);
    if (carbOnly && !lab.has("only")) {
      lab.collect("only", "에너지만 가득");
      setWarn("탄수화물만 가득! 에너지는 넘치는데 몸을 만들고 조절할 재료가 텅 비었어요.");
      lab.setHelper("보이나요? <b>탄수화물 게이지만 꽉</b> 차고 나머지는 0이에요. 이제 <b>식판 비우기</b>를 누르고, 이번엔 <b>탄수화물·단백질·지방</b>을 하나씩 담아 봐요.");
    }
    const energy = gauge.carb >= FILLED && gauge.protein >= FILLED && gauge.fat >= FILLED;
    if (energy && lab.has("only") && !lab.has("energy")) {
      lab.collect("energy", "3대영양소 완성");
      lab.setHelper("<b>탄수화물·단백질·지방</b> — 이 셋이 에너지원으로 쓰이는 <b>3대영양소</b>예요. 이제 <b>바이타민·무기염류·물</b>까지 채워 여섯 칸을 모두 완성해 봐요.");
    }
    if (filledCount() === 6 && lab.has("energy")) lab.collect("balance", "6칸 모두 채움");
  }

  function setWarn(msg: string): void {
    warn = msg;
    warnUntil = performance.now() + 3600;
  }

  function place(f: Food): void {
    if (placed.length >= SLOTS.length) {
      setWarn("식판이 꽉 찼어요. 비우고 다시 담아 봐요.");
      return;
    }
    if (placed.some((p) => p.id === f.id)) {
      setWarn(`${f.name}은(는) 이미 식판에 있어요.`);
      return;
    }
    placed.push(f);
    recompute();
    haptic(HAPTIC.tap);
    checkGoals();
  }

  // ── 입력 ────────────────────────────────────────────────────────────────
  function pickAt(x: number, y: number): Food | null {
    for (let i = 0; i < FOODS.length; i++) {
      if (placed.some((p) => p.id === FOODS[i].id)) continue;
      const p = PICKS[i];
      if (Math.abs(x - p.x) <= ITEM_R + 4 && Math.abs(y - p.y) <= ITEM_R + 4) return FOODS[i];
    }
    return null;
  }
  const inTray = (x: number, y: number): boolean =>
    x >= TRAY.x && x <= TRAY.x + TRAY.w && y >= TRAY.y && y <= TRAY.y + TRAY.h;

  const onDown = (ev: Event): void => {
    const e = ev as PointerEvent;
    const p = canvasPoint(lab.canvas, e, BASE_W);
    if (selected && inTray(p.x, p.y)) {
      place(selected);
      selected = null;
      dragPos = null;
      return;
    }
    const hit = pickAt(p.x, p.y);
    if (!hit) return;
    capturePointer(lab.canvas, e);
    selected = hit;
    dragPos = p;
    downAt = p;
    lab.canvas.classList.add("grabbing");
  };
  const onMove = (ev: Event): void => {
    if (!selected) return;
    const e = ev as PointerEvent;
    dragPos = canvasPoint(lab.canvas, e, BASE_W);
  };
  const onUp = (ev: Event): void => {
    if (!selected) return;
    const e = ev as PointerEvent;
    const p = canvasPoint(lab.canvas, e, BASE_W);
    lab.canvas.classList.remove("grabbing");
    const moved = downAt ? Math.hypot(p.x - downAt.x, p.y - downAt.y) : 0;
    if (inTray(p.x, p.y)) {
      place(selected);
      selected = null;
      dragPos = null;
    } else if (moved < 8) {
      // 탭-탭 문법: 고른 채로 두고, 다음 탭이 식판이면 담는다(접근성·E2E 경로).
      dragPos = null;
      lab.setPill(`${selected.name} 선택됨 · 식판을 탭하세요`);
    } else {
      selected = null;
      dragPos = null;
    }
    downAt = null;
  };
  life.on(lab.canvas, "pointerdown", onDown);
  life.on(lab.canvas, "pointermove", onMove);
  life.on(lab.canvas, "pointerup", onUp);
  life.on(lab.canvas, "pointercancel", onUp);

  life.on(clearBtn, "click", () => {
    placed.length = 0;
    selected = null;
    recompute();
    haptic(HAPTIC.tap);
    setWarn("식판을 비웠어요.");
  });
  life.on(eatBtn, "click", () => {
    const n = filledCount();
    haptic(HAPTIC.tap);
    if (placed.length === 0) setWarn("아직 아무것도 담지 않았어요.");
    else if (n === 6) setWarn("완벽한 균형! 여섯 가지 영양소가 모두 들어 있어요.");
    else {
      const miss = NUTS.filter((x) => gauge[x.key] < FILLED).map((x) => x.name).join("·");
      setWarn(`${n}가지만 채워졌어요. 부족한 것: ${miss}`);
    }
  });

  // ── 그리기 ──────────────────────────────────────────────────────────────
  function drawFood(ctx: CanvasRenderingContext2D, f: Food, x: number, y: number, r: number, dim = false): void {
    const img = images.get(f.id);
    const ready = !!img && img.complete && img.naturalWidth > 0 && !failed.has(f.id);
    ctx.save();
    if (dim) ctx.globalAlpha = 0.32;
    contactShadow(ctx, x, y + r * 0.92, r * 0.72, r * 0.2, 0.18);
    if (ready) {
      ctx.drawImage(img!, x - r, y - r, r * 2, r * 2);
    } else {
      // 발주 전/로드 실패 폴백 — 대표 영양소 색 알갱이 + 이름.
      drawToken(ctx, x, y, r * 0.86, NUTS.find((n) => n.key === mainNut(f))!.mat);
    }
    ctx.font = "800 9.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = cssVar("--n0") || "#fff";
    ctx.strokeStyle = withAlpha("#0B1524", 0.72);
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.strokeText(f.name, x, y + r + 11);
    ctx.fillText(f.name, x, y + r + 11);
    ctx.restore();
  }

  function drawTray(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const g = ctx.createLinearGradient(0, TRAY.y, 0, TRAY.y + TRAY.h);
    g.addColorStop(0, "#22344E");
    g.addColorStop(1, "#16243A");
    ctx.fillStyle = g;
    roundRect(ctx, TRAY.x, TRAY.y, TRAY.w, TRAY.h, 14);
    ctx.fill();
    ctx.strokeStyle = selected ? SUBSTANCE.energy.mid : "#33506F";
    ctx.lineWidth = selected ? 2.4 : 1.4;
    ctx.stroke();
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = withAlpha("#8FA6C2", 0.32);
    ctx.lineWidth = 1;
    for (let i = 0; i < SLOTS.length; i++) {
      if (i < placed.length) continue;
      ctx.beginPath();
      ctx.arc(SLOTS[i].x, SLOTS[i].y, 22, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
    placed.forEach((f, i) => {
      if (i < SLOTS.length) drawFood(ctx, f, SLOTS[i].x, SLOTS[i].y, 21);
    });
  }

  function drawGauges(ctx: CanvasRenderingContext2D, dt: number): void {
    const x0 = 90;
    const x1 = 344;
    NUTS.forEach((n, i) => {
      const y = 194 + i * 24;
      shown[n.key] += (gauge[n.key] - shown[n.key]) * Math.min(1, dt * 0.18);
      const m = anMat(n.mat);
      ctx.save();
      ctx.font = "800 11px Pretendard, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = gauge[n.key] >= FILLED ? "#FFFFFF" : withAlpha("#FFFFFF", 0.5);
      ctx.fillText(n.name, 82, y);
      ctx.fillStyle = withAlpha("#0B1524", 0.55);
      roundRect(ctx, x0, y - 8, x1 - x0, 16, 8);
      ctx.fill();
      ctx.strokeStyle = withAlpha("#8FA6C2", 0.28);
      ctx.lineWidth = 1;
      ctx.stroke();
      const w = ((x1 - x0) * clamp(shown[n.key], 0, 100)) / 100;
      if (w > 2) {
        const g = ctx.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, m.lo);
        g.addColorStop(1, m.mid);
        ctx.fillStyle = g;
        roundRect(ctx, x0, y - 8, w, 16, 8);
        ctx.fill();
      }
      // 기준선 — 여기를 넘으면 "채워졌다".
      const bx = x0 + ((x1 - x0) * FILLED) / 100;
      ctx.strokeStyle = withAlpha("#FFFFFF", 0.42);
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(bx, y - 8);
      ctx.lineTo(bx, y + 8);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = "left";
      ctx.font = "700 9.5px Pretendard, sans-serif";
      ctx.fillStyle = withAlpha("#FFFFFF", gauge[n.key] >= FILLED ? 0.86 : 0.42);
      ctx.fillText(n.role, x0 + 6, y);
      ctx.restore();
    });
  }

  function drawPicks(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = withAlpha("#0B1524", 0.42);
    roundRect(ctx, 8, 336, 344, 126, 12);
    ctx.fill();
    ctx.restore();
    FOODS.forEach((f, i) => {
      const used = placed.some((p) => p.id === f.id);
      const p = PICKS[i];
      if (selected?.id === f.id && dragPos) return;
      drawFood(ctx, f, p.x, p.y, 20, used);
      if (selected?.id === f.id && !dragPos) {
        ctx.save();
        ctx.strokeStyle = SUBSTANCE.energy.mid;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  const loop: Loop = createLoop((dt, t) => {
    const { ctx } = fitLabCanvas(lab.canvas, BASE_W, CVH);
    ctx.save();
    ctx.fillStyle = cssVar("--stage") || "#0B1524";
    ctx.fillRect(0, 0, BASE_W, CVH);

    drawTray(ctx);
    drawGauges(ctx, dt);
    drawPicks(ctx);
    if (selected && dragPos) drawFood(ctx, selected, dragPos.x, dragPos.y, 23);

    if (warn && t < warnUntil) {
      labelChip(ctx, BASE_W / 2, 330, warn, {
        bg: withAlpha("#0B1524", 0.9),
        fg: "#FFE9A8",
        size: 10.5,
      });
    }
    ctx.restore();
    lab.setPill(selected && !dragPos ? `${selected.name} 선택됨` : `담은 음식 ${placed.length}개 · 채운 영양소 ${filledCount()}/6`);
  });

  const start = requestAnimationFrame(() => loop.start());

  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    life.dispose();
  };
};
