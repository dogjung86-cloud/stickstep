// plateMap — 화산·지진 분포와 판 경계 랩(중2 II). 교과서 탐구(84~85쪽, seismic-explorer)의 조작판.
//   · 세계 지도(equirectangular) 위에 지진(보라 ●)·화산(주황 ▲)·판 경계(노랑 ─)를 겹쳐 본다
//   · "재생"을 누르면 관측 기록이 시간순처럼 타다닥 나타난다(팝 인 + 링 파동) → 점이 띠를 이룬다
//   · 판 경계 토글을 켜면 띠와 경계선이 겹친다 — 분포의 비밀이 판의 경계임을 눈으로 확인
//   · 태평양 둘레를 탭하면 "불의 고리" 하이라이트 + 이름 배지
// 좌표: 실제 지리 근사(lon/lat 하드코딩) — x=(lon+180)/360·W, y=(90−lat)/180·H.
// 목표: ① 재생으로 띠 발견 ② 판 경계와 겹쳐 3초 관찰 ③ 불의 고리 탭.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface PlateMapStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
const MAP_SRC = "geo/maps/Map01a_PALEOMAP_PaleoAtlas_000.webp";

type LL = readonly [number, number];
type EQ = readonly [number, number, number]; // lon, lat, 크기 등급 1..3

// ── 지진 95개 — 실제 지진대를 따라(불의 고리·알프스-히말라야·해령·열곡) ──
const QUAKES: readonly EQ[] = [
  // 남미 서안(나스카 섭입대) 9
  [-71.6, -33.0, 3], [-70.3, -27.4, 2], [-71.7, -30.6, 2], [-73.0, -36.8, 3], [-72.1, -39.8, 2],
  [-76.9, -12.1, 3], [-79.0, -8.1, 2], [-79.9, -2.2, 2], [-78.5, 0.6, 1],
  // 중미·멕시코 8
  [-77.0, 3.9, 2], [-84.1, 9.9, 2], [-86.3, 12.2, 2], [-90.5, 14.3, 2],
  [-93.1, 16.4, 2], [-99.1, 17.5, 3], [-102.3, 18.6, 2], [-104.8, 19.9, 1],
  // 북미 서안·알래스카 9
  [-118.2, 34.1, 3], [-122.4, 37.8, 3], [-124.2, 40.4, 2], [-125.6, 44.5, 1], [-131.5, 52.5, 2],
  [-147.5, 61.2, 2], [-153.0, 57.8, 2], [-160.5, 55.3, 2], [-168.0, 53.5, 1],
  // 알류샨 서단~캄차카~일본 11
  [-175.0, 51.8, 2], [178.5, 51.7, 1], [171.0, 52.3, 1], [160.3, 54.8, 2], [158.6, 52.9, 3],
  [153.9, 47.8, 2], [148.0, 44.5, 2], [143.9, 42.7, 3], [142.4, 38.3, 3], [141.0, 35.7, 2], [132.6, 33.9, 2],
  // 마리아나·필리핀 7
  [140.6, 30.5, 1], [143.2, 25.0, 2], [146.0, 18.0, 2], [147.5, 13.5, 1],
  [121.5, 17.5, 2], [124.0, 11.5, 2], [126.5, 7.0, 3],
  // 인도네시아·술라웨시 10
  [95.9, 4.4, 3], [97.9, 1.5, 2], [100.9, -2.9, 2], [102.9, -5.3, 2], [106.0, -7.6, 2],
  [110.5, -8.3, 2], [115.2, -8.8, 2], [119.8, -9.8, 1], [124.9, -8.8, 2], [119.9, -0.6, 2],
  // 뉴기니·남서태평양 7
  [143.9, -4.0, 2], [150.5, -5.6, 2], [156.0, -7.5, 2], [161.0, -10.4, 1],
  [167.5, -15.5, 2], [173.5, -41.3, 2], [171.7, -43.5, 2],
  // 통가-커머데크(날짜변경선 동쪽) 3
  [-175.0, -21.0, 2], [-177.5, -26.0, 1], [-179.0, -30.5, 1],
  // 히말라야·중앙아시아 9
  [84.7, 28.2, 3], [86.9, 27.9, 2], [78.5, 32.5, 1], [73.6, 34.5, 2], [70.5, 36.5, 3],
  [67.0, 30.2, 2], [96.1, 22.0, 2], [91.9, 27.3, 1], [74.6, 42.9, 1],
  // 이란·튀르키예·캅카스 6
  [57.3, 30.3, 2], [52.8, 28.5, 1], [48.5, 38.5, 1], [44.0, 39.5, 2], [38.3, 38.5, 3], [35.5, 37.0, 2],
  // 지중해 6
  [28.2, 36.7, 2], [25.7, 35.3, 2], [22.0, 38.2, 2], [16.3, 38.3, 2], [13.5, 42.5, 2], [3.0, 36.6, 1],
  // 대서양 중앙 해령(지진 위주) 6
  [-17.0, 66.2, 1], [-22.8, 63.9, 2], [-29.5, 52.5, 1], [-43.0, 29.5, 1], [-45.5, 15.5, 1], [-13.5, -7.5, 1],
  // 동아프리카 열곡 4
  [40.0, 12.5, 1], [36.8, -1.3, 1], [29.5, -6.0, 1], [34.9, -13.5, 1],
];

// ── 화산 ~60개 — 불의 고리 + 지중해 + 열곡 + 아이슬란드(해령) ──
const VOLCS: readonly LL[] = [
  // 남미 안데스 8
  [-78.4, -0.7], [-77.4, 1.2], [-75.3, 4.9], [-71.9, -15.8], [-67.7, -23.3], [-72.0, -39.4], [-72.6, -42.8], [-70.6, -35.4],
  // 중미·멕시코 6
  [-90.9, 14.5], [-89.6, 13.8], [-86.7, 12.5], [-84.2, 10.5], [-98.6, 19.0], [-103.6, 19.5],
  // 북미 서안·알래스카·알류샨 7
  [-122.2, 46.2], [-121.7, 45.4], [-122.3, 41.4], [-153.4, 59.4], [-161.9, 55.4], [-164.0, 54.8], [-176.1, 52.1],
  // 캄차카·쿠릴 3
  [160.6, 56.1], [158.8, 53.3], [153.2, 48.1],
  // 일본 4
  [138.7, 35.4], [130.7, 31.6], [131.1, 32.9], [140.8, 42.5],
  // 이즈-마리아나 2
  [140.9, 27.2], [145.8, 18.1],
  // 필리핀 3
  [120.4, 15.1], [123.7, 13.3], [121.0, 14.0],
  // 인도네시아 8
  [98.4, 3.2], [105.4, -6.1], [110.4, -7.5], [112.9, -7.9], [118.0, -8.25], [121.7, -8.5], [124.8, 1.4], [127.9, 1.7],
  // 뉴기니·남서태평양·뉴질랜드 5
  [152.2, -4.3], [151.3, -5.1], [168.3, -16.3], [175.6, -39.3], [177.2, -37.5],
  // 통가 1
  [-175.4, -20.5],
  // 아이슬란드·대서양 5
  [-19.7, 64.0], [-17.3, 64.4], [-22.4, 63.9], [-25.5, 37.8], [-17.9, 28.6],
  // 지중해 4
  [15.0, 37.7], [14.4, 40.8], [15.2, 38.8], [25.4, 36.4],
  // 동아프리카 열곡 3
  [40.7, 13.6], [29.2, -1.5], [35.9, -2.8],
  // 하와이(판 안쪽 열점 — 예외도 보여 준다) 1
  [-155.3, 19.4],
];

// ── 판 경계(단순화 폴리라인) — 날짜변경선을 넘는 경계는 2개 조각으로 분할 ──
const BOUNDS: readonly (readonly LL[])[] = [
  // 알류샨 호(동쪽 조각)
  [[-150, 58], [-159, 56], [-168, 53.6], [-179.8, 51.6]],
  // 알류샨 서단→캄차카→쿠릴→일본→마리아나
  [[179.8, 51.6], [171, 52.5], [163, 55], [158, 52], [153, 47], [147, 43], [142, 39], [140, 34], [141, 29], [143, 23], [146, 17], [147, 11], [143, 5]],
  // 아메리카 서안(북미→중미→안데스)
  [[-131, 52], [-127, 48], [-125, 43], [-122, 37], [-116, 31], [-108, 23], [-104, 18], [-96, 15], [-88, 11], [-84, 9], [-80, 1], [-78, -7], [-74, -15], [-71, -23], [-72, -32], [-74, -41], [-76, -50]],
  // 필리핀 해구
  [[122, 20], [125, 13], [127, 6], [129, 0]],
  // 순다(인도네시아) 호
  [[92, 10], [95, 4], [98, -2], [102, -6], [107, -8.5], [113, -9.5], [119, -10], [125, -9], [131, -7]],
  // 통가-커머데크(날짜변경선 동쪽)·뉴질랜드
  [[-179.5, -16], [-177.5, -23], [-178.5, -29]],
  [[179.5, -30], [176, -36], [172, -42], [167, -47]],
  // 대서양 중앙 해령
  [[-10, 72], [-16, 68], [-19, 65], [-24, 61], [-28, 56], [-31, 50], [-30, 44], [-35, 38], [-41, 31], [-45, 24], [-46, 17], [-40, 11], [-31, 7], [-25, 2], [-16, -4], [-13, -11], [-14, -19], [-15, -27], [-17, -35], [-14, -43], [-12, -50]],
  // 알프스-지중해-히말라야 벨트
  [[-9, 36], [0, 37], [10, 38], [19, 39], [27, 37], [35, 37], [44, 37], [52, 33], [60, 28], [68, 31], [76, 33], [84, 29], [92, 27], [98, 25]],
  // 동아프리카 열곡(홍해 포함)
  [[34, 28], [37, 21], [41, 14], [39, 8], [36, 2], [34, -4], [32, -10], [34, -16], [34, -22]],
];

// ── 불의 고리(하이라이트·탭 판정용 링 경로 — 태평양 둘레) ──
const RING: readonly (readonly LL[])[] = [
  // 동쪽 절반: 알래스카→북미→중미→안데스
  [[-165, 54], [-150, 58], [-138, 57], [-130, 53], [-126, 47], [-122, 38], [-115, 29], [-105, 19], [-93, 13], [-84, 8], [-79, 0], [-75, -12], [-71, -24], [-72, -35], [-75, -47], [-76, -54]],
  // 서쪽 절반: 캄차카→일본→마리아나→뉴기니→바누아투→뉴질랜드
  [[179.5, 52], [170, 51], [162, 54], [156, 50], [150, 46], [144, 41], [140, 34], [141, 27], [144, 19], [146, 12], [143, 4], [146, -4], [152, -7], [160, -10], [167, -15], [173, -20], [177, -26], [178, -33], [174, -39], [169, -46]],
];

const CVH = 300;
const PLAY_DUR = 4200;

interface Pt {
  lon: number;
  lat: number;
  s: number;
  ord: number; // 재생 등장 순서 0..1
}

export const plateMap: StepRenderer = (host, step, api) => {
  const s = step as unknown as PlateMapStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "mstage-cvblock",
    style: `height:${CVH}px;cursor:pointer`,
    attrs: {
      tabindex: "0",
      role: "button",
      "aria-label": "세계 지도. 재생이 끝나면 태평양 둘레(불의 고리)를 눌러 찾아요. 엔터 키로도 찾을 수 있어요.",
    },
  });
  const layerPill = el("span", { text: "지진 · 화산" });
  const layerDot = el("span", { class: "pdot", style: "background:#B18CFF" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "재생을 누르면 관측 기록이 쏟아져요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, layerDot, layerPill)),
    toastEl,
    capEl,
  );

  // ── 레이어 토글 3개 + 재생 ──
  interface Tg {
    on: boolean;
    color: string;
    tint: string;
    btn: HTMLButtonElement;
    name: string;
  }
  const mkToggle = (name: string, mark: string, color: string, tint: string, on: boolean): Tg => {
    const btn = el(
      "button",
      { class: "swapbtn", attrs: { type: "button", "aria-pressed": String(on), "aria-label": `${name} 레이어 켜고 끄기` } },
    );
    btn.innerHTML = `${mark}<span>${name}</span>`;
    return { on, color, tint, btn, name };
  };
  const tgQ = mkToggle(
    "지진",
    `<i style="width:9px;height:9px;border-radius:99px;background:#B18CFF;flex:none"></i>`,
    "#B18CFF", "rgba(177,140,255,.13)", true,
  );
  const tgV = mkToggle(
    "화산",
    `<i style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:9px solid #FF9F43;flex:none"></i>`,
    "#FF9F43", "rgba(255,159,67,.13)", true,
  );
  const tgB = mkToggle(
    "판 경계",
    `<i style="width:14px;height:3px;border-radius:2px;background:#FFD166;flex:none"></i>`,
    "#FFD166", "rgba(255,209,102,.13)", false,
  );
  const toggles = [tgQ, tgV, tgB];
  const tgRow = el("div", { class: "ws-controls" }, tgQ.btn, tgV.btn, tgB.btn);
  const playBtn = el(
    "button",
    { class: "swapbtn pulse", attrs: { type: "button" } },
    el("span", { text: "재생 — 시간 순서대로 뿌리기" }),
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge geo", dataset: { g: "belt" } }, el("b", { text: "띠를 발견" }), el("span", { text: "재생 1회" })),
    el("div", { class: "pn-badge geo", dataset: { g: "overlay" } }, el("b", { text: "겹쳐 보기" }), el("span", { text: "경계 ON" })),
    el("div", { class: "pn-badge geo", dataset: { g: "ring" } }, el("b", { text: "불의 고리" }), el("span", { text: "태평양 둘레" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "지난 수십 년의 <b>지진·화산 관측 기록</b>을 세계 지도에 뿌려 볼 거예요. <b>재생</b>을 눌러 보세요!",
  });
  host.append(goalChips, stage, tgRow, playBtn, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 지도 이미지 ----
  const img = new Image();
  let imgReady = false;
  img.onload = () => {
    imgReady = true;
  };
  img.src = base + MAP_SRC;

  // ---- 상태 ----
  let W = 340;
  const qPts: Pt[] = QUAKES.map(([lon, lat, sz]) => ({ lon, lat, s: sz, ord: Math.random() }));
  const vPts: Pt[] = VOLCS.map(([lon, lat]) => ({ lon, lat, s: 2, ord: Math.random() }));
  let playing = false;
  let played = false;
  let playT = 0;
  let overlapMs = 0;
  let ringFound = false;
  let ringT = 0;
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let capHidden = false;
  let missAt = 0;

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
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
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "화산·지진은 아무 데서나가 아니라 <b>판의 경계</b>를 따라 띠로 일어나요 — 태평양 둘레가 바로 '불의 고리'!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    if (finished) return;
    if (id === "belt") {
      helper.innerHTML = "점들이 아무 데나 흩어지지 않죠? <b>판 경계</b> 토글을 켜서 노란 선과 나란히 비교해 보세요!";
    } else if (id === "overlay") {
      helper.innerHTML = "띠와 경계선이 거의 겹쳐요! 이제 점이 가장 몰린 <b>태평양 둘레</b>를 지도에서 직접 탭해 보세요.";
    } else if (id === "ring" && !goals.has("overlay")) {
      helper.innerHTML = "불의 고리 발견! 이제 <b>판 경계</b> 토글을 켜서 이 띠가 경계선과 겹치는지 확인해 보세요.";
    }
  }

  // ---- 토글 ----
  function styleToggle(t: Tg): void {
    t.btn.setAttribute("aria-pressed", String(t.on));
    t.btn.style.borderColor = t.on ? t.color : "";
    t.btn.style.background = t.on ? t.tint : "";
    const sp = t.btn.querySelector("span") as HTMLElement;
    sp.style.color = t.on ? "var(--ink)" : "";
    sp.style.fontWeight = t.on ? "800" : "";
  }
  function refreshLayerPill(): void {
    const names = toggles.filter((t) => t.on).map((t) => t.name);
    layerPill.textContent = names.length ? names.join(" · ") : "레이어 꺼짐";
    layerDot.style.background = tgQ.on ? "#B18CFF" : tgV.on ? "#FF9F43" : tgB.on ? "#FFD166" : "#5F6F88";
  }
  const tgHandlers: (() => void)[] = [];
  for (const t of toggles) {
    const h = (): void => {
      t.on = !t.on;
      styleToggle(t);
      refreshLayerPill();
      haptic(HAPTIC.select);
    };
    tgHandlers.push(h);
    t.btn.addEventListener("click", h);
    styleToggle(t);
  }
  refreshLayerPill();

  // ---- 재생 ----
  function startPlay(): void {
    if (playing) return;
    playing = true;
    playT = 0;
    for (const p of qPts) p.ord = Math.random();
    for (const p of vPts) p.ord = Math.random();
    playBtn.classList.remove("pulse");
    (playBtn as HTMLButtonElement).disabled = true;
    playBtn.style.opacity = ".7";
    (playBtn.firstChild as HTMLElement).textContent = "관측 기록 재생 중…";
    hideCap();
    haptic(HAPTIC.tap);
  }
  playBtn.addEventListener("click", startPlay);

  // ---- 투영·판정 ----
  let mapX0 = 0;
  let mapY0 = 0;
  let mapW = 300;
  let mapH = 150;
  const xOf = (lon: number): number => mapX0 + ((lon + 180) / 360) * mapW;
  const yOf = (lat: number): number => mapY0 + ((90 - lat) / 180) * mapH;

  function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
    const dx = bx - ax;
    const dy = by - ay;
    const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
  }
  function distToRing(px: number, py: number): number {
    let best = 1e9;
    for (const line of RING) {
      for (let i = 1; i < line.length; i++) {
        const d = distToSeg(px, py, xOf(line[i - 1][0]), yOf(line[i - 1][1]), xOf(line[i][0]), yOf(line[i][1]));
        if (d < best) best = d;
      }
    }
    return best;
  }
  function foundRing(): void {
    if (ringFound || !played) return;
    ringFound = true;
    ringT = 0;
    haptic(HAPTIC.correct);
    collect("ring", "링 발견!", "태평양 둘레 — 불의 고리!");
  }
  const onCvDown = (e: PointerEvent): void => {
    if (!played) {
      toast("먼저 재생으로 기록을 뿌려 보세요");
      return;
    }
    if (ringFound) return;
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    // 판정 폭은 지도 축척에 비례(≈ 경도 18도) — 대륙 안쪽 오탭은 걸러진다
    if (distToRing(px, py) < Math.max(14, mapW * 0.05)) foundRing();
    else if (performance.now() - missAt > 1200) {
      missAt = performance.now();
      toast("화산·지진이 촘촘히 몰린 태평양 둘레를 노려 보세요");
    }
  };
  const onCvKey = (e: KeyboardEvent): void => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    foundRing();
  };
  canvas.addEventListener("pointerdown", onCvDown);
  canvas.addEventListener("keydown", onCvKey);

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;

    // 지도 배치(레터박스 — HUD 44px·캡션 26px 여백)
    const availH = CVH - 44 - 26;
    mapW = W - 24;
    mapH = mapW / 2;
    if (mapH > availH) {
      mapH = availH;
      mapW = mapH * 2;
    }
    mapX0 = (W - mapW) / 2;
    mapY0 = 44 + (availH - mapH) / 2;

    // 재생 진행
    if (playing) {
      playT += dt * 16.7;
      if (playT >= PLAY_DUR + 500) {
        playing = false;
        played = true;
        (playBtn as HTMLButtonElement).disabled = false;
        playBtn.style.opacity = "";
        (playBtn.firstChild as HTMLElement).textContent = "다시 재생";
        collect("belt", "점이 띠로!", "점들이 좁은 띠에 몰려 있어요!");
      }
    }
    // 겹쳐 보기 3초
    if (played && tgQ.on && tgV.on && tgB.on && !goals.has("overlay")) {
      overlapMs += dt * 16.7;
      if (overlapMs >= 3000) collect("overlay", "경계와 딱!", "띠가 판 경계선을 그대로 따라가요!");
    }
    if (ringFound) ringT += dt * 16.7;

    // ---- 지도 ----
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(mapX0, mapY0, mapW, mapH, 10);
    ctx.clip();
    if (imgReady) {
      ctx.drawImage(img, mapX0, mapY0, mapW, mapH);
      ctx.fillStyle = "rgba(7,14,27,.38)";
      ctx.fillRect(mapX0, mapY0, mapW, mapH);
    } else {
      ctx.fillStyle = "#101E33";
      ctx.fillRect(mapX0, mapY0, mapW, mapH);
      // 경위선 폴백(이미지 로드 전·실패 시)
      ctx.strokeStyle = "rgba(120,150,200,.14)";
      ctx.lineWidth = 1;
      for (let lon = -150; lon <= 150; lon += 30) {
        ctx.beginPath();
        ctx.moveTo(xOf(lon), mapY0);
        ctx.lineTo(xOf(lon), mapY0 + mapH);
        ctx.stroke();
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        ctx.moveTo(mapX0, yOf(lat));
        ctx.lineTo(mapX0 + mapW, yOf(lat));
        ctx.stroke();
      }
    }

    // ---- 불의 고리 하이라이트(발견 후) ----
    if (ringFound) {
      const k = Math.min(1, ringT / 400);
      const pulse = ringT < 2600 ? 0.5 + 0.5 * Math.sin(tMs / 220) : 0.35;
      for (const line of RING) {
        for (const pass of [0, 1]) {
          ctx.strokeStyle = pass === 0 ? `rgba(255,122,80,${0.16 * k + 0.1 * pulse * k})` : `rgba(255,150,96,${(0.55 + 0.3 * pulse) * k})`;
          ctx.lineWidth = pass === 0 ? 8 : 2.6;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.beginPath();
          for (let i = 0; i < line.length; i++) {
            const x = xOf(line[i][0]);
            const y = yOf(line[i][1]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    }

    // ---- 판 경계 ----
    if (tgB.on) {
      for (const line of BOUNDS) {
        for (const pass of [0, 1]) {
          ctx.strokeStyle = pass === 0 ? "rgba(255,209,102,.16)" : "rgba(255,209,102,.85)";
          ctx.lineWidth = pass === 0 ? 4.5 : 1.5;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.beginPath();
          for (let i = 0; i < line.length; i++) {
            const x = xOf(line[i][0]);
            const y = yOf(line[i][1]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    }

    // ---- 점(지진·화산) — 재생 팝 인 + 링 파동 ----
    const drawPt = (p: Pt, volcano: boolean): void => {
      let sc = 1;
      let ringA = 0;
      let ringR = 0;
      if (playing) {
        const age = playT - p.ord * (PLAY_DUR - 600);
        if (age <= 0) return;
        if (age < 300) {
          const t = age / 300;
          sc = 1 + (1 - t) * (1 - t) * 1.6; // 팝 오버슈트
        }
        if (age < 520) {
          ringA = (1 - age / 520) * 0.5;
          ringR = 3 + (age / 520) * 15;
        }
      } else if (!played) {
        return;
      }
      const x = xOf(p.lon);
      const y = yOf(p.lat);
      if (ringA > 0) {
        ctx.strokeStyle = volcano ? `rgba(255,159,67,${ringA})` : `rgba(177,140,255,${ringA})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(x, y, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (volcano) {
        const r = 4.4 * sc;
        ctx.fillStyle = "rgba(255,159,67,.14)";
        ctx.beginPath();
        ctx.arc(x, y, r + 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FF9F43";
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r * 0.88, y + r * 0.66);
        ctx.lineTo(x - r * 0.88, y + r * 0.66);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(140,70,10,.85)";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        const r = (p.s === 3 ? 3.0 : p.s === 2 ? 2.3 : 1.7) * sc;
        ctx.fillStyle = "rgba(177,140,255,.16)";
        ctx.beginPath();
        ctx.arc(x, y, r + 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#B18CFF";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    if (tgQ.on) for (const p of qPts) drawPt(p, false);
    if (tgV.on) for (const p of vPts) drawPt(p, true);

    // ---- 불의 고리 이름 배지 ----
    if (ringFound) {
      const k = Math.min(1, Math.max(0, (ringT - 250) / 350));
      if (k > 0) {
        const bx = clamp(xOf(-135), 66, W - 66);
        const by = yOf(-6);
        ctx.save();
        ctx.globalAlpha = k;
        ctx.fillStyle = "rgba(16,28,48,.88)";
        ctx.beginPath();
        ctx.roundRect(bx - 52, by - 14, 104, 28, 14);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,150,96,.65)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.font = "800 12.5px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFD9C4";
        ctx.fillText("불의 고리", bx, by + 4.4);
        ctx.restore();
      }
    }
    ctx.restore();

    // 지도 테두리
    ctx.strokeStyle = "rgba(120,140,190,.32)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(mapX0, mapY0, mapW, mapH, 10);
    ctx.stroke();
  });

  const onResize = (): void => {
    fitCanvas(canvas, CVH);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("재생 → 겹치기 → 불의 고리!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    img.onload = null;
    playBtn.removeEventListener("click", startPlay);
    toggles.forEach((t, i) => t.btn.removeEventListener("click", tgHandlers[i]));
    canvas.removeEventListener("pointerdown", onCvDown);
    canvas.removeEventListener("keydown", onCvKey);
  };
};
