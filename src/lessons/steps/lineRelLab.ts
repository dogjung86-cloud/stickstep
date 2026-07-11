// lineRelLab, 만날까 안 만날까 랩(Ⅳ L6, 교과서 153쪽: 평면에서 두 직선의 위치 관계).
// 고정 직선 l 위에서 직선 m을 이동 손잡이(상하 평행이동)·회전 손잡이(기울이기, ±25°)로
// 움직이며 관계 배지(한 점에서 만나요/평행해요/일치해요)를 실시간 판정한다. 미션은 차례대로:
// ① 한 점에서 만나기(보드 안 교점 플래시) ② 평행 스냅(각도 차 1.2° 이내면 자석처럼 착, l∥m)
// ③ 살짝(0.8~4°) 기울여 놓고 줌아웃, 저 멀리의 교점을 발견한다(평행이 아니면 반드시 만난다).
// 일치는 미션이 아니라 보너스 토스트. 판정 규칙: 각도 차<0.6° 이고 중심 거리<5px면 일치,
// 각도 차<0.6° 이고 거리 5px 이상이면 평행, 그 외 만남(교점 밖이면 가장자리 화살).
// 줌아웃은 mlr-world 그룹의 CSS transform(scale) 트랜지션(중심 유지). 직선은 무한이므로
// 국소 좌표 ±9500까지 그려 두고 vector-effect로 줌아웃에서도 선 굵기를 유지한다.
// 드래그 중 즉시 갱신, 확정 판정은 pointerup. 포인터 캡처는 geoKit.capturePointer만.
// 채점 아님(발견 랩): 3목표 달성 시 recordQuiz(true) + enableCTA. rAF 금지(CSS + setTimeout).

import { el, clear, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import { GEO, rad, angleOf, arcPath, arrowHead, lineSvg, polar, capturePointer } from "../../ui/geoKit";
import type { StepRenderer } from "../types";

interface LineRelStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const HGT = 250;
const CX = 170; // 보드 중심 x = 직선 m의 중심점 x(고정)
const LYY = 125; // 직선 l의 y(수평 중앙)
const HR = 130; // 회전 손잡이 반지름
const AMAX = 25; // 기울기 최대(도)
const HALF = 9500; // 직선 절반 길이(줌아웃에서도 화면을 가로지르게)
const NEAR = 166; // 교점이 "보드 안"으로 보이는 한계(|ix-CX|)

export const lineRelLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LineRelStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "meet", label: "한 점에서", sub: "교점!" },
    { id: "para", label: "평행", sub: "l∥m" },
    { id: "zoom", label: "줌아웃 발견", sub: "결국 만난다" },
  ]);

  const board = mboard(400);
  const qCard = el("div", { class: "mdr-q mcl-q" });
  const stage = el("div", { class: "mlr-stage" });
  const actions = el("div", { class: "lk-actions" });
  const badge = el("div", { class: "mlr-badge", text: "" });
  const angEl = el("div", { class: "mlr-ang", text: "각도 차 0.0°" });
  board.append(qCard, stage, actions, badge, angEl);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ── 상태 ── */
  let phase: "play" | "ask" | "zoomed" | "return" | "done" = "play";
  let mission: 1 | 2 | 3 | 4 = 1;
  let my = 75; // m의 중심점 y(평행이동)
  let a = 0; // m의 기울기(수학 각도, 도)
  let prevRel: "meet" | "para" | "co" | "" = "";
  let askIx = 0; // 줌아웃 대상 교점 x(발견 국면에서 고정)
  let drag: "" | "move" | "rot" = "";

  /* ── 무대 SVG ── */
  const rotGlyph = (): string => {
    // 회전 손잡이 주위의 굽은 화살(위아래로 끌면 기울어요)
    const a0 = polar(HR, 0, 17, -42);
    const a1 = polar(HR, 0, 17, 42);
    return (
      `<path d="${arcPath(HR, 0, 17, -42, 42)}" stroke="#077E9C" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      arrowHead(a1.x, a1.y, 132, "#077E9C", 5) +
      arrowHead(a0.x, a0.y, 228, "#077E9C", 5)
    );
  };
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${HGT}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="mlr-world">` +
    // 직선 l(고정): 무한을 흉내 내는 긴 선 + 화면 안 양끝 화살촉
    `<line x1="${CX - HALF}" y1="${LYY}" x2="${CX + HALF}" y2="${LYY}" stroke="${GEO.ink}" stroke-width="2.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>` +
    arrowHead(326, LYY, 0) +
    arrowHead(14, LYY, 180) +
    `<text x="318" y="143" font-size="13.5" font-style="italic" font-weight="800" fill="${GEO.ink}">l</text>` +
    `<g class="mlr-pml">${arrowHead(101, LYY, 0, GEO.ok, 7)}</g>` +
    lineSvg(CX, 55, CX, 195, GEO.faint, 1.6, "4 5").replace("<line", `<line class="mlr-guide mlr-vg"`) +
    `<path class="mlr-guide mlr-rg" d="${arcPath(CX, my, HR, -AMAX, AMAX)}" stroke="${GEO.faint}" stroke-width="1.6" stroke-dasharray="4 5" fill="none"/>` +
    // 직선 m 조립체: translate(CX,my) rotate(-a)의 국소 좌표계
    `<g class="mlr-mg">` +
    `<line class="mlr-mline" x1="${-HALF}" y1="0" x2="${HALF}" y2="0" stroke="${GEO.hlA}" stroke-width="2.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>` +
    arrowHead(152, 0, 0, GEO.hlA) +
    arrowHead(-152, 0, 180, GEO.hlA) +
    `<text x="146" y="-12" font-size="13.5" font-style="italic" font-weight="800" fill="${GEO.hlA}">m</text>` +
    `<g class="mlr-pmm">${arrowHead(-69, 0, 0, GEO.ok, 7)}</g>` +
    `<g class="mlr-hand mlr-hmove">` +
    `<circle r="16" fill="${GEO.hlA}" opacity=".14"/>` +
    `<circle r="10" fill="url(#mlrGA)" stroke="#B26200" stroke-width="1.8"/>` +
    `<path d="M0 -23 L5 -15 L-5 -15 Z" fill="#B26200"/>` +
    `<path d="M0 23 L5 15 L-5 15 Z" fill="#B26200"/>` +
    `<circle r="24" fill="transparent"/>` +
    `</g>` +
    `<g class="mlr-hand mlr-hrot" transform="translate(${HR},0)">` +
    `<circle r="16" fill="${GEO.hlB}" opacity=".14"/>` +
    `<circle r="10" fill="url(#mlrGB)" stroke="#077E9C" stroke-width="1.8"/>` +
    `<circle r="24" fill="transparent"/>` +
    `</g>` +
    rotGlyph() +
    `</g>` +
    `</g>` +
    `<g class="mlr-live"></g>` +
    `<g class="mlr-fx"></g>` +
    `<defs>` +
    `<radialGradient id="mlrGA" cx=".36" cy=".3" r="1"><stop offset="0" stop-color="#FFC24D"/><stop offset="1" stop-color="#F08C00"/></radialGradient>` +
    `<radialGradient id="mlrGB" cx=".36" cy=".3" r="1"><stop offset="0" stop-color="#52CCE4"/><stop offset="1" stop-color="#0DA5C6"/></radialGradient>` +
    `</defs>` +
    `</svg>`;

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const world = svg.querySelector(".mlr-world") as SVGGElement;
  const mg = svg.querySelector(".mlr-mg") as SVGGElement;
  const vGuide = svg.querySelector(".mlr-vg") as SVGLineElement;
  const rGuide = svg.querySelector(".mlr-rg") as SVGPathElement;
  const gLive = svg.querySelector(".mlr-live") as SVGGElement;
  const gFx = svg.querySelector(".mlr-fx") as SVGGElement;

  /* ── 판정(실시간) ── */
  const relOf = (): "meet" | "para" | "co" => {
    const dAng = Math.abs(a);
    const dy = Math.abs(my - LYY);
    if (dAng < 0.6 && dy < 5) return "co";
    if (dAng < 0.6) return "para";
    return "meet";
  };
  /** 교점 x(만남일 때만 유효). m: (CX, my)를 지나고 기울기 a. */
  const ixOf = (): number => CX + (my - LYY) / Math.tan(rad(a));

  function paintM(): void {
    mg.style.transform = `translate(${CX}px, ${my}px) rotate(${-a}deg)`;
    rGuide.setAttribute("d", arcPath(CX, my, HR, -AMAX, AMAX));
  }

  function judge(): void {
    const rel = relOf();
    badge.textContent = rel === "meet" ? "한 점에서 만나요" : rel === "para" ? "평행해요" : "일치해요";
    badge.className = `mlr-badge${rel === "meet" ? "" : ` ${rel}`}`;
    angEl.textContent = `각도 차 ${Math.abs(a).toFixed(1)}°`;
    world.classList.toggle("para", rel === "para");
    mg.classList.toggle("co", rel === "co");
    // 교점 표시: 보드 안이면 점, 밖이면 교점 방향 가장자리 화살
    let live = "";
    if (rel === "meet") {
      const ix = ixOf();
      if (Math.abs(ix - CX) <= NEAR) {
        live = `<circle cx="${ix.toFixed(1)}" cy="${LYY}" r="5" fill="${GEO.hlC}" stroke="#fff" stroke-width="1.6"/>`;
      } else {
        const lft = ix < CX;
        const ex = lft ? 10 : 330;
        const dir = lft ? 180 : 0;
        live =
          `<g class="mlr-far">` +
          arrowHead(ex, LYY, dir, GEO.hlC, 8) +
          arrowHead(ex + (lft ? 10 : -10), LYY, dir, GEO.hlC, 8) +
          `</g>`;
      }
    }
    gLive.innerHTML = live;
    // 일치 보너스(미션 아님): 상태에 들어서는 순간 한 번만
    if (rel === "co" && prevRel !== "co") {
      haptic(HAPTIC.select);
      toast("완전히 겹쳤어요, 일치!");
      later(() => toast("일치는 한 직선으로 봐요!"), 2000);
    }
    prevRel = rel;
  }

  /* ── 미션 진행 ── */
  function setMission(n: 2 | 3): void {
    mission = n;
    if (n === 2) {
      qCard.innerHTML = `<span class="mcl-k">미션 2</span> 이번엔 평행하게 만들어 보세요`;
      helper.innerHTML =
        "이번엔 나란히! 회전 손잡이를 끌어 <b>각도 차 0°</b>에 가까이 가면 자석처럼 착 붙어요.";
    } else {
      qCard.innerHTML = `<span class="mcl-k">미션 3</span> 정말 안 만날까요? 아주 살짝만 기울여 봐요`;
      helper.innerHTML =
        "평행을 아주 살짝만 깨 볼게요. <b>1°쯤</b> 기울인 채로 손을 떼면, 두 직선은 만날까요?";
    }
  }

  function flashMeet(ix: number): void {
    gFx.innerHTML =
      `<circle class="mlr-dotpop" cx="${ix.toFixed(1)}" cy="${LYY}" r="6" fill="${GEO.hlC}" stroke="#fff" stroke-width="1.6"/>` +
      `<circle class="mlr-ring" cx="${ix.toFixed(1)}" cy="${LYY}" r="13" fill="none" stroke="${GEO.hlC}" stroke-width="3"/>`;
    later(() => (gFx.innerHTML = ""), 1500);
  }

  const mkBtn = (label: string, hero: boolean, fn: () => void): HTMLButtonElement => {
    const b = el("button", { class: `ct-btn${hero ? " hero" : ""}`, attrs: { type: "button" } }, el("span", { text: label })) as HTMLButtonElement;
    b.addEventListener("click", fn);
    return b;
  };

  function askZoom(): void {
    phase = "ask";
    stage.classList.add("lock");
    askIx = ixOf();
    qCard.innerHTML = `<span class="mcl-k">발견</span> 지금 두 직선, 만날까요?`;
    helper.innerHTML =
      "화면에선 만날 것 같지 않죠. 그런데 직선은 화면 밖으로도 <b>끝없이</b> 뻗어 나가요. 줌아웃으로 확인해 봐요!";
    clear(actions);
    actions.appendChild(mkBtn("줌아웃!", true, doZoom));
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    haptic(HAPTIC.ctaUnlock);
  }

  function doZoom(): void {
    if (phase !== "ask") return;
    phase = "zoomed";
    clear(actions);
    gLive.innerHTML = "";
    const k = clamp(140 / Math.abs(askIx - CX), 0.018, 0.6);
    world.style.transform = `scale(${k})`;
    qCard.innerHTML = `<span class="mcl-k">줌아웃</span> 세계가 ${Math.round(1 / k)}배 넓어졌어요`;
    later(() => {
      const sx = CX + (askIx - CX) * k;
      gFx.innerHTML =
        `<circle class="mlr-dotpop" cx="${sx.toFixed(1)}" cy="${LYY}" r="5.5" fill="${GEO.hlC}" stroke="#fff" stroke-width="1.6"/>` +
        `<circle class="mlr-ring" cx="${sx.toFixed(1)}" cy="${LYY}" r="14" fill="none" stroke="${GEO.hlC}" stroke-width="3"/>`;
      haptic(HAPTIC.correct);
      toast("보이나요? 저기서 만났어요!");
      helper.innerHTML =
        "보이나요? <b>평행이 아니면 아무리 멀어도 반드시 만나요!</b> 아주 살짝만 기울어도 결국 교점이 생겨요.";
      clear(actions);
      actions.appendChild(mkBtn("돌아오기", false, doReturn));
      later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }, 1180);
  }

  function doReturn(): void {
    if (phase !== "zoomed") return;
    phase = "return";
    clear(actions);
    gFx.innerHTML = "";
    world.style.transform = "scale(1)";
    later(() => {
      chips.on("zoom", "확인!");
      finishLab();
    }, 1200);
  }

  function finishLab(): void {
    phase = "done";
    mission = 4;
    stage.classList.remove("lock");
    judge();
    qCard.innerHTML = `<span class="mcl-k">완료</span> 만나거나, 겹치거나, 나란하거나!`;
    helper.innerHTML =
      "한 평면에서 두 직선의 운명은 셋뿐, <b>만나거나(한 점), 겹치거나(일치), 영원히 나란하거나(평행)!</b>";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /** pointerup 확정 판정: 미션 순서대로 검사한다. */
  function dropJudge(): void {
    const rel = relOf();
    const dAng = Math.abs(a);
    const dy = Math.abs(my - LYY);
    const nearIx = rel === "meet" && Math.abs(ixOf() - CX) <= NEAR;
    // 평행 스냅 자석: 미션 2와 완료 후 자유 놀이에서만(미션 3은 살짝 기울인 채 둬야 하므로 제외)
    if ((mission === 2 || phase === "done") && dAng <= 1.2 && dy >= 5) {
      const snapped = dAng > 0; // 이미 정확히 0°면 튕김 연출 없이 판정만
      a = 0;
      if (snapped) {
        mg.classList.add("snap");
        paintM();
        haptic(HAPTIC.correct);
        later(() => mg.classList.remove("snap"), 480);
      }
      later(() => {
        judge();
        if (mission === 2 && chips.on("para", "l∥m!")) {
          toast("찰칵, 평행! 기호로 l∥m");
          later(() => setMission(3), 1300);
        }
      }, snapped ? 430 : 0);
      return;
    }
    if (mission === 1) {
      if (nearIx) {
        if (chips.on("meet", "발견!")) {
          flashMeet(ixOf());
          haptic(HAPTIC.correct);
          toast("교점 발견! 딱 한 점에서 만나요");
          later(() => setMission(2), 1200);
        }
      } else if (rel === "meet") {
        toast("교점이 저 멀리 밖이에요, 더 크게!");
      } else {
        toast("오른쪽 손잡이로 기울여 봐요!");
      }
      return;
    }
    if (mission === 2) {
      if (rel === "co") toast("겹쳐 버렸어요! 가운데 손잡이로 띄워요");
      else if (rel === "meet") toast("각도 차 0°에 가까이 가면 착!");
      return;
    }
    if (mission === 3) {
      if (dAng >= 0.75 && dAng <= 4.05 && rel === "meet" && !nearIx) {
        askZoom();
      } else if (nearIx) {
        toast("교점이 벌써 보여요, 더 살짝!");
      } else if (dAng > 4.05) {
        toast("너무 기울었어요, 더 살짝!");
      } else {
        toast("아주 살짝만 기울여요, 1°쯤!");
      }
    }
  }

  /* ── 포인터: 손잡이 라우팅(가까운 쪽) ── */
  const toView = (e: PointerEvent): { x: number; y: number } => {
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * HGT };
  };
  const handPos = (): { mv: { x: number; y: number }; rt: { x: number; y: number } } => ({
    mv: { x: CX, y: my },
    rt: { x: CX + HR * Math.cos(rad(a)), y: my - HR * Math.sin(rad(a)) },
  });

  stage.addEventListener("pointerdown", (e) => {
    if (phase !== "play" && phase !== "done") return;
    const p = toView(e);
    const h = handPos();
    const dMv = Math.hypot(p.x - h.mv.x, p.y - h.mv.y);
    const dRt = Math.hypot(p.x - h.rt.x, p.y - h.rt.y);
    if (Math.min(dMv, dRt) > 44) return;
    drag = dMv <= dRt ? "move" : "rot";
    capturePointer(stage, e.pointerId);
    vGuide.classList.toggle("on", drag === "move");
    rGuide.classList.toggle("on", drag === "rot");
    haptic(HAPTIC.tap);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = toView(e);
    if (drag === "move") {
      my = Math.round(clamp(p.y, 55, 195));
    } else {
      if (Math.hypot(p.x - CX, p.y - my) < 24) return; // 중심에 너무 가까우면 각이 널뛴다
      const raw = angleOf(CX, my, p.x, p.y);
      const signed = raw > 180 ? raw - 360 : raw;
      a = Math.round(clamp(signed, -AMAX, AMAX) * 4) / 4;
    }
    paintM();
    judge();
  });
  const up = (): void => {
    if (!drag) return;
    drag = "";
    vGuide.classList.remove("on");
    rGuide.classList.remove("on");
    dropJudge();
  };
  stage.addEventListener("pointerup", up);
  stage.addEventListener("pointercancel", up);

  /* ── 시작 ── */
  qCard.innerHTML = `<span class="mcl-k">미션 1</span> 두 직선을 한 점에서 만나게 해 보세요`;
  helper.innerHTML =
    "가운데 <b>이동 손잡이</b>는 위아래로 옮기고, 오른쪽 <b>회전 손잡이</b>를 끌면 직선 <i class='mv'>m</i>이 기울어요.";
  paintM();
  judge();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
