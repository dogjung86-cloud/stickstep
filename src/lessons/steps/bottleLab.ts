// bottleLab, 물병 그래프(교과서 112쪽 역량 활동 "물병의 모양과 그래프").
// 병 3종을 차례로: ① 그래프 모양 예측(3택) → ② 물 붓기(시간당 일정량) → ③ 실시간 그래프로 확인.
// 물리: 수면 상승 속도 ∝ 1/단면적, dh = k/r(h)² (r은 높이별 반지름 프로필) — 수치 적분을
// 미리 돌려 곡선을 확정한 뒤 setTimeout 체인으로 재생한다(rAF 금지, 타이머는 Set으로 해제).
// 예측은 채점에 넣지 않는다(발견 랩) — 오답이어도 병 관찰을 마치면 목표 달성.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface BottleStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type ShapeId = "line" | "fast" | "slow";

interface Bottle {
  id: string;
  name: string;
  shape: ShapeId; // 옳은 그래프 모양
  r: (u: number) => number; // u=h/H(0..1) → 반지름(단위)
  why: string;
}

const BOTTLES: Bottle[] = [
  {
    id: "b1",
    name: "폭이 일정한 병",
    shape: "line",
    r: () => 1,
    why: "폭이 일정하니 수면이 <b>일정한 빠르기</b>로 올라와요, 그래서 곧은 직선!",
  },
  {
    id: "b2",
    name: "위로 좁아지는 병",
    shape: "fast",
    r: (u) => 1.3 - 0.62 * u,
    why: "위로 갈수록 좁아져 같은 물에도 수면이 <b>점점 빠르게</b> 올라와요, 위로 휘는 곡선!",
  },
  {
    id: "b3",
    name: "위로 넓어지는 병",
    shape: "slow",
    r: (u) => 0.72 + 0.62 * u,
    why: "위로 갈수록 넓어져 수면이 <b>점점 느리게</b> 올라와요, 눕는 곡선!",
  },
];

const SHAPE_LABEL: Record<ShapeId, string> = { line: "일정하게", fast: "점점 빠르게", slow: "점점 느리게" };

/** 예측 카드용 미니 그래프(56×40). */
function shapeIcon(id: ShapeId): string {
  const d = id === "line" ? "M8 34 L48 8" : id === "fast" ? "M8 34 Q34 30 48 8" : "M8 34 Q14 10 48 8";
  return `<svg viewBox="0 0 56 40" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M8 36 H50 M8 36 V4" stroke="#AEBBC8" stroke-width="1.6" stroke-linecap="round"/><path d="${d}" stroke="#0DA5C6" stroke-width="2.6" stroke-linecap="round"/></svg>`;
}

/* 무대 기하(viewBox 360×232): 왼쪽 병, 오른쪽 그래프 */
const BX = 84; // 병 중심
const B_BOT = 206;
const B_TOP = 38;
const R_SCALE = 42; // r=1 → 42px 반폭
const GX0 = 178;
const GX1 = 336;
const GY0 = 206; // 그래프 바닥
const GY1 = 38; // 그래프 천장(높이 최대)

export const bottleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BottleStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips(BOTTLES.map((b) => ({ id: b.id, label: b.name, sub: "예측 대기" })));

  const board = mboard(440);
  const svgWrap = el("div", { class: "bt-stage" });
  // 질문 바 — 예측 질문은 카드(선택지)보다 위, 보드 안에 보여야 한다(질문이 helper에만 있던 실사용 피드백).
  const qbar = el("div", {
    style: "padding:2px 16px 0; font-size:14px; font-weight:700; color:#2A3040; text-align:center; line-height:1.5;",
  });
  const controls = el("div", { class: "bt-cards" });
  board.append(svgWrap, qbar, controls);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let idx = 0;
  let picked: ShapeId | null = null;
  let pouring = false;

  /** 병 옆모습 폴리곤 점(프로필 샘플, 아래→위 왼쪽, 위→아래 오른쪽). */
  function bottlePoints(b: Bottle, upto = 1): { L: [number, number][]; R: [number, number][] } {
    const L: [number, number][] = [];
    const R: [number, number][] = [];
    const N = 14;
    for (let i = 0; i <= N; i++) {
      const u = (i / N) * upto;
      const y = B_BOT - u * (B_BOT - B_TOP);
      const r = b.r(u) * R_SCALE;
      L.push([BX - r, y]);
      R.push([BX + r, y]);
    }
    return { L, R };
  }

  function bottleOutline(b: Bottle): string {
    const { L, R } = bottlePoints(b);
    const left = L.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const right = R.slice()
      .reverse()
      .map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(" ");
    return `${left} ${right} Z`;
  }

  function waterPolygon(b: Bottle, u: number): string {
    if (u <= 0.001) return "";
    const { L, R } = bottlePoints(b, u);
    const pts = [...L, ...R.reverse()].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    return pts;
  }

  /** 수치 적분: 일정한 물 유입으로 시간→수위(0..1) 곡선을 미리 계산. */
  function fillCurve(b: Bottle): { t: number; h: number }[] {
    const pts: { t: number; h: number }[] = [{ t: 0, h: 0 }];
    let h = 0;
    let t = 0;
    const dt = 0.002;
    let guard = 0;
    // k는 "r=1 병이 t=1에 가득"이 되도록 1로 두고, 전체 시간을 뒤에서 정규화한다.
    while (h < 1 && guard < 60000) {
      const r = b.r(Math.min(h, 1));
      h += dt / (r * r);
      t += dt;
      guard += 1;
      pts.push({ t, h: Math.min(h, 1) });
    }
    const T = pts[pts.length - 1].t;
    return pts.map((p) => ({ t: p.t / T, h: p.h }));
  }

  function drawStage(b: Bottle): void {
    svgWrap.innerHTML =
      `<svg viewBox="0 0 360 232" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<ellipse cx="${BX}" cy="${B_BOT + 8}" rx="58" ry="6" fill="#2A3A5E" opacity=".08"/>` +
      // 물(병 뒤 레이어)
      `<polygon class="bt-water" points="" fill="url(#bt-wt)" opacity=".92"/>` +
      // 병 유리(반투명) + 하이라이트
      `<path d="${bottleOutline(b)}" fill="url(#bt-gl)" fill-opacity=".35" stroke="#5E86A4" stroke-width="2"/>` +
      `<line x1="${BX - b.r(0.15) * R_SCALE + 9}" y1="${B_BOT - 24}" x2="${BX - b.r(0.85) * R_SCALE + 9}" y2="${B_TOP + 28}" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity=".5"/>` +
      // 주둥이 물줄기(붓는 동안만)
      `<g class="bt-pour" style="opacity:0; transition: opacity .3s ease">` +
      `<path d="M${BX} ${B_TOP - 18} q6 -8 16 -9" stroke="#8FCDEA" stroke-width="5" stroke-linecap="round" opacity=".9"/>` +
      `<line x1="${BX}" y1="${B_TOP - 16}" x2="${BX}" y2="${B_TOP + 8}" stroke="#8FCDEA" stroke-width="5" stroke-linecap="round" opacity=".9"/>` +
      `</g>` +
      // 그래프 축
      `<path d="M${GX0} ${GY0} H${GX1 + 6} M${GX0} ${GY0} V${GY1 - 6}" stroke="#8CA0B3" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M${GX1 + 6} ${GY0} l-7 -4 v8 z" fill="#8CA0B3"/>` +
      `<path d="M${GX0} ${GY1 - 6} l-4 7 h8 z" fill="#8CA0B3"/>` +
      `<text x="${GX1}" y="${GY0 + 17}" text-anchor="end" font-size="11" font-weight="800" fill="#64748B">시간</text>` +
      `<text x="${GX0 - 4}" y="${GY1 - 12}" font-size="11" font-weight="800" fill="#64748B">물의 높이</text>` +
      // 실시간 곡선 + 현재점
      `<path class="bt-curve" d="" stroke="url(#bt-ln)" stroke-width="3" stroke-linecap="round" fill="none"/>` +
      `<circle class="bt-tip" cx="${GX0}" cy="${GY0}" r="5" fill="#0DA5C6" stroke="#077E9C" stroke-width="1.5" opacity="0"/>` +
      `<defs>` +
      `<linearGradient id="bt-wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD4EC"/><stop offset="1" stop-color="#2FA8C4"/></linearGradient>` +
      `<linearGradient id="bt-gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2FAFF"/><stop offset=".5" stop-color="#D8ECF8"/><stop offset="1" stop-color="#B8D8EC"/></linearGradient>` +
      `<linearGradient id="bt-ln" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2FA8C4"/><stop offset="1" stop-color="#0A87A3"/></linearGradient>` +
      `</defs>` +
      `</svg>`;
  }

  function drawCards(): void {
    clear(controls);
    for (const id of ["line", "fast", "slow"] as ShapeId[]) {
      const c = el(
        "button",
        { class: "bt-card", attrs: { type: "button", "aria-label": `${SHAPE_LABEL[id]} 예측` }, dataset: { shape: id } },
        el("span", { class: "bt-ic", html: shapeIcon(id) }),
        el("span", { class: "bt-lb", text: SHAPE_LABEL[id] }),
      ) as HTMLButtonElement;
      c.addEventListener("click", () => {
        if (pouring || picked) return;
        picked = id;
        haptic(HAPTIC.select);
        c.classList.add("picked");
        controls.querySelectorAll("button").forEach((b) => ((b as HTMLButtonElement).disabled = true));
        const chip = chips.el.querySelector(`[data-g="${BOTTLES[idx].id}"] span`) as HTMLElement;
        chip.textContent = "붓는 중";
        toast("예측 완료! 물을 부어 볼게요");
        later(pour, 500);
      });
      controls.appendChild(c);
    }
  }

  function pour(): void {
    pouring = true;
    const b = BOTTLES[idx];
    const curve = fillCurve(b);
    const svg = svgWrap.querySelector("svg") as SVGSVGElement;
    const water = svg.querySelector(".bt-water") as SVGPolygonElement;
    const path = svg.querySelector(".bt-curve") as SVGPathElement;
    const tip = svg.querySelector(".bt-tip") as SVGCircleElement;
    (svg.querySelector(".bt-pour") as SVGGElement).style.opacity = "1";
    tip.style.opacity = "1";
    const STEPS = 64;
    const MS = 46;
    let d = "";
    for (let i = 0; i <= STEPS; i++) {
      later(() => {
        const t = i / STEPS;
        // 미리 계산한 곡선에서 t 근방 수위를 찾는다
        const k = Math.min(curve.length - 1, Math.round(t * (curve.length - 1)));
        const h = curve[k].h;
        water.setAttribute("points", waterPolygon(b, h));
        const gx = GX0 + t * (GX1 - GX0 - 8);
        const gy = GY0 - h * (GY0 - GY1);
        d += `${d ? "L" : "M"}${gx.toFixed(1)} ${gy.toFixed(1)} `;
        path.setAttribute("d", d);
        tip.setAttribute("cx", gx.toFixed(1));
        tip.setAttribute("cy", gy.toFixed(1));
        if (i === STEPS) verdict();
      }, i * MS);
    }
  }

  function verdict(): void {
    const b = BOTTLES[idx];
    const svg = svgWrap.querySelector("svg") as SVGSVGElement;
    (svg.querySelector(".bt-pour") as SVGGElement).style.opacity = "0";
    const good = picked === b.shape;
    haptic(good ? HAPTIC.correct : HAPTIC.cross);
    controls.querySelectorAll("button").forEach((btn) => {
      const bt = btn as HTMLButtonElement;
      if (bt.dataset.shape === b.shape) bt.classList.add("truth");
      else if (bt.classList.contains("picked")) bt.classList.add("wrong");
    });
    chips.on(b.id, good ? "예측 적중!" : "관찰 완료");
    helper.innerHTML = (good ? "<b>예측 적중!</b> " : `그래프는 <b>${SHAPE_LABEL[b.shape]}</b>였어요. `) + b.why;
    later(() => {
      idx += 1;
      pouring = false;
      picked = null;
      if (idx < BOTTLES.length) {
        round();
      } else {
        helper.innerHTML =
          "병 셋, 그래프 셋! <b>병의 폭이 수면의 빠르기를, 빠르기가 그래프의 가파름을</b> 만들었어요. 상황을 읽으면 그래프가 그려져요.";
        haptic(HAPTIC.done);
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "다음");
      }
    }, 2400);
  }

  function round(): void {
    const b = BOTTLES[idx];
    drawStage(b);
    drawCards();
    qbar.innerHTML = `<b>${b.name}</b>에 1초에 같은 양씩 물을 부어요. 물의 <b>높이 그래프</b>는 어떤 모양일까요? 카드를 골라 예측!`;
    helper.innerHTML = "예측이 빗나가도 괜찮아요, 직접 부어 보며 확인할 거예요!";
  }

  round();
  api.setCTA("병 3개를 모두 관찰하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
