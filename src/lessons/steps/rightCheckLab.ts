// rightCheckLab, "직각 판정소"(중2 수학 Ⅴ L11, 직각삼각형이 되는 조건 — 책 221쪽).
// 피타고라스 정리(L10 기왕)를 거꾸로 방향으로 쓰는 판정 랩. 세 변 길이 카드 세트를
// 순차 조립한다: 가장 긴 변을 바닥에 깔고 두 원호의 교점에서 삼각형이 서는 애니 →
// 꼭대기 각 대략 리드아웃 → 값 비교 패널(왼쪽 "짧은 두 변의 제곱 합", 오른쪽 "가장 긴 변의
// 제곱")이 실제 계산값을 나란히 놓고 = 또는 ≠로 판정한다.
// 초판의 양팔 저울은 폐기(2026-07-20 사용자 피드백 "너무 어렵다" — 교과서 장치가 아닌 창작
// 은유인 데다 조작 없이 표시만 하는 저울이라 인지 부담만 얹었다. 판정의 본질은 두 값의
// 등식 검사이므로 비교 기호가 정답).
// ① 3·4·5 직각(칩 first) ② 6·8·10 직각 ③ 4·5·6은 16+25=41 ≠ 36(칩 both)
// ④ 5·12·13은 조립 전 "혼자 둘 변" 판정 mq6(가장 긴 변이 빗변 후보) 후 25+144=169 확정
//    (칩 key) → recordQuiz + CTA. √ 금지(중3): 수치는 전부 자연수 트리플, 제곱 비교는
//    넓이 값(제곱값)으로만 서술한다. 기하는 전부 계산(교점 좌표·각도 acos)이며 눈대중 금지.
// rAF 금지: CSS 트랜지션/키프레임 + setTimeout 체인(타이머 Set → cleanup). CSS: math2.css .rck-*.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, angleArc, angleOf, normDeg, dot, rightMark } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const NS = "http://www.w3.org/2000/svg";
const SIM = "#C2255C"; // 최장변·단원 액센트
const C_A = "#F08C00"; // 변 a(앰버)
const C_B = "#0DA5C6"; // 변 b(틸)
const BASE_Y = 150;

interface SetDef {
  a: number;
  b: number;
  c: number;
  s: number; // px/단위
  toast: string;
}

const SETS: SetDef[] = [
  { a: 3, b: 4, c: 5, s: 28, toast: "9+16=25, 5²과 똑같아요! 두 값이 같으면 꼭대기는 직각이에요." },
  { a: 6, b: 8, c: 10, s: 14, toast: "36+64=100=10². 6·8·10은 3·4·5를 2배로 늘린 모양, 역시 직각!" },
  { a: 4, b: 5, c: 6, s: 23.3, toast: "빗나감! 16+25=41인데 6²은 36. 두 값이 다르면 직각이 아니에요." },
  { a: 5, b: 12, c: 13, s: 10.8, toast: "25+144=169=13². 가장 긴 변을 혼자 뒀더니 등식이 딱 맞아요!" },
];
const TAGS = ["세트 ①", "세트 ②", "세트 ③", "세트 ④"];
const HELPERS = [
  "세 변이 3, 4, 5인 삼각형이에요. <b>조립하기</b>를 누르면 가장 긴 변 5를 바닥에 깔고 세워 볼게요!",
  "이번엔 6, 8, 10. 조립해서 제곱 값을 비교해 봐요!",
  "4, 5, 6은 직각일까요? 예감을 걸고 조립!",
  "마지막 세트 5, 12, 13. 조립 전에 <b>혼자 둘 변</b>부터 정해요!",
];

export const rightCheckLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "first", label: "첫 판정", sub: "3·4·5" },
    { id: "both", label: "직각·아님 판별", sub: "잠김" },
    { id: "key", label: "가장 긴 변", sub: "잠김" },
  ]);

  const board = mboard(560);
  const svgWrap = el("div", {
    class: "mcl-plane",
    attrs: { role: "img", "aria-label": "세 변으로 삼각형을 조립하고 제곱 값 비교로 판정하는 무대" },
  });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 272" xmlns="${NS}" fill="none">` +
    `<g class="rck-dyn"></g><g class="rck-scale"></g>` +
    `</svg>`;
  const cards = el("div", { class: "rck-cards", attrs: { "aria-live": "polite" } });
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q m2u5q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(svgWrap, cards, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(chips.el, helper, board); // 칩 → helper(지시) → 보드, 사용자 확정 배치
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gDyn = svg.querySelector(".rck-dyn") as SVGGElement;
  const gScale = svg.querySelector(".rck-scale") as SVGGElement;

  /* ── 값 비교 패널(정적 골격 1회 조립): 접시 대신 이름 붙은 값 카드 두 장 + 비교 기호 ── */
  gScale.innerHTML =
    `<text x="103" y="184" text-anchor="middle" font-size="11" font-weight="800" fill="#8093A8">짧은 두 변의 제곱 합</text>` +
    `<text x="237" y="184" text-anchor="middle" font-size="11" font-weight="800" fill="#8093A8">가장 긴 변의 제곱</text>` +
    `<rect x="46" y="190" width="114" height="52" rx="12" fill="#FFFFFF" stroke="rgba(240,140,0,.55)" stroke-width="1.8"/>` +
    `<rect x="180" y="190" width="114" height="52" rx="12" fill="#FFFFFF" stroke="rgba(194,37,92,.55)" stroke-width="1.8"/>` +
    `<text class="rck-fl" x="103" y="208" text-anchor="middle" font-size="12" font-weight="800" fill="#B26200"></text>` +
    `<text class="rck-fr" x="237" y="208" text-anchor="middle" font-size="12" font-weight="800" fill="${SIM}"></text>` +
    `<text class="rck-pvl" x="103" y="233" text-anchor="middle" font-size="17" font-weight="900" fill="#B26200">?</text>` +
    `<text class="rck-pvr" x="237" y="233" text-anchor="middle" font-size="17" font-weight="900" fill="${SIM}">?</text>` +
    `<text class="rck-cmp" x="170" y="223" text-anchor="middle" font-size="15" font-weight="900" fill="#B9C4D0">vs</text>` +
    `<g class="rck-verdict"></g>`;
  const pvL = gScale.querySelector(".rck-pvl") as SVGTextElement;
  const pvR = gScale.querySelector(".rck-pvr") as SVGTextElement;
  const fL = gScale.querySelector(".rck-fl") as SVGTextElement;
  const fR = gScale.querySelector(".rck-fr") as SVGTextElement;
  const cmp = gScale.querySelector(".rck-cmp") as SVGTextElement;
  const gVerdict = gScale.querySelector(".rck-verdict") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let setIdx = 0;
  let busy = false;
  let judged2 = false; // 세트 ② 판정 여부(칩 both는 ②③ 모두)
  let finished = false;

  const mkEl = (parent: SVGGElement, tag: string, attrs: Record<string, string>, style = ""): SVGElement => {
    const n = document.createElementNS(NS, tag) as SVGElement;
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (style) n.setAttribute("style", style);
    parent.appendChild(n);
    return n;
  };

  /** 선을 그리기 애니(대시 오프셋)로 추가. */
  function growLine(x1: number, y1: number, x2: number, y2: number, color: string, w: number): void {
    const len = Math.hypot(x2 - x1, y2 - y1).toFixed(1);
    const ln = mkEl(
      gDyn,
      "line",
      { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1), stroke: color, "stroke-width": String(w), "stroke-linecap": "round" },
      `stroke-dasharray:${len}; stroke-dashoffset:${len}; transition: stroke-dashoffset .45s var(--ease, cubic-bezier(.22,1,.36,1))`,
    );
    later(() => {
      (ln as SVGLineElement).style.strokeDashoffset = "0";
    }, 30);
  }

  function txt(x: number, y: number, t: string, color: string, size = 11, cls = ""): void {
    const n = mkEl(gDyn, "text", {
      x: x.toFixed(1), y: y.toFixed(1), "text-anchor": "middle",
      "font-size": String(size), "font-weight": "900", fill: color, ...(cls ? { class: cls } : {}),
    });
    n.textContent = t;
  }

  function resetScale(): void {
    pvL.textContent = "?";
    pvR.textContent = "?";
    fL.textContent = "";
    fR.textContent = "";
    cmp.textContent = "vs";
    cmp.setAttribute("fill", "#B9C4D0");
    cmp.setAttribute("font-size", "15");
    cmp.classList.remove("pop");
    gVerdict.innerHTML = "";
  }

  function renderSet(i: number): void {
    setIdx = i;
    busy = false;
    clear(gDyn);
    resetScale();
    clear(actions);
    qline.innerHTML = "";
    clear(ctl);
    const st = SETS[i];
    clear(cards);
    cards.appendChild(el("span", { class: "rck-tag", text: TAGS[i] }));
    const defs: [number, string, string, string][] = [
      [st.a, "a", "ca", "짧은 변"],
      [st.b, "b", "cb", "짧은 변"],
      [st.c, "c", "cc", "가장 긴 변"],
    ];
    for (const [v, nm, cls, sub] of defs) {
      cards.appendChild(
        el("span", { class: `rck-card ${cls}`, attrs: { "aria-label": `변 ${nm} 길이 ${v}` } },
          el("b", { text: String(v) }), el("span", { text: sub })),
      );
    }
    const go = el("button", { class: "ct-btn hero rck-go", attrs: { type: "button" } }, el("span", { text: "조립하기" })) as HTMLButtonElement;
    go.addEventListener("click", () => {
      if (busy || go.disabled) return;
      go.disabled = true;
      go.classList.remove("pulse");
      haptic(HAPTIC.select);
      assemble();
    });
    actions.appendChild(go);
    helper.innerHTML = HELPERS[i];
    if (i === 1) (chips.el.querySelector(`[data-g="both"] span`) as HTMLElement).textContent = "세트 ②·③";
    if (i === 3) {
      (chips.el.querySelector(`[data-g="key"] span`) as HTMLElement).textContent = "세트 ④";
      go.disabled = true;
      later(askHyp, 500);
    }
    later(() => cards.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 조립 애니: 밑변 → 원호 2개 → 교점 → 두 변 → 각 리드아웃 → 저울 판정 ── */

  function assemble(): void {
    busy = true;
    const st = SETS[setIdx];
    const d = st.c * st.s;
    const x0 = (340 - d) / 2;
    const L = { x: x0, y: BASE_Y };
    const R = { x: x0 + d, y: BASE_Y };
    const rb = st.b * st.s; // 왼끝에서 b
    const ra = st.a * st.s; // 오른끝에서 a
    const px = x0 + (rb * rb + d * d - ra * ra) / (2 * d);
    const py = BASE_Y - Math.sqrt(rb * rb - (px - x0) ** 2);
    const P = { x: px, y: py };
    const right = st.a * st.a + st.b * st.b === st.c * st.c;
    const gam = (Math.acos((st.a * st.a + st.b * st.b - st.c * st.c) / (2 * st.a * st.b)) * 180) / Math.PI;

    // 1) 가장 긴 변을 바닥에
    growLine(L.x, L.y, R.x, R.y, SIM, 3);
    later(() => {
      gDyn.insertAdjacentHTML("beforeend", dot(L.x, L.y, GEO.ink, 3.4) + dot(R.x, R.y, GEO.ink, 3.4));
      txt((L.x + R.x) / 2, BASE_Y + 18, String(st.c), SIM, 13);
    }, 480);

    // 2) 원호 2개(컴퍼스) + 교점
    later(() => {
      const c1 = mkEl(gDyn, "circle", { cx: String(L.x), cy: String(BASE_Y), r: String(rb), stroke: "#8093A8", "stroke-width": "1.4", "stroke-dasharray": "5 4", fill: "none", class: "rck-arc" });
      const c2 = mkEl(gDyn, "circle", { cx: String(R.x), cy: String(BASE_Y), r: String(ra), stroke: "#8093A8", "stroke-width": "1.4", "stroke-dasharray": "5 4", fill: "none", class: "rck-arc" });
      c1.getBoundingClientRect();
      c1.classList.add("show");
      c2.classList.add("show");
      later(() => {
        const ap = mkEl(gDyn, "circle", { cx: P.x.toFixed(1), cy: P.y.toFixed(1), r: "4", fill: SIM, class: "rck-apex" }, `transform-origin:${P.x.toFixed(1)}px ${P.y.toFixed(1)}px`);
        ap.getBoundingClientRect();
        ap.classList.add("pop");
        haptic(HAPTIC.tap);
      }, 430);
      later(() => {
        c1.classList.remove("show");
        c2.classList.remove("show");
        later(() => {
          c1.remove();
          c2.remove();
        }, 520);
      }, 660);
    }, 520);

    // 3) 두 변이 교점으로
    later(() => {
      growLine(L.x, L.y, P.x, P.y, C_B, 2.8);
      growLine(R.x, R.y, P.x, P.y, C_A, 2.8);
      const mL = { x: (L.x + P.x) / 2 - 11, y: (L.y + P.y) / 2 - 3 };
      const mR = { x: (R.x + P.x) / 2 + 11, y: (R.y + P.y) / 2 - 3 };
      later(() => {
        txt(mL.x, mL.y, String(st.b), C_B, 12.5);
        txt(mR.x, mR.y, String(st.a), C_A, 12.5);
      }, 460);
    }, 1250);

    // 4) 꼭대기 각 대략 리드아웃
    later(() => {
      let a1 = angleOf(P.x, P.y, L.x, L.y);
      let a2 = angleOf(P.x, P.y, R.x, R.y);
      if (normDeg(a2 - a1) > 180) [a1, a2] = [a2, a1];
      gDyn.insertAdjacentHTML("beforeend", angleArc(P.x, P.y, 14, a1, a2, "#8093A8", undefined, { width: 2 }));
      txt(P.x, P.y - 24, `약 ${Math.round(gam)}°`, "#5A6B7E", 13, "rck-ang");
      haptic(HAPTIC.tap);
    }, 1850);

    // 5) 값 카드 채우기(실제 계산값 — 식은 윗줄, 값은 큰 아랫줄)
    later(() => {
      const sum = st.a * st.a + st.b * st.b;
      fL.textContent = `${st.a}²+${st.b}²=${st.a * st.a}+${st.b * st.b}`;
      fR.textContent = `${st.c}²`;
      pvL.textContent = String(sum);
      pvR.textContent = String(st.c * st.c);
      haptic(HAPTIC.select);
    }, 2400);

    // 6) 판정: 비교 기호가 = 또는 ≠로 확정
    later(() => {
      cmp.textContent = right ? "=" : "≠";
      cmp.setAttribute("fill", right ? "#04B45F" : "#F04452");
      cmp.setAttribute("font-size", right ? "24" : "22");
      cmp.classList.add("pop");
      if (right) {
        gVerdict.innerHTML =
          `<g class="rck-pill" style="transform-origin:170px 258px">` +
          `<rect x="116" y="248" width="108" height="20" rx="10" fill="#F0FBF5" stroke="#04B45F" stroke-width="1.8"/>` +
          `<text x="170" y="262.5" text-anchor="middle" font-size="12.5" font-weight="900" fill="#1E7A31">직각!</text>` +
          `</g>`;
        const a1 = angleOf(P.x, P.y, L.x, L.y);
        const a2 = angleOf(P.x, P.y, R.x, R.y);
        gDyn.insertAdjacentHTML(
          "beforeend",
          rightMark(P.x, P.y, Math.abs(normDeg(a2 - a1) - 90) < 2 ? a1 : a2, 11, "#04B45F"),
        );
        haptic(HAPTIC.correct);
      } else {
        gVerdict.innerHTML =
          `<g class="rck-pill" style="transform-origin:170px 258px">` +
          `<rect x="112" y="248" width="116" height="20" rx="10" fill="#F1F4F7" stroke="#B9C4D0" stroke-width="1.8"/>` +
          `<text x="170" y="262.5" text-anchor="middle" font-size="12.5" font-weight="900" fill="#5A6B7E">직각 아님</text>` +
          `</g>`;
        haptic(HAPTIC.wrong);
      }
      toast(SETS[setIdx].toast);
    }, 3000);

    later(() => post(setIdx), 3750);
  }

  function post(i: number): void {
    busy = false;
    if (i === 0) {
      chips.on("first", "직각!");
      helper.innerHTML = "3, 4, 5처럼 <b>a²+b²=c²</b>이 딱 맞으면 직각! 다른 세트도 확인해 봐요.";
      nextBtn();
    } else if (i === 1) {
      judged2 = true;
      helper.innerHTML = "직각 두 번 연속! 그럼 <b>안 맞는 세트</b>는 어떻게 될까요?";
      nextBtn();
    } else if (i === 2) {
      if (judged2) chips.on("both", "판정 성공!");
      helper.innerHTML = "같으면 직각, 다르면 직각 아님. 세 변만 보고 판정 끝! 마지막 세트로 가요.";
      nextBtn();
    } else {
      chips.on("key", "열쇠!");
      later(finish, 600);
    }
  }

  function nextBtn(): void {
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "다음 세트" })) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.tap);
      renderSet(setIdx + 1);
    });
    actions.appendChild(b);
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 세트 ④ 사전 판정: 혼자 둘 변은? ── */

  function askHyp(): void {
    qline.innerHTML = "5, 12, 13에서 <b>혼자 둘 변</b>(나머지 두 변의 제곱 합과 맞비교할 변)은?";
    const items = [
      {
        t: "12요, 두 번째로 크니까 균형이 맞아요",
        good: false,
        fb: "12를 혼자 두면 5²+13²=194인데 12²=144라 두 값이 크게 어긋나요. 혼자 두는 자리는 가장 긴 변의 몫이에요.",
      },
      {
        t: "13이요, 가장 긴 변이 직각과 마주 보는 빗변 후보예요",
        good: true,
        fb: "맞아요! 직각과 마주 보는 변은 가장 긴 변이죠. 그래서 혼자 두는 c 자리는 13의 몫이에요.",
      },
      {
        t: "아무 변이나 골라도 결과는 같아요",
        good: false,
        fb: "자리를 바꾸면 값이 달라져요. 25+144=169, 25+169=194, 144+169=313. 등식이 성립하는 배치는 하나뿐이에요.",
      },
    ];
    const row = el("div", { class: "mq6-choices" });
    let done = false;
    const btns: { bt: HTMLButtonElement; good: boolean }[] = [];
    for (const it of items) {
      const bt = el("button", { class: "mq6-choice wide", text: it.t, attrs: { type: "button" } });
      bt.addEventListener("click", () => {
        if (done) return;
        done = true;
        haptic(it.good ? HAPTIC.correct : HAPTIC.wrong);
        for (const z of btns) {
          z.bt.disabled = true;
          if (z.good) z.bt.classList.add("ok");
        }
        if (!it.good) bt.classList.add("no");
        toast(it.fb);
        later(() => {
          qline.innerHTML = "";
          clear(ctl);
          const go = actions.querySelector(".rck-go") as HTMLButtonElement | null;
          if (go) {
            go.disabled = false;
            go.classList.add("pulse");
          }
          helper.innerHTML = "이제 조립! <b>25+144</b>와 <b>169</b>를 나란히 놓고 비교해 판정해요.";
          later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
        }, 2600);
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML =
      "각도기 없이도 판정 끝! 세 변에서 <b>가장 긴 변의 제곱</b>과 <b>나머지 두 제곱의 합</b>이 같으면 직각삼각형이에요.";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "정리하러 가기");
  }

  renderSet(0);
  api.setCTA("네 세트를 모두 판정하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
