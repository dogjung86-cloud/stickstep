// [중2 Ⅲ v5] g2u3l7 파동의 발생과 전달: 랩 두 판.
//
// 1) g2u3BallLab 「물결이 지나갈 때 물 위의 탁구공은 어떻게 움직일까요?」
//    책의 어디에서: 해 보기 '파동의 움직임 관찰하기'(사각 수조에 물을 채우고 수면이 잔잔해진 다음 탁구공을 올려놓는다. 나무 막대로 수면을 한 번 눌렀다 놓고 탁구공의 움직임을 화살표로 표시한다).
//    학생이 정하는 것: 탁구공을 띄울 자리, 막대를 누를 때. 먼저 탁구공이 어떻게 될지 예측한다(정오를 매기지 않는다).
//    실패하는 길: 수면이 잔잔해지기 전에 또 누르면 물결이 겹쳐 그 판은 기록되지 않는다(잔잔해진 뒤 다시 한다).
//    한 통찰: 물결이 퍼져 나가도 물(매질)은 제자리에서 위아래로 진동만 한다. 탁구공이 지나간 자취가 무대에 세로줄로 남는다.
//    옛 랩(waveLab)은 손잡이를 흔들어 파동을 만들고 목표 칩을 채웠다. 공의 자리를 표시해 기록하지 않았다.
//
// 2) g2u3WaveLab 「파동의 진폭과 파장은 어떻게 정해질까요?」
//    책의 어디에서: 그림 Ⅲ-15(마루, 골, 파장, 진폭)와 주기, 진동수의 정의.
//    학생이 정하는 것: 흔드는 폭과 1초에 흔드는 횟수. 주문한 모양(진동 중심에서 마루까지 3칸, 이웃한 마루 사이 2칸)을 만든다.
//    한 통찰: 진동 중심에서 마루까지가 진폭, 이웃한 마루 사이가 파장이다. 1초에 진동하는 횟수가 늘면 한 번 진동하는 시간은 그만큼 짧아진다.
//    처음 만나는 말(마루, 골, 진동 중심)은 무대의 그림에 바로 적어 둔다. 용어의 정의는 바로 뒤 개념 스텝이 붙인다.
//    옛 판은 정지 그림에서 네 요소를 찾아 누르는 문제(hotspot)였다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { LX, lxCanvas, lxFrame, lxLog, lxPill, lxSeg, lxText } from "./lxKit";

interface S {
  title: string;
  cta?: string;
}

// ══════════════════════════════════════════════════════════
// 1) 수조의 탁구공
// ══════════════════════════════════════════════════════════
const WY = 118; // 잔잔한 수면
const SX = 54; // 막대가 누르는 자리
const SPEED = 92; // 물결이 퍼지는 빠르기(px/초)
const LAMBDA = 58;
const AMP = 13;
const PULSE = LAMBDA * 1.5;

export const ballLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 3, api, tall: true });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "ball";
  host.dataset.lx = "bet";

  let bx = 150; // 탁구공의 자리
  let phase: "bet" | "play" | "end" = "bet";
  let pulses: number[] = []; // 막대를 누른 때(초)
  let clock = 0;
  let dirty = false; // 물결이 겹쳤다
  let pressAt = -9;
  let trace: [number, number] | null = null; // 공이 지나간 높이의 범위
  const recs: number[] = [];

  const log = lxLog(["1회 관찰 위치", "2회 관찰 위치"]);
  const range = bvRange({
    cls: "g2u3x-r",
    min: 110,
    max: 290,
    value: bx,
    label: "탁구공을 띄울 위치 조절",
    onInput: (v) => {
      if (phase !== "play") return;
      if (pulses.length) dirty = true; // 물결이 지나가는 동안 공을 옮기면 그 판은 버린다
      bx = v;
      trace = null;
    },
  });
  const press = bvBtn("main", "막대로 수면 누르기");
  press.dataset.k = "press";
  f.slot.setControls(range.el, log.el, press);

  /** 자리 x의 수면 높이(위가 음수). */
  const surf = (x: number): number => {
    let y = 0;
    for (const t0 of pulses) {
      const u = SPEED * (clock - t0) - (x - SX);
      if (u > 0 && u < PULSE) y -= AMP * Math.sin((2 * Math.PI * u) / LAMBDA) * Math.sin((Math.PI * u) / PULSE) * Math.max(0.55, 1 - (x - SX) / 620);
    }
    return y;
  };

  press.addEventListener("click", () => {
    if (phase !== "play") return;
    haptic(HAPTIC.tap);
    if (pulses.length) dirty = true;
    else trace = null;
    pulses.push(clock);
    pressAt = clock;
    host.dataset.lxBusy = "1";
    f.say(dirty ? "이전 물결이 아직 지나가는 중이었어요. 물결이 <b>서로 겹쳐서</b> 탁구공의 움직임을 정확히 관찰하기 어려워요." : "물결이 퍼져 나가고 있어요! <b>탁구공</b>이 처음 위치에서 옆으로 이동하는지 잘 지켜보세요.");
  });

  function settled(): void {
    host.dataset.lxBusy = "0";
    if (dirty) {
      dirty = false;
      trace = null;
      f.say("물결이 겹쳤던 실험은 기록하지 않았어요. 수면이 <b>완전히 잔잔해진 뒤</b> 버튼을 한 번만 눌러 다시 실험해 보세요.");
      return;
    }
    if (recs.some((x) => Math.abs(x - bx) < 40)) {
      f.say("이미 기록한 위치와 너무 가까워요. 슬라이더를 움직여 탁구공을 <b>다른 위치</b>로 옮긴 뒤 한 번 더 실험해 보세요.");
      return;
    }
    recs.push(bx);
    haptic(HAPTIC.correct);
    const wait = ((bx - SX) / SPEED).toFixed(1);
    log.set(recs.length - 1, `${wait}초 뒤, 제자리 진동`);
    f.pips(1 + recs.length);
    if (recs.length < 2) {
      f.say("탁구공이 위아래로 오르내린 뒤 <b>처음 위치</b>에 그대로 머물러 있어요! 이제 탁구공을 다른 위치로 옮겨 한 번 더 확인해 보세요.");
      return;
    }
    phase = "end";
    host.dataset.lx = "ask";
    f.say("위치를 바꾸니 흔들리기 시작하는 시각만 달라졌을 뿐, 이번에도 옆으로 이동하지 않고 <b>제자리</b>에서 진동했어요!");
    tm.later(() => {
      f.slot.ask(
        "물결이 오른쪽으로 퍼져 나가는 동안, 수조 속의 물 자체는 어떻게 움직였을까요?",
        [{ t: "이동하지 않고 제자리에서 위아래로만 진동했어요", ok: true }, { t: "물결과 함께 오른쪽 끝으로 이동했어요" }, { t: "나무 막대가 있는 왼쪽으로 모여들었어요" }],
        (ok) => api.recordQuiz(ok),
        // 수정안의 이유 글은 이유 칸에서 네 줄이 되어 오답 카드가 조작 칸(208px) 아래로 넘쳤다. 앞머리("물 위에 떠 있는 ")만 덜어 세 줄로 둔다.
        { why: "탁구공이 옆으로 밀려가지 않은 것을 통해, 공을 받치고 있는 <b>물(매질)</b>도 제자리에서 위아래로 진동만 한다는 것을 알 수 있어요.", onNext: finish },
      );
    }, 1600);
  }
  function finish(): void {
    host.dataset.lx = "done";
    f.say("파동이 전달될 때 매질은 어떻게 움직이는지 확인했어요! 아래 핵심 정리를 읽어 보세요.");
    f.slot.conclude("물결파가 퍼져 나가도 물(매질)은 이동하지 않고 <b>제자리에서 위아래로 진동</b>만 해요. 옆으로 퍼져 나가는 것은 물질이 아니라 <b>진동(에너지)</b>이에요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, _t, dt) => {
    clock += dt / 60;
    // 지나간 물결은 지운다
    if (pulses.length && pulses.every((t0) => SPEED * (clock - t0) > 300 + PULSE)) {
      pulses = [];
      if (phase === "play") settled();
    }
    // 수조와 물
    ctx.beginPath();
    ctx.moveTo(24, WY + surf(24));
    for (let x = 28; x <= 322; x += 4) ctx.lineTo(x, WY + surf(x));
    ctx.lineTo(322, 210);
    ctx.lineTo(24, 210);
    ctx.closePath();
    const wg = ctx.createLinearGradient(0, WY - 14, 0, 210);
    wg.addColorStop(0, "rgba(100,170,240,.55)");
    wg.addColorStop(1, "rgba(40,90,180,.45)");
    ctx.fillStyle = wg;
    ctx.fill();
    ctx.strokeStyle = "rgba(200,230,255,.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, WY + surf(24));
    for (let x = 28; x <= 322; x += 4) ctx.lineTo(x, WY + surf(x));
    ctx.stroke();
    ctx.strokeStyle = "rgba(214,230,250,.75)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(24, 70);
    ctx.lineTo(24, 210);
    ctx.lineTo(322, 210);
    ctx.lineTo(322, 70);
    ctx.stroke();
    // 처음 수면(점선)
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = "rgba(232,238,249,.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, WY);
    ctx.lineTo(322, WY);
    ctx.stroke();
    // 탁구공의 처음 자리(세로 점선)
    ctx.strokeStyle = "rgba(255,196,90,.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx, 62);
    ctx.lineTo(bx, 200);
    ctx.stroke();
    ctx.setLineDash([]);
    lxText(ctx, "처음 위치", bx, 52, { color: "rgba(255,196,90,1)" });
    // 나무 막대(누르면 잠깐 내려간다)
    const dip = Math.max(0, 1 - Math.abs(clock - pressAt - 0.12) / 0.14) * 14;
    const sg = ctx.createLinearGradient(SX - 6, 0, SX + 6, 0);
    sg.addColorStop(0, "#A9773F");
    sg.addColorStop(1, "#EBD9BA");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.roundRect(SX - 5, 30 + dip, 10, WY - 34, 3);
    ctx.fill();
    lxText(ctx, "나무 막대", SX + 40, 34, { color: LX.dim });
    // 탁구공과 지나간 자취
    const by = WY + surf(bx) - 8;
    if (pulses.length) trace = trace ? [Math.min(trace[0], by), Math.max(trace[1], by)] : [by, by];
    if (trace && trace[1] - trace[0] > 2) {
      ctx.strokeStyle = "rgba(255,255,255,.75)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx + 16, trace[0]);
      ctx.lineTo(bx + 16, trace[1]);
      ctx.moveTo(bx + 11, trace[0] + 5);
      ctx.lineTo(bx + 16, trace[0]);
      ctx.lineTo(bx + 21, trace[0] + 5);
      ctx.moveTo(bx + 11, trace[1] - 5);
      ctx.lineTo(bx + 16, trace[1]);
      ctx.lineTo(bx + 21, trace[1] - 5);
      ctx.stroke();
    }
    const bg = ctx.createRadialGradient(bx - 3, by - 3, 1, bx, by, 9);
    bg.addColorStop(0, "#FFFFFF");
    bg.addColorStop(1, "#FFB35C");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(bx, by, 9, 0, Math.PI * 2);
    ctx.fill();
    if (pulses.length) lxPill(ctx, dirty ? "물결이 겹쳤어요" : "물결이 지나가는 중이에요", dirty ? LX.red : LX.blue, true);
    else lxPill(ctx, "수면이 잔잔해요", LX.green, true);
  });

  // 먼저 내기를 건다(정오를 매기지 않는다)
  f.say("수조의 물 위에 탁구공을 띄워 놓았어요. 왼쪽의 나무 막대로 수면을 한 번 눌렀다 놓으면 오른쪽으로 물결이 퍼져 나가요.");
  api.setCTA("먼저 어떻게 될지 예측해 보세요", { enabled: false });
  f.slot.ask("퍼져 나가는 물결이 탁구공을 지나갈 때, 탁구공은 어떻게 움직일까요?", [{ t: "제자리에서 위아래로만 흔들려요" }, { t: "물결을 따라 오른쪽으로 밀려가요" }, { t: "나무 막대가 있는 왼쪽으로 끌려와요" }], () => undefined, {
    predict: true,
    nextDelay: 700,
    onNext: () => {
      phase = "play";
      host.dataset.lx = "play";
      f.pips(1);
      f.slot.showControls();
      f.say("생각을 정했군요! 탁구공을 띄울 위치를 정한 뒤 <b>막대로 수면 누르기</b>를 눌러 확인해 보세요.");
      api.setCTA("탁구공의 위치를 바꾸어 두 번 확인해 보세요", { enabled: false });
    },
  });
  return () => {
    tm.clear();
    st.stop();
  };
};

// ══════════════════════════════════════════════════════════
// 2) 파동 재기
// ══════════════════════════════════════════════════════════
const CELL = 18;
const CY = 118; // 진동 중심
const X0 = 30;
const X1 = 326;
const SLOW = 0.25; // 느린 화면
const WAVE_CELLS_PER_S = 8; // 1초에 퍼지는 칸 수

export const waveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 3, api, tall: true });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "wave";
  host.dataset.lx = "amp";

  let amp = 1; // 칸
  let freq = 1; // 1초에 진동하는 횟수
  let phase: "amp" | "len" | "end" = "amp";
  let clock = 0;

  const segA = lxSeg<"1" | "2" | "3">(
    [
      { k: "1", t: "1칸" },
      { k: "2", t: "2칸" },
      { k: "3", t: "3칸" },
    ],
    "1",
    (k) => {
      amp = Number(k);
      haptic(HAPTIC.tap);
      if (phase !== "amp") return;
      if (amp === 3) {
        phase = "len";
        host.dataset.lx = "len";
        haptic(HAPTIC.correct);
        f.pips(1);
        f.say("잘했어요! 진동 중심에서 마루까지의 높이가 3칸이 되었어요. 이 높이를 <b>진폭</b>이라고 해요. 이제 1초 동안 흔드는 횟수를 바꾸어 이웃한 마루 사이의 거리가 <b>2칸</b>이 되게 만들어 보세요.");
        api.setCTA("이웃한 마루와 마루 사이의 거리를 2칸으로 맞춰 보세요", { enabled: false });
      } else f.say(`지금은 진동 중심에서 마루까지의 높이가 <b>${amp}칸</b>이에요. <b>3칸</b>이 되도록 바꾸어 보세요.`);
    },
    "low",
  );
  const segF = lxSeg<"1" | "2" | "4">(
    [
      { k: "1", t: "1번 (1 Hz)" },
      { k: "2", t: "2번 (2 Hz)" },
      { k: "4", t: "4번 (4 Hz)" },
    ],
    "1",
    (k) => {
      freq = Number(k);
      haptic(HAPTIC.tap);
      const len = WAVE_CELLS_PER_S / freq;
      if (phase === "amp") {
        f.say(`흔드는 횟수를 바꾸면 마루 사이의 거리가 달라져요. 먼저 <b>위아래로 흔드는 폭</b>을 조절해 진동 중심에서 마루까지를 3칸으로 만들어 보세요.`);
        return;
      }
      if (phase !== "len") return;
      if (len === 2) {
        phase = "end";
        host.dataset.lx = "ask";
        haptic(HAPTIC.correct);
        f.pips(2);
        f.say("정확해요! 이웃한 마루에서 마루까지의 거리가 2칸이 되었어요. 이 거리를 <b>파장</b>이라고 하며, 지금 코르크가 한 번 진동하는 데 걸리는 시간, 곧 주기는 0.25초예요.");
        tm.later(() => {
          f.slot.ask(
            "1초 동안 2번 진동하도록 바꾸면, 코르크가 한 번 위아래로 진동하는 데 걸리는 시간은 몇 초일까요?",
            [{ t: "0.5초", ok: true }, { t: "2초" }, { t: "0.25초" }],
            (ok) => api.recordQuiz(ok),
            { why: "1초 동안 2번 진동하므로, 한 번 진동하는 데는 <b>1초의 절반인 0.5초</b>가 걸려요.", onNext: finish },
          );
        }, 3000);
      } else f.say(`지금은 이웃한 마루 사이의 거리가 <b>${len}칸</b>이에요. 1초 동안 흔드는 횟수를 바꾸어 <b>2칸</b>으로 만들어 보세요.`);
    },
    "low",
  );
  f.slot.setControls(el("div", { class: "g2u3x-cap", text: "위아래로 흔드는 폭" }), segA.el, el("div", { class: "g2u3x-cap", text: "1초 동안 흔드는 횟수(진동수)" }), segF.el);

  function finish(): void {
    host.dataset.lx = "done";
    f.pips(3);
    f.say("파동의 진폭과 파장, 진동하는 시간의 관계를 모두 확인했어요! 아래 핵심 정리를 읽어 보세요.");
    f.slot.conclude("진동 중심에서 마루나 골까지의 거리를 <b>진폭</b>, 이웃한 마루와 마루(또는 골과 골) 사이의 거리를 <b>파장</b>이라고 해요. 1초 동안 진동하는 횟수가 늘어날수록 한 번 진동하는 데 걸리는 시간은 <b>짧아져요</b>.");
    api.enableCTA(s.cta ?? "다음");
  }

  const arrowV = (ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number, color: string): void => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    const d = y1 > y0 ? -1 : 1;
    ctx.moveTo(x - 4, y1 + d * 6);
    ctx.lineTo(x, y1);
    ctx.lineTo(x + 4, y1 + d * 6);
    ctx.moveTo(x - 4, y0 - d * 6);
    ctx.lineTo(x, y0);
    ctx.lineTo(x + 4, y0 - d * 6);
    ctx.stroke();
  };

  st.run((ctx, _t, dt) => {
    clock += (dt / 60) * SLOW;
    const lam = (WAVE_CELLS_PER_S / freq) * CELL; // px
    const A = amp * CELL;
    const y = (x: number): number => CY - A * Math.sin(2 * Math.PI * (freq * clock - (x - X0) / lam));
    // 모눈
    ctx.strokeStyle = "rgba(160,190,235,.13)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = X0; x <= X1; x += CELL) {
      ctx.moveTo(x, CY - 4 * CELL);
      ctx.lineTo(x, CY + 4 * CELL);
    }
    for (let k = -4; k <= 4; k++) {
      ctx.moveTo(X0, CY + k * CELL);
      ctx.lineTo(X1, CY + k * CELL);
    }
    ctx.stroke();
    // 진동 중심
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "rgba(232,238,249,.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(X0, CY);
    ctx.lineTo(X1, CY);
    ctx.stroke();
    ctx.setLineDash([]);
    lxText(ctx, "점선: 진동 중심", X0, 14, { color: LX.dim, align: "left" });
    // 파동
    ctx.strokeStyle = "#7ED6FF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = X0; x <= X1; x += 2) {
      if (x === X0) ctx.moveTo(x, y(x));
      else ctx.lineTo(x, y(x));
    }
    ctx.stroke();
    // 가장 왼쪽의 마루와 그다음 마루(파동을 따라 움직인다)
    const phase0 = freq * clock - 0.25; // x = X0에서 마루가 되는 위상의 어긋남
    const frac = phase0 - Math.floor(phase0);
    const c1 = X0 + frac * lam + (frac * lam < CELL * 1.2 ? lam : 0);
    const c2 = c1 + lam;
    const trough = c1 + lam / 2;
    lxText(ctx, "마루", c1, CY - A - 12, { color: LX.ink, w: 800 });
    if (trough < X1 - 10) lxText(ctx, "골", trough, CY + A + 12, { color: LX.ink, w: 800 });
    // 진폭
    arrowV(ctx, X0 - 13, CY, CY - A, "#FFC45A");
    lxText(ctx, `${amp}칸`, X0 - 13, CY + 14, { color: "#FFC45A", w: 800 });
    // 마루 사이
    if (c2 < X1 - 4) {
      const yy = CY - A - 26;
      ctx.strokeStyle = "#FF8FB1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c1, yy);
      ctx.lineTo(c2, yy);
      ctx.moveTo(c1, yy - 5);
      ctx.lineTo(c1, yy + 5);
      ctx.moveTo(c2, yy - 5);
      ctx.lineTo(c2, yy + 5);
      ctx.stroke();
      lxText(ctx, `${WAVE_CELLS_PER_S / freq}칸`, (c1 + c2) / 2, yy - 10, { color: "#FF8FB1", w: 800 });
    }
    // 코르크(제자리에서 진동한다)
    const kx = X0 + 13 * CELL;
    ctx.fillStyle = "#F0A422";
    ctx.beginPath();
    ctx.arc(kx, y(kx), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 시간 줄: 코르크가 1초 동안 오르내린 모습. 1초를 네 칸(칸마다 0.25초)으로 나누고, 1초에 진동한 횟수만큼 봉우리가 선다.
    // 그래서 한 번 진동하는 시간이 칸 수로 보인다(1번이면 네 칸, 2번이면 두 칸, 4번이면 한 칸). 움직이는 점은 지금의 코르크다.
    const TS = { x: X0, y: 211, cw: 36, a: 8 };
    const tw = TS.cw * 4;
    ctx.save();
    ctx.fillStyle = "rgba(9,16,30,.6)";
    ctx.strokeStyle = "rgba(160,190,235,.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(TS.x, TS.y - 13, tw, 26, 5);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
      ctx.moveTo(TS.x + TS.cw * i, TS.y - 13);
      ctx.lineTo(TS.x + TS.cw * i, TS.y + 13);
    }
    ctx.stroke();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(232,238,249,.35)";
    ctx.beginPath();
    ctx.moveTo(TS.x + 2, TS.y);
    ctx.lineTo(TS.x + tw - 2, TS.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "#F0A422";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 96; i++) {
      const s = i / 96;
      const xx = TS.x + s * tw;
      const yy = TS.y - TS.a * Math.sin(2 * Math.PI * freq * s);
      if (i) ctx.lineTo(xx, yy);
      else ctx.moveTo(xx, yy);
    }
    ctx.stroke();
    // 지금의 코르크: 코르크의 위상이 0이 되는 때를 시간 줄의 0초로 맞춘다(움직임이 그 줄 위에서 그대로 겹친다)
    const tau = (((freq * clock - (kx - X0) / lam) / freq) % 1 + 1) % 1;
    ctx.fillStyle = "#F0A422";
    ctx.beginPath();
    ctx.arc(TS.x + tau * tw, TS.y - TS.a * Math.sin(2 * Math.PI * freq * tau), 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
    lxText(ctx, "1초", TS.x + tw + 6, TS.y, { color: LX.dim, align: "left" });
    // 코르크의 색(진폭 화살표의 노랑과 따로). 두 줄로 쓴다: 캔버스 글꼴 이름(Pretendard)을 앱이 싣지 않아 기기 글꼴로 그려지는데,
    // 그러면 "한 번 진동하는 데 0.25초"가 한 줄로 142px까지 넓어져 시간 줄 끝의 '1초'(180~200)를 덮는다. 두 줄이면 왼쪽 끝이 225 근처다.
    lxText(ctx, "한 번 진동하는 데", X1 + 6, TS.y - 7, { color: LX.gold, align: "right" });
    lxText(ctx, `${freq === 1 ? "1" : freq === 2 ? "0.5" : "0.25"}초`, X1 + 6, TS.y + 8, { color: LX.gold, align: "right" });
    lxText(ctx, "느린 화면", X1, 14, { color: LX.dim, align: "right" });
  });

  f.say("파동에서 가장 높은 곳은 <b>마루</b>, 가장 낮은 곳은 <b>골</b>이라고 해요. 먼저 <b>위아래로 흔드는 폭</b>을 바꾸어 진동 중심에서 마루까지의 높이를 <b>3칸</b>으로 만들어 보세요.");
  api.setCTA("진동 중심에서 마루까지의 높이를 3칸으로 맞춰 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
