// denomLab, 분모의 비밀 실험실(중2 수학 Ⅰ L3, 책 16~19쪽). 기약분수 분모를 소인수 칩으로
// 열어 보고, 2·5뿐이면 10의 거듭제곱으로 변신시켜 유한소수를 완성한다. 3이 끼면 실패,
// 나머지 룰렛에서 같은 나머지 재방문으로 순환의 정체를 본다.
// 국면 1 "10 만들기": 7/20, 분모 탭 → 소인수 칩 2·2·5 → 2·5 짝 합체(10) 관찰 →
//         [×2]/[×5]는 분자·분모에 동시 곱(×2는 "짝이 남아요" 안내 후 회수 연출) →
//         [10][10] 합체 = 100 → 7/20 = 35/100 = 0.35 완성 카드 + 목표 ten.
// 국면 2 "3의 저주": 5/6, 칩 2·3. 어떤 버튼을 눌러도 3이 짝 없이 도리도리(shake) +
//         "3은 10의 부품이 아니에요" 토스트 → [순환소수 판정!] 선언이 완료 경로 + 목표 curse.
// 국면 3 "나머지 룰렛": 1/7 필산. [다음 자리]마다 나머지 3→2→6→4→5→1 이동·점등,
//         몫 띠에 1→4→2→8→5→7 적재. 여섯 자리를 전부 밟은 뒤 예측(mq6-q) →
//         1 재방문 순간 고리 닫힘+반짝, "같은 나머지 = 몫 되풀이" + 142857 양 끝 점 + 목표 wheel.
// 문법: mboard+goalChips+mtoast+mq6- 패널(inst→eqs→qline→ctl), CSS 트랜지션/키프레임+
// setTimeout 체인(타이머 Set 일괄 해제), rAF 금지. 칩은 플로우 배치(transform은 팝·도리도리 키프레임 몫).
// 스타일은 math2.css의 .dnl-* 섹션. 참조 구현: vennFactor(소인수 칩)·likeTerms(국면 전환·선언)·freqLab(mq6 패널).
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type ChipBase = 2 | 3 | 5 | 10;
interface PChip {
  base: ChipBase;
  el: HTMLElement;
}
interface Frac {
  root: HTMLElement;
  numEl: HTMLElement;
  denEl: HTMLElement;
  chips: PChip[];
  num: number;
  den: number;
}

const CHIP_CLS: Record<ChipBase, string> = { 2: "p2", 3: "p3", 5: "p5", 10: "p10" };

/* 룰렛 기하: viewBox 340×236, 중심 (170,110), 슬롯 궤도 반지름 64. 슬롯 1이 12시, 시계 방향. */
const CX = 170;
const CY = 110;
const SR = 64;
function slotPos(r: number): [number, number] {
  const a = (((r - 1) * 60 - 90) * Math.PI) / 180;
  return [CX + SR * Math.cos(a), CY + SR * Math.sin(a)];
}

/* 1/7 필산 여섯 칸(검산: 10=1×7+3, 30=4×7+2, 20=2×7+6, 60=8×7+4, 40=5×7+5, 50=7×7+1).
   몫 1→4→2→8→5→7, 나머지 3→2→6→4→5→1. 스펙 순서 그대로. */
const DIV: { d: number; q: number; r: number }[] = [
  { d: 10, q: 1, r: 3 },
  { d: 30, q: 4, r: 2 },
  { d: 20, q: 2, r: 6 },
  { d: 60, q: 8, r: 4 },
  { d: 40, q: 5, r: 5 },
  { d: 50, q: 7, r: 1 },
];

/* 나머지 룰렛 SVG. 파운드리 재질: 3스톱 그라데이션 면 + 좌상단 키라이트 + 접촉 그림자,
   외곽선은 재질별 최암색만(균일 검정 금지). */
function wheelSvg(): string {
  const slots = [1, 2, 3, 4, 5, 6]
    .map((r) => {
      const [x, y] = slotPos(r);
      return (
        `<g class="dnl-slot" data-r="${r}">` +
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="17" fill="url(#dnlSlotBg)" stroke="#D8C7E1" stroke-width="1.4"/>` +
        `<circle class="ov" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="17" fill="url(#dnlSlotOn)" stroke="#7D2A93" stroke-width="1.6" opacity="0"/>` +
        `<text x="${x.toFixed(1)}" y="${(y + 4.8).toFixed(1)}" text-anchor="middle" font-size="13.5" font-weight="800" class="dnl-snum">${r}</text>` +
        `</g>`
      );
    })
    .join("");
  return (
    `<svg viewBox="0 0 340 236" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="나머지 룰렛">` +
    `<defs>` +
    `<radialGradient id="dnlFace" cx="32%" cy="26%" r="88%"><stop offset="0" stop-color="#FDFAFE"/><stop offset=".55" stop-color="#F4E9F8"/><stop offset="1" stop-color="#E5CDEE"/></radialGradient>` +
    `<radialGradient id="dnlSlotBg" cx="34%" cy="28%" r="90%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EFE3F4"/></radialGradient>` +
    `<radialGradient id="dnlSlotOn" cx="34%" cy="28%" r="90%"><stop offset="0" stop-color="#CE8ADC"/><stop offset=".6" stop-color="#9C36B5"/><stop offset="1" stop-color="#7D2A93"/></radialGradient>` +
    `<radialGradient id="dnlKey" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="dnlNd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#54688C"/><stop offset="1" stop-color="#22314F"/></linearGradient>` +
    `<radialGradient id="dnlHub" cx="35%" cy="30%" r="90%"><stop offset="0" stop-color="#F8FAFD"/><stop offset="1" stop-color="#C3CEDD"/></radialGradient>` +
    `</defs>` +
    `<ellipse cx="170" cy="224" rx="98" ry="9" fill="#2A3A5E" opacity=".10"/>` +
    `<circle cx="170" cy="110" r="92" fill="url(#dnlFace)" stroke="#8A5E9E" stroke-width="1.5"/>` +
    `<circle cx="170" cy="110" r="76" fill="none" stroke="#E3D2EB" stroke-width="1.2"/>` +
    `<ellipse cx="136" cy="62" rx="54" ry="32" fill="url(#dnlKey)"/>` +
    `<circle class="dnl-glowring" cx="170" cy="110" r="92" fill="none" stroke="#D9A0E8" stroke-width="5" opacity="0"/>` +
    `<g class="dnl-ring"></g>` +
    slots +
    `<g class="dnl-needle" style="transform-box: view-box; transform-origin: 170px 110px;">` +
    `<path d="M170 118 L163 110 L170 58 L177 110 Z" fill="url(#dnlNd)" stroke="#16223A" stroke-width="1.2" stroke-linejoin="round"/>` +
    `<circle cx="170" cy="110" r="8" fill="url(#dnlHub)" stroke="#8A97AC" stroke-width="1.4"/>` +
    `<circle cx="167.4" cy="107.4" r="2.4" fill="#FFFFFF" opacity=".8"/>` +
    `</g>` +
    `<circle class="dnl-flashc" cx="170" cy="110" r="92" fill="#FFFFFF" opacity="0" pointer-events="none"/>` +
    `<text x="170" y="216" text-anchor="middle" font-size="10" font-weight="800" fill="#8A6E99">나머지 룰렛(자리는 1~6뿐)</text>` +
    `</svg>`
  );
}

export const denomLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "ten", label: "10 만들기", sub: "2×5 짝" },
    { id: "curse", label: "3의 저주", sub: "판정하기" },
    { id: "wheel", label: "나머지 룰렛", sub: "재방문?" },
  ]);
  const board = mboard(340);
  const stage = el("div", { class: "dnl-stage" });
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst" });
  const eqs = el("div", { class: "mq6-eqs" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(goals.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  /* ---- 타이머(모든 지연은 여기로, cleanup에서 일괄 해제) ---- */
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ---- 공용 연출 도구 ---- */
  const repop = (n: HTMLElement): void => {
    n.classList.remove("dnl-pop");
    void n.offsetWidth;
    n.classList.add("dnl-pop");
  };

  const mkChipEl = (b: ChipBase): HTMLElement =>
    el("span", {
      class: `dnl-chip ${CHIP_CLS[b]} dnl-pop`,
      text: String(b),
      attrs: { "aria-label": `소인수 ${b}` },
    });

  function buildFrac(num: number, den: number): Frac {
    const numEl = el("div", { class: "dnl-fnum", text: String(num) });
    const denEl = el(
      "div",
      { class: "dnl-fden" },
      el("span", {
        class: "dnl-dnum",
        text: String(den),
        attrs: { role: "button", "aria-label": `분모 ${den} 소인수로 열기` },
      }),
    );
    const root = el("div", { class: "dnl-frac" }, numEl, el("div", { class: "dnl-fbar" }), denEl);
    return { root, numEl, denEl, chips: [], num, den };
  }

  /** 분모 숫자가 스케일 아웃되고 소인수 칩이 순서대로 팝. */
  function openDen(fr: Frac, factors: ChipBase[]): void {
    const dnum = fr.denEl.querySelector(".dnl-dnum") as HTMLElement | null;
    if (dnum) {
      dnum.classList.remove("hint");
      dnum.style.transform = "scale(.3)";
      dnum.style.opacity = "0";
      later(() => dnum.remove(), 220);
    }
    factors.forEach((b, i) => {
      later(() => {
        const c: PChip = { base: b, el: mkChipEl(b) };
        fr.denEl.appendChild(c.el);
        fr.chips.push(c);
        haptic(HAPTIC.tap);
      }, 200 + i * 150);
    });
  }

  /** 분자·분모 동시 곱: 값 갱신 + 위아래 ×m 배지가 함께 떠올라 "동시에"를 보여준다. */
  function setFrac(fr: Frac, num: number, den: number): void {
    fr.num = num;
    fr.den = den;
    fr.numEl.textContent = String(num);
    repop(fr.numEl);
  }
  function multiply(fr: Frac, m: number): void {
    setFrac(fr, fr.num * m, fr.den * m);
    (["n", "d"] as const).forEach((pos) => {
      const b = el("span", { class: `dnl-fx ${pos}`, text: `×${m}` });
      fr.root.appendChild(b);
      later(() => b.remove(), 880);
    });
  }

  /** 새 소인수 칩을 짝 후보(2↔5) 옆자리에 끼워 넣는다(합체 연출이 이웃에서 일어나게). */
  function addChipSmart(fr: Frac, base: 2 | 5): PChip {
    const comp: ChipBase = base === 2 ? 5 : 2;
    const mate = fr.chips.find((c) => c.base === comp);
    const chip: PChip = { base, el: mkChipEl(base) };
    if (mate) {
      mate.el.after(chip.el);
      fr.chips.splice(fr.chips.indexOf(mate) + 1, 0, chip);
    } else {
      fr.denEl.appendChild(chip.el);
      fr.chips.push(chip);
    }
    return chip;
  }

  /** 2·5 한 쌍을 찾아 합체: 노랑 플래시 → 5 붕괴, (5와 가장 가까운) 2가 [10]으로 변신 팝. */
  function mergePair(fr: Frac, after?: () => void): boolean {
    const five = fr.chips.find((c) => c.base === 5);
    const twos = fr.chips.filter((c) => c.base === 2);
    if (!five || twos.length === 0) {
      after?.();
      return false;
    }
    const fi = fr.chips.indexOf(five);
    let two = twos[0];
    let bd = Infinity;
    twos.forEach((c) => {
      const d = Math.abs(fr.chips.indexOf(c) - fi);
      if (d < bd) {
        bd = d;
        two = c;
      }
    });
    two.el.classList.add("fuse");
    five.el.classList.add("fuse");
    later(() => {
      five.el.classList.add("gone");
      const deadEl = five.el;
      later(() => deadEl.remove(), 300);
      fr.chips = fr.chips.filter((c) => c !== five);
      two.base = 10;
      two.el.textContent = "10";
      two.el.className = "dnl-chip p10";
      two.el.setAttribute("aria-label", "10 칩");
      repop(two.el);
      haptic(HAPTIC.select);
      later(() => after?.(), 430);
    }, 340);
    return true;
  }

  /** 3(또는 남은 2)의 도리도리: shake 키프레임 재트리거 + 잠깐 붉은 링. */
  function shakeChip(c: PChip): void {
    c.el.classList.remove("shake");
    void c.el.offsetWidth;
    c.el.classList.add("shake", "curse");
    const cel = c.el;
    later(() => cel.classList.remove("curse"), 820);
  }

  /** 국면 전환: 무대 페이드 아웃 → 패널 비우고 재구축 → 페이드 인. */
  function swapStage(build: () => void): void {
    stage.style.opacity = "0";
    later(() => {
      clear(stage);
      clear(eqs);
      qline.innerHTML = "";
      clear(ctl);
      build();
      stage.style.opacity = "1";
    }, 330);
  }

  /** 국면 전환 버튼: 결론 카드를 학생이 다 읽고 직접 넘어간다(자동 전환은 읽기 전에 사라지는 실사용 피드백). */
  function offerNext(label: string, go: () => void): void {
    later(() => {
      const b = el("button", {
        class: "dnl-go dnl-pop pulse",
        text: label,
        attrs: { type: "button" },
      });
      b.addEventListener("click", () => {
        b.disabled = true;
        b.classList.remove("pulse");
        haptic(HAPTIC.tap);
        go();
      });
      ctl.appendChild(b);
      later(() => b.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }, 700);
  }

  /* ================= 국면 1: 10 만들기(7/20) ================= */
  function phase1(): void {
    const fr = buildFrac(7, 20);
    stage.appendChild(el("div", { class: "dnl-scene" }, fr.root));
    inst.innerHTML = `첫 손님은 ${mfmt("{7/20}")} 이에요. 나눠 보지 않고, 분모만 보고 운명을 알 수 있을까요?`;
    helper.innerHTML = "비밀은 분모 안에 있어요. <b>분모 20</b>을 탭해서 소인수로 열어 봐요.";
    const dnum = fr.denEl.querySelector(".dnl-dnum") as HTMLElement;
    dnum.classList.add("hint");

    let opened = false;
    let busy = false;
    let done1 = false;

    dnum.addEventListener("click", () => {
      if (opened) return;
      opened = true;
      haptic(HAPTIC.tap);
      openDen(fr, [2, 2, 5]);
      toast("분모 20 = 2×2×5");
      inst.innerHTML = `유한소수는 0.7 = ${mfmt("{7/10}")} 처럼 <b>분모가 10, 100, 1000...</b> 인 분수로 쓸 수 있는 수예요. 열쇠는 10 = 2×5!`;
      later(() => {
        mergePair(fr, () => {
          toast("2와 5가 만나면 10으로 합체!");
          helper.innerHTML =
            "<b>2</b> 하나가 짝 없이 남았어요. 분자와 분모에 <b>같은 수</b>를 곱하면 값은 그대로라는 것, 기억하죠?";
          later(showMulButtons, 750);
        });
      }, 1100);
    });

    function showMulButtons(): void {
      qline.innerHTML = "짝 없는 <b>2</b>에게 무엇을 곱해 줘야 10이 될까요?";
      const row = el("div", { class: "mq6-choices" });
      row.append(mulBtn(2), mulBtn(5));
      ctl.appendChild(row);
      later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }

    function mulBtn(m: 2 | 5): HTMLButtonElement {
      const b = el("button", {
        class: "mq6-choice dnl-mul",
        text: `×${m}`,
        attrs: { type: "button", "aria-label": `분자와 분모에 ${m} 곱하기` },
      });
      b.addEventListener("click", () => {
        if (busy || done1) return;
        busy = true;
        haptic(HAPTIC.tap);
        multiply(fr, m);
        const chip = addChipSmart(fr, m);
        if (m === 5) {
          later(() => mergePair(fr, finish1), 500);
        } else {
          // 오개념 허용 후 회수: 2를 또 곱하면 짝 없는 2만 는다
          later(() => {
            fr.chips.filter((c) => c.base === 2).forEach((c) => shakeChip(c));
            haptic(HAPTIC.wrong);
            toast("2끼리는 10이 못 돼요! 짝 없는 2만 늘어서 이 ×2는 회수할게요");
            later(() => {
              chip.el.classList.add("gone");
              const deadEl = chip.el;
              later(() => deadEl.remove(), 300);
              fr.chips = fr.chips.filter((c) => c !== chip);
              setFrac(fr, fr.num / 2, fr.den / 2);
              busy = false;
            }, 1350);
          }, 500);
        }
      });
      return b;
    }

    function finish1(): void {
      if (done1) return;
      done1 = true;
      // [10][10]이 다시 합체해 100으로
      later(() => {
        fr.chips.forEach((c) => c.el.classList.add("fuse"));
        later(() => {
          fr.chips.forEach((c) => c.el.classList.add("gone"));
          later(() => {
            fr.chips.forEach((c) => c.el.remove());
            fr.chips = [];
            fr.denEl.appendChild(el("span", { class: "dnl-dnum dnl-pop", text: "100" }));
            haptic(HAPTIC.correct);
            toast("10×10, 분모가 100으로 변신!");
            qline.innerHTML = "";
            clear(ctl);
            eqs.appendChild(
              el("div", {
                class: "mq6-concl mq6-pop",
                html: `${mfmt("{7/20} = {35/100} = 0.35")}<br>분모가 10의 거듭제곱이 되면 <b>유한소수</b>예요!`,
              }),
            );
            goals.on("ten", "35/100!");
            helper.innerHTML =
              "분모의 소인수가 <b>2와 5뿐</b>이면 짝을 채워 10의 거듭제곱으로 바꿀 수 있어요. 그런데 다른 수가 끼어 있다면요?";
            offerNext("다음 손님 받기", () => swapStage(phase2));
          }, 330);
        }, 380);
      }, 300);
    }
  }

  /* ================= 국면 2: 3의 저주(5/6) ================= */
  function phase2(): void {
    const fr = buildFrac(5, 6);
    stage.appendChild(el("div", { class: "dnl-scene" }, fr.root));
    inst.innerHTML = `두 번째 손님은 ${mfmt("{5/6}")}. 분모 6 안에는 무엇이 숨어 있을까요?`;
    helper.innerHTML = "이번에도 <b>분모 6</b>을 탭해서 열어 봐요.";
    const dnum = fr.denEl.querySelector(".dnl-dnum") as HTMLElement;
    dnum.classList.add("hint");

    const MAXP = 3;
    let opened = false;
    let presses = 0;
    const tried = new Set<number>();
    let busy = false;
    let declared = false;
    let declareBtn: HTMLButtonElement | null = null;
    const mulBtns: HTMLButtonElement[] = [];

    dnum.addEventListener("click", () => {
      if (opened) return;
      opened = true;
      haptic(HAPTIC.tap);
      openDen(fr, [2, 3]);
      toast("분모 6 = 2×3");
      inst.innerHTML = "이번엔 <b>3</b>이 끼어 있어요. 그래도 곱해서 분모를 10의 거듭제곱으로 만들 수 있을까요?";
      later(() => {
        qline.innerHTML = "<b>3</b>에게도 짝을 찾아 줄 수 있을까요? 두 버튼을 모두 눌러 시험해 봐요";
        const row = el("div", { class: "mq6-choices" });
        const b2 = mulBtn(2);
        const b5 = mulBtn(5);
        mulBtns.push(b2, b5);
        row.append(b2, b5);
        ctl.appendChild(row);
        later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
      }, 750);
    });

    const curseMsg = (merged: boolean): string => {
      if (presses === 1) return merged ? "2와 5는 짝을 맺었는데, 3은 그대로예요" : "2가 늘었지만 3의 짝은 아니에요";
      return "3은 10의 부품이 아니에요! 10 = 2×5, 3의 자리는 없어요";
    };

    function lockMuls(): void {
      mulBtns.forEach((b) => {
        b.disabled = true;
      });
    }

    function maybeUnlockDeclare(): void {
      if (declareBtn) return;
      if (!((tried.has(2) && tried.has(5)) || presses >= MAXP)) return;
      qline.innerHTML = "몇 번을 곱해도 <b>3</b>이 남아요. 3이 남는 한 분모는 10의 거듭제곱이 못 돼요. 판정을 내려요!";
      declareBtn = el("button", {
        class: "dnl-go dnl-pop pulse",
        text: "순환소수 판정!",
        attrs: { type: "button", "aria-label": "순환소수로 판정하기" },
      });
      declareBtn.addEventListener("click", declare);
      ctl.appendChild(declareBtn);
      later(() => declareBtn?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }

    function mulBtn(m: 2 | 5): HTMLButtonElement {
      const b = el("button", {
        class: "mq6-choice dnl-mul",
        text: `×${m}`,
        attrs: { type: "button", "aria-label": `분자와 분모에 ${m} 곱하기` },
      });
      b.addEventListener("click", () => {
        if (busy || declared || presses >= MAXP) return;
        busy = true;
        presses += 1;
        tried.add(m);
        haptic(HAPTIC.tap);
        multiply(fr, m);
        addChipSmart(fr, m);
        const hadPair = fr.chips.some((c) => c.base === 2) && fr.chips.some((c) => c.base === 5);
        const afterMerge = (): void => {
          const three = fr.chips.find((c) => c.base === 3);
          if (three) shakeChip(three);
          haptic(HAPTIC.cross);
          if (presses >= MAXP) {
            lockMuls();
            toast("그만하면 충분해요, 아무리 곱해도 3은 남아요");
          } else {
            toast(curseMsg(hadPair));
          }
          maybeUnlockDeclare();
          busy = false;
        };
        later(() => {
          if (hadPair) mergePair(fr, afterMerge);
          else later(afterMerge, 140);
        }, 480);
      });
      return b;
    }

    function declare(): void {
      if (declared) return;
      declared = true;
      lockMuls();
      if (declareBtn) {
        declareBtn.disabled = true;
        declareBtn.classList.remove("pulse");
      }
      const three = fr.chips.find((c) => c.base === 3);
      if (three) shakeChip(three);
      haptic(HAPTIC.correct);
      toast("판정 완료, 순환소수!");
      qline.innerHTML = "";
      eqs.appendChild(
        el("div", {
          class: "mq6-concl mq6-pop",
          html:
            `분모의 <b>3</b>은 무엇을 곱해도 사라지지 않아요. ${mfmt("{5/6}")} 은 유한소수가 될 수 없는 수, ` +
            `<b>순환소수</b>예요!<br>${mfmt("5÷6 = 0.8333…")}`,
        }),
      );
      goals.on("curse", "순환 판정!");
      helper.innerHTML =
        "판별법 완성! 기약분수의 분모에 <b>2와 5 외의 소인수</b>가 남으면 순환소수예요. 그런데 왜 하필 같은 숫자가 되풀이될까요? 마지막 방에서 확인해요.";
      offerNext("마지막 방으로", () => swapStage(phase3));
    }
  }

  /* ================= 국면 3: 나머지 룰렛(1/7) ================= */
  function phase3(): void {
    inst.innerHTML = `마지막 손님은 ${mfmt("{1/7}")}. 분모 7도 2·5가 아니니 순환소수겠죠. 그런데 <b>왜 같은 몫이 되풀이</b>될까요?`;
    helper.innerHTML =
      "1÷7 나눗셈 속으로 들어가요. 버튼을 누를 때마다 한 자리씩 나눠지고, 바늘이 가리키는 곳이 <b>나머지</b>예요.";

    const wheel = el("div", { class: "dnl-wheel", html: wheelSvg() });
    const strip = el(
      "div",
      { class: "dnl-strip" },
      el("span", { class: "dnl-striplab", text: "몫" }),
      el("span", { class: "dnl-cell pre dnl-pop", text: "0" }),
      el("span", { class: "dnl-cell pre dnl-pop", text: "." }),
    );
    const rep = el("div", { class: "dnl-rep" });
    stage.appendChild(el("div", { class: "dnl-scene" }, wheel, strip, rep));

    const svg = wheel.querySelector("svg") as SVGSVGElement;
    const needle = svg.querySelector(".dnl-needle") as SVGGElement;
    const ringG = svg.querySelector(".dnl-ring") as SVGGElement;

    let eqEl: HTMLElement | null = null;
    const eq = (): HTMLElement => {
      if (!eqEl) {
        eqEl = el("div", { class: "mq6-eq" });
        eqs.appendChild(eqEl);
      }
      return eqEl;
    };

    function markSlot(r: number, revisit = false): void {
      const g = svg.querySelector(`.dnl-slot[data-r="${r}"]`) as SVGGElement | null;
      if (!g) return;
      g.classList.add("on");
      if (revisit) g.classList.add("re");
    }

    function drawChord(a: number, b: number): void {
      const [x1, y1] = slotPos(a);
      const [x2, y2] = slotPos(b);
      const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("x1", x1.toFixed(1));
      ln.setAttribute("y1", y1.toFixed(1));
      ln.setAttribute("x2", x2.toFixed(1));
      ln.setAttribute("y2", y2.toFixed(1));
      ln.setAttribute("class", "dnl-ringline");
      const len = Math.hypot(x2 - x1, y2 - y1);
      ln.style.strokeDasharray = String(len);
      ln.style.strokeDashoffset = String(len);
      ringG.appendChild(ln);
      void ln.getBoundingClientRect();
      ln.style.strokeDashoffset = "0";
    }

    let stepNo = 0;
    let ang = 0;
    let curRem = 1;
    let busy = false;

    function rotTo(r: number): void {
      ang += ((r - curRem + 6) % 6) * 60;
      needle.style.transform = `rotate(${ang}deg)`;
      curRem = r;
    }

    // 출발: 나머지 1 점등
    markSlot(1);
    eq().innerHTML = `1은 7보다 작아서 몫은 <b>0.</b> 으로 시작하고, 출발 나머지는 <b>1</b>이에요`;

    const nextBtn = el("button", {
      class: "dnl-go pulse",
      text: "다음 자리 나누기",
      attrs: { type: "button" },
    });
    nextBtn.addEventListener("click", tapNext);
    ctl.appendChild(nextBtn);
    later(() => nextBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정

    function tapNext(): void {
      if (busy || stepNo >= DIV.length) return;
      busy = true;
      nextBtn.disabled = true;
      nextBtn.classList.remove("pulse");
      haptic(HAPTIC.tap);
      const st = DIV[stepNo];
      const prev = curRem;
      stepNo += 1;
      strip.appendChild(el("span", { class: "dnl-cell dnl-pop", text: String(st.q) }));
      eq().innerHTML = `${mfmt(`${st.d}÷7 = ${st.q}`)}<span class="dnl-remtag">나머지 ${st.r}</span>`;
      repop(eq());
      rotTo(st.r);
      drawChord(prev, st.r);
      if (stepNo === 1) inst.innerHTML = "나머지 1에 0을 붙여 10, 그걸 7로 나눠요. 몫 1은 띠로, 나머지 3은 룰렛으로!";
      if (stepNo === 3) toast("몫은 아래 띠에 쌓이고, 나머지는 룰렛을 돌아요");
      const isLast = stepNo === DIV.length;
      later(() => {
        if (isLast) {
          finale();
          return;
        }
        markSlot(st.r);
        haptic(HAPTIC.tap);
        if (stepNo === 5) {
          askPredict();
          busy = false;
          return;
        }
        nextBtn.disabled = false;
        busy = false;
      }, 900);
    }

    function askPredict(): void {
      nextBtn.style.display = "none";
      qline.innerHTML = "룰렛 자리는 <b>1~6, 여섯 개</b>뿐인데 벌써 전부 밟았어요. 다음 나머지는 어떻게 될까요?";
      const row = el("div", { class: "mq6-choices" });
      const CHOICES: [string, boolean, string][] = [
        ["7이 나온다", false, "7로 나눈 나머지는 7이 될 수 없어요. 나머지는 언제나 1~6 중 하나예요"],
        ["밟았던 자리를 또 밟는다", true, ""],
        ["0이 나와서 딱 끝난다", false, "나머지 0은 나누어떨어진다는 뜻이에요. 분모 7은 2와 5만으로 안 되니 그럴 수 없죠"],
      ];
      CHOICES.forEach(([label, good, msg]) => {
        const b = el("button", { class: "mq6-choice", text: label, attrs: { type: "button" } });
        b.addEventListener("click", () => {
          if (good) {
            haptic(HAPTIC.correct);
            row.querySelectorAll("button").forEach((x) => {
              (x as HTMLButtonElement).disabled = true;
            });
            b.classList.add("ok");
            toast("자리가 여섯 개뿐이니 언젠가는 겹칠 수밖에 없어요. 진짜인지 확인!");
            later(() => {
              qline.innerHTML = "";
              row.remove();
              nextBtn.style.display = "";
              nextBtn.disabled = false;
              nextBtn.classList.add("pulse");
            }, 1500);
          } else {
            haptic(HAPTIC.wrong);
            b.classList.add("no");
            toast(msg);
            later(() => b.classList.remove("no"), 950);
          }
        });
        row.appendChild(b);
      });
      ctl.appendChild(row);
      later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }

    function finale(): void {
      markSlot(1, true);
      svg.classList.add("loop");
      svg.querySelector(".dnl-flashc")?.classList.add("go");
      haptic(HAPTIC.done);
      toast("같은 나머지가 다시 나왔다, 여기부터 몫이 되풀이돼요!");
      eq().innerHTML = `${mfmt("50÷7 = 7")}<span class="dnl-remtag">나머지 1, 처음 그 나머지!</span>`;
      repop(eq());
      later(() => {
        const cells = strip.querySelectorAll(".dnl-cell:not(.pre)");
        (cells[0] as HTMLElement).classList.add("dot");
        (cells[cells.length - 1] as HTMLElement).classList.add("dot");
        ["1", "4", "2"].forEach((d, i) =>
          later(() => strip.appendChild(el("span", { class: "dnl-cell ghost dnl-pop", text: d })), 200 + i * 140),
        );
        later(() => strip.appendChild(el("span", { class: "dnl-cell ghost dnl-pop", text: "…" })), 640);
        rep.innerHTML = "양 끝 숫자 위의 점 두 개가 <b>순환마디 142857</b>이라는 표시예요";
        eqs.appendChild(
          el("div", {
            class: "mq6-concl mq6-pop",
            html:
              "나머지 <b>1</b>이 다시 나왔어요! 같은 나머지에서 시작하면 그다음 계산도 전부 똑같이 되풀이돼요. " +
              "그래서 몫 <b>142857</b>이 영원히 반복, 이게 순환소수의 정체예요!",
          }),
        );
        helper.innerHTML =
          "정리! 기약분수의 분모가 <b>2와 5뿐</b>이면 10의 거듭제곱으로 변신해 유한소수, <b>다른 소인수</b>가 남으면 나머지 룰렛이 돌아 순환소수예요.";
        nextBtn.remove();
        goals.on("wheel", "142857 반복!");
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "다음");
      }, 1150);
    }
  }

  phase1();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
