// [중1 Ⅳ v5] u4l1 확산 랩: 「젓지 않아도 잉크가 퍼질까요?」
// 책의 탐구 둘을 손으로 한다. ① 물이 든 비커 바닥에 스포이트로 잉크를 넣고 젓지 않는다. ② 접시에 BTB 용액 방울을 늘어놓고 가운데에 식초를 떨어뜨린 뒤 뚜껑을 덮는다.
// 통찰 하나: 아무도 젓지 않고 바람도 없는데 퍼진다(입자가 스스로 움직인다).
// 조작: 예측(정오를 매기지 않는다) → 잉크 넣기 → 저을지 가만히 둘지 고르기 → 시간 막대를 밀어 지켜보기 → 식초 떨어뜨리기 → 시간 막대 → 판정 하나.
// 저으면 금방 섞이지만 무엇 때문에 섞였는지 알 수 없다(책의 주의: 물이 움직이지 않게). 새 물로 다시 하게 한다.
// 시간 막대는 되돌아가지 않는다(지나간 시간은 그대로다). 판정은 무대에 남은 것(바깥 고리가 늦게 변했다)으로 답할 수 있는 것만 묻는다.
// 그림(2026-11-15 다시 그림, 감사 상·중 후보): 비커의 물은 거의 맑게 두고 잉크는 진한 남색 구름으로 바닥에서 번진다(넣기 전에는 잉크가 없다).
//   접시는 책처럼 초록 BTB 방울이고, 가운데의 식초 입자(보라)가 사방으로 퍼져 나가 입자가 닿은 방울만 노랗게 변한다(책 그림 Ⅳ-1).
//   판정으로 넘어가면 무대를 두 칸('조금 뒤', '한참 뒤')으로 나눠 바뀐 차례와 퍼진 입자를 함께 남긴다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvRange, bvTween } from "../bio6/b6Lab";
import { beaker, beakerLiquidD, seeded, svgOpen, u4Lab, u4Predict, type Pt, type U4Step } from "./u4Kit";

const BX = 103, BY = 40, BW = 140, BH = 160; // 비커
const DROP: Pt = { x: 173, y: 186 }; // 잉크가 들어가는 자리(바닥 가까이)
const DISH: Pt = { x: 173, y: 118 };
const DR = 90; // 접시 반지름
const R_IN = 32, R_OUT = 62;
const INK = "#2C3AA8"; // 잉크(진한 남색)
const VIN = "#6741D9"; // 식초 입자(보라)
const T_MID = 0.38; // 비교판 왼쪽 칸('조금 뒤')의 시간

/** 식초 입자 무리의 퍼진 정도(가운데가 가장 빽빽하고 바깥으로 갈수록 성긴 무리의 크기). 처음에 빠르고 갈수록 느려진다. */
const sigma = (t: number): number => 61 * Math.pow(Math.max(0, t), 0.7);
/** 방울이 노랗게 변하는 때: 무리의 크기(×1.55)가 그 방울까지 닿을 때(가운데 농도의 3할쯤이 닿을 때). */
const reachT = (d: number): number => Math.pow(d / (1.55 * 61), 1 / 0.7);

export const u4InkLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-ink", tall: true });
  const { f, tm } = lab;
  const rnd = seeded(41);

  // 잉크 구름: 바닥의 한 점에서 위와 옆으로 번지는 덩어리들(시간이 갈수록 커지고 옅어지며 물 전체의 색이 짙어진다)
  const blobs = Array.from({ length: 9 }, (_, i) => {
    const up = i / 8;
    return {
      dx: (rnd() - 0.5) * (40 + 70 * up),
      rise: 14 + 104 * up + rnd() * 10,
      grow: 16 + 22 * rnd() + 12 * up,
      delay: 0.08 * up + rnd() * 0.06,
      a: 0.92 - 0.3 * up,
    };
  });
  // BTB 방울: 안쪽 고리 6, 바깥 고리 10. 식초 입자의 앞머리가 닿는 때에 노랗게 변한다
  const btb: (Pt & { at: number })[] = [];
  const ring = (n: number, r: number, a0: number): void => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + a0;
      btb.push({ x: DISH.x + r * Math.cos(a), y: DISH.y + r * Math.sin(a), at: reachT(r) + 0.012 * (i % 4) });
    }
  };
  ring(6, R_IN, -Math.PI / 2);
  ring(10, R_OUT, 0.2);
  // 식초 입자 72개: 처음에는 가운데 방울 안. 시간이 가면 가운데가 가장 빽빽한 무리(정규 분포)로 퍼지고,
  // 접시 끝에 닿은 입자는 그 자리에 머물러 한참 뒤에는 접시 전체에 고르게 퍼진다(차례 u가 같으면 무리 안의 자리와 마지막 자리가 짝이다)
  const vp = Array.from({ length: 72 }, (_, i) => {
    const u = Math.min(0.985, (i + 0.15 + 0.7 * rnd()) / 72);
    return {
      a: rnd() * Math.PI * 2,
      r0: 5.5 * Math.sqrt(rnd()),
      g: Math.sqrt(-2 * Math.log(1 - u)),
      fin: 85 * Math.sqrt(u),
      wob: (rnd() - 0.5) * 0.6,
      ph: rnd() * 6.3,
    };
  });
  const vpAt = (p: (typeof vp)[number], t: number): Pt => {
    const r = Math.max(p.r0, Math.min(p.fin, p.g * sigma(t)));
    const a = p.a + p.wob * Math.sin(p.ph + 4 * t) * (r / DR);
    return { x: r * Math.cos(a), y: r * Math.sin(a) };
  };

  const liqD = beakerLiquidD(BX, BY, BW, BH, 0.8);
  // 접시 한 장(가운데 0,0 기준). k는 크기 배율, live면 움직일 입자와 방울에 class를 붙인다
  const dishSvg = (t: number, live: boolean): string => {
    const drops = btb
      .map((b, i) => {
        const yel = t >= b.at;
        const x = (b.x - DISH.x).toFixed(1), y = (b.y - DISH.y).toFixed(1);
        return `<g class="u4x-ink-btb${yel ? " yel" : ""}"${live ? ` data-i="${i}"` : ""}>
          <circle cx="${x}" cy="${y}" r="7.2" fill="url(#u4inkG)" stroke="#2B8A3E" stroke-width="1"/>
          <circle class="u4x-ink-btby" cx="${x}" cy="${y}" r="7.2" fill="url(#u4inkY)" stroke="#E8A200" stroke-width="1"/>
          <ellipse cx="${(+x - 2.4).toFixed(1)}" cy="${(+y - 2.6).toFixed(1)}" rx="2.3" ry="1.6" fill="#fff" opacity=".75"/>
        </g>`;
      })
      .join("");
    const parts = vp
      .map((p) => {
        const q = vpAt(p, t);
        return `<circle class="u4x-ink-vp" cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="2.7" fill="${VIN}" stroke="#fff" stroke-width=".7"${live ? ' opacity="0"' : ""}/>`;
      })
      .join("");
    return `<circle r="${DR}" fill="url(#u4inkDish)"/>
      <circle r="${DR - 1.6}" stroke="#7F93B0" stroke-opacity=".28" stroke-width="2.2"/>
      <circle r="${DR - 4}" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>
      <circle r="${DR}" stroke="#C9D8EA" stroke-width="3.2"/>
      <path d="M${-DR * 0.74} ${-DR * 0.5} A${DR - 6} ${DR - 6} 0 0 1 ${-DR * 0.28} ${-DR * 0.86}" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".85"/>
      ${drops}
      <circle class="u4x-ink-vin" r="8.5" fill="url(#u4inkV)" stroke="#D9A400" stroke-width="1.6"${live ? ' opacity="0"' : ""}/>
      <g class="u4x-ink-vps">${parts}</g>`;
  };
  const lidSvg = (live: boolean): string => `<g class="u4x-ink-lid"${live ? ' opacity="0"' : ""}>
      <circle r="${DR + 6}" stroke="#DCEBFF" stroke-opacity=".75" stroke-width="2.4"/>
      <path d="M${-DR * 0.82} ${-DR * 0.42} A${DR + 2} ${DR + 2} 0 0 1 ${-DR * 0.42} ${-DR * 0.84}" stroke="#fff" stroke-width="3.6" stroke-linecap="round" opacity=".55"/>
    </g>`;

  f.stage.innerHTML = `${svgOpen}
    <defs>
      <radialGradient id="u4inkBlob" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${INK}" stop-opacity="1"/><stop offset="0.55" stop-color="${INK}" stop-opacity="0.55"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></radialGradient>
      <linearGradient id="u4inkWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF4FB"/><stop offset="1" stop-color="#D3E0EF"/></linearGradient>
      <radialGradient id="u4inkDish" cx="0.42" cy="0.36" r="0.75"><stop offset="0" stop-color="#FAFCFE"/><stop offset="0.75" stop-color="#E7EDF5"/><stop offset="1" stop-color="#D2DCE8"/></radialGradient>
      <radialGradient id="u4inkG" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="#B2F2BB"/><stop offset="0.55" stop-color="#51CF66"/><stop offset="1" stop-color="#2F9E44"/></radialGradient>
      <radialGradient id="u4inkY" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="#FFF3BF"/><stop offset="0.55" stop-color="#FFD43B"/><stop offset="1" stop-color="#F59F00"/></radialGradient>
      <radialGradient id="u4inkV" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#FFFDF3"/><stop offset="1" stop-color="#FFE8A3"/></radialGradient>
      <clipPath id="u4inkClip"><path d="${liqD}"/></clipPath>
      <linearGradient id="u4inkTube" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F4F8FC" stop-opacity=".9"/><stop offset=".5" stop-color="#C9D6E6" stop-opacity=".55"/><stop offset="1" stop-color="#EEF3F9" stop-opacity=".85"/></linearGradient>
      <radialGradient id="u4inkBulb" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#C6CED8"/><stop offset="0.6" stop-color="#7D8896"/><stop offset="1" stop-color="#4E5866"/></radialGradient>
    </defs>
    <g class="u4x-ink-a">
      <ellipse cx="173" cy="208" rx="86" ry="7" fill="#000" opacity="0.32"/>
      ${beaker(BX, BY, BW, BH, "url(#u4inkWater)", "u4x-ink", 0.8)}
      <g clip-path="url(#u4inkClip)">
        <rect class="u4x-ink-tint" x="${BX}" y="${BY}" width="${BW}" height="${BH}" fill="#3B4CCA" opacity="0"/>
        ${blobs.map(() => `<ellipse class="u4x-ink-blob" cx="${DROP.x}" cy="${DROP.y}" rx="0" ry="0" fill="url(#u4inkBlob)" opacity="0"/>`).join("")}
      </g>
      <path class="u4x-ink-rod" d="M${DROP.x + 26} ${BY - 26} L${DROP.x + 4} ${BY + BH - 22}" stroke="rgba(235,242,250,.9)" stroke-width="5" stroke-linecap="round" opacity="0"/>
      <g class="u4x-ink-dropper">
        <rect x="${DROP.x - 4.5}" y="${BY - 34}" width="9" height="${DROP.y - BY + 22}" rx="3.5" fill="url(#u4inkTube)" stroke="#8B9BB0" stroke-width="1.2"/>
        <rect class="u4x-ink-load" x="${DROP.x - 2.6}" y="${DROP.y - 46}" width="5.2" height="34" rx="2" fill="${INK}"/>
        <path d="M${DROP.x - 4.5} ${DROP.y - 12} l4.5 10 l4.5 -10 Z" fill="#B7C3D3" stroke="#8B9BB0" stroke-width="1"/>
        <path d="M${DROP.x - 9} ${BY - 33} h18" stroke="#6B7685" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="${DROP.x}" cy="${BY - 44}" rx="10" ry="11" fill="url(#u4inkBulb)" stroke="#3F4855" stroke-width="1.4"/>
        <ellipse cx="${DROP.x - 3.5}" cy="${BY - 48}" rx="2.6" ry="3.6" fill="#fff" opacity=".45"/>
      </g>
    </g>
    <g class="u4x-ink-b" style="display:none">
      <ellipse cx="${DISH.x}" cy="214" rx="96" ry="7" fill="#000" opacity="0.32"/>
      <g class="u4x-ink-live" transform="translate(${DISH.x} ${DISH.y})">${dishSvg(0, true)}${lidSvg(true)}</g>
      <g class="u4x-ink-pair" style="display:none"></g>
    </g>
  </svg>`;
  const q = <T extends Element>(sel: string): T => f.stage.querySelector(sel) as T;
  const sceneA = q<SVGGElement>(".u4x-ink-a");
  const sceneB = q<SVGGElement>(".u4x-ink-b");
  const blobEls = Array.from(f.stage.querySelectorAll<SVGEllipseElement>(".u4x-ink-blob"));
  const tint = q<SVGRectElement>(".u4x-ink-tint");
  const water = q<SVGPathElement>(".u4x-ink-liq");
  water.setAttribute("opacity", "0.95");
  const dropper = q<SVGGElement>(".u4x-ink-dropper");
  const load = q<SVGRectElement>(".u4x-ink-load");
  const live = q<SVGGElement>(".u4x-ink-live");
  const pair = q<SVGGElement>(".u4x-ink-pair");
  const btbEls = Array.from(live.querySelectorAll<SVGGElement>(".u4x-ink-btb"));
  const vpEls = Array.from(live.querySelectorAll<SVGCircleElement>(".u4x-ink-vp"));
  const vin = q<SVGCircleElement>(".u4x-ink-vin");
  const lid = q<SVGGElement>(".u4x-ink-lid");
  const rod = q<SVGPathElement>(".u4x-ink-rod");
  dropper.style.transform = "translateY(-150px)";

  let pred = "";
  let pA = 0;

  /** 잉크: t=0이면 아무것도 없다. 넣은 직후에는 바닥의 진한 점, 시간이 가면 구름이 위와 옆으로 번지고 물 전체가 고르게 짙어진다. */
  function paintInk(t: number): void {
    blobEls.forEach((c, k) => {
      if (t <= 0) {
        c.setAttribute("opacity", "0");
        return;
      }
      const b = blobs[k];
      const u = Math.max(0, Math.min(1, (t - b.delay) / (1 - b.delay)));
      const e = 1 - (1 - u) * (1 - u);
      const r = 7 + b.grow * e + 26 * t;
      c.setAttribute("cx", (DROP.x + b.dx * e).toFixed(1));
      c.setAttribute("cy", (DROP.y - 2 - b.rise * e).toFixed(1));
      c.setAttribute("rx", r.toFixed(1));
      c.setAttribute("ry", (r * 0.82).toFixed(1));
      const fade = Math.pow(Math.max(0, 1 - t), 1.15);
      c.setAttribute("opacity", (k === 0 ? Math.max(fade, 0.2 * (1 - t)) : b.a * fade * Math.min(1, u * 5 + 0.15)).toFixed(2));
    });
    tint.setAttribute("opacity", (0.5 * Math.pow(Math.max(0, t), 1.25)).toFixed(3));
    host.dataset.u4Ink = t.toFixed(2);
  }
  /** 접시: 식초 입자를 시간 t의 자리로, 입자가 닿은 방울만 노랗게. */
  function paintDish(t: number): void {
    vpEls.forEach((c, k) => {
      const p = vpAt(vp[k], t);
      c.setAttribute("cx", p.x.toFixed(1));
      c.setAttribute("cy", p.y.toFixed(1));
    });
    btbEls.forEach((g, k) => g.classList.toggle("yel", t >= btb[k].at));
    host.dataset.u4Dish = t.toFixed(2);
  }

  // 시간 막대(되돌아가지 않는다)
  const timeBar = (cls: string, onT: (t: number) => void, onEnd: () => void) => {
    let p = 0;
    let ended = false;
    const r = bvRange({
      cls,
      min: 0,
      max: 100,
      value: 0,
      label: "시간의 흐름 (막대를 오른쪽으로 밀어 보세요)",
      ticks: ["처음", "충분한 시간 뒤"],
      onInput: (v) => {
        if (v < p) {
          r.set(p);
          return;
        }
        p = v;
        onT(p / 100);
        if (p >= 97 && !ended) {
          ended = true;
          r.input.disabled = true;
          haptic(HAPTIC.correct);
          onEnd();
        }
      },
    });
    return r;
  };

  /** 판정 무대: 같은 접시를 '조금 뒤'와 '한참 뒤' 두 칸으로. 안쪽 고리만 노란 때와 모두 노란 때, 그때마다 식초 입자가 퍼진 곳을 함께 둔다. */
  function showPair(): void {
    const k = 0.82;
    const cell = (cx: number, label: string, t: number): string => `
      <text x="${cx}" y="22" text-anchor="middle" font-size="13" font-weight="800" fill="#DCE7F5">${label}</text>
      <ellipse cx="${cx}" cy="${206}" rx="${80}" ry="6" fill="#000" opacity="0.3"/>
      <g transform="translate(${cx} ${120}) scale(${k})">${dishSvg(t, false)}${lidSvg(false)}</g>`;
    pair.innerHTML = cell(88, "조금 뒤", T_MID) + cell(258, "한참 뒤", 1);
    live.style.display = "none";
    pair.style.display = "";
    sceneB.querySelector("ellipse")?.setAttribute("opacity", "0");
    host.dataset.u4Pair = "1";
  }

  const addInk = bvBtn("main u4x-ink-add", "스포이트로 잉크 떨어뜨리기");
  const toDish = bvBtn("main u4x-ink-next", "기체에서도 퍼지는지 실험하기");
  const addVin = bvBtn("main u4x-ink-vinbtn", "식초 떨어뜨리고 뚜껑 덮기");

  function startA(): void {
    f.say("물이 든 비커예요. 스포이트로 바닥 가까이에 <b>잉크</b>를 넣어 보세요.");
    f.slot.setControls(addInk);
    api.setCTA("잉크를 넣고 지켜보세요", { enabled: false });
  }
  // 잉크를 넣은 뒤 어떻게 할지는 학생이 정한다. 저으면 금방 섞이지만 무엇 때문에 섞였는지 알 수 없어 새 물로 다시 한다.
  const cStir = bvCard("u4x-ink-way", { name: "유리 막대로 젓기", sub: "직접 저어서 섞기", key: "stir" });
  const cWait = bvCard("u4x-ink-way", { name: "가만히 두기", sub: "건드리지 않고 관찰하기", key: "wait" });
  const redo = bvBtn("main u4x-ink-redo", "새 물에 다시 해 보기");
  let stirred = false;
  addInk.addEventListener("click", () => {
    addInk.disabled = true;
    haptic(HAPTIC.tap);
    load.setAttribute("opacity", "1");
    dropper.style.transform = "translateY(0)";
    tm.later(() => {
      load.setAttribute("opacity", "0");
      paintInk(0.02);
      pA = 0.02;
    }, 500);
    tm.later(() => {
      dropper.style.transform = "translateY(-150px)";
      f.say(stirred ? "깨끗한 물에 잉크를 다시 넣었어요. 이번에는 <b>가만히 두기</b>를 골라 볼까요?" : "잉크를 떨어뜨렸어요. 이제 <b>어떻게 관찰할지</b> 방법을 골라 보세요.");
      f.slot.setControls(bvCards(2, cStir, cWait));
    }, 1100);
  });
  cStir.el.addEventListener("click", () => {
    if (stirred) return;
    stirred = true;
    haptic(HAPTIC.tap);
    cStir.el.disabled = true;
    cWait.el.disabled = true;
    rod.setAttribute("opacity", "1");
    rod.classList.add("stir");
    bvTween(tm, 1300, (t) => paintInk(0.02 + 0.98 * t), () => {
      rod.setAttribute("opacity", "0");
      rod.classList.remove("stir");
      haptic(HAPTIC.wrong);
      cStir.done();
      f.say("유리 막대로 저으니 금방 섞였어요. 하지만 <b>막대로 저어서</b> 섞인 것인지 잉크가 <b>스스로</b> 퍼진 것인지 알 수 없네요. 새 물에 다시 해 볼까요?");
      f.slot.setControls(redo);
    });
  });
  redo.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    paintInk(0);
    pA = 0;
    cWait.el.disabled = false;
    addInk.disabled = false;
    f.say("깨끗한 물을 새로 준비했어요. 스포이트로 <b>잉크</b>를 다시 떨어뜨려 보세요.");
    f.slot.setControls(addInk);
  });
  cWait.el.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    f.say("물을 젓지 않고 가만히 둔 채 <b>시간의 흐름</b> 막대를 오른쪽으로 밀어 보세요.");
    f.slot.setControls(
      timeBar("u4x-ink-ta", (t) => paintInk(Math.max(pA, t)), () => {
        f.pips(1);
        const head = pred.startsWith("물 전체") ? "예측대로" : "예측과 달리";
        f.say(`${head} 유리 막대로 젓지 않았는데도 잉크가 스스로 퍼져 <b>물 전체</b>가 골고루 물들었어요!`);
        tm.later(() => f.slot.setControls(toDish), 500);
      }).el,
    );
  });
  toDish.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    sceneA.style.display = "none";
    sceneB.style.display = "";
    f.say("초록색 <b>BTB 용액</b> 방울은 식초 성분을 만나면 <b>노란색</b>으로 변해요. 접시 한가운데에 식초를 떨어뜨리고 뚜껑을 덮어 보세요.");
    f.slot.setControls(addVin);
    api.setCTA("식초를 떨어뜨리고 지켜보세요", { enabled: false });
  });
  addVin.addEventListener("click", () => {
    addVin.disabled = true;
    haptic(HAPTIC.tap);
    vin.setAttribute("opacity", "1");
    vpEls.forEach((c) => c.setAttribute("opacity", "1"));
    paintDish(0);
    tm.later(() => lid.setAttribute("opacity", "1"), 350);
    tm.later(() => {
      f.say("뚜껑을 덮어 <b>바람을 완전히 막았어요</b>. 시간 막대를 오른쪽으로 밀면서 어느 방울부터 색이 변하는지 살펴보세요.");
      f.slot.setControls(
        timeBar("u4x-ink-tb", (t) => paintDish(t), () => {
          f.pips(2);
          f.say("가운데 식초에서 <b>가까운 방울부터 바깥쪽으로</b> 차례차례 노랗게 변했어요!");
          tm.later(judge, 700);
        }).el,
      );
    }, 700);
  });

  function judge(): void {
    showPair();
    f.slot.ask(
      "가장자리인 <b>바깥쪽 방울</b>이 안쪽 방울보다 더 늦게 노랗게 변한 까닭은 무엇인가요?",
      [
        { t: "식초 입자가 스스로 퍼져 나가는 데 시간이 걸려서", ok: true },
        { t: "바깥쪽 BTB 용액 방울이 더 진해서" },
        { t: "뚜껑이 바깥쪽 방울을 누르고 있어서" },
      ],
      (ok) => api.recordQuiz(ok),
      {
        why: "가운데에 떨어뜨린 식초 입자가 <b>사방으로 스스로 퍼져 나가면서</b> 가까운 곳부터 차례로 닿았기 때문이에요.",
        onNext: () => lab.finish("저어 주거나 바람이 불지 않아도 물질을 이루는 입자가 <b>스스로 움직여</b> 사방으로 퍼져 나가는 현상을 <b>확산</b>이라고 해요."),
      },
    );
  }

  // 처음: 예측
  paintInk(0);
  load.setAttribute("opacity", "0");
  f.say("물이 담긴 비커 바닥에 잉크를 떨어뜨리고 <b>젓지 않은 채</b> 가만히 두려고 해요. 먼저 결과를 예측해 볼까요?");
  // 첫 보기는 "물 전체"로 시작해야 한다(시간 막대 끝의 말머리가 pred.startsWith("물 전체")로 가른다)
  u4Predict(lab, "비커 바닥에 떨어뜨린 잉크를 <b>젓지 않고</b> 그대로 두면 어떻게 될까요?", ["물 전체로 골고루 퍼진다", "비커 바닥에만 가라앉아 머문다", "물 위쪽으로만 떠올라 모인다"], (picked) => {
    pred = picked;
    startA();
  });
  api.setCTA("먼저 결과를 예측해 보세요", { enabled: false });
  return lab.cleanup;
};
