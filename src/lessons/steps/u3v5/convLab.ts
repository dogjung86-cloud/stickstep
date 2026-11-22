// [중1 Ⅲ v5] u3l3 u3ConvLab: 「아래만 데워도 왜 전체가 따뜻해질까?」
// 한 통찰: 대류는 물이나 공기의 입자가 직접 이동하면서 열을 전달하는 것이다. 데워진 쪽은 위로, 차가운 쪽은 아래로 움직여 돈다.
// 대류의 대표 장면(아래쪽을 가열한 냄비)과 물음(냉난방기는 어디에 설치할까)을 차례로 손으로 한다.
//   1 냄비: 불을 켜면 데워진 물 입자가 가운데로 올라가고 가장자리로 내려오며 돈다. 위쪽 물까지 뜨거워진다.
//   2 추운 방의 난방기: 위에 달면 위쪽만 따뜻하고(실패가 보인다), 아래에 달면 방 전체가 돈다.
//   3 더운 방의 냉방기: 아래에 달면 아래쪽만 시원하고, 위에 달면 방 전체가 돈다.
// 흐름은 정해 둔 흐름 무늬(대류 고리)를 따라 입자를 옮겨 그린다. 입자마다 온도가 있고 열원 곁을 지날 때 데워지거나 식는다.
// 흐르지 않는 배치(난방기 위, 냉방기 아래)에서는 열원 쪽 띠만 온도가 바뀐다.
// 2026-11-15 그래픽 감사 고침: 판정의 답 "입자가 직접 이동"이 한 장면에서는 흩어진 점이라 2초 가까이 지켜봐야 고리가 보였다.
//   · 입자마다 지나온 자리를 옅어지는 꼬리로 그린다(흐를 때만).
//   · 흐름이 생기면 고리 화살표(냄비 둘, 방 하나)가 차츰 진해진다. 열원 곁에서 오르는(냉방기는 내려오는) 길을 가장 굵고 진하게.
//     고리는 흐름 무늬의 유선(ψ = sin(kπu)·sin(πv)의 등고선)을 따른다.
//   · 방의 이름표(난방기, 위쪽 자리 따위)는 입자 위에 어두운 알약을 깔고 그린다(입자가 글자 위를 지나가던 것).

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { tempColor, drawGlowParticle, drawFlame } from "../../../ui/thermo";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { el } from "../../../core/dom";
import { u3Frame, u3Canvas, pill, rr, txt, SUB, HOT, COLD, FONT, clamp, type Ctx } from "./kit";

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
  tr: number[]; // 지나온 자리(u, v를 번갈아). 꼬리
}
const N = 64;
const TRAIL = 8; // 꼬리 점 수
const TRAIL_EVERY = 4; // 꼬리 점을 남기는 간격(프레임)
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
  const f = u3Frame(host, { title: s.title, steps: 4, cls: "u3x-conv", api, tall: true });

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
    ps = Array.from({ length: N }, (_, i) => ({ u: ((i % 8) + 0.15 + Math.random() * 0.7) / 8, v: (Math.floor(i / 8) + 0.15 + Math.random() * 0.7) / 8, T: BASE[scene], ju: 0, jv: 0, tr: [] }));
    trailClock = 0;
  };
  let trailClock = 0;
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
    trailClock += dt;
    const mark = trailClock >= TRAIL_EVERY;
    if (mark) trailClock %= TRAIL_EVERY;
    for (const p of ps) {
      if (mark) {
        p.tr.push(p.u, p.v);
        if (p.tr.length > TRAIL * 2) p.tr.splice(0, 2);
      }
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

  /** 고리 화살표(타원). dir +1이면 화면에서 시계 방향. src는 열원 곁 갈래의 각(그 갈래를 굵고 진하게, srcC 색으로). */
  function loopArrow(ctx: Ctx, cx: number, cy: number, a: number, b: number, dir: 1 | -1, src: number, srcC: string, restC: string, alpha: number): void {
    const SPAN = 0.95;
    const at = (th: number): [number, number] => [cx + a * Math.cos(th), cy + b * Math.sin(th)];
    const head = (th: number, color: string, size: number): void => {
      const [x, y] = at(th);
      const tx = -a * Math.sin(th) * dir;
      const ty = b * Math.cos(th) * dir;
      const l = Math.hypot(tx, ty) || 1;
      const ux = tx / l;
      const uy = ty / l;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + ux * size, y + uy * size);
      ctx.lineTo(x - ux * size * 0.7 - uy * size * 0.75, y - uy * size * 0.7 + ux * size * 0.75);
      ctx.lineTo(x - ux * size * 0.7 + uy * size * 0.75, y - uy * size * 0.7 - ux * size * 0.75);
      ctx.closePath();
      ctx.fill();
    };
    ctx.save();
    ctx.lineCap = "round";
    // 나머지 갈래(가늘게)
    ctx.globalAlpha = alpha * 0.55;
    ctx.strokeStyle = restC;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, a, b, 0, src + SPAN + 0.12, src + 2 * Math.PI - SPAN - 0.12);
    ctx.stroke();
    head(src + Math.PI + 0.35 * dir, restC, 7);
    // 열원 곁 갈래(굵고 진하게)
    ctx.globalAlpha = alpha * 0.9;
    ctx.strokeStyle = srcC;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, a, b, 0, src - SPAN, src + SPAN);
    ctx.stroke();
    head(src + SPAN * dir, srcC, 10);
    ctx.restore();
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
    }
    // 고리 화살표: 흐름이 생기면 차츰 진해진다(흐르지 않는 배치에서는 생기지 않는다)
    if (flow > 0.04) {
      const al = Math.min(1, flow * 1.15);
      if (scene === "pot") {
        loopArrow(ctx, R.x + 0.25 * R.w, R.y + 0.52 * R.h, 0.16 * R.w, 0.3 * R.h, -1, 0, HOT, COLD, al);
        loopArrow(ctx, R.x + 0.75 * R.w, R.y + 0.52 * R.h, 0.16 * R.w, 0.3 * R.h, 1, Math.PI, HOT, COLD, al);
      } else if (scene === "heater") loopArrow(ctx, R.x + 0.5 * R.w, R.y + 0.5 * R.h, 0.38 * R.w, 0.3 * R.h, 1, Math.PI, HOT, COLD, al);
      else loopArrow(ctx, R.x + 0.5 * R.w, R.y + 0.5 * R.h, 0.38 * R.w, 0.3 * R.h, -1, Math.PI, COLD, HOT, al);
    }
    // 꼬리(지나온 자리, 오래된 쪽일수록 옅다): 흐를 때만
    if (flow > 0.06) {
      const ta = Math.min(1, flow * 1.3);
      ctx.lineCap = "round";
      ctx.lineWidth = scene === "pot" ? 2.2 : 2.4;
      for (const p of ps) {
        const pts = p.tr;
        const n = pts.length / 2;
        if (n < 2) continue;
        ctx.strokeStyle = tempColor(p.T);
        for (let i = 1; i < n; i++) {
          ctx.globalAlpha = ta * 0.55 * (i / n);
          ctx.beginPath();
          ctx.moveTo(R.x + pts[(i - 1) * 2] * R.w, R.y + pts[(i - 1) * 2 + 1] * R.h);
          ctx.lineTo(R.x + pts[i * 2] * R.w, R.y + pts[i * 2 + 1] * R.h);
          ctx.stroke();
        }
        ctx.globalAlpha = ta * 0.6;
        ctx.beginPath();
        ctx.moveTo(R.x + pts[(n - 1) * 2] * R.w, R.y + pts[(n - 1) * 2 + 1] * R.h);
        ctx.lineTo(R.x + p.u * R.w, R.y + p.v * R.h);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // 입자(온도 색)
    for (const p of ps) drawGlowParticle(ctx, R.x + p.u * R.w, R.y + p.v * R.h, 3.8, p.T, 1.7);
    // 방의 냉난방기 자리와 이름표는 입자 위에(어두운 알약을 깔고)
    if (scene !== "pot") {
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
          ctx.fillStyle = "rgba(11,21,36,.75)";
          ctx.fill();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = "rgba(255,255,255,.4)";
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // 이름표: 달린 기기에는 이름, 빈 자리에는 자리 이름
        const name = on ? (scene === "heater" ? "난방기" : "냉방기") : pl === "top" ? "위쪽 자리" : "아래쪽 자리";
        ctx.font = `700 12px ${FONT}`;
        const w = ctx.measureText(name).width + 12;
        rr(ctx, R.x + 21, y + 4, w, 20, 10);
        ctx.fillStyle = "rgba(11,21,36,.88)";
        ctx.fill();
        txt(ctx, name, R.x + 27, y + 14.5, { size: 12, align: "left", weight: 700, color: on ? "#E8EEF9" : SUB });
      }
    }
    // 위쪽과 아래쪽의 온도
    const tx = scene === "pot" ? 300 : 286;
    pill(ctx, `위쪽 ${toC(scene, zone(true))}℃`, tx, scene === "pot" ? 84 : 52, { size: 12, dot: tempColor(zone(true)), bg: "rgba(11,21,36,.9)" });
    pill(ctx, `아래쪽 ${toC(scene, zone(false))}℃`, tx, 150, { size: 12, dot: tempColor(zone(false)), bg: "rgba(11,21,36,.9)" });
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
  // 불 켜기는 그대로 둔다(안내 글이 "불을 켜고"로 부른다). 다음 버튼의 글은 어느 실험으로 가는지에 따라 onResult가 정한다.
  const fire = bvBtn("main", "불 켜기");
  const next = bvBtn("main", "방 안 공기 실험으로 이동");
  const top = bvBtn("", "위쪽에 설치하기");
  const bottom = bvBtn("", "아래쪽에 설치하기");
  const row = el("div", { class: "u3x-row" }, top, bottom);
  next.hidden = true;
  row.hidden = true;

  function onResult(ok: boolean): void {
    judged = true;
    haptic(ok ? HAPTIC.correct : HAPTIC.wrong);
    if (scene === "pot") {
      done = 1;
      fire.hidden = true;
      f.say("아래에서 데워진 물 입자가 <b>위로 올라가고</b>, 위에 있던 찬 물 입자가 <b>아래로 내려와요</b>. 이렇게 순환하면서 물 전체가 골고루 뜨거워졌어요!");
      next.textContent = "방 안 공기 실험으로 이동";
      next.hidden = false;
    } else if (ok) {
      done = scene === "heater" ? 2 : 3;
      f.say(scene === "heater" ? "아래에서 따뜻해진 공기가 <b>위로 올라가며</b> 방 안을 골고루 돌아요! 덕분에 바닥 근처까지 따뜻해졌어요." : "위에서 차가워진 공기가 <b>아래로 내려오며</b> 방 안을 골고루 돌아요! 덕분에 방 전체가 시원해졌어요.");
      if (scene === "heater") {
        // 이미 방 안 공기 실험이다. 다음은 더운 방의 냉방기(수정안의 "방 안 공기 실험으로 이동"을 이 자리에 맞게 바꿈)
        next.textContent = "냉방기 실험으로 이동";
        next.hidden = false;
      } else tm.later(askFinal, 2400);
    } else {
      f.say(scene === "heater" ? "난방기를 위쪽에 설치하니 따뜻한 공기가 천장 근처에만 머물러서 <b>아래쪽은 여전히 추워요</b>. 이번엔 아래쪽에 설치해 볼까요?" : "냉방기를 아래쪽에 설치하니 차가운 공기가 바닥에만 깔려서 <b>위쪽은 여전히 더워요</b>. 이번엔 위쪽에 설치해 볼까요?");
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
      f.say("추운 방에 <b>난방기</b>를 설치해 볼까요? 방 전체가 고루 따뜻해지려면 어디에 설치해야 할까요?");
      api.setCTA("난방기를 설치할 위치를 골라 보세요", { enabled: false });
    } else if (sc === "cooler") {
      f.say("이번에는 더운 방에 <b>냉방기</b>를 설치해 볼까요? 방 전체가 고루 시원해지려면 어디에 설치해야 할까요?");
      api.setCTA("냉방기를 설치할 위치를 골라 보세요", { enabled: false });
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
    f.say(`${scene === "heater" ? "난방기" : "냉방기"}를 ${pl === "top" ? "위쪽" : "아래쪽"}에 설치하고 켰어요. 공기 입자의 움직임과 위아래 온도 변화를 살펴보세요.`);
  }
  top.addEventListener("click", () => install("top"));
  bottom.addEventListener("click", () => install("bottom"));
  fire.addEventListener("click", () => {
    if (running) return;
    haptic(HAPTIC.tap);
    running = true;
    fire.disabled = true;
    f.say("불을 켰어요! 바닥 근처에서 데워진 <b>물 입자</b>가 어느 쪽으로 움직이는지 살펴보세요.");
  });
  next.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    setScene(scene === "pot" ? "heater" : "cooler");
  });

  function askFinal(): void {
    phase = "ask";
    // 질문이 묻는 장면(난방기를 아래에 단 방)을 무대에 다시 돌린다
    scene = "heater";
    place = "bottom";
    running = true;
    judged = true;
    flow = 0;
    runT = 0;
    seed();
    row.hidden = true;
    f.say("난방기를 아래쪽에 설치한 방의 모습을 다시 보여 줄게요. 공기 입자의 움직임을 보며 답해 보세요.");
    f.slot.ask(
      "난방기를 아래쪽에 설치했을 때 방 전체가 따뜻해진 까닭은 무엇인가요?",
      [{ t: "따뜻해진 공기 입자가 직접 이동하며 순환해서", ok: true }, { t: "공기 입자가 제자리에서 떨림만 전달해서" }, { t: "열이 공기를 거치지 않고 곧장 날아가서" }],
      (ok) => api.recordQuiz(ok),
      { why: "따뜻해진 공기는 <b>위로 올라가고</b> 차가운 공기는 <b>아래로 내려오면서</b> 방 안을 골고루 데웠어요.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    f.pips(4);
    f.say("액체와 기체에서 입자가 직접 움직이며 열을 전달하는 과정을 모두 확인했어요!");
    f.slot.conclude("액체나 기체 상태의 입자가 <b>직접 이동</b>하면서 열을 전달하는 현상을 <b>대류</b>라고 해요. 대류 현상 때문에 난방기는 아래쪽에, 냉방기는 위쪽에 설치해요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(fire, row, next);
  f.say("물이 담긴 냄비의 <b>아래쪽</b>만 가열해 볼 거예요. 불을 켜고 물 입자가 어떻게 움직이는지 관찰해 보세요.");
  api.setCTA("불을 켜고 물 입자의 움직임을 관찰해 보세요", { enabled: false });
  return () => {
    tm.clear();
    cv.stop();
  };
};
