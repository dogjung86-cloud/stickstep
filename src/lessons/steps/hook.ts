// hook — 스틱맨 쌤 도입 스텝. 짧은 말풍선 + "미세 상호작용"으로 궁금증을 만든다.
// 표준 레슨 공식의 1단계: hook(도입) → 랩(핵심 상호작용) → recap(정리) → 문제.
// scene:
//   "cups"  — 겉보기에 똑같은 두 컵을 만져(눌러) 보고 온도가 다름을 발견
//   "egg"   — 갓 삶은 달걀을 찬물에 퐁당 넣고, 이후를 예측(채점 없음, 사전 예측 효과)
//   "beach" — 한여름 해변: 모래를 밟고 바닷물에 발을 담가 보고, 같은 햇볕인데 왜 다른지 궁금증
//   "wire"  — 전깃줄: 여름/겨울을 오가며 늘어짐·팽팽함을 관찰하고 까닭을 예측
//   ── IV 물질의 상태 변화 ──
//   "smell" — 급식실: 뚜껑을 열면 냄새가 교실 끝까지 — 어떻게 왔는지 예측
//   "juice" — 쏟아진 주스와 얼음: 얼음은 집히고 주스는 흐른다 — 두 가지 다 시도
//   "wrap"  — 배달 음식 랩: 뜨거운 그릇에 랩을 씌우면 볼록 — 까닭을 예측
//   "ramen" — 끓는 라면 물: 불을 최대로 올리면 온도가 더 오를지 예측
//   ── V 힘의 작용 (렌더러는 hookForce.ts) ──
//   "balloon" 풍선 줄 · "tugrope" 멈춘 줄다리기+예측 · "bow" 활쏘기 ·
//   "iceslip" 빙판vs자갈길+예측 · "bottle" 페트병 밀어넣기 · "rollstop" 멈추는 공+예측
//   ── VI 기체의 성질 (렌더러는 hookGas.ts) ──
//   "polar" 북극곰 얼음판+예측 · "bubblewrap" 뽁뽁이 · "foilballoon" 은박 풍선 안↔밖 ·
//   "pingpong" 찌그러진 탁구공+예측
//   ── VII 태양계 (렌더러는 hookSpace.ts) ──
//   "stargaze" 밤하늘 밝은 점 · "planetsize" 지구 11개=목성+예측 · "shadowclock" 시계탑 그림자+예측 ·
//   "moonpic" 달 사진 비교+예측 · "sunglasses" 태양 관측 안경+예측
//   ── 중2 III 빛과 파동 (렌더러는 hookLight.ts) ──
//   "mirrortown" 산 위 거울로 마을 비추기 · "coinmagic" 물 부으면 동전+예측 ·
//   "darkroom" 전등 켜기+오개념 예측 · "catmirror" 거울 고양이 앞발+예측 · "spoon" 숟가락 앞뒤 ·
//   "pointillism" 점묘화 확대+예측 · "fishing" 낚시찌 물결+예측 · "kalimba" 칼림바 두 막대+예측

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { stickAvatar, setStickAvatar, type AvatarKind } from "../../ui/avatar";
import { ask } from "./hookAsk";
import {
  renderThreeCities, renderStiltHouse, renderSkyRoute, renderAvocado, renderMaasai, renderIloveNyc,
} from "./hookSoc";
import {
  renderAsianGames, renderMonsoonRain, renderTempleTrip, renderHalalMark,
  renderTrainRide, renderEmptyClass, renderMadeIn, renderFanchant,
} from "./hookSoc2";
import {
  renderDawnSoccer, renderPeakHike, renderFrozenRiver, renderCityFeed,
  renderSkiSlope, renderTrainBorder, renderFourShirts,
} from "./hookSoc3";
import {
  renderMapPuzzle, renderSatNile, renderHerdMove, renderShadeLane,
  renderMovieNight, renderClassPhoto, renderFlagStars, renderGreenLine,
} from "./hookSoc4";
import {
  renderSearchAmerica, renderPanRoad, renderQuitoPack, renderTeamRoster,
  renderDinnerTable, renderFruitLogo, renderMotorCity,
} from "./hookSoc5";
import {
  renderSaveIcon, renderGameChar, renderTimeCapsule, renderDangi, renderMilmyeon,
} from "./hookHis";
import { renderHis2 } from "./hookHis2";
import { renderHis3 } from "./hookHis3";
import { renderHis4 } from "./hookHis4";
import { renderSoc6 } from "./hookSoc6";
import { renderSoc7 } from "./hookSoc7";
import { renderSoc8 } from "./hookSoc8";
import { renderSoc9 } from "./hookSoc9";
import { renderSoc10 } from "./hookSoc10";
import { renderSoc11 } from "./hookSoc11";
import { renderSoc12 } from "./hookSoc12";
import type { StepAPI, StepRenderer } from "../types";

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

/** 장면 소품 아트 — 발주 래스터(public/hooks/<name>.png)를 쓰고, 없으면 SVG로 폴백.
 *  상태 변형(뜨거움/차가움, 전/후, 계절)은 set()으로 이미지를 교체한다.
 *  폴백 SVG는 컨테이너의 상태 클래스(CSS)로 반응하므로 교체 없이 그대로 둔다. */
function sceneArt(name: string, fallback: string): { el: HTMLElement; set: (n: string) => void } {
  const wrap = el("span", { class: "hook-art" });
  let broken = false;
  const mount = (n: string): void => {
    if (broken) return;
    wrap.innerHTML = "";
    const img = el("img", { attrs: { src: `${base}hooks/${n}.png`, alt: "", "aria-hidden": "true", loading: "eager" } });
    img.addEventListener("error", () => {
      broken = true;
      wrap.innerHTML = fallback;
    });
    wrap.appendChild(img);
  };
  mount(name);
  return { el: wrap, set: mount };
}

interface HookStep {
  title: string;
  lead?: string;
  narrator: string; // 시작 말풍선(HTML)
  done?: string; // 상호작용 완료 후 말풍선(HTML)
  scene: "cups" | "egg" | "beach" | "wire" | "smell" | "juice" | "wrap" | "ramen" | "balloon" | "tugrope" | "bow" | "iceslip" | "bottle" | "rollstop"
    | "polar" | "bubblewrap" | "foilballoon" | "pingpong"
    | "stargaze" | "planetsize" | "shadowclock" | "moonpic" | "sunglasses"
    | "colorcups" | "speaker" | "smokestack"
    | "cellzoom" | "stain" | "bodycount" | "fingerprint" | "batbird" | "foodweb"
    | "rings" | "deadsea" | "cocoa" | "fishmouth" | "gallium" | "milkzoom" | "soysauce" | "syrup" | "perfume"
    | "stripemount" | "foolsgold" | "dolstatue" | "bookcliff" | "pressrock" | "cappadocia" | "gravestone" | "puzzlemap" | "quakenews" | "eggearth"
    | "mirrortown" | "coinmagic" | "darkroom" | "catmirror" | "spoon" | "pointillism" | "fishing" | "kalimba"
    | "zoomtwo" | "signs" | "peekatom" | "menusort" | "springwater" | "magnetpull"
    | "potmass" | "waterweed" | "windowplant" | "bedroomplant" | "germinating" | "fruitthinning"
    | "sproutpot" | "stomapeek" | "darkbox" | "mixedtest" | "greenhouse" | "mangrove" | "honeyflower"
    | "potatodrop" | "winterberry" | "veggiebag" | "tropicalnight" | "sweetpotato"
    // 중2 Ⅵ v3 훅 5장면(hookBody3.ts, 2026-08-10 재제작)
    | "bodyscan" | "dripbag" | "hiccup" | "peetest" | "warmbody"
    | "wintershock" | "balloondoll" | "deadclock" | "brightpair" | "multitap" | "labelpeek" | "compasswire" | "ebike"
    | "thumbjump" | "nightroad" | "brightlie" | "gasflame" | "milkyband" | "orionblur" | "movingstar"
    | "breadonly" | "chewrice" | "pulse" | "deepbreath" | "peecolor" | "afterrun"
    | "celldot" | "slidepress" | "signalrun" | "blockflower" | "biomedoor"
    | "beakpick" | "batwho" | "noplant" | "seedvault" | "scalezoom"
    | "breadfactory" | "waterlens" | "blooddrop" | "brickhouse"
    | "dokdofriends" | "martshelf" | "mushroomscan" | "beegone"
    | "threecities" | "stilthouse" | "skyroute" | "avocado" | "maasai" | "ilovenyc"
    | "asiangames" | "monsoonrain" | "templetrip" | "halalmark" | "trainride" | "emptyclass" | "madein" | "fanchant"
    | "dawnsoccer" | "peakhike" | "frozenriver" | "cityfeed" | "skislope" | "trainborder" | "fourshirts"
    | "mappuzzle" | "satnile" | "herdmove" | "shadelane" | "movienight" | "classphoto" | "flagstars" | "greenline"
    | "searchamerica" | "panroad" | "quitopack" | "teamroster" | "dinnertable" | "fruitlogo" | "motorcity"
    | "saveicon" | "gamechar" | "timecapsule" | "dangi" | "milmyeon";
  choices?: string[]; // egg·wire·smell·wrap·ramen 예측 선택지
  cta?: string;
}

export const hook: StepRenderer = (host, step, api) => {
  const s = step as unknown as HookStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const bubble = el("div", { class: "comic-bubble", html: s.narrator });
  const avatar = stickAvatar("smile");
  const face = (kind: AvatarKind): void => setStickAvatar(avatar, kind);
  host.appendChild(
    el(
      "div",
      { class: "comic-narrator" },
      el("div", { class: "comic-avatar" }, avatar),
      bubble,
    ),
  );

  const scene = el("div", { class: "hook-scene" });
  const helper = el("div", { class: "helper", attrs: { role: "status", "aria-live": "polite" } });
  host.append(scene, helper);

  function finish(): void {
    if (s.done) bubble.innerHTML = s.done;
    api.enableCTA(s.cta ?? "실험실 열기");
    window.setTimeout(() => face("smile"), 900);
  }

  let sceneCleanup: (() => void) | undefined;
  if (s.scene === "threecities") sceneCleanup = renderThreeCities(scene, helper, s, finish, face);
  else if (s.scene === "stilthouse") sceneCleanup = renderStiltHouse(scene, helper, s, finish, face);
  else if (s.scene === "skyroute") sceneCleanup = renderSkyRoute(scene, helper, s, finish, face);
  else if (s.scene === "avocado") sceneCleanup = renderAvocado(scene, helper, s, finish, face);
  else if (s.scene === "maasai") sceneCleanup = renderMaasai(scene, helper, s, finish, face);
  else if (s.scene === "ilovenyc") sceneCleanup = renderIloveNyc(scene, helper, s, finish, face);
  else if (s.scene === "asiangames") sceneCleanup = renderAsianGames(scene, helper, s, finish, face);
  else if (s.scene === "monsoonrain") sceneCleanup = renderMonsoonRain(scene, helper, s, finish, face);
  else if (s.scene === "templetrip") sceneCleanup = renderTempleTrip(scene, helper, s, finish, face);
  else if (s.scene === "halalmark") sceneCleanup = renderHalalMark(scene, helper, s, finish, face);
  else if (s.scene === "trainride") sceneCleanup = renderTrainRide(scene, helper, s, finish, face);
  else if (s.scene === "emptyclass") sceneCleanup = renderEmptyClass(scene, helper, s, finish, face);
  else if (s.scene === "madein") sceneCleanup = renderMadeIn(scene, helper, s, finish, face);
  else if (s.scene === "fanchant") sceneCleanup = renderFanchant(scene, helper, s, finish, face);
  else if (s.scene === "dawnsoccer") sceneCleanup = renderDawnSoccer(scene, helper, s, finish, face);
  else if (s.scene === "peakhike") sceneCleanup = renderPeakHike(scene, helper, s, finish, face);
  else if (s.scene === "frozenriver") sceneCleanup = renderFrozenRiver(scene, helper, s, finish, face);
  else if (s.scene === "cityfeed") sceneCleanup = renderCityFeed(scene, helper, s, finish, face);
  else if (s.scene === "skislope") sceneCleanup = renderSkiSlope(scene, helper, s, finish, face);
  else if (s.scene === "trainborder") sceneCleanup = renderTrainBorder(scene, helper, s, finish, face);
  else if (s.scene === "fourshirts") sceneCleanup = renderFourShirts(scene, helper, s, finish, face);
  else if (s.scene === "mappuzzle") sceneCleanup = renderMapPuzzle(scene, helper, s, finish, face);
  else if (s.scene === "satnile") sceneCleanup = renderSatNile(scene, helper, s, finish, face);
  else if (s.scene === "herdmove") sceneCleanup = renderHerdMove(scene, helper, s, finish, face);
  else if (s.scene === "shadelane") sceneCleanup = renderShadeLane(scene, helper, s, finish, face);
  else if (s.scene === "movienight") sceneCleanup = renderMovieNight(scene, helper, s, finish, face);
  else if (s.scene === "classphoto") sceneCleanup = renderClassPhoto(scene, helper, s, finish, face);
  else if (s.scene === "flagstars") sceneCleanup = renderFlagStars(scene, helper, s, finish, face);
  else if (s.scene === "greenline") sceneCleanup = renderGreenLine(scene, helper, s, finish, face);
  else if (s.scene === "searchamerica") sceneCleanup = renderSearchAmerica(scene, helper, s, finish, face);
  else if (s.scene === "panroad") sceneCleanup = renderPanRoad(scene, helper, s, finish, face);
  else if (s.scene === "quitopack") sceneCleanup = renderQuitoPack(scene, helper, s, finish, face);
  else if (s.scene === "teamroster") sceneCleanup = renderTeamRoster(scene, helper, s, finish, face);
  else if (s.scene === "dinnertable") sceneCleanup = renderDinnerTable(scene, helper, s, finish, face);
  else if (s.scene === "fruitlogo") sceneCleanup = renderFruitLogo(scene, helper, s, finish, face);
  else if (s.scene === "motorcity") sceneCleanup = renderMotorCity(scene, helper, s, finish, face);
  else if (s.scene === "saveicon") sceneCleanup = renderSaveIcon(scene, helper, s, finish, face);
  else if (s.scene === "gamechar") sceneCleanup = renderGameChar(scene, helper, s, finish, face);
  else if (s.scene === "timecapsule") sceneCleanup = renderTimeCapsule(scene, helper, s, finish, face);
  else if (s.scene === "dangi") sceneCleanup = renderDangi(scene, helper, s, finish, face);
  else if (s.scene === "milmyeon") sceneCleanup = renderMilmyeon(scene, helper, s, finish, face);
  // 역사 Ⅱ 훅 7종은 hookHis2의 서브 디스패처가 처리(모르는 장면이면 null → 아래 체인 계속)
  else if ((sceneCleanup = renderHis2(s.scene, scene, helper, s, finish, face) ?? undefined)) { /* handled */ }
  // 역사 Ⅲ 훅 9종은 hookHis3의 서브 디스패처가 처리
  else if ((sceneCleanup = renderHis3(s.scene, scene, helper, s, finish, face) ?? undefined)) { /* handled */ }
  // 역사 Ⅳ 훅 9종은 hookHis4의 서브 디스패처가 처리
  else if ((sceneCleanup = renderHis4(s.scene, scene, helper, s, finish, face) ?? undefined)) { /* handled */ }
  // 사회 Ⅵ 훅 8종은 hookSoc6의 서브 디스패처가 처리
  else if ((sceneCleanup = renderSoc6(s.scene, scene, helper, s, finish, face) ?? undefined)) { /* handled */ }
  // 사회 Ⅶ 훅 7종은 hookSoc7의 서브 디스패처가 처리
  else if ((sceneCleanup = renderSoc7(s.scene, scene, helper, s, finish, face) ?? undefined)) { /* handled */ }
  // 사회 Ⅷ 훅 7종은 hookSoc8의 서브 디스패처가 처리
  else if ((sceneCleanup = renderSoc8(s.scene, scene, helper, s, finish, face) ?? undefined)) { /* handled */ }
  // 사회 Ⅸ 훅 7종은 hookSoc9의 서브 디스패처가 처리
  else if ((sceneCleanup = renderSoc9(s.scene, scene, helper, s, finish, face) ?? undefined)) { /* handled */ }
  // 사회 Ⅹ 훅 7종은 hookSoc10의 서브 디스패처가 처리
  else if ((sceneCleanup = renderSoc10(s.scene, scene, helper, s, finish, face) ?? undefined)) { /* handled */ }
  // 사회 Ⅺ 훅 6종은 hookSoc11의 서브 디스패처가 처리
  else if ((sceneCleanup = renderSoc11(s.scene, scene, helper, s, finish, face) ?? undefined)) { /* handled */ }
  // 사회 Ⅻ 훅 6종은 hookSoc12의 서브 디스패처가 처리
  else if ((sceneCleanup = renderSoc12(s.scene, scene, helper, s, finish, face) ?? undefined)) { /* handled */ }
  else sceneCleanup = renderEgg(scene, helper, s, finish, api, face);

  api.setCTA("스틱맨 쌤과 먼저 관찰해요", { enabled: false });
  return () => sceneCleanup?.();
};

// ── 장면 2: 갓 삶은 달걀 퐁당 + 예측 ─────────────────────────
function eggSvg(): string {
  return `<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <!-- 유리컵(찬물) -->
    <path d="M156 46h56l-4 66a6 6 0 0 1-6 6h-36a6 6 0 0 1-6-6z" fill="#F4F8FE" stroke="#4E5968" stroke-width="3"/>
    <path d="M160.5 62c5 3 14 3 21.5 0s16.5-3 21.5 0l-3.2 48a5 5 0 0 1-5 4.6h-26.6a5 5 0 0 1-5-4.6z" fill="#CFE4FF" stroke="none" opacity=".9"/>
    <path d="M166 40v-6M175 42v-8M184 40v-6" stroke="#5AA2F8" stroke-width="2.4" opacity=".7"/>
    <!-- 접시 + 달걀 -->
    <ellipse cx="62" cy="112" rx="40" ry="9" fill="#EDF1F6" stroke="#C4CAD2" stroke-width="2.4"/>
    <g class="hk-egg">
      <g class="hk-eggsteam" stroke="#FF8A5C" stroke-width="2.8">
        <path d="M52 66c-2.5-4.5 2.5-6 0-10.5"/>
        <path d="M62 64c-2.5-4.5 2.5-6 0-10.5"/>
        <path d="M72 66c-2.5-4.5 2.5-6 0-10.5"/>
      </g>
      <ellipse cx="62" cy="92" rx="16" ry="20" fill="#FFFDF6" stroke="#4E5968" stroke-width="3"/>
      <path d="M55 82c-2 3-3 6-3 9" stroke="#D8DEE8" stroke-width="2.4"/>
    </g>
    <!-- 첨벙 -->
    <g class="hk-splash" stroke="#5AA2F8" stroke-width="2.8">
      <path d="M164 58l-7-9M184 54v-11M204 58l7-9"/>
    </g>
  </svg>`;
}

function renderEgg(scene: HTMLElement, helper: HTMLElement, s: HookStep, finish: () => void, api: StepAPI, face: (k: AvatarKind) => void): () => void {
  const art = sceneArt("egg-before", eggSvg());
  const fig = el("button", { class: "hook-egg", attrs: { type: "button", "aria-label": "달걀을 찬물에 넣기" } }, art.el);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "김이 나는 <b>갓 삶은 달걀</b>을 눌러 찬물에 넣어 보세요.";

  let dropped = false;
  let dropTimer = 0;
  fig.addEventListener("click", () => {
    if (dropped) return;
    dropped = true;
    fig.classList.add("dropped");
    art.set("egg-after");
    (fig as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    dropTimer = window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "퐁당! 시간이 지나면 달걀과 찬물은 <b>어떻게 될까요?</b> 예상을 골라 보세요.";
      ask(choicesBox, helper, {
        choices: s.choices ?? ["달걀은 식고, 물은 미지근해진다", "달걀만 식는다", "물만 미지근해진다"],
        good: "좋은 예측이에요! 뜨거운 달걀은 <b>식고</b>, 찬물은 <b>미지근</b>해져요. 둘 다 변해요. 무대에서 직접 확인!",
        bad: "한쪽만 변하는 게 아니에요. 뜨거운 달걀은 <b>식고</b>, 동시에 찬물은 <b>미지근</b>해져요. 열이 옮겨 가거든요. 무대에서 직접 확인해 봐요.",
        onDone: finish,
      });
      api.snack("예상을 골라 보세요");
    }, 750);
  });
  return () => window.clearTimeout(dropTimer);
}
