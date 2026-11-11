// [중1 Ⅳ v5] u4l1 확산 랩: 「젓지 않아도 잉크가 퍼질까요?」
// 책의 탐구 둘을 손으로 한다. ① 물이 든 비커 바닥에 스포이트로 잉크를 넣고 젓지 않는다. ② 접시에 BTB 용액 방울을 늘어놓고 가운데에 식초를 떨어뜨린 뒤 뚜껑을 덮는다.
// 통찰 하나: 아무도 젓지 않고 바람도 없는데 퍼진다(입자가 스스로 움직인다).
// 조작: 예측(정오를 매기지 않는다) → 잉크 넣기 → 저을지 가만히 둘지 고르기 → 시간 막대를 밀어 지켜보기 → 식초 떨어뜨리기 → 시간 막대 → 판정 하나.
// 저으면 금방 섞이지만 무엇 때문에 섞였는지 알 수 없다(책의 주의: 물이 움직이지 않게). 새 물로 다시 하게 한다.
// 시간 막대는 되돌아가지 않는다(지나간 시간은 그대로다). 판정은 무대에 남은 것(바깥 고리가 늦게 변했다)으로 답할 수 있는 것만 묻는다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvRange, bvTween } from "../bio6/b6Lab";
import { A, beaker, seeded, svgOpen, u4Lab, u4Predict, type Pt, type U4Step } from "./u4Kit";

const BX = 103, BY = 40, BW = 140, BH = 160; // 비커
const DROP: Pt = { x: 173, y: 186 }; // 잉크가 들어가는 자리(바닥 가까이)
const DISH: Pt = { x: 173, y: 118 };
const R_IN = 32, R_OUT = 62;

export const u4InkLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-ink" });
  const { f, tm } = lab;
  const rnd = seeded(41);

  const parts = Array.from({ length: 26 }, () => ({ x: BX + 14 + rnd() * (BW - 28), y: BY + 42 + rnd() * (BH - 56), delay: rnd() * 0.5 }));
  const btb: (Pt & { at: number })[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    btb.push({ x: DISH.x + R_IN * Math.cos(a), y: DISH.y + R_IN * Math.sin(a), at: 0.22 + 0.03 * (i % 3) });
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    btb.push({ x: DISH.x + R_OUT * Math.cos(a), y: DISH.y + R_OUT * Math.sin(a), at: 0.62 + 0.035 * (i % 4) });
  }

  f.stage.innerHTML = `${svgOpen}
    <defs>
      <radialGradient id="u4inkBlob" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${A.ink}" stop-opacity="0.95"/><stop offset="1" stop-color="${A.ink}" stop-opacity="0"/></radialGradient>
      <radialGradient id="u4inkDish" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#F7FAFD"/><stop offset="1" stop-color="#D5DEE9"/></radialGradient>
      <clipPath id="u4inkClip"><rect x="${BX + 3}" y="${BY + BH * 0.2}" width="${BW - 6}" height="${BH * 0.8 - 3}" rx="5"/></clipPath>
    </defs>
    <g class="u4x-ink-a">
      <ellipse cx="173" cy="208" rx="86" ry="7" fill="#000" opacity="0.32"/>
      ${beaker(BX, BY, BW, BH, A.water, "u4x-ink", 0.8)}
      <g clip-path="url(#u4inkClip)">
        <rect class="u4x-ink-tint" x="${BX}" y="${BY}" width="${BW}" height="${BH}" fill="${A.ink}" opacity="0"/>
        <circle class="u4x-ink-blob" cx="${DROP.x}" cy="${DROP.y}" r="0" fill="url(#u4inkBlob)"/>
        ${parts.map(() => `<circle class="u4x-ink-part" cx="${DROP.x}" cy="${DROP.y}" r="3" fill="#C3CFFF" opacity="0"/>`).join("")}
      </g>
      <path class="u4x-ink-rod" d="M${DROP.x + 26} ${BY - 26} L${DROP.x + 4} ${BY + BH - 22}" stroke="rgba(235,242,250,.9)" stroke-width="5" stroke-linecap="round" opacity="0"/>
      <g class="u4x-ink-dropper">
        <rect x="${DROP.x - 4}" y="${BY - 34}" width="8" height="${DROP.y - BY + 22}" rx="3" fill="rgba(240,244,250,.9)" stroke="#8B9BB0" stroke-width="1.4"/>
        <path d="M${DROP.x - 4} ${DROP.y - 12} l4 9 l4 -9 Z" fill="#8B9BB0"/>
        <ellipse cx="${DROP.x}" cy="${BY - 40}" rx="10" ry="9" fill="#F0705E" stroke="#B4483A" stroke-width="1.4"/>
      </g>
    </g>
    <g class="u4x-ink-b" style="display:none">
      <ellipse cx="${DISH.x}" cy="214" rx="96" ry="7" fill="#000" opacity="0.32"/>
      <circle cx="${DISH.x}" cy="${DISH.y}" r="90" fill="url(#u4inkDish)" stroke="${A.glass}" stroke-width="3"/>
      ${btb.map((b) => `<circle class="u4x-ink-btb" cx="${b.x.toFixed(1)}" cy="${b.y.toFixed(1)}" r="7" fill="${A.btb}" stroke="#fff" stroke-width="1.4"/>`).join("")}
      <circle class="u4x-ink-vin" cx="${DISH.x}" cy="${DISH.y}" r="8" fill="#FFFDF2" stroke="#E0B400" stroke-width="2.4" opacity="0"/>
      <g class="u4x-ink-lid" opacity="0">
        <circle cx="${DISH.x}" cy="${DISH.y}" r="97" stroke="rgba(220,235,255,.9)" stroke-width="3"/>
        <path d="M${DISH.x - 70} ${DISH.y - 56} a90 90 0 0 1 40 -28" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
      </g>
    </g>
  </svg>`;
  const q = <T extends Element>(sel: string): T => f.stage.querySelector(sel) as T;
  const sceneA = q<SVGGElement>(".u4x-ink-a");
  const sceneB = q<SVGGElement>(".u4x-ink-b");
  const blob = q<SVGCircleElement>(".u4x-ink-blob");
  const tint = q<SVGRectElement>(".u4x-ink-tint");
  const dropper = q<SVGGElement>(".u4x-ink-dropper");
  const partEls = Array.from(f.stage.querySelectorAll<SVGCircleElement>(".u4x-ink-part"));
  const btbEls = Array.from(f.stage.querySelectorAll<SVGCircleElement>(".u4x-ink-btb"));
  const vin = q<SVGCircleElement>(".u4x-ink-vin");
  const lid = q<SVGGElement>(".u4x-ink-lid");
  const rod = q<SVGPathElement>(".u4x-ink-rod");
  dropper.style.transform = "translateY(-150px)";

  let pred = "";
  let pA = 0;

  function paintInk(t: number): void {
    blob.setAttribute("r", (12 + 70 * t).toFixed(1));
    blob.setAttribute("opacity", (1 - t).toFixed(2));
    tint.setAttribute("opacity", (0.4 * t).toFixed(2));
    partEls.forEach((c, k) => {
      const p = parts[k];
      const u = Math.max(0, Math.min(1, (t - p.delay * 0.6) / (1 - p.delay * 0.6)));
      const e = 1 - (1 - u) * (1 - u);
      c.setAttribute("cx", (DROP.x + (p.x - DROP.x) * e).toFixed(1));
      c.setAttribute("cy", (DROP.y + (p.y - DROP.y) * e).toFixed(1));
      c.setAttribute("opacity", t > 0 ? "0.9" : "0");
    });
    host.dataset.u4Ink = t.toFixed(2);
  }
  function paintDish(t: number): void {
    btbEls.forEach((c, k) => c.setAttribute("fill", t >= btb[k].at ? A.yellow : A.btb));
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
      label: "시간 보내기: 막대를 오른쪽으로 밀어요",
      ticks: ["처음", "한참 뒤"],
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

  const addInk = bvBtn("main u4x-ink-add", "스포이트로 잉크 넣기");
  const toDish = bvBtn("main u4x-ink-next", "다음 실험: 접시와 식초");
  const addVin = bvBtn("main u4x-ink-vinbtn", "식초 떨어뜨리고 뚜껑 덮기");

  function startA(): void {
    f.say("물이 든 비커예요. 스포이트로 바닥 가까이에 <b>잉크</b>를 넣어 보세요.");
    f.slot.setControls(addInk);
    api.setCTA("잉크를 넣고 지켜보세요", { enabled: false });
  }
  // 잉크를 넣은 뒤 어떻게 할지는 학생이 정한다. 저으면 금방 섞이지만 무엇 때문에 섞였는지 알 수 없어 새 물로 다시 한다.
  const cStir = bvCard("u4x-ink-way", { name: "유리 막대로 젓기", sub: "빨리 섞어 본다", key: "stir" });
  const cWait = bvCard("u4x-ink-way", { name: "가만히 두기", sub: "젓지 않고 기다린다", key: "wait" });
  const redo = bvBtn("main u4x-ink-redo", "새 물로 다시 하기");
  let stirred = false;
  addInk.addEventListener("click", () => {
    addInk.disabled = true;
    haptic(HAPTIC.tap);
    dropper.style.transform = "translateY(0)";
    tm.later(() => {
      paintInk(0.02);
      pA = 0.02;
    }, 500);
    tm.later(() => {
      dropper.style.transform = "translateY(-150px)";
      f.say(stirred ? "새 물에 잉크를 다시 넣었어요. 이번에는 어떻게 할까요?" : "잉크를 넣었어요. 이제 <b>어떻게 할지</b> 골라 보세요.");
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
      f.say("금방 섞였어요. 그런데 <b>저어서</b> 섞인 건지 <b>스스로</b> 퍼진 건지 알 수 없어요.");
      f.slot.setControls(redo);
    });
  });
  redo.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    paintInk(0);
    pA = 0;
    cWait.el.disabled = false;
    addInk.disabled = false;
    f.say("새 물을 담았어요. 스포이트로 <b>잉크</b>를 다시 넣어 보세요.");
    f.slot.setControls(addInk);
  });
  cWait.el.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    f.say("젓지 않고 <b>시간만</b> 보내요. 막대를 오른쪽으로 밀어 보세요.");
    f.slot.setControls(
      timeBar("u4x-ink-ta", (t) => paintInk(Math.max(pA, t)), () => {
        f.pips(1);
        const head = pred.startsWith("물 전체") ? "예측대로" : "예측과 달리";
        f.say(`${head} 젓지 않았는데 <b>물 전체</b>가 잉크 색이 됐어요.`);
        tm.later(() => f.slot.setControls(toDish), 500);
      }).el,
    );
  });
  toDish.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    sceneA.style.display = "none";
    sceneB.style.display = "";
    f.say("<b>BTB 용액</b> 방울은 식초를 만나면 <b>노랗게</b> 변해요. 가운데에 식초를 떨어뜨려요.");
    f.slot.setControls(addVin);
    api.setCTA("식초를 떨어뜨리고 지켜보세요", { enabled: false });
  });
  addVin.addEventListener("click", () => {
    addVin.disabled = true;
    haptic(HAPTIC.tap);
    vin.setAttribute("opacity", "1");
    tm.later(() => lid.setAttribute("opacity", "1"), 350);
    tm.later(() => {
      f.say("뚜껑을 덮어 <b>바람이 없어요</b>. 시간을 보내며 어느 방울부터 변하는지 보세요.");
      f.slot.setControls(
        timeBar("u4x-ink-tb", (t) => paintDish(t), () => {
          f.pips(2);
          f.say("식초에 <b>가까운 방울부터</b> 차례로 노랗게 변했어요.");
          tm.later(judge, 700);
        }).el,
      );
    }, 700);
  });

  function judge(): void {
    f.slot.ask(
      "<b>바깥쪽 방울</b>이 더 늦게 노랗게 변한 까닭은?",
      [
        { t: "식초 입자가 닿는 데 시간이 걸려서", ok: true },
        { t: "바깥쪽 방울이 더 진해서" },
        { t: "뚜껑이 바깥쪽을 눌러서" },
      ],
      (ok) => api.recordQuiz(ok),
      {
        why: "식초 입자가 <b>가운데에서 사방으로</b> 퍼져 나가 먼 곳에 늦게 닿았어요.",
        onNext: () => lab.finish("젓지도 불지도 않았는데 퍼졌어요. 입자가 <b>스스로 움직여</b> 멀리 퍼져 나가는 현상이 <b>확산</b>이에요."),
      },
    );
  }

  // 처음: 예측
  paintInk(0);
  f.say("비커 바닥에 잉크를 넣고 <b>젓지 않을</b> 거예요. 먼저 예측해 보세요.");
  u4Predict(lab, "바닥에 넣은 잉크를 <b>젓지 않고</b> 두면 어떻게 될까요?", ["물 전체로 퍼진다", "바닥에만 머문다", "물 위로 떠올라 모인다"], (picked) => {
    pred = picked;
    startA();
  });
  api.setCTA("먼저 예측을 골라 보세요", { enabled: false });
  return lab.cleanup;
};
