// [중1 Ⅳ v5] u4l3 승화 랩: 「컵 입구의 비누막은 어떻게 될까요?」
// 책의 해 보기를 손으로 한다: 유리컵에 드라이아이스를 넣고, 비눗방울 용액을 적신 끈으로 컵 입구에 비누막을 만들어 지켜본다.
// 조작: 비누막 씌우기 → 예측(정오를 매기지 않는다) → 꾹 눌러 지켜보기(막이 부풀고 드라이아이스가 작아진다) → 판정 하나(컵 바닥).
// 통찰 하나: 고체가 액체를 거치지 않고 바로 기체가 된다(컵 바닥에 액체가 없다).

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn } from "../bio6/b6Lab";
import { A, svgOpen, u4Hold, u4Lab, u4Predict, type U4Step } from "./u4Kit";

const X0 = 113, X1 = 233, MY = 104; // 컵 입구의 양 끝과 높이
const dome = (k: number): string => `M${X0} ${MY} Q${(X0 + X1) / 2} ${(MY - 156 * k).toFixed(1)} ${X1} ${MY}`;
const NEED = 3200;

export const u4DryIceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-dry" });
  const { f, tm } = lab;

  f.stage.innerHTML = `${svgOpen}
    <defs>
      <linearGradient id="u4dFilm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF9BD3"/><stop offset="0.5" stop-color="#9BE1FF"/><stop offset="1" stop-color="#C6FFB0"/></linearGradient>
      <radialGradient id="u4dFog" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <linearGradient id="u4dIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="0.7" stop-color="#EAF4FF"/><stop offset="1" stop-color="#C7DCF0"/></linearGradient>
    </defs>
    <ellipse cx="173" cy="214" rx="96" ry="7" fill="#000" opacity="0.35"/>
    <path d="M${X0} ${MY} l8 94 a10 10 0 0 0 10 8 h84 a10 10 0 0 0 10 -8 l8 -94" fill="rgba(180,205,240,.10)" stroke="${A.glass}" stroke-width="2.6" stroke-linejoin="round"/>
    <g class="u4x-dry-fogs">${[[150, 170, 26], [198, 174, 28]].map(([x, y, r], i) => `<circle style="animation-delay:${i * 0.5}s" cx="${x}" cy="${y}" r="${r}" fill="url(#u4dFog)"/>`).join("")}</g>
    <g class="u4x-dry-chunk"><path d="M141 198 l6 -19 l25 -6 l14 10 l-4 17 Z" fill="url(#u4dIce)" stroke="#8FB3D8" stroke-width="1.4"/></g>
    <g class="u4x-dry-chunk"><path d="M181 200 l4 -17 l21 -8 l18 12 l-2 15 Z" fill="url(#u4dIce)" stroke="#8FB3D8" stroke-width="1.4"/></g>
    <path d="M${X0 - 8} ${MY} h${X1 - X0 + 16}" stroke="${A.glass}" stroke-width="2.6" stroke-linecap="round"/>
    <path class="u4x-dry-film0" d="${dome(0)}" stroke="rgba(255,255,255,.7)" stroke-width="1.4" stroke-dasharray="4 4" opacity="0"/>
    <path class="u4x-dry-film" d="${dome(0)}" stroke="url(#u4dFilm)" stroke-width="4" fill="rgba(255,255,255,.10)" stroke-linecap="round" opacity="0"/>
    <g class="u4x-dry-lace" opacity="0"><path d="M30 96 L316 112" stroke="#F4D9A0" stroke-width="5" stroke-linecap="round"/><circle cx="30" cy="96" r="6" fill="#F4D9A0"/><circle cx="316" cy="112" r="6" fill="#F4D9A0"/></g>
  </svg>`;
  const q = <T extends Element>(sel: string): T => f.stage.querySelector(sel) as T;
  const film = q<SVGPathElement>(".u4x-dry-film");
  const film0 = q<SVGPathElement>(".u4x-dry-film0");
  const lace = q<SVGGElement>(".u4x-dry-lace");
  const chunks = Array.from(f.stage.querySelectorAll<SVGGElement>(".u4x-dry-chunk"));

  let pred = "";
  let t = 0;
  const paint = (): void => {
    const e = 1 - (1 - t) * (1 - t);
    film.setAttribute("d", dome(e));
    chunks.forEach((g, k) => (g.style.transform = `scale(${(1 - 0.3 * e - k * 0.04).toFixed(2)})`));
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
    const head = pred.startsWith("볼록") ? "예측대로" : "예측과 달리";
    f.say(`${head} 비누막이 <b>볼록하게</b> 부풀었어요. 드라이아이스는 작아졌고요.`);
    tm.later(judge, 900);
    return false;
  });

  const cover = bvBtn("main u4x-dry-cover", "비눗물 묻힌 끈으로 입구 훑기");
  cover.addEventListener("click", () => {
    cover.disabled = true;
    haptic(HAPTIC.tap);
    lace.setAttribute("opacity", "1");
    lace.classList.add("sweep");
    tm.later(() => film.setAttribute("opacity", "1"), 450);
    tm.later(() => {
      lace.setAttribute("opacity", "0");
      f.pips(1);
      f.say("컵 입구에 <b>비누막</b>이 생겼어요. 이대로 두면 어떻게 될지 예측해 보세요.");
      u4Predict(lab, "드라이아이스가 든 컵의 <b>비누막</b>은 어떻게 될까요?", ["볼록하게 부푼다", "그대로 있다", "컵 안으로 꺼진다"], (picked) => {
        pred = picked;
        f.say("버튼을 <b>꾹 눌러</b> 시간을 보내며 비누막과 드라이아이스를 보세요.");
        f.slot.setControls(hold);
        api.setCTA("꾹 눌러 지켜보세요", { enabled: false });
      });
    }, 1000);
  });

  function judge(): void {
    f.slot.ask(
      "드라이아이스가 작아지는 동안 <b>컵 바닥</b>은 어땠나요?",
      [{ t: "액체 없이 말라 있었다", ok: true }, { t: "녹은 액체가 고였다" }, { t: "얼음이 새로 생겼다" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "드라이아이스는 녹지 않고 <b>바로 기체</b>가 됐어요. 그 기체가 막을 밀었어요.",
        onNext: () => lab.finish("고체가 <b>액체를 거치지 않고</b> 바로 기체로 변했어요. 이런 변화가 <b>승화</b>예요. 기체가 바로 고체로 변하는 것도 승화예요."),
      },
    );
  }

  paint();
  f.slot.setControls(cover);
  f.say("유리컵에 <b>드라이아이스</b>(고체)를 넣었어요. 컵 입구에 비누막을 씌워 보세요.");
  api.setCTA("비누막을 씌워 보세요", { enabled: false });
  return lab.cleanup;
};
