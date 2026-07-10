// powDivLab, 거듭제곱 나눗셈·분배 랩(중2 수학 Ⅰ L6, 책 31~34쪽). 분수 꼴 분자·분모의
// 같은 칩을 짝지어 상쇄(약분)하며 나눗셈의 세 운명(m>n·m=n·m<n)을 가르고,
// 괄호 거듭제곱 (ab)ᵐ은 상자를 열어 전원에 지수를 나눠 준다.
// ── 스펙 ──────────────────────────────────────────────────
// 국면 1: a⁵/a³ — 분자 a 칩 5개, 분모 a 칩 3개(가로 분수선 위아래). 위·아래 칩을 하나씩
//         탭하면 쌍이 빗금과 함께 상쇄 소멸. 다 지우면 위에 2개 생존 → a². "지수는 5−3".
//         세 운명 결과판의 첫 슬롯을 채운다(목표 칩은 아직 아님).
// 국면 2: a³/a³ — 상쇄 전 예측(1 / 0 / a — 0이 대표 오개념) → 전부 소멸 →
//         "남은 게 없으면 0이 아니라 1!" → 목표 one.
// 국면 3: a³/a⁵ — 아래에 2개 생존 → 1/a²(빈 분자 자리는 1이 지킨다) →
//         세 운명 결과판(위 생존/전멸=1/아래 생존) 완성 → 목표 fate.
// 국면 4 "괄호 분배": (2a)³ 상자 — 예측(8a³ / 2a³ — 2a³은 수를 빼먹는 오개념) → 상자를
//         탭하면 2a·2a·2a 세 묶음으로 펼쳐지고 수끼리(2×2×2=8)·문자끼리(a³) 헤쳐 모여 →
//         8a³. "괄호 안 전원에게!" → 목표 dist.
// 목표 칩 3: one(전멸=1 발견) · fate(세 운명 완성) · dist(괄호 분배).
// ── 구현 노트 ─────────────────────────────────────────────
// 칩 배치는 left/top(px)만 쓴다(transform은 born/poof/slash 키프레임 몫 — counterLab 규칙).
// 판단 질문은 .pdl-q 강조 줄로 선택지 버튼 바로 위(mq6-q 문법 계승, calc 그레이프 톤).
// 모션은 전부 CSS 트랜지션/키프레임 + setTimeout 체인(타이머 Set 일괄 해제), rAF 금지.
// (2a)³ 같은 괄호 지수는 mfmt가 못 그리므로(")^" 미지원) 텍스트 유니코드 위첨자로 쓰고,
// 결과식은 mfmt("2a×2a×2a = 8a^3")·mfmt("a^3÷a^5 = 1/a^2") 꼴만 쓴다.
// 스타일은 math2.css의 .pdl-* 섹션. 참조 구현: counterLab(상쇄 연출·left/top), likeTerms.
import { el } from "../../core/dom";
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

interface Chip {
  elm: HTMLElement;
  row: "top" | "bot";
  alive: boolean;
  x: number;
  y: number;
}

const SZ = 38; // 칩 지름(px)
const TOP_Y = 26; // 분자 줄 기준 y
const BOT_Y = 118; // 분모 줄 기준 y
const RING = "0 0 0 3px #fff, 0 0 0 5px #9C36B5"; // 탭 선택 강조(인라인)

/** 세 운명 결과판 정의 — 국면 1·2·3이 슬롯을 하나씩 채운다. */
const FATES = [
  { eq: "a^5÷a^3", res: "a^2", cap: "위가 남으면" },
  { eq: "a^3÷a^3", res: "1", cap: "다 지워지면" },
  { eq: "a^3÷a^5", res: "1/a^2", cap: "아래가 남으면" },
];

export const powDivLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "one", label: "전멸하면?", sub: "a³÷a³" },
    { id: "fate", label: "세 운명", sub: "결과판 3칸" },
    { id: "dist", label: "괄호 분배", sub: "(2a)³" },
  ]);
  const board = mboard(150);
  const eqEl = el("div", { class: "pdl-eq" });
  const stage = el("div", { class: "pdl-stage" });
  const bar = el("div", { class: "pdl-bar", attrs: { "aria-hidden": "true" } });
  const labTop = el("span", { class: "pdl-rowlab", text: "분자", style: `top:${TOP_Y + 8}px` });
  const labBot = el("span", { class: "pdl-rowlab", text: "분모", style: `top:${BOT_Y + 8}px` });
  stage.append(bar, labTop, labBot);
  const fate = el("div", { class: "pdl-fate" });
  const slots: { root: HTMLElement; res: HTMLElement }[] = FATES.map((f) => {
    const res = el("div", { class: "pdl-slotres", text: "?" });
    const root = el(
      "div",
      { class: "pdl-slot" },
      el("span", { class: "pdl-slotcap", text: f.cap }),
      el("div", { class: "pdl-sloteq", html: mfmt(f.eq) }),
      res,
    );
    fate.appendChild(root);
    return { root, res };
  });
  const readEl = el("div", { class: "pdl-read" });
  const qEl = el("div", { class: "pdl-q" }); // 판단 질문 줄 — 항상 선택지 바로 위
  const ctlEl = el("div", { class: "pdl-ctl" });
  board.append(eqEl, stage, fate, readEl, qEl, ctlEl);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(goals.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("목표 세 개를 모두 달성하면 열려요", { enabled: false });

  /* ---------- 공용 상태 ---------- */
  let chips: Chip[] = [];
  let sel: Chip | null = null;
  let busy = true;
  let finished = false;
  let onCleared: (() => void) | null = null; // 국면별 상쇄 종료 훅
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

  function fillSlot(i: number): void {
    slots[i].res.innerHTML = mfmt(FATES[i].res);
    slots[i].root.classList.add("on", "pop");
    later(() => slots[i].root.classList.remove("pop"), 460);
  }

  /* ---------- 칩(left/top 배치, transform은 키프레임 몫) ---------- */
  function put(c: Chip, x: number, y: number, trans = ""): void {
    c.x = x;
    c.y = y;
    c.elm.style.transition = trans ? `left ${trans}, top ${trans}` : "";
    c.elm.style.left = `${x}px`;
    c.elm.style.top = `${y}px`;
    if (trans)
      later(() => {
        c.elm.style.transition = "";
      }, 560);
  }

  /** 가운데 정렬 한 줄 슬롯(counterLab rowSlots 문법). */
  function rowSlots(count: number, y: number): { x: number; y: number }[] {
    const w = stageW();
    const spacing = count > 1 ? Math.min(50, (w - 96) / (count - 1)) : 50;
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) out.push({ x: w / 2 - SZ / 2 + (i - (count - 1) / 2) * spacing, y });
    return out;
  }

  function setSel(c: Chip | null): void {
    if (sel) sel.elm.style.boxShadow = "";
    sel = c;
    if (sel) sel.elm.style.boxShadow = RING;
  }

  function makeChip(row: "top" | "bot", x: number, y: number): Chip {
    const elm = el("div", {
      class: "pdl-chip",
      html: mfmt("a"),
      attrs: { role: "button", tabindex: "0", "aria-label": row === "top" ? "분자의 a 칩" : "분모의 a 칩" },
    });
    const c: Chip = { elm, row, alive: true, x, y };
    elm.addEventListener("click", () => tapChip(c));
    elm.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tapChip(c);
      }
    });
    stage.appendChild(elm);
    put(c, x, y);
    elm.classList.add("born");
    later(() => elm.classList.remove("born"), 460);
    chips.push(c);
    return c;
  }

  function spawnFraction(top: number, bot: number, done?: () => void): void {
    const st = rowSlots(top, TOP_Y);
    const sb = rowSlots(bot, BOT_Y);
    st.forEach((p, i) => later(() => makeChip("top", p.x, p.y), 120 + i * 90));
    sb.forEach((p, i) => later(() => makeChip("bot", p.x, p.y), 160 + top * 90 + i * 90));
    later(() => done?.(), 200 + (top + bot) * 90 + 320);
  }

  function clearStage(): void {
    setSel(null);
    for (const c of chips) {
      c.alive = false;
      const dead = c.elm;
      dead.style.transition = "opacity .22s ease";
      dead.style.opacity = "0";
      later(() => dead.remove(), 250);
    }
    chips = [];
    stage.querySelectorAll(".pdl-one").forEach((n) => {
      const dead = n as HTMLElement;
      dead.style.transition = "opacity .22s ease";
      dead.style.opacity = "0";
      later(() => dead.remove(), 250);
    });
  }

  const aliveOf = (row: "top" | "bot"): Chip[] => chips.filter((c) => c.alive && c.row === row);

  /* ---------- 상쇄(빗금 + 페이드 소멸, counterLab 문법) ---------- */
  function tapChip(c: Chip): void {
    if (busy || !c.alive) return;
    haptic(HAPTIC.tap);
    if (sel === c) {
      setSel(null);
      return;
    }
    if (sel && sel.alive && sel.row !== c.row) {
      const a = sel;
      setSel(null);
      cancelPair(a, c);
      return;
    }
    if (sel) toast("짝은 위 하나, 아래 하나예요!");
    setSel(c);
  }

  function cancelPair(a: Chip, b: Chip): void {
    a.alive = false;
    b.alive = false;
    haptic(HAPTIC.cross);
    [a, b].forEach((c) => c.elm.classList.add("cut")); // 빗금
    later(() => {
      [a, b].forEach((c) => c.elm.classList.add("poof"));
      later(() => {
        a.elm.remove();
        b.elm.remove();
      }, 430);
    }, 300);
    // 어느 한 줄이 바닥나면 국면 종료
    if (aliveOf("top").length === 0 || aliveOf("bot").length === 0) {
      busy = true;
      later(() => onCleared?.(), 900);
    }
  }

  /** 생존 칩을 해당 줄 가운데로 정렬. */
  function lineUp(row: "top" | "bot"): void {
    const list = aliveOf(row);
    const ps = rowSlots(list.length, row === "top" ? TOP_Y : BOT_Y);
    list.forEach((c, i) => put(c, ps[i].x, ps[i].y, ".5s var(--ease-out)"));
  }

  /** 빈 분자 자리를 지키는 황금 "1" 칩. */
  function spawnOne(y: number): void {
    const one = el("div", { class: "pdl-one", text: "1", attrs: { "aria-label": "몫 1" } });
    one.style.left = `${stageW() / 2 - 25}px`;
    one.style.top = `${y}px`;
    stage.appendChild(one);
  }

  /* ---------- 판단 질문(예측) — 질문 줄은 항상 선택지 바로 위 ---------- */
  interface Choice {
    html: string;
    good: boolean;
    fix?: string;
  }
  function ask(qHtml: string, choices: Choice[], after: () => void): void {
    busy = true;
    qEl.innerHTML = qHtml;
    const list = Math.random() < 0.5 ? choices : [...choices].reverse();
    const row = el("div", { class: "pdl-choices" });
    let answered = false;
    list.forEach((c) => {
      const btn = el("button", { class: "pdl-choice", html: c.html, attrs: { type: "button" } }) as HTMLButtonElement;
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
        }, c.good ? 950 : 1700);
      });
      row.appendChild(btn);
    });
    ctlEl.replaceChildren(row);
    later(() => qEl.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  const choiceHtml = (main: string, sub: string): string => `<b>${main}</b><span class="pdl-chsub">${sub}</span>`;

  /* ============================== 국면 1: a⁵/a³ ============================== */
  function phase1(): void {
    eqEl.innerHTML = mfmt("a^5÷a^3");
    helper.innerHTML = "위와 아래의 a는 <b>짝으로 지울</b> 수 있어요(약분). 위 칩 하나, 아래 칩 하나를 차례로 탭!";
    onCleared = () => {
      lineUp("top");
      readEl.innerHTML = mfmt("a^5÷a^3 = a^2");
      helper.innerHTML = "위에 <b>2개</b> 남았어요. 지수는 <b>5−3=2</b>, 위가 더 많으면 위에 남아요!";
      toast("결과판 첫 칸 완성!");
      haptic(HAPTIC.correct);
      fillSlot(0);
      later(phase2, 2100);
    };
    spawnFraction(5, 3, () => {
      busy = false;
    });
  }

  /* ============================== 국면 2: a³/a³ ============================== */
  function phase2(): void {
    clearStage();
    readEl.innerHTML = "";
    eqEl.innerHTML = mfmt("a^3÷a^3");
    helper.innerHTML = "이번엔 위아래가 <b>똑같이 3개</b>예요.";
    onCleared = () => {
      spawnOne(TOP_Y - 8);
      readEl.innerHTML = mfmt("a^3÷a^3 = 1");
      helper.innerHTML = "남은 게 없으면 <b>0이 아니라 1</b>! 같은 수를 같은 수로 나눈 몫이니까요.";
      toast("전멸하면 1이에요!");
      goals.on("one", "0이 아니라 1!");
      fillSlot(1);
      later(phase3, 2200);
    };
    spawnFraction(3, 3, () => {
      ask(
        "전부 짝지어 지우면 마지막에 뭐가 남을까요?",
        [
          { html: choiceHtml("1이 남아요", "같은 수로 나눴으니까"), good: true },
          {
            html: choiceHtml("0이 돼요", "다 사라졌으니까"),
            good: false,
            fix: "다 지워져도 0이 아니에요! 같은 수를 같은 수로 나눈 몫은 1이에요.",
          },
          {
            html: choiceHtml("a가 남아요", "문자니까 그대로"),
            good: false,
            fix: "a도 전부 짝지어 지워져요. 같은 수로 나누면 몫은 1!",
          },
        ],
        () => {
          busy = false;
          helper.innerHTML = "직접 지워서 확인해 봐요!";
        },
      );
    });
  }

  /* ============================== 국면 3: a³/a⁵ ============================== */
  function phase3(): void {
    clearStage();
    readEl.innerHTML = "";
    eqEl.innerHTML = mfmt("a^3÷a^5");
    helper.innerHTML = "이번엔 <b>아래가 더 많아요</b>. 끝까지 지우면 어디에 남을까요?";
    onCleared = () => {
      lineUp("bot");
      spawnOne(TOP_Y - 8);
      readEl.innerHTML = mfmt("a^3÷a^5 = 1/a^2");
      helper.innerHTML = "아래에 <b>2개</b> 남으면 결과는 <b>1/a²</b>, 빈 분자 자리는 1이 지켜요. 지수는 5−3=2, 이번엔 분모에!";
      toast("세 운명 결과판 완성!");
      haptic(HAPTIC.correct);
      fillSlot(2);
      goals.on("fate", "완성!");
      later(phase4, 2200);
    };
    spawnFraction(3, 5, () => {
      busy = false;
    });
  }

  /* ============================== 국면 4: (2a)³ 괄호 분배 ============================== */
  function phase4(): void {
    clearStage();
    readEl.innerHTML = "";
    // 분수 무대 소품 정리(분수선·줄 라벨 페이드)
    [bar, labTop, labBot].forEach((n) => {
      n.style.transition = "opacity .4s ease";
      n.style.opacity = "0";
    });
    eqEl.textContent = "(2a)³";
    helper.innerHTML = "이번엔 나눗셈이 아니라 <b>괄호의 거듭제곱</b>이에요. 상자 안엔 2와 a가 함께 있어요.";
    // (2a)³ 상자: 캡 2a + 지수 배지 3
    const box = el(
      "div",
      { class: "pdl-box", attrs: { role: "button", tabindex: "0", "aria-label": "2a의 세제곱 상자, 탭해서 열기" } },
      el("span", { class: "pdl-exp", text: "3" }),
      el("div", { class: "pdl-cap", html: mfmt("2a") }),
      el("div", { class: "pdl-boxchips" }, el("span", { class: "pdl-chip mini num", text: "2" }), el("span", { class: "pdl-chip mini", html: mfmt("a") })),
    );
    let opened = false;
    const openBox = (): void => {
      if (busy || opened) return;
      opened = true;
      busy = true;
      haptic(HAPTIC.select);
      box.classList.remove("pdl-pulse");
      box.style.transition = "opacity .24s ease";
      box.style.opacity = "0";
      later(() => box.remove(), 260);
      unfold();
    };
    box.addEventListener("click", openBox);
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openBox();
      }
    });
    later(() => {
      const w = stageW();
      box.style.left = `${w / 2 - 56}px`;
      box.style.top = "34px";
      stage.appendChild(box);
      box.classList.add("born");
      later(() => box.classList.remove("born"), 460);
      ask(
        "(2a)³을 펼치면 뭐가 될까요?",
        [
          { html: `${mfmt("8a^3")}<span class="pdl-chsub">2도 세 번 곱해요</span>`, good: true },
          {
            html: `${mfmt("2a^3")}<span class="pdl-chsub">2는 그대로 둬요</span>`,
            good: false,
            fix: "2도 괄호 안에 있어요! 괄호의 지수 3은 안의 전원에게 가요. 2×2×2=8.",
          },
        ],
        () => {
          busy = false;
          helper.innerHTML = "상자를 <b>탭</b>해서 열어 봐요!";
          box.classList.add("pdl-pulse");
        },
      );
    }, 500);

    /** 상자 열기: 2a 세 묶음 → 수끼리·문자끼리 헤쳐 모여 → 8a³. */
    function unfold(): void {
      const w = stageW();
      const nums: HTMLElement[] = [];
      const vars: HTMLElement[] = [];
      const times: HTMLElement[] = [];
      const cy = 66;
      const gap = Math.min(96, (w - 120) / 2);
      for (let k = 0; k < 3; k++) {
        const cx = w / 2 + (k - 1) * gap;
        const n = el("span", { class: "pdl-chip free num", text: "2" });
        const v = el("span", { class: "pdl-chip free", html: mfmt("a") });
        n.style.left = `${cx - SZ + 2}px`;
        n.style.top = `${cy}px`;
        v.style.left = `${cx + 2}px`;
        v.style.top = `${cy}px`;
        later(() => {
          stage.append(n, v);
          n.classList.add("born");
          v.classList.add("born");
        }, 140 + k * 160);
        nums.push(n);
        vars.push(v);
        if (k < 2) {
          const t = el("span", { class: "pdl-times", text: "×", attrs: { "aria-hidden": "true" } });
          t.style.left = `${cx + gap / 2 - 7}px`;
          t.style.top = `${cy + 8}px`;
          later(() => stage.appendChild(t), 220 + k * 160);
          times.push(t);
        }
      }
      later(() => toast("2a가 세 묶음! 이제 수는 수끼리, 문자는 문자끼리"), 780);
      // 헤쳐 모여: 2들은 왼쪽, a들은 오른쪽 무리로
      later(() => {
        times.forEach((t) => {
          t.style.transition = "opacity .3s ease";
          t.style.opacity = "0";
        });
        const lx = w * 0.27 - SZ / 2;
        const rx = w * 0.73 - SZ / 2;
        nums.forEach((n, i) => {
          n.style.transition = "left .55s var(--ease-out), top .55s var(--ease-out)";
          n.style.left = `${lx + (i - 1) * 30}px`;
          n.style.top = "46px";
        });
        vars.forEach((v, i) => {
          v.style.transition = "left .55s var(--ease-out), top .55s var(--ease-out)";
          v.style.left = `${rx + (i - 1) * 30}px`;
          v.style.top = "46px";
        });
        haptic(HAPTIC.select);
      }, 1500);
      // 무리 아래 계산 캡션
      later(() => {
        const capL = el("div", { class: "pdl-grp", html: mfmt("2×2×2 = 8") });
        capL.style.left = `${w * 0.27 - 60}px`;
        capL.style.top = "96px";
        const capR = el("div", { class: "pdl-grp", html: mfmt("a×a×a = a^3") });
        capR.style.left = `${w * 0.73 - 60}px`;
        capR.style.top = "96px";
        stage.append(capL, capR);
      }, 2250);
      later(() => {
        readEl.innerHTML = mfmt("2a×2a×2a = 8a^3");
        helper.innerHTML = "수끼리 2×2×2=<b>8</b>, 문자끼리 a×a×a=<b>a³</b>. 그래서 (2a)³=<b>8a³</b>, 괄호의 지수는 안의 <b>전원에게</b>!";
        toast("(2a)³=8a³, 2를 빼먹지 않기!");
        goals.on("dist", "8a³!");
        later(maybeFinish, 500);
      }, 3050);
    }
  }

  later(phase1, 60);

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
