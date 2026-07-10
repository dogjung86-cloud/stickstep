// diagRigLab, 대각선 조작대(중2 수학 Ⅳ L8 직사각형과 마름모, 책 172~175쪽). 사각형이 아니라
// 대각선에서 출발한다: 서로를 이등분하는 막대 2개(항상 고정, 반쪽마다 틱 표시)를 세팅하고
// [네 끝 점 잇기]를 누르면 사각형이 0.5s 스트로크 드로잉으로 탄생. 이등분만=평행사변형(열쇠 5호),
// +길이 같음=직사각형(네 꼭짓점 외접원 증거 페이드), +수직=마름모, 둘 다=정사각형(금 배지+판정 질문).
// 국면: para(토글 잠금, 잇기만) → rect/rhom(토글 해금, 순서 자유: helper가 남은 쪽을 안내) → square 보너스 mq6.
// rAF 금지: 길이·교차각 변경은 setTimeout 체인 트윈(12스텝×28ms), 타이머는 Set으로 cleanup 일괄 해제.
// CSS는 math2.css의 해당 랩 섹션에 병합 완료(단일 진실 공급원).
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, polar, angleArc, rightMark, dot, ptLabel, lineSvg, tickMark } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Kind = "para" | "rect" | "rhom" | "square";
const NAME: Record<Kind, string> = { para: "평행사변형", rect: "직사각형", rhom: "마름모", square: "정사각형" };

// 무대 기하: 교점 O 고정, 막대1(앰버)은 수학 각도 18°, 막대2(시안)는 18°+교차각. 전부 계산으로 배치.
const OX = 170;
const OY = 150;
const TH1 = 18; // 막대1 각도
const H1_OFF = 120; // 막대1 반쪽(전체 240px)
const H2_OFF = 85; // 막대2 반쪽(전체 170px)
const H_EQ = 105; // [길이 같게] ON일 때 공통 반쪽(전체 210px)
const CROSS_OFF = 62; // 기본 교차각
const ACCENT = "#1971C2"; // 단원 액센트(블루프린트 코발트)

const dist = (p: { x: number; y: number }, q: { x: number; y: number }): number => Math.hypot(p.x - q.x, p.y - q.y);
const fp = (p: { x: number; y: number }): string => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;

export const diagRigLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "para", label: "평행사변형", sub: "이등분만" },
    { id: "rect", label: "직사각형", sub: "잠김" },
    { id: "rhom", label: "마름모", sub: "잠김" },
  ]);

  const board = mboard(430);
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 300" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="drg-circ"></g><g class="drg-quad"></g><g class="drg-diag"></g></svg>`;
  const badgeRow = el("div", { class: "drg-namerow" });
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(svgWrap, badgeRow, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html:
      "지금은 두 대각선이 <b>서로를 이등분</b>하기만 해요(길이 다름·비스듬). " +
      "네 끝 점을 이으면 무엇이 될까요? <b>잇기</b>를 눌러요!",
  });
  host.append(chips.el, helper, board); // 배치: 칩 → helper(지시) → 보드
  if (s.curio) host.appendChild(curioCard(s.curio));

  const gCirc = svgWrap.querySelector(".drg-circ") as SVGGElement;
  const gQuad = svgWrap.querySelector(".drg-quad") as SVGGElement;
  const gDiag = svgWrap.querySelector(".drg-diag") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let eqLen = false; // [길이 같게]
  let perp = false; // [수직으로]
  let togglesOpen = false; // 국면 1(평행사변형)까지는 토글 잠금
  let tweening = false;
  let drawing = false;
  let askOpen = false;
  let asked = false;
  let finished = false;
  const cur = { h1: H1_OFF, h2: H2_OFF, cross: CROSS_OFF };

  const kindNow = (): Kind => (eqLen && perp ? "square" : eqLen ? "rect" : perp ? "rhom" : "para");

  /* ── 대각선 막대 그리기 ── */
  function paintDiag(): void {
    const a2 = TH1 + cur.cross;
    const right = Math.abs(cur.cross - 90) < 0.01;
    const A = polar(OX, OY, cur.h1, TH1);
    const C = polar(OX, OY, cur.h1, TH1 + 180);
    const B = polar(OX, OY, cur.h2, a2);
    const D = polar(OX, OY, cur.h2, a2 + 180);
    let sv = lineSvg(C.x, C.y, A.x, A.y, GEO.hlA, 3.4) + lineSvg(D.x, D.y, B.x, B.y, GEO.hlB, 3.4);
    // 이등분 표시: 반쪽마다 중점 틱(막대2는 길이가 다를 땐 2개 틱, 길이 같게 ON이면 전부 1개)
    const n2 = eqLen ? 1 : 2;
    sv += tickMark(OX, OY, A.x, A.y, 1, GEO.hlA) + tickMark(OX, OY, C.x, C.y, 1, GEO.hlA);
    sv += tickMark(OX, OY, B.x, B.y, n2, GEO.hlB) + tickMark(OX, OY, D.x, D.y, n2, GEO.hlB);
    // 교차각: 정확히 90°면 직각 꺾쇠, 아니면 호 + 반올림 정수 각도 라벨
    sv += right
      ? rightMark(OX, OY, TH1, 11, GEO.hlC)
      : angleArc(OX, OY, 24, TH1, a2, GEO.hlC, `${Math.round(cur.cross)}°`, { labelR: 40 });
    // 네 끝 점 + 이름(A·C=막대1, B·D=막대2, 그래서 대각선이 AC·BD)
    const ends: { ang: number; h: number; name: string; col: string }[] = [
      { ang: TH1, h: cur.h1, name: "A", col: GEO.hlA },
      { ang: a2, h: cur.h2, name: "B", col: GEO.hlB },
      { ang: TH1 + 180, h: cur.h1, name: "C", col: GEO.hlA },
      { ang: a2 + 180, h: cur.h2, name: "D", col: GEO.hlB },
    ];
    for (const e2 of ends) {
      const p = polar(OX, OY, e2.h, e2.ang);
      const lp = polar(OX, OY, e2.h + 18, e2.ang);
      sv +=
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="9" fill="${e2.col}" opacity=".15"/>` +
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="#FFFFFF" stroke="${e2.col}" stroke-width="2.6"/>` +
        ptLabel(lp.x, lp.y, e2.name, 0, 4.5, GEO.ink);
    }
    sv += dot(OX, OY, GEO.ink, 3.4) + ptLabel(OX, OY, "O", -13, 16, GEO.soft);
    gDiag.innerHTML = sv;
  }

  /* ── 버튼 상태 동기화 ── */
  function syncBtns(): void {
    const busy = tweening || drawing || askOpen;
    btnJoin.disabled = busy;
    tgLen.disabled = busy || !togglesOpen;
    tgPerp.disabled = busy || !togglesOpen;
  }

  /* ── 유령화·증거 원 ── */
  function ghostQuad(): void {
    const p = gQuad.querySelector("path") as SVGPathElement | null;
    if (p) {
      p.style.opacity = ".25"; // 기존 사각형은 반투명으로 남긴다
      p.style.setProperty("fill-opacity", "0");
    }
  }
  function dimBadge(): void {
    badgeRow.firstElementChild?.classList.add("dim");
  }
  function showCircle(): void {
    // O에서 네 끝 점까지 거리가 전부 같으니 한 원 위: 직사각형 증거를 0.6s 페이드로
    gCirc.innerHTML =
      `<circle cx="${OX}" cy="${OY}" r="${cur.h1.toFixed(1)}" stroke="${GEO.soft}" stroke-width="1.8" ` +
      `stroke-dasharray="6 5" fill="none" opacity="0" style="transition:opacity .6s var(--ease-out)"/>`;
    const c = gCirc.querySelector("circle") as SVGCircleElement;
    void c.getBoundingClientRect(); // reflow 후 페이드 시작
    c.style.opacity = ".8";
  }
  function hideCircle(): void {
    const c = gCirc.querySelector("circle") as SVGCircleElement | null;
    if (!c) return;
    c.style.opacity = "0";
    later(() => clear(gCirc), 650);
  }

  /* ── 길이·교차각 트윈(12스텝×28ms, rAF 없이) ── */
  function tweenTo(target: { h1: number; h2: number; cross: number }): void {
    const from = { h1: cur.h1, h2: cur.h2, cross: cur.cross };
    tweening = true;
    syncBtns();
    const STEPS = 12;
    for (let i = 1; i <= STEPS; i++) {
      later(() => {
        const e = 1 - Math.pow(1 - i / STEPS, 2); // ease-out
        cur.h1 = from.h1 + (target.h1 - from.h1) * e;
        cur.h2 = from.h2 + (target.h2 - from.h2) * e;
        cur.cross = from.cross + (target.cross - from.cross) * e;
        if (i === STEPS) {
          cur.h1 = target.h1;
          cur.h2 = target.h2;
          cur.cross = target.cross;
          tweening = false;
          syncBtns();
        }
        paintDiag();
      }, i * 28);
    }
  }

  /* ── 컨트롤 ── */
  const tgLen = el(
    "button",
    { class: "ct-btn drg-tg", attrs: { type: "button", "aria-pressed": "false" } },
    el("span", { text: "길이 같게" }),
  );
  const tgPerp = el(
    "button",
    { class: "ct-btn drg-tg", attrs: { type: "button", "aria-pressed": "false" } },
    el("span", { text: "수직으로" }),
  );
  const btnJoin = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "네 끝 점 잇기" }));
  actions.append(tgLen, tgPerp, btnJoin);

  function onToggle(which: "len" | "perp"): void {
    if (tweening || drawing || askOpen || !togglesOpen) return;
    haptic(HAPTIC.select);
    if (which === "len") eqLen = !eqLen;
    else perp = !perp;
    const btn = which === "len" ? tgLen : tgPerp;
    const on = which === "len" ? eqLen : perp;
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", String(on));
    ghostQuad();
    hideCircle();
    dimBadge();
    tweenTo({ h1: eqLen ? H_EQ : H1_OFF, h2: eqLen ? H_EQ : H2_OFF, cross: perp ? 90 : CROSS_OFF });
  }
  tgLen.addEventListener("click", () => onToggle("len"));
  tgPerp.addEventListener("click", () => onToggle("perp"));

  /* ── 잇기: 사각형 스트로크 드로잉 → 배지 → 판정 ── */
  function connect(): void {
    if (tweening || drawing || askOpen) return;
    haptic(HAPTIC.select);
    drawing = true;
    syncBtns();
    const a2 = TH1 + cur.cross;
    const A = polar(OX, OY, cur.h1, TH1);
    const B = polar(OX, OY, cur.h2, a2);
    const C = polar(OX, OY, cur.h1, TH1 + 180);
    const D = polar(OX, OY, cur.h2, a2 + 180);
    const per = dist(A, B) + dist(B, C) + dist(C, D) + dist(D, A) + 2;
    gQuad.innerHTML =
      `<path d="M${fp(A)} L${fp(B)} L${fp(C)} L${fp(D)} Z" stroke="${ACCENT}" stroke-width="3" stroke-linejoin="round" ` +
      `fill="${ACCENT}" fill-opacity="0" style="stroke-dasharray:${per.toFixed(0)};stroke-dashoffset:${per.toFixed(0)};` +
      `transition:stroke-dashoffset .5s var(--ease-out), fill-opacity .4s ease, opacity .3s ease"/>`;
    const path = gQuad.querySelector("path") as SVGPathElement;
    void path.getBoundingClientRect(); // reflow로 드로잉 시작 상태 확정
    path.style.setProperty("stroke-dashoffset", "0"); // 0.5s 윤곽 드로잉
    later(() => path.style.setProperty("fill-opacity", "0.08"), 500);
    later(() => {
      drawing = false;
      const k = kindNow(); // 판정은 토글 상태로 직접(이등분은 항상 참)
      showBadge(k);
      judge(k);
      syncBtns();
    }, 560);
  }
  btnJoin.addEventListener("click", connect);

  function showBadge(k: Kind): void {
    clear(badgeRow); // 배지는 이전 것을 지우고 하나만
    const b = el("div", { class: `drg-name${k === "square" ? " gold" : ""}`, text: NAME[k] });
    badgeRow.appendChild(b);
    later(() => b.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  const TXT_BOTH = "둘 다 켜면? <b>길이 같게</b>와 <b>수직으로</b>를 모두 켜고 이어 보세요!";
  const TXT_REPEAT = "이미 확인한 세팅이에요. 토글을 바꿔 새 대각선을 세팅해 보세요!";

  function judge(k: Kind): void {
    if (finished) return; // 완료 후 자유 실험은 배지만
    if (k === "para") {
      if (chips.on("para", "열쇠 5호!")) {
        haptic(HAPTIC.correct);
        toast("서로를 이등분하는 대각선은 언제나 평행사변형을 만들어요(지난 시간의 열쇠 5호!)");
        togglesOpen = true;
        syncBtns();
        helper.innerHTML = "<b>길이 같게</b>를 켜고 다시 이어 보세요. 책장 설명서의 검사가 이거예요!";
      } else toast(TXT_REPEAT);
    } else if (k === "rect") {
      if (chips.on("rect", "길이 같음!")) {
        haptic(HAPTIC.correct);
        toast("길이까지 같으면 네 꼭짓점이 한 원 위에! 네 각이 모두 직각인 직사각형이 돼요.");
        showCircle();
        helper.innerHTML = chips.has("rhom")
          ? TXT_BOTH
          : "이번엔 <b>길이 같게를 끄고 수직으로</b>를 켜서 이어 보세요.";
      } else toast(TXT_REPEAT);
    } else if (k === "rhom") {
      if (chips.on("rhom", "수직!")) {
        haptic(HAPTIC.correct);
        toast("수직이면 네 변의 길이가 전부 같아져요, 마름모!");
        helper.innerHTML = chips.has("rect")
          ? TXT_BOTH
          : "좋아요! 이번엔 <b>수직으로를 끄고 길이 같게</b>를 켜서 이어 보세요. 책장 설명서의 검사가 이거예요!";
      } else toast(TXT_REPEAT);
    } else if (chips.has("rect") && chips.has("rhom")) {
      if (!asked) {
        asked = true;
        haptic(HAPTIC.correct);
        toast("두 조건이 모두 켜지니 정사각형! 아래 질문으로 마무리해요.");
        later(askSquare, 900);
      }
    } else {
      // 순서를 건너뛰고 둘 다 켠 경우: 배지는 보여 주되 남은 조합으로 안내
      haptic(HAPTIC.tap);
      toast("둘 다 켜면 정사각형! 그런데 조건을 하나씩만 켰을 때가 아직 남았어요.");
      helper.innerHTML = !chips.has("rect")
        ? "먼저 <b>수직으로를 끄고 길이 같게</b>만 켜서 이어 보세요."
        : "먼저 <b>길이 같게를 끄고 수직으로</b>만 켜서 이어 보세요.";
    }
  }

  /* ── 보너스 판정 질문(mq6) ── */
  function askSquare(): void {
    askOpen = true;
    syncBtns();
    qline.innerHTML = "<b>정사각형</b>을 만든 대각선의 조건을 정확히 고르면?";
    const items = [
      {
        t: "길이만 같으면 된다",
        good: false,
        fb: "길이만 같으면 직사각형까지예요. 네 변까지 같아지려면 수직 조건이 더 필요해요!",
      },
      {
        t: "수직이기만 하면 된다",
        good: false,
        fb: "수직만으로는 마름모까지예요. 네 각까지 직각이 되려면 길이가 같다는 조건이 더 필요하죠!",
      },
      {
        t: "서로를 이등분하고, 길이가 같고, 수직이다 (셋 다!)",
        good: true,
        fb: "정답! 이등분(평행사변형)에 길이 같음(네 각이 직각)과 수직(네 변이 같음)까지 더해져 정사각형이 돼요.",
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
        later(finish, it.good ? 1700 : 2600);
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function finish(): void {
    qline.innerHTML = "";
    clear(ctl);
    askOpen = false;
    finished = true;
    haptic(HAPTIC.done);
    helper.innerHTML = "사각형의 정체는 대각선이 결정해요. 표로 정리하러 가요!";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "정리하러 가기");
    syncBtns(); // 완료 후엔 자유 실험 허용
  }

  paintDiag();
  syncBtns();
  api.setCTA("정사각형의 비밀을 밝히면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
