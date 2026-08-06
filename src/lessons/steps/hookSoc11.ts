// hookSoc11 — 사회 Ⅺ(일상생활과 법) 훅 장면 6종(L4는 만화 「우산이 된 법」이 도입 담당).
// hook.ts가 renderSoc11 서브 디스패처(hookSoc10 문법 — 모르는 장면이면 null)로 위임한다.
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수, 스틱맨만
// 손그림 라인. CSS는 hs8-frame·hs8-btn·hs8-noti 완전 재사용(신규 클래스 0 — soc.css 수정 불필요).
//   morninglaw  L1 — 평범한 아침 속 숨은 법(일기예보·급식·횡단보도)
//   goddess     L2 — 정의의 여신상, 두 손의 비밀(저울·칼)
//   twoloans    L3 — 똑같이 "돈을 안 갚았"는데 다른 법?(민법·형법 갈림)
//   jarcourt    L5 — 밭에서 나온 요술 항아리, 누구의 것?(재판의 필요)
//   oddtrial    L6 — 이상한 나라의 재판, 뭔가 이상한 세 가지(공정 장치 부재)
//   flipverdict L7 — 대법원에서 뒤집힌 판결(심급 제도)
// 민감 가드(법 단원): 실사건·실명 0(전부 가상·동화 각색), 범죄 장면 재현 0(결과·서류·저울로만),
// 무성별 스틱맨, 예측 choices[0]=정답·good≠bad 공용 규칙, 소재 이름은 도입에서 먼저 소개.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type HookOpt = { choices?: string[] };

const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

/** 미니 스틱맨(팔·표정 옵션 — socFigures 계열 공용 문법) */
function man(x: number, y: number, opts: { arm?: "up" | "down" | "out"; mood?: "ok" | "sad" | "joy" | "wow"; r?: number } = {}): string {
  const r = opts.r ?? 6.4;
  const arm = opts.arm ?? "out";
  const arms =
    arm === "up"
      ? `M${x} ${y + r + 4}l-${r + 2} -7M${x} ${y + r + 4}l${r + 2} -9`
      : arm === "down"
        ? `M${x} ${y + r + 4}l-${r + 1} ${r + 1}M${x} ${y + r + 4}l${r + 1} ${r + 1}`
        : `M${x} ${y + r + 4}l-${r + 2} 4M${x} ${y + r + 4}l${r + 2} 4`;
  const mood = opts.mood ?? "ok";
  const face =
    mood === "sad"
      ? `<circle cx="${x - 2.1}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2.1}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 2} ${y + 3.6}q2-1.6 4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`
      : mood === "joy"
        ? `<path d="M${x - 3.2} ${y - 1.2}q1.3-1.5 2.6 0M${x + 0.6} ${y - 1.2}q1.3-1.5 2.6 0" stroke="#3C4654" stroke-width="1.2" fill="none"/><path d="M${x - 2.4} ${y + 2.6}q2.4 2.2 4.8 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>`
        : mood === "wow"
          ? `<circle cx="${x - 2.1}" cy="${y - 1}" r="1.5" fill="none" stroke="#3C4654" stroke-width="1.1"/><circle cx="${x + 2.1}" cy="${y - 1}" r="1.5" fill="none" stroke="#3C4654" stroke-width="1.1"/><ellipse cx="${x}" cy="${y + 3.4}" rx="1.5" ry="2" fill="none" stroke="#3C4654" stroke-width="1.1"/>`
          : `<circle cx="${x - 2.1}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2.1}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 1.8} ${y + 3}q1.8 1.3 3.6 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`;
  return `<g ${STICK}><circle cx="${x}" cy="${y}" r="${r}" fill="#F6EFE4"/>
    <path d="M${x} ${y + r}v${r + 6}M${x} ${y + r * 2 + 6}l-${r - 1} ${r + 3}M${x} ${y + r * 2 + 6}l${r - 1} ${r + 3}${arms}"/></g>${face}`;
}

const HS11_DEFS = `<defs>
  <linearGradient id="hs11-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2F6"/></linearGradient>
  <linearGradient id="hs11-brown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B07E2E"/><stop offset=".55" stop-color="#8C5A16"/><stop offset="1" stop-color="#6E4610"/></linearGradient>
  <linearGradient id="hs11-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECC26A"/><stop offset="1" stop-color="#A8781E"/></linearGradient>
  <linearGradient id="hs11-stone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#EFE7D6"/><stop offset=".5" stop-color="#E0D4BC"/><stop offset="1" stop-color="#C8B896"/></linearGradient>
  <linearGradient id="hs11-jar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8CFA0"/><stop offset=".55" stop-color="#C8A360"/><stop offset="1" stop-color="#A8781E"/></linearGradient>
</defs>`;

function wrap145(inner: string): string {
  return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${HS11_DEFS}
    <ellipse cx="120" cy="139" rx="96" ry="5" fill="#2A3A5E" opacity=".1"/>${inner}</svg>`;
}

/* ══════════ L1: 평범한 아침 속 숨은 법 ══════════ */
function morninglawSvg(beat: number, found: number): string {
  // beat 0=날씨 확인·1=급식·2=횡단보도, found = 발견한 법 개수(도장)
  // 도장 스택은 좌상단 고정 — 우상단은 3비트(횡단보도)의 신호등 자리라 겹친다(눈검수 교정)
  const stamps = Array.from({ length: found }, (_, i) => `
    <g transform="rotate(${-8 + i * 7} ${26 + (i % 2) * 6} ${20 + i * 17})" class="${i === found - 1 ? "hs8-noti" : ""}">
      <circle cx="${26 + (i % 2) * 6}" cy="${20 + i * 17}" r="8.6" fill="none" stroke="#8C5A16" stroke-width="1.8"/>
      <path d="M${22 + (i % 2) * 6} ${20 + i * 17}l2.6 2.8 4.4-5.4" stroke="#8C5A16" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>`).join("");
  const scenes = [
    // 날씨 확인(기상 예보)
    `<rect x="52" y="26" width="80" height="52" rx="7" fill="#39455C" stroke="#232C3A" stroke-width="1.8"/>
     <rect x="58" y="32" width="68" height="40" rx="4" fill="#EAF2FA"/>
     <circle cx="78" cy="48" r="9" fill="#F2C24E"/>
     <path d="M92 56q4-8 12-6 2-6 9-4 6 1 6 7 4 1 3 6-1 4-6 4H96q-6 0-4-7z" fill="#FFF" stroke="#B8C8D8" stroke-width="1.3"/>
     <ellipse cx="66" cy="36" rx="8" ry="2" fill="#fff" opacity=".5"/>
     ${man(170, 92, { mood: "ok", arm: "out" })}
     <path d="M150 74q-8 8-14 6" stroke="#8A93A6" stroke-width="1.6" fill="none" stroke-dasharray="3 3"/>`,
    // 급식
    `<rect x="48" y="86" width="144" height="12" rx="4" fill="url(#hs11-brown)" opacity=".85"/>
     <rect x="62" y="66" width="46" height="18" rx="4" fill="url(#hs11-stone)" stroke="#A89878" stroke-width="1.4"/>
     <circle cx="76" cy="75" r="5.4" fill="#E8A20C"/><circle cx="92" cy="75" r="4.6" fill="#5C940D"/>
     <rect x="128" y="64" width="50" height="20" rx="4" fill="url(#hs11-paper)" stroke="#B8C2CE" stroke-width="1.4"/>
     <path d="M136 72h34M136 78h22" stroke="#B8C2CE" stroke-width="1.6" stroke-linecap="round"/>
     ${man(120, 36, { mood: "joy", arm: "out" })}`,
    // 횡단보도
    `<rect x="30" y="96" width="180" height="30" rx="4" fill="#5A6478"/>
     ${[0, 1, 2, 3, 4].map((i) => `<rect x="${44 + i * 34}" y="100" width="18" height="22" rx="2" fill="#EAF0F6"/>`).join("")}
     <rect x="186" y="38" width="16" height="34" rx="4" fill="#39455C"/>
     <circle cx="194" cy="48" r="5.4" fill="#3E4A5C"/><circle cx="194" cy="62" r="5.4" fill="#41C464" class="hs8-noti"/>
     <rect x="191" y="72" width="6" height="26" rx="2.4" fill="#39455C"/>
     ${man(72, 66, { mood: "ok", arm: "out" })}`,
  ];
  return wrap145(`${scenes[beat]}${stamps}`);
}

export function renderMorningLaw(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "다음 장면 보기 (1/3)" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = morninglawSvg(0, 1);
  helper.innerHTML = "어느 평범한 아침 — 일어나자마자 <b>일기 예보</b>부터 확인했어요. 그런데 이 예보, 나라가 법에 따라 만들어 알려 주는 거래요. 하루를 계속 따라가 봐요!";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.select);
    if (stage === 1) {
      fig.innerHTML = morninglawSvg(1, 2);
      helper.innerHTML = "점심 <b>급식</b> 시간 — 식단과 위생도 법이 정한 기준을 따라요. 도장이 하나 더 찍혔네요!";
      btn.textContent = "다음 장면 보기 (2/3)";
    } else {
      fig.innerHTML = morninglawSvg(2, 3);
      btn.textContent = "하루 관찰 완료";
      btn.classList.add("done");
      btn.disabled = true;
      face("surprised");
      helper.innerHTML = "하굣길 <b>횡단보도</b> — 신호도, 차가 멈추는 것도 법이 정한 규칙이에요. 잠깐, 오늘 하루 이런 도장이 대체 몇 개나 찍힌 걸까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "셀 수 없이 많다 — 생활 곳곳이 법과 닿아 있다",
            "법을 어긴 적이 없으니 0개다",
            "재판을 받을 때만 법을 만난다",
          ],
          good: "맞아요! 예보·급식·신호등처럼 <b>어기지 않아도</b> 우리 하루는 법과 촘촘히 닿아 있어요 — 지난 시간 예고했던 '길 위의 약속'의 정체, 이제 만나러 가요!",
          bad: "법은 어겼을 때만 나타나는 게 아니에요 — 오늘 본 예보·급식·신호등 도장을 세어 봐요. 평범한 하루 곳곳에 법이 숨어 있답니다. 그 정체를 만나러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L2: 정의의 여신상 — 두 손의 비밀 ══════════ */
function goddessSvg(left: boolean, right: boolean): string {
  // 좌대 위 여신상(중립 로브 스틱 조각상) — left: 저울 공개, right: 칼 공개
  const scale = left
    ? `<g class="hs8-noti">
        <path d="M76 52v-8" stroke="#6E4610" stroke-width="2" stroke-linecap="round"/>
        <path d="M58 44h36" stroke="#6E4610" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M58 44v5M50 49h16m-16 0q0 6 8 6t8-6" fill="none" stroke="#6E4610" stroke-width="1.6"/>
        <path d="M50 49q0 6 8 6t8-6z" fill="url(#hs11-gold)"/>
        <path d="M94 44v5M86 49h16m-16 0q0 6 8 6t8-6" fill="none" stroke="#6E4610" stroke-width="1.6"/>
        <path d="M86 49q0 6 8 6t8-6z" fill="url(#hs11-gold)"/>
      </g>`
    : `<g><circle cx="76" cy="48" r="13" fill="#E6DECE" stroke="#B8A888" stroke-width="1.6" stroke-dasharray="4 4"/><text x="76" y="52.4" text-anchor="middle" font-size="12" font-weight="900" fill="#A89878">?</text></g>`;
  const sword = right
    ? `<g class="hs8-noti">
        <path d="M164 34v26" stroke="#8A93A6" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M164 30l3.4 6h-6.8z" fill="#B8C2CE"/>
        <path d="M156 60h16" stroke="#6E4610" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M164 60v9" stroke="url(#hs11-gold)" stroke-width="3.4" stroke-linecap="round"/>
      </g>`
    : `<g><circle cx="164" cy="48" r="13" fill="#E6DECE" stroke="#B8A888" stroke-width="1.6" stroke-dasharray="4 4"/><text x="164" y="52.4" text-anchor="middle" font-size="12" font-weight="900" fill="#A89878">?</text></g>`;
  return wrap145(`
    <rect x="92" y="118" width="56" height="14" rx="3" fill="url(#hs11-stone)" stroke="#A89878" stroke-width="1.6"/>
    <rect x="100" y="108" width="40" height="10" rx="2" fill="url(#hs11-stone)" stroke="#A89878" stroke-width="1.3"/>
    <g ${STICK}>
      <circle cx="120" cy="42" r="8" fill="#F6EFE4"/>
      <path d="M120 50v22"/>
      <path d="M120 56l-24-8M120 56l24-8"/>
      <path d="M108 108h24l-4-36h-16z" fill="#EFE7D6" stroke="#3C4654" stroke-width="1.8"/>
    </g>
    <path d="M112 39q2-2 4 0M124 39q2-2 4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>
    <rect x="108" y="30" width="24" height="4.6" rx="2.3" fill="#E6DECE" stroke="#B8A888" stroke-width="1.1"/>
    ${scale}${sword}
    ${man(36, 108, { mood: "wow", arm: "up", r: 5.8 })}
    <ellipse cx="104" cy="112" rx="8" ry="1.8" fill="#fff" opacity=".5"/>`);
}

export function renderGoddess(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "왼손 공개하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = goddessSvg(false, false);
  helper.innerHTML = "법원 앞에서 만난 <b>정의의 여신상</b> — 두 손에 무언가를 들고 있는데, 가려져 있네요. 하나씩 공개해 봐요!";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.select);
    if (stage === 1) {
      fig.innerHTML = goddessSvg(true, false);
      helper.innerHTML = "왼손엔 <b>저울</b>! 양쪽 접시가 나란한 양팔 저울이에요. 그럼 오른손엔 뭐가 있을까요?";
      btn.textContent = "오른손 공개하기";
    } else {
      fig.innerHTML = goddessSvg(true, true);
      btn.textContent = "두 손 공개 완료";
      btn.classList.add("done");
      btn.disabled = true;
      face("surprised");
      helper.innerHTML = "오른손엔 <b>칼</b> — 법을 어기면 국가가 제재한다는 <b>강제성</b>의 상징이래요. 그렇다면 왼손의 저울은 무엇을 뜻할까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "어느 쪽으로도 치우치지 않는 공평함",
            "무거운 물건을 재는 정확한 눈금",
            "저울처럼 튼튼한 법원 건물",
          ],
          good: "맞아요! 수평을 이룬 저울은 누구든 <b>치우침 없이 공평하게</b> 판단한다는 뜻 — 법이 이루려는 '정의'의 상징이에요. 법이 무엇을 실현하려 하는지 배우러 가요!",
          bad: "무게나 건물 이야기가 아니에요 — 양쪽 접시가 <b>나란한</b> 모습에 답이 있어요. 어느 쪽으로도 기울지 않는 공평함, 그게 법이 이루려는 정의랍니다!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L3: 똑같이 "돈을 안 갚았"는데 다른 법? ══════════ */
function twoloansSvg(reveal: number): string {
  // reveal 0=두 상황, 1=A 공개(형편), 2=B 공개(작정)
  const card = (x: number, tone: string, open: boolean, kind: "a" | "b"): string => `
    <g${open ? ` class="hs8-noti"` : ""}>
      <rect x="${x - 48}" y="26" width="96" height="92" rx="8" fill="url(#hs11-paper)" stroke="${open ? tone : "#B8C2CE"}" stroke-width="2"/>
      ${man(x, 52, { mood: open && kind === "b" ? "ok" : "sad", r: 6 })}
      ${kind === "a"
        ? open
          ? `<path d="M${x - 26} 92q8-10 18-6" stroke="#8A93A6" stroke-width="1.6" fill="none"/>
             <rect x="${x - 4}" y="84" width="30" height="20" rx="3" fill="#FFF" stroke="#8A93A6" stroke-width="1.4"/>
             <path d="M${x + 2} 92h18M${x + 2} 97h12" stroke="#B8C2CE" stroke-width="1.5" stroke-linecap="round"/>
             <path d="M${x - 34} 100q4-4 8-1" stroke="#C0871C" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
          : `<text x="${x}" y="98" text-anchor="middle" font-size="11" font-weight="900" fill="#A8B2C2">?</text>`
        : open
          ? `<g transform="rotate(-8 ${x} 94)"><ellipse cx="${x}" cy="94" rx="17" ry="11" fill="#FFF" stroke="#8A93A6" stroke-width="1.5"/><path d="M${x - 8} 90q4-5 8-1q4 4 8 0" stroke="#C0392E" stroke-width="1.6" fill="none"/></g>
             <path d="M${x - 30} 108l6-3M${x + 30} 108l-6-3" stroke="#C0392E" stroke-width="1.6" stroke-linecap="round"/>`
          : `<text x="${x}" y="98" text-anchor="middle" font-size="11" font-weight="900" fill="#A8B2C2">?</text>`}
    </g>
    <circle cx="${x - 34}" cy="40" r="9" fill="${tone}"/>
    <text x="${x - 34}" y="44" text-anchor="middle" font-size="9.6" font-weight="900" fill="#FFF">${kind === "a" ? "A" : "B"}</text>`;
  return wrap145(`
    ${card(68, "#C0871C", reveal >= 1, "a")}
    ${card(172, "#8A5EC0", reveal >= 2, "b")}
    <text x="120" y="136" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">약속한 날이 지나도 돈을 갚지 않은 두 사람</text>`);
}

export function renderTwoLoans(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "A의 사정 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = twoloansSvg(0);
  helper.innerHTML = "돈을 빌리고 <b>약속한 날이 지나도 갚지 않은</b> 두 사람, A와 B — 겉보기엔 똑같은 상황이에요. 속사정을 하나씩 열어 봐요.";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.select);
    if (stage === 1) {
      fig.innerHTML = twoloansSvg(1);
      helper.innerHTML = "A의 사정 — 갚으려 했지만 <b>형편이 어려워져</b> 못 갚고 있어요. 그럼 B는요?";
      btn.textContent = "B의 사정 보기";
    } else {
      fig.innerHTML = twoloansSvg(2);
      btn.textContent = "속사정 확인 완료";
      btn.classList.add("done");
      btn.disabled = true;
      face("surprised");
      helper.innerHTML = "B의 사정 — 빌릴 때부터 <b>갚을 생각이 아예 없었어요</b>. 똑같이 '안 갚은' 두 사람, 법도 똑같이 다룰까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "다르다 — 하나는 개인 간 다툼, 하나는 남을 속인 범죄로 다룬다",
            "같다 — 안 갚았다는 결과가 같으니 같은 법을 적용한다",
            "둘 다 법과는 상관없는 개인 사정이다",
          ],
          good: "정확해요! A는 개인 간 약속(계약)의 문제라 <b>민법</b>이, 처음부터 속인 B는 범죄라 <b>형법</b>이 다뤄요 — 같은 '안 갚음'도 법의 구역이 갈리죠. 법의 지도를 펼치러 가요!",
          bad: "결과는 같아 보여도 속사정이 달라요 — 형편 탓인 A는 개인 간 다툼(민법), 처음부터 속인 B는 범죄(형법)! 법에도 담당 구역이 있답니다. 그 지도를 보러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L5: 밭에서 나온 요술 항아리 ══════════ */
function jarcourtSvg(stage: number): string {
  // 0=밭 파기 전, 1=항아리 발견, 2=두 사람 주장
  const jarArt = stage >= 1
    ? `<g class="${stage === 1 ? "hs8-noti" : ""}">
        <path d="M111 86q-3-11 3-15h12q6 4 3 15 2 9-9 9t-9-9z" fill="url(#hs11-jar)" stroke="#6E4610" stroke-width="1.7" stroke-linejoin="round"/>
        <ellipse cx="120" cy="71" rx="7.4" ry="2.6" fill="#B07E2E" stroke="#6E4610" stroke-width="1.4"/>
        <ellipse cx="116" cy="80" rx="2.6" ry="4" fill="#fff" opacity=".35"/>
        ${stage === 1 ? `<path d="M104 60l-4-4M136 60l4-4M120 54v-6" stroke="#E2A020" stroke-width="1.8" stroke-linecap="round"/>` : ""}
      </g>`
    : "";
  const people = stage >= 2
    ? `${man(56, 66, { mood: "ok", arm: "up", r: 6 })}
       ${man(184, 66, { mood: "ok", arm: "up", r: 6 })}
       <text x="56" y="104" text-anchor="middle" font-size="8" font-weight="800" fill="#5A6478">밭을 산 농부</text>
       <text x="184" y="104" text-anchor="middle" font-size="8" font-weight="800" fill="#5A6478">밭을 판 옛 주인</text>
       <path d="M74 72q20-10 34-4M166 72q-20-10-34-4" stroke="#C0871C" stroke-width="1.8" fill="none" stroke-dasharray="4 3"/>`
    : `${man(64, 70, { mood: "ok", arm: "down", r: 6 })}
       <path d="M76 84q10 6 18 8" stroke="#8A6A3E" stroke-width="2.2" stroke-linecap="round"/>
       <path d="M92 92l8 3" stroke="#8A6A3E" stroke-width="2.2" stroke-linecap="round"/>
       <path d="M98 96l7-2-2 6z" fill="#B8C2CE" stroke="#5A6478" stroke-width="1.2"/>`;
  return wrap145(`
    <path d="M18 112q52-16 102-10t102 10v20H18z" fill="#C8A360" opacity=".5"/>
    <path d="M30 116q40-8 90-6t90 6" stroke="#8A6A3E" stroke-width="1.6" fill="none" opacity=".6"/>
    ${jarArt}${people}
    <text x="120" y="138" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${stage >= 2 ? "\"항아리는 내 것!\" — 두 목소리가 맞섰어요" : stage === 1 ? "흙 속에서 반짝이는 항아리가!" : "산 지 얼마 안 된 밭을 일구는 중…"}</text>`);
}

export function renderJarCourt(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "밭 일구기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = jarcourtSvg(0);
  helper.innerHTML = "동화 나라의 농부가 <b>새로 산 밭</b>을 일구고 있어요 — 옛날이야기 「요술 항아리」의 그 장면이죠. 흙을 뒤집어 봐요!";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.select);
    if (stage === 1) {
      fig.innerHTML = jarcourtSvg(1);
      helper.innerHTML = "이럴 수가 — 흙 속에서 <b>요술 항아리</b>가 나왔어요! 넣은 것이 두 배가 되는 신비한 항아리래요.";
      btn.textContent = "소문이 퍼진 뒤…";
    } else {
      fig.innerHTML = jarcourtSvg(2);
      btn.textContent = "다툼 확인 완료";
      btn.classList.add("done");
      btn.disabled = true;
      face("surprised");
      helper.innerHTML = "소문을 들은 <b>밭을 판 옛 주인</b>이 달려왔어요 — \"밭은 팔았지만 항아리는 안 팔았다!\" vs \"밭에서 나왔으니 내 것!\" 이 다툼, 어떻게 끝내야 할까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "법원의 재판으로 옳고 그름을 가린다",
            "목소리 큰 쪽이 갖는다",
            "힘이 센 쪽이 갖는다",
          ],
          good: "맞아요! 목소리나 힘으로 정하면 또 다른 다툼이 자라날 뿐 — 법원이 <b>법을 적용해 옳고 그름을 가리는 재판</b>이 평화로운 해결의 길이에요. 동화 나라 법정을 열러 가요!",
          bad: "목소리와 힘으로 정하는 순간, 이긴 쪽 마음대로인 세상이 돼요 — 법원이 법을 적용해 가려 주는 <b>재판</b>이 다툼을 평화롭게 끝내는 길이랍니다. 법정을 열러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L6: 이상한 나라의 재판 ══════════ */
function oddtrialSvg(found: Set<string>): string {
  const judge = found.has("judge");
  const curtain = found.has("curtain");
  const evid = found.has("evid");
  return wrap145(`
    <rect x="24" y="14" width="192" height="112" rx="8" fill="#F4EFE6" stroke="#C8B896" stroke-width="1.8"/>
    <g data-spot="judge" style="cursor:pointer">
      ${man(120, 40, { mood: "joy", r: 6.4 })}
      <rect x="86" y="58" width="68" height="18" rx="4" fill="url(#hs11-brown)" stroke="#6E4E26" stroke-width="1.6"/>
      ${man(158, 44, { mood: "joy", r: 5 })}
      <path d="M136 44q8-4 14 0" stroke="#C0871C" stroke-width="1.8" fill="none" stroke-dasharray="3 3"/>
      ${judge ? `<circle cx="146" cy="38" r="17" fill="none" stroke="#C0392E" stroke-width="2.2" class="hs8-noti"/>` : ""}
    </g>
    <g data-spot="curtain" style="cursor:pointer">
      <rect x="30" y="88" width="180" height="32" fill="url(#hs11-paper)" opacity=".7"/>
      <rect x="30" y="86" width="180" height="34" fill="#8FA0B8" opacity=".9"/>
      <path d="M46 88v30M78 88v30M110 88v30M142 88v30M174 88v30M206 88v30" stroke="#5A6B86" stroke-width="1.5" opacity=".6"/>
      <text x="120" y="106" text-anchor="middle" font-size="8.4" font-weight="800" fill="#EEF2F8">방청석 — 가림막</text>
      ${curtain ? `<circle cx="120" cy="103" r="16" fill="none" stroke="#C0392E" stroke-width="2.2" class="hs8-noti"/>` : ""}
    </g>
    <g data-spot="evid" style="cursor:pointer">
      <g transform="rotate(-8 56 62)">
        <rect x="38" y="50" width="36" height="24" rx="4" fill="#FFF" stroke="#8A93A6" stroke-width="1.4"/>
        <path d="M46 58q5-5 10 0q5 5 10 0" stroke="#8A93A6" stroke-width="1.5" fill="none"/>
        <ellipse cx="56" cy="46" rx="9" ry="4.6" fill="#FFF" stroke="#B8C2CE" stroke-width="1.2"/>
      </g>
      <text x="56" y="86" text-anchor="middle" font-size="7.6" font-weight="800" fill="#5A6478">증거 대신 소문</text>
      ${evid ? `<circle cx="56" cy="62" r="17" fill="none" stroke="#C0392E" stroke-width="2.2" class="hs8-noti"/>` : ""}
    </g>`);
}

export function renderOddTrial(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  const found = new Set<string>();
  let timer = 0;
  const names: Record<string, string> = {
    judge: "판사가 한쪽 당사자와 <b>단짝 친구</b>래요 — 벌써 그쪽으로 마음이 기울어 있죠",
    curtain: "방청석이 <b>가림막</b>으로 막혀 있어요 — 재판을 아무도 지켜볼 수 없어요",
    evid: "책상 위엔 증거 대신 <b>소문 쪽지</b>뿐이에요 — \"그 사람이 그랬대\"",
  };
  const render = (): void => {
    fig.innerHTML = oddtrialSvg(found);
    fig.querySelectorAll("[data-spot]").forEach((g) => {
      g.addEventListener("click", () => {
        const key = (g as HTMLElement).dataset.spot!;
        if (found.has(key)) return;
        found.add(key);
        haptic(HAPTIC.select);
        render();
        helper.innerHTML = `이상한 점 발견! ${names[key]}. (${found.size}/3)`;
        if (found.size >= 3) {
          face("surprised");
          helper.innerHTML = "세 가지 전부 찾았어요 — 친구 판사, 가림막, 소문 판결. 이 재판, 결과를 믿을 수 있을까요?";
          timer = window.setTimeout(() => {
            ask(choicesBox, helper, {
              choices: s.choices ?? [
                "믿기 어렵다 — 공정하게 판단할 장치가 하나도 없다",
                "판사가 정했으니 무조건 믿어야 한다",
                "재판은 원래 운에 달린 것이다",
              ],
              good: "맞아요! 치우친 판사, 닫힌 방청석, 증거 없는 판결 — <b>공정한 재판의 장치</b>가 전부 빠져 있죠. 우리나라 법원이 갖춘 네 가지 장치를 직접 세우러 가요!",
              bad: "판사도 사람이라 치우칠 수 있고, 운에 맡기면 억울한 사람이 생겨요 — 그래서 재판엔 <b>공정을 지키는 장치</b>가 필요하답니다. 그 네 가지 장치를 세우러 가요!",
              onDone: finish,
            });
          }, 1000);
        }
      });
    });
  };
  render();
  helper.innerHTML = "동화책 속 <b>이상한 나라의 법정</b>이에요. 그림을 살펴보고 <b>이상한 점 세 곳</b>을 찾아 탭해 봐요!";
  return () => window.clearTimeout(timer);
}

/* ══════════ L7: 대법원에서 뒤집힌 판결 ══════════ */
function flipverdictSvg(flips: number): string {
  // flips 0=1심 유죄, 1=2심 유죄, 2=대법원 무죄(뒤집힘)
  const doc = (x: number, y: number, label: string, verdict: "guilty" | "clear" | "wait", hot: boolean): string => `
    <g${hot ? ` class="hs8-noti"` : ""} opacity="${verdict === "wait" ? 0.45 : 1}">
      <rect x="${x - 30}" y="${y - 20}" width="60" height="44" rx="5" fill="url(#hs11-paper)" stroke="${verdict === "clear" ? "#2E8A4C" : verdict === "guilty" ? "#C0392E" : "#B8C2CE"}" stroke-width="1.8"/>
      <text x="${x}" y="${y - 6}" text-anchor="middle" font-size="8.4" font-weight="900" fill="#5A6478">${label}</text>
      ${verdict === "guilty" ? `<g transform="rotate(-10 ${x} ${y + 10})"><circle cx="${x}" cy="${y + 10}" r="9" fill="none" stroke="#C0392E" stroke-width="1.8"/><text x="${x}" y="${y + 13.4}" text-anchor="middle" font-size="7.4" font-weight="900" fill="#C0392E">유죄</text></g>`
        : verdict === "clear" ? `<g transform="rotate(-10 ${x} ${y + 10})"><circle cx="${x}" cy="${y + 10}" r="9" fill="none" stroke="#2E8A4C" stroke-width="1.8"/><text x="${x}" y="${y + 13.4}" text-anchor="middle" font-size="7.4" font-weight="900" fill="#2E8A4C">무죄</text></g>`
        : `<text x="${x}" y="${y + 13}" text-anchor="middle" font-size="10" font-weight="900" fill="#B8C2CE">?</text>`}
    </g>`;
  return wrap145(`
    ${doc(52, 84, "1심", "guilty", false)}
    <path d="M84 84h20" stroke="#8A93A6" stroke-width="2" stroke-dasharray="4 3"/>
    <path d="M100 80l6 4-6 4" fill="none" stroke="#8A93A6" stroke-width="1.8" stroke-linejoin="round"/>
    ${doc(136, 84, "2심", flips >= 1 ? "guilty" : "wait", flips === 1)}
    <path d="M168 84h20" stroke="#8A93A6" stroke-width="2" stroke-dasharray="4 3"/>
    <path d="M184 80l6 4-6 4" fill="none" stroke="#8A93A6" stroke-width="1.8" stroke-linejoin="round"/>
    ${doc(206, 40, "대법원", flips >= 2 ? "clear" : "wait", flips === 2)}
    ${man(30, 118, { mood: flips >= 2 ? "joy" : "sad", arm: flips >= 2 ? "up" : "down", r: 5.8 })}
    <text x="120" y="138" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${flips >= 2 ? "마지막 법원에서 판결이 뒤집혔어요!" : "\"저는 억울해요\" — 판결에 불복한 시민"}</text>`);
}

export function renderFlipVerdict(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "다시 재판 청구하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = flipverdictSvg(0);
  helper.innerHTML = "스틱 시의 한 시민이 <b>1심에서 유죄</b> 판결을 받았어요. 그런데 \"저는 정말 억울해요\"라고 호소하네요 — 이대로 끝일까요?";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.select);
    if (stage === 1) {
      fig.innerHTML = flipverdictSvg(1);
      helper.innerHTML = "<b>2심</b>에서도 유죄 — 하지만 시민은 포기하지 않고 <b>마지막 법원</b>의 문을 두드렸어요.";
      btn.textContent = "마지막 법원으로";
    } else {
      fig.innerHTML = flipverdictSvg(2);
      btn.textContent = "판결 확인 완료";
      btn.classList.add("done");
      btn.disabled = true;
      face("surprised");
      helper.innerHTML = "<b>대법원에서 무죄</b> — 아래 법원들이 놓친 것을 최고 법원이 바로잡았어요! 그런데 왜 이렇게 여러 번 재판받을 수 있게 해 둔 걸까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "법관도 사람이라 잘못된 판결을 바로잡을 기회가 필요해서",
            "재판을 오래 끌수록 법원이 유리해서",
            "세 번 정도는 해야 재판이 멋있어 보여서",
          ],
          good: "맞아요! 법관도 사람이라 실수할 수 있죠 — 그래서 급이 다른 법원에서 <b>여러 번 재판받을 기회</b>를 열어 억울함을 바로잡아요. 이 계단의 이름을 배우러 가요!",
          bad: "오래 끌거나 멋있으려는 게 아니에요 — 법관도 사람이라 잘못 판단할 수 있으니, <b>바로잡을 기회</b>를 제도로 보장하는 거죠. 세 계단의 이름을 배우러 가요!",
          onDone: finish,
        });
      }, 1000);
    }
  });
  return () => window.clearTimeout(timer);
}

/** 사회 Ⅺ 서브 디스패처 — hook.ts가 위임(모르는 장면이면 null) */
export function renderSoc11(
  name: string,
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): (() => void) | null {
  if (name === "morninglaw") return renderMorningLaw(scene, helper, s, finish, face);
  if (name === "goddess") return renderGoddess(scene, helper, s, finish, face);
  if (name === "twoloans") return renderTwoLoans(scene, helper, s, finish, face);
  if (name === "jarcourt") return renderJarCourt(scene, helper, s, finish, face);
  if (name === "oddtrial") return renderOddTrial(scene, helper, s, finish, face);
  if (name === "flipverdict") return renderFlipVerdict(scene, helper, s, finish, face);
  return null;
}
