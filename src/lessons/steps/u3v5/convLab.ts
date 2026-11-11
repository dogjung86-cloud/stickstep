// [중1 Ⅲ v5] u3l3 u3ConvLab: 「아래만 데워도 왜 전체가 따뜻해질까?」
// 한 통찰: 대류는 물이나 공기의 입자가 직접 이동하면서 열을 전달하는 것이다. 데워진 쪽은 위로, 차가운 쪽은 아래로 움직여 돈다.
// 책의 그림(아래쪽을 가열한 냄비)과 물음(냉난방기는 어디에 설치할까)을 차례로 손으로 한다.
//   1 냄비: 불을 켜면 데워진 물 입자가 가운데로 올라가고 가장자리로 내려오며 돈다. 위쪽 물까지 뜨거워진다.
//   2 추운 방의 난방기: 위에 달면 위쪽만 따뜻하고(실패가 보인다), 아래에 달면 방 전체가 돈다.
//   3 더운 방의 냉방기: 아래에 달면 아래쪽만 시원하고, 위에 달면 방 전체가 돈다.
// 흐름은 정해 둔 흐름 무늬(대류 고리)를 따라 입자를 옮겨 그린다. 입자마다 온도가 있고 열원 곁을 지날 때 데워지거나 식는다.
// 흐르지 않는 배치(난방기 위, 냉방기 아래)에서는 열원 쪽 띠만 온도가 바뀐다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { tempColor, drawGlowParticle, drawFlame } from "../../../ui/thermo";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { el } from "../../../core/dom";
import { u3Frame, u3Canvas, pill, rr, txt, SUB, clamp, type Ctx } from "./kit";

interface ConvStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

type Scene = "pot" | "heater" | "cooler";
type Place = "top" | "bottom";
interface P {
  u: number; // 0~1 (왼쪽에서 오른쪽)
  v: number; // 0~1 (위에서 아래)
  T: number; // 0~1
  ju: number;
  jv: number;
}
const N = 64;
const REGION: Record<Scene, { x: number; y: number; w: number; h: number }> = {
  pot: { x: 62, y: 62, w: 190, h: 112 },
  heater: { x: 22, y: 34, w: 302, h: 160 },
  cooler: { x: 22, y: 34, w: 302, h: 160 },
};
const BASE: Record<Scene, number> = { pot: 0.2, heater: 0.22, cooler: 0.8 };
const toC = (scene: Scene, T: number): number => (scene === "pot" ? Math.round(10 + T * 85) : Math.round(6 + T * 28));

export const convLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ConvStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 4, cls: "u3x-conv", api });

  let scene: Scene = "pot";
  let place: Place | null = "bottom"; // 열원의 자리(방에서는 학생이 고른다)
  let running = false;
  let flow = 0; // 대류의 세기(0~1)
  let runT = 0; // 켠 뒤 흐른 시간(프레임)
  let judged = false; // 이번 배치의 결과를 알렸는가
  let phase: "play" | "ask" | "done" = "play";
  let done = 0;
  let ps: P[] = [];
  const tried = new Set<string>();

  const seed = (): void => {
    // 고르게 흩는다(8×8 칸마다 하나, 칸 안에서는 아무 데나)
    ps = Array.from({ length: N }, (_, i) => ({ u: ((i % 8) + 0.15 + Math.random() * 0.7) / 8, v: (Math.floor(i / 8) + 0.15 + Math.random() * 0.7) / 8, T: BASE[scene], ju: 0, jv: 0 }));
  };
  seed();

  const works = (): boolean => scene === "pot" || (scene === "heater" ? place === "bottom" : place === "top");
  /** 열원의 자리(u, v)와 온도 */
  const source = (): { u: number; v: number; T: number } => {
    if (scene === "pot") return { u: 0.5, v: 1, T: 1 };
    return { u: 0.02, v: place === "top" ? 0.1 : 0.9, T: scene === "heater" ? 1 : 0 };
  };
  const zone = (top: boolean): number => {
    const sel = ps.filter((p) => (top ? p.v < 0.4 : p.v > 0.6));
    return sel.reduce((a, p) => a + p.T, 0) / Math.max(1, sel.length);
  };

  function stepSim(dt: number): void {
    if (running) runT += dt;
    const ok = running && works();
    flow += ((ok ? 1 : 0) - flow) * Math.min(1, 0.03 * dt);
    const src = source();
    const mean = ps.reduce((a, p) => a + p.T, 0) / ps.length;
    // 흐름 무늬: 냄비는 고리 둘(가운데에서 올라간다), 방은 고리 하나(열원이 있는 왼쪽 벽을 따라 오르거나 내린다)
    const A = scene === "pot" ? -0.0034 : scene === "heater" ? 0.0062 : -0.0062;
    const kx = scene === "pot" ? 2 : 1;
    for (const p of ps) {
      p.ju += (Math.random() - 0.5) * 0.0016 * dt - p.ju * 0.08 * dt;
      p.jv += (Math.random() - 0.5) * 0.0016 * dt - p.jv * 0.08 * dt;
      const su = Math.sin(kx * Math.PI * p.u);
      const cu = Math.cos(kx * Math.PI * p.u);
      const sv = Math.sin(Math.PI * p.v);
      const cvv = Math.cos(Math.PI * p.v);
      p.u = clamp(p.u + (A * su * cvv * flow + p.ju) * dt, 0.02, 0.98);
      p.v = clamp(p.v + (-A * kx * cu * sv * flow + p.jv) * dt, 0.03, 0.97);
      if (!running) continue;
      const d = Math.hypot((p.u - src.u) * (scene === "pot" ? 1.2 : 2), p.v - src.v);
      if (ok) {
        if (d < (scene === "pot" ? 0.36 : 0.5)) p.T += (src.T - p.T) * 0.06 * dt;
        p.T += (mean - p.T) * 0.006 * dt; // 돌면서 섞인다
      } else {
        // 흐르지 않는 배치: 열원 쪽 띠만 바뀐다
        const band = place === "top" ? p.v < 0.3 : p.v > 0.7;
        if (band) p.T += (src.T - p.T) * 0.012 * dt;
      }
    }
  }

  function drawPerson(ctx: Ctx, x: number, floor: number): void {
    ctx.strokeStyle = "#E8EEF9";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(x, floor - 44, 8, 0, Math.PI * 2);
    ctx.moveTo(x, floor - 36);
    ctx.lineTo(x, floor - 16);
    ctx.lineTo(x - 7, floor - 1);
    ctx.moveTo(x, floor - 16);
    ctx.lineTo(x + 7, floor - 1);
    ctx.moveTo(x - 9, floor - 26);
    ctx.lineTo(x + 9, floor - 26);
    ctx.stroke();
  }

  const cv = u3Canvas(f.stage, (ctx, dt, tMs) => {
    host.dataset.u3Phase = phase;
    host.dataset.u3Scene = `${scene}:${judged ? (works() ? "ok" : "fail") : running ? "run" : "idle"}`;
    stepSim(dt);
    const R = REGION[scene];
    if (scene === "pot") {
      // 냄비와 물
      rr(ctx, R.x - 6, R.y - 8, R.w + 12, R.h + 16, 12);
      ctx.fillStyle = "rgba(90,169,255,.08)";
      ctx.fill();
      ctx.strokeStyle = "#B8C4D6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(R.x - 6, R.y - 12);
      ctx.lineTo(R.x - 6, R.y + R.h);
      ctx.quadraticCurveTo(R.x - 6, R.y + R.h + 8, R.x + 4, R.y + R.h + 8);
      ctx.lineTo(R.x + R.w - 4, R.y + R.h + 8);
      ctx.quadraticCurveTo(R.x + R.w + 6, R.y + R.h + 8, R.x + R.w + 6, R.y + R.h);
      ctx.lineTo(R.x + R.w + 6, R.y - 12);
      ctx.moveTo(R.x - 6, R.y + 4);
      ctx.lineTo(R.x - 22, R.y + 4);
      ctx.moveTo(R.x + R.w + 6, R.y + 4);
      ctx.lineTo(R.x + R.w + 22, R.y + 4);
      ctx.stroke();
      if (running) drawFlame(ctx, R.x + R.w / 2, 226, 30, tMs);
      else txt(ctx, "불 자리", R.x + R.w / 2, 208, { size: 12, color: SUB, weight: 600 });
    } else {
      // 방: 벽과 바닥, 사람, 냉난방기
      rr(ctx, R.x - 6, R.y - 8, R.w + 12, R.h + 14, 6);
      ctx.fillStyle = "rgba(255,255,255,.03)";
      ctx.fill();
      ctx.strokeStyle = "rgba(205,225,250,.6)";
      ctx.lineWidth = 2.4;
      ctx.stroke();
      drawPerson(ctx, 190, R.y + R.h + 4);
      for (const pl of ["top", "bottom"] as Place[]) {
        const y = pl === "top" ? R.y + 2 : R.y + R.h - 30;
        const on = place === pl;
        rr(ctx, R.x - 2, y, 20, 28, 5);
        if (on) {
          ctx.fillStyle = scene === "heater" ? (running ? "#FF7A3D" : "#B45A36") : running ? "#7CC4FF" : "#4E7FAE";
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1.6;
          ctx.stroke();
        } else {
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = "rgba(255,255,255,.4)";
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
    // 입자(온도 색, 흐를 때는 짧은 꼬리)
    for (const p of ps) drawGlowParticle(ctx, R.x + p.u * R.w, R.y + p.v * R.h, 3.8, p.T, 1.7);
    // 위쪽과 아래쪽의 온도
    const tx = scene === "pot" ? 300 : 286;
    pill(ctx, `위쪽 ${toC(scene, zone(true))}℃`, tx, scene === "pot" ? 84 : 52, { size: 12, dot: tempColor(zone(true)) });
    pill(ctx, `아래쪽 ${toC(scene, zone(false))}℃`, tx, scene === "pot" ? 150 : 150, { size: 12, dot: tempColor(zone(false)) });
    // 결과 판단
    if (running && !judged) {
      const base = BASE[scene];
      if (works()) {
        // 위쪽과 아래쪽이 모두 충분히 바뀌어야 "방 전체"다
        const far = scene === "cooler" ? base - Math.max(zone(true), zone(false)) : Math.min(zone(true), zone(false)) - base;
        if (far > (scene === "pot" ? 0.4 : 0.26) || runT > 480) onResult(true);
      } else if (runT > 250) onResult(false);
    }
  });

  // ── 조작 ──
  const fire = bvBtn("main", "불 켜기");
  const next = bvBtn("main", "다음 실험으로");
  const top = bvBtn("", "위쪽에 달기");
  const bottom = bvBtn("", "아래쪽에 달기");
  const row = el("div", { class: "u3x-row" }, top, bottom);
  next.hidden = true;
  row.hidden = true;

  function onResult(ok: boolean): void {
    judged = true;
    haptic(ok ? HAPTIC.correct : HAPTIC.wrong);
    if (scene === "pot") {
      done = 1;
      fire.hidden = true;
      f.say("데워진 물 입자가 <b>위로 올라가고</b> 위의 찬 입자가 내려와요. 그렇게 돌면서 위쪽 물까지 뜨거워졌어요.");
      next.hidden = false;
    } else if (ok) {
      done = scene === "heater" ? 2 : 3;
      f.say(scene === "heater" ? "따뜻해진 공기가 <b>위로 올라가며</b> 방을 한 바퀴 돌아요. 사람이 있는 아래쪽까지 따뜻해졌어요." : "차가워진 공기가 <b>아래로 내려오며</b> 방을 한 바퀴 돌아요. 방 전체가 시원해졌어요.");
      if (scene === "heater") next.hidden = false;
      else tm.later(askFinal, 2400);
    } else {
      f.say(scene === "heater" ? "따뜻한 공기는 위에만 머물러요. 사람이 있는 <b>아래쪽은 그대로</b> 추워요. 다른 자리에 달아 봐요." : "차가운 공기는 아래에만 깔려요. <b>위쪽은 그대로</b> 더워요. 다른 자리에 달아 봐요.");
      top.disabled = place === "top";
      bottom.disabled = place === "bottom";
    }
    f.pips(done);
  }

  function setScene(sc: Scene): void {
    scene = sc;
    place = sc === "pot" ? "bottom" : null;
    running = false;
    judged = false;
    flow = 0;
    runT = 0;
    seed();
    fire.hidden = sc !== "pot";
    next.hidden = true;
    row.hidden = sc === "pot";
    top.disabled = bottom.disabled = false;
    top.classList.remove("on");
    bottom.classList.remove("on");
    if (sc === "heater") {
      f.say("추운 방에 <b>난방기</b>를 달아요. 사람이 있는 아래쪽까지 따뜻해지려면 어디에 달까요?");
      api.setCTA("난방기를 달 자리를 골라 보세요", { enabled: false });
    } else if (sc === "cooler") {
      f.say("이번엔 더운 방에 <b>냉방기</b>를 달아요. 방 전체가 시원해지려면 어디에 달까요?");
      api.setCTA("냉방기를 달 자리를 골라 보세요", { enabled: false });
    }
  }

  function install(pl: Place): void {
    if (phase !== "play" || scene === "pot" || (running && !judged)) return;
    haptic(HAPTIC.tap);
    place = pl;
    tried.add(`${scene}:${pl}`);
    running = true;
    judged = false;
    flow = 0;
    runT = 0;
    seed();
    top.classList.toggle("on", pl === "top");
    bottom.classList.toggle("on", pl === "bottom");
    top.disabled = bottom.disabled = true;
    f.say(`${scene === "heater" ? "난방기" : "냉방기"}를 ${pl === "top" ? "위쪽" : "아래쪽"}에 달고 켰어요. 공기 입자와 두 온도를 지켜봐요.`);
  }
  top.addEventListener("click", () => install("top"));
  bottom.addEventListener("click", () => install("bottom"));
  fire.addEventListener("click", () => {
    if (running) return;
    haptic(HAPTIC.tap);
    running = true;
    fire.disabled = true;
    f.say("불을 켰어요. 아래에서 데워진 <b>물 입자</b>가 어디로 가는지 지켜봐요.");
  });
  next.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    setScene(scene === "pot" ? "heater" : "cooler");
  });

  function askFinal(): void {
    phase = "ask";
    f.say("냄비, 난방기, 냉방기를 모두 해 봤어요. 입자가 한 일을 떠올리며 골라 봐요.");
    f.slot.ask(
      "난방기를 아래에 달았을 때 방 전체가 따뜻해진 까닭은?",
      [{ t: "데워진 공기 입자가 직접 이동해서", ok: true }, { t: "공기 입자가 제자리에서 떨기만 해서" }, { t: "열이 공기 없이 날아가서" }],
      (ok) => api.recordQuiz(ok),
      { why: "따뜻한 공기는 <b>위로</b>, 찬 공기는 <b>아래로</b> 움직이며 돌았어요.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("물이나 공기의 입자가 <b>직접 이동</b>하면서 열을 전달하는 것이 <b>대류</b>예요. 그래서 난방기는 아래쪽에, 냉방기는 위쪽에 달아요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(fire, row, next);
  f.say("물이 든 냄비예요. 불은 <b>아래쪽</b>에만 있어요. 불을 켜고 물 입자를 지켜봐요.");
  api.setCTA("불을 켜고 물 입자를 지켜보세요", { enabled: false });
  return () => {
    tm.clear();
    cv.stop();
  };
};
