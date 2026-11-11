// [중1 Ⅱ v5] u2l1 magnifyLab: 「크게 보면 무엇이 보일까?」
// 한 통찰: 생물의 몸(양파 껍질, 코르크)은 크게 보면 작은 칸(세포)으로 가득하고, 생물이 아닌 소금에는 칸이 없다.
// 조작: 확대 막대 하나(맨눈 ×1 에서 ×400까지 로그 눈금)와 재료 카드 셋. 원인(배율, 재료)을 바꾸면 관찰 창이 그 자리에서 바뀐다.
// 흐름: 양파 → 코르크 → (소금을 고르는 순간) 예측 질문 → 소금 확대 → 판정(채점) → 결론.
//
// 크기 근거(한 자로 묶여 있다. 숫자를 따로 고치면 눈금과 그림이 어긋난다):
//   창 지름 200px, ×1에서 보이는 폭 136 mm → ×400에서 0.34 mm.
//   양파 표피세포 길이 약 0.3 mm: 타일(512px)의 세포 길이 153px = 0.3 mm 이므로 타일 한 장 = 1.0 mm.
//   코르크 세포 약 0.03 mm: 타일 한 장에 12칸 = 0.36 mm.  소금 알갱이 약 0.3 mm.
// 양파 그림은 구작 발주본(bio3/micro/onion.webp)의 가운데를 잘라 2×2 거울 타일로 붙인 것(qa/make-bio6-assets.py).
// 거울 타일이라 반복해도 세포벽이 끊기지 않는다. 창의 중심은 타일 한 장의 가운데에 둔다(이음매가 한가운데 오지 않게).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { BV_ICON, bvCanvas, bvField, bvFieldShade, bvRand, bvSrc, ONION_TILE_MM } from "../../../ui/bio6Kit";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvFrame, bvRange, bvTimers, type BvCard } from "./b6Lab";

interface MgfStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

type Key = "onion" | "cork" | "salt";

const D = 200; // 관찰 창 지름(px)
const W1 = 136; // ×1에서 창에 보이는 폭(mm)
const MAXM = 400;
const SEEN = 200; // 이 배율 이상 올려 보면 그 재료는 "해 봤다"
const CORK_TILE_MM = 0.36;
// 양파의 낮은 배율용 그림 타일(가로 1.44 mm, 세로 0.72 mm). 세포 길이 약 0.3 mm, 폭 0.045 mm로 사진과 같은 크기다.
const ONION_DRAW_MM = { w: 1.44, h: 0.72 };
// 사진은 시야가 타일 한 장(ONION_TILE_MM)보다 좁아지는 배율부터만 쓴다. 그보다 넓으면 거울 이음매의 대칭 무늬가 보인다.
const PHOTO_FROM = 205;
const PHOTO_FULL = 252;
const pxPerMm = (m: number): number => (D / W1) * m;
const ramp = (a: number, b: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

interface TileOpt {
  seed: number;
  /** 타일 한 장의 가로, 세로(px). 이 주기로 이어 붙여도 벽이 끊기지 않는다. */
  W: number;
  H: number;
  rows: number;
  /** 칸의 가로 길이 범위(px) */
  minW: number;
  maxW: number;
  /** 칸 끝 벽이 기우는 정도(px) */
  lean: number;
  tones: string[];
  base: string;
  wallSoft: string;
  wallCore: string;
  softW: number;
  coreW: number;
  /** 칸 안쪽의 밝은 얼룩(빈 칸에 빛이 통과하는 자리). 없으면 그리지 않는다 */
  glow?: string;
  /** 칸마다 하나씩 놓는 둥근 점(핵)의 색. 없으면 그리지 않는다 */
  dot?: string;
  /** 잔 알갱이 결의 색 행렬(feColorMatrix values) */
  grain: string;
}

/** 줄지어 선 칸 무늬 타일(SVG). 얇은 벽으로 나뉜 칸이 줄마다 어긋나게 놓인다.
 *  가로세로 모두 이어 붙여도 벽이 끊기지 않게 주기를 맞춘다: 칸 길이의 합이 타일 폭과 같고, 줄 경계의 물결도 타일 폭이 한 주기다. */
function cellTile(o: TileOpt): string {
  const rnd = bvRand(o.seed);
  const { W, H, rows } = o;
  // 줄 경계: y = 기준 + 물결(주기 = 타일 폭). 맨 아래 경계는 맨 위 경계 + H.
  const base = Array.from({ length: rows }, (_, r) => (r * H) / rows + (rnd() - 0.5) * (H / rows) * 0.24);
  const amp = Array.from({ length: rows }, () => 0.8 + rnd() * 1.4);
  const ph = Array.from({ length: rows }, () => rnd() * 6.283);
  const yAt = (r: number, x: number): number => {
    const k = ((r % rows) + rows) % rows;
    return base[k] + (r >= rows ? H : 0) + amp[k] * Math.sin((x / W) * 6.283 * 2 + ph[k]);
  };
  let cells = "";
  let wall = "";
  let dots = "";
  for (let r = 0; r < rows; r++) {
    // 칸 길이를 범위 안에서 뽑고, 합이 타일 폭이 되게 맞춘다
    const ws: number[] = [];
    let sum = 0;
    while (sum < W - o.minW) {
      const w = o.minW + rnd() * (o.maxW - o.minW);
      ws.push(w);
      sum += w;
    }
    const k = W / sum;
    let x = rnd() * o.maxW;
    const xs: number[] = [];
    ws.forEach((w) => {
      xs.push(x);
      x += w * k;
    });
    xs.forEach((x0, i) => {
      const x1 = i + 1 < xs.length ? xs[i + 1] : xs[0] + W;
      const tone = o.tones[Math.floor(rnd() * o.tones.length)];
      const lean = (rnd() - 0.5) * o.lean;
      const dotAt = 0.2 + rnd() * 0.6;
      const dotSide = rnd() < 0.5 ? 0.34 : 0.66;
      for (const dx of [-W, 0, W]) {
        const a = x0 + dx;
        const b = x1 + dx;
        if (b < -2 || a > W + 2) continue;
        const pts = `${a.toFixed(1)},${yAt(r, a).toFixed(1)} ${b.toFixed(1)},${yAt(r, b).toFixed(1)} ${(b + lean).toFixed(1)},${yAt(r + 1, b).toFixed(1)} ${(a + lean).toFixed(1)},${yAt(r + 1, a).toFixed(1)}`;
        cells += `<polygon points="${pts}" fill="${tone}"/>`;
        const cx = (a + b) / 2 + lean / 2;
        const top = yAt(r, cx);
        const bot = yAt(r + 1, cx);
        if (o.glow) cells += `<ellipse cx="${cx.toFixed(1)}" cy="${((top + bot) / 2).toFixed(1)}" rx="${((b - a) * 0.3).toFixed(1)}" ry="${((bot - top) * 0.28).toFixed(1)}" fill="${o.glow}" opacity=".5"/>`;
        if (o.dot) {
          const nx = a + (b - a) * dotAt;
          const nt = yAt(r, nx);
          const nb = yAt(r + 1, nx);
          dots += `<circle cx="${nx.toFixed(1)}" cy="${(nt + (nb - nt) * dotSide).toFixed(1)}" r="${((nb - nt) * 0.2).toFixed(1)}" fill="${o.dot}" opacity=".8"/>`;
        }
        wall += `M${a.toFixed(1)} ${yAt(r, a).toFixed(1)}L${(a + lean).toFixed(1)} ${yAt(r + 1, a).toFixed(1)}`;
      }
    });
    // 줄 경계(물결)
    let d = "";
    for (let px = -6; px <= W + 6; px += 6) d += `${px === -6 ? "M" : "L"}${px} ${yAt(r, px).toFixed(1)}`;
    wall += d;
    if (r === 0) wall += d.replace(/ (-?[0-9.]+)(?=L|$)/g, (_m, y) => ` ${(Number(y) + H).toFixed(1)}`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="${o.grain}"/></filter></defs>
    <rect width="${W}" height="${H}" fill="${o.base}"/>${cells}${dots}
    <path d="${wall}" stroke="${o.wallSoft}" stroke-width="${o.softW}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".7"/>
    <path d="${wall}" stroke="${o.wallCore}" stroke-width="${o.coreW}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect width="${W}" height="${H}" filter="url(#g)"/>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** 코르크 세포 타일. 얇은 벽으로 나뉜 빈 칸이 빼곡하다(훅의 그림과 같은 구조). */
const corkTile = (): string =>
  cellTile({
    seed: 23, W: 240, H: 240, rows: 14, minW: 14, maxW: 26, lean: 2.4,
    tones: ["#EBD3A6", "#E4C794", "#F0DCB4", "#DDBE89", "#E8CD9C"], base: "#E6CB9A",
    wallSoft: "#B88C58", wallCore: "#6E4824", softW: 3, coreW: 1.25, glow: "#FFF6DF",
    grain: "0 0 0 0 .32  0 0 0 0 .2  0 0 0 0 .08  0 0 0 .5 -.08",
  });

/** 양파 표피세포 무늬 타일(낮은 배율용). 길쭉한 칸이 줄지어 서고 칸마다 둥근 점이 하나씩 있다. 색은 사진에서 뽑았다. */
const onionTile = (): string =>
  cellTile({
    seed: 61, W: 480, H: 240, rows: 16, minW: 78, maxW: 126, lean: 9,
    tones: ["#D3B67C", "#D8BD85", "#CEB075", "#DCC28B", "#D0B279"], base: "#D3B67C",
    wallSoft: "#B79A62", wallCore: "#8C6E40", softW: 2.6, coreW: 1.1, dot: "#8E6A52",
    grain: "0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .1  0 0 0 .4 -.08",
  });

/** 소금 알갱이들(단위 mm). 가운데 한 알은 항상 창 한가운데에 있다. */
function saltWorld(): string {
  const rnd = bvRand(5);
  const pts: { x: number; y: number; s: number; a: number }[] = [{ x: 0.03, y: -0.02, s: 0.34, a: 9 }];
  let guard = 0;
  while (pts.length < 26 && guard++ < 900) {
    const x = (rnd() - 0.5) * 5.6;
    const y = (rnd() - 0.5) * 5.6;
    const s = 0.22 + rnd() * 0.16;
    if (pts.every((p) => Math.hypot(p.x - x, p.y - y) > (p.s + s) * 0.82)) pts.push({ x, y, s, a: (rnd() - 0.5) * 70 });
  }
  const grain = (p: { x: number; y: number; s: number; a: number }): string => `
    <g transform="translate(${p.x.toFixed(3)} ${p.y.toFixed(3)}) rotate(${p.a.toFixed(1)}) scale(${p.s.toFixed(3)})">
      <rect x="-.5" y="-.5" width="1" height="1" rx=".05" fill="url(#mgfSalt)" stroke="#7F97B5" stroke-width="1.8" vector-effect="non-scaling-stroke"/>
      <rect x="-.3" y="-.3" width=".6" height=".6" fill="none" stroke="#AEBFD6" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
      <path d="M-.5-.5L-.3-.3M.5-.5L.3-.3M.5.5L.3.3M-.5.5L-.3.3" stroke="#AEBFD6" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
    </g>`;
  return pts.map(grain).join("");
}

/** 맨눈(×1) 장면. 단위는 ×1에서의 px(창 200px = 136 mm, 받침 유리 76×26 mm = 112×38px). */
function macroScene(): string {
  return `
  <svg class="mgf-macro" viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="mgfBench" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#33486B"/><stop offset="1" stop-color="#17233A"/></radialGradient>
      <linearGradient id="mgfGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3FAFF" stop-opacity=".96"/><stop offset=".55" stop-color="#D6E9F6" stop-opacity=".9"/><stop offset="1" stop-color="#BBD6EA" stop-opacity=".92"/></linearGradient>
    </defs>
    <g class="mgf-mz">
      <rect x="-130" y="-130" width="260" height="260" fill="url(#mgfBench)"/>
      <ellipse cx="2" cy="24" rx="60" ry="5" fill="#0A1322" opacity=".35"/>
      <rect x="-56" y="-19" width="112" height="38" rx="2.2" fill="url(#mgfGlass)" stroke="#8DB4D2" stroke-width="1.1" vector-effect="non-scaling-stroke"/>
      <rect x="-55" y="-18" width="15" height="36" rx="1.6" fill="#FFFFFF" opacity=".62"/>
      <path d="M-36 -15.5H52" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity=".75" vector-effect="non-scaling-stroke"/>
      <g class="mgf-patch" data-k="onion">
        <rect x="-10.4" y="-10.4" width="20.8" height="20.8" rx="1.6" fill="#E9DCB2" fill-opacity=".9" stroke="#BFA868" stroke-width="1" vector-effect="non-scaling-stroke"/>
        <path d="M-6.5 -10V10M-2.2 -10V10M2.2 -10V10M6.5 -10V10" stroke="#C9B57C" stroke-width=".8" opacity=".55" vector-effect="non-scaling-stroke"/>
      </g>
      <g class="mgf-patch" data-k="cork">
        <rect x="-8.8" y="-6.6" width="17.6" height="13.2" rx="1" fill="#DDBD8C" stroke="#A47C4A" stroke-width="1" vector-effect="non-scaling-stroke"/>
        <path d="M-5 -3h2.4M1 -1h3M-3 3h2.6M3.5 3.6h2" stroke="#A47C4A" stroke-width=".9" stroke-linecap="round" opacity=".7" vector-effect="non-scaling-stroke"/>
      </g>
      <g class="mgf-patch" data-k="salt">
        ${[[-3, -2], [2, -3], [4, 1.4], [-1, 2.6], [0.4, -0.3], [-4.2, 1.2], [2.4, 3.2], [-2, -4], [5, -2.2]].map(([x, y]) => `<rect x="${x - 0.7}" y="${y - 0.7}" width="1.4" height="1.4" rx=".2" fill="#FFFFFF" stroke="#8FA6C2" stroke-width=".9" vector-effect="non-scaling-stroke"/>`).join("")}
      </g>
    </g>
  </svg>`;
}

const fmtWidth = (mm: number): string => {
  if (mm >= 95) return `${Math.round(mm / 10)} cm`;
  if (mm >= 10) return `${(mm / 10).toFixed(1)} cm`;
  if (mm >= 1) return `${mm.toFixed(1)} mm`;
  return `${mm.toFixed(2)} mm`;
};

export const magnifyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as MgfStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: 4, cls: "mgf-stage", qCls: "mgf-q", api });
  const cv = bvCanvas(f.stage);

  // ── 관찰 창 ────────────────────────────────────────────────────────
  const field = bvField({ x: 12, y: 15, d: D, cls: "mgf-field" });
  const macro = el("div", { class: "mgf-layer", html: macroScene() });
  const onionDraw = el("div", { class: "mgf-layer mgf-oniond" });
  onionDraw.style.backgroundImage = onionTile();
  const onionTex = el("div", { class: "mgf-layer mgf-onion" });
  onionTex.style.backgroundImage = `url("${bvSrc("bio6/micro/onion-mirror.webp")}")`;
  const corkBase = el("div", { class: "mgf-layer mgf-corkbase" });
  const corkTex = el("div", { class: "mgf-layer mgf-cork" });
  corkTex.style.backgroundImage = corkTile();
  const salt = el("div", {
    class: "mgf-layer mgf-salt",
    html: `<svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="mgfSalt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#EEF4FB"/><stop offset="1" stop-color="#D5E1EF"/></linearGradient></defs>
      <rect x="-100" y="-100" width="200" height="200" fill="#C9D8E8"/>
      <g class="mgf-world">${saltWorld()}</g>
    </svg>`,
  });
  const bar = el("div", { class: "mgf-bar" }, el("span", { class: "mgf-bar-t" }), el("i"));
  field.append(macro, onionDraw, onionTex, corkBase, corkTex, salt, bvFieldShade(), bar);

  const nameEl = el("div", { class: "bv-pill mgf-name" });
  const magEl = el("div", { class: "mgf-read mgf-mag" }, el("span", { text: "배율" }), el("b"));
  const widEl = el("div", { class: "mgf-read mgf-wid" }, el("span", { text: "보이는 폭" }), el("b"));
  const findEl = el("div", { class: "mgf-find" });
  cv.el.append(field, nameEl, magEl, widEl, findEl);

  const mz = macro.querySelector(".mgf-mz") as SVGGElement;
  const world = salt.querySelector(".mgf-world") as SVGGElement;
  const barLine = bar.querySelector("i") as HTMLElement;
  const barText = bar.querySelector(".mgf-bar-t") as HTMLElement;

  // ── 상태 ──────────────────────────────────────────────────────────
  const NAMES: Record<Key, string> = { onion: "양파 껍질", cork: "코르크", salt: "소금 알갱이" };
  let cur: Key = "onion";
  let mag = 1;
  let predicted = false;
  let asked = false;
  let finished = false;

  const cards: Record<Key, BvCard> = {
    onion: bvCard("col mgf-card", { name: "양파 껍질", icon: BV_ICON.onion, key: "onion" }),
    cork: bvCard("col mgf-card", { name: "코르크", icon: BV_ICON.cork, key: "cork" }),
    salt: bvCard("col mgf-card", { name: "소금", icon: BV_ICON.salt, key: "salt" }),
  };
  const range = bvRange({
    cls: "mgf-range",
    min: 0,
    max: 1000,
    value: 0,
    label: "확대 막대",
    // 로그 눈금: 배율 M의 자리 = log(M)/log(400)
    ticks: [
      { t: "맨눈", p: 0 },
      { t: "×10", p: 38.4 },
      { t: "×100", p: 76.9 },
      { t: "×400", p: 100 },
    ],
    onInput: (v) => {
      setMag(Math.pow(MAXM, v / 1000));
    },
    onChange: () => released(),
  });

  function hint(): string {
    if (cur === "onion") {
      if (mag < 6) return "양파 껍질 한 겹을 받침 유리에 올렸어요. <b>확대 막대</b>를 오른쪽으로 밀어 크게 봐요.";
      if (mag < 80) return "얇은 껍질에 가는 줄이 보이기 시작해요. <b>더 크게</b> 밀어 봐요.";
      if (mag < SEEN) return "작은 칸이 벽돌처럼 빼곡해요. 막대를 <b>끝까지</b> 밀어 봐요.";
      return cards.cork.isDone() ? "칸 하나하나가 <b>세포</b>예요. 칸마다 둥근 점도 하나씩 보여요." : "칸 하나하나가 <b>세포</b>예요. 이제 <b>코르크</b>를 골라 크게 봐요.";
    }
    if (cur === "cork") {
      if (mag < 6) return "훅이 들여다본 <b>코르크</b>(나무껍질) 조각이에요. 막대를 밀어 크게 봐요.";
      if (mag < 110) return "아직은 매끈해 보여요. 코르크의 칸은 훨씬 작아요. <b>더 크게!</b>";
      if (mag < SEEN) return "촘촘한 그물 무늬가 보여요. 막대를 <b>끝까지</b> 밀어 봐요.";
      return cards.salt.isDone() ? "빈 칸이 벌집처럼 빼곡해요. 훅이 '작은 방'이라 부른 <b>세포</b>예요." : "훅이 본 '작은 방', <b>세포</b>예요. 이제 <b>소금</b>도 골라 봐요.";
    }
    if (mag < 6) return "소금 알갱이를 뿌렸어요. 막대를 밀어 예측이 맞는지 확인해 봐요.";
    if (mag < SEEN) return "네모난 알갱이들이 보여요. 한 알 속까지 <b>더 크게</b> 봐요.";
    return "아무리 크게 봐도 매끈한 면뿐이에요. 소금에는 <b>칸이 없어요</b>.";
  }

  function paint(): void {
    const k = pxPerMm(mag);
    // 맨눈 장면: 배율만큼 커지다가(최대 16배) 현미경 그림에 자리를 넘긴다
    mz.setAttribute("transform", `scale(${Math.min(mag, 16).toFixed(3)})`);
    macro.querySelectorAll<SVGGElement>(".mgf-patch").forEach((g) => (g.style.display = g.dataset.k === cur ? "" : "none"));
    const microOn = cur === "salt" ? ramp(4, 11, mag) : ramp(9, 20, mag);
    macro.style.opacity = String(1 - microOn);
    // 양파: 낮은 배율은 그린 세포 무늬, 시야가 타일 한 장보다 좁아지면 실제 현미경 사진으로 넘어간다
    const photo = ramp(PHOTO_FROM, PHOTO_FULL, mag);
    onionDraw.style.display = cur === "onion" && photo < 1 ? "" : "none";
    onionDraw.style.opacity = String(microOn);
    onionDraw.style.backgroundSize = `${(ONION_DRAW_MM.w * k).toFixed(1)}px ${(ONION_DRAW_MM.h * k).toFixed(1)}px`;
    onionDraw.style.backgroundPosition = `${(D / 2 + ONION_DRAW_MM.w * k * 0.23).toFixed(1)}px ${(D / 2 + ONION_DRAW_MM.h * k * 0.31).toFixed(1)}px`;
    const so = ONION_TILE_MM * 2 * k; // 거울 타일(2×2) 한 장의 화면 크기
    onionTex.style.display = cur === "onion" && photo > 0 ? "" : "none";
    onionTex.style.opacity = String(photo);
    onionTex.style.backgroundSize = `${so.toFixed(1)}px ${so.toFixed(1)}px`;
    onionTex.style.backgroundPosition = `${(D / 2 + so / 4).toFixed(1)}px ${(D / 2 + so / 4).toFixed(1)}px`;
    // 코르크: 칸이 2px보다 작을 때는 바탕색만(잔무늬가 어른거리지 않게)
    const sc = CORK_TILE_MM * k;
    corkBase.style.display = cur === "cork" ? "" : "none";
    corkBase.style.opacity = String(microOn);
    corkTex.style.display = cur === "cork" ? "" : "none";
    corkTex.style.opacity = String(ramp(55, 115, mag));
    corkTex.style.backgroundSize = `${sc.toFixed(1)}px ${sc.toFixed(1)}px`;
    corkTex.style.backgroundPosition = `${(D / 2 + sc * 0.21).toFixed(1)}px ${(D / 2 + sc * 0.3).toFixed(1)}px`;
    // 소금
    salt.style.display = cur === "salt" ? "" : "none";
    salt.style.opacity = String(microOn);
    world.setAttribute("transform", `scale(${k.toFixed(3)})`);

    // 읽을 값
    // 배율 글자는 두 자리까지만(100 이상은 10 단위). 막대 눈금 ×100 자리에서 ×101로 보이지 않게.
    const m = mag >= 100 ? Math.round(mag / 10) * 10 : Math.round(mag);
    (magEl.querySelector("b") as HTMLElement).textContent = m <= 1 ? "맨눈" : `×${m}`;
    magEl.classList.toggle("eye", m <= 1);
    const w = W1 / mag;
    (widEl.querySelector("b") as HTMLElement).textContent = fmtWidth(w);
    // 눈금 막대: 1 cm, 1 mm, 0.1 mm, 0.01 mm 가운데 막대가 110px를 넘지 않는 가장 큰 단위
    const units: [number, string][] = [[10, "1 cm"], [1, "1 mm"], [0.1, "0.1 mm"], [0.01, "0.01 mm"]];
    const u = units.find(([mm]) => mm * k <= 110) ?? units[3];
    barLine.style.width = `${(u[0] * k).toFixed(1)}px`;
    barText.textContent = u[1];
    // 무대 안 결과 표시
    const seeAt = cur === "onion" ? 80 : cur === "cork" ? 110 : SEEN;
    const show = mag >= seeAt;
    findEl.textContent = cur === "salt" ? "칸이 없어요" : "칸이 보여요";
    findEl.classList.toggle("show", show);
    findEl.classList.toggle("none", cur === "salt");
    nameEl.textContent = NAMES[cur];
    f.say(hint());
  }

  function setMag(m: number): void {
    mag = Math.max(1, Math.min(MAXM, m));
    if (mag >= SEEN && !cards[cur].isDone()) {
      cards[cur].done();
      haptic(HAPTIC.ctaUnlock);
      f.pips(countDone());
    }
    paint();
  }

  const countDone = (): number => (["onion", "cork", "salt"] as Key[]).filter((k) => cards[k].isDone()).length + (finished ? 1 : 0);

  function select(k: Key): void {
    cur = k;
    (Object.keys(cards) as Key[]).forEach((x) => cards[x].on(x === k));
    range.set(0);
    setMag(1);
  }

  /** 손을 뗐을 때: 셋을 다 봤으면 판정으로 넘어간다(끄는 중에 화면이 바뀌지 않게 놓는 순간에만). */
  function released(): void {
    if (asked || finished) return;
    if (!cards.onion.isDone() || !cards.cork.isDone() || !cards.salt.isDone()) return;
    asked = true;
    tm.later(askFinal, 900);
  }

  function askPredict(): void {
    select("salt"); // 무엇을 두고 예측하는지 보이게 소금을 먼저 올린다(맨눈 상태)
    f.say("잠깐, 확대하기 전에 <b>예측</b>부터 해 봐요. 답은 곧 눈으로 확인해요.");
    f.slot.ask(
      "소금 알갱이도 크게 보면 <b>칸</b>이 보일까요?",
      [
        { t: "양파처럼 칸이 보일 것이다" },
        { t: "칸이 보이지 않을 것이다", ok: true },
      ],
      () => {
        predicted = true;
      },
      {
        predict: true,
        onNext: () => {
          f.slot.showControls();
          paint();
        },
      },
    );
  }

  function askFinal(): void {
    f.say("세 가지를 모두 크게 봤어요. 본 것을 떠올리며 골라 봐요.");
    f.slot.ask(
      "세 가지를 크게 본 결과로 알 수 있는 것은?",
      [
        { t: "생물의 몸은 세포로 이루어져 있다", ok: true },
        { t: "무엇이든 크게 보면 세포가 있다" },
        { t: "세포는 양파에만 있다" },
      ],
      (ok) => api.recordQuiz(ok),
      { why: "양파와 코르크에는 칸이 있었지만 <b>소금</b>에는 없었어요.", onNext: finish },
    );
  }

  function finish(): void {
    finished = true;
    f.pips(4);
    f.say("관찰 끝! 아래에서 오늘 눈으로 확인한 것을 읽어 봐요.");
    f.slot.conclude("생물의 몸은 <b>세포</b>로 이루어져 있어요. 세포는 아주 작아서 크게 확대해야 보여요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  (Object.keys(cards) as Key[]).forEach((k) =>
    cards[k].el.addEventListener("click", () => {
      if (k === cur) return;
      haptic(HAPTIC.tap);
      if (k === "salt" && !predicted) {
        askPredict();
        return;
      }
      select(k);
    }),
  );

  f.slot.setControls(bvCards(3, cards.onion, cards.cork, cards.salt), range.el);
  select("onion");
  api.setCTA("세 가지를 크게 확대해 보세요", { enabled: false });
  return () => {
    tm.clear();
    cv.off();
  };
};
