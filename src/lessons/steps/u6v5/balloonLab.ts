// u6BalloonLab (u6l5): 「열기구는 어떻게 떠오를까?」
// 버너 버튼을 꾹 누르는 동안 풍선 속 공기가 데워진다. 손을 떼면 식는다.
//   1 데우면 풍선이 부풀고(온도가 오르면 부피가 는다), 다 부푼 뒤에는 입자 일부가 아래 입구로 밀려 나간다. 가벼워져 떠오른다
//   2 구름 높이까지 올라간 뒤 손을 떼고 땅에 내려앉는다(식으면 바깥 공기가 다시 들어온다)
//   3 판정: 떠오를 때 풍선 속 입자 수는(줄었다). 근거는 무대에 남은 두 기록(땅에서, 구름 높이에서)
// 목표는 한 점이 아니라 "구름 높이 이상"이다. 입자 수는 온도에 맞춰 계산한다(20 ℃ 30개 기준, 풍선이 다 부푼 뒤에는 절대 온도에 반비례).
import { haptic, HAPTIC } from "../../../core/haptics";
import { bvBtn, bvCapture } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, pill, clamp01, ease, noteRow, dots, stepDots, drawDots, type Dot } from "./u6Kit";

const T0 = 20;
const T_FULL = 45; // 여기까지는 풍선이 부풀기만 한다
const T_LIFT = 70; // 이보다 뜨거우면 뜬다
const T_MAX = 120;
const N0 = 30;
const GROUND = 206;
const CLOUD = 0.5; // 이 높이(0~1) 이상이면 구름 높이
const countAt = (t: number): number => (t <= T_FULL ? N0 : Math.round((N0 * (273 + T_FULL)) / (273 + t)));

export const balloonLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-balloon", label: "버너로 풍선 속 공기를 데우는 열기구", wait: "버너를 꾹 눌러 떠올라 보세요" });
  const { frame, tm } = lab;
  let temp = T0;
  let alt = 0;
  let holding = false;
  let phase: "up" | "down" | "ask" | "done" = "up";
  let minN = N0;
  let ps: Dot[] = dots(N0, 26, 0.9);
  const leaving: { x: number; y: number; a: number }[] = [];
  let flame = 0;

  const burner = bvBtn("main u6x-hold", "버너 켜기");
  burner.append(Object.assign(document.createElement("small"), { textContent: "누르고 있는 동안 데워져요" }));
  const note = noteRow();
  frame.slot.setControls(burner, note.el);
  const press = (on: boolean): void => {
    if (phase !== "up" && phase !== "down") on = false;
    if (holding === on) return;
    holding = on;
    burner.classList.toggle("on", on);
    if (on) haptic(HAPTIC.tap);
  };
  burner.addEventListener("pointerdown", (e) => {
    bvCapture(burner, e.pointerId);
    press(true);
  });
  burner.addEventListener("pointerup", () => press(false));
  burner.addEventListener("pointercancel", () => press(false));
  burner.addEventListener("contextmenu", (e) => e.preventDefault());
  // 키보드: 누를 때마다 조금씩 데운다
  burner.addEventListener("click", (e) => {
    if (e.detail === 0 && (phase === "up" || phase === "down")) temp = Math.min(T_MAX, temp + 18);
  });

  const askCount = (): void => {
    phase = "ask";
    lab.phase("ask");
    frame.pips(2);
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
          frame.say("풍선 속 공기의 온도가 열기구를 올리고 내려요.");
          frame.slot.conclude("공기를 데우면 부피가 늘어 풍선이 부풀고, 일부가 <b>밖으로 밀려 나가요</b>. 그만큼 가벼워져 떠오르고, 식으면 다시 내려와요.");
          api.enableCTA(s.cta ?? "개념 정리하기");
        },
      },
    );
  };

  lab.phase("up");
  frame.say("<b>버너 켜기</b>를 꾹 눌러 풍선 속 공기를 데워요. <b>구름 높이</b>까지 올라가 보세요.");

  let noteKey = "";
  lab.run((ctx, dt, tMs) => {
    // 온도: 누르는 동안 오르고, 떼면 식는다
    temp = holding ? Math.min(T_MAX, temp + 0.6 * dt) : Math.max(T0, temp - 0.36 * dt);
    flame = ease(flame, holding ? 1 : 0, 0.3, dt);
    const fill = clamp01((temp - T0) / (T_FULL - T0));
    const lift = clamp01((temp - T_LIFT) / (T_MAX - 10 - T_LIFT));
    alt = ease(alt, lift, 0.035, dt);
    if (alt < 0.004 && lift === 0) alt = 0;
    const n = countAt(temp);
    minN = Math.min(minN, n);
    // 입자 수 맞추기: 줄면 아래 입구로 나가고, 늘면 입구에서 들어온다
    const R = 24 + 9 * fill;
    while (ps.length > n) {
      ps.pop();
      leaving.push({ x: (Math.random() - 0.5) * 10, y: 0, a: 1 });
    }
    while (ps.length < n) ps.push({ x: (Math.random() - 0.5) * 8, y: R - 8, vx: (Math.random() - 0.5) * 1.2, vy: -0.8 });
    const sp = 0.6 + ((temp - T0) / (T_MAX - T0)) * 1.1;

    // 국면
    if (phase === "up" && alt >= CLOUD) {
      phase = "down";
      lab.phase("down");
      haptic(HAPTIC.select);
      frame.pips(1);
      api.setCTA("손을 떼고 내려앉아 보세요", { enabled: false });
      frame.say("구름 높이예요. 이제 <b>손을 떼고</b> 기다려 땅에 내려앉아 보세요.");
    } else if (phase === "down" && alt === 0 && !holding) {
      phase = "ask";
      tm.later(askCount, 700);
    }
    const key = `${Math.round(temp)}|${n}`;
    if (key !== noteKey) {
      noteKey = key;
      note.set(`풍선 속 공기 <b>${Math.round(temp)} ℃</b>`, `입자 <b>${n}개</b>`);
      host.dataset.u6Alt = alt.toFixed(2);
    }

    // 하늘, 구름 높이, 땅
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
    for (const [x, w] of [[214, 46], [286, 34]]) {
      rr(ctx, x, cy - 40 + Math.sin(tMs / 1400 + x) * 2, w, 14, 7);
      ctx.fill();
    }

    // 열기구
    const bx = 96;
    const baseY = GROUND - alt * span; // 바구니 바닥
    const by = baseY - 34 - R;
    // 바구니와 줄
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
    // 불꽃
    if (flame > 0.03) {
      const fh = 12 * flame + Math.sin(tMs / 60) * 1.5;
      ctx.fillStyle = `rgba(255,170,60,${0.9 * flame})`;
      ctx.beginPath();
      ctx.moveTo(bx - 4, baseY - 16);
      ctx.quadraticCurveTo(bx, baseY - 16 - fh * 1.8, bx + 4, baseY - 16);
      ctx.fill();
    }
    // 풍선(차가우면 푸르고 뜨거우면 붉다. 덜 부풀면 아래가 홀쭉하다)
    const w = (temp - T0) / (T_MAX - T0);
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
    stepDots(ps, R, dt, sp);
    drawDots(ctx, ps, bx, by, 205 + w * 180, 2.6);
    // 밀려 나가는 입자
    for (const d of leaving) {
      d.y += 0.9 * dt;
      d.a -= 0.02 * dt;
      ctx.fillStyle = `rgba(255,214,138,${Math.max(0, d.a)})`;
      ctx.beginPath();
      ctx.arc(bx + d.x + (d.x > 0 ? 1 : -1) * d.y * 0.5, by + R + 10 + d.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = leaving.length - 1; i >= 0; i--) if (leaving[i].a <= 0) leaving.splice(i, 1);

    // 기록: 땅에서, 구름 높이에서
    pill(ctx, `땅에서 입자 ${N0}개`, 334, 7, { dot: "#5AA2F8", align: "right" });
    if (phase !== "up") pill(ctx, `구름 높이에서 ${minN}개`, 334, 38, { dot: "#FF9F5A", align: "right" });
    txt(ctx, `${Math.round(temp)} ℃`, bx + R + 10, by - 4, { size: 14, weight: 800, color: "#FFFFFF" });
    txt(ctx, `입자 ${n}개`, bx + R + 10, by + 13, { color: "#C9D6EC" });
  });

  return () => lab.cleanup();
};
