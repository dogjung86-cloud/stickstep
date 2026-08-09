// hookBio4 — 중1 Ⅱ v3 훅 8장면. hook.ts가 scene 이름으로 위임한다.
// 장면: breadfactory(L2 빵 공장) · waterlens(L3 물방울 돋보기) · blooddrop(L4 피 한 방울) ·
//       brickhouse(L5 블록 집) · dokdofriends(L6 독도의 생물) · martshelf(L8 마트 진열대) ·
//       mushroomscan(L9 버섯 스캔) · beegone(L10 꿀벌이 사라진 마트)
// 공용 규칙: 예측은 반드시 hookAsk.ask()(choices[0]=정답, good≠bad), 소재명은 도입에서 소개.
// 스타일은 styles/bio4-hook.css(.hb4- 접두).

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";

type Face = (kind: "smile" | "surprised" | "curious") => void;
interface HookLike {
  choices?: string[];
}

/** 구현 전 공용 스켈레톤 — 장면이 완성되면 하나씩 실제 구현으로 교체한다. */
function sceneStub(label: string) {
  return (scene: HTMLElement, helper: HTMLElement, _s: HookLike, finish: () => void, face: Face): void => {
    helper.innerHTML = `${label} 장면 — 제작 중이에요.`;
    const b = el("button", { class: "hook-choice", text: "계속하기" });
    b.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      face("smile");
      finish();
    });
    scene.appendChild(el("div", { class: "hook-choices show" }, b));
  };
}

/** L2 breadfactory — 빵 공장 단면. 시설 3곳(출입문과 벽·중앙 통제실·발전기)을 탭해 켜면
 *  "세포에도 이런 시설이 있을까?" 예측으로 이어진다. 교과서 '해 보기'(공장 비유) 소재 차용. */
export function renderBreadFactory(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hb4-stage hb4-bf" });
  fig.innerHTML = `
  <svg viewBox="0 0 320 216" fill="none" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="빵 공장 단면 — 시설 세 곳을 탭해 보세요">
    <defs>
      <linearGradient id="hb4bfWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFFBF2"/><stop offset="1" stop-color="#F6EBD6"/>
      </linearGradient>
    </defs>
    <ellipse cx="160" cy="204" rx="140" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <path d="M8 56 L160 16 L312 56 Z" fill="#E8B04B" stroke="#A8762A" stroke-width="3" stroke-linejoin="round"/>
    <rect x="252" y="22" width="17" height="26" rx="3" fill="#C9CDD2" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M258 16 c3 -5 8 -5 10 -1" stroke="#B9C2CC" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <rect x="16" y="56" width="288" height="140" rx="8" fill="url(#hb4bfWall)" stroke="#A8762A" stroke-width="3"/>
    <line x1="112" y1="56" x2="112" y2="196" stroke="#D8C6A4" stroke-width="3"/>
    <line x1="208" y1="56" x2="208" y2="196" stroke="#D8C6A4" stroke-width="3"/>

    <g class="hb4-bf-room" data-r="door" role="button" tabindex="0" aria-label="출입문과 벽 켜기">
      <rect class="bf-glow" x="19" y="59" width="90" height="134" rx="6" fill="#FFD8A8" opacity="0"/>
      <rect x="30" y="168" width="22" height="16" rx="3" fill="#D9B678" stroke="#A9854A" stroke-width="2"/>
      <rect x="34" y="152" width="22" height="16" rx="3" fill="#E8CB92" stroke="#A9854A" stroke-width="2"/>
      <rect x="58" y="108" width="44" height="86" rx="4" fill="#FFF3DE" stroke="#A8762A" stroke-width="2.6"/>
      <rect class="bf-doorL" x="60" y="110" width="20" height="82" rx="3" fill="#C97F3D" stroke="#8A5220" stroke-width="2.2"/>
      <rect class="bf-doorR" x="80" y="110" width="20" height="82" rx="3" fill="#C97F3D" stroke="#8A5220" stroke-width="2.2"/>
      <circle cx="76" cy="152" r="2.4" fill="#5C3A16"/><circle cx="84" cy="152" r="2.4" fill="#5C3A16"/>
      <g class="bf-sack">
        <path d="M30 128 c0 -10 16 -10 16 0 v14 c0 6 -16 6 -16 0 Z" fill="#F4E3C2" stroke="#A9854A" stroke-width="2"/>
        <path d="M34 124 l3 -6 M42 124 l-3 -6" stroke="#A9854A" stroke-width="2" stroke-linecap="round"/>
      </g>
      <text x="64" y="78" text-anchor="middle" font-size="12.5" font-weight="800" fill="#6B4F2E">출입문과 벽</text>
    </g>

    <g class="hb4-bf-room" data-r="ctrl" role="button" tabindex="0" aria-label="중앙 통제실 켜기">
      <rect class="bf-glow" x="115" y="59" width="90" height="134" rx="6" fill="#D3F9E4" opacity="0"/>
      <rect x="128" y="104" width="64" height="44" rx="6" fill="#3E4C5C" stroke="#2A3542" stroke-width="2.6"/>
      <rect class="bf-screen" x="134" y="110" width="52" height="32" rx="3" fill="#26303C"/>
      <path class="bf-graph" d="M138 134 l10 -8 l8 4 l10 -12 l12 6" stroke="#12B886" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0"/>
      <rect x="152" y="148" width="16" height="10" fill="#4E5968"/>
      <rect x="134" y="158" width="52" height="10" rx="4" fill="#C9CDD2" stroke="#8B95A1" stroke-width="2"/>
      <text x="160" y="78" text-anchor="middle" font-size="12.5" font-weight="800" fill="#2F5B4A">중앙 통제실</text>
    </g>

    <g class="hb4-bf-room" data-r="gen" role="button" tabindex="0" aria-label="발전기 켜기">
      <rect class="bf-glow" x="211" y="59" width="90" height="134" rx="6" fill="#FFF3BF" opacity="0"/>
      <circle cx="256" cy="148" r="28" fill="#EDF1F5" stroke="#8B95A1" stroke-width="3"/>
      <g class="bf-blades">
        <path d="M256 148 L256 124 M256 148 L277 160 M256 148 L235 160" stroke="#5A6B7F" stroke-width="5" stroke-linecap="round"/>
      </g>
      <circle cx="256" cy="148" r="6" fill="#5A6B7F"/>
      <path class="bf-bolt" d="M262 88 l-12 20 h9 l-8 18 l19 -24 h-9 l8 -14 Z" fill="#FFD43B" stroke="#E8A80C" stroke-width="2" stroke-linejoin="round"/>
      <text x="256" y="78" text-anchor="middle" font-size="12.5" font-weight="800" fill="#8A6D1A">발전기</text>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "공장 단면이에요. <b>세 시설을 각각 탭</b>해서 가동해 보세요 — 무슨 일을 하는 곳인지 느낌이 올 거예요.";

  const MSG: Record<string, string> = {
    door: "출입문 개방! 밀가루가 <b>들어오고</b> 빵이 <b>나가요</b>. 벽은 공장 안을 지키죠.",
    ctrl: "통제실 가동! 모니터가 켜지고 <b>생산 과정을 조절</b>해요.",
    gen: "발전기 가동! 기계를 돌릴 <b>에너지</b>를 만들어요.",
  };
  const onCnt = new Set<string>();
  const rooms = [...fig.querySelectorAll<SVGGElement>(".hb4-bf-room")];
  const turnOn = (g: SVGGElement): void => {
    const r = g.dataset.r ?? "";
    if (onCnt.has(r)) return;
    onCnt.add(r);
    g.classList.add("on");
    haptic(HAPTIC.tap);
    helper.innerHTML = MSG[r] ?? "";
    if (onCnt.size === 1) face("curious");
    if (onCnt.size === rooms.length) {
      face("surprised");
      helper.innerHTML = "세 시설 모두 가동! 그런데 궁금해요 — 눈에 안 보이게 작은 <b>세포</b> 속에도, 이런 시설이 있을까요?";
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "비슷한 역할을 맡은 부품들이 세포 속에 있다",
          "세포는 속이 빈 주머니라 아무것도 없다",
          "공장 같은 구조는 사람이 만든 것에만 있다",
        ],
        good: "바로 그 직감! 세포 속엔 <b>문·통제실·발전기</b> 역할을 맡은 부품이 하나하나 들어 있어요 — 이름을 알아보러 가요.",
        bad: "직접 보면 놀랄걸요? 그 작은 세포 속에도 <b>문·통제실·발전기</b> 역할의 부품이 다 갖춰져 있답니다. 이름을 알아보러 가요!",
        onDone: finish,
      });
    }
  };
  rooms.forEach((g) => {
    g.addEventListener("click", () => turnOn(g));
    g.addEventListener("keydown", (e) => {
      const k = e as KeyboardEvent;
      if (k.key === " " || k.key === "Enter") {
        k.preventDefault();
        turnOn(g);
      }
    });
  });
}
/** L3 waterlens — 책 위 물방울이 글자를 확대하는 발견. 물방울을 떨어뜨려 보고
 *  "세포를 크게 보려면 무엇이 필요할까" 예측으로 잇는다(원리 심화는 중2 빛 단원 몫 — 도구 연결만). */
export function renderWaterLens(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hb4-stage hb4-wl", attrs: { role: "button", tabindex: "0", "aria-label": "책 위에 물방울 떨어뜨리기" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="hb4wlDrop" cx="0.35" cy="0.3" r="1">
        <stop offset="0" stop-color="#EAF6FF"/><stop offset="0.6" stop-color="#BEE3FF" stop-opacity="0.85"/><stop offset="1" stop-color="#74B9F0" stop-opacity="0.9"/>
      </radialGradient>
    </defs>
    <ellipse cx="160" cy="182" rx="130" ry="9" fill="#2A3A5E" opacity="0.10"/>
    <path d="M32 60 C90 44 150 44 160 52 C170 44 230 44 288 60 L288 168 C230 152 170 152 160 160 C150 152 90 152 32 168 Z"
      fill="#FFFEF8" stroke="#C9BFa2" stroke-width="3" stroke-linejoin="round"/>
    <line x1="160" y1="52" x2="160" y2="160" stroke="#E3DAC0" stroke-width="2.4"/>
    <g stroke="#8B95A1" stroke-width="3" stroke-linecap="round" opacity="0.75">
      <path d="M48 76 h92 M48 90 h86 M48 104 h92 M48 118 h78 M48 132 h90 M48 146 h64"/>
      <path d="M180 76 h92 M180 90 h84 M180 104 h60"/>
      <path d="M180 132 h88 M180 146 h70"/>
    </g>
    <g class="wl-drop">
      <circle cx="223" cy="115" r="30" fill="url(#hb4wlDrop)" stroke="#5BA8E8" stroke-width="2.6"/>
      <ellipse cx="212" cy="103" rx="9" ry="5.5" fill="#FFFFFF" opacity="0.75" transform="rotate(-24 212 103)"/>
      <g stroke="#333D4B" stroke-width="6.5" stroke-linecap="round">
        <path d="M204 106 h38"/>
        <path d="M204 120 h30"/>
      </g>
    </g>
    <g class="wl-pipette">
      <path d="M242 18 l14 14 M256 32 l-8 8 -14 -14 Z" fill="#C9CDD2" stroke="#6B7684" stroke-width="2.4" stroke-linejoin="round"/>
      <circle class="wl-bead" cx="236" cy="48" r="5" fill="#74B9F0"/>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "펼쳐진 책 위에 스포이트가 준비돼 있어요. <b>탭해서 물 한 방울</b>을 떨어뜨려 볼까요?";

  let dropped = false;
  let timer = 0;
  const doDrop = (): void => {
    if (dropped) return;
    dropped = true;
    haptic(HAPTIC.tap);
    fig.classList.add("dropped");
    timer = window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "우와 — 물방울 아래 글자만 <b>불쑥 커 보여요</b>! 그럼 글자보다 훨씬 작은 <b>세포</b>를 보려면, 무엇이 필요할까요?";
      timer = window.setTimeout(() => {
        face("curious");
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "빛을 모아 크게 보여 주는 도구, 현미경",
            "아주 밝은 손전등",
            "눈을 최대한 가까이 대고 보기",
          ],
          good: "맞아요! 물방울처럼 <b>빛을 모아 확대하는 장치</b>를 정밀하게 다듬은 것이 <b>현미경</b>이에요. 오늘 직접 다뤄 봐요.",
          bad: "밝게 비추거나 가까이 봐도 0.1 mm보다 작은 건 안 보여요 — 물방울처럼 <b>빛을 모아 확대하는</b> 도구, <b>현미경</b>이 필요하답니다.",
          onDone: finish,
        });
      }, 1100);
    }, 700);
  };
  fig.addEventListener("click", doDrop);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      doDrop();
    }
  });
  return () => window.clearTimeout(timer);
}
/** L4 blooddrop — 손끝의 피 한 방울을 확대경으로 들여다보면 붉은 원반이 우글우글.
 *  "피가 빨간 까닭"을 예측으로 잇는다(적혈구 = 세포 소개의 문). */
export function renderBloodDrop(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hb4-stage hb4-bd", attrs: { role: "button", tabindex: "0", "aria-label": "핏방울에 확대경 대기" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hb4bdFinger" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FFE9D6"/><stop offset="1" stop-color="#FFD9B8"/>
      </linearGradient>
    </defs>
    <ellipse cx="120" cy="192" rx="120" ry="9" fill="#2A3A5E" opacity="0.10"/>
    <path d="M28 210 L28 120 C28 96 44 82 66 82 C88 82 102 96 102 120 L102 210"
      fill="url(#hb4bdFinger)" stroke="#D9A06B" stroke-width="3"/>
    <path d="M50 96 C56 90 66 88 74 90" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" opacity="0.6"/>
    <path d="M56 110 c1.5 8 8 10 10 10 c-3 2 -8 6 -8 10" stroke="#E8B88A" stroke-width="2" fill="none" opacity="0.7"/>
    <path class="bd-blood" d="M65 74 c0 -7 8 -16 8 -16 c0 0 8 9 8 16 a8 8 0 0 1 -16 0 Z" fill="#E03131" stroke="#C92A2A" stroke-width="2"/>
    <g class="bd-lens">
      <circle cx="216" cy="96" r="62" fill="#FFF5F5" stroke="#E03131" stroke-width="3.4"/>
      <g class="bd-cells">
        <ellipse cx="192" cy="76" rx="15" ry="12" fill="#FFA8A8" stroke="#E03131" stroke-width="2.4"/>
        <ellipse cx="192" cy="75" rx="7" ry="5" fill="#F03E3E" opacity="0.45"/>
        <ellipse cx="232" cy="70" rx="14" ry="11" fill="#FFA8A8" stroke="#E03131" stroke-width="2.4" transform="rotate(18 232 70)"/>
        <ellipse cx="233" cy="69" rx="6.5" ry="4.5" fill="#F03E3E" opacity="0.45" transform="rotate(18 232 70)"/>
        <ellipse cx="210" cy="108" rx="16" ry="12.5" fill="#FFA8A8" stroke="#E03131" stroke-width="2.4" transform="rotate(-12 210 108)"/>
        <ellipse cx="210" cy="107" rx="7.5" ry="5.2" fill="#F03E3E" opacity="0.45" transform="rotate(-12 210 108)"/>
        <ellipse cx="246" cy="112" rx="13" ry="10.5" fill="#FFA8A8" stroke="#E03131" stroke-width="2.4" transform="rotate(24 246 112)"/>
        <ellipse cx="246" cy="111" rx="6" ry="4.2" fill="#F03E3E" opacity="0.45" transform="rotate(24 246 112)"/>
        <ellipse cx="182" cy="118" rx="12" ry="9.5" fill="#FFA8A8" stroke="#E03131" stroke-width="2.4" transform="rotate(-28 182 118)"/>
        <ellipse cx="222" cy="132" rx="11" ry="9" fill="#FFA8A8" stroke="#E03131" stroke-width="2.4" transform="rotate(8 222 132)"/>
      </g>
      <path d="M186 58 C196 48 212 44 226 46" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
      <line x1="258" y1="142" x2="286" y2="176" stroke="#B54708" stroke-width="9" stroke-linecap="round"/>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "예방 주사를 맞고 난 손끝에 <b>피 한 방울</b>이 또르르. 아깝지만… 관찰 찬스! <b>확대경을 탭</b>해 볼까요?";

  let zoomed = false;
  let timer = 0;
  const doZoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.tap);
    fig.classList.add("zoomed");
    timer = window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "우와, <b>붉은 원반</b>이 우글우글! 그렇다면 — 피가 빨간 까닭은 무엇일까요?";
      timer = window.setTimeout(() => {
        face("curious");
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "빨간 원반 모양의 세포가 가득 들어 있어서",
            "피라는 액체 자체가 빨간 잉크 같아서",
            "혈관이 빨간색이라 물들어서",
          ],
          good: "맞아요! 피 한 방울에도 <b>수억 개의 붉은 원반 세포</b>가 들어 있어요 — 이름은 <b>적혈구</b>. 왜 하필 이 모양인지 알아보러 가요.",
          bad: "피에서 세포를 걸러 내면 남는 액체는 <b>노르스름</b>해요 — 빨강의 정체는 액체가 아니라 <b>붉은 원반 세포(적혈구)</b>랍니다. 왜 이 모양인지 알아보러 가요!",
          onDone: finish,
        });
      }, 1100);
    }, 650);
  };
  fig.addEventListener("click", doZoom);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      doZoom();
    }
  });
  return () => window.clearTimeout(timer);
}
/** L5 brickhouse — 블록으로 꽃 조립하기(교과서 도입 소재 차용). 탭할 때마다
 *  블록 더미 → 부품 → 완성 꽃으로 조립 단계가 올라가고, "세포가 모이면?" 예측으로 잇는다. */
export function renderBrickHouse(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hb4-stage hb4-bh", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 블록 조립하기" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="160" cy="192" rx="120" ry="9" fill="#2A3A5E" opacity="0.10"/>
    <g class="bh-st bh-st0">
      <g stroke="#C2255C" stroke-width="2.4">
        <rect x="66" y="120" width="30" height="18" rx="4" fill="#FAA2C1"/>
        <rect x="110" y="140" width="30" height="18" rx="4" fill="#FAA2C1"/>
        <rect x="88" y="158" width="30" height="18" rx="4" fill="#FAA2C1"/>
        <rect x="150" y="118" width="30" height="18" rx="4" fill="#FAA2C1"/>
      </g>
      <g stroke="#2B8A3E" stroke-width="2.4">
        <rect x="196" y="132" width="30" height="18" rx="4" fill="#8CE99A"/>
        <rect x="226" y="156" width="30" height="18" rx="4" fill="#8CE99A"/>
        <rect x="172" y="158" width="30" height="18" rx="4" fill="#8CE99A"/>
      </g>
      <circle cx="242" cy="118" r="11" fill="#FFD43B" stroke="#E8A80C" stroke-width="2.4"/>
    </g>
    <g class="bh-st bh-st1">
      <g stroke="#C2255C" stroke-width="2.4">
        <rect x="78" y="84" width="30" height="18" rx="4" fill="#FAA2C1" transform="rotate(-18 93 93)"/>
        <rect x="108" y="70" width="30" height="18" rx="4" fill="#FAA2C1" transform="rotate(12 123 79)"/>
        <rect x="140" y="82" width="30" height="18" rx="4" fill="#FAA2C1" transform="rotate(38 155 91)"/>
        <rect x="104" y="98" width="30" height="18" rx="4" fill="#FAA2C1" transform="rotate(64 119 107)"/>
      </g>
      <circle cx="124" cy="92" r="10" fill="#FFD43B" stroke="#E8A80C" stroke-width="2.4"/>
      <g stroke="#2B8A3E" stroke-width="2.6">
        <rect x="196" y="96" width="14" height="52" rx="5" fill="#8CE99A"/>
        <rect x="184" y="146" width="14" height="34" rx="5" fill="#8CE99A" transform="rotate(34 191 163)"/>
      </g>
    </g>
    <g class="bh-st bh-st2">
      <g stroke="#C2255C" stroke-width="2.4">
        <rect x="145" y="34" width="30" height="18" rx="4" fill="#FAA2C1" transform="rotate(-90 160 43)"/>
        <rect x="130" y="52" width="30" height="18" rx="4" fill="#FAA2C1" transform="rotate(-35 145 61)"/>
        <rect x="160" y="52" width="30" height="18" rx="4" fill="#FAA2C1" transform="rotate(35 175 61)"/>
        <rect x="134" y="76" width="30" height="18" rx="4" fill="#FAA2C1" transform="rotate(215 149 85)"/>
        <rect x="156" y="76" width="30" height="18" rx="4" fill="#FAA2C1" transform="rotate(-215 171 85)"/>
      </g>
      <circle cx="160" cy="66" r="12" fill="#FFD43B" stroke="#E8A80C" stroke-width="2.4"/>
      <rect x="153" y="92" width="14" height="58" rx="5" fill="#8CE99A" stroke="#2B8A3E" stroke-width="2.6"/>
      <rect x="140" y="120" width="14" height="30" rx="5" fill="#8CE99A" stroke="#2B8A3E" stroke-width="2.6" transform="rotate(40 147 135)"/>
      <path d="M128 150 h64 l-8 38 h-48 Z" fill="#E8B04B" stroke="#A8762A" stroke-width="2.8" stroke-linejoin="round"/>
    </g>
  </svg>`;
  const cap = el("div", { class: "hb4-bh-cap", text: "탭해서 조립! (3번)" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, cap, choicesBox);
  helper.innerHTML = "탁자 위에 <b>블록</b>이 잔뜩 흩어져 있어요. <b>탭해서</b> 무언가를 만들어 볼까요?";

  let stage = 0;
  const CAPS = ["블록들이 모여 꽃잎과 줄기 부품이 됐어요! 한 번 더!", "부품이 모여 — 짠, 화분 위 꽃 완성!"];
  const advance = (): void => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.tap);
    fig.dataset.st = String(stage);
    if (stage === 1) {
      helper.innerHTML = CAPS[0];
      cap.textContent = "탭해서 조립! (1번 더)";
    } else {
      face("surprised");
      helper.innerHTML = CAPS[1];
      cap.remove();
      window.setTimeout(() => {
        face("curious");
        helper.innerHTML = "블록 여러 개가 모여 꽃잎이 되고, 꽃잎과 줄기가 모여 꽃이 됐죠. 그럼 우리 몸에서 <b>세포 여러 개가 모이면</b> 무엇이 될까요?";
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "모양과 하는 일이 비슷한 세포끼리 모인 덩어리가 된다",
            "세포들이 녹아서 큰 세포 하나가 된다",
            "모여도 아무 일도 일어나지 않는다",
          ],
          good: "바로 그 직감! 그 덩어리의 이름이 <b>조직</b>이에요 — 조직이 모이면 또 무엇이 될까요? 계단을 직접 쌓으며 확인해요.",
          bad: "세포는 녹아 합쳐지지 않아요 — 각자 살아 있는 채로 <b>비슷한 것끼리 모여 덩어리(조직)</b>를 이루죠. 그다음 계단은 직접 쌓으며 확인해요!",
          onDone: finish,
        });
      }, 1200);
    }
  };
  fig.addEventListener("click", advance);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      advance();
    }
  });
}
export const renderDokdoFriends = sceneStub("독도의 생물");
export const renderMartShelf = sceneStub("마트 진열대");
export const renderMushroomScan = sceneStub("버섯 스캔");
export const renderBeeGone = sceneStub("꿀벌이 사라진 마트");

// ask는 실제 장면 구현에서 사용한다 — 스텁 단계 미사용 경고 방지용 재수출.
export { ask as _hb4Ask };
