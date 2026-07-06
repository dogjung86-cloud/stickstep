// zodiacRing — 지구의 공전과 별자리 변화 랩(VII 단원 L4). 교과서 그림 VII-8(247쪽)의 조작판.
//   · 위에서 내려다본 지구 공전 궤도 + 바깥 황도 12궁 링.
//   · 지구를 궤도에서 끌면 달(月)이 바뀌고, "태양 쪽 별자리(못 봄)"와
//     "한밤중 남쪽 하늘 별자리(잘 봄)"가 실시간으로 표시된다.
// 목표: ① 지구를 끌어 두 별자리 비교 ② 물고기자리가 태양 쪽인 달 찾기(4월)
//       ③ 궁수자리가 한밤에 잘 보이는 달 찾기(7월).

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface ZodiacStep {
  title: string;
  lead?: string;
  cta?: string;
}

// index i = (i+1)월에 태양 쪽에 있는 별자리(그림 VII-8)
const ZODIAC = ["궁수", "염소", "물병", "물고기", "양", "황소", "쌍둥이", "게", "사자", "처녀", "천칭", "전갈"];

export const zodiacRing: StepRenderer = (host, step, api) => {
  const s = step as unknown as ZodiacStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:340px" }) as HTMLCanvasElement;
  const monthPill = el("span", { text: "지구를 끌어 보세요" });
  const cap = el("div", { class: "stage-cap", text: "파란 지구를 잡아 궤도를 따라 끌어요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#5AA2F8" }), monthPill)),
    cap,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "look" } }, el("b", { text: "두 별자리" }), el("span", { text: "비교하기" })),
    el("div", { class: "pn-badge", dataset: { g: "fish" } }, el("b", { text: "물고기자리" }), el("span", { text: "태양 쪽인 달?" })),
    el("div", { class: "pn-badge", dataset: { g: "archer" } }, el("b", { text: "궁수자리" }), el("span", { text: "한밤에 보려면?" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "지구는 태양 둘레를 <b>1년에 한 바퀴</b> 돌아요(공전). 지구를 끌면서 — <b>태양 쪽</b> 별자리와 <b>반대쪽</b> 별자리가 어떻게 바뀌는지 보세요!",
  });
  host.append(goalChips, stage, helper);

  // ---- 상태 ----
  let month = 0; // 0 = 1월
  let earthA = Math.PI; // 지구 각도(= 1월 위치)
  let dragging = false;
  let dragDeg = 0;
  let lastA = earthA;
  let capFaded = false;
  let holdFish = 0;
  let holdArcher = 0;
  const goals = new Set<string>();
  let finished = false;

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    const hints: Record<string, string> = {
      look: "느낌이 오죠? <b>태양 쪽 별자리는 태양 빛 때문에 못 보고</b>, 반대쪽 별자리는 <b>한밤중 남쪽 하늘</b>에서 잘 보여요. 이제 <b>물고기자리가 태양 쪽</b>이 되는 달을 찾아보세요!",
      fish: "4월이에요! 그럼 반대로, <b>궁수자리를 한밤중에</b> 보고 싶다면 몇 월로 가야 할까요?",
      archer: "7월! 궁수자리의 <b>반대쪽(태양 쪽)엔 쌍둥이자리</b>가 있죠. 태양이 걸린 별자리는 여름에, 그 별자리는 겨울에 잘 보이는 식이에요.",
    };
    if (!finished) helper.innerHTML = hints[id] ?? "";
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 지구가 <b>공전</b>하니 태양이 걸려 있는 별자리(황도 12궁)가 달마다 바뀌고, 그래서 <b>계절마다 잘 보이는 별자리가 달라져요</b>. 태양이 별자리 사이를 1년에 한 바퀴 도는 것처럼 보이는 걸 <b>연주 운동</b>이라 해요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 입력 ----
  const geom = (): { cx: number; cy: number; orbitR: number; ringR: number } => {
    const W = canvas.clientWidth || 340;
    const cx = W / 2;
    const cy = 172;
    const orbitR = Math.min(W, 340) * 0.21;
    const ringR = Math.min(W / 2 - 26, 150);
    return { cx, cy, orbitR, ringR };
  };
  function pointerAngle(e: PointerEvent): number {
    const r = canvas.getBoundingClientRect();
    const { cx, cy } = geom();
    return Math.atan2(e.clientY - r.top - cy, e.clientX - r.left - cx);
  }
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastA = pointerAngle(e);
    if (!capFaded) {
      capFaded = true;
      cap.classList.add("fade");
    }
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트 */
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const a = pointerAngle(e);
    let d = a - lastA;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    earthA += d;
    dragDeg += Math.abs((d * 180) / Math.PI);
    lastA = a;
    if (dragDeg > 55) collect("look", "달라진다!");
  });
  const up = (): void => {
    dragging = false;
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt) => {
    const fit = fitCanvas(canvas, 340);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;
    const { cx, cy, orbitR, ringR } = geom();

    // 달 계산: i월 태양 쪽 별자리 각도 = i*30°(위=12시부터 시계방향 아님 — 표준 수학각).
    // 별자리 k(=k+1월 태양 쪽)를 각도 A_k = k*30°에 두고, 지구의 k월 위치는 A_k+180°.
    const norm = ((earthA % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const sunSideA = norm + Math.PI; // 지구→태양 방향 연장 = 태양 쪽 별자리 각도
    month = Math.round((((sunSideA / (Math.PI * 2)) * 12) % 12 + 12) % 12) % 12;
    const sunConst = ZODIAC[month];
    monthPill.textContent = `${month + 1}월 — 태양 쪽 ${sunConst}자리`;

    // 배경
    ctx.fillStyle = "rgba(8,14,28,.6)";
    ctx.fillRect(6, 6, W - 12, H - 12);
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 89) % (W - 30)) + 15;
      const sy = ((i * 53) % (H - 30)) + 15;
      ctx.fillStyle = `rgba(220,232,255,${0.18 + ((i * 31) % 10) / 30})`;
      ctx.fillRect(sx, sy, 1.4, 1.4);
    }

    // 12궁 링
    ctx.font = "600 10.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const zx = cx + Math.cos(a) * ringR;
      const zy = cy + Math.sin(a) * ringR;
      const isSun = k === month;
      const isNight = k === (month + 6) % 12;
      // 별 무리(점 3개)
      const dotC = isSun ? "rgba(148,160,182,.5)" : isNight ? "rgba(255,224,140,.95)" : "rgba(190,210,240,.75)";
      ctx.fillStyle = dotC;
      for (let j = 0; j < 3; j++) {
        const ja = a + (j - 1) * 0.09;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ja) * (ringR + (j % 2) * 7 - 3), cy + Math.sin(ja) * (ringR + (j % 2) * 7 - 3), j === 1 ? 2.2 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // 이름
      const lx = cx + Math.cos(a) * (ringR - 22);
      const ly = cy + Math.sin(a) * (ringR - 22);
      ctx.fillStyle = isSun ? "rgba(148,160,182,.6)" : isNight ? "rgba(255,232,170,1)" : "rgba(196,212,238,.85)";
      ctx.fillText(ZODIAC[k], lx, ly + 3.5);
      if (isNight) {
        ctx.strokeStyle = "rgba(255,214,138,.7)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(zx, zy, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 시선(지구→태양쪽 / 지구→반대쪽)
    const ex = cx + Math.cos(norm) * orbitR;
    const ey = cy + Math.sin(norm) * orbitR;
    const toSun = Math.atan2(cy - ey, cx - ex);
    ctx.setLineDash([4, 5]);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "rgba(255,170,80,.55)";
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(cx + Math.cos(sunSideA) * ringR, cy + Math.sin(sunSideA) * ringR);
    ctx.stroke();
    ctx.strokeStyle = "rgba(140,190,255,.6)";
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex + Math.cos(toSun + Math.PI) * (ringR - orbitR + 10), ey + Math.sin(toSun + Math.PI) * (ringR - orbitR + 10));
    ctx.stroke();
    ctx.setLineDash([]);

    // 궤도 + 태양
    ctx.strokeStyle = "rgba(110,140,184,.5)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
    ctx.stroke();
    const sg = ctx.createRadialGradient(cx, cy, 2, cx, cy, 26);
    sg.addColorStop(0, "rgba(255,238,190,1)");
    sg.addColorStop(0.4, "rgba(255,190,80,.9)");
    sg.addColorStop(1, "rgba(255,170,60,0)");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFC85E";
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fill();

    // 지구(드래그 핸들)
    const eg = ctx.createRadialGradient(ex - 3, ey - 3, 1, ex, ey, 11);
    eg.addColorStop(0, "#9FC6F4");
    eg.addColorStop(0.55, "#3D7BDC");
    eg.addColorStop(1, "#1B4B9E");
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(ex, ey, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = dragging ? "rgba(255,255,255,.9)" : "rgba(160,200,255,.6)";
    ctx.lineWidth = dragging ? 2.4 : 1.6;
    ctx.beginPath();
    ctx.arc(ex, ey, 13.5, 0, Math.PI * 2);
    ctx.stroke();
    // 지구의 밤쪽(태양 반대 반원)
    ctx.fillStyle = "rgba(8,12,26,.55)";
    ctx.beginPath();
    ctx.arc(ex, ey, 10, toSun + Math.PI / 2, toSun + Math.PI * 1.5);
    ctx.fill();

    // 라벨(태양 쪽 / 한밤 남쪽) — 시선축과 수직으로 띄워 별자리·지구와 안 겹치게
    ctx.font = "700 11px Pretendard, sans-serif";
    const off = 22;
    const px2 = Math.cos(sunSideA + Math.PI / 2) * off;
    const py2 = Math.sin(sunSideA + Math.PI / 2) * off;
    ctx.fillStyle = "rgba(255,178,120,.9)";
    ctx.fillText("태양 쪽 — 못 봐요", cx + Math.cos(sunSideA) * (ringR - 48) + px2, cy + Math.sin(sunSideA) * (ringR - 48) + py2);
    const nA = sunSideA + Math.PI;
    ctx.fillStyle = "rgba(180,214,255,.95)";
    ctx.fillText("한밤 남쪽 — 잘 보여요", cx + Math.cos(nA) * (ringR - 48) - px2, cy + Math.sin(nA) * (ringR - 48) - py2);

    // 목표 홀드 판정
    if (goals.has("look") && month === 3) {
      holdFish += dt * 16.7;
      if (holdFish > 480) collect("fish", "4월!");
    } else holdFish = 0;
    if (goals.has("fish") && month === 6) {
      holdArcher += dt * 16.7;
      if (holdArcher > 480) collect("archer", "7월!");
    } else holdArcher = 0;
  });

  api.setCTA("지구를 돌려 별자리를 찾아요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
