// u3 v2 파일럿 40문항(과학 교과서 준거 규격 · 재출제 10호) · 정본 설계표 qa/u3-v2-blueprint.md의 🅟 슬롯.
// 격리 저작본: 레슨 파일 무수정 · index.ts 미등록. 확대 승인분과 함께 build-u3v2-lessons.mjs가
// u3l1~l5.ts를 재생성한다(문항 40개는 승인분 무수정).
// 신작 헬퍼 9종(PB·SC·RD·RM·FC2·BM·EG·IN·LT)은 파일럿 로컬 함수(u7 v2 관행) · 이식 때
// ui/examFigures.ts "u3 v2" 섹션으로 승격한다. 파일럿 갤러리가 신작 데뷔 눈검수를 겸한다
// (IN·LT는 파일럿 문항 미사용 · PILOT_PREVIEW 부록 카드로 데뷔 눈검수).
// 표기: 해요체 · em대시 금지(주석 포함 · 가운뎃점) · 해설 250~450자(태그 제외)+xh 2단+core ·
// 판정 마커 ✓ · mcq/multi 5지 · 라벨형 shuffle:false(첫 보기 정답 금지) · num answer 문자열+unitLabel.
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).
// 비열 계산은 기호 산식 없이 말로 풀어 제시("물 1 kg을 1 ℃ 높이는 데 열량 1 kcal").
// 각 문항 주석 = [슬롯] 검산 노트(열평형 수렴 온도 · 비열 산수 손검산 · 바이메탈 휨 방향 ·
// 값 읽기 정답이 눈금 위인지 · 방향 뒤집기 오답 설계).
// 그림 검산 세트: 온도↑=활발·간격↑(크기·개수 불변) · 열은 고온→저온 · 같은 질량 같은 물질만
// 산술 중간값 · 바이메탈은 덜 팽창한 쪽으로 휨 · 냉방기 위·난방기 아래.
import type { ExamItem } from "../src/content/exams/types";
import { eqGraph, heatCurves, thermometerRead, svgTable, dbox } from "../src/ui/examFigures";
import { seaBreeze } from "../src/ui/examFigures";

const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
const ximg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}exam/u3/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;
const xpair = (a: string, altA: string, b: string, altB: string): string =>
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="${IMG_BASE}exam/u3/${a}" alt="${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0"><img src="${IMG_BASE}exam/u3/${b}" alt="${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>`;

/* ══════════ 신작 헬퍼(이식 때 examFigures "u3 v2" 섹션 승격) ══════════ */

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** PB 입자 운동 모형 N박스(다크 · 파라미터형) · particleTrio/Duo 대체 신작.
 *  개수는 9개 고정(개수·크기는 온도의 단서가 아님을 구조로 보장) · spread 간격 · trail 운동 세기.
 *  운동 표시는 입자 옆 호(弧) 떨림 줄(교과서 문법 · 실측 미래엔 "호 줄 수만 다름" 계승):
 *  trail 0 = 없음 · 1~7 = 1줄 · 8+ = 2줄(최대 2줄 · 3단계 0/1/2가 한눈에 갈리는 상한 ·
 *  파일럿 2차 검수 "떨림 과함 · 2줄vs3줄 구분 곤란" 반영). 긴 직선 잔상은 잡선으로 읽혀 폐기
 *  (1차 검수 반영). 색은 전부 같은 파랑 · aria는 중립(순서 낭독 금지). */
export function htParticleBoxFig(boxes: { label: string; spread: number; trail: number; count?: number }[]): string {
  const n = boxes.length;
  const bw = n === 2 ? 112 : 100;
  const xs = n === 2 ? [40, 192] : [6, 122, 238];
  const box = (bx: number, label: string, spread: number, trail: number, count = 9): string => {
    const pts: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      const c = i % 3;
      const r = Math.floor(i / 3);
      const rows = Math.ceil(count / 3);
      const cx = bw / 2 + (c - 1) * spread + (i % 2 ? 3 : -2) * (spread / 16);
      const cy = 48 + (r - (rows - 1) / 2) * spread + (i % 3 === 1 ? 4 : -2) * (spread / 16);
      pts.push([cx, cy]);
    }
    const arcN = trail < 1 ? 0 : trail < 8 ? 1 : 2;
    const parts = pts
      .map(([x, y], i) => {
        const deg = (i * 137 + 40) % 360;
        let arcs = "";
        for (let k = 0; k < arcN; k++) {
          const r = 9 + k * 4.2;
          const sy = (r * 0.522).toFixed(1);
          const sx = (r * 0.852).toFixed(1);
          arcs += `<path d="M${(x + Number(sx)).toFixed(1)} ${(y - Number(sy)).toFixed(1)} A${r} ${r} 0 0 1 ${(x + Number(sx)).toFixed(1)} ${(y + Number(sy)).toFixed(1)}" fill="none" stroke="#8FB3E8" stroke-width="1.7" stroke-linecap="round" opacity=".8"/>`;
        }
        const wrapped = arcs ? `<g transform="rotate(${deg} ${x.toFixed(1)} ${y.toFixed(1)})">${arcs}</g>` : "";
        return `${wrapped}<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#6E9EDB"/><circle cx="${(x - 2).toFixed(1)}" cy="${(y - 2).toFixed(1)}" r="1.8" fill="rgba(255,255,255,.4)"/>`;
      })
      .join("");
    return `<g transform="translate(${bx},10)">
      <rect x="0" y="0" width="${bw}" height="96" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
      ${parts}
      <text x="${bw / 2}" y="122" text-anchor="middle" font-size="14" font-weight="700" fill="#AFC3E3">${label}</text>
    </g>`;
  };
  // aria는 파라미터에서 파생한다(문두 조건과 모순되는 고정 문구 금지 · u3 v2 검산 반영).
  // 판독 결과(어느 쪽이 뜨거운가)는 낭독하지 않고, 무엇이 같고 무엇이 다른지만 서술한다.
  const uniq = (arr: (number | undefined)[]): number => new Set(arr).size;
  const sameSpread = uniq(boxes.map((b) => b.spread)) === 1;
  const sameTrail = uniq(boxes.map((b) => (b.trail < 1 ? 0 : b.trail < 8 ? 1 : 2))) === 1;
  const sameCount = uniq(boxes.map((b) => b.count ?? 9)) === 1;
  const parts: string[] = [];
  parts.push(sameCount ? "입자의 개수는 상자마다 같다" : "입자의 개수가 상자마다 다르다");
  parts.push(sameSpread ? "입자 사이의 간격도 같다" : "입자 사이의 간격이 서로 다르다");
  parts.push(sameTrail ? "입자 옆 움직임 표시도 같다" : "입자 옆 움직임 표시의 수가 서로 다르다");
  return `<svg viewBox="0 0 344 136" ${NS} role="img" aria-label="입자 운동 모형 ${n}가지. ${parts.join(", ")}">
    ${boxes.map((b, i) => box(xs[i], b.label, b.spread, b.trail, b.count)).join("")}
  </svg>`;
}

/** SC 한 장면 3방식(라이트 · 파운드리 문법) · 미5·천02 계보(모닥불·캠핑 소재 회피).
 *  hearth: 벽난로 위 주전자(A 물 순환 · B 금속 손잡이 · C 앞에서 손 쬐는 스틱맨).
 *  kitchen: 가스레인지 냄비(A 물 순환 · B 꽂힌 금속 국자 · C 불 곁 버터 접시).
 *  라벨은 A·B·C 콜아웃만(방식 이름 인쇄 금지) · aria 중립. */
export function htSceneFig(scene: "hearth" | "kitchen"): string {
  const tag = (x: number, y: number, t: string): string =>
    `<circle cx="${x}" cy="${y}" r="13" fill="#FFF" stroke="#3182F6" stroke-width="1.8"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">${t}</text>`;
  const flame = (x: number, y: number, s = 1): string =>
    `<g transform="translate(${x},${y}) scale(${s})"><path d="M0 10 C 8 5 5 -2 0 -9 C -5 -2 -8 5 0 10 Z" fill="#FF9F43"/><path d="M0 6.5 C 4.5 3.5 3 -1 0 -5 C -3 -1 -4.5 3.5 0 6.5 Z" fill="#FFD98A"/></g>`;
  if (scene === "hearth") {
    return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="벽난로 불 위에 걸린 주전자와 그 앞에서 손을 쬐는 사람 그림. 주전자 속 물, 주전자 손잡이, 사람의 손에 각각 기호 A, B, C가 붙어 있다">
      <rect x="8" y="8" width="328" height="180" rx="14" fill="#FBF7F0" stroke="#DCE0E6" stroke-width="1.4"/>
      <path d="M30 168 h130 v-96 a14 14 0 0 1 14 -14 h0" fill="none"/>
      <rect x="34" y="60" width="120" height="108" rx="8" fill="#E8DCCB" stroke="#C9B79A" stroke-width="1.6"/>
      <rect x="46" y="120" width="96" height="48" rx="6" fill="#3A2E24"/>
      <path d="M58 160 h24 M70 166 h28 M96 160 h24" stroke="#8A6842" stroke-width="7" stroke-linecap="round"/>
      ${flame(94, 146, 1.5)}${flame(78, 150, 1.05)}${flame(112, 150, 1.1)}
      <path d="M64 118 h60 v4 h-60 Z" fill="#6B7684"/>
      <path d="M80 84 a14 18 0 0 1 28 0 l3 30 h-34 Z" fill="#9AA3AD" stroke="#6B7684" stroke-width="1.6"/>
      <path d="M80 84 q14 -12 28 0" fill="none" stroke="#6B7684" stroke-width="1.6"/>
      <rect x="88" y="70" width="12" height="8" rx="2" fill="#8B95A1" stroke="#6B7684" stroke-width="1.2"/>
      <path d="M111 92 q16 4 14 20" fill="none" stroke="#C46A2B" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="94" cy="104" rx="13" ry="9" fill="#DCEBFB" opacity=".9"/>
      <path d="M90 108 c-6 -2 -6 -8 0 -10 m8 0 c6 2 6 8 0 10" stroke="#0CA6C0" stroke-width="1.8" fill="none"/>
      <path d="M98 98 l3 4 -5 0" fill="none" stroke="#0CA6C0" stroke-width="1.6" stroke-linejoin="round"/>
      <g stroke="#FF6B4A" stroke-width="2" stroke-linecap="round" fill="none" opacity=".85">
        <path d="M162 120 q8 -4 16 0 q8 4 16 0"/>
        <path d="M162 136 q8 -4 16 0 q8 4 16 0"/>
        <path d="M162 152 q8 -4 16 0 q8 4 16 0"/>
      </g>
      <g stroke="#4E5968" stroke-width="2.6" stroke-linecap="round" fill="none">
        <circle cx="284" cy="96" r="13" stroke-width="2.4"/>
        <path d="M284 109 v40 M284 122 l-24 -8 M284 122 l-22 14 M284 149 l-14 22 M284 149 l14 22"/>
        <path d="M260 114 l-14 4 M262 136 l-16 -2"/>
      </g>
      <ellipse cx="284" cy="176" rx="26" ry="5" fill="#2A3A5E" opacity=".10"/>
      ${tag(64, 96, "A")}
      <path d="M74 99 L84 102" stroke="#3182F6" stroke-width="1.6"/>
      ${tag(146, 74, "B")}
      <path d="M137 80 L126 96" stroke="#3182F6" stroke-width="1.6"/>
      ${tag(238, 108, "C")}
      <path d="M245 117 L252 128" stroke="#3182F6" stroke-width="1.6"/>
      <text x="172" y="206" text-anchor="middle" font-size="11" fill="#8B95A1">벽난로 위 주전자 · 앞에 선 사람</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="가스레인지 불 위 냄비 그림. 냄비 속 물, 냄비에 꽂힌 금속 국자의 손잡이, 불 곁에 둔 버터 접시에 각각 기호 A, B, C가 붙어 있다">
    <rect x="8" y="8" width="328" height="180" rx="14" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.4"/>
    <rect x="30" y="150" width="284" height="18" rx="6" fill="#DCE0E6"/>
    <rect x="70" y="144" width="120" height="8" rx="4" fill="#6B7684"/>
    ${flame(114, 138, 1.1)}${flame(132, 136, 1.35)}${flame(150, 138, 1.1)}
    <path d="M57 84 h150 v44 a10 10 0 0 1 -10 10 h-130 a10 10 0 0 1 -10 -10 Z" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.8"/>
    <rect x="57" y="84" width="150" height="10" fill="#B0B8C1"/>
    <ellipse cx="115" cy="112" rx="20" ry="12" fill="#DCEBFB" opacity=".92"/>
    <path d="M109 118 c-8 -3 -8 -10 0 -13 m12 0 c8 3 8 10 0 13" stroke="#0CA6C0" stroke-width="2" fill="none"/>
    <path d="M121 103 l4 5 -6 0" fill="none" stroke="#0CA6C0" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M177 92 L211 44" stroke="#B45309" stroke-width="6" stroke-linecap="round"/>
    <path d="M177 92 L211 44" stroke="#E8A25A" stroke-width="3.4" stroke-linecap="round"/>
    <ellipse cx="173" cy="98" rx="10" ry="6" fill="#9AA3AD" stroke="#6B7684" stroke-width="1.4"/>
    <g stroke="#FF6B4A" stroke-width="2" stroke-linecap="round" fill="none" opacity=".85">
      <path d="M176 150 q8 -4 16 0 q8 4 16 0 q8 -4 16 0"/>
      <path d="M186 162 q8 -4 16 0 q8 4 16 0"/>
    </g>
    <ellipse cx="268" cy="150" rx="30" ry="8" fill="#FFF" stroke="#C4CAD2" stroke-width="1.6"/>
    <path d="M254 138 h26 a4 4 0 0 1 4 4 v6 h-34 v-6 a4 4 0 0 1 4 -4 Z" fill="#FFDE8A" stroke="#E0B84B" stroke-width="1.4"/>
    <path d="M258 138 q4 -6 10 -4" stroke="#E0B84B" stroke-width="1.4" fill="none"/>
    <ellipse cx="268" cy="172" rx="30" ry="5" fill="#2A3A5E" opacity=".10"/>
    ${tag(114, 64, "A")}
    <path d="M114 77 L114 98" stroke="#3182F6" stroke-width="1.6"/>
    ${tag(243, 30, "B")}
    <path d="M233 37 L215 43" stroke="#3182F6" stroke-width="1.6"/>
    ${tag(310, 118, "C")}
    <path d="M302 127 L284 140" stroke="#3182F6" stroke-width="1.6"/>
    <text x="172" y="206" text-anchor="middle" font-size="11" fill="#8B95A1">가스레인지 위 냄비 · 국자 · 버터 접시</text>
  </svg>`;
}

/** RD 열화상풍 막대 비교(다크 · 파라미터형) · thermalRods(레슨 고정 구리/철/유리) 대체 신작.
 *  rods: 재질 이름 + 데워진 비율(0~1 · 0이면 회색 중립). beads: 한 막대 위 구슬 위치(0~1 배열 ·
 *  촛농 구슬 예측 문항용 · 중립 상태 원칙이라 frac 0과 함께 쓴다). 왼쪽 끝 가열 고정. */
export function htRodsFig(rods: { name: string; frac: number; beads?: { at: number; label: string }[] }[]): string {
  const flame = (y: number): string => `
    <g transform="translate(51,${y + 8})">
      <path d="M0 9 C 8 5 5 -3 0 -11 C -5 -3 -8 5 0 9 Z" fill="#FF9F43"/>
      <path d="M0 5 C 4 3 3 -2 0 -6 C -3 -2 -4 3 0 5 Z" fill="#FFE9A8"/>
    </g>`;
  const H = rods.length * 58 + 30;
  const rod = (r: { name: string; frac: number; beads?: { at: number; label: string }[] }, i: number): string => {
    const y = 40 + i * 58;
    const w = 250 * r.frac;
    const beads = (r.beads ?? [])
      .map(
        (b) => `<circle cx="${62 + 250 * b.at}" cy="${y - 6}" r="7" fill="#EDE2BE" stroke="#B9A96A" stroke-width="1.4"/>
      <text x="${62 + 250 * b.at}" y="${y - 18}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#DCE8FF">${b.label}</text>`,
      )
      .join("");
    return `<g>
      <text x="58" y="${y - 7}" font-size="12.5" font-weight="700" fill="#AFC3E3">${r.name}</text>
      <rect x="62" y="${y}" width="250" height="16" rx="8" fill="#22335C"/>
      ${w > 4 ? `<rect x="62" y="${y}" width="${w}" height="16" rx="8" fill="url(#u3HeatGrad)"/>` : ""}
      <rect x="62" y="${y}" width="250" height="16" rx="8" fill="none" stroke="#31456F" stroke-width="1.2"/>
      ${beads}
      ${flame(y)}
    </g>`;
  };
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="막대의 왼쪽 끝을 같은 불로 동시에 가열하는 실험 그림. ${rods.some((r) => r.frac > 0) ? "막대마다 데워진 부분의 길이가 다르게 표시되어 있다" : "아직 가열하기 전이다"}${rods.some((r) => (r.beads ?? []).length) ? ". 막대 위에는 이름표가 붙은 구슬이 놓여 있다" : ""}">
    <defs>
      <linearGradient id="u3HeatGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FFE9A8"/>
        <stop offset=".45" stop-color="#FF9F43"/>
        <stop offset=".85" stop-color="#F0442E"/>
        <stop offset="1" stop-color="#F0442E" stop-opacity=".15"/>
      </linearGradient>
    </defs>
    ${rods.map(rod).join("")}
    <text x="34" y="${H - 6}" text-anchor="middle" font-size="11" fill="#7E93B3">가열</text>
  </svg>`;
}

/** RM 방 단면 · 설치 위치(라이트 · 파라미터형) · 비03·천09 계보.
 *  arrows "none"이면 위치 A(벽 위)·B(벽 아래) 배지만(예측 중립) · "cool"이면 A에서 찬 공기가
 *  내려오는 순환 화살표 · "warm"이면 B에서 더운 공기가 올라가는 순환. */
export function htRoomFig(o: { arrows: "none" | "cool" | "warm" }): string {
  const badge = (x: number, y: number, t: string): string =>
    `<rect x="${x - 15}" y="${y - 13}" width="30" height="26" rx="8" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.6" stroke-dasharray="4 3"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">${t}</text>`;
  const cool = `
    <path d="M84 66 C 120 96 150 132 148 158" fill="none" stroke="#3182F6" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M148 158 l-8 -8 M148 158 l3 -10" fill="none" stroke="#3182F6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M196 158 C 236 132 258 100 260 70" fill="none" stroke="#FF6B4A" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 8"/>
    <path d="M260 70 l-9 6 M260 70 l-2 11" fill="none" stroke="#FF6B4A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  const warm = `
    <path d="M264 148 C 240 112 210 84 180 68" fill="none" stroke="#FF6B4A" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M180 68 l11 1 M180 68 l6 10" fill="none" stroke="#FF6B4A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M120 70 C 96 100 84 128 86 152" fill="none" stroke="#3182F6" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 8"/>
    <path d="M86 152 l-3 -10 M86 152 l9 -6" fill="none" stroke="#3182F6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="방 안 단면 그림. 한쪽 벽의 위쪽에 A, 반대쪽 벽의 아래쪽에 B 위치가 표시되어 있다${o.arrows === "none" ? "" : o.arrows === "cool" ? ". A 쪽에서 바닥으로 내려가는 화살표와 반대편에서 위로 올라가는 화살표가 그려져 있다" : ". B 쪽에서 위로 올라가는 화살표와 반대편에서 아래로 내려가는 화살표가 그려져 있다"}">
    <rect x="24" y="20" width="296" height="164" rx="10" fill="#F7F8FA" stroke="#B0B8C1" stroke-width="2"/>
    <rect x="150" y="34" width="60" height="46" rx="6" fill="#DCEBFB" stroke="#B9C2CE" stroke-width="1.4"/>
    <path d="M150 57 h60 M180 34 v46" stroke="#B9C2CE" stroke-width="1.2"/>
    <path d="M54 184 v-26 a10 10 0 0 1 20 0 v26" fill="#C4CAD2"/>
    ${o.arrows === "cool" ? cool : o.arrows === "warm" ? warm : ""}
    ${badge(66, 54, "A")}
    ${badge(288, 150, "B")}
    <text x="172" y="202" text-anchor="middle" font-size="11" fill="#8B95A1">방 안 · A는 벽 위쪽, B는 벽 아래쪽 위치</text>
  </svg>`;
}

/** FC2 비열 비교 실험 순서도(라이트 · 파라미터형) · v1 flowChart의 각도 교체판.
 *  ask "yes"면 ㉠(예 갈래) 강조 · "no"면 ㉡(아니요 갈래) 강조 · 캡션 중립.
 *  예/아니요 분기가 각자 결론 칸으로 갈라진다(감사 지적 계승). */
export function htFlowFig(o: { ask: "yes" | "no" }): string {
  const boxStyle = `fill="#F7F8FA" stroke="#B0B8C1" stroke-width="1.5"`;
  const hi = `fill="#EEF4FF" stroke="#3182F6" stroke-width="1.6"`;
  const arrow = (x: number, y1: number, y2: number): string =>
    `<path d="M${x} ${y1} V${y2} M${x} ${y2} l-5 -7 M${x} ${y2} l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  const yes = o.ask === "yes";
  return `<svg viewBox="0 0 344 258" ${NS} role="img" aria-label="비열 비교 실험 순서도. 질량을 같게 한 두 물질을 같은 세기 불로 가열해 온도 변화를 비교하고, 예 갈래의 결론 칸과 아니요 갈래의 결론 칸이 비어 있다">
    <rect x="62" y="8" width="220" height="34" rx="10" ${boxStyle}/>
    <text x="172" y="30" text-anchor="middle" font-size="12.5" font-weight="700" fill="#333D4B">물질 A와 B의 질량을 같게 잰다</text>
    ${arrow(172, 42, 58)}
    <rect x="62" y="58" width="220" height="34" rx="10" ${boxStyle}/>
    <text x="172" y="80" text-anchor="middle" font-size="12.5" font-weight="700" fill="#333D4B">같은 세기의 불로 같은 시간 가열한다</text>
    ${arrow(172, 92, 108)}
    <path d="M172 108 L294 134 L172 160 L50 134 Z" fill="#FFF6E6" stroke="#E8B04B" stroke-width="1.5"/>
    <text x="172" y="131" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">A의 온도가 B보다</text>
    <text x="172" y="147" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">많이 올랐다?</text>
    <text x="308" y="126" font-size="11.5" font-weight="700" fill="#4E5968">예</text>
    <path d="M294 134 H249 V170" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M249 170 l-5 -7 M249 170 l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round"/>
    <text x="24" y="126" font-size="11.5" font-weight="700" fill="#4E5968">아니요</text>
    <path d="M50 134 H95 V170" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M95 170 l-5 -7 M95 170 l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="182" y="172" width="134" height="36" rx="10" ${yes ? hi : boxStyle}/>
    <text x="249" y="195" text-anchor="middle" font-size="14" font-weight="800" fill="${yes ? "#1B64DA" : "#6B7684"}">㉠</text>
    <rect x="28" y="172" width="134" height="36" rx="10" ${yes ? boxStyle : hi}/>
    <text x="95" y="195" text-anchor="middle" font-size="14" font-weight="800" fill="${yes ? "#6B7684" : "#1B64DA"}">㉡</text>
    <text x="172" y="240" text-anchor="middle" font-size="11.5" fill="#8B95A1">갈라진 두 결론 칸 ㉠과 ㉡에는 각각 어떤 말이 들어갈까요?</text>
  </svg>`;
}

/** BM 바이메탈(라이트 · 파라미터형) · bimetalBend/fireAlarm 고정형 대체 신작.
 *  strip: 데우기 전(곧음)/뜨거운 물에 담가 골고루 데운 후(bend 방향) 2컷 · 라벨은 위/아래 금속 이름.
 *  가열원은 뜨거운 물(균일 가열) · 아래 불꽃 연출 폐기(파일럿 1차 검수 반영 · "아래가 먼저 데워져
 *  위로 휜다"는 과도기 직관과 충돌하지 않게 설계 단계에서 제거).
 *  iron: 전기다리미 온도 스위치 · 전원→열선→접점→띠→기둥의 한 줄 직렬 회로(끊긴 데 없음 검산) ·
 *  평소 닿아 있는 중립 상태만 그림(휘는 방향은 그리지 않는다 · 예측 문항 중립 원칙). */
export function htBimetalFig(o: { top: string; bottom: string; mode: "strip" | "iron"; bend?: "up" | "down"; cool?: boolean }): string {
  if (o.mode === "strip") {
    const down = o.bend === "down";
    const bathFill = o.cool ? "#E3F0FC" : "#FBE3DC";
    const bathEdge = o.cool ? "#9FBFE4" : "#E8B0A0";
    const bathWave = o.cool ? "#8FB3DC" : "#E8A08C";
    const bathName = o.cool ? "얼음물" : "뜨거운 물";
    const before = o.cool ? "식히기 전" : "데우기 전";
    const afterT = o.cool ? "식힌 후" : "데운 후";
    const capt = o.cool ? "얼음물에 담가 골고루 식힌 후" : "뜨거운 물에 담가 골고루 데운 후";
    const steam = o.cool ? "" : `<path d="M216 28 c -3 -4 3 -6 0 -10 M322 28 c -3 -4 3 -6 0 -10" stroke="#D9A08C" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    const after = down
      ? `<path d="M204 82.5 C246 82.5 280 97 312 118" fill="none" stroke="#8FA6C6" stroke-width="11.4" stroke-linecap="round"/>
         <path d="M204 82.5 C246 82.5 280 97 312 118" fill="none" stroke="#AFC6E8" stroke-width="9" stroke-linecap="round"/>
         <path d="M204 91.5 C246 91.5 280 106 312 127" fill="none" stroke="#7C8590" stroke-width="11.4" stroke-linecap="round"/>
         <path d="M204 91.5 C246 91.5 280 106 312 127" fill="none" stroke="#9AA3AD" stroke-width="9" stroke-linecap="round"/>`
      : `<path d="M204 82.5 C246 82.5 280 68 312 47" fill="none" stroke="#8FA6C6" stroke-width="11.4" stroke-linecap="round"/>
         <path d="M204 82.5 C246 82.5 280 68 312 47" fill="none" stroke="#AFC6E8" stroke-width="9" stroke-linecap="round"/>
         <path d="M204 91.5 C246 91.5 280 77 312 56" fill="none" stroke="#7C8590" stroke-width="11.4" stroke-linecap="round"/>
         <path d="M204 91.5 C246 91.5 280 77 312 56" fill="none" stroke="#9AA3AD" stroke-width="9" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 344 176" ${NS} role="img" aria-label="두 금속을 붙인 띠를 ${bathName}에 담가 골고루 ${o.cool ? "식히기" : "데우기"} 전과 후의 모습. ${before}에는 곧고, ${afterT}에는 한쪽으로 휘어져 있다">
      <text x="86" y="24" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${before}</text>
      <text x="258" y="24" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${afterT}</text>
      <line x1="172" y1="16" x2="172" y2="162" stroke="#EDF0F4" stroke-width="1.6"/>
      <rect x="20" y="66" width="12" height="40" rx="2" fill="#C4CAD2"/>
      <rect x="32" y="78" width="112" height="9" rx="4.5" fill="#AFC6E8" stroke="#8FA6C6" stroke-width="1.2"/>
      <rect x="32" y="87" width="112" height="9" rx="4.5" fill="#9AA3AD" stroke="#7C8590" stroke-width="1.2"/>
      <text x="148" y="72" font-size="12" font-weight="700" fill="#5E7BA6">${o.top}(위)</text>
      <text x="148" y="110" font-size="12" font-weight="700" fill="#6B7684">${o.bottom}(아래)</text>
      <rect x="206" y="36" width="128" height="122" rx="12" fill="${bathFill}" stroke="${bathEdge}" stroke-width="1.6"/>
      <path d="M214 45 q8 -5 16 0 t16 0" fill="none" stroke="${bathWave}" stroke-width="1.6"/>
      <path d="M286 45 q8 -5 16 0 t16 0" fill="none" stroke="${bathWave}" stroke-width="1.6"/>
      ${steam}
      <rect x="192" y="66" width="12" height="40" rx="2" fill="#C4CAD2"/>
      ${after}
      <text x="296" y="150" text-anchor="middle" font-size="11" fill="${o.cool ? "#4E6E96" : "#B0705E"}">${bathName}</text>
      <text x="258" y="172" text-anchor="middle" font-size="11" fill="#8B95A1">${capt}</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 344 206" ${NS} role="img" aria-label="전기다리미 온도 스위치의 구조. 전원에서 나온 도선이 열선을 지나 접점으로 이어지고, 두 금속을 붙인 띠의 오른쪽 끝이 위쪽 접점에 닿아 회로가 연결되어 있다">
    <rect x="8" y="8" width="328" height="172" rx="14" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.4"/>
    <rect x="36" y="34" width="26" height="16" rx="3" fill="#C4CAD2"/>
    <text x="49" y="26" text-anchor="middle" font-size="11" fill="#8B95A1">전원</text>
    <path d="M62 42 H96" stroke="#6B7684" stroke-width="2" fill="none"/>
    <path d="M96 42 c3 -8 9 -8 12 0 c3 8 9 8 12 0 c3 -8 9 -8 12 0" stroke="#E8542F" stroke-width="2.2" fill="none"/>
    <text x="114" y="64" text-anchor="middle" font-size="11" fill="#B0705E">다리미 열선</text>
    <path d="M132 42 H236 V114" stroke="#6B7684" stroke-width="2" fill="none"/>
    <rect x="228" y="114" width="16" height="8" rx="2" fill="#6B7684"/>
    <text x="252" y="121" font-size="11" fill="#8B95A1">접점</text>
    <path d="M36 50 V128 H52" stroke="#6B7684" stroke-width="2" fill="none"/>
    <rect x="52" y="112" width="14" height="34" rx="2" fill="#C4CAD2"/>
    <rect x="66" y="122" width="176" height="8" rx="4" fill="#AFC6E8" stroke="#8FA6C6" stroke-width="1.1"/>
    <rect x="66" y="130" width="176" height="8" rx="4" fill="#9AA3AD" stroke="#7C8590" stroke-width="1.1"/>
    <text x="120" y="116" font-size="12" font-weight="700" fill="#5E7BA6">${o.top}(위)</text>
    <text x="120" y="152" font-size="12" font-weight="700" fill="#6B7684">${o.bottom}(아래)</text>
    <text x="172" y="198" text-anchor="middle" font-size="11" fill="#8B95A1">평소 모습 · 띠 끝이 접점에 닿아 열선으로 전류가 흐른다</text>
  </svg>`;
}

/** EG 온도-눈금 보간 그래프(라이트 · 파라미터형) · v1 expandScaleGraph(고정값) 대체 신작.
 *  조건 점 2개만 값 라벨(조건 수치는 허용) · 묻는 지점은 무표시 · 가이드 점선은 축까지 잇지
 *  않는다(g2u2 관행) · 정답은 눈금 위 검산 의무. */
export function htExpandGraphFig(o: { xMax: number; xStep: number; yMax: number; yStep: number; pts: [number, number][] }): string {
  const gx = (T: number): number => 40 + T * (280 / o.xMax);
  const gy = (n: number): number => 186 - (n / o.yMax) * 160;
  let xt = "";
  for (let T = 0; T <= o.xMax; T += o.xStep) {
    xt += `<line x1="${gx(T)}" y1="186" x2="${gx(T)}" y2="26" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(T)}" y="202" text-anchor="middle" font-size="10.5" fill="#8B95A1">${T}</text>`;
  }
  let yt = "";
  for (let n = 0; n <= o.yMax; n += o.yStep) {
    yt += `<line x1="40" y1="${gy(n)}" x2="320" y2="${gy(n)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="32" y="${gy(n) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${n}</text>`;
  }
  const [p1, p2] = o.pts;
  const slope = (p2[1] - p1[1]) / (p2[0] - p1[0]);
  const y0 = p1[1] - slope * p1[0];
  const xEnd = o.xMax * 0.96;
  // 라벨은 직선을 피해 배치(파일럿 1차 검수 반영 · 직선이 글자를 가로지르던 결함):
  // 아래 점은 점 아래(우하) · 위 점은 점 위(좌상 · anchor end) · 오름 직선과 겹치지 않는 사분면.
  const sorted = [...o.pts].sort((a, b) => a[1] - b[1]);
  const dots = sorted
    .map(([T, n], i) => {
      const label = `(${T} ℃, ${n}칸)`;
      const pos =
        i === 0
          ? `x="${gx(T) + 2}" y="${gy(n) + 19}" text-anchor="start"`
          : `x="${gx(T) - 7}" y="${gy(n) - 9}" text-anchor="end"`;
      return `<circle cx="${gx(T)}" cy="${gy(n)}" r="4.5" fill="#3182F6"/>
      <text ${pos} font-size="11.5" font-weight="700" fill="#1B64DA">${label}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="액체가 든 가는 유리관을 데우며 온도에 따라 액체 기둥의 눈금을 기록한 그래프. 직선 위에 측정한 점 두 개가 값과 함께 표시되어 있다">
    ${yt}${xt}
    <line x1="40" y1="26" x2="40" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="40" y1="186" x2="320" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${gx(0)}" y1="${gy(y0)}" x2="${gx(xEnd)}" y2="${gy(y0 + slope * xEnd)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${dots}
    <text x="8" y="14" font-size="11" fill="#4E5968">눈금(칸)</text>
    <text x="338" y="218" text-anchor="end" font-size="11" fill="#4E5968">온도(℃)</text>
  </svg>`;
}

/** IN 보온병 단면(라이트) · 층 이름 대신 ㉠㉡㉢ 기호(정답 인쇄 방지 기호판 · geoCycleQuizFig 계보).
 *  ㉠ 마개 · ㉡ 이중 벽 사이 진공 층 · ㉢ 반짝이는 안쪽 벽면. 확대분 사용 · 파일럿은 부록 눈검수. */
export function htInsulFig(): string {
  return `<svg viewBox="0 0 344 226" ${NS} fill="none" role="img" aria-label="보온병을 세로로 자른 단면 그림. 마개, 이중 벽 사이의 빈 층, 반짝이는 안쪽 벽면에 각각 동그라미 기호가 붙어 있다">
    <rect x="8" y="8" width="328" height="196" rx="14" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.4"/>
    <rect x="128" y="26" width="88" height="24" rx="6" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.6"/>
    <path d="M118 50 h108 v112 a14 14 0 0 1 -14 14 h-80 a14 14 0 0 1 -14 -14 Z" fill="#DCE0E6" stroke="#8B95A1" stroke-width="2"/>
    <path d="M132 60 h80 v98 a8 8 0 0 1 -8 8 h-64 a8 8 0 0 1 -8 -8 Z" fill="#FFF" stroke="#B0B8C1" stroke-width="1.6"/>
    <path d="M140 68 h64 v88 a6 6 0 0 1 -6 6 h-52 a6 6 0 0 1 -6 -6 Z" fill="#EAF3FF" stroke="#9FBBDF" stroke-width="1.4"/>
    <path d="M144 74 q6 22 0 44 q-4 18 2 36" stroke="#FFF" stroke-width="2.4" opacity=".9" fill="none"/>
    <path d="M146 92 c8 -5 16 -5 24 0 m-24 16 c8 -5 16 -5 24 0" stroke="#7FAFE4" stroke-width="1.6" fill="none" opacity=".7"/>
    <circle cx="86" cy="38" r="14" fill="#12203C" opacity="0"/>
    <circle cx="84" cy="38" r="14" fill="#FFF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="84" y="43" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">㉠</text>
    <path d="M98 40 L128 38" stroke="#3182F6" stroke-width="1.5"/>
    <circle cx="70" cy="112" r="14" fill="#FFF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="70" y="117" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">㉡</text>
    <path d="M84 112 L125 110" stroke="#3182F6" stroke-width="1.5"/>
    <circle cx="278" cy="92" r="14" fill="#FFF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="278" y="97" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">㉢</text>
    <path d="M264 94 L208 86" stroke="#3182F6" stroke-width="1.5"/>
    <text x="172" y="220" text-anchor="middle" font-size="11" fill="#8B95A1">보온병을 세로로 자른 단면</text>
  </svg>`;
}

/** LT 액체 열팽창 비교 장치(라이트 · 파라미터형) · liquidExpand(고정 A>B>C) 대체 신작.
 *  같은 부피 액체가 든 병 3개를 뜨거운 물 수조에 담근 뒤 유리관 높이 비교(천04 계보).
 *  rise는 px(처음 높이 기준선 위로) · 이름 라벨 파라미터. 확대분 사용 · 파일럿은 부록 눈검수. */
export function htLiquidTubesFig(tubes: { name: string; rise: number }[]): string {
  const xs = [52, 148, 244];
  const flask = (x: number, name: string, rise: number): string => `
    <rect x="${x + 21}" y="${60 - rise}" width="8" height="${52 + rise}" fill="#7FAFE4"/>
    <rect x="${x + 19}" y="18" width="12" height="96" rx="5" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M${x + 19} 108 L${x + 4} 138 a8 8 0 0 0 8 10 h26 a8 8 0 0 0 8 -10 L${x + 31} 108" fill="#B7D3F2" stroke="#8B95A1" stroke-width="1.8"/>
    <text x="${x + 25}" y="164" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${name}</text>`;
  return `<svg viewBox="0 0 344 216" ${NS} role="img" aria-label="같은 부피의 액체가 든 병 세 개를 뜨거운 물이 담긴 수조에 담근 실험 그림. 유리관 속 액체 기둥의 높이가 서로 다르다">
    <rect x="16" y="118" width="312" height="66" rx="12" fill="#FBE3DC" stroke="#E8B0A0" stroke-width="1.6"/>
    <path d="M40 130 q8 -5 16 0 t16 0" fill="none" stroke="#E8A08C" stroke-width="1.6"/>
    <path d="M262 130 q8 -5 16 0 t16 0" fill="none" stroke="#E8A08C" stroke-width="1.6"/>
    <text x="296" y="178" text-anchor="middle" font-size="11" fill="#B0705E">뜨거운 물</text>
    <line x1="36" y1="60" x2="308" y2="60" stroke="#8B95A1" stroke-width="1.4" stroke-dasharray="5 5"/>
    <text x="10" y="52" font-size="10.5" fill="#8B95A1">처음 높이</text>
    ${tubes.map((t, i) => flask(xs[i], t.name, t.rise)).join("")}
  </svg>`;
}

/** POT 냄비 단면(라이트) · 금속 몸통 ㉠ · 플라스틱 손잡이 ㉡ 기호판(이름 미인쇄 · 재질 판정 문항용).
 *  확대분 276 사용 · 갤러리 카드가 데뷔 눈검수를 겸한다. */
export function htPotFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="냄비를 세로로 자른 단면 그림. 몸통 부분과 손잡이 부분에 각각 동그라미 기호가 붙어 있다">
    <rect x="8" y="8" width="328" height="156" rx="14" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.4"/>
    <path d="M96 66 h152 v54 a10 10 0 0 1 -10 10 h-132 a10 10 0 0 1 -10 -10 Z" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.8"/>
    <rect x="96" y="66" width="152" height="9" fill="#B0B8C1"/>
    <ellipse cx="172" cy="100" rx="52" ry="16" fill="#DCEBFB" opacity=".85"/>
    <rect x="244" y="80" width="58" height="14" rx="7" fill="#2F3A48" stroke="#1F2833" stroke-width="1.4"/>
    <rect x="40" y="80" width="58" height="14" rx="7" fill="#2F3A48" stroke="#1F2833" stroke-width="1.4"/>
    <circle cx="140" cy="34" r="14" fill="#FFF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="140" y="39" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">㉠</text>
    <path d="M148 45 L162 66" stroke="#3182F6" stroke-width="1.5"/>
    <circle cx="292" cy="46" r="14" fill="#FFF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="292" y="51" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">㉡</text>
    <path d="M287 59 L280 78" stroke="#3182F6" stroke-width="1.5"/>
    <text x="172" y="180" text-anchor="middle" font-size="11" fill="#8B95A1">국을 끓이는 냄비 · ㉠ 몸통과 ㉡ 손잡이는 서로 다른 재료예요</text>
  </svg>`;
}

/** SE 태양-우주-지구 복사 도해(다크) · 사이 공간이 텅 비어 있음(입자 없음)을 라벨로 명시.
 *  확대분 280 사용 · 갤러리 카드가 데뷔 눈검수를 겸한다. */
export function htSunEarthFig(): string {
  return `<svg viewBox="0 0 344 150" ${NS} fill="none" role="img" aria-label="왼쪽의 태양에서 나온 열이 아무것도 없는 텅 빈 공간을 지나 오른쪽의 지구에 도달하는 모습을 나타낸 그림">
    <circle cx="52" cy="72" r="34" fill="#F2A93B"/>
    <circle cx="52" cy="72" r="26" fill="#FFE9A8"/>
    <g stroke="#F2A93B" stroke-width="2.2" stroke-linecap="round"><path d="M52 26 v-10 M52 118 v10 M6 72 h-2 M14 34 l-7 -7 M14 110 l-7 7"/></g>
    <circle cx="296" cy="72" r="24" fill="#3D6ED9"/>
    <path d="M282 62 q8 -6 14 0 t12 4 q-2 8 -10 8 t-16 -12" fill="#4CAF6E"/>
    <g stroke="#FF6B4A" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".9">
      <path d="M96 58 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>
      <path d="M96 86 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>
      <path d="M256 58 l10 3 -8 6 M256 86 l10 3 -8 6" stroke-width="2"/>
    </g>
    <text x="176" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#AFC3E3">태양과 지구 사이 · 아무것도 없는 텅 빈 공간</text>
    <text x="52" y="138" text-anchor="middle" font-size="12" font-weight="700" fill="#FFE9A8">태양</text>
    <text x="296" y="128" text-anchor="middle" font-size="12" font-weight="700" fill="#AFC3E3">지구</text>
  </svg>`;
}

/** 파일럿 부록 · 파일럿 문항이 안 쓴 신작 헬퍼의 데뷔 눈검수 카드(u7 v2 관행). */
export const PILOT_PREVIEW: { name: string; svg: string; dark?: boolean }[] = [
  { name: "IN 보온병 단면(확대분 273~275 예정)", svg: htInsulFig() },
  { name: "LT 액체 열팽창 3병(확대분 333·334·352 예정)", svg: htLiquidTubesFig([{ name: "에탄올", rise: 34 }, { name: "콩기름", rise: 18 }, { name: "물", rise: 8 }]) },
  { name: "RM 순환 화살표 모드(확대분 287 예정)", svg: htRoomFig({ arrows: "cool" }) },
  { name: "BM 띠 위로 휨 모드(확대분 356 등 예정)", svg: htBimetalFig({ top: "㉮", bottom: "㉯", mode: "strip", bend: "up" }) },
];

/* ══════════ 파일럿 40 문항 ══════════ */

export const POOL_U3V2_PILOT: ExamItem[] = [
  // [201 · d1 · 무①] 온도의 정의 · v1 e01과 보기 축 분리(새 미끼 4종). 정의 문항이라 무그림(화이트 ①).
  {
    id: "u3e201",
    lessonId: "u3l1",
    type: "mcq",
    diff: 1,
    prompt: "<b>온도</b>가 나타내는 것으로 가장 옳은 것은?",
    options: [
      "물체를 구성하는 입자 운동의 활발한 정도",
      "물체가 지금까지 받은 열의 총량",
      "물체를 구성하는 입자 하나하나의 크기",
      "물체 속에서 열이 이동하는 빠르기",
      "물체를 구성하는 입자의 개수",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>온도는 물체를 이루는 입자들이 <b>얼마나 활발하게 움직이는지</b>를 숫자로 나타낸 값이에요. 같은 물이라도 입자가 빠르게 움직이면 뜨겁고, 느리게 움직이면 차갑죠. 그래서 온도를 읽으면 그 물체 속 입자의 움직임을 짐작할 수 있어요.<span class='xh'>오답 하나씩 격파</span>'받은 열의 총량'은 열과 온도를 섞은 생각이에요. 열은 온도 차가 있을 때 <b>이동하는 에너지</b>이지, 물체에 차곡차곡 쌓아 둔 양이 아니에요. '입자 하나하나의 크기'와 '입자의 개수'는 온도가 변해도 <b>그대로</b>라서 온도의 정체가 될 수 없어요. '열이 이동하는 빠르기'는 물질의 종류에 따라 다른 성질이지, 온도라는 값 자체가 아니랍니다.",
    core: "온도 = 입자 운동이 활발한 정도. 크기·개수가 아니라 <b>움직임</b>이에요.",
  },
  // [202 · d1 · PB2] 간격+잔상 차등 모형(천재 계보) · 판단 근거 결합형 · 설명 완비 보기라 셔플 허용.
  {
    id: "u3e202",
    lessonId: "u3l1",
    type: "mcq",
    diff: 1,
    prompt: "그림은 같은 종류의 물 (가)와 (나)의 입자 운동 모형이에요. 온도가 더 <b>높은</b> 것과 그렇게 판단한 까닭을 옳게 짝 지은 것은?",
    figure: htParticleBoxFig([
      { label: "(가)", spread: 22, trail: 0 },
      { label: "(나)", spread: 30, trail: 8 },
    ]),
    figureDark: true,
    options: [
      "(나) · 입자 운동이 더 활발하고 입자 사이 간격이 넓다",
      "(가) · 입자들이 가지런히 모여 있어 안정적이다",
      "(나) · 입자의 개수가 더 많다",
      "(가) · 입자 하나하나의 크기가 더 크다",
      "(나) · 입자가 무거워 보인다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>모형에서 온도의 단서는 <b>움직임(잔상)과 입자 사이 간격</b> 두 가지예요. (나)는 입자마다 떨림 표시가 두 줄로 그려져 있고 간격도 넓으니 입자 운동이 활발한, 즉 온도가 높은 물이에요.<span class='xh'>오답 하나씩 격파</span>'가지런히 모여 있어 안정적'이라는 판단은 거꾸로예요. 차가울수록 입자가 둔해져 촘촘하고 가지런해 보일 뿐, 안정과 온도는 관계가 없어요. '개수가 많다'는 틀린 관찰이에요. 두 상자의 입자 수는 9개로 같아요. 온도가 변해도 입자의 <b>개수와 크기는 변하지 않으니</b>, 크기나 무게로 온도를 판단하는 보기도 전부 성립하지 않아요.",
    core: "입자 모형 읽기: 떨림 줄이 많고 간격이 넓을수록 온도가 높아요.",
  },
  // [203 · d1 · PB3] 미래엔 계보 이식: 간격은 셋 다 같게(26) · 잔상 수준만 차등 · "많으면/촘촘하면
  // 뜨겁다" 오개념 봉쇄. 순서 (나)>(가)>(다) · 레슨 정답 배열 (다)>(나)>(가) 회피 ✓ · 부등호 나열
  // 보기는 독립 완결이라 셔플 허용.
  {
    id: "u3e203",
    lessonId: "u3l1",
    type: "mcq",
    diff: 1,
    prompt: "그림은 온도가 서로 다른 같은 종류의 물 (가)~(다)의 입자 운동 모형이에요. 입자의 <b>개수와 간격은 모두 같고 움직임만 달라요.</b> 세 물의 온도를 옳게 비교한 것은?",
    figure: htParticleBoxFig([
      { label: "(가)", spread: 26, trail: 5 },
      { label: "(나)", spread: 26, trail: 10 },
      { label: "(다)", spread: 26, trail: 0 },
    ]),
    figureDark: true,
    options: [
      "(나) > (가) > (다)",
      "(다) > (가) > (나)",
      "(가) > (나) > (다)",
      "(다) > (나) > (가)",
      "세 물의 온도는 모두 같다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>이 모형은 입자의 개수도, 간격도 전부 같아요. 남은 단서는 단 하나, <b>입자 옆 떨림 표시</b>죠. 떨림 줄이 두 줄로 가장 많은 (나)가 입자 운동이 제일 활발한 물, 떨림 줄이 없는 (다)가 가장 둔한 물이에요. 그래서 (나) > (가) > (다) 순서예요.<span class='xh'>함정 포인트</span>'입자가 많거나 촘촘하면 뜨겁다'는 판단은 이 문제에서 통하지 않아요. 개수와 간격을 일부러 똑같이 맞춰 놓았거든요. 온도를 결정하는 건 입자의 양이 아니라 <b>운동의 활발한 정도</b>라는 것, 이 모형이 그 증거예요. '모두 같다'를 골랐다면 잔상 표시를 놓친 거랍니다.",
    core: "개수·간격이 같아도 <b>움직임</b>이 다르면 온도가 달라요.",
  },
  // [206 · d2 · 무①] 부정형 · 크기 증가 미끼가 정답(거짓 진술) · 나머지 4보기는 참.
  {
    id: "u3e206",
    lessonId: "u3l1",
    type: "mcq",
    diff: 2,
    prompt: "온도와 입자 운동에 대한 설명으로 옳지 <b>않은</b> 것은?",
    options: [
      "물을 가열하면 물 입자 하나하나의 크기가 점점 커진다",
      "온도가 높을수록 입자 운동이 활발하다",
      "물체를 냉각하면 입자 사이의 거리가 가까워진다",
      "온도의 단위로 ℃(섭씨도)를 쓴다",
      "온도가 같은 두 물은 입자 운동의 활발한 정도가 같다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>가열해도 입자 <b>하나하나의 크기는 변하지 않아요</b>. 변하는 것은 입자의 움직임과 입자 <b>사이의 거리</b>뿐이에요. 뜨거워진 물이 부풀어 보여도 입자가 커진 게 아니라 입자들 사이가 벌어진 것이랍니다. 그래서 이 보기가 옳지 않은 설명이에요.<span class='xh'>나머지 보기 점검</span>온도가 높을수록 입자 운동이 활발한 것, 냉각하면 거리가 가까워지는 것은 가열·냉각의 기본 짝이에요. ℃는 온도의 단위가 맞고, 온도가 같다는 건 곧 입자 운동의 활발한 정도가 같다는 뜻이니 그 설명도 참이죠. '옳지 않은 것' 문제에서는 <b>크기·개수가 변한다</b>는 문장이 단골 함정이라는 걸 기억해요.",
    core: "가열·냉각으로 변하는 건 움직임과 <b>사이 거리</b>. 입자 크기·개수는 불변!",
  },
  // [210 · d2 · TM num] 온도계 눈금 판독 · 큰 눈금 10 ℃ · 작은 눈금 2 ℃ · 값 34(v1 26 회피 ·
  // 작은 눈금 위 ✓) · aria에 정답 없음(thermometerRead aria는 중립).
  {
    id: "u3e210",
    lessonId: "u3l1",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "℃",
    prompt: "그림은 물의 온도를 재고 눈금이 멈춘 뒤의 알코올 온도계예요. 큰 눈금 한 칸은 <b>10 ℃</b>, 작은 눈금 한 칸은 <b>2 ℃</b>예요. 온도계가 가리키는 온도는 몇 ℃일까요?",
    figure: thermometerRead(34),
    answer: "34",
    explain:
      "<span class='xh'>정답 풀이</span>액체 기둥의 끝을 찾고 눈금을 읽어요. ① 기둥 끝 바로 아래의 큰 눈금은 30 ℃예요. ② 거기서 작은 눈금 두 칸을 더 올라갔으니 2 ℃씩 두 번, 4 ℃를 더해요. ③ 30 + 4 = <b>34 ℃</b>가 답이에요.<span class='xh'>이렇게 확인해요</span>온도계를 읽을 때는 눈을 액체 기둥 끝과 <b>같은 높이</b>에 두고, 작은 눈금 한 칸이 몇 ℃인지 먼저 확인하는 게 순서예요. 이 온도계는 한 칸이 1 ℃가 아니라 2 ℃라서, 칸 수를 그대로 더해 32 ℃로 읽거나 큰 눈금만 보고 30 ℃로 읽기 쉬워요. 눈금이 멈춘 뒤에 읽는 까닭은 온도계와 물이 열평형에 이르러야 눈금이 물의 온도를 나타내기 때문이랍니다.",
    core: "작은 눈금 한 칸의 값부터 확인! 30 + 2×2 = 34 ℃.",
  },
  // [215 · d2 · 무①] "차가우면 입자가 멈춘다" 오개념 정면 격파 · 옳은 것 고르기.
  {
    id: "u3e215",
    lessonId: "u3l1",
    type: "mcq",
    diff: 2,
    prompt: "얼음물처럼 아주 차가운 물속의 <b>입자</b>에 대한 설명으로 옳은 것은?",
    options: [
      "느리게나마 끊임없이 움직이고 있다",
      "완전히 멈추어 제자리에 고정되어 있다",
      "온도가 낮아 입자가 모두 사라진다",
      "입자 하나하나가 쪼그라들어 작아진다",
      "움직임이 없어 온도를 잴 수 없다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>아무리 차가워도 물질을 이루는 입자는 <b>완전히 멈추지 않아요</b>. 얼음물 속 입자도 아주 느리게, 그러나 끊임없이 움직이고 있죠. 온도가 낮다는 것은 입자 운동이 <b>둔하다</b>는 뜻이지 <b>없다</b>는 뜻이 아니에요.<span class='xh'>오답 하나씩 격파</span>'완전히 멈춘다'가 이 단원의 대표 함정이에요. 차가움을 정지로 착각하기 쉽지만, 입자는 느려질 뿐 멈추는 일이 없어요. '입자가 사라진다'와 '쪼그라든다'는 둘 다 틀렸어요. 냉각해도 입자의 <b>개수와 크기는 그대로</b>고 사이 거리만 가까워져요. 입자가 계속 움직이고 있으니 그 활발한 정도, 즉 온도도 당연히 잴 수 있답니다.",
    core: "입자는 절대 멈추지 않아요. 차가움 = 느린 움직임!",
  },
  // [219 · d3 · dbox] 관찰 기록 텍스트 → 온도 순서 추론(실측 조건 상자 계보) · 203 그림 판독과
  // 축 분리(말로 된 기록 해석) · 순서 (다)>(가)>(나) · 203 정답 배열과 분리 ✓.
  {
    id: "u3e219",
    lessonId: "u3l1",
    type: "mcq",
    diff: 3,
    prompt: "다음은 같은 종류의 물 (가)~(다)의 입자 운동을 관찰해 기록한 내용이에요. 세 물의 온도를 <b>높은 것부터</b> 순서대로 나열한 것은?",
    figure: dbox([
      ["(가)", "입자들이 느리게 움직이고, 입자 사이 간격이 조금 벌어져 있다."],
      ["(나)", "입자들이 거의 제자리에서 아주 느리게 움직이고, 간격이 가장 촘촘하다."],
      ["(다)", "입자들이 빠르게 움직이고, 입자 사이 간격이 가장 넓다."],
    ]),
    options: [
      "(다) > (가) > (나)",
      "(나) > (가) > (다)",
      "(가) > (다) > (나)",
      "(다) > (나) > (가)",
      "(나) > (다) > (가)",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>기록에서 온도의 단서를 뽑아요. ① (다)는 '빠르게 움직이고 간격이 가장 넓다'니 입자 운동이 가장 활발한, 온도가 가장 높은 물이에요. ② (가)는 '느리게 + 조금 벌어짐'으로 중간이에요. ③ (나)는 '거의 제자리 + 가장 촘촘'이니 가장 차갑죠. 그래서 (다) > (가) > (나) 순서예요.<span class='xh'>함정 포인트</span>그림 대신 <b>글로 적힌 관찰 기록</b>을 해석하는 문제예요. 판단 기준은 그림일 때와 똑같아요. 움직임이 활발할수록, 간격이 넓을수록 온도가 높다는 것이죠. (나)와 (가)를 헷갈렸다면 '거의 제자리'와 '느리게'라는 표현의 차이를 놓친 거예요. 기록형 문제는 표현 하나하나를 근거로 순위를 매기는 연습이 필요해요.",
    core: "관찰 기록도 기준은 같아요: 활발할수록·간격 넓을수록 고온.",
  },
  // [225 · multi d1 · 무①] 온도 옳은 설명 모두 · 참 3(정의·단위·같은 온도=같은 활발함) ·
  // 거짓 2(개수·총량) · multi answer 3개.
  {
    id: "u3e225",
    lessonId: "u3l1",
    type: "multi",
    diff: 1,
    prompt: "<b>온도</b>에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    options: [
      "입자 운동의 활발한 정도를 나타내는 값이다",
      "단위로 ℃(섭씨도)를 쓴다",
      "온도가 같으면 입자 운동의 활발한 정도도 같다",
      "입자의 개수가 많을수록 온도가 높다",
      "물체가 가진 열의 총량을 나타낸다",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>보기 하나씩 판정</span>첫째, 온도는 입자 운동의 활발한 정도를 나타내는 값이 맞아요 ✓ 둘째, 단위는 ℃를 써요 ✓ 셋째, 온도가 같다는 것은 곧 입자 운동의 활발한 정도가 같다는 뜻이에요 ✓ 이 세 가지가 옳은 설명이에요.<span class='xh'>오답 하나씩 격파</span>'입자의 개수가 많을수록 온도가 높다'는 틀렸어요. 큰 컵의 미지근한 물은 입자가 많아도 온도가 낮고, 작은 잔의 뜨거운 물은 입자가 적어도 온도가 높죠. 개수는 물의 양을 정할 뿐이에요. '열의 총량'도 틀렸어요. 열은 온도 차가 있을 때 이동하는 에너지의 이름이지, 온도가 그 총량을 세는 값이 아니랍니다.",
    core: "온도 = 활발한 정도(℃). 입자 개수·열의 총량과 혼동 금지!",
  },
  // ══════════ L2 열평형 (u3l2) ══════════
  // [229 · d1 · 무①] 열의 정의 · 고온→저온 · '차가움 이동' 미끼.
  {
    id: "u3e229",
    lessonId: "u3l2",
    type: "mcq",
    diff: 1,
    prompt: "<b>열</b>에 대한 설명으로 가장 옳은 것은?",
    options: [
      "온도가 높은 물체에서 낮은 물체로 이동하는 에너지이다",
      "온도가 낮은 물체에서 높은 물체로 이동하는 에너지이다",
      "차가운 물체가 가진 차가움이 옮겨 가는 것이다",
      "물체가 태어날 때부터 가지고 있는 온도이다",
      "온도가 같은 두 물체 사이에서만 이동하는 에너지이다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>열은 온도 차가 있을 때 <b>온도가 높은 물체에서 낮은 물체로</b> 이동하는 에너지예요. 열을 잃은 쪽은 온도가 내려가고, 얻은 쪽은 올라가죠.<span class='xh'>오답 하나씩 격파</span>'낮은 쪽에서 높은 쪽으로'는 방향을 뒤집은 함정이에요. 열은 언제나 고온에서 저온으로만 이동해요. '차가움이 옮겨 간다'도 자주 나오는 착각인데, 이동하는 것은 언제나 <b>열</b>이지 차가움이라는 것이 따로 있지 않아요. 얼음을 쥔 손이 시린 것도 차가움이 들어와서가 아니라 손의 열이 얼음으로 빠져나가기 때문이죠. '온도'는 열과 다른 개념이고, 온도가 <b>같은</b> 두 물체 사이에서는 열이 이동하지 않아요.",
    core: "열 = 고온 → 저온으로 이동하는 에너지. 차가움은 이동하지 않아요!",
  },
  // [230 · d2 · EQ-A] 그래프 종합 부정형 · EQ-A(90/30 → 50 ℃ · 3분 · 6분 눈금) · 함정 보기 =
  // 평형 시각 어긋난 읽기("2분부터") · 검산: 수렴 50은 30~90 사이 ✓ · 눈금 위(yStep 10) ✓.
  {
    id: "u3e230",
    lessonId: "u3l2",
    type: "mcq",
    diff: 2,
    prompt: "그림은 뜨거운 물 (가)가 든 컵을 찬물 (나)가 든 수조에 넣었을 때 시간에 따른 온도 변화예요. 옳지 <b>않은</b> 것은?",
    figure: eqGraph({ hot: 90, cold: 30, eq: 50, tEq: 3, tMax: 6, yMax: 100, yStep: 10 }),
    options: [
      "2분일 때 두 물은 열평형 상태이다",
      "열은 (가)에서 (나)로 이동한다",
      "(가)는 열을 잃어 온도가 낮아진다",
      "1분일 때 (가)의 입자 운동이 (나)보다 활발하다",
      "3분부터 두 물의 온도는 같다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>두 곡선이 만나 나란해지는 때가 열평형이에요. 그래프에서 두 곡선은 <b>3분</b>에 만나요. 2분일 때는 아직 (가)가 더 뜨거워서 열이 이동하는 중이니, '2분일 때 열평형'이라는 설명이 옳지 않아요.<span class='xh'>나머지 보기 점검</span>(가)는 온도가 내려가는 곡선이니 열을 <b>잃는</b> 쪽이고, 열은 뜨거운 (가)에서 차가운 (나)로 이동해요. 1분일 때는 (가)의 온도가 더 높으니 입자 운동도 (가)가 활발하죠. 3분부터 두 곡선이 겹쳐 나란하니 온도가 같다는 보기도 참이에요. 열평형 그래프에서는 <b>곡선이 만나는 시각</b>을 정확히 읽는 것이 핵심이랍니다.",
    core: "열평형 = 두 곡선이 만나는 순간부터. 만나기 전엔 아직 이동 중!",
  },
  // [232 · d2 · EQ-B num] 평형 온도 판독 · EQ-B(80/20 → 60 ℃ · 5분) · 답 60(눈금 위 ✓ ·
  // 레슨 40 ℃ · v1 세트 회피 ✓) · 비대칭 수렴(뜨거운 쪽 양이 많은 상황 · 문두에 질량 언급 없음).
  {
    id: "u3e232",
    lessonId: "u3l2",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "℃",
    prompt: "그림은 수조의 뜨거운 물 (가) 속에 찬물 (나)가 담긴 비커를 넣었을 때 시간에 따른 온도 변화예요. 두 물이 도달한 <b>열평형 온도</b>는 몇 ℃일까요?",
    figure: eqGraph({ hot: 80, cold: 20, eq: 60, tEq: 5, tMax: 8, yMax: 100, yStep: 10 }),
    answer: "60",
    explain:
      "<span class='xh'>정답 풀이</span>열평형 온도는 두 곡선이 만나 나란해진 높이의 눈금이에요. ① (가) 곡선은 80 ℃에서 내려오고 (나) 곡선은 20 ℃에서 올라와요. ② 두 곡선은 한 점에서 만나 그 뒤로 나란히 가요. ③ 그 높이의 세로축 눈금을 읽으면 <b>60 ℃</b>예요.<span class='xh'>이렇게 확인해요</span>만난 온도가 80과 20의 한가운데(50 ℃)가 아니라는 점도 눈여겨봐요. 수조의 뜨거운 물이 비커의 찬물보다 훨씬 많아서, 평형 온도가 뜨거운 물 쪽에 가깝게 정해진 거예요. 열평형 온도는 언제나 두 처음 온도 <b>사이</b>에 있지만, 꼭 한가운데인 것은 아니랍니다. 그래프 문제에서는 계산보다 <b>눈금을 정확히 읽는 것</b>이 먼저예요.",
    core: "열평형 온도 = 두 곡선이 만난 높이의 눈금. 꼭 한가운데는 아니에요!",
  },
  // [235 · d3 · dbox num] 같은 질량·같은 물질 중간값 · 70/30 → 50 ℃(v1 60/20 → 40 회피) ·
  // 검산: 같은 질량 같은 물질이라 산술 중간값 성립 ✓ · 조건(질량 같음 · 빠져나간 열 없음) 명시.
  {
    id: "u3e235",
    lessonId: "u3l2",
    type: "num",
    diff: 3,
    numKind: "int",
    unitLabel: "℃",
    prompt: "다음 조건으로 두 물을 접촉시켰어요. 충분한 시간이 지났을 때 두 물의 <b>열평형 온도</b>는 몇 ℃일까요?",
    figure: dbox([
      ["(가)", "70 ℃의 물 200 g"],
      ["(나)", "30 ℃의 물 200 g"],
      ["조건", "열은 두 물 사이에서만 이동하고 바깥으로 빠져나가지 않는다."],
    ]),
    answer: "50",
    explain:
      "<span class='xh'>정답 풀이</span>① 두 물은 <b>같은 물질(물)이고 질량도 200 g으로 같아요</b>. ② 열이 바깥으로 새지 않으니 (가)가 잃은 열을 (나)가 그대로 받아요. ③ 조건이 완전히 대칭이라 (가)가 내려간 만큼 (나)가 올라가, 열평형 온도는 두 온도의 한가운데인 (70 + 30) ÷ 2 = <b>50 ℃</b>가 돼요. (가)는 20 ℃ 내려가고 (나)는 20 ℃ 올라간 셈이죠.<span class='xh'>함정 포인트</span>'한가운데'는 아무 때나 쓸 수 있는 규칙이 아니에요. <b>같은 물질을 같은 질량으로</b> 섞을 때만 성립해요. 질량이 다르면 평형 온도는 양이 많은 쪽 온도에 가까워지고, 물질이 다르면 온도가 변하는 정도 자체가 달라져요. 문제의 조건 상자에서 질량과 물질이 같은지부터 확인하는 습관을 들여요.",
    core: "같은 물질·같은 질량일 때만 한가운데! (70+30)÷2 = 50 ℃.",
  },
  // [238 · d2 · PB2] 접촉 시 입자 운동 변화 · 주어 바꿔치기 함정(비상 계보) · 그림은 접촉 전 모형.
  {
    id: "u3e238",
    lessonId: "u3l2",
    type: "mcq",
    diff: 2,
    prompt: "그림은 접촉하기 전의 물 (가)와 (나)의 입자 운동 모형이에요. 두 물을 맞닿게 했을 때 일어나는 변화로 옳은 것은?",
    figure: htParticleBoxFig([
      { label: "(가)", spread: 30, trail: 9 },
      { label: "(나)", spread: 22, trail: 0 },
    ]),
    figureDark: true,
    options: [
      "(가)의 입자 운동은 둔해지고 (나)의 입자 운동은 활발해진다",
      "(가)의 입자 운동은 활발해지고 (나)의 입자 운동은 둔해진다",
      "(가)와 (나)의 입자 운동이 모두 활발해진다",
      "(가)와 (나)의 입자 운동이 모두 둔해진다",
      "두 물의 입자 운동에 아무 변화가 없다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>모형을 읽으면 (가)는 떨림 줄이 많고 간격이 넓으니 뜨거운 물, (나)는 차가운 물이에요. 맞닿으면 열은 뜨거운 (가)에서 차가운 (나)로 이동해요. 열을 <b>잃는 (가)</b>의 입자 운동은 점점 둔해지고, 열을 <b>얻는 (나)</b>는 점점 활발해지죠.<span class='xh'>함정 포인트</span>어느 쪽이 뜨거운지 그림에서 먼저 확정하지 않으면 주어가 뒤바뀐 보기에 걸려요. '모두 활발해진다'거나 '모두 둔해진다'는 열이 한쪽에서 다른 쪽으로 <b>옮겨 가는</b> 에너지라는 사실과 맞지 않아요. 한쪽이 잃으면 다른 쪽이 얻는 짝이니까요. 변화가 없으려면 처음부터 두 물의 온도가 같아야 한답니다.",
    core: "잃는 쪽(고온)은 둔해지고, 얻는 쪽(저온)은 활발해져요.",
  },
  // [243 · d2 · EQ-D] 질량 다른 두 물 · 수렴점이 찬물 쪽(50/20 → 30 ℃) → 찬물 양이 많다 판정 ·
  // 검산: m가×(50−30) = m나×(30−20) → m나 = 2×m가 ✓ · 중간값(35)이 아님을 판독.
  {
    id: "u3e243",
    lessonId: "u3l2",
    type: "mcq",
    diff: 2,
    prompt: "50 ℃의 물 (가)와 20 ℃의 물 (나)를 접촉시켰더니 그림처럼 <b>30 ℃</b>에서 열평형이 되었어요. 이 그래프에 대한 해석으로 가장 옳은 것은?",
    figure: eqGraph({ hot: 50, cold: 20, eq: 30, tEq: 5, tMax: 8, yMax: 60, yStep: 10 }),
    options: [
      "(나)의 양이 (가)보다 많다",
      "(가)의 양이 (나)보다 많다",
      "두 물의 양이 정확히 같다",
      "열이 (나)에서 (가)로 이동했다",
      "두 물은 열평형에 도달하지 못했다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>두 물의 양이 같다면 평형 온도는 50과 20의 한가운데인 35 ℃가 되어야 해요. 그런데 실제로는 <b>30 ℃</b>, 찬물 쪽에 치우쳐 만났어요. 이것은 (가)가 20 ℃나 내려가는 동안 (나)는 10 ℃만 올랐다는 뜻이에요. 같은 열을 주고받았는데 (나)의 온도가 조금만 변했다는 것은 <b>(나)의 양이 그만큼 많다</b>는 증거죠.<span class='xh'>오답 하나씩 격파</span>(가)의 양이 많았다면 평형 온도는 반대로 50 ℃ 쪽에 가까워졌을 거예요. '정확히 같다'면 35 ℃에서 만났어야 하고요. 열은 언제나 고온인 (가)에서 (나)로 이동했고, 두 곡선이 만나 나란해졌으니 열평형에는 분명히 도달했어요. 평형 온도가 <b>어느 쪽에 치우쳤는지</b>가 양을 비교하는 단서가 된답니다.",
    core: "평형 온도가 치우친 쪽 = 양이 많은 쪽. 한가운데는 같은 양일 때만!",
  },
  // [250 · d2 · 무②] 감각과 온도 분리 · 같은 방 금속/나무 의자(미래엔 철봉 계보 · v1 책상/필통 회피) ·
  // L2 축 = 열평형이라 온도 같음(전도 빠르기는 L3 몫이라 '열을 빠르게 빼앗아'까지만 서술).
  {
    id: "u3e250",
    lessonId: "u3l2",
    type: "mcq",
    diff: 2,
    prompt: "겨울날 밤새 같은 거실에 놓여 있던 <b>금속 의자</b>와 <b>나무 의자</b>가 있어요. 아침에 두 의자를 만지면 금속 의자가 훨씬 차갑게 느껴져요. 두 의자의 실제 <b>온도</b>를 옳게 비교한 것은?",
    options: [
      "두 의자의 온도는 같다",
      "금속 의자의 온도가 더 낮다",
      "나무 의자의 온도가 더 낮다",
      "만져 보기 전에는 비교할 수 없다",
      "금속 의자만 밤새 계속 온도가 내려간다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>두 의자는 밤새 같은 거실 공기와 열을 주고받아 <b>열평형</b>에 이르렀어요. 열평형이 되면 온도가 같아지니, 재료가 달라도 두 의자의 온도는 거실 공기와 똑같아요.<span class='xh'>함정 포인트</span>'더 차갑게 느껴지니까 온도가 낮다'가 이 문제의 핵심 함정이에요. 차갑게 <b>느껴지는</b> 것은 금속이 손의 열을 훨씬 빠르게 빼앗아 가기 때문이지, 온도가 낮아서가 아니에요. 감각은 온도계가 아니라 <b>열을 빼앗기는 빠르기</b>에 속아요. 그래서 온도 비교는 손이 아니라 온도계로 해야 하죠. 오래 함께 놓인 물체들은 전부 열평형이라 온도가 같다는 것, 꼭 기억해요.",
    core: "오래 같이 둔 물체는 열평형 = 온도 같음. 차가운 느낌은 온도가 아니에요!",
  },
  // [255 · multi d2 · EQ-B] 같은 그림 3탄 · 보기는 전부 수치 없는 서술(232 · 233 num 정답 유출 차단) ·
  // 참 3(방향 · (나) 활발해짐 · 평형 후 이동 없음) · 거짓 2.
  {
    id: "u3e255",
    lessonId: "u3l2",
    type: "multi",
    diff: 2,
    prompt: "그림은 수조의 뜨거운 물 (가) 속에 찬물 (나)가 담긴 비커를 넣었을 때의 온도 변화예요. 옳은 설명을 <b>모두</b> 고르세요.",
    figure: eqGraph({ hot: 80, cold: 20, eq: 60, tEq: 5, tMax: 8, yMax: 100, yStep: 10 }),
    options: [
      "열은 (가)에서 (나)로 이동한다",
      "(가)와 (나)의 온도 차는 시간이 지날수록 줄어든다",
      "열평형에 이른 뒤에는 열이 이동하지 않는다",
      "(가)와 (나)의 온도 차는 시간이 지날수록 커진다",
      "(나)는 열을 잃어 온도가 낮아진다",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>보기 하나씩 판정</span>그래프에서 (가)는 내려가고 (나)는 올라가요. '열은 (가)에서 (나)로 이동한다'는 참 ✓ 두 곡선이 점점 가까워지니 온도 차는 줄어들기만 해요 ✓ 두 곡선이 만나 나란해진 뒤에는 온도 차가 없어 열이 더 이상 이동하지 않아요 ✓<span class='xh'>오답 하나씩 격파</span>'온도 차가 점점 커진다'는 그래프와 정반대예요. 두 곡선은 만날 때까지 가까워지기만 하죠. '(나)가 열을 잃는다'도 방향을 뒤집은 함정이에요. 올라가는 곡선은 열을 <b>얻고 있다</b>는 뜻이랍니다. 그래프 문제에서는 곡선의 방향이 곧 열을 얻는지 잃는지를 말해 줘요.",
    core: "곡선이 오르면 열을 얻는 중! 만난 뒤엔 이동 끝.",
  },
  // ══════════ L3 열의 이동 (u3l3) ══════════
  // [259 · d1 · SC hearth] 한 장면 3방식 짝(실측 계보 · 캠핑 만화 소재 회피 = 벽난로) ·
  // 라벨 조합 보기 shuffle:false · 관례 순서 저작 · 정답 ② (첫 칸 금지 ✓).
  {
    id: "u3e259",
    lessonId: "u3l3",
    type: "mcq",
    diff: 1,
    prompt: "그림은 벽난로 불 위에 걸린 주전자와 그 앞에서 손을 쬐는 모습이에요. <b>A</b>(주전자 속 물), <b>B</b>(주전자의 금속 손잡이), <b>C</b>(불 앞에 내민 손)에서 열이 전달되는 방식을 옳게 짝 지은 것은?",
    figure: htSceneFig("hearth"),
    options: [
      "A 전도 · B 대류 · C 복사",
      "A 대류 · B 전도 · C 복사",
      "A 대류 · B 복사 · C 전도",
      "A 복사 · B 전도 · C 대류",
      "A 전도 · B 복사 · C 대류",
    ],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>A 주전자 속 물은 아래에서 데워진 물이 <b>직접 위로 올라가고</b> 찬 물이 내려오며 빙글빙글 도니 대류예요. B 금속 손잡이는 불에 닿지 않았는데도 몸통에서 손잡이 끝까지 열이 <b>차례차례</b> 타고 오니 전도죠. C 불 앞의 손은 닿지도 않았는데 후끈해요. 열이 <b>물질을 거치지 않고 직접</b> 날아온 복사예요.<span class='xh'>구분하는 눈</span>세 방식은 '무엇이 열을 나르는가'로 갈라요. 입자가 직접 자리를 옮기면 대류, 입자는 제자리에서 흔들리며 이웃에게 넘기면 전도, 나르는 물질 없이 직접 도달하면 복사예요. 한 장면 안에 세 방식이 함께 있어도 이 기준 하나면 헷갈리지 않아요.",
    core: "물 순환 = 대류 · 금속 타고 = 전도 · 안 닿아도 후끈 = 복사.",
  },
  // [260 · d1 · 무①] 전도의 정의 · 대류 정의를 미끼로(방식 정의 교차 판별).
  {
    id: "u3e260",
    lessonId: "u3l3",
    type: "mcq",
    diff: 1,
    prompt: "<b>전도</b>에 대한 설명으로 가장 옳은 것은?",
    options: [
      "입자의 운동이 이웃한 입자에 차례로 전달되어 열이 이동한다",
      "가열된 입자가 직접 이동하면서 열을 실어 나른다",
      "열이 물질을 거치지 않고 직접 이동한다",
      "온도가 다른 두 물체의 온도가 같아지는 현상이다",
      "열의 이동을 막아 온도를 유지하는 방법이다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>전도는 가열된 곳의 입자가 활발하게 흔들리면, 그 흔들림이 <b>이웃한 입자에게 차례로</b> 전달되며 열이 이동하는 방식이에요. 입자는 제자리에서 흔들릴 뿐 이동하지 않고, 운동만 릴레이처럼 이어지죠. 주로 고체에서 일어나요.<span class='xh'>오답 하나씩 격파</span>'입자가 직접 이동하며 나른다'는 대류의 정의예요. 액체·기체에서 데워진 입자가 실제로 자리를 옮기는 방식이죠. '물질을 거치지 않고 직접'은 복사이고, '온도가 같아지는 현상'은 열평형, '이동을 막는 방법'은 단열이에요. 이 단원의 용어들은 정의의 핵심 구절이 서로 확실히 다르니, '무엇이 열을 나르는가'를 기준으로 구분해 두면 정의 문제는 흔들리지 않아요.",
    core: "전도 = 제자리 흔들림의 릴레이. 입자가 직접 가면 대류!",
  },
  // [263 · d2 · RD bogi] 세 막대 비교 · 알루미늄/철/나무(레슨 구리/철/유리 조합 회피) ·
  // ㄷ = "입자 직접 이동" 오개념(실측 단골) · 정답 ㄱ,ㄴ = ③ (첫 칸 금지 ✓).
  {
    id: "u3e263",
    lessonId: "u3l3",
    type: "mcq",
    diff: 2,
    prompt: "그림은 굵기와 길이가 같은 알루미늄·철·나무 막대의 왼쪽 끝을 같은 불로 동시에 가열했을 때, 잠시 후 데워진 부분을 나타낸 거예요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: htRodsFig([
      { name: "알루미늄", frac: 0.82 },
      { name: "철", frac: 0.48 },
      { name: "나무", frac: 0.07 },
    ]),
    figureDark: true,
    bogi: [
      "열은 가열한 끝에서 반대쪽 끝을 향해 이동한다.",
      "열은 철보다 알루미늄에서 더 잘 이동한다.",
      "막대 속 입자가 반대쪽 끝까지 직접 이동하며 열을 전달한다.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 데워진 부분이 가열한 왼쪽 끝에서 시작해 오른쪽으로 번져 있으니, 열이 가열부에서 먼 쪽으로 이동한다는 설명은 옳아요. ㄴ: 같은 시간 동안 알루미늄이 철보다 훨씬 멀리 데워졌죠. 열이 이동하는 정도는 물질마다 달라서, 알루미늄이 철보다 열이 잘 이동해요. 옳아요. ㄷ이 함정이에요. 전도에서 입자는 <b>제자리에서 흔들리며</b> 이웃에게 운동을 전달할 뿐, 막대를 따라 직접 이동하지 않아요.<span class='xh'>함정 포인트</span>'입자가 직접 이동한다'는 대류의 설명을 전도에 심어 놓은 단골 오답이에요. 나무가 거의 데워지지 않은 것도 함께 봐 두세요. 금속은 열이 잘 이동하고 나무는 잘 이동하지 않아요.",
    core: "전도 빠르기는 물질마다 다르다. 입자는 제자리, 운동만 릴레이!",
  },
  // [266 · d2 · RM] 냉방기 위치+까닭 짝 · 그림은 중립(A 위 · B 아래 배지만) · 설명 완비 보기라 셔플.
  {
    id: "u3e266",
    lessonId: "u3l3",
    type: "mcq",
    diff: 2,
    prompt: "그림의 방에 냉방기를 설치하려고 해요. 방 전체를 골고루 시원하게 만들 수 있는 <b>위치</b>와 그 <b>까닭</b>을 옳게 짝 지은 것은?",
    figure: htRoomFig({ arrows: "none" }),
    options: [
      "A · 차가워진 공기가 아래로 내려오면서 방 전체를 돌기 때문",
      "B · 차가워진 공기가 위로 올라가면서 방 전체를 돌기 때문",
      "A · 차가운 공기가 천장 근처에 그대로 머물기 때문",
      "B · 차가운 공기가 바닥에 고여 오래 유지되기 때문",
      "A · 열이 물질 없이 직접 방 전체로 퍼지기 때문",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>차가워진 공기는 무거워서 <b>아래로 내려와요</b>. 냉방기를 벽 위쪽 A에 달면 찬 공기가 내려오고, 아래의 더운 공기가 올라가 다시 식으며 방 전체가 도는 <b>대류 순환</b>이 생겨요. 그래서 위치는 A, 까닭은 찬 공기의 하강이에요.<span class='xh'>오답 하나씩 격파</span>'찬 공기가 위로 올라간다'는 방향을 뒤집은 함정이에요. 위로 올라가는 것은 데워진 공기죠. B(아래)에 달면 찬 공기가 바닥에만 고여 발밑만 시원하고 방 전체는 순환하지 않아요. '바닥에 고여 오래 유지'는 골고루 시원하게라는 목표와 어긋나는 설명이고, '물질 없이 직접 퍼진다'는 복사 이야기라 냉방기의 원리가 아니랍니다. 난방기는 반대로 아래쪽에 다는 것도 함께 기억해요.",
    core: "찬 공기는 내려온다 → 냉방기는 위(A)! 순환이 생겨야 골고루 시원.",
  },
  // [277 · d3 · SB day] 낮 그림 제시 → 밤 반전 예측(비상 계보 · 그림을 베끼면 오답이 되는 역설계) ·
  // 검산: 밤 = 육지가 빨리 식음 → 바다 위 상승 · 지표 바람 육지→바다(육풍).
  {
    id: "u3e277",
    lessonId: "u3l3",
    type: "mcq",
    diff: 3,
    prompt: "그림은 <b>낮</b>의 해안에서 공기가 움직이는 모습이에요. <b>밤</b>이 되면 지표 부근에서 바람은 어떻게 불까요?",
    figure: seaBreeze("day"),
    options: [
      "육지에서 바다 쪽으로 분다",
      "바다에서 육지 쪽으로 분다",
      "낮보다 훨씬 강하게 바다에서 육지 쪽으로 분다",
      "지표 부근에서는 바람이 불지 않는다",
      "위쪽 하늘과 지표 모두 육지 쪽으로 분다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>밤에는 낮과 반대의 일이 벌어져요. 모래(육지)는 빨리 데워진 만큼 <b>빨리 식고</b>, 바닷물은 천천히 식어 밤에는 바다가 육지보다 따뜻해요. 그래서 바다 위 공기가 데워져 올라가고, 식은 육지의 공기가 그 자리를 채우러 이동하죠. 지표 부근 바람은 <b>육지에서 바다 쪽으로</b> 불어요.<span class='xh'>함정 포인트</span>그림은 낮의 모습이라, 그림 속 화살표(바다에서 육지로)를 그대로 고르면 틀려요. 문제가 묻는 것은 <b>밤</b>이니까요. 자료를 읽되 조건이 바뀌면 결과도 뒤집어 생각해야 해요. 밤에도 바람은 불고(방향만 반대), 빨리 데워지는 물질은 빨리 식는다는 짝을 기억하면 낮과 밤을 모두 설명할 수 있어요.",
    core: "밤엔 반대! 육지가 빨리 식어 바람은 육지 → 바다.",
  },
  // [284 · d2 · RD beads] 한 막대 촛농 구슬 낙하 순서 · 그림은 중립(가열 전 · frac 0) ·
  // 순서 나열 보기 shuffle:false · 관례 순서 저작 · 정답 ② (첫 칸 금지 ✓).
  {
    id: "u3e284",
    lessonId: "u3l3",
    type: "mcq",
    diff: 2,
    prompt: "긴 금속 막대 위에 촛농으로 구슬 A, B, C를 그림처럼 붙이고, 막대의 <b>왼쪽 끝</b>을 가열하려고 해요. 구슬이 떨어지는 순서를 옳게 예상한 것은?",
    figure: htRodsFig([
      { name: "금속 막대", frac: 0, beads: [{ at: 0.22, label: "A" }, { at: 0.52, label: "B" }, { at: 0.82, label: "C" }] },
    ]),
    figureDark: true,
    options: [
      "A → C → B",
      "A → B → C",
      "C → B → A",
      "B → A → C",
      "세 구슬이 동시에 떨어진다",
    ],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>열은 가열한 왼쪽 끝에서 시작해 막대를 따라 <b>차례차례</b> 이동해요(전도). 촛농은 열을 받으면 녹아 구슬을 놓치니, 가열 지점에서 <b>가까운 순서대로</b> 떨어지죠. 가장 가까운 A가 먼저, 그다음 B, 가장 먼 C가 마지막이에요.<span class='xh'>함정 포인트</span>'동시에 떨어진다'를 골랐다면 전도가 <b>순서를 가진 이동</b>이라는 점을 놓친 거예요. 입자의 흔들림이 이웃으로 한 칸씩 전달되기 때문에, 가까운 곳이 먼저 뜨거워지고 먼 곳은 나중에 뜨거워져요. C부터 떨어지는 순서는 열이 먼 곳으로 먼저 간다는 뜻이라 성립할 수 없죠. 이 실험은 눈에 안 보이는 열의 이동을 구슬의 낙하 순서로 <b>눈에 보이게</b> 만든 장치랍니다.",
    core: "전도는 가까운 곳부터 차례로! 구슬은 A → B → C.",
  },
  // [289 · d3 · SC kitchen bogi] 259와 다른 장면(교차 유출 차단) · 원리 서술 판정 ·
  // ㄴ = 오개념(입자 직접 이동) · 정답 ㄱ,ㄷ = ③ (첫 칸 금지 ✓).
  {
    id: "u3e289",
    lessonId: "u3l3",
    type: "mcq",
    diff: 3,
    prompt: "그림은 가스레인지 불 위의 냄비(A: 냄비 속 물, B: 꽂아 둔 금속 국자의 손잡이)와 불 곁에 둔 버터 접시(C)예요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: htSceneFig("kitchen"),
    bogi: [
      "A에서는 데워진 물이 위로 올라가고 위쪽의 찬 물이 내려온다.",
      "B의 손잡이가 뜨거워지는 것은 국자 속 입자가 손잡이 끝까지 직접 이동하기 때문이다.",
      "C의 버터는 불에 닿지 않아도 열을 받아 말랑해질 수 있다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 냄비 바닥에서 데워진 물은 위로 오르고 위의 찬 물이 내려오며 순환해요. 대류의 정확한 모습이니 옳아요. ㄴ이 함정이에요. 국자 손잡이가 뜨거워지는 것은 전도인데, 전도에서 입자는 <b>제자리에서 흔들리며</b> 운동만 이웃에게 전달해요. 입자가 손잡이 끝까지 직접 이동한다는 설명은 대류와 뒤섞은 오개념이죠. ㄷ: 버터 접시는 불에 닿아 있지 않지만, 불의 열이 <b>물질을 거치지 않고 직접</b> 도달하는 복사로 열을 받아요. 그래서 말랑해질 수 있어요. 옳은 것은 ㄱ과 ㄷ이에요.<span class='xh'>함정 포인트</span>'무엇이 열을 나르는가'로 세 방식을 가르는 눈이 있으면, 그럴듯한 원리 서술 속 오개념 한 줄을 골라낼 수 있어요.",
    core: "장면 판별 + 원리 검증까지! 전도의 입자는 절대 이동하지 않아요.",
  },
  // [293 · multi d2 · 무②] 대류가 주된 경우 모두 · 레슨 binSort 조합(에어컨·주전자 등) 회피 소재 ·
  // 참 3(욕조 · 냄비 국 · 난방기) · 거짓 2(전 부치기 = 전도 · 숯불 = 복사).
  {
    id: "u3e293",
    lessonId: "u3l3",
    type: "multi",
    diff: 2,
    prompt: "열이 주로 <b>대류</b>의 방식으로 이동하는 경우를 <b>모두</b> 고르세요.",
    options: [
      "어항 바닥의 히터를 켜면 어항 물 전체가 따뜻해진다",
      "냄비 바닥만 데워도 국 전체가 골고루 끓는다",
      "난방기를 켜면 잠시 후 방 전체가 따뜻해진다",
      "달군 팬에 닿은 반죽이 노릇하게 익는다",
      "숯불 옆에 서 있으면 얼굴이 후끈해진다",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>보기 하나씩 판정</span>어항 바닥 히터로 데워진 물이 <b>위로 올라가고</b> 위의 찬 물이 내려오며 돌기 때문에 물 전체가 따뜻해져요. 대류죠 ✓ 냄비 바닥만 데워도 국 전체가 끓는 것도 데워진 국물이 오르내리며 도는 대류죠 ✓ 난방기를 켜면 데워진 공기가 올라가고 찬 공기가 내려오는 순환으로 방 전체가 따뜻해지니 이것도 대류예요 ✓<span class='xh'>오답 하나씩 격파</span>달군 팬에 <b>닿은</b> 반죽이 익는 것은 맞닿은 곳으로 열이 차례로 전달되는 전도예요. 숯불 옆 얼굴이 후끈한 것은 닿지도, 공기가 순환해서도 아니고 열이 <b>직접 날아오는</b> 복사죠. 대류를 고르는 기준은 하나예요. 데워진 액체나 기체가 <b>직접 움직여</b> 열을 날랐는가!",
    core: "위아래로 도는 물·공기 = 대류. 닿으면 전도, 안 닿아도 후끈은 복사.",
  },
  // ══════════ L4 비열 (u3l4) ══════════
  // [295 · d1 · 무①] 비열의 정의 · 정의 문항이라 무그림(화이트 ①) · 미끼 재구성.
  {
    id: "u3e295",
    lessonId: "u3l4",
    type: "mcq",
    diff: 1,
    prompt: "<b>비열</b>의 뜻으로 옳은 것은?",
    options: [
      "어떤 물질 1 kg의 온도를 1 ℃ 높이는 데 필요한 열량",
      "어떤 물질이 끓기 시작할 때의 온도",
      "어떤 물질 1 kg이 가지고 있는 열의 총량",
      "어떤 물질의 온도가 1분 동안 변하는 정도",
      "어떤 물질에서 열이 이동하는 빠르기",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>비열은 <b>어떤 물질 1 kg</b>의 온도를 <b>1 ℃</b> 높이는 데 필요한 <b>열량</b>이에요. '1 kg · 1 ℃ · 열량' 세 가지가 정의의 재료죠. 물질마다 정해진 고유한 값이라, 비열을 알면 어떤 물질인지 구분하는 단서로도 쓸 수 있어요.<span class='xh'>오답 하나씩 격파</span>'끓기 시작하는 온도'는 비열과 관계없는 다른 성질이에요. '가지고 있는 열의 총량'은 열을 저장량처럼 본 오개념이고요. '1분 동안 변하는 정도'는 그럴듯하지만, 비열은 시간이 아니라 <b>열량</b>을 기준으로 정한 값이에요. 불의 세기에 따라 1분의 변화는 얼마든지 달라지니까요. '열이 이동하는 빠르기'는 전도가 잘 되는 정도라 비열과 다른 개념이랍니다.",
    core: "비열 = 1 kg을 1 ℃ 높이는 열량. 물질마다 고유한 값!",
  },
  // [296 · d2 · HC] 기울기 → 비열 역관계 · ends (가)70/(나)20/(다)45(레슨 정답 (가) 회피 · 정답 (나)) ·
  // 검산: Δ = 60/10/35 → 비열은 Δ 반비례 → 최대 = (나) ✓ · 라벨 보기 shuffle:false · 정답 ② ✓.
  {
    id: "u3e296",
    lessonId: "u3l4",
    type: "mcq",
    diff: 2,
    prompt: "그림은 질량이 같은 세 물질 (가)~(다)에 같은 세기의 불로 <b>같은 시간</b> 동안 열을 가했을 때의 온도 변화예요. 비열이 가장 <b>큰</b> 물질은?",
    figure: heatCurves({ start: 10, ends: [{ label: "(가)", T: 70 }, { label: "(나)", T: 20 }, { label: "(다)", T: 45 }], tMax: 5, yMax: 80, yStep: 10 }),
    options: ["(가)", "(나)", "(다)", "세 물질이 모두 같다", "그래프만으로는 알 수 없다"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>질량이 같고 받은 열량도 같으니, 남는 차이는 물질의 비열뿐이에요. 비열이 <b>클수록 온도가 조금</b> 올라요. 그래프에서 (가)는 60 ℃, (다)는 35 ℃, (나)는 10 ℃만 올랐으니, 온도 변화가 가장 작은 <b>(나)</b>의 비열이 가장 커요.<span class='xh'>함정 포인트</span>가장 가파르게 오른 (가)를 고르는 것이 대표 함정이에요. '많이 변했다 = 비열이 크다'로 방향을 뒤집은 거죠. 비열은 온도를 올리기 <b>어려운 정도</b>라서, 잘 안 오르는 쪽이 큰 거예요. 조건도 확인하세요. '질량이 같고 같은 열량'일 때만 이 비교가 성립해요. 조건이 다르면 기울기만으로 비열을 단정할 수 없답니다.",
    core: "같은 질량·같은 열량이면, 온도가 덜 변한 쪽이 비열이 커요!",
  },
  // [298 · d2 · ST num] 비열 표 → 열량 계산 · 알루미늄 0.2 × 2 kg × 5 ℃ = 2 kcal(자연값 비열 ·
  // v1 표(물/식용유/철)·정답 수치와 분리) · 산식은 말로 풀어 제시(기호 산식 금지).
  {
    id: "u3e298",
    lessonId: "u3l4",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "kcal",
    prompt: "표는 두 물질의 비열이에요. 알루미늄 <b>2 kg</b>의 온도를 <b>5 ℃</b> 높이는 데 필요한 열량은 몇 kcal일까요?",
    figure: svgTable(["물질", "물", "알루미늄"], [["비열(kcal/(kg·℃))", "1", "0.2"]], { firstColHead: true }),
    answer: "2",
    explain:
      "<span class='xh'>정답 풀이</span>표에서 알루미늄의 비열을 읽으면 0.2예요. 즉 알루미늄 1 kg을 1 ℃ 높이는 데 0.2 kcal가 필요하죠. ① 2 kg이면 두 배인 0.4 kcal가 있어야 1 ℃가 올라요. ② 5 ℃를 올리려면 다시 다섯 배가 필요하니 0.4 × 5 = <b>2 kcal</b>예요. 정리하면 비열 × 질량 × 온도 변화 = 0.2 × 2 × 5 = 2 kcal.<span class='xh'>이렇게 확인해요</span>물이었다면 어땠을까요? 비열이 1이라 같은 조건에서 1 × 2 × 5 = 10 kcal, 알루미늄의 다섯 배가 필요해요. 같은 질량을 같은 온도만큼 올려도 물질에 따라 필요한 열량이 이렇게 달라지는 것, 그게 바로 비열의 의미랍니다. 표에서 값을 읽고 질량 배 · 온도 배를 차례로 곱하는 순서만 지키면 틀리지 않아요.",
    core: "필요한 열량 = 비열 × 질량 × 온도 변화. 0.2 × 2 × 5 = 2 kcal!",
  },
  // [301 · d2 · GT num] 가열 결과 표 · 처음 온도를 다르게(천재 계보) → 변화량 계산 강제 ·
  // 물 20→26(Δ6) · 식용유 14→38(Δ24) → 4배 · v1 3배 · 수치 세트 회피 ✓.
  {
    id: "u3e301",
    lessonId: "u3l4",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "배",
    prompt: "표는 질량이 같은 물과 식용유를 같은 세기의 불로 <b>4분</b> 동안 가열한 결과예요. 이 시간 동안 <b>식용유의 온도 변화량</b>은 물의 몇 배일까요?",
    figure: svgTable(
      ["물질", "물", "식용유"],
      [["처음 온도(℃)", "20", "14"], ["4분 후 온도(℃)", "26", "38"]],
      { firstColHead: true },
    ),
    answer: "4",
    explain:
      "<span class='xh'>정답 풀이</span>처음 온도가 서로 다르니 4분 후 온도만 비교하면 안 돼요. 각자의 <b>변화량</b>부터 구해요. ① 물: 26 − 20 = 6 ℃ 올랐어요. ② 식용유: 38 − 14 = 24 ℃ 올랐죠. ③ 24 ÷ 6 = <b>4배</b>예요.<span class='xh'>함정 포인트</span>'식용유가 38 ℃니까 더 많이 받았다'는 식으로 마지막 온도만 보면 함정에 걸려요. 두 물질은 같은 불로 같은 시간 가열했으니 <b>받은 열량이 같고</b>, 그런데도 변화량이 4배 차이 난 것은 식용유의 비열이 물의 4분의 1이기 때문이에요. 처음 온도가 다르게 주어진 표에서는 언제나 '나중 − 처음'을 먼저 계산하는 습관이 정답으로 가는 길이랍니다.",
    core: "처음 온도가 다르면 변화량부터! 24÷6 = 4배.",
  },
  // [307 · d1 · 무①] 비열 · 온도 변화의 역관계 · 실측(비상 05) 오답 4종 계보 재구성.
  {
    id: "u3e307",
    lessonId: "u3l4",
    type: "mcq",
    diff: 1,
    prompt: "비열에 대한 설명으로 옳은 것은?",
    options: [
      "비열이 큰 물질은 같은 열을 받아도 온도가 천천히 오른다",
      "비열이 큰 물질일수록 온도가 잘 변한다",
      "같은 물질이라도 양이 많으면 비열이 커진다",
      "프라이팬은 비열이 큰 재료로 만들어야 빨리 뜨거워진다",
      "비열이 작은 물질은 한번 데워지면 잘 식지 않는다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>비열이 크다는 것은 온도를 1 ℃ 올리는 데 열량이 많이 든다는 뜻이에요. 그래서 비열이 큰 물질은 같은 열을 받아도 온도가 <b>천천히</b> 오르고, 식을 때도 천천히 식죠.<span class='xh'>오답 하나씩 격파</span>'비열이 크면 온도가 잘 변한다'는 관계를 뒤집은 대표 함정이에요. 잘 변하는 쪽은 비열이 <b>작은</b> 물질이죠. '양이 많으면 비열이 커진다'도 틀렸어요. 비열은 1 kg 기준으로 정한 <b>물질의 고유한 값</b>이라 양과 무관해요. 프라이팬은 빨리 뜨거워져야 하니 비열이 <b>작은</b> 금속으로 만들고, 비열이 작은 물질은 빨리 데워지는 만큼 <b>빨리 식어요</b>. '빨리 데워짐 = 빨리 식음'이 항상 짝이라는 것까지 기억해요.",
    core: "비열 큼 = 천천히 데워지고 천천히 식음. 관계를 뒤집는 보기가 함정!",
  },
  // [312 · d3 · FC2] 실험 순서도 '아니요' 갈래 ㉡(v1 ㉠ 축 회피) · 문두가 '아니요' 상황을
  // "B가 더 많이 올랐다"로 확정(같음 케이스 배제 → 중의성 차단).
  {
    id: "u3e312",
    lessonId: "u3l4",
    type: "mcq",
    diff: 3,
    prompt: "그림은 물질 A와 B의 비열을 비교하는 실험의 순서도예요. 실험 결과 <b>B의 온도가 A보다 많이 올라</b> '아니요' 갈래로 갔어요. 결론 칸 <b>㉡</b>에 들어갈 말로 옳은 것은?",
    figure: htFlowFig({ ask: "no" }),
    options: [
      "A의 비열이 B보다 크다",
      "A의 비열이 B보다 작다",
      "A와 B의 비열이 같다",
      "A의 질량이 B보다 크다",
      "A가 B보다 열량을 적게 받았다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>순서도를 따라가요. ① 두 물질의 <b>질량을 같게</b> 재고 ② 같은 세기의 불로 같은 시간 가열했으니 받은 열량도 같아요. ③ 그런데 B의 온도가 더 많이 올랐다면, B는 온도가 잘 변하는 물질(비열 작음)이고 A는 잘 안 변하는 물질이라는 뜻이죠. 그래서 ㉡의 결론은 <b>A의 비열이 B보다 크다</b>예요.<span class='xh'>오답 하나씩 격파</span>'A의 비열이 작다'는 '예' 갈래(A가 많이 올랐을 때)의 결론 ㉠에 들어갈 말이에요. '질량이 크다'와 '열량을 적게 받았다'는 이 실험에서 이미 <b>같게 통제한 조건</b>이라 결론이 될 수 없어요. 순서도의 앞 두 상자가 바로 그 통제 장치죠. 공정한 비교 뒤에 남는 차이만이 물질의 성질, 비열이랍니다.",
    core: "질량·열량을 같게 맞춘 뒤 덜 오른 쪽이 비열 큰 쪽!",
  },
  // [320 · d3 · dbox] 두 도시 기온 기록 → 해안 판정 + 까닭 · 창작 수치(일교차 6 vs 20) ·
  // 검산: 물 비열 큼 → 해안 기온 변화 완만 → 일교차 작은 ㉮ ✓.
  {
    id: "u3e320",
    lessonId: "u3l4",
    type: "mcq",
    diff: 3,
    prompt: "다음은 같은 날 두 도시의 기온 기록이에요. 한 곳은 바닷가 도시, 한 곳은 내륙 도시예요. <b>바닷가 도시</b>와 그렇게 판단한 까닭을 옳게 짝 지은 것은?",
    figure: dbox([
      ["㉮ 도시", "낮 최고 29 ℃ · 밤 최저 23 ℃"],
      ["㉯ 도시", "낮 최고 34 ℃ · 밤 최저 14 ℃"],
    ]),
    options: [
      "㉮ · 비열이 큰 바닷물이 기온 변화를 작게 만들기 때문",
      "㉯ · 비열이 작은 바닷물이 기온을 빨리 바꾸기 때문",
      "㉮ · 바닷바람이 낮의 열을 모두 날려 보내기 때문",
      "㉯ · 내륙보다 햇볕을 오래 받아 밤에도 따뜻하기 때문",
      "㉮ · 바닷물이 낮의 열을 복사로 되돌려 주기 때문",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>기록에서 하루 온도 차를 계산해요. ㉮는 29 − 23 = 6 ℃, ㉯는 34 − 14 = 20 ℃죠. 바닷가에는 <b>비열이 큰 바닷물</b>이 있어 낮에는 열을 흡수하며 천천히 데워지고 밤에는 천천히 식어요. 그 덕분에 도시의 기온 변화가 작아지니, 하루 온도 차가 작은 <b>㉮</b>가 바닷가 도시예요.<span class='xh'>오답 하나씩 격파</span>바닷물의 비열이 '작다'는 보기는 사실을 뒤집은 것이고, 온도 차가 큰 ㉯를 바닷가로 고른 보기들은 판독 자체가 어긋나요. '바람이 열을 날린다'거나 '복사로 되돌린다'는 설명은 그럴듯해도 하루 온도 차가 작아지는 핵심 원인이 아니에요. 핵심은 물이 열을 받아도 <b>온도가 잘 변하지 않는 성질</b>, 비열이랍니다. 사막의 일교차가 큰 것도 같은 원리의 반대편이에요.",
    core: "일교차 작은 쪽이 바닷가! 물의 큰 비열이 기온 변화를 눌러 줘요.",
  },
  // [326 · multi d2 · GT] 301과 같은 표 · 보기는 전부 수치 없는 서술(301 정답 "4배" 유출 차단) ·
  // 참 3(열량 같음 · 변화량 대소 · 비열 대소) · 거짓 2.
  {
    id: "u3e326",
    lessonId: "u3l4",
    type: "multi",
    diff: 2,
    prompt: "표는 질량이 같은 물과 식용유를 같은 세기의 불로 4분 동안 가열한 결과예요. 옳은 설명을 <b>모두</b> 고르세요.",
    figure: svgTable(
      ["물질", "물", "식용유"],
      [["처음 온도(℃)", "20", "14"], ["4분 후 온도(℃)", "26", "38"]],
      { firstColHead: true },
    ),
    options: [
      "두 물질이 받은 열량은 같다",
      "온도 변화량은 식용유가 물보다 크다",
      "비열은 물이 식용유보다 크다",
      "4분 후 온도가 더 높은 식용유가 열량을 더 많이 받았다",
      "물의 온도가 잘 오르지 않은 것은 물의 비열이 작기 때문이다",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>보기 하나씩 판정</span>같은 세기의 불로 같은 시간 가열했으니 받은 열량은 같아요 ✓ 변화량을 계산하면 물은 조금, 식용유는 크게 올라 식용유의 변화량이 더 커요 ✓ 같은 열량에 같은 질량인데 물이 덜 올랐으니 물의 비열이 더 크죠 ✓<span class='xh'>오답 하나씩 격파</span>'4분 후 온도가 높은 쪽이 열량을 많이 받았다'는 처음 온도가 다르다는 것을 놓친 판단이에요. 식용유는 애초에 낮은 온도에서 출발했고, 받은 열량은 두 물질이 같아요. '물의 비열이 작기 때문'이라는 설명은 관계를 뒤집었어요. 물이 잘 안 오른 것은 비열이 <b>크기</b> 때문이죠. 처음 온도가 다른 표에서는 반드시 변화량으로 비교한다, 이 원칙 하나로 함정 두 개를 모두 피할 수 있어요.",
    core: "같은 불·같은 시간 = 같은 열량. 비교는 언제나 변화량으로!",
  },
  // ══════════ L5 열팽창 (u3l5) ══════════
  // [329 · d1 · 무①] 열팽창의 정의(원인 결합) · 입자 크기 증가 미끼.
  {
    id: "u3e329",
    lessonId: "u3l5",
    type: "mcq",
    diff: 1,
    prompt: "고체가 열을 받으면 길이나 부피가 커져요. 이 <b>열팽창</b>이 일어나는 까닭으로 옳은 것은?",
    options: [
      "입자 운동이 활발해져 입자 사이의 거리가 멀어지기 때문",
      "입자 하나하나의 크기가 커지기 때문",
      "입자의 개수가 점점 늘어나기 때문",
      "입자가 무거워지기 때문",
      "입자가 모두 물체의 바깥쪽으로 빠져나가기 때문",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>물체가 열을 받으면 입자 운동이 활발해지고, 세게 흔들리는 입자들이 서로를 밀어내 <b>입자 사이의 거리가 멀어져요</b>. 입자 하나하나는 그대로인데 사이가 벌어지니 물체 전체의 길이와 부피가 커지는 것, 그게 열팽창이에요.<span class='xh'>오답 하나씩 격파</span>'입자의 크기가 커진다'가 이 단원 최고의 함정이에요. 아무리 가열해도 입자 자체의 크기는 <b>변하지 않아요</b>. '개수가 늘어난다'도 틀렸죠. 입자가 생겨나거나 사라지는 일은 없으니까요. 무게 역시 그대로예요. 팽창해도 입자의 개수가 같으니 무거워질 이유가 없죠. 변하는 것은 오직 <b>움직임과 사이 거리</b>, 이 두 가지뿐이라는 걸 기억하면 열팽창 문제의 절반은 푼 셈이에요.",
    core: "열팽창 = 입자 사이 거리가 멀어지는 것. 입자 크기·개수는 그대로!",
  },
  // [330 · d2 · BM strip] 휨 방향 → 팽창 대소 역추론 · 아래로 휨(v1 e85 위로 휨 · 레슨 tapeBend
  // 위로 말림과 방향 반대) · 가열원 = 뜨거운 물 균일(파일럿 1차 검수 반영 · 아래 불꽃은 "아래가
  // 먼저 데워져 위로 휜다" 직관과 충돌) · 검산: 골고루 데우면 두 금속 온도 같음 → 남는 차이는
  // 재질뿐 → 덜 팽창한 쪽으로 휜다 → 아래(㉯)가 덜 팽창 = ㉮가 크다 ✓.
  {
    id: "u3e330",
    lessonId: "u3l5",
    type: "mcq",
    diff: 2,
    prompt: "그림처럼 금속 ㉮(위)와 금속 ㉯(아래)를 붙인 띠를 뜨거운 물에 담가 <b>골고루</b> 데웠더니 끝이 <b>아래쪽으로</b> 휘었어요. 이로부터 알 수 있는 것은?",
    figure: htBimetalFig({ top: "㉮", bottom: "㉯", mode: "strip", bend: "down" }),
    options: [
      "열팽창 정도는 ㉮가 ㉯보다 크다",
      "열팽창 정도는 ㉯가 ㉮보다 크다",
      "두 금속의 열팽창 정도는 같다",
      "㉮는 팽창하고 ㉯는 수축했다",
      "비열은 ㉮가 ㉯보다 크다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>뜨거운 물에 담가 골고루 데우면 두 금속의 <b>온도는 같아져요</b>. 그런데도 띠가 휘었다면 남은 차이는 재질뿐이죠. 둘 다 팽창하지만 <b>많이 늘어난 금속이 바깥쪽(볼록한 쪽)</b>, 덜 늘어난 금속이 안쪽이 되면서 휘어요. 끝이 아래로 휘었으니 바깥쪽은 위인 ㉮. 열팽창 정도는 <b>㉮가 ㉯보다 커요</b>.<span class='xh'>오답 하나씩 격파</span>'㉯가 크다'는 휜 방향을 반대로 해석한 함정이에요. 휜 쪽(아래)이 덜 늘어난 쪽이라는 것만 기억하면 헷갈리지 않아요. '㉯가 수축했다'는 틀린 설명이에요. 데우면 두 금속 모두 <b>팽창</b>하고, 다만 그 정도가 다를 뿐이죠. 팽창 정도가 같았다면 띠는 휘지 않고 곧게 늘어났을 거예요. 비열은 온도 변화의 성질이라 휨 방향과는 관계가 없답니다.",
    core: "많이 늘어난 쪽이 바깥! 아래로 휘면 위 금속의 팽창이 큰 거예요.",
  },
  // [332 · d3 · BM iron bogi] 전기다리미 온도 스위치(v1 화재경보기 위 접점 · 닿아야 울림 구조와
  // 반대: 평소 닿음 · 뜨거우면 떨어져 차단) · 그림은 평소 중립 상태 · 정답 ㄱ,ㄴ = ③ ✓.
  {
    id: "u3e332",
    lessonId: "u3l5",
    type: "mcq",
    diff: 3,
    prompt: "그림은 전기다리미 속 온도 스위치예요. 금속 (가)(위)와 (나)(아래)를 붙인 띠의 끝이 평소에는 <b>위쪽 접점에 닿아</b> 전류가 흐르고, 다리미가 너무 뜨거워지면 띠가 <b>아래로 휘면서</b> 접점에서 떨어져요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: htBimetalFig({ top: "(가)", bottom: "(나)", mode: "iron" }),
    bogi: [
      "다리미가 너무 뜨거워지면 열선으로 흐르는 전류가 끊긴다.",
      "다리미가 식으면 띠가 다시 펴져 접점에 닿는다.",
      "이 스위치는 두 금속의 비열 차이를 이용한 장치이다.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 띠가 접점에서 떨어지면 회로가 끊기니, 뜨거워졌을 때 전류가 끊긴다는 설명은 옳아요. 다리미가 스스로 온도를 조절하는 원리죠. ㄴ: 온도가 내려가면 두 금속이 다시 수축하며 띠가 펴져요. 접점에 닿으면 전류가 다시 흘러 데워지죠. 이렇게 <b>껐다 켰다를 스스로 반복</b>하는 것이 온도 조절의 원리라 옳아요. ㄷ이 함정이에요. 이 장치가 이용하는 것은 두 금속의 <b>열팽창 정도 차이</b>이지 비열 차이가 아니에요.<span class='xh'>함정 포인트</span>장치 문제는 '접점이 어디에 있고, 닿아야 하는지 떨어져야 하는지'를 그림에서 먼저 확인하는 것이 순서예요. 그리고 이 스위치가 쓰는 것은 <b>열팽창 정도의 차이</b>라, 비열을 끌어온 설명은 개념을 바꿔치기한 함정이랍니다.",
    core: "뜨거우면 떨어지고 식으면 다시 붙어요. 비열이 아니라 열팽창!",
  },
  // [335 · d2 · EG num] 온도-눈금 보간 · (10 ℃, 8칸) · (50 ℃, 24칸) → 30 ℃ = 16칸(v1 값 회피 ·
  // 검산: 기울기 0.4칸/℃ · 8 + 20×0.4 = 16 · 눈금(8 간격) 위 ✓ · 묻는 지점 무표시).
  {
    id: "u3e335",
    lessonId: "u3l5",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "칸",
    prompt: "액체가 든 가는 유리관을 데우며 온도에 따른 액체 기둥의 눈금을 기록했더니 그림과 같은 직선이 되었어요. <b>10 ℃</b>일 때 <b>8칸</b>, <b>50 ℃</b>일 때 <b>24칸</b>이었다면, <b>30 ℃</b>일 때는 몇 칸일까요?",
    figure: htExpandGraphFig({ xMax: 60, xStep: 10, yMax: 32, yStep: 8, pts: [[10, 8], [50, 24]] }),
    answer: "16",
    explain:
      "<span class='xh'>정답 풀이</span>액체는 온도가 오르는 만큼 일정하게 팽창해서 그래프가 직선이 돼요. ① 10 ℃에서 50 ℃까지 40 ℃ 오르는 동안 눈금은 8칸에서 24칸으로 16칸 늘었어요. ② 그러니 10 ℃마다 4칸씩 느는 셈이죠. ③ 30 ℃는 10 ℃에서 20 ℃ 오른 지점이니 8 + 4 × 2 = <b>16칸</b>이에요.<span class='xh'>이렇게 확인해요</span>30 ℃는 10 ℃와 50 ℃의 한가운데이니, 눈금도 8과 24의 한가운데인 16이라고 바로 구할 수도 있어요. 직선 그래프에서는 가운데 온도의 값이 두 값의 가운데가 되거든요. 온도계가 바로 이 원리로 만들어진 도구예요. 액체의 팽창이 온도에 따라 <b>고르게</b> 일어나니, 관에 눈금을 일정한 간격으로 새겨 온도를 읽을 수 있는 것이랍니다.",
    core: "직선 = 고른 팽창. 40 ℃에 16칸이면 10 ℃마다 4칸!",
  },
  // [339 · d2 · 사진 xpair] 전깃줄 여름/겨울 판정 + 까닭 · (가) = wire-summer(처짐) 발주 조건 ·
  // 눈검수 통과본만 참조 · alt는 관찰 서술만(여름/겨울 판정 미인쇄).
  {
    id: "u3e339",
    lessonId: "u3l5",
    type: "mcq",
    diff: 2,
    prompt: "사진 (가)와 (나)는 같은 곳의 전깃줄을 서로 다른 계절에 찍은 거예요. <b>여름</b>에 찍은 사진과 그렇게 판단한 까닭을 옳게 짝 지은 것은?",
    figure: xpair(
      "wire-summer.webp",
      "전봇대 사이의 전깃줄이 아래로 처져 늘어져 있는 사진",
      "wire-winter.webp",
      "전봇대 사이의 전깃줄이 팽팽하게 당겨져 있는 사진",
    ),
    options: [
      "(가) · 전깃줄이 열을 받아 길이가 늘어났기 때문",
      "(나) · 전깃줄이 열을 받아 길이가 줄어들었기 때문",
      "(가) · 여름에는 전봇대 사이가 멀어지기 때문",
      "(나) · 여름에는 전깃줄이 팽팽해지기 때문",
      "(가) · 여름에 전기가 많이 흘러 줄이 무거워지기 때문",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(가)의 전깃줄은 축 처져 있고 (나)는 팽팽해요. 여름에는 전깃줄이 뜨거운 햇볕과 더운 공기에 데워져 입자 사이 거리가 멀어지고, <b>길이가 늘어나</b> 아래로 처져요. 그래서 처진 (가)가 여름 사진이에요.<span class='xh'>오답 하나씩 격파</span>'열을 받아 줄어든다'는 열팽창의 방향을 뒤집은 설명이에요. 가열은 팽창, 냉각이 수축이죠. '전봇대 사이가 멀어진다'면 줄은 오히려 팽팽해져야 하니 처진 모습과 맞지 않아요. '전기가 많이 흘러 무거워진다'는 것도 사실이 아니에요. 전깃줄의 처짐은 무게가 아니라 <b>길이의 변화</b> 때문이랍니다. 겨울의 (나)는 반대로 줄이 식어 수축해 팽팽해진 모습이에요. 그래서 전깃줄은 겨울에 끊어지지 않도록 여름·겨울의 길이 변화를 계산해서 설치해요.",
    core: "여름 = 팽창해서 처짐 · 겨울 = 수축해서 팽팽. 사진의 처짐이 단서!",
  },
  // [345 · d2 · 무②] 냉각 = 수축(가열 서술 뒤집기 · 미래엔 ㄱ·ㄷ 계보) · 금속 대문 소재(v1 고리
  // 냉각 · 유리컵 회피).
  {
    id: "u3e345",
    lessonId: "u3l5",
    type: "mcq",
    diff: 2,
    prompt: "여름에 딱 맞게 닫히던 <b>금속 대문</b>이 추운 겨울이 되자 틀과 문 사이가 살짝 벌어지며 헐거워졌어요. 그 까닭으로 옳은 것은?",
    options: [
      "온도가 낮아져 입자 사이의 거리가 가까워지면서 문이 수축했기 때문",
      "온도가 낮아져 입자 하나하나의 크기가 작아졌기 때문",
      "온도가 낮아져 입자의 개수가 줄어들었기 때문",
      "겨울에는 문이 열을 받아 팽창하기 때문",
      "겨울에는 문이 무거워져 아래로 처지기 때문",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>겨울이 되어 금속 대문의 온도가 낮아지면 입자 운동이 둔해지고 <b>입자 사이의 거리가 가까워져요</b>. 그만큼 문 전체의 크기가 줄어드니(수축) 틀과의 사이가 벌어져 헐거워지는 거예요. 열팽창의 반대 방향이죠.<span class='xh'>오답 하나씩 격파</span>'입자의 크기가 작아진다'와 '개수가 줄어든다'는 냉각에서도 성립하지 않아요. 온도가 변할 때 입자의 크기와 개수는 <b>언제나 그대로</b>이고, 변하는 것은 움직임과 사이 거리뿐이에요. '겨울에 열을 받아 팽창한다'는 계절과 방향이 모두 어긋난 설명이고, 무게도 변하지 않으니 처짐 때문도 아니죠. 가열이면 팽창, 냉각이면 수축, 이 짝을 입자의 거리로 설명할 수 있으면 완벽해요.",
    core: "냉각 = 거리 가까워짐 = 수축. 크기·개수는 겨울에도 그대로!",
  },
  // [354 · d3 · 사진 bridge-joint] 다리 이음매 역할 + 여름 변화 2단 · 천재(틈 변화 우회) 계보.
  {
    id: "u3e354",
    lessonId: "u3l5",
    type: "mcq",
    diff: 3,
    prompt: "사진은 다리의 도로 면에 설치된 <b>빗살 모양 이음매</b>예요. 이 장치를 둔 까닭과, <b>더운 여름</b>에 이음매 틈에서 일어나는 변화를 옳게 짝 지은 것은?",
    figure: ximg("bridge-joint.webp", "다리 도로 면에 금속 빗살이 서로 맞물리듯 마주 보고 있고 그 사이에 틈이 있는 모습"),
    options: [
      "다리가 팽창할 자리를 마련하기 위해 · 여름에는 틈이 좁아진다",
      "다리가 팽창할 자리를 마련하기 위해 · 여름에는 틈이 넓어진다",
      "바퀴가 미끄러지지 않게 하기 위해 · 여름에도 틈은 변하지 않는다",
      "빗물을 아래로 빼내기 위해 · 여름에는 틈이 넓어진다",
      "다리를 가볍게 만들기 위해 · 여름에는 틈이 좁아진다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>다리는 여름마다 열을 받아 <b>길이가 늘어나요</b>. 늘어날 자리가 없으면 도로가 밀려 솟거나 갈라지죠. 그래서 중간중간 빗살 모양 이음매를 두어 늘어난 만큼 <b>밀려 들어올 틈</b>을 마련해요. 여름에 다리가 팽창해 빗살이 서로 다가가니, 틈은 <b>좁아져요</b>.<span class='xh'>오답 하나씩 격파</span>'여름에 틈이 넓어진다'는 팽창의 방향을 뒤집은 함정이에요. 넓어지는 계절은 다리가 수축하는 겨울이죠. '미끄럼 방지'나 '빗물 빼기'는 이음매의 본래 목적이 아니고, 틈이 계절 없이 그대로라면 애초에 빗살로 만들 이유가 없어요. 철로의 틈, 가스관의 구부러진 부분도 모두 같은 원리로, 팽창할 자리를 미리 계산해 둔 설계랍니다.",
    core: "이음매 틈 = 팽창 자리. 여름엔 좁아지고 겨울엔 넓어져요!",
  },
  // [358 · multi d2 · PB2] 가열 전후 모형 → 변한 것/안 변한 것 · 참 3(활발 · 거리 · 크기 불변) ·
  // 거짓 2(개수 증가 · 입자 커짐).
  {
    id: "u3e358",
    lessonId: "u3l5",
    type: "multi",
    diff: 2,
    prompt: "그림은 금속 막대를 가열하기 <b>전</b>과 <b>후</b>의 입자 모형이에요. 가열 후에 일어난 변화로 옳은 것을 <b>모두</b> 고르세요.",
    figure: htParticleBoxFig([
      { label: "가열 전", spread: 22, trail: 2 },
      { label: "가열 후", spread: 30, trail: 8 },
    ]),
    figureDark: true,
    options: [
      "입자의 운동이 더 활발해졌다",
      "입자 사이의 거리가 멀어졌다",
      "입자 하나하나의 크기는 변하지 않았다",
      "입자의 개수가 늘어났다",
      "입자 하나하나가 커져서 막대가 길어졌다",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>보기 하나씩 판정</span>가열 후 모형은 움직임 표시가 길어졌으니 입자 운동이 활발해졌어요 ✓ 입자들 사이 간격도 눈에 띄게 벌어졌죠 ✓ 그리고 입자 하나하나의 크기는 두 모형에서 똑같아요 ✓ 이 세 가지가 그림이 보여 주는 변화의 전부예요.<span class='xh'>오답 하나씩 격파</span>'개수가 늘어났다'는 틀린 관찰이에요. 두 상자의 입자 수는 같아요. 가열한다고 입자가 생겨나지 않죠. '입자가 커져서 길어졌다'는 열팽창의 원인을 잘못 짚은 대표 오개념이에요. 막대가 길어지는 것은 입자가 커져서가 아니라 <b>입자 사이의 거리가 멀어져서</b>랍니다. 모형 문제에서 변하는 것(움직임·간격)과 변하지 않는 것(크기·개수)을 나누어 보는 눈이 핵심이에요.",
    core: "변하는 건 움직임·간격, 안 변하는 건 크기·개수!",
  },
];
