// [중1 Ⅴ v5] u5l6 buoyLab: 「물속에서 눈금은 왜 줄어들까요?」
// 다루는 것: 물속에서 부력 측정하기(추가 물에 잠기기 전, 절반 정도 잠겼을 때, 완전히 잠겼을 때의 측정값과 감소한 값).
// 한 통찰: 물은 잠긴 물체를 위로 밀어 올린다(부력). 그 크기는 줄어든 눈금만큼이고, 물에 잠긴 부피가 클수록 크다.
// 학생이 정하는 것: 추의 깊이(끌기)와 기록할 때(기록하기). 세 자리를 기록한 뒤, 무게가 같고 부피가 2배인 큰 추로 바꿔 예상하고 잰다.
// 실패하는 길: 어중간하게 잠긴 자리에서 기록하면 표에 적히지 않는다. 이미 적은 자리를 또 기록해도 마찬가지다.
// 흐름: 잠기기 전, 절반, 완전히(차례는 자유) → 예상(큰 추) → 큰 추를 완전히 잠그고 기록 → 판정(왜 더 줄었나) → 결론.
// 옛 랩(buoyancyLab)은 추를 내리면 저절로 채워졌고 추가 하나였다. 값(자체 제작): 두 추 모두 20 N, 작은 추 17 N과 14 N, 큰 추 8 N.
// 그래픽 손질(2026-11-15, 세부보다 요점): 무대 왼쪽에 중력 20 N 막대 하나를 '센서 눈금'(위, 센서가 받치는 몫)과 '물이 미는 힘'(아래, 초록)으로 나눠 칠한다.
//   추가 잠길수록 초록이 자라고 센서 몫이 준다(줄어든 눈금 = 물이 미는 힘). 추의 두 힘은 추 가운데(작용점)에서 위아래로(1 N에 APX px).
//   판정 동안은 큰 추 곁에 작은 추의 윤곽을, 막대에는 작은 추의 몫(6 N)을 점선으로 둔다(두 추의 부피와 물이 미는 힘 비교).

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCapture, bvTimers } from "../bio6/b6Lab";
import { clamp, U5, u5Arrow, u5Canvas, u5Frame, u5Log, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
  curio?: Curio;
}
const WY = 124; // 물의 겉면
const TOP = 100; // 추 바닥의 가장 높은 자리
const BOT = 208; // 추 바닥의 가장 낮은 자리(비커 바닥 바로 위)
const AIR = 20;
const SIZE = { small: { w: 34, h: 44, lift: 6, rise: 5 }, big: { w: 48, h: 62, lift: 12, rise: 10 } }; // rise: 다 잠겼을 때 물이 오르는 높이(부피에 비례, 1 : 2)
const APX = 2; // 추의 두 화살표: 1 N에 2px(가장 낮은 자리에서도 중력 화살표가 무대 안에 든다)
// 왼쪽 막대: 위 끝 BT에서 아래 끝 BB까지가 중력 20 N
const BX = 16;
const BW = 22;
const BT = 66;
const BB = 202;

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
      f.say(`무게는 똑같이 ${AIR} N인데, 부피가 2배인 큰 추는 눈금이 <b>${SIZE.big.lift} N</b>이나 줄어 <b>${AIR - SIZE.big.lift} N</b>이 됐어요!`);
      tm.later(askFinal, 2400);
      return;
    }
    if (count() === 3) {
      lock = true;
      f.say("많이 잠길수록 눈금이 줄고, 다 잠긴 뒤엔 일정해요! 이제 부피가 2배인 <b>큰 추</b>로 바꿔 볼까요?");
      tm.later(askBig, 2000);
      return;
    }
    const left = [!done[0] && "잠기기 전", !done[1] && "절반 잠긴 자리", !done[2] && "완전히 잠긴 자리"].filter(Boolean).join(", ");
    f.say(`기록 완료! 남은 위치(<b>${left}</b>)에서도 기록해 보세요.`);
  });

  function askBig(): void {
    f.slot.ask(
      "무게는 같고 부피가 2배인 큰 추를 완전히 잠그면, 눈금은 작은 추(14 N)와 비교해 어떨까요?",
      [{ t: "14 N보다 더 작아져요 (더 많이 줄어듦)" }, { t: "작은 추와 똑같이 14 N이에요" }, { t: "14 N보다 더 커져요" }],
      () => undefined,
      {
        predict: true,
        onNext: () => {
          f.slot.showControls();
          kind = "big";
          y = TOP;
          lock = false;
          log.mark(3);
          f.say("직접 확인해 봐요! <b>큰 추</b>를 물속에 끝까지 내려 완전히 잠기게 한 뒤 <b>기록하기</b>를 눌러 보세요.");
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
      { why: "물이 밀어 올리는 힘은 무게가 아니라 물에 <b>잠긴 부피</b>가 클수록 커져요.", onNext: finish },
    );
  }
  function finish(): void {
    asking = false;
    f.say("물에 잠긴 부피가 클수록 물이 위로 밀어 올리는 힘도 커진다는 것을 확인했어요!");
    f.slot.conclude("물이 물체를 <b>위로 밀어 올리는 힘</b>이 있어요. 그 크기는 줄어든 눈금만큼이고, 물에 <b>잠긴 부피</b>가 클수록 커요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  st.run((ctx, w, h, t) => {
    const Z = SIZE[kind];
    const cx = w * 0.56;
    const sb = sub();
    const wy = WY - sb * Z.rise; // 추가 잠긴 부피만큼 물이 올라온다(큰 추는 작은 추의 2배)
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
    ctx.fillStyle = "#9CC2FF"; // 센서 화면(초록은 '물이 미는 힘'의 색이라 쓰지 않는다)
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
    // 물의 겉면과 비커(추가 잠기면 처음 수면을 점선으로 남겨 물이 오른 만큼을 보이고, 비커 오른쪽 벽에 눈금을 둔다)
    if (sb > 0.05) {
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "rgba(190,225,255,.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bx0 + 4, WY);
      ctx.lineTo(bx1 - 4, WY);
      ctx.stroke();
      ctx.restore();
    }
    ctx.strokeStyle = "rgba(190,225,255,.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx0 + 2, wy);
    ctx.lineTo(bx1 - 2, wy);
    ctx.stroke();
    ctx.strokeStyle = "rgba(220,232,250,.55)";
    ctx.lineWidth = 1.3;
    for (let gy = 114; gy <= by - 14; gy += 16) {
      ctx.beginPath();
      ctx.moveTo(bx1 - (gy % 32 === 18 ? 9 : 5), gy);
      ctx.lineTo(bx1 - 1, gy);
      ctx.stroke();
    }
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
    // 판정 동안: 큰 추 곁에 작은 추의 윤곽(무게는 같고 부피는 절반)을 옅게 둔다
    if (asking) {
      const S = SIZE.small;
      const ox = cx + Z.w / 2 + 2 + S.w / 2;
      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = "rgba(255,224,138,.8)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(ox - S.w / 2, y - S.h, S.w, S.h, 5);
      ctx.stroke();
      ctx.restore();
      u5Text(ctx, "작은 추", ox, y - S.h - 10, { color: "#FFE08A", px: 12 });
    }
    // 추의 두 힘: 추 가운데(작용점)에서 아래로 중력(늘 20 N), 위로 물이 미는 힘(잠긴 만큼). 1 N에 APX px
    const my = y - Z.h / 2;
    u5Arrow(ctx, cx, my, 0, AIR * APX, { color: U5.back, width: 4 });
    u5Text(ctx, "중력", cx - 9, my + AIR * APX - 6, { color: "#FFB3B3", px: 12, align: "right" });
    if (sb > 0.05) u5Arrow(ctx, cx, my, 0, -Z.lift * sb * APX, { color: U5.up, width: 4 });
    // 왼쪽 막대: 중력 20 N = 센서가 받치는 힘(위) + 물이 미는 힘(아래, 초록). 잠길수록 초록이 자란다
    const water = Z.lift * sb;
    const sensor = AIR - water;
    const k = (BB - BT) / AIR;
    const yb = BB - water * k;
    ctx.fillStyle = "#6F8DBF";
    ctx.fillRect(BX, BT, BW, yb - BT);
    if (water > 0) {
      const gg = ctx.createLinearGradient(BX, 0, BX + BW, 0);
      gg.addColorStop(0, "#2FA97B");
      gg.addColorStop(0.45, "#4BD3A0");
      gg.addColorStop(1, "#2B9E72");
      ctx.fillStyle = gg;
      ctx.fillRect(BX, yb, BW, BB - yb);
      ctx.strokeStyle = "#E8EEF9";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(BX - 3, yb);
      ctx.lineTo(BX + BW + 3, yb);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(232,238,249,.5)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(BX, BT, BW, BB - BT);
    // 막대 왼쪽의 빨간 괄호: 막대 전체가 중력 20 N
    ctx.strokeStyle = U5.back;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(BX - 3, BT);
    ctx.lineTo(BX - 8, BT);
    ctx.lineTo(BX - 8, BB);
    ctx.lineTo(BX - 3, BB);
    ctx.stroke();
    u5Text(ctx, "중력 20 N", BX - 8, BT - 12, { color: "#FFB3B3", px: 12.5, align: "left" });
    // 판정 동안: 작은 추의 몫(6 N)을 점선으로
    if (asking) {
      const ys = BB - SIZE.small.lift * k;
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "#FFE08A";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(BX - 3, ys);
      ctx.lineTo(BX + BW + 8, ys);
      ctx.stroke();
      ctx.restore();
      u5Text(ctx, "작은 추 6 N", BX + BW + 10, ys, { color: "#FFE08A", px: 12, align: "left" });
    }
    // 막대 오른쪽 이름표(위: 센서 몫, 아래: 물이 미는 힘)
    u5Text(ctx, "센서 눈금", BX + BW + 6, BT + 9, { color: "#B9CCEC", px: 12, align: "left" });
    u5Text(ctx, `${sensor.toFixed(1)} N`, BX + BW + 6, BT + 26, { color: "#DCE7FA", px: 13.5, align: "left" });
    u5Text(ctx, "물이 미는 힘", BX + BW + 6, BB - 25, { color: "#9BE8C4", px: 12, align: "left" });
    u5Text(ctx, `${water.toFixed(1)} N`, BX + BW + 6, BB - 8, { color: "#9BE8C4", px: 13.5, align: "left" });
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

  f.say("<b>추</b>를 위아래로 끌어 <b>물 밖</b>, <b>절반 잠김</b>, <b>완전히 잠김</b> 세 위치에서 <b>기록하기</b>를 눌러 보세요.");
  api.setCTA("세 자리에서 눈금을 기록해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
