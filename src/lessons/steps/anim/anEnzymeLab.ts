// anEnzymeLab — 중2 Ⅵ L4 "소화효소 공방".
// 입 → 위 → 작은창자로 이동하며, 그 기관에서 나오는 소화액을 영양소에 작용시킨다.
// 소화효소의 **특이성**(맞는 영양소에만 작용)과 쓸개즙의 정체(효소가 아니라 도우미)가 과녁.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { buildLab, labLife } from "../../../ui/animalLab";
import {
  fitLabCanvas,
  SUBSTANCE, anMat, capturePointer, canvasPoint, drawChain, drawToken,
  labelChip, roundRect, withAlpha, cssVar, contactShadow,
} from "../../../ui/animalKit";
import type { StepRenderer } from "../../types";

const BASE_W = 360;
const CVH = 472;

type Lane = "starch" | "protein" | "fat";
type Stage = 0 | 1 | 2; // 0 원래 / 1 중간 / 2 최종
type OrganId = 0 | 1 | 2;

const ORGANS = ["입", "위", "작은창자"] as const;

const LANE_Y: Record<Lane, number> = { starch: 118, protein: 178, fat: 238 };
const LANE_NAME: Record<Lane, string> = { starch: "녹말", protein: "단백질", fat: "지방" };
const STAGE_NAME: Record<Lane, [string, string, string]> = {
  starch: ["녹말", "엿당", "포도당"],
  protein: ["단백질", "중간 크기 조각", "아미노산"],
  fat: ["지방", "작은 지방 방울", "지방산 + 모노글리세라이드"],
};

interface Tool {
  id: string;
  name: string;
  organ: OrganId;
  /** 소화효소인지(아니면 염산·쓸개즙 같은 도우미). */
  enzyme: boolean;
  mat: string;
  /** 작용하는 레인과, 어느 단계에서 어느 단계로 올리는지. */
  acts?: { lane: Lane; from: Stage; to: Stage }[];
  hint: string;
}

const TOOLS: Tool[] = [
  { id: "amylase1", name: "아밀레이스", organ: 0, enzyme: true, mat: "sugar", acts: [{ lane: "starch", from: 0, to: 1 }], hint: "침 속 소화효소예요. 녹말을 엿당으로 분해해요." },
  { id: "pepsin", name: "펩신", organ: 1, enzyme: true, mat: "protein", acts: [{ lane: "protein", from: 0, to: 1 }], hint: "위액 속 소화효소예요. 단백질을 분해해요." },
  { id: "hcl", name: "염산", organ: 1, enzyme: false, mat: "mineral", hint: "소화효소가 아니에요. 펩신의 작용을 돕고 음식물 속 세균을 죽여요." },
  { id: "amylase2", name: "아밀레이스", organ: 2, enzyme: true, mat: "sugar", acts: [{ lane: "starch", from: 1, to: 2 }, { lane: "starch", from: 0, to: 1 }], hint: "이자액에도 들어 있어요. 작은창자에서 녹말 소화를 마무리해요." },
  { id: "trypsin", name: "트립신", organ: 2, enzyme: true, mat: "amino", acts: [{ lane: "protein", from: 1, to: 2 }, { lane: "protein", from: 0, to: 1 }], hint: "이자액 속 소화효소예요. 단백질을 아미노산까지 분해해요." },
  { id: "lipase", name: "라이페이스", organ: 2, enzyme: true, mat: "fatty", acts: [{ lane: "fat", from: 1, to: 2 }, { lane: "fat", from: 0, to: 2 }], hint: "이자액 속 소화효소예요. 지방을 지방산과 모노글리세라이드로 분해해요." },
  { id: "bile", name: "쓸개즙", organ: 2, enzyme: false, mat: "vitamin", acts: [{ lane: "fat", from: 0, to: 1 }], hint: "간에서 만들어 쓸개에 저장돼요. 소화효소는 없지만 지방을 잘게 흩어 소화를 도와요." },
];

const LIQUID: Record<OrganId, string> = { 0: "침", 1: "위액", 2: "이자액 · 쓸개즙" };

export const anEnzymeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } };
  const life = labLife();

  const lab = buildLab(host, api, {
    title: s.title,
    lead: s.lead,
    aria: "입, 위, 작은창자를 옮겨 다니며 소화액을 녹말·단백질·지방에 작용시키는 소화 모형",
    height: CVH,
    goals: [
      { id: "mouth", title: "입에서", sub: "녹말 → 엿당" },
      { id: "stomach", title: "위에서", sub: "단백질 분해" },
      { id: "small", title: "작은창자에서", sub: "셋 다 최종까지" },
    ],
    helper: "지금은 <b>입</b>이에요. 침 속 <b>아밀레이스</b>를 끌어 <b>녹말</b> 위에 놓아 보세요.",
    finish: "완성! 녹말은 <b>포도당</b>, 단백질은 <b>아미노산</b>, 지방은 <b>지방산과 모노글리세라이드</b>가 됐어요. 소화효소는 저마다 <b>정해진 영양소에만</b> 작용하고, 염산과 쓸개즙은 효소가 아니라 <b>돕는 물질</b>이었죠.",
    cta: s.cta ?? "개념 정리하기",
    waitingCta: "세 기관에서 소화를 마쳐 보세요",
    curio: s.curio,
  });

  lab.controls.classList.add("two");
  const nextBtn = el("button", { class: "an-btn", attrs: { type: "button" }, html: "다음 기관으로<span class='an-btn-sub'>입 → 위 → 작은창자</span>" });
  const resetBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "처음부터 다시" });
  lab.controls.append(nextBtn, resetBtn);

  let organ: OrganId = 0;
  const stage: Record<Lane, Stage> = { starch: 0, protein: 0, fat: 0 };
  const flash: Record<Lane, number> = { starch: 0, protein: 0, fat: 0 };
  let held: Tool | null = null;
  let drag: { x: number; y: number } | null = null;
  let downAt: { x: number; y: number } | null = null;
  let toast = "";
  let toastUntil = 0;

  const say = (m: string, ms = 3600): void => { toast = m; toastUntil = performance.now() + ms; };
  const tools = (): Tool[] => TOOLS.filter((t) => t.organ === organ);
  const toolPos = (i: number): { x: number; y: number } => ({ x: 62 + (i % 4) * 78, y: 338 + Math.floor(i / 4) * 74 });

  function checkGoals(): void {
    if (stage.starch >= 1 && !lab.has("mouth")) {
      lab.collect("mouth", "아밀레이스");
      lab.setHelper("녹말이 <b>엿당</b>이 됐어요! 아직 포도당은 아니에요. <b>다음 기관으로</b>를 눌러 위로 내려가 볼까요?");
    }
    if (stage.protein >= 1 && !lab.has("stomach")) {
      lab.collect("stomach", "펩신 + 염산");
    }
    if (stage.starch === 2 && stage.protein === 2 && stage.fat === 2) lab.collect("small", "최종 산물 완성");
  }

  function apply(tool: Tool, lane: Lane): void {
    const act = tool.acts?.find((a) => a.lane === lane && a.from === stage[lane]);
    if (!act) {
      haptic(HAPTIC.wrong);
      if (!tool.enzyme) say(`${tool.name}은(는) 소화효소가 아니에요. ${tool.hint}`, 4600);
      else if (!tool.acts?.some((a) => a.lane === lane)) say(`${tool.name}은(는) ${LANE_NAME[lane]}에 작용하지 않아요. 소화효소는 정해진 영양소에만 작용해요.`, 4600);
      else say(`${LANE_NAME[lane]}은(는) 지금 단계에서 ${tool.name}이(가) 작용할 수 없어요.`, 4200);
      return;
    }
    stage[lane] = act.to;
    flash[lane] = performance.now() + 900;
    haptic(HAPTIC.correct);
    say(`${tool.name} → ${STAGE_NAME[lane][act.to]}`);
    checkGoals();
  }

  function setOrgan(next: OrganId): void {
    organ = next;
    held = null;
    drag = null;
    if (next === 1) lab.setHelper("<b>위</b>예요. 위액에는 <b>펩신</b>과 <b>염산</b>이 들어 있어요. 둘 다 단백질에 놓아 보고 차이를 확인해요.");
    if (next === 2) lab.setHelper("<b>작은창자</b>예요. 이자액(아밀레이스·트립신·라이페이스)과 쓸개즙이 들어와요. 세 영양소를 <b>최종 산물</b>까지 분해해 보세요.");
    say(`${ORGANS[next]}으로 이동했어요 — ${LIQUID[next]}`);
  }

  // ── 입력 ────────────────────────────────────────────────────────────────
  function toolAt(x: number, y: number): Tool | null {
    const list = tools();
    for (let i = 0; i < list.length; i++) {
      const p = toolPos(i);
      if (Math.abs(x - p.x) <= 36 && Math.abs(y - p.y) <= 28) return list[i];
    }
    return null;
  }
  function laneAt(x: number, y: number): Lane | null {
    if (x < 8 || x > 352) return null;
    for (const lane of ["starch", "protein", "fat"] as Lane[]) {
      if (Math.abs(y - LANE_Y[lane]) <= 27) return lane;
    }
    return null;
  }

  const onDown = (ev: Event): void => {
    const e = ev as PointerEvent;
    const p = canvasPoint(lab.canvas, e, BASE_W);
    if (held) {
      const lane = laneAt(p.x, p.y);
      if (lane) { apply(held, lane); held = null; drag = null; return; }
    }
    const t = toolAt(p.x, p.y);
    if (!t) return;
    capturePointer(lab.canvas, e);
    held = t;
    drag = p;
    downAt = p;
    lab.canvas.classList.add("grabbing");
  };
  const onMove = (ev: Event): void => {
    if (held) drag = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
  };
  const onUp = (ev: Event): void => {
    if (!held) return;
    const p = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
    lab.canvas.classList.remove("grabbing");
    const lane = laneAt(p.x, p.y);
    const moved = downAt ? Math.hypot(p.x - downAt.x, p.y - downAt.y) : 0;
    if (lane) { apply(held, lane); held = null; drag = null; }
    else if (moved < 8) { drag = null; say(`${held.name}을(를) 들었어요. 영양소 줄을 탭하세요.`); }
    else { held = null; drag = null; }
    downAt = null;
  };
  life.on(lab.canvas, "pointerdown", onDown);
  life.on(lab.canvas, "pointermove", onMove);
  life.on(lab.canvas, "pointerup", onUp);
  life.on(lab.canvas, "pointercancel", onUp);
  life.on(nextBtn, "click", () => {
    haptic(HAPTIC.tap);
    setOrgan((organ === 2 ? 0 : organ + 1) as OrganId);
  });
  life.on(resetBtn, "click", () => {
    stage.starch = 0; stage.protein = 0; stage.fat = 0;
    setOrgan(0);
    haptic(HAPTIC.tap);
  });

  // ── 그리기 ──────────────────────────────────────────────────────────────
  function drawLane(ctx: CanvasRenderingContext2D, lane: Lane, t: number): void {
    const y = LANE_Y[lane];
    const st = stage[lane];
    const hot = t < flash[lane];
    ctx.save();
    ctx.fillStyle = withAlpha("#0B1524", 0.5);
    roundRect(ctx, 8, y - 27, 344, 54, 12);
    ctx.fill();
    ctx.strokeStyle = hot ? SUBSTANCE.energy.mid : withAlpha("#8FA6C2", held ? 0.5 : 0.22);
    ctx.lineWidth = hot ? 2.4 : 1.2;
    ctx.stroke();
    ctx.restore();

    labelChip(ctx, 44, y, STAGE_NAME[lane][st], { size: 10, bg: withAlpha("#0B1524", 0.85) });

    // 분해 정도를 그림으로 — 단계가 오를수록 사슬이 짧아지고 개수가 는다.
    ctx.save();
    ctx.translate(96, y);
    if (lane === "fat") {
      if (st === 0) {
        ctx.save();
        const g = ctx.createRadialGradient(30, -4, 4, 36, 0, 30);
        g.addColorStop(0, SUBSTANCE.fat.hi);
        g.addColorStop(1, SUBSTANCE.fat.lo);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(40, 0, 30, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = SUBSTANCE.fat.lo;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
      } else if (st === 1) {
        for (let i = 0; i < 7; i++) drawToken(ctx, 16 + i * 17, (i % 2 ? 7 : -7), 8, "fat");
      } else {
        for (let i = 0; i < 5; i++) drawToken(ctx, 14 + i * 20, -9, 6.5, "fatty");
        for (let i = 0; i < 5; i++) drawToken(ctx, 24 + i * 20, 9, 6.5, "fatty");
      }
    } else {
      const key = lane === "starch" ? ["starch", "sugar", "sugar"][st] : ["protein", "protein", "amino"][st];
      if (st === 0) drawChain(ctx, 82, 0, 9, 7, key);
      else if (st === 1) {
        drawChain(ctx, 34, 0, 8, 3, key);
        drawChain(ctx, 100, 0, 8, 3, key);
        drawChain(ctx, 166, 0, 8, 2, key);
      } else {
        for (let i = 0; i < 9; i++) drawToken(ctx, 12 + i * 21, (i % 2 ? 6 : -6), 7.5, key);
      }
    }
    ctx.restore();
  }

  function drawTool(ctx: CanvasRenderingContext2D, tool: Tool, x: number, y: number, scale = 1): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    contactShadow(ctx, 0, 26, 30, 6, 0.2);
    const m = anMat(tool.mat);
    const g = ctx.createLinearGradient(0, -24, 0, 24);
    g.addColorStop(0, m.mid);
    g.addColorStop(1, m.lo);
    ctx.fillStyle = g;
    roundRect(ctx, -34, -24, 68, 46, 11);
    ctx.fill();
    ctx.strokeStyle = tool.enzyme ? m.hi : "#FFFFFF";
    ctx.lineWidth = tool.enzyme ? 1.6 : 2;
    if (!tool.enzyme) ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "800 11px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(tool.name, 0, -4);
    ctx.font = "700 8.5px Pretendard, sans-serif";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.78);
    ctx.fillText(tool.enzyme ? "소화효소" : "도우미", 0, 11);
    ctx.restore();
  }

  const loop: Loop = createLoop((_dt, t) => {
    const { ctx } = fitLabCanvas(lab.canvas, BASE_W, CVH);
    ctx.save();
    ctx.fillStyle = cssVar("--stage") || "#0B1524";
    ctx.fillRect(0, 0, BASE_W, CVH);

    // 기관 세그
    ORGANS.forEach((name, i) => {
      const x = 12 + i * 113;
      const on = i === organ;
      ctx.fillStyle = on ? withAlpha(SUBSTANCE.starch.mid, 0.9) : withAlpha("#0B1524", 0.55);
      roundRect(ctx, x, 52, 108, 32, 10);
      ctx.fill();
      ctx.strokeStyle = on ? SUBSTANCE.starch.hi : withAlpha("#8FA6C2", 0.28);
      ctx.lineWidth = on ? 2 : 1;
      ctx.stroke();
      ctx.font = "800 12px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = on ? "#2A1A06" : withAlpha("#FFFFFF", 0.6);
      ctx.fillText(name, x + 54, 68);
    });

    for (const lane of ["starch", "protein", "fat"] as Lane[]) drawLane(ctx, lane, t);

    // 소화액 선반
    ctx.fillStyle = withAlpha("#0B1524", 0.44);
    roundRect(ctx, 8, 278, 344, 186, 12);
    ctx.fill();
    ctx.font = "800 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.62);
    ctx.fillText(`${ORGANS[organ]}에서 나오는 소화액 — ${LIQUID[organ]}`, 18, 298);
    tools().forEach((tool, i) => {
      if (held?.id === tool.id && drag) return;
      const p = toolPos(i);
      drawTool(ctx, tool, p.x, p.y, held?.id === tool.id ? 1.05 : 1);
    });
    if (held && drag) drawTool(ctx, held, drag.x, drag.y, 1.08);

    if (toast && t < toastUntil) {
      labelChip(ctx, BASE_W / 2, 270, toast, { size: 10, bg: withAlpha("#0B1524", 0.93), fg: "#FFE9A8" });
    }
    ctx.restore();
    lab.setPill(held ? `${held.name} 들고 있음` : `${ORGANS[organ]} · 최종 분해 ${["starch", "protein", "fat"].filter((l) => stage[l as Lane] === 2).length}/3`);
  });

  const start = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    life.dispose();
  };
};
