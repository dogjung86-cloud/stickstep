// [중1 Ⅱ v3] L10 webDropLab — 「개구리 빼기 실험」.
// 교과서 그림 Ⅱ-10(생물다양성이 낮은/높은 생태계의 먹이 관계)의 조작판.
// 한 통찰: 다양성이 높은 생태계는 한 생물이 사라져도 "대신할 수 있는 생물"이 있어 안정적이다.
// 흐름: 두 그물 관찰(화살표 = 먹히는 쪽 → 먹는 쪽) → 예측(어느 쪽 매가 위험? — 첫 시도 채점)
//       → 개구리 빼기 실행 → 결과 관찰(낮은 쪽 사슬 붕괴 vs 높은 쪽 대체 경로) → 결론.
// rAF·캔버스 없음 — SVG + CSS. 노드·화살표 좌표는 아래 상수에서만(겹침 검산 주석 참조).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import type { StepRenderer } from "../../types";

interface WdpStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 노드 좌표(뷰박스 160×190) — 아래(생산자)에서 위(최종 포식자)로. */
type NodeMap = Record<string, { x: number; y: number; label: string }>;

const LOW_NODES: NodeMap = {
  rice: { x: 80, y: 168, label: "벼" },
  hopper: { x: 80, y: 130, label: "메뚜기" },
  frog: { x: 80, y: 92, label: "개구리" },
  snake: { x: 80, y: 54, label: "뱀" },
  hawk: { x: 80, y: 16, label: "매" },
};
const LOW_EDGES: [string, string][] = [
  ["rice", "hopper"],
  ["hopper", "frog"],
  ["frog", "snake"],
  ["snake", "hawk"],
];

const HIGH_NODES: NodeMap = {
  rice: { x: 28, y: 168, label: "벼" },
  corn: { x: 80, y: 168, label: "옥수수" },
  cabbage: { x: 132, y: 168, label: "배추" },
  hopper: { x: 54, y: 130, label: "메뚜기" },
  moth: { x: 118, y: 130, label: "배추흰나비" },
  frog: { x: 36, y: 92, label: "개구리" },
  sparrow: { x: 118, y: 92, label: "참새" },
  snake: { x: 62, y: 54, label: "뱀" },
  hawk: { x: 92, y: 16, label: "매" },
};
const HIGH_EDGES: [string, string][] = [
  ["rice", "hopper"],
  ["corn", "hopper"],
  ["cabbage", "moth"],
  ["hopper", "frog"],
  ["hopper", "sparrow"],
  ["moth", "frog"],
  ["moth", "sparrow"],
  ["frog", "snake"],
  ["sparrow", "snake"],
  ["sparrow", "hawk"],
  ["snake", "hawk"],
];

function webSvg(nodes: NodeMap, edges: [string, string][], cls: string): string {
  const edgeEls = edges
    .map(([a, b]) => {
      const A = nodes[a];
      const B = nodes[b];
      // 노드 반경(라벨 필 절반 높이 ~9px)만큼 양 끝을 안쪽으로 당겨 화살촉이 필에 겹치지 않게
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const len = Math.hypot(dx, dy);
      const ux = dx / len;
      const uy = dy / len;
      const x1 = A.x + ux * 12;
      const y1 = A.y + uy * 12;
      const x2 = B.x - ux * 14;
      const y2 = B.y - uy * 14;
      return `<g class="wdp-edge" data-e="${a}-${b}">
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8FA898" stroke-width="2"/>
        <path d="M${x2} ${y2} l${-ux * 6 - uy * 3.4} ${-uy * 6 + ux * 3.4} M${x2} ${y2} l${-ux * 6 + uy * 3.4} ${-uy * 6 - ux * 3.4}" stroke="#8FA898" stroke-width="2" stroke-linecap="round"/>
      </g>`;
    })
    .join("");
  const nodeEls = Object.entries(nodes)
    .map(([id, n]) => {
      const w = n.label.length * 9.2 + 14;
      return `<g class="wdp-node" data-n="${id}">
        <rect x="${n.x - w / 2}" y="${n.y - 9.5}" width="${w}" height="19" rx="9.5" fill="#FFFFFF" stroke="#63A07E" stroke-width="1.8"/>
        <text x="${n.x}" y="${n.y + 3.8}" text-anchor="middle" font-size="10.2" font-weight="800" fill="#2F5B44">${n.label}</text>
      </g>`;
    })
    .join("");
  return `<svg viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg" class="${cls}" aria-hidden="true">${edgeEls}${nodeEls}</svg>`;
}

export const webDropLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as WdpStep;
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
    el("div", { class: "pn-badge b4", dataset: { g: "read" } }, el("b", { text: "그물 읽기" }), el("span", { text: "화살표 뜻" })),
    el("div", { class: "pn-badge b4", dataset: { g: "predict" } }, el("b", { text: "예측" }), el("span", { text: "질문 대기" })),
    el("div", { class: "pn-badge b4", dataset: { g: "result" } }, el("b", { text: "결과 확인" }), el("span", { text: "실험 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "두 생태계의 <b>먹이 관계 그물</b>이에요. 화살표는 <b>먹히는 쪽 → 먹는 쪽</b>. 먼저 <b>매</b>를 탭해서, 매가 무엇을 먹고 사는지 확인해 봐요.",
  });

  const webA = el("div", { class: "wdp-web" });
  webA.innerHTML = `${webSvg(LOW_NODES, LOW_EDGES, "wdp-svg-a")}<b>(가) 다양성이 낮은 생태계</b>`;
  const webB = el("div", { class: "wdp-web" });
  webB.innerHTML = `${webSvg(HIGH_NODES, HIGH_EDGES, "wdp-svg-b")}<b>(나) 다양성이 높은 생태계</b>`;
  const board = el("div", { class: "b4-board wdp-board" }, el("div", { class: "wdp-webs" }, webA, webB));

  const dropBtn = el("button", { class: "bkl-gen wdp-drop", text: "두 생태계에서 개구리 빼기", attrs: { type: "button" } }) as HTMLButtonElement;
  dropBtn.disabled = true;
  const dropRow = el("div", { class: "bkl-genrow" }, dropBtn);

  const askBox = el("div", { class: "hook-choices wdp-ask" });
  askBox.style.display = "none";
  const resBox = el("div", { class: "hook-choices wdp-ask" });
  resBox.style.display = "none";

  host.append(goalChips, helper, board, dropRow, askBox, resBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

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
        "결론 — 다양성이 <b>높은</b> 생태계는 한 생물이 사라져도 <b>대신할 수 있는 생물</b>이 있어 안정적으로 유지되고, <b>낮은</b> 생태계는 한 고리만 끊겨도 연쇄적으로 흔들려요. <b>다양할수록 튼튼하다</b>!";
      api.enableCTA(s.cta ?? "정리하기");
    }
  }

  // ① 그물 읽기 — 두 그물의 매를 각각 탭
  const readSet = new Set<string>();
  [webA, webB].forEach((web, wi) => {
    const hawk = web.querySelector('[data-n="hawk"]') as SVGGElement;
    hawk.classList.add("tappable");
    hawk.addEventListener("click", () => {
      if (readSet.has(wi === 0 ? "a" : "b")) return;
      readSet.add(wi === 0 ? "a" : "b");
      haptic(HAPTIC.tap);
      // 매로 들어오는 화살표 강조
      web.querySelectorAll(".wdp-edge").forEach((e) => {
        const id = (e as SVGGElement).dataset.e ?? "";
        if (id.endsWith("-hawk")) e.classList.add("hi");
      });
      helper.innerHTML =
        wi === 0
          ? "(가)의 매는 먹이가 <b>뱀 하나뿐</b>이에요 — 외길 인생! (나)의 매도 탭해 봐요."
          : "(나)의 매는 <b>뱀과 참새, 두 갈래</b>에서 먹이를 얻어요. 이 차이를 기억하세요!";
      if (readSet.size === 2) {
        collect("read", "외길 vs 두 갈래");
        later(showPredict, 900);
      }
    });
  });

  // ② 예측(첫 시도 채점)
  let predictShown = false;
  function showPredict(): void {
    if (predictShown) return;
    predictShown = true;
    b4Ask(
      askBox,
      "이제 실험 — 두 생태계에서 <b>개구리가 사라진다면</b>, 어느 쪽 <b>매</b>가 더 위험해질까요?",
      [
        { t: "(가) — 개구리가 사라지면 뱀이 굶고, 매의 유일한 먹이가 끊겨서", ok: true },
        { t: "(나) — 생물이 많아서 혼란이 더 커질 것이므로", ok: false },
        { t: "둘 다 아무 변화가 없다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "논리적인 예측! 정말 그런지 <b>버튼을 눌러</b> 개구리를 빼 봐요."
          : "그물을 다시 봐요 — (가)의 매는 <b>뱀 외길</b>, (나)의 매는 <b>두 갈래</b>였죠. 버튼을 눌러 직접 확인해요!";
        collect("predict", ok ? "적중!" : "확인 완료");
        dropBtn.disabled = false;
        later(() => dropBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
      },
    );
  }

  // ③ 개구리 빼기 실행 → 결과
  let dropped = false;
  dropBtn.addEventListener("click", () => {
    if (dropped) return;
    dropped = true;
    haptic(HAPTIC.wrong);
    dropBtn.disabled = true;
    dropBtn.textContent = "개구리가 사라졌다…";
    [webA, webB].forEach((web) => {
      web.querySelector('[data-n="frog"]')?.classList.add("gone");
      web.querySelectorAll(".wdp-edge").forEach((e) => {
        const id = (e as SVGGElement).dataset.e ?? "";
        if (id.includes("frog")) e.classList.add("cut");
      });
    });
    // (가) — 연쇄 위험: 뱀·매 위험 점멸. (나) — 대체 경로 강조: 참새 경유
    later(() => {
      webA.querySelector('[data-n="snake"]')?.classList.add("danger");
      webA.querySelector('[data-n="hawk"]')?.classList.add("danger");
      webB.querySelectorAll(".wdp-edge").forEach((e) => {
        const id = (e as SVGGElement).dataset.e ?? "";
        if (id === "sparrow-hawk" || id === "sparrow-snake" || id === "hopper-sparrow" || id === "moth-sparrow") e.classList.add("alt");
      });
      helper.innerHTML =
        "(가)는 <b>뱀도 매도 위험</b>(먹이 사슬이 통째로 끊김) — (나)는 <b>참새를 지나는 대체 경로</b>가 살아 있어 뱀도 매도 버텨요!";
      later(showResult, 1400);
    }, 900);
  });

  let resultShown = false;
  function showResult(): void {
    if (resultShown) return;
    resultShown = true;
    b4Ask(
      resBox,
      "실험 결과 — (나)의 매가 버틸 수 있었던 까닭은 무엇일까요?",
      [
        { t: "개구리를 대신할 수 있는 생물(참새 먹이 경로)이 있어서", ok: true },
        { t: "(나)의 매가 더 힘이 세서", ok: false },
        { t: "개구리가 원래 중요하지 않은 생물이어서", ok: false },
      ],
      (ok) => {
        helper.innerHTML = ok
          ? "정확해요! <b>대신할 수 있는 생물</b>의 존재 — 그게 다양성이 높은 생태계의 안전망이에요."
          : "힘의 문제가 아니에요 — (나)에는 개구리를 <b>대신할 먹이 경로(참새)</b>가 있었죠. 다양성이 곧 안전망이랍니다.";
        collect("result", "안전망!");
      },
    );
  }

  api.setCTA("관찰 → 예측 → 실험!", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
