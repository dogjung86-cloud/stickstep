// [중2 Ⅱ v5] g2u2l9 랩 1, 2: 화산대와 지진대, 판의 경계.
//
// 랩 1 「다음 지진은 어디에서 날까요?」(g2u2QuakeLab)
//   책의 해 보기(화산 활동이 활발한 지역과 지진이 자주 발생하는 지역 알아보기)를 내기로 한다.
//   학생이 정하는 것: 지진이 날 것 같은 곳 세 군데(지도를 눌러 깃발을 꽂는다. 이것이 예측이다).
//   그다음 지진 자료를 재생해 깃발과 견준다(맞은 깃발과 빗나간 깃발이 표시된다). 이어서 화산 자료도 겹쳐 본다.
//   판정 둘: 지진이 난 곳들의 모양, 화산과 지진의 관계. 통찰 하나: 지진과 화산은 띠 모양으로, 비슷한 곳에서 일어난다.
//
// 랩 2 「그 띠는 무엇과 겹칠까요?」(g2u2PlateLab)
//   책의 탐구(빅데이터를 활용하여 화산대 및 지진대와 판의 경계의 관련성 탐구하기: 자료 유형을 고르고 재생한다)를 한다.
//   학생이 정하는 것: 지도에 올릴 자료(지진, 화산 활동, 판의 경계)와 재생.
//   실패가 보이는 길: 판의 경계를 켜지 않고 재생하면 견줄 것이 없다. 두 가지(화산과 경계, 지진과 경계)를 모두 견줘야 끝난다.
//   판정 둘: 화산대와 지진대와 판의 경계의 관계, 우리나라보다 일본에서 지진과 화산 활동이 잦은 까닭.
// 지도는 지금 단원이 쓰는 세계 지도(public/geo/maps, 경도 -180~180의 정거 원통 도법)이고 점의 자리는 경도와 위도에서 계산한다.

import type { StepRenderer } from "../../types";
import { G, gBtn, gGrid, gLab, gPick, geo, haptic, HAPTIC, label, svgOpen, type GStep } from "./kit";
import { BOUNDS, QUAKES, VOLCS } from "./plateData";

const MY = 30, MW = 346, MH = 173;
const xOf = (lon: number): number => ((lon + 180) / 360) * MW;
const yOf = (lat: number): number => MY + ((90 - lat) / 180) * MH;
const MAP = `<rect width="346" height="230" fill="#0B1524"/><image href="${geo("maps/Map01a_PALEOMAP_PaleoAtlas_000.webp")}" x="0" y="${MY}" width="${MW}" height="${MH}" preserveAspectRatio="none"/>`;
const quakeDots = (): string => QUAKES.map(([lon, lat], i) => `<circle class="g2u2x-pl-q" style="transition-delay:${((i * 37) % 95) * 18}ms" cx="${xOf(lon).toFixed(1)}" cy="${yOf(lat).toFixed(1)}" r="2.6" fill="#FFE066" stroke="#7A5B00" stroke-width=".6"/>`).join("");
const volcDots = (): string => VOLCS.map(([lon, lat], i) => { const x = xOf(lon), y = yOf(lat); return `<path class="g2u2x-pl-v" style="transition-delay:${((i * 29) % 60) * 26}ms" d="M${(x - 3.4).toFixed(1)} ${(y + 2.6).toFixed(1)} L${x.toFixed(1)} ${(y - 3.6).toFixed(1)} L${(x + 3.4).toFixed(1)} ${(y + 2.6).toFixed(1)} Z" fill="#FF5A3C" stroke="#5A0F00" stroke-width=".6"/>`; }).join("");
const boundLines = (): string => BOUNDS.map((line) => `<path class="g2u2x-pl-b" pathLength="100" d="M${line.map(([lon, lat]) => `${xOf(lon).toFixed(1)} ${yOf(lat).toFixed(1)}`).join(" L")}" stroke="#7CF2E0" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
const legend = (items: [string, string][]): string => items.map(([c, t], i) => `<circle cx="${14 + i * 92}" cy="16" r="5" fill="${c}"/>${label(24 + i * 92, 20.5, t, { anchor: "start", size: 12.5 })}`).join("");

/* ══════════ 랩 1: 깃발 꽂고 지진 자료와 견주기 ══════════ */
const PRESET: [number, number][] = [[60, 96], [173, 150], [300, 80]]; // 검사 도구가 누를 때 쓰는 자리(대륙 한가운데, 바다 한가운데, 태평양 가장자리)

export const g2u2QuakeLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-quake" });
  const { f, tm } = lab;
  f.stage.innerHTML = `${svgOpen}${MAP}
    <g class="g2u2x-pl-qs">${quakeDots()}</g><g class="g2u2x-pl-vs">${volcDots()}</g>
    <g class="g2u2x-qk-pins"></g>
    ${legend([["#FFE066", "지진"], ["#FF5A3C", "화산 활동"]])}
    ${label(338, 20.5, "깃발 0 / 3", { anchor: "end", size: 12.5, fill: G.gold, cls: "g2u2x-qk-cnt" })}
    ${label(173, 222, "", { size: 12.5, fill: G.gold, cls: "g2u2x-qk-res" })}
  </svg>`;
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
  const play = gBtn("play", "지진이 난 곳 재생하기");
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
    f.say("깃발 세 개를 다 꽂았어요. 이제 실제로 <b>지진이 난 곳</b>을 재생해서 견줘 보세요.");
    lab.hint("play");
  });
  play.addEventListener("click", () => {
    play.disabled = true;
    haptic(HAPTIC.tap);
    f.stage.classList.add("quakes");
    f.say("노란 점 하나가 지진 한 번이에요. 점들이 <b>어디에</b> 찍히는지 지켜보세요.");
    tm.later(() => {
      const hits = pins.map(([x, y]) => QUAKES.some(([lon, lat]) => Math.hypot(xOf(lon) - x, yOf(lat) - y) < 13));
      drawPins(hits);
      const n = hits.filter(Boolean).length;
      lab.q<SVGTextElement>(".g2u2x-qk-res").textContent = `깃발 3개 가운데 ${n}개가 지진이 난 곳 가까이에 있어요`;
      haptic(n ? HAPTIC.correct : HAPTIC.wrong);
      f.say(n === 3 ? "깃발이 모두 맞았어요. 점들이 놓인 <b>모양</b>을 보고 답해 보세요." : "빗나간 깃발이 있어요. 지진은 아무 데서나 나지 않네요. 점들이 놓인 <b>모양</b>을 보세요.");
      tm.later(() => lab.ask("지진이 난 곳들은 지도에서 <b>어떤 모양</b>으로 놓여 있나요?", ["좁은 띠 모양으로 이어진다", "지도 전체에 고르게 퍼져 있다", "대륙 한가운데에 몰려 있다"], "지진은 <b>특정한 곳</b>에서 긴 띠를 이루며 일어나요.", () => {
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

/* ══════════ 랩 2: 자료를 골라 판의 경계와 견주기 ══════════ */
type Layer = "q" | "v" | "b";
const KR: [number, number] = [127.5, 36.5], JP: [number, number] = [138.5, 36.5];

export const g2u2PlateLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-plate" });
  const { f, tm } = lab;
  f.stage.innerHTML = `${svgOpen}${MAP}
    <g class="g2u2x-pl-bs">${boundLines()}</g><g class="g2u2x-pl-qs">${quakeDots()}</g><g class="g2u2x-pl-vs">${volcDots()}</g>
    <g class="g2u2x-pl-kj"><circle cx="${xOf(KR[0]).toFixed(1)}" cy="${yOf(KR[1]).toFixed(1)}" r="5" stroke="#fff" stroke-width="2" fill="none"/>${label(xOf(KR[0]) - 8, yOf(KR[1]) + 4, "우리나라", { anchor: "end", size: 12, cls: "g2u2x-halo" })}
      <circle cx="${xOf(JP[0]).toFixed(1)}" cy="${yOf(JP[1]).toFixed(1)}" r="5" stroke="#fff" stroke-width="2" fill="none"/>${label(xOf(JP[0]) + 8, yOf(JP[1]) + 4, "일본", { anchor: "start", size: 12, cls: "g2u2x-halo" })}</g>
    ${legend([["#FFE066", "지진"], ["#FF5A3C", "화산 활동"], ["#7CF2E0", "판의 경계"]])}
    ${label(173, 222, "견준 것: 아직 없음", { size: 12.5, fill: G.dim, weight: 700, cls: "g2u2x-pl-log" })}
  </svg>`;
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
  const play = gBtn("play", "재생");
  function hintNow(): void {
    const want: Layer = !seen.v ? "v" : "q", other: Layer = want === "v" ? "q" : "v";
    if (on[other]) lab.hint(other);
    else if (!on[want]) lab.hint(want);
    else if (!on.b) lab.hint("b");
    else lab.hint("play");
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
        f.say("띠 모양은 보이지만 <b>견줄 것</b>이 없어요. 판의 경계도 함께 켜서 다시 재생해 보세요.");
        hintNow();
        return;
      }
      if (!on.q && !on.v) {
        f.say("판의 경계만 보여요. <b>화산 활동</b>이나 <b>지진</b>을 함께 켜서 견줘 보세요.");
        hintNow();
        return;
      }
      if (on.v) seen.v = true;
      if (on.q) seen.q = true;
      haptic(HAPTIC.correct);
      const log = [seen.v ? "화산 활동과 판의 경계" : "", seen.q ? "지진과 판의 경계" : ""].filter(Boolean).join(", ");
      const t = lab.q<SVGTextElement>(".g2u2x-pl-log");
      t.textContent = `견준 것: ${log}`;
      t.setAttribute("fill", G.gold);
      f.pips(seen.v && seen.q ? 2 : 1);
      if (!(seen.v && seen.q)) {
        f.say(`${on.v ? "붉은 세모" : "노란 점"}가 청록색 선을 따라 놓여 있어요. 이번에는 <b>${seen.v ? "지진" : "화산 활동"}</b>과 판의 경계를 견줘 보세요.`);
        hintNow();
        return;
      }
      f.say("화산 활동과 지진을 모두 판의 경계와 견줬어요. 지도를 보고 답해 보세요.");
      tm.later(() => lab.ask("화산대와 지진대는 <b>판의 경계</b>와 어떤 관계인가요?", ["대체로 일치한다", "서로 엇갈려 있다", "아무 관계가 없다"], "세모와 점이 대부분 <b>청록색 선</b>을 따라 놓여 있어요.", () => {
        f.stage.classList.add("kj");
        f.say("지도에 <b>우리나라와 일본</b>을 표시했어요. 판의 경계와 얼마나 가까운지 견줘 보세요.");
        lab.ask("우리나라보다 <b>일본</b>에서 지진과 화산 활동이 잦은 까닭은?", ["판의 경계에 더 가까워서", "섬으로 이루어진 나라라서", "우리나라보다 더 따뜻해서"], "일본은 <b>판의 경계</b> 바로 위에 있고 우리나라는 조금 떨어져 있어요.", () =>
          lab.finish("화산 활동과 지진은 주로 <b>판의 경계</b>에서 일어나요. 그래서 화산대와 지진대는 판의 경계와 대체로 일치하고, 판의 경계에 가까운 일본에서는 우리나라보다 지진과 화산 활동이 잦아요."),
        );
      }), 1000);
    }, 2400);
  });
  f.slot.setControls(gGrid(3, ...picks), play);
  f.say("지도에 올릴 <b>자료</b>를 고르고 재생해 보세요. 먼저 화산 활동과 판의 경계를 견줘 볼까요?");
  api.setCTA("자료를 골라 견줘 보세요", { enabled: false });
  hintNow();
  return lab.cleanup;
};
