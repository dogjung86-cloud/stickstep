// tableLinkLab — 식탁 연결 랩(사회 Ⅰ L4). 아침 밥상의 접시 셋을 탭해 재료의 출발지를
// 동심원 링(우리 동네→우리나라→세계) 위에서 확인한다 — "공간적 상호 작용은 다양한 규모로
// 일어난다"(미래엔 14~15쪽)의 체험판. 한 밥상 = 3 km·200 km·8,000 km 세 겹의 연결.
//   · rAF 없음 — 여정 점선은 스포크 안 <mask> 선의 stroke-dashoffset CSS 전환(0.9s)으로
//     그려지고, 링 점등·거리 라벨 팝·피날레 반짝임 전부 CSS 클래스 토글로만 움직인다.
//   · 접시 탭(Enter/Space 동일) → 출발지 퍽→접시 점선 여정 + 해당 링 점등 + 거리 라벨 팝.
//     이미 확인한 접시 재탭 = 연출만 재생(base 상태 transition:none이라 리셋은 즉시).
//   · 목표 3개(동네·나라·세계 연결) 모두 → 세 링 동시 반짝(피날레) + 결론 + CTA.
// 기하 상수: C=(180,206), 밥상 r50, 링 r 86/122/158 — 여정 길이 비(짧음→긺)가 곧 규모다.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface TableLinkStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const CX = 180;
const CY = 206;

interface DishDef {
  id: "dong" | "nara" | "segye";
  dish: string; // 접시 이름
  chip: string; // 목표 칩 제목
  sub0: string; // 칩 초기 서브(접시 이름)
  sub1: string; // 칩 달성 서브(거리)
  dist: string; // 거리 라벨 필 문구
  color: string; // 링·여정 발광색
  ring: number; // 링 반지름
  ringName: string; // 링 이름 라벨
  ringLabW: number; // 링 이름 필 폭
  px: number; py: number; // 접시 중심
  ox: number; oy: number; // 출발지 퍽 중심(자기 링 위)
  lx: number; ly: number; lw: number; // 거리 라벨 필 중심·폭
  bow: number; // 여정 곡률(부호 = 휘는 쪽 — 라벨·밥상과 안 겹치게 손검산한 값)
  aria: string;
  found: string; // 첫 확인 시 helper 문구
}

const DISHES: DishDef[] = [
  {
    id: "dong", dish: "부추전", chip: "동네 연결", sub0: "부추전", sub1: "3 km!", dist: "약 3 km",
    color: "#6BDA96", ring: 86, ringName: "우리 동네", ringLabW: 68,
    px: 159, py: 191, ox: 109, oy: 157, lx: 109, ly: 185, lw: 58, bow: -9,
    aria: "부추전 접시. 탭하면 재료가 온 길이 그려져요.",
    found: "부추전의 부추는 <b>우리 동네 텃밭</b>에서 약 3 km — 자전거로도 닿는 가장 가까운 연결이에요!",
  },
  {
    id: "nara", dish: "삶은 달걀", chip: "나라 연결", sub0: "달걀", sub1: "200 km!", dist: "약 200 km",
    color: "#FFC24D", ring: 122, ringName: "우리나라", ringLabW: 62,
    px: 201, py: 191, ox: 280, oy: 137, lx: 294, ly: 165, lw: 72, bow: 14,
    aria: "삶은 달걀 접시. 탭하면 재료가 온 길이 그려져요.",
    found: "달걀은 <b>우리나라</b> 전북의 농장에서 약 200 km — 트럭이 고속도로를 달려 가져왔어요.",
  },
  {
    id: "segye", dish: "연어 구이", chip: "세계 연결", sub0: "연어", sub1: "8,000 km!", dist: "약 8,000 km",
    color: "#7EC8FF", ring: 158, ringName: "세계", ringLabW: 40,
    px: 180, py: 232, ox: 180, oy: 364, lx: 240, ly: 364, lw: 84, bow: 20,
    aria: "연어 구이 접시. 탭하면 재료가 온 길이 그려져요.",
    found: "연어는 지구 반대편 <b>노르웨이</b>에서 약 8,000 km — 비행기로 바다를 건너 왔어요!",
  },
];

const FINALE_HTML =
  "한 밥상 위에 동네 3 km, 우리나라 200 km, 세계 8,000 km — <b>연결에는 크기(규모)가 있어요</b>. " +
  "작은 동네부터 지구 전체까지, 우리는 겹겹의 연결 속에 살아요!";

// ── 여정 경로(출발지 퍽 중심 → 접시 중심, 살짝 휜 2차 곡선 — 양끝은 퍽/접시가 덮는다) ──
function journeyPath(d: DishDef): string {
  const dx = d.px - d.ox;
  const dy = d.py - d.oy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const mx = (d.ox + d.px) / 2 - uy * d.bow;
  const my = (d.oy + d.py) / 2 + ux * d.bow;
  return `M${d.ox} ${d.oy} Q${mx.toFixed(1)} ${my.toFixed(1)} ${d.px} ${d.py}`;
}

// ── 접시 위 음식(파운드리 문법 — 3스톱 그라데이션+키라이트+접촉 그림자+재질별 최암색 선) ──
function jeonArt(x: number, y: number): string {
  return `
    <circle cx="${x}" cy="${y}" r="11.5" fill="url(#tll-jeon)"/>
    <circle cx="${x}" cy="${y}" r="11.5" stroke="#47701F" stroke-width="1.2"/>
    <circle cx="${x + 4}" cy="${y + 3}" r="2.2" fill="#C99C3F" opacity=".85"/>
    <circle cx="${x - 5}" cy="${y + 4.5}" r="1.7" fill="#C99C3F" opacity=".8"/>
    <circle cx="${x + 1}" cy="${y - 5}" r="1.6" fill="#C99C3F" opacity=".7"/>
    <path d="M${x - 6} ${y - 1}l3.6-1.6M${x + 1} ${y + 4}l3.4 1.2M${x - 2} ${y + 6.5}l3-1M${x + 4.5} ${y - 3.5}l2.8 1.4"
      stroke="#2F5214" stroke-width="1.4" stroke-linecap="round"/>
    <ellipse cx="${x - 3.5}" cy="${y - 4}" rx="4.5" ry="2.6" fill="#FFFFFF" opacity=".22"/>`;
}

function eggArt(x: number, y: number): string {
  const half = (hx: number, hy: number, rot: number): string => `
    <g transform="rotate(${rot} ${hx} ${hy})">
      <ellipse cx="${hx}" cy="${hy + 7.2}" rx="4.8" ry="1.5" fill="rgba(120,90,30,.25)"/>
      <ellipse cx="${hx}" cy="${hy}" rx="6" ry="8.4" fill="url(#tll-eggw)"/>
      <ellipse cx="${hx}" cy="${hy}" rx="6" ry="8.4" stroke="#CFC5A2" stroke-width="1.1"/>
      <circle cx="${hx}" cy="${hy - .4}" r="3.4" fill="url(#tll-yolk)"/>
      <circle cx="${hx}" cy="${hy - .4}" r="3.4" stroke="#C67C0C" stroke-width=".8" opacity=".7"/>
      <circle cx="${hx - 1.2}" cy="${hy - 1.7}" r=".9" fill="#FFE9AE" opacity=".9"/>
    </g>`;
  return half(x - 5.4, y - .4, -12) + half(x + 5.4, y + .8, 10);
}

function salmonArt(x: number, y: number): string {
  return `
    <ellipse cx="${x}" cy="${y + 6.8}" rx="11.5" ry="2.3" fill="rgba(120,60,18,.3)"/>
    <rect x="${x - 13}" y="${y - 7.5}" width="26" height="15" rx="6" fill="url(#tll-salmon)"/>
    <rect x="${x - 13}" y="${y - 7.5}" width="26" height="15" rx="6" stroke="#A8451A" stroke-width="1.2"/>
    <path d="M${x - 7} ${y - 7.2}q2.4 7.2 0 14.4M${x - 1} ${y - 7.4}q2.6 7.4 0 14.8M${x + 5.5} ${y - 7}q2.2 7 0 14"
      stroke="#FFD9BC" stroke-width="1.5" opacity=".6" fill="none"/>
    <path d="M${x - 10} ${y + 5}l4.5-8.6M${x + 7.5} ${y + 5.5}l3.5-7"
      stroke="#8E3610" stroke-width="1.3" stroke-linecap="round" opacity=".45"/>
    <ellipse cx="${x - 6}" cy="${y - 4.6}" rx="4.6" ry="1.8" fill="#FFFFFF" opacity=".28"/>`;
}

// ── 출발지 미니 아이콘(24×24 박스 — 퍽 중심 기준 translate) ──
function gardenArt(x: number, y: number): string {
  return `<g transform="translate(${x - 12} ${y - 12})">
    <rect x="3" y="12.5" width="18" height="7.5" rx="2.4" fill="url(#tll-soil)"/>
    <rect x="3" y="12.5" width="18" height="7.5" rx="2.4" stroke="#3E2A12" stroke-width="1.1"/>
    <path d="M6 15.2h12M6 17.6h12" stroke="#3E2A12" stroke-width=".9" opacity=".45"/>
    <path d="M7 12.5V9.7M7 9.7C6 9.4 5.3 8.7 5 7.7M7 9.7c1-.3 1.7-1 2-2M12 12.5V9.1m0 0c-1-.3-1.8-1-2.1-2.1M12 9.1c1-.3 1.8-1 2.1-2.1M17 12.5V9.7m0 0c-1-.3-1.7-1-2-2M17 9.7c1-.3 1.7-1 2-2"
      stroke="#6BC24D" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  </g>`;
}

function barnArt(x: number, y: number): string {
  return `<g transform="translate(${x - 12} ${y - 12})">
    <path d="M12 4.2 3.6 11.2h16.8Z" fill="url(#tll-roof)"/>
    <path d="M12 4.2 3.6 11.2h16.8Z" stroke="#565E70" stroke-width="1.1" stroke-linejoin="round"/>
    <rect x="5.6" y="11.2" width="12.8" height="8.6" fill="url(#tll-barn)"/>
    <rect x="5.6" y="11.2" width="12.8" height="8.6" stroke="#7E2A18" stroke-width="1.1"/>
    <rect x="9.6" y="13.6" width="4.8" height="6.2" rx=".8" fill="#F5EFE2" stroke="#7E2A18" stroke-width="1"/>
    <path d="M9.6 13.6l4.8 6.2M14.4 13.6l-4.8 6.2" stroke="#C0563C" stroke-width=".9"/>
    <path d="M6.8 9.6 11 6.1" stroke="#C9CFDC" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>
  </g>`;
}

function planeArt(x: number, y: number): string {
  return `<g transform="translate(${x - 12} ${y - 12})">
    <path d="M12 2.8c1.15 0 1.85 1.5 1.85 3.3v3.1l7.15 4.4v2.4l-7.15-1.9v3.5l2.6 2v1.6l-4.45-1-4.45 1v-1.6l2.6-2v-3.5l-7.15 1.9v-2.4l7.15-4.4V6.1c0-1.8.7-3.3 1.85-3.3Z"
      fill="url(#tll-plane)" stroke="#7E93B8" stroke-width="1" stroke-linejoin="round"/>
    <circle cx="12" cy="5.7" r=".9" fill="#5E7BA8"/>
  </g>`;
}

// ── 조립 블록 ──
function ringSvg(d: DishDef): string {
  const ty = CY - d.ring; // 링 꼭대기(이름 필 자리)
  return `<g class="tll-ring" data-r="${d.id}">
    <circle class="tll-ring-glow" cx="${CX}" cy="${CY}" r="${d.ring}" stroke="${d.color}" stroke-width="7"/>
    <circle class="tll-ring-line" cx="${CX}" cy="${CY}" r="${d.ring}" stroke="${d.color}" stroke-width="1.8"
      stroke-dasharray="3 7" stroke-linecap="round"/>
    <g class="tll-ringlab">
      <rect x="${CX - d.ringLabW / 2}" y="${ty - 10}" width="${d.ringLabW}" height="20" rx="10"
        fill="rgba(15,26,48,.88)" stroke="rgba(136,158,196,.35)"/>
      <text x="${CX}" y="${ty + 4}" text-anchor="middle" class="tll-ringlab-t" fill="#D6E2F6">${d.ringName}</text>
    </g>
  </g>`;
}

function originSvg(d: DishDef): string {
  const icon = d.id === "dong" ? gardenArt(d.ox, d.oy) : d.id === "nara" ? barnArt(d.ox, d.oy) : planeArt(d.ox, d.oy);
  return `<g class="tll-origin">
    <circle cx="${d.ox}" cy="${d.oy}" r="16" fill="rgba(17,29,54,.94)"/>
    <circle cx="${d.ox}" cy="${d.oy}" r="16" stroke="${d.color}" stroke-width="1.6" opacity=".9"/>
    ${icon}
  </g>`;
}

function spokeSvg(d: DishDef): string {
  const path = journeyPath(d);
  return `<g class="tll-spoke" data-s="${d.id}">
    <mask id="tll-m-${d.id}" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="396">
      <path class="tll-mline" d="${path}" pathLength="100" stroke="#FFFFFF" stroke-width="14" fill="none"
        stroke-linecap="round" stroke-dasharray="100" stroke-dashoffset="100"/>
    </mask>
    <g class="tll-journey" mask="url(#tll-m-${d.id})">
      <path d="${path}" stroke="${d.color}" stroke-width="7.5" stroke-linecap="round" opacity=".3" fill="none"/>
      <path d="${path}" stroke="${d.color}" stroke-width="3.4" stroke-dasharray="1 7" stroke-linecap="round" fill="none"/>
    </g>
    ${originSvg(d)}
    <g class="tll-dlab">
      <rect x="${d.lx - d.lw / 2}" y="${d.ly - 11}" width="${d.lw}" height="22" rx="11"
        fill="rgba(15,26,48,.94)" stroke="${d.color}" stroke-width="1.4"/>
      <text x="${d.lx}" y="${d.ly + 4}" text-anchor="middle" class="tll-dlab-t" fill="#FFFFFF">${d.dist}</text>
    </g>
  </g>`;
}

function plateSvg(d: DishDef): string {
  const food = d.id === "dong" ? jeonArt(d.px, d.py) : d.id === "nara" ? eggArt(d.px, d.py) : salmonArt(d.px, d.py);
  return `<g class="tll-plate" data-p="${d.id}" role="button" tabindex="0" aria-label="${d.aria}">
    <ellipse cx="${d.px}" cy="${d.py + 2.5}" rx="19.5" ry="18" fill="rgba(52,26,4,.35)"/>
    <circle cx="${d.px}" cy="${d.py}" r="18" fill="url(#tll-plate)"/>
    <circle class="tll-plate-rim" cx="${d.px}" cy="${d.py}" r="18" stroke="#B9C4D4" stroke-width="1.3"/>
    <circle cx="${d.px}" cy="${d.py}" r="13.2" stroke="#CBD4E0" stroke-width="1" opacity=".85"/>
    ${food}
    <circle cx="${d.px}" cy="${d.py}" r="24" fill="transparent"/>
  </g>`;
}

function tableSvg(): string {
  return `
    <ellipse cx="${CX}" cy="${CY + 5}" rx="53" ry="50" fill="#000000" opacity=".32"/>
    <circle cx="${CX}" cy="${CY}" r="50" fill="url(#tll-wood)"/>
    <circle cx="${CX}" cy="${CY}" r="42" stroke="#7E4F20" stroke-width="1" opacity=".5" fill="none"/>
    <circle cx="${CX}" cy="${CY}" r="33" stroke="#7E4F20" stroke-width="1" opacity=".35" fill="none"/>
    <circle cx="${CX}" cy="${CY}" r="50" stroke="#6B421A" stroke-width="1.6" fill="none"/>
    <path d="M${CX - 30} ${CY - 34}a46 46 0 0 1 26-10" stroke="#F2D4A8" stroke-width="4"
      stroke-linecap="round" opacity=".45" fill="none"/>`;
}

// 피날레 스파클 — 링 위 여덟 점(좌표는 링 반지름으로 손검산, 뷰박스 안)
const SPARKS: [number, number, number][] = [
  [241, 145, 0], [119, 267, .5], [94, 120, .2], [266, 292, .65],
  [259, 69, .35], [32, 260, .15], [328, 260, .8], [138, 321, .45],
];

function buildScene(): string {
  const stars = [
    [40, 72, 1.3, .3], [322, 58, 1.1, .22], [26, 318, 1.2, .25],
    [336, 300, 1.4, .26], [48, 368, 1, .2], [318, 372, 1.1, .22],
  ] as const;
  return `<svg class="tll-svg" viewBox="0 0 360 396" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="tll-wood" cx=".38" cy=".32" r=".85">
        <stop offset="0" stop-color="#D9A76C"/><stop offset=".55" stop-color="#B67F42"/><stop offset="1" stop-color="#8E5D2A"/>
      </radialGradient>
      <radialGradient id="tll-plate" cx=".4" cy=".34" r=".8">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset=".62" stop-color="#EEF2F7"/><stop offset="1" stop-color="#D5DDE8"/>
      </radialGradient>
      <radialGradient id="tll-jeon" cx=".4" cy=".35" r=".8">
        <stop offset="0" stop-color="#A8CE6A"/><stop offset=".6" stop-color="#7FAE44"/><stop offset="1" stop-color="#5E8C2E"/>
      </radialGradient>
      <radialGradient id="tll-eggw" cx=".42" cy=".32" r=".85">
        <stop offset="0" stop-color="#FFFEF8"/><stop offset=".6" stop-color="#FBF4DE"/><stop offset="1" stop-color="#EDE2C0"/>
      </radialGradient>
      <radialGradient id="tll-yolk" cx=".38" cy=".32" r=".85">
        <stop offset="0" stop-color="#FFD97A"/><stop offset=".6" stop-color="#F5AE3C"/><stop offset="1" stop-color="#D8880F"/>
      </radialGradient>
      <linearGradient id="tll-salmon" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FF9E66"/><stop offset=".55" stop-color="#F0703C"/><stop offset="1" stop-color="#C6511F"/>
      </linearGradient>
      <linearGradient id="tll-soil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8A5C34"/><stop offset=".55" stop-color="#6E4524"/><stop offset="1" stop-color="#523018"/>
      </linearGradient>
      <linearGradient id="tll-barn" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#D26A4A"/><stop offset=".55" stop-color="#B04226"/><stop offset="1" stop-color="#8E2F18"/>
      </linearGradient>
      <linearGradient id="tll-roof" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#B8BFCC"/><stop offset=".55" stop-color="#99A1B2"/><stop offset="1" stop-color="#788196"/>
      </linearGradient>
      <linearGradient id="tll-plane" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F4F8FF"/><stop offset=".55" stop-color="#DCE6F4"/><stop offset="1" stop-color="#B8C6DC"/>
      </linearGradient>
    </defs>
    ${stars.map(([x, y, r, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#CBDCF6" opacity="${o}"/>`).join("")}
    ${ringSvg(DISHES[2])}${ringSvg(DISHES[1])}${ringSvg(DISHES[0])}
    ${tableSvg()}
    ${DISHES.map(spokeSvg).join("")}
    ${DISHES.map(plateSvg).join("")}
    ${SPARKS.map(([x, y, d]) => `<g transform="translate(${x} ${y})"><path class="tll-spark" style="--d:${d}s"
      d="M0 -5.5L1.5 -1.5 5.5 0 1.5 1.5 0 5.5 -1.5 1.5 -5.5 0 -1.5 -1.5Z" fill="#FFEBAE"/></g>`).join("")}
  </svg>`;
}

export const tableLinkLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TableLinkStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    ...DISHES.map((d) =>
      el("div", { class: "pn-badge world", dataset: { g: d.id } }, el("b", { text: d.chip }), el("span", { text: d.sub0 })),
    ),
  );
  const helper = el("div", {
    class: "helper",
    html: "오늘 아침 밥상이에요. <b>접시 세 개를 하나씩 탭</b>해서 재료가 어디서 왔는지 확인해 보세요 — 연결의 <b>규모</b>가 링으로 켜져요!",
  });
  const stage = el("div", { class: "stage tll-stage" });
  stage.innerHTML = buildScene();
  host.append(goalChips, helper, stage); // 지시(helper)는 조작 요소 위
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector(".tll-svg") as SVGSVGElement;
  const goals = new Set<string>();
  let finished = false;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };

  function collect(d: DishDef): void {
    const chip = goalChips.querySelector(`[data-g="${d.id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = d.sub1;
    haptic(HAPTIC.correct);
    if (!finished) helper.innerHTML = d.found;
    if (goals.size === 3 && !finished) {
      finished = true;
      later(() => {
        svg.classList.add("finale");
        haptic(HAPTIC.done);
        helper.innerHTML = FINALE_HTML;
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "개념 정리하기");
        later(() => svg.classList.remove("finale"), 3400);
      }, 950);
    }
  }

  function play(id: string): void {
    const d = DISHES.find((k) => k.id === id);
    if (!d) return;
    const spoke = svg.querySelector(`.tll-spoke[data-s="${id}"]`) as SVGGElement;
    const ring = svg.querySelector(`.tll-ring[data-r="${id}"]`) as SVGGElement;
    const plate = svg.querySelector(`.tll-plate[data-p="${id}"]`) as SVGGElement;
    const firstTime = !goals.has(id);
    // 리셋 → 재생: base 상태가 transition:none이라 제거는 즉시, 리플로 후 .go로 다시 그린다
    spoke.classList.remove("go");
    plate.classList.remove("hit");
    ring.classList.remove("flash");
    void stage.offsetWidth;
    spoke.classList.add("go");
    plate.classList.add("hit");
    later(() => plate.classList.remove("hit"), 550);
    haptic(HAPTIC.tap);
    if (firstTime) {
      goals.add(id);
      ring.classList.add("on");
      later(() => collect(d), 720); // 여정이 접시에 닿을 무렵 확인 처리
    } else {
      ring.classList.add("flash");
      later(() => ring.classList.remove("flash"), 900);
      if (!finished) helper.innerHTML = d.found;
    }
  }

  const onTap = (e: Event): void => {
    const g = (e.target as Element).closest?.(".tll-plate");
    if (!g) return;
    play(g.getAttribute("data-p") || "");
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const g = (e.target as Element).closest?.(".tll-plate");
    if (!g) return;
    e.preventDefault();
    play(g.getAttribute("data-p") || "");
  };
  svg.addEventListener("click", onTap);
  svg.addEventListener("keydown", onKey);

  api.setCTA("세 접시를 모두 확인해요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
