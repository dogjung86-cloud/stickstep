// skyDaily — 별의 일주 운동 랩(VII 단원 L4). 교과서 그림 VII-7(245쪽)의 조작판.
//   · 동/남/서/북 네 하늘을 골라 장노출 사진처럼 별 궤적을 관찰한다.
//   · 동: 비스듬히 떠오름(↗) · 남: 왼→오(→) · 서: 비스듬히 짐(↘) ·
//     북: 한 별(북극성)을 중심으로 시계 반대 방향 회전.
// 목표: ① 동·남·서 관찰 ② 북쪽의 회전 중심 별 찾기(탭) ③ 회전 방향 맞히기.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface SkyStep {
  title: string;
  lead?: string;
  cta?: string;
}

type Dir = "E" | "S" | "W" | "N";

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const skyDaily: StepRenderer = (host, step, api) => {
  const s = step as unknown as SkyStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:300px" }) as HTMLCanvasElement;
  const dirPill = el("span", { text: "동쪽 하늘" });
  const seg = el("div", { class: "seg stage-seg" });
  const dirBtns = new Map<Dir, HTMLButtonElement>();
  const mkDir = (d: Dir, label: string): HTMLButtonElement => {
    const b = el("button", { text: label, attrs: { type: "button", "aria-pressed": String(d === "E") } }) as HTMLButtonElement;
    if (d === "E") b.classList.add("on");
    b.addEventListener("click", () => setDir(d));
    dirBtns.set(d, b);
    return b;
  };
  seg.append(mkDir("E", "동"), mkDir("S", "남"), mkDir("W", "서"), mkDir("N", "북"));
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#8FB3E8" }), dirPill), seg),
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "three" } }, el("b", { text: "동·남·서" }), el("span", { text: "0/3 관찰" })),
    el("div", { class: "pn-badge", dataset: { g: "pole" } }, el("b", { text: "북쪽 하늘" }), el("span", { text: "중심 별은?" })),
    el("div", { class: "pn-badge", dataset: { g: "spin" } }, el("b", { text: "회전 방향" }), el("span", { text: "시계? 반대?" })),
  );
  const choiceRow = el("div", { class: "hook-choices sky-choices" });
  const helper = el("div", {
    class: "helper",
    html: "하룻밤 별 사진을 <b>길게 노출</b>해 찍으면 궤적이 남아요. 동쪽 하늘부터 — 별이 어느 쪽으로 흐르나요?",
  });
  host.append(goalChips, stage, choiceRow, helper);

  // ---- 상태 ----
  let dir: Dir = "E";
  let t = 0;
  const seenMs: Record<Dir, number> = { E: 0, S: 0, W: 0, N: 0 };
  const seen = new Set<Dir>();
  let poleFound = false;
  let poleFlash = 0;
  let spinAsked = false;
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
        "이 모든 움직임은 별이 아니라 <b>지구가 하루에 한 바퀴 자전</b>하기 때문에 생기는 <b>겉보기 운동(일주 운동)</b>이에요. 그래서 방향은 자전 방향(서→동)의 <b>반대</b>로 보이죠.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function setDir(d: Dir): void {
    if (dir === d) return;
    dir = d;
    for (const [k, b] of dirBtns) {
      b.classList.toggle("on", k === d);
      b.setAttribute("aria-pressed", String(k === d));
    }
    dirPill.textContent = d === "E" ? "동쪽 하늘" : d === "S" ? "남쪽 하늘" : d === "W" ? "서쪽 하늘" : "북쪽 하늘";
    haptic(HAPTIC.select);
    if (d === "N" && !poleFound) helper.innerHTML = "북쪽 하늘은 특별해요 — 궤적이 <b>원</b>을 그려요! 돌지 않고 <b>가만히 있는 별</b>을 찾아 탭해 보세요.";
  }

  // 별 시드
  const stars: { u: number; v: number; b: number }[] = [];
  {
    const rnd = mulberry(77);
    for (let i = 0; i < 46; i++) stars.push({ u: rnd(), v: rnd(), b: 0.4 + rnd() * 0.6 });
  }

  // 북극성 위치(캔버스 비율)
  const POLE = { x: 0.5, y: 0.4 };

  canvas.addEventListener("pointerdown", (e) => {
    if (dir !== "N" || poleFound) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / 300;
    const d = Math.hypot((x - POLE.x) * r.width, (y - POLE.y) * 300);
    if (d < 22) {
      poleFound = true;
      poleFlash = 1400;
      haptic(HAPTIC.correct);
      collect("pole", "북극성!");
      helper.innerHTML = "맞아요, <b>북극성</b>! 다른 별들이 모두 이 별을 중심으로 돌아요. 그럼 도는 방향은…?";
      if (!spinAsked) {
        spinAsked = true;
        const mk = (label: string, ok: boolean): HTMLButtonElement => {
          const b = el("button", { class: "hook-choice", attrs: { type: "button" }, text: label }) as HTMLButtonElement;
          b.addEventListener("click", () => {
            if (choiceRow.classList.contains("locked")) return;
            choiceRow.classList.add("locked");
            choiceRow.querySelectorAll(".hook-choice").forEach((x2) => {
              x2.classList.add(x2 === b ? (ok ? "sel" : "dim") : ok ? "dim" : "sel");
              (x2 as HTMLButtonElement).disabled = true;
            });
            if (ok) {
              haptic(HAPTIC.correct);
              helper.innerHTML = "정답 — <b>시계 반대 방향</b>! 궤적 화살표를 다시 확인해 보세요.";
            } else {
              haptic(HAPTIC.wrong);
              helper.innerHTML = "궤적을 다시 보면 <b>시계 반대 방향</b>으로 돌고 있어요 — 지구 자전의 반대 방향이죠.";
            }
            collect("spin", "시계 반대!");
          });
          return b;
        };
        choiceRow.append(mk("시계 방향", false), mk("시계 반대 방향", true));
        choiceRow.classList.add("show");
      }
    } else {
      haptic(HAPTIC.tap);
      helper.innerHTML = "그 별도 돌고 있어요! <b>궤적 원들의 한가운데</b>, 움직이지 않는 별을 찾아보세요.";
    }
  });

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt) => {
    t += dt;
    const fit = fitCanvas(canvas, 300);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;

    // 관찰 시간 집계(동남서)
    if (dir !== "N") {
      seenMs[dir] += dt * 16.7;
      if (seenMs[dir] > 1500 && !seen.has(dir)) {
        seen.add(dir);
        const chip = goalChips.querySelector('[data-g="three"] span') as HTMLElement;
        chip.textContent = `${seen.size}/3 관찰`;
        haptic(HAPTIC.tap);
        if (seen.size === 3) {
          collect("three", "방향이 달라!");
          helper.innerHTML = "동은 <b>↗ 떠오르고</b>, 남은 <b>→ 흐르고</b>, 서는 <b>↘ 져요</b>. 그럼 <b>북쪽</b> 하늘은 어떨까요?";
        } else if (!goals.has("three")) {
          helper.innerHTML = "좋아요! 다른 방향 하늘도 눌러서 궤적을 비교해 보세요.";
        }
      }
    }

    // 하늘 배경
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "rgba(9,15,32,.92)");
    bg.addColorStop(1, "rgba(24,38,70,.88)");
    ctx.fillStyle = bg;
    ctx.fillRect(6, 6, W - 12, H - 12);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(6, 6, W - 12, H - 12, 14);
    ctx.clip();

    const speed = 0.0155;
    if (dir === "N") {
      // 북: 북극성 중심 반시계 회전(궤적 호)
      const px = POLE.x * W;
      const py = POLE.y * 300;
      for (const st2 of stars) {
        const rad = 14 + st2.u * Math.min(W, 300) * 0.46;
        const a0 = st2.v * Math.PI * 2 - t * speed; // 반시계(화면 기준)
        const arc = 0.55;
        ctx.strokeStyle = `rgba(190,214,255,${0.16 + st2.b * 0.22})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, rad, a0, a0 + arc);
        ctx.stroke();
        const hx = px + Math.cos(a0) * rad;
        const hy = py + Math.sin(a0) * rad;
        ctx.fillStyle = `rgba(226,238,255,${0.6 + st2.b * 0.4})`;
        ctx.beginPath();
        ctx.arc(hx, hy, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
      // 회전 방향 화살표(안내)
      ctx.strokeStyle = "rgba(255,214,138,.75)";
      ctx.lineWidth = 2.2;
      const gr = Math.min(W, 300) * 0.3;
      ctx.beginPath();
      ctx.arc(px, py, gr, -0.5, -1.5, true);
      ctx.stroke();
      // 화살촉 — 호의 진행 방향(각도가 줄어드는 쪽) 접선에 정렬
      const aEnd = -1.5;
      const ax = px + Math.cos(aEnd) * gr;
      const ay = py + Math.sin(aEnd) * gr;
      ctx.fillStyle = "rgba(255,214,138,.9)";
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(Math.atan2(-Math.cos(aEnd), Math.sin(aEnd)));
      ctx.beginPath();
      ctx.moveTo(3, 0);
      ctx.lineTo(-7, -5);
      ctx.lineTo(-7, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // 북극성
      const tw = poleFound ? 1 : 0.75 + Math.sin(t * 0.1) * 0.25;
      ctx.fillStyle = `rgba(255,240,200,${tw})`;
      ctx.beginPath();
      ctx.arc(px, py, poleFound ? 4 : 3.2, 0, Math.PI * 2);
      ctx.fill();
      if (poleFlash > 0) {
        poleFlash -= dt * 16.7;
        ctx.strokeStyle = `rgba(255,224,168,${poleFlash / 1400})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 12 + (1 - poleFlash / 1400) * 16, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (poleFound) {
        ctx.font = "700 11px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,236,200,.95)";
        ctx.fillText("북극성", px, py - 14);
      }
    } else {
      // 동/남/서: 직선 궤적(기울기 0.6과 화살표 각을 일치시킨다)
      const ang = dir === "E" ? Math.atan2(-0.6, 1) : dir === "W" ? Math.atan2(0.6, 1) : 0; // 동: ↗(위로), 서: ↘
      const dx = Math.cos(ang);
      const dy = Math.sin(ang);
      const span = W + 200;
      for (const st2 of stars) {
        const off = ((st2.u * span + t * speed * 900) % span) - 100;
        const baseY = 30 + st2.v * 210;
        const hx = dir === "S" ? off : off;
        const hy = dir === "S" ? baseY : baseY - off * (dir === "E" ? 0.6 : -0.6);
        const len = 34;
        ctx.strokeStyle = `rgba(190,214,255,${0.14 + st2.b * 0.2})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hx - dx * len, hy - dy * len + (dir === "S" ? 0 : 0));
        ctx.lineTo(hx, hy);
        ctx.stroke();
        ctx.fillStyle = `rgba(226,238,255,${0.55 + st2.b * 0.45})`;
        ctx.beginPath();
        ctx.arc(hx, hy, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
      // 방향 화살표
      const cx = W / 2;
      const cy = 120;
      ctx.strokeStyle = "rgba(255,214,138,.8)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - dx * 34, cy - dy * 34);
      ctx.lineTo(cx + dx * 34, cy + dy * 34);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,214,138,.9)";
      ctx.save();
      ctx.translate(cx + dx * 34, cy + dy * 34);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-9, -4.5);
      ctx.lineTo(-9, 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 지평선 실루엣
    ctx.fillStyle = "rgba(10,18,36,.95)";
    ctx.beginPath();
    ctx.moveTo(6, H - 6);
    ctx.lineTo(6, H - 40);
    ctx.quadraticCurveTo(W * 0.3, H - 64, W * 0.55, H - 42);
    ctx.quadraticCurveTo(W * 0.78, H - 26, W - 6, H - 46);
    ctx.lineTo(W - 6, H - 6);
    ctx.closePath();
    ctx.fill();
    // 집 실루엣
    ctx.fillStyle = "rgba(6,10,22,.95)";
    ctx.fillRect(W * 0.72, H - 58, 26, 22);
    ctx.beginPath();
    ctx.moveTo(W * 0.72 - 4, H - 58);
    ctx.lineTo(W * 0.72 + 13, H - 70);
    ctx.lineTo(W * 0.72 + 30, H - 58);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  api.setCTA("네 하늘을 모두 관찰해요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
