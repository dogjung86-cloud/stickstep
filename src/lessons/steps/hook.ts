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
import { renderBalloon, renderTugRope, renderBow, renderIceslip, renderBottle, renderRollStop } from "./hookForce";
import { renderPolar, renderBubblewrap, renderFoilballoon, renderPingpong } from "./hookGas";
import { renderStargaze, renderPlanetSize, renderShadowClock, renderMoonPic, renderSunGlasses } from "./hookSpace";
import { renderColorCups, renderSpeaker, renderSmokestack } from "./hookCiv";
import { renderCellZoom, renderStain, renderBodyCount, renderFingerprint, renderBatBird, renderFoodWeb } from "./hookBio";
import { renderRings, renderDeadsea, renderCocoa, renderFishmouth, renderGallium, renderMilkzoom, renderSoysauce, renderSyrup, renderPerfume } from "./hookChem";
import { renderStripemount, renderFoolsgold, renderDolstatue, renderBookcliff, renderPressrock, renderCappadocia, renderGravestone, renderPuzzlemap, renderQuakenews, renderEggearth } from "./hookGeo";
import { ask } from "./hookAsk";
import {
  renderMirrorTown, renderCoinMagic, renderDarkroom, renderCatMirror,
  renderSpoon, renderPointillism, renderFishing, renderKalimba,
} from "./hookLight";
import {
  renderZoomTwo, renderSigns, renderPeekAtom, renderMenuSort, renderSpringWater, renderMagnetPull,
} from "./hookAtom";
import {
  renderWinterShock, renderBalloonDoll, renderDeadClock, renderBrightPair,
  renderMultiTap, renderLabelPeek, renderCompassWire, renderEbike,
} from "./hookElec";
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
    | "wintershock" | "balloondoll" | "deadclock" | "brightpair" | "multitap" | "labelpeek" | "compasswire" | "ebike";
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
  if (s.scene === "cups") renderCups(scene, helper, finish, face);
  else if (s.scene === "beach") renderBeach(scene, helper, finish, face);
  else if (s.scene === "wire") renderWire(scene, helper, s, finish, face);
  else if (s.scene === "smell") sceneCleanup = renderSmell(scene, helper, s, finish, face);
  else if (s.scene === "juice") renderJuice(scene, helper, finish, face);
  else if (s.scene === "wrap") sceneCleanup = renderWrap(scene, helper, s, finish, face);
  else if (s.scene === "ramen") sceneCleanup = renderRamen(scene, helper, s, finish, face);
  else if (s.scene === "balloon") sceneCleanup = renderBalloon(scene, helper, finish, face);
  else if (s.scene === "tugrope") sceneCleanup = renderTugRope(scene, helper, s, finish, face);
  else if (s.scene === "bow") sceneCleanup = renderBow(scene, helper, finish, face);
  else if (s.scene === "iceslip") sceneCleanup = renderIceslip(scene, helper, s, finish, face);
  else if (s.scene === "bottle") sceneCleanup = renderBottle(scene, helper, finish, face);
  else if (s.scene === "rollstop") sceneCleanup = renderRollStop(scene, helper, s, finish, face);
  else if (s.scene === "polar") sceneCleanup = renderPolar(scene, helper, s, finish, face);
  else if (s.scene === "bubblewrap") sceneCleanup = renderBubblewrap(scene, helper, finish, face);
  else if (s.scene === "foilballoon") sceneCleanup = renderFoilballoon(scene, helper, finish, face);
  else if (s.scene === "pingpong") sceneCleanup = renderPingpong(scene, helper, s, finish, face);
  else if (s.scene === "colorcups") sceneCleanup = renderColorCups(scene, helper, s, finish, face);
  else if (s.scene === "speaker") sceneCleanup = renderSpeaker(scene, helper, s, finish, face);
  else if (s.scene === "smokestack") renderSmokestack(scene, helper, s, finish, face);
  else if (s.scene === "cellzoom") renderCellZoom(scene, helper, finish, face);
  else if (s.scene === "stain") renderStain(scene, helper, s, finish, face);
  else if (s.scene === "bodycount") renderBodyCount(scene, helper, s, finish, face);
  else if (s.scene === "fingerprint") renderFingerprint(scene, helper, finish, face);
  else if (s.scene === "batbird") renderBatBird(scene, helper, s, finish, face);
  else if (s.scene === "foodweb") renderFoodWeb(scene, helper, s, finish, face);
  else if (s.scene === "zoomtwo") renderZoomTwo(scene, helper, finish, face);
  else if (s.scene === "signs") renderSigns(scene, helper, finish, face);
  else if (s.scene === "peekatom") renderPeekAtom(scene, helper, s, finish, face);
  else if (s.scene === "menusort") renderMenuSort(scene, helper, finish, face);
  else if (s.scene === "springwater") sceneCleanup = renderSpringWater(scene, helper, s, finish, face);
  else if (s.scene === "magnetpull") sceneCleanup = renderMagnetPull(scene, helper, s, finish, face);
  else if (s.scene === "wintershock") sceneCleanup = renderWinterShock(scene, helper, s, finish, face);
  else if (s.scene === "balloondoll") sceneCleanup = renderBalloonDoll(scene, helper, s, finish, face);
  else if (s.scene === "deadclock") sceneCleanup = renderDeadClock(scene, helper, s, finish, face);
  else if (s.scene === "brightpair") sceneCleanup = renderBrightPair(scene, helper, s, finish, face);
  else if (s.scene === "multitap") sceneCleanup = renderMultiTap(scene, helper, s, finish, face);
  else if (s.scene === "labelpeek") sceneCleanup = renderLabelPeek(scene, helper, s, finish, face);
  else if (s.scene === "compasswire") sceneCleanup = renderCompassWire(scene, helper, s, finish, face);
  else if (s.scene === "ebike") sceneCleanup = renderEbike(scene, helper, s, finish, face);
  else if (s.scene === "mirrortown") sceneCleanup = renderMirrorTown(scene, helper, finish, face);
  else if (s.scene === "coinmagic") sceneCleanup = renderCoinMagic(scene, helper, s, finish, face);
  else if (s.scene === "darkroom") sceneCleanup = renderDarkroom(scene, helper, s, finish, face);
  else if (s.scene === "catmirror") sceneCleanup = renderCatMirror(scene, helper, s, finish, face);
  else if (s.scene === "spoon") sceneCleanup = renderSpoon(scene, helper, finish, face);
  else if (s.scene === "pointillism") sceneCleanup = renderPointillism(scene, helper, s, finish, face);
  else if (s.scene === "fishing") sceneCleanup = renderFishing(scene, helper, s, finish, face);
  else if (s.scene === "kalimba") sceneCleanup = renderKalimba(scene, helper, s, finish, face);
  else if (s.scene === "stargaze") sceneCleanup = renderStargaze(scene, helper, finish, face);
  else if (s.scene === "planetsize") sceneCleanup = renderPlanetSize(scene, helper, s, finish, face);
  else if (s.scene === "shadowclock") renderShadowClock(scene, helper, s, finish, face);
  else if (s.scene === "moonpic") renderMoonPic(scene, helper, s, finish, face);
  else if (s.scene === "sunglasses") renderSunGlasses(scene, helper, s, finish, face);
  else if (s.scene === "rings") sceneCleanup = renderRings(scene, helper, s, finish, face);
  else if (s.scene === "deadsea") sceneCleanup = renderDeadsea(scene, helper, s, finish, face);
  else if (s.scene === "cocoa") sceneCleanup = renderCocoa(scene, helper, s, finish, face);
  else if (s.scene === "fishmouth") sceneCleanup = renderFishmouth(scene, helper, s, finish, face);
  else if (s.scene === "gallium") sceneCleanup = renderGallium(scene, helper, s, finish, face);
  else if (s.scene === "milkzoom") sceneCleanup = renderMilkzoom(scene, helper, s, finish, face);
  else if (s.scene === "soysauce") sceneCleanup = renderSoysauce(scene, helper, s, finish, face);
  else if (s.scene === "syrup") sceneCleanup = renderSyrup(scene, helper, s, finish, face);
  else if (s.scene === "perfume") sceneCleanup = renderPerfume(scene, helper, s, finish, face);
  else if (s.scene === "stripemount") sceneCleanup = renderStripemount(scene, helper, s, finish, face);
  else if (s.scene === "foolsgold") sceneCleanup = renderFoolsgold(scene, helper, s, finish, face);
  else if (s.scene === "dolstatue") sceneCleanup = renderDolstatue(scene, helper, s, finish, face);
  else if (s.scene === "bookcliff") sceneCleanup = renderBookcliff(scene, helper, s, finish, face);
  else if (s.scene === "pressrock") sceneCleanup = renderPressrock(scene, helper, s, finish, face);
  else if (s.scene === "cappadocia") sceneCleanup = renderCappadocia(scene, helper, s, finish, face);
  else if (s.scene === "gravestone") sceneCleanup = renderGravestone(scene, helper, s, finish, face);
  else if (s.scene === "puzzlemap") sceneCleanup = renderPuzzlemap(scene, helper, s, finish, face);
  else if (s.scene === "quakenews") sceneCleanup = renderQuakenews(scene, helper, s, finish, face);
  else if (s.scene === "eggearth") sceneCleanup = renderEggearth(scene, helper, s, finish, face);
  else sceneCleanup = renderEgg(scene, helper, s, finish, api, face);

  api.setCTA("스틱맨 쌤과 먼저 관찰해요", { enabled: false });
  return () => sceneCleanup?.();
};

// ── 장면 1: 똑같아 보이는 두 컵 ─────────────────────────────
function cupSvg(): string {
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <!-- 김(뜨거움) -->
    <g class="hk-steam" stroke="#FF8A5C" stroke-width="3">
      <path d="M36 26c-3-5 3-7 0-12"/>
      <path d="M48 28c-3-5 3-7 0-13"/>
      <path d="M60 26c-3-5 3-7 0-12"/>
    </g>
    <!-- 성에·물방울(차가움) -->
    <g class="hk-frost" stroke="#5AA2F8" stroke-width="2.6">
      <path d="M30 22v10M25 27h10M26.5 23.5l7 7M33.5 23.5l-7 7"/>
      <path d="M62 20v8M58 24h8M59 21l6 6M65 21l-6 6" opacity=".8"/>
      <circle cx="28" cy="58" r="2.2" fill="#BFDCFF" stroke="none"/>
      <circle cx="70" cy="64" r="2" fill="#BFDCFF" stroke="none"/>
    </g>
    <!-- 컵(두 컵이 완전히 동일) -->
    <path d="M26 36h44l-4 44a6 6 0 0 1-6 5H36a6 6 0 0 1-6-5z" fill="#F7F9FC" stroke="#4E5968" stroke-width="3"/>
    <path d="M29.5 48h37" stroke="#C9D6E6" stroke-width="2.4"/>
    <path d="M30.5 48c4 3 12 3 17.5 0s13.5-3 17.5 0l-3 32a5 5 0 0 1-5 4.5H38.5a5 5 0 0 1-5-4.5z" fill="#DCEAFF" stroke="none" opacity=".85"/>
  </svg>`;
}

function renderCups(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: (k: AvatarKind) => void): void {
  const grid = el("div", { class: "hook-cups" });
  scene.appendChild(grid);
  helper.innerHTML = "컵을 <b>눌러서</b> 만져 보세요. 두 컵 모두요!";

  const touched = new Set<string>();
  const mk = (kind: "hot" | "cold", name: string): HTMLElement => {
    const label = el("div", { class: "hook-cup-label", text: "눌러서 만져 보기" });
    const art = sceneArt("cup-plain", cupSvg());
    const cup = el("button", { class: "hook-cup", attrs: { "aria-label": `${name} — 눌러서 만져 보기` } }, art.el, label);
    cup.addEventListener("click", () => {
      if (touched.has(kind)) return;
      touched.add(kind);
      cup.classList.add(kind);
      art.set(kind === "hot" ? "cup-hot" : "cup-cold");
      const result = kind === "hot" ? "앗, 뜨거워요! 55℃" : "얼음장이에요! 10℃";
      label.textContent = result;
      cup.setAttribute("aria-label", `${name} — ${result}`);
      haptic(kind === "hot" ? HAPTIC.wrong : HAPTIC.select);
      if (touched.size === 2) {
        face("curious");
        helper.innerHTML = "겉모습은 똑같은데 온도가 달라요. <b>무엇이 다른 걸까요?</b> 비밀은 눈에 안 보이는 곳에 있어요.";
        finish();
      } else {
        face("surprised");
        helper.innerHTML = kind === "hot" ? "뜨겁죠? 이제 <b>다른 컵</b>도 만져 보세요." : "차갑죠? 이제 <b>다른 컵</b>도 만져 보세요.";
      }
    });
    return cup;
  };
  grid.append(mk("hot", "첫 번째 컵"), mk("cold", "두 번째 컵"));
}

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
        good: "좋은 예측이에요! 뜨거운 달걀은 <b>식고</b>, 찬물은 <b>미지근</b>해져요 — 둘 다 변해요. 무대에서 직접 확인!",
        bad: "한쪽만 변하는 게 아니에요 — 뜨거운 달걀은 <b>식고</b>, 동시에 찬물은 <b>미지근</b>해져요. 열이 옮겨 가거든요. 무대에서 직접 확인해 봐요.",
        onDone: finish,
      });
      api.snack("예상을 골라 보세요");
    }, 750);
  });
  return () => window.clearTimeout(dropTimer);
}

// ── 장면 3: 한여름 해변 — 모래 밟기 vs 바닷물 담그기 ─────────
function sandSvg(): string {
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g class="hk-steam" stroke="#FF8A5C" stroke-width="3">
      <path d="M32 44c-3-5 3-7 0-12"/>
      <path d="M48 42c-3-5 3-7 0-13"/>
      <path d="M64 44c-3-5 3-7 0-12"/>
    </g>
    <path d="M8 82Q30 56 50 62T88 82Z" fill="#F7E3B4" stroke="#C9A96A" stroke-width="3"/>
    <circle cx="34" cy="74" r="1.6" fill="#C9A96A" stroke="none"/>
    <circle cx="52" cy="70" r="1.6" fill="#C9A96A" stroke="none"/>
    <circle cx="66" cy="76" r="1.6" fill="#C9A96A" stroke="none"/>
    <path d="M20 26a8 8 0 1 1 0 .1z" fill="#FFD98A" stroke="#F5A623" stroke-width="2.4"/>
    <path d="M20 12v-5M20 45v-2M6 26H1M39 26h-5M10 16l-3.5-3.5M30 16l3.5-3.5" stroke="#F5A623" stroke-width="2.2"/>
  </svg>`;
}
function seaSvg(): string {
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g class="hk-frost" stroke="#5AA2F8" stroke-width="2.6">
      <path d="M30 34l3 3M63 30l3 3M48 26l2.5 2.5" opacity=".9"/>
      <circle cx="26" cy="46" r="2" fill="#BFDCFF" stroke="none"/>
      <circle cx="70" cy="44" r="2" fill="#BFDCFF" stroke="none"/>
    </g>
    <path d="M8 62q10-8 20 0t20 0 20 0 20 0" stroke="#5AA2F8" stroke-width="3"/>
    <path d="M8 62q10-8 20 0t20 0 20 0 20 0V88H8Z" fill="#CFE4FF" stroke="none" opacity=".9"/>
    <path d="M14 74q8-6 16 0M50 76q8-6 16 0" stroke="#8FBBF2" stroke-width="2.4"/>
  </svg>`;
}

function renderBeach(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: (k: AvatarKind) => void): void {
  const grid = el("div", { class: "hook-cups" });
  scene.appendChild(grid);
  helper.innerHTML = "한여름 낮 12시, 해가 <b>둘 다 똑같이</b> 데우고 있어요. 모래도 밟아 보고 바닷물에도 발을 담가 보세요.";

  const touched = new Set<string>();
  const mk = (kind: "hot" | "cold", name: string, artNames: [string, string], svg: string, result: string): HTMLElement => {
    const label = el("div", { class: "hook-cup-label", text: "눌러 보기" });
    const art = sceneArt(artNames[0], svg);
    const card = el("button", { class: "hook-cup", attrs: { "aria-label": `${name} — 눌러 보기` } }, art.el, label);
    card.addEventListener("click", () => {
      if (touched.has(kind)) return;
      touched.add(kind);
      card.classList.add(kind);
      art.set(artNames[1]);
      label.textContent = result;
      card.setAttribute("aria-label", `${name} — ${result}`);
      haptic(kind === "hot" ? HAPTIC.wrong : HAPTIC.select);
      if (touched.size === 2) {
        face("curious");
        helper.innerHTML = "같은 햇볕을 똑같이 받았는데 <b>모래만 뜨거워요</b>. 두 물질이 열을 받아들이는 방식이 다른 걸까요?";
        finish();
      } else {
        face("surprised");
        helper.innerHTML = kind === "hot" ? "발바닥이 뜨끈! 이제 <b>바닷물</b>에도 발을 담가 보세요." : "시원하죠? 이제 <b>모래</b>도 밟아 보세요.";
      }
    });
    return card;
  };
  grid.append(
    mk("hot", "모래사장", ["sand", "sand-hot"], sandSvg(), "앗, 뜨거워요! 50℃"),
    mk("cold", "바닷물", ["sea", "sea-cool"], seaSvg(), "시원해요! 23℃"),
  );
}

// ── 장면 4: 전깃줄 — 여름/겨울 토글 + 예측 ───────────────────
function wireSvg(): string {
  return `<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g class="hk-sun">
      <circle cx="34" cy="26" r="11" fill="#FFD98A" stroke="#F5A623" stroke-width="2.6"/>
      <path d="M34 8v-4M34 48v-3M12 26H8M60 26h-4M19 11l-3-3M49 11l3-3" stroke="#F5A623" stroke-width="2.2"/>
    </g>
    <g class="hk-snow" stroke="#5AA2F8" stroke-width="2.4">
      <path d="M34 14v24M22 26h24M25.5 17.5l17 17M42.5 17.5l-17 17"/>
      <path d="M208 18v18M199 27h18M201.6 20.6l12.8 12.8M214.4 20.6l-12.8 12.8" opacity=".75"/>
    </g>
    <g stroke="#6B7684" stroke-width="4">
      <path d="M38 34v104M202 34v104"/>
      <path d="M24 42h28M188 42h28" stroke-width="3.4"/>
    </g>
    <path class="hk-wire-s" d="M38 46Q120 104 202 46" stroke="#4E5968" stroke-width="3.2"/>
    <path class="hk-wire-w" d="M38 46Q120 58 202 46" stroke="#4E5968" stroke-width="3.2"/>
    <path d="M6 140h228" stroke="#C4CAD2" stroke-width="2.4"/>
  </svg>`;
}

function renderWire(scene: HTMLElement, helper: HTMLElement, s: HookStep, finish: () => void, face: (k: AvatarKind) => void): void {
  const art = sceneArt("wire-summer", wireSvg());
  const fig = el(
    "div",
    {
      class: "hook-wire summer",
      attrs: { role: "img", "aria-label": "여름: 전깃줄이 축 늘어져 있어요" },
    },
    art.el,
  );
  const seg = el("div", { class: "seg" });
  const summerBtn = el("button", { class: "on", text: "여름", attrs: { type: "button", "aria-pressed": "true" } });
  const winterBtn = el("button", { text: "겨울", attrs: { type: "button", "aria-pressed": "false" } });
  seg.append(summerBtn, winterBtn);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, seg, choicesBox);
  helper.innerHTML = "지금은 <b>여름</b> — 전깃줄이 축 늘어져 있어요. <b>겨울</b>로 바꾸면 어떻게 될까요?";

  const seen = new Set<string>(["summer"]);
  let asked = false;
  const setSeason = (season: "summer" | "winter"): void => {
    if (fig.classList.contains(season)) return; // 이미 켜진 계절 — 무의미 탭 무시
    fig.classList.toggle("summer", season === "summer");
    fig.classList.toggle("winter", season === "winter");
    art.set(`wire-${season}`);
    fig.setAttribute("aria-label", season === "summer" ? "여름: 전깃줄이 축 늘어져 있어요" : "겨울: 전깃줄이 팽팽해요");
    summerBtn.classList.toggle("on", season === "summer");
    winterBtn.classList.toggle("on", season === "winter");
    summerBtn.setAttribute("aria-pressed", String(season === "summer"));
    winterBtn.setAttribute("aria-pressed", String(season === "winter"));
    haptic(HAPTIC.select);
    seen.add(season);
    if (!asked && seen.size === 2) {
      asked = true;
      face("curious");
      helper.innerHTML = "겨울엔 <b>팽팽</b>, 여름엔 <b>축 늘어짐</b> — 같은 전깃줄인데요! 왜 그럴지 예상을 골라 보세요.";
      ask(choicesBox, helper, {
        choices: s.choices ?? ["전깃줄이 열을 받아 길이가 늘어나서", "여름엔 전봇대 사이가 멀어져서", "여름엔 바람이 약해서"],
        good: "정확해요! 전깃줄이 <b>열을 받으면 길이가 늘어나</b> 여름엔 축 늘어져요. 실험실에서 직접 확인!",
        bad: "전봇대 간격이나 바람 때문이 아니에요 — 같은 전깃줄이 <b>열을 받아 길이가 늘어난</b> 거예요. 그래서 더운 여름엔 축 늘어지죠. 실험실에서 확인해요.",
        onDone: finish,
      });
    } else if (!asked) {
      face("surprised");
    }
  };
  summerBtn.addEventListener("click", () => setSeason("summer"));
  winterBtn.addEventListener("click", () => setSeason("winter"));
}

// ── 장면 5: 급식실 냄새 — 뚜껑 열기 + 예측 (IV L1) ───────────
// 프리미엄 SVG 문법(파운드리 계승): 근-동조 그라데이션 + 좌상단 키라이트 + 접촉 그림자,
// 외곽선은 재질별 최암색으로 얇게. 스틱맨 캐릭터만 의도적으로 손그림 라인 유지.
function mealSvg(): string {
  return `<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hkMeal-dome" x1="52" y1="70" x2="120" y2="118" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FAFCFF"/><stop offset=".5" stop-color="#DFE7F1"/><stop offset="1" stop-color="#C2CDDD"/>
      </linearGradient>
      <radialGradient id="hkMeal-domeHl" cx=".32" cy=".22" r=".7">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hkMeal-counter" x1="0" y1="118" x2="0" y2="128" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#EDF1F7"/><stop offset="1" stop-color="#D5DCE7"/>
      </linearGradient>
      <linearGradient id="hkMeal-rice" x1="66" y1="94" x2="106" y2="114" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFC98E"/><stop offset=".55" stop-color="#F5A45C"/><stop offset="1" stop-color="#DE7F3A"/>
      </linearGradient>
      <linearGradient id="hkMeal-steam" x1="0" y1="98" x2="0" y2="82" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FF9E6E" stop-opacity=".9"/><stop offset="1" stop-color="#FF9E6E" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="hkMeal-smell" cx=".4" cy=".35" r=".65">
        <stop offset="0" stop-color="#7CE8D8"/><stop offset=".6" stop-color="#12B8A6"/><stop offset="1" stop-color="#0E9C8D"/>
      </radialGradient>
    </defs>
    <!-- 접촉 그림자 + 배식대 -->
    <ellipse cx="92" cy="132" rx="66" ry="6" fill="#2A3A5E" opacity=".10"/>
    <rect x="28" y="118" width="184" height="9" rx="4.5" fill="url(#hkMeal-counter)"/>
    <rect x="28" y="118" width="184" height="3.4" rx="1.7" fill="#FFFFFF" opacity=".7"/>
    <path d="M42 127v9M198 127v9" stroke="#B8C2D0" stroke-width="4"/>
    <!-- 접시 + 볶음밥 -->
    <ellipse cx="86" cy="115" rx="47" ry="8.5" fill="#F6F9FC"/>
    <ellipse cx="86" cy="113.6" rx="47" ry="8.5" fill="#FFFFFF"/>
    <ellipse cx="86" cy="113.6" rx="47" ry="8.5" stroke="#C6D0DC" stroke-width="1.4"/>
    <path d="M56 111c4-12 18-19 30-19s26 7 30 19q-30 7 -60 0z" fill="url(#hkMeal-rice)"/>
    <path d="M62 106c5-8 14-12 24-12 6 0 12 1.6 17 5" stroke="#FFE2BC" stroke-width="3" opacity=".8"/>
    <circle cx="74" cy="102" r="2" fill="#D8542E"/><circle cx="92" cy="99" r="2" fill="#D8542E"/>
    <circle cx="101" cy="106" r="1.8" fill="#3F9B4F"/><circle cx="66" cy="108" r="1.8" fill="#3F9B4F"/>
    <!-- 뚜껑(클로슈) -->
    <g class="hk-lid">
      <path d="M46 112c0-24 18-40 40-40s40 16 40 40z" fill="url(#hkMeal-dome)"/>
      <path d="M46 112c0-24 18-40 40-40s40 16 40 40z" fill="url(#hkMeal-domeHl)"/>
      <path d="M46 112c0-24 18-40 40-40s40 16 40 40" stroke="#9DAABD" stroke-width="1.6"/>
      <path d="M58 100c2-13 12-22 24-24" stroke="#FFFFFF" stroke-width="5" opacity=".55"/>
      <rect x="44" y="109" width="84" height="6" rx="3" fill="#CBD5E2"/>
      <rect x="44" y="109" width="84" height="2.6" rx="1.3" fill="#F2F6FB"/>
      <circle cx="86" cy="66" r="5.4" fill="#E7EDF5"/>
      <circle cx="86" cy="66" r="5.4" stroke="#9DAABD" stroke-width="1.4"/>
      <circle cx="84.2" cy="64.4" r="1.8" fill="#FFFFFF"/>
    </g>
    <!-- 김 -->
    <g class="hk-steam" stroke="url(#hkMeal-steam)" stroke-width="3.2">
      <path d="M74 98c-2.5-4.5 2.5-6 0-10.5"/>
      <path d="M86 96c-2.5-4.5 2.5-6 0-10.5"/>
      <path d="M98 98c-2.5-4.5 2.5-6 0-10.5"/>
    </g>
    <!-- 냄새 입자(뚜껑 열리면 퍼짐) -->
    <g class="hk-smellp" fill="url(#hkMeal-smell)">
      <circle cx="96" cy="92" r="3.6"/>
      <circle cx="104" cy="86" r="3.1"/>
      <circle cx="112" cy="94" r="2.8"/>
      <circle cx="120" cy="84" r="2.6"/>
      <circle cx="130" cy="92" r="2.4"/>
      <circle cx="140" cy="86" r="2.2"/>
    </g>
    <!-- 멀리 있는 스틱맨(코 킁킁) — 캐릭터는 손그림 라인 유지 -->
    <ellipse cx="196" cy="116" rx="17" ry="3.4" fill="#2A3A5E" opacity=".10"/>
    <g stroke="#3C4654" stroke-width="2.6">
      <circle cx="196" cy="70" r="9" fill="#fff"/>
      <path d="M196 79v22M196 86l-10 7M196 86l10 7M196 101l-8 12M196 101l8 12"/>
    </g>
    <g class="hk-sniff" stroke="#12B8A6" stroke-width="2.2">
      <path d="M182 66q-4 3 0 6"/>
      <path d="M176 62q-6 5 0 10"/>
    </g>
  </svg>`;
}

function renderSmell(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStep,
  finish: () => void,
  face: (k: AvatarKind) => void,
): () => void {
  const art = sceneArt("meal-closed", mealSvg());
  const fig = el("button", { class: "hook-meal", attrs: { type: "button", "aria-label": "배식대 뚜껑 열기" } }, art.el);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "배식대 뚜껑을 <b>눌러서</b> 열어 보세요.";

  let opened = false;
  let timer = 0;
  fig.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    fig.classList.add("opened");
    art.set("meal-open");
    (fig as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "뚜껑을 열자마자… 교실 <b>끝자리</b>까지 냄새가 퍼졌어요!";
    timer = window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "바람 한 점 없는 실내예요. 냄새는 <b>어떻게</b> 저 멀리까지 갔을까요?";
      ask(choicesBox, helper, {
        choices: s.choices ?? ["냄새 입자가 스스로 움직여 퍼졌다", "바람이 냄새를 옮겨 줬다", "코가 냄새를 끌어당겼다"],
        good: "맞아요! 바람이 없어도 <b>냄새 입자가 스스로 움직여</b> 사방으로 퍼져요. 실험실에서 물속 잉크로 확인!",
        bad: "바람이나 코가 끌어당긴 게 아니에요 — 바람 한 점 없었잖아요? <b>냄새 입자가 스스로 움직여</b> 퍼진 거예요. 실험실에서 물속 잉크로 확인해요.",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

// ── 장면 6: 쏟아진 주스와 얼음 (IV L2) ───────────────────────
function iceSvg(): string {
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hkIce-body" x1="28" y1="32" x2="66" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#F6FBFF"/><stop offset=".5" stop-color="#CFE6FF"/><stop offset="1" stop-color="#9FC6F4"/>
      </linearGradient>
      <linearGradient id="hkIce-facet" x1="24" y1="30" x2="70" y2="72" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <ellipse cx="47" cy="79" rx="25" ry="4.6" fill="#2A3A5E" opacity=".12"/>
    <g class="hk-cube">
      <rect x="24" y="30" width="46" height="42" rx="10" fill="url(#hkIce-body)"/>
      <rect x="24" y="30" width="46" height="42" rx="10" stroke="#7FAEE6" stroke-width="1.6"/>
      <!-- 얼음 면(패싯) + 키라이트 -->
      <path d="M30 36q10-4 18 0l-6 12q-8 2-14-4z" fill="url(#hkIce-facet)" opacity=".8"/>
      <path d="M52 54l12-6v14l-9 6z" fill="#B7D6F8" opacity=".5"/>
      <path d="M33 62h28" stroke="#E9F4FF" stroke-width="3" opacity=".9"/>
      <path d="M56 37l7 7" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="36" cy="40" r="1.7" fill="#FFFFFF"/>
      <!-- 냉기 반짝 -->
      <path d="M76 30v7M72.5 33.5h7" stroke="#9FC6F4" stroke-width="2"/>
    </g>
    <g class="hk-grab" stroke="#8B95A1" stroke-width="2.6" opacity="0">
      <path d="M20 22q4-8 12-8M76 22q-4-8-12-8"/>
    </g>
  </svg>`;
}
function juicePuddleSvg(): string {
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hkJus-body" x1="20" y1="56" x2="76" y2="76" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFDF9E"/><stop offset=".55" stop-color="#F7B345"/><stop offset="1" stop-color="#DE8F17"/>
      </linearGradient>
      <radialGradient id="hkJus-hl" cx=".3" cy=".28" r=".6">
        <stop offset="0" stop-color="#FFF4DA" stop-opacity=".95"/><stop offset="1" stop-color="#FFF4DA" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hkJus-drop" x1="0" y1="36" x2="0" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFCE73"/><stop offset="1" stop-color="#EDA028"/>
      </linearGradient>
    </defs>
    <ellipse cx="48" cy="79" rx="32" ry="4.6" fill="#2A3A5E" opacity=".10"/>
    <path class="hk-pud" d="M14 66q10-10 24-7t22-4 22 5q6 3 2 8t-16 6-26 1-24-2q-8-3-4-7z" fill="url(#hkJus-body)"/>
    <path class="hk-pud2" d="M14 66q10-10 24-7t22-4 22 5q6 3 2 8t-16 6-26 1-24-2q-8-3-4-7z" fill="url(#hkJus-hl)"/>
    <path d="M24 64q9-6 20-5" stroke="#FFF0CE" stroke-width="3.4" opacity=".9"/>
    <circle cx="63" cy="65" r="1.8" fill="#FFF0CE" opacity=".9"/>
    <circle cx="36" cy="70" r="1.4" fill="#C87F12" opacity=".55"/>
    <g class="hk-drip" opacity="0">
      <path d="M34 39c2.4 3 3.6 5 3.6 6.8a3.6 3.6 0 1 1-7.2 0c0-1.8 1.2-3.8 3.6-6.8z" fill="url(#hkJus-drop)"/>
      <path d="M50 33c2.2 2.8 3.3 4.6 3.3 6.2a3.3 3.3 0 1 1-6.6 0c0-1.6 1.1-3.4 3.3-6.2z" fill="url(#hkJus-drop)"/>
      <path d="M64 41c2 2.6 3 4.2 3 5.7a3 3 0 1 1-6 0c0-1.5 1-3.1 3-5.7z" fill="url(#hkJus-drop)"/>
    </g>
  </svg>`;
}

function renderJuice(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: (k: AvatarKind) => void): void {
  const grid = el("div", { class: "hook-cups" });
  scene.appendChild(grid);
  helper.innerHTML = "바닥에 얼음과 주스가 쏟아졌어요! 둘 다 <b>눌러서</b> 주워 보세요.";

  const tried = new Set<string>();
  const mk = (kind: "ice" | "juice", name: string, artNames: [string, string], svg: string, result: string): HTMLElement => {
    const label = el("div", { class: "hook-cup-label", text: "눌러서 줍기" });
    const art = sceneArt(artNames[0], svg);
    const card = el("button", { class: "hook-cup", attrs: { "aria-label": `${name} — 눌러서 줍기` } }, art.el, label);
    card.addEventListener("click", () => {
      if (tried.has(kind)) return;
      tried.add(kind);
      card.classList.add(kind === "ice" ? "cold" : "spill");
      art.set(artNames[1]);
      label.textContent = result;
      card.setAttribute("aria-label", `${name} — ${result}`);
      haptic(kind === "ice" ? HAPTIC.select : HAPTIC.wrong);
      if (tried.size === 2) {
        face("curious");
        helper.innerHTML = "얼음은 <b>모양 그대로</b> 집히는데, 주스는 <b>흘러내려요</b>. 같은 바닥에 쏟아졌는데 왜 다를까요?";
        finish();
      } else {
        face("surprised");
        helper.innerHTML = kind === "ice" ? "쏙! 이제 <b>주스</b>도 주워 보세요." : "주르륵… 이제 <b>얼음</b>도 주워 보세요.";
      }
    });
    return card;
  };
  grid.append(
    mk("ice", "얼음", ["ice", "ice-picked"], iceSvg(), "쏙! 모양 그대로 집혔어요"),
    mk("juice", "주스", ["juice", "juice-spill"], juicePuddleSvg(), "주르륵… 손가락 사이로!"),
  );
}

// ── 장면 7: 배달 음식 랩 — 볼록해지는 랩 + 예측 (IV L4) ──────
function wrapSvg(): string {
  return `<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hkWrap-bowl" x1="120" y1="84" x2="120" y2="128" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#E9EEF6"/><stop offset="1" stop-color="#CBD5E3"/>
      </linearGradient>
      <linearGradient id="hkWrap-soup" x1="120" y1="88" x2="120" y2="114" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFDCB4"/><stop offset="1" stop-color="#F0A45E"/>
      </linearGradient>
      <linearGradient id="hkWrap-steam" x1="0" y1="78" x2="0" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FF9E6E" stop-opacity=".85"/><stop offset="1" stop-color="#FF9E6E" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="hkWrap-film" x1="60" y1="40" x2="180" y2="84" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#DCEBFF" stop-opacity=".55"/><stop offset=".5" stop-color="#BFD8F8" stop-opacity=".18"/><stop offset="1" stop-color="#DCEBFF" stop-opacity=".45"/>
      </linearGradient>
    </defs>
    <!-- 접촉 그림자 + 그릇 -->
    <ellipse cx="120" cy="130" rx="70" ry="6" fill="#2A3A5E" opacity=".10"/>
    <path d="M56 84c0 26 22 42 64 42s64-16 64-42z" fill="url(#hkWrap-bowl)"/>
    <path d="M56 84c0 26 22 42 64 42s64-16 64-42" stroke="#A9B6C7" stroke-width="1.6"/>
    <path d="M66 96c3 10 10 18 21 23" stroke="#FFFFFF" stroke-width="4.5" opacity=".7"/>
    <rect x="98" y="124" width="44" height="5" rx="2.5" fill="#B9C4D4"/>
    <!-- 국물(그릇 안쪽) -->
    <ellipse cx="120" cy="87" rx="60" ry="7.2" fill="url(#hkWrap-soup)"/>
    <ellipse cx="120" cy="85.8" rx="60" ry="6.6" fill="#FFE7C8"/>
    <ellipse cx="102" cy="85" rx="19" ry="3.2" fill="#FFF3DF" opacity=".9"/>
    <circle cx="142" cy="86" r="2.2" fill="#FFF3DF" opacity=".8"/>
    <ellipse cx="120" cy="84" rx="62" ry="7" stroke="#D9A25E" stroke-width="1.4"/>
    <!-- 김 -->
    <g class="hk-steam" stroke="url(#hkWrap-steam)" stroke-width="3.2">
      <path d="M100 76c-2.5-4.5 2.5-6 0-10.5"/>
      <path d="M120 74c-2.5-4.5 2.5-6 0-10.5"/>
      <path d="M140 76c-2.5-4.5 2.5-6 0-10.5"/>
    </g>
    <!-- 랩: 평평 ↔ 볼록 (반투명 필름 + 광택 스트릭) -->
    <g class="hk-wrap-flat">
      <path d="M52 82q68 7 136 0" fill="url(#hkWrap-film)"/>
      <path d="M52 82q68 7 136 0" stroke="#9FC1F0" stroke-width="2.6"/>
      <path d="M78 84.5q22 2.6 44 1" stroke="#FFFFFF" stroke-width="2.2" opacity=".8"/>
    </g>
    <g class="hk-wrap-bulge">
      <path d="M52 82q68-54 136 0z" fill="url(#hkWrap-film)"/>
      <path d="M52 82q68-54 136 0" stroke="#9FC1F0" stroke-width="2.6"/>
      <path d="M84 62q14-14 34-16" stroke="#FFFFFF" stroke-width="3" opacity=".85"/>
      <path d="M144 52q10 4 17 12" stroke="#FFFFFF" stroke-width="2.2" opacity=".5"/>
    </g>
  </svg>`;
}

function renderWrap(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStep,
  finish: () => void,
  face: (k: AvatarKind) => void,
): () => void {
  const art = sceneArt("wrap-flat", wrapSvg());
  const fig = el("button", { class: "hook-wrap flat", attrs: { type: "button", "aria-label": "뜨거운 그릇에 랩 씌워 두기" } }, art.el);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "김이 나는 <b>뜨거운 국그릇</b>에 랩을 씌웠어요. 눌러서 잠시 기다려 보세요.";

  let done = false;
  let timer = 0;
  fig.addEventListener("click", () => {
    if (done) return;
    done = true;
    fig.classList.remove("flat");
    fig.classList.add("bulged");
    art.set("wrap-bulge");
    fig.setAttribute("aria-label", "랩이 볼록하게 부풀어 올랐어요");
    (fig as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "랩이 <b>볼록</b>하게 부풀었어요! 아무도 바람을 넣지 않았는데요.";
    timer = window.setTimeout(() => {
      face("curious");
      ask(choicesBox, helper, {
        choices: s.choices ?? ["국물이 수증기로 변하며 부피가 크게 늘어서", "랩이 열을 받아 스스로 늘어나서", "음식 입자의 크기가 커져서"],
        good: "좋은 예측! <b>국물이 수증기로 변하면 부피가 크게 늘어나</b> 랩을 밀어 올려요. 실험실에서 풍선 실험으로 확인!",
        bad: "랩이 스스로 늘거나 입자가 커진 게 아니에요 — <b>액체(국물)가 기체(수증기)로 변하면 부피가 확 커져요</b>. 그 기체가 랩을 밀어 올린 거예요. 실험실에서 확인해요.",
        onDone: finish,
      });
    }, 800);
  });
  return () => window.clearTimeout(timer);
}

// ── 장면 8: 끓는 라면 물 — 불 최대 + 예측 (IV L5) ────────────
function potSvg(): string {
  return `<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hkPot-body" x1="66" y1="52" x2="180" y2="118" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#F9FBFE"/><stop offset=".5" stop-color="#DCE4EE"/><stop offset="1" stop-color="#BEC9D9"/>
      </linearGradient>
      <linearGradient id="hkPot-rim" x1="0" y1="50" x2="0" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#F4F8FD"/><stop offset="1" stop-color="#B9C4D4"/>
      </linearGradient>
      <linearGradient id="hkPot-water" x1="120" y1="64" x2="120" y2="113" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#CFE6FF"/><stop offset="1" stop-color="#8FBEF6"/>
      </linearGradient>
      <linearGradient id="hkPot-steam" x1="0" y1="46" x2="0" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FF9E6E" stop-opacity=".85"/><stop offset="1" stop-color="#FF9E6E" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="hkPot-glow" cx=".5" cy=".85" r=".65">
        <stop offset="0" stop-color="#FFB03A" stop-opacity=".4"/><stop offset="1" stop-color="#FFB03A" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="hkPot-bub" cx=".35" cy=".3" r=".75">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DDEBFF" stop-opacity=".55"/>
      </radialGradient>
    </defs>
    <!-- 접촉 그림자 + 버너 -->
    <ellipse cx="120" cy="142" rx="58" ry="5" fill="#2A3A5E" opacity=".12"/>
    <rect x="82" y="136" width="76" height="7" rx="3.5" fill="#5E6B7E"/>
    <rect x="82" y="136" width="76" height="2.8" rx="1.4" fill="#8A97AA"/>
    <!-- 불꽃 열기 글로우 -->
    <ellipse cx="120" cy="128" rx="46" ry="18" fill="url(#hkPot-glow)"/>
    <!-- 냄비 -->
    <path d="M66 56h108v50a8 8 0 0 1-8 8H74a8 8 0 0 1-8-8z" fill="url(#hkPot-body)"/>
    <path d="M66 56h108v50a8 8 0 0 1-8 8H74a8 8 0 0 1-8-8z" stroke="#97A4B8" stroke-width="1.6"/>
    <path d="M76 66v34" stroke="#FFFFFF" stroke-width="6" opacity=".55"/>
    <rect x="62" y="50" width="116" height="7" rx="3.5" fill="url(#hkPot-rim)"/>
    <rect x="62" y="50" width="116" height="7" rx="3.5" stroke="#97A4B8" stroke-width="1.2"/>
    <path d="M50 58q0-7 12-6M190 58q0-7-12-6" stroke="#97A4B8" stroke-width="4.5"/>
    <!-- 물 + 수면 + 기포 -->
    <path d="M70 64h100v40a5 5 0 0 1-5 5H75a5 5 0 0 1-5-5z" fill="url(#hkPot-water)"/>
    <ellipse cx="120" cy="65.5" rx="50" ry="3.6" fill="#E8F3FF"/>
    <g class="hk-bub">
      <circle cx="92" cy="98" r="3.6" fill="url(#hkPot-bub)"/>
      <circle cx="118" cy="102" r="4.2" fill="url(#hkPot-bub)"/>
      <circle cx="144" cy="97" r="3.2" fill="url(#hkPot-bub)"/>
      <circle cx="106" cy="90" r="2.8" fill="url(#hkPot-bub)"/>
      <circle cx="132" cy="88" r="2.6" fill="url(#hkPot-bub)"/>
    </g>
    <!-- 김 -->
    <g class="hk-steam" stroke="url(#hkPot-steam)" stroke-width="3.2">
      <path d="M104 44c-2.5-4.5 2.5-6 0-10.5"/>
      <path d="M120 42c-2.5-4.5 2.5-6 0-10.5"/>
      <path d="M136 44c-2.5-4.5 2.5-6 0-10.5"/>
    </g>
    <!-- 불꽃(층진 방울 + 코어) -->
    <g class="hk-flame">
      <path d="M100 134q-8-12 3-19 0 9 9 12 7-9 2-16 14 7 10 21t-24 2z" fill="#FF8A5C"/>
      <path class="hk-flame2" d="M106 134q-5-8 2-12 0 6 6 8 4-6 2-10 9 5 6 14t-16 0z" fill="#FFB03A"/>
      <path d="M111 134q-3-5 1.5-8 .5 4 4 5 2-3.5 1-6 5 3.5 3.5 9t-10 0z" fill="#FFE9A8"/>
      <path d="M138 134q-5-8 2-12 0 6 6 8 4-6 1-10 9 5 7 14t-16 0z" fill="#FFB03A" opacity=".95"/>
      <path d="M142 134q-3-4.5 1.5-7.5 .5 3.5 3.5 4.5 2-3 1-5.5 4.5 3 3.5 8.5t-9.5 0z" fill="#FFE9A8" opacity=".95"/>
    </g>
  </svg>`;
}

function renderRamen(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStep,
  finish: () => void,
  face: (k: AvatarKind) => void,
): () => void {
  const art = sceneArt("pot-boil", potSvg());
  const fig = el("div", { class: "hook-pot boiling", attrs: { role: "img", "aria-label": "물이 보글보글 끓고 있어요" } }, art.el);
  const fireBtn = el(
    "button",
    { class: "swapbtn", attrs: { type: "button" } },
    el("span", { text: "불 세기 최대로 올리기" }),
  );
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, fireBtn, choicesBox);
  helper.innerHTML = "물이 벌써 <b>보글보글</b> 끓고 있어요. 라면을 더 빨리 익히고 싶다면…?";

  let done = false;
  let timer = 0;
  fireBtn.addEventListener("click", () => {
    if (done) return;
    done = true;
    fig.classList.add("fierce");
    art.set("pot-fierce");
    fig.setAttribute("aria-label", "불을 최대로 — 물이 더 세차게 끓어요");
    fireBtn.classList.add("done-static");
    (fireBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "화력 최대! 기포가 훨씬 <b>세차게</b> 올라와요. 그럼 물의 <b>온도</b>는요?";
    timer = window.setTimeout(() => {
      face("curious");
      ask(choicesBox, helper, {
        choices: s.choices ?? ["끓는 동안엔 온도가 더 오르지 않는다", "불이 세니까 온도가 계속 올라간다", "물이 줄어들면서 온도가 내려간다"],
        good: "예리해요! <b>끓는 동안에는 온도가 더 오르지 않아요</b> — 불이 세도 그대로예요. 실험실에서 온도 그래프로 확인!",
        bad: "불이 세다고 온도가 계속 오르진 않아요 — <b>끓는 동안에는 온도가 일정하게 유지</b>돼요. 화력은 물이 끓는 속도만 키울 뿐이에요. 실험실에서 온도 그래프로 확인해요.",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}
