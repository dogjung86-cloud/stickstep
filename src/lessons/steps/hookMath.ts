// hookMath, 수학 트랙 미리보기 퍼즐(훅). 과학 hook.ts와 같은 쉘 문법이지만
// 별도 스텝 타입("mathHook")으로 등록해 과학 파일을 건드리지 않는다.
// 예측 선택지는 반드시 공용 hookAsk.ask(), choices[0]=정답, good≠bad(오개념 교정).
// 장면 상태 변화는 인라인 스타일 트랜지션(rAF 금지 환경 대응).
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { stickAvatar, setStickAvatar, type AvatarKind } from "../../ui/avatar";
import { ask } from "./hookAsk";
import { mfmt } from "../../ui/mathKit";
import {
  renderVending, renderChatslang, renderFurniture, renderMacaron, renderBasket,
  renderCatfood, renderJustice, renderLeap, renderHorse,
} from "./hookMath2";
import {
  renderCinema, renderSos, renderViews, renderWheel, renderThunder,
  renderDownload, renderPizza, renderSeesaw, renderQuakealert,
} from "./hookMath3";
import {
  renderSparkler, renderLaserline, renderClockhands, renderScissors, renderLongjump,
  renderRailroad, renderOverpass, renderSubwayexit, renderBlinds, renderCurtain,
  renderStraws, renderBakery, renderThales,
} from "./hookMath4";
import {
  renderFivestar, renderAladder, renderHoneycomb, renderRobotvac,
  renderWatermelon, renderCakecut, renderLanestart,
  renderDiamond, renderDicegame, renderPottery,
  renderDrinkcan, renderPartyhat, renderBalloonup, renderTombstone,
} from "./hookMath5";
import {
  renderLunchavg, renderPenstock, renderMarathon, renderWeightclass,
  renderCamerahisto, renderLikeratio, renderFakegraph,
} from "./hookMath6";
import {
  renderCalculator, renderMelody, renderBirthday, renderNines, renderGerms,
  renderStorage, renderSolarpanel, renderReceipt, renderKiosk, renderTangram,
} from "./hookM2u1";
import type { StepRenderer } from "../types";

type Face = (k: AvatarKind) => void;
type SceneFn = (scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]) => void;

interface MathHookStep {
  title: string;
  lead?: string;
  narrator: string;
  done?: string;
  scene: string;
  choices?: string[];
  cta?: string;
}

/* 파운드리 문법 공용 조각 */
const SHADOW = (cx: number, cy: number, rx: number, o = 0.11): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="#2A3A5E" opacity="${o}"/>`;

const wrapSvg = (inner: string, defs = "", vb = "0 0 360 200"): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none"><defs>${defs}</defs>${inner}</svg>`;

export const mathHook: StepRenderer = (host, step, api) => {
  const s = step as unknown as MathHookStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const bubble = el("div", { class: "comic-bubble", html: s.narrator });
  const avatar = stickAvatar("smile");
  const face: Face = (kind) => setStickAvatar(avatar, kind);
  host.appendChild(el("div", { class: "comic-narrator" }, el("div", { class: "comic-avatar" }, avatar), bubble));

  const scene = el("div", { class: "hook-scene mhk" });
  const helper = el("div", { class: "helper", attrs: { role: "status", "aria-live": "polite" } });
  host.append(scene, helper);

  function finish(): void {
    if (s.done) bubble.innerHTML = s.done;
    api.enableCTA(s.cta ?? "발견 랩 열기");
    window.setTimeout(() => face("smile"), 900);
  }

  const fns: Record<string, SceneFn> = {
    cicada: renderCicada,
    paperfold: renderPaperfold,
    lockcode: renderLockcode,
    tilefloor: renderTilefloor,
    buslight: renderBuslight,
    freezer: renderFreezer,
    gpsdist: renderGpsdist,
    golfscore: renderGolfscore,
    daytemp: renderDaytemp,
    rewind: renderRewind,
    mentalmath: renderMentalmath,
    snsdebate: renderSnsdebate,
    // Ⅱ 문자와 식(hookMath2.ts)
    vending: renderVending,
    chatslang: renderChatslang,
    furniture: renderFurniture,
    macaron: renderMacaron,
    basket: renderBasket,
    catfood: renderCatfood,
    justice: renderJustice,
    leap: renderLeap,
    horse: renderHorse,
    // Ⅲ 좌표평면과 그래프(hookMath3.ts)
    cinema: renderCinema,
    sos: renderSos,
    views: renderViews,
    wheel: renderWheel,
    thunder: renderThunder,
    download: renderDownload,
    pizza: renderPizza,
    seesaw: renderSeesaw,
    quakealert: renderQuakealert,
    // Ⅳ 기본 도형(hookMath4.ts)
    sparkler: renderSparkler,
    laserline: renderLaserline,
    clockhands: renderClockhands,
    scissors: renderScissors,
    longjump: renderLongjump,
    railroad: renderRailroad,
    overpass: renderOverpass,
    subwayexit: renderSubwayexit,
    blinds: renderBlinds,
    curtain: renderCurtain,
    straws: renderStraws,
    bakery: renderBakery,
    thales: renderThales,
    // Ⅴ 평면도형과 입체도형(hookMath5.ts)
    fivestar: renderFivestar,
    aladder: renderAladder,
    honeycomb: renderHoneycomb,
    robotvac: renderRobotvac,
    watermelon: renderWatermelon,
    cakecut: renderCakecut,
    lanestart: renderLanestart,
    diamond: renderDiamond,
    dicegame: renderDicegame,
    pottery: renderPottery,
    drinkcan: renderDrinkcan,
    partyhat: renderPartyhat,
    balloonup: renderBalloonup,
    tombstone: renderTombstone,
    // Ⅵ 통계(hookMath6.ts)
    lunchavg: renderLunchavg,
    penstock: renderPenstock,
    marathon: renderMarathon,
    weightclass: renderWeightclass,
    camerahisto: renderCamerahisto,
    likeratio: renderLikeratio,
    fakegraph: renderFakegraph,
    // 중2 Ⅰ 유리수의 표현과 식의 계산(hookM2u1.ts)
    calculator: renderCalculator,
    melody: renderMelody,
    birthday: renderBirthday,
    nines: renderNines,
    germs: renderGerms,
    storage: renderStorage,
    solarpanel: renderSolarpanel,
    receipt: renderReceipt,
    kiosk: renderKiosk,
    tangram: renderTangram,
  };
  const fn = fns[s.scene];
  if (fn) fn(scene, helper, finish, face, s.choices);
  else {
    helper.textContent = "장면을 준비하고 있어요.";
    api.enableCTA(s.cta ?? "다음");
  }

  api.setCTA(s.cta ?? "발견 랩 열기", { enabled: false });
};

/* ── L1 cicada, 매미의 13·17년 미스터리 ─────────────────────── */
function renderCicada(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]): void {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${SHADOW(120, 186, 60)}${SHADOW(268, 186, 44)}
    <path d="M118 184 V84 q-2 -26 18 -38" stroke="url(#ci-tr)" stroke-width="16" stroke-linecap="round"/>
    <path d="M118 128 q-24 -10 -34 -30 M118 100 q22 -8 30 -26" stroke="url(#ci-tr)" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="86" cy="66" rx="38" ry="26" fill="url(#ci-lf)"/>
    <ellipse cx="152" cy="48" rx="42" ry="28" fill="url(#ci-lf2)"/>
    <ellipse cx="120" cy="34" rx="34" ry="22" fill="url(#ci-lf)"/>
    <ellipse cx="76" cy="56" rx="8" ry="4" fill="#fff" opacity=".35"/>
    <g class="ci-bug" style="transition: transform 1s cubic-bezier(.34,1.2,.5,1), opacity .5s; opacity: 0">
      <ellipse cx="240" cy="120" rx="16" ry="10" fill="url(#ci-bd)" stroke="#4A3418" stroke-width="1.4"/>
      <circle cx="255" cy="116" r="7" fill="url(#ci-bd)" stroke="#4A3418" stroke-width="1.3"/>
      <circle cx="258" cy="114" r="1.8" fill="#E84A4A"/>
      <path d="M236 114 q-14 -10 -26 -6 q10 8 22 10 z" fill="url(#ci-wg)" stroke="#8C7A4E" stroke-width="1"/>
      <path d="M238 122 q-16 2 -24 10 q12 3 24 -3 z" fill="url(#ci-wg)" stroke="#8C7A4E" stroke-width="1" opacity=".85"/>
    </g>
    <g class="ci-bug2" style="transition: transform 1.2s cubic-bezier(.34,1.2,.5,1), opacity .5s; opacity: 0">
      <ellipse cx="290" cy="150" rx="13" ry="8" fill="url(#ci-bd)" stroke="#4A3418" stroke-width="1.3"/>
      <circle cx="302" cy="147" r="6" fill="url(#ci-bd)" stroke="#4A3418" stroke-width="1.2"/>
      <circle cx="304" cy="145" r="1.5" fill="#E84A4A"/>
      <path d="M287 145 q-12 -8 -22 -5 q9 7 19 8 z" fill="url(#ci-wg)" stroke="#8C7A4E" stroke-width="1"/>
    </g>
    <g class="ci-hole"><ellipse cx="240" cy="176" rx="15" ry="6" fill="#5E4426"/><ellipse cx="292" cy="180" rx="12" ry="5" fill="#6E522E"/></g>
    <text x="36" y="150" font-size="15" font-weight="800" fill="#0A87A3">13년</text>
    <text x="308" y="96" font-size="15" font-weight="800" fill="#6A55F2">17년</text>`,
    `<linearGradient id="ci-tr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A97A4C"/><stop offset="1" stop-color="#7C552E"/></linearGradient>
    <linearGradient id="ci-lf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86CC78"/><stop offset="1" stop-color="#3A8A42"/></linearGradient>
    <linearGradient id="ci-lf2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FBD7F"/><stop offset="1" stop-color="#2D7A44"/></linearGradient>
    <linearGradient id="ci-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C89A5E"/><stop offset="1" stop-color="#7E5A2E"/></linearGradient>
    <linearGradient id="ci-wg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#EAF2FA" stop-opacity=".9"/><stop offset="1" stop-color="#B9CCDE" stop-opacity=".6"/></linearGradient>`,
  );
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "땅속에서 깨우기" }));
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "북아메리카의 매미들은 땅속에서 <b>정확히 13년 또는 17년</b>을 기다렸다가 한꺼번에 나와요.";
  btn.addEventListener("click", () => {
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    face("surprised");
    const b1 = fig.querySelector(".ci-bug") as SVGGElement;
    const b2 = fig.querySelector(".ci-bug2") as SVGGElement;
    b1.style.opacity = "1";
    b1.style.transform = "translate(6px, -34px) rotate(-8deg)";
    b2.style.opacity = "1";
    b2.style.transform = "translate(-4px, -20px) rotate(6deg)";
    helper.innerHTML = "우르르! 그런데 왜 하필 <b>12도 15도 아닌 13과 17</b>일까요?";
    window.setTimeout(() => {
      ask(box, helper, {
        choices: choices ?? [
          "13과 17은 약수가 없는 수라 천적의 주기와 잘 안 겹쳐서",
          "13과 17이 행운의 숫자라서",
          "우연일 뿐, 숫자에 이유는 없다",
        ],
        good: "정확해요! 2·3·4·6년 주기로 늘어나는 천적과 <b>최대한 안 겹치는 수</b>, 1과 자기 자신 말고는 약수가 없는 수예요. 이런 수를 뭐라고 부르는지, 체로 걸러서 찾아봐요.",
        bad: "매미는 수학자였어요, 12년이면 2·3·4·6년 주기 천적과 계속 겹치지만, 13과 17은 <b>1과 자기 자신 말고 약수가 없어</b> 거의 안 겹쳐요. 이런 수의 정체를 체로 걸러 확인해 봐요.",
        onDone: finish,
      });
    }, 700);
  });
}

/* ── L2 paperfold, 종이 접기 두께 (가로 반토막·두께 두 배, 넓이 보존) ── */
function renderPaperfold(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]): void {
  const fig = el("div", {});
  const GROUND = 150;
  const paperAt = (n: number): { w: number; t: number } => ({ w: 256 / 2 ** n, t: 3 * 2 ** n });
  const draw = (n: number, label: string): void => {
    const { w, t } = paperAt(n);
    const x = 180 - w / 2;
    const y = GROUND - t;
    // 직전 크기 잔상(점선), "가로가 반으로 접혀 들어갔다"가 눈에 보이게
    let ghost = "";
    if (n > 0) {
      const p = paperAt(n - 1);
      ghost =
        `<rect x="${180 - p.w / 2}" y="${GROUND - p.t}" width="${p.w}" height="${p.t}" rx="2.5" fill="none" stroke="#B0BCC8" stroke-width="1.4" stroke-dasharray="4 4" opacity=".65"/>` +
        `<path d="M ${180 + p.w / 2 - 6} ${GROUND - p.t - 9} q -${p.w / 4} -14 -${p.w / 2 - 4} -2" stroke="#8CA0B3" stroke-width="1.6" fill="none" stroke-dasharray="3 3" opacity=".8"/>` +
        `<path d="M ${180 - 2} ${GROUND - p.t - 12} l -4 3 l 5 2" stroke="#8CA0B3" stroke-width="1.6" fill="none" opacity=".8"/>`;
    }
    // 겹 경계선(층이 보일 만큼만)
    const layers = 2 ** n;
    let strata = "";
    if (layers > 1) {
      const shown = Math.min(layers, 16);
      const step = t / shown;
      if (step >= 2.6) {
        for (let i = 1; i < shown; i++) {
          strata += `<line x1="${x + 1.5}" y1="${GROUND - step * i}" x2="${x + w - 1.5}" y2="${GROUND - step * i}" stroke="#C8B47E" stroke-width="1" opacity=".55"/>`;
        }
      }
    }
    fig.innerHTML = wrapSvg(
      `${SHADOW(180, 158, Math.max(26, w * 0.34))}
      <line x1="60" y1="${GROUND}" x2="300" y2="${GROUND}" stroke="#8CA0B3" stroke-width="2"/>
      ${ghost}
      <rect x="${x}" y="${y}" width="${w}" height="${Math.max(t, 3)}" rx="${Math.min(5, w / 4)}" fill="url(#pf-pp)" stroke="#B8A26E" stroke-width="1.4"/>
      ${strata}
      <ellipse cx="${180 - w * 0.22}" cy="${y + Math.min(6, t * 0.3)}" rx="${w * 0.2}" ry="2" fill="#fff" opacity=".5"/>
      <text x="180" y="30" text-anchor="middle" font-size="14" font-weight="800" fill="#54677A">${label}</text>
      ${n > 0 ? `<text x="180" y="${GROUND + 24}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8CA0B3">가로는 반으로, 두께는 두 배로</text>` : ""}`,
      `<linearGradient id="pf-pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8E2"/><stop offset="1" stop-color="#EAD9A8"/></linearGradient>`,
    );
  };
  draw(0, "종이 한 장 = 0.1mm");
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "반으로 접기" }));
  const read = el("div", { class: "pw-read" });
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, read, btn, box);
  helper.innerHTML = "얇디얇은 종이 한 장(0.1mm)을 <b>반으로 접으면 두께는 2배</b>가 돼요. 계속 접어 볼까요?";
  let n = 0;
  const LABELS = ["", "2겹", "4겹", "8겹, 벌써 두툼", "16겹", "32겹, 공책 두께!"];
  btn.addEventListener("click", () => {
    if (n >= 5) return;
    n += 1;
    haptic(HAPTIC.select);
    draw(n, LABELS[n]);
    read.innerHTML = mfmt(`2^${n} = ${2 ** n}겹`);
    if (n === 5) {
      face("surprised");
      (btn as HTMLButtonElement).disabled = true;
      btn.classList.remove("pulse");
      helper.innerHTML = "5번 접었을 뿐인데 32겹! 그럼 <b>42번</b> 접으면 두께가 얼마나 될까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? ["달까지 닿는다(약 38만 km)", "책상 높이쯤 된다", "아파트 한 층쯤 된다"],
          good: "믿기 어렵지만 진짜예요, 2를 42번 곱하면 약 4조 4천억 겹, 44만 km! <b>같은 수를 거듭 곱하는 것</b>의 위력이에요. 이걸 짧게 쓰는 법을 배워요.",
          bad: "훨씬 커요! 2를 42번 곱하면 약 4조 4천억 겹, 두께 44만 km로 <b>달(38만 km)을 지나쳐요</b>. 같은 수를 거듭 곱하면 폭발적으로 커지죠. 이걸 짧게 쓰는 법이 오늘 주인공!",
          onDone: finish,
        });
      }, 600);
    }
  });
}

/* ── L3 lockcode, 소수 자물쇠(암호) ─────────────────────────── */
function renderLockcode(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]): void {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 182, 70)}
    <g class="lk-shackle" style="transition: transform .6s cubic-bezier(.34,1.35,.5,1); transform-origin: 132px 92px">
      <path d="M132 92 v-22 a48 42 0 0 1 96 0 v22" stroke="url(#lk-mt)" stroke-width="16" stroke-linecap="round"/>
    </g>
    <rect x="104" y="88" width="152" height="94" rx="18" fill="url(#lk-bd)" stroke="#8C5A18" stroke-width="1.8"/>
    <ellipse cx="132" cy="102" rx="10" ry="5" fill="#fff" opacity=".35"/>
    <rect x="130" y="118" width="100" height="34" rx="9" fill="#1E2A38" stroke="#0E1722" stroke-width="1.5"/>
    <text x="180" y="141" text-anchor="middle" font-size="20" font-weight="900" fill="#7FE0D2" style="letter-spacing:.06em">91</text>
    <text x="180" y="170" text-anchor="middle" font-size="11" font-weight="700" fill="#7E5A18">공개 열쇠</text>`,
    `<linearGradient id="lk-mt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C2CCD8"/><stop offset=".5" stop-color="#8C99A8"/><stop offset="1" stop-color="#6E7C8C"/></linearGradient>
    <linearGradient id="lk-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset=".5" stop-color="#F2B440"/><stop offset="1" stop-color="#D8952E"/></linearGradient>`,
  );
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, box);
  helper.innerHTML =
    "은행 보안은 이렇게 걸려 있어요: <b>두 소수를 곱한 수</b>는 공개하고, 원래 두 소수는 비밀. 이 자물쇠의 공개 열쇠는 <b>91</b>, 비밀 열쇠를 찾아야 열려요!";
  const lockFig = fig.querySelector(".lk-shackle") as SVGGElement;
  window.setTimeout(() => {
    face("curious");
    ask(box, helper, {
      choices: choices ?? ["7과 13", "3과 31", "9와 11"],
      good: "철컥! <b>7×13=91</b>, 자물쇠가 열렸어요. 91처럼 작은 수는 금방 풀리지만, 수백 자리 수를 소수의 곱으로 쪼개는 건 슈퍼컴퓨터도 수만 년이 걸려요. 수를 소수의 곱으로 쪼개는 기술, 지금 배워요.",
      bad: "곱해서 검산해 봐요, 3×31=93, 9×11=99라 어긋나요(게다가 9는 3×3으로 더 쪼개지는 수!). 91을 작은 소수부터 나눠 보면 <b>7×13</b>이 딱 맞아요. 이 '쪼개기'가 오늘의 기술이에요.",
      onDone: () => {
        lockFig.style.transform = "translateY(-16px) rotate(-14deg)";
        haptic(HAPTIC.correct);
        finish();
      },
    });
  }, 900);
}

/* ── L4 tilefloor, 가장 큰 정사각 타일 ──────────────────────── */
function renderTilefloor(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]): void {
  const fig = el("div", {});
  const F = { x: 60, y: 34, w: 240, h: 150 }; // 45×75 비율(가로 75, 세로 45 → 240×144에 맞춤)
  function floorSvg(tile = 0): string {
    let tiles = "";
    if (tile > 0) {
      const px = (F.w / 75) * tile;
      let k = 0;
      for (let yy = 0; yy + 0.1 < F.h; yy += (F.h / 45) * tile) {
        for (let xx = 0; xx + 0.1 < F.w; xx += px) {
          const wRem = Math.min(px, F.w - xx);
          const hRem = Math.min((F.h / 45) * tile, F.h - yy);
          const fit = wRem >= px - 0.1 && hRem >= (F.h / 45) * tile - 0.1;
          tiles += `<rect x="${F.x + xx + 1.2}" y="${F.y + yy + 1.2}" width="${wRem - 2.4}" height="${hRem - 2.4}" rx="3" fill="${fit ? "url(#tf-tl)" : "#F2B0B6"}" stroke="${fit ? "#2FA8C4" : "#E8434F"}" stroke-width="1.2" opacity="0" style="transition: opacity .3s; transition-delay: ${k * 24}ms" class="tf-t"/>`;
          k += 1;
        }
      }
    }
    return wrapSvg(
      `${SHADOW(180, 194, 96, 0.13)}
      <rect x="${F.x - 8}" y="${F.y - 8}" width="${F.w + 16}" height="${F.h + 16}" rx="10" fill="url(#tf-wd)" stroke="#8C6A42" stroke-width="1.6"/>
      <rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" rx="4" fill="#F4F8FB" stroke="#B9C6D2" stroke-width="1.4"/>
      ${tiles}
      <text x="${F.x + F.w / 2}" y="${F.y - 14}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#54677A">가로 75</text>
      <text x="${F.x - 26}" y="${F.y + F.h / 2}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#54677A" transform="rotate(-90 ${F.x - 26} ${F.y + F.h / 2})">세로 45</text>`,
      `<linearGradient id="tf-wd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D8AA70"/><stop offset="1" stop-color="#A97A4C"/></linearGradient>
      <linearGradient id="tf-tl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D7F2F8"/><stop offset="1" stop-color="#9ADEED"/></linearGradient>`,
      "0 0 360 216",
    );
  }
  fig.innerHTML = floorSvg();
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, box);
  helper.innerHTML =
    "가로 75, 세로 45인 주방 바닥을 <b>정사각형 타일</b>로 빈틈도, 자름도 없이 깔고 싶어요. 타일이 클수록 일이 줄죠, <b>가장 큰</b> 타일 한 변은 몇일까요?";
  function fill(t: number): void {
    fig.innerHTML = floorSvg(t);
    window.setTimeout(() => {
      fig.querySelectorAll(".tf-t").forEach((r) => ((r as SVGRectElement).style.opacity = "1"));
    }, 60);
  }
  window.setTimeout(() => {
    ask(box, helper, {
      choices: choices ?? ["한 변 15", "한 변 9", "한 변 5"],
      good: "딱 맞아요! 15는 75도 나누고(5장) 45도 나눠서(3장) 빈틈이 없어요, 75와 45를 <b>동시에 나누는 가장 큰 수</b>죠. 왜 하필 15인지, 소인수로 뜯어 봐요.",
      bad: "직접 깔아 보면 보여요, 9는 45는 나누지만 75는 못 나눠 오른쪽에 빈틈이 남고, 5는 깔리긴 해도 <b>더 큰 15</b>가 가능해요. '두 수를 동시에 나누는 가장 큰 수'를 찾는 법을 배워요.",
      onDone: () => {
        face("curious");
        fill(15);
        haptic(HAPTIC.correct);
        finish();
      },
    });
  }, 900);
}

/* ── L5 buslight, 두 버스의 동시 출발 ───────────────────────── */
function renderBuslight(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]): void {
  const fig = el("div", {});
  const bus = (x: number, color1: string, color2: string, label: string, cls: string): string =>
    `<g class="${cls}" style="transition: filter .3s, opacity .3s">
      <rect x="${x}" y="96" width="104" height="56" rx="12" fill="url(#${color1})" stroke="${color2}" stroke-width="1.8"/>
      <rect x="${x + 10}" y="106" width="24" height="18" rx="4" fill="#DFF2FA" stroke="${color2}" stroke-width="1.2"/>
      <rect x="${x + 42}" y="106" width="24" height="18" rx="4" fill="#DFF2FA" stroke="${color2}" stroke-width="1.2"/>
      <rect x="${x + 74}" y="106" width="20" height="30" rx="4" fill="#C9E8F4" stroke="${color2}" stroke-width="1.2"/>
      <circle cx="${x + 24}" cy="156" r="10" fill="#39424E" stroke="#191F28" stroke-width="2"/>
      <circle cx="${x + 80}" cy="156" r="10" fill="#39424E" stroke="#191F28" stroke-width="2"/>
      <text x="${x + 52}" y="90" text-anchor="middle" font-size="12.5" font-weight="800" fill="${color2}">${label}</text>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${SHADOW(110, 172, 62)}${SHADOW(258, 172, 62)}
    <line x1="20" y1="168" x2="340" y2="168" stroke="#8CA0B3" stroke-width="3" stroke-linecap="round"/>
    ${bus(58, "bl-a", "#0A87A3", "4분마다 출발", "bus-a")}
    ${bus(206, "bl-b", "#0CA678", "6분마다 출발", "bus-b")}
    <g><rect x="140" y="18" width="80" height="34" rx="9" fill="#1E2A38"/><text x="180" y="41" text-anchor="middle" font-size="17" font-weight="900" fill="#7FE0D2" class="bl-clock">0분</text></g>`,
    `<linearGradient id="bl-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD4EC"/><stop offset="1" stop-color="#2FA8C4"/></linearGradient>
    <linearGradient id="bl-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FE8C4"/><stop offset="1" stop-color="#26B87E"/></linearGradient>`,
  );
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, box);
  helper.innerHTML =
    "지금 막 파랑 버스(4분 간격)와 초록 버스(6분 간격)가 <b>동시에</b> 출발했어요. 두 버스가 <b>다음에 또 동시에</b> 출발하는 건 몇 분 뒤일까요?";
  window.setTimeout(() => {
    ask(box, helper, {
      choices: choices ?? ["12분 뒤", "24분 뒤", "10분 뒤"],
      good: "명중! 파랑은 4·8·12분, 초록은 6·12분, <b>12분</b>에 처음 다시 만나요. 시계를 돌려 확인해 볼게요.",
      bad: "시계를 돌려 봐요, 파랑은 4·8·12…, 초록은 6·12…분에 출발해요. 24분에도 만나지만 <b>'처음' 만나는 건 12분</b>이고, 10분(4+6)은 둘 다 출발하지 않는 함정!",
      onDone: () => {
        // 시계 감기 연출: 1분씩 12분까지, 배수 순간 버스 글로우
        const clock = fig.querySelector(".bl-clock") as SVGTextElement;
        const busA = fig.querySelector(".bus-a") as SVGGElement;
        const busB = fig.querySelector(".bus-b") as SVGGElement;
        let m = 0;
        const tick = (): void => {
          m += 1;
          clock.textContent = `${m}분`;
          const ga = m % 4 === 0;
          const gb = m % 6 === 0;
          busA.style.filter = ga ? "drop-shadow(0 0 8px rgba(13,165,198,.9))" : "";
          busB.style.filter = gb ? "drop-shadow(0 0 8px rgba(12,166,120,.9))" : "";
          if (ga || gb) haptic(HAPTIC.tap);
          if (m < 12) window.setTimeout(tick, m >= 10 ? 420 : 240);
          else {
            haptic(HAPTIC.correct);
            face("cheer");
          }
        };
        window.setTimeout(tick, 500);
        finish();
      },
    });
  }, 900);
}

/* ── L6 freezer, 0 아래의 세계 ──────────────────────────────── */
function renderFreezer(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]): void {
  const fig = el("div", {});
  const draw = (frz: boolean): void => {
    fig.innerHTML = wrapSvg(
      `${SHADOW(180, 190, 66)}
      <rect x="118" y="16" width="124" height="170" rx="14" fill="url(#fz-bd)" stroke="#8C99A8" stroke-width="1.8"/>
      <rect x="118" y="16" width="124" height="64" rx="14" fill="url(#fz-tp)" stroke="#8C99A8" stroke-width="1.6"/>
      <rect x="128" y="70" width="104" height="3" rx="1.5" fill="#7E8C9C" opacity=".5"/>
      <rect x="226" y="34" width="6" height="26" rx="3" fill="#5E6C7C"/>
      <rect x="226" y="102" width="6" height="40" rx="3" fill="#5E6C7C"/>
      <ellipse cx="136" cy="30" rx="8" ry="4" fill="#fff" opacity=".4"/>
      <g><rect x="24" y="60" width="82" height="44" rx="10" fill="#1E2A38"/>
      <text x="65" y="89" text-anchor="middle" font-size="19" font-weight="900" fill="${frz ? "#8FD4FF" : "#FFD98A"}">${frz ? "−18℃" : "+3℃"}</text></g>
      <text x="65" y="120" text-anchor="middle" font-size="12" font-weight="700" fill="#54677A">${frz ? "냉동실" : "냉장실"}</text>
      ${frz ? `<path d="M150 40 l6 10 M156 40 l-6 10 M153 38 v14 M196 46 l6 10 M202 46 l-6 10 M199 44 v14" stroke="#BFE8FF" stroke-width="1.8" stroke-linecap="round"/>` : `<circle cx="160" cy="46" r="7" fill="#FFB9743d" stroke="#F08C2E" stroke-width="1.4"/><rect x="184" y="40" width="22" height="13" rx="3" fill="#8FD48F55" stroke="#3A8A42" stroke-width="1.3"/>`}`,
      `<linearGradient id="fz-bd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2F6FA"/><stop offset=".5" stop-color="#D8E2EC"/><stop offset="1" stop-color="#B9C6D4"/></linearGradient>
      <linearGradient id="fz-tp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8F0F8"/><stop offset="1" stop-color="#C2D0DE"/></linearGradient>`,
    );
  };
  draw(false);
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "냉동실 보기" }));
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "냉장실은 <b>+3℃</b>, 0보다 3도 높아요. 그럼 아이스크림이 사는 냉동실은?";
  let frz = false;
  btn.addEventListener("click", () => {
    frz = !frz;
    haptic(HAPTIC.select);
    draw(frz);
    (btn.querySelector("span") as HTMLElement).textContent = frz ? "냉장실 보기" : "냉동실 보기";
    if (frz && !box.classList.contains("show")) {
      face("curious");
      helper.innerHTML = "<b>영하 18도</b>, 0보다 <b>낮은</b> 온도예요. 이걸 수로 쓰면 어떻게 될까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? ["−18 (0보다 낮음을 − 부호로)", "그냥 18", "0.18"],
          good: "맞아요! 0을 기준으로 <b>반대쪽은 − 부호</b>를 붙여요, 영하 18℃는 −18℃. 온도뿐 아니라 지하층, 해저, 골프 스코어까지, 0 아래의 세계가 열려요.",
          bad: "그냥 18이면 영상 18도와 구별이 안 돼요! 0을 기준으로 위는 +, <b>아래(반대쪽)는 −</b>, 영하 18℃는 <b>−18℃</b>. 0 아래의 새로운 수, 음수를 만나러 가요.",
          onDone: finish,
        });
      }, 600);
    }
  });
}

/* ── L7 gpsdist, 거리만 알 때 ───────────────────────────────── */
function renderGpsdist(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]): void {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 188, 90, 0.09)}
    <rect x="28" y="18" width="304" height="168" rx="14" fill="url(#gp-mp)" stroke="#B9C6D2" stroke-width="1.6"/>
    <path d="M60 60 q60 -14 120 0 t 120 0 M60 120 q80 16 150 2 t 90 -6 M120 22 v160 M240 22 v160" stroke="#C8D6E0" stroke-width="2" opacity=".7"/>
    <circle class="gp-ring" cx="180" cy="102" r="70" stroke="#0DA5C6" stroke-width="2.6" stroke-dasharray="440" stroke-dashoffset="440" style="transition: stroke-dashoffset 1.1s ease" opacity=".85"/>
    <g><circle cx="180" cy="102" r="9" fill="url(#gp-hm)" stroke="#B3261E" stroke-width="1.6"/><path d="M174 100 l6 -6 l6 6 v8 h-12 z" fill="#fff"/></g>
    <g class="gp-c1" style="transition: opacity .4s" opacity="0"><circle cx="110" cy="102" r="8" fill="#FFB01F" stroke="#D8952E" stroke-width="1.6"/><text x="110" y="88" text-anchor="middle" font-size="11" font-weight="800" fill="#B3771A">서쪽?</text></g>
    <g class="gp-c2" style="transition: opacity .4s" opacity="0"><circle cx="250" cy="102" r="8" fill="#FFB01F" stroke="#D8952E" stroke-width="1.6"/><text x="250" y="88" text-anchor="middle" font-size="11" font-weight="800" fill="#B3771A">동쪽?</text></g>
    <text x="180" y="146" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0A87A3">떡볶이집까지 3 km</text>`,
    `<linearGradient id="gp-mp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6FAF4"/><stop offset="1" stop-color="#E2EEDF"/></linearGradient>
    <radialGradient id="gp-hm" cx=".35" cy=".3" r=".95"><stop offset="0" stop-color="#FF9AA2"/><stop offset="1" stop-color="#E8434F"/></radialGradient>`,
  );
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "3 km 반경 그리기" }));
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "지도 앱이 알려줘요: “여기서 <b>3 km</b> 떨어진 떡볶이 맛집!” 그런데… 어느 쪽으로 3 km일까요?";
  btn.addEventListener("click", () => {
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".gp-ring") as SVGCircleElement).style.strokeDashoffset = "0";
    window.setTimeout(() => {
      (fig.querySelector(".gp-c1") as SVGGElement).setAttribute("opacity", "1");
      (fig.querySelector(".gp-c2") as SVGGElement).setAttribute("opacity", "1");
      face("curious");
      helper.innerHTML = "“3 km”라는 <b>거리</b>만으로 가게 위치를 알 수 있을까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? ["모른다, 동쪽 3 km일 수도, 서쪽 3 km일 수도", "당연히 동쪽 3 km 지점", "지도에서 딱 한 곳으로 정해진다"],
          good: "그렇죠, <b>거리는 방향을 지워요</b>. 수직선에서도 똑같아요: 0에서 거리가 3인 수는 +3과 −3, <b>둘</b>! 이 '거리'에 붙는 이름이 절댓값이에요.",
          bad: "안내엔 방향이 없었어요, 3 km 반경 위 <b>어디든</b> 가능하죠. 수직선에서도 0에서 거리 3인 수는 +3과 −3 <b>둘</b>이에요. 방향을 지운 크기, 절댓값을 배워요.",
          onDone: finish,
        });
      }, 700);
    }, 1150);
  });
}

/* ── L8 golfscore, 골프, 낮을수록 이기는 게임 ───────────────── */
function renderGolfscore(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]): void {
  const fig = el("div", {});
  const card = (x: number, name: string, r1: string, r2: string, sum: string, cls: string, col: string): string =>
    `<g class="${cls}">
      <rect x="${x}" y="44" width="128" height="124" rx="14" fill="url(#gf-cd)" stroke="#B9C6D2" stroke-width="1.6"/>
      <rect x="${x}" y="44" width="128" height="34" rx="14" fill="${col}"/>
      <rect x="${x}" y="66" width="128" height="12" fill="${col}"/>
      <text x="${x + 64}" y="67" text-anchor="middle" font-size="14" font-weight="900" fill="#fff">${name}</text>
      <text x="${x + 20}" y="102" font-size="12.5" font-weight="700" fill="#54677A">1라운드</text>
      <text x="${x + 108}" y="102" text-anchor="end" font-size="14" font-weight="900" fill="#1E2A38">${r1}</text>
      <text x="${x + 20}" y="126" font-size="12.5" font-weight="700" fill="#54677A">2라운드</text>
      <text x="${x + 108}" y="126" text-anchor="end" font-size="14" font-weight="900" fill="#1E2A38">${r2}</text>
      <line x1="${x + 14}" y1="136" x2="${x + 114}" y2="136" stroke="#D5DDE6" stroke-width="1.6"/>
      <text x="${x + 20}" y="158" font-size="12.5" font-weight="800" fill="#54677A">합계</text>
      <text x="${x + 108}" y="158" text-anchor="end" font-size="16" font-weight="900" class="gf-sum" fill="#0A87A3" opacity="0" style="transition: opacity .5s">${sum}</text>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 184, 104, 0.1)}
    ${card(42, "선수 A", "−6", "−2", "−8", "gf-a", "#0DA5C6")}
    ${card(190, "선수 B", "+3", "−7", "−4", "gf-b", "#8A6EE0")}
    <text x="180" y="28" text-anchor="middle" font-size="12.5" font-weight="800" fill="#54677A">골프는 점수가 낮을수록 이겨요</text>`,
    `<linearGradient id="gf-cd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF3F8"/></linearGradient>`,
  );
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "합계 공개" }));
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "골프에선 기준 타수보다 잘 치면 <b>−</b>, 못 치면 <b>+</b>로 기록해요. 두 라운드 점수를 합쳐 볼까요?";
  btn.addEventListener("click", () => {
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    fig.querySelectorAll(".gf-sum").forEach((t) => ((t as SVGTextElement).style.opacity = "1"));
    face("curious");
    helper.innerHTML = "A는 (−6)+(−2)=<b>−8</b>, B는 (+3)+(−7)=<b>−4</b>. 그래서… 우승은 누구일까요?";
    window.setTimeout(() => {
      ask(box, helper, {
        choices: choices ?? ["A 선수, −8이 −4보다 낮다", "B 선수, 4가 8보다 작으니까", "동점이다"],
        good: "정답! 수직선에서 −8은 −4보다 <b>왼쪽</b>, 더 낮은 점수예요. 그런데 방금 한 (−6)+(−2), (+3)+(−7) 같은 계산, 규칙이 뭘까요? 돌멩이로 직접 만들어 봐요.",
        bad: "숫자만 보면 4<8이지만, 음수는 <b>절댓값이 클수록 더 작아요(더 왼쪽)</b>, −8이 −4보다 낮은 점수라 A의 우승! 이런 부호 있는 덧셈의 규칙을 지금 만들어 봐요.",
        onDone: finish,
      });
    }, 800);
  });
}

/* ── L9 daytemp, 일교차의 함정 ──────────────────────────────── */
function renderDaytemp(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]): void {
  const fig = el("div", {});
  const draw = (night: boolean): void => {
    const t = night ? -7 : 3;
    const mercH = ((t + 10) / 25) * 96; // -10..15 스케일
    fig.innerHTML = wrapSvg(
      `${SHADOW(180, 188, 80, 0.1)}
      <rect x="30" y="16" width="300" height="168" rx="14" fill="url(#dt-sky${night ? "N" : "D"})" stroke="#B9C6D2" stroke-width="1.4"/>
      ${night
        ? `<circle cx="286" cy="52" r="17" fill="#F4F0DC"/><circle cx="279" cy="48" r="15" fill="url(#dt-skyN)"/><circle cx="240" cy="38" r="1.6" fill="#fff"/><circle cx="260" cy="70" r="1.3" fill="#fff"/><circle cx="312" cy="76" r="1.5" fill="#fff"/>`
        : `<circle cx="286" cy="54" r="19" fill="url(#dt-sun)"/><g stroke="#F5C13D" stroke-width="2.6" stroke-linecap="round"><line x1="286" y1="24" x2="286" y2="32"/><line x1="286" y1="76" x2="286" y2="84"/><line x1="256" y1="54" x2="264" y2="54"/><line x1="308" y1="54" x2="316" y2="54"/></g>`}
      <path d="M30 152 q60 -22 120 -8 t 180 -6 v46 h-300 z" fill="url(#dt-hill${night ? "N" : "D"})"/>
      <rect x="70" y="52" width="34" height="112" rx="17" fill="#F2F6FA" stroke="#8C99A8" stroke-width="1.8"/>
      <rect x="82" y="${160 - mercH}" width="10" height="${mercH}" rx="5" fill="${night ? "#4A7DE0" : "#E8434F"}" style="transition: all .5s"/>
      <circle cx="87" cy="164" r="13" fill="${night ? "#4A7DE0" : "#E8434F"}"/>
      <g><rect x="128" y="52" width="94" height="40" rx="10" fill="#1E2A38"/><text x="175" y="79" text-anchor="middle" font-size="18" font-weight="900" fill="${night ? "#8FD4FF" : "#FFD98A"}">${night ? "−7℃" : "+3℃"}</text></g>
      <text x="175" y="112" text-anchor="middle" font-size="12.5" font-weight="800" fill="${night ? "#DDE8F4" : "#54677A"}">${night ? "한밤" : "한낮"}</text>`,
      `<linearGradient id="dt-skyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE4F8"/><stop offset="1" stop-color="#E8F4FB"/></linearGradient>
      <linearGradient id="dt-skyN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2A44"/><stop offset="1" stop-color="#3A4A6E"/></linearGradient>
      <radialGradient id="dt-sun" cx=".4" cy=".35" r=".9"><stop offset="0" stop-color="#FFE9A0"/><stop offset="1" stop-color="#F5B23D"/></radialGradient>
      <linearGradient id="dt-hillD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CD489"/><stop offset="1" stop-color="#5FA860"/></linearGradient>
      <linearGradient id="dt-hillN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E5A52"/><stop offset="1" stop-color="#2A4038"/></linearGradient>`,
    );
  };
  draw(false);
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "밤으로 넘기기" }));
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "봄날 한낮은 <b>+3℃ </b>, 그런데 밤이 되면 뚝 떨어져요.";
  let night = false;
  let asked = false;
  btn.addEventListener("click", () => {
    night = !night;
    haptic(HAPTIC.select);
    draw(night);
    (btn.querySelector("span") as HTMLElement).textContent = night ? "낮으로 돌리기" : "밤으로 넘기기";
    if (night && !asked) {
      asked = true;
      face("curious");
      helper.innerHTML = "한밤엔 <b>−7℃</b>! 그럼 이날의 일교차, <b>낮 기온에서 밤 기온을 뺀 값</b>은 몇 도일까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? ["10도", "4도", "−4도"],
          good: "정답! 수직선에서 +3과 −7 사이는 <b>10칸</b>이에요. 그런데 식으로 쓰면 (+3)−(−7), 음수를 빼는데 왜 커질까요? 오늘 그 마법을 풀어요.",
          bad: "3−7=4로 계산했다면 함정에 빠진 거예요, 밤 기온은 <b>−7</b>! 수직선에서 +3과 −7 사이는 <b>10칸</b>, 식으로는 (+3)−(−7)=+10. '음수 빼기'의 비밀을 지금 배워요.",
          onDone: finish,
        });
      }, 600);
    }
  });
}

/* ── L10 rewind, 거꾸로 재생의 마법 ─────────────────────────── */
function renderRewind(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]): void {
  const fig = el("div", {});
  // 측면 스틱맨(오른쪽을 보는 옆모습): 엉덩이 관절이 로컬 (0,0), 팔다리는 관절 회전(.rw-limb).
  // "뒤로 걷기" = 몸은 오른쪽을 향한 채 왼쪽으로 이동. 역재생하면 오른쪽으로 이동 = 앞으로 걷는 듯 보인다.
  const GROUND = 132;
  const MAN_Y = GROUND - 30; // 엉덩이 높이(다리 29 + 여유)
  const X0 = 236; // 시작 x
  const X1 = 96; // 재생 후 x(왼쪽으로 140px 후진)
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 188, 96, 0.11)}
    <rect x="30" y="12" width="300" height="172" rx="16" fill="url(#rw-bz)" stroke="#101A28" stroke-width="2"/>
    <rect x="40" y="22" width="280" height="124" rx="9" fill="url(#rw-sky)" stroke="#2A3646" stroke-width="1.4"/>
    <circle cx="292" cy="44" r="12" fill="url(#rw-sun)"/>
    <path d="M58 ${GROUND} q10 -12 22 0 M232 ${GROUND} q11 -13 24 0" fill="url(#rw-bush)" stroke="#5E8A5E" stroke-width="1.3"/>
    <line x1="42" y1="${GROUND}" x2="318" y2="${GROUND}" stroke="#7AA05E" stroke-width="2.4" stroke-linecap="round"/>
    <g class="rw-man" style="transform: translate(${X0}px, ${MAN_Y}px); transition: transform 2.1s linear">
      <g transform="translate(0,-28)"><path class="rw-limb rw-armB" d="M0 0 L6 13 l6.5 2" stroke="#5E718A" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      <path d="M0 0 L0 -30" stroke="#39424E" stroke-width="2.8" stroke-linecap="round"/>
      <circle cx="3" cy="-41" r="9.5" fill="#FFFFFF" stroke="#39424E" stroke-width="2.4"/>
      <circle cx="8.5" cy="-43" r="1.6" fill="#39424E"/>
      <path d="M11.5 -39.5 h2.5" stroke="#39424E" stroke-width="1.6" stroke-linecap="round"/>
      <g transform="translate(0,0)"><path class="rw-limb rw-legB" d="M0 0 L3 15 L1.5 29 l7 1.5" stroke="#39424E" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g transform="translate(0,0)"><path class="rw-limb rw-legF" d="M0 0 L3 15 L1.5 29 l7 1.5" stroke="#39424E" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g transform="translate(0,-28)"><path class="rw-limb rw-armF" d="M0 0 L6 13 l6.5 2" stroke="#39424E" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    </g>
    <g class="rw-rev" style="opacity:0; transition: opacity .3s ease">
      <path d="M64 36 l-9 6 9 6 z M74 36 l-9 6 9 6 z" fill="#7FE0D2"/>
    </g>
    <rect x="40" y="152" width="280" height="24" rx="7" fill="#16202E"/>
    <circle cx="58" cy="164" r="8" fill="#2FA8C4"/>
    <path d="M55.5 160 v8 l7 -4 z" fill="#fff"/>
    <rect x="76" y="161.5" width="216" height="5" rx="2.5" fill="#4E5968"/>
    <rect x="76" y="161.5" width="34" height="5" rx="2.5" fill="#7FE0D2" class="rw-bar" style="transition: width 2.1s linear"/>
    <text x="180" y="40" text-anchor="middle" font-size="12" font-weight="800" fill="#64788C" class="rw-cap">뒤로 걷는 사람.mp4</text>`,
    `<linearGradient id="rw-bz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E3C50"/><stop offset=".55" stop-color="#1E2A38"/><stop offset="1" stop-color="#141E2A"/></linearGradient>
    <linearGradient id="rw-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF5FE"/><stop offset=".7" stop-color="#D8ECFA"/><stop offset="1" stop-color="#CCE4F4"/></linearGradient>
    <radialGradient id="rw-sun" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#FFF3D6"/><stop offset="1" stop-color="#FFD44A"/></radialGradient>
    <linearGradient id="rw-bush" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8D89A"/><stop offset="1" stop-color="#7AB870"/></linearGradient>`,
  );
  const btnPlay = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "재생 ▸" }));
  const btnRev = el("button", { class: "swapbtn", attrs: { type: "button", style: "display:none" } }, el("span", { text: "◂ 거꾸로 재생" }));
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btnPlay, btnRev, box);
  helper.innerHTML = "스틱맨이 <b>뒤로 걷는</b> 영상이 있어요(오른쪽을 본 채 등 방향으로 걸어요). 먼저 그냥 재생해 볼까요?";
  const man = (): SVGGElement => fig.querySelector(".rw-man") as SVGGElement;
  const bar = (): SVGRectElement => fig.querySelector(".rw-bar") as SVGRectElement;
  btnPlay.addEventListener("click", () => {
    (btnPlay as HTMLButtonElement).disabled = true;
    btnPlay.classList.remove("pulse");
    haptic(HAPTIC.select);
    man().classList.add("rw-walk");
    man().style.transform = `translate(${X1}px, ${MAN_Y}px)`;
    bar().setAttribute("width", "216");
    window.setTimeout(() => {
      man().classList.remove("rw-walk");
      helper.innerHTML = "몸은 오른쪽을 보는데 <b>등 쪽(왼쪽)으로</b> 걸어갔죠? 이게 뒤로 걷기(−방향). 이제 이 영상을 <b>거꾸로</b> 돌리면 어떻게 보일까요?";
      btnRev.style.display = "";
      btnRev.classList.add("pulse");
      face("curious");
    }, 2200);
  });
  btnRev.addEventListener("click", () => {
    (btnRev as HTMLButtonElement).disabled = true;
    btnRev.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".rw-cap") as SVGTextElement).textContent = "뒤로 걷는 사람.mp4, 역재생 중";
    (fig.querySelector(".rw-rev") as SVGGElement).style.opacity = "1";
    man().classList.add("rw-walk");
    man().style.transform = `translate(${X0}px, ${MAN_Y}px)`;
    bar().setAttribute("width", "34");
    window.setTimeout(() => {
      man().classList.remove("rw-walk");
      ask(box, helper, {
        choices: choices ?? ["앞으로 걷는 것처럼 보인다", "더 빨리 뒤로 걷는다", "그 자리에 멈춰 있다"],
        good: "바로 그거예요, <b>반대(−)를 반대(−)로 하면 원래 방향(+)</b>! 방금 눈으로 본 이 느낌이 (−)×(−)=(+)의 정체예요. 이제 수의 패턴으로 증명해 봐요.",
        bad: "다시 보면, 뒤로 걷던 발걸음이 거꾸로 감기니 몸이 향한 쪽으로 나아가 <b>앞으로 걷는 것처럼</b> 보였죠? 반대(−)의 반대(−)는 원래 방향(+), (−)×(−)=(+)를 수의 패턴으로 확인하러 가요.",
        onDone: finish,
      });
    }, 2250);
  });
}

/* ── L11 mentalmath, 암산왕의 비밀 ──────────────────────────── */
function renderMentalmath(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]): void {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 190, 92, 0.11)}
    <rect x="44" y="20" width="272" height="128" rx="10" fill="url(#mm-bd)" stroke="#3E5A52" stroke-width="3"/>
    <rect x="44" y="20" width="272" height="128" rx="10" fill="none" stroke="#8C6A42" stroke-width="1.4" opacity=".5"/>
    <text x="180" y="78" text-anchor="middle" font-size="30" font-weight="900" fill="#F6FBEA" style="letter-spacing:.04em">98 × 5 = ?</text>
    <text x="180" y="118" text-anchor="middle" font-size="15" font-weight="800" fill="#9FE8C8" class="mm-ans" opacity="0" style="transition: opacity .4s">“490!”, 0.87초</text>
    <g class="mm-watch" style="transition: transform .3s">
      <circle cx="296" cy="166" r="20" fill="url(#mm-wt)" stroke="#54677A" stroke-width="2"/>
      <rect x="292" y="140" width="8" height="7" rx="2" fill="#54677A"/>
      <line x1="296" y1="166" x2="296" y2="152" stroke="#E8434F" stroke-width="2.4" stroke-linecap="round" class="mm-hand" style="transition: transform .8s linear; transform-origin: 296px 166px"/>
    </g>`,
    `<linearGradient id="mm-bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3E6A5C"/><stop offset="1" stop-color="#2A4A40"/></linearGradient>
    <radialGradient id="mm-wt" cx=".38" cy=".3" r=".95"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9D6E2"/></radialGradient>`,
  );
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "스톱워치 시작" }));
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "옆 반 암산왕에게 <b>98×5</b>를 냈어요. 스톱워치, 준비… 시작!";
  btn.addEventListener("click", () => {
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".mm-hand") as SVGLineElement).style.transform = "rotate(313deg)";
    window.setTimeout(() => {
      (fig.querySelector(".mm-ans") as SVGTextElement).style.opacity = "1";
      haptic(HAPTIC.correct);
      face("surprised");
      helper.innerHTML = "1초도 안 걸렸어요! 필기도 없이. 암산왕의 <b>비법</b>은 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "98을 100−2로 바꿔서 500−10을 계산했다",
            "구구단을 98단까지 외우고 있다",
            "미리 답을 알고 있었다",
          ],
          good: "들켰네요! <b>(100−2)×5 = 100×5 − 2×5 = 500−10 = 490</b>. 쪼개서 각각 곱해도 되는 이 규칙(분배법칙)이 오늘의 무기예요, 넓이로 직접 확인해 봐요.",
          bad: "98단은 없어요! 비밀은 <b>98 = 100−2</b>로 바꿔치기, (100−2)×5 = 500−10 = 490. 쪼개서 각각 곱해도 결과가 같은 규칙, 넓이로 확인하러 가요.",
          onDone: finish,
        });
      }, 700);
    }, 950);
  });
}

/* ── L12 snsdebate, 댓글창을 불태운 계산 ────────────────────── */
function renderSnsdebate(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]): void {
  const fig = el("div", {});
  const draw = (l1: number, l2: number): void => {
    fig.innerHTML = wrapSvg(
      `${SHADOW(180, 196, 86, 0.1)}
      <rect x="58" y="10" width="244" height="190" rx="18" fill="url(#sd-ph)" stroke="#39424E" stroke-width="2.2"/>
      <rect x="74" y="24" width="212" height="40" rx="10" fill="#EEF3F8" stroke="#D5DDE6" stroke-width="1.2"/>
      <text x="180" y="50" text-anchor="middle" font-size="17" font-weight="900" fill="#1E2A38">6 ÷ 2 × (1+2) = ?</text>
      <g>
        <rect x="74" y="76" width="212" height="44" rx="10" fill="#E6F7FB" stroke="#9ADEED" stroke-width="1.2"/>
        <text x="86" y="95" font-size="12.5" font-weight="800" fill="#0A87A3">답은 1이지!! 2×(1+2) 먼저 묶어야지</text>
        <text x="86" y="112" font-size="11" font-weight="700" fill="#54677A">좋아요 ${l1}</text>
      </g>
      <g>
        <rect x="74" y="128" width="212" height="44" rx="10" fill="#F3EFFC" stroke="#CBB9F2" stroke-width="1.2"/>
        <text x="86" y="147" font-size="12.5" font-weight="800" fill="#6A55F2">9라니까?? 왼쪽부터 차례로 해야지</text>
        <text x="86" y="164" font-size="11" font-weight="700" fill="#54677A">좋아요 ${l2}</text>
      </g>`,
      `<linearGradient id="sd-ph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EAF0F6"/></linearGradient>`,
    );
  };
  draw(1024, 998);
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "댓글창 구경하기" }));
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "어젯밤 SNS를 불태운 문제예요. 댓글창이 <b>1파</b>와 <b>9파</b>로 갈라져 싸우는 중!";
  btn.addEventListener("click", () => {
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    let k = 0;
    const bump = (): void => {
      k += 1;
      draw(1024 + k * 37, 998 + k * 41);
      if (k < 4) window.setTimeout(bump, 260);
      else {
        face("curious");
        helper.innerHTML = "좋아요가 미친 듯이 올라가요. 단원 마지막 문제, <b>누가 맞을까요?</b>";
        window.setTimeout(() => {
          ask(box, helper, {
            choices: choices ?? [
              "9, 괄호 먼저, 그다음 ÷와 ×는 왼쪽부터",
              "1, 2×(1+2)를 통째로 먼저 계산",
              "둘 다 맞는 답이다",
            ],
            good: "규칙이 싸움을 끝내요: 괄호 안 (1+2)=3 먼저 → 6÷2×3은 <b>왼쪽부터</b> → 3×3=<b>9</b>. 이 계산 순서 규칙을 지금부터 정식으로 배워요!",
            bad: "아쉽지만 규칙은 하나예요, 괄호 안 (1+2)=3을 먼저, 그다음 ÷와 ×는 <b>왼쪽부터 차례로</b>: 6÷2=3, 3×3=<b>9</b>. 답이 두 개인 수학은 없죠. 그 규칙을 지금부터 정식으로 배워요!",
            onDone: finish,
          });
        }, 500);
      }
    };
    bump();
  });
}
