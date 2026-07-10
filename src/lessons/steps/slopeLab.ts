// slopeLab, 기울기 측정소(중2 수학 Ⅲ L5 기함, 책 108~110쪽). 직선 위의 두 핸들을 끌며
// 계단 세모(가로 증가량·세로 증가량)를 만들고, 어디서 재도 (세로)/(가로) 비율이 같음을 발견한다.
// '기울기'라는 이름은 concept 몫, 랩은 "기울어진 정도를 재는 수"까지만 끌고 간다.
// 국면 1(wide): y=2x-1 위에서 두 핸들을 벌리며 측정, 가로 1칸이든 3칸이든 비율은 늘 2.
// 국면 2(neg): y=-x+2 로 직선 교체, 오른쪽으로 갈 때 y가 '내려가면' 세로 증가량이 음수, 비율 -1.
// 국면 3(coeff): "이 비율, 식 어디에 숨어 있었죠?" 판정, x의 계수와 일치(상수항=y절편 함정).
// 세모는 항상 왼쪽 핸들 → 오른쪽 핸들로 재서 가로 증가량이 양수가 되게 한다(분모 양수 규약).
// 목표 칩 3: wide·neg·coeff. 드래그 핸들은 x 정수 스냅, setPointerCapture try/catch(사고 7).
// rAF 금지(CSS 트랜지션+타이머 Set). 스타일: math2.css .spl-* 섹션.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips, planeSpec } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface LineDef {
  a: number;
  b: number;
  label: string; // 그래프 옆 라벨
  eq: string; // mfmt
  domain: [number, number]; // 핸들 x 허용 범위
  ax: number; // 초기 핸들 위치
  bx: number;
}

const LINES: LineDef[] = [
  { a: 2, b: -1, label: "y=2x−1", eq: "y=2x-1", domain: [-2, 3], ax: 0, bx: 1 },
  { a: -1, b: 2, label: "y=−x+2", eq: "y=-x+2", domain: [-3, 4], ax: 0, bx: 1 },
];

export const slopeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "wide", label: "어디서 재도", sub: "가로를 넓혀요" },
    { id: "neg", label: "내려가는 직선", sub: "잠김" },
    { id: "coeff", label: "정체 판정", sub: "잠김" },
  ]);

  const board = mboard(520);
  const ratioCard = el("div", { class: "spl-ratio", attrs: { "aria-live": "polite" } });
  const spec = planeSpec({ min: -5, max: 5, size: 340 });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="${spec.vb}" xmlns="http://www.w3.org/2000/svg" fill="none">${spec.grid}` +
    `<g class="spl-line"></g>` +
    `<g class="spl-tri"></g>` +
    `<g class="spl-handles"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q m2u3q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(ratioCard, svgWrap, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "직선 위의 <b>두 손잡이</b>를 끌어 보세요. 오른쪽 손잡이를 <b>가로 2칸 이상</b> 벌리면 무슨 일이?",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gLine = svg.querySelector(".spl-line") as SVGGElement;
  const gTri = svg.querySelector(".spl-tri") as SVGGElement;
  const gHandles = svg.querySelector(".spl-handles") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let li = 0; // 현재 직선
  let hx: [number, number] = [LINES[0].ax, LINES[0].bx]; // 두 핸들의 x
  let phase: "wide" | "neg" | "coeff" | "done" = "wide";
  let drag: 0 | 1 | -1 = -1; // 드래그 중인 핸들 인덱스

  const yOf = (x: number): number => LINES[li].a * x + LINES[li].b;
  const sgn = (v: number): string => (v > 0 ? `+${v}` : String(v).replace("-", "−"));

  function paintLine(): void {
    const d = LINES[li];
    const t = 6;
    gLine.innerHTML =
      `<line x1="${spec.px(-t)}" y1="${spec.py(yOf(-t))}" x2="${spec.px(t)}" y2="${spec.py(yOf(t))}" stroke="#0CA678" stroke-width="3.2" stroke-linecap="round"/>` +
      `<text x="${spec.px(d.a > 0 ? 2.6 : -4.4)}" y="${spec.py(yOf(d.a > 0 ? 2.6 : -4.4)) - 10}" font-size="11" font-weight="800" font-style="italic" fill="#067D57">${d.label}</text>`;
  }

  /** 세모(왼→오 측정)와 핸들, 비율 카드를 다시 그린다. */
  function paint(): void {
    const [x0, x1] = hx;
    const L = Math.min(x0, x1);
    const R = Math.max(x0, x1);
    const run = R - L;
    const rise = yOf(R) - yOf(L);
    // 세모: L→(R, yL) 가로, (R, yL)→(R, yR) 세로 + 코너 직각 표시
    if (run > 0) {
      const cx = spec.px(R);
      const cy = spec.py(yOf(L));
      const up = rise >= 0;
      gTri.innerHTML =
        `<line x1="${spec.px(L)}" y1="${cy}" x2="${cx}" y2="${cy}" stroke="#E8A93E" stroke-width="2.4" stroke-dasharray="5 4"/>` +
        `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${spec.py(yOf(R))}" stroke="${up ? "#0DA5C6" : "#E8608A"}" stroke-width="2.4" stroke-dasharray="5 4"/>` +
        `<path d="M${cx - 9} ${cy} v${up ? -9 : 9} h9" fill="none" stroke="#94A3B8" stroke-width="1.4"/>` +
        `<text x="${(spec.px(L) + cx) / 2}" y="${cy + 16}" text-anchor="middle" font-size="11" font-weight="900" fill="#B87708">가로 ${sgn(run)}</text>` +
        `<text x="${cx + 7}" y="${(cy + spec.py(yOf(R))) / 2 + 4}" font-size="11" font-weight="900" fill="${up ? "#0B7285" : "#C2255C"}">세로 ${sgn(rise)}</text>`;
    } else gTri.innerHTML = "";
    gHandles.innerHTML = hx
      .map(
        (x, i) =>
          `<g class="spl-h" data-h="${i}"><circle cx="${spec.px(x)}" cy="${spec.py(yOf(x))}" r="12" fill="rgba(12,166,120,.14)"/>` +
          `<circle cx="${spec.px(x)}" cy="${spec.py(yOf(x))}" r="6.5" fill="#FFFFFF" stroke="#067D57" stroke-width="2.6"/></g>`,
      )
      .join("");
    if (run > 0) {
      const ratio = rise / run;
      ratioCard.innerHTML =
        `<span class="spl-fr">${mfmt(`{${sgn(rise).replace("−", "-")}/${run}}`)}</span>` +
        `<span class="spl-eqs">=</span><b class="spl-val ${ratio < 0 ? "neg" : ""}">${String(ratio).replace("-", "−")}</b>` +
        `<span class="spl-cap">(세로 증가량)/(가로 증가량)</span>`;
    }
    judge(run, rise);
  }

  function judge(run: number, rise: number): void {
    if (phase === "wide" && li === 0 && run >= 2) {
      chips.on("wide", "늘 2!");
      haptic(HAPTIC.correct);
      toast(`가로 ${run}칸, 세로 ${rise}칸. 비율은 여전히 2!`);
      helper.innerHTML =
        "손잡이를 어디에 놓아도 비율이 <b>항상 2</b>죠? 직선이라 어디서 재도 같아요. 그럼 <b>내려가는 직선</b>은 어떨까요?";
      phase = "neg";
      nextBtn();
    } else if (phase === "neg" && li === 1 && run >= 1 && rise < 0) {
      chips.on("neg", "비율 −1!");
      haptic(HAPTIC.correct);
      toast("오른쪽으로 갈수록 y가 줄어요. 세로 증가량이 음수, 비율은 −1!");
      helper.innerHTML = "내려가는 직선은 비율이 <b>음수</b>! 이제 이 비율의 정체를 밝힐 시간이에요.";
      phase = "coeff";
      later(askCoeff, 1300);
    }
  }

  function nextBtn(): void {
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "내려가는 직선으로" })) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      li = 1;
      hx = [LINES[1].ax, LINES[1].bx];
      paintLine();
      paint();
      clear(actions);
      helper.innerHTML = "이번 직선은 <b>y=−x+2</b>. 손잡이를 벌려서 비율을 재 보세요. 세로 증가량의 부호는?";
    });
    actions.appendChild(b);
  }

  function askCoeff(): void {
    qline.innerHTML =
      `첫 직선 ${mfmt("y=2x-1")} 의 비율은 <b>2</b>, 둘째 직선 ${mfmt("y=-x+2")} 의 비율은 <b>−1</b>. 이 수, 식 어디에 숨어 있었을까요?`;
    const items = [
      {
        t: "상수항이요: −1과 2가 딱 있잖아요",
        good: false,
        fb: "아깝지만 순서가 꼬였어요! 상수항은 −1·2가 아니라 '−1은 첫 식, 2는 둘째 식'의 상수항. 비율 2·−1과 짝이 맞는 건 x의 계수예요.",
      },
      {
        t: "x의 계수요: 2x의 2, −x의 −1!",
        good: true,
        fb: "명중! 이 비율은 언제나 x의 계수와 같아요. 식만 봐도 기울어진 정도를 아는 거죠.",
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
          chips.on("coeff", "x의 계수!");
          phase = "done";
          haptic(HAPTIC.done);
          helper.innerHTML =
            "직선의 기울어진 정도 = <b>(세로 증가량)/(가로 증가량)</b> = <b>x의 계수</b>. 어디서 재도 같고, " +
            "내려가면 음수. 이 수에 붙는 정식 이름이 기다리고 있어요!";
          api.recordQuiz(true);
          api.enableCTA(s.cta ?? "이름 붙이러 가기");
        }, 1900);
      });
      btns.push({ bt, good: !!it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
  }

  /* ── 핸들 드래그(정수 x 스냅, 실시간) ── */
  function pick(e: PointerEvent): 0 | 1 | -1 {
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * spec.size;
    const sy = ((e.clientY - rect.top) / rect.height) * spec.size;
    let best: 0 | 1 | -1 = -1;
    let bd = 26;
    hx.forEach((x, i) => {
      const d = Math.hypot(spec.px(x) - sx, spec.py(yOf(x)) - sy);
      if (d < bd) {
        bd = d;
        best = i as 0 | 1;
      }
    });
    return best;
  }

  function dragTo(e: PointerEvent): void {
    if (drag === -1) return;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * spec.size;
    const d = LINES[li];
    let x = Math.round(spec.vx(sx));
    x = Math.max(d.domain[0], Math.min(d.domain[1], x));
    if (x === hx[1 - drag]) return; // 두 핸들 겹침 금지
    if (x === hx[drag]) return;
    hx[drag] = x;
    haptic(HAPTIC.tap);
    paint();
  }

  svg.addEventListener("pointerdown", (e) => {
    if (phase === "coeff" || phase === "done") return;
    drag = pick(e);
    if (drag !== -1) {
      try {
        svg.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 이벤트 안전(사고 7) */
      }
      dragTo(e);
    }
  });
  svg.addEventListener("pointermove", (e) => {
    if (drag !== -1) dragTo(e);
  });
  const drop = (): void => {
    drag = -1;
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  paintLine();
  paint();
  api.setCTA("비율의 정체를 밝히면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
