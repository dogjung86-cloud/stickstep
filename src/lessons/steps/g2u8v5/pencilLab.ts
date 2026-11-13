// [중2 Ⅷ v5] g2u8l1 pencilLab: 「팔을 펴면 연필은 몇 칸 옮겨 갈까요?」
// 책의 어디에서: 해 보기 '시차와 거리의 관계 알아보기'(칠판에 붙임딱지 7개, 연필을 들고 두 눈을 번갈아 감는다. 팔을 굽혔을 때와 폈을 때).
// 한 통찰: 보는 자리가 바뀌면 가까운 물체는 먼 배경 앞에서 옮겨 가 보이고, 가까울수록 많이 옮겨 간다.
// 걸음: ① 팔을 굽히고 두 눈을 번갈아 감는다(4칸) ② 팔을 펴면 어떻게 될지 예측하고 해 본다(2칸) ③ 친구가 더 멀리서 든다(1칸) ④ 판정.
// 학생이 정하는 것: 연필까지의 거리, 어느 눈을 감을지. 실패하는 길: 한쪽 눈으로만 보면 옮겨 간 칸을 셀 수 없다(반대쪽 눈을 감아 봐야 한다).
// 그림은 위에서 내려다본 모습이다. 시선은 뜬 눈에서 연필 끝을 지나 칠판까지 곧게 뻗고, 닿는 번호는 그 직선으로 계산한다.
// 더 멀리(D/2)에서는 두 시선이 붙임딱지 사이(3번과 4번 사이, 4번과 5번 사이)에 닿는다. 폭은 꼭 1칸이다.
// 눈에서 칠판까지를 D라 하면 연필이 D/5, D/3, D/2에 있을 때 두 눈(간격이 붙임딱지 한 칸)의 시선은 칠판에서 4칸, 2칸, 1칸 벌어진다(간격 × (D/d − 1)).
// 오른쪽의 작은 칸은 뜬 눈에 보이는 모습이다(연필이 몇 번 붙임딱지에 겹치는지).

import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { S, sBox, sCanvas, sDisk, sFrame, sInk, sLine, sLog, sSegs, sText, type LabStep } from "./kit";

type Arm = "bend" | "straight" | "far";
type Eye = "L" | "R"; // 감은 눈

const BOARD_Y = 40;
const EYE_Y = 190;
const HALF = 20; // 두 눈 사이의 절반
const GAP = 40; // 붙임딱지 간격
const DIST: Record<Arm, number> = { bend: (EYE_Y - BOARD_Y) / 5, straight: (EYE_Y - BOARD_Y) / 3, far: (EYE_Y - BOARD_Y) / 2 };
const ARMS: Arm[] = ["bend", "straight", "far"];
const NAME: Record<Arm, string> = { bend: "팔을 굽혔을 때", straight: "팔을 폈을 때", far: "친구가 멀리서 들었을 때" };

/** 감은 눈과 연필의 거리에 따라 연필 끝이 겹쳐 보이는 칠판의 가로 자리(가운데가 0). */
const hitX = (arm: Arm, closed: Eye): number => {
  const ex = closed === "L" ? HALF : -HALF; // 뜬 눈의 자리
  return ex - (ex * (EYE_Y - BOARD_Y)) / DIST[arm];
};
const shift = (arm: Arm): number => Math.round(Math.abs(hitX(arm, "L") - hitX(arm, "R")) / GAP);
/** 닿는 자리의 이름. 붙임딱지 위면 "3번", 두 붙임딱지 사이면 "3번과 4번 사이". */
const spot = (x: number): string => {
  const p = x / GAP + 4;
  return Math.abs(p - Math.round(p)) < 0.1 ? `${Math.round(p)}번` : `${Math.floor(p)}번과 ${Math.floor(p) + 1}번 사이`;
};
const onSticker = (x: number, i: number): boolean => Math.abs(x / GAP + 4 - i) < 0.1;

export const pencilLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
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

  const log = sLog(["팔 굽힘", "팔 폄", "더 멀리"], 3);
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
      f.say(`연필 끝이 <b>${spot(hitX(arm, closed))}</b>에 보여요. 이번에는 <b>반대쪽 눈</b>을 감아 보세요.`);
      return;
    }
    const k = shift(arm);
    log.set(ARMS.indexOf(arm), `${k}칸`);
    f.pips(Math.min(2, ARMS.filter(both).length));
    if (arm === "bend" && open === 1) {
      f.say(`${NAME.bend} 연필이 <b>${k}칸</b> 옮겨 갔어요. 팔을 펴면 어떻게 될까요?`);
      armSeg.lock(true);
      eyeSeg.lock(true);
      tm.later(askPredict, 1300);
    } else if (arm === "straight" && open === 2) {
      open = 3;
      unlock();
      f.say(`${NAME.straight}는 <b>${k}칸</b>이에요. 친구가 연필을 들고 더 멀리 섰어요. <b>더 멀리</b>를 눌러 보세요.`);
    } else if (ARMS.every(both)) {
      finished = true;
      armSeg.lock(true);
      eyeSeg.lock(true);
      f.say(`${NAME[arm]}는 <b>${k}칸</b>이에요. 세 기록을 견주어 볼까요?`);
      tm.later(askFinal, 1400);
    } else f.say(`${NAME[arm]} 연필이 <b>${k}칸</b> 옮겨 갔어요.`);
  };

  const armSeg = sSegs<Arm>(
    [
      { k: "bend", t: "팔 굽히기" },
      { k: "straight", t: "팔 펴기" },
      { k: "far", t: "더 멀리" },
    ],
    "bend",
    (k) => {
      goArm(k);
      f.say(k === "bend" ? "연필이 눈 가까이 있어요. <b>한쪽 눈을 감고</b> 연필 끝을 보세요." : k === "straight" ? "팔을 펴서 연필이 멀어졌어요. <b>두 눈을 번갈아</b> 감아 보세요." : "친구가 든 연필은 더 멀리 있어요. <b>두 눈을 번갈아</b> 감아 보세요.");
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
      "팔을 펴서 연필이 멀어지면 몇 칸 옮겨 갈까요?",
      [{ t: "4칸보다 적게" }, { t: "4칸 그대로" }, { t: "4칸보다 많이" }],
      () => undefined,
      {
        predict: true,
        onNext: () => {
          open = 2;
          f.slot.showControls();
          eyeSeg.lock(false);
          unlock();
          goArm("straight");
          f.say("예측 완료! 팔을 폈어요. <b>두 눈을 번갈아</b> 감아 확인해 보세요.");
        },
      },
    );
  }
  function askFinal(): void {
    f.say("기록을 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "연필이 눈에서 멀어질수록 옮겨 간 칸 수는?",
      [{ t: "점점 줄었어요", ok: true }, { t: "점점 늘었어요" }, { t: "변하지 않았어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "멀어질수록 <b>4칸, 2칸, 1칸</b>으로 줄었어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("보는 자리가 바뀌면 가까운 물체는 먼 배경 앞에서 옮겨 가 보여요. 물체가 <b>가까울수록 많이</b>, <b>멀수록 적게</b> 옮겨 가요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, _t, dt) => {
    const cx = w / 2;
    const k = Math.min(1, dt * 0.2);
    py += (EYE_Y - DIST[arm] - py) * k;
    const target = closed ? hitX(arm, closed) : 0;
    hx += (target - hx) * k;
    // 칠판과 붙임딱지
    ctx.fillStyle = "rgba(46,96,78,.55)";
    ctx.beginPath();
    ctx.roundRect(cx - 162, BOARD_Y - 24, 324, 34, 8);
    ctx.fill();
    const a = seen[key(arm, "L")];
    const b = seen[key(arm, "R")];
    for (let i = 1; i <= 7; i++) {
      const x = cx + (i - 4) * GAP;
      const hit = closed && Math.abs(hx - (i - 4) * GAP) < 6;
      const was = (a && onSticker(hitX(arm, "L"), i)) || (b && onSticker(hitX(arm, "R"), i));
      sDisk(ctx, x, BOARD_Y - 7, 12, hit ? S.gold : "#F3F6FB", hit ? "#fff" : was ? S.gold : undefined, was && !hit ? 3 : 2);
      sInk(ctx, String(i), x, BOARD_Y - 6.5);
    }
    sText(ctx, "칠판", cx - 158, BOARD_Y + 22, { color: S.dim, px: 12, align: "left" });
    // 이 거리에서 본 두 자리 사이의 폭
    if (a && b) {
      const x0 = cx + hitX(arm, "L");
      const x1 = cx + hitX(arm, "R");
      sLine(ctx, x0, BOARD_Y + 14, x1, BOARD_Y + 14, S.gold, 2.5);
      sLine(ctx, x0, BOARD_Y + 9, x0, BOARD_Y + 19, S.gold, 2.5);
      sLine(ctx, x1, BOARD_Y + 9, x1, BOARD_Y + 19, S.gold, 2.5);
      sText(ctx, `${shift(arm)}칸`, cx, BOARD_Y + 28, { color: S.gold, px: 13, w: 800 });
    }
    // 시선
    if (closed) {
      const ex = cx + (closed === "L" ? HALF : -HALF);
      sLine(ctx, ex, EYE_Y, cx + hx, BOARD_Y + 4, S.sky, 2, [5, 5]);
    }
    // 팔과 연필(위에서 본 모습). 더 멀리 있을 때는 친구가 든다.
    if (arm !== "far") sLine(ctx, cx + 34, EYE_Y + 6, cx + 6, py + 6, "rgba(232,238,249,.35)", 7);
    sDisk(ctx, cx, py, 6, "#F7C948", "#8A6500", 1.5);
    sText(ctx, arm === "far" ? "친구가 든 연필" : "연필", cx - 14, py - 2, { color: S.ink, px: 12, align: "right" });
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
    // 뜬 눈에 보이는 모습(작은 칸): 연필이 몇 번 붙임딱지 앞에 겹쳐 보이는지
    if (closed) {
      const bx = 236;
      const by = 96;
      const mid = bx + 51;
      sBox(ctx, bx, by, 102, 84, 10, "rgba(20,32,60,.92)", "rgba(143,180,255,.5)", 1.2);
      sText(ctx, "눈에 보이는 모습", mid, by + 13, { color: S.dim, px: 12 });
      sBox(ctx, bx + 6, by + 25, 90, 20, 5, "rgba(46,96,78,.8)");
      const px = mid + (hx / GAP) * 12;
      for (let i = 1; i <= 7; i++) sDisk(ctx, mid + (i - 4) * 12, by + 35, 4.2, Math.abs(px - (mid + (i - 4) * 12)) < 3 ? S.gold : "#F3F6FB");
      sLine(ctx, px, by + 78, px, by + 40, "#F7C948", 5);
      sDisk(ctx, px, by + 38, 2.6, "#8A6500");
      const far = arm === "far";
      sText(ctx, far ? (hx < 0 ? "3과 4 사이" : "4와 5 사이") : spot(hitX(arm, closed)), px < mid ? bx + 96 : bx + 6, by + 64, { color: S.gold, px: 13, w: 800, align: px < mid ? "right" : "left" });
    }
  });

  f.say("칠판에 붙임딱지 7개가 있어요. 팔을 굽혀 연필을 들고 <b>한쪽 눈을 감아</b> 보세요.");
  api.setCTA("두 눈을 번갈아 감아 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
