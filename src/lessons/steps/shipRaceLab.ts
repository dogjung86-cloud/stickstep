// shipRaceLab — 북동 항로 배 경주 랩(사회 Ⅵ L7). 극지방 소단원의 소형 "비교 판독" 랩.
//   · 교과서 근거(두 책 공통 수치): 부산 → 로테르담, 남방 항로(기존) 약 20,000km·약 40일 vs
//     북동 항로 약 13,000km·약 30일(약 35%·10일 단축) — 미래엔 123쪽·비상 3-1.
//   · 지도는 equirect 세계 크롭(실데이터 WORLD_LAND_PATH — 교과서 항로 지도도 직사각 지도).
//     북동 항로는 베링 해협(경도 약 190° 언랩)에서 날짜변경선을 넘는다 — x>1000 복제 밴드
//     (gen-worldmap 태평양 밴드)가 있어 경로가 지도 밖으로 안 끊긴다. 헤어핀(동진→서진)은
//     실제 항로 그대로다.
//   · 조작: "출발!" → 두 배가 동시에 출발(SMIL animateMotion — rAF 없는 수학 랩 문법,
//     프리뷰 프리즈 환경 면역). 도착 판정은 setTimeout 체인. 북동 9초 · 남방 12초(30일:40일 비).
//     보트 화면 속도 ≈ 40px/s 안팎 — 유체가 아닌 판독 대상 마커라 허용(highland 관행 준거).
//   · 판정(msn 문법): "북동 항로가 먼저 도착한 까닭" — "북쪽 바다에선 배가 빨라서"가 오개념.
//     빙하가 녹는 시기에만 열린다는 조건(교과서 서술)을 결론 문구에 병기.
// 목표: ① 경주 출발 ② 북동 항로 도착 관찰 ③ 판정.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import { WORLD_LAND_PATH } from "../../ui/worldMap.generated";
import type { StepRenderer } from "../types";

interface ShipRaceStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

// 크롭(equirect 1000×500): lon -7.9~192.6 · lat 79.2~-14.4 — 로테르담~베링 해협+남방 항로 전체.
const CX0 = 478;
const CY0 = 30;
const CW = 557;
const CH = 260;
const X = (lon: number): number => ((lon + 180) / 360) * 1000;
const Y = (lat: number): number => ((90 - lat) / 180) * 500;

// 항로 웨이포인트([lon,lat] — 전부 계산 좌표, 언랩 경도. 베링 해협 -169.6°W → 190.4).
const ROUTE_SOUTH: [number, number][] = [
  [129.1, 35.1], [127.5, 33.5], [124.5, 30.5], [121.5, 25.5], [117, 18], [112, 11],
  [107, 5.5], [104.6, 1.2], [100.5, 2.8], [97, 5.5], [90, 6], [83, 5.8], [76, 7],
  [68, 10], [59, 12.5], [51.5, 12.8], [44.5, 12], [42.5, 15], [39, 20], [35.5, 26],
  [32.9, 29.5], [32.3, 31.3], [28, 33.5], [20, 35.5], [12, 37.3], [5, 37], [-2.5, 35.8],
  [-6.2, 36.5], [-9.5, 38.5], [-9.8, 43.5], [-6.5, 48.5], [-1, 50.2], [3, 51.2], [4.4, 51.9],
];
const ROUTE_NE: [number, number][] = [
  [129.1, 35.1], [130.5, 38], [132, 42], [137, 45.5], [141.5, 47.5], [146, 49.5],
  [152, 51], [157.5, 52], [163, 55], [169, 59], [176, 62.5], [183, 64.5], [190.2, 65.9],
  [187, 68.5], [181, 70], [172, 71.5], [160, 72.3], [148, 74], [135, 75.5], [120, 76.5],
  [104, 77.5], [88, 76.8], [72, 74.5], [60, 71.5], [50, 70.5], [40, 70.8], [31, 71.2],
  [25.8, 71], [18, 68.5], [10, 63.5], [5.5, 58.5], [3.5, 54], [4.4, 51.9],
];
const pathOf = (pts: [number, number][]): string =>
  pts.map(([lo, la], i) => `${i === 0 ? "M" : "L"}${X(lo).toFixed(1)} ${Y(la).toFixed(1)}`).join(" ");

const DUR_NE = 9; // 초(30일 비율)
const DUR_S = 12; // 초(40일 비율)

export const shipRaceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ShipRaceStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "start" } }, el("b", { text: "경주 출발" }), el("span", { text: "동시에" })),
    el("div", { class: "pn-badge world", dataset: { g: "ne" } }, el("b", { text: "북동 항로" }), el("span", { text: "먼저 도착?" })),
    el("div", { class: "pn-badge world", dataset: { g: "why" } }, el("b", { text: "빠른 이유" }), el("span", { text: "판정" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "부산에서 로테르담(유럽)까지 — 배 두 척이 <b>남방 항로(기존)</b>와 <b>북동 항로(북극해)</b>로 동시에 출발해요. 어느 배가 먼저 도착할까요? <b>출발</b>을 눌러 확인!",
  });
  host.append(goalChips, helper);

  // ---- 지도(SVG) ----
  const iceY = Y(66.5);
  const mapBox = el("div", { class: "shr-map" });
  mapBox.innerHTML = `
  <svg viewBox="${CX0} ${CY0} ${CW} ${CH}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="부산에서 로테르담까지의 두 항로 지도 — 남방 항로(수에즈 운하)와 북동 항로(북극해)">
    <defs>
      <radialGradient id="shr-sea" cx=".5" cy=".35" r="1"><stop offset="0" stop-color="#D9EDF8"/><stop offset="1" stop-color="#B8D8EC"/></radialGradient>
      <clipPath id="shr-clip"><rect x="${CX0}" y="${CY0}" width="${CW}" height="${CH}" rx="12"/></clipPath>
    </defs>
    <g clip-path="url(#shr-clip)">
      <rect x="${CX0}" y="${CY0}" width="${CW}" height="${CH}" fill="url(#shr-sea)"/>
      <rect x="${CX0}" y="${CY0}" width="${CW}" height="${(iceY - CY0).toFixed(1)}" fill="#EAF4FB" opacity=".75"/>
      <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
      <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.45)" stroke-width=".7" fill="none" fill-rule="evenodd"/>
      <line x1="${CX0}" y1="${iceY.toFixed(1)}" x2="${CX0 + CW}" y2="${iceY.toFixed(1)}" stroke="#8AB4D8" stroke-width=".8" stroke-dasharray="3 4" opacity=".7"/>
      <text x="${CX0 + 6}" y="${(iceY - 4).toFixed(1)}" font-size="8.5" font-weight="800" fill="#5A7A96">북극권 — 얼음 바다(녹는 시기에 열려요)</text>
      <line x1="1000" y1="${CY0}" x2="1000" y2="${CY0 + CH}" stroke="#D8484C" stroke-width="1" stroke-dasharray="5 4" opacity=".6"/>
      <path d="${pathOf(ROUTE_SOUTH)}" stroke="#3F8FC8" stroke-width="2.2" stroke-dasharray="7 5" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
      <path d="${pathOf(ROUTE_NE)}" stroke="#E8590C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".92"/>
      <circle cx="${X(129.1).toFixed(1)}" cy="${Y(35.1).toFixed(1)}" r="4.2" fill="#FFFFFF" stroke="#333D4B" stroke-width="1.6"/>
      <text x="${(X(129.1) + 7).toFixed(1)}" y="${(Y(35.1) + 4).toFixed(1)}" font-size="10.5" font-weight="900" fill="#333D4B">부산</text>
      <circle cx="${X(4.4).toFixed(1)}" cy="${Y(51.9).toFixed(1)}" r="4.2" fill="#FFFFFF" stroke="#333D4B" stroke-width="1.6"/>
      <text x="${(X(4.4) + 6).toFixed(1)}" y="${(Y(51.9) + 13).toFixed(1)}" font-size="10.5" font-weight="900" fill="#333D4B">로테르담</text>
      <circle cx="${X(32.3).toFixed(1)}" cy="${Y(31.3).toFixed(1)}" r="2.6" fill="#3F8FC8"/>
      <text x="${(X(32.3) + 5).toFixed(1)}" y="${(Y(31.3) + 10).toFixed(1)}" font-size="8.5" font-weight="800" fill="#2E6E9E">수에즈 운하</text>
      <g class="shr-boat" data-boat="s">
        <animateMotion class="shr-anim-s" dur="${DUR_S}s" begin="indefinite" fill="freeze" path="${pathOf(ROUTE_SOUTH)}"/>
        <circle r="5.2" fill="#3F8FC8" stroke="#FFFFFF" stroke-width="1.8"/>
        <path d="M-2.6 0.8 L2.8 0.8 L1.6 3 L-1.6 3z" fill="#FFFFFF"/>
        <path d="M0 -4.6 L0 0 M0 -4.6 Q3.4 -3 0 -0.8" stroke="#FFFFFF" stroke-width="1.2" fill="none"/>
      </g>
      <g class="shr-boat" data-boat="ne">
        <animateMotion class="shr-anim-ne" dur="${DUR_NE}s" begin="indefinite" fill="freeze" path="${pathOf(ROUTE_NE)}"/>
        <circle r="5.2" fill="#E8590C" stroke="#FFFFFF" stroke-width="1.8"/>
        <path d="M-2.6 0.8 L2.8 0.8 L1.6 3 L-1.6 3z" fill="#FFFFFF"/>
        <path d="M0 -4.6 L0 0 M0 -4.6 Q3.4 -3 0 -0.8" stroke="#FFFFFF" stroke-width="1.2" fill="none"/>
      </g>
    </g>
    <rect x="${CX0}" y="${CY0}" width="${CW}" height="${CH}" rx="12" stroke="#D8DEE8" stroke-width="1.2"/>
  </svg>`;

  const goBtn = el("button", { class: "swapbtn pulse shr-go", attrs: { type: "button" } }, el("span", { text: "동시에 출발!" }));

  const factNe = el(
    "div",
    { class: "shr-fact ne" },
    el("b", { text: "북동 항로" }),
    el("span", { class: "shr-dist", text: "약 13,000km" }),
    el("span", { class: "shr-days", text: "약 30일" }),
    el("span", { class: "shr-tag", text: "북극해 통과" }),
  );
  const factS = el(
    "div",
    { class: "shr-fact s" },
    el("b", { text: "남방 항로(기존)" }),
    el("span", { class: "shr-dist", text: "약 20,000km" }),
    el("span", { class: "shr-days", text: "약 40일" }),
    el("span", { class: "shr-tag", text: "수에즈 운하 경유" }),
  );
  const facts = el("div", { class: "shr-facts" }, factNe, factS);

  const quizQ = el("div", { class: "msn-q", html: "북동 항로의 배가 <b>먼저 도착</b>한 까닭은 뭘까요?" });
  const optA = el("button", { class: "msn-opt", attrs: { type: "button" }, html: "북극해를 가로질러 <b>거리가 더 짧아서</b> — 약 20,000km → 약 13,000km" });
  const optB = el("button", { class: "msn-opt", attrs: { type: "button" }, html: "북쪽의 차가운 바다에서는 <b>배가 더 빨리 달릴 수 있어서</b>" });
  const quizCard = el("div", { class: "msn-quiz" }, quizQ, optA, optB);

  host.append(mapBox, goBtn, facts, quizCard);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const toastEl = el("div", { class: "rpl-toast" });
  mapBox.appendChild(toastEl);
  let toastTimer = 0;
  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  // ---- 목표 ----
  const goals = new Set<string>();
  let finished = false;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };
  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "같은 배, 다른 길 — <b>북극해를 가로지르면 약 13,000km(약 35% 단축)</b>이라 열흘을 아껴요. 다만 이 길은 <b>북극의 얼음이 녹는 시기에만</b> 지날 수 있어서, 기후변화로 얼음이 줄며 더 주목받고 있답니다.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  }

  // ---- 판정 ----
  let quizDone = false;
  optA.addEventListener("click", () => {
    if (quizDone) return;
    quizDone = true;
    optA.classList.add("ok");
    optB.classList.add("dim");
    haptic(HAPTIC.correct);
    quizQ.innerHTML = "정답! 배의 속력은 비슷해요 — <b>길이 짧았던 것</b>뿐! 지구본에서 보면 북극해 길이 유럽까지의 지름길이랍니다.";
    collect("why", "정답!");
  });
  optB.addEventListener("click", () => {
    if (quizDone) return;
    haptic(HAPTIC.wrong);
    optB.classList.add("no");
    quizQ.innerHTML = "속력의 차이가 아니에요 — 두 배는 비슷한 빠르기로 달렸어요. 팩트 카드의 <b>거리</b>를 비교해 보고 다시!";
    later(() => optB.classList.remove("no"), 700);
  });

  // ---- 경주 ----
  let racing = false;
  host.dataset.shr = "idle";
  function startRace(): void {
    if (racing) return;
    racing = true;
    host.dataset.shr = "racing";
    haptic(HAPTIC.select);
    goBtn.classList.remove("pulse");
    (goBtn.querySelector("span") as HTMLElement).textContent = "경주 중…";
    goBtn.setAttribute("disabled", "true");
    const aNe = mapBox.querySelector(".shr-anim-ne") as SVGAnimateMotionElement | null;
    const aS = mapBox.querySelector(".shr-anim-s") as SVGAnimateMotionElement | null;
    try {
      aNe?.beginElement();
      aS?.beginElement();
    } catch {
      /* SMIL 미지원 폴백 — 경주 없이 판독·판정으로 진행 */
    }
    collect("start", "출발!");
    toast("두 배가 동시에 출발했어요 — 주황(북동)과 파랑(남방)!");
    later(() => {
      host.dataset.shr = "ne-done";
      factNe.classList.add("win");
      toast("북동 항로 도착! 약 30일 — 아직 남방 항로는 인도양이에요.");
      collect("ne", "약 30일!");
      haptic(HAPTIC.correct);
    }, DUR_NE * 1000);
    later(() => {
      host.dataset.shr = "done";
      toast("남방 항로 도착 — 약 40일. 열흘 차이가 났어요!");
      racing = false;
      goBtn.removeAttribute("disabled");
      (goBtn.querySelector("span") as HTMLElement).textContent = "다시 경주";
      if (!quizCard.classList.contains("show")) {
        quizCard.classList.add("show");
        later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
      }
    }, DUR_S * 1000);
  }
  goBtn.addEventListener("click", startRace);

  api.setCTA("경주를 관찰하고 판정까지!", { enabled: false });
  return () => {
    for (const t of timers) window.clearTimeout(t);
    window.clearTimeout(toastTimer);
  };
};
