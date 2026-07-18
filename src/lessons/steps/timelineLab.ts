// timelineLab — 역사 트랙 연표 문법 1호(파라미터형). 눈금 범위·과제가 전부 데이터(ui/timelineKit)라
// Ⅱ~Ⅶ 단원은 TIMELINES에 def를 추가하고 defId만 바꿔 그대로 재사용한다.
// 과제 3종: 세기 읽기(기원후 칸 탭) → 거꾸로 세기(기원전 칸 탭 — 이 랩의 핵심 함정) → 사건 배치(연도 카드).
// 규율: rAF 없음(CSS 전환+setTimeout 체인, 타이머는 Set으로 cleanup), 탭 전용 — QA 프리즈 환경에서도 완주.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import {
  TIMELINES, centuriesOf, centuryOf, fmtCentury, fmtRange, fmtYear, posOf,
  type TimelineDef, type TimelineTask,
} from "../../ui/timelineKit";
import type { StepRenderer } from "../types";

interface TimelineStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
  defId: string;
}

export const timelineLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TimelineStep;
  const def: TimelineDef | undefined = TIMELINES[s.defId];

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  if (!def) {
    // 정의 누락 — 콘텐츠 결함이지만 학습 흐름은 막지 않는다(폴백 안내 후 CTA 개방).
    host.appendChild(el("div", { class: "helper", html: "연표 데이터를 찾지 못했어요. 다음 단계로 넘어가요." }));
    api.setCTA(s.cta ?? "계속하기", { enabled: true, onClick: api.next });
    return;
  }

  const cents = centuriesOf(def);
  const readTasks = def.tasks.filter((t) => t.kind === "century" && t.century > 0);
  const revTasks = def.tasks.filter((t) => t.kind === "century" && t.century < 0);
  const placeTasks = def.tasks.filter((t) => t.kind === "place");

  // ── 목표 칩(있는 과제 묶음만 — h1u1은 3종 전부) ──────────────
  const chipDefs = [
    readTasks.length ? { g: "read", name: "세기 읽기", sub0: "기원후 칸", sub1: "읽었다!" } : null,
    revTasks.length ? { g: "rev", name: "거꾸로 세기", sub0: "기원전 칸", sub1: "역방향 정복!" } : null,
    placeTasks.length ? { g: "place", name: "사건 배치", sub0: `카드 ${placeTasks.length}장`, sub1: "연표 완성!" } : null,
  ].filter((c): c is { g: string; name: string; sub0: string; sub1: string } => !!c);
  const goalChips = el(
    "div",
    { class: `pn-badges${chipDefs.length === 3 ? " force3" : ""}` },
    ...chipDefs.map((c) => el("div", { class: "pn-badge his", dataset: { g: c.g } }, el("b", { text: c.name }), el("span", { text: c.sub0 }))),
  );

  const helper = el("div", {
    class: "helper",
    html: "연표는 <b>왼쪽이 먼 과거</b>예요. 눈금 한 칸이 100년 = <b>한 세기</b>! 첫 임무부터 시작해요.",
  });

  // ── 연표 무대 ────────────────────────────────────────────────
  const stage = el("div", { class: "stage htl-stage" });
  const wrap = el("div", { class: "htl-wrap" });
  const bcCount = cents.filter((c) => c < 0).length;
  const bcPct = (bcCount / cents.length) * 100;
  const eras = el(
    "div",
    { class: "htl-eras" },
    el("span", { class: "bc", style: `width:${bcPct}%`, text: "기원전" }),
    el("span", { class: "ad", text: "기원후" }),
  );
  const strip = el("div", { class: "htl-strip" });
  const cellEls = new Map<number, HTMLButtonElement>();
  for (const c of cents) {
    const cell = el("button", {
      class: `htl-cell${c < 0 ? " bc" : ""}`,
      dataset: { c: String(c) },
      attrs: { type: "button", "aria-label": `연표 칸 ${fmtRange(c)}` },
    }) as HTMLButtonElement;
    strip.appendChild(cell);
    cellEls.set(c, cell);
  }
  // 원년(기원전↔기원후 경계) 마커 — 서기의 기준점
  const originLeft = bcPct;
  strip.appendChild(el("div", { class: "htl-origin", style: `left:${originLeft}%`, attrs: { "aria-hidden": "true" } }, el("i", {}), el("b", { text: "원년" })));
  const events = el("div", { class: "htl-events", attrs: { "aria-hidden": "true" } });
  strip.appendChild(events);
  const pill = el("div", { class: "htl-pill", attrs: { "aria-hidden": "true" } });
  strip.appendChild(pill);

  // 경계 눈금 라벨 — 숫자만(기원전/기원후는 시대 띠가 말한다). 원년 눈금은 금색.
  const ticks = el("div", { class: "htl-ticks", attrs: { "aria-hidden": "true" } });
  const minY = def.startCentury * 100;
  for (let i = 0; i <= cents.length; i += 1) {
    const y = minY + i * 100;
    const label = y === 0 || (minY < 0 && i === bcCount) ? "1" : String(Math.abs(y));
    const left = (i / cents.length) * 100;
    const t = el("span", { class: `htl-tick${label === "1" ? " one" : ""}`, style: `left:${left}%`, text: label });
    if (i === 0) t.classList.add("first");
    if (i === cents.length) t.classList.add("last");
    ticks.appendChild(t);
  }

  const task = el("div", { class: "htl-task" });
  wrap.append(eras, strip, ticks, task);
  stage.appendChild(wrap);
  host.append(goalChips, helper, stage);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ── 진행 상태 ────────────────────────────────────────────────
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };
  let idx = 0; // 현재 과제 인덱스
  let finished = false;
  const doneOf = { read: 0, rev: 0, place: 0 };

  const chipOn = (g: "read" | "rev" | "place"): void => {
    const c = chipDefs.find((k) => k.g === g);
    const elc = goalChips.querySelector(`[data-g="${g}"]`) as HTMLElement | null;
    if (!c || !elc) return;
    elc.classList.add("on");
    elc.querySelector("span")!.textContent = c.sub1;
  };

  function revealCell(c: number): void {
    const cell = cellEls.get(c);
    if (!cell || cell.classList.contains("solved")) return;
    cell.classList.add("solved");
    cell.innerHTML = `${c < 0 ? "<em>기원전</em>" : "<em>기원후</em>"}<b>${Math.abs(c)}</b><i>세기</i>`;
  }

  function showPill(c: number): void {
    pill.textContent = fmtRange(c);
    const centers = cents.indexOf(c) + 0.5;
    const left = (centers / cents.length) * 100;
    pill.style.left = `${Math.min(86, Math.max(14, left))}%`;
    pill.classList.remove("show");
    void pill.offsetWidth;
    pill.classList.add("show");
    later(() => pill.classList.remove("show"), 2600);
  }

  function stampEvent(year: number, label: string, nth: number): void {
    const left = posOf(def!, year);
    const mark = el(
      "div",
      { class: `htl-event${nth % 2 ? " low" : ""}`, style: `left:${left}%` },
      el("i", {}),
      el("b", { html: `${fmtYear(year)}<span>${label}</span>` }),
    );
    events.appendChild(mark);
  }

  function taskCard(): void {
    const t = def!.tasks[idx] as TimelineTask | undefined;
    if (!t) return;
    if (t.kind === "century") {
      task.innerHTML = `<span class="htl-quest">임무 ${idx + 1}</span><b class="htl-target">${fmtCentury(t.century)}</b><span class="htl-ask">칸을 연표에서 탭!</span>`;
      helper.innerHTML =
        t.century > 0
          ? `1년부터 100년까지가 <b>1세기</b>예요. 그럼 <b>${fmtCentury(t.century)}</b>는 몇 년부터 몇 년까지일까요? 연표에서 그 칸을 <b>탭</b>!`
          : `기원전은 <b>거꾸로</b> 세요! 왼쪽으로 갈수록 숫자가 커져요. <b>${fmtCentury(t.century)}</b> 칸을 찾아 <b>탭</b>!`;
    } else {
      task.innerHTML = `<span class="htl-quest">임무 ${idx + 1}</span><div class="htl-card"><b>${fmtYear(t.year)}</b><span>${t.label}</span></div><span class="htl-ask">이 사건이 속한 세기 칸을 탭!</span>`;
      helper.innerHTML = `사건 카드가 나왔어요. <b>${fmtYear(t.year)}</b>은 어느 세기 칸에 들어갈까요? 눈금을 읽고 <b>탭</b>!`;
    }
    task.classList.remove("in");
    void task.offsetWidth;
    task.classList.add("in");
  }

  function advance(): void {
    idx += 1;
    if (idx < def!.tasks.length) {
      later(taskCard, 900);
      return;
    }
    if (finished) return;
    finished = true;
    later(() => {
      stage.classList.add("finale");
      haptic(HAPTIC.done);
      task.innerHTML = "";
      helper.innerHTML =
        "연표 완성! <b>기원후는 오른쪽으로, 기원전은 왼쪽으로 갈수록 큰 수</b> — 이제 어떤 연도든 세기 칸을 찾을 수 있어요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "정리하러 가기");
      later(() => stage.classList.remove("finale"), 3200);
    }, 820);
  }

  function onCell(c: number): void {
    if (finished) return;
    const t = def!.tasks[idx] as TimelineTask | undefined;
    if (!t) return;
    const cell = cellEls.get(c)!;
    const target = t.kind === "century" ? t.century : centuryOf(t.year);
    if (c === target) {
      haptic(HAPTIC.correct);
      revealCell(c);
      showPill(c);
      cell.classList.remove("pop");
      void cell.offsetWidth;
      cell.classList.add("pop");
      if (t.kind === "century") {
        if (t.century > 0) {
          doneOf.read += 1;
          helper.innerHTML = `정확해요! <b>${fmtCentury(t.century)} = ${fmtRange(t.century)}</b>. 끝 연도가 딱 떨어지는 해(${Math.abs(centuryRangeEnd(t.century))}년)까지가 그 세기예요.`;
          if (doneOf.read === readTasks.length) chipOn("read");
        } else {
          doneOf.rev += 1;
          helper.innerHTML = `거꾸로 세기 성공! <b>${fmtCentury(t.century)} = ${fmtRange(t.century)}</b> — 기원전은 큰 수에서 작은 수로 흘러요.`;
          if (doneOf.rev === revTasks.length) chipOn("rev");
        }
      } else {
        doneOf.place += 1;
        stampEvent(t.year, t.label, doneOf.place);
        helper.innerHTML = `<b>${fmtYear(t.year)} = ${fmtCentury(target)}</b>(${fmtRange(target)}) — 연표에 도장 쾅!`;
        if (doneOf.place === placeTasks.length) chipOn("place");
      }
      advance();
    } else {
      haptic(HAPTIC.wrong);
      cell.classList.remove("shake");
      void cell.offsetWidth;
      cell.classList.add("shake");
      showPill(c);
      if (t.kind === "century") {
        const dir = target < c ? "왼쪽" : "오른쪽";
        helper.innerHTML = `방금 칸은 <b>${fmtCentury(c)}</b>(${fmtRange(c)})예요. ${
          t.century < 0 ? "기원전은 왼쪽으로 갈수록 숫자가 커져요 — " : ""
        }<b>${fmtCentury(t.century)}</b>는 더 ${dir}!`;
      } else {
        helper.innerHTML = `그 칸은 <b>${fmtRange(c)}</b> 구간이에요. <b>${fmtYear(t.year)}</b>이 그 사이에 있는지 눈금을 다시 읽어 봐요!`;
      }
    }
  }

  strip.addEventListener("click", (e) => {
    const b = (e.target as Element).closest?.(".htl-cell") as HTMLButtonElement | null;
    if (!b) return;
    onCell(Number(b.dataset.c));
  });

  taskCard();
  api.setCTA("연표 임무를 완수해요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};

/** 세기의 끝 연도 절댓값(도우미 문구용). 4 → 400, -2 → 101. */
function centuryRangeEnd(c: number): number {
  return c > 0 ? c * 100 : (c + 1) * 100 - 1;
}
