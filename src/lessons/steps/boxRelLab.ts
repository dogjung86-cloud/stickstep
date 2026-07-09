// boxRelLab, 공간에서 두 직선의 위치 관계(Ⅳ L7 기함 — 교과서 154쪽 꼬인 위치).
// 직육면체를 SVG 3D 투영으로 그리고 드래그로 회전한다(재계산은 pointermove 이벤트에서만, rAF 금지).
// 숨은 모서리는 교과서 그림처럼 점선(양쪽 인접 면이 모두 뒷면일 때) — 면 법선 판정.
// 미션: 기준 모서리 AB에 대해 모서리 6개를 [만난다/평행/꼬인 위치]로 판정.
// 핵심 체험: 정면에서 겹쳐 보이는 AB·CG가 돌려 보면 만나지 않음(꼬인 위치는 회전해야 보인다).
// 채점 아님(발견 랩), 전 목표 달성 시 recordQuiz(true)+enableCTA.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface BoxStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Verdict = "meet" | "para" | "skew";

const NS = "http://www.w3.org/2000/svg";
const W = 340;
const H = 262;
const CX = W / 2;
const CY = H / 2 + 4;
const F = 560; // 약한 원근 초점 거리

/* 직육면체 절반 치수(가로·세로·깊이) */
const DX = 78;
const DY = 52;
const DZ = 56;

/* 꼭짓점(윗면 ABCD·아랫면 EFGH, A 아래가 E — 교과서 155쪽 라벨 관례) */
const VERTS: Record<string, [number, number, number]> = {
  A: [-DX, -DY, DZ],
  B: [DX, -DY, DZ],
  C: [DX, -DY, -DZ],
  D: [-DX, -DY, -DZ],
  E: [-DX, DY, DZ],
  F: [DX, DY, DZ],
  G: [DX, DY, -DZ],
  H: [-DX, DY, -DZ],
};

const EDGES: [string, string][] = [
  ["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"],
  ["E", "F"], ["F", "G"], ["G", "H"], ["H", "E"],
  ["A", "E"], ["B", "F"], ["C", "G"], ["D", "H"],
];

/* 면 법선과 면-모서리 인접(숨은 모서리 = 인접 두 면이 모두 뒷면) */
const FACES: { n: [number, number, number]; edges: string[] }[] = [
  { n: [0, -1, 0], edges: ["AB", "BC", "CD", "DA"] }, // 윗면
  { n: [0, 1, 0], edges: ["EF", "FG", "GH", "HE"] }, // 아랫면
  { n: [0, 0, 1], edges: ["AB", "AE", "BF", "EF"] }, // 앞면
  { n: [0, 0, -1], edges: ["CD", "CG", "DH", "GH"] }, // 뒷면
  { n: [1, 0, 0], edges: ["BC", "BF", "CG", "FG"] }, // 오른면
  { n: [-1, 0, 0], edges: ["DA", "AE", "DH", "HE"] }, // 왼면
];

interface Mission {
  edge: string;
  ans: Verdict;
  ok: string;
  hint: string;
}

const MISSIONS: Mission[] = [
  {
    edge: "BC", ans: "meet",
    ok: "점 B를 함께 갖고 있으니, 한 점에서 만나요!",
    hint: "두 모서리가 같은 꼭짓점을 지나는지 봐요. B가 보이나요?",
  },
  {
    edge: "CD", ans: "para",
    ok: "윗면의 마주 보는 두 모서리, 방향이 같고 만나지 않아요. 평행!",
    hint: "돌려 보세요. 두 모서리가 나란히 달리나요, 아니면 어긋나 있나요?",
  },
  {
    edge: "CG", ans: "skew",
    ok: "화면에선 겹쳐 보였지만, 돌려 보면 만나지도 않고 나란하지도 않죠. 이게 꼬인 위치!",
    hint: "상자를 돌려서 옆에서 봐요. 정말 닿아 있나요? 방향은 나란한가요?",
  },
  {
    edge: "EF", ans: "para",
    ok: "AB 바로 아래층에서 같은 방향으로! 만나지 않고 나란하니 평행이에요.",
    hint: "AB와 방향을 비교해 봐요. 아래층에서 같은 쪽으로 달리고 있지 않나요?",
  },
  {
    edge: "EH", ans: "skew",
    ok: "만나지도, 나란하지도 않아요. 아래층 왼쪽 깊이 방향의 모서리, 꼬인 위치예요!",
    hint: "연장해도 만날 수 없고, 방향도 달라요. 만남도 평행도 아니면?",
  },
  {
    edge: "AD", ans: "meet",
    ok: "점 A에서 만나요! 만나는 두 모서리는 한 평면(윗면) 위에 있죠.",
    hint: "왼쪽 위 꼭짓점을 잘 봐요. AB와 AD가 공유하는 점이 있어요.",
  },
];

const VERDICT_LABEL: Record<Verdict, string> = {
  meet: "한 점에서 만나요",
  para: "평행해요",
  skew: "꼬인 위치예요",
};

export const boxRelLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BoxStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "mp", label: "만남·평행", sub: "0/4" },
    { id: "skew", label: "꼬인 위치", sub: "0/2" },
    { id: "spin", label: "탐정의 회전", sub: "돌려 보기" },
  ]);

  const board = mboard(500);
  const qCard = el("div", { class: "mdr-q mbx-q" });
  const stage = el("div", { class: "mbx-stage" });
  stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="${NS}" fill="none"><g class="mbx-scene"></g></svg>`;
  const btnRow = el("div", { class: "mbx-verdicts" });
  board.append(qCard, stage, btnRow);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "상자를 <b>드래그해서 빙글빙글</b> 돌려 보세요. 파란 기준 모서리가 <b>AB</b>예요.",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gScene = svg.querySelector(".mbx-scene") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const chipSub = (id: string): HTMLElement => chips.el.querySelector(`[data-g="${id}"] span`) as HTMLElement;

  /* ── 3D 투영 ── */
  let ry = -0.62; // 회전(라디안)
  let rx = -0.38;

  function proj(v: [number, number, number]): { x: number; y: number; z: number } {
    const [x, y, z] = v;
    const cy1 = Math.cos(ry);
    const sy1 = Math.sin(ry);
    const cx1 = Math.cos(rx);
    const sx1 = Math.sin(rx);
    const x1 = x * cy1 + z * sy1;
    const z1 = -x * sy1 + z * cy1;
    const y2 = y * cx1 - z1 * sx1;
    const z2 = y * sx1 + z1 * cx1;
    const sc = F / (F - z2);
    return { x: CX + x1 * sc, y: CY + y2 * sc, z: z2 };
  }

  /** 회전만 적용한 벡터(법선 판정용). */
  function rotv(v: [number, number, number]): [number, number, number] {
    const [x, y, z] = v;
    const cy1 = Math.cos(ry);
    const sy1 = Math.sin(ry);
    const cx1 = Math.cos(rx);
    const sx1 = Math.sin(rx);
    const x1 = x * cy1 + z * sy1;
    const z1 = -x * sy1 + z * cy1;
    const y2 = y * cx1 - z1 * sx1;
    const z2 = y * sx1 + z1 * cx1;
    return [x1, y2, z2];
  }

  const edgeKey = (a: string, b: string): string => a + b;

  let missionIdx = 0;
  let mpOk = 0;
  let skewOk = 0;
  let spun = 0; // 누적 회전량(도)
  let locking = false;
  let done = false;

  function redraw(): void {
    const P: Record<string, { x: number; y: number; z: number }> = {};
    for (const k of Object.keys(VERTS)) P[k] = proj(VERTS[k]);

    // 면 가시성 → 숨은 모서리(점선) 판정
    const visibleFaces = FACES.map((f) => rotv(f.n)[2] > 0.02);
    const hidden = new Set<string>();
    for (const [a, b] of EDGES) {
      const key = edgeKey(a, b);
      const adj = FACES.map((f, i) => ({ f, i })).filter(({ f }) => f.edges.includes(key));
      if (adj.every(({ i }) => !visibleFaces[i])) hidden.add(key);
    }

    const mission = missionIdx < MISSIONS.length ? MISSIONS[missionIdx] : null;
    const missionEdge = mission?.edge ?? "";
    let sHid = "";
    let sVis = "";
    let sHi = "";
    for (const [a, b] of EDGES) {
      const key = edgeKey(a, b);
      const p1 = P[a];
      const p2 = P[b];
      const isBase = key === "AB";
      const isMission = key === missionEdge;
      const line = (color: string, w2: number, dash: string): string =>
        `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${color}" stroke-width="${w2}"${dash ? ` stroke-dasharray="${dash}"` : ""} stroke-linecap="round"/>`;
      if (isBase || isMission) {
        const color = isBase ? GEO.hlB : GEO.hlA;
        const dash = hidden.has(key) ? "7 6" : "";
        sHi += line(color, 4.6, dash);
        if (!hidden.has(key)) sHi = line("#FFFFFF", 7.4, "") + sHi; // 밑광(가독)
      } else if (hidden.has(key)) {
        sHid += line("#A9B6C6", 1.9, "6 6");
      } else {
        sVis += line(GEO.ink, 2.6, "");
      }
    }

    // 꼭짓점 라벨(중심에서 바깥으로 살짝 밀어 배치)
    let sLab = "";
    for (const k of Object.keys(P)) {
      const p = P[k];
      const dx = p.x - CX;
      const dy = p.y - CY;
      const dl = Math.hypot(dx, dy) || 1;
      const lx = p.x + (dx / dl) * 13;
      const ly = p.y + (dy / dl) * 13 + 4;
      const on = k === "A" || k === "B" || missionEdge.includes(k);
      sLab +=
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.6" fill="${on ? GEO.ink : "#8CA0B4"}"/>` +
        `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${on ? GEO.ink : "#8CA0B4"}">${k}</text>`;
    }

    // 기준 태그
    const mAB = { x: (P.A.x + P.B.x) / 2, y: (P.A.y + P.B.y) / 2 };
    const tagBase = `<g><rect x="${(mAB.x - 26).toFixed(1)}" y="${(mAB.y - 26).toFixed(1)}" width="52" height="17" rx="8.5" fill="#E6F7FB" stroke="#0DA5C6" stroke-width="1"/><text x="${mAB.x.toFixed(1)}" y="${(mAB.y - 13.5).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="900" fill="#0A87A3">기준 AB</text></g>`;

    gScene.innerHTML = sHid + sVis + sHi + sLab + tagBase;
  }

  /* ── 드래그 회전(포인터 이벤트에서만 재계산) ── */
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  svg.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    capturePointer(svg, e.pointerId);
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    ry += dx * 0.011;
    rx = Math.max(-1.15, Math.min(1.15, rx + dy * 0.009));
    if (!chips.has("spin")) {
      spun += Math.abs(dx * 0.011) * 57.3 + Math.abs(dy * 0.009) * 57.3;
      if (spun >= 200) {
        chips.on("spin", "빙글빙글!");
        toast("모든 각도에서 확인하는 것, 그게 공간 탐정의 기본!");
        maybeFinish();
      }
    }
    redraw();
  });
  const endDrag = (): void => {
    dragging = false;
  };
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);

  /* ── 미션 진행 ── */
  const btns: Record<Verdict, HTMLButtonElement> = {
    meet: el("button", { class: "mbx-vd", text: VERDICT_LABEL.meet, attrs: { type: "button" } }) as HTMLButtonElement,
    para: el("button", { class: "mbx-vd", text: VERDICT_LABEL.para, attrs: { type: "button" } }) as HTMLButtonElement,
    skew: el("button", { class: "mbx-vd", text: VERDICT_LABEL.skew, attrs: { type: "button" } }) as HTMLButtonElement,
  };
  (Object.keys(btns) as Verdict[]).forEach((v) => {
    btns[v].addEventListener("click", () => judge(v));
    btnRow.appendChild(btns[v]);
  });

  function askMission(): void {
    const m = MISSIONS[missionIdx];
    qCard.innerHTML = `<span class="mbx-k">${missionIdx + 1}/${MISSIONS.length}</span> 기준 <b>AB</b>와 주황 모서리 <b>${m.edge}</b>, 둘의 사이는?`;
    redraw();
  }

  function judge(v: Verdict): void {
    if (locking || done || missionIdx >= MISSIONS.length) return;
    const m = MISSIONS[missionIdx];
    if (v === m.ans) {
      locking = true;
      haptic(HAPTIC.correct);
      btns[v].classList.add("ok");
      toast(m.ok);
      if (m.ans === "skew") {
        skewOk += 1;
        chipSub("skew").textContent = `${skewOk}/2`;
        if (skewOk >= 2) chips.on("skew", "2/2!");
      } else {
        mpOk += 1;
        chipSub("mp").textContent = `${mpOk}/4`;
        if (mpOk >= 4) chips.on("mp", "4/4!");
      }
      later(() => {
        btns[v].classList.remove("ok");
        locking = false;
        missionIdx += 1;
        if (missionIdx < MISSIONS.length) {
          askMission();
          if (MISSIONS[missionIdx].ans === "skew") helper.innerHTML = "판정 전에 <b>꼭 돌려 보세요.</b> 겹쳐 보이는 게 진짜 만나는 걸까요?";
        } else {
          qCard.innerHTML = `<span class="mbx-k">완료</span> 만남 · 평행 · 꼬인 위치, 공간의 세 관계를 전부 갈랐어요!`;
          helper.innerHTML = "꼬인 위치의 두 모서리는 <b>한 평면 위에 놓을 수 없다</b>는 것, 돌려 보며 느꼈나요? 그게 공간만의 관계인 이유예요.";
          maybeFinish();
        }
      }, 1250);
    } else {
      haptic(HAPTIC.wrong);
      btns[v].classList.add("no");
      toast(m.hint);
      later(() => btns[v].classList.remove("no"), 700);
    }
  }

  function maybeFinish(): void {
    if (done) return;
    if (missionIdx >= MISSIONS.length && chips.has("spin")) {
      done = true;
      haptic(HAPTIC.done);
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    } else if (missionIdx >= MISSIONS.length) {
      helper.innerHTML = "마지막 하나! 상자를 <b>한 바퀴 빙글</b> 돌려 보면 목표 완성이에요.";
    }
  }

  askMission();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
