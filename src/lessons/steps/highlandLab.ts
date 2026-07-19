// highlandLab — 저위도 고산 기후 랩(사회 Ⅴ L3). Ⅱ monsoonLab(계절)·Ⅲ westWindLab(난류)·
// Ⅳ rainBeltLab(비 띠) 계보의 이 단원 시스템성 소재: 같은 적도인데 "고도를 올리면 기온이
// 내려가는" 인과 — 그래서 적도의 안데스 산 위(키토 2,850m)가 연중 서늘하고 도시가 발달했다.
//   · 세로 캔버스(createLoop+fitCanvas). 오른쪽 인셋 = 남아메리카 실데이터 지도(WORLD_LAND_PATH
//     Path2D 크롭 + climateAt 1° 셀 오프스크린 베이크 — rainBeltLab 문법): 안데스를 따라
//     남북으로 길게 뻗는 고산 기후 띠(보라)가 교과서 지도(미래엔 95쪽) 그대로 나타난다.
//   · 본체 = 적도 부근 동서 단면(태평양—안데스—아마존 저지, 모형): 캔버스 세로 드래그로
//     등반 스틱맨의 고도를 조종한다. 고도 밴드(우림→온화 사면→고산 초원→황량→만년설)와
//     기온 리드아웃이 함께 변한다. 기온 모형 T = 26 − 0.45℃/100m × h — 2,850m에서 13.2℃
//     (훅의 "키토 13℃"와 정합, 실제 키토 연평균 13.5℃ 근사. '모형' 캡션 명시).
//   · 판정(msn 문법): "왜 저지대가 아니라 산 위에 도시를?" — 오답("태양과 가까워 따뜻")이
//     대표 오개념이라 교정 문구가 심장. 목표: ① 저지 관찰 ② 키토 높이 도달 ③ 판정.
// 연출 속도: 등반 이징 ≈ 최대 300px/s 수렴(입력 추종 — 유체 아님), 아지랑이·눈발은 20px/s 이하.
import { el, clamp } from "../../core/dom";
import { createLoop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import { WORLD_LAND_PATH, climateAt } from "../../ui/worldMap.generated";
import type { StepRenderer } from "../types";

interface HighlandStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const CVH = 396;
const H_MAX = 6400; // 단면 고도 상한(m) — 침보라소(6,268m)급 봉우리
const QUITO_H = 2850;
const tempOf = (h: number): number => 26 - (h / 100) * 0.45; // 모형 기온(℃)

// 남아메리카 인셋 크롭(equirect 1000×500) — lon -84~-33 · lat 13~-57.
const MX0 = (96 / 360) * 1000; // 266.7
const MY0 = (77 / 180) * 500; // 213.9
const MW = (51 / 360) * 1000; // 141.7
const MH = (70 / 180) * 500; // 194.4

export const highlandLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as HighlandStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "low" } }, el("b", { text: "저지 관찰" }), el("span", { text: "무더위" })),
    el("div", { class: "pn-badge world", dataset: { g: "quito" } }, el("b", { text: "키토 높이" }), el("span", { text: "2,850m" })),
    el("div", { class: "pn-badge world", dataset: { g: "why" } }, el("b", { text: "도시의 비밀" }), el("span", { text: "판정" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "적도 부근의 동서 단면이에요. 지금은 <b>아마존 저지(이키토스)</b> — 푹푹 찌네요. 화면을 <b>위로 끌어</b> 산을 올라 보세요. 목표는 <b>키토의 높이</b>!",
  });
  host.append(goalChips, helper);

  // 고도·기온 리드아웃은 pill 하나가 담당(tempread HUD는 우상단 인셋 지도와 겹쳐 제거 — 눈검수).
  const canvas = el("canvas", { class: "spring-canvas", style: `height:${CVH}px` });
  const pdot = el("span", { class: "pdot", style: "background:#9A8CD8" });
  const pillTxt = el("span", { text: "저지 100m — 26℃ 무더위" });
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, el("div", { class: "pill" }, pdot, pillTxt)));
  const capEl = el("div", { class: "stage-cap", text: "화면을 위아래로 끌면 고도가 변해요 · 기온은 모형 계산 (지도의 보라 띠 = 고산 기후)" });
  stage.appendChild(capEl);

  // 판정 카드 — monsoonLab msn- 문법 재사용
  const quizQ = el("div", { class: "msn-q", html: "같은 적도인데, 사람들은 왜 무더운 저지대가 아니라 <b>높은 산 위</b>에 도시를 지었을까요?" });
  const optA = el("button", { class: "msn-opt", attrs: { type: "button" }, html: "<b>저지대보다 서늘해서</b> 일 년 내내 지내기 좋아서" });
  const optB = el("button", { class: "msn-opt", attrs: { type: "button" }, html: "높은 곳은 태양과 가까워 <b>더 따뜻</b>해서" });
  const quizCard = el("div", { class: "msn-quiz" }, quizQ, optA, optB);

  host.append(stage, quizCard);
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
        "고도가 만든 기후! 위도가 같아도 <b>높이 올라가면 기온이 내려가요</b> — 그래서 적도의 안데스엔 <b>연중 서늘한 고산 기후</b>가 나타나고, 키토·보고타·라파스 같은 <b>고산 도시</b>가 일찍부터 발달했답니다.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
    if (goals.has("low") && goals.has("quito") && !quizCard.classList.contains("show")) {
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
    quizQ.innerHTML = "정답! 덥고 습한 저지대보다 <b>서늘한 산 위가 생활하기 좋아서</b> — 일찍부터 사람이 모여 고산 도시가 발달했어요.";
    collect("why", "정답!");
  });
  optB.addEventListener("click", () => {
    if (quizDone) return;
    haptic(HAPTIC.wrong);
    optB.classList.add("no");
    quizQ.innerHTML = "태양과 가까우면 따뜻할 것 같지만 <b>반대</b>예요 — 방금 올라오며 봤죠? 높이 올라갈수록 기온은 <b>내려가요</b>. 다시 골라 봐요!";
    later(() => optB.classList.remove("no"), 700);
  });

  // ---- 남미 인셋 베이크(1° 셀 = 3px) ----
  const COLS = 51;
  const ROWS = 70;
  const CELL = 3;
  const mapLayer = document.createElement("canvas");
  mapLayer.width = COLS * CELL;
  mapLayer.height = ROWS * CELL;
  {
    const b = mapLayer.getContext("2d")!;
    for (let r = 0; r < ROWS; r += 1) {
      const lat = 13 - (r + 0.5) * (70 / ROWS);
      for (let c = 0; c < COLS; c += 1) {
        const lon = -84 + (c + 0.5) * (51 / COLS);
        const code = climateAt(lon, lat);
        if (code === 0) continue;
        b.fillStyle =
          code === 6 ? "#9A8CD8" : code === 1 ? "#2E7E46" : code === 2 ? "#C8A45E" : code === 3 ? "#4E8E7E" : "#5E7290";
        b.fillRect(c * CELL, r * CELL, CELL, CELL);
      }
    }
  }
  const landPath = new Path2D(WORLD_LAND_PATH);

  // ---- 고도 상태(드래그 입력) ----
  let hCur = 100; // 현재 고도(m)
  let hTarget = 100;
  let quitoMs = 0;
  let snowToastAt = 0;
  let runMs = 0;
  let phase = 0;

  // 단면 세로 매핑 — 캔버스 y ↔ 고도(그리기와 입력이 같은 공식을 쓴다)
  const yTop = 44;
  const yBaseOf = (H: number): number => H - 78;
  const yOfAlt = (h: number, H: number): number => yBaseOf(H) - (h / H_MAX) * (yBaseOf(H) - yTop);
  const altOfY = (y: number, H: number): number => clamp(((yBaseOf(H) - y) / (yBaseOf(H) - yTop)) * H_MAX, 0, H_MAX);

  function onDown(e: PointerEvent): void {
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 포인터 안전(사고 7) */
    }
    moveTo(e);
    canvas.addEventListener("pointermove", moveTo);
  }
  function moveTo(e: PointerEvent): void {
    const r = canvas.getBoundingClientRect();
    if (r.height <= 0) return;
    const y = ((e.clientY - r.top) / r.height) * CVH;
    hTarget = altOfY(y, CVH);
    if (!goals.has("low")) collect("low", "확인!"); // 조작 시작 = 저지 관찰을 마친 것
  }
  function onUp(): void {
    canvas.removeEventListener("pointermove", moveTo);
  }
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // ---- 렌더 ----
  const loop = createLoop((dt) => {
    const fc = fitCanvas(canvas, CVH);
    const ctx = fc.ctx;
    const W = fc.w;
    const H = fc.h;
    phase += dt;
    runMs += dt * 1000;
    if (runMs > 2600) collect("low", "완료!");
    hCur += (hTarget - hCur) * Math.min(1, dt * 4);
    const T = tempOf(hCur);
    if (hCur > 2500 && hCur < 3300) {
      quitoMs += dt * 1000;
      if (quitoMs > 1100 && !goals.has("quito")) {
        collect("quito", "도착!");
        pillTxt.textContent = "키토의 높이! 2,850m — 13℃ 안팎";
        snowToastAt = runMs; // 전용 문구가 일반 리드아웃에 바로 덮이지 않게 3초 유지(눈검수)
      }
    } else if (!goals.has("quito")) quitoMs = 0;
    if (hCur > 4800 && runMs - snowToastAt > 6000) {
      snowToastAt = runMs;
      pillTxt.textContent = "만년설 구간 — 적도인데 눈이 쌓여요!";
    } else if (runMs - snowToastAt > 3000) {
      pillTxt.textContent = `${hCur < 600 ? "저지" : hCur < 2200 ? "온화한 사면" : hCur < 4000 ? "고산 도시의 높이" : hCur < 4800 ? "고산 초원" : "만년설"} ${(Math.round(hCur / 10) * 10).toLocaleString()}m — ${T.toFixed(0)}℃`;
    }

    const yb = yBaseOf(H);
    ctx.clearRect(0, 0, W, H);

    // 하늘(고도 따라 톤 변화 — 높을수록 짙푸른 하늘)
    const skyG = ctx.createLinearGradient(0, 0, 0, yb);
    const hf = clamp(hCur / H_MAX, 0, 1);
    skyG.addColorStop(0, `rgb(${Math.round(96 - 40 * hf)},${Math.round(150 - 60 * hf)},${Math.round(220 - 60 * hf)})`);
    skyG.addColorStop(1, "#BFDCEE");
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, W, H);

    // 태양(강한 적도의 해 — 좌상단)
    ctx.fillStyle = "#FFD24D";
    ctx.beginPath();
    ctx.arc(34, 30, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,210,77,.7)";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4 + phase * 0.2;
      ctx.beginPath();
      ctx.moveTo(34 + Math.cos(a) * 15, 30 + Math.sin(a) * 15);
      ctx.lineTo(34 + Math.cos(a) * 19, 30 + Math.sin(a) * 19);
      ctx.stroke();
    }

    // ── 단면(모형): 태평양(좌) — 안데스(중) — 아마존 저지(우) ──
    // 서쪽 사면은 직선 구간으로 그린다 — 등반 스틱맨·키토 마을이 같은 보간 공식(xOnSlope)으로
    // 사면 '위'에 정확히 앉기 위해서다(곡선 사면 + 선형 보간은 마을이 하늘에 뜨는 눈검수 실사고).
    const seaW = Math.max(26, W * 0.08);
    const peakX = W * 0.34;
    const lowX0 = W * 0.56;
    const SLOPE: [number, number][] = [
      [seaW, 0], [seaW + 6, 600], [peakX - 26, 4600], [peakX, 6200],
    ];
    const xOnSlope = (h: number): number => {
      const hh = clamp(h, 0, 6200);
      for (let i = 1; i < SLOPE.length; i += 1) {
        if (hh <= SLOPE[i][1]) {
          const [x0, h0] = SLOPE[i - 1];
          const [x1, h1] = SLOPE[i];
          return x0 + ((x1 - x0) * (hh - h0)) / (h1 - h0);
        }
      }
      return peakX;
    };
    const mtn = new Path2D();
    mtn.moveTo(seaW, yb);
    for (let i = 1; i < SLOPE.length; i += 1) mtn.lineTo(SLOPE[i][0], yOfAlt(SLOPE[i][1], H));
    mtn.lineTo(peakX + 20, yOfAlt(4400, H));
    mtn.quadraticCurveTo(W * 0.47, yOfAlt(1600, H), lowX0, yOfAlt(220, H));
    mtn.lineTo(W - 8, yOfAlt(140, H));
    mtn.lineTo(W - 8, yb);
    mtn.closePath();
    // 고도 밴드(수평 띠를 산 실루엣으로 클립 — 경관 모형)
    ctx.save();
    ctx.clip(mtn);
    const bands: [number, number, string][] = [
      [0, 1000, "#2E7E46"],
      [1000, 2200, "#5EA84E"],
      [2200, 3600, "#8FBF5A"],
      [3600, 4800, "#A8874E"],
      [4800, H_MAX, "#EAF2FA"],
    ];
    for (const [h0, h1, c] of bands) {
      const y1 = yOfAlt(h1, H);
      const y0 = yOfAlt(h0, H);
      ctx.fillStyle = c;
      ctx.fillRect(0, y1, W, y0 - y1 + 1);
    }
    // 눈발(만년설 구간 — 20px/s 이하로 잔잔히)
    ctx.fillStyle = "rgba(255,255,255,.8)";
    for (let i = 0; i < 10; i += 1) {
      const sx = peakX - 24 + ((i * 37) % 48);
      const sy = yOfAlt(6100, H) + (((phase * 14 + i * 23) % 60) as number);
      ctx.beginPath();
      ctx.arc(sx, sy, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = "#3E5E3A";
    ctx.lineWidth = 1.4;
    ctx.stroke(mtn);

    // 바다(좌) + 저지 아지랑이(우)
    ctx.fillStyle = "#3F7EB8";
    ctx.fillRect(0, yOfAlt(0, H) - 2, seaW, yb - yOfAlt(0, H) + 2);
    ctx.font = "700 8.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(30,60,100,.85)";
    ctx.fillText("태평양", seaW / 2, yb - 8);
    ctx.strokeStyle = "rgba(240,120,60,.5)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i += 1) {
      const ax = lowX0 + 18 + i * 22;
      const ay = yOfAlt(400, H) - ((phase * 12 + i * 8) % 16);
      ctx.beginPath();
      ctx.moveTo(ax, ay + 6);
      ctx.quadraticCurveTo(ax + 3, ay + 3, ax, ay);
      ctx.quadraticCurveTo(ax - 3, ay - 3, ax, ay - 6);
      ctx.stroke();
    }

    // 이키토스(저지 마을) + 키토(고산 도시) 마커
    const house = (hx: number, hy: number, c: string): void => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(hx - 5, hy);
      ctx.lineTo(hx, hy - 5);
      ctx.lineTo(hx + 5, hy);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(hx - 4, hy, 8, 5);
    };
    const iqX = W * 0.78;
    const iqY = yOfAlt(160, H);
    house(iqX - 10, iqY - 4, "#8F6438");
    house(iqX + 2, iqY - 4, "#A8764A");
    ctx.font = "800 9px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#3A2E1E";
    ctx.fillText("이키토스 (106m)", iqX, iqY + 14);
    // 서쪽 사면 위 키토 — 사면 2,850m 지점의 안쪽(동쪽)에 마을, 라벨은 위로(스틱맨과 분리)
    const qX = xOnSlope(QUITO_H);
    const qY = yOfAlt(QUITO_H, H);
    house(qX + 12, qY - 3, "#C8CCE8");
    house(qX + 23, qY - 3, "#B8BEE0");
    house(qX + 17, qY - 10, "#D8DCF0");
    ctx.fillStyle = "#2A2E4E";
    ctx.fillText("키토 (2,850m)", qX + 18, qY - 20);
    ctx.strokeStyle = "rgba(60,70,120,.4)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(8, qY);
    ctx.lineTo(qX - 14, qY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 등반 스틱맨(현재 고도) — 서쪽 사면을 따라 오른다
    const cx = xOnSlope(hCur);
    const cy = yOfAlt(clamp(hCur, 0, 6200), H) - 8;
    ctx.strokeStyle = "#2E3644";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 4.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#FFE8CE";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 3.6);
    ctx.lineTo(cx, cy + 5);
    ctx.moveTo(cx, cy - 1);
    ctx.lineTo(cx - 5, cy + 2 + Math.sin(phase * 5) * 1.5);
    ctx.moveTo(cx, cy - 1);
    ctx.lineTo(cx + 5, cy + 1);
    ctx.moveTo(cx, cy + 5);
    ctx.lineTo(cx - 4, cy + 11);
    ctx.moveTo(cx, cy + 5);
    ctx.lineTo(cx + 4, cy + 11);
    ctx.stroke();
    ctx.fillStyle = "rgba(42,58,94,.16)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12.5, 8, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 남미 인셋 지도(우상단) — 고산 기후 띠 실데이터 ──
    const mw = 92;
    const mh = (mw / MW) * MH;
    const mx = W - mw - 10;
    const my = 8;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 8);
    ctx.clip();
    ctx.fillStyle = "#12283E";
    ctx.fillRect(mx, my, mw, mh);
    ctx.save();
    ctx.translate(mx, my);
    ctx.scale(mw / MW, mh / MH);
    ctx.translate(-MX0, -MY0);
    ctx.clip(landPath, "evenodd");
    ctx.translate(MX0, MY0);
    ctx.scale(MW / mw, MH / mh);
    ctx.translate(-mx, -my);
    ctx.drawImage(mapLayer, mx, my, mw, mh);
    ctx.restore();
    const gx = (lon: number): number => mx + ((((lon + 180) / 360) * 1000 - MX0) / MW) * mw;
    const gy = (lat: number): number => my + ((((90 - lat) / 180) * 500 - MY0) / MH) * mh;
    ctx.strokeStyle = "rgba(255,244,220,.6)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(mx + 1, gy(0));
    ctx.lineTo(mx + mw - 1, gy(0));
    ctx.stroke();
    // 적도 라벨은 오른쪽 정렬 — 왼쪽은 키토 도트·라벨 자리(겹침 눈검수)
    ctx.font = "700 6.5px Pretendard, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,244,220,.85)";
    ctx.fillText("적도", mx + mw - 3, gy(0) - 2);
    const dot = (lon: number, lat: number, name: string, up: boolean): void => {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(gx(lon), gy(lat), 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "800 6.5px Pretendard, sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "#F2F5FA";
      ctx.fillText(name, gx(lon) + 3.5, gy(lat) + (up ? -2.5 : 5.5));
    };
    dot(-78.51, -0.22, "키토", true);
    dot(-73.25, -3.75, "이키토스", false);
    ctx.restore();
    ctx.strokeStyle = "rgba(180,200,230,.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 8);
    ctx.stroke();
    ctx.font = "700 7.5px Pretendard, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(30,40,70,.85)";
    ctx.fillText("보라 띠 = 고산 기후(실데이터)", mx + mw, my + mh + 10);

    // 기온 리드아웃(인셋 아래 오른쪽 레일 — 좌하단은 stage-cap과 겹쳐 이동, 눈검수)
    const tw = 104;
    const ty0 = my + mh + 18;
    ctx.fillStyle = "rgba(16,24,40,.66)";
    ctx.beginPath();
    ctx.roundRect(W - tw - 10, ty0, tw, 40, 10);
    ctx.fill();
    ctx.font = "800 11px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#EAF2FA";
    ctx.fillText(`기온 ${T.toFixed(1)}℃`, W - tw + 1, ty0 + 16);
    const barW = tw - 22;
    const tf = clamp((T + 5) / 33, 0, 1);
    ctx.fillStyle = "rgba(255,255,255,.22)";
    ctx.beginPath();
    ctx.roundRect(W - tw + 1, ty0 + 23, barW, 7, 3.5);
    ctx.fill();
    const tempG = ctx.createLinearGradient(W - tw + 1, 0, W - tw + 1 + barW, 0);
    tempG.addColorStop(0, "#6EA8FF");
    tempG.addColorStop(1, "#FF7A4D");
    ctx.fillStyle = tempG;
    ctx.beginPath();
    ctx.roundRect(W - tw + 1, ty0 + 23, Math.max(6, barW * tf), 7, 3.5);
    ctx.fill();

    // 고도 눈금(좌측 세로 — 우측은 인셋·기온 레일 자리. 0km는 태평양 라벨과 겹쳐 생략)
    ctx.font = "700 7.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    for (const tick of [2000, 4000, 6000]) {
      const ty = yOfAlt(tick, H);
      ctx.strokeStyle = "rgba(60,80,110,.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, ty);
      ctx.lineTo(16, ty);
      ctx.stroke();
      ctx.fillStyle = "rgba(40,56,80,.8)";
      ctx.fillText(`${tick / 1000}km`, 19, ty + 2.5);
    }
  });

  loop.start();
  api.setCTA("저지 관찰 · 키토 등반 · 판정까지 마쳐요", { enabled: false });

  return () => {
    loop.stop();
    for (const t of timers) window.clearTimeout(t);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", moveTo);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
  };
};
