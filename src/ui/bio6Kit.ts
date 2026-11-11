// bio6Kit: 중1 Ⅱ v5 랩 공용 그림 부품(2026-11-11).
// 구조 색은 v3 도해(bio4Figures)와 같게 맞춘다: 세포막 주황, 핵 보라, 마이토콘드리아 빨강, 엽록체 초록, 세포벽 갈색.
// 같은 구조는 어느 화면에서나 같은 색이어야 한다(색으로 찍는 버릇과 혼동을 함께 막는다).

import { el } from "../core/dom";

const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
/** public 아래 그림 경로. lazy 로딩은 쓰지 않는다(스크롤 컨테이너 안에서 영영 안 뜬다). */
export const bvSrc = (path: string): string => `${BASE}${path}`;

/** 양파 껍질 거울 타일 한 장이 나타내는 실제 길이(mm). 랩의 배율 자와 문제 그림의 눈금자가 함께 쓰는 하나의 자다.
 *  타일 속 세포의 긴 쪽이 타일 폭의 절반쯤이라, 이 값이면 세포 길이가 약 0.3 mm(폭 약 0.05 mm)가 된다. */
export const ONION_TILE_MM = 0.54;

export const BV = {
  mem: "#F08C00", // 세포막
  nuc: "#7048E8", // 핵
  mito: "#F03E3E", // 마이토콘드리아
  chl: "#37B24D", // 엽록체
  wall: "#8D6E63", // 세포벽
  nutr: "#FFD43B", // 양분 알갱이
  spark: "#228BE6", // 에너지 표시(번개)
  off: "#5C6B80", // 멈춘 구조
} as const;

/** 무대 안에 346×230 고정 설계 판을 놓고, 무대 폭이 달라도 통째로 비율을 맞춘다.
 *  (폰 폭 360~430에서 무대 폭은 316~386. 판은 가운데 정렬, 폭이 좁으면 줄어들고 넓으면 그대로다.)
 *  돌려주는 off()는 cleanup에서 부른다. */
export function bvCanvas(stage: HTMLElement): { el: HTMLElement; off: () => void; scale: () => number } {
  const canvas = el("div", { class: "bv-canvas" });
  stage.appendChild(canvas);
  let k = 1;
  const fit = (): void => {
    const w = stage.clientWidth || 346;
    k = Math.min(1.12, w / 346);
    canvas.style.transform = `translate(-50%, -50%) scale(${k.toFixed(4)})`;
  };
  fit();
  let ro: ResizeObserver | null = null;
  if (typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(fit);
    ro.observe(stage);
  }
  return { el: canvas, off: () => ro?.disconnect(), scale: () => k };
}

/** 원형 관찰 창(현미경 시야). 안에 층을 쌓아 쓴다. 좌표와 크기는 설계 판(346×230) 기준 px. */
export function bvField(o: { x: number; y: number; d: number; cls?: string }): HTMLElement {
  const f = el("div", { class: `bv-field ${o.cls ?? ""}` });
  f.style.left = `${o.x}px`;
  f.style.top = `${o.y}px`;
  f.style.width = `${o.d}px`;
  f.style.height = `${o.d}px`;
  return f;
}

/** 시야 가장자리가 살짝 어두워지는 덮개(실제 현미경 느낌). 창의 맨 위 층에 붙인다. */
export function bvFieldShade(): HTMLElement {
  return el("div", { class: "bv-field-shade" });
}

// ── 카드 아이콘(34×34) ──────────────────────────────────────────────
const ic = (body: string): string => `<svg viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const BV_ICON = {
  onion: ic(`<rect width="34" height="34" rx="10" fill="#FFF4D6"/>
    <path d="M17 6c5.6 2.6 9 7 9 11.6 0 5-4 9.4-9 9.4s-9-4.4-9-9.4C8 13 11.4 8.6 17 6z" fill="#F6D58A" stroke="#C99A3B" stroke-width="1.5"/>
    <path d="M17 7.5v19M12.6 11.5c-1.6 4.6-1.4 9.4.6 14M21.4 11.5c1.6 4.6 1.4 9.4-.6 14" stroke="#C99A3B" stroke-width="1.1" opacity=".75"/>`),
  cork: ic(`<rect width="34" height="34" rx="10" fill="#F6E7D0"/>
    <path d="M10 10.5h14v15H10z" fill="#D9B07A" stroke="#9A6B3F" stroke-width="1.5"/>
    <ellipse cx="17" cy="10.5" rx="7" ry="2.6" fill="#E9C99B" stroke="#9A6B3F" stroke-width="1.5"/>
    <path d="M12.5 15h2M17 18h2.2M20.5 14.5h1.6M13.5 21.5h2M19 22.5h2" stroke="#9A6B3F" stroke-width="1.2" stroke-linecap="round"/>`),
  salt: ic(`<rect width="34" height="34" rx="10" fill="#E9F1FA"/>
    <rect x="8" y="14" width="9" height="9" rx="1.4" transform="rotate(-12 12.5 18.5)" fill="#fff" stroke="#8FA6C2" stroke-width="1.4"/>
    <rect x="18.5" y="9" width="7.5" height="7.5" rx="1.2" transform="rotate(14 22 13)" fill="#fff" stroke="#8FA6C2" stroke-width="1.4"/>
    <rect x="18.5" y="19.5" width="7" height="7" rx="1.2" transform="rotate(8 22 23)" fill="#fff" stroke="#8FA6C2" stroke-width="1.4"/>`),
  swab: ic(`<rect width="34" height="34" rx="10" fill="#EEF4FF"/>
    <path d="M8.5 25.5L22 12" stroke="#8B98AA" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="24" cy="10" rx="4.6" ry="3.4" transform="rotate(-45 24 10)" fill="#fff" stroke="#9AA8BC" stroke-width="1.5"/>`),
  dropper: ic(`<rect width="34" height="34" rx="10" fill="#E7F1FF"/>
    <path d="M20.5 6.5c2.2-1 4.6 1.2 3.6 3.6l-1.8 2.4-4-4 2.2-2z" fill="#4C6EF5"/>
    <path d="M17.6 9.4l5 5-7.4 8.4-3-3 5.4-10.4z" fill="#D0EBFF" stroke="#4C6EF5" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M11 22.5c1.6 1.8 2.6 3.2 2.6 4.4a2.6 2.6 0 01-5.2 0c0-1.2 1-2.6 2.6-4.4z" fill="#1971C2"/>`),
  cover: ic(`<rect width="34" height="34" rx="10" fill="#EAF6FB"/>
    <path d="M7 24.5h20" stroke="#8FB3CC" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M9 23L24 10" stroke="#3BA3D0" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M22.5 15.5c2 1.6 3 3.6 3 6" stroke="#3BA3D0" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="1 3"/>`),
  paper: ic(`<rect width="34" height="34" rx="10" fill="#F4F1EA"/>
    <path d="M9 8.5h13.5l3 3v14H9z" fill="#fff" stroke="#B9B2A3" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M9 19.5h16.5v6H9z" fill="#A5D8FF" opacity=".85"/>
    <path d="M12 12.5h8M12 15.5h10" stroke="#D5CFC2" stroke-width="1.3" stroke-linecap="round"/>`),
  cheek: ic(`<rect width="34" height="34" rx="10" fill="#EEF4FF"/>
    <path d="M8 13.5c2 -5.4 9 -7.4 14 -5.2 5 2.2 7 8 5 13 -2 5 -8 7.2 -13 6.2 -5 -1 -8 -8 -6 -14z" fill="#C9D8F7" stroke="#8FA6DC" stroke-width="1.3"/>
    <circle cx="17" cy="17.6" r="2.8" fill="#2B4FC4"/>`),
  leafWater: ic(`<rect width="34" height="34" rx="10" fill="#EFF8E4"/>
    <rect x="6" y="10" width="22" height="14" rx="3" fill="#F7FCF0" stroke="#8A9A86" stroke-width="1.5"/>
    <g fill="#5BA82E"><circle cx="10" cy="13.6" r="1.7"/><circle cx="14.5" cy="13.1" r="1.7"/><circle cx="19.5" cy="13.1" r="1.7"/><circle cx="24" cy="13.6" r="1.7"/><circle cx="10" cy="20.4" r="1.7"/><circle cx="14.5" cy="20.9" r="1.7"/><circle cx="19.5" cy="20.9" r="1.7"/><circle cx="24" cy="20.4" r="1.7"/><circle cx="9.6" cy="17" r="1.7"/><circle cx="24.4" cy="17" r="1.7"/></g>`),
  leafStain: ic(`<rect width="34" height="34" rx="10" fill="#EFF8E4"/>
    <rect x="6" y="10" width="22" height="14" rx="3" fill="#F7FCF0" stroke="#8A9A86" stroke-width="1.5"/>
    <g fill="#5BA82E"><circle cx="10" cy="13.6" r="1.7"/><circle cx="14.5" cy="13.1" r="1.7"/><circle cx="19.5" cy="13.1" r="1.7"/><circle cx="24" cy="13.6" r="1.7"/><circle cx="10" cy="20.4" r="1.7"/><circle cx="14.5" cy="20.9" r="1.7"/><circle cx="19.5" cy="20.9" r="1.7"/><circle cx="24" cy="20.4" r="1.7"/><circle cx="9.6" cy="17" r="1.7"/><circle cx="24.4" cy="17" r="1.7"/></g>
    <circle cx="17" cy="17" r="2.9" fill="#C2255C"/>`),
} as const;

/** 세포 구조 카드 아이콘(무대의 그림과 같은 색, 같은 모양). */
export const BV_PART = {
  mem: ic(`<rect width="34" height="34" rx="10" fill="#FFF1DC"/>
    <path d="M4 34C4 17 17 4 34 4v30z" fill="#FFD9AE"/>
    <path d="M4 33C4 17 17 4 33 4" stroke="#F08C00" stroke-width="4.6" stroke-linecap="round"/>
    <circle cx="9" cy="9" r="3" fill="#FFD43B" stroke="#E8A800"/>
    <circle cx="23" cy="23" r="3" fill="#FFD43B" stroke="#E8A800"/>`),
  nuc: ic(`<rect width="34" height="34" rx="10" fill="#F1ECFF"/>
    <circle cx="17" cy="17" r="11" fill="#7C5CF0" stroke="#4A2AAE" stroke-width="1.5"/>
    <circle cx="19" cy="19.5" r="4" fill="#3F2499" opacity=".8"/>
    <ellipse cx="12.6" cy="12" rx="3.6" ry="2" fill="#fff" opacity=".45" transform="rotate(-28 12.6 12)"/>`),
  mito: ic(`<rect width="34" height="34" rx="10" fill="#FFECEC"/>
    <g transform="translate(17 17) rotate(-24)">
      <rect x="-13" y="-7.5" width="26" height="15" rx="7.5" fill="#F25050" stroke="#9C1F1F" stroke-width="1.5"/>
      <path d="M-8.4 0q2 -4.6 4.2 0t4.2 0 4.2 0 4.2 0" stroke="#FFE3E3" stroke-width="1.8" stroke-linecap="round"/>
    </g>`),
  chl: ic(`<rect width="34" height="34" rx="10" fill="#EBFBEE"/>
    <g transform="translate(17 17) rotate(-16)">
      <ellipse rx="13" ry="8" fill="#40C057" stroke="#1F6B30" stroke-width="1.5"/>
      <path d="M-6 -4v8M-2 -5.6v11.2M2 -5.6v11.2M6 -4v8" stroke="#1F6B30" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>
    </g>`),
  wall: ic(`<rect width="34" height="34" rx="10" fill="#F3ECE8"/>
    <path d="M11 6.5h12l6 10.5-6 10.5H11L5 17z" fill="#DCF0B4" stroke="#8D6E63" stroke-width="3.6" stroke-linejoin="round"/>`),
} as const;

/** 구조 이름 앞의 색 점(세포 구조 카드용). */
export const bvDot = (color: string): string => ic(`<circle cx="17" cy="17" r="9" fill="${color}"/><circle cx="14" cy="14" r="3" fill="#fff" opacity=".45"/>`);

/** 시드가 고정된 난수(같은 그림은 언제나 같게). */
export function bvRand(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
