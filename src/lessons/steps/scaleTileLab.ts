// scaleTileLab, 사본 채우기(중2 수학 Ⅴ L3, 책 197~198쪽). 닮음비 1:m의 넓이·부피 비를
// 원본 사본 장수 세기로 체험한다. ① 예측(1:2 정사각형 = 몇 장?) 후 탭으로 4장 채우기
// ② 3배는 9장(3×3) + 보너스: 2배 삼각형 4장(가운데 1장은 180도 뒤집혀 들어감)
// ③ 부피: 2배 정육면체에 층 쌓기(2×2×2 = 8개) + 1:3 부피 판정(27배).
// 마무리 리드아웃: 닮음비 1:m → 넓이 1:m², 부피 1:m³. '닮음비'는 L1에서 도입돼 사용 가능.
// rAF 금지(CSS 트랜지션 + setTimeout 체인, 타이머 Set). 스타일: math2.css .sct- 섹션.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
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

const U = 44; // 원본 정사각형 한 변
const SQ1 = { x: 28, y: 152 }; // 원본 정사각형(바닥 196)
const G2 = { x: 170, y: 108 }; // 2배 윤곽
const G3 = { x: 150, y: 64 }; // 3배 윤곽
const Y0 = 196;
const TH = U * 0.866; // 삼각형 높이(정삼각형 변 44)
// 삼각형 원본·2배 목표 꼭짓점
const TRI_O: [Pt, Pt, Pt] = [{ x: 26, y: Y0 }, { x: 70, y: Y0 }, { x: 48, y: Y0 - TH }];
const TRI_G: [Pt, Pt, Pt] = [{ x: 160, y: Y0 }, { x: 248, y: Y0 }, { x: 204, y: Y0 - 2 * TH }];
// 정육면체: 원본 모서리 24, 큰 틀 모서리 48
const CU = 24;
const CDX = CU * 0.866;
const CDY = CU * 0.5;
const CO = { x: 56, y: 190 }; // 원본 큐브 바닥 앞점
const CB = { x: 224, y: 204 }; // 큰 틀 바닥 앞점

const n1 = (v: number): string => (Math.round(v * 10) / 10).toString();
const INK_O = "#12579B";
const INK_C = "#C2255C";

/** 아이소메트릭 정육면체 3면(왼·오른·윗면). yb는 바닥 앞점. */
function cubeSvg(x: number, yb: number, u: number, tone: { top: string; left: string; right: string; ink: string }, sw = 1.7): string {
  const dx = u * 0.866;
  const dy = u * 0.5;
  const lf = `M${n1(x)} ${n1(yb)} L${n1(x - dx)} ${n1(yb - dy)} L${n1(x - dx)} ${n1(yb - dy - u)} L${n1(x)} ${n1(yb - u)} Z`;
  const rf = `M${n1(x)} ${n1(yb)} L${n1(x + dx)} ${n1(yb - dy)} L${n1(x + dx)} ${n1(yb - dy - u)} L${n1(x)} ${n1(yb - u)} Z`;
  const tf = `M${n1(x)} ${n1(yb - u)} L${n1(x - dx)} ${n1(yb - dy - u)} L${n1(x)} ${n1(yb - 2 * dy - u)} L${n1(x + dx)} ${n1(yb - dy - u)} Z`;
  return (
    `<path d="${lf}" fill="${tone.left}" stroke="${tone.ink}" stroke-width="${sw}" stroke-linejoin="round"/>` +
    `<path d="${rf}" fill="${tone.right}" stroke="${tone.ink}" stroke-width="${sw}" stroke-linejoin="round"/>` +
    `<path d="${tf}" fill="${tone.top}" stroke="${tone.ink}" stroke-width="${sw}" stroke-linejoin="round"/>`
  );
}

const TONE_CO = { top: "#EAF3FC", left: "#C9DFF4", right: "#A9CBEC", ink: INK_O };
const TONE_CC = { top: "#FBE9F1", left: "#F6D3E2", right: "#EFB9D0", ink: INK_C };

export const scaleTileLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "sq2", label: "2배는 4장", sub: "예측 먼저" },
    { id: "sq3", label: "3배는 9장", sub: "잠김" },
    { id: "cube", label: "부피는 세제곱", sub: "잠김" },
  ]);

  const board = mboard(560);
  const count = el("div", { class: "sct-count", attrs: { "aria-live": "polite" } });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 250" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<defs>` +
    `<linearGradient id="sctGO" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#EAF3FC"/><stop offset=".55" stop-color="#D4E7F8"/><stop offset="1" stop-color="#BBD7F2"/>` +
    `</linearGradient>` +
    `<linearGradient id="sctGC" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#FBE4EE"/><stop offset=".55" stop-color="#F8D8E6"/><stop offset="1" stop-color="#F2C8DA"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<g class="sct-base"></g><g class="sct-tiles"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q m2u5q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(count, svgWrap, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "왼쪽이 <b>원본 카드</b>, 오른쪽 점선은 닮음비 <b>1:2</b>인 큰 정사각형이에요. 먼저 아래에서 몇 장이 들어갈지 예측!",
  });
  host.append(chips.el, helper, board);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gBase = svg.querySelector(".sct-base") as SVGGElement;
  const gTiles = svg.querySelector(".sct-tiles") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  type Phase = "p1ask" | "p1" | "p2" | "tri" | "cube" | "done";
  let phase: Phase = "p1ask";
  let filled = 0;
  let busy = false;
  let layers = 0;
  let pieces = 0;

  const paintCount = (html: string): void => {
    count.innerHTML = html;
    count.classList.remove("pulse");
    void count.offsetWidth;
    count.classList.add("pulse");
  };

  /* ── 무대 그리기 ── */
  function ghostTag(x: number, y: number, label: string): string {
    return `<text x="${n1(x)}" y="${n1(y)}" text-anchor="end" font-size="10.5" font-weight="800" fill="${INK_C}" opacity=".75">${label}</text>`;
  }

  function paintBaseSquare(scale: 2 | 3): void {
    const g = scale === 2 ? G2 : G3;
    const side = U * scale;
    gBase.innerHTML =
      `<rect x="${SQ1.x}" y="${SQ1.y}" width="${U}" height="${U}" rx="3" fill="url(#sctGO)" stroke="${INK_O}" stroke-width="2.2"/>` +
      `<text x="${SQ1.x + U / 2}" y="${Y0 + 16}" text-anchor="middle" font-size="10" font-weight="800" fill="#64748B">원본</text>` +
      `<rect x="${g.x}" y="${g.y}" width="${side}" height="${side}" rx="4" fill="${INK_C}" fill-opacity=".04" stroke="${INK_C}" stroke-width="2" stroke-dasharray="7 5" opacity=".55"/>` +
      ghostTag(g.x + side, g.y - 7, `×${scale}`);
  }

  const triPath = (p: [Pt, Pt, Pt]): string =>
    `M${n1(p[0].x)} ${n1(p[0].y)} L${n1(p[1].x)} ${n1(p[1].y)} L${n1(p[2].x)} ${n1(p[2].y)} Z`;

  function paintBaseTri(): void {
    gBase.innerHTML =
      `<path d="${triPath(TRI_O)}" fill="url(#sctGO)" stroke="${INK_O}" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<text x="48" y="${Y0 + 16}" text-anchor="middle" font-size="10" font-weight="800" fill="#64748B">원본</text>` +
      `<path d="${triPath(TRI_G)}" fill="${INK_C}" fill-opacity=".04" stroke="${INK_C}" stroke-width="2" stroke-dasharray="7 5" opacity=".55" stroke-linejoin="round"/>` +
      ghostTag(252, 116, "×2");
  }

  function paintBaseCube(): void {
    const dxB = 2 * CDX;
    const dyB = 2 * CDY;
    const UB = 2 * CU;
    const hex =
      `M${n1(CB.x)} ${n1(CB.y)} L${n1(CB.x + dxB)} ${n1(CB.y - dyB)} L${n1(CB.x + dxB)} ${n1(CB.y - dyB - UB)} ` +
      `L${n1(CB.x)} ${n1(CB.y - 2 * dyB - UB)} L${n1(CB.x - dxB)} ${n1(CB.y - dyB - UB)} L${n1(CB.x - dxB)} ${n1(CB.y - dyB)} Z`;
    const inner =
      `M${n1(CB.x)} ${n1(CB.y)} L${n1(CB.x)} ${n1(CB.y - UB)} ` +
      `M${n1(CB.x)} ${n1(CB.y - UB)} L${n1(CB.x + dxB)} ${n1(CB.y - dyB - UB)} ` +
      `M${n1(CB.x)} ${n1(CB.y - UB)} L${n1(CB.x - dxB)} ${n1(CB.y - dyB - UB)}`;
    gBase.innerHTML =
      cubeSvg(CO.x, CO.y, CU, TONE_CO, 2) +
      `<text x="${CO.x}" y="${CO.y + 22}" text-anchor="middle" font-size="10" font-weight="800" fill="#64748B">원본</text>` +
      `<path d="${hex}" fill="${INK_C}" fill-opacity=".04" stroke="${INK_C}" stroke-width="2" stroke-dasharray="7 5" opacity=".55" stroke-linejoin="round"/>` +
      `<path d="${inner}" stroke="${INK_C}" stroke-width="1.6" stroke-dasharray="4 4" opacity=".4"/>` +
      ghostTag(CB.x + dxB + 4, CB.y - dyB - UB - 8, "×2");
  }

  /* ── 사본 날아오기 ── */
  function flyIn(inner: string, cx: number, cy: number, from: Pt, spin = false): void {
    gTiles.insertAdjacentHTML(
      "beforeend",
      `<g class="sct-tile" style="transform-box: view-box; transform-origin:${n1(cx)}px ${n1(cy)}px; ` +
        `transform: translate(${n1(from.x - cx)}px, ${n1(from.y - cy)}px)${spin ? " rotate(180deg)" : ""} scale(.55); opacity:.25; ` +
        `transition: transform .5s var(--spring-soft, cubic-bezier(.34,1.35,.5,1)), opacity .35s ease">${inner}</g>`,
    );
    const node = gTiles.lastElementChild as SVGGElement;
    later(() => {
      node.style.transform = "none";
      node.style.opacity = "1";
    }, 20);
  }

  const sqFrom: Pt = { x: SQ1.x + U / 2, y: SQ1.y + U / 2 };
  const triFrom: Pt = { x: 48, y: 183.3 };
  const cubeFrom: Pt = { x: CO.x, y: CO.y - CU };

  /** 정사각형 채우기 순서(scale=2: 아래 왼→오, 위 왼→오 / scale=3: 3×3 아래 줄부터). */
  function squareSlot(scale: 2 | 3, i: number): { x: number; y: number } {
    const g = scale === 2 ? G2 : G3;
    const col = i % scale;
    const row = scale - 1 - Math.floor(i / scale);
    return { x: g.x + col * U, y: g.y + row * U };
  }

  function addSquareTile(scale: 2 | 3): void {
    const slot = squareSlot(scale, filled);
    const inner = `<rect x="${n1(slot.x + 2)}" y="${n1(slot.y + 2)}" width="${U - 4}" height="${U - 4}" rx="3" fill="url(#sctGC)" stroke="${INK_C}" stroke-width="1.8"/>`;
    flyIn(inner, slot.x + U / 2, slot.y + U / 2, sqFrom);
  }

  // 삼각형 4분할: 아래 2장 + 위 1장(정방향) + 가운데 1장(180도 뒤집힘, 강조색)
  const M_AB: Pt = { x: 182, y: Y0 - TH };
  const M_AC: Pt = { x: 226, y: Y0 - TH };
  const M_BC: Pt = { x: 204, y: Y0 };
  const TRI_TILES: { pts: [Pt, Pt, Pt]; c: Pt; spin: boolean }[] = [
    { pts: [TRI_G[0], M_BC, M_AB], c: { x: 182, y: 183.3 }, spin: false },
    { pts: [M_BC, TRI_G[1], M_AC], c: { x: 226, y: 183.3 }, spin: false },
    { pts: [M_AB, M_AC, TRI_G[2]], c: { x: 204, y: 145.2 }, spin: false },
    { pts: [M_AB, M_BC, M_AC], c: { x: 204, y: 170.6 }, spin: true },
  ];

  function addTriTile(): void {
    const t = TRI_TILES[filled];
    const inner = t.spin
      ? `<path d="${triPath(t.pts)}" fill="#FDF3E3" stroke="#F08C00" stroke-width="2" stroke-linejoin="round"/>`
      : `<path d="${triPath(t.pts)}" fill="url(#sctGC)" fill-opacity=".92" stroke="${INK_C}" stroke-width="1.8" stroke-linejoin="round"/>`;
    flyIn(inner, t.c.x, t.c.y, triFrom, t.spin);
  }

  /* ── 국면 진행 ── */
  function startP2(): void {
    phase = "p2";
    filled = 0;
    clear(gTiles);
    paintBaseSquare(3);
    paintCount(`채운 사본 <b>0</b>장`);
    helper.innerHTML = "이번엔 닮음비 <b>1:3</b>! 몇 장이 들어갈지 세면서 점선을 탭해 채워 봐요.";
    busy = false;
  }

  function startTri(): void {
    phase = "tri";
    filled = 0;
    clear(gTiles);
    paintBaseTri();
    paintCount(`채운 사본 <b>0</b>/4장`);
    helper.innerHTML = "보너스! 닮음비 1:2인 <b>삼각형</b>도 사본 4장으로 채워질까요? 점선을 탭!";
    busy = false;
  }

  function startCube(): void {
    phase = "cube";
    clear(gTiles);
    paintBaseCube();
    paintCount(`쌓은 조각 <b>0</b>개`);
    helper.innerHTML = "이제 <b>부피</b> 차례예요. 닮음비 1:2인 정육면체 틀에 <b>한 층 쌓기</b>로 원본을 채워요!";
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "한 층 쌓기" }));
    b.addEventListener("click", () => {
      if (busy || layers >= 2) return;
      busy = true;
      haptic(HAPTIC.select);
      const kk = layers;
      const order: [number, number][] = [[1, 1], [0, 1], [1, 0], [0, 0]];
      order.forEach(([i, j], idx) => {
        later(() => {
          const x = CB.x + (i - j) * CDX;
          const yb = CB.y - (i + j) * CDY - kk * CU;
          flyIn(cubeSvg(x, yb, CU, TONE_CC), x, yb - CU, cubeFrom);
          pieces += 1;
          paintCount(`쌓은 조각 <b>${pieces}</b>개`);
          haptic(HAPTIC.tap);
        }, idx * 130);
      });
      later(() => {
        layers += 1;
        if (layers === 1) {
          helper.innerHTML = "한 층에 2×2 = <b>4개</b>! 한 층 더 쌓으면 모두 몇 개일까요?";
          busy = false;
        } else {
          b.disabled = true;
          b.classList.add("sct-dim");
          haptic(HAPTIC.correct);
          toast("2×2×2 = 8개! 2배 정육면체엔 원본이 8개 들어가요.");
          later(askVolume, 1700);
        }
      }, order.length * 130 + 460);
    });
    actions.appendChild(b);
    busy = false;
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 탭 채우기(빈 윤곽 탭) ── */
  svgWrap.addEventListener("click", (e) => {
    if (busy) return;
    const r = svg.getBoundingClientRect();
    if (r.width === 0) return;
    const x = ((e.clientX - r.left) / r.width) * 340;
    const y = ((e.clientY - r.top) / r.height) * 250;
    const inRect = (x0: number, y0: number, x1: number, y1: number): boolean =>
      x >= x0 - 12 && x <= x1 + 12 && y >= y0 - 12 && y <= y1 + 12;
    if (phase === "p1ask") {
      api.snack("먼저 아래에서 몇 장일지 예측부터 골라요!");
      return;
    }
    if (phase === "p1" && inRect(G2.x, G2.y, G2.x + 2 * U, G2.y + 2 * U)) {
      addSquareTile(2);
      filled += 1;
      haptic(HAPTIC.tap);
      paintCount(`채운 사본 <b>${filled}</b>/4장`);
      if (filled === 4) {
        busy = true;
        haptic(HAPTIC.correct);
        toast("2배는 4장, 길이의 제곱!");
        chips.on("sq2", "2×2=4장!");
        later(startP2, 1800);
      }
    } else if (phase === "p2" && inRect(G3.x, G3.y, G3.x + 3 * U, G3.y + 3 * U)) {
      addSquareTile(3);
      filled += 1;
      haptic(HAPTIC.tap);
      paintCount(`채운 사본 <b>${filled}</b>장`);
      if (filled === 5) toast("벌써 5장인데 자리가 아직 남았어요. 3배는 몇 장일까요?");
      if (filled === 9) {
        busy = true;
        haptic(HAPTIC.correct);
        toast("3배는 9장, 3×3! 역시 길이의 제곱이에요.");
        later(startTri, 1800);
      }
    } else if (phase === "tri" && inRect(160, Y0 - 2 * TH, 248, Y0)) {
      addTriTile();
      const wasSpin = TRI_TILES[filled].spin;
      filled += 1;
      haptic(HAPTIC.tap);
      paintCount(`채운 사본 <b>${filled}</b>/4장`);
      if (wasSpin) toast("가운데 한 장은 거꾸로 뒤집혀야 들어가요!");
      if (filled === 4) {
        busy = true;
        haptic(HAPTIC.correct);
        later(() => toast("삼각형도 2배는 2×2 = 4장! 도형이 달라도 넓이는 제곱으로 늘어나요."), 700);
        chips.on("sq3", "3×3=9장!");
        later(startCube, 2400);
      }
    }
  });

  /* ── 판정 질문 공용 ── */
  function ask(
    q: string,
    items: { t: string; good: boolean; fb: string }[],
    after: () => void,
    scroll = true, // 마운트 직후 질문은 스크롤 보정 생략(무대를 먼저 보게)
  ): void {
    qline.innerHTML = q;
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
          after();
        }, 2500);
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    if (scroll) later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function askPredict(): void {
    ask(
      "닮음비가 <b>1:2</b>인 큰 정사각형, 원본 몇 장으로 채울 수 있을까요?",
      [
        {
          t: "2장",
          good: false,
          fb: "길이가 2배니까 2장 같지만, 가로로 2배 그리고 세로로도 2배예요. 2장으로는 턱없이 모자라요. 직접 채워서 확인!",
        },
        {
          t: "4장",
          good: true,
          fb: "좋은 예측! 가로 2배 × 세로 2배니까요. 정말 4장인지 직접 채워서 확인해 봐요.",
        },
        {
          t: "6장",
          good: false,
          fb: "감으로는 6장 같지만, 가로 2배 × 세로 2배를 곱해 보면 달라요. 직접 채워서 세어 봐요!",
        },
      ],
      () => {
        phase = "p1";
        paintCount(`채운 사본 <b>0</b>/4장`);
        helper.innerHTML = "오른쪽 <b>점선 정사각형을 탭</b>할 때마다 원본 사본이 한 장씩 날아가요. 채워 봐요!";
      },
      false,
    );
  }

  function askVolume(): void {
    ask(
      "그럼 닮음비가 <b>1:3</b>이면 부피는 몇 배가 될까요?",
      [
        {
          t: "9배",
          good: false,
          fb: "9배는 넓이의 비(3×3) 이야기예요. 부피는 가로·세로·높이 세 방향이 모두 3배라 3×3×3 = 27배가 돼요.",
        },
        {
          t: "27배, 3×3×3이에요",
          good: true,
          fb: "정답! 방금 쌓기에서 봤듯 부피는 세 방향의 곱. 닮음비가 1:3이면 부피의 비는 1:27이에요.",
        },
        {
          t: "6배",
          good: false,
          fb: "3배가 두 번 더해진 느낌이지만 부피는 더하기가 아니라 곱하기예요. 3×3×3 = 27배!",
        },
      ],
      finale,
    );
  }

  function finale(): void {
    phase = "done";
    chips.on("cube", "3×3×3=27배!");
    const fin = el("div", { class: "sct-final" });
    fin.innerHTML =
      `<span class="sct-fpill">닮음비 1:<i class='mv'>m</i></span><span class="sct-farr">→</span>` +
      `<span class="sct-fpill area">넓이 1:<i class='mv'>m</i><sup>2</sup></span><span class="sct-farr">→</span>` +
      `<span class="sct-fpill vol">부피 1:<i class='mv'>m</i><sup>3</sup></span>`;
    board.appendChild(fin);
    haptic(HAPTIC.done);
    helper.innerHTML =
      "닮음비가 1:<i class='mv'>m</i>이면 넓이의 비는 <b>제곱</b>(1:<i class='mv'>m</i><sup>2</sup>), 부피의 비는 <b>세제곱</b>(1:<i class='mv'>m</i><sup>3</sup>)! " +
      "점보 곰인형이 그렇게 무거웠던 이유예요.";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "정리하러 가기");
    later(() => fin.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  paintBaseSquare(2);
  paintCount(`채운 사본 <b>0</b>장`);
  askPredict();
  api.setCTA("사본을 전부 채우면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
