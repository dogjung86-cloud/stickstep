// anGasSwapLab — 중2 Ⅵ L10 "기체 교환소".
// 기체 교환이 일어나는 **두 곳**을 차례로 다룬다: 허파꽈리↔모세혈관, 모세혈관↔조직세포.
// 알갱이를 잘못된 방향으로 옮기면 그 자리에서 교정된다 — 방향 혼동이 이 단원의 대표 오개념이다.
// 마지막 국면은 이산화 탄소가 몸 밖으로 나가는 순서를 짚어 호흡계·순환계의 협력을 회수한다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { buildLab, labLife } from "../../../ui/animalLab";
import {
  fitLabCanvas,
  TISSUE, VESSEL, canvasPoint, drawCellBody, drawRBC, drawToken, labelChip, roundRect, withAlpha, cssVar,
} from "../../../ui/animalKit";
import type { StepRenderer } from "../../types";

const BASE_W = 360;
const CVH = 476;

type Gas = "oxygen" | "carbon";
type Scene = 0 | 1 | 2;
const SCENE_NAME = ["허파꽈리에서", "조직세포에서", "나가는 순서"] as const;

/** 각 국면의 두 방(왼쪽·오른쪽)과, 기체가 가야 할 방향. */
const ROOMS: Record<0 | 1, { left: string; right: string; oxTo: "right" | "left"; coTo: "right" | "left" }> = {
  0: { left: "허파꽈리", right: "모세혈관", oxTo: "right", coTo: "left" },
  1: { left: "모세혈관", right: "조직세포", oxTo: "right", coTo: "left" },
};

const WHY: Record<0 | 1, Record<Gas, string>> = {
  0: {
    oxygen: "허파꽈리로 들어온 산소는 <b>모세혈관</b>으로 이동해요.",
    carbon: "혈액 속 이산화 탄소는 모세혈관에서 <b>허파꽈리</b>로 이동해 숨으로 나가요.",
  },
  1: {
    oxygen: "혈액 속 산소는 모세혈관에서 <b>조직세포</b>로 이동해요.",
    carbon: "조직세포에서 생긴 이산화 탄소는 <b>모세혈관</b>으로 이동해요.",
  },
};

interface Tok { id: string; gas: Gas; side: "left" | "right"; x: number; y: number; done: boolean }

const ORDER_CARDS = ["조직세포", "모세혈관(혈액)", "허파꽈리", "몸 밖"];

const LEFT_BOX = { x: 16, y: 92, w: 150, h: 186 };
const RIGHT_BOX = { x: 194, y: 92, w: 150, h: 186 };

export const anGasSwapLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } };
  const life = labLife();

  const lab = buildLab(host, api, {
    title: s.title,
    lead: s.lead,
    aria: "허파꽈리와 모세혈관 사이, 모세혈관과 조직세포 사이에서 산소와 이산화 탄소를 옮겨 기체 교환의 방향을 확인하는 모형",
    height: CVH,
    goals: [
      { id: "alveoli", title: "허파꽈리에서", sub: "두 방향" },
      { id: "tissue", title: "조직세포에서", sub: "두 방향" },
      { id: "route", title: "나가는 순서", sub: "이산화 탄소" },
    ],
    helper: "<b>산소</b> 알갱이를 탭해 고르고, 가야 할 곳을 탭해 옮겨 보세요. 이산화 탄소도 함께요.",
    finish: "정리됐어요! <b>허파꽈리</b>에서는 산소가 모세혈관으로, 이산화 탄소가 허파꽈리로 이동해요. <b>조직세포</b>에서는 산소가 조직세포로, 이산화 탄소가 모세혈관으로 이동하죠. 두 곳 모두 <b>모세혈관을 거쳐</b> 일어나요. 호흡계와 순환계가 함께 일하는 거예요.",
    cta: s.cta ?? "개념 정리하기",
    waitingCta: "세 가지 목표를 모두 달성해 보세요",
    curio: s.curio,
  });

  lab.controls.classList.add("two");
  const nextBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "다음 장소로" });
  const resetBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "이 장소 다시" });
  lab.controls.append(nextBtn, resetBtn);

  let scene: Scene = 0;
  let toks: Tok[] = [];
  let held: string | null = null;
  let orderIdx = 0;
  let wrongCard = -1;
  let wrongUntil = 0;
  let toast = "";
  let toastUntil = 0;

  const say = (m: string, ms = 4000): void => { toast = m; toastUntil = performance.now() + ms; };

  function build(sc: 0 | 1): void {
    const r = ROOMS[sc];
    toks = [];
    // 산소는 출발 쪽(oxTo의 반대)에, 이산화 탄소도 출발 쪽(coTo의 반대)에 놓는다.
    const oxFrom = r.oxTo === "right" ? "left" : "right";
    const coFrom = r.coTo === "right" ? "left" : "right";
    for (let i = 0; i < 2; i++) {
      const b = oxFrom === "left" ? LEFT_BOX : RIGHT_BOX;
      toks.push({ id: `o${i}`, gas: "oxygen", side: oxFrom as "left" | "right", x: b.x + 46 + i * 58, y: b.y + 66, done: false });
    }
    for (let i = 0; i < 2; i++) {
      const b = coFrom === "left" ? LEFT_BOX : RIGHT_BOX;
      toks.push({ id: `c${i}`, gas: "carbon", side: coFrom as "left" | "right", x: b.x + 46 + i * 58, y: b.y + 132, done: false });
    }
    held = null;
  }

  function setScene(sc: Scene): void {
    scene = sc;
    if (sc === 2) {
      orderIdx = 0;
      lab.setHelper("<b>이산화 탄소</b>가 몸 밖으로 나가는 순서대로 카드를 탭해 보세요. 어디에서 생겨 어디로 나갈까요?");
      say("순서대로 네 장을 탭하세요.");
    } else {
      build(sc);
      if (sc === 1) lab.setHelper("이번엔 <b>조직세포</b> 쪽이에요. 여기서는 산소와 이산화 탄소가 어느 쪽으로 갈까요?");
      say(`${SCENE_NAME[sc]}, 알갱이를 옮겨 보세요.`);
    }
    nextBtn.textContent = sc === 2 ? "처음 장소로" : "다음 장소로";
  }

  function checkScene(): void {
    if (scene === 2) return;
    if (toks.every((t) => t.done)) {
      if (scene === 0 && !lab.has("alveoli")) {
        lab.collect("alveoli", "산소 ↔ 이산화 탄소");
        lab.setHelper("허파꽈리에서의 교환 완료! <b>다음 장소로</b>를 눌러 조직세포 쪽으로 가 봐요.");
      }
      if (scene === 1 && !lab.has("tissue")) {
        lab.collect("tissue", "산소 ↔ 이산화 탄소");
        lab.setHelper("조직세포에서의 교환도 완료! 마지막으로 <b>다음 장소로</b>를 눌러 이산화 탄소가 나가는 순서를 짚어 봐요.");
      }
    }
  }

  life.on(nextBtn, "click", () => { haptic(HAPTIC.tap); setScene(((scene + 1) % 3) as Scene); });
  life.on(resetBtn, "click", () => { haptic(HAPTIC.tap); setScene(scene); });

  const onDown = (ev: Event): void => {
    const p = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
    if (scene === 2) {
      const i = ORDER_CARDS.findIndex((_, k) => p.x >= 40 && p.x <= 320 && p.y >= 106 + k * 52 && p.y <= 106 + k * 52 + 44);
      if (i < 0) return;
      haptic(HAPTIC.tap);
      if (i === orderIdx) {
        orderIdx++;
        say(`${ORDER_CARDS[i]}, 좋아요.`, 2400);
        if (orderIdx === ORDER_CARDS.length) {
          lab.collect("route", "순서 완성");
          say("이산화 탄소는 조직세포에서 생겨 혈액을 타고 허파꽈리로 가 숨으로 나가요.", 5200);
        }
      } else {
        wrongCard = i;
        wrongUntil = performance.now() + 1400;
        haptic(HAPTIC.wrong);
        say(`아직 그 차례가 아니에요. 이산화 탄소는 ${ORDER_CARDS[orderIdx]}${orderIdx === 0 ? "에서 생겨요" : "이 다음이에요"}.`, 4200);
      }
      return;
    }
    const r = ROOMS[scene as 0 | 1];
    if (held) {
      const inLeft = p.x >= LEFT_BOX.x && p.x <= LEFT_BOX.x + LEFT_BOX.w && p.y >= LEFT_BOX.y && p.y <= LEFT_BOX.y + LEFT_BOX.h;
      const inRight = p.x >= RIGHT_BOX.x && p.x <= RIGHT_BOX.x + RIGHT_BOX.w && p.y >= RIGHT_BOX.y && p.y <= RIGHT_BOX.y + RIGHT_BOX.h;
      if (!inLeft && !inRight) return;
      const target: "left" | "right" = inLeft ? "left" : "right";
      const tok = toks.find((t) => t.id === held)!;
      const want = tok.gas === "oxygen" ? r.oxTo : r.coTo;
      if (target === want) {
        const b = target === "left" ? LEFT_BOX : RIGHT_BOX;
        tok.side = target;
        tok.done = true;
        tok.x = b.x + 34 + (tok.id.endsWith("1") ? 52 : 0);
        tok.y = b.y + (tok.gas === "oxygen" ? 40 : 158);
        held = null;
        haptic(HAPTIC.correct);
        say(WHY[scene as 0 | 1][tok.gas].replace(/<[^>]+>/g, ""), 4200);
        checkScene();
      } else {
        held = null;
        haptic(HAPTIC.wrong);
        say(`방향이 반대예요. ${WHY[scene as 0 | 1][tok.gas].replace(/<[^>]+>/g, "")}`, 4800);
      }
      return;
    }
    const hit = toks.find((t) => !t.done && Math.hypot(p.x - t.x, p.y - t.y) <= 20);
    if (hit) {
      held = hit.id;
      haptic(HAPTIC.tap);
      say(`${hit.gas === "oxygen" ? "산소" : "이산화 탄소"}를 골랐어요. 갈 곳을 탭하세요.`, 2600);
    }
  };
  life.on(lab.canvas, "pointerdown", onDown);

  // ── 그리기 ──────────────────────────────────────────────────────────────
  function drawRoom(ctx: CanvasRenderingContext2D, box: typeof LEFT_BOX, name: string, kind: string, t: number): void {
    ctx.save();
    ctx.fillStyle = withAlpha("#0B1524", 0.5);
    roundRect(ctx, box.x, box.y, box.w, box.h, 14);
    ctx.fill();
    ctx.strokeStyle = held ? withAlpha("#FFE9A8", 0.8) : withAlpha("#8FA6C2", 0.28);
    ctx.lineWidth = held ? 2.2 : 1.2;
    ctx.stroke();
    ctx.restore();

    const cx = box.x + box.w / 2;
    if (kind === "허파꽈리") {
      // 포도송이 모양 얇은 주머니
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.fillStyle = withAlpha(TISSUE.lung.mid, 0.42);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 34, box.y + 112 + Math.sin(a) * 30, 24, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = withAlpha(TISSUE.lung.hi, 0.3);
      ctx.beginPath();
      ctx.arc(cx, box.y + 112, 26, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === "모세혈관") {
      ctx.strokeStyle = VESSEL.capillary.lo;
      ctx.lineWidth = 26;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(box.x + 16, box.y + 112);
      ctx.lineTo(box.x + box.w - 16, box.y + 112);
      ctx.stroke();
      ctx.strokeStyle = VESSEL.capillary.mid;
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(box.x + 16, box.y + 112);
      ctx.lineTo(box.x + box.w - 16, box.y + 112);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        drawRBC(ctx, box.x + 34 + i * 42 + Math.sin(t / 800 + i) * 3, box.y + 112, 8, i);
      }
    } else {
      for (let i = 0; i < 3; i++) {
        drawCellBody(ctx, cx + (i - 1) * 40, box.y + 112 + (i % 2 ? 16 : -16), 22, { glow: 0.4 });
      }
    }
    labelChip(ctx, cx, box.y + 18, name, { size: 10.5, bg: withAlpha("#0B1524", 0.88) });
  }

  function drawOrder(ctx: CanvasRenderingContext2D, t: number): void {
    ORDER_CARDS.forEach((c, i) => {
      const y = 106 + i * 52;
      const done = i < orderIdx;
      const wrong = wrongCard === i && t < wrongUntil;
      ctx.fillStyle = withAlpha(wrong ? "#F04452" : done ? "#04B45F" : "#0B1524", wrong || done ? 0.32 : 0.55);
      roundRect(ctx, 40, y, 280, 44, 11);
      ctx.fill();
      ctx.strokeStyle = wrong ? "#F04452" : done ? "#9BE8B6" : withAlpha("#8FA6C2", 0.3);
      ctx.lineWidth = wrong || done ? 2 : 1.2;
      ctx.stroke();
      ctx.font = "800 12px Pretendard, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(c, 62, y + 22);
      if (done) {
        ctx.textAlign = "right";
        ctx.fillStyle = "#9BE8B6";
        ctx.fillText(`${i + 1}`, 304, y + 22);
        ctx.textAlign = "left";
      }
    });
    ctx.font = "700 10.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.6);
    ctx.fillText(`순서 ${orderIdx} / ${ORDER_CARDS.length}`, BASE_W / 2, 320);
    ctx.textAlign = "left";
  }

  const loop: Loop = createLoop((_dt, t) => {
    const { ctx } = fitLabCanvas(lab.canvas, BASE_W, CVH);
    ctx.save();
    ctx.fillStyle = cssVar("--stage") || "#0B1524";
    ctx.fillRect(0, 0, BASE_W, CVH);

    // 국면 세그
    SCENE_NAME.forEach((name, i) => {
      const x = 12 + i * 113;
      const on = i === scene;
      ctx.fillStyle = on ? withAlpha(VESSEL.airway.mid, 0.92) : withAlpha("#0B1524", 0.5);
      roundRect(ctx, x, 52, 108, 30, 10);
      ctx.fill();
      ctx.strokeStyle = on ? VESSEL.airway.hi : withAlpha("#8FA6C2", 0.26);
      ctx.lineWidth = on ? 2 : 1;
      ctx.stroke();
      ctx.font = "800 11px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = on ? "#0B1524" : withAlpha("#FFFFFF", 0.55);
      ctx.fillText(name, x + 54, 67);
    });

    if (scene === 2) {
      drawOrder(ctx, t);
    } else {
      const r = ROOMS[scene as 0 | 1];
      drawRoom(ctx, LEFT_BOX, r.left, r.left, t);
      drawRoom(ctx, RIGHT_BOX, r.right, r.right, t);
      // 두 방 사이의 얇은 경계 — "벽이 매우 얇아 물질이 지나간다"
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = withAlpha("#FFFFFF", 0.28);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(180, 98);
      ctx.lineTo(180, 272);
      ctx.stroke();
      ctx.restore();
      for (const tok of toks) {
        const on = held === tok.id;
        drawToken(ctx, tok.x, tok.y, on ? 13 : 11, tok.gas, { ring: on });
        labelChip(ctx, tok.x, tok.y + 24, tok.gas === "oxygen" ? "산소" : "이산화 탄소", {
          size: 8.5, bg: withAlpha("#0B1524", 0.76),
        });
      }
      ctx.font = "700 10px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = withAlpha("#FFFFFF", 0.5);
      ctx.fillText("두 방을 가르는 벽은 아주 얇아 기체가 지나갈 수 있어요", BASE_W / 2, 296);
      ctx.textAlign = "left";
    }

    // 하단 정리 바
    ctx.fillStyle = withAlpha("#0B1524", 0.6);
    roundRect(ctx, 8, 356, 344, 104, 12);
    ctx.fill();
    ctx.font = "800 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.9);
    ctx.fillText("허파꽈리 → 모세혈관 : 산소", 20, 376);
    ctx.fillText("모세혈관 → 허파꽈리 : 이산화 탄소", 20, 398);
    ctx.fillText("모세혈관 → 조직세포 : 산소", 20, 420);
    ctx.fillText("조직세포 → 모세혈관 : 이산화 탄소", 20, 442);

    if (toast && t < toastUntil) {
      labelChip(ctx, BASE_W / 2, 340, toast, { size: 10, bg: withAlpha("#0B1524", 0.94), fg: "#FFE9A8" });
    }
    ctx.restore();
    lab.setPill(scene === 2 ? `순서 ${orderIdx}/4` : `${SCENE_NAME[scene]} ${toks.filter((x) => x.done).length}/4`);
  });

  setScene(0);
  const start = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    life.dispose();
  };
};
