// [중1 Ⅱ v5] u2l3 slideBuildLab: 「입안 세포 표본, 어떻게 만들까?」
// 탐구 1(입안 상피세포 표본 만들기)을 손으로 해 본다. 순서는 학생이 정한다.
//   ① 면봉으로 볼 안쪽을 문질러 받침 유리에 묻힌다  ② 메틸렌 블루 용액 한 방울, 1분 기다린다
//   ③ 덮개 유리를 비스듬히 기울여 천천히 덮는다      ④ 거름종이로 감싸 가볍게 눌러 넘친 용액을 닦는다
// 한 통찰: 표본을 만드는 순서에는 저마다 까닭이 있다(염색해야 핵이 보이고, 천천히 덮어야 공기 방울이 안 생긴다).
// 무대: 왼쪽은 실험대 위 받침 유리를 옆에서 본 모습, 오른쪽은 "현미경으로 보면" 창(지금 표본이 어떻게 보일지).
//       도구를 쓸 때마다 두 곳이 함께 바뀐다(원인 → 결과가 바로 보인다).
// 조작: 조작 칸의 도구 카드 넷(차례가 드러나지 않게 섞어 놓는다). 차례가 틀리면 그 결과를 잠깐 보여 주고 되돌린다.
//       덮개 유리는 막대를 밀어 직접 내린다. 빨리 내리면 공기 방울(기포)이 갇히고, 다시 들어야 한다.
// 판정(채점 1회): 다 만든 뒤 "한 번에 빨리 덮으면?" 을 묻고, 답한 뒤 무대가 그 결과를 보여 준다.
// 움직임은 CSS 키프레임과 타이머만 쓴다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { BV_ICON, bvCanvas, bvField, bvFieldShade, bvSrc } from "../../../ui/bio6Kit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvFrame, bvRange, bvTimers, bvTween, type BvCard } from "./b6Lab";

interface SbdStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

type Tool = "swab" | "stain" | "cover" | "paper";
const ORDER: Tool[] = ["swab", "stain", "cover", "paper"];

// 무대 좌표(346×230 설계 판)
const SLIDE_Y = 168; // 받침 유리 윗면
const HX = 62; // 덮개 유리의 받침점(왼쪽 끝)
const HY = 165; // 덮였을 때 덮개 유리 아랫면(용액 막 두께 3)
const COVER_W = 96; // 덮개 유리 길이
const DROP_X = 110; // 용액 방울의 가운데
const DROP_H = 21; // 방울 높이
const DROP_HW = 32; // 방울 반폭(덮이면 18만큼 더 퍼진다)
const TILT = 40; // 덮개 유리를 처음 세운 각도
const TOUCH = (Math.atan(DROP_H / (DROP_X - HX)) * 180) / Math.PI; // 덮개 유리가 방울에 닿기 시작하는 각도
const FAST_MS = 700; // 덮개 유리 뒤쪽 60%를 이보다 빨리 내리면 공기 방울이 갇힌다

/** 용액의 옆모습. ang이 null이면 덮개 유리가 없는 둥근 방울, 숫자면 그 각도의 덮개 유리에 눌린 모양. */
function liquidPath(ang: number | null): string {
  const h = DROP_H;
  const press = ang === null ? 0 : Math.max(0, Math.min(1, (TOUCH - ang) / TOUCH)); // 덮개가 방울을 누르는 정도
  const hw = DROP_HW + 18 * press;
  const tan = ang === null ? 0 : Math.tan((ang * Math.PI) / 180);
  const N = 20;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const x = DROP_X - hw + (2 * hw * i) / N;
    const u = (x - DROP_X) / hw;
    let y = SLIDE_Y - h * Math.sqrt(Math.max(0, 1 - u * u));
    if (ang !== null && x > HX) y = Math.max(y, HY - (x - HX) * tan); // 덮개 아랫면보다 위로는 못 올라간다
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d}L${(DROP_X + hw).toFixed(1)} ${SLIDE_Y}L${(DROP_X - hw).toFixed(1)} ${SLIDE_Y}Z`;
}

const SCENE = `
  <svg class="sbd-svg" viewBox="0 0 346 230" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="sbdBench" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F4266"/><stop offset="1" stop-color="#17243D"/></linearGradient>
      <linearGradient id="sbdGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF9FF" stop-opacity=".96"/><stop offset="1" stop-color="#96C6E6" stop-opacity=".78"/></linearGradient>
      <linearGradient id="sbdStain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#74ACFF"/><stop offset="1" stop-color="#2B62D9"/></linearGradient>
      <linearGradient id="sbdTube" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F6FCFF" stop-opacity=".96"/><stop offset="1" stop-color="#B5D8EE" stop-opacity=".86"/></linearGradient>
    </defs>
    <!-- 실험대 -->
    <path d="M0 184h346v46H0z" fill="url(#sbdBench)"/>
    <path d="M0 184h346" stroke="#4A618B" stroke-width="1.5"/>
    <ellipse cx="104" cy="186.5" rx="112" ry="4.5" fill="#050B16" opacity=".55"/>
    <!-- 받침 유리 -->
    <path d="M-8 ${SLIDE_Y}H211a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3H-8z" fill="url(#sbdGlass)" stroke="#F4FBFF" stroke-opacity=".8"/>
    <path d="M0 171.2h208" stroke="#fff" stroke-width="1.6" opacity=".85"/>
    <text x="14" y="207" font-size="12.5" font-weight="700" fill="#AFC2DD">받침 유리</text>
    <!-- 묻힌 세포(옆에서 보면 아주 얇은 자국) -->
    <g class="sbd-smear" fill="#FCEEDD">
      ${[88, 94, 100, 106, 112, 118, 124, 130].map((x, i) => `<ellipse cx="${x}" cy="${SLIDE_Y - 1.1 - (i % 2) * 0.6}" rx="3" ry="1.3"/>`).join("")}
    </g>
    <!-- 염색액 -->
    <path class="sbd-liq" d="" fill="url(#sbdStain)"/>
    <g class="sbd-excess" fill="url(#sbdStain)">
      <path d="M${HX - 13} ${SLIDE_Y}C${HX - 13} ${SLIDE_Y - 9} ${HX} ${SLIDE_Y - 9} ${HX} ${SLIDE_Y}Z"/>
      <path d="M${HX + COVER_W} ${SLIDE_Y}C${HX + COVER_W} ${SLIDE_Y - 9} ${HX + COVER_W + 13} ${SLIDE_Y - 9} ${HX + COVER_W + 13} ${SLIDE_Y}Z"/>
    </g>
    <g class="sbd-bubs" fill="#fff" stroke="#BFE3FF" stroke-width=".7">
      <ellipse cx="86" cy="166.5" rx="5" ry="1.7"/><ellipse cx="112" cy="166.5" rx="6.5" ry="1.8"/><ellipse cx="138" cy="166.5" rx="4" ry="1.6"/>
    </g>
    <!-- 덮개 유리(왼쪽 끝을 받침점으로 돈다) -->
    <g class="sbd-cover">
      <rect x="${HX}" y="${HY - 5}" width="${COVER_W}" height="5" rx="1.4" fill="#DDF5FF" fill-opacity=".92" stroke="#fff" stroke-width=".9"/>
      <path d="M${HX + 3} ${HY - 3.6}h${COVER_W - 6}" stroke="#fff" stroke-width="1" opacity=".95"/>
    </g>
    <text class="sbd-covertag" x="146" y="98" font-size="12.5" font-weight="700" fill="#AFC2DD">덮개 유리</text>
    <!-- 도구: 면봉 -->
    <g class="sbd-swab">
      <path d="M0 0L-42 -122" stroke="#E6D7BA" stroke-width="5.4" stroke-linecap="round"/>
      <ellipse cx="-2.2" cy="-6.5" rx="8" ry="12" transform="rotate(-19 -2.2 -6.5)" fill="#fff" stroke="#C6D0DE" stroke-width="1.3"/>
    </g>
    <!-- 도구: 스포이트 -->
    <g class="sbd-dropper">
      <path d="M-2.6 0L-7.4 -20V-64h14.8V-20L2.6 0Z" fill="url(#sbdTube)" stroke="#fff" stroke-width="1"/>
      <path d="M-1.9 -2L-5.6 -19.5V-40h11.2V-19.5L1.9 -2Z" fill="url(#sbdStain)"/>
      <path d="M-10.5 -64h21v-6.5h-21z" fill="#5A6C8C"/>
      <path d="M-10 -70.5c0 -21 20 -21 20 0z" fill="#3D4D6B" stroke="#2A3750" stroke-width="1"/>
    </g>
    <circle class="sbd-droplet" r="4.6" fill="#3B7DD8"/>
    <!-- 도구: 거름종이와 누르는 손가락 -->
    <g class="sbd-paper">
      <path d="M40 ${SLIDE_Y + 1}C40 153 52 149.5 64 149.5H156C168 149.5 180 153 180 ${SLIDE_Y + 1}" fill="none" stroke="#FAF7F0" stroke-width="8" stroke-linecap="round"/>
      <circle class="sbd-blot" cx="46" cy="161" r="6" fill="#4C8BEA"/>
      <circle class="sbd-blot" cx="174" cy="161" r="6" fill="#4C8BEA"/>
    </g>
    <g class="sbd-finger">
      <path d="M-14 -72V-10a14 14 0 0 0 28 0V-72Z" fill="#F6CFAE" stroke="#C99672" stroke-width="1.5"/>
      <path d="M-8.4 -17a8.4 9 0 0 1 16.8 0v4a8.4 6.4 0 0 1 -16.8 0Z" fill="#FCE9D9"/>
    </g>
  </svg>`;

const BUBBLES = `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  ${[[31, 36, 14], [66, 58, 18], [38, 76, 8.5]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#F6FBFF" stroke="#0E1622" stroke-width="${(r * 0.36).toFixed(1)}"/><circle cx="${x - r * 0.28}" cy="${y - r * 0.3}" r="${(r * 0.2).toFixed(1)}" fill="#fff"/>`)
    .join("")}
</svg>`;

export const slideBuildLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SbdStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: 5, cls: "sbd-stage", qCls: "sbd-q", api });

  // ── 무대 ─────────────────────────────────────────────────────────
  const canvas = bvCanvas(f.stage);
  canvas.el.innerHTML = SCENE;
  const svg = canvas.el.querySelector("svg") as SVGSVGElement;
  const liq = svg.querySelector(".sbd-liq") as SVGPathElement;
  const cover = svg.querySelector(".sbd-cover") as SVGGElement;

  const field = bvField({ x: 234, y: 40, d: 100, cls: "sbd-field" });
  // 염색 전(핵이 거의 안 보이는 투명한 세포)과 염색 뒤(핵이 푸른 세포) 두 장을 겹쳐 두고 바꿔 보인다
  const plain = el("div", { class: "sbd-f-plain" });
  plain.style.backgroundImage = `url('${bvSrc("bio6/micro/cheek-plain.webp")}')`;
  const cells = el("div", { class: "sbd-f-cells" });
  cells.style.backgroundImage = `url('${bvSrc("bio6/micro/cheek.webp")}')`;
  field.append(el("div", { class: "sbd-f-bg" }), plain, cells, el("div", { class: "sbd-f-tint" }), el("div", { class: "sbd-f-bub", html: BUBBLES }), bvFieldShade());
  const viewSay = el("div", { class: "sbd-say", text: "아직 아무것도 없어요" });
  const wait = el("div", { class: "bv-wait", html: `<span>1분 기다리는 중</span><i><b></b></i>` });
  const ifPill = el("div", { class: "bv-wait sbd-if", text: "한 번에 빨리 덮으면" });
  canvas.el.append(el("div", { class: "sbd-cap", text: "현미경으로 보면" }), field, viewSay, wait, ifPill);

  type View = "none" | "tint" | "faint" | "blue";
  function setView(v: View, bubbles = false, say?: string): void {
    field.classList.toggle("v-tint", v === "tint");
    field.classList.toggle("v-faint", v === "faint");
    field.classList.toggle("v-blue", v === "blue");
    field.classList.toggle("v-bub", bubbles);
    viewSay.textContent = say ?? (bubbles ? "공기 방울이 가려요" : v === "none" ? "아직 아무것도 없어요" : v === "tint" ? "세포가 없어요" : v === "faint" ? "투명해서 흐릿해요" : "핵이 푸르게 보여요");
  }
  function setAngle(ang: number, withDrop: boolean): void {
    cover.style.setProperty("--ang", ang.toFixed(2));
    liq.setAttribute("d", withDrop ? liquidPath(ang) : "");
  }
  /** 무대 클래스를 잠깐 붙였다 뗀다(도구가 들어왔다 나가는 움직임). */
  function play(cls: string, ms: number): void {
    svg.classList.add(cls);
    tm.later(() => svg.classList.remove(cls), ms);
  }

  // ── 상태 ─────────────────────────────────────────────────────────
  let done = 0; // 끝낸 단계 수(0~4)
  let busy = false;
  let coverLocked = false;
  let t40 = 0;
  let asked = false;
  const mark = (): void => {
    host.dataset.sbdStage = String(done);
    host.dataset.sbdBusy = busy ? "1" : "0";
  };
  const lock = (v: boolean): void => {
    busy = v;
    mark();
  };

  // ── 조작부 ───────────────────────────────────────────────────────
  const cards: Record<Tool, BvCard> = {
    swab: bvCard("sbd-card", { name: "면봉", sub: "볼 안쪽 문지르기", icon: BV_ICON.swab, key: "swab" }),
    stain: bvCard("sbd-card", { name: "메틸렌 블루", sub: "염색액 한 방울", icon: BV_ICON.dropper, key: "stain" }),
    cover: bvCard("sbd-card", { name: "덮개 유리", sub: "표본 덮기", icon: BV_ICON.cover, key: "cover" }),
    paper: bvCard("sbd-card", { name: "거름종이", sub: "넘친 용액 닦기", icon: BV_ICON.paper, key: "paper" }),
  };
  // 놓인 차례가 답이 되지 않게 섞어 둔다(늘 같은 자리라 다시 해도 헷갈리지 않는다)
  const tools = bvCards(2, cards.cover, cards.swab, cards.paper, cards.stain);
  const range = bvRange({
    cls: "sbd-range",
    min: 0,
    max: 100,
    value: 0,
    label: "덮개 유리 내리기",
    ticks: ["비스듬히 세움", "다 덮음"],
    onInput: (v) => onLower(v),
  });
  const retry = bvBtn("sbd-retry", "덮개 유리 다시 들기");
  retry.hidden = true;

  function nope(t: Tool, html: string): void {
    haptic(HAPTIC.wrong);
    const c = cards[t].el;
    c.classList.remove("no");
    void c.offsetWidth;
    c.classList.add("no");
    f.say(html);
  }
  function stepDone(t: Tool): void {
    done += 1;
    cards[t].done();
    f.pips(done);
    lock(false);
  }

  // ── 단계별 실행 ──────────────────────────────────────────────────
  function doSwab(): void {
    lock(true);
    play("do-swab", 1750);
    f.say("면봉으로 볼 안쪽을 문지른 다음, 받침 유리 위에 문질러요.");
    tm.later(() => {
      svg.classList.add("has-smear");
      setView("faint");
    }, 800);
    tm.later(() => {
      stepDone("swab");
      f.say("볼 안쪽 세포를 받침 유리에 묻혔어요. 아직은 <b>투명</b>해서 흐릿해요.");
    }, 1750);
  }

  /** 스포이트로 한 방울. onLanded는 방울이 받침 유리에 닿은 순간. */
  function dropStain(onLanded: () => void): void {
    play("do-drop", 1550);
    tm.later(() => {
      liq.setAttribute("d", liquidPath(null));
      svg.classList.add("has-drop");
      onLanded();
    }, 850);
  }

  function doStain(): void {
    lock(true);
    f.say("메틸렌 블루 용액을 한 방울 떨어뜨렸어요. <b>1분</b> 동안 기다려요.");
    dropStain(() => {
      wait.classList.add("on");
      setView("blue", false, "물드는 중이에요");
    });
    tm.later(() => {
      wait.classList.remove("on");
      setView("blue");
      stepDone("stain");
      f.say("1분이 지나자 <b>핵</b>이 푸르게 물들었어요. 다음에는 무엇을 쓸까요?");
    }, 850 + 1900);
  }

  function startCover(): void {
    lock(true);
    coverLocked = false;
    t40 = 0;
    range.set(0);
    range.input.disabled = false;
    retry.hidden = true;
    setAngle(TILT, true);
    svg.classList.add("has-cover");
    f.slot.setControls(range.el, retry);
    f.say("덮개 유리의 한쪽 끝을 대고 비스듬히 세웠어요. 막대를 밀어 <b>덮어</b> 보세요.");
    mark();
  }

  function onLower(v: number): void {
    if (coverLocked) return;
    setAngle(TILT * (1 - v / 100), true);
    const now = performance.now();
    if (v < 40) t40 = 0;
    else if (!t40) t40 = now;
    if (v < 97) return;
    coverLocked = true;
    range.set(100);
    range.input.disabled = true;
    setAngle(0, true);
    svg.classList.add("covered");
    if (now - t40 < FAST_MS) {
      // 빨리 덮었다: 공기가 빠져나가지 못한다
      haptic(HAPTIC.wrong);
      svg.classList.add("bubbled");
      setView("blue", true);
      f.say("너무 빨리 덮어서 <b>공기 방울(기포)</b>이 갇혔어요. 다시 들어서 덮어 봐요.");
      retry.hidden = false;
      host.dataset.sbdBubble = "1";
    } else {
      haptic(HAPTIC.correct);
      host.dataset.sbdBubble = "0";
      f.say("천천히 덮으니 공기가 빠져나가 <b>공기 방울</b>이 생기지 않았어요.");
      tm.later(() => {
        f.slot.setControls(tools);
        stepDone("cover");
        f.say("덮개 유리를 잘 덮었어요. 그런데 유리 밖으로 <b>넘친 용액</b>이 보여요.");
      }, 1300);
    }
  }

  retry.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    retry.hidden = true;
    svg.classList.remove("covered", "bubbled");
    setView("blue");
    coverLocked = false;
    t40 = 0;
    range.set(0);
    range.input.disabled = false;
    setAngle(TILT, true);
    f.say("이번에는 막대를 <b>천천히</b> 밀어서 덮어 보세요.");
  });

  function doPaper(): void {
    lock(true);
    play("do-paper", 2350);
    f.say("거름종이로 감싸고 손가락으로 가볍게 눌러요.");
    tm.later(() => {
      svg.classList.add("wiped");
      liq.setAttribute("d", `M${HX + 1} ${HY}H${HX + COVER_W - 1}V${SLIDE_Y}H${HX + 1}Z`);
    }, 1150);
    tm.later(() => {
      stepDone("paper");
      setView("blue", false, "깨끗한 표본 완성!");
      f.say("넘친 용액이 거름종이에 스며들었어요. 입안 세포 <b>표본</b>이 완성됐어요.");
      api.setCTA("마지막 질문에 답해 보세요", { enabled: false });
      tm.later(askFinal, 1500);
    }, 2350);
  }

  /** 차례가 아닌 덮개 유리: 한 번에 덮어 결과를 보여 주고 다시 걷는다. */
  function coverTooEarly(html: string, say: string): void {
    lock(true);
    haptic(HAPTIC.wrong);
    svg.classList.add("has-cover");
    setAngle(TILT, false);
    bvTween(tm, 420, (t) => setAngle(TILT * (1 - t), false));
    f.say(html);
    const before = viewSay.textContent ?? "";
    tm.later(() => (viewSay.textContent = say), 420);
    tm.later(() => bvTween(tm, 360, (t) => setAngle(TILT * t, false)), 2100);
    tm.later(() => {
      svg.classList.remove("has-cover");
      viewSay.textContent = before;
      lock(false);
    }, 2500);
  }

  function use(t: Tool): void {
    if (busy || done >= 4) return;
    const want = ORDER[done];
    if (t === want) {
      haptic(HAPTIC.tap);
      if (t === "swab") doSwab();
      else if (t === "stain") doStain();
      else if (t === "cover") startCover();
      else doPaper();
      return;
    }
    // 차례가 아닌 도구: 까닭을 알려 주고(볼 수 있는 것은 직접 보여 주고) 되돌린다
    if (cards[t].isDone()) {
      nope(t, t === "stain" ? "염색액은 한 방울이면 충분해요. 다른 도구를 골라요." : t === "cover" ? "덮개 유리는 이미 덮었어요. 다른 도구를 골라요." : "세포는 이미 묻혔어요. 다른 도구를 골라요.");
      return;
    }
    if (t === "paper") {
      nope(t, done === 2 ? "거름종이는 덮개 유리를 덮은 뒤에, <b>넘친 용액</b>을 닦을 때 써요." : "아직 닦아 낼 용액이 없어요. 다른 도구를 먼저 써요.");
      return;
    }
    if (t === "stain") {
      // 세포를 묻히기 전에 염색액부터
      lock(true);
      haptic(HAPTIC.wrong);
      f.say("염색액부터 떨어뜨렸어요. 그런데 물들일 <b>세포</b>가 아직 없어요.");
      dropStain(() => setView("tint"));
      tm.later(() => {
        svg.classList.remove("has-drop");
        setView("none");
        lock(false);
      }, 3000);
      return;
    }
    // t === "cover"
    if (done === 0) coverTooEarly("덮개 유리부터 덮었어요. 그런데 그 아래에 볼 <b>세포</b>가 없어요.", "세포가 없어요");
    else coverTooEarly("염색하지 않고 덮었어요. 세포가 투명해서 <b>핵</b>이 잘 보이지 않아요.", "핵이 잘 안 보여요");
  }

  ORDER.forEach((t) => cards[t].el.addEventListener("click", () => use(t)));

  // ── 마지막 판정 ──────────────────────────────────────────────────
  function askFinal(): void {
    if (asked) return;
    asked = true;
    f.say("하나만 더 생각해 봐요. 답을 고르면 위 그림에서 결과를 보여 줘요.");
    f.slot.ask(
      "덮개 유리를 한 번에 빨리 덮으면 어떻게 될까요?",
      [{ t: "공기 방울(기포)이 갇힌다", ok: true }, { t: "염색이 더 진해진다" }, { t: "세포가 더 크게 보인다" }],
      (ok) => {
        api.recordQuiz(ok);
        // 답한 뒤에 결과를 보여 준다: 빨리 덮은 표본
        ifPill.classList.add("on");
        svg.classList.add("bubbled");
        setView("blue", true);
        f.say("한 번에 덮으면 공기가 빠져나가지 못해 <b>공기 방울(기포)</b>이 갇혀요.");
      },
      { why: "공기가 빠져나갈 틈이 없어 <b>공기 방울</b>이 갇혀요.", onNext: finish, nextDelay: 2600 },
    );
  }

  function finish(): void {
    ifPill.classList.remove("on");
    svg.classList.remove("bubbled");
    setView("blue", false, "깨끗한 표본 완성!");
    f.pips(5);
    f.say("그래서 덮개 유리는 비스듬히 기울여 <b>천천히</b> 덮어요.");
    f.slot.conclude("표본은 세포를 <b>묻히고</b>, <b>물들이고</b>, 덮개 유리를 <b>비스듬히 천천히</b> 덮은 뒤, 넘친 용액을 닦아서 만들어요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  setAngle(TILT, false);
  setView("none");
  mark();
  f.slot.setControls(tools);
  f.say("입안 세포 표본을 만들어요. 아래 도구 가운데 <b>가장 먼저</b> 쓸 것을 골라요.");
  api.setCTA("표본을 완성해 보세요", { enabled: false });
  return () => {
    tm.clear();
    canvas.off();
  };
};
