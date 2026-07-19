// lineDivLab, 공책 줄 등분기(중2 수학 Ⅴ L8, 평행선 사이의 선분의 길이의 비. 책 207쪽).
// 국면 1(cut): 등간격 공책 줄(5줄, 간격 42px) 위에서 빨간 막대의 양 끝 핸들을 드래그 —
//   핸들은 pointerup에 줄로 스냅. 1번 줄과 4번 줄에 걸치면 중간 줄과의 교점이 하이라이트되고
//   세 조각에 같음 틱 + "3등분!" 배지.
// 국면 2(tilt): 핸들을 좌우로 끌어 기울여도(줄 스냅 유지) 조각 길이 수치는 변하되 1:1:1은
//   그대로 — 큰 각도 변경 2회로 달성('기울기'는 중2 Ⅲ 기왕 용어).
// 국면 3(gap): "다른 공책" 토글 → 간격 28·56·56px 공책으로 교체. 다시 전체를 걸치면 조각이
//   1:2:2(등분 아님!) → 판정 질문(mq6) → 조각 비 = 간격 비를 나란히 강조.
// rAF 금지(CSS 트랜지션 + setTimeout 체인, 타이머는 Set으로 모아 cleanup에서 일괄 해제).
// 스타일: math2.css .ldv- 섹션(+ 중2 Ⅴ 판정 질문 톤 .mq6-q.m2u5q).
import { el, clear, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, tickMark, arrowHead, lineSvg, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Pt {
  x: number;
  y: number;
}

const ROD = "#E03131"; // 빨간 막대
const LINES_EVEN = [42, 84, 126, 168, 210]; // 등간격 공책(간격 42px)
const LINES_UNEVEN = [60, 88, 144, 200]; // 위 1칸 좁고(28) 아래 2칸 넓은(56) 공책
const GAP_U = 42; // 등간격 공책 1칸(px) — 조각 길이 '칸' 환산 기준
const XMIN = 52;
const XMAX = 318;

export const lineDivLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "cut", label: "자 없이 3등분", sub: "1번 줄과 4번 줄" },
    { id: "tilt", label: "기울여도 같은 비", sub: "잠김" },
    { id: "gap", label: "비는 간격 따라", sub: "잠김" },
  ]);

  const board = mboard(520);
  const readout = el("div", { class: "ldv-read", attrs: { "aria-live": "polite" } });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 260" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="공책 줄 등분기 실험 무대">` +
    `<g class="ldv-paper"></g><g class="ldv-rod"></g><g class="ldv-bdg"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q m2u5q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(readout, svgWrap, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "빨간 막대가 공책에 비스듬히 누워 있어요. 양 끝 <b>핸들</b>을 끌어 위 핸들은 <b>1번 줄</b>, 아래 핸들은 <b>4번 줄</b>에 걸쳐 보세요!",
  });
  host.append(chips.el, helper, board); // 칩 → helper(지시) → 보드, 확정 배치
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gPaper = svg.querySelector(".ldv-paper") as SVGGElement;
  const gRod = svg.querySelector(".ldv-rod") as SVGGElement;
  const gBadge = svg.querySelector(".ldv-bdg") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ── 상태 ── */
  let phase: "cut" | "tilt" | "gap" | "ask" | "done" = "cut";
  let uneven = false;
  let lines = LINES_EVEN;
  const P: Pt[] = [
    { x: 96, y: 84 }, // 2번 줄
    { x: 244, y: 168 }, // 4번 줄 — 초기 2등분으로 장치를 먼저 보여 준다
  ];
  let snapped = true;
  let started = false;
  let dragH: 0 | 1 | null = null;
  let dragX0 = 0;
  let tiltCount = 0;
  let asked = false;
  let tick = 0;

  const idxOf = (y: number): number => lines.findIndex((v) => Math.abs(v - y) < 0.5);

  function nearestLineIdx(y: number, exclude: number): number {
    let best = -1;
    let bd = Number.POSITIVE_INFINITY;
    for (let k = 0; k < lines.length; k++) {
      if (k === exclude) continue;
      const d = Math.abs(lines[k] - y);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    return best;
  }

  function popRead(): void {
    readout.classList.remove("mq6-pop");
    void readout.offsetWidth;
    readout.classList.add("mq6-pop");
  }

  const fmt1 = (v: number): string => {
    const r = Math.round(v * 10) / 10;
    return Number.isInteger(r) ? String(r) : r.toFixed(1);
  };

  /* ── 기하: 스냅된 막대의 줄 스팬·조각 ── */
  function spanIdx(): [number, number] {
    const i0 = idxOf(P[0].y);
    const i1 = idxOf(P[1].y);
    return [Math.min(i0, i1), Math.max(i0, i1)];
  }

  /** 스팬 구간의 줄 간격 목록(px). 조각 길이는 이 간격에 정비례한다(막대가 직선이므로). */
  function pieceGaps(): number[] {
    const [i, j] = spanIdx();
    const g: number[] = [];
    for (let k = i; k < j; k++) g.push(lines[k + 1] - lines[k]);
    return g;
  }

  function ratioStr(g: number[]): string {
    const mn = Math.min(...g);
    return g
      .map((v) => {
        const r = v / mn;
        return Number.isInteger(r) ? String(r) : r.toFixed(1);
      })
      .join(" : ");
  }

  /** 위 끝 → 교점들 → 아래 끝. */
  function divPoints(): Pt[] {
    const top = P[0].y <= P[1].y ? P[0] : P[1];
    const bot = P[0].y <= P[1].y ? P[1] : P[0];
    const pts: Pt[] = [top];
    for (const ly of lines) {
      if (ly > top.y + 0.5 && ly < bot.y - 0.5) {
        const t = (ly - top.y) / (bot.y - top.y);
        pts.push({ x: top.x + (bot.x - top.x) * t, y: ly });
      }
    }
    pts.push(bot);
    return pts;
  }

  /** 조각 같음 틱 개수: 간격 값 그룹별로 1개·2개…(같은 길이끼리 같은 개수). */
  function tickCounts(): number[] {
    const g = pieceGaps();
    const uniq = [...new Set(g)].sort((a, b) => a - b);
    return g.map((v) => uniq.indexOf(v) + 1);
  }

  /* ── 렌더 ── */
  function paintPaper(): void {
    let sv =
      `<rect x="8" y="12" width="324" height="236" rx="12" fill="#FFFDF6" stroke="#EDE2C8" stroke-width="1.5"/>` +
      `<line x1="36" y1="20" x2="36" y2="240" stroke="#F3BCC8" stroke-width="1.6"/>`;
    for (let k = 0; k < lines.length; k++) {
      sv +=
        `<line x1="44" y1="${lines[k]}" x2="326" y2="${lines[k]}" stroke="#A9C7E8" stroke-width="1.8"/>` +
        `<text x="24" y="${lines[k] + 4}" text-anchor="middle" font-size="12" font-weight="800" fill="#9AA8BC">${k + 1}</text>`;
    }
    gPaper.innerHTML = sv;
  }

  function paintRod(): void {
    const a = P[0];
    const b = P[1];
    let marks = "";
    if (snapped) {
      const pts = divPoints();
      const cnt = tickCounts();
      for (let k = 0; k < pts.length - 1; k++) {
        marks += tickMark(pts[k].x, pts[k].y, pts[k + 1].x, pts[k + 1].y, cnt[k], GEO.hlD);
      }
      for (let k = 1; k < pts.length - 1; k++) {
        marks +=
          `<g class="ldv-x"><circle cx="${pts[k].x.toFixed(1)}" cy="${pts[k].y.toFixed(1)}" r="6.5" fill="#FFFFFF" stroke="${GEO.hlB}" stroke-width="2.6"/>` +
          `<circle cx="${pts[k].x.toFixed(1)}" cy="${pts[k].y.toFixed(1)}" r="2.2" fill="${GEO.hlB}"/></g>`;
      }
    }
    const hs = (p: Pt): string =>
      `<g><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="14" fill="rgba(224,49,49,.13)"/>` +
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="7.5" fill="#FFFFFF" stroke="${ROD}" stroke-width="2.8"/></g>`;
    const chev = started
      ? ""
      : arrowHead(a.x, a.y - 24, 90, "#B6C2D2", 6) +
        arrowHead(a.x, a.y + 24, 270, "#B6C2D2", 6) +
        arrowHead(b.x, b.y - 24, 90, "#B6C2D2", 6) +
        arrowHead(b.x, b.y + 24, 270, "#B6C2D2", 6);
    gRod.innerHTML = lineSvg(a.x, a.y, b.x, b.y, ROD, 4.5) + marks + chev + hs(a) + hs(b);
  }

  function showBadge(txt: string, warn: boolean): void {
    const w = Math.max(86, txt.length * 13 + 30);
    gBadge.innerHTML =
      `<g class="ldv-badge"><rect x="${(170 - w / 2).toFixed(1)}" y="8" width="${w}" height="26" rx="9" fill="${warn ? "#FEF3F4" : "#F0FBF5"}" stroke="${warn ? "#F04452" : "#04B45F"}" stroke-width="2"/>` +
      `<text x="170" y="26" text-anchor="middle" font-size="12.5" font-weight="900" fill="${warn ? "#B02A37" : "#1E7A31"}">${txt}</text></g>`;
  }

  function updateRead(): void {
    if (!snapped) {
      readout.classList.remove("warn");
      readout.innerHTML = "<span>핸들을 줄 위에 내려놓아요</span>";
      return;
    }
    const g = pieceGaps();
    const n = g.length;
    if (n === 0) {
      readout.classList.remove("warn");
      readout.innerHTML = "<span>두 핸들을 서로 다른 줄에 놓아요</span>";
      return;
    }
    const equal = g.every((v) => v === g[0]);
    const total = Math.hypot(P[1].x - P[0].x, P[1].y - P[0].y);
    let html = `<span>조각 <b>${n}개</b></span>`;
    if (n >= 2) html += `<span>비 <b>${ratioStr(g)}</b></span>`;
    if (n >= 2 && equal && !uneven) html += `<span>각 <b>${fmt1(total / n / GAP_U)}칸</b></span>`;
    readout.classList.toggle("warn", uneven && n >= 2 && !equal);
    readout.innerHTML = html;
  }

  /* ── 스냅 후 판정 ── */
  function evaluate(dx: number): void {
    paintRod();
    updateRead();
    const g = pieceGaps();
    const n = g.length;
    const equal = n >= 2 && g.every((v) => v === g[0]);
    if (started && equal) showBadge(`${n}등분!`, false);
    else if (uneven && n >= 2 && !equal) showBadge("등분이 아니에요", true);
    else gBadge.innerHTML = "";

    if (phase === "cut") {
      if (n === 3 && equal) {
        chips.on("cut", "3등분 성공!");
        haptic(HAPTIC.correct);
        toast("교점 두 개가 막대를 정확히 3등분했어요. 자로 잰 것도 아닌데요!");
        phase = "tilt";
        helper.innerHTML =
          "우연일까요? 핸들을 <b>좌우로</b> 끌어 막대를 다르게 기울여 보세요. 조각 숫자를 지켜봐요!";
      } else if (n === 2) {
        toast("두 조각이 났어요. 줄을 하나 더 건너 3등분에 도전!");
      } else if (n === 4) {
        toast("4등분까지! 이번 미션은 3등분이에요. 한 줄만 좁혀 봐요.");
      }
      return;
    }
    if (phase === "tilt") {
      if (n === 3 && equal) {
        if (Math.abs(dx) >= 48) {
          tiltCount += 1;
          if (tiltCount === 1) {
            toast("조각 길이는 변했는데 여전히 세 조각이 똑같아요! 한 번 더 크게 기울여 봐요.");
          } else if (chips.on("tilt", "1:1:1 그대로!")) {
            haptic(HAPTIC.correct);
            popRead();
            toast("아무리 비스듬해도 평행한 줄들은 늘 같은 비로 잘라 줘요.");
            helper.innerHTML = "그럼 <b>줄 간격이 다른 공책</b>이라면요? 아래 버튼으로 공책을 바꿔 봐요!";
            showSwapBtn();
          }
        }
      } else {
        toast("세 조각(1번 줄과 4번 줄)을 유지한 채 기울여 봐요!");
      }
      return;
    }
    if (phase === "gap") {
      if (n === 3 && !equal && !asked) {
        asked = true;
        haptic(HAPTIC.wrong);
        popRead();
        toast(`어라, 조각이 ${ratioStr(g)}로 서로 달라요. 등분이 아니에요!`);
        later(askGap, 1100);
      } else if (n < 3) {
        helper.innerHTML = "맨 위 <b>1번 줄</b>부터 맨 아래 <b>4번 줄</b>까지 걸쳐 보세요!";
      }
    }
  }

  /* ── 국면 3: 공책 교체 + 판정 질문 ── */
  function showSwapBtn(): void {
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "다른 공책" }));
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      swapNotebook();
    });
    actions.appendChild(b);
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function swapNotebook(): void {
    uneven = true;
    lines = LINES_UNEVEN;
    phase = "gap";
    clear(actions);
    // 핸들을 새 공책의 줄에 다시 스냅(서로 다른 줄 유지)
    const i0 = nearestLineIdx(P[0].y, -1);
    P[0] = { x: P[0].x, y: lines[i0] };
    const i1 = nearestLineIdx(P[1].y, i0);
    P[1] = { x: P[1].x, y: lines[i1] };
    snapped = true;
    paintPaper();
    toast("위 칸은 좁고 아래 두 칸은 넓은 공책이에요.");
    helper.innerHTML = "이 공책도 등분해 줄까요? 막대를 <b>1번 줄부터 4번 줄까지</b> 다시 걸쳐 보세요!";
    evaluate(0);
  }

  function askGap(): void {
    phase = "ask";
    qline.innerHTML = "간격이 <b>다른</b> 평행선도 선분을 등분해 줄까요?";
    const items = [
      {
        t: "아니요, 하지만 잘린 비는 줄 간격의 비와 똑같아요",
        good: true,
        fb: "정답! 등분은 간격이 같은 줄들만의 특권이에요. 대신 어떤 평행선이든 조각의 비는 줄 간격의 비를 그대로 복사하죠. 지금도 간격 1:2:2, 조각 1:2:2예요.",
      },
      {
        t: "네, 평행하기만 하면 무조건 등분이에요",
        good: false,
        fb: "지금 조각을 보세요, 1:2:2로 서로 달라요! 등분이 되는 건 간격이 같을 때뿐이에요. 다만 평행선은 약속 하나는 지켜요, 조각의 비가 언제나 간격의 비와 같다는 것.",
      },
      {
        t: "평행선은 비스듬한 선분엔 힘을 못 써요",
        good: false,
        fb: "방금 전 실험을 떠올려요, 막대를 아무리 기울여도 1:1:1이 유지됐죠! 비스듬한 선분에도 평행선의 힘은 통해요. 지금 달라진 건 기울기가 아니라 줄 사이 간격이에요.",
      },
    ];
    const row = el("div", { class: "mq6-choices" });
    let picked = false;
    const btns: { bt: HTMLButtonElement; good: boolean }[] = [];
    for (const it of items) {
      const bt = el("button", { class: "mq6-choice wide", text: it.t, attrs: { type: "button" } });
      bt.addEventListener("click", () => {
        if (picked) return;
        picked = true;
        haptic(it.good ? HAPTIC.correct : HAPTIC.wrong);
        for (const z of btns) {
          z.bt.disabled = true;
          if (z.good) z.bt.classList.add("ok");
        }
        if (!it.good) bt.classList.add("no");
        toast(it.fb);
        later(finishGap, 2600);
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function finishGap(): void {
    qline.innerHTML = "";
    clear(ctl);
    const r = ratioStr(pieceGaps());
    readout.classList.remove("warn");
    readout.innerHTML =
      `<span class="ldv-pk">조각 비 <b>${r}</b></span>` +
      `<span class="ldv-pk">간격 비 <b>${r}</b></span>` +
      `<span class="ldv-same">똑같아요!</span>`;
    popRead();
    chips.on("gap", "간격 비 그대로!");
    complete();
  }

  function complete(): void {
    phase = "done";
    haptic(HAPTIC.done);
    helper.innerHTML =
      "자 대신 평행선! 간격이 같으면 <b>등분</b>, 간격이 다르면 <b>그 간격의 비</b> 그대로 잘라 줘요. 가정통신문 3단 접기 미션 성공이에요!";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 포인터(스냅 확정은 pointerup, 캡처는 try/catch 내장 헬퍼) ── */
  function toPt(e: PointerEvent): Pt {
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 340, y: ((e.clientY - r.top) / r.height) * 260 };
  }

  function moveH(p: Pt): void {
    const k = dragH;
    if (k === null) return;
    P[k] = { x: clamp(p.x, XMIN, XMAX), y: clamp(p.y, 26, 244) };
    const q = Math.round(P[k].x / 18) * 100 + Math.round(P[k].y / 18);
    if (q !== tick) {
      tick = q;
      haptic(HAPTIC.tap);
    }
    paintRod();
    updateRead();
  }

  svg.addEventListener("pointerdown", (e) => {
    if (phase === "ask" || phase === "done") return;
    const p = toPt(e);
    const d0 = Math.hypot(p.x - P[0].x, p.y - P[0].y);
    const d1 = Math.hypot(p.x - P[1].x, p.y - P[1].y);
    if (d0 > 30 && d1 > 30) return;
    const k: 0 | 1 = d0 <= d1 ? 0 : 1;
    dragH = k;
    dragX0 = P[k].x;
    started = true;
    snapped = false;
    gBadge.innerHTML = "";
    capturePointer(svg, e.pointerId);
    moveH(p);
  });
  svg.addEventListener("pointermove", (e) => {
    if (dragH !== null) moveH(toPt(e));
  });
  const drop = (): void => {
    if (dragH === null) return;
    const k = dragH;
    dragH = null;
    const other = idxOf(P[1 - k].y);
    const ni = nearestLineIdx(P[k].y, other);
    P[k] = { x: P[k].x, y: lines[ni] };
    snapped = true;
    haptic(HAPTIC.select);
    evaluate(P[k].x - dragX0);
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  paintPaper();
  paintRod();
  updateRead();
  api.setCTA("세 가지 비밀을 모으면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
