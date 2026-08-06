// suffrageLab — 사회 Ⅸ L4 기함: 투표권 타임라인 스크럽. 영국 선거권 확대(미래엔 173쪽 표 정본 —
// 1832 산업 자본가 → 1867 도시 소농민·노동자 → 1884 농촌·광산 노동자 → 1918 21세+ 남성·30세+ 여성 →
// 1928 21세+ 모든 성인)를 시대 슬라이더로 걸으며 "투표할 수 있는 사람"이 넓어지는 것을 본다.
// kimchiLab 변동성 국면의 시간 슬라이더 문법 계승 — 한 정거장 = 한 사건 = 한 점등.
// 판정은 msn-quiz(options[0]=정답), '보통 선거' 명명은 정답 직후(용어 선경험 — concept가 뒤에서 정리).
// 민감 가드: 스틱맨 무성별 기본형 — 유형 구분은 시각 표지가 아니라 라벨 필(텍스트)로만.
// rAF 없음 — CSS 트랜지션 + setTimeout 체인(타이머 Set 일괄 해제). CSS 접두 sfr-(sfl-은 math2 shiftLab 선점).
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

/** 유형 카드 4종 — 점등 상태: 0=없음, 1=일부(1918 여성 30세+), 2=전부 */
interface Voter {
  id: string;
  label: string;
  sub: string;
}
const VOTERS: Voter[] = [
  { id: "fac", label: "공장 주인", sub: "산업 자본가" },
  { id: "city", label: "도시 노동자", sub: "소농민 포함" },
  { id: "farm", label: "농촌·광산 노동자", sub: "일하는 사람들" },
  { id: "women", label: "여성", sub: "성별의 벽" },
];

interface Era {
  year: string;
  title: string;
  desc: string; // helper
  lit: Record<string, 0 | 1 | 2>; // 유형 id → 점등
}
const ERAS: Era[] = [
  {
    year: "1832년 이전",
    title: "닫힌 투표함",
    desc: "왕과 귀족, 큰 땅을 가진 아주 적은 사람들만의 시대예요 — 네 유형 모두 투표함 앞에 설 수 없었죠. 슬라이더를 밀어 시간을 걸어 봐요!",
    lit: { fac: 0, city: 0, farm: 0, women: 0 },
  },
  {
    year: "1832년",
    title: "공장 주인의 입장",
    desc: "상공업으로 부를 쌓은 <b>산업 자본가</b>가 먼저 투표권을 얻었어요 — 하지만 여전히 재산이 기준이었죠.",
    lit: { fac: 2, city: 0, farm: 0, women: 0 },
  },
  {
    year: "1867년",
    title: "도시의 문이 열리다",
    desc: "<b>도시의 소농민과 노동자</b>가 투표함 앞에 섰어요 — 노동자들이 헌장을 들고 벌인 꾸준한 서명 운동(차티스트 운동)이 길을 닦았죠.",
    lit: { fac: 2, city: 2, farm: 0, women: 0 },
  },
  {
    year: "1884년",
    title: "농촌과 광산까지",
    desc: "<b>농촌과 광산의 노동자</b>도 투표권을 얻었어요 — 일하는 사람 대부분의 손에 투표지가 쥐어졌지만, 아직 절반이 남아 있어요.",
    lit: { fac: 2, city: 2, farm: 2, women: 0 },
  },
  {
    year: "1918년",
    title: "여성, 첫 투표",
    desc: "거리 시위와 행진을 이어 간 여성 참정권 운동 끝에 — <b>30세 이상 여성</b>이 처음으로 투표했어요(남성은 21세 이상 모두). 절반의 문이 마저 열리기 시작한 순간!",
    lit: { fac: 2, city: 2, farm: 2, women: 1 },
  },
  {
    year: "1928년",
    title: "모두의 투표함",
    desc: "마침내 <b>21세 이상의 모든 사람</b>이 동등하게 투표하게 됐어요 — 재산도, 성별도 더는 기준이 아니에요!",
    lit: { fac: 2, city: 2, farm: 2, women: 2 },
  },
];

// 기계 검산용 export(qa/audit-soc9-data.mjs — 점등 단조 증가·정거장 수 검사)
export const SUFFRAGE_ERAS = ERAS;
export const SUFFRAGE_VOTERS = VOTERS;

/** 투표함 + 유형 카드 4 무대 SVG */
function stageSvg(lit: Record<string, 0 | 1 | 2>, final: boolean): string {
  const cardW = 52;
  const gap = 6;
  const x0 = (240 - (cardW * 4 + gap * 3)) / 2;
  const cards = VOTERS.map((v, i) => {
    const x = x0 + i * (cardW + gap);
    const state = lit[v.id] ?? 0;
    const on = state === 2;
    const half = state === 1;
    const ink = on ? "#1864AB" : half ? "#4A86C8" : "#A8B2C2";
    const fill = on ? "#EAF2FB" : half ? "#F1F6FC" : "#F4F6FA";
    const slip = state > 0
      ? `<g transform="rotate(-12 ${x + cardW - 13} 84)"><rect x="${x + cardW - 19}" y="79" width="12" height="15" rx="1.6" fill="#FFFFFF" stroke="#1864AB" stroke-width="1.3"/><circle cx="${x + cardW - 13}" cy="86" r="2.4" fill="none" stroke="#1864AB" stroke-width="1.2"/></g>`
      : "";
    const halfBadge = half
      ? `<rect x="${x + 4}" y="60" width="${cardW - 8}" height="11" rx="5.5" fill="#4A86C8"/><text x="${x + cardW / 2}" y="68" text-anchor="middle" font-size="7.4" font-weight="800" fill="#FFFFFF">30세 이상만</text>`
      : "";
    return `<g class="sfr-card${state > 0 ? " on" : ""}">
      <rect x="${x}" y="52" width="${cardW}" height="66" rx="9" fill="${fill}" stroke="${ink}" stroke-width="1.6"/>
      <g ${STICK} opacity="${state > 0 ? 1 : 0.45}">
        <circle cx="${x + cardW / 2}" cy="70" r="6.4" fill="#F6EFE4"/>
        <path d="M${x + cardW / 2} 76v13M${x + cardW / 2} 89l-5 9M${x + cardW / 2} 89l5 9M${x + cardW / 2} 80l-7 5M${x + cardW / 2} 80l7 5"/>
      </g>
      ${state > 0 ? `<circle cx="${x + cardW / 2 - 2.1}" cy="69" r="1" fill="#3C4654"/><circle cx="${x + cardW / 2 + 2.1}" cy="69" r="1" fill="#3C4654"/><path d="M${x + cardW / 2 - 1.8} 72.6q1.8 1.4 3.6 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>` : `<circle cx="${x + cardW / 2 - 2.1}" cy="69" r="1" fill="#8A93A6"/><circle cx="${x + cardW / 2 + 2.1}" cy="69" r="1" fill="#8A93A6"/><path d="M${x + cardW / 2 - 1.8} 73.2h3.6" stroke="#8A93A6" stroke-width="1.2"/>`}
      ${slip}
      ${halfBadge}
      <rect x="${x + 2}" y="104" width="${cardW - 4}" height="12" rx="6" fill="${on ? "#1864AB" : half ? "#4A86C8" : "#7E8AA0"}"/>
      <text x="${x + cardW / 2}" y="112.6" text-anchor="middle" font-size="${v.label.length > 6 ? 6.6 : 7.6}" font-weight="800" fill="#FFFFFF">${v.label}</text>
    </g>`;
  }).join("");
  const glow = final ? `<circle cx="120" cy="26" r="20" fill="#F2C24E" opacity=".22"/><path d="M100 12l2 4.4 4.4 2-4.4 2-2 4.4-2-4.4-4.4-2 4.4-2zM142 14l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z" fill="#F2C24E"/>` : "";
  return `<svg viewBox="0 0 240 126" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="sfr-box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A86C8"/><stop offset=".55" stop-color="#1864AB"/><stop offset="1" stop-color="#124F86"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="120" rx="98" ry="4.6" fill="#2A3A5E" opacity=".1"/>
    ${glow}
    <rect x="98" y="18" width="44" height="26" rx="5" fill="url(#sfr-box)" stroke="#0F4676" stroke-width="1.6"/>
    <rect x="110" y="15" width="20" height="4" rx="2" fill="#0F4676"/>
    <path d="M104 30l3 3.2 5.6-6" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
    <ellipse cx="106" cy="21.5" rx="5" ry="1.6" fill="#fff" opacity=".3"/>
    ${cards}
  </svg>`;
}

export const suffrageLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "walk" } }, el("b", { text: "시대 완주" }), el("span", { text: "1 / 6" })),
    el("div", { class: "pn-badge world", dataset: { g: "first" } }, el("b", { text: "첫 투표" }), el("span", { text: "1918 찾기" })),
    el("div", { class: "pn-badge world", dataset: { g: "name" } }, el("b", { text: "한 줄 판정" }), el("span", { text: "대기" })),
  );
  const helper = el("div", { class: "helper", html: ERAS[0].desc });

  const yearPill = el("div", { class: "sfr-year", text: `${ERAS[0].year} · ${ERAS[0].title}` });
  const sceneBox = el("div", { class: "sfr-scene" });
  const stage = el("div", { class: "stage sfr-stage" }, yearPill, sceneBox);

  // 조작부: 시대 슬라이더
  const range = el("input", {
    class: "sfr-range",
    attrs: { type: "range", min: "0", max: String(ERAS.length - 1), step: "1", value: "0", "aria-label": "시대 슬라이더" },
  }) as HTMLInputElement;
  const ends = el("div", { class: "sfr-ends" }, el("span", { text: "1832년 이전" }), el("span", { text: "1928년" }));
  const controls = el("div", { class: "sfr-controls" }, range, ends);

  // 판정(msn 문법 — options[0]=정답, 셔플 없음)
  const quizQ = el("div", { class: "msn-q", html: "여섯 정거장을 걸어 봤어요. 투표권은 어떻게 모두의 것이 되었을까요?" });
  const OPTS = [
    "권리를 요구한 사람들의 꾸준한 노력으로 조금씩 넓어졌다",
    "시간이 지나자 저절로 모두에게 주어졌다",
  ];
  const optBtns = [0, 1].map((i) =>
    el("button", { class: "msn-opt", attrs: { type: "button" }, dataset: { o: String(i) }, html: OPTS[i] }),
  );
  const quizCard = el("div", { class: "msn-quiz sfr-quiz" }, quizQ, ...optBtns);

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
  const setChip = (g: string, sub?: string): void => {
    const chip = goalChips.querySelector(`[data-g="${g}"]`) as HTMLElement;
    if (!chip) return;
    if (sub) chip.querySelector("span")!.textContent = sub;
    if (!chip.classList.contains("on")) {
      chip.classList.add("on");
      haptic(HAPTIC.ctaUnlock);
    }
  };

  const visited = new Set<number>([0]);
  let sawFirstVote = false;
  let quizOpen = false;
  let quizDone = false;
  let clean = true;

  sceneBox.innerHTML = stageSvg(ERAS[0].lit, false);

  function openQuiz(): void {
    if (quizOpen || quizDone) return;
    quizOpen = true;
    setChip("name", "판정 중");
    quizCard.classList.add("show");
    later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function paint(): void {
    const i = Number(range.value);
    const era = ERAS[i];
    yearPill.textContent = `${era.year} · ${era.title}`;
    sceneBox.classList.remove("in");
    void sceneBox.offsetWidth;
    sceneBox.classList.add("in");
    sceneBox.innerHTML = stageSvg(era.lit, i === ERAS.length - 1);
    helper.innerHTML = era.desc;
    if (!visited.has(i)) {
      visited.add(i);
      haptic(HAPTIC.select);
      const chip = goalChips.querySelector('[data-g="walk"]') as HTMLElement;
      chip.querySelector("span")!.textContent = `${visited.size} / ${ERAS.length}`;
      if (visited.size >= ERAS.length) setChip("walk", "완주!");
    }
    if (i === 4 && !sawFirstVote) {
      sawFirstVote = true;
      haptic(HAPTIC.correct);
      setChip("first", "1918 도착!");
    }
    if (visited.size >= ERAS.length && !quizDone) {
      helper.innerHTML = era.desc + " 이제 아래에서 이 여행의 뜻을 골라 봐요!";
      later(openQuiz, 500);
    }
  }
  range.addEventListener("input", paint);

  optBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (!quizOpen || quizDone) return;
      if (i === 0) {
        quizDone = true;
        quizOpen = false;
        haptic(HAPTIC.correct);
        btn.classList.add("ok");
        optBtns[1].classList.add("dim");
        setChip("name", "완료!");
        helper.innerHTML =
          "정확해요! 차티스트 운동도, 여성 참정권 운동도 — 투표권은 <b>권리를 요구한 사람들의 노력</b>으로 한 칸씩 넓어졌어요. 그렇게 20세기 중반, 일정한 나이가 된 <b>모든</b> 사람에게 제한 없이 선거권을 주는 <b>보통 선거</b> 제도가 자리 잡았답니다!";
        api.recordQuiz(clean);
        api.enableCTA(s.cta ?? "발전 과정 정리하기");
      } else {
        clean = false;
        haptic(HAPTIC.wrong);
        btn.classList.add("no");
        helper.innerHTML =
          "저절로였다면 1832년과 1928년 사이 100년이 걸릴 이유가 없죠 — 정거장마다 헌장을 든 서명 운동, 거리의 행진이 있었어요. 다시 골라 봐요!";
        later(() => btn.classList.remove("no"), 900);
      }
    });
  });

  api.setCTA("여섯 정거장을 모두 걸어요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
