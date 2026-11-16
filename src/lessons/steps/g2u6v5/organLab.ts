// [중2 Ⅵ v5] 소화기관 랩(g2u6l2) 「영양소는 어디에서 무엇이 될까요?」
//   2026-11-15 사용자 요청으로 옛 소화액 표 랩(세 영양소 × 세 곳의 소화액, 아홉 칸)을 갈아 끼웠다.
//   스텝 타입 이름(g2u6EnzymeLab)과 저작 함수(enzymeLab)는 옛 것을 그대로 쓴다. 등록표(index.ts)와 내용 파일의 import 줄은
//   다른 레슨 세션도 함께 고치는 곳이라 건드리지 않으려고 했다. 옛 아홉 칸 표의 코드는 지웠다.
//
//   책의 해 보기 「소화 과정을 소화효소의 작용과 관련지어 추론하기」와 그림 Ⅵ-4(영양소의 소화 과정), 그림 Ⅵ-3(소화계의 구조).
//   무대는 그림 Ⅵ-4의 짜임이다: 왼쪽에 앞에서 본 몸(digestBody.ts), 오른쪽에 녹말, 단백질, 지방의 세로 칸.
//   소화액은 기관의 높이에서 오른쪽으로 화살표를 뻗고, 작용하는 칸에만 소화효소의 이름표를 남긴다. 칸 맨 아래 상자는 영양소의 지금 모습이다.
//   학생이 정하는 것: 음식물이 닿은 곳마다 그 소화액이 분해할 영양소(여럿 또는 '없음'). 입(침), 위(위액), 작은창자(쓸개즙, 이자액) 네 번.
//   실패하는 길: 분해되지 않는 영양소를 고르면 그 칸에 소화효소가 오지 않고 상자에 '그대로'가 붙는다.
//               쓸개즙에 지방을 고르면 지방이 작은 방울로 나뉘기만 하고 아직 지방인 것이 보인다(쓸개즙에는 소화효소가 없다).
//               분해되는 것을 빠뜨리면 그 단추에 점선과 '화학적 분해됨'이 붙는다. 고른 것은 채점하지 않는다(처음 만나는 소화액이라 예측이다).
//   판정 둘(채점): ① 작은창자에 오기 전에 분해되기 시작한 영양소(입과 위 두 줄을 함께 읽는다)
//                ② 위에서 녹말이 그대로였던 까닭(소화효소마다 분해하는 영양소가 정해져 있다. 오답 둘은 무대가 지운다:
//                   위에서도 소화효소(펩신)가 나왔고, 녹말은 작은창자에서 다시 분해됐다).
//   과학 가드: 이자액의 아밀레이스와 트립신이 곧바로 포도당과 아미노산을 만들지 않는다. 이자액이 작용한 뒤 "작은창자에서 소화가 끝나"
//   포도당과 아미노산이 된다(책 그림의 마지막 화살표, 2026-11-12 눈검수에서 고친 문장과 같다). 큰창자에서는 소화가 거의 일어나지 않고 물이 흡수된다.
//   용어는 책을 따른다(모노글리세라이드, 쓸개즙, 이자액, 펩신은 염산의 도움). 단원평가의 "작은 지방 방울"과 맞춘다.

import { el } from "../../../core/dom";
import { icon } from "../../../core/icons";
import type { StepRenderer } from "../../types";
import { P, bvBtn, bvTween, chip, g6Lab, g6Svg, good, noteLine, row, tap, txt, type G6Chip, type G6Step } from "./kit";
import { PAPILLA, ROUTE, along, bodyFig, organTag, type Organ, type Pt } from "./digestBody";

// ── 영양소 칸 ─────────────────────────────────────────────────────
const NUT = [
  { name: "녹말", color: "#8E8EF5", line: "#5E5EC8", head: "#B4B4FF" },
  { name: "단백질", color: P.protein, line: "#B0532A", head: "#F7A97F" },
  { name: "지방", color: "#F2D15C", line: "#A88A22", head: "#F5DA70" },
];
/** 칸의 왼쪽 끝과 폭. 지방 칸은 "모노글리세라이드"(12px에 약 82px)가 들어가게 넓다. */
const LANE = [
  { x: 112, w: 62 },
  { x: 178, w: 68 },
  { x: 250, w: 92 },
];
const cx = (i: number): number => LANE[i].x + LANE[i].w / 2;
const BOX_Y = 158;

// ── 소화액이 나오는 곳 ────────────────────────────────────────────
type StopKey = "mouth" | "stomach" | "bile" | "pancreas";
interface Stop {
  key: StopKey;
  juice: string;
  color: string;
  /** 화살표의 높이(몸 그림의 기관 높이와 맞춘다). */
  y: number;
  /** 칸마다 남길 이름표(소화효소). null이면 작용하지 않는다. */
  tags: (string | null)[];
  /** 칸마다 분해되는가(쓸개즙은 지방을 작은 방울로 나누지만 분해하지 않는다). */
  cut: boolean[];
  /** 소화액이 들어오는 곳(이어 그리는 점선의 시작). 위액은 위의 벽에서 바로 나오므로 null. */
  from: Pt | null;
  focus: Organ[];
  labels: Organ[];
}
const STOPS: Stop[] = [
  { key: "mouth", juice: "침", color: "#63E6BE", y: 32, tags: ["아밀레이스", null, null], cut: [true, false, false], from: [61, 31], focus: ["mouth", "gland"], labels: ["mouth", "gland"] },
  { key: "stomach", juice: "위액", color: "#C9A0F0", y: 78, tags: [null, "펩신", null], cut: [false, true, false], from: null, focus: ["stomach"], labels: ["stomach"] },
  { key: "bile", juice: "쓸개즙", color: "#9BD15F", y: 118, tags: [null, null, "소화효소 없음"], cut: [false, false, false], from: PAPILLA, focus: ["gall", "liver"], labels: ["liver", "gall", "small"] },
  { key: "pancreas", juice: "이자액", color: "#FF9F7A", y: 140, tags: ["아밀레이스", "트립신", "라이페이스"], cut: [true, true, true], from: PAPILLA, focus: ["pancreas"], labels: ["liver", "gall", "pancreas", "small"] },
];
const PILL_X = 88; // 소화액 이름표의 가운데(몸 그림의 오른쪽 가장자리)

// ── 영양소의 모습(칸 맨 아래 상자) ──────────────────────────────────
// 녹말: 포도당(육각형)이 이어진 사슬. 단백질: 아미노산(여러 모양)이 이어진 사슬. 지방: 막대(글리세롤)에 꼬리 셋(지방산)이 붙은 빗 모양.
// 단계: 녹말 0 사슬, 1 사슬 일부와 엿당(입), 2 엿당(이자액), 3 포도당(소화 끝)
//       단백질 0 사슬, 1 작은 조각(펩신), 2 더 작은 조각(트립신), 3 아미노산(소화 끝)
//       지방 0 덩어리, 1 작은 지방 방울(쓸개즙), 2 지방산과 모노글리세라이드(라이페이스)
const hexPts = (x: number, y: number, r: number): string =>
  [0, 1, 2, 3, 4, 5].map((k) => `${(x + r * Math.cos((Math.PI / 3) * k)).toFixed(1)},${(y + r * Math.sin((Math.PI / 3) * k)).toFixed(1)}`).join(" ");
function unitShape(kind: number, x: number, y: number, fill: string, line: string): string {
  if (kind < 0) return `<polygon points="${hexPts(x, y, 3.8)}" fill="${fill}" stroke="${line}" stroke-width="1.1"/>`;
  const k = kind % 4;
  if (k === 0) return `<circle cx="${x}" cy="${y}" r="3.4" fill="${fill}" stroke="${line}" stroke-width="1.1"/>`;
  if (k === 1) return `<polygon points="${x},${y - 3.9} ${x + 3.7},${y + 3} ${x - 3.7},${y + 3}" fill="${fill}" stroke="${line}" stroke-width="1.1"/>`;
  if (k === 2) return `<rect x="${x - 3.2}" y="${y - 3.2}" width="6.4" height="6.4" rx="1" fill="${fill}" stroke="${line}" stroke-width="1.1"/>`;
  return `<polygon points="${x},${y - 4.1} ${x + 3.9},${y} ${x},${y + 4.1} ${x - 3.9},${y}" fill="${fill}" stroke="${line}" stroke-width="1.1"/>`;
}
/** 사슬 조각들. groups는 조각마다 알갱이 수, 알갱이 사이 8.4, 조각 사이 gap. 조각마다 가운데 x를 돌려준다. */
function chains(i: number, groups: number[], y: number, gap: number): { svg: string; centers: number[] } {
  const step = 8.4;
  const width = groups.reduce((a, n) => a + (n - 1) * step, 0) + gap * (groups.length - 1);
  let x = cx(i) - width / 2;
  let svg = "";
  const centers: number[] = [];
  let unit = 0;
  groups.forEach((n, g) => {
    const x0 = x;
    if (n > 1) svg += `<line x1="${x0}" y1="${y}" x2="${x0 + (n - 1) * step}" y2="${y}" stroke="${NUT[i].color}" stroke-width="2"/>`;
    for (let k = 0; k < n; k++) {
      svg += unitShape(i === 0 ? -1 : unit, x, y, NUT[i].color, NUT[i].line);
      unit += 1;
      x += step;
    }
    centers.push(x0 + ((n - 1) * step) / 2);
    x += gap - step;
    if (g < groups.length - 1) x += 0;
  });
  return { svg, centers };
}
/** 빗 모양 지방 한 분자. tails는 남은 꼬리 수(3이면 지방, 1이면 모노글리세라이드). */
function comb(x: number, y: number, tails = 3, s = 1): string {
  let out = `<rect x="${(x - 1.6 * s).toFixed(1)}" y="${(y - 5 * s).toFixed(1)}" width="${(3.2 * s).toFixed(1)}" height="${(10 * s).toFixed(1)}" rx="1" fill="#F2D15C" stroke="#A88A22" stroke-width=".9"/>`;
  const ys = tails === 3 ? [-3.4, 0, 3.4] : [0];
  ys.forEach((dy) => (out += `<path d="M${(x + 1.6 * s).toFixed(1)} ${(y + dy * s).toFixed(1)} l${(3 * s).toFixed(1)} ${(-1.2 * s).toFixed(1)} l${(3 * s).toFixed(1)} ${(1.2 * s).toFixed(1)} l${(3 * s).toFixed(1)} ${(-1.2 * s).toFixed(1)}" fill="none" stroke="#F7E08A" stroke-width="${(1.5 * s).toFixed(1)}" stroke-linecap="round"/>`));
  return out;
}
/** 떨어져 나온 지방산 하나(지그재그 꼬리). */
const acid = (x: number, y: number): string => `<path d="M${x - 6} ${y} l3 -1.4 l3 1.4 l3 -1.4 l3 1.4" fill="none" stroke="#F7E08A" stroke-width="1.7" stroke-linecap="round"/>`;

const GY = BOX_Y + 21; // 그림의 가운데 높이
const LY1 = BOX_Y + 46; // 이름 첫 줄
const LY2 = BOX_Y + 61; // 이름 둘째 줄
const lab = (x: number, y: number, s: string, color: string): string => txt(x, y, s, { size: 12, fill: color, weight: 700 });

function nutrientBox(i: number, form: number): string {
  const n = NUT[i];
  let out = "";
  if (i === 0) {
    if (form === 0) out += chains(0, [6], GY, 0).svg + lab(cx(0), LY1, "녹말", n.head);
    else if (form === 1) {
      const c = chains(0, [4, 2], GY, 11);
      out += c.svg + lab(c.centers[0], LY1, "녹말", n.head) + lab(c.centers[1], LY1, "엿당", n.head);
    } else if (form === 2) out += chains(0, [2, 2, 2], GY, 11).svg + lab(cx(0), LY1, "엿당", n.head);
    else out += chains(0, [1, 1, 1, 1, 1, 1], GY, 9.2).svg + lab(cx(0), LY1, "포도당", n.head);
  } else if (i === 1) {
    if (form === 0) out += chains(1, [6], GY, 0).svg + lab(cx(1), LY1, "단백질", n.head);
    else if (form === 1) out += chains(1, [3, 3], GY, 12).svg + lab(cx(1), LY1, "작은 조각", n.head);
    else if (form === 2) out += chains(1, [2, 2, 2], GY, 11).svg + lab(cx(1), LY1, "더 작은 조각", n.head);
    else out += chains(1, [1, 1, 1, 1, 1, 1], GY, 9.2).svg + lab(cx(1), LY1, "아미노산", n.head);
  } else {
    const x = cx(2);
    if (form === 0) {
      out += `<ellipse cx="${x}" cy="${GY}" rx="31" ry="14" fill="rgba(242,209,92,.16)" stroke="#F2D15C" stroke-width="1.4"/>`;
      [-17, -5, 7].forEach((dx) => (out += comb(x + dx - 2, GY - 5, 3, 0.85) + comb(x + dx + 2, GY + 5, 3, 0.85)));
      out += lab(x, LY1, "지방", n.head);
    } else if (form === 1) {
      [-29, 0, 29].forEach((dx) => {
        out += `<circle cx="${x + dx}" cy="${GY}" r="11" fill="rgba(242,209,92,.16)" stroke="#F2D15C" stroke-width="1.3"/>` + comb(x + dx - 6, GY - 3, 3, 0.62) + comb(x + dx + 1, GY + 3, 3, 0.62);
      });
      out += lab(x, LY1, "작은 지방 방울", n.head);
    } else {
      out += acid(x - 30, GY - 7) + acid(x - 30, GY + 1) + acid(x - 14, GY - 3) + acid(x - 14, GY + 6);
      out += comb(x + 8, GY - 2, 1, 1) + comb(x + 25, GY + 3, 1, 1);
      out += lab(x, LY1, "지방산과", n.head) + lab(x, LY2, "모노글리세라이드", n.head);
    }
  }
  return out;
}

/** 글자 폭(12px 굵은 글씨 실측: 한글 10.2px, 띄어쓰기 3.2px). size에 비례한다. */
const textW = (t: string, size = 12): number => ([...t].reduce((a, ch) => a + (ch === " " ? 3.2 : ch === "," ? 3.4 : 10.2), 0) * size) / 12;
const pillW = (t: string): number => textW(t) + 14;
/** 칸 위의 이름표(소화효소). dashed면 점선 테두리(쓸개즙의 '효소 없음'). */
function lanePill(x: number, y: number, t: string, color: string, dashed = false): string {
  const w = pillW(t);
  return `<g><rect x="${(x - w / 2).toFixed(1)}" y="${y - 9}" width="${w.toFixed(1)}" height="18" rx="9" fill="#13203A" stroke="${color}" stroke-width="1.6"${dashed ? ` stroke-dasharray="3.5 2.5"` : ""}/>${txt(x, y + 4.3, t, { size: 12, fill: dashed ? "#D6EDBC" : "#FFFFFF", weight: 800 })}</g>`;
}

export const g2u6EnzymeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 4, cls: "g2u6x-organ", wait: "음식물을 따라 소화 기관 끝까지 이동해 보세요", tall: true });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "앞에서 본 몸속 소화기관과 녹말, 단백질, 지방의 세 칸. 소화액이 나오는 높이에서 칸으로 화살표가 뻗는다");

  let at = 0; // STOPS의 차례. 4는 큰창자, 5는 정리
  let mixed = false;
  let busy = false;
  let finished = false; // 작은창자에서 소화가 끝났는가(포도당, 아미노산)
  const form = [0, 0, 0];
  const done: number[] = []; // 소화액을 섞어 본 곳
  const pick = new Set<number>(); // 0~2 영양소, 3 없음
  let arrowT = 0; // 지금 곳의 화살표 진행(0~1)
  let marks: boolean[] = [false, false, false]; // 고른 영양소인데 분해되지 않은 칸('그대로')
  let bolus: { at: Pt; r: number } | null = { at: [54, 31], r: 5 };
  let drops: { at: Pt; color: string }[] = [];
  let water = -1;
  let summary = false;
  let passing: Organ | null = null; // 지나가는 중인 기관(식도)
  let popBox = false; // 다음 한 번의 그리기에서만 상자가 새로 나타나는 움직임을 준다

  const draw = (): void => {
    const pop = popBox;
    popBox = false;
    let out = "";
    // 세 칸(책 그림처럼 세로 띠)과 칸 이름
    NUT.forEach((n, i) => {
      out += `<rect x="${LANE[i].x}" y="3" width="${LANE[i].w}" height="224" rx="12" fill="${n.color}" opacity=".075"/>`;
      out += txt(cx(i), 18, n.name, { size: 12.5, fill: n.head, weight: 800 });
    });
    // 기관 사이의 가는 구분선(입 | 위 | 작은창자 | 지금 모습)
    [56, 100, 154].forEach((y) => (out += `<line x1="110" y1="${y}" x2="344" y2="${y}" stroke="rgba(200,225,255,.09)" stroke-width="1"/>`));
    // 몸 그림
    const cur = at < 4 ? STOPS[at] : null;
    const focus: Organ[] = summary ? [] : passing ? [passing] : at === 4 ? ["large"] : cur ? cur.focus : [];
    const labels: Organ[] = summary ? ["mouth", "stomach", "small", "large"] : passing ? [passing] : at === 4 ? ["large"] : cur ? cur.labels : [];
    out += bodyFig({ focus, labels, bolus, drops, water: at === 4 ? water : undefined });
    if (at === 4 && !summary) out += organTag(84, 206, "물 흡수", "#A9D6FF");
    // 소화액 화살표와 이름표(섞어 본 곳 + 지금 섞는 곳)
    const shown = done.slice();
    if (cur && mixed && !shown.includes(at)) shown.push(at);
    shown.forEach((k) => {
      const st = STOPS[k];
      const t = k === at && !summary ? arrowT : 1;
      const last = Math.max(...st.tags.map((g, i) => (g ? i : -1)));
      const jw = textW(st.juice, 12.5) + 16;
      const x0 = PILL_X + jw / 2;
      const x1 = cx(last) - pillW(st.tags[last] ?? "") / 2 - 1;
      const xe = x0 + (x1 - x0) * t;
      // 소화액이 들어온 곳에서 소화액 이름표까지 점선(위액은 위의 벽에서 나오므로 없다)
      if (st.from) out += `<path d="M${st.from[0]} ${st.from[1]} L${(PILL_X - jw / 2).toFixed(1)} ${st.y}" stroke="${st.color}" stroke-width="1.4" stroke-dasharray="2 2.5" opacity=".9"/>`;
      out += `<line x1="${x0.toFixed(1)}" y1="${st.y}" x2="${xe.toFixed(1)}" y2="${st.y}" stroke="${st.color}" stroke-width="2.4" stroke-linecap="round"/>`;
      if (t >= 1) out += `<polygon points="${(x1 + 1).toFixed(1)},${st.y} ${(x1 - 6).toFixed(1)},${st.y - 4.5} ${(x1 - 6).toFixed(1)},${st.y + 4.5}" fill="${st.color}"/>`;
      out += `<rect x="${(PILL_X - jw / 2).toFixed(1)}" y="${st.y - 10}" width="${jw.toFixed(1)}" height="20" rx="10" fill="#13203A" stroke="${st.color}" stroke-width="1.8"/>` + txt(PILL_X, st.y + 4.5, st.juice, { size: 12.5, fill: "#FFFFFF", weight: 800 });
      st.tags.forEach((g, i) => {
        if (!g) return;
        const left = cx(i) - pillW(g) / 2;
        if (xe >= left - 2 || t >= 1) out += lanePill(cx(i), st.y, g, st.color, st.key === "bile");
      });
    });
    // 지금 모습 상자
    NUT.forEach((_, i) => {
      out += `<rect x="${LANE[i].x + 2}" y="${BOX_Y}" width="${LANE[i].w - 4}" height="68" rx="10" fill="rgba(11,21,36,.55)" stroke="${marks[i] ? P.bad : "rgba(200,225,255,.14)"}" stroke-width="${marks[i] ? 1.8 : 1}"/>`;
      out += `<g${pop ? ` class="g2u6x-pop"` : ""}>${nutrientBox(i, form[i])}</g>`;
      if (marks[i]) out += lanePill(cx(i), BOX_Y, at === 2 && i === 2 ? "아직 지방" : "그대로", P.bad);
    });
    stage.set(out);
    host.dataset.g6At = summary ? "sum" : at === 4 ? "large" : STOPS[at].key;
    host.dataset.g6Mixed = mixed ? "1" : "0";
    host.dataset.g6Form = form.join("");
  };

  // ── 조작 칸 ──
  const route = noteLine("");
  const ROUTE_NAMES = ["입", "식도", "위", "작은창자", "큰창자"];
  const routeAt = (): number => (at === 0 ? 0 : at === 1 ? 2 : at <= 3 ? 3 : 4);
  const showRoute = (moving = -1): void => {
    const here = moving >= 0 ? moving : routeAt();
    route.innerHTML = ROUTE_NAMES.map((n, i) => (i === here ? `<b>${n}</b>` : `<span class="g2u6x-dim">${n}</span>`)).join(`<span class="g2u6x-sep"> › </span>`);
  };
  const chips: G6Chip[] = ["녹말", "단백질", "지방", "없음"].map((n, i) =>
    chip(`n${i}`, n, "", () => {
      if (busy || mixed || at > 3) return;
      tap();
      if (i === 3) {
        const was = pick.has(3);
        pick.clear();
        if (!was) pick.add(3);
      } else {
        pick.delete(3);
        if (pick.has(i)) pick.delete(i);
        else pick.add(i);
      }
      chips.forEach((c, j) => c.on(pick.has(j)));
      main.disabled = pick.size === 0;
    }),
  );
  const mark = (c: G6Chip, kind: "" | "hit" | "miss" | "lack"): void => {
    c.el.classList.remove("hit", "miss", "lack");
    c.el.querySelector(".g2u6x-mk")?.remove();
    if (!kind) return;
    c.el.classList.add(kind);
    if (kind !== "lack") c.el.appendChild(el("span", { class: "g2u6x-mk", html: icon(kind === "hit" ? "check" : "xThick", 10), attrs: { "aria-hidden": "true" } }));
  };
  const resetChips = (): void => {
    pick.clear();
    chips.forEach((c) => {
      c.on(false);
      c.sub("");
      c.el.classList.remove("ro");
      mark(c, "");
    });
    // '없음'이 무엇이 없다는 뜻인지 처음부터 둘째 줄에 적는다(수정안의 대안. 첫 안 "분해되는 것 없음"은 네 칸 단추에 들어가지 않는다)
    chips[3].sub("효소 분해 없음");
  };
  chips.forEach((c) => c.el.classList.add("pk"));
  const main = bvBtn("main g2u6x-mix", "침 섞어 보기");

  // 이 랩은 섞기 전에 고른다(예측). 그래서 도착 안내는 "골라 보세요"로 맺는다(수정안의 "섞어 보세요"는 고르기 전에 단추가 잠겨 있어 맞지 않는다).
  const PROMPT: Record<StopKey, string> = {
    mouth: "<b>입</b>안에 음식물이 들어왔어요. 침을 섞으면 세 가지 영양소 중 무엇이 분해될지 골라 보세요.",
    stomach: "음식물이 식도를 지나 <b>위</b>에 도착했어요. 위액을 섞으면 어떤 영양소가 분해될까요?",
    bile: "<b>작은창자</b>로 내려왔어요! 먼저 간에서 만들어져 쓸개에 저장되었다가 분비되는 <b>쓸개즙</b>이 분해할 영양소를 골라 보세요.",
    pancreas: "이번에는 이자에서 분비된 <b>이자액</b>과 작은창자의 소화효소가 작용할 차례예요. 분해할 영양소를 모두 골라 보세요.",
  };
  // 이자액을 섞은 직후에는 아직 엿당과 더 작은 조각이다(포도당과 아미노산은 잠시 뒤 "소화가 끝나"에서). 그래서 이자액의 RIGHT는 예전 글 그대로 둔다.
  const RIGHT: Record<StopKey, string> = {
    mouth: "맞아요! 침 속의 소화효소인 <b>아밀레이스</b>가 <b>녹말</b>을 <b>엿당</b>으로 분해하기 시작했어요. 이제 위로 보내 볼까요?",
    stomach: "맞아요! 위액 속의 소화효소인 <b>펩신</b>이 염산의 도움을 받아 <b>단백질</b>을 분해했어요.",
    bile: "맞아요! <b>쓸개즙</b>에는 소화효소가 들어 있지 않아 영양소를 직접 분해하지는 못하고, <b>지방</b>을 작은 방울로 섞이게 도와줘요.",
    pancreas: "맞아요. 이자액에는 세 영양소를 분해하는 <b>소화효소</b>가 다 들어 있어요.",
  };
  // 섞은 뒤에는 단추를 다시 고를 수 없다(ro). 그래서 "없음을 골라 보세요", "남은 영양소도 눌러 보세요" 같은 다시 고르라는 말은 뺐다.
  const WRONG: Record<StopKey, string> = {
    mouth: "침을 섞었을 때 사슬이 끊어진 영양소 칸을 다시 살펴보세요. 입에서는 <b>녹말</b>만 엿당으로 분해돼요.",
    stomach: "위에서는 <b>단백질</b> 사슬만 끊어졌어요. 녹말과 지방은 위에서 분해되지 않고 그대로 지나가요.",
    bile: "쓸개즙에는 <b>소화효소가 없어요</b>. 지방이 작은 방울로 흩어졌을 뿐 다른 물질로 분해된 것은 아니에요.",
    pancreas: "이자액에는 세 가지 영양소를 분해하는 효소가 모두 들어 있어서 <b>녹말·단백질·지방</b>이 모두 분해돼요.",
  };
  const NEXT_LABEL: Record<StopKey, string> = { mouth: "식도를 거쳐 위로 보내기", stomach: "작은창자로 보내기", bile: "다음: 이자액 섞어 보기", pancreas: "큰창자로 보내기" };

  const toStop = (k: number): void => {
    at = k;
    mixed = false;
    arrowT = 0;
    marks = [false, false, false];
    drops = [];
    resetChips();
    main.textContent = `${STOPS[k].juice} 섞어 보기`;
    main.disabled = true;
    showRoute();
    f.say(PROMPT[STOPS[k].key]);
    draw();
  };

  /** 소화액 방울이 관을 따라 흘러 들어온다(침샘 → 입, 쓸개 → 샘창자, 이자 → 샘창자). */
  const DUCT: Partial<Record<StopKey, Pt[][]>> = {
    mouth: [[[42, 38], [48, 33]], [[66, 38], [60, 33]]],
    bile: [[[31, 92], [35, 99], [38, 104], PAPILLA]],
    pancreas: [[[86, 99.5], [70, 103], [54, 105], PAPILLA]],
  };

  const mix = (): void => {
    if (busy || mixed || pick.size === 0) return;
    busy = true;
    tap();
    const st = STOPS[at];
    chips.forEach((c) => c.el.classList.add("ro"));
    main.disabled = true;
    const ducts = DUCT[st.key] ?? [];
    const flowDur = ducts.length ? 650 : 1;
    bvTween(tm, flowDur, (t) => {
      drops = ducts.map((p) => ({ at: along(p, t), color: st.color }));
      draw();
    }, () => {
      drops = [];
      mixed = true;
      bvTween(tm, 700, (t) => {
        arrowT = t;
        draw();
      }, () => {
        arrowT = 1;
        // 영양소의 모습이 바뀐다
        if (st.key === "mouth") form[0] = 1;
        if (st.key === "stomach") form[1] = 1;
        if (st.key === "bile") form[2] = 1;
        if (st.key === "pancreas") {
          form[0] = 2;
          form[1] = 2;
          form[2] = 2;
        }
        // 고른 것과 비교한다(채점하지 않는다). 고른 것이 맞으면 hit, 고른 것이 틀리면 miss, 골랐어야 하는데 안 고르면 lack.
        const none = !st.cut.some(Boolean);
        chips.forEach((c) => c.on(false));
        st.cut.forEach((c, i) => {
          const p = pick.has(i);
          chips[i].sub(c ? "화학적 분해됨" : st.key === "bile" && i === 2 ? "방울만 작아짐" : "변화 없음");
          mark(chips[i], p ? (c ? "hit" : "miss") : c ? "lack" : "");
          marks[i] = p && !c;
        });
        chips[3].sub(none ? "효소 분해 없음" : "분해 일어남");
        mark(chips[3], pick.has(3) ? (none ? "hit" : "miss") : none ? "lack" : "");
        const wrong = chips.filter((c) => c.el.classList.contains("miss") || c.el.classList.contains("lack")).length;
        host.dataset.g6Miss = String(wrong);
        host.dataset.g6Fail = wrong ? "pred" : "";
        f.say(wrong ? WRONG[st.key] : RIGHT[st.key]);
        if (!wrong) good();
        else tap();
        if (!done.includes(at)) done.push(at);
        popBox = true;
        draw();
        const after = (): void => {
          busy = false;
          main.textContent = NEXT_LABEL[st.key];
          main.disabled = false;
          if (at < 2) f.pips(at + 1);
          if (finished) f.pips(3);
        };
        if (st.key !== "pancreas") return after();
        // 작은창자에서 소화가 끝난다: 엿당은 포도당, 작은 조각은 아미노산(이자액의 소화효소가 곧바로 만드는 것이 아니다)
        tm.later(() => {
          bvTween(tm, 1100, (t) => {
            bolus = { at: along(ROUTE.coil, t * 0.82), r: 5 };
            draw();
          }, () => {
            finished = true;
            form[0] = 3;
            form[1] = 3;
            marks = [false, false, false];
            popBox = true;
            draw();
            f.say("소화가 끝나 녹말은 <b>포도당</b>, 단백질은 <b>아미노산</b>, 지방은 <b>지방산과 모노글리세라이드</b>가 됐어요.");
            after();
          });
        }, 1500);
      });
    });
  };

  const travel = (path: Pt[], from: number, to: number, dur: number, done2: () => void): void => {
    busy = true;
    main.disabled = true;
    chips.forEach((c) => c.el.classList.add("ro"));
    bvTween(tm, dur, (t) => {
      bolus = { at: along(path, from + (to - from) * t), r: 5 };
      draw();
    }, () => {
      busy = false;
      done2();
    });
  };

  const next = (): void => {
    if (busy) return;
    tap();
    const key = STOPS[Math.min(at, 3)].key;
    marks = [false, false, false];
    if (at === 0) {
      showRoute(1);
      f.say("식도는 음식물이 <b>지나가는 길</b>이에요. 소화액이 나오지 않아요.");
      passing = "eso";
      travel(ROUTE.toStomach, 0, 1, 1400, () => {
        passing = null;
        toStop(1);
      });
    } else if (at === 1) {
      showRoute(3);
      f.say("위에서 섞인 음식물이 <b>작은창자</b>로 내려가요.");
      travel(ROUTE.toDuo, 0, 1, 1000, () => toStop(2));
    } else if (key === "bile") toStop(3);
    else if (at === 3 && finished) {
      at = 4;
      mixed = false;
      showRoute(4);
      resetChips();
      chips.forEach((c) => c.el.classList.add("ro"));
      f.say("분해된 영양소는 작은창자에서 흡수되고, 남은 찌꺼기가 <b>큰창자</b>로 가요.");
      const rest: Pt[] = [...ROUTE.coil.slice(-3), ...ROUTE.toRectum];
      busy = true;
      main.disabled = true;
      bvTween(tm, 1700, (t) => {
        bolus = { at: along(rest, t * 0.86), r: 3.6 };
        water = t;
        draw();
      }, () => {
        busy = false;
        water = 1;
        draw();
        f.say("마지막으로 <b>큰창자</b>에 도착했어요! 큰창자에서는 소화액이 분비되지 않고 주로 남아 있는 <b>물</b>이 흡수돼요. 이제 소화 결과를 정리해 볼까요?");
        main.textContent = "소화 결과 정리하기";
        main.disabled = false;
      });
    } else if (at === 4) {
      summary = true;
      bolus = null;
      water = -1;
      at = 5 as number;
      draw();
      f.say("지나온 곳마다 남은 <b>소화효소 이름표</b>를 보고 답해요.");
      ask();
    }
  };

  main.addEventListener("click", () => {
    if (busy) return;
    if (at <= 3 && !mixed) mix();
    else next();
  });

  // 판정. 무대에는 네 곳의 소화효소 이름표와 지금 모습(마지막 산물)이 남아 있다.
  const ask = (): void => {
    lab.judge(
      "음식물이 작은창자에 도달하기 <b>전에</b>(입과 위에서) 먼저 분해되기 시작한 영양소는 무엇인가요?",
      [{ t: "녹말과 단백질", ok: true }, { t: "녹말뿐" }, { t: "녹말, 단백질, 지방 모두" }],
      "녹말은 <b>입</b>에서, 단백질은 <b>위</b>에서 먼저 분해가 시작되었고, 지방은 <b>작은창자</b>에 와서야 처음으로 분해되었어요.",
      () => {
        f.say("이번에는 <b>위</b>의 줄을 봐요.");
        // 이유 글은 예전 한 줄 그대로 둔다: 첫 보기가 길어 정답 카드가 두 줄이 되어, 수정안의 세 줄 이유를 더하면 조작 칸(208px)을 넘는다
        lab.judge(
          "<b>위</b>에서 단백질만 분해되고 녹말은 그대로였던 까닭은 무엇인가요?",
          [{ t: "소화효소마다 분해하는 영양소의 종류가 정해져 있어서", ok: true }, { t: "위에서는 소화액이 전혀 분비되지 않아서" }, { t: "녹말이 이미 입에서 남김없이 분해되어서" }],
          "소화효소마다 분해하는 영양소가 <b>정해져</b> 있어요.",
          () =>
            lab.finish("소화효소의 작용으로 <b>녹말</b>은 입과 작은창자에서 <b>포도당</b>으로, <b>단백질</b>은 위와 작은창자에서 <b>아미노산</b>으로, <b>지방</b>은 쓸개즙의 도움을 받아 작은창자에서 <b>지방산과 모노글리세라이드</b>로 최종 분해돼요."),
        );
      },
    );
  };

  f.slot.setControls(row(...chips.map((c) => c.el)), main, route);
  toStop(0);
  return lab.cleanup;
};
