// anPathLab — 중2 Ⅵ L8 "순환 경로 잇기".
// 적혈구 한 개를 데리고 좌심실에서 출발해, 갈림길마다 **다음 혈관을 골라** 두 바퀴를 완주한다.
// 온몸 모세혈관에서 산소를 내려놓아 붉은색 → 푸른색, 허파 모세혈관에서 받아 다시 붉은색이 된다.
// 마지막 국면은 "산소를 적게 포함한 혈액이 흐르는 곳"을 골라내며 폐동맥 함정을 정면으로 다룬다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { buildLab, labLife } from "../../../ui/animalLab";
import {
  fitLabCanvas,
  TISSUE, VESSEL, canvasPoint, drawRBC, drawTube, labelChip, roundRect, withAlpha, cssVar,
} from "../../../ui/animalKit";
import type { StepRenderer } from "../../types";

const BASE_W = 360;
const CVH = 528;

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  /** 이 지점을 흐르는 혈액의 산소량. "swap"은 교환이 일어나는 모세혈관. */
  ox: "rich" | "poor" | "swapOut" | "swapIn";
  short: string;
}

const NODES: Node[] = [
  { id: "lv", name: "좌심실", short: "좌심실", x: 208, y: 278, ox: "rich" },
  { id: "ao", name: "대동맥", short: "대동맥", x: 296, y: 316, ox: "rich" },
  { id: "bodycap", name: "온몸의 모세혈관", short: "온몸 모세혈관", x: 236, y: 428, ox: "swapOut" },
  { id: "vc", name: "대정맥", short: "대정맥", x: 116, y: 408, ox: "poor" },
  { id: "ra", name: "우심방", short: "우심방", x: 136, y: 226, ox: "poor" },
  { id: "rv", name: "우심실", short: "우심실", x: 142, y: 282, ox: "poor" },
  { id: "pa", name: "폐동맥", short: "폐동맥", x: 62, y: 206, ox: "poor" },
  { id: "lungcap", name: "허파의 모세혈관", short: "허파 모세혈관", x: 112, y: 88, ox: "swapIn" },
  { id: "pv", name: "폐정맥", short: "폐정맥", x: 278, y: 104, ox: "rich" },
  { id: "la", name: "좌심방", short: "좌심방", x: 214, y: 224, ox: "rich" },
];

const N = (id: string): Node => NODES.find((n) => n.id === id)!;
const ORDER = ["lv", "ao", "bodycap", "vc", "ra", "rv", "pa", "lungcap", "pv", "la", "lv"];
/** 갈림길마다 정답 하나 + 오개념 미끼 하나. */
const DECOY: Record<string, string> = {
  lv: "pa", ao: "lungcap", bodycap: "ao", vc: "la", ra: "lv",
  rv: "ao", pa: "bodycap", lungcap: "vc", pv: "ra", la: "rv",
};
const WRONG_WHY: Record<string, string> = {
  pa: "폐동맥은 <b>우심실</b>에서 나가는 혈관이에요. 좌심실에서 나가는 것은 대동맥이죠.",
  lungcap: "허파의 모세혈관으로는 <b>폐동맥</b>을 지나야 갈 수 있어요. 대동맥은 온몸으로 향해요.",
  ao: "대동맥은 좌심실에서 <b>나가는</b> 길이에요. 돌아오는 길이 아니에요.",
  la: "온몸을 돈 혈액은 <b>우심방</b>으로 돌아와요. 좌심방으로는 허파에서 온 혈액이 들어오죠.",
  lv: "우심방에서 받은 혈액은 바로 아래 <b>우심실</b>로 내려가요. 좌심실로 건너갈 수는 없어요.",
  bodycap: "폐동맥은 <b>허파</b>로 가는 길이에요. 온몸으로 가는 것은 대동맥이죠.",
  vc: "허파에서 산소를 받은 혈액은 <b>폐정맥</b>을 지나 심장으로 돌아와요.",
  ra: "폐정맥은 <b>좌심방</b>으로 들어가요. 우심방으로는 대정맥이 들어오죠.",
  rv: "좌심방에서 받은 혈액은 바로 아래 <b>좌심실</b>로 내려가요.",
};
const POOR_SET = new Set(["vc", "ra", "rv", "pa"]);

export const anPathLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } };
  const life = labLife();

  const lab = buildLab(host, api, {
    title: s.title,
    lead: s.lead,
    aria: "심장과 허파, 온몸의 모세혈관을 잇는 그림에서 적혈구가 지나갈 다음 혈관을 골라 두 순환 경로를 완성하는 모형",
    height: CVH,
    goals: [
      { id: "body", title: "온몸순환", sub: "좌심실 → 우심방" },
      { id: "lung", title: "허파순환", sub: "우심실 → 좌심방" },
      { id: "oxy", title: "산소가 적은 곳", sub: "골라내기" },
    ],
    helper: "적혈구가 <b>좌심실</b>에 있어요. 다음에 지나갈 혈관을 탭해 보세요.",
    finish: "완주! <b>온몸순환</b>은 좌심실 → 대동맥 → 온몸 모세혈관 → 대정맥 → 우심방, <b>허파순환</b>은 우심실 → 폐동맥 → 허파 모세혈관 → 폐정맥 → 좌심방이에요. <b>폐동맥에는 산소가 적은 혈액</b>이, <b>폐정맥에는 산소가 많은 혈액</b>이 흘러요. 이름이 아니라 어디를 지나왔는지가 산소량을 정해요.",
    cta: s.cta ?? "개념 정리하기",
    waitingCta: "세 가지 목표를 모두 달성해 보세요",
    curio: s.curio,
  });

  lab.controls.classList.add("two");
  const resetBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "처음부터 다시" });
  const judgeBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "산소 판정 시작", style: "display:none" });
  lab.controls.append(resetBtn, judgeBtn);

  let idx = 0; // ORDER 상의 현재 위치
  let rich = true; // 지금 적혈구가 산소를 지녔는가
  let phase: "walk" | "judge" = "walk";
  const picked = new Set<string>();
  let wrongFlash = "";
  let wrongUntil = 0;
  let toast = "";
  let toastUntil = 0;
  let moveT = 1; // 0→1 이동 보간
  let fromNode = "lv";

  const say = (m: string, ms = 4200): void => { toast = m; toastUntil = performance.now() + ms; };
  const cur = (): string => ORDER[idx];
  const nextId = (): string => ORDER[idx + 1];

  function advance(): void {
    fromNode = cur();
    idx++;
    moveT = 0;
    const at = cur();
    const node = N(at);
    if (node.ox === "swapOut") { rich = false; say("온몸의 조직세포에 산소와 영양소를 주고, 이산화 탄소와 노폐물을 받았어요.", 4600); }
    else if (node.ox === "swapIn") { rich = true; say("허파에서 이산화 탄소를 내보내고 산소를 받았어요.", 4600); }
    else say(`${node.name}을(를) 지나요.`, 2600);
    haptic(HAPTIC.correct);

    if (at === "ra" && !lab.has("body")) {
      lab.collect("body", "완주");
      lab.setHelper("온몸순환 완주! <b>좌심실 → 대동맥 → 온몸 모세혈관 → 대정맥 → 우심방</b>이었죠. 이제 허파에 들러 산소를 채워 와요.");
    }
    if (at === "la" && !lab.has("lung")) {
      lab.collect("lung", "완주");
      lab.setHelper("허파순환 완주! <b>우심실 → 폐동맥 → 허파 모세혈관 → 폐정맥 → 좌심방</b>이에요. 좌심실로 돌아가면 한 바퀴가 끝나요.");
    }
    if (idx >= ORDER.length - 1) {
      phase = "judge";
      judgeBtn.style.display = "";
      lab.setHelper("한 바퀴 완성! 마지막이에요. <b>산소를 적게 포함한 혈액이 흐르는 곳</b>을 모두 탭해 보세요. 네 곳이에요.");
      say("이제 산소가 적은 혈액이 흐르는 곳을 골라내요. 네 곳이에요.", 5000);
    }
  }

  const onDown = (ev: Event): void => {
    const p = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
    const hit = NODES.find((n) => Math.hypot(p.x - n.x, p.y - n.y) <= 26);
    if (!hit) return;
    if (phase === "judge") {
      haptic(HAPTIC.tap);
      if (POOR_SET.has(hit.id)) {
        if (picked.has(hit.id)) return;
        picked.add(hit.id);
        say(`${hit.name}, 산소를 적게 포함한 혈액이 흘러요.`, 3400);
        if (picked.size === POOR_SET.size) {
          lab.collect("oxy", "네 곳 모두");
        }
      } else {
        wrongFlash = hit.id;
        wrongUntil = performance.now() + 1500;
        haptic(HAPTIC.wrong);
        say(`${hit.name}에는 산소를 <b>많이</b> 포함한 혈액이 흘러요.`.replace(/<[^>]+>/g, ""), 4000);
      }
      return;
    }
    const want = nextId();
    if (hit.id === want) { advance(); return; }
    if (hit.id === DECOY[cur()]) {
      wrongFlash = hit.id;
      wrongUntil = performance.now() + 1600;
      haptic(HAPTIC.wrong);
      say(WRONG_WHY[hit.id]?.replace(/<[^>]+>/g, "") ?? "그 길이 아니에요.", 5000);
    }
  };
  life.on(lab.canvas, "pointerdown", onDown);
  life.on(resetBtn, "click", () => {
    idx = 0; rich = true; phase = "walk"; moveT = 1; fromNode = "lv";
    picked.clear();
    judgeBtn.style.display = "none";
    haptic(HAPTIC.tap);
    say("적혈구를 좌심실로 되돌렸어요.");
  });
  life.on(judgeBtn, "click", () => {
    picked.clear();
    phase = "judge";
    haptic(HAPTIC.tap);
    say("산소가 적은 혈액이 흐르는 곳 네 곳을 탭하세요.");
  });

  // ── 그리기 ──────────────────────────────────────────────────────────────
  function edgeOx(aId: string): "rich" | "poor" {
    // 구간의 색은 "그 구간을 흐르는 혈액의 산소량"이다.
    const a = N(aId);
    if (a.ox === "swapOut") return "poor";
    if (a.ox === "swapIn") return "rich";
    return a.ox === "rich" ? "rich" : "poor";
  }

  function drawScene(ctx: CanvasRenderingContext2D, t: number): void {
    // 허파
    ctx.save();
    ctx.globalAlpha = 0.6;
    for (const dx of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(112 + dx * 34, 84, 30, 40, dx * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = TISSUE.lung.mid;
      ctx.fill();
    }
    ctx.restore();
    labelChip(ctx, 214, 46, "허파", { size: 10, bg: withAlpha(TISSUE.lung.lo, 0.9) });

    // 온몸(조직세포 덩이)
    ctx.save();
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(236 + Math.cos(a) * 44, 428 + Math.sin(a) * 26, 9, 0, Math.PI * 2);
      ctx.fillStyle = TISSUE.cell.mid;
      ctx.fill();
    }
    ctx.restore();
    labelChip(ctx, 300, 392, "조직세포", { size: 10, bg: withAlpha(TISSUE.cell.lo, 0.9) });

    // 심장 덩이
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(176, 256, 76, 62, 0, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(TISSUE.heart.lo, 0.85);
    ctx.fill();
    ctx.strokeStyle = withAlpha(TISSUE.heart.mid, 0.9);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
    labelChip(ctx, 176, 196, "심장", { size: 10, bg: withAlpha(TISSUE.heart.lo, 0.94) });

    // 경로 — 지난 구간은 진하게, 아직 안 지난 구간은 흐리게
    for (let i = 0; i < ORDER.length - 1; i++) {
      const a = N(ORDER[i]);
      const b = N(ORDER[i + 1]);
      const done = i < idx;
      ctx.save();
      ctx.globalAlpha = done ? 1 : 0.22;
      drawTube(ctx, [{ x: a.x, y: a.y }, { x: b.x, y: b.y }], done ? 9 : 7, edgeOx(ORDER[i]));
      ctx.restore();
    }

    // 노드
    for (const n of NODES) {
      const isNext = phase === "walk" && (n.id === nextId() || n.id === DECOY[cur()]);
      const isCur = n.id === cur() && phase === "walk";
      const wrong = wrongFlash === n.id && t < wrongUntil;
      const chosen = picked.has(n.id);
      ctx.save();
      const m = n.ox === "rich" ? VESSEL.rich : n.ox === "poor" ? VESSEL.poor : VESSEL.capillary;
      ctx.fillStyle = wrong
        ? withAlpha("#F04452", 0.95)
        : chosen
          ? withAlpha("#04B45F", 0.92)
          : withAlpha(m.lo, 0.94);
      ctx.beginPath();
      ctx.arc(n.x, n.y, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isCur ? "#FFE9A8" : isNext ? withAlpha("#FFFFFF", 0.66 + 0.24 * Math.sin(t / 260)) : withAlpha(m.hi, 0.5);
      ctx.lineWidth = isCur || isNext ? 2.6 : 1.2;
      ctx.stroke();
      ctx.restore();
      labelChip(ctx, n.x, n.y + 30, n.short, { size: 9, bg: withAlpha("#0B1524", 0.82) });
    }

    // 적혈구 — 현재 위치(이동 보간)
    const a = N(fromNode);
    const b = N(cur());
    const e = moveT * moveT * (3 - 2 * moveT);
    drawRBC(ctx, a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e, 9, t / 900);
    if (!rich) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = VESSEL.poor.mid;
      ctx.beginPath();
      ctx.arc(a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const loop: Loop = createLoop((dt, t) => {
    const { ctx } = fitLabCanvas(lab.canvas, BASE_W, CVH);
    ctx.save();
    ctx.fillStyle = cssVar("--stage") || "#0B1524";
    ctx.fillRect(0, 0, BASE_W, CVH);
    if (moveT < 1) moveT = Math.min(1, moveT + dt * 0.05);
    drawScene(ctx, t);

    // 하단 정보 바 — 도해를 가리지 않는 자리
    ctx.fillStyle = withAlpha("#0B1524", 0.62);
    roundRect(ctx, 8, 484, 344, 38, 12);
    ctx.fill();
    ctx.font = "800 11px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = rich ? VESSEL.rich.hi : VESSEL.poor.hi;
    ctx.fillText(rich ? "● 지금 적혈구: 산소를 많이 지님" : "● 지금 적혈구: 산소를 내려놓음", 20, 503);
    if (phase === "judge") {
      ctx.textAlign = "right";
      ctx.fillStyle = "#FFE9A8";
      ctx.fillText(`산소가 적은 곳 ${picked.size}/4`, 340, 503);
      ctx.textAlign = "left";
    }

    if (toast && t < toastUntil) {
      labelChip(ctx, BASE_W / 2, 462, toast, { size: 10, bg: withAlpha("#0B1524", 0.94), fg: "#FFE9A8" });
    }
    ctx.restore();
    lab.setPill(phase === "judge" ? `산소 판정 ${picked.size}/4` : `${N(cur()).short}`);
  });

  const start = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    life.dispose();
  };
};
