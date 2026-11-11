// u6BoyleLab (u6l2): 「누르면 압력은 어떻게 될까?」
// 나온 곳: 탐구 "기체의 압력과 부피 관계 알아보기"(주사기와 압력 센서. 부피를 맞추고, 센서를 연결해 새지 않는지 보고, 부피를 줄여 가며 압력을 재 그래프로 나타낸다).
// 학생이 정하는 것: 센서를 언제 연결할지, 어느 부피에서 값을 기록할지(다섯 눈금 가운데 골라 세 번 넘게 기록한다).
// 실패하는 길: 센서를 연결하기 전에 피스톤을 밀면 열린 끝으로 공기가 빠져나가 압력이 그대로다. 피스톤을 되돌리고 연결해야 한다.
// 판정: 자기가 기록한 가장 작은 부피를 처음과 견준다(부피가 몇 분의 1이 되자 압력은) → 누를 때 변하지 않은 것(입자의 개수).
// 수치는 정본과 같다: 압력 × 부피 = 24 (24 mL 1기압, 12 mL 2기압, 6 mL 4기압). 뒤의 문제가 이 값을 묻는다.
// 눈금은 24, 16, 12, 8, 6 mL 다섯이다(압력이 1, 1.5, 2, 3, 4기압으로 딱 떨어진다). 막대는 눈금에만 선다.
// 벽 충돌 막대는 피스톤과 마주 보는 두 벽에 부딪힌 횟수로 움직인다. 입자의 수와 빠르기는 그대로다.
// 옛 판(피스톤을 끌어 "딱 2기압"을 맞추는 목표 셋)과 다른 점: 준비 단계와 새는 실패가 있고, 값을 골라 기록하며, 판정이 자기 기록으로 묻는다.
import { haptic, HAPTIC } from "../../../core/haptics";
import { GasBox, type GasBounds } from "../../../ui/gasKit";
import { bvBtn, bvRange } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, pill, clamp01, ease, noteRow, HitRate } from "./u6Kit";

const PV = 24;
const STOPS = [24, 16, 12, 8, 6];
const N = 18;
const X_END = 280; // 주사기의 끝(센서 쪽)
const PX = 220 / 24; // 1 mL의 길이
const Y0 = 42;
const Y1 = 84;
const NEED = 3; // 처음 값 말고 더 기록해야 하는 수
const fmtP = (v: number): string => (PV / v).toFixed(1);

export const boyleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-boyle", label: "압력 센서를 단 주사기와 압력, 부피 그래프", wait: "센서를 연결하고 값을 기록해 보세요" });
  const { frame, tm } = lab;
  const box = new GasBox(2);
  let vol = 24;
  let shown = 24;
  let sealed = false;
  let leaked = false;
  let rate = 0.2;
  let lastLR = 0;
  const hr = new HitRate();
  const recs = new Map<number, number>();
  let phase: "prep" | "play" | "ask" | "done" = "prep";
  let curve = 0;
  let gap = 12; // 센서와 주사기 끝 사이
  const bounds = (v: number): GasBounds => ({ x0: X_END - v * PX, y0: Y0, x1: X_END, y1: Y1 });
  box.setCount(N, bounds(vol));

  const note = noteRow();
  const main = bvBtn("main", "압력 센서 연결하기");
  const range = bvRange({
    cls: "u6x-rg",
    min: 0,
    max: STOPS.length - 1,
    value: 0,
    label: "피스톤 밀기",
    ticks: STOPS.map((v, i) => (i === STOPS.length - 1 ? `${v} mL` : String(v))),
    onInput: (i) => {
      vol = STOPS[i];
      if (!sealed) {
        // 끝이 열려 있다: 밀면 공기가 빠져나가고, 되돌리면 다시 들어온다
        box.setCount(Math.round((N * vol) / 24), bounds(vol));
        if (vol < 24 && !leaked) {
          leaked = true;
          haptic(HAPTIC.wrong);
          frame.say("끝이 열려 있어 공기가 <b>빠져나가요</b>. 압력은 그대로예요. 피스톤을 되돌리고 센서를 연결해요.");
        }
      }
      sync();
    },
  });
  frame.slot.setControls(range.el, main, note.el);

  function sync(): void {
    if (!sealed) {
      main.textContent = "압력 센서 연결하기";
      note.set(`부피 <b>${vol} mL</b>`, "끝이 <b>열려</b> 있어요");
    } else {
      const has = recs.has(vol);
      main.disabled = has || phase !== "play";
      main.textContent = has ? `${vol} mL는 기록했어요` : `${vol} mL · ${fmtP(vol)}기압 기록하기`;
      note.set(`부피 <b>${vol} mL</b>`, `압력 <b>${fmtP(vol)}기압</b>`);
    }
    host.dataset.u6V = String(vol);
    host.dataset.u6Sealed = sealed ? "1" : "0";
    range.input.setAttribute("aria-valuetext", `${vol} mL`);
  }

  const askKeep = (): void => {
    frame.pips(2);
    frame.say("센서가 끝을 막고 있어요. 무대의 <b>입자</b>를 다시 보세요.");
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
          api.enableCTA(s.cta ?? "용어 정복하기");
        },
      },
    );
  };

  const askRatio = (): void => {
    phase = "ask";
    lab.phase("ask");
    frame.pips(1);
    const v = Math.min(...recs.keys());
    const k = 24 / v;
    frame.say(`기록표에서 24 mL일 때와 ${v} mL일 때를 견줘 보세요.`);
    frame.slot.ask(
      `부피가 24 mL에서 ${v} mL로 <b>${k}분의 1</b>이 되자 압력은?`,
      [{ t: `${k}배가 됐어요`, ok: true }, { t: `${k}분의 1이 됐어요` }, { t: "변하지 않았어요" }],
      (ok) => lab.grade(ok),
      { why: `24×1과 ${v}×${k}. 곱이 늘 <b>24</b>로 같아요.`, onNext: askKeep },
    );
  };

  main.addEventListener("click", () => {
    if (phase === "prep") {
      if (vol !== 24) {
        haptic(HAPTIC.wrong);
        frame.say("공기가 빠져나간 채로는 잴 수 없어요. 먼저 피스톤을 <b>24 mL</b>로 되돌려요.");
        return;
      }
      sealed = true;
      phase = "play";
      lab.phase("play");
      haptic(HAPTIC.select);
      box.setCount(N, bounds(vol));
      recs.set(24, 1);
      api.setCTA("부피를 줄이며 값을 기록해 보세요", { enabled: false });
      frame.say("센서가 끝을 막았어요. 24 mL에서 1기압. 피스톤을 밀며 다른 부피에서 <b>세 번</b> 기록해 보세요.");
      sync();
      return;
    }
    if (phase !== "play" || recs.has(vol)) return;
    recs.set(vol, PV / vol);
    haptic(HAPTIC.select);
    sync();
    const left = NEED + 1 - recs.size;
    if (left <= 0) {
      range.input.disabled = true;
      api.setCTA("기록을 살펴보고 있어요", { enabled: false });
      frame.say("점을 이으니 <b>휘어진 선</b>이 됐어요. 압력이 커질수록 부피가 작아요.");
      tm.later(askRatio, 1500);
    } else frame.say(`${vol} mL에서 ${fmtP(vol)}기압이에요. 다른 부피에서 <b>${left}번 더</b> 기록해 보세요.`);
  });

  lab.phase("prep");
  frame.say("주사기 속 공기는 24 mL예요. <b>압력 센서</b>를 연결한 뒤 피스톤을 밀어 압력을 재요.");
  sync();

  const GX0 = 46;
  const GX1 = 166;
  const GY0 = 142;
  const GY1 = 204;
  const gx = (p: number): number => GX0 + ((p - 0.5) / 3.8) * (GX1 - GX0);
  const gy = (v: number): number => GY1 - (v / 26) * (GY1 - GY0);

  lab.run((ctx, dt, tMs) => {
    shown = ease(shown, vol, 0.3, dt);
    gap = ease(gap, sealed ? 0 : 12, 0.2, dt);
    const b = bounds(shown);
    for (const p of box.parts) {
      if (p.x < b.x0 + 5) {
        p.x = b.x0 + 5;
        p.vx = Math.abs(p.vx); // 피스톤에 밀린 입자는 안쪽으로 튕긴다
      }
    }
    box.step(dt, b);
    const lr = box.hits.L + box.hits.R;
    hr.push(lr - lastLR, dt);
    lastLR = lr;
    rate = ease(rate, clamp01(hr.value() / 0.4), 0.1, dt); // 6 mL에서 프레임마다 0.42번쯤 부딪힌다
    if (recs.size > NEED) curve = Math.min(1, curve + 0.02 * dt);

    // 주사기 통
    rr(ctx, 56, Y0 - 5, X_END - 56 + 8, Y1 - Y0 + 10, 9);
    ctx.fillStyle = "rgba(160,190,235,.10)";
    ctx.fill();
    ctx.strokeStyle = "rgba(190,214,250,.55)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    for (const v of STOPS) {
      const x = X_END - v * PX;
      ctx.strokeStyle = "rgba(190,214,250,.5)";
      ctx.beginPath();
      ctx.moveTo(x, Y1 + 5);
      ctx.lineTo(x, Y1 + 11);
      ctx.stroke();
      txt(ctx, String(v), x, Y1 + 20, { align: "center", color: v === vol ? "#FFFFFF" : "#8FA3C4" });
    }
    txt(ctx, "mL", X_END - 6, Y1 + 20, { align: "center", color: "#8FA3C4" });
    box.draw(ctx, 205);
    // 피스톤
    rr(ctx, b.x0 - 9, Y0 - 3, 9, Y1 - Y0 + 6, 3);
    ctx.fillStyle = "#93A9CC";
    ctx.fill();
    ctx.fillStyle = "#6F86AD";
    ctx.fillRect(b.x0 - 9 - 26, (Y0 + Y1) / 2 - 4, 26, 8);
    rr(ctx, b.x0 - 9 - 34, Y0 + 4, 9, Y1 - Y0 - 8, 4);
    ctx.fill();
    // 주사기의 끝과 압력 센서(연결 전에는 떨어져 있다)
    const my = (Y0 + Y1) / 2;
    ctx.fillStyle = "#6F86AD";
    ctx.fillRect(X_END + 8, my - 3, 8, 6);
    const sx = X_END + 16 + gap;
    const sw = 44 - gap * 0.5;
    rr(ctx, sx, Y0 - 8, sw, Y1 - Y0 + 16, 10);
    ctx.fillStyle = "#16263F";
    ctx.fill();
    ctx.strokeStyle = sealed ? "#3C5378" : "#FFD68A";
    ctx.setLineDash(sealed ? [] : [4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    txt(ctx, sealed ? fmtP(vol) : "?", sx + sw / 2, my - 7, { align: "center", size: 17, weight: 800, color: "#FFFFFF" });
    txt(ctx, "기압", sx + sw / 2, my + 13, { align: "center", color: "#9FB2D0" });
    if (!sealed && vol < 24) {
      // 열린 끝으로 새는 공기
      for (let i = 0; i < 3; i++) {
        const t = (tMs / 500 + i / 3) % 1;
        ctx.fillStyle = `rgba(125,211,252,${0.8 * (1 - t)})`;
        ctx.beginPath();
        ctx.arc(X_END + 14 + t * 5, my - 6 - t * 22, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    pill(ctx, `입자 ${box.parts.length}개`, 12, 7, { dot: sealed ? "#5AA2F8" : "#FF9C9C" });
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
    for (const v of [12, 24]) txt(ctx, String(v), GX0 - 7, gy(v), { align: "right", color: "#8FA3C4" });
    if (curve > 0) {
      ctx.strokeStyle = "rgba(125,211,252,.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const pEnd = 1 + 3 * curve;
      for (let p = 1; p <= pEnd + 0.001; p += 0.05) {
        if (p === 1) ctx.moveTo(gx(p), gy(PV / p));
        else ctx.lineTo(gx(p), gy(PV / p));
      }
      ctx.stroke();
    }
    if (sealed) {
      ctx.strokeStyle = "rgba(255,255,255,.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(gx(PV / vol), gy(vol), 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const [v, p] of recs) {
      ctx.fillStyle = "#FFD68A";
      ctx.beginPath();
      ctx.arc(gx(p), gy(v), 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // 기록표
    txt(ctx, "기록", 240, GY0 - 17, { color: "#9FB2D0" });
    [...recs.entries()].sort((a, c) => c[0] - a[0]).forEach(([v, p], i) => txt(ctx, `${v} mL  ${p.toFixed(1)}기압`, 240, GY0 + 1 + i * 17, { size: 13, color: "#E8EEF9", weight: 700 }));
  });

  return () => lab.cleanup();
};
