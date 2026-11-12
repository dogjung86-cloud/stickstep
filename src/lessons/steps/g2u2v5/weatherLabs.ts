// [중2 Ⅱ v5] g2u2l7 랩 1, 2: 풍화와 토양.
//
// 랩 1 「바위틈의 물이 얼면 틈은 어떻게 될까요?」(g2u2FrostLab)
//   책의 그림(풍화 작용의 요인: 암석 틈에 스며든 물이 얼어 부피가 커지면서 틈이 넓어지다가 쪼개진다)을 손으로 되풀이한다.
//   학생이 정하는 것: 비 내리기, 얼리기(밤), 녹이기(낮)의 차례와 횟수. 먼저 예측한다(정오를 매기지 않는다).
//   실패가 보이는 길: 물 없이 얼리면 아무 일도 없다. 이미 언 것을 또 얼려도 달라지지 않는다(녹아야 물이 더 깊이 스며든다).
//   판정 하나: 틈이 넓어진 까닭. 통찰 하나: 얼고 녹기가 되풀이되면 암석이 쪼개진다. 틈의 너비와 횟수는 무대에 남는다.
//
// 랩 2 「토양의 층은 어떤 차례로 생겼을까요?」(g2u2SoilLab)
//   책의 그림(토양이 만들어지는 과정)과 해 보기(층이 생성되는 순서와 실제 쌓여 있는 순서 비교)를 한다.
//   학생이 정하는 것: 풍화가 계속되게 둘지, 비를 내릴지와 그 차례.
//   실패가 보이는 길: 고운 흙이 생기기 전에 비를 내리면 씻겨 내려갈 것이 없어 층이 생기지 않는다.
//   판정 하나: 가장 나중에 만들어진 층. 통찰 하나: 생긴 차례와 쌓여 있는 차례는 다르다(생긴 차례의 번호가 무대에 남는다).

import type { StepRenderer } from "../../types";
import { bvTween } from "../bio6/b6Lab";
import { G, gBtn, gGrid, gLab, gPick, gPredict, gRow, haptic, HAPTIC, label, svgOpen, type GStep } from "./kit";

/* ══════════ 랩 1: 얼고 녹기 ══════════ */
export const g2u2FrostLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-frost" });
  const { f, tm } = lab;
  const MX = 150, TOP = 62, BOT = 196;
  f.stage.innerHTML = `${svgOpen}
    <defs><linearGradient id="g2frR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B8B0A6"/><stop offset="1" stop-color="#7C746B"/></linearGradient></defs>
    <circle class="g2u2x-fr-sun" cx="300" cy="34" r="15" fill="#FFD43B"/>
    <path class="g2u2x-fr-moon" d="M308 22 a15 15 0 1 0 6 22 a12 12 0 0 1 -6 -22 Z" fill="#DCE7F5"/>
    <g class="g2u2x-fr-rain" stroke="#7CC4F0" stroke-width="2" stroke-linecap="round">${[40, 90, 130, 170, 210, 250].map((x, i) => `<path d="M${x} ${14 + (i % 2) * 10} l-5 14"/>`).join("")}</g>
    <path d="M10 ${BOT} H336" stroke="#5D7393" stroke-width="2"/>
    <g class="g2u2x-fr-gap"><rect class="g2u2x-fr-fill" x="${MX}" y="${TOP}" width="0" height="${BOT - TOP}" fill="#0B1524"/></g>
    <path class="g2u2x-fr-l" d="M${MX} ${TOP} L${MX - 70} ${TOP + 8} L${MX - 104} ${TOP + 60} L${MX - 96} ${BOT} H${MX} Z" fill="url(#g2frR)" stroke="#D5CEC4" stroke-width="1.6" stroke-linejoin="round"/>
    <path class="g2u2x-fr-r" d="M${MX} ${TOP} L${MX + 62} ${TOP + 4} L${MX + 98} ${TOP + 52} L${MX + 92} ${BOT} H${MX} Z" fill="url(#g2frR)" stroke="#D5CEC4" stroke-width="1.6" stroke-linejoin="round"/>
    ${label(14, 216, "틈의 너비", { anchor: "start", size: 12.5, fill: G.dim, weight: 700 })}
    <rect x="76" y="207" width="120" height="9" rx="4.5" fill="rgba(255,255,255,.12)"/><rect class="g2u2x-fr-bar" x="76" y="207" width="8" height="9" rx="4.5" fill="${G.gold}"/>
    ${label(332, 216, "얼고 녹기 0번", { anchor: "end", size: 12.5, cls: "g2u2x-fr-cnt" })}
    ${label(MX, 48, "", { size: 12.5, fill: G.gold, cls: "g2u2x-fr-msg g2u2x-halo" })}
  </svg>`;
  const L = lab.q<SVGPathElement>(".g2u2x-fr-l"), R = lab.q<SVGPathElement>(".g2u2x-fr-r"), fill = lab.q<SVGRectElement>(".g2u2x-fr-fill");
  let w = 4, water = false, frozen = false, cycles = 0, split = false, busy = false, pred = "";
  const NEED = 4;
  const paint = (): void => {
    const gap = split ? w + 26 : w;
    L.style.transform = `translateX(${(-gap / 2).toFixed(1)}px)${split ? " rotate(-5deg)" : ""}`;
    R.style.transform = `translateX(${(gap / 2).toFixed(1)}px)${split ? " rotate(6deg)" : ""}`;
    fill.setAttribute("x", (MX - w / 2).toFixed(1));
    fill.setAttribute("width", w.toFixed(1));
    fill.setAttribute("y", String(frozen ? TOP - 5 : TOP + 6));
    fill.setAttribute("height", String(BOT - (frozen ? TOP - 5 : TOP + 6)));
    fill.setAttribute("fill", split ? "#0B1524" : frozen ? "#EAF6FF" : water ? "#3F9BE8" : "#0B1524");
    lab.q<SVGRectElement>(".g2u2x-fr-bar").setAttribute("width", String(Math.min(120, w * 6)));
    lab.q<SVGTextElement>(".g2u2x-fr-cnt").textContent = `얼고 녹기 ${cycles}번`;
    f.stage.classList.toggle("night", frozen);
    host.dataset.g2W = String(w);
  };
  const msg = (t: string): void => { lab.q<SVGTextElement>(".g2u2x-fr-msg").textContent = t; };
  const rain = gBtn("rain", "비 내리기(틈에 물 채우기)", false);
  const freeze = gBtn("freeze", "밤: 얼리기", false), melt = gBtn("melt", "낮: 녹이기", false);
  const hintNow = (): void => lab.hint(!water ? "rain" : frozen ? "melt" : "freeze");
  const fail = (t: string): void => {
    haptic(HAPTIC.wrong);
    host.dataset.g2Miss = String(Number(host.dataset.g2Miss ?? 0) + 1);
    f.say(t);
  };
  rain.addEventListener("click", () => {
    if (busy || split) return;
    if (frozen) return fail("틈이 얼음으로 막혀 있어요. 먼저 <b>녹여야</b> 물이 스며들어요.");
    haptic(HAPTIC.tap);
    water = true;
    f.stage.classList.add("raining");
    tm.later(() => f.stage.classList.remove("raining"), 900);
    msg("틈에 물이 스며들었어요");
    paint();
    f.say("빗물이 <b>틈</b>에 스며들었어요. 이제 밤이 되어 기온이 내려가면 어떻게 될까요?");
    hintNow();
  });
  freeze.addEventListener("click", () => {
    if (busy || split) return;
    if (!water) return fail("틈에 <b>물이 없어서</b> 얼려도 아무 일도 일어나지 않아요. 먼저 비를 내려 보세요.");
    if (frozen) return fail("이미 얼어 있어요. <b>녹아야</b> 물이 넓어진 틈 속으로 더 깊이 스며들어요.");
    haptic(HAPTIC.tap);
    busy = true;
    frozen = true;
    const from = w;
    bvTween(tm, 700, (t) => { w = from + 3.2 * t; paint(); }, () => {
      busy = false;
      msg("물이 얼어 부피가 커졌어요");
      f.say(`물이 얼면서 틈을 <b>밀어 넓혔어요</b>. ${cycles === 0 ? `${pred.startsWith("넓어") ? "예측대로예요." : "예측과 달랐죠."} ` : ""}낮이 되면 어떻게 될까요?`);
      hintNow();
    });
  });
  melt.addEventListener("click", () => {
    if (busy || split) return;
    if (!frozen) return fail("지금은 얼어 있지 않아요. <b>얼려야</b> 틈이 넓어져요.");
    haptic(HAPTIC.tap);
    frozen = false;
    cycles += 1;
    f.pips(cycles >= 2 ? 1 : 0);
    if (cycles >= NEED) {
      split = true;
      water = false;
      haptic(HAPTIC.correct);
      paint();
      msg("바위가 쪼개졌어요");
      [rain, freeze, melt].forEach((b) => (b.disabled = true));
      f.pips(2);
      f.say("얼고 녹기를 되풀이하자 틈이 점점 넓어지다가 바위가 <b>쪼개졌어요</b>. 기록을 보고 답해 보세요.");
      tm.later(() => lab.ask("바위의 틈이 <b>넓어진</b> 까닭은?", ["물이 얼면서 부피가 커져서", "얼음이 바위를 녹여서", "물이 얼면서 부피가 줄어서"], "물은 얼면 <b>부피가 커져요</b>. 커진 얼음이 틈을 양옆으로 밀어요.", () =>
        lab.finish("암석의 틈에 스며든 물이 얼면 <b>부피가 커져</b> 틈을 넓혀요. 얼고 녹기가 오랫동안 되풀이되면 암석이 쪼개져 더 작은 조각으로 부서져요."),
      ), 1100);
      return;
    }
    msg("얼음이 녹아 물이 더 깊이 스며들었어요");
    paint();
    f.say(`얼음은 녹았지만 넓어진 틈은 <b>그대로</b>예요. 얼고 녹기를 ${NEED}번쯤 되풀이해 보세요.`);
    hintNow();
  });
  paint();
  f.say("바위에 가느다란 <b>틈</b>이 있어요. 비가 오면 이 틈에 물이 스며들어요. 먼저 예측해 보세요.");
  gPredict(lab, "틈에 스며든 물이 <b>얼면</b> 틈은 어떻게 될까요?", ["넓어진다", "좁아진다", "달라지지 않는다"], (picked) => {
    pred = picked;
    f.slot.setControls(rain, gRow(freeze, melt));
    f.say("<b>비</b>를 내리고, 밤에는 <b>얼리고</b>, 낮에는 <b>녹여</b> 보세요. 차례는 직접 정해요.");
    api.setCTA("바위가 쪼개질 때까지 해 보세요", { enabled: false });
    hintNow();
  });
  return lab.cleanup;
};

/* ══════════ 랩 2: 토양이 만들어지는 차례 ══════════ */
export const g2u2SoilLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-soil" });
  const { f, tm } = lab;
  const X = 16, W = 136, TOP = 36, BOT = 214;
  // 층의 두께(px): a 식물이 자라는 층, b 진흙 등이 쌓인 층, c 암석 조각과 모래 층. 나머지는 풍화를 받지 않은 암석.
  const S = { a: 0, b: 0, c: 0 };
  let stage = 0; // 0 암석만, 1 조각과 모래, 2 겉흙, 3 진흙층까지
  let busy = false;
  f.stage.innerHTML = `${svgOpen}
    <rect x="${X}" y="${TOP}" width="${W}" height="${BOT - TOP}" fill="#8E8A86"/>
    <g fill="none" stroke="#5F5B58" stroke-width="1.4">${[0, 1, 2, 3].map((i) => `<path d="M${X + 14 + i * 32} ${TOP + 30 + (i % 2) * 40} l18 22 l-10 26"/>`).join("")}</g>
    <g class="g2u2x-so-c"></g><rect class="g2u2x-so-b" x="${X}" width="${W}" y="${TOP}" height="0" fill="#B5764A"/><rect class="g2u2x-so-a" x="${X}" width="${W}" y="${TOP}" height="0" fill="#4A3628"/>
    <g class="g2u2x-so-plant"><path d="M${X + 40} ${TOP} v-16 M${X + 40} ${TOP - 9} q-9 -3 -11 -11 q10 0 11 11 M${X + 40} ${TOP - 12} q8 -3 10 -11 q-10 1 -10 11" stroke="#5FCB6B" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <path d="M${X + 96} ${TOP} v-12 M${X + 96} ${TOP - 7} q-8 -2 -9 -9 q9 0 9 9" stroke="#5FCB6B" stroke-width="2.4" stroke-linecap="round" fill="none"/></g>
    <g class="g2u2x-fr-rain" stroke="#7CC4F0" stroke-width="2" stroke-linecap="round">${[30, 62, 94, 126].map((x, i) => `<path d="M${x} ${6 + (i % 2) * 8} l-4 13"/>`).join("")}</g>
    <rect x="${X}" y="${TOP}" width="${W}" height="${BOT - TOP}" stroke="#DCE7F5" stroke-width="1.6" fill="none"/>
    <g class="g2u2x-so-tags"></g>
  </svg>`;
  const gc = lab.q<SVGGElement>(".g2u2x-so-c"), rb = lab.q<SVGRectElement>(".g2u2x-so-b"), ra = lab.q<SVGRectElement>(".g2u2x-so-a"), tags = lab.q<SVGGElement>(".g2u2x-so-tags");
  const born: Record<string, number> = { d: 0 };
  const paint = (): void => {
    const ya = TOP, yb = TOP + S.a, yc = yb + S.b, yd = yc + S.c;
    ra.setAttribute("height", S.a.toFixed(1));
    rb.setAttribute("y", yb.toFixed(1));
    rb.setAttribute("height", S.b.toFixed(1));
    let c = `<rect x="${X}" y="${yc.toFixed(1)}" width="${W}" height="${S.c.toFixed(1)}" fill="#C9A77E"/>`;
    for (let i = 0; i < 16; i++) { const px = X + 10 + ((i * 37) % (W - 20)), py = yc + 8 + ((i * 23) % Math.max(1, S.c - 14)); if (S.c > 16) c += `<path d="M${px} ${py.toFixed(1)} l7 -5 l6 4 l-3 7 l-8 1 Z" fill="#8E8A86" stroke="#5F5B58" stroke-width="1"/>`; }
    gc.innerHTML = c;
    f.stage.classList.toggle("green", S.a > 20);
    const row = (key: string, y0: number, h: number, name: string): string => (h < 14 ? "" : `<path d="M${X + W + 4} ${(y0 + h / 2).toFixed(1)} h10" stroke="${G.line}" stroke-width="1.4"/>${label(X + W + 18, y0 + h / 2 + 4, name, { anchor: "start", size: 12.5 })}${born[key] !== undefined ? `<circle cx="${X + W + 176}" cy="${(y0 + h / 2).toFixed(1)}" r="9" fill="${G.gold}"/>${label(X + W + 176, y0 + h / 2 + 4.5, String(born[key] + 1), { size: 12.5, fill: "#3A2A00" })}` : ""}`);
    tags.innerHTML = row("a", ya, S.a, "식물이 자랄 수 있는 층") + row("b", yb, S.b, "진흙 등이 쌓인 층") + row("c", yc, S.c, "암석 조각과 모래 층") + row("d", yd, BOT - yd, "풍화를 받지 않은 암석")
      + label(340, 22, "생긴 차례", { anchor: "end", size: 12, fill: G.dim, weight: 600 });
    host.dataset.g2Soil = String(stage);
  };
  const fail = (t: string): void => {
    haptic(HAPTIC.wrong);
    host.dataset.g2Miss = String(Number(host.dataset.g2Miss ?? 0) + 1);
    f.say(t);
  };
  const weather = gPick("weather", "풍화가 계속되게 두기", "오랜 시간이 흐른다"), rainP = gPick("rain", "비 내리기", "빗물이 땅속으로 스며든다");
  const hintNow = (): void => lab.hint(stage < 2 ? "weather" : "rain");
  weather.el.addEventListener("click", () => {
    if (busy || lab.finished() || stage >= 3) return;
    if (stage === 2) return fail("겉의 흙은 이미 충분히 고와요. 이제 <b>비</b>가 내리면 어떻게 되는지 보세요.");
    haptic(HAPTIC.tap);
    busy = true;
    if (stage === 0) {
      born.c = 1;
      bvTween(tm, 1300, (t) => { S.c = 84 * t; paint(); }, () => {
        stage = 1; busy = false; f.pips(1);
        f.say("암석이 풍화되어 <b>암석 조각과 모래</b>가 됐어요. 이다음에는 무슨 일이 일어날까요?");
        hintNow();
      });
    } else {
      born.a = 2;
      bvTween(tm, 1300, (t) => { S.a = 36 * t; S.c = 84 - 30 * t; paint(); }, () => {
        stage = 2; busy = false; f.pips(1);
        f.say("위쪽이 더 잘게 부서져 <b>식물이 자랄 수 있는 층</b>이 생겼어요. 이다음에는 무슨 일이 일어날까요?");
        hintNow();
      });
    }
  });
  rainP.el.addEventListener("click", () => {
    if (busy || lab.finished() || stage >= 3) return;
    if (stage < 2) {
      f.stage.classList.add("raining");
      tm.later(() => f.stage.classList.remove("raining"), 900);
      return fail(stage === 0 ? "빗물이 단단한 암석 위를 흘러가요. 아직 <b>부서진 것이 없어서</b> 층이 생기지 않아요." : "빗물이 스며들지만 씻겨 내려갈 <b>고운 흙</b>이 아직 없어요. 풍화가 더 진행돼야 해요.");
    }
    haptic(HAPTIC.tap);
    busy = true;
    born.b = 3;
    f.stage.classList.add("raining");
    bvTween(tm, 1500, (t) => { S.b = 30 * t; S.a = 36 - 6 * t; S.c = 54 - 6 * t; paint(); }, () => {
      f.stage.classList.remove("raining");
      stage = 3; busy = false; f.pips(2);
      haptic(HAPTIC.correct);
      f.say("빗물에 녹은 물질과 진흙이 아래로 내려가 겉흙 아래에 <b>새 층</b>으로 쌓였어요. 번호를 보고 답해 보세요.");
      tm.later(() => lab.ask("네 층 가운데 <b>가장 나중에</b> 만들어진 층은?", ["위에서 둘째 층", "맨 위의 층", "맨 아래의 암석"], "빗물에 녹은 물질과 진흙이 <b>겉흙 아래</b>로 내려가 쌓였어요.", () =>
        lab.finish("토양은 암석이 오랫동안 풍화되어 만들어져요. 암석 조각과 모래 층, 식물이 자랄 수 있는 층이 차례로 생기고, 마지막에 그 사이에 진흙 등이 쌓인 층이 생겨요. <b>생긴 차례와 쌓여 있는 차례는 달라요</b>."),
      ), 1100);
    });
  });
  paint();
  f.slot.setControls(gGrid(1, weather, rainP));
  f.say("지표에 드러난 <b>단단한 암석</b>이에요. 이 암석이 식물이 자라는 토양이 되기까지 일어날 일을 차례대로 골라 보세요.");
  api.setCTA("토양을 만들어 보세요", { enabled: false });
  hintNow();
  return lab.cleanup;
};
