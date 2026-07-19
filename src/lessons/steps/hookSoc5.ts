// hookSoc5 — 사회 Ⅴ 단원(아메리카) 훅 장면 7종. hook.ts의 디스패처가 불러 쓴다.
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수,
// 스틱맨만 손그림 라인(#3C4654). CSS 상태 클래스 접두사는 hs5-.
//   searchamerica L1 — "아메리카"를 검색했더니: 나라가 아니라 두 덩어리 대륙(인식 뒤집기 1)
//   panroad       L2 — 팬 아메리칸 고속 도로 종단: 실지도 위 자동차 남하 + 차창 산맥 루프(미래엔 생각열기 계승)
//   quitopack     L3 — 적도 도시 키토 여행 짐: 반팔만 챙겼는데 13℃?! → 고도의 비밀
//   teamroster    L4 — 대표팀 명단의 성씨가 세계 여행: 이주가 만든 사람들
//   dinnertable   L5 — 저녁 밥상 원산지 태그: 김치의 고추까지 아메리카산(인식 뒤집기 2)
//   fruitlogo     L6 — 마트 과일 코너: 원산지는 제각각, 회사 로고는 하나(비상 도입 계승)
//   motorcity     L7 — '자동차의 도시' 기사 플립: 70년 뒤, 파산 신청(디트로이트)
// 단원 서사 축 = "국경을 넘으면 새것이 태어난다"(사람→문화→기업). 민감 가드: 국가·민족
// 희화화 금지, 성씨는 일반 성씨만(실존 인물 금지), 쇠퇴 장면은 사실 서술(폐허 과장 금지).

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";
import { CONTINENTS, lonToX, latToY } from "../../ui/continentMap";
import { WORLD_LAND_PATH } from "../../ui/worldMap.generated";

type Face = (k: AvatarKind) => void;
type HookOpt = { choices?: string[] };

/** 손그림 아메리카 실루엣 쌍(만화 소품 — 데이터 지도 아님). 북쪽 넓은 덩어리가 남동쪽으로
 *  좁아져 가느다란 지협이 되고, 남쪽 덩어리(역삼각형)로 이어진다. 로컬 88×132. */
const NA_SIL =
  "M6 20q4-12 18-14l26-2q14 0 20 6l8 8-4 10-12 4-8 8 2 10-6 8-8 2-4 10 4 8-3 7-6-1-5-10-8-8-10-4q-8-4-6-14l4-10q-4-8-2-18z";
const SA_SIL =
  "M40 96q6-6 16-4l14 4q8 4 8 12l-2 12-6 14-8 16-6 10q-3 5-6 0l-4-12-4-14-4-16q-2-8 2-14z";
const ISTHMUS = "M34 78q8 6 10 16l4 6-6 2q-6-8-10-14z";

/* ══════════ L1: 검색창 — "아메리카"의 정체 ══════════ */
function searchSvg(found: boolean): string {
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs5-app" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C2436"/><stop offset="1" stop-color="#28324A"/></linearGradient>
      <radialGradient id="hs5-sea" cx=".5" cy=".45" r=".8"><stop offset="0" stop-color="#3E6E9E"/><stop offset="1" stop-color="#2A527E"/></radialGradient>
      <linearGradient id="hs5-land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FCE6E"/><stop offset=".6" stop-color="#5EA84E"/><stop offset="1" stop-color="#3E8E3E"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs5-app)"/>
    <rect x="14" y="30" width="200" height="110" rx="8" fill="url(#hs5-sea)" stroke="#101828" stroke-width="1.6"/>
    <g clip-path="url(#hs5-mapclip)"><clipPath id="hs5-mapclip"><rect x="14" y="30" width="200" height="110" rx="8"/></clipPath>
      ${found
        ? `<g transform="translate(84 24) scale(.82)" class="hs5-pop">
            <path d="${NA_SIL}" fill="url(#hs5-land)" stroke="#2E6E2E" stroke-width="2"/>
            <path d="${ISTHMUS}" fill="url(#hs5-land)" stroke="#2E6E2E" stroke-width="1.6"/>
            <path d="${SA_SIL}" fill="url(#hs5-land)" stroke="#2E6E2E" stroke-width="2"/>
          </g>
          <g transform="translate(84 24) scale(.82)" opacity=".9">
            <ellipse cx="46" cy="70" rx="58" ry="66" fill="none" stroke="#F2C24E" stroke-width="2.6" stroke-dasharray="8 6"/>
          </g>
          <g transform="translate(120 40)" class="hs5-pop">
            <path d="M0 14q-8-8 0-15 8 7 0 15z" fill="#E2574C" stroke="#8F2D1D" stroke-width="1.4"/>
            <circle cy="4.6" r="2.4" fill="#FFE8CE"/>
          </g>`
        : `<path d="M40 60q30-10 60 0t60 0q20-6 40 0" stroke="#3E5E86" stroke-width="2" fill="none" opacity=".5"/>
          <path d="M30 100q40-8 80 0t90-4" stroke="#3E5E86" stroke-width="2" fill="none" opacity=".4"/>
          <circle cx="120" cy="86" r="26" fill="none" stroke="#4E7EAE" stroke-width="2" opacity=".5"/>
          <text x="120" y="92" text-anchor="middle" font-size="15" font-weight="900" fill="#8FB2D6">?</text>`}
    </g>
    <rect x="14" y="12" width="164" height="14" rx="7" fill="#F2F5FA" stroke="#3A4658" stroke-width="1.4"/>
    <text x="26" y="22.5" font-size="9.5" font-weight="800" fill="#333D4B">아메리카</text>
    <g transform="translate(168 19)">
      <circle cx="-2" cy="-1" r="3.6" fill="none" stroke="#5A6B7E" stroke-width="1.8"/>
      <path d="M1 2l4 4" stroke="#5A6B7E" stroke-width="2" stroke-linecap="round"/>
    </g>
    <rect x="186" y="12" width="28" height="14" rx="7" fill="#3F8FC8"/>
    <path d="M195 19h10M201 15l4 4-4 4" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

export function renderSearchAmerica(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs5-search" });
  const btn = el("button", { class: "hs5-flipbtn", attrs: { type: "button" }, text: "검색하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "사회 숙제 중, 지도 앱 검색창에 <b>아메리카</b>를 입력했어요. 나라 이름… 맞죠? <b>검색</b>을 눌러 봐요!";

  let found = false;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = searchSvg(found);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  btn.addEventListener("click", () => {
    if (found) return;
    found = true;
    haptic(HAPTIC.tap);
    show();
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML = "나라 하나가 아니라 <b>지도가 통째로</b> 켜졌어요! 북쪽 덩어리와 남쪽 덩어리가 가느다란 땅으로 이어진 <b>거대한 대륙</b> — 이 땅엔 나라가 몇 개나 있을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "30개가 넘는 많은 나라가 있다",
          "미국·캐나다·멕시코 세 나라뿐이다",
          "'아메리카'라는 큰 나라 하나다",
        ],
        good: "맞아요! 아메리카는 나라가 아니라 <b>35개 나라의 대륙</b> — 미국은 그중 하나일 뿐이에요. 두 덩어리 땅에 이름이 두 벌 붙는 이야기, 지금 펼치러 가요!",
        bad: "'아메리카 = 미국'은 흔한 착각! 아메리카는 <b>35개 나라</b>가 모인 거대한 대륙이고, 미국은 그중 하나예요. 두 덩어리 땅에 이름이 두 벌 붙는 이야기, 지금 펼치러 가요!",
        onDone: finish,
      });
    }, 750);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L2: 팬 아메리칸 고속 도로 — 서쪽의 등뼈 ══════════ */
// 실데이터 지도(WORLD_LAND_PATH + AMERICA 크롭) 위에서 자동차가 경로를 따라 남하하고,
// 좌하단 차창 인셋(서쪽 창밖)엔 산맥 파노라마가 무한 루프로 흐른다 —
// "지도 위 위치는 계속 바뀌는데 창밖은 늘 산맥"이 장면의 심장. 지도 좌표는 전부
// lon/lat → mx/my 계산(눈대중 금지 — audit-soc5-geo 문법), 경유지는 서쪽 corridor 개략.
const AM_CROP = CONTINENTS.america.crop; // equirect 1000×500 기준 { x:28, y:47, w:392, h:361 }
const MAP_S = 148 / AM_CROP.h; // 카드 세로 148px에 맞춘 축척
const MAP_X = 8;
const MAP_Y = 9;
const MAP_W = AM_CROP.w * MAP_S;
const mx = (lon: number): number => (lonToX(lon) - AM_CROP.x) * MAP_S + MAP_X;
const my = (lat: number): number => (latToY(lat) - AM_CROP.y) * MAP_S + MAP_Y;
// 팬 아메리칸 고속 도로 경유지(서쪽 산줄기 corridor 개략) — 북부·남부 두 구간.
const PAN_N: [number, number][] = [
  [-149.9, 62.5], // 알래스카 출발
  [-135, 60], // 유콘
  [-122.5, 51], // 캐나다 서부
  [-111, 41], // 미국 로키 서쪽
  [-106.5, 31.7], // 멕시코 국경
  [-99.1, 19.4], // 멕시코시티
  [-90.5, 14.6], // 과테말라
  [-79.5, 9], // 파나마
];
const PAN_S: [number, number][] = [
  [-79.5, 9], // 파나마
  [-78.5, -0.2], // 키토
  [-77, -12], // 리마
  [-70.6, -33.4], // 산티아고
  [-68.3, -54.8], // 우수아이아(아르헨티나 남쪽 끝)
];
const legD = (pts: [number, number][]): string =>
  pts.map(([lo, la], i) => `${i === 0 ? "M" : "L"}${mx(lo).toFixed(1)} ${my(la).toFixed(1)}`).join(" ");
const DRIVE_MS = 1500; // 구간 주행 시간 — SMIL 자동차·경로 그리기(hs5-legdraw)가 공유
const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function carSvg(): string {
  // 원점 = 바퀴 바닥 중앙(경로 위에 착지). 기존 장면의 자동차 아트 축소 재사용.
  return `<g transform="translate(-7.5 -13.5) scale(.5)">
    <ellipse cx="15" cy="25.5" rx="15" ry="3.4" fill="#2A3A5E" opacity=".16"/>
    <rect x="0" y="8" width="30" height="14" rx="5" fill="url(#hs5-car)" stroke="#8F2D1D" stroke-width="1.6"/>
    <path d="M5 8q4-8 11-8t10 8z" fill="url(#hs5-car)" stroke="#8F2D1D" stroke-width="1.6"/>
    <path d="M8 7q3-5 7-5v5z" fill="#D8ECF8"/>
    <circle cx="7" cy="23" r="4" fill="#2E3A50" stroke="#101820" stroke-width="1.2"/>
    <circle cx="23" cy="23" r="4" fill="#2E3A50" stroke="#101820" stroke-width="1.2"/>
    <ellipse cx="6" cy="12" rx="4" ry="1.6" fill="#fff" opacity=".4"/>
  </g>`;
}

const mlabel = (x: number, y: number, t: string, anchor = "start", size = 7, color = "#2E3A50"): string =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" font-size="${size}" font-weight="900" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linejoin="round" opacity=".9">${t}</text><text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" font-size="${size}" font-weight="900" fill="${color}">${t}</text>`;

/** 차창 파노라마 한 타일(로컬 90×56, 좌우 끝 높이 동일 = 이어 붙여도 이음매 없음). */
function winTile(state: 0 | 1 | 2): string {
  if (state === 0) {
    // 알래스카 — 침엽수·설산
    return `<path d="M0 34 L10 22 L18 30 L28 14 L36 28 L46 20 L54 32 L64 18 L74 30 L82 24 L90 34 L90 56 L0 56 Z" fill="url(#hs5-mtn)" stroke="#4E6A88" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M24.5 18.5 28 14l3.5 4.5q-3.5 2.6-7 0z" fill="#F6FAFD"/>
      <path d="M43.5 23 46 20l2.5 3q-2.5 2-5 0z" fill="#F6FAFD"/>
      <path d="M61 21.8 64 18l3 3.8q-3 2.4-6 0z" fill="#F6FAFD"/>
      <path d="M14 36l4 8h-8zM14 32l3.4 6.8h-6.8z" fill="#2E6E4E"/>
      <rect x="13.3" y="44" width="1.4" height="2.6" fill="#6E4E2E"/>
      <path d="M76 38l3.4 7h-6.8zM76 35l2.9 5.8h-5.8z" fill="#2E6E4E"/>
      <rect x="75.4" y="45" width="1.2" height="2" fill="#6E4E2E"/>`;
  }
  if (state === 1) {
    // 중미 — 화산·야자
    return `<path d="M0 36 L12 30 Q18 26 24 30 L36 18 L40 15 L43 16.5 L46 15 L50 18 L60 29 Q68 26 76 31 L90 36 L90 56 L0 56 Z" fill="url(#hs5-mtn2)" stroke="#6E5A42" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M40 15l3 1.5 3-1.5" stroke="#F5C86E" stroke-width="1.2" fill="none"/>
      <circle cx="45" cy="10" r="2.7" fill="#E6EBF2" opacity=".9"/>
      <circle cx="48.5" cy="6.2" r="2" fill="#EDF1F7" opacity=".75"/>
      <path d="M12 46q1.5-5 4.5-8" stroke="#8F6438" stroke-width="1.5" fill="none"/>
      <path d="M16.5 38q4-3 7.5-1M16.5 38q-4-3-7.5-1M16.5 38q.5-4 3.5-6M16.5 38q-1.5-4-4.5-5" stroke="#3F9A5C" stroke-width="1.3" fill="none"/>
      <path d="M70 44q1-4 3.5-6" stroke="#8F6438" stroke-width="1.3" fill="none"/>
      <path d="M73.5 38q3-2.4 6-1M73.5 38q-3-2.4-6-1M73.5 38q.4-3.4 2.6-4.6" stroke="#3F9A5C" stroke-width="1.1" fill="none"/>`;
  }
  // 안데스 — 더 높은 설산·마른 풀
  return `<path d="M0 38 L8 20 L14 28 L22 8 L30 24 L38 12 L46 28 L56 10 L64 26 L72 16 L80 30 L90 38 L90 56 L0 56 Z" fill="url(#hs5-mtn)" stroke="#4E6A88" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M17.5 13.5 22 8l4.5 5.5q-4.5 3.2-9 0z" fill="#F6FAFD"/>
    <path d="M34 17 38 12l4 5q-4 2.8-8 0z" fill="#F6FAFD"/>
    <path d="M51.5 15.5 56 10l4.5 5.5q-4.5 3.2-9 0z" fill="#F6FAFD"/>
    <path d="M69 19.8 72 16l3 3.8q-3 2.2-6 0z" fill="#F6FAFD"/>
    <path d="M20 45q2-4.5 4 0M58 45.5q2-4 4 0M78 44q2-4 4 0" stroke="#C8A468" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
}

/** 차창 인셋 — 산맥·구름·차선이 각기 다른 속도로 흐르는 패럴랙스 루프(서쪽 창). */
function windowInset(state: 0 | 1 | 2): string {
  const sky = state === 0 ? "#BFE0F2" : state === 1 ? "#FFE2A8" : "#CFE7F5";
  const sun =
    state === 1
      ? `<circle cx="75" cy="11" r="6" fill="#FFC24D"/>`
      : `<circle cx="76" cy="9.5" r="4.8" fill="${state === 0 ? "#FFF3C8" : "#FFEBAE"}" opacity=".92"/>`;
  const clouds = `<g fill="#FFFFFF" opacity=".85"><ellipse cx="20" cy="10" rx="8" ry="3"/><ellipse cx="26" cy="8.4" rx="5" ry="2.4"/><ellipse cx="58" cy="15" rx="7" ry="2.6"/></g>`;
  const tile = winTile(state);
  return `<rect x="12" y="94" width="96" height="62" rx="10" fill="#333D4B" stroke="#1E2634" stroke-width="1.6"/>
    <svg x="15" y="97" width="90" height="56" viewBox="0 0 90 56" aria-hidden="true">
      <g clip-path="url(#hs5-wclip)">
        <rect width="90" height="56" fill="${sky}"/>
        ${sun}
        <g class="hs5-cloudloop">${clouds}<g transform="translate(90 0)">${clouds}</g></g>
        <g class="hs5-mtnloop"><g>${tile}</g><g transform="translate(90 0)">${tile}</g></g>
        <rect x="0" y="47" width="90" height="9" fill="url(#hs5-road)"/>
        <g class="hs5-roadloop"><path d="M-20 51.5H112" stroke="#F2D998" stroke-width="1.7" stroke-dasharray="8 8"/></g>
        <g class="hs5-streakloop" opacity=".5" stroke="#FFFFFF" stroke-width="1.3" stroke-linecap="round">
          <path d="M28 12h11M60 7h9"/><path d="M118 12h11M150 7h9"/>
        </g>
      </g>
      <rect x=".5" y=".5" width="89" height="55" rx="6" fill="none" stroke="#101820" stroke-width="1" opacity=".3"/>
    </svg>
    <g transform="translate(16 88)">
      <rect width="52" height="13" rx="6.5" fill="#2E3A50"/>
      <path d="M7 6.5l4.5-3v6z" fill="#FFC24D"/>
      <text x="15" y="9.7" font-size="7.5" font-weight="800" fill="#FFFFFF">서쪽 창밖</text>
    </g>`;
}

function roadSvg(state: 0 | 1 | 2): string {
  // state 0: 알래스카 출발 대기 · 1: 북부 구간 주행(→파나마) · 2: 남부 구간 주행(→아르헨티나).
  const dN = legD(PAN_N);
  const dS = legD(PAN_S);
  const start = { x: mx(PAN_N[0][0]), y: my(PAN_N[0][1]) };
  const mid = { x: mx(PAN_S[0][0]), y: my(PAN_S[0][1]) };
  const end = { x: mx(PAN_S[PAN_S.length - 1][0]), y: my(PAN_S[PAN_S.length - 1][1]) };
  const here = state === 0 ? start : state === 1 ? mid : end;
  const car =
    state === 0 || REDUCED
      ? `<g transform="translate(${here.x.toFixed(1)} ${here.y.toFixed(1)})">${carSvg()}</g>`
      : `<g><animateMotion dur="${DRIVE_MS / 1000}s" fill="freeze" path="${state === 1 ? dN : dS}"/>${carSvg()}</g>`;
  const planPath = (d: string): string =>
    `<path d="${d}" stroke="#FFFFFF" stroke-width="3.4" opacity=".6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#5A6B7E" stroke-width="1.7" stroke-dasharray="4 4" fill="none" stroke-linejoin="round"/>`;
  const traveled = (d: string, drawing: boolean): string =>
    `<path d="${d}" pathLength="100"${drawing && !REDUCED ? ` class="hs5-legdraw"` : ""} stroke="#E8590C" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="hs5-sea3" cx=".5" cy=".4" r=".95"><stop offset="0" stop-color="#D9EDF8"/><stop offset="1" stop-color="#BCDCEF"/></radialGradient>
      <linearGradient id="hs5-mtn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B8CCE0"/><stop offset=".55" stop-color="#7E9AB8"/><stop offset="1" stop-color="#54708E"/></linearGradient>
      <linearGradient id="hs5-mtn2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C8A87E"/><stop offset=".6" stop-color="#A8825A"/><stop offset="1" stop-color="#84603E"/></linearGradient>
      <linearGradient id="hs5-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E7A8E"/><stop offset="1" stop-color="#4A566A"/></linearGradient>
      <linearGradient id="hs5-car" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8A5E"/><stop offset=".55" stop-color="#E8590C"/><stop offset="1" stop-color="#B8420A"/></linearGradient>
      <clipPath id="hs5-mclip"><rect x="${MAP_X}" y="${MAP_Y}" width="${MAP_W.toFixed(1)}" height="148" rx="8"/></clipPath>
      <clipPath id="hs5-wclip"><rect width="90" height="56" rx="6"/></clipPath>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs5-sea3)"/>
    <g clip-path="url(#hs5-mclip)">
      <g transform="translate(${(MAP_X - AM_CROP.x * MAP_S).toFixed(2)} ${(MAP_Y - AM_CROP.y * MAP_S).toFixed(2)}) scale(${MAP_S.toFixed(4)})">
        <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd" stroke="rgba(74,88,110,.5)" stroke-width=".7" vector-effect="non-scaling-stroke"/>
      </g>
      <line x1="${MAP_X}" y1="${my(0).toFixed(1)}" x2="${(MAP_X + MAP_W).toFixed(1)}" y2="${my(0).toFixed(1)}" stroke="#7FA8C8" stroke-width="1" stroke-dasharray="4 5" opacity=".55"/>
    </g>
    ${mlabel(164, my(0) - 3, "적도", "end", 6.5, "#5A7A96")}
    ${planPath(dN)}${planPath(dS)}
    ${state >= 1 ? traveled(dN, state === 1) : ""}
    ${state >= 2 ? traveled(dS, true) : ""}
    <circle cx="${start.x.toFixed(1)}" cy="${start.y.toFixed(1)}" r="2.8" fill="#FFFFFF" stroke="#2E3A50" stroke-width="1.4"/>
    <circle cx="${mid.x.toFixed(1)}" cy="${mid.y.toFixed(1)}" r="2.3" fill="#FFFFFF" stroke="#2E3A50" stroke-width="1.3"/>
    <circle cx="${end.x.toFixed(1)}" cy="${end.y.toFixed(1)}" r="2.8" fill="#FFFFFF" stroke="#2E3A50" stroke-width="1.4"/>
    ${mlabel(24, 31.5, "알래스카", "middle")}
    ${mlabel(mid.x + 8, mid.y + 4.5, "파나마")}
    ${mlabel(end.x + 9, end.y + 3.5, "아르헨티나")}
    ${car}
    <g transform="translate(196 26)">
      <rect x="-26" y="-12" width="52" height="24" rx="6" fill="#FFFFFF" opacity=".9" stroke="#8A93A6" stroke-width="1.2"/>
      <text x="0" y="-1" text-anchor="middle" font-size="7.5" font-weight="800" fill="#4E5968">${state === 0 ? "출발 · 북쪽 끝" : state === 1 ? "중간 · 지협" : "도착 · 남쪽 끝"}</text>
      <text x="0" y="8.5" text-anchor="middle" font-size="7" font-weight="700" fill="#8A94A6">${state === 0 ? "알래스카" : state === 1 ? "파나마 부근" : "아르헨티나"}</text>
    </g>
    ${windowInset(state)}
  </svg>`;
}

export function renderPanRoad(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs5-road" });
  const btn = el("button", { class: "hs5-flipbtn", attrs: { type: "button" }, text: "남쪽으로 달리기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "세계에서 가장 긴 자동차 도로, <b>팬 아메리칸 고속 도로</b>! 알래스카에서 아르헨티나까지 대륙을 종단해요. <b>출발!</b>";

  let state: 0 | 1 | 2 = 0;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = roadSvg(state);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  btn.addEventListener("click", () => {
    if (state >= 2) return;
    state = (state + 1) as 1 | 2;
    haptic(HAPTIC.tap);
    show();
    if (state === 1) {
      helper.innerHTML = "며칠을 달려 대륙의 잘록한 허리까지 왔어요. 그런데 창밖 풍경이 이상해요 — <b>서쪽엔 아까부터 계속 산</b>이잖아요? <b>한 번 더!</b>";
    } else {
      btn.classList.add("done");
      btn.disabled = true;
      face("curious");
      helper.innerHTML = "남쪽 끝까지 왔는데도 <b>서쪽 창밖은 여전히 산맥</b>! 북쪽 끝부터 남쪽 끝까지 서쪽 가장자리에 산줄기가 이어져요. 북쪽의 산맥과 남쪽의 산맥은 어떤 사이일까요?";
      // 자동차가 남쪽 끝에 도착(DRIVE_MS)한 뒤 예측 선택지를 연다.
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "이름은 달라도 둘 다 서쪽 가장자리를 따라 솟은 높은 산맥이다",
            "북쪽에만 있는 산맥이 남쪽까지 보인 것이다",
            "동쪽 산맥이 지도에 잘못 그려진 것이다",
          ],
          good: "정확해요! 북쪽은 <b>로키산맥</b>, 남쪽은 <b>안데스산맥</b> — 이름은 달라도 둘 다 대륙 서쪽 가장자리를 따라 높고 험준하게 솟았어요. 아메리카의 등뼈를 훑으러 가요!",
          bad: "착시도 오류도 아니에요 — 진짜로 산이 이어져요! 북쪽은 <b>로키산맥</b>, 남쪽은 <b>안데스산맥</b>. 둘 다 서쪽 가장자리를 따라 높고 험준하죠. 아메리카의 등뼈를 훑으러 가요!",
          onDone: finish,
        });
      }, REDUCED ? 750 : DRIVE_MS + 350);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L3: 키토 여행 짐 — 적도의 서늘함 ══════════ */
function packSvg(checked: boolean): string {
  if (!checked) {
    return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hs5-room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2EFE8"/><stop offset="1" stop-color="#E2DCCE"/></linearGradient>
        <linearGradient id="hs5-case" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7EB2E8"/><stop offset=".55" stop-color="#4E82C8"/><stop offset="1" stop-color="#2E5EA8"/></linearGradient>
        <linearGradient id="hs5-shirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9B8"/><stop offset="1" stop-color="#F2C878"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs5-room)"/>
      <ellipse cx="96" cy="150" rx="70" ry="5" fill="#2A3A5E" opacity=".12"/>
      <rect x="36" y="84" width="120" height="62" rx="10" fill="url(#hs5-case)" stroke="#1E3E78" stroke-width="2"/>
      <path d="M36 106h120" stroke="#1E3E78" stroke-width="1.6" opacity=".6"/>
      <rect x="86" y="76" width="20" height="10" rx="4" fill="#2E5EA8" stroke="#1E3E78" stroke-width="1.6"/>
      <ellipse cx="58" cy="92" rx="9" ry="2.6" fill="#fff" opacity=".35"/>
      <g transform="translate(56 112)">
        <path d="M0 6l8-8h20l8 8-6 5-3-3v16H9v-16l-3 3z" fill="url(#hs5-shirt)" stroke="#C2933A" stroke-width="1.6" stroke-linejoin="round"/>
      </g>
      <g transform="translate(104 112)">
        <path d="M0 6l8-8h20l8 8-6 5-3-3v16H9v-16l-3 3z" fill="#8ED2F5" stroke="#3F7EA8" stroke-width="1.6" stroke-linejoin="round"/>
      </g>
      <circle cx="146" cy="122" r="9" fill="#F2C24E" stroke="#C2933A" stroke-width="1.6"/>
      <path d="M138 122h16M146 114v16" stroke="#C2933A" stroke-width="1.2" opacity=".6"/>
      <g transform="translate(178 40)">
        <rect x="-14" y="-22" width="52" height="40" rx="6" fill="#FFFFFF" stroke="#8A93A6" stroke-width="1.6"/>
        <text x="12" y="-8" text-anchor="middle" font-size="8" font-weight="900" fill="#333D4B">여행 티켓</text>
        <text x="12" y="4" text-anchor="middle" font-size="8.5" font-weight="800" fill="#E8590C">키토行</text>
        <text x="12" y="14" text-anchor="middle" font-size="6.5" font-weight="700" fill="#8A94A6">적도의 도시 · 0°</text>
      </g>
      <ellipse cx="196" cy="150" rx="18" ry="4" fill="#2A3A5E" opacity=".1"/>
      <g stroke="#3C4654" stroke-width="2.2" fill="none">
        <circle cx="196" cy="106" r="7" fill="#FFE8CE"/>
        <path d="M196 113v13M196 117l-8 3M196 117l8 3M196 126l-6 12M196 126l6 12"/>
        <path d="M192 103.4q2 1.8 4 1.8t4-1.8" stroke-width="1.5"/>
      </g>
      <circle cx="52" cy="34" r="12" fill="#FFC24D"/>
      <path d="M52 18v-4M64 22l3-3M68 34h4M40 22l-3-3" stroke="#E8940A" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs5-phone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C2436"/><stop offset="1" stop-color="#28324A"/></linearGradient>
      <linearGradient id="hs5-wx" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA8C8"/><stop offset="1" stop-color="#6E88A8"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs5-phone)"/>
    <rect x="60" y="14" width="120" height="140" rx="14" fill="#0E1626" stroke="#3A4658" stroke-width="2"/>
    <rect x="68" y="24" width="104" height="122" rx="9" fill="url(#hs5-wx)"/>
    <text x="120" y="44" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF">키토</text>
    <text x="120" y="56" text-anchor="middle" font-size="7" font-weight="700" fill="#E2ECF8">지금 날씨</text>
    <text x="120" y="88" text-anchor="middle" font-size="26" font-weight="900" fill="#FFFFFF">13℃</text>
    <g transform="translate(120 104)">
      <ellipse cx="-8" cy="0" rx="12" ry="7" fill="#F2F5FA"/>
      <ellipse cx="6" cy="-3" rx="10" ry="6" fill="#E2E8F2"/>
    </g>
    <text x="120" y="128" text-anchor="middle" font-size="7.5" font-weight="800" fill="#F2F5FA">흐리고 서늘함 · 긴팔 챙기세요</text>
    <text x="120" y="139" text-anchor="middle" font-size="6.5" font-weight="700" fill="#D2DCEC">일 년 내내 봄 날씨</text>
    <g class="hs5-pop" transform="translate(34 118)">
      <circle r="13" fill="#28324A" stroke="#F2C24E" stroke-width="2"/>
      <text y="5" text-anchor="middle" font-size="13" font-weight="900" fill="#F2C24E">?</text>
    </g>
    <g transform="translate(206 122)">
      <ellipse cx="0" cy="28" rx="16" ry="3.6" fill="#000" opacity=".25"/>
      <g stroke="#8FA8C8" stroke-width="2.2" fill="none">
        <circle cx="0" cy="-14" r="7" fill="#1A2234"/>
        <path d="M0 -7v14M0 -3l-8 4M0 -3l8 4M0 7l-6 12M0 7l6 12"/>
        <path d="M-3 -16q3 -2 6 0" stroke-width="1.5"/>
      </g>
    </g>
  </svg>`;
}

export function renderQuitoPack(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs5-pack" });
  const btn = el("button", { class: "hs5-flipbtn", attrs: { type: "button" }, text: "현지 날씨 확인하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "방학에 <b>적도의 도시 키토</b>로 여행을 가요! 적도니까 완전 덥겠죠? 캐리어엔 반팔과 선크림뿐 — 출발 전에 <b>날씨 확인</b>!";

  let checked = false;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = packSvg(checked);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  btn.addEventListener("click", () => {
    if (checked) return;
    checked = true;
    haptic(HAPTIC.tap);
    show();
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML = "13℃?! 적도 바로 옆인데 <b>서늘한 봄 날씨</b>래요. 같은 위도의 다른 도시들은 푹푹 찌는데 — 키토만 왜 서늘할까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "도시가 아주 높은 산 위에 있어서",
          "적도의 태양이 사실은 약해서",
          "바다에서 찬 바람이 불어와서",
        ],
        good: "정확해요! 키토는 안데스산맥 <b>해발 약 2,850m</b> 위의 도시 — 높이 올라가면 기온이 내려가요. 고도를 직접 조종하며 이 비밀을 확인하러 가요!",
        bad: "적도의 태양은 세계에서 가장 강하고, 키토는 바다에서 멀어요 — 비밀은 <b>높이</b>! 키토는 해발 약 2,850m 산 위의 도시라 일 년 내내 서늘하답니다. 고도를 직접 조종하러 가요!",
        onDone: finish,
      });
    }, 750);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L4: 대표팀 명단 — 성씨의 세계 여행 ══════════ */
function rosterSvg(zoom: boolean): string {
  const names = ["스미스", "가르시아", "김", "응우옌", "오코로"];
  const tones = ["#8E9EC8", "#E8843A", "#3F8FC8", "#2E9E5B", "#8A5AC2"];
  if (!zoom) {
    return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hs5-tv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E3A50"/><stop offset="1" stop-color="#1C2436"/></linearGradient>
        <linearGradient id="hs5-pitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E9E4E"/><stop offset="1" stop-color="#2E7E3E"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs5-tv)"/>
      <rect x="16" y="16" width="208" height="122" rx="8" fill="url(#hs5-pitch)"/>
      <circle cx="120" cy="77" r="24" fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity=".6"/>
      <path d="M120 16v122" stroke="#FFFFFF" stroke-width="1.6" opacity=".6"/>
      ${[54, 90, 150, 186].map((x, i) => `
        <g stroke="#F2F5FA" stroke-width="2" fill="none">
          <circle cx="${x}" cy="${58 + (i % 2) * 30}" r="4.6" fill="#3A4A66"/>
          <path d="M${x} ${63 + (i % 2) * 30}v9M${x} ${66 + (i % 2) * 30}l-5 3M${x} ${66 + (i % 2) * 30}l5 3M${x} ${72 + (i % 2) * 30}l-4 8M${x} ${72 + (i % 2) * 30}l4 8"/>
        </g>`).join("")}
      <circle cx="120" cy="104" r="4" fill="#FFFFFF" stroke="#2A3A5E" stroke-width="1.2"/>
      <rect x="16" y="112" width="92" height="26" rx="5" fill="#101828" opacity=".85"/>
      <text x="24" y="123" font-size="7.5" font-weight="800" fill="#F2C24E">오늘의 명단</text>
      <path d="M24 128h72M24 133h56" stroke="#5A6880" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="88" y="146" width="64" height="5" rx="2.5" fill="#2E3A50"/>
    </svg>`;
  }
  const rows = names
    .map(
      (n, i) => `<g transform="translate(0 ${44 + i * 19})" class="hs5-pop" style="animation-delay:${i * 90}ms">
      <rect x="30" y="-12" width="120" height="16" rx="5" fill="${i % 2 ? "#1A2438" : "#202C44"}"/>
      <circle cx="42" cy="-4" r="5" fill="${tones[i]}"/>
      <text x="43" y="-1.4" text-anchor="middle" font-size="6.5" font-weight="900" fill="#FFFFFF">${i + 1}</text>
      <text x="54" y="-0.5" font-size="9" font-weight="800" fill="#F2F5FA">${n}</text>
    </g>`,
    )
    .join("");
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs5-tv2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E3A50"/><stop offset="1" stop-color="#1C2436"/></linearGradient>
      <radialGradient id="hs5-glow" cx=".5" cy=".4" r=".9"><stop offset="0" stop-color="#22304A"/><stop offset="1" stop-color="#141C2E"/></radialGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs5-tv2)"/>
    <rect x="16" y="16" width="208" height="122" rx="8" fill="url(#hs5-glow)"/>
    <text x="40" y="34" font-size="9" font-weight="900" fill="#F2C24E">한 팀의 명단인데…</text>
    ${rows}
    <g transform="translate(186 78)">
      <circle r="34" fill="#0E1626" stroke="#3A4A66" stroke-width="1.6"/>
      <path d="M-24 -6q10-10 22-6t24 2" stroke="#3E5E86" stroke-width="1.6" fill="none" opacity=".8"/>
      <path d="M-20 10q14-4 24 2t18-2" stroke="#3E5E86" stroke-width="1.6" fill="none" opacity=".8"/>
      ${[[-18, -14], [12, -18], [20, 8], [-8, 16]].map(([x, y], i) => `
        <path d="M${x} ${y}q${(-x * 0.6).toFixed(0)} ${(-y * 0.6 - 8).toFixed(0)} ${-x} ${-y}" stroke="${tones[i]}" stroke-width="1.8" fill="none" stroke-dasharray="3 3"/>
        <circle cx="${x}" cy="${y}" r="3" fill="${tones[i]}"/>`).join("")}
      <circle cx="0" cy="0" r="4.6" fill="#E8590C" stroke="#8F2D1D" stroke-width="1.4"/>
    </g>
    <rect x="88" y="146" width="64" height="5" rx="2.5" fill="#2E3A50"/>
  </svg>`;
}

export function renderTeamRoster(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs5-roster" });
  const btn = el("button", { class: "hs5-flipbtn", attrs: { type: "button" }, text: "명단 확대하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "국제 대회 축구 중계! 아메리카의 <b>한 나라 대표팀</b>이 나왔어요. 화면 아래 선수 명단 — <b>확대</b>해 볼까요?";

  let zoom = false;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = rosterSvg(zoom);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  btn.addEventListener("click", () => {
    if (zoom) return;
    zoom = true;
    haptic(HAPTIC.tap);
    show();
    btn.classList.add("done");
    btn.disabled = true;
    face("curious");
    helper.innerHTML = "스미스, 가르시아, 김, 응우옌, 오코로 — <b>한 팀</b>인데 성씨의 고향이 유럽, 라틴, 아시아, 아프리카까지! 어떻게 이런 팀이 만들어졌을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "세계 곳곳에서 사람들이 이주해 와 함께 살게 되어서",
          "이번 대회만 외국 선수를 빌려 와서",
          "성씨를 추첨으로 새로 정하는 나라라서",
        ],
        good: "맞아요! 아메리카는 <b>이주가 만든 대륙</b> — 원주민의 땅에 유럽·아프리카·아시아에서 온 사람들이 더해져 오늘의 다양한 팀이 됐어요. 그 이주의 역사를 만나러 가요!",
        bad: "빌린 것도 추첨도 아니에요 — 성씨는 <b>이주의 발자국</b>! 세계 곳곳에서 아메리카로 건너온 사람들의 역사가 명단 한 장에 담긴 거예요. 그 이야기를 만나러 가요!",
        onDone: finish,
      });
    }, 750);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L5: 저녁 밥상 — 원산지 태그의 반전 ══════════ */
function tableSvg(state: 0 | 1 | 2): string {
  const tag = (x: number, y: number, on: boolean, hot = false): string =>
    on
      ? `<g transform="translate(${x} ${y})" class="hs5-pop">
        <rect x="-24" y="-11" width="48" height="15" rx="7" fill="${hot ? "#C0471C" : "#2E7E4E"}"/>
        <path d="M-2 4l2 5 2-5z" fill="${hot ? "#C0471C" : "#2E7E4E"}"/>
        <text y="0" text-anchor="middle" font-size="8" font-weight="900" fill="#FFFFFF">아메리카산</text>
      </g>`
      : "";
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs5-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0B27A"/><stop offset="1" stop-color="#B8854E"/></linearGradient>
      <radialGradient id="hs5-kimchi" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#FF7A5E"/><stop offset=".6" stop-color="#E2432E"/><stop offset="1" stop-color="#A82418"/></radialGradient>
      <radialGradient id="hs5-potato" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#FFE9B8"/><stop offset="1" stop-color="#E0B26E"/></radialGradient>
      <linearGradient id="hs5-corn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE082"/><stop offset="1" stop-color="#F2B33E"/></linearGradient>
      <radialGradient id="hs5-tomato" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#FF8A6E"/><stop offset=".6" stop-color="#E2574C"/><stop offset="1" stop-color="#B02E22"/></radialGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="#F5EFE2"/>
    <rect x="14" y="58" width="212" height="98" rx="10" fill="url(#hs5-table)" stroke="#8F6438" stroke-width="1.8"/>
    <ellipse cx="120" cy="152" rx="92" ry="5" fill="#2A1E12" opacity=".18"/>
    <ellipse cx="58" cy="94" rx="26" ry="12" fill="#FFFFFF" stroke="#D8DEE8" stroke-width="1.6"/>
    <path d="M42 92q8-6 12-2t10-3q6-4 10 1t-4 7q-10 4-20 2t-8-5z" fill="url(#hs5-kimchi)"/>
    <ellipse cx="130" cy="90" rx="24" ry="11" fill="#FFFFFF" stroke="#D8DEE8" stroke-width="1.6"/>
    <ellipse cx="122" cy="87" rx="7" ry="5" fill="url(#hs5-potato)" stroke="#B8854E" stroke-width="1"/>
    <ellipse cx="136" cy="89" rx="7.5" ry="5.4" fill="url(#hs5-potato)" stroke="#B8854E" stroke-width="1"/>
    <g transform="translate(196 88) rotate(-16)">
      <ellipse rx="16" ry="7" fill="url(#hs5-corn)" stroke="#C2861E" stroke-width="1.4"/>
      <path d="M-10 -4v8M-4 -6v11M2 -6v11M8 -4v8" stroke="#C2861E" stroke-width=".9" opacity=".7"/>
      <path d="M14 -3q8-3 10 2-6 4-10 1z" fill="#8FBF5A"/>
    </g>
    <ellipse cx="76" cy="128" rx="24" ry="11" fill="#FFFFFF" stroke="#D8DEE8" stroke-width="1.6"/>
    <circle cx="68" cy="124" r="6.5" fill="url(#hs5-tomato)"/>
    <circle cx="84" cy="126" r="7" fill="url(#hs5-tomato)"/>
    <path d="M66 118l2-3M82 119l2-3" stroke="#3E8E3E" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="158" cy="128" rx="20" ry="10" fill="#F5F0E2" stroke="#D8CCAA" stroke-width="1.6"/>
    <ellipse cx="158" cy="126" rx="13" ry="6" fill="#F8F4EA"/>
    <ellipse cx="52" cy="88" rx="8" ry="3" fill="#fff" opacity=".35"/>
    ${tag(130, 68, state >= 1)}${tag(196, 66, state >= 1)}${tag(76, 108, state >= 1)}
    ${tag(58, 72, state >= 2, true)}
    ${state >= 2 ? `<text x="58" y="118" text-anchor="middle" font-size="7" font-weight="800" fill="#C0471C">김치의 고추까지!</text>` : ""}
  </svg>`;
}

export function renderDinnerTable(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs5-dinner", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 원산지 태그 켜기" } });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "저녁 밥상이에요. 김치, 감자볶음, 찐 옥수수, 토마토 — 익숙한 우리 밥상이죠? <b>밥상을 탭</b>해서 재료의 <b>고향 태그</b>를 켜 봐요.";

  let state: 0 | 1 | 2 = 0;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = tableSvg(state);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  const next = (): void => {
    if (state >= 2) return;
    state = (state + 1) as 1 | 2;
    haptic(HAPTIC.tap);
    show();
    if (state === 1) {
      helper.innerHTML = "감자, 옥수수, 토마토 — 셋 다 <b>아메리카가 고향</b>이래요! 그럼 김치는 당연히 우리 것이겠죠? <b>한 번 더 탭!</b>";
    } else {
      face("surprised");
      helper.innerHTML = "김치의 <b>고추</b>까지 아메리카에서 온 작물이라니! 원산지 아메리카의 작물들이 우리 밥상 곳곳에 있어요. 어떻게 여기까지 왔을까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "사람들이 대륙을 오가며 작물과 문화를 함께 실어 날라서",
            "철새들이 씨앗을 물어다 퍼뜨려서",
            "우리나라에서 먼저 기르던 것이 아메리카로 간 것이라서",
          ],
          good: "맞아요! 약 500년 전부터 사람들이 바다를 건너며 작물도, 음악도, 음식도 함께 실어 날랐어요. 문화가 만나 <b>섞이면 새것이 태어나죠</b> — 그 무대가 바로 아메리카랍니다!",
          bad: "새도, 반대 방향도 아니에요 — 답은 <b>사람의 이동</b>! 아메리카 원산의 작물이 배를 타고 세계로 퍼졌고, 문화도 함께 건너가 섞였어요. 섞임이 만든 새 문화를 만나러 가요!",
          onDone: finish,
        });
      }, 750);
    }
  };
  fig.addEventListener("click", next);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      next();
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L6: 마트 과일 코너 — 로고는 하나 ══════════ */
function fruitSvg(zoom: boolean): string {
  const logo = (x: number, y: number, sc = 1): string => `
    <g transform="translate(${x} ${y}) scale(${sc})" class="${zoom ? "hs5-pop" : ""}">
      <circle r="7" fill="#2E5EA8" stroke="#1E3E78" stroke-width="1.4"/>
      <path d="M-3 0q3-4 6 0t-6 0z" fill="#FFFFFF" transform="rotate(-20)"/>
      <circle cx="2.4" cy="-2.4" r="1.2" fill="#8ED2F5"/>
    </g>`;
  const priceTag = (x: number, y: number, t: string): string => `
    <g transform="translate(${x} ${y})">
      <rect x="-26" y="-9" width="52" height="14" rx="4" fill="#FFF8E8" stroke="#C2933A" stroke-width="1.2"/>
      <text y="1.5" text-anchor="middle" font-size="7.5" font-weight="800" fill="#4E5968">${t}</text>
    </g>`;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs5-mart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2EFE8"/><stop offset="1" stop-color="#E2DCCE"/></linearGradient>
      <linearGradient id="hs5-shelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8A87E"/><stop offset="1" stop-color="#A8825A"/></linearGradient>
      <linearGradient id="hs5-banana" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE082"/><stop offset="1" stop-color="#F2B33E"/></linearGradient>
      <radialGradient id="hs5-mango" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#FFC24D"/><stop offset="1" stop-color="#E8843A"/></radialGradient>
      <linearGradient id="hs5-pine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0B26E"/><stop offset="1" stop-color="#B8854E"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs5-mart)"/>
    <rect x="14" y="30" width="212" height="10" rx="4" fill="url(#hs5-shelf)"/>
    <rect x="14" y="96" width="212" height="10" rx="4" fill="url(#hs5-shelf)"/>
    <ellipse cx="120" cy="152" rx="90" ry="5" fill="#2A3A5E" opacity=".1"/>
    <g transform="translate(56 66)">
      <path d="M-22 4q4-18 20-22t24 6q-6 6-14 6-14 2-20 12z" fill="url(#hs5-banana)" stroke="#C2861E" stroke-width="1.6"/>
      <path d="M-20 2q6-14 20-18" stroke="#C2861E" stroke-width="1" opacity=".6" fill="none"/>
      ${logo(14, -14, 0.9)}
    </g>
    <g transform="translate(136 62)">
      <ellipse rx="17" ry="12" fill="url(#hs5-mango)" stroke="#B85E1E" stroke-width="1.6" transform="rotate(-14)"/>
      <ellipse cx="-6" cy="-5" rx="5" ry="2.4" fill="#fff" opacity=".4" transform="rotate(-20)"/>
      ${logo(12, -8, 0.9)}
    </g>
    <g transform="translate(200 58)">
      <ellipse cy="8" rx="13" ry="16" fill="url(#hs5-pine)" stroke="#8F6438" stroke-width="1.6"/>
      <path d="M-9 2l18 12M-9 8l18 12M-9 14l16 10M9 2l-18 12M9 8l-18 12" stroke="#8F6438" stroke-width=".8" opacity=".6"/>
      <path d="M-6 -8q6 4 6 0t6 0q-2-8 2-10-8 0-8 4-2-6-8-4 4 2 2 10z" fill="#3F9A5C" stroke="#1E6E3C" stroke-width="1.2"/>
      ${logo(12, 2, 0.9)}
    </g>
    ${priceTag(56, 116, "필리핀산 바나나")}
    ${priceTag(136, 116, "타이산 망고")}
    ${zoom ? priceTag(200, 116, "코스타리카산") : priceTag(200, 116, "파인애플")}
    ${zoom
      ? `<g transform="translate(120 140)" class="hs5-pop">
          <rect x="-74" y="-10" width="148" height="18" rx="9" fill="#2E5EA8"/>
          <text y="3" text-anchor="middle" font-size="8.5" font-weight="900" fill="#FFFFFF">원산지는 셋, 회사는 하나?!</text>
        </g>`
      : `<g stroke="#3C4654" stroke-width="2.2" fill="none">
          <circle cx="30" cy="122" r="7" fill="#FFE8CE"/>
          <path d="M30 129v12M30 133l-7 3M30 133l8-3M30 141l-6 11M30 141l6 11"/>
          <path d="M27 120h6" stroke-width="1.5"/>
        </g>`}
  </svg>`;
}

export function renderFruitLogo(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs5-fruit" });
  const btn = el("button", { class: "hs5-flipbtn", attrs: { type: "button" }, text: "로고 스티커 살펴보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "마트 과일 코너예요. 필리핀산 바나나, 타이산 망고, 코스타리카산 파인애플 — 그런데 과일마다 붙은 <b>파란 스티커</b>가 어딘가 닮았어요. <b>살펴보기!</b>";

  let zoom = false;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = fruitSvg(zoom);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  btn.addEventListener("click", () => {
    if (zoom) return;
    zoom = true;
    haptic(HAPTIC.tap);
    show();
    btn.classList.add("done");
    btn.disabled = true;
    face("curious");
    helper.innerHTML = "세 과일의 스티커가 <b>전부 같은 회사 로고</b>예요! 나라도 대륙도 다른데 회사는 하나 — 이 회사의 정체는 뭘까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "여러 나라에 농장과 공장을 두고 활동하는 큰 기업",
          "세 나라가 함께 세운 국제기구",
          "같은 로고를 몰래 베껴 쓰는 다른 회사들",
        ],
        good: "정답! 국경을 넘어 기르고, 포장하고, 전 세계에 파는 <b>초국적 기업</b>이에요. 본사는 미국, 농장은 세계 곳곳 — 국경 없는 회사의 비밀을 파헤치러 가요!",
        bad: "기구도 짝퉁도 아니에요 — <b>한 회사</b>가 여러 나라에 농장을 두고 기르고, 포장하고, 세계로 파는 거예요. 이런 회사를 <b>초국적 기업</b>이라 하죠. 그 비밀을 파헤치러 가요!",
        onDone: finish,
      });
    }, 750);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L7: 자동차의 도시 — 70년 뒤의 기사 ══════════ */
function motorSvg(after: boolean): string {
  if (!after) {
    return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hs5-paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5EDD8"/><stop offset=".6" stop-color="#EBDDBE"/><stop offset="1" stop-color="#DCC89E"/></linearGradient>
        <linearGradient id="hs5-fact" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8B4C4"/><stop offset="1" stop-color="#7A8698"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="228" height="156" rx="12" fill="#D8D2C2"/>
      <rect x="20" y="14" width="200" height="140" rx="4" fill="url(#hs5-paper)" stroke="#B0A078" stroke-width="1.6"/>
      <path d="M28 24h184" stroke="#8A7A52" stroke-width="2"/>
      <text x="120" y="42" text-anchor="middle" font-size="13" font-weight="900" fill="#4E4632">자동차의 도시, 세계를 달리다</text>
      <text x="120" y="54" text-anchor="middle" font-size="7" font-weight="700" fill="#8A7A52">1950년대 · 산업 소식</text>
      <g transform="translate(40 66)">
        <rect x="0" y="18" width="160" height="44" rx="3" fill="url(#hs5-fact)" stroke="#5A6474" stroke-width="1.6"/>
        <path d="M12 18V6h12v12M40 18V2h12v16M68 18V8h12v10" fill="#8A96A8" stroke="#5A6474" stroke-width="1.4"/>
        <path d="M16 2q3-6 8-4M44 -2q3-6 8-4M72 4q3-6 8-4" stroke="#C8D0DC" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <rect x="96" y="28" width="22" height="12" rx="3" fill="#E2574C" stroke="#8F2D1D" stroke-width="1.2"/>
        <circle cx="100" cy="42" r="3.4" fill="#2E3A50"/><circle cx="114" cy="42" r="3.4" fill="#2E3A50"/>
        <rect x="126" y="28" width="22" height="12" rx="3" fill="#3F8FC8" stroke="#1E4E78" stroke-width="1.2"/>
        <circle cx="130" cy="42" r="3.4" fill="#2E3A50"/><circle cx="144" cy="42" r="3.4" fill="#2E3A50"/>
        <path d="M8 34h20M8 42h14" stroke="#F2F5FA" stroke-width="2" stroke-linecap="round" opacity=".5"/>
      </g>
      <path d="M32 140h84M32 147h60M140 140h68M140 147h48" stroke="#B0A078" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs5-news2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C2436"/><stop offset="1" stop-color="#28324A"/></linearGradient>
      <linearGradient id="hs5-fact2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A96A8"/><stop offset="1" stop-color="#5E6A7C"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs5-news2)"/>
    <rect x="16" y="16" width="208" height="122" rx="8" fill="#2E3A54"/>
    <rect x="16" y="16" width="208" height="30" fill="#22304A"/>
    <text x="120" y="36" text-anchor="middle" font-size="12" font-weight="900" fill="#F2F5FA">도시, 파산을 신청하다</text>
    <g transform="translate(44 58)">
      <rect x="0" y="16" width="152" height="46" rx="3" fill="url(#hs5-fact2)" stroke="#3E4A5C" stroke-width="1.6"/>
      <path d="M12 16V6h12v10M40 16V2h12v14M68 16V8h12v8" fill="#6E7A8C" stroke="#3E4A5C" stroke-width="1.4"/>
      <rect x="10" y="28" width="26" height="18" rx="2" fill="#4A5668" stroke="#38424E" stroke-width="1.4"/>
      <path d="M10 28l26 18M36 28 10 46" stroke="#38424E" stroke-width="1.6"/>
      <rect x="48" y="28" width="26" height="18" rx="2" fill="#4A5668" stroke="#38424E" stroke-width="1.4"/>
      <path d="M52 46q6-10 10 0M96 46q8-12 14 0" stroke="#6E8E5E" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M104 30h34v16h-34z" fill="#3E4A5C" stroke="#2E3844" stroke-width="1.4"/>
      <text x="121" y="41" text-anchor="middle" font-size="7" font-weight="800" fill="#B8C4D2">임대 문의</text>
    </g>
    <text x="120" y="132" text-anchor="middle" font-size="7.5" font-weight="700" fill="#8FA0B8">한때 세계 자동차 산업의 심장이던 그 도시</text>
    <rect x="16" y="140" width="120" height="9" rx="3" fill="#C0392E" opacity=".9"/>
    <rect x="20" y="142.5" width="70" height="4" rx="2" fill="#F2D8D2"/>
  </svg>`;
}

export function renderMotorCity(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs5-motor" });
  const btn = el("button", { class: "hs5-flipbtn", attrs: { type: "button" }, text: "70년 뒤 기사 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "도서관에서 찾은 1950년대 신문이에요. 공장 굴뚝에 김이 오르고 새 차가 쏟아지던 <b>'자동차의 도시'</b> — <b>70년 뒤 기사</b>로 넘겨 볼까요?";

  let after = false;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = motorSvg(after);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  btn.addEventListener("click", () => {
    if (after) return;
    after = true;
    haptic(HAPTIC.tap);
    show();
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML = "같은 도시의 뉴스가 <b>'파산 신청'</b>이라니! 세계 자동차 산업의 심장이던 도시에 무슨 일이 있었을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "자동차 공장들이 임금이 싼 다른 나라로 옮겨 가서",
          "사람들이 자동차를 더 이상 타지 않게 되어서",
          "도시에 큰 지진이 일어나서",
        ],
        good: "맞아요! 공장이 해외로 떠나자 일자리와 사람이 함께 빠져나갔어요 — 이 도시가 <b>디트로이트</b>랍니다. 기업의 이사가 도시의 운명을 바꾸는 이야기, 만나러 가요!",
        bad: "자동차는 지금도 잘 팔리고, 지진도 아니었어요 — 열쇠는 <b>공장의 이사</b>! 임금이 싼 곳을 찾아 공장이 떠나자 도시가 흔들렸죠(디트로이트). 그 이야기를 만나러 가요!",
        onDone: finish,
      });
    }, 750);
  });
  return () => window.clearTimeout(timer);
}
