// [중2 Ⅵ v3] L5 kidneyFilterLab — 「콩팥 정수장」.
// 한 통찰: 여과는 크기 기준, 재흡수는 필요 기준 — 그래서 정상 오줌엔 혈구·단백질·포도당이 없다.
// (교과서 228~229쪽 그림 VI-14 「오줌이 만들어지는 과정」: 여과 → 재흡수 → 분비.)
// 조작: 단계 버튼 3개(여과·재흡수·분비) → 알갱이 이동(CSS translate) → 판정(b4Ask) 2회.
// 알갱이: 혈구(대)·단백질(대)·포도당(소)·물(소)·요소(소) — 크기가 곧 규칙. rAF·캔버스 없음.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { B6 } from "../../../ui/body3Kit";
import type { StepRenderer } from "../../types";

interface KflStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 알갱이 — id별 시작 좌표(혈관 쪽)와 크기·색. move 클래스로 단계 이동. */
function grain(id: string, cx: number, cy: number, r: number, c: string, stroke: string): string {
  return `<g class="kfl-grain kfl-${id}" style="transform: translate(${cx}px, ${cy}px)">
    <circle r="${r}" fill="${c}" stroke="${stroke}" stroke-width="2.2"/>
  </g>`;
}

function stageScene(): string {
  return `<svg viewBox="0 0 340 252" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="kflTube" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FDEDE4"/><stop offset="1" stop-color="#F8DCCB"/>
      </linearGradient>
    </defs>
    <!-- 콩팥동맥(입구) → 토리 → 콩팥정맥(출구) 혈관 트랙 -->
    <path d="M10 46 h64" stroke="#E05B6E" stroke-width="18" stroke-linecap="round" opacity="0.45"/>
    <path d="M266 46 h64" stroke="#7F9DC4" stroke-width="18" stroke-linecap="round" opacity="0.45"/>
    <text x="16" y="24" font-size="11.5" font-weight="800" fill="#C9303E">콩팥동맥</text>
    <text x="270" y="24" font-size="11.5" font-weight="800" fill="#3E5F8A">콩팥정맥</text>
    <!-- 토리(실뭉치) + 보먼주머니 -->
    <circle cx="150" cy="52" r="34" fill="#FDE2E5" stroke="#E07A85" stroke-width="3"/>
    <path d="M128 42 q10 -12 24 -4 q14 -10 20 4 q10 8 -2 16 q2 14 -14 10 q-14 8 -20 -4 q-12 -4 -8 -22" stroke="#D96A78" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M104 66 a52 52 0 0 0 92 0" stroke="#C9A876" stroke-width="4" fill="none"/>
    <text x="150" y="14" text-anchor="middle" font-size="12" font-weight="800" fill="#C9303E">토리</text>
    <text x="228" y="86" font-size="11.5" font-weight="800" fill="#A9832B">보먼주머니</text>
    <path d="M224 82 l-24 -6" stroke="#B0B8C1" stroke-width="1.8"/>
    <!-- 세뇨관 -->
    <path d="M150 92 v26 q0 16 -44 16 q-44 0 -44 22 q0 22 44 22 q56 0 76 8" stroke="url(#kflTube)" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="M150 92 v26 q0 16 -44 16 q-44 0 -44 22 q0 22 44 22 q56 0 76 8" stroke="#D9A76A" stroke-width="22" fill="none" stroke-linecap="round" opacity="0.25"/>
    <text x="52" y="132" font-size="11.5" font-weight="800" fill="#A9662B">세뇨관</text>
    <!-- 모세혈관(세뇨관 옆) -->
    <path d="M236 118 q30 24 6 52 q-18 22 8 40" stroke="#E05B6E" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.4"/>
    <text x="266" y="126" font-size="11.5" font-weight="800" fill="#C9303E">모세혈관</text>
    <!-- 오줌 출구 -->
    <path d="M188 210 q26 10 30 26" stroke="#F5D664" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.7"/>
    <text x="242" y="238" font-size="11.5" font-weight="800" fill="#A9832B">콩팥깔때기로</text>
    <!-- 알갱이들(혈관 시작점) -->
    ${grain("rbc", 34, 46, 9, B6.oxyBlood, "#8F1D2C")}
    ${grain("pro", 62, 46, 8, B6.protein, "#4B2DA8")}
    ${grain("glc1", 92, 40, 4.5, B6.glucose, "#C46A12")}
    ${grain("glc2", 104, 54, 4.5, B6.glucose, "#C46A12")}
    ${grain("wat1", 120, 42, 4, B6.water, "#12839B")}
    ${grain("wat2", 132, 56, 4, B6.water, "#12839B")}
    ${grain("wat3", 118, 62, 4, B6.water, "#12839B")}
    ${grain("ure1", 146, 44, 4, B6.urea, "#7A5D1D")}
    ${grain("ure2", 160, 58, 4, B6.urea, "#7A5D1D")}
    ${grain("ure3", 246, 120, 4, B6.urea, "#7A5D1D")}
  </svg>`;
}

/** 단계별 알갱이 목적지 — 여과(fil)·재흡수(re)·분비(sec) 후 좌표. */
const MOVES: Record<string, Record<string, [number, number]>> = {
  fil: {
    glc1: [128, 106], glc2: [148, 118], wat1: [116, 128], wat2: [136, 132], wat3: [156, 104], ure1: [124, 144], ure2: [150, 140],
    rbc: [120, 46], pro: [150, 30], // 큰 알갱이는 토리 안에 남는다(통과 실패 강조 위치)
  },
  re: {
    glc1: [238, 128], glc2: [244, 152], wat1: [240, 176], wat2: [246, 200], // 모세혈관으로 복귀
    wat3: [96, 148], ure1: [110, 190], ure2: [166, 206], // 남는 것(세뇨관 계속)
    rbc: [292, 40], pro: [304, 52], // 여과 안 된 것은 콩팥정맥으로 흘러 나감
  },
  sec: {
    ure3: [206, 168], // 모세혈관 → 세뇨관으로 분비
  },
};

export const kidneyFilterLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as KflStep;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge b6", dataset: { g: "fil" } }, el("b", { text: "1단계 여과" }), el("span", { text: "버튼 대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "re" } }, el("b", { text: "2단계 재흡수" }), el("span", { text: "잠김" })),
    el("div", { class: "pn-badge b6", dataset: { g: "sec" } }, el("b", { text: "3단계 분비" }), el("span", { text: "잠김" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "콩팥동맥을 타고 혈액이 도착했어요 — 큰 알갱이(<b>혈구·단백질</b>)와 작은 알갱이(<b>포도당·물·요소</b>)가 섞여 있죠. <b>1단계 여과</b> 버튼을 눌러 토리의 체를 돌려 보세요.",
  });

  const board = el("div", { class: "b6-board kfl-board", html: stageScene() });
  const legend = el("div", {
    class: "kfl-legend",
    html: `<span><i style="background:${B6.oxyBlood}"></i>혈구</span><span><i style="background:${B6.protein}"></i>단백질</span><span><i style="background:${B6.glucose}"></i>포도당</span><span><i style="background:${B6.water}"></i>물</span><span><i style="background:${B6.urea}"></i>요소</span>`,
  });

  const filBtn = el("button", { class: "kfl-btn", text: "1단계 · 여과", attrs: { type: "button" } }) as HTMLButtonElement;
  const reBtn = el("button", { class: "kfl-btn", text: "2단계 · 재흡수", attrs: { type: "button" } }) as HTMLButtonElement;
  const secBtn = el("button", { class: "kfl-btn", text: "3단계 · 분비", attrs: { type: "button" } }) as HTMLButtonElement;
  reBtn.disabled = true;
  secBtn.disabled = true;
  const btnRow = el("div", { class: "kfl-btnrow" }, filBtn, reBtn, secBtn);

  const qBox = el("div", { class: "hook-choices kfl-q" });
  qBox.style.display = "none";

  const goals = new Set<string>();
  let finished = false;
  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chipEl = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chipEl.classList.add("on");
    chipEl.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정수 완료! <b>여과(크기로 거르기) → 재흡수(필요한 건 되찾기) → 분비(남은 노폐물 더하기)</b> — 세뇨관에 남은 액체가 <b>오줌</b>이 되어 콩팥깔때기로 모여요.";
      api.enableCTA(s.cta ?? "정리하기");
    }
  }

  function applyMoves(phase: string): void {
    const moves = MOVES[phase];
    Object.entries(moves).forEach(([id, [x, y]]) => {
      const g = board.querySelector(`.kfl-${id}`) as SVGGElement | null;
      if (g) (g as unknown as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  // ── 1단계 여과 ──
  filBtn.addEventListener("click", () => {
    if (goals.has("fil")) return;
    haptic(HAPTIC.tap);
    filBtn.disabled = true;
    applyMoves("fil");
    board.classList.add("filtered");
    helper.innerHTML =
      "작은 알갱이들(포도당·물·요소)이 물과 함께 <b>보먼주머니로 빠져나갔어요</b>. 그런데 <b>혈구와 단백질</b>은 토리에 그대로 — 왜일까요?";
    later(() => {
      b4Ask(
        qBox,
        "혈구와 단백질이 여과되지 <b>않은</b> 까닭은 뭘까요?",
        [
          { t: "크기가 커서 토리의 벽을 빠져나가지 못해서", ok: true },
          { t: "콩팥이 혈구만 골라 붙잡아서", ok: false },
          { t: "혈구가 무거워 아래로 가라앉아서", ok: false },
        ],
        (ok) => {
          helper.innerHTML = ok
            ? "맞아요! 여과는 <b>크기 기준</b>이에요 — 소화(L2)에서 세포막 문이 그랬듯, 토리의 벽도 작은 것만 통과시키죠. 이제 <b>2단계 재흡수</b>!"
            : "골라내는 게 아니라 <b>크기</b> 문제예요 — 토리의 벽은 체처럼 작은 물질만 통과시켜서, 큰 혈구·단백질은 혈액에 남는답니다. 이제 <b>2단계 재흡수</b>!";
          collect("fil", "크기로 걸렀다!");
          later(() => {
            qBox.style.display = "none";
            qBox.innerHTML = "";
            reBtn.disabled = false;
            reBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 1400);
        },
      );
    }, 1400);
  });

  // ── 2단계 재흡수 ──
  reBtn.addEventListener("click", () => {
    if (!goals.has("fil") || goals.has("re")) return;
    haptic(HAPTIC.tap);
    reBtn.disabled = true;
    applyMoves("re");
    helper.innerHTML =
      "여과액이 세뇨관을 지나는 동안 — <b>포도당은 전부</b>, <b>물은 대부분</b> 모세혈관으로 되돌아갔어요! 여과 안 됐던 혈구·단백질은 콩팥정맥으로 빠져나가고요.";
    later(() => {
      b4Ask(
        qBox,
        "건강한 사람의 오줌에 <b>포도당이 없는</b> 까닭은 뭘까요?",
        [
          { t: "여과된 포도당이 세뇨관에서 전부 재흡수되어서", ok: true },
          { t: "포도당은 애초에 여과되지 않아서", ok: false },
          { t: "포도당이 오줌 속에서 분해되어 버려서", ok: false },
        ],
        (ok) => {
          api.recordQuiz(ok);
          helper.innerHTML = ok
            ? "정확해요! 포도당은 작아서 <b>여과는 되지만</b>, 몸에 필요한 연료라 세뇨관에서 <b>전부 재흡수</b>돼요 — 그래서 오줌엔 없죠. 마지막 <b>3단계 분비</b>!"
            : "포도당은 작아서 <b>여과는 돼요</b>(방금 빠져나갔죠!). 하지만 소중한 연료라 세뇨관에서 <b>전부 재흡수</b>되기 때문에 오줌에 없는 거랍니다. 마지막 <b>3단계 분비</b>!";
          collect("re", "필요한 건 되찾기!");
          later(() => {
            qBox.style.display = "none";
            qBox.innerHTML = "";
            secBtn.disabled = false;
            secBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 1400);
        },
      );
    }, 1400);
  });

  // ── 3단계 분비 ──
  secBtn.addEventListener("click", () => {
    if (!goals.has("re") || goals.has("sec")) return;
    haptic(HAPTIC.tap);
    secBtn.disabled = true;
    applyMoves("sec");
    helper.innerHTML =
      "여과되지 않고 혈액에 남아 있던 <b>노폐물(요소)</b>이 모세혈관에서 <b>세뇨관으로 분비</b>됐어요 — 마지막 청소죠.";
    later(() => collect("sec", "노폐물 마무리!"), 1200);
  });

  host.append(goalChips, helper, board, legend, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("1단계 여과부터 눌러 보세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
