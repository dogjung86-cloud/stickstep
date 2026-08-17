// [중2 Ⅴ v3] L6 sapFlowLab — 「설탕 배달로 — 필요한 곳으로 위·아래로」.
// 한 통찰: 잎의 녹말은 (주로 밤에) 물에 녹는 설탕으로 바뀌어 체관을 타고,
// 정해진 방향이 아니라 "필요한 기관을 향해 위로도 아래로도" 이동한다(과학 가드).
// 조작: 밤 버튼(녹말→설탕 변신) → 방향 판정(b4Ask) → 목적지 버튼 3개(꽃·열매·뿌리 배송).
// 알갱이 이동은 SMIL animateMotion(begin="indefinite" — rAF·캔버스 없음, hookAtom 관행).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { P3 } from "../../../ui/plant3Kit";
import type { StepRenderer } from "../../types";

interface SfrStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 체관 경로(원천 잎(왼쪽 중간 큰 잎) → 줄기 합류 → 목적지) — 좌표는 whole-plant.webp(820²→340²) 실측 역산. */
const JOIN = "M86 142 C106 148 138 152 162 150";
const ROUTES: Record<string, string> = {
  flower: `${JOIN} C166 149 169 146 169 140 L170 82 C170 72 160 69 151 68`,
  fruit: `${JOIN} C168 151 172 153 173 157 C174 162 186 164 194 163`,
  root: `${JOIN} C168 151 171 156 172 164 L172 246 C171 268 170 284 170 298`,
};

function stageScene(): string {
  const base = (import.meta as unknown as { env: { BASE_URL: string } }).env.BASE_URL;
  const dots = (key: string): string =>
    [0, 1, 2]
      .map(
        () => `<circle class="sfr-dot sfr-dot-${key}" r="4.5" fill="${P3.sugar}" stroke="#FFFFFF" stroke-width="2" opacity="0">
          <animateMotion class="sfr-am" data-route="${key}" dur="1.5s" begin="indefinite" fill="freeze" keyPoints="0;1" keyTimes="0;1" path="${ROUTES[key]}"/>
        </circle>`,
      )
      .join("");
  // 정거장 = 흰 할로 + 색 링(실사 위 마커). 태그 필은 도착(fed) 순간 팝.
  const ring = (cx: number, cy: number, r: number, color: string): string =>
    `<g class="sfr-st-art">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#FFFFFF" stroke-width="5.5" opacity="0.85"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="2.6" stroke-dasharray="7 5" stroke-linecap="round"/>
    </g>`;
  return `<svg viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <filter id="sfrSh" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="1.4" stdDeviation="1.6" flood-color="#2A3A5E" flood-opacity="0.28"/>
      </filter>
    </defs>
    <!-- 무대 = 발주 실사(토마토 전신, 꽃·열매·잎·줄기·뿌리 단면) -->
    <image href="${base}plant/figs/whole-plant.webp" x="0" y="0" width="340" height="340"/>
    <!-- 밤 베일(multiply, 수채화를 살린 채 어둡게) -->
    <rect class="sfr-veil" x="0" y="0" width="340" height="340" fill="#2C3B6E"/>
    <!-- 달 + 별(밤에만) -->
    <g class="sfr-moon">
      <path d="M304 28 a13 13 0 1 0 7 23 a10 10 0 0 1 -7 -23" fill="#FFE8A3"/>
      <circle cx="282" cy="58" r="2" fill="#FFE8A3"/>
      <circle cx="324" cy="66" r="1.6" fill="#FFE8A3"/>
    </g>
    <!-- 체관(줄기 속 통로) 표시 -->
    <path d="M170 62 C168 105 171 145 172 185 C173 215 171 233 170 248" stroke="${P3.sugar}" stroke-width="3" stroke-dasharray="5 4" opacity="0.8"/>
    <g filter="url(#sfrSh)">
      <line x1="144" y1="222" x2="166" y2="224" stroke="${P3.sugar}" stroke-width="2" opacity="0.8"/>
      <rect x="98" y="212" width="46" height="20" rx="10" fill="#FFFFFF" fill-opacity="0.95" stroke="${P3.sugar}" stroke-width="2"/>
      <text x="121" y="226" text-anchor="middle" font-size="11" font-weight="800" fill="#8A6D1A">체관</text>
    </g>
    <!-- 원천 잎(왼쪽 중간 큰 잎) 위 알갱이, 낮 녹말 ↔ 밤 설탕 -->
    <g class="sfr-grain sfr-starch">
      <rect x="78" y="130" width="11" height="11" rx="3" fill="${P3.starch}" stroke="#FFFFFF" stroke-width="1.8"/>
      <rect x="94" y="137" width="11" height="11" rx="3" fill="${P3.starch}" stroke="#FFFFFF" stroke-width="1.8"/>
      <rect x="84" y="146" width="11" height="11" rx="3" fill="${P3.starch}" stroke="#FFFFFF" stroke-width="1.8"/>
    </g>
    <g class="sfr-grain sfr-sugar">
      <circle cx="84" cy="136" r="6.5" fill="${P3.sugar}" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="100" cy="143" r="6.5" fill="${P3.sugar}" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="90" cy="152" r="6.5" fill="${P3.sugar}" stroke="#FFFFFF" stroke-width="2"/>
    </g>
    <!-- 꽃(왼쪽 위 노란 꽃) -->
    <g class="sfr-st" data-st="flower">
      ${ring(144, 66, 18, "#D6336C")}
      <g class="sfr-tag" filter="url(#sfrSh)">
        <rect x="20" y="42" width="92" height="20" rx="10" fill="#FFF0F6" fill-opacity="0.96" stroke="#D6336C" stroke-width="2"/>
        <text x="66" y="56" text-anchor="middle" font-size="11" font-weight="800" fill="#A61E4D">꽃 피우기에 이용!</text>
      </g>
    </g>
    <!-- 열매(오른쪽 토마토) -->
    <g class="sfr-st" data-st="fruit">
      ${ring(206, 163, 24, "#E03131")}
      <g class="sfr-tag" filter="url(#sfrSh)">
        <rect x="240" y="153" width="74" height="20" rx="10" fill="#FFF5F5" fill-opacity="0.96" stroke="#C0392B" stroke-width="2"/>
        <text x="277" y="167" text-anchor="middle" font-size="11" font-weight="800" fill="#A63030">열매에 저장!</text>
      </g>
    </g>
    <!-- 뿌리(흙 단면 속) -->
    <g class="sfr-st" data-st="root">
      <g class="sfr-st-art">
        <ellipse cx="170" cy="288" rx="36" ry="24" fill="none" stroke="#FFFFFF" stroke-width="5.5" opacity="0.85"/>
        <ellipse cx="170" cy="288" rx="36" ry="24" fill="none" stroke="#F59F00" stroke-width="2.6" stroke-dasharray="7 5" stroke-linecap="round"/>
      </g>
      <g class="sfr-tag" filter="url(#sfrSh)">
        <rect x="216" y="278" width="76" height="20" rx="10" fill="#FFF9F0" fill-opacity="0.96" stroke="#96374D" stroke-width="2"/>
        <text x="254" y="292" text-anchor="middle" font-size="11" font-weight="800" fill="#7A2B3D">녹말로 저장!</text>
      </g>
    </g>
    <!-- 배송 점(경로별 3개) -->
    ${dots("flower")}
    ${dots("fruit")}
    ${dots("root")}
  </svg>`;
}

export const sapFlowLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SfrStep;
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
    el("div", { class: "pn-badge p3", dataset: { g: "sugar" } }, el("b", { text: "설탕 변신" }), el("span", { text: "밤이 오면" })),
    el("div", { class: "pn-badge p3", dataset: { g: "dir" } }, el("b", { text: "방향 판정" }), el("span", { text: "질문 대기" })),
    el("div", { class: "pn-badge p3", dataset: { g: "ship" } }, el("b", { text: "배송 완주" }), el("span", { text: "0/3" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "잎이 낮 동안 만든 양분이 <b>녹말</b>(네모 알갱이)로 잠시 저장돼 있어요. 그런데 녹말은 물에 <b>녹지 않아</b> 이대로는 이동을 못 해요. 아래 <b>밤이 오면</b> 버튼을 눌러 보세요.",
  });

  const board = el("div", { class: "p3-board sfr-board", html: stageScene() });

  const nightBtn = el("button", { class: "sfr-btn", text: "밤이 오면", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnRow = el("div", { class: "sfr-btnrow" }, nightBtn);
  const shipDefs = [
    { id: "flower", b: "꽃이 필 때", sub: "봄 · 위로?" },
    { id: "fruit", b: "열매가 자랄 때", sub: "여름 · 어디로?" },
    { id: "root", b: "뿌리에 저장할 때", sub: "가을 · 아래로?" },
  ];
  const shipRow = el("div", { class: "sfr-ships" });
  shipRow.style.display = "none";
  const shipBtns = shipDefs.map((d) => {
    const b = el(
      "button",
      { class: "sfr-ship", attrs: { type: "button" } },
      el("b", { text: d.b }),
      el("span", { text: d.sub }),
    ) as HTMLButtonElement;
    shipRow.appendChild(b);
    return b;
  });

  const qBox = el("div", { class: "hook-choices sfr-q" });
  qBox.style.display = "none";

  const goals = new Set<string>();
  let finished = false;
  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "배송 종료! 잎의 양분은 <b>설탕으로 바뀌어 체관을 타고</b>, 정해진 방향 없이 <b>필요한 기관을 향해 위로도 아래로도</b> 이동했어요. 도착해서는 쓰이거나(꽃) 다시 모습을 바꿔 저장되죠(뿌리의 녹말, 고구마의 정체!).";
      api.enableCTA(s.cta ?? "저장과 이용 정리하기");
    }
  }

  // ── 1. 밤의 변신 ──
  let night = false;
  nightBtn.addEventListener("click", () => {
    if (night) return;
    night = true;
    haptic(HAPTIC.tap);
    board.classList.add("night");
    nightBtn.disabled = true;
    helper.innerHTML = "밤이 되자 잎의 녹말이 물에 <b>녹는 설탕</b>(둥근 알갱이)으로 변신했어요! 이제 이동할 수 있어요. 그런데… 설탕은 <b>어느 쪽으로</b> 흐를 수 있을까요?";
    later(() => {
      b4Ask(
        qBox,
        "체관 속 설탕이 이동할 수 있는 방향은?",
        [
          { t: "필요한 곳을 향해 위로도 아래로도", ok: true },
          { t: "물이 흐르듯 아래로만", ok: false },
          { t: "해를 향해 위로만", ok: false },
        ],
        (ok) => {
          api.recordQuiz(ok);
          helper.innerHTML = ok
            ? "정답! 체관의 설탕은 <b>필요한 기관을 향해 위·아래 어디로든</b> 이동해요. 정말 그런지 아래 <b>배송 버튼</b>으로 확인해 봐요."
            : "설탕의 목적지는 중력도 해도 아니에요. <b>양분이 필요한 기관</b>이죠. 그래서 위로도 아래로도 갈 수 있답니다. 아래 <b>배송 버튼</b>으로 확인해 봐요.";
          collect("dir", "위로도 아래로도!");
          shipRow.style.display = "";
          later(() => shipRow.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
        },
      );
    }, 900);
    later(() => collect("sugar", "녹는 몸으로!"), 700);
  });

  // ── 2. 배송 3곳 ──
  const shipped = new Set<string>();
  function ship(key: string, btn: HTMLButtonElement): void {
    if (!goals.has("dir") || shipped.has(key)) return;
    shipped.add(key);
    haptic(HAPTIC.tap);
    btn.disabled = true;
    const ams = [...board.querySelectorAll<SVGElement>(`.sfr-am[data-route="${key}"]`)];
    ams.forEach((am, i) => {
      later(() => {
        const dotEl = am.parentElement as unknown as SVGCircleElement | null;
        dotEl?.setAttribute("opacity", "1");
        (am as unknown as { beginElement: () => void }).beginElement();
      }, i * 260);
    });
    const st = board.querySelector(`.sfr-st[data-st="${key}"]`) as SVGGElement;
    later(() => {
      st.classList.add("fed");
      haptic(HAPTIC.correct);
      ams.forEach((am) => (am.parentElement as unknown as SVGCircleElement | null)?.setAttribute("opacity", "0"));
      const msg: Record<string, string> = {
        flower: "설탕이 <b>위로</b> 올라가 꽃에 도착, 꽃을 피우는 데 <b>이용</b>됐어요!",
        fruit: "이번엔 <b>아래쪽</b> 열매로, 도착한 양분이 열매에 <b>저장</b>돼요. 열매가 굵어지죠!",
        root: "땅속 <b>뿌리까지 아래로</b>, 도착한 설탕은 다시 <b>녹말</b>로 바뀌어 차곡차곡 저장돼요. 고구마의 살이 이렇게 붙는답니다!",
      };
      if (!finished) helper.innerHTML = msg[key];
      btn.classList.add("done");
      if (shipped.size === 3) collect("ship", "3/3 완주!");
      else {
        const chip = goalChips.querySelector('[data-g="ship"] span') as HTMLElement;
        chip.textContent = `${shipped.size}/3`;
      }
    }, 1500 + 2 * 260);
  }
  shipBtns.forEach((b, i) => b.addEventListener("click", () => ship(shipDefs[i].id, b)));

  host.append(goalChips, helper, board, btnRow, shipRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("밤이 오면 버튼부터 눌러 보세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
