// hookSoc2 — 사회 Ⅱ 단원(아시아) 훅 장면 8종. hook.ts의 디스패처가 불러 쓴다.
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수,
// 스틱맨만 손그림 라인(#3C4654). CSS 상태 클래스 접두사는 hs2-.
//   asiangames  L1 — 아시안 게임 개막식: 선수단 입장을 넘기다 → 나라 수 예측(약 45개국)
//   monsoonrain L2 — 6월의 달력: 달을 넘기면 장마 시작 → 비의 바람 방향 예측(남쪽 바다)
//   templetrip  L3 — 여행 브이로그 3장면: 사원·모스크·성당 → 공통점 예측(기도하는 곳)
//   halalmark   L4 — 과자 봉지 뒤집기: 초록 인증 마크 → 뜻 예측(이슬람 신자용 할랄)
//   trainride   L5 — 만원 기차 영상: 재생 → 세계 10명 중 아시아 인구 예측(6명)
//   emptyclass  L6 — 교실 사진 비교: 20년 전↔오늘 → 빈 책상의 까닭 예측(저출산)
//   madein      L7 — 옷 라벨 3장 뒤집기: 전부 아시아 → 까닭 예측(풍부한 노동력)
//   fanchant    L8 — 해외 콘서트: 조명을 켜면 한국어 떼창 → 함께 크는 산업 예측(관광)

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type HookOpt = { choices?: string[] };

/* ══════════ L1: 아시안 게임 개막식 ══════════ */
const TEAMS = [
  { name: "대한민국", flag: "#FFFFFF", mark: `<circle cx="0" cy="0" r="4.6" fill="#CD2E3A"/><path d="M-4.6 0a4.6 4.6 0 0 0 9.2 0 2.3 2.3 0 0 0-4.6 0 2.3 2.3 0 0 1-4.6 0z" fill="#0047A0"/>` },
  { name: "인도", flag: "#FFFFFF", mark: `<rect x="-7" y="-5.5" width="14" height="3.7" fill="#FF9933"/><rect x="-7" y="1.8" width="14" height="3.7" fill="#138808"/><circle cx="0" cy="0" r="1.7" fill="none" stroke="#054187" stroke-width=".9"/>` },
  { name: "사우디아라비아", flag: "#2E8A4C", mark: `<path d="M-5 -1h10M-5 1.4h6" stroke="#FFFFFF" stroke-width="1.1" stroke-linecap="round"/>` },
  { name: "타이", flag: "#FFFFFF", mark: `<rect x="-7" y="-5.5" width="14" height="2.2" fill="#A51931"/><rect x="-7" y="3.3" width="14" height="2.2" fill="#A51931"/><rect x="-7" y="-2.2" width="14" height="4.4" fill="#2D2A4A"/>` },
  { name: "우즈베키스탄", flag: "#3F8FC8", mark: `<rect x="-7" y="1" width="14" height="4.5" fill="#2E9E5B"/><rect x="-7" y="-0.4" width="14" height="1.4" fill="#C0392E"/><circle cx="-3.4" cy="-3" r="1.6" fill="#fff"/>` },
];

function gamesSvg(teamIdx: number, count: number): string {
  const t = TEAMS[teamIdx % TEAMS.length];
  return `<svg viewBox="0 0 240 158" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs2-gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2A48"/><stop offset="1" stop-color="#31406A"/></linearGradient>
      <linearGradient id="hs2-track" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C25C3E"/><stop offset="1" stop-color="#A8462C"/></linearGradient>
      <linearGradient id="hs2-flag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E2E8F2"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="146" rx="12" fill="url(#hs2-gsky)"/>
    <path d="M6 60q60-26 114-26t114 26v-24q-54-24-114-24T6 36z" fill="#4A5A86" opacity=".8"/>
    <g fill="#FFE9B8" opacity=".9">
      <circle cx="36" cy="26" r="1.4"/><circle cx="66" cy="20" r="1.2"/><circle cx="98" cy="28" r="1.4"/><circle cx="132" cy="18" r="1.2"/><circle cx="168" cy="24" r="1.4"/><circle cx="200" cy="20" r="1.2"/><circle cx="214" cy="30" r="1.3"/>
      <circle cx="52" cy="34" r="1.1"/><circle cx="150" cy="32" r="1.1"/><circle cx="186" cy="34" r="1.2"/>
    </g>
    <rect x="6" y="108" width="228" height="44" fill="url(#hs2-track)"/>
    <path d="M6 118h228M6 134h228" stroke="#E8D8C8" stroke-width="1.2" opacity=".5"/>
    <ellipse cx="120" cy="140" rx="60" ry="6" fill="#1A2438" opacity=".3"/>
    <g class="hs2-team">
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="104" cy="94" r="7.5" fill="#FFE8CE"/>
        <path d="M104 101v18M104 106l-9 5M104 119l-8 12M104 119l8 12"/>
        <path d="M104 106l10-8"/>
      </g>
      <path d="M114 74v26" stroke="#8A6A3E" stroke-width="2.6" stroke-linecap="round"/>
      <g transform="translate(128 82)">
        <path d="M-14 -10h28a2.5 2.5 0 0 1 2.5 2.5v15a2.5 2.5 0 0 1-2.5 2.5h-28z" fill="${t.flag}" stroke="#2E3A50" stroke-width="1.3"/>
        <g transform="translate(0 0)">${t.mark}</g>
        <ellipse cx="-7" cy="-6.5" rx="7" ry="2.4" fill="#fff" opacity=".35"/>
      </g>
      <g stroke="#3C4654" stroke-width="2.2" fill="none" opacity=".85">
        <circle cx="146" cy="96" r="6.5" fill="#FFE8CE"/>
        <path d="M146 102v15M146 106l-7 5M146 106l7 4M146 117l-7 11M146 117l7 11"/>
        <circle cx="172" cy="97" r="6.5" fill="#FFE8CE"/>
        <path d="M172 103v14M172 107l-7 4M172 107l7 4M172 117l-6 11M172 117l6 11"/>
      </g>
    </g>
    <g transform="translate(30 52)">
      <rect x="-14" y="-14" width="52" height="26" rx="6" fill="#10182C" stroke="#5A6B8E" stroke-width="1.2"/>
      <text x="12" y="4" text-anchor="middle" font-size="13" font-weight="900" fill="#FFD98A">${count}번째</text>
    </g>
    <text x="120" y="152" text-anchor="middle" font-size="9.5" font-weight="700" fill="#AAB8D8" opacity=".0">.</text>
  </svg>`;
}

export function renderAsianGames(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs2-games", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 다음 선수단 입장 보기" } });
  const nameTag = el("div", { class: "hs2-gamestag" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, nameTag, choicesBox);
  helper.innerHTML = "아시안 게임 개막식 생중계! 선수단이 끝없이 들어와요 — <b>탭해서</b> 다음 선수단을 맞이해요.";

  const counts = [3, 12, 27, 38, 45];
  let idx = 0;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = gamesSvg(idx, counts[idx]);
    nameTag.innerHTML = `<b>${TEAMS[idx % TEAMS.length].name}</b> 선수단 입장!`;
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  const next = (): void => {
    if (idx >= counts.length - 1) return;
    idx += 1;
    haptic(HAPTIC.tap);
    show();
    if (idx === 2) helper.innerHTML = "벌써 27번째… 아직도 줄이 안 끝나요! <b>계속 탭!</b>";
    if (idx >= counts.length - 1) {
      face("surprised");
      helper.innerHTML = "45번째 선수단까지! 그런데 문득 궁금해요 — <b>아시아에는 나라가 몇 개나 있을까요?</b>";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? ["약 45개국", "약 15개국", "약 100개국"],
          good: "맞아요! 아시안 게임에는 <b>45개 나라·지역</b>이 모여요. 세계에서 가장 큰 대륙답게 나라도, 사람도, 문화도 가장 많죠 — 이 큰 대륙을 어떻게 나눠 볼지부터 시작해요!",
          bad: "개막식 카운터를 떠올려요 — 45번째 선수단까지 들어왔죠! 아시안 게임에 모이는 나라·지역이 <b>약 45개</b>예요. 이 넓은 대륙을 통째로 볼 순 없으니, 지역을 나누는 것부터 시작해요!",
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

/* ══════════ L2: 6월의 달력, 장마 ══════════ */
function calendarSvg(month: 5 | 6 | 7): string {
  const rainOp = month === 5 ? 0 : month === 6 ? 0.75 : 1;
  const cloudOp = month === 5 ? 0.25 : 1;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs2-room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2EEE6"/><stop offset="1" stop-color="#E4DECE"/></linearGradient>
      <linearGradient id="hs2-winsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${month === 5 ? "#9CD2F5" : "#7E93AC"}"/><stop offset="1" stop-color="${month === 5 ? "#D9F0FA" : "#B8C6D6"}"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs2-room)"/>
    <g>
      <rect x="24" y="22" width="104" height="118" rx="8" fill="#FFFFFF" stroke="#B8AE96" stroke-width="1.6"/>
      <rect x="24" y="22" width="104" height="30" rx="8" fill="#E8590C"/>
      <rect x="24" y="40" width="104" height="12" fill="#FFFFFF"/>
      <text x="76" y="44" text-anchor="middle" font-size="15" font-weight="900" fill="#FFFFFF">${month}월</text>
      <g fill="#C4BCA6">${[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4, 5, 6].map((c) => `<rect x="${32 + c * 13}" y="${60 + r * 18}" width="9" height="9" rx="2"/>`).join("")).join("")}</g>
      ${month >= 6 ? `<g><circle cx="${32 + 4 * 13 + 4.5}" cy="${60 + 2 * 18 + 4.5}" r="8.5" fill="none" stroke="#E8590C" stroke-width="2.2"/><path d="M${32 + 4 * 13 + 1} ${60 + 2 * 18 + 14}q3.5 3 7 0" stroke="#4E9AE8" stroke-width="1.8" fill="none"/></g>` : ""}
      <ellipse cx="76" cy="146" rx="46" ry="4" fill="#2A3A5E" opacity=".1"/>
    </g>
    <g>
      <rect x="146" y="24" width="72" height="86" rx="6" fill="url(#hs2-winsky)" stroke="#8A937E" stroke-width="2.4"/>
      <g opacity="${cloudOp}">
        <ellipse cx="168" cy="42" rx="14" ry="7" fill="#6E7E96"/>
        <ellipse cx="184" cy="38" rx="16" ry="8" fill="#5E6E88"/>
        <ellipse cx="198" cy="44" rx="12" ry="6" fill="#6E7E96"/>
      </g>
      <g stroke="#5BB8E8" stroke-width="2" stroke-linecap="round" opacity="${rainOp}">
        <path d="M160 56l-3 10M174 52l-3 10M188 58l-3 10M202 54l-3 10M166 74l-3 10M182 72l-3 10M196 76l-3 10M158 92l-3 9M176 92l-3 9M194 94l-3 9"/>
      </g>
      ${month === 5 ? `<circle cx="200" cy="38" r="9" fill="#FFC24D"/><circle cx="200" cy="38" r="13" fill="#FFC24D" opacity=".25"/>` : ""}
      <path d="M146 110h72" stroke="#8A937E" stroke-width="3"/>
    </g>
    <g stroke="#3C4654" stroke-width="2.4" fill="none">
      <circle cx="150" cy="132" r="7.5" fill="#FFE8CE"/>
      <path d="M150 139v14M150 144l-9 4M150 144l9-6M150 153l-7 11M150 153l7 11"/>
    </g>
    <ellipse cx="150" cy="164" rx="20" ry="3.5" fill="#2A3A5E" opacity=".1"/>
  </svg>`;
}

export function renderMonsoonRain(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs2-calendar" });
  const btn = el("button", { class: "hs2-flipbtn", attrs: { type: "button" } }, el("span", { text: "달력 넘기기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "5월의 교실 — 창밖이 아직 화창해요. <b>달력을 넘겨</b> 여름으로 가 봐요.";

  const months: (5 | 6 | 7)[] = [5, 6, 7];
  let mi = 0;
  let timer = 0;
  fig.innerHTML = calendarSvg(5);
  btn.addEventListener("click", () => {
    if (mi >= months.length - 1) return;
    mi += 1;
    haptic(HAPTIC.tap);
    fig.innerHTML = calendarSvg(months[mi]);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
    if (mi === 1) helper.innerHTML = "6월 말 — 달력에 동그라미 친 그날부터 <b>장마</b>가 시작됐어요. 한 장 더!";
    if (mi >= months.length - 1) {
      btn.setAttribute("disabled", "true");
      btn.classList.add("off");
      face("surprised");
      helper.innerHTML = "7월 — 매년 여름이면 어김없이 찾아오는 이 큰비! <b>비를 몰고 오는 바람은 어디서 불어올까요?</b>";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? ["남쪽 바다에서", "북쪽 대륙(내륙)에서", "바람과는 상관없다"],
          good: "정확해요! 여름엔 <b>남쪽 바다에서 물기를 잔뜩 머금은 바람</b>이 불어와 큰비를 뿌려요. 계절 따라 방향이 뒤집히는 이 바람의 정체를 지금부터 파헤쳐 봐요!",
          bad: "북쪽 대륙에서 오는 바람은 겨울의 <b>건조한 칼바람</b>이에요. 여름의 큰비는 <b>남쪽 바다에서 물기를 머금고 온 바람</b>의 선물 — 계절 따라 방향이 뒤집히는 이 바람을 직접 확인해 봐요!",
          onDone: finish,
        });
      }, 750);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L3: 여행 브이로그 — 세 건물 ══════════ */
interface TripCard {
  name: string;
  scene: string;
}
function tripScenes(): TripCard[] {
  return [
    {
      name: "타이의 어느 곳",
      scene: `<svg viewBox="0 0 240 150" fill="none" aria-hidden="true">
        <defs><linearGradient id="hs2-tsky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CD2F5"/><stop offset="1" stop-color="#E2F2FA"/></linearGradient>
        <linearGradient id="hs2-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE29A"/><stop offset=".55" stop-color="#F2B93C"/><stop offset="1" stop-color="#C88A1E"/></linearGradient></defs>
        <rect x="6" y="6" width="228" height="138" rx="12" fill="url(#hs2-tsky1)"/>
        <rect x="6" y="118" width="228" height="26" fill="#C8E0A8"/>
        <ellipse cx="120" cy="122" rx="64" ry="5" fill="#2A3A5E" opacity=".12"/>
        <path d="M120 22l4 14h-8z" fill="url(#hs2-gold)"/>
        <path d="M112 36h16l6 26h-28z" fill="url(#hs2-gold)" stroke="#A06818" stroke-width="1.2"/>
        <path d="M100 62h40l8 32h-56z" fill="url(#hs2-gold)" stroke="#A06818" stroke-width="1.2"/>
        <path d="M92 94h56v24H92z" fill="#F5EDD8" stroke="#B09858" stroke-width="1.4"/>
        <path d="M104 94v24M120 94v24M136 94v24" stroke="#D8C89A" stroke-width="1.6"/>
        <path d="M64 118V96l10-14 10 14v22z" fill="#E8DCC0" stroke="#B09858" stroke-width="1.2"/>
        <path d="M74 76l0 6" stroke="#A06818" stroke-width="2"/>
        <path d="M166 118V96l10-14 10 14v22z" fill="#E8DCC0" stroke="#B09858" stroke-width="1.2"/>
        <ellipse cx="112" cy="42" rx="5" ry="2" fill="#fff" opacity=".45" transform="rotate(-24 112 42)"/>
      </svg>`,
    },
    {
      name: "아랍에미리트의 어느 곳",
      scene: `<svg viewBox="0 0 240 150" fill="none" aria-hidden="true">
        <defs><linearGradient id="hs2-tsky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5D8A8"/><stop offset="1" stop-color="#FBEED8"/></linearGradient>
        <linearGradient id="hs2-dome2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#EDE8DC"/><stop offset="1" stop-color="#CFC6B4"/></linearGradient></defs>
        <rect x="6" y="6" width="228" height="138" rx="12" fill="url(#hs2-tsky2)"/>
        <rect x="6" y="120" width="228" height="24" fill="#E8D8B0"/>
        <ellipse cx="120" cy="124" rx="70" ry="5" fill="#2A3A5E" opacity=".12"/>
        <path d="M120 34q26 10 26 34v10h-52v-10q0-24 26-34z" fill="url(#hs2-dome2)" stroke="#A89878" stroke-width="1.3"/>
        <path d="M120 34v-8M117 28q3-3 6 0" stroke="#C2A85A" stroke-width="1.8" stroke-linecap="round"/>
        <rect x="86" y="78" width="68" height="42" rx="3" fill="#F5F0E4" stroke="#A89878" stroke-width="1.3"/>
        <path d="M100 120v-18q0-8 8-8t8 8v18zM124 120v-18q0-8 8-8t8 8v18z" fill="#D8CCB0"/>
        <g>
          <rect x="54" y="46" width="9" height="74" rx="3" fill="url(#hs2-dome2)" stroke="#A89878" stroke-width="1.2"/>
          <path d="M58.5 46v-10M55 40q3.5-3 7 0" stroke="#C2A85A" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M52 66h13M52 92h13" stroke="#C0B494" stroke-width="1.4"/>
        </g>
        <g>
          <rect x="177" y="46" width="9" height="74" rx="3" fill="url(#hs2-dome2)" stroke="#A89878" stroke-width="1.2"/>
          <path d="M181.5 46v-10M178 40q3.5-3 7 0" stroke="#C2A85A" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M175 66h13M175 92h13" stroke="#C0B494" stroke-width="1.4"/>
        </g>
        <ellipse cx="108" cy="46" rx="7" ry="2.6" fill="#fff" opacity=".55" transform="rotate(-20 108 46)"/>
      </svg>`,
    },
    {
      name: "필리핀의 어느 곳",
      scene: `<svg viewBox="0 0 240 150" fill="none" aria-hidden="true">
        <defs><linearGradient id="hs2-tsky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8DCF0"/><stop offset="1" stop-color="#E8F3FA"/></linearGradient>
        <linearGradient id="hs2-stone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EDE4D2"/><stop offset=".6" stop-color="#D8CCB2"/><stop offset="1" stop-color="#B8A988"/></linearGradient></defs>
        <rect x="6" y="6" width="228" height="138" rx="12" fill="url(#hs2-tsky3)"/>
        <rect x="6" y="120" width="228" height="24" fill="#C8D8A8"/>
        <ellipse cx="120" cy="124" rx="66" ry="5" fill="#2A3A5E" opacity=".12"/>
        <path d="M120 28v10M115.5 32.5h9" stroke="#8A5A26" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M96 60l24-20 24 20z" fill="url(#hs2-stone)" stroke="#8A7A58" stroke-width="1.3"/>
        <rect x="96" y="60" width="48" height="60" fill="url(#hs2-stone)" stroke="#8A7A58" stroke-width="1.3"/>
        <path d="M112 120v-22q0-9 8-9t8 9v22z" fill="#6E5A3E"/>
        <circle cx="120" cy="72" r="7" fill="none" stroke="#8A7A58" stroke-width="1.6"/>
        <path d="M120 65v14M113 72h14M115 67l10 10M125 67l-10 10" stroke="#8A7A58" stroke-width="1"/>
        <g>
          <rect x="64" y="70" width="22" height="50" fill="url(#hs2-stone)" stroke="#8A7A58" stroke-width="1.2"/>
          <path d="M64 70l11-10 11 10" fill="url(#hs2-stone)" stroke="#8A7A58" stroke-width="1.2"/>
          <rect x="70" y="80" width="10" height="14" rx="5" fill="#5A4A32"/>
        </g>
        <g>
          <rect x="154" y="70" width="22" height="50" fill="url(#hs2-stone)" stroke="#8A7A58" stroke-width="1.2"/>
          <path d="M154 70l11-10 11 10" fill="url(#hs2-stone)" stroke="#8A7A58" stroke-width="1.2"/>
          <rect x="160" y="80" width="10" height="14" rx="5" fill="#5A4A32"/>
        </g>
        <path d="M40 132q10-5 20 0M180 132q10-5 20 0" stroke="#7A9E46" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="104" cy="52" rx="6" ry="2.2" fill="#fff" opacity=".5" transform="rotate(-28 104 52)"/>
      </svg>`,
    },
  ];
}

export function renderTempleTrip(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const cards = tripScenes();
  const fig = el("div", { class: "hs2-trip", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 다음 여행 장면 보기" } });
  const cam = el("div", { class: "hs2-cam" });
  const tag = el("div", { class: "hs2-camtag" });
  const dots = el("div", { class: "hs2-camdots" });
  cards.forEach((_, i) => dots.appendChild(el("i", { class: i === 0 ? "on" : "" })));
  fig.append(cam, tag, dots);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "아시아 여행 브이로그를 몰아 보는 중이에요. 근사한 건물이 계속 나와요 — <b>탭해서</b> 다음 장면!";

  let idx = 0;
  const seen = new Set<number>([0]);
  let timer = 0;
  const show = (i: number): void => {
    cam.innerHTML = cards[i].scene;
    tag.innerHTML = `<b>${cards[i].name}</b><i>VLOG</i>`;
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
    if (seen.size === 2) helper.innerHTML = "이번엔 새하얀 돔 지붕! 마지막 장면도 <b>탭!</b>";
    if (seen.size >= cards.length) {
      face("curious");
      helper.innerHTML = "황금 탑, 하얀 돔, 돌로 지은 탑… 생김새는 전혀 다른데, 왠지 통하는 게 있어요. <b>세 건물의 공통점은 뭘까요?</b>";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? ["모두 신에게 기도하는 종교 건물이다", "모두 왕이 사는 궁전이다", "모두 오래된 박물관이다"],
          good: "맞아요! 셋 다 <b>종교 건물</b> — 불교 사원, 이슬람교의 모스크, 크리스트교의 성당이에요. 아시아는 세계 주요 종교가 모두 태어난 대륙이라 종교의 경관도 다양하답니다!",
          bad: "궁전도 박물관도 아니에요 — 셋 다 <b>신에게 기도하는 종교 건물</b>이랍니다. 황금 탑은 불교 사원, 하얀 돔은 이슬람교의 모스크, 돌탑은 크리스트교의 성당! 아시아는 세계 주요 종교가 모두 태어난 대륙이에요.",
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

/* ══════════ L4: 과자 봉지의 초록 마크 ══════════ */
function snackSvg(back: boolean): string {
  const front = `
    <g>
      <rect x="70" y="26" width="100" height="118" rx="10" fill="url(#hs2-snack)" stroke="#B0450A" stroke-width="1.6"/>
      <path d="M70 36q50 8 100 0M70 134q50 8 100 0" stroke="#B0450A" stroke-width="1.4" opacity=".5"/>
      <circle cx="120" cy="78" r="26" fill="#FFE9B8" stroke="#B0450A" stroke-width="1.6"/>
      <path d="M106 78q7-10 14-2t14-2" stroke="#C2490A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="104" cy="46" rx="10" ry="3.4" fill="#fff" opacity=".4" transform="rotate(-16 104 46)"/>
    </g>`;
  const backSide = `
    <g>
      <rect x="70" y="26" width="100" height="118" rx="10" fill="#F5EFE2" stroke="#B0A488" stroke-width="1.6"/>
      <path d="M70 36q50 8 100 0M70 134q50 8 100 0" stroke="#B0A488" stroke-width="1.4" opacity=".5"/>
      <path d="M82 52h56M82 62h64M82 72h48M82 82h60" stroke="#8A8270" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
      <g class="hs2-halal">
        <circle cx="138" cy="112" r="19" fill="#FFFFFF" stroke="#1E9E50" stroke-width="2.6"/>
        <path d="M130 104v16M130 112h9M139 104v16" stroke="#1E9E50" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M147 120q-3-1.5-3-5t3-6q1.6-1 3 .4" stroke="#1E9E50" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M124 98q14-6 28 0" stroke="#1E9E50" stroke-width="1.4" fill="none" opacity=".6"/>
      </g>
      <path d="M82 96h28" stroke="#8A8270" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
    </g>`;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs2-shelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDF2F8"/><stop offset="1" stop-color="#D8E2EE"/></linearGradient>
      <linearGradient id="hs2-snack" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB35C"/><stop offset=".6" stop-color="#F58A2E"/><stop offset="1" stop-color="#D8641A"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs2-shelf)"/>
    <path d="M6 148h228" stroke="#B8C6D6" stroke-width="3"/>
    <ellipse cx="120" cy="150" rx="58" ry="5" fill="#2A3A5E" opacity=".14"/>
    ${back ? backSide : front}
    <g stroke="#3C4654" stroke-width="2.4" fill="none">
      <circle cx="44" cy="96" r="7.5" fill="#FFE8CE"/>
      <path d="M44 103v18M44 108l9 4M44 108l-9 5M44 121l-7 12M44 121l7 12"/>
    </g>
  </svg>`;
}

export function renderHalalMark(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs2-snackwrap" });
  const btn = el("button", { class: "hs2-flipbtn", attrs: { type: "button" } }, el("span", { text: "봉지 뒤집어 보기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "편의점에서 새로 나온 과자를 발견! 그런데 친구가 봉지 뒷면부터 확인하네요. <b>뒤집어 봐요.</b>";
  fig.innerHTML = snackSvg(false);

  let timer = 0;
  btn.addEventListener("click", () => {
    if (btn.hasAttribute("disabled")) return;
    btn.setAttribute("disabled", "true");
    btn.classList.add("off");
    haptic(HAPTIC.tap);
    fig.innerHTML = snackSvg(true);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
    face("surprised");
    helper.innerHTML = "뒷면 구석에 <b>초록 인증 마크</b>가 반짝! 처음 보는 표시인데… <b>이 마크의 뜻은 뭘까요?</b>";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "이슬람교 신자가 먹어도 되는 음식이라는 인증",
          "채소만 들어 있다는 채식 표시",
          "매운맛의 등급을 알려 주는 표시",
        ],
        good: "정확해요! 이슬람 율법이 허용한 음식이라는 <b>할랄 인증</b>이에요. 우리 동네 편의점 과자에도 붙을 만큼, 종교는 멀리 있지 않죠 — 서로 다른 종교와 함께 사는 법을 배워 봐요!",
        bad: "채식·매운맛 표시가 아니라 <b>할랄 인증</b> — 이슬람 율법이 허용한 음식이라는 뜻이에요. 무슬림 친구도 안심하고 먹으라는 배려의 마크죠. 종교와 함께 사는 법, 지금부터예요!",
        onDone: finish,
      });
    }, 750);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L5: 만원 기차 영상 ══════════ */
function trainSvg(play: boolean): string {
  const riders = play
    ? `<g stroke="#3C4654" stroke-width="2" fill="none">
        ${[38, 66, 94, 150, 178].map((x) => `<circle cx="${x}" cy="56" r="5.5" fill="#FFE8CE"/><path d="M${x} 61v9M${x} 64l-5 3M${x} 64l5 3"/>`).join("")}
        <circle cx="122" cy="54" r="5.5" fill="#FFE8CE"/><path d="M122 59v10M122 62l-6 4M122 62l6 4"/>
        ${[52, 108, 164].map((x) => `<circle cx="${x}" cy="84" r="5.5" fill="#FFE8CE"/><path d="M${x} 89v10M${x} 92l-6 3M${x} 92l6 3M${x} 99l-4 8M${x} 99l4 8"/>`).join("")}
      </g>
      <g stroke="#3C4654" stroke-width="2" fill="none">
        <circle cx="206" cy="88" r="5.5" fill="#FFE8CE"/>
        <path d="M206 93v10M206 96l-7-2M206 96l6 4M206 103l-5 9M206 103l5 9"/>
      </g>`
    : "";
  return `<svg viewBox="0 0 240 158" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs2-trsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5DFB8"/><stop offset="1" stop-color="#FBF0DA"/></linearGradient>
      <linearGradient id="hs2-train" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7E9CC2"/><stop offset=".6" stop-color="#5578A6"/><stop offset="1" stop-color="#3E5E8C"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="146" rx="12" fill="url(#hs2-trsky)"/>
    <circle cx="206" cy="30" r="11" fill="#FFC24D"/><circle cx="206" cy="30" r="16" fill="#FFC24D" opacity=".22"/>
    <rect x="6" y="126" width="228" height="26" fill="#C8B48A"/>
    <ellipse cx="118" cy="130" rx="86" ry="6" fill="#2A3A5E" opacity=".14"/>
    <g>
      <rect x="20" y="62" width="200" height="58" rx="10" fill="url(#hs2-train)" stroke="#2C466E" stroke-width="1.8"/>
      <rect x="30" y="72" width="26" height="20" rx="3" fill="#DCEBF8"/><rect x="62" y="72" width="26" height="20" rx="3" fill="#DCEBF8"/>
      <rect x="94" y="72" width="26" height="20" rx="3" fill="#DCEBF8"/><rect x="126" y="72" width="26" height="20" rx="3" fill="#DCEBF8"/>
      <rect x="158" y="72" width="26" height="20" rx="3" fill="#DCEBF8"/>
      <circle cx="52" cy="120" r="9" fill="#2C3A50"/><circle cx="118" cy="120" r="9" fill="#2C3A50"/><circle cx="184" cy="120" r="9" fill="#2C3A50"/>
      <ellipse cx="44" cy="68" rx="14" ry="3" fill="#fff" opacity=".3"/>
    </g>
    ${riders}
    ${play ? "" : `<g class="hs2-play"><circle cx="120" cy="86" r="21" fill="#10182C" opacity=".72"/><path d="M113 74l20 12-20 12z" fill="#FFFFFF"/></g>`}
  </svg>`;
}

export function renderTrainRide(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs2-train", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 영상 재생" } });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "알고리즘이 띄워 준 화제의 영상 — 남부 아시아의 출근 기차래요. <b>탭해서 재생!</b>";
  fig.innerHTML = trainSvg(false);

  let played = false;
  let timer = 0;
  fig.addEventListener("click", () => {
    if (played) return;
    played = true;
    haptic(HAPTIC.tap);
    fig.innerHTML = trainSvg(true);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
    face("surprised");
    helper.innerHTML = "지붕 위까지, 문 밖까지 사람이 가득! 아시아엔 정말 사람이 많은가 봐요. <b>세계 사람이 10명이라면, 아시아에는 몇 명이 살까요?</b>";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? ["약 6명", "약 3명", "약 9명"],
        good: "맞아요! 세계 인구 10명 중 <b>약 6명이 아시아 사람</b> — 세계 인구의 60% 가까이가 이 대륙에 살아요. 어디에, 왜 이렇게 모여 사는지 지도로 확인해 봐요!",
        bad: "3명은 너무 적고 9명은 너무 많아요 — 정답은 <b>약 6명</b>! 세계 인구의 60% 가까이가 아시아에 살아요. 어디에, 왜 이렇게 모여 사는지 지도로 확인해 봐요!",
        onDone: finish,
      });
    }, 900);
  });
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      (fig as HTMLElement).click();
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L6: 빈 교실 ══════════ */
function classSvg(now: boolean): string {
  const deskRows = [0, 1, 2];
  const deskCols = [0, 1, 2, 3];
  const desks = deskRows
    .map((r) =>
      deskCols
        .map((c) => {
          const x = 36 + c * 46;
          const y = 66 + r * 30;
          const empty = now && ((r === 0 && c >= 2) || (r === 1 && c === 1) || (r === 2 && (c === 0 || c === 3)));
          return `<g>
            <rect x="${x}" y="${y}" width="32" height="12" rx="2.4" fill="#D8B98A" stroke="#A8865A" stroke-width="1.2"/>
            <path d="M${x + 4} ${y + 12}v9M${x + 28} ${y + 12}v9" stroke="#A8865A" stroke-width="2"/>
            ${empty ? "" : `<g stroke="#3C4654" stroke-width="1.8" fill="none"><circle cx="${x + 16}" cy="${y - 10}" r="5" fill="#FFE8CE"/><path d="M${x + 16} ${y - 5}v5"/></g>`}
          </g>`;
        })
        .join(""),
    )
    .join("");
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs><linearGradient id="hs2-class" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F0E8"/><stop offset="1" stop-color="#E2DECE"/></linearGradient></defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs2-class)"/>
    <rect x="36" y="20" width="168" height="30" rx="4" fill="#3E5E48" stroke="#2C4634" stroke-width="2"/>
    <path d="M48 30h44M48 40h32" stroke="#E8F2E8" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <rect x="6" y="150" width="228" height="12" fill="#C8B48A"/>
    ${desks}
    <ellipse cx="120" cy="156" rx="90" ry="4" fill="#2A3A5E" opacity=".1"/>
  </svg>`;
}

export function renderEmptyClass(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs2-class" });
  const tag = el("div", { class: "hs2-classtag" });
  const btn = el("button", { class: "hs2-flipbtn", attrs: { type: "button" } }, el("span", { text: "오늘의 교실 보기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, tag, btn, choicesBox);
  helper.innerHTML = "학교 복도에 걸린 <b>20년 전 사진</b> — 책상마다 학생이 빼곡해요. 지금 우리 교실은 어떨까요?";
  fig.innerHTML = classSvg(false);
  tag.textContent = "20년 전, 같은 교실";

  let timer = 0;
  btn.addEventListener("click", () => {
    if (btn.hasAttribute("disabled")) return;
    btn.setAttribute("disabled", "true");
    btn.classList.add("off");
    haptic(HAPTIC.tap);
    fig.innerHTML = classSvg(true);
    tag.textContent = "오늘, 같은 교실";
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
    face("curious");
    helper.innerHTML = "같은 교실인데 <b>빈 책상</b>이 늘었어요. 신입생이 줄고 있대요 — <b>왜 그럴까요?</b>";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? ["태어나는 아이 수가 줄어들어서", "학생들이 모두 전학을 가서", "학교 건물이 새로 늘어나서"],
        good: "맞아요 — <b>태어나는 아이가 줄어드는 저출산</b> 때문이에요. 그런데 아시아엔 정반대로 교실이 미어터지는 나라도 있죠. 나라마다 다른 인구의 모양, '인구 피라미드'로 읽어 봐요!",
        bad: "전학이나 새 학교 때문이라면 다른 학교는 붐벼야겠죠? 진짜 이유는 <b>태어나는 아이 수 자체가 줄어드는 저출산</b>이에요. 반대로 교실이 미어터지는 나라도 있어요 — 인구의 모양을 그래프로 읽어 봐요!",
        onDone: finish,
      });
    }, 750);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L7: 옷 라벨 뒤집기 ══════════ */
const CLOTHES = [
  { id: 0, x: 44, color: "#4E7CB8", made: "베트남" },
  { id: 1, x: 120, color: "#E2758A", made: "방글라데시" },
  { id: 2, x: 196, color: "#5AA86E", made: "중국" },
];

function closetSvg(flipped: boolean[]): string {
  const shirts = CLOTHES.map((c, i) => {
    const label = flipped[i]
      ? `<g class="hs2-label">
          <rect x="${c.x - 26}" y="96" width="52" height="26" rx="4" fill="#FFFDF5" stroke="#B0A488" stroke-width="1.4"/>
          <text x="${c.x}" y="107" text-anchor="middle" font-size="8" font-weight="700" fill="#8A8270">MADE IN</text>
          <text x="${c.x}" y="118" text-anchor="middle" font-size="9.5" font-weight="900" fill="#B0450A">${c.made}</text>
        </g>`
      : "";
    return `<g class="hs2-shirt" data-i="${i}" role="button" tabindex="0">
      <path d="M${c.x - 24} 46l12-10q12 6 24 0l12 10-7 12-5-4v42h-24V54l-5 4z" fill="${c.color}" stroke="#2E3A50" stroke-width="1.6"/>
      <path d="M${c.x - 12} 36q12 6 24 0" stroke="#2E3A50" stroke-width="1.4" fill="none"/>
      <ellipse cx="${c.x - 12}" cy="48" rx="5" ry="2" fill="#fff" opacity=".3" transform="rotate(-24 ${c.x - 12} 48)"/>
      ${label}
    </g>`;
  }).join("");
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs><linearGradient id="hs2-closet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5EFE4"/><stop offset="1" stop-color="#E6DCC8"/></linearGradient></defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs2-closet)"/>
    <path d="M14 30h212" stroke="#8A6A3E" stroke-width="4" stroke-linecap="round"/>
    ${CLOTHES.map((c) => `<path d="M${c.x} 30v6M${c.x - 12} 46q12-14 24 0" stroke="#5A4326" stroke-width="2" fill="none"/>`).join("")}
    ${shirts}
    <ellipse cx="120" cy="152" rx="86" ry="5" fill="#2A3A5E" opacity=".1"/>
    <text x="120" y="152" text-anchor="middle" font-size="9.5" font-weight="700" fill="#A89878">라벨을 탭해서 확인!</text>
  </svg>`;
}

export function renderMadeIn(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs2-closet" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "오늘의 미션: 옷장 탐사! 옷마다 붙은 <b>원산지 라벨</b>을 하나씩 <b>탭해서</b> 확인해요.";

  const flipped = [false, false, false];
  let timer = 0;
  const render = (): void => {
    fig.innerHTML = closetSvg(flipped);
    fig.querySelectorAll<SVGGElement>(".hs2-shirt").forEach((g) => {
      g.addEventListener("click", () => {
        const i = Number(g.dataset.i);
        if (flipped[i]) return;
        flipped[i] = true;
        haptic(HAPTIC.tap);
        render();
        const n = flipped.filter(Boolean).length;
        if (n === 2) helper.innerHTML = "베트남, 방글라데시… 마지막 옷도 <b>탭!</b>";
        if (n >= 3) {
          face("surprised");
          helper.innerHTML = "셋 다 <b>아시아</b>에서 만들어졌어요! 우연일까요? <b>왜 옷들은 아시아에서 만들어질까요?</b>";
          timer = window.setTimeout(() => {
            ask(choicesBox, helper, {
              choices: s.choices ?? [
                "일할 사람이 많아 옷 공장이 모여 있어서",
                "아시아에서만 옷감이 나기 때문에",
                "우리나라에서 가장 가까운 대륙이라서",
              ],
              good: "정확해요! 옷 만들기는 <b>많은 손</b>이 필요한 일 — 노동력이 풍부한 아시아가 세계의 옷 공장이 됐어요. 자원·공장·첨단까지, 아시아 산업의 세 기둥을 만나러 가요!",
              bad: "옷감은 세계 곳곳에서 나고, 거리 때문도 아니에요. 진짜 이유는 <b>풍부한 노동력</b> — 옷 만들기는 많은 손이 필요한 일이라, 일할 사람이 많은 아시아에 공장이 모였답니다!",
              onDone: finish,
            });
          }, 750);
        }
      });
    });
  };
  render();
  return () => window.clearTimeout(timer);
}

/* ══════════ L8: 해외 콘서트 떼창 ══════════ */
function concertSvg(lit: boolean): string {
  const crowd = [26, 46, 66, 86, 106, 126, 146, 166, 186, 206]
    .map((x, i) => {
      const y = 128 + (i % 2) * 6;
      const stick = lit ? `<path d="M${x} ${y - 14}v-10" stroke="#3C4654" stroke-width="1.8"/><circle cx="${x}" cy="${y - 27}" r="3.2" fill="${i % 3 === 0 ? "#FFD98A" : i % 3 === 1 ? "#8ED2F5" : "#F5A0B8"}"/>` : "";
      return `<g><circle cx="${x}" cy="${y}" r="5.5" fill="#2C3A50"/>${stick}</g>`;
    })
    .join("");
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs2-hall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E1428"/><stop offset="1" stop-color="#232C4A"/></linearGradient>
      <linearGradient id="hs2-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9B8" stop-opacity=".85"/><stop offset="1" stop-color="#FFE9B8" stop-opacity="0"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs2-hall)"/>
    <rect x="42" y="88" width="156" height="14" rx="4" fill="#38445E"/>
    ${lit ? `<path d="M96 16l-30 76h24l18-76zM144 16l30 76h-24l-18-76z" fill="url(#hs2-beam)"/>` : ""}
    <g stroke="#3C4654" stroke-width="2.2" fill="none">
      <circle cx="120" cy="62" r="7" fill="#FFE8CE"/>
      <path d="M120 69v16M120 74l-9 3M120 74l9-6M120 85l-7 12M120 85l7 12"/>
      <path d="M131 66q4-2 5-6" stroke="#8A93A6"/>
    </g>
    <circle cx="133" cy="59" r="2.6" fill="#8A93A6"/>
    ${lit ? `<g class="hs2-chant">
      <g transform="translate(58 34)"><rect x="-24" y="-11" width="48" height="20" rx="9" fill="#FFFFFF" opacity=".94"/><text x="0" y="4" text-anchor="middle" font-size="10.5" font-weight="900" fill="#2C3A50">사랑해요!</text></g>
      <g transform="translate(184 30)"><rect x="-26" y="-11" width="52" height="20" rx="9" fill="#FFFFFF" opacity=".94"/><text x="0" y="4" text-anchor="middle" font-size="10.5" font-weight="900" fill="#2C3A50">최고예요!</text></g>
      <path d="M96 46q4-4 0-8M104 48q5-5 0-11M136 44q-4-4 0-8M144 46q-5-5 0-11" stroke="#FFD98A" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </g>` : ""}
    ${crowd}
    <ellipse cx="120" cy="152" rx="100" ry="5" fill="#000" opacity=".3"/>
  </svg>`;
}

export function renderFanchant(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs2-concert" });
  const btn = el("button", { class: "hs2-flipbtn", attrs: { type: "button" } }, el("span", { text: "무대 조명 켜기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "지구 반대편의 콘서트장 — 우리나라 가수의 공연이 곧 시작돼요. <b>조명을 켜 볼까요?</b>";
  fig.innerHTML = concertSvg(false);

  let timer = 0;
  btn.addEventListener("click", () => {
    if (btn.hasAttribute("disabled")) return;
    btn.setAttribute("disabled", "true");
    btn.classList.add("off");
    haptic(HAPTIC.correct);
    fig.innerHTML = concertSvg(true);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
    face("cheer");
    helper.innerHTML = "조명이 켜지자 외국 팬들이 <b>한국어로 떼창</b>을 해요! 이렇게 우리 문화에 빠진 팬들이 늘어나면, <b>우리나라에서 함께 자라나는 산업은 뭘까요?</b>";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "우리나라를 찾아오는 관광 산업",
          "우리나라의 석유 생산 산업",
          "우리나라의 사막 농업",
        ],
        good: "맞아요! 노래가 좋아지면 그 나라가 궁금해지죠 — 공연을 보러, 촬영지를 걸으러 <b>관광객</b>이 찾아와요. 문화 산업이 다른 산업까지 끌어 주는 힘, 아시아 산업의 큰 변화를 살펴봐요!",
        bad: "우리나라엔 유전도 사막도 없죠! 정답은 <b>관광 산업</b> — 노래가 좋아지면 그 나라가 궁금해져서, 공연을 보러 촬영지를 걸으러 관광객이 찾아와요. 문화가 산업을 끌어 주는 거예요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}
