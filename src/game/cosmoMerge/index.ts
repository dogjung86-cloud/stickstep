// 코스모 머지 — 도전 탭 미니게임 2호(수박게임 문법의 천체판, 프리미엄).
// 화면 조립·입력·HUD·게임오버 시트만 담당 — 물리·규칙은 engine.ts, 그림은 render.ts(스텝 러시 구조).
// main.ts openCosmoMerge()가 프리미엄 게이트 소유. 보상 = 신기록 갱신분의 1/10 스틱(점수 인플레 보정,
// 파밍 불가) + 데일리 첫 갱신 2배(스텝 러시와 같은 문법, 키만 분리).
//
// 조작은 수박게임 그대로 하나: 누르거나 끌어서 조준 → 놓으면 드롭(읽는 규칙 0줄 — 장르가 곧 설명서).
// 데스크톱·접근성: ←/→ 조준, 스페이스·↓ 드롭. 하단 체인 스트립이 "실제 크기 순서"를 상시 가르친다.

import { el } from "../../core/dom";
import { icon } from "../../core/icons";
import { haptic, HAPTIC } from "../../core/haptics";
import { createLoop } from "../../core/anim";
import { awardXp, bestScore, submitScore } from "../../core/store";
import type { Screen } from "../../core/router";
import { Bgm, Sfx } from "../gameKit";
import { CosmoEngine } from "./engine";
import { CosmoRenderer } from "./render";
import { DROP_TIERS, TIERS, sprite, tierExt } from "./sprites";

export const COSMO_ID = "cosmo";
const SND_KEY = "cmx.sound"; // 기기 설정(동기화 대상 아님)
const DAILY_KEY = "cmx.daily"; // 오늘 첫 기록 갱신 2배를 쓴 날짜
const GALAXY_KEY = "cmx.galaxy"; // 내 은하의 별(= 만든 태양 수, 기기 누적)

// ── 오디오 에셋(일레븐랩스 발주 — qa/gen-cosmo-audio.mjs, 검수 /qa-cosmo-audio.html) ──
// BGM 존은 판의 성장과 1:1: 성운(시작) → 행성 시대(금성 이상) → 별의 시대(태양 탄생).
// 파일이 없거나 로드 실패면 Bgm/Sfx가 전부 무음·신스 폴백으로 무해하게 동작한다.
const AUDIO_BASE = `${import.meta.env.BASE_URL}game/cosmo/`;
const BGM_TRACKS = ["bgm-nebula.mp3", "bgm-planets.mp3", "bgm-star.mp3"] as const;
const SFX_SAMPLES: Record<string, string> = {
  sunborn: `${AUDIO_BASE}sfx-sun.mp3`,
  nova: `${AUDIO_BASE}sfx-nova.mp3`,
  best: `${AUDIO_BASE}sfx-best.mp3`,
  fall: `${AUDIO_BASE}sfx-over.mp3`, // 게임오버 — Sfx.fall()의 샘플 슬롯을 코스모 파일로
};

/** 판마다 새 시드. DEV에선 sessionStorage.cmxSeed로 고정(e2e 드롭 순서 결정성). */
function makeSeed(): number {
  if (import.meta.env.DEV) {
    const s = window.sessionStorage.getItem("cmxSeed");
    if (s && Number.isFinite(Number(s))) return Number(s) >>> 0;
  }
  return (Math.random() * 0x7fffffff) >>> 0;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function galaxyCount(): number {
  const n = Number(window.localStorage.getItem(GALAXY_KEY));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** 미니 스프라이트를 DOM 캔버스에 찍는다(다음 미리보기·체인 스트립 공용). */
function drawMini(cv: HTMLCanvasElement, tier: number, rDisp: number): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = Number(cv.dataset.size);
  cv.width = size * dpr;
  cv.height = size * dpr;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  const img = sprite(tier, rDisp * dpr);
  const half = rDisp * tierExt(tier);
  ctx.drawImage(img, size / 2 - half, size / 2 - half, half * 2, half * 2);
}

export function cosmoScreen(o: { onExit: () => void }): Screen {
  // ---- 헤더(스텝 러시 문법 — 나가기·타이틀·소리·최고 기록) ----
  const xbtn = el("button", { class: "xbtn", attrs: { "aria-label": "나가기" }, html: icon("x", 20, { sw: 2.4 }) });
  const sfx = new Sfx();
  sfx.enabled = window.localStorage.getItem(SND_KEY) !== "0";
  const bgm = new Bgm(BGM_TRACKS.map((f) => AUDIO_BASE + f));
  /** 오디오 기동 — 반드시 사용자 제스처 안에서(soundLab 규율). 반복 호출 무해. */
  function audioBoot(): void {
    sfx.init();
    sfx.loadSamples(SFX_SAMPLES);
    bgm.init(sfx.context);
    bgm.setMuted(!sfx.enabled);
  }
  const sndBtn = el("button", {
    class: `xbtn cmx-snd ${sfx.enabled ? "" : "off"}`,
    attrs: { "aria-label": "효과음 켜기/끄기", "aria-pressed": String(sfx.enabled) },
    html: icon("note", 18),
  });
  const bestPill = el("div", { class: "pill mg-best", text: `최고 ${bestScore(COSMO_ID)}점` });
  const header = el("div", { class: "lheader" }, xbtn, el("div", { class: "mg-title", text: "코스모 머지" }), sndBtn, bestPill);

  // ---- 무대(캔버스 + HUD 오버레이) ----
  const cv = el("canvas", { class: "cmx-cv", attrs: { "aria-hidden": "true" } }) as unknown as HTMLCanvasElement;
  const scoreNum = el("b", { text: "0" });
  const scoreBox = el("div", { class: "cmx-score", attrs: { "aria-label": "점수" } }, scoreNum, el("span", { text: "점" }));
  const galaxyPill = el("div", { class: "cmx-galaxy", attrs: { "aria-label": "내 은하의 별" }, html: `${icon("star", 11)}<span>0</span>` });
  const nextCv = el("canvas", { class: "cmx-next-cv", attrs: { "data-size": "30", "aria-hidden": "true" } }) as unknown as HTMLCanvasElement;
  const nextChip = el("div", { class: "cmx-next", attrs: { "aria-label": "다음 천체" } }, nextCv, el("span", { text: "다음" }));
  // 든 천체의 간단 개념 한 줄(상단, 천체가 바뀔 때 2.6초 표시 — 이름 라벨은 렌더러가 천체 위에)
  const heldDesc = el("div", { class: "cmx-desc", attrs: { "aria-live": "polite" } });
  const dailyAvail = window.localStorage.getItem(DAILY_KEY) !== todayStr();
  const helper = el(
    "div",
    { class: "cmx-helper" },
    el("b", { text: "같은 천체끼리 만나면 더 큰 천체로 합체!" }),
    el("span", { text: "끌어서 겨누고, 놓으면 떨어져요. 위 점선을 넘치면 끝!" }),
    dailyAvail ? el("span", { class: "daily", text: "오늘 첫 기록 갱신은 스틱 2배!" }) : null,
  );
  const toast = el("div", { class: "cmx-toast", attrs: { role: "status" } });

  // ---- 게임오버 시트 ----
  const ovNum = el("b", { text: "0" });
  const ovBest = el("div", { class: "cmx-ov-best", text: "" });
  const ovMax = el("div", { class: "cmx-ov-max", text: "" });
  const ovNew = el("div", { class: "cmx-ov-new", html: `${icon("star", 13)}<span></span>` });
  const btnRetry = el("button", { class: "cmx-abtn primary", text: "다시 도전" });
  const btnQuit = el("button", { class: "cmx-abtn", text: "그만하기" });
  const overCard = el(
    "div",
    { class: "cmx-card" },
    el("div", { class: "cmx-ov-reason", text: "우주가 가득 찼어요!" }),
    el("div", { class: "cmx-ov-label", text: "이번 점수" }),
    el("div", { class: "cmx-ov-score" }, ovNum, el("span", { text: "점" })),
    ovBest,
    ovMax,
    ovNew,
    el("div", { class: "cmx-ov-btns" }, btnRetry, btnQuit),
  );
  const overLay = el("div", { class: "cmx-over", attrs: { role: "dialog", "aria-modal": "true", "aria-label": "게임 오버" } }, overCard);

  const stage = el("div", { class: "cmx-stage" }, cv, scoreBox, galaxyPill, nextChip, heldDesc, helper, toast, overLay);

  // ---- 체인 스트립(무대 아래 별도 행 — 실제 크기 순서 그대로, 파일 오버레이와 충돌 없음) ----
  // 아이콘을 탭하면 이름·한 줄 설명 토스트("이게 무슨 행성?"을 즉석에서 — 실사용 피드백)
  const chainItems: HTMLElement[] = [];
  const chain = el("div", { class: "cmx-chain", attrs: { "aria-label": "천체 합체 순서" } });
  for (let t = 0; t < TIERS.length; t++) {
    const mini = el("canvas", { attrs: { "data-size": "24" } }) as unknown as HTMLCanvasElement;
    const item = el("button", { class: "cmx-ci", attrs: { type: "button", title: TIERS[t].name, "aria-label": `${TIERS[t].name} 설명` } }, mini);
    item.addEventListener("click", () => {
      showToast(`${TIERS[t].name} · ${TIERS[t].fact}`);
      haptic(HAPTIC.tap);
    });
    chainItems.push(item);
    chain.appendChild(item);
    drawMini(mini, t, t >= 8 ? 8 : 9);
  }

  const host = el("section", { class: "screen cmx-scr", attrs: { id: "sc-cosmo" } }, header, stage, chain);

  // ---- 상태 ----
  let engine = new CosmoEngine(makeSeed());
  const renderer = new CosmoRenderer(cv);
  renderer.reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  renderer.galaxyN = galaxyCount();
  let overHandled = false;
  let lastScore = -1;
  let lastHeld = -1;
  let lastNext = -1;
  let descTimer = 0;
  let pressing = false;
  let dead = false;
  // 연쇄 콤보 — 1.6초 창 안의 연속 합체 순번(연출·소리 전용, 점수 불변)
  let comboN = 0;
  let comboAt = -1e9;
  const toasted = new Set<number>();
  const timers = new Set<number>();
  let toastTimer = 0;

  function later(fn: () => void, ms: number): void {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  }

  function showToast(msg: string): void {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2100);
    timers.add(toastTimer);
  }

  function syncGalaxy(): void {
    renderer.galaxyN = galaxyCount();
    const sp = galaxyPill.querySelector("span");
    if (sp) sp.textContent = String(renderer.galaxyN);
  }
  syncGalaxy();

  function syncChain(): void {
    for (let t = 0; t < TIERS.length; t++) {
      chainItems[t].classList.toggle("on", t < DROP_TIERS || engine.seen.has(t));
    }
  }
  syncChain();

  function syncNext(): void {
    // 다음 미리보기는 nextTier 기준(held 기준이면 같은 티어 연속 드롭 때 미리보기가 안 갱신된다)
    if (engine.nextTier !== lastNext) {
      lastNext = engine.nextTier;
      drawMini(nextCv, engine.nextTier, 10);
    }
    if (engine.heldTier !== lastHeld) {
      lastHeld = engine.heldTier;
      heldDesc.textContent = TIERS[engine.heldTier].fact;
      heldDesc.classList.add("show");
      window.clearTimeout(descTimer);
      descTimer = window.setTimeout(() => heldDesc.classList.remove("show"), 2600);
      timers.add(descTimer);
    }
  }
  syncNext();

  // ---- 이벤트 큐 중계(엔진 → 연출·소리·토스트) ----
  function drain(tMs: number): void {
    const evs = engine.events;
    if (evs.length === 0) return;
    engine.events = [];
    for (const ev of evs) {
      if (ev.type === "drop") {
        sfx.drop();
        syncNext();
      } else if (ev.type === "land") {
        renderer.onLand(ev.x, ev.y, ev.tier, tMs, ev.id);
        sfx.thud();
      } else if (ev.type === "merge") {
        comboN = tMs - comboAt < 1600 ? comboN + 1 : 1;
        comboAt = tMs;
        renderer.onMerge(ev.x, ev.y, ev.tier, tMs, comboN);
        sfx.pop(ev.tier);
        if (comboN >= 2) sfx.combo(comboN);
        if (ev.tier === TIERS.length - 1) {
          renderer.onSun(ev.x, ev.y, tMs);
          sfx.sunborn();
          haptic(HAPTIC.done);
          const n = renderer.galaxyN + 1;
          window.localStorage.setItem(GALAXY_KEY, String(n));
          syncGalaxy();
          showToast(n === 1 ? "태양 탄생! 내 은하에 첫 별이 떴어요" : "태양 탄생! 은하에 별이 하나 늘었어요");
          const ci = chainItems[ev.tier];
          ci.classList.add("pulse");
          later(() => ci.classList.remove("pulse"), 600);
        } else if (!toasted.has(ev.tier)) {
          toasted.add(ev.tier);
          showToast(`${TIERS[ev.tier].name} 탄생! ${TIERS[ev.tier].fact}`);
          haptic(ev.tier >= 7 ? HAPTIC.correct : HAPTIC.select);
          const ci = chainItems[ev.tier];
          ci.classList.add("pulse");
          later(() => ci.classList.remove("pulse"), 600);
        } else {
          haptic(HAPTIC.tap);
        }
        syncChain();
      } else {
        // nova
        renderer.onNova(ev.x, ev.y, engine.novaVictims, tMs);
        sfx.nova();
        haptic(HAPTIC.done);
        stage.classList.add("shake");
        later(() => stage.classList.remove("shake"), 460);
        showToast("초신성 폭발! 별의 먼지가 우주로 돌아가요");
      }
    }
  }

  function showOver(): void {
    const score = engine.score;
    const prev = bestScore(COSMO_ID);
    const newBest = submitScore(COSMO_ID, score);
    ovNum.textContent = String(score);
    ovBest.textContent = `최고 기록 ${Math.max(prev, score)}점`;
    ovMax.textContent = `이번 판 최고 천체: ${TIERS[engine.maxTier].name}`;
    if (newBest && score > prev) {
      // 점수 인플레 보정 — 갱신분의 1/10을 스틱으로(최소 1), 데일리 첫 갱신은 2배
      let sticks = Math.max(1, Math.round((score - prev) / 10));
      let doubled = false;
      if (window.localStorage.getItem(DAILY_KEY) !== todayStr()) {
        sticks *= 2;
        doubled = true;
        window.localStorage.setItem(DAILY_KEY, todayStr());
      }
      awardXp(sticks);
      const sp = ovNew.querySelector("span") as HTMLElement;
      sp.textContent = `신기록! +${sticks} 스틱${doubled ? " · 첫 도전 2배" : ""}`;
      ovNew.classList.add("on");
      sfx.best();
      haptic(HAPTIC.done);
    } else {
      ovNew.classList.remove("on");
    }
    bestPill.textContent = `최고 ${bestScore(COSMO_ID)}점`;
    heldDesc.classList.remove("show");
    overLay.classList.add("on");
    btnRetry.focus();
  }

  function retry(): void {
    engine.destroy();
    engine = new CosmoEngine(makeSeed());
    renderer.reset();
    overHandled = false;
    lastScore = -1;
    lastHeld = -1;
    lastNext = -1;
    comboN = 0;
    comboAt = -1e9;
    toasted.clear();
    scoreNum.textContent = "0";
    syncChain();
    syncNext();
    overLay.classList.remove("on");
    bgm.duck(false);
    haptic(HAPTIC.tap);
  }

  // ---- 루프 ----
  // 주의: nav.go 인자 평가 → stopAllLoops → mount 순서라 여기서 바로 start()하면 즉사(스텝 러시 함정 ①).
  const loop = createLoop((dtNorm, tMs) => {
    engine.tick(dtNorm * 16.7);
    drain(tMs);
    if (engine.phase === "over" && !overHandled) {
      overHandled = true;
      sfx.fall();
      bgm.duck(true); // 시트 동안 배경음을 가라앉힘(재도전 시 복귀)
      haptic(HAPTIC.wrong);
      later(showOver, 420);
    }
    // 존 BGM — 성운(0) → 행성 시대(금성 이상, 1) → 별의 시대(태양 탄생, 2). 같은 존이면 no-op.
    bgm.setZone(engine.sunBorn > 0 ? 2 : engine.maxTier >= 6 ? 1 : 0);
    if (engine.score !== lastScore) {
      lastScore = engine.score;
      scoreNum.textContent = String(lastScore);
    }
    renderer.draw(engine, tMs, dtNorm);
    if (import.meta.env.DEV) {
      host.dataset.cxPhase = engine.phase;
      host.dataset.cxScore = String(engine.score);
      host.dataset.cxBodies = String(engine.bodyCount);
      host.dataset.cxHeld = String(engine.heldTier);
      host.dataset.cxNext = String(engine.nextTier);
      host.dataset.cxMaxTier = String(engine.maxTier);
      host.dataset.cxNova = String(engine.novaCount);
      host.dataset.cxSun = String(engine.sunBorn);
      host.dataset.cxDanger = engine.danger.toFixed(2);
      host.dataset.cxCombo = String(comboN);
    }
  });
  later(() => {
    renderer.resize(); // mount 후 실크기(팩토리 시점엔 0×0)
    loop.start();
  }, 0);

  // DEV·e2e 훅 — 티어 소환(고티어 시나리오)·도감 토글
  if (import.meta.env.DEV) {
    (host as unknown as { __cmx?: object }).__cmx = {
      spawn: (t: number, x: number, y: number, still?: boolean) => engine.spawn(t, x, y, still),
      gallery: (on: boolean) => {
        renderer.gallery = on;
      },
    };
  }

  // ---- 입력(끌어서 조준, 놓으면 드롭 — 수박게임 문법) ----
  function aimFrom(e: PointerEvent): void {
    const rect = cv.getBoundingClientRect();
    engine.aim(renderer.worldX(e.clientX - rect.left));
  }
  stage.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    const t = e.target as HTMLElement;
    if (t.closest(".cmx-over")) return;
    e.preventDefault();
    audioBoot(); // 첫 사용자 제스처에서 오디오 기동(soundLab 규율 — BGM·샘플 포함)
    pressing = true;
    aimFrom(e);
    if (!helper.classList.contains("off")) helper.classList.add("off");
  });
  stage.addEventListener("pointermove", (e) => {
    if (engine.phase === "over") return;
    if (pressing || e.pointerType === "mouse") aimFrom(e);
  });
  stage.addEventListener("pointerup", (e) => {
    if (!pressing) return;
    pressing = false;
    aimFrom(e);
    if (engine.drop()) haptic(HAPTIC.tap);
  });
  stage.addEventListener("pointercancel", () => {
    pressing = false;
  });

  btnRetry.addEventListener("click", retry);
  btnQuit.addEventListener("click", () => exit());
  xbtn.addEventListener("click", () => exit());
  sndBtn.addEventListener("click", () => {
    sfx.enabled = !sfx.enabled;
    if (sfx.enabled) audioBoot();
    bgm.setMuted(!sfx.enabled);
    window.localStorage.setItem(SND_KEY, sfx.enabled ? "1" : "0");
    sndBtn.classList.toggle("off", !sfx.enabled);
    sndBtn.setAttribute("aria-pressed", String(sfx.enabled));
    haptic(HAPTIC.tap);
  });

  // 데스크톱 QA·접근성 — ←/→ 조준, 스페이스·↓ 드롭(시트가 열려 있으면 스페이스 = 다시 도전)
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      engine.aim(engine.aimX + (e.key === "ArrowLeft" ? -16 : 16));
    } else if (e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      if (overLay.classList.contains("on")) retry();
      else if (engine.drop()) haptic(HAPTIC.tap);
    }
  };
  window.addEventListener("keydown", onKey);

  const ro = new ResizeObserver(() => renderer.resize());
  ro.observe(stage);

  function cleanup(): void {
    if (dead) return;
    dead = true;
    loop.stop();
    window.removeEventListener("keydown", onKey);
    ro.disconnect();
    engine.destroy();
    bgm.dispose(); // 컨텍스트 소유자(sfx)보다 먼저 정리
    sfx.dispose();
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
  }

  function exit(): void {
    cleanup();
    o.onExit();
  }

  return { el: host, onExit: cleanup };
}
