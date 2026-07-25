// anEnergyLab — 중2 Ⅵ L12 "기관계 관제실"(피날레).
// 네 기관계와 조직세포 사이로 물질을 배달한다. **모든 물질은 순환계를 거친다** — 지름길을 시도하면 교정된다.
// 영양소와 산소가 조직세포에 모두 닿는 순간 세포호흡이 일어나 에너지가 나오고, 이산화 탄소와 요소가 생긴다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { buildLab, labLife } from "../../../ui/animalLab";
import {
  fitLabCanvas,
  TISSUE, VESSEL, SUBSTANCE, canvasPoint, drawCellBody, drawToken, labelChip, roundRect, withAlpha, cssVar,
} from "../../../ui/animalKit";
import type { StepRenderer } from "../../types";

const BASE_W = 360;
const CVH = 512;

type SId = "dig" | "resp" | "circ" | "exc" | "cell";

const STATIONS: { id: SId; name: string; x: number; y: number; r: number; tone: string }[] = [
  { id: "resp", name: "호흡계", x: 180, y: 84, r: 38, tone: "airway" },
  { id: "dig", name: "소화계", x: 62, y: 196, r: 38, tone: "gut" },
  { id: "circ", name: "순환계", x: 180, y: 210, r: 44, tone: "heart" },
  { id: "exc", name: "배설계", x: 298, y: 196, r: 38, tone: "kidney" },
  { id: "cell", name: "조직세포", x: 180, y: 344, r: 42, tone: "cell" },
];
const ST = (id: SId): (typeof STATIONS)[number] => STATIONS.find((x) => x.id === id)!;

interface Mat {
  id: string;
  name: string;
  mat: string;
  route: SId[];
  step: number; // 지금 route의 몇 번째에 있는가
  born: boolean; // 세포호흡 뒤에 생기는가
}

const START: Mat[] = [
  { id: "nut", name: "영양소", mat: "sugar", route: ["dig", "circ", "cell"], step: 0, born: false },
  { id: "oxy", name: "산소", mat: "oxygen", route: ["resp", "circ", "cell"], step: 0, born: false },
  { id: "co2", name: "이산화 탄소", mat: "carbon", route: ["cell", "circ", "resp"], step: 0, born: true },
  { id: "urea", name: "요소", mat: "urea", route: ["cell", "circ", "exc"], step: 0, born: true },
];

const USES = ["체온 유지", "성장", "근육 운동", "정신 활동", "소리 내기"];

export const anEnergyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } };
  const life = labLife();

  const lab = buildLab(host, api, {
    title: s.title,
    lead: s.lead,
    aria: "소화계·호흡계·순환계·배설계와 조직세포 사이로 물질을 옮겨 세포호흡에 필요한 협력을 완성하는 관제실 모형",
    height: CVH,
    goals: [
      { id: "deliver", title: "배달", sub: "영양소·산소" },
      { id: "burn", title: "세포호흡", sub: "에너지 발생" },
      { id: "clear", title: "내보내기", sub: "이산화 탄소·요소" },
    ],
    helper: "<b>영양소</b>를 탭해 고르고, 다음에 거칠 곳을 탭해 조직세포까지 배달해 보세요.",
    finish: "완성! 소화계가 준 <b>영양소</b>와 호흡계가 준 <b>산소</b>가 <b>순환계</b>를 타고 조직세포에 닿으면 <b>세포호흡</b>이 일어나 에너지가 나와요. 그때 생긴 <b>이산화 탄소</b>는 호흡계로, <b>요소</b>는 배설계로 순환계를 통해 운반되어 몸 밖으로 나가죠. 네 기관계가 함께 일해야 우리는 살아갈 수 있어요.",
    cta: s.cta ?? "개념 정리하기",
    waitingCta: "세 가지 목표를 모두 달성해 보세요",
    curio: s.curio,
  });

  lab.controls.classList.add("two");
  const resetBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "처음부터 다시" });
  const useBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "에너지는 어디에 쓰일까?", style: "display:none" });
  lab.controls.append(resetBtn, useBtn);

  let mats: Mat[] = START.map((m) => ({ ...m }));
  let held: string | null = null;
  let burned = false;
  let burnT = 0;
  let showUses = false;
  let toast = "";
  let toastUntil = 0;

  const say = (m: string, ms = 4200): void => { toast = m; toastUntil = performance.now() + ms; };
  const at = (m: Mat): SId => m.route[m.step];
  const active = (): Mat[] => mats.filter((m) => !m.born || burned);

  function matPos(m: Mat): { x: number; y: number } {
    const st = ST(at(m));
    const peers = active().filter((x) => at(x) === st.id);
    const i = peers.indexOf(m);
    const n = Math.max(1, peers.length);
    const spread = (i - (n - 1) / 2) * 30;
    return { x: st.x + spread, y: st.y + st.r + 16 };
  }

  function checkBurn(): void {
    const nut = mats.find((m) => m.id === "nut")!;
    const oxy = mats.find((m) => m.id === "oxy")!;
    if (!burned && at(nut) === "cell" && at(oxy) === "cell") {
      burned = true;
      burnT = performance.now();
      useBtn.style.display = "";
      lab.collect("deliver", "조직세포 도착");
      lab.collect("burn", "에너지 발생");
      lab.setHelper("<b>세포호흡</b>이 일어났어요! 에너지가 나오고 <b>이산화 탄소</b>와 <b>요소</b>가 생겼어요. 이 둘을 순환계를 통해 각각 <b>호흡계</b>와 <b>배설계</b>로 보내 주세요.");
      say("세포호흡! 영양소 + 산소 → 에너지 + 이산화 탄소 + 물", 5200);
      haptic(HAPTIC.done);
    }
  }

  function checkClear(): void {
    const co2 = mats.find((m) => m.id === "co2")!;
    const urea = mats.find((m) => m.id === "urea")!;
    if (burned && at(co2) === "resp" && at(urea) === "exc") lab.collect("clear", "몸 밖으로");
  }

  life.on(resetBtn, "click", () => {
    mats = START.map((m) => ({ ...m }));
    held = null; burned = false; showUses = false;
    useBtn.style.display = "none";
    haptic(HAPTIC.tap);
    say("물질을 처음 자리로 되돌렸어요.");
  });
  life.on(useBtn, "click", () => {
    showUses = !showUses;
    useBtn.classList.toggle("on", showUses);
    haptic(HAPTIC.tap);
    say(showUses ? "세포호흡으로 얻은 에너지는 이런 일에 쓰여요." : "관제실로 돌아왔어요.");
  });

  const onDown = (ev: Event): void => {
    const p = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
    const st = STATIONS.find((x) => Math.hypot(p.x - x.x, p.y - x.y) <= x.r + 6);
    if (held) {
      const m = mats.find((x) => x.id === held)!;
      if (!st) { held = null; return; }
      const want = m.route[m.step + 1];
      if (st.id === want) {
        m.step++;
        held = null;
        haptic(HAPTIC.correct);
        say(`${m.name}이(가) ${st.name}에 도착했어요.`, 2800);
        checkBurn();
        checkClear();
      } else if (m.route.includes(st.id) && st.id !== at(m)) {
        held = null;
        haptic(HAPTIC.wrong);
        say(`${m.name}은(는) 먼저 <b>순환계</b>를 거쳐야 해요. 순환계가 온몸으로 물질을 실어 날라요.`.replace(/<[^>]+>/g, ""), 5000);
      } else {
        held = null;
        haptic(HAPTIC.wrong);
        say(`${m.name}은(는) ${st.name}으로 가지 않아요.`, 3600);
      }
      return;
    }
    // 알갱이 집기
    const hit = active().find((m) => {
      if (m.step >= m.route.length - 1) return false;
      const pos = matPos(m);
      return Math.hypot(p.x - pos.x, p.y - pos.y) <= 18;
    });
    if (hit) {
      held = hit.id;
      haptic(HAPTIC.tap);
      say(`${hit.name}을(를) 골랐어요. 다음에 거칠 곳을 탭하세요.`, 2800);
    }
  };
  life.on(lab.canvas, "pointerdown", onDown);

  // ── 그리기 ──────────────────────────────────────────────────────────────
  function drawStation(ctx: CanvasRenderingContext2D, st: (typeof STATIONS)[number], t: number): void {
    const isNext = held ? mats.find((m) => m.id === held)!.route[mats.find((m) => m.id === held)!.step + 1] === st.id : false;
    const mat = st.tone === "heart" ? TISSUE.heart : st.tone === "gut" ? TISSUE.gut
      : st.tone === "kidney" ? TISSUE.kidney : st.tone === "cell" ? TISSUE.cell : VESSEL.airway;
    ctx.save();
    const g = ctx.createRadialGradient(st.x - st.r * 0.3, st.y - st.r * 0.35, st.r * 0.15, st.x, st.y, st.r);
    g.addColorStop(0, mat.mid);
    g.addColorStop(1, mat.lo);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isNext ? "#FFE9A8" : withAlpha(mat.hi, 0.45);
    ctx.lineWidth = isNext ? 3 : 1.4;
    if (isNext) ctx.setLineDash([]);
    ctx.stroke();
    if (isNext) {
      ctx.strokeStyle = withAlpha("#FFE9A8", 0.45 + 0.25 * Math.sin(t / 250));
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r + 7, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    labelChip(ctx, st.x, st.y, st.name, { size: 11, bg: withAlpha("#0B1524", 0.82) });
  }

  const loop: Loop = createLoop((_dt, t) => {
    const { ctx } = fitLabCanvas(lab.canvas, BASE_W, CVH);
    ctx.save();
    ctx.fillStyle = cssVar("--stage") || "#0B1524";
    ctx.fillRect(0, 0, BASE_W, CVH);

    if (showUses) {
      labelChip(ctx, BASE_W / 2, 60, "세포호흡으로 얻은 에너지의 쓰임", { size: 12, bg: withAlpha(SUBSTANCE.energy.lo, 0.94) });
      USES.forEach((u, i) => {
        const y = 110 + i * 56;
        ctx.fillStyle = withAlpha(SUBSTANCE.energy.mid, 0.2);
        roundRect(ctx, 46, y, 268, 44, 12);
        ctx.fill();
        ctx.strokeStyle = withAlpha(SUBSTANCE.energy.mid, 0.7);
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.font = "800 13px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#FFE9A8";
        ctx.fillText(u, 180, y + 22);
      });
      ctx.restore();
      lab.setPill("에너지의 쓰임");
      return;
    }

    // 순환계를 지나는 연결선 — 모든 길이 가운데를 지난다는 것을 그림으로
    ctx.save();
    ctx.strokeStyle = withAlpha(TISSUE.heart.mid, 0.3);
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    for (const id of ["dig", "resp", "exc", "cell"] as SId[]) {
      const a = ST(id);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(ST("circ").x, ST("circ").y);
      ctx.stroke();
    }
    ctx.restore();

    for (const st of STATIONS) drawStation(ctx, st, t);

    // 조직세포 — 세포호흡 발광
    if (burned) {
      const age = Math.min(1, (t - burnT) / 900);
      drawCellBody(ctx, ST("cell").x, ST("cell").y, 26, { glow: 1 - age * 0.4, nucleus: false });
      labelChip(ctx, ST("cell").x, ST("cell").y + 66, "세포호흡 진행 중", { size: 9.5, bg: withAlpha(SUBSTANCE.energy.lo, 0.94) });
    }

    // 물질 알갱이
    for (const m of active()) {
      const pos = matPos(m);
      const done = m.step >= m.route.length - 1;
      const on = held === m.id;
      drawToken(ctx, pos.x, pos.y, on ? 13 : 11, m.mat, { ring: on, alpha: done ? 0.55 : 1 });
      labelChip(ctx, pos.x, pos.y + 22, m.name, { size: 8.5, bg: withAlpha(done ? "#04B45F" : "#0B1524", done ? 0.82 : 0.78) });
    }

    // 하단 정리 바
    ctx.fillStyle = withAlpha("#0B1524", 0.62);
    roundRect(ctx, 8, 408, 344, 96, 12);
    ctx.fill();
    ctx.font = "800 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.9);
    ctx.fillText("소화계 → 영양소 · 호흡계 → 산소", 20, 428);
    ctx.fillText("순환계가 온몸의 조직세포로 실어 날라요", 20, 450);
    ctx.fillStyle = withAlpha("#FFE9A8", 0.94);
    ctx.fillText(burned ? "이산화 탄소 → 호흡계 · 요소 → 배설계" : "영양소 + 산소 → 에너지 + 이산화 탄소 + 물", 20, 472);
    ctx.fillStyle = withAlpha("#FFFFFF", 0.62);
    ctx.font = "700 9.5px Pretendard, sans-serif";
    ctx.fillText("모든 물질은 순환계를 거쳐요", 20, 492);

    if (toast && t < toastUntil) {
      labelChip(ctx, BASE_W / 2, 392, toast, { size: 10, bg: withAlpha("#0B1524", 0.94), fg: "#FFE9A8" });
    }
    ctx.restore();
    lab.setPill(burned ? "세포호흡 완료" : `배달 ${mats.filter((m) => !m.born && m.step >= m.route.length - 1).length}/2`);
  });

  const start = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    life.dispose();
  };
};
