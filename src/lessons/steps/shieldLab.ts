// shieldLab — 사회 Ⅻ L2 기함: 기본권 5종 반사실 릴레이. "이 방패가 없다면?"(principleLab·
// fairTrialLab 반사실 문법의 기본권판)을 다섯 국면으로 — 기운 저울을 바로 세우고(평등권),
// 간섭 화살표를 걷어 내고(자유권), 잠긴 투표함을 열고(참정권 — Ⅸ·Ⅹ 회수), 금 간 방패의
// 수리를 요청하고(청구권), 발밑에 안전망을 펼친다(사회권). 미래엔 224쪽 도해·비상 223쪽
// 두 책 공통 5종이 코어 — 한 판에 5개념을 몰지 않고 "한 국면 = 한 권리 = 한 조작"으로 분리.
// 피날레 = 다섯 방패 + 왕관(인간으로서의 존엄과 가치 및 행복 추구권 = 토대) 문장(紋章) 완성.
// electLab·principleLab 국면 릴레이 문법 계승(ppl-* 릴레이 킷 CSS 재사용 — 신규 CSS 0줄).
// 판정 msn은 세 국면(평등=차별 없이(획일 아님) / 청구=수단적 권리 / 사회=적극적 권리).
// rAF 없음 — CSS 트랜지션 + setTimeout 체인(타이머 Set 일괄 해제).
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

function stickman(x: number, y: number, opts: { arm?: "up" | "down" | "out"; mood?: "ok" | "sad" | "joy"; r?: number } = {}): string {
  const r = opts.r ?? 6;
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
      ? `<circle cx="${x - 2}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 2} ${y + 3.4}q2-1.6 4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`
      : mood === "joy"
        ? `<path d="M${x - 3} ${y - 1.2}q1.2-1.4 2.4 0M${x + 0.6} ${y - 1.2}q1.2-1.4 2.4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/><path d="M${x - 2.2} ${y + 2.6}q2.2 2 4.4 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>`
        : `<circle cx="${x - 2}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 1.7} ${y + 2.9}q1.7 1.2 3.4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`;
  return `<g ${STICK}><circle cx="${x}" cy="${y}" r="${r}" fill="#F6EFE4"/>
    <path d="M${x} ${y + r}v${r + 6}M${x} ${y + r * 2 + 6}l-${r - 1} ${r + 3}M${x} ${y + r * 2 + 6}l${r - 1} ${r + 3}${arms}"/></g>${face}`;
}

const DEFS = `<defs>
  <linearGradient id="sdl-shield" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C86ADB"/><stop offset=".55" stop-color="#AE3EC9"/><stop offset="1" stop-color="#8B2FA4"/></linearGradient>
  <linearGradient id="sdl-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECC26A"/><stop offset="1" stop-color="#A8781E"/></linearGradient>
  <linearGradient id="sdl-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C89A5E"/><stop offset=".55" stop-color="#A87838"/><stop offset="1" stop-color="#8A6034"/></linearGradient>
  <linearGradient id="sdl-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2F6"/></linearGradient>
</defs>`;

function wrap(inner: string): string {
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${DEFS}
    <ellipse cx="120" cy="144" rx="100" ry="5" fill="#2A3A5E" opacity=".1"/>${inner}</svg>`;
}

/** 방패 배지(라운드 삼각) — 이 랩의 심장 소품 */
function shield(x: number, y: number, w: number, opts: { glow?: boolean; crack?: boolean; dim?: boolean } = {}): string {
  const h = w * 1.16;
  const path = `M${x} ${y - h / 2}c${w * 0.34} ${h * 0.1} ${w * 0.44} ${h * 0.04} ${w / 2} 0v${h * 0.46}c0 ${h * 0.3} -${w * 0.22} ${h * 0.44} -${w / 2} ${h * 0.54}c-${w * 0.28} -${h * 0.1} -${w / 2} -${h * 0.24} -${w / 2} -${h * 0.54}v-${h * 0.46}c${w * 0.06} ${h * 0.04} ${w * 0.16} ${h * 0.1} ${w / 2} 0z`;
  const crack = opts.crack
    ? `<path d="M${x - w * 0.1} ${y - h * 0.34}l${w * 0.14} ${h * 0.18}l-${w * 0.16} ${h * 0.14}l${w * 0.12} ${h * 0.2}" stroke="#5A3A66" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : "";
  const glow = opts.glow
    ? `<path d="M${x - w * 0.66} ${y - h * 0.5}l${w * 0.12} ${w * 0.12}M${x + w * 0.66} ${y - h * 0.5}l-${w * 0.12} ${w * 0.12}M${x} ${y - h * 0.72}v${w * 0.16}" stroke="#E4A8F0" stroke-width="2" stroke-linecap="round"/>`
    : "";
  return `<g opacity="${opts.dim ? 0.4 : 1}"><path d="${path}" fill="url(#sdl-shield)" stroke="#6E2482" stroke-width="1.6"/>
    <path d="M${x - w * 0.24} ${y - h * 0.3}q${w * 0.1} -${h * 0.08} ${w * 0.3} -${h * 0.04}" stroke="#E8C2F2" stroke-width="1.6" fill="none" opacity=".8"/>${crack}${glow}</g>`;
}

// ① 평등권 — 같은 일, 다른 몫(기운 저울) → 같은 잣대(수평)
function equalSvg(fixed: boolean): string {
  const tilt = fixed ? 0 : -9;
  const bag = (bx: number, by: number, n: number): string =>
    Array.from({ length: n }, (_, i) => `<rect x="${bx - 7 + (i % 2) * 8}" y="${by - 8 - Math.floor(i / 2) * 9}" width="7" height="7" rx="1.6" fill="url(#sdl-gold)" stroke="#8A6034" stroke-width="1.1"/>`).join("");
  const beamY = 52;
  return wrap(`
    ${stickman(38, 96, { mood: fixed ? "joy" : "sad", arm: fixed ? "up" : "down" })}
    ${stickman(202, 96, { mood: "ok", arm: fixed ? "up" : "out" })}
    <path d="M120 ${beamY}v58" stroke="#6E4E26" stroke-width="3" stroke-linecap="round"/>
    <path d="M96 116h48" stroke="#6E4E26" stroke-width="3" stroke-linecap="round"/>
    <g transform="rotate(${tilt} 120 ${beamY})">
      <path d="M64 ${beamY}h112" stroke="#6E4E26" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M64 ${beamY}v6M50 ${beamY + 10}h28m-28 0q0 8 14 8t14-8" fill="none" stroke="#6E4E26" stroke-width="1.7"/>
      <path d="M50 ${beamY + 10}q0 8 14 8t14-8z" fill="#EEF2F6" stroke="#8A93A6" stroke-width="1.2"/>
      ${bag(64, beamY + 8, fixed ? 2 : 3)}
      <path d="M176 ${beamY}v6M162 ${beamY + 10}h28m-28 0q0 8 14 8t14-8" fill="none" stroke="#6E4E26" stroke-width="1.7"/>
      <path d="M162 ${beamY + 10}q0 8 14 8t14-8z" fill="#EEF2F6" stroke="#8A93A6" stroke-width="1.2"/>
      ${bag(176, beamY + 8, fixed ? 2 : 1)}
    </g>
    ${fixed ? `<g class="hs8-noti">${shield(120, 28, 26, { glow: true })}</g>` : ""}
    <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${fixed ? "같은 일에는 같은 몫, 첫 번째 방패가 섰어요" : "같은 일을 했는데 몫이 달라요. 저울이 기울었어요"}</text>`);
}

// ② 자유권 — 간섭 화살표에 둘러싸임 → 걷어 내면 길이 열린다
function freeSvg(step: number): string {
  const arrows =
    step === 0
      ? `<g>
          <path d="M30 44h44M210 44h-44M30 96h38M210 96h-38" stroke="#C0392E" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M68 38l8 6-8 6M172 38l-8 6 8 6M62 90l8 6-8 6M178 90l-8 6 8 6" fill="none" stroke="#C0392E" stroke-width="2.4" stroke-linejoin="round"/>
        </g>`
      : step === 1
        ? `<g opacity=".45">
            <path d="M30 44h30M210 44h-30" stroke="#C0392E" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="2 6"/>
          </g>`
        : "";
  const roads =
    step >= 2
      ? `<g class="hs8-noti">
          <path d="M120 108q-42 6 -78 26M120 108q0 16 0 34M120 108q42 6 78 26" stroke="#B8A0C8" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="1 8"/>
          ${shield(120, 26, 24, { glow: true })}
        </g>`
      : "";
  return wrap(`
    ${stickman(120, 66, { mood: step >= 2 ? "joy" : step === 1 ? "ok" : "sad", arm: step >= 2 ? "up" : "down", r: 7 })}
    ${arrows}${roads}
    <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${step >= 2 ? "어디로 갈지, 무엇을 믿을지, 내가 정해요" : step === 1 ? "간섭이 힘을 잃어 가요. 한 번 더!" : "가는 곳·믿는 것·직업까지 참견하는 화살표들"}</text>`);
}

// ③ 참정권 — 잠긴 투표함 → 열리고 도장이 찍힌다
function partSvg(step: number): string {
  const lock =
    step === 0
      ? `<g><rect x="132" y="58" width="16" height="14" rx="3" fill="#8A93A6"/><path d="M136 58v-5q0-5 4-5t4 5v5" stroke="#5A6478" stroke-width="2" fill="none"/></g>`
      : step === 1
        ? `<g opacity=".5" transform="rotate(24 140 65)"><rect x="132" y="58" width="16" height="14" rx="3" fill="#B8C2CE"/><path d="M136 58v-5q0-5 4-5t4 5" stroke="#8A93A6" stroke-width="2" fill="none"/></g>`
        : "";
  const stamp =
    step >= 2
      ? `<g class="hs8-noti">
          <rect x="106" y="30" width="28" height="18" rx="4" fill="url(#sdl-wood)" stroke="#6E4E26" stroke-width="1.4"/>
          <path d="M114 52v8" stroke="#6E4E26" stroke-width="2.4" stroke-linecap="round"/>
          ${shield(196, 34, 22, { glow: true })}
        </g>`
      : "";
  return wrap(`
    ${stickman(52, 84, { mood: step >= 2 ? "joy" : "ok", arm: step >= 2 ? "up" : "out", r: 6.6 })}
    <rect x="96" y="62" width="88" height="52" rx="7" fill="url(#sdl-wood)" stroke="#6E4E26" stroke-width="1.8"/>
    <rect x="124" y="70" width="32" height="6" rx="3" fill="#39455C"/>
    ${lock}${stamp}
    <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${step >= 2 ? "나라의 결정에 내 한 표, Ⅸ·Ⅹ 단원의 그 상자!" : step === 1 ? "자물쇠가 풀리고 있어요. 한 번 더!" : "나라의 일을 정하는 상자가 잠겨 있어요"}</text>`);
}

// ④ 청구권 — 금 간 방패 → 구제 요청서 접수 → 수리
function claimSvg(done: boolean): string {
  const desk = `
    <rect x="140" y="66" width="72" height="44" rx="6" fill="url(#sdl-wood)" stroke="#6E4E26" stroke-width="1.6"/>
    <rect x="148" y="46" width="56" height="24" rx="4" fill="url(#sdl-paper)" stroke="#8A93A6" stroke-width="1.4"/>
    <path d="M154 54h30M154 60h22" stroke="#B8C2CE" stroke-width="1.6" stroke-linecap="round"/>
    ${stickman(226, 52, { mood: "ok", r: 5.2 })}`;
  const stampOk = done
    ? `<g class="hs8-noti"><circle cx="196" cy="52" r="7" fill="#AE3EC9"/><path d="M192.6 52l2.4 2.6 4-4.8" stroke="#FFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`
    : "";
  return wrap(`
    ${stickman(36, 86, { mood: done ? "joy" : "sad", arm: done ? "up" : "out" })}
    ${shield(78, 66, 30, done ? { glow: true } : { crack: true })}
    ${desk}${stampOk}
    <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${done ? "접수 완료, 방패를 고칠 길이 열렸어요" : "방패에 금이 갔어요. 어디에 도움을 요청하죠?"}</text>`);
}

// ⑤ 사회권 — 발밑이 불안 → 안전망 + 학교·집
function socialSvg(done: boolean): string {
  const net = done
    ? `<g class="hs8-noti">
        <path d="M36 112q84 26 168 0" stroke="#AE3EC9" stroke-width="2.2" fill="none"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${52 + i * 27} ${106 + Math.sin((i / 5) * Math.PI) * 10}v14" stroke="#C88ADB" stroke-width="1.6"/>`).join("")}
        <path d="M36 126q84 26 168 0" stroke="#AE3EC9" stroke-width="2.2" fill="none" opacity=".55"/>
      </g>`
    : `<path d="M96 118h48" stroke="#8A93A6" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="5 6"/>`;
  const town = done
    ? `<g class="hs8-noti">
        <rect x="30" y="52" width="40" height="30" rx="4" fill="url(#sdl-paper)" stroke="#8A93A6" stroke-width="1.5"/>
        <path d="M28 52l22-14 22 14" stroke="#8A93A6" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
        <rect x="44" y="66" width="12" height="16" rx="2" fill="#C8B0D4"/>
        <rect x="176" y="50" width="36" height="32" rx="4" fill="url(#sdl-paper)" stroke="#8A93A6" stroke-width="1.5"/>
        <path d="M180 58h28M180 66h28M180 74h18" stroke="#C8D2DE" stroke-width="1.8"/>
        ${shield(120, 30, 24, { glow: true })}
      </g>`
    : "";
  return wrap(`
    ${stickman(120, 84, { mood: done ? "joy" : "sad", arm: done ? "up" : "down", r: 7 })}
    ${net}${town}
    <text x="120" y="146" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${done ? "배움도 살림도 국가에 요구할 수 있어요. 다섯 번째 방패!" : "혼자 힘으론 발밑이 위태로울 때가 있어요"}</text>`);
}

// 피날레 — 다섯 방패 문장(紋章): 골드 받침돌(존엄·행복 추구 = 토대) 위에 선 다섯 방패.
// 왕관은 받침돌 "안"에 새긴다 — 방패 머리 위에 얹으면 "가운데 방패의 왕관"으로 오독(눈검수 교정).
function crestSvg(): string {
  const pos = [
    [40, 78],
    [80, 56],
    [120, 46],
    [160, 56],
    [200, 78],
  ];
  const shields = pos.map(([x, y]) => shield(x, y, 26, { glow: false })).join("");
  return wrap(`
    ${pos.map(([x, y]) => `<path d="M${x} ${y + 18}V108" stroke="#D8B4E4" stroke-width="1.4" stroke-dasharray="2 4"/>`).join("")}
    <g class="hs8-noti">
      <rect x="30" y="108" width="180" height="20" rx="8" fill="url(#sdl-gold)" stroke="#8A6034" stroke-width="1.6"/>
      <path d="M108 124l3.4-8 5 4.6 3.6-7 3.6 7 5-4.6 3.4 8z" fill="#FBF3DC" stroke="#8A6034" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="111.4" cy="114.6" r="1.5" fill="#FBF3DC"/><circle cx="120" cy="112" r="1.5" fill="#FBF3DC"/><circle cx="128.6" cy="114.6" r="1.5" fill="#FBF3DC"/>
    </g>
    ${shields}
    <path d="M26 24l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6zM214 18l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" fill="#E4A8F0"/>
    <text x="120" y="146" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">존엄과 가치·행복 추구권 위에 선 다섯 방패</text>`);
}

interface SdlPhase {
  id: string;
  fileLabel: string;
  stageName: string;
  intro: string;
  quiz?: { q: string; options: [string, string]; good: string; wrong: string };
}

const PHASES: SdlPhase[] = [
  {
    id: "equal",
    fileLabel: "방패 1",
    stageName: "평등권",
    intro: "첫 장면, 같은 일을 한 두 스틱맨의 <b>몫이 달라요</b>. 성별도 신분도 일과 상관없는데 저울이 기울었죠. <b>같은 잣대</b>를 세워요!",
    quiz: {
      q: "방금 세운 첫 번째 방패, 평등권이 지켜 주는 것은 무엇일까요?",
      options: ["차별받지 않고 동등하게 대우받는 것", "모두가 모든 것을 똑같이 나눠 갖는 것"],
      good: "정확해요! 평등권은 성별·종교·사회적 신분 등을 이유로 <b>부당하게 차별받지 않을</b> 권리예요. Ⅺ 단원 정의의 저울처럼, '다른 것은 다르게'까지 품는답니다.",
      wrong: "'전부 똑같이 나누기'가 아니에요. 더 일한 사람이 더 받는 건 정의였죠(Ⅺ 저울). 평등권의 심장은 <b>부당한 차별 없이 동등하게 대우받는 것</b>! 다시 골라 봐요.",
    },
  },
  {
    id: "free",
    fileLabel: "방패 2",
    stageName: "자유권",
    intro: "이번엔 스틱맨을 <b>간섭 화살표</b>가 둘러쌌어요. 어디로 갈지, 무엇을 믿을지, 어떤 일을 할지까지 국가가 참견한다면? 화살표를 걷어 내요!",
  },
  {
    id: "part",
    fileLabel: "방패 3",
    stageName: "참정권",
    intro: "나라의 일을 정하는 <b>상자가 잠겼어요</b>. 정치는 국가가 알아서 할 테니 국민은 구경만 하라네요. Ⅸ·Ⅹ 단원에서 지켜 온 그 상자, 다시 열어요!",
  },
  {
    id: "claim",
    fileLabel: "방패 4",
    stageName: "청구권",
    intro: "방패에 <b>금이 갔어요</b>. 권리를 침해당했는데 호소할 곳이 없다면 방패는 장식일 뿐이죠. 국가에 <b>구제 요청서</b>를 내요!",
    quiz: {
      q: "청구권에는 '수단적 성격의 권리'라는 별명이 있어요. 왜일까요?",
      options: ["다른 기본권을 지키기 위한 도구가 되기 때문", "다섯 권리 중 가장 오래된 권리이기 때문"],
      good: "맞아요! 청구권은 다른 방패들이 깨졌을 때 <b>고쳐 달라고 요구하는 도구(수단)</b>, 방패를 지키는 방패인 셈이에요. 청원권·재판 청구권·국가 배상 청구권이 그 식구랍니다.",
      wrong: "역사의 길이가 아니라 <b>역할</b>이 열쇠예요. 다른 기본권이 침해될 때 구제를 요청하는 '도구'가 되어 주니 수단적 권리라 불러요. 다시 골라 봐요!",
    },
  },
  {
    id: "social",
    fileLabel: "방패 5",
    stageName: "사회권",
    intro: "마지막 장면, 혼자 힘으론 <b>발밑이 위태로울 때</b>가 있어요. 배울 기회, 최소한의 살림살이까지 운에 맡겨야 한다면? 국가에 요구해 <b>안전망</b>을 펼쳐요!",
    quiz: {
      q: "다섯 번째 방패, 사회권은 국가에 무엇을 요구하는 권리일까요?",
      options: ["인간다운 생활의 보장", "간섭하지 말고 내버려 두는 것"],
      good: "정확해요! 사회권은 국가에 '해 달라'고 요구하는 <b>적극적 권리</b>, 교육을 받을 권리, 근로의 권리, 쾌적한 환경에서 살 권리가 여기 살아요. '내버려 두라'는 자유권과 방향이 정반대죠!",
      wrong: "'내버려 두라'는 자유권의 방향이에요. 사회권은 거꾸로 국가에 인간다운 생활을 <b>보장해 달라</b>고 요구하는 적극적 권리랍니다. 다시 골라 봐요!",
    },
  },
];

// 기계 검산용 export(qa/audit-soc12-data.mjs — 국면 순서(평등→자유→참정→청구→사회)·options[0]=정답 규약 검사)
export const SHIELD_PHASES = PHASES;

export const shieldLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "steps" } }, el("b", { text: "다섯 방패" }), el("span", { text: "0 / 5" })),
    el("div", { class: "pn-badge world", dataset: { g: "quiz" } }, el("b", { text: "꼼꼼 판정" }), el("span", { text: "0 / 3" })),
    el("div", { class: "pn-badge world", dataset: { g: "final" } }, el("b", { text: "문장 완성" }), el("span", { text: "대기" })),
  );
  const helper = el("div", { class: "helper", html: PHASES[0].intro });

  const fileTag = el("div", { class: "ppl-file", text: PHASES[0].fileLabel });
  const sceneBox = el("div", { class: "ppl-scene" });
  const badges = el("div", { class: "ppl-badges" });
  const stage = el("div", { class: "stage ppl-stage" }, fileTag, sceneBox, badges);

  const controls = el("div", { class: "ppl-controls" });

  const quizQ = el("div", { class: "msn-q" });
  const optBtns = [0, 1].map((i) => el("button", { class: "msn-opt", attrs: { type: "button" }, dataset: { o: String(i) } }));
  const quizCard = el("div", { class: "msn-quiz ppl-quiz" }, quizQ, ...optBtns);

  host.append(goalChips, helper, stage, controls, quizCard);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };
  const chipOf = (g: string): HTMLElement => goalChips.querySelector(`[data-g="${g}"]`) as HTMLElement;
  const lightChip = (g: string, sub?: string): void => {
    const chip = chipOf(g);
    if (sub) chip.querySelector("span")!.textContent = sub;
    if (!chip.classList.contains("on")) {
      chip.classList.add("on");
      haptic(HAPTIC.ctaUnlock);
    }
  };

  let phase = 0;
  let clean = true;
  let quizOpen = false;
  let quizDone = 0;
  let stepsDone = 0;

  function refreshScene(html: string): void {
    sceneBox.classList.remove("in");
    void sceneBox.offsetWidth;
    sceneBox.classList.add("in");
    sceneBox.innerHTML = html;
  }

  function stepCount(): void {
    stepsDone += 1;
    const chip = chipOf("steps");
    chip.querySelector("span")!.textContent = `${stepsDone} / 5`;
    if (stepsDone >= 5 && !chip.classList.contains("on")) {
      chip.classList.add("on");
      haptic(HAPTIC.ctaUnlock);
    }
  }

  function openQuiz(): void {
    const qz = PHASES[phase].quiz!;
    quizOpen = true;
    quizQ.innerHTML = qz.q;
    optBtns.forEach((b, i) => {
      b.classList.remove("ok", "no", "dim");
      b.innerHTML = qz.options[i];
    });
    quizCard.classList.add("show");
    later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function advance(): void {
    quizCard.classList.remove("show");
    badges.appendChild(el("span", { class: "ppl-prop", text: PHASES[phase].stageName }));
    stepCount();
    if (phase + 1 >= PHASES.length) {
      fileTag.textContent = "문장 완성";
      refreshScene(crestSvg());
      lightChip("final", "완성!");
      helper.innerHTML =
        "다섯 방패 완성! <b>평등권 · 자유권 · 참정권 · 청구권 · 사회권</b>, 그리고 이 모든 방패의 받침이 헌법 제10조, <b>인간으로서의 존엄과 가치 및 행복 추구권</b>이에요. 인권 중에서 헌법에 적어 지키는 권리, 기본권의 문장이 완성됐어요!";
      api.recordQuiz(clean);
      api.enableCTA(s.cta ?? "방패 정리하러 가기");
      return;
    }
    phase += 1;
    fileTag.textContent = PHASES[phase].fileLabel;
    helper.innerHTML = PHASES[phase].intro;
    mountPhase();
  }

  optBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (!quizOpen) return;
      if (i === 0) {
        quizOpen = false;
        haptic(HAPTIC.correct);
        btn.classList.add("ok");
        optBtns[1].classList.add("dim");
        quizDone += 1;
        // 진행 중엔 서브텍스트만 갱신, 점등은 3판정 완료 때만(principleLab 조기 점등 사고 계승)
        chipOf("quiz").querySelector("span")!.textContent = `${quizDone} / 3`;
        if (quizDone >= 3) lightChip("quiz", "3 / 3");
        helper.innerHTML = PHASES[phase].quiz!.good;
        later(advance, 1500);
      } else {
        clean = false;
        haptic(HAPTIC.wrong);
        btn.classList.add("no");
        helper.innerHTML = PHASES[phase].quiz!.wrong;
        later(() => btn.classList.remove("no"), 900);
      }
    });
  });

  function actBtn(label: string): HTMLButtonElement {
    return el("button", { class: "btn ppl-act", attrs: { type: "button" }, text: label }) as HTMLButtonElement;
  }

  function mountPhase(): void {
    controls.innerHTML = "";
    const id = PHASES[phase].id;
    if (id === "equal") {
      refreshScene(equalSvg(false));
      const b = actBtn("같은 잣대 세우기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(equalSvg(true));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "저울이 수평이 됐어요. 일과 상관없는 이유로 <b>차별받지 않고 동등하게 대우받을</b> 권리가 섰어요. 그럼 이 방패의 정체는?";
        later(openQuiz, 900);
      });
    } else if (id === "free") {
      refreshScene(freeSvg(0));
      let n = 0;
      const b = actBtn("간섭 걷어 내기 (0/2)");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (n >= 2) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(freeSvg(n));
        b.textContent = `간섭 걷어 내기 (${n}/2)`;
        helper.innerHTML =
          n === 1
            ? "화살표가 힘을 잃어 가요. 한 번 더!"
            : "길이 열렸어요! <b>국가 권력의 간섭을 받지 않고</b> 자유롭게 사는 권리, <b>자유권</b>이에요. 신체·종교·사생활·표현·직업 선택의 자유, 재산권이 이 방패 아래 살죠.";
        if (n >= 2) {
          b.disabled = true;
          b.classList.add("done");
          later(advance, 1700);
        }
      });
    } else if (id === "part") {
      refreshScene(partSvg(0));
      let n = 0;
      const b = actBtn("투표함 열기 (0/2)");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (n >= 2) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(partSvg(n));
        b.textContent = `투표함 열기 (${n}/2)`;
        helper.innerHTML =
          n === 1
            ? "자물쇠가 풀리고 있어요. 한 번 더!"
            : "열렸어요! <b>국가의 의사 결정에 참여할</b> 권리, <b>참정권</b>이에요. 선거권, 공직을 맡는 공무 담임권, 국민 투표권이 이 방패의 식구랍니다. Ⅸ 단원 참정권 확대의 계단이 지킨 게 바로 이 상자였죠!";
        if (n >= 2) {
          b.disabled = true;
          b.classList.add("done");
          later(advance, 1700);
        }
      });
    } else if (id === "claim") {
      refreshScene(claimSvg(false));
      const b = actBtn("구제 요청서 내기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(claimSvg(true));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "접수 완료! 침해된 권리의 <b>구제나 예방을 국가에 요청할</b> 권리, 그런데 이 방패엔 특별한 별명이 있대요.";
        later(openQuiz, 900);
      });
    } else {
      refreshScene(socialSvg(false));
      const b = actBtn("안전망 펼치기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(socialSvg(true));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "안전망이 펼쳐졌어요. 학교(교육)와 살림(인간다운 생활)이 함께 왔네요. 그럼 이 다섯 번째 방패의 방향은?";
        later(openQuiz, 900);
      });
    }
  }

  mountPhase();
  api.setCTA("다섯 방패를 모두 세워요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
