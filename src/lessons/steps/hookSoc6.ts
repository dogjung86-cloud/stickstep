// hookSoc6 — 사회 Ⅵ 단원(오세아니아와 극지방) 훅 장면 8종. hook.ts가 renderSoc6 서브
// 디스패처(hookHis2 문법 — 모르는 장면이면 null)로 위임한다. 파운드리 SVG 문법(근-동조
// 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수, 스틱맨만 손그림 라인. CSS 접두사 hs6-.
//   newyearfirst L1 — 12월 31일 카운트다운 생중계: 첫 불꽃이 태평양 한가운데?! (날짜 변경선·키리바시)
//   ulurumystery L2 — 여행 사진 확대: 평평한 사막 한가운데 거대한 바위 하나(울루루 — 비상 도입 계승)
//   santasurf    L3 — 호주 친구가 보낸 크리스마스 카드: 산타가 서핑을?! (남반구 계절 역전)
//   martorigin   L4 — 마트 원산지 라벨 셋: 소고기·키위·치즈가 다 남반구에서 (자원·농목업 수출)
//   trashisland  L5 — 지도 앱의 수상한 '섬': 확대하니 떠다니는 쓰레기 더미 (태평양 거대 쓰레기 지대)
//   ploggingrun  L6 — 등굣길 플로깅: 주운 페트병의 원래 목적지는? (개인 실천 → 바다)
//   stationwhy   L7 — 다큐 속 펭귄 마을 옆 파란 기지: 왜 이 추운 곳에? (남극 연구 기지)
//   arcticflags  L8 — 북극 원판 지도로 모여드는 화살표들: 북극해에 눈독 들이는 까닭 (자원·영유권)
// 민감 가드: 재난 공포 연출 금지(쓰레기 지대는 '발견' 구도), 특정 국가 지목·희화화 금지
// (L8 화살표는 무기명), 예측 choices[0]=정답·good≠bad(오개념 교정) 공용 규칙.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";
import { POLAR_NORTH_PATH } from "../../ui/worldMap.generated";

type Face = (k: AvatarKind) => void;
type HookOpt = { choices?: string[] };

/* ── 공용 미니 소품 ── */
/** 손그림 오세아니아 실루엣(만화 소품 — 데이터 지도 아님): 크고 평평한 호주 + 두 조각 뉴질랜드 + 점점 섬들. */
const AU_SIL = "M8 34q2-14 16-18l22-4q14-2 22 4l10 10-2 12-8 10-12 4-14-2-14 2-12-4q-8-6-8-14z";
const NZ_SIL = "M96 58q6-2 8 4l-4 10q-4 6-8 2l2-8zM104 44q6-4 10 2l-4 8q-6 4-8-2z";

/* ══════════ L1: 새해 1등 나라 — 카운트다운 생중계 ══════════ */
function newyearSvg(fired: boolean): string {
  // 불꽃 점은 전부 날짜 변경선(x=182)의 **서쪽** — "선 바로 서쪽이 새해 1등" 서사와 일치(눈검수 교정)
  const dots = [
    [176, 66], [166, 84], [173, 92], [160, 74],
  ]
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#F2ECDE" opacity=".9"><title></title></circle>${
      fired ? `<g class="hs6-burst" style="animation-delay:${i * 0.18}s"><circle cx="${x}" cy="${y}" r="6" fill="none" stroke="#F2C24E" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="2.4" fill="#FFD98E"/></g>` : ""
    }`)
    .join("");
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs6-tv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C2436"/><stop offset="1" stop-color="#28324A"/></linearGradient>
      <radialGradient id="hs6-night" cx=".5" cy=".4" r=".9"><stop offset="0" stop-color="#20365E"/><stop offset="1" stop-color="#141F3C"/></radialGradient>
    </defs>
    <rect x="6" y="8" width="228" height="140" rx="12" fill="url(#hs6-tv)"/>
    <rect x="14" y="16" width="212" height="112" rx="8" fill="url(#hs6-night)" stroke="#101828" stroke-width="1.6"/>
    <g opacity=".85">
      <path d="M28 58q14-10 30-6l12 8 16-4 12 6-4 12-16 8-22-2-18-8q-12-6-10-14z" fill="#33507E"/>
      <path d="M150 96q10-8 24-6l16 6-2 10-14 8-20-4q-8-6-4-14z" fill="#33507E"/>
      <path d="M60 100l10 4 8-2 6 6-8 6-14-4z" fill="#33507E"/>
    </g>
    <line x1="182" y1="16" x2="182" y2="128" stroke="#E86E6E" stroke-width="1.4" stroke-dasharray="5 4" opacity=".8"/>
    ${dots}
    ${fired ? `<g class="hs6-burst big"><circle cx="176" cy="78" r="11" fill="none" stroke="#FFD98E" stroke-width="2"/><path d="M176 66v-6M176 90v6M164 78h-6M188 78h6M167 69l-4-4M185 69l4-4M167 87l-4 4M185 87l4 4" stroke="#F2C24E" stroke-width="1.8" stroke-linecap="round"/></g>` : ""}
    <rect x="14" y="16" width="212" height="18" rx="8" fill="rgba(10,16,30,.55)"/>
    <circle cx="26" cy="25" r="4" fill="#E2574C"/>
    <rect x="34" y="21.5" width="52" height="7" rx="3.5" fill="#C8D4E8" opacity=".8"/>
    <rect x="150" y="136" width="80" height="0" fill="none"/>
  </svg>`;
}

export function renderNewYearFirst(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs6-frame" });
  const btn = el("button", { class: "hs6-btn", attrs: { type: "button" }, text: "카운트다운 3, 2, 1!" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "12월 31일 밤, 새해 카운트다운 <b>세계 생중계</b>를 보고 있어요. 지구에서 <b>가장 먼저 새해</b>를 맞는 곳은 어디일까요? 카운트다운을 눌러 봐요!";
  fig.innerHTML = newyearSvg(false);

  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    fig.innerHTML = newyearSvg(true);
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML =
      "첫 불꽃이 큰 대륙이 아니라 <b>태평양 한가운데의 작은 섬들</b>에서 터졌어요! 빨간 점선(<b>날짜 변경선</b>) 바로 옆 — 왜 여기가 1등일까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "날짜 변경선 바로 서쪽이라 하루가 가장 먼저 시작돼서",
          "인구가 적어서 시계를 빨리 돌려 놓아서",
          "적도에 있어서 해가 가장 일찍 떠서",
        ],
        good: "정확해요! 경도 180° 부근의 <b>날짜 변경선</b>을 기준으로 날짜가 갈리는데, 그 바로 서쪽의 섬나라 <b>키리바시</b>가 새해 1등이에요. 이 섬들의 대륙 — 오세아니아를 조립하러 가요!",
        bad: "시계나 해돋이 시각의 문제가 아니에요 — 지구의 날짜는 <b>날짜 변경선(경도 180° 부근)</b>에서 시작돼요. 그 바로 서쪽의 섬나라 키리바시가 1등! 이 섬들의 대륙을 만나러 가요.",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L2: 울루루 — 여행 사진 확대 ══════════ */
function uluruSvg(zoom: number): string {
  const rockScale = [0.32, 0.62, 1][zoom];
  const rw = 92 * rockScale;
  const rh = 34 * rockScale;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs6-sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8EC8F0"/><stop offset="1" stop-color="#E8D8B8"/></linearGradient>
      <linearGradient id="hs6-rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E88E5E"/><stop offset=".55" stop-color="#C0471C"/><stop offset="1" stop-color="#8E3210"/></linearGradient>
      <linearGradient id="hs6-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8C88E"/><stop offset="1" stop-color="#C8A45E"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="140" rx="12" fill="url(#hs6-sky2)"/>
    <rect x="6" y="112" width="228" height="36" rx="0" fill="url(#hs6-sand)"/>
    <path d="M6 112h228" stroke="#A8823E" stroke-width="1.2" opacity=".6"/>
    <ellipse cx="120" cy="118" rx="${(rw * 0.62).toFixed(1)}" ry="3.4" fill="#2A3A5E" opacity=".11"/>
    <path d="M${(120 - rw / 2).toFixed(1)} 114q${(rw * 0.16).toFixed(1)}-${rh.toFixed(1)} ${(rw / 2).toFixed(1)}-${rh.toFixed(1)}t${(rw / 2).toFixed(1)} ${rh.toFixed(1)}z" fill="url(#hs6-rock)" stroke="#6E2408" stroke-width="1.6"/>
    ${zoom >= 1 ? `<path d="M${(120 - rw * 0.26).toFixed(1)} 112q${(rw * 0.05).toFixed(1)}-${(rh * 0.62).toFixed(1)} ${(rw * 0.12).toFixed(1)}-${(rh * 0.8).toFixed(1)}M${(120 + rw * 0.1).toFixed(1)} 112q${(rw * 0.04).toFixed(1)}-${(rh * 0.7).toFixed(1)} ${(rw * 0.1).toFixed(1)}-${(rh * 0.86).toFixed(1)}" stroke="#8E3210" stroke-width="1.2" opacity=".6" fill="none"/>` : ""}
    <path d="M28 120q6-3 12 0M196 124q6-3 12 0M52 130q5-2.6 10 0" stroke="#A8823E" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
    <circle cx="206" cy="30" r="11" fill="#F8D878"/>
    <circle cx="202" cy="26" r="4" fill="#FDF2CE" opacity=".8"/>
    ${zoom === 2
      ? `<g stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none">
          <circle cx="36" cy="116" r="5" fill="#F6EFE4"/>
          <path d="M36 121v13M36 126l-6 5M36 126l6 4M36 134l-5 8M36 134l5 8"/>
        </g>
        <path d="M30 144q6 2 12 0" stroke="#2A3A5E" stroke-width="2" opacity=".12" stroke-linecap="round"/>`
      : ""}
  </svg>`;
}

export function renderUluruMystery(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs6-frame" });
  const btn = el("button", { class: "hs6-btn", attrs: { type: "button" }, text: "가까이 가기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "사촌이 오스트레일리아 여행에서 찍은 사진 — 지평선 멀리 <b>작은 점</b> 하나가 있어요. 뭘까요? <b>가까이 가기</b>를 눌러 봐요!";

  let zoom = 0;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = uluruSvg(zoom);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  btn.addEventListener("click", () => {
    if (zoom >= 2) return;
    zoom += 1;
    haptic(HAPTIC.tap);
    show();
    if (zoom === 1) {
      helper.innerHTML = "점점 커져요… 산맥도 아니고 건물도 아니고, <b>바위 하나</b>가 이렇게 크다고요? 한 번 더!";
    } else {
      btn.classList.add("done");
      btn.disabled = true;
      face("surprised");
      helper.innerHTML =
        "사람이 개미만 해지는 <b>거대한 한 덩어리 바위, 울루루</b>! 그런데 주위를 둘러보면 산도 언덕도 없이 <b>끝없이 평평</b>해요. 울루루가 서 있는 오스트레일리아 내륙은 어떤 땅일까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "비가 적어 메마른, 낮고 평평한 사막의 땅",
            "나무가 빽빽한 열대 밀림",
            "만년설이 덮인 높은 산맥 지대",
          ],
          good: "맞아요! 오스트레일리아는 국토 대부분이 <b>낮고 평평한 사막과 평원</b> — 그 한가운데라 울루루가 더 우뚝해 보여요. 대륙의 지형을 통째로 훑으러 가요!",
          bad: "밀림도 설산도 아니에요 — 울루루 주변 내륙은 비가 적은 <b>사막과 평원</b>이에요. 낮고 평평한 대륙 위에 홀로 솟아서 더 신비롭죠. 지형 지도로 확인하러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L3: 산타 서핑 카드 ══════════ */
function santaSvg(open: boolean): string {
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs6-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBFDFF"/><stop offset="1" stop-color="#E8EEF6"/></linearGradient>
      <linearGradient id="hs6-seaS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ED8F0"/><stop offset="1" stop-color="#3F9ED8"/></linearGradient>
      <linearGradient id="hs6-santa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F26E5E"/><stop offset="1" stop-color="#C43C2C"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="150" rx="86" ry="5" fill="#2A3A5E" opacity=".1"/>
    <rect x="34" y="18" width="172" height="128" rx="10" fill="url(#hs6-card)" stroke="#B8C4D4" stroke-width="1.6"/>
    ${open
      ? `<rect x="42" y="26" width="156" height="82" rx="7" fill="url(#hs6-seaS)" stroke="#2A6E9E" stroke-width="1.4"/>
        <circle cx="66" cy="44" r="9" fill="#F8D878"/><circle cx="63" cy="41" r="3.4" fill="#FDF2CE" opacity=".85"/>
        <path d="M46 96q12-7 24 0t24 0q12-7 24 0t24 0q12-7 24 0" stroke="#EAF6FC" stroke-width="2.4" fill="none" opacity=".85"/>
        <g>
          <path d="M118 96q16 5 34 0l-5 7h-25z" fill="#F2C24E" stroke="#B8842E" stroke-width="1.4"/>
          <g stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none">
            <circle cx="134" cy="62" r="5" fill="#F6EFE4"/>
            <path d="M134 67v12M134 71l-7 3M134 71l7-1M134 79l-6 8M134 79l6 8"/>
          </g>
          <path d="M128 58q1-6 7-5l4 2-2 4q-5 2-9-1z" fill="url(#hs6-santa)" stroke="#8E2A1C" stroke-width="1.2"/>
          <circle cx="139.5" cy="56.5" r="2.2" fill="#FFFFFF"/>
        </g>
        <path d="M52 116h60M52 124h44M52 132h52" stroke="#8A93A6" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>`
      : `<rect x="42" y="26" width="156" height="112" rx="7" fill="#F4F8FC" stroke="#C8D4E4" stroke-width="1.2"/>
        <path d="M74 96q10-16 22-2 12-14 22 2l-22 22z" fill="#E2574C" stroke="#9E3226" stroke-width="1.6" transform="translate(24 -22)"/>
        <path d="M84 120q14-4 28-8M84 128q18-4 36-10" stroke="#A8B4C6" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
        <circle cx="96" cy="60" r="12" fill="#F6EFE4" stroke="#C8D4E4" stroke-width="1.4"/>
        <circle cx="96" cy="78" r="16" fill="#F6EFE4" stroke="#C8D4E4" stroke-width="1.4"/>
        <path d="M90 56l4 3 8-6" stroke="#8A93A6" stroke-width="1.6" fill="none"/>`}
  </svg>`;
}

export function renderSantaSurf(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs6-frame" });
  const btn = el("button", { class: "hs6-btn", attrs: { type: "button" }, text: "카드 열어 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "12월, <b>오스트레일리아 시드니로 이사 간 친구</b>가 크리스마스 카드를 보냈어요. 눈사람 그림이겠죠? <b>열어 봐요</b>!";
  fig.innerHTML = santaSvg(false);

  let open = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (open) return;
    open = true;
    haptic(HAPTIC.select);
    fig.innerHTML = santaSvg(true);
    fig.classList.add("flip");
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML =
      "카드 속 <b>산타가 서핑</b>을 하고 있어요! 쨍쨍한 해와 파란 바다 — 똑같은 12월인데, 친구네 크리스마스는 왜 이럴까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "남반구는 계절이 반대라 12월이 한여름이어서",
          "오스트레일리아가 적도 위에 있어 늘 더워서",
          "그날만 우연히 더운 날씨였어서",
        ],
        good: "정확해요! 오스트레일리아는 <b>남반구</b> — 우리와 <b>계절이 정반대</b>라 12월이 한여름이에요. 왜 반대가 되는지, 지구를 직접 공전시키며 확인하러 가요!",
        bad: "우연도, 적도 때문도 아니에요 — 오스트레일리아는 적도 아래 <b>남반구</b>에 있어서 우리와 <b>계절이 정반대</b>랍니다. 12월의 한여름이라니, 그 비밀을 지구를 돌리며 확인해요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L4: 마트 원산지 라벨 ══════════ */
function martSvg(found: boolean[]): string {
  const items: { x: number; label: string; art: string }[] = [
    {
      x: 42,
      label: "소고기",
      art: `<rect x="-16" y="-10" width="32" height="20" rx="4" fill="#F2E4E0" stroke="#C8A49E" stroke-width="1.2"/><path d="M-10 -4q10-5 20 0l-2 8q-8 4-16 0z" fill="#D86E5E"/><path d="M-8 0q8-3 16 0" stroke="#F6D8CE" stroke-width="2" stroke-linecap="round"/>`,
    },
    {
      x: 120,
      label: "키위",
      art: `<circle cx="0" cy="0" r="12" fill="#9E7E4E"/><circle cx="0" cy="0" r="8.4" fill="#B8D86E"/><circle cx="0" cy="0" r="2.6" fill="#F2F0D8"/><path d="M0 -7v3M5 -5l-2 2M7 0h-3M5 5l-2-2M0 7v-3M-5 5l2-2M-7 0h3M-5 -5l2 2" stroke="#3E5E2E" stroke-width="1" stroke-linecap="round"/>`,
    },
    {
      x: 198,
      label: "치즈",
      art: `<path d="M-14 8 L14 8 L10 -8 L-10 -8z" fill="#F2C85E" stroke="#C89A2E" stroke-width="1.2"/><circle cx="-3" cy="0" r="2.2" fill="#E8B23E"/><circle cx="5" cy="3" r="1.7" fill="#E8B23E"/>`,
    },
  ];
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs6-shelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8FAFD"/><stop offset="1" stop-color="#E4EAF2"/></linearGradient>
      <linearGradient id="hs6-tag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6DE"/><stop offset="1" stop-color="#F2DFA6"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="140" rx="12" fill="url(#hs6-shelf)"/>
    <rect x="14" y="118" width="212" height="7" rx="3" fill="#C8D2E0"/>
    <rect x="14" y="52" width="212" height="5" rx="2.5" fill="#D4DEEA"/>
    ${items
      .map((it, i) => `
      <g transform="translate(${it.x} 92)">
        <ellipse cy="24" rx="20" ry="3.4" fill="#2A3A5E" opacity=".1"/>
        ${it.art}
        ${found[i]
          ? `<g class="hs6-pop"><rect x="-24" y="-38" width="48" height="20" rx="6" fill="url(#hs6-tag)" stroke="#C8A44E" stroke-width="1.3"/>
             <path d="M0 -18l-4 6h8z" fill="#F2DFA6" stroke="#C8A44E" stroke-width="1"/>
             <g transform="translate(0 -28) scale(.34)"><path d="${AU_SIL}" transform="translate(-46 -30)" fill="#C0471C" opacity="${i === 0 ? 1 : 0.25}"/><path d="${NZ_SIL}" transform="translate(-52 -34)" fill="#2E9E5B" opacity="${i === 0 ? 0.25 : 1}"/></g></g>`
          : `<circle cx="18" cy="-16" r="7" fill="#3F8FC8" opacity=".9"/><path d="M15 -16h6M18 -19v6" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>`}
      </g>`)
      .join("")}
  </svg>`;
}

export function renderMartOrigin(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs6-frame hs6-tap" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML =
    "가족 장보기 미션! 마트 진열대의 <b>소고기·키위·치즈</b> — 어디서 왔는지 <b>상품을 하나씩 탭</b>해 원산지 라벨을 확인해 봐요.";

  const found = [false, false, false];
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = martSvg(found);
  };
  show();
  fig.addEventListener("click", (e) => {
    const r = fig.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 240;
    const idx = x < 82 ? 0 : x < 160 ? 1 : 2;
    if (found[idx]) return;
    found[idx] = true;
    haptic(HAPTIC.tap);
    show();
    const n = found.filter(Boolean).length;
    if (n === 1) helper.innerHTML = "<b>오스트레일리아산</b> 소고기… 지구 반대편에서 왔네요? 나머지도 확인!";
    if (n === 2) helper.innerHTML = "키위는 <b>뉴질랜드산</b>! 한 진열대에 남반구가 두 번 — 마지막 하나도!";
    if (n === 3) {
      face("surprised");
      helper.innerHTML =
        "치즈까지 <b>뉴질랜드산</b> — 한 바구니가 전부 <b>오세아니아산</b>이에요! 이렇게 먼 나라의 먹거리가 왜 우리 마트에 가득할까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "넓은 땅에서 대규모로 길러 세계에 수출하니까",
            "우리나라에서는 하나도 기를 수 없는 것들이라서",
            "운반비가 공짜라서 싸게 팔 수 있어서",
          ],
          good: "맞아요! 오스트레일리아와 뉴질랜드는 넓은 땅에서 <b>기업적 농목업</b>으로 소·양·밀을 대규모로 길러 세계에 수출해요. 광산의 지하자원까지 — 대륙이 파는 것들을 만나러 가요!",
          bad: "우리나라에서도 소와 과일을 길러요 — 비밀은 <b>규모</b>! 넓은 땅에서 대규모로 기르는 <b>기업적 농목업</b> 덕분에 세계로 수출한답니다. 지하자원까지, 대륙이 파는 것들을 만나러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L5: 지도 앱의 수상한 '섬' ══════════ */
function trashSvg(zoom: number): string {
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="hs6-ocean" cx=".5" cy=".45" r=".85"><stop offset="0" stop-color="#3E7EB8"/><stop offset="1" stop-color="#2A5E92"/></radialGradient>
      <linearGradient id="hs6-app2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C2436"/><stop offset="1" stop-color="#28324A"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="140" rx="12" fill="url(#hs6-app2)"/>
    <rect x="14" y="16" width="212" height="124" rx="8" fill="url(#hs6-ocean)" stroke="#101828" stroke-width="1.6"/>
    <g clip-path="url(#hs6-clip5)"><clipPath id="hs6-clip5"><rect x="14" y="16" width="212" height="124" rx="8"/></clipPath>
    ${zoom === 0
      ? `<path d="M14 34q26-10 46 2l14 12-8 14-22 2-18-8z" fill="#4E7856"/>
         <path d="M226 26q-22 2-30 16l-6 16 12 16 24 4z" fill="#4E7856"/>
         <circle cx="128" cy="86" r="13" fill="#8A93A6" opacity=".5"/>
         <circle cx="128" cy="86" r="13" fill="none" stroke="#F2C24E" stroke-width="2" stroke-dasharray="4 3" class="hs6-spin"/>
         <text x="128" y="91" text-anchor="middle" font-size="12" font-weight="900" fill="#EAF2FA">?</text>`
      : `<g>
          <path d="M60 66q24-18 60-14t62 20q14 8 4 20-16 16-52 16-40 0-66-14-14-9-8-28z" fill="#7E8A98" opacity=".55"/>
          ${[
            [92, 76, 0], [116, 66, 20], [142, 78, -14], [166, 88, 8], [104, 96, -20], [130, 104, 12], [156, 108, -6], [86, 106, 14], [178, 72, -18],
          ]
            .map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-6" y="-2.6" width="12" height="5.2" rx="2.4" fill="#D8E4EE" stroke="#8A9AAC" stroke-width="1"/><rect x="4.4" y="-1.6" width="2.6" height="3.2" fill="#8AB4D8"/></g>`)
            .join("")}
          ${[[100, 60], [150, 60], [124, 88], [170, 100], [92, 90]]
            .map(([x, y]) => `<path d="M${x} ${y}q4-5 8 0l-2 5h-4z" fill="#AEBCCA" opacity=".85"/>`)
            .join("")}
          <path d="M70 120q10-6 20 0M186 112q8-5 16 0" stroke="#EAF2FA" stroke-width="1.6" opacity=".5" fill="none"/>
        </g>`}
    </g>
    <rect x="14" y="16" width="212" height="16" rx="8" fill="rgba(10,16,30,.5)"/>
    <circle cx="24" cy="24" r="3.4" fill="none" stroke="#8FB2D6" stroke-width="1.6"/><path d="M27 27l3 3" stroke="#8FB2D6" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

export function renderTrashIsland(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs6-frame" });
  const btn = el("button", { class: "hs6-btn", attrs: { type: "button" }, text: "확대하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "지도 앱으로 태평양을 구경하다가, 하와이와 아메리카 사이 바다에서 지도에 없는 <b>수상한 얼룩</b>을 발견했어요. 섬인가? <b>확대</b>해 봐요!";
  fig.innerHTML = trashSvg(0);

  let zoom = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (zoom >= 1) return;
    zoom = 1;
    haptic(HAPTIC.select);
    fig.innerHTML = trashSvg(1);
    fig.classList.add("flip");
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML =
      "섬인 줄 알았던 얼룩의 정체는 — <b>둥둥 떠다니는 페트병과 봉지들</b>! 이 '섬 아닌 섬'은 대체 뭘까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "버려진 쓰레기가 해류를 타고 모인 거대한 지대",
          "화산 폭발로 새로 생겨난 진짜 섬",
          "배들이 모여 있는 바다 위 주차장",
        ],
        good: "맞아요 — 세계 곳곳에서 바다로 흘러든 쓰레기가 <b>해류를 따라 돌다 한곳에 모인</b> '태평양 거대 쓰레기 지대'예요. 태평양이 보내는 구조 신호를 들으러 가요!",
        bad: "화산섬도 배도 아니에요 — 세계 곳곳에서 바다로 흘러든 <b>쓰레기가 해류를 타고 모여</b> 만들어진 지대랍니다. 태평양이 보내는 구조 신호, 지금 들으러 가요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L6: 등굣길 플로깅 ══════════ */
function plogSvg(got: boolean[]): string {
  const items: [number, number, string][] = [
    [64, 128, `<rect x="-5" y="-9" width="10" height="18" rx="3" fill="#CDE2F0" stroke="#8AAECB" stroke-width="1.2"/><rect x="-3" y="-12" width="6" height="4" rx="1.4" fill="#8AB4D8"/>`],
    [128, 136, `<path d="M-7 -6q7-5 14 0l-2 10q-5 4-10 0z" fill="#E8EEF4" stroke="#A8B6C6" stroke-width="1.2"/><path d="M-4 -8l2-4M3 -8l-1-4" stroke="#A8B6C6" stroke-width="1.4" stroke-linecap="round"/>`],
    [186, 126, `<circle r="7" fill="#E86E5E" stroke="#B8422E" stroke-width="1.2"/><path d="M-7 0h14" stroke="#B8422E" stroke-width="1"/>`],
  ];
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs6-morning" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8E4F4"/><stop offset="1" stop-color="#E8F2E4"/></linearGradient>
      <linearGradient id="hs6-path6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4D8BC"/><stop offset="1" stop-color="#CCBC96"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="140" rx="12" fill="url(#hs6-morning)"/>
    <path d="M6 118q60-10 114-4t114-2v36H6z" fill="url(#hs6-path6)"/>
    <path d="M30 62q10-10 24 0 6-8 16-4l-4 8H36z" fill="#FFFFFF" opacity=".8"/>
    <path d="M168 40q8-8 20 0 6-6 14-2l-4 7h-28z" fill="#FFFFFF" opacity=".7"/>
    <g stroke="#3C4654" stroke-width="2.2" stroke-linecap="round" fill="none">
      <circle cx="30" cy="96" r="6" fill="#F6EFE4"/>
      <path d="M30 102v14M30 106l-8 2M30 106l8 4M30 116l-7 10M30 116l8 9"/>
    </g>
    <path d="M40 111l6 3" stroke="#3C4654" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M46 114q7 2 8 8" stroke="#5A8A46" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M50 122q4-3 8 0 3 8-4 10t-8-4q0-4 4-6z" fill="#CDE8C2" stroke="#5A8A46" stroke-width="1.4" opacity=".9"/>
    <ellipse cx="30" cy="128" rx="12" ry="2.6" fill="#2A3A5E" opacity=".1"/>
    ${items
      .map(([x, y, art], i) =>
        got[i]
          ? ""
          : `<g transform="translate(${x} ${y})" class="hs6-litter"><ellipse cy="10" rx="9" ry="2" fill="#2A3A5E" opacity=".1"/>${art}</g>`)
      .join("")}
  </svg>`;
}

export function renderPloggingRun(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs6-frame hs6-tap" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML =
    "아침 등굣길, 학교에서 <b>플로깅</b>(달리며 쓰레기 줍기) 행사가 열렸어요! 길가의 <b>쓰레기 세 개를 탭</b>해서 봉투에 담아 봐요.";

  const got = [false, false, false];
  let timer = 0;
  fig.innerHTML = plogSvg(got);
  fig.addEventListener("click", (e) => {
    const r = fig.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 240;
    const idx = x < 96 ? 0 : x < 158 ? 1 : 2;
    if (got[idx]) return;
    got[idx] = true;
    haptic(HAPTIC.tap);
    fig.innerHTML = plogSvg(got);
    const n = got.filter(Boolean).length;
    if (n === 1) helper.innerHTML = "페트병 하나 획득! 봉투가 든든해져요 — 나머지도 줍자!";
    if (n === 2) helper.innerHTML = "비닐봉지까지! 하나 남았어요.";
    if (n === 3) {
      face("cheer");
      helper.innerHTML =
        "길가의 쓰레기 셋을 전부 담았어요! 그런데 문득 궁금해져요 — 방금 주운 이 페트병, 만약 <b>안 주웠다면</b> 어떻게 됐을까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "빗물과 하천을 타고 바다까지 흘러갈 수 있다",
            "그 자리에서 며칠 만에 썩어 사라진다",
            "동네 밖으로는 절대 나가지 않는다",
          ],
          good: "맞아요 — 길가의 쓰레기는 빗물과 하천을 타고 <b>바다까지</b> 갈 수 있어요. 플라스틱은 잘 썩지도 않죠. 그래서 오늘의 한 줍기가 태평양을 지켜요! 우리가 할 수 있는 일들을 모으러 가요.",
          bad: "플라스틱은 잘 썩지 않고, 빗물과 하천을 타고 <b>바다까지 여행</b>할 수 있어요 — 지난 시간의 쓰레기 지대가 그렇게 만들어졌죠. 그래서 오늘의 한 줍기가 소중해요. 할 수 있는 일들을 모으러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L7: 펭귄 마을 옆 파란 기지 ══════════ */
function stationSvg(play: boolean): string {
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs6-polar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BCD8EE"/><stop offset="1" stop-color="#EAF4FB"/></linearGradient>
      <linearGradient id="hs6-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E9EDC"/><stop offset="1" stop-color="#2A6EB0"/></linearGradient>
      <linearGradient id="hs6-ice7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#D8E8F4"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="140" rx="12" fill="#1C2436"/>
    <rect x="14" y="16" width="212" height="118" rx="8" fill="url(#hs6-polar)" stroke="#101828" stroke-width="1.6"/>
    ${play
      ? `<g clip-path="url(#hs6-clip7)"><clipPath id="hs6-clip7"><rect x="14" y="16" width="212" height="118" rx="8"/></clipPath>
        <path d="M14 106q40-10 74-4t74 2q34-4 64 4v46H14z" fill="url(#hs6-ice7)"/>
        <path d="M14 106q40-10 74-4t74 2q34-4 64 4" stroke="#B8CCE0" stroke-width="1.4" fill="none"/>
        <g>
          <ellipse cx="152" cy="112" rx="46" ry="4" fill="#2A3A5E" opacity=".12"/>
          <path d="M116 108l10-22h52l10 22z" fill="url(#hs6-base)" stroke="#1C4E82" stroke-width="1.8"/>
          <rect x="132" y="94" width="10" height="7" rx="2" fill="#D8ECFA" stroke="#1C4E82" stroke-width="1"/>
          <rect x="150" y="94" width="10" height="7" rx="2" fill="#D8ECFA" stroke="#1C4E82" stroke-width="1"/>
          <path d="M126 108v-6M182 108v-6" stroke="#1C4E82" stroke-width="2.4"/>
          <path d="M170 86v-10M170 76l6-3" stroke="#4E5E72" stroke-width="1.6" stroke-linecap="round"/>
        </g>
        ${[
          [52, 112, 1], [68, 116, -1], [84, 110, 1], [63, 104, 1],
        ]
          .map(([x, y, f]) => `<g transform="translate(${x} ${y}) scale(${(f as number) * 0.9} .9)">
            <ellipse cy="12" rx="7" ry="1.8" fill="#2A3A5E" opacity=".12"/>
            <path d="M0 -10q6 2 5 12t-5 10q-6-2-5-10t5-12z" fill="#2E3A48"/>
            <path d="M0 -6q3.4 1.4 3 8.4T0 10q-3.4-1.6-3-7.6t3-8.4z" fill="#F4F8FB"/>
            <circle cx="1.4" cy="-7.4" r="1" fill="#101820"/>
            <path d="M3.4 -6.4q2.4.4 2.4 2" stroke="#F2A72E" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          </g>`)
          .join("")}
        <path d="M26 34q8-6 16 0M190 28q8-6 16 0" stroke="#FFFFFF" stroke-width="2" opacity=".8" fill="none"/>
        <circle cx="204" cy="118" r="1.6" fill="#FFFFFF"/><circle cx="196" cy="126" r="1.2" fill="#FFFFFF"/><circle cx="212" cy="126" r="1.2" fill="#FFFFFF"/></g>`
      : `<g transform="translate(120 75)"><circle r="21" fill="rgba(16,24,40,.55)"/><path d="M-6 -11l18 11-18 11z" fill="#FFFFFF"/></g>
        <path d="M40 122q30-8 60-4M140 118q30-6 58 0" stroke="#B8CCE0" stroke-width="2" stroke-linecap="round" opacity=".6"/>`}
    <rect x="14" y="16" width="212" height="14" rx="7" fill="rgba(10,16,30,.5)"/>
    <circle cx="24" cy="23" r="3.4" fill="#E2574C"/>
  </svg>`;
}

export function renderStationWhy(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs6-frame" });
  const btn = el("button", { class: "hs6-btn", attrs: { type: "button" }, text: "다큐 재생하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "잠들기 전 <b>남극 다큐멘터리</b>를 틀었어요. 눈과 얼음, 그리고 펭귄 마을… 그 옆에 뭔가 있대요. <b>재생</b>을 눌러 봐요!";
  fig.innerHTML = stationSvg(false);

  let played = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (played) return;
    played = true;
    haptic(HAPTIC.select);
    fig.innerHTML = stationSvg(true);
    fig.classList.add("flip");
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML =
      "펭귄 마을 옆에 <b>파란 건물</b> — 우리나라의 <b>남극 연구 기지</b>래요! 마을도 가게도 없는 영하의 얼음 대륙에, 세계 여러 나라가 왜 기지를 지었을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "빙하·생물 등 과학 연구의 가치가 커서",
          "남극에 호텔을 지어 관광객을 받으려고",
          "겨울 스포츠 훈련장으로 쓰려고",
        ],
        good: "맞아요! 남극의 얼음과 생물엔 지구의 과거와 미래를 읽는 <b>과학 연구의 열쇠</b>가 담겨 있어요. 얼음의 땅이 왜 중요한지, 두 극지방을 통째로 만나러 가요!",
        bad: "호텔도 훈련장도 아니에요 — 남극의 얼음과 생물엔 지구의 과거와 미래를 읽는 <b>연구의 열쇠</b>가 담겨 있어서, 세계 여러 나라가 기지를 세웠답니다. 얼음의 땅이 왜 중요한지 만나러 가요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L8: 북극해로 모여드는 화살표 ══════════ */
function arcticSvg(shown: boolean): string {
  const arrows = [0, 60, 130, 200, 280]
    .map((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const x1 = 120 + Math.sin(a) * 62;
      const y1 = 82 - Math.cos(a) * 62;
      const x2 = 120 + Math.sin(a) * 30;
      const y2 = 82 - Math.cos(a) * 30;
      return `<g class="hs6-pop" style="animation-delay:${i * 0.14}s">
        <path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#E8590C" stroke-width="3" stroke-linecap="round"/>
        <path d="M${(x2 + Math.sin(a) * 8 - Math.cos(a) * 5).toFixed(1)} ${(y2 - Math.cos(a) * 8 - Math.sin(a) * 5).toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} L${(x2 + Math.sin(a) * 8 + Math.cos(a) * 5).toFixed(1)} ${(y2 - Math.cos(a) * 8 + Math.sin(a) * 5).toFixed(1)}" stroke="#E8590C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>`;
    })
    .join("");
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="hs6-arcsea" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#AFD2EC"/><stop offset="1" stop-color="#7FAED4"/></radialGradient>
      <clipPath id="hs6-arcclip"><circle cx="120" cy="82" r="62"/></clipPath>
    </defs>
    <rect x="6" y="8" width="228" height="140" rx="12" fill="#20304C"/>
    <circle cx="120" cy="82" r="62" fill="url(#hs6-arcsea)"/>
    <g clip-path="url(#hs6-arcclip)">
      <g transform="translate(120 82) scale(.26)">
        <path d="${POLAR_NORTH_PATH}" fill="#F2ECDE" fill-rule="evenodd" stroke="rgba(74,88,110,.55)" stroke-width="2"/>
      </g>
    </g>
    <circle cx="120" cy="82" r="62" stroke="#16283E" stroke-width="2.2" fill="none"/>
    <circle cx="120" cy="82" r="24" stroke="#E8B93C" stroke-width="1.2" stroke-dasharray="4 4" fill="none" opacity=".8"/>
    <circle cx="120" cy="82" r="2.6" fill="#E2574C"/>
    ${shown
      ? `${arrows}
        <g transform="translate(120 40)"><path d="M0 6q-6-6 0-11 6 5 0 11z" fill="none"/></g>
        <g class="hs6-pop" style="animation-delay:.7s" transform="translate(150 58)">
          <circle r="9" fill="#20304C" stroke="#E8B93C" stroke-width="1.4"/>
          <path d="M-3 3v-5l3-2 3 2v5z" fill="#E8B93C"/><path d="M0 -5v2" stroke="#E8B93C" stroke-width="1.4"/>
        </g>`
      : ""}
  </svg>`;
}

export function renderArcticFlags(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs6-frame" });
  const btn = el("button", { class: "hs6-btn", attrs: { type: "button" }, text: "뉴스 그림 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "저녁 뉴스에 <b>북극이 내려다보이는 둥근 지도</b>가 떴어요 — 가운데 빨간 점이 북극점이래요. 그림에 무언가 그려진다는데, <b>뉴스 그림</b>을 켜 봐요!";
  fig.innerHTML = arcticSvg(false);

  let shown = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (shown) return;
    shown = true;
    haptic(HAPTIC.select);
    fig.innerHTML = arcticSvg(true);
    btn.classList.add("done");
    btn.disabled = true;
    face("curious");
    helper.innerHTML =
      "북극해를 둘러싼 여러 나라 쪽에서 <b>화살표들이 북극해 한가운데로</b> 모여들어요 — 서로 자기 바다라고 주장 중이래요. 꽁꽁 언 바다에 왜 이렇게 눈독을 들일까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "석유·천연가스 같은 자원이 많이 묻혀 있어서",
          "북극곰을 먼저 데려가고 싶어서",
          "세계에서 가장 추운 기록을 세우고 싶어서",
        ],
        good: "맞아요 — 북극해 바닥엔 <b>석유와 천연가스</b> 같은 자원이 잠들어 있고, 얼음이 녹으며 개발 가능성이 커지자 여러 나라의 관심이 몰렸어요. 열자는 쪽과 지키자는 쪽, 마지막 이야기를 들으러 가요!",
        bad: "기록도 북극곰도 아니에요 — 북극해 바닥의 <b>석유·천연가스 같은 자원</b> 때문이에요. 얼음이 녹으며 개발 가능성이 커지자 여러 나라가 모여들었죠. 열자는 쪽과 지키자는 쪽의 이야기를 들으러 가요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ 서브 디스패처(hookHis2 문법) — 모르는 장면이면 null ══════════ */
export function renderSoc6(
  name: string,
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): (() => void) | null {
  if (name === "newyearfirst") return renderNewYearFirst(scene, helper, s, finish, face);
  if (name === "ulurumystery") return renderUluruMystery(scene, helper, s, finish, face);
  if (name === "santasurf") return renderSantaSurf(scene, helper, s, finish, face);
  if (name === "martorigin") return renderMartOrigin(scene, helper, s, finish, face);
  if (name === "trashisland") return renderTrashIsland(scene, helper, s, finish, face);
  if (name === "ploggingrun") return renderPloggingRun(scene, helper, s, finish, face);
  if (name === "stationwhy") return renderStationWhy(scene, helper, s, finish, face);
  if (name === "arcticflags") return renderArcticFlags(scene, helper, s, finish, face);
  return null;
}
