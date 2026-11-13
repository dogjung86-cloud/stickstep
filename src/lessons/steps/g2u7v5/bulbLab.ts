// [중2 Ⅶ v5] g2u7l5 bulbLab: 「전구를 하나 더 달면 밝기는 어떻게 될까요?」
// 책의 어디에서: 디지털 해 보기 '저항의 직렬연결과 병렬연결의 특징 비교하기'(전구 한 개의 밝기를 보고, 두 개를 직렬과 병렬로 연결해 견주고, 전구 하나의 연결을 끊어 본다).
// 한 통찰: 직렬로 두 개를 달면 어두워지고 하나를 빼면 모두 꺼진다. 병렬로 달면 한 개일 때와 밝기가 같고 하나를 빼도 나머지는 그대로다.
// 학생이 정하는 것: 연결 방법, 어느 전구를 뺄지(무대의 전구를 눌러 빼고 끼운다).
// 실패하는 길: 직렬에서 전구를 하나 빼면 회로가 끊겨 남은 전구도 꺼진다. 한 개짜리 회로에서 빼면 당연히 꺼진다.
// 옛 랩(circuitLab)은 직렬과 병렬을 토글로 넘겨 보았다. 여기서는 전구를 직접 빼 보고, 전체 전류를 기록 줄에 모아 견준다.
// 값: 전지 3 V, 전구 한 개의 저항 15 Ω(자체 설정). 한 개 0.2 A, 직렬 0.1 A, 병렬 0.4 A.

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawBattery, drawBulb, drawWire } from "../../../ui/elecKit";
import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { X, xCanvas, xFrame, xLog, xPill, xRead, xSegs, xText, type LabStep } from "./kit";

type Mode = "one" | "series" | "parallel";
const BULBS: Record<Mode, [number, number][]> = {
  one: [[173, 62]],
  series: [[118, 62], [228, 62]],
  parallel: [[173, 56], [173, 118]],
};

export const bulbLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let mode: Mode = "one";
  let inPlace = [true, true];
  let finished = false;
  let ph = 0;
  const seen = { series: false, parallel: false, sOut: false, pOut: false };
  const log = xLog(["한 개", "직렬 두 개", "병렬 두 개"], 1, true);
  log.set(0, "0.2 A, 기준 밝기");

  const pick = xSegs<Mode>(
    [
      { k: "one", t: "한 개" },
      { k: "series", t: "직렬 두 개" },
      { k: "parallel", t: "병렬 두 개" },
    ],
    "one",
    (k) => {
      mode = k;
      inPlace = [true, true];
      if (k === "series") {
        seen.series = true;
        if (!seen.sOut) log.set(1, "0.1 A, 더 어두움");
        f.say("한 줄로 이었더니 두 전구 모두 <b>어두워졌어요</b>. 전구 하나를 눌러 빼 보세요.");
      } else if (k === "parallel") {
        seen.parallel = true;
        if (!seen.pOut) log.set(2, "0.4 A, 한 개일 때와 같음");
        f.say("갈래를 나눠 이었더니 밝기가 <b>한 개일 때와 같아요</b>. 전구 하나를 눌러 빼 보세요.");
      } else f.say("전구 한 개의 밝기를 잘 봐 두세요. 이 밝기가 <b>기준</b>이에요.");
      after();
    },
  );
  f.slot.setControls(pick.el, log.el);

  const state = (): { amps: number; bright: number[] } => {
    const n = mode === "one" ? 1 : 2;
    const on = inPlace.slice(0, n);
    if (mode === "one") return { amps: on[0] ? 0.2 : 0, bright: [on[0] ? 1 : 0] };
    if (mode === "series") return on[0] && on[1] ? { amps: 0.1, bright: [0.3, 0.3] } : { amps: 0, bright: [0, 0] };
    return { amps: (on[0] ? 0.2 : 0) + (on[1] ? 0.2 : 0), bright: on.map((v) => (v ? 1 : 0)) };
  };
  const after = (): void => {
    f.pips((seen.series ? 1 : 0) + (seen.parallel ? 1 : 0) + (seen.sOut ? 1 : 0) + (seen.pOut ? 1 : 0));
    if (seen.sOut && seen.pOut && !finished) {
      finished = true;
      pick.lock(true);
      tm.later(ask1, 2600);
    }
  };
  st.cv.addEventListener("pointerdown", (e) => {
    if (finished) return;
    const k = st.w() / 346;
    const p = st.pt(e);
    const i = BULBS[mode].findIndex(([x, y]) => Math.hypot(p.x / k - x, p.y / k - 12 - y) < 30);
    if (i < 0) return;
    haptic(HAPTIC.tap);
    inPlace[i] = !inPlace[i];
    const out = !inPlace[i];
    if (mode === "series" && out) {
      seen.sOut = true;
      log.set(1, "0.1 A, 하나 빼면 모두 꺼짐");
      f.say("하나를 뺐더니 남은 전구도 <b>꺼졌어요</b>. 전류가 지나갈 길이 끊겼거든요.");
    } else if (mode === "parallel" && out) {
      seen.pOut = true;
      log.set(2, "0.4 A, 하나 빼도 그대로");
      f.say("하나를 빼도 남은 전구는 <b>그대로 밝아요</b>. 다른 갈래로 전류가 흘러요.");
    } else if (mode === "one") f.say(out ? "전구를 빼자 회로가 끊겼어요. 다시 눌러 끼워요." : "다시 켜졌어요. 이번에는 전구를 <b>두 개</b> 연결해 보세요.");
    else f.say("전구를 다시 끼웠어요.");
    after();
  });

  function ask1(): void {
    f.slot.ask(
      "전구 하나를 뺐을 때 남은 전구가 그대로 켜져 있던 연결은?",
      [{ t: "병렬연결", ok: true }, { t: "직렬연결" }, { t: "두 연결 모두" }],
      (ok) => api.recordQuiz(ok),
      { why: "병렬은 갈래가 따로라 <b>다른 갈래</b>로 전류가 흘렀어요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "전구 두 개를 직렬로 연결하면 회로 전체의 전류는?",
      [{ t: "한 개일 때보다 약해져요", ok: true }, { t: "한 개일 때보다 세져요" }, { t: "한 개일 때와 같아요" }],
      () => undefined,
      { why: "한 개일 때 0.2 A, 직렬 두 개일 때 <b>0.1 A</b>였어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("전구를 <b>직렬</b>로 늘리면 어두워지고, 하나를 빼면 모두 꺼져요. <b>병렬</b>로 늘리면 밝기가 그대로이고, 하나를 빼도 나머지는 켜져 있어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, _t, dt) => {
    const k = w / 346;
    const stt = state();
    ph += (dt / 60) * stt.amps * 3;
    const P = (pts: [number, number][], on: boolean, speed = 1): void => drawWire(ctx, pts.map(([x, y]) => ({ x, y })), { on, flow: ph * speed, dir: 1, width: 3.5 });
    ctx.save();
    ctx.scale(k, k);
    ctx.translate(0, 12);
    const Lx = 44;
    const Rx = 302;
    const By = 186;
    const live = stt.amps > 0;
    // 전류는 전지의 (+)극(오른쪽)에서 나와 오른쪽으로 올라가 전구를 지나 왼쪽으로 내려와 (−)극으로 들어간다
    P([[215, By], [Rx, By], [Rx, mode === "parallel" ? 56 : 62]], live);
    P([[Lx, mode === "parallel" ? 56 : 62], [Lx, By], [131, By]], live);
    if (mode === "one") {
      P([[Rx, 62], [195, 62]], live);
      P([[151, 62], [Lx, 62]], live);
    } else if (mode === "series") {
      P([[Rx, 62], [250, 62]], live);
      P([[206, 62], [140, 62]], live);
      P([[96, 62], [Lx, 62]], live);
    } else {
      BULBS.parallel.forEach(([, y], i) => {
        const on = inPlace[i];
        P([[Rx, y], [195, y]], on, 0.5);
        P([[151, y], [Lx, y]], on, 0.5);
      });
      P([[Rx, 56], [Rx, 118]], inPlace[1], 0.5);
      P([[Lx, 118], [Lx, 56]], inPlace[1], 0.5);
    }
    drawBattery(ctx, 173, By, 84, 30, false);
    BULBS[mode].forEach(([x, y], i) => {
      if (inPlace[i]) drawBulb(ctx, x, y - 4, 20, stt.bright[i]);
      else {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#8FA4C2";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y - 4, 19, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        xText(ctx, "빼냄", x, y - 4, { px: 12, color: X.dim });
      }
    });
    xText(ctx, "전지 3 V", 173, By - 26, { px: 12, color: X.dim });
    ctx.restore();
    xRead(ctx, w, stt.amps.toFixed(1), "A", "회로 전체의 전류");
    xPill(ctx, "전구를 눌러 빼거나 끼워요", X.cur);
  });

  f.say("전구 한 개의 밝기를 잘 봐 두세요. 그다음 <b>직렬</b>과 <b>병렬</b>로 두 개를 연결해 견줘요.");
  api.setCTA("직렬과 병렬에서 전구를 빼 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
