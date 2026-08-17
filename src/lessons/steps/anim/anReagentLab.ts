// anReagentLab — 중2 Ⅵ L2 "영양소 검출 실험대".
// 시약병을 끌어 시험관에 떨어뜨리면 색이 변한다. 베네딕트만 가열이 더 필요하다.
// 대조군(증류수)에서 "변화 없음"을 직접 확인하는 것이 세 번째 목표 — 탐구의 뼈대다.

import { el, clamp } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { buildLab, labLife } from "../../../ui/animalLab";
import {
  fitLabCanvas,
  anMat, capturePointer, canvasPoint, contactShadow, labelChip, roundRect, withAlpha, cssVar,
} from "../../../ui/animalKit";
import type { StepRenderer } from "../../types";

const BASE_W = 360;
const CVH = 430;

type SampleId = "water" | "rice" | "onion" | "egg" | "oil";
type ReagentId = "iodine" | "biuret" | "sudan" | "benedict";

interface Sample {
  id: SampleId;
  name: string;
  base: string;
  /** 이 시료가 실제로 반응하는 시약(검출 반응 그대로). */
  hits: ReagentId[];
}

const SAMPLES: Sample[] = [
  { id: "water", name: "증류수", base: "#DCE9F2", hits: [] },
  { id: "rice", name: "밥물", base: "#EDE6D6", hits: ["iodine"] },
  { id: "onion", name: "양파즙", base: "#EFE2B4", hits: ["benedict"] },
  { id: "egg", name: "달걀흰자액", base: "#F1ECDC", hits: ["biuret"] },
  { id: "oil", name: "식용유", base: "#EFD469", hits: ["sudan"] },
];

interface Reagent {
  id: ReagentId;
  name: string;
  short: string;
  drop: string;
  /** 양성 반응 색과 이름. */
  hit: string;
  hitName: string;
  /** 가열해야 반응이 나타난다(베네딕트). */
  needHeat?: boolean;
  finds: string;
}

const REAGENTS: Reagent[] = [
  { id: "iodine", name: "아이오딘-아이오딘화 칼륨 용액", short: "아이오딘", drop: "#8A5A1E", hit: "#2A3F91", hitName: "청람색", finds: "녹말" },
  { id: "biuret", name: "뷰렛 용액", short: "뷰렛", drop: "#4E8FD6", hit: "#7B3FA0", hitName: "보라색", finds: "단백질" },
  { id: "sudan", name: "수단 Ⅲ 용액", short: "수단 Ⅲ", drop: "#D9603E", hit: "#E8455E", hitName: "선홍색", finds: "지방" },
  { id: "benedict", name: "베네딕트 용액", short: "베네딕트", drop: "#4FA3C9", hit: "#E06A18", hitName: "황적색", needHeat: true, finds: "당분(포도당·엿당)" },
];

interface TubeState {
  reagent: ReagentId | null;
  heated: boolean;
  /** 0→1 반응 색 전환 진행도. */
  mix: number;
}

const TUBE_X = [46, 110, 174, 238, 302];
const TUBE_TOP = 118;
const TUBE_BOT = 246;
const BOTTLE_Y = 350;
const BOTTLE_X = [58, 138, 218, 298];

export const anReagentLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } };
  const life = labLife();

  const lab = buildLab(host, api, {
    title: s.title,
    lead: s.lead,
    aria: "다섯 가지 시료가 든 시험관에 네 가지 검출 시약을 떨어뜨려 색 변화를 관찰하는 실험대 모형",
    height: CVH,
    goals: [
      { id: "three", title: "세 가지 검출", sub: "녹말·단백질·지방" },
      { id: "heat", title: "가열해야 보여요", sub: "베네딕트" },
      { id: "control", title: "대조군 확인", sub: "증류수" },
    ],
    helper: "시약병을 끌어 시험관 위에 놓으면 몇 방울이 떨어져요. 먼저 <b>밥물</b>에 아이오딘 용액을 떨어뜨려 볼까요?",
    finish: "정리! <b>아이오딘 → 청람색(녹말)</b>, <b>뷰렛 → 보라색(단백질)</b>, <b>수단 Ⅲ → 선홍색(지방)</b>, <b>베네딕트 + 가열 → 황적색(당분)</b>. 아무것도 없는 증류수는 어떤 시약에도 변하지 않았죠. 그게 비교의 기준이 되어 줘요.",
    cta: s.cta ?? "개념 정리하기",
    waitingCta: "세 가지 목표를 모두 달성해 보세요",
    curio: s.curio,
  });

  lab.controls.classList.add("two");
  const heatBtn = el("button", { class: "an-btn", attrs: { type: "button" }, html: "뜨거운 물에 담그기<span class='an-btn-sub'>80~90 ℃ · 5분</span>" });
  const washBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "시험관 모두 씻기" });
  lab.controls.append(heatBtn, washBtn);

  const tubes: TubeState[] = SAMPLES.map(() => ({ reagent: null, heated: false, mix: 0 }));
  const foundBy = new Set<string>(); // "녹말"·"단백질"·"지방"
  let held: Reagent | null = null;
  let dragPos: { x: number; y: number } | null = null;
  let downAt: { x: number; y: number } | null = null;
  let drops: { x: number; y: number; vy: number; color: string; life: number }[] = [];
  let toast = "";
  let toastUntil = 0;
  let steamUntil = 0;

  const reagentOf = (id: ReagentId | null): Reagent | undefined => REAGENTS.find((r) => r.id === id);

  function say(msg: string): void {
    toast = msg;
    toastUntil = performance.now() + 3800;
  }

  function reacted(i: number): boolean {
    const t = tubes[i];
    const r = reagentOf(t.reagent);
    if (!r) return false;
    if (!SAMPLES[i].hits.includes(r.id)) return false;
    return r.needHeat ? t.heated : true;
  }

  function checkGoals(): void {
    if (foundBy.has("녹말") && foundBy.has("단백질") && foundBy.has("지방") && !lab.has("three")) {
      lab.collect("three", "세 가지 모두");
      lab.setHelper("훌륭해요! 남은 시약은 <b>베네딕트 용액</b>이에요. <b>양파즙</b>에 떨어뜨려 보고, 색이 안 변하면 <b>뜨거운 물에 담그기</b>를 눌러 보세요.");
    }
    if (foundBy.has("당분") && !lab.has("heat")) {
      lab.collect("heat", "가열 후 황적색");
      if (!lab.has("control")) {
        lab.setHelper("마지막! <b>증류수</b>에도 아무 시약이나 떨어뜨려 보세요. 아무 영양소도 없는 물은 어떻게 될까요?");
      }
    }
  }

  function pour(i: number): void {
    if (!held) return;
    const t = tubes[i];
    t.reagent = held.id;
    t.heated = false;
    t.mix = 0;
    const cx = TUBE_X[i];
    for (let d = 0; d < 3; d++) {
      drops.push({ x: cx, y: TUBE_TOP - 26 - d * 13, vy: 1.6, color: held.drop, life: 1 });
    }
    haptic(HAPTIC.tap);
    const r = held;
    life.later(() => {
      if (SAMPLES[i].hits.includes(r.id) && !r.needHeat) {
        foundBy.add(r.finds);
        say(`${SAMPLES[i].name}이(가) ${r.hitName}으로 변했어요. ${r.finds}이(가) 들어 있어요!`);
        checkGoals();
      } else if (r.needHeat) {
        say("베네딕트 용액은 그냥 두면 변하지 않아요. 뜨거운 물에 담가 볼까요?");
      } else {
        if (SAMPLES[i].id === "water") {
          if (!lab.has("control")) {
            lab.collect("control", "변화 없음 확인");
            say("증류수는 어떤 시약에도 변하지 않아요. 이게 비교의 기준(대조군)이에요.");
          }
        } else {
          say(`${SAMPLES[i].name}은(는) ${r.short}에 변하지 않았어요. ${r.finds}은(는) 없나 봐요.`);
        }
      }
    }, 640);
    held = null;
    dragPos = null;
  }

  // ── 입력 ────────────────────────────────────────────────────────────────
  function bottleAt(x: number, y: number): Reagent | null {
    for (let i = 0; i < REAGENTS.length; i++) {
      if (Math.abs(x - BOTTLE_X[i]) <= 30 && Math.abs(y - BOTTLE_Y) <= 40) return REAGENTS[i];
    }
    return null;
  }
  function tubeAt(x: number, y: number): number {
    for (let i = 0; i < TUBE_X.length; i++) {
      if (Math.abs(x - TUBE_X[i]) <= 27 && y >= TUBE_TOP - 44 && y <= TUBE_BOT + 8) return i;
    }
    return -1;
  }

  const onDown = (ev: Event): void => {
    const e = ev as PointerEvent;
    const p = canvasPoint(lab.canvas, e, BASE_W);
    if (held) {
      const t = tubeAt(p.x, p.y);
      if (t >= 0) { pour(t); return; }
    }
    const b = bottleAt(p.x, p.y);
    if (!b) return;
    capturePointer(lab.canvas, e);
    held = b;
    dragPos = p;
    downAt = p;
    lab.canvas.classList.add("grabbing");
  };
  const onMove = (ev: Event): void => {
    if (held) dragPos = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
  };
  const onUp = (ev: Event): void => {
    if (!held) return;
    const p = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
    lab.canvas.classList.remove("grabbing");
    const t = tubeAt(p.x, p.y);
    const moved = downAt ? Math.hypot(p.x - downAt.x, p.y - downAt.y) : 0;
    if (t >= 0) pour(t);
    else if (moved < 8) {
      dragPos = null; // 탭-탭: 시약을 든 채 대기
      say(`${held.short} 용액을 들었어요. 시험관을 탭하세요.`);
    } else {
      held = null;
      dragPos = null;
    }
    downAt = null;
  };
  life.on(lab.canvas, "pointerdown", onDown);
  life.on(lab.canvas, "pointermove", onMove);
  life.on(lab.canvas, "pointerup", onUp);
  life.on(lab.canvas, "pointercancel", onUp);

  life.on(heatBtn, "click", () => {
    haptic(HAPTIC.tap);
    steamUntil = performance.now() + 2600;
    let any = false;
    tubes.forEach((t, i) => {
      if (t.reagent === "benedict") {
        t.heated = true;
        any = true;
        if (SAMPLES[i].hits.includes("benedict")) {
          foundBy.add("당분");
          say(`${SAMPLES[i].name}이(가) 황적색으로 변했어요. 당분이 들어 있어요!`);
        }
      }
    });
    if (!any) say("베네딕트 용액을 넣은 시험관이 없어요. 먼저 떨어뜨려 보세요.");
    else checkGoals();
  });
  life.on(washBtn, "click", () => {
    tubes.forEach((t) => { t.reagent = null; t.heated = false; t.mix = 0; });
    held = null;
    dragPos = null;
    haptic(HAPTIC.tap);
    say("시험관을 모두 씻었어요.");
  });

  // ── 그리기 ──────────────────────────────────────────────────────────────
  function drawTube(ctx: CanvasRenderingContext2D, i: number): void {
    const x = TUBE_X[i];
    const t = tubes[i];
    const r = reagentOf(t.reagent);
    const on = reacted(i);
    const target = on && r ? r.hit : SAMPLES[i].base;
    t.mix = clamp(t.mix + (on ? 0.06 : 0), 0, 1);
    const color = on ? target : SAMPLES[i].base;

    ctx.save();
    // 유리관
    ctx.beginPath();
    ctx.moveTo(x - 16, TUBE_TOP);
    ctx.lineTo(x + 16, TUBE_TOP);
    ctx.lineTo(x + 16, TUBE_BOT - 16);
    ctx.arcTo(x + 16, TUBE_BOT, x, TUBE_BOT, 16);
    ctx.arcTo(x - 16, TUBE_BOT, x - 16, TUBE_BOT - 16, 16);
    ctx.closePath();
    const g = ctx.createLinearGradient(x - 16, 0, x + 16, 0);
    g.addColorStop(0, withAlpha("#FFFFFF", 0.2));
    g.addColorStop(0.35, withAlpha("#FFFFFF", 0.06));
    g.addColorStop(1, withAlpha("#FFFFFF", 0.16));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    ctx.clip();
    const liqTop = TUBE_TOP + 44;
    ctx.fillStyle = color;
    ctx.globalAlpha = on ? 1 : 0.92;
    ctx.fillRect(x - 16, liqTop, 32, TUBE_BOT - liqTop);
    ctx.globalAlpha = 1;
    ctx.fillStyle = withAlpha("#FFFFFF", 0.28);
    ctx.fillRect(x - 16, liqTop, 32, 3);
    ctx.restore();
    ctx.strokeStyle = withAlpha("#BBD2E4", 0.75);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = withAlpha("#DCE9F2", 0.9);
    roundRect(ctx, x - 18, TUBE_TOP - 6, 36, 7, 3.5);
    ctx.fill();
    ctx.restore();

    // 시료 이름 — 시험관 아래
    labelChip(ctx, x, TUBE_BOT + 22, SAMPLES[i].name, { size: 9.5, bg: withAlpha("#0B1524", 0.7) });
    if (r) {
      const note = on ? r.hitName : r.needHeat && !t.heated ? "가열 전" : "변화 없음";
      labelChip(ctx, x, TUBE_TOP + 24, note, {
        size: 9,
        bg: on ? withAlpha(r.hit, 0.92) : withAlpha("#0B1524", 0.66),
        fg: "#FFFFFF",
      });
    }
  }

  function drawBottle(ctx: CanvasRenderingContext2D, r: Reagent, x: number, y: number, scale = 1): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    contactShadow(ctx, 0, 34, 22, 6, 0.2);
    const g = ctx.createLinearGradient(0, -30, 0, 32);
    g.addColorStop(0, withAlpha("#FFFFFF", 0.22));
    g.addColorStop(1, withAlpha("#FFFFFF", 0.07));
    ctx.fillStyle = g;
    roundRect(ctx, -20, -14, 40, 46, 8);
    ctx.fill();
    ctx.strokeStyle = withAlpha("#BBD2E4", 0.7);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = r.drop;
    roundRect(ctx, -17, 2, 34, 27, 6);
    ctx.fill();
    ctx.fillStyle = withAlpha("#0B1524", 0.7);
    roundRect(ctx, -8, -30, 16, 18, 4);
    ctx.fill();
    ctx.restore();
    labelChip(ctx, x, y + 46, r.short, { size: 9.5, bg: withAlpha("#0B1524", 0.78) });
  }

  const loop: Loop = createLoop((dt, t) => {
    const { ctx } = fitLabCanvas(lab.canvas, BASE_W, CVH);
    ctx.save();
    ctx.fillStyle = cssVar("--stage") || "#0B1524";
    ctx.fillRect(0, 0, BASE_W, CVH);

    // 시험관대
    ctx.fillStyle = "#3A2C1C";
    roundRect(ctx, 20, TUBE_BOT - 4, 320, 14, 6);
    ctx.fill();
    ctx.fillStyle = withAlpha("#C9A876", 0.4);
    roundRect(ctx, 20, TUBE_BOT - 4, 320, 4, 2);
    ctx.fill();

    for (let i = 0; i < SAMPLES.length; i++) drawTube(ctx, i);

    // 떨어지는 방울
    drops = drops.filter((d) => d.life > 0);
    for (const d of drops) {
      d.y += d.vy * dt * 3.4;
      d.vy += 0.12 * dt;
      if (d.y > TUBE_TOP + 46) d.life = 0;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, 3.2, 4.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 가열 김
    if (t < steamUntil) {
      ctx.save();
      ctx.strokeStyle = withAlpha("#FFFFFF", 0.34);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      tubes.forEach((tu, i) => {
        if (tu.reagent !== "benedict") return;
        const x = TUBE_X[i];
        for (let n = 0; n < 3; n++) {
          const ph = ((t / 700) + n * 0.33) % 1;
          ctx.globalAlpha = 0.42 * (1 - ph);
          ctx.beginPath();
          ctx.moveTo(x - 6 + n * 6, TUBE_TOP + 30 - ph * 40);
          ctx.quadraticCurveTo(x - 1 + n * 6, TUBE_TOP + 18 - ph * 40, x - 6 + n * 6, TUBE_TOP + 8 - ph * 40);
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    // 시약 선반
    ctx.fillStyle = withAlpha("#0B1524", 0.42);
    roundRect(ctx, 8, 300, 344, 118, 12);
    ctx.fill();
    ctx.font = "800 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.62);
    ctx.fillText("검출 시약", 18, 316);
    REAGENTS.forEach((r, i) => {
      if (held?.id === r.id && dragPos) return;
      drawBottle(ctx, r, BOTTLE_X[i], BOTTLE_Y, 1);
      if (held?.id === r.id && !dragPos) {
        ctx.save();
        ctx.strokeStyle = anMat("energy").mid;
        ctx.lineWidth = 2.4;
        roundRect(ctx, BOTTLE_X[i] - 28, BOTTLE_Y - 40, 56, 92, 12);
        ctx.stroke();
        ctx.restore();
      }
    });
    if (held && dragPos) drawBottle(ctx, held, dragPos.x, dragPos.y, 1.05);

    if (toast && t < toastUntil) {
      labelChip(ctx, BASE_W / 2, 90, toast, { size: 10.5, bg: withAlpha("#0B1524", 0.92), fg: "#FFE9A8" });
    }
    ctx.restore();
    lab.setPill(held ? `${held.short} 들고 있음` : `찾은 영양소 ${foundBy.size}가지`);
  });

  const start = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    life.dispose();
  };
};
