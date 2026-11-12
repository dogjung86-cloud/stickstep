// [중2 Ⅷ v5] g2u8l1 pencilLab: 「팔을 펴면 연필은 몇 칸 옮겨 갈까요?」
// 책의 어디에서: 해 보기 '시차와 거리의 관계 알아보기'(칠판에 붙임딱지 7개, 연필을 들고 두 눈을 번갈아 감는다. 팔을 굽혔을 때와 폈을 때).
// 한 통찰: 보는 자리가 바뀌면 가까운 물체는 먼 배경 앞에서 옮겨 가 보이고, 가까울수록 많이 옮겨 간다.
// 학생이 정하는 것: 팔을 굽힐지 펼지, 어느 눈을 감을지. 실패하는 길: 한쪽 눈으로만 보면 옮겨 간 칸을 셀 수 없다(반대쪽 눈을 감아 봐야 한다).
// 그림은 위에서 내려다본 모습이다. 시선은 뜬 눈에서 연필 끝을 지나 칠판까지 곧게 뻗고, 닿는 번호는 그 직선으로 계산한다.

import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { S, sCanvas, sDisk, sFrame, sInk, sLine, sLog, sSegs, sText, type LabStep } from "./kit";

type Arm = "bend" | "straight";
type Eye = "L" | "R"; // 감은 눈

const BOARD_Y = 40;
const EYE_Y = 190;
const HALF = 20; // 두 눈 사이의 절반
const GAP = 40; // 붙임딱지 간격
const DIST: Record<Arm, number> = { bend: (EYE_Y - BOARD_Y) / 5, straight: (EYE_Y - BOARD_Y) / 3 };

/** 감은 눈과 팔에 따라 연필 끝이 겹쳐 보이는 칠판의 가로 자리(가운데가 0). */
const hitX = (arm: Arm, closed: Eye): number => {
  const ex = closed === "L" ? HALF : -HALF; // 뜬 눈의 자리
  return ex - (ex * (EYE_Y - BOARD_Y)) / DIST[arm];
};
const numAt = (x: number): number => Math.round(x / GAP) + 4;

export const pencilLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let arm: Arm = "bend";
  let closed: Eye | null = null;
  let hx = 0; // 시선이 닿는 자리(부드럽게 따라간다)
  let py = EYE_Y - DIST.bend;
  let finished = false;
  const seen: Record<string, boolean> = {};
  const key = (a: Arm, e: Eye): string => `${a}${e}`;

  const log = sLog(["굽힘, 왼눈 감음", "굽힘, 오른눈 감음", "폄, 왼눈 감음", "폄, 오른눈 감음"], 2, true);
  const idx = (a: Arm, e: Eye): number => (a === "bend" ? 0 : 2) + (e === "L" ? 0 : 1);
  const both = (a: Arm): boolean => !!seen[key(a, "L")] && !!seen[key(a, "R")];

  const look = (): void => {
    if (!closed || finished) return;
    seen[key(arm, closed)] = true;
    log.set(idx(arm, closed), `${numAt(hitX(arm, closed))}번`);
    f.pips((both("bend") ? 1 : 0) + (both("straight") ? 1 : 0));
    const armName = arm === "bend" ? "팔을 굽혔을 때" : "팔을 폈을 때";
    if (both(arm)) {
      const n = Math.abs(numAt(hitX(arm, "L")) - numAt(hitX(arm, "R")));
      if (both("bend") && both("straight")) {
        finished = true;
        armSeg.lock(true);
        eyeSeg.lock(true);
        f.say(`${armName} 연필이 <b>${n}칸</b> 옮겨 갔어요. 두 기록을 견주어 볼까요?`);
        tm.later(askFinal, 1300);
      } else f.say(`${armName} 연필이 <b>${n}칸</b> 옮겨 갔어요. 이번에는 <b>${arm === "bend" ? "팔을 펴고" : "팔을 굽히고"}</b> 두 눈을 번갈아 감아 보세요.`);
    } else f.say(`연필 끝이 <b>${numAt(hitX(arm, closed))}번</b>에 겹쳐 보여요. 한쪽 눈만으로는 옮겨 간 칸을 셀 수 없어요. <b>반대쪽 눈</b>도 감아 보세요.`);
  };

  const armSeg = sSegs<Arm>(
    [
      { k: "bend", t: "팔 굽히기" },
      { k: "straight", t: "팔 펴기" },
    ],
    "bend",
    (k) => {
      arm = k;
      closed = null;
      eyeSeg.set(null);
      f.say(k === "bend" ? "팔을 굽혀 연필을 눈 가까이 가져왔어요. <b>한쪽 눈을 감고</b> 연필 끝을 보세요." : "팔을 펴서 연필이 눈에서 멀어졌어요. <b>한쪽 눈을 감고</b> 연필 끝을 보세요.");
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

  function askFinal(): void {
    f.say("기록을 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "팔을 펴서 연필이 눈에서 멀어지자 옮겨 간 칸 수는?",
      [{ t: "줄었어요", ok: true }, { t: "늘었어요" }, { t: "그대로예요" }],
      (ok) => api.recordQuiz(ok),
      { why: "굽혔을 때는 <b>4칸</b>, 폈을 때는 <b>2칸</b> 옮겨 갔어요.", onNext: finish },
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
    const k = Math.min(1, dt * 0.012);
    py += (EYE_Y - DIST[arm] - py) * k;
    const target = closed ? hitX(arm, closed) : 0;
    hx += (target - hx) * k;
    // 칠판과 붙임딱지
    ctx.fillStyle = "rgba(46,96,78,.55)";
    ctx.beginPath();
    ctx.roundRect(cx - 162, BOARD_Y - 24, 324, 34, 8);
    ctx.fill();
    for (let i = 1; i <= 7; i++) {
      const x = cx + (i - 4) * GAP;
      const hit = closed && Math.abs(hx - (i - 4) * GAP) < 6;
      sDisk(ctx, x, BOARD_Y - 7, 12, hit ? S.gold : "#F3F6FB", hit ? "#fff" : undefined, 2);
      sInk(ctx, String(i), x, BOARD_Y - 6.5);
    }
    sText(ctx, "칠판", cx + 158, BOARD_Y + 22, { color: S.dim, px: 12, align: "right" });
    // 지난 기록(이 팔에서 본 두 자리)과 옮겨 간 폭
    const a = seen[key(arm, "L")];
    const b = seen[key(arm, "R")];
    if (a && b) {
      const x0 = cx + hitX(arm, "L");
      const x1 = cx + hitX(arm, "R");
      sLine(ctx, x0, BOARD_Y + 14, x1, BOARD_Y + 14, S.gold, 2.5);
      sLine(ctx, x0, BOARD_Y + 9, x0, BOARD_Y + 19, S.gold, 2.5);
      sLine(ctx, x1, BOARD_Y + 9, x1, BOARD_Y + 19, S.gold, 2.5);
      sText(ctx, `${Math.abs(numAt(hitX(arm, "L")) - numAt(hitX(arm, "R")))}칸`, cx, BOARD_Y + 28, { color: S.gold, px: 13, w: 800 });
    }
    // 시선
    if (closed) {
      const ex = cx + (closed === "L" ? HALF : -HALF);
      sLine(ctx, ex, EYE_Y, cx + hx, BOARD_Y + 4, S.sky, 2, [5, 5]);
    }
    // 팔과 연필(위에서 본 모습)
    sLine(ctx, cx + 34, EYE_Y + 6, cx + 6, py + 6, "rgba(232,238,249,.35)", 7);
    sDisk(ctx, cx, py, 6, "#F7C948", "#8A6500", 1.5);
    sText(ctx, "연필", cx + 28, py - 2, { color: S.ink, px: 12 });
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
  });

  f.say("칠판에 붙임딱지 7개가 있어요. 연필을 들고 <b>한쪽 눈을 감아</b> 연필 끝이 몇 번에 겹쳐 보이는지 확인해 보세요.");
  api.setCTA("두 눈을 번갈아 감아 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
