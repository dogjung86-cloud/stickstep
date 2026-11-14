// u7LunarLab: 월식을 자세히 보는 랩(u7l6의 다섯째 랩). 위에서 내려다본 지구(왼쪽), 지구의 그림자, 달.
//   달을 궤도를 따라 움직여 지구의 그림자 속으로 넣었다 뺀다. 오른쪽 위 창이 지구에서 본 달이다.
//   책 253쪽: 달의 일부가 그림자에 들어가면 부분월식, 전체가 들어가면 개기월식(붉게 보인다).
//             "스스로 확인하기" 3번(개기월식을 볼 수 있는 지역이 훨씬 넓은 까닭)을 판정으로 묻는다.
//   어느 쪽부터 가려지는지는 책에 글로는 없다. 달이 도는 방향에서 따라 나오는 관찰이다(북반구에서 볼 때 왼쪽부터).
// 그림자와 창의 그림은 eclipseKit의 같은 값(달이 가운데 선에서 벗어난 거리 h, 그 자리의 그림자 반폭 w)에서 나온다.
import { el, clamp } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCapture, bvSvgPoint, bvTimers, bvTween } from "../bio6/b6Lab";
import { u7Frame, u7Goals, u7Dev } from "./kit";
import { LUNAR, lunarMoonAt, lunarShadowHalf, lunarState, ecDefs, stars } from "./eclipseKit";

interface LabStep {
  title: string;
  cta?: string;
}

const RAD = Math.PI / 180;
const { E, Re, rm, orbit } = LUNAR;
const MOON_MAX = 19;
const IN = { cx: 44, cy: 34, r: 24 }; // 창 안의 달
const K = IN.r / rm; // 무대의 길이를 창의 길이로

export const u7LunarLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = u7Frame(host, { title: s.title, steps: 3, cls: "u7x-ecl", api });
  const doneCta = s.cta ?? "개념 정리하기";
  const tm = bvTimers();

  const xr = 346;
  const wr = lunarShadowHalf(xr - E.x);
  const shadow = `${E.x},${E.y - Re} ${xr},${(E.y - wr).toFixed(1)} ${xr},${(E.y + wr).toFixed(1)} ${E.x},${E.y + Re}`;
  // 밤인 곳에 선 두 사람(판정 때 보인다). 지구 중심에서 본 각 ±42°
  const who = (deg: number, name: string): string => {
    const x = E.x + Re * Math.cos(deg * RAD);
    const y = E.y + Re * Math.sin(deg * RAD);
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg})"><path d="M0 0H8" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="11.6" r="3.6" fill="#fff"/></g>
      <line class="u7x-lu-sight" x1="${(x + 13 * Math.cos(deg * RAD)).toFixed(1)}" y1="${(y + 13 * Math.sin(deg * RAD)).toFixed(1)}" x2="${E.x + orbit - rm - 3}" y2="${E.y}" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 4" opacity=".7"/>
      <text class="u7x-st" x="${(x + 6).toFixed(1)}" y="${(y + (deg < 0 ? -12 : 21)).toFixed(1)}" text-anchor="middle">${name}</text>`;
  };
  f.stage.innerHTML = `<svg viewBox="0 0 346 230" class="u7x-ecl-svg" role="img" aria-label="위에서 내려다본 지구와 지구의 그림자, 그림자를 지나가는 달">
    ${ecDefs("lu-")}
    <defs><clipPath id="lu-sh"><polygon points="${shadow}"/></clipPath></defs>
    ${stars([[196, 208], [150, 196], [236, 200], [170, 44], [320, 196], [282, 214]])}
    <g stroke="#FFC24E" stroke-width="2" stroke-linecap="round" opacity=".75" fill="none">
      <path d="M4 96h18m-5-4l5 4-5 4"/><path d="M4 118h18m-5-4l5 4-5 4"/><path d="M4 140h18m-5-4l5 4-5 4"/>
    </g>
    <polygon points="${shadow}" fill="#02040A" opacity=".72" stroke="#6F86B4" stroke-opacity=".55" stroke-width="1"/>
    <circle cx="${E.x}" cy="${E.y}" r="${Re}" fill="url(#lu-earth)"/>
    <path d="M${E.x} ${E.y - Re}A${Re} ${Re} 0 0 1 ${E.x} ${E.y + Re}Z" fill="#06101f" opacity=".62"/>
    <g fill="none" stroke="#9DBBF0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".9">
      <path d="M236 176Q241 158 240 142"/><path d="M234 150l6-8 6 8"/>
    </g>
    <g class="u7x-lu-people" opacity="0">${who(-42, "가")}${who(42, "나")}</g>
    <g class="u7x-lu-moon">
      <circle r="17" fill="#9DBBF0" opacity=".2" class="u7x-ecl-halo"/>
      <circle r="${rm}" fill="url(#lu-moon)"/>
    </g>
    <g clip-path="url(#lu-sh)"><circle class="u7x-lu-dim" r="${rm}" fill="#1C0B09" opacity=".86"/></g>
    <text class="u7x-st sun" x="6" y="78">햇빛</text>
    <text class="u7x-st" x="${E.x}" y="${E.y + Re + 17}" text-anchor="middle">지구</text>
    <text class="u7x-st dim u7x-lu-shname" x="142" y="${E.y + 4.5}" text-anchor="middle">지구의 그림자</text>
    <text class="u7x-st dim" x="286" y="172" text-anchor="middle">달이 도는 방향</text>
    <text class="u7x-st dim" x="10" y="220">위에서 내려다본 모습</text>
  </svg>`;
  const svg = f.stage.querySelector("svg") as SVGSVGElement;
  const moonG = svg.querySelector(".u7x-lu-moon") as SVGGElement;
  const dim = svg.querySelector(".u7x-lu-dim") as SVGCircleElement;
  const people = svg.querySelector(".u7x-lu-people") as SVGGElement;
  const pill = el("div", { class: "bv-pill u7x-pill", text: "" });
  const inset = el("div", { class: "u7x-inset u7x-ec-inset", attrs: { "aria-hidden": "true" } });
  inset.innerHTML = `<svg viewBox="0 0 88 88">
    <defs><clipPath id="lu-im"><circle cx="${IN.cx}" cy="${IN.cy}" r="${IN.r}"/></clipPath></defs>
    <rect width="88" height="88" fill="#070d1a"/>
    <circle cx="${IN.cx}" cy="${IN.cy}" r="${IN.r}" fill="#EFE8D0"/>
    <circle cx="${IN.cx - 8}" cy="${IN.cy - 6}" r="5" fill="#D6CDAE"/><circle cx="${IN.cx + 9}" cy="${IN.cy + 7}" r="6.5" fill="#D6CDAE"/><circle cx="${IN.cx + 5}" cy="${IN.cy - 12}" r="3" fill="#D6CDAE"/>
    <g clip-path="url(#lu-im)"><circle class="u7x-lu-ish" cy="${IN.cy}" fill="#1C0B09" opacity=".9"/></g>
    <circle class="u7x-lu-red" cx="${IN.cx}" cy="${IN.cy}" r="${IN.r}" fill="#C24A2C" opacity="0"/>
  </svg><span>지구에서 본 달</span>`;
  const ish = inset.querySelector(".u7x-lu-ish") as SVGCircleElement;
  const red = inset.querySelector(".u7x-lu-red") as SVGCircleElement;
  f.stage.append(pill, inset);

  const goalsUi = u7Goals(1, [
    { id: "in", name: "달의 일부를 그림자 속으로", sub: "어느 쪽부터 가려질까요" },
    { id: "total", name: "달 전체를 그림자 속으로", sub: "달을 더 움직여 봐요" },
    { id: "out", name: "달이 그림자에서 나올 때", sub: "어느 쪽부터 밝아질까요" },
  ]);
  f.slot.setControls(el("div", { class: "u7x-cap", text: "달을 화살표 방향으로 끝까지 움직여요" }), goalsUi.el);
  f.pips(1);
  api.setCTA("먼저 예상해 봐요", { enabled: false });
  host.dataset.u7Found = "0";

  let moon = MOON_MAX; // 양수면 아직 그림자에 들기 전(무대의 아래쪽)
  let dragging = false;
  let phase: "predict" | "play" | "ask" | "done" = "predict";
  let guess = "";

  function paint(): void {
    const M = lunarMoonAt(moon);
    const st = lunarState(moon);
    moonG.setAttribute("transform", `translate(${M.x.toFixed(1)} ${M.y.toFixed(1)})`);
    dim.setAttribute("cx", M.x.toFixed(1));
    dim.setAttribute("cy", M.y.toFixed(1));
    dim.setAttribute("fill", st.kind === "total" ? "#8E2C17" : "#1C0B09");
    // 창: 달은 가운데에 두고 그림자(둥근 면)를 옮긴다. 달이 그림자의 오른쪽에 있으면 그림자는 달의 왼쪽에 있다.
    ish.setAttribute("cx", (IN.cx - st.h * K).toFixed(2));
    ish.setAttribute("r", (st.w * K).toFixed(2));
    red.setAttribute("opacity", st.kind === "total" ? ".82" : "0");
    const side = st.h > 0 ? "왼쪽" : "오른쪽";
    pill.textContent = st.kind === "total" ? "개기월식, 붉은 달" : st.kind === "partial" ? `부분월식, ${side}이 가려졌어요` : "가려지지 않았어요";
    host.dataset.u7Kind = st.kind;
    if (phase !== "play") return;
    if (st.kind === "partial" && moon > 0 && goalsUi.done("in", "왼쪽부터 가려져요. 부분월식")) {
      mark();
      f.say(`${guess === "왼쪽부터" ? "예상대로" : "예상과 달리"} 달의 <b>왼쪽</b>부터 가려져요. <b>부분월식</b>이에요.`);
    }
    if (st.kind === "total" && goalsUi.done("total", "붉게 보여요. 개기월식")) {
      mark();
      f.say("달 <b>전체</b>가 그림자에 들어가 붉게 보여요. <b>개기월식</b>이에요.");
    }
    if (st.kind === "partial" && moon < 0 && goalsUi.has("total") && goalsUi.done("out", "왼쪽부터 다시 밝아져요")) {
      mark();
      f.say("달이 그림자를 빠져나오며 <b>왼쪽</b>부터 다시 밝아져요.");
    }
  }

  function mark(): void {
    haptic(HAPTIC.ctaUnlock);
    host.dataset.u7Found = String(goalsUi.count());
    if (goalsUi.count() === 3) tm.later(askWhere, 1900);
  }

  function play(): void {
    phase = "play";
    host.dataset.u7Phase = "play";
    f.slot.showControls();
    api.setCTA("달을 끝까지 움직여요", { enabled: false });
    f.say("<b>달</b>을 화살표 방향으로 천천히 끌어요. 오른쪽 위 창이 지구에서 본 달이에요.");
  }

  function askWhere(): void {
    phase = "ask";
    host.dataset.u7Phase = "ask";
    f.pips(2);
    // 달을 개기월식 자리에 세우고, 밤인 곳의 두 사람을 보여 준다
    const from = moon;
    bvTween(tm, 260, (t) => {
      moon = from * (1 - t);
      paint();
    });
    people.setAttribute("opacity", "1");
    svg.querySelector(".u7x-lu-shname")?.setAttribute("opacity", "0"); // 두 사람의 눈길과 겹치지 않게 이름표를 걷는다
    f.say("밤인 곳에 선 <b>가</b>와 <b>나</b>가 같은 달을 올려다보고 있어요.");
    f.slot.ask(
      "<b>개기월식</b>이 일어나는 동안 이 달을 볼 수 있는 곳은 어디일까요?",
      [{ t: "달이 뜬 밤인 곳 어디서나", ok: true }, { t: "그림자가 닿은 좁은 곳만" }, { t: "낮인 곳 어디서나" }],
      (ok) => api.recordQuiz(ok),
      { why: "달 자체가 어두워져서 달이 보이는 곳 어디서나 똑같이 보여요.", onNext: conclude },
    );
  }

  function conclude(): void {
    phase = "done";
    host.dataset.u7Phase = "done";
    f.pips(3);
    f.say("달을 다시 움직이며 확인해도 좋아요. 왼쪽, 오른쪽은 우리나라(북반구)에서 볼 때예요.");
    f.slot.conclude("달이 <b>지구의 그림자</b>에 일부만 들면 <b>부분월식</b>, 전부 들면 <b>개기월식</b>이에요. 달은 왼쪽부터 가려지고, 밤인 곳 어디서나 볼 수 있어요.");
    api.enableCTA(doneCta);
  }

  const toMoon = (e: PointerEvent): number => {
    const p = bvSvgPoint(svg, e.clientX, e.clientY);
    return clamp(Math.asin(clamp((p.y - E.y) / orbit, -1, 1)) / RAD, -MOON_MAX, MOON_MAX);
  };
  svg.addEventListener("pointerdown", (e) => {
    if (phase === "predict" || phase === "ask") return;
    dragging = true;
    bvCapture(svg, e.pointerId);
    moon = toMoon(e);
    paint();
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    moon = toMoon(e);
    paint();
  });
  const end = (): void => {
    dragging = false;
  };
  svg.addEventListener("pointerup", end);
  svg.addEventListener("pointercancel", end);
  // 검사용: 달을 주어진 각(도)에 놓는다(양수는 그림자에 들기 전)
  u7Dev(host, {
    moon: (deg: number) => {
      moon = clamp(deg, -MOON_MAX, MOON_MAX);
      paint();
    },
  });

  paint();
  host.dataset.u7Phase = "predict";
  f.say("달이 <b>화살표 방향</b>으로 돌아 지구의 그림자로 들어가요. 먼저 예상해 봐요.");
  f.slot.ask(
    "지구에서 볼 때 달은 <b>어느 쪽부터</b> 가려질까요?",
    [{ t: "왼쪽부터" }, { t: "오른쪽부터" }, { t: "위쪽부터" }],
    () => undefined,
    { predict: true, onNext: play },
  );
  f.slot.qBox.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest(".bv-choice");
    if (b && phase === "predict" && !guess) guess = b.textContent?.trim() ?? "";
  }, true);

  return () => tm.clear();
};
