// [중2 Ⅷ v5] g2u8l2 luxLab: 「전등에서 멀어지면 밝기는 얼마나 줄까요?」
// 다루는 내용: 탐구 활동(줄자의 0 자리에 전등, 교실을 어둡게, 스마트 기기를 20 cm 간격으로 옮기며 밝기를 잰다).
// 한 통찰: 전등에서 멀어질수록 어두워지고, 거리가 2배가 되면 밝기는 4분의 1이 된다.
// 학생이 정하는 것: 전등과 교실 불을 켜고 끌지, 기기를 어디에 세울지, 언제 잴지.
// 실패하는 길: 교실 불을 켠 채 재면 값에 교실 빛(400 lx)이 섞인다. 전등을 켜지 않으면 전등 빛을 잴 수 없다. 잘못 잰 값은 붉게 남는다.
// 값: 전등 빛은 20 cm에서 900 lx이고 거리의 제곱에 반비례한다(900, 225, 100, 56, 36).
// 기록은 자리마다 값에 비례한 막대로 남긴다(900이 기준 높이, 225는 그 4분의 1). 20 cm와 40 cm를 다 재면 900 막대를 넷으로 나눈 금과
// 4분의 1 높이의 점선을 그어 "2배 거리면 4분의 1"이 눈에 보이게 한다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { S, sBox, sCanvas, sFrame, sGlow, sLine, sRow, sSegs, sText, type LabStep } from "./kit";

const POS = [20, 40, 60, 80, 100];
const ROOM = 400;
const lampLx = (d: number): number => Math.round(900 * (20 / d) ** 2);
const BAR_BASE = 104; // 기록 막대의 바닥
const BAR_H = 64; // 900 lx 막대의 높이
const BAR_MAX = 74; // 교실 빛이 섞인 큰 값은 여기까지만 그린다
type P = "20" | "40" | "60" | "80" | "100";

export const luxLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 5, api, tall: true });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let lamp = false;
  let room = true;
  let at = 20;
  let px = 0; // 기기의 화면 자리(부드럽게)
  let flash = 0;
  let finished = false;
  const rec = new Map<number, { v: number; ok: boolean }>();

  const bLamp = bvBtn("", "전등 켜기");
  const bRoom = bvBtn("", "교실 불 끄기");
  const bMeas = bvBtn("main", "현재 위치에서 밝기 측정하기");
  const seg = sSegs<P>(POS.map((p) => ({ k: String(p) as P, t: `${p} cm` })), "20", (k) => {
    at = Number(k);
    f.say(`측정 기기를 전등에서 <b>${at} cm</b> 떨어진 위치에 세웠어요. <b>현재 위치에서 밝기 측정하기</b>를 눌러 보세요.`);
  });
  f.slot.setControls(sRow(bLamp, bRoom), seg.el, bMeas);

  const good = (): number => [...rec.values()].filter((r) => r.ok).length;
  bLamp.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    lamp = !lamp;
    bLamp.textContent = lamp ? "전등 끄기" : "전등 켜기";
    bLamp.classList.toggle("main", lamp);
    f.say(lamp ? "줄자의 0 cm 자리에 있는 <b>전등</b>을 켰어요." : "전등을 껐어요.");
  });
  bRoom.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    room = !room;
    bRoom.textContent = room ? "교실 불 끄기" : "교실 불 켜기";
    bRoom.classList.toggle("main", !room);
    f.say(room ? "교실 불을 켰어요." : "교실 불을 꺼서 <b>어둡게</b> 했어요.");
  });
  bMeas.addEventListener("click", () => {
    if (finished) return;
    const v = (lamp ? lampLx(at) : 0) + (room ? ROOM : 0);
    const ok = lamp && !room;
    rec.set(at, { v, ok });
    flash = 1;
    haptic(ok ? HAPTIC.correct : HAPTIC.wrong);
    f.pips(good());
    // 전등 켜기, 교실 불 끄기: 지금 그 버튼에 적힌 글(전등이 꺼져 있으면 '전등 켜기', 교실 불이 켜져 있으면 '교실 불 끄기')로 부른다
    if (!lamp) f.say(`측정값: <b>${v} lx</b>. 전등이 꺼져 있어서 전등의 밝기를 잴 수 없어요! 먼저 <b>전등 켜기</b>를 누른 뒤 다시 측정해 보세요.`);
    else if (room) f.say(`측정값: <b>${v} lx</b>. 주변의 <b>교실 조명 빛(400 lx)</b>이 섞여 들어갔어요! 전등 빛만 정확히 재려면 <b>교실 불 끄기</b>를 누른 뒤 다시 측정해 보세요.`);
    else if (good() < 5) f.say(`전등에서 ${at} cm 떨어진 곳의 밝기는 <b>${v} lx</b>예요. 기기를 <b>다른 거리</b>로 옮겨 모두 측정해 보세요.`);
    else {
      finished = true;
      [bLamp, bRoom, bMeas].forEach((b) => (b.disabled = true));
      seg.lock(true);
      f.say("20 cm부터 100 cm까지 다섯 위치의 밝기를 모두 정확하게 측정했어요!");
      tm.later(askFinal, 1400);
    }
  });

  function askFinal(): void {
    f.say("막대그래프에 표시된 20 cm(900 lx)와 40 cm(225 lx)의 높이를 비교해 보세요.");
    f.slot.ask(
      "전등까지의 거리가 20 cm에서 40 cm로 2배 멀어졌을 때 밝기는 몇 배가 되었나요?",
      [{ t: "1/4배(4분의 1)로 줄었어요", ok: true }, { t: "1/2배(절반)로 줄었어요" }, { t: "변하지 않았어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "20 cm에서 <b>900 lx</b>이던 밝기가 40 cm에서는 900 ÷ 4 = <b>225 lx</b>로, 즉 4분의 1로 줄어들었어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("광원에서 거리가 2배로 멀어지면 밝기는 4분의 1로 줄어든다는 것을 실험으로 확인했어요!");
    f.slot.conclude("광원(전등)에서 <b>멀어질수록 빛의 밝기는 어두워져요</b>. 거리가 2배로 멀어지면 밝기는 절반이 아니라 <b>4분의 1</b>로 줄어들어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, _t, dt) => {
    const x0 = 44;
    const sc = (w - x0 - 34) / 100;
    const ry = 176; // 줄자의 높이
    const tx = x0 + at * sc;
    px = px === 0 ? tx : px + (tx - px) * Math.min(1, dt * 0.2);
    if (flash > 0) flash = Math.max(0, flash - dt / 36);
    // 교실 불
    if (room) {
      ctx.fillStyle = "rgba(255,250,220,.13)";
      ctx.fillRect(0, 0, w, h);
      sBox(ctx, w / 2 - 50, 6, 100, 8, 4, "#FFF6C8");
    } else sBox(ctx, w / 2 - 50, 6, 100, 8, 4, "rgba(255,255,255,.14)");
    sText(ctx, room ? "교실 불 켜짐" : "교실 불 꺼짐", w / 2, 26, { color: room ? "#FFF3B0" : S.dim, px: 12 });
    // 책상과 줄자
    sBox(ctx, 10, ry + 12, w - 20, 10, 3, "rgba(201,154,98,.5)");
    sBox(ctx, x0, ry, 100 * sc, 12, 2, "#F4E28A");
    for (let c = 0; c <= 100; c += 10) {
      const x = x0 + c * sc;
      sLine(ctx, x, ry, x, ry + (c % 20 === 0 ? 8 : 5), "#6B5A12", 1.2);
      if (c % 20 === 0) sText(ctx, String(c), x, ry + 34, { color: S.dim, px: 12 });
    }
    sText(ctx, "cm", 16, ry + 34, { color: S.dim, px: 12 });
    // 전등(0 cm)
    if (lamp) {
      ctx.save();
      const g = ctx.createRadialGradient(x0, ry - 34, 4, x0, ry - 34, w * 0.8);
      g.addColorStop(0, "rgba(255,226,122,.5)");
      g.addColorStop(0.35, "rgba(255,226,122,.12)");
      g.addColorStop(1, "rgba(255,226,122,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 30, w, ry - 30);
      ctx.restore();
      sGlow(ctx, x0, ry - 34, 20, "#FFE27A", 0.5);
    } else {
      ctx.fillStyle = "#8D97A8";
      ctx.beginPath();
      ctx.arc(x0, ry - 34, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    sBox(ctx, x0 - 7, ry - 24, 14, 24, 3, "#5A6474");
    sText(ctx, "전등", x0, ry - 62, { color: S.ink, px: 12 });
    // 지난 기록: 잰 값에 비례한 밝기 막대(20 cm의 900 lx가 기준 높이). 잘못 잰 값은 붉게 둔다.
    if (rec.size) {
      sLine(ctx, x0 + 14, BAR_BASE, x0 + 100 * sc + 18, BAR_BASE, "rgba(232,238,249,.35)", 1);
      sText(ctx, "lx", 12, BAR_BASE - 8, { color: S.dim, px: 12, align: "left" });
    }
    const ref = rec.get(20);
    const quarter = !!ref?.ok && !!rec.get(40)?.ok;
    rec.forEach((r, d) => {
      const x = x0 + d * sc;
      const col = r.ok ? S.gold : "#FF7A85";
      const bh = Math.max(2, Math.min(BAR_MAX, (r.v / 900) * BAR_H));
      sBox(ctx, x - 12, BAR_BASE - bh, 24, bh, 3, r.ok ? "rgba(255,209,102,.88)" : "rgba(255,122,133,.85)");
      // 900 막대를 넷으로 나눈 금: 40 cm(2배 거리)의 막대가 그 한 칸(4분의 1)과 같다
      if (d === 20 && quarter) for (let q = 1; q < 4; q++) sLine(ctx, x - 12, BAR_BASE - (BAR_H * q) / 4, x + 12, BAR_BASE - (BAR_H * q) / 4, "rgba(11,21,36,.55)", 1.2);
      sText(ctx, String(r.v), x, BAR_BASE - bh - 9, { color: col, px: 13, w: 800 });
    });
    if (quarter) sLine(ctx, x0 + 20 * sc + 13, BAR_BASE - BAR_H / 4, x0 + 40 * sc - 13, BAR_BASE - BAR_H / 4, "rgba(255,209,102,.7)", 1.2, [3, 3]);
    // 스마트 기기(세워 둔 화면이 전등을 향한다)
    sBox(ctx, px - 6, ry - 62, 12, 62, 3, "#DDE5EE", "#fff", 1.5);
    sBox(ctx, px - 4, ry - 56, 3, 46, 1, flash > 0 ? "#7FE3C4" : "#4A5568");
    sText(ctx, "기기", px + 22, ry - 12, { color: S.ink, px: 12 });
  });

  f.say("줄자의 0 cm에 전등이 있어요. <b>전등</b>과 <b>교실 불</b>을 어떻게 할지 정하고, 기기를 세워 밝기를 재 보세요.");
  api.setCTA("다섯 자리의 밝기를 재 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
