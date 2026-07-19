// westWindLab — 서안 해양성 기후 인과 랩(사회 Ⅲ L3). Ⅱ 계절풍 랩(monsoonLab)과 대구를 이루는
// 이 단원의 유일한 시스템성 소재: 북대서양 난류(따뜻한 바닷물) + 편서풍(일 년 내내 서→동)이
// 바다의 온기를 유럽에 실어 나른다 → 같은 위도 대륙 동안·우리나라보다 온화한 겨울.
//   · 세로 캔버스(createLoop+fitCanvas, monsoonLab 규격). 대륙은 WORLD_LAND_PATH Path2D 크롭
//     (실데이터 지도 원칙). 크롭은 북대서양~서유럽(난류가 "먼바다에서 흘러오는" 감각).
//   · 난류 = 채널 곡선을 따라 흐르는 주황 입자 띠. 편서풍 = 서→동 입자(난류 위를 지나며
//     온기를 머금어 따뜻한 색으로 물들고, 육지에 온기를 부린다).
//   · 핵심 조작 = "난류가 없다면?" 가상 실험 토글: 난류가 멈추면 바람이 온기를 못 싣고
//     런던 온도계(1월)가 뚝 떨어진다(같은 위도 대륙 동안 수준의 모형값 — '모형' 명시).
//   · 판정: 관찰·실험 후 "북쪽인데 왜 따뜻한가" 2지선다(훅의 위도 오개념 회수).
// 목표: ① 편서풍 관찰 ② 난류 실험 ③ 따뜻함의 까닭 판정.
import { el, clamp } from "../../core/dom";
import { createLoop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import { WORLD_LAND_PATH } from "../../ui/worldMap.generated";
import type { StepRenderer } from "../types";

interface WestWindStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const CVH = 412;
// 지도 크롭(equirect 1000×500) — 북대서양(뉴펀들랜드 앞바다)~서유럽.
const CX0 = 347; // lon -55.1°
const CY0 = 67; // lat 65.9°
const CW = 208; // → lon 19.8°
const CH = 89; // → lat 33.9°
// 북대서양 난류 채널(멕시코만류의 연장) — 남서 먼바다에서 영국·노르웨이 앞바다로. 교육 모형 경로.
const CURRENT: [number, number][] = [
  [-58, 35], [-46, 41], [-34, 46.5], [-22, 50.5], [-11, 54.5], [-1, 58.5], [7, 62],
];
// 1월 평균 기온 모형값 — 서울(북위 37.5°) 약 -2℃ · 런던(북위 51.5°) 약 5℃.
// "난류가 없다면"의 런던은 같은 위도 대륙 동안 수준으로 떨어지는 모형값(-12℃, '모형' 라벨 명시).
const SEOUL_T = -2;
const LONDON_ON = 5;
const LONDON_OFF = -12;

const sx = (lon: number): number => ((lon + 180) / 360) * 1000;
const sy = (lat: number): number => ((90 - lat) / 180) * 500;

interface WindP {
  x: number;
  y: number;
  warm: number; // 0(차가움)~1(온기 만땅)
  life: number;
  max: number;
}
interface CurP {
  t: number; // 채널 곡선 파라미터 0~1
  off: number; // 채널 수직 오프셋(도)
  spd: number;
}

/** 채널 폴리라인 위 파라미터 t(0~1) 위치·방향. */
function curveAt(t: number): { x: number; y: number; dx: number; dy: number } {
  const segs = CURRENT.length - 1;
  const ft = clamp(t, 0, 0.9999) * segs;
  const i = Math.floor(ft);
  const u = ft - i;
  const [lo1, la1] = CURRENT[i];
  const [lo2, la2] = CURRENT[i + 1];
  const x1 = sx(lo1);
  const y1 = sy(la1);
  const x2 = sx(lo2);
  const y2 = sy(la2);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.hypot(dx, dy) || 1;
  return { x: x1 + dx * u, y: y1 + dy * u, dx: dx / d, dy: dy / d };
}

export const westWindLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as WestWindStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "wind" } }, el("b", { text: "편서풍" }), el("span", { text: "관찰" })),
    el("div", { class: "pn-badge world", dataset: { g: "exp" } }, el("b", { text: "난류 실험" }), el("span", { text: "꺼 보기" })),
    el("div", { class: "pn-badge world", dataset: { g: "why" } }, el("b", { text: "따뜻함의 비밀" }), el("span", { text: "판정" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "1월의 북대서양이에요. 바람이 <b>어느 쪽으로</b> 부는지 지켜본 뒤, 아래에서 <b>난류가 없다면?</b>을 눌러 런던의 온도계를 관찰해 보세요.",
  });
  host.append(goalChips, helper);

  const canvas = el("canvas", { class: "spring-canvas", style: `height:${CVH}px` });
  const pdot = el("span", { class: "pdot", style: "background:#FF9A5E" });
  const pillTxt = el("span", { text: "난류 흐르는 중 — 바람이 온기를 실어요" });
  const monthRead = el("div", { class: "tempread" }, el("span", { text: "1월" }));
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, el("div", { class: "pill" }, pdot, pillTxt), monthRead));
  const capEl = el("div", { class: "stage-cap", text: "주황 띠 = 따뜻한 바닷물(난류) · 흰 줄 = 편서풍 · 아래 = 1월 온도계" });
  stage.appendChild(capEl);

  const seg = el("div", { class: "seg", style: "margin-top:12px" });
  const btnOn = el("button", { text: "난류 흐름", attrs: { type: "button", "aria-pressed": "true" } });
  const btnOff = el("button", { text: "난류가 없다면?", attrs: { type: "button", "aria-pressed": "false" } });
  btnOn.classList.add("on");
  seg.append(btnOn, btnOff);

  // 판정 카드(관찰+실험 후 등장) — monsoonLab의 msn- 카드 문법 재사용
  const quizQ = el("div", { class: "msn-q", html: "런던은 서울보다 <b>훨씬 북쪽</b>인데 겨울이 더 따뜻해요. 까닭이 뭘까요?" });
  const optA = el("button", { class: "msn-opt", attrs: { type: "button" }, html: "<b>난류와 편서풍</b>이 바다의 온기를 유럽까지 실어 와서" });
  const optB = el("button", { class: "msn-opt", attrs: { type: "button" }, html: "런던이 사실은 서울보다 <b>적도에 가까워서</b>" });
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
        "<b>서안 해양성 기후</b> — 북대서양 난류와 일 년 내내 부는 편서풍 덕분에, 서부 유럽은 비슷한 위도의 대륙 동안보다 <b>겨울이 따뜻하고 강수량이 연중 골라요</b>.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
    if (goals.has("wind") && goals.has("exp") && !quizCard.classList.contains("show")) {
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
    quizQ.innerHTML = "정답! 방금 실험 그대로예요 — <b>난류를 끄자 런던이 꽁꽁</b> 얼었죠. 바다와 바람이 유럽의 겨울 난방을 맡고 있답니다.";
    collect("why", "정답!");
  });
  optB.addEventListener("click", () => {
    if (quizDone) return;
    haptic(HAPTIC.wrong);
    optB.classList.add("no");
    quizQ.innerHTML = "훅의 위치 지도를 떠올려요 — 런던은 분명 서울보다 <b>북쪽</b>이었어요. 위도가 아니라 방금 끈 <b>그것</b>이 범인이에요. 다시!";
    later(() => optB.classList.remove("no"), 700);
  });

  // ---- 난류 토글 ----
  let currentOn = true;
  let offMs = 0;
  function setCurrent(on: boolean): void {
    if (currentOn === on) return;
    currentOn = on;
    offMs = 0;
    btnOn.classList.toggle("on", on);
    btnOff.classList.toggle("on", !on);
    btnOn.setAttribute("aria-pressed", String(on));
    btnOff.setAttribute("aria-pressed", String(!on));
    haptic(HAPTIC.select);
    if (on) {
      pdot.style.background = "#FF9A5E";
      pillTxt.textContent = "난류 흐르는 중 — 바람이 온기를 실어요";
    } else {
      pdot.style.background = "#8FB6D8";
      pillTxt.textContent = "난류 정지(모형) — 바람이 빈손이에요";
    }
  }
  btnOn.addEventListener("click", () => setCurrent(true));
  btnOff.addEventListener("click", () => setCurrent(false));

  // ---- 입자 ----
  const winds: WindP[] = [];
  const curs: CurP[] = [];
  const landPath = new Path2D(WORLD_LAND_PATH);
  function spawnWind(p: WindP, first = false): void {
    p.x = CX0 + (first ? Math.random() * CW : Math.random() * 14);
    p.y = CY0 + 8 + Math.random() * (CH - 20);
    p.warm = 0;
    p.life = 0;
    p.max = 24 + Math.random() * 6; // 감속된 바람이 지도를 다 건널 수 있는 수명(약 23초 횡단)
  }
  for (let i = 0; i < 64; i++) {
    const p: WindP = { x: 0, y: 0, warm: 0, life: 0, max: 1 };
    spawnWind(p, true);
    winds.push(p);
  }
  // 난류 입자 속도 — 바닷물은 바람보다 훨씬 느리다(사용자 피드백 캘리브레이션).
  // t=0→1이 채널 전체(경도 약 65°)라 0.011~0.017/s = 편도 60~90초, 화면 약 3~5px/s
  // (2026-07-19 "너무 빠르다" 재감속 — 검산은 svg가 아니라 화면 px/s 기준).
  for (let i = 0; i < 90; i++) {
    curs.push({ t: Math.random(), off: (Math.random() - 0.5) * 7, spd: 0.011 + Math.random() * 0.006 });
  }

  // ---- 렌더 ----
  let W = 340;
  let H = CVH;
  let phase = 0;
  let runMs = 0;
  let londonT = LONDON_ON;
  let coldF = 0; // 0(난류 세계)~1(난류 없는 세계) — 색·온도 보간
  const loop = createLoop((dt) => {
    const fc = fitCanvas(canvas, CVH);
    const ctx = fc.ctx;
    W = fc.w;
    H = fc.h;
    phase += dt;
    runMs += dt * 1000;
    if (!finished && runMs > 2600) collect("wind", "완료!");
    if (!currentOn && !goals.has("exp")) {
      offMs += dt * 1000;
      if (offMs > 2200) collect("exp", "확인!");
    }
    coldF = clamp(coldF + (currentOn ? -dt : dt) * 0.9, 0, 1);
    londonT += ((currentOn ? LONDON_ON : LONDON_OFF) - londonT) * Math.min(1, dt * 1.3); // 스르르 식는 온도계

    // 지도 배치(상단) + 온도계 패널(하단)
    const mapW = Math.min(W - 20, 336);
    const mapH = (mapW / CW) * CH;
    const mapX = (W - mapW) / 2;
    const mapY = 12;
    const toCX = (x: number): number => mapX + ((x - CX0) / CW) * mapW;
    const toCY = (y: number): number => mapY + ((y - CY0) / CH) * mapH;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(mapX, mapY, mapW, mapH, 14);
    ctx.clip();
    // 바다 — 난류 없는 세계는 살짝 얼어붙은 톤
    const seaG = ctx.createLinearGradient(0, mapY, 0, mapY + mapH);
    seaG.addColorStop(0, blend("#123A5E", "#1A2E44", coldF));
    seaG.addColorStop(1, blend("#0C2A46", "#101E32", coldF));
    ctx.fillStyle = seaG;
    ctx.fillRect(mapX, mapY, mapW, mapH);

    // 난류 띠(바닥 글로우) — ON일 때만
    if (coldF < 0.98) {
      ctx.save();
      ctx.globalAlpha = 0.16 * (1 - coldF);
      ctx.strokeStyle = "#FF8A4E";
      ctx.lineWidth = (7 / CW) * mapW * 0.16;
      ctx.lineCap = "round";
      ctx.beginPath();
      CURRENT.forEach(([lo, la], i) => {
        const px = toCX(sx(lo));
        const py = toCY(sy(la));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    }

    // 대륙
    ctx.save();
    ctx.translate(mapX, mapY);
    ctx.scale(mapW / CW, mapH / CH);
    ctx.translate(-CX0, -CY0);
    ctx.fillStyle = blend("#2E4A3E", "#48506A", coldF);
    ctx.fill(landPath, "evenodd");
    ctx.strokeStyle = "rgba(180,205,230,.35)";
    ctx.lineWidth = 0.7 / (mapW / CW);
    ctx.stroke(landPath);
    ctx.restore();

    // 난류 입자
    if (currentOn) {
      for (const c of curs) {
        c.t += c.spd * dt;
        if (c.t >= 1) {
          c.t = 0;
          c.off = (Math.random() - 0.5) * 7;
        }
        const cv = curveAt(c.t);
        const perpX = -cv.dy;
        const perpY = cv.dx;
        const px = toCX(cv.x + perpX * c.off * (1000 / 360) * 0.36);
        const py = toCY(cv.y + perpY * c.off * (500 / 180) * 0.36);
        if (px < mapX || px > mapX + mapW || py < mapY || py > mapY + mapH) continue;
        const fade = Math.min(1, c.t * 6, (1 - c.t) * 3);
        ctx.strokeStyle = `rgba(255,${150 - 40 * Math.abs(c.off) / 4},94,${(0.5 + 0.22 * Math.sin(phase * 1.1 + c.t * 14)) * fade})`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px - cv.dx * 4, py - cv.dy * 4);
        ctx.lineTo(px + cv.dx * 4, py + cv.dy * 4);
        ctx.stroke();
      }
    }

    // 편서풍 입자 — 서→동, 난류 위를 지나면 온기를 머금는다.
    // 속도는 난류보다 뚜렷이 빠르되 차분하게(svg 9px/s ≈ 화면 14.5px/s —
    // 2026-07-19 "너무 빠르다" 재감속, 난류 대비 약 1:3 위계 유지).
    const wspd = 9;
    for (const p of winds) {
      p.life += dt;
      if (p.life > p.max || p.x > CX0 + CW + 6) spawnWind(p);
      p.x += wspd * dt * (1 + 0.12 * Math.sin(phase * 1.1 + p.y));
      p.y += Math.sin(phase * 0.7 + p.x * 0.08) * 0.8 * dt - 0.4 * dt; // 살짝 북동진
      // 난류와의 거리 → 온기 흡수(ON일 때만)
      if (currentOn) {
        let dmin = Infinity;
        for (let i = 0; i < CURRENT.length - 1; i++) {
          const a = CURRENT[i];
          const b = CURRENT[i + 1];
          const ax = sx(a[0]);
          const ay = sy(a[1]);
          const bx = sx(b[0]);
          const by = sy(b[1]);
          const ddx = bx - ax;
          const ddy = by - ay;
          const len2 = ddx * ddx + ddy * ddy || 1;
          const u = clamp(((p.x - ax) * ddx + (p.y - ay) * ddy) / len2, 0, 1);
          dmin = Math.min(dmin, Math.hypot(p.x - (ax + ddx * u), p.y - (ay + ddy * u)));
        }
        if (dmin < 16) p.warm = clamp(p.warm + dt * 1.1, 0, 1);
      } else {
        p.warm = clamp(p.warm - dt * 1.6, 0, 1);
      }
      const px = toCX(p.x);
      const py = toCY(p.y);
      if (px < mapX + 2 || px > mapX + mapW - 2 || py < mapY + 2 || py > mapY + mapH - 2) continue;
      const fade = Math.min(1, p.life * 2, (p.max - p.life) * 1.4);
      const r = Math.round(158 + 97 * p.warm);
      const g = Math.round(200 - 30 * p.warm);
      const b2 = Math.round(232 - 118 * p.warm);
      ctx.strokeStyle = `rgba(${r},${g},${b2},${0.62 * fade})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(px - 5, py);
      ctx.lineTo(px + 3, py - 1.2);
      ctx.stroke();
    }

    // 요약 화살표(서→동) — 항상 표시(편서풍은 연중), 호흡도 차분하게
    const aOp = 0.5 + 0.16 * Math.sin(phase * 1.5);
    ctx.strokeStyle = `rgba(210,228,250,${aOp})`;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 3;
    const arrows: [number, number, number, number][] = [
      [sx(-48), sy(60.5), sx(-33), sy(61.8)],
      [sx(-44), sy(47), sx(-29), sy(48.5)],
      [sx(-40), sy(38.5), sx(-25), sy(39.8)],
    ];
    for (const [x1, y1, x2, y2] of arrows) drawArrow(ctx, toCX(x1), toCY(y1), toCX(x2), toCY(y2));

    // 도시 점(런던·서울 위도 안내는 온도계 패널이 담당) — 런던만 지도에
    const lx = toCX(sx(-0.13));
    const ly = toCY(sy(51.5));
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(lx, ly, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#E8590C";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.font = "800 11px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,244,230,.95)";
    ctx.fillText("런던", lx + 7, ly - 1);

    // 상태 라벨은 지도 좌하단(좌상단은 stage-hud pill이 덮는다 — 눈검수 실사고)
    ctx.font = "800 12px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(220,230,250,.85)";
    ctx.fillText(currentOn ? "편서풍: 서 → 동 (일 년 내내)" : "난류 정지 — 모형 실험", mapX + 10, mapY + mapH - 8);
    ctx.restore();

    // ---- 온도계 패널(하단 stage-cap 자리 34px 비움 — 겹침 실사고) ----
    const py0 = mapY + mapH + 10;
    const ph = H - py0 - 34;
    if (ph > 90) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(mapX, py0, mapW, ph, 14);
      ctx.fillStyle = "rgba(16,24,44,.86)";
      ctx.fill();
      ctx.font = "800 12px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#AAB8D8";
      ctx.fillText("1월 평균 기온 비교 (모형)", mapX + mapW / 2, py0 + 8);
      const tw = mapW / 2;
      drawThermo(ctx, mapX + tw * 0.5, py0 + 30, ph - 44, SEOUL_T, "서울", "북위 37.5°", false);
      drawThermo(ctx, mapX + tw * 1.5, py0 + 30, ph - 44, londonT, "런던", "북위 51.5° (더 북쪽!)", !currentOn);
      ctx.restore();
    }
  });

  loop.start();
  api.setCTA("바람 관찰 · 난류 실험 · 판정까지 마쳐요", { enabled: false });

  return () => {
    loop.stop();
    for (const t of timers) window.clearTimeout(t);
  };
};

/** 두 hex 색 보간. */
function blend(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (sa: number, sb: number): number => Math.round(sa + (sb - sa) * t);
  const r = ch((pa >> 16) & 255, (pb >> 16) & 255);
  const g = ch((pa >> 8) & 255, (pb >> 8) & 255);
  const bl = ch(pa & 255, pb & 255);
  return `rgb(${r},${g},${bl})`;
}

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

/** 세로 온도계 — 눈금 -20~20℃, value 위치에 수은 기둥 + 값 라벨. */
function drawThermo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  top: number,
  h: number,
  value: number,
  name: string,
  latLabel: string,
  frozen: boolean,
): void {
  const tubeTop = top + 16;
  const tubeH = h - 46;
  const bulbY = tubeTop + tubeH + 6;
  const frac = clamp((value + 20) / 40, 0, 1);
  const mercTop = tubeTop + tubeH * (1 - frac);
  const warm = value > 0;
  // 눈금(0℃ 강조)
  ctx.strokeStyle = "rgba(140,160,200,.4)";
  ctx.lineWidth = 1;
  for (const tv of [-20, -10, 0, 10, 20]) {
    const ty = tubeTop + tubeH * (1 - (tv + 20) / 40);
    ctx.beginPath();
    ctx.moveTo(cx - 11, ty);
    ctx.lineTo(cx + 11, ty);
    if (tv === 0) {
      ctx.strokeStyle = "rgba(200,216,240,.8)";
      ctx.stroke();
      ctx.strokeStyle = "rgba(140,160,200,.4)";
      ctx.font = "700 9px Pretendard, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(170,186,216,.85)";
      ctx.fillText("0℃", cx + 14, ty);
    } else {
      ctx.stroke();
    }
  }
  // 관 + 수은
  ctx.fillStyle = "rgba(220,232,248,.16)";
  ctx.beginPath();
  ctx.roundRect(cx - 4, tubeTop, 8, tubeH, 4);
  ctx.fill();
  ctx.fillStyle = warm ? "#FF8A5E" : "#7EB2E8";
  ctx.beginPath();
  ctx.roundRect(cx - 2.6, mercTop, 5.2, tubeTop + tubeH - mercTop + 4, 2.6);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, bulbY, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(240,246,255,.35)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(cx - 4, tubeTop, 8, tubeH, 4);
  ctx.stroke();
  if (frozen) {
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#BFD8F8";
    ctx.fillText("꽁꽁!", cx + 24, mercTop + 4);
  }
  // 값 + 라벨
  ctx.font = "900 14px Pretendard, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = warm ? "#FFB88A" : "#9EC8F2";
  ctx.fillText(`${Math.round(value)}℃`, cx, tubeTop - 2);
  ctx.font = "800 12px Pretendard, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#E8EEF8";
  ctx.fillText(name, cx, bulbY + 11);
  ctx.font = "700 9.5px Pretendard, sans-serif";
  ctx.fillStyle = "#8FA2C8";
  ctx.fillText(latLabel, cx, bulbY + 26);
}
