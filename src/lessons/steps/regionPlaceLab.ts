// regionPlaceLab — 대륙 지역 구분 배치 랩(사회 Ⅱ 기함, Ⅲ~Ⅵ 재사용 문법).
//   · worldPlaceLab의 배치 문법(드래그+탭-탭 2문법·근접 스냅·오답 코미디)을 계승.
//   · 대륙 데이터는 ui/continentMap.ts의 CONTINENTS[continent] — 아시아 전용 하드코딩 없음.
//     지역 폴리곤(러프 국경)·앵커·대표 도시·힌트 아이콘이 전부 파라미터다.
//   · **모드 2종**: 크롭이 세로에 알맞으면(아시아 1.83:1) 세로 인라인, `ContinentDef.wide`
//     (유럽 2.26:1 — 세로에선 지도가 납작)면 worldPlaceLab처럼 가로 모드(rotateStage)로 연다.
//     판정·연출은 두 모드가 같은 함수를 쓰고, 입력 배선과 레이아웃만 갈린다.
//   · 판정 순서: 목표 지역 안 → 근접 스냅(경계 3° 이내) → 바다 풍덩 → 다른 지역 오답 코미디
//     (동적 생성: 놓인 지역의 정체 + 목표 지역의 방위 안내) → 지역 밖 육지 안내(outsideMsg).
//   · "특징 안경" = 힌트 렌즈: 켜면 지역마다 연한 색과 특징 아이콘이 떠 스티커와 짝이 보인다.
// 목표: ① 첫 지역 배치 ② 특징 안경 써 보기 ③ 모든 지역 배치(라벨은 지역 수 동적).
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import { WORLD_LAND_PATH, climateAt } from "../../ui/worldMap.generated";
import {
  CONTINENTS, type ContinentDef, type ContinentRegion,
  lonToX, latToY, xToLon, yToLat, polyPath, pointInPoly, distToPoly,
} from "../../ui/continentMap";
import type { StepRenderer } from "../types";
import type { RotateStage } from "../../ui/rotateStage";

interface RegionPlaceStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
  continent?: string;
}

const SNAP_DEG = 3; // 경계 근접 스냅(도) — 러프 폴리곤의 오차를 흡수한다

/** 지역 수 → 순우리말 수관형사(목표 칩·완주 문구용 — "다섯 지역" 하드코딩이던 것을 동적으로). */
const KO_COUNT = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열"];
const koCount = (n: number): string => KO_COUNT[n] ?? String(n);
/** 받침 유무에 따른 은/는 — "아시아는"·"유럽은"(대륙 이름이 파라미터라 조사도 계산). */
const topicJosa = (w: string): string => {
  const code = w.charCodeAt(w.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return "는";
  return (code - 0xac00) % 28 ? "은" : "는";
};

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
  const isWide = !!cont.wide;
  // 라벨 스케일 — 크롭 폭이 대륙마다 달라(아시아 348 기준) svg px 고정 폰트가 화면에서
  // 제각각 커진다(유럽 244 크롭에서 도시·지역명 겹침 실사고). 뷰박스 폭 비례로 보정.
  const LS = crop.w / 348;
  const nameFs = (14 * LS).toFixed(1);
  const cityFs = (8.5 * LS).toFixed(1);
  const cityR = (2.6 * Math.max(LS, 0.75)).toFixed(2);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "first" } }, el("b", { text: "첫 지역" }), el("span", { text: "한 곳" })),
    el("div", { class: "pn-badge world", dataset: { g: "lens" } }, el("b", { text: "특징 안경" }), el("span", { text: "써 보기" })),
    el("div", { class: "pn-badge world", dataset: { g: "all" } }, el("b", { text: `${koCount(cont.regions.length)} 지역` }), el("span", { text: "모두 배치" })),
  );
  const helper = el("div", {
    class: "helper",
    html: `${cont.name}${topicJosa(cont.name)} 자연환경과 문화에 따라 <b>${cont.regions.length}개 지역</b>으로 나눠요. ${
      isWide
        ? "아래 버튼으로 <b>가로 화면</b>을 열고, <b>지역 이름표를 끌어서</b>(또는 탭한 뒤 지도를 탭) 알맞은 자리에 붙여 보세요. 막히면 <b>특징 안경</b>!"
        : "아래 <b>지역 이름표를 끌어서</b>(또는 탭한 뒤 지도를 탭) 알맞은 자리에 붙여 보세요. 막히면 <b>특징 안경</b>!"
    }`,
  });
  host.append(goalChips, helper);

  // ---- 목표 수집(모드 공용) ----
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
        `${cont.name}의 지역 지도가 완성됐어요! <b>자연환경과 문화</b>가 지역을 나누는 기준이었죠 — 이 ${koCount(cont.regions.length)} 조각이 앞으로 배울 모든 이야기의 무대예요.`;
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

  // ---- 보드 참조(활성 모드가 조립 시 할당 — 판정·연출 함수는 이 참조만 쓴다) ----
  let svgEl: SVGSVGElement | null = null;
  let marks: SVGGElement | null = null;
  let tokenEls = new Map<string, HTMLElement>();
  let pillText: HTMLElement | null = null;
  let toastEl: HTMLElement | null = null;
  let toastTimer = 0;
  let lensOn = false;
  let armed: string | null = null;

  function showToast(msg: string): void {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl?.classList.remove("show"), 3200);
  }
  function setPill(msg: string): void {
    if (pillText) pillText.textContent = msg;
  }

  /** 지도 svg 마크업(모드 공용) — 육지 클립·지역 채움·경계·힌트 아이콘·마커 레이어.
   *  oceanRegions(오세아니아)면 채움·경계를 육지 클립 없이 바다 위에 그린다 — 산호섬 지역은
   *  클립하면 채움이 안 보인다(교과서 지도도 바다 위 색면·글자로 도서 지역을 표시). */
  function mapSvgMarkup(): string {
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
    // 날짜 변경선(경도 180° = x 1000) — 오세아니아 정본 표기(미래엔 지도·생각열기 소재)
    // 라벨은 선 중간의 빈 바다(y 340 부근) — 상단은 rpl-pill이, 하단은 뉴질랜드 라벨이 있다(눈검수 2회 교정)
    const dateline = cont.dateline
      ? `<line x1="1000" y1="${crop.y}" x2="1000" y2="${crop.y + crop.h}" stroke="#D8484C" stroke-width="1.1" stroke-dasharray="5 4" opacity=".75"/>
        <text x="997" y="${Math.min(crop.y + crop.h - 6, 340)}" class="rpl-gratlab" text-anchor="end" style="fill:#B04046">날짜 변경선</text>`
      : "";
    const clip = cont.oceanRegions ? "" : ` clip-path="url(#rpl-landclip)"`;
    return `
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
      ${dateline}
      <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
      <g${clip}>${regionFills}</g>
      <g${clip}>${regionEdges}</g>
      <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.5)" stroke-width=".7" fill="none" fill-rule="evenodd"/>
      <g class="rpl-hints">${hintIcons}</g>
      <g class="rpl-marks"></g>
    </svg>`;
  }

  /** 트레이(안경 + 지역 이름표) 생성(모드 공용) — tokenEls를 새로 채운다. */
  function buildTray(): { tray: HTMLElement; lensBtn: HTMLElement } {
    const lensBtn = el(
      "button",
      { class: "rpl-lens", attrs: { type: "button", "aria-pressed": String(lensOn), "aria-label": "특징 안경 켜기 — 지역마다 특징 아이콘이 표시돼요" } },
      el("span", { class: "rpl-lens-ico", html: lensIco() }),
      el("span", { text: "특징 안경" }),
    );
    lensBtn.classList.toggle("on", lensOn);
    const tray = el("div", { class: "rpl-tray" }, lensBtn);
    tokenEls = new Map<string, HTMLElement>();
    for (const r of cont.regions) {
      const tok = el(
        "button",
        { class: "rpl-token", dataset: { r: r.id }, attrs: { type: "button", "aria-label": `${r.name} — ${r.hint}` } },
        el("span", { class: "rpl-token-ico", style: `background:${r.color}1F;color:${r.color}`, html: r.hintIcon }),
        el("span", { class: "rpl-token-name", text: r.name }),
      );
      if (placed.has(r.id)) {
        tok.classList.add("done");
        tok.setAttribute("disabled", "true");
      }
      tray.appendChild(tok);
      tokenEls.set(r.id, tok);
    }
    lensBtn.addEventListener("click", () => {
      lensOn = !lensOn;
      lensBtn.setAttribute("aria-pressed", String(lensOn));
      lensBtn.classList.toggle("on", lensOn);
      applyLens();
      haptic(HAPTIC.tap);
      if (lensOn) {
        collect("lens", "장착!");
        showToast("특징 안경 장착 — 지역마다 특징 아이콘이 떠올라요. 이름표의 아이콘과 짝을 맞춰 봐요!");
      }
    });
    return { tray, lensBtn };
  }

  /** 안경 상태를 현재 보드에 반영(재진입 복원 겸용). */
  function applyLens(): void {
    if (!svgEl) return;
    for (const r of cont.regions) {
      const hintG = svgEl.querySelector(`.rpl-hint[data-r="${r.id}"]`) as SVGGElement | null;
      hintG?.setAttribute("opacity", lensOn && !placed.has(r.id) ? "1" : "0");
      const fill = svgEl.querySelector(`.rpl-fill[data-r="${r.id}"]`) as SVGPathElement | null;
      if (!placed.has(r.id)) fill?.setAttribute("opacity", lensOn ? (cont.oceanRegions ? "0.16" : "0.2") : "0");
    }
  }

  // ---- 판정·연출(모드 공용) ----
  // 순서(기본): 목표 pip → 스냅 → 바다 풍덩 → 타 지역 코미디 → outsideMsg.
  // oceanRegions(오세아니아)는 "타 지역 코미디 → 바다"로 뒤집는다 — 도서 지역은 정답 자리도
  // 바다라 풍덩이 먼저면 피드백이 전부 풍덩이 되고 방위 안내(코미디)가 죽는다. 좌표는 언랩
  // 경도 그대로(climateAt 내부 wrap) — dirWord도 언랩이어야 날짜변경선 건너 방위가 옳다.
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
    const dropped = cont.oceanRegions ? cont.regions.find((r) => pointInPoly(lon, lat, r.poly)) : undefined;
    if (dropped) {
      comedy(dropped, target, regionId);
      return;
    }
    if (climateAt(lon, lat) === 0) {
      haptic(HAPTIC.wrong);
      splashAt(sx, sy);
      showToast(cont.seaMsg ?? "풍덩! 바다에 빠졌어요 — 육지에 붙여 주세요.");
      return;
    }
    const droppedLand = cont.oceanRegions ? undefined : cont.regions.find((r) => pointInPoly(lon, lat, r.poly));
    if (droppedLand) {
      comedy(droppedLand, target, regionId);
      return;
    }
    haptic(HAPTIC.wrong);
    shakeToken(tokenEls.get(regionId));
    showToast(cont.outsideMsg(lon, lat));
  }

  function comedy(dropped: ContinentRegion, target: ContinentRegion, regionId: string): void {
    haptic(HAPTIC.wrong);
    shakeToken(tokenEls.get(regionId));
    const dir = dirWord(dropped.anchor[0], dropped.anchor[1], target.anchor[0], target.anchor[1]);
    // 지역명 조사도 계산(topicJosa) — "동아시아은"으로 깨지던 하드코딩을 소급 교정.
    showToast(`여긴 ${dropped.name} — ${dropped.trait} 땅이에요. ${target.name}${topicJosa(target.name)} 여기서 ${dir}!`);
  }

  /** 지역 채움·도장(라벨+도시)을 그린다 — settle과 재진입 복원이 공용. */
  function paintRegion(r: ContinentRegion): void {
    if (!svgEl || !marks) return;
    // 바다 위 비클립 채움(oceanRegions)은 0.5가 무거워 한 단계 연하게
    const fill = svgEl.querySelector(`.rpl-fill[data-r="${r.id}"]`) as SVGPathElement | null;
    fill?.setAttribute("opacity", cont.oceanRegions ? "0.38" : "0.5");
    const hintG = svgEl.querySelector(`.rpl-hint[data-r="${r.id}"]`) as SVGGElement | null;
    hintG?.setAttribute("opacity", "0");
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "rpl-mark");
    const ax = lonToX(r.anchor[0]);
    const ay = latToY(r.anchor[1]);
    const cityDots = r.cities
      .map((c) => {
        const cx = lonToX(c.lon).toFixed(1);
        const cy = latToY(c.lat).toFixed(1);
        return `<circle cx="${cx}" cy="${cy}" r="${cityR}" fill="#FFFFFF" stroke="${darken(r.color)}" stroke-width="${(1.6 * Math.max(LS, 0.75)).toFixed(2)}"/>
          <text x="${cx}" y="${(latToY(c.lat) + (-4.4 + (c.labelDy ?? 0)) * LS).toFixed(1)}" class="rpl-city" style="font-size:${cityFs}px">${c.name}</text>`;
      })
      .join("");
    g.innerHTML = `
      <g class="rpl-regname">
        <text x="${ax.toFixed(1)}" y="${(ay + 4 * LS).toFixed(1)}" class="rpl-name-stroke" style="font-size:${nameFs}px">${r.name}</text>
        <text x="${ax.toFixed(1)}" y="${(ay + 4 * LS).toFixed(1)}" class="rpl-name" fill="${darken(r.color)}" style="font-size:${nameFs}px">${r.name}</text>
      </g>
      ${cityDots}`;
    marks.appendChild(g);
    const tok = tokenEls.get(r.id);
    tok?.classList.add("done");
    tok?.setAttribute("disabled", "true");
  }

  function settle(r: ContinentRegion): void {
    placed.add(r.id);
    haptic(HAPTIC.correct);
    paintRegion(r);
    setPill(`${r.name} 배치! (${placed.size}/${cont.regions.length})`);
    showToast(r.success);
    collect("first", "성공!");
    if (placed.size >= cont.regions.length) {
      collect("all", "완료!");
      setPill(`${cont.regions.length}개 지역 완성!`);
    }
  }

  function splashAt(sx: number, sy: number): void {
    if (!marks) return;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "rpl-splash");
    g.setAttribute("transform", `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
    g.innerHTML = `<circle r="3.5" fill="none" stroke="#4E9AE8" stroke-width="2"/><circle r="8" fill="none" stroke="#4E9AE8" stroke-width="1.4" opacity=".6"/>`;
    marks.appendChild(g);
    later(() => g.remove(), 700);
  }

  function shakeToken(tok: HTMLElement | undefined): void {
    if (!tok) return;
    tok.classList.remove("shake");
    void tok.offsetWidth;
    tok.classList.add("shake");
  }

  function arm(id: string): void {
    disarm();
    armed = id;
    const r = cont.regions.find((k) => k.id === id)!;
    tokenEls.get(id)?.classList.add("armed");
    setPill(`${r.name} 선택 — 지도에서 자리를 탭!`);
  }
  function disarm(): void {
    if (!armed) return;
    tokenEls.get(armed)?.classList.remove("armed");
    armed = null;
  }

  api.setCTA(`${cont.regions.length}개 지역을 모두 배치해요`, { enabled: false });

  /* ══════════════════ 세로 인라인 모드(아시아) ══════════════════ */
  if (!isWide) {
    const mapBox = el("div", { class: "rpl-map" });
    mapBox.innerHTML = mapSvgMarkup();
    svgEl = mapBox.querySelector(".rpl-svg") as SVGSVGElement;
    marks = mapBox.querySelector(".rpl-marks") as SVGGElement;

    const pillTxt = el("span", { text: "이름표를 끌어 지역 자리에 놓아요" });
    const pill = el("div", { class: "pill rpl-pill" }, el("span", { class: "pdot", style: "background:#E8590C" }), pillTxt);
    const toast = el("div", { class: "rpl-toast" });
    const stage = el("div", { class: "rpl-stage" }, mapBox, pill, toast);
    pillText = pillTxt;
    toastEl = toast;

    const { tray } = buildTray();
    host.append(stage, tray);
    if (s.curio) host.appendChild(curioCard(s.curio));

    function svgCoordOf(clientX: number, clientY: number): { sx: number; sy: number } | null {
      const r = svgEl!.getBoundingClientRect();
      if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return null;
      return {
        sx: crop.x + ((clientX - r.left) / r.width) * crop.w,
        sy: crop.y + ((clientY - r.top) / r.height) * crop.h,
      };
    }

    // ---- 입력: 드래그 + 탭-탭(고스트는 스크롤 컨테이너 밖 fixed) ----
    let drag: { id: string; ghost: HTMLElement } | null = null;

    function ghostFor(r: ContinentRegion): HTMLElement {
      const gEl = el("div", { class: "rpl-ghost", style: `background:${r.color}`, text: r.name });
      document.body.appendChild(gEl);
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
      setPill(`${r.name} — ${r.hint}`);
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

    return () => {
      for (const t of timers) window.clearTimeout(t);
      window.clearTimeout(toastTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      drag?.ghost.remove();
    };
  }

  /* ══════════════════ 가로 모드(wide 대륙 — 유럽) ══════════════════ */
  const preview = el(
    "div",
    { class: "sp3-enter" },
    el("div", { class: "sp3-enter-art", html: contPreviewArt(cont) }),
    el("div", { class: "sp3-enter-txt", html: `넓은 ${cont.name} 지도를 크게 펼쳐 <b>${cont.regions.length}개 지역</b>을 붙여요.<br>화면이 자동으로 <b>가로</b>로 돌아가요.` }),
  );
  const enterBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 지도 펼치기" }));
  host.append(preview, enterBtn);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let rot: RotateStage | null = null;
  let disposed = false;

  function enter(): void {
    if (rot) return;
    haptic(HAPTIC.select);
    void (async () => {
      try {
        const { enterRotateStage } = await import("../../ui/rotateStage");
        if (disposed) return;
        rot = enterRotateStage({ title: `${cont.name} 조립하기 — ${koCount(cont.regions.length)} 지역 붙이기`, onLeave: () => leaveStage() });
        buildStage(rot);
      } catch {
        // 개발 서버 스테일 캐시 등으로 동적 import가 실패하면 버튼이 조용히 죽는다 — 안내로 살린다
        helper.innerHTML = "화면을 여는 데 실패했어요. <b>새로고침</b> 후 다시 눌러 주세요!";
      }
    })();
  }
  function leaveStage(): void {
    rot?.dispose();
    rot = null;
    svgEl = null;
    marks = null;
    toastEl = null;
    pillText = null;
    armed = null;
  }
  enterBtn.addEventListener("click", enter);

  function buildStage(rt: RotateStage): void {
    const stage = rt.stage;
    stage.classList.add("rpl-stage-wide");

    const mapBox = el("div", { class: "rpl-map" });
    mapBox.innerHTML = mapSvgMarkup();
    svgEl = mapBox.querySelector(".rpl-svg") as SVGSVGElement;
    marks = mapBox.querySelector(".rpl-marks") as SVGGElement;

    const pillTxt = el("span", { text: "이름표를 끌어(또는 탭 → 지도 탭) 지역 자리에 놓아요" });
    const pill = el("div", { class: "pill sp3-pill wpl-pill" }, el("span", { class: "pdot", style: "background:#E8590C" }), pillTxt);
    const toast = el("div", { class: "sp3-toast wpl-toast" });
    pillText = pillTxt;
    toastEl = toast;

    const { tray } = buildTray();
    stage.append(mapBox, pill, toast, tray);

    // 재진입 복원 — 이미 배치한 지역의 채움·도장·비활성 토큰, 안경 상태
    for (const r of cont.regions) if (placed.has(r.id)) paintRegion(r);
    applyLens();
    if (placed.size > 0) setPill(`${placed.size}/${cont.regions.length} 지역 배치됨 — 이어서 붙여요`);

    // ---- 레이아웃(rAF 없이 — resize 때만) ----
    const aspect = crop.w / crop.h;
    function layout(): void {
      const { w, h } = rt.size();
      const trayH = 78;
      const topPad = 42; // rot-title·pill 아래부터 지도
      const mapH = Math.min(h - trayH - topPad - 6, (w - 12) / aspect);
      const mapW = mapH * aspect;
      mapBox.style.width = `${mapW}px`;
      mapBox.style.height = `${mapH}px`;
      mapBox.style.left = `${(w - mapW) / 2}px`;
      mapBox.style.top = `${topPad}px`;
    }
    layout();
    window.addEventListener("resize", layout);
    const ro = new ResizeObserver(layout);
    ro.observe(stage);

    // 논리 좌표(rotateStage.mapPoint) → 지도 svg 좌표
    function svgCoordOf(x: number, y: number): { sx: number; sy: number } | null {
      const left = parseFloat(mapBox.style.left) || 0;
      const top = parseFloat(mapBox.style.top) || 0;
      const w = parseFloat(mapBox.style.width) || 1;
      const h = parseFloat(mapBox.style.height) || 1;
      if (x < left || x > left + w || y < top || y > top + h) return null;
      return { sx: crop.x + ((x - left) / w) * crop.w, sy: crop.y + ((y - top) / h) * crop.h };
    }

    // ---- 입력: 드래그 + 탭-탭(고스트는 회전 무대 안 absolute — 글자도 함께 돈다) ----
    let drag: { id: string; ghost: HTMLElement } | null = null;

    function ghostFor(r: ContinentRegion): HTMLElement {
      const gEl = el("div", { class: "rpl-ghost in-stage", style: `background:${r.color}`, text: r.name });
      stage.appendChild(gEl);
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
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 포인터 안전(사고 7) */
      }
      const r = cont.regions.find((k) => k.id === id)!;
      drag = { id, ghost: ghostFor(r) };
      const p = rt.mapPoint(e);
      moveGhost(p.x, p.y);
      tokBtn.classList.add("lift");
      setPill(`${r.name} — ${r.hint}`);
      haptic(HAPTIC.tap);
    }
    function onMove(e: PointerEvent): void {
      if (!drag) return;
      const p = rt.mapPoint(e);
      moveGhost(p.x, p.y);
    }
    function onUp(e: PointerEvent): void {
      if (!drag) {
        // 무장 탭-탭 배치 + 콜드 탭 안내(버튼 위 탭은 제외)
        if (!(e.target as HTMLElement).closest?.("button")) {
          const p = rt.mapPoint(e);
          const c = svgCoordOf(p.x, p.y);
          if (c && armed) {
            const id = armed;
            disarm();
            judge(id, c.sx, c.sy);
          } else if (c && !finished) {
            haptic(HAPTIC.tap);
            showToast("먼저 아래에서 지역 이름표를 골라 주세요 — 끌어 놓거나, 탭한 뒤 지도를 탭!");
          }
        }
        return;
      }
      const { id, ghost } = drag;
      drag = null;
      ghost.remove();
      tokenEls.get(id)?.classList.remove("lift");
      const p = rt.mapPoint(e);
      const c = svgCoordOf(p.x, p.y);
      if (c) {
        judge(id, c.sx, c.sy);
      } else {
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

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onCancel);
    // 키보드 접근: 토큰 버튼에서 Enter/Space = click(detail 0) → 무장 토글
    tray.addEventListener("click", (e) => {
      if ((e as MouseEvent).detail !== 0) return;
      const tokBtn = (e.target as HTMLElement).closest?.(".rpl-token") as HTMLElement | null;
      if (!tokBtn || tokBtn.classList.contains("done")) return;
      const id = tokBtn.dataset.r!;
      if (armed === id) disarm();
      else arm(id);
    });

    // 정리 — rotateStage dispose와 함께(가로 랩 leave 관행)
    const origDispose = rt.dispose.bind(rt);
    rt.dispose = () => {
      window.removeEventListener("resize", layout);
      ro.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onCancel);
      drag?.ghost.remove();
      origDispose();
    };
  }

  return () => {
    disposed = true;
    for (const t of timers) window.clearTimeout(t);
    window.clearTimeout(toastTimer);
    leaveStage();
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

/** 세로 진입 카드 미니 지도 — 대륙 크롭을 지역색과 함께 미리 보여준다(worldPlaceLab 문법). */
function contPreviewArt(cont: ContinentDef): string {
  const fills = cont.regions
    .map((r) => `<path d="${polyPath(r.poly)}" fill="${r.color}" opacity=".35"/>`)
    .join("");
  return `<svg viewBox="${cont.crop.x} ${cont.crop.y} ${cont.crop.w} ${cont.crop.h}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:100%;border-radius:14px;background:#CFE7F5">
    <defs><clipPath id="rpl-pvclip"><path d="${WORLD_LAND_PATH}" fill-rule="evenodd"/></clipPath></defs>
    <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd" stroke="rgba(74,88,110,.45)" stroke-width=".8"/>
    <g clip-path="url(#rpl-pvclip)">${fills}</g>
  </svg>`;
}
