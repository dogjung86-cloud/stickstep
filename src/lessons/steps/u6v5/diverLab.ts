// u6DiverLab (u6l3): 「둘레의 압력이 낮아지면 기체는?」
// 두 장면에서 같은 일을 손으로 한다: 기체를 둘러싼 압력을 낮추면 부피가 커지고, 다시 높이면 줄어든다.
//   1 바닷속 30 m(4기압)에서 나온 공기 방울을 막대로 수면(1기압)까지 올린다. 방울의 부피가 4배가 된다(내리면 다시 준다)
//   2 판정: 방울이 커진 까닭(둘러싼 물의 압력이 작아져서)
//   3 감압 용기(공기를 빼는 통) 속 마시멜로: 공기를 빼면 부풀고, 다시 넣으면 줄어든다
// 수치는 자연값이다: 물속에서는 10 m 내려갈 때마다 약 1기압씩 더해진다. 그림 속 방울과 마시멜로는 넓이가 부피에 비례하게 그린다.
// 방울 속 입자의 수는 그대로다(사이만 벌어진다).
import { haptic, HAPTIC } from "../../../core/haptics";
import { GasBox } from "../../../ui/gasKit";
import { bvBtn, bvRange } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, pill, vbar, ease, noteRow, dots, stepDots, drawDots } from "./u6Kit";

const SURF = 44;
const BED = 208;
const yOf = (depth: number): number => SURF + (depth / 30) * (BED - SURF);
const P_STEPS = [1, 0.5, 0.33, 0.25]; // 통 속 압력(기압)
const JAR = { x0: 56, y0: 52, x1: 216, y1: 196 };

export const diverLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-diver", label: "바닷속 공기 방울과 감압 용기 속 마시멜로", wait: "방울을 수면까지 올려 보세요" });
  const { frame, tm } = lab;
  let scene: "sea" | "jar" = "sea";
  let phase: "rise" | "ask" | "pump" | "refill" | "done" = "rise";

  // ── 바다 ──
  let depth = 30;
  let shownD = 30;
  const bub = dots(7, 10, 0.9);
  const note = noteRow();
  const range = bvRange({
    cls: "u6x-rg",
    min: 0,
    max: 30,
    value: 0,
    label: "방울 올리기",
    ticks: [
      { t: "바닥 30 m", p: 0 },
      { t: "20 m", p: 33.3 },
      { t: "10 m", p: 66.7 },
      { t: "수면", p: 100 },
    ],
    onInput: (v) => {
      depth = 30 - v;
      syncSea();
      if (phase === "rise" && depth === 0) {
        phase = "ask";
        range.input.disabled = true;
        haptic(HAPTIC.select);
        api.setCTA("방울을 살펴보고 있어요", { enabled: false });
        frame.say("수면에 닿은 방울은 바닥에서보다 <b>4배</b>로 커졌어요. 입자 수는 그대로예요.");
        tm.later(askWhy, 1500);
      }
    },
  });
  function syncSea(): void {
    const p = 1 + depth / 10;
    note.set(`깊이 <b>${depth} m</b>`, `물의 압력 <b>${p.toFixed(1)}기압</b>`);
    host.dataset.u6D = String(depth);
  }
  frame.slot.setControls(range.el, note.el);

  // ── 감압 용기 ──
  const air = new GasBox(1.5);
  let lv = 0;
  let puff = 1; // 마시멜로의 부피(배), 부드럽게 따라간다
  const out = bvBtn("main u6x-half", "공기 빼기");
  const back = bvBtn("u6x-half", "공기 넣기");
  const row = document.createElement("div");
  row.className = "u6x-row2";
  row.append(back, out);
  const jarNote = noteRow();
  function syncJar(): void {
    out.disabled = lv >= P_STEPS.length - 1 || phase !== "pump";
    back.disabled = lv <= 0 || phase !== "refill";
    jarNote.set(`통 속 압력 <b>${P_STEPS[lv].toFixed(lv ? 2 : 1)}기압</b>`, `마시멜로 부피 <b>${lv + 1}배</b>`);
    host.dataset.u6Lv = String(lv);
    air.setCount(Math.round(24 * P_STEPS[lv]), JAR);
  }
  out.addEventListener("click", () => {
    if (phase !== "pump" || lv >= P_STEPS.length - 1) return;
    lv += 1;
    haptic(HAPTIC.tap);
    if (lv === P_STEPS.length - 1) {
      phase = "refill";
      lab.phase("refill");
      api.setCTA("공기를 다시 넣어 보세요", { enabled: false });
      frame.say("둘레의 공기가 줄자 마시멜로가 <b>부풀었어요</b>. 이번에는 <b>공기 넣기</b>를 눌러 보세요.");
    }
    syncJar();
  });
  back.addEventListener("click", () => {
    if (phase !== "refill" || lv <= 0) return;
    lv -= 1;
    haptic(HAPTIC.tap);
    syncJar();
    if (lv === 0) {
      phase = "done";
      lab.phase("done");
      tm.later(() => {
        frame.pips(3);
        frame.say("공기를 다시 넣자 마시멜로가 처음 크기로 돌아왔어요.");
        frame.slot.conclude("기체를 둘러싼 압력이 <b>작아지면</b> 기체의 부피가 커지고, <b>커지면</b> 부피가 줄어요. 방울도 마시멜로 속 공기도 같아요.");
        api.enableCTA(s.cta ?? "개념 정리하기");
      }, 900);
    }
  });

  const toJar = (): void => {
    scene = "jar";
    phase = "pump";
    lab.phase("pump");
    frame.pips(2);
    api.setCTA("통 속 공기를 빼 보세요", { enabled: false });
    frame.say("마시멜로 속에도 작은 공기 방울이 있어요. <b>공기 빼기</b>로 통 속 압력을 낮춰 보세요.");
    frame.slot.setControls(row, jarNote.el);
    syncJar();
  };

  const askWhy = (): void => {
    lab.phase("ask");
    frame.pips(1);
    frame.say("깊이마다 적힌 <b>물의 압력</b>과 방울의 크기를 견줘 보세요.");
    frame.slot.ask(
      "방울이 올라가며 <b>커진</b> 까닭은 무엇일까요?",
      [{ t: "둘러싼 물의 압력이 작아져서", ok: true }, { t: "방울 속 입자가 늘어나서" }, { t: "방울 속 입자가 커져서" }],
      (ok) => lab.grade(ok),
      { why: "얕을수록 물이 누르는 압력이 작아요. 입자 수는 그대로예요.", onNext: toJar },
    );
  };

  lab.phase("rise");
  frame.say("잠수부가 내쉰 공기 방울이에요. 막대를 밀어 방울을 <b>수면</b>까지 올려 보세요.");
  syncSea();

  const drawSea = (ctx: CanvasRenderingContext2D, dt: number, tMs: number): void => {
    shownD = ease(shownD, depth, 0.25, dt);
    const p = 1 + shownD / 10;
    const r = 10 * Math.sqrt(4 / p);
    // 물
    const g = ctx.createLinearGradient(0, SURF, 0, BED);
    g.addColorStop(0, "rgba(64,150,220,.42)");
    g.addColorStop(1, "rgba(14,44,96,.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0, SURF, 346, BED - SURF + 22);
    ctx.fillStyle = "#3A3327";
    ctx.fillRect(0, BED + 8, 346, 22);
    ctx.strokeStyle = "rgba(190,225,255,.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= 346; x += 6) {
      const y = SURF + Math.sin(x / 22 + tMs / 600) * 1.6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // 깊이 눈금
    for (const d of [0, 10, 20, 30]) {
      const y = yOf(d);
      const on = Math.abs(shownD - d) < 2;
      ctx.strokeStyle = "rgba(255,255,255,.16)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(226, y);
      ctx.lineTo(250, y);
      ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, `${d} m`, 256, y - (d === 30 ? 9 : d === 0 ? -10 : 0), { color: on ? "#FFFFFF" : "#A9BDD9", size: 12.5 });
      txt(ctx, `${1 + d / 10}기압`, 338, y - (d === 30 ? 9 : d === 0 ? -10 : 0), { color: on ? "#FFD68A" : "#A9BDD9", align: "right", size: 12.5 });
    }
    // 잠수부(막대 인물과 공기통)
    const fx = 46;
    const fy = BED + 8;
    ctx.strokeStyle = "#F2F6FC";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    rr(ctx, fx - 15, fy - 44, 8, 22, 3);
    ctx.fillStyle = "#6F86AD";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fx, fy - 50, 9, 0, Math.PI * 2);
    ctx.moveTo(fx, fy - 41);
    ctx.lineTo(fx, fy - 18);
    ctx.lineTo(fx - 8, fy - 2);
    ctx.moveTo(fx, fy - 18);
    ctx.lineTo(fx + 8, fy - 2);
    ctx.moveTo(fx, fy - 34);
    ctx.lineTo(fx + 14, fy - 40);
    ctx.stroke();
    // 방울
    const bx = 138;
    const by = Math.max(SURF + r - 2, yOf(shownD) - r - 2);
    ctx.fillStyle = "rgba(190,230,255,.16)";
    ctx.strokeStyle = "rgba(215,240,255,.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    stepDots(bub, r, dt);
    drawDots(ctx, bub, bx, by, 200, 2.6);
    txt(ctx, `부피 ${(4 / p).toFixed(1)}배`, bx + r + 8, by, { color: "#FFFFFF", size: 13, weight: 800 });
    pill(ctx, "방울 속 입자 7개", 12, 7, { dot: "#5AA2F8" });
  };

  const drawJar = (ctx: CanvasRenderingContext2D, dt: number): void => {
    puff = ease(puff, lv + 1, 0.12, dt);
    // 받침과 유리 통
    rr(ctx, JAR.x0 - 16, JAR.y1 + 2, JAR.x1 - JAR.x0 + 32, 12, 5);
    ctx.fillStyle = "#31415C";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(JAR.x0 - 4, JAR.y1 + 2);
    ctx.lineTo(JAR.x0 - 4, JAR.y0 + 40);
    ctx.quadraticCurveTo(JAR.x0 - 4, JAR.y0 - 6, (JAR.x0 + JAR.x1) / 2, JAR.y0 - 6);
    ctx.quadraticCurveTo(JAR.x1 + 4, JAR.y0 - 6, JAR.x1 + 4, JAR.y0 + 40);
    ctx.lineTo(JAR.x1 + 4, JAR.y1 + 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(170,200,240,.08)";
    ctx.fill();
    ctx.strokeStyle = "rgba(200,222,252,.6)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    air.step(dt, JAR);
    air.draw(ctx, 205);
    // 마시멜로(넓이가 부피에 비례)
    const k = Math.sqrt(puff);
    const mw = 40 * k;
    const mh = 34 * k;
    const mx = (JAR.x0 + JAR.x1) / 2 - mw / 2;
    const my = JAR.y1 - mh;
    rr(ctx, mx, my, mw, mh, 9 * k);
    ctx.fillStyle = "#FFF4F6";
    ctx.fill();
    ctx.strokeStyle = "#E9B9C4";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.strokeStyle = "rgba(210,150,170,.85)";
    ctx.lineWidth = 1.2;
    for (const [ux, uy] of [[0.28, 0.32], [0.66, 0.3], [0.46, 0.62], [0.24, 0.72], [0.74, 0.7]]) {
      ctx.beginPath();
      ctx.arc(mx + mw * ux, my + mh * uy, 2.6 * k, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 관과 펌프, 압력 막대
    ctx.strokeStyle = "#6F86AD";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(JAR.x1 + 4, 150);
    ctx.lineTo(244, 150);
    ctx.stroke();
    rr(ctx, 244, 136, 30, 28, 6);
    ctx.fillStyle = "#3C5378";
    ctx.fill();
    txt(ctx, "펌프", 259, 176, { align: "center", color: "#9FB2D0" });
    txt(ctx, "통 속 압력", 310, 44, { align: "center", color: "#9FB2D0" });
    vbar(ctx, 300, 58, 20, 104, P_STEPS[lv], "#5AA2F8");
    txt(ctx, `${P_STEPS[lv].toFixed(lv ? 2 : 1)}기압`, 310, 178, { align: "center", size: 13, weight: 800, color: "#E8EEF9" });
    pill(ctx, "감압 용기(공기를 빼는 통)", 12, 7, { dot: "#F2A7B8" });
  };

  lab.run((ctx, dt, tMs) => (scene === "sea" ? drawSea(ctx, dt, tMs) : drawJar(ctx, dt)));
  return () => lab.cleanup();
};
