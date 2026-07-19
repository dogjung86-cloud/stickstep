// pythaLab, 세 정사각형 실험실(중2 수학 Ⅴ L10 기함, 책 218~220쪽). 3국면:
// ① 모눈 세기: 직각삼각형(3·4·5) 세 변 위 정사각형 넓이를 탭으로 세기 — 기울어진 빗변 정사각형은
//    "둘러싼 큰 정사각형(7×7) − 귀퉁이 삼각형 4개(6씩)" 분할 연출로 25를 얻는다 → 9+16=25 발견.
// ② 퍼즐 증명: (a+b)² 틀 두 개 — 같은 직각삼각형 4개를 배치①(가운데 구멍 c²)에서 배치②(구멍 a²+b²)로
//    옮겨 담기. 같은 틀에서 같은 삼각형을 뺐으니 구멍 넓이가 같다 → c²=a²+b².
//    삼각형 이동은 바깥 g의 CSS translate(트랜지션) + 안쪽 g의 SVG rotate(자기 원점) 합성 — 회전값은
//    배치가 바뀌어도 불변이라 순수 슬라이드만 일어난다(T_BR은 제자리).
// ③ 일반화: a·b 스테퍼로 다른 직각삼각형에서도 성립 확인.
// '피타고라스 정리'라는 이름은 이 랩에서 쓰지 않는다(다음 concept가 명명). 빗변·직각삼각형은 Ⅳ 기왕.
// rAF 금지(CSS 트랜지션 + setTimeout 체인, 타이머 Set). 스타일: math2.css .pyl-* 섹션.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { rightMark } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const AMBER = { face: "#FFF0DC", edge: "#F08C00", ink: "#9C5A10" };
const CYAN = { face: "#E3F7FD", edge: "#0DA5C6", ink: "#0B7285" };
const ROSE = { face: "#FBE4EE", edge: "#C2255C", ink: "#8C1843" };
const TRI = { face: "#D9E4F2", edge: "#41566E" };

export const pythaLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "count", label: "세 넓이 세기", sub: "정사각형 탭" },
    { id: "proof", label: "구멍의 증명", sub: "잠김" },
    { id: "any", label: "어떤 직각삼각형이든", sub: "잠김" },
  ]);

  const board = mboard(560);
  const svgWrap = el("div", { class: "mcl-plane" });
  const strip = el("div", { class: "pyl-strip", attrs: { "aria-live": "polite" } });
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(svgWrap, strip, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "직각삼각형의 세 변 위에 정사각형을 하나씩 세웠어요. <b>정사각형을 탭</b>해서 넓이를 세어 봐요!",
  });
  host.append(chips.el, helper, board);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phase: 1 | 2 | 3 = 1;
  const got = new Set<"a" | "b" | "c">();
  let combos = 0; // ③에서 확인한 (a,b) 조합 수
  let pa = 3;
  let pb = 4;
  let arranged = false; // ② 현재 배치(false=①, true=②)
  let busy = false;

  /* ══ 국면 1: 모눈 세기 (3·4·5 고정) ══ */
  const U = 20;
  const C1 = { x: 150, y: 170 }; // 직각 꼭짓점
  const A1 = { x: 150, y: 110 }; // 위(변 3)
  const B1 = { x: 230, y: 170 }; // 오른쪽(변 4)
  // 빗변 정사각형: A, B, B+(60,-80), A+(60,-80)
  const HB = { x: 290, y: 90 };
  const HA = { x: 210, y: 30 };

  function gridSvg(): string {
    let g = "";
    for (let x = 70; x <= 310; x += U) g += `<line x1="${x}" y1="10" x2="${x}" y2="270" stroke="#E4E9F0" stroke-width="1"/>`;
    for (let y = 10; y <= 270; y += U) g += `<line x1="70" y1="${y}" x2="310" y2="${y}" stroke="#E4E9F0" stroke-width="1"/>`;
    return g;
  }

  function paintPhase1(): void {
    svgWrap.innerHTML =
      `<svg viewBox="0 0 340 290" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<g>${gridSvg()}</g>` +
      // 변 위 정사각형 3개(탭 대상)
      `<rect class="pyl-sq" data-sq="a" x="90" y="110" width="60" height="60" fill="${AMBER.face}" stroke="${AMBER.edge}" stroke-width="2.4" style="cursor:pointer"/>` +
      `<rect class="pyl-sq" data-sq="b" x="150" y="170" width="80" height="80" fill="${CYAN.face}" stroke="${CYAN.edge}" stroke-width="2.4" style="cursor:pointer"/>` +
      `<polygon class="pyl-sq" data-sq="c" points="${A1.x},${A1.y} ${B1.x},${B1.y} ${HB.x},${HB.y} ${HA.x},${HA.y}" fill="${ROSE.face}" stroke="${ROSE.edge}" stroke-width="2.4" style="cursor:pointer"/>` +
      `<g class="pyl-fills"></g>` +
      // 직각삼각형 본체
      `<path d="M${A1.x} ${A1.y} L${C1.x} ${C1.y} L${B1.x} ${B1.y} Z" fill="${TRI.face}" stroke="${TRI.edge}" stroke-width="2.6" stroke-linejoin="round"/>` +
      rightMark(C1.x, C1.y, 0, 11, TRI.edge) +
      `<text x="138" y="144" text-anchor="middle" font-size="12.5" font-weight="900" fill="${TRI.edge}">3</text>` +
      `<text x="190" y="188" text-anchor="middle" font-size="12.5" font-weight="900" fill="${TRI.edge}">4</text>` +
      `<text x="182" y="132" text-anchor="middle" font-size="12.5" font-weight="900" fill="${ROSE.ink}">5</text>` +
      `<g class="pyl-labels"></g><g class="pyl-anno"></g>` +
      `</svg>`;
    const svg = svgWrap.querySelector("svg") as SVGSVGElement;
    svg.addEventListener("click", (e) => {
      const t = (e.target as Element).closest(".pyl-sq");
      if (!t || busy) return;
      countSquare(t.getAttribute("data-sq") as "a" | "b" | "c");
    });
    updateStrip1();
  }

  function labelAt(x: number, y: number, txt: string, tone: { edge: string; ink: string }): string {
    const w = 14 + txt.length * 8;
    return (
      `<g><rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="24" rx="9" fill="#FFFFFF" stroke="${tone.edge}" stroke-width="1.6"/>` +
      `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="13" font-weight="900" fill="${tone.ink}">${txt}</text></g>`
    );
  }

  function updateStrip1(): void {
    const va = got.has("a") ? "9" : "?";
    const vb = got.has("b") ? "16" : "?";
    const vc = got.has("c") ? "25" : "?";
    strip.innerHTML =
      `<span class="pyl-eq"><b class="pyl-am">${va}</b> + <b class="pyl-cy">${vb}</b> ` +
      `<span class="pyl-q2">=</span> <b class="pyl-ro">${vc}</b></span>`;
  }

  function countSquare(k: "a" | "b" | "c"): void {
    if (got.has(k)) return;
    const svg = svgWrap.querySelector("svg") as SVGSVGElement;
    const gLab = svg.querySelector(".pyl-labels") as SVGGElement;
    const gAnno = svg.querySelector(".pyl-anno") as SVGGElement;
    const gFill = svg.querySelector(".pyl-fills") as SVGGElement;
    if (k === "a" || k === "b") {
      got.add(k);
      haptic(HAPTIC.select);
      // 미니 모눈 채우기 연출(칸 순차 등장)
      const x0 = k === "a" ? 90 : 150;
      const y0 = k === "a" ? 110 : 170;
      const n = k === "a" ? 3 : 4;
      const tone = k === "a" ? AMBER : CYAN;
      let i = 0;
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const idx = i++;
          later(() => {
            gFill.innerHTML += `<rect x="${x0 + c * U + 2}" y="${y0 + r * U + 2}" width="${U - 4}" height="${U - 4}" rx="3" fill="${tone.edge}" opacity=".28"/>`;
          }, 45 * idx);
        }
      }
      later(() => {
        gLab.innerHTML += labelAt(x0 + (n * U) / 2, y0 + (n * U) / 2, `${n * n}`, tone);
        haptic(HAPTIC.correct);
        updateStrip1();
        checkCount();
      }, 45 * n * n + 200);
      return;
    }
    // 빗변 정사각형: 둘러싼 7×7 − 삼각형 4개
    got.add("c");
    busy = true;
    haptic(HAPTIC.select);
    helper.innerHTML = "기울어진 정사각형은 칸을 셀 수 없죠. 대신 <b>큰 정사각형으로 둘러싸고</b> 귀퉁이를 빼요!";
    gAnno.innerHTML = `<rect x="150" y="30" width="140" height="140" fill="none" stroke="#41566E" stroke-width="2" stroke-dasharray="7 5"/>`;
    later(() => {
      gAnno.innerHTML +=
        `<path d="M150 30 L210 30 L150 110 Z" fill="#41566E" opacity=".16"/>` +
        `<path d="M210 30 L290 30 L290 90 Z" fill="#41566E" opacity=".16"/>` +
        `<path d="M290 90 L290 170 L230 170 Z" fill="#41566E" opacity=".16"/>` +
        `<path d="M150 110 L230 170 L150 170 Z" fill="#41566E" opacity=".16"/>` +
        `<text x="196" y="56" font-size="12.5" font-weight="800" fill="#41566E">6</text>` +
        `<text x="266" y="52" font-size="12.5" font-weight="800" fill="#41566E">6</text>` +
        `<text x="268" y="152" font-size="12.5" font-weight="800" fill="#41566E">6</text>` +
        `<text x="164" y="152" font-size="12.5" font-weight="800" fill="#41566E">6</text>`;
      strip.innerHTML = `<span class="pyl-eq">7×7 − 6×4 = 49 − 24 = <b class="pyl-ro">25</b></span>`;
      haptic(HAPTIC.tap);
    }, 700);
    later(() => {
      gAnno.innerHTML = "";
      gLab.innerHTML += labelAt((A1.x + HB.x) / 2, (A1.y + HB.y) / 2 + 10, "25", ROSE);
      haptic(HAPTIC.correct);
      updateStrip1();
      busy = false;
      checkCount();
    }, 2600);
  }

  function checkCount(): void {
    if (got.size < 3) {
      if (!busy) helper.innerHTML = "나머지 정사각형도 탭해서 넓이를 채워요!";
      return;
    }
    chips.on("count", "9+16=25");
    strip.innerHTML = `<span class="pyl-eq big">9 + 16 <b>=</b> 25</span>`;
    helper.innerHTML =
      "두 변의 정사각형을 합치면 정확히 빗변의 정사각형! 우연일까요? <b>어떤 직각삼각형이든</b> 그런지 밝혀야죠.";
    later(() => {
      const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "증명 퍼즐로 밝히기" })) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (b.disabled) return;
        b.disabled = true;
        startPhase2();
      });
      actions.appendChild(b);
      later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    }, 900);
  }

  /* ══ 국면 2·3: (a+b)² 틀 두 개, 삼각형 4개 옮겨 담기 ══ */
  const FRAME = 126; // 틀 한 변(px)
  const FL = { x: 22, y: 66 };
  const FR = { x: 192, y: 66 };

  /** 배치 좌표 계산: u = FRAME/(a+b). 회전은 배치가 바뀌어도 불변(순수 슬라이드). */
  function poses(): { A: { tx: number; ty: number; rot: number }[]; B: { tx: number; ty: number; rot: number }[] } {
    const sSum = pa + pb;
    const u = FRAME / sSum;
    const a = pa * u;
    const b = pb * u;
    const S = FRAME;
    return {
      A: [
        { tx: 0, ty: 0, rot: 0 },
        { tx: S, ty: 0, rot: 90 },
        { tx: S, ty: S, rot: 180 },
        { tx: 0, ty: S, rot: 270 },
      ],
      B: [
        { tx: b, ty: a, rot: 0 },
        { tx: b, ty: 0, rot: 90 },
        { tx: S, ty: S, rot: 180 },
        { tx: 0, ty: a, rot: 270 },
      ],
    };
  }

  function frameSvg(off: { x: number; y: number }, name: string): string {
    return (
      `<rect x="${off.x}" y="${off.y}" width="${FRAME}" height="${FRAME}" fill="#FFFFFF" stroke="#41566E" stroke-width="2.2"/>` +
      `<text x="${off.x + FRAME / 2}" y="${off.y - 10}" text-anchor="middle" font-size="12" font-weight="900" fill="#5A6B7E">${name}</text>`
    );
  }

  function holeSvgA(off: { x: number; y: number }): string {
    const sSum = pa + pb;
    const u = FRAME / sSum;
    const a = pa * u;
    const b = pb * u;
    const S = FRAME;
    return (
      `<polygon points="${off.x + a},${off.y} ${off.x + S},${off.y + a} ${off.x + b},${off.y + S} ${off.x},${off.y + b}" fill="${ROSE.face}" stroke="${ROSE.edge}" stroke-width="2" stroke-dasharray="5 4"/>` +
      `<text x="${off.x + S / 2}" y="${off.y + S / 2 + 4}" text-anchor="middle" font-size="14" font-weight="900" fill="${ROSE.ink}">c²</text>`
    );
  }

  function holeSvgB(off: { x: number; y: number }): string {
    const sSum = pa + pb;
    const u = FRAME / sSum;
    const a = pa * u;
    const b = pb * u;
    return (
      `<rect x="${off.x + b}" y="${off.y}" width="${a}" height="${a}" fill="${AMBER.face}" stroke="${AMBER.edge}" stroke-width="2" stroke-dasharray="5 4"/>` +
      `<text x="${off.x + b + a / 2}" y="${off.y + a / 2 + 4}" text-anchor="middle" font-size="13" font-weight="900" fill="${AMBER.ink}">a²</text>` +
      `<rect x="${off.x}" y="${off.y + a}" width="${b}" height="${b}" fill="${CYAN.face}" stroke="${CYAN.edge}" stroke-width="2" stroke-dasharray="5 4"/>` +
      `<text x="${off.x + b / 2}" y="${off.y + a + b / 2 + 4}" text-anchor="middle" font-size="13" font-weight="900" fill="${CYAN.ink}">b²</text>`
    );
  }

  /** 국면 2 무대: 왼쪽 틀(삼각형 4 + c² 구멍) / 오른쪽 틀(비어 있음 → 옮겨 담기). */
  function paintPhase2(): void {
    const sSum = pa + pb;
    const u = FRAME / sSum;
    const a = pa * u;
    const b = pb * u;
    const P = poses();
    let tris = "";
    for (let i = 0; i < 4; i++) {
      const p = arranged ? P.B[i] : P.A[i];
      const off = arranged ? FR : FL;
      // i=0 삼각형은 두 배치 모두 회전 0이라 여기에만 a·b 변 라벨을 단다(글자가 안 돈다).
      // 스테퍼의 a·b가 도형 어느 변인지 그림에 표기가 없다는 실사용 피드백(2026-07-20).
      // c는 배치 ①의 c² 구멍 라벨이 담당(별도 c 라벨은 배치 ②에서 이웃 조각 위로 넘어감).
      const lbl =
        i === 0
          ? `<text x="${(a / 2).toFixed(1)}" y="14" text-anchor="middle" font-size="12.5" font-weight="900" font-style="italic" fill="${TRI.edge}">a</text>` +
            `<text x="12" y="${(b / 2 + 4).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="900" font-style="italic" fill="${TRI.edge}">b</text>`
          : "";
      tris +=
        `<g class="pyl-tri" data-i="${i}" style="transform: translate(${off.x + p.tx}px, ${off.y + p.ty}px); transition: transform .9s var(--ease, cubic-bezier(.22,1,.36,1))">` +
        `<g transform="rotate(${p.rot})"><path d="M0 0 L${a} 0 L0 ${b} Z" fill="${TRI.face}" stroke="${TRI.edge}" stroke-width="2" stroke-linejoin="round"/></g>` +
        lbl +
        `</g>`;
    }
    svgWrap.innerHTML =
      `<svg viewBox="0 0 340 232" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      frameSvg(FL, "틀 ①") + frameSvg(FR, "틀 ②") +
      `<g class="pyl-holes">${arranged ? holeSvgB(FR) : holeSvgA(FL)}</g>` +
      `<g class="pyl-tris">${tris}</g>` +
      `<text x="170" y="${FL.y + FRAME / 2}" text-anchor="middle" font-size="17" font-weight="900" fill="#8A97A8">→</text>` +
      `</svg>`;
  }

  function startPhase2(): void {
    phase = 2;
    arranged = false;
    clear(actions);
    strip.innerHTML = "";
    paintPhase2();
    helper.innerHTML =
      "같은 크기의 틀 두 개와 <b>똑같은 직각삼각형 4개</b>예요. 직각을 낀 두 변이 <b>a와 b</b>, 빗변이 <b>c</b>(라벨 참고). 왼쪽 틀의 구멍(빈 곳)은 빗변의 정사각형 <b>c²</b>이죠. 삼각형들을 오른쪽 틀로 옮겨 담아 봐요!";
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "삼각형 옮겨 담기" })) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      moveTris();
    });
    actions.appendChild(b);
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function moveTris(): void {
    haptic(HAPTIC.select);
    const svg = svgWrap.querySelector("svg") as SVGSVGElement;
    (svg.querySelector(".pyl-holes") as SVGGElement).innerHTML = "";
    const P = poses();
    // 왼쪽 틀에 유령 잔상(어디 있었는지 기억) 남기기
    {
      const sSum = pa + pb;
      const u = FRAME / sSum;
      const ga = pa * u;
      const gb = pb * u;
      let ghosts = "";
      for (let i = 0; i < 4; i++) {
        const p = P.A[i];
        ghosts +=
          `<g transform="translate(${FL.x + p.tx} ${FL.y + p.ty}) rotate(${p.rot})">` +
          `<path d="M0 0 L${ga} 0 L0 ${gb} Z" fill="none" stroke="${TRI.edge}" stroke-width="1.4" stroke-dasharray="4 4" opacity=".3"/>` +
          `</g>`;
      }
      (svg.querySelector(".pyl-tris") as SVGGElement).insertAdjacentHTML("afterbegin", `<g class="pyl-ghost">${ghosts}</g>`);
    }
    const tris = svg.querySelectorAll<SVGGElement>(".pyl-tri");
    tris.forEach((t, i) => {
      later(() => {
        t.style.transform = `translate(${FR.x + P.B[i].tx}px, ${FR.y + P.B[i].ty}px)`;
        haptic(HAPTIC.tap);
      }, 160 * i);
    });
    later(() => {
      arranged = true;
      (svg.querySelector(".pyl-holes") as SVGGElement).innerHTML = holeSvgB(FR) + holeSvgA(FL);
      haptic(HAPTIC.correct);
      helper.innerHTML = "오른쪽 틀의 구멍은 <b>a²와 b² 두 개</b>가 됐어요. 왼쪽 구멍과 오른쪽 구멍, 넓이는 어떨까요?";
      if (phase === 2) later(askHoles, 700);
    }, 160 * 3 + 1000);
  }

  function askHoles(): void {
    qline.innerHTML = "왼쪽 구멍(c²)과 오른쪽 구멍(a²+b²)의 넓이를 비교하면?";
    const items = [
      {
        t: "같아요, 같은 틀에서 똑같은 삼각형 4개를 뺀 나머지니까요",
        good: true,
        fb: "완벽한 논리예요! 틀의 넓이도, 뺀 삼각형도 같으니 남은 구멍의 넓이도 같아요. 그래서 c² = a² + b²!",
      },
      {
        t: "왼쪽이 더 넓어요, 구멍이 한 덩어리라서요",
        good: false,
        fb: "덩어리 수는 넓이와 상관없어요. 두 틀은 같은 크기이고 뺀 삼각형 4개도 똑같으니, 남은 구멍의 넓이는 정확히 같아요. 한 덩어리 c²와 두 덩어리 a²+b²가 같은 거죠!",
      },
      {
        t: "모양이 달라서 비교할 수 없어요",
        good: false,
        fb: "모양이 달라도 넓이는 비교할 수 있어요. 같은 틀에서 같은 삼각형 4개를 뺐으니 남은 넓이는 반드시 같죠. 모양과 넓이는 별개랍니다!",
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
          chips.on("proof", "c²=a²+b²");
          strip.innerHTML = `<span class="pyl-eq big"><b class="pyl-ro">c²</b> = <b class="pyl-am">a²</b> + <b class="pyl-cy">b²</b></span>`;
          startPhase3();
        }, 2600);
      });
      btns.push({ bt, good: !!it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ══ 국면 3: a·b 바꿔 일반화 ══ */
  function startPhase3(): void {
    phase = 3;
    helper.innerHTML =
      "그런데 방금 건 한 가지 모양의 이야기 아닐까요? <b>a와 b를 바꿔서</b> 다른 직각삼각형으로도 옮겨 담아 봐요! (2가지 이상)";
    clear(actions);
    const mkStep = (label: string, get: () => number, set: (v: number) => void, min: number, max: number): HTMLElement => {
      const val = el("span", { class: "pyl-val", text: `${get()}` });
      const minus = el("button", { class: "pyl-step", text: "−", attrs: { type: "button", "aria-label": `${label} 줄이기` } }) as HTMLButtonElement;
      const plus = el("button", { class: "pyl-step", text: "+", attrs: { type: "button", "aria-label": `${label} 키우기` } }) as HTMLButtonElement;
      const apply = (v: number): void => {
        if (v < min || v > max || busy) return;
        set(v);
        val.textContent = `${v}`;
        haptic(HAPTIC.tap);
        arranged = false;
        paintPhase2();
        helper.innerHTML = `a=${pa}, b=${pb}인 새 직각삼각형이에요. <b>옮겨 담기</b>로 확인!`;
        paintMoveBtn();
      };
      minus.addEventListener("click", () => apply(get() - 1));
      plus.addEventListener("click", () => apply(get() + 1));
      return el("div", { class: "pyl-stepper" }, el("span", { class: "pyl-slab", text: label }), minus, val, plus);
    };
    actions.append(
      mkStep("a", () => pa, (v) => { pa = v; }, 2, 5),
      mkStep("b", () => pb, (v) => { pb = v; }, 3, 6),
    );
    paintMoveBtn();
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function paintMoveBtn(): void {
    const old = actions.querySelector(".pyl-move");
    if (old) old.remove();
    const b = el("button", { class: "ct-btn hero pyl-move", attrs: { type: "button" } }, el("span", { text: "옮겨 담기" })) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (b.disabled || busy) return;
      busy = true;
      b.disabled = true;
      moveTris();
      later(() => {
        busy = false;
        combos += 1;
        strip.innerHTML = `<span class="pyl-eq big"><b class="pyl-ro">c²</b> = <b class="pyl-am">a²</b> + <b class="pyl-cy">b²</b> <span class="pyl-note">(a=${pa}, b=${pb})</span></span>`;
        if (combos >= 2) {
          finish();
        } else {
          helper.innerHTML = "이 모양에서도 성립! <b>a나 b를 또 바꿔서</b> 한 번 더 확인해 봐요.";
        }
      }, 2200);
    });
    actions.appendChild(b);
  }

  function finish(): void {
    chips.on("any", "항상 성립");
    haptic(HAPTIC.done);
    helper.innerHTML =
      "삼각형을 옮겨 담기만 하면 어떤 직각삼각형에서든 <b>c² = a² + b²</b>. 빗변의 정사각형은 두 변의 정사각형의 합이에요. 이 규칙의 위대한 이름을 배우러 가요!";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "이름 붙이러 가기");
  }

  paintPhase1();
  api.setCTA("세 정사각형의 비밀을 밝히면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
