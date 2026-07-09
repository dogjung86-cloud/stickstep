// hookMath4, Ⅳ 기본 도형 훅 장면 13종. hookMath.ts의 mathHook이 디스패치한다.
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

/* 파운드리 문법 공용 조각 (hookMath3.ts와 동일 문법, 소유 분리 때문에 자체 정의) */
const SHADOW = (cx: number, cy: number, rx: number, o = 0.11): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="#2A3A5E" opacity="${o}"/>`;

const wrapSvg = (inner: string, defs = "", vb = "0 0 360 200"): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none"><defs>${defs}</defs>${inner}</svg>`;

const mkBtn = (label: string, pulse = true): HTMLButtonElement =>
  el("button", { class: `swapbtn${pulse ? " pulse" : ""}`, attrs: { type: "button" } }, el("span", { text: label }));

/** 손그림 스틱맨(머리 fill + 한 획 포즈), stargaze 문법. */
const stick = (x: number, y: number, s: number, pose: string, color = "#243040"): string =>
  `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="-26" r="7.2" fill="${color}"/>
    <path d="${pose}" stroke="${color}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>`;
const POSE_HOLD_UP = "M0 -19 V4 M0 -13 L12 -26 M0 -13 L-8 -2 M0 4 L-7 18 M0 4 L7 18"; // 한 팔 위로 들기
const POSE_POINT = "M0 -19 V4 M0 -12 L14 -16 M0 -12 L-8 -2 M0 4 L-7 18 M0 4 L7 18"; // 앞 가리키기
const POSE_STAND = "M0 -19 V4 M0 -13 L-9 -2 M0 -13 L9 -2 M0 4 L-7 18 M0 4 L7 18";
const POSE_RUNJUMP = "M0 -19 V2 M0 -13 L-11 -20 M0 -13 L12 -6 M0 2 L-12 10 M0 2 L11 14"; // 도약

/* ── 1 sparkler, 불꽃막대 잔상(점이 움직이면 선) ─────────────── */
export const renderSparkler: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 잔상 궤적: 허공의 큰 S 곡선. 불꽃 점이 이 path를 따라가고 자취가 남는다.
  const TRAIL = "M96 128 C 130 64, 196 60, 224 96 C 250 128, 292 118, 300 84";
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="188" rx="16" fill="url(#sp-nt)" stroke="#0B1524" stroke-width="1.8"/>
    <circle cx="66" cy="34" r="2" fill="#EAF2FF" opacity=".8"/><circle cx="118" cy="22" r="1.5" fill="#EAF2FF" opacity=".6"/>
    <circle cx="286" cy="28" r="1.8" fill="#EAF2FF" opacity=".7"/><circle cx="318" cy="58" r="1.4" fill="#EAF2FF" opacity=".55"/>
    <circle cx="252" cy="16" r="1.4" fill="#EAF2FF" opacity=".5"/>
    ${SHADOW(96, 186, 40, 0.22)}
    ${stick(88, 158, 1.02, POSE_HOLD_UP, "#E8EFF8")}
    <path d="M100 132 L96 128" stroke="#C8B48A" stroke-width="3" stroke-linecap="round"/>
    <path class="sp-trail" d="${TRAIL}" stroke="url(#sp-tr)" stroke-width="7" stroke-linecap="round" opacity=".95"
      pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="transition: stroke-dashoffset 1.6s ease-out"/>
    <path class="sp-trail2" d="${TRAIL}" stroke="#FFF6DE" stroke-width="2.4" stroke-linecap="round"
      pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="transition: stroke-dashoffset 1.6s ease-out"/>
    <g class="sp-spark">
      <circle cx="96" cy="128" r="7" fill="url(#sp-fl)"/>
      <path d="M96 116 v-7 M96 140 v7 M84 128 h-7 M108 128 h7 M87 119 l-5 -5 M105 137 l5 5 M105 119 l5 -5 M87 137 l-5 5"
        stroke="#FFD98A" stroke-width="2" stroke-linecap="round"/>
    </g>`,
    `<linearGradient id="sp-nt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#182742"/><stop offset=".55" stop-color="#101B30"/><stop offset="1" stop-color="#0A1220"/></linearGradient>
    <linearGradient id="sp-tr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFB44D" stop-opacity=".25"/><stop offset=".7" stop-color="#FFC46E"/><stop offset="1" stop-color="#FFE9A0"/></linearGradient>
    <radialGradient id="sp-fl" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#FFF6DE"/><stop offset=".55" stop-color="#FFC46E"/><stop offset="1" stop-color="#F08C00"/></radialGradient>`,
  );
  const btn = mkBtn("불꽃막대 휘두르기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "캄캄한 밤, 손에 든 건 <b>불꽃막대</b> 하나예요. 불꽃은 막대 끝의 <b>빛나는 점</b> 하나뿐인데, 휘두르면 무슨 일이 생길까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    // 불꽃 점이 궤적을 따라 이동(offset-path) + 자취가 그려진다.
    // offset-*는 TS lib에 없을 수 있어 setProperty로, 기준점 보정(translate)은 시작 전에 함께 건다.
    const spark = fig.querySelector(".sp-spark") as SVGGElement;
    spark.style.transform = "translate(-96px, -128px)"; // offset-path 시작점과 이중 이동 방지
    spark.style.setProperty("offset-path", `path("M96 128 C 130 64, 196 60, 224 96 C 250 128, 292 118, 300 84")`);
    spark.style.setProperty("offset-rotate", "0deg");
    spark.style.setProperty("offset-distance", "0%");
    spark.style.transition = "offset-distance 1.6s ease-out";
    window.setTimeout(() => {
      spark.style.setProperty("offset-distance", "100%");
      (fig.querySelector(".sp-trail") as SVGPathElement).style.strokeDashoffset = "0";
      (fig.querySelector(".sp-trail2") as SVGPathElement).style.strokeDashoffset = "0";
    }, 60);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "우와, 허공에 <b>빛나는 선</b>이 나타났어요! 분명 불꽃은 점 하나였는데, 이 선의 정체가 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "점이 지나간 자리들이 이어져서 선이 된 거예요",
            "불꽃 알갱이가 순간적으로 길게 늘어난 거예요",
            "손이 빛을 내뿜은 거예요",
          ],
          good: "정확해요! <b>점이 움직인 자리가 선</b>이 된 거예요. 그리고 선이 움직이면요? 이제 도형의 재료 삼총사를 직접 만들어 봐요!",
          bad: "불꽃의 크기는 그대로예요, 늘어난 게 아니라 <b>매 순간의 위치(점)가 이어져 보이는 것</b>이죠. 점이 움직인 자리가 선! 이 발견이 오늘의 출발점이에요.",
          onDone: finish,
        });
      }, 900);
    }, 1750);
  });
};

/* ── 2 laserline, 하늘로 쏜 레이저(반직선) ──────────────────── */
export const renderLaserline: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="188" rx="16" fill="url(#lz-nt)" stroke="#0B1524" stroke-width="1.8"/>
    <circle cx="80" cy="30" r="1.7" fill="#EAF2FF" opacity=".7"/><circle cx="150" cy="18" r="1.4" fill="#EAF2FF" opacity=".6"/>
    <circle cx="236" cy="26" r="1.9" fill="#EAF2FF" opacity=".75"/><circle cx="304" cy="44" r="1.4" fill="#EAF2FF" opacity=".5"/>
    <rect x="286" y="58" width="34" height="122" rx="4" fill="url(#lz-wl)" stroke="#1A2436" stroke-width="1.6"/>
    <rect x="292" y="70" width="9" height="12" rx="2" fill="#2A3A54" opacity=".8"/><rect x="305" y="70" width="9" height="12" rx="2" fill="#2A3A54" opacity=".8"/>
    <rect x="292" y="92" width="9" height="12" rx="2" fill="#FFE9A0" opacity=".85"/><rect x="305" y="112" width="9" height="12" rx="2" fill="#FFE9A0" opacity=".7"/>
    ${SHADOW(92, 186, 42, 0.22)}
    ${stick(86, 158, 1.02, POSE_POINT, "#E8EFF8")}
    <rect x="97" y="141" width="13" height="5" rx="2.5" fill="#C6D2DE" stroke="#5E6C7C" stroke-width="1" transform="rotate(-14 100 146)"/>
    <g class="lz-wall" style="opacity:0">
      <line x1="112" y1="142" x2="288" y2="118" stroke="#63E6BE" stroke-width="3" stroke-linecap="round"/>
      <line x1="112" y1="142" x2="288" y2="118" stroke="#D8FBEE" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="112" cy="142" r="4" fill="#63E6BE"/>
      <circle class="lz-dot" cx="288" cy="118" r="5" fill="#B7F5DE" stroke="#2AAE84" stroke-width="1.5"/>
    </g>
    <g class="lz-sky" style="opacity:0">
      <line x1="112" y1="142" x2="252" y2="-20" stroke="#63E6BE" stroke-width="3" stroke-linecap="round"/>
      <line x1="112" y1="142" x2="252" y2="-20" stroke="#D8FBEE" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="112" cy="142" r="4" fill="#63E6BE"/>
      <path d="M244 -6 l8 -9 M236 2 l8 -9" stroke="#63E6BE" stroke-width="2" stroke-linecap="round" opacity=".7"/>
    </g>`,
    `<linearGradient id="lz-nt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16233C"/><stop offset=".55" stop-color="#0F1A2E"/><stop offset="1" stop-color="#0A1220"/></linearGradient>
    <linearGradient id="lz-wl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3A4A66"/><stop offset=".5" stop-color="#2C3A52"/><stop offset="1" stop-color="#20293C"/></linearGradient>`,
  );
  const btn1 = mkBtn("건물 벽에 쏘기");
  const btn2 = mkBtn("밤하늘로 쏘기", false);
  btn2.style.display = "none";
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn1, btn2, box);
  helper.innerHTML = "야영장의 밤, <b>레이저 포인터</b>로 별자리 설명을 해 보래요. 먼저 건너편 건물 벽에 한번 쏘아 볼까요?";

  btn1.addEventListener("click", () => {
    btn1.disabled = true;
    btn1.classList.remove("pulse");
    haptic(HAPTIC.select);
    const w = fig.querySelector(".lz-wall") as SVGGElement;
    w.style.transition = "opacity .4s ease";
    w.style.opacity = "1";
    helper.innerHTML = "빛이 <b>포인터에서 벽까지</b> 딱 이어졌어요. 시작도 끝도 분명한 빛줄기네요. 그럼 막는 게 없는 하늘로 쏘면?";
    window.setTimeout(() => {
      btn2.style.display = "";
      btn2.classList.add("pulse");
    }, 800);
  });
  btn2.addEventListener("click", () => {
    btn2.disabled = true;
    btn2.classList.remove("pulse");
    haptic(HAPTIC.select);
    const g = fig.querySelector(".lz-sky") as SVGGElement;
    g.style.transition = "opacity .5s ease";
    g.style.opacity = "1";
    face("curious");
    helper.innerHTML = "빛줄기가 화면 밖으로 쭉! 이 빛은 <b>어디까지</b> 갈까요?";
    window.setTimeout(() => {
      ask(box, helper, {
        choices: choices ?? [
          "막는 게 없으면 한없이 뻗어 나가요",
          "얼마 못 가 힘이 빠져 저절로 멈춰요",
          "하늘 꼭대기에 닿으면 끝나요",
        ],
        good: "맞아요! 빛은 막는 것이 없으면 <b>한 점에서 시작해 한쪽으로 한없이</b> 나아가요. 벽에 막히면 두 점 사이의 토막이 되고요. 오늘은 이 '곧은 선 삼형제'를 구별해 봐요!",
        bad: "빛은 스스로 멈추지 않아요. 실제로 지구에서 쏜 레이저가 <b>38만 km 떨어진 달까지</b> 날아가 반사돼 돌아온답니다! 시작점에서 한쪽으로 한없이, 이런 선에는 특별한 이름이 있어요.",
        onDone: finish,
      });
    }, 900);
  });
};

/* ── 3 clockhands, 6시 정각의 두 바늘(평각) ─────────────────── */
export const renderClockhands: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const CX = 180;
  const CY = 100;
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="188" rx="16" fill="url(#ck-rm)" stroke="#B9A88C" stroke-width="1.8"/>
    ${SHADOW(180, 178, 62, 0.13)}
    <circle cx="${CX}" cy="${CY}" r="66" fill="url(#ck-fc)" stroke="#8A7452" stroke-width="3"/>
    <circle cx="${CX}" cy="${CY}" r="58" fill="none" stroke="#E8DCC4" stroke-width="1.2"/>
    <ellipse cx="156" cy="72" rx="20" ry="12" fill="#fff" opacity=".5"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
      const a = (i * 30 * Math.PI) / 180;
      const x1 = CX + Math.sin(a) * 52;
      const y1 = CY - Math.cos(a) * 52;
      const x2 = CX + Math.sin(a) * (i % 3 === 0 ? 44 : 47);
      const y2 = CY - Math.cos(a) * (i % 3 === 0 ? 44 : 47);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6E5C3E" stroke-width="${i % 3 === 0 ? 3 : 1.6}" stroke-linecap="round"/>`;
    }).join("")}
    <g class="ck-arc" style="opacity:0">
      <path class="ck-arcpath" d="" stroke="#F08C00" stroke-width="3" fill="none" stroke-linecap="round"/>
      <text class="ck-deg" x="${CX}" y="${CY + 42}" text-anchor="middle" font-size="15" font-weight="900" fill="#B26200"></text>
    </g>
    <g class="ck-min" style="transform-box: view-box; transform-origin: ${CX}px ${CY}px; transform: rotate(0deg); transition: transform .9s cubic-bezier(.34,1.2,.5,1)">
      <line x1="${CX}" y1="${CY}" x2="${CX}" y2="${CY - 48}" stroke="#2C3A52" stroke-width="5" stroke-linecap="round"/>
    </g>
    <g class="ck-hr" style="transform-box: view-box; transform-origin: ${CX}px ${CY}px; transform: rotate(90deg); transition: transform .9s cubic-bezier(.34,1.2,.5,1)">
      <line x1="${CX}" y1="${CY}" x2="${CX}" y2="${CY - 32}" stroke="#B03A54" stroke-width="6" stroke-linecap="round"/>
    </g>
    <circle cx="${CX}" cy="${CY}" r="5" fill="#3A4A5C" stroke="#22303F" stroke-width="1.4"/>`,
    `<linearGradient id="ck-rm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF4E4"/><stop offset=".6" stop-color="#F3E8D0"/><stop offset="1" stop-color="#E6D6B6"/></linearGradient>
    <radialGradient id="ck-fc" cx=".38" cy=".32" r="1"><stop offset="0" stop-color="#FFFDF6"/><stop offset=".7" stop-color="#F6EEDC"/><stop offset="1" stop-color="#E9DCC2"/></radialGradient>`,
  );
  const btn3 = mkBtn("3시 정각으로");
  const btn6 = mkBtn("6시 정각으로", false);
  btn6.style.display = "none";
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn3, btn6, box);
  helper.innerHTML = "거실 벽시계를 봐요. 시침(빨강)과 분침(파랑) <b>두 바늘 사이의 벌어짐</b>, 이게 오늘의 주인공이에요. 3시 정각엔 얼마나 벌어질까요?";

  const arcAt = (deg: number): string => {
    // 12시 방향(위)에서 시계 방향으로 deg만큼: 분침(위) → 시침
    const a0 = -90;
    const a1 = -90 + deg;
    const r = 26;
    const x0 = CX + Math.cos((a0 * Math.PI) / 180) * r;
    const y0 = CY + Math.sin((a0 * Math.PI) / 180) * r;
    const x1 = CX + Math.cos((a1 * Math.PI) / 180) * r;
    const y1 = CY + Math.sin((a1 * Math.PI) / 180) * r;
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${deg > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  };

  btn3.addEventListener("click", () => {
    btn3.disabled = true;
    btn3.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".ck-hr") as SVGGElement).style.transform = "rotate(90deg)";
    const arc = fig.querySelector(".ck-arc") as SVGGElement;
    (fig.querySelector(".ck-arcpath") as SVGPathElement).setAttribute("d", arcAt(90));
    (fig.querySelector(".ck-deg") as SVGTextElement).textContent = "직각!";
    arc.style.transition = "opacity .5s ease";
    arc.style.opacity = "1";
    helper.innerHTML = "3시 정각, 두 바늘이 <b>반듯하게 90°</b>로 벌어졌어요. 책 모서리와 같은 이 각이 직각이죠. 그럼 6시 정각엔?";
    window.setTimeout(() => {
      btn6.style.display = "";
      btn6.classList.add("pulse");
    }, 800);
  });
  btn6.addEventListener("click", () => {
    btn6.disabled = true;
    btn6.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".ck-hr") as SVGGElement).style.transform = "rotate(180deg)";
    const arcP = fig.querySelector(".ck-arcpath") as SVGPathElement;
    const degT = fig.querySelector(".ck-deg") as SVGTextElement;
    window.setTimeout(() => {
      arcP.setAttribute("d", arcAt(180));
      degT.textContent = "?";
      face("curious");
      helper.innerHTML = "6시 정각, 두 바늘이 <b>한 직선</b>이 됐어요! 벌어진 데라곤 없어 보이는데, 이것도 '각'일까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "네, 반 바퀴만큼 돌아간 어엿한 각이에요",
            "아니요, 일직선이 됐으니 각이 아니에요",
            "각이었다가 6시가 되는 순간 사라져요",
          ],
          good: "맞아요! 분침에서 시침까지 <b>반 바퀴를 돌아간 회전량</b>이 있으니 어엿한 각이에요. 크기도, 이름도 있죠. 랩에서 직접 만들어 봐요!",
          bad: "직선처럼 보여도 각이에요! 각의 크기는 모양이 아니라 <b>한 변이 돌아간 양</b>이거든요. 두 바늘은 분명 반 바퀴만큼 벌어져 있죠. 이 특별한 각의 이름을 랩에서 만나요!",
          onDone: finish,
        });
      }, 950);
    }, 950);
  });
};

/* ── 4 scissors, 가위 양날의 비밀(맞꼭지각) ─────────────────── */
export const renderScissors: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const CX = 180;
  const CY = 104;
  // 가위: 두 직선(날+손잡이가 한 직선)이 나사(교점)에서 교차. open = 반각(도)
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="188" rx="16" fill="url(#sc-rm)" stroke="#C2CCD8" stroke-width="1.8"/>
    ${SHADOW(180, 174, 84, 0.12)}
    <g class="sc-a" style="transform-box: view-box; transform-origin: ${CX}px ${CY}px; transform: rotate(10deg); transition: transform .8s cubic-bezier(.34,1.2,.5,1)">
      <path d="M${CX} ${CY} L${CX + 118} ${CY}" stroke="url(#sc-bl)" stroke-width="10" stroke-linecap="round"/>
      <path d="M${CX} ${CY} L${CX + 116} ${CY}" stroke="#F4F8FC" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
      <path d="M${CX} ${CY} L${CX - 62} ${CY}" stroke="#E8734A" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="${CX - 78}" cy="${CY}" rx="20" ry="12" fill="none" stroke="#E8734A" stroke-width="8"/>
    </g>
    <g class="sc-b" style="transform-box: view-box; transform-origin: ${CX}px ${CY}px; transform: rotate(-10deg); transition: transform .8s cubic-bezier(.34,1.2,.5,1)">
      <path d="M${CX} ${CY} L${CX + 118} ${CY}" stroke="url(#sc-bl2)" stroke-width="10" stroke-linecap="round"/>
      <path d="M${CX} ${CY} L${CX - 62} ${CY}" stroke="#C8552E" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="${CX - 78}" cy="${CY}" rx="20" ry="12" fill="none" stroke="#C8552E" stroke-width="8"/>
    </g>
    <circle cx="${CX}" cy="${CY}" r="6" fill="url(#sc-pv)" stroke="#4A5668" stroke-width="1.6"/>
    <g class="sc-lab" style="opacity:0">
      <text class="sc-mouth" x="${CX + 86}" y="${CY + 5}" text-anchor="middle" font-size="14" font-weight="900" fill="#0A87A3"></text>
      <text class="sc-grip" x="${CX - 96}" y="${CY + 5}" text-anchor="middle" font-size="14" font-weight="900" fill="#B26200"></text>
    </g>`,
    `<linearGradient id="sc-rm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7FAFD"/><stop offset=".6" stop-color="#EDF2F8"/><stop offset="1" stop-color="#DDE6F0"/></linearGradient>
    <linearGradient id="sc-bl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D6DEE8"/><stop offset=".6" stop-color="#AAB8C8"/><stop offset="1" stop-color="#8C99A8"/></linearGradient>
    <linearGradient id="sc-bl2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C2CCD8"/><stop offset=".6" stop-color="#98A6B6"/><stop offset="1" stop-color="#7C8998"/></linearGradient>
    <radialGradient id="sc-pv" cx=".38" cy=".32" r="1"><stop offset="0" stop-color="#E8EEF6"/><stop offset="1" stop-color="#96A2B2"/></radialGradient>`,
  );
  const btnO = mkBtn("가위 벌리기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btnO, box);
  helper.innerHTML = "책상 위의 <b>가위</b>예요. 가위의 두 날은 가운데 <b>나사 한 점</b>에서 교차하는 두 직선이죠. 벌리면 각이 몇 개나 생길까요?";

  let opened = false;
  btnO.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    btnO.disabled = true;
    btnO.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".sc-a") as SVGGElement).style.transform = "rotate(22deg)";
    (fig.querySelector(".sc-b") as SVGGElement).style.transform = "rotate(-22deg)";
    window.setTimeout(() => {
      const lab = fig.querySelector(".sc-lab") as SVGGElement;
      (fig.querySelector(".sc-mouth") as SVGTextElement).textContent = "44°";
      (fig.querySelector(".sc-grip") as SVGTextElement).textContent = "?";
      lab.style.transition = "opacity .5s ease";
      lab.style.opacity = "1";
      face("curious");
      helper.innerHTML = "입 쪽이 <b>44°</b> 벌어졌어요. 그럼 반대쪽, <b>손잡이 사이의 각</b>은 몇 도일까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "똑같이 44°예요",
            "날보다 손잡이가 기니까 더 커요",
            "반대쪽이니까 44°보다 작아요",
          ],
          good: "정답! 손잡이 쪽도 정확히 <b>44°</b>예요. 두 직선이 한 점에서 만나면 마주 보는 각끼리는 늘 함께 움직이거든요. 왜 그런지 랩에서 파헤쳐 봐요!",
          bad: "변의 길이는 각과 상관없어요! 가위 양날은 <b>한 나사에서 교차하는 두 직선</b>이라, 마주 보는 두 각은 언제나 똑같이 <b>44°</b>로 벌어져요. 이 신기한 짝의 비밀을 랩에서 확인해요!",
          onDone: finish,
        });
      }, 900);
    }, 850);
  });
};

/* ── 5 longjump, 멀리뛰기 기록의 비밀(수선과 거리) ──────────── */
export const renderLongjump: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 위에서 내려다본 모래판: 출발선(발구름판) 세로, 착지 발자국 오른쪽 위
  const LX = 96; // 발구름선 x
  const PX = 258;
  const PY = 66; // 착지점(위에서 본 그림, 출발선이 세로선, 기록은 착지점에서 선까지의 수직 거리)
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="188" rx="16" fill="url(#lj-sd)" stroke="#B98A5E" stroke-width="1.8"/>
    <g opacity=".5">${[36, 66, 96, 126, 156].map((y) => `<line x1="34" y1="${y + 14}" x2="326" y2="${y + 14}" stroke="#D8B990" stroke-width="1" stroke-dasharray="3 6"/>`).join("")}</g>
    <rect x="${LX - 10}" y="14" width="10" height="172" fill="url(#lj-bd)" stroke="#8A5A2E" stroke-width="1.4"/>
    <line x1="${LX}" y1="14" x2="${LX}" y2="186" stroke="#FFFFFF" stroke-width="2.6"/>
    <g transform="translate(${PX} ${PY})">
      <ellipse cx="0" cy="0" rx="9" ry="13" fill="url(#lj-ft)" stroke="#6E3F16" stroke-width="1.4" transform="rotate(14)"/>
      <ellipse cx="13" cy="4" rx="9" ry="13" fill="url(#lj-ft)" stroke="#6E3F16" stroke-width="1.4" transform="rotate(-8 13 4)"/>
    </g>
    ${SHADOW(60, 182, 30, 0.18)}
    ${stick(56, 156, 0.95, POSE_RUNJUMP, "#243040")}
    <g class="lj-diag" style="opacity:0">
      <line x1="${LX}" y1="168" x2="${PX}" y2="${PY + 6}" stroke="#E8547E" stroke-width="2.6" stroke-dasharray="7 5" stroke-linecap="round"/>
      <rect x="${(LX + PX) / 2 - 25}" y="${(168 + PY) / 2 - 2}" width="52" height="20" rx="10" fill="#FFFFFF" stroke="#E8547E" stroke-width="1.4"/>
      <text x="${(LX + PX) / 2 + 1}" y="${(168 + PY) / 2 + 12}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#C93A62">5.44 m</text>
    </g>
    <g class="lj-perp" style="opacity:0">
      <line x1="${LX}" y1="${PY + 6}" x2="${PX}" y2="${PY + 6}" stroke="#0DA5C6" stroke-width="3" stroke-linecap="round"/>
      <path d="M${LX + 12} ${PY + 6} v12 h-12" stroke="#0DA5C6" stroke-width="2" fill="none"/>
      <rect x="${(LX + PX) / 2 - 25}" y="${PY - 22}" width="52" height="20" rx="10" fill="#FFFFFF" stroke="#0DA5C6" stroke-width="1.4"/>
      <text x="${(LX + PX) / 2 + 1}" y="${PY - 8}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#0A87A3">5.02 m</text>
    </g>`,
    `<linearGradient id="lj-sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E3C2"/><stop offset=".55" stop-color="#EDD3A8"/><stop offset="1" stop-color="#DDBC8A"/></linearGradient>
    <linearGradient id="lj-bd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8C08A"/><stop offset="1" stop-color="#C89A5E"/></linearGradient>
    <radialGradient id="lj-ft" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#C9995C"/><stop offset="1" stop-color="#9C6E38"/></radialGradient>`,
  );
  const btn = mkBtn("기록 재기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "체육 시간 <b>멀리뛰기</b>! 힘차게 굴러 모래판에 착지했어요. 하얀 선이 발구름선(출발선)이고, 저기 발자국이 내 착지 지점. 이제 기록을 재 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const d = fig.querySelector(".lj-diag") as SVGGElement;
    d.style.transition = "opacity .5s ease";
    d.style.opacity = "1";
    window.setTimeout(() => {
      const p = fig.querySelector(".lj-perp") as SVGGElement;
      p.style.transition = "opacity .5s ease";
      p.style.opacity = "1";
      face("curious");
      helper.innerHTML = "어라, 재는 방법이 두 가지네요? 발구름선 <b>끝에서 비스듬히</b> 재면 5.44 m, 발자국에서 선에 <b>직각으로</b> 재면 5.02 m. 공식 기록은 어느 쪽일까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "5.02 m, 선까지 직각으로 잰 거리예요",
            "5.44 m, 더 멀리 뛴 걸로 재 줘야죠",
            "두 값의 중간쯤으로 정해요",
          ],
          good: "정확해요! 기록은 <b>착지점에서 출발선까지 직각으로 잰 거리</b>예요. 직각으로 재는 길이 딱 하나뿐인 가장 짧은 길이거든요. 왜 하필 가장 짧은 길일까요? 랩에서 재 보며 확인해요!",
          bad: "비스듬히 재면 어디서 재느냐에 따라 5.44도 6.0도 될 수 있어요, 기준이 무너지죠! 그래서 규칙은 <b>딱 하나로 정해지는 가장 짧은 거리, 직각으로 잰 거리</b>예요. 그 비밀을 랩에서 파헤쳐요!",
          onDone: finish,
        });
      }, 950);
    }, 900);
  });
};

/* ── 6 railroad, 기차 레일은 만날까(평행) ───────────────────── */
export const renderRailroad: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 원근 기찻길: 소실점(180, 58)을 향해 좁아지는 두 레일
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="60" rx="16" fill="url(#rr-sky)"/>
    <rect x="28" y="58" width="304" height="136" rx="16" fill="url(#rr-gd)"/>
    <rect x="28" y="6" width="304" height="188" rx="16" fill="none" stroke="#3E5C42" stroke-width="1.8"/>
    <path d="M100 40 q14 -16 30 -8 q6 -12 22 -8 q14 -6 22 6 q12 -2 12 10 q-2 8 -14 8 h-62 q-12 -2 -10 -8z" fill="#FFFFFF" opacity=".85"/>
    <circle cx="304" cy="30" r="12" fill="url(#rr-sun)"/>
    ${[...Array(9)].map((_, i) => {
      const t = i / 8.6;
      const y = 186 - t * 118;
      const half = 62 * (1 - t * 0.86);
      return `<rect x="${180 - half}" y="${y - 3}" width="${half * 2}" height="${5 - t * 3.4}" rx="2" fill="url(#rr-tie)" stroke="#5E4426" stroke-width="${1.2 - t}"/>`;
    }).join("")}
    <path d="M136 190 L172 62" stroke="url(#rr-rl)" stroke-width="5" stroke-linecap="round"/>
    <path d="M224 190 L188 62" stroke="url(#rr-rl)" stroke-width="5" stroke-linecap="round"/>
    <path d="M137.5 188 L172.5 64" stroke="#F4F8FC" stroke-width="1.2" opacity=".65"/>
    <path d="M222.5 188 L187.5 64" stroke="#F4F8FC" stroke-width="1.2" opacity=".65"/>
    <circle class="rr-vp" cx="180" cy="60" r="7" fill="none" stroke="#E8547E" stroke-width="2.4" style="opacity:0"/>
    <g class="rr-gap" style="opacity:0">
      <path d="M148 168 h-16 M212 168 h16" stroke="#0DA5C6" stroke-width="2" stroke-linecap="round"/>
      <path d="M150 168 H210" stroke="#0DA5C6" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="2 5"/>
      <rect x="152" y="146" width="56" height="18" rx="9" fill="#FFFFFF" stroke="#0DA5C6" stroke-width="1.3"/>
      <text x="180" y="159" text-anchor="middle" font-size="10.5" font-weight="900" fill="#0A87A3">1,435 mm</text>
      <path d="M167 92 h26" stroke="#0DA5C6" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 4"/>
      <rect x="152" y="72" width="56" height="16" rx="8" fill="#FFFFFF" stroke="#0DA5C6" stroke-width="1.3"/>
      <text x="180" y="84" text-anchor="middle" font-size="9.5" font-weight="900" fill="#0A87A3">1,435 mm</text>
    </g>
    ${SHADOW(70, 186, 30, 0.16)}
    ${stick(66, 160, 0.95, POSE_POINT, "#243040")}`,
    `<linearGradient id="rr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F6"/><stop offset="1" stop-color="#E4F2FA"/></linearGradient>
    <linearGradient id="rr-gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC48A"/><stop offset=".5" stop-color="#7FAE6C"/><stop offset="1" stop-color="#5E8C4E"/></linearGradient>
    <radialGradient id="rr-sun" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#FFF6DE"/><stop offset="1" stop-color="#FFD98A"/></radialGradient>
    <linearGradient id="rr-tie" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9805A"/><stop offset="1" stop-color="#7E5A36"/></linearGradient>
    <linearGradient id="rr-rl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8C99A8"/><stop offset="1" stop-color="#5C6E80"/></linearGradient>`,
  );
  const btn = mkBtn("끝까지 바라보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "곧게 뻗은 <b>기찻길</b>이에요. 두 레일을 따라 시선을 저 멀리 지평선까지 보내 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const vp = fig.querySelector(".rr-vp") as SVGCircleElement;
    vp.style.transition = "opacity .6s ease";
    vp.style.opacity = "1";
    face("surprised");
    helper.innerHTML = "저 멀리에서 두 레일이 <b>한 점에서 만나는 것처럼</b> 보여요! 정말 만나는 걸까요?";
    window.setTimeout(() => {
      ask(box, helper, {
        choices: choices ?? [
          "아니요, 간격이 늘 같아서 영원히 안 만나요",
          "네, 아주 멀리 가면 결국 만나요",
          "오르막을 넘는 지점에서 만나요",
        ],
        good: "맞아요! 눈에는 만나 보여도 레일 사이는 <b>어디서나 똑같이 1,435 mm</b>예요. 만나는 순간 기차는 탈선이니까요. 이렇게 영원히 안 만나는 두 직선의 관계를 오늘 배워요!",
        bad: "만나면 큰일 나요, 기차가 탈선하거든요! 멀리서 만나 보이는 건 눈의 원근 착시일 뿐, 레일 사이 간격은 <b>어디서나 1,435 mm로 똑같아요</b>. 절대 만나지 않는 두 직선, 오늘의 주인공이에요.",
        onDone: finish,
      });
    }, 950);
  });
  const gap = fig.querySelector(".rr-gap") as SVGGElement;
  window.setTimeout(() => {
    gap.style.transition = "opacity .8s ease";
    gap.style.opacity = "1";
  }, 600);
};

/* ── 7 overpass, 고가도로의 수수께끼(꼬인 위치) ─────────────── */
export const renderOverpass: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 아래 도로: 좌하→우상 사선. 위 고가: 좌상→우하 사선(높이 다름). 3D 느낌은 기둥과 그림자.
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="188" rx="16" fill="url(#op-bg)" stroke="#3E4A5E" stroke-width="1.8"/>
    <path d="M28 150 L332 118 L332 156 L28 194 Z" fill="url(#op-rd)"/>
    <path d="M28 172 L332 137" stroke="#F4E8B0" stroke-width="2.4" stroke-dasharray="12 10" opacity=".8"/>
    <g class="op-car1" style="transform: translate(-40px, 0); transition: transform 1.4s ease-in-out">
      ${SHADOW(96, 172, 22, 0.2)}
      <rect x="74" y="152" width="44" height="16" rx="7" fill="url(#op-c1)" stroke="#8A2F42" stroke-width="1.4" transform="rotate(-6 96 160)"/>
      <rect x="84" y="146" width="22" height="10" rx="5" fill="#D8ECF8" stroke="#8A2F42" stroke-width="1.2" transform="rotate(-6 96 160)"/>
      <circle cx="82" cy="170" r="5" fill="#39424E"/><circle cx="110" cy="167" r="5" fill="#39424E"/>
    </g>
    <rect x="94" y="52" width="12" height="92" rx="3" fill="url(#op-pl)" stroke="#5E6C7C" stroke-width="1.3"/>
    <rect x="250" y="34" width="12" height="88" rx="3" fill="url(#op-pl)" stroke="#5E6C7C" stroke-width="1.3"/>
    <path d="M28 78 L332 40 L332 66 L28 106 Z" fill="url(#op-hw)" stroke="#2C3A52" stroke-width="1.6"/>
    <path d="M28 94 L332 55" stroke="#F4E8B0" stroke-width="2.2" stroke-dasharray="12 10" opacity=".85"/>
    <g class="op-car2" style="transform: translate(40px, 0); transition: transform 1.4s ease-in-out">
      <rect x="196" y="52" width="40" height="14" rx="6" fill="url(#op-c2)" stroke="#0E6E86" stroke-width="1.4" transform="rotate(-7 216 60)"/>
      <rect x="205" y="46" width="20" height="9" rx="4.5" fill="#D8ECF8" stroke="#0E6E86" stroke-width="1.1" transform="rotate(-7 216 60)"/>
      <circle cx="203" cy="68" r="4.5" fill="#39424E"/><circle cx="228" cy="65" r="4.5" fill="#39424E"/>
    </g>
    <g class="op-q" style="opacity:0">
      <circle cx="180" cy="108" r="13" fill="#FFE9A0" stroke="#D8952E" stroke-width="1.6"/>
      <text x="180" y="114" text-anchor="middle" font-size="15" font-weight="900" fill="#7A5800">?</text>
    </g>`,
    `<linearGradient id="op-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6E8F6"/><stop offset=".55" stop-color="#BAD2E6"/><stop offset="1" stop-color="#9CB6CE"/></linearGradient>
    <linearGradient id="op-rd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8C99A8"/><stop offset="1" stop-color="#66727E"/></linearGradient>
    <linearGradient id="op-hw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E7C8E"/><stop offset="1" stop-color="#4A5668"/></linearGradient>
    <linearGradient id="op-pl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C2CCD8"/><stop offset="1" stop-color="#96A2B2"/></linearGradient>
    <linearGradient id="op-c1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF7E96"/><stop offset="1" stop-color="#D84868"/></linearGradient>
    <linearGradient id="op-c2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5FC8E8"/><stop offset="1" stop-color="#2496BC"/></linearGradient>`,
  );
  const btn = mkBtn("차 보내기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "도시의 <b>고가도로</b>예요. 위쪽 고가와 아래쪽 도로, 두 길이 서로 다른 방향으로 뻗어 있죠. 차 두 대를 동시에 보내 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".op-car1") as SVGGElement).style.transform = "translate(200px, -20px)";
    (fig.querySelector(".op-car2") as SVGGElement).style.transform = "translate(-160px, 18px)";
    window.setTimeout(() => {
      const q = fig.querySelector(".op-q") as SVGGElement;
      q.style.transition = "opacity .5s ease";
      q.style.opacity = "1";
      face("curious");
      helper.innerHTML = "쌩쌩, 두 차가 스쳐 지나갔는데 <b>부딪히지 않았어요!</b> 그런데 두 길의 방향은 서로 달라요. 그럼 두 도로(직선)는 어떤 사이일까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "만나지도 않고, 평행하지도 않아요",
            "위에서 보면 겹치니까 만나는 거예요",
            "안 만나니까 평행한 거예요",
          ],
          good: "예리해요! 높이가 달라 <b>만나지 않고</b>, 방향이 달라 <b>평행도 아니에요</b>. 종이 위(평면)에선 불가능했던 제3의 관계죠. 이 관계의 이름을 3D 상자에서 직접 확인해 봐요!",
          bad: "높이가 달라서 실제로는 만나지 않고(위에서 겹쳐 보일 뿐!), 방향이 달라서 나란한 평행도 아니에요. 평면에서는 없던 <b>제3의 관계</b>가 공간에서 태어난 거죠. 3D 상자에서 그 이름을 만나요!",
          onDone: finish,
        });
      }, 950);
    }, 1500);
  });
};

/* ── 8 subwayexit, 사거리 출구의 짝(동위각·엇각) ────────────── */
export const renderSubwayexit: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 대각선 대로 하나가 사거리 ㈎(위)·㈏(아래)를 관통, 각 사거리에 가로 도로
  const j1 = { x: 140, y: 66 }; // ㈎ 교차점
  const j2 = { x: 214, y: 138 }; // ㈏ 교차점
  const exitDot = (x: number, y: number, n: string, cls = "", tone = "#0DA5C6"): string =>
    `<g class="${cls}"><circle cx="${x}" cy="${y}" r="9" fill="#FFFFFF" stroke="${tone}" stroke-width="2"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10.5" font-weight="900" fill="${tone}">${n}</text></g>`;
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="188" rx="16" fill="url(#se-bg)" stroke="#8CA890" stroke-width="1.8"/>
    <g opacity=".9">
      <rect x="40" y="20" width="52" height="30" rx="6" fill="url(#se-bd)" stroke="#7E9282" stroke-width="1.2"/>
      <rect x="252" y="26" width="60" height="34" rx="6" fill="url(#se-bd2)" stroke="#7E9282" stroke-width="1.2"/>
      <rect x="46" y="150" width="58" height="32" rx="6" fill="url(#se-bd2)" stroke="#7E9282" stroke-width="1.2"/>
      <rect x="266" y="158" width="50" height="28" rx="6" fill="url(#se-bd)" stroke="#7E9282" stroke-width="1.2"/>
      <circle cx="66" cy="108" r="12" fill="url(#se-tr)"/><circle cx="308" cy="104" r="12" fill="url(#se-tr)"/>
    </g>
    <path d="M${j1.x - 108} ${j1.y} H${j1.x + 108}" stroke="url(#se-rd)" stroke-width="18" stroke-linecap="round"/>
    <path d="M${j2.x - 108} ${j2.y} H${j2.x + 108}" stroke="url(#se-rd)" stroke-width="18" stroke-linecap="round"/>
    <path d="M${j1.x - 30} ${j1.y - 30} L${j2.x + 30} ${j2.y + 30}" stroke="url(#se-rd)" stroke-width="18" stroke-linecap="round"/>
    <path d="M${j1.x - 104} ${j1.y} H${j1.x + 104} M${j2.x - 104} ${j2.y} H${j2.x + 104} M${j1.x - 26} ${j1.y - 26} L${j2.x + 26} ${j2.y + 26}" stroke="#F4F0E4" stroke-width="1.6" stroke-dasharray="6 8" opacity=".7"/>
    <text x="${j1.x - 96}" y="${j1.y - 22}" font-size="12" font-weight="900" fill="#4E6252">㈎ 사거리</text>
    <text x="${j2.x + 34}" y="${j2.y + 34}" font-size="12" font-weight="900" fill="#4E6252">㈏ 사거리</text>
    ${exitDot(j1.x - 26, j1.y - 16, "1")}
    ${exitDot(j1.x + 22, j1.y - 20, "2", "se-e2", "#E8547E")}
    ${exitDot(j1.x + 26, j1.y + 16, "3", "se-e3", "#F08C00")}
    ${exitDot(j1.x - 22, j1.y + 20, "4")}
    ${exitDot(j2.x - 26, j2.y - 16, "5", "se-e5", "#F08C00")}
    ${exitDot(j2.x + 22, j2.y - 20, "6")}
    ${exitDot(j2.x + 26, j2.y + 16, "7")}
    ${exitDot(j2.x - 22, j2.y + 20, "8", "se-e8", "#E8547E")}`,
    `<linearGradient id="se-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4EFE0"/><stop offset=".6" stop-color="#D6E6D0"/><stop offset="1" stop-color="#C2D6BA"/></linearGradient>
    <linearGradient id="se-rd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#98A4B2"/><stop offset="1" stop-color="#78848E"/></linearGradient>
    <linearGradient id="se-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2E8D2"/><stop offset="1" stop-color="#D8C8A4"/></linearGradient>
    <linearGradient id="se-bd2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8E4F2"/><stop offset="1" stop-color="#AEC2D8"/></linearGradient>
    <radialGradient id="se-tr" cx=".38" cy=".32" r="1"><stop offset="0" stop-color="#8CC878"/><stop offset="1" stop-color="#4E8C3E"/></radialGradient>`,
  );
  const btn = mkBtn("2번 출구의 짝 찾기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "친구와 지하철역에서 만나기로 했어요. 대각선 대로가 사거리 <b>㈎와 ㈏</b>를 지나고, 출구가 여덟 개! 친구가 \"㈎의 2번 출구랑 ㈏의 8번 출구가 <b>같은 위치</b>야\"라고 하네요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const glow = (cls: string): void => {
      const g = fig.querySelector(`.${cls}`) as SVGGElement;
      g.style.transition = "transform .5s cubic-bezier(.34,1.35,.5,1)";
      g.style.transformBox = "fill-box";
      g.style.transformOrigin = "center";
      g.style.transform = "scale(1.45)";
    };
    glow("se-e2");
    glow("se-e8");
    window.setTimeout(() => {
      face("curious");
      glow("se-e3");
      helper.innerHTML = "2번(위 사거리)과 8번(아래 사거리), 정말 대로 기준 <b>같은 모퉁이</b>에 있네요! 그럼 <b>3번 출구</b>와 같은 위치에 있는 ㈏의 출구는 몇 번일까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? ["5번 출구", "7번 출구", "6번 출구"],
          good: "정확해요! 대각선 대로에서 <b>같은 쪽, 가로 도로에서 같은 쪽</b>이면 같은 모퉁이죠. 사거리(교차점)가 두 개면 이런 '같은 위치의 짝'이 생겨요. 수학은 이 짝에 이름을 붙였답니다!",
          bad: "모퉁이의 방향을 봐요. 3번은 대각선 대로의 <b>오른쪽 아래</b> 모퉁이니까, ㈏에서도 오른쪽... 이 아니라 같은 방향인 <b>5번</b>이 짝이에요. 같은 위치의 각, 엇갈린 위치의 각, 오늘 그 이름을 배워요!",
          onDone: finish,
        });
      }, 950);
    }, 900);
  });
};

/* ── 9 blinds, 블라인드 햇빛 줄무늬(평행선의 성질) ──────────── */
export const renderBlinds: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 창문(블라인드 살 = 평행선) + 비스듬한 햇빛 줄기들 + 바닥
  const RAYS = [
    { x1: 96, y1: 38 },
    { x1: 96, y1: 66 },
    { x1: 96, y1: 94 },
    { x1: 96, y1: 122 },
  ];
  const DX = 168;
  const DY = 64; // 광선 방향 벡터(전부 동일 = 평행)
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="188" rx="16" fill="url(#bl-rm)" stroke="#B9A88C" stroke-width="1.8"/>
    <rect x="28" y="158" width="304" height="36" rx="12" fill="url(#bl-fl)"/>
    <rect x="60" y="22" width="72" height="128" rx="8" fill="url(#bl-wd)" stroke="#8A7452" stroke-width="2"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="66" y="${28 + i * 17}" width="60" height="11" rx="4" fill="url(#bl-sl)" stroke="#C4A86E" stroke-width="1"/>`).join("")}
    <g class="bl-rays" style="opacity:0">
      ${RAYS.map((r) => `
        <path d="M${r.x1} ${r.y1} L${r.x1 + DX} ${r.y1 + DY}" stroke="url(#bl-lt)" stroke-width="9" stroke-linecap="round" opacity=".5"/>
        <path d="M${r.x1} ${r.y1} L${r.x1 + DX} ${r.y1 + DY}" stroke="#FFF6DE" stroke-width="2" stroke-linecap="round" opacity=".8"/>`).join("")}
      ${RAYS.map((r) => `<ellipse cx="${r.x1 + DX + 6}" cy="${r.y1 + DY + 3}" rx="17" ry="5" fill="#FFE9A0" opacity=".75"/>`).join("")}
    </g>
    <g class="bl-angles" style="opacity:0">
      ${RAYS.slice(0, 3).map((r) => {
        const fx = r.x1 + DX;
        const fy = r.y1 + DY;
        return `<path d="M${fx - 26} ${fy + 3} A 24 24 0 0 1 ${fx - 26 + 24 - 24 * Math.cos(0.36)} ${fy + 3 - 24 * Math.sin(0.36)}" stroke="#E8547E" stroke-width="2.2" fill="none"/>
        <text x="${fx - 34}" y="${fy - 8}" font-size="11" font-weight="900" fill="#C93A62">21°</text>`;
      }).join("")}
    </g>
    ${SHADOW(282, 186, 30, 0.15)}
    ${stick(278, 160, 0.95, POSE_STAND, "#243040")}`,
    `<linearGradient id="bl-rm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8F2E6"/><stop offset=".6" stop-color="#F0E6D2"/><stop offset="1" stop-color="#E2D2B4"/></linearGradient>
    <linearGradient id="bl-fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9C29A"/><stop offset="1" stop-color="#C0A576"/></linearGradient>
    <linearGradient id="bl-wd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6EEDC"/><stop offset="1" stop-color="#E4D4B4"/></linearGradient>
    <linearGradient id="bl-sl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF4E2"/><stop offset="1" stop-color="#E8D6AE"/></linearGradient>
    <linearGradient id="bl-lt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFE9A0" stop-opacity=".2"/><stop offset="1" stop-color="#FFD98A"/></linearGradient>`,
  );
  const btn = mkBtn("블라인드 살짝 열기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "늦은 오후의 방, 창문엔 <b>블라인드</b>가 내려져 있어요. 블라인드 살들은 전부 <b>나란한(평행한) 판</b>이죠. 살짝 열어 햇빛을 들여 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const rays = fig.querySelector(".bl-rays") as SVGGElement;
    rays.style.transition = "opacity .9s ease";
    rays.style.opacity = "1";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "햇살 줄기들이 살 틈마다 비스듬히 쏟아져 들어와요. 그런데 이 <b>빛줄기들이 바닥과 이루는 각</b>은 서로 어떨까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "전부 똑같은 각이에요",
            "아래쪽 틈으로 들어온 빛일수록 각이 커요",
            "빛줄기마다 제각각이에요",
          ],
          good: "맞아요, 전부 똑같아요! 태양이 워낙 멀어서 햇살은 <b>모두 평행</b>하게 날아오거든요. 평행한 선들이 한 직선(바닥)과 만나면 같은 위치의 각이 전부 같아져요. 어제 배운 동위각이 드디어 힘을 쓰는 순간!",
          bad: "빛줄기들을 자로 재 보면 놀랍게도 <b>전부 똑같은 각</b>이에요. 태양이 아주 멀어서 햇살이 모두 평행하기 때문이죠. 평행선이 한 직선과 만나면 동위각이 몽땅 같아진다, 이게 오늘 확인할 성질이에요!",
          onDone: finish,
        });
      }, 950);
    }, 1000);
  });
  window.setTimeout(() => {
    const a = fig.querySelector(".bl-angles") as SVGGElement;
    a.style.transition = "opacity .7s ease";
  }, 100);
};

/* ── 10 curtain, 끈 하나로 길이 복사(작도) ──────────────────── */
export const renderCurtain: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="188" rx="16" fill="url(#ct-rm)" stroke="#B9A88C" stroke-width="1.8"/>
    <rect x="52" y="28" width="118" height="92" rx="8" fill="url(#ct-win)" stroke="#8A7452" stroke-width="2.4"/>
    <path d="M60 110 q18 -26 34 -8 q10 -18 26 -6 q12 -8 20 4 q10 0 8 10z" fill="#FFFFFF" opacity=".75"/>
    <circle cx="146" cy="46" r="9" fill="url(#ct-sun)"/>
    <line x1="111" y1="30" x2="111" y2="118" stroke="#8A7452" stroke-width="2"/>
    <g class="ct-string" style="opacity:0">
      <path class="ct-strpath" d="M56 138 H166" stroke="url(#ct-str)" stroke-width="4.4" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="transition: stroke-dashoffset 1s ease-out"/>
      <circle cx="56" cy="138" r="4" fill="#B03A54"/>
      <circle class="ct-knot" cx="166" cy="138" r="4" fill="#B03A54" style="opacity:0; transition: opacity .4s ease"/>
      <text x="111" y="156" text-anchor="middle" font-size="11" font-weight="900" fill="#8A5A78">창문 폭만큼 매듭!</text>
    </g>
    <g class="ct-shop" style="opacity:0">
      <rect x="206" y="28" width="106" height="150" rx="10" fill="url(#ct-sh)" stroke="#7E6C8E" stroke-width="1.8"/>
      <text x="259" y="48" text-anchor="middle" font-size="11.5" font-weight="900" fill="#5E4E72">커튼 가게</text>
      <rect x="216" y="58" width="20" height="104" rx="4" fill="url(#ct-c1)" stroke="#8A5A78" stroke-width="1.2"/>
      <rect x="242" y="58" width="26" height="104" rx="4" fill="url(#ct-c2)" stroke="#4E6E8E" stroke-width="1.2"/>
      <rect x="274" y="58" width="30" height="104" rx="4" fill="url(#ct-c3)" stroke="#6E8E4E" stroke-width="1.2"/>
      <path d="M218 60 q8 30 0 50 q8 30 0 50 M226 60 q6 30 0 50 q6 30 0 50" stroke="#FFFFFF" stroke-width="1" opacity=".4" fill="none"/>
      <g class="ct-fit" style="opacity:0">
        <path d="M242 170 H268" stroke="#B03A54" stroke-width="4" stroke-linecap="round"/>
        <circle cx="242" cy="170" r="3.6" fill="#B03A54"/><circle cx="268" cy="170" r="3.6" fill="#B03A54"/>
        <circle cx="255" cy="118" r="13" fill="#FFFFFF" stroke="#04B45F" stroke-width="2.4"/>
        <path d="M249 118 l4 5 l8 -9" stroke="#04B45F" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </g>
    ${SHADOW(78, 184, 26, 0.15)}
    ${stick(74, 158, 0.95, POSE_HOLD_UP, "#243040")}`,
    `<linearGradient id="ct-rm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF4E8"/><stop offset=".6" stop-color="#F2E8D4"/><stop offset="1" stop-color="#E4D4B6"/></linearGradient>
    <linearGradient id="ct-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CBE6F6"/><stop offset=".6" stop-color="#A6CCE8"/><stop offset="1" stop-color="#7EAED0"/></linearGradient>
    <radialGradient id="ct-sun" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#FFF6DE"/><stop offset="1" stop-color="#FFD065"/></radialGradient>
    <linearGradient id="ct-str" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E86E8E"/><stop offset="1" stop-color="#C43E62"/></linearGradient>
    <linearGradient id="ct-sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2ECFA"/><stop offset="1" stop-color="#DCD2EC"/></linearGradient>
    <linearGradient id="ct-c1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2B8CC"/><stop offset="1" stop-color="#D8879E"/></linearGradient>
    <linearGradient id="ct-c2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8D4F2"/><stop offset="1" stop-color="#87A8D8"/></linearGradient>
    <linearGradient id="ct-c3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CCE8B0"/><stop offset="1" stop-color="#9EC878"/></linearGradient>`,
  );
  const btn1 = mkBtn("끈으로 창문 폭 재기");
  const btn2 = mkBtn("끈 들고 가게 가기", false);
  btn2.style.display = "none";
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn1, btn2, box);
  helper.innerHTML = "새 커튼을 사러 가야 해요. 그런데 집에 <b>줄자가 없어요!</b> 눈금 없는 <b>끈</b> 한 가닥만 있을 뿐. 이걸로 창문 폭을 잴 수 있을까요?";

  btn1.addEventListener("click", () => {
    btn1.disabled = true;
    btn1.classList.remove("pulse");
    haptic(HAPTIC.select);
    const g = fig.querySelector(".ct-string") as SVGGElement;
    g.style.transition = "opacity .3s ease";
    g.style.opacity = "1";
    (fig.querySelector(".ct-strpath") as SVGPathElement).style.strokeDashoffset = "0";
    window.setTimeout(() => {
      (fig.querySelector(".ct-knot") as SVGCircleElement).style.opacity = "1";
      haptic(HAPTIC.tap);
      helper.innerHTML = "끈을 창문 폭에 딱 맞춰 늘이고 <b>매듭</b>을 지었어요. 몇 cm인지는 몰라도, 폭이 끈에 고스란히 담겼죠!";
      btn2.style.display = "";
      btn2.classList.add("pulse");
    }, 1050);
  });
  btn2.addEventListener("click", () => {
    btn2.disabled = true;
    btn2.classList.remove("pulse");
    haptic(HAPTIC.select);
    const shop = fig.querySelector(".ct-shop") as SVGGElement;
    shop.style.transition = "opacity .6s ease";
    shop.style.opacity = "1";
    window.setTimeout(() => {
      const fit = fig.querySelector(".ct-fit") as SVGGElement;
      fit.style.transition = "opacity .5s ease";
      fit.style.opacity = "1";
      face("surprised");
      helper.innerHTML = "가게에서 끈을 대 보니 <b>딱 맞는 커튼</b>을 찾았어요! 숫자 없이 길이가 옮겨진 거예요. 그런데, 수학 시간의 <b>컴퍼스</b>도 눈금이 없잖아요. 컴퍼스도 길이를 옮길 수 있을까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "네, 벌린 폭이 그대로 길이니까요",
            "아니요, 눈금이 없으면 길이를 알 수 없어요",
            "컴퍼스는 원 그릴 때만 쓰는 도구예요",
          ],
          good: "바로 그거예요! 컴퍼스의 <b>벌린 폭</b>이 끈의 매듭과 같은 역할을 해요. 몇 cm인지 몰라도 '같은 길이'를 옮길 수 있죠. 눈금 없는 자와 컴퍼스만으로 도형을 그리는 기술, 작도를 시작해요!",
          bad: "숫자를 몰라도 괜찮아요, 방금 끈이 증명했잖아요! 컴퍼스도 <b>벌린 폭을 그대로 유지</b>한 채 옮기면 같은 길이를 복사할 수 있어요. 이 발상이 2,300년을 이어 온 기술, 작도의 심장이에요.",
          onDone: finish,
        });
      }, 950);
    }, 700);
  });
};

/* ── 11 straws, 빨대 삼각형 도전(삼각형 부등식) ─────────────── */
export const renderStraws: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 빨대 3개: 16(밑) · 7 · 9. 스케일 8px/단위
  const U = 8;
  const BX = 76;
  const BY = 150; // 밑변 시작
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="188" rx="16" fill="url(#st-tb)" stroke="#C8B088" stroke-width="1.8"/>
    <g class="st-tray">
      <rect x="60" y="30" width="132" height="10" rx="5" fill="url(#st-s16)" stroke="#0E7A92" stroke-width="1.3" transform="rotate(4 126 35)"/>
      <rect x="216" y="26" width="58" height="10" rx="5" fill="url(#st-s7)" stroke="#B26200" stroke-width="1.3" transform="rotate(-7 245 31)"/>
      <rect x="238" y="52" width="74" height="10" rx="5" fill="url(#st-s9)" stroke="#8A2F42" stroke-width="1.3" transform="rotate(6 275 57)"/>
      <text x="126" y="24" text-anchor="middle" font-size="11" font-weight="900" fill="#0E7A92">16 cm</text>
      <text x="245" y="16" text-anchor="middle" font-size="11" font-weight="900" fill="#B26200">7 cm</text>
      <text x="278" y="46" text-anchor="middle" font-size="11" font-weight="900" fill="#8A2F42">9 cm</text>
    </g>
    ${SHADOW(180, 168, 96, 0.1)}
    <g class="st-base" style="opacity:0">
      <rect x="${BX}" y="${BY}" width="${16 * U}" height="10" rx="5" fill="url(#st-s16)" stroke="#0E7A92" stroke-width="1.3"/>
    </g>
    <g class="st-l7" style="transform-box: view-box; transform-origin: ${BX + 5}px ${BY + 5}px; transform: rotate(0deg); transition: transform 1.1s cubic-bezier(.34,1.2,.5,1); opacity:0">
      <rect x="${BX}" y="${BY}" width="${7 * U}" height="10" rx="5" fill="url(#st-s7)" stroke="#B26200" stroke-width="1.3"/>
    </g>
    <g class="st-l9" style="transform-box: view-box; transform-origin: ${BX + 16 * U - 5}px ${BY + 5}px; transform: rotate(0deg); transition: transform 1.1s cubic-bezier(.34,1.2,.5,1); opacity:0">
      <rect x="${BX + 16 * U - 9 * U}" y="${BY}" width="${9 * U}" height="10" rx="5" fill="url(#st-s9)" stroke="#8A2F42" stroke-width="1.3"/>
    </g>
    <g class="st-gap" style="opacity:0">
      <circle cx="${BX + 7 * U}" cy="${BY + 5}" r="10" fill="none" stroke="#F04452" stroke-width="2.4" stroke-dasharray="4 4"/>
    </g>
    ${stick(52, 130, 0.9, POSE_STAND, "#243040")}`,
    `<linearGradient id="st-tb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF1DE"/><stop offset=".6" stop-color="#F2E4C8"/><stop offset="1" stop-color="#E2CEA6"/></linearGradient>
    <linearGradient id="st-s16" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD4EC"/><stop offset="1" stop-color="#2FA8C4"/></linearGradient>
    <linearGradient id="st-s7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC46E"/><stop offset="1" stop-color="#F08C00"/></linearGradient>
    <linearGradient id="st-s9" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2789A"/><stop offset="1" stop-color="#D84868"/></linearGradient>`,
  );
  const btn = mkBtn("삼각형 만들기 도전");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "미술 시간, <b>빨대 세 개</b>(16cm, 7cm, 9cm)로 삼각형 뼈대를 만들래요. 셋을 이어 붙이기만 하면 되겠죠? 도전!";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const show = (cls: string): void => {
      const g = fig.querySelector(`.${cls}`) as SVGGElement;
      g.style.opacity = "1";
    };
    show("st-base");
    window.setTimeout(() => {
      show("st-l7");
      show("st-l9");
      (fig.querySelector(".st-l7") as SVGGElement).style.transform = "rotate(-74deg)";
      (fig.querySelector(".st-l9") as SVGGElement).style.transform = "rotate(64deg)";
    }, 500);
    // 일으켜 세우려다... 스르륵 다시 눕는다(7+9=16, 딱 붙음)
    window.setTimeout(() => {
      (fig.querySelector(".st-l7") as SVGGElement).style.transform = "rotate(0deg)";
      (fig.querySelector(".st-l9") as SVGGElement).style.transform = "rotate(0deg)";
      haptic(HAPTIC.wrong);
    }, 1900);
    window.setTimeout(() => {
      const gap = fig.querySelector(".st-gap") as SVGGElement;
      gap.style.transition = "opacity .5s ease";
      gap.style.opacity = "1";
      face("surprised");
      helper.innerHTML = "어라?! 두 빨대를 아무리 세워도 <b>납작하게 누워 버려요.</b> 7과 9의 끝이 밑변 위에서 겨우 만나기만 해요. 왜 삼각형이 안 될까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "7+9=16이라 딱 붙기만 하고 설 수 없어요",
            "각도를 더 잘 조절하면 만들 수 있어요",
            "빨대가 휘어야 삼각형이 돼요",
          ],
          good: "정확해요! 두 변의 합이 밑변과 <b>똑같으면(7+9=16)</b> 일직선으로 딱 붙어 버려요. 세모가 봉긋 서려면 두 변의 합이 더 커야 하죠. 얼마나 커야 할까요? 랩에서 실험해요!",
          bad: "각도의 문제가 아니에요. 7과 9를 어떻게 세워도 <b>합이 16밖에 안 돼서</b> 밑변 위에 납작하게 눕는 게 최선이거든요. 삼각형이 서려면 두 변의 합이 나머지보다 커야 해요, 그 규칙을 랩에서 발견해요!",
          onDone: finish,
        });
      }, 950);
    }, 3050);
  });
};

/* ── 12 bakery, 붕어빵 틀의 비밀(합동) ──────────────────────── */
export const renderBakery: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const fishAt = (x: number, y: number, s = 1, cls = ""): string =>
    `<g class="${cls}" transform="translate(${x} ${y}) scale(${s})">
      ${SHADOW(0, 20, 26, 0.13)}
      <path d="M-26 0 Q-14 -14 4 -13 Q20 -12 27 -2 L20 4 L27 10 Q16 16 2 14 Q-14 13 -26 0z" fill="url(#bk-br)" stroke="#8A5A2E" stroke-width="1.6"/>
      <path d="M-26 0 Q-14 -14 4 -13" stroke="#FFE9C4" stroke-width="2" opacity=".6" fill="none"/>
      <circle cx="-14" cy="-3" r="1.8" fill="#5E3A16"/>
      <path d="M-8 -12 q3 8 0 16 M0 -13 q3 8 0 15 M8 -12 q3 7 0 14" stroke="#A9743E" stroke-width="1.3" fill="none" opacity=".7"/>
    </g>`;
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="188" rx="16" fill="url(#bk-st)" stroke="#7E5A3A" stroke-width="1.8"/>
    <rect x="44" y="26" width="272" height="86" rx="12" fill="url(#bk-pan)" stroke="#4A3828" stroke-width="2"/>
    ${[0, 1, 2].map((i) => `<ellipse cx="${104 + i * 76}" cy="69" rx="34" ry="22" fill="url(#bk-mold)" stroke="#3A2C1E" stroke-width="1.6"/>`).join("")}
    <ellipse cx="70" cy="40" rx="16" ry="6" fill="#fff" opacity=".14"/>
    <g class="bk-lid" style="transform-box: view-box; transform-origin: 180px 26px; transform: rotate(0deg); transition: transform .8s cubic-bezier(.34,1.2,.5,1)">
      <rect x="44" y="10" width="272" height="18" rx="9" fill="url(#bk-lidg)" stroke="#4A3828" stroke-width="1.8"/>
      <rect x="164" y="2" width="32" height="8" rx="4" fill="#6E5438" stroke="#4A3828" stroke-width="1.2"/>
    </g>
    <g class="bk-steam" style="opacity:0">
      <path d="M104 44 q4 -10 -2 -18 M180 44 q4 -10 -2 -18 M256 44 q4 -10 -2 -18" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity=".55" fill="none"/>
    </g>
    <g class="bk-out" style="opacity:0; transform: translateY(-8px); transition: opacity .6s ease, transform .6s cubic-bezier(.34,1.35,.5,1)">
      ${fishAt(104, 152)} ${fishAt(180, 152)} ${fishAt(256, 152)}
    </g>`,
    `<linearGradient id="bk-st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E3226"/><stop offset=".6" stop-color="#31271C"/><stop offset="1" stop-color="#241C12"/></linearGradient>
    <linearGradient id="bk-pan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E5438"/><stop offset="1" stop-color="#4A3624"/></linearGradient>
    <radialGradient id="bk-mold" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#8A6A42"/><stop offset="1" stop-color="#54402A"/></radialGradient>
    <linearGradient id="bk-lidg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A6A46"/><stop offset="1" stop-color="#5E462E"/></linearGradient>
    <linearGradient id="bk-br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C888"/><stop offset=".55" stop-color="#DFA55E"/><stop offset="1" stop-color="#C2854A"/></linearGradient>`,
  );
  const btn = mkBtn("붕어빵 굽기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "겨울 간식의 왕, <b>붕어빵</b> 포장마차예요. 사장님은 하루에 수백 개를 굽는데, 신기하게도 <b>전부 똑같이</b> 생겼어요. 한 판 구워 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const lid = fig.querySelector(".bk-lid") as SVGGElement;
    lid.style.transform = "rotate(-4deg) translateY(6px)";
    const steam = fig.querySelector(".bk-steam") as SVGGElement;
    window.setTimeout(() => {
      steam.style.transition = "opacity .6s ease";
      steam.style.opacity = "1";
    }, 700);
    window.setTimeout(() => {
      lid.style.transform = "rotate(-14deg) translateY(-4px)";
      const out = fig.querySelector(".bk-out") as SVGGElement;
      out.style.opacity = "1";
      out.style.transform = "translateY(0)";
      haptic(HAPTIC.correct);
      face("surprised");
      helper.innerHTML = "짠! 세 마리가 나왔어요. 꼬리 각도, 지느러미 길이, 눈 위치까지 <b>완벽하게 똑같아요.</b> 비결이 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "같은 틀이 모양과 크기를 통째로 복사해요",
            "사장님이 한 마리씩 정성껏 똑같이 빚어요",
            "비슷해 보일 뿐, 자세히 보면 다 달라요",
          ],
          good: "맞아요! <b>같은 틀</b>에서 나온 붕어빵들은 포개면 완전히 겹쳐요. 모양도 크기도 같아서 포개면 딱 맞는 두 도형, 수학은 여기에 특별한 이름과 기호까지 붙였답니다!",
          bad: "사람 손으로는 수백 개를 똑같이 만들 수 없어요. 비결은 <b>틀</b>, 모양과 크기를 통째로 복사하니까요. 이 붕어빵들처럼 포개면 완전히 겹치는 두 도형의 이름을 오늘 배워요!",
          onDone: finish,
        });
      }, 950);
    }, 1500);
  });
};

/* ── 13 thales, 탈레스의 바닷가(합동의 활용 · 보스전) ───────── */
export const renderThales: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 위에서 본 해변: 위쪽 바다(배 A), 해변선, 아래 육지. B(관측점)·C(보조점)·D(육지의 복제점)
  const B = { x: 130, y: 108 };
  const C = { x: 226, y: 108 };
  const A = { x: 176, y: 34 };
  const D = { x: 176, y: 182 };
  fig.innerHTML = wrapSvg(
    `<rect x="28" y="6" width="304" height="102" rx="16" fill="url(#th-sea)"/>
    <rect x="28" y="104" width="304" height="90" rx="16" fill="url(#th-snd)"/>
    <rect x="28" y="6" width="304" height="188" rx="16" fill="none" stroke="#0B3A54" stroke-width="1.8"/>
    <path d="M48 70 q18 -5 36 0 M250 84 q18 -5 36 0 M70 44 q14 -4 28 0" stroke="#EAF6FF" stroke-width="1.4" opacity=".3" stroke-linecap="round" fill="none"/>
    <g>
      ${SHADOW(A.x, A.y + 16, 26, 0.18)}
      <path d="M${A.x - 22} ${A.y + 8} L${A.x + 22} ${A.y + 8} L${A.x + 14} ${A.y + 16} L${A.x - 14} ${A.y + 16} Z" fill="url(#th-hull)" stroke="#6E3F16" stroke-width="1.4"/>
      <rect x="${A.x - 1.5}" y="${A.y - 14}" width="3" height="22" fill="#8A5A2E"/>
      <path d="M${A.x + 1.5} ${A.y - 12} L${A.x + 16} ${A.y - 5} L${A.x + 1.5} ${A.y} Z" fill="url(#th-sail)" stroke="#8A6A2E" stroke-width="1"/>
      <text x="${A.x - 30}" y="${A.y - 6}" font-size="12" font-weight="900" fill="#0A5E8C">배 A</text>
    </g>
    <line x1="28" y1="106" x2="332" y2="106" stroke="#C9995C" stroke-width="2.4"/>
    ${SHADOW(B.x, B.y + 20, 16, 0.16)}
    ${stick(B.x, B.y + 16, 0.72, POSE_POINT, "#243040")}
    <circle cx="${B.x}" cy="${B.y}" r="4" fill="#B26200"/><text x="${B.x - 14}" y="${B.y + 16}" font-size="12" font-weight="900" fill="#7A5800">B</text>
    <circle cx="${C.x}" cy="${C.y}" r="4" fill="#B26200"/><text x="${C.x + 8}" y="${C.y + 16}" font-size="12" font-weight="900" fill="#7A5800">C</text>
    <g class="th-sea-tri" style="opacity:0">
      <path d="M${B.x} ${B.y} L${A.x} ${A.y} M${C.x} ${C.y} L${A.x} ${A.y} M${B.x} ${B.y} L${C.x} ${C.y}" stroke="#0A87A3" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M${B.x + 22} ${B.y} A 22 22 0 0 0 ${B.x + 22 * Math.cos(Math.atan2(B.y - A.y, A.x - B.x))} ${B.y - 22 * Math.sin(Math.atan2(B.y - A.y, A.x - B.x))}" stroke="#E8547E" stroke-width="2.4" fill="none"/>
      <path d="M${C.x - 22} ${C.y} A 22 22 0 0 1 ${C.x + 22 * Math.cos(Math.PI - Math.atan2(C.y - A.y, C.x - A.x))} ${C.y - 22 * Math.sin(Math.PI - Math.atan2(C.y - A.y, C.x - A.x))}" stroke="#12B886" stroke-width="2.4" fill="none"/>
    </g>
    <g class="th-land-tri" style="opacity:0">
      <path d="M${B.x} ${B.y} L${D.x} ${D.y} M${C.x} ${C.y} L${D.x} ${D.y}" stroke="#B26200" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="7 5"/>
      <path d="M${B.x + 22} ${B.y} A 22 22 0 0 1 ${B.x + 22 * Math.cos(-Math.atan2(D.y - B.y, D.x - B.x))} ${B.y + 22 * Math.sin(Math.atan2(D.y - B.y, D.x - B.x))}" stroke="#E8547E" stroke-width="2.4" fill="none"/>
      <circle cx="${D.x}" cy="${D.y}" r="4" fill="#B26200"/>
      <text x="${D.x + 10}" y="${D.y + 2}" font-size="12" font-weight="900" fill="#7A5800">D</text>
      <rect x="${D.x - 68}" y="${(B.y + D.y) / 2 - 8}" width="54" height="20" rx="10" fill="#FFFFFF" stroke="#B26200" stroke-width="1.4"/>
      <text x="${D.x - 41}" y="${(B.y + D.y) / 2 + 6}" text-anchor="middle" font-size="11" font-weight="900" fill="#7A5800">잴 수 있다!</text>
    </g>`,
    `<linearGradient id="th-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5FB4D8"/><stop offset=".6" stop-color="#2E86B4"/><stop offset="1" stop-color="#1A6492"/></linearGradient>
    <linearGradient id="th-snd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2DFBA"/><stop offset="1" stop-color="#DCC08E"/></linearGradient>
    <linearGradient id="th-hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D89A56"/><stop offset="1" stop-color="#A9743E"/></linearGradient>
    <linearGradient id="th-sail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FBF4E2"/><stop offset="1" stop-color="#E8D8B0"/></linearGradient>`,
  );
  const btn = mkBtn("탈레스의 방법 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "2,600년 전 그리스의 해변. 수학자 <b>탈레스</b>에게 미션이 떨어졌어요. \"바다 위 <b>배 A까지의 거리</b>를 재 주시오!\" 줄자도 배도 없이, 해변에서 한 발짝도 나가지 않고요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const sea = fig.querySelector(".th-sea-tri") as SVGGElement;
    sea.style.transition = "opacity .6s ease";
    sea.style.opacity = "1";
    helper.innerHTML = "탈레스는 해변에 두 점 <b>B와 C</b>를 정하고, B에서 배를 보는 각과 C에서 배를 보는 각을 쟀어요.";
    window.setTimeout(() => {
      const land = fig.querySelector(".th-land-tri") as SVGGElement;
      land.style.transition = "opacity .6s ease";
      land.style.opacity = "1";
      face("surprised");
      helper.innerHTML = "그리고 <b>같은 두 각을 육지 쪽으로</b> 그려 만나는 점 D를 찍었죠. 탈레스는 \"BD를 재면 끝!\"이라며 웃었어요. 어떻게 이게 가능할까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "바다의 삼각형과 똑같은 삼각형을 육지에 만든 거예요",
            "D에서 배까지 눈대중으로 어림한 거예요",
            "우연히 비슷한 값이 나오는 요령일 뿐이에요",
          ],
          good: "정확해요! 변 BC는 공통, 그 양 끝 각이 각각 같으니 두 삼각형은 <b>완전히 똑같은 쌍둥이(합동)</b>예요. 그러니 바다의 BA와 육지의 BD도 같은 길이! 이 마지막 무기를 다듬어 보스전을 끝내요!",
          bad: "어림도 우연도 아니에요. <b>한 변(BC)과 그 양 끝 각</b>이 같으면 삼각형은 단 하나로 정해진다는 걸 배웠죠? 그래서 육지 삼각형은 바다 삼각형의 완벽한 쌍둥이고, BD=BA예요. 수학이 곧 줄자였던 거죠!",
          onDone: finish,
        });
      }, 1000);
    }, 1400);
  });
};
