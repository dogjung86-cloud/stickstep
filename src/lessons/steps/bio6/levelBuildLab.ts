// [중1 Ⅱ v5] u2l5 levelBuildLab: 「세포가 차례대로 모이면 무엇이 될까?」
// 한 통찰: 생물의 몸은 세포가 그냥 모인 것이 아니라 세포, 조직, 기관, 개체의 단계를 거쳐 이루어진다.
//   동물에는 기관계가, 식물에는 조직계가 한 단계 더 있다.
// 조작: 막대를 밀면 그림이 더 큰 단계로 넓어지고(작은 것이 큰 것 속의 한 자리가 된다), 오른쪽 계단에 단계 이름이 아래에서부터 쌓인다.
//   동물: 상피세포 → 상피조직 → 위 → 소화계 → 사람.  식물: 잎살세포 → 울타리 조직 → 잎의 조직계 → 잎 → 나무.
//   (조직계 칸의 그림은 위아래 표피까지 든 잎 조각이라 기본 조직계 하나가 아니다. 표피 조직계와 기본 조직계가 함께 있다.)
//   두 계단을 다 쌓으면 "동물과 식물의 단계 비교하기"가 뜨고, 나란히 놓인 두 계단을 보며 판정 두 번(첫 판정만 채점).
// 그림: 동물 쪽 네 장은 v4 브랜치 발주본의 사본(public/bio6/levels), 사람과 식물 쪽은 구작(public/bio2/levels).
// 넓어지는 움직임: 다음 단계 그림 속의 한 자리(ANCHOR)에서 화면 가득 보이던 시야가 그림 전체로 물러난다.
//   앞 단계 그림은 그 자리에 놓인 채 함께 작아지다 사라진다(두 그림이 똑같지는 않아서 겹쳐 넘긴다). 그림 상자는 한 변 196px.
// 움직임은 막대 값의 함수라 타이머가 필요 없다. 손을 떼면 가까운 단계로 맞춰 준다(타이머 보간).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { bvCanvas, bvSrc } from "../../../ui/bio6Kit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvFrame, bvRange, bvTimers, bvTween, type BvCard } from "./b6Lab";

interface BlvStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

type Route = "animal" | "plant";
interface Level {
  rank: string;
  name: string;
  /** 그림. public 아래 경로이거나, 코드 그림이면 data: 주소 */
  img: string;
  say: string;
}
interface RouteDef {
  card: string;
  sub: string;
  levels: Level[];
  /** k번째 그림이 k+1번째 그림 속에서 놓이는 자리(그림 중심에서의 px, 196px 상자 기준)와 크기 비. */
  anchor: [number, number, number][];
  /** 멈춘 화면에서 k번째 그림이 들어간 자리를 두르는 고리(가로, 세로 반지름 px). k+1번째 그림 위에 그린다. */
  ring: [number, number][];
  /** 그 고리 곁에 놓는 앞 단계의 작은 그림 자리(그림 상자의 왼쪽 위 기준 가운데 px). k+1번째 그림마다. */
  thumb: [number, number][];
}

// ── 세포와 조직 칸의 코드 그림(2026-11-15 그래픽 손질) ─────────────────────────
// 고치기 전에는 발주 그림이라 동물 쪽 상피세포와 상피조직이 납작한 비늘 모양(입안, 피부의 상피)이었는데 다음 칸은 위였다.
// 위 안쪽의 상피는 원기둥 모양이다(같은 레슨 정리 그림 u2l5f2와 같은 모양). 식물 쪽 잎살세포는 가로로 넓은 상자였는데
// 다음 칸 울타리 조직의 세포는 세로로 길었다. 네 칸을 같은 모양의 세포로 다시 그린다: 원기둥 상피세포와 그 한 줄,
// 세로로 긴 잎살세포와 그 세포가 나란히 선 울타리 조직. 세포 칸의 세포는 조직 칸 한가운데 세포와 같은 비율이라
// 막대를 밀면 그 세포가 조직 속 제자리로 들어간다. 196×196 설계, 바탕 없음(무대가 어둡다). u2l4의 납작한 상피세포는 그대로 둔다.
const svgUri = (body: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 196 196" width="196" height="196">${body}</svg>`)}`;
const f1 = (v: number): string => v.toFixed(1);
const NUC_GRAD = `<radialGradient id="n" cx=".38" cy=".3" r=".78"><stop offset="0" stop-color="#C3B1FF"/><stop offset=".55" stop-color="#7C5CF0"/><stop offset="1" stop-color="#5230C2"/></radialGradient>`;

/** 원기둥 상피세포 하나의 몸(왼쪽 위 x0, y0, 폭 w, 높이 h). 꼭대기는 둥글고 핵은 아래쪽에 있다. */
function columnCell(x0: number, y0: number, w: number, h: number, edge: number): string {
  const r = w * 0.36;
  const d = `M${f1(x0)} ${f1(y0 + r)}Q${f1(x0)} ${f1(y0)} ${f1(x0 + w / 2)} ${f1(y0)}Q${f1(x0 + w)} ${f1(y0)} ${f1(x0 + w)} ${f1(y0 + r)}L${f1(x0 + w)} ${f1(y0 + h)}L${f1(x0)} ${f1(y0 + h)}Z`;
  const cx = x0 + w / 2;
  const dots = [0.22, 0.34, 0.46].map((t, i) => `<circle cx="${f1(cx + (i - 1) * w * 0.2)}" cy="${f1(y0 + h * t)}" r="${f1(w * 0.05)}" fill="#E48AA8" opacity=".55"/>`).join("");
  // 꼭대기의 잔털(원기둥 상피세포의 윗면에 촘촘한 털이 있다)
  const hair = Array.from({ length: 9 }, (_, i) => {
    const x = x0 + w * (0.12 + (0.76 * i) / 8);
    const t = (x - cx) / (w / 2);
    const y = y0 + r * (1 - Math.sqrt(Math.max(0, 1 - t * t))) * 0.9;
    return `M${f1(x)} ${f1(y + w * 0.02)}v${f1(-w * 0.13)}`;
  }).join("");
  return `<path d="${hair}" stroke="#D97A99" stroke-width="${f1(w * 0.035)}" stroke-linecap="round"/>
    <path d="${d}" fill="url(#c)" stroke="#C75C80" stroke-width="${edge}" stroke-linejoin="round"/>
    <path d="M${f1(x0 + w * 0.16)} ${f1(y0 + r * 1.1)}V${f1(y0 + h * 0.86)}" stroke="#fff" stroke-width="${f1(w * 0.06)}" stroke-linecap="round" opacity=".38"/>
    ${dots}
    <ellipse cx="${f1(cx)}" cy="${f1(y0 + h * 0.76)}" rx="${f1(w * 0.25)}" ry="${f1(h * 0.115)}" fill="url(#n)"/>
    <ellipse cx="${f1(cx + w * 0.04)}" cy="${f1(y0 + h * 0.78)}" rx="${f1(w * 0.07)}" ry="${f1(h * 0.03)}" fill="#3F2499" opacity=".7"/>`;
}
const COL_DEFS = `<defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFDCE6"/><stop offset=".5" stop-color="#F7B8C8"/><stop offset="1" stop-color="#E58FAA"/></linearGradient>${NUC_GRAD}</defs>`;
/** 세포: 원기둥 상피세포 하나(폭 50, 높이 152, 가운데 98, 98). */
const EPI_CELL = svgUri(`${COL_DEFS}${columnCell(73, 22, 50, 152, 1.8)}`);
/** 조직: 원기둥 상피세포가 한 줄로 맞닿은 상피조직(세포 일곱, 폭 24, 높이 73). 가운데 세포가 (98, 98)이다. 아래에 바닥의 얇은 막. */
const EPI_TISSUE = svgUri(
  `${COL_DEFS}${Array.from({ length: 7 }, (_, i) => columnCell(14 + i * 24, 61.5, 24, 73, 1.2)).join("")}<path d="M12 135.6H184" stroke="#B04A70" stroke-width="2.2" stroke-linecap="round"/>`,
);

/** 세로로 긴 잎살세포 하나의 몸. 두꺼운 세포벽 안에 엽록체가 벽을 따라 늘어서 있다. */
function palisadeCell(x0: number, y0: number, w: number, h: number, k: number): string {
  const r = w / 2;
  const wall = `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(r)}" fill="#C8E68C" stroke="#5E8F22" stroke-width="${f1(1.6 * k)}"/>`;
  const inner = `<rect x="${f1(x0 + 3.4 * k)}" y="${f1(y0 + 3.4 * k)}" width="${f1(w - 6.8 * k)}" height="${f1(h - 6.8 * k)}" rx="${f1(r - 3.4 * k)}" fill="url(#p)" stroke="#9CC95A" stroke-width="${f1(0.9 * k)}"/>`;
  const n = Math.max(3, Math.round((h - 2 * r) / (11 * k)) + 1);
  const chl: string[] = [];
  for (let i = 0; i < n; i++) {
    const y = y0 + r * 0.9 + ((h - r * 1.8) * i) / (n - 1);
    for (const side of [-1, 1]) {
      const x = x0 + w / 2 + side * (w / 2 - 8.6 * k);
      chl.push(`<ellipse cx="${f1(x)}" cy="${f1(y + (side > 0 ? 3 * k : 0))}" rx="${f1(3.2 * k)}" ry="${f1(4.8 * k)}" fill="url(#g)" stroke="#2F7A1F" stroke-width="${f1(0.7 * k)}"/>`);
    }
  }
  const top = [0, 1, 2].map((j) => `<ellipse cx="${f1(x0 + w / 2 + (j - 1) * 7 * k)}" cy="${f1(y0 + 8.4 * k + (j === 1 ? -1.4 * k : 0))}" rx="${f1(3 * k)}" ry="${f1(2.4 * k)}" fill="url(#g)" stroke="#2F7A1F" stroke-width="${f1(0.7 * k)}"/>`);
  const nuc = `<ellipse cx="${f1(x0 + w / 2)}" cy="${f1(y0 + h * 0.5)}" rx="${f1(4.6 * k)}" ry="${f1(5.6 * k)}" fill="url(#n)"/>`;
  const hi = `<path d="M${f1(x0 + 3 * k)} ${f1(y0 + r)}V${f1(y0 + h - r)}" stroke="#fff" stroke-width="${f1(1.4 * k)}" stroke-linecap="round" opacity=".45"/>`;
  return wall + inner + chl.join("") + top.join("") + nuc + hi;
}
const PAL_DEFS = `<defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F7FCE3"/><stop offset="1" stop-color="#E6F4BE"/></linearGradient>
  <radialGradient id="g" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#9BE36E"/><stop offset=".6" stop-color="#4CAF30"/><stop offset="1" stop-color="#2E7D1E"/></radialGradient>${NUC_GRAD}</defs>`;
/** 세포: 세로로 긴 잎살세포 하나(폭 46, 높이 160, 가운데 98, 98). */
const LEAF_CELL = svgUri(`${PAL_DEFS}${palisadeCell(75, 18, 46, 160, 2)}`);
/** 조직: 잎살세포가 나란히 선 울타리 조직(세포 일곱, 폭 24, 높이 83.5). 가운데 세포가 (98, 98)이다. */
const PALISADE = svgUri(`${PAL_DEFS}${Array.from({ length: 7 }, (_, i) => palisadeCell(14 + i * 24, 56.25, 24, 83.5, 1.04)).join("")}`);

const ROUTES: Record<Route, RouteDef> = {
  animal: {
    card: "동물",
    sub: "사람의 몸",
    levels: [
      { rank: "세포", name: "상피세포", img: EPI_CELL, say: "생물의 몸을 이루는 기본 단위인 <b>상피세포</b> 하나예요. 아래 막대를 오른쪽으로 밀어 세포를 모아 보세요." },
      { rank: "조직", name: "상피조직", img: EPI_TISSUE, say: "모양과 기능이 비슷한 세포들이 모여 <b>조직</b>(상피조직)을 이루었어요." },
      { rank: "기관", name: "위", img: "bio6/levels/stomach.webp", say: "여러 조직이 모여 고유한 모양과 기능을 갖춘 <b>기관</b>(위)이 됐어요." },
      { rank: "기관계", name: "소화계", img: "bio6/levels/digestive.webp", say: "위, 작은창자처럼 연관된 일을 하는 여러 기관이 모여 <b>기관계</b>(소화계)를 이루었어요." },
      { rank: "개체", name: "사람", img: "bio2/levels/human.webp", say: "여러 기관계가 모여 독립된 하나의 생물인 <b>개체</b>(사람)가 완성됐어요!" },
    ],
    // 세포 → 조직: 세포 칸의 세포(폭 50)가 조직 칸 가운데 세포(폭 24)로. 조직 → 위: 위 안쪽의 주름진 벽.
    anchor: [[0, 0, 0.48], [30, 2, 0.26], [15, -4, 0.2], [0, -30, 0.6]],
    ring: [[22, 44], [30, 18], [21, 21], [44, 58]],
    thumb: [[30, 30], [30, 30], [30, 30], [30, 30]],
  },
  plant: {
    card: "식물",
    sub: "나무의 몸",
    levels: [
      { rank: "세포", name: "잎살세포", img: LEAF_CELL, say: "식물의 잎을 이루는 <b>잎살세포</b> 하나예요. 아래 막대를 밀어 세포를 모아 보세요." },
      { rank: "조직", name: "울타리 조직", img: PALISADE, say: "모양과 기능이 비슷한 세포들이 모여 <b>조직</b>(울타리 조직)을 이루었어요." },
      { rank: "조직계", name: "잎의 조직계", img: "bio2/levels/tissue-system.webp", say: "여러 조직이 모여 <b>조직계</b>를 이루었어요. 동물에는 없고 식물에 있는 단계예요!" },
      { rank: "기관", name: "잎", img: "bio2/levels/leaf.webp", say: "여러 조직계가 모여 고유한 모양과 기능을 갖춘 <b>기관</b>(잎)이 됐어요. 뿌리, 줄기, 꽃도 식물의 기관이에요." },
      { rank: "개체", name: "나무", img: "bio2/levels/tree.webp", say: "여러 기관이 모여 독립된 하나의 생물인 <b>개체</b>(나무)가 완성됐어요!" },
    ],
    // 세포 → 조직: 세포 칸의 세포(폭 46)가 조직 칸 가운데 세포(폭 24)로. 조직 → 조직계: 잎 단면의 울타리 조직 층(높이 62~100).
    anchor: [[0, 0, 0.522], [0, -17, 0.43], [8, 4, 0.22], [26, -42, 0.1]],
    ring: [[22, 50], [40, 22], [24, 24], [14, 14]],
    thumb: [[30, 30], [30, 30], [30, 30], [30, 166]],
  },
};
const ORDER: Route[] = ["animal", "plant"];
/** 낱말 뒤의 목적격 조사(받침이 있으면 "을", 없으면 "를"). */
const eul = (w: string): string => {
  const c = w.charCodeAt(w.length - 1) - 0xac00;
  return c >= 0 && c < 11172 && c % 28 !== 0 ? "을" : "를";
};

const ramp = (a: number, b: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const levelBuildLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BlvStep;
  const tm = bvTimers();
  // 세 줄 도움말을 처음부터 잡아 둔다(한쪽 계단을 다 쌓은 뒤의 글이 세 줄이다. 랩 도중에 무대가 밀리지 않게)
  const f = bvFrame(host, { title: s.title, steps: 3, cls: "blv-stage", qCls: "blv-q", api, tall: true });
  const canvas = bvCanvas(f.stage);

  // ── 무대: 왼쪽 그림 상자, 오른쪽 계단 ─────────────────────────────
  const solo = el("div", { class: "blv-solo" });
  const pic = el("div", { class: "blv-pic" });
  const glow = el("div", { class: "blv-glow" });
  pic.appendChild(glow);
  const imgs: Record<Route, HTMLImageElement[]> = { animal: [], plant: [] };
  const srcOf = (img: string): string => (img.startsWith("data:") ? img : bvSrc(img));
  ORDER.forEach((r) =>
    ROUTES[r].levels.forEach((lv) => {
      const im = el("img", { class: "blv-img", attrs: { src: srcOf(lv.img), alt: "", draggable: "false" } }) as HTMLImageElement;
      im.style.opacity = "0";
      imgs[r].push(im);
      pic.appendChild(im);
    }),
  );
  // 멈춘 화면: 앞 단계가 들어간 자리에 고리, 곁에 앞 단계의 작은 그림(손을 떼고 단계에 닿았을 때만. 끄는 동안은 숨긴다)
  const mark2 = el("div", { class: "blv-mark", attrs: { "aria-hidden": "true" } });
  mark2.innerHTML = `<svg viewBox="0 0 196 196"><path class="blv-mark-l"/><ellipse class="blv-mark-h"/><ellipse class="blv-mark-r"/></svg>`;
  const thumb = el("div", { class: "blv-thumb", attrs: { "aria-hidden": "true" } }, el("img", { attrs: { alt: "", draggable: "false" } }));
  pic.append(mark2, thumb);
  const markLine = mark2.querySelector(".blv-mark-l") as SVGPathElement;
  const markHalo = mark2.querySelector(".blv-mark-h") as SVGEllipseElement;
  const markRing = mark2.querySelector(".blv-mark-r") as SVGEllipseElement;
  const thumbImg = thumb.querySelector("img") as HTMLImageElement;
  /** level 단계에 멈췄으면 그 앞 단계가 들어간 자리를 보인다(level 0이나 단계 사이면 숨긴다). */
  function showMark(level: number | null): void {
    if (level === null || level < 1) {
      pic.classList.remove("marked");
      return;
    }
    const R = ROUTES[route];
    const [ax, ay] = R.anchor[level - 1];
    const [rx, ry] = R.ring[level - 1];
    const [tx, ty] = R.thumb[level - 1];
    const cx = 98 + ax;
    const cy = 98 + ay;
    [markHalo, markRing].forEach((e) => {
      e.setAttribute("cx", String(cx));
      e.setAttribute("cy", String(cy));
      e.setAttribute("rx", String(rx));
      e.setAttribute("ry", String(ry));
    });
    // 작은 그림의 가장자리(반지름 22)에서 고리의 가장자리까지 잇는 선
    const dx = cx - tx;
    const dy = cy - ty;
    const len = Math.hypot(dx, dy) || 1;
    const ang = Math.atan2(dy, dx);
    const rEdge = (rx * ry) / Math.hypot(ry * Math.cos(ang), rx * Math.sin(ang));
    const x1 = tx + (dx / len) * 23;
    const y1 = ty + (dy / len) * 23;
    const x2 = cx - Math.cos(ang) * rEdge;
    const y2 = cy - Math.sin(ang) * rEdge;
    markLine.setAttribute("d", len > 23 + rEdge + 4 ? `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}` : "");
    thumb.style.left = `${tx - 22}px`;
    thumb.style.top = `${ty - 22}px`;
    thumbImg.src = srcOf(R.levels[level - 1].img);
    pic.classList.add("marked");
  }
  const nameTag = el("div", { class: "blv-name" });
  const ladder = el("div", { class: "blv-ladder" });
  const rungs = Array.from({ length: 5 }, () => el("div", { class: "blv-rung" }, el("b"), el("span")));
  // 아래에서부터 쌓이게: 0번(세포)이 맨 아래
  [...rungs].reverse().forEach((r) => ladder.appendChild(r));
  solo.append(pic, nameTag, ladder);

  // ── 무대: 두 계단을 나란히 ───────────────────────────────────────
  const duo = el("div", { class: "blv-duo" });
  ORDER.forEach((r) => {
    const col = el("div", { class: `blv-col ${r}` }, el("div", { class: "blv-col-h", text: `${ROUTES[r].card}의 계단` }));
    [...ROUTES[r].levels].reverse().forEach((lv) => {
      const only = lv.rank === "기관계" || lv.rank === "조직계";
      col.appendChild(el("div", { class: `blv-step${only ? " only" : ""}` }, el("b", { text: lv.rank }), el("span", { text: lv.name })));
    });
    duo.appendChild(col);
  });
  canvas.el.append(solo, duo);

  // ── 상태 ─────────────────────────────────────────────────────────
  let route: Route = "animal";
  let phase: "build" | "duo" | "done" = "build";
  const top: Record<Route, number> = { animal: 0, plant: 0 }; // 지금까지 쌓은 가장 높은 단계
  const finished: Record<Route, boolean> = { animal: false, plant: false };
  let snapping = false;

  const cards = {} as Record<Route, BvCard>;
  ORDER.forEach((r) => {
    const last = ROUTES[r].levels[4];
    cards[r] = bvCard("blv-card", { name: ROUTES[r].card, sub: ROUTES[r].sub, icon: `<img src="${bvSrc(last.img)}" alt="" draggable="false" />`, key: r });
  });
  const cmpBtn = bvBtn("main blv-cmp", "동물과 식물의 단계 비교하기");
  cmpBtn.hidden = true;

  const mark = (level: number): void => {
    host.dataset.blvRoute = route;
    host.dataset.blvLevel = String(level);
    host.dataset.blvDone = ORDER.filter((r) => finished[r]).join(",");
    host.dataset.blvPhase = phase;
  };

  /** 막대 값(0~400)에 맞춰 그림 두 장을 놓는다. */
  function paint(v: number): void {
    const R = ROUTES[route];
    const L = Math.min(3, Math.floor(v / 100));
    const fr = Math.max(0, Math.min(1, (v - L * 100) / 100));
    const [ax, ay, sc] = R.anchor[L];
    const t = ramp(0, 1, fr);
    const k = Math.pow(1 / sc, 1 - t); // 다음 그림의 확대 비: 1/sc(앞 그림이 화면 가득)에서 1로
    const cx = ax * (1 - t); // 시야의 중심: 자리(ANCHOR)에서 그림 한가운데로
    const cy = ay * (1 - t);
    imgs[route].forEach((im, i) => {
      if (i === L) {
        im.style.opacity = String(1 - ramp(0.45, 0.9, fr));
        im.style.transform = `translate(${((ax - cx) * k).toFixed(2)}px, ${((ay - cy) * k).toFixed(2)}px) scale(${(k * sc).toFixed(4)})`;
      } else if (i === L + 1) {
        im.style.opacity = String(ramp(0.25, 0.8, fr));
        im.style.transform = `translate(${(-cx * k).toFixed(2)}px, ${(-cy * k).toFixed(2)}px) scale(${k.toFixed(4)})`;
      } else im.style.opacity = "0";
    });
    ORDER.filter((r) => r !== route).forEach((r) => imgs[r].forEach((im) => (im.style.opacity = "0")));
    const near = Math.round(v / 100);
    nameTag.textContent = R.levels[near].name;
    nameTag.classList.toggle("dim", Math.abs(v - near * 100) > 18);
    showMark(Math.abs(v - near * 100) < 2 ? near : null);
  }

  function drawLadder(): void {
    const R = ROUTES[route];
    rungs.forEach((r, i) => {
      const on = i <= top[route];
      r.classList.toggle("on", on);
      (r.children[0] as HTMLElement).textContent = on ? R.levels[i].rank : "";
      (r.children[1] as HTMLElement).textContent = on ? R.levels[i].name : "";
    });
  }

  /** 단계 하나에 닿았다(손을 뗀 자리). */
  function settle(level: number): void {
    const R = ROUTES[route];
    if (level > top[route]) {
      top[route] = level;
      haptic(HAPTIC.tap);
      drawLadder();
      rungs[level].classList.add("pop");
      tm.later(() => rungs[level].classList.remove("pop"), 420);
    }
    let say = R.levels[level].say;
    if (level === 4 && !finished[route]) {
      finished[route] = true;
      cards[route].done();
      f.pips(ORDER.filter((r) => finished[r]).length);
      const other = ORDER.find((r) => !finished[r]);
      if (other) say += ` 이제 아래 카드에서 <b>${ROUTES[other].card}</b>${eul(ROUTES[other].card)} 골라 끝까지 모아 보세요.`;
      else {
        // 마지막 계단을 볼 시간을 준 뒤 버튼을 띄운다
        tm.later(() => {
          cmpBtn.hidden = false;
          range.el.hidden = true;
          f.say("동물과 식물의 구성 단계를 모두 완성했어요! 이제 아래 버튼을 눌러 <b>두 구성 단계를 나란히</b> 비교해 보세요.");
        }, 1300);
      }
    }
    f.say(say);
    sayKey = `L${level}`;
    mark(level);
  }

  /** 막대를 끄는 동안의 안내 글: 그림이 어느 단계에 와 있으면 그 단계의 글, 단계 사이를 지나는 중이면 '막대를 미는 중'.
   *  (그림은 다음 단계로 넘어갔는데 글은 앞 단계를 말하는 일이 없게 한다. 경계에서 깜빡이지 않게 들어올 때와 나갈 때의 문턱을 달리 둔다.) */
  let sayKey = "L0";
  const MOVING = "막대를 움직이는 중이에요. 원하는 단계에서 손을 떼어 확인해 보세요.";
  function narrate(v: number): void {
    const near = Math.round(v / 100);
    const dist = Math.abs(v - near * 100);
    const at = sayKey === `L${near}` ? dist <= 26 : dist <= 14;
    const key = at ? `L${near}` : "moving";
    if (key === sayKey) return;
    sayKey = key;
    f.say(at ? ROUTES[route].levels[near].say : MOVING);
  }

  const range = bvRange({
    cls: "blv-range",
    min: 0,
    max: 400,
    value: 0,
    label: "막대를 밀어 다음 단계로 모으기",
    ticks: ["세포", "", "", "", "개체"],
    onInput: (v) => {
      if (phase !== "build") return;
      paint(v);
      if (!snapping) narrate(v);
      // 지나간 단계는 그 자리에서 계단에 쌓인다
      const passed = Math.floor((v + 6) / 100);
      if (passed > top[route]) {
        top[route] = passed;
        drawLadder();
      }
    },
    onChange: (v) => {
      if (phase !== "build" || snapping) return;
      const to = Math.round(v / 100) * 100;
      snapping = true;
      bvTween(
        tm,
        Math.abs(to - v) < 2 ? 40 : 200,
        (t) => {
          const x = v + (to - v) * t;
          range.set(Math.round(x));
          paint(x);
        },
        () => {
          snapping = false;
          settle(to / 100);
        },
      );
    },
  });

  function setRoute(r: Route): void {
    if (phase !== "build") return;
    route = r;
    ORDER.forEach((x) => cards[x].on(x === r));
    range.set(0);
    paint(0);
    drawLadder();
    f.say(ROUTES[r].levels[0].say);
    sayKey = "L0";
    mark(0);
  }
  ORDER.forEach((r) =>
    cards[r].el.addEventListener("click", () => {
      if (phase !== "build" || r === route) return;
      haptic(HAPTIC.tap);
      setRoute(r);
    }),
  );

  // ── 두 계단 비교하기(판정) ───────────────────────────────────────
  cmpBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    phase = "duo";
    f.stage.classList.add("duo");
    mark(4);
    f.say("왼쪽은 동물, 오른쪽은 식물의 구성 단계예요. 각 단계를 나란히 비교해 보세요.");
    f.slot.ask(
      "식물에는 없고 동물의 구성 단계에만 있는 단계는 무엇인가요?",
      [{ t: "기관계", ok: true }, { t: "조직계" }, { t: "기관" }],
      (ok) => {
        api.recordQuiz(ok);
        f.stage.classList.add("reveal"); // 답한 뒤에야 서로 다른 칸에 색을 입힌다
      },
      { why: "동물은 연관된 일을 하는 여러 기관이 모여 <b>기관계</b>를 이루지만, 식물에는 기관계가 없어요.", onNext: ask2 },
    );
  });
  function ask2(): void {
    // 첫 판정에 답하면 서로 다른 칸(기관계, 조직계)이 노랗게 칠해진다(.reveal). 수정안의 "노란색 테두리"는 무대와 달라 "노란색으로 표시된"으로 썼다
    f.say("이번에는 오른쪽 식물의 구성 단계를 살펴보세요. 노란색으로 표시된 <b>조직계</b>의 위치를 찾아볼까요?");
    f.slot.ask(
      "식물의 구성 단계에서 조직계는 어느 단계 사이에 있나요?",
      [{ t: "조직과 기관 사이", ok: true }, { t: "기관과 개체 사이" }, { t: "세포와 조직 사이" }],
      () => undefined,
      { why: "식물의 몸은 세포, 조직, <b>조직계</b>, 기관, 개체의 순서로 이루어져 있어요.", onNext: finish },
    );
  }
  function finish(): void {
    phase = "done";
    f.pips(3);
    mark(4);
    f.say("동물과 식물의 몸이 어떤 단계를 거쳐 이루어지는지 한눈에 비교해 봤어요!");
    f.slot.conclude("여러 세포로 된 생물의 몸은 공통적으로 <b>세포, 조직, 기관, 개체</b>의 단계를 거쳐 이루어져요. 여기서 동물에는 <b>기관계</b>(기관과 개체 사이)가, 식물에는 <b>조직계</b>(조직과 기관 사이)가 있어요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(bvCards(2, cards.animal, cards.plant), range.el, cmpBtn);
  setRoute("animal");
  api.setCTA("동물과 식물의 단계를 모두 끝까지 모아 보세요", { enabled: false });
  return () => {
    tm.clear();
    canvas.off();
  };
};
