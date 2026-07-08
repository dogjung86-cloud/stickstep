// solveLab — 이항 랩(Ⅱ 일차방정식). 항 칩을 등호 너머로 드래그하면 부호가 뒤집힌다.
//   좌·우 두 구역에 항 칩(ax / 상수) — 칩을 반대편으로 끌면(탭-탭 폴백) 부호 반전 + 자동 동류항 정리.
//   좌변이 ax, 우변이 상수만 남으면 "양변 ÷a" 버튼 등장 → x=(수) 완성.
//   미션: ① x+7=10 ② 5x-4=3x+8 ③ 4x+2=x+11. 어느 방향으로 옮겨도 수학적으로 처리된다.
// rAF 금지 — 칩 이동은 left/top 트랜지션(셈돌 관례), setPointerCapture는 try/catch.
import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface SolveStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Term {
  x: boolean; // x항 여부
  v: number; // 계수 또는 상수값
  side: "L" | "R";
  elm: HTMLElement;
  px: number;
  py: number;
  alive: boolean;
}

const BOARD_H = 250;
const CHIP_H = 46;

const MISSIONS: { l: [number, number]; r: [number, number]; label: string; goal: string }[] = [
  // l/r = [x계수, 상수]
  { l: [1, 7], r: [0, 10], label: "x+7=10", goal: "g1" },
  { l: [5, -4], r: [3, 8], label: "5x-4=3x+8", goal: "g2" },
  { l: [4, 2], r: [1, 11], label: "4x+2=x+11", goal: "g3" },
];

/** 항 표기: x항 "5x"/"-x", 상수 "+7"/"-4"(맨 앞이면 부호 그대로). */
function termSrc(x: boolean, v: number, lead: boolean): string {
  const sign = v < 0 ? "-" : lead ? "" : "+";
  const a = Math.abs(v);
  if (x) return `${sign}${a === 1 ? "" : a}x`;
  return `${sign}${a}`;
}

export const solveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SolveStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "g1", label: "첫 이항", sub: "x+7=10" },
    { id: "g2", label: "양쪽 정리", sub: "5x-4=3x+8" },
    { id: "g3", label: "혼자 힘으로", sub: "4x+2=x+11" },
  ]);
  const eqRead = el("div", { class: "nw-expr" });
  const board = mboard(BOARD_H);
  const toast = mtoast(board);
  // 등호 분리선(가운데) — 강처럼
  const divider = el("div", {
    style:
      `position:absolute; left:50%; top:10px; bottom:10px; width:2px; transform:translateX(-50%);` +
      `background:repeating-linear-gradient(180deg, rgba(13,165,198,.5) 0 8px, transparent 8px 16px); border-radius:2px;`,
    attrs: { "aria-hidden": "true" },
  });
  const eqSign = el("div", {
    style:
      `position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:34px; height:34px; border-radius:50%;` +
      `background:#fff; border:1.5px solid var(--n200); box-shadow: var(--sh-card); display:grid; place-items:center;` +
      `font-size:19px; font-weight:900; color:var(--n700); z-index:2;`,
    text: "=",
    attrs: { "aria-hidden": "true" },
  });
  board.append(divider, eqSign);
  const actions = el("div", { class: "ct-actions" });
  const helper = el("div", { class: "helper" });
  host.append(goals.el, eqRead, board, actions, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let terms: Term[] = [];
  let mi = 0;
  let solving = false; // 정리 애니 중 입력 잠금
  let solved = false;

  const bw = (): number => board.clientWidth || 340;
  const put = (t: Term, x: number, y: number, trans = ""): void => {
    t.px = x;
    t.py = y;
    t.elm.style.transition = trans ? `left ${trans}, top ${trans}` : "";
    t.elm.style.left = `${x}px`;
    t.elm.style.top = `${y}px`;
    if (trans)
      later(() => {
        t.elm.style.transition = "";
      }, 480);
  };

  /** 한 변의 칩들을 정렬 배치. */
  function layoutSide(side: "L" | "R"): void {
    const list = terms.filter((t) => t.alive && t.side === side);
    const cx = side === "L" ? bw() * 0.25 : bw() * 0.75;
    list.forEach((t, i) => {
      const y = BOARD_H / 2 - (list.length * (CHIP_H + 12) - 12) / 2 + i * (CHIP_H + 12);
      put(t, cx - t.elm.offsetWidth / 2, y, ".4s var(--spring-soft)");
    });
  }

  function paintChip(t: Term): void {
    const lead = true;
    t.elm.innerHTML = mfmt(termSrc(t.x, t.v, lead && t.v >= 0 ? true : false));
    t.elm.classList.toggle("alt", false);
    t.elm.classList.toggle("const", !t.x);
  }

  function mkTerm(x: boolean, v: number, side: "L" | "R"): Term {
    const t: Term = {
      x,
      v,
      side,
      px: 0,
      py: 0,
      alive: true,
      elm: el("div", { class: `tm-chip ${x ? "" : "const"}`, style: "position:absolute; left:0; top:0;", attrs: { role: "button" } }),
    };
    paintChip(t);
    board.appendChild(t.elm);
    terms.push(t);
    bindDrag(t);
    return t;
  }

  function eqSrc(): string {
    const side = (sd: "L" | "R"): string => {
      const list = terms.filter((t) => t.alive && t.side === sd);
      if (!list.length) return "0";
      // x항 먼저
      list.sort((a, b) => Number(b.x) - Number(a.x));
      return list.map((t, i) => termSrc(t.x, t.v, i === 0)).join("");
    };
    return `${side("L")} = ${side("R")}`;
  }

  function paintEq(): void {
    eqRead.innerHTML = mfmt(eqSrc());
  }

  /** 같은 변의 동류항 자동 정리(하나로 합침). */
  function combine(side: "L" | "R", then: () => void): void {
    const list = terms.filter((t) => t.alive && t.side === side);
    const xs = list.filter((t) => t.x);
    const cs = list.filter((t) => !t.x);
    let merged = false;
    const mergeGroup = (grp: Term[]): void => {
      if (grp.length < 2) return;
      merged = true;
      const sum = grp.reduce((m, t) => m + t.v, 0);
      const keep = grp[0];
      grp.slice(1).forEach((t) => {
        t.alive = false;
        put(t, keep.px, keep.py, ".3s ease");
        t.elm.style.opacity = "0";
        const dead = t.elm;
        later(() => dead.remove(), 340);
      });
      keep.v = sum;
      if (sum === 0) {
        keep.alive = false;
        keep.elm.style.opacity = "0";
        keep.elm.style.transform = "scale(.4)";
        const dead = keep.elm;
        later(() => dead.remove(), 340);
      } else {
        paintChip(keep);
        keep.elm.classList.remove("merged");
        void keep.elm.offsetWidth;
        keep.elm.classList.add("merged");
      }
    };
    mergeGroup(xs);
    mergeGroup(cs);
    later(
      () => {
        layoutSide(side);
        paintEq();
        then();
      },
      merged ? 380 : 40,
    );
  }

  /** 이항: 항 t를 반대편으로 — 부호 반전 + 플래시. */
  function transpose(t: Term): void {
    if (solving || solved) return;
    solving = true;
    haptic(HAPTIC.select);
    t.v = -t.v;
    t.side = t.side === "L" ? "R" : "L";
    paintChip(t);
    t.elm.style.boxShadow = "0 0 0 4px rgba(255,176,31,.55)";
    later(() => {
      t.elm.style.boxShadow = "";
    }, 600);
    toast("등호를 건너면 부호가 반대로!");
    layoutSide("L");
    layoutSide("R");
    later(() => {
      combine("L", () =>
        combine("R", () => {
          solving = false;
          checkState();
        }),
      );
    }, 420);
  }

  /** ax = b 형태면 ÷a 버튼, x = b면 미션 완료. */
  function checkState(): void {
    paintEq();
    actions.innerHTML = "";
    const lList = terms.filter((t) => t.alive && t.side === "L");
    const rList = terms.filter((t) => t.alive && t.side === "R");
    const norm = (xs: Term[], cs: Term[]): { a: number; b: number } | null => {
      if (xs.length === 1 && xs[0].x && cs.length <= 1 && (cs.length === 0 || !cs[0].x)) {
        return { a: xs[0].v, b: cs[0]?.v ?? 0 };
      }
      return null;
    };
    // 표준형: 좌변 x항만, 우변 상수만
    const lx = lList.filter((t) => t.x);
    const lc = lList.filter((t) => !t.x);
    const rx = rList.filter((t) => t.x);
    const rc = rList.filter((t) => !t.x);
    if (lx.length === 1 && lc.length === 0 && rx.length === 0 && rc.length <= 1) {
      const a = lx[0].v;
      const b = rc[0]?.v ?? 0;
      if (a === 1) {
        finishMission(b);
        return;
      }
      if (b % a === 0) {
        const db = el("button", { class: "ct-btn hero", html: `양변 ÷ ${a < 0 ? "(" + a + ")" : a}`, attrs: { type: "button" } });
        db.addEventListener("click", () => {
          haptic(HAPTIC.select);
          lx[0].v = 1;
          paintChip(lx[0]);
          if (rc[0]) {
            rc[0].v = b / a;
            paintChip(rc[0]);
          } else {
            mkTerm(false, 0, "R");
          }
          layoutSide("L");
          layoutSide("R");
          later(() => finishMission(b / a), 460);
        });
        actions.appendChild(db);
        helper.innerHTML = `이제 <b>${mfmt(eqSrc())}</b> — 마지막 성질, <b>양변 나누기</b>로 x만 남겨요!`;
      }
      return;
    }
    void norm;
    // 안내: 아직 섞여 있음
    if (!solved) {
      helper.innerHTML =
        "<b>x 항은 왼쪽으로, 상수는 오른쪽으로</b> — 칩을 등호 너머로 끌어 보내세요(탭 → 반대편 탭도 돼요).";
    }
  }

  function finishMission(ans: number): void {
    if (solved) return;
    solved = true;
    actions.innerHTML = ""; // 남은 ÷ 버튼 정리
    haptic(HAPTIC.correct);
    eqRead.innerHTML = mfmt(`x = ${ans}`);
    toast(`x = ${ans}!`);
    const m = MISSIONS[mi];
    goals.on(m.goal, `x=${ans}!`);
    if (mi + 1 < MISSIONS.length) {
      helper.innerHTML =
        mi === 0
          ? "이항 성공! 겉보기엔 순간이동이지만 정체는 <b>양변에서 같은 수 빼기</b>예요. 다음 방정식!"
          : "좋아요 — x는 왼쪽, 상수는 오른쪽으로 모으는 흐름이 손에 익었죠? 마지막 문제!";
      later(() => setupMission(mi + 1), 2300);
    } else {
      helper.innerHTML =
        "완주! <b>이항 → 동류항 정리 → 양변 나누기</b> — 일차방정식 풀이의 세 박자예요. 이제 어떤 방정식이 와도 이 순서로!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  }

  /* ---------- 드래그 + 탭-탭 ---------- */
  let drag: { t: Term; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null = null;
  let pendingTap: Term | null = null;

  function bindDrag(t: Term): void {
    t.elm.addEventListener("pointerdown", (e) => {
      if (solving || solved || !t.alive || drag) return;
      try {
        t.elm.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 포인터 안전 */
      }
      drag = { t, sx: e.clientX, sy: e.clientY, ox: t.px, oy: t.py, moved: false };
    });
    t.elm.addEventListener("pointermove", (e) => {
      if (!drag || drag.t !== t) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) > 7) {
        drag.moved = true;
        t.elm.classList.add("drag");
      }
      if (!drag.moved) return;
      t.px = clamp(drag.ox + dx, 2, bw() - t.elm.offsetWidth - 2);
      t.py = clamp(drag.oy + dy, 2, BOARD_H - CHIP_H - 2);
      t.elm.style.left = `${t.px}px`;
      t.elm.style.top = `${t.py}px`;
    });
    const up = (): void => {
      if (!drag || drag.t !== t) return;
      const d = drag;
      drag = null;
      t.elm.classList.remove("drag");
      if (solving || solved) return;
      if (!d.moved) {
        // 탭-탭: 칩 선택 → 반대편 보드 탭은 board 리스너가 처리
        if (pendingTap === t) {
          pendingTap = null;
          t.elm.style.outline = "";
        } else {
          if (pendingTap) pendingTap.elm.style.outline = "";
          pendingTap = t;
          t.elm.style.outline = "3px solid rgba(13,165,198,.55)";
        }
        return;
      }
      // 드롭: 중앙선을 넘었는가?
      const center = t.px + t.elm.offsetWidth / 2;
      const crossed = (t.side === "L" && center > bw() / 2) || (t.side === "R" && center < bw() / 2);
      if (crossed) transpose(t);
      else layoutSide(t.side);
    };
    t.elm.addEventListener("pointerup", up);
    t.elm.addEventListener("pointercancel", up);
  }
  board.addEventListener("pointerdown", (e) => {
    if (!pendingTap || solving || solved) return;
    if ((e.target as HTMLElement).closest(".tm-chip")) return;
    const r = board.getBoundingClientRect();
    const half = e.clientX - r.left > r.width / 2 ? "R" : "L";
    const t = pendingTap;
    pendingTap = null;
    t.elm.style.outline = "";
    if (half !== t.side) transpose(t);
  });

  /* ---------- 미션 셋업 ---------- */
  function setupMission(i: number): void {
    mi = i;
    solved = false;
    solving = false;
    pendingTap = null;
    terms.forEach((t) => t.elm.remove());
    terms = [];
    actions.innerHTML = "";
    const m = MISSIONS[i];
    if (m.l[0]) mkTerm(true, m.l[0], "L");
    if (m.l[1]) mkTerm(false, m.l[1], "L");
    if (m.r[0]) mkTerm(true, m.r[0], "R");
    if (m.r[1]) mkTerm(false, m.r[1], "R");
    later(() => {
      layoutSide("L");
      layoutSide("R");
      paintEq();
    }, 40);
    helper.innerHTML =
      i === 0
        ? `첫 문제 ${mfmt("x+7=10")} — <b>+7 칩을 등호 너머로</b> 끌어 보내면 무슨 일이 벌어질까요?`
        : i === 1
          ? `${mfmt("5x-4=3x+8")} — <b>x 항은 왼쪽으로, 상수는 오른쪽으로</b> 모아 보세요. 순서는 자유!`
          : `마지막 ${mfmt("4x+2=x+11")} — 안내 없이 혼자 풀어 봐요!`;
  }

  setupMission(0);
  api.setCTA("방정식 3개를 풀면 열려요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
