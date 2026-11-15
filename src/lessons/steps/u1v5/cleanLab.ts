// [중1 Ⅰ v5] u1l5 cleanLab: 「온실 기체를 줄이려면 무엇을 바꿀까?」
// 한 통찰: 과학기술(태양광 발전, 전기 자동차, 탄소 포집 장치)로 에너지는 그대로 쓰면서 하늘로 가는 온실 기체를 줄일 수 있다.
// 도입(blanket)이 넘긴 물음(두꺼워지는 기체 층을 어떻게 할까)을 받는다. 하늘의 띠가 도입의 담요다.
// 무대(2026-11-15 그래픽 감사 고침, 사용자 결정 "모두 수정"):
//   · 장치마다 하늘로 올라가는 기체의 흐름(띠, 알갱이, 위로 향한 꺾쇠)이 무대에서 가장 크고 진하다. 굵기와 알갱이 수는 그 장치가 해마다 내보내는 양을 따른다.
//   · 하늘의 띠는 '쌓인 온실 기체'다. 시간이 흐르는 동안 해마다 내보내는 양만큼 계속 두꺼워지고 얇아지지 않는다.
//     장치를 바꾸면 두꺼워지는 빠르기만 느려진다. 처음부터 있던 두께(위의 짙은 띠)와 그 뒤에 더 쌓인 두께(아래의 옅은 띠)를 점선으로 가른다.
//     옛 그림은 띠 두께가 지금의 배출을 바로 따라 얇아져 "배출을 줄이면 하늘의 온실 기체가 곧 준다"로 읽혔다.
//   · 막대는 '해마다 더해지는 양'(장치 셋의 배출 합)이다. 굴뚝 기체가 지나가지 않는 가운데 위에 둔다(옛 자리는 굴뚝 기체가 막대와 글자를 덮었다).
// 조작: 카드 셋(발전소, 자동차, 공장 굴뚝)을 눌러 바꾼다. 다시 누르면 되돌아간다. 손을 대면 흐름과 막대가 바로 바뀌고 띠는 쌓이는 빠르기가 바뀐다.
//       이산화 탄소는 보이지 않으므로 "연기"라고 부르지 않는다(눈검수 지적).
//       발전소가 석탄인 채 전기 자동차로 바꾸면 발전소 흐름이 조금 굵어진다(충전할 전기를 석탄으로 만든다). 틀린 차례도 해 볼 수 있다.
// 흐름: 셋을 모두 바꾼다 → 판정 → 결론.
// 배출량(숫자는 화면에 쓰지 않는다): 발전소 45, 자동차 25, 공장 30. 전기 자동차 + 석탄 발전이면 발전소 +10. 포집 뒤 공장 5.
// 쌓이는 빠르기: 배출 100이면 1초에 4px쯤. 화면을 오래 두어도 무대를 덮지 않게 더 쌓일 수 있는 두께에 한도(SPAN)를 두고 그 가까이에서 아주 조금씩 덜 쌓이게 그린다.
// 움직임은 CSS와 setTimeout만 쓴다(Ⅱ단원 뼈대의 약속. 캔버스와 rAF 없음).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvFrame, bvTimers, type BvCard } from "../bio6/b6Lab";

interface CleanStep {
  title: string;
  cta?: string;
}

type Key = "plant" | "car" | "fac";
const KEYS: Key[] = ["plant", "car", "fac"];
const INFO: Record<Key, { name: string; old: string; neo: string }> = {
  plant: { name: "발전소", old: "석탄 발전", neo: "태양광 발전" },
  car: { name: "자동차", old: "휘발유 자동차", neo: "전기 자동차" },
  fac: { name: "공장 굴뚝", old: "그대로 배출", neo: "탄소 포집 장치" },
};

const H0 = 26; // 처음에 이미 쌓여 있던 두께(원래 있던 온실 기체를 포함한다)
const SPAN = 48; // 더 쌓여 보일 수 있는 두께의 한도(무대와 흐름의 꺾쇠를 가리지 않게)
const RATE = 0.04; // 배출 1이 1초에 더하는 두께(px). 카드를 빨리 눌러도 처음보다 두꺼워진 것이 보이게
const TICK = 250; // 시간이 흐르는 간격(ms). 1초가 1년이다

interface Outlet {
  x: number; // 기체가 나오는 곳
  y: number;
  e: number; // 해마다 내보내는 양
}

/** 기체가 나오는 곳 하나에서 하늘로 올라가는 흐름(띠, 꺾쇠, 알갱이). 띠의 윗부분은 하늘의 띠가 덮는다. */
function flowSvg(o: Outlet, ns: string): string {
  const w = 5 + o.e * 0.45; // 나오는 곳의 폭
  const top = 4;
  const rise = o.y - 22; // 알갱이가 오르는 거리(하늘의 띠 속으로 사라진다)
  const ribbon = `<path d="M${(o.x - w / 2).toFixed(1)} ${o.y} L${(o.x - w * 0.95).toFixed(1)} ${top} L${(o.x + w * 0.95).toFixed(1)} ${top} L${(o.x + w / 2).toFixed(1)} ${o.y} Z" fill="url(#${ns}Flow)"/>`;
  const cy = o.y - 15;
  const k = Math.max(5, w * 0.42);
  const chev = `<path d="M${(o.x - k).toFixed(1)} ${(cy + k * 0.62).toFixed(1)} L${o.x} ${cy.toFixed(1)} L${(o.x + k).toFixed(1)} ${(cy + k * 0.62).toFixed(1)}" fill="none" stroke="#F6E6D2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
  const n = Math.max(1, Math.round(o.e / 7));
  const dur = rise / 34;
  const r = 3.4 + o.e * 0.07;
  const dots = Array.from({ length: n }, (_, i) => {
    const dx = ((i % 3) - 1) * w * 0.2;
    const still = -((i + 0.5) / n) * rise * 0.85; // 움직임을 줄인 화면에서는 흐름을 따라 흩어 둔다
    return `<circle class="u1c-rise" cx="${(o.x + dx).toFixed(1)}" cy="${o.y - 4}" r="${r.toFixed(1)}" style="--rise:${(-rise).toFixed(0)}px;--still:${still.toFixed(0)}px;animation-duration:${dur.toFixed(2)}s;animation-delay:${(-(i / n) * dur).toFixed(2)}s"/>`;
  }).join("");
  return `<g class="u1c-flow">${ribbon}${dots}${chev}</g>`;
}

function stageSvg(ns: string): string {
  const panel = (x: number): string =>
    `<path d="M${x} 186 l10 -30 h26 l-10 30 z" fill="#2F6FDB" stroke="#9CC4FF" stroke-width="1.2" stroke-linejoin="round"/><path d="M${x + 5} 171 h26 M${x + 18} 156 l-10 30" stroke="#9CC4FF" stroke-width="1"/>`;
  return `<svg viewBox="0 0 346 230" role="img" aria-label="발전소, 자동차, 공장에서 하늘로 올라가 쌓이는 온실 기체">
    <defs>
      <linearGradient id="${ns}Flow" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#C9A27A" stop-opacity=".62"/><stop offset="1" stop-color="#C9A27A" stop-opacity=".2"/></linearGradient>
      <linearGradient id="${ns}New" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C7A17B"/><stop offset="1" stop-color="#B08A64"/></linearGradient>
      <linearGradient id="${ns}Old" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8896A"/><stop offset="1" stop-color="#977858"/></linearGradient>
      <linearGradient id="${ns}Edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B08A64" stop-opacity=".55"/><stop offset="1" stop-color="#B08A64" stop-opacity="0"/></linearGradient>
    </defs>
    <g class="u1c-flows"></g>

    <rect class="u1c-band" x="0" y="0" width="346" height="${H0}" fill="url(#${ns}New)"/>
    <rect class="u1c-edge" x="0" y="${H0}" width="346" height="8" fill="url(#${ns}Edge)"/>
    <rect x="0" y="0" width="346" height="${H0}" fill="url(#${ns}Old)"/>
    <line x1="0" y1="${H0}" x2="346" y2="${H0}" stroke="#F6E6D2" stroke-width="1.2" stroke-dasharray="5 4" opacity=".75"/>
    <text x="12" y="17" class="u1c-gaslb">하늘에 쌓인 온실 기체</text>
    <text x="334" y="17" text-anchor="end" class="u1c-gaslb u1c-year">흐른 시간 0년</text>

    <text x="196" y="110" text-anchor="middle" class="u1x-lb sm">해마다 더해지는 양</text>
    <rect x="146" y="116" width="100" height="9" rx="4.5" fill="#22344F"/>
    <rect class="u1c-bar" x="146" y="116" width="100" height="9" rx="4.5" fill="#FF9F43"/>

    <rect x="0" y="190" width="346" height="40" fill="#0F1C33"/>
    <line x1="0" y1="190" x2="346" y2="190" stroke="#2A3E60" stroke-width="1.2"/>

    <g class="u1c-old" data-k="plant">
      <rect x="38" y="108" width="13" height="40" fill="#5B6B85" stroke="#8FA3C2" stroke-width="1.2"/>
      <rect x="62" y="98" width="13" height="50" fill="#5B6B85" stroke="#8FA3C2" stroke-width="1.2"/>
      <rect x="22" y="146" width="76" height="44" rx="3" fill="#3A4B68" stroke="#8FA3C2" stroke-width="1.4"/>
      <rect x="32" y="158" width="12" height="12" fill="#FFD766" opacity=".8"/><rect x="54" y="158" width="12" height="12" fill="#FFD766" opacity=".8"/><rect x="76" y="158" width="12" height="12" fill="#FFD766" opacity=".8"/>
    </g>
    <g class="u1c-new" data-k="plant">
      ${panel(14)}${panel(44)}${panel(74)}
      <circle cx="96" cy="124" r="9" fill="#FFD766"/><path d="M96 108 v-5 M96 145 v-5 M80 124 h-5 M117 124 h-5 M85 113 l-4 -4 M107 113 l4 -4" stroke="#FFD766" stroke-width="2" stroke-linecap="round"/>
    </g>

    <g class="u1c-old" data-k="car">
      <path d="M134 178 v-12 q0 -4 5 -5 l12 -2 l9 -13 q2 -3 6 -3 h22 q4 0 6 3 l8 13 q10 1 10 8 v11 z" fill="#D9534F" stroke="#FFB3B0" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M163 158 l6 -10 h10 v10 z M183 148 h9 l6 10 h-15 z" fill="#CFE3FF"/>
      <path d="M134 174 h-8" stroke="#8FA3C2" stroke-width="3" stroke-linecap="round"/>
      <circle cx="154" cy="180" r="8" fill="#1B2536" stroke="#C9D5E8" stroke-width="1.6"/><circle cx="196" cy="180" r="8" fill="#1B2536" stroke="#C9D5E8" stroke-width="1.6"/>
    </g>
    <g class="u1c-new" data-k="car">
      <path d="M134 178 v-12 q0 -4 5 -5 l12 -2 l9 -13 q2 -3 6 -3 h22 q4 0 6 3 l8 13 q10 1 10 8 v11 z" fill="#2FBF71" stroke="#A8F0C8" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M163 158 l6 -10 h10 v10 z M183 148 h9 l6 10 h-15 z" fill="#CFE3FF"/>
      <circle cx="154" cy="180" r="8" fill="#1B2536" stroke="#C9D5E8" stroke-width="1.6"/><circle cx="196" cy="180" r="8" fill="#1B2536" stroke="#C9D5E8" stroke-width="1.6"/>
      <path d="M178 160 l-7 10 h6 l-3 9 l9 -12 h-6 z" fill="#FFF3B0"/>
    </g>

    <g data-k="fac">
      <rect x="270" y="104" width="15" height="46" fill="#5B6B85" stroke="#8FA3C2" stroke-width="1.2"/>
      <path d="M238 190 v-40 l18 -12 v12 l18 -12 v12 l18 -12 v52 z" fill="#3A4B68" stroke="#8FA3C2" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="248" y="166" width="12" height="12" fill="#FFD766" opacity=".8"/><rect x="268" y="166" width="12" height="12" fill="#FFD766" opacity=".8"/>
    </g>
    <g class="u1c-new" data-k="fac">
      <rect x="262" y="92" width="31" height="18" rx="5" fill="#4C9BFF" stroke="#CFE3FF" stroke-width="1.3"/>
      <path d="M268 97 h19 M268 101 h19 M268 105 h19" stroke="#CFE3FF" stroke-width="1.2"/>
      <path d="M293 101 h18 v47" fill="none" stroke="#CFE3FF" stroke-width="2.4" stroke-linejoin="round"/>
      <rect x="300" y="148" width="24" height="42" rx="8" fill="#22436E" stroke="#CFE3FF" stroke-width="1.4"/>
      <circle cx="312" cy="176" r="4" fill="#C9A27A"/><circle cx="308" cy="166" r="3.4" fill="#C9A27A"/><circle cx="316" cy="162" r="3" fill="#C9A27A"/>
    </g>

    <text x="60" y="210" text-anchor="middle" class="u1x-lb">발전소</text>
    <text x="175" y="210" text-anchor="middle" class="u1x-lb">자동차</text>
    <text x="280" y="210" text-anchor="middle" class="u1x-lb">공장</text>
  </svg>`;
}

export const cleanLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CleanStep;
  const tm = bvTimers();
  host.classList.add("u1x-step");
  const f = bvFrame(host, { title: s.title, steps: 4, cls: "u1c-stage", qCls: "u1c-q", api });
  const ns = `u1c${Math.random().toString(36).slice(2, 7)}`;
  f.stage.innerHTML = stageSvg(ns);
  const flows = f.stage.querySelector(".u1c-flows") as SVGGElement;
  const band = f.stage.querySelector(".u1c-band") as SVGRectElement;
  const edge = f.stage.querySelector(".u1c-edge") as SVGRectElement;
  const year = f.stage.querySelector(".u1c-year") as SVGTextElement;
  const bar = f.stage.querySelector(".u1c-bar") as SVGRectElement;
  const olds = Array.from(f.stage.querySelectorAll<SVGGElement>(".u1c-old"));
  const news = Array.from(f.stage.querySelectorAll<SVGGElement>(".u1c-new"));

  const clean: Record<Key, boolean> = { plant: false, car: false, fac: false };
  let locked = false;
  const cards = Object.fromEntries(KEYS.map((k) => [k, bvCard("col u1c-card", { name: INFO[k].name, sub: INFO[k].old, key: k })])) as Record<Key, BvCard>;

  const plantE = (): number => (clean.plant ? 0 : 45 + (clean.car ? 10 : 0));
  const carE = (): number => (clean.car ? 0 : 25);
  const facE = (): number => (clean.fac ? 5 : 30);
  const total = (): number => plantE() + carE() + facE();

  // ── 시간과 쌓인 양 ──
  // 처음 2초는 시간을 2.5배로 빨리 돌린다(도움말을 읽는 동안 "그대로 두면 해마다 쌓인다"가 먼저 보이게. 카드를 아주 빨리 눌러도 처음보다 두꺼워진 것이 남는다).
  let acc = 0; // 처음 뒤로 더 쌓인 양(px로 센다)
  let secs = 0;
  let ticks = 0;
  const thick = (): number => H0 + SPAN * (1 - Math.exp(-acc / SPAN));
  function showLayer(): void {
    const h = thick();
    band.setAttribute("height", h.toFixed(1));
    edge.setAttribute("y", h.toFixed(1));
    year.textContent = `흐른 시간 ${Math.floor(secs)}년`;
    host.dataset.u1Layer = h.toFixed(1);
  }
  function tick(): void {
    ticks += 1;
    const k = ticks <= 8 ? 2.5 : 1;
    secs += (TICK / 1000) * k;
    acc += total() * RATE * (TICK / 1000) * k;
    showLayer();
    tm.later(tick, TICK);
  }

  function paint(): void {
    olds.forEach((g) => (g.style.display = clean[g.dataset.k as Key] ? "none" : ""));
    news.forEach((g) => (g.style.display = clean[g.dataset.k as Key] ? "" : "none"));
    const outs: Outlet[] = [];
    const p = plantE();
    if (p) outs.push({ x: 44.5, y: 108, e: p / 2 }, { x: 68.5, y: 98, e: p / 2 });
    if (carE()) outs.push({ x: 122, y: 172, e: carE() });
    outs.push(clean.fac ? { x: 277.5, y: 92, e: facE() } : { x: 277.5, y: 104, e: facE() });
    flows.innerHTML = outs.map((o) => flowSvg(o, ns)).join("");
    const t = total();
    bar.setAttribute("width", String(t));
    bar.setAttribute("fill", t > 60 ? "#FF9F43" : t > 25 ? "#FFD766" : "#63E6BE");
    KEYS.forEach((k) => {
      cards[k].sub(clean[k] ? INFO[k].neo : INFO[k].old);
      cards[k].on(clean[k]);
      cards[k].el.setAttribute("aria-pressed", String(clean[k]));
    });
    host.dataset.u1Total = String(t);
  }

  function sayFor(k: Key): string {
    if (k === "plant") return clean.plant ? "햇빛으로 전기를 만들어요. <b>석탄을 태우지 않아</b> 온실 기체가 나오지 않아요." : "다시 석탄을 태워 전기를 만들어요. 굴뚝에서 온실 기체가 나와요.";
    if (k === "car") {
      if (!clean.car) return "다시 휘발유를 태우며 달려요. 배기구에서 온실 기체가 나와요.";
      return clean.plant ? "햇빛으로 만든 전기로 달려요. 자동차도 발전소도 온실 기체를 내지 않아요." : "달릴 때는 온실 기체가 안 나와요. 그런데 충전할 전기를 만드느라 <b>발전소</b>에서 더 나와요.";
    }
    return clean.fac ? "굴뚝에서 나오는 이산화 탄소를 <b>붙잡아 모아요</b>. 하늘로 올라가는 양이 줄었어요." : "장치를 떼자 굴뚝의 이산화 탄소가 다시 하늘로 올라가요.";
  }

  KEYS.forEach((k) =>
    cards[k].el.addEventListener("click", () => {
      if (locked) return;
      haptic(HAPTIC.tap);
      clean[k] = !clean[k];
      paint();
      f.say(sayFor(k));
      const n = KEYS.filter((x) => clean[x]).length;
      f.pips(n);
      if (n === KEYS.length) {
        locked = true;
        haptic(HAPTIC.ctaUnlock);
        tm.later(() => f.say("셋을 모두 바꿨어요. 막대가 짧아지고 <b>기체 층</b>은 아주 느리게 쌓여요."), 1600);
        tm.later(askFinal, 3600);
      }
    }),
  );

  function askFinal(): void {
    f.say("전기도 자동차도 공장도 그대로 쓰고 있어요. 무대를 보고 골라 봐요.");
    f.slot.ask(
      "기체 층이 느리게 쌓여요. 방금 바꾼 <b>세 가지의 공통점</b>은?",
      [{ t: "하늘로 가는 온실 기체를 줄인다", ok: true }, { t: "에너지를 전혀 쓰지 않게 한다" }, { t: "지하자원을 더 많이 쓰게 한다" }],
      (ok) => api.recordQuiz(ok),
      { why: "전기와 자동차는 그대로 쓰면서 <b>나오는 기체만</b> 줄였어요.", onNext: finish },
    );
  }

  function finish(): void {
    f.pips(4);
    f.say("끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("과학기술은 에너지와 환경 문제를 푸는 데 쓰여요. <b>태양광 발전</b>, <b>전기 자동차</b>, <b>탄소 포집 장치</b>가 온실 기체를 줄여요.");
    api.enableCTA(s.cta ?? "다음");
  }

  f.slot.setControls(bvCards(3, cards.plant, cards.car, cards.fac), el("div", { class: "u1x-cap center", text: "카드를 누르면 바뀌고, 다시 누르면 되돌아가요." }), el("div", { class: "u1x-cap center", text: "온실 기체는 눈에 보이지 않아요. 알아보기 쉽게 그렸어요." }));
  paint();
  showLayer();
  tm.later(tick, TICK);
  f.say("카드를 눌러 <b>발전소, 자동차, 공장 굴뚝</b>을 하나씩 바꿔 봐요. 하늘의 기체 층을 지켜봐요.");
  api.setCTA("세 가지를 모두 바꿔 보세요", { enabled: false });
  return () => tm.clear();
};
