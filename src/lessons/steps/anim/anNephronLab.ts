// anNephronLab — 중2 Ⅵ L11 "콩팥단위 여과실". 여과 → 재흡수 → 분비를 순서대로 손으로 옮긴다.
// 과학 규칙(위반 금지): 여과막은 **크기로** 막는다(혈구·단백질은 여과되지 않는다),
// 포도당·아미노산은 **전부 재흡수**되어 정상 오줌에는 없다, 분비는 모세혈관 → 세뇨관 방향이다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { buildLab, labLife } from "../../../ui/animalLab";
import {
  fitLabCanvas,
  VESSEL, SUBSTANCE, canvasPoint, drawRBC, drawToken, drawTube, labelChip, roundRect, withAlpha, cssVar,
} from "../../../ui/animalKit";
import type { StepRenderer } from "../../types";

const BASE_W = 360;
const CVH = 500;

type Where = "glom" | "bowman" | "tubule" | "cap";
type Phase = 0 | 1 | 2;
const PHASE_NAME = ["여과", "재흡수", "분비"] as const;

interface Part {
  id: string;
  name: string;
  mat: string;
  /** 크기가 커서 여과되지 않는가. */
  big: boolean;
  /** 몸에 필요해 전부 재흡수되는가. */
  reabsorb: boolean;
  where: Where;
  x: number;
  y: number;
}

// 알갱이 라벨이 서로 겹치지 않도록 혈액 쪽 알갱이는 **왼쪽 세로 열**에 세우고 라벨은 오른쪽으로 뺀다.
const TRAY = { x: 10, y: 58, w: 130, h: 206 };
const trayPos = (i: number): { x: number; y: number } => ({ x: 36, y: 78 + i * 26 });
const GLOM = { x: 210, y: 104 };
const BOWMAN = { x: 276, y: 104, r: 32 };
const TUBULE_Y = 248;
const CAP_Y = 316;
const LANE = { x0: 150, x1: 338 };

function seed(): Part[] {
  const P = (i: number, id: string, name: string, mat: string, big: boolean, reabsorb: boolean): Part => ({
    id, name, mat, big, reabsorb, where: "glom", ...trayPos(i),
  });
  return [
    P(0, "glu", "포도당", "sugar", false, true),
    P(1, "amino", "아미노산", "amino", false, true),
    P(2, "water", "물", "water", false, true),
    P(3, "min", "무기염류", "mineral", false, false),
    P(4, "urea", "요소", "urea", false, false),
    P(5, "rbc", "혈구", "rich", true, false),
    P(6, "prot", "단백질", "protein", true, false),
    // 여과되지 않고 혈액에 남은 노폐물 — 분비 국면의 주인공
    { id: "urea2", name: "요소", mat: "urea", big: false, reabsorb: false, where: "cap", x: 300, y: CAP_Y },
  ];
}

export const anNephronLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } };
  const life = labLife();

  const lab = buildLab(host, api, {
    title: s.title,
    lead: s.lead,
    aria: "콩팥단위의 토리와 보먼주머니, 세뇨관, 모세혈관 사이로 물질을 옮겨 여과·재흡수·분비를 확인하는 모형",
    height: CVH,
    goals: [
      { id: "filter", title: "여과", sub: "작은 것만" },
      { id: "reabsorb", title: "재흡수", sub: "필요한 것 되돌리기" },
      { id: "secrete", title: "분비", sub: "남은 노폐물" },
    ],
    helper: "<b>토리</b>의 물질을 탭해 고르고 <b>보먼주머니</b>를 탭해 밀어 보내요. 큰 물질도 한번 시도해 보세요.",
    finish: "정리됐어요! <b>여과</b>는 크기가 작은 물질만 토리에서 보먼주머니로 빠져나가요(혈구·단백질은 남아요). <b>재흡수</b>는 포도당·아미노산·물처럼 몸에 필요한 것을 세뇨관에서 모세혈관으로 되돌려요. <b>분비</b>는 혈액에 남아 있던 노폐물을 모세혈관에서 세뇨관으로 보내요. 그래서 정상 오줌에는 <b>포도당과 단백질이 없어요</b>.",
    cta: s.cta ?? "개념 정리하기",
    waitingCta: "세 가지 목표를 모두 달성해 보세요",
    curio: s.curio,
  });

  lab.controls.classList.add("two");
  const nextBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "다음 단계" });
  const resetBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "처음부터 다시" });
  lab.controls.append(nextBtn, resetBtn);

  let phase: Phase = 0;
  let parts = seed();
  let held: string | null = null;
  let bumped = false;
  let toast = "";
  let toastUntil = 0;

  const say = (m: string, ms = 4200): void => { toast = m; toastUntil = performance.now() + ms; };
  const P = (id: string): Part => parts.find((p) => p.id === id)!;

  function layout(p: Part): void {
    // 국면·위치에 따라 알갱이를 정렬해 둔다(겹침 방지).
    const sameWhere = parts.filter((x) => x.where === p.where && x.id !== "urea2");
    const i = sameWhere.indexOf(p);
    // 정렬 목록에 없는 알갱이(혈액에 남은 요소)는 제 자리를 지킨다 —
    // indexOf가 -1이면 x가 음수 쪽으로 튀어 화면 밖으로 사라진다(실제로 겪은 버그).
    if (i < 0) return;
    if (p.where === "bowman") { p.x = BOWMAN.x + 6; p.y = 70 + i * 20; }
    else if (p.where === "tubule") { p.x = LANE.x0 + 26 + i * 34; p.y = TUBULE_Y; }
    else if (p.where === "cap") { p.x = LANE.x0 + 26 + i * 34; p.y = CAP_Y; }
  }

  function setPhase(ph: Phase): void {
    phase = ph;
    held = null;
    if (ph === 1) {
      // 여과된 액체가 세뇨관으로 내려간다
      for (const p of parts) if (p.where === "bowman") p.where = "tubule";
      parts.filter((p) => p.where === "tubule").forEach(layout);
      lab.setHelper("여과된 액체가 <b>세뇨관</b>을 지나요. 몸에 <b>필요한</b> 물질을 골라 <b>모세혈관</b>으로 되돌려 보내세요.");
      say("재흡수 단계 — 필요한 것만 되돌려요.");
    } else if (ph === 2) {
      lab.setHelper("마지막이에요. <b>모세혈관에 남아 있던 요소</b>를 탭해 <b>세뇨관</b>으로 보내세요.");
      say("분비 단계 — 혈액에 남은 노폐물을 세뇨관으로.");
    } else {
      lab.setHelper("<b>토리</b>의 물질을 탭해 고르고 <b>보먼주머니</b>를 탭해 밀어 보내요.");
      say("여과 단계 — 크기가 작은 물질만 빠져나가요.");
    }
    nextBtn.textContent = ph === 2 ? "처음 단계로" : "다음 단계";
  }

  life.on(nextBtn, "click", () => {
    haptic(HAPTIC.tap);
    if (phase === 0 && !lab.has("filter")) { say("작은 물질 5개를 모두 보먼주머니로 보낸 뒤 넘어가요."); return; }
    if (phase === 1 && !lab.has("reabsorb")) { say("포도당·아미노산·물을 모세혈관으로 되돌린 뒤 넘어가요."); return; }
    setPhase(((phase + 1) % 3) as Phase);
  });
  life.on(resetBtn, "click", () => { parts = seed(); bumped = false; haptic(HAPTIC.tap); setPhase(0); });

  const onDown = (ev: Event): void => {
    const p = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
    const inBowman = Math.hypot(p.x - BOWMAN.x, p.y - BOWMAN.y) <= BOWMAN.r + 12;
    const inTubule = p.x >= LANE.x0 && p.x <= LANE.x1 && Math.abs(p.y - TUBULE_Y) <= 26;
    const inCap = p.x >= LANE.x0 && p.x <= LANE.x1 && Math.abs(p.y - CAP_Y) <= 26;

    if (held) {
      const tok = P(held);
      if (phase === 0 && inBowman) {
        if (tok.big) {
          bumped = true;
          held = null;
          haptic(HAPTIC.wrong);
          say(`${tok.name}은(는) 크기가 커서 여과되지 않아요. 혈액에 그대로 남아요.`, 4800);
          return;
        }
        tok.where = "bowman";
        parts.filter((x) => x.where === "bowman").forEach(layout);
        held = null;
        haptic(HAPTIC.correct);
        const small = parts.filter((x) => !x.big && x.id !== "urea2");
        if (small.every((x) => x.where === "bowman")) {
          if (bumped) {
            lab.collect("filter", "작은 것만 통과");
            lab.setHelper("여과 완료! <b>혈구와 단백질은 크기가 커서 여과되지 않아요</b>. <b>다음 단계</b>를 눌러 재흡수로 가요.");
          } else {
            say("작은 물질은 모두 여과됐어요. 큰 물질(혈구·단백질)도 한번 보내 보세요 — 어떻게 될까요?", 5200);
          }
        } else say(`${tok.name}이(가) 보먼주머니로 여과됐어요.`, 3000);
        return;
      }
      if (phase === 1 && inCap) {
        if (tok.where !== "tubule") { held = null; return; }
        if (!tok.reabsorb) {
          held = null;
          haptic(HAPTIC.wrong);
          say(`${tok.name}은(는) 몸이 내보내야 하는 쪽이라 재흡수하지 않아요. 오줌으로 나가야 해요.`, 4800);
          return;
        }
        tok.where = "cap";
        parts.filter((x) => x.where === "cap").forEach(layout);
        held = null;
        haptic(HAPTIC.correct);
        const need = parts.filter((x) => x.reabsorb);
        if (need.every((x) => x.where === "cap")) {
          lab.collect("reabsorb", "전부 되돌림");
          lab.setHelper("재흡수 완료! 포도당과 아미노산은 <b>전부</b> 되돌려져요. 그래서 정상 오줌에는 포도당이 없어요. <b>다음 단계</b>를 눌러요.");
        } else say(`${tok.name}을(를) 모세혈관으로 재흡수했어요.`, 3000);
        return;
      }
      if (phase === 2 && inTubule) {
        if (tok.id !== "urea2") {
          held = null;
          haptic(HAPTIC.wrong);
          say("분비는 <b>혈액에 남아 있던 노폐물</b>을 세뇨관으로 보내는 과정이에요.".replace(/<[^>]+>/g, ""), 4400);
          return;
        }
        tok.where = "tubule";
        parts.filter((x) => x.where === "tubule").forEach(layout);
        held = null;
        haptic(HAPTIC.correct);
        lab.collect("secrete", "요소를 세뇨관으로");
        say("분비 완료! 세뇨관에 남은 액체가 오줌이 되어 콩팥깔때기로 모여요.", 5000);
        return;
      }
      held = null;
      return;
    }

    const pickable = parts.filter((x) => {
      if (phase === 0) return x.where === "glom";
      if (phase === 1) return x.where === "tubule";
      return x.where === "cap";
    });
    const hit = pickable.find((x) => Math.hypot(p.x - x.x, p.y - x.y) <= 18);
    if (hit) {
      held = hit.id;
      haptic(HAPTIC.tap);
      say(`${hit.name}을(를) 골랐어요. ${phase === 0 ? "보먼주머니" : phase === 1 ? "모세혈관" : "세뇨관"}을 탭하세요.`, 2800);
    }
  };
  life.on(lab.canvas, "pointerdown", onDown);

  // ── 그리기 ──────────────────────────────────────────────────────────────
  function drawNephron(ctx: CanvasRenderingContext2D, t: number): void {
    // 콩팥동맥 → 토리 → 콩팥정맥
    drawTube(ctx, [{ x: 156, y: 62 }, { x: 190, y: 88 }], 11, "rich");
    drawTube(ctx, [{ x: 190, y: 120 }, { x: 156, y: 146 }], 11, "poor");

    // 보먼주머니 — 토리를 감싸는 컵
    ctx.save();
    ctx.strokeStyle = withAlpha("#F3EFDD", 0.9);
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(BOWMAN.x - 20, BOWMAN.y, BOWMAN.r, Math.PI * 0.62, Math.PI * 1.38, true);
    ctx.stroke();
    ctx.restore();
    labelChip(ctx, BOWMAN.x + 30, BOWMAN.y - 42, "보먼주머니", { size: 9, bg: withAlpha("#8A7A2A", 0.9) });

    // 토리 — 모세혈관이 실뭉치처럼 뭉친 부분
    ctx.save();
    ctx.strokeStyle = VESSEL.capillary.lo;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(GLOM.x + Math.cos(a) * 8, GLOM.y + Math.sin(a) * 8, 15, a, a + Math.PI * 1.5);
      ctx.stroke();
    }
    ctx.strokeStyle = VESSEL.capillary.mid;
    ctx.lineWidth = 4;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(GLOM.x + Math.cos(a) * 8, GLOM.y + Math.sin(a) * 8, 15, a, a + Math.PI * 1.5);
      ctx.stroke();
    }
    ctx.restore();
    labelChip(ctx, GLOM.x - 4, GLOM.y - 40, "토리", { size: 9, bg: withAlpha(VESSEL.capillary.lo, 0.92) });

    // 세뇨관 — 오줌이 흐르는 관
    const hotT = phase === 0 ? false : true;
    ctx.save();
    ctx.globalAlpha = hotT ? 1 : 0.5;
    drawTube(ctx, [{ x: LANE.x0, y: TUBULE_Y }, { x: LANE.x1, y: TUBULE_Y }], 26, "tubule");
    ctx.restore();
    labelChip(ctx, 178, TUBULE_Y - 28, "세뇨관", { size: 9.5, bg: withAlpha("#8A6A18", 0.92) });
    // 보먼주머니 → 세뇨관 연결
    drawTube(ctx, [{ x: BOWMAN.x + 10, y: BOWMAN.y + 26 }, { x: 300, y: 190 }, { x: LANE.x0 + 24, y: TUBULE_Y - 14 }], 12, "tubule");

    // 세뇨관을 둘러싼 모세혈관
    ctx.save();
    ctx.globalAlpha = phase === 0 ? 0.5 : 1;
    drawTube(ctx, [{ x: LANE.x0, y: CAP_Y }, { x: LANE.x1, y: CAP_Y }], 22, "capillary");
    ctx.restore();
    labelChip(ctx, 240, CAP_Y + 30, "세뇨관을 둘러싼 모세혈관", { size: 9, bg: withAlpha(VESSEL.capillary.lo, 0.92) });

    // 오줌이 나가는 쪽
    labelChip(ctx, 300, TUBULE_Y - 28, "→ 콩팥깔때기", { size: 8.5, bg: withAlpha("#0B1524", 0.82) });

    // 이동 방향 화살표 안내
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = withAlpha("#FFE9A8", held ? 0.9 : 0.32);
    ctx.lineWidth = 2;
    if (phase === 0) { ctx.beginPath(); ctx.moveTo(GLOM.x + 22, GLOM.y); ctx.lineTo(BOWMAN.x + 4, GLOM.y); ctx.stroke(); }
    if (phase === 1) { ctx.beginPath(); ctx.moveTo(210, TUBULE_Y + 20); ctx.lineTo(210, CAP_Y - 18); ctx.stroke(); }
    if (phase === 2) { ctx.beginPath(); ctx.moveTo(300, CAP_Y - 18); ctx.lineTo(300, TUBULE_Y + 20); ctx.stroke(); }
    ctx.restore();

    // 혈액 쪽 트레이(여과 대기 알갱이) — 라벨을 오른쪽으로 빼 서로 겹치지 않게
    ctx.save();
    ctx.fillStyle = withAlpha("#2A1420", 0.55);
    roundRect(ctx, TRAY.x, TRAY.y, TRAY.w, TRAY.h, 12);
    ctx.fill();
    ctx.strokeStyle = withAlpha("#8FA6C2", 0.24);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    labelChip(ctx, TRAY.x + 48, TRAY.y - 9, "콩팥으로 온 혈액", { size: 9, bg: withAlpha(VESSEL.rich.lo, 0.9) });

    // 알갱이
    for (const p of parts) {
      const on = held === p.id;
      if (p.id === "rbc") drawRBC(ctx, p.x, p.y, on ? 11 : 9, t / 900);
      else drawToken(ctx, p.x, p.y, on ? 12 : 10, p.mat, { ring: on });
      if (p.where === "glom") labelChip(ctx, p.x + 16, p.y, p.name, { size: 8.5, bg: withAlpha("#0B1524", 0.8), align: "left" });
      else labelChip(ctx, p.x, p.y - 20, p.name, { size: 8, bg: withAlpha("#0B1524", 0.78) });
    }
  }

  const loop: Loop = createLoop((_dt, t) => {
    const { ctx } = fitLabCanvas(lab.canvas, BASE_W, CVH);
    ctx.save();
    ctx.fillStyle = cssVar("--stage") || "#0B1524";
    ctx.fillRect(0, 0, BASE_W, CVH);

    PHASE_NAME.forEach((name, i) => {
      const x = 12 + i * 113;
      const on = i === phase;
      ctx.fillStyle = on ? withAlpha(SUBSTANCE.urea.mid, 0.92) : withAlpha("#0B1524", 0.5);
      roundRect(ctx, x, 14, 108, 30, 10);
      ctx.fill();
      ctx.strokeStyle = on ? SUBSTANCE.urea.hi : withAlpha("#8FA6C2", 0.26);
      ctx.lineWidth = on ? 2 : 1;
      ctx.stroke();
      ctx.font = "800 11.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = on ? "#231F05" : withAlpha("#FFFFFF", 0.55);
      ctx.fillText(`${i + 1}. ${name}`, x + 54, 29);
    });

    drawNephron(ctx, t);

    // 하단 정리 바
    ctx.fillStyle = withAlpha("#0B1524", 0.62);
    roundRect(ctx, 8, 380, 344, 106, 12);
    ctx.fill();
    ctx.font = "800 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.9);
    ctx.fillText("여과  토리 → 보먼주머니 (작은 물질만)", 20, 400);
    ctx.fillText("재흡수  세뇨관 → 모세혈관 (필요한 물질)", 20, 422);
    ctx.fillText("분비  모세혈관 → 세뇨관 (남은 노폐물)", 20, 444);
    ctx.fillStyle = withAlpha("#FFE9A8", 0.92);
    ctx.fillText("정상 오줌에는 포도당·단백질이 없어요", 20, 468);

    if (toast && t < toastUntil) {
      labelChip(ctx, BASE_W / 2, 362, toast, { size: 10, bg: withAlpha("#0B1524", 0.94), fg: "#FFE9A8" });
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
