// [중1 Ⅴ v5] u5l6 buoyLab: 「물속에서 눈금은 왜 줄어들까요?」
// 책의 어디에서: 탐구 '물속에서 부력 측정하기'(추가 물에 잠기기 전, 절반 정도 잠겼을 때, 완전히 잠겼을 때의 측정값과 감소한 값).
// 한 통찰: 물은 잠긴 물체를 위로 밀어 올린다(부력). 그 크기는 줄어든 눈금만큼이고, 물에 잠긴 부피가 클수록 크다.
// 학생이 정하는 것: 추의 깊이(끌기)와 기록할 때(기록하기). 세 자리를 기록한 뒤, 무게가 같고 부피가 2배인 큰 추로 바꿔 예상하고 잰다.
// 실패하는 길: 어중간하게 잠긴 자리에서 기록하면 표에 적히지 않는다. 이미 적은 자리를 또 기록해도 마찬가지다.
// 흐름: 잠기기 전, 절반, 완전히(차례는 자유) → 예상(큰 추) → 큰 추를 완전히 잠그고 기록 → 판정(왜 더 줄었나) → 결론.
// 옛 랩(buoyancyLab)은 추를 내리면 저절로 채워졌고 추가 하나였다. 값(자체 제작): 두 추 모두 20 N, 작은 추 17 N과 14 N, 큰 추 8 N.

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawForceArrow } from "../../../ui/forceProps";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCapture, bvTimers } from "../bio6/b6Lab";
import { clamp, U5, u5Canvas, u5Frame, u5Log, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}
const WY = 124; // 물의 겉면
const TOP = 100; // 추 바닥의 가장 높은 자리
const BOT = 208; // 추 바닥의 가장 낮은 자리(비커 바닥 바로 위)
const AIR = 20;
const SIZE = { small: { w: 34, h: 44, lift: 6 }, big: { w: 48, h: 62, lift: 12 } };

export const buoyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 4, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();
  const log = u5Log([{ name: "작은 추, 잠기기 전" }, { name: "작은 추, 절반 잠김" }, { name: "작은 추, 완전히 잠김" }, { name: "큰 추, 완전히 잠김" }]);
  log.el.classList.add("mini");
  const rec = bvBtn("main u5x-rec", "기록하기");
  f.slot.setControls(log.el, rec);

  let kind: "small" | "big" = "small";
  let y = TOP;
  let drag: { dy: number } | null = null;
  let lock = false;
  let asking = false; // 마지막 판정이 떠 있는 동안에는 무대의 값(물이 미는 힘)을 가린다
  const done = [false, false, false, false];

  const sub = (): number => clamp((y - WY) / SIZE[kind].h, 0, 1);
  const read = (): number => AIR - SIZE[kind].lift * sub();
  const count = (): number => done.filter(Boolean).length;

  st.cv.addEventListener("pointerdown", (e) => {
    if (lock) return;
    bvCapture(st.cv, e.pointerId);
    drag = { dy: st.pt(e).y - y };
    haptic(HAPTIC.tap);
  });
  st.cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    y = clamp(st.pt(e).y - drag.dy, TOP, BOT);
  });
  const up = (): void => {
    if (!drag) return;
    drag = null;
    // 절반 근처에서 놓으면 딱 절반에 맞춘다
    const sb = sub();
    if (sb > 0.38 && sb < 0.62) y = WY + SIZE[kind].h / 2;
  };
  st.cv.addEventListener("pointerup", up);
  st.cv.addEventListener("pointercancel", up);

  rec.addEventListener("click", () => {
    if (lock || drag) return;
    const sb = sub();
    const row = kind === "big" ? (sb === 1 ? 3 : -1) : sb === 0 ? 0 : sb === 0.5 ? 1 : sb === 1 ? 2 : -1;
    if (row < 0) {
      haptic(HAPTIC.wrong);
      f.say(kind === "big" ? "큰 추가 <b>완전히</b> 잠기게 내린 뒤에 기록해요." : "어중간하게 잠겼어요. 추가 <b>절반</b>이나 <b>완전히</b> 잠긴 자리에 맞춘 뒤 기록해요.");
      return;
    }
    if (done[row]) {
      haptic(HAPTIC.wrong);
      f.say("이미 기록한 자리예요. 추를 <b>다른 자리</b>로 옮겨 기록해 보세요.");
      return;
    }
    done[row] = true;
    haptic(HAPTIC.correct);
    const v = read();
    log.set(row, `${v.toFixed(1)} N`, row === 0 ? undefined : `${(AIR - v).toFixed(0)} N 줄어듦`);
    f.pips(count());
    if (row === 3) {
      lock = true;
      f.say("무게는 같은데 큰 추는 <b>12 N</b>이나 줄었어요. 작은 추의 2배예요.");
      tm.later(askFinal, 2400);
      return;
    }
    if (count() === 3) {
      lock = true;
      f.say("많이 잠길수록 눈금이 더 줄었어요. 다 잠긴 뒤에는 더 내려도 그대로예요. 이제 <b>큰 추</b>로 바꿔 봐요.");
      tm.later(askBig, 2000);
      return;
    }
    const left = [!done[0] && "잠기기 전", !done[1] && "절반 잠긴 자리", !done[2] && "완전히 잠긴 자리"].filter(Boolean).join(", ");
    f.say(`적었어요. 이번에는 <b>${left}</b>에서 기록해 보세요.`);
  });

  function askBig(): void {
    f.slot.ask(
      "무게는 같고 부피가 2배인 큰 추를 완전히 잠그면, 눈금은 작은 추(14 N)와 견주어 어떨까요?",
      [{ t: "14 N보다 작아요" }, { t: "똑같이 14 N이에요" }, { t: "14 N보다 커요" }],
      () => undefined,
      {
        predict: true,
        onNext: () => {
          f.slot.showControls();
          kind = "big";
          y = TOP;
          lock = false;
          log.mark(3);
          f.say("확인해 봐요. <b>큰 추</b>를 끌어 완전히 잠기게 하고 <b>기록하기</b>를 눌러요.");
          api.setCTA("큰 추를 완전히 잠가 기록해 보세요", { enabled: false });
        },
      },
    );
  }
  function askFinal(): void {
    asking = true;
    f.slot.ask(
      "두 추의 무게는 같아요. 큰 추의 눈금이 더 많이 줄어든 까닭은?",
      [{ t: "물에 잠긴 부피가 더 커서", ok: true }, { t: "더 깊이 들어가서" }, { t: "물속에서 더 무거워져서" }],
      (ok) => api.recordQuiz(ok),
      { why: "작은 추도 절반보다 완전히 잠겼을 때 더 줄었어요. <b>잠긴 부피</b>가 정해요.", onNext: finish },
    );
  }
  function finish(): void {
    asking = false;
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("물이 물체를 <b>위로 밀어 올리는 힘</b>이 있어요. 그 크기는 줄어든 눈금만큼이고, 물에 <b>잠긴 부피</b>가 클수록 커요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, t) => {
    const Z = SIZE[kind];
    const cx = w * 0.56;
    const sb = sub();
    const wy = WY - sb * (kind === "big" ? 9 : 5); // 추가 잠긴 만큼 물이 올라온다
    // 스탠드
    ctx.strokeStyle = "rgba(190,204,230,.85)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 72, h - 12);
    ctx.lineTo(cx - 72, 22);
    ctx.lineTo(cx + 6, 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 84, h - 12);
    ctx.lineTo(cx - 62, h - 12);
    ctx.stroke();
    // 힘 센서
    const sg = ctx.createLinearGradient(0, 26, 0, 58);
    sg.addColorStop(0, "#5E7FB8");
    sg.addColorStop(1, "#2E4878");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.roundRect(cx - 15, 24, 30, 30, 6);
    ctx.fill();
    ctx.fillStyle = "#0B1524";
    ctx.beginPath();
    ctx.roundRect(cx - 10, 30, 20, 11, 2);
    ctx.fill();
    ctx.fillStyle = "#7CF0B5";
    ctx.fillRect(cx - 7, 34, 14 * (read() / AIR), 3);
    // 줄
    ctx.strokeStyle = "rgba(232,238,249,.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, 54);
    ctx.lineTo(cx, y - Z.h);
    ctx.stroke();
    // 비커의 물(추 뒤)
    const bx0 = cx - 62;
    const bx1 = cx + 62;
    const by = h - 12;
    const wg = ctx.createLinearGradient(0, wy, 0, by);
    wg.addColorStop(0, "rgba(96,176,255,.42)");
    wg.addColorStop(1, "rgba(40,110,210,.55)");
    ctx.fillStyle = wg;
    ctx.fillRect(bx0 + 2, wy, bx1 - bx0 - 4, by - wy - 2);
    // 추
    const g = ctx.createLinearGradient(cx - Z.w / 2, 0, cx + Z.w / 2, 0);
    g.addColorStop(0, "#B98A1E");
    g.addColorStop(0.35, "#FFE08A");
    g.addColorStop(1, "#A8780F");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(cx - Z.w / 2, y - Z.h, Z.w, Z.h, 5);
    ctx.fill();
    ctx.fillStyle = "#C99A28";
    ctx.fillRect(cx - 4, y - Z.h - 5, 8, 6);
    // 절반 표시(추의 허리에 그은 금)
    ctx.strokeStyle = "rgba(90,60,10,.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - Z.w / 2 + 3, y - Z.h / 2);
    ctx.lineTo(cx + Z.w / 2 - 3, y - Z.h / 2);
    ctx.stroke();
    if (sb > 0) {
      ctx.fillStyle = "rgba(60,130,230,.38)";
      const top = Math.max(wy, y - Z.h);
      ctx.fillRect(cx - Z.w / 2, top, Z.w, y - top);
    }
    // 물의 겉면과 비커
    ctx.strokeStyle = "rgba(190,225,255,.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx0 + 2, wy);
    ctx.lineTo(bx1 - 2, wy);
    ctx.stroke();
    ctx.strokeStyle = "rgba(220,232,250,.75)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx0 - 4, 92);
    ctx.lineTo(bx0, 96);
    ctx.lineTo(bx0, by);
    ctx.lineTo(bx1, by);
    ctx.lineTo(bx1, 96);
    ctx.lineTo(bx1 + 4, 92);
    ctx.stroke();
    // 두 힘: 중력(아래, 늘 20 N)과 물이 미는 힘(위, 잠긴 만큼). 중력은 1 N에 2.2px.
    drawForceArrow(ctx, cx + Z.w / 2 + 12, y - Z.h / 2, 0, AIR * 2.2, { color: U5.back, width: 4 });
    u5Text(ctx, "중력 20 N", bx1 + 14, Math.min(y + 14, h - 16), { color: "#FFB3B3", px: 12, align: "left" });
    if (sb > 0.05 && !asking) {
      drawForceArrow(ctx, cx - Z.w / 2 - 12, y - Z.h / 2, 0, -(6 + Z.lift * sb * 3), { color: U5.up, width: 4 });
      u5Text(ctx, "물이 미는 힘", 14, 56, { color: "#9BE8C4", px: 12, align: "left" });
      u5Text(ctx, `${(Z.lift * sb).toFixed(1)} N`, 14, 73, { color: "#9BE8C4", px: 13, align: "left" });
    }
    if (!drag && !lock) {
      const pulse = 0.5 + 0.5 * Math.sin(t / 300);
      ctx.strokeStyle = `rgba(240,164,34,${0.4 + pulse * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - Z.w / 2 - 5 - pulse * 2, y - Z.h - 5 - pulse * 2, Z.w + 10 + pulse * 4, Z.h + 10 + pulse * 4, 8);
      ctx.stroke();
    }
    u5Read(ctx, w, read().toFixed(1), "N", "힘 센서 눈금");
    u5Pill(ctx, sb === 0 ? "물 밖" : sb < 1 ? (sb === 0.5 ? "절반 잠김" : `${Math.round(sb * 100)}% 잠김`) : "완전히 잠김", U5.push);
  });

  f.say("힘 센서에 매단 <b>추</b>를 위아래로 끌어요. 잠기기 전, <b>절반</b>, <b>완전히</b> 잠긴 자리에서 <b>기록하기</b>를 눌러 표를 채워요.");
  api.setCTA("세 자리에서 눈금을 기록해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
