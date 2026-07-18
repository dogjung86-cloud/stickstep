// 스텝 러시 — 도전 탭 간판 미니게임(무한의 계단 문법, 프리미엄). M3 메타판.
// 화면 조립·입력·HUD·게임오버 시트만 여기서 담당하고, 로직은 engine.ts(시드 RNG·순수),
// 그림·파티클·셰이크는 render.ts(gameKit 조합), 소리는 gameKit.Sfx(신스+이벤트 샘플)와
// gameKit.Bgm(존 크로스페이드 배경음악 — 일레븐랩스 발주 qa/gen-steprush-audio.mjs)이 맡는다.
// main.ts openStepRush()가 프리미엄 게이트 소유. 보상은 신기록 갱신분만 스틱(파밍 불가).
//
// 입력은 하이브리드(2026-07-17 사용자 논의로 확정): 버튼은 시각 앵커(자기설명 — 읽는 규칙
// 금지 원칙), 실제 히트 존은 화면 왼쪽/오른쪽 절반 전체(헤더·게임오버 시트 제외) — 속도가
// 붙었을 때 버튼을 빗맞아 죽는 "UI 실패"를 없앤다. 버튼 자체는 키보드 접근성 경로로 유지.
//
// M3 메타(가드레일: 조작 2버튼 불변·읽는 규칙 금지·벌 불변, 다양성은 보상 층에만):
//  ① 별 계단(피버 자동 질주) — 최고기록 50 돌파로 해금(점진 공개, 시트에 해금 안내)
//  ② "지난 나" 고스트 — 직전 최고 계단에 반투명 스틱맨, 넘는 순간 토스트+반짝
//  ③ 데일리 — 오늘 첫 기록 갱신 스틱 2배(localStorage, 갱신 없으면 소진 안 됨)
//  ④ 장화 실착 — 러너 발 색 = 내 장화 티어(core/level×ui/boots, 무지개는 걸음마다 순환)
import { el } from "../../core/dom";
import { icon } from "../../core/icons";
import { haptic, HAPTIC } from "../../core/haptics";
import { createLoop } from "../../core/anim";
import { awardXp, bestScore, getState, submitScore } from "../../core/store";
import { bootLevel } from "../../core/level";
import { bootColor } from "../../ui/boots";
import type { Screen } from "../../core/router";
import { Bgm, Sfx } from "../gameKit";
import { RushEngine } from "./engine";
import { GEAR_STAGES, RushRenderer, type RushFx } from "./render";

export const STEP_RUSH_ID = "steprush";
const SND_KEY = "srx.sound"; // 기기 설정(동기화 대상 아님) — "0"이면 끔
const DAILY_KEY = "srx.daily"; // 오늘 첫 기록 갱신 2배를 이미 쓴 날짜(YYYY-MM-DD)
const STAR_AT = 50; // 별 계단(피버) 해금 최고기록 문턱
const SHIELD_AT = 100; // 방패 해금
const GLASS_AT = 200; // 모래시계 해금
const UNLOCKS = [
  { at: STAR_AT, name: "별 계단" },
  { at: SHIELD_AT, name: "방패" },
  { at: GLASS_AT, name: "모래시계" },
] as const;

/** 현재 최고기록 기준 해금 옵션(점진 공개 — 첫 판은 일반+골드만). */
function unlockOpts(): { star: boolean; shield: boolean; glass: boolean } {
  const best = bestScore(STEP_RUSH_ID);
  return { star: best >= STAR_AT, shield: best >= SHIELD_AT, glass: best >= GLASS_AT };
}

// ── 오디오 에셋(일레븐랩스 발주 — qa/gen-steprush-audio.mjs) ──
// BGM 존은 배경 여정(render STOPS)과 같은 문턱: 낮 도시→노을→밤→오로라→우주.
// 파일이 없거나 로드 실패면 Bgm/Sfx가 전부 무음·신스 폴백으로 무해하게 동작한다.
const AUDIO_BASE = `${import.meta.env.BASE_URL}game/steprush/`;
const BGM_ZONES = [
  { at: 0, file: "bgm-day.mp3" },
  { at: 65, file: "bgm-sunset.mp3" },
  { at: 175, file: "bgm-night.mp3" },
  { at: 520, file: "bgm-aurora.mp3" },
  { at: 950, file: "bgm-space.mp3" },
] as const;

function zoneOf(p: number): number {
  let z = 0;
  for (let i = 0; i < BGM_ZONES.length; i++) if (p >= BGM_ZONES[i].at) z = i;
  return z;
}

const SFX_SAMPLES: Record<string, string> = {
  fall: `${AUDIO_BASE}sfx-fall.mp3`,
  best: `${AUDIO_BASE}sfx-best.mp3`,
  fever: `${AUDIO_BASE}sfx-fever.mp3`,
  save: `${AUDIO_BASE}sfx-save.mp3`,
  freeze: `${AUDIO_BASE}sfx-freeze.mp3`,
  gear: `${AUDIO_BASE}sfx-gear.mp3`,
};

/** 판마다 새 시드. DEV에선 sessionStorage.srxSeed로 고정 가능(e2e 결정성). */
function makeSeed(): number {
  if (import.meta.env.DEV) {
    const s = window.sessionStorage.getItem("srxSeed");
    if (s && Number.isFinite(Number(s))) return Number(s) >>> 0;
  }
  return (Math.random() * 0x7fffffff) >>> 0;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function stepRushScreen(o: { onExit: () => void }): Screen {
  // ---- 헤더(별그리기 게임 헤더 문법 재사용 + 소리 토글) ----
  const xbtn = el("button", { class: "xbtn", attrs: { "aria-label": "나가기" }, html: icon("x", 20, { sw: 2.4 }) });
  const sfx = new Sfx();
  sfx.enabled = window.localStorage.getItem(SND_KEY) !== "0";
  const bgm = new Bgm(BGM_ZONES.map((z) => AUDIO_BASE + z.file));
  /** 오디오 기동 — 반드시 사용자 제스처 안에서(soundLab 규율). 반복 호출 무해. */
  function audioBoot(): void {
    sfx.init();
    sfx.loadSamples(SFX_SAMPLES);
    bgm.init(sfx.context);
    bgm.setMuted(!sfx.enabled);
  }
  const sndBtn = el("button", {
    class: `xbtn srx-snd ${sfx.enabled ? "" : "off"}`,
    attrs: { "aria-label": "소리 켜기/끄기", "aria-pressed": String(sfx.enabled) },
    html: icon("note", 18),
  });
  const bestPill = el("div", { class: "pill mg-best", text: `최고 ${bestScore(STEP_RUSH_ID)}계단` });
  const header = el("div", { class: "lheader" }, xbtn, el("div", { class: "mg-title", text: "스텝 러시" }), sndBtn, bestPill);

  // ---- 무대(캔버스 + HUD 오버레이) ----
  const cv = el("canvas", { class: "srx-cv", attrs: { "aria-hidden": "true" } }) as unknown as HTMLCanvasElement;
  const scoreNum = el("b", { text: "0" });
  const scoreBox = el("div", { class: "srx-score", attrs: { "aria-label": "오른 계단 수" } }, scoreNum, el("span", { text: "계단" }));
  const stamFill = el("i", { class: "srx-stam-fill" });
  const stamBar = el(
    "div",
    { class: "srx-stam", attrs: { role: "progressbar", "aria-label": "스태미나", "aria-valuemin": "0", "aria-valuemax": "100" } },
    stamFill,
  );
  const dailyAvail = window.localStorage.getItem(DAILY_KEY) !== todayStr();
  const helper = el(
    "div",
    { class: "srx-helper" },
    el("b", { text: "다음 계단이 앞이면 오르기, 반대쪽이면 방향 전환!" }),
    el("span", { text: "화면 왼쪽·오른쪽 반을 눌러도 돼요. 잘못 밟으면 추락!" }),
    dailyAvail ? el("span", { class: "daily", text: "오늘 첫 기록 갱신은 스틱 2배!" }) : null,
  );
  const toast = el("div", { class: "srx-toast", attrs: { role: "status" } });

  // ---- 게임오버 시트 ----
  const ovReason = el("div", { class: "srx-ov-reason", text: "" });
  const ovNum = el("b", { text: "0" });
  const ovBest = el("div", { class: "srx-ov-best", text: "" });
  const ovUnlock = el("div", { class: "srx-ov-unlock", html: `${icon("sparkle", 13)}<span>50계단 돌파! 이제 별 계단이 나와요</span>` });
  const ovNew = el("div", { class: "srx-ov-new", html: `${icon("star", 13)}<span></span>` });
  const btnRetry = el("button", { class: "srx-abtn primary", text: "다시 도전" });
  const btnQuit = el("button", { class: "srx-abtn", text: "그만하기" });
  const overCard = el(
    "div",
    { class: "srx-card" },
    ovReason,
    el("div", { class: "srx-ov-label", text: "이번 기록" }),
    el("div", { class: "srx-ov-score" }, ovNum, el("span", { text: "계단" })),
    ovBest,
    ovUnlock,
    ovNew,
    el("div", { class: "srx-ov-btns" }, btnRetry, btnQuit),
  );
  const overLay = el("div", { class: "srx-over", attrs: { role: "dialog", "aria-modal": "true", "aria-label": "게임 오버" } }, overCard);

  const stage = el("div", { class: "srx-stage" }, cv, scoreBox, stamBar, helper, toast, overLay);

  // ---- 조작부(2버튼 = 시각 앵커 + 키보드 경로. 터치 히트 존은 화면 반반) ----
  const btnTurn = el("button", { class: "srx-btn turn" }, el("span", { class: "srx-bi", html: icon("swap", 20) }), el("span", { text: "방향 전환" }));
  const btnUp = el("button", { class: "srx-btn up" }, el("span", { class: "srx-bi", html: icon("footstep", 20) }), el("span", { text: "오르기" }));
  const ctrl = el("div", { class: "srx-ctrl" }, btnTurn, btnUp);

  const host = el("section", { class: "screen srx-scr", attrs: { id: "sc-steprush" } }, header, stage, ctrl);

  // ---- 상태 ----
  let engine = new RushEngine(makeSeed(), unlockOpts());
  const renderer = new RushRenderer(cv);
  renderer.reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const fx: RushFx = { hopAt: -1e9, goldAt: 0, overAt: 0 };
  let overHandled = false;
  let lastScore = -1;
  let ghostAt = 0;
  let ghostPassed = false;
  let feverWas = false;
  let prevSaved = 0;
  let dead = false;
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
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2000);
    timers.add(toastTimer);
  }

  /** 판 시작마다 메타 상태 동기화 — 고스트 위치·장화 색·DEV 훅. */
  function applyMeta(): void {
    ghostAt = bestScore(STEP_RUSH_ID);
    ghostPassed = false;
    feverWas = false;
    prevSaved = 0;
    renderer.ghostAt = ghostAt;
    const tier = bootLevel(getState().lifeXp).tier;
    const bc = bootColor(tier.id);
    renderer.bootColor = bc.color;
    renderer.bootRainbow = bc.rainbow;
    if (import.meta.env.DEV) {
      host.dataset.srStar = bestScore(STEP_RUSH_ID) >= STAR_AT ? "1" : "0";
      host.dataset.srPassed = "0";
      host.dataset.srFever = "0";
      host.dataset.srSaved = "0";
    }
  }
  applyMeta();

  /** 버튼 프레스 시각 피드백 — 존 탭은 :active가 안 걸리므로 클래스로 재현. */
  function flash(btn: HTMLElement): void {
    btn.classList.add("pressed");
    later(() => btn.classList.remove("pressed"), 110);
  }

  function press(kind: "up" | "turn"): void {
    if (engine.phase === "over") return;
    flash(kind === "up" ? btnUp : btnTurn);
    if (kind === "up") engine.up();
    else engine.turn();
    if (!helper.classList.contains("off")) helper.classList.add("off");
    // 성공/골드/별/피버 연출은 루프의 점수 변화 감지가 일괄 처리(피버 자동 등반과 경로 통일).
  }

  function onFall(now: number): void {
    fx.overAt = now;
    renderer.onFall(engine);
    sfx.fall();
    haptic(HAPTIC.wrong);
    stage.classList.add("shake");
    later(() => stage.classList.remove("shake"), 420);
    later(showOver, 560);
  }

  function showOver(): void {
    const score = engine.p;
    const prev = bestScore(STEP_RUSH_ID);
    const newBest = submitScore(STEP_RUSH_ID, score);
    const gained = newBest ? score - prev : 0;
    ovReason.textContent = engine.reason === "tired" ? "숨이 다 찼어요!" : "발을 헛디뎠어요!";
    ovNum.textContent = String(score);
    ovBest.textContent = `최고 기록 ${Math.max(prev, score)}계단`;
    const crossed = UNLOCKS.filter((u) => prev < u.at && Math.max(prev, score) >= u.at);
    if (crossed.length > 0) {
      (ovUnlock.querySelector("span") as HTMLElement).textContent = `새로 열렸어요: ${crossed.map((u) => u.name).join(" · ")}`;
    }
    ovUnlock.classList.toggle("on", crossed.length > 0);
    if (gained > 0) {
      // 데일리 — 오늘 첫 "기록 갱신"에만 2배(갱신 없는 판은 소진하지 않는다)
      let granted = gained;
      let doubled = false;
      if (window.localStorage.getItem(DAILY_KEY) !== todayStr()) {
        granted = gained * 2;
        doubled = true;
        window.localStorage.setItem(DAILY_KEY, todayStr());
      }
      awardXp(granted);
      (ovNew.querySelector("span") as HTMLElement).textContent = `신기록! +${granted} 스틱${doubled ? " · 첫 도전 2배" : ""}`;
      ovNew.classList.add("on");
      sfx.best();
      haptic(HAPTIC.done);
    } else {
      ovNew.classList.remove("on");
    }
    bestPill.textContent = `최고 ${bestScore(STEP_RUSH_ID)}계단`;
    bgm.duck(true); // 시트 동안 배경음을 가라앉힘(재도전 시 복귀)
    overLay.classList.add("on");
    btnRetry.focus();
  }

  function retry(): void {
    engine = new RushEngine(makeSeed(), unlockOpts());
    fx.hopAt = -1e9;
    fx.goldAt = 0;
    fx.overAt = 0;
    overHandled = false;
    lastScore = -1;
    renderer.reset();
    applyMeta();
    bgm.duck(false);
    overLay.classList.remove("on");
    haptic(HAPTIC.tap);
  }

  // ---- 루프(렌더 + 스태미나 적분 + over/스텝/피버/고스트 감지) ----
  // 주의: nav.go(stepRushScreen(...))는 인자 평가(여기) → stopAllLoops() → mount 순서라,
  // 여기서 바로 start()하면 전환 순간 루프가 죽는다 — setTimeout(0)으로 mount 뒤에 시작한다.
  const loop = createLoop((dtNorm, tMs) => {
    engine.tick(dtNorm * 16.7);
    if (engine.phase === "over" && !overHandled) {
      overHandled = true;
      onFall(tMs);
    }
    const fever = engine.feverLeft > 0;
    if (engine.p !== lastScore) {
      const prevScore = lastScore;
      lastScore = engine.p;
      scoreNum.textContent = String(lastScore);
      fx.hopAt = tMs;
      renderer.onStep(engine);
      if (engine.star.has(engine.p)) {
        renderer.onStar(engine);
      } else if (engine.gold.has(engine.p)) {
        fx.goldAt = tMs;
        renderer.onGold(engine);
        sfx.gold();
        if (!fever) haptic(HAPTIC.select);
      } else if (engine.shieldStairs.has(engine.p)) {
        renderer.onShield(engine);
        sfx.shield();
        showToast("방패 장착! 헛디딤 한 번을 막아줘요");
        if (!fever) haptic(HAPTIC.select);
      } else if (engine.glassStairs.has(engine.p)) {
        renderer.onGlass(engine);
        sfx.glass();
        showToast("모래시계! 5초 동안 숨이 안 닳아요");
        if (!fever) haptic(HAPTIC.select);
      } else {
        sfx.step(engine.p);
        if (!fever) haptic(HAPTIC.tap);
      }
      for (const g of GEAR_STAGES) {
        if (prevScore < g.at && engine.p >= g.at) {
          renderer.onGear(engine);
          sfx.gear();
          showToast(g.msg);
          haptic(HAPTIC.select);
        }
      }
      if (ghostAt > 0 && !ghostPassed && engine.p > ghostAt) {
        ghostPassed = true;
        renderer.passGhost(engine, tMs);
        sfx.pass();
        haptic(HAPTIC.correct);
        showToast("지난 나를 넘었어요!");
        if (import.meta.env.DEV) host.dataset.srPassed = "1";
      }
    }
    if (engine.saved !== prevSaved) {
      prevSaved = engine.saved;
      renderer.onShieldBreak(engine);
      sfx.save();
      haptic(HAPTIC.wrong);
      showToast("방패가 막아줬어요!");
      if (import.meta.env.DEV) host.dataset.srSaved = "1";
    }
    if (fever && !feverWas) {
      sfx.fever();
      haptic(HAPTIC.correct);
      showToast("별 계단! 자동 질주!");
    }
    feverWas = fever;
    stamFill.style.width = `${engine.stamina}%`;
    stamBar.setAttribute("aria-valuenow", String(Math.round(engine.stamina)));
    stamBar.classList.toggle("low", engine.phase === "run" && engine.stamina < 25 && engine.freezeMs <= 0);
    stamBar.classList.toggle("frozen", engine.freezeMs > 0);
    stage.classList.toggle("day", engine.p < 120); // 낮 구간 — HUD를 잉크색으로(밝은 하늘 대비)
    bgm.setZone(zoneOf(engine.p)); // 존 BGM — 같은 존이면 내부 no-op(오디오 미기동 시에도 무해)
    renderer.draw(engine, fx, tMs, dtNorm);
    if (import.meta.env.DEV) {
      host.dataset.srPhase = engine.phase;
      host.dataset.srScore = String(engine.p);
      host.dataset.srNext = engine.nextIsAhead() ? "up" : "turn";
      host.dataset.srFever = fever ? "1" : "0";
      host.dataset.srShieldOn = engine.shield > 0 ? "1" : "0";
      host.dataset.srFrozen = engine.freezeMs > 0 ? "1" : "0";
    }
  });
  later(() => {
    renderer.resize(); // mount 후 실제 크기로 재맞춤(팩토리 시점엔 0×0)
    loop.start();
  }, 0);

  // ---- 입력 배선 ----
  // 터치 히트 존: 화면 세로 전체 × 좌/우 절반(헤더·게임오버 시트만 제외).
  // 버튼도 이 존 안에 있으므로 자연히 같은 경로를 탄다(버튼 자체 pointerdown 리스너 없음).
  host.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return; // 우클릭류 무시
    const t = e.target as HTMLElement;
    if (t.closest(".lheader") || t.closest(".srx-over")) return;
    e.preventDefault();
    audioBoot(); // 첫 사용자 제스처에서 오디오 기동(신스+샘플+BGM)
    const r = host.getBoundingClientRect();
    press(e.clientX < r.left + r.width / 2 ? "turn" : "up");
  });
  // 키보드 접근성 — 포커스한 버튼의 Enter/Space는 click(detail 0)으로 온다(포인터 click은 무시해 이중 입력 방지).
  btnTurn.addEventListener("click", (e) => {
    if (e.detail === 0) press("turn");
  });
  btnUp.addEventListener("click", (e) => {
    if (e.detail === 0) press("up");
  });
  btnRetry.addEventListener("click", retry);
  btnQuit.addEventListener("click", () => exit());
  xbtn.addEventListener("click", () => exit());
  sndBtn.addEventListener("click", () => {
    sfx.enabled = !sfx.enabled;
    if (sfx.enabled) audioBoot(); // 토글도 사용자 제스처 — 켤 때 즉시 기동
    bgm.setMuted(!sfx.enabled);
    window.localStorage.setItem(SND_KEY, sfx.enabled ? "1" : "0");
    sndBtn.classList.toggle("off", !sfx.enabled);
    sndBtn.setAttribute("aria-pressed", String(sfx.enabled));
    haptic(HAPTIC.tap);
  });

  // 데스크톱 QA 편의 — 버튼 배치와 같은 방향(← 방향 전환 / → 오르기, 스페이스 = 오르기)
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      press("turn");
    } else if (e.key === "ArrowRight" || e.key === " " || e.key === "ArrowUp") {
      e.preventDefault();
      if (overLay.classList.contains("on")) retry();
      else press("up");
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
