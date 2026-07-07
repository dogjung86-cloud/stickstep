// rockCycle — 암석의 순환 가로 랩(중2 II L6). 교과서 그림 II-15의 "체험판".
//   · 가로 모드(rotateStage) + 2D 캔버스 파노라마: 왼쪽 화산·마그마 방, 가운데 지표·강·바다,
//     오른쪽 지하 심부(열·압력의 세계). 다섯 상태 노드가 순환 고리를 이룬다.
//   · 내 암석(조약돌 캐릭터, 손그림 라인)이 현재 상태에 있고, 아래 사건 버튼 5개 중
//     하나를 고르면 규칙에 맞을 때만 다음 상태로 여행한다. 틀린 사건은 오개념 교정 토스트.
// 목표: ① 첫 암석(마그마→화성암) ② 퇴적암까지(부서짐→다져 굳음) ③ 다섯 정거장 완주.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import type { RotateStage } from "../../ui/rotateStage";

interface CycleStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type NodeId = "magma" | "igneous" | "sediment" | "sedrock" | "metamorphic";
type EventId = "cool" | "break" | "compact" | "heatpress" | "melt";

const NODE_NAME: Record<NodeId, string> = {
  magma: "마그마",
  igneous: "화성암",
  sediment: "퇴적물",
  sedrock: "퇴적암",
  metamorphic: "변성암",
};
const EVENTS: { id: EventId; label: string }[] = [
  { id: "cool", label: "식어서 굳어짐" },
  { id: "break", label: "잘게 부서짐" },
  { id: "compact", label: "다져지고 굳어짐" },
  { id: "heatpress", label: "열과 압력" },
  { id: "melt", label: "녹음" },
];

// 전이 규칙(교과서 그림 II-15 그대로) — 없는 조합은 오개념 교정 문구
const RULES: Record<NodeId, Partial<Record<EventId, NodeId>>> = {
  magma: { cool: "igneous" },
  igneous: { break: "sediment", heatpress: "metamorphic", melt: "magma" },
  sediment: { compact: "sedrock" },
  sedrock: { break: "sediment", heatpress: "metamorphic", melt: "magma" },
  metamorphic: { break: "sediment", melt: "magma" },
};
const WRONG_MSG: Record<NodeId, Partial<Record<EventId, string>>> = {
  magma: {
    break: "마그마는 액체라 부서질 수 없어요 — 먼저 식어서 굳어야 암석이 돼요!",
    compact: "다져 굳히는 건 퇴적물 이야기 — 마그마는 식어서 굳어져요.",
    heatpress: "마그마는 이미 뜨거운 액체 — 열·압력을 더 받아도 마그마예요.",
    melt: "이미 다 녹아 있는걸요! 마그마가 갈 길은 식어서 굳는 것뿐.",
  },
  igneous: {
    cool: "이미 식어서 굳은 암석이에요 — 또 식을 수는 없어요.",
    compact: "다져 굳히기는 헐거운 퇴적물의 일 — 단단한 암석엔 통하지 않아요.",
  },
  sediment: {
    cool: "퇴적물은 뜨겁지 않아요 — 식는 게 아니라 다져지고 굳어져야 해요.",
    break: "이미 잘게 부서진 알갱이들이에요 — 이제 쌓여서 다져질 차례!",
    heatpress: "헐거운 퇴적물은 먼저 다져져 암석이 된 뒤에야 깊은 곳으로 갈 수 있어요.",
    melt: "지표의 퇴적물이 바로 녹을 순 없어요 — 마그마는 지하 깊은 곳 이야기죠.",
  },
  sedrock: {
    cool: "퇴적암은 뜨겁지 않아요 — 식을 일이 없죠.",
    compact: "이미 다져지고 굳어진 암석이에요.",
  },
  metamorphic: {
    cool: "변성암은 이미 굳어 있는 암석이에요.",
    compact: "다져 굳히기는 퇴적물의 일이에요.",
    heatpress: "이미 열과 압력으로 변한 암석 — 더 세게 받으면 이젠 녹아서 마그마!",
  },
};

// 파노라마 논리 좌표(0..1000 × 0..480) 위 노드 위치
const NODE_POS: Record<NodeId, { x: number; y: number }> = {
  magma: { x: 150, y: 372 },
  igneous: { x: 232, y: 148 },
  sediment: { x: 520, y: 236 },
  sedrock: { x: 662, y: 322 },
  metamorphic: { x: 848, y: 396 },
};

export const rockCycle: StepRenderer = (host, step, api) => {
  const s = step as unknown as CycleStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge geo", dataset: { g: "first" } }, el("b", { text: "첫 암석" }), el("span", { text: "굳히기" })),
    el("div", { class: "pn-badge geo", dataset: { g: "sedi" } }, el("b", { text: "퇴적암까지" }), el("span", { text: "부숴서 쌓기" })),
    el("div", { class: "pn-badge geo", dataset: { g: "tour" } }, el("b", { text: "완주" }), el("span", { text: "5정거장" })),
  );
  const preview = el(
    "div",
    { class: "sp3-enter" },
    el("div", { class: "sp3-enter-art", html: enterArtSvg() }),
    el("div", { class: "sp3-enter-txt", html: "돌멩이가 되어 <b>암석의 순환</b>을 여행해요.<br>화면이 자동으로 <b>가로</b>로 돌아가요." }),
  );
  const enterBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 여행 떠나기" }));
  const helper = el("div", {
    class: "helper",
    html: "암석은 한번 만들어지면 끝이 아니에요 — 환경이 바뀌면 <b>끊임없이 다른 암석으로</b> 변해요. 마그마 한 방울에서 출발!",
  });
  host.append(goalChips, preview, enterBtn, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const goals = new Set<string>();
  let finished = false;
  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "완주! 지표에선 <b>부서지고</b>, 쌓이면 <b>다져 굳고</b>, 깊은 곳에선 <b>열과 압력</b>으로 변하고, 더 깊으면 <b>녹아서 마그마</b> — 이 끝없는 여행이 <b>암석의 순환</b>이에요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 상태 ----
  let rot: RotateStage | null = null;
  let loop: Loop | null = null;
  let disposed = false;

  let cur: NodeId = "magma";
  const visited = new Set<NodeId>(["magma"]);
  let sediDone = false; // 퇴적물을 거쳐 왔는지(퇴적암 목표 판정)
  let travel: { from: NodeId; to: NodeId; t: number } | null = null;
  let wobble = 0;

  function enter(): void {
    if (rot) return;
    haptic(HAPTIC.select);
    void (async () => {
      const { enterRotateStage } = await import("../../ui/rotateStage");
      if (disposed) return;
      rot = enterRotateStage({ title: "암석의 순환 — 사건을 골라 여행해요", onLeave: () => leave() });
      const canvas = el("canvas", { class: "sp3-canvas rc-canvas" }) as HTMLCanvasElement;
      const pill = el("div", { class: "pill sp3-pill" }, el("span", { class: "pdot", style: "background:#C89459" }), el("span", { text: "지금: 마그마 — 아래에서 사건을 골라요" }));
      const toast = el("div", { class: "sp3-toast" });
      const actions = el("div", { class: "rc-actions" });
      EVENTS.forEach((ev) => {
        const b = el("button", { class: "rc-act", attrs: { type: "button" }, text: ev.label });
        b.addEventListener("click", () => onEvent(ev.id));
        actions.appendChild(b);
      });
      rot.stage.append(canvas, pill, toast, actions);
      const pillText = pill.querySelectorAll("span")[1] as HTMLElement;

      let toastTimer = 0;
      const showToast = (msg: string): void => {
        toast.textContent = msg;
        toast.classList.add("show");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
      };

      function refreshButtons(): void {
        const rules = RULES[cur];
        actions.querySelectorAll(".rc-act").forEach((b, i) => {
          const ok = EVENTS[i].id in rules;
          (b as HTMLElement).classList.toggle("ok", ok);
        });
      }

      function onEvent(ev: EventId): void {
        if (travel) return;
        const to = RULES[cur][ev];
        if (!to) {
          haptic(HAPTIC.wrong);
          showToast(WRONG_MSG[cur][ev] ?? "그 사건은 지금 일어날 수 없어요.");
          wobble = 1;
          return;
        }
        haptic(HAPTIC.select);
        travel = { from: cur, to, t: 0 };
        pillText.textContent = `${NODE_NAME[cur]} → ${NODE_NAME[to]} …`;
      }

      function arrive(to: NodeId): void {
        cur = to;
        visited.add(to);
        pillText.textContent = `지금: ${NODE_NAME[to]}`;
        refreshButtons();
        haptic(HAPTIC.correct);
        if (to === "igneous") {
          collect("first", "화성암!");
          showToast("마그마가 식어서 굳어짐 — 첫 암석, 화성암 탄생!");
        }
        if (to === "sediment") sediDone = true;
        if (to === "sedrock" && sediDone) {
          collect("sedi", "퇴적암!");
          showToast("부서지고, 쌓이고, 다져지고 — 퇴적암 완성! 줄무늬(층리)가 보여요.");
        }
        if (to === "metamorphic") showToast("깊은 곳의 열과 압력 — 변성암이 됐어요. 줄무늬(엽리)가 생겼죠!");
        if (visited.size === 5) collect("tour", "한 바퀴!");
      }

      refreshButtons();

      // ---- 프레임 ----
      const DPR = Math.min(window.devicePixelRatio || 1, 1.75);
      loop = createLoop((dt, tMs) => {
        if (!rot) return;
        const { w, h } = rot.size();
        if (canvas.width !== Math.round(w * DPR) || canvas.height !== Math.round(h * DPR)) {
          canvas.width = Math.round(w * DPR);
          canvas.height = Math.round(h * DPR);
        }
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext("2d")!;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.clearRect(0, 0, w, h);
        // 논리 1000×480 → 화면 스케일(하단 사건 버튼 여백 64px 확보)
        const sc = Math.min(w / 1000, (h - 64) / 480);
        const ox = (w - 1000 * sc) / 2;
        const oy = Math.max(0, (h - 64 - 480 * sc) / 2);
        ctx.save();
        ctx.translate(ox, oy);
        ctx.scale(sc, sc);
        drawPanorama(ctx, tMs);

        if (travel) {
          travel.t = Math.min(1, travel.t + 0.016 * dt);
          if (travel.t >= 1) {
            const to = travel.to;
            travel = null;
            arrive(to);
          }
        }
        wobble = Math.max(0, wobble - 0.05 * dt);
        drawRock(ctx, tMs);
        ctx.restore();
      });
      loop.start();
    })();
  }

  // 파노라마 — 왼쪽 화산·마그마 방 / 가운데 강·바다 / 오른쪽 지하 심부
  function drawPanorama(ctx: CanvasRenderingContext2D, tMs: number): void {
    const sky = ctx.createLinearGradient(0, 0, 0, 220);
    sky.addColorStop(0, "#0E1B30");
    sky.addColorStop(1, "#1C3050");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1000, 224);
    ctx.fillStyle = "rgba(220,232,255,.7)";
    for (let i = 0; i < 14; i++) {
      const x = (i * 137.3) % 1000;
      const y = 14 + ((i * 61.7) % 110);
      ctx.fillRect(x, y, 1.6, 1.6);
    }
    // 땅 단면(지표선: 화산 산줄기 포함)
    const gnd = ctx.createLinearGradient(0, 180, 0, 480);
    gnd.addColorStop(0, "#6B4F33");
    gnd.addColorStop(0.55, "#54371F");
    gnd.addColorStop(1, "#7A2E17");
    ctx.fillStyle = gnd;
    ctx.beginPath();
    ctx.moveTo(0, 262);
    ctx.lineTo(120, 252);
    ctx.quadraticCurveTo(200, 118, 268, 126);
    ctx.quadraticCurveTo(322, 132, 382, 238);
    ctx.quadraticCurveTo(470, 258, 560, 262);
    ctx.lineTo(1000, 258);
    ctx.lineTo(1000, 480);
    ctx.lineTo(0, 480);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3E2A16";
    ctx.lineWidth = 5;
    ctx.stroke();
    // 분화구 용암 빛
    const lavaGlow = 0.5 + Math.sin(tMs / 420) * 0.12;
    const lg = ctx.createRadialGradient(276, 140, 4, 276, 140, 48);
    lg.addColorStop(0, `rgba(255,150,60,${lavaGlow})`);
    lg.addColorStop(1, "rgba(255,150,60,0)");
    ctx.fillStyle = lg;
    ctx.fillRect(212, 92, 132, 104);
    // 바다(가운데 오른쪽)
    const sea = ctx.createLinearGradient(0, 238, 0, 296);
    sea.addColorStop(0, "rgba(90,150,220,.85)");
    sea.addColorStop(1, "rgba(40,80,150,.9)");
    ctx.fillStyle = sea;
    ctx.beginPath();
    ctx.moveTo(432, 246);
    ctx.quadraticCurveTo(560, 232, 700, 248);
    ctx.lineTo(700, 290);
    ctx.quadraticCurveTo(560, 302, 432, 288);
    ctx.closePath();
    ctx.fill();
    // 마그마 방(왼쪽 아래)
    const mg = ctx.createRadialGradient(150, 392, 8, 150, 392, 100);
    mg.addColorStop(0, "#FFC24D");
    mg.addColorStop(0.5, "#F07A22");
    mg.addColorStop(1, "rgba(150,40,10,.12)");
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.ellipse(150, 392, 120, 62, 0, 0, Math.PI * 2);
    ctx.fill();
    // 마그마 → 화산 통로
    ctx.strokeStyle = "rgba(240,122,34,.5)";
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(190, 356);
    ctx.quadraticCurveTo(252, 262, 276, 152);
    ctx.stroke();
    // 오른쪽 심부 열·압력 존
    const hp = ctx.createRadialGradient(848, 420, 10, 848, 420, 132);
    hp.addColorStop(0, "rgba(255,120,60,.3)");
    hp.addColorStop(1, "rgba(255,120,60,0)");
    ctx.fillStyle = hp;
    ctx.fillRect(700, 296, 300, 184);
    ctx.strokeStyle = "rgba(255,214,138,.4)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    const a = 6 + Math.sin(tMs / 500) * 3;
    ctx.beginPath();
    ctx.moveTo(772 - a, 380);
    ctx.lineTo(802 - a, 396);
    ctx.moveTo(924 + a, 380);
    ctx.lineTo(894 + a, 396);
    ctx.stroke();

    // 노드 표지판
    (Object.keys(NODE_POS) as NodeId[]).forEach((id) => {
      const p = NODE_POS[id];
      const on = visited.has(id);
      const isCur = cur === id && !travel;
      ctx.fillStyle = on ? "rgba(200,148,89,.95)" : "rgba(80,95,120,.6)";
      const wpx = 74;
      ctx.beginPath();
      (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void }).roundRect(
        p.x - wpx / 2, p.y - 52, wpx, 24, 12,
      );
      ctx.fill();
      if (isCur) {
        ctx.strokeStyle = "rgba(255,224,168,.95)";
        ctx.lineWidth = 2.6;
        ctx.stroke();
      }
      ctx.fillStyle = on ? "#241505" : "#C6D2E4";
      ctx.font = "700 14px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(NODE_NAME[id], p.x, p.y - 35);
    });
  }

  // 내 암석 캐릭터 — 상태별 모습 + 여행 보간(포물선 점프)
  function drawRock(ctx: CanvasRenderingContext2D, tMs: number): void {
    let x: number;
    let y: number;
    let form: NodeId = cur;
    if (travel) {
      const p0 = NODE_POS[travel.from];
      const p1 = NODE_POS[travel.to];
      const t = travel.t < 0.5 ? 2 * travel.t * travel.t : 1 - Math.pow(-2 * travel.t + 2, 2) / 2;
      x = p0.x + (p1.x - p0.x) * t;
      y = p0.y + (p1.y - p0.y) * t - Math.sin(t * Math.PI) * 72;
      form = travel.t > 0.62 ? travel.to : travel.from;
    } else {
      const p = NODE_POS[cur];
      x = p.x;
      y = p.y + Math.sin(tMs / 480) * 3;
    }
    const shake = wobble > 0 ? Math.sin(tMs / 28) * 5 * wobble : 0;
    ctx.save();
    ctx.translate(x + shake, y);
    ctx.fillStyle = "rgba(10,16,28,.4)";
    ctx.beginPath();
    ctx.ellipse(0, 20, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (form === "magma") {
      const g = ctx.createRadialGradient(-6, -8, 2, 0, 0, 24);
      g.addColorStop(0, "#FFE9A0");
      g.addColorStop(0.6, "#FF9A3C");
      g.addColorStop(1, "#E05A18");
      ctx.fillStyle = g;
      const w1 = Math.sin(tMs / 260) * 2.4;
      ctx.beginPath();
      ctx.moveTo(-22, 6);
      ctx.quadraticCurveTo(-24, -10 - w1, -6, -16);
      ctx.quadraticCurveTo(10, -22 + w1, 22, -6);
      ctx.quadraticCurveTo(26, 10, 8, 16 + w1);
      ctx.quadraticCurveTo(-10, 20, -22, 6);
      ctx.closePath();
      ctx.fill();
    } else if (form === "sediment") {
      const g = ctx.createLinearGradient(-20, -14, 20, 14);
      g.addColorStop(0, "#D8B98A");
      g.addColorStop(1, "#A8895C");
      ctx.fillStyle = g;
      for (let i = 0; i < 7; i++) {
        const gx = -16 + (i % 4) * 10 + (i > 3 ? 5 : 0);
        const gy = 8 - Math.floor(i / 4) * 11;
        ctx.beginPath();
        ctx.arc(gx, gy, 7 - (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "#6B4F33";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    } else {
      const grads: Record<"igneous" | "sedrock" | "metamorphic", [string, string, string]> = {
        igneous: ["#9AA6B4", "#5E6A78", "#3E4854"],
        sedrock: ["#C9A26A", "#8F6B3E", "#6B4A22"],
        metamorphic: ["#B8A6C9", "#71618A", "#4E4260"],
      };
      const [c0, c1, edge] = grads[form as "igneous" | "sedrock" | "metamorphic"];
      const g = ctx.createLinearGradient(-20, -20, 20, 20);
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-24, 8);
      ctx.quadraticCurveTo(-26, -12, -8, -18);
      ctx.quadraticCurveTo(12, -24, 24, -8);
      ctx.quadraticCurveTo(28, 10, 12, 16);
      ctx.quadraticCurveTo(-10, 20, -24, 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = edge;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (form === "sedrock") {
        ctx.strokeStyle = "rgba(255,244,226,.55)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-20, -4);
        ctx.quadraticCurveTo(0, -8, 21, -3);
        ctx.moveTo(-21, 5);
        ctx.quadraticCurveTo(0, 1, 22, 6);
        ctx.stroke();
      }
      if (form === "metamorphic") {
        ctx.strokeStyle = "rgba(240,230,255,.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (const yy of [-9, -2, 5, 11]) {
          ctx.moveTo(-22, yy);
          ctx.quadraticCurveTo(0, yy - 3, 22, yy);
        }
        ctx.stroke();
      }
    }
    // 얼굴(점 눈 + 입) — 스틱맨 잉크 라인 정체성
    ctx.fillStyle = "#232B36";
    ctx.beginPath();
    ctx.arc(-6, -6, 2.4, 0, Math.PI * 2);
    ctx.arc(7, -6, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#232B36";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (wobble > 0.2) ctx.arc(0.5, 6, 4.6, Math.PI * 1.12, Math.PI * 1.88);
    else ctx.arc(0.5, 1, 5, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    ctx.restore();
  }

  function leave(): void {
    loop?.stop();
    loop = null;
    rot?.dispose();
    rot = null;
    if (finished) {
      enterBtn.querySelector("span")!.textContent = "다시 여행하기";
      enterBtn.classList.remove("pulse");
    } else {
      helper.innerHTML = "여행이 아직 끝나지 않았어요 — 다시 열어서 <b>다섯 정거장</b>을 모두 돌아봐요!";
    }
  }

  enterBtn.addEventListener("click", enter);

  api.setCTA("순환 여행을 완주해요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    rot?.dispose();
  };
};

function enterArtSvg(): string {
  return `<svg viewBox="0 0 280 96" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="rc-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6B4F33"/><stop offset="1" stop-color="#7A2E17"/>
      </linearGradient>
      <radialGradient id="rc-m" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFC24D"/><stop offset="1" stop-color="#E05A18"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="280" height="96" rx="16" fill="#0B1524"/>
    <path d="M0 52 L60 50 Q86 18 100 20 Q112 21 128 50 L280 48 L280 96 L0 96 Z" fill="url(#rc-g)"/>
    <ellipse cx="44" cy="82" rx="26" ry="12" fill="url(#rc-m)"/>
    <path d="M96 30 q4 -8 8 0" stroke="#FF9A3C" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="190" cy="52" rx="34" ry="6" fill="#3F6FB0" opacity=".85"/>
    <g stroke="#F2E8D8" stroke-width="1.6">
      <circle cx="150" cy="74" r="9" fill="#C9A26A"/>
      <path d="M144 71 h12 M144 77 h12" opacity=".7"/>
    </g>
    <circle cx="147" cy="72" r="1.2" fill="#232B36"/><circle cx="153" cy="72" r="1.2" fill="#232B36"/>
    <path d="M148 76 q2 2 4 0" stroke="#232B36" stroke-width="1.4" fill="none"/>
    <path d="M247 40l8 8-8 8" stroke="#C89459" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
