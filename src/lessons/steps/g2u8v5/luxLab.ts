// [중2 Ⅷ v5] g2u8l2 luxLab: 「전등에서 멀어지면 밝기는 얼마나 줄까요?」
// 책의 어디에서: 탐구 '광원으로부터의 거리에 따른 빛의 밝기 실험하기'(줄자의 0 자리에 전등, 교실을 어둡게, 스마트 기기를 20 cm 간격으로 옮기며 밝기를 잰다).
// 한 통찰: 전등에서 멀어질수록 어두워지고, 거리가 2배가 되면 밝기는 4분의 1이 된다.
// 학생이 정하는 것: 전등과 교실 불을 켜고 끌지, 기기를 어디에 세울지, 언제 잴지.
// 실패하는 길: 교실 불을 켠 채 재면 값에 교실 빛(400 lx)이 섞인다. 전등을 켜지 않으면 전등 빛을 잴 수 없다. 잘못 잰 값은 붉게 남는다.
// 값: 전등 빛은 20 cm에서 900 lx이고 거리의 제곱에 반비례한다(900, 225, 100, 56, 36).

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { S, sBox, sCanvas, sFrame, sGlow, sLine, sRow, sSegs, sText, type LabStep } from "./kit";

const POS = [20, 40, 60, 80, 100];
const ROOM = 400;
const lampLx = (d: number): number => Math.round(900 * (20 / d) ** 2);
type P = "20" | "40" | "60" | "80" | "100";

export const luxLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 5, api });
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
  const bMeas = bvBtn("main", "이 자리에서 밝기 재기");
  const seg = sSegs<P>(POS.map((p) => ({ k: String(p) as P, t: `${p} cm` })), "20", (k) => {
    at = Number(k);
    f.say(`기기를 줄자의 <b>${at} cm</b> 자리에 세웠어요. <b>밝기 재기</b>를 눌러 보세요.`);
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
    if (!lamp) f.say(`<b>${v} lx</b>. 전등이 꺼져 있어 전등 빛을 잴 수 없어요. <b>전등을 켜고</b> 다시 재 보세요.`);
    else if (room) f.say(`<b>${v} lx</b>. 값에 <b>교실 빛</b>이 섞였어요. 어느 자리에서나 비슷하게 높게 나와요. 교실 불을 끄고 다시 재 보세요.`);
    else if (good() < 5) f.say(`${at} cm 자리의 밝기는 <b>${v} lx</b>예요. 기기를 <b>다른 자리</b>로 옮겨 또 재 보세요.`);
    else {
      finished = true;
      [bLamp, bRoom, bMeas].forEach((b) => (b.disabled = true));
      seg.lock(true);
      f.say("다섯 자리의 밝기를 모두 쟀어요. 기록을 견주어 볼까요?");
      tm.later(askFinal, 1400);
    }
  });

  function askFinal(): void {
    f.say("무대의 기록을 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "거리가 20 cm에서 40 cm로 2배가 되자 밝기는?",
      [{ t: "4분의 1이 됐어요", ok: true }, { t: "절반이 됐어요" }, { t: "변하지 않았어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "20 cm에서 <b>900 lx</b>, 40 cm에서 <b>225 lx</b>였어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("전등에서 <b>멀어질수록 어두워져요</b>. 거리가 2배가 되면 밝기는 절반이 아니라 <b>4분의 1</b>로 줄어요.");
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
    // 지난 기록
    rec.forEach((r, d) => {
      const x = x0 + d * sc;
      const col = r.ok ? S.gold : "#FF7A85";
      sBox(ctx, x - 24, 46, 48, 22, 7, r.ok ? "rgba(255,209,102,.16)" : "rgba(240,68,82,.18)", col, 1.2);
      sText(ctx, String(r.v), x, 57.5, { color: col, px: 13, w: 800 });
      sLine(ctx, x, 68, x, 78, col, 1.2, [2, 3]);
    });
    if (rec.size) sText(ctx, "lx", 12, 57, { color: S.dim, px: 12, align: "left" });
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
