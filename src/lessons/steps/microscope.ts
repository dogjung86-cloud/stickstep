// microscope — 세포 관찰 실험 시뮬레이터.
// 비교 모드: 입안 상피세포를 염색해 관찰한 뒤 검정말 잎세포와 나란히 비교한다.
// 단일 표본 모드는 기존 specimen 옵션(onion·cheek·elodea)과 호환한다.

import { clamp, el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

type Specimen = "onion" | "cheek" | "elodea";
type CellShape = "onion" | "cheek" | "elodea";

interface Preset {
  name: string;
  prepLabel: string;
  preparedLabel: string;
  stainColor: string;
  shape: CellShape;
  needsPrep: boolean;
}

interface SpecimenState {
  prepared: boolean;
  lowScanned: boolean;
}

interface MicroStep {
  title: string;
  lead?: string;
  specimen?: Specimen;
  compare?: boolean;
  cta?: string;
  explainGood?: string;
}

const PRESET: Record<Specimen, Preset> = {
  onion: {
    name: "양파 표피세포",
    prepLabel: "아세트올세인으로 염색하기",
    preparedLabel: "아세트올세인 염색 완료",
    stainColor: "#C0356B",
    shape: "onion",
    needsPrep: true,
  },
  cheek: {
    name: "입안 상피세포",
    prepLabel: "메틸렌 블루 한 방울 떨어뜨리기",
    preparedLabel: "메틸렌 블루 염색 완료",
    stainColor: "#2A5CC8",
    shape: "cheek",
    needsPrep: true,
  },
  elodea: {
    name: "검정말 잎세포",
    prepLabel: "물 한 방울로 표본 준비하기",
    preparedLabel: "물 표본 준비 완료",
    stainColor: "#1F9E57",
    shape: "elodea",
    needsPrep: false,
  },
};

const OBJECTIVES = [4, 10, 40] as const;
const SHARP_FOCUS = 70;
const SHARP_RANGE = 8;

export const microscope: StepRenderer = (host, step, api) => {
  const s = step as unknown as MicroStep;
  const compareMode = s.compare === true;
  let specimen: Specimen = compareMode ? "cheek" : (s.specimen ?? "onion");
  let objective: (typeof OBJECTIVES)[number] = 4;
  let focus = 24;
  let dragging = false;
  let activePointer: number | null = null;
  let disposed = false;
  let drawRaf = 0;
  let completed = false;
  const fieldCache = document.createElement("canvas");
  let fieldCacheKey = "";

  const states: Record<Specimen, SpecimenState> = {
    onion: { prepared: !PRESET.onion.needsPrep, lowScanned: false },
    cheek: { prepared: !PRESET.cheek.needsPrep, lowScanned: false },
    // 비교 모드에서는 검정말 표본도 물 한 방울을 직접 떨어뜨려 준비한다.
    elodea: { prepared: compareMode ? false : true, lowScanned: false },
  };
  const goals = new Set<"low" | "animal" | "plant">();

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = compareMode
    ? el(
        "div",
        { class: "pn-badges force3 mic-goals", attrs: { "aria-label": "관찰 목표" } },
        el(
          "div",
          { class: "pn-badge mic-goal", dataset: { g: "low" } },
          el("b", { text: "저배율 찾기" }),
          el("span", { text: "대물 4배" }),
        ),
        el(
          "div",
          { class: "pn-badge mic-goal", dataset: { g: "animal" } },
          el("b", { text: "동물세포" }),
          el("span", { text: "핵 관찰" }),
        ),
        el(
          "div",
          { class: "pn-badge mic-goal", dataset: { g: "plant" } },
          el("b", { text: "식물세포" }),
          el("span", { text: "벽·엽록체" }),
        ),
      )
    : null;

  const specimenSeg = el("div", {
    class: "seg mic-specimens",
    attrs: { role: "tablist", "aria-label": "관찰 표본" },
  });
  const specimenBtns = {} as Partial<Record<Specimen, HTMLButtonElement>>;
  if (compareMode) {
    (["cheek", "elodea"] as const).forEach((key) => {
      const button = el("button", {
        class: key === specimen ? "on" : "",
        text: PRESET[key].name,
        attrs: {
          type: "button",
          role: "tab",
          "aria-selected": key === specimen ? "true" : "false",
        },
      });
      button.disabled = key === "elodea";
      if (key === "elodea") button.style.opacity = ".45";
      button.addEventListener("click", () => selectSpecimen(key));
      specimenBtns[key] = button;
      specimenSeg.appendChild(button);
    });
  }

  const canvas = el("canvas", {
    class: "mic-canvas",
    style: "height:250px",
    attrs: { "aria-label": "현미경 시야" },
  });
  const specimenName = el("span", { class: "mic-specimen-name", text: PRESET[specimen].name });
  const magValue = document.createTextNode("40");
  const mag = el(
    "div",
    { class: "tempread mic-mag", style: "font-size:20px" },
    magValue,
    el("small", { text: "배" }),
  );
  const hud = el(
    "div",
    { class: "stage-hud" },
    el("div", { class: "pill" }, el("span", { class: "pdot" }), specimenName),
    mag,
  );
  const stage = el("div", { class: "stage mic-stage" }, canvas, hud);

  const prepBtn = el("button", {
    class: "swapbtn mic-prep",
    attrs: { type: "button" },
  }, el("span", { text: "" }));

  const objectiveSeg = el("div", {
    class: "seg mic-objectives",
    attrs: { role: "group", "aria-label": "대물렌즈 배율" },
  });
  const objectiveBtns = {} as Record<(typeof OBJECTIVES)[number], HTMLButtonElement>;
  OBJECTIVES.forEach((value) => {
    const button = el("button", {
      class: value === objective ? "on" : "",
      text: `대물 ${value}배`,
      attrs: { type: "button" },
    });
    button.addEventListener("click", () => setObjective(value));
    objectiveBtns[value] = button;
    objectiveSeg.appendChild(button);
  });

  const fill = el("div", { class: "sl-fill" });
  const thumb = el("div", { class: "sl-thumb" }, el("i", {}));
  const track = el("div", { class: "sl-track plain" }, fill, thumb);
  const slider = el(
    "div",
    {
      class: "slider mic-focus",
      attrs: {
        role: "slider",
        tabindex: "0",
        "aria-label": "초점 손잡이",
        "aria-valuemin": "0",
        "aria-valuemax": "100",
        "aria-valuenow": String(focus),
      },
    },
    track,
    el("div", { class: "sl-cap", text: "초점 손잡이" }),
  );
  const helper = el("div", { class: "helper mic-helper", attrs: { "aria-live": "polite" } });

  if (goalChips) host.appendChild(goalChips);
  host.appendChild(helper); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (compareMode) host.appendChild(specimenSeg);
  host.append(stage, prepBtn, objectiveSeg, slider);

  function currentPreset(): Preset {
    return PRESET[specimen];
  }

  function currentState(): SpecimenState {
    return states[specimen];
  }

  function markGoal(goal: "low" | "animal" | "plant", detail: string): void {
    if (goals.has(goal)) return;
    goals.add(goal);
    const chip = goalChips?.querySelector<HTMLElement>(`[data-g="${goal}"]`);
    chip?.classList.add("on");
    const label = chip?.querySelector("span");
    if (label) label.textContent = detail;
    haptic(HAPTIC.select);
  }

  function unlockPlantSpecimen(): void {
    const plantButton = specimenBtns.elodea;
    if (!plantButton) return;
    plantButton.disabled = false;
    plantButton.style.opacity = "";
  }

  function finishCompare(): void {
    if (completed || goals.size < 3) return;
    completed = true;
    api.recordQuiz(true);
    helper.innerHTML =
      s.explainGood ??
      "비교 완료! 입안 상피세포는 <b>모양이 불규칙하고 핵</b>이 보였고, 검정말 잎세포는 <b>네모난 세포벽과 초록색 엽록체</b>가 보였어요.";
    api.enableCTA(s.cta ?? "두 세포 비교 완료");
  }

  function syncPrepButton(): void {
    const preset = currentPreset();
    const state = currentState();
    const label = prepBtn.querySelector("span")!;
    label.textContent = state.prepared ? preset.preparedLabel : preset.prepLabel;
    prepBtn.classList.toggle("done-static", state.prepared);
    prepBtn.disabled = state.prepared;
  }

  function syncObjectiveButtons(): void {
    OBJECTIVES.forEach((value) => objectiveBtns[value].classList.toggle("on", value === objective));
  }

  function syncSlider(): void {
    thumb.style.left = `${focus}%`;
    fill.style.width = `${focus}%`;
    slider.setAttribute("aria-valuenow", String(Math.round(focus)));
    slider.setAttribute("aria-valuetext", Math.abs(focus - SHARP_FOCUS) <= SHARP_RANGE ? "초점이 선명해요" : "초점이 흐려요");
  }

  function selectSpecimen(next: Specimen): void {
    if (!compareMode || next === specimen) return;
    if (next === "elodea" && !goals.has("animal")) return;
    specimen = next;
    objective = 4;
    focus = next === "elodea" ? 30 : 24;
    specimenName.textContent = currentPreset().name;
    (Object.keys(specimenBtns) as Specimen[]).forEach((key) => {
      const button = specimenBtns[key];
      if (!button) return;
      const on = key === specimen;
      button.classList.toggle("on", on);
      button.setAttribute("aria-selected", on ? "true" : "false");
    });
    syncObjectiveButtons();
    syncSlider();
    syncPrepButton();
    haptic(HAPTIC.select);
    scheduleRedraw();
  }

  function setObjective(next: (typeof OBJECTIVES)[number]): void {
    if (next === objective) return;
    objective = next;
    // 렌즈를 바꾸면 초점이 어긋난다. 특히 고배율에서는 다시 미세 조절해야 한다.
    focus = next === 4 ? 34 : next === 10 ? 42 : 48;
    syncObjectiveButtons();
    syncSlider();
    haptic(HAPTIC.select);
    scheduleRedraw();
  }

  prepBtn.addEventListener("click", () => {
    const state = currentState();
    if (state.prepared) return;
    state.prepared = true;
    syncPrepButton();
    haptic(HAPTIC.select);
    scheduleRedraw();
  });

  function setFocusFromPointer(event: PointerEvent): void {
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    focus = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    syncSlider();
    scheduleRedraw();
  }

  slider.addEventListener("pointerdown", (event) => {
    dragging = true;
    activePointer = event.pointerId;
    slider.classList.add("drag");
    try {
      slider.setPointerCapture(event.pointerId);
    } catch {
      // 합성 포인터 환경에서는 캡처가 실패할 수 있지만 같은 요소 안의 조작은 계속 처리한다.
    }
    setFocusFromPointer(event);
    haptic(HAPTIC.tap);
  });
  slider.addEventListener("pointermove", (event) => {
    if (dragging && (activePointer == null || activePointer === event.pointerId)) setFocusFromPointer(event);
  });

  function endFocusDrag(event?: PointerEvent): void {
    if (!dragging) return;
    dragging = false;
    slider.classList.remove("drag");
    const pointerId = event?.pointerId ?? activePointer;
    if (pointerId != null) {
      try {
        if (slider.hasPointerCapture(pointerId)) slider.releasePointerCapture(pointerId);
      } catch {
        // 이미 해제된 합성 포인터는 무시한다.
      }
    }
    activePointer = null;
  }
  slider.addEventListener("pointerup", endFocusDrag);
  slider.addEventListener("pointercancel", endFocusDrag);
  slider.addEventListener("pointerleave", (event) => {
    if (!dragging) return;
    let captured = false;
    try {
      captured = slider.hasPointerCapture(event.pointerId);
    } catch {
      // 합성 포인터는 활성 포인터 목록에 없을 수 있다.
    }
    if (!captured) endFocusDrag(event);
  });
  slider.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    focus = clamp(focus + (event.key === "ArrowRight" ? 3 : -3), 0, 100);
    syncSlider();
    scheduleRedraw();
  });

  function compareInstruction(sharp: boolean): string {
    const state = currentState();
    if (!state.prepared) {
      return specimen === "cheek"
        ? "먼저 <b>메틸렌 블루</b>를 떨어뜨려 투명한 입안 상피세포의 <b>핵</b>을 드러내요."
        : "검정말 잎을 물 한 방울에 올려 표본을 준비해요. <b>엽록체는 염색하지 않아도 초록색</b>으로 보여요.";
    }

    if (!state.lowScanned) {
      if (objective !== 4) return "처음에는 <b>대물 4배 저배율</b>로 넓은 시야에서 세포를 찾아야 해요.";
      if (!sharp) return "저배율 시야예요. <b>초점 손잡이</b>를 움직여 세포의 경계를 먼저 선명하게 맞춰요.";
      state.lowScanned = true;
      if (specimen === "cheek") markGoal("low", "넓은 시야 확인");
      return specimen === "cheek"
        ? "저배율로 세포를 찾았어요. 이제 <b>대물 40배</b>로 바꾸고 핵에 다시 초점을 맞춰요."
        : "검정말 세포를 저배율로 찾았어요. 이제 <b>대물 40배</b>로 바꾸고 세포벽과 엽록체를 자세히 봐요.";
    }

    if (objective !== 40) {
      return specimen === "cheek"
        ? "세포를 찾았으니 <b>대물 40배</b>로 바꿔 염색된 핵을 자세히 관찰해요."
        : "세포를 찾았으니 <b>대물 40배</b>로 바꿔 세포벽과 엽록체를 자세히 관찰해요.";
    }
    if (!sharp) return "고배율로 바꾸며 초점이 어긋났어요. <b>초점 손잡이</b>로 다시 또렷하게 맞춰요.";

    if (specimen === "cheek" && !goals.has("animal")) {
      markGoal("animal", "불규칙한 세포·핵");
      unlockPlantSpecimen();
      return "입안 상피세포 관찰 성공! <b>불규칙하고 납작한 세포</b> 안에 푸르게 염색된 <b>핵</b>이 보여요. 이제 검정말 잎세포로 바꿔요.";
    }
    if (specimen === "elodea" && !goals.has("plant")) {
      markGoal("plant", "세포벽·엽록체");
      finishCompare();
      return helper.innerHTML;
    }
    return specimen === "cheek"
      ? "푸르게 염색된 <b>핵</b>과 불규칙한 세포 경계를 관찰했어요."
      : "네모난 <b>세포벽</b> 안쪽에 초록색 <b>엽록체</b>가 모여 있어요. 엽록체는 염색해서 생긴 색이 아니에요.";
  }

  function redraw(): void {
    if (disposed) return;
    const total = 10 * objective;
    magValue.nodeValue = String(total);
    const state = currentState();
    const sharp = Math.abs(focus - SHARP_FOCUS) <= SHARP_RANGE;
    fieldCacheKey = drawField(canvas, fieldCache, fieldCacheKey, currentPreset(), total, focus, state.prepared);

    if (compareMode) {
      const instruction = compareInstruction(sharp);
      if (!completed) helper.innerHTML = instruction;
      return;
    }

    const ready = state.prepared && objective === 40 && sharp;
    helper.innerHTML = !state.prepared
      ? "먼저 <b>염색액</b>으로 세포를 물들여요. 그래야 핵이 잘 보여요."
      : objective !== 40
        ? "관찰은 <b>저배율에서 고배율로</b>. 대물렌즈를 <b>40배</b>까지 올려 보세요."
        : !sharp
          ? "<b>초점 손잡이</b>를 움직여 상이 또렷해지는 지점을 찾아요."
          : s.explainGood ?? "상이 또렷해요! 총배율은 <b>접안렌즈 10배 × 대물렌즈 배율</b>이에요.";
    if (ready && !completed) {
      completed = true;
      api.enableCTA(s.cta ?? "관찰 성공! 다음");
    }
  }

  function scheduleRedraw(): void {
    if (disposed || drawRaf) return;
    drawRaf = window.requestAnimationFrame(() => {
      drawRaf = 0;
      redraw();
    });
  }

  api.setCTA(compareMode ? "두 표본을 모두 관찰하세요" : "현미경을 조작해 관찰하세요", { enabled: false });
  syncPrepButton();
  syncObjectiveButtons();
  syncSlider();
  scheduleRedraw();

  const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleRedraw);
  resizeObserver?.observe(stage);

  return () => {
    disposed = true;
    window.cancelAnimationFrame(drawRaf);
    resizeObserver?.disconnect();
    endFocusDrag();
    // 즉시 backing store를 줄여 레슨 왕복 때 큰 비트맵이 GC까지 남지 않게 한다.
    fieldCache.width = 1;
    fieldCache.height = 1;
    canvas.width = 1;
    canvas.height = 1;
  };
};

function drawField(
  canvas: HTMLCanvasElement,
  cache: HTMLCanvasElement,
  previousCacheKey: string,
  preset: Preset,
  total: number,
  focus: number,
  prepared: boolean,
): string {
  const { ctx, w, h, dpr } = fitStableCanvas(canvas, 250, 1.5);
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) / 2 - 10;

  const cacheKey = [preset.shape, total, prepared ? 1 : 0, canvas.width, canvas.height, dpr].join(":");
  if (cacheKey !== previousCacheKey) {
    cache.width = canvas.width;
    cache.height = canvas.height;
    const cacheCtx = cache.getContext("2d")!;
    cacheCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cacheCtx.clearRect(0, 0, w, h);
    cacheCtx.save();
    cacheCtx.beginPath();
    cacheCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    cacheCtx.clip();
    cacheCtx.fillStyle = preset.shape === "elodea" ? "#EAF7EE" : preset.shape === "cheek" ? "#F5F4F8" : "#F7F0F4";
    cacheCtx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    if (preset.shape === "cheek") drawCheekCells(cacheCtx, cx, cy, radius, total, prepared, preset.stainColor);
    else if (preset.shape === "elodea") drawElodeaCells(cacheCtx, cx, cy, radius, total, prepared);
    else drawOnionCells(cacheCtx, cx, cy, radius, total, prepared, preset.stainColor);
    cacheCtx.restore();
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  const blur = (Math.abs(focus - SHARP_FOCUS) / SHARP_FOCUS) * 11;
  ctx.filter = blur > 0.35 ? `blur(${blur.toFixed(1)}px)` : "none";
  ctx.drawImage(cache, 0, 0, cache.width, cache.height, 0, 0, w, h);
  ctx.filter = "none";
  ctx.restore();

  const vignette = ctx.createRadialGradient(cx, cy, radius * 0.58, cx, cy, radius);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(10,16,26,.42)");
  ctx.fillStyle = vignette;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.2)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  return cacheKey;
}

function fitStableCanvas(
  canvas: HTMLCanvasElement,
  cssHeight: number,
  maxDpr: number,
): { ctx: CanvasRenderingContext2D; w: number; h: number; dpr: number } {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || canvas.clientWidth || 320;
  const h = cssHeight;
  const pixelWidth = Math.max(1, Math.round(w * dpr));
  const pixelHeight = Math.max(1, Math.round(h * dpr));
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h, dpr };
}

function cellScale(total: number): number {
  return Math.min(155, 28 * (total / 40));
}

function drawCheekCells(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  total: number,
  stained: boolean,
  stainColor: string,
): void {
  const size = cellScale(total);
  const dx = size * 0.8;
  const dy = size * 0.62;
  const cols = Math.ceil((radius * 2) / dx) + 3;
  const rows = Math.ceil((radius * 2) / dy) + 3;

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const seed = row * 31 + col * 17;
      const x = cx - radius - dx + col * dx + (row % 2 ? dx * 0.36 : 0) + Math.sin(seed) * size * 0.07;
      const y = cy - radius - dy + row * dy + Math.cos(seed * 1.7) * size * 0.06;
      const rx = size * (0.46 + 0.04 * Math.sin(seed * 0.9));
      const ry = size * (0.32 + 0.04 * Math.cos(seed * 1.3));
      irregularCell(ctx, x, y, rx, ry, seed);
      ctx.fillStyle = stained ? tint(stainColor, 0.12) : "rgba(225,221,231,.34)";
      ctx.strokeStyle = stained ? tint(stainColor, 0.48) : "rgba(143,148,163,.38)";
      ctx.lineWidth = Math.max(1, size * 0.014);
      ctx.fill();
      ctx.stroke();

      if (stained) {
        ctx.fillStyle = tint(stainColor, 0.82);
        ctx.beginPath();
        ctx.ellipse(
          x + Math.sin(seed * 2.1) * rx * 0.2,
          y + Math.cos(seed * 1.4) * ry * 0.16,
          Math.max(2.2, size * 0.07),
          Math.max(1.8, size * 0.052),
          seed * 0.12,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }
}

function irregularCell(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
): void {
  const points = 11;
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wobble = 1 + Math.sin(seed * 1.7 + i * 2.3) * 0.09 + Math.cos(seed * 0.7 + i * 1.4) * 0.04;
    const x = cx + Math.cos(angle) * rx * wobble;
    const y = cy + Math.sin(angle) * ry * wobble;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawElodeaCells(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  total: number,
  prepared: boolean,
): void {
  if (!prepared) {
    drawUnpreparedField(ctx, cx, cy, radius, "rgba(102,174,120,.12)");
    return;
  }
  const cellW = cellScale(total) * 0.88;
  const cellH = cellW * 0.56;
  const cols = Math.ceil((radius * 2) / cellW) + 3;
  const rows = Math.ceil((radius * 2) / cellH) + 3;
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const x = cx - radius - cellW + col * cellW;
      const y = cy - radius - cellH + row * cellH;
      ctx.fillStyle = "rgba(211,240,210,.54)";
      ctx.strokeStyle = "#65A96F";
      ctx.lineWidth = Math.max(1.2, cellW * 0.022);
      ctx.fillRect(x, y, cellW, cellH);
      ctx.strokeRect(x, y, cellW, cellH);

      const dotR = Math.max(1.4, cellW * 0.025);
      const count = 10;
      for (let i = 0; i < count; i++) {
        const side = i % 4;
        const along = ((i * 37) % 83) / 100;
        const gx = side < 2 ? x + cellW * (0.12 + along * 0.76) : x + cellW * (side === 2 ? 0.12 : 0.88);
        const gy = side >= 2 ? y + cellH * (0.14 + along * 0.72) : y + cellH * (side === 0 ? 0.16 : 0.84);
        ctx.fillStyle = i % 3 === 0 ? "#2C8C48" : "#45A85D";
        ctx.beginPath();
        ctx.ellipse(gx, gy, dotR * 1.35, dotR, (i % 5) * 0.34, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawOnionCells(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  total: number,
  stained: boolean,
  stainColor: string,
): void {
  const cellW = cellScale(total) * 0.92;
  const cellH = cellW * 0.58;
  const cols = Math.ceil((radius * 2) / cellW) + 3;
  const rows = Math.ceil((radius * 2) / cellH) + 3;
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const x = cx - radius - cellW + col * cellW + (row % 2 ? cellW * 0.5 : 0);
      const y = cy - radius - cellH + row * cellH;
      ctx.fillStyle = stained ? tint(stainColor, 0.12) : "rgba(225,221,231,.28)";
      ctx.strokeStyle = stained ? tint(stainColor, 0.45) : "#C7CDD4";
      ctx.lineWidth = Math.max(1, cellW * 0.02);
      ctx.fillRect(x, y, cellW, cellH);
      ctx.strokeRect(x, y, cellW, cellH);
      if (stained) {
        ctx.fillStyle = tint(stainColor, 0.78);
        ctx.beginPath();
        ctx.ellipse(x + cellW * 0.52, y + cellH * 0.5, Math.max(2, cellW * 0.06), Math.max(2, cellW * 0.05), 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawUnpreparedField(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(105,135,116,.22)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * (0.18 + i * 0.11), 0, Math.PI * 2);
    ctx.stroke();
  }
}

function tint(hex: string, alpha: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
}
