// 홈 — 단원을 게임 정복 지도(모험 트레일)로. 지형·발자국 트레일·밑창 스텝 노드·스틱맨 워커·카드 캐러셀.
// 리디자인(2026-07-14 확정): 스펙 정본 = design/README.md("확정된 방향"+탐색 1~7차).
// e2e 계약: .gm-node(.now/.done/.exam/.conq)·.gm-med·.gm-label·.gm-ribbon·.gm-exam-best·.unit-tab의
// 클래스·DOM 소속을 유지하고, 스킨 클래스(.bsn·.ucard)만 얹는다 — qa/ 15개+ 스크립트가 이 셀렉터를 쓴다.
import { el, clear, afterPaint } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { BRAND } from "../core/brand";
import { getState, currentStreak, isDone, getViewGrade, setViewGrade, getViewSubject, toggleReviewMode, isReviewMode, examRecordOf, wrongNoteCount, lastUnitOf } from "../core/store";
import { CURRICULA_OF, GRADE_LABEL, gradeOfUnit, subjectOfUnit, isUnlocked, isPremiumLocked, unitProgress, findLesson, findUnit, type Unit, type GradeId, type SubjectId } from "../content/curriculum";
import { bootLevel } from "../core/level";
import { bootArt } from "../ui/boots";
import { examForUnit } from "../content/exams";
import { serpentine, smoothPath } from "../ui/serpentine";
import { mapDecorArt } from "../ui/mapDecor";
import { soleDefs, soleSvg, stampTrail, stampOne, walkerSvg, themeInk, type SoleState } from "../ui/soleMap";
import type { Screen } from "../core/router";
import { gnav, type GnavKey } from "../ui/gnav";

// 단원별 지도/배너 테마 클래스 — 새 단원을 추가하면 여기와 ui.css에 테마를 등록한다.
const UNIT_THEME: Record<string, string> = { u2: "bio", u3: "heat", u4: "matter", u5: "force", u6: "gas", u7: "space", g2u1: "chem", g2u2: "geo", g2u3: "light", g2u4: "atom", g2u5: "plant", g2u6: "body", g2u7: "elec", g2u8: "star", m1u1: "num", m1u2: "alge", m1u3: "grph", m1u4: "geom", m1u5: "solid", m1u6: "data", m2u1: "calc", m2u2: "ineq", m2u3: "func", m2u4: "prove", m2u5: "sim", m2u6: "dice", s1u1: "world", s1u2: "world", s1u3: "world", s1u4: "world", s1u5: "world", s1u6: "world", s1u7: "world", h1u1: "his", h1u2: "his", h1u3: "his", h1u4: "his" };
// 보너스 미니게임은 도전 탭으로 이사(2026-07-12 IA 개편) — 지도는 학습 서사만 남긴다.

// 노드 배치 = 완만한 곡선 중심선 + 발걸음 지그재그(2026-07-14 사용자 지시, 발자국 사진 레퍼런스).
// sin 파도+교대 합성은 파도 상승 구간에서 가로 이동이 24px까지 상쇄돼 노드가 세로로 늘어서 보였다
// (사용자 적발) → 손튜닝 패턴으로 교체: S 중심선(우 볼록 → 좌 볼록)을 유지하되 이웃 노드의 가로
// 간격을 항상 |Δ| ≥ 0.36(≈33px, 밑창 폭 48px 대비 뚜렷한 어긋남)으로 보장. 부호는 매 걸음 교대.
// serpentine pattern 옵션 주입 — 경로 수학(serpentine.ts)은 불변.
const STEP_PATTERN = [0.24, -0.12, 0.66, 0.1, 0.46, -0.36, 0, -0.62];
// 발끝 벌림(스플레이) — 목업 확정 시퀀스 +6/−8/+8/−6 계승(오른발 시계+, 왼발 반시계−).
const SPLAY_SEQ = [6, -8, 8, -6];
function splayOf(i: number): number {
  return SPLAY_SEQ[i % SPLAY_SEQ.length];
}

export function homeScreen(
  onOpenLesson: (id: string) => void,
  focusUnitId?: string,
  nav2?: { onOpenExam?: (unitId: string) => void; onTab?: (k: GnavKey) => void; onOpenNotebook?: () => void },
  opts?: { walkFrom?: string },
): Screen {
  const st = getState();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 걷기 연출(새 레슨 첫 완료 귀환) — 첫 지도 렌더가 한 번만 소비. reduced-motion은 도장만 즉시(연출 생략).
  let pendingWalkFrom = reduceMotion ? undefined : opts?.walkFrom;
  let cancelWalk: (() => void) | null = null; // 지도 재렌더·화면 이탈 시 타이머/rAF 정리
  let finishWalk: (() => void) | null = null; // 걷는 중 노드 탭 = 즉시 완주 처리(인터랙션 차단 금지)
  // 과목·학년 트랙 — 방금 학습한 단원이 있으면 그 단원의 과목·학년으로 따라간다.
  const subject: SubjectId = focusUnitId ? subjectOfUnit(focusUnitId) : getViewSubject();
  const CURRICULA = CURRICULA_OF[subject];
  let grade: GradeId = focusUnitId ? gradeOfUnit(focusUnitId) : getViewGrade();
  let cur = CURRICULA[grade];
  // 우선순위: 방금 학습한 단원 → 최근에 연 단원(기기 기억, 2026-07-21) → 첫 미완료 단원 → 첫 단원.
  // 기기 기억이 없던 구버전 저장분·새 유저는 "첫 미완료"가 자연스러운 시작점을 대신한다.
  let sel = focusUnitId ? cur.findIndex((u) => u.id === focusUnitId) : -1;
  if (sel < 0) {
    const remembered = lastUnitOf(`${subject}:${grade}`);
    if (remembered) sel = cur.findIndex((u) => u.id === remembered);
  }
  if (sel < 0) sel = cur.findIndex((u) => !u.comingSoon && unitProgress(u) < 100);
  if (sel < 0) sel = 0;

  const chips = el(
    "div",
    { class: "chips" },
    el("div", { class: "chip streak" }, el("span", { html: icon("flame", 15) }), el("span", { text: `${currentStreak()}일` })),
    el("div", { class: "chip gem" }, el("span", { html: icon("footstep", 15) }), el("span", { text: `${st.totalXp} 스텝` })),
  );
  // 과목 상자(subj-box)는 폐기(2026-07-20 사용자 확정) — 과목 허브 진입은 하단 과목 탭이 담당.
  // 우상단 프로필 버튼은 제거(2026-07-16, 프로필 진입 단일화) — 같은 목적지(마이 탭)의 진입이
  // 둘일 이유가 없다. 로그인 상태 표시·아바타 노출은 탭바 마이 아이콘(ui/gnav.ts)이 흡수했고,
  // 로그인 화면 진입은 마이 > "계정 관리 · 로그인"이 유일 경로다.
  const brandEl = el("div", { class: `brand ${isReviewMode() ? "review" : ""}`, text: BRAND.name });
  // 검토 모드 — 브랜드 7연타 토글(콘텐츠 검수용: 순차·프리미엄 잠금 전부 해제)
  let brandTaps = 0;
  let brandTapTimer = 0;
  brandEl.addEventListener("click", () => {
    brandTaps += 1;
    window.clearTimeout(brandTapTimer);
    brandTapTimer = window.setTimeout(() => {
      brandTaps = 0;
    }, 1600);
    if (brandTaps >= 7) {
      brandTaps = 0;
      const on = toggleReviewMode();
      haptic(HAPTIC.done);
      brandEl.classList.toggle("review", on);
      snack(on ? "검토 모드 ON — 모든 레슨이 열렸어요" : "검토 모드 OFF — 잠금이 되돌아왔어요");
      rebuild();
    }
  });
  const appbar = el(
    "div",
    { class: "appbar" },
    el("div", { class: "ab-side" }, brandEl),
    el("div", { class: "ab-side" }, chips),
  );

  const tabs = el("div", { class: "unit-tabs" });
  // 마우스로도 탭을 잡아 끌어 넘길 수 있게(터치는 네이티브 스크롤이 담당)
  // 주의: pointerdown에서 바로 setPointerCapture를 걸면 이후 click이 컨테이너로
  // 재타기팅되어 탭 버튼 클릭이 죽는다 — 진짜 드래그로 판명된 순간에만 캡처한다.
  let tabDrag: { x: number; scroll: number } | null = null;
  let tabMoved = false;
  tabs.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    tabDrag = { x: e.clientX, scroll: tabs.scrollLeft };
    tabMoved = false;
  });
  tabs.addEventListener("pointermove", (e) => {
    if (!tabDrag) return;
    const dx = e.clientX - tabDrag.x;
    if (!tabMoved && Math.abs(dx) > 5) {
      tabMoved = true;
      tabs.setPointerCapture(e.pointerId);
    }
    if (tabMoved) tabs.scrollLeft = tabDrag.scroll - dx;
  });
  const endTabDrag = (): void => {
    tabDrag = null;
  };
  tabs.addEventListener("pointerup", endTabDrag);
  tabs.addEventListener("pointercancel", endTabDrag);
  // 드래그로 끌었을 땐 탭 클릭으로 취급하지 않는다
  tabs.addEventListener(
    "click",
    (e) => {
      if (tabMoved) {
        e.stopPropagation();
        e.preventDefault();
        tabMoved = false;
      }
    },
    true,
  );
  // 학년 전환 — 중1 ⇄ 중2 세그먼트. 전환은 저장되어 다음 방문에도 유지된다.
  const gradeSeg = el("div", { class: "grade-seg", attrs: { role: "tablist", "aria-label": "학년 선택" } });
  (Object.keys(CURRICULA) as GradeId[]).forEach((g) => {
    const b = el("button", {
      class: `gseg ${g === grade ? "on" : ""}`,
      text: GRADE_LABEL[g],
      attrs: { role: "tab", "aria-selected": g === grade ? "true" : "false" },
    });
    b.addEventListener("click", () => {
      if (g === grade) return;
      haptic(HAPTIC.tap);
      grade = g;
      setViewGrade(g);
      cur = CURRICULA[g];
      // 학년 전환도 최근에 연 단원(기기 기억) 우선 — 없으면 첫 미완료 단원(부트와 같은 우선순위)
      const remembered = lastUnitOf(`${subject}:${g}`);
      sel = remembered ? cur.findIndex((u) => u.id === remembered) : -1;
      if (sel < 0) sel = cur.findIndex((u) => !u.comingSoon && unitProgress(u) < 100);
      if (sel < 0) sel = 0;
      gradeSeg.querySelectorAll(".gseg").forEach((x, i) => {
        const on = (Object.keys(CURRICULA) as GradeId[])[i] === g;
        x.classList.toggle("on", on);
        x.setAttribute("aria-selected", on ? "true" : "false");
      });
      rebuild();
    });
    gradeSeg.appendChild(b);
  });
  const gradeRow = el("div", { class: "grade-row" }, gradeSeg, el("div", { class: "grade-hint", text: "최신 개정 교육과정 반영" }));

  // 대단원 카드 캐러셀 — 카드가 실제로 늘어서고 이웃 카드가 양옆에서 살짝 보인다(피크).
  const strip = el("div", { class: "ustrip" });
  const carEl = el("div", { class: "ucar" }, strip);
  const dotsEl = el("div", { class: "udots", attrs: { "aria-hidden": "true" } });
  const carWrap = el("div", { class: "ucar-wrap" }, carEl, dotsEl);
  const mapHost = el("div", {});
  const scroll = el("div", { class: "scroll" }, gradeRow, tabs, carWrap, mapHost);
  const elm = el("section", { class: "screen", attrs: { id: "sc-home" } }, appbar, scroll, gnav("home", (k) => nav2?.onTab?.(k)));

  let snackTimer = 0;
  const snackEl = el("div", { class: "snack" });
  elm.appendChild(snackEl);
  function snack(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2000);
  }

  // ---- 우측 위젯 레일(데스크톱 셸 시안 B 완성 — 스트릭·스텝·오답·이어하기) ----
  // DOM 자체를 desktopMode(옵트인)일 때만 만든다 — 모바일·e2e(420px)는 DOM이 아예 없어 셀렉터 계약 안전.
  // 표시 게이트는 desktop.css(html.dt + min-width:1280px)가 소유 — 1024~1279px 애매 구간은 자동 숨김.
  let updateRailNext: ((u: Unit) => void) | null = null;
  if (getState().desktopMode) {
    const railDay = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayDiff = (a: string, b: string): number => Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000);
    // ① 연속 학습 — 최근 7일 도트(오른쪽 끝 = 오늘). 스트릭 정의(연속 학습일)를 그대로 역산:
    //    d가 학습일 ⇔ [lastStudyDay−(streak−1), lastStudyDay] 창 안 — 없는 기록을 지어내지 않는다.
    const stk = currentStreak();
    const dotsRow = el("div", { class: "hr-dots", attrs: { "aria-hidden": "true" } });
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const off = st.lastStudyDay ? dayDiff(railDay(d), st.lastStudyDay) : -1;
      dotsRow.appendChild(el("i", { class: stk > 0 && off >= 0 && off <= stk - 1 ? "on" : "" }));
    }
    const streakCard = el(
      "div",
      { class: "hr-card" },
      el("div", { class: "hr-k", text: "연속 학습" }),
      el("div", { class: "hr-v" }, el("span", { class: "hr-flame", html: icon("flame", 19) }), el("span", { text: `${stk}일째` })),
      dotsRow,
    );
    // ② 보유 스텝 · 장화 레벨
    const lvR = bootLevel(st.lifeXp);
    const stepCard = el(
      "div",
      { class: "hr-card" },
      el("div", { class: "hr-k", text: "보유 스텝" }),
      el("div", { class: "hr-v blue" }, el("span", { html: icon("footstep", 18) }), el("span", { text: `${st.totalXp.toLocaleString()} 스텝` })),
      el("div", { class: "hr-s" }, el("span", { html: bootArt(lvR.tier.id, 15) }), el("span", { text: `누적 ${st.lifeXp.toLocaleString()} · ${lvR.tier.name}` })),
    );
    // ③ 오답노트 대기 — 열람 게이트(프리미엄 페이월 포함)는 main.ts openNotebook이 소유
    const open = wrongNoteCount().open;
    const byUnit = new Map<string, number>();
    for (const w of Object.values(st.wrongNotes)) {
      if (w.overcome) continue;
      const f = findLesson(w.lessonId);
      if (f) byUnit.set(f.unit.id, (byUnit.get(f.unit.id) ?? 0) + 1);
    }
    const top = [...byUnit.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([uid, n]) => {
        const wu = findUnit(uid);
        return wu ? `${wu.roman}. ${wu.title} ${n}문항` : "";
      })
      .filter(Boolean);
    const nbCard = el(
      "div",
      { class: "hr-card" },
      el("div", { class: "hr-k", text: "오답노트" }),
      el("div", { class: "hr-v", text: open > 0 ? `${open}문항 대기` : "모두 해결!" }),
      el("div", { class: "hr-s", text: open > 0 ? top.join(" · ") + (byUnit.size > 2 ? " 외" : "") : "지금은 다시 풀 문제가 없어요" }),
    );
    if (nav2?.onOpenNotebook) {
      const nbBtn = el("button", { class: "hr-btn", text: open > 0 ? "다시 풀러 가기" : "오답노트 열기" });
      nbBtn.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        nav2.onOpenNotebook?.();
      });
      nbCard.appendChild(nbBtn);
    }
    // ④ 이어서 학습 — 지도 '현재 노드' 판정(unlocked·미완료) 재사용, renderMap이 단원 전환마다 갱신
    const nextBody = el("div", { class: "hr-next" });
    const nextCard = el("div", { class: "hr-card" }, el("div", { class: "hr-k", text: "이어서 학습" }), nextBody);
    updateRailNext = (u: Unit): void => {
      clear(nextBody);
      if (u.comingSoon) {
        nextBody.append(el("div", { class: "hr-v", text: "준비 중 단원" }), el("div", { class: "hr-s", text: `${u.title} 단원은 다음 업데이트에서 만나요` }));
        return;
      }
      const idx = u.lessons.findIndex((l, li) => isUnlocked(u, li) && !isDone(l.id));
      if (idx < 0) {
        nextBody.append(el("div", { class: "hr-v", text: "이 단원 완주!" }), el("div", { class: "hr-s", text: "다른 단원 지도도 걸어 보세요" }));
        return;
      }
      const lesson = u.lessons[idx];
      const prem = isPremiumLocked(lesson);
      nextBody.append(
        el("div", { class: "hr-v", text: lesson.label ?? lesson.title }),
        el("div", { class: "hr-s", text: `${u.roman}. ${u.title} · 레슨 ${idx + 1}${prem ? " · 프리미엄" : ""}` }),
      );
      const goBtn = el("button", { class: "hr-btn", text: prem ? "프리미엄으로 열기" : "이어서 하기" });
      goBtn.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        onOpenLesson(lesson.id); // 프리미엄 잠금은 main.ts openLesson 게이트가 페이월로 안내
      });
      nextBody.appendChild(goBtn);
    };
    elm.appendChild(el("aside", { class: "home-rail", attrs: { "aria-label": "학습 요약" } }, streakCard, stepCard, nbCard, nextCard));
  }

  function renderTabs(): void {
    clear(tabs);
    cur.forEach((u, i) => {
      const t = el("button", { class: `unit-tab ${i === sel ? "on" : ""} ${u.comingSoon ? "soon" : ""}`, text: `${u.roman}. ${u.title}` });
      t.addEventListener("click", () => {
        if (i === sel) return;
        haptic(HAPTIC.tap);
        go(i);
      });
      tabs.appendChild(t);
    });
  }

  // ---------- 카드 캐러셀 ----------
  const GAP = 10;
  let cards: HTMLElement[] = [];
  let dots: HTMLElement[] = [];
  let tx = 0; // 스트립 현재 translateX
  let dMoved = 0; // 마지막 드래그 이동량 — 드래그 직후 click 오발 방지

  function snapX(i: number): number {
    const item = cards[0]?.offsetWidth || 0;
    return (carEl.clientWidth - item) / 2 - i * (item + GAP);
  }
  function setStrip(x: number): void {
    tx = x;
    strip.style.transform = `translateX(${x}px)`;
  }
  function snapStrip(instant = false): void {
    if (instant) {
      strip.classList.add("drag");
      setStrip(snapX(sel));
      void strip.offsetWidth;
      strip.classList.remove("drag");
    } else {
      setStrip(snapX(sel));
    }
  }

  function buildCards(): void {
    clear(strip);
    clear(dotsEl);
    cards = cur.map((u, i) => {
      const theme = UNIT_THEME[u.id] ?? "";
      const pct = unitProgress(u);
      const card = el(
        "div",
        { class: `unit-band ucard ${theme} ${i === sel ? "on" : ""}` },
        el("div", { class: "ub-glow" }),
        el("div", { class: "ub-eyebrow", text: `대단원 ${u.roman}` }),
        el("div", { class: "ub-title", text: u.title }),
        el("div", { class: "ub-desc", text: u.subtitle }),
        // 모든 학년·단원 공통 표기: "단원 정복률 N%" (교육과정·쪽수 문구는 밴드에 쓰지 않는다)
        u.comingSoon
          ? el("div", { class: "ub-meta" }, el("span", { html: icon("clock", 13) }), el("span", { text: "다음 업데이트에서 열려요" }))
          : el("div", { class: "ub-meta" }, el("span", { html: icon("check", 13) }), el("span", { text: `단원 정복률 ${pct}%` })),
        el("div", { class: "ub-prog" }, el("i", { style: `width:${pct}%` })),
      );
      // 살짝 보이는 옆 카드를 탭하면 그 단원으로 점프
      card.addEventListener("click", () => {
        if (Math.abs(dMoved) > 8 || i === sel) return;
        haptic(HAPTIC.tap);
        go(i);
      });
      strip.appendChild(card);
      return card;
    });
    dots = cur.map((_, i) => {
      const d = el("i", { class: i === sel ? "on" : "" });
      dotsEl.appendChild(d);
      return d;
    });
    // 긴 단원명(역사 Ⅲ "세계 종교의 확산과 지역 문화의 발전" 등)이 마지막 글자만 줄갈이되는 것 방지 —
    // 제목은 한 줄 고정(nowrap, ui.css)이고 넘치면 22→14px 범위에서 자동 강등(mathDrill 장문 강등의
    // 카드판, 사용자 피드백 2026-07-20). rAF 프리즈 환경(사고 17)에서도 돌도록 setTimeout(0) 사용 —
    // homeScreen 팩토리는 nav 마운트와 같은 동기 태스크라 타이머 시점엔 카드가 레이아웃돼 있다.
    window.setTimeout(() => {
      for (const c of cards) {
        const t = c.querySelector<HTMLElement>(".ub-title");
        if (!t || !t.isConnected) continue;
        t.style.fontSize = "";
        let size = parseFloat(getComputedStyle(t).fontSize) || 22; // 기본 크기에서 출발(하드코딩 금지)
        while (t.scrollWidth > t.clientWidth && size > 14) {
          size -= 0.5;
          t.style.fontSize = `${size}px`;
        }
      }
    }, 0);
  }

  // 드래그: 스트립이 손가락을 그대로 따라온다(가로축 잠금 — 세로는 페이지 스크롤에 양보)
  let dSx = 0;
  let dSy = 0;
  let dX0 = 0;
  let dragging = false;
  let dAxis = 0;
  carEl.addEventListener("pointerdown", (e) => {
    dSx = e.clientX;
    dSy = e.clientY;
    dragging = true;
    dAxis = 0;
    dMoved = 0;
    dX0 = tx;
    // 전환 중 그랩도 현재 위치에서 이어받는다
    try {
      dX0 = new DOMMatrixReadOnly(getComputedStyle(strip).transform).m41;
    } catch {
      /* transform: none 등 — tx 유지 */
    }
  });
  carEl.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - dSx;
    const dy = e.clientY - dSy;
    if (!dAxis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      dAxis = Math.abs(dx) >= Math.abs(dy) ? 1 : -1;
      if (dAxis < 0) {
        dragging = false;
        return;
      }
      strip.classList.add("drag");
      // 캡처는 가로축 확정 순간에만 — pointerdown에서 걸면 click이 캡처 대상으로 디스패치돼 피크 카드 탭이 죽는다
      try {
        carEl.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 포인터 id — 실기기 정상(binSort 선례) */
      }
    }
    dMoved = dx;
    const over = (dx > 0 && sel === 0) || (dx < 0 && sel === cur.length - 1);
    setStrip(dX0 + dx * (over ? 0.32 : 1)); // 끝 단원은 러버밴딩
  });
  const endDrag = (e: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    strip.classList.remove("drag");
    if (dAxis < 1) return;
    const dx = e.clientX - dSx;
    let n = sel;
    if (dx < -48 && sel < cur.length - 1) n = sel + 1;
    else if (dx > 48 && sel > 0) n = sel - 1;
    if (n !== sel) {
      haptic(HAPTIC.tap);
      go(n);
    } else {
      snapStrip();
    }
  };
  carEl.addEventListener("pointerup", endDrag);
  carEl.addEventListener("pointercancel", endDrag);

  /** 단원 전환 — 탭·카드·dots 동기화 + 활성 탭 스크롤-인 + 지도 재렌더. */
  function go(i: number, opts: { instant?: boolean } = {}): void {
    sel = i;
    Array.from(tabs.children).forEach((t, ti) => t.classList.toggle("on", ti === i));
    cards.forEach((c, ci) => c.classList.toggle("on", ci === i));
    dots.forEach((d, di) => d.classList.toggle("on", di === i));
    snapStrip(!!opts.instant);
    // 긴 탭은 가로 스크롤 — 활성 탭을 화면 안으로
    try {
      (tabs.children[i] as HTMLElement | undefined)?.scrollIntoView({ behavior: opts.instant ? "auto" : "smooth", inline: "center", block: "nearest" });
    } catch {
      /* jsdom 등 미지원 환경 */
    }
    renderMap(cur[i]);
  }

  function renderMap(u: Unit): void {
    cancelWalk?.();
    cancelWalk = null;
    finishWalk = null;
    clear(mapHost);
    updateRailNext?.(u); // 데스크톱 레일 '이어서 학습' — 단원 전환·학년 전환·rebuild 전부 이 길을 지난다
    // 준비 중 단원 — 지도 대신 안내 카드
    if (u.comingSoon) {
      mapHost.appendChild(
        el(
          "div",
          { class: "coming-card" },
          el("div", { class: "cc-med", html: icon(u.icon || "flask", 30) }),
          el("div", { class: "cc-title", text: "열심히 만들고 있어요" }),
          el("div", { class: "cc-desc", text: `${u.title} 단원은 다음 업데이트에서 만나요.` }),
        ),
      );
      return;
    }
    const theme = UNIT_THEME[u.id] ?? "";
    const ink = themeInk(theme);
    // 지도 헤더 — "정복 지도"(2026-07-21, 구 "레슨 지도" plain 텍스트 격상): 단원 테마색 발자국
    // 칩 + 타이틀. 단원을 넘길 때마다 칩 색이 그 단원 테마를 따라 바뀐다(정복률·정복 인증과 어휘 통일).
    mapHost.appendChild(
      el(
        "div",
        { class: "map-head", style: `--mh-ink:${ink}` },
        el("span", { class: "mh-chip", attrs: { "aria-hidden": "true" }, html: icon("footstep", 14) }),
        el("span", { class: "mh-t", text: "정복 지도" }),
      ),
    );

    const gm = el("div", { class: "gamemap" });
    const terrain = el("div", { class: `gm-terrain ${theme}` });
    const decorLayer = el("div", { class: "gm-decor" });
    const nodesLayer = el("div", { class: "gm-nodes" });
    gm.append(terrain, decorLayer, nodesLayer);
    // 밑창 실루엣·미니 발자국·면 그라데이션 defs(0×0)
    gm.insertAdjacentHTML("afterbegin", soleDefs(theme));
    mapHost.appendChild(gm);

    // 프레스 촉감 보강 — :active만으로는 iOS·합성 이벤트에서 빠질 수 있어 pressed 클래스 병행(목업 검증)
    const unpress = (): void => nodesLayer.querySelectorAll(".gm-node.pressed").forEach((b) => b.classList.remove("pressed"));
    nodesLayer.addEventListener("pointerdown", (e) => {
      const b = (e.target as HTMLElement).closest?.(".gm-node");
      if (b) b.classList.add("pressed");
    });
    nodesLayer.addEventListener("pointerup", unpress);
    nodesLayer.addEventListener("pointercancel", unpress);
    nodesLayer.addEventListener("pointerleave", unpress);
    // 걷는 중 노드 탭 = 즉시 완주 처리 후 진입 — 캡처 단계에서 걷기를 마저 끝내고 원래 클릭이 이어진다
    nodesLayer.addEventListener("click", () => finishWalk?.(), true);

    let premRibbon = false; // 첫 프리미엄 노드에만 리본을 달아 소음을 줄인다
    const nodeEls: HTMLElement[] = u.lessons.map((lesson, i) => {
      const unlocked = isUnlocked(u, i);
      const done = isDone(lesson.id);
      const prem = !done && isPremiumLocked(lesson); // 완료된 레슨은 그대로 훈장
      const now = unlocked && !done && !prem;
      const state: SoleState = done ? "done" : prem ? "prem" : now ? "now" : "locked";
      const splay = splayOf(i);
      const cls = ["gm-node", "bsn"];
      if (theme) cls.push(theme);
      cls.push(done ? "done" : prem ? "prem" : now ? "now" : "locked");

      const med = el("div", {
        class: "gm-med",
        attrs: { "aria-hidden": "true" },
        html: soleSvg(state, { theme, splay, lessonIcon: lesson.icon }),
      });
      const stateLabel = done
        ? "완료"
        : prem
          ? "프리미엄 · 이용권으로 열려요"
          : now
            ? "학습 시작 가능"
            : "잠김 · 이전 레슨을 먼저 완료해요";
      const node = el("button", {
        class: cls.join(" "),
        style: `--splay:${splay}deg`,
        attrs: now || done || prem
          ? { "aria-label": `${lesson.label ?? lesson.title} — ${stateLabel}` }
          : { "aria-label": `${lesson.label ?? lesson.title} — ${stateLabel}`, "aria-disabled": "true" },
      }, med);
      // 현재 노드 "시작/학습" 리본은 제거(5차 확정) — 워커+펄스 링이 같은 신호를 준다.
      if (prem && !premRibbon) {
        premRibbon = true;
        node.appendChild(el("div", { class: "gm-ribbon gold", text: "프리미엄" }));
      }
      node.appendChild(el("div", { class: "gm-label", text: lesson.label ?? lesson.title }));
      node.addEventListener("click", () => {
        if (prem) {
          // 프리미엄 잠금 — 페이월로 안내(main.ts openLesson이 라우팅)
          haptic(HAPTIC.navTap);
          onOpenLesson(lesson.id);
          return;
        }
        if (!unlocked) {
          haptic(HAPTIC.deny); // 잠긴 발바닥 — 살짝 더 강한 "안 돼요" 버즈(2026-07-21 사용자 승인)
          snack("이전 레슨을 먼저 완료해요");
          return;
        }
        haptic(HAPTIC.navTap);
        onOpenLesson(lesson.id);
      });
      nodesLayer.appendChild(node);
      return node;
    });

    // 단원 종합 평가 노드 — 레슨 진행과 무관하게 항상 열려 있다(레슨 뒤). 잉크 밑창+깃펜, 정복 인증은 골드.
    const exam = examForUnit(u.id);
    if (exam) {
      const rec = examRecordOf(exam.id);
      const splay = splayOf(u.lessons.length);
      const med = el("div", {
        class: "gm-med",
        attrs: { "aria-hidden": "true" },
        html: soleSvg(rec.conquered ? "conq" : "exam", { theme, splay }),
      });
      const node = el("button", {
        class: `gm-node exam bsn ${theme} ${rec.conquered ? "conq" : ""}`,
        style: `--splay:${splay}deg`,
        attrs: { "aria-label": `단원 종합 평가 — ${rec.best > 0 ? `최고 ${rec.best}점` : "언제든 도전 가능"}` },
      }, med);
      if (rec.conquered) node.appendChild(el("div", { class: "gm-ribbon gold", text: "정복 인증" }));
      node.appendChild(el("div", { class: "gm-label", text: "단원 종합 평가" }));
      if (rec.best > 0) node.appendChild(el("div", { class: "gm-exam-best", text: `최고 ${rec.best}점` }));
      node.addEventListener("click", () => {
        haptic(HAPTIC.navTap); // 시험 노드도 발바닥(잉크 밑창) — 지도 노드 공통 격상
        nav2?.onOpenExam?.(u.id);
      });
      nodesLayer.appendChild(node);
      nodeEls.push(node);
    }

    // 워커가 서 있는 노드 = 첫 미완료 레슨(프리미엄 잠금 포함 — 관문 앞에 선다), 전부 완료면 시험 노드.
    const firstUndone = u.lessons.findIndex((l) => !isDone(l.id));
    const lessonsDone = firstUndone < 0 ? u.lessons.length : firstUndone;
    const walkIdx = Math.min(lessonsDone, nodeEls.length - 1);
    const walker = el("div", { class: "gm-walker", attrs: { "aria-hidden": "true" }, html: walkerSvg(ink) });
    nodesLayer.appendChild(walker);

    // 걷기 연출 판정 — 방금 첫 완료한 레슨 노드에서 다음 노드로(자연 진행일 때만). 1회 소비.
    const walkFromId = pendingWalkFrom;
    pendingWalkFrom = undefined;
    const fromIdx = walkFromId ? u.lessons.findIndex((l) => l.id === walkFromId) : -1;
    const walking = fromIdx >= 0 && walkIdx === fromIdx + 1;
    // 걷기 전엔 이전 상태(출발 노드 기준)로 그리고, 진한 도장은 걸으면서 찍는다
    const anchorIdx = walking ? fromIdx : walkIdx;
    // 이제 막 열리는 레슨은 걷는 동안 잠금색으로 두고 도착 순간 해금(테마색 점등) — .now 클래스 계약은 유지
    const destNode = walking ? nodeEls[walkIdx] : null;
    if (destNode?.classList.contains("now")) destNode.classList.add("arriving");

    afterPaint(() => {
      const W = gm.clientWidth || 340;
      const amp = Math.min(102, W * 0.25);
      const { points, height } = serpentine(nodeEls.length, { width: W, gap: 122, top: 66, bottom: 100, amp, pattern: STEP_PATTERN });
      gm.style.height = `${height}px`;
      // 노드는 폭 대비 %로 배치 → SVG(폭 100%로 신축)와 함께 스케일되어 회전/리사이즈에 강함.
      points.forEach((p, i) => {
        nodeEls[i].style.left = `${(p.x / W) * 100}%`;
        nodeEls[i].style.top = `${p.y}px`;
        // 라벨 지그재그(지도 단순화 ①): 왼쪽 치우침 노드 → 라벨 오른쪽(lab-r), 오른쪽 → 왼쪽(lab-l).
        // 판정은 화면 중앙선이 아니라 이웃 노드 평균 = 국소 진행선 기준(중앙 부근 노드의 임의성 제거).
        // 라벨이 항상 지도 안쪽을 향해 화면 잘림이 구조적으로 불가능(규칙의 부수 효과 — 유지).
        const nb = [points[i - 1], points[i + 1]].filter(Boolean);
        const ref = nb.length ? nb.reduce((a, q) => a + q.x, 0) / nb.length : p.x + 1;
        nodeEls[i].classList.add(p.x <= ref ? "lab-r" : "lab-l");
      });
      // 발자국 트레일 — 연결선·점선 폐기: 걸어온 길은 진한 잉크, 갈 길은 옅은 발자국(확정안 A).
      const walkedD = anchorIdx > 0 ? smoothPath(points.slice(0, anchorIdx + 1)) : "";
      const futureD = anchorIdx < points.length - 1 ? smoothPath(points.slice(anchorIdx)) : "";
      const holder = el("div", {});
      holder.innerHTML =
        `<svg class="gm-path" viewBox="0 0 ${W} ${height}" width="${W}" height="${height}" preserveAspectRatio="none">` +
        (walkedD ? `<path class="gm-tr-walked" d="${walkedD}" fill="none" stroke="none"/>` : "") +
        (futureD ? `<path class="gm-tr-future" d="${futureD}" fill="none" stroke="none"/>` : "") +
        `</svg>`;
      const svgEl = holder.firstElementChild as SVGSVGElement;
      terrain.insertAdjacentElement("afterend", svgEl);
      const walked = svgEl.querySelector<SVGPathElement>(".gm-tr-walked");
      // 시작 42 = 밑창 반높이(±36)+여유 — 목업(26)보다 큰 이유: 실앱 밑창은 노드 중심 기준 ±36px.
      // 걸어온 트레일 끝은 노드 앞 55px에서 멈춘다(노드 위에 선 워커 머리·깃발과 도장 겹침 방지)
      if (walked) stampTrail(svgEl, walked, { from: 42, endGap: 55, fill: "rgba(49,67,92,.82)", delayBase: 120, delayStep: 24, reduce: reduceMotion });
      const future = svgEl.querySelector<SVGPathElement>(".gm-tr-future");
      const futureStamps = future
        ? stampTrail(svgEl, future, { from: 42, endGap: 40, fill: "rgba(143,161,181,.30)", delayBase: 340, delayStep: 18, reduce: reduceMotion })
        : [];
      // 스틱맨 워커 — 발 앵커 = 노드 중심 +8px(패드 중심). 깃발은 단원 테마색.
      const wp = points[anchorIdx];
      walker.style.left = `${((wp.x / W) * 100).toFixed(3)}%`;
      walker.style.top = `${wp.y + 8}px`;
      placeDecor(decorLayer, points, W, u.id);
      if (walking && destNode && futureD) {
        startWalk({ svgEl, futureD, walker, destNode, dest: points[walkIdx], W, futureStamps });
      }
    });
  }

  /**
   * 걷기 연출(레슨 첫 완료 귀환의 보상) — 홈 안착 ~300ms 뒤, 도착 노드가 화면 밖이면 스크롤-인 후 시작.
   * 8fps 두 포즈 플립북(125ms — 스플래시 리듬) + 24px마다 진한 도장 + 도착 시 idle 복귀(=깃발 플랜팅)와
   * arriving 해제(테마색 점등). 고정 2.1s: 경로 길이(125~148px)와 무관하게 보상 시간이 일정하다.
   */
  function startWalk(o: {
    svgEl: SVGSVGElement;
    futureD: string;
    walker: HTMLElement;
    destNode: HTMLElement;
    dest: { x: number; y: number };
    W: number;
    futureStamps: { g: SVGGElement; d: number }[];
  }): void {
    // 걷기 구간 = 갈 길 경로의 첫 베지어(출발 노드 → 다음 노드) — 트레일 도장과 같은 곡선을 밟는다
    const parts = o.futureD.split(" C ");
    if (parts.length < 2) return;
    const wp = document.createElementNS("http://www.w3.org/2000/svg", "path");
    wp.setAttribute("d", `${parts[0]} C ${parts[1]}`);
    wp.setAttribute("fill", "none");
    wp.setAttribute("stroke", "none");
    o.svgEl.appendChild(wp);
    const L = wp.getTotalLength();

    let raf = 0;
    let poseTimer = 0;
    let startTimer = 0;
    let done = false;
    let lastD = 0;
    let side = 1;
    const poses = o.walker.querySelectorAll<SVGGElement>(".pose");
    const pose = (k: string): void => poses.forEach((p) => p.classList.toggle("on", p.dataset.pose === k));
    const stampNext = (): void => {
      side = -side;
      stampOne(o.svgEl, wp, lastD, side, "rgba(49,67,92,.82)");
    };
    const land = (): void => {
      // 도착: idle 복귀(깃발 플랜팅) + 워커를 %-left로 재고정(리사이즈 안전) + 도착 노드 해금 점등
      pose("idle");
      o.walker.style.left = `${((o.dest.x / o.W) * 100).toFixed(3)}%`;
      o.walker.style.top = `${o.dest.y + 8}px`;
      o.destNode.classList.remove("arriving");
      cancelWalk = null;
      finishWalk = null;
    };
    const stop = (): void => {
      done = true;
      window.clearInterval(poseTimer);
      window.clearTimeout(startTimer);
      cancelAnimationFrame(raf);
    };
    cancelWalk = stop; // 지도 재렌더·화면 이탈 — 조용히 정리(요소도 함께 버려진다)
    finishWalk = () => {
      // 걷는 중 노드 탭 — 남은 도장을 즉시 찍고 완주 처리
      stop();
      while (lastD + 24 < L - 8) {
        lastD += 24;
        stampNext();
      }
      land();
    };

    const begin = (): void => {
      if (done) return;
      // 걷기 시작 — 이 구간의 옅은 발자국은 물러나고 진한 잉크가 덮는다
      o.futureStamps.forEach(({ g, d }) => {
        if (d < L - 28) {
          g.style.transition = "opacity .5s ease";
          g.style.opacity = "0";
        }
      });
      const t0 = performance.now();
      const DUR = 2100;
      pose("pa");
      poseTimer = window.setInterval(() => pose(Math.floor((performance.now() - t0) / 125) % 2 ? "pb" : "pa"), 125);
      const step = (now: number): void => {
        if (done) return;
        const t = Math.min(1, (now - t0) / DUR);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const d = e * L;
        const p = wp.getPointAtLength(d);
        o.walker.style.left = `${p.x.toFixed(1)}px`;
        o.walker.style.top = `${(p.y + 8).toFixed(1)}px`; // 걷기 경로도 패드 중심(+8px)을 밟는다
        while (d - lastD >= 24 && d < L - 8) {
          lastD += 24;
          stampNext();
        }
        if (t < 1) raf = requestAnimationFrame(step);
        else {
          stop();
          land();
        }
      };
      raf = requestAnimationFrame(step);
    };

    // 홈 안착 ~300ms 뒤 시작 — 도착 노드가 화면 밖이면 먼저 스크롤-인
    startTimer = window.setTimeout(() => {
      const r = o.destNode.getBoundingClientRect();
      const sr = scroll.getBoundingClientRect();
      if (r.top < sr.top + 56 || r.bottom > sr.bottom - 32) {
        try {
          o.destNode.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {
          /* noop */
        }
        startTimer = window.setTimeout(begin, 430);
      } else {
        begin();
      }
    }, 300);
  }

  /** 전체 재구성 — 학년/과목 전환·검토 모드 토글 등 데이터가 바뀔 때. */
  function rebuild(): void {
    renderTabs();
    buildCards();
    renderMap(cur[sel]);
    afterPaint(() => {
      snapStrip(true);
      try {
        (tabs.children[sel] as HTMLElement | undefined)?.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
      } catch {
        /* noop */
      }
    });
  }

  const onResize = (): void => snapStrip(true);
  window.addEventListener("resize", onResize);

  rebuild();
  return {
    el: elm,
    onExit: () => {
      cancelWalk?.();
      window.removeEventListener("resize", onResize);
    },
  };
}

// 단원 특색 장식 — 트레일 문법(경로·발자국·밑창 노드)은 그대로, 소품이 단원의 이야기를 만든다.
// seq: 노드 사이 슬롯에 순서대로(순서 자체가 서사 — IV는 고→액→기, VII은 태양에서 먼 행성 순).
// sky: 지도 위쪽 앰비언트 2개(하늘 소품). 등록 안 된 단원은 기본 자연 세트.
const UNIT_DECOR: Record<string, { seq: string[]; sky: [string, string] }> = {
  u1: { seq: ["stones", "palm", "vine", "stones", "flag"], sky: ["cloud", "cloud"] }, // 정글로 가는 징검다리 원정
  u2: { seq: ["bacteria", "amoeba", "fern", "fish", "bird"], sky: ["cloud", "bird"] }, // 미생물 → 새, 생물의 사다리
  u3: { seq: ["campfire", "steamMug", "kettleDeco", "campfire", "sunDeco"], sky: ["cloud", "sunDeco"] },
  u4: { seq: ["iceDeco", "dropDeco", "vaporDeco", "iceDeco", "dropDeco"], sky: ["cloud", "vaporDeco"] }, // 고체 → 액체 → 기체
  u5: { seq: ["appleTree", "springDeco", "crateDeco", "floatDeco", "appleTree"], sky: ["cloud", "cloud"] }, // 중력·탄성·마찰·부력
  u6: { seq: ["balloonsDeco", "bubblesDeco", "hotairDeco", "bubblesDeco", "balloonsDeco"], sky: ["hotairDeco", "cloud"] },
  u7: { seq: ["pMercury", "pVenus", "pMars", "pJupiter", "pSaturn"], sky: ["rocketDeco", "sparkle"] }, // 행성을 밟아 가는 순항
  g2u1: { seq: ["flaskDeco", "layersDeco", "crystalDeco", "funnelDeco", "alembicDeco"], sky: ["cloud", "sparkle"] }, // 실험대 순례: 측정→층→결정→분리→증류
  g2u2: { seq: ["earthcutDeco", "quartzDeco", "volcanoDeco", "strataDeco", "fossilDeco"], sky: ["cloud", "sparkle"] }, // 지질 원정: 지구 단면→수정→화산→지층→화석
  g2u3: { seq: ["flashlightDeco", "mirrorDeco", "prismDeco", "rgbDeco", "noteDeco"], sky: ["rainbowDeco", "cloud"] }, // 빛의 여행 → 소리의 여행
  g2u4: { seq: ["beakerDeco", "atomDeco", "tableDeco", "moleculeDeco", "ionDeco"], sky: ["atomDeco", "cloud"] }, // 성분에서 입자로 — 원소→원자→주기율표→분자→이온
  g2u5: { seq: ["leafDeco", "stomaDeco", "chloroplastDeco", "flowerDeco", "fruitDeco"], sky: ["sunDeco", "leafDeco"] }, // 잎→기공→엽록체→꽃→열매, 광합성산물의 여정
  g2u6: { seq: ["stomachDeco", "heartDeco", "lungDeco", "kidneyDeco", "cellDeco"], sky: ["cloud", "sparkle"] }, // 소화→순환→호흡→배설→세포 에너지
  g2u7: { seq: ["boltDeco", "batteryDeco", "bulbDeco", "coilDeco", "magnetDeco"], sky: ["boltDeco", "cloud"] }, // 전기 순례: 스파크→전지→전구→코일→자석
  g2u8: { seq: ["starsDeco", "clusterDeco", "galaxyDeco", "telescopeDeco", "rocketDeco"], sky: ["starsDeco", "sparkle"] }, // 별빛 순항: 별→성단→은하→망원경→로켓
  m1u1: { seq: ["pmDeco", "fracDeco", "primeDeco", "opsDeco", "numlineDeco"], sky: ["sparkle", "cloud"] }, // 수와 연산: 부호 타일, 분수 카드, 소수 7 배지, 연산 타일, 수직선 팻말
  m1u2: { seq: ["xDeco", "eqDeco", "scaleDeco", "aDeco", "boxDeco"], sky: ["sparkle", "cloud"] }, // 문자와 식: x 카드, 등호, 양팔저울, a 카드, x 상자
  m1u3: { seq: ["pinDeco", "gridDeco", "zigDeco", "riseDeco", "hyperDeco"], sky: ["sparkle", "cloud"] }, // 좌표평면과 그래프: 점 핀, 좌표평면, 꺾은선, 정비례 직선, 반비례 곡선(단원 여정 순)
  m1u4: { seq: ["pointDeco", "segmentDeco", "protracDeco", "compassDeco", "trisqDeco"], sky: ["sparkle", "cloud"] }, // 기본 도형: 점 → 선분 → 각도기 → 컴퍼스 → 삼각자(도형 여정 순)
  m1u5: { seq: ["pentaDeco", "fanDeco", "diceDeco", "coneDeco", "sphereDeco"], sky: ["sparkle", "cloud"] }, // 평면도형과 입체도형: 오각형 → 부채꼴 → 주사위 → 원뿔 → 구(평면에서 입체로의 여정 순)
  m1u6: { seq: ["seesawDeco", "stemshelfDeco", "histoDeco", "fpolyDeco", "ratioDeco"], sky: ["sparkle", "cloud"] }, // 통계: 평균 시소 → 줄기 선반 → 히스토그램 → 도수분포다각형 → 상대도수 비율(자료 정리의 여정 순)
  m2u1: { seq: ["calcDeco", "tapeDeco", "loopDeco", "powtowerDeco", "termchipDeco"], sky: ["sparkle", "cloud"] }, // 중2 Ⅰ: 계산기 → 반복 무늬 테이프 → 무한 리본 → 지수 탑 → 항 칩(수의 표현에서 식의 계산으로)
  m2u2: { seq: ["signDeco", "tiltDeco", "rangeDeco", "duoboxDeco", "birdrabbitDeco"], sky: ["sparkle", "cloud"] }, // 중2 Ⅱ: 제한 표지판 → 기운 저울 → 수직선 범위 → x·y 상자 쌍 → 꿩과 토끼(부등식에서 연립방정식으로)
  m2u3: { seq: ["funcboxDeco", "duolineDeco", "axisdotDeco", "slopetriDeco", "crosspointDeco"], sky: ["sparkle", "cloud"] }, // 중2 Ⅲ: 함수 기계 → 나란한 두 직선 → 절편 점 → 기울기 세모 → 교점(함수에서 교점까지)
  m2u4: { seq: ["hangerDeco", "sealDeco", "circumDeco", "paraliftDeco", "kiteDeco"], sky: ["sparkle", "cloud"] }, // 중2 Ⅳ: 이등변 옷걸이 → 증명 도장 → 외접원 → 평행사변형 리프트 → 마름모 연(삼각형에서 사각형으로)
  m2u5: { seq: ["matryoDeco", "trirulerDeco", "foldletterDeco", "trayDeco", "knotropeDeco"], sky: ["sparkle", "cloud"] }, // 중2 Ⅴ: 마트료시카 → 삼각자 → 3단 접기 편지 → 균형 쟁반 → 3·4·5 매듭 밧줄(닮음에서 피타고라스로)
  m2u6: { seq: ["coinDeco", "branchDeco", "spinnerDeco", "chanceDeco", "capsuleDeco"], sky: ["sparkle", "cloud"] }, // 중2 Ⅵ: 동전 → 가지 그림 → 원판 → 확률 눈금 → 뽑기 캡슐(세기에서 확률로)
  s1u1: { seq: ["globeDeco", "passportDeco", "planeDeco", "compassRoseDeco", "suitcaseDeco"], sky: ["planeDeco", "cloud"] }, // 사회 Ⅰ: 지구본 → 여권 → 비행기 → 나침반 → 캐리어(세계 여행을 떠나는 준비물 순)
  s1u2: { seq: ["asiaMountDeco", "asiaRiceDeco", "asiaCamelDeco", "asiaLanternDeco", "asiaDhowDeco"], sky: ["planeDeco", "cloud"] }, // 사회 Ⅱ: 설산 → 벼논 → 낙타 → 홍등 → 돛단배(아시아 대륙 횡단 여행 순)
  s1u3: { seq: ["euroAlpsDeco", "euroBrollyDeco", "euroOliveDeco", "euroTramDeco", "euroStarsDeco"], sky: ["planeDeco", "cloud"] }, // 사회 Ⅲ: 알프스 → 비 우산 → 올리브 → 트램 → 별 깃발(유럽 종단 여행 순)
  s1u4: { seq: ["afrPyramidDeco", "afrBaobabDeco", "afrGiraffeDeco", "afrDrumDeco", "afrSolarDeco"], sky: ["planeDeco", "cloud"] }, // 사회 Ⅳ: 피라미드 → 바오바브 → 기린 → 젬베 → 태양광(문명에서 미래로)
  s1u5: { seq: ["amMapleDeco", "amSkylineDeco", "amCactusDeco", "amParrotDeco", "amLlamaDeco"], sky: ["planeDeco", "cloud"] }, // 사회 Ⅴ: 단풍 → 마천루 → 선인장 → 앵무새 → 라마(북에서 남으로 대륙 종단)
  s1u6: { seq: ["ocnReefDeco", "ocnUluruDeco", "ocnRooDeco", "ocnIcebreakerDeco", "ocnPenguinDeco"], sky: ["planeDeco", "cloud"] }, // 사회 Ⅵ: 산호초 → 울루루 → 캥거루 → 쇄빙선 → 펭귄("가장 멀리, 가장 추운 곳까지" — 태평양에서 극지방으로)
  s1u7: { seq: ["socCradleDeco", "socBagDeco", "socNametagDeco", "socVineDeco", "socShakeDeco"], sky: ["cloud", "cloud"] }, // 사회 Ⅶ: 요람 → 책가방 → 이름표 → 엉킨 덩굴 → 악수("사회 속 나" — 사회화·배움터·지위·갈등·존중 순. 일반사회 1막이라 하늘 비행기 대신 구름만)
  h1u1: { seq: ["scrollDeco", "magnifyDeco", "inkbrushDeco", "hourglassDeco", "relicjarDeco"], sky: ["cloud", "sparkle"] }, // 역사 Ⅰ: 두루마리 → 돋보기 → 붓 → 모래시계 → 항아리(기록을 만나 살피고, 쓰고, 시간을 재고, 유물을 캐는 탐구 순)
  h1u2: { seq: ["handaxeDeco", "combjarDeco", "zigguratDeco", "columnDeco", "greatwallDeco"], sky: ["sparkle", "cloud"] }, // 역사 Ⅱ: 주먹도끼 → 빗살 토기 → 지구라트 → 그리스 기둥 → 만리장성(문명 순례 — 선사에서 고대 제국까지 걷는 순)
  h1u3: { seq: ["grottoDeco", "camelDeco", "lanternDeco", "mosaicDeco", "spireDeco"], sky: ["sparkle", "cloud"] }, // 역사 Ⅲ: 석굴 불상 → 당삼채 낙타 → 초승달 등불 → 모자이크 조각 → 첨탑 스테인드글라스("믿음의 길" — 동아시아에서 서유럽까지 종교 문화 순례 순)
  h1u4: { seq: ["luopanDeco", "jiaoziDeco", "galleonDeco", "spiceDeco", "crownDeco"], sky: ["sparkle", "cloud"] }, // 역사 Ⅳ: 나침반 → 지폐 꾸러미 → 범선 → 향신료 자루 → 왕관("교역의 길" — 송의 발명에서 뱃길·교역품을 지나 왕들의 시대로 가는 순)
};
const DEFAULT_DECOR: { seq: string[]; sky: [string, string] } = {
  seq: ["tree1", "tree2", "bush", "rock", "grassTuft"],
  sky: ["cloud", "cloud"],
};
const DECOR_SIZE: Record<string, number> = {
  tree1: 56, tree2: 56, bush: 42, rock: 30, grassTuft: 36,
  stones: 46, palm: 58, vine: 50, flag: 46,
  bacteria: 40, amoeba: 42, fern: 46, fish: 44, bird: 42,
  campfire: 46, steamMug: 40, kettleDeco: 44, sunDeco: 44,
  iceDeco: 42, dropDeco: 38, vaporDeco: 44,
  appleTree: 58, springDeco: 42, crateDeco: 42, floatDeco: 46,
  balloonsDeco: 50, hotairDeco: 54, bubblesDeco: 42,
  pMercury: 36, pVenus: 38, pMars: 38, pJupiter: 46, pSaturn: 52, rocketDeco: 46, sparkle: 34,
  flaskDeco: 46, layersDeco: 44, crystalDeco: 46, funnelDeco: 42, alembicDeco: 48,
  volcanoDeco: 50, quartzDeco: 44, strataDeco: 50, fossilDeco: 42, earthcutDeco: 46,
  flashlightDeco: 48, mirrorDeco: 44, prismDeco: 50, rgbDeco: 44, noteDeco: 38, rainbowDeco: 58,
  beakerDeco: 46, atomDeco: 46, tableDeco: 46, moleculeDeco: 46, ionDeco: 42,
  leafDeco: 46, stomaDeco: 42, chloroplastDeco: 46, flowerDeco: 46, fruitDeco: 44,
  stomachDeco: 46, heartDeco: 44, lungDeco: 48, kidneyDeco: 46, cellDeco: 44,
  pebblesDeco: 44, sieveDeco: 48, numTreeDeco: 46, vennDeco: 48, numlineDeco: 44,
  pmDeco: 42, fracDeco: 42, primeDeco: 44, opsDeco: 46, xDeco: 44, aDeco: 40, eqDeco: 42, scaleDeco: 46, boxDeco: 44,
  pointDeco: 38, segmentDeco: 46, protracDeco: 48, compassDeco: 46, trisqDeco: 48,
  pentaDeco: 44, fanDeco: 48, diceDeco: 44, coneDeco: 46, sphereDeco: 42,
  seesawDeco: 48, stemshelfDeco: 46, histoDeco: 46, fpolyDeco: 46, ratioDeco: 42,
  calcDeco: 46, tapeDeco: 46, loopDeco: 48, powtowerDeco: 48, termchipDeco: 44,
  signDeco: 44, tiltDeco: 48, rangeDeco: 46, duoboxDeco: 46, birdrabbitDeco: 50,
  funcboxDeco: 46, duolineDeco: 48, axisdotDeco: 44, slopetriDeco: 46, crosspointDeco: 48,
  hangerDeco: 46, sealDeco: 42, circumDeco: 48, paraliftDeco: 48, kiteDeco: 46,
  matryoDeco: 46, trirulerDeco: 46, foldletterDeco: 44, trayDeco: 48, knotropeDeco: 48,
  globeDeco: 48, passportDeco: 44, planeDeco: 54, compassRoseDeco: 46, suitcaseDeco: 46,
  afrPyramidDeco: 50, afrBaobabDeco: 48, afrGiraffeDeco: 46, afrDrumDeco: 42, afrSolarDeco: 48,
  ocnReefDeco: 46, ocnUluruDeco: 50, ocnRooDeco: 46, ocnIcebreakerDeco: 48, ocnPenguinDeco: 44,
  scrollDeco: 46, magnifyDeco: 44, inkbrushDeco: 40, hourglassDeco: 42, relicjarDeco: 46,
  handaxeDeco: 42, combjarDeco: 46, zigguratDeco: 48, columnDeco: 44, greatwallDeco: 48,
  grottoDeco: 46, camelDeco: 46, lanternDeco: 42, mosaicDeco: 44, spireDeco: 48,
  luopanDeco: 44, jiaoziDeco: 42, galleonDeco: 48, spiceDeco: 44, crownDeco: 42,
};

function placeDecor(layer: HTMLElement, points: { x: number; y: number }[], W: number, unitId: string): void {
  const conf = UNIT_DECOR[unitId] ?? DEFAULT_DECOR;
  const add = (key: string, x: number, y: number, w: number, h: number) => {
    layer.appendChild(
      el("div", { class: `gm-deco ${key === "cloud" ? "cloud" : ""}`, style: `left:${((x / W) * 100).toFixed(2)}%;top:${y}px;width:${w}px;height:${h}px`, html: mapDecorArt(key) }),
    );
  };
  // 장식은 경로 반대편 여백이 기본 — 단, S 중심선이 반 주기 내내 한쪽에 머무는 배치에선 장식이
  // 한쪽 열로 몰린다(2026-07-15 사용자 적발). 같은 쪽 3연속이면 반대쪽으로 꺾고 가로에 지터를 줘
  // 양쪽 여백을 함께 쓴다. 손튜닝 STEP_PATTERN의 노드 최대 진폭(≈0.73W)에서 반대쪽 0.82W+ 열은
  // 항상 비어 있어 경로·노드와 충돌하지 않는다.
  // 밀도 절반(지도 단순화 ④): 노드 사이 슬롯을 한 칸 걸러 채운다 — seq 키는 "찍힌 순서"로
  // 전진해(placed) 서사 순서가 끊기지 않고, 반복 채움만 줄어든다(seq 자체 개편 금지).
  const JIT = [0, 0.05, -0.035, 0.02, -0.05];
  let side = 0; // -1 왼쪽 · 1 오른쪽
  let run = 0;
  let placed = 0;
  for (let i = 0; i < points.length - 1; i += 2) {
    const mid = { x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2 };
    let s = mid.x > W / 2 ? -1 : 1;
    if (s === side && run >= 2) {
      s = -s;
      run = 1;
    } else {
      run = s === side ? run + 1 : 1;
    }
    side = s;
    const key = conf.seq[placed % conf.seq.length];
    const size = DECOR_SIZE[key] ?? 42;
    const xf = s < 0 ? 0.13 + JIT[placed % JIT.length] : 0.87 - JIT[placed % JIT.length];
    add(key, W * xf, mid.y + (placed % 2 ? 12 : -8), size, size);
    placed += 1;
  }
  const [skyA, skyB] = conf.sky;
  const skySize = (k: string, big: boolean): [number, number] =>
    k === "cloud" ? (big ? [62, 40] : [52, 34]) : [DECOR_SIZE[k] ?? 44, DECOR_SIZE[k] ?? 44];
  const [wa, ha] = skySize(skyA, true);
  add(skyA, W * 0.8, 30, wa, ha);
  const [wb, hb] = skySize(skyB, false);
  add(skyB, W * 0.22, points[Math.min(1, points.length - 1)].y - 34, wb, hb);
}
