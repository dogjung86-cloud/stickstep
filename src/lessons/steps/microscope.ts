// microscope — 세포 관찰 실험 시뮬레이터.
// 염색 → 대물렌즈 배율(총배율 = 접안 10배 × 대물) → 초점 맞추기.
// 고배율 + 초점 + 염색이 맞으면 핵이 뚜렷해지고 CTA가 켜진다.

import { el, clamp, afterPaint } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { fitCanvas } from "../../ui/canvas";
import type { StepRenderer } from "../types";

type Specimen = "onion" | "cheek" | "elodea";
interface MicroStep {
  title: string;
  lead?: string;
  specimen?: Specimen;
  cta?: string;
  explainGood?: string;
}

const PRESET: Record<Specimen, { name: string; stain: string; stainColor: string; shape: "brick" | "blob" | "elodea"; needsStain: boolean }> = {
  onion: { name: "양파 표피세포", stain: "아세트올세인", stainColor: "#C0356B", shape: "brick", needsStain: true },
  cheek: { name: "입안 상피세포", stain: "메틸렌 블루", stainColor: "#2A5CC8", shape: "blob", needsStain: true },
  elodea: { name: "검정말 잎세포", stain: "염색 안 함", stainColor: "#1F9E57", shape: "elodea", needsStain: false },
};

export const microscope: StepRenderer = (host, step, api) => {
  const s = step as unknown as MicroStep;
  const preset = PRESET[s.specimen ?? "onion"];
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  let objective = 4; // 대물렌즈 배율
  let focus = 20; // 0~100, 선명 지점 70
  let stained = !preset.needsStain;
  let goalHit = false;

  const canvas = el("canvas", { class: "mic-canvas", style: "height:250px" });
  const hud = el(
    "div",
    { class: "stage-hud" },
    el("div", { class: "pill" }, el("span", { class: "pdot" }), el("span", { text: preset.name })),
    el("div", { class: "tempread mic-mag", style: "font-size:20px" }, "40", el("small", { text: "배" })),
  );
  const stage = el("div", { class: "stage mic-stage" }, canvas, hud);

  // 염색
  const stainBtn = el("button", { class: "swapbtn", html: `<span>${preset.needsStain ? `${preset.stain}으로 염색하기` : "염색이 필요 없어요"}</span>` });
  if (!preset.needsStain) stainBtn.classList.add("done-static");

  // 대물렌즈 세그먼트
  const seg = el("div", { class: "seg" });
  const objBtns = [4, 10, 40].map((o) => {
    const b = el("button", { class: o === objective ? "on" : "", text: `대물 ${o}배` });
    b.addEventListener("click", () => {
      objective = o;
      seg.querySelectorAll("button").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      haptic(HAPTIC.select);
      redraw();
    });
    seg.appendChild(b);
    return b;
  });
  void objBtns;

  // 초점 슬라이더
  const thumb = el("div", { class: "sl-thumb" }, el("i", {}));
  const track = el("div", { class: "sl-track plain" }, el("div", { class: "sl-fill" }), thumb);
  const slider = el("div", { class: "slider" }, track, el("div", { class: "sl-cap", text: "초점 손잡이" }));

  const helper = el("div", { class: "helper" });
  host.append(stage, stainBtn, seg, slider, helper);

  stainBtn.addEventListener("click", () => {
    if (!preset.needsStain || stained) return;
    stained = true;
    stainBtn.innerHTML = "<span>염색 완료</span>";
    stainBtn.classList.add("done-static");
    haptic(HAPTIC.select);
    redraw();
  });

  // 초점 드래그
  let dragging = false;
  function setFocusFromEvent(e: PointerEvent): void {
    const rect = track.getBoundingClientRect();
    focus = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    thumb.style.left = `${focus}%`;
    (track.querySelector(".sl-fill") as HTMLElement).style.width = `${focus}%`;
    redraw();
  }
  slider.addEventListener("pointerdown", (e) => {
    dragging = true;
    slider.classList.add("drag");
    slider.setPointerCapture((e as PointerEvent).pointerId);
    setFocusFromEvent(e as PointerEvent);
    haptic(HAPTIC.tap);
  });
  slider.addEventListener("pointermove", (e) => { if (dragging) setFocusFromEvent(e as PointerEvent); });
  const end = () => { dragging = false; slider.classList.remove("drag"); };
  slider.addEventListener("pointerup", end);
  slider.addEventListener("pointercancel", end);
  thumb.style.left = `${focus}%`;

  function redraw(): void {
    const total = 10 * objective;
    const magEl = host.querySelector(".mic-mag") as HTMLElement;
    magEl.childNodes[0].nodeValue = String(total);

    const sharp = Math.abs(focus - 70) < 12;
    const highMag = objective === 40;
    const ready = sharp && highMag && stained;

    helper.innerHTML = !stained
      ? "먼저 <b>염색액</b>으로 세포를 물들여요. 그래야 핵이 잘 보여요."
      : !highMag
        ? "관찰은 <b>저배율에서 고배율로</b>. 대물렌즈를 <b>40배</b>까지 올려 보세요."
        : !sharp
          ? "<b>초점 손잡이</b>를 돌려 상이 또렷해지는 지점을 찾아요."
          : "핵이 <b>뚜렷하게</b> 보여요! 총배율 = 접안렌즈 10배 × 대물렌즈 배율이에요.";

    drawField(total, focus, stained);

    if (ready && !goalHit) {
      goalHit = true;
      api.enableCTA(s.cta ?? "관찰 성공! 다음");
    }
  }

  function drawField(total: number, foc: number, isStained: boolean): void {
    const { ctx, w, h } = fitCanvas(canvas, 250);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 10;
    // 시야 원 배경
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = preset.shape === "elodea" ? "#EAF7EE" : "#F6F0F5";
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

    const blur = (Math.abs(foc - 70) / 70) * 11;
    ctx.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : "none";

    const cellW = 16 * (total / 40);
    const cellH = cellW * (preset.shape === "brick" ? 0.62 : 0.9);
    const cols = Math.ceil((R * 2) / cellW) + 2;
    const rows = Math.ceil((R * 2) / cellH) + 2;
    const cyto = isStained ? tint(preset.stainColor, 0.14) : "rgba(160,170,180,.10)";
    const wall = preset.shape === "elodea" ? "#8FCBA1" : isStained ? tint(preset.stainColor, 0.5) : "#C7CDd4";
    const nucleus = isStained ? preset.stainColor : "rgba(120,130,145,.5)";

    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        const bx = cx - R + c * cellW + (r % 2 ? cellW / 2 : 0);
        const by = cy - R + r * cellH;
        ctx.fillStyle = cyto;
        ctx.strokeStyle = wall;
        ctx.lineWidth = Math.max(1, cellW * 0.05);
        roundRect(ctx, bx, by, cellW * 0.94, cellH * 0.94, Math.min(8, cellW * 0.18));
        ctx.fill();
        ctx.stroke();
        if (preset.shape === "elodea") {
          // 엽록체 알갱이
          ctx.fillStyle = "#2FA35F";
          for (let k = 0; k < 6; k++) {
            const gx = bx + cellW * (0.2 + 0.6 * ((k * 37) % 100) / 100);
            const gy = by + cellH * (0.2 + 0.6 * ((k * 53) % 100) / 100);
            ctx.beginPath();
            ctx.arc(gx, gy, Math.max(1.5, cellW * 0.06), 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // 핵
          ctx.fillStyle = nucleus;
          ctx.beginPath();
          ctx.arc(bx + cellW * 0.5, by + cellH * 0.5, Math.max(2, cellW * 0.13), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.filter = "none";
    ctx.restore();
    // 시야 테두리 + 비네트
    const g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(10,16,26,.4)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.15)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
  }

  api.setCTA("현미경을 조작해 관찰하세요", { enabled: false });
  afterPaint(redraw);
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function tint(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
