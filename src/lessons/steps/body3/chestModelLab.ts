// [중2 Ⅵ v3] L4 chestModelLab — 「호흡운동 모형실」.
// 한 통찰: 부피가 커지면 압력이 낮아져 공기가 들어온다 — 허파는 스스로가 아니라 '끌려서' 움직인다.
// (교과서 222~224쪽 「호흡운동 모형 만들기」+그림 VI-11: 컵=흉강·빨대=숨관·풍선=허파·고무 막=가로막.)
// 조작: 고무 막 슬라이더(당김·올림) → 풍선·압력 연동 관찰 → 모형↔몸 대응 탭 4쌍 → 판정(b4Ask).
// rAF·캔버스 없음 — 슬라이더 input 이벤트만으로 상태 갱신(factorCurve 문법).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import type { StepRenderer } from "../../types";

interface CmsStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 모형 무대 — 컵(흉강)·빨대(숨관)·풍선(허파)·고무 막(가로막). t: 0(올림)~1(당김). */
function stageScene(): string {
  return `<svg viewBox="0 0 340 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="cmsCup" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.6"/><stop offset="0.5" stop-color="#EAF2F8" stop-opacity="0.25"/><stop offset="1" stop-color="#B9CBD8" stop-opacity="0.45"/>
      </linearGradient>
    </defs>
    <ellipse cx="150" cy="228" rx="120" ry="7" fill="#2A3A5E" opacity="0.10"/>
    <!-- 공기 흐름 화살표(들숨/날숨) -->
    <g class="cms-air cms-air-in">
      <path d="M150 6 v22 M144 20 l6 10 6 -10" stroke="#4DABF7" stroke-width="4" stroke-linecap="round" fill="none"/>
    </g>
    <g class="cms-air cms-air-out">
      <path d="M150 28 v-22 M144 14 l6 -10 6 10" stroke="#845EF7" stroke-width="4" stroke-linecap="round" fill="none"/>
    </g>
    <!-- 빨대(숨관) : 탭 대상 -->
    <g class="cms-part" data-part="straw" role="button" tabindex="0" aria-label="빨대">
      <rect x="142" y="30" width="16" height="64" rx="7" fill="#FFE9A8" stroke="#D9B24C" stroke-width="3"/>
    </g>
    <!-- 컵(흉강 벽) -->
    <path d="M74 86 l14 128 h124 l14 -128" stroke="#8FA6B8" stroke-width="4" fill="url(#cmsCup)"/>
    <ellipse cx="150" cy="86" rx="76" ry="12" fill="none" stroke="#8FA6B8" stroke-width="4"/>
    <!-- 컵 속 공간(흉강) : 탭 대상(풍선 뒤 넓은 영역) -->
    <g class="cms-part" data-part="space" role="button" tabindex="0" aria-label="컵 속 공간">
      <rect x="92" y="96" width="116" height="100" fill="#9BC2DC" opacity="0.13" rx="16"/>
    </g>
    <!-- 풍선(허파) : 탭 대상 -->
    <g class="cms-part cms-balloon" data-part="balloon" role="button" tabindex="0" aria-label="작은 고무풍선">
      <ellipse cx="150" cy="128" rx="26" ry="30" fill="#FFB3B9" stroke="#E07A85" stroke-width="3"/>
      <ellipse cx="141" cy="118" rx="7" ry="9" fill="#FFFFFF" opacity="0.5"/>
    </g>
    <!-- 고무 막(가로막) : 탭 대상 -->
    <g class="cms-part cms-mem" data-part="mem" role="button" tabindex="0" aria-label="고무 막">
      <path class="cms-memline" d="M88 208 q62 -10 124 0" stroke="#E23B4B" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle class="cms-knob" cx="150" cy="203" r="7" fill="#C9303E"/>
    </g>
    <!-- 압력 게이지(컵 안) -->
    <g class="cms-gauge">
      <rect x="216" y="104" width="14" height="72" rx="7" fill="#FFFFFF" stroke="#B9C6D2" stroke-width="2.4"/>
      <rect class="cms-gaugefill" x="219" y="128" width="8" height="45" rx="4" fill="#845EF7"/>
    </g>
  </svg>`;
}

const PART_INFO: Record<string, { name: string; body: string }> = {
  straw: { name: "빨대", body: "숨관(공기가 드나드는 길)" },
  balloon: { name: "작은 고무풍선", body: "허파" },
  mem: { name: "고무 막", body: "가로막" },
  space: { name: "컵 속 공간", body: "흉강(갈비뼈로 둘러싸인 공간)" },
};

export const chestModelLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CmsStep;
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
    el("div", { class: "pn-badge b6", dataset: { g: "pull" } }, el("b", { text: "모형 조작" }), el("span", { text: "슬라이더 대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "map" } }, el("b", { text: "몸 대응 4쌍" }), el("span", { text: "잠김" })),
    el("div", { class: "pn-badge b6", dataset: { g: "why" } }, el("b", { text: "압력의 비밀" }), el("span", { text: "판정 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "숨쉬기의 원리를 담은 <b>호흡운동 모형</b>이에요. 컵 바닥에 고무 막을 씌우고, 빨대 끝에 작은 풍선을 달았죠. 아래 <b>슬라이더</b>로 고무 막을 아래로 당겼다 올렸다 해 보세요.",
  });

  const board = el("div", { class: "b6-board cms-board", html: stageScene() });
  const pill = el("div", { class: "clu-pill cms-pill", text: "컵 속 압력: 보통" });
  board.appendChild(pill);

  const slider = el("input", {
    class: "cms-slider",
    attrs: { type: "range", min: "0", max: "100", value: "0", "aria-label": "고무 막 당기기" },
  }) as HTMLInputElement;
  const sliderRow = el("div", { class: "cms-sliderrow" },
    el("span", { class: "cms-sllab", text: "막 올리기" }),
    slider,
    el("span", { class: "cms-sllab", text: "막 당기기" }),
  );

  const qBox = el("div", { class: "hook-choices cms-q" });
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
        "정리! <b>들숨</b> = 갈비뼈 올라가고 가로막 내려감 → 흉강·허파 부피 커짐 → 압력 낮아짐 → 공기 <b>들어옴</b>. <b>날숨</b>은 전부 반대예요.";
      api.enableCTA(s.cta ?? "기체 교환 보러 가기");
    }
  }

  // ── 1. 슬라이더 조작 ──
  const seen = { down: false, up: false };
  let lastT = 0;
  function applyT(t: number): void {
    const mem = board.querySelector(".cms-memline") as SVGPathElement;
    const knob = board.querySelector(".cms-knob") as SVGCircleElement;
    const bal = board.querySelector(".cms-balloon ellipse") as SVGEllipseElement;
    const hi = board.querySelector(".cms-balloon ellipse:nth-of-type(2)") as SVGEllipseElement | null;
    const gauge = board.querySelector(".cms-gaugefill") as SVGRectElement;
    // 고무 막: 평평(q -10) → 아래로 불룩(q +26)
    const qy = -10 + t * 36;
    mem.setAttribute("d", `M88 208 q62 ${qy} 124 0`);
    knob.setAttribute("cy", String(203 + t * 15));
    // 풍선: rx 26→38, ry 30→44
    bal.setAttribute("rx", String(26 + t * 12));
    bal.setAttribute("ry", String(30 + t * 14));
    if (hi) hi.setAttribute("cx", String(141 - t * 3));
    // 압력 게이지: 보통(45) → 낮음(18)
    gauge.setAttribute("height", String(45 - t * 27));
    gauge.setAttribute("y", String(128 + t * 27));
    board.classList.toggle("inhale", t > 0.55);
    board.classList.toggle("exhale", t < 0.25 && lastT >= 0.25);
    pill.textContent = t > 0.55 ? "컵 속 압력: 낮아짐" : t < 0.25 ? "컵 속 압력: 높아짐" : "컵 속 압력: 보통";
    lastT = t;
  }
  applyT(0);
  slider.addEventListener("input", () => {
    const t = Number(slider.value) / 100;
    applyT(t);
    if (t > 0.85 && !seen.down) {
      seen.down = true;
      helper.innerHTML = "고무 막을 <b>아래로 당기니</b> 컵 속 부피가 커지면서 압력이 낮아지고, 풍선이 <b>스스로 부풀었어요!</b> 바깥 공기가 밀려 들어온 거예요. 이제 막을 다시 올려 봐요.";
    }
    if (t < 0.1 && seen.down && !seen.up) {
      seen.up = true;
      helper.innerHTML = "막을 <b>올리니</b> 컵 속 부피가 줄면서 압력이 높아지고, 풍선 속 공기가 <b>바깥으로 밀려 나갔어요.</b> 이 왕복이 바로 숨쉬기의 원리!";
      collect("pull", "부풀고 쪼그라듦!");
      later(() => {
        helper.innerHTML = "그런데 이 모형, 어딘가 우리 몸을 닮았죠? 무대 위 <b>부품들을 하나씩 탭</b>해서 몸의 어느 부분인지 확인해 보세요(4곳).";
        (goalChips.querySelector(`[data-g="map"] span`) as HTMLElement).textContent = "부품 탭!";
      }, 1600);
    }
  });

  // ── 2. 몸 대응 탭 ──
  const mapped = new Set<string>();
  board.addEventListener("click", (ev) => {
    const t = (ev.target as Element | null)?.closest(".cms-part") as HTMLElement | null;
    if (!t || !seen.up || goals.has("map")) return;
    const part = t.dataset.part!;
    if (mapped.has(part)) return;
    mapped.add(part);
    haptic(HAPTIC.tap);
    t.classList.add("hit");
    const info = PART_INFO[part];
    helper.innerHTML = `<b>${info.name}</b> = 우리 몸의 <b>${info.body}</b>! (${mapped.size}/4)`;
    if (mapped.size === 4) {
      collect("map", "4쌍 완성!");
      later(() => askWhy(), 900);
    }
  });
  board.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      const t = (k.target as Element)?.closest(".cms-part");
      if (t) {
        k.preventDefault();
        (t as HTMLElement).click();
      }
    }
  });

  let asked = false;
  function askWhy(): void {
    if (asked) return;
    asked = true;
    b4Ask(
      qBox,
      "고무 막(가로막)을 아래로 당겼을 때 풍선(허파)이 부푼 까닭은 뭘까요?",
      [
        { t: "컵 속 부피가 커져 압력이 낮아지자, 바깥 공기가 밀려 들어와서", ok: true },
        { t: "고무 막이 풍선을 줄로 직접 잡아당겨서", ok: false },
        { t: "풍선이 근육처럼 스스로 공기를 빨아들여서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "완벽해요! 공기는 <b>압력이 높은 곳에서 낮은 곳으로</b> 이동해요. 부피가 커져 압력이 낮아진 쪽으로 밀려 들어온 거죠. 허파도 <b>근육이 없어</b> 이렇게 '끌려서' 부푼답니다."
          : "막과 풍선은 <b>연결되어 있지 않고</b>, 풍선(허파)에는 스스로 움직일 근육도 없어요. 비밀은 압력, 부피가 커지면 압력이 낮아지고, 공기는 <b>압력 높은 곳 → 낮은 곳</b>으로 밀려 들어온답니다.",
        collect("why", "압력 차가 원인!");
      },
    );
  }

  host.append(goalChips, helper, board, sliderRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("고무 막을 당겼다 올려 보세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
