// orLab, 또는 검문소(중2 Ⅵ L2 — 합의 규칙 발견 랩). "겹치면 통과 불가"를 충돌 연출로.
// 무대: 두 그룹 상자(왼쪽 레드, 오른쪽 블루 — orGroupsFig의 두 묶음 문법) + 아래 합치기 지대.
// 국면 3개: 1 분식집(면 2 + 밥 3, 겹침 없음 → 2+3=5) → 2 주사위 함정(3의 배수 {3,6} + 6의 눈 {6},
//   6 칩 두 개가 가운데서 충돌·골드로 변색 + 붉은 반짝 → "진짜 경우의 수는?" 판정) →
//   3 검문 규칙 판정("동시에 일어나지 않을 때"만 덧셈 허가).
// 골드 칩 = "양쪽 묶음에 속한 항목"(orGroupsFig overlap과 같은 색 언어). 오답 피드백은 고른 오개념을 짚는다.
// 뼈대는 meanPullLab 계승(칩→helper→보드, mq6 판정 문법). rAF 금지 — CSS 트랜지션+setTimeout 체인,
// 칩 이동·충돌 반짝은 인라인 style(transform/opacity)이라 새 CSS 없이도 동작한다.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface OrLabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 218;
const SPRING = "transform .55s var(--spring-soft), opacity .4s ease";

interface ChipSpec {
  key: string;
  label: string;
  side: "L" | "R";
  w: number;
  h: number;
  fs: number;
  home: [number, number];
  merge: [number, number];
}

// 국면 1: 분식집(겹침 없음) — 합치면 한 줄로 5칸
const P1CHIPS: ChipSpec[] = [
  { key: "n1", label: "칼국수", side: "L", w: 58, h: 28, fs: 12, home: [25, 56], merge: [15, 160] },
  { key: "n2", label: "우동", side: "L", w: 58, h: 28, fs: 12, home: [93, 56], merge: [78, 160] },
  { key: "b1", label: "김밥", side: "R", w: 58, h: 28, fs: 12, home: [189, 34], merge: [141, 160] },
  { key: "b2", label: "볶음밥", side: "R", w: 58, h: 28, fs: 12, home: [259, 34], merge: [204, 160] },
  { key: "b3", label: "덮밥", side: "R", w: 58, h: 28, fs: 12, home: [223, 68], merge: [267, 160] },
];
// 국면 2: 주사위(겹침 함정) — 6 두 장이 가운데서 충돌(겹침)하도록 목적지를 포갠다
const P2CHIPS: ChipSpec[] = [
  { key: "d3", label: "3", side: "L", w: 36, h: 36, fs: 15.5, home: [46, 50], merge: [120, 158] },
  { key: "l6", label: "6", side: "L", w: 36, h: 36, fs: 15.5, home: [94, 50], merge: [162, 155] },
  { key: "r6", label: "6", side: "R", w: 36, h: 36, fs: 15.5, home: [234, 50], merge: [176, 165] },
];

const DEFS =
  `<defs>` +
  `<linearGradient id="orl-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset=".55" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>` +
  `<linearGradient id="orl-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8AB4FF"/><stop offset=".55" stop-color="#4A7BE8"/><stop offset="1" stop-color="#2A57C2"/></linearGradient>` +
  `<linearGradient id="orl-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9B0"/><stop offset=".55" stop-color="#F1C75C"/><stop offset="1" stop-color="#E0A92E"/></linearGradient>` +
  `<linearGradient id="orl-boxr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FEF6F2"/><stop offset=".55" stop-color="#FBECE6"/><stop offset="1" stop-color="#F4D8CD"/></linearGradient>` +
  `<linearGradient id="orl-boxb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F8FE"/><stop offset=".55" stop-color="#EAF1FD"/><stop offset="1" stop-color="#D6E3FA"/></linearGradient>` +
  `<linearGradient id="orl-zone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8FAFC"/><stop offset=".55" stop-color="#F1F4F9"/><stop offset="1" stop-color="#E6EBF3"/></linearGradient>` +
  `<radialGradient id="orl-key" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>` +
  `</defs>`;

/** 두 그룹 상자(헤더는 국면마다 교체). */
function boxesSvg(p: 1 | 2): string {
  const hL = p === 1 ? "면 종류" : "3의 배수의 눈";
  const hR = p === 1 ? "밥 종류" : "6의 눈";
  const box = (x: number, grad: string, stroke: string, head: string, headFill: string): string =>
    `<ellipse cx="${x + 76}" cy="104.5" rx="66" ry="4.5" fill="#2A3A5E" opacity=".1"/>` +
    `<rect x="${x}" y="8" width="152" height="94" rx="14" fill="url(#${grad})" stroke="${stroke}" stroke-width="1.6"/>` +
    `<ellipse cx="${x + 36}" cy="15" rx="30" ry="6.5" fill="url(#orl-key)" opacity=".55"/>` +
    `<text x="${x + 76}" y="27" text-anchor="middle" font-size="12.5" font-weight="900" fill="${headFill}">${head}</text>`;
  return box(12, "orl-boxr", "#C92A2A", hL, "#8F1D1D") + box(176, "orl-boxb", "#4A7BE8", hR, "#1D4E8F");
}

/** 그룹 칩(로컬 0,0 기준 — 위치는 style.transform으로만). 레드/블루는 orGroupsFig 칩 문법 그대로. */
function chipSvg(c: ChipSpec): string {
  const red = c.side === "L";
  return (
    `<g class="orl-chip" data-k="${c.key}"` +
    ` style="transform:translate(${c.home[0]}px,${c.home[1]}px);transition:${SPRING}">` +
    `<rect x=".7" y=".7" width="${c.w - 1.4}" height="${c.h - 1.4}" rx="${c.h > 30 ? 9 : 13}" fill="url(#${red ? "orl-red" : "orl-blue"})" stroke="${red ? "#8F1D1D" : "#1D4E8F"}" stroke-width="1.4"/>` +
    `<ellipse cx="${(c.w * 0.32).toFixed(1)}" cy="6" rx="${(c.w * 0.24).toFixed(1)}" ry="3" fill="#FFFFFF" opacity=".4"/>` +
    `<text x="${c.w / 2}" y="${(c.h / 2 + c.fs * 0.36).toFixed(1)}" text-anchor="middle" font-size="${c.fs}" font-weight="800" fill="#FFFFFF">${c.label}</text>` +
    `</g>`
  );
}

export const orLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as OrLabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "plus", label: "겹침 없음", sub: "그대로 더하기" },
    { id: "clash", label: "겹침 발견", sub: "함정 조심" },
    { id: "rule", label: "검문 규칙", sub: "언제 더할까" },
  ]);

  const board = mboard(560);
  const stage = el("div", { class: "orl-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none" style="width:100%;height:auto;display:block">` +
    DEFS +
    // 합치기 지대(점선 검문 구역)
    `<g class="orl-zoneg">` +
    `<ellipse cx="170" cy="208.5" rx="140" ry="4.5" fill="#2A3A5E" opacity=".1"/>` +
    `<rect x="12" y="128" width="316" height="78" rx="14" fill="url(#orl-zone)" stroke="#97A3BE" stroke-width="1.6" stroke-dasharray="7 5"/>` +
    `<text x="170" y="145" text-anchor="middle" font-size="11" font-weight="800" fill="#64748B">합치기 지대</text>` +
    `</g>` +
    `<g class="orl-boxes">${boxesSvg(1)}</g>` +
    `<g class="orl-chips">${P1CHIPS.map(chipSvg).join("")}</g>` +
    `<g class="orl-fx"><rect class="orl-halo" x="150" y="145" width="76" height="58" rx="12" fill="#C92A2A" style="opacity:0;transition:opacity .16s linear"/></g>` +
    `</svg>`;

  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", {
    class: "mq6-inst",
    html: "오늘은 <b>한 그릇만</b>! 면 또는 밥 중에서 고를 수 있는 경우는 모두 몇 가지일까요?",
  });
  const meter = el("div", { class: "mq6-gauge", html: "왼쪽 <b>2</b>가지 · 오른쪽 <b>3</b>가지" });
  const eqs = el("div", { class: "mq6-eqs" });
  const qline = el("div", { class: "mq6-q" }); // 판정 질문은 항상 선택지 바로 위
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, meter, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "분식집 메뉴판이에요. 왼쪽 상자와 오른쪽 상자에 <b>겹치는 메뉴</b>가 있는지 확인하고 <b>합치기</b>를 눌러요!",
  });
  host.append(chips.el, helper, board); // 칩 → helper(지시) → 보드 순서
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gBoxes = svg.querySelector(".orl-boxes") as SVGGElement;
  const gChips = svg.querySelector(".orl-chips") as SVGGElement;
  const halo = svg.querySelector(".orl-halo") as SVGRectElement;
  const chipEl = (k: string): SVGGElement | null =>
    svg.querySelector(`.orl-chip[data-k="${k}"]`) as SVGGElement | null;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phase: 1 | 2 | 3 = 1;
  let lock = false;
  let finished = false;

  /** 겹침 적발 칩은 골드로 — "양쪽 묶음에 속한 항목"(orGroupsFig)과 같은 색 언어. */
  function goldify(k: string): void {
    const g = chipEl(k);
    if (!g) return;
    const r = g.querySelector("rect");
    const t = g.querySelector("text");
    r?.setAttribute("fill", "url(#orl-gold)");
    r?.setAttribute("stroke", "#8C6A1E");
    r?.setAttribute("stroke-width", "2.2");
    t?.setAttribute("fill", "#5A4A18");
  }

  /** 판정 선택지 한 줄(정답 1 + 오개념 오답 2 — 오답 문구는 고른 오개념을 짚는다). */
  function choiceRow(defs: [string, boolean, string][], wide: boolean, onOk: () => void): HTMLElement {
    const row = el("div", { class: "mq6-choices" });
    defs.forEach(([label, ok, msg]) => {
      const b = el("button", { class: `mq6-choice${wide ? " wide" : ""}`, text: label, attrs: { type: "button" } });
      b.addEventListener("click", () => {
        if (finished) return;
        if (ok) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          onOk();
        } else {
          haptic(HAPTIC.cross);
          b.classList.add("no");
          later(() => b.classList.remove("no"), 650);
          toast(msg);
        }
      });
      row.appendChild(b);
    });
    return row;
  }

  /* ── [합치기] — 국면 1은 통과, 국면 2는 충돌 ── */
  function doMerge(): void {
    if (lock || finished || phase === 3) return;
    lock = true;
    mergeBtn.disabled = true;
    mergeBtn.classList.remove("mq6-pulse");
    haptic(HAPTIC.tap);
    const specs = phase === 1 ? P1CHIPS : P2CHIPS;
    specs.forEach((c) => {
      const g = chipEl(c.key);
      if (g) g.style.transform = `translate(${c.merge[0]}px,${c.merge[1]}px)`;
    });
    if (phase === 1) {
      later(() => {
        haptic(HAPTIC.correct);
        toast("검문 통과! 겹치는 메뉴가 없어요");
        eqs.appendChild(
          el("div", {
            class: "mq6-eq mq6-pop",
            html: "겹침이 없으니 그대로 더하기! 면 2가지 + 밥 3가지, <b>2+3=5</b>가지",
          }),
        );
        chips.on("plus", "2+3=5");
        later(startPhase2, 2200);
      }, 750);
    } else {
      later(clash, 750);
    }
  }

  function startPhase2(): void {
    if (finished) return;
    phase = 2;
    svg.querySelectorAll<SVGGElement>(".orl-chip").forEach((c) => {
      c.style.opacity = "0";
    });
    later(() => {
      gBoxes.innerHTML = boxesSvg(2);
      gChips.innerHTML = P2CHIPS.map(chipSvg).join("");
      meter.innerHTML = "왼쪽 <b>2</b>가지 · 오른쪽 <b>1</b>가지";
      inst.innerHTML = "새 사건: 주사위를 한 번 던져 <b>3의 배수 또는 6의 눈</b>이 나온다";
      helper.innerHTML = "이번엔 두 상자에 <b>같은 눈</b>이 보이네요. 그래도 일단 합쳐 볼까요?";
      mergeBtn.textContent = "합치기";
      mergeBtn.disabled = false;
      lock = false;
    }, 460);
  }

  /* ── 국면 2: 충돌 연출 → 진짜 경우의 수 판정 ── */
  function clash(): void {
    haptic(HAPTIC.wrong);
    goldify("l6");
    goldify("r6");
    const seq = [0.34, 0.08, 0.34, 0.08, 0.22]; // 붉은 반짝(마지막은 은은하게 유지)
    seq.forEach((o, i) =>
      later(() => {
        halo.style.opacity = String(o);
      }, i * 150),
    );
    toast("6이 두 번 세졌어요!");
    later(askTruth, 1100);
  }

  function askTruth(): void {
    if (finished) return;
    qline.innerHTML = "이 사건의 진짜 경우의 수는?";
    clear(ctl);
    ctl.appendChild(
      choiceRow(
        [
          ["2가지", true, ""],
          ["3가지", false, "2+1=3은 그냥 더한 값이에요! 겹친 6이 두 번 세졌죠. 실제로 나올 수 있는 눈은 3과 6뿐이에요"],
          ["1가지", false, "겹쳤다고 6을 아예 지우면 안 돼요, 한 번은 세야죠! 3의 눈도 있으니 하나가 아니에요"],
        ],
        false,
        resolveOverlap,
      ),
    );
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function resolveOverlap(): void {
    halo.style.opacity = "0";
    const dup = chipEl("r6");
    if (dup) {
      dup.style.opacity = "0";
      dup.style.transform = "translate(176px,198px)";
    }
    const d3 = chipEl("d3");
    if (d3) d3.style.transform = "translate(129px,160px)";
    const l6 = chipEl("l6");
    if (l6) l6.style.transform = "translate(175px,160px)";
    qline.innerHTML = "";
    eqs.appendChild(
      el("div", { class: "mq6-eq mq6-pop", html: "겹치는 <b>6은 한 번만</b>! 나오는 눈은 <b>3, 6</b>의 <b>2가지</b>예요" }),
    );
    chips.on("clash", "2가지");
    later(startPhase3, 2000);
  }

  /* ── 국면 3: 검문 규칙 판정 ── */
  function startPhase3(): void {
    if (finished) return;
    phase = 3;
    inst.innerHTML = "마지막 검문 규칙: 덧셈은 언제 안전할까요?";
    helper.innerHTML = "분식집은 통과, 주사위는 적발! 두 장면의 차이를 떠올려요";
    qline.innerHTML = "그렇다면 두 경우의 수를 안심하고 더해도 되는 때는?";
    clear(ctl);
    ctl.appendChild(
      choiceRow(
        [
          ["두 사건이 동시에 일어나지 않을 때", true, ""],
          ["두 사건의 경우의 수가 같을 때", false, "가짓수가 같아도 겹치면 두 번 세져요. 분식집은 2가지와 3가지, 개수가 달라도 통과했잖아요!"],
          ["사건이 두 개뿐일 때", false, "사건이 셋이어도 서로 겹치지만 않으면 계속 더할 수 있어요. 개수가 아니라 겹침이 기준!"],
        ],
        true,
        () => {
          qline.innerHTML = "";
          eqs.appendChild(
            el("div", {
              class: "mq6-concl mq6-pop",
              html: "합치기 전 검문: <b>동시에 일어나지 않는가?</b> 통과했을 때만 안심하고 더해요!",
            }),
          );
          chips.on("rule", "덧셈 허가");
          later(finish, 1500);
        },
      ),
    );
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML =
      "'또는'이 보이면 검문 먼저! <b>동시에 일어나지 않을 때만</b> 경우의 수를 더해요. 이제 규칙으로 새기러 가요";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 조립: 합치기 버튼 ── */
  const mergeBtn = el("button", {
    class: "mq6-btn mq6-pulse",
    text: "한 그릇만 고르기: 합치기",
    attrs: { type: "button", "aria-label": "합치기" },
  });
  mergeBtn.addEventListener("click", doMerge);
  ctl.appendChild(mergeBtn);

  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
