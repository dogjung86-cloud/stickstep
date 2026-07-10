// probMulLab, 확률 곱셈 랩(Ⅵ L8, 책 250~251쪽 "확률의 곱셈"의 체험판).
// 전체 넓이 1인 정사각형(종이 톤)에 1번 사건을 가로 방향(세로선 분할)으로,
// 2번 사건을 세로 방향으로 반투명하게 칠해 "둘 다"의 겹침 직사각형 넓이 = p×q를 본다.
// 국면 3개: 1 가로로 쪼개기(1/2 레드) → 2 세로로 겹치기(1/2×1/2 = 1/4) →
//   3 비율 바꿔 재실험(1/3×1/2 = 1/6) + "곱하면 작아진다" 판정 → 완료.
// meanPullLab 뼈대 계승(칩 → helper → 보드, mq6 판정 문법).
// rAF 금지: 오버레이 rect 세 장의 CSS scale 트랜지션(transform-box: fill-box) + setTimeout 체인.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips, mfmt } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface ProbMulStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 240;
const X0 = 22; // 정사각형(전체 = 확률 1)
const Y0 = 40;
const S = 170;
const PX = 206; // 사건 패널 열
const PW = 126;

const RED = "#C92A2A";
const DEEP = "#8F1D1D";
const BLUE = "#4A7BE8";
const BDEEP = "#1D4E8F";
const INK = "#2A3648";
const SOFT = "#5A6B7E";
const EDGE = "#B7A29A"; // 종이 톤 최암색(areaModelFig 관례 계승)

const DEFS =
  `<linearGradient id="mll-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset=".55" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>` +
  `<linearGradient id="mll-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8AB4FF"/><stop offset=".55" stop-color="#4A7BE8"/><stop offset="1" stop-color="#2A57C2"/></linearGradient>` +
  `<linearGradient id="mll-lap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E06055"/><stop offset=".5" stop-color="#C92A2A"/><stop offset="1" stop-color="#9E1F1F"/></linearGradient>` +
  `<linearGradient id="mll-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FBF6F2"/><stop offset="1" stop-color="#F2E9E4"/></linearGradient>` +
  `<linearGradient id="mll-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F2F4F9"/></linearGradient>` +
  `<linearGradient id="mll-dud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6FA"/><stop offset="1" stop-color="#D9DFEA"/></linearGradient>` +
  `<radialGradient id="mll-glowg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".8"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>`;

export const probMulLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ProbMulStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "h", label: "가로 쪼개기", sub: "1번 사건" },
    { id: "lap", label: "겹침 넓이", sub: "둘 다 당첨" },
    { id: "mul", label: "곱의 정체", sub: "비율 실험" },
  ]);

  const board = mboard(560);
  const stage = el("div", { class: "mll-stage" });
  const ov = // 오버레이 rect 공통 스타일(스케일 트랜지션)
    "transform-box:fill-box;transition:transform .8s var(--ease-out);";
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<defs>${DEFS}</defs>` +
    `<ellipse cx="${X0 + S / 2}" cy="${Y0 + S + 10}" rx="${(S * 0.55).toFixed(0)}" ry="7" fill="#2A3A5E" opacity=".1"/>` +
    `<rect x="${X0}" y="${Y0}" width="${S}" height="${S}" fill="url(#mll-paper)" stroke="${EDGE}" stroke-width="1.6"/>` +
    `<rect class="mll-red" x="${X0}" y="${Y0}" width="${S}" height="${S}" fill="${RED}" opacity=".36" style="${ov}transform-origin:0% 50%;transform:scaleX(0)"/>` +
    `<rect class="mll-blue" x="${X0}" y="${Y0}" width="${S}" height="${S}" fill="${BLUE}" opacity=".32" style="${ov}transform-origin:50% 100%;transform:scaleY(0)"/>` +
    `<rect class="mll-lapr" x="${X0}" y="${Y0}" width="${S}" height="${S}" fill="url(#mll-lap)" opacity=".94" stroke="${DEEP}" stroke-width="1.5" style="${ov}transform-origin:0% 100%;transform:scale(0,0)"/>` +
    `<g class="mll-lines" pointer-events="none"></g>` +
    `<ellipse cx="${X0 + 40}" cy="${Y0 + 32}" rx="54" ry="36" fill="url(#mll-glowg)" opacity=".32" pointer-events="none"/>` +
    `<g class="mll-labels" pointer-events="none"></g>` +
    `<g class="mll-panels"></g>` +
    `<text x="${X0 + S / 2}" y="26" text-anchor="middle" font-size="11" font-weight="800" fill="${INK}">전체 넓이 = 확률 1</text>` +
    `<text x="${X0 + S / 2}" y="${H - 6}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${SOFT}">1번 원판: 가로 방향</text>` +
    `<text transform="rotate(-90 12 ${Y0 + S / 2})" x="12" y="${Y0 + S / 2 + 3}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${SOFT}">2번 원판: 세로 방향</text>` +
    `</svg>`;
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst", html: "버튼을 눌러 <b>1번 사건</b>이 차지하는 넓이를 칠해 봐요" });
  const eqs = el("div", { class: "mq6-eqs" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "정사각형 전체의 넓이가 <b>확률 1</b>이에요. 색칠한 넓이가 곧 그 사건의 확률!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const redRect = svg.querySelector(".mll-red") as SVGRectElement;
  const blueRect = svg.querySelector(".mll-blue") as SVGRectElement;
  const lapRect = svg.querySelector(".mll-lapr") as SVGRectElement;
  const gLines = svg.querySelector(".mll-lines") as SVGGElement;
  const gLabels = svg.querySelector(".mll-labels") as SVGGElement;
  const gPanels = svg.querySelector(".mll-panels") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phase: 1 | 2 | 3 = 1;
  let finished = false;
  let lock = false;
  let hOn = false; // 1번 사건 칠함
  let vOn = false; // 2번 사건 칠함
  let pD = 2; // 1번 사건 분모(1/2 또는 1/3, 분자는 1 고정)
  let thirdSeen = false;
  let asked = false;
  let segHalf: HTMLButtonElement | null = null;
  let segThird: HTMLButtonElement | null = null;

  /* ── 그리기 ── */

  function drawLines(): void {
    let out = "";
    if (hOn) {
      for (let k = 1; k < pD; k++) {
        const x = X0 + (S * k) / pD;
        out += `<line class="mll-fade" x1="${x.toFixed(1)}" y1="${Y0}" x2="${x.toFixed(1)}" y2="${Y0 + S}" stroke="${EDGE}" stroke-width="1.2"/>`;
      }
    }
    if (vOn) {
      out += `<line class="mll-fade" x1="${X0}" y1="${Y0 + S / 2}" x2="${X0 + S}" y2="${Y0 + S / 2}" stroke="${EDGE}" stroke-width="1.2"/>`;
    }
    gLines.innerHTML = out;
  }

  function drawLabels(): void {
    let out = "";
    const redMidX = X0 + S / pD / 2; // 레드 열의 중앙(분자 1 고정)
    if (hOn) {
      out += `<text class="mll-fade" x="${redMidX.toFixed(1)}" y="${Y0 + 22}" text-anchor="middle" font-size="13" font-weight="900" fill="${DEEP}">1/${pD}</text>`;
    }
    if (vOn) {
      out += `<text class="mll-fade" x="${X0 + S - 15}" y="${(Y0 + S * 0.75 + 4).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="900" fill="${BDEEP}">1/2</text>`;
    }
    if (hOn && vOn) {
      out += `<text class="mll-fade" x="${redMidX.toFixed(1)}" y="${(Y0 + S * 0.75 + 5).toFixed(1)}" text-anchor="middle" font-size="15" font-weight="900" fill="#FFFFFF">1/${pD * 2}</text>`;
    }
    gLabels.innerHTML = out;
  }

  /** 사건 패널(오른쪽 열): 미니 원판 + 확률. 원판 부채꼴은 각도 계산으로 그린다. */
  function panelSvg(x: number, y: number, name: string, n: number, d: number, tone: "red" | "blue", active: boolean): string {
    const cx = x + 27;
    const cy = y + 33;
    const r = 17;
    const endDeg = -90 + (360 * n) / d;
    const ex = cx + r * Math.cos((endDeg * Math.PI) / 180);
    const ey = cy + r * Math.sin((endDeg * Math.PI) / 180);
    const large = n / d > 0.5 ? 1 : 0;
    const deepC = tone === "red" ? DEEP : BDEEP;
    return (
      `<g opacity="${active ? "1" : ".5"}">` +
      `<rect x="${x}" y="${y}" width="${PW}" height="66" rx="12" fill="url(#mll-card)" stroke="${tone === "red" ? "#E4B9B2" : "#B9C8E6"}" stroke-width="1.4"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#mll-dud)" stroke="#8A93A6" stroke-width="1.2"/>` +
      `<path d="M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${large} 1 ${ex.toFixed(1)} ${ey.toFixed(1)} Z" fill="url(#mll-${tone})" stroke="${deepC}" stroke-width="1.1" stroke-linejoin="round"/>` +
      `<text x="${x + 52}" y="${y + 28}" font-size="11" font-weight="800" fill="${INK}">${name}</text>` +
      `<text x="${x + 52}" y="${y + 50}" font-size="17" font-weight="900" fill="${deepC}">${n}/${d}</text>` +
      `</g>`
    );
  }

  function drawPanels(): void {
    gPanels.innerHTML = panelSvg(PX, 48, "1번 원판 당첨", 1, pD, "red", hOn) + panelSvg(PX, 130, "2번 원판 당첨", 1, 2, "blue", vOn);
  }

  function glowLap(): void {
    lapRect.classList.remove("mll-glow");
    void lapRect.getBBox(); // 애니메이션 재시작
    lapRect.classList.add("mll-glow");
  }

  /* ── 국면 1: 가로로 쪼개기 ── */

  function onPaintH(): void {
    if (finished || lock || hOn || phase !== 1) return;
    lock = true;
    clear(ctl);
    haptic(HAPTIC.tap);
    hOn = true;
    drawLines();
    redRect.style.transform = "scaleX(0.5)";
    later(() => {
      drawLabels();
      drawPanels();
      eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: `1번 당첨: 전체의 ${mfmt("{1/2}")}` }));
      toast("세로선이 반을 갈랐어요. 왼쪽 절반이 1번 당첨!");
      chips.on("h", "1/2");
      haptic(HAPTIC.correct);
    }, 900);
    later(startPhase2, 2200);
  }

  /* ── 국면 2: 세로로 겹치기 ── */

  function startPhase2(): void {
    if (finished) return;
    phase = 2;
    lock = false;
    inst.innerHTML = "이제 <b>2번 사건</b>을 겹쳐 칠해요. 둘 다 당첨인 곳은 어딜까요?";
    helper.innerHTML = "색이 <b>두 번 칠해지는 곳</b>을 잘 봐요. 거기가 '이것도 저것도'의 자리예요!";
    const b = el("button", { class: "mq6-btn mq6-pulse", text: "2번 사건 칠하기", attrs: { type: "button", "aria-label": "세로 칠하기" } });
    b.addEventListener("click", onPaintV);
    clear(ctl);
    ctl.appendChild(b);
    later(() => ctl.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function onPaintV(): void {
    if (finished || lock || vOn || phase !== 2) return;
    lock = true;
    clear(ctl);
    haptic(HAPTIC.tap);
    vOn = true;
    drawLines();
    blueRect.style.transform = "scaleY(0.5)";
    later(() => {
      lapRect.style.transform = "scale(0.5, 0.5)";
      glowLap();
    }, 850);
    later(() => {
      drawLabels();
      drawPanels();
      eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: `둘 다 당첨 = 겹친 영역 = ${mfmt("{1/4}")}` }));
      eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: mfmt("{1/2}×{1/2} = {1/4}") }));
      toast("반의 반! 겹친 왼쪽 아래가 전체의 1/4이에요");
      chips.on("lap", "1/4");
      haptic(HAPTIC.correct);
    }, 1750);
    later(startPhase3, 3200);
  }

  /* ── 국면 3: 비율 바꿔 재실험 ── */

  function startPhase3(): void {
    if (finished) return;
    phase = 3;
    lock = false;
    inst.innerHTML = "1번 원판의 당첨 확률을 <b>1/3</b>로 바꿔 다시 실험해 봐요";
    helper.innerHTML = "조건이 더 까다로워지면(1/2에서 1/3로) 겹친 영역이 어떻게 될까요? 버튼으로 직접 확인!";
    const seg = el("div", { class: "mll-seg" });
    segHalf = el("button", { class: "mll-segbtn on", html: `가로 ${mfmt("{1/2}")}`, attrs: { type: "button", "aria-label": "가로 1/2" } });
    segThird = el("button", { class: "mll-segbtn", html: `가로 ${mfmt("{1/3}")}`, attrs: { type: "button", "aria-label": "가로 1/3" } });
    segHalf.addEventListener("click", () => setP(2));
    segThird.addEventListener("click", () => setP(3));
    seg.append(segHalf, segThird);
    clear(ctl);
    ctl.appendChild(seg);
    later(() => ctl.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function setP(d: number): void {
    if (finished || phase !== 3 || pD === d) return;
    pD = d;
    haptic(HAPTIC.tap);
    if (segHalf) segHalf.classList.toggle("on", d === 2);
    if (segThird) segThird.classList.toggle("on", d === 3);
    const p = (1 / d).toFixed(4);
    redRect.style.transform = `scaleX(${p})`;
    lapRect.style.transform = `scale(${p}, 0.5)`;
    later(() => {
      drawLines();
      drawLabels();
      drawPanels();
      glowLap();
      if (d === 3 && !thirdSeen) {
        thirdSeen = true;
        eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: mfmt("{1/3}×{1/2} = {1/6}") }));
        toast("겹친 영역이 1/4에서 1/6로 줄었어요!");
        haptic(HAPTIC.correct);
        later(askJudge, 1200);
      } else if (d === 2) {
        toast("다시 1/2로! 겹침은 1/4이 됐어요");
      }
    }, 880);
  }

  function askJudge(): void {
    if (finished || phase !== 3 || asked) return;
    asked = true;
    qline.innerHTML = "곱했더니 확률이 <b>어떻게 됐나요?</b>";
    const row = el("div", { class: "mq6-choices" });
    (
      [
        [true, "원래보다 작아졌다 (조건이 겹칠수록 좁아진다)", "작아졌다", ""],
        [false, "원래보다 커졌다", "커졌다", "기회가 늘어난 게 아니라 조건이 늘었어요. 조건이 겹칠수록 만족하는 영역은 좁아진답니다"],
        [false, "변하지 않았다", "변하지 않았다", "겹친 영역을 다시 봐요. 1/4이 1/6이 됐죠? 전체에서 차지하는 몫이 줄었어요"],
      ] as [boolean, string, string, string][]
    ).forEach(([good, label, aria, msg]) => {
      const b = el("button", { class: "mq6-choice wide", text: label, attrs: { type: "button", "aria-label": aria } });
      b.addEventListener("click", () => {
        if (finished) return;
        if (good) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => {
            x.disabled = true;
          });
          b.classList.add("ok");
          qline.innerHTML = "";
          eqs.appendChild(
            el("div", {
              class: "mq6-concl mq6-pop",
              html: "'이것도 저것도'는 두 조건을 모두 통과해야 하니 <b>영역이 좁아져요</b>. 그래서 동시에 일어날 확률은 <b>곱하기</b>랍니다!",
            }),
          );
          chips.on("mul", "좁아진다");
          later(finish, 1500);
        } else {
          haptic(HAPTIC.cross);
          b.classList.add("no");
          later(() => b.classList.remove("no"), 900);
          toast(msg);
        }
      });
      row.appendChild(b);
    });
    ctl.appendChild(row); // 세그 버튼은 남겨 두어 계속 실험 가능
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "가로 반, 세로 반이 겹치면 반의 반. <b>곱하기 = 겹친 넓이 재기</b>라는 걸 기억해요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 초기 조작부 ── */
  const paintH = el("button", { class: "mq6-btn mq6-pulse", text: "1번 사건 칠하기", attrs: { type: "button", "aria-label": "가로 칠하기" } });
  paintH.addEventListener("click", onPaintH);
  ctl.appendChild(paintH);

  drawLines();
  drawLabels();
  drawPanels();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
