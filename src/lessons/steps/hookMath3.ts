// hookMath3, Ⅲ 좌표평면과 그래프 훅 장면 9종. hookMath.ts의 mathHook이 디스패치한다.
// 장면 계약: (scene, helper, finish, face, choices?), 공용 hookAsk.ask()만 사용,
// choices[0]=정답, good≠bad(오개념 교정), 소재명·설정은 도입(helper/narrator)에서 소개.
// 조작 먼저 → 예측 나중(VII 훅 통일 패턴). 상태 변화는 인라인 스타일 트랜지션 + setTimeout(rAF 금지).
// SVG 파운드리 문법: 3스톱 그라데이션 면 + 좌상단 키라이트 + 접촉 그림자(#2A3A5E) + 재질별 최암색 외곽선.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type SceneFn = (scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]) => void;

/* 파운드리 문법 공용 조각 (hookMath.ts와 동일 문법, 소유 분리 때문에 자체 정의) */
const SHADOW = (cx: number, cy: number, rx: number, o = 0.11): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="#2A3A5E" opacity="${o}"/>`;

const wrapSvg = (inner: string, defs = "", vb = "0 0 360 200"): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none"><defs>${defs}</defs>${inner}</svg>`;

const mkBtn = (label: string, pulse = true): HTMLButtonElement =>
  el("button", { class: `swapbtn${pulse ? " pulse" : ""}`, attrs: { type: "button" } }, el("span", { text: label }));

/** 손그림 스틱맨(머리+한 획 몸통), 밤 장면 stargaze 문법: 머리는 fill, 포즈는 path 하나. */
const stick = (x: number, y: number, s: number, pose: string, color = "#243040"): string =>
  `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="-26" r="7.2" fill="${color}"/>
    <path d="${pose}" stroke="${color}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>`;
const POSE_WAVE = "M0 -19 V4 M0 -13 L-9 -3 M0 -14 L10 -24 M0 4 L-7 18 M0 4 L7 18";
const POSE_SIT = "M0 -19 V0 M0 -12 L-9 -3 M0 -12 L9 -3 M0 0 L10 2 L10 14 M0 0 L-4 14";

/* ── 1 cinema, 불 꺼진 영화관(순서쌍) ──────────────────────── */
export const renderCinema: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const seatX = (s: number): number => 62 + (s - 1) * 24; // s: 1..10(번)
  const rowY = (r: number): number => 50 + (r - 1) * 15; // r: 1..7(열), 1열이 스크린 앞
  let seats = "";
  for (let r = 1; r <= 7; r++)
    for (let s = 1; s <= 10; s++)
      seats += `<rect x="${seatX(s)}" y="${rowY(r)}" width="18" height="10" rx="3" fill="#2C3E5C" stroke="#1E2C44" stroke-width="1"/>`;
  const myX = seatX(4) + 9; // 7열 4번
  const myY = rowY(7) + 5;
  const otherX = seatX(7) + 9; // 4열 7번(뒤바꿔 앉은 관객)
  const otherY = rowY(4) + 5;
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 196, 96)}
    <rect x="28" y="6" width="304" height="188" rx="16" fill="url(#cn-rm)" stroke="#0B1524" stroke-width="1.8"/>
    <path d="M74 16 H286 L276 38 H84 Z" fill="url(#cn-sc)" stroke="#5E7290" stroke-width="1.2"/>
    <ellipse cx="130" cy="22" rx="30" ry="4" fill="#fff" opacity=".3"/>
    ${seats}
    <g class="cn-spot" style="opacity:0; transition: opacity .5s ease">
      <path d="M${myX} ${myY} L${myX - 34} 194 L${myX + 34} 194 Z" fill="#FFE9A0" opacity=".18"/>
      <rect x="${seatX(4) - 2}" y="${rowY(7) - 2}" width="22" height="14" rx="4" fill="none" stroke="#2AC8B4" stroke-width="2.4"/>
      <rect x="${seatX(4)}" y="${rowY(7)}" width="18" height="10" rx="3" fill="#2AC8B4"/>
    </g>
    <g class="cn-other" style="opacity:0; transition: opacity .5s ease">
      <rect x="${seatX(7) - 2}" y="${rowY(4) - 2}" width="22" height="14" rx="4" fill="none" stroke="#F2789A" stroke-width="2.2"/>
      <circle cx="${otherX}" cy="${otherY - 8}" r="5.5" fill="#39424E"/>
    </g>
    <g transform="rotate(-6 292 172)">
      <rect x="252" y="160" width="80" height="26" rx="7" fill="url(#cn-tk)" stroke="#C4B48A" stroke-width="1.3"/>
      <circle cx="264" cy="173" r="3.4" fill="#F6F1E4" stroke="#C4B48A" stroke-width="1"/>
      <text x="298" y="177" text-anchor="middle" font-size="12.5" font-weight="900" fill="#5E4E2A">7열 4번</text>
    </g>
    <ellipse cx="70" cy="16" rx="16" ry="4" fill="#fff" opacity=".12"/>`,
    `<linearGradient id="cn-rm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22334E"/><stop offset=".5" stop-color="#16233A"/><stop offset="1" stop-color="#0E1828"/></linearGradient>
    <linearGradient id="cn-sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF2FA"/><stop offset=".6" stop-color="#BBD0E6"/><stop offset="1" stop-color="#93AECB"/></linearGradient>
    <linearGradient id="cn-tk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFBEE"/><stop offset="1" stop-color="#EFE4C4"/></linearGradient>`,
  );
  const btn = mkBtn("자리 찾기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "티켓엔 <b>7열 4번</b>. 스크린에서 일곱째 줄, 왼쪽에서 네 번째 자리예요. 불빛으로 찾아 볼까요?";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".cn-spot") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("surprised");
      (fig.querySelector(".cn-other") as SVGGElement).style.opacity = "1";
      helper.innerHTML = "찾았어요! 그런데 저기, <b>4열 7번</b>에 앉은 관객이 보여요. 4와 7, 숫자는 같은데… 같은 자리일까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "다른 자리예요, 두 수는 순서가 중요해요",
            "같은 자리예요, 숫자가 같으니까요",
            "번호 하나만 맞으면 같은 자리예요",
          ],
          good: "맞아요! <b>(7열, 4번)과 (4열, 7번)은 완전히 다른 자리</b>죠. 두 수를 순서대로 짝 지은 것, 그게 오늘 배울 순서쌍이에요.",
          bad: "숫자 4와 7이 똑같아도 <b>순서가 다르면 다른 자리</b>예요. 7열 4번 손님이 4열 7번에 앉으면 자리 주인이 곤란해지겠죠! 순서가 생명인 두 수의 짝, 그게 오늘의 주인공이에요.",
          onDone: finish,
        });
      }, 800);
    }, 700);
  });
};

/* ── 2 sos, 바다 한가운데 조난 신호(기준선과 부호) ──────────── */
export const renderSos: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 196, 96)}
    <rect x="28" y="6" width="304" height="66" rx="16" fill="url(#ss-sky)" stroke="#B98A5E" stroke-width="0"/>
    <rect x="28" y="64" width="304" height="130" rx="16" fill="url(#ss-sea)" stroke="#0B3A54" stroke-width="0"/>
    <rect x="28" y="6" width="304" height="188" rx="16" fill="none" stroke="#0B3A54" stroke-width="1.8"/>
    <circle cx="286" cy="34" r="14" fill="url(#ss-sun)"/>
    <path d="M40 96 q20 -6 40 0 t40 0 M240 150 q20 -6 40 0 t30 0 M60 168 q16 -5 32 0" stroke="#EAF6FF" stroke-width="1.6" opacity=".25" stroke-linecap="round"/>
    <g class="ss-grid" style="opacity:0; transition: opacity .8s ease">
      <path d="M28 100 H332 M28 130 H332 M28 160 H332" stroke="#EAF6FF" stroke-width="1" stroke-dasharray="5 7" opacity=".3"/>
      <path d="M100 64 V194 M180 64 V194 M260 64 V194" stroke="#EAF6FF" stroke-width="1" stroke-dasharray="5 7" opacity=".3"/>
    </g>
    <g class="ss-ring" style="opacity:0">
      <circle class="ss-r1" cx="150" cy="112" r="10" stroke="#7FE0D2" stroke-width="2.4" opacity=".9" style="transition: r 1.4s ease-out, opacity 1.4s ease-out"/>
      <circle class="ss-r2" cx="150" cy="112" r="10" stroke="#7FE0D2" stroke-width="2" opacity=".9" style="transition: r 1.4s ease-out .45s, opacity 1.4s ease-out .45s"/>
    </g>
    <g>
      ${SHADOW(150, 136, 34, 0.2)}
      <path d="M118 124 L182 124 L170 138 L130 138 Z" fill="url(#ss-hull)" stroke="#6E3F16" stroke-width="1.5"/>
      <rect x="147" y="96" width="4" height="28" fill="#8A5A2E"/>
      <path d="M151 98 L170 106 L151 112 Z" fill="url(#ss-flag)" stroke="#B03A54" stroke-width="1.2"/>
      ${stick(136, 122, 0.72, POSE_WAVE, "#243040")}
    </g>
    <g class="ss-tag" style="opacity:0; transform: translateY(8px); transition: opacity .5s ease, transform .5s cubic-bezier(.34,1.35,.5,1)">
      <rect x="96" y="146" width="132" height="24" rx="12" fill="#FFFFFF" stroke="#C6D2DE" stroke-width="1.2"/>
      <text x="162" y="162" text-anchor="middle" font-size="12" font-weight="900" fill="#0A5E8C">북위 37° · 동경 132°</text>
    </g>
    <g class="ss-heli" style="transform: translate(120px, -60px); transition: transform 1.1s cubic-bezier(.3,.9,.4,1)">
      <rect x="236" y="30" width="42" height="18" rx="9" fill="url(#ss-hl)" stroke="#8A2F42" stroke-width="1.4"/>
      <path d="M236 40 L214 46 L236 46 Z" fill="url(#ss-hl)" stroke="#8A2F42" stroke-width="1.2"/>
      <circle cx="268" cy="39" r="4.5" fill="#DFF0FA" stroke="#8A2F42" stroke-width="1.2"/>
      <path d="M234 26 H282" stroke="#39424E" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M255 30 V26" stroke="#39424E" stroke-width="2"/>
      <ellipse cx="240" cy="30" rx="5" ry="2" fill="#fff" opacity=".4"/>
    </g>`,
    `<linearGradient id="ss-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9C4"/><stop offset=".6" stop-color="#FFD1A0"/><stop offset="1" stop-color="#F2AE7E"/></linearGradient>
    <linearGradient id="ss-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3F9CC8"/><stop offset=".5" stop-color="#1E6E9E"/><stop offset="1" stop-color="#10486E"/></linearGradient>
    <radialGradient id="ss-sun" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#FFF3D6"/><stop offset="1" stop-color="#FFC46E"/></radialGradient>
    <linearGradient id="ss-hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8A45E"/><stop offset=".5" stop-color="#C87F3A"/><stop offset="1" stop-color="#9C5E24"/></linearGradient>
    <linearGradient id="ss-flag" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF8FA8"/><stop offset="1" stop-color="#E85C7E"/></linearGradient>
    <linearGradient id="ss-hl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF7E96"/><stop offset=".55" stop-color="#E84A68"/><stop offset="1" stop-color="#C43050"/></linearGradient>`,
  );
  const btn = mkBtn("조난 신호 보내기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "망망대해에서 보트 엔진이 멈췄어요. 섬 이름도 도로명 주소도 없는 바다, 구조대에 내 위치를 어떻게 알리죠?";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const ring = fig.querySelector(".ss-ring") as SVGGElement;
    ring.style.opacity = "1";
    for (const [cls, r] of [["ss-r1", 120], ["ss-r2", 120]] as [string, number][]) {
      const c = fig.querySelector(`.${cls}`) as SVGCircleElement;
      window.setTimeout(() => {
        c.setAttribute("r", String(r));
        c.style.opacity = "0";
      }, 60);
    }
    (fig.querySelector(".ss-grid") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      const tag = fig.querySelector(".ss-tag") as SVGGElement;
      tag.style.opacity = "1";
      tag.style.transform = "translateY(0)";
      haptic(HAPTIC.tap);
    }, 700);
    window.setTimeout(() => {
      (fig.querySelector(".ss-heli") as SVGGElement).style.transform = "translate(0, 0)";
      face("surprised");
      helper.innerHTML = "신호에 담긴 건 단 두 수, <b>북위 37도 · 동경 132도</b>. 헬기가 정확히 날아왔어요! 비결이 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "기준선에서 어느 쪽으로 얼마나 갔는지를 수로 약속했어요",
            "구조대가 바다 전체를 다 뒤졌어요",
            "가까운 섬 이름을 말했어요",
          ],
          good: "정확해요! 적도와 본초 자오선이라는 <b>기준선</b>을 정해 두면, 북쪽인지 남쪽인지(방향)와 얼마나 갔는지(수)만으로 지구 어디든 콕 집어요. 오늘 이 아이디어로 평면의 네 구역을 탐사해요.",
          bad: "바다엔 섬도 표지판도 없었어요. 비결은 <b>기준선</b>이에요. 적도에서 북쪽으로 37, 자오선에서 동쪽으로 132처럼 '기준에서 어느 쪽으로 얼마나'를 수로 약속하면 지구 어디든 한 번에 찾아요!",
          onDone: finish,
        });
      }, 900);
    }, 1200);
  });
};

/* ── 3 views, 조회수 같은 두 영상(그래프의 힘) ──────────────── */
export const renderViews: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const card = (x: number, thumb: string, chart: string, cls: string): string =>
    `<g>
      ${SHADOW(x + 58, 186, 52, 0.12)}
      <rect x="${x}" y="22" width="116" height="156" rx="13" fill="url(#vw-cd)" stroke="#D5DDE6" stroke-width="1.4"/>
      <rect x="${x + 10}" y="32" width="96" height="54" rx="8" fill="url(#${thumb})" stroke="#39424E" stroke-width="1.2"/>
      <path d="M${x + 52} 51 l14 8 -14 8 z" fill="#FFFFFF" opacity=".92"/>
      <rect x="${x + 10}" y="94" width="72" height="7" rx="3.5" fill="#C6D2DE"/>
      <rect x="${x + 10}" y="105" width="48" height="7" rx="3.5" fill="#DFE6EE"/>
      <text x="${x + 10}" y="130" font-size="13" font-weight="900" fill="#1E2A38">조회수 100만</text>
      <g class="${cls}" style="opacity:0; transition: opacity .7s ease">
        <path d="M${x + 12} 168 H${x + 104} M${x + 12} 168 V138" stroke="#AEBBc8" stroke-width="1.4" stroke-linecap="round"/>
        <path d="${chart}" stroke="url(#vw-ln)" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      </g>
    </g>`;
  const x1 = 46;
  const x2 = 198;
  // A: 갈수록 가파르게(지금 뜨는 중), B: 초반 반짝 후 평평
  const chartA = `M${x1 + 14} 166 Q${x1 + 46} 162 ${x1 + 66} 154 Q${x1 + 88} 145 ${x1 + 100} 128`;
  const chartB = `M${x2 + 14} 166 Q${x2 + 22} 142 ${x2 + 38} 138 Q${x2 + 66} 132 ${x2 + 100} 131`;
  fig.innerHTML = wrapSvg(
    card(x1, "vw-t1", chartA, "vw-g1") + card(x2, "vw-t2", chartB, "vw-g2"),
    `<linearGradient id="vw-cd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF3F8"/></linearGradient>
    <linearGradient id="vw-t1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#52CCE4"/><stop offset=".55" stop-color="#0DA5C6"/><stop offset="1" stop-color="#077E9C"/></linearGradient>
    <linearGradient id="vw-t2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B9A6F2"/><stop offset=".55" stop-color="#8A6EE0"/><stop offset="1" stop-color="#6A55F2"/></linearGradient>
    <linearGradient id="vw-ln" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#F2789A"/><stop offset="1" stop-color="#D93E62"/></linearGradient>`,
  );
  const btn = mkBtn("통계 열어 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "두 영상 모두 조회수 <b>100만</b>! 그런데 채널 주인은 왼쪽 영상만 보고 \"이건 지금 뜨는 중\"이라고 했어요.";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".vw-g1") as SVGGElement).style.opacity = "1";
    (fig.querySelector(".vw-g2") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "시간에 따른 조회수 그래프가 열렸어요. 숫자는 둘 다 100만인데, 주인은 뭘 보고 알았을까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "그래프의 모양이요, 왼쪽은 갈수록 가파르게 오르고 있거든요",
            "썸네일 색깔이 더 예뻐서요",
            "영상 길이가 더 길어서요",
          ],
          good: "바로 그래프예요! 조회수 숫자는 '지금까지 합계'만 말하지만, <b>그래프는 변화의 역사</b>를 통째로 보여줘요. 갈수록 가파르게 오르는 선, 그게 뜨는 영상의 증거죠.",
          bad: "썸네일도 길이도 '지금 얼마나 빠르게 크는지'는 알려주지 못해요. 답은 <b>그래프의 모양</b>, 왼쪽 선은 갈수록 가파르게 오르는 중이었거든요. 변화를 한눈에 담는 그림, 오늘의 주인공이에요!",
          onDone: finish,
        });
      }, 800);
    }, 900);
  });
};

/* ── 4 wheel, 대관람차 한 바퀴(주기 그래프) ─────────────────── */
export const renderWheel: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const CX = 104;
  const CY = 92;
  const R = 56;
  let spokes = "";
  let cabins = "";
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    const x = CX + R * Math.sin(a);
    const y = CY - R * Math.cos(a);
    spokes += `<path d="M${CX} ${CY} L${x.toFixed(1)} ${y.toFixed(1)}" stroke="#8A97A8" stroke-width="2"/>`;
    cabins += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7.5" fill="${i === 4 ? "url(#fw-me)" : "url(#fw-cb)"}" stroke="${i === 4 ? "#0A7E8C" : "#8A5E16"}" stroke-width="1.4"/>`;
  }
  fig.innerHTML = wrapSvg(
    `${SHADOW(104, 186, 58, 0.13)}${SHADOW(268, 186, 56, 0.09)}
    <path d="M${CX - 26} 184 L${CX} ${CY} L${CX + 26} 184" stroke="url(#fw-lg)" stroke-width="7" stroke-linecap="round"/>
    <g class="fw-rot" style="transform-origin:${CX}px ${CY}px; transition: transform 3s cubic-bezier(.45,.05,.55,.95)">
      <circle cx="${CX}" cy="${CY}" r="${R}" stroke="#AEB9C8" stroke-width="3.4"/>
      ${spokes}${cabins}
    </g>
    <circle cx="${CX}" cy="${CY}" r="6" fill="url(#fw-hub)" stroke="#5E6C7C" stroke-width="1.4"/>
    <ellipse cx="${CX - 2}" cy="${CY - 2}" rx="2" ry="1.4" fill="#fff" opacity=".6"/>
    <path d="M196 40 V162 H336" stroke="#8CA0B3" stroke-width="2" stroke-linecap="round"/>
    <text x="330" y="176" text-anchor="end" font-size="11" font-weight="800" fill="#64748B">시간</text>
    <text x="196" y="32" font-size="11" font-weight="800" fill="#64748B">높이</text>
    <path class="fw-wave" d="" stroke="url(#fw-wv)" stroke-width="2.8" stroke-linecap="round" fill="none" style="opacity:0; transition: opacity .6s ease"/>`,
    `<linearGradient id="fw-lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C2CCD8"/><stop offset="1" stop-color="#8C99A8"/></linearGradient>
    <radialGradient id="fw-cb" cx=".38" cy=".3" r=".95"><stop offset="0" stop-color="#FFE9A0"/><stop offset="1" stop-color="#F2B430"/></radialGradient>
    <radialGradient id="fw-me" cx=".38" cy=".3" r=".95"><stop offset="0" stop-color="#7FE0D2"/><stop offset="1" stop-color="#12A5B4"/></radialGradient>
    <radialGradient id="fw-hub" cx=".38" cy=".3" r=".95"><stop offset="0" stop-color="#EAF0F8"/><stop offset="1" stop-color="#9AA8BA"/></radialGradient>
    <linearGradient id="fw-wv" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#52CCE4"/><stop offset="1" stop-color="#0A87A3"/></linearGradient>`,
  );
  const btn = mkBtn("관람차 돌리기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "민트색 곤돌라가 <b>내 자리</b>예요. 대관람차는 한 바퀴에 <b>20분</b>, 쉬지 않고 돌아요. 일단 돌려 볼까요?";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".fw-rot") as SVGGElement).style.transform = "rotate(720deg)";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "빙글빙글, 오르락내리락. 내 <b>높이</b>를 시간에 따라 그래프로 그리면 어떤 그림이 나올까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "오르락내리락하는 물결이 계속 반복돼요",
            "쭉 올라가기만 하는 직선이에요",
            "높이가 그대로인 수평선이에요",
          ],
          good: "맞아요! 올라갔다 내려오기를 한 바퀴(20분)마다 되풀이하니 <b>물결처럼 반복되는 그래프</b>가 돼요. 거꾸로, 반복되는 그래프를 보면 '뭔가 돌고 있구나'도 읽어낼 수 있죠.",
          bad: "관람차는 꼭대기를 지나면 다시 내려와요. 그래서 높이 그래프는 <b>물결처럼 오르내리기를 반복</b>해요. 반복 그래프를 보면 거꾸로 '돌고 있다'는 것까지 읽어낼 수 있답니다!",
          onDone: () => {
            // 예측 확인 뒤 실제 물결을 그려 보여준다(코사인 샘플 폴리라인).
            let d = "";
            for (let i = 0; i <= 48; i++) {
              const x = 208 + (i / 48) * 120;
              const y = 100 - 44 * Math.cos((Math.PI * 2 * i) / 24) * -1; // 바닥에서 출발해 오르내림
              d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
            }
            const wave = fig.querySelector(".fw-wave") as SVGPathElement;
            wave.setAttribute("d", d);
            wave.style.opacity = "1";
            finish();
          },
        });
      }, 700);
    }, 3150);
  });
};

/* ── 5 thunder, 번개와 천둥 사이(정비례 미리보기) ───────────── */
export const renderThunder: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  let counts = "";
  for (let i = 1; i <= 5; i++)
    counts += `<g class="th-c${i}" style="opacity:0; transform: translateY(6px); transition: opacity .3s ease, transform .3s cubic-bezier(.34,1.35,.5,1)">
      <circle cx="${120 + (i - 1) * 30}" cy="60" r="12" fill="url(#th-ct)" stroke="#0A7E8C" stroke-width="1.4"/>
      <text x="${120 + (i - 1) * 30}" y="65" text-anchor="middle" font-size="13" font-weight="900" fill="#FFFFFF">${i}</text>
    </g>`;
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="188" rx="16" fill="url(#th-sky)" stroke="#0B1524" stroke-width="1.8"/>
    <g class="th-shake" style="transition: transform .1s ease">
      <path d="M28 170 H332" stroke="#101A2C" stroke-width="2"/>
      <rect x="52" y="140" width="34" height="30" fill="#101A2C"/>
      <path d="M48 140 L69 124 L90 140 Z" fill="#101A2C"/>
      <rect x="62" y="152" width="9" height="12" fill="#FFD44A" opacity=".85"/>
      <rect x="252" y="128" width="22" height="42" fill="#101A2C"/>
      <rect x="282" y="140" width="26" height="30" fill="#101A2C"/>
      <rect x="256" y="134" width="5" height="6" fill="#FFD44A" opacity=".7"/><rect x="265" y="146" width="5" height="6" fill="#FFD44A" opacity=".6"/>
      <path d="M186 170 v-18 m0 0 q-10 -4 -8 -16 q10 4 8 16 m0 -6 q10 -6 9 -18 q-11 5 -9 18" stroke="#101A2C" stroke-width="3" stroke-linecap="round"/>
    </g>
    <ellipse cx="90" cy="34" rx="34" ry="15" fill="url(#th-cl)" stroke="#39424E" stroke-width="1.3"/>
    <ellipse cx="120" cy="28" rx="26" ry="12" fill="url(#th-cl)" stroke="#39424E" stroke-width="1.2"/>
    <ellipse cx="76" cy="26" rx="9" ry="4" fill="#fff" opacity=".2"/>
    <g class="th-bolt" style="opacity:0; transition: opacity .12s ease">
      <path d="M96 44 L82 84 L94 84 L74 130 L106 78 L92 78 L108 44 Z" fill="url(#th-bt)" stroke="#B98A00" stroke-width="1.4"/>
    </g>
    <rect class="th-flash" x="28" y="6" width="304" height="188" rx="16" fill="#FFFFFF" opacity="0" style="transition: opacity .1s ease"/>
    ${counts}
    <g class="th-rumble" style="opacity:0; transition: opacity .3s ease">
      <rect x="216" y="96" width="88" height="24" rx="12" fill="#FFFFFF" stroke="#C6D2DE" stroke-width="1.2"/>
      <text x="260" y="112" text-anchor="middle" font-size="12.5" font-weight="900" fill="#5E4E2A">우르릉…!</text>
    </g>`,
    `<linearGradient id="th-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A3A5E"/><stop offset=".55" stop-color="#1A2740"/><stop offset="1" stop-color="#121C30"/></linearGradient>
    <linearGradient id="th-cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A97AC"/><stop offset="1" stop-color="#5A6880"/></linearGradient>
    <linearGradient id="th-bt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3C4"/><stop offset=".5" stop-color="#FFD44A"/><stop offset="1" stop-color="#F2A81D"/></linearGradient>
    <radialGradient id="th-ct" cx=".38" cy=".3" r=".95"><stop offset="0" stop-color="#52CCE4"/><stop offset="1" stop-color="#0DA5C6"/></radialGradient>`,
  );
  const btn = mkBtn("번개 기다리기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "폭풍우 치는 밤이에요. 빛은 거의 즉시 도착하지만 <b>소리는 1초에 약 340 m</b>를 달려와요. 번쩍하면 초를 세어 봐요!";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const bolt = fig.querySelector(".th-bolt") as SVGGElement;
    const flash = fig.querySelector(".th-flash") as SVGRectElement;
    bolt.style.opacity = "1";
    flash.style.opacity = "0.55";
    window.setTimeout(() => {
      flash.style.opacity = "0";
    }, 140);
    window.setTimeout(() => {
      bolt.style.opacity = "0";
    }, 900);
    for (let i = 1; i <= 5; i++)
      window.setTimeout(() => {
        const c = fig.querySelector(`.th-c${i}`) as SVGGElement;
        c.style.opacity = "1";
        c.style.transform = "translateY(0)";
        haptic(HAPTIC.tap);
      }, 500 + i * 430);
    window.setTimeout(() => {
      (fig.querySelector(".th-rumble") as SVGGElement).style.opacity = "1";
      const sh = fig.querySelector(".th-shake") as SVGGElement;
      sh.style.transform = "translateX(2.5px)";
      window.setTimeout(() => (sh.style.transform = "translateX(-2.5px)"), 110);
      window.setTimeout(() => (sh.style.transform = "translateX(0)"), 220);
      haptic(HAPTIC.cross);
    }, 500 + 5 * 430 + 500);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "<b>5초</b> 뒤 우르릉, 번개는 약 1700 m 밖에서 쳤네요. 다음 번개는 <b>10초</b> 뒤에 들렸다면, 거리는 아까의 몇 배일까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "2배요, 시간이 2배면 거리도 2배니까",
            "똑같아요, 번개는 늘 같은 거리에서 쳐요",
            "4배요, 소리는 갈수록 빨라지니까",
          ],
          good: "정확해요! 소리는 1초에 340 m씩 <b>일정하게</b> 달려요. 시간이 2배면 달려온 거리도 정확히 2배(3400 m)죠. '2배가 2배를 부르는' 관계, 오늘의 주인공이에요.",
          bad: "소리의 빠르기는 일정해요(1초에 약 340 m). 그러니 걸린 시간이 2배면 달려온 거리도 <b>정확히 2배</b>가 되죠. 2배가 2배를 부르는 관계, 그게 오늘 배울 정비례의 씨앗이에요!",
          onDone: finish,
        });
      }, 800);
    }, 500 + 5 * 430 + 1300);
  });
};

/* ── 6 download, 남은 시간의 비밀(직선의 예측력) ────────────── */
export const renderDownload: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 점 5개: 받은 용량이 시간에 정비례(직선 배열), 이후 점선 연장 → 완료 지점
  const dots = [0, 1, 2, 3, 4].map((i) => ({ x: 72 + i * 36, y: 178 - i * 13 }));
  const extX = 316;
  const extY = 178 - ((extX - 72) / 36) * 13; // 직선 연장의 끝(y = 완료 높이)
  let dotSvg = "";
  dots.forEach((p, i) => {
    dotSvg += `<circle class="dl-d${i}" cx="${p.x}" cy="${p.y}" r="4.6" fill="url(#dl-dt)" stroke="#0A7E8C" stroke-width="1.4" style="opacity:0; transition: opacity .25s ease, transform .3s cubic-bezier(.34,1.35,.5,1); transform: scale(.4); transform-origin:${p.x}px ${p.y}px"/>`;
  });
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 196, 96, 0.1)}
    <rect x="44" y="10" width="272" height="86" rx="13" fill="url(#dl-win)" stroke="#C6D2DE" stroke-width="1.4"/>
    <circle cx="60" cy="24" r="3.4" fill="#F2789A"/><circle cx="72" cy="24" r="3.4" fill="#FFD44A"/><circle cx="84" cy="24" r="3.4" fill="#7FE0A0"/>
    <rect x="60" y="40" width="240" height="16" rx="8" fill="#E4EBF3" stroke="#C6D2DE" stroke-width="1"/>
    <rect x="60" y="40" width="103" height="16" rx="8" fill="url(#dl-bar)"/>
    <ellipse cx="80" cy="43.5" rx="14" ry="2.4" fill="#fff" opacity=".45"/>
    <text x="60" y="80" font-size="13" font-weight="900" fill="#1E2A38">43%</text>
    <text x="300" y="80" text-anchor="end" font-size="13" font-weight="900" fill="#0A87A3">남은 시간 6분</text>
    <path d="M56 190 H332 M56 190 V110" stroke="#8CA0B3" stroke-width="2" stroke-linecap="round"/>
    <text x="326" y="187" text-anchor="end" font-size="10.5" font-weight="800" fill="#64748B">시간</text>
    <text x="60" y="108" font-size="10.5" font-weight="800" fill="#64748B">받은 용량</text>
    ${dotSvg}
    <path class="dl-ext" d="M${dots[4].x} ${dots[4].y} L${extX} ${extY.toFixed(1)}" stroke="#F2789A" stroke-width="2.4" stroke-dasharray="6 6" stroke-linecap="round" style="opacity:0; transition: opacity .6s ease"/>
    <g class="dl-goal" style="opacity:0; transform: translateY(6px); transition: opacity .4s ease, transform .4s cubic-bezier(.34,1.35,.5,1)">
      <circle cx="${extX}" cy="${extY.toFixed(1)}" r="6" fill="url(#dl-gl)" stroke="#B03A54" stroke-width="1.5"/>
      <rect x="${extX - 74}" y="${(extY + 10).toFixed(1)}" width="66" height="20" rx="10" fill="#FFFFFF" stroke="#C6D2DE" stroke-width="1.1"/>
      <text x="${extX - 41}" y="${(extY + 24).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="900" fill="#B03A54">완료 지점!</text>
    </g>`,
    `<linearGradient id="dl-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF3F8"/></linearGradient>
    <linearGradient id="dl-bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#52CCE4"/><stop offset="1" stop-color="#0DA5C6"/></linearGradient>
    <radialGradient id="dl-dt" cx=".38" cy=".3" r=".95"><stop offset="0" stop-color="#7FE0D2"/><stop offset="1" stop-color="#12A5B4"/></radialGradient>
    <radialGradient id="dl-gl" cx=".38" cy=".3" r=".95"><stop offset="0" stop-color="#FF8FA8"/><stop offset="1" stop-color="#E85C7E"/></radialGradient>`,
  );
  const btn = mkBtn("받은 용량 기록하기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "게임 업데이트 중이에요. 진행 바 옆에 <b>남은 시간 6분</b>이 떠 있죠. 컴퓨터가 미래를 보는 걸까요? 1분마다 받은 용량을 그래프에 기록해 봐요.";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    for (let i = 0; i < 5; i++)
      window.setTimeout(() => {
        const d = fig.querySelector(`.dl-d${i}`) as SVGCircleElement;
        d.style.opacity = "1";
        d.style.transform = "scale(1)";
        haptic(HAPTIC.tap);
      }, 200 + i * 340);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "점들이 <b>곧게 한 줄</b>로 섰어요! 이 점들로 '다 받는 순간'을 미리 알 수 있을까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "점들을 잇는 직선을 쭉 연장하면 완료 지점이 보여요",
            "알 수 없어요, 미래는 기록에 없으니까",
            "점을 전부 더하면 돼요",
          ],
          good: "맞아요! 1분에 받는 양이 일정하면 그래프는 <b>곧은 직선</b>, 자를 대고 쭉 연장하면 아직 오지 않은 완료 시각까지 미리 보여요. 직선 그래프의 예측력이죠.",
          bad: "기록엔 없지만 <b>규칙엔 있어요</b>. 1분에 받는 양이 일정해서 점들이 직선 위에 서고, 그 직선을 쭉 연장하면 완료 지점이 미리 보이거든요. 오늘 이 직선의 정체를 밝혀요!",
          onDone: () => {
            (fig.querySelector(".dl-ext") as SVGPathElement).style.opacity = "1";
            const g = fig.querySelector(".dl-goal") as SVGGElement;
            g.style.opacity = "1";
            g.style.transform = "translateY(0)";
            finish();
          },
        });
      }, 800);
    }, 200 + 5 * 340 + 400);
  });
};

/* ── 7 pizza, 초인종과 피자(반비례 미리보기) ────────────────── */
export const renderPizza: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const CX = 180;
  const CY = 96;
  const R = 50;
  // 8조각 웨지: 45도씩, 2명일 때 2색(4+4), 4명일 때 4색(2+2+2+2)
  const colTwo = ["#FFC46E", "#FFC46E", "#FFC46E", "#FFC46E", "#FFDD9C", "#FFDD9C", "#FFDD9C", "#FFDD9C"];
  const colFour = ["#FFC46E", "#FFC46E", "#FFDD9C", "#FFDD9C", "#FFAB5E", "#FFAB5E", "#FFE9C4", "#FFE9C4"];
  let slices = "";
  for (let i = 0; i < 8; i++) {
    const a0 = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    const a1 = a0 + Math.PI / 4;
    const x0 = CX + R * Math.cos(a0);
    const y0 = CY + R * Math.sin(a0);
    const x1 = CX + R * Math.cos(a1);
    const y1 = CY + R * Math.sin(a1);
    const mx = CX + R * 0.62 * Math.cos((a0 + a1) / 2);
    const my = CY + R * 0.62 * Math.sin((a0 + a1) / 2);
    slices += `<path class="pz-s${i}" d="M${CX} ${CY} L${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${colTwo[i]}" stroke="#B96E1E" stroke-width="1.5" style="transition: fill .5s ease"/>
    <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="4" fill="#D9503E" stroke="#9C3020" stroke-width="1" style="pointer-events:none"/>`;
  }
  const eater = (x: number, y: number, cls: string, hidden: boolean, pillAbove = false): string => {
    const py = pillAbove ? y - 52 : y + 26; // 아래줄 인물은 배지를 머리 위로(viewBox 잘림 방지)
    return `<g class="${cls}" style="opacity:${hidden ? 0 : 1}; transform: ${hidden ? "translateY(10px)" : "none"}; transition: opacity .45s ease, transform .45s cubic-bezier(.34,1.35,.5,1)">
      ${SHADOW(x, y + 24, 14, 0.12)}
      ${stick(x, y, 0.8, POSE_SIT)}
      <rect x="${x - 24}" y="${py}" width="48" height="17" rx="8.5" fill="#FFFFFF" stroke="#C6D2DE" stroke-width="1.1"/>
      <text class="pz-cnt" x="${x}" y="${py + 12}" text-anchor="middle" font-size="11" font-weight="900" fill="#B96E1E">4조각</text>
    </g>`;
  };
  fig.innerHTML = wrapSvg(
    `${SHADOW(CX, 166, 70, 0.12)}
    <ellipse cx="${CX}" cy="${CY}" rx="62" ry="62" fill="url(#pz-pan)" stroke="#6E3F16" stroke-width="1.6"/>
    ${slices}
    <ellipse cx="${CX - 20}" cy="${CY - 26}" rx="12" ry="6" fill="#fff" opacity=".28"/>
    ${eater(64, 96, "pz-e1", false)}
    ${eater(296, 96, "pz-e2", false)}
    ${eater(64, 172, "pz-e3", true, true)}
    ${eater(296, 172, "pz-e4", true, true)}
    <g class="pz-bell" style="opacity:0; transition: opacity .3s ease">
      <rect x="140" y="8" width="80" height="22" rx="11" fill="#FFFFFF" stroke="#C6D2DE" stroke-width="1.2"/>
      <text x="180" y="23" text-anchor="middle" font-size="12" font-weight="900" fill="#B03A54">딩동!</text>
    </g>`,
    `<radialGradient id="pz-pan" cx=".4" cy=".32" r="1"><stop offset="0" stop-color="#F2B430"/><stop offset=".8" stop-color="#D98A1E"/><stop offset="1" stop-color="#B96E1E"/></radialGradient>`,
  );
  const btn = mkBtn("친구 들이기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "피자 한 판은 <b>8조각</b>. 둘이 먹으니 한 사람에 <b>4조각</b>씩이에요. 그런데 초인종이 울려요, 친구 둘이 왔대요!";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".pz-bell") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      for (const cls of ["pz-e3", "pz-e4"]) {
        const g = fig.querySelector(`.${cls}`) as SVGGElement;
        g.style.opacity = "1";
        g.style.transform = "translateY(0)";
      }
      haptic(HAPTIC.tap);
    }, 450);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "이제 <b>4명</b>이서 나눠 먹어요. 피자는 그대로 8조각, 내 몫은 어떻게 될까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "절반이 돼요, 4조각에서 2조각으로",
            "그대로 4조각이에요, 먼저 온 사람이 임자니까",
            "1조각이 돼요, 4명이니까 4분의 1로",
          ],
          good: "맞아요! 피자 8조각은 그대로인데 나누는 사람이 2배가 되니 몫은 <b>절반</b>(4조각 → 2조각)이죠. '2배가 절반을 부르는' 관계, 정비례와 정반대인 오늘의 주인공이에요.",
          bad: "다 같이 공평하게 나누기로 했어요. 8조각을 4명이 나누면 8÷4=<b>2조각</b>, 사람이 2배가 되니 몫이 <b>절반</b>이 된 거죠. 2배가 절반을 부르는 관계, 그게 오늘의 주인공이에요!",
          onDone: () => {
            // 4명 배분을 색으로 보여준다
            const colors = colFour;
            for (let i = 0; i < 8; i++) (fig.querySelector(`.pz-s${i}`) as SVGPathElement).style.fill = colors[i];
            fig.querySelectorAll(".pz-cnt").forEach((t) => ((t as SVGTextElement).textContent = "2조각"));
            finish();
          },
        });
      }, 800);
    }, 1100);
  });
};

/* ── 8 seesaw, 시소의 균형술(곱 일정 미리보기) ──────────────── */
export const renderSeesaw: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const PX = 180; // 받침점
  const PY = 140;
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 186, 104, 0.12)}
    <path d="M40 182 H320" stroke="#8CA0B3" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M${PX} ${PY} L${PX - 22} 180 L${PX + 22} 180 Z" fill="url(#sw-ful)" stroke="#5E6C7C" stroke-width="1.5"/>
    <ellipse cx="${PX - 7}" cy="${PY + 12}" rx="4" ry="7" fill="#fff" opacity=".25"/>
    <g class="sw-plank" style="transform-origin:${PX}px ${PY}px; transform: rotate(7deg); transition: transform 1s cubic-bezier(.34,1.35,.5,1)">
      <rect x="${PX - 128}" y="${PY - 9}" width="256" height="10" rx="5" fill="url(#sw-wd)" stroke="#6E3F16" stroke-width="1.4"/>
      <ellipse cx="${PX - 96}" cy="${PY - 6.5}" rx="20" ry="2" fill="#fff" opacity=".3"/>
      ${stick(PX - 120, PY - 14, 0.78, POSE_SIT, "#1E5E8C")}
      ${stick(PX + 60, PY - 18, 1.06, POSE_SIT, "#243040")}
    </g>
    <g class="sw-lbl" style="opacity:0; transition: opacity .6s ease">
      <path d="M${PX} ${PY + 26} H${PX - 120} M${PX} ${PY + 22} v8 M${PX - 120} ${PY + 22} v8" stroke="#0A87A3" stroke-width="1.8"/>
      <rect x="${PX - 78}" y="${PY + 30}" width="40" height="18" rx="9" fill="#FFFFFF" stroke="#C6D2DE" stroke-width="1.1"/>
      <text x="${PX - 58}" y="${PY + 43}" text-anchor="middle" font-size="11" font-weight="900" fill="#0A87A3">2 m</text>
      <path d="M${PX} ${PY + 26} H${PX + 60} M${PX + 60} ${PY + 22} v8" stroke="#B03A54" stroke-width="1.8"/>
      <rect x="${PX + 12}" y="${PY + 30}" width="40" height="18" rx="9" fill="#FFFFFF" stroke="#C6D2DE" stroke-width="1.1"/>
      <text x="${PX + 32}" y="${PY + 43}" text-anchor="middle" font-size="11" font-weight="900" fill="#B03A54">1 m</text>
    </g>
    <g class="sw-w" style="opacity:0; transition: opacity .6s ease">
      <rect x="30" y="52" width="64" height="20" rx="10" fill="#DDF0FF" stroke="#8FC2E8" stroke-width="1.2"/>
      <text x="62" y="66" text-anchor="middle" font-size="11.5" font-weight="900" fill="#0A5E8C">30 kg</text>
      <rect x="246" y="70" width="64" height="20" rx="10" fill="#FFE4EA" stroke="#F2A8B8" stroke-width="1.2"/>
      <text x="278" y="84" text-anchor="middle" font-size="11.5" font-weight="900" fill="#B03A54">60 kg</text>
    </g>`,
    `<linearGradient id="sw-ful" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C2CCD8"/><stop offset="1" stop-color="#8C99A8"/></linearGradient>
    <linearGradient id="sw-wd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8A45E"/><stop offset=".5" stop-color="#C87F3A"/><stop offset="1" stop-color="#9C5E24"/></linearGradient>`,
  );
  const btn = mkBtn("자리 바꿔 앉기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "몸무게 <b>30 kg</b> 동생과 <b>60 kg</b> 아빠가 시소를 타요. 지금은 아빠 쪽으로 기울어 있죠. 동생이 자리를 옮겨 봅니다!";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".sw-w") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      (fig.querySelector(".sw-plank") as SVGGElement).style.transform = "rotate(0deg)";
      haptic(HAPTIC.correct);
    }, 500);
    window.setTimeout(() => {
      (fig.querySelector(".sw-lbl") as SVGGElement).style.opacity = "1";
      face("surprised");
      helper.innerHTML = "수평이 됐어요! 아빠는 중심에서 <b>1 m</b>, 동생은 <b>2 m</b> 거리에 앉았을 때예요. 균형의 비밀은 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "몸무게와 거리의 곱이 같아요, 30×2와 60×1",
            "동생이 순간적으로 힘을 준 거예요",
            "시소가 낡아서 한쪽이 무거워요",
          ],
          good: "정확해요! 시소의 균형은 <b>몸무게×거리의 곱</b>이 정해요. 30×2 = 60×1 = 60으로 똑같죠. 몸무게가 절반이면 거리를 2배로, 곱을 지키는 이 관계가 오늘 배울 곡선의 심장이에요.",
          bad: "힘도 낡음도 아니에요. 비밀은 <b>곱</b>이에요. 30 kg×2 m = 60 kg×1 m = 60으로 똑같거든요! 한쪽이 절반이면 다른 쪽을 2배로, 곱을 일정하게 지키는 관계가 오늘의 주인공이에요.",
          onDone: finish,
        });
      }, 800);
    }, 1600);
  });
};

/* ── 9 quakealert, 흔들림보다 빠른 문자(보스전) ─────────────── */
export const renderQuakealert: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const EX = 84; // 진원
  const EY = 168;
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="114" rx="16" fill="url(#qa-sky)"/>
    <path d="M28 120 H332 V178 q0 16 -16 16 H44 q-16 0 -16 -16 Z" fill="url(#qa-gnd)"/>
    <rect x="28" y="6" width="304" height="188" rx="16" fill="none" stroke="#0B1524" stroke-width="1.8"/>
    <path d="M28 120 H332" stroke="#5E4426" stroke-width="2"/>
    <path d="M${EX} ${EY} l5 -8 l6 9 l7 -6 l-4 10 l9 2 l-9 5 l4 8 l-9 -4 l-3 9 l-4 -9 l-8 4 l4 -9 l-9 -4 l9 -3 l-4 -9 Z" fill="url(#qa-st)" stroke="#B03A54" stroke-width="1.3"/>
    <circle class="qa-p" cx="${EX}" cy="${EY}" r="8" stroke="#52CCE4" stroke-width="2.6" opacity="0" style="transition: r 1.1s linear, opacity 1.15s linear"/>
    <circle class="qa-s" cx="${EX}" cy="${EY}" r="8" stroke="#F2789A" stroke-width="3.4" opacity="0" style="transition: r 2.1s linear, opacity 2.15s linear"/>
    <g class="qa-shake" style="transition: transform .09s ease">
      <rect x="150" y="86" width="18" height="34" fill="url(#qa-tw)" stroke="#39424E" stroke-width="1.3"/>
      <path d="M159 86 V72 M152 78 a9 9 0 0 1 14 0" stroke="#39424E" stroke-width="2" stroke-linecap="round"/>
      <circle cx="159" cy="70" r="2.6" fill="#12A5B4"/>
      <rect x="238" y="76" width="24" height="44" fill="#38465C" stroke="#243040" stroke-width="1.2"/>
      <rect x="268" y="90" width="30" height="30" fill="#42526A" stroke="#243040" stroke-width="1.2"/>
      <rect x="242" y="82" width="6" height="7" fill="#FFD44A" opacity=".8"/><rect x="252" y="94" width="6" height="7" fill="#FFD44A" opacity=".6"/><rect x="274" y="96" width="6" height="6" fill="#FFD44A" opacity=".7"/>
      <text x="159" y="134" text-anchor="middle" font-size="10.5" font-weight="800" fill="#F6EDD8">관측소</text>
      <text x="268" y="134" text-anchor="middle" font-size="10.5" font-weight="800" fill="#F6EDD8">우리 동네</text>
    </g>
    <g class="qa-ph" style="opacity:0; transform: translateY(-6px); transition: opacity .35s ease, transform .35s cubic-bezier(.34,1.35,.5,1)">
      <rect x="284" y="16" width="40" height="64" rx="9" fill="url(#qa-pb)" stroke="#39424E" stroke-width="1.6"/>
      <rect x="289" y="24" width="30" height="14" rx="4" fill="#E85C7E"/>
      <text x="304" y="34" text-anchor="middle" font-size="9" font-weight="900" fill="#FFFFFF">경보!</text>
      <rect x="289" y="42" width="30" height="4" rx="2" fill="#C6D2DE"/>
      <rect x="289" y="50" width="22" height="4" rx="2" fill="#DFE6EE"/>
    </g>`,
    `<linearGradient id="qa-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A3A5E"/><stop offset="1" stop-color="#16233A"/></linearGradient>
    <linearGradient id="qa-gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A5E2E"/><stop offset=".5" stop-color="#6E4A22"/><stop offset="1" stop-color="#503418"/></linearGradient>
    <radialGradient id="qa-st" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#FF8FA8"/><stop offset="1" stop-color="#E84A68"/></radialGradient>
    <linearGradient id="qa-tw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#EAF0F8"/><stop offset="1" stop-color="#AAB8C8"/></linearGradient>
    <linearGradient id="qa-pb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4EBF3"/></linearGradient>`,
  );
  const btn = mkBtn("그날의 기록 재생");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "삐-익! <b>지진 경보 문자</b>가 먼저 울리고, <b>몇 초 뒤에야</b> 땅이 흔들렸어요. 문자가 지진을 앞질렀다고요? 그날의 기록을 재생해 봐요.";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const p = fig.querySelector(".qa-p") as SVGCircleElement;
    const sWave = fig.querySelector(".qa-s") as SVGCircleElement;
    p.style.opacity = "0.95";
    sWave.style.opacity = "0.95";
    window.setTimeout(() => {
      p.setAttribute("r", "270");
      p.style.opacity = "0";
      sWave.setAttribute("r", "270");
      sWave.style.opacity = "0";
    }, 60);
    // P파(빠름)가 관측소 도달 → 경보 발송
    window.setTimeout(() => {
      const ph = fig.querySelector(".qa-ph") as SVGGElement;
      ph.style.opacity = "1";
      ph.style.transform = "translateY(0)";
      haptic(HAPTIC.cross);
    }, 480);
    // S파(느림) 도달 → 흔들림
    window.setTimeout(() => {
      const sh = fig.querySelector(".qa-shake") as SVGGElement;
      sh.style.transform = "translateX(3px)";
      window.setTimeout(() => (sh.style.transform = "translateX(-3px)"), 100);
      window.setTimeout(() => (sh.style.transform = "translateX(2px)"), 200);
      window.setTimeout(() => (sh.style.transform = "translateX(0)"), 300);
      haptic(HAPTIC.cross);
    }, 1550);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "지진파는 두 종류예요. <b>빠르지만 약한 P파</b>, <b>느리지만 강한 S파</b>. 경보 문자가 흔들림을 앞지른 비결은 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "먼저 도착한 P파를 잡아내 S파가 오기 전에 알린 거예요",
            "기상청이 지진이 날 시각을 미리 계산해 뒀어요",
            "문자가 S파보다 강해서 뚫고 온 거예요",
          ],
          good: "맞아요! 관측소가 <b>먼저 온 P파</b>를 감지하는 순간 경보를 쏘면, 진짜 흔들림(S파)이 오기까지 몇 초의 골든타임이 생겨요. 그 몇 초를 계산하는 게 오늘의 보스전이에요.",
          bad: "지진은 예언할 수 없어요. 비결은 <b>속력 차이</b>예요. 빠른 P파가 관측소에 먼저 닿는 순간 경보를 쏘고, 느린 S파가 도착할 때까지의 몇 초가 대피 시간이 되죠. 오늘 그 계산을 직접 해요!",
          onDone: finish,
        });
      }, 800);
    }, 2400);
  });
};
