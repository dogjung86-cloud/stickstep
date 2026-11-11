// u6ChartLab (u6l4 둘째 랩): 「온도와 부피, 점을 이으면?」
// 나온 곳: 탐구 2 "온도에 따른 기체의 부피 변화 자료 해석하기"(물의 온도를 높이며 주사기 속 기체의 부피를 재고 그래프로 나타낸다)와
//          해 보기의 입자 운동 시뮬레이션(온도를 바꾸며 입자의 운동과 부피를 본다).
// 학생이 하는 일: 물을 20 ℃씩 데우고, 그때의 부피를 읽어 그래프의 제자리를 눌러 점을 찍는다(20, 40, 60, 80 ℃ 네 점).
// 실패하는 길: 눈금을 잘못 읽어 다른 자리를 누르면 점이 찍히지 않고 다시 읽으라는 안내가 뜬다.
// 판정: 점들을 이은 선의 모양(올라가는 직선) → 온도가 오를 때 입자에게 일어난 일(빨라져 벽을 더 세게 민다).
// 값은 정본과 같다: 20 ℃ 30.0 mL, 10 ℃마다 1.0 mL(40 ℃ 32.0, 60 ℃ 34.0, 80 ℃ 36.0 mL). 뒤의 문제가 이 값을 묻는다.
// 옛 판(온도 막대를 밀면 그래프가 저절로 그려진다)과 다른 점: 재고, 읽고, 찍는 일을 학생이 한다.
import { haptic, HAPTIC } from "../../../core/haptics";
import { bvBtn, bvCapture } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, pill, ease, noteRow } from "./u6Kit";
import { vSyringe, beaker, volOf } from "./syringe";

const TEMPS = [20, 40, 60, 80];
const ROWS = [28, 30, 32, 34, 36, 38];
const GX0 = 176;
const GX1 = 330;
const GY0 = 48;
const GY1 = 188;
const gx = (t: number): number => GX0 + 22 + ((t - 20) / 60) * (GX1 - GX0 - 40);
const gy = (v: number): number => GY1 - 12 - ((v - 28) / 10) * (GY1 - GY0 - 24);
const BOT = 190;

export const chartLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-chart", label: "물중탕 주사기와 온도, 부피 그래프", wait: "부피를 재서 점을 찍어 보세요" });
  const { frame, tm } = lab;
  const syr = vSyringe(12, 2.5, 16);
  let ti = 0; // 지금 물의 온도(TEMPS의 자리)
  let temp = 20;
  const plotted = new Set<number>();
  let phase: "play" | "ask" | "done" = "play";
  let miss: { x: number; y: number; age: number } | null = null;
  let line = 0;

  const heat = bvBtn("main", "물을 20 ℃ 더 데우기");
  const note = noteRow();
  frame.slot.setControls(heat, note.el);
  const settled = (): boolean => Math.abs(temp - TEMPS[ti]) < 0.6;
  const sync = (): void => {
    const t = TEMPS[ti];
    heat.disabled = phase !== "play" || !plotted.has(t) || ti >= TEMPS.length - 1;
    heat.textContent = !plotted.has(t) ? "먼저 그래프에 점을 찍어요" : ti >= TEMPS.length - 1 ? "다 쟀어요" : "물을 20 ℃ 더 데우기";
    note.set(`물 <b>${t} ℃</b>`, `기체의 부피 <b>${volOf(t).toFixed(1)} mL</b>`);
    host.dataset.u6T = String(t);
    host.dataset.u6Plots = String(plotted.size);
  };
  heat.addEventListener("click", () => {
    if (phase !== "play" || !plotted.has(TEMPS[ti]) || ti >= TEMPS.length - 1) return;
    ti += 1;
    haptic(HAPTIC.tap);
    frame.say(`물이 ${TEMPS[ti]} ℃가 됐어요. 부피를 읽고 그래프의 <b>${TEMPS[ti]} ℃ 줄</b>에서 제자리를 눌러요.`);
    sync();
  });

  const askParticles = (): void => {
    frame.pips(2);
    frame.say("물을 데울 때 주사기 속 <b>입자</b>의 움직임을 떠올려 보세요.");
    frame.slot.ask(
      "온도가 오를 때 주사기 속 입자에게 일어난 일은?",
      [{ t: "빨라져 벽을 더 세게 밀어요", ok: true }, { t: "입자의 개수가 늘어나요" }, { t: "입자 하나하나가 커져요" }],
      (ok) => lab.grade(ok),
      {
        why: "입자 수와 크기는 그대로, <b>빠르기</b>만 달라져요.",
        onNext: () => {
          phase = "done";
          lab.phase("done");
          frame.pips(3);
          frame.say("직접 찍은 네 점이 반듯한 직선 위에 놓였어요.");
          frame.slot.conclude("압력이 같을 때 온도가 오르면 입자가 <b>빨라져</b> 벽을 더 세게 밀고, 기체의 부피가 <b>일정한 비율로</b> 늘어요. 식히면 그만큼 줄어요.");
          api.enableCTA(s.cta ?? "용어 정복하기");
        },
      },
    );
  };
  const askLine = (): void => {
    phase = "ask";
    lab.phase("ask");
    frame.pips(1);
    frame.say("20 ℃ 오를 때마다 부피가 얼마나 늘었는지 점을 따라가 보세요.");
    frame.slot.ask(
      "네 점을 이은 선은 어떤 모양인가요?",
      [{ t: "오른쪽 위로 올라가는 직선", ok: true }, { t: "갈수록 가팔라지는 곡선" }, { t: "휘어지며 내려가는 곡선" }],
      (ok) => lab.grade(ok),
      { why: "20 ℃ 오를 때마다 <b>똑같이 2 mL씩</b> 늘었어요.", onNext: askParticles },
    );
  };

  // 그래프 누르기: 지금 온도의 줄에서 읽은 부피의 자리를 누른다
  lab.cv.addEventListener("pointerdown", (e) => {
    if (phase !== "play") return;
    const p = lab.toDesign(e.clientX, e.clientY);
    if (p.x < GX0 - 6 || p.x > GX1 + 8 || p.y < GY0 - 8 || p.y > GY1 + 4) return;
    bvCapture(lab.cv, e.pointerId);
    const t = TEMPS[ti];
    if (plotted.has(t)) return;
    if (!settled()) {
      frame.say("물이 아직 데워지는 중이에요. 부피가 멈추면 눌러요.");
      return;
    }
    const col = TEMPS.reduce((a, c) => (Math.abs(gx(c) - p.x) < Math.abs(gx(a) - p.x) ? c : a));
    const row = ROWS.reduce((a, c) => (Math.abs(gy(c) - p.y) < Math.abs(gy(a) - p.y) ? c : a));
    if (col === t && row === Math.round(volOf(t))) {
      plotted.add(t);
      haptic(HAPTIC.select);
      sync();
      if (plotted.size === TEMPS.length) {
        api.setCTA("그래프를 살펴보고 있어요", { enabled: false });
        frame.say("네 점을 다 찍었어요. 점을 이으면 어떤 선이 될까요?");
        phase = "ask";
        tm.later(askLine, 1700);
      } else frame.say("점을 찍었어요. 이제 <b>물을 더 데워</b> 다음 값을 재요.");
    } else {
      miss = { x: gx(col), y: gy(row), age: 0 };
      haptic(HAPTIC.wrong);
      frame.say(col !== t ? `지금 물은 <b>${t} ℃</b>예요. ${t} ℃ 줄에서 눌러요.` : `부피를 다시 읽어요. 지금은 <b>${volOf(t).toFixed(1)} mL</b>예요.`);
    }
  });

  lab.phase("play");
  frame.say("끝을 막은 주사기를 물에 담갔어요. 지금 부피를 읽고 그래프의 <b>20 ℃ 줄</b>에서 제자리를 눌러요.");
  sync();

  lab.run((ctx, dt, tMs) => {
    temp = ease(temp, TEMPS[ti], 0.05, dt);
    if (plotted.size === TEMPS.length) line = Math.min(1, line + 0.02 * dt);
    const v = volOf(temp);
    // 가열판, 비커, 주사기
    rr(ctx, 14, BOT + 16, 112, 12, 4);
    ctx.fillStyle = temp > 21 ? `rgba(255,${Math.round(160 - temp)},70,.9)` : "#3B4A63";
    ctx.fill();
    beaker(ctx, 20, 70, 100, BOT + 14, temp, tMs);
    syr.draw(ctx, dt, { cx: 70, bot: BOT, vol: v, temp, capped: true, marks: true });
    pill(ctx, `물 ${Math.round(temp)} ℃`, 12, 7, { dot: temp > 40 ? "#FF9F5A" : "#5AA2F8" });
    pill(ctx, `${v.toFixed(1)} mL`, 12, 37, {});

    // 그래프: 축, 눈금, 누를 수 있는 자리
    const cur = TEMPS[ti];
    if (phase === "play" && !plotted.has(cur)) {
      rr(ctx, gx(cur) - 17, GY0 - 6, 34, GY1 - GY0 + 2, 8);
      ctx.fillStyle = `rgba(125,211,252,${0.1 + 0.05 * Math.sin(tMs / 300)})`;
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(GX0, GY0 - 8);
    ctx.lineTo(GX0, GY1);
    ctx.lineTo(GX1 + 6, GY1);
    ctx.stroke();
    txt(ctx, "부피(mL)", GX0 - 14, GY0 - 18, { color: "#9FB2D0" });
    txt(ctx, "온도(℃)", GX1 + 8, GY1 + 28, { color: "#9FB2D0", align: "right" });
    for (const t of TEMPS) txt(ctx, String(t), gx(t), GY1 + 12, { align: "center", color: t === cur ? "#FFFFFF" : "#8FA3C4" });
    for (const r of ROWS) {
      txt(ctx, String(r), GX0 - 6, gy(r), { align: "right", color: "#8FA3C4" });
      for (const t of TEMPS) {
        ctx.fillStyle = t === cur && phase === "play" && !plotted.has(cur) ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.16)";
        ctx.beginPath();
        ctx.arc(gx(t), gy(r), 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (line > 0) {
      ctx.strokeStyle = "rgba(255,190,120,.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx(20), gy(30));
      ctx.lineTo(gx(20 + 60 * line), gy(30 + 6 * line));
      ctx.stroke();
    }
    for (const t of plotted) {
      ctx.fillStyle = "#FFD68A";
      ctx.beginPath();
      ctx.arc(gx(t), gy(volOf(t)), 5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (miss) {
      miss.age += 0.03 * dt;
      ctx.strokeStyle = `rgba(255,120,120,${Math.max(0, 1 - miss.age)})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(miss.x - 6, miss.y - 6);
      ctx.lineTo(miss.x + 6, miss.y + 6);
      ctx.moveTo(miss.x + 6, miss.y - 6);
      ctx.lineTo(miss.x - 6, miss.y + 6);
      ctx.stroke();
      if (miss.age >= 1) miss = null;
    }
  });

  return () => lab.cleanup();
};
