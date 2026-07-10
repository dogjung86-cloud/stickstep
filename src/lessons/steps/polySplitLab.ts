// polySplitLab, 다각형 내각의 합 랩(Ⅴ 평면도형 — 교과서 190~191쪽 내각의 크기의 합).
// 국면 3개: 1 오각형을 기준 꼭짓점 A의 부채살 대각선으로 쪼개기(탭) → 삼각형 3개, 180°×3=540° →
//   2 육각형으로 같은 조작 → 4개, 규칙 표 등장(n각형은 삼각형 n-2개) →
//   3 정육각형의 한 내각 미션(720÷6=120, 훅 벌집 콜백).
// 조작: 이웃 꼭짓점 탭 = "변이라 못 가르는" 함정 교정. 판정은 탭에서, 연출은 setTimeout 체인. rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, polar, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface SplitStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/* 무대 기하 */
const W = 340;
const H = 272;
const CX = 170;
const CY = 136;
const R = 104;
const TINTS = ["#F08C00", "#0DA5C6", "#E8547E", "#7C5CE8"]; // 삼각형 조각 색(순서대로)

/** 정n각형 꼭짓점(A 위, 반시계). */
const ngon = (n: number): { x: number; y: number }[] =>
  Array.from({ length: n }, (_, i) => polar(CX, CY, R, 90 + (360 / n) * i));

export const polySplitLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SplitStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "penta", label: "오각형 쪼개기", sub: "180°×3" },
    { id: "rule", label: "규칙 발견", sub: "n−2개" },
    { id: "bee", label: "벌집의 비밀", sub: "한 내각" },
  ]);

  const board = mboard(600);
  const stage = el("div", { class: "mps-stage" });
  const panel = el("div", { class: "mps-panel" });
  const inst = el("div", { class: "mps-inst" });
  const eqline = el("div", { class: "mps-eq" });
  const ctl = el("div", { class: "mps-ctl" });
  panel.append(inst, eqline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "삼각형의 180°는 알아냈죠? 이제 <b>큰 도형을 삼각형으로 쪼개서</b> 그 힘을 빌려요!",
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

  let phase: 1 | 2 | 3 = 1;
  let n = 5;
  let vtx = ngon(5);
  let drawnFrom: number[] = []; // A(0)에서 그은 대각선의 상대 꼭짓점 목록
  let finished = false;
  let lock = false;

  const NAME = (i: number): string => String.fromCharCode(65 + i);

  function buildStage(): void {
    const edges = vtx
      .map((p, i) => {
        const q = vtx[(i + 1) % n];
        return `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>`;
      })
      .join("");
    stage.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<g class="mps-fill"></g><g class="mps-diag"></g>` +
      edges +
      `<g class="mps-vtx">` +
      vtx
        .map((v, i) => {
          const lp = { x: v.x + (v.x - CX) * 0.16, y: v.y + (v.y - CY) * 0.2 };
          return (
            `<g class="mps-v${i === 0 ? " base" : ""}" data-i="${i}">` +
            `<circle class="hit" cx="${v.x.toFixed(1)}" cy="${v.y.toFixed(1)}" r="19" fill="transparent"/>` +
            `<circle class="face" cx="${v.x.toFixed(1)}" cy="${v.y.toFixed(1)}" r="${i === 0 ? 9 : 7.5}" fill="${i === 0 ? "#2F9E44" : "#FFFFFF"}" stroke="${i === 0 ? "#1E7A31" : GEO.ink}" stroke-width="2.4"/>` +
            `<text x="${lp.x.toFixed(1)}" y="${(lp.y + 4).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${GEO.ink}">${NAME(i)}</text>` +
            `</g>`
          );
        })
        .join("") +
      `</g></svg>`;
  }

  const gFill = (): SVGGElement => stage.querySelector(".mps-fill") as SVGGElement;
  const gDiag = (): SVGGElement => stage.querySelector(".mps-diag") as SVGGElement;

  /** A와 확정된 선(변 또는 그은 대각선)으로 닫힌 삼각형 판정. */
  const hasRay = (i: number): boolean => i === 1 || i === n - 1 || drawnFrom.includes(i);
  const countTris = (): number => {
    let c = 0;
    for (let i = 1; i < n - 1; i++) if (hasRay(i) && hasRay(i + 1)) c += 1;
    return c;
  };

  /** 대각선을 그으면 완성되는 삼각형 조각들을 채운다(0-i-(i+1) 꼴이 모두 확정됐는지 검사). */
  function refill(): void {
    const g = gFill();
    g.innerHTML = "";
    const has = hasRay;
    let t = 0;
    for (let i = 1; i < n - 1; i++) {
      if (has(i) && has(i + 1)) {
        const p1 = vtx[i];
        const p2 = vtx[i + 1];
        g.insertAdjacentHTML(
          "beforeend",
          `<path d="M${vtx[0].x.toFixed(1)} ${vtx[0].y.toFixed(1)} L${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L${p2.x.toFixed(1)} ${p2.y.toFixed(1)} Z" fill="${TINTS[t % TINTS.length]}" opacity=".26"/>` +
            `<text x="${((vtx[0].x + p1.x + p2.x) / 3).toFixed(1)}" y="${((vtx[0].y + p1.y + p2.y) / 3 + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="900" fill="${TINTS[t % TINTS.length]}">180°</text>`,
        );
      }
      t += 1;
    }
  }

  function updateEq(): void {
    const done = drawnFrom.length >= n - 3;
    eqline.innerHTML = done
      ? `삼각형 <b>${n - 2}개</b> × 180° = <b class="hl">${180 * (n - 2)}°</b>`
      : `지금까지 삼각형 <b>${countTris()}개</b>, 부채살 ${n - 3 - drawnFrom.length}개 남았어요`;
  }

  function startPenta(): void {
    phase = 1;
    n = 5;
    vtx = ngon(5);
    drawnFrom = [];
    buildStage();
    updateEq();
    inst.innerHTML = `기준점 <b>A</b>(초록)에서 이웃이 아닌 꼭짓점으로 <b>부채살 대각선</b>을 그어 보세요`;
    bindTaps();
  }

  function startHexa(): void {
    phase = 2;
    n = 6;
    vtx = ngon(6);
    drawnFrom = [];
    buildStage();
    updateEq();
    lock = false;
    inst.innerHTML = `이번엔 <b>육각형</b>! 똑같이 A에서 부채살을 펼쳐요`;
    helper.innerHTML = "몇 개의 삼각형으로 나뉠까요? 규칙이 보이기 시작할 거예요.";
    bindTaps();
  }

  /* ── 국면 3: 벌집의 비밀(정육각형 한 내각) ── */
  function startPhase3(): void {
    phase = 3;
    lock = false;
    inst.innerHTML = `미션: 훅의 벌집! <b>정육각형의 한 내각</b>은 몇 도일까요?`;
    helper.innerHTML = "내각의 합 720°를 <b>똑같은 각 6개</b>가 나눠 가져요. 하나는 몇 도?";
    eqline.innerHTML = `정육각형: 합 <b>720°</b>, 내각 <b>6개</b>가 모두 같아요`;
    clear(ctl);
    const row = el("div", { class: "mps-choices" });
    [100, 120, 144].forEach((v) => {
      const b = el("button", { class: "mps-choice", text: `${v}°`, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (v === 120) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          // 정육각형 여섯 내각에 120° 라벨 팝(부채살 180° 라벨은 지워 겹침 방지)
          gFill().querySelectorAll("text").forEach((t) => t.remove());
          const g = gDiag();
          vtx.forEach((p, i) => {
            later(() => {
              g.insertAdjacentHTML(
                "beforeend",
                `<text x="${(p.x + (CX - p.x) * 0.22).toFixed(1)}" y="${(p.y + (CY - p.y) * 0.22 + 4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#1E7A31" class="mps-pop">120°</text>`,
              );
            }, i * 130);
          });
          eqline.innerHTML = `<b class="hl">720° ÷ 6 = 120°</b>, 벌집이 딱 맞물린 이유!`;
          chips.on("bee", "120°");
          later(finish, 1400);
        } else {
          haptic(HAPTIC.cross);
          toast(v === 100 ? "합 720°를 6으로 나누면 100이 아니에요!" : "144°는 정십각형의 한 내각! 720÷6을 다시 계산해요.");
        }
      });
      row.appendChild(b);
    });
    ctl.appendChild(row);
    later(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "쪼개고(n−2개) 곱하고(×180°) 나누면(÷n) 어떤 다각형의 각도 정복할 수 있어요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  function bindTaps(): void {
    const svg = stage.querySelector("svg") as SVGSVGElement;
    svg.addEventListener("pointerdown", (e) => {
      if (lock || finished || phase === 3) return;
      capturePointer(svg, e.pointerId);
      const t = (e.target as Element).closest(".mps-v") as SVGGElement | null;
      if (!t) return;
      const i = Number(t.dataset.i);
      haptic(HAPTIC.tap);
      if (i === 0) {
        toast("A가 부채살의 중심이에요. 반대쪽 꼭짓점을 탭!");
        return;
      }
      if (i === 1 || i === n - 1) {
        haptic(HAPTIC.cross);
        toast(`A와 ${NAME(i)}는 이웃, 그 선은 이미 있는 변이에요!`);
        return;
      }
      if (drawnFrom.includes(i)) {
        toast("이미 그은 부채살이에요.");
        return;
      }
      // 대각선 긋기
      drawnFrom.push(i);
      const p = vtx[i];
      const len = Math.hypot(p.x - vtx[0].x, p.y - vtx[0].y);
      gDiag().insertAdjacentHTML(
        "beforeend",
        `<line x1="${vtx[0].x.toFixed(1)}" y1="${vtx[0].y.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#2F9E44" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="${len.toFixed(0)}" stroke-dashoffset="${len.toFixed(0)}" style="transition: stroke-dashoffset .45s ease-out"/>`,
      );
      later(() => {
        const ls = gDiag().querySelectorAll("line");
        (ls[ls.length - 1] as SVGLineElement).style.strokeDashoffset = "0";
      }, 20);
      haptic(HAPTIC.correct);
      later(refill, 380);
      updateEq();
      if (drawnFrom.length >= n - 3) {
        lock = true;
        later(() => {
          updateEq();
          haptic(HAPTIC.done);
          if (phase === 1) {
            toast("삼각형 3개, 180°×3=540°!");
            chips.on("penta", "540°");
            later(startHexa, 1900);
          } else {
            toast("삼각형 4개, 180°×4=720°!");
            chips.on("rule", "6−2=4");
            // 규칙 카드
            later(() => {
              eqline.innerHTML = `규칙: <b>n각형</b>은 삼각형 <b>(n−2)개</b>, 내각의 합은 <b class="hl">180°×(n−2)</b>`;
              later(startPhase3, 1700);
            }, 1200);
          }
        }, 600);
      }
    });
  }

  startPenta();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
