// [중2 Ⅱ v5] g2u2l9 랩 1, 2: 화산대와 지진대, 판의 경계.
//
// 랩 1 「다음 지진은 어디에서 날까요?」(g2u2QuakeLab)
//   책의 해 보기(화산 활동이 활발한 지역과 지진이 자주 발생하는 지역 알아보기)를 내기로 한다.
//   학생이 정하는 것: 지진이 날 것 같은 곳 세 군데(지도를 눌러 깃발을 꽂는다. 이것이 예측이다).
//   그다음 지진 자료를 재생해 깃발과 비교한다(맞은 깃발과 빗나간 깃발이 표시된다). 이어서 화산 자료도 겹쳐 본다.
//   판정 둘: 지진이 난 곳들의 모양, 화산과 지진의 관계. 통찰 하나: 지진과 화산은 띠 모양으로, 비슷한 곳에서 일어난다.
//
// 랩 2 「그 띠는 무엇과 겹칠까요?」(g2u2PlateLab)
//   책의 탐구(빅데이터를 활용하여 화산대 및 지진대와 판의 경계의 관련성 탐구하기: 자료 유형을 고르고 재생한다)를 한다.
//   학생이 정하는 것: 지도에 올릴 자료(지진, 화산 활동, 판의 경계)와 재생.
//   실패가 보이는 길: 판의 경계를 켜지 않고 재생하면 비교할 것이 없다. 두 가지(화산과 경계, 지진과 경계)를 모두 비교해야 끝난다.
//   판정 둘: 화산대와 지진대와 판의 경계의 관계, 우리나라보다 일본에서 지진과 화산 활동이 잦은 까닭.
//   둘째 판정 때는 지도를 동아시아(동경 110~160도, 북위 25~50도)로 옮겨 크게 본다(두 나라와 경계선의 거리 차가 보이게).
//
// 지도(2026-11-15 다시 그림): 태평양을 가운데에 둔 정거 원통 도법(이음매는 경도 25도, 아프리카 동쪽과 인도양 쪽)이라
//   '태평양 가장자리의 불의 고리'가 고리로 보인다. 땅은 한 색 실루엣(Natural Earth 110m, worldMap.generated.ts의 WORLD_LAND_PATH)이고
//   바다와 판은 어둡고 차분하게, 판마다 아주 옅게 다른 밝기를 깔아 판이 크고 작은 조각으로 보이게 한다. 점과 세모는 지도보다 진하다.
//   판의 경계는 plateData.ts의 닫힌 경계(주요 판 13개)다. 확대할 때는 벡터를 다시 그려 흐리지 않고, 점과 세모는 조금만 커진다.

import type { StepRenderer } from "../../types";
import { bvTween } from "../bio6/b6Lab";
import { WORLD_LAND_PATH } from "../../../ui/worldMap.generated";
import { G, gBtn, gGrid, gLab, gPick, haptic, HAPTIC, label, svgOpen, type GStep } from "./kit";
import { BOUNDS, PLATES, QUAKES, VOLCS } from "./plateData";

const MY = 30, MW = 346, MH = 173;
const SEAM = 25; // 지도의 이음매(경도)
interface View { lon: number; lat: number; s: number } // 지도 가운데의 경도와 위도, 1도당 px
const FULL: View = { lon: SEAM + 180 - 360, lat: 0, s: MW / 360 };
const EASIA: View = { lon: 135, lat: 37.5, s: MW / 50 };
const OCEAN = "#0F2236";
const f1 = (v: number): string => v.toFixed(1);
const wrap = (d: number): number => ((((d + 180) % 360) + 360) % 360) - 180;

/** 판마다 옅은 밝기를 칠한 바탕 그림(경도 -180~180, 위도 90~-90의 정거 원통). 경계선을 벽으로 두고 판의 씨앗에서 메운다. 한 번만 만든다. */
let tintCache = "";
function tintUrl(): string {
  if (tintCache) return tintCache;
  const W = 1080, H = 540, k = W / 360;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d");
  if (!c) return "";
  c.lineWidth = 2.4;
  c.lineJoin = "round";
  c.lineCap = "round";
  c.strokeStyle = "#000";
  for (const line of BOUNDS) for (const sh of [-720, -360, 0, 360, 720]) {
    c.beginPath();
    line.forEach(([lon, lat], i) => (i ? c.lineTo((lon + 180 + sh) * k, (90 - lat) * k) : c.moveTo((lon + 180 + sh) * k, (90 - lat) * k)));
    c.stroke();
  }
  const src = c.getImageData(0, 0, W, H).data;
  const mark = new Uint8Array(W * H); // 0 빈칸, 1 벽, 2 칠함
  for (let i = 0; i < W * H; i++) mark[i] = src[i * 4 + 3] > 8 ? 1 : 0;
  const out = c.createImageData(W, H), o = out.data;
  const TONE = [0, 0.03, 0.075, 0.12, 0.17];
  const stack = new Int32Array(W * H * 4 + 16);
  for (const p of PLATES) {
    const a = Math.round(255 * TONE[p.tone]);
    let n = 0;
    stack[n++] = Math.round((90 - p.at[1]) * k) * W + Math.round((wrap(p.at[0]) + 180) * k);
    while (n) {
      const i = stack[--n];
      if (mark[i]) continue;
      mark[i] = 2;
      o[i * 4] = o[i * 4 + 1] = o[i * 4 + 2] = 255;
      o[i * 4 + 3] = a;
      const x = i % W, y = (i - x) / W;
      stack[n++] = y * W + ((x + 1) % W);
      stack[n++] = y * W + ((x + W - 1) % W);
      if (y > 0) stack[n++] = i - W;
      if (y < H - 1) stack[n++] = i + W;
    }
  }
  // 경계선 자리(벽)는 옆 칸의 밝기로 메운다(선 아래가 비지 않게)
  for (let i = 0; i < W * H; i++) if (mark[i] === 1) {
    const x = i % W, nb = [i - W, i + W, i - x + ((x + 1) % W), i - x + ((x + W - 1) % W)].find((j) => j >= 0 && j < W * H && mark[j] === 2);
    if (nb !== undefined) { o[i * 4] = o[i * 4 + 1] = o[i * 4 + 2] = 255; o[i * 4 + 3] = o[nb * 4 + 3]; }
  }
  c.putImageData(out, 0, 0);
  tintCache = cv.toDataURL("image/png");
  return tintCache;
}

/** 지도 뼈대(SVG 조각). 점과 선의 자리는 mapCtl().draw(view)가 넣는다. */
function mapSkeleton(uid: string): string {
  return `<defs><clipPath id="g2plC${uid}"><rect x="0" y="${MY}" width="${MW}" height="${MH}"/></clipPath>
      <path id="g2plL${uid}" d="${WORLD_LAND_PATH}" fill-rule="evenodd" vector-effect="non-scaling-stroke"/></defs>
    <rect x="0" y="${MY}" width="${MW}" height="${MH}" fill="${OCEAN}"/>
    <g clip-path="url(#g2plC${uid})">
      <g class="g2u2x-pl-tint">${[0, 1, 2].map(() => `<image href="${tintUrl()}" preserveAspectRatio="none"/>`).join("")}</g>
      <g class="g2u2x-pl-land" fill="#3B5274" fill-opacity=".7" stroke="#8FA9CB" stroke-opacity=".5" stroke-width=".7">${[0, 1, 2].map(() => `<use href="#g2plL${uid}"/>`).join("")}</g>
      <g class="g2u2x-pl-bs"></g>
      <g class="g2u2x-pl-qs">${QUAKES.map((_, i) => `<circle class="g2u2x-pl-q" style="transition-delay:${((i * 37) % 95) * 16}ms" fill="#FFE066" stroke="#5C4400" stroke-width=".8"/>`).join("")}</g>
      <g class="g2u2x-pl-vs">${VOLCS.map((_, i) => `<path class="g2u2x-pl-v" style="transition-delay:${((i * 29) % 60) * 24}ms" fill="#FF5A3C" stroke="#4A0D00" stroke-width=".8"/>`).join("")}</g>
    </g>`;
}

interface MapCtl {
  draw: (v: View) => void;
  /** 지금 보이는 지도에서 경도와 위도의 무대 자리 */
  pt: (lon: number, lat: number) => [number, number];
  view: () => View;
}
function mapCtl(root: ParentNode): MapCtl {
  const tint = Array.from(root.querySelectorAll<SVGImageElement>(".g2u2x-pl-tint image"));
  const land = Array.from(root.querySelectorAll<SVGUseElement>(".g2u2x-pl-land use"));
  const bs = root.querySelector<SVGGElement>(".g2u2x-pl-bs")!;
  const qs = Array.from(root.querySelectorAll<SVGCircleElement>(".g2u2x-pl-q"));
  const vs = Array.from(root.querySelectorAll<SVGPathElement>(".g2u2x-pl-v"));
  let cur = FULL;
  const ptIn = (lon: number, lat: number, v: View): [number, number] => [MW / 2 + wrap(lon - v.lon) * v.s, MY + MH / 2 - (lat - v.lat) * v.s];
  const draw = (v: View): void => {
    cur = v;
    const W = 360 * v.s, x0 = MW / 2 + (-180 - v.lon) * v.s, y0 = MY + MH / 2 - (90 - v.lat) * v.s, a = 0.36 * v.s;
    // 이음매 둘레를 덮도록 세계 그림 셋을 나란히(가운데 것이 지금 경도 둘레)
    const base = x0 + Math.round((MW / 2 - (x0 + W / 2)) / W) * W;
    tint.forEach((im, i) => {
      im.setAttribute("x", f1(base + (i - 1) * W));
      im.setAttribute("y", f1(y0));
      im.setAttribute("width", f1(W));
      im.setAttribute("height", f1(W / 2));
    });
    land.forEach((u, i) => u.setAttribute("transform", `matrix(${a.toFixed(4)} 0 0 ${a.toFixed(4)} ${f1(base + (i - 1) * W)} ${f1(y0)})`));
    // 판의 경계: 이어진 경도로 적은 선을 360도씩 옮긴 사본 가운데 화면에 걸리는 것만
    bs.innerHTML = BOUNDS.map((line) => {
      const xs = line.map(([lon]) => MW / 2 + (lon - v.lon) * v.s), lo = Math.min(...xs), hi = Math.max(...xs);
      const out: string[] = [];
      for (let k = -3; k <= 3; k++) {
        if (hi + k * W < -20 || lo + k * W > MW + 20) continue;
        out.push(`<path class="g2u2x-pl-b" pathLength="100" d="M${line.map(([, lat], i) => `${f1(xs[i] + k * W)} ${f1(MY + MH / 2 - (lat - v.lat) * v.s)}`).join(" L")}" stroke="#7CF2E0" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
      }
      return out.join("");
    }).join("");
    const z = Math.max(0, Math.min(1, (v.s - FULL.s) / (EASIA.s - FULL.s)));
    const r = 3 + 1.6 * z, t = 3.7 + 1.9 * z;
    qs.forEach((c, i) => {
      const [x, y] = ptIn(QUAKES[i][0], QUAKES[i][1], v);
      c.setAttribute("cx", f1(x));
      c.setAttribute("cy", f1(y));
      c.setAttribute("r", r.toFixed(2));
    });
    vs.forEach((p, i) => {
      const [x, y] = ptIn(VOLCS[i][0], VOLCS[i][1], v);
      p.setAttribute("d", `M${f1(x - t)} ${f1(y + t * 0.72)} L${f1(x)} ${f1(y - t)} L${f1(x + t)} ${f1(y + t * 0.72)} Z`);
    });
  };
  return { draw, pt: (lon, lat) => ptIn(lon, lat, cur), view: () => cur };
}
const legend = (items: [string, string][]): string => items.map(([c, t], i) => `${t === "화산 활동" ? `<path d="M${8 + i * 92} 21 l6 -10 l6 10 Z" fill="${c}"/>` : t === "판의 경계" ? `<path d="M${7 + i * 92} 16 h14" stroke="${c}" stroke-width="3" stroke-linecap="round"/>` : `<circle cx="${14 + i * 92}" cy="16" r="5" fill="${c}"/>`}${label(24 + i * 92, 20.5, t, { anchor: "start", size: 12.5 })}`).join("");
const uidOf = (): string => Math.random().toString(36).slice(2, 7);

/* ══════════ 랩 1: 깃발 꽂고 지진 자료와 비교하기 ══════════ */
const PRESET: [number, number][] = [[72, 59], [187, 145], [111, 80]]; // 검사 도구가 누를 때 쓰는 자리(시베리아 한가운데, 남태평양 한가운데, 일본 앞바다)

export const g2u2QuakeLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-quake" });
  const { f, tm } = lab;
  const uid = uidOf();
  f.stage.innerHTML = `${svgOpen}${mapSkeleton(uid)}
    <g class="g2u2x-qk-pins"></g>
    ${legend([["#FFE066", "지진"], ["#FF5A3C", "화산 활동"]])}
    ${label(338, 20.5, "깃발 0 / 3", { anchor: "end", size: 12.5, fill: G.gold, cls: "g2u2x-qk-cnt" })}
    ${label(173, 222, "", { size: 12.5, fill: G.gold, cls: "g2u2x-qk-res" })}
  </svg>`;
  const map = mapCtl(f.stage);
  map.draw(FULL);
  const pins: [number, number][] = [];
  const pinsG = lab.q<SVGGElement>(".g2u2x-qk-pins");
  const tap = document.createElement("button");
  tap.type = "button";
  tap.className = "g2u2x-qk-tap";
  tap.dataset.k = "pin";
  tap.setAttribute("aria-label", "지도에 깃발 꽂기");
  f.stage.appendChild(tap);
  const drawPins = (hits?: boolean[]): void => {
    pinsG.innerHTML = pins.map(([x, y], i) => `<g><path d="M${x} ${y} v-15" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M${x} ${y - 15} l11 4 l-11 4 Z" fill="${hits ? (hits[i] ? G.ok : G.bad) : "#fff"}"/><circle cx="${x}" cy="${y}" r="2.4" fill="#fff"/>${hits ? `<circle cx="${x}" cy="${y}" r="13" stroke="${hits[i] ? G.ok : G.bad}" stroke-width="1.6" fill="none" stroke-dasharray="${hits[i] ? "0" : "4 3"}"/>` : ""}</g>`).join("");
    lab.q<SVGTextElement>(".g2u2x-qk-cnt").textContent = `깃발 ${pins.length} / 3`;
  };
  const play = gBtn("play", "지진 발생 지역 표시하기");
  const volc = gBtn("volc", "화산 활동도 겹쳐 보기");
  play.disabled = true;
  tap.addEventListener("click", (e) => {
    if (pins.length >= 3) return;
    const r = f.stage.getBoundingClientRect();
    const synthetic = e.clientX === 0 && e.clientY === 0;
    let x = synthetic ? PRESET[pins.length][0] : ((e.clientX - r.left) / r.width) * 346;
    let y = synthetic ? PRESET[pins.length][1] : ((e.clientY - r.top) / r.height) * 230;
    x = Math.round(Math.max(8, Math.min(338, x)));
    y = Math.round(Math.max(MY + 6, Math.min(MY + MH - 4, y)));
    haptic(HAPTIC.tap);
    pins.push([x, y]);
    drawPins();
    if (pins.length < 3) {
      f.say(`깃발 ${pins.length}개를 꽂았어요. 지진이 날 것 같은 곳을 <b>${3 - pins.length}군데 더</b> 눌러 보세요.`);
      lab.hint("pin");
      return;
    }
    tap.disabled = true;
    play.disabled = false;
    f.pips(1);
    f.say("깃발 세 개를 다 꽂았어요. 이제 실제로 <b>지진이 난 곳</b>을 표시해서 비교해 보세요.");
    lab.hint("play");
  });
  play.addEventListener("click", () => {
    play.disabled = true;
    haptic(HAPTIC.tap);
    f.stage.classList.add("quakes");
    f.say("노란 점 하나가 지진 한 번이에요. 점들이 <b>어디에</b> 찍히는지 지켜보세요.");
    tm.later(() => {
      const hits = pins.map(([x, y]) => QUAKES.some(([lon, lat]) => { const [qx, qy] = map.pt(lon, lat); return Math.hypot(qx - x, qy - y) < 13; }));
      drawPins(hits);
      const n = hits.filter(Boolean).length;
      lab.q<SVGTextElement>(".g2u2x-qk-res").textContent = `깃발 3개 가운데 ${n}개가 지진이 난 곳 가까이에 있어요`;
      haptic(n ? HAPTIC.correct : HAPTIC.wrong);
      f.say(n === 3 ? "깃발이 모두 맞았어요. 점들이 놓인 <b>모양</b>을 보고 답해 보세요." : "빗나간 깃발이 있어요. 지진은 아무 데서나 나지 않네요. 점들이 놓인 <b>모양</b>을 보세요.");
      tm.later(() => lab.ask("지진이 자주 일어난 지역은 지도에서 <b>어떤 모양</b>으로 분포하나요?", ["좁은 띠 모양으로 이어진다", "지도 전체에 고르게 퍼져 있다", "대륙 한가운데에 몰려 있다"], "지진은 <b>특정한 곳</b>에서 긴 띠를 이루며 일어나요.", () => {
        f.pips(2);
        f.slot.setControls(volc);
        f.say("이번에는 <b>화산 활동</b>이 활발한 곳을 같은 지도에 겹쳐 보세요.");
        api.setCTA("화산 활동도 겹쳐 보세요", { enabled: false });
        lab.hint("volc");
      }), 1200);
    }, 2600);
  });
  volc.addEventListener("click", () => {
    volc.disabled = true;
    haptic(HAPTIC.tap);
    f.stage.classList.add("volcs");
    tm.later(() => lab.ask("<b>화산 활동</b>이 활발한 곳과 지진이 잦은 곳은?", ["대체로 겹친다", "서로 반대쪽에 있다", "아무 관계가 없다"], "붉은 세모와 노란 점이 <b>같은 띠</b>를 따라 놓여 있어요.", () =>
      lab.finish("지진과 화산 활동은 아무 데서나 일어나지 않아요. <b>특정한 곳에 긴 띠 모양</b>으로 몰려 있고, 지진이 잦은 곳과 화산 활동이 활발한 곳은 대체로 겹쳐요. 태평양의 가장자리가 가장 활발해요."),
    ), 2200);
  });
  f.slot.setControls(play);
  f.say("앞으로 지진이 날 것 같은 곳에 <b>깃발 세 개</b>를 꽂아 보세요. 지도를 누르면 꽂혀요.");
  api.setCTA("지도에 깃발 세 개를 꽂아 보세요", { enabled: false });
  lab.hint("pin");
  return lab.cleanup;
};

/* ══════════ 랩 2: 자료를 골라 판의 경계와 비교하기 ══════════ */
type Layer = "q" | "v" | "b";
const KR: [number, number] = [127.5, 36.5], JP: [number, number] = [138.5, 36.5];

export const g2u2PlateLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-plate" });
  const { f, tm } = lab;
  const uid = uidOf();
  f.stage.innerHTML = `${svgOpen}${mapSkeleton(uid)}
    <g class="g2u2x-pl-kj"></g>
    ${legend([["#FFE066", "지진"], ["#FF5A3C", "화산 활동"], ["#7CF2E0", "판의 경계"]])}
    ${label(173, 222, "비교 완료: 없음", { size: 12.5, fill: G.dim, weight: 700, cls: "g2u2x-pl-log" })}
  </svg>`;
  const map = mapCtl(f.stage);
  map.draw(FULL);
  const on: Record<Layer, boolean> = { q: false, v: false, b: false };
  const seen = { v: false, q: false };
  let busy = false;
  const NAME: Record<Layer, string> = { q: "지진", v: "화산 활동", b: "판의 경계" };
  const picks = (["v", "q", "b"] as Layer[]).map((k) => {
    const p = gPick(k, NAME[k], "눌러서 켜기");
    p.el.addEventListener("click", () => {
      if (busy || lab.finished()) return;
      haptic(HAPTIC.tap);
      on[k] = !on[k];
      p.on(on[k]);
      p.sub(on[k] ? "켜짐" : "눌러서 켜기");
      f.stage.classList.remove("quakes", "volcs", "bounds");
      hintNow();
    });
    return p;
  });
  const play = gBtn("play", "지도에 겹쳐 보기");
  function hintNow(): void {
    const want: Layer = !seen.v ? "v" : "q", other: Layer = want === "v" ? "q" : "v";
    if (on[other]) lab.hint(other);
    else if (!on[want]) lab.hint(want);
    else if (!on.b) lab.hint("b");
    else lab.hint("play");
  }
  /** 둘째 판정 전에 지도를 동아시아로 옮겨 크게 보고, 우리나라와 일본을 표시한다. */
  function zoomToKoreaJapan(done: () => void): void {
    const a = map.view(), dl = wrap(EASIA.lon - a.lon), ls0 = Math.log(a.s), ls1 = Math.log(EASIA.s);
    bvTween(tm, 1200, (t) => map.draw({ lon: a.lon + dl * t, lat: a.lat + (EASIA.lat - a.lat) * t, s: Math.exp(ls0 + (ls1 - ls0) * t) }), () => {
      // 이름표는 원의 왼쪽(일본은 왼쪽 위): 일본 둘레의 점과 경계선을 덮지 않게
      const mk = (ll: [number, number], name: string, dy: number): string => {
        const [x, y] = map.pt(ll[0], ll[1]);
        return `<circle cx="${f1(x)}" cy="${f1(y)}" r="6.5" stroke="#fff" stroke-width="2.4" fill="rgba(255,255,255,.18)"/>${label(x - 10, y + dy, name, { anchor: "end", size: 13, cls: "g2u2x-halo" })}`;
      };
      lab.q(".g2u2x-pl-kj").innerHTML = mk(KR, "우리나라", 4.5) + mk(JP, "일본", -8);
      f.stage.classList.add("kj");
      const t = lab.q<SVGTextElement>(".g2u2x-pl-log");
      t.textContent = "우리나라와 일본 둘레를 크게 본 지도";
      t.setAttribute("fill", G.dim);
      done();
    });
  }
  play.addEventListener("click", () => {
    if (busy || lab.finished()) return;
    if (!on.q && !on.v && !on.b) {
      haptic(HAPTIC.wrong);
      f.say("지도에 올릴 <b>자료</b>를 먼저 골라 주세요.");
      return;
    }
    haptic(HAPTIC.tap);
    busy = true;
    f.stage.classList.remove("quakes", "volcs", "bounds");
    void f.stage.offsetWidth;
    if (on.q) f.stage.classList.add("quakes");
    if (on.v) f.stage.classList.add("volcs");
    if (on.b) f.stage.classList.add("bounds");
    tm.later(() => {
      busy = false;
      if (!on.b) {
        haptic(HAPTIC.wrong);
        host.dataset.g2Miss = String(Number(host.dataset.g2Miss ?? 0) + 1);
        f.say("분포 띠는 보이지만 <b>판의 경계</b>가 꺼져 있어요. 판의 경계도 함께 켜서 비교해 보세요.");
        hintNow();
        return;
      }
      if (!on.q && !on.v) {
        f.say("판의 경계만 보여요. <b>화산 활동</b>이나 <b>지진</b>을 함께 켜서 비교해 보세요.");
        hintNow();
        return;
      }
      if (on.v) seen.v = true;
      if (on.q) seen.q = true;
      haptic(HAPTIC.correct);
      const log = [seen.v ? "화산 활동과 판의 경계" : "", seen.q ? "지진과 판의 경계" : ""].filter(Boolean).join(", ");
      const t = lab.q<SVGTextElement>(".g2u2x-pl-log");
      t.textContent = `비교 완료: ${log}`;
      t.setAttribute("fill", G.gold);
      f.pips(seen.v && seen.q ? 2 : 1);
      if (!(seen.v && seen.q)) {
        f.say(`${on.v ? "붉은 세모가" : "노란 점이"} 청록색 선을 따라 놓여 있어요. 이번에는 <b>${seen.v ? "지진" : "화산 활동"}</b>과 판의 경계를 비교해 보세요.`);
        hintNow();
        return;
      }
      f.stage.classList.add("quakes", "volcs", "bounds"); // 판정의 근거를 무대에 남긴다: 세 자료를 모두 켠다
      f.say("화산 활동과 지진을 모두 판의 경계와 비교했어요. 세 자료를 함께 켠 지도를 보고 답해 보세요.");
      tm.later(() => lab.ask("화산대와 지진대는 <b>판의 경계</b>와 어떤 관계인가요?", ["대체로 일치한다", "서로 엇갈려 있다", "아무 관계가 없다"], "세모와 점이 대부분 <b>청록색 선</b>을 따라 놓여 있어요.", () => {
        busy = true;
        f.say("지도를 <b>우리나라와 일본</b> 주변으로 확대해 볼게요.");
        zoomToKoreaJapan(() => {
          f.say("<b>우리나라와 일본</b>을 표시했어요. 판의 경계와 얼마나 가까운지 비교해 보세요.");
          lab.ask("우리나라보다 <b>일본</b>에서 지진과 화산 활동이 잦은 까닭은?", ["판의 경계에 더 가까워서", "섬으로 이루어진 나라라서", "우리나라보다 더 따뜻해서"], "일본은 <b>판의 경계</b> 바로 위에 있고 우리나라는 조금 떨어져 있어요.", () =>
            lab.finish("화산 활동과 지진은 주로 <b>판의 경계</b>에서 일어나요. 그래서 화산대와 지진대는 판의 경계와 대체로 일치하고, 판의 경계에 가까운 일본에서는 우리나라보다 지진과 화산 활동이 잦아요."),
          );
        });
      }), 1000);
    }, 2400);
  });
  f.slot.setControls(gGrid(3, ...picks), play);
  f.say("지도에 올릴 <b>자료</b>를 고르고 겹쳐 보세요. 먼저 화산 활동과 판의 경계를 비교해 볼까요?");
  api.setCTA("자료를 골라 비교해 보세요", { enabled: false });
  hintNow();
  return lab.cleanup;
};
