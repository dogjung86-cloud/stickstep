// [중2 Ⅲ 도입] 여덟 장면. 형식은 중1과 같다: 내기(예측)를 먼저 걸고 → 손으로 한 일이 장면을 바꾸고 → 끝에서 예측과 견준다.
// 예측은 모두 neutral(답이 조작으로 드러난다). 원리의 답은 말하지 않고 물음으로 맺어 바로 뒤의 랩에 넘긴다.
//   g2u3-town   (g2u3l1) 거울을 기울여 그늘진 마을 광장에 햇빛 보내기      → 랩: 비춘 각과 반사한 각 재기
//   g2u3-straw  (g2u3l2) 컵에 물을 부으면 빨대가 어떻게 보이나            → 랩: 수조에 레이저 비추기
//   g2u3-dark   (g2u3l3) 깜깜한 방에서 눈을 크게 떠 보고, 손전등을 켠다     → 랩: 빛의 길 화살표로 잇기
//   g2u3-cat    (g2u3l4) 고양이가 거울로 한 걸음씩 다가간다               → 랩: 반투명 거울로 상의 자리 찾기
//   g2u3-spoon  (g2u3l5) 숟가락의 오목한 쪽과 볼록한 쪽에 얼굴 비추기       → 랩: 볼록 거울과 오목 거울 관찰
//   g2u3-dots   (g2u3l6) 빨간 점과 초록 점만 찍은 그림에서 뒤로 물러나기     → 랩: 조명, 손전등, 화소
//   g2u3-float  (g2u3l7) 연못에 솔방울을 떨어뜨리고 낚시찌 지켜보기         → 랩: 수조의 탁구공
//   g2u3-kalimba(g2u3l8) 칼림바의 긴 막대와 짧은 막대 튕기기               → 랩: 소리 분석 화면 견주기
// 그림은 qa/sketch/scenes/intro-g2u3.mjs(손그림). 좌표는 c.meta에서 읽는다. 그림 속에 글자와 숫자는 없다.
// 옛 훅(hookLight.ts)과 달라진 것: 예측이 결과 앞으로 왔고, 답을 말하던 끝말을 물음으로 바꿨다. 소재는 책의 도입 그림을 따른다
// (2번은 동전 대신 빨대로 바꿨다. 동전은 바로 뒤 둘째 랩이 다룬다).

import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx, OpenerScene } from "../opener";

type Meta = (typeof import("../../../../ui/introArt.g2u3.generated"))["INTRO_META"];
export const meta = (c: OpenerCtx): Meta => c.meta as unknown as Meta;
export const art = (c: OpenerCtx, key: string): void => {
  c.stage.append(el("div", { class: "opn-layer", html: (c.art as unknown as Record<string, string>)[key] ?? "" }));
};
const pct = (v: number, of: number): string => `${(v / of) * 100}%`;
const SVGNS = "http://www.w3.org/2000/svg";
/** 무대 위에 얹는 빈 SVG 겹(무대 좌표 960×544). 앱이 선과 도형을 그린다. */
export function overlay(c: OpenerCtx, cls: string): SVGSVGElement {
  const S = meta(c).stage;
  const svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${S.w} ${S.h}`);
  svg.setAttribute("class", `opn-layer ${cls}`);
  svg.setAttribute("aria-hidden", "true");
  c.stage.append(svg);
  return svg;
}
export function svgEl<K extends keyof SVGElementTagNameMap>(parent: SVGElement, tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  parent.appendChild(n);
  return n;
}

/** 무대 위의 누르는 자리(무대 좌표 x, y, w, h). */
export function hit(c: OpenerCtx, r: readonly number[], label: string): HTMLButtonElement {
  const S = meta(c).stage;
  const b = el("button", { class: "opn-g2u3-hit", attrs: { type: "button", "aria-label": label }, style: { left: pct(r[0], S.w), top: pct(r[1], S.h), width: pct(r[2], S.w), height: pct(r[3], S.h) } }) as HTMLButtonElement;
  c.stage.append(b);
  return b;
}
/** 조작 줄의 버튼. */
export function btn(c: OpenerCtx, key: string, label: string, sub: string): HTMLButtonElement {
  const b = el("button", { class: "opn-g2u3-btn", attrs: { type: "button" } }, el("b", { text: label }), el("span", { text: sub })) as HTMLButtonElement;
  b.dataset.k = key;
  c.controls.appendChild(b);
  return b;
}
/** 내기: 첫 보기가 조작으로 드러날 결과다. 끝말 앞에 붙일 "예측대로" 또는 "예측과 달리"를 돌려준다. */
export function bet(c: OpenerCtx, question: string, picks: string[], go: string): () => string {
  let verdict = "예측과 달리";
  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  c.ask(question, {
    choices: picks,
    neutral: true,
    good: go,
    onDone: (picked) => {
      verdict = picked === picks[0] ? "예측대로" : "예측과 달리";
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.controls.hidden = c.controls.children.length === 0;
      c.face("curious");
    },
  });
  return () => verdict;
}
export function end(c: OpenerCtx, html: string): void {
  c.face("surprised");
  haptic(HAPTIC.correct);
  c.say(html);
  c.finish();
}
export const playing = (c: OpenerCtx): boolean => c.step.dataset.opnPhase === "play";

/** 꾹 누르는 동안 0에서 1로 차오르는 값. 놓으면 onRelease(그때의 값). */
export function holdFill(c: OpenerCtx, b: HTMLButtonElement, ms: number, canPress: () => boolean, paint: (v: number) => void, onRelease: (v: number) => void): void {
  let v = 0;
  let holding = false;
  let last = 0;
  let raf = 0;
  const tick = (t: number): void => {
    if (!holding || !c.alive()) return;
    v = Math.min(1, v + (t - last) / ms);
    last = t;
    paint(v);
    raf = requestAnimationFrame(tick);
  };
  const up = (): void => {
    if (!holding) return;
    holding = false;
    cancelAnimationFrame(raf);
    const got = v;
    onRelease(got);
  };
  b.addEventListener("pointerdown", (e) => {
    if (!canPress() || holding) return;
    try {
      b.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트에는 붙잡을 포인터가 없다 */
    }
    holding = true;
    v = 0;
    last = performance.now();
    c.stage.classList.add("touched");
    haptic(HAPTIC.tap);
    raf = requestAnimationFrame(tick);
  });
  b.addEventListener("pointerup", up);
  b.addEventListener("pointercancel", up);
  b.addEventListener("contextmenu", (e) => e.preventDefault());
  // 키보드: 한 번 누르면 끝까지 눌렀다 놓은 것으로 친다
  b.addEventListener("click", (e) => {
    if (e.detail !== 0 || !canPress()) return;
    paint(1);
    c.later(() => onRelease(1), 500);
  });
  c.onCleanup(() => cancelAnimationFrame(raf));
}

// ── 1. 산에 가린 마을과 거울 ────────────────────────────────────
const town: OpenerScene = (c) => {
  const M = meta(c).town;
  art(c, "townBase");
  const mir = c.stage.querySelector<SVGElement>(".opn-g2u3-mir");
  const ov = overlay(c, "opn-g2u3-beam");
  svgEl(ov, "line", { x1: M.sun[0] + 46, y1: M.sun[1] + 8, x2: M.mir[0], y2: M.mir[1] });
  const outRay = svgEl(ov, "line", { x1: M.mir[0], y1: M.mir[1], x2: M.mir[0], y2: M.mir[1] });
  let idx = M.spots.length - 1; // 처음에는 햇빛이 산 중턱에 가 있다
  const aim = (): void => {
    const [tx, ty] = M.spots[idx];
    const norm = (x: number, y: number): [number, number] => {
      const L = Math.hypot(x, y);
      return [x / L, y / L];
    };
    const s = norm(M.sun[0] - M.mir[0], M.sun[1] - M.mir[1]);
    const t = norm(tx - M.mir[0], ty - M.mir[1]);
    // 거울 면에 수직인 방향은 해 쪽과 닿는 곳 쪽의 한가운데다(그림의 거울은 왼쪽을 보고 서 있다)
    const deg = (Math.atan2(s[1] + t[1], s[0] + t[0]) * 180) / Math.PI - 180;
    if (mir) mir.style.transform = `rotate(${deg}deg)`;
    outRay.setAttribute("x2", String(tx));
    outRay.setAttribute("y2", String(ty));
    c.stage.classList.toggle("lit", idx === M.plaza);
  };
  if (mir) mir.style.transformOrigin = `${M.mir[0]}px ${M.mir[1]}px`;
  aim();
  let done = false;
  const move = (d: number): void => {
    if (!playing(c) || done) return;
    const next = Math.max(0, Math.min(M.spots.length - 1, idx + d));
    if (next === idx) {
      c.say("더는 기울어지지 않아요. <b>반대쪽</b>으로 기울여 보세요.");
      return;
    }
    idx = next;
    haptic(HAPTIC.tap);
    aim();
    if (idx === M.plaza) {
      done = true;
      c.later(() => end(c, `${verdict()} 각도를 맞추자 광장이 밝아졌어요. 거울에서 빛은 어떤 규칙으로 방향을 바꿀까요?`), 900);
    } else c.say(idx > M.plaza ? "햇빛이 아직 <b>산 쪽</b>에 떨어져요. 거울을 더 숙여 보세요." : "햇빛이 마을을 지나 <b>언덕 쪽</b>에 떨어져요. 거울을 세워 보세요.");
  };
  const down = btn(c, "down", "거울 숙이기", "햇빛이 언덕 쪽으로");
  const upB = btn(c, "up", "거울 세우기", "햇빛이 산 쪽으로");
  c.controls.classList.add("opn-g2u3-two");
  down.addEventListener("click", () => move(-1));
  upB.addEventListener("click", () => move(1));
  const verdict = bet(c, "산에 가려 해가 들지 않는 마을이 있어요. 맞은편 언덕의 거울로 광장을 밝힐 수 있을까요?", ["각도를 잘 맞추면 밝아져요", "거울은 빛을 못 내서 안 돼요", "어느 각도로 두어도 밝아져요"], "예측 완료! 거울을 기울여 햇빛을 <b>광장</b>에 보내 보세요.");
};

export const G2U3_SCENES: Record<string, OpenerScene> = { "g2u3-town": town };
