// 오답노트 — 틀린 문항을 다시 풀어 "해결"하는 복습 화면. 복습 탭·마이페이지에서 진입.
// 데이터는 채점 순간의 스냅샷(store.wrongNotes)이라 콘텐츠가 바뀌어도 스스로 렌더된다.
// 탐색은 필터형(2026-07-15, 사용자 확정): 과목 세그(오답이 있는 과목이 둘일 때만) →
// 상태 탭 [다시 풀 문제 | 해결한 문제(라이브러리)] → 단원 칩(전체 + 오답 있는 단원, 하나뿐이면 생략)
// → 고른 단원의 카드만 보여준다. 목록을 전부 쌓아 놓는 구조(v1 단원 섹션 헤더)는 폐기.
// 레슨별 소구획은 두지 않는다 — 카드의 출처 라벨 + 레슨 순 정렬이 그 역할.
// 콘텐츠가 사라져 단원을 못 찾는 노트는 "지난 콘텐츠" 칩으로 모인다.
// 다시 풀기: mcq/ox 탭 즉시 채점 · multi 복수 선택+확인 · num/word는 정답 열람+자기 확인.
// 맞히면 해결(초록·해결한 문제 탭으로 이동), 또 틀리면 횟수 누적 + 해설 공개.
// 그림 문항: 그림은 스냅샷에 없고(용량) 원본 콘텐츠에서 역추적해 그대로 보여준다 —
// 콘텐츠가 바뀌어 못 찾을 때만 "그림 문제" 칩 + 원문 복습 안내로 폴백.
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { wrongNoteList, recordWrongNote, resolveWrongNote, getViewSubject } from "../core/store";
import type { WrongNote } from "../core/store";
import { CURRICULA_OF, SUBJECT_LABEL, findLesson, subjectOfUnit } from "../content/curriculum";
import type { SubjectId } from "../content/curriculum";
import { examById } from "../content/exams";
import { stickAvatar } from "../ui/avatar";
import type { Screen } from "../core/router";

const TYPE_LABEL: Record<WrongNote["type"], string> = {
  mcq: "선택형",
  ox: "OX",
  multi: "합답형",
  num: "수치 단답",
  word: "용어 단답",
};

/** 출처 라벨 — 전체 보기에서만 단원명을 병기(단원 칩으로 필터하면 중복이라 레슨 제목 + 종류만).
 *  콘텐츠가 없으면 종류만. */
function sourceLabel(n: WrongNote, withUnit: boolean): string {
  const found = findLesson(n.lessonId);
  const kindLabel = n.kind === "exam" ? "단원 평가" : "레슨 퀴즈";
  if (!found) return kindLabel;
  const lesson = `${found.lesson.title} · ${kindLabel}`;
  return withUnit ? `${found.unit.title} · ${lesson}` : lesson;
}

/** 그림 원본 역추적 — 시험은 키의 문항 id로 풀에서, 레슨은 같은 프롬프트의 quiz 스텝에서.
 *  콘텐츠가 바뀌어 못 찾으면 null(카드가 안내 문구로 폴백). */
function figureOf(n: WrongNote): { html: string; dark: boolean } | null {
  if (!n.hasFigure) return null;
  if (n.kind === "exam") {
    const prefix = `e:${n.srcId}:`;
    if (!n.key.startsWith(prefix)) return null;
    const itemId = n.key.slice(prefix.length);
    const it = examById(n.srcId)?.pool.find((x) => x.id === itemId);
    return it?.figure ? { html: it.figure, dark: !!it.figureDark } : null;
  }
  const step = findLesson(n.lessonId)?.lesson.steps.find((s) => s.type === "quiz" && s.prompt === n.q);
  return step && typeof step.figure === "string" && step.figure
    ? { html: step.figure, dark: !!step.figureDark }
    : null;
}

export function notebookScreen(onClose: () => void, onOpenLesson?: (id: string) => void): Screen {
  const close = el("button", { class: "backbtn", attrs: { "aria-label": "닫기" }, html: icon("x", 22) });
  close.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    onClose();
  });
  const head = el(
    "div",
    { class: "obhead" },
    close,
    el("div", { class: "nb-htitle", text: "오답노트" }),
    el("div", { style: "width:38px" }),
  );

  let snackTimer = 0;
  const snackEl = el("div", { class: "snack" });
  function snack(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2200);
  }

  const body = el("div", { class: "scroll pad" });
  let subj: SubjectId = getViewSubject(); // 과목 필터 — 기본은 지금 학습 중인 과목
  let tab: "open" | "done" = "open"; // 상태 탭 — 다시 풀 문제 ⇄ 해결한 문제(라이브러리)
  let unitSel = "all"; // 단원 필터 — "all"(전체) | unitId | ""(지난 콘텐츠)

  function render(): void {
    body.replaceChildren();
    const notes = wrongNoteList();

    if (!notes.length) {
      body.appendChild(
        el(
          "div",
          { class: "nb-empty" },
          el("div", { class: "login-ava" }, stickAvatar("wave")),
          el("div", { class: "nb-empty-t", text: "아직 오답이 없어요" }),
          el("div", { class: "nb-empty-s", text: "문제를 틀리면 여기에 자동으로 모여요. 다시 풀어서 완전히 내 것으로 만들어요." }),
        ),
      );
      return;
    }

    // ── 과목 → 단원 분류. 콘텐츠가 사라져 단원을 못 찾는 노트는 id 접두로 과목만 추정해
    //    "" 묶음(지난 콘텐츠)에 담는다 — 수학 레슨 id는 m으로 시작(subjectOfUnit과 같은 규칙).
    const unitOf = new Map<string, string>(); // note.key -> unitId("" = 원문 소실)
    const bySubj = new Map<SubjectId, Map<string, WrongNote[]>>();
    for (const n of notes) {
      const unit = findLesson(n.lessonId)?.unit ?? null;
      const s: SubjectId = unit ? subjectOfUnit(unit.id) : n.lessonId.startsWith("m") ? "math" : "sci";
      unitOf.set(n.key, unit?.id ?? "");
      const m = bySubj.get(s) ?? new Map<string, WrongNote[]>();
      const arr = m.get(unit?.id ?? "") ?? [];
      arr.push(n);
      m.set(unit?.id ?? "", arr);
      bySubj.set(s, m);
    }

    const subjects = (Object.keys(SUBJECT_LABEL) as SubjectId[]).filter((s) => bySubj.has(s));
    if (!subjects.includes(subj)) subj = subjects[0]; // 선택 과목에 오답이 없으면 있는 쪽으로

    // ① 과목 세그 — 두 과목 모두 오답이 있을 때만(하나뿐이면 구분할 게 없다). 홈 학년 세그 스타일 재사용.
    if (subjects.length > 1) {
      const seg = el("div", { class: "grade-seg nb-subjseg" });
      for (const s of subjects) {
        const openN = [...bySubj.get(s)!.values()].flat().filter((n) => !n.overcome).length;
        const b = el("button", { class: `gseg ${s === subj ? "on" : ""}`, text: openN ? `${SUBJECT_LABEL[s]} ${openN}` : SUBJECT_LABEL[s] });
        b.addEventListener("click", () => {
          if (s === subj) return;
          haptic(HAPTIC.tap);
          subj = s;
          unitSel = "all";
          render();
        });
        seg.appendChild(b);
      }
      body.appendChild(seg);
    }

    const units = bySubj.get(subj)!;
    const mine = [...units.values()].flat();
    const openAll = mine.filter((n) => !n.overcome);
    const doneAll = mine.filter((n) => n.overcome);

    // ② 상태 탭 — 다시 풀 문제 ⇄ 해결한 문제(다시 풀어 맞힌 문제의 라이브러리)
    const tabs = el("div", { class: "seg nb-tabs" });
    for (const [k, label] of [["open", `다시 풀 문제 ${openAll.length}`], ["done", `해결한 문제 ${doneAll.length}`]] as const) {
      const b = el("button", { class: k === tab ? "on" : "", text: label });
      b.addEventListener("click", () => {
        if (tab === k) return;
        haptic(HAPTIC.tap);
        tab = k;
        unitSel = "all";
        render();
      });
      tabs.appendChild(b);
    }
    body.appendChild(tabs);

    // ③ 단원 칩 — 현재 탭에 문제가 있는 단원만(커리큘럼 순, 중1 → 중2). 원문 소실분은 "지난 콘텐츠".
    //    단원이 하나뿐이면 고를 게 없으니 칩 행을 생략한다(전체 = 그 단원).
    const inTab = (n: WrongNote): boolean => (tab === "open" ? !n.overcome : n.overcome);
    const pool = mine.filter(inTab);
    const unitsInTab = [...CURRICULA_OF[subj].g1, ...CURRICULA_OF[subj].g2].filter((u) => (units.get(u.id) ?? []).some(inTab));
    const lostN = (units.get("") ?? []).filter(inTab).length;
    const avail = ["all", ...unitsInTab.map((u) => u.id), ...(lostN ? [""] : [])];
    if (!avail.includes(unitSel)) unitSel = "all";
    if (avail.length > 2) {
      const chips = el("div", { class: "nb-uchips" });
      const chip = (id: string, label: string, count: number): void => {
        const c = el("button", { class: `nb-uchip ${unitSel === id ? "on" : ""}` }, el("span", { text: label }), el("i", { text: String(count) }));
        c.addEventListener("click", () => {
          if (unitSel === id) return;
          haptic(HAPTIC.tap);
          unitSel = id;
          render();
        });
        chips.appendChild(c);
      };
      chip("all", "전체", pool.length);
      for (const u of unitsInTab) chip(u.id, u.title, (units.get(u.id) ?? []).filter(inTab).length);
      if (lostN) chip("", "지난 콘텐츠", lostN);
      body.appendChild(chips);
    }

    // ④ 목록 — 단원(커리큘럼 순) → 레슨 순 → 최근순. 전체 보기에서만 카드 라벨에 단원명 병기.
    const order = new Map<string, number>();
    [...CURRICULA_OF[subj].g1, ...CURRICULA_OF[subj].g2].forEach((u, i) => order.set(u.id, i));
    const lessonIdx = (id: string): number => findLesson(id)?.index ?? 99;
    const list = pool
      .filter((n) => unitSel === "all" || unitOf.get(n.key) === unitSel)
      .sort(
        (a, b) =>
          (order.get(unitOf.get(a.key) ?? "") ?? 999) - (order.get(unitOf.get(b.key) ?? "") ?? 999) ||
          lessonIdx(a.lessonId) - lessonIdx(b.lessonId) ||
          b.ts - a.ts,
      );

    if (unitSel === "") body.appendChild(el("div", { class: "nb-unit-hint", text: "콘텐츠 업데이트로 원문과 연결이 끊긴 문제예요. 다시 풀기는 그대로 할 수 있어요." }));

    if (!list.length) {
      body.appendChild(
        tab === "open"
          ? el("div", { class: "nb-allclear" }, el("span", { html: icon("check", 18) }), el("span", { text: "지금 다시 풀 문제가 없어요. 전부 해결했어요!" }))
          : el("div", { class: "nb-libempty", text: "아직 해결한 문제가 없어요. 다시 풀어서 맞히면 여기에 모여요." }),
      );
    }
    for (const n of list) body.appendChild(noteCard(n, unitSel === "all"));
  }

  function noteCard(n: WrongNote, withUnit: boolean): HTMLElement {
    const card = el("div", { class: `nb-card ${n.overcome ? "overcome" : ""}` });
    const fig = figureOf(n);
    const lessonAlive = !!(onOpenLesson && findLesson(n.lessonId));

    const meta = el("div", { class: "nb-meta" });
    meta.appendChild(el("span", { class: "nb-src", text: sourceLabel(n, withUnit) }));
    meta.appendChild(el("span", { class: "nb-chip", text: TYPE_LABEL[n.type] ?? n.type }));
    if (n.hasFigure && !fig) meta.appendChild(el("span", { class: "nb-chip fig", text: "그림 문제" }));
    if (n.wrongCount >= 2 && !n.overcome) meta.appendChild(el("span", { class: "nb-chip warn", text: `${n.wrongCount}번 틀림` }));
    if (n.overcome) meta.appendChild(el("span", { class: "nb-chip ok", text: "해결" }));
    card.appendChild(meta);

    card.appendChild(el("div", { class: "nb-q", html: n.q }));
    if (n.bogi?.length) {
      const box = el("div", { class: "nb-bogi" });
      const label = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ"];
      n.bogi.forEach((b, i) => box.appendChild(el("div", { class: "nb-bogi-row", html: `<b>${label[i] ?? i + 1}.</b> ${b}` })));
      card.appendChild(box);
    }
    if (fig) {
      // 시험 리뷰와 같은 문법(q-figure) — 다시 풀 때 그림을 보며 풀 수 있어야 한다
      card.appendChild(
        el("div", { class: `q-figure ${fig.dark ? "dark" : ""}` }, el("div", { class: "q-figure-art", html: fig.html })),
      );
    } else if (n.hasFigure) {
      card.appendChild(
        el("div", {
          class: "nb-fignote",
          text: lessonAlive
            ? "그림이 있는 문제예요 — 원문은 아래 복습 버튼으로 볼 수 있어요."
            : "그림이 있는 문제예요 — 콘텐츠가 업데이트되어 그림을 불러올 수 없어요.",
        }),
      );
    }

    const zone = el("div", { class: "nb-zone" });
    card.appendChild(zone);

    if (!n.overcome) {
      const start = el("button", { class: "nb-retry", text: "다시 풀기" });
      start.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        start.remove();
        mountSolver(n, card, zone);
      });
      zone.appendChild(start);
    } else if (n.explain) {
      const show = el("button", { class: "nb-ghost", text: "해설 다시 보기" });
      show.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        show.remove();
        zone.appendChild(explainBox(n));
      });
      zone.appendChild(show);
    }

    // 원문 복습 — 콘텐츠가 살아 있을 때만
    if (lessonAlive) {
      const go = el("button", { class: "nb-lesson", html: `레슨 복습하기 ${icon("chevron", 13)}` });
      go.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        onOpenLesson(n.lessonId);
      });
      card.appendChild(go);
    }
    return card;
  }

  function explainBox(n: WrongNote): HTMLElement {
    const box = el("div", { class: "nb-explain" });
    if (n.explain) box.appendChild(el("div", { class: "nb-explain-body", html: n.explain }));
    if (n.core) box.appendChild(el("div", { class: "nb-core", html: `<b>핵심</b> ${n.core}` }));
    return box;
  }

  /** 다시 풀기 UI — 유형별 채점. 맞히면 해결(라이브러리 탭으로), 틀리면 횟수 누적 + 정답·해설 공개. */
  function mountSolver(n: WrongNote, card: HTMLElement, zone: HTMLElement): void {
    const finish = (good: boolean): void => {
      if (good) {
        resolveWrongNote(n.key);
        card.classList.add("overcome");
        snack("해결했어요! 이제 이 문제는 내 거예요.");
        haptic(HAPTIC.correct);
      } else {
        const { key, kind, srcId, lessonId, type, q, bogi, opts, answer, explain, core, hasFigure } = n;
        recordWrongNote({ key, kind, srcId, lessonId, type, q, bogi, opts, answer, explain, core, hasFigure });
        snack("괜찮아요 — 해설을 읽고 다음에 다시 도전해요.");
        haptic(HAPTIC.wrong);
      }
      zone.appendChild(explainBox(n));
      if (good) window.setTimeout(render, 1400); // 해결 애니 여운 뒤 목록 갱신(오답은 해설을 읽게 그대로 둔다)
    };

    if (n.type === "num" || n.type === "word") {
      // 단답형 — 정답을 확인하고 스스로 판단(넘패드·워드뱅크 재현은 후속)
      const reveal = el("button", { class: "nb-retry", text: "정답 확인하기" });
      reveal.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        reveal.remove();
        zone.appendChild(el("div", { class: "nb-answer", html: `정답: <b>${String(n.answer)}</b>` }));
        const ok = el("button", { class: "nb-retry ok", text: "이제 알겠어요" });
        ok.addEventListener("click", () => {
          ok.remove();
          finish(true);
        });
        zone.appendChild(ok);
        zone.appendChild(explainBox(n));
      });
      zone.appendChild(reveal);
      return;
    }

    const opts = n.type === "ox" ? ["O", "X"] : (n.opts ?? []);
    const answerSet = new Set(Array.isArray(n.answer) ? n.answer : []);
    const box = el("div", { class: "nb-opts" });
    const btns: HTMLButtonElement[] = [];
    const selected = new Set<number>();
    let locked = false;

    const gradeNow = (): void => {
      locked = true;
      let good = selected.size === answerSet.size;
      for (const s of selected) if (!answerSet.has(s)) good = false;
      btns.forEach((b, i) => {
        b.disabled = true;
        if (answerSet.has(i)) b.classList.add("good");
        else if (selected.has(i)) b.classList.add("bad");
        else b.classList.add("dim");
      });
      confirmBtn?.remove();
      finish(good);
    };

    opts.forEach((o, i) => {
      const b = el("button", { class: "nb-opt", html: o }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (locked) return;
        haptic(HAPTIC.tap);
        if (n.type === "multi") {
          if (selected.has(i)) {
            selected.delete(i);
            b.classList.remove("sel");
          } else {
            selected.add(i);
            b.classList.add("sel");
          }
          if (confirmBtn) confirmBtn.disabled = selected.size === 0;
        } else {
          selected.add(i);
          gradeNow();
        }
      });
      btns.push(b);
      box.appendChild(b);
    });
    zone.appendChild(box);

    let confirmBtn: HTMLButtonElement | null = null;
    if (n.type === "multi") {
      confirmBtn = el("button", { class: "nb-retry", text: "확인하기" }) as HTMLButtonElement;
      confirmBtn.disabled = true;
      confirmBtn.addEventListener("click", () => {
        if (!locked && selected.size) gradeNow();
      });
      zone.appendChild(confirmBtn);
    }
  }

  render();
  const elm = el("section", { class: "screen" }, head, body, snackEl);
  return { el: elm };
}
