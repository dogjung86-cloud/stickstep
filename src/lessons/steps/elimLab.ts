// elimLab, 가감법 랩(중2 수학 Ⅱ L8, 책 80~82쪽). 두 방정식 카드를 세로로 나란히 놓고
// 변끼리 더하거나 빼서 한 미지수를 소거한다. 계수가 안 맞으면 "양변 확대경(×2·×3)"으로
// 계수의 절댓값을 맞춘 뒤 소거한다(shiftLab의 세로 뺄셈 소거 감각 계승).
// ── 스펙(구현 에이전트용) ──────────────────────────────────
// 국면 1: { 4x+2y=8800, 2x+2y=5600 } (도넛+우유 구조, 수치 자체 제작 가능) —
//         [빼기] 레버 → 같은 항 2y끼리 짝지어 포프 소멸, 2x=3200 → x=1600 →
//         ②에 대입해 y까지(대입 버튼) → 순서쌍 완성 → 목표 minus.
// 국면 2: { 3x-2y=-2, x+2y=10 } — 부호가 반대인 항은 [더하기]로 소거(-2y+2y=0,
//         mq6-q 예측: 더할까 뺄까?) → 4x=8 → 목표 plus.
// 국면 3: { 3x+2y=1, 2x-5y=7 } — 그냥 더하거나 빼면 아무것도 안 사라짐(시도해 보면
//         잔여 항 그대로 — 교육적 실패) → [×2]·[×3] 확대경을 각 카드에 적용해 6x끼리
//         맞춘 뒤 빼기 → 19y=-19 → 목표 zoom.
// 목표 칩 3: minus·plus·zoom. 문법: mboard+goalChips+mtoast, CSS 트랜지션+setTimeout(Set),
// rAF 금지. 세로 정렬 카드+항 소멸 연출은 shiftLab(.sfl-cell.poof) 톤 계승, 클래스는 자체 접두.
// 스타일은 math2.css의 .eml-* 섹션(스니펫 보고).
// ── 구현 노트 ─────────────────────────────────────────────
// 두 카드와 결과 행이 같은 그리드 열(.eml-grid)을 공유해 세로 필산처럼 항이 정렬된다.
// 레버(더하기/빼기)가 곧 예측 선택지: 잘못 고르면 잔여 항이 그대로 남는 실패를 목격하고
// 결과 행이 포프로 물러난다. 확대경(×2·×3)은 카드 단위로만 적용(한 변만 곱하기 원천 차단).
// busy는 모든 분기 종착점(arm/askOp 설치·실패 복귀·완주)에서 해제한다.
import { el, clear } from "../../core/dom";
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

interface EqT {
  a: number; // x 계수
  b: number; // y 계수
  c: number; // 상수(우변)
}
type Op = "add" | "sub";

/** 항 표기: term(4,"x",true)="4x", term(-2,"y",false)="-2y", term(-19,"",true)="-19". */
function term(v: number, sym: string, lead: boolean): string {
  if (v === 0) return "0";
  const sign = v < 0 ? "-" : lead ? "" : "+";
  const a = Math.abs(v);
  const coef = sym && a === 1 ? "" : String(a);
  return `${sign}${coef}${sym}`;
}

export const elimLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "minus", label: "빼서 지우기", sub: "같은 항끼리" },
    { id: "plus", label: "더해서 지우기", sub: "반대 부호" },
    { id: "zoom", label: "확대경", sub: "계수 맞추기" },
  ]);

  /* ---------- 무대: 세로 정렬 방정식 카드 2장 + 가로줄 + 결과 행 ---------- */
  interface CardUI {
    el: HTMLElement;
    x: HTMLElement;
    y: HTMLElement;
    c: HTMLElement;
    zoom: HTMLElement;
    badge: HTMLElement;
  }
  function mkCard(tag: string): CardUI {
    const x = el("span", { class: "eml-cell" });
    const y = el("span", { class: "eml-cell" });
    const q = el("span", { class: "eml-cell eq", text: "=" });
    const c = el("span", { class: "eml-cell" });
    const zoom = el("div", { class: "eml-zoom" });
    const badge = el("span", { class: "eml-mul", attrs: { "aria-hidden": "true" } });
    const card = el(
      "div",
      { class: "eml-card eml-grid" },
      el("span", { class: "eml-ctag", text: tag }),
      x,
      y,
      q,
      c,
      zoom,
      badge,
    );
    return { el: card, x, y, c, zoom, badge };
  }
  const card1 = mkCard("①");
  const card2 = mkCard("②");
  const rule = el("div", { class: "eml-rule", attrs: { "aria-hidden": "true" } });
  const work = el("div", { class: "eml-work" }, card1.el, card2.el, rule);
  const stage = el("div", { class: "eml-stage" }, work);
  // mq6 패널 문법: inst → eqs → qline(판단 질문은 선택지 바로 위) → ctl
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst" });
  const eqs = el("div", { class: "mq6-eqs" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, eqs, qline, ctl);
  const board = mboard(400);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(goals.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ---------- 상태 ---------- */
  const P1 = { e1: { a: 4, b: 2, c: 8800 }, e2: { a: 2, b: 2, c: 5600 } };
  const P2 = { e1: { a: 3, b: -2, c: -2 }, e2: { a: 1, b: 2, c: 10 } };
  const P3 = { e1: { a: 3, b: 2, c: 1 }, e2: { a: 2, b: -5, c: 7 } };
  let e1: EqT = { ...P1.e1 };
  let e2: EqT = { ...P1.e2 };
  let busy = true;
  let finished = false;
  let used1 = false; // 국면 3: 카드별 확대경 1회 사용
  let used2 = false;

  function maybeDone(): void {
    if (finished || goals.count() < 3) return;
    finished = true;
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  function paint(u: CardUI, q: EqT, flash = false): void {
    u.x.innerHTML = mfmt(term(q.a, "x", true));
    u.y.innerHTML = mfmt(term(q.b, "y", false));
    u.c.innerHTML = mfmt(term(q.c, "", true));
    if (flash)
      [u.x, u.y, u.c].forEach((cellEl) => {
        cellEl.classList.remove("flash");
        void cellEl.offsetWidth;
        cellEl.classList.add("flash");
      });
  }
  function setEqs(p: { e1: EqT; e2: EqT }, flash = false): void {
    e1 = { ...p.e1 };
    e2 = { ...p.e2 };
    paint(card1, e1, flash);
    paint(card2, e2, flash);
  }

  /* ---------- 패널 도우미 ---------- */
  function pushEq(src: string, note?: string): void {
    eqs.appendChild(
      el("div", { class: "mq6-eq mq6-pop", html: `${mfmt(src)}${note ? `<span>${note}</span>` : ""}` }),
    );
  }
  function pushPair(pair: string, label: string): void {
    eqs.appendChild(el("div", { class: "eml-pair mq6-pop", html: `${label} ${mfmt(pair)}` }));
  }
  /** 진행 버튼 하나를 ctl에 장착. 설치가 곧 입력 개방(busy 해제 지점). */
  function arm(label: string, on: () => void): void {
    clear(ctl);
    const b = el("button", { class: "eml-btn go pulse", html: label, attrs: { type: "button" } });
    b.addEventListener("click", () => {
      if (busy || b.disabled) return;
      busy = true;
      b.disabled = true;
      b.classList.remove("pulse");
      haptic(HAPTIC.select);
      on();
    });
    ctl.appendChild(b);
    later(() => b.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    busy = false;
  }

  /* ---------- 변끼리 연산(세로 필산 연출) ---------- */
  let res: HTMLElement | null = null;
  function clearRes(): void {
    res?.remove();
    res = null;
    rule.classList.remove("show");
  }
  /** 열 단위로 하이라이트→결과 셀 팝. 0이 된 항은 초록 "0" 뒤 포프 소멸. */
  function runOp(op: Op, done: (eliminated: boolean, ra: number, rb: number, rc: number) => void): void {
    clearRes();
    const ra = op === "add" ? e1.a + e2.a : e1.a - e2.a;
    const rb = op === "add" ? e1.b + e2.b : e1.b - e2.b;
    const rc = op === "add" ? e1.c + e2.c : e1.c - e2.c;
    rule.classList.add("show");
    const rx = el("span", { class: "eml-cell" });
    const ry = el("span", { class: "eml-cell" });
    const rq = el("span", { class: "eml-cell eq", text: "=" });
    const rcl = el("span", { class: "eml-cell" });
    res = el(
      "div",
      { class: "eml-res eml-grid" },
      el("span", { class: "eml-op", text: op === "add" ? "+" : "−" }),
      rx,
      ry,
      rq,
      rcl,
    );
    work.appendChild(res);
    const col = (
      s1: HTMLElement,
      s2: HTMLElement,
      cellEl: HTMLElement,
      v: number,
      sym: string,
      lead: boolean,
      at: number,
    ): void => {
      later(() => {
        s1.classList.add("hl");
        s2.classList.add("hl");
        later(() => {
          s1.classList.remove("hl");
          s2.classList.remove("hl");
        }, 950);
        if (v === 0 && sym) {
          cellEl.textContent = "0";
          cellEl.classList.add("zero", "mq6-pop");
          later(() => cellEl.classList.add("poof"), 850);
        } else {
          cellEl.innerHTML = mfmt(term(v, sym, lead));
          cellEl.classList.add("mq6-pop");
        }
        haptic(HAPTIC.tap);
      }, at);
    };
    col(card1.x, card2.x, rx, ra, "x", true, 220);
    col(card1.y, card2.y, ry, rb, "y", ra === 0, 580);
    col(card1.c, card2.c, rcl, rc, "", true, 940);
    later(() => done(ra === 0 || rb === 0, ra, rb, rc), 1500);
  }
  /** 교육적 실패: 결과 행이 흔들리고 포프로 물러난다. onDone에서 반드시 입력 재개방. */
  function failRetract(msg: string, onDone: () => void): void {
    haptic(HAPTIC.wrong);
    res?.classList.add("shake");
    toast(msg);
    later(() => {
      res?.querySelectorAll(".eml-cell").forEach((cEl) => cEl.classList.add("poof"));
    }, 1900);
    later(() => {
      clearRes();
      onDone();
    }, 2350);
  }
  /** 판단 질문(.mq6-q) + 레버 2개가 곧 예측 선택지. 정답 레버만 소거에 성공한다. */
  function askOp(
    q: string,
    correct: Op | null,
    failMsg: (op: Op) => string,
    onWin: (ra: number, rb: number, rc: number) => void,
    onFailAdvance?: () => void,
  ): void {
    qline.innerHTML = q;
    clear(ctl);
    const row = el("div", { class: "mq6-choices" });
    (["add", "sub"] as Op[]).forEach((op) => {
      const btn = el("button", {
        class: "mq6-choice",
        text: op === "add" ? "변끼리 더하기" : "변끼리 빼기",
        attrs: { type: "button" },
      });
      btn.addEventListener("click", () => {
        if (busy) return;
        busy = true;
        haptic(HAPTIC.select);
        row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
        runOp(op, (ok, ra, rb, rc) => {
          if (ok && (correct === null || op === correct)) {
            btn.classList.add("ok");
            qline.innerHTML = "";
            onWin(ra, rb, rc);
          } else {
            btn.classList.add("no");
            failRetract(failMsg(op), () => {
              if (onFailAdvance) {
                onFailAdvance();
              } else {
                row.querySelectorAll("button").forEach((x) => {
                  (x as HTMLButtonElement).disabled = false;
                  x.classList.remove("no");
                });
                busy = false; // 재도전 개방
              }
            });
          }
        });
      });
      row.appendChild(btn);
    });
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    busy = false; // 예측 선택 개방(ask 콜백 busy 해제 규칙)
  }

  /* ---------- 국면 1: 같은 항은 빼서 지우기(도넛+우유 영수증) ---------- */
  function startP1(): void {
    setEqs(P1);
    inst.innerHTML = `도넛 한 개 ${mfmt("x")}원, 우유 한 잔 ${mfmt("y")}원. ① 도넛 넷에 우유 둘은 8800원, ② 도넛 둘에 우유 둘은 5600원!`;
    helper.innerHTML =
      "두 식이 세로로 나란해요. 위아래로 겹치는 <b>같은 항 +2y</b>가 보이죠? 변끼리 빼면 무슨 일이 생길까요.";
    arm("변끼리 빼기", () => {
      runOp("sub", (_ok, ra, _rb, rc) => {
        haptic(HAPTIC.correct);
        toast("2y−2y=0! 같은 항끼리 빼니 y가 감쪽같이 사라졌어요");
        pushEq(`${term(ra, "x", true)}=${term(rc, "", true)}`, "y가 지워졌어요");
        later(() => arm("양변 ÷2", p1Div), 900);
      });
    });
  }
  function p1Div(): void {
    pushEq("x=1600", "도넛 한 개 값!");
    haptic(HAPTIC.correct);
    later(() => arm("②에 대입하기", p1Subst), 700);
  }
  function p1Subst(): void {
    pushEq("2×1600+2y=5600", "②의 x 자리에 1600");
    later(() => pushEq("2y=2400", "3200을 오른쪽으로"), 700);
    later(() => pushEq("y=1200", "우유 한 잔 값!"), 1400);
    later(() => {
      pushPair("(x, y)=(1600, 1200)", "빼기 한 방으로 해 완성!");
      goals.on("minus", "(1600, 1200)!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "같은 항은 <b>빼면</b> 지워져요. 그럼 부호가 반대인 항끼리 만나면요?";
      arm("다음 판: 부호가 반대", startP2);
    }, 2100);
  }

  /* ---------- 국면 2: 부호가 반대인 항은 더해서 지우기(더할까 뺄까 예측) ---------- */
  function startP2(): void {
    clear(eqs);
    clearRes();
    setEqs(P2, true);
    inst.innerHTML = `이번 판: ① ${mfmt("3x-2y=-2")}, ② ${mfmt("x+2y=10")}. y의 부호가 서로 반대예요`;
    helper.innerHTML = "−2y와 +2y. 이번엔 어느 레버가 y를 지울까요? 직접 골라 확인해요.";
    askOp(
      "부호가 반대인 −2y와 +2y, 더할까요 뺄까요?",
      "add",
      () => "−2y−(+2y)=−4y! 부호가 반대일 땐 빼면 오히려 커져요. 더해야 0이 돼요",
      (ra, _rb, rc) => {
        haptic(HAPTIC.correct);
        toast("−2y+2y=0! 부호가 반대인 항은 더해서 지워요");
        pushEq(`${term(ra, "x", true)}=${term(rc, "", true)}`, "y가 지워졌어요");
        later(() => arm("양변 ÷4", p2Div), 900);
      },
    );
  }
  function p2Div(): void {
    pushEq("x=2");
    later(() => pushEq("2+2y=10", "②에 x=2 대입"), 700);
    later(() => pushEq("y=4"), 1400);
    later(() => {
      pushPair("(x, y)=(2, 4)", "더하기로도 지웠어요!");
      goals.on("plus", "(2, 4)!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "같은 항은 빼고, 반대 항은 더한다! 그런데 <b>계수가 아예 다르면</b>요?";
      arm("다음 판: 계수가 달라요", startP3);
    }, 2100);
  }

  /* ---------- 국면 3: 계수가 다르면 확대경(×2·×3)으로 맞춘 뒤 소거 ---------- */
  function startP3(): void {
    clear(eqs);
    clearRes();
    setEqs(P3, true);
    used1 = false;
    used2 = false;
    inst.innerHTML = `마지막 판: ① ${mfmt("3x+2y=1")}, ② ${mfmt("2x-5y=7")}. 계수가 하나도 안 맞네요`;
    helper.innerHTML = "짝이 맞는 항이 없어요. 정말 안 지워지는지 <b>직접 확인</b>부터!";
    askOp(
      "이대로 더하거나 빼면, 뭐가 지워질까요? 직접 해 봐요!",
      null,
      () => "x도 y도 그대로 남았어요! 계수의 절댓값이 다르면 더해도 빼도 안 지워져요",
      () => undefined,
      enterZoom,
    );
  }
  /** 실패를 목격한 뒤: 카드 옆에 확대경 버튼 등장. */
  function enterZoom(): void {
    work.classList.add("zoomy");
    mkZoom(card1, 1);
    mkZoom(card2, 2);
    inst.innerHTML = "확대경 등장! 누르면 <b>그 식의 양변 전체</b>에 똑같이 곱해져요";
    qline.innerHTML = "x의 계수 3과 2, 카드마다 확대경을 하나씩 골라 <b>같게</b> 만들어 봐요";
    helper.innerHTML = "확대경은 카드째로만 걸려요. 한 변만 키우면 등식이 깨지니까요!";
    clear(ctl);
    busy = false; // 확대경 조작 개방
  }
  function mkZoom(u: CardUI, which: 1 | 2): void {
    clear(u.zoom);
    ([2, 3] as const).forEach((k) => {
      const b = el("button", {
        class: "eml-zbtn",
        text: `×${k}`,
        attrs: { type: "button", "aria-label": `${which === 1 ? "①" : "②"} 양변에 ${k} 곱하기` },
      });
      b.addEventListener("click", () => mulCard(u, which, k));
      u.zoom.appendChild(b);
    });
  }
  /** 확대경: 카드 전체가 살짝 커졌다 돌아오며 계수·상수 전부 갱신(카드 단위 적용). */
  function mulCard(u: CardUI, which: 1 | 2, k: number): void {
    if (busy || (which === 1 ? used1 : used2)) return;
    busy = true;
    haptic(HAPTIC.select);
    if (which === 1) {
      used1 = true;
      e1 = { a: e1.a * k, b: e1.b * k, c: e1.c * k };
      paint(card1, e1, true);
    } else {
      used2 = true;
      e2 = { a: e2.a * k, b: e2.b * k, c: e2.c * k };
      paint(card2, e2, true);
    }
    u.el.classList.remove("zoomed");
    void u.el.offsetWidth;
    u.el.classList.add("zoomed");
    u.badge.textContent = `×${k}`;
    u.badge.classList.add("show");
    u.zoom.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
    toast(`양변 전체에 ×${k}! 한 변만 곱하면 등식이 깨져요`);
    later(checkMatch, 750);
  }
  function checkMatch(): void {
    const matched = Math.abs(e1.a) === Math.abs(e2.a) || Math.abs(e1.b) === Math.abs(e2.b);
    if (matched) {
      haptic(HAPTIC.correct);
      inst.innerHTML = `계수 맞추기 성공! 양쪽 x 항이 똑같이 ${mfmt(term(e1.a, "x", true))} 로 모였어요`;
      askOp(
        "6x와 6x, 부호가 같아요. 더할까요 뺄까요?",
        "sub",
        () => "6x+6x=12x! 같은 부호끼리 더하면 두 배가 돼요. 같은 항은 빼야 0!",
        p3Win,
      );
    } else if (used1 && used2) {
      toast("계수가 아직 안 맞아요. 3과 2에 각각 무엇을 곱해야 같아질까요?");
      arm("다시 맞추기", () => {
        setEqs(P3, true);
        used1 = false;
        used2 = false;
        card1.badge.classList.remove("show");
        card2.badge.classList.remove("show");
        [card1, card2].forEach((u) =>
          u.zoom.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = false)),
        );
        toast("처음부터! x의 계수 3과 2를 노려 봐요");
        clear(ctl);
        busy = false; // 확대경 재도전 개방
      });
    } else {
      busy = false; // 남은 카드의 확대경을 기다림
    }
  }
  function p3Win(_ra: number, rb: number, rc: number): void {
    haptic(HAPTIC.correct);
    toast("6x−6x=0! 확대경으로 짝을 만들고, 빼서 지웠어요");
    pushEq(`${term(rb, "y", true)}=${term(rc, "", true)}`, "x가 지워졌어요");
    later(() => arm("양변 ÷19", p3Div), 900);
  }
  function p3Div(): void {
    pushEq("y=-1");
    later(() => pushEq("3x+2×(-1)=1", "①에 y=−1 대입"), 700);
    later(() => pushEq("3x=3", "−2를 오른쪽으로"), 1400);
    later(() => pushEq("x=1"), 2100);
    later(() => {
      pushPair("(x, y)=(1, -1)", "확대경까지, 완주!");
      goals.on("zoom", "(1, −1)!");
      haptic(HAPTIC.correct);
      eqs.appendChild(
        el("div", {
          class: "mq6-concl mq6-pop",
          html:
            "두 식을 <b>변끼리 더하거나 빼서</b> 미지수를 지우는(소거하는) 풀이법이 <b>가감법</b>이에요. 계수가 다르면 확대경처럼 <b>양변을 통째로</b> 곱해 짝부터 맞추고요!",
        }),
      );
      helper.innerHTML = "같은 부호는 빼고, 반대 부호는 더하고, 계수가 다르면 확대경! 가감법 완전 정복이에요.";
      qline.innerHTML = "";
      clear(ctl);
      maybeDone();
      busy = false;
    }, 2800);
  }

  api.setCTA("세 판을 완주하면 열려요", { enabled: false });
  startP1();

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
