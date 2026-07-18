// 홈 리디자인(2026-07-14 목업 확정)의 SVG 조립 — 밑창(장화) 스텝 노드·발자국 도장·스틱맨 워커.
// 스펙 정본: design/README.md("확정된 방향"+탐색 1~7차), 좌표·수치는 design/home-redesign-mockup-v2.html 실측 이식.
// 노드 발끝은 진행 방향(아래) — 위를 향하면 느낌표(!)로 읽힌다. 맨발가락형 금지(장화 밑창 = 장화 레벨 세계관).
import { icon } from "../core/icons";

/** 단원 테마 원색 — ui.css/math*.css의 .gm-path-done.X 스트로크와 같은 값(열림 면·펄스·완료 체크가 공유). */
const THEME_INK: Record<string, string> = {
  bio: "#12B886", heat: "#FF6B4A", matter: "#7C6BFF", force: "#F0A422", gas: "#1FB6D4", space: "#4A54E1",
  chem: "#E64980", geo: "#A9713B", light: "#C838A6", atom: "#7CB024", plant: "#27864B", elec: "#EFB800", star: "#2E3A8C",
  num: "#0DA5C6", alge: "#7C5CE8", grph: "#E8547E", geom: "#F08C00", solid: "#2F9E44", data: "#364FC7",
  calc: "#9C36B5", ineq: "#A9631B", func: "#0CA678", prove: "#1971C2", sim: "#C2255C", dice: "#C92A2A",
  world: "#E8590C",
};

/** 테마 원색(미등록 단원은 토스 블루). */
export function themeInk(theme: string): string {
  return THEME_INK[theme] ?? "#3182F6";
}

function mix(hex: string, to: string, t: number): string {
  const ch = (s: string, i: number): number => parseInt(s.slice(i, i + 2), 16);
  const c = [1, 3, 5].map((i) => {
    const a = ch(hex, i);
    return Math.round(a + (ch(to, i) - a) * t);
  });
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function rgba(hex: string, a: number): string {
  const ch = (i: number): number => parseInt(hex.slice(i, i + 2), 16);
  return `rgba(${ch(1)},${ch(3)},${ch(5)},${a})`;
}

/**
 * 지도당 1회 삽입하는 0×0 defs — 밑창 실루엣(#bsole)·미니 발자국(#bsfp)·면 그라데이션.
 * 면 그라데이션 스톱은 테마 원색에서 파생(밝게 15% → 어둡게 6%) — 목업 #4D93FF→#2570E8 근사 검산 완료.
 */
export function soleDefs(theme: string): string {
  const ink = themeInk(theme);
  const key = theme || "def";
  return (
    `<svg class="bs-defs" width="0" height="0" aria-hidden="true">` +
    `<defs>` +
    // 장화 밑창(앞창+뒤꿈치 2조각) — rotate(180 24 35)로 발끝이 아래(진행 방향)를 향한다
    `<g id="bsole"><g transform="rotate(180 24 35)">` +
    `<path d="M24 2 C34.5 2 43 9 43 20 C43 30.5 38.5 39.5 34 43 C31 45.5 17 45.5 14 43 C9.5 39.5 5 30.5 5 20 C5 9 13.5 2 24 2 Z"/>` +
    `<rect x="12" y="52" width="24" height="16" rx="8"/>` +
    `</g></g>` +
    // 트레일 미니 발자국 = #bsole 축소판(s≈0.16) — 발끝은 -y(위) 기준, stamp가 진행 방향으로 회전
    `<g id="bsfp">` +
    `<path d="M0,-5.6 C1.8,-5.6 3.2,-4.4 3.2,-2.6 C3.2,-0.8 2.5,0.8 1.7,1.4 C1.2,1.8 -1.2,1.8 -1.7,1.4 C-2.5,0.8 -3.2,-0.8 -3.2,-2.6 C-3.2,-4.4 -1.8,-5.6 0,-5.6 Z"/>` +
    `<rect x="-2" y="2.9" width="4" height="2.7" rx="1.35"/>` +
    `</g>` +
    `<linearGradient id="bsFaceG-${key}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${mix(ink, "#ffffff", 0.15)}"/><stop offset="1" stop-color="${mix(ink, "#000000", 0.06)}"/>` +
    `</linearGradient>` +
    `<linearGradient id="bsGoldG" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#FFCF4D"/><stop offset="1" stop-color="#EFA32B"/>` +
    `</linearGradient>` +
    `</defs></svg>`
  );
}

export type SoleState = "now" | "done" | "locked" | "prem" | "exam" | "conq";

export interface SoleOpts {
  theme: string;
  /** 보행 스플레이 각(도) — 노드 회전은 CSS(--splay)가, 아이콘·배지 정립은 여기 counter-rotate가 소유. */
  splay: number;
  /** 열림·잠금 노드의 레슨 고유 아이콘 키(core/icons) — 없으면 플라스크 폴백. */
  lessonIcon?: string;
}

/**
 * 밑창 노드 내부 SVG(viewBox 0 0 48 76). 상태 문법(지도 단순화 2026-07-16 — design/README "지도 단순화 4항목"):
 * 열림=테마 그라데이션+흰 레슨 아이콘+펄스 라인, 완료=흰 면+테마 체크(금별 배지 제거 — 별은 시험 정복 인증 전용),
 * 잠금=회색 면+중앙 자물쇠 하나(아이콘 예고·모서리 배지 폐기), 프리미엄=골드+흰 크라운(레슨 아이콘 규칙의 예외),
 * 시험=잉크 네이비+금 깃펜, 정복 인증=골드+갈색 깃펜.
 * 열림 노드는 숨은 자물쇠(.bs-lock)를 함께 품는다 — 걷기 도착 연출(arriving)이
 * "자물쇠 → 레슨 아이콘 교체 점등"으로 해금을 그리는 훅(ui.css가 opacity 스왑 소유).
 */
export function soleSvg(state: SoleState, o: SoleOpts): string {
  const ink = themeInk(o.theme);
  const key = o.theme || "def";
  const r = (-o.splay).toFixed(1);
  const gold = state === "prem" || state === "conq";
  const edge = state === "done" ? "#C7D6E6"
    : state === "locked" ? "#C6CFD8"
    : gold ? "#C8821A"
    : state === "exam" ? "#101A2C"
    : mix(ink, "#000000", 0.3);
  const face = state === "done" ? `fill="#fff" stroke="#D9E5F2" stroke-width="1.5"`
    : state === "locked" ? `fill="#EDF1F4" stroke="#E0E6EB" stroke-width="1.5"`
    : gold ? `fill="url(#bsGoldG)"`
    : state === "exam" ? `fill="#26334D"`
    : `fill="url(#bsFaceG-${key})"`;
  // 다음 레슨 노드만 밑창 라인 펄스(reduced-motion은 정지 링) — 목업 haloPulse
  const halo = state === "now"
    ? `<use href="#bsole" class="bs-halo" fill="none" stroke="${rgba(ink, 0.55)}" stroke-width="5"/>`
    : "";

  // 중앙 자물쇠 글리프(시안값: 스트로크 #9AA7B5·sw 2.4·scale 1.15·counter-rotate) —
  // 잠금 노드의 유일한 글리프이자, 열림 노드에선 숨어 있다가 arriving 동안만 보이는 해금 연출 소품.
  const lockGlyph =
    `<g class="bs-lock" transform="translate(24 45) rotate(${r}) scale(1.15)" style="color:#9AA7B5">` +
    `<g transform="translate(-11 -11)">${icon("lock", 22, { sw: 2.4 })}</g></g>`;

  let glyph = "";
  if (state === "now") {
    // 열림 = 흰 레슨 아이콘. .bs-lic/.bs-lock: arriving CSS가 opacity로 자물쇠↔아이콘을 스왑한다.
    glyph =
      `<g class="bs-lic" transform="translate(24 45) rotate(${r})" style="color:#fff">` +
      `<g transform="translate(-11 -11)">${icon(o.lessonIcon ?? "flask", 22, { sw: 2.5 })}</g></g>` +
      lockGlyph;
  } else if (state === "locked") {
    // 잠금 = 자물쇠 하나만(레슨 아이콘 예고 폐기 — "복잡해 보인다" 단순화 확정)
    glyph = lockGlyph;
  } else if (state === "done") {
    glyph =
      `<g transform="translate(24 45) rotate(${r})" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">` +
      `<path d="M-6,.5 L-1.5,5 L6,-4"/></g>`;
  } else if (state === "prem") {
    glyph = `<g transform="translate(24 45) rotate(${r})"><path d="M-8.5,-6 L-4.5,-1.5 L0,-7.5 L4.5,-1.5 L8.5,-6 L7,4 L-7,4 z" fill="#fff"/></g>`;
  } else {
    // 시험 깃펜 — 정복 인증은 골드 면 위 갈색으로
    const qc = state === "conq" ? "#7A4E08" : "#F5C864";
    glyph =
      `<g transform="translate(24 45) rotate(${r})" fill="none" stroke="${qc}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">` +
      `<path d="M-3,-8 v16 M-3,-8 h10 l-3,4 3,4 h-10"/></g>`;
  }

  // 모서리 배지(완료 금별·잠금 자물쇠 원)는 지도 단순화로 폐기 — 완료는 체크만, 잠금은 중앙 자물쇠만.

  // 프레스 6px 침하 transform은 .bs-top CSS만 소유(use의 attribute transform과 섞지 않는다)
  return (
    `<svg viewBox="0 0 48 76" aria-hidden="true">${halo}` +
    `<use href="#bsole" class="bs-edge" fill="${edge}"/>` +
    `<g class="bs-top"><use href="#bsole" class="bs-face" ${face}/>${glyph}</g></svg>`
  );
}

export interface StampOpts {
  from: number;      // 시작 호 길이(px) — 노드 밑창과 겹치지 않는 여유
  endGap: number;    // 끝 여유(px) — 걸어온 길 55(워커 머리·깃발), 갈 길 40
  fill: string;      // 잉크색(rgba — 알파를 색에 실어야 stampIn 키프레임과 안 싸운다)
  step?: number;     // 보폭(기본 21px = 발 길이 11의 ~2배)
  delayBase?: number;
  delayStep?: number;
  reduce?: boolean;  // reduced-motion: 도장 애니 없이 즉시 표시
}

/** 도장 하나의 g(위치·회전은 transform 속성 소유 — 등장 애니 CSS와 분리) */
function stampG(path: SVGPathElement, d: number, side: number, fill: string): { g: SVGGElement; u: SVGUseElement } {
  const NS = "http://www.w3.org/2000/svg";
  const L = path.getTotalLength();
  const p = path.getPointAtLength(Math.min(d, L));
  const q = path.getPointAtLength(Math.min(d + 1.5, L));
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len; // 진행 방향의 수직(좌우 발 간격)
  const ny = dx / len;
  const off = 4.6;
  // 발끝은 진행 방향 + 좌우 발 벌림 7°(실제 보행), 왼발은 미러
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90 + side * 7;
  const g = document.createElementNS(NS, "g") as SVGGElement;
  g.setAttribute(
    "transform",
    `translate(${(p.x + nx * off * side).toFixed(1)},${(p.y + ny * off * side).toFixed(1)}) rotate(${ang.toFixed(1)})${side < 0 ? " scale(-1,1)" : ""}`,
  );
  const u = document.createElementNS(NS, "use") as SVGUseElement;
  u.setAttribute("href", "#bsfp");
  u.setAttribute("fill", fill);
  g.appendChild(u);
  return { g, u };
}

/** 걷기 연출용 개별 도장 — 등장 애니 없이 즉시 찍는다(걷는 발밑에서 생기므로). */
export function stampOne(svg: SVGSVGElement, path: SVGPathElement, d: number, side: number, fill: string): void {
  svg.appendChild(stampG(path, d, side, fill).g);
}

/**
 * 경로를 따라 좌/우 발자국을 번갈아 찍는다 — serpentine 좌표 경로를 그대로 샘플링.
 * 반환: 찍힌 도장과 호 길이(걷기 연출이 걷는 구간의 옅은 도장을 페이드아웃할 때 쓴다).
 */
export function stampTrail(svg: SVGSVGElement, path: SVGPathElement, o: StampOpts): { g: SVGGElement; d: number }[] {
  const L = path.getTotalLength();
  const to = Math.min(L - o.endGap, L);
  const step = o.step ?? 21;
  const out: { g: SVGGElement; d: number }[] = [];
  let i = 0;
  for (let d = o.from; d <= to; d += step, i++) {
    const { g, u } = stampG(path, d, i % 2 === 0 ? 1 : -1, o.fill);
    if (!o.reduce) {
      u.setAttribute("class", "gm-stamp");
      u.style.animationDelay = `${(o.delayBase ?? 0) + i * (o.delayStep ?? 24)}ms`;
    }
    svg.appendChild(g);
    out.push({ g, d });
  }
  return out;
}

/**
 * 스틱맨 워커 — idle(깃발 들고 서기, bob) + 걷기 플립북 2포즈(pa/pb, 8fps=125ms 교대).
 * 발 앵커 = viewBox (0,0). 깃발은 단원 테마색 — 걷는 동안엔 없고 도착(idle 복귀) 순간이 플랜팅.
 * 좌표는 전부 목업 실측(치비 보강: 머리 r7.7·볼터치·둥근 미소). 파츠 아바타 연동은 품질 게이트 뒤 후속.
 */
export function walkerSvg(flag: string): string {
  return (
    `<svg width="46" height="66" viewBox="-23 -62 46 66" aria-hidden="true">` +
    `<g class="pose on wk-bob" data-pose="idle">` +
    `<ellipse cx="0" cy="1" rx="9" ry="2.4" fill="#2A3A5E" opacity=".12"/>` +
    `<g fill="none" stroke="#243040" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M0,-13 C-1.5,-9 -3,-5 -4.5,-0.8 M-4.5,-0.8 L-8.2,-0.4"/>` +
    `<path d="M0,-13 C1.5,-9 3,-4.6 4.2,-0.8 M4.2,-0.8 L7.8,-1.2"/>` +
    `<path d="M0,-13 C.9,-19 .9,-24 0,-28.5"/>` +
    `<path d="M0,-25.5 C-3.4,-23.6 -5.4,-19.8 -5.9,-16.2"/>` +
    `<path d="M0,-25.5 C3.8,-27 6.9,-30 8.4,-33.4"/>` +
    `<circle cx="-.3" cy="-35.6" r="7.7" fill="#fff"/>` +
    `<path d="M-3.7,-42.7 q1,-2 2.6,-1.8 M.1,-43.7 q1.3,-1.6 2.7,-1.1"/>` +
    `</g>` +
    `<path d="M8.4,-33.4 L8.4,-55" fill="none" stroke="#243040" stroke-width="2.2" stroke-linecap="round"/>` +
    `<path d="M8.4,-55.6 C12.4,-57.1 15.4,-54.1 20.4,-55.6 L19.5,-48.9 C15.5,-47.5 12.5,-50.5 8.4,-49.5 z" fill="${flag}"/>` +
    `<circle cx="-2.5" cy="-35.9" r="1.1" fill="#243040"/><circle cx="1.9" cy="-35.9" r="1.1" fill="#243040"/>` +
    `<circle cx="-5.1" cy="-33.6" r="1.05" fill="#FF9D94" opacity=".5"/><circle cx="4.5" cy="-33.6" r="1.05" fill="#FF9D94" opacity=".5"/>` +
    `<path d="M-2.1,-33.2 q1.8,1.9 3.6,0" fill="none" stroke="#243040" stroke-width="1.7" stroke-linecap="round"/>` +
    `</g>` +
    `<g class="pose" data-pose="pa">` +
    `<ellipse cx="0" cy="1" rx="9.5" ry="2.4" fill="#2A3A5E" opacity=".11"/>` +
    `<g fill="none" stroke="#243040" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M0,-13 C2.2,-9.2 4.8,-5.2 7,-1.4 M7,-1.4 L10.6,-1.8"/>` +
    `<path d="M0,-13 C-2.4,-9.8 -5.2,-6.8 -8,-3.6 M-8,-3.6 L-5.1,-2.7"/>` +
    `<path d="M0,-13 C1.3,-19 1.3,-24 .5,-28.5"/>` +
    `<path d="M.5,-25.5 C3.6,-24 5.8,-21.2 6.6,-18"/>` +
    `<path d="M.5,-25.5 C-3.2,-24.6 -5.6,-22.3 -6.8,-19.4"/>` +
    `<circle cx="1" cy="-35.6" r="7.7" fill="#fff"/>` +
    `<path d="M-2.4,-42.7 q1,-2 2.6,-1.8 M1.4,-43.7 q1.3,-1.6 2.7,-1.1"/>` +
    `</g>` +
    `<circle cx="-1.2" cy="-35.9" r="1.1" fill="#243040"/><circle cx="3.2" cy="-35.9" r="1.1" fill="#243040"/>` +
    `<circle cx="-3.8" cy="-33.6" r="1.05" fill="#FF9D94" opacity=".5"/><circle cx="5.8" cy="-33.6" r="1.05" fill="#FF9D94" opacity=".5"/>` +
    `<path d="M-.8,-33.2 q1.8,1.9 3.6,0" fill="none" stroke="#243040" stroke-width="1.7" stroke-linecap="round"/>` +
    `</g>` +
    `<g class="pose" data-pose="pb">` +
    `<ellipse cx="0" cy="1" rx="8.5" ry="2.3" fill="#2A3A5E" opacity=".12"/>` +
    `<g transform="translate(0,-1.5)">` +
    `<g fill="none" stroke="#243040" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M0,-13 C.4,-8.8 1,-4.4 1.4,-.8 M1.4,-.8 L5,-1.2"/>` +
    `<path d="M0,-13 C-1.2,-9.8 -2.6,-7.2 -3.2,-4.4 M-3.2,-4.4 L-.4,-3.6"/>` +
    `<path d="M0,-13 C1,-19 1,-24 .3,-28.5"/>` +
    `<path d="M.3,-25.5 C2.5,-23.8 3.7,-21.2 4.1,-18.6"/>` +
    `<path d="M.3,-25.5 C-2,-23.8 -3.2,-21.4 -3.6,-18.8"/>` +
    `<circle cx=".8" cy="-35.6" r="7.7" fill="#fff"/>` +
    `<path d="M-2.6,-42.7 q1,-2 2.6,-1.8 M1.2,-43.7 q1.3,-1.6 2.7,-1.1"/>` +
    `</g>` +
    `<circle cx="-1.4" cy="-35.9" r="1.1" fill="#243040"/><circle cx="3" cy="-35.9" r="1.1" fill="#243040"/>` +
    `<circle cx="-4" cy="-33.6" r="1.05" fill="#FF9D94" opacity=".5"/><circle cx="5.6" cy="-33.6" r="1.05" fill="#FF9D94" opacity=".5"/>` +
    `<path d="M-1,-33.2 q1.8,1.9 3.6,0" fill="none" stroke="#243040" stroke-width="1.7" stroke-linecap="round"/>` +
    `</g></g>` +
    `</svg>`
  );
}
