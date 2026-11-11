// [중1 Ⅱ v5] u2l2 세포 구조 랩의 평면 무대(SVG 도해).
// WebGL을 쓸 수 없는 기기에서 입체 무대(cellStage3d.ts) 대신 뜬다. 2026-11-11까지는 이것이 정본 무대였다.
//   동물: 양분 알갱이가 세포막을 지나 들어온다 → 마이토콘드리아가 에너지 불꽃을 낸다. 핵에서는 조절의 고리가 퍼진다.
//   식물: 햇빛을 받은 엽록체에서 양분이 나온다 → 마이토콘드리아가 에너지를 낸다. 세포벽이 육각형 모양을 잡고 있다.
// 구조 색은 v3 도해와 같다(bio6Kit.BV). 움직임은 CSS 키프레임(styles/bio6.css의 .cwk-), 세포벽이 무너지는 모양만 타이머 보간이다.
// 과학 가드: 식물세포의 벽은 막 바깥, 핵은 하나, 엽록체가 만드는 것은 양분이고 에너지는 마이토콘드리아가 만든다.

import { el } from "../../../core/dom";
import { BV } from "../../../ui/bio6Kit";
import { bvTween } from "./b6Lab";
import { BOLT, CELL_KEYS, CELL_LEGEND, P_C, P_HEX, P_SAG, type CellKey, type CellStage, type CellStageOpts } from "./cellStage";

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

/** 평면 무대를 box(.bv-stage)에 놓는다. */
export function flatCellStage(box: HTMLElement, o: CellStageOpts): CellStage {
  box.innerHTML = o.plant ? plantScene() : animalScene();
  const svg = box.querySelector("svg") as SVGSVGElement;
  box.appendChild(el("div", { class: "cwk-legend", html: CELL_LEGEND }));
  svg.querySelectorAll<SVGElement>(".cwk-hit").forEach((h) => h.addEventListener("click", () => o.onTap(h.dataset.k as CellKey)));

  let sag = 0; // 세포벽이 무너진 정도(0~1)
  let wallOff = false;
  let morphNo = 0;
  /** 세포벽 모양 보간(식물 모드). 벽이 제 일을 못 하면 막과 속이 함께 처진다. */
  function morphWall(to: number): void {
    const from = sag;
    const no = ++morphNo; // 보간 도중에 다시 불리면 앞선 보간은 손을 뗀다
    bvTween(o.tm, 520, (t) => {
      if (no !== morphNo) return;
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

  return {
    kind: "flat",
    set(st) {
      CELL_KEYS.forEach((x) => svg.classList.toggle(`off-${x}`, x === st.off));
      svg.classList.toggle("starve", st.starve);
      svg.classList.toggle("diag", st.diag);
      svg.classList.toggle("notag", st.hideTags);
      const w = st.off === "wall";
      if (o.plant && w !== wallOff) {
        wallOff = w;
        morphWall(w ? 1 : 0);
      }
    },
    dispose() {
      morphNo += 1;
    },
  };
}
