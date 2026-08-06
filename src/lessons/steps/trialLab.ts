// trialLab — 사회 Ⅺ L5 기함: 민사·형사 두 트랙 재판 절차 릴레이. "동화 나라 법원의 하루" —
// 요술 항아리 소유권 분쟁(민사: 소장→답변서·변론→판결, 미래엔 213쪽 절차도)과 가짜 항아리
// 사기 사건(형사: 고소·수사→기소→공판·판결)을 한 판씩 직접 굴린다. 사건은 전래 동화 각색
// (비상 210쪽 요술 항아리 도입 계승 — 설정 차용 허용 관례, 실명·실사건 0·범죄 장면 재현 0).
// electLab 국면 릴레이 문법 계승(ppl-* 릴레이 킷 CSS 재사용 — 신규 CSS 0줄).
// 판정 msn은 세 국면만(소장=원고 명명·민사 판결=분쟁 해결·기소=검사) — 여섯 번 전부 물으면
// 피로해서 조작 국면(답변·변론/수사/공판·판결)은 연타 조작만으로 전진한다.
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

function stickman(x: number, y: number, opts: { arm?: "up" | "down" | "out"; mood?: "ok" | "sad" | "joy"; r?: number; hat?: "straw" | "cap" } = {}): string {
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
  const hat =
    opts.hat === "straw"
      ? `<ellipse cx="${x}" cy="${y - r + 1}" rx="${r + 3}" ry="1.8" fill="#E2C878" stroke="#B89A48" stroke-width="1"/><path d="M${x - r * 0.66} ${y - r + 1} q${r * 0.66} -${r * 0.9} ${r * 1.32} 0z" fill="#E2C878" stroke="#B89A48" stroke-width="1"/>`
      : opts.hat === "cap"
        ? `<path d="M${x - r + 1} ${y - r + 2} q${r - 1} -${r * 0.8} ${r * 2 - 2} 0z" fill="#8A93A6" stroke="#5A6478" stroke-width="1"/><path d="M${x} ${y - r + 2} h${r + 2.4}" stroke="#5A6478" stroke-width="1.4"/>`
        : "";
  return `<g ${STICK}><circle cx="${x}" cy="${y}" r="${r}" fill="#F6EFE4"/>
    <path d="M${x} ${y + r}v${r + 6}M${x} ${y + r * 2 + 6}l-${r - 1} ${r + 3}M${x} ${y + r * 2 + 6}l${r - 1} ${r + 3}${arms}"/></g>${face}${hat}`;
}

/** 요술 항아리(사건의 증거물) */
function jar(x: number, y: number, s = 1, ghost = false): string {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${ghost ? 0.45 : 1}">
    <path d="M-9 0q-3-10 3-14h12q6 4 3 14 2 8-9 8t-9-8z" fill="url(#trl-jar)" stroke="#6E4610" stroke-width="1.6" stroke-linejoin="round"/>
    <ellipse cx="0" cy="-14" rx="7" ry="2.4" fill="#B07E2E" stroke="#6E4610" stroke-width="1.4"/>
    <ellipse cx="-4" cy="-6" rx="2.6" ry="4" fill="#fff" opacity=".35"/>
    ${ghost ? `<path d="M-4 -4l8 8M4 -4l-8 8" stroke="#C0392E" stroke-width="1.8" stroke-linecap="round"/>` : ""}
  </g>`;
}

const DEFS = `<defs>
  <linearGradient id="trl-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2F6"/></linearGradient>
  <linearGradient id="trl-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C89A5E"/><stop offset=".55" stop-color="#A87838"/><stop offset="1" stop-color="#8A6034"/></linearGradient>
  <linearGradient id="trl-jar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8CFA0"/><stop offset=".55" stop-color="#C8A360"/><stop offset="1" stop-color="#A8781E"/></linearGradient>
  <linearGradient id="trl-seal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B07E2E"/><stop offset="1" stop-color="#8C5A16"/></linearGradient>
</defs>`;

function wrap(inner: string): string {
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${DEFS}
    <ellipse cx="120" cy="144" rx="100" ry="5" fill="#2A3A5E" opacity=".1"/>${inner}</svg>`;
}

/** 판사석(공용 소품) — 높은 단상 + 판사 + 법봉 */
function bench(x = 120, y = 44): string {
  return `
    ${stickman(x, y - 18, { r: 5.6 })}
    <rect x="${x - 34}" y="${y}" width="68" height="22" rx="4" fill="url(#trl-desk)" stroke="#6E4E26" stroke-width="1.6"/>
    <rect x="${x - 40}" y="${y + 22}" width="80" height="6" rx="3" fill="#8A6034"/>
    <g transform="rotate(-24 ${x + 24} ${y - 6})">
      <rect x="${x + 18}" y="${y - 9}" width="13" height="6" rx="2.6" fill="url(#trl-desk)" stroke="#6E4E26" stroke-width="1.1"/>
      <rect x="${x + 23}" y="${y - 3}" width="2.6" height="9" rx="1.3" fill="#8A6034"/>
    </g>`;
}

// ── 민사 트랙 ──

// ① 소장 제출 — 법원 접수 창구(filed)
function msuSvg(filed: boolean): string {
  return wrap(`
    <rect x="128" y="58" width="76" height="58" rx="6" fill="url(#trl-paper)" stroke="#B8C2CE" stroke-width="1.6"/>
    <rect x="136" y="50" width="60" height="14" rx="7" fill="#8C5A16"/>
    <text x="166" y="60" text-anchor="middle" font-size="8.6" font-weight="800" fill="#FFF">법원 접수처</text>
    <rect x="140" y="76" width="52" height="30" rx="4" fill="#FBF6EC" stroke="#D8C8A8" stroke-width="1.3"/>
    ${stickman(58, 66, { mood: "ok", arm: "out", hat: "straw" })}
    <g transform="rotate(${filed ? 0 : -8} 96 84)"${filed ? ` class="hs8-noti"` : ""}>
      <rect x="${filed ? 150 : 84}" y="${filed ? 82 : 76}" width="24" height="18" rx="2.6" fill="url(#trl-paper)" stroke="#8A93A6" stroke-width="1.4"/>
      <path d="M${filed ? 155 : 89} ${filed ? 88 : 82}h14M${filed ? 155 : 89} ${filed ? 92 : 86}h9" stroke="#A8B2C2" stroke-width="1.3" stroke-linecap="round"/>
      ${filed ? `<circle cx="168" cy="95" r="4.6" fill="none" stroke="#C0392E" stroke-width="1.6"/><path d="M165.6 95l1.8 1.9 3-3.6" stroke="#C0392E" stroke-width="1.4" stroke-linecap="round" fill="none"/>` : ""}
    </g>
    ${jar(72, 116, 0.9)}
    <text x="120" y="140" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${filed ? "소장 접수 완료 — 민사 재판이 시작돼요" : "밭에서 나온 항아리, 누구의 것일까요?"}</text>`);
}

// ② 답변서·변론 — 법정(round 0=답변서, 1=원고 변론, 2=피고 변론)
function mansSvg(round: number): string {
  const talkL = round === 1;
  const talkR = round === 2;
  return wrap(`
    ${bench()}
    ${stickman(52, 92, { mood: "ok", arm: talkL ? "up" : "out", hat: "straw", r: 5.6 })}
    <rect x="30" y="118" width="44" height="10" rx="3" fill="url(#trl-desk)" stroke="#8A6A3E" stroke-width="1.3"/>
    ${stickman(188, 92, { mood: "ok", arm: talkR ? "up" : "out", r: 5.6 })}
    <rect x="166" y="118" width="44" height="10" rx="3" fill="url(#trl-desk)" stroke="#8A6A3E" stroke-width="1.3"/>
    ${round >= 1 ? jar(120, 112, 0.85) : `<g class="hs8-noti" transform="rotate(6 188 74)"><rect x="176" y="66" width="24" height="16" rx="2.4" fill="url(#trl-paper)" stroke="#8A93A6" stroke-width="1.4"/><path d="M181 71h14M181 75h9" stroke="#A8B2C2" stroke-width="1.2" stroke-linecap="round"/></g>`}
    ${talkL ? `<g class="hs8-noti"><ellipse cx="76" cy="66" rx="17" ry="10" fill="#FFF" stroke="#8A93A6" stroke-width="1.4"/><path d="M66 74l-5 6 10-3z" fill="#FFF" stroke="#8A93A6" stroke-width="1.2"/><path d="M68 64h16M68 69h11" stroke="#B8C2CE" stroke-width="1.5" stroke-linecap="round"/></g>` : ""}
    ${talkR ? `<g class="hs8-noti"><ellipse cx="164" cy="66" rx="17" ry="10" fill="#FFF" stroke="#8A93A6" stroke-width="1.4"/><path d="M174 74l5 6-10-3z" fill="#FFF" stroke="#8A93A6" stroke-width="1.2"/><path d="M156 64h16M161 69h11" stroke="#B8C2CE" stroke-width="1.5" stroke-linecap="round"/></g>` : ""}
    <text x="52" y="140" text-anchor="middle" font-size="8" font-weight="800" fill="#5A6478">원고(농부)</text>
    <text x="188" y="140" text-anchor="middle" font-size="8" font-weight="800" fill="#5A6478">피고(옛 주인)</text>`);
}

// ③ 판결(민사) — 선고(done)
function mjudSvg(done: boolean): string {
  return wrap(`
    ${bench()}
    ${stickman(52, 96, { mood: done ? "joy" : "ok", arm: done ? "up" : "out", hat: "straw", r: 5.6 })}
    ${stickman(188, 96, { mood: "ok", arm: "out", r: 5.6 })}
    ${done
      ? `<g class="hs8-noti">${jar(64, 122, 0.9)}<path d="M108 96q-18 4-34 14" stroke="#8C5A16" stroke-width="2" stroke-dasharray="4 4" fill="none"/><path d="M78 108l-6 3 3-6" fill="none" stroke="#8C5A16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>`
      : jar(120, 116, 0.85)}
    ${done ? `<g class="hs8-noti"><rect x="96" y="72" width="48" height="16" rx="8" fill="url(#trl-seal)"/><text x="120" y="83" text-anchor="middle" font-size="8.6" font-weight="900" fill="#FFF">판결 선고</text></g>` : ""}
    <text x="120" y="140" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${done ? "밭을 팔면 그 안의 것도 함께 — 항아리는 원고의 것!" : "양쪽 이야기를 다 들었어요 — 이제 판결의 시간"}</text>`);
}

// ── 형사 트랙 ──

// ④ 고소·수사(round 0=신고, 1=접수, 2=증거)
function crepSvg(round: number): string {
  return wrap(`
    <rect x="128" y="52" width="76" height="64" rx="6" fill="url(#trl-paper)" stroke="#B8C2CE" stroke-width="1.6"/>
    <rect x="136" y="44" width="60" height="14" rx="7" fill="#39455C"/>
    <text x="166" y="54" text-anchor="middle" font-size="8.6" font-weight="800" fill="#FFF">수사 기관</text>
    ${stickman(56, 70, { mood: "sad", arm: round >= 1 ? "up" : "out" })}
    ${jar(78, 112, 0.8, true)}
    ${round >= 1 ? `<g class="hs8-noti"><rect x="140" y="66" width="26" height="18" rx="2.6" fill="url(#trl-paper)" stroke="#8A93A6" stroke-width="1.4"/><path d="M145 72h16M145 77h10" stroke="#A8B2C2" stroke-width="1.3" stroke-linecap="round"/><circle cx="170" cy="82" r="4.4" fill="none" stroke="#C0392E" stroke-width="1.5"/><path d="M167.8 82l1.7 1.8 2.8-3.4" stroke="#C0392E" stroke-width="1.3" stroke-linecap="round" fill="none"/></g>` : ""}
    ${round >= 2 ? `<g class="hs8-noti"><circle cx="176" cy="102" r="9" fill="none" stroke="#39455C" stroke-width="2"/><path d="M183 109l7 7" stroke="#39455C" stroke-width="2.6" stroke-linecap="round"/><path d="M172 100q4-3 8 0" stroke="#8A93A6" stroke-width="1.3" fill="none"/></g>` : ""}
    <text x="120" y="140" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${round >= 2 ? "가짜 항아리 증거 확보 — 수사 마무리!" : round >= 1 ? "고소 접수 — 수사가 시작돼요" : "가짜 요술 항아리에 속아 돈을 잃었어요"}</text>`);
}

// ⑤ 기소 — 검사가 법원에 재판 요구(done)
function cindSvg(done: boolean): string {
  return wrap(`
    ${stickman(64, 70, { mood: "ok", arm: done ? "up" : "out" })}
    <rect x="46" y="104" width="36" height="12" rx="3" fill="#39455C"/>
    <text x="64" y="113" text-anchor="middle" font-size="8" font-weight="800" fill="#FFF">검사</text>
    <rect x="140" y="56" width="64" height="58" rx="6" fill="url(#trl-paper)" stroke="#B8C2CE" stroke-width="1.6"/>
    <path d="M148 56 v-8 h48 v8" fill="none" stroke="#B8C2CE" stroke-width="1.6"/>
    <path d="M144 48h56" stroke="#8A93A6" stroke-width="2" stroke-linecap="round"/>
    <text x="172" y="90" text-anchor="middle" font-size="9" font-weight="800" fill="#5A6478">법원</text>
    ${done ? `<g class="hs8-noti" transform="rotate(8 118 78)"><rect x="104" y="70" width="26" height="18" rx="2.6" fill="url(#trl-paper)" stroke="#8C5A16" stroke-width="1.6"/><path d="M109 76h16M109 81h11" stroke="#C8A360" stroke-width="1.4" stroke-linecap="round"/></g><path d="M92 86q14-4 40-4" stroke="#8C5A16" stroke-width="2" stroke-dasharray="4 4" fill="none"/><path d="M126 79l7 3-6 4" fill="none" stroke="#8C5A16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
    <text x="120" y="140" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${done ? "기소! 법원에 형사 재판을 요구했어요" : "수사 결과를 검토한 검사 — 재판을 열어야 할까요?"}</text>`);
}

// ⑥ 공판·판결(형사) — round 0=개정, 1=공판, 2=선고
function cjudSvg(round: number): string {
  return wrap(`
    ${bench()}
    ${stickman(48, 92, { mood: "ok", arm: round === 1 ? "up" : "out", r: 5.6 })}
    <rect x="30" y="118" width="38" height="10" rx="3" fill="#39455C"/>
    <text x="49" y="126" text-anchor="middle" font-size="7.6" font-weight="800" fill="#FFF">검사</text>
    ${stickman(148, 92, { mood: round >= 2 ? "sad" : "ok", arm: "down", r: 5.6 })}
    ${stickman(192, 92, { mood: "ok", arm: round === 1 ? "out" : "down", r: 5.6 })}
    <rect x="132" y="118" width="76" height="10" rx="3" fill="url(#trl-desk)" stroke="#8A6A3E" stroke-width="1.3"/>
    <text x="148" y="140" text-anchor="middle" font-size="7.6" font-weight="800" fill="#5A6478">피고인</text>
    <text x="192" y="140" text-anchor="middle" font-size="7.6" font-weight="800" fill="#5A6478">변호인</text>
    ${round >= 2 ? `<g class="hs8-noti"><rect x="92" y="70" width="56" height="16" rx="8" fill="url(#trl-seal)"/><text x="120" y="81" text-anchor="middle" font-size="8.6" font-weight="900" fill="#FFF">유죄 — 선고</text></g>` : ""}
    ${round === 1 ? `<g class="hs8-noti">${jar(120, 112, 0.8, true)}</g>` : ""}`);
}

// 피날레 — 두 무대 비교 띠
function stripSvg(): string {
  const row = (y: number, tone: string, name: string, steps: string[]): string => {
    const nodes = steps
      .map((t, i) => {
        const x = 66 + i * 46;
        return `<g>
        <circle cx="${x}" cy="${y}" r="11" fill="${tone}"/>
        <text x="${x}" y="${y + 3.2}" text-anchor="middle" font-size="9" font-weight="900" fill="#FFF">${i + 1}</text>
        <text x="${x}" y="${y + 22}" text-anchor="middle" font-size="7.4" font-weight="800" fill="#3E4A5C">${t}</text>
      </g>`;
      })
      .join("");
    const lines = steps
      .map((_, i) =>
        i === steps.length - 1
          ? ""
          : `<path d="M${66 + i * 46 + 12} ${y}h22" stroke="#B8C2CE" stroke-width="2" stroke-dasharray="4 4"/>`,
      )
      .join("");
    return `<rect x="12" y="${y - 16}" width="34" height="32" rx="6" fill="${tone}" opacity=".14"/>
      <text x="29" y="${y + 3.6}" text-anchor="middle" font-size="8.6" font-weight="900" fill="${tone}">${name}</text>${lines}${nodes}`;
  };
  return wrap(`
    ${row(40, "#2E6AC0", "민사", ["소장 제출", "답변서", "변론", "판결"])}
    ${row(102, "#8A5EC0", "형사", ["고소·수사", "기소", "공판", "판결"])}
    <text x="120" y="142" text-anchor="middle" font-size="9.2" font-weight="800" fill="#6E4610">두 무대 완주 — 분쟁도 범죄도 법정에서 풀려요!</text>`);
}

interface TrlPhase {
  id: string;
  fileLabel: string;
  stageName: string;
  intro: string;
  quiz?: { q: string; options: [string, string]; good: string; wrong: string };
}

const PHASES: TrlPhase[] = [
  {
    id: "msu",
    fileLabel: "민사 1",
    stageName: "소장 제출",
    intro: "사건 하나 — 밭을 산 농부가 밭에서 <b>요술 항아리</b>를 발견했는데, 밭을 판 옛 주인이 \"항아리는 내 것\"이라며 다투게 됐어요. 주먹 대신 법원으로! 농부가 <b>소장</b>을 내며 재판을 청구해요.",
    quiz: {
      q: "재판을 청구하며 소장을 낸 농부 — 민사 재판에서 뭐라고 부를까요?",
      options: ["소송을 제기한 원고", "소송을 당한 피고"],
      good: "맞아요! 소송을 <b>제기한</b> 쪽이 원고, 소송을 <b>당한</b> 쪽이 피고 — 민사 재판은 원고의 소장 제출로 시작된답니다.",
      wrong: "피고는 소송을 '당한' 옛 주인 쪽이에요 — 먼저 법원 문을 두드린 농부는 소송을 '제기한' 원고랍니다. 다시 골라 봐요!",
    },
  },
  {
    id: "mans",
    fileLabel: "민사 2",
    stageName: "답변서·변론",
    intro: "소장을 받은 법원이 피고에게 알렸어요 — 피고는 <b>답변서</b>로 응답하고, 법정에서 양쪽이 <b>변론</b>을 펼쳐요. 한 쪽씩 이야기를 들어 봐요!",
  },
  {
    id: "mjud",
    fileLabel: "민사 3",
    stageName: "판결(민사)",
    intro: "증거와 주장을 모두 살핀 판사 — 이제 <b>판결</b>을 선고할 시간이에요.",
    quiz: {
      q: "민사 재판에서 판사가 하는 일은 무엇일까요?",
      options: ["양쪽 주장을 살펴 누구 말이 옳은지 가리고, 배상이나 지급을 명한다", "죄를 지은 사람에게 징역 같은 형벌을 내린다"],
      good: "정확해요! 민사 재판은 <b>개인 사이의 분쟁을 해결</b>하는 무대 — 판사는 옳고 그름을 가려 배상·지급을 명해요. 형벌은 다음 무대의 일이랍니다.",
      wrong: "형벌은 범죄를 다루는 <b>형사 재판</b>의 일이에요 — 민사 재판의 판사는 개인 간 다툼에서 누구 말이 옳은지 가리고 배상·지급을 명한답니다. 다시 골라 봐요!",
    },
  },
  {
    id: "crep",
    fileLabel: "형사 1",
    stageName: "고소·수사",
    intro: "사건 둘 — 이번엔 <b>가짜 요술 항아리</b>를 진짜라고 속여 판 상인이 나타났어요. 속아서 돈을 잃은 피해자가 <b>고소</b>하면, 수사 기관이 <b>수사</b>를 시작해요.",
  },
  {
    id: "cind",
    fileLabel: "형사 2",
    stageName: "기소",
    intro: "수사가 끝났어요 — 이제 누군가 법원에 \"재판을 열어 주세요\"라고 요구해야 해요. 이 요구를 <b>기소</b>라고 하죠.",
    quiz: {
      q: "범죄 사건의 재판을 법원에 요구(기소)하는 사람은 누구일까요?",
      options: ["국가를 대표하는 검사", "피해자가 직접"],
      good: "맞아요! 형사 재판은 <b>검사의 기소</b>로 시작돼요 — 범죄는 피해자만의 일이 아니라 사회 질서를 흔드는 일이라, 국가를 대표하는 검사가 나선답니다.",
      wrong: "피해자는 <b>고소</b>로 수사를 요청할 뿐, 재판을 여는 <b>기소</b>는 국가를 대표하는 검사의 일이에요 — 민사 재판과 갈리는 결정적 차이랍니다. 다시 골라 봐요!",
    },
  },
  {
    id: "cjud",
    fileLabel: "형사 3",
    stageName: "공판·판결(형사)",
    intro: "기소된 사람 — 이제 <b>피고인</b>이라 불러요. 법정에서 <b>공판</b>이 열리고, 피고인은 <b>변호인</b>의 도움을 받을 수 있어요. 재판을 끝까지 진행해요!",
  },
];

// 기계 검산용 export(qa/audit-soc11-data.mjs — options[0]=정답 규약·단계 순서 검사)
export const TRIAL_PHASES = PHASES;

export const trialLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "steps" } }, el("b", { text: "여섯 국면" }), el("span", { text: "0 / 6" })),
    el("div", { class: "pn-badge world", dataset: { g: "quiz" } }, el("b", { text: "꼼꼼 판정" }), el("span", { text: "0 / 3" })),
    el("div", { class: "pn-badge world", dataset: { g: "final" } }, el("b", { text: "두 무대 완주" }), el("span", { text: "대기" })),
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
    chip.querySelector("span")!.textContent = `${stepsDone} / 6`;
    if (stepsDone >= 6 && !chip.classList.contains("on")) {
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
      fileTag.textContent = "재판 완주";
      refreshScene(stripSvg());
      lightChip("final", "완주!");
      helper.innerHTML =
        "두 무대 완주! <b>민사 = 소장 제출 → 답변서 → 변론 → 판결</b>, <b>형사 = 고소·수사 → 기소 → 공판 → 판결</b> — 시작하는 사람도(원고 vs 검사), 마주 서는 사람도(피고 vs 피고인) 다르지만, 둘 다 법정에서 다툼을 평화롭게 끝낸답니다!";
      api.recordQuiz(clean);
      api.enableCTA(s.cta ?? "재판 정리하러 가기");
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
        // 진행 중엔 서브텍스트만 갱신, 점등(on)은 3판정 완료 때만(principleLab 조기 점등 사고 계승)
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
    if (id === "msu") {
      refreshScene(msuSvg(false));
      const b = actBtn("소장 접수하기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(msuSvg(true));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "접수 도장 꾹 — 소장이 법원에 들어갔어요. 그런데 소장을 낸 농부, 재판에서는 특별한 이름으로 불려요.";
        later(openQuiz, 800);
      });
    } else if (id === "mans") {
      refreshScene(mansSvg(0));
      let n = 0;
      const b = actBtn("변론 듣기 (0/2)");
      controls.appendChild(b);
      helper.innerHTML = "피고의 <b>답변서</b>가 도착했어요 — \"항아리는 내 밭에 있었으니 내 것\"이라는 주장! 이제 법정에서 양쪽 변론을 들어요.";
      b.addEventListener("click", () => {
        if (n >= 2) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(mansSvg(n));
        b.textContent = `변론 듣기 (${n}/2)`;
        helper.innerHTML =
          n === 1
            ? "원고(농부)의 변론 — \"밭을 <b>산 뒤에</b> 나온 항아리이니, 밭과 함께 제 것이 되었어요.\""
            : "피고(옛 주인)의 변론 — \"항아리를 <b>판 적은 없으니</b> 여전히 제 것이에요.\" 양쪽 주장이 팽팽하네요!";
        if (n >= 2) {
          b.disabled = true;
          b.classList.add("done");
          later(advance, 1400);
        }
      });
    } else if (id === "mjud") {
      refreshScene(mjudSvg(false));
      const b = actBtn("판결 선고하기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(mjudSvg(true));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "\"밭을 팔 때는 그 안에 묻힌 것도 함께 넘어간다\" — 항아리는 <b>원고(농부)의 것</b>으로 판결! 그런데 이 판사가 한 일은 무엇이었을까요?";
        later(openQuiz, 900);
      });
    } else if (id === "crep") {
      refreshScene(crepSvg(0));
      let n = 0;
      const b = actBtn("수사 진행하기 (0/2)");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (n >= 2) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(crepSvg(n));
        b.textContent = `수사 진행하기 (${n}/2)`;
        helper.innerHTML =
          n === 1
            ? "피해자의 <b>고소</b>가 접수됐어요 — 수사 기관이 사건 조사를 시작해요."
            : "가짜 항아리와 거래 기록까지 — <b>증거</b>를 확보했어요! 수사 완료, 다음은 법원으로 가는 관문이에요.";
        if (n >= 2) {
          b.disabled = true;
          b.classList.add("done");
          later(advance, 1300);
        }
      });
    } else if (id === "cind") {
      refreshScene(cindSvg(false));
      const b = actBtn("기소하기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(cindSvg(true));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "공소장이 법원으로 — <b>기소</b> 완료! 그런데 방금 기소한 사람, 누구였을까요?";
        later(openQuiz, 800);
      });
    } else {
      refreshScene(cjudSvg(0));
      let n = 0;
      const b = actBtn("재판 진행하기 (0/2)");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (n >= 2) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(cjudSvg(n));
        b.textContent = `재판 진행하기 (${n}/2)`;
        helper.innerHTML =
          n === 1
            ? "<b>공판</b>이 열렸어요 — 검사가 증거를 내보이고, 피고인은 변호인의 도움을 받아 자신을 변호해요."
            : "증거에 따라 <b>유죄 판결</b> — 속여 판 값을 치르게 됐어요. 범죄를 가리고 형벌을 정하는 것, 이게 형사 재판이에요!";
        if (n >= 2) {
          b.disabled = true;
          b.classList.add("done");
          later(advance, 1500);
        }
      });
    }
  }

  mountPhase();
  api.setCTA("두 무대를 모두 완주해요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
