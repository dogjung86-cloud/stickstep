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

// ── 2. 유리컵과 빨대 ────────────────────────────────────────────
const straw: OpenerScene = (c) => {
  const M = meta(c).straw;
  art(c, "strawBase");
  const ov = overlay(c, "opn-g2u3-straw");
  const [cx, , cw] = M.cup;
  const water = svgEl(ov, "rect", { x: cx + 6, y: M.wy0, width: cw - 12, height: 0, class: "w" });
  const upper = svgEl(ov, "line", { class: "s" });
  const lower = svgEl(ov, "line", { class: "s lo" });
  art(c, "strawCup");
  const along = (y: number): number => M.top[0] + ((M.bot[0] - M.top[0]) * (y - M.top[1])) / (M.bot[1] - M.top[1]);
  const paint = (v: number): void => {
    const wy = M.wy0 + (M.wy1 - M.wy0) * v;
    water.setAttribute("y", String(wy));
    water.setAttribute("height", String(M.wy0 - wy));
    const sx = along(wy);
    const set = (ln: SVGLineElement, x1: number, y1: number, x2: number, y2: number): void => {
      ln.setAttribute("x1", String(x1));
      ln.setAttribute("y1", String(y1));
      ln.setAttribute("x2", String(x2));
      ln.setAttribute("y2", String(y2));
    };
    set(upper, M.top[0], M.top[1], v > 0.02 ? sx : M.bot[0], v > 0.02 ? wy : M.bot[1]);
    // 물에 잠긴 부분: 수면에서 꺾여 보인다
    set(lower, sx, wy, M.bot[0] + M.bend * Math.min(1, v * 1.4), M.bot[1]);
    lower.style.opacity = v > 0.02 ? "1" : "0";
  };
  paint(0);
  let done = false;
  let kept = 0;
  const pour = btn(c, "pour", "물 붓기", "꾹 누르고 있어요");
  c.controls.classList.add("opn-g2u3-one");
  const verdict = bet(c, "빈 유리컵에 빨대를 꽂아 두었어요. 여기에 물을 부으면 빨대는 어떻게 보일까요?", ["수면에서 꺾여 보여요", "그대로 곧게 보여요", "물속 부분이 안 보여요"], "예측 완료! <b>물 붓기</b>를 꾹 눌러 컵에 물을 채워 보세요.");
  holdFill(
    c,
    pour,
    1400,
    () => playing(c) && !done,
    (v) => paint(Math.max(kept, v)),
    (v) => {
      kept = Math.max(kept, v);
      if (kept < 0.75) {
        c.say("조금 더 길게 <b>꾹</b> 눌러 물을 더 채워 보세요.");
        return;
      }
      done = true;
      pour.disabled = true;
      c.later(() => end(c, `${verdict()} 빨대가 수면에서 꺾여 보여요. 빨대는 그대로인데 왜 꺾여 보일까요?`), 600);
    },
  );
};

// ── 3. 깜깜한 방 ────────────────────────────────────────────────
const dark: OpenerScene = (c) => {
  const M = meta(c).dark;
  art(c, "darkBase");
  const S = meta(c).stage;
  const ov = overlay(c, "opn-g2u3-dark");
  svgEl(ov, "polygon", { class: "cone", points: `${M.torch[0]},${M.torch[1] - 20} ${S.w},${M.cat[1] - 250} ${S.w},${M.cat[1] + 130} ${M.torch[0]},${M.torch[1] + 20}` });
  svgEl(ov, "rect", { class: "night", x: 0, y: 0, width: S.w, height: S.h });
  const eyes = svgEl(ov, "g", { class: "eyes" });
  [-24, 24].forEach((dx) => {
    svgEl(eyes, "ellipse", { cx: M.eyes[0] + dx, cy: M.eyes[1], rx: 13, ry: 15, fill: "#fff" });
    svgEl(eyes, "circle", { cx: M.eyes[0] + dx + 4, cy: M.eyes[1], r: 6, fill: "#1c1c1e" });
  });
  eyes.style.transformOrigin = `${M.eyes[0]}px ${M.eyes[1]}px`;
  const tried = { stare: false, torch: false };
  let busy = false;
  let lit = false;
  let over = false;
  const stare = btn(c, "stare", "눈 크게 뜨기", "빛 없이 기다려요");
  const torch = btn(c, "torch", "손전등 켜기", "고양이 쪽으로");
  const torchLabel = torch.querySelector("b") as HTMLElement;
  c.controls.classList.add("opn-g2u3-two");
  const verdict = bet(c, "빛이 전혀 없는 깜깜한 방에 고양이가 있어요. 눈을 크게 뜨고 기다리면 고양이가 보일까요?", ["끝까지 보이지 않아요", "조금 지나면 어렴풋이 보여요", "눈을 크게 뜨면 보여요"], "예측 완료! 먼저 <b>눈을 크게 뜨고</b> 기다려 보세요.");
  const finishIf = (): void => {
    if (over || !tried.stare || !tried.torch) return;
    over = true;
    c.later(() => end(c, `${verdict()} 빛이 없을 때는 끝까지 안 보였고, 손전등을 켜자 보였어요. 그 빛은 어디로 갔을까요?`), 700);
  };
  stare.addEventListener("click", () => {
    if (!playing(c) || busy || over) return;
    if (lit) {
      lit = false;
      c.stage.classList.remove("lit");
      torchLabel.textContent = "손전등 켜기";
    }
    busy = true;
    haptic(HAPTIC.tap);
    c.stage.classList.add("wide");
    c.say("눈을 크게 뜨고 기다리는 중이에요.");
    c.later(() => {
      busy = false;
      c.stage.classList.remove("wide");
      tried.stare = true;
      stare.classList.add("tried");
      if (!tried.torch) c.say("아무리 기다려도 <b>깜깜</b>해요. 이번엔 <b>손전등</b>을 켜 보세요.");
      finishIf();
    }, 1800);
  });
  torch.addEventListener("click", () => {
    if (!playing(c) || busy || over) return;
    haptic(HAPTIC.tap);
    lit = !lit;
    c.stage.classList.toggle("lit", lit);
    torchLabel.textContent = lit ? "손전등 끄기" : "손전등 켜기";
    if (!lit) {
      c.say("다시 깜깜해졌어요.");
      return;
    }
    tried.torch = true;
    torch.classList.add("tried");
    if (!tried.stare) c.say("고양이가 보여요! 손전등을 끄고 <b>눈을 크게 떠서</b> 기다려 보면 어떨까요?");
    finishIf();
  });
};

// ── 4. 거울 앞의 고양이 ─────────────────────────────────────────
const catMirror: OpenerScene = (c) => {
  const M = meta(c).cat;
  art(c, "catBase");
  const real = c.stage.querySelector<SVGElement>(".opn-g2u3-cat");
  const twin = c.stage.querySelector<SVGElement>(".opn-g2u3-cat2");
  let n = 0;
  const go = btn(c, "step", "한 걸음 다가가기", "고양이가 거울 쪽으로");
  c.controls.classList.add("opn-g2u3-one");
  const verdict = bet(c, "고양이가 거울을 보고 있어요. 고양이가 거울 쪽으로 한 걸음 다가가면 거울 속 고양이는?", ["똑같이 한 걸음 다가와요", "제자리에 그대로 있어요", "한 걸음 뒤로 물러나요"], "예측 완료! 고양이를 거울 쪽으로 <b>세 걸음</b> 걷게 해 보세요.");
  go.addEventListener("click", () => {
    if (!playing(c) || n >= M.steps) return;
    n += 1;
    haptic(HAPTIC.tap);
    if (real) real.style.transform = `translateX(${n * M.step}px)`;
    if (twin) twin.style.transform = `translateX(${-n * M.step}px)`;
    if (n < M.steps) {
      c.say(`거울 속 고양이도 움직였어요. <b>${M.steps - n}걸음</b> 더 다가가 보세요.`);
      return;
    }
    go.disabled = true;
    c.later(() => end(c, `${verdict()} 거울 속 고양이도 똑같이 다가왔어요. 거울 속 고양이는 거울에서 얼마나 떨어져 있을까요?`), 800);
  });
};

// ── 5. 숟가락에 비친 얼굴 ───────────────────────────────────────
const spoon: OpenerScene = (c) => {
  art(c, "spoonBase");
  const tried = { in: false, out: false };
  let over = false;
  const bIn = btn(c, "in", "오목한 쪽 보기", "숟가락의 안쪽");
  const bOut = btn(c, "out", "볼록한 쪽 보기", "숟가락의 뒷면");
  c.controls.classList.add("opn-g2u3-two");
  const verdict = bet(c, "숟가락을 들고 오목한 안쪽에 얼굴을 비춰요. 얼굴은 어떻게 보일까요?", ["거꾸로 보여요", "똑바로 크게 보여요", "평소와 똑같이 보여요"], "예측 완료! 숟가락의 <b>두 쪽</b>에 얼굴을 비춰 보세요.");
  const show = (k: "in" | "out"): void => {
    if (!playing(c) || over) return;
    haptic(HAPTIC.tap);
    c.stage.classList.toggle("side-in", k === "in");
    c.stage.classList.toggle("side-out", k === "out");
    tried[k] = true;
    (k === "in" ? bIn : bOut).classList.add("tried");
    if (tried.in && tried.out) {
      over = true;
      c.later(() => end(c, `${verdict()} 오목한 쪽에서는 거꾸로, 볼록한 쪽에서는 바로 보였어요. 같은 숟가락인데 왜 다를까요?`), 900);
    } else c.say(k === "in" ? "얼굴이 <b>거꾸로</b> 보여요. 이번엔 <b>볼록한 쪽</b>에 비춰 보세요." : "얼굴이 작지만 <b>바로</b> 보여요. 이번엔 <b>오목한 쪽</b>에 비춰 보세요.");
  };
  bIn.addEventListener("click", () => show("in"));
  bOut.addEventListener("click", () => show("out"));
};

// ── 6. 점으로 그린 물고기 ───────────────────────────────────────
const dots: OpenerScene = (c) => {
  const M = meta(c).dots;
  art(c, "dotsBase");
  const ov = overlay(c, "opn-g2u3-dots");
  const [bx, by, rx, ry] = M.body;
  const tail = M.tail.map((p) => `${p[0]},${p[1]}`).join(" ");
  const grp = svgEl(ov, "g", { class: "fish" });
  grp.style.transformOrigin = `${bx - 40}px ${by}px`;
  // 빨간 점과 초록 점을 번갈아 찍는다
  const inTail = (x: number, y: number): boolean => {
    const [a, b, d] = M.tail;
    const s = (p: readonly number[], q: readonly number[]): number => (x - q[0]) * (p[1] - q[1]) - (p[0] - q[0]) * (y - q[1]);
    const d1 = s(a, b);
    const d2 = s(b, d);
    const d3 = s(d, a);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  const dotG = svgEl(grp, "g", { class: "pts" });
  let i = 0;
  for (let y = by - ry - 60; y <= by + ry + 60; y += M.gap * 0.86) {
    i += 1;
    for (let x = bx - rx - 110 + (i % 2) * (M.gap / 2), j = 0; x <= bx + rx; x += M.gap, j++) {
      const inBody = ((x - bx) / rx) ** 2 + ((y - by) / ry) ** 2 <= 1;
      if (!inBody && !inTail(x, y)) continue;
      svgEl(dotG, "circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: M.r, fill: (i + j) % 2 ? "#E8453C" : "#35B24F" });
    }
  }
  // 멀리서 본 모습(점이 섞여 보인다)
  const blend = svgEl(grp, "g", { class: "blend" });
  svgEl(blend, "ellipse", { cx: bx, cy: by, rx, ry, fill: "#F2D21E" });
  svgEl(blend, "polygon", { points: tail, fill: "#F2D21E" });
  svgEl(grp, "circle", { cx: M.eye[0], cy: M.eye[1], r: 9, fill: "#1c1c1e" });
  const paint = (v: number): void => {
    grp.style.transform = `scale(${1 - 0.62 * v})`;
    blend.style.opacity = String(Math.max(0, (v - 0.35) / 0.55));
    dotG.style.opacity = String(1 - Math.max(0, (v - 0.55) / 0.45));
  };
  paint(0);
  let done = false;
  let kept = 0;
  const back = btn(c, "back", "뒤로 물러나기", "꾹 누르고 있어요");
  c.controls.classList.add("opn-g2u3-one");
  const verdict = bet(c, "빨간 점과 초록 점만 촘촘히 찍어 물고기를 그렸어요. 멀리 물러나서 보면 무슨 색으로 보일까요?", ["노란색으로 보여요", "갈색으로 보여요", "빨강과 초록 그대로 보여요"], "예측 완료! <b>뒤로 물러나기</b>를 꾹 눌러 그림에서 멀어져 보세요.");
  holdFill(
    c,
    back,
    1500,
    () => playing(c) && !done,
    (v) => paint(Math.max(kept, v)),
    (v) => {
      kept = Math.max(kept, v);
      if (kept < 0.9) {
        c.say("조금 더 길게 <b>꾹</b> 눌러 더 멀리 물러나 보세요.");
        return;
      }
      done = true;
      back.disabled = true;
      c.later(() => end(c, `${verdict()} 멀리서 보니 노란 물고기예요. 노란 점은 하나도 없는데 어떻게 된 걸까요?`), 600);
    },
  );
};

// ── 7. 연못의 낚시찌 ────────────────────────────────────────────
const floatScene: OpenerScene = (c) => {
  const M = meta(c).float;
  art(c, "floatBase");
  const ov = overlay(c, "opn-g2u3-rip");
  const rings = [0, 1, 2].map((i) => {
    const e = svgEl(ov, "ellipse", { cx: M.splash[0], cy: M.splash[1], rx: 30, ry: 7, class: `ring r${i}` });
    e.style.transformOrigin = `${M.splash[0]}px ${M.splash[1]}px`;
    return e;
  });
  void rings;
  const cone = c.stage.querySelector<SVGElement>(".opn-g2u3-cone");
  const b = hit(c, M.hit, "솔방울을 눌러 연못에 떨어뜨리기");
  let done = false;
  const verdict = bet(c, "연못에 솔방울이 떨어져 물결이 퍼져 나가요. 물결이 지나갈 때 낚시찌는 어떻게 될까요?", ["제자리에서 오르내려요", "물결을 따라 밀려가요", "솔방울 쪽으로 끌려와요"], "예측 완료! 나뭇가지의 <b>솔방울</b>을 눌러 연못에 떨어뜨려 보세요.");
  b.addEventListener("click", () => {
    if (!playing(c) || done) return;
    done = true;
    haptic(HAPTIC.tap);
    c.stage.classList.add("touched");
    if (cone) cone.style.transform = `translateY(${M.splash[1] - M.cone[1]}px)`;
    c.later(() => {
      c.stage.classList.add("ripple");
      if (cone) cone.style.opacity = "0";
      c.say("퐁당! 물결이 퍼져 나가요. <b>낚시찌</b>를 지켜보세요.");
    }, 520);
    c.later(() => c.stage.classList.add("bob"), 1900);
    c.later(() => end(c, `${verdict()} 찌는 제자리에서 오르내리기만 했어요. 물결은 지나갔는데 찌는 왜 밀려가지 않을까요?`), 4300);
  });
};

// ── 8. 칼림바 ──────────────────────────────────────────────────
const kalimba: OpenerScene = (c) => {
  const M = meta(c).kalimba;
  art(c, "kalimbaBase");
  const tried = { long: false, short: false };
  let over = false;
  let ac: AudioContext | null = null;
  const ping = (hz: number): void => {
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ac = ac ?? new AC();
      const t0 = ac.currentTime;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = hz;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.8);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t0);
      o.stop(t0 + 0.85);
    } catch {
      /* 소리를 낼 수 없는 기기에서는 음표만 보인다 */
    }
  };
  c.onCleanup(() => {
    try {
      void ac?.close();
    } catch {
      /* 이미 닫힌 경우 */
    }
  });
  const verdict = bet(c, "칼림바의 긴 막대와 짧은 막대를 같은 세기로 튕겨요. 어느 쪽에서 더 높은 소리가 날까요?", ["짧은 막대", "긴 막대", "둘 다 같은 높이예요"], "예측 완료! <b>긴 막대</b>와 <b>짧은 막대</b>를 한 번씩 눌러 튕겨 보세요.");
  const pluck = (k: "long" | "short"): void => {
    if (!playing(c) || over) return;
    haptic(HAPTIC.tap);
    c.stage.classList.add("touched");
    ping(k === "long" ? 262 : 523);
    c.stage.classList.remove("pl-long", "pl-short");
    void c.stage.offsetWidth; // 같은 막대를 다시 눌러도 떨림이 처음부터 돈다
    c.stage.classList.add(`pl-${k}`);
    tried[k] = true;
    if (tried.long && tried.short) {
      over = true;
      c.later(() => end(c, `${verdict()} 짧은 막대에서 더 높은 소리가 났어요. 높은 소리와 낮은 소리는 무엇이 다를까요?`), 1000);
    } else c.say(k === "long" ? "낮은 소리가 났어요(음표가 아래쪽에 떠요). 이번엔 <b>짧은 막대</b>를 튕겨 보세요." : "높은 소리가 났어요(음표가 위쪽에 떠요). 이번엔 <b>긴 막대</b>를 튕겨 보세요.");
  };
  const bl = hit(c, M.hitLong, "긴 막대 튕기기");
  const bs = hit(c, M.hitShort, "짧은 막대 튕기기");
  bl.dataset.k = "long";
  bs.dataset.k = "short";
  bl.addEventListener("click", () => pluck("long"));
  bs.addEventListener("click", () => pluck("short"));
};

export const G2U3_SCENES: Record<string, OpenerScene> = {
  "g2u3-town": town,
  "g2u3-straw": straw,
  "g2u3-dark": dark,
  "g2u3-cat": catMirror,
  "g2u3-spoon": spoon,
  "g2u3-dots": dots,
  "g2u3-float": floatScene,
  "g2u3-kalimba": kalimba,
};
