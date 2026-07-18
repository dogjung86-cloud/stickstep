// worldPlaceLab — 사회 Ⅰ 기함 랩(L2). "지구에 살아 보기" — 생활 토큰을 세계지도에 정착시키기.
//   · 가로 모드(rotateStage) + DOM/SVG(rAF 없음 — CSS 전환만). 지도는 실데이터
//     (Natural Earth 육지 + 쾨펜 기후 격자, ui/worldMap.generated.ts)라 판정이 곧 지리적 진실.
//   · 조작 2문법: 토큰 드래그 → 지도에 놓기, 또는 토큰 탭 → 지도 탭(정밀도 보완).
//   · 기후 안경(레이어 토글)이 "무기" — 켜면 기후 색이 보여 배치가 쉬워진다.
//   · 오답은 X가 아니라 코미디 연출: 순록을 사막에 놓으면 더위 먹은 토스트가 뜨고 트레이로 복귀.
// 목표: ① 첫 정착 ② 기후 안경 써 보기 ③ 네 토큰 모두 정착.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import { WORLD_LAND_PATH, CLIMATE_LABEL, climateAt, lonLatOf } from "../../ui/worldMap.generated";
import type { StepRenderer } from "../types";
import type { RotateStage } from "../../ui/rotateStage";

interface PlaceStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

// 지도 크롭 — 남극(사람이 살지 않는 배치 제외 지역)을 잘라 가로 화면을 알차게 쓴다.
const CROP_Y = 14;
const CROP_H = 400;

interface TokenDef {
  id: string;
  name: string;
  target: number; // 정답 기후 코드(1 열대 · 2 건조 · 3 온대 · 5 한대)
  snapDeg: number; // 근접 스냅 허용(도) — 놓은 곳 주변에 목표 기후가 있으면 그리로 안착
  art: string; // 트레이 칩 아트(24×24 뷰박스)
  hint: string;
  success: string;
}

const tokenArt = {
  reindeer: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 10.5 6.2 6.8M8.8 10 8 5.6M9.6 10 10.4 6.4" stroke="#8A6A3E" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M15.5 10.5 17.3 6.8M14.7 10 15.5 5.6M13.9 10 13.1 6.4" stroke="#8A6A3E" stroke-width="1.4" stroke-linecap="round"/>
    <ellipse cx="12" cy="15" rx="5.6" ry="4.2" fill="#B08D5E"/>
    <circle cx="12" cy="11.4" r="3.1" fill="#C4A272"/>
    <circle cx="12" cy="12.6" r="1.2" fill="#5A4326"/>
    <path d="M8.4 18.4V21M15.6 18.4V21M10.2 19V21.4M13.8 19V21.4" stroke="#8A6A3E" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  oasis: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M13 9c2.4-2.8 5.6-2.6 7.4-1.4-1.8.2-3 .8-4 2 1.8-.2 3.4.4 4.4 1.6-2.2-.4-4 .2-5.4 1.2" fill="#3E9E5C"/>
    <path d="M13 9c-1-3.4-3.8-4.6-6-4.4 1.4.8 2.2 1.8 2.6 3.2-1.6-.8-3.4-.8-4.8 0 2 .4 3.4 1.2 4.4 2.6" fill="#2E8A4C"/>
    <path d="M13 9.2c.4 3.2.2 5.4-.6 8" stroke="#8A6A3E" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="10" cy="19" rx="7" ry="2.6" fill="#5BB8E8"/>
    <ellipse cx="10" cy="18.4" rx="5" ry="1.7" fill="#8ED2F5"/>
  </svg>`,
  olive: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 18 C8 12 14 7 20 5" stroke="#7A8A4E" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M9 13.6q-2.6-.4-3.6-2.4 2.6-.4 3.6 2.4zM13 10.4q-.4-2.6 1.4-4.2.8 2.6-1.4 4.2zM16.5 7.8q2.4-1.2 4.4-.2-1.8 1.8-4.4.2z" fill="#8CAE5A"/>
    <ellipse cx="9.6" cy="16.4" rx="2.1" ry="2.7" fill="#5A7A34"/>
    <ellipse cx="13.8" cy="13.4" rx="2.1" ry="2.7" fill="#3E5E24" transform="rotate(-18 13.8 13.4)"/>
    <ellipse cx="9" cy="15.6" rx=".7" ry=".9" fill="#fff" opacity=".5"/>
  </svg>`,
  stilt: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4.5 10.5 12 5l7.5 5.5z" fill="#C2843A"/>
    <rect x="7" y="10.5" width="10" height="5.6" rx="1" fill="#E8C48A"/>
    <path d="M10.6 12h2.8v4.1h-2.8z" fill="#8A5A26"/>
    <path d="M8.4 16.4V21M15.6 16.4V21M12 16.4V20" stroke="#8A6A3E" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M5.5 21.4q3.2-1.4 6.5 0 3.3-1.4 6.5 0" stroke="#5BB8E8" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`,
};

const TOKENS: TokenDef[] = [
  {
    id: "reindeer",
    name: "순록 유목민",
    target: 5,
    // 시베리아의 툰드라 띠는 지도에서 아주 얇다(쾨펜 냉대선이 북위 75°까지 올라감) —
    // 후한 스냅으로 "북쪽 근처"면 안착시킨다(plateMap 판정 폭 관행).
    snapDeg: 6,
    art: tokenArt.reindeer,
    hint: "겨울이 길고 몹시 추운 곳에서 순록을 키우며 이동해요.",
    success: "툰드라 정착 성공! 여름이 짧은 이곳에선 순록 떼와 함께 이끼를 찾아 이동하며 살아요.",
  },
  {
    id: "oasis",
    name: "오아시스 마을",
    target: 2,
    snapDeg: 3,
    art: tokenArt.oasis,
    hint: "물이 귀한 곳, 물이 솟는 자리에만 마을이 생겨요.",
    success: "오아시스 정착 성공! 물이 솟는 곳 주변에 마을을 이루고 대추야자와 밀을 길러요.",
  },
  {
    id: "olive",
    name: "올리브 농부",
    target: 3,
    snapDeg: 3,
    art: tokenArt.olive,
    hint: "여름의 강한 햇빛과 건조함에도 잘 자라는 나무를 길러요.",
    success: "올리브 농장 완성! 지중해 연안처럼 온화한 곳에서 강한 여름 햇살을 받으며 영글어요.",
  },
  {
    id: "stilt",
    name: "고상 가옥",
    target: 1,
    snapDeg: 3,
    art: tokenArt.stilt,
    hint: "일 년 내내 덥고 비가 많은 곳의 집 짓는 지혜예요.",
    success: "고상 가옥 완성! 바닥을 띄우니 지면의 열기와 습기, 해충이 마루 아래로 지나가요.",
  },
];

// 오답 코미디 — 고른 기후의 오개념을 짚고 옳은 방향을 알려 준다(빈 칸은 GENERIC 폴백).
const WRONG: Record<string, Partial<Record<number, string>>> = {
  reindeer: {
    1: "순록이 더위에 헉헉! 두꺼운 털옷을 입은 순록에게 열대는 한증막이에요 — 훨씬 추운 북쪽으로.",
    2: "사막엔 순록이 먹을 이끼가 없어요. 모래바람 대신 눈바람 부는 곳으로!",
    3: "여기도 나쁘진 않지만… 순록의 털옷은 사계절 온화한 곳엔 너무 더워요. 더 북쪽으로!",
    4: "거의 다 왔어요! 조금 더 북쪽 — 나무도 자라기 힘든, 여름이 아주 짧은 곳이 순록의 고향이에요.",
    6: "높은 산도 춥긴 한데, 순록 떼가 몰려다니기엔 너무 가팔라요. 북극 근처의 넓은 벌판으로!",
  },
  oasis: {
    1: "여긴 비가 쏟아지는걸요! 물이 넘치는 곳엔 오아시스가 필요 없어요 — 물이 귀한 사막으로.",
    3: "비가 넉넉히 오는 곳이라 우물 곁에 모여 살 이유가 없어요. 훨씬 메마른 곳으로!",
    4: "숲과 눈이 있는 곳이에요 — 오아시스 마을은 비가 거의 안 오는 사막의 지혜랍니다.",
    5: "꽁꽁 언 땅에선 대추야자가 못 자라요. 뜨겁고 메마른 사막으로!",
    6: "산꼭대기엔 오아시스 대신 눈 녹은 물이 흘러요. 모래사막 한가운데로!",
  },
  olive: {
    1: "너무 덥고 습해서 올리브가 지쳐요. 여름은 따갑고 겨울은 부드러운 온화한 곳으로!",
    2: "올리브가 튼튼해도 사막은 너무 메말라요. 비가 어느 정도는 오는 온화한 곳으로!",
    4: "겨울이 너무 길고 추워요 — 올리브나무가 겨울을 못 넘겨요. 더 따뜻한 곳으로!",
    5: "얼음 위 올리브나무라니! 뿌리가 꽁꽁 얼어 버려요. 사계절이 온화한 곳으로!",
    6: "높은 산 위는 밤마다 서늘해요. 올리브는 햇살 좋은 낮은 언덕을 좋아해요!",
  },
  stilt: {
    2: "사막은 오히려 습기 걱정이 없는걸요 — 바닥 띄우기는 덥고 '습한' 곳의 지혜예요.",
    3: "이곳 집들은 바닥을 땅에 붙여요. 일 년 내내 무덥고 비가 쏟아지는 곳으로!",
    4: "추운 곳에서 바닥을 띄우면 찬바람이 마루 밑으로 슝슝! 더운 곳의 지혜는 더운 곳에서.",
    5: "여기서 바닥을 띄우면 냉동고 위에 사는 셈이에요. 일 년 내내 더운 곳으로!",
    6: "서늘한 고산에선 바닥을 띄울 이유가 없어요. 덥고 습한 저지대로!",
  },
};
const GENERIC_WRONG: Record<number, string> = {
  1: "여긴 일 년 내내 덥고 비가 많은 열대예요 — 이 친구의 살 곳은 아니네요.",
  2: "여긴 비가 거의 없는 건조 지역이에요 — 다른 곳을 찾아봐요.",
  3: "여긴 사계절이 뚜렷한 온대예요 — 이 친구에겐 안 맞아요.",
  4: "여긴 겨울이 길고 추운 냉대예요 — 다른 곳을 찾아봐요.",
  5: "여긴 일 년 내내 몹시 추운 한대예요 — 이 친구에겐 가혹해요.",
  6: "여긴 적도 근처인데도 서늘한 고산 지역이에요 — 다른 곳을 찾아봐요.",
};

const LENS_PAL: Record<number, string> = {
  1: "#1E9E50", 2: "#E8B93C", 3: "#A5D65C", 4: "#3FA7C8", 5: "#8E9EC8", 6: "#B0672A",
};

export const worldPlaceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PlaceStep;
  const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "first" } }, el("b", { text: "첫 정착" }), el("span", { text: "한 곳" })),
    el("div", { class: "pn-badge world", dataset: { g: "lens" } }, el("b", { text: "기후 안경" }), el("span", { text: "써 보기" })),
    el("div", { class: "pn-badge world", dataset: { g: "all" } }, el("b", { text: "모두 정착" }), el("span", { text: "네 친구" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "순록 유목민, 오아시스 마을, 올리브 농부, 고상 가옥 — 네 친구를 <b>살기 알맞은 기후</b>에 정착시켜 주세요. 막히면 <b>기후 안경</b>이 힌트!",
  });
  const preview = el(
    "div",
    { class: "sp3-enter" },
    el("div", { class: "sp3-enter-art", html: previewArt() }),
    el("div", { class: "sp3-enter-txt", html: "진짜 세계지도 위에 <b>네 친구의 보금자리</b>를 골라 줘요.<br>화면이 자동으로 <b>가로</b>로 돌아가요." }),
  );
  const enterBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 지구 여행 떠나기" }));
  host.append(goalChips, helper, preview, enterBtn); // 지시(helper)는 조작 요소 위
  if (s.curio) host.appendChild(curioCard(s.curio));

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
        "네 친구 모두 정착 완료! <b>위치가 기후를 정하고, 기후가 사는 모습을 빚어요</b> — 옷도, 집도, 기르는 것도 환경에 맞춘 지혜였어요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 상태 ----
  let rot: RotateStage | null = null;
  let disposed = false;
  const settled = new Set<string>();
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };

  function enter(): void {
    if (rot) return;
    haptic(HAPTIC.select);
    void (async () => {
      const { enterRotateStage } = await import("../../ui/rotateStage");
      if (disposed) return;
      rot = enterRotateStage({ title: "지구에 살아 보기 — 네 친구의 보금자리 찾기", onLeave: () => leave() });
      buildStage(rot);
    })();
  }

  function leave(): void {
    rot?.dispose();
    rot = null;
  }

  enterBtn.addEventListener("click", enter);
  api.setCTA("네 친구를 모두 정착시켜요", { enabled: false });

  // ---- 가로 무대 ----
  function buildStage(rt: RotateStage): void {
    const stage = rt.stage;
    stage.classList.add("wpl-stage");

    // 지도(SVG) — 실데이터 육지 + 기후 오버레이(안경 토글) + 정착 마커
    const mapBox = el("div", { class: "wpl-map" });
    mapBox.innerHTML = `
      <svg class="wpl-svg" viewBox="0 ${CROP_Y} 1000 ${CROP_H}" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="wpl-landclip"><path d="${WORLD_LAND_PATH}" fill-rule="evenodd"/></clipPath>
          <radialGradient id="wpl-sea" cx=".5" cy=".38" r=".9">
            <stop offset="0" stop-color="#D9EDF8"/><stop offset="1" stop-color="#BCDCEF"/>
          </radialGradient>
        </defs>
        <rect x="0" y="${CROP_Y}" width="1000" height="${CROP_H}" rx="14" fill="url(#wpl-sea)"/>
        <g class="wpl-grat" stroke="#7FA8C8" stroke-width="1" opacity=".5">
          <line x1="0" y1="250" x2="1000" y2="250"/>
          <line x1="0" y1="184.7" x2="1000" y2="184.7" stroke-dasharray="7 7" opacity=".55"/>
          <line x1="0" y1="315.3" x2="1000" y2="315.3" stroke-dasharray="7 7" opacity=".55"/>
          <line x1="0" y1="65.3" x2="1000" y2="65.3" stroke-dasharray="7 7" opacity=".55"/>
        </g>
        <text x="8" y="245" class="wpl-gratlab">적도</text>
        <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
        <image class="wpl-clim" href="${BASE}soc/climate.webp" x="0" y="0" width="1000" height="500"
          preserveAspectRatio="none" clip-path="url(#wpl-landclip)" opacity="0"/>
        <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.5)" stroke-width="1" fill="none" fill-rule="evenodd"/>
        <g class="wpl-marks"></g>
      </svg>`;
    const climImg = mapBox.querySelector(".wpl-clim") as SVGImageElement;
    const marks = mapBox.querySelector(".wpl-marks") as SVGGElement;

    // 기후 안경 + 범례
    const lensBtn = el(
      "button",
      { class: "wpl-lens", attrs: { type: "button", "aria-pressed": "false", "aria-label": "기후 안경 켜기" } },
      el("span", { class: "wpl-lens-ico", html: lensIco() }),
      el("span", { text: "기후 안경" }),
    );
    const legend = el("div", { class: "wpl-legend" });
    for (let c = 1; c <= 6; c++) {
      legend.appendChild(
        el("span", { class: "wpl-leg" }, el("i", { style: `background:${LENS_PAL[c]}` }), el("span", { text: CLIMATE_LABEL[c].replace(" 기후", "") })),
      );
    }
    let lensOn = false;
    lensBtn.addEventListener("click", () => {
      lensOn = !lensOn;
      climImg.setAttribute("opacity", lensOn ? "0.9" : "0");
      lensBtn.setAttribute("aria-pressed", String(lensOn));
      lensBtn.classList.toggle("on", lensOn);
      legend.classList.toggle("show", lensOn);
      haptic(HAPTIC.tap);
      if (lensOn) {
        collect("lens", "장착!");
        showToast("기후 안경 장착 — 색깔이 기후 지역이에요. 범례를 보고 골라 봐요!");
      }
    });

    // 안내 필 + 토스트
    const pill = el(
      "div",
      { class: "pill sp3-pill wpl-pill" },
      el("span", { class: "pdot", style: "background:#E8590C" }),
      el("span", { text: "친구를 끌어서(또는 탭 → 지도 탭) 정착시켜요" }),
    );
    const pillText = pill.querySelectorAll("span")[1] as HTMLElement;
    const toast = el("div", { class: "sp3-toast wpl-toast" });
    let toastTimer = 0;
    function showToast(msg: string): void {
      toast.textContent = msg;
      toast.classList.add("show");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3000);
    }

    // 토큰 트레이 — 기후 안경이 첫 슬롯(상단은 rot-title·sp3-pill·rot-exit가 선점)
    const tray = el("div", { class: "wpl-tray" });
    tray.appendChild(lensBtn);
    const tokenEls = new Map<string, HTMLElement>();
    for (const t of TOKENS) {
      const tok = el(
        "button",
        { class: "wpl-token", dataset: { t: t.id }, attrs: { type: "button", "aria-label": `${t.name} — ${t.hint}` } },
        el("span", { class: "wpl-token-art", html: t.art }),
        el("span", { class: "wpl-token-name", text: t.name }),
      );
      tray.appendChild(tok);
      tokenEls.set(t.id, tok);
    }

    stage.append(mapBox, pill, toast, legend, tray);

    // ---- 레이아웃(rAF 없이 — resize 때만) ----
    function layout(): void {
      const { w, h } = rt.size();
      const trayH = 72;
      const topPad = 42; // rot-title·sp3-pill 아래부터 지도
      const mapH = Math.min(h - trayH - topPad - 6, (w - 10) / 2.5);
      const mapW = mapH * 2.5;
      mapBox.style.width = `${mapW}px`;
      mapBox.style.height = `${mapH}px`;
      mapBox.style.left = `${(w - mapW) / 2}px`;
      mapBox.style.top = `${topPad}px`;
      legend.style.bottom = `${trayH + 6}px`;
    }
    layout();
    window.addEventListener("resize", layout);
    const ro = new ResizeObserver(layout);
    ro.observe(stage);

    // 논리 좌표 → 지도 svg 좌표(뷰박스 단위). mapBox는 스테이지 논리 px(left/top)로 배치돼
    // 있으므로 rotateStage.mapPoint가 준 논리 좌표에서 바로 뺀다.
    function svgCoordOf(x: number, y: number): { sx: number; sy: number } | null {
      const left = parseFloat(mapBox.style.left) || 0;
      const top = parseFloat(mapBox.style.top) || 0;
      const w = parseFloat(mapBox.style.width) || 1;
      const h = parseFloat(mapBox.style.height) || 1;
      if (x < left || x > left + w || y < top || y > top + h) return null;
      return { sx: ((x - left) / w) * 1000, sy: CROP_Y + ((y - top) / h) * CROP_H };
    }

    // ---- 배치 판정 ----
    // 근접 스냅: 놓은 곳 주변(snapDeg° 확장 링)에서 목표 기후 셀을 찾아 그리로 안착시킨다.
    // 툰드라처럼 지도에서 얇은 띠를 손가락 정밀도로 요구하지 않기 위한 장치(plateMap 관행).
    function findNearby(target: number, lon: number, lat: number, maxDeg: number): { lon: number; lat: number } | null {
      for (let d = 1; d <= maxDeg; d++) {
        let best: { lon: number; lat: number; dist: number } | null = null;
        for (let dr = -d; dr <= d; dr++) {
          for (let dc = -d; dc <= d; dc++) {
            if (Math.max(Math.abs(dr), Math.abs(dc)) !== d) continue; // 이번 링만
            const la = lat + dr;
            const lo = lon + dc;
            if (la < -56 || la > 88) continue; // 지도 크롭(남극 제외) 밖으로는 스냅 금지
            if (climateAt(lo, la) === target) {
              const dist = dr * dr + dc * dc;
              if (!best || dist < best.dist) best = { lon: lo, lat: la, dist };
            }
          }
        }
        if (best) return best;
      }
      return null;
    }

    function judge(tokenId: string, sx: number, sy: number): void {
      const t = TOKENS.find((k) => k.id === tokenId)!;
      const { lon, lat } = lonLatOf(sx, sy);
      const code = climateAt(lon, lat);
      if (code === t.target) {
        settle(t, sx, sy);
        return;
      }
      const near = findNearby(t.target, lon, lat, t.snapDeg);
      if (near) {
        settle(t, ((near.lon + 180) / 360) * 1000, ((90 - near.lat) / 180) * 500);
        return;
      }
      if (code === 0) {
        haptic(HAPTIC.wrong);
        splashAt(sx, sy);
        showToast("풍덩! 바다에 빠졌어요 — 육지에 놓아 주세요.");
        return;
      }
      haptic(HAPTIC.wrong);
      shakeToken(tokenEls.get(tokenId)!);
      showToast(WRONG[tokenId]?.[code] ?? GENERIC_WRONG[code] ?? "여긴 안 맞아요 — 다른 곳을 찾아봐요.");
    }

    function settle(t: TokenDef, sx: number, sy: number): void {
      settled.add(t.id);
      haptic(HAPTIC.correct);
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "wpl-mark");
      g.setAttribute("transform", `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
      g.innerHTML = `
        <circle r="17" fill="rgba(232,89,12,.16)"/>
        <circle r="13" fill="#FFFDF8" stroke="#E8590C" stroke-width="2"/>
        <g transform="translate(-9 -9) scale(0.75)">${t.art}</g>`;
      marks.appendChild(g);
      const tok = tokenEls.get(t.id)!;
      tok.classList.add("done");
      tok.setAttribute("disabled", "true");
      pillText.textContent = `${t.name} 정착! (${settled.size}/4)`;
      showToast(`${CLIMATE_LABEL[t.target]} — ${t.success}`);
      collect("first", "성공!");
      if (settled.size >= TOKENS.length) {
        collect("all", "완료!");
        pillText.textContent = "네 친구 모두 정착 완료!";
        later(() => showToast("환경이 삶의 모습을 빚어요 — 세로로 돌아가 정리해 봐요!"), 3100);
      }
    }

    function splashAt(sx: number, sy: number): void {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "wpl-splash");
      g.setAttribute("transform", `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
      g.innerHTML = `<circle r="4" fill="none" stroke="#4E9AE8" stroke-width="2.4"/><circle r="10" fill="none" stroke="#4E9AE8" stroke-width="1.6" opacity=".6"/>`;
      marks.appendChild(g);
      later(() => g.remove(), 700);
    }

    function shakeToken(tok: HTMLElement): void {
      tok.classList.remove("shake");
      void tok.offsetWidth;
      tok.classList.add("shake");
    }

    // ---- 입력: 드래그 + 탭-탭 ----
    let drag: { id: string; ghost: HTMLElement } | null = null;
    let armed: string | null = null; // 탭 선택된 토큰

    function ghostFor(t: TokenDef): HTMLElement {
      const gEl = el("div", { class: "wpl-ghost", html: t.art });
      stage.appendChild(gEl);
      return gEl;
    }
    function moveGhost(x: number, y: number): void {
      if (!drag) return;
      drag.ghost.style.transform = `translate(${x - 22}px, ${y - 22}px)`;
    }

    function onDown(e: PointerEvent): void {
      const tokBtn = (e.target as HTMLElement).closest?.(".wpl-token") as HTMLElement | null;
      if (!tokBtn || tokBtn.classList.contains("done")) return;
      const id = tokBtn.dataset.t!;
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 포인터 안전(사고 7) */
      }
      const t = TOKENS.find((k) => k.id === id)!;
      drag = { id, ghost: ghostFor(t) };
      const p = rt.mapPoint(e);
      moveGhost(p.x, p.y);
      tokBtn.classList.add("lift");
      pillText.textContent = `${t.name} — ${t.hint}`;
      haptic(HAPTIC.tap);
    }
    function onMove(e: PointerEvent): void {
      if (!drag) return;
      const p = rt.mapPoint(e);
      moveGhost(p.x, p.y);
    }
    function onUp(e: PointerEvent): void {
      if (!drag) {
        // 탭-탭 배치: 무장된 토큰이 있고 지도(버튼이 아닌 곳)를 탭했다면 그 자리에 배치
        if (armed && !(e.target as HTMLElement).closest?.("button")) {
          const p = rt.mapPoint(e);
          const c = svgCoordOf(p.x, p.y);
          if (c) {
            const id = armed;
            disarm();
            judge(id, c.sx, c.sy);
          }
        }
        return;
      }
      const { id, ghost } = drag;
      drag = null;
      ghost.remove();
      const tok = tokenEls.get(id)!;
      tok.classList.remove("lift");
      const p = rt.mapPoint(e);
      const c = svgCoordOf(p.x, p.y);
      if (c) {
        judge(id, c.sx, c.sy);
      } else {
        // 트레이 근처에서 놓음 = 탭으로 취급 → 무장 토글(선택 → 지도 탭 배치 경로)
        if (armed === id) disarm();
        else arm(id);
      }
    }
    function arm(id: string): void {
      disarm();
      armed = id;
      const t = TOKENS.find((k) => k.id === id)!;
      tokenEls.get(id)!.classList.add("armed");
      pillText.textContent = `${t.name} 선택 — 지도에서 살 곳을 탭!`;
    }
    function disarm(): void {
      if (!armed) return;
      tokenEls.get(armed)!.classList.remove("armed");
      armed = null;
    }

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);

    // 정리 — rotateStage dispose와 함께
    const origDispose = rt.dispose.bind(rt);
    rt.dispose = () => {
      window.removeEventListener("resize", layout);
      ro.disconnect();
      window.clearTimeout(toastTimer);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      origDispose();
    };
  }

  return () => {
    disposed = true;
    for (const t of timers) window.clearTimeout(t);
    leave();
  };
};

function lensIco(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/><path d="M12 12h0M2 10l2 1M22 10l-2 1"/>
  </svg>`;
}

function previewArt(): string {
  // 세로 진입 카드 미니 지도 — 실제 육지 path를 그대로 크롭해 보여준다.
  return `<svg viewBox="60 40 880 380" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:100%;border-radius:14px;background:#CFE7F5">
    <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd" stroke="rgba(74,88,110,.45)" stroke-width="1.2"/>
    <circle cx="712" cy="88" r="10" fill="#8E9EC8" opacity=".9"/>
    <circle cx="530" cy="180" r="10" fill="#E8B93C" opacity=".9"/>
    <circle cx="497" cy="147" r="10" fill="#A5D65C" opacity=".9"/>
    <circle cx="775" cy="255" r="10" fill="#1E9E50" opacity=".9"/>
  </svg>`;
}
