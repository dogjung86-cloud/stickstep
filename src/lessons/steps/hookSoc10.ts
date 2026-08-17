// hookSoc10 — 사회 Ⅹ(정치과정과 시민 참여) 훅 장면 7종. hook.ts가 renderSoc10 서브 디스패처
// (hookSoc9 문법 — 모르는 장면이면 null)로 위임한다. 파운드리 SVG 문법(근-동조 그라데이션+
// 키라이트+접촉 그림자+최암색 외곽선) 준수, 스틱맨만 손그림 라인. CSS는 hs8-frame·hs8-btn·
// hs8-noti·hs8-ring·hs9-drop 완전 재사용(신규 클래스 0 — soc.css 수정 불필요).
//   onevote      L1 — 개표 동률, 남은 건 딱 한 표(한 표의 힘)
//   ruleposter   L2 — 게시판의 이상한 선거 규칙 4줄(원칙 위반 예고)
//   electletter  L3 — 선거 관리 위원 위촉장(절차의 출발 — 명부)
//   cablecar     L4 — 스틱 시 케이블카 쟁점에 쏟아진 네 목소리(주체 다양성)
//   schoolzone   L5 — 학교 앞 노란 표지판의 과거 되감기(목소리→정책)
//   bikename     L6 — 도시마다 다른 공공 자전거(지방 자치)
//   yellowcarpet L7 — 횡단보도 노란 바닥은 누가 만들었나(주민 참여 예산)
// 민감 가드(정치 단원): 현실 정당·정치인·언론사·국기·구호 0, 쟁점은 가상 "스틱 시"로 각색,
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

/* ══════════ L1: 개표 동률 — 남은 건 딱 한 표 ══════════ */
function onevoteSvg(opened: number, last: boolean): string {
  // opened: 0(시작)·1(6표)·2(10표 — 5:5 동률), last: 마지막 한 표 스포트라이트
  const tally = (x: number, n: number): string =>
    Array.from({ length: n }, (_, i) => `<rect x="${x + (i % 5) * 9}" y="${44 + Math.floor(i / 5) * 14}" width="5.5" height="10" rx="1.6" fill="#5C940D" ${i % 5 === 4 ? `transform="rotate(18 ${x + (i % 5) * 9} ${49 + Math.floor(i / 5) * 14})"` : ""}/>`).join("");
  const tallyB = (x: number, n: number): string =>
    Array.from({ length: n }, (_, i) => `<rect x="${x + (i % 5) * 9}" y="${44 + Math.floor(i / 5) * 14}" width="5.5" height="10" rx="1.6" fill="#2E8AC0" ${i % 5 === 4 ? `transform="rotate(18 ${x + (i % 5) * 9} ${49 + Math.floor(i / 5) * 14})"` : ""}/>`).join("");
  const a = opened === 0 ? 0 : opened === 1 ? 3 : 5;
  const b = opened === 0 ? 0 : opened === 1 ? 3 : 5;
  const lastSlip = last
    ? `<g class="hs8-noti">
        <circle cx="120" cy="106" r="17" fill="#FFF8E0" stroke="#E2A020" stroke-width="1.6"/>
        <g transform="rotate(-8 120 106)"><rect x="111" y="98" width="18" height="15" rx="2" fill="#FFFFFF" stroke="#8A93A6" stroke-width="1.4"/><path d="M115 104h10M115 108h7" stroke="#A8B2C2" stroke-width="1.2"/></g>
        <path d="M99 91l-5-4M141 91l5-4M120 86v-6" stroke="#E2A020" stroke-width="1.7" stroke-linecap="round"/>
      </g>`
    : `<g opacity="${opened > 0 ? ".9" : ".55"}">
        ${[0, 1, 2].slice(0, opened === 2 ? 1 : 3).map((i) => `<g transform="rotate(${-6 + i * 7} ${118 + i * 3} ${104 + i * 2})"><rect x="${109 + i * 3}" y="${97 + i * 2}" width="18" height="15" rx="2" fill="#FFFFFF" stroke="#8A93A6" stroke-width="1.3"/></g>`).join("")}
      </g>`;
  return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs10-board" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E8E68"/><stop offset=".55" stop-color="#2E7452"/><stop offset="1" stop-color="#215E40"/></linearGradient>
      <linearGradient id="hs10-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8CBA0"/><stop offset="1" stop-color="#C4A272"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="139" rx="96" ry="5" fill="#2A3A5E" opacity=".1"/>
    <rect x="22" y="8" width="196" height="72" rx="8" fill="url(#hs10-board)" stroke="#8A6A3E" stroke-width="2"/>
    <ellipse cx="52" cy="16" rx="15" ry="3.4" fill="#fff" opacity=".14"/>
    <text x="70" y="30" text-anchor="middle" font-size="10.5" font-weight="800" fill="#EAF4EE">기호 ①</text>
    <text x="170" y="30" text-anchor="middle" font-size="10.5" font-weight="800" fill="#EAF4EE">기호 ②</text>
    <path d="M120 14v60" stroke="#EAF4EE" stroke-width="1.2" opacity=".4" stroke-dasharray="4 4"/>
    <g transform="translate(6 -4)">${tally(44, a)}</g>
    <g transform="translate(6 -4)">${tallyB(144, b)}</g>
    <rect x="34" y="118" width="172" height="12" rx="4" fill="url(#hs10-desk)" stroke="#8A6A3E" stroke-width="1.5"/>
    ${lastSlip}
    ${man(36, 106, { arm: "out", mood: opened === 2 ? "wow" : "ok", r: 5.8 })}
    ${man(204, 106, { arm: "out", mood: opened === 2 ? "wow" : "ok", r: 5.8 })}
  </svg>`;
}

export function renderOneVote(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "개표하기 (0/2)" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = onevoteSvg(0, false);
  helper.innerHTML = "학급 회장 선거의 <b>개표</b>가 시작됐어요! 상자 속 투표지를 한 묶음씩 열어 봐요.";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.select);
    if (stage === 1) {
      fig.innerHTML = onevoteSvg(1, false);
      helper.innerHTML = "첫 묶음 개표, <b>3 대 3</b>, 팽팽해요! 남은 표를 마저 열어 봐요.";
      btn.textContent = "개표하기 (1/2)";
    } else {
      fig.innerHTML = onevoteSvg(2, true);
      btn.textContent = "개표 완료";
      btn.classList.add("done");
      btn.disabled = true;
      face("surprised");
      helper.innerHTML = "<b>5 대 5 동률</b>, 그런데 상자 바닥에 <b>딱 한 장</b>이 남아 있어요! 교실이 조용해졌네요…";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "이 한 표가 당선을 결정한다",
            "한 표쯤은 결과에 영향이 없다",
            "동점이니 무조건 다시 뽑아야 한다",
          ],
          good: "맞아요! 동률의 순간, 마지막 <b>한 표가 곧 당선</b>을 가르죠. 실제 큰 선거에서도 한 표 차이로 당선이 갈린 일이 있답니다. '겨우 한 표'가 아니라 '결정적 한 표'예요!",
          bad: "상자 바닥의 저 한 장을 봐요. 5 대 5에서 저 표가 열리는 순간 승부가 끝나요. 다시 뽑기 전에, 한 표가 결과를 바꾸는 순간이죠. 한 표의 힘을 확인하러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L2: 게시판의 이상한 규칙 4줄 ══════════ */
function ruleposterSvg(read: number): string {
  const rules = [
    { icon: `<circle cx="0" cy="0" r="4.6" fill="#E8746A" stroke="#B84434" stroke-width="1.2"/>`, w: 66 },
    { icon: `<path d="M-4 -3l4 6 4-6" stroke="#3E8EC4" stroke-width="1.8" fill="none" stroke-linecap="round"/>`, w: 58 },
    { icon: `<path d="M-5 2h4v-6h2v6h4" stroke="#C0871C" stroke-width="1.7" fill="none" stroke-linecap="round"/>`, w: 72 },
    { icon: `<path d="M-4 -4l8 8M4 -4l-8 8" stroke="#B84434" stroke-width="1.9" stroke-linecap="round"/>`, w: 62 },
  ];
  const rows = rules
    .map((r, i) => {
      const y = 34 + i * 17.5;
      const on = read > i;
      const fresh = read === i + 1;
      return `<g opacity="${on ? 1 : 0.35}"${fresh ? ` class="hs8-noti"` : ""}>
        <circle cx="52" cy="${y}" r="7" fill="${on ? "#FFF4E4" : "#EFF2F6"}" stroke="${on ? "#E2A020" : "#B8C2CE"}" stroke-width="1.3"/>
        <g transform="translate(52 ${y})">${r.icon}</g>
        <rect x="66" y="${y - 4}" width="${r.w}" height="7" rx="3.5" fill="${on ? "#8A93A6" : "#C9D2DC"}"/>
        <rect x="${70 + r.w}" y="${y - 4}" width="${on ? 34 : 22}" height="7" rx="3.5" fill="${on ? "#B8C2CE" : "#D8E0E8"}"/>
      </g>`;
    })
    .join("");
  const kids =
    read >= 4
      ? `${man(190, 108, { mood: "wow", r: 5.6 })}<text x="204" y="96" font-size="13" font-weight="900" fill="#C0392E">?!</text>`
      : `${man(190, 108, { mood: read >= 2 ? "sad" : "ok", r: 5.6 })}`;
  return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs10-cork" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8CBA0"/><stop offset=".6" stop-color="#D9B98A"/><stop offset="1" stop-color="#C4A272"/></linearGradient>
      <linearGradient id="hs10-note" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2F6"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="139" rx="96" ry="5" fill="#2A3A5E" opacity=".1"/>
    <rect x="18" y="6" width="204" height="120" rx="10" fill="url(#hs10-cork)" stroke="#8A6A3E" stroke-width="2"/>
    <ellipse cx="52" cy="14" rx="16" ry="3.6" fill="#fff" opacity=".2"/>
    <g transform="rotate(-1 120 66)">
      <rect x="36" y="14" width="150" height="104" rx="5" fill="url(#hs10-note)" stroke="#B8C2CE" stroke-width="1.4"/>
      <circle cx="46" cy="21" r="2.4" fill="#E2604A" stroke="#B84434" stroke-width=".8"/>
      <circle cx="176" cy="21" r="2.4" fill="#3E8EC4" stroke="#2E6A94" stroke-width=".8"/>
      <text x="111" y="26" text-anchor="middle" font-size="9.8" font-weight="800" fill="#39455C">회장 선거 새 규칙(안)</text>
      ${rows}
    </g>
    ${kids}
  </svg>`;
}

export function renderRulePoster(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "규칙 읽기 (0/4)" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = ruleposterSvg(0);
  helper.innerHTML = "게시판에 <b>회장 선거 새 규칙(안)</b>이 붙었어요. 네 줄인데, 읽던 친구의 표정이 심상치 않네요. 한 줄씩 읽어 봐요.";
  const caps = [
    "① \"투표는 칠판에 <b>스티커를 붙이는</b> 방식으로 한다\", 누가 누굴 찍는지 다 보이겠는데요?",
    "② \"아픈 친구 몫은 <b>짝꿍이 대신</b> 투표한다\", 내 표를 남이 찍는다고요?",
    "③ \"성적 우수자는 <b>두 표</b>를 받는다\", 표에 무게가 달라지네요?!",
    "④ \"지각 3회면 <b>투표 금지</b>\", 이제 투표를 아예 못 하는 친구까지! 어딘가 단단히 이상해요.",
  ];
  let i = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (i >= 4) return;
    i += 1;
    haptic(HAPTIC.select);
    fig.innerHTML = ruleposterSvg(i);
    helper.innerHTML = caps[i - 1];
    btn.textContent = `규칙 읽기 (${i}/4)`;
    if (i >= 4) {
      btn.classList.add("done");
      btn.disabled = true;
      face("curious");
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "아니, 규칙이 불공정하면 결과도 인정받기 어렵다",
            "그렇다. 어쨌든 표만 세면 된다",
            "회장이 착한 사람이면 문제없다",
          ],
          good: "정확한 감각이에요! 뽑는 <b>규칙이 공정해야</b> 결과에 모두가 승복할 수 있어요. 사실 민주 선거에는 꼭 지켜야 할 <b>네 가지 기본 원칙</b>이 있답니다. 네 규칙이 각각 무엇을 어겼는지 판정하러 가요!",
          bad: "표를 세는 것보다 먼저인 게 있어요. <b>어떻게 뽑느냐</b>죠. 규칙이 기울어져 있으면 아무리 착한 회장이 뽑혀도 결과를 인정받기 어려워요. 민주 선거의 네 가지 기본 원칙, 판정소에서 확인해요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L3: 선거 관리 위원 위촉장 ══════════ */
function electletterSvg(stage: number): string {
  if (stage === 0) {
    return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="hs10-env" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFBF4"/><stop offset="1" stop-color="#EDE6D2"/></linearGradient></defs>
      <ellipse cx="120" cy="120" rx="80" ry="6" fill="#2A3A5E" opacity=".1"/>
      <g transform="rotate(-3 120 78)">
        <rect x="58" y="52" width="124" height="64" rx="6" fill="url(#hs10-env)" stroke="#B8A472" stroke-width="1.8"/>
        <path d="M58 56l62 34 62-34" stroke="#B8A472" stroke-width="1.6" fill="none"/>
        <circle cx="120" cy="92" r="9" fill="#5C940D" opacity=".92"/>
        <path d="M116.4 92l2.6 2.8 4.6-5.4" stroke="#FFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <ellipse cx="78" cy="58" rx="10" ry="2.4" fill="#fff" opacity=".5"/>
      </g>
      <path d="M120 34v8M104 40l5 6M136 40l-5 6" stroke="#E2A020" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;
  }
  if (stage === 1) {
    return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="hs10-cert" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F0EBDA"/></linearGradient></defs>
      <ellipse cx="120" cy="132" rx="84" ry="5" fill="#2A3A5E" opacity=".1"/>
      <g class="hs9-drop">
        <rect x="62" y="12" width="116" height="114" rx="6" fill="url(#hs10-cert)" stroke="#B8A472" stroke-width="1.8"/>
        <rect x="70" y="20" width="100" height="98" rx="3" fill="none" stroke="#D8CCA8" stroke-width="1.2"/>
        <text x="120" y="42" text-anchor="middle" font-size="13" font-weight="900" fill="#39455C">위촉장</text>
        <path d="M84 54h72M84 64h72M84 74h52" stroke="#B8C2CE" stroke-width="2" stroke-linecap="round"/>
        <text x="120" y="96" text-anchor="middle" font-size="9" font-weight="700" fill="#6E7A8E">우리 반 선거 관리 위원</text>
        <circle cx="146" cy="106" r="8" fill="#E8543E" opacity=".85"/>
        <ellipse cx="86" cy="24" rx="10" ry="2" fill="#fff" opacity=".6"/>
      </g>
    </svg>`;
  }
  const cards = [
    { t: "명단 만들기", x: 44, y: 34, r: -7 },
    { t: "후보 등록", x: 128, y: 26, r: 5 },
    { t: "선거 운동", x: 186, y: 44, r: -4 },
    { t: "투표", x: 58, y: 84, r: 6 },
    { t: "개표", x: 130, y: 92, r: -6 },
    { t: "당선 결정", x: 192, y: 100, r: 4 },
  ];
  return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="hs10-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EAF0DC"/></linearGradient></defs>
    <ellipse cx="120" cy="138" rx="96" ry="5" fill="#2A3A5E" opacity=".1"/>
    ${cards
      .map(
        (c, i) => `<g class="hs8-noti" style="animation-delay:${i * 0.12}s" transform="rotate(${c.r} ${c.x} ${c.y})">
      <rect x="${c.x - 26}" y="${c.y - 12}" width="52" height="26" rx="6" fill="url(#hs10-card)" stroke="#8FA86A" stroke-width="1.5"/>
      <text x="${c.x}" y="${c.y + 3.5}" text-anchor="middle" font-size="8.6" font-weight="800" fill="#3E5228">${c.t}</text>
    </g>`,
      )
      .join("")}
    <text x="120" y="66" text-anchor="middle" font-size="15" font-weight="900" fill="#C0871C">?</text>
    ${man(120, 122, { mood: "wow", r: 5.6 })}
  </svg>`;
}

export function renderElectLetter(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "봉투 열기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = electletterSvg(0);
  helper.innerHTML = "내 자리에 <b>초록 도장이 찍힌 봉투</b>가 놓여 있어요. 두근두근, 열어 볼까요?";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.select);
    fig.innerHTML = electletterSvg(stage);
    if (stage === 1) {
      helper.innerHTML = "<b>위촉장</b>?! 이번 회장 선거를 처음부터 끝까지 관리하는 <b>선거 관리 위원</b>이 됐대요. 공정한 선거가 내 손에 달렸어요.";
      btn.textContent = "할 일 확인하기";
    } else {
      btn.classList.add("done");
      btn.disabled = true;
      face("surprised");
      helper.innerHTML = "할 일 카드가 우르르, 명단, 등록, 운동, 투표, 개표, 당선 결정… 여섯 장이나요! 그런데 <b>무엇부터</b> 해야 하죠?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "투표할 수 있는 사람의 명단부터 만든다",
            "투표함부터 열어 둔다",
            "당선자를 미리 정해 둔다",
          ],
          good: "정확해요! <b>누가 투표할 수 있는지</b>부터 정해야 그다음이 전부 굴러가요. 이 명단의 이름이 <b>선거인 명부</b>랍니다. 여섯 단계를 순서대로, 선거 한 판을 직접 굴려 봐요!",
          bad: "투표함은 한참 뒤의 일이고, 당선자를 미리 정하는 건 선거가 아니죠! 출발점은 <b>투표할 수 있는 사람의 명단</b>이에요. 누가 유권자인지부터 정해야 하거든요. 여섯 단계를 순서대로 굴려 봐요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L4: 스틱 시 케이블카 — 네 목소리 ══════════ */
function cablecarSvg(heard: number): string {
  const voices = [
    { x: 44, y: 96, c: "#C0871C", icon: `<path d="M-3.6 2.6v-4.6q0-3.6 3.6-3.6t3.6 3.6v4.6" stroke="#C0871C" stroke-width="1.6" fill="none"/><rect x="-5.4" y="2" width="10.8" height="1.9" rx="0.95" fill="#C0871C"/>` },
    { x: 96, y: 108, c: "#2E8A4C", icon: `<path d="M0 3.2q-4.6-1-4.6-5.2 4.6-.6 4.6 3.4 0-4 4.6-3.4 0 4.2-4.6 5.2z" fill="#2E8A4C"/><path d="M0 3.2v2.4" stroke="#2E8A4C" stroke-width="1.4"/>` },
    { x: 148, y: 108, c: "#8A5EC0", icon: `<rect x="-5" y="-3.4" width="10" height="7.2" rx="1.4" fill="none" stroke="#8A5EC0" stroke-width="1.5"/><path d="M-2.4 -0.2l2 2 3-3.6" stroke="#8A5EC0" stroke-width="1.3" fill="none"/>` },
    { x: 200, y: 96, c: "#2E8AC0", icon: `<rect x="-4.6" y="-4" width="9.2" height="8" rx="1.2" fill="none" stroke="#2E8AC0" stroke-width="1.5"/><path d="M-2 -1h4M-2 1.6h2.6" stroke="#2E8AC0" stroke-width="1.2"/>` },
  ];
  const bubbles = voices
    .map((v, i) => {
      const on = heard > i;
      return on
        ? `<g${heard === i + 1 ? ` class="hs8-noti"` : ""}>
          <circle cx="${v.x}" cy="${v.y - 26}" r="11" fill="#FFFFFF" stroke="${v.c}" stroke-width="1.6"/>
          <path d="M${v.x - 3} ${v.y - 16}l3 5 3-5z" fill="#FFF" stroke="${v.c}" stroke-width="1.2"/>
          <g transform="translate(${v.x} ${v.y - 26})">${v.icon}</g>
        </g>`
        : "";
    })
    .join("");
  const men = voices.map((v, i) => man(v.x, v.y, { mood: heard > i ? "ok" : "sad", arm: heard > i ? "up" : "out", r: 5.8 })).join("");
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs10-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDEBF7"/><stop offset="1" stop-color="#EFF5FA"/></linearGradient>
      <linearGradient id="hs10-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8EC2E2"/><stop offset="1" stop-color="#5E9EC8"/></linearGradient>
      <linearGradient id="hs10-cab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C070"/><stop offset="1" stop-color="#C2822A"/></linearGradient>
    </defs>
    <rect x="14" y="8" width="212" height="72" rx="9" fill="url(#hs10-sky)" stroke="#B8C8D8" stroke-width="1.6"/>
    <path d="M14 62q30-10 56-4t60 2q34-6 96-2v22H14z" fill="url(#hs10-sea)" opacity=".85"/>
    <path d="M30 26q60 18 180 10" stroke="#5A6478" stroke-width="1.8" fill="none"/>
    <path d="M24 62l14-36 12 36z" fill="#8A93A6" stroke="#5A6478" stroke-width="1.4"/>
    <path d="M196 44l12-26 11 26z" fill="#8A93A6" stroke="#5A6478" stroke-width="1.4"/>
    <g transform="rotate(3 120 34)">
      <path d="M120 26v8" stroke="#5A6478" stroke-width="1.6"/>
      <rect x="106" y="34" width="28" height="20" rx="5" fill="url(#hs10-cab)" stroke="#8A5A14" stroke-width="1.6"/>
      <rect x="111" y="38" width="8" height="8" rx="1.6" fill="#FDF4E0" stroke="#8A5A14" stroke-width="1"/>
      <rect x="122" y="38" width="8" height="8" rx="1.6" fill="#FDF4E0" stroke="#8A5A14" stroke-width="1"/>
      <ellipse cx="113" cy="37" rx="5" ry="1.4" fill="#fff" opacity=".5"/>
    </g>
    <text x="120" y="74" text-anchor="middle" font-size="8.6" font-weight="800" fill="#39455C">스틱 시, 바다 케이블카를 지을까?</text>
    <ellipse cx="120" cy="143" rx="100" ry="5" fill="#2A3A5E" opacity=".1"/>
    ${men}${bubbles}
  </svg>`;
}

export function renderCableCar(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "목소리 듣기 (0/4)" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = cablecarSvg(0);
  helper.innerHTML = "가상의 도시 <b>스틱 시</b>가 시끌시끌, 바다 위 <b>케이블카</b>를 지을지 말지를 두고 온 도시가 들썩여요. 한 목소리씩 들어 봐요.";
  const caps = [
    "① 시장 상인들의 단체: \"케이블카는 <b>우리 가게들의 희망</b>입니다! 꼭 지어 주세요.\"",
    "② 자연을 아끼는 시민 모임: \"공사로 <b>바다와 숲이 다칠까</b> 걱정돼요. 반대합니다.\"",
    "③ 방송: \"찬성과 반대, <b>양쪽의 목소리</b>를 모두 취재해 전해 드립니다.\"",
    "④ 어느 정치인 모임: \"피해를 줄이는 방안을 <b>다음 선거 공약</b>에 담겠습니다.\", 네 목소리가 한 쟁점에 모였어요!",
  ];
  let i = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (i >= 4) return;
    i += 1;
    haptic(HAPTIC.select);
    fig.innerHTML = cablecarSvg(i);
    helper.innerHTML = caps[i - 1];
    btn.textContent = `목소리 듣기 (${i}/4)`;
    if (i >= 4) {
      btn.classList.add("done");
      btn.disabled = true;
      face("curious");
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "정치에 참여하는 주체가 그만큼 다양해서",
            "케이블카가 유난히 특별한 시설이라서",
            "누가 참여할지 추첨으로 정해져서",
          ],
          good: "그거예요! 상인 단체도, 시민 모임도, 방송도, 정치인 모임도, 저마다의 방식으로 <b>정치에 참여하는 주체</b>들이에요. 이 목소리의 주인공들을 판정소에서 정확히 가려 봐요!",
          bad: "케이블카가 아니라 학교 급식이었어도 목소리는 쏟아졌을 거예요. 핵심은 <b>정치에 참여하는 주체가 다양하다</b>는 것! 추첨이 아니라 저마다 스스로 나선 거랍니다. 그 주인공들을 가려 보러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L5: 학교 앞 노란 표지판 — 시간 되감기 ══════════ */
function schoolzoneSvg(stage: number): string {
  // stage 0: 오늘(표지판·안전) → 1: 되감기(표지판 사라짐·아슬아슬) → 2: 더 과거(목소리 내는 시민들)
  const sign =
    stage === 0
      ? `<g>
          <path d="M186 96V44" stroke="#5A6478" stroke-width="2.4"/>
          <rect x="168" y="22" width="36" height="26" rx="4" fill="#FFD43B" stroke="#B8860E" stroke-width="1.8"/>
          ${man(186, 31, { r: 3.4 }).replace(/stroke="#3C4654" stroke-width="2"/, 'stroke="#3C4654" stroke-width="1.5"')}
          <text x="186" y="45" text-anchor="middle" font-size="5.6" font-weight="800" fill="#5A4A0E">어린이 보호</text>
        </g>`
      : "";
  const road = `<rect x="14" y="96" width="212" height="30" rx="6" fill="#8A93A6" opacity=".8"/>
    <path d="M26 111h20M62 111h20M98 111h20M134 111h20M170 111h20M206 111h14" stroke="#FFF" stroke-width="3" stroke-dasharray="10 16" opacity=".8"/>`;
  const school = `<rect x="20" y="44" width="60" height="52" rx="5" fill="#F2E6D0" stroke="#B8A472" stroke-width="1.7"/>
    <rect x="30" y="56" width="12" height="10" rx="2" fill="#FDFBF4" stroke="#B8A472" stroke-width="1.1"/>
    <rect x="56" y="56" width="12" height="10" rx="2" fill="#FDFBF4" stroke="#B8A472" stroke-width="1.1"/>
    <rect x="42" y="78" width="16" height="18" rx="2.4" fill="#C8965A" stroke="#8A6A3E" stroke-width="1.3"/>
    <path d="M16 44h68l-8-12H24z" fill="#D88E5A" stroke="#A85A2E" stroke-width="1.5"/>
    <ellipse cx="34" cy="38" rx="9" ry="2" fill="#fff" opacity=".35"/>`;
  if (stage <= 1) {
    const car = stage === 1 ? `<g><rect x="128" y="84" width="44" height="16" rx="6" fill="#E8746A" stroke="#B84434" stroke-width="1.6"/><circle cx="140" cy="101" r="5" fill="#39455C"/><circle cx="160" cy="101" r="5" fill="#39455C"/><path d="M120 88l-7-3M120 93l-8 0" stroke="#B84434" stroke-width="1.6" stroke-linecap="round"/></g>` : "";
    const kid = stage === 1 ? man(108, 74, { mood: "sad", r: 5 }) : man(108, 74, { mood: "joy", r: 5 });
    return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="120" cy="138" rx="98" ry="5" fill="#2A3A5E" opacity=".1"/>
      ${school}${road}${sign}${car}${kid}
      ${stage === 1 ? `<text x="196" y="40" text-anchor="middle" font-size="12" font-weight="900" fill="#C0392E">몇 해 전…</text>` : ""}
    </svg>`;
  }
  return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="120" cy="138" rx="98" ry="5" fill="#2A3A5E" opacity=".1"/>
    ${school}${road}
    <g class="hs8-noti">${man(130, 62, { arm: "up", mood: "sad", r: 5.8 })}
      <circle cx="152" cy="42" r="10" fill="#FFF" stroke="#C0871C" stroke-width="1.5"/>
      <path d="M149 50l3 5 3-5z" fill="#FFF" stroke="#C0871C" stroke-width="1.1"/>
      <path d="M148.6 42l2.2 2.4 4-4.8" stroke="#C0871C" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>
    <g class="hs8-noti" style="animation-delay:.25s">${man(172, 66, { arm: "up", mood: "sad", r: 5.8 })}
      <circle cx="194" cy="46" r="10" fill="#FFF" stroke="#2E8AC0" stroke-width="1.5"/>
      <path d="M191 54l3 5 3-5z" fill="#FFF" stroke="#2E8AC0" stroke-width="1.1"/>
      <path d="M190 46h8M194 42v8" stroke="#2E8AC0" stroke-width="1.6" stroke-linecap="round"/></g>
    <text x="120" y="20" text-anchor="middle" font-size="10" font-weight="800" fill="#39455C">"등하굣길이 위험해요!" 목소리가 시작됐어요</text>
  </svg>`;
}

export function renderSchoolZone(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "시간 되감기 (0/2)" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = schoolzoneSvg(0);
  helper.innerHTML = "학교 앞 길목의 <b>노란 어린이 보호 표지판</b>, 늘 있던 것 같지만, 처음부터 있었을까요? 시간을 되감아 봐요.";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.select);
    fig.innerHTML = schoolzoneSvg(stage);
    if (stage === 1) {
      helper.innerHTML = "몇 해 전으로, <b>표지판이 없어요!</b> 차가 씽씽 달리고, 등굣길이 아슬아슬하네요. 한 번 더 되감아 봐요.";
      btn.textContent = "시간 되감기 (1/2)";
    } else {
      btn.classList.add("done");
      btn.disabled = true;
      face("curious");
      helper.innerHTML = "그때, 걱정하던 사람들이 <b>목소리를 내기 시작</b>했어요. \"등하굣길이 위험해요!\" 이 목소리와 오늘의 표지판 사이엔 무슨 일이 있었을까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "목소리가 어떤 길을 거쳐 정책이 되었다",
            "표지판이 어느 날 저절로 생겨났다",
            "목소리와 표지판은 아무 상관이 없다",
          ],
          good: "맞아요! 흩어진 목소리가 <b>모이고 → 다듬어지고 → 결정되고 → 실행되는 길</b>을 걸어 표지판이 된 거예요. 그 길의 이름과 정거장들을 지금부터 직접 따라가 봐요!",
          bad: "표지판은 저절로 생기지 않아요. 시작은 분명 저 목소리들이었죠. 목소리가 표지판이 되기까지 거친 <b>길</b>이 있답니다. 그 길을 직접 따라가 봐요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L6: 도시마다 다른 공공 자전거 ══════════ */
function bikenameSvg(idx: number): string {
  // idx 0..2 — 세 도시 카드(가상 이름·색)
  const cities = [
    { name: "스틱 시", bike: "씽씽이", body: "#5C940D", dark: "#47730A", tint: "#EEF5DC" },
    { name: "이웃 바다 시", bike: "바람이", body: "#2E8AC0", dark: "#1E6490", tint: "#E2EFF8" },
    { name: "산골 마을 군", bike: "구름이", body: "#C0871C", dark: "#8A5A14", tint: "#F8F0DC" },
  ];
  const c = cities[idx];
  const bike = `<g transform="translate(120 84)">
    <circle cx="-30" cy="18" r="15" fill="none" stroke="#39455C" stroke-width="3"/>
    <circle cx="30" cy="18" r="15" fill="none" stroke="#39455C" stroke-width="3"/>
    <circle cx="-30" cy="18" r="3" fill="#39455C"/><circle cx="30" cy="18" r="3" fill="#39455C"/>
    <path d="M-30 18L-12 -6h20L30 18M-12 -6l10 24h-26z" stroke="${c.body}" stroke-width="4" fill="none" stroke-linejoin="round"/>
    <path d="M-14 -12l6 0M8 -6l-4-8h-6" stroke="${c.dark}" stroke-width="3" stroke-linecap="round"/>
    <rect x="-6" y="2" width="14" height="9" rx="3" fill="${c.body}" stroke="${c.dark}" stroke-width="1.4"/>
    <ellipse cx="-24" cy="8" rx="6" ry="2" fill="#fff" opacity=".35" transform="rotate(-32 -24 8)"/>
  </g>`;
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="hs10-bikecard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="${c.tint}"/></linearGradient></defs>
    <ellipse cx="120" cy="142" rx="96" ry="5" fill="#2A3A5E" opacity=".1"/>
    <g class="hs8-noti">
      <rect x="30" y="10" width="180" height="126" rx="12" fill="url(#hs10-bikecard)" stroke="${c.body}" stroke-width="2"/>
      <rect x="82" y="18" width="76" height="18" rx="9" fill="${c.body}"/>
      <text x="120" y="30.5" text-anchor="middle" font-size="10" font-weight="800" fill="#FFF">${c.name}</text>
      ${bike}
      <text x="120" y="126" text-anchor="middle" font-size="11" font-weight="900" fill="${c.dark}">공공 자전거 "${c.bike}"</text>
      <ellipse cx="58" cy="18" rx="12" ry="2.6" fill="#fff" opacity=".5"/>
    </g>
    <text x="18" y="80" text-anchor="middle" font-size="14" font-weight="900" fill="#B8C2CE">‹</text>
    <text x="222" y="80" text-anchor="middle" font-size="14" font-weight="900" fill="#8A93A6">›</text>
  </svg>`;
}

export function renderBikeName(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "다음 도시 (1/3)" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = bikenameSvg(0);
  helper.innerHTML = "여행하다 보면 도시마다 <b>공공 자전거</b>가 달라요. 우리 스틱 시의 자전거는 초록색 \"씽씽이\". 옆 도시는 어떨까요?";
  const caps = [
    "이웃 바다 시의 자전거는 파란색 <b>\"바람이\"</b>, 색도 이름도 다르네요?",
    "산골 마을 군은 노란색 <b>\"구름이\"</b>! 같은 나라인데 도시마다 전부 달라요. 대체 왜일까요?",
  ];
  let i = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (i >= 2) return;
    i += 1;
    haptic(HAPTIC.select);
    fig.innerHTML = bikenameSvg(i);
    helper.innerHTML = caps[i - 1];
    btn.textContent = `다음 도시 (${i + 1}/3)`;
    if (i >= 2) {
      btn.classList.add("done");
      btn.disabled = true;
      face("curious");
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "지역의 일은 그 지역에서 스스로 정하기 때문",
            "나라에서 지역마다 다르게 만들라고 시켜서",
            "자전거 공장이 지역마다 달라서",
          ],
          good: "정확해요! 공공 자전거는 <b>그 지역이 스스로</b> 계획하고 운영하는 사업이라 이름도 색도 지역의 개성을 담아요. 지역의 일을 지역이 정하는 이 제도, 이번 시간의 주인공이랍니다!",
          bad: "나라가 시킨 것도, 공장 문제도 아니에요. 공공 자전거는 <b>각 지역이 스스로</b> 계획하고 운영하는 사업이거든요. 지역의 일을 지역이 정하는 제도, 그 이름을 배우러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L7: 횡단보도 노란 바닥은 누가 만들었나 ══════════ */
function yellowcarpetSvg(stage: number): string {
  const zebra = `<rect x="14" y="88" width="212" height="40" rx="6" fill="#8A93A6" opacity=".8"/>
    ${[30, 62, 94, 126, 158, 190].map((x) => `<rect x="${x}" y="92" width="18" height="32" rx="2" fill="#FDFDFB" opacity=".9"/>`).join("")}`;
  const carpet = `<g>
    <path d="M76 88l-18-34h60l14 34z" fill="#FFD43B" stroke="#B8860E" stroke-width="1.8" stroke-linejoin="round"/>
    <ellipse cx="76" cy="60" rx="10" ry="2.4" fill="#fff" opacity=".4"/>
    ${man(84, 66, { mood: "joy", r: 5 })}
  </g>`;
  if (stage === 0) {
    return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="120" cy="138" rx="98" ry="5" fill="#2A3A5E" opacity=".1"/>
      ${zebra}${carpet}
      <text x="168" y="40" text-anchor="middle" font-size="12" font-weight="900" fill="#C0871C">이건 누가?</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="hs10-board2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDF2F8"/></linearGradient></defs>
    <ellipse cx="120" cy="138" rx="98" ry="5" fill="#2A3A5E" opacity=".1"/>
    <g class="hs9-drop">
      <rect x="46" y="10" width="148" height="86" rx="7" fill="url(#hs10-board2)" stroke="#8A93A6" stroke-width="1.7"/>
      <rect x="56" y="18" width="128" height="16" rx="4" fill="#5C940D"/>
      <text x="120" y="29.5" text-anchor="middle" font-size="9" font-weight="800" fill="#FFF">스틱 시 알림판</text>
      <text x="120" y="50" text-anchor="middle" font-size="9.6" font-weight="800" fill="#39455C">올해 예산으로 할 일을</text>
      <text x="120" y="63" text-anchor="middle" font-size="9.6" font-weight="800" fill="#39455C">주민 여러분이 직접 제안해 주세요!</text>
      <path d="M76 74h88" stroke="#D8E0E8" stroke-width="1.6"/>
      <text x="120" y="88" text-anchor="middle" font-size="8.4" font-weight="700" fill="#6E7A8E">제안 모음 → 주민 투표 → 예산 반영</text>
    </g>
    ${man(50, 116, { arm: "up", mood: "joy", r: 5.4 })}${man(120, 120, { arm: "up", mood: "ok", r: 5.4 })}${man(190, 116, { arm: "up", mood: "joy", r: 5.4 })}
  </svg>`;
}

export function renderYellowCarpet(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "단서 찾기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = yellowcarpetSvg(0);
  helper.innerHTML = "학교 앞 횡단보도에 어느 날 <b>노란 바닥</b>이 생겼어요. 그 위에 서면 운전자 눈에 잘 띄어 안전하대요. 이건 대체 누가 만들었을까요?";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 1) return;
    stage = 1;
    haptic(HAPTIC.select);
    fig.innerHTML = yellowcarpetSvg(1);
    btn.textContent = "단서 확인!";
    btn.classList.add("done");
    btn.disabled = true;
    face("curious");
    helper.innerHTML = "시청 알림판에서 단서 발견, \"올해 예산으로 할 일을 <b>주민 여러분이 직접 제안</b>해 주세요!\" 제안을 모아 투표까지 했다는데요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "주민들이 예산 회의에 참여해 직접 제안했다",
          "페인트가 남아서 아무나 칠해 둔 것이다",
          "학생들이 밤에 몰래 칠했다",
        ],
        good: "정답이에요! 이 노란 바닥은 <b>주민이 예산 쓰임새를 직접 제안</b>해 태어난 안전 장치예요. 이렇게 주민이 지역의 일에 참여하는 길이 여럿 있답니다. 마지막 시간, 그 길들을 모두 배워 봐요!",
          bad: "몰래 칠한 낙서라면 금방 지워졌겠죠! 알림판이 단서예요. <b>주민들이 예산 회의에 참여해 제안</b>했고, 투표로 뽑혀 진짜 정책이 된 거랍니다. 주민이 참여하는 길들을 배우러 가요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ── 서브 디스패처(hookSoc9 문법 — 모르는 장면이면 null) ── */
export function renderSoc10(
  name: string,
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): (() => void) | null {
  if (name === "onevote") return renderOneVote(scene, helper, s, finish, face);
  if (name === "ruleposter") return renderRulePoster(scene, helper, s, finish, face);
  if (name === "electletter") return renderElectLetter(scene, helper, s, finish, face);
  if (name === "cablecar") return renderCableCar(scene, helper, s, finish, face);
  if (name === "schoolzone") return renderSchoolZone(scene, helper, s, finish, face);
  if (name === "bikename") return renderBikeName(scene, helper, s, finish, face);
  if (name === "yellowcarpet") return renderYellowCarpet(scene, helper, s, finish, face);
  return null;
}
