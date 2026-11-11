// u6BoyleLab (u6l2): 「누르면 압력은 어떻게 될까?」
// 끝에 압력 센서를 단 주사기(실험 그대로). 막대로 피스톤을 밀어 부피를 줄이고, 그때의 압력을 기록해 그래프에 점을 찍는다.
//   1 12 mL에서 기록, 6 mL에서 기록(다른 부피도 얼마든지 기록할 수 있다). 부피는 1 mL씩 움직여 눈금에 딱 맞는다
//   2 판정 둘: 부피가 절반, 4분의 1이 될 때 압력은 → 누를 때 변하지 않은 것은(입자의 개수)
// 수치는 정본과 같다: 압력 × 부피 = 24 (24 mL 1기압, 12 mL 2기압, 6 mL 4기압). 뒤의 문제가 이 값을 묻는다.
// 압력 막대는 피스톤과 마주 보는 두 벽에 부딪힌 횟수로 움직인다(부피가 4분의 1이면 4배로 잦다). 입자 수와 빠르기는 그대로다.
import { haptic, HAPTIC } from "../../../core/haptics";
import { GasBox, type GasBounds } from "../../../ui/gasKit";
import { bvBtn, bvRange } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, pill, clamp01, ease, noteRow } from "./u6Kit";

const PV = 24;
const V_MAX = 24;
const V_MIN = 6;
const N = 18;
const X_END = 280; // 막힌 끝(센서 쪽)
const PX = 220 / V_MAX; // 1 mL의 길이
const Y0 = 42;
const Y1 = 84;
const fmtP = (v: number): string => (PV / v).toFixed(1);

export const boyleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-boyle", label: "압력 센서를 단 주사기와 압력, 부피 그래프", wait: "12 mL와 6 mL에서 기록해 보세요" });
  const { frame, tm } = lab;
  const box = new GasBox(2);
  let vol = V_MAX;
  let shown = V_MAX; // 그림 속 피스톤(부드럽게 따라간다)
  let rate = 0.2;
  let lastLR = 0;
  const win: number[] = [];
  const recs = new Map<number, number>([[V_MAX, 1]]);
  let phase: "play" | "ask" | "done" = "play";
  let curve = 0; // 곡선이 그려진 정도(0~1)
  const bounds = (v: number): GasBounds => ({ x0: X_END - v * PX, y0: Y0, x1: X_END, y1: Y1 });
  box.setCount(N, bounds(vol));

  const note = noteRow();
  const rec = bvBtn("main", "이 값 기록하기");
  const range = bvRange({
    cls: "u6x-rg",
    min: 0,
    max: V_MAX - V_MIN,
    value: 0,
    label: "피스톤 밀기",
    ticks: [
      { t: "24 mL", p: 0 },
      { t: "12 mL", p: (12 / 18) * 100 },
      { t: "6 mL", p: 100 },
    ],
    onInput: (v) => {
      vol = V_MAX - v;
      sync();
    },
  });
  frame.slot.setControls(range.el, rec, note.el);

  function sync(): void {
    const has = recs.has(vol);
    rec.disabled = has || phase !== "play";
    rec.textContent = has ? "기록한 값이에요" : `${vol} mL · ${fmtP(vol)}기압 기록하기`;
    note.set(`부피 <b>${vol} mL</b>`, `압력 <b>${fmtP(vol)}기압</b>`);
    host.dataset.u6V = String(vol);
    range.input.setAttribute("aria-valuetext", `${vol} mL`);
  }

  const askKeep = (): void => {
    frame.pips(2);
    frame.say("주사기 끝은 막혀 있어요. 무대의 <b>입자</b>를 다시 보세요.");
    frame.slot.ask(
      "피스톤을 눌러도 <b>변하지 않은</b> 것은 무엇일까요?",
      [{ t: "입자의 개수", ok: true }, { t: "입자 사이의 거리" }, { t: "벽에 부딪히는 횟수" }],
      (ok) => lab.grade(ok),
      {
        why: "끝이 막혀 입자는 그대로예요. 사이만 가까워져요.",
        onNext: () => {
          phase = "done";
          lab.phase("done");
          frame.pips(3);
          frame.say("기록한 점들이 휘어진 선 위에 놓였어요.");
          frame.slot.conclude("온도가 같을 때 부피가 줄면 입자가 벽에 <b>더 자주</b> 부딪혀 압력이 커져요. 부피가 절반이면 압력은 2배, 둘은 <b>반비례</b>해요.");
          api.enableCTA(s.cta ?? "개념 정리하기");
        },
      },
    );
  };

  const askRatio = (): void => {
    phase = "ask";
    lab.phase("ask");
    frame.pips(1);
    frame.say("기록한 값을 견줘 보세요. 24 mL, 12 mL, 6 mL일 때예요.");
    frame.slot.ask(
      "부피가 <b>절반</b>, <b>4분의 1</b>로 줄 때 압력은?",
      [{ t: "2배, 4배로 커졌어요", ok: true }, { t: "절반, 4분의 1로 줄었어요" }, { t: "늘 1기압 그대로였어요" }],
      (ok) => lab.grade(ok),
      { why: "24×1, 12×2, 6×4. 곱이 늘 <b>24</b>로 같아요.", onNext: askKeep },
    );
  };

  rec.addEventListener("click", () => {
    if (phase !== "play" || recs.has(vol)) return;
    recs.set(vol, PV / vol);
    haptic(HAPTIC.select);
    sync();
    const a = recs.has(12);
    const b = recs.has(6);
    if (a && b) {
      range.input.disabled = true;
      api.setCTA("기록을 살펴보고 있어요", { enabled: false });
      frame.say("점을 이으니 <b>휘어진 선</b>이 됐어요. 압력이 커질수록 부피가 작아요.");
      tm.later(askRatio, 1500);
    } else if (a) frame.say("12 mL에서 2기압이에요. 이번에는 끝까지 밀어 <b>6 mL</b>에서 기록해 보세요.");
    else if (b) frame.say("6 mL에서 4기압이에요. 이번에는 <b>12 mL</b>에서도 기록해 보세요.");
    else frame.say("좋아요. <b>12 mL</b>와 <b>6 mL</b>에서도 기록해 보세요.");
  });

  lab.phase("play");
  frame.say("주사기 끝에 압력 센서를 달았어요. 피스톤을 밀어 <b>12 mL</b>로 줄이고 <b>기록</b>해 보세요.");
  sync();

  // 그래프 자리
  const GX0 = 46;
  const GX1 = 166;
  const GY0 = 142;
  const GY1 = 204;
  const gx = (p: number): number => GX0 + ((p - 0.5) / 3.8) * (GX1 - GX0);
  const gy = (v: number): number => GY1 - (v / 26) * (GY1 - GY0);

  lab.run((ctx, dt) => {
    shown = ease(shown, vol, 0.3, dt);
    const b = bounds(shown);
    for (const p of box.parts) p.x = Math.max(b.x0 + 5, p.x);
    box.step(dt, b);
    const lr = box.hits.L + box.hits.R;
    win.push(lr - lastLR);
    lastLR = lr;
    if (win.length > 100) win.shift();
    rate = ease(rate, clamp01(win.reduce((a, x) => a + x, 0) / 58), 0.06, dt);
    if (recs.has(12) && recs.has(6)) curve = Math.min(1, curve + 0.02 * dt);

    // 주사기 통
    rr(ctx, 56, Y0 - 5, X_END - 56 + 8, Y1 - Y0 + 10, 9);
    ctx.fillStyle = "rgba(160,190,235,.10)";
    ctx.fill();
    ctx.strokeStyle = "rgba(190,214,250,.55)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // 눈금
    for (const v of [24, 18, 12, 6]) {
      const x = X_END - v * PX;
      ctx.strokeStyle = "rgba(190,214,250,.5)";
      ctx.beginPath();
      ctx.moveTo(x, Y1 + 5);
      ctx.lineTo(x, Y1 + 11);
      ctx.stroke();
      txt(ctx, String(v), x, Y1 + 20, { align: "center", color: v === Math.round(shown) ? "#FFFFFF" : "#8FA3C4" });
    }
    txt(ctx, "mL", X_END - 4, Y1 + 20, { align: "center", color: "#8FA3C4" });
    box.draw(ctx, 205);
    // 피스톤
    rr(ctx, b.x0 - 9, Y0 - 3, 9, Y1 - Y0 + 6, 3);
    ctx.fillStyle = "#93A9CC";
    ctx.fill();
    ctx.fillStyle = "#6F86AD";
    ctx.fillRect(b.x0 - 9 - 26, (Y0 + Y1) / 2 - 4, 26, 8);
    rr(ctx, b.x0 - 9 - 34, Y0 + 4, 9, Y1 - Y0 - 8, 4);
    ctx.fill();
    // 압력 센서
    ctx.fillStyle = "#6F86AD";
    ctx.fillRect(X_END + 8, (Y0 + Y1) / 2 - 3, 8, 6);
    rr(ctx, X_END + 16, Y0 - 8, 44, Y1 - Y0 + 16, 10);
    ctx.fillStyle = "#16263F";
    ctx.fill();
    ctx.strokeStyle = "#3C5378";
    ctx.stroke();
    txt(ctx, fmtP(vol), X_END + 38, (Y0 + Y1) / 2 - 7, { align: "center", size: 17, weight: 800, color: "#FFFFFF" });
    txt(ctx, "기압", X_END + 38, (Y0 + Y1) / 2 + 13, { align: "center", color: "#9FB2D0" });

    // 위쪽: 이름표와 벽 충돌 막대
    pill(ctx, `입자 ${N}개`, 12, 7, { dot: "#5AA2F8" });
    txt(ctx, "벽 충돌", 236, 20, { align: "right", color: "#9FB2D0" });
    rr(ctx, 244, 15, 90, 10, 5);
    ctx.fillStyle = "rgba(255,255,255,.09)";
    ctx.fill();
    rr(ctx, 244, 15, Math.max(10, 90 * rate), 10, 5);
    ctx.fillStyle = rate > 0.6 ? "#FF9F5A" : "#FFD68A";
    ctx.fill();

    // 그래프
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(GX0, GY0 - 6);
    ctx.lineTo(GX0, GY1);
    ctx.lineTo(GX1 + 6, GY1);
    ctx.stroke();
    txt(ctx, "부피(mL)", GX0 - 34, GY0 - 17, { color: "#9FB2D0" });
    txt(ctx, "압력(기압)", GX1 + 6, GY1 + 13, { color: "#9FB2D0" });
    for (const p of [1, 2, 3, 4]) txt(ctx, String(p), gx(p), GY1 + 13, { align: "center", color: "#8FA3C4" });
    for (const v of [6, 12, 24]) txt(ctx, String(v), GX0 - 7, gy(v), { align: "right", color: "#8FA3C4" });
    if (curve > 0) {
      ctx.strokeStyle = "rgba(125,211,252,.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const pEnd = 1 + 3 * curve;
      for (let p = 1; p <= pEnd + 0.001; p += 0.05) {
        const x = gx(p);
        const y = gy(PV / p);
        if (p === 1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // 지금 값(빈 고리)과 기록한 점
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(gx(PV / vol), gy(vol), 6, 0, Math.PI * 2);
    ctx.stroke();
    for (const [v, p] of recs) {
      ctx.fillStyle = "#FFD68A";
      ctx.beginPath();
      ctx.arc(gx(p), gy(v), 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // 기록표
    txt(ctx, "기록", 240, GY0 - 17, { color: "#9FB2D0" });
    const list = [...recs.entries()].sort((a, c) => c[0] - a[0]);
    const shownList = list.length > 4 ? list.filter(([v]) => v === 24 || v === 12 || v === 6 || v === vol).slice(0, 4) : list;
    shownList.forEach(([v, p], i) => txt(ctx, `${v} mL  ${p.toFixed(1)}기압`, 240, GY0 + 3 + i * 18, { size: 13, color: "#E8EEF9", weight: 700 }));
  });

  return () => lab.cleanup();
};
