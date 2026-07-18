// hookSoc — 사회 Ⅰ 단원(세계화 시대, 지리의 힘) 훅 장면 6종. hook.ts의 디스패처가 불러 쓴다.
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수.
// 스틱맨 캐릭터만 손그림 라인(#3C4654) 유지. CSS 상태 클래스 접두사는 hs1-.
//   threecities L1 — 1월의 세 도시 라이브 캠: 같은 날 반팔↔패딩 → 왜 다른지 예측(위도)
//   stilthouse  L2 — 공중에 뜬 집: 마루 밑을 들여다보고 → 띄운 까닭 예측(열기·습기·해충)
//   skyroute    L3 — 세계에서 가장 붐비는 하늘길: 후보 노선 셋 → 1위 예측(서울~제주)
//   avocado     L4 — 마트 아보카도: 가격표를 뒤집어 원산지 확인 → 여행 거리 예측(약 12,000 km)
//   maasai      L5 — 초원 유목민의 스마트폰: 화면을 켜 보고 → 쓰임새 예측(생활 도구)
//   ilovenyc    L6 — 기념품 로고의 비밀: 머그를 뒤집어 1970년대 뉴욕 → 만든 까닭 예측(이미지 반전)

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import { WORLD_LAND_PATH } from "../../ui/worldMap.generated";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;

// ── L1: 1월의 세 도시 ───────────────────────────────────────
// 같은 날짜의 라이브 캠 세 장 — 넘길 때마다 옷차림·풍경이 확 달라진다.
interface CityCard {
  id: string;
  name: string;
  temp: string;
  scene: string;
}

function cityScenes(): CityCard[] {
  const sky = (id: string, a: string, b: string): string =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  return [
    {
      id: "sg",
      name: "싱가포르",
      temp: "30℃",
      scene: `<svg viewBox="0 0 240 150" fill="none" aria-hidden="true">
        <defs>${sky("hs1-sky-sg", "#8ED2F5", "#D9F0FA")}
          <linearGradient id="hs1-sea-sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5BB8E8"/><stop offset="1" stop-color="#2E8AC8"/></linearGradient></defs>
        <rect x="6" y="6" width="228" height="138" rx="12" fill="url(#hs1-sky-sg)"/>
        <circle cx="200" cy="34" r="13" fill="#FFC24D"/><circle cx="200" cy="34" r="19" fill="#FFC24D" opacity=".25"/>
        <rect x="6" y="106" width="228" height="38" rx="0" fill="url(#hs1-sea-sg)"/>
        <path d="M6 106h228" stroke="#DCF2FF" stroke-width="2" opacity=".7"/>
        <path d="M60 100c-2-26 4-44 8-54M68 46q-14 2-24 14M68 46q2-14 12-20M68 46q14 0 22 10M68 46q-4-12-14-16" stroke="#2E8A4C" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="70" cy="102" rx="26" ry="5" fill="#2A3A5E" opacity=".12"/>
        <g stroke="#3C4654" stroke-width="2.4" fill="none">
          <circle cx="150" cy="70" r="8" fill="#FFE8CE"/>
          <path d="M150 78v20M150 84l-10 6M150 84l10 6M150 98l-8 12M150 98l8 12"/>
          <path d="M143 84h14v9h-14z" fill="#F5915A" stroke="none"/>
        </g>
        <path d="M162 60q3-2 5 0M160 55q2-2 4 0" stroke="#5BB8E8" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
    },
    {
      id: "se",
      name: "서울",
      temp: "-2℃",
      scene: `<svg viewBox="0 0 240 150" fill="none" aria-hidden="true">
        <defs>${sky("hs1-sky-se", "#C8D8EC", "#EAF1FA")}</defs>
        <rect x="6" y="6" width="228" height="138" rx="12" fill="url(#hs1-sky-se)"/>
        <path d="M40 120 L58 64 76 120z" fill="#8FA5BE"/><path d="M52 82 58 64 64 82q-6 4-12 0z" fill="#E8EFF8"/>
        <path d="M58 64V40M52 46h12" stroke="#5A6B7E" stroke-width="3" stroke-linecap="round"/>
        <circle cx="58" cy="38" r="7" fill="#E86A5E"/>
        <rect x="6" y="118" width="228" height="26" fill="#EDF2F8"/>
        <g fill="#fff" opacity=".9"><circle cx="100" cy="40" r="2"/><circle cx="130" cy="26" r="1.6"/><circle cx="176" cy="48" r="2"/><circle cx="210" cy="70" r="1.6"/><circle cx="90" cy="78" r="1.6"/><circle cx="150" cy="60" r="1.4"/></g>
        <ellipse cx="150" cy="122" rx="24" ry="5" fill="#2A3A5E" opacity=".12"/>
        <g stroke="#3C4654" stroke-width="2.4" fill="none">
          <circle cx="150" cy="74" r="8" fill="#FFE8CE"/>
          <path d="M150 118l-8 12M150 118l8 12"/>
          <path d="M139 84h22v34h-22z" fill="#4E7CB8" stroke="none"/>
          <path d="M139 84q11-6 22 0M144 90v22M156 90v22" stroke="#33619E" stroke-width="1.6"/>
        </g>
      </svg>`,
    },
    {
      id: "mo",
      name: "모스크바",
      temp: "-12℃",
      scene: `<svg viewBox="0 0 240 150" fill="none" aria-hidden="true">
        <defs>${sky("hs1-sky-mo", "#AAB8D2", "#D8E1F0")}
          <linearGradient id="hs1-dome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5A05C"/><stop offset="1" stop-color="#C2490A"/></linearGradient></defs>
        <rect x="6" y="6" width="228" height="138" rx="12" fill="url(#hs1-sky-mo)"/>
        <path d="M52 118V72q0-10 10-10t10 10v46z" fill="#E8EFF8"/>
        <path d="M62 62q-14-18 0-30 14 12 0 30z" fill="url(#hs1-dome)"/>
        <path d="M62 32v-8M58 28h8" stroke="#8A5A26" stroke-width="2.4" stroke-linecap="round"/>
        <rect x="6" y="118" width="228" height="26" fill="#F2F6FB"/>
        <g fill="#fff"><circle cx="110" cy="34" r="2.4"/><circle cx="140" cy="52" r="2"/><circle cx="180" cy="30" r="2.4"/><circle cx="205" cy="60" r="2"/><circle cx="95" cy="66" r="2"/><circle cx="160" cy="78" r="1.8"/><circle cx="215" cy="94" r="1.8"/></g>
        <ellipse cx="150" cy="122" rx="24" ry="5" fill="#2A3A5E" opacity=".12"/>
        <g stroke="#3C4654" stroke-width="2.4" fill="none">
          <circle cx="150" cy="72" r="8" fill="#FFE8CE"/>
          <path d="M150 118l-8 12M150 118l8 12"/>
          <path d="M137 82h26v36h-26z" fill="#7A5CB8" stroke="none"/>
          <path d="M137 82q13-7 26 0" stroke="#5A3E96" stroke-width="1.6"/>
          <circle cx="150" cy="64" r="10" fill="none" stroke="#B08D5E" stroke-width="4" stroke-dasharray="2 4"/>
        </g>
        <path d="M144 70q6 3 12 0" stroke="#8FA5BE" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
    },
  ];
}

export function renderThreeCities(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const cards = cityScenes();
  const fig = el("div", { class: "hs1-cities", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 다음 도시 라이브 캠 보기" } });
  const cam = el("div", { class: "hs1-cam" });
  const tag = el("div", { class: "hs1-camtag" });
  const dots = el("div", { class: "hs1-camdots" });
  cards.forEach((_, i) => dots.appendChild(el("i", { class: i === 0 ? "on" : "" })));
  fig.append(cam, tag, dots);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "오늘은 <b>1월의 같은 날</b>. 세 도시의 라이브 캠을 연결했어요 — <b>탭해서</b> 다음 도시로!";

  let idx = 0;
  const seen = new Set<number>([0]);
  let timer = 0;
  const show = (i: number): void => {
    cam.innerHTML = cards[i].scene;
    tag.innerHTML = `<b>${cards[i].name}</b><span>${cards[i].temp}</span><i>LIVE</i>`;
    [...dots.children].forEach((d, k) => d.classList.toggle("on", k === i));
  };
  show(0);
  const next = (): void => {
    if (seen.size >= cards.length && idx === cards.length - 1) return;
    idx = (idx + 1) % cards.length;
    seen.add(idx);
    haptic(HAPTIC.tap);
    show(idx);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
    if (seen.size === 2) helper.innerHTML = "싱가포르는 반팔, 서울은 패딩… 한 장 더 있어요. <b>탭!</b>";
    if (seen.size >= cards.length) {
      face("surprised");
      helper.innerHTML = "같은 날, 같은 지구인데 30℃와 −12℃라니! <b>무엇이 세 도시의 날씨를 갈랐을까요?</b>";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "적도에서 떨어진 정도(위도)가 달라서",
            "남반구는 계절이 반대라서",
            "태양과의 거리가 도시마다 달라서",
          ],
          good: "정확해요! 세 도시의 결정적 차이는 <b>위도</b> — 적도에 가까운 싱가포르(북위 1°)는 일 년 내내 덥고, 멀어질수록(서울 37°, 모스크바 56°) 추워져요. 왜 그런지 햇빛으로 직접 확인해 봐요!",
          bad: "세 도시는 모두 <b>북반구</b>라 계절이 같고, 태양까지의 거리도 사실상 같아요. 다른 건 딱 하나 — <b>적도에서 떨어진 정도(위도)</b>예요. 적도에 가까울수록 더워요. 왜 그런지 햇빛으로 확인해 봐요!",
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

// ── L2: 공중에 뜬 집(고상 가옥) ─────────────────────────────
function stiltSvg(): string {
  return `<svg viewBox="0 0 240 170" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hs1-tropic" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE8D2"/><stop offset="1" stop-color="#E8F5EC"/></linearGradient>
      <linearGradient id="hs1-roof" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8C48A"/><stop offset=".6" stop-color="#C2843A"/><stop offset="1" stop-color="#9A6528"/></linearGradient>
      <linearGradient id="hs1-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5DCA8"/><stop offset="1" stop-color="#D8B26A"/></linearGradient>
      <linearGradient id="hs1-gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8AAE62"/><stop offset="1" stop-color="#6E9450"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="130" rx="12" fill="url(#hs1-tropic)"/>
    <path d="M196 24c3.4-4 9-4 12.4 0M190 34c5-6 14-6 19 0" stroke="#2E8A4C" stroke-width="3"/>
    <rect x="6" y="118" width="228" height="20" fill="url(#hs1-gnd)"/>
    <ellipse cx="120" cy="120" rx="66" ry="6" fill="#2A3A5E" opacity=".13"/>
    <path d="M62 66 120 34l58 32z" fill="url(#hs1-roof)" stroke="#7A4E1E" stroke-width="1.6"/>
    <rect x="76" y="66" width="88" height="34" rx="3" fill="url(#hs1-wall)" stroke="#9A6528" stroke-width="1.5"/>
    <rect x="110" y="76" width="20" height="24" rx="2" fill="#7A4E1E"/>
    <path d="M84 100v20M100 100v20M140 100v20M156 100v20" stroke="#8A5A26" stroke-width="4.4"/>
    <path d="M148 100 170 118" stroke="#8A5A26" stroke-width="3"/>
    <path d="M150 104l14 10" stroke="#B08D5E" stroke-width="1.6" opacity=".7"/>
    <g class="hs1-under" opacity="0">
      <path d="M88 112q6-5 12 0t12 0" stroke="#4E9AE8" stroke-width="2" opacity=".7"/>
      <path d="M118 108q4 2 2 6t2 6" class="hs1-snake" stroke="#2E8A4C" stroke-width="3.4"/>
      <circle cx="122" cy="106" r="2.6" fill="#2E8A4C"/><circle cx="121" cy="105" r=".7" fill="#fff"/>
      <circle cx="98" cy="114" r="1.8" fill="#5A4326"/><circle cx="104" cy="110" r="1.4" fill="#5A4326"/>
      <path d="M92 104q2-6 0-10M136 106q2-6 0-11" stroke="#C8D8E8" stroke-width="2.4" opacity=".8"/>
    </g>
    <g stroke="#3C4654" stroke-width="2.4" fill="none">
      <circle cx="40" cy="86" r="7" fill="#FFE8CE"/>
      <path d="M40 93v14M40 98l-7 4M40 98l8-3M40 107l-6 10M40 107l6 10"/>
    </g>
  </svg>`;
}

export function renderStiltHouse(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs1-stilt", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 마루 아래 들여다보기" } });
  fig.innerHTML = stiltSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "일 년 내내 무더운 열대의 마을 — 그런데 집이 <b>공중에 떠</b> 있어요! 사다리 밑, <b>마루 아래를 탭</b>해 볼까요?";

  let peeked = false;
  let timer = 0;
  const peek = (): void => {
    if (peeked) return;
    peeked = true;
    haptic(HAPTIC.select);
    face("surprised");
    fig.classList.add("peek");
    (fig.querySelector(".hs1-under") as SVGGElement).setAttribute("opacity", "1");
    helper.innerHTML = "마루 밑으로 <b>후끈한 김</b>이 오르고, 뱀과 벌레가 스윽… 그렇다면 — <b>집을 왜 띄웠을까요?</b>";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "지면의 열기·습기와 해충을 피하려고",
          "높은 곳이 경치가 잘 보여서",
          "땅이 물러서 가라앉지 않게 하려고",
        ],
        good: "바로 그거예요! 덥고 비가 많은 곳에선 땅에서 <b>열기와 습기</b>가 올라오고 <b>해충</b>도 많아요. 바닥을 띄우면 그 모든 게 마루 아래로 지나가죠. 환경이 집의 모양을 바꾼 거예요 — 이런 지혜를 세계지도에서 직접 배치해 봐요!",
        bad: "경치도, 무른 땅도 아니에요 — 방금 본 마루 밑을 떠올려 봐요. 덥고 습한 곳에선 <b>지면의 열기·습기·해충</b>이 문제라 바닥을 띄우는 거예요. 환경이 집의 모양을 바꾼 거죠 — 세계지도에서 직접 배치해 봐요!",
        onDone: finish,
      });
    }, 800);
  };
  fig.addEventListener("click", peek);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      peek();
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L3: 세계에서 가장 붐비는 하늘길 ─────────────────────────
export function renderSkyRoute(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  // 실제 육지 데이터 미니 지도 + 후보 노선 3개(탭하면 호가 그려진다)
  const ROUTES = [
    { id: "ny", name: "뉴욕~런던", a: [285, 138], b: [498, 122] },
    { id: "jp", name: "도쿄~삿포로", a: [888, 152], b: [896, 128] },
    { id: "kr", name: "서울~제주", a: [853, 146], b: [849, 158] },
  ] as const;
  const fig = el("div", { class: "hs1-skymap" });
  fig.innerHTML = `<svg viewBox="180 60 760 260" fill="none" aria-hidden="true">
    <rect x="180" y="60" width="760" height="260" rx="14" fill="#0E223C"/>
    <path d="${WORLD_LAND_PATH}" fill="#22405E" fill-rule="evenodd" stroke="#3A5C80" stroke-width=".8"/>
    ${ROUTES.map(
      (r) => `<g class="hs1-route" data-r="${r.id}">
        <path class="hs1-arc" d="M${r.a[0]} ${r.a[1]} Q${(r.a[0] + r.b[0]) / 2} ${Math.min(r.a[1], r.b[1]) - 26} ${r.b[0]} ${r.b[1]}" stroke="#FFC24D" stroke-width="2.4" stroke-dasharray="5 5"/>
        <circle cx="${r.a[0]}" cy="${r.a[1]}" r="4" fill="#FFC24D"/>
        <circle cx="${r.b[0]}" cy="${r.b[1]}" r="4" fill="#FFC24D"/>
      </g>`,
    ).join("")}
  </svg>`;
  const btns = el("div", { class: "hs1-routebtns" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btns, choicesBox);
  helper.innerHTML = "전 세계 하늘길은 5만 갈래가 넘어요. 후보 셋을 <b>탭해서 미리 본 뒤</b>, 이용객 <b>세계 1위</b>를 맞혀 봐요!";

  const seen = new Set<string>();
  let timer = 0;
  ROUTES.forEach((r) => {
    const b = el("button", { class: "hs1-routebtn", attrs: { type: "button" }, text: r.name });
    b.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      seen.add(r.id);
      b.classList.add("seen");
      fig.querySelectorAll(".hs1-route").forEach((g) => g.classList.toggle("on", (g as SVGGElement).dataset.r === r.id));
      if (seen.size >= ROUTES.length && !choicesBox.classList.contains("show")) {
        face("curious");
        helper.innerHTML = "대서양 횡단, 일본 국내선, 우리나라 국내선 — <b>이용객 세계 1위 하늘길</b>은 어디일까요?";
        timer = window.setTimeout(() => {
          ask(choicesBox, helper, {
            choices: s.choices ?? ["서울~제주", "뉴욕~런던", "도쿄~삿포로"],
            good: "정답! 뜻밖에도 <b>서울~제주</b>가 이용객 수 세계 1위 하늘길이에요. 수도권 사람들이 비행기를 버스처럼 타고 제주를 오가죠. 사람과 물자가 오가는 이 흐름이 오늘의 주인공 — <b>연결</b>이에요!",
            bad: "대서양 횡단이 유명하긴 하지만, 1위는 뜻밖에도 <b>서울~제주</b>예요! 수도권 사람들이 비행기를 버스처럼 타고 제주를 오가거든요. 사람과 물자가 오가는 이 흐름이 오늘의 주인공 — <b>연결</b>이에요!",
            onDone: finish,
          });
        }, 700);
      }
    });
    btns.appendChild(b);
  });
  return () => window.clearTimeout(timer);
}

// ── L4: 마트 아보카도의 여행 ────────────────────────────────
function avocadoSvg(): string {
  return `<svg viewBox="0 0 240 170" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="hs1-shelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5EDE0"/><stop offset="1" stop-color="#E2D4BE"/></linearGradient>
      <radialGradient id="hs1-avo" cx=".35" cy=".3" r="1"><stop offset="0" stop-color="#7AB84E"/><stop offset=".7" stop-color="#3E7A2E"/><stop offset="1" stop-color="#2A5A20"/></radialGradient>
      <linearGradient id="hs1-tagback" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFDF6"/><stop offset="1" stop-color="#EFE4CC"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="130" rx="12" fill="url(#hs1-shelf)"/>
    <rect x="20" y="96" width="200" height="10" rx="4" fill="#C2A87A"/>
    <ellipse cx="120" cy="104" rx="86" ry="6" fill="#2A3A5E" opacity=".1"/>
    <g class="hs1-avopile">
      <ellipse cx="86" cy="82" rx="17" ry="21" fill="url(#hs1-avo)" stroke="#1E4A16" stroke-width="1.4"/>
      <ellipse cx="120" cy="84" rx="17" ry="21" fill="url(#hs1-avo)" stroke="#1E4A16" stroke-width="1.4"/>
      <ellipse cx="154" cy="82" rx="17" ry="21" fill="url(#hs1-avo)" stroke="#1E4A16" stroke-width="1.4"/>
      <ellipse cx="103" cy="62" rx="16" ry="20" fill="url(#hs1-avo)" stroke="#1E4A16" stroke-width="1.4"/>
      <ellipse cx="137" cy="62" rx="16" ry="20" fill="url(#hs1-avo)" stroke="#1E4A16" stroke-width="1.4"/>
      <ellipse cx="98" cy="56" rx="4.5" ry="6" fill="#fff" opacity=".28" transform="rotate(-22 98 56)"/>
    </g>
    <g class="hs1-tag">
      <g class="hs1-tagface hs1-tagfront">
        <rect x="76" y="112" width="88" height="24" rx="7" fill="url(#hs1-tagback)" stroke="#B89A62" stroke-width="1.4"/>
        <text x="120" y="128" text-anchor="middle" font-size="12" font-weight="800" fill="#5A4326">아보카도 1개</text>
      </g>
      <g class="hs1-tagface hs1-tagback2">
        <rect x="76" y="112" width="88" height="24" rx="7" fill="#2E4E38" stroke="#1E3A28" stroke-width="1.4"/>
        <text x="120" y="128" text-anchor="middle" font-size="12" font-weight="800" fill="#D6F2DC">원산지: 멕시코</text>
      </g>
    </g>
  </svg>`;
}

export function renderAvocado(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs1-avoc", attrs: { role: "button", tabindex: "0", "aria-label": "가격표를 탭해서 뒤집기" } });
  fig.innerHTML = avocadoSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "마트에서 아보카도를 집었어요. 이 초록 열매, 어디서 왔을까요? <b>가격표를 탭</b>해서 뒤집어 봐요!";

  let flipped = false;
  let timer = 0;
  const flip = (): void => {
    if (flipped) return;
    flipped = true;
    haptic(HAPTIC.select);
    face("surprised");
    fig.classList.add("flip");
    helper.innerHTML = "원산지: <b>멕시코</b>! 지구 반대편 가까이네요. 그렇다면 이 아보카도는 <b>몇 km를 여행</b>해 왔을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "약 12,000 km — 지구 둘레의 3분의 1 가까이",
          "약 120 km — 이웃 도시쯤",
          "약 1,200 km — 서울~부산 세 번쯤",
        ],
        good: "맞아요! 멕시코에서 태평양을 건너 <b>약 12,000 km</b>. 마트 진열대는 사실 세계와 연결된 창구예요 — 오늘은 이 연결의 <b>크기(규모)</b>를 배워요!",
        bad: "가격표를 다시 봐요 — <b>멕시코</b>예요! 태평양을 건너 <b>약 12,000 km</b>를 왔어요. 마트 진열대는 사실 세계와 연결된 창구예요 — 오늘은 이 연결의 <b>크기(규모)</b>를 배워요!",
        onDone: finish,
      });
    }, 800);
  };
  fig.addEventListener("click", flip);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      flip();
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L5: 초원 유목민의 스마트폰 ──────────────────────────────
function maasaiSvg(): string {
  return `<svg viewBox="0 0 240 170" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="hs1-savan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBD9A8"/><stop offset="1" stop-color="#F5EBD2"/></linearGradient>
      <linearGradient id="hs1-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9B86A"/><stop offset="1" stop-color="#C2A052"/></linearGradient>
      <linearGradient id="hs1-shuka" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E86A5E"/><stop offset="1" stop-color="#C23A32"/></linearGradient>
      <linearGradient id="hs1-phone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A4658"/><stop offset="1" stop-color="#1E2836"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="130" rx="12" fill="url(#hs1-savan)"/>
    <circle cx="204" cy="32" r="12" fill="#F5915A"/><circle cx="204" cy="32" r="17" fill="#F5915A" opacity=".25"/>
    <path d="M40 66h44M62 66V44M62 44q-18-8-26-2M62 44q18-8 26-2M62 44q-10-12-2-16M62 44q10-12 2-16" stroke="#7A5A32" stroke-width="3"/>
    <rect x="6" y="112" width="228" height="26" fill="url(#hs1-grass)"/>
    <path d="M20 112v-8M28 112v-6M188 112v-8M196 112v-5M212 112v-7" stroke="#A88438" stroke-width="2"/>
    <ellipse cx="130" cy="116" rx="30" ry="5" fill="#2A3A5E" opacity=".13"/>
    <g stroke="#3C4654" stroke-width="2.4" fill="none">
      <circle cx="130" cy="52" r="8" fill="#8A5A3E" stroke="#3C4654"/>
      <path d="M130 60v34M130 94l-9 20M130 94l9 20"/>
      <path d="M118 64h24l-4 30h-16z" fill="url(#hs1-shuka)" stroke="#8F1D1D" stroke-width="1.6"/>
      <path d="M130 66l-16 10M114 76l-2 22" stroke="#3C4654"/>
      <path d="M146 40v36" stroke="#8A6A3E" stroke-width="2.6"/>
    </g>
    <g class="hs1-mphone">
      <rect x="150" y="62" width="26" height="44" rx="5" fill="url(#hs1-phone)" stroke="#0E1622" stroke-width="1.4"/>
      <g class="hs1-mscreen" opacity="0">
        <rect x="153" y="65" width="20" height="34" rx="3" fill="#DFF2FF"/>
        <rect x="156" y="88" width="3.4" height="8" fill="#3FA7C8"/>
        <rect x="161" y="84" width="3.4" height="12" fill="#1E9E50"/>
        <rect x="166" y="80" width="3.4" height="16" fill="#E8590C"/>
        <path d="M156 70q4 4 8 0t8 2" stroke="#4E7CB8" stroke-width="1.6" fill="none"/>
        <circle cx="158" cy="74" r="1.4" fill="#E8B93C"/>
      </g>
      <circle cx="163" cy="102" r="1.6" fill="#5A6B7E"/>
    </g>
    <g class="hs1-mwave" opacity="0" stroke="#4E9AE8" stroke-width="2" fill="none">
      <path d="M180 58q4-4 8 0M184 52q6-6 12 0"/>
    </g>
  </svg>`;
}

export function renderMaasai(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs1-maasai", attrs: { role: "button", tabindex: "0", "aria-label": "스마트폰 화면을 탭해서 켜기" } });
  fig.innerHTML = maasaiSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "동아프리카 초원, 전통 복장의 <b>마사이족 유목민</b>이에요. 손에 든 건… 스마트폰? <b>화면을 탭</b>해서 켜 볼까요?";

  let onScreen = false;
  let timer = 0;
  const turnOn = (): void => {
    if (onScreen) return;
    onScreen = true;
    haptic(HAPTIC.select);
    face("surprised");
    fig.classList.add("on");
    (fig.querySelector(".hs1-mscreen") as SVGGElement).setAttribute("opacity", "1");
    (fig.querySelector(".hs1-mwave") as SVGGElement).setAttribute("opacity", "1");
    helper.innerHTML = "화면이 켜졌어요! 전통 그대로 사는 초원의 유목민은 <b>스마트폰으로 주로 무엇을 할까요?</b>";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "가축 시세·날씨를 검색하고 돈도 보낸다",
          "전통에 어긋나서 거의 쓰지 않는다",
          "전파가 안 터져서 사진기로만 쓴다",
        ],
        good: "맞아요! 실제로 <b>가축 시세 확인, 휴대폰 송금, 날씨 검색</b>까지 — 초원의 생활 필수품이에요. 전통 복장 그대로, 최신 기술과 함께 살죠. 세계화는 이렇게 초원 깊숙이까지 닿아 있어요!",
        bad: "초원에도 이동 통신망이 닿아서 <b>가축 시세 확인, 휴대폰 송금, 날씨 검색</b>까지 해요 — 생활 필수품이죠. 전통을 지키면서도 최신 기술과 함께 사는 거예요. 세계화는 초원 깊숙이까지 닿아 있답니다!",
        onDone: finish,
      });
    }, 800);
  };
  fig.addEventListener("click", turnOn);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      turnOn();
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L6: 기념품 로고의 비밀(I♥NY) ────────────────────────────
function nycSvg(): string {
  return `<svg viewBox="0 0 240 170" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="hs1-shop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F4F8"/><stop offset="1" stop-color="#DDE2EA"/></linearGradient>
      <linearGradient id="hs1-mug" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F2F4F8"/><stop offset="1" stop-color="#D5DBE6"/></linearGradient>
      <linearGradient id="hs1-oldsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A93A6"/><stop offset="1" stop-color="#B8BECC"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="130" rx="12" fill="url(#hs1-shop)"/>
    <g class="hs1-mugface hs1-mugfront">
      <ellipse cx="120" cy="122" rx="42" ry="6" fill="#2A3A5E" opacity=".14"/>
      <path d="M88 52h60v58q0 10-10 10h-40q-10 0-10-10z" fill="url(#hs1-mug)" stroke="#AAB4C4" stroke-width="1.8"/>
      <path d="M148 62h10q10 0 10 11t-10 11h-10" fill="none" stroke="#AAB4C4" stroke-width="4"/>
      <text x="103" y="88" font-size="17" font-weight="900" fill="#333D4B">I</text>
      <path d="M112 76c3.4-4.4 10-3.4 11.4 1 1.4-4.4 8-5.4 11.4-1 2.8 3.8.6 8.8-11.4 16.4-12-7.6-14.2-12.6-11.4-16.4z" fill="#E23B4B"/>
      <text x="103" y="106" font-size="17" font-weight="900" fill="#333D4B">NY</text>
      <ellipse cx="100" cy="60" rx="7" ry="3" fill="#fff" opacity=".7" transform="rotate(-24 100 60)"/>
    </g>
    <g class="hs1-mugface hs1-mugback">
      <rect x="30" y="24" width="180" height="100" rx="8" fill="url(#hs1-oldsky)" stroke="#5A6270" stroke-width="1.6"/>
      <path d="M46 124V72h18v52M76 124V56h22v68M110 124V80h16v44M138 124V64h20v60M170 124V86h18v38" fill="#6E7684" stroke="#4E5560" stroke-width="1.4"/>
      <g stroke="#3C4654" stroke-width="2">
        <path d="M52 92h6M82 70h8M84 84h8M144 78h8M144 94h8" stroke="#8A93A6"/>
      </g>
      <path d="M58 116q10-6 22-2M120 112q12-8 26-3" stroke="#C24A3E" stroke-width="2.6" opacity=".8"/>
      <path d="M64 40l6 10h-12zM150 34l5 9h-10z" fill="#4E5560"/>
      <text x="120" y="145" text-anchor="middle" font-size="10.5" font-weight="800" fill="#5A6270">1970년대의 뉴욕 — 불황과 낙서</text>
    </g>
  </svg>`;
}

export function renderIloveNyc(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs1-nyc", attrs: { role: "button", tabindex: "0", "aria-label": "머그컵을 탭해서 뒷이야기 보기" } });
  fig.innerHTML = nycSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "전 세계에서 팔리는 뉴욕 기념품 — <b>I♥NY</b> 로고예요. 이 명랑한 로고의 출생의 비밀, <b>머그를 탭</b>해서 확인!";

  let flipped = false;
  let timer = 0;
  const flip = (): void => {
    if (flipped) return;
    flipped = true;
    haptic(HAPTIC.select);
    face("surprised");
    fig.classList.add("flip");
    helper.innerHTML = "1970년대의 뉴욕 — 경제는 불황, 거리엔 낙서와 범죄… 이런 도시가 <b>왜 이 로고를 만들었을까요?</b>";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "나빠진 도시 이미지를 바꾸려고",
          "기념품을 팔아 돈을 벌려고",
          "유명 화가의 작품을 자랑하려고",
        ],
        good: "정답! 위기의 뉴욕이 던진 승부수였어요. 로고 하나가 도시를 '사랑스러운 곳'으로 다시 보이게 했고, 관광객이 돌아왔죠. <b>지역의 이미지가 곧 경쟁력</b> — 오늘 배울 지역화 전략의 원조랍니다!",
        bad: "기념품 판매도, 화가 자랑도 아니었어요 — 방금 본 1970년대 뉴욕을 떠올려 봐요. <b>나빠진 도시 이미지를 바꾸려던 승부수</b>였고, 실제로 관광객이 돌아왔죠. 지역의 이미지가 곧 경쟁력 — 오늘 배울 지역화 전략의 원조예요!",
        onDone: finish,
      });
    }, 800);
  };
  fig.addEventListener("click", flip);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      flip();
    }
  });
  return () => window.clearTimeout(timer);
}
