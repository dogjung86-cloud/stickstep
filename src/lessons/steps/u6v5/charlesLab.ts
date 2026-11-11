// u6CharlesLab (u6l4): 「데우면 부피는 어떻게 될까?」
// 끝을 마개로 막은 주사기를 물에 담근다(실험 그대로: 뜨거운 물과 얼음물). 막대로 물의 온도를 10 ℃씩 바꾸면
// 피스톤이 밀려 올라가거나 내려오고, 온도마다 부피가 그래프에 점으로 찍힌다.
//   1 뜨거운 물(80 ℃)과 얼음물(0 ℃)에 모두 담가 본다
//   2 판정 둘: 10 ℃ 오를 때마다 부피는(늘 같은 만큼) → 온도가 오를 때 입자는(빨라져 벽을 세게 민다)
// 수치는 정본과 같다: 20 ℃에서 30.0 mL, 10 ℃마다 1.0 mL(50 ℃ 33.0 mL, 80 ℃ 36.0 mL). 뒤의 문제가 이 값을 묻는다.
// 입자의 빠르기는 온도에 따라 달라지고 개수는 그대로다(ui/gasKit).
import { haptic, HAPTIC } from "../../../core/haptics";
import { GasBox, type GasBounds } from "../../../ui/gasKit";
import { bvRange } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, pill, ease, noteRow, chip } from "./u6Kit";

const N = 12;
const volOf = (t: number): number => 28 + t * 0.1;
const BX0 = 66;
const BX1 = 110;
const BOT = 198;
const PXV = 3.4; // 1 mL의 높이

export const charlesLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-charles", label: "물에 담근 주사기와 온도, 부피 그래프", wait: "뜨거운 물과 얼음물에 담가 보세요" });
  const { frame, tm } = lab;
  const box = new GasBox(1.5);
  let temp = 20;
  let shownT = 20; // 주사기 속 기체의 온도(물의 온도를 뒤따라간다)
  const seen = new Set<number>([20]);
  let phase: "play" | "ask" | "done" = "play";
  let line = 0;
  let asked = false;
  const bounds = (v: number): GasBounds => ({ x0: BX0, y0: BOT - v * PXV, x1: BX1, y1: BOT });
  box.setCount(N, bounds(volOf(20)));

  const note = noteRow();
  const hot = chip("뜨거운 물 80 ℃");
  const ice = chip("얼음물 0 ℃");
  const chips = document.createElement("div");
  chips.className = "u6x-chips";
  chips.append(hot.el, ice.el);
  const range = bvRange({
    cls: "u6x-rg u6x-rg-temp",
    min: 0,
    max: 8,
    value: 2,
    label: "물의 온도",
    ticks: [
      { t: "얼음물", p: 0 },
      { t: "20 ℃", p: 25 },
      { t: "50 ℃", p: 62.5 },
      { t: "뜨거운 물", p: 100 },
    ],
    onInput: (v) => {
      temp = v * 10;
      haptic(HAPTIC.tap);
      sync();
    },
  });
  frame.slot.setControls(range.el, note.el, chips);

  function sync(): void {
    note.set(`물 <b>${temp} ℃</b>`, `기체의 부피 <b>${volOf(temp).toFixed(1)} mL</b>`);
    host.dataset.u6T = String(temp);
    range.input.setAttribute("aria-valuetext", `${temp} ℃`);
  }

  const askParticles = (): void => {
    frame.pips(2);
    frame.say("막대를 움직일 때 주사기 속 <b>입자</b>의 움직임을 떠올려 보세요.");
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
          frame.say("점들이 반듯한 직선 위에 놓였어요.");
          frame.slot.conclude("압력이 같을 때 온도가 오르면 입자가 <b>빨라져</b> 벽을 더 세게 밀고, 기체의 부피가 <b>일정한 비율로</b> 늘어요. 식히면 그만큼 줄어요.");
          api.enableCTA(s.cta ?? "개념 정리하기");
        },
      },
    );
  };

  const askStep = (): void => {
    phase = "ask";
    lab.phase("ask");
    frame.pips(1);
    range.input.disabled = true;
    frame.say("그래프의 점을 보세요. 0 ℃에서 28 mL, 80 ℃에서 36 mL예요.");
    frame.slot.ask(
      "온도가 <b>10 ℃</b> 오를 때마다 부피는 얼마나 늘었나요?",
      [{ t: "늘 같은 만큼(1 mL씩)", ok: true }, { t: "뜨거울수록 더 많이" }, { t: "뜨거울수록 더 조금" }],
      (ok) => lab.grade(ok),
      { why: "같은 만큼씩 늘어서 점들이 <b>직선</b>이 돼요.", onNext: askParticles },
    );
  };

  lab.phase("play");
  frame.say("끝을 막은 주사기를 물에 담갔어요. 막대를 밀어 <b>뜨거운 물</b>로 바꿔 보세요.");
  sync();

  const GX0 = 196;
  const GX1 = 326;
  const GY0 = 62;
  const GY1 = 186;
  const gx = (t: number): number => GX0 + 8 + (t / 80) * (GX1 - GX0 - 14);
  const gy = (v: number): number => GY1 - ((v - 27) / 10) * (GY1 - GY0);

  lab.run((ctx, dt, tMs) => {
    shownT = ease(shownT, temp, 0.07, dt);
    // 온도가 자리를 잡으면 그 온도의 점을 찍는다
    if (phase === "play" && Math.abs(shownT - temp) < 0.6 && !seen.has(temp)) {
      seen.add(temp);
      haptic(HAPTIC.select);
      if (temp === 80) hot.done();
      if (temp === 0) ice.done();
      if (seen.has(80) && seen.has(0)) {
        if (!asked) {
          asked = true;
          api.setCTA("그래프를 살펴보고 있어요", { enabled: false });
          frame.say("얼음물에서는 줄고 뜨거운 물에서는 늘었어요. 점을 이으면 <b>직선</b>이에요.");
          tm.later(askStep, 1600);
        }
      } else if (temp === 80) frame.say("피스톤이 <b>밀려 올라갔어요</b>. 이번에는 <b>얼음물</b>까지 내려 보세요.");
      else if (temp === 0) frame.say("피스톤이 <b>내려갔어요</b>. 이번에는 <b>뜨거운 물</b>까지 올려 보세요.");
    }
    if (asked) line = Math.min(1, line + 0.02 * dt);
    const v = volOf(shownT);
    const b = bounds(v);
    for (const p of box.parts) {
      if (p.y < b.y0 + 5) {
        p.y = b.y0 + 5;
        p.vy = Math.abs(p.vy); // 내려오는 피스톤에 밀린 입자는 아래로 튕긴다
      }
    }
    const k = Math.sqrt((273 + shownT) / 293);
    const sp = 0.55 + (k - 0.965) * 6.2; // 빠르기 차이를 눈에 보이게 벌린다(0 ℃ 0.55배, 80 ℃ 1.35배쯤)
    box.step(dt, b, sp);

    // 물(온도에 따라 색이 바뀐다)과 비커
    const w = shownT / 80;
    const col = `rgba(${Math.round(60 + 170 * w)}, ${Math.round(150 - 30 * w)}, ${Math.round(235 - 150 * w)}, .34)`;
    rr(ctx, 26, 64, 124, 148, 10);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = "rgba(190,214,250,.55)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(24, 48);
    ctx.lineTo(24, 204);
    ctx.quadraticCurveTo(24, 214, 34, 214);
    ctx.lineTo(142, 214);
    ctx.quadraticCurveTo(152, 214, 152, 204);
    ctx.lineTo(152, 48);
    ctx.stroke();
    // 얼음 조각, 김
    if (shownT < 8) {
      ctx.fillStyle = `rgba(225,242,255,${(0.75 * (8 - shownT)) / 8})`;
      for (const [x, y] of [[34, 70], [40, 98], [126, 152], [34, 160]]) {
        rr(ctx, x, y + Math.sin(tMs / 500 + x) * 1.5, 14, 12, 3);
        ctx.fill();
      }
    }
    if (shownT > 60) {
      ctx.strokeStyle = `rgba(255,255,255,${((shownT - 60) / 20) * 0.4})`;
      ctx.lineWidth = 2;
      for (const x of [44, 132]) {
        ctx.beginPath();
        const ph = tMs / 400 + x;
        ctx.moveTo(x, 58);
        ctx.quadraticCurveTo(x + Math.sin(ph) * 6, 46, x, 36);
        ctx.stroke();
      }
    }
    // 주사기(세로): 통, 마개, 입자, 피스톤
    rr(ctx, BX0 - 4, 30, BX1 - BX0 + 8, BOT - 30 + 4, 6);
    ctx.fillStyle = "rgba(200,220,250,.10)";
    ctx.fill();
    ctx.strokeStyle = "rgba(205,224,252,.6)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    rr(ctx, BX0 + 10, BOT + 3, BX1 - BX0 - 20, 9, 3);
    ctx.fillStyle = "#E8794A";
    ctx.fill();
    for (const mv of [28, 30, 32, 34, 36]) {
      const y = BOT - mv * PXV;
      ctx.strokeStyle = "rgba(205,224,252,.55)";
      ctx.beginPath();
      ctx.moveTo(BX1 - 9, y);
      ctx.lineTo(BX1 + 4, y);
      ctx.stroke();
    }
    txt(ctx, "36", BX1 + 8, BOT - 36 * PXV, { color: "#C9D6EC" });
    txt(ctx, "28", BX1 + 8, BOT - 28 * PXV, { color: "#C9D6EC" });
    box.draw(ctx, 205 + w * 180, sp);
    rr(ctx, BX0 - 1, b.y0 - 8, BX1 - BX0 + 2, 8, 3);
    ctx.fillStyle = "#A9BCDB";
    ctx.fill();
    ctx.fillStyle = "#7F95B9";
    ctx.fillRect((BX0 + BX1) / 2 - 4, b.y0 - 8 - 34, 8, 34);
    rr(ctx, BX0 + 4, b.y0 - 8 - 40, BX1 - BX0 - 8, 7, 3);
    ctx.fill();

    pill(ctx, `${Math.round(shownT)} ℃`, 12, 7, { dot: w > 0.5 ? "#FF9F5A" : "#5AA2F8" });
    pill(ctx, `${v.toFixed(1)} mL`, 334, 7, { align: "right" });

    // 그래프
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(GX0, GY0 - 6);
    ctx.lineTo(GX0, GY1);
    ctx.lineTo(GX1 + 4, GY1);
    ctx.stroke();
    txt(ctx, "부피(mL)", GX0 - 8, GY0 - 16, { color: "#9FB2D0" });
    txt(ctx, "온도(℃)", GX1 + 6, GY1 + 28, { color: "#9FB2D0", align: "right" });
    for (const t of [0, 20, 40, 60, 80]) txt(ctx, String(t), gx(t), GY1 + 12, { align: "center", color: "#8FA3C4" });
    for (const mv of [28, 32, 36]) txt(ctx, String(mv), GX0 - 6, gy(mv), { align: "right", color: "#8FA3C4" });
    if (line > 0) {
      ctx.strokeStyle = "rgba(255,190,120,.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx(0), gy(28));
      ctx.lineTo(gx(80 * line), gy(volOf(80 * line)));
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(gx(shownT), gy(v), 6, 0, Math.PI * 2);
    ctx.stroke();
    for (const t of seen) {
      ctx.fillStyle = "#FFD68A";
      ctx.beginPath();
      ctx.arc(gx(t), gy(volOf(t)), 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return () => lab.cleanup();
};
