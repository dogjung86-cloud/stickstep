// u6PressureLab (u6l1): 「기체의 압력은 어떻게 생길까?」
// 자전거 타이어의 단면. 입자가 벽에 부딪히는 자리가 번쩍이고, 네 벽마다 부딪힌 횟수가 쌓인다.
//   1 공기 넣기: 입자가 늘고 벽 충돌이 잦아져 압력 막대가 오른다(타이어가 팽팽해진다)
//   2 공기 빼기: 입자가 줄고 압력이 내려간다(말랑해진다)
//   3 판정 둘: 팽팽해진 까닭(입자 수와 충돌 횟수) → 어느 벽에 부딪혔나(네 벽 모두)
// 통찰: 기체 입자는 모든 방향으로 움직이며 벽에 부딪히고, 그 충돌이 기체의 압력이다.
// 무대는 지금 랩(gasPressure)의 입자 상자와 충돌 번쩍임(ui/gasKit)을 그대로 쓴다.
import { haptic, HAPTIC } from "../../../core/haptics";
import { GasBox, type GasBounds } from "../../../ui/gasKit";
import { bvBtn } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, pill, vbar, clamp01, ease, HitRate } from "./u6Kit";

const N0 = 12;
const N_MIN = 6;
const N_MAX = 36;
const STEP = 6;
const FULL = 30; // 이만큼 넣으면 팽팽하다
const SOFT = 12; // 이만큼 빼면 말랑하다

export const pressureLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-press", label: "자전거 타이어 속 기체 입자가 벽에 부딪히는 모습", wait: "공기를 넣었다 빼 보세요" });
  const { frame, tm } = lab;
  const box = new GasBox(1.7);
  let n = N0;
  let fat = (N0 - N_MIN) / (N_MAX - N_MIN); // 타이어가 부푼 정도(0~1), 부드럽게 따라간다
  let gauge = 0.3;
  const hr = new HitRate();
  let phase: "pump" | "vent" | "ask" | "done" = "pump";
  const bounds = (): GasBounds => {
    const inset = 14 * (1 - fat);
    return { x0: 22 + inset, y0: 42 + inset, x1: 232 - inset, y1: 206 - inset };
  };
  box.setCount(n, bounds());

  const plus = bvBtn("main u6x-half", "공기 넣기");
  const minus = bvBtn("u6x-half", "공기 빼기");
  const row = document.createElement("div");
  row.className = "u6x-row2";
  row.append(minus, plus);
  const note = document.createElement("div");
  note.className = "u6x-note";
  frame.slot.setControls(row, note);

  const sync = (): void => {
    plus.disabled = n >= N_MAX;
    minus.disabled = n <= N_MIN;
    note.innerHTML = `<span>타이어 속 입자 <b>${n}개</b></span><span>${n >= FULL ? "팽팽해요" : n <= SOFT ? "말랑해요" : "조금 찼어요"}</span>`;
    host.dataset.u6N = String(n);
  };

  const askWalls = (): void => {
    frame.pips(2);
    frame.say("벽마다 적힌 수는 입자가 그 벽에 <b>부딪힌 횟수</b>예요.");
    frame.slot.ask(
      "네 벽의 수를 견줘 보세요. 입자는 어느 벽에 부딪혔나요?",
      [{ t: "네 벽 모두에 부딪혔어요", ok: true }, { t: "아래쪽 벽에만 부딪혔어요" }, { t: "위쪽 벽에만 부딪혔어요" }],
      (ok) => lab.grade(ok),
      {
        why: "입자는 <b>모든 방향</b>으로 움직여 네 벽을 다 두드려요.",
        onNext: () => {
          phase = "done";
          lab.phase("done");
          frame.pips(3);
          frame.say("입자는 쉬지 않고 움직이며 벽을 두드려요.");
          frame.slot.conclude("기체 입자는 <b>모든 방향</b>으로 움직이며 벽에 부딪혀요. 이 충돌이 <b>기체의 압력</b>이에요. 입자가 많을수록 더 자주 부딪혀 압력이 커져요.");
          api.enableCTA(s.cta ?? "개념 정리하기");
        },
      },
    );
  };

  const askWhy = (): void => {
    phase = "ask";
    lab.phase("ask");
    frame.pips(1);
    frame.say("공기를 넣으면 팽팽해지고, 빼면 말랑해졌어요.");
    frame.slot.ask(
      "공기를 넣었을 때 타이어가 <b>팽팽해진</b> 까닭은?",
      [{ t: "입자가 늘어 벽에 더 자주 부딪혀서", ok: true }, { t: "입자 하나하나가 커져서" }, { t: "입자가 벽에 달라붙어서" }],
      (ok) => lab.grade(ok),
      { why: "입자가 많을수록 벽에 부딪히는 횟수가 늘어요.", onNext: askWalls },
    );
  };

  const change = (d: number): void => {
    if (phase !== "pump" && phase !== "vent") return;
    const next = Math.max(N_MIN, Math.min(N_MAX, n + d));
    if (next === n) return;
    n = next;
    haptic(HAPTIC.tap);
    box.setCount(n, bounds());
    sync();
    if (phase === "pump" && n >= FULL) {
      phase = "vent";
      lab.phase("vent");
      plus.classList.remove("main");
      minus.classList.add("main");
      api.setCTA("이번에는 공기를 빼 보세요", { enabled: false });
      frame.say("번쩍임이 잦아지고 타이어가 <b>팽팽</b>해졌어요. 이번에는 <b>공기 빼기</b>를 눌러 보세요.");
    } else if (phase === "vent" && n <= SOFT) {
      tm.later(askWhy, 900);
    }
  };
  plus.addEventListener("click", () => change(STEP));
  minus.addEventListener("click", () => change(-STEP));

  lab.phase("pump");
  frame.say("번쩍이는 곳이 입자가 벽에 <b>부딪힌</b> 자리예요. <b>공기 넣기</b>를 여러 번 눌러 보세요.");
  sync();

  lab.run((ctx, dt) => {
    fat = ease(fat, (n - N_MIN) / (N_MAX - N_MIN), 0.12, dt);
    const b = bounds();
    // 벽이 움직이면 밖에 남은 입자를 안으로 들인다
    for (const p of box.parts) {
      p.x = Math.max(b.x0 + 5, Math.min(b.x1 - 5, p.x));
      p.y = Math.max(b.y0 + 5, Math.min(b.y1 - 5, p.y));
    }
    hr.push(box.step(dt, b), dt);
    gauge = ease(gauge, clamp01(hr.value() / 0.42), 0.1, dt); // 입자 36개일 때 프레임마다 0.46번쯤 부딪힌다

    // 타이어 고무 벽
    const pad = 9;
    rr(ctx, b.x0 - pad, b.y0 - pad, b.x1 - b.x0 + pad * 2, b.y1 - b.y0 + pad * 2, 30);
    ctx.fillStyle = "#26334A";
    ctx.fill();
    ctx.strokeStyle = "#4A5B78";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    rr(ctx, b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, 22);
    ctx.fillStyle = "#0A1322";
    ctx.fill();
    // 공기 꼭지
    rr(ctx, 118, b.y0 - pad - 12, 18, 14, 4);
    ctx.fillStyle = "#6F86AD";
    ctx.fill();
    box.draw(ctx, 205);

    // 벽마다 부딪힌 횟수
    const mx = (b.x0 + b.x1) / 2;
    const my = (b.y0 + b.y1) / 2;
    const c = "#FFD68A";
    txt(ctx, `위 ${box.hits.T}`, mx + 26, b.y0 + 15, { color: c, align: "left" });
    txt(ctx, `아래 ${box.hits.B}`, mx, b.y1 - 14, { color: c, align: "center" });
    txt(ctx, `왼쪽 ${box.hits.L}`, b.x0 + 10, my, { color: c });
    txt(ctx, `오른쪽 ${box.hits.R}`, b.x1 - 10, my, { color: c, align: "right" });

    // 오른쪽: 압력 막대
    pill(ctx, "자전거 타이어 속", 12, 8, { dot: "#5AA2F8" });
    txt(ctx, "압력", 291, 44, { align: "center", color: "#9FB2D0" });
    vbar(ctx, 279, 58, 24, 128, gauge, gauge > 0.62 ? "#FF9F5A" : "#5AA2F8");
    txt(ctx, "높음", 311, 66, { size: 12, color: "#7F93B3" });
    txt(ctx, "낮음", 311, 178, { size: 12, color: "#7F93B3" });
    txt(ctx, n >= FULL ? "팽팽" : n <= SOFT ? "말랑" : "보통", 291, 206, { align: "center", size: 13, color: "#E8EEF9", weight: 800 });
  });

  return () => lab.cleanup();
};
