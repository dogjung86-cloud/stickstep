// hookSoc3 — 사회 Ⅲ 단원(유럽) 훅 장면 7종. hook.ts의 디스패처가 불러 쓴다.
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수,
// 스틱맨만 손그림 라인(#3C4654). CSS 상태 클래스 접두사는 hs3-.
//   dawnsoccer  L1 — 새벽 4시의 거실: TV를 켜면 유럽 결승전 → 왜 새벽 중계? (멀리 서쪽 = 낮밤이 다름)
//   peakhike    L2 — 한여름 등산: 오를수록 추워져 정상엔 눈 → 만년설의 까닭 (높아서 안 녹음)
//   frozenriver L3 — 겨울 뉴스 채널: 언 한강 ↔ 안 언 템스강 + 위도 띠 → 북쪽인데 따뜻한 까닭
//   cityfeed    L4 — 도시 SNS 피드 3장: 사진 분위기가 전부 다름 → 도시마다 다른 기능·매력
//   skislope    L5 — 도시 한복판 스키 언덕: 줌 아웃하면 발전소 → 쓰레기 소각장의 변신
//   trainborder L6 — 기차 국경 통과: 여권 검사가 없다 → 자유 이동의 약속(솅겐)
//   fourshirts  L7 — 대회 조 추첨: 한 나라에서 유니폼이 4벌 → 네 지역이 연합한 영국
// 민감 주제 가드: L7은 깃발 대신 유니폼 색(실제 대표팀 색)만 쓴다 — 특정 기 논쟁 회피.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type HookOpt = { choices?: string[] };

/* ══════════ L1: 새벽 4시의 거실 ══════════ */
function dawnSvg(state: 0 | 1 | 2): string {
  // state 0: TV 꺼짐 · 1: 결승전 중계(환한 경기장) · 2: 창밖 확인(깜깜한 밤 + 달)
  const tvOn = state >= 1;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs3-droom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141C30"/><stop offset="1" stop-color="#1E2840"/></linearGradient>
      <linearGradient id="hs3-pitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4EA84E"/><stop offset="1" stop-color="#2E7E3A"/></linearGradient>
      <radialGradient id="hs3-tvglow" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#BFE3FF" stop-opacity=".28"/><stop offset="1" stop-color="#BFE3FF" stop-opacity="0"/></radialGradient>
      <linearGradient id="hs3-moon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6D8"/><stop offset="1" stop-color="#E8D89A"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs3-droom)"/>
    <g class="hs3-window" opacity="${state === 2 ? 1 : 0.55}">
      <rect x="168" y="20" width="54" height="64" rx="6" fill="#0A1222" stroke="#3A4864" stroke-width="1.6"/>
      <path d="M195 20v64M168 52h54" stroke="#3A4864" stroke-width="1.4"/>
      ${state === 2 ? `<circle cx="182" cy="36" r="7" fill="url(#hs3-moon)"/><circle cx="207" cy="30" r="1.1" fill="#D8E4FF"/><circle cx="212" cy="44" r="0.9" fill="#D8E4FF"/><circle cx="201" cy="66" r="1" fill="#D8E4FF"/>` : ""}
    </g>
    <g>
      <rect x="30" y="96" width="20" height="34" rx="3" fill="#2A3652" stroke="#101828" stroke-width="1.4"/>
      <circle cx="40" cy="104" r="4.6" fill="#1A2438" stroke="#3E4E70" stroke-width="1.2"/>
      <path d="M40 104 40 100.6M40 104l2.4 1.6" stroke="#FFD98A" stroke-width="1.3" stroke-linecap="round"/>
      <text x="40" y="124" text-anchor="middle" font-size="7.5" font-weight="800" fill="#8FA2C8">새벽 4시</text>
    </g>
    <ellipse cx="120" cy="150" rx="86" ry="6" fill="#0A1020" opacity=".55"/>
    <g>
      <rect x="62" y="40" width="96" height="62" rx="6" fill="#0C1220" stroke="#3E4E70" stroke-width="2"/>
      ${tvOn ? `
        <rect x="66" y="44" width="88" height="54" rx="3" fill="url(#hs3-pitch)"/>
        <rect x="66" y="44" width="88" height="54" rx="3" fill="url(#hs3-tvglow)"/>
        <path d="M110 44v54M74 60h72v24H74z" stroke="#E8F4E8" stroke-width="1.1" fill="none" opacity=".75"/>
        <circle cx="110" cy="72" r="7" stroke="#E8F4E8" stroke-width="1.1" fill="none" opacity=".75"/>
        <g stroke="#F4F8FF" stroke-width="1.7" fill="none">
          <circle cx="92" cy="62" r="3" fill="#F4E4C8"/><path d="M92 65v7m0-5l-4 3m4-3l4 2m-4 3l-3 6m3-6l4 5"/>
          <circle cx="128" cy="80" r="3" fill="#E8C8B8"/><path d="M128 83v7m0-5l-4 2m4-2l4 3m-4 2l-4 6m4-6l3 6"/>
        </g>
        <circle cx="112" cy="88" r="2" fill="#FFFFFF"/>
        <g fill="#FFE9B8"><circle cx="72" cy="50" r="1" /><circle cx="84" cy="47" r="1"/><circle cx="140" cy="49" r="1"/><circle cx="150" cy="53" r="1"/></g>`
      : `<rect x="66" y="44" width="88" height="54" rx="3" fill="#0A0E18"/>
        <ellipse cx="98" cy="58" rx="16" ry="7" fill="#182238" opacity=".8"/>`}
      <rect x="104" y="102" width="12" height="8" fill="#1A2438"/>
      <rect x="92" y="110" width="36" height="4" rx="2" fill="#2A3652"/>
    </g>
    <g stroke="#5A6880" stroke-width="2.2" fill="none">
      <circle cx="176" cy="118" r="7" fill="#2E3A54"/>
      <path d="M176 125v14M176 129l-8 4M176 129l8 3M176 139l-7 11M176 139l7 11"/>
    </g>
    ${tvOn ? `<path d="M62 52 40 76M158 52l24 20" stroke="#BFE3FF" stroke-width="1" opacity=".18"/>` : ""}
  </svg>`;
}

export function renderDawnSoccer(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs3-dawn", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 텔레비전 켜기" } });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "알람을 맞추고 일어난 새벽 4시 — 오늘은 유럽 축구 결승전 날! <b>TV를 탭</b>해서 켜 봐요.";

  let state: 0 | 1 | 2 = 0;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = dawnSvg(state);
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
      helper.innerHTML = "결승전 생중계! 그런데 TV 속 유럽 경기장은 <b>환한 저녁</b>이에요. <b>창밖도 탭</b>해 볼까요?";
    } else {
      face("curious");
      helper.innerHTML = "우리 동네는 아직 한밤중, 유럽은 저녁 — <b>같은 순간인데 낮과 밤이 달라요.</b> 왜 유럽 경기는 늘 새벽에 봐야 할까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "유럽이 우리나라에서 서쪽으로 아주 멀리 있어 낮과 밤이 다르기 때문에",
            "유럽 사람들이 새벽 경기를 좋아하기 때문에",
            "우리나라 방송국이 새벽에만 중계할 수 있기 때문에",
          ],
          good: "맞아요! 유럽은 우리나라에서 <b>서쪽으로 아주 먼</b> 대륙이라, 우리가 새벽일 때 그곳은 저녁이에요. 얼마나 멀고 어떤 땅인지 — 지도를 펼쳐 확인해 봐요!",
          bad: "취향이나 방송국 사정이 아니에요 — TV 속 경기장은 환한 저녁이었죠? 유럽은 <b>서쪽으로 아주 멀리</b> 있어 우리와 낮·밤이 어긋나요. 그 먼 대륙의 위치부터 지도로 확인해 봐요!",
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

/* ══════════ L2: 한여름 등산 — 정상의 눈 ══════════ */
function peakSvg(stage: 0 | 1 | 2): string {
  // stage 0: 산 아래 꽃밭(반팔) · 1: 중턱 침엽수 · 2: 정상 부근 만년설
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs3-psky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${stage === 2 ? "#8FB8DE" : "#9CD2F5"}"/><stop offset="1" stop-color="${stage === 2 ? "#C8DCEE" : "#E2F2FB"}"/>
      </linearGradient>
      <linearGradient id="hs3-rock" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#AEC4DA"/><stop offset=".6" stop-color="#7E9AB8"/><stop offset="1" stop-color="#5A7896"/></linearGradient>
      <linearGradient id="hs3-meadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8D66E"/><stop offset="1" stop-color="#6EA83E"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs3-psky)"/>
    <path d="M6 150 60 44 96 96 128 26 200 150z" fill="url(#hs3-rock)" stroke="#54708C" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M118 46 128 26l9 17q-5 6-10 3t-9-3z" fill="#F4F8FC" stroke="#C8D6E4" stroke-width="1"/>
    <path d="M54 56 60 44l5 11q-3 4-6 2t-5-1z" fill="#F4F8FC" opacity=".9"/>
    <path d="M6 150q40-14 82-10t92 10v12H6z" fill="url(#hs3-meadow)"/>
    ${stage === 0 ? `<g><circle cx="40" cy="146" r="2.2" fill="#F2A7C8"/><circle cx="58" cy="150" r="2" fill="#F2C24E"/><circle cx="82" cy="147" r="2.2" fill="#E2574C"/><circle cx="104" cy="151" r="2" fill="#F2A7C8"/></g>` : ""}
    ${stage >= 1 ? `<g fill="#3E7E4E"><path d="M52 118l6-12 6 12zM50 128l8-14 8 14z"/><path d="M84 108l6-12 6 12zM82 118l8-14 8 14z"/></g>` : ""}
    ${stage === 2 ? `<g stroke="#F4F8FC" stroke-width="1.4" stroke-linecap="round" opacity=".9"><path d="M150 60q6-3 12 0M162 48q5-2 10 1M144 74q7-3 13 1"/></g>
      <g fill="#FFFFFF"><circle cx="156" cy="54" r="1.2"/><circle cx="170" cy="64" r="1.1"/><circle cx="148" cy="44" r="1"/><circle cx="176" cy="46" r="1.2"/></g>` : ""}
    <ellipse cx="${stage === 0 ? 176 : stage === 1 ? 150 : 152}" cy="${stage === 0 ? 152 : stage === 1 ? 112 : 66}" rx="12" ry="3" fill="#2A3A5E" opacity=".12"/>
    <g stroke="#3C4654" stroke-width="2.4" fill="none" transform="translate(${stage === 0 ? 176 : stage === 1 ? 150 : 152} ${stage === 0 ? 128 : stage === 1 ? 88 : 42})">
      <circle cx="0" cy="0" r="7.5" fill="#FFE8CE"/>
      ${stage === 2
        ? `<path d="M0 7v15M0 11q-6 1-7 6M0 11q6 1 7 6M0 22l-6 10M0 22l6 10"/><path d="M-4 -3q1.6 2 4 2t4-2" stroke-width="1.6"/><path d="M-9 14q-2 1-3 3M9 14q2 1 3 3" stroke-width="1.6" opacity=".7"/>`
        : `<path d="M0 7v16M0 11l-8 5M0 11l9-7M0 23l-7 12M0 23l7 12"/>`}
    </g>
    ${stage === 2 ? `<text x="120" y="24" text-anchor="middle" font-size="8" font-weight="800" fill="#4E6A8E">한여름 · 정상 부근</text>` : ""}
  </svg>`;
}

export function renderPeakHike(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs3-peak" });
  const btn = el("button", { class: "hs3-flipbtn", attrs: { type: "button" }, text: "더 오르기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "8월의 알프스 여행 — 반팔 차림으로 출발! 꽃밭 너머 저 위가 오늘의 목표예요. <b>더 오르기</b>를 눌러요.";

  let stage: 0 | 1 | 2 = 0;
  let timer = 0;
  fig.innerHTML = peakSvg(0);
  const next = (): void => {
    if (stage >= 2) return;
    stage = (stage + 1) as 1 | 2;
    haptic(HAPTIC.tap);
    fig.innerHTML = peakSvg(stage);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
    if (stage === 1) helper.innerHTML = "중턱을 지나니 서늘하고 뾰족한 침엽수가 나와요. <b>한 번 더!</b>";
    if (stage === 2) {
      btn.disabled = true;
      btn.classList.add("done");
      face("surprised");
      helper.innerHTML = "정상 부근 — 8월인데 <b>눈</b>이 쌓여 있어요! 덜덜… 한여름의 눈, 어떻게 된 걸까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "산이 아주 높아 기온이 낮고, 내린 눈이 여름에도 다 녹지 못해서",
            "산꼭대기가 북극에 훨씬 가까워지기 때문에",
            "누군가 스키장을 만들려고 눈을 뿌려 두어서",
          ],
          good: "정확해요! 4,000m가 넘는 알프스의 봉우리는 기온이 낮아 <b>내린 눈이 녹는 양보다 많아요</b> — 일 년 내내 남는 이 눈이 만년설이에요. 이렇게 높고 험준한 산이 유럽 남부의 뼈대랍니다!",
          bad: "산을 올라도 북극에 가까워지진 않아요 — 위로 올라갈수록 <b>기온이 낮아져</b>, 내린 눈이 녹는 양보다 많으면 일 년 내내 남죠(만년설). 이 높고 험준한 알프스가 유럽 남부의 뼈대예요!",
          onDone: finish,
        });
      }, 750);
    }
  };
  btn.addEventListener("click", next);
  return () => window.clearTimeout(timer);
}

/* ══════════ L3: 겨울 뉴스 — 언 강, 안 언 강 ══════════ */
function riverSvg(ch: 0 | 1, showLat: boolean): string {
  // ch 0: 서울 뉴스(꽁꽁 언 강) · 1: 런던 뉴스(비 내리는 흐르는 강)
  const seoul = ch === 0;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs3-rsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${seoul ? "#AECBE8" : "#8E9CB0"}"/><stop offset="1" stop-color="${seoul ? "#E2EEF8" : "#B8C2CE"}"/>
      </linearGradient>
      <linearGradient id="hs3-ice" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF4FC"/><stop offset="1" stop-color="#C2DCEE"/></linearGradient>
      <linearGradient id="hs3-thames" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E7E9E"/><stop offset="1" stop-color="#46617E"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs3-rsky)"/>
    <rect x="6" y="6" width="228" height="20" rx="10" fill="#B02020"/>
    <text x="120" y="20" text-anchor="middle" font-size="9" font-weight="900" fill="#FFFFFF">${seoul ? "서울 · 한파 속보" : "런던 · 겨울 스케치"}</text>
    ${seoul
      ? `<rect x="6" y="96" width="228" height="46" fill="url(#hs3-ice)"/>
        <path d="M40 108l16 10M52 128l14-8M96 112l18 8M150 106l16 12M180 126l16-9M120 130l14-7" stroke="#9EC2DE" stroke-width="1.4"/>
        <path d="M6 96h228" stroke="#8FB2D2" stroke-width="1.4"/>
        <g stroke="#3C4654" stroke-width="2.2" fill="none">
          <circle cx="70" cy="106" r="6" fill="#FFE8CE"/>
          <path d="M70 112v11M70 115l-6 4M70 115l6 4M70 123l-5 9M70 123l5 9"/>
          <path d="M60 104q4-6 10-6 7 0 10 6" stroke="#C0392E" stroke-width="3.4"/>
        </g>
        <g fill="#FFFFFF" opacity=".9"><circle cx="36" cy="52" r="1.2"/><circle cx="68" cy="40" r="1"/><circle cx="120" cy="56" r="1.1"/><circle cx="170" cy="44" r="1.2"/><circle cx="205" cy="58" r="1"/></g>
        <text x="120" y="88" text-anchor="middle" font-size="8.5" font-weight="800" fill="#3E5A7E">강이 꽁꽁 얼었어요</text>`
      : `<rect x="6" y="96" width="228" height="46" fill="url(#hs3-thames)"/>
        <path d="M20 108q10 3 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0" stroke="#7E9CBA" stroke-width="1.6" fill="none" opacity=".7"/>
        <path d="M14 118q12 4 24 0t24 0 24 0 24 0 24 0 24 0 24 0 24 0" stroke="#6E8CAC" stroke-width="1.6" fill="none" opacity=".6"/>
        <g stroke="#B8C6D8" stroke-width="1.3" stroke-linecap="round" opacity=".85">
          <path d="M40 40l-4 12M70 34l-4 12M100 44l-4 12M132 36l-4 12M164 42l-4 12M196 34l-4 12M56 62l-4 12M118 60l-4 12M180 62l-4 12"/>
        </g>
        <g stroke="#3C4654" stroke-width="2.2" fill="none">
          <circle cx="74" cy="104" r="6" fill="#FFE8CE"/>
          <path d="M74 110v11M74 113l-7 2M74 121l-5 9M74 121l5 9"/>
          <path d="M81 113l6-8" />
          <path d="M74 96 q-14 -10 -28 0" stroke="#2E8A4C" stroke-width="2.6"/>
          <path d="M87 105l0-14" stroke="#8A5A26" stroke-width="2"/>
        </g>
        <text x="120" y="88" text-anchor="middle" font-size="8.5" font-weight="800" fill="#EAF2FA">강물이 그대로 흘러요 · 이슬비</text>`}
    ${showLat
      ? `<g>
        <rect x="26" y="34" width="188" height="34" rx="8" fill="#10182C" opacity=".88"/>
        <path d="M38 58h164" stroke="#5A6B8E" stroke-width="1.2"/>
        <path d="M38 46h164" stroke="#8FA2C8" stroke-width="1.2" stroke-dasharray="3 3"/>
        <circle cx="86" cy="46" r="3.4" fill="#4E9AE8"/><text x="86" y="41" text-anchor="middle" font-size="7.5" font-weight="800" fill="#BFD8F8">런던</text>
        <circle cx="168" cy="58" r="3.4" fill="#E2574C"/><text x="168" y="53" text-anchor="middle" font-size="7.5" font-weight="800" fill="#F8C8C0">서울</text>
        <text x="44" y="43" font-size="7" font-weight="700" fill="#8FA2C8">북쪽 ↑</text>
      </g>`
      : ""}
  </svg>`;
}

export function renderFrozenRiver(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs3-river" });
  const btn = el("button", { class: "hs3-flipbtn", attrs: { type: "button" }, text: "채널 돌리기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "1월의 저녁 뉴스 — 서울은 강이 꽁꽁 얼 만큼 춥대요. <b>채널을 돌려</b> 다른 나라 겨울도 볼까요?";

  let flips = 0;
  let timer = 0;
  fig.innerHTML = riverSvg(0, false);
  const next = (): void => {
    if (flips >= 2) return;
    flips += 1;
    haptic(HAPTIC.tap);
    fig.innerHTML = riverSvg(flips === 1 ? 1 : 1, flips === 2);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
    if (flips === 1) {
      helper.innerHTML = "런던의 겨울 — 강물이 그대로 흐르고 사람들은 얇은 코트에 우산이에요. <b>한 번 더</b> 눌러 두 도시의 위치를 봐요!";
    } else {
      btn.disabled = true;
      btn.classList.add("done");
      face("surprised");
      helper.innerHTML = "지도를 보니 <b>런던이 서울보다 훨씬 북쪽</b>! 더 북쪽인데 겨울이 더 따뜻하다니, 어떻게 된 걸까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "바다와 바람이 따뜻한 기운을 유럽까지 실어 오기 때문에",
            "런던이 사실은 서울보다 남쪽에 있기 때문에",
            "런던은 건물 난방 열기로 도시 전체가 데워지기 때문에",
          ],
          good: "좋은 직감이에요! 범인은 <b>따뜻한 바닷물과 일 년 내내 부는 바람</b> — 이 배달부들이 어떻게 일하는지, 랩에서 직접 꺼 보고 켜 보며 확인해요!",
          bad: "위치 지도를 다시 봐요 — 런던은 분명 서울보다 북쪽이에요. 난방 열기로 도시 하나가 통째로 따뜻해질 수도 없죠. 비밀은 <b>바다와 바람</b>에 있어요 — 랩에서 직접 확인해 봐요!",
          onDone: finish,
        });
      }, 750);
    }
  };
  btn.addEventListener("click", next);
  return () => window.clearTimeout(timer);
}

/* ══════════ L4: 도시 SNS 피드 ══════════ */
const FEED_CARDS = [
  {
    tag: "높은 빌딩 · 정장 · 바쁜 걸음",
    art: `<rect x="0" y="0" width="150" height="86" rx="6" fill="#20304E"/>
      <g><rect x="14" y="18" width="16" height="60" fill="#3E5478"/><rect x="36" y="8" width="20" height="70" fill="#4E668E"/><rect x="62" y="24" width="14" height="54" fill="#3A4E72"/><rect x="82" y="12" width="22" height="66" fill="#56709A"/><rect x="110" y="28" width="16" height="50" fill="#42587E"/></g>
      <g fill="#FFE9B8" opacity=".85"><rect x="40" y="14" width="3" height="3"/><rect x="47" y="22" width="3" height="3"/><rect x="86" y="18" width="3" height="3"/><rect x="94" y="30" width="3" height="3"/><rect x="115" y="34" width="3" height="3"/></g>
      <g stroke="#E8EEF6" stroke-width="1.8" fill="none"><circle cx="130" cy="58" r="4" fill="#FFE8CE"/><path d="M130 62v9M130 64l-4 3M130 64l4 2M130 71l-3 7M130 71l4 7"/></g>
      <circle cx="22" cy="14" r="6.5" fill="#F2C24E"/><text x="22" y="17.5" text-anchor="middle" font-size="8" font-weight="900" fill="#8A5A10">₩</text>`,
  },
  {
    tag: "돌기둥 · 카메라 · 여행 가방",
    art: `<rect x="0" y="0" width="150" height="86" rx="6" fill="#E8DCC2"/>
      <path d="M20 70h110v6H20zM26 26h98v6H26z" fill="#C8B896"/>
      <g fill="#D8CCAC" stroke="#A89870" stroke-width="1"><rect x="34" y="32" width="10" height="38"/><rect x="58" y="32" width="10" height="38"/><rect x="82" y="32" width="10" height="38"/><rect x="106" y="32" width="10" height="38"/></g>
      <path d="M30 26 75 12l45 14z" fill="#D0C0A0" stroke="#A89870" stroke-width="1.2"/>
      <g stroke="#3C4654" stroke-width="1.8" fill="none"><circle cx="130" cy="56" r="4" fill="#FFE8CE"/><path d="M130 60v9M130 62l-5 1M130 62l5 2M130 69l-3 8M130 69l3 8"/><rect x="132" y="61" width="6" height="4.6" rx="1" fill="#3A4658" stroke="none"/></g>`,
  },
  {
    tag: "자전거 · 태양광 · 초록 지붕",
    art: `<rect x="0" y="0" width="150" height="86" rx="6" fill="#D8EEDC"/>
      <rect x="18" y="34" width="44" height="38" rx="3" fill="#E8E2D2" stroke="#B0A890" stroke-width="1.2"/>
      <path d="M14 36 40 20l26 16z" fill="#5A8A2E"/>
      <g fill="#2E4E7E" stroke="#1E3450" stroke-width=".8"><rect x="24" y="24" width="9" height="7" transform="rotate(-31 28 27)"/><rect x="36" y="17" width="9" height="7" transform="rotate(-31 40 20)"/></g>
      <path d="M80 30q6-8 14 0M84 22q5-6 10 0" stroke="#5A8A2E" stroke-width="2" fill="none"/>
      <g stroke="#3C4654" stroke-width="1.8" fill="none">
        <circle cx="100" cy="62" r="7" stroke="#4E7CB8" stroke-width="2"/><circle cx="124" cy="62" r="7" stroke="#4E7CB8" stroke-width="2"/>
        <path d="M100 62l8-14h8l8 14M108 48l-4 14" stroke="#4E7CB8" stroke-width="2"/>
        <circle cx="112" cy="42" r="3.6" fill="#FFE8CE"/><path d="M112 46v7M112 48l-4 3M112 48h6"/>
      </g>`,
  },
];

export function renderCityFeed(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs3-feed", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 다음 도시 게시물 보기" } });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "유럽 여행 계정을 팔로우했더니 피드가 도시 사진으로 가득! <b>탭해서</b> 한 장씩 넘겨 봐요.";

  let idx = 0;
  let timer = 0;
  const show = (): void => {
    const c = FEED_CARDS[idx];
    fig.innerHTML = `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
      <defs><linearGradient id="hs3-phone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#EEF2F8"/></linearGradient></defs>
      <rect x="6" y="6" width="228" height="156" rx="12" fill="#E2E8F2"/>
      <ellipse cx="120" cy="152" rx="70" ry="5" fill="#2A3A5E" opacity=".10"/>
      <rect x="42" y="12" width="156" height="146" rx="14" fill="url(#hs3-phone)" stroke="#B8C2D2" stroke-width="1.6"/>
      <circle cx="58" cy="26" r="6" fill="#E8590C"/><rect x="70" y="22" width="52" height="4" rx="2" fill="#C8D0DC"/><rect x="70" y="29" width="30" height="3" rx="1.5" fill="#D8DEE8"/>
      <g transform="translate(45 40)">${c.art}</g>
      <path d="M56 136q4-5 8 0 -4 6 -8 0z" fill="#E2574C"/>
      <rect x="72" y="132" width="44" height="4" rx="2" fill="#C8D0DC"/><rect x="72" y="140" width="70" height="3.4" rx="1.7" fill="#D8DEE8"/>
      <text x="120" y="120" text-anchor="middle" font-size="8.4" font-weight="800" fill="#5A6B7E">${c.tag}</text>
      <g fill="#B8C2D2"><circle cx="112" cy="151" r="2"/><circle cx="120" cy="151" r="2" fill="#8A98AC"/><circle cx="128" cy="151" r="2"/></g>
    </svg>`;
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  const next = (): void => {
    if (idx >= FEED_CARDS.length - 1) return;
    idx += 1;
    haptic(HAPTIC.tap);
    show();
    if (idx === 1) helper.innerHTML = "이번 도시는 오래된 돌기둥과 카메라… 앞 도시와 분위기가 전혀 달라요. <b>한 장 더!</b>";
    if (idx === FEED_CARDS.length - 1) {
      face("curious");
      helper.innerHTML = "빌딩의 도시, 유적의 도시, 자전거의 도시 — <b>같은 유럽인데 도시마다 사진이 전혀 달라요.</b> 왜 그럴까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "도시마다 발달해 온 역사와 기능, 매력이 서로 달라서",
            "사진을 찍은 계절이 달라서",
            "유럽 도시는 원래 다 비슷한데 필터 때문에 달라 보여서",
          ],
          good: "정확해요! 유럽의 도시들은 역사·문화 배경이 달라 <b>도시마다 다른 기능과 매력</b>을 키워 왔어요. 어떤 명함들을 들고 있는지, 다섯 가지 얼굴을 만나러 가요!",
          bad: "계절이나 필터로는 빌딩 숲이 돌기둥 유적이 되진 않죠. 유럽 도시들은 <b>서로 다른 역사와 기능</b>을 키워 와서 저마다 얼굴이 달라요 — 다섯 가지 얼굴을 만나러 가요!",
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

/* ══════════ L5: 도시 한복판 스키 언덕 ══════════ */
function slopeSvg(zoomOut: boolean): string {
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs3-ssky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CD2F5"/><stop offset="1" stop-color="#E2F2FB"/></linearGradient>
      <linearGradient id="hs3-slope" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ED28A"/><stop offset="1" stop-color="#4E9E5A"/></linearGradient>
      <linearGradient id="hs3-plant" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8E2EE"/><stop offset="1" stop-color="#A8B8CC"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs3-ssky)"/>
    ${zoomOut
      ? `
      <g opacity=".75"><rect x="16" y="96" width="18" height="48" fill="#B8C6D8"/><rect x="204" y="90" width="20" height="54" fill="#B8C6D8"/><rect x="38" y="108" width="14" height="36" fill="#C8D4E2"/></g>
      <ellipse cx="124" cy="148" rx="92" ry="6" fill="#2A3A5E" opacity=".12"/>
      <rect x="58" y="70" width="120" height="74" rx="6" fill="url(#hs3-plant)" stroke="#7E92AC" stroke-width="1.8"/>
      <g fill="#93A6BE"><rect x="70" y="86" width="12" height="16" rx="2"/><rect x="90" y="86" width="12" height="16" rx="2"/><rect x="110" y="86" width="12" height="16" rx="2"/></g>
      <rect x="164" y="30" width="12" height="46" rx="5" fill="#C8D4E2" stroke="#7E92AC" stroke-width="1.6"/>
      <path d="M166 26q4-4 8 0" stroke="#B8C6D8" stroke-width="2" stroke-linecap="round" fill="none" opacity=".0"/>
      <path d="M56 76 170 28l8 10 -114 52z" fill="url(#hs3-slope)" stroke="#3E7E4E" stroke-width="1.6"/>
      <path d="M64 78 166 35" stroke="#E8F6E8" stroke-width="1.2" stroke-dasharray="4 6" opacity=".8"/>
      <g stroke="#3C4654" stroke-width="2.2" fill="none" transform="translate(118 52) rotate(-22)">
        <circle cx="0" cy="-14" r="6" fill="#FFE8CE"/>
        <path d="M0 -8v12M0 -5l-7 5M0 -5l7 3M0 4l-6 8M0 4l7 7"/>
        <path d="M-10 14h20M-8 17h20" stroke-width="1.8"/>
      </g>
      <text x="120" y="158" text-anchor="middle" font-size="8.5" font-weight="800" fill="#4E6A8E">도시 한복판의 거대한 건물 + 초록 슬로프</text>`
      : `
      <path d="M-10 150 210 44l40 0 -240 118z" fill="url(#hs3-slope)"/>
      <path d="M6 138 214 46" stroke="#E8F6E8" stroke-width="1.6" stroke-dasharray="5 7" opacity=".85"/>
      <g stroke="#3C4654" stroke-width="2.6" fill="none" transform="translate(120 84) rotate(-24)">
        <circle cx="0" cy="-16" r="7.5" fill="#FFE8CE"/>
        <path d="M0 -8v14M0 -4l-9 6M0 -4l9 4M0 6l-7 10M0 6l8 9"/>
        <path d="M-12 18h24M-10 22h24" stroke-width="2.2"/>
        <path d="M-9 2l-5 12M9 0l5 12" stroke-width="1.8"/>
      </g>
      <path d="M96 66q-8-2-8-9M150 96q8 2 8 9" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".8"/>
      <g fill="#F2A7C8" opacity=".9"><circle cx="36" cy="140" r="2"/><circle cx="60" cy="150" r="2"/></g>
      <text x="120" y="24" text-anchor="middle" font-size="8.5" font-weight="800" fill="#4E6A8E">친구가 보낸 영상 — 도시에서 스키를?</text>`}
  </svg>`;
}

export function renderSkiSlope(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs3-slope" });
  const btn = el("button", { class: "hs3-flipbtn", attrs: { type: "button" }, text: "줌 아웃" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "유럽에 사는 친구가 영상을 보냈어요 — 도시 한복판 언덕에서 스키를! 이 언덕, 어딘가 이상해요. <b>줌 아웃</b>!";

  let out = false;
  let timer = 0;
  fig.innerHTML = slopeSvg(false);
  btn.addEventListener("click", () => {
    if (out) return;
    out = true;
    haptic(HAPTIC.tap);
    fig.innerHTML = slopeSvg(true);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
    btn.disabled = true;
    btn.classList.add("done");
    face("surprised");
    helper.innerHTML = "언덕이 아니라 <b>거대한 건물의 지붕</b>이었어요! 매끈한 굴뚝까지 달린 이 건물의 정체는 뭘까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "쓰레기를 태워 전기와 난방열을 만드는 발전소",
          "흙을 쌓아 만든 진짜 잔디 언덕",
          "쓰지 않는 낡은 창고 건물",
        ],
        good: "믿기 어렵지만 정답! 덴마크 코펜하겐의 <b>쓰레기 소각장</b>은 지붕이 스키장이에요. 쓰레기를 태운 열로 전기·난방을 공급하고, 시민의 놀이터가 됐죠 — 이런 상상력이 모이는 곳이 지속가능한 도시예요!",
        bad: "매끈한 벽과 굴뚝을 봐요 — 흙 언덕도, 버려진 창고도 아니에요. 이 건물은 <b>쓰레기를 태워 전기와 난방열을 만드는 발전소</b>! 기피 시설을 놀이터로 바꾼 상상력, 지속가능한 도시의 이야기예요.",
        onDone: finish,
      });
    }, 750);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L6: 기차 국경 통과 ══════════ */
function trainSvg(pos: 0 | 1 | 2): string {
  // pos: 0 국경 앞 · 1 첫 국경 통과 · 2 두 번째 국경 통과 — 기차 x 위치만 이동
  const tx = pos === 0 ? 18 : pos === 1 ? 96 : 174;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs3-tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#AED6F2"/><stop offset="1" stop-color="#E6F4FC"/></linearGradient>
      <linearGradient id="hs3-train" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E85A4E"/><stop offset=".6" stop-color="#C8362E"/><stop offset="1" stop-color="#A82420"/></linearGradient>
      <linearGradient id="hs3-field1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8D66E"/><stop offset="1" stop-color="#7EB84E"/></linearGradient>
      <linearGradient id="hs3-field2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8D48A"/><stop offset="1" stop-color="#CBB05E"/></linearGradient>
      <linearGradient id="hs3-field3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ED0A8"/><stop offset="1" stop-color="#6EAE7E"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs3-tsky)"/>
    <rect x="6" y="104" width="76" height="40" fill="url(#hs3-field1)"/>
    <rect x="82" y="104" width="76" height="40" fill="url(#hs3-field2)"/>
    <rect x="158" y="104" width="76" height="40" fill="url(#hs3-field3)"/>
    <path d="M30 100q4-8 10 0M52 98q4-8 10 0" stroke="#4E8A2E" stroke-width="2" fill="none"/>
    <path d="M100 96l6-10 6 10zM120 98l5-8 5 8" fill="#C8A83E"/>
    <path d="M186 96q6-10 12 0M206 98q5-8 10 0" stroke="#3E7E5E" stroke-width="2" fill="none"/>
    <rect x="6" y="144" width="228" height="8" fill="#8A7A5E"/>
    <path d="M6 146h228M6 150h228" stroke="#5E5240" stroke-width="1.2"/>
    <g>
      <rect x="79" y="60" width="6" height="86" rx="2" fill="#C8D0DC" stroke="#8A98AC" stroke-width="1.2"/>
      <circle cx="82" cy="52" r="11" fill="#20304E" stroke="#4E668E" stroke-width="1.4"/>
      <g fill="#FFD98A">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<circle cx="${82 + 7 * Math.cos((i * Math.PI) / 6)}" cy="${52 + 7 * Math.sin((i * Math.PI) / 6)}" r="1.05"/>`).join("")}</g>
    </g>
    <g>
      <rect x="155" y="60" width="6" height="86" rx="2" fill="#C8D0DC" stroke="#8A98AC" stroke-width="1.2"/>
      <circle cx="158" cy="52" r="11" fill="#20304E" stroke="#4E668E" stroke-width="1.4"/>
      <g fill="#FFD98A">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<circle cx="${158 + 7 * Math.cos((i * Math.PI) / 6)}" cy="${52 + 7 * Math.sin((i * Math.PI) / 6)}" r="1.05"/>`).join("")}</g>
    </g>
    <ellipse cx="${tx + 26}" cy="146" rx="34" ry="4" fill="#2A3A5E" opacity=".16"/>
    <g class="hs3-trainbody" transform="translate(${tx} 112)">
      <rect x="0" y="0" width="52" height="26" rx="6" fill="url(#hs3-train)" stroke="#7E1814" stroke-width="1.6"/>
      <path d="M52 6q10 2 10 12v8H52z" fill="url(#hs3-train)" stroke="#7E1814" stroke-width="1.6"/>
      <g fill="#D8ECF8" stroke="#7E1814" stroke-width="1"><rect x="6" y="6" width="10" height="9" rx="2"/><rect x="21" y="6" width="10" height="9" rx="2"/><rect x="36" y="6" width="10" height="9" rx="2"/></g>
      <circle cx="12" cy="27" r="4.6" fill="#2E3A50" stroke="#101820" stroke-width="1.2"/>
      <circle cx="40" cy="27" r="4.6" fill="#2E3A50" stroke="#101820" stroke-width="1.2"/>
      <ellipse cx="14" cy="4" rx="9" ry="2.4" fill="#fff" opacity=".4"/>
      <g stroke="#3C4654" stroke-width="1.5" fill="none"><circle cx="26" cy="10" r="2.6" fill="#FFE8CE"/><path d="M23 13q3 3 6 0" /></g>
    </g>
    ${pos > 0 ? `<g opacity=".9"><path d="M${tx - 8} 120q-6 2-10 0" stroke="#B8C6D8" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M${tx - 14} 126q-5 1-8 0" stroke="#B8C6D8" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".7"/></g>` : ""}
    <text x="120" y="24" text-anchor="middle" font-size="8.5" font-weight="800" fill="#4E6A8E">${pos === 0 ? "곧 국경입니다" : pos === 1 ? "국경 통과! 아무도 안 왔어요" : "두 번째 국경도 통과!"}</text>
  </svg>`;
}

export function renderTrainBorder(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs3-train" });
  const btn = el("button", { class: "hs3-flipbtn", attrs: { type: "button" }, text: "기차 출발!" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "유럽 배낭여행 — 기차로 옆 나라까지 가요. 여권을 손에 꼭 쥐고… <b>출발</b>!";

  let pos: 0 | 1 | 2 = 0;
  let timer = 0;
  fig.innerHTML = trainSvg(0);
  const next = (): void => {
    if (pos >= 2) return;
    pos = (pos + 1) as 1 | 2;
    haptic(HAPTIC.tap);
    fig.innerHTML = trainSvg(pos);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
    if (pos === 1) {
      btn.textContent = "계속 달리기";
      helper.innerHTML = "국경 표지판을 지났는데… <b>아무도 여권을 확인하러 오지 않아요?</b> 다음 나라로 계속 가 봐요.";
    } else {
      btn.disabled = true;
      btn.classList.add("done");
      face("surprised");
      helper.innerHTML = "나라를 두 번이나 넘었는데 여권은 가방 속 그대로! <b>왜 아무도 검사하지 않을까요?</b>";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "국경을 자유롭게 오가기로 나라들끼리 약속했기 때문에",
            "기차가 너무 빨라 검사원이 못 탔기 때문에",
            "여권 검사는 원래 비행기에서만 하기 때문에",
          ],
          good: "정확해요! 유럽의 여러 나라는 <b>국경 검문 없이 자유롭게 오가기로 약속</b>했어요(솅겐 조약). 이 약속을 만든 '하나의 유럽' 이야기 — 유럽연합을 만나러 가요!",
          bad: "기차 속도나 교통수단의 문제가 아니에요 — 걸어서 넘어도 검사가 없답니다. 유럽 나라들이 <b>국경을 자유롭게 오가기로 약속</b>했기 때문이죠. 그 약속의 이름과 이야기를 만나러 가요!",
          onDone: finish,
        });
      }, 750);
    }
  };
  btn.addEventListener("click", next);
  return () => window.clearTimeout(timer);
}

/* ══════════ L7: 조 추첨 — 한 나라에서 유니폼 4벌 ══════════ */
const SHIRTS = [
  { name: "잉글랜드", body: "#F4F6FA", trim: "#C0392E" },
  { name: "스코틀랜드", body: "#2E4E9E", trim: "#F4F6FA" },
  { name: "웨일스", body: "#C0392E", trim: "#2E9E5B" },
  { name: "북아일랜드", body: "#2E8A4C", trim: "#F4F6FA" },
];

function shirtsSvg(count: number): string {
  const shirt = (x: number, i: number): string => {
    const sh = SHIRTS[i];
    const on = i < count;
    return `<g transform="translate(${x} 74)" opacity="${on ? 1 : 0.16}" class="${on ? "hs3-shirt-on" : ""}">
      <path d="M-16 -12l7-6q9 5 18 0l7 6-5 7-3-2v21h-16v-21l-3 2z" fill="${sh.body}" stroke="#2E3A50" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M-9 -18q9 5 18 0" stroke="${sh.trim}" stroke-width="2.4" fill="none"/>
      <path d="M-8 12h16" stroke="${sh.trim}" stroke-width="2.2"/>
      <ellipse cx="-6" cy="-8" rx="4.6" ry="1.8" fill="#fff" opacity=".35"/>
      <text x="0" y="28" text-anchor="middle" font-size="7.6" font-weight="800" fill="#3E4A5A">${on ? sh.name : "?"}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs3-stage" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2A48"/><stop offset="1" stop-color="#2E3E66"/></linearGradient>
      <linearGradient id="hs3-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E5E86"/><stop offset="1" stop-color="#3A4870"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs3-stage)"/>
    <g fill="#FFE9B8" opacity=".8"><circle cx="30" cy="22" r="1.2"/><circle cx="72" cy="16" r="1"/><circle cx="120" cy="24" r="1.3"/><circle cx="170" cy="16" r="1"/><circle cx="210" cy="24" r="1.2"/></g>
    <text x="120" y="40" text-anchor="middle" font-size="10" font-weight="900" fill="#D8E2F8">국제 대회 조 추첨</text>
    <rect x="20" y="52" width="200" height="66" rx="10" fill="url(#hs3-desk)" stroke="#20304E" stroke-width="1.6"/>
    ${SHIRTS.map((_, i) => shirt(48 + i * 48, i)).join("")}
    <ellipse cx="120" cy="146" rx="86" ry="5" fill="#0A1020" opacity=".5"/>
    <g stroke="#3C4654" stroke-width="2.2" fill="none">
      <circle cx="120" cy="128" r="6.5" fill="#FFE8CE"/>
      <path d="M120 134v12M120 138l-8 3M120 138l8 3M120 146l-6 10M120 146l6 10"/>
    </g>
    <text x="120" y="160" text-anchor="middle" font-size="8" font-weight="700" fill="#8FA2C8">${count < 4 ? "탭해서 다음 팀 공개" : "…전부 한 나라에서 왔다고?"}</text>
  </svg>`;
}

export function renderFourShirts(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs3-shirts", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 다음 팀 공개" } });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "국제 축구 대회 조 추첨 방송! 참가 팀 유니폼이 하나씩 공개돼요. <b>탭</b>해서 넘겨 봐요.";

  let count = 1;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = shirtsSvg(count);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  const next = (): void => {
    if (count >= 4) return;
    count += 1;
    haptic(HAPTIC.tap);
    show();
    if (count === 2) helper.innerHTML = "잉글랜드에 이어 스코틀랜드… 어? 둘 다 <b>영국</b> 아니었나요? <b>계속 탭!</b>";
    if (count === 4) {
      face("surprised");
      helper.innerHTML = "잉글랜드·스코틀랜드·웨일스·북아일랜드 — <b>영국 하나에서 네 팀</b>이 나왔어요! 한 나라인데 왜 대표팀이 4개일까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "역사와 문화가 서로 다른 네 지역이 연합해 이룬 나라이기 때문에",
            "영국은 인구가 많아 팀을 넷으로 나눠야 하기 때문에",
            "축구 협회가 실수로 팀을 네 개 등록했기 때문에",
          ],
          good: "정확해요! 영국은 <b>잉글랜드·스코틀랜드·웨일스·북아일랜드</b> — 역사·문화가 다른 네 지역이 연합한 나라예요. 이 '서로 다름'이 유럽 곳곳의 통합과 분리 이야기로 이어진답니다.",
          bad: "인구 규모나 실수가 아니에요 — 영국은 원래 <b>역사·문화가 다른 네 지역이 연합한 나라</b>라 축구도 각자 대표팀으로 나와요. 이 '서로 다름'이 유럽의 통합과 분리 이야기의 열쇠랍니다.",
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
