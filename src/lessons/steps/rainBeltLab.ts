// rainBeltLab — 적도 거울 기후 랩(사회 Ⅳ L3). Ⅱ monsoonLab(계절풍)·Ⅲ westWindLab(난류) 계보의
// 이 단원 시스템성 소재: 태양을 따라 남북으로 오가는 비 띠(적도 부근 비구름 띠)가 사바나의
// 우기·건기를 만들고, 그 결과 기후가 적도를 중심으로 남북 대칭 배열(우림→사바나→사막→온대)이 된다.
//   · 세로 캔버스(createLoop+fitCanvas). 대륙은 WORLD_LAND_PATH Path2D 크롭 + 기후 착색은
//     climateAt 1° 실데이터 셀을 오프스크린에 1회 베이크(실데이터 지도 원칙 — 손 폴리곤 금지).
//     사바나 근사 = 열대(1) 셀 중 |lat|>4.5° (적도 코어는 우림) — '모형' 캡션 명시.
//   · 조작 = 계절 세그(1월 ↔ 7월): 태양 마커가 남/북회귀선 쪽으로, 비 띠가 적도 남/북으로
//     이동하고 비 띠가 걸린 쪽 사바나가 초록(우기)·반대쪽이 갈색(건기)으로 물든다.
//     세렝게티 누 떼 점 무리가 비 띠를 따라 남북 이동(훅 대이동 회수 — 연출만, 조작 없음).
//   · 판정: 관찰·실험 후 "우기·건기가 번갈아 나타나는 까닭" 2지선다(msn-quiz 문법).
// 연출 속도는 화면 px/s로 검산(Ⅲ 관행): 빗줄기 낙하 ≈ 46px/s · 비 띠 전환 ≈ 1.6s.
import { el, clamp } from "../../core/dom";
import { createLoop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import { WORLD_LAND_PATH, climateAt } from "../../ui/worldMap.generated";
import type { StepRenderer } from "../types";

interface RainBeltStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const CVH = 396;
// 아프리카 크롭(equirect 1000×500) — continentMap AFRICA crop과 동일 범위(lon -20~55.2 · lat 38~-36).
const CX0 = 444;
const CY0 = 144;
const CW = 209;
const CH = 206;
const LON0 = -20.16; // x=444 → lon
const LAT0 = 38.16; // y=144 → lat
const DLON = 75.24; // CW → 경도 폭
const DLAT = 74.16; // CH → 위도 폭

// 비 띠 중심 위도(교육 모형) — 1월엔 적도 남쪽, 7월엔 적도 북쪽(사헬까지).
const BELT_JAN = -9;
const BELT_JUL = 10;
const BELT_HALF = 7; // 띠 반폭(도)
// 태양 마커 위도(회귀선 부근 — 1월 남회귀선·7월 북회귀선 쪽).
const SUN_JAN = -21;
const SUN_JUL = 21;

// 기후 셀 색(다크 무대 톤) — 코드: 1 열대(우림/사바나 분리) · 2 건조 · 3 온대 · 6 고산.
const C_FOREST = "#2E7E46";
const C_SAV_DRY = "#A8874E";
const C_SAV_WET = "#4E9E58";
const C_DESERT = "#C8A45E";
const C_TEMPER = "#4E8E7E";
const C_ALPINE = "#8E82B8";

export const rainBeltLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RainBeltStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "belt" } }, el("b", { text: "비 띠" }), el("span", { text: "관찰" })),
    el("div", { class: "pn-badge world", dataset: { g: "season" } }, el("b", { text: "계절 실험" }), el("span", { text: "7월로" })),
    el("div", { class: "pn-badge world", dataset: { g: "why" } }, el("b", { text: "우기의 비밀" }), el("span", { text: "판정" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "1월의 아프리카예요. 적도 부근의 <b>파란 비 띠</b>가 어디에 걸려 있는지 지켜본 뒤, 아래에서 <b>7월</b>로 바꿔 무엇이 움직이는지 관찰해 보세요.",
  });
  host.append(goalChips, helper);

  const canvas = el("canvas", { class: "spring-canvas", style: `height:${CVH}px` });
  const pdot = el("span", { class: "pdot", style: "background:#6EA8FF" });
  const pillTxt = el("span", { text: "1월 — 비 띠가 적도 남쪽에" });
  const monthRead = el("div", { class: "tempread" }, el("span", { text: "1월" }));
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, el("div", { class: "pill" }, pdot, pillTxt), monthRead));
  const capEl = el("div", { class: "stage-cap", text: "파란 띠 = 비구름 띠 · 초록↔갈색 = 사바나의 우기↔건기 (모형)" });
  stage.appendChild(capEl);

  const seg = el("div", { class: "seg", style: "margin-top:12px" });
  const btnJan = el("button", { text: "1월", attrs: { type: "button", "aria-pressed": "true" } });
  const btnJul = el("button", { text: "7월", attrs: { type: "button", "aria-pressed": "false" } });
  btnJan.classList.add("on");
  seg.append(btnJan, btnJul);

  // 판정 카드 — monsoonLab msn- 문법 재사용
  const quizQ = el("div", { class: "msn-q", html: "초원(사바나)에는 <b>우기와 건기</b>가 번갈아 나타나요. 까닭이 뭘까요?" });
  const optA = el("button", { class: "msn-opt", attrs: { type: "button" }, html: "<b>태양을 따라 비 띠</b>가 남북으로 오가서 — 비 띠가 오면 우기" });
  const optB = el("button", { class: "msn-opt", attrs: { type: "button" }, html: "나무가 적어서 비구름이 아예 만들어지지 못해서" });
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
        "비 띠가 오간 자리를 봐요 — <b>적도의 우림 → 우기·건기의 사바나 → 사막</b> 순서가 남북으로 <b>데칼코마니(대칭)</b>! 태양과 비 띠가 적도를 오가기 때문이랍니다.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
    if (goals.has("belt") && goals.has("season") && !quizCard.classList.contains("show")) {
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
    quizQ.innerHTML = "정답! 방금 실험 그대로예요 — <b>1월엔 남쪽, 7월엔 북쪽</b>. 비 띠가 머무는 계절이 우기, 떠나 있는 계절이 건기랍니다.";
    collect("why", "정답!");
  });
  optB.addEventListener("click", () => {
    if (quizDone) return;
    haptic(HAPTIC.wrong);
    optB.classList.add("no");
    quizQ.innerHTML = "나무 때문이 아니에요 — 7월 버튼을 눌렀을 때 <b>비 띠가 통째로 북쪽으로</b> 옮겨 갔죠? 비 띠가 떠나 있는 계절이 건기예요. 다시!";
    later(() => optB.classList.remove("no"), 700);
  });

  // ---- 계절 토글 ----
  let july = false; // false=1월, true=7월
  let julMs = 0;
  function setSeason(toJul: boolean): void {
    if (july === toJul) return;
    july = toJul;
    julMs = 0;
    btnJan.classList.toggle("on", !toJul);
    btnJul.classList.toggle("on", toJul);
    btnJan.setAttribute("aria-pressed", String(!toJul));
    btnJul.setAttribute("aria-pressed", String(toJul));
    monthRead.querySelector("span")!.textContent = toJul ? "7월" : "1월";
    pillTxt.textContent = toJul ? "7월 — 비 띠가 적도 북쪽으로!" : "1월 — 비 띠가 적도 남쪽에";
    haptic(HAPTIC.select);
  }
  btnJan.addEventListener("click", () => setSeason(false));
  btnJul.addEventListener("click", () => setSeason(true));

  // ---- 기후 셀 베이크(오프스크린, 1° 셀 = 5px) ----
  const COLS = 75; // lon -20~55
  const ROWS = 74; // lat 38~-36
  const CELL = 5;
  const baseLayer = document.createElement("canvas");
  baseLayer.width = COLS * CELL;
  baseLayer.height = ROWS * CELL;
  const wetN = document.createElement("canvas");
  wetN.width = COLS * CELL;
  wetN.height = ROWS * CELL;
  const wetS = document.createElement("canvas");
  wetS.width = COLS * CELL;
  wetS.height = ROWS * CELL;
  {
    const b = baseLayer.getContext("2d")!;
    const n = wetN.getContext("2d")!;
    const so = wetS.getContext("2d")!;
    for (let r = 0; r < ROWS; r += 1) {
      const lat = LAT0 - (r + 0.5) * (DLAT / ROWS);
      for (let c = 0; c < COLS; c += 1) {
        const lon = LON0 + (c + 0.5) * (DLON / COLS);
        const code = climateAt(lon, lat);
        if (code === 0) continue;
        let fill = C_TEMPER;
        let savanna = false;
        if (code === 1) {
          if (Math.abs(lat) <= 4.5) fill = C_FOREST;
          else {
            fill = C_SAV_DRY;
            savanna = true;
          }
        } else if (code === 2) fill = C_DESERT;
        else if (code === 3) fill = C_TEMPER;
        else if (code === 6) fill = C_ALPINE;
        b.fillStyle = fill;
        b.fillRect(c * CELL, r * CELL, CELL, CELL);
        if (savanna) {
          const t = lat > 0 ? n : so;
          t.fillStyle = C_SAV_WET;
          t.fillRect(c * CELL, r * CELL, CELL, CELL);
        }
      }
    }
  }

  // ---- 입자(빗줄기 — 화면 px 기준) ----
  interface Drop {
    fx: number; // 0~1 지도 가로 비율
    dy: number; // 띠 중심 기준 세로 오프셋(-1~1)
    spd: number; // 화면 px/s
    len: number;
  }
  const drops: Drop[] = [];
  for (let i = 0; i < 110; i += 1) {
    drops.push({ fx: Math.random(), dy: Math.random() * 2 - 1, spd: 40 + Math.random() * 14, len: 5 + Math.random() * 3 });
  }

  const landPath = new Path2D(WORLD_LAND_PATH);
  const sxOf = (lon: number): number => ((lon + 180) / 360) * 1000;
  const syOf = (lat: number): number => ((90 - lat) / 180) * 500;

  // ---- 렌더 ----
  let phase = 0;
  let runMs = 0;
  let beltLat = BELT_JAN; // 현재 비 띠 중심(도)
  let sunLat = SUN_JAN;
  const loop = createLoop((dt) => {
    const fc = fitCanvas(canvas, CVH);
    const ctx = fc.ctx;
    const W = fc.w;
    const H = fc.h;
    phase += dt;
    runMs += dt * 1000;
    if (!finished && runMs > 2600) collect("belt", "완료!");
    if (july && !goals.has("season")) {
      julMs += dt * 1000;
      if (julMs > 2200) collect("season", "확인!");
    }
    const beltTarget = july ? BELT_JUL : BELT_JAN;
    const sunTarget = july ? SUN_JUL : SUN_JAN;
    beltLat += (beltTarget - beltLat) * Math.min(1, dt * 2.2); // ≈1.6s 전환
    sunLat += (sunTarget - sunLat) * Math.min(1, dt * 2.2);
    const northWet = clamp((beltLat + BELT_HALF - 2) / (BELT_HALF * 1.4), 0, 1); // 띠가 북에 걸친 정도
    const southWet = clamp((-beltLat + BELT_HALF - 2) / (BELT_HALF * 1.4), 0, 1);

    // 지도 배치
    let mapW = Math.min(W - 20, 330);
    let mapH = (mapW / CW) * CH;
    const maxH = H - 12 - 36;
    if (mapH > maxH) {
      mapH = maxH;
      mapW = (mapH / CH) * CW;
    }
    const mapX = (W - mapW) / 2;
    const mapY = 10;
    const toCX = (x: number): number => mapX + ((x - CX0) / CW) * mapW;
    const toCY = (y: number): number => mapY + ((y - CY0) / CH) * mapH;
    const latY = (lat: number): number => toCY(syOf(lat));

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(mapX, mapY, mapW, mapH, 14);
    ctx.clip();
    // 바다
    const seaG = ctx.createLinearGradient(0, mapY, 0, mapY + mapH);
    seaG.addColorStop(0, "#123A5E");
    seaG.addColorStop(1, "#0C2A46");
    ctx.fillStyle = seaG;
    ctx.fillRect(mapX, mapY, mapW, mapH);

    // 기후 셀 레이어(육지 클립) — baseline + 우기 레이어 알파 블렌드
    ctx.save();
    ctx.translate(mapX, mapY);
    ctx.scale(mapW / CW, mapH / CH);
    ctx.translate(-CX0, -CY0);
    ctx.clip(landPath, "evenodd");
    ctx.translate(CX0, CY0);
    ctx.scale(CW / mapW, CH / mapH);
    ctx.translate(-mapX, -mapY);
    ctx.drawImage(baseLayer, mapX, mapY, mapW, mapH);
    ctx.globalAlpha = northWet;
    ctx.drawImage(wetN, mapX, mapY, mapW, mapH);
    ctx.globalAlpha = southWet;
    ctx.drawImage(wetS, mapX, mapY, mapW, mapH);
    ctx.globalAlpha = 1;
    ctx.restore();

    // 해안선
    ctx.save();
    ctx.translate(mapX, mapY);
    ctx.scale(mapW / CW, mapH / CH);
    ctx.translate(-CX0, -CY0);
    ctx.strokeStyle = "rgba(190,215,240,.4)";
    ctx.lineWidth = 0.7 / (mapW / CW);
    ctx.stroke(landPath);
    ctx.restore();

    // 위도선 — 적도(실선) + 남북회귀선(점선)
    const lineAt = (lat: number, label: string, dash: boolean): void => {
      const y = latY(lat);
      ctx.strokeStyle = dash ? "rgba(200,216,240,.34)" : "rgba(255,244,220,.55)";
      ctx.lineWidth = dash ? 1 : 1.4;
      ctx.setLineDash(dash ? [4, 5] : []);
      ctx.beginPath();
      ctx.moveTo(mapX + 2, y);
      ctx.lineTo(mapX + mapW - 2, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "700 9px Pretendard, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = dash ? "rgba(190,205,230,.75)" : "rgba(255,244,220,.9)";
      ctx.fillText(label, mapX + 6, y - 2);
    };
    lineAt(23.4, "북회귀선", true);
    lineAt(0, "적도", false);
    lineAt(-23.4, "남회귀선", true);

    // 비 띠(부드러운 밴드 + 빗줄기)
    const beltTop = latY(beltLat + BELT_HALF);
    const beltBot = latY(beltLat - BELT_HALF);
    const bandG = ctx.createLinearGradient(0, beltTop, 0, beltBot);
    bandG.addColorStop(0, "rgba(96,150,240,0)");
    bandG.addColorStop(0.5, "rgba(96,150,240,.30)");
    bandG.addColorStop(1, "rgba(96,150,240,0)");
    ctx.fillStyle = bandG;
    ctx.fillRect(mapX, beltTop, mapW, beltBot - beltTop);
    // 구름 봉우리(띠 상단 물결)
    ctx.fillStyle = "rgba(190,215,250,.32)";
    for (let i = 0; i < 7; i += 1) {
      const cx = mapX + ((i + 0.5) / 7) * mapW + Math.sin(phase * 0.5 + i * 2.1) * 4;
      ctx.beginPath();
      ctx.ellipse(cx, beltTop + 6 + Math.sin(phase * 0.8 + i) * 2, 16, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // 빗줄기 — 낙하 46px/s 안팎(화면 px 기준 검산)
    ctx.strokeStyle = "rgba(168,205,255,.6)";
    ctx.lineWidth = 1.3;
    ctx.lineCap = "round";
    const bandH = beltBot - beltTop;
    for (const d of drops) {
      d.dy += (d.spd * dt) / (bandH / 2);
      if (d.dy > 1) {
        d.dy = -1;
        d.fx = Math.random();
      }
      const px = mapX + d.fx * mapW;
      const py = beltTop + ((d.dy + 1) / 2) * bandH;
      const fade = Math.min(1, (1 - Math.abs(d.dy)) * 2.4);
      ctx.globalAlpha = fade * 0.85;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - 1.2, py + d.len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 태양 마커(오른쪽 가장자리 — 회귀선 사이를 오간다)
    const sunX = mapX + mapW - 16;
    const sunY = latY(sunLat);
    ctx.fillStyle = "#FFC24D";
    ctx.beginPath();
    ctx.arc(sunX, sunY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,194,77,.75)";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4 + phase * 0.25;
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(a) * 9.5, sunY + Math.sin(a) * 9.5);
      ctx.lineTo(sunX + Math.cos(a) * 12.5, sunY + Math.sin(a) * 12.5);
      ctx.stroke();
    }
    ctx.font = "800 9.5px Pretendard, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(255,233,184,.95)";
    ctx.fillText("태양", sunX + 8, sunY + 14);

    // 세렝게티 누 떼(연출) — 비 띠를 따라 남북 이동(과장 모형)
    const herdLat = -4.6 + ((beltLat - BELT_JAN) / (BELT_JUL - BELT_JAN)) * 4.2; // 1월 -4.6 ↔ 7월 -0.4
    const hx = toCX(sxOf(34.9));
    const hy = latY(herdLat);
    ctx.fillStyle = "#5E4634";
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2 + phase * 0.3;
      ctx.beginPath();
      ctx.arc(hx + Math.cos(a) * (4 + (i % 3)), hy + Math.sin(a) * 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.font = "700 8.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(240,230,214,.85)";
    ctx.fillText("누 떼", hx + 10, hy);

    // 상태 라벨(좌하단 — 좌상단은 pill이 덮는다)
    ctx.font = "800 12px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(220,230,250,.85)";
    ctx.fillText(july ? "7월 — 태양·비 띠가 북쪽으로" : "1월 — 태양·비 띠가 남쪽에", mapX + 10, mapY + mapH - 8);
    ctx.restore();
  });

  loop.start();
  api.setCTA("비 띠 관찰 · 계절 실험 · 판정까지 마쳐요", { enabled: false });

  return () => {
    loop.stop();
    for (const t of timers) window.clearTimeout(t);
  };
};
