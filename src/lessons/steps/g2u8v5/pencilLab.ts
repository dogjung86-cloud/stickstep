// [중2 Ⅷ v5] g2u8l1 pencilLab: 「팔을 펴면 엄지는 몇 칸 옮겨 갈까요?」(랩 이름은 앞 판에서 물려받았다)
// 다루는 내용: 활동(교실 뒤 벽의 번호 붙은 사물함 일곱 칸 앞에 엄지를 세우고 두 눈을 번갈아 감는다. 팔을 굽혔을 때, 반쯤 폈을 때, 쭉 폈을 때).
// 한 통찰: 보는 자리가 바뀌면 가까운 물체는 먼 배경 앞에서 옮겨 가 보이고, 가까울수록 많이 옮겨 간다.
// 걸음: ① 팔을 굽히고 두 눈을 번갈아 감는다(4칸) ② 팔을 반쯤 펴면 어떻게 될지 예측하고 해 본다(2칸) ③ 팔을 쭉 편다(1칸) ④ 판정.
// 학생이 정하는 것: 엄지까지의 거리, 어느 눈을 감을지. 실패하는 길: 한쪽 눈으로만 보면 옮겨 간 칸을 셀 수 없다(반대쪽 눈을 감아 봐야 한다).
// 그림은 위에서 내려다본 모습이다. 시선은 뜬 눈에서 엄지를 지나 사물함까지 곧게 뻗고, 닿는 번호는 그 직선으로 계산한다.
// 쭉 폈을 때(D/2)는 두 시선이 칸 사이(3번과 4번 사이, 4번과 5번 사이)에 닿는다. 폭은 꼭 1칸이다.
// 눈에서 사물함까지를 D라 하면 엄지가 D/5, D/3, D/2에 있을 때 두 눈(간격이 사물함 한 칸)의 시선은 사물함에서 4칸, 2칸, 1칸 벌어진다(간격 × (D/d − 1)).
// 오른쪽의 작은 칸은 뜬 눈에 보이는 모습이다(엄지가 몇 번 사물함에 겹치는지).
// 기록은 사물함 바로 아래에 거리마다 한 줄씩 금색 폭으로 쌓는다(4칸, 2칸, 1칸). 판정 때 조작 칸의 기록 줄이 숨어도 무대에서 세 기록을 비교할 수 있다.

import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { S, sBox, sCanvas, sDisk, sFrame, sInk, sLine, sLog, sSegs, sText, type LabStep } from "./kit";

type Arm = "bend" | "straight" | "far";
type Eye = "L" | "R"; // 감은 눈

const BOARD_Y = 40;
const EYE_Y = 190;
const HALF = 20; // 두 눈 사이의 절반
const GAP = 40; // 사물함 한 칸의 폭
const DIST: Record<Arm, number> = { bend: (EYE_Y - BOARD_Y) / 5, straight: (EYE_Y - BOARD_Y) / 3, far: (EYE_Y - BOARD_Y) / 2 };
const ARMS: Arm[] = ["bend", "straight", "far"];
const NAME: Record<Arm, string> = { bend: "팔을 굽혔을 때", straight: "팔을 반쯤 폈을 때", far: "팔을 쭉 폈을 때" };
const SHORT: Record<Arm, string> = { bend: "팔 굽힘", straight: "반쯤 폄", far: "쭉 폄" };
const ROW0 = BOARD_Y + 19; // 사물함 아래 기록 줄(옮겨 간 폭)
const ROW_GAP = 17;

/** 감은 눈과 엄지의 거리에 따라 엄지가 겹쳐 보이는 사물함의 가로 자리(가운데가 0). */
const hitX = (arm: Arm, closed: Eye): number => {
  const ex = closed === "L" ? HALF : -HALF; // 뜬 눈의 자리
  return ex - (ex * (EYE_Y - BOARD_Y)) / DIST[arm];
};
const shift = (arm: Arm): number => Math.round(Math.abs(hitX(arm, "L") - hitX(arm, "R")) / GAP);
/** 닿는 자리의 이름. 칸 가운데면 "3번", 두 칸 사이면 "3번과 4번 사이". */
const spot = (x: number): string => {
  const p = x / GAP + 4;
  return Math.abs(p - Math.round(p)) < 0.1 ? `${Math.round(p)}번` : `${Math.floor(p)}번과 ${Math.floor(p) + 1}번 사이`;
};
const onSticker = (x: number, i: number): boolean => Math.abs(x / GAP + 4 - i) < 0.1;

export const pencilLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api, tall: true });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let arm: Arm = "bend";
  let closed: Eye | null = null;
  let hx = 0; // 시선이 닿는 자리(부드럽게 따라간다)
  let py = EYE_Y - DIST.bend;
  let open = 1; // 열린 거리의 수(굽힘 → 폄 → 멀리)
  let finished = false;
  const seen: Record<string, boolean> = {};
  const key = (a: Arm, e: Eye): string => `${a}${e}`;
  const both = (a: Arm): boolean => !!seen[key(a, "L")] && !!seen[key(a, "R")];

  const log = sLog(["팔 굽힘", "반쯤 폄", "쭉 폄"], 3);
  log.el.classList.add("stack");

  const unlock = (): void => {
    armSeg.lock(false);
    ARMS.forEach((a, i) => (armSeg.btn(a).disabled = i >= open));
  };
  const goArm = (k: Arm): void => {
    arm = k;
    closed = null;
    armSeg.set(k);
    eyeSeg.set(null);
  };

  const look = (): void => {
    if (!closed || finished) return;
    seen[key(arm, closed)] = true;
    if (!both(arm)) {
      f.say(`지금은 엄지가 사물함의 <b>${spot(hitX(arm, closed))}</b> 위치에 겹쳐 보여요. 이제 <b>반대쪽 눈</b>을 감고 어디에 보이는지 확인해 보세요.`);
      return;
    }
    const k = shift(arm);
    log.set(ARMS.indexOf(arm), `${k}칸`);
    f.pips(Math.min(2, ARMS.filter(both).length));
    if (arm === "bend" && open === 1) {
      f.say(`${NAME.bend}는 엄지가 <b>${k}칸</b> 옮겨 보였어요. 팔을 반쯤 펴서 엄지가 멀어지면 어떻게 될까요?`);
      armSeg.lock(true);
      eyeSeg.lock(true);
      tm.later(askPredict, 1300);
    } else if (arm === "straight" && open === 2) {
      open = 3;
      unlock();
      // 안내는 고르기 버튼을 그 이름('쭉 펴기') 그대로 부른다
      f.say(`${NAME.straight}는 <b>${k}칸</b> 옮겨 보였어요! 이제 팔을 쭉 폈을 때도 확인해 볼까요? <b>쭉 펴기</b>를 눌러 보세요.`);
    } else if (ARMS.every(both)) {
      finished = true;
      armSeg.lock(true);
      eyeSeg.lock(true);
      // 마지막으로 다 보는 거리는 늘 '쭉 폄'이다(그 칸은 반쯤 편 기록 뒤에야 열린다)
      f.say(`팔을 쭉 폈을 때는 <b>${k}칸</b>만 옮겨 보였어요! 세 거리의 기록을 비교해 볼까요?`);
      tm.later(askFinal, 1400);
    } else f.say(`${NAME[arm]} 엄지가 <b>${k}칸</b> 옮겨 갔어요.`);
  };

  const armSeg = sSegs<Arm>(
    [
      { k: "bend", t: "팔 굽히기(가까이)" },
      { k: "straight", t: "반쯤 펴기(중간)" },
      { k: "far", t: "쭉 펴기(멀리)" },
    ],
    "bend",
    (k) => {
      goArm(k);
      f.say(k === "bend" ? "엄지가 눈 가까이에 있어요. <b>왼쪽 눈 감기</b>와 <b>오른쪽 눈 감기</b>를 차례로 눌러 엄지의 위치를 확인해 보세요." : k === "straight" ? "팔을 반쯤 펴서 엄지가 멀어졌어요. <b>두 눈을 번갈아</b> 감아 보세요." : "팔을 쭉 펴서 엄지가 더 멀어졌어요. <b>두 눈을 번갈아</b> 감아 보세요.");
    },
  );
  const eyeSeg = sSegs<Eye>(
    [
      { k: "L", t: "왼쪽 눈 감기" },
      { k: "R", t: "오른쪽 눈 감기" },
    ],
    null,
    (k) => {
      closed = k;
      look();
    },
  );
  f.slot.setControls(armSeg.el, eyeSeg.el, log.el);
  unlock();

  function askPredict(): void {
    f.slot.ask(
      "팔을 반쯤 펴서 엄지가 눈에서 멀어지면 사물함 앞에서 몇 칸 옮겨 보일까요?",
      [{ t: "4칸보다 적게 옮겨 보인다" }, { t: "4칸 그대로 옮겨 보인다" }, { t: "4칸보다 많이 옮겨 보인다" }],
      () => undefined,
      {
        predict: true,
        onNext: () => {
          open = 2;
          f.slot.showControls();
          eyeSeg.lock(false);
          unlock();
          goArm("straight");
          f.say("예측 완료! 팔을 반쯤 펴서 엄지가 멀어졌어요. <b>두 눈을 번갈아</b> 감으며 몇 칸 옮겨 보이는지 확인해 보세요.");
        },
      },
    );
  }
  function askFinal(): void {
    f.say("거리에 따라 엄지가 옮겨 보인 칸 수를 모두 기록했어요!");
    f.slot.ask(
      "관측자(눈)에서 엄지까지의 거리가 멀어질수록 옮겨 보인 칸 수는 어떻게 변했나요?",
      [{ t: "점점 줄어들었어요", ok: true }, { t: "점점 늘어났어요" }, { t: "변하지 않았어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "엄지가 멀어질수록 옮겨 보인 폭이 <b>4칸 → 2칸 → 1칸</b>으로 점점 줄어들었어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("물체가 가까울수록 두 눈으로 보았을 때 위치가 더 많이 어긋나 보인다는 것을 확인했어요!");
    f.slot.conclude("관측하는 위치(왼쪽 눈·오른쪽 눈)가 달라지면 가까운 물체는 먼 배경에 대해 위치가 옮겨 가 보여요. 이때 물체가 관측자에게 <b>가까울수록 많이</b>, <b>멀수록 적게</b> 옮겨 보여요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, _t, dt) => {
    const cx = w / 2;
    const k = Math.min(1, dt * 0.2);
    py += (EYE_Y - DIST[arm] - py) * k;
    const target = closed ? hitX(arm, closed) : 0;
    hx += (target - hx) * k;
    // 교실 뒤 벽의 사물함 일곱 칸(번호가 붙어 있다)
    ctx.fillStyle = "rgba(96,112,140,.45)";
    ctx.beginPath();
    ctx.roundRect(cx - 162, BOARD_Y - 24, 324, 34, 6);
    ctx.fill();
    const a = seen[key(arm, "L")];
    const b = seen[key(arm, "R")];
    for (let i = 1; i <= 7; i++) {
      const x = cx + (i - 4) * GAP;
      const hit = closed && !finished && Math.abs(hx - (i - 4) * GAP) < 6;
      const was = (a && onSticker(hitX(arm, "L"), i)) || (b && onSticker(hitX(arm, "R"), i));
      sBox(ctx, x - 17, BOARD_Y - 21, 34, 28, 4, "rgba(214,224,238,.16)", "rgba(200,214,234,.45)", 1.2);
      sDisk(ctx, x, BOARD_Y - 7, 9.5, hit ? S.gold : "#F3F6FB", hit ? "#fff" : was ? S.gold : undefined, was && !hit ? 3 : 2);
      sInk(ctx, String(i), x, BOARD_Y - 6.5);
    }
    sText(ctx, "사물함", cx, BOARD_Y - 30, { color: S.dim, px: 12 });
    // 기록: 두 눈으로 다 본 거리마다 사물함 앞에서 옮겨 간 폭을 한 줄씩 쌓는다(팔 굽힘, 반쯤 폄, 쭉 폄). 판정 때도 남는다.
    ARMS.forEach((am, i) => {
      if (!both(am)) return;
      const y = ROW0 + i * ROW_GAP;
      const now = am === arm && !finished;
      const x0 = cx + hitX(am, "L");
      const x1 = cx + hitX(am, "R");
      const col = now || finished ? S.gold : "rgba(255,209,102,.6)";
      const lw = now ? 2.6 : 2.2;
      sLine(ctx, x0, y, x1, y, col, lw);
      sLine(ctx, x0, y - 5, x0, y + 5, col, lw);
      sLine(ctx, x1, y - 5, x1, y + 5, col, lw);
      sText(ctx, SHORT[am], 12, y, { color: now || finished ? S.ink : S.dim, px: 12, align: "left" });
      sText(ctx, `${shift(am)}칸`, w - 12, y, { color: col, px: 13, w: 800, align: "right" });
    });
    // 시선(판정 때는 기록이 먼저라 걷는다)
    if (closed && !finished) {
      const ex = cx + (closed === "L" ? HALF : -HALF);
      sLine(ctx, ex, EYE_Y, cx + hx, BOARD_Y + 4, S.sky, 2, [5, 5]);
    }
    // 팔과 엄지(위에서 본 모습)
    sLine(ctx, cx + 34, EYE_Y + 6, cx + 6, py + 6, "rgba(232,238,249,.35)", 7);
    sDisk(ctx, cx, py, 6.5, "#F6D6BE", "#B0805E", 1.5);
    sText(ctx, "엄지", cx - 14, py - 2, { color: S.ink, px: 12, align: "right" });
    // 머리와 두 눈
    sDisk(ctx, cx, EYE_Y + 18, 30, "rgba(232,238,249,.14)", S.line);
    (["L", "R"] as Eye[]).forEach((e) => {
      const ex = cx + (e === "L" ? -HALF : HALF);
      if (closed === e) sLine(ctx, ex - 7, EYE_Y, ex + 7, EYE_Y, S.ink, 2.5);
      else {
        sDisk(ctx, ex, EYE_Y, 7, "#fff");
        sDisk(ctx, ex, EYE_Y - 1.5, 3.2, "#1B2A44");
      }
    });
    sText(ctx, "위에서 내려다본 모습", 12, EYE_Y + 26, { color: S.dim, px: 12, align: "left" });
    // 뜬 눈에 보이는 모습(작은 칸): 엄지가 몇 번 사물함 앞에 겹쳐 보이는지
    if (closed && !finished) {
      const bx = 236;
      const by = 106;
      const mid = bx + 51;
      sBox(ctx, bx, by, 102, 84, 10, "rgba(20,32,60,.92)", "rgba(143,180,255,.5)", 1.2);
      sText(ctx, "눈에 보이는 모습", mid, by + 13, { color: S.dim, px: 12 });
      sBox(ctx, bx + 6, by + 25, 90, 20, 3, "rgba(96,112,140,.8)");
      const px = mid + (hx / GAP) * 12;
      for (let i = 1; i <= 7; i++) sDisk(ctx, mid + (i - 4) * 12, by + 35, 4.2, Math.abs(px - (mid + (i - 4) * 12)) < 3 ? S.gold : "#F3F6FB");
      sLine(ctx, px, by + 78, px, by + 44, "#F6D6BE", 7);
      sDisk(ctx, px, by + 42, 4.2, "#F6D6BE", "#B0805E", 1.2);
      const far = arm === "far";
      sText(ctx, far ? (hx < 0 ? "3과 4 사이" : "4와 5 사이") : spot(hitX(arm, closed)), px < mid ? bx + 96 : bx + 6, by + 64, { color: S.gold, px: 13, w: 800, align: px < mid ? "right" : "left" });
    }
  });

  f.say("교실 뒤 벽에 1번부터 7번까지 번호가 붙은 사물함이 있어요. 먼저 팔을 굽혀 엄지를 눈 가까이 세우고 <b>왼쪽 눈</b>과 <b>오른쪽 눈</b>을 번갈아 감아 보세요.");
  api.setCTA("두 눈을 번갈아 감아 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
