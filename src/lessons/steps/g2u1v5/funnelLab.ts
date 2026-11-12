// [중2 Ⅰ v5] g2u1l7 분별 깔때기 랩: 「두 층을 어떻게 따로 받을까요?」
// 책의 해 보기(물과 식용유 혼합물 분리하기)를 손으로 한다: 분별 깔때기에서 두 층으로 나뉜 혼합물의 아래층은 꼭지로, 위층은 입구로 받는다.
// 학생이 정하는 것: 마개와 꼭지를 여는 차례, 꼭지를 잠그는 때, 남은 위층을 받는 길.
// 실패하는 길: 마개를 닫은 채 꼭지를 열면 액체가 내려오지 않는다 / 경계를 지나쳐 계속 받으면 비커 (가)에 식용유가 섞인다 / 위층을 꼭지로 받으면 꼭지에 남은 물과 섞인다.
// 통찰 하나: 섞이지 않는 두 액체는 밀도가 큰 쪽이 아래층에 놓이므로 아래층과 위층을 따로 받아 나눌 수 있다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn } from "../bio6/b6Lab";
import { P, clamp, fx, g1Hold, g1Lab, g1Log, g1Row, svgOpen, type G1Step } from "./g2u1Kit";

const CX = 96;
const TOP = 46; // 처음 액체의 윗면
const MID = 100; // 처음 두 층의 경계
const END = 150; // 깔때기 몸통의 아래 끝
const WATER = END - MID; // 아래층을 다 받는 데 내려가야 하는 길이

export const g2u1FunnelLab: StepRenderer = (host, step, api) => {
  const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 2, cls: "g2u1x-fn" });
  const { f, tm } = lab;
  const body = `M${CX - 9} 30 V40 C ${CX - 46} 52 ${CX - 46} 92 ${CX - 30} 112 L${CX - 5} ${END} H${CX + 5} L${CX + 30} 112 C ${CX + 46} 92 ${CX + 46} 52 ${CX + 9} 40 V30 Z`;
  f.stage.innerHTML = `${svgOpen}
    <defs><clipPath id="g2u1xFnClip"><path d="${body}"/></clipPath></defs>
    <path d="M30 14 V212 M14 212 h70" stroke="#59657A" stroke-width="5" stroke-linecap="round"/>
    <path d="M30 78 H${CX - 40}" stroke="#59657A" stroke-width="4" stroke-linecap="round"/>
    <g clip-path="url(#g2u1xFnClip)">
      <rect class="g2u1x-fn-oil" x="${CX - 50}" y="${TOP}" width="100" height="${MID - TOP}" fill="${P.oil}" opacity=".8"/>
      <rect class="g2u1x-fn-water" x="${CX - 50}" y="${MID}" width="100" height="${END - MID + 4}" fill="${P.water}" opacity=".7"/>
    </g>
    <path d="${body}" stroke="${P.glass}" stroke-width="2.2"/>
    <rect class="g2u1x-fn-stop" x="${CX - 11}" y="18" width="22" height="14" rx="4" fill="#8B9BB0" stroke="#C8D2DE" stroke-width="1.2"/>
    <path d="M${CX - 5} ${END} V172 M${CX + 5} ${END} V172" stroke="${P.glass}" stroke-width="2"/>
    <rect class="g2u1x-fn-tap" x="${CX - 15}" y="${END + 5}" width="30" height="7" rx="3.5" fill="#C8D2DE"/>
    <path class="g2u1x-fn-drip" d="M${CX} 172 V188" stroke="${P.water}" stroke-width="3.4" stroke-linecap="round" opacity="0"/>
    <rect class="g2u1x-fn-a-w" x="${CX - 27}" y="212" width="54" height="0" fill="${P.water}" opacity=".7"/>
    <rect class="g2u1x-fn-a-o" x="${CX - 27}" y="212" width="54" height="0" fill="${P.oil}" opacity=".8"/>
    <path d="M${CX - 30} 184 V208 a6 6 0 0 0 6 6 h48 a6 6 0 0 0 6 -6 V184" stroke="${P.glass}" stroke-width="2.2"/>
    <text x="${CX + 46}" y="206" font-size="12.5" font-weight="800" fill="${P.text}">(가)</text>
    <rect class="g2u1x-fn-b-o" x="213" y="212" width="54" height="0" fill="${P.oil}" opacity=".8"/>
    <rect class="g2u1x-fn-b-w" x="213" y="212" width="54" height="0" fill="${P.water}" opacity=".7"/>
    <path d="M210 168 V208 a6 6 0 0 0 6 6 h48 a6 6 0 0 0 6 -6 V168" stroke="${P.glass}" stroke-width="2.2"/>
    <text x="286" y="206" font-size="12.5" font-weight="800" fill="${P.text}">(나)</text>
    <text class="g2u1x-fn-ol" x="${CX + 52}" y="${(TOP + MID) / 2 + 4}" font-size="12.5" font-weight="700" fill="${P.oil}">식용유</text>
    <text class="g2u1x-fn-wl" x="${CX + 52}" y="${(MID + END) / 2 + 4}" font-size="12.5" font-weight="700" fill="${P.water}">물</text>
  </svg>`;
  const log = g1Log(lab, "r");
  const q = <T extends Element>(s: string): T => f.stage.querySelector(s) as T;
  const oil = q<SVGRectElement>(".g2u1x-fn-oil");
  const water = q<SVGRectElement>(".g2u1x-fn-water");
  const stop = q<SVGRectElement>(".g2u1x-fn-stop");
  const tap = q<SVGRectElement>(".g2u1x-fn-tap");
  const drip = q<SVGPathElement>(".g2u1x-fn-drip");
  const aW = q<SVGRectElement>(".g2u1x-fn-a-w");
  const aO = q<SVGRectElement>(".g2u1x-fn-a-o");
  const bO = q<SVGRectElement>(".g2u1x-fn-b-o");
  const bW = q<SVGRectElement>(".g2u1x-fn-b-w");
  const oilTag = q<SVGTextElement>(".g2u1x-fn-ol");
  const waterTag = q<SVGTextElement>(".g2u1x-fn-wl");

  let open = false; // 마개
  let s = 0; // 꼭지로 내려보낸 길이(px). WATER가 되면 경계가 꼭지에 닿는다
  let phase: "drain" | "upper" | "fail" | "end" = "drain";
  let poured = 0; // 위층을 (나)에 따른 정도(0~1)
  let flowing = false;

  const setRect = (r: SVGRectElement, y: number, h: number): void => {
    r.setAttribute("y", fx(y));
    r.setAttribute("height", fx(Math.max(0, h)));
  };
  function paint(): void {
    const top = TOP + s * 0.62 + poured * (END - TOP);
    const mid = Math.min(END + 4, MID + s);
    setRect(oil, top, mid - top);
    setRect(water, mid, END + 4 - mid);
    const wA = Math.min(s, WATER) * 0.4;
    const oA = Math.max(0, s - WATER) * 0.4;
    setRect(aW, 212 - wA, wA);
    setRect(aO, 212 - wA - oA, oA);
    setRect(bO, 212 - poured * 22, poured * 22);
    stop.setAttribute("transform", open ? "translate(26 -10) rotate(24 " + CX + " 25)" : "");
    tap.setAttribute("transform", flowing ? `rotate(90 ${CX} ${END + 8.5})` : "");
    drip.setAttribute("opacity", flowing && open ? "1" : "0");
    drip.setAttribute("stroke", s > WATER ? P.oil : P.water);
    log.set([`마개 <b class="${open ? "" : "w"}">${open ? "열림" : "닫힘"}</b>`, `꼭지 <b>${flowing ? "열림" : "잠김"}</b>`]);
    waterTag.setAttribute("opacity", s >= WATER - 4 ? "0" : "1");
    oilTag.setAttribute("opacity", poured > 0.5 || s > WATER + 7 ? "0" : "1");
    host.dataset.g2u1Fn = fx(s, 0);
  }

  const bStop = bvBtn("", "마개 열기");
  bStop.dataset.k = "stop";
  bStop.addEventListener("click", () => {
    if (phase !== "drain" && phase !== "upper") return;
    haptic(HAPTIC.tap);
    open = !open;
    bStop.textContent = open ? "마개 닫기" : "마개 열기";
    paint();
    if (phase === "drain") {
      f.say(open ? "마개를 열었어요. 이제 <b>꼭지를 꾹 눌러</b> 아래층을 비커 (가)에 받아요. 경계에서 손을 떼요." : "마개를 닫았어요.");
      lab.todo(open ? ".g2u1x-hold" : "[data-k='stop']");
    }
  });
  const hold = g1Hold(lab, "꾹 눌러 꼭지 열기", (ms) => {
    if (phase !== "drain") return false;
    flowing = true;
    if (!open) {
      host.dataset.g2u1Fail = "stop";
      haptic(HAPTIC.wrong);
      paint();
      f.say("꼭지를 열어도 액체가 <b>내려오지 않아요</b>. 마개가 닫혀 있어 공기가 들어갈 길이 없어요.");
      tm.later(() => {
        flowing = false;
        paint();
      }, 500);
      return false;
    }
    s += (ms / 3600) * WATER;
    paint();
    if (s >= WATER - 2) lab.todo("[data-k='pour']");
    if (s > WATER + 7) {
      phase = "fail";
      flowing = false;
      host.dataset.g2u1Fail = "over";
      haptic(HAPTIC.wrong);
      paint();
      f.say("경계를 지나쳐 <b>식용유까지</b> 비커 (가)에 내려왔어요. 두 액체가 다시 섞였어요.");
      f.slot.setControls(bReset);
      api.setCTA("처음부터 다시 해 보세요", { enabled: false });
      lab.todo("[data-k='reset']");
      return false;
    }
    return true;
  });
  const release = (): void => {
    if (phase !== "drain" || !flowing) return;
    flowing = false;
    paint();
    if (!open) return;
    if (s < WATER - 4) f.say("아직 아래층의 <b>물이 남아</b> 있어요. 경계가 꼭지에 닿을 때까지 더 받아요.");
    else {
      phase = "upper";
      haptic(HAPTIC.correct);
      f.pips(1);
      hold.disabled = true;
      bTap.disabled = false;
      bPour.disabled = false;
      f.say("경계에서 꼭지를 잠갔어요. 비커 (가)에는 <b>물</b>만 모였어요. 남은 위층은 어디로 받을까요?");
      api.setCTA("남은 위층을 받아 보세요", { enabled: false });
      lab.todo("[data-k='pour']");
    }
  };
  hold.addEventListener("pointerup", release);
  hold.addEventListener("pointercancel", release);
  hold.addEventListener("keyup", release);

  const bTap = bvBtn("", "꼭지로 받기");
  bTap.dataset.k = "tap";
  const bPour = bvBtn("", "입구로 따르기");
  bPour.dataset.k = "pour";
  bTap.disabled = bPour.disabled = true;
  bTap.addEventListener("click", () => {
    if (phase !== "upper") return;
    haptic(HAPTIC.wrong);
    host.dataset.g2u1Fail = "tap";
    setRect(bW, 209, 3);
    f.say("꼭지와 관에 <b>남아 있던 물</b>이 식용유에 섞여 나와요. 위층은 위쪽 입구로 따라야 깨끗해요.");
    bTap.disabled = true;
  });
  bPour.addEventListener("click", () => {
    if (phase !== "upper") return;
    phase = "end";
    haptic(HAPTIC.tap);
    bTap.disabled = bPour.disabled = bStop.disabled = true;
    setRect(bW, 212, 0);
    let k = 0;
    const tick = (): void => {
      k += 1;
      poured = clamp(k / 14);
      paint();
      if (poured < 1) tm.later(tick, 60);
      else {
        f.say("비커 (가)에는 <b>물</b>, 비커 (나)에는 <b>식용유</b>가 따로 모였어요.");
        tm.later(ask, 1000);
      }
    };
    tick();
  });
  const bReset = bvBtn("main", "깔때기를 다시 채우기");
  bReset.dataset.k = "reset";
  bReset.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    s = 0;
    open = false;
    phase = "drain";
    bStop.textContent = "마개 열기";
    start();
  });
  function start(): void {
    paint();
    hold.disabled = false;
    f.slot.setControls(g1Row(bStop), hold, g1Row(bTap, bPour));
    f.say("물과 식용유가 두 층으로 나뉘었어요. <b>마개</b>와 <b>꼭지</b>를 다뤄 아래층만 비커 (가)에 받아 보세요.");
    api.setCTA("아래층을 비커 (가)에 받아 보세요", { enabled: false });
    lab.todo("[data-k='stop']");
  }
  function ask(): void {
    lab.judge(
      "꼭지로 <b>먼저</b> 받은 액체와 그 까닭은?",
      [{ t: "물, 밀도가 더 커서 아래층에 있어서", ok: true }, { t: "식용유, 밀도가 더 커서 아래층에 있어서" }, { t: "물, 식용유보다 양이 많아서" }],
      "물(1.00)이 식용유(약 0.91)보다 밀도가 커서 <b>아래층</b>에 놓였어요.",
      () => lab.finish("섞이지 않는 두 액체는 밀도가 <b>큰</b> 쪽이 아래층에 놓여요. 아래층은 꼭지로, 위층은 입구로 받아 나눠요. 이 기구가 <b>분별 깔때기</b>예요."),
    );
  }
  start();
  return lab.cleanup;
};
