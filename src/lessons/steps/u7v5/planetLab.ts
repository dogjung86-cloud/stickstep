// u7PlanetLab: 행성을 두 무리로 나누기(u7l2). 태양계 행성 분류 탐구를 손으로 한다.
//   탐구: 여덟 행성의 반지름, 질량, 위성 수 그래프를 견주어 두 집단으로 나누고 집단마다 공통점을 정리한다.
//   랩   : 세 그래프를 바꿔 가며 보고, 가르는 선을 직접 옮겨 두 무리로 나눈다. 엉뚱한 자리에서 가르면 왜 안 되는지 그래프가 보여 준다.
// 정본에는 이 레슨에 손으로 하는 랩이 없었다(표 읽기뿐). 이 랩 뒤에 정본의 표가 그대로 이어져 표면과 고리를 보탠다.
// 값은 지구를 1로 한 자연값이다(반지름, 질량). 위성 수는 2023년에 알려진 수다(해마다 새로 발견되어 늘어난다).
// 행성 그림은 실사 사진이다(public/photos). 무대는 SVG 하나로 그린다.
// 질량 그래프는 값의 차이가 아주 커서 눈금을 끊어 그린다(2026-11-15 그래픽 손질): 0~1, 10~20, 50~350의 세 토막과 그 사이의 물결선.
//   고른 눈금이면 천왕성(15)과 해왕성(17) 막대가 지구(1)만큼 낮아 보여 '크게 뛰는 자리'가 토성과 천왕성 사이에도 생겼다.
// 판정과 결론 때는 무대가 세 그래프를 작게 나란히 보인다(질문이 "세 그래프에서 본 것"이라서).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvRange, bvTimers } from "../bio6/b6Lab";
import { u7Frame } from "./kit";

interface PlanetStep {
  title: string;
  cta?: string;
}

const PLANETS: { name: string; img: string }[] = [
  { name: "수성", img: "mercury.jpg" },
  { name: "금성", img: "venus.jpg" },
  { name: "지구", img: "earth_apollo17.jpg" },
  { name: "화성", img: "mars.jpg" },
  { name: "목성", img: "jupiter.jpg" },
  { name: "토성", img: "saturn_cassini.jpg" },
  { name: "천왕성", img: "uranus.jpg" },
  { name: "해왕성", img: "neptune.jpg" },
];
type MetricKey = "radius" | "mass" | "moons";
const METRICS: Record<MetricKey, { name: string; unit: string; cap: string; v: number[]; show: string[] }> = {
  radius: { name: "반지름", unit: "지구 = 1", cap: "적도 반지름 (지구 = 1)", v: [0.38, 0.95, 1, 0.53, 11.2, 9.4, 4.0, 3.9], show: ["0.4", "0.9", "1", "0.5", "11.2", "9.4", "4.0", "3.9"] },
  mass: { name: "질량", unit: "지구 = 1", cap: "상대적 질량 (지구 = 1, 물결선은 눈금 생략)", v: [0.06, 0.82, 1, 0.11, 318, 95, 15, 17], show: ["0.06", "0.8", "1", "0.1", "318", "95", "15", "17"] },
  // 값은 2023년까지 알려진 위성 수다(해마다 늘어난다). 그래서 알약에 "지금까지"가 아니라 2023년을 적는다.
  moons: { name: "위성 수", unit: "발견된 수", cap: "위성 수 (2023년까지 발견된 개수)", v: [0, 0, 1, 2, 95, 146, 27, 14], show: ["0", "0", "1", "2", "95", "146", "27", "14"] },
};
const ORDER: MetricKey[] = ["radius", "mass", "moons"];
const RIGHT = 4; // 화성과 목성 사이

const X0 = 13;
const COL = 40;
const BASE = 170;
const TOP = 58;

// 질량의 끊은 눈금: [값 구간, 그 구간이 차지하는 높이 비율 구간]. 구간 사이(1~10, 20~50)는 물결선 자리다.
const MASS_SEG: [number, number, number, number][] = [
  [0, 1, 0, 0.2],
  [10, 20, 0.31, 0.545],
  [50, 350, 0.655, 1],
];
/** 막대 높이(px). ph = 그래프 높이. 질량만 끊은 눈금, 나머지는 고른 눈금. */
function barH(k: MetricKey, v: number, ph: number): number {
  const m = METRICS[k];
  if (k !== "mass") return Math.max(2, (v / Math.max(...m.v)) * ph);
  for (let i = 0; i < MASS_SEG.length; i++) {
    const [a, b, f0, f1] = MASS_SEG[i];
    if (v <= b) {
      if (v >= a) return Math.max(2, (f0 + ((v - a) / (b - a)) * (f1 - f0)) * ph);
      const [, pb, , pf1] = MASS_SEG[i - 1]; // 물결선 자리(이 값들에는 없다)
      return (pf1 + ((v - pb) / (a - pb)) * (f0 - pf1)) * ph;
    }
  }
  return ph;
}
/** 물결선 띠 둘(아래 높이, 위 높이), 그래프 높이 비율. 토막 끝과 띠 사이에 물결 높이(1.7px)보다 넉넉한 틈을 둔다(지구 막대 끝이 물결에 먹히지 않게). */
const MASS_BREAKS: [number, number][] = [
  [0.235, 0.29],
  [0.58, 0.635],
];
/** 물결 한 줄(x0→x1, 높이 y 둘레로 출렁인다). */
function wavePts(x0: number, x1: number, y: number, rev = false): string {
  const pts: string[] = [];
  for (let x = x0; x <= x1 + 0.01; x += 1) pts.push(`${x.toFixed(1)} ${(y + Math.sin(((x - x0) / 7) * Math.PI * 2) * 1.7).toFixed(2)}`);
  if (rev) pts.reverse();
  return pts.join(" L");
}
/** 막대를 끊는 물결 띠(가림막 구멍) + 그 띠를 지나는 막대 위의 물결 두 줄. bars = 막대마다 [가운데 x, 높이 px]. */
function massBreaks(x0: number, x1: number, base: number, ph: number, bars: [number, number][], halfW: number, id: string): { mask: string; lines: string } {
  let holes = "";
  let lines = "";
  for (const [lo, hi] of MASS_BREAKS) {
    const yb = base - lo * ph;
    const yt = base - hi * ph;
    holes += `<path d="M${wavePts(x0, x1, yb)} L${wavePts(x0, x1, yt, true)} Z" fill="#000"/>`;
    for (const [cx, h] of bars) {
      if (h <= hi * ph + 2) continue; // 이 띠까지 닿지 않는 막대
      lines += `<path d="M${wavePts(cx - halfW, cx + halfW, yb)}" stroke="#DCE6F8" stroke-width="1.3" stroke-linecap="round" opacity=".9"/>`;
      lines += `<path d="M${wavePts(cx - halfW, cx + halfW, yt)}" stroke="#DCE6F8" stroke-width="1.3" stroke-linecap="round" opacity=".9"/>`;
    }
  }
  const mask = `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="346" height="230"><rect width="346" height="230" fill="#fff"/>${holes}</mask>`;
  return { mask, lines };
}
const SHORT = ["수", "금", "지", "화", "목", "토", "천", "해"];

export const u7PlanetLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PlanetStep;
  const tm = bvTimers();
  const f = u7Frame(host, { title: s.title, steps: 4, cls: "u7x-planet", api });
  const doneCta = s.cta ?? "용어로 정리하기";
  const photo = (file: string): string => `${import.meta.env.BASE_URL}photos/${file}`;

  let metric: MetricKey = "radius";
  const viewed = new Set<MetricKey>(["radius"]);
  let cut = 2; // 가르는 자리(1~7): cut번째 행성 앞
  let phase: "view" | "split" | "ask" | "done" = "view";
  let split = false; // 바르게 갈랐다
  host.dataset.u7Phase = phase;

  let board = false; // 판정과 결론: 세 그래프를 나란히

  function draw(): void {
    if (board) return drawBoard();
    const m = METRICS[metric];
    const ph = BASE - TOP;
    const showCut = phase !== "view";
    let g = "";
    if (split) {
      g += `<rect x="${X0 - 5}" y="${TOP - 22}" width="${COL * RIGHT + 3}" height="${230 - TOP + 16}" rx="12" fill="rgba(110,170,255,.13)"/>`;
      g += `<rect x="${X0 + COL * RIGHT + 2}" y="${TOP - 22}" width="${COL * (8 - RIGHT) + 3}" height="${230 - TOP + 16}" rx="12" fill="rgba(255,190,90,.14)"/>`;
    }
    g += `<path d="M${X0 - 3} ${BASE + 0.5}H${X0 + COL * 8 + 3}" stroke="#4A5F86" stroke-width="1.2"/>`;
    // 질량은 끊은 눈금: 물결 띠를 지나는 막대에 물결선 두 줄
    const brk = metric === "mass" ? massBreaks(X0 - 3, X0 + COL * 8 + 3, BASE, ph, PLANETS.map((_, i) => [X0 + COL * i + COL / 2, barH(metric, m.v[i], ph)]), 15, "u7pbrk") : null;
    let bars = "";
    PLANETS.forEach((p, i) => {
      const cx = X0 + COL * i + COL / 2;
      const h = barH(metric, m.v[i], ph);
      const warm = split && i >= RIGHT;
      bars += `<rect class="u7x-bar" x="${cx - 12}" y="${(BASE - h).toFixed(1)}" width="24" height="${h.toFixed(1)}" rx="5" fill="${warm ? "#FFC062" : "#7FB2FF"}"/>`;
      g += `<text x="${cx}" y="${(BASE - h - 6).toFixed(1)}" class="u7x-val">${m.show[i]}</text>`;
      g += `<clipPath id="u7pc${i}"><circle cx="${cx}" cy="${BASE + 19}" r="12.5"/></clipPath>`;
      g += `<image href="${photo(p.img)}" x="${cx - 12.5}" y="${BASE + 6.5}" width="25" height="25" preserveAspectRatio="xMidYMid slice" clip-path="url(#u7pc${i})"/>`;
      g += `<circle cx="${cx}" cy="${BASE + 19}" r="12.5" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1"/>`;
      g += `<text x="${cx}" y="${BASE + 49}" class="u7x-pname">${p.name}</text>`;
    });
    g += brk ? `${brk.mask}<g mask="url(#u7pbrk)">${bars}</g>${brk.lines}` : bars;
    if (showCut) {
      const x = X0 + COL * cut;
      g += `<path d="M${x} ${TOP - 20}V${BASE + 54}" stroke="${split ? "#FFFFFF" : "#FFE08A"}" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round"/>`;
      if (!split) g += `<path d="M${x - 7} ${TOP - 26}h14l-7 9z" fill="#FFE08A"/>`;
    }
    f.stage.innerHTML = `<svg viewBox="0 0 346 230" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="여덟 행성의 ${m.name} 막대그래프">${g}</svg><div class="bv-pill u7x-pill">${m.cap}</div>`;
    host.dataset.u7Metric = metric;
    host.dataset.u7Cut = String(cut);
  }

  /** 판정과 결론의 무대: 세 그래프를 같은 가르는 선, 같은 두 무리 바탕으로 작게 나란히. */
  function drawBoard(): void {
    const PX = [6, 120, 234];
    const PW = 106;
    const B = 178; // 막대 바닥
    const T = 58; // 막대가 닿는 가장 높은 곳
    const ph = B - T;
    const slot = PW / 8;
    const txt = (x: number, y: number, s: string, size: number, weight: number, fill: string): string =>
      `<text x="${x.toFixed(1)}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle" font-family="Pretendard, sans-serif">${s}</text>`;
    let g = "";
    ORDER.forEach((k, j) => {
      const m = METRICS[k];
      const x0 = PX[j];
      g += `<rect x="${x0}" y="8" width="${PW}" height="214" rx="12" fill="rgba(255,255,255,.035)" stroke="rgba(255,255,255,.09)"/>`;
      g += `<rect x="${x0 + 3}" y="${T - 8}" width="${slot * RIGHT - 4}" height="${B - T + 12}" rx="7" fill="rgba(110,170,255,.14)"/>`;
      g += `<rect x="${x0 + slot * RIGHT + 1}" y="${T - 8}" width="${slot * (8 - RIGHT) - 4}" height="${B - T + 12}" rx="7" fill="rgba(255,190,90,.15)"/>`;
      g += txt(x0 + PW / 2, 33, m.name, 13.5, 800, "#FFE9B8");
      let bars = "";
      const marks: [number, number][] = [];
      m.v.forEach((v, i) => {
        const cx = x0 + slot * i + slot / 2;
        const h = barH(k, v, ph);
        marks.push([cx, h]);
        bars += `<rect x="${(cx - 4.5).toFixed(1)}" y="${(B - h).toFixed(1)}" width="9" height="${h.toFixed(1)}" rx="2.5" fill="${i >= RIGHT ? "#FFC062" : "#7FB2FF"}"/>`;
        g += txt(cx, B + 17, SHORT[i], 12, 700, "#C6D3EA");
      });
      if (k === "mass") {
        const brk = massBreaks(x0 + 2, x0 + PW - 2, B, ph, marks, 6.5, "u7pbrk3");
        g += `${brk.mask}<g mask="url(#u7pbrk3)">${bars}</g>${brk.lines}`;
      } else g += bars;
      g += `<path d="M${x0 + 3} ${B + 0.5}H${x0 + PW - 3}" stroke="#4A5F86" stroke-width="1.2"/>`;
      g += `<path d="M${(x0 + slot * RIGHT).toFixed(1)} ${T - 12}V${B + 5}" stroke="#FFFFFF" stroke-width="1.6" stroke-dasharray="4 4" stroke-linecap="round"/>`;
      if (phase === "done") {
        g += txt(x0 + (slot * RIGHT) / 2, 212, "지구형", 12, 800, "#9CC2F2");
        g += txt(x0 + slot * RIGHT + (slot * (8 - RIGHT)) / 2, 212, "목성형", 12, 800, "#FFD79E");
      }
    });
    f.stage.innerHTML = `<svg viewBox="0 0 346 230" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="반지름, 질량, 위성 수 그래프 셋을 나란히 놓은 그림. 세 그래프 모두 같은 자리에서 두 무리로 갈렸다">${g}</svg>`;
  }

  const cards = ORDER.map((k) => bvCard("u7x-mcard", { name: METRICS[k].name, sub: METRICS[k].unit, key: k }));
  const cardRow = bvCards(3, ...cards);
  const range = bvRange({
    cls: "u7x-range",
    min: 1,
    max: 7,
    value: cut,
    label: "경계선 위치를 옮겨 보세요",
    onInput: (v) => {
      cut = v;
      draw();
    },
  });
  const cutBtn = bvBtn("main", "이 위치에서 두 무리로 나누기");

  function paintCards(): void {
    cards.forEach((c, i) => {
      c.on(ORDER[i] === metric);
      if (viewed.has(ORDER[i]) && !c.isDone()) c.done();
    });
  }

  cards.forEach((c, i) =>
    c.el.addEventListener("click", () => {
      if (phase === "ask" || phase === "done") return;
      metric = ORDER[i];
      haptic(HAPTIC.select);
      const first = !viewed.has(metric);
      viewed.add(metric);
      paintCards();
      draw();
      host.dataset.u7Seen = String(viewed.size);
      if (phase === "view") {
        if (viewed.size === ORDER.length) toSplit();
        else if (first) f.say(`여덟 행성의 <b>${METRICS[metric].name}</b> 그래프예요. 막대 높이가 크게 달라지는 곳을 살펴보고 남은 카드도 눌러 보세요.`);
      }
    }),
  );

  function toSplit(): void {
    phase = "split";
    host.dataset.u7Phase = phase;
    f.pips(2);
    // "아래": 이 랩에서 '막대'는 그래프의 막대이기도 해서, 조작 칸의 막대(가르는 선을 옮기는 막대)를 가리킨다고 밝힌다
    f.say("세 그래프 모두 비슷한 곳에서 값의 차이가 커져요. 아래 막대를 밀어 <b>두 무리로 나눌 경계선</b>을 맞춰 보세요.");
    f.slot.setControls(cardRow, range.el, cutBtn);
    api.setCTA("경계선을 맞춰 두 무리로 나눠 보세요", { enabled: false });
    draw();
  }

  cutBtn.addEventListener("click", () => {
    if (phase !== "split") return;
    if (cut !== RIGHT) {
      haptic(HAPTIC.wrong);
      f.stage.classList.remove("u7x-shake");
      void f.stage.offsetWidth;
      f.stage.classList.add("u7x-shake");
      // 선의 양옆 두 행성(조사까지 적어 둔다)
      const pair = ["", "수성과 금성은", "금성과 지구는", "지구와 화성은", "", "목성과 토성은", "토성과 천왕성은", "천왕성과 해왕성은"][cut];
      // "값의 차이가 작아"는 토성과 천왕성(위성 수 146과 27) 같은 짝에서 그래프와 어긋나 "둘 다 값이 작아(커서)"로 쓴다
      f.say(`${pair} 둘 다 값이 ${cut < RIGHT ? "작아" : "커서"} 같은 무리로 묶는 것이 자연스러워요. 막대 높이가 <b>크게 달라지는 경계</b>를 찾아보세요.`);
      return;
    }
    haptic(HAPTIC.correct);
    split = true;
    phase = "ask";
    host.dataset.u7Phase = "wait";
    cutBtn.disabled = true;
    range.input.disabled = true;
    draw();
    f.say("맞아요! 화성과 목성 사이에서 막대 높이가 크게 달라져, 왼쪽 네 행성과 오른쪽 네 행성으로 뚜렷하게 나뉘어요.");
    tm.later(ask, 1500);
  });

  function ask(): void {
    host.dataset.u7Phase = "ask";
    board = true; // 무대를 세 그래프 비교판으로(근거가 한 화면에)
    draw();
    f.pips(3);
    f.say("화면의 세 그래프를 한눈에 비교하며 질문에 답해 보세요.");
    f.slot.ask(
      "오른쪽 무리 네 행성(목성, 토성, 천왕성, 해왕성)의 <b>공통적인 특징</b>은 무엇일까요?",
      [{ t: "반지름과 질량이 크고 위성이 많아요", ok: true }, { t: "반지름과 질량이 작고 위성이 적어요" }, { t: "크기는 크지만 위성이 거의 없어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "반지름, 질량, 위성 수 그래프 모두 오른쪽 네 행성의 값이 훨씬 커요.", onNext: conclude },
    );
  }

  function conclude(): void {
    phase = "done";
    host.dataset.u7Phase = phase;
    draw(); // 비교판에 두 무리의 이름
    f.pips(4);
    f.say("그래프에서 나눈 두 무리를 각각 <b>지구형 행성</b>과 <b>목성형 행성</b>이라고 불러요!");
    f.slot.conclude("반지름과 질량이 작고 위성이 적은 수성·금성·지구·화성은 <b>지구형 행성</b>, 반지름과 질량이 크고 위성이 많은 목성·토성·천왕성·해왕성은 <b>목성형 행성</b>으로 분류해요.");
    api.enableCTA(doneCta);
  }

  f.slot.setControls(el("div", { class: "u7x-cap", text: "세 가지 기준 카드를 차례로 눌러 비교해 보세요" }), cardRow);
  f.say("여덟 행성의 <b>반지름</b> 그래프예요. 어느 행성부터 막대가 훌쩍 높아지나요? 다른 카드도 눌러 보세요.");
  f.pips(1);
  api.setCTA("세 가지 그래프를 모두 확인해 보세요", { enabled: false });
  paintCards();
  draw();

  return () => tm.clear();
};
