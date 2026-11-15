// [중1 Ⅳ v5] u4l3 승화 랩: 「비누막은 어떻게 될까요?」
// 책의 해 보기(유리컵에 드라이아이스를 넣고 비눗방울 용액을 적신 끈으로 컵 입구에 비누막을 만든다)를 손으로 한다.
// 견줄 대상을 하나 더 두었다: 얼음을 넣은 컵. 두 컵에 똑같이 비누막을 씌우고 같은 시간을 지켜본다.
//   얼음 컵은 막이 그대로이고 바닥에 물이 고인다. 드라이아이스 컵은 막이 부풀고 바닥에 액체가 없다.
// 조작: 두 컵에 비누막 씌우기 → 예측(어느 컵의 막이 부풀까. 정오를 매기지 않는다) → 꾹 눌러 지켜보기 → 판정 하나(두 컵의 바닥).
// 통찰 하나: 드라이아이스는 액체를 거치지 않고 바로 기체가 된다.
// 그림(2026-11-15 다시 그림, 감사 중 후보): 판정의 단서인 얼음 컵의 물을 얼음이 잠길 만큼(약 20) 맑은 물로 고이게 하고(녹으며 작아진 얼음은 물에 뜬다),
//   드라이아이스 컵 바닥은 마른 채로 둔다. 비누막은 뾰족한 천막이 아니라 둥근 반구로 부풀고 무지갯빛은 옅게. 컵은 공용 유리(u4Kit.cup).

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn } from "../bio6/b6Lab";
import { A, cup, svgOpen, u4Hold, u4Lab, u4Predict, type U4Step } from "./u4Kit";

const MY = 96; // 컵 입구의 높이
const BOT = 192; // 컵 바닥
const CUPS = { ice: 92, dry: 254 } as const; // 컵의 가운데
const HW = 50; // 입구 반폭
const BW = 43; // 바닥 반폭
const FLOOR = BOT - 4.8; // 두꺼운 바닥 위(안쪽 바닥)
const POOL = 20; // 다 녹았을 때 고인 물의 깊이
const DOME = 58; // 다 부푼 막의 높이
const NEED = 3200;
/** 비누막: 입구를 지름으로 하는 둥근 반구(높이 h). h가 0이면 입구를 가로지르는 얇은 막. */
const dome = (cx: number, h: number): string =>
  h < 0.5 ? `M${cx - HW + 1} ${MY} H${cx + HW - 1}` : `M${cx - HW + 1} ${MY} A${HW - 1} ${h.toFixed(1)} 0 0 1 ${cx + HW - 1} ${MY}`;
/** 컵 안쪽 벽의 x(높이 y에서). */
const wallX = (cx: number, y: number, side: -1 | 1): number => cx + side * (HW - 2.9 - ((HW - BW) * (y - MY)) / (BOT - MY));
/** 얼음 컵에 고인 물(깊이 d). */
function poolD(cx: number, d: number): string {
  if (d < 0.4) return "";
  const wy = FLOOR - d;
  const r = Math.min(6, d);
  const xl = wallX(cx, wy, -1), xr = wallX(cx, wy, 1);
  const bl = wallX(cx, FLOOR, -1), br = wallX(cx, FLOOR, 1);
  return `M${xl.toFixed(1)} ${wy.toFixed(1)} H${xr.toFixed(1)} L${br.toFixed(1)} ${(FLOOR - r).toFixed(1)} Q${br.toFixed(1)} ${FLOOR} ${(br - r).toFixed(1)} ${FLOOR} H${(bl + r).toFixed(1)} Q${bl.toFixed(1)} ${FLOOR} ${bl.toFixed(1)} ${(FLOOR - r).toFixed(1)} Z`;
}

export const u4DryIceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-dry" });
  const { f, tm } = lab;
  const I = CUPS.ice, D = CUPS.dry;
  const ci = cup(I, MY, BOT, HW, BW, "u4x-dry");
  const cd = cup(D, MY, BOT, HW, BW, "u4x-dry");
  const cube = (x: number, w: number, h: number): string =>
    `<g class="u4x-dry-cube"><rect x="${x}" y="${FLOOR - h}" width="${w}" height="${h}" rx="5" fill="url(#u4dCube)" stroke="#7FB6E2" stroke-width="1.4"/><path d="M${x + 5} ${FLOOR - h + 5} h${w * 0.45}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/></g>`;

  f.stage.innerHTML = `${svgOpen}
    <defs>
      <linearGradient id="u4dFilm" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="316" y2="0"><stop offset="0" stop-color="#F5C6E4"/><stop offset="0.25" stop-color="#BFE6FA"/><stop offset="0.5" stop-color="#D9F5CF"/><stop offset="0.75" stop-color="#F5C6E4"/><stop offset="1" stop-color="#BFE6FA"/></linearGradient>
      <radialGradient id="u4dBub" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".22"/><stop offset="0.7" stop-color="#DCEBFF" stop-opacity=".07"/><stop offset="1" stop-color="#F3C9EC" stop-opacity=".2"/></radialGradient>
      <linearGradient id="u4dIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="0.7" stop-color="#EAF4FF"/><stop offset="1" stop-color="#C7DCF0"/></linearGradient>
      <linearGradient id="u4dCube" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2FAFF"/><stop offset="1" stop-color="#9CCDF2"/></linearGradient>
      <linearGradient id="u4dWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD0FF" stop-opacity=".62"/><stop offset="1" stop-color="#4C9BE8" stop-opacity=".72"/></linearGradient>
    </defs>
    <ellipse cx="${I}" cy="${BOT + 12}" rx="56" ry="6" fill="#000" opacity="0.35"/>
    <ellipse cx="${D}" cy="${BOT + 12}" rx="56" ry="6" fill="#000" opacity="0.35"/>
    ${ci.back}
    ${cube(I - 30, 26, 24)}${cube(I + 3, 25, 22)}
    <path class="u4x-dry-pool" d="" fill="url(#u4dWater)"/>
    <path class="u4x-dry-poolline" d="" stroke="#E2F3FF" stroke-width="1.6" stroke-linecap="round"/>
    ${ci.front}
    ${cd.back}
    <g class="u4x-dry-chunk"><path d="M${D - 32} ${FLOOR} l5 -17 l22 -6 l12 9 l-3 14 Z" fill="url(#u4dIce)" stroke="#8FB3D8" stroke-width="1.4"/></g>
    <g class="u4x-dry-chunk"><path d="M${D + 2} ${FLOOR} l4 -15 l19 -7 l15 10 l-2 12 Z" fill="url(#u4dIce)" stroke="#8FB3D8" stroke-width="1.4"/></g>
    ${cd.front}
    <path class="u4x-dry-film fi" d="${dome(I, 0)}" stroke="url(#u4dFilm)" stroke-width="2.4" stroke-linecap="round" opacity="0"/>
    <path class="u4x-dry-film0" d="${dome(D, 0)}" stroke="rgba(255,255,255,.7)" stroke-width="1.4" stroke-dasharray="4 4" opacity="0"/>
    <path class="u4x-dry-film fd" d="${dome(D, 0)}" stroke="url(#u4dFilm)" stroke-width="2.4" fill="url(#u4dBub)" stroke-linecap="round" opacity="0"/>
    <path class="u4x-dry-shine" d="" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
    <text x="${I}" y="222" text-anchor="middle" font-size="13" font-weight="800" fill="${A.text}">얼음</text>
    <text x="${D}" y="222" text-anchor="middle" font-size="13" font-weight="800" fill="${A.text}">드라이아이스</text>
  </svg>`;
  const q = <T extends Element>(sel: string): T => f.stage.querySelector(sel) as T;
  const filmI = q<SVGPathElement>(".u4x-dry-film.fi");
  const filmD = q<SVGPathElement>(".u4x-dry-film.fd");
  const film0 = q<SVGPathElement>(".u4x-dry-film0");
  const shine = q<SVGPathElement>(".u4x-dry-shine");
  const pool = q<SVGPathElement>(".u4x-dry-pool");
  const poolLine = q<SVGPathElement>(".u4x-dry-poolline");
  const chunks = Array.from(f.stage.querySelectorAll<SVGGElement>(".u4x-dry-chunk"));
  const cubes = Array.from(f.stage.querySelectorAll<SVGGElement>(".u4x-dry-cube"));

  let pred = "";
  let t = 0;
  let filmOn = false;
  const paint = (): void => {
    const e = 1 - (1 - t) * (1 - t);
    const h = DOME * e;
    filmD.setAttribute("d", dome(D, h));
    // 막의 왼쪽 위 반짝임(부푼 만큼만)
    shine.setAttribute("d", filmOn && h > 10 ? `M${(D - HW * 0.62).toFixed(1)} ${(MY - h * 0.55).toFixed(1)} A${HW * 0.7} ${(h * 0.75).toFixed(1)} 0 0 1 ${(D - HW * 0.18).toFixed(1)} ${(MY - h * 0.93).toFixed(1)}` : "");
    chunks.forEach((g, k) => (g.style.transform = `scale(${(1 - 0.32 * e - k * 0.04).toFixed(2)})`));
    // 얼음: 녹아 작아지고, 물이 고이면 그만큼 떠오른다
    const depth = POOL * t;
    cubes.forEach((g, k) => {
      const sc = 1 - 0.3 * t - k * 0.04;
      const lift = Math.max(0, depth - 0.82 * (k ? 22 : 24) * sc);
      g.style.transform = `translateY(${(-lift).toFixed(1)}px) scale(${sc.toFixed(2)})`;
    });
    pool.setAttribute("d", poolD(I, depth));
    const wy = FLOOR - depth;
    poolLine.setAttribute("d", depth > 0.6 ? `M${(wallX(I, wy, -1) + 2).toFixed(1)} ${wy.toFixed(1)} H${(wallX(I, wy, 1) - 2).toFixed(1)}` : "");
    host.dataset.u4Dry = t.toFixed(2);
  };

  const hold = u4Hold(lab, "꾹 눌러 지켜보기", (ms) => {
    t = Math.min(1, t + ms / NEED);
    paint();
    if (t < 1) return true;
    haptic(HAPTIC.correct);
    hold.disabled = true;
    film0.setAttribute("opacity", "1");
    f.pips(2);
    const head = pred.startsWith("드라이아이스") ? "예측대로" : "예측과 달리";
    f.say(`${head} <b>드라이아이스 컵</b>의 막만 부풀었어요. 두 컵의 바닥도 비교해 보세요.`);
    tm.later(judge, 1100);
    return false;
  });

  const cover = bvBtn("main u4x-dry-cover", "비눗물 묻힌 끈으로 두 컵의 입구 훑기");
  cover.addEventListener("click", () => {
    cover.disabled = true;
    haptic(HAPTIC.tap);
    tm.later(() => {
      filmOn = true;
      filmI.setAttribute("opacity", "1");
      filmD.setAttribute("opacity", "1");
    }, 300);
    tm.later(() => {
      f.pips(1);
      f.say("두 컵의 입구에 <b>비누막</b>이 생겼어요. 이대로 두면 어떻게 될지 예측해 보세요.");
      u4Predict(lab, "어느 컵의 <b>비누막</b>이 볼록하게 부풀까요?", ["드라이아이스 컵", "얼음 컵", "두 컵 모두"], (picked) => {
        pred = picked;
        f.say("버튼을 <b>꾹 눌러</b> 시간을 보내며 두 컵의 비누막과 바닥을 보세요.");
        f.slot.setControls(hold);
        api.setCTA("꾹 눌러 지켜보세요", { enabled: false });
      });
    }, 900);
  });

  function judge(): void {
    f.slot.ask(
      "시간이 지난 뒤 두 컵의 <b>바닥</b>은 어떻게 달랐나요?",
      [{ t: "얼음 컵에만 액체가 고였다", ok: true }, { t: "드라이아이스 컵에만 액체가 고였다" }, { t: "두 컵 모두 액체가 고였다" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "얼음은 녹아 물이 됐어요. 드라이아이스는 녹지 않고 <b>바로 기체</b>가 되어 막을 밀었어요.",
        onNext: () => lab.finish("드라이아이스는 고체에서 <b>액체를 거치지 않고</b> 바로 기체로 변했어요. 그래서 바닥이 말라 있고 비누막이 부풀었어요."),
      },
    );
  }

  paint();
  f.slot.setControls(cover);
  f.say("한 컵에는 <b>얼음</b>을, 한 컵에는 <b>드라이아이스</b>를 넣었어요. 두 컵의 입구에 비누막을 씌워 보세요.");
  api.setCTA("비누막을 씌워 보세요", { enabled: false });
  return lab.cleanup;
};
