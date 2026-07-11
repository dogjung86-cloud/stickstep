// 오답노트 — 틀린 문항을 다시 풀어 "극복"하는 복습 화면. 마이페이지(로그인 화면)에서 진입.
// 데이터는 채점 순간의 스냅샷(store.wrongNotes)이라 콘텐츠가 바뀌어도 스스로 렌더된다.
// 다시 풀기: mcq/ox 탭 즉시 채점 · multi 복수 선택+확인 · num/word는 정답 열람+자기 확인.
// 맞히면 극복(초록), 또 틀리면 횟수 누적 + 해설 공개.
// 그림 문항: 그림은 스냅샷에 없고(용량) 원본 콘텐츠에서 역추적해 그대로 보여준다 —
// 콘텐츠가 바뀌어 못 찾을 때만 "그림 문제" 칩 + 원문 복습 안내로 폴백.
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { wrongNoteList, wrongNoteCount, recordWrongNote, resolveWrongNote } from "../core/store";
import type { WrongNote } from "../core/store";
import { findLesson } from "../content/curriculum";
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

/** 출처 라벨 — 콘텐츠가 남아 있으면 레슨 제목, 없으면 종류만. */
function sourceLabel(n: WrongNote): string {
  const found = findLesson(n.lessonId);
  const kindLabel = n.kind === "exam" ? "단원 평가" : "레슨 퀴즈";
  if (!found) return kindLabel;
  return `${found.unit.roman}. ${found.lesson.title} · ${kindLabel}`;
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

  function render(): void {
    body.replaceChildren();
    const notes = wrongNoteList();
    const open = notes.filter((n) => !n.overcome).sort((a, b) => b.ts - a.ts);
    const done = notes.filter((n) => n.overcome).sort((a, b) => b.ts - a.ts);

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

    const { open: openCount, overcome: doneCount } = wrongNoteCount();
    body.appendChild(
      el(
        "div",
        { class: "nb-summary" },
        el("span", { class: "nb-sum-open", text: `못 잡은 문제 ${openCount}` }),
        el("span", { class: "nb-sum-dot", text: "·" }),
        el("span", { class: "nb-sum-done", text: `극복 ${doneCount}` }),
      ),
    );

    if (!open.length) {
      body.appendChild(
        el(
          "div",
          { class: "nb-allclear" },
          el("span", { html: icon("check", 18) }),
          el("span", { text: "지금 남은 오답이 없어요 — 전부 극복했어요!" }),
        ),
      );
    }
    for (const n of open) body.appendChild(noteCard(n));

    if (done.length) {
      const sec = el("button", { class: "nb-donehead", attrs: { "aria-expanded": "false" } },
        el("span", { text: `극복한 문제 ${done.length}` }),
        el("span", { class: "nb-donehead-ic", html: icon("chevronDown", 16) }),
      );
      const list = el("div", { class: "nb-donelist", style: "display:none" });
      for (const n of done) list.appendChild(noteCard(n));
      sec.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        const show = list.style.display === "none";
        list.style.display = show ? "" : "none";
        sec.setAttribute("aria-expanded", String(show));
        sec.classList.toggle("open", show);
      });
      body.appendChild(sec);
      body.appendChild(list);
    }
  }

  function noteCard(n: WrongNote): HTMLElement {
    const card = el("div", { class: `nb-card ${n.overcome ? "overcome" : ""}` });
    const fig = figureOf(n);
    const lessonAlive = !!(onOpenLesson && findLesson(n.lessonId));

    const meta = el("div", { class: "nb-meta" });
    meta.appendChild(el("span", { class: "nb-src", text: sourceLabel(n) }));
    meta.appendChild(el("span", { class: "nb-chip", text: TYPE_LABEL[n.type] ?? n.type }));
    if (n.hasFigure && !fig) meta.appendChild(el("span", { class: "nb-chip fig", text: "그림 문제" }));
    if (n.wrongCount >= 2 && !n.overcome) meta.appendChild(el("span", { class: "nb-chip warn", text: `${n.wrongCount}번 틀림` }));
    if (n.overcome) meta.appendChild(el("span", { class: "nb-chip ok", text: "극복" }));
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

  /** 다시 풀기 UI — 유형별 채점. 맞히면 극복, 틀리면 횟수 누적 + 정답·해설 공개. */
  function mountSolver(n: WrongNote, card: HTMLElement, zone: HTMLElement): void {
    const finish = (good: boolean): void => {
      if (good) {
        resolveWrongNote(n.key);
        card.classList.add("overcome");
        snack("극복했어요! 이제 이 문제는 내 거예요.");
        haptic(HAPTIC.correct);
      } else {
        const { key, kind, srcId, lessonId, type, q, bogi, opts, answer, explain, core, hasFigure } = n;
        recordWrongNote({ key, kind, srcId, lessonId, type, q, bogi, opts, answer, explain, core, hasFigure });
        snack("괜찮아요 — 해설을 읽고 다음에 다시 도전해요.");
        haptic(HAPTIC.wrong);
      }
      zone.appendChild(explainBox(n));
      if (good) window.setTimeout(render, 1400); // 극복 애니 여운 뒤 목록 갱신(오답은 해설을 읽게 그대로 둔다)
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
