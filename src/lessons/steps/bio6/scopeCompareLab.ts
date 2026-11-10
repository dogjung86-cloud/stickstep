// [중1 Ⅱ v5] u2l3 scopeCompareLab: 「두 세포는 무엇이 다를까?」
// 탐구(입안 상피세포와 검정말잎 세포 관찰)의 관찰과 비교 부분을 손으로 해 본다.
// 한 통찰: 염색하면 핵이 또렷해진다. 식물세포에서는 세포벽과 엽록체가 더 보인다.
// 무대: 현미경 시야(원형 창) 하나 + 오른쪽 기록(표본, 떨어뜨린 용액, 찾은 구조). 찾은 구조는 이끎선으로 그림에 이어진다.
// 조작: ① 초점 막대로 흐린 상을 또렷하게 맞춘다
//       ② 표본 카드 셋을 바꿔 올리며, 무대에서 핵을 찾아 누른다.
//          물만 떨어뜨린 검정말잎에서는 핵이 안 보인다. 그때는 "핵이 안 보여요"를 누르는 것이 옳은 관찰이다.
//          아세트올세인 표본은 처음 올릴 때 "5분 기다리는 중"이 지나며 핵이 붉게 드러난다.
// 판정: 세 표본을 다 본 뒤 "두 세포 견주어 보기" → 두 시야를 나란히 놓고 두 번 묻는다(첫 질문만 채점).
// 그림: 입안 세포는 cheek.webp, 검정말잎은 같은 자리의 두 장(elodea-ao-plain: 물만, elodea-ao: 염색 뒤).
//       핵의 자리(%)는 그림에서 잰 값이다(qa/make-bio6-assets.py 주석 참고). 그림을 바꾸면 함께 다시 잰다.
// 현미경 조작 이름(조동 나사 따위)은 쓰지 않는다. 책 본문에 없는 말이다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { BV, BV_ICON, bvCanvas, bvField, bvFieldShade, bvSrc } from "../../../ui/bio6Kit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvFrame, bvRange, bvTimers, type BvCard } from "./b6Lab";

interface ScpStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

type Sp = "cheek" | "water" | "stain";
type Pt = [number, number];
const SPS: Sp[] = ["cheek", "water", "stain"];
const NAME: Record<Sp, string> = { cheek: "입안 상피세포", water: "검정말잎 세포", stain: "검정말잎 세포" };
const SOL: Record<Sp, string> = { cheek: "메틸렌 블루 용액", water: "물", stain: "아세트올세인 용액" };
const IMG: Record<Sp, string> = { cheek: "bio6/micro/cheek.webp", water: "bio6/micro/elodea-ao-plain.webp", stain: "bio6/micro/elodea-ao.webp" };

// 시야에 그림을 얼마나 키워 넣는가(가운데 기준). 검정말잎은 엽록체 알갱이가 보이게 조금 더 키운다.
const ZOOM: Record<Sp, number> = { cheek: 1, water: 1.45, stain: 1.45 };
/** 그림의 %를 시야의 %로(가운데 기준 확대). */
const view = (p: Pt, z: number): Pt => [(p[0] - 50) * z + 50, (p[1] - 50) * z + 50];
const inField = (p: Pt): boolean => Math.hypot(p[0] - 50, p[1] - 50) < 45;

// 핵의 자리(그림의 %). 그림에서 색으로 찾아 잰 값이다.
const NUC_CHEEK: Pt[] = [[34.1, 17.9], [65.8, 19.1], [21.2, 44.4], [44.0, 43.6], [83.9, 48.5], [39.6, 71.2], [65.2, 75.5], [13.8, 79.0]];
const NUC_LEAF: Pt[] = [
  [46.3, 9.4], [21.2, 14.9], [77.7, 22.5], [47.4, 26.7], [16.4, 29.9], [75.8, 39.8], [49.9, 44.1], [23.5, 48.5],
  [82.7, 58.4], [10.9, 59.4], [53.4, 61.3], [39.2, 71.5], [83.9, 73.7], [14.1, 77.0], [70.1, 84.2], [43.9, 89.2],
];
// 시야 안에 보이는 핵만(시야의 %)
const NUCLEI: Record<Sp, Pt[]> = {
  cheek: NUC_CHEEK.map((p) => view(p, ZOOM.cheek)).filter(inField),
  water: [],
  stain: NUC_LEAF.map((p) => view(p, ZOOM.stain)).filter(inField),
};
// 검정말잎 그림에서 세포벽과 엽록체를 가리킬 자리(그림의 %를 시야의 %로)
const WALL: Pt = view([65.8, 53.0], ZOOM.stain);
const CHL: Pt = view([61.0, 60.0], ZOOM.stain);
const TOL = 8.5; // 핵을 눌렀다고 보는 거리(시야의 %)

// 무대 좌표(346×230 설계 판)
const FX = 10;
const FY = 17;
const FD = 196;
const CHIP_X = 222;
const CHIP_Y = { nuc: 144, wall: 172, chl: 200 } as const; // 칩의 가운데 높이
const FOCUS = 64; // 초점이 맞는 막대 값

export const scopeCompareLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ScpStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: 5, cls: "scp-stage", qCls: "scp-q" });

  // ── 무대: 한 시야 ────────────────────────────────────────────────
  const canvas = bvCanvas(f.stage);
  const field = bvField({ x: FX, y: FY, d: FD, cls: "scp-field sp-cheek" });
  const imgs = el("div", { class: "scp-imgs" });
  (["cheek", "water", "stain"] as Sp[]).forEach((sp) => {
    const im = el("div", { class: `scp-im ${sp}` });
    im.style.backgroundImage = `url('${bvSrc(IMG[sp])}')`;
    im.style.backgroundSize = `${ZOOM[sp] * 100}%`;
    imgs.appendChild(im);
  });
  field.append(imgs, bvFieldShade());

  const lead = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  lead.setAttribute("viewBox", "0 0 346 230");
  lead.setAttribute("class", "scp-lead");
  lead.setAttribute("aria-hidden", "true");

  const vName = el("div", { class: "scp-v name" });
  const vSol = el("div", { class: "scp-v sol" });
  const chip = (cls: string, color: string, text: string, top: number): HTMLElement => {
    const c = el("div", { class: `scp-chip ${cls}`, html: `<i style="background:${color}"></i>${text}` });
    c.style.top = `${top - 12}px`;
    return c;
  };
  const chips = {
    nuc: chip("nuc", BV.nuc, "핵", CHIP_Y.nuc),
    wall: chip("wall", BV.wall, "세포벽", CHIP_Y.wall),
    chl: chip("chl", BV.chl, "엽록체", CHIP_Y.chl),
  };
  const side = el(
    "div",
    { class: "scp-side" },
    el("div", { class: "scp-k", text: "표본" }),
    vName,
    el("div", { class: "scp-k k2", text: "떨어뜨린 용액" }),
    vSol,
    el("div", { class: "scp-k k3", text: "찾은 구조" }),
  );
  const wait = el("div", { class: "bv-wait scp-wait", html: `<span>5분 기다리는 중</span><i><b></b></i>` });
  const solo = el("div", { class: "scp-solo" }, field, lead as unknown as HTMLElement, side, chips.nuc, chips.wall, chips.chl, wait);

  // ── 무대: 두 시야를 나란히(견주어 보기) ──────────────────────────
  const duoImg = [el("div", { class: "scp-dimg" }), el("div", { class: "scp-dimg" })];
  const duoCap = [el("div", { class: "scp-dcap" }), el("div", { class: "scp-dcap" })];
  const duoField = [bvField({ x: 14, y: 12, d: 150, cls: "scp-dfield" }), bvField({ x: 182, y: 12, d: 150, cls: "scp-dfield" })];
  duoField.forEach((fd, i) => fd.append(duoImg[i], bvFieldShade()));
  duoCap[0].style.left = "14px";
  duoCap[1].style.left = "182px";
  const duo = el("div", { class: "scp-duo" }, duoField[0], duoField[1], duoCap[0], duoCap[1]);
  canvas.el.append(solo, duo);

  function setDuo(a: Sp, b: Sp): void {
    [a, b].forEach((sp, i) => {
      duoImg[i].style.backgroundImage = `url('${bvSrc(IMG[sp])}')`;
      duoImg[i].style.backgroundSize = `${ZOOM[sp] * 100}%`;
      duoCap[i].innerHTML = `<b>${NAME[sp]}</b><span>${SOL[sp]}</span>`;
    });
    f.stage.classList.add("duo");
    host.dataset.scpDuo = `${a},${b}`;
  }

  // ── 상태 ─────────────────────────────────────────────────────────
  let phase: "focus" | "hunt" | "ask" | "done" = "focus";
  let cur: Sp = "cheek";
  let waiting = false;
  let stainSeen = false; // 아세트올세인 표본의 5분을 이미 봤는가
  const solved: Record<Sp, boolean> = { cheek: false, water: false, stain: false };
  const foundAt: Partial<Record<Sp, Pt>> = {};
  const allSolved = (): boolean => SPS.every((sp) => solved[sp]);
  const mark = (): void => {
    host.dataset.scpPhase = phase;
    host.dataset.scpCur = cur;
    host.dataset.scpSolved = SPS.filter((sp) => solved[sp]).join(",");
    host.dataset.scpWait = waiting ? "1" : "0";
    // e2e용: 지금 표본에서 시야 가운데에 가장 가까운 핵의 자리(시야의 %)
    const mid = [...NUCLEI[cur]].sort((a, b) => Math.hypot(a[0] - 50, a[1] - 50) - Math.hypot(b[0] - 50, b[1] - 50))[0];
    host.dataset.scpNuc = mid ? mid.map((v) => v.toFixed(1)).join(",") : "";
  };

  const px = (p: Pt): Pt => [FX + (p[0] * FD) / 100, FY + (p[1] * FD) / 100];

  /** 찾은 구조의 표식과 이끎선(칩의 왼쪽 끝 → 그림 속 자리). */
  function drawMarks(): void {
    let h = "";
    const link = (cy: number, p: Pt, ring: boolean): void => {
      const [x, y] = px(p);
      const r = ring ? 12 : 7;
      const dx = CHIP_X - 2 - x;
      const dy = cy - y;
      const L = Math.hypot(dx, dy) || 1;
      h += `<path d="M${CHIP_X - 2} ${cy}L${(x + (dx / L) * r).toFixed(1)} ${(y + (dy / L) * r).toFixed(1)}" stroke="#0B1524" stroke-width="3.4" opacity=".45"/>`;
      h += `<path d="M${CHIP_X - 2} ${cy}L${(x + (dx / L) * r).toFixed(1)} ${(y + (dy / L) * r).toFixed(1)}" stroke="#fff" stroke-width="1.4"/>`;
      h += ring
        ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="none" stroke="#0B1524" stroke-width="5" opacity=".45"/><circle class="scp-ring" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="none" stroke="#fff" stroke-width="2.4"/>`
        : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="none" stroke="#0B1524" stroke-width="4.4" opacity=".45"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="none" stroke="#fff" stroke-width="2"/>`;
    };
    const on = solved[cur] && phase !== "focus";
    const nucAt = foundAt[cur];
    const showNuc = on && cur !== "water" && !!nucAt;
    const showLeaf = on && cur !== "cheek";
    if (showNuc && nucAt) link(CHIP_Y.nuc, nucAt, true);
    if (showLeaf) {
      link(CHIP_Y.wall, WALL, false);
      link(CHIP_Y.chl, CHL, false);
    }
    lead.innerHTML = h;
    chips.nuc.classList.toggle("on", showNuc);
    chips.wall.classList.toggle("on", showLeaf);
    chips.chl.classList.toggle("on", showLeaf);
  }

  function paintSide(): void {
    vName.textContent = NAME[cur];
    vSol.textContent = SOL[cur];
    vSol.dataset.sol = cur;
  }

  // ── 조작부 ───────────────────────────────────────────────────────
  const range = bvRange({
    cls: "scp-range",
    min: 0,
    max: 100,
    value: 10,
    label: "초점 맞추기",
    onInput: (v) => setBlur(v),
    onChange: (v) => onFocusRelease(v),
  });
  const cards: Record<Sp, BvCard> = {
    cheek: bvCard("scp-card col", { name: "입안 세포", sub: "메틸렌 블루", icon: BV_ICON.cheek, key: "cheek" }),
    water: bvCard("scp-card col", { name: "검정말잎", sub: "물만", icon: BV_ICON.leafWater, key: "water" }),
    stain: bvCard("scp-card col", { name: "검정말잎", sub: "아세트올세인", icon: BV_ICON.leafStain, key: "stain" }),
  };
  const noBtn = bvBtn("scp-no", "핵이 안 보여요");
  const cmpBtn = bvBtn("main scp-cmp", "두 세포 견주어 보기");
  cmpBtn.hidden = true;

  function setBlur(v: number): void {
    const d = Math.abs(v - FOCUS);
    imgs.style.setProperty("--blur", `${(d <= 4 ? 0 : Math.min(9, d * 0.2)).toFixed(2)}px`);
  }

  function onFocusRelease(v: number): void {
    if (phase !== "focus") return;
    if (Math.abs(v - FOCUS) > 5) {
      f.say("아직 흐릿해요. 가장 <b>또렷하게</b> 보이는 곳에서 손을 떼요.");
      return;
    }
    haptic(HAPTIC.correct);
    imgs.style.setProperty("--blur", "0px");
    phase = "hunt";
    f.pips(1);
    cards.cheek.on(true);
    f.slot.setControls(bvCards(3, cards.cheek, cards.water, cards.stain), noBtn, cmpBtn);
    f.say("또렷해졌어요! 이제 현미경 화면에서 <b>핵</b>을 찾아 눌러 보세요.");
    api.setCTA("세 표본을 모두 관찰해 보세요", { enabled: false });
    mark();
  }

  const ASK_HUNT: Record<Sp, string> = {
    cheek: "입안 세포 표본이에요. 현미경 화면에서 <b>핵</b>을 찾아 눌러 보세요.",
    water: "검정말잎에 <b>물</b>만 떨어뜨리고 덮은 표본이에요. 여기서도 핵을 찾아봐요.",
    stain: "염색이 끝났어요. 현미경 화면에서 <b>핵</b>을 찾아 눌러 보세요.",
  };
  const SEEN: Record<Sp, string> = {
    cheek: "찾았어요. 메틸렌 블루에 푸르게 물든 점이 <b>핵</b>이에요.",
    water: "맞아요. 염색하지 않으면 핵이 잘 안 보여요. <b>세포벽</b>과 <b>엽록체</b>는 보여요.",
    stain: "찾았어요. 붉게 물든 점이 <b>핵</b>이에요. 세포벽과 엽록체도 그대로 보여요.",
  };

  /** 표본을 바꿔 올린다. */
  function show(sp: Sp): void {
    if (phase !== "hunt" || waiting || sp === cur) return;
    haptic(HAPTIC.tap);
    cur = sp;
    SPS.forEach((x) => {
      field.classList.toggle(`sp-${x}`, x === sp);
      cards[x].on(x === sp);
    });
    field.classList.remove("swap");
    void field.offsetWidth;
    field.classList.add("swap");
    paintSide();
    if (sp === "stain" && !stainSeen) {
      // 아세트올세인 용액은 잘 스며들지 않는다: 5분을 기다리는 동안 핵이 붉게 드러난다
      stainSeen = true;
      waiting = true;
      field.classList.add("staining");
      wait.classList.add("on");
      f.say("검정말잎에 <b>아세트올세인 용액</b>을 떨어뜨렸어요. 5분 동안 기다려요.");
      drawMarks();
      mark();
      tm.later(() => field.classList.add("stained"), 60);
      tm.later(() => {
        waiting = false;
        wait.classList.remove("on");
        field.classList.remove("staining");
        f.say(ASK_HUNT.stain);
        mark();
      }, 2100);
      return;
    }
    f.say(solved[sp] ? SEEN[sp] : ASK_HUNT[sp]);
    drawMarks();
    mark();
  }

  function solve(sp: Sp, at?: Pt): void {
    solved[sp] = true;
    if (at) foundAt[sp] = at;
    cards[sp].done();
    haptic(HAPTIC.correct);
    f.pips(1 + SPS.filter((x) => solved[x]).length);
    drawMarks();
    f.say(SEEN[sp]);
    // 아직 안 본 표본 카드를 살짝 알려 준다
    SPS.forEach((x) => cards[x].el.classList.toggle("todo", !solved[x]));
    if (allSolved()) {
      // 세 표본을 다 봤다: 견주어 볼 차례(버튼은 학생이 누른다)
      noBtn.hidden = true;
      cmpBtn.hidden = false;
      api.setCTA("두 세포를 견주어 보세요", { enabled: false });
    }
    mark();
  }

  function miss(p: Pt): void {
    const m = el("i", { class: "scp-miss" });
    m.style.left = `${p[0]}%`;
    m.style.top = `${p[1]}%`;
    field.appendChild(m);
    tm.later(() => m.remove(), 600);
    haptic(HAPTIC.wrong);
  }

  field.addEventListener("click", (e) => {
    if (phase !== "hunt" || waiting || solved[cur]) return;
    const r = field.getBoundingClientRect();
    const p: Pt = [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100];
    let best: Pt | null = null;
    let bd = TOL;
    for (const n of NUCLEI[cur]) {
      const d = Math.hypot(n[0] - p[0], n[1] - p[1]);
      if (d < bd) {
        bd = d;
        best = n;
      }
    }
    if (best) {
      solve(cur, best);
      return;
    }
    miss(p);
    f.say(cur === "water" ? "거기에는 핵이 보이지 않아요. 정말 안 보이면 아래 버튼을 눌러요." : "거기는 핵이 아니에요. 세포마다 하나씩 있는 <b>진한 점</b>을 찾아요.");
  });

  noBtn.addEventListener("click", () => {
    if (phase !== "hunt" || waiting) return;
    if (solved[cur]) {
      f.say(SEEN[cur]);
      return;
    }
    if (cur === "water") {
      solve("water");
      return;
    }
    haptic(HAPTIC.wrong);
    noBtn.classList.remove("no");
    void noBtn.offsetWidth;
    noBtn.classList.add("no");
    f.say("다시 잘 봐요. 세포마다 <b>진한 점</b>이 하나씩 있어요.");
  });

  SPS.forEach((sp) => cards[sp].el.addEventListener("click", () => show(sp)));

  // ── 견주어 보기(판정) ────────────────────────────────────────────
  cmpBtn.addEventListener("click", () => {
    if (phase !== "hunt") return;
    haptic(HAPTIC.tap);
    phase = "ask";
    mark();
    setDuo("cheek", "stain");
    f.say("왼쪽은 입안 상피세포, 오른쪽은 검정말잎 세포예요. 나란히 놓고 견주어 봐요.");
    f.slot.ask(
      "검정말잎 세포에서만 볼 수 있는 것은?",
      [{ t: "세포벽과 엽록체", ok: true }, { t: "핵과 세포막" }, { t: "핵과 엽록체" }],
      (ok) => api.recordQuiz(ok),
      { why: "<b>핵</b>은 염색하면 두 세포 모두에서 보여요.", onNext: ask2 },
    );
  });

  function ask2(): void {
    setDuo("water", "stain");
    f.say("이번에는 둘 다 검정말잎이에요. 왼쪽은 물만, 오른쪽은 염색액을 떨어뜨렸어요.");
    f.slot.ask("염색액을 떨어뜨린 표본에서만 보이는 것은?", [{ t: "핵", ok: true }, { t: "세포벽" }, { t: "엽록체" }], () => undefined, {
      why: "염색액이 <b>핵</b>을 물들여 또렷하게 해 줘요.",
      onNext: finish,
    });
  }

  function finish(): void {
    phase = "done";
    setDuo("cheek", "stain");
    f.pips(5);
    f.say("두 세포의 관찰을 마쳤어요. 아래에서 알게 된 것을 읽어 봐요.");
    f.slot.conclude("염색하면 <b>핵</b>이 또렷하게 보여요. 식물세포에서는 <b>세포벽</b>과 <b>엽록체</b>도 볼 수 있어요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
    mark();
  }

  // ── 시작 ─────────────────────────────────────────────────────────
  setBlur(10);
  paintSide();
  drawMarks();
  mark();
  f.slot.setControls(range.el);
  f.say("방금 만든 표본을 현미경에 올렸어요. 막대를 움직여 <b>초점</b>을 맞춰 보세요.");
  api.setCTA("초점을 맞춰 보세요", { enabled: false });
  return () => {
    tm.clear();
    canvas.off();
  };
};
