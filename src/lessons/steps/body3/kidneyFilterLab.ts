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

// 무대 = 이전 버전 발주 모식도(nephron-process.webp — 빨강 혈관·노랑 세뇨관)를 그대로 살리고,
// 그 위에 라벨 필·단계 하이라이트·알갱이만 얹는다. 좌표는 이미지(960×617 → 340×219) 실측 %.
const KFL_IMG_BASE = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/");

function stageScene(): string {
  const pl = (x: number, y: number, text: string, stroke: string, ink: string): string => {
    const w = Math.round(text.length * 11.3) + 16;
    return `<rect x="${x - w / 2}" y="${y - 10}" width="${w}" height="20" rx="10" fill="#FFFFFF" fill-opacity="0.93" stroke="${stroke}" stroke-width="1.8"/>
      <text x="${x}" y="${y + 3.8}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${ink}">${text}</text>`;
  };
  const ld = (x1: number, y1: number, x2: number, y2: number, c: string): string =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.8"/>
     <circle cx="${x2}" cy="${y2}" r="2.6" fill="${c}" stroke="#FFFFFF" stroke-width="1.3"/>`;
  return `<svg viewBox="0 0 340 219" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <image href="${KFL_IMG_BASE}body/figs/v2/nephron-process.webp" x="0" y="0" width="340" height="219" preserveAspectRatio="xMidYMid slice"/>
    <!-- 단계 하이라이트(대기 중인 단계에 점멸) -->
    <rect class="kfl-hl fil" x="32" y="100" width="68" height="80" rx="16"/>
    <rect class="kfl-hl re" x="138" y="86" width="136" height="84" rx="16"/>
    <rect class="kfl-hl sec" x="92" y="129" width="238" height="30" rx="15"/>
    <!-- 구조·흐름 라벨 -->
    ${ld(46, 160, 56, 150, "#E07A85")}${pl(36, 168, "토리", "#E07A85", "#C9303E")}
    ${ld(95, 191, 86, 175, "#D9A76A")}${pl(112, 201, "보먼주머니", "#D9A76A", "#A9662B")}
    ${ld(150, 170, 150, 150, "#D9A76A")}${pl(150, 180, "세뇨관", "#D9A76A", "#A9662B")}
    ${ld(204, 82, 204, 92, "#E07A85")}${pl(204, 72, "모세혈관", "#E07A85", "#C9303E")}
    ${pl(42, 207, "콩팥동맥", "#E07A85", "#C9303E")}
    ${ld(300, 74, 312, 88, "#7F9DC4")}${pl(284, 64, "콩팥정맥으로", "#7F9DC4", "#3E5F8A")}
    ${ld(300, 167, 316, 148, "#E8A80C")}${pl(283, 177, "콩팥깔때기로", "#E8A80C", "#A9832B")}
    <!-- 알갱이들(토리 도착 혈액) -->
    ${grain("rbc", 55, 136, 7, B6.oxyBlood, "#8F1D2C")}
    ${grain("pro", 76, 151, 6.5, B6.protein, "#4B2DA8")}
    ${grain("glc1", 59, 154, 4.5, B6.glucose, "#C46A12")}
    ${grain("glc2", 73, 133, 4.5, B6.glucose, "#C46A12")}
    ${grain("wat1", 64, 144, 3.8, B6.water, "#12839B")}
    ${grain("wat2", 50, 147, 3.8, B6.water, "#12839B")}
    ${grain("wat3", 79, 141, 3.8, B6.water, "#12839B")}
    ${grain("ure1", 67, 157, 3.8, B6.urea, "#7A5D1D")}
    ${grain("ure2", 57, 128, 3.8, B6.urea, "#7A5D1D")}
    ${grain("ure3", 233, 115, 3.8, B6.urea, "#7A5D1D")}
  </svg>`;
}

/** 단계별 알갱이 목적지 — 여과(fil)·재흡수(re)·분비(sec) 후 좌표(이미지 실측 기반). */
const MOVES: Record<string, Record<string, [number, number]>> = {
  fil: {
    // 작은 알갱이는 보먼주머니를 지나 세뇨관 첫 구간(노랑 관)으로
    glc1: [104, 142], ure1: [115, 146], wat1: [127, 141], glc2: [139, 145], wat2: [151, 141], wat3: [163, 146], ure2: [175, 142],
    rbc: [57, 133], pro: [74, 153], // 큰 알갱이는 토리 안에 남는다(통과 실패 강조)
  },
  re: {
    glc1: [156, 103], glc2: [183, 115], wat1: [210, 103], wat2: [196, 160], // 모세혈관 그물로 복귀
    wat3: [206, 144], ure1: [230, 141], ure2: [250, 145], // 남는 것(세뇨관 계속 전진)
    rbc: [297, 93], pro: [318, 94], // 여과 안 된 것은 위 혈관을 타고 콩팥정맥 쪽으로
  },
  sec: {
    ure3: [233, 143], // 모세혈관 → 세뇨관으로 분비
    wat3: [266, 145], ure1: [287, 141], ure2: [306, 145], // 완성된 오줌은 출구 쪽으로 전진
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
    html: "콩팥동맥을 타고 혈액이 도착했어요. 큰 알갱이(<b>혈구·단백질</b>)와 작은 알갱이(<b>포도당·물·요소</b>)가 섞여 있죠. <b>1단계 여과</b> 버튼을 눌러 토리의 체를 돌려 보세요.",
  });

  const board = el("div", { class: "b6-board kfl-board", html: stageScene() });
  board.dataset.phase = "fil";
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
        "정수 완료! <b>여과(크기로 거르기) → 재흡수(필요한 건 되찾기) → 분비(남은 노폐물 더하기)</b>, 세뇨관에 남은 액체가 <b>오줌</b>이 되어 콩팥깔때기로 모여요.";
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
    board.dataset.phase = "";
    applyMoves("fil");
    board.classList.add("filtered");
    helper.innerHTML =
      "작은 알갱이들(포도당·물·요소)이 물과 함께 <b>보먼주머니로 빠져나갔어요</b>. 그런데 <b>혈구와 단백질</b>은 토리에 그대로, 왜일까요?";
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
            ? "맞아요! 여과는 <b>크기 기준</b>이에요. 소화(L2)에서 세포막 문이 그랬듯, 토리의 벽도 작은 것만 통과시키죠. 이제 <b>2단계 재흡수</b>!"
            : "골라내는 게 아니라 <b>크기</b> 문제예요. 토리의 벽은 체처럼 작은 물질만 통과시켜서, 큰 혈구·단백질은 혈액에 남는답니다. 이제 <b>2단계 재흡수</b>!";
          collect("fil", "크기로 걸렀다!");
          later(() => {
            qBox.style.display = "none";
            qBox.innerHTML = "";
            reBtn.disabled = false;
            board.dataset.phase = "re";
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
    board.dataset.phase = "";
    applyMoves("re");
    helper.innerHTML =
      "여과액이 세뇨관을 지나는 동안, <b>포도당은 전부</b>, <b>물은 대부분</b> 모세혈관으로 되돌아갔어요! 여과 안 됐던 혈구·단백질은 콩팥정맥으로 빠져나가고요.";
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
            ? "정확해요! 포도당은 작아서 <b>여과는 되지만</b>, 몸에 필요한 연료라 세뇨관에서 <b>전부 재흡수</b>돼요. 그래서 오줌엔 없죠. 마지막 <b>3단계 분비</b>!"
            : "포도당은 작아서 <b>여과는 돼요</b>(방금 빠져나갔죠!). 하지만 소중한 연료라 세뇨관에서 <b>전부 재흡수</b>되기 때문에 오줌에 없는 거랍니다. 마지막 <b>3단계 분비</b>!";
          collect("re", "필요한 건 되찾기!");
          later(() => {
            qBox.style.display = "none";
            qBox.innerHTML = "";
            secBtn.disabled = false;
            board.dataset.phase = "sec";
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
    board.dataset.phase = "";
    applyMoves("sec");
    helper.innerHTML =
      "여과되지 않고 혈액에 남아 있던 <b>노폐물(요소)</b>이 모세혈관에서 <b>세뇨관으로 분비</b>됐어요. 마지막 청소죠.";
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
