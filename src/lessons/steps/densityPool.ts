// densityPool — 밀도 기둥 랩(중2 I 물질의 특성). 교과서 해보기의 조작판 + 확장.
//   · 유리컵 속 액체 3층: 에탄올 0.79(위) / 식용유 0.91(중간) / 물 1.00(아래)
//   · 물체를 탭하면 컵 위에서 퐁당 — 중력+감쇠 부력으로 자기 자리에 정착(살짝 바운스 + 출렁)
//   · 물체는 "자기보다 밀도가 큰 첫 액체의 표면"에 뜬다. 전부보다 크면 바닥.
//   · 얼음(0.92)은 식용유(0.91) 아래·물(1.00) 위 — 이 미세 차이가 포인트.
//   · 미스터리 큐브: 밀도 슬라이더(0.5~10.0)를 정해 드롭 — 어느 층에 설지 예측하고 확인.
// 목표: ① 동전(8.9)은 바닥 ② 얼음이 식용유·물 사이 ③ 큐브를 에탄올·식용유 사이(0.79~0.91)에.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { contactShadow, glassVessel, liquidFill } from "../../ui/labProps";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface DensityPoolStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type ObjKey = "coin" | "ice" | "wood" | "grape" | "cube";

interface ObjDef {
  key: ObjKey;
  name: string;
  rho: number; // g/mL (cube는 드롭 시점 슬라이더 값)
  lane: number; // 컵 안 가로 자리(-1..1)
  w: number;
  h: number;
  dot: string; // HUD pill 점 색
}

interface Inst extends ObjDef {
  x: number;
  y: number;
  vy: number;
  prevY: number;
  calm: number;
  settled: boolean;
}

const PALETTE: ObjDef[] = [
  { key: "coin", name: "동전", rho: 8.9, lane: -0.78, w: 22, h: 22, dot: "#E8C06A" },
  { key: "ice", name: "얼음", rho: 0.92, lane: -0.28, w: 22, h: 22, dot: "#BFE3F7" },
  { key: "wood", name: "나무 조각", rho: 0.45, lane: 0.28, w: 27, h: 17, dot: "#C89858" },
  { key: "grape", name: "포도알", rho: 1.05, lane: 0.78, w: 20, h: 20, dot: "#9A6FC8" },
];
const CUBE_DEF: ObjDef = { key: "cube", name: "미스터리 큐브", rho: 2, lane: 0, w: 20, h: 20, dot: "#8B7BE8" };

const CVH = 400;
const RHO_ETH = 0.79;
const RHO_OIL = 0.91;
const RHO_WAT = 1.0;
// 층 경계(y px) — 위에서부터 공기 | 에탄올 | 식용유 | 물
const ETH_TOP = 84;
const ETH_OIL = 168;
const OIL_WAT = 246;
const V_TOP = 42;
const V_BOT = 330;
const BOT = 327; // 안쪽 바닥
const B = 7; // 경계 스무딩 반폭(px)
const G = 0.34; // 중력(px/frame²)
const SURFS = [ETH_TOP, ETH_OIL, OIL_WAT];

const ZONE_LABEL: Record<string, string> = {
  bottom: "바닥",
  oilwat: "식용유·물 사이",
  ethoil: "에탄올·식용유 사이",
  top: "맨 위(에탄올 위)",
  ethmid: "에탄올 속",
  oilmid: "식용유 속",
  watmid: "물 속",
};

export const densityPool: StepRenderer = (host, step, api) => {
  const s = step as unknown as DensityPoolStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "mstage-cvblock",
    style: `height:${CVH}px;touch-action:manipulation`,
    attrs: {
      tabindex: "0",
      role: "button",
      "aria-label": "액체 3층 컵. 아래 팔레트에서 물체를 고르면 떨어져요. 무대를 탭하면 마지막 물체를 다시 떨어뜨려요.",
    },
  });
  const selPill = el("span", { text: "물체를 골라 떨어뜨려요" });
  const selDot = el("span", { class: "pdot", style: "background:#fff" });
  const resPill = el("span", { text: "어디에 멈출까요?" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "아래에서 물체를 고르면 컵 위에서 퐁당" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, selDot, selPill),
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#FFC24D" }), resPill),
    ),
    toastEl,
    capEl,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge chem", dataset: { g: "coin" } }, el("b", { text: "동전은 바닥" }), el("span", { text: "8.9라면?" })),
    el("div", { class: "pn-badge chem", dataset: { g: "ice" } }, el("b", { text: "얼음의 자리" }), el("span", { text: "어디 사이?" })),
    el("div", { class: "pn-badge chem", dataset: { g: "cube" } }, el("b", { text: "내 마음대로 층" }), el("span", { text: "0.79~0.91" })),
  );

  // ---- 물체 팔레트 ----
  const seg = el("div", { class: "seg" });
  const palBtns = new Map<ObjKey, HTMLButtonElement>();
  for (const d of PALETTE) {
    const b = el("button", { attrs: { type: "button", "aria-label": `${d.name} 밀도 ${d.rho} — 떨어뜨리기` } });
    b.innerHTML = `${d.name.replace(" 조각", "")}<span style="margin-left:4px;font-size:12px;font-weight:800;opacity:.62">${d.rho.toFixed(d.key === "coin" ? 1 : 2)}</span>`;
    seg.appendChild(b);
    palBtns.set(d.key, b);
  }

  // ---- 미스터리 큐브 카드(슬라이더 + 드롭) ----
  let rhoSel = 2.0;
  const swatch = el("span", {
    style: "width:14px;height:14px;border-radius:4px;display:inline-block;flex:none;border:1px solid rgba(25,31,40,.16)",
  });
  const valB = el("b", {
    style: "font-size:13px;font-weight:800;color:var(--blue);font-variant-numeric:tabular-nums",
    text: "2.00 g/mL",
  });
  const fill = el("i", { class: "sl-fill" });
  const thumb = el("b", { class: "sl-thumb" }, el("i"));
  const track = el("div", { class: "sl-track plain" }, fill, thumb);
  const slWrap = el(
    "div",
    {
      class: "hp-slider",
      style: "flex:1;margin-top:0;padding:12px 0",
      attrs: {
        role: "slider",
        tabindex: "0",
        "aria-label": "미스터리 큐브 밀도",
        "aria-valuemin": "0.5",
        "aria-valuemax": "10",
        "aria-valuenow": "2",
        "aria-valuetext": "2.00 그램 퍼 밀리리터",
      },
    },
    track,
  );
  const dropBtn = el(
    "button",
    { class: "swapbtn", style: "margin-top:0;width:auto;height:42px;padding:0 16px;font-size:14px", attrs: { type: "button" } },
    el("span", { text: "떨어뜨리기" }),
  );
  const cubeCard = el(
    "div",
    { style: "margin-top:12px;background:var(--n0);border:1px solid var(--n200);border-radius:var(--r-lg);box-shadow:var(--sh-card);padding:12px 14px 10px" },
    el(
      "div",
      { style: "display:flex;align-items:center;justify-content:space-between;gap:8px" },
      el("span", { style: "font-size:12.5px;font-weight:800;color:var(--ink)", text: "미스터리 큐브 — 밀도를 정해서" }),
      el("span", { style: "display:inline-flex;align-items:center;gap:6px" }, swatch, valB),
    ),
    el("div", { style: "display:flex;align-items:center;gap:12px" }, slWrap, dropBtn),
  );

  const helper = el("div", {
    class: "helper",
    html: "아래로 갈수록 밀도가 큰 액체예요 — <b>에탄올 0.79 → 식용유 0.91 → 물 1.00</b>. 물체는 <b>자기보다 밀도가 큰 첫 액체의 표면</b>에 떠요.",
  });
  host.append(goalChips, helper, stage, seg, cubeCard); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  const objs = new Map<ObjKey, Inst>();
  const waves = [0, 0, 0];
  let W = 340;
  let lastKey: ObjKey | null = null;
  const announcedInfo = new Set<ObjKey>(); // 나무·포도알 정보 토스트 1회
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let capHidden = false;

  const cx = (): number => W * 0.5;
  const vesselW = (): number => Math.min(W * 0.64, 252);
  const laneX = (lane: number): number => cx() + lane * (vesselW() / 2 - 26);

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2000);
  }

  function hideCap(): void {
    if (capHidden) return;
    capHidden = true;
    capEl.style.transition = "opacity .4s";
    capEl.style.opacity = "0";
  }

  function collect(id: string, subText: string, msg: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    toast(msg);
    if (!finished) {
      const hints: Record<string, string> = {
        coin: "모든 액체보다 밀도가 크면 <b>바닥까지</b> 가라앉아요. 이번엔 <b>얼음</b> — 식용유(0.91)와 물(1.00) 사이 어디쯤일까요?",
        ice: "얼음(0.92)은 식용유보다 <b>아주 조금</b> 크고 물보다는 작아요 — 그래서 둘 사이에 떠요. 이제 <b>미스터리 큐브</b>를 0.79~0.91로 맞춰 봐요!",
        cube: "밀도를 내 손으로 정해 <b>원하는 층</b>에 세웠어요!",
      };
      helper.innerHTML = hints[id] ?? "";
    }
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML = "밀도가 작으면 위로, 크면 아래로 — <b>뜨고 가라앉기만 봐도 밀도를 비교</b>할 수 있어요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 밀도 프로필 · 평형 위치 ----
  function rhoAt(y: number): number {
    const seg2 = (a: number, b: number, yb: number): number => a + (b - a) * clamp((y - (yb - B)) / (2 * B), 0, 1);
    if (y < ETH_TOP - B) return 0;
    if (y < ETH_TOP + B) return seg2(0, RHO_ETH, ETH_TOP);
    if (y < ETH_OIL - B) return RHO_ETH;
    if (y < ETH_OIL + B) return seg2(RHO_ETH, RHO_OIL, ETH_OIL);
    if (y < OIL_WAT - B) return RHO_OIL;
    if (y < OIL_WAT + B) return seg2(RHO_OIL, RHO_WAT, OIL_WAT);
    return RHO_WAT;
  }
  // 물체가 멈추는 높이: 자기보다 밀도 큰 첫 액체의 표면(경계 밴드 안 보간). 전부보다 크면 null(바닥).
  function yEqOf(rho: number): number | null {
    if (rho > RHO_WAT) return null;
    if (rho > RHO_OIL) return OIL_WAT - B + (((rho - RHO_OIL) / (RHO_WAT - RHO_OIL)) * 2 * B);
    if (rho > RHO_ETH) return ETH_OIL - B + (((rho - RHO_ETH) / (RHO_OIL - RHO_ETH)) * 2 * B);
    return ETH_TOP - B + ((rho / RHO_ETH) * 2 * B);
  }

  function zoneAtY(o: Inst): string {
    const fy = BOT - o.h / 2 - 1;
    if (o.y >= fy - 3) return "bottom";
    if (Math.abs(o.y - OIL_WAT) <= B + 5) return "oilwat";
    if (Math.abs(o.y - ETH_OIL) <= B + 5) return "ethoil";
    if (o.y <= ETH_TOP + B + 6) return "top";
    if (o.y < ETH_OIL) return "ethmid";
    if (o.y < OIL_WAT) return "oilmid";
    return "watmid";
  }

  function announce(o: Inst): void {
    const zone = zoneAtY(o);
    resPill.textContent = `${o.name.replace(" 조각", "")} → ${ZONE_LABEL[zone]}`;
    if (o.key === "coin") {
      collect("coin", "셋보다 커요!", "동전 8.9 — 어떤 액체보다 커서 바닥까지!");
    } else if (o.key === "ice") {
      collect("ice", "기름·물 사이!", "얼음 0.92 — 식용유(0.91)보다 크고 물(1.00)보다 작아요!");
    } else if (o.key === "cube") {
      if (zone === "ethoil") {
        collect("cube", "내가 만든 층!", `큐브 ${o.rho.toFixed(2)} — 에탄올과 식용유 사이에 딱!`);
      } else {
        toast(`큐브 ${o.rho.toFixed(2)} → ${ZONE_LABEL[zone]}`);
        if (!goals.has("cube") && !finished)
          helper.innerHTML = "큐브를 <b>에탄올(0.79)보다 크고 식용유(0.91)보다 작게</b> 맞추면 그 사이에 설 수 있어요.";
      }
    } else if (!announcedInfo.has(o.key)) {
      announcedInfo.add(o.key);
      if (o.key === "wood") toast("나무 0.45 — 가장 가벼워서 맨 위에 둥실");
      else toast("포도알 1.05 — 물(1.00)보다 커서 바닥까지");
    }
  }

  // ---- 드롭 ----
  function drop(key: ObjKey): void {
    const def = key === "cube" ? { ...CUBE_DEF, rho: Math.round(rhoSel * 100) / 100 } : PALETTE.find((d) => d.key === key)!;
    objs.set(key, { ...def, x: laneX(def.lane), y: 16, vy: 0, prevY: 16, calm: 0, settled: false });
    lastKey = key;
    selDot.style.background = key === "cube" ? cubeColor(def.rho, 0.5) : def.dot;
    selPill.textContent = `${def.name} ${def.rho.toFixed(key === "coin" ? 1 : 2)} g/mL`;
    resPill.textContent = "어디에 멈출까요?";
    palBtns.forEach((b, k) => b.classList.toggle("on", k === key));
    haptic(HAPTIC.tap);
    hideCap();
  }
  palBtns.forEach((b, k) => b.addEventListener("click", () => drop(k)));
  dropBtn.addEventListener("click", () => drop("cube"));

  const onCanvasDown = (): void => {
    if (lastKey) drop(lastKey);
    else toast("아래 팔레트에서 물체를 골라 보세요");
  };
  const onCanvasKey = (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      onCanvasDown();
      e.preventDefault();
    }
  };
  canvas.addEventListener("pointerdown", onCanvasDown);
  canvas.addEventListener("keydown", onCanvasKey);

  // ---- 슬라이더 ----
  // 0..0.7 구간 = 0.5~1.2(미세 조절), 0.7..1 = 1.2~10 — 목표 구간(0.79~0.91)이 손끝에 잡히게
  const tOf = (rho: number): number => (rho <= 1.2 ? rho - 0.5 : 0.7 + ((rho - 1.2) * 0.3) / 8.8);
  const rhoOf = (t: number): number => (t <= 0.7 ? 0.5 + t : 1.2 + ((t - 0.7) / 0.3) * 8.8);
  function cubeColor(rho: number, dl = 0): string {
    const t = clamp((rho - 0.5) / 2.5, 0, 1);
    const l = 74 - t * 34 + dl * 10;
    return `hsl(258 62% ${l.toFixed(0)}%)`;
  }
  function syncSlider(): void {
    rhoSel = clamp(Math.round(rhoSel * 100) / 100, 0.5, 10);
    const t = clamp(tOf(rhoSel), 0, 1);
    fill.style.width = `${t * 100}%`;
    thumb.style.left = `${t * 100}%`;
    valB.textContent = `${rhoSel.toFixed(2)} g/mL`;
    swatch.style.background = cubeColor(rhoSel);
    slWrap.setAttribute("aria-valuenow", rhoSel.toFixed(2));
    slWrap.setAttribute("aria-valuetext", `${rhoSel.toFixed(2)} 그램 퍼 밀리리터`);
  }
  let dragSl = false;
  const setFromX = (clientX: number): void => {
    const r = track.getBoundingClientRect();
    rhoSel = rhoOf(clamp((clientX - r.left) / r.width, 0, 1));
    syncSlider();
  };
  const onSlDown = (e: PointerEvent): void => {
    dragSl = true;
    setFromX(e.clientX);
    try {
      slWrap.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트 */
    }
    haptic(HAPTIC.tap);
  };
  const onSlMove = (e: PointerEvent): void => {
    if (dragSl) setFromX(e.clientX);
  };
  const onSlUp = (): void => {
    dragSl = false;
  };
  const onSlKey = (e: KeyboardEvent): void => {
    const step2 =
      e.key === "ArrowRight" || e.key === "ArrowUp" ? 0.01
      : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -0.01
      : e.key === "PageUp" ? 0.5
      : e.key === "PageDown" ? -0.5
      : null;
    if (step2 === null) {
      if (e.key === "Home") rhoSel = 0.5;
      else if (e.key === "End") rhoSel = 10;
      else return;
    } else rhoSel += step2;
    syncSlider();
    e.preventDefault();
  };
  slWrap.addEventListener("pointerdown", onSlDown);
  slWrap.addEventListener("pointermove", onSlMove);
  slWrap.addEventListener("pointerup", onSlUp);
  slWrap.addEventListener("pointercancel", onSlUp);
  slWrap.addEventListener("keydown", onSlKey);
  syncSlider();

  // ---- 그리기 ----
  function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawObj(ctx: CanvasRenderingContext2D, o: Inst): void {
    const x = o.x;
    const y = o.y;
    if (o.key === "coin") {
      const g = ctx.createLinearGradient(x - 11, y - 11, x + 11, y + 11);
      g.addColorStop(0, "#8C6B2E");
      g.addColorStop(0.3, "#E8C06A");
      g.addColorStop(0.6, "#C89A44");
      g.addColorStop(1, "#7E5E26");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(64,46,12,.78)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,244,200,.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, 6.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.5)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y, 8.6, Math.PI * 1.05, Math.PI * 1.5);
      ctx.stroke();
    } else if (o.key === "ice") {
      const g = ctx.createLinearGradient(x - 11, y - 11, x + 11, y + 11);
      g.addColorStop(0, "rgba(228,246,255,.66)");
      g.addColorStop(0.55, "rgba(190,224,248,.44)");
      g.addColorStop(1, "rgba(160,202,236,.34)");
      ctx.fillStyle = g;
      rr(ctx, x - 11, y - 11, 22, 22, 5);
      ctx.fill();
      ctx.strokeStyle = "rgba(150,190,224,.9)";
      ctx.lineWidth = 1.4;
      rr(ctx, x - 11, y - 11, 22, 22, 5);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.6)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x - 7, y - 7.5);
      ctx.lineTo(x + 1, y - 7.5);
      ctx.moveTo(x - 7.5, y - 6);
      ctx.lineTo(x - 7.5, y + 1);
      ctx.stroke();
    } else if (o.key === "wood") {
      const g = ctx.createLinearGradient(x - 13, y - 8, x + 13, y + 8);
      g.addColorStop(0, "#D8A868");
      g.addColorStop(0.55, "#B07C42");
      g.addColorStop(1, "#8C5E2E");
      ctx.fillStyle = g;
      rr(ctx, x - 13.5, y - 8.5, 27, 17, 4);
      ctx.fill();
      ctx.strokeStyle = "#5E3E1C";
      ctx.lineWidth = 1.4;
      rr(ctx, x - 13.5, y - 8.5, 27, 17, 4);
      ctx.stroke();
      ctx.strokeStyle = "rgba(90,58,26,.42)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 2);
      ctx.quadraticCurveTo(x, y - 4, x + 9, y - 2);
      ctx.moveTo(x - 9, y + 3.5);
      ctx.quadraticCurveTo(x + 1, y + 1.5, x + 9, y + 3.5);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,236,200,.5)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 6.2);
      ctx.lineTo(x + 4, y - 6.2);
      ctx.stroke();
    } else if (o.key === "grape") {
      const g = ctx.createRadialGradient(x - 3.5, y - 3.5, 1.5, x, y, 11);
      g.addColorStop(0, "#B08BD8");
      g.addColorStop(0.55, "#7A4FA0");
      g.addColorStop(1, "#4E2E6E");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3A2154";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.beginPath();
      ctx.arc(x - 3.5, y - 3.5, 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 미스터리 큐브 — 밀도에 따라 색이 무거워진다
      const g = ctx.createLinearGradient(x - 10, y - 10, x + 10, y + 10);
      g.addColorStop(0, cubeColor(o.rho, 0.9));
      g.addColorStop(1, cubeColor(o.rho, -0.7));
      ctx.fillStyle = g;
      rr(ctx, x - 10, y - 10, 20, 20, 5);
      ctx.fill();
      ctx.strokeStyle = "hsl(258 45% 26%)";
      ctx.lineWidth = 1.4;
      rr(ctx, x - 10, y - 10, 20, 20, 5);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.55)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 7.2);
      ctx.lineTo(x + 3, y - 7.2);
      ctx.stroke();
      ctx.font = "800 11px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = o.rho > 1.6 ? "#fff" : "#4A3767";
      ctx.fillText("?", x, y + 4);
    }
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    const cxx = cx();
    const vw = vesselW();
    const x0 = cxx - vw / 2;
    const x1 = cxx + vw / 2;

    // --- 물리 ---
    for (const o of objs.values()) {
      o.x += (laneX(o.lane) - o.x) * Math.min(1, 0.2 * dt);
      const yE = yEqOf(o.rho);
      if (yE !== null && o.y > yE - 26) {
        // 평형 근처: 감쇠 스프링 → 살짝 바운스하며 정착
        o.vy += (yE - o.y) * 0.03 * dt;
        o.vy *= Math.pow(0.9, dt);
      } else {
        const rhoHere = rhoAt(o.y);
        if (rhoHere > 0.05) {
          // 액체 속 하강 — 밀도 차가 작아도 눈에 보이는 속도로(얼음이 식용유를 천천히 통과)
          const rel = Math.max(1 - rhoHere / o.rho, 0.12);
          o.vy += G * rel * dt;
          o.vy *= Math.pow(0.93, dt);
        } else {
          o.vy += G * dt; // 공기 중 자유 낙하
        }
      }
      o.vy = clamp(o.vy, -6, 6);
      o.prevY = o.y;
      o.y += o.vy * dt;
      const fy = BOT - o.h / 2 - 1;
      if (o.y > fy) {
        o.y = fy;
        if (Math.abs(o.vy) > 0.5) o.vy = -o.vy * 0.3;
        else o.vy = 0;
      }
      // 표면 통과 → 그 층이 출렁
      SURFS.forEach((sy, i) => {
        if ((o.prevY - sy) * (o.y - sy) < 0) {
          waves[i] = 1;
          if (i === 0 && o.vy > 0) haptic(HAPTIC.tap);
        }
      });
      // 정착 판정(0.45초 잔잔)
      if (!o.settled) {
        if (Math.abs(o.vy) < 0.06 && o.y > ETH_TOP - 26) o.calm += dt * 16.7;
        else o.calm = 0;
        if (o.calm > 450) {
          o.settled = true;
          announce(o);
        }
      }
    }
    for (let i = 0; i < 3; i++) waves[i] *= Math.pow(0.962, dt);

    // --- 그리기 ---
    contactShadow(ctx, cxx, V_BOT + 7, vw * 0.55, 0.28);
    glassVessel(ctx, { x0, y0: V_TOP, x1, y1: V_BOT });
    // 물체(액체 틴트가 위에 덮여 잠긴 느낌)
    for (const o of objs.values()) drawObj(ctx, o);
    // 3층 액체
    liquidFill(ctx, x0 + 3, ETH_TOP, x1 - 3, ETH_OIL, "232,224,190", 0.1);
    liquidFill(ctx, x0 + 3, ETH_OIL, x1 - 3, OIL_WAT, "242,186,70", 0.16);
    liquidFill(ctx, x0 + 3, OIL_WAT, x1 - 3, BOT + 1, "92,152,235", 0.17);
    // 출렁이는 표면(통과 직후)
    const waveCol = ["rgba(240,236,214,.55)", "rgba(255,214,120,.5)", "rgba(160,200,250,.55)"];
    SURFS.forEach((sy, i) => {
      if (waves[i] < 0.04) return;
      ctx.strokeStyle = waveCol[i];
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      for (let px = x0 + 4; px <= x1 - 4; px += 6) {
        const yy = sy + Math.sin(px / 11 + tMs / 135) * waves[i] * 2.8;
        if (px === x0 + 4) ctx.moveTo(px, yy);
        else ctx.lineTo(px, yy);
      }
      ctx.stroke();
    });
    // 층 라벨(밀도 값 포함)
    ctx.font = "700 10.5px Pretendard, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(235,228,200,.72)";
    ctx.fillText("에탄올 0.79", x1 - 9, (ETH_TOP + ETH_OIL) / 2 + 3);
    ctx.fillStyle = "rgba(255,206,110,.78)";
    ctx.fillText("식용유 0.91", x1 - 9, (ETH_OIL + OIL_WAT) / 2 + 3);
    ctx.fillStyle = "rgba(150,196,255,.78)";
    ctx.fillText("물 1.00", x1 - 9, (OIL_WAT + BOT) / 2 + 3);
  });

  const onResize = (): void => {
    fitCanvas(canvas, CVH);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("동전 → 얼음 → 미스터리 큐브!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onCanvasDown);
    canvas.removeEventListener("keydown", onCanvasKey);
    slWrap.removeEventListener("pointerdown", onSlDown);
    slWrap.removeEventListener("pointermove", onSlMove);
    slWrap.removeEventListener("pointerup", onSlUp);
    slWrap.removeEventListener("pointercancel", onSlUp);
    slWrap.removeEventListener("keydown", onSlKey);
  };
};
