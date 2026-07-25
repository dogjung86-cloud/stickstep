// cellCompareLab — 동물세포와 식물세포를 **나란히 놓고** 구조를 짚어 공통점·차이점을 손으로 찾는 랩.
// (실사용 피드백 2026-07-25: L2에 동물세포가 아예 없었고, 두 세포를 비교하는 형태가 필요했다.
//  구작의 '식물세포 한 장 핫스팟'을 이 랩이 대체한다.)
//
//  · 국면 1 탐색 — 두 세포의 구조를 탭하면 이름과 하는 일이 카드로 뜬다(동물 3곳 · 식물 5곳).
//    같은 이름을 양쪽에서 찾아 누르는 동안 "어? 이건 식물에만 있네"가 먼저 몸으로 온다.
//  · 국면 2 분류 — 구조 칩 5개를 [둘 다 있어요] / [식물세포에만 있어요] 두 칸으로 나눈다.
//  · 국면 3 결론 — 공통 3(세포막·핵·마이토콘드리아) + 식물만 2(엽록체·세포벽) 요약.
//
// 좌표는 발주본(정사각 960×960) 기준 이미지 %다. `aspect-ratio: 1/1`로 원비율을 지키므로
// 이미지 % = 컨테이너 %가 그대로 성립한다(4:3 크롭으로 좌표가 어긋났던 사고 15의 재발 방지).

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import "../../styles/bio3-compare.css";

interface CompareStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "explore" | "sort" | "verdict";
type Where = "both" | "plantOnly";

const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

interface Spot { x: number; y: number; key: string }
interface Part { key: string; name: string; job: string; where: Where }

/** 한글 조사 자동 선택 — 마지막 글자의 받침 유무로 고른다("엽록체은/을" 같은 어색함 방지).
 *  한글 음절은 0xAC00부터 28개 종성 단위로 배열되므로 (코드-0xAC00)%28 !== 0 이면 받침이 있다. */
const josa = (word: string, withBatchim: string, withoutBatchim: string): string => {
  const last = word.charCodeAt(word.length - 1);
  const has = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
  return word + (has ? withBatchim : withoutBatchim);
};

const PARTS: Part[] = [
  { key: "membrane", name: "세포막", job: "세포 안과 밖을 구분하고, 물질이 드나드는 것을 조절해요.", where: "both" },
  { key: "nucleus", name: "핵", job: "유전물질이 들어 있어 세포의 생명활동을 조절해요.", where: "both" },
  { key: "mito", name: "마이토콘드리아", job: "양분을 이용해 생명활동에 필요한 에너지를 만들어요.", where: "both" },
  { key: "chloro", name: "엽록체", job: "초록색을 띠며 광합성을 해서 양분을 만들어요.", where: "plantOnly" },
  { key: "wall", name: "세포벽", job: "두껍고 단단해서 세포의 모양을 유지하고 보호해요.", where: "plantOnly" },
];

// 발주본에서 실측한 이미지 % — 그림을 재발주하면 여기만 다시 맞추면 된다.
const ANIMAL_SPOTS: Spot[] = [
  { x: 11, y: 52, key: "membrane" },  // 왼쪽 바깥 분홍 테두리(벽 없이 막 한 겹)
  { x: 63, y: 33, key: "nucleus" },   // 보라 구
  { x: 54, y: 72, key: "mito" },      // 아래쪽 주황 알갱이
];
// 육각형 발주본(2026-07-25 재발주) 실측치. 벽과 막은 두 겹이라 붙어 있어 서로 다른 변에서 집는다
// (같은 변에서 집으면 점 두 개가 겹쳐 눌리지 않는다).
const PLANT_SPOTS: Spot[] = [
  { x: 50, y: 9.5, key: "wall" },     // 위쪽 굵은 초록 띠
  { x: 17, y: 47, key: "membrane" },  // 왼쪽 변 안쪽 크림색 얇은 선(굵은 벽과 겹치지 않게 안쪽으로)
  { x: 64, y: 30, key: "nucleus" },   // 보라 구
  { x: 61, y: 79, key: "mito" },      // 아래쪽 주황 알갱이
  { x: 24, y: 70, key: "chloro" },    // 왼쪽 아래 초록 알갱이
];

export const cellCompareLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CompareStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge bio", dataset: { g: "explore" } }, el("b", { text: "구조 찾기" }), el("span", { text: "0 / 8" })),
    el("div", { class: "pn-badge bio", dataset: { g: "sort" } }, el("b", { text: "공통과 차이" }), el("span", { text: "나누기" })),
    el("div", { class: "pn-badge bio", dataset: { g: "verdict" } }, el("b", { text: "정리" }), el("span", { text: "확인" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "두 세포에 붙은 점을 눌러 이름과 하는 일을 확인해 보세요. <b>동물세포에 3곳, 식물세포에 5곳</b>이 있어요.",
  });

  const cellCard = (kind: "animal" | "plant", spots: Spot[]): HTMLElement => {
    const wrap = el("div", { class: `cmp-cell cmp-${kind}` });
    const cap = el("div", { class: "cmp-cap", text: kind === "animal" ? "동물세포" : "식물세포" });
    const frame = el("div", { class: "cmp-frame" });
    const img = el("img", {
      class: "cmp-img",
      attrs: {
        src: `${BASE}bio3/figs/${kind === "animal" ? "animal" : "plant"}-cell.webp`,
        alt: kind === "animal" ? "둥글고 무른 동물세포의 구조" : "각진 벽으로 둘러싸인 식물세포의 구조",
      },
    });
    frame.appendChild(img);
    for (const sp of spots) {
      const dot = el("button", {
        class: "cmp-dot",
        style: `left:${sp.x}%;top:${sp.y}%`,
        attrs: { type: "button", "aria-label": "구조 확인하기" },
        dataset: { cmpKind: kind, cmpKey: sp.key },
      });
      frame.appendChild(dot);
    }
    wrap.append(cap, frame);
    return wrap;
  };

  const animal = cellCard("animal", ANIMAL_SPOTS);
  const plant = cellCard("plant", PLANT_SPOTS);
  const stage = el("div", { class: "cmp-stage" }, animal, plant);
  const read = el("div", { class: "cmp-read", html: "<b>점을 눌러 보세요</b><span>이름과 하는 일이 여기에 나와요</span>" });
  const controls = el("div", { class: "b3-controls cmp-controls" });
  host.append(goalsEl, helper, stage, read, controls);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const goals = new Set<Goal>();
  const found = new Set<string>(); // "animal:nucleus" 형태
  let finished = false;

  const partOf = (key: string): Part => PARTS.find((p) => p.key === key)!;

  const collect = (id: Goal): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    haptic(HAPTIC.ctaUnlock);
  };

  // ── 국면 1: 구조 탐색 ─────────────────────────────────────────────
  const onDot = (e: Event): void => {
    const b = (e.currentTarget as HTMLElement);
    const key = b.dataset.cmpKey!;
    const kind = b.dataset.cmpKind!;
    const p = partOf(key);
    b.classList.add("on");
    found.add(`${kind}:${key}`);
    haptic(HAPTIC.tap);
    read.innerHTML = `<b>${p.name}</b><span>${p.job}</span>`;
    const chip = goalsEl.querySelector('[data-g="explore"] span') as HTMLElement;
    chip.textContent = `${found.size} / 8`;
    if (found.size >= 8 && !goals.has("explore")) {
      collect("explore");
      helper.innerHTML = "다 찾았어요. 동물세포에는 <b>3가지</b>, 식물세포에는 <b>5가지</b>가 있었죠. 이제 어떤 것이 둘 다에 있고 어떤 것이 식물세포에만 있는지 나눠 봐요.";
      startSort();
    }
  };
  for (const b of Array.from(stage.querySelectorAll(".cmp-dot"))) b.addEventListener("click", onDot);

  // ── 국면 2: 공통 / 식물만 분류 ────────────────────────────────────
  let picked: string | null = null;

  function startSort(): void {
    controls.replaceChildren();
    const tray = el("div", { class: "cmp-tray" });
    for (const p of PARTS) {
      const c = el("button", { class: "b3-chip cmp-chip", attrs: { type: "button" }, dataset: { cmpChip: p.key }, text: p.name });
      c.addEventListener("click", () => {
        if (c.classList.contains("done")) return;
        picked = picked === p.key ? null : p.key;
        for (const other of Array.from(tray.children) as HTMLElement[]) other.classList.toggle("on", other.dataset.cmpChip === picked);
        haptic(HAPTIC.tap);
      });
      tray.appendChild(c);
    }
    const bins = el("div", { class: "cmp-bins" });
    const mkBin = (where: Where, label: string, note: string): HTMLElement => {
      const bin = el("button", { class: `cmp-bin cmp-bin-${where}`, attrs: { type: "button" }, dataset: { cmpBin: where } },
        el("b", { text: label }), el("span", { text: note }), el("div", { class: "cmp-bin-items" }));
      bin.addEventListener("click", () => {
        if (!picked) { read.innerHTML = "<b>먼저 구조를 하나 고르세요</b><span>위에서 이름을 누른 뒤 통을 눌러요</span>"; return; }
        const p = partOf(picked);
        const chip = tray.querySelector(`[data-cmp-chip="${picked}"]`) as HTMLElement;
        if (p.where === where) {
          chip.classList.add("done");
          chip.classList.remove("on");
          (bin.querySelector(".cmp-bin-items") as HTMLElement).appendChild(el("i", { text: p.name }));
          haptic(HAPTIC.select);
          read.innerHTML = `<b>${p.name} 맞아요</b><span>${p.job}</span>`;
          picked = null;
          if (Array.from(tray.children).every((c) => (c as HTMLElement).classList.contains("done"))) {
            collect("sort");
            finish();
          }
        } else {
          haptic(HAPTIC.wrong);
          chip.classList.add("shake");
          window.setTimeout(() => chip.classList.remove("shake"), 400);
          read.innerHTML = p.where === "plantOnly"
            ? `<b>${josa(p.name, "은", "는")} 동물세포에는 없어요</b><span>동물세포 그림에서 ${josa(p.name, "을", "를")} 못 찾았죠? 식물세포에만 있는 구조예요.</span>`
            : `<b>${josa(p.name, "은", "는")} 둘 다 있어요</b><span>동물세포와 식물세포 그림 양쪽에서 찾았던 구조예요.</span>`;
        }
      });
      return bin;
    };
    bins.append(
      mkBin("both", "둘 다 있어요", "동물세포 · 식물세포"),
      mkBin("plantOnly", "식물세포에만", "동물세포에는 없어요"),
    );
    controls.append(tray, bins);
    window.setTimeout(() => controls.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  // ── 국면 3: 결론 ──────────────────────────────────────────────────
  function finish(): void {
    collect("verdict");
    helper.innerHTML = "정리하면, <b>세포막·핵·마이토콘드리아</b>는 두 세포 모두에 있고 <b>엽록체·세포벽</b>은 식물세포에만 있어요. 그래서 식물세포는 각지고 단단하며, 스스로 양분을 만들 수 있어요.";
    read.innerHTML = "<b>공통 3가지 · 식물세포에만 2가지</b><span>동물세포는 둥글고 무른 편, 식물세포는 각지고 단단해요</span>";
    if (!finished) {
      finished = true;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "구조가 하는 일 알아보기");
    }
  }

  api.setCTA("두 세포를 비교해 보세요", { enabled: false });
  return () => {
    for (const b of Array.from(stage.querySelectorAll(".cmp-dot"))) b.removeEventListener("click", onDot);
  };
};
