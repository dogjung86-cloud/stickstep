// patternRule, 패턴에서 식으로(Ⅱ 문자와 식 도입 랩, 책 66·79쪽 소재).
// 길이가 같은 막대로 정삼각형을 옆으로 이어 붙이면 3, 5, 7, 9 … 2개씩 늘어난다.
//   1막 관찰: "삼각형 하나 더", 그림과 카운터 표가 함께 자란다(+2 배지)
//   2막 도약: 5개 예측(수) → a개 일반화(식 2a+1). 오답은 실제 오개념을 짚는다
//            (3a = 공유하는 변을 두 번 셈, a+2 = a=1만 맞는 착시)
//   3막 위력: 넘패드로 a=100 대입, 201 즉답, 그리지 않아도 아는 것이 문자의 힘.
// 모션은 전부 CSS transition + setTimeout 체인(rAF 금지).

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips, makeAnswerPad, checkAnswer } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface RuleStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

// ---- SVG 헬퍼 ----
const NS = "http://www.w3.org/2000/svg";
function sv<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}

// ---- 기하(viewBox 360×140), 변 48, 밑변 y=110. 꼭짓점 P(k)가 24px 간격으로
//      아래(짝수)·위(홀수)를 오가며 △▽가 변을 공유하는 표준 그림이 된다. ----
const VB_W = 360;
const VB_H = 140;
const SEG = 24; // 꼭짓점 x 간격 = 변의 절반
const SIDE = 48;
const Y_BOT = 110;
const Y_TOP = Y_BOT - SIDE * Math.sin(Math.PI / 3); // ≈ 68.4

// 장면 색(areaSplit의 장면 색 문법 계승, 기존 막대 시안 잉크, 새 막대 앰버 플래시)
const C_STICK = "#0A87A3";
const C_FRESH = "#F0A422";
const C_DIM = "#94A3B8";

/** 꼭짓점 k의 좌표. */
const pt = (k: number): { x: number; y: number } => ({ x: SEG + SEG * k, y: k % 2 === 0 ? Y_BOT : Y_TOP });
/** 삼각형 n개일 때 스트립을 가운데로 보내는 x 오프셋. */
const stripOff = (n: number): number => (VB_W - SEG * (n + 1)) / 2 - SEG;
/** 막대 개수 공식(첫 막대 1 + 삼각형마다 2). */
const sticksOf = (n: number): number => 2 * n + 1;

interface Choice {
  label: string; // mfmt 마크업
  ok?: boolean;
  toast?: string; // 오답 짧은 교정(질문 ①)
  why?: string; // 오답 긴 교정 패널(질문 ②, 오개념 짚기)
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const patternRule: StepRenderer = (host, step, api) => {
  const s = step as unknown as RuleStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "grow", label: "패턴 관찰", sub: "막대 세기" },
    { id: "rule", label: "식 세우기", sub: "a개면?" },
    { id: "power", label: "식의 위력", sub: "100개!" },
  ]);
  const board = mboard(280);
  const toast = mtoast(board);

  // ---- 무대: 막대 그림 ----
  const svg = sv("svg", { viewBox: `0 0 ${VB_W} ${VB_H}`, role: "img", "aria-label": "막대로 이어 붙인 정삼각형 그림" });
  svg.style.width = "100%";
  svg.style.height = "auto";
  svg.style.display = "block";
  const strip = sv("g");
  svg.appendChild(strip);
  board.appendChild(svg);

  // ---- 카운터 표(삼각형 n / 막대 개수), 새 열이 +2 배지와 함께 자란다 ----
  const tbl = el("div", {
    style: "display:flex; align-items:flex-end; justify-content:center; gap:3px; padding:0 6px 12px; flex-wrap:wrap",
  });
  const headCell = (t: string, h: number): HTMLElement =>
    el("div", {
      style: `font-size:10.5px; font-weight:800; color:var(--n500); height:${h}px; display:flex; align-items:center`,
      text: t,
    });
  tbl.appendChild(
    el(
      "div",
      { style: "display:flex; flex-direction:column; gap:4px; align-items:flex-end; margin-right:3px" },
      headCell("삼각형", 20),
      headCell("막대", 26),
    ),
  );
  board.appendChild(tbl);

  // ---- "삼각형 하나 더" 히어로 버튼 ----
  const heroBtn = el("button", {
    class: "ct-btn hero",
    text: "삼각형 하나 더",
    attrs: { type: "button", "aria-label": "삼각형 하나 더 이어 붙이기" },
  });
  const heroRow = el("div", { class: "ct-actions" }, heroBtn);
  board.appendChild(heroRow);

  // ---- 질문 영역(보드 안, ①은 수 예측, ②는 식 도약) ----
  const qTitle = el("div", {
    style: "text-align:center; font-size:15.5px; font-weight:800; color:var(--n800); padding:0 12px 2px",
  });
  const qChoices = el("div", { class: "pt-choices", style: "flex-wrap:wrap" });
  const qWhy = el("div", { class: "mdr-why", style: "display:none; margin:2px 14px 12px" });
  const qWrap = el("div", { style: "display:none; opacity:0; transition:opacity .35s var(--ease-out)" }, qTitle, qChoices, qWhy);
  board.appendChild(qWrap);

  // ---- 리드아웃 + 넘패드(질문 ③, 식의 위력) ----
  const read = el("div", { class: "pw-read" });
  const confirmBtn = el("button", { class: "ct-btn hero", text: "확인하기", attrs: { type: "button" } });
  const setConfirm = (b: boolean): void => {
    confirmBtn.disabled = !b;
    confirmBtn.style.opacity = b ? "" : ".45";
  };
  let solved = false;
  const pad = makeAnswerPad("int", (ready) => setConfirm(ready && !solved));
  const padWrap = el(
    "div",
    { style: "display:none; opacity:0; transition:opacity .4s var(--ease-out)" },
    el("div", {
      style: "text-align:center; font-size:16px; font-weight:800; color:var(--n800); padding:6px 0 2px",
      html: `그럼 삼각형 <b style="color:var(--subj-num-press)">100개</b>면 막대는 몇 개?`,
    }),
    pad.ansEl,
    pad.padEl,
    el("div", { class: "ct-actions", style: "padding-top:12px" }, confirmBtn),
  );
  setConfirm(false);

  const helper = el("div", {
    class: "helper",
    html: "<b>삼각형 하나 더</b>를 눌러 이어 붙여 보세요. 막대가 몇 개씩 늘어나는지가 열쇠예요.",
  });
  host.append(goals.el, helper, board, read, padWrap); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 타이머(모든 지연은 여기로, cleanup에서 일괄 해제) ----
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  // ---- 상태 ----
  let n = 0; // 그려진 삼각형 수
  let busy = false;

  function drawStick(a: number, b: number, delay: number): void {
    later(() => {
      const p = pt(a);
      const q = pt(b);
      const ln = sv("line", { x1: p.x, y1: p.y, x2: q.x, y2: q.y, "stroke-width": 5, "stroke-linecap": "round" });
      ln.style.setProperty("stroke", C_FRESH);
      ln.style.setProperty("stroke-dasharray", String(SIDE));
      ln.style.setProperty("stroke-dashoffset", String(SIDE));
      ln.style.transition = "stroke-dashoffset .3s var(--ease-out), stroke .6s ease";
      strip.appendChild(ln);
      void ln.getBoundingClientRect(); // 트랜지션 시작점 확정
      ln.style.setProperty("stroke-dashoffset", "0");
      later(() => ln.style.setProperty("stroke", C_STICK), 640);
    }, delay);
  }

  function addCol(k: number): void {
    if (k >= 2) {
      const d = el(
        "div",
        {
          style:
            "display:flex; flex-direction:column; justify-content:flex-end; height:50px; padding-bottom:5px;" +
            " opacity:0; transition:opacity .35s var(--ease-out)",
          attrs: { "aria-hidden": "true" },
        },
        el("span", { class: "pt-delta", style: "margin-left:0; padding:1px 5px; font-size:9.5px", text: "+2" }),
      );
      tbl.appendChild(d);
      later(() => {
        d.style.opacity = "1";
      }, 60);
    }
    const col = el(
      "div",
      {
        style:
          "display:flex; flex-direction:column; gap:4px; align-items:center;" +
          " opacity:0; transform:translateY(8px); transition:all .32s var(--spring-soft)",
      },
      el("div", {
        style: "font-size:11.5px; font-weight:800; color:var(--n600); height:20px; display:flex; align-items:center",
        text: String(k),
      }),
      el("div", {
        style:
          "min-width:30px; height:26px; padding:0 7px; border-radius:9px; background:var(--subj-num-tint);" +
          " color:var(--subj-num-press); font-weight:800; font-size:13.5px; display:flex; align-items:center; justify-content:center",
        text: String(sticksOf(k)),
      }),
    );
    tbl.appendChild(col);
    later(() => {
      col.style.opacity = "1";
      col.style.transform = "translateY(0)";
    }, 40);
  }

  /** 삼각형 하나를 이어 붙인다(첫 삼각형은 막대 3, 이후 2). after는 연출이 끝난 뒤 호출. */
  function addTriangle(after?: () => void): void {
    const i = n;
    n += 1;
    const edges: [number, number][] = i === 0 ? [[0, 2], [0, 1], [1, 2]] : [[i, i + 2], [i + 1, i + 2]];
    edges.forEach(([a, b], j) => drawStick(a, b, j * 110));
    later(() => {
      const t = sv("text", {
        x: SEG + SEG * (i + 1),
        y: i % 2 === 0 ? 100 : 87,
        "text-anchor": "middle",
        "font-size": 11,
        "font-weight": 800,
        fill: C_DIM,
      });
      t.textContent = String(i + 1);
      t.style.opacity = "0";
      t.style.transition = "opacity .4s ease";
      strip.appendChild(t);
      void t.getBoundingClientRect();
      t.style.opacity = "1";
    }, edges.length * 110 + 40);
    strip.style.transform = `translateX(${stripOff(n)}px)`;
    later(() => addCol(n), edges.length * 110 + 140);
    if (after) later(after, edges.length * 110 + 460);
  }

  // ---- 질문 공통 ----
  function showQ(): void {
    qWrap.style.display = "block";
    void qWrap.offsetWidth;
    qWrap.style.opacity = "1";
    later(() => qWrap.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }
  function hideQ(): void {
    qWrap.style.opacity = "0";
    later(() => {
      qWrap.style.display = "none";
    }, 360);
  }
  function mountChoices(defs: Choice[], onOk: () => void): void {
    clear(qChoices);
    qWhy.style.display = "none";
    let locked = false;
    for (const c of shuffled(defs)) {
      const b = el("button", { class: "pt-choice", html: mfmt(c.label), attrs: { type: "button", "aria-label": c.label } });
      b.addEventListener("click", () => {
        if (locked) return;
        if (c.ok) {
          locked = true;
          haptic(HAPTIC.correct);
          b.style.borderColor = "var(--green)";
          b.style.transform = "scale(1.05)";
          qWhy.style.display = "none";
          onOk();
        } else {
          haptic(HAPTIC.wrong);
          b.classList.add("no");
          later(() => b.classList.remove("no"), 480);
          if (c.why) {
            qWhy.innerHTML = c.why;
            qWhy.style.display = "";
          }
          if (c.toast) toast(c.toast);
        }
      });
      qChoices.appendChild(b);
    }
  }

  // ---- 질문 ①: 삼각형 5개 예측(수) → 5개째를 그려서 검증 ----
  function showQ1(): void {
    qTitle.innerHTML = `삼각형 <b>5개</b>면 막대는 몇 개일까요?`;
    mountChoices(
      [
        { label: "11", ok: true },
        { label: "15", toast: "이웃과 변을 같이 써요, 3×5보다 적어요" },
        { label: "10", toast: "표를 봐요, 2씩 늘어요" },
      ],
      () => {
        later(hideQ, 350);
        later(() => {
          addTriangle(() => {
            toast("9 다음 +2, 정말 11개!");
            helper.innerHTML = "확인! 그럼 <b>몇 개든</b> 답할 수 있는 마법의 한 줄, 식을 세워 봐요.";
            later(showQ2, 1200);
          });
        }, 520);
      },
    );
    showQ();
  }

  // ---- 질문 ②: a개 일반화(식), 오답은 오개념 교정 패널 ----
  function showQ2(): void {
    qTitle.innerHTML = `이제 도약, 삼각형이 ${mfmt("a")}개면 막대는?`;
    mountChoices(
      [
        { label: "2a+1", ok: true },
        {
          label: "3a",
          why: `삼각형마다 막대 3개면 ${mfmt("a")}=5일 때 <b>15개</b>여야 해요. 실제론 11개: 이웃과 <b>공유하는 변을 두 번</b> 센 거예요.`,
        },
        {
          label: "a+2",
          why: `${mfmt("a")}=1일 때 3이라 그럴듯하지만, ${mfmt("a")}=2에서 4가 아니라 <b>5</b>예요. 표와 안 맞아요.`,
        },
      ],
      () => {
        goals.on("rule", "2a+1!");
        read.innerHTML =
          `<span style="font-size:14px; font-weight:700; color:var(--n600); margin-right:6px">막대 개수</span>` +
          mfmt("=2a+1");
        toast("어떤 개수든 한 줄 식으로!");
        helper.innerHTML = `식의 뜻: 맨 왼쪽 막대 <b>1개</b>에서 시작해 삼각형마다 <b>2개</b>씩, 그래서 ${mfmt("2a+1")}이에요.`;
        later(hideQ, 900);
        later(showPad, 1250);
      },
    );
    showQ();
  }

  // ---- 질문 ③: a=100 대입, 넘패드 ----
  function showPad(): void {
    padWrap.style.display = "block";
    void padWrap.offsetWidth;
    padWrap.style.opacity = "1";
    helper.innerHTML = `${mfmt("a")} 자리에 <b>100</b>을 넣어요, 그리지 않아도 바로 나와요!`;
    later(() => padWrap.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  confirmBtn.addEventListener("click", () => {
    if (solved) return;
    const v = pad.value();
    if (!v) return;
    if (checkAnswer(v, 201).good) {
      solved = true;
      pad.flash(true);
      pad.setEnabled(false);
      setConfirm(false);
      read.innerHTML = mfmt("2×100+1=201");
      goals.on("power", "201개!");
      toast("정답, 201개!");
      helper.innerHTML = "그리지 않고도 즉답, 이게 <b>문자의 힘</b>이에요! 1000개든 백만 개든, 식 하나면 끝.";
      haptic(HAPTIC.done);
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    } else {
      pad.flash(false);
      haptic(HAPTIC.wrong);
      toast("a 자리에 100, 2×100+1을 계산해요");
      later(() => pad.ansEl.classList.remove("bad"), 700);
    }
  });

  // ---- 히어로: 4개까지 관찰 ----
  heroBtn.addEventListener("click", () => {
    if (busy || n >= 4) return;
    busy = true;
    haptic(HAPTIC.tap);
    heroBtn.disabled = true;
    heroBtn.style.opacity = ".55";
    addTriangle(() => {
      busy = false;
      if (n >= 4) {
        goals.on("grow", "+2씩!");
        toast("3, 5, 7, 9, 2개씩 늘어요!");
        heroRow.style.transition = "opacity .3s ease";
        heroRow.style.opacity = "0";
        later(() => {
          heroRow.style.display = "none";
        }, 320);
        helper.innerHTML = "막대는 <b>2개씩</b> 늘어요. 그림 없이 다음 걸음을 맞혀 볼까요?";
        later(showQ1, 1000);
      } else {
        heroBtn.disabled = false;
        heroBtn.style.opacity = "";
      }
    });
  });

  // ---- 시작: 삼각형 1개(막대 3)를 그려 두고 관찰 시작 ----
  strip.style.transform = `translateX(${stripOff(1)}px)`; // 첫 배치는 무전환
  later(() => {
    strip.style.transition = "transform .45s var(--ease-out)";
  }, 60);
  addTriangle();
  api.setCTA("패턴을 관찰하고 식을 세워요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
