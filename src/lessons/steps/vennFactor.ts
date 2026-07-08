// vennFactor, 소인수 벤 다이어그램(L4·L5 기함 랩).
// gcd: 36·60의 소인수 칩에서 "같은 수끼리" 짝지어 교집합으로, 교집합의 곱이 최대공약수.
// lcm: (L4에서 만든 벤 그대로) 울타리 전체를 탭해 곱하면 최소공배수, 검산·서로소까지.
// coprime: 서로소 판별소 3스테이지(8·9 → 9·25 → 14·21 함정), 짝을 찾아 겹치거나
//   확신이 서면 "서로소!" 선언. 겹침이 하나라도 합쳐지면 그 자리에서 "서로소 아님" 판정.
// rAF 없음. 드래그 + 탭 폴백, setPointerCapture는 try/catch.
import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface VennStep {
  title: string;
  lead?: string;
  mode: "gcd" | "lcm" | "coprime";
  cta?: string;
  curio?: Curio;
}

const W = 360;
const H = 226;
const CHIP = 42;
const PRIME_COLOR: Record<number, [string, string]> = {
  2: ["#7FA8F2", "#2F6FE4"],
  3: ["#6FD8A8", "#0CA678"],
  5: ["#FFC24D", "#F08C2E"],
  7: ["#B9A6F2", "#7C6BFF"],
};

interface VChip {
  base: number;
  side: "L" | "R" | "C";
  locked: boolean;
  x: number;
  y: number;
  el: HTMLElement;
}

export const vennFactor: StepRenderer = (host, step, api) => {
  const s = step as unknown as VennStep;
  const isGcd = s.mode === "gcd";

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips(
    isGcd
      ? [
          { id: "common", label: "겹침 찾기", sub: "같은 수끼리" },
          { id: "gcd", label: "최대공약수", sub: "교집합의 곱" },
          { id: "divs", label: "공약수", sub: "누구의 약수?" },
        ]
      : s.mode === "coprime"
        ? [
            { id: "st1", label: "8과 9", sub: "겹칠까?" },
            { id: "st2", label: "9와 25", sub: "합성수끼리" },
            { id: "st3", label: "14와 21", sub: "함정 주의" },
          ]
        : [
            { id: "lcm", label: "울타리 전체", sub: "곱하면?" },
            { id: "check", label: "검산", sub: "정말 배수?" },
            { id: "coprime", label: "서로소면?", sub: "5와 8" },
          ],
  );
  const board = mboard(H + 14);
  const toast = mtoast(board);
  const stage = el("div", { class: "vn-stage" });
  const read = el("div", { class: "vn-read" });
  board.appendChild(stage);
  const actions = el("div", { class: "ct-actions" });
  const helper = el("div", { class: "helper" });
  host.append(goals.el, board, read, actions, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };

  let chips: VChip[] = [];
  let labelA = 36;
  let labelB = 60;

  function drawVenn(): void {
    stage.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<circle cx="128" cy="118" r="88" fill="rgba(13,165,198,.08)" stroke="#2FA8C4" stroke-width="2"/>` +
      `<circle cx="232" cy="118" r="88" fill="rgba(124,107,255,.07)" stroke="#8A6EE0" stroke-width="2"/>` +
      `<text x="52" y="30" font-size="17" font-weight="800" fill="#0A87A3">${labelA}</text>` +
      `<text x="292" y="30" font-size="17" font-weight="800" fill="#6A55F2">${labelB}</text>` +
      `</svg>`;
  }

  function scale(): number {
    return (stage.clientWidth || W) / W;
  }

  function mkChip(base: number, x: number, y: number, side: "L" | "R" | "C", locked = false): VChip {
    const [c1, c2] = PRIME_COLOR[base] ?? PRIME_COLOR[7];
    const c: VChip = {
      base,
      side,
      locked,
      x,
      y,
      el: el("div", {
        class: `vn-chip ${locked ? "locked" : ""}`,
        text: String(base),
        style: `background: radial-gradient(120% 120% at 32% 26%, ${c1} 0%, ${c2} 62%, ${c2} 100%)`,
        attrs: { role: "button", "aria-label": `소인수 ${base}` },
      }),
    };
    place(c);
    board.appendChild(c.el);
    chips.push(c);
    if (s.mode !== "lcm" && !locked) bindDrag(c);
    return c;
  }

  function place(c: VChip): void {
    const k = scale();
    c.el.style.transition = "transform .3s var(--spring-soft, ease)";
    c.el.style.transform = `translate(${c.x * k}px, ${(c.y + 8) * k}px)`;
  }

  const CENTER_SLOTS: [number, number][] = [
    [159, 46],
    [159, 108],
    [159, 168],
  ];
  let centerUsed = 0;

  /* ================= GCD 모드 ================= */
  function setupGcd(): void {
    labelA = 36;
    labelB = 60;
    drawVenn();
    helper.innerHTML =
      "36 = 2×2×3×3, 60 = 2×2×3×5. <b>양쪽에 다 있는 소인수</b>를 찾아 같은 수끼리 끌어 겹쳐 보세요.";
    const L: [number, [number, number]][] = [
      [2, [58, 62]],
      [2, [42, 122]],
      [3, [62, 172]],
      [3, [96, 96]],
    ];
    const R: [number, [number, number]][] = [
      [2, [262, 62]],
      [2, [278, 122]],
      [3, [258, 172]],
      [5, [222, 96]],
    ];
    L.forEach(([b, [x, y]], i) => later(() => mkChip(b, x, y, "L"), i * 90));
    R.forEach(([b, [x, y]], i) => later(() => mkChip(b, x, y, "R"), 380 + i * 90));
  }

  function commonRemains(): boolean {
    const l = chips.filter((c) => c.side === "L" && !c.locked).map((c) => c.base);
    const r = chips.filter((c) => c.side === "R" && !c.locked).map((c) => c.base);
    return l.some((b) => r.includes(b));
  }

  function mergeToCenter(a: VChip, b: VChip): void {
    const slot = CENTER_SLOTS[Math.min(centerUsed, CENTER_SLOTS.length - 1)];
    centerUsed += 1;
    chips = chips.filter((c) => c !== a && c !== b);
    a.el.remove();
    b.el.style.transition = "transform .32s var(--spring-soft, ease)";
    b.side = "C";
    b.locked = true;
    b.x = slot[0];
    b.y = slot[1];
    b.el.classList.add("locked");
    place(b);
    chips.push(b);
    haptic(HAPTIC.select);
    if (s.mode === "coprime") {
      coprimeMerged(b.base);
      return;
    }
    if (goals.on("common", "찾았다!")) {
      helper.innerHTML = "좋아요, 겹치는 소인수는 <b>가운데(교집합)</b>로 모여요. 남은 겹침도 찾아보세요.";
    }
    paintGcdRead();
    if (!commonRemains()) {
      later(finishGcd, 500);
    }
  }

  function paintGcdRead(): void {
    const center = chips.filter((c) => c.side === "C").map((c) => c.base).sort((x, y) => x - y);
    if (!center.length) {
      read.innerHTML = "";
      return;
    }
    const prod = center.reduce((m, v) => m * v, 1);
    read.innerHTML = mfmt(`교집합: ${center.join("×")} = ${prod}`);
  }

  let gcdDone = false;
  function finishGcd(): void {
    if (gcdDone) return;
    gcdDone = true;
    const center = chips.filter((c) => c.side === "C").map((c) => c.base).sort((x, y) => x - y);
    const prod = center.reduce((m, v) => m * v, 1);
    read.innerHTML = mfmt(`최대공약수 = ${center.join("×")} = ${prod}`);
    haptic(HAPTIC.correct);
    toast(`최대공약수 ${prod}!`);
    goals.on("gcd", `${prod}!`);
    helper.innerHTML =
      `겹침은 끝! 교집합의 곱 <b>2×2×3 = 12</b>가 36과 60의 <b>최대공약수</b>예요. ` +
      "그런데 공약수는 12 말고도 있었죠, 확인해 볼까요?";
    const btn = el("button", { class: "ct-btn hero", text: "공약수 전부 보기", attrs: { type: "button" } });
    btn.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      btn.remove();
      read.innerHTML = mfmt("공약수: 1, 2, 3, 4, 6, 12") + `&nbsp;<b style="font-size:14px">, 전부 12의 약수!</b>`;
      helper.innerHTML =
        "36과 60의 공약수 <b>1, 2, 3, 4, 6, 12</b>는 정확히 <b>최대공약수 12의 약수</b>와 같아요. " +
        "그래서 최대공약수 하나만 찾으면 공약수를 전부 아는 셈이에요.";
      goals.on("divs", "12의 약수!");
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "연습하기");
    });
    actions.appendChild(btn);
  }

  /* ================= LCM 모드 ================= */
  let product = 1;
  let tapped = 0;
  let lcmStage = 0; // 0: 36·60, 1: 5·8(서로소)

  function setupLcm(stageNo: number): void {
    lcmStage = stageNo;
    chips.forEach((c) => c.el.remove());
    chips = [];
    doneTap.clear();
    product = 1;
    tapped = 0;
    read.innerHTML = "";
    if (stageNo === 0) {
      labelA = 36;
      labelB = 60;
      drawVenn();
      helper.innerHTML =
        "지난번에 만든 벤 그대로예요. 이번엔 <b>울타리 안 전체</b>, 교집합 + 양쪽 나머지를 <b>모두</b> 탭해서 곱해 보세요.";
      // 교집합(2,2,3) + 왼쪽 나머지 3 + 오른쪽 나머지 5
      mkChip(2, 159, 52, "C", true);
      mkChip(2, 159, 118, "C", true);
      mkChip(3, 159, 178, "C", true);
      mkChip(3, 62, 118, "L", true);
      mkChip(5, 282, 118, "R", true);
    } else {
      labelA = 5;
      labelB = 8;
      drawVenn();
      helper.innerHTML =
        "이번엔 <b>5와 8</b>, 겹치는 소인수가 하나도 없어요(교집합이 텅 빈 벤!). 그래도 규칙은 같아요: 전부 곱하기.";
      mkChip(5, 62, 118, "L", true);
      mkChip(2, 250, 62, "R", true);
      mkChip(2, 268, 122, "R", true);
      mkChip(2, 246, 176, "R", true);
    }
    chips.forEach((c) => {
      c.el.style.opacity = "1";
      c.el.addEventListener("click", () => tapLcm(c));
    });
    paintLcmRead();
  }

  const doneTap = new Set<VChip>();
  function tapLcm(c: VChip): void {
    if (doneTap.has(c)) {
      toast("이미 곱한 칩이에요");
      return;
    }
    doneTap.add(c);
    tapped += 1;
    product *= c.base;
    c.el.style.outline = "3px solid rgba(255,176,31,.75)";
    c.el.style.opacity = ".92";
    haptic(HAPTIC.tap);
    paintLcmRead();
    if (tapped === chips.length) {
      if (lcmStage === 0) finishLcm0();
      else finishLcm1();
    }
  }

  function paintLcmRead(): void {
    const seq = [...doneTap].map((c) => c.base);
    read.innerHTML = seq.length
      ? mfmt(`${seq.join("×")} = ${product}`)
      : mfmt("아직 0개: 칩을 탭!");
  }

  function finishLcm0(): void {
    read.innerHTML = mfmt(`최소공배수 = 2×2×3×3×5 = ${product}`);
    haptic(HAPTIC.correct);
    toast(`최소공배수 ${product}!`);
    goals.on("lcm", `${product}!`);
    helper.innerHTML =
      "울타리 전체의 곱 <b>180</b>이 최소공배수예요, 공통 소인수는 <b>한 번만</b>(교집합), 나머지는 전부. 정말 둘 다의 배수인지 검산해 볼까요?";
    const btn = el("button", { class: "ct-btn hero", text: "검산하기", attrs: { type: "button" } });
    btn.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      btn.remove();
      read.innerHTML = mfmt("180÷36 = 5") + "&nbsp;&nbsp;" + mfmt("180÷60 = 3") + `&nbsp;<b style="font-size:14px">, 딱 떨어져요!</b>`;
      helper.innerHTML =
        "180은 36의 배수이자 60의 배수, 그중 <b>가장 작은</b> 공배수예요. 모든 공배수(180, 360, 540, ...)는 180의 배수고요. 마지막으로 <b>서로소</b>면 어떻게 될까요?";
      goals.on("check", "딱 떨어짐!");
      later(() => setupLcm(1), 1900);
    });
    actions.appendChild(btn);
  }

  function finishLcm1(): void {
    read.innerHTML = mfmt(`최소공배수 = 5×8 = ${product}`);
    haptic(HAPTIC.correct);
    toast("서로소면 그냥 곱!");
    goals.on("coprime", "5×8=40!");
    helper.innerHTML =
      "겹침(교집합)이 없으니 <b>최소공배수 = 두 수의 곱</b>이 돼요. 5와 8처럼 최대공약수가 1인 두 수, <b>서로소</b>일 때만 생기는 지름길!";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "연습하기");
  }

  /* ================= COPRIME 모드(서로소 판별소) ================= */
  interface CoStage {
    a: number;
    b: number;
    L: [number, [number, number]][];
    R: [number, [number, number]][];
    coprime: boolean;
    goal: string;
    intro: string;
    win: string;
  }
  const CO_STAGES: CoStage[] = [
    {
      a: 8,
      b: 9,
      L: [
        [2, [56, 70]],
        [2, [42, 128]],
        [2, [68, 170]],
      ],
      R: [
        [3, [256, 92]],
        [3, [272, 152]],
      ],
      coprime: true,
      goal: "st1",
      intro: "8 = 2×2×2, 9 = 3×3. <b>겹치는 재료가 있는지</b> 같은 수끼리 짝지어 보고, 하나도 없다는 확신이 서면 <b>서로소!</b>를 눌러요.",
      win: "맞아요! 재료가 하나도 안 겹치면 함께 나눌 수 있는 수는 <b>1뿐</b>, 최대공약수 1이에요. 이 관계를 곧 <b>서로소</b>라 부를 거예요.",
    },
    {
      a: 9,
      b: 25,
      L: [
        [3, [54, 92]],
        [3, [70, 154]],
      ],
      R: [
        [5, [258, 92]],
        [5, [272, 152]],
      ],
      coprime: true,
      goal: "st2",
      intro: "이번엔 <b>9와 25</b>, 둘 다 소수가 아니에요(합성수). 그래도 서로소일 수 있을까요?",
      win: "정답! 9 = 3², 25 = 5², <b>둘 다 합성수여도</b> 재료가 안 겹치면 서로소예요. '서로소 = 둘 다 소수'가 아니라는 것, 시험 단골!",
    },
    {
      a: 14,
      b: 21,
      L: [
        [2, [52, 82]],
        [7, [68, 152]],
      ],
      R: [
        [3, [276, 82]],
        [7, [252, 152]],
      ],
      coprime: false,
      goal: "st3",
      intro: "마지막, <b>14와 21</b>. 딱 보면 안 겹칠 것 같은데… 정말요? 확인해 보세요.",
      win: "",
    },
  ];
  let coStage = 0;
  let coBtn: HTMLButtonElement | null = null;
  let coDone = false;

  function setupCoprime(stageNo: number): void {
    coStage = stageNo;
    const st = CO_STAGES[stageNo];
    chips.forEach((c) => c.el.remove());
    chips = [];
    centerUsed = 0;
    pendingTap = null;
    read.innerHTML = "";
    actions.innerHTML = "";
    labelA = st.a;
    labelB = st.b;
    drawVenn();
    helper.innerHTML = st.intro;
    st.L.forEach(([b, [x, y]], i) => later(() => mkChip(b, x, y, "L"), i * 90));
    st.R.forEach(([b, [x, y]], i) => later(() => mkChip(b, x, y, "R"), 300 + i * 90));
    coBtn = el("button", { class: "ct-btn hero", text: "겹침 없음, 서로소!", attrs: { type: "button" } }) as HTMLButtonElement;
    coBtn.addEventListener("click", () => declareCoprime());
    actions.appendChild(coBtn);
  }

  function declareCoprime(): void {
    if (coDone) return;
    const st = CO_STAGES[coStage];
    if (!st.coprime) {
      // 함정: 겹침(7)이 있는데 서로소 선언
      haptic(HAPTIC.wrong);
      toast("정말요? 잘 봐요!");
      helper.innerHTML = "성급했어요! <b>7</b>이 양쪽에 숨어 있어요. 같은 수끼리 끌어 겹쳐 보세요.";
      chips
        .filter((c) => c.base === 7)
        .forEach((c) => {
          c.el.style.outline = "3px solid rgba(240,68,82,.55)";
          later(() => {
            c.el.style.outline = "";
          }, 900);
        });
      return;
    }
    haptic(HAPTIC.correct);
    read.innerHTML = mfmt(`교집합: 텅! → 최대공약수 1`);
    toast("서로소!");
    goals.on(st.goal, "서로소!");
    helper.innerHTML = st.win;
    coBtn?.remove();
    if (coStage + 1 < CO_STAGES.length) {
      later(() => setupCoprime(coStage + 1), 2100);
    }
  }

  /** 함정 스테이지에서 겹침(7·7)이 실제로 합쳐진 순간 → 서로소 아님 판정. */
  function coprimeMerged(base: number): void {
    const st = CO_STAGES[coStage];
    read.innerHTML = mfmt(`교집합: ${base} → 최대공약수 ${base}`);
    toast("겹쳤다, 서로소 아님!");
    goals.on(st.goal, `gcd ${base}!`);
    coBtn?.remove();
    finishCoprime();
  }

  function finishCoprime(): void {
    if (coDone) return;
    coDone = true;
    haptic(HAPTIC.done);
    later(() => {
      helper.innerHTML =
        "판별 완료! 서로소 = <b>최대공약수가 1</b> = 소인수 재료가 <b>하나도 안 겹침</b>. " +
        "9와 25처럼 합성수끼리도 서로소일 수 있고, 14와 21처럼 겉만 봐선 몰라요. <b>분해해 봐야 안다</b>, 이게 오늘의 무기!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "이름 붙이기");
    }, 1400);
  }

  /* ================= 드래그(GCD·COPRIME 짝짓기) ================= */
  function bindDrag(c: VChip): void {
    if (s.mode === "lcm" || c.locked || c.el.dataset.bound) return;
    c.el.dataset.bound = "1";
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    let moved = false;
    let dragging = false;
    const down = (e: PointerEvent): void => {
      if (c.locked) return;
      dragging = true;
      moved = false;
      sx = e.clientX;
      sy = e.clientY;
      ox = c.x;
      oy = c.y;
      c.el.classList.add("drag");
      try {
        c.el.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 이벤트 안전 */
      }
    };
    const move = (e: PointerEvent): void => {
      if (!dragging) return;
      const k = scale();
      const dx = (e.clientX - sx) / k;
      const dy = (e.clientY - sy) / k;
      if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
      c.x = clamp(ox + dx, 2, W - CHIP - 2);
      c.y = clamp(oy + dy, 2, H - CHIP - 2);
      c.el.style.transition = "none";
      const kk = scale();
      c.el.style.transform = `translate(${c.x * kk}px, ${(c.y + 8) * kk}px)`;
    };
    const up = (): void => {
      if (!dragging) return;
      dragging = false;
      c.el.classList.remove("drag");
      if (!moved) {
        // 탭 폴백: 선택 표시
        if (pendingTap && pendingTap !== c) {
          const other = pendingTap;
          pendingTap = null;
          chips.forEach((o) => (o.el.style.outline = ""));
          attemptPair(other, c);
        } else {
          pendingTap = c;
          chips.forEach((o) => (o.el.style.outline = o === c ? "3px solid rgba(13,165,198,.55)" : ""));
        }
        place(c);
        return;
      }
      // 드롭: 가장 가까운 반대편 칩과 짝짓기 시도
      let best: VChip | null = null;
      let bd = 1e9;
      for (const o of chips) {
        if (o === c || o.locked || o.side === c.side) continue;
        const d = Math.hypot(o.x - c.x, o.y - c.y);
        if (d < bd) {
          bd = d;
          best = o;
        }
      }
      if (best && bd < CHIP * 1.05) {
        attemptPair(c, best);
      } else {
        c.x = ox;
        c.y = oy;
        place(c);
      }
    };
    c.el.addEventListener("pointerdown", down);
    c.el.addEventListener("pointermove", move);
    c.el.addEventListener("pointerup", up);
    c.el.addEventListener("pointercancel", up);
  }

  let pendingTap: VChip | null = null;

  function attemptPair(a: VChip, b: VChip): void {
    if (a.side === b.side) {
      haptic(HAPTIC.wrong);
      toast("반대쪽 원의 칩과 짝지어요");
      resetPos(a);
      return;
    }
    if (a.base !== b.base) {
      haptic(HAPTIC.wrong);
      toast(`${a.base}와 ${b.base}는 달라요, 같은 수끼리만 겹쳐요`);
      resetPos(a);
      return;
    }
    mergeToCenter(a, b);
  }

  function resetPos(c: VChip): void {
    // 원래 진영의 빈 자리로 돌아간다(단순히 살짝 밀어 되돌림)
    c.x = c.side === "L" ? clamp(c.x, 34, 108) : clamp(c.x, 216, 300);
    c.y = clamp(c.y, 44, 176);
    place(c);
  }

  drawVenn();
  if (isGcd) setupGcd();
  else if (s.mode === "coprime") setupCoprime(0);
  else setupLcm(0);

  api.setCTA("목표를 모두 모으면 열려요", { enabled: false });
  return () => {
    timers.forEach((t) => window.clearTimeout(t));
  };
};
