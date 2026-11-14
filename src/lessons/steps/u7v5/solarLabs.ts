// 일식을 자세히 보는 두 랩(u7l6의 셋째, 넷째 랩). 같은 무대를 쓴다: 위에서 내려다본 태양(왼쪽), 달, 지구(오른쪽, 크게).
//   u7SolarWhereLab: 달은 삭에 서 있고, 지구 위의 사람을 옮긴다. 그림자의 짙은 곳, 옅은 곳, 그림자 밖에서 본 태양을 견준다.
//                    책 253쪽 그림 Ⅶ-10의 두 설명(달이 태양 전체를 가리는 지역, 일부를 가리는 지역)과 "스스로 확인하기" 3번.
//   u7SolarSideLab : 사람은 그림자가 지나가는 곳에 서 있고, 달을 궤도를 따라 움직인다. 태양이 어느 쪽부터 가려지고 드러나는지 본다.
//                    (책에 글로는 없다. 달이 도는 방향에서 따라 나오는 관찰이고, 우리나라처럼 북반구에서 볼 때의 방향이다.)
// 그림자와 "여기서 본 태양"은 eclipseKit의 같은 계산에서 나온다. 책처럼 본그림자, 반그림자라는 말은 쓰지 않는다(짙은 곳, 옅은 곳).
import { el, clamp } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCapture, bvSvgPoint, bvTimers, bvTween } from "../bio6/b6Lab";
import { u7Frame, u7Goals, u7Dev } from "./kit";
import { SOLAR, solarMoonAt, groundAt, solarView, solarZones, shadowPolys, pts, ecDefs, stars, sunInsetSvg, paintSunInset, type SolarView } from "./eclipseKit";

interface LabStep {
  title: string;
  cta?: string;
}

const RAD = Math.PI / 180;
const { S, Rs, E, Re, rm } = SOLAR;

interface Scene {
  svg: SVGSVGElement;
  pill: HTMLElement;
  /** 달과 사람의 자리를 정하고 그림을 다시 그린다. 그곳에서 본 태양을 돌려준다. */
  set: (moonDeg: number, obsDeg: number) => SolarView;
}

/** 무대를 놓는다. p는 그라데이션 id 접두, drag는 끌 수 있는 것(둘레에 고리가 뜬다). */
function solarScene(stage: HTMLElement, p: string, drag: "moon" | "person", extra = ""): Scene {
  stage.innerHTML = `<svg viewBox="0 0 346 230" class="u7x-ecl-svg" role="img" aria-label="위에서 내려다본 태양, 달, 지구. 달의 그림자가 지구에 닿아 있다">
    ${ecDefs(p)}
    ${stars([[96, 200], [208, 24], [226, 206], [44, 196], [190, 52]])}
    <circle cx="${S.x}" cy="${S.y}" r="${Rs * 1.9}" fill="url(#${p}glow)"/>
    <circle cx="${S.x}" cy="${S.y}" r="${Rs}" fill="url(#${p}sun)"/>
    <polygon class="u7x-ec-faint" fill="#AFC3EA" opacity=".17"/>
    <polygon class="u7x-ec-dark" fill="#070B16" opacity=".94"/>
    <circle cx="${E.x}" cy="${E.y}" r="${Re}" fill="url(#${p}earth)"/>
    <rect x="${E.x}" y="0" width="30" height="230" fill="#06101f" opacity=".6"/>
    <path class="u7x-ec-zp" fill="none" stroke="#0A1730" stroke-width="7" opacity=".62"/>
    <path class="u7x-ec-zt" fill="none" stroke="#02040A" stroke-width="7" stroke-linecap="round"/>
    ${extra}
    <g class="u7x-ec-moon">
      ${drag === "moon" ? '<circle r="24" fill="#9DBBF0" opacity=".2" class="u7x-ecl-halo"/>' : ""}
      <circle r="${rm}" fill="#2A3448"/>
      <path d="M0 ${-rm}A${rm} ${rm} 0 0 0 0 ${rm}Z" fill="url(#${p}moon)"/>
    </g>
    <g class="u7x-ec-person">
      ${drag === "person" ? '<circle cx="-8" r="14" fill="#fff" opacity=".2" class="u7x-ecl-halo"/>' : ""}
      <path d="M0 -3L-5 0L0 3M-5 0H-11M-9 -4.5L-8 0L-9 4.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="-14.6" r="3.8" fill="#fff"/>
    </g>
    <text class="u7x-st u7x-ec-who" text-anchor="end">사람</text>
    <text class="u7x-st sun" x="6" y="166">태양</text>
    <text class="u7x-st u7x-ec-moonname" text-anchor="middle">달</text>
    <text class="u7x-st" x="300" y="140" text-anchor="middle">지구</text>
    <text class="u7x-st dim" x="10" y="220">위에서 내려다본 모습</text>
  </svg>`;
  const svg = stage.querySelector("svg") as SVGSVGElement;
  const q = <T extends Element>(sel: string): T => svg.querySelector(sel) as T;
  const faint = q<SVGPolygonElement>(".u7x-ec-faint");
  const dark = q<SVGPolygonElement>(".u7x-ec-dark");
  const zp = q<SVGPathElement>(".u7x-ec-zp");
  const zt = q<SVGPathElement>(".u7x-ec-zt");
  const moonG = q<SVGGElement>(".u7x-ec-moon");
  const moonName = q<SVGTextElement>(".u7x-ec-moonname");
  const person = q<SVGGElement>(".u7x-ec-person");
  const who = q<SVGTextElement>(".u7x-ec-who");
  const pill = el("div", { class: "bv-pill u7x-pill", text: "" });
  const inset = el("div", { class: "u7x-inset u7x-ec-inset", attrs: { "aria-hidden": "true" } });
  inset.innerHTML = `${sunInsetSvg(p + "i")}<span>여기서 본 태양</span>`;
  stage.append(pill, inset);

  // 지구 가장자리 안쪽의 띠(그림자가 닿은 곳). 각 a0에서 a1까지
  const arc = (a0: number, a1: number): string => {
    const r = Re - 3.5;
    const at = (a: number): string => `${(E.x - r * Math.cos(a * RAD)).toFixed(1)} ${(E.y - r * Math.sin(a * RAD)).toFixed(1)}`;
    return `M${at(a0)}A${r} ${r} 0 0 1 ${at(a1)}`;
  };

  return {
    svg,
    pill,
    set(moonDeg, obsDeg) {
      const M = solarMoonAt(moonDeg);
      const sh = shadowPolys(S, Rs, M, rm, 280);
      faint.setAttribute("points", pts(sh.faint));
      dark.setAttribute("points", pts(sh.dark));
      const z = solarZones(M, -62, 62);
      zp.setAttribute("d", z.partial ? arc(z.partial[0], z.partial[1]) : "");
      zt.setAttribute("d", z.total ? arc(z.total[0], z.total[1]) : "");
      moonG.setAttribute("transform", `translate(${M.x.toFixed(1)} ${M.y.toFixed(1)})`);
      // 달의 이름표: 사람을 옮기는 랩에서는 달의 왼쪽, 달을 옮기는 랩에서는 달의 아래(방향 화살표의 글과 떨어지게)
      moonName.setAttribute("x", (drag === "moon" ? M.x - 4 : M.x - rm - 12).toFixed(1));
      moonName.setAttribute("y", (drag === "moon" ? M.y + rm + 22 : M.y + 4.5).toFixed(1));
      const P = groundAt(obsDeg);
      person.setAttribute("transform", `translate(${P.x.toFixed(1)} ${P.y.toFixed(1)}) rotate(${obsDeg.toFixed(1)})`);
      who.setAttribute("x", (P.x - 24 * Math.cos(obsDeg * RAD)).toFixed(1));
      who.setAttribute("y", (P.y - 24 * Math.sin(obsDeg * RAD) + 4.5).toFixed(1));
      const v = solarView(P, M);
      paintSunInset(inset, v);
      return v;
    },
  };
}

// ══════════ 일식은 어디에서 보일까 ══════════
const OBS_MIN = -50;
const OBS_MAX = 24; // 이보다 위는 오른쪽 위 창에 가려진다

export const u7SolarWhereLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = u7Frame(host, { title: s.title, steps: 3, cls: "u7x-ecl", api });
  const doneCta = s.cta ?? "다음 실험으로";
  const tm = bvTimers();
  const sc = solarScene(f.stage, "sw-", "person", `<text class="u7x-st dim" x="150" y="176" text-anchor="middle">달의 그림자</text>`);

  const goalsUi = u7Goals(1, [
    { id: "total", name: "그림자의 가장 짙은 곳에 서기", sub: "태양이 어떻게 보일까요" },
    { id: "partial", name: "그림자의 옅은 곳에 서기", sub: "태양이 어떻게 보일까요" },
    { id: "none", name: "그림자 밖에 서기", sub: "태양이 어떻게 보일까요" },
  ]);
  const FOUND = { total: "태양이 다 가려져요. 개기일식", partial: "태양의 일부만 가려져요. 부분일식", none: "태양이 그대로 보여요" };
  const SAY = {
    total: "가장 짙은 곳에서는 달이 태양을 <b>모두</b> 가려요. <b>개기일식</b>이에요.",
    partial: "옅은 곳에서는 달이 태양의 <b>일부</b>만 가려요. <b>부분일식</b>이에요.",
    none: "그림자 밖에서는 같은 시각에도 태양이 <b>그대로</b> 보여요.",
  };
  const PILL = { total: "개기일식", partial: "부분일식", none: "가려지지 않아요" };
  f.slot.setControls(el("div", { class: "u7x-cap", text: "세 곳에 서서 태양을 올려다봐요" }), goalsUi.el);
  f.say("지구 위의 <b>사람</b>을 끌어 그림자 안팎으로 옮겨요. 오른쪽 위 창이 그곳에서 본 태양이에요.");
  f.pips(1);
  api.setCTA("세 곳에서 태양을 봐요", { enabled: false });
  host.dataset.u7Phase = "play";
  host.dataset.u7Found = "0";

  let obs = -46;
  let dragging = false;
  let phase: "play" | "ask" | "done" = "play";

  function paint(): SolarView {
    const v = sc.set(0, obs);
    sc.pill.textContent = PILL[v.kind];
    host.dataset.u7Kind = v.kind;
    return v;
  }

  /** 사람이 한 자리에 섰다(손을 뗐다): 그 자리에서 본 것을 적는다. */
  function settle(): void {
    const v = paint();
    if (phase !== "play") return;
    if (goalsUi.done(v.kind, FOUND[v.kind])) {
      haptic(HAPTIC.ctaUnlock);
      host.dataset.u7Found = String(goalsUi.count());
    }
    const left = (["total", "partial", "none"] as const).filter((k) => !goalsUi.has(k));
    f.say(SAY[v.kind] + (left.length ? " 다른 곳에도 서 봐요." : ""));
    if (!left.length) tm.later(askWhere, 1900);
  }

  function askWhere(): void {
    phase = "ask";
    host.dataset.u7Phase = "ask";
    f.pips(2);
    f.say("같은 시각인데 선 곳에 따라 태양이 다르게 보였어요.");
    f.slot.ask(
      "지금 이 순간 <b>개기일식</b>을 볼 수 있는 곳은 어디일까요?",
      [{ t: "짙은 그림자가 닿은 좁은 곳", ok: true }, { t: "낮인 곳 어디서나" }, { t: "지구 어디서나" }],
      (ok) => api.recordQuiz(ok),
      { why: "달의 그림자는 지구보다 훨씬 작아 일부에만 닿아요.", onNext: conclude },
    );
  }

  function conclude(): void {
    phase = "done";
    host.dataset.u7Phase = "done";
    f.pips(3);
    f.say("사람을 다시 옮기며 세 곳을 견줘 봐도 좋아요.");
    f.slot.conclude("일식은 <b>달의 그림자가 닿은 곳</b>에서만 보여요. 가장 짙은 가운데에서는 <b>개기일식</b>, 그 둘레의 옅은 곳에서는 <b>부분일식</b>이에요.");
    api.enableCTA(doneCta);
  }

  const toObs = (e: PointerEvent): number => {
    const p = bvSvgPoint(sc.svg, e.clientX, e.clientY);
    return clamp(Math.atan2(E.y - p.y, Math.max(20, E.x - p.x)) / RAD, OBS_MIN, OBS_MAX);
  };
  sc.svg.addEventListener("pointerdown", (e) => {
    dragging = true;
    bvCapture(sc.svg, e.pointerId);
    obs = toObs(e);
    paint();
  });
  sc.svg.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    obs = toObs(e);
    paint();
  });
  const end = (): void => {
    if (!dragging) return;
    dragging = false;
    // 짙은 곳은 좁다. 가까이에 놓으면 한가운데에 선다
    if (Math.abs(obs) < 6 && obs !== 0) {
      const from = obs;
      bvTween(tm, 200, (t) => {
        obs = from * (1 - t);
        paint();
      }, settle);
    } else settle();
  };
  sc.svg.addEventListener("pointerup", end);
  sc.svg.addEventListener("pointercancel", end);
  // 검사용: 사람을 주어진 각(도)에 세운다
  u7Dev(host, {
    at: (deg: number) => {
      obs = clamp(deg, OBS_MIN, OBS_MAX);
      settle();
    },
  });

  paint();
  return () => tm.clear();
};

// ══════════ 태양은 어느 쪽부터 가려질까 ══════════
const MOON_MAX = 13;

export const u7SolarSideLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = u7Frame(host, { title: s.title, steps: 3, cls: "u7x-ecl", api });
  const doneCta = s.cta ?? "다음 실험으로";
  const tm = bvTimers();
  const sc = solarScene(
    f.stage,
    "ss-",
    "moon",
    `<g fill="none" stroke="#9DBBF0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".9">
       <path d="M100 62Q94 82 96 100"/><path d="M91 93l5 8 6-7"/>
     </g>
     <text class="u7x-st dim" x="74" y="54" text-anchor="middle">달이 도는 방향</text>`,
  );

  const goalsUi = u7Goals(1, [
    { id: "in", name: "태양이 가려지기 시작할 때", sub: "어느 쪽부터 가려질까요" },
    { id: "total", name: "태양이 모두 가려질 때", sub: "달을 더 움직여 봐요" },
    { id: "out", name: "태양이 다시 보이기 시작할 때", sub: "어느 쪽부터 보일까요" },
  ]);
  f.slot.setControls(el("div", { class: "u7x-cap", text: "달을 화살표 방향으로 끝까지 움직여요" }), goalsUi.el);
  f.pips(1);
  api.setCTA("먼저 예상해 봐요", { enabled: false });
  host.dataset.u7Found = "0";

  let moon = MOON_MAX; // 양수면 아직 태양 앞에 오기 전(무대의 위쪽)
  let dragging = false;
  let phase: "predict" | "play" | "ask" | "done" = "predict";
  let guess = "";

  function paint(): void {
    const v = sc.set(moon, 0);
    const side = v.off > 0 ? "오른쪽" : "왼쪽";
    sc.pill.textContent = v.kind === "total" ? "개기일식" : v.kind === "partial" ? `부분일식, ${side}이 가려졌어요` : "가려지지 않았어요";
    host.dataset.u7Kind = v.kind;
    if (phase !== "play") return;
    if (v.kind === "partial" && moon > 0 && goalsUi.done("in", "오른쪽부터 가려져요")) {
      mark();
      f.say(`${guess === "오른쪽부터" ? "예상대로" : "예상과 달리"} 태양의 <b>오른쪽</b>부터 가려져요. 달을 더 움직여요.`);
    }
    if (v.kind === "total" && goalsUi.done("total", "개기일식이에요")) {
      mark();
      f.say("달이 태양을 <b>모두</b> 가렸어요. 달을 같은 방향으로 더 움직여요.");
    }
    if (v.kind === "partial" && moon < 0 && goalsUi.has("total") && goalsUi.done("out", "오른쪽부터 다시 보여요")) {
      mark();
      f.say("지구에서 보면 달이 왼쪽으로 비켜나 태양의 <b>오른쪽</b>부터 다시 보여요.");
    }
  }

  function mark(): void {
    haptic(HAPTIC.ctaUnlock);
    host.dataset.u7Found = String(goalsUi.count());
    if (goalsUi.count() === 3) tm.later(askSide, 1900);
  }

  function play(): void {
    phase = "play";
    host.dataset.u7Phase = "play";
    f.slot.showControls();
    api.setCTA("달을 끝까지 움직여요", { enabled: false });
    f.say("<b>달</b>을 화살표 방향으로 천천히 끌어요. 오른쪽 위 창이 지구의 사람이 본 태양이에요.");
  }

  function askSide(): void {
    phase = "ask";
    host.dataset.u7Phase = "ask";
    f.pips(2);
    f.say("달이 태양 앞을 지나갔어요. 본 것을 떠올려 답해 보세요.");
    f.slot.ask(
      "개기일식이 끝난 뒤 태양은 <b>어느 쪽부터</b> 다시 보였나요?",
      [{ t: "오른쪽부터", ok: true }, { t: "왼쪽부터" }, { t: "한꺼번에 전부" }],
      (ok) => api.recordQuiz(ok),
      { why: "하늘에서 달이 태양 앞을 오른쪽에서 왼쪽으로 지나가요.", onNext: conclude },
    );
  }

  function conclude(): void {
    phase = "done";
    host.dataset.u7Phase = "done";
    f.pips(3);
    f.say("달을 다시 움직이며 확인해도 좋아요. 우리나라(북반구)에서 볼 때의 방향이에요.");
    f.slot.conclude("지구에서 보면 달은 태양 앞을 <b>오른쪽에서 왼쪽으로</b> 지나가요. 그래서 일식 때 태양은 <b>오른쪽부터</b> 가려지고, 오른쪽부터 다시 보여요.");
    api.enableCTA(doneCta);
  }

  const toMoon = (e: PointerEvent): number => {
    const p = bvSvgPoint(sc.svg, e.clientX, e.clientY);
    return clamp(Math.asin(clamp((E.y - p.y) / SOLAR.orbit, -1, 1)) / RAD, -MOON_MAX, MOON_MAX);
  };
  sc.svg.addEventListener("pointerdown", (e) => {
    if (phase === "predict") return;
    dragging = true;
    bvCapture(sc.svg, e.pointerId);
    moon = toMoon(e);
    paint();
  });
  sc.svg.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const next = toMoon(e);
    // 다 가려지는 자리는 좁다. 빨리 끌어 그 자리를 건너뛰어도 한 줄인 순간을 한 번 그린다
    if (moon * next < 0) {
      moon = 0;
      paint();
    }
    moon = next;
    paint();
  });
  const end = (): void => {
    if (!dragging) return;
    dragging = false;
    // 다 가려지는 자리는 좁다. 가까이에 놓으면 한 줄에 딱 선다
    if (Math.abs(moon) < 2.4 && moon !== 0) {
      const from = moon;
      bvTween(tm, 200, (t) => {
        moon = from * (1 - t);
        paint();
      });
    }
  };
  sc.svg.addEventListener("pointerup", end);
  sc.svg.addEventListener("pointercancel", end);
  // 검사용: 달을 주어진 각(도)에 놓는다(양수는 태양 앞에 오기 전)
  u7Dev(host, {
    moon: (deg: number) => {
      moon = clamp(deg, -MOON_MAX, MOON_MAX);
      paint();
    },
  });

  paint();
  host.dataset.u7Phase = "predict";
  f.say("달이 <b>화살표 방향</b>으로 돌아 태양 앞을 지나가요. 먼저 예상해 봐요.");
  f.slot.ask(
    "지구에서 볼 때 태양은 <b>어느 쪽부터</b> 가려질까요?",
    [{ t: "오른쪽부터" }, { t: "왼쪽부터" }, { t: "위쪽부터" }],
    () => undefined,
    { predict: true, onNext: play },
  );
  // 고른 보기를 적어 둔다(판정은 하지 않는다. 답은 달을 움직이면 보인다)
  f.slot.qBox.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest(".bv-choice");
    if (b && phase === "predict" && !guess) guess = b.textContent?.trim() ?? "";
  }, true);

  return () => tm.clear();
};
