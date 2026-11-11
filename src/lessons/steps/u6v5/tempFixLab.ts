// u6TempFixLab (u6l5): 「온도로 문제를 풀 수 있을까?」
// 나온 곳: 해 보기 "기체의 온도와 부피 관계를 이용하여 생활 속 문제 해결하기", 스스로 확인하기의 달걀 삶기(껍데기 안쪽의 공기),
//          그림 "열기구의 원리"(가열하면 풍선이 부풀고, 기체 일부가 밖으로 밀려 나가 가벼워져 떠오른다).
// 학생이 정하는 것: 문제 1 달걀을 어떻게 삶을지(끓는 물에 바로 넣기, 찬물부터 천천히 데우기). 문제 2 풍선 속 공기의 온도(막대).
// 실패하는 길: 끓는 물에 바로 넣으면 껍데기 안쪽의 공기가 갑자기 데워져 빠르게 부풀고 껍데기에 금이 간다.
//             열기구는 덜 데우면 뜨지 않고, 식히지 않으면 내려오지 않는다.
// 판정: 바로 넣은 달걀이 터지기 쉬운 까닭 → 떠오를 때 풍선 속 입자 수(무대에 남은 두 기록으로 답한다).
// 입자 수는 온도에 맞춰 셈한다(20 ℃ 30개 기준, 풍선이 다 부푼 뒤에는 절대 온도에 반비례).
// 옛 판(버너를 꾹 눌러 목표 높이 띠에 맞추는 비행 놀이)과 다른 점: 온도를 어느 쪽으로, 얼마나 빨리 바꿀지를 학생이 정해 문제를 푼다.
// 밀폐 용기 뚜껑은 다루지 않았다(단단한 그릇은 부피가 아니라 압력이 달라지는 예라 부피 이야기로 보여 주면 틀린다).
import { haptic, HAPTIC } from "../../../core/haptics";
import { bvBtn, bvCard, bvCards, bvRange } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, pill, clamp01, ease, noteRow, chip, dots, stepDots, drawDots, type Dot } from "./u6Kit";

const T0 = 20;
const T_FULL = 45; // 여기까지는 풍선이 부풀기만 한다
const T_LIFT = 70; // 이보다 뜨거우면 뜬다
const T_MAX = 120;
const N0 = 30;
const GROUND = 206;
const CLOUD = 0.5;
const countAt = (t: number): number => (t <= T_FULL ? N0 : Math.round((N0 * (273 + T_FULL)) / (273 + t)));

export const tempFixLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-fix", label: "달걀 삶기와 열기구 띄우기", wait: "달걀을 터지지 않게 삶아 보세요" });
  const { frame, tm } = lab;
  let scene: "egg" | "balloon" = "egg";
  let phase: "egg" | "ask" | "up" | "down" | "done" = "egg";

  // ── 문제 1: 달걀 삶기 ──
  type Way = "fast" | "slow";
  let way: Way | null = null;
  let run = 0; // 삶는 동작의 진행(0~1)
  let cracked = false;
  let solved = false;
  let triedFast = false;
  const air = dots(6, 9, 0.5);
  const fast = bvCard("u6x-end", { name: "끓는 물에 바로 넣기", key: "fast" });
  const slow = bvCard("u6x-end", { name: "찬물부터 천천히 데우기", key: "slow" });
  const next = bvBtn("main", "다음 문제로");
  next.disabled = true;
  const eggNote = noteRow();
  frame.slot.setControls(bvCards(1, fast, slow), next);
  const cook = (w: Way): void => {
    if (phase !== "egg" || (run > 0 && run < 1)) return;
    way = w;
    run = 0.001;
    cracked = false;
    haptic(HAPTIC.tap);
    fast.on(w === "fast");
    slow.on(w === "slow");
    host.dataset.u6Way = w;
    frame.say(w === "fast" ? "냉장고에서 꺼낸 달걀을 끓는 물에 넣었어요. <b>공기 방</b>을 지켜보세요." : "찬물에 넣고 불을 켰어요. 물이 천천히 데워져요. <b>공기 방</b>을 지켜보세요.");
  };
  fast.el.addEventListener("click", () => cook("fast"));
  slow.el.addEventListener("click", () => cook("slow"));
  const eggDone = (): void => {
    host.dataset.u6Cooked = String(Number(host.dataset.u6Cooked ?? 0) + 1);
    if (way === "fast") {
      triedFast = true;
      haptic(HAPTIC.wrong);
      frame.say(solved ? "껍데기에 <b>금</b>이 갔어요. 속 공기가 갑자기 데워져 빠르게 부풀었어요." : "껍데기에 <b>금</b>이 갔어요. 새 달걀로 <b>다른 방법</b>을 써 보세요.");
    } else {
      solved = true;
      haptic(HAPTIC.correct);
      frame.pips(1);
      next.disabled = false;
      api.setCTA("'다음 문제로'를 눌러 이어 가요", { enabled: false });
      frame.say(triedFast ? "무사히 삶았어요. 속 공기가 <b>천천히</b> 부풀며 조금씩 빠져나갔어요." : "무사히 삶았어요. <b>끓는 물에 바로</b> 넣으면 어떨지도 해 볼 수 있어요.");
    }
  };
  next.addEventListener("click", () => {
    if (!solved || phase !== "egg") return;
    phase = "ask";
    lab.phase("ask");
    frame.say("달걀 껍데기 안쪽에는 공기가 든 작은 방이 있어요.");
    frame.slot.ask(
      "끓는 물에 <b>바로 넣은</b> 달걀이 터지기 쉬운 까닭은?",
      [{ t: "속 공기가 갑자기 데워져 빠르게 부풀어서", ok: true }, { t: "속 공기가 식어 부피가 줄어들어서" }, { t: "끓는 물이 껍데기를 녹여서" }],
      (ok) => lab.grade(ok),
      { why: "기체는 데워지면 부피가 늘어요. 갑자기 데우면 갑자기 늘어요.", onNext: toBalloon },
    );
  });

  // ── 문제 2: 열기구 ──
  let target = T0;
  let temp = T0;
  let alt = 0;
  let minN = N0;
  const ps: Dot[] = dots(N0, 26, 0.9);
  const leaving: { x: number; y: number; a: number }[] = [];
  const upChip = chip("구름 높이까지 띄우기");
  const downChip = chip("다시 땅에 내리기");
  const chips = document.createElement("div");
  chips.className = "u6x-chips";
  chips.append(upChip.el, downChip.el);
  const range = bvRange({
    cls: "u6x-rg u6x-rg-temp",
    min: 2,
    max: 12,
    value: 2,
    label: "풍선 속 공기의 온도",
    ticks: ["20 ℃", "70 ℃", "120 ℃"],
    onInput: (v) => {
      target = v * 10;
      host.dataset.u6Target = String(target);
    },
  });
  function toBalloon(): void {
    scene = "balloon";
    phase = "up";
    lab.phase("up");
    api.setCTA("열기구를 띄워 보세요", { enabled: false });
    frame.say("이번에는 열기구예요. 막대를 밀어 풍선 속 공기를 데워 <b>구름 높이</b>까지 띄워 보세요.");
    frame.slot.setControls(range.el, eggNote.el, chips);
  }
  const askCount = (): void => {
    lab.phase("ask2");
    frame.pips(2);
    range.input.disabled = true;
    frame.say("무대에 남은 두 기록을 견줘 보세요. 땅에서와 구름 높이에서예요.");
    frame.slot.ask(
      "떠오를 때 풍선 속 <b>입자 수</b>는 어떻게 됐나요?",
      [{ t: "줄었어요", ok: true }, { t: "늘었어요" }, { t: "그대로였어요" }],
      (ok) => lab.grade(ok),
      {
        why: "데워져 부푼 공기 일부가 아래 입구로 <b>밀려 나갔어요</b>.",
        onNext: () => {
          phase = "done";
          lab.phase("done");
          frame.pips(3);
          frame.say("온도를 바꾸면 기체의 부피가 달라져요.");
          frame.slot.conclude("기체는 데우면 부피가 <b>늘고</b> 식히면 <b>줄어요</b>. 이 관계를 알면 달걀을 터뜨리지 않고 삶을 수 있고, 열기구를 띄우고 내릴 수 있어요.");
          api.enableCTA(s.cta ?? "개념 정리하기");
        },
      },
    );
  };

  lab.phase("egg");
  frame.say("냉장고에서 꺼낸 달걀을 삶으려고 해요. 터지지 않게 삶을 <b>방법</b>을 골라 보세요.");

  const drawEgg = (ctx: CanvasRenderingContext2D, dt: number, tMs: number): void => {
    if (run > 0 && run < 1) {
      run = Math.min(1, run + (way === "fast" ? 0.012 : 0.006) * dt);
      if (way === "fast" && run > 0.45 && !cracked) cracked = true;
      if (run >= 1) eggDone();
    }
    // 물과 속 공기의 온도, 공기 방이 부푼 정도
    const water = way === "slow" ? 20 + 80 * run : way === "fast" ? 100 : 20;
    const airT = way === "fast" ? 5 + 90 * clamp01(run / 0.5) : way === "slow" ? 5 + 90 * run : 5;
    const grow = way ? (cracked ? 1.45 : 1 + 0.45 * (way === "fast" ? clamp01(run / 0.45) : run * 0.7)) : 1;
    const speed = way === "fast" && run < 0.5 ? 1 : way === "slow" && run < 1 ? 0.28 : 0;
    // 냄비와 물
    const px0 = 62;
    const px1 = 252;
    rr(ctx, px0, 112, px1 - px0, 96, 12);
    ctx.fillStyle = `rgba(${Math.round(70 + 150 * (water / 100))}, ${Math.round(150 - 30 * (water / 100))}, ${Math.round(230 - 140 * (water / 100))}, .32)`;
    ctx.fill();
    ctx.strokeStyle = "rgba(200,220,250,.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px0, 98);
    ctx.lineTo(px0, 198);
    ctx.quadraticCurveTo(px0, 208, px0 + 10, 208);
    ctx.lineTo(px1 - 10, 208);
    ctx.quadraticCurveTo(px1, 208, px1, 198);
    ctx.lineTo(px1, 98);
    ctx.stroke();
    if (water > 30) {
      // 불과 끓는 방울
      for (let i = 0; i < 5; i++) {
        const fx = px0 + 24 + i * 36;
        const fh = 6 + Math.sin(tMs / 80 + i) * 2;
        ctx.fillStyle = "rgba(255,160,60,.9)";
        ctx.beginPath();
        ctx.moveTo(fx - 5, 222);
        ctx.quadraticCurveTo(fx, 222 - fh * 2, fx + 5, 222);
        ctx.fill();
      }
      if (water > 90) {
        for (let i = 0; i < 6; i++) {
          const t = (tMs / 700 + i / 6) % 1;
          ctx.strokeStyle = `rgba(230,244,255,${0.7 * (1 - t)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(px0 + 16 + ((i * 53) % 170), 204 - t * 86, 2 + t * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
    // 달걀(가로로 누운 단면). 넣기 전에는 냄비 위에 있다
    const drop = way === "fast" ? clamp01(run / 0.12) : 1;
    const ex = 150;
    const ey = way === "fast" ? 64 + 96 * drop : way === "slow" ? 160 : 64;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 50, 34, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#FBF3E4";
    ctx.fill();
    ctx.strokeStyle = "#D9C7A6";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex - 12, ey + 2, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#F7C948";
    ctx.fill();
    // 공기 방(둥근 쪽 끝)
    const ar = 11 * grow;
    const ax = ex + 34;
    ctx.beginPath();
    ctx.arc(ax, ey, ar, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(20,36,66,.85)";
    ctx.fill();
    stepDots(air, ar, dt, 0.5 + (airT / 95) * 1.6);
    drawDots(ctx, air, ax, ey, 205 + (airT / 95) * 180, 2);
    txt(ctx, "공기 방", ax + 26, ey + 34, { color: "#E8EEF9" });
    ctx.strokeStyle = "rgba(232,238,249,.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ax + 24, ey + 26);
    ctx.lineTo(ax + 9, ey + 9);
    ctx.stroke();
    if (cracked) {
      ctx.strokeStyle = "#5B4630";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex + 20, ey - 31);
      ctx.lineTo(ex + 27, ey - 18);
      ctx.lineTo(ex + 19, ey - 8);
      ctx.lineTo(ex + 28, ey + 4);
      ctx.lineTo(ex + 21, ey + 14);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.75)";
      ctx.beginPath();
      ctx.ellipse(ex + 30, ey - 36, 12, 6, -0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (way === "slow" && run > 0.2 && run < 1) {
      // 천천히 부푼 공기는 껍데기의 작은 구멍으로 조금씩 빠져나간다
      for (let i = 0; i < 2; i++) {
        const t = (tMs / 1100 + i / 2) % 1;
        ctx.strokeStyle = `rgba(230,244,255,${0.9 * (1 - t)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(ex + 52 + t * 8, ey - 6 - t * 40, 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    pill(ctx, `물 ${Math.round(water)} ℃`, 12, 7, { dot: water > 60 ? "#FF9F5A" : "#5AA2F8" });
    pill(ctx, `속 공기 ${Math.round(airT)} ℃`, 334, 7, { align: "right" });
    // 공기 방이 부푸는 빠르기
    txt(ctx, "부푸는", 304, 62, { align: "center", color: "#9FB2D0" });
    txt(ctx, "빠르기", 304, 77, { align: "center", color: "#9FB2D0" });
    rr(ctx, 294, 90, 20, 96, 10);
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.fill();
    if (speed > 0) {
      rr(ctx, 294, 90 + 96 * (1 - speed), 20, 96 * speed, 10);
      ctx.fillStyle = speed > 0.6 ? "#FF7B6B" : "#7EE2A8";
      ctx.fill();
    }
    txt(ctx, speed > 0.6 ? "빨라요" : speed > 0 ? "느려요" : "멈춤", 304, 200, { align: "center", size: 13, weight: 800, color: "#E8EEF9" });
    if (run >= 1) txt(ctx, cracked ? "껍데기가 터졌어요" : "무사히 삶았어요", 150, 98, { align: "center", size: 13, weight: 800, color: cracked ? "#FF9C9C" : "#7EE2A8" });
  };

  let noteKey = "";
  const drawBalloon = (ctx: CanvasRenderingContext2D, dt: number, tMs: number): void => {
    temp = ease(temp, target, 0.045, dt);
    const fill = clamp01((temp - T0) / (T_FULL - T0));
    const lift = clamp01((temp - T_LIFT) / (T_MAX - 10 - T_LIFT));
    alt = ease(alt, lift, 0.035, dt);
    if (alt < 0.004 && lift === 0) alt = 0;
    const n = countAt(temp);
    if (phase === "up") minN = Math.min(minN, n);
    const R = 24 + 9 * fill;
    while (ps.length > n) {
      ps.pop();
      leaving.push({ x: (Math.random() - 0.5) * 10, y: 0, a: 1 });
    }
    while (ps.length < n) ps.push({ x: (Math.random() - 0.5) * 8, y: R - 8, vx: (Math.random() - 0.5) * 1.2, vy: -0.8 });
    const w = (temp - T0) / (T_MAX - T0);
    if (phase === "up" && alt >= CLOUD) {
      phase = "down";
      lab.phase("down");
      upChip.done();
      haptic(HAPTIC.select);
      api.setCTA("열기구를 다시 내려 보세요", { enabled: false });
      frame.say("구름 높이예요. 이번에는 막대를 되돌려 공기를 <b>식혀</b> 땅에 내려앉아 보세요.");
    } else if (phase === "down" && alt === 0 && target <= T_LIFT) {
      phase = "ask";
      downChip.done();
      haptic(HAPTIC.select);
      tm.later(askCount, 700);
    }
    const key = `${Math.round(temp)}|${n}`;
    if (key !== noteKey) {
      noteKey = key;
      eggNote.set(`풍선 속 공기 <b>${Math.round(temp)} ℃</b>`, `입자 <b>${n}개</b>`);
      host.dataset.u6Alt = alt.toFixed(2);
    }
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, "rgba(40,84,150,.55)");
    sky.addColorStop(1, "rgba(120,170,220,.25)");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 346, GROUND);
    ctx.fillStyle = "#2F5A46";
    ctx.fillRect(0, GROUND, 346, 24);
    const span = 96;
    const cy = GROUND - CLOUD * span; // 바구니 바닥이 이 선에 닿으면 구름 높이다
    ctx.strokeStyle = "rgba(255,255,255,.4)";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(346, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    txt(ctx, "구름 높이", 338, cy - 11, { align: "right", color: "#E8EEF9" });
    ctx.fillStyle = "rgba(255,255,255,.2)";
    for (const [x, cw] of [[214, 46], [286, 34]]) {
      rr(ctx, x, cy - 40 + Math.sin(tMs / 1400 + x) * 2, cw, 14, 7);
      ctx.fill();
    }
    const bx = 96;
    const baseY = GROUND - alt * span;
    const by = baseY - 34 - R;
    ctx.strokeStyle = "#C9B28A";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(bx - 9, baseY - 14);
    ctx.lineTo(bx - R * 0.55, by + R * 0.82);
    ctx.moveTo(bx + 9, baseY - 14);
    ctx.lineTo(bx + R * 0.55, by + R * 0.82);
    ctx.stroke();
    rr(ctx, bx - 10, baseY - 14, 20, 14, 3);
    ctx.fillStyle = "#B07A3E";
    ctx.fill();
    if (target > temp + 2) {
      const fh = 12 + Math.sin(tMs / 60) * 1.5;
      ctx.fillStyle = "rgba(255,170,60,.9)";
      ctx.beginPath();
      ctx.moveTo(bx - 4, baseY - 16);
      ctx.quadraticCurveTo(bx, baseY - 16 - fh * 1.8, bx + 4, baseY - 16);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(bx, by, R, Math.PI * 0.82, Math.PI * 0.18);
    ctx.quadraticCurveTo(bx + R * (0.3 + 0.3 * fill), by + R * 1.05, bx + 6, by + R + 8);
    ctx.lineTo(bx - 6, by + R + 8);
    ctx.quadraticCurveTo(bx - R * (0.3 + 0.3 * fill), by + R * 1.05, bx + R * Math.cos(Math.PI * 0.82), by + R * Math.sin(Math.PI * 0.82));
    ctx.closePath();
    ctx.fillStyle = `rgba(${Math.round(120 + 135 * w)}, ${Math.round(150 - 40 * w)}, ${Math.round(210 - 150 * w)}, .34)`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${Math.round(200 + 55 * w)}, ${Math.round(215 - 45 * w)}, ${Math.round(245 - 120 * w)}, .95)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    stepDots(ps, R, dt, 0.6 + w * 1.1);
    drawDots(ctx, ps, bx, by, 205 + w * 180, 2.6);
    for (const d of leaving) {
      d.y += 0.9 * dt;
      d.a -= 0.02 * dt;
      ctx.fillStyle = `rgba(255,214,138,${Math.max(0, d.a)})`;
      ctx.beginPath();
      ctx.arc(bx + d.x + (d.x > 0 ? 1 : -1) * d.y * 0.5, by + R + 10 + d.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = leaving.length - 1; i >= 0; i--) if (leaving[i].a <= 0) leaving.splice(i, 1);
    pill(ctx, `땅에서 입자 ${N0}개`, 334, 7, { dot: "#5AA2F8", align: "right" });
    if (phase !== "up") pill(ctx, `구름 높이에서 ${minN}개`, 334, 38, { dot: "#FF9F5A", align: "right" });
    txt(ctx, `${Math.round(temp)} ℃`, bx + R + 10, by - 4, { size: 14, weight: 800, color: "#FFFFFF" });
    txt(ctx, `입자 ${n}개`, bx + R + 10, by + 13, { color: "#C9D6EC" });
  };

  lab.run((ctx, dt, tMs) => (scene === "egg" ? drawEgg(ctx, dt, tMs) : drawBalloon(ctx, dt, tMs)));
  return () => lab.cleanup();
};
