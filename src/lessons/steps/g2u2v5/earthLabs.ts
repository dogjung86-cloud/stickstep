// [중2 Ⅱ v5] g2u2l1 랩 2, 3: 지구 속을 조사하는 방법과 층상 구조 모형.
//
// 랩 2 「지구 속을 끝까지 알려 준 방법은?」(g2u2ProbeLab)
//   책의 그림(지구 내부를 조사하는 방법: 시추, 화산 분출물 조사, 지진파 연구)을 손으로 견준다.
//   학생이 정하는 것: 세 방법 가운데 무엇을 어떤 차례로 써 볼지. 먼저 예측한다(정오를 매기지 않는다).
//   실패가 보이는 길: 시추와 화산 분출물은 알아낸 깊이 막대가 거의 차지 않고 지구 속은 물음표로 남는다.
//   판정 하나: 지구 속이 여러 층이라는 것을 알려 준 방법. 통찰 하나: 지진파 연구로 층상 구조를 알아냈다.
//
// 랩 3 「지구 속 모형을 비율에 맞게 만들어 볼까요?」(g2u2LayerLab)
//   책의 탐구(지권의 층상 구조와 특징을 조사하고 모형으로 표현한다)를 한다. 조사 자료(깊이와 상태)는 무대에 늘 보인다.
//   학생이 정하는 것: 맨틀과 외핵의 경계, 외핵과 내핵의 경계의 깊이(막대 두 개). 처음 값은 층을 똑같이 나눈 모형이다.
//   실패가 보이는 길: 자료와 맞지 않는 경계는 빨갛게 깜박이고 어느 쪽으로 어긋났는지 나온다.
//   판정 둘: 액체 상태인 층, 부피가 가장 큰 층. 통찰 하나: 지권은 네 층이고 맨틀이 가장 크며 지각은 선처럼 얇다.

import type { StepRenderer } from "../../types";
import { bvRange } from "../bio6/b6Lab";
import { G, gBtn, gGrid, gLab, gPick, gPredict, haptic, HAPTIC, label, svgOpen, type GStep } from "./kit";

// 쐐기꼴 단면: 꼭짓점이 지구 중심, 호가 지표. 6400 km = R px.
const CX = 100, CY = 218, R = 190, HALF = (26 * Math.PI) / 180;
const KM = R / 6400;
const edge = (r: number, side: 1 | -1): [number, number] => [CX + side * r * Math.sin(HALF), CY - r * Math.cos(HALF)];
const wedge = (r: number): string => {
  const [lx, ly] = edge(r, -1), [rx, ry] = edge(r, 1);
  return `M${CX} ${CY} L${lx.toFixed(1)} ${ly.toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${rx.toFixed(1)} ${ry.toFixed(1)} Z`;
};
const rOf = (depthKm: number): number => (6400 - depthKm) * KM;
const COL = { crust: "#9C7B58", mantle: "#E8743B", outer: "#FFB454", inner: "#FFE08A" } as const;

/* ══════════ 랩 2: 조사 방법 ══════════ */
const WAYS = [
  { k: "drill", name: "시추", sub: "땅을 직접 뚫기", reach: 2, read: "약 12 km" },
  { k: "volc", name: "화산 분출물", sub: "나온 물질 조사", reach: 5, read: "지표 부근" },
  { k: "wave", name: "지진파", sub: "지구 속을 지난 진동", reach: 100, read: "중심까지" },
] as const;

export const g2u2ProbeLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-probe" });
  const { f, tm } = lab;
  const rows = WAYS.map((w, i) => {
    const y = 66 + i * 52;
    return `${label(200, y, w.name, { anchor: "start", size: 13 })}
      <rect x="200" y="${y + 8}" width="100" height="9" rx="4.5" fill="rgba(255,255,255,.12)"/>
      <rect class="g2u2x-pb-bar b-${w.k}" x="200" y="${y + 8}" width="0" height="9" rx="4.5" fill="${G.gold}"/>
      ${label(200, y + 32, "아직 안 해 봄", { anchor: "start", size: 12, fill: G.dim, weight: 600, cls: `g2u2x-pb-read r-${w.k}` })}`;
  }).join("");
  const ray = (a: number, bend: number): string => {
    // 지표의 한 점에서 지구 속을 지나 반대쪽 지표로 가는 길(층의 경계에서 꺾인다)
    const p0 = [CX - R * Math.sin(a), CY - R * Math.cos(a)];
    const p2 = [CX + R * Math.sin(a), CY - R * Math.cos(a)];
    return `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} Q${CX} ${(CY - bend).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  };
  f.stage.innerHTML = `${svgOpen}
    <path d="${wedge(R)}" fill="#1B2A44" stroke="${G.line}" stroke-width="1.6"/>
    <g class="g2u2x-pb-layers">
      <path d="${wedge(R)}" fill="${COL.crust}"/><path d="${wedge(R - 3)}" fill="${COL.mantle}"/>
      <path d="${wedge(rOf(2900))}" fill="${COL.outer}"/><path d="${wedge(rOf(5100))}" fill="${COL.inner}"/>
      ${label(CX, CY - R + 50, "맨틀", { fill: "#3A1A08" })}${label(CX, CY - rOf(2900) + 40, "외핵", { fill: "#4A2A00" })}${label(CX + 30, CY - 12, "내핵", { fill: "#FFE08A", size: 12, anchor: "start" })}
    </g>
    ${label(CX, 118, "?", { size: 44, fill: "#55688A", cls: "g2u2x-pb-q" })}
    <path class="g2u2x-pb-drill" pathLength="100" d="M${CX - 30} ${CY - R + 1} v5" stroke="#FF6B6B" stroke-width="3" stroke-linecap="round"/>
    <g class="g2u2x-pb-rig"><path d="M${CX - 38} ${CY - R - 1} l8 -18 l8 18 Z" stroke="#DCE7F5" stroke-width="1.6" fill="rgba(255,255,255,.12)"/></g>
    <g class="g2u2x-pb-volc"><path d="M${CX + 16} ${CY - R + 2} l12 -15 l5 0 l12 15 Z" fill="#6B5446" stroke="#3E2F27" stroke-width="1.2"/>
      <path d="M${CX + 28} ${CY - R - 14} q-6 -8 0 -14 M${CX + 33} ${CY - R - 14} q7 -9 2 -16" stroke="${G.hot}" stroke-width="2.2" stroke-linecap="round"/>
      <path class="g2u2x-pb-vglow" d="M${CX + 30} ${CY - R + 3} v9" stroke="${G.hot}" stroke-width="5" stroke-linecap="round"/></g>
    <g class="g2u2x-pb-rays" stroke="#8CE0FF" stroke-width="2.2" stroke-linecap="round" fill="none">
      <path pathLength="100" d="${ray(HALF * 0.9, 150)}"/><path pathLength="100" d="${ray(HALF * 0.9, 96)}"/><path pathLength="100" d="${ray(HALF * 0.9, 20)}"/>
    </g>
    ${label(CX, 16, "지표", { size: 12, fill: G.dim, weight: 600 })}
    ${label(200, 34, "알아낸 깊이", { anchor: "start", size: 12.5, fill: G.dim })}
    ${rows}
  </svg>`;

  let pred = "";
  const tried = new Set<string>();
  let busy = false;
  const picks = WAYS.map((w) => {
    const p = gPick(w.k, w.name, w.sub);
    p.el.addEventListener("click", () => run(w.k, p));
    return p;
  });
  const nextHint = (): void => {
    const w = WAYS.find((x) => !tried.has(x.k));
    if (w) lab.hint(w.k);
  };

  function run(k: (typeof WAYS)[number]["k"], p: (typeof picks)[number]): void {
    if (busy || lab.finished()) return;
    busy = true;
    haptic(HAPTIC.tap);
    picks.forEach((x) => x.on(x === p));
    const w = WAYS.find((x) => x.k === k)!;
    f.stage.dataset.way = k;
    f.stage.classList.remove("play");
    void f.stage.offsetWidth;
    f.stage.classList.add("play");
    if (k === "drill") f.say("땅에 구멍을 뚫어 내려가요. 사람이 가장 깊이 뚫은 구멍도 <b>약 12 km</b>에서 멈췄어요.");
    if (k === "volc") f.say("화산이 폭발할 때 땅속 물질이 올라와요. 하지만 그 물질은 <b>지표 부근</b>에서 온 것이에요.");
    if (k === "wave") f.say("지진이 날 때 생기는 진동인 <b>지진파</b>는 지구 속을 지나 반대쪽까지 전해져요.");
    tm.later(() => {
      lab.q<SVGRectElement>(`.b-${k}`).setAttribute("width", String(w.reach));
      const read = lab.q<SVGTextElement>(`.r-${k}`);
      read.textContent = w.read;
      read.setAttribute("fill", k === "wave" ? G.ok : G.bad);
      if (k === "wave") {
        f.stage.classList.add("known");
        haptic(HAPTIC.correct);
      }
      tried.add(k);
      p.done();
      busy = false;
      f.pips(tried.size >= 2 ? 1 : 0);
      if (tried.size < WAYS.length) {
        nextHint();
        if (k !== "wave") f.say(`${k === "drill" ? "중심까지는 6400 km인데 500분의 1쯤만 내려갔어요." : "지구 속 깊은 곳은 여전히 물음표예요."} <b>다른 방법</b>도 써 보세요.`);
        else f.say("지진파가 지나간 길이 깊이에 따라 달라져서 <b>층의 경계</b>가 드러났어요. 남은 방법도 써 보세요.");
        return;
      }
      f.pips(2);
      const head = pred.startsWith("지진파") ? "예측대로" : "예측과 달리";
      f.say(`${head} 중심까지 알려 준 방법은 하나뿐이었어요. 세 막대를 견줘 보세요.`);
      tm.later(judge, 1000);
    }, k === "wave" ? 1700 : 1300);
  }

  function judge(): void {
    lab.ask(
      "지구 속이 <b>여러 층</b>이라는 것을 알려 준 방법은?",
      ["지진파 연구", "시추", "화산 분출물 조사"],
      "지진파는 <b>지구 속을 통과</b>해요. 다른 두 방법은 지표 부근만 알려 줘요.",
      () => lab.finish("직접 뚫거나 화산 분출물을 조사해서는 지표 부근만 알 수 있어요. 지구 속을 통과하는 <b>지진파</b>를 연구해서 지구 속이 여러 층으로 된 <b>층상 구조</b>라는 것을 알아냈어요."),
    );
  }

  f.say("지구 속은 직접 볼 수 없어요. 조사하는 방법 세 가지를 견주기 전에 먼저 예측해 보세요.");
  gPredict(lab, "지구 <b>중심까지</b> 알려 줄 방법은 무엇일까요?", ["시추", "화산 분출물 조사", "지진파 연구"], (picked) => {
    pred = picked;
    f.slot.setControls(gGrid(3, ...picks));
    f.say("방법을 하나씩 눌러 <b>얼마나 깊이</b>까지 알아내는지 견줘 보세요. 차례는 마음대로예요.");
    api.setCTA("세 방법을 모두 써 보세요", { enabled: false });
    nextHint();
  });
  return lab.cleanup;
};

/* ══════════ 랩 3: 층상 구조 모형 ══════════ */
export const g2u2LayerLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-layer" });
  const { f, tm } = lab;
  const DATA: [string, string, string][] = [
    ["지각", "약 35 km까지 · 고체", COL.crust],
    ["맨틀", "2900 km까지 · 고체", COL.mantle],
    ["외핵", "5100 km까지 · 액체", COL.outer],
    ["내핵", "6400 km까지 · 고체", COL.inner],
  ];
  f.stage.innerHTML = `${svgOpen}
    <path d="${wedge(R)}" fill="${COL.mantle}"/>
    <path class="g2u2x-ly-outer" d="" fill="${COL.outer}"/>
    <path class="g2u2x-ly-inner" d="" fill="${COL.inner}"/>
    <path d="M${edge(R, -1).join(" ")} A${R} ${R} 0 0 1 ${edge(R, 1).join(" ")}" stroke="${COL.crust}" stroke-width="2.4"/>
    <path d="${wedge(R)}" stroke="${G.line}" stroke-width="1.4"/>
    <path class="g2u2x-ly-la" d="" stroke="#fff" stroke-width="2"/><path class="g2u2x-ly-lb" d="" stroke="#fff" stroke-width="2"/>
    ${label(0, 0, "", { size: 12, cls: "g2u2x-ly-ta g2u2x-halo" })}${label(0, 0, "", { size: 12, cls: "g2u2x-ly-tb g2u2x-halo" })}
    ${label(CX, 20, "지표(지각은 이 선의 굵기)", { size: 12, fill: G.dim, weight: 600 })}
    ${label(204, 36, "조사 자료", { anchor: "start", fill: G.dim })}
    ${DATA.map(([n, d, c], i) => `<rect x="204" y="${48 + i * 40}" width="11" height="11" rx="3" fill="${c}"/>${label(221, 58 + i * 40, n, { anchor: "start", size: 13.5 })}${label(204, 75 + i * 40, d, { anchor: "start", size: 12, weight: 600, fill: "#C5D2E6" })}`).join("")}
  </svg>`;
  const outer = lab.q<SVGPathElement>(".g2u2x-ly-outer"), inner = lab.q<SVGPathElement>(".g2u2x-ly-inner");
  const la = lab.q<SVGPathElement>(".g2u2x-ly-la"), lb = lab.q<SVGPathElement>(".g2u2x-ly-lb");
  const ta = lab.q<SVGTextElement>(".g2u2x-ly-ta"), tb = lab.q<SVGTextElement>(".g2u2x-ly-tb");
  let a = 21, b = 43; // 100 km 단위. 처음은 층을 똑같이 나눈 모형
  let locked = false;
  const arcOf = (r: number): string => `M${edge(r, -1).map((v) => v.toFixed(1)).join(" ")} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${edge(r, 1).map((v) => v.toFixed(1)).join(" ")}`;
  const paint = (): void => {
    const ra = rOf(a * 100), rb = rOf(b * 100);
    outer.setAttribute("d", wedge(ra));
    inner.setAttribute("d", wedge(rb));
    la.setAttribute("d", arcOf(ra));
    lb.setAttribute("d", arcOf(rb));
    const place = (t: SVGTextElement, r: number, v: number): void => {
      t.setAttribute("x", String(CX));
      t.setAttribute("y", (CY - r + 15).toFixed(1));
      t.textContent = `${v * 100} km`;
    };
    place(ta, ra, a);
    place(tb, rb, b);
    host.dataset.g2A = String(a);
    host.dataset.g2B = String(b);
  };
  const ra = bvRange({ cls: "g2u2x-ly-ra", min: 5, max: 60, value: a, label: "맨틀과 외핵의 경계 깊이", onInput: (v) => { if (locked) return; a = v; if (b <= a) { b = a + 1; rb.set(b); } paint(); } });
  const rb = bvRange({ cls: "g2u2x-ly-rb", min: 6, max: 63, value: b, label: "외핵과 내핵의 경계 깊이", onInput: (v) => { if (locked) return; b = v; if (a >= b) { a = b - 1; ra.set(a); } paint(); } });
  ra.input.dataset.k = "a";
  rb.input.dataset.k = "b";
  const check = gBtn("check", "조사 자료와 견주기");
  const hintNow = (): void => lab.hint(Math.abs(a - 29) > 2 ? "range:a=29" : Math.abs(b - 51) > 2 ? "range:b=51" : "check");
  [ra.input, rb.input].forEach((n) => n.addEventListener("input", hintNow));
  check.addEventListener("click", () => {
    if (locked) return;
    const da = a - 29, db = b - 51;
    const badA = Math.abs(da) > 2, badB = Math.abs(db) > 2;
    if (badA || badB) {
      haptic(HAPTIC.wrong);
      host.dataset.g2Miss = String(Number(host.dataset.g2Miss ?? 0) + 1);
      const line = badA ? la : lb;
      line.classList.remove("g2u2x-blink");
      void line.getBoundingClientRect();
      line.classList.add("g2u2x-blink");
      const which = badA ? "맨틀과 외핵의 경계" : "외핵과 내핵의 경계";
      const dir = (badA ? da : db) < 0 ? "얕아요. 더 깊이" : "깊어요. 더 얕게";
      f.say(`자료와 달라요. <b>${which}</b>가 자료보다 ${dir} 옮겨 보세요.`);
      return;
    }
    haptic(HAPTIC.correct);
    locked = true;
    a = 29;
    b = 51;
    ra.set(a);
    rb.set(b);
    ra.input.disabled = rb.input.disabled = check.disabled = true;
    paint();
    f.pips(1);
    f.say("비율에 맞는 모형이 됐어요. 완성한 모형과 조사 자료를 보고 답해 보세요.");
    tm.later(judge1, 900);
  });

  function judge1(): void {
    lab.ask("네 층 가운데 <b>액체</b> 상태인 층은?", ["외핵", "맨틀", "내핵"], "지각, 맨틀, 내핵은 고체이고 <b>외핵만 액체</b> 상태로 짐작해요.", () => {
      f.pips(2);
      lab.ask("모형에서 <b>부피가 가장 큰</b> 층은?", ["맨틀", "외핵", "지각"], "맨틀은 지구 전체 부피의 <b>약 80%</b>를 차지해요.", () =>
        lab.finish("지권은 바깥부터 <b>지각, 맨틀, 외핵, 내핵</b>의 네 층이에요. 지각은 선 하나로 보일 만큼 얇고, 맨틀이 가장 큰 부피를 차지하며, 외핵만 액체 상태예요."),
      );
    });
  }

  paint();
  f.slot.setControls(ra.el, rb.el, check);
  f.say("지금 모형은 층을 <b>똑같은 두께</b>로 나눴어요. 조사 자료의 깊이에 맞게 두 경계를 옮겨 보세요.");
  api.setCTA("모형을 자료에 맞춰 보세요", { enabled: false });
  hintNow();
  return lab.cleanup;
};
