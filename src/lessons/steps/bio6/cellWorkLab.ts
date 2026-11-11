// [중1 Ⅱ v5] u2l2 cellWorkLab: 「세포의 구조, 멈추면 어떻게 될까?」(동물) · 「식물세포의 두 구조, 멈추면?」(식물)
// 한 통찰: 세포의 구조마다 맡은 일이 있어서, 한 구조가 멈추면 그 일이 멈춘다(구조와 기능의 관계).
// 무대: 살아 움직이는 세포 하나. 결과가 옆의 목록이 아니라 세포 안에서 보인다.
//   동물: 양분 알갱이가 세포막을 지나 들어온다 → 마이토콘드리아가 에너지 불꽃을 낸다. 핵에서는 조절의 고리가 퍼진다.
//   식물: 햇빛을 받은 엽록체에서 양분이 나온다 → 마이토콘드리아가 에너지를 낸다. 세포벽이 육각형 모양을 잡고 있다.
// 조작: 조작 칸의 구조 카드(또는 그림 속 구조)를 누르면 그 구조만 멈춘다. 다시 누르면 일한다. 한 번에 하나만 멈춘다.
//   세포막이나 엽록체가 멈추면 양분이 끊기고, 조금 뒤 에너지도 꺼진다(양분이 있어야 에너지를 만든다).
// 다 해 보면 "고장 난 곳 찾아보기"(판정 두 번: 무대의 증상만 보고 멈춘 구조를 고른다. 이때는 멈춘 구조를 회색으로
// 칠하지 않는다. 첫 판정만 채점한다).
// 구조 색은 v3 도해와 같다(bio6Kit.BV). 움직임은 CSS 키프레임, 세포벽이 무너지는 모양만 타이머 보간이다.
// 과학 가드: 식물세포의 벽은 막 바깥, 핵은 하나, 엽록체가 만드는 것은 양분이고 에너지는 마이토콘드리아가 만든다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { BV, BV_PART } from "../../../ui/bio6Kit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvFrame, bvTimers, bvTween, type BvCard } from "./b6Lab";

interface CwkStep {
  title: string;
  mode: "animal" | "plant";
  cta?: string;
  curio?: Curio;
}

type Key = "mem" | "nuc" | "mito" | "chl" | "wall";
const ALL: Key[] = ["mem", "nuc", "mito", "chl", "wall"];

const NAME: Record<Key, string> = { mem: "세포막", nuc: "핵", mito: "마이토콘드리아", chl: "엽록체", wall: "세포벽" };
/** 해 본 뒤 카드에 남는 말: 그 구조가 맡은 일. */
const JOB: Record<Key, string> = { mem: "물질 출입 조절", nuc: "생명활동 조절", mito: "에너지 만들기", chl: "양분 만들기", wall: "모양 지키기" };
const SAY: Record<Key, string> = {
  mem: "세포막을 멈추니 <b>양분</b>이 들어오지 못해요. 양분이 없으니 에너지도 꺼져요.",
  nuc: "핵을 멈추니 생명활동이 <b>조절</b>되지 않아 움직임이 뒤죽박죽이에요.",
  mito: "마이토콘드리아를 멈추니 <b>에너지</b>를 만들지 못해 움직임이 멎었어요.",
  chl: "엽록체를 멈추니 햇빛이 비쳐도 <b>양분</b>이 생기지 않아요. 에너지도 꺼져요.",
  wall: "세포벽을 멈추니 세포가 <b>모양</b>을 지키지 못하고 축 처졌어요.",
};

const px = (v: number): string => `${v.toFixed(1)}px`;

// ── 그림 부품 ───────────────────────────────────────────────────────
const DEFS = `
  <defs>
    <radialGradient id="cwkCytoA" cx="42%" cy="36%" r="72%"><stop offset="0" stop-color="#FFF1DC"/><stop offset=".6" stop-color="#FFD9AE"/><stop offset="1" stop-color="#F5B57E"/></radialGradient>
    <radialGradient id="cwkCytoP" cx="42%" cy="36%" r="74%"><stop offset="0" stop-color="#F4FBE0"/><stop offset=".6" stop-color="#DCF0B4"/><stop offset="1" stop-color="#BFDD8C"/></radialGradient>
    <radialGradient id="cwkNuc" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#B9A3FF"/><stop offset=".55" stop-color="#7C5CF0"/><stop offset="1" stop-color="#5632C8"/></radialGradient>
    <linearGradient id="cwkMito" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9E9E"/><stop offset=".55" stop-color="#F25050"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>
    <linearGradient id="cwkChl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CE99A"/><stop offset=".55" stop-color="#40C057"/><stop offset="1" stop-color="#2B8A3E"/></linearGradient>
    <radialGradient id="cwkSun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF9DB"/><stop offset=".6" stop-color="#FFE066"/><stop offset="1" stop-color="#FCC419"/></radialGradient>
  </defs>`;

const nucleus = (x: number, y: number, r: number): string => `
  <g class="cwk-part cwk-nuc" data-k="nuc">
    <circle class="cwk-ring" cx="${x}" cy="${y}" r="${r + 2}" fill="none" stroke="#9775FA" stroke-width="2.2"/>
    <circle class="cwk-ring cwk-ring2" cx="${x}" cy="${y}" r="${r + 2}" fill="none" stroke="#9775FA" stroke-width="2.2"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#cwkNuc)" stroke="#4A2AAE" stroke-width="1.6"/>
    <circle cx="${x + r * 0.12}" cy="${y + r * 0.16}" r="${r * 0.36}" fill="#3F2499" opacity=".75"/>
    <ellipse cx="${x - r * 0.34}" cy="${y - r * 0.42}" rx="${r * 0.34}" ry="${r * 0.18}" fill="#fff" opacity=".4" transform="rotate(-28 ${x - r * 0.34} ${y - r * 0.42})"/>
  </g>`;

/** 에너지 표시(번개). 연한 세포 속에서도, 어두운 무대에서도 읽히게 파란 몸에 흰 테를 두른다. */
const BOLT = "M1.4 -7.4L-4.4 1.2h3.6L-2 7.4 4.4 -1.8H0.7Z";

/** 마이토콘드리아 하나. 에너지(빛무리와 번개 세 개)는 몸통 뒤에서 바깥으로 튀어 나간다. */
const mito = (x: number, y: number, a: number, i: number): string => {
  const sparks = [-50, 10, 70]
    .map((d, j) => {
      const ang = ((a + d + i * 37) * Math.PI) / 180;
      return `<path class="cwk-spark" style="--sx:${px(Math.cos(ang) * 29)};--sy:${px(Math.sin(ang) * 29)};--d:${(-(i * 0.37 + j * 0.47)).toFixed(2)}s" d="${BOLT}" fill="${BV.spark}" stroke="#fff" stroke-width="1.3" stroke-linejoin="round" paint-order="stroke"/>`;
    })
    .join("");
  return `
  <g class="cwk-fx m${i}">
    <ellipse class="cwk-mglow" cx="${x}" cy="${y}" rx="23" ry="15" fill="#FF8787" transform="rotate(${a} ${x} ${y})"/>
    <g transform="translate(${x} ${y})">${sparks}</g>
  </g>
  <g class="cwk-part cwk-mito" data-k="mito">
    <g transform="translate(${x} ${y}) rotate(${a})">
      <rect x="-17" y="-9.5" width="34" height="19" rx="9.5" fill="url(#cwkMito)" stroke="#9C1F1F" stroke-width="1.5"/>
      <path d="M-11 0q2.6 -6 5.4 0t5.4 0 5.4 0 5.4 0" fill="none" stroke="#FFE3E3" stroke-width="2" stroke-linecap="round"/>
    </g>
  </g>`;
};

const chloro = (x: number, y: number, a: number, i: number): string => `
  <g class="cwk-part cwk-chl" data-k="chl" transform="translate(${x} ${y}) rotate(${a})">
    <g class="cwk-chlb" style="--d:${(-i * 0.4).toFixed(2)}s">
      <ellipse rx="19" ry="11" fill="url(#cwkChl)" stroke="#1F6B30" stroke-width="1.5"/>
      <path d="M-9 -5.5v11M-3 -8v16M3 -8v16M9 -5.5v11" stroke="#1F6B30" stroke-width="2" stroke-linecap="round" opacity=".55"/>
      <ellipse cx="-5" cy="-5" rx="7" ry="2.6" fill="#fff" opacity=".35"/>
    </g>
  </g>`;

/** 양분 알갱이. from → via → to 를 따라 흐른다. 세포막이 멈추면 via 바로 바깥에서 튕겨 돌아간다. */
const nutrient = (from: [number, number], via: [number, number], to: [number, number], i: number, cls = ""): string => {
  const bx = via[0] + (from[0] - via[0]) * 0.22;
  const by = via[1] + (from[1] - via[1]) * 0.22;
  return `<circle class="cwk-nutr ${cls}" r="4.6" fill="${BV.nutr}" stroke="#E8A800" stroke-width="1" style="--x0:${px(from[0])};--y0:${px(from[1])};--xm:${px(via[0])};--ym:${px(via[1])};--x1:${px(to[0])};--y1:${px(to[1])};--xb:${px(bx)};--yb:${px(by)};--d:${(-i * 0.62).toFixed(2)}s"/>`;
};

/** 구조 이름표(알약 + 이끎선). anchor end면 x가 알약의 오른쪽 끝이다. (lx, ly)는 가리키는 자리. */
const tag = (x: number, y: number, t: string, lx: number, ly: number, anchor: "start" | "end" = "start"): string => {
  const w = t.length * 12.4 + 16;
  const rx = anchor === "start" ? x : x - w;
  return `
  <g class="cwk-tag" pointer-events="none">
    <path d="M${anchor === "start" ? rx + w : rx} ${y}L${lx} ${ly}" stroke="#9FB3D1" stroke-width="1.2"/>
    <circle cx="${lx}" cy="${ly}" r="2.4" fill="#fff"/>
    <rect x="${rx}" y="${y - 11}" width="${w}" height="22" rx="11" fill="rgba(13,24,44,.82)" stroke="rgba(255,255,255,.22)"/>
    <text x="${rx + w / 2}" y="${y + 4.3}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#EAF0FA">${t}</text>
  </g>`;
};

const nearest = (p: [number, number], list: [number, number, number][]): [number, number] => {
  const s = list.map((m) => [m[0], m[1]] as [number, number]).sort((a, b) => Math.hypot(a[0] - p[0], a[1] - p[1]) - Math.hypot(b[0] - p[0], b[1] - p[1]));
  return s[0];
};

const jigDots = (pts: number[][]): string =>
  pts.map(([x, y], i) => `<circle class="cwk-jig" cx="${x}" cy="${y}" r="2" fill="#fff" opacity=".7" style="--d:${(-i * 0.41).toFixed(2)}s"/>`).join("");

// ── 동물세포 ────────────────────────────────────────────────────────
const A_C: [number, number] = [173, 118];
const A_RX = 100;
const A_RY = 86;
const A_MITO: [number, number, number][] = [
  [118, 84, -24],
  [230, 148, 18],
  [128, 158, 36],
];
const A_NUC: [number, number, number] = [178, 112, 31];

function animalScene(): string {
  const body = `M173 30C232 30 274 68 274 118C274 170 232 206 173 206C112 206 72 170 72 118C72 68 112 30 173 30Z`;
  const rad = (deg: number): number => (deg * Math.PI) / 180;
  const onMem = (deg: number): [number, number] => [A_C[0] + A_RX * Math.cos(rad(deg)), A_C[1] + A_RY * Math.sin(rad(deg))];
  const out = (deg: number): [number, number] => [A_C[0] + 172 * Math.cos(rad(deg)), A_C[1] + 132 * Math.sin(rad(deg))];
  const nutr = [200, 20, 150, 340, 235, 75]
    .map((deg, i) => {
      const via = onMem(deg);
      return nutrient(out(deg), via, nearest(via, A_MITO), i);
    })
    .join("");
  return `
  <svg class="cwk-svg" viewBox="0 0 346 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="일하고 있는 동물세포">
    ${DEFS}
    <g class="cwk-cellg">
      <path class="cwk-body" d="${body}" fill="url(#cwkCytoA)"/>
      <g class="cwk-part cwk-mem" data-k="mem">
        <path d="${body}" fill="none" stroke="${BV.mem}" stroke-width="12" opacity=".2"/>
        <path d="${body}" fill="none" stroke="${BV.mem}" stroke-width="5.5"/>
        <path d="M112 56C128 44 148 37 168 36" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>
      </g>
      ${jigDots([[150, 70], [208, 84], [226, 112], [152, 150], [196, 174], [104, 122], [188, 150]])}
      ${nucleus(A_NUC[0], A_NUC[1], A_NUC[2])}
      ${A_MITO.map(([x, y, a], i) => mito(x, y, a, i)).join("")}
    </g>
    <g class="cwk-nutrs">${nutr}</g>
    ${tag(8, 52, "세포막", 90, 65)}
    ${tag(338, 60, "핵", 203, 95, "end")}
    ${tag(338, 200, "마이토콘드리아", 240, 158, "end")}
    <path class="cwk-hit" data-k="mem" d="${body}" fill="none" stroke="transparent" stroke-width="30"/>
    <circle class="cwk-hit" data-k="nuc" cx="${A_NUC[0]}" cy="${A_NUC[1]}" r="${A_NUC[2] + 5}" fill="transparent"/>
    ${A_MITO.map(([x, y]) => `<circle class="cwk-hit" data-k="mito" cx="${x}" cy="${y}" r="24" fill="transparent"/>`).join("")}
  </svg>`;
}

// ── 식물세포 ────────────────────────────────────────────────────────
const P_HEX: [number, number][] = [[112, 36], [246, 36], [296, 118], [246, 200], [112, 200], [62, 118]];
/** 세포벽이 멈췄을 때의 처진 모양(같은 꼭짓점 수). */
const P_SAG: [number, number][] = [[104, 74], [256, 66], [312, 134], [262, 204], [98, 206], [46, 140]];
const P_C: [number, number] = [179, 118];
const P_NUC: [number, number, number] = [166, 122, 27];
const P_MITO: [number, number, number][] = [
  [236, 150, -14],
  [118, 158, 28],
];
const P_CHL: [number, number, number][] = [
  [126, 78, -16],
  [226, 86, 12],
  [208, 172, -24],
  [262, 118, 80],
];

/** 꼭짓점을 둥글린 닫힌 길. round 0이면 각진 다각형, 0.5면 완전히 둥근 모양. inset은 중심 쪽으로 줄이는 비율. */
function outline(pts: [number, number][], round: number, inset = 0): string {
  const p = pts.map(([x, y]) => [P_C[0] + (x - P_C[0]) * (1 - inset), P_C[1] + (y - P_C[1]) * (1 - inset)] as [number, number]);
  const n = p.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = p[(i - 1 + n) % n];
    const cur = p[i];
    const next = p[(i + 1) % n];
    const a = [cur[0] + (prev[0] - cur[0]) * round, cur[1] + (prev[1] - cur[1]) * round];
    const b = [cur[0] + (next[0] - cur[0]) * round, cur[1] + (next[1] - cur[1]) * round];
    d += `${i === 0 ? "M" : "L"}${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${cur[0].toFixed(1)} ${cur[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  }
  return `${d}Z`;
}
const lerpPts = (a: [number, number][], b: [number, number][], t: number): [number, number][] => a.map(([x, y], i) => [x + (b[i][0] - x) * t, y + (b[i][1] - y) * t]);

function plantScene(): string {
  const nutr = P_CHL.map(([x, y], i) => {
    const to = nearest([x, y], P_MITO);
    const via: [number, number] = [(x + to[0]) / 2 + (i % 2 ? 10 : -10), (y + to[1]) / 2];
    return nutrient([x, y], via, to, i, "from-chl");
  }).join("");
  // 햇빛 줄기: 해에서 엽록체 쪽으로(핵을 가로지르지 않는 세 곳)
  const rays = [0, 1, 3]
    .map((ci, i) => `<path class="cwk-ray" d="M40 36L${P_CHL[ci][0]} ${P_CHL[ci][1]}" stroke="#FFE066" stroke-width="6" stroke-linecap="round" style="--d:${(-i * 0.6).toFixed(2)}s"/>`)
    .join("");
  return `
  <svg class="cwk-svg plant" viewBox="0 0 346 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="햇빛을 받으며 일하는 식물세포">
    ${DEFS}
    <g class="cwk-cellg">
      <path class="cwk-body" d="${outline(P_HEX, 0.08, 0.02)}" fill="url(#cwkCytoP)"/>
      <g class="cwk-part cwk-wall" data-k="wall">
        <path class="cwk-wallp" d="${outline(P_HEX, 0.08)}" fill="none" stroke="${BV.wall}" stroke-width="11" stroke-linejoin="round"/>
        <path class="cwk-wallhi" d="${outline(P_HEX, 0.08)}" fill="none" stroke="#C8AFA4" stroke-width="2.4" stroke-linejoin="round" opacity=".7"/>
      </g>
      <g class="cwk-part cwk-mem" data-k="mem">
        <path class="cwk-memp" d="${outline(P_HEX, 0.1, 0.085)}" fill="none" stroke="${BV.mem}" stroke-width="3.6" stroke-linejoin="round"/>
      </g>
      <g class="cwk-inner">
        ${jigDots([[150, 66], [196, 62], [206, 132], [150, 168], [232, 190], [98, 118]])}
        ${nucleus(P_NUC[0], P_NUC[1], P_NUC[2])}
        ${P_CHL.map(([x, y, a], i) => chloro(x, y, a, i)).join("")}
        ${P_MITO.map(([x, y, a], i) => mito(x, y, a, i)).join("")}
        <g class="cwk-nutrs">${nutr}</g>
      </g>
    </g>
    <g class="cwk-rays" pointer-events="none">${rays}</g>
    <g class="cwk-sun" pointer-events="none">
      <circle cx="30" cy="28" r="26" fill="#FFE066" opacity=".16"/>
      <path d="M30 2v9M30 45v9M4 28h9M47 28h9M11.6 9.6l6.4 6.4M42 40l6.4 6.4M11.6 46.4l6.4 -6.4M42 16l6.4 -6.4" stroke="#FFD43B" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="30" cy="28" r="12" fill="url(#cwkSun)" stroke="#F59F00" stroke-width="1.4"/>
    </g>
    ${tag(338, 26, "엽록체", 240, 79, "end")}
    ${tag(338, 204, "세포벽", 262, 176, "end")}
    <path class="cwk-hit" data-k="wall" d="${outline(P_HEX, 0.08)}" fill="none" stroke="transparent" stroke-width="30"/>
    ${P_CHL.map(([x, y]) => `<circle class="cwk-hit" data-k="chl" cx="${x}" cy="${y}" r="24" fill="transparent"/>`).join("")}
  </svg>`;
}

const LEGEND = `<i class="n"></i>양분<svg viewBox="-7 -9 14 18" width="11" height="14" aria-hidden="true"><path d="${BOLT}" fill="${BV.spark}" stroke="#fff" stroke-width="1.3" stroke-linejoin="round" paint-order="stroke"/></svg>에너지`;

export const cellWorkLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CwkStep;
  const plant = s.mode === "plant";
  const keys: Key[] = plant ? ["chl", "wall"] : ["mem", "nuc", "mito"];
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: keys.length + 1, cls: "cwk-stage", qCls: "cwk-q" });

  f.stage.innerHTML = plant ? plantScene() : animalScene();
  const svg = f.stage.querySelector("svg") as SVGSVGElement;
  f.stage.appendChild(el("div", { class: "cwk-legend", html: LEGEND }));

  let off: Key | null = null;
  let phase: "play" | "diag" | "done" = "play";
  let sag = 0; // 세포벽이 무너진 정도(0~1)
  let starveId = 0;

  const cards = {} as Record<Key, BvCard>;
  keys.forEach((k) => {
    cards[k] = bvCard(`cwk-card${plant ? "" : " col"}`, { name: NAME[k], sub: "일하는 중", icon: BV_PART[k], key: k });
  });
  const diagBtn = bvBtn("main cwk-diag", "고장 난 곳 찾아보기");
  diagBtn.hidden = true;

  /** 세포벽 모양 보간(식물 모드). 벽이 제 일을 못 하면 막과 속이 함께 처진다. */
  function morphWall(to: number): void {
    const from = sag;
    bvTween(tm, 520, (t) => {
      sag = from + (to - from) * t;
      const pts = lerpPts(P_HEX, P_SAG, sag);
      const round = 0.08 + 0.4 * sag;
      svg.querySelector(".cwk-wallp")?.setAttribute("d", outline(pts, round));
      svg.querySelector(".cwk-wallhi")?.setAttribute("d", outline(pts, round));
      svg.querySelector(".cwk-memp")?.setAttribute("d", outline(pts, round + 0.02, 0.085));
      svg.querySelector(".cwk-body")?.setAttribute("d", outline(pts, round, 0.02));
      // 속 구조는 바닥(y 200)을 붙잡고 위에서 눌린다
      svg.querySelector(".cwk-inner")?.setAttribute("transform", `translate(0 ${(40 * sag).toFixed(1)}) scale(1 ${(1 - 0.2 * sag).toFixed(3)})`);
    });
  }

  /** 한 구조만 멈춘다(null이면 모두 일한다). mark가 false면 카드 표시는 건드리지 않는다(판정 국면). */
  function setOff(k: Key | null, mark = true): void {
    const prev = off;
    off = k;
    ALL.forEach((x) => svg.classList.toggle(`off-${x}`, x === k));
    // 양분이 끊기면(세포막, 엽록체) 조금 뒤 에너지도 꺼진다
    tm.cancel(starveId);
    svg.classList.remove("starve");
    if (k === "mem" || k === "chl") starveId = tm.later(() => svg.classList.add("starve"), 1300);
    if (plant && (prev === "wall") !== (k === "wall")) morphWall(k === "wall" ? 1 : 0);
    keys.forEach((x) => {
      const stopped = mark && x === k;
      cards[x].sub(stopped ? "멈춤" : cards[x].isDone() ? JOB[x] : "일하는 중");
      cards[x].el.classList.toggle("stopped", stopped);
      cards[x].el.setAttribute("aria-pressed", stopped ? "true" : "false");
    });
  }

  const allTried = (): boolean => keys.every((x) => cards[x].isDone());

  function toggle(k: Key): void {
    if (phase !== "play" || !keys.includes(k)) return;
    haptic(HAPTIC.tap);
    if (off === k) {
      setOff(null);
      f.say(allTried() ? "다시 모두 일해요. 이제 <b>고장 난 곳</b>을 찾아볼 차례예요." : "다시 일해요. 다른 구조도 <b>멈춰</b> 보세요.");
      return;
    }
    setOff(k);
    f.say(SAY[k]);
    if (!cards[k].isDone()) {
      cards[k].done();
      f.pips(keys.filter((x) => cards[x].isDone()).length);
      if (allTried()) {
        // 마지막 구조의 결과를 볼 시간을 준 뒤 버튼을 띄운다(누르는 것은 학생이다)
        tm.later(() => {
          diagBtn.hidden = false;
          api.setCTA("고장 난 곳을 찾아보세요", { enabled: false });
        }, 1500);
      }
    }
  }

  keys.forEach((k) => cards[k].el.addEventListener("click", () => toggle(k)));
  svg.querySelectorAll<SVGElement>(".cwk-hit").forEach((h) => h.addEventListener("click", () => toggle(h.dataset.k as Key)));

  // ── 고장 난 곳 찾기(판정) ─────────────────────────────────────────
  diagBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    phase = "diag";
    svg.classList.add("diag");
    if (plant) askPlant1();
    else askAnimal1();
  });

  const namesOf = (ok: Key, others: Key[]): { t: string; ok?: boolean }[] => [{ t: NAME[ok], ok: true }, ...others.map((k) => ({ t: NAME[k] }))];

  function askAnimal1(): void {
    setOff("mito", false);
    f.say("어딘가 고장 난 세포예요. 세포를 잘 살펴보고 <b>멈춘 구조</b>를 골라요.");
    f.slot.ask("양분은 들어오는데 에너지가 생기지 않아요. 멈춘 구조는?", namesOf("mito", ["mem", "nuc"]), (ok) => api.recordQuiz(ok), {
      why: "양분으로 에너지를 만드는 곳은 <b>마이토콘드리아</b>예요.",
      onNext: askAnimal2,
    });
  }
  function askAnimal2(): void {
    setOff("mem", false);
    f.say("이번에는 다른 곳이 고장 났어요. 양분 알갱이를 눈으로 따라가 봐요.");
    f.slot.ask("양분이 세포 안으로 들어오지 못해요. 멈춘 구조는?", namesOf("mem", ["nuc", "mito"]), () => undefined, {
      why: "물질이 드나드는 것을 조절하는 곳은 <b>세포막</b>이에요.",
      onNext: finish,
    });
  }
  function askPlant1(): void {
    setOff("chl", false);
    f.say("어딘가 고장 난 세포예요. 세포를 잘 살펴보고 <b>멈춘 구조</b>를 골라요.");
    f.slot.ask("햇빛은 비치는데 양분이 생기지 않아요. 멈춘 구조는?", namesOf("chl", ["wall", "mito"]), (ok) => api.recordQuiz(ok), {
      why: "빛을 받아 양분을 만드는 곳은 <b>엽록체</b>예요.",
      onNext: askPlant2,
    });
  }
  function askPlant2(): void {
    setOff(null, false);
    f.say("다시 모두 일해요. 마지막으로 앞에서 본 동물세포와 견주어 봐요.");
    f.slot.ask(
      "식물세포에는 있고 동물세포에는 없는 구조는?",
      [{ t: "엽록체와 세포벽", ok: true }, { t: "엽록체와 핵" }, { t: "세포벽과 세포막" }],
      () => undefined,
      { why: "핵과 세포막은 <b>두 세포 모두</b>에 있어요.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    svg.classList.remove("diag");
    setOff(null, false);
    f.pips(keys.length + 1);
    f.say("고장 난 곳을 다 찾았어요. 아래에서 알게 된 것을 읽어 봐요.");
    f.slot.conclude(
      plant
        ? "식물세포는 <b>엽록체</b>로 양분을 만들고, <b>세포벽</b>으로 모양을 지켜요. 동물세포에는 이 둘이 없어요."
        : "세포의 구조마다 <b>맡은 일</b>이 있어요. 한 구조가 멈추면 그 일도 멈춰요.",
    );
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(bvCards(keys.length, ...keys.map((k) => cards[k])), diagBtn);
  f.say(plant ? "햇빛을 받는 식물세포예요. 새로 배운 두 구조를 하나씩 <b>멈춰</b> 보세요." : "살아 움직이는 동물세포예요. 아래에서 구조를 하나 골라 <b>멈춰</b> 보세요.");
  api.setCTA(plant ? "두 구조를 하나씩 멈춰 보세요" : "세 구조를 하나씩 멈춰 보세요", { enabled: false });
  return () => tm.clear();
};
