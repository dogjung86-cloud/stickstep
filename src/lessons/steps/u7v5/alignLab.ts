// u7AlignLab: 한 줄이 되는 두 자리와 그때 달의 위상(u7l6의 둘째 랩).
//   앞 랩(가로 3D)에서 달을 한 줄로 세워 그림자를 만들었다. 여기서는 같은 일을 위에서 내려다보며
//   "그때 지구에서 본 달은 어떤 모양인가"만 본다. 책 253쪽: 일식 때 달의 위상은 삭, 월식 때는 망.
//   달을 궤도에서 끌어 한 줄이 되는 두 자리를 찾는다. 오른쪽 위 창이 지구에서 본 달이다.
//   이름(삭, 망)은 자리를 찾은 뒤에 붙고, 판정에서 일식과 월식에 잇는다.
// 달의 자리는 삭에서 반시계로 잰 각 E(도)다. 달의 밝은 반쪽은 늘 태양(왼쪽)을 향한다.
import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCapture, bvSvgPoint, bvTimers, bvTween } from "../bio6/b6Lab";
import { u7Frame, u7Goals, u7Dev } from "./kit";
import { ecDefs, stars } from "./eclipseKit";

interface AlignStep {
  title: string;
  cta?: string;
}

const SUN = { x: 30, y: 122, r: 24 };
const EARTH = { x: 170, y: 122, r: 15 };
const ORBIT = 62;
const MOON_R = 9;
const RAD = Math.PI / 180;
const wrap = (d: number): number => ((d + 180) % 360 + 360) % 360 - 180;

/** 지구에서 본 달의 밝은 부분(중심 c, 반지름 R, E는 삭에서 잰 각). 북반구에서는 차오르는 달의 오른쪽이 밝다. */
function litPath(cx: number, cy: number, R: number, E: number): string {
  const e = ((E % 360) + 360) % 360;
  const a = e <= 180 ? e : 360 - e; // 0(삭)에서 180(망)
  const rx = Math.max(0.01, R * Math.abs(Math.cos(a * RAD)));
  // 오른쪽 반원을 위에서 아래로 그리고, 타원 호로 되돌아온다(반달보다 가늘면 오른쪽으로, 볼록하면 왼쪽으로 돈다)
  // 이우는 달(e > 180)은 같은 모양을 호출하는 쪽에서 좌우로 뒤집어 쓴다.
  return `M${cx} ${cy - R}A${R} ${R} 0 0 1 ${cx} ${cy + R}A${rx.toFixed(2)} ${R} 0 0 ${a < 90 ? 0 : 1} ${cx} ${cy - R}Z`;
}

export const u7AlignLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as AlignStep;
  const f = u7Frame(host, { title: s.title, steps: 3, cls: "u7x-ecl", api });
  const doneCta = s.cta ?? "이름 정리하기";
  const tm = bvTimers();

  f.stage.innerHTML = `<svg viewBox="0 0 346 230" class="u7x-ecl-svg" role="img" aria-label="위에서 내려다본 태양, 지구, 달. 달은 지구 둘레의 궤도 위에 있다">
    ${ecDefs("al-")}
    ${stars([[92, 48], [214, 34], [236, 204], [70, 196], [300, 150], [322, 208], [282, 118]])}
    <circle cx="${SUN.x}" cy="${SUN.y}" r="${SUN.r * 2}" fill="url(#al-glow)"/>
    <circle cx="${SUN.x}" cy="${SUN.y}" r="${SUN.r}" fill="url(#al-sun)"/>
    <g stroke="#FFC24E" stroke-width="2" stroke-linecap="round" opacity=".75" fill="none">
      <path d="M60 100h14m-5-4l5 4-5 4"/><path d="M60 122h14m-5-4l5 4-5 4"/><path d="M60 144h14m-5-4l5 4-5 4"/>
    </g>
    <line class="u7x-ecl-line" x1="${SUN.x}" y1="${SUN.y}" x2="${EARTH.x + ORBIT + 14}" y2="${EARTH.y}" stroke="#FFE08A" stroke-width="1.6" stroke-dasharray="5 5" opacity="0"/>
    <circle cx="${EARTH.x}" cy="${EARTH.y}" r="${ORBIT}" fill="none" stroke="#7C98C4" stroke-width="1.4" stroke-dasharray="3 5" opacity=".7"/>
    <circle cx="${EARTH.x}" cy="${EARTH.y}" r="${EARTH.r}" fill="url(#al-earth)"/>
    <path d="M${EARTH.x} ${EARTH.y - EARTH.r}A${EARTH.r} ${EARTH.r} 0 0 1 ${EARTH.x} ${EARTH.y + EARTH.r}Z" fill="#06101f" opacity=".62"/>
    <g class="u7x-ecl-moon">
      <circle r="17" fill="#9DBBF0" opacity=".2" class="u7x-ecl-halo"/>
      <circle r="${MOON_R}" fill="#2A3448"/>
      <path d="M0 ${-MOON_R}A${MOON_R} ${MOON_R} 0 0 0 0 ${MOON_R}Z" fill="url(#al-moon)"/>
    </g>
    <text class="u7x-st sun" x="${SUN.x}" y="${SUN.y + SUN.r + 17}" text-anchor="middle">태양</text>
    <text class="u7x-st" x="${EARTH.x}" y="${EARTH.y + EARTH.r + 16}" text-anchor="middle">지구</text>
    <text class="u7x-st dim" x="10" y="220">위에서 내려다본 모습</text>
  </svg>`;
  const svg = f.stage.querySelector("svg") as SVGSVGElement;
  const moonG = svg.querySelector(".u7x-ecl-moon") as SVGGElement;
  const line = svg.querySelector(".u7x-ecl-line") as SVGLineElement;
  const pill = el("div", { class: "bv-pill u7x-pill", text: "달을 끌어 보세요" });
  const inset = el("div", { class: "u7x-inset u7x-ec-inset", attrs: { "aria-hidden": "true" } });
  inset.innerHTML = `<svg viewBox="0 0 88 88"><rect width="88" height="88" fill="#070d1a"/><circle cx="44" cy="34" r="24" fill="#1B2436"/><path class="u7x-ecl-lit" fill="#EFE8D0"/></svg><span>지구에서 본 달</span>`;
  const lit = inset.querySelector(".u7x-ecl-lit") as SVGPathElement;
  f.stage.append(pill, inset);

  const goalsUi = u7Goals(1, [
    { id: "new", name: "태양, 달, 지구 차례로 한 줄", sub: "이때 지구에서 본 달은 어떤 모양일까요" },
    { id: "full", name: "태양, 지구, 달 차례로 한 줄", sub: "이때 지구에서 본 달은 어떤 모양일까요" },
  ]);
  f.slot.setControls(el("div", { class: "u7x-cap", text: "한 줄이 되는 자리 두 곳을 찾아요" }), goalsUi.el);
  const FIRST_SAY = "<b>달</b>을 끌어 태양, 지구와 <b>한 줄</b>이 되는 자리 두 곳을 찾아요.";
  const SAY_NEW = "달이 태양 쪽에 있어요. 밝은 면이 반대편을 향해 <b>안 보이는 삭</b>이에요.";
  const SAY_FULL = "달이 태양 반대쪽에 있어요. 밝은 면이 다 보이는 <b>망</b>(보름달)이에요.";
  f.say(FIRST_SAY);
  f.pips(1);
  api.setCTA("한 줄이 되는 자리를 찾아요", { enabled: false });
  host.dataset.u7Phase = "play";
  host.dataset.u7Found = "0";

  let E = 115; // 삭에서 반시계로 잰 각(도)
  let dragging = false;
  let phase: "play" | "ask" | "done" = "play";

  function paint(): void {
    const x = EARTH.x - ORBIT * Math.cos(E * RAD);
    const y = EARTH.y + ORBIT * Math.sin(E * RAD);
    moonG.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    const e = ((E % 360) + 360) % 360;
    lit.setAttribute("d", litPath(44, 34, 24, e));
    lit.setAttribute("transform", e > 180 ? "translate(88 0) scale(-1 1)" : "");
    const nearNew = Math.abs(wrap(e)) < 5;
    const nearFull = Math.abs(wrap(e - 180)) < 5;
    line.setAttribute("opacity", nearNew || nearFull ? ".9" : "0");
    pill.textContent = nearNew ? "한 줄! 달이 안 보여요" : nearFull ? "한 줄! 둥근 달이에요" : "달을 끌어 보세요";
    host.dataset.u7Elong = String(Math.round(e));
    if (phase !== "play") return;
    if (nearNew && goalsUi.done("new", "달이 안 보여요. 삭이에요")) found("new");
    if (nearFull && goalsUi.done("full", "둥근 달이 보여요. 망이에요")) found("full");
    // 한 줄에서 벗어나면 그 자리의 설명을 걷고 할 일로 돌아간다(그림과 글이 어긋나지 않게)
    if (!nearNew && !nearFull && goalsUi.count() < 2) {
      f.say(goalsUi.count() ? "한 곳을 찾았어요. 달을 더 끌어 한 줄이 되는 <b>다른 자리</b>도 찾아요." : FIRST_SAY);
    } else if (goalsUi.count() < 2) f.say(nearNew ? SAY_NEW : SAY_FULL);
  }

  function found(id: "new" | "full"): void {
    haptic(HAPTIC.ctaUnlock);
    host.dataset.u7Found = String(goalsUi.count());
    f.say(id === "new" ? SAY_NEW : SAY_FULL);
    if (goalsUi.count() === 2) tm.later(askSolar, 1900);
  }

  function askSolar(): void {
    phase = "ask";
    host.dataset.u7Phase = "ask";
    f.pips(2);
    f.say("한 줄이 되는 자리는 <b>삭</b>과 <b>망</b> 두 곳이었어요. 일식, 월식과 짝지어 봐요.");
    glide(0); // 묻는 자리(달이 태양과 지구 사이)를 무대에 보여 준다
    f.slot.ask(
      "달이 태양을 가리는 <b>일식</b>은 달이 어떤 위상일 때 일어날까요?",
      [{ t: "삭", ok: true }, { t: "망(보름달)" }, { t: "상현달" }],
      (ok) => api.recordQuiz(ok),
      { why: "달이 태양과 지구 사이에 있어야 태양을 가려요.", onNext: askLunar },
    );
  }

  function askLunar(): void {
    host.dataset.u7Phase = "ask2";
    glide(180);
    f.slot.ask(
      "달이 지구의 그림자에 드는 <b>월식</b>은 어떤 위상일 때 일어날까요?",
      [{ t: "망(보름달)", ok: true }, { t: "삭" }, { t: "하현달" }],
      () => undefined,
      { why: "달이 지구 뒤쪽, 태양의 반대편에 있어야 해요.", onNext: conclude },
    );
  }

  function conclude(): void {
    phase = "done";
    host.dataset.u7Phase = "done";
    f.pips(3);
    f.say("달을 다시 끌어 두 자리를 확인해도 좋아요.");
    f.slot.conclude("<b>일식</b>은 태양, 달, 지구 차례로 한 줄인 <b>삭</b>일 때, <b>월식</b>은 태양, 지구, 달 차례로 한 줄인 <b>망</b>일 때 일어나요.");
    api.enableCTA(doneCta);
  }

  function glide(to: number): void {
    const from = wrap(E - to);
    bvTween(tm, 320, (t) => {
      E = to + from * (1 - t);
      paint();
    });
  }

  const toE = (e: PointerEvent): number => {
    const p = bvSvgPoint(svg, e.clientX, e.clientY);
    return Math.atan2(p.y - EARTH.y, -(p.x - EARTH.x)) / RAD;
  };
  svg.addEventListener("pointerdown", (e) => {
    dragging = true;
    bvCapture(svg, e.pointerId);
    E = toE(e);
    paint();
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    E = toE(e);
    paint();
  });
  const end = (): void => {
    if (!dragging) return;
    dragging = false;
    // 한 줄 가까이에 놓으면 그 자리에 딱 선다
    const e = ((E % 360) + 360) % 360;
    const to = Math.abs(wrap(e)) < 14 ? 0 : Math.abs(wrap(e - 180)) < 14 ? 180 : null;
    if (to == null) return;
    const from = wrap(e - to);
    bvTween(tm, 220, (t) => {
      E = to + from * (1 - t);
      paint();
    });
  };
  svg.addEventListener("pointerup", end);
  svg.addEventListener("pointercancel", end);
  // 검사용: 달을 주어진 각(삭에서 반시계, 도)에 놓는다
  u7Dev(host, {
    elong: (deg: number) => {
      E = deg;
      paint();
    },
  });

  paint();
  return () => tm.clear();
};
