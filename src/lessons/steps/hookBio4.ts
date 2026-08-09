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
export const renderWaterLens = sceneStub("물방울 돋보기");
export const renderBloodDrop = sceneStub("피 한 방울");
export const renderBrickHouse = sceneStub("블록 집");
export const renderDokdoFriends = sceneStub("독도의 생물");
export const renderMartShelf = sceneStub("마트 진열대");
export const renderMushroomScan = sceneStub("버섯 스캔");
export const renderBeeGone = sceneStub("꿀벌이 사라진 마트");

// ask는 실제 장면 구현에서 사용한다 — 스텁 단계 미사용 경고 방지용 재수출.
export { ask as _hb4Ask };
