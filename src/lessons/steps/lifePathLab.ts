// lifePathLab — 생애 트랙 배치 랩(사회 Ⅶ L2 전용 기함). 사회화 기관 카드를 인생 트랙의
// 알맞은 시기에 배치한다 — "사회화는 평생, 시기마다 주 기관이 다르다"(미래엔 133쪽·비상 130쪽).
//   · 조작 = 드래그(binSort 문법 이식: 7px 문턱·클론·elementFromPoint) + 탭-탭(카드→자리) 겸용.
//     setPointerCapture는 try/catch(전 렌더러 공용 규칙), pointercancel은 원복.
//   · 교육 장치 3개 = 목표 칩 3개:
//     ① 네 정거장 — 가족·또래·학교·직장을 시기에 배치(오배치는 코미디 교정 후 원복)
//     ② 매체의 자리 — 대중 매체 카드만은 정거장이 아니라 **트랙 전체를 덮는 띠**가 정답(반전)
//     ③ 다시 배우기 — 전부 배치하면 어른 정거장에 새 기기가 등장, 재사회화 명명 판정(msn 문법)
//   · 데이터는 ui/judgeKit.ts LIFEPATH — 문구·오배치 코미디까지 def가 소유.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import { LIFEPATH } from "../../ui/judgeKit";
import type { StepRenderer } from "../types";

interface LifePathStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const DRAG_THRESHOLD = 7;

/** 정거장 스틱맨 — 시기별 실루엣(손그림 라인, 아기는 기는 포즈·어른까지 키가 자란다). */
function stationArt(id: string): string {
  const stroke = `stroke="#E8EDF6" stroke-width="2.2" stroke-linecap="round" fill="none"`;
  if (id === "baby")
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><g ${stroke}>
      <circle cx="24" cy="38" r="7" fill="#0B1524"/>
      <path d="M30 42q8-3 14 2M36 44l6 8M44 44l4 9M32 43l-2 9"/>
    </g><circle cx="22" cy="37" r="1" fill="#E8EDF6"/><circle cx="26.4" cy="37" r="1" fill="#E8EDF6"/>
    <path d="M22.5 40.6q1.8 1.2 3.6 0" stroke="#E8EDF6" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>`;
  if (id === "child")
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><g ${stroke}>
      <circle cx="32" cy="26" r="6.4" fill="#0B1524"/>
      <path d="M32 32.5v14M32 36l-9 5M32 36l9-6.5M32 46.5l-7 10M32 46.5l7 10"/>
    </g><circle cx="30" cy="25" r="1" fill="#E8EDF6"/><circle cx="34.2" cy="25" r="1" fill="#E8EDF6"/>
    <path d="M30.4 28.6q1.7 1.2 3.4 0" stroke="#E8EDF6" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    <circle cx="44.5" cy="27.5" r="3.4" stroke="#8FA2C4" stroke-width="1.6" fill="none"/></svg>`;
  if (id === "teen")
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><g ${stroke}>
      <circle cx="32" cy="18" r="6.6" fill="#0B1524"/>
      <path d="M32 25v19M32 29l-10 6M32 29l10 6M32 44l-8 13M32 44l8 13"/>
    </g><rect x="38" y="28" width="9" height="11" rx="2.4" stroke="#8FA2C4" stroke-width="1.8" fill="none"/>
    <circle cx="30" cy="17" r="1" fill="#E8EDF6"/><circle cx="34.2" cy="17" r="1" fill="#E8EDF6"/>
    <path d="M30.4 20.8q1.7 1.2 3.4 0" stroke="#E8EDF6" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>`;
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><g ${stroke}>
      <circle cx="32" cy="14" r="6.8" fill="#0B1524"/>
      <path d="M32 21.5v21M32 26l-11 6.5M32 26l11 6.5M32 42.5l-9 15M32 42.5l9 15"/>
    </g><path d="M41 31.5l5-1.5" stroke="#8FA2C4" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="45" y="27" width="7" height="6" rx="1.4" stroke="#8FA2C4" stroke-width="1.6" fill="none"/>
    <circle cx="30" cy="13" r="1" fill="#E8EDF6"/><circle cx="34.2" cy="13" r="1" fill="#E8EDF6"/>
    <path d="M30.4 16.8q1.7 1.2 3.4 0" stroke="#E8EDF6" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>`;
}

/** 재사회화 새 기기 — 키오스크 앞 물음표 대신 반짝이(글자·기호 최소, 화면은 빈 패널). */
function deviceArt(): string {
  return `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="20" y="10" width="24" height="34" rx="4" fill="#16233C" stroke="#7EC8FF" stroke-width="2"/>
    <rect x="24" y="15" width="16" height="18" rx="2" fill="#0E1830" stroke="#3F6FA8" stroke-width="1.2"/>
    <path d="M27 20h10M27 24h7M27 28h9" stroke="#5E8FC8" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="32" cy="39" r="2" fill="#7EC8FF"/>
    <path d="M26 48h12M28 48l-2 8M36 48l2 8" stroke="#7EC8FF" stroke-width="2" stroke-linecap="round"/>
    <path d="M48 14l1.4 3.4L53 19l-3.6 1.6L48 24l-1.4-3.4L43 19l3.6-1.6zM14 30l1 2.4 2.6 1.1-2.6 1.1-1 2.4-1-2.4-2.6-1.1 2.6-1.1z" fill="#F2C24E"/>
  </svg>`;
}

export const lifePathLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LifePathStep;
  const def = LIFEPATH;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "place" } }, el("b", { text: def.chips.place }), el("span", { text: `0 / ${def.stations.length}` })),
    el("div", { class: "pn-badge world", dataset: { g: "media" } }, el("b", { text: def.chips.media }), el("span", { text: "반전 있어요" })),
    el("div", { class: "pn-badge world", dataset: { g: "reso" } }, el("b", { text: def.chips.reso }), el("span", { text: "마지막에" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "인생 트랙이에요. <b>기관 카드를 끌어서</b>(탭해서 골라도 돼요) 그 기관이 <b>중심이 되는 시기</b>에 놓아 보세요!",
  });

  // ── 무대: 매체 띠 + 정거장 4 + 새 기기 ──
  const band = el(
    "div",
    { class: "lfp-band", dataset: { slot: "media" }, attrs: { role: "button", tabindex: "0", "aria-label": "평생 구간 띠에 놓기" } },
    el("span", { class: "lfp-band-t", text: "평생 ────────── 평생" }),
  );
  const slotEls = new Map<string, HTMLElement>();
  const trackRow = el("div", { class: "lfp-track" });
  for (const st of def.stations) {
    const fig = el("div", { class: "lfp-fig" });
    fig.innerHTML = stationArt(st.id);
    const slot = el(
      "div",
      { class: "lfp-slot", dataset: { slot: st.id }, attrs: { role: "button", tabindex: "0", "aria-label": `${st.name} 시기에 놓기` } },
      fig,
      el("b", { class: "lfp-name", text: st.name }),
      el("span", { class: "lfp-sub", text: st.sub }),
      el("span", { class: "lfp-badge", text: "?" }),
    );
    slotEls.set(st.id, slot);
    trackRow.appendChild(slot);
  }
  const dev = el("div", { class: "lfp-dev" });
  dev.innerHTML = deviceArt();
  const stage = el("div", { class: "stage lfp-stage" }, band, trackRow, el("div", { class: "lfp-road" }), dev);

  // ── 카드 트레이 ──
  const tray = el("div", { class: "lfp-tray" });
  const cardEls = new Map<string, HTMLElement>();
  for (const a of def.agencies.concat([{ id: "media", name: "대중 매체", station: null, wrong: {} }])) {
    const card = el("button", { class: "lfp-card", dataset: { a: a.id }, attrs: { type: "button" }, html: `<b>${a.name}</b>` });
    cardEls.set(a.id, card);
    tray.appendChild(card);
  }

  // ── 재사회화 판정(msn 문법) ──
  const quizQ = el("div", { class: "msn-q", html: def.resocial.q });
  const opts = def.resocial.options.map((o, i) =>
    el("button", { class: "msn-opt", attrs: { type: "button" }, dataset: { o: String(i) }, html: o }),
  );
  const quizCard = el("div", { class: "msn-quiz" }, quizQ, ...opts);

  host.append(goalChips, helper, stage, tray, quizCard);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };

  const placed = new Set<string>(); // agency id
  let picked: string | null = null;
  let clean = true;
  let resoDone = false;

  const chipEl = (g: string): HTMLElement => goalChips.querySelector(`[data-g="${g}"]`) as HTMLElement;
  const chipOn = (g: string, sub: string): void => {
    const chip = chipEl(g);
    if (!chip.classList.contains("on")) {
      chip.classList.add("on");
      chip.querySelector("span")!.textContent = sub;
      haptic(HAPTIC.ctaUnlock);
    }
  };

  function refreshPicked(): void {
    for (const [id, c] of cardEls) c.classList.toggle("picked", picked === id);
  }

  function maybeResocial(): void {
    if (placed.size < def.agencies.length + 1) return;
    later(() => {
      stage.classList.add("reso");
      dev.classList.add("show");
      helper.innerHTML = def.resocial.intro;
      later(() => {
        quizCard.classList.add("show");
        later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
      }, 900);
    }, 900);
  }

  function placeAgency(agencyId: string, slotId: string): void {
    if (placed.has(agencyId)) return;
    const card = cardEls.get(agencyId);
    if (!card) return;
    if (agencyId === "media") {
      if (slotId === "media") {
        placed.add("media");
        card.classList.add("gone");
        band.classList.add("on");
        band.querySelector(".lfp-band-t")!.textContent = "대중 매체 — 평생 함께";
        haptic(HAPTIC.correct);
        helper.innerHTML = def.mediaDone;
        chipOn("media", "평생 함께!");
        maybeResocial();
      } else {
        clean = false;
        haptic(HAPTIC.wrong);
        helper.innerHTML = def.mediaHint;
        band.classList.remove("pulse");
        void band.offsetWidth;
        band.classList.add("pulse");
      }
      picked = null;
      refreshPicked();
      return;
    }
    const agency = def.agencies.find((a) => a.id === agencyId);
    if (!agency) return;
    if (slotId === agency.station) {
      placed.add(agencyId);
      card.classList.add("gone");
      const slot = slotEls.get(slotId)!;
      slot.classList.add("on");
      const badge = slot.querySelector(".lfp-badge") as HTMLElement;
      badge.textContent = agency.name;
      haptic(HAPTIC.correct);
      const st = def.stations.find((k) => k.id === slotId)!;
      helper.innerHTML = st.learn;
      const n = def.agencies.filter((a) => placed.has(a.id)).length;
      const chip = chipEl("place");
      chip.querySelector("span")!.textContent = `${n} / ${def.stations.length}`;
      if (n >= def.stations.length) chipOn("place", `${n} / ${def.stations.length}`);
      maybeResocial();
    } else if (slotId === "media") {
      clean = false;
      haptic(HAPTIC.wrong);
      helper.innerHTML = `<b>${agency.name}</b> 카드를 평생 띠에? 마음은 알지만 이 긴 띠의 주인은 따로 있어요 — <b>${agency.name}</b>에는 중심이 되는 <b>시기(정거장)</b>가 있답니다!`;
    } else {
      clean = false;
      haptic(HAPTIC.wrong);
      const slot = slotEls.get(slotId);
      if (slot) {
        slot.classList.remove("shake");
        void slot.offsetWidth;
        slot.classList.add("shake");
      }
      const stName = def.stations.find((k) => k.id === slotId)?.name ?? "그 시기";
      helper.innerHTML = agency.wrong[slotId] ?? `${stName}에 ${agency.name} 카드는… 시기가 안 맞아요. 다른 정거장을 찾아봐요!`;
    }
    picked = null;
    refreshPicked();
  }

  // ── 탭-탭 경로 ──
  for (const [id, card] of cardEls) {
    card.addEventListener("click", () => {
      // 드래그로 소비된 클릭(이동 후 up이 만든 click)은 무시 — 탭(제자리)만 픽 토글
      if (dragMoved) return;
      if (placed.has(id)) return;
      picked = picked === id ? null : id;
      haptic(HAPTIC.tap);
      refreshPicked();
      if (picked) helper.innerHTML = `<b>${(card.textContent ?? "").trim()}</b> 카드를 골랐어요 — 트랙에서 <b>알맞은 자리를 탭</b>하세요!`;
    });
  }
  const slotTap = (slotId: string): void => {
    if (picked) placeAgency(picked, slotId);
  };
  for (const [id, slot] of slotEls) {
    slot.addEventListener("click", () => slotTap(id));
    slot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        slotTap(id);
      }
    });
  }
  band.addEventListener("click", () => slotTap("media"));
  band.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      slotTap("media");
    }
  });

  // ── 드래그 경로(binSort 문법 이식) ──
  let drag: { id: string; pointerId: number; card: HTMLElement; clone: HTMLElement | null; frameRect: DOMRect | null; sx: number; sy: number } | null = null;
  let dragMoved = false;

  function slotUnder(e: PointerEvent): string | null {
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const t = hit?.closest?.("[data-slot]") as HTMLElement | null;
    return t?.dataset.slot ?? null;
  }
  function clearHover(): void {
    stage.querySelectorAll(".hover").forEach((n) => n.classList.remove("hover"));
  }
  function endDrag(e: PointerEvent, commit: boolean): void {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const d = drag;
    drag = null;
    d.clone?.remove();
    d.card.classList.remove("ghost");
    clearHover();
    if (commit && dragMoved) {
      const slot = slotUnder(e);
      if (slot) placeAgency(d.id, slot);
    }
    later(() => {
      dragMoved = false;
    }, 0);
  }
  for (const [id, card] of cardEls) {
    card.addEventListener("pointerdown", (e) => {
      if (drag || placed.has(id)) return;
      try {
        card.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 이벤트 — 캡처 없이도 동작 */
      }
      drag = { id, pointerId: e.pointerId, card, clone: null, frameRect: null, sx: e.clientX, sy: e.clientY };
      dragMoved = false;
    });
    card.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if (!dragMoved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        dragMoved = true;
        const r = drag.card.getBoundingClientRect();
        const clone = drag.card.cloneNode(true) as HTMLElement;
        clone.className = "lfp-card drag-clone";
        clone.style.width = `${r.width}px`;
        const frame = document.getElementById("frame");
        (frame ?? document.body).appendChild(clone);
        drag.frameRect = frame ? frame.getBoundingClientRect() : null;
        drag.clone = clone;
        drag.card.classList.add("ghost");
        haptic(HAPTIC.select);
      }
      if (dragMoved && drag.clone) {
        const ox = drag.frameRect?.left ?? 0;
        const oy = drag.frameRect?.top ?? 0;
        drag.clone.style.transform = `translate(${e.clientX - ox}px, ${e.clientY - oy}px) translate(-50%, -70%) scale(1.06)`;
        const over = slotUnder(e);
        clearHover();
        if (over) {
          const target = over === "media" ? band : slotEls.get(over);
          target?.classList.add("hover");
        }
      }
    });
    card.addEventListener("pointerup", (e) => endDrag(e, true));
    card.addEventListener("pointercancel", (e) => endDrag(e, false)); // 판정 없이 원복(유령 배치 방지)
  }

  // ── 재사회화 판정 ──
  opts.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (resoDone) return;
      if (i === 0) {
        resoDone = true;
        btn.classList.add("ok");
        opts.forEach((b, k) => k !== 0 && b.classList.add("dim"));
        haptic(HAPTIC.correct);
        chipOn("reso", "재사회화!");
        helper.innerHTML = def.resocial.good;
        later(() => {
          helper.innerHTML = def.finale;
          api.recordQuiz(clean);
          api.enableCTA(s.cta ?? "다음");
        }, 1500);
      } else {
        clean = false;
        btn.classList.add("no");
        haptic(HAPTIC.wrong);
        helper.innerHTML = def.resocial.wrong;
        later(() => btn.classList.remove("no"), 900);
      }
    });
  });

  api.setCTA("카드를 모두 배치해요", { enabled: false });

  return () => {
    drag?.clone?.remove();
    drag = null;
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
