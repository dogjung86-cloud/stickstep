// [중1 Ⅳ v5] u4l3 승화 랩: 「비누막은 어떻게 될까요?」
// 책의 해 보기(유리컵에 드라이아이스를 넣고 비눗방울 용액을 적신 끈으로 컵 입구에 비누막을 만든다)를 손으로 한다.
// 견줄 대상을 하나 더 두었다: 얼음을 넣은 컵. 두 컵에 똑같이 비누막을 씌우고 같은 시간을 지켜본다.
//   얼음 컵은 막이 그대로이고 바닥에 물이 고인다. 드라이아이스 컵은 막이 부풀고 바닥에 액체가 없다.
// 조작: 두 컵에 비누막 씌우기 → 예측(어느 컵의 막이 부풀까. 정오를 매기지 않는다) → 꾹 눌러 지켜보기 → 판정 하나(두 컵의 바닥).
// 통찰 하나: 드라이아이스는 액체를 거치지 않고 바로 기체가 된다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn } from "../bio6/b6Lab";
import { A, svgOpen, u4Hold, u4Lab, u4Predict, type U4Step } from "./u4Kit";

const MY = 96; // 컵 입구의 높이
const BOT = 192; // 컵 바닥
const CUPS = { ice: 92, dry: 254 } as const; // 컵의 가운데
const HW = 50; // 입구 반폭
const dome = (cx: number, k: number): string => `M${cx - HW} ${MY} Q${cx} ${(MY - 150 * k).toFixed(1)} ${cx + HW} ${MY}`;
const NEED = 3200;

const cup = (cx: number): string =>
  `<ellipse cx="${cx}" cy="${BOT + 12}" rx="56" ry="6" fill="#000" opacity="0.35"/>
   <path d="M${cx - HW} ${MY} l7 ${BOT - MY - 6} a8 8 0 0 0 8 6 h70 a8 8 0 0 0 8 -6 l7 ${-(BOT - MY - 6)}" fill="rgba(180,205,240,.10)" stroke="${A.glass}" stroke-width="2.6" stroke-linejoin="round"/>
   <path d="M${cx - HW - 7} ${MY} h${HW * 2 + 14}" stroke="${A.glass}" stroke-width="2.6" stroke-linecap="round"/>`;

export const u4DryIceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-dry" });
  const { f, tm } = lab;
  const I = CUPS.ice, D = CUPS.dry;

  f.stage.innerHTML = `${svgOpen}
    <defs>
      <linearGradient id="u4dFilm" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="316" y2="0"><stop offset="0" stop-color="#FF9BD3"/><stop offset="0.25" stop-color="#9BE1FF"/><stop offset="0.5" stop-color="#C6FFB0"/><stop offset="0.75" stop-color="#FF9BD3"/><stop offset="1" stop-color="#9BE1FF"/></linearGradient>
      <radialGradient id="u4dFog" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <linearGradient id="u4dIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="0.7" stop-color="#EAF4FF"/><stop offset="1" stop-color="#C7DCF0"/></linearGradient>
      <linearGradient id="u4dCube" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2FAFF"/><stop offset="1" stop-color="#9CCDF2"/></linearGradient>
    </defs>
    ${cup(I)}
    <rect class="u4x-dry-pool" x="${I - 39}" y="${BOT}" width="78" height="0" rx="3" fill="#6CB8FF" opacity="0.75"/>
    <g class="u4x-dry-cube"><rect x="${I - 30}" y="${BOT - 26}" width="26" height="24" rx="5" fill="url(#u4dCube)" stroke="#7FB6E2" stroke-width="1.4"/></g>
    <g class="u4x-dry-cube"><rect x="${I + 2}" y="${BOT - 24}" width="26" height="22" rx="5" fill="url(#u4dCube)" stroke="#7FB6E2" stroke-width="1.4"/></g>
    ${cup(D)}
    <g class="u4x-dry-chunk"><path d="M${D - 32} ${BOT - 2} l5 -17 l22 -6 l12 9 l-3 14 Z" fill="url(#u4dIce)" stroke="#8FB3D8" stroke-width="1.4"/></g>
    <g class="u4x-dry-chunk"><path d="M${D + 2} ${BOT - 2} l4 -15 l19 -7 l15 10 l-2 12 Z" fill="url(#u4dIce)" stroke="#8FB3D8" stroke-width="1.4"/></g>
    <path class="u4x-dry-film fi" d="${dome(I, 0)}" stroke="url(#u4dFilm)" stroke-width="4" stroke-linecap="round" opacity="0"/>
    <path class="u4x-dry-film0" d="${dome(D, 0)}" stroke="rgba(255,255,255,.7)" stroke-width="1.4" stroke-dasharray="4 4" opacity="0"/>
    <path class="u4x-dry-film fd" d="${dome(D, 0)}" stroke="url(#u4dFilm)" stroke-width="4" fill="rgba(255,255,255,.10)" stroke-linecap="round" opacity="0"/>
    <text x="${I}" y="222" text-anchor="middle" font-size="13" font-weight="800" fill="${A.text}">얼음</text>
    <text x="${D}" y="222" text-anchor="middle" font-size="13" font-weight="800" fill="${A.text}">드라이아이스</text>
  </svg>`;
  const q = <T extends Element>(sel: string): T => f.stage.querySelector(sel) as T;
  const filmI = q<SVGPathElement>(".u4x-dry-film.fi");
  const filmD = q<SVGPathElement>(".u4x-dry-film.fd");
  const film0 = q<SVGPathElement>(".u4x-dry-film0");
  const pool = q<SVGRectElement>(".u4x-dry-pool");
  const chunks = Array.from(f.stage.querySelectorAll<SVGGElement>(".u4x-dry-chunk"));
  const cubes = Array.from(f.stage.querySelectorAll<SVGGElement>(".u4x-dry-cube"));

  let pred = "";
  let t = 0;
  const paint = (): void => {
    const e = 1 - (1 - t) * (1 - t);
    filmD.setAttribute("d", dome(D, e));
    chunks.forEach((g, k) => (g.style.transform = `scale(${(1 - 0.32 * e - k * 0.04).toFixed(2)})`));
    cubes.forEach((g, k) => (g.style.transform = `translateY(${(-9 * t).toFixed(1)}px) scale(${(1 - 0.3 * t - k * 0.04).toFixed(2)})`));
    pool.setAttribute("y", (BOT - 12 * t).toFixed(1));
    pool.setAttribute("height", (12 * t).toFixed(1));
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
    f.say(`${head} <b>드라이아이스 컵</b>의 막만 부풀었어요. 두 컵의 바닥도 견줘 보세요.`);
    tm.later(judge, 1100);
    return false;
  });

  const cover = bvBtn("main u4x-dry-cover", "비눗물 묻힌 끈으로 두 컵의 입구 훑기");
  cover.addEventListener("click", () => {
    cover.disabled = true;
    haptic(HAPTIC.tap);
    tm.later(() => {
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
