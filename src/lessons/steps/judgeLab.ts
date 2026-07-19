// judgeLab — 사례 판단 랩(일반사회 공통 엔진 1호, 사회 Ⅶ 확립 — Ⅷ~Ⅻ 재사용).
// 생활 사례 카드가 **한 장씩** 나오고, 아래 개념 선반 중 알맞은 쪽을 탭해 판정한다.
//   · binSort(일괄 배치 → 일괄 채점)와 다른 점 = **즉시 판정 + 오답별 맞춤 교정(traps)**.
//     "왜 그 개념으로 보였을까"를 그 자리에서 짚는 것이 성취기준 '사례를 들어 설명'의 앱판.
//   · 오답 시 카드는 남고(재시도) 교정 helper만 갱신 — 정답을 눌러야 다음 카드로 간다.
//   · 전 카드 판정 후 한 줄 정리 판정(msn-quiz 문법 재사용 — options[0]=정답 고정, 랩 내 판정 관례).
//   · 데이터는 ui/judgeKit.ts JUDGES[defId]가 단일 진실 공급원 — 렌더러는 파라미터형.
// 목표 칩 3: 카드 판정(진행 N/M) · 함정 통과(trap 카드 해결) · 한 줄 정리.
// 채점: recordQuiz(무오답 1회 완주 — 카드 전부 + 정리 판정까지 첫 시도 정답).
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import { JUDGES } from "../../ui/judgeKit";
import type { StepRenderer } from "../types";

interface JudgeStep {
  title: string;
  lead?: string;
  judge: string; // JUDGES 키
  cta?: string;
  curio?: Curio;
}

export const judgeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as JudgeStep;
  const def = JUDGES[s.judge];
  if (!def) {
    host.appendChild(el("div", { class: "h1", html: s.title }));
    host.appendChild(el("div", { class: "sub", text: `사례 데이터가 없어요: ${s.judge}` }));
    api.setCTA("다음", { enabled: true, onClick: api.next });
    return;
  }

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "all" } }, el("b", { text: def.chips.all }), el("span", { text: `0 / ${def.cases.length}` })),
    el("div", { class: "pn-badge world", dataset: { g: "trap" } }, el("b", { text: def.chips.trap }), el("span", { text: "함정 카드" })),
    el("div", { class: "pn-badge world", dataset: { g: "final" } }, el("b", { text: def.chips.final }), el("span", { text: "마지막 판정" })),
  );
  const helper = el("div", {
    class: "helper",
    html: `<b>${def.deck}</b>이 한 장씩 나와요. 카드를 읽고, 아래 <b>알맞은 선반을 탭</b>해 판정해 보세요!`,
  });

  // ── 무대: 진행 필 + 카드 + 개념 선반 ──
  const progress = el("div", { class: "jdg-progress", text: `1 / ${def.cases.length}` });
  const deckLab = el("div", { class: "jdg-deck", text: def.deck });
  const cardTxt = el("div", { class: "jdg-card-t" });
  const card = el("div", { class: "jdg-card", dataset: { i: "0" } }, cardTxt);
  const cardZone = el("div", { class: "jdg-zone" }, card);
  const shelves = el("div", { class: "jdg-shelves" });
  const shelfEls = new Map<string, { btn: HTMLElement; drop: HTMLElement; count: HTMLElement }>();
  for (const c of def.concepts) {
    const drop = el("div", { class: "jdg-drop" });
    const count = el("span", { class: "jdg-count", text: "0" });
    const btn = el(
      "button",
      { class: "jdg-shelf", style: `--jc:${c.color}`, dataset: { c: c.id }, attrs: { type: "button", "aria-label": `${c.name} 선반에 판정` } },
      el("div", { class: "jdg-shelf-head" }, el("span", { class: "jdg-dot" }), el("b", { text: c.name }), count),
      el("div", { class: "jdg-hint", text: c.hint }),
      drop,
    );
    shelfEls.set(c.id, { btn, drop, count });
    shelves.appendChild(btn);
  }
  const stage = el("div", { class: "stage jdg-stage" }, el("div", { class: "jdg-top" }, deckLab, progress), cardZone, shelves);

  // ── 한 줄 정리 판정(msn 문법 — options[0]=정답 고정) ──
  const quizQ = el("div", { class: "msn-q", html: def.final.q });
  const opts = def.final.options.map((o, i) =>
    el("button", { class: "msn-opt", attrs: { type: "button" }, dataset: { o: String(i) }, html: o }),
  );
  const quizCard = el("div", { class: "msn-quiz" }, quizQ, ...opts);

  host.append(goalChips, helper, stage, quizCard);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };

  let idx = 0;
  let busy = false;
  let cleanWholeRun = true; // 무오답 완주 추적(카드 + 정리 판정)
  let finalDone = false;
  const setChip = (g: string, sub?: string): void => {
    const chip = goalChips.querySelector(`[data-g="${g}"]`) as HTMLElement;
    if (!chip || chip.classList.contains("on")) return;
    chip.classList.add("on");
    if (sub) chip.querySelector("span")!.textContent = sub;
    haptic(HAPTIC.ctaUnlock);
  };

  function showCase(i: number): void {
    const c = def.cases[i];
    card.dataset.i = String(i);
    card.classList.remove("fly", "shake", "in");
    cardTxt.innerHTML = c.text;
    progress.textContent = `${i + 1} / ${def.cases.length}`;
    void card.offsetWidth;
    card.classList.add("in");
  }

  function allDone(): void {
    setChip("all", `${def.cases.length} / ${def.cases.length}`);
    cardTxt.innerHTML = "카드 판정 완료!";
    card.classList.remove("in");
    card.classList.add("done");
    progress.textContent = "✓";
    helper.innerHTML = "전 카드 판정 완료! 이제 아래에서 <b>한 줄 정리</b>로 기준을 굳혀요.";
    later(() => {
      quizCard.classList.add("show");
      later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    }, 500);
  }

  function judge(conceptId: string): void {
    if (busy || idx >= def.cases.length) return;
    const c = def.cases[idx];
    const shelf = shelfEls.get(conceptId);
    if (!shelf) return;
    if (conceptId === c.answer) {
      busy = true;
      haptic(HAPTIC.correct);
      helper.innerHTML = c.why;
      // 카드가 선반으로 내려앉는 연출 — 미니 칩 적재
      card.classList.add("fly");
      later(() => {
        const mini = el("span", { class: "jdg-mini", html: c.text });
        shelf.drop.appendChild(mini);
        shelf.count.textContent = String(shelf.drop.children.length);
        shelf.btn.classList.add("pop");
        later(() => shelf.btn.classList.remove("pop"), 420);
        if (c.trap) setChip("trap", "통과!");
        idx += 1;
        if (idx >= def.cases.length) {
          busy = false;
          allDone();
        } else {
          showCase(idx);
          busy = false;
        }
      }, 430);
    } else {
      cleanWholeRun = false;
      haptic(HAPTIC.wrong);
      card.classList.remove("shake");
      void card.offsetWidth;
      card.classList.add("shake");
      helper.innerHTML = c.traps?.[conceptId] ?? "다시 봐요 — 카드의 상황이 어느 선반의 기준에 맞는지 힌트를 읽어 봐요!";
    }
  }

  for (const [id, sh] of shelfEls) sh.btn.addEventListener("click", () => judge(id));

  opts.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (finalDone) return;
      if (i === 0) {
        finalDone = true;
        btn.classList.add("ok");
        opts.forEach((b, k) => k !== 0 && b.classList.add("dim"));
        haptic(HAPTIC.correct);
        setChip("final", "정리 완료");
        helper.innerHTML = def.final.good;
        later(() => {
          helper.innerHTML = def.finale;
          api.recordQuiz(cleanWholeRun);
          api.enableCTA(s.cta ?? "다음");
        }, 1400);
      } else {
        cleanWholeRun = false;
        btn.classList.add("no");
        haptic(HAPTIC.wrong);
        helper.innerHTML = def.final.wrong;
        later(() => btn.classList.remove("no"), 900);
      }
    });
  });

  showCase(0);
  api.setCTA("카드를 모두 판정해요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
