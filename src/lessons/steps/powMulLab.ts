// powMulLab, 거듭제곱 곱셈 랩(중2 수학 Ⅰ L5, 책 28~30쪽). 같은 밑 거듭제곱 상자를
// 병합해 지수의 덧셈(aᵐ×aⁿ=aᵐ⁺ⁿ)을, 상자 복제로 지수의 곱셈((aᵐ)ⁿ=aᵐⁿ)을 발견한다.
// ── 스펙 ──────────────────────────────────────────────────
// 국면 1 "상자 병합": 2³ 상자(2 칩 3개)와 2² 상자(2 칩 2개). 먼저 예측(2⁵ / 2⁶ 선택지,
//         2⁶은 3×2 오개념) → 한 상자를 다른 상자로 드래그(탭탭 폴백) → 칩들이 쏟아져 합쳐지며
//         칩 5개 = 2⁵ 라벨 완성 → "지수끼리 3+2=5". powBuild의 드래그 병합 문법 계승.
// 국면 2 "밑이 다르면?": 2² 상자와 3² 상자 병합 시도 → 스프링 복귀 + "밑이 달라요,
//         밑이 같을 때만 지수를 더해요"(함정 국면, [합칠 수 없어요] 선언이 정답 경로).
// 국면 3 "상자 복제": (a³)² — 예측 먼저(a⁶ / a⁵ — a⁵는 3+2 오개념) → [2번 반복] 버튼 →
//         같은 상자가 한 개 더 뿅 → 칩이 쏟아져 합쳐지며 칩 6개 = a⁶. "지수끼리 3×2=6".
// 목표 칩 3: merge(병합 발견) · base(밑 다름 함정) · clone(복제 발견).
// ── 구현 노트 ─────────────────────────────────────────────
// 상자 배치는 left/top(px)만 쓴다(transform은 born/pop/shake 키프레임 몫 — counterLab 규칙).
// 판단 질문은 .pml-q 강조 줄로 선택지 버튼 바로 위(mq6-q 문법 계승, calc 그레이프 톤).
// 모션은 전부 CSS 트랜지션/키프레임 + setTimeout 체인(타이머 Set 일괄 해제), rAF 금지.
// setPointerCapture는 try/catch. (a³)² 같은 괄호 지수는 mfmt가 못 그리므로(")^" 미지원)
// 텍스트 유니코드 위첨자로 쓰고, 결과식은 mfmt("a^3×a^3 = a^6") 꼴만 쓴다.
// 스타일은 math2.css의 .pml-* 섹션. 참조 구현: powBuild(드래그 병합), likeTerms(선언 국면).
import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Box {
  base: string; // "2" | "3" | "a"
  exp: number;
  x: number;
  y: number;
  el: HTMLElement;
  cap: HTMLElement;
  chipsEl: HTMLElement;
  alive: boolean;
}

const BOX_W = 112;
const STAGE_H = 212;
const RING = "0 0 0 3px #fff, 0 0 0 5px #9C36B5"; // 탭 선택 강조(인라인, calc 그레이프)

export const powMulLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "merge", label: "상자 병합", sub: "2³×2²" },
    { id: "base", label: "밑이 다르면", sub: "2²×3²" },
    { id: "clone", label: "상자 복제", sub: "(a³)²" },
  ]);
  const board = mboard(150);
  const eqEl = el("div", { class: "pml-eq" });
  const stage = el("div", { class: "pml-stage" });
  const readEl = el("div", { class: "pml-read" });
  const qEl = el("div", { class: "pml-q" }); // 판단 질문 줄 — 항상 선택지 바로 위
  const ctlEl = el("div", { class: "pml-ctl" });
  board.append(eqEl, stage, readEl, qEl, ctlEl);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(goals.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("목표 세 개를 모두 달성하면 열려요", { enabled: false });

  /* ---------- 공용 상태 ---------- */
  let boxes: Box[] = [];
  let sel: Box | null = null;
  let busy = true; // 예측·연출 중 조작 잠금
  let phase = 0;
  let finished = false;
  let onMerged: ((dst: Box) => void) | null = null; // 국면별 병합 완료 훅
  let onBadBase: (() => void) | null = null; // 밑 다른 병합 시도 훅(국면 2)
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const stageW = (): number => stage.clientWidth || board.clientWidth || 340;

  function maybeFinish(): void {
    if (finished || goals.count() < 3) return;
    finished = true;
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ---------- 상자 ---------- */
  /** left/top 배치(트랜지션 옵션). transform은 건드리지 않는다 — 키프레임 몫. */
  function put(b: Box, x: number, y: number, trans = ""): void {
    b.x = x;
    b.y = y;
    b.el.style.transition = trans ? `left ${trans}, top ${trans}` : "";
    b.el.style.left = `${x}px`;
    b.el.style.top = `${y}px`;
    if (trans)
      later(() => {
        b.el.style.transition = "";
      }, 560);
  }

  function fillChips(b: Box, stagger = false): void {
    b.chipsEl.innerHTML = "";
    for (let i = 0; i < b.exp; i++) {
      const c = el("span", { class: "pml-chip", text: b.base });
      if (stagger) {
        c.style.opacity = "0";
        later(() => {
          c.style.opacity = "";
          c.classList.add("born");
        }, i * 70);
      }
      b.chipsEl.appendChild(c);
    }
  }

  function setSel(b: Box | null): void {
    if (sel) sel.el.style.boxShadow = "";
    sel = b;
    if (sel) sel.el.style.boxShadow = RING;
  }

  function makeBox(base: string, exp: number, x: number, y: number): Box {
    const cap = el("div", { class: "pml-cap", html: mfmt(`${base}^${exp}`) });
    const chipsEl = el("div", { class: "pml-chips" });
    const root = el(
      "div",
      {
        class: `pml-box${base === "3" ? " alt" : ""}${base === "a" ? " va" : ""}`,
        attrs: { role: "button", tabindex: "0", "aria-label": `${base}의 ${exp}제곱 상자, 칩 ${exp}개` },
      },
      cap,
      chipsEl,
    );
    const b: Box = { base, exp, x, y, el: root, cap, chipsEl, alive: true };
    fillChips(b);
    stage.appendChild(root);
    put(b, x, y);
    root.classList.add("born");
    later(() => root.classList.remove("born"), 460);
    boxes.push(b);
    bindDrag(b);
    return b;
  }

  function clearBoxes(): void {
    setSel(null);
    for (const b of boxes) {
      b.alive = false;
      const dead = b.el;
      dead.classList.add("gone");
      later(() => dead.remove(), 280);
    }
    boxes = [];
  }

  /* ---------- 병합(칩 쏟아지기) ---------- */
  function attemptMerge(src: Box, dst: Box): void {
    if (busy || !src.alive || !dst.alive || src === dst) return;
    if (src.base !== dst.base) {
      haptic(HAPTIC.wrong);
      toast("밑이 달라요! 밑이 같을 때만 지수를 더할 수 있어요");
      [src, dst].forEach((b) => {
        b.el.classList.remove("no");
        void b.el.offsetWidth;
        b.el.classList.add("no");
        later(() => b.el.classList.remove("no"), 440);
      });
      onBadBase?.();
      return;
    }
    pour(src, dst);
  }

  /** src 상자의 칩이 dst 상자로 쏟아져 합쳐진다. */
  function pour(src: Box, dst: Box): void {
    busy = true;
    setSel(null);
    src.alive = false;
    boxes = boxes.filter((b) => b !== src);
    // 칩 현재 위치를 무대 좌표로 측정해 나는 칩(clone)으로 교체
    const stR = stage.getBoundingClientRect();
    const flies: HTMLElement[] = [];
    src.chipsEl.querySelectorAll(".pml-chip").forEach((c) => {
      const r = (c as HTMLElement).getBoundingClientRect();
      const f = el("span", { class: `pml-chip fly${src.base === "3" ? " alt" : ""}${src.base === "a" ? " va" : ""}`, text: src.base });
      f.style.left = `${r.left - stR.left}px`;
      f.style.top = `${r.top - stR.top}px`;
      stage.appendChild(f);
      flies.push(f);
    });
    const deadEl = src.el;
    deadEl.classList.add("gone");
    later(() => deadEl.remove(), 280);
    // 목적지: dst 칩 영역 부근으로 스태거 글라이드
    const dx = dst.x + BOX_W / 2 - 13;
    const dy = dst.y + (dst.el.offsetHeight || 96) - 36;
    flies.forEach((f, k) => {
      later(() => {
        f.style.transition = "left .48s var(--ease-out), top .48s var(--ease-out)";
        f.style.left = `${dx + (k % 3) * 8 - 8}px`;
        f.style.top = `${dy}px`;
      }, 60 + k * 85);
    });
    const total = 60 + flies.length * 85 + 500;
    later(() => {
      flies.forEach((f) => f.remove());
      dst.exp += src.exp;
      dst.cap.innerHTML = mfmt(`${dst.base}^${dst.exp}`);
      dst.el.setAttribute("aria-label", `${dst.base}의 ${dst.exp}제곱 상자, 칩 ${dst.exp}개`);
      fillChips(dst, true);
      dst.el.classList.remove("pop");
      void dst.el.offsetWidth;
      dst.el.classList.add("pop");
      haptic(HAPTIC.correct);
      later(() => onMerged?.(dst), 520);
    }, total);
  }

  /* ---------- 드래그(캡처 try/catch) + 탭탭 폴백 ---------- */
  function nearest(b: Box): { o: Box; d: number } | null {
    let best: Box | null = null;
    let bd = 1e9;
    for (const o of boxes) {
      if (o === b || !o.alive) continue;
      const d = Math.hypot(
        o.x + BOX_W / 2 - (b.x + BOX_W / 2),
        o.y + o.el.offsetHeight / 2 - (b.y + b.el.offsetHeight / 2),
      );
      if (d < bd) {
        bd = d;
        best = o;
      }
    }
    return best ? { o: best, d: bd } : null;
  }

  function bindDrag(b: Box): void {
    let drag: { pid: number; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null = null;
    const down = (e: PointerEvent): void => {
      if (busy || !b.alive || drag) return;
      try {
        b.el.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 포인터 안전 */
      }
      drag = { pid: e.pointerId, sx: e.clientX, sy: e.clientY, ox: b.x, oy: b.y, moved: false };
    };
    const move = (e: PointerEvent): void => {
      if (!drag || e.pointerId !== drag.pid) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if (!drag.moved) {
        if (Math.hypot(dx, dy) <= 7) return;
        drag.moved = true;
        setSel(null);
        b.el.classList.add("drag");
        b.el.style.transition = "";
        haptic(HAPTIC.select);
      }
      const h = b.el.offsetHeight || 96;
      b.x = clamp(drag.ox + dx, 4, stageW() - BOX_W - 4);
      b.y = clamp(drag.oy + dy, 4, STAGE_H - h - 4);
      b.el.style.left = `${b.x}px`;
      b.el.style.top = `${b.y}px`;
      const hit = nearest(b);
      for (const o of boxes) if (o !== b && o !== sel) o.el.style.boxShadow = hit && o === hit.o && hit.d < 96 ? RING : "";
    };
    const up = (e: PointerEvent): void => {
      if (!drag || e.pointerId !== drag.pid) return;
      const d = drag;
      drag = null;
      b.el.classList.remove("drag");
      for (const o of boxes) if (o !== sel) o.el.style.boxShadow = "";
      if (busy || !b.alive) return;
      if (!d.moved) {
        tapBox(b);
        return;
      }
      const hit = nearest(b);
      if (!hit || hit.d > 96) return; // 빈 곳, 놓은 자리 그대로
      if (hit.o.base !== b.base) {
        attemptMerge(b, hit.o); // 오개념 토스트 + 흔들림
        put(b, d.ox, d.oy, ".45s var(--spring-bounce)"); // 스프링 복귀
        return;
      }
      attemptMerge(b, hit.o);
    };
    const cancel = (e: PointerEvent): void => {
      if (!drag || e.pointerId !== drag.pid) return;
      drag = null;
      b.el.classList.remove("drag");
    };
    b.el.addEventListener("pointerdown", down);
    b.el.addEventListener("pointermove", move);
    b.el.addEventListener("pointerup", up);
    b.el.addEventListener("pointercancel", cancel);
    b.el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!busy && b.alive) tapBox(b);
      }
    });
  }

  function tapBox(b: Box): void {
    haptic(HAPTIC.tap);
    if (sel === b) {
      setSel(null);
      return;
    }
    if (sel && sel.alive) {
      const a = sel;
      setSel(null);
      attemptMerge(a, b);
      return;
    }
    setSel(b);
  }

  /* ---------- 판단 질문(예측) — 질문 줄은 항상 선택지 바로 위 ---------- */
  interface Choice {
    html: string;
    good: boolean;
    fix?: string; // 오답 오개념 교정 토스트
  }
  function ask(qHtml: string, choices: Choice[], after: () => void): void {
    busy = true;
    qEl.innerHTML = qHtml;
    const list = Math.random() < 0.5 ? choices : [...choices].reverse();
    const row = el("div", { class: "pml-choices" });
    let answered = false;
    list.forEach((c) => {
      const btn = el("button", { class: "pml-choice", html: c.html, attrs: { type: "button" } }) as HTMLButtonElement;
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
        if (c.good) {
          haptic(HAPTIC.correct);
          btn.classList.add("ok");
          toast("좋은 예측이에요, 직접 확인해 봐요!");
        } else {
          haptic(HAPTIC.wrong);
          btn.classList.add("no");
          const okIdx = list.findIndex((x) => x.good);
          (row.children[okIdx] as HTMLElement | undefined)?.classList.add("ok");
          if (c.fix) toast(c.fix);
        }
        later(() => {
          qEl.innerHTML = "";
          ctlEl.innerHTML = "";
          after();
        }, c.good ? 950 : 1600);
      });
      row.appendChild(btn);
    });
    ctlEl.replaceChildren(row);
    later(() => qEl.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /** 자기설명형 선택지 라벨(수식 + 근거 한 줄). */
  const choiceHtml = (src: string, sub: string): string => `${mfmt(src)}<span class="pml-chsub">${sub}</span>`;

  /* ============================== 국면 1: 상자 병합 ============================== */
  function phase1(): void {
    phase = 1;
    eqEl.innerHTML = mfmt("2^3×2^2");
    helper.innerHTML = "2³ 상자엔 2가 <b>3개</b>, 2² 상자엔 2가 <b>2개</b> 들어 있어요.";
    const bw = stageW();
    later(() => makeBox("2", 3, 14, 12), 80);
    later(() => makeBox("2", 2, Math.max(8, bw - BOX_W - 14), 100), 220);
    onMerged = (dst) => {
      readEl.innerHTML = mfmt("2^3×2^2 = 2^5");
      helper.innerHTML = "칩을 세어 봐요: 3개+2개=<b>5개</b>! 밑이 같으면 <b>지수끼리 더해요</b>.";
      toast("3+2=5, 2⁵ 완성!");
      goals.on("merge", "3+2=5!");
      void dst;
      later(phase2, 2100);
    };
    later(() => {
      ask(
        "두 상자를 하나로 합치면 뭐가 될까요?",
        [
          { html: choiceHtml("2^5", "지수끼리 3+2"), good: true },
          {
            html: choiceHtml("2^6", "지수끼리 3×2"),
            good: false,
            fix: "지수끼리 곱하면 안 돼요. 상자 속 칩은 3개+2개, 직접 합쳐서 세어 봐요!",
          },
        ],
        () => {
          busy = false;
          helper.innerHTML = "한 상자를 끌어 다른 상자 위에 <b>포개</b> 보세요. 상자 탭 → 상자 탭도 돼요.";
        },
      );
    }, 620);
  }

  /* ============================== 국면 2: 밑이 다르면? ============================== */
  function phase2(): void {
    phase = 2;
    clearBoxes();
    readEl.innerHTML = "";
    onMerged = null;
    eqEl.innerHTML = mfmt("2^2×3^2");
    helper.innerHTML = "이번엔 <b>밑이 달라요</b>(2와 3). 합쳐질까요? 먼저 끌어서 시도해 보세요.";
    const bw = stageW();
    later(() => makeBox("2", 2, 14, 12), 340);
    later(() => makeBox("3", 2, Math.max(8, bw - BOX_W - 14), 100), 480);
    const declare = el("button", { class: "pml-btn", text: "합칠 수 없어요", attrs: { type: "button", "aria-label": "두 상자는 합칠 수 없다고 선언하기" } }) as HTMLButtonElement;
    let tried = false;
    onBadBase = () => {
      if (tried) return;
      tried = true;
      helper.innerHTML = "그렇죠, 안 합쳐져요! 확신이 서면 아래 버튼으로 <b>선언</b>하세요.";
      declare.classList.add("pml-pulse");
    };
    declare.addEventListener("click", () => {
      if (phase !== 2 || goals.has("base")) return;
      haptic(HAPTIC.correct);
      declare.disabled = true;
      busy = true;
      readEl.innerHTML = mfmt("2^2×3^2");
      helper.innerHTML = "정답! 밑이 다르면 지수를 더할 수 없어요. 곱으로 <b>나란히 둘 뿐</b>이에요.";
      toast("못 합치는 걸 아는 것도 실력이에요!");
      goals.on("base", "못 합쳐요!");
      later(() => {
        ctlEl.innerHTML = "";
        phase3();
      }, 2000);
    });
    later(() => {
      ctlEl.replaceChildren(declare);
      later(() => declare.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
      busy = false;
    }, 900);
  }

  /* ============================== 국면 3: 상자 복제 ============================== */
  function phase3(): void {
    phase = 3;
    clearBoxes();
    readEl.innerHTML = "";
    onBadBase = null;
    eqEl.textContent = "(a³)²";
    helper.innerHTML = "(a³)²는 <b>a³을 2번</b> 곱하라는 뜻이에요.";
    const bw = stageW();
    const x0 = Math.max(8, Math.round(bw / 2 - BOX_W - 10));
    let home: Box | null = null;
    later(() => {
      home = makeBox("a", 3, x0, 44);
    }, 340);
    onMerged = (dst) => {
      readEl.innerHTML = mfmt("a^3×a^3 = a^6");
      helper.innerHTML = "칩은 3개씩 2상자, 3×2=<b>6개</b>! (a³)²=a⁶, 괄호의 지수는 <b>지수끼리 곱해요</b>.";
      toast("3×2=6, a⁶ 완성!");
      goals.on("clone", "3×2=6!");
      void dst;
      later(maybeFinish, 400);
    };
    later(() => {
      ask(
        "a³ 상자를 2번 반복해 곱하면 칩은 모두 몇 개, 즉 뭐가 될까요?",
        [
          { html: choiceHtml("a^6", "3개씩 2상자, 3×2"), good: true },
          {
            html: choiceHtml("a^5", "지수끼리 3+2"),
            good: false,
            fix: "이번엔 덧셈이 아니에요! 3개들이 상자가 2상자니까 3×2=6개예요.",
          },
        ],
        () => {
          busy = false; // ask()가 세운 잠금 해제 — 안 풀면 복제 버튼 클릭이 무시된다
          const rep = el("button", { class: "pml-btn pml-pulse", text: "2번 반복", attrs: { type: "button", "aria-label": "a의 3제곱 상자를 복제해 2번 반복하기" } }) as HTMLButtonElement;
          rep.addEventListener("click", () => {
            if (phase !== 3 || !home || busy) return;
            busy = true;
            rep.disabled = true;
            haptic(HAPTIC.select);
            toast("뿅! a³ 상자가 하나 더 생겼어요");
            const cl = makeBox("a", 3, Math.min(stageW() - BOX_W - 8, home.x + BOX_W + 20), home.y);
            helper.innerHTML = "똑같은 a³ 상자가 나란히 2개, 이제 하나로 합쳐져요.";
            later(() => {
              if (home) pour(cl, home);
            }, 1050);
          });
          ctlEl.replaceChildren(rep);
          later(() => rep.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
          helper.innerHTML = "버튼을 눌러 a³ 상자를 <b>복제</b>해 봐요.";
        },
      );
    }, 880);
  }

  later(phase1, 60);

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
