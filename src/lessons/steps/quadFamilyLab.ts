// quadFamilyLab, 사각형 진화 계보(중2 수학 Ⅳ L9, 책 176~178쪽). 조건 버튼을 하나씩 눌러
// 사각형→사다리꼴→평행사변형→(직사각형|마름모)→정사각형으로 도형을 진화시키고,
// "조건을 추가해도 이전 자격은 남는다"에서 포함 관계(정사각형은 직사각형이다)를 발견한다.
// 국면 1: 평행사변형 갈림길에서 아무 갈래나 골라 정사각형까지(먼저 간 경로 칩 점등).
// 국면 2: 평행사변형까지 자동 되감기(트윈) 후 남은 갈래로 다시 정사각형(두 번째 경로 칩).
// 국면 3: 판정 질문 "정사각형은 직사각형일까?"(mq6 문법) → incl 칩 → recordQuiz+CTA.
// 도형 전환은 setTimeout 체인 트윈(14스텝×28ms, rAF 금지). 조건 하이라이트는 geoKit
// (평행 화살촉·rightMark·tickMark)를 도착 직후 그려 0.9초 뒤 페이드. 계보 지도 미니 트리는
// 거쳐 간 노드·간선이 코발트로 채워지는 진행 기록(리셋해도 지워지지 않는다).
// 스타일: math2.css .qf-* 섹션(아래 CSS-SNIPPET).
// CSS는 math2.css의 해당 랩 섹션에 병합 완료(단일 진실 공급원).
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, rad, polar, angleOf, normDeg, rightMark, tickMark, arrowHead, dot } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type StageId = "quad" | "trap" | "para" | "rect" | "rhom" | "sq";
type BranchId = "rect" | "rhom";
interface Pt {
  x: number;
  y: number;
}
const P = (x: number, y: number): Pt => ({ x, y });

/* ── 진화 좌표(전부 계산, 중심 (185,152) 공유) ── */
const CX = 185;
const CY = 152;
const SHAPES: Record<StageId, Pt[]> = (() => {
  // 불규칙 사각형: 어느 대변도 평행하지 않은 출발점
  const quad = [P(70, 70), P(300, 96), P(268, 232), P(96, 210)];
  // 사다리꼴: 윗변 120·아랫변 220 수평 평행, 높이 138, 윗변은 오른쪽 14 치우침(삐딱하게)
  const th = 138;
  const topW = 120;
  const botW = 220;
  const shift = 14;
  const trap = [
    P(CX + shift - topW / 2, CY - th / 2),
    P(CX + shift + topW / 2, CY - th / 2),
    P(CX + botW / 2, CY + th / 2),
    P(CX - botW / 2, CY + th / 2),
  ];
  // 평행사변형: 밑변 200, 높이 140, 옆변 기울기 68°(run = h/tan68)
  const ph = 140;
  const base = 200;
  const run = ph / Math.tan(rad(68));
  const x0 = CX - (base + run) / 2;
  const para = [
    P(x0 + run, CY - ph / 2),
    P(x0 + base + run, CY - ph / 2),
    P(x0 + base, CY + ph / 2),
    P(x0, CY + ph / 2),
  ];
  // 직사각형 240×140 · 정사각형 170×170(모두 중심 정렬)
  const rect = [P(CX - 120, CY - 70), P(CX + 120, CY - 70), P(CX + 120, CY + 70), P(CX - 120, CY + 70)];
  const sq = [P(CX - 85, CY - 85), P(CX + 85, CY - 85), P(CX + 85, CY + 85), P(CX - 85, CY + 85)];
  // 마름모: 대각선 240×150(위·오른쪽·아래·왼쪽 꼭짓점 순 = 모서리 순서 유지)
  const rhom = [P(CX, CY - 75), P(CX + 120, CY), P(CX, CY + 75), P(CX - 120, CY)];
  return { quad, trap, para, rect, rhom, sq };
})();

const NAMES: Record<StageId, string> = {
  quad: "사각형",
  trap: "사다리꼴",
  para: "평행사변형",
  rect: "직사각형",
  rhom: "마름모",
  sq: "정사각형",
};

const TOASTS: Record<StageId, string> = {
  quad: "처음 사각형으로 돌아왔어요. 조건 계단을 다시 쌓아 봐요!",
  trap: "위아래 두 변이 나란해졌어요. 한 쌍의 대변이 평행한 사각형, 사다리꼴!",
  para: "남은 한 쌍까지 나란히! 두 쌍의 대변이 모두 평행하면 평행사변형이에요.",
  rect: "직각을 하나만 줬는데 나머지 세 각도 저절로 직각! 직사각형이 됐어요.",
  rhom: "마주 보는 변은 원래 같았으니, 이웃 변까지 같으면 네 변이 전부 같아요. 마름모!",
  sq: "",
};

/* ── 계보 지도 미니 트리 배치(가로, 갈래 두 줄) ── */
const TREE: { id: StageId; x: number; y: number; ly: number }[] = [
  { id: "quad", x: 26, y: 52, ly: 71 },
  { id: "trap", x: 98, y: 52, ly: 71 },
  { id: "para", x: 174, y: 52, ly: 71 },
  { id: "rect", x: 256, y: 24, ly: 11 },
  { id: "rhom", x: 256, y: 80, ly: 99 },
  { id: "sq", x: 332, y: 52, ly: 71 },
];
const NODE_AT = Object.fromEntries(TREE.map((n) => [n.id, n])) as Record<StageId, (typeof TREE)[number]>;
const EDGES: [StageId, StageId][] = [
  ["quad", "trap"],
  ["trap", "para"],
  ["para", "rect"],
  ["para", "rhom"],
  ["rect", "sq"],
  ["rhom", "sq"],
];

export const quadFamilyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "pathA", label: "직사각형 경로", sub: "각을 먼저" },
    { id: "pathB", label: "마름모 경로", sub: "변을 먼저" },
    { id: "incl", label: "포함 판정", sub: "잠김" },
  ]);

  const board = mboard(440);
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 40 360 226" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">` +
    `<polygon class="qf-poly" points="" fill="rgba(25,113,194,.10)" stroke="#1971C2" stroke-width="3.2" stroke-linejoin="round"/>` +
    `<g class="qf-marks"></g><g class="qf-dots"></g></svg>`;
  const nameEl = el("div", { class: "qf-name", attrs: { "aria-live": "polite" }, text: NAMES.quad });
  const actions = el("div", { class: "lk-actions qf-acts" });
  const treeWrap = el("div", { class: "qf-tree" });
  treeWrap.innerHTML =
    `<svg viewBox="0 0 360 104" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true"` +
    ` style="width:100%;height:auto;display:block"></svg>`;
  const qline = el("div", { class: "mq6-q qf-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(svgWrap, nameEl, actions, treeWrap, panel);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(chips.el, helper, board); // 배치: 칩 → helper(지시) → 보드
  if (s.curio) host.appendChild(curioCard(s.curio));

  const poly = svgWrap.querySelector(".qf-poly") as SVGPolygonElement;
  const gMarks = svgWrap.querySelector(".qf-marks") as SVGGElement;
  const gDots = svgWrap.querySelector(".qf-dots") as SVGGElement;
  const treeSvg = treeWrap.querySelector("svg") as SVGSVGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ── 상태 ── */
  let stage: StageId = "quad";
  let phase: "explore" | "ask" | "done" = "explore";
  let animating = false;
  const donePaths = new Set<BranchId>(); // 완주한 갈래
  const visited = new Set<StageId>(["quad"]);
  const litEdges = new Set<string>();
  let cur: Pt[] = SHAPES.quad.map((p) => ({ ...p }));
  let markSeq = 0;

  /* ── 그리기 ── */
  function paintShape(): void {
    poly.setAttribute("points", cur.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "));
    gDots.innerHTML = cur.map((p) => dot(p.x, p.y, GEO.ink, 3.4)).join("");
  }

  function paintTree(): void {
    let g = `<text x="6" y="13" font-size="9" font-weight="800" fill="#8093A8">계보 지도</text>`;
    for (const [a, b] of EDGES) {
      const na = NODE_AT[a];
      const nb = NODE_AT[b];
      const lit = litEdges.has(`${a}-${b}`);
      g += `<line x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}" stroke="${lit ? "#1971C2" : "#D4DEE9"}" stroke-width="${lit ? 2.6 : 1.8}" stroke-linecap="round"/>`;
    }
    for (const n of TREE) {
      const vis = visited.has(n.id);
      if (n.id === stage)
        g += `<circle cx="${n.x}" cy="${n.y}" r="11.5" fill="none" stroke="#1971C2" stroke-width="2" opacity=".4"/>`;
      g += `<circle cx="${n.x}" cy="${n.y}" r="7.5" fill="${vis ? "#1971C2" : "#FFFFFF"}" stroke="${vis ? "#114E85" : "#C6D2DE"}" stroke-width="1.6"/>`;
      g += `<text x="${n.x}" y="${n.ly}" text-anchor="middle" font-size="9.5" font-weight="800" fill="${vis ? "#12579B" : "#8093A8"}">${NAMES[n.id]}</text>`;
    }
    treeSvg.innerHTML = g;
  }

  function setBadge(name: string): void {
    nameEl.textContent = name;
    nameEl.classList.remove("pop");
    void nameEl.offsetWidth; // 애니메이션 재시작
    nameEl.classList.add("pop");
  }

  /* ── 조건 하이라이트(도착 직후 반짝, 0.9초 뒤 페이드) ── */
  function paraMark(p: Pt, q: Pt, n: 1 | 2, color: string): string {
    const a = angleOf(p.x, p.y, q.x, q.y);
    const mx = (p.x + q.x) / 2;
    const my = (p.y + q.y) / 2;
    let g = "";
    for (let i = 0; i < n; i++) {
      const c = polar(mx, my, (i - (n - 1) / 2) * 10 + 4, a);
      g += arrowHead(c.x, c.y, a, color, 7.5);
    }
    return g;
  }

  function cornerMarks(p: Pt[]): string {
    let g = "";
    for (let i = 0; i < 4; i++) {
      const v = p[i];
      const prev = p[(i + 3) % 4];
      const next = p[(i + 1) % 4];
      const e1 = angleOf(v.x, v.y, prev.x, prev.y);
      const e2 = angleOf(v.x, v.y, next.x, next.y);
      const base = Math.abs(normDeg(e2 - e1) - 90) < 2 ? e1 : e2; // 내각 90°의 시작 변
      g += rightMark(v.x, v.y, base, 12, GEO.hlA);
    }
    return g;
  }

  function tickMarks(p: Pt[]): string {
    let g = "";
    for (let i = 0; i < 4; i++) {
      const a = p[i];
      const b = p[(i + 1) % 4];
      g += tickMark(a.x, a.y, b.x, b.y, 1, GEO.hlC);
    }
    return g;
  }

  function spark(x: number, y: number, r: number, delay: number): string {
    const w = r * 0.18;
    return (
      `<path class="qf-spark" style="animation-delay:${delay}ms" fill="#E8A93E" ` +
      `d="M${x} ${y - r} Q${x + w} ${y - w} ${x + r} ${y} Q${x + w} ${y + w} ${x} ${y + r} ` +
      `Q${x - w} ${y + w} ${x - r} ${y} Q${x - w} ${y - w} ${x} ${y - r} Z"/>`
    );
  }

  function sparks(): string {
    const q = SHAPES.sq;
    return [
      spark(q[0].x - 16, q[0].y - 12, 9, 0),
      spark(q[1].x + 18, q[1].y + 6, 7, 120),
      spark(q[3].x - 14, q[3].y + 10, 7, 240),
      spark(q[2].x + 12, q[2].y + 14, 9, 360),
    ].join("");
  }

  function marksFor(id: StageId): string {
    const p = SHAPES[id];
    const [A, B, C, D] = p;
    const pair1 = paraMark(A, B, 1, GEO.hlB) + paraMark(D, C, 1, GEO.hlB);
    switch (id) {
      case "trap":
        return pair1;
      case "para":
        return pair1 + paraMark(D, A, 2, GEO.hlD) + paraMark(C, B, 2, GEO.hlD);
      case "rect":
        return cornerMarks(p);
      case "rhom":
        return tickMarks(p);
      case "sq":
        return cornerMarks(p) + tickMarks(p) + sparks();
      default:
        return "";
    }
  }

  function showMarks(id: StageId, hold = 900): void {
    const tok = ++markSeq;
    gMarks.style.transition = "none";
    gMarks.style.opacity = "0";
    gMarks.innerHTML = marksFor(id);
    void gMarks.getBoundingClientRect(); // reflow로 트랜지션 재무장
    gMarks.style.transition = "opacity .2s var(--ease-out)";
    gMarks.style.opacity = "1";
    later(() => {
      if (tok !== markSeq) return;
      gMarks.style.transition = "opacity .5s var(--ease-out)";
      gMarks.style.opacity = "0";
    }, hold);
    later(() => {
      if (tok === markSeq) gMarks.innerHTML = "";
    }, hold + 560);
  }

  function clearMarks(): void {
    markSeq++;
    gMarks.style.opacity = "0";
    gMarks.innerHTML = "";
  }

  /* ── 트윈 morph(14스텝×28ms, rAF 금지) ── */
  function morph(target: Pt[], onDone: () => void): void {
    animating = true;
    const from = cur.map((p) => ({ ...p }));
    const STEPS = 14;
    for (let k = 1; k <= STEPS; k++) {
      later(() => {
        const t = k / STEPS;
        const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
        cur = from.map((p, i) => ({ x: p.x + (target[i].x - p.x) * e, y: p.y + (target[i].y - p.y) * e }));
        paintShape();
        if (k === STEPS) {
          animating = false;
          onDone();
        }
      }, k * 28);
    }
  }

  /* ── helper 문구(국면·단계별 다음 행동 안내) ── */
  function helperFor(): string {
    switch (stage) {
      case "quad":
        return donePaths.size
          ? "다시 출발! 조건 계단을 쌓아 <b>남은 갈래</b>로 정사각형까지 가 보세요."
          : "아무렇게나 생긴 사각형에서 출발! 조건을 하나씩 추가해 <b>정사각형까지</b> 진화시켜 보세요.";
      case "trap":
        return "한 쌍의 대변이 평행해졌어요. 이번엔 <b>다른 한 쌍</b>까지 평행하게 만들어 보세요.";
      case "para": {
        if (donePaths.size === 0)
          return "여기서 길이 갈려요! <b>직각</b>을 먼저 줄까요, <b>이웃 변</b>을 먼저 같게 할까요? 끌리는 쪽을 골라 보세요.";
        return donePaths.has("rect")
          ? "다른 갈래로도 가 봐요. 이번엔 <b>이웃 변부터</b>!"
          : "다른 갈래로도 가 봐요. 이번엔 <b>직각부터</b>!";
      }
      case "rect":
        return "네 각이 모두 직각인 직사각형! 이제 <b>마지막 조건</b> 하나만 더 추가해 보세요.";
      case "rhom":
        return "네 변이 모두 같은 마름모! 이제 <b>마지막 조건</b> 하나만 더 추가해 보세요.";
      default:
        return "";
    }
  }

  /* ── 조작 버튼(유효한 진화 조건만 표시 + 리셋) ── */
  function setActionsEnabled(b: boolean): void {
    actions.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = !b));
  }

  function renderActions(): void {
    clear(actions);
    if (phase !== "explore" || stage === "sq") return;
    const add = (label: string, to: StageId): void => {
      const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: label }));
      b.addEventListener("click", () => {
        if (!b.disabled) evolve(to);
      });
      actions.appendChild(b);
    };
    if (stage === "quad") add("한 쌍의 대변을 평행하게", "trap");
    else if (stage === "trap") add("다른 한 쌍도 평행하게", "para");
    else if (stage === "para") {
      if (!donePaths.has("rect")) add("한 내각을 직각으로", "rect");
      if (!donePaths.has("rhom")) add("이웃하는 두 변의 길이를 같게", "rhom");
    } else if (stage === "rect") add("이웃하는 두 변의 길이를 같게", "sq");
    else if (stage === "rhom") add("한 내각을 직각으로", "sq");
    if (stage !== "quad") {
      const r = el(
        "button",
        { class: "ct-btn", attrs: { type: "button", "aria-label": "처음 사각형으로 돌아가기" } },
        el("span", { text: "처음부터" }),
      );
      r.addEventListener("click", () => {
        if (!r.disabled) reset();
      });
      actions.appendChild(r);
      later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }
  }

  /* ── 진화·되감기·리셋 ── */
  function evolve(to: StageId): void {
    if (animating || phase !== "explore") return;
    haptic(HAPTIC.select);
    setActionsEnabled(false);
    clearMarks();
    const edge = `${stage}-${to}`;
    const from = stage;
    morph(SHAPES[to], () => {
      stage = to;
      visited.add(to);
      litEdges.add(edge);
      paintTree();
      setBadge(NAMES[to]);
      if (to === "sq") arriveSquare(from);
      else {
        haptic(HAPTIC.correct);
        showMarks(to);
        toast(TOASTS[to]);
        helper.innerHTML = helperFor();
        renderActions();
      }
    });
  }

  function arriveSquare(from: StageId): void {
    const br: BranchId = from === "rect" ? "rect" : "rhom";
    const first = donePaths.size === 0;
    donePaths.add(br);
    chips.on(br === "rect" ? "pathA" : "pathB", "도착!");
    haptic(HAPTIC.correct);
    clear(actions);
    showMarks("sq", 1500);
    poly.classList.add("glow");
    later(() => poly.classList.remove("glow"), 1400);
    if (first) {
      toast(`${NAMES[br]} 경로로 정복! 평행 두 쌍에 직각과 같은 변까지, 조건이 차곡차곡 쌓였어요.`);
      helper.innerHTML = "첫 갈래 완주! 평행사변형으로 <b>되감아서</b> 다른 갈래도 확인해 볼게요.";
      later(rewind, 1900);
    } else {
      toast(`${NAMES[br]} 경로로도 도착! 정사각형은 두 갈래가 만나는 종착역이에요.`);
      phase = "ask";
      helper.innerHTML = "계보 완성! 마지막으로 <b>포함 판정</b> 하나만 남았어요.";
      later(askIncl, 1800);
    }
  }

  function rewind(): void {
    if (phase !== "explore") return;
    clearMarks();
    morph(SHAPES.para, () => {
      stage = "para";
      paintTree();
      setBadge(NAMES.para);
      helper.innerHTML = helperFor();
      renderActions();
    });
  }

  function reset(): void {
    if (animating || phase !== "explore") return;
    haptic(HAPTIC.tap);
    setActionsEnabled(false);
    clearMarks();
    morph(SHAPES.quad, () => {
      stage = "quad";
      paintTree();
      setBadge(NAMES.quad);
      toast(TOASTS.quad);
      helper.innerHTML = helperFor();
      renderActions();
    });
  }

  /* ── 국면 3: 포함 판정(mq6 문법) ── */
  function askIncl(): void {
    qline.innerHTML = "진화의 규칙을 봤어요. 그럼 <b>정사각형은 직사각형일까요?</b>";
    const items = [
      {
        t: "네, 직사각형의 조건(네 각이 모두 직각)을 전부 갖췄으니 직사각형이에요",
        good: true,
        fb: "정확해요! 직사각형의 자격은 '네 각이 모두 직각' 하나뿐이고, 정사각형은 그 자격을 전부 갖춘 특별한 직사각형이에요.",
      },
      {
        t: "아니요, 정사각형은 정사각형이지 직사각형이 아니에요",
        good: false,
        fb: "모양 고정관념 함정이에요! 직사각형의 자격은 '네 각이 모두 직각'뿐인데, 정사각형은 이 조건을 전부 만족해요. 조건을 추가해서 도착했으니 이전 이름의 자격도 그대로 갖고 있죠.",
      },
      {
        t: "직사각형이 정사각형에 포함되는 거예요(거꾸로)",
        good: false,
        fb: "방향이 반대예요! 조건이 더 많은 쪽이 더 좁은 무리예요. 정사각형이 조건을 더 많이 갖췄으니, 정사각형 무리가 직사각형 무리 안에 쏙 들어가요.",
      },
    ];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
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
        later(finish, it.good ? 2100 : 3200);
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function finish(): void {
    if (phase === "done") return;
    phase = "done";
    qline.innerHTML = "";
    clear(ctl);
    chips.on("incl", "직사각형 맞아요");
    haptic(HAPTIC.done);
    helper.innerHTML =
      "조건을 추가해도 이전 자격은 사라지지 않아요. 그래서 정사각형은 " +
      "<b>직사각형이자 마름모이자 평행사변형이자 사다리꼴</b>!";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "정리하러 가기");
  }

  /* ── 초기화 ── */
  paintShape();
  paintTree();
  helper.innerHTML = helperFor();
  renderActions();
  api.setCTA("계보를 완성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
