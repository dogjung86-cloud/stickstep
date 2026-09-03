// [중1 Ⅳ v3] L1 inkSpreadLab — 「젓지 않아도 퍼지는 잉크」(교과서 탐구 1·2 재현).
// 한 통찰: 물질을 구성하는 입자는 스스로 끊임없이 운동하므로, 아무도 젓거나 불지 않아도 멀리 퍼져 나간다(확산).
// 조작: 버튼 1개가 국면을 밟는다 — 잉크 넣기(비커) → 접시 실험으로 → 식초 떨어뜨리기(BTB 접시) → 판정.
// 한 화면 예산: 장면은 한 번에 하나(비커 ↔ 접시를 같은 자리에서 교체), 무대 안 글자 없음, 판정은 버튼 슬롯에 교체.
// 목표 3: 잉크 확산 → 식초 확산 → 판정(b4Ask). rAF·캔버스 없음(자가 예약 setTimeout, 시드 고정 난수).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { M3, beakerSvg, seededRandom, type Pt } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3Btn, m3Goals, m3Helper, m3Slot, m3Timers } from "./m3Lab";

interface InkStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N_TICK = 18;
const DROP: Pt = { x: 170, y: 138 }; // 비커 바닥 근처(잉크가 들어가는 자리)
const DISH: Pt = { x: 170, y: 92 }; // 페트리 접시 중심
const DISH_R = 62;

export const inkSpreadLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as InkStep;
  const tm = m3Timers();
  const rnd = seededRandom(41);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "ink", name: "잉크", sub: "물속으로" },
      { id: "vin", name: "식초", sub: "접시 위로" },
      { id: "judge", name: "판정", sub: "둘 다 본 뒤" },
    ],
    () => {
      helper.innerHTML = "정리! 입자가 <b>스스로 운동</b>하여 멀리 퍼져 나가는 현상이 <b>확산</b>이에요.";
      api.enableCTA(s.cta ?? "확산 정리하기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = m3Helper("비커 바닥에 스포이트로 <b>잉크</b>를 넣을 거예요. 물은 절대 젓지 않아요.");

  // 잉크 입자 최종 위치(물 영역 안 무작위)와 지연
  const parts = Array.from({ length: 20 }, () => ({
    x: 122 + rnd() * 96,
    y: 56 + rnd() * 92,
    delay: rnd() * 0.45,
  }));
  // BTB 방울 — 중심 거리 24·46의 두 고리(안쪽 5·바깥 8)
  const btb: (Pt & { d: number })[] = [];
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; btb.push({ x: DISH.x + 24 * Math.cos(a), y: DISH.y + 24 * Math.sin(a), d: 24 }); }
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2; btb.push({ x: DISH.x + 46 * Math.cos(a), y: DISH.y + 46 * Math.sin(a), d: 46 }); }

  const stage = el("div", { class: "ink-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="inkBlobG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${M3.inkBlue}" stop-opacity="0.85"/><stop offset="1" stop-color="${M3.inkBlue}" stop-opacity="0"/></radialGradient>
      <radialGradient id="inkDishG" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4EAF1"/></radialGradient>
    </defs>
    <g class="ink-scene ink-left">
      <ellipse cx="170" cy="166" rx="66" ry="6" fill="#2A3A5E" opacity="0.10"/>
      ${beakerSvg(110, 30, 120, 132, M3.water, "ink", 0.82)}
      <circle class="ink-blob" cx="${DROP.x}" cy="${DROP.y}" r="0" fill="url(#inkBlobG)" opacity="0"/>
      <g class="ink-parts">${parts.map((_, i) => `<circle class="ink-part" data-i="${i}" cx="${DROP.x}" cy="${DROP.y}" r="3.2" fill="${M3.inkBlue}" opacity="0"/>`).join("")}</g>
      <g class="ink-dropper" style="transform-box: fill-box; transform-origin: top center; transform: translate(0, -60px); opacity: 0">
        <rect x="${DROP.x - 4}" y="${DROP.y - 96}" width="8" height="82" rx="3" fill="#F1F3F5" stroke="#8B95A1" stroke-width="1.8"/>
        <path d="M${DROP.x - 4} ${DROP.y - 14} l4 10 l4 -10 Z" fill="#8B95A1"/>
        <ellipse cx="${DROP.x}" cy="${DROP.y - 100}" rx="9" ry="7" fill="#F03E3E" stroke="#B02A2A" stroke-width="1.6"/>
      </g>
    </g>
    <g class="ink-scene ink-right" opacity="0" style="display:none">
      <ellipse cx="${DISH.x}" cy="166" rx="70" ry="6" fill="#2A3A5E" opacity="0.10"/>
      <circle cx="${DISH.x}" cy="${DISH.y}" r="${DISH_R + 6}" fill="url(#inkDishG)" stroke="#9DB2C4" stroke-width="3"/>
      <circle cx="${DISH.x}" cy="${DISH.y}" r="${DISH_R - 2}" fill="none" stroke="#C9D3DE" stroke-width="1.4" stroke-dasharray="3 4"/>
      ${btb.map((b, i) => `<circle class="ink-btb" data-i="${i}" cx="${b.x.toFixed(1)}" cy="${b.y.toFixed(1)}" r="5.5" fill="${M3.btb}" stroke="#FFFFFF" stroke-width="1.3"/>`).join("")}
      <circle class="ink-vin" cx="${DISH.x}" cy="${DISH.y}" r="6.5" fill="#FFFFFF" stroke="${M3.yellow}" stroke-width="2.4" opacity="0"/>
    </g>
  </svg>`;
  const board = el("div", { class: "mt3-board ink-board" }, stage);

  const btn = m3Btn("ink-btn", "잉크 넣기");
  const slot = m3Slot(tm, "ink-q", btn);

  const partEls = Array.from(stage.querySelectorAll<SVGCircleElement>(".ink-part"));
  const blob = stage.querySelector(".ink-blob") as SVGCircleElement;
  const dropper = stage.querySelector(".ink-dropper") as SVGGElement;
  const left = stage.querySelector(".ink-left") as SVGGElement;
  const right = stage.querySelector(".ink-right") as SVGGElement;
  const btbEls = Array.from(stage.querySelectorAll<SVGCircleElement>(".ink-btb"));
  const vin = stage.querySelector(".ink-vin") as SVGCircleElement;

  type Phase = "idle" | "ink" | "inkDone" | "vin" | "vinRun" | "done";
  let phase: Phase = "idle";

  function inkTick(i: number): void {
    const t = i / N_TICK;
    blob.setAttribute("r", (10 + 48 * t).toFixed(1));
    blob.setAttribute("opacity", (0.9 - 0.75 * t).toFixed(2));
    partEls.forEach((c, k) => {
      const p = parts[k];
      const u = Math.max(0, Math.min(1, (t - p.delay) / (1 - p.delay)));
      const e = 1 - Math.pow(1 - u, 2);
      c.setAttribute("cx", (DROP.x + (p.x - DROP.x) * e + (rnd() - 0.5) * 2).toFixed(1));
      c.setAttribute("cy", (DROP.y + (p.y - DROP.y) * e + (rnd() - 0.5) * 2).toFixed(1));
      c.setAttribute("opacity", u > 0 ? "0.85" : "0");
    });
    if (i >= N_TICK) {
      phase = "inkDone";
      dropper.style.transform = "translate(0, -60px)";
      dropper.style.opacity = "0";
      goals.collect("ink", "고르게 퍼짐!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "젓지 않았는데 잉크가 <b>물 전체로 고르게</b> 퍼졌어요. 다음은 접시 실험이에요.";
      btn.textContent = "접시 실험으로";
      btn.disabled = false;
      return;
    }
    tm.later(() => inkTick(i + 1), 190);
  }

  function vinTick(i: number): void {
    // 가까운 방울부터 노랗게 — 거리 24 고리는 5틱, 46 고리는 11틱부터
    btbEls.forEach((c, k) => {
      const b = btb[k];
      const at = b.d < 30 ? 5 + (k % 3) : 11 + (k % 4);
      if (i >= at) c.setAttribute("fill", M3.yellow);
    });
    if (i >= 16) {
      phase = "done";
      goals.collect("vin", "가까운 곳부터!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "<b>가까운 방울부터</b> 차례로 노랗게 변했어요. 뚜껑을 덮어 바람도 없었죠.";
      tm.later(askWhy, 600);
      return;
    }
    tm.later(() => vinTick(i + 1), 200);
  }

  function askWhy(): void {
    slot.ask(
      "잉크와 식초가 <b>저절로 퍼진</b> 까닭은?",
      [
        { t: "입자가 스스로 끊임없이 움직여서", ok: true },
        { t: "물과 접시가 빨아들여서", ok: false },
        { t: "누가 젓거나 바람이 불어서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 입자가 <b>스스로 쉬지 않고 운동</b>해서 퍼진 거예요. 빨아들인 게 아니에요."
          : "젓지도 불지도 않았고 빨아들인 것도 아니에요. 입자가 <b>스스로 끊임없이 움직여</b> 퍼졌어요.";
        goals.collect("judge", ok ? "정확한 판정!" : "판정 완료");
      },
    );
  }

  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    haptic(HAPTIC.tap);
    if (phase === "idle") {
      phase = "ink";
      btn.disabled = true;
      btn.textContent = "잉크가 퍼지는 중…";
      dropper.style.opacity = "1";
      dropper.style.transform = "translate(0, 0)";
      helper.innerHTML = "잉크를 천천히 넣었어요. 물은 가만히 두고 지켜보세요.";
      tm.later(() => inkTick(0), 500);
    } else if (phase === "inkDone") {
      phase = "vin";
      left.style.display = "none";
      right.style.display = "";
      right.setAttribute("opacity", "1");
      btn.textContent = "식초 떨어뜨리기";
      helper.innerHTML = "<b>BTB 용액</b> 방울을 늘어놓은 접시예요. 식초를 만나면 <b>노랗게</b> 변해요.";
    } else if (phase === "vin") {
      phase = "vinRun";
      btn.disabled = true;
      btn.textContent = "관찰 중…";
      vin.setAttribute("opacity", "1");
      helper.innerHTML = "가운데에 식초 한 방울. 어느 방울부터 변할까요?";
      tm.later(() => vinTick(0), 400);
    }
  });

  host.append(goals.chips, helper, board, slot.el);

  api.setCTA("잉크를 넣어 실험을 시작하세요", { enabled: false });
  return () => tm.clear();
};
