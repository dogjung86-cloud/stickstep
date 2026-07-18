// monsoonLab — 계절풍 랩(사회 Ⅱ L2). 이 단원의 유일한 시스템성 소재:
//   여름/겨울 토글 → 바람의 방향이 통째로 뒤집힌다(여름 바다→육지 습윤 · 겨울 육지→바다 건조).
//   그 인과가 벼농사(여름 비)와 겨울 건조를 가른다 — 미래엔 31쪽·비상 30쪽 공통 정의의 조작판.
//   · 세로 캔버스(createLoop+fitCanvas, latSunLab 규격). 대륙 실루엣은 WORLD_LAND_PATH를
//     Path2D로 크롭해 그린다(실데이터 지도 원칙 — 손으로 대륙을 그리지 않는다).
//   · 바람 = 파티클 흐름장: 여름은 대륙 안쪽 저기압점으로 수렴(바다 태생·파랑, 육지에 비),
//     겨울은 대륙 내륙 고기압점에서 발산(육지 태생·모래빛, 바다로 빠져나감).
//   · 판정: 두 계절을 각각 충분히 관찰하면 마지막에 "벼농사의 비" 2지선다 탭.
// 목표: ① 여름 바람 관찰 ② 겨울 바람 관찰 ③ 비의 정체 판정.
import { el, clamp } from "../../core/dom";
import { createLoop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import { WORLD_LAND_PATH, climateAt } from "../../ui/worldMap.generated";
import type { StepRenderer } from "../types";

interface MonsoonStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const CVH = 380;
// 지도 크롭(equirect 1000×500) — 계절풍 아시아(남부·동남·동아시아)와 인도양·태평양.
const CX0 = 660; // lon 57.6°
const CY0 = 96; // lat 55.4°
const CW = 262; // → lon 151.9°
const CH = 190; // → lat -13°
// 계절풍 중심(도) — 여름 저기압(대륙 안쪽)·겨울 고기압(시베리아 쪽). 교육 모형 값.
const SUMMER_LOW = { lon: 95, lat: 34 };
const WINTER_HIGH = { lon: 102, lat: 47 };
// 벼논 마커(여름 비의 수혜지) — 갠지스 하류·인도차이나·창장강 하류.
const PADDIES = [
  { lon: 87, lat: 24 },
  { lon: 102, lat: 15 },
  { lon: 117, lat: 30 },
];

const sx = (lon: number): number => ((lon + 180) / 360) * 1000;
const sy = (lat: number): number => ((90 - lat) / 180) * 500;

interface P {
  x: number; // svg 좌표(1000×500 공간)
  y: number;
  life: number;
  max: number;
  rain: number; // 육지 위 진행도(여름 비 연출)
}

export const monsoonLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as MonsoonStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "summer" } }, el("b", { text: "여름 바람" }), el("span", { text: "관찰" })),
    el("div", { class: "pn-badge world", dataset: { g: "winter" } }, el("b", { text: "겨울 바람" }), el("span", { text: "관찰" })),
    el("div", { class: "pn-badge world", dataset: { g: "rice" } }, el("b", { text: "비의 정체" }), el("span", { text: "판정" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "아래에서 <b>여름과 겨울을 번갈아 눌러</b> 보세요. 바람이 <b>어디서 어디로</b> 부는지, 비는 <b>어느 계절에</b> 내리는지가 관찰 포인트!",
  });
  host.append(goalChips, helper);

  const canvas = el("canvas", { class: "spring-canvas", style: `height:${CVH}px` });
  const pdot = el("span", { class: "pdot", style: "background:#5BB8E8" });
  const pillTxt = el("span", { text: "여름 — 바다에서 육지로, 습한 바람" });
  const seasonRead = el("div", { class: "tempread" }, el("span", { text: "여름" }));
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, el("div", { class: "pill" }, pdot, pillTxt), seasonRead));
  const capEl = el("div", { class: "stage-cap", text: "화살표 = 바람의 방향 · 파란 점 = 습한 공기" });
  stage.appendChild(capEl);

  const seg = el("div", { class: "seg", style: "margin-top:12px" });
  const btnSummer = el("button", { text: "여름", attrs: { type: "button", "aria-pressed": "true" } });
  const btnWinter = el("button", { text: "겨울", attrs: { type: "button", "aria-pressed": "false" } });
  btnSummer.classList.add("on");
  seg.append(btnSummer, btnWinter);

  // 판정 카드(두 계절 관찰 후 등장)
  const quizQ = el("div", { class: "msn-q", html: "동남·남부 아시아의 <b>벼농사에 필요한 비</b>를 몰고 오는 바람은 어느 쪽일까요?" });
  const optA = el("button", { class: "msn-opt", attrs: { type: "button" }, html: "<b>여름</b> — 바다에서 불어오는 습한 바람" });
  const optB = el("button", { class: "msn-opt", attrs: { type: "button" }, html: "<b>겨울</b> — 대륙에서 불어오는 건조한 바람" });
  const quizCard = el("div", { class: "msn-quiz" }, quizQ, optA, optB);

  host.append(stage, seg, quizCard);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 목표 ----
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
        "<b>계절풍</b> — 계절에 따라 방향이 바뀌는 바람이에요. 여름엔 바다의 습한 바람이 비를 몰고 와 <b>벼농사</b>를 키우고, 겨울엔 대륙의 건조한 바람이 불어요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
    if (goals.has("summer") && goals.has("winter") && !quizCard.classList.contains("show")) {
      quizCard.classList.add("show");
      later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    }
  }

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };

  // ---- 판정 카드 ----
  let quizDone = false;
  optA.addEventListener("click", () => {
    if (quizDone) return;
    quizDone = true;
    optA.classList.add("ok");
    optB.classList.add("dim");
    haptic(HAPTIC.correct);
    quizQ.innerHTML = "정답! 여름의 <b>바다→육지 습한 바람</b>이 큰비를 몰고 와요. 벼는 이 비를 먹고 자라죠.";
    collect("rice", "정답!");
  });
  optB.addEventListener("click", () => {
    if (quizDone) return;
    haptic(HAPTIC.wrong);
    optB.classList.add("no");
    quizQ.innerHTML = "겨울 바람은 <b>대륙에서 나온 건조한 바람</b>이라 비가 거의 없어요 — 방금 겨울 화면에서 비가 내렸나요? 다시 골라 봐요!";
    later(() => optB.classList.remove("no"), 700);
  });

  // ---- 계절 전환 ----
  let season: "summer" | "winter" = "summer";
  let observeMs = 0;
  function setSeason(next: "summer" | "winter"): void {
    if (season === next) return;
    season = next;
    observeMs = 0;
    btnSummer.classList.toggle("on", next === "summer");
    btnWinter.classList.toggle("on", next === "winter");
    btnSummer.setAttribute("aria-pressed", String(next === "summer"));
    btnWinter.setAttribute("aria-pressed", String(next === "winter"));
    haptic(HAPTIC.select);
    if (next === "summer") {
      pdot.style.background = "#5BB8E8";
      pillTxt.textContent = "여름 — 바다에서 육지로, 습한 바람";
      (seasonRead.firstChild as HTMLElement).textContent = "여름";
    } else {
      pdot.style.background = "#C8A26E";
      pillTxt.textContent = "겨울 — 대륙에서 바다로, 건조한 바람";
      (seasonRead.firstChild as HTMLElement).textContent = "겨울";
    }
    // 계절이 바뀌면 파티클을 새 흐름으로 자연 교체(수명 리셋)
    for (const p of parts) p.life = Math.min(p.life, 0.5 + Math.random() * 0.5);
  }
  btnSummer.addEventListener("click", () => setSeason("summer"));
  btnWinter.addEventListener("click", () => setSeason("winter"));

  // ---- 파티클 ----
  const parts: P[] = [];
  const landPath = new Path2D(WORLD_LAND_PATH);

  function lonLatAt(p: P): { lon: number; lat: number } {
    return { lon: (p.x / 1000) * 360 - 180, lat: 90 - (p.y / 500) * 180 };
  }
  function isLand(p: P): boolean {
    const { lon, lat } = lonLatAt(p);
    return climateAt(lon, lat) !== 0;
  }
  function spawn(p: P): void {
    p.life = 0;
    p.max = 2.6 + Math.random() * 2.2;
    p.rain = 0;
    for (let i = 0; i < 40; i++) {
      p.x = CX0 + Math.random() * CW;
      p.y = CY0 + Math.random() * CH;
      const land = isLand(p);
      if (season === "summer" ? !land : land) {
        if (season === "winter") {
          // 겨울 태생은 고기압 중심 근처 대륙에서
          const dx = p.x - sx(WINTER_HIGH.lon);
          const dy = p.y - sy(WINTER_HIGH.lat);
          if (dx * dx + dy * dy > 70 * 70) continue;
        }
        return;
      }
    }
  }
  for (let i = 0; i < 120; i++) {
    const p: P = { x: 0, y: 0, life: 0, max: 1, rain: 0 };
    spawn(p);
    p.life = Math.random() * p.max; // 첫 화면부터 흩어져 있게
    parts.push(p);
  }

  function flow(p: P): { vx: number; vy: number } {
    const c = season === "summer" ? SUMMER_LOW : WINTER_HIGH;
    const dx = sx(c.lon) - p.x;
    const dy = sy(c.lat) - p.y;
    const d = Math.hypot(dx, dy) || 1;
    const dir = season === "summer" ? 1 : -1;
    // 수렴/발산 + 지구 자전풍 느낌의 약한 소용돌이(시계 반대)
    const swirl = 0.32;
    return {
      vx: dir * (dx / d) - swirl * (dy / d),
      vy: dir * (dy / d) + swirl * (dx / d),
    };
  }

  // ---- 렌더 ----
  let W = 340;
  let H = CVH;
  let phase = 0;
  const loop = createLoop((dt) => {
    const fc = fitCanvas(canvas, CVH);
    const ctx = fc.ctx;
    W = fc.w;
    H = fc.h;
    phase += dt;
    if (!finished && !goals.has(season)) {
      observeMs += dt * 1000;
      if (observeMs > 2400) collect(season, "완료!");
    }

    // 지도 배치 — 크롭 비율 유지, 상단 여백 소폭
    const mapW = Math.min(W - 20, ((H - 26) / CH) * CW);
    const mapH = (mapW / CW) * CH;
    const mapX = (W - mapW) / 2;
    const mapY = 14;
    const toCX = (x: number): number => mapX + ((x - CX0) / CW) * mapW;
    const toCY = (y: number): number => mapY + ((y - CY0) / CH) * mapH;

    ctx.clearRect(0, 0, W, H);

    // 바다 판 + 대륙(Path2D 스케일 변환)
    ctx.save();
    ctx.beginPath();
    const rr = 14;
    ctx.roundRect(mapX, mapY, mapW, mapH, rr);
    ctx.clip();
    const seaG = ctx.createLinearGradient(0, mapY, 0, mapY + mapH);
    seaG.addColorStop(0, "#123A5E");
    seaG.addColorStop(1, "#0C2A46");
    ctx.fillStyle = seaG;
    ctx.fillRect(mapX, mapY, mapW, mapH);
    ctx.save();
    ctx.translate(mapX, mapY);
    ctx.scale(mapW / CW, mapH / CH);
    ctx.translate(-CX0, -CY0);
    ctx.fillStyle = season === "summer" ? "#2E4A3E" : "#4A4436";
    ctx.fill(landPath, "evenodd");
    ctx.strokeStyle = "rgba(180,205,230,.35)";
    ctx.lineWidth = 0.7 / (mapW / CW);
    ctx.stroke(landPath);
    ctx.restore();

    // 벼논 마커 — 여름에 쑥쑥, 겨울엔 마른 밑동
    for (const pd of PADDIES) {
      const px = toCX(sx(pd.lon));
      const py = toCY(sy(pd.lat));
      const grow = season === "summer" ? clamp(observeMs / 1800, 0, 1) : 0.25;
      drawRice(ctx, px, py, grow, season === "summer");
    }

    // 파티클
    const spd = 34; // svg px/s
    for (const p of parts) {
      p.life += dt;
      if (p.life > p.max) spawn(p);
      const v = flow(p);
      p.x += v.vx * spd * dt;
      p.y += v.vy * spd * dt;
      if (p.x < CX0 - 8 || p.x > CX0 + CW + 8 || p.y < CY0 - 8 || p.y > CY0 + CH + 8) {
        spawn(p);
        continue;
      }
      const land = isLand(p);
      if (season === "summer" && land) p.rain += dt;
      const fade = Math.min(1, p.life * 2, (p.max - p.life) * 1.6);
      const px = toCX(p.x);
      const py = toCY(p.y);
      if (season === "summer") {
        if (land && p.rain > 0.12) {
          // 육지 위 습한 공기 = 비 스트릭
          ctx.strokeStyle = `rgba(120,200,255,${0.75 * fade})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(px, py - 3);
          ctx.lineTo(px - 1.6, py + 3.4);
          ctx.stroke();
          if (p.rain > 1.5) spawn(p); // 비를 다 뿌리면 새 습기로
        } else {
          ctx.fillStyle = `rgba(110,190,240,${0.8 * fade})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.7, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = `rgba(216,182,130,${0.75 * fade})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 큰 안내 화살표(흐름의 요약) — 계절마다 3개, 살짝 숨쉬는 오파시티
    const aOp = 0.55 + 0.2 * Math.sin(phase * 2.4);
    ctx.strokeStyle = season === "summer" ? `rgba(140,210,255,${aOp})` : `rgba(226,196,148,${aOp})`;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 3;
    const arrows: [number, number, number, number][] =
      season === "summer"
        ? [
            [sx(70), sy(6), sx(80), sy(20)],
            [sx(104), sy(0), sx(101), sy(13)],
            [sx(132), sy(16), sx(121), sy(27)],
          ]
        : [
            [sx(97), sy(42), sx(85), sy(27)],
            [sx(107), sy(41), sx(113), sy(26)],
            [sx(118), sy(43), sx(131), sy(34)],
          ];
    for (const [x1, y1, x2, y2] of arrows) drawArrow(ctx, toCX(x1), toCY(y1), toCX(x2), toCY(y2));

    // 계절 라벨(지도 위 코너)
    ctx.font = "800 12px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(220,230,250,.85)";
    ctx.fillText(season === "summer" ? "바다 → 육지 (습함)" : "육지 → 바다 (건조)", mapX + 10, mapY + 8);
    ctx.restore();
  });

  // 첫 프레임을 위해 즉시 시작
  loop.start();
  api.setCTA("두 계절을 관찰하고 판정까지 마쳐요", { enabled: false });

  return () => {
    loop.stop();
    for (const t of timers) window.clearTimeout(t);
  };
};

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 8 * Math.cos(a - 0.42), y2 - 8 * Math.sin(a - 0.42));
  ctx.lineTo(x2 - 8 * Math.cos(a + 0.42), y2 - 8 * Math.sin(a + 0.42));
  ctx.closePath();
  ctx.fill();
}

/** 벼 포기 — grow 0(밑동)~1(이삭까지). wet이면 초록, 마르면 볏짚색. */
function drawRice(ctx: CanvasRenderingContext2D, x: number, y: number, grow: number, wet: boolean): void {
  const h = 6 + 12 * grow;
  ctx.strokeStyle = wet ? "#7ED18A" : "#B8A878";
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  for (const dx of [-3.4, 0, 3.4]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y);
    ctx.quadraticCurveTo(x + dx * 1.5, y - h * 0.6, x + dx * 2.1, y - h);
    ctx.stroke();
  }
  if (grow > 0.75 && wet) {
    ctx.fillStyle = "#E8D48A";
    for (const dx of [-7, 0, 7]) {
      ctx.beginPath();
      ctx.ellipse(x + dx, y - h - 1.5, 2.1, 3.1, dx * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // 물 찬 논(간단한 타원)
  ctx.fillStyle = wet ? "rgba(110,190,240,.30)" : "rgba(160,150,120,.25)";
  ctx.beginPath();
  ctx.ellipse(x, y + 2.5, 11, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
}
