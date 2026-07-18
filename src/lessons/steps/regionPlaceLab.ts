// regionPlaceLab — 대륙 지역 구분 배치 랩(사회 Ⅱ 기함, Ⅲ~Ⅵ 재사용 문법).
//   · worldPlaceLab의 배치 문법(드래그+탭-탭 2문법·근접 스냅·오답 코미디)을 세로 모드로 계승.
//     대륙 하나는 세로 화면에 넉넉해 rotateStage를 쓰지 않는다(Ⅰ단원과 다른 점).
//   · 대륙 데이터는 ui/continentMap.ts의 CONTINENTS[continent] — 아시아 전용 하드코딩 없음.
//     지역 폴리곤(러프 국경)·앵커·대표 도시·힌트 아이콘이 전부 파라미터다.
//   · 판정 순서: 목표 지역 안 → 근접 스냅(경계 3° 이내) → 바다 풍덩 → 다른 지역 오답 코미디
//     (동적 생성: 놓인 지역의 정체 + 목표 지역의 방위 안내) → 지역 밖 육지 안내(outsideMsg).
//   · "특징 안경" = 힌트 렌즈: 켜면 지역마다 연한 색과 특징 아이콘이 떠 스티커와 짝이 보인다.
// 목표: ① 첫 지역 배치 ② 특징 안경 써 보기 ③ 다섯 지역 모두 배치.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import { WORLD_LAND_PATH, climateAt } from "../../ui/worldMap.generated";
import {
  CONTINENTS, type ContinentDef, type ContinentRegion,
  lonToX, latToY, xToLon, yToLat, polyPath, pointInPoly, distToPoly,
} from "../../ui/continentMap";
import type { StepRenderer } from "../types";

interface RegionPlaceStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
  continent?: string;
}

const SNAP_DEG = 3; // 경계 근접 스냅(도) — 러프 폴리곤의 오차를 흡수한다

/** 방위 문구 — 오답 코미디의 "어느 쪽으로 가야 하나" 안내. */
function dirWord(fromLon: number, fromLat: number, toLon: number, toLat: number): string {
  const dLon = toLon - fromLon;
  const dLat = toLat - fromLat;
  const ew = Math.abs(dLon) > 6 ? (dLon > 0 ? "동" : "서") : "";
  const ns = Math.abs(dLat) > 6 ? (dLat > 0 ? "북" : "남") : "";
  if (ew && ns) return `${ns}${ew}쪽`;
  if (ew) return `${ew}쪽`;
  if (ns) return `${ns}쪽`;
  return "바로 근처";
}

export const regionPlaceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RegionPlaceStep;
  const cont: ContinentDef = CONTINENTS[s.continent ?? "asia"] ?? CONTINENTS.asia;
  const { crop } = cont;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "first" } }, el("b", { text: "첫 지역" }), el("span", { text: "한 곳" })),
    el("div", { class: "pn-badge world", dataset: { g: "lens" } }, el("b", { text: "특징 안경" }), el("span", { text: "써 보기" })),
    el("div", { class: "pn-badge world", dataset: { g: "all" } }, el("b", { text: "다섯 지역" }), el("span", { text: "모두 배치" })),
  );
  const helper = el("div", {
    class: "helper",
    html: `${cont.name}는 자연환경과 문화에 따라 <b>${cont.regions.length}개 지역</b>으로 나눠요. 아래 <b>지역 이름표를 끌어서</b>(또는 탭한 뒤 지도를 탭) 알맞은 자리에 붙여 보세요. 막히면 <b>특징 안경</b>!`,
  });
  host.append(goalChips, helper);

  // ---- 지도(SVG) ----
  const regionFills = cont.regions
    .map((r) => `<path class="rpl-fill" data-r="${r.id}" d="${polyPath(r.poly)}" fill="${r.color}" opacity="0"/>`)
    .join("");
  const regionEdges = cont.regions
    .map((r) => `<path d="${polyPath(r.poly)}" fill="none" stroke="#8A93A6" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>`)
    .join("");
  const hintIcons = cont.regions
    .map((r) => {
      const sized = r.hintIcon.replace("<svg ", '<svg width="26" height="26" ');
      return `<g class="rpl-hint" data-r="${r.id}" transform="translate(${(lonToX(r.anchor[0]) - 13).toFixed(1)} ${(latToY(r.anchor[1]) - 13).toFixed(1)})" opacity="0">
        <circle cx="13" cy="13" r="16" fill="#FFFFFF" opacity=".85"/>${sized}</g>`;
    })
    .join("");
  const mapBox = el("div", { class: "rpl-map" });
  mapBox.innerHTML = `
    <svg class="rpl-svg" viewBox="${crop.x} ${crop.y} ${crop.w} ${crop.h}" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${cont.name} 지역 구분 지도">
      <defs>
        <clipPath id="rpl-landclip"><path d="${WORLD_LAND_PATH}" fill-rule="evenodd"/></clipPath>
        <radialGradient id="rpl-sea" cx=".5" cy=".4" r=".95">
          <stop offset="0" stop-color="#D9EDF8"/><stop offset="1" stop-color="#BCDCEF"/>
        </radialGradient>
      </defs>
      <rect x="${crop.x}" y="${crop.y}" width="${crop.w}" height="${crop.h}" rx="12" fill="url(#rpl-sea)"/>
      <line x1="${crop.x}" y1="250" x2="${crop.x + crop.w}" y2="250" stroke="#7FA8C8" stroke-width="1" opacity=".55"/>
      <text x="${crop.x + 5}" y="246" class="rpl-gratlab">적도</text>
      <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
      <g clip-path="url(#rpl-landclip)">${regionFills}</g>
      <g clip-path="url(#rpl-landclip)">${regionEdges}</g>
      <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.5)" stroke-width=".7" fill="none" fill-rule="evenodd"/>
      <g class="rpl-hints">${hintIcons}</g>
      <g class="rpl-marks"></g>
    </svg>`;
  const svgEl = mapBox.querySelector(".rpl-svg") as SVGSVGElement;
  const marks = mapBox.querySelector(".rpl-marks") as SVGGElement;

  // 안내 필 + 토스트(지도 카드 위에 겹침)
  const pillText = el("span", { text: "이름표를 끌어 지역 자리에 놓아요" });
  const pill = el("div", { class: "pill rpl-pill" }, el("span", { class: "pdot", style: "background:#E8590C" }), pillText);
  const toast = el("div", { class: "rpl-toast" });
  const stage = el("div", { class: "rpl-stage" }, mapBox, pill, toast);

  // ---- 트레이: 특징 안경 + 지역 스티커 ----
  const lensBtn = el(
    "button",
    { class: "rpl-lens", attrs: { type: "button", "aria-pressed": "false", "aria-label": "특징 안경 켜기 — 지역마다 특징 아이콘이 표시돼요" } },
    el("span", { class: "rpl-lens-ico", html: lensIco() }),
    el("span", { text: "특징 안경" }),
  );
  const tray = el("div", { class: "rpl-tray" }, lensBtn);
  const tokenEls = new Map<string, HTMLElement>();
  for (const r of cont.regions) {
    const tok = el(
      "button",
      { class: "rpl-token", dataset: { r: r.id }, attrs: { type: "button", "aria-label": `${r.name} — ${r.hint}` } },
      el("span", { class: "rpl-token-ico", style: `background:${r.color}1F;color:${r.color}`, html: r.hintIcon }),
      el("span", { class: "rpl-token-name", text: r.name }),
    );
    tray.appendChild(tok);
    tokenEls.set(r.id, tok);
  }
  host.append(stage, tray);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 목표 수집 ----
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
        `${cont.name}의 지역 지도가 완성됐어요! <b>자연환경과 문화</b>가 지역을 나누는 기준이었죠 — 이 다섯 조각이 앞으로 배울 모든 이야기의 무대예요.`;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  }

  const placed = new Set<string>();
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };
  let toastTimer = 0;
  function showToast(msg: string): void {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
  }

  // ---- 특징 안경 ----
  let lensOn = false;
  lensBtn.addEventListener("click", () => {
    lensOn = !lensOn;
    lensBtn.setAttribute("aria-pressed", String(lensOn));
    lensBtn.classList.toggle("on", lensOn);
    for (const r of cont.regions) {
      const hintG = svgEl.querySelector(`.rpl-hint[data-r="${r.id}"]`) as SVGGElement;
      hintG.setAttribute("opacity", lensOn && !placed.has(r.id) ? "1" : "0");
      const fill = svgEl.querySelector(`.rpl-fill[data-r="${r.id}"]`) as SVGPathElement;
      if (!placed.has(r.id)) fill.setAttribute("opacity", lensOn ? "0.2" : "0");
    }
    haptic(HAPTIC.tap);
    if (lensOn) {
      collect("lens", "장착!");
      showToast("특징 안경 장착 — 지역마다 특징 아이콘이 떠올라요. 이름표의 아이콘과 짝을 맞춰 봐요!");
    }
  });

  // ---- 좌표 변환 ----
  function svgCoordOf(clientX: number, clientY: number): { sx: number; sy: number } | null {
    const r = svgEl.getBoundingClientRect();
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return null;
    return {
      sx: crop.x + ((clientX - r.left) / r.width) * crop.w,
      sy: crop.y + ((clientY - r.top) / r.height) * crop.h,
    };
  }

  // ---- 판정 ----
  function judge(regionId: string, sx: number, sy: number): void {
    const target = cont.regions.find((r) => r.id === regionId)!;
    const lon = xToLon(sx);
    const lat = yToLat(sy);
    if (pointInPoly(lon, lat, target.poly)) {
      settle(target);
      return;
    }
    if (distToPoly(lon, lat, target.poly) <= SNAP_DEG) {
      settle(target);
      return;
    }
    if (climateAt(lon, lat) === 0) {
      haptic(HAPTIC.wrong);
      splashAt(sx, sy);
      showToast("풍덩! 바다에 빠졌어요 — 육지에 붙여 주세요.");
      return;
    }
    const dropped = cont.regions.find((r) => pointInPoly(lon, lat, r.poly));
    haptic(HAPTIC.wrong);
    shakeToken(tokenEls.get(regionId)!);
    if (dropped) {
      const dir = dirWord(dropped.anchor[0], dropped.anchor[1], target.anchor[0], target.anchor[1]);
      showToast(`여긴 ${dropped.name} — ${dropped.trait} 땅이에요. ${target.name}은 여기서 ${dir}!`);
    } else {
      showToast(cont.outsideMsg(lon, lat));
    }
  }

  function settle(r: ContinentRegion): void {
    placed.add(r.id);
    haptic(HAPTIC.correct);
    const fill = svgEl.querySelector(`.rpl-fill[data-r="${r.id}"]`) as SVGPathElement;
    fill.setAttribute("opacity", "0.5");
    const hintG = svgEl.querySelector(`.rpl-hint[data-r="${r.id}"]`) as SVGGElement;
    hintG.setAttribute("opacity", "0");
    // 지역명 라벨 + 대표 도시 도장
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "rpl-mark");
    const ax = lonToX(r.anchor[0]);
    const ay = latToY(r.anchor[1]);
    const cityDots = r.cities
      .map((c) => {
        const cx = lonToX(c.lon).toFixed(1);
        const cy = latToY(c.lat).toFixed(1);
        return `<circle cx="${cx}" cy="${cy}" r="2.6" fill="#FFFFFF" stroke="${darken(r.color)}" stroke-width="1.6"/>
          <text x="${cx}" y="${(latToY(c.lat) - 4.4).toFixed(1)}" class="rpl-city">${c.name}</text>`;
      })
      .join("");
    g.innerHTML = `
      <g class="rpl-regname">
        <text x="${ax.toFixed(1)}" y="${(ay + 4).toFixed(1)}" class="rpl-name-stroke">${r.name}</text>
        <text x="${ax.toFixed(1)}" y="${(ay + 4).toFixed(1)}" class="rpl-name" fill="${darken(r.color)}">${r.name}</text>
      </g>
      ${cityDots}`;
    marks.appendChild(g);
    const tok = tokenEls.get(r.id)!;
    tok.classList.add("done");
    tok.setAttribute("disabled", "true");
    pillText.textContent = `${r.name} 배치! (${placed.size}/${cont.regions.length})`;
    showToast(r.success);
    collect("first", "성공!");
    if (placed.size >= cont.regions.length) {
      collect("all", "완료!");
      pillText.textContent = `${cont.regions.length}개 지역 완성!`;
    }
  }

  function splashAt(sx: number, sy: number): void {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "rpl-splash");
    g.setAttribute("transform", `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
    g.innerHTML = `<circle r="3.5" fill="none" stroke="#4E9AE8" stroke-width="2"/><circle r="8" fill="none" stroke="#4E9AE8" stroke-width="1.4" opacity=".6"/>`;
    marks.appendChild(g);
    later(() => g.remove(), 700);
  }

  function shakeToken(tok: HTMLElement): void {
    tok.classList.remove("shake");
    void tok.offsetWidth;
    tok.classList.add("shake");
  }

  // ---- 입력: 드래그 + 탭-탭(worldPlaceLab 2문법 계승 — 세로 인라인판) ----
  let drag: { id: string; ghost: HTMLElement } | null = null;
  let armed: string | null = null;

  function ghostFor(r: ContinentRegion): HTMLElement {
    const gEl = el("div", { class: "rpl-ghost", style: `background:${r.color}` , text: r.name });
    document.body.appendChild(gEl); // 스크롤 컨테이너 밖(fixed) — 지도 위로 자유 이동
    return gEl;
  }
  function moveGhost(x: number, y: number): void {
    if (!drag) return;
    drag.ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -120%)`;
  }

  function onDown(e: PointerEvent): void {
    const tokBtn = (e.target as HTMLElement).closest?.(".rpl-token") as HTMLElement | null;
    if (!tokBtn || tokBtn.classList.contains("done")) return;
    e.preventDefault();
    const id = tokBtn.dataset.r!;
    try {
      tray.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 포인터 안전(사고 7) */
    }
    const r = cont.regions.find((k) => k.id === id)!;
    drag = { id, ghost: ghostFor(r) };
    moveGhost(e.clientX, e.clientY);
    tokBtn.classList.add("lift");
    pillText.textContent = `${r.name} — ${r.hint}`;
    haptic(HAPTIC.tap);
  }
  function onMove(e: PointerEvent): void {
    if (!drag) return;
    moveGhost(e.clientX, e.clientY);
  }
  function onUp(e: PointerEvent): void {
    if (!drag) return;
    const { id, ghost } = drag;
    drag = null;
    ghost.remove();
    tokenEls.get(id)?.classList.remove("lift");
    const c = svgCoordOf(e.clientX, e.clientY);
    if (c) {
      judge(id, c.sx, c.sy);
    } else {
      // 지도 밖에서 놓음 = 탭으로 취급 → 무장 토글(선택 → 지도 탭 배치 경로)
      if (armed === id) disarm();
      else arm(id);
    }
  }
  function onCancel(): void {
    if (!drag) return;
    const { id, ghost } = drag;
    drag = null;
    ghost.remove();
    tokenEls.get(id)?.classList.remove("lift");
  }
  function arm(id: string): void {
    disarm();
    armed = id;
    const r = cont.regions.find((k) => k.id === id)!;
    tokenEls.get(id)!.classList.add("armed");
    pillText.textContent = `${r.name} 선택 — 지도에서 자리를 탭!`;
  }
  function disarm(): void {
    if (!armed) return;
    tokenEls.get(armed)!.classList.remove("armed");
    armed = null;
  }

  tray.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);

  // 지도 탭: 무장 배치 또는 콜드 탭 안내(첫 조작 무반응 방지 — worldPlaceLab 실기기 관행)
  mapBox.addEventListener("click", (e) => {
    const c = svgCoordOf((e as MouseEvent).clientX, (e as MouseEvent).clientY);
    if (!c) return;
    if (armed) {
      const id = armed;
      disarm();
      judge(id, c.sx, c.sy);
    } else if (!finished && !drag) {
      haptic(HAPTIC.tap);
      showToast("먼저 아래에서 지역 이름표를 골라 주세요 — 끌어 놓거나, 탭한 뒤 지도를 탭!");
    }
  });
  // 키보드 접근: 토큰에서 Enter/Space = click(detail 0) → 무장 토글
  tray.addEventListener("click", (e) => {
    if ((e as MouseEvent).detail !== 0) return;
    const tokBtn = (e.target as HTMLElement).closest?.(".rpl-token") as HTMLElement | null;
    if (!tokBtn || tokBtn.classList.contains("done")) return;
    const id = tokBtn.dataset.r!;
    if (armed === id) disarm();
    else arm(id);
  });

  api.setCTA(`${cont.regions.length}개 지역을 모두 배치해요`, { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    window.clearTimeout(toastTimer);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);
    drag?.ghost.remove();
  };
};

/** 지역색을 라벨용으로 어둡게(간단 감산). */
function darken(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number): number => Math.max(0, Math.round(v * 0.62));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function lensIco(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/><path d="M12 12h0M2 10l2 1M22 10l-2 1"/>
  </svg>`;
}
