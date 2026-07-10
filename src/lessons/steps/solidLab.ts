// solidLab, 다면체 랩(Ⅴ 입체도형 — 교과서 206~207쪽 다면체·각뿔대).
// 국면 3개: 1 다면체 선별(입체 6종 중 "다각형 면으로만 둘러싸인 것" 탭 토글 → 확인,
//   곡면 3종이 함정) → 2 오각기둥 드래그 회전 관찰 + 면의 개수 미션(n각기둥 공식 표) →
//   3 오각뿔을 밑면에 평행하게 자르기 → 각뿔대 탄생 + 이름 판정.
// 3D는 solidKit(이벤트 구동 SVG 투영, rAF 금지). 모션은 CSS transition + setTimeout 체인.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { capturePointer } from "../../ui/geoKit";
import { prismSolid, pyramidSolid, frustumSolid, solidSvg } from "../../ui/solidKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface SolidStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 250;

/* 국면 1 선별 카드: 다면체 3(각기둥·각뿔·각뿔대) + 곡면 3(원기둥·구·원뿔) */
interface PickItem {
  key: string;
  name: string;
  poly: boolean;
  art: string;
}
const mini = (inner: string): string => `<svg viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg" fill="none">${inner}</svg>`;
const PICKS: PickItem[] = [
  { key: "prism", name: "사각기둥", poly: true, art: mini(`<g class="art"></g>`) },
  { key: "cyl", name: "원기둥", poly: false, art: mini(
    `<ellipse cx="42" cy="24" rx="20" ry="8" stroke="#334155" stroke-width="2.2"/>` +
    `<path d="M22 24 V62 M62 24 V62" stroke="#334155" stroke-width="2.2"/>` +
    `<path d="M22 62 A20 8 0 0 0 62 62" stroke="#334155" stroke-width="2.2"/>` +
    `<path d="M22 62 A20 8 0 0 1 62 62" stroke="#A9B6C6" stroke-width="1.8" stroke-dasharray="5 5"/>`) },
  { key: "pyr", name: "삼각뿔", poly: true, art: mini(`<g class="art"></g>`) },
  { key: "sphere", name: "구", poly: false, art: mini(
    `<circle cx="42" cy="42" r="23" stroke="#334155" stroke-width="2.2"/>` +
    `<ellipse cx="42" cy="42" rx="23" ry="8" stroke="#A9B6C6" stroke-width="1.8" stroke-dasharray="5 5"/>`) },
  { key: "frus", name: "사각뿔대", poly: true, art: mini(`<g class="art"></g>`) },
  { key: "cone", name: "원뿔", poly: false, art: mini(
    `<path d="M42 16 L22 60 M42 16 L62 60" stroke="#334155" stroke-width="2.2"/>` +
    `<ellipse cx="42" cy="60" rx="20" ry="7" stroke="#334155" stroke-width="2.2"/>`) },
];

export const solidLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SolidStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "pick", label: "다면체 선별", sub: "0/3" },
    { id: "count", label: "부품 세기", sub: "오각기둥" },
    { id: "cut", label: "각뿔대 공방", sub: "자르기" },
  ]);

  const board = mboard(600);
  const stage = el("div", { class: "msd-stage" });
  const panel = el("div", { class: "msd-panel" });
  const inst = el("div", { class: "msd-inst" });
  const ctl = el("div", { class: "msd-ctl" });
  panel.append(inst, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "입체의 세계에 왔어요! 첫 관문, <b>다각형 면으로만</b> 둘러싸인 입체를 골라내 봐요.",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let finished = false;

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "다각형 면으로만 = 다면체, 각뿔을 평행하게 자르면 = 각뿔대. 입체 공방 1호점 완성!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 국면 1: 다면체 선별 ── */
  function startPick(): void {
    inst.innerHTML = `<b>다각형인 면으로만</b> 둘러싸인 입체를 모두 골라 탭하세요 (3개)`;
    const grid = el("div", { class: "msd-grid" });
    const picked = new Set<string>();
    PICKS.forEach((it) => {
      const card = el("div", { class: "msd-card", html: it.art }, el("span", { text: it.name }));
      // 다면체 3종은 solidKit 겨냥도를 그려 넣는다
      const g = card.querySelector(".art");
      if (g) {
        const o = { cx: 42, cy: 42, scale: 1, f: 480 };
        if (it.key === "prism") g.innerHTML = solidSvg(prismSolid(4, 24, 46), -0.5, -0.32, o);
        if (it.key === "pyr") g.innerHTML = solidSvg(pyramidSolid(3, 27, 48), -0.4, -0.3, o);
        if (it.key === "frus") g.innerHTML = solidSvg(frustumSolid(4, 27, 15, 40), -0.5, -0.32, o);
      }
      card.addEventListener("click", () => {
        if (finished || card.classList.contains("lock")) return;
        haptic(HAPTIC.tap);
        if (it.poly) {
          if (picked.has(it.key)) return;
          picked.add(it.key);
          card.classList.add("ok", "lock");
          chips.el.querySelector(`[data-g="pick"] span`)!.textContent = `${picked.size}/3`;
          toast(`${it.name}, 면이 전부 다각형!`);
          if (picked.size >= 3) {
            chips.on("pick", "3/3");
            haptic(HAPTIC.correct);
            grid.querySelectorAll(".msd-card").forEach((c) => c.classList.add("lock"));
            helper.innerHTML = "잘 골랐어요! 이렇게 <b>다각형 면으로만</b> 둘러싸인 입체가 다면체예요.";
            later(startCount, 1600);
          }
        } else {
          haptic(HAPTIC.cross);
          card.classList.add("no");
          later(() => card.classList.remove("no"), 700);
          toast(
            it.key === "sphere"
              ? "구는 온몸이 곡면! 다각형 면이 하나도 없어요."
              : `${it.name}에는 굽은 옆면(곡면)이 있어요. 탈락!`,
          );
        }
      });
      grid.appendChild(card);
    });
    stage.appendChild(grid);
  }

  /* ── 국면 2: 오각기둥 관찰 ── */
  let ry = -0.55;
  let rx = -0.35;
  let dragging = false;
  let px = 0;
  let py = 0;

  function startCount(): void {
    clear(stage);
    stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none"><g class="msd-scene"></g></svg>`;
    const svg = stage.querySelector("svg") as SVGSVGElement;
    const scene = svg.querySelector(".msd-scene") as SVGGElement;
    const solid = prismSolid(5, 72, 120);
    const redraw = (): void => {
      scene.innerHTML = solidSvg(solid, ry, rx, { cx: W / 2, cy: H / 2, faceFill: "#2F9E44", faceOpacity: 0.08 });
    };
    redraw();
    svg.addEventListener("pointerdown", (e) => {
      if (finished) return;
      dragging = true;
      px = e.clientX;
      py = e.clientY;
      capturePointer(svg, e.pointerId);
    });
    svg.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      ry += (e.clientX - px) * 0.011;
      rx -= (e.clientY - py) * 0.011;
      rx = Math.max(-1.2, Math.min(1.2, rx));
      px = e.clientX;
      py = e.clientY;
      redraw();
    });
    svg.addEventListener("pointerup", () => (dragging = false));
    svg.addEventListener("pointercancel", () => (dragging = false));

    inst.innerHTML = `<b>오각기둥</b>을 드래그로 돌려 보고, <b>면의 개수</b>를 세어 보세요`;
    helper.innerHTML = "숨은 면은 점선 너머에! 밑면 2개 + 옆면들, 전부 몇 개일까요?";
    clear(ctl);
    const row = el("div", { class: "msd-choices" });
    [5, 7, 10].forEach((v) => {
      const b = el("button", { class: "msd-choice", text: `${v}개`, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (v === 7) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          chips.on("count", "칠면체!");
          toast("밑면 2 + 옆면 5 = 7, 그래서 칠면체!");
          inst.innerHTML = `오각기둥 = <b>칠면체</b>. 면 7(=5+2), 꼭짓점 10(=5×2), 모서리 15(=5×3)`;
          later(startCut, 2000);
        } else {
          haptic(HAPTIC.cross);
          toast(v === 5 ? "옆면 5개만 세었네요, 위아래 밑면 2개도 잊지 마요!" : "10은 꼭짓점의 개수! 면은 밑면 2+옆면 5예요.");
        }
      });
      row.appendChild(b);
    });
    ctl.appendChild(row);
    later(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /* ── 국면 3: 각뿔대 공방 ── */
  function startCut(): void {
    clear(stage);
    clear(ctl);
    stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none"><g class="msd-top"></g><g class="msd-base"></g><line class="msd-knife" x1="30" y1="0" x2="${W - 30}" y2="0" stroke="#E8547E" stroke-width="2.6" stroke-dasharray="9 7" style="opacity:0"/></svg>`;
    const gTop = stage.querySelector(".msd-top") as SVGGElement;
    const gBase = stage.querySelector(".msd-base") as SVGGElement;
    const knife = stage.querySelector(".msd-knife") as SVGLineElement;
    const o = { cx: W / 2, cy: H / 2, f: 560 };
    // 오각뿔 통짜(자르기 전) — 살짝 기울인 구도
    gBase.innerHTML = solidSvg(pyramidSolid(5, 88, 150), -0.5, -0.3, { ...o, faceFill: "#2F9E44", faceOpacity: 0.08 });
    inst.innerHTML = `<b>오각뿔</b>이에요. 밑면에 <b>평행한 칼날</b>로 잘라 볼까요?`;
    helper.innerHTML = "뿔의 위쪽을 잘라 내면 무엇이 남을까요? 칼질 한 번!";
    const btn = el("button", { class: "msd-btn pulse", text: "평행하게 자르기", attrs: { type: "button" } }) as HTMLButtonElement;
    ctl.appendChild(btn);
    later(() => btn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    btn.addEventListener("click", () => {
      btn.disabled = true;
      haptic(HAPTIC.tap);
      // 칼날 라인 스윕
      knife.style.opacity = "1";
      knife.setAttribute("y1", String(H / 2 - 22));
      knife.setAttribute("y2", String(H / 2 - 22));
      later(() => {
        // 분리 연출: 작은 뿔(위) + 각뿔대(아래)
        gBase.innerHTML = solidSvg(frustumSolid(5, 88, 44, 75), -0.5, -0.3, {
          ...o,
          cy: H / 2 + 40,
          faceFill: "#2F9E44",
          faceOpacity: 0.1,
        });
        gTop.innerHTML = solidSvg(pyramidSolid(5, 44, 75), -0.5, -0.3, { ...o, cy: H / 2 - 58, ink: "#8CA0B4" });
        (gTop as unknown as SVGGElement).style.transition = "transform .9s cubic-bezier(.34,1.2,.5,1), opacity .9s";
        later(() => {
          gTop.style.transform = "translateY(-26px)";
          gTop.style.opacity = ".35";
          haptic(HAPTIC.correct);
        }, 350);
        later(askName, 1500);
      }, 700);
    });

    function askName(): void {
      inst.innerHTML = `아래에 남은 이 입체의 이름은?`;
      helper.innerHTML = "각뿔을 밑면에 평행한 평면으로 자르고 남은, 뿔이 아닌 쪽!";
      clear(ctl);
      const row = el("div", { class: "msd-choices" });
      [
        ["오각뿔대", true],
        ["오각기둥", false],
        ["사다리꼴", false],
      ].forEach(([name, good]) => {
        const b = el("button", { class: "msd-choice", text: name as string, attrs: { type: "button" } }) as HTMLButtonElement;
        b.addEventListener("click", () => {
          if (finished) return;
          if (good) {
            haptic(HAPTIC.correct);
            row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
            b.classList.add("ok");
            chips.on("cut", "오각뿔대");
            inst.innerHTML = `<b>오각뿔대</b>! 두 밑면은 평행하고, 옆면은 전부 <b>사다리꼴</b>이에요`;
            later(finish, 1300);
          } else {
            haptic(HAPTIC.cross);
            toast(
              name === "오각기둥"
                ? "기둥은 두 밑면이 합동! 이건 위가 작고 아래가 커요."
                : "사다리꼴은 평면도형 이름이에요. 이건 입체!",
            );
          }
        });
        row.appendChild(b);
      });
      ctl.appendChild(row);
      later(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }
  }

  startPick();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
