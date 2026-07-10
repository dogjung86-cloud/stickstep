// histoLab, 히스토그램 건설 랩(Ⅵ 통계 — 교과서 245~247쪽 히스토그램·도수분포다각형).
// 국면 3개: 1 도수분포표(체급 랩 자료 1·3·5·2·1)를 보고 각 계급 열을 탭해 막대를 도수 높이로 세운다 →
//   2 각 막대 윗변의 중앙점을 차례로 탭해 선분으로 연결 + 마지막에 "양 끝 도수 0 계급"까지
//   내려 닫아야 완성(교과서 함정) → 3 읽기 미션(전체 인원 = 도수 총합).
// 연출은 CSS transition + setTimeout 체인. rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface HistoStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 240;
const FREQ = [1, 3, 5, 2, 1]; // 체급 랩과 같은 자료(40~65kg, 5kg 계급)
const BINS = [40, 45, 50, 55, 60, 65];
const AX_Y = 196; // x축
const UNIT = 26; // 도수 1당 픽셀
const BAR_W = 46;
const colX = (bi: number): number => 56 + bi * BAR_W; // 막대 왼쪽 x(왼쪽 유령 계급 중앙점이 y축 안쪽에 오도록 여백 확보)
const midX = (bi: number): number => colX(bi) + BAR_W / 2;
const topY = (f: number): number => AX_Y - f * UNIT;

export const histoLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as HistoStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "bars", label: "막대 세우기", sub: "0/5" },
    { id: "poly", label: "점 잇기", sub: "양 끝 주의" },
    { id: "total", label: "그래프 읽기", sub: "전체 인원" },
  ]);

  const board = mboard(620);
  const stage = el("div", { class: "mhs-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    // 눈금·축
    [1, 2, 3, 4, 5].map((f) => `<line x1="28" y1="${topY(f)}" x2="${W - 14}" y2="${topY(f)}" stroke="#EDF0F6" stroke-width="1.2"/><text x="20" y="${topY(f) + 4}" text-anchor="middle" font-size="9" font-weight="700" fill="${GEO.soft}">${f}</text>`).join("") +
    `<line x1="28" y1="${AX_Y}" x2="${W - 14}" y2="${AX_Y}" stroke="${GEO.ink}" stroke-width="2"/>` +
    `<line x1="28" y1="${AX_Y}" x2="28" y2="${topY(5) - 10}" stroke="${GEO.ink}" stroke-width="2"/>` +
    BINS.map((b, i) => `<text x="${56 + i * BAR_W}" y="${AX_Y + 16}" text-anchor="middle" font-size="9" font-weight="700" fill="${GEO.soft}">${b}</text>`).join("") +
    `<text x="${W - 16}" y="${AX_Y + 16}" text-anchor="end" font-size="8.5" font-weight="700" fill="${GEO.soft}">(kg)</text>` +
    `<text x="16" y="${topY(5) - 16}" font-size="8.5" font-weight="700" fill="${GEO.soft}">(명)</text>` +
    // 히트 영역 + 막대 + 다각형
    FREQ.map((_, bi) => `<rect class="mhs-hit" data-b="${bi}" x="${colX(bi)}" y="${topY(5) - 10}" width="${BAR_W}" height="${AX_Y - topY(5) + 10}" fill="transparent"/>`).join("") +
    `<g class="mhs-bars"></g><g class="mhs-poly"></g><g class="mhs-dots"></g>` +
    `</svg>`;
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst" });
  const table = el("div", { class: "mhs-table" });
  table.innerHTML =
    `<div class="mhs-th"><span>몸무게(kg)</span><span>도수(명)</span></div>` +
    FREQ.map((f, i) => `<div class="mhs-tr" data-b="${i}"><span>${BINS[i]}이상 ~ ${BINS[i + 1]}미만</span><b>${f}</b></div>`).join("");
  const eqs = el("div", { class: "mq6-eqs" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, table, eqs, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "체급 랩의 도수분포표를 <b>그래프 도시</b>로 옮겨요. 표의 행과 같은 계급 자리를 탭하면 막대가 자라요!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gBars = svg.querySelector(".mhs-bars") as SVGGElement;
  const gPoly = svg.querySelector(".mhs-poly") as SVGGElement;
  const gDots = svg.querySelector(".mhs-dots") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phase: 1 | 2 | 3 = 1;
  const built = new Set<number>();
  let finished = false;
  /* 다각형 점 순서: 왼끝0 → 5개 중앙 → 오른끝0. 국면 2에서는 중앙 5개 먼저, 끝 2개는 함정 후 등장 */
  let polyNext = 0; // 다음에 이어야 할 중앙점 인덱스(0~4)

  function drawBars(): void {
    gBars.innerHTML = FREQ.map((f, bi) =>
      built.has(bi)
        ? `<rect x="${colX(bi)}" y="${topY(f)}" width="${BAR_W}" height="${f * UNIT}" fill="url(#mhs-bar)" stroke="#1F2E8C" stroke-width="1.6"/>`
        : "",
    ).join("") +
      `<defs><linearGradient id="mhs-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B99EE"/><stop offset="1" stop-color="#4759CE"/></linearGradient></defs>`;
  }

  /* ── 국면 1: 막대 세우기 ── */
  svg.addEventListener("pointerdown", (e) => {
    if (finished) return;
    const t = (e.target as Element).closest(".mhs-hit") as SVGRectElement | null;
    if (!t) return;
    const bi = Number(t.dataset.b);
    if (phase === 1) {
      if (built.has(bi)) {
        toast("이미 세운 막대예요!");
        return;
      }
      built.add(bi);
      haptic(HAPTIC.correct);
      drawBars();
      (table.querySelector(`.mhs-tr[data-b="${bi}"]`) as HTMLElement).classList.add("on");
      chips.el.querySelector(`[data-g="bars"] span`)!.textContent = `${built.size}/5`;
      if (built.size >= 5) {
        chips.on("bars", "히스토그램!");
        toast("완성! 이런 막대 그래프가 히스토그램이에요");
        later(startPoly, 1500);
      }
    } else if (phase === 2) {
      // 중앙점 탭(순서대로)
      if (bi === polyNext && polyNext < 5) {
        haptic(HAPTIC.correct);
        addDot(midX(bi), topY(FREQ[bi]));
        if (polyNext > 0) addSeg(midX(bi - 1), topY(FREQ[bi - 1]), midX(bi), topY(FREQ[bi]));
        polyNext += 1;
        if (polyNext >= 5) later(askEnds, 700);
      } else if (bi !== polyNext) {
        haptic(HAPTIC.cross);
        toast("왼쪽부터 차례대로! 다음 점은 " + `${BINS[polyNext]}~${BINS[polyNext + 1]}` + " 막대 위예요.");
      }
    }
  });

  function addDot(x: number, y: number): void {
    gDots.insertAdjacentHTML(
      "beforeend",
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#FFFFFF" stroke="#C2255C" stroke-width="2.4"/>`,
    );
  }
  function addSeg(x1: number, y1: number, x2: number, y2: number): void {
    gPoly.insertAdjacentHTML(
      "beforeend",
      `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#C2255C" stroke-width="2.6" stroke-linecap="round"/>`,
    );
  }

  /* ── 국면 2: 다각형 ── */
  function startPoly(): void {
    if (finished) return;
    phase = 2;
    inst.innerHTML = `이제 각 막대 <b>윗변의 중앙</b>을 왼쪽부터 차례로 탭해 점을 이어요`;
    helper.innerHTML = "막대 지붕의 한가운데를 콕콕! 왼쪽 막대부터 순서대로예요.";
  }

  function askEnds(): void {
    inst.innerHTML = `5개를 다 이었는데... 선이 <b>공중에 떠</b> 있어요. 어떻게 마무리할까요?`;
    const row = el("div", { class: "mq6-choices" });
    [
      ["양 끝에 도수 0인 계급이 있다 치고 축까지 내려 닫는다", true],
      ["그냥 이대로 끝낸다", false],
      ["첫 점과 끝 점을 직선으로 잇는다", false],
    ].forEach(([label, good]) => {
      const b = el("button", { class: "mq6-choice wide", text: label as string, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (good) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          // 양 끝 0점 연결 연출
          const lx = colX(0) - BAR_W / 2;
          const rx = colX(4) + BAR_W * 1.5;
          addDot(lx, AX_Y);
          addSeg(lx, AX_Y, midX(0), topY(FREQ[0]));
          later(() => {
            addDot(rx, AX_Y);
            addSeg(midX(4), topY(FREQ[4]), rx, AX_Y);
            haptic(HAPTIC.done);
            toast("도수분포다각형 완성!");
            chips.on("poly", "양 끝 0까지");
            later(startTotal, 1500);
          }, 500);
        } else {
          haptic(HAPTIC.cross);
          toast(
            (label as string).includes("직선")
              ? "위로 가로지르면 없는 자료를 만든 셈! 축으로 내려와야 해요."
              : "떠 있으면 다각형이 아니죠. 양 끝을 축까지 내려 닫는 약속이 있어요!",
          );
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    later(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /* ── 국면 3: 읽기 ── */
  function startTotal(): void {
    if (finished) return;
    phase = 3;
    clear(ctl);
    inst.innerHTML = `그래프만 보고 답해요. <b>전체 참가자</b>는 몇 명일까요?`;
    helper.innerHTML = "각 막대의 도수를 전부 더하면 전체!";
    const row = el("div", { class: "mq6-choices" });
    [12, 10, 5].forEach((v) => {
      const b = el("button", { class: "mq6-choice", text: `${v}명`, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (v === 12) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          chips.on("total", "12명");
          eqs.appendChild(
            el("div", { class: "mq6-concl mq6-pop", html: `1+3+5+2+1 = <b>12명</b>. 그래프에서도 도수의 총합을 읽을 수 있어요!` }),
          );
          later(finish, 1400);
        } else {
          haptic(HAPTIC.cross);
          toast(v === 5 ? "5는 가장 큰 도수 하나! 전부 더해요." : "빠뜨린 막대가 있어요. 다섯 막대를 모두!");
        }
      });
      row.appendChild(b);
    });
    ctl.appendChild(row);
    later(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "표를 그림으로: 막대로 세우면 <b>히스토그램</b>, 중앙점을 이으면 <b>도수분포다각형</b>. 분포가 한눈에!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  inst.innerHTML = `표의 계급과 같은 자리(그래프 열)를 <b>탭</b>해 막대를 세우세요`;
  drawBars();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
