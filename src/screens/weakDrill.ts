// 취약 단원 문제 뽑기(프리미엄) — 복습 탭에서 진입. 소단원을 직접 골라 그곳에서만 문제를 뽑는다.
// 문항은 단원 종합 평가 문제 은행(content/exams/)을 재사용: lessonId 태그·해설·그림이 완비된 유일한 풀.
// 시험과 달리 복습 도구라 문제마다 즉시 채점 + 해설을 보여 주고, 오답노트 키를 시험과 공유해
// 여기서 맞히면 시험에서 틀렸던 같은 문항도 자동 극복된다. XP는 없다(파밍 방지) — 학습일만 집계.
import { el, clear, countUp } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { makeAnswerPad, checkAnswer } from "../ui/mathKit";
import { examForUnit, drawExamItems } from "../content/exams";
import type { ExamDef, ExamItem } from "../content/exams";
import { CURRICULA_OF, SUBJECT_LABEL, GRADE_LABEL, findLesson, gradeOfUnit } from "../content/curriculum";
import type { Unit, GradeId, SubjectId } from "../content/curriculum";
import type { Lesson } from "../lessons/types";
import { wrongNoteList, recordWrongNote, resolveWrongNote, touchStudyActivity, getViewSubject, getViewGrade } from "../core/store";
import type { Screen } from "../core/router";

interface DrillUnit {
  subject: SubjectId;
  grade: GradeId;
  unit: Unit;
  def: ExamDef;
  lessons: Lesson[]; // 문제 은행에 문항이 있는 소단원만
}

interface DrillQ {
  item: ExamItem;
  srcExamId: string; // 오답노트 키를 시험과 공유하기 위한 출처 시험 id
  order: number[]; // mcq·multi 표시 순서(저작 인덱스 나열)
  resp: number | number[] | string | null;
  good: boolean;
}

const CHECK = icon("check", 12);
const GANADA = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ"];

/** 문제 은행이 있는 단원만(전 과목·전 학년 스캔 — 2026-07-20 과목·학년 선택 도입).
 *  여기 없는 과목·단원은 시험 풀이 열리는 대로 자동 추가된다(사회·역사도 등록만 하면 뜬다). */
function drillUnits(): DrillUnit[] {
  const out: DrillUnit[] = [];
  for (const subject of Object.keys(CURRICULA_OF) as SubjectId[]) {
    for (const grade of ["g1", "g2"] as GradeId[]) {
      for (const unit of CURRICULA_OF[subject][grade]) {
        const def = examForUnit(unit.id);
        if (!def || def.pool.length === 0) continue;
        const has = new Set(def.pool.map((it) => it.lessonId));
        const lessons = unit.lessons.filter((l) => has.has(l.id));
        if (lessons.length) out.push({ subject, grade, unit, def, lessons });
      }
    }
  }
  return out;
}

/** 소단원별 미극복 오답 수 — 레슨 퀴즈·시험 오답이 전부 lessonId를 갖고 있다. */
function openWrongByLesson(): Map<string, number> {
  const m = new Map<string, number>();
  for (const n of wrongNoteList()) {
    if (n.overcome) continue;
    m.set(n.lessonId, (m.get(n.lessonId) ?? 0) + 1);
  }
  return m;
}

export interface WeakDrillOpts {
  onExit: () => void;
  onOpenLesson: (lessonId: string) => void;
}

export function weakDrillScreen(opts: WeakDrillOpts): Screen {
  const UNITS = drillUnits();
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };

  // ---- 뼈대: 헤더(닫기·진행) + 본문 + 푸터 (시험 화면 문법 재사용) ----
  const xbtn = el("button", { class: "xbtn", attrs: { "aria-label": "닫기" }, html: icon("x", 20, { sw: 2.4 }) });
  const pbar = el("div", { class: "pbar" });
  const pwrap = el("div", { class: "pwrap" }, pbar);
  const counter = el("div", { class: "ex-counter" });
  const header = el("div", { class: "lheader" }, xbtn, pwrap, counter);
  const body = el("div", { class: "scroll" });
  const footer = el("div", { class: "footer ex-footer" });
  const section = el("section", { class: "screen exam-screen wd-screen" }, header, body, footer);

  // 문제 도중 이탈 확인 — 확인한 오답은 이미 오답노트에 남아 있음을 알린다
  const quitDim = el("div", { class: "scrim" });
  const quitCard = el(
    "div",
    { class: "ex-quit-card" },
    el("div", { class: "ex-quit-t", text: "그만 풀까요?" }),
    el("div", { class: "ex-quit-s", text: "지금까지 확인한 오답은 오답노트에 남아 있어요. 언제든 다시 뽑을 수 있어요." }),
  );
  const quitStay = el("button", { class: "btn", text: "계속 풀기" });
  const quitLeave = el("button", { class: "ex-quit-leave", text: "그만두기" });
  quitCard.append(quitStay, quitLeave);
  const quitWrap = el("div", { class: "ex-quit" }, quitCard);
  section.append(quitDim, quitWrap);
  function showQuit(show: boolean): void {
    quitDim.classList.toggle("open", show);
    quitWrap.classList.toggle("open", show);
  }
  quitStay.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    showQuit(false);
  });
  quitLeave.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    opts.onExit();
  });
  quitDim.addEventListener("click", () => showQuit(false));

  let phase: "pick" | "drill" | "result" = "pick";
  xbtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    if (phase === "drill") showQuit(true);
    else opts.onExit();
  });

  // 스낵(자동 담기 안내 등)
  let snackTimer = 0;
  const snackEl = el("div", { class: "snack" });
  section.appendChild(snackEl);
  function snack(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2200);
  }

  // ---- CTA ----
  const cta = el("button", { class: "btn cta", attrs: { disabled: "true" }, text: "다음" });
  let ctaFn: (() => void) | null = null;
  cta.addEventListener("click", () => {
    if (cta.disabled) return;
    haptic(HAPTIC.tap);
    ctaFn?.();
  });
  function setCTA(label: string, enabled: boolean, fn: (() => void) | null, pop = false): void {
    cta.textContent = label;
    cta.disabled = !enabled;
    ctaFn = fn;
    if (pop && enabled) {
      cta.classList.add("pop");
      later(() => cta.classList.remove("pop"), 450);
    }
  }

  // ---- 소단원 고르기 ────────────────────────────────────────
  const sel = new Set<string>(); // 담은 소단원(lessonId) — 과목·단원을 넘나들며 담을 수 있다(필터는 보기만 바꾼다)
  const openUnits = new Set<string>(); // 아코디언 펼침 상태(재렌더에도 유지)
  let count = 10; // 뽑을 문제 수(5·10·15)
  // 과목·학년 필터(2026-07-20 사용자 피드백) — 기본은 지금 학습 중인 과목·학년
  let subj: SubjectId = getViewSubject();
  let pickGrade: GradeId = getViewGrade();

  function poolCountOfSel(): number {
    let n = 0;
    for (const du of UNITS) for (const it of du.def.pool) if (sel.has(it.lessonId)) n += 1;
    return n;
  }

  function renderPick(): void {
    phase = "pick";
    pwrap.style.visibility = "hidden";
    counter.textContent = "";
    clear(body);
    clear(footer);

    const wrong = openWrongByLesson();
    const wrap = el("div", { class: "pad wd-pick" });
    body.appendChild(wrap);
    body.scrollTop = 0;

    wrap.appendChild(el("div", { class: "h1 sm", text: "취약 단원 문제 뽑기" }));
    wrap.appendChild(
      el("div", { class: "sub", text: "복습하고 싶은 소단원을 직접 골라 보세요. 고른 곳에서만 문제를 뽑아 나만의 문제지를 만들어요." }),
    );

    // 과목·학년 세그(2026-07-20) — 문제 은행이 있는 과목·학년만 뜬다(사회·역사는 풀 등록 시 자동).
    // 필터는 보기만 바꾼다 — 담아 둔 소단원(sel)은 과목을 오가도 유지되고 전부 함께 뽑힌다
    // (과학+수학 혼합 문제지가 이 설계의 의도). 아래 요약 필이 "과목 경계를 넘어 담는 중"을
    // 실시간으로 보여 준다 — 세그 라벨 숫자 배지는 요약 필과 중복이라 뺐다(사용자 확정 2026-07-20).
    const subjectsAvail = [...new Set(UNITS.map((d) => d.subject))];
    if (subjectsAvail.length && !subjectsAvail.includes(subj)) subj = subjectsAvail[0];
    const gradesAvail = [...new Set(UNITS.filter((d) => d.subject === subj).map((d) => d.grade))];
    if (gradesAvail.length && !gradesAvail.includes(pickGrade)) pickGrade = gradesAvail[0];
    const selCountOfSubj = (s: SubjectId): number =>
      UNITS.filter((d) => d.subject === s).reduce((a, du) => a + du.lessons.filter((l) => sel.has(l.id)).length, 0);
    const filters = el("div", { class: "wd-filters" });
    if (subjectsAvail.length > 1) {
      const seg = el("div", { class: "grade-seg" });
      for (const s of subjectsAvail) {
        const b = el("button", { class: `gseg ${s === subj ? "on" : ""}`, text: SUBJECT_LABEL[s] });
        b.addEventListener("click", () => {
          if (s === subj) return;
          haptic(HAPTIC.tap);
          subj = s;
          renderPick();
        });
        seg.appendChild(b);
      }
      filters.appendChild(seg);
    }
    if (gradesAvail.length > 1) {
      const seg = el("div", { class: "grade-seg" });
      for (const g of gradesAvail) {
        const b = el("button", { class: `gseg ${g === pickGrade ? "on" : ""}`, text: GRADE_LABEL[g] });
        b.addEventListener("click", () => {
          if (g === pickGrade) return;
          haptic(HAPTIC.tap);
          pickGrade = g;
          renderPick();
        });
        seg.appendChild(b);
      }
      filters.appendChild(seg);
    }
    if (filters.childElementCount) wrap.appendChild(filters);
    // 담기 요약 필 — 무엇을 몇 개 담았는지(과목별 내역 포함). 담기 전에는 숨김.
    const selSummary = el("div", { class: "wd-selsum" });
    wrap.appendChild(selSummary);
    const paintPicked = (): void => {
      if (!sel.size) {
        selSummary.style.display = "none";
        return;
      }
      const parts: string[] = [];
      for (const s of subjectsAvail) {
        const n = selCountOfSubj(s);
        if (n) parts.push(`${SUBJECT_LABEL[s]} ${n}`);
      }
      selSummary.style.display = "";
      // em대시 금지(수학 단원 곁 텍스트 — 수학 트랙 규칙의 결): 내역은 괄호로 묶는다
      selSummary.textContent = `담은 소단원 ${sel.size}곳(${parts.join(" · ")}) 전부 한 문제지로 뽑아요`;
    };

    // 오답 있는 소단원 자동 담기 — 취약한 곳을 한 번에
    const weakIds: string[] = [];
    for (const du of UNITS) for (const l of du.lessons) if ((wrong.get(l.id) ?? 0) > 0) weakIds.push(l.id);
    const auto = el(
      "button",
      { class: "wd-auto" },
      el("span", { class: "wd-auto-ic", html: icon("bolt", 16) }),
      el("span", { text: weakIds.length > 0 ? `오답 있는 소단원 ${weakIds.length}곳 자동 담기` : "오답 있는 소단원 자동 담기" }),
    );
    auto.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      if (!weakIds.length) {
        snack("아직 오답 기록이 없어요 — 소단원을 직접 골라 보세요");
        return;
      }
      for (const du of UNITS) {
        if (du.lessons.some((l) => (wrong.get(l.id) ?? 0) > 0)) openUnits.add(du.unit.id);
      }
      weakIds.forEach((id) => sel.add(id));
      renderPick();
      snack(`오답 있는 소단원 ${weakIds.length}곳을 담았어요`);
    });
    wrap.appendChild(auto);

    const paintCta = (): void => {
      paintPicked(); // 세그 담은 수 배지·요약 필도 체크 토글마다 함께 갱신
      if (!sel.size) {
        setCTA("소단원을 골라 주세요", false, null);
        return;
      }
      const n = Math.min(count, poolCountOfSel());
      setCTA(`문제 ${n}개 뽑기`, n > 0, () => startDrill(n));
    };

    const shown = UNITS.filter((du) => du.subject === subj && du.grade === pickGrade);
    wrap.appendChild(el("div", { class: "sec-head wd-sec", text: `${GRADE_LABEL[pickGrade]} ${SUBJECT_LABEL[subj]}` }));
    for (const du of shown) wrap.appendChild(unitCard(du, wrong, paintCta));
    if (!shown.length) wrap.appendChild(el("div", { class: "tab-footnote", text: "이 과목·학년은 문제 은행이 준비되는 대로 열려요." }));
    wrap.appendChild(el("div", { class: "tab-footnote", text: "여기 없는 단원은 문제 은행이 준비되는 대로 추가돼요. 담아 둔 소단원은 과목을 오가도 유지돼요." }));

    // 푸터 — 문제 수 선택 + 뽑기
    const segRow = el("div", { class: "wd-count" }, el("span", { class: "wd-count-k", text: "문제 수" }));
    const segBtns: HTMLButtonElement[] = [];
    for (const n of [5, 10, 15]) {
      const b = el("button", { class: `wd-seg ${count === n ? "on" : ""}`, text: `${n}개` });
      b.addEventListener("click", () => {
        haptic(HAPTIC.select);
        count = n;
        segBtns.forEach((s) => s.classList.toggle("on", s === b));
        paintCta();
      });
      segBtns.push(b);
      segRow.appendChild(b);
    }
    footer.append(segRow, cta);
    paintCta();
  }

  function unitCard(du: DrillUnit, wrong: Map<string, number>, paintCta: () => void): HTMLElement {
    const uWrong = du.lessons.reduce((a, l) => a + (wrong.get(l.id) ?? 0), 0);
    const selChip = el("span", { class: "wd-chip pick" });
    const head = el(
      "button",
      { class: "wd-uhead", attrs: { "aria-expanded": String(openUnits.has(du.unit.id)) } },
      el("span", { class: "wd-uname", text: `${du.unit.roman}. ${du.unit.title}` }),
      uWrong > 0 ? el("span", { class: "wd-chip warn", text: `오답 ${uWrong}` }) : null,
      selChip,
      el("span", { class: "wd-chev", html: icon("chevronDown", 16) }),
    );
    const list = el("div", { class: "wd-lessons" });
    const card = el("div", { class: `wd-unit ${openUnits.has(du.unit.id) ? "open" : ""}` }, head, list);
    if (import.meta.env.DEV) card.dataset.uid = du.unit.id;
    head.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      const open = card.classList.toggle("open");
      head.setAttribute("aria-expanded", String(open));
      if (open) openUnits.add(du.unit.id);
      else openUnits.delete(du.unit.id);
    });

    const paintChip = (): void => {
      const n = du.lessons.filter((l) => sel.has(l.id)).length;
      selChip.textContent = `${n}개 담음`;
      selChip.style.display = n > 0 ? "" : "none";
    };

    for (const l of du.lessons) {
      const w = wrong.get(l.id) ?? 0;
      const row = el(
        "button",
        { class: `wd-lrow ${sel.has(l.id) ? "sel" : ""}`, attrs: { "aria-pressed": String(sel.has(l.id)) } },
        el("span", { class: "wd-box", html: CHECK }),
        el("span", { class: "wd-lname", text: l.label ?? l.title }),
        w > 0 ? el("span", { class: "wd-chip warn", text: `오답 ${w}` }) : null,
      );
      if (import.meta.env.DEV) row.dataset.lid = l.id;
      row.addEventListener("click", () => {
        haptic(HAPTIC.select);
        if (sel.has(l.id)) sel.delete(l.id);
        else sel.add(l.id);
        row.classList.toggle("sel", sel.has(l.id));
        row.setAttribute("aria-pressed", String(sel.has(l.id)));
        paintChip();
        paintCta();
      });
      list.appendChild(row);
    }
    paintChip();
    return card;
  }

  // ---- 문제 뽑기 · 풀이(즉시 채점) ─────────────────────────
  let session: DrillQ[] = [];
  let qi = 0;

  function displayOrder(it: ExamItem): number[] {
    const n = it.options?.length ?? 0;
    const order = Array.from({ length: n }, (_, i) => i);
    if (it.shuffle !== false) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    return order;
  }

  function startDrill(n: number): void {
    const pool: ExamItem[] = [];
    const srcOf = new Map<string, string>();
    for (const du of UNITS) {
      for (const it of du.def.pool) {
        if (!sel.has(it.lessonId)) continue;
        pool.push(it);
        srcOf.set(it.id, du.def.id);
      }
    }
    const pick = Math.min(n, pool.length);
    if (!pick) return;
    // drawExamItems가 고른 소단원끼리 균형 추출 + 진도 순 정렬까지 처리한다(시험과 같은 규칙)
    session = drawExamItems({ id: "drill", unitId: "drill", title: "취약 단원 문제 뽑기", pick, pool }).map((item) => ({
      item,
      srcExamId: srcOf.get(item.id)!,
      order: displayOrder(item),
      resp: null,
      good: false,
    }));
    qi = 0;
    renderQuestion();
  }

  /** 문항 본문(질문·보기 상자·그림) — 시험 화면과 같은 구성. */
  function questionBody(it: ExamItem): HTMLElement {
    const box = el("div", {});
    box.appendChild(el("div", { class: "h1 sm", html: it.prompt }));
    if (it.bogi?.length) {
      const rows = it.bogi.map((b, i) =>
        el("div", { class: "ex-bogi-row" }, el("span", { class: "ex-bogi-label", text: `${GANADA[i]}.` }), el("span", { html: b })),
      );
      box.appendChild(el("div", { class: "ex-bogi" }, el("div", { class: "ex-bogi-head", text: "보기" }), ...rows));
    }
    if (it.figure) {
      box.appendChild(
        el("div", { class: `q-figure ${it.figureDark ? "dark" : ""}` }, el("div", { class: "q-figure-art", html: it.figure })),
      );
    }
    return box;
  }

  function isCorrect(q: DrillQ): boolean {
    const it = q.item;
    if (q.resp == null) return false;
    if (it.type === "mcq") return q.resp === it.answer;
    if (it.type === "multi") {
      const a = new Set(it.answer as number[]);
      const r = q.resp as number[];
      return r.length === a.size && r.every((x) => a.has(x));
    }
    if (it.type === "num") return checkAnswer(String(q.resp), String(it.answer)).good;
    return q.resp === it.answer;
  }

  function renderQuestion(): void {
    phase = "drill";
    const q = session[qi];
    const it = q.item;
    pwrap.style.visibility = "visible";
    pbar.style.width = `${(qi / session.length) * 100}%`;
    counter.textContent = `${qi + 1} / ${session.length}`;
    clear(body);
    clear(footer);
    footer.appendChild(cta);

    const step = el("div", { class: "pad ex-q wd-q" });
    if (import.meta.env.DEV) {
      step.dataset.qid = it.id;
      step.dataset.type = it.type;
      step.dataset.ans = JSON.stringify(it.answer);
    }
    body.appendChild(step);
    body.scrollTop = 0;

    step.appendChild(el("div", { class: "qnum", text: `문제 ${qi + 1} / ${session.length}` }));
    const li = findLesson(it.lessonId);
    if (li) step.appendChild(el("div", { class: "xr-lesson-chip", text: `${li.unit.roman}. ${li.lesson.label ?? li.lesson.title}` }));
    step.appendChild(questionBody(it));

    let locked = false;

    if (it.type === "mcq" || it.type === "multi") {
      const opts_ = it.options ?? [];
      const boxEl = el("div", { class: "opts ex-opts" });
      step.appendChild(boxEl);
      const selected = new Set<number>();
      const cards: HTMLButtonElement[] = [];
      const confirm = (): void => {
        locked = true;
        q.resp = it.type === "multi" ? [...selected].sort((a, b) => a - b) : [...selected][0];
        q.good = isCorrect(q);
        // 카드 채점(ok/no/dim) — 레슨 퀴즈와 같은 언어. 정답은 초록, 내가 고른 오답은 빨강.
        const answers = new Set<number>(Array.isArray(it.answer) ? (it.answer as number[]) : [it.answer as number]);
        for (const oi of q.order) {
          const card = cards[oi];
          const isAns = answers.has(oi);
          const isMine = selected.has(oi);
          card.classList.remove("sel");
          card.classList.add(isAns ? "ok" : isMine ? "no" : "dim");
        }
        afterGrade(step, q);
      };
      for (const oi of q.order) {
        const card = el("button", { class: "opt", html: `${opts_[oi]}<span class="radio">${CHECK}</span>` });
        if (import.meta.env.DEV) card.dataset.oi = String(oi);
        card.addEventListener("click", () => {
          if (locked) return;
          haptic(HAPTIC.select);
          if (it.type === "multi") {
            if (selected.has(oi)) {
              selected.delete(oi);
              card.classList.remove("sel");
            } else {
              selected.add(oi);
              card.classList.add("sel");
            }
          } else {
            selected.clear();
            selected.add(oi);
            cards.forEach((c) => c.classList.remove("sel"));
            card.classList.add("sel");
          }
          setCTA("확인하기", selected.size > 0, confirm);
        });
        boxEl.appendChild(card);
        cards[oi] = card;
      }
      if (it.type === "multi") step.appendChild(el("div", { class: "ex-multi-hint", text: "정답을 모두 고른 뒤 확인해요" }));
      setCTA("확인하기", false, null);
    } else if (it.type === "num") {
      const row = el("div", { class: "ex-num-row" });
      // onReady는 makeAnswerPad가 생성 직후 동기 호출한다 — 아래 confirm(const)을 직접 넘기면
      // 선언 전 접근(TDZ)이라 화살표로 감싸 지연 참조한다(넘패드가 통째로 안 뜨던 실버그).
      const pad = makeAnswerPad(it.numKind ?? "int", (ready) => {
        if (!locked) setCTA("확인하기", ready, () => confirm());
      });
      row.appendChild(pad.ansEl);
      if (it.unitLabel) row.appendChild(el("span", { class: "ex-unit", text: it.unitLabel }));
      step.appendChild(row);
      step.appendChild(pad.padEl);
      const confirm = (): void => {
        locked = true;
        q.resp = pad.value();
        q.good = isCorrect(q);
        pad.padEl.remove();
        row.remove();
        const u = it.unitLabel ? ` ${it.unitLabel}` : "";
        step.appendChild(answerPair(`${q.resp}${u}`, `${it.answer}${u}`, q.good));
        afterGrade(step, q);
      };
      setCTA("확인하기", false, null);
    } else {
      // word — 워드뱅크 칩(표시 순서 셔플, 시험과 동일)
      const bank = [...(it.bank ?? [])];
      for (let i = bank.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bank[i], bank[j]] = [bank[j], bank[i]];
      }
      const grid = el("div", { class: "ex-bank" });
      step.appendChild(grid);
      let picked: string | null = null;
      const chips = new Map<string, HTMLButtonElement>();
      const confirm = (): void => {
        locked = true;
        q.resp = picked;
        q.good = isCorrect(q);
        for (const [w, chip] of chips) {
          chip.classList.remove("sel");
          if (w === it.answer) chip.classList.add("ok");
          else if (w === picked) chip.classList.add("no");
          else chip.classList.add("dim");
        }
        afterGrade(step, q);
      };
      for (const w of bank) {
        const chip = el("button", { class: "ex-chip", text: w });
        if (import.meta.env.DEV) chip.dataset.w = w;
        chip.addEventListener("click", () => {
          if (locked) return;
          haptic(HAPTIC.select);
          picked = w;
          chips.forEach((c) => c.classList.remove("sel"));
          chip.classList.add("sel");
          setCTA("확인하기", true, confirm);
        });
        chips.set(w, chip);
        grid.appendChild(chip);
      }
      step.appendChild(el("div", { class: "ex-multi-hint", text: "알맞은 용어 칩을 하나 골라요" }));
      setCTA("확인하기", false, null);
    }
  }

  /** 채점 직후 — 오답노트 수집·극복 + 해설 카드 + 다음 이동. */
  function afterGrade(step: HTMLElement, q: DrillQ): void {
    const it = q.item;
    haptic(q.good ? HAPTIC.correct : HAPTIC.wrong);
    if (import.meta.env.DEV) step.dataset.good = q.good ? "1" : "0";

    // 오답노트 — 시험 문항과 같은 키: 여기서 맞히면 시험에서 틀린 같은 문항도 극복된다
    const key = `e:${q.srcExamId}:${it.id}`;
    if (q.good) resolveWrongNote(key);
    else {
      recordWrongNote({
        key,
        kind: "exam",
        srcId: q.srcExamId,
        lessonId: it.lessonId,
        type: it.type,
        q: it.prompt,
        bogi: it.bogi,
        opts: it.options,
        answer: Array.isArray(it.answer) ? it.answer : typeof it.answer === "number" ? [it.answer] : String(it.answer),
        explain: it.explain,
        core: it.core,
        hasFigure: !!it.figure,
      });
    }

    const fb = el("div", { class: `wd-fb ${q.good ? "good" : "bad"}` });
    fb.appendChild(
      el(
        "div",
        { class: "wd-fb-head" },
        el("span", { class: "wd-fb-ic", html: q.good ? icon("check", 13) : icon("xThick", 13) }),
        el("span", { text: q.good ? "정답이에요!" : "아쉬워요 — 왜 그런지 뜯어봐요" }),
      ),
    );
    fb.appendChild(el("div", { class: "xr-expl-body", html: it.explain }));
    fb.appendChild(el("div", { class: "xr-core" }, el("span", { html: icon("bulb", 14) }), el("span", { html: it.core })));
    step.appendChild(fb);
    later(() => fb.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);

    const isLast = qi === session.length - 1;
    setCTA(isLast ? "결과 보기" : "다음 문제", true, () => {
      if (isLast) {
        touchStudyActivity(); // 학습일(스트릭)만 집계 — XP는 없다
        renderResult();
      } else {
        qi += 1;
        renderQuestion();
      }
    }, true);
  }

  /** 내 답 vs 정답 카드(num 공용). */
  function answerPair(mine: string, ans: string, good: boolean): HTMLElement {
    const box = el("div", { class: "xr-pair" });
    box.appendChild(
      el("div", { class: `xr-pair-cell ${good ? "ok" : "no"}` }, el("div", { class: "xr-pair-k", text: "내 답" }), el("div", { class: "xr-pair-v", text: mine })),
    );
    if (!good) {
      box.appendChild(
        el("div", { class: "xr-pair-cell ok" }, el("div", { class: "xr-pair-k", text: "정답" }), el("div", { class: "xr-pair-v", text: ans })),
      );
    }
    return box;
  }

  // ---- 결과: 정답 수 + 소단원별 진단 ────────────────────────
  function renderResult(): void {
    phase = "result";
    pwrap.style.visibility = "hidden";
    counter.textContent = "";
    clear(body);
    clear(footer);

    const correct = session.filter((q) => q.good).length;
    const total = session.length;
    const ratio = correct / total;
    const wrap = el("div", { class: "pad ex-result" });
    body.appendChild(wrap);
    body.scrollTop = 0;

    const band =
      ratio === 1
        ? "완벽해요! 고른 소단원을 완전히 잡았어요"
        : ratio >= 0.8
          ? "훌륭해요! 몇 문제만 다시 잡으면 돼요"
          : ratio >= 0.5
            ? "좋아요! 틀린 문제는 오답노트에 담아 뒀어요"
            : "괜찮아요 — 약한 곳을 찾은 게 진짜 수확이에요";
    const scoreNum = el("span", { class: "ex-score-num", text: "0" });
    wrap.appendChild(
      el(
        "div",
        { class: "ex-score-hero", dataset: import.meta.env.DEV ? { correct: String(correct), total: String(total) } : undefined },
        el("div", { class: "ex-score-line" }, scoreNum, el("span", { class: "ex-score-max", text: `/ ${total} 정답` })),
        el("div", { class: "ex-score-band", text: band }),
      ),
    );
    countUp(scoreNum, correct, 700);

    const wrongCount = total - correct;
    if (wrongCount > 0) {
      wrap.appendChild(
        el(
          "div",
          { class: "ex-xp quiet" },
          el("span", { html: icon("book", 15) }),
          el("span", { html: `틀린 <b>${wrongCount}문제</b>는 오답노트에 담아 뒀어요` }),
        ),
      );
    } else {
      wrap.appendChild(
        el("div", { class: "ex-xp" }, el("span", { html: icon("check", 15) }), el("span", { html: "<b>전부 정답!</b> 다시 맞힌 문제는 오답노트에서 해결 처리됐어요" })),
      );
    }

    // 소단원별 진단(시험 결과 문법 재사용) — 문제지에 등장한 소단원만
    wrap.appendChild(el("div", { class: "sec-head", text: "소단원별 진단" }));
    const byLesson = new Map<string, { c: number; t: number }>();
    for (const q of session) {
      const s = byLesson.get(q.item.lessonId) ?? { c: 0, t: 0 };
      s.t += 1;
      if (q.good) s.c += 1;
      byLesson.set(q.item.lessonId, s);
    }
    let worst = 1;
    for (const s of byLesson.values()) worst = Math.min(worst, s.c / s.t);
    const diag = el("div", { class: "ex-diag" });
    for (const [lessonId, s] of byLesson) {
      const li = findLesson(lessonId);
      const name = li
        ? `${GRADE_LABEL[gradeOfUnit(li.unit.id)]} ${li.unit.roman} · ${li.lesson.label ?? li.lesson.title}`
        : lessonId;
      const r = s.c / s.t;
      const weak = r === worst && r < 1;
      const row = el("div", { class: `ex-diag-row ${weak ? "weak" : ""}` });
      if (import.meta.env.DEV) {
        row.dataset.lesson = lessonId;
        row.dataset.c = String(s.c);
        row.dataset.t = String(s.t);
      }
      row.appendChild(
        el(
          "div",
          { class: "ex-diag-main" },
          el(
            "div",
            { class: "ex-diag-top" },
            el("span", { class: "ex-diag-name", text: name }),
            weak ? el("span", { class: "ex-diag-tag", text: "여기가 약해요" }) : null,
            el("span", { class: "ex-diag-score", text: `${s.c}/${s.t}` }),
          ),
          el("div", { class: "ex-diag-bar" }, el("i", { style: `width:${(r * 100).toFixed(0)}%` })),
        ),
      );
      if (r < 1 && li) {
        const go = el(
          "button",
          { class: "ex-diag-btn", attrs: { "aria-label": `${li.lesson.title} 복습하기` } },
          el("span", { text: "복습" }),
          el("span", { html: icon("chevron", 14) }),
        );
        go.addEventListener("click", () => {
          haptic(HAPTIC.tap);
          opts.onOpenLesson(lessonId);
        });
        row.appendChild(go);
      }
      diag.appendChild(row);
    }
    if (worst === 1) diag.appendChild(el("div", { class: "ex-diag-perfect", text: "고른 소단원을 전부 완벽하게 해냈어요!" }));
    wrap.appendChild(diag);
    wrap.appendChild(el("div", { class: "tab-footnote", text: "복습으로 다시 맞힌 문제는 오답노트에서 자동으로 해결 처리돼요." }));

    // 푸터: 더 뽑기(주) + 복습 탭으로(부)
    const back = el("button", { class: "ex-retake" }, el("span", { text: "복습 탭으로 돌아가기" }));
    back.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      opts.onExit();
    });
    footer.append(cta, back);
    setCTA("다른 문제 더 뽑기", true, renderPick, true);
  }

  renderPick();
  return {
    el: section,
    onExit: () => {
      for (const t of timers) window.clearTimeout(t);
      timers.clear();
    },
  };
}
